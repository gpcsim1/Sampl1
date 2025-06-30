const http = require('http');
const fs = require('fs');
const path = require('path');

const port = process.env.PORT || 8080;

http.createServer((req, res) => {
  let filePath = '.' + (req.url === '/' ? '/index.html' : req.url);
  const ext = path.extname(filePath);
  const map = {
    '.js': 'application/javascript',
    '.css': 'text/css',
    '.html': 'text/html'
  };
  const contentType = map[ext] || 'application/octet-stream';
  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(404);
      res.end('Not found');
    } else {
      res.writeHead(200, {'Content-Type': contentType});
      res.end(content);
    }
  });
}).listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
