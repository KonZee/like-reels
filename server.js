const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8080;

const mime = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
};

function serveFile(res, filePath) {
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end('Not found');
      return;
    }
    const ext = path.extname(filePath);
    res.writeHead(200, { 'Content-Type': mime[ext] || 'application/octet-stream' });
    res.end(data);
  });
}

const server = http.createServer((req, res) => {
  if (req.url === '/' || req.url === '/index.html') {
    serveFile(res, path.join(__dirname, 'index.html'));
    return;
  }

  const filePath = path.join(__dirname, req.url);
  if (filePath.startsWith(__dirname)) {
    serveFile(res, filePath);
    return;
  }

  res.writeHead(403);
  res.end('Forbidden');
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`http://localhost:${PORT}`);
});
