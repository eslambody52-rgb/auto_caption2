const http = require('http');

const server = http.createServer((req, res) => {
    if (req.url === '/api/2.5/validate' && req.method === 'POST') {
        require('./api/2.5/validate')(req, res);
    } else if (req.url === '/api/2.5/ping' && req.method === 'POST') {
        require('./api/2.5/ping')(req, res);
    } else {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'Auto Caption V2.5 Server is running!' }));
    }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
