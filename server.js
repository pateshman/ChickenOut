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
  strategyA TEXT,
  strategyB TEXT,
  result TEXT,
  trust INTEGER,
  pointsA INTEGER DEFAULT 0,
  pointsB INTEGER DEFAULT 0,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);


// Сохранение результата игры
app.post('/api/save', (req, res) => {
  const { playerA, playerB, strategyA, strategyB, trust, pointsA, pointsB, result } = req.body;
  db.run(
    `INSERT INTO rounds (playerA, playerB, strategyA, strategyB, trust, pointsA, pointsB, result) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [playerA, playerB, strategyA, strategyB, trust, pointsA, pointsB, result],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true });
    }
  );
});



// Получение всех игр
app.get('/api/stats', (req, res) => {
  db.all(`SELECT strategyA, strategyB, result, pointsA, pointsB FROM rounds`, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });

    let winsA = 0, winsB = 0, conflictCount = 0, mutualSwerveCount = 0;
    let totalPointsA = 0, totalPointsB = 0, totalRounds = 0;
    let strategiesA = { go: 0, swerve: 0 };
    let strategiesB = { go: 0, swerve: 0 };

    rows.forEach(row => {
      const { strategyA, strategyB, result, pointsA, pointsB } = row;

      if (result === 'Игрок A победил') winsA++;
      else if (result === 'Игрок B победил') winsB++;
      else if (result === 'Столкновение') conflictCount++;
      else if (result === 'Ничья') mutualSwerveCount++;

      if (strategyA === 'go' || strategyA === 'Прямо') strategiesA.go++;
      else if (strategyA === 'swerve' || strategyA === 'Свернуть') strategiesA.swerve++;

      if (strategyB === 'go' || strategyB === 'Прямо') strategiesB.go++;
      else if (strategyB === 'swerve' || strategyB === 'Свернуть') strategiesB.swerve++;

      totalPointsA += pointsA;
      totalPointsB += pointsB;
      totalRounds++;
    });

    res.json({
      winsA,
      winsB,
      conflictCount,
      mutualSwerveCount,
      avgPointsA: totalRounds ? (totalPointsA / totalRounds).toFixed(2) : 0,
      avgPointsB: totalRounds ? (totalPointsB / totalRounds).toFixed(2) : 0,
      strategiesA,
      strategiesB
    });
  });
});

app.listen(PORT, () => console.log(`Сервер запущен: http://localhost:${PORT}`));
