const http = require('http');
const fs = require('fs');
const path = require('path');
const { WebSocketServer } = require('ws');

const KEY = process.env.TRADER_KEY || 'change-me'; // tumcha secret password
const PORT = process.env.PORT || 3000;

// Server fakt drawings + symbol + timeframe sambhalto. Strategy/indicators kadhich yet nahit.
let state = { symbol: 'BTCUSDT', interval: '5m', drawings: [] };

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  fs.createReadStream(path.join(__dirname, 'public', 'index.html')).pipe(res);
});

const wss = new WebSocketServer({ server });

wss.on('connection', (ws, req) => {
  const isTrader = new URL(req.url, 'http://x').searchParams.get('key') === KEY;
  ws.send(JSON.stringify(state));
  ws.on('message', (msg) => {
    if (!isTrader) return; // viewers kahi pathvu shakat nahit
    try { state = JSON.parse(msg); } catch { return; }
    wss.clients.forEach((c) => {
      if (c !== ws && c.readyState === 1) c.send(JSON.stringify(state));
    });
  });
});

server.listen(PORT, () => {
  console.log(`Viewer : http://localhost:${PORT}`);
  console.log(`Trader : http://localhost:${PORT}/?key=${KEY}`);
});
