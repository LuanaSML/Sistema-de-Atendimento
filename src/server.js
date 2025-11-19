const express = require('express');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

// os tipos das senhas 
const TYPES = {
  PRIORITARIA: { code: 'P', label: 'PRIORITÁRIA' },
  EXAMES: { code: 'E', label: 'EXAMES' },
  GERAL: { code: 'G', label: 'GERAL' }
};

// a memória da porra servidor 
let counters = {}; 
let queues = {
  P: [],
  E: [],
  G: []
};
let currentCalled = null;

function todayKey() {
  const d = new Date();
  return d.toISOString().slice(0,10).replace(/-/g,''); // YYYYMMDD
}

function nextCounterFor(typeCode) {
  const date = todayKey();
  if (!counters[date]) counters[date] = { P:0, E:0, G:0 };
  counters[date][typeCode] = (counters[date][typeCode] || 0) + 1;
  return counters[date][typeCode];
}

function makeTicket(typeCode) {
  const date = todayKey();
  const count = nextCounterFor(typeCode);
  const number = String(count).padStart(3,'0');
  const label = `${date}-${typeCode}${number}`; // e.g. 20251119-P001
  return { id: `${date}-${typeCode}${number}`, label, type: typeCode };
}

app.post('/api/take', (req, res) => {
  const { type } = req.body;
  if (!type) return res.status(400).json({ error: 'type is required (PRIORITARIA|EXAMES|GERAL)' });
  const mapping = {
    PRIORITARIA: 'P',
    EXAMES: 'E',
    GERAL: 'G'
  };
  const t = mapping[type];
  if (!t) return res.status(400).json({ error: 'invalid type' });
  const ticket = makeTicket(t);
  queues[t].push(ticket);
  io.emit('queue-updated', getQueueCounts());
  return res.json({ ticket });
});

app.post('/api/next', (req, res) => {
  // atendente chama o próximo
  // logica de prigoridade: P (prioritária) primeiro, depois E, depois G
  const order = ['P','E','G'];
  let next = null;
  for (const t of order) {
    if (queues[t].length > 0) {
      next = queues[t].shift();
      break;
    }
  }
  currentCalled = next;
  io.emit('called', { ticket: next });
  io.emit('queue-updated', getQueueCounts());
  return res.json({ ticket: next });
});

app.get('/api/current', (req, res) => {
  res.json({ ticket: currentCalled });
});

app.get('/api/queue', (req, res) => {
  res.json(getQueueCounts());
});

function getQueueCounts() {
  return {
    P: queues.P.length,
    E: queues.E.length,
    G: queues.G.length
  };
}

io.on('connection', (socket) => {
  // manda o estado do começo
  socket.emit('queue-updated', getQueueCounts());
  socket.emit('called', { ticket: currentCalled });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
