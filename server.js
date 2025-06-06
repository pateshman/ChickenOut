// server.js
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');
const app = express();
const PORT = 3000;

// БД
const db = new sqlite3.Database('./data/game.db');

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Создание таблицы, если не существует
db.run(`
  CREATE TABLE IF NOT EXISTS rounds (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    playerA TEXT,
    playerB TEXT,
    trust INTEGER,
    result TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Сохранение результата игры
app.post('/api/save', (req, res) => {
  const { playerA, playerB, trust, result } = req.body;
  db.run(
    `INSERT INTO rounds (playerA, playerB, trust, result) VALUES (?, ?, ?, ?)`,
    [playerA, playerB, trust, result],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true });
    }
  );
});

// Получение всех игр
app.get('/api/stats', (req, res) => {
  db.all(`SELECT * FROM rounds ORDER BY timestamp DESC LIMIT 100`, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.listen(PORT, () => console.log(`Сервер запущен: http://localhost:${PORT}`));
