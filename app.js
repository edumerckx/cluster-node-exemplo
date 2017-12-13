const http = require('http');
const pid = process.pid;

let usersCount;

process.on('message', msg => {
    console.log(`usersCount: ${msg.usersCount}`);
    usersCount = msg.usersCount;
})

http.createServer((req, res) => {
    for (let i = 1e7; i > 0; i--) {}
    res.write(`Hello from ${pid}\n`);
    res.end(`Users: ${usersCount}`);
}).listen(9999, () => {
    console.log(`Started ${pid}**`);
})