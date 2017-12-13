const http = require('http');
const pid = process.pid;

process.on('message', msg => {
    console.log(`Message from MASTER: ${msg}.`)
})

http.createServer((req, res) => {
    for (let i = 1e7; i > 0; i--) {}
    res.end(`Hello from ${pid}\n`);
}).listen(9999, () => {
    console.log(`Started ${pid}**`);
})