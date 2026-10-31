const path = require('path');
const http = require('http');
const express = require('express');
const { Server } = require('socket.io');
const notes = require('./lib/notes');

const PORT = process.env.PORT || 3000;

const app = express();
const server = http.createServer(app);
const io = new Server(server, { maxHttpBufferSize: 5e6 });

app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));

// Today's note lives in memory and is written to disk shortly after each change.
let today = notes.dateId();
let text = notes.read(today) || '';
let saveTimer = null;

function save() {
  clearTimeout(saveTimer);
  const date = today, html = text;
  saveTimer = setTimeout(() => {
    if (!notes.isEmpty(html) || notes.read(date) !== null) notes.write(date, html);
  }, 500);
}

// At midnight the pad starts over. Yesterday's note is already on disk.
function checkRollover() {
  const now = notes.dateId();
  if (now === today) return;
  clearTimeout(saveTimer);
  if (!notes.isEmpty(text)) notes.write(today, text);
  console.log(`new day: ${today} -> ${now}`);
  today = now;
  text = notes.read(today) || '';
  io.emit('newText', { data: text });
}
setInterval(checkRollover, 30 * 1000);

app.get('/', (req, res) => {
  res.render('index', { title: 'notepad' });
});

app.get('/archive', (req, res) => {
  const days = notes.list()
    .filter((d) => d !== today)
    .map((d) => {
      const html = notes.read(d) || '';
      const preview = html.replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
      return { date: d, preview: preview.slice(0, 140) };
    })
    .filter((d) => d.preview);
  res.render('archive', { days, today });
});

app.get('/archive/:date', (req, res, next) => {
  const { date } = req.params;
  if (!notes.DATE_RE.test(date)) return next();
  const html = date === today ? text : notes.read(date);
  if (html === null) return next();
  res.render('day', { date, html: notes.clean(html), isToday: date === today });
});

app.use((req, res) => {
  res.status(404).render('error', { message: 'Not found' });
});

io.on('connection', (socket) => {
  checkRollover();
  socket.emit('init', { data: text });

  socket.on('textUpdate', (obj) => {
    if (!obj || typeof obj.data !== 'string') return;
    checkRollover();
    text = notes.clean(obj.data);
    save();
    socket.broadcast.emit('newText', { data: text });
  });
});

server.listen(PORT, () => console.log(`notepad listening on http://localhost:${PORT}`));
