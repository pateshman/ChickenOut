let round = 1;
let pointsA = 0;
let pointsB = 0;
let timer;
let timeLeft = 5;
let playerAAction = null;
let gamePaused = false;
let B_belief = Math.floor(Math.random() * 41) + 30; // доверие от 30 до 70 в начале
let botPersonality = 'riskSeeking'; // по умолчанию рискофил
let recentCrashes = 0;  // память о недавних авариях (на 5 последних раундов)
const crashMemoryLength = 5;
let actionHistory = []; // хранит последние ходы A
const historyLimit = 20;


let botSpeed = 0;
let speed = 0;

let intervalId = null;

let personalityShift = 0;

if (botPersonality === 'riskAverse') {
  personalityShift = -0.4;
} else if (botPersonality === 'riskSeeking') {
  personalityShift = 0.4;
} else {
  personalityShift = 0;
}

// Добавим динамику по очкам
if (pointsB < pointsA) {
  personalityShift += 0.3; // немного больше риска, чтобы пытаться наверстать
} else if (pointsB > pointsA) {
  personalityShift -= 0.2; // меньше риска, чтобы сохранить преимущество
}

// Запуск игры
function startGame() {
  resetGame();
}

// Сброс игры и старт первого раунда
function resetGame() {
  clearInterval(timer);
  clearInterval(intervalId);
  intervalId = null;

  pointsA = 0;
  pointsB = 0;
  round = 1;
  gamePaused = false;
  speed = 0;
  botSpeed = 0;

  B_belief = Math.floor(Math.random() * 41) + 30; // новое значение доверия 30–70

  updateScores();
  document.getElementById('round').innerText = round;
  document.getElementById('history-body').innerHTML = '';
  toggleButtonVisibility(false);

  startRound();
}

// Старт раунда и запуск таймера + анимации
function startRound() {
  if (gamePaused) return;

  document.getElementById('round').innerText = round;

  document.getElementById('gas').disabled = false;
  document.getElementById('brake').disabled = false;

  timeLeft = 5;
  playerAAction = null;

  document.getElementById('time').innerText = timeLeft;
  document.getElementById('continueButton').style.display = 'none';

  clearInterval(timer);
  timer = setInterval(updateTimer, 1000);

  // Сбросить позиции машинок
  const playerCar = document.getElementById('playerCar');
  const botCar = document.getElementById('botCar');
  playerCar.style.left = '50px';
  botCar.style.left = '550px';


  speed = 4
  botSpeed = 4; // по умолчанию — едет

  // Если анимация уже запущена, очищаем интервал, чтобы перезапустить с нуля
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }

  // Запускаем анимацию заново
  intervalId = setInterval(moveCar, 100);
}

function updateTimer() {
  document.getElementById('time').innerText = timeLeft;
  timeLeft--;

  if (timeLeft < 0) {
    clearInterval(timer);
    endRound();
  }
}

function finishDecisionPhase() {
  // Блокируем кнопки, чтобы нельзя было менять выбор
  document.getElementById('gas').disabled = true;
  document.getElementById('brake').disabled = true;

  // Если игрок не выбрал — автoвыбираем "газ"
  if (playerAAction === null) {
    playerAAction = 'газ';
  }

  // Выбор бота
  const playerBAction = calculateBotAction();
  botSpeed = (playerBAction === 'газ') ? 5 : 0;

  if (playerBAction === 'газ') {
    botSpeed += 5;
  } else {
    botSpeed = 0;
  }

  if (botSpeed > 0 || speed > 0) {
    if (!intervalId) {
      intervalId = setInterval(moveCar, 100);
    }
  }

  let comment = '';
  let aKey, bKey;

  if (playerAAction === 'газ' && playerBAction === 'газ') {
    comment = 'Столкновение';
    aKey = 'ggA';
    bKey = 'ggB';
  } else if (playerAAction === 'газ' && playerBAction === 'тормоз') {
    comment = 'Игрок A победил';
    aKey = 'gbA';
    bKey = 'gbB';
  } else if (playerAAction === 'тормоз' && playerBAction === 'газ') {
    comment = 'Игрок B победил';
    aKey = 'bgA';
    bKey = 'bgB';
  } else {
    comment = 'Ничья';
    aKey = 'bbA';
    bKey = 'bbB';
  }

  const valA = parseInt(document.getElementById(aKey).value, 10);
  const valB = parseInt(document.getElementById(bKey).value, 10);

  pointsA += valA;
  pointsB += valB;

  // Корректировка доверия после каждого раунда
  if (playerAAction === 'тормоз' && playerBAction === 'тормоз') {
    B_belief += 10;
  }
  if (playerAAction === 'тормоз' && playerBAction === 'газ') {
    B_belief += 15;
  }
  if (playerAAction === 'газ' && playerBAction === 'тормоз') {
    B_belief -= 15;
  }
  if (playerAAction === 'газ' && playerBAction === 'газ') {
    B_belief -= 25;
  }

  // Ограничиваем доверие в пределах 0–100
  B_belief = Math.max(0, Math.min(100, B_belief));

  // Отправляем результат раунда на сервер
  // Получаем значения матрицы из интерфейса
  const matrix = {
    AA: parseInt(document.getElementById('ggA').value, 10),
    AB: parseInt(document.getElementById('gbA').value, 10),
    BA: parseInt(document.getElementById('bgA').value, 10),
    BB: parseInt(document.getElementById('bbA').value, 10)
  };

  // Отправляем на сервер все нужные данные
  fetch('http://localhost:3000/api/save', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      playerA: 'PlayerA',
      playerB: 'Bot',
      strategyA: playerAAction,
      strategyB: playerBAction,
      trust: B_belief,
      pointsA: pointsA,
      pointsB: pointsB,
      result: comment,
      matrix: matrix,
      botPersonality: botPersonality
    })
  })
  .then(res => res.json())
  .then(data => {
    if (!data.success) {
      console.error('Ошибка при сохранении результата:', data.error);
    }
  })
  .catch(err => {
    console.error('Ошибка сети при сохранении результата:', err);
  });


  updateScores();
  addToHistory(round, playerAAction, playerBAction, pointsA, pointsB, comment);
  updateCrashMemory(comment);

  function updateCrashMemory(result) {
    if (result === 'Столкновение') {
      recentCrashes++;
    } else {
      recentCrashes = Math.max(0, recentCrashes - 1);
    }
  
    // ограничим память (чтобы не раздувалась бесконечно)
    if (recentCrashes > crashMemoryLength) {
      recentCrashes = crashMemoryLength;
    }
  }
  
  round++;
    
  // Ждём 3 секунды, чтобы анимация продолжалась
  setTimeout(() => {
  // Останавливаем анимацию после паузы
  if (intervalId) {
    clearInterval(intervalId);
      intervalId = null;
    }
    startRound();
  }, 3000);
}

function updateBelief() {
  const gasCount = actionHistory.filter(action => action === 'газ').length;
  const gasFrequency = gasCount / actionHistory.length;

  const targetBelief = (1 - gasFrequency) * 100;
  B_belief = B_belief * 0.8 + targetBelief * 0.2;
  B_belief = Math.max(0, Math.min(100, B_belief));
}

function chooseAction(action) {
  if (playerAAction !== null) return;

  playerAAction = action;

  // Добавляем выбор в историю
  actionHistory.push(action);
  if (actionHistory.length > historyLimit) {
    actionHistory.shift();
  }

  // Обновляем доверие
  updateBelief();

  clearInterval(timer);
  finishDecisionPhase();
}

function endRound() {
  clearInterval(timer);
  finishDecisionPhase();
}


function updateScores() {
  document.getElementById('pointsA').innerText = pointsA;
  document.getElementById('pointsB').innerText = pointsB;
}

function addToHistory(roundNum, actionA, actionB, scoreA, scoreB, comment) {
  const historyBody = document.getElementById('history-body');
  const row = document.createElement('tr');
  row.innerHTML = `<td>${roundNum}</td><td>${actionA}</td><td>${actionB}</td><td>${scoreA}</td><td>${scoreB}</td><td>${comment}</td>`;
  historyBody.insertBefore(row, historyBody.firstChild);
}

function toggleButtonVisibility(continueVisible) {
  document.getElementById('continueButton').style.display = continueVisible ? 'block' : 'none';
  document.querySelector('button[onclick="stopGame()"]').style.display = continueVisible ? 'none' : 'block';
}

function stopGame() {
  clearInterval(timer);
  gamePaused = true;
  toggleButtonVisibility(true);

  // Остановить анимацию машинки
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }

  alert('Игра остановлена! Нажмите "Продолжить", чтобы возобновить игру.');
}


function continueGame() {
  if (gamePaused) {
    gamePaused = false;
    startRound();
    toggleButtonVisibility(false);
  }
}

// Анимация машинки
function moveCar() {
  const playerCar = document.getElementById('playerCar');
  const botCar = document.getElementById('botCar');

  let playerPos = parseInt(playerCar.style.left) || 50;
  let botPos = parseInt(botCar.style.left) || 550;

  const carWidth = 50;

  // Проверяем расстояние между машинами
  const distance = botPos - playerPos - carWidth;

  if (distance <= 0) {
    playerPos += speed;
    botPos -= botSpeed;
    playerCar.style.left = playerPos + 'px';
    botCar.style.left = botPos + 'px';

    // Останавливаем движение
    speed = 0;
    botSpeed = 0;
  
    clearInterval(intervalId);
    intervalId = null;
  }
  
  // Движение игрока
  if (speed > 0 && playerPos + speed < botPos - carWidth) {
    playerPos += speed;
    playerCar.style.left = playerPos + 'px';
  }

  // Движение бота
  if (botSpeed > 0 && botPos - botSpeed > playerPos + carWidth) {
    botPos -= botSpeed;
    botCar.style.left = botPos + 'px';
  }

  // Остановка, если никто больше не едет
  if (speed === 0 && botSpeed === 0 && intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
}

// ГИБРИДНАЯ ЛОГИКА БОТА:
function calculateNashEquilibrium(matrix) {
  const numeratorB = matrix.bbA - matrix.bgA;
  const denominatorB = matrix.ggA - matrix.gbA - matrix.bgA + matrix.bbA;
  let q = (denominatorB === 0) ? (numeratorB >= 0 ? 1 : 0) : numeratorB / denominatorB;
  q = Math.min(1, Math.max(0, q));
  return q;
}

function calculateBotAction() {
  const matrix = {
    ggA: parseInt(document.getElementById('ggA').value, 10),
    ggB: parseInt(document.getElementById('ggB').value, 10),
    gbA: parseInt(document.getElementById('gbA').value, 10),
    gbB: parseInt(document.getElementById('gbB').value, 10),
    bgA: parseInt(document.getElementById('bgA').value, 10),
    bgB: parseInt(document.getElementById('bgB').value, 10),
    bbA: parseInt(document.getElementById('bbA').value, 10),
    bbB: parseInt(document.getElementById('bbB').value, 10),
  };

  // Расчёт равновесия Нэша
  const nashProb = calculateNashEquilibrium(matrix);

  // Добавляем фиксированный сдвиг в сторону агрессии или осторожности
  let personalitySign = 0;
  if (botPersonality === 'riskAverse') personalitySign = -1;
  else if (botPersonality === 'riskSeeking') personalitySign = 1;

  // Динамический сдвиг по очкам
  // Если бот проигрывает, он начинает догонять за счёт большего риска
  if (pointsB < pointsA) personalityShift += 0.3;
  else if (pointsB > pointsA) personalityShift -= 0.2;

  // Фактор доверия
  // Чем ниже доверие — тем осторожнее бот
  const trustShift = (B_belief - 50) / 50;

  // Частота газа игрока
  const recentGasFrequency = calculateRecentGasFrequency(actionHistory, 5);

  // Итоговая сумма факторов 
  const rawDesire = 
      1.0 * (nashProb * 2 - 1)
    + 0.8 * trustShift
    + 0.7 * personalitySign
    + (-0.3) * recentCrashes
    + (botPersonality === 'riskAverse'
         ? -0.5 * recentGasFrequency // Чем чаще игрок газует, тем более осторожным будет бот
         : 1.5 * recentGasFrequency); // Чем чаще игрок газует, тем более злее будет бот
     
  // Сигмоида — мягкое вероятностное решение 
  const finalProb = sigmoid(rawDesire);

  return (Math.random() < finalProb) ? 'газ' : 'тормоз';
}

function calculateRecentGasFrequency(history, windowSize = 5) {
  const recent = history.slice(-windowSize);
  const gasCount = recent.filter(action => action === 'газ').length;
  return recent.length > 0 ? gasCount / recent.length : 0.5;
}

function sigmoid(x) {
  return 1 / (1 + Math.exp(-x));
}

// Заполняем значениями матрицу выигрыша
function fillPayoffMatrix() {
  const options = [];
  for (let i = -50; i <= 50; i += 10) {
    options.push(`<option value="${i}">${i}</option>`);
  }

  const defaultValues = {
    ggA: -20, ggB: -20,
    gbA: 40, gbB: -10,
    bgA: -10, bgB: 40,
    bbA: 20, bbB: 20
  };

  for (const id in defaultValues) {
    const select = document.getElementById(id);
    select.innerHTML = options.join('');
    select.value = defaultValues[id];
  }
}

document.addEventListener('DOMContentLoaded', function() {
  document.getElementById('startGameButton').addEventListener('click', startGame);

  const applyColorPlayerButton = document.getElementById('applyColorPlayerButton');
  if (applyColorPlayerButton) {
    applyColorPlayerButton.addEventListener('click', function() {
      const playerCar = document.getElementById('playerCar');
      const color = document.getElementById('colorPlayer').value;
      // Меняем цвет всех прямоугольников машинки игрока
      [...playerCar.querySelectorAll('rect')].forEach(rect => rect.setAttribute('fill', color));
    });
  }

  // Изменение цвета машинки бота
  const applyColorBotButton = document.getElementById('applyColorBotButton');
  if (applyColorBotButton) {
    applyColorBotButton.addEventListener('click', function() {
      const botCar = document.getElementById('botCar');
      const color = document.getElementById('colorBot').value;
      // Меняем цвет всех прямоугольников машинки бота
      [...botCar.querySelectorAll('rect')].forEach(rect => rect.setAttribute('fill', color));
    });
  }

  document.getElementById('botPersonality').addEventListener('change', function() {
    botPersonality = this.value;
  });  

  document.getElementById('gas').addEventListener('click', function() {
    chooseAction('газ');
    speed += 5;
  });

  document.getElementById('brake').addEventListener('click', function() {
    chooseAction('тормоз');
    speed = 0;
  });
  
  const showMatrixButton = document.getElementById('showMatrixButton');
      const payoffMatrix = document.getElementById('payoffMatrix');
      
      showMatrixButton.addEventListener('click', function() {
        if (payoffMatrix.style.display === 'none') {
          payoffMatrix.style.display = 'block';
          showMatrixButton.textContent = 'Скрыть матрицу выигрышей';
        } else {
          payoffMatrix.style.display = 'none';
          showMatrixButton.textContent = 'Показать матрицу выигрышей';
        }
      });

  document.getElementById('continueButton').addEventListener('click', continueGame);

  fillPayoffMatrix();
});
