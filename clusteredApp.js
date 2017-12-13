const cluster = require('cluster');
const os = require('os');

const numberOfUsersInDB = () => {
    this.count = this.count || 3;
    this.count = this.count * Math.round(Math.random() * 5) + 1;
    return this.count;
}

if (cluster.isMaster) {
    const cpus = os.cpus().length;
    
    console.log(`Clustering to ${cpus} CPUs`);
    
    for (let i = 0; i < cpus; i++) {
        cluster.fork();
    }

    cluster.on('exit', (worker, code) => {
        if (code !== 0 && !worker.exitedAfterDisconnect) {
            console.log('Worker crashed. Starting a new worker');
            cluster.fork();
        }
    });

    const updateWorkers = () => {
        const usersCount = numberOfUsersInDB();
        Object.values(cluster.workers).forEach(worker => {
            worker.send({ usersCount });
        });
    };
      
    updateWorkers();
    setInterval(updateWorkers, 10000);

    process.on('SIGTERM', () => {
        const workers = Object.keys(cluster.workers);

        const restartWorker = (id) => {
            if (id >= workers.length) return;
            
            const worker = cluster.workers[workers[id]];
            console.log(`Stopping worker: ${worker.process.pid}`);
            
            worker.disconnect();
            
            worker.on('exit', () => {
                if (!worker.exitedAfterDisconnect) return;
                
                const newWorker = cluster.fork();
                newWorker.on('listening', () => {
                    restartWorker(id + 1);
                });
            });
        }
    })

} else {
    require('./app');
}