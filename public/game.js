let round = 1;
let pointsA = 0;
let pointsB = 0;
let timer;
let timeLeft = 5;
let playerAAction = null;
let gamePaused = false;

let speed = 0;
let intervalId = null;

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

  updateScores();
  document.getElementById('round').innerText = round;
  document.getElementById('history-body').innerHTML = '';
  toggleButtonVisibility(false);

  startRound();
}

// Старт раунда и запуск таймера + анимации
function startRound() {
  if (gamePaused) return;

  timeLeft = 5;
  playerAAction = null;

  document.getElementById('time').innerText = timeLeft;
  document.getElementById('continueButton').style.display = 'none';

  clearInterval(timer);
  timer = setInterval(updateTimer, 1000);

  // Сбрасываем позицию машинки
  const playerCar = document.getElementById('playerCar');
  playerCar.style.left = '0px';

  // Устанавливаем стартовую скорость (например 5)
  speed = 5;

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

function chooseAction(action) {
  if (playerAAction === null) {
    playerAAction = action;
    clearInterval(timer);

    let playerBAction = Math.random() < 0.5 ? 'газ' : 'тормоз';
    let comment = '';

    if (playerAAction === 'газ' && playerBAction === 'газ') {
      comment = 'Столкновение';
      pointsA -= 20;
      pointsB -= 20;
    } else if (playerAAction === 'газ' && playerBAction === 'тормоз') {
      comment = 'Игрок A победил';
      pointsA += 40;
      pointsB -= 10;
    } else if (playerAAction === 'тормоз' && playerBAction === 'газ') {
      comment = 'Игрок B победил';
      pointsA -= 10;
      pointsB += 40;
    } else {
      comment = 'Ничья';
      pointsA += 20;
      pointsB += 20;
    }

    updateScores();
    addToHistory(round, playerAAction, playerBAction, pointsA, pointsB, comment);

    round++;
    document.getElementById('round').innerText = round;

    setTimeout(startRound, 1000);
  }
}

function endRound() {
  if (playerAAction === null) {
    playerAAction = 'газ'; // Автоматический выбор
  }

  let playerBAction = Math.random() < 0.5 ? 'газ' : 'тормоз';
  let comment = '';

  if (playerAAction === 'газ' && playerBAction === 'газ') {
    comment = 'Столкновение';
    pointsA -= 20;
    pointsB -= 20;
  } else if (playerAAction === 'газ' && playerBAction === 'тормоз') {
    comment = 'Игрок A победил';
    pointsA += 40;
    pointsB -= 10;
  } else if (playerAAction === 'тормоз' && playerBAction === 'газ') {
    comment = 'Игрок B победил';
    pointsA -= 10;
    pointsB += 40;
  } else {
    comment = 'Ничья';
    pointsA += 20;
    pointsB += 20;
  }

  updateScores();
  addToHistory(round, playerAAction, playerBAction, pointsA, pointsB, comment);

  round++;
  document.getElementById('round').innerText = round;

  setTimeout(startRound, 1000);
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
  if (!playerCar) return;

  const currentPosition = parseInt(playerCar.style.left) || 0;

  if (speed > 0 && currentPosition + speed <= 550) {
    playerCar.style.left = (currentPosition + speed) + 'px';
  } else {
    playerCar.style.left = '550px';
    speed = 0;

    // Можно остановить анимацию после достижения конца
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
  }
}


document.addEventListener('DOMContentLoaded', function() {
  document.getElementById('startGameButton').addEventListener('click', startGame);

  document.getElementById('applyColorButton').addEventListener('click', function() {
    const playerCar = document.getElementById('playerCar');
    const color = document.getElementById('color').value;
    playerCar.style.backgroundColor = color;
  });

  document.getElementById('gas').addEventListener('click', function() {
    chooseAction('газ');
    speed += 5;
    if (!intervalId) {
      intervalId = setInterval(moveCar, 100);
    }
  });

  document.getElementById('brake').addEventListener('click', function() {
    chooseAction('тормоз');
    speed = 0;
  });

  document.getElementById('resetButton').addEventListener('click', function() {
    clearInterval(intervalId);
    intervalId = null;
    speed = 0;
    const playerCar = document.getElementById('playerCar');
    if (playerCar) playerCar.style.left = '0px';
    resetGame();
  });

  document.getElementById('continueButton').addEventListener('click', continueGame);
});
