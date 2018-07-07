const http = require('http');
const fs = require('fs');
const parseUrl = require('url').parse;
const stack = [];

stack.use = function(prefix, fn) {
  this.push({prefix, fn});
  return this;
};

function sendFile(res, file, contentType) {
  res.writeHead(200, {'Content-Type': contentType});
  fs.createReadStream(file).pipe(res);
}

stack.use('/', function (req, res, next) {
  sendFile(res, './index.html', 'text/html');
});

stack.use('/netop.js', function (req, res) {
  sendFile(res, '../dist/umd.js', 'application/json;charset=utf8');
});

stack.use('/user', function (req, res) {
  res.end(JSON.stringify({
    username: '巴拉巴拉',
    id: Date.now(),
    method: req.method
  }))
});

http.createServer(function (req, res) {
  const {pathname} = parseUrl(req.url);
  const find = ({prefix}) => prefix === pathname;
  const layer = stack.find(find);

  if (!layer) {
    res.end('Oops!');
    return;
  }

  try {
    layer.fn(req, res);
  } catch (e) {
    res.end(e.stack || e.message || e);
  }
}).listen(8080);
