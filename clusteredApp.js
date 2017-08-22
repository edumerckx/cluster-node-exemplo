const cluster = require('cluster');
const os = require('os');

if (cluster.isMaster) {
    const cpus = os.cpus().length;
    console.log(`Clustering to ${cpus} CPUs`);
    for (let i = 0; i < cpus; i++) {
        cluster.fork();
    }

    cluster.on('exit', (worker, code) => {
        if (code !== 0 && !worker.suicide) {
            console.log('Worker crashed. Starting a new worker');
            cluster.fork();
        }
    });

    process.on('SIGTERM', () => {
        const workers = Object.keys(cluster.workers);

        const restartWorker = (id) => {
            if (id >= workers.length) return;
            
            const worker = cluster.workers[workers[id]];
            console.log(`Stopping worker: ${worker.process.pid}`);
            
            worker.disconnect();
            
            worker.on('exit', () => {
                if (!worker.suicide) return;
                
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