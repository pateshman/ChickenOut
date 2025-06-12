const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');
const classifyGameType = require('./classifyGame');

const app = express();
const PORT = 3000;

// Создаём БД (если не существует)
const db = new sqlite3.Database('./data/game.db');

// Создаём таблицу rounds
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
    type TEXT, 
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    botPersonality TEXT
  )
`);

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Сохраняем результат игры
app.post('/api/save', (req, res) => {
  const { playerA, playerB, strategyA, strategyB, trust, pointsA, pointsB, result, matrix, botPersonality } = req.body;

  if (!matrix) {
    return res.status(400).json({ error: 'Matrix is missing in request' });
  }

  const { AA, AB, BA, BB } = matrix;
  const gameType = classifyGameType(AA, AB, BA, BB);

  db.run(
    `INSERT INTO rounds (playerA, playerB, strategyA, strategyB, trust, pointsA, pointsB, result, type, botPersonality) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [playerA, playerB, strategyA, strategyB, trust, pointsA, pointsB, result, gameType, botPersonality],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true, type: gameType });
    }
  );
});



// Основная API статистика (основная статистика для игры)
app.get('/api/stats', (req, res) => {
  db.all(`SELECT strategyA, strategyB, result, pointsA, pointsB, type, trust FROM rounds`, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });

    let winsA = 0, winsB = 0, conflictCount = 0, mutualSwerveCount = 0;
    let totalPointsA = 0, totalPointsB = 0, totalRounds = 0;
    let strategiesA = { go: 0, swerve: 0 };
    let strategiesB = { go: 0, swerve: 0 };
    let typeCount = {};
    let trustAndPoints = [];

    rows.forEach(row => {
      const { strategyA, strategyB, result, pointsA, pointsB, type, trust } = row;

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

      typeCount[type] = (typeCount[type] || 0) + 1;

      trustAndPoints.push({ trust, pointsA, pointsB });
    });

    res.json({
      winsA,
      winsB,
      conflictCount,
      mutualSwerveCount,
      avgPointsA: totalRounds ? (totalPointsA / totalRounds).toFixed(2) : 0,
      avgPointsB: totalRounds ? (totalPointsB / totalRounds).toFixed(2) : 0,
      strategiesA,
      strategiesB,
      typeCount,
      trustAndPoints
    });
  });
});


app.get('/statistics', (req, res) => {
  db.all('SELECT * FROM rounds', (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Ошибка получения статистики' });
    }

    const strategyDistribution = {
      'Оба газ': 0,
      'A газ, B тормоз': 0,
      'A тормоз, B газ': 0,
      'Оба тормоз': 0
    };

    const gameTypes = {};
    
    results.forEach(row => {
      let key = '';

      if (row.strategyA === 'газ' && row.strategyB === 'газ') {
        key = 'Оба газ';
      } else if (row.strategyA === 'газ' && row.strategyB === 'тормоз') {
        key = 'A газ, B тормоз';
      } else if (row.strategyA === 'тормоз' && row.strategyB === 'газ') {
        key = 'A тормоз, B газ';
      } else if (row.strategyA === 'тормоз' && row.strategyB === 'тормоз') {
        key = 'Оба тормоз';
      }

      if (key) strategyDistribution[key]++;

      if (!gameTypes[row.result]) {
        gameTypes[row.result] = 0;
      }
      gameTypes[row.result]++;
    });

    res.json({
      strategyDistribution,
      gameTypes
    });
  });
});

app.get('/api/avg-points-by-trust', (req, res) => {
  db.all('SELECT trust, pointsA, pointsB FROM rounds', (err, rows) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Ошибка получения данных' });
    }

    const bins = Array.from({ length: 10 }, () => ({ count: 0, sumA: 0, sumB: 0 }));

    rows.forEach(row => {
      const trust = row.trust;
      const binIndex = Math.min(Math.floor(trust / 10), 9); // чтобы не выходить за 0-9

      bins[binIndex].count++;
      bins[binIndex].sumA += row.pointsA;
      bins[binIndex].sumB += row.pointsB;
    });

    const result = bins.map((bin, index) => ({
      trustRange: `${index * 10}-${index * 10 + 10}`,
      avgA: bin.count ? (bin.sumA / bin.count).toFixed(2) : 0,
      avgB: bin.count ? (bin.sumB / bin.count).toFixed(2) : 0
    }));

    res.json(result);
  });
});

app.get('/api/stats-by-bot', (req, res) => {
  db.all(`SELECT botPersonality, strategyA, strategyB, trust, pointsA, pointsB, result, type FROM rounds`, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });

    const stats = {};

    rows.forEach(row => {
      const bot = row.botPersonality || 'unknown';

      if (!stats[bot]) {
        stats[bot] = {
          strategyCount: {'газ': 0, 'тормоз': 0 },
          totalTrust: 0,
          totalPointsA: 0,
          totalPointsB: 0,
          count: 0,
          results: {},
          types: {}
        };
      }

      // Считаем стратегии бота
      if (row.strategyB === 'газ') stats[bot].strategyCount['газ']++;
      else if (row.strategyB === 'тормоз') stats[bot].strategyCount['тормоз']++;

      stats[bot].totalTrust += row.trust;
      stats[bot].totalPointsA += row.pointsA;
      stats[bot].totalPointsB += row.pointsB;
      stats[bot].count++;

      stats[bot].results[row.result] = (stats[bot].results[row.result] || 0) + 1;
      stats[bot].types[row.type] = (stats[bot].types[row.type] || 0) + 1;
    });

    // Подсчёт средних доверия и очков
    Object.values(stats).forEach(botStats => {
      botStats.avgTrust = botStats.count ? (botStats.totalTrust / botStats.count).toFixed(2) : 0;
      botStats.avgPointsA = botStats.count ? (botStats.totalPointsA / botStats.count).toFixed(2) : 0;
      botStats.avgPointsB = botStats.count ? (botStats.totalPointsB / botStats.count).toFixed(2) : 0;
    });

    res.json(stats);
  });
});


// Запуск сервера
app.listen(PORT, () => console.log(`Сервер запущен: http://localhost:${PORT}`));
