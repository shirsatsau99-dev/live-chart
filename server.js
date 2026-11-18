const http = require('http');
const fs = require('fs');
const path = require('path');

const KEY = process.env.TRADER_KEY || 'change-me'; // tumcha secret password
const PORT = process.env.PORT || 3000;

// Server fakt drawings + symbol + timeframe sambhalto. Strategy/indicators kadhich yet nahit.
let state = { symbol: 'BTCUSDT', interval: '5m', drawings: [], v: 0 };

const server = http.createServer((req, res) => {
  const u = new URL(req.url, 'http://x');

  if (u.pathname === '/state' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' });
    return res.end(JSON.stringify(state));
  }

  if (u.pathname === '/state' && req.method === 'POST') {
    if (u.searchParams.get('key') !== KEY) { res.writeHead(403); return res.end('forbidden'); }
    let body = '';
    req.on('data', (c) => { body += c; if (body.length > 1e6) req.destroy(); });
    req.on('end', () => {
      try {
        const s = JSON.parse(body);
        state = { symbol: s.symbol, interval: s.interval, drawings: s.drawings || [], v: state.v + 1 };
        res.writeHead(200); res.end('ok');
      } catch { res.writeHead(400); res.end('bad'); }
    });
    return;
  }

  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  fs.createReadStream(path.join(__dirname, 'public', 'index.html')).pipe(res);
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Viewer : http://localhost:${PORT}`);
  console.log(`Trader : http://localhost:${PORT}/?key=${KEY}`);
});
