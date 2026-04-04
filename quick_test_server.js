const http = require('http');
const url = require('url');

const PORT = 3002;

let messages = []; // in-memory store

function sendJSON(res, status, obj) {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(obj));
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => body += chunk.toString());
    req.on('end', () => {
      try {
        const parsed = body ? JSON.parse(body) : {};
        resolve(parsed);
      } catch (e) {
        resolve({});
      }
    });
    req.on('error', reject);
  });
}

const server = http.createServer(async (req, res) => {
  const parsed = url.parse(req.url, true);
  const path = parsed.pathname;
  const method = req.method;
  const headers = req.headers;
  const current = headers['x-user-id'];
  if (!current) return sendJSON(res, 401, { error: 'Missing x-user-id header' });

  if (method === 'POST' && path === '/messages') {
    const body = await parseBody(req);
    const to = body.to;
    if (!to) return sendJSON(res, 400, { error: 'Missing to field' });
    let messageContent = null;
    if (body.text) messageContent = { type: 'text', text: body.text };
    else return sendJSON(res, 400, { error: 'Missing message content' });
    const msg = { id: messages.length + 1, from: current, to, messageContent, createdAt: new Date().toISOString() };
    messages.push(msg);
    return sendJSON(res, 201, msg);
  }

  if (method === 'GET' && path === '/messages') {
    // latest per other user
    // find messages where from==current or to==current
    const relevant = messages.filter(m => m.from === current || m.to === current);
    const map = new Map();
    // iterate from newest to oldest
    for (let i = relevant.length -1; i >=0; i--) {
      const m = relevant[i];
      const other = m.from === current ? m.to : m.from;
      map.set(other, m);
    }
    const result = Array.from(map.entries()).map(([user, msg]) => ({ user, msg }));
    return sendJSON(res, 200, result);
  }

  // GET /messages/:userId
  if (method === 'GET' && path.startsWith('/messages/')) {
    const other = path.split('/')[2];
    const convo = messages.filter(m => (m.from === current && m.to === other) || (m.from === other && m.to === current));
    return sendJSON(res, 200, convo);
  }

  sendJSON(res, 404, { error: 'Not found' });
});

server.listen(PORT, () => console.log('Quick test server listening on', PORT));
