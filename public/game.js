let round = 1;
let pointsA = 0;
let pointsB = 0;
let timer;
let timeLeft = 5;
let playerAAction = null;
let gamePaused = false;

let botSpeed = 0;

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
  botSpeed = 0;

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


// В updateTimer убираем вызов endRound напрямую, потому что там очищается таймер
function updateTimer() {
  document.getElementById('time').innerText = timeLeft;
  timeLeft--;

  if (timeLeft < 0) {
    clearInterval(timer);
    endRound();  // теперь endRound вызывает finishDecisionPhase
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
  const playerBAction = Math.random() < 0.5 ? 'газ' : 'тормоз';
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

// Перепишем chooseAction — теперь просто вызываем finishDecisionPhase
function chooseAction(action) {
  if (playerAAction === null) {
    playerAAction = action;
    clearInterval(timer);
    finishDecisionPhase();
  }
}

// Перепишем endRound так же — вызываем finishDecisionPhase
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
    // Разрешаем машинкам "въехать" друг в друга
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

  document.getElementById('gas').addEventListener('click', function() {
    chooseAction('газ');
    speed += 5;
    // if (!intervalId) {
    //   intervalId = setInterval(moveCar, 100);
    // }
  });

  document.getElementById('brake').addEventListener('click', function() {
    chooseAction('тормоз');
    speed = 0;
  
    // Останавливаем движение машины
    // if (intervalId) {
    //   clearInterval(intervalId);
    //   intervalId = null;
    // }
  });
  

  // document.getElementById('resetButton').addEventListener('click', function() {
  //   clearInterval(intervalId);
  //   intervalId = null;
  //   speed = 0;
  //   // const playerCar = document.getElementById('playerCar');
  //   // if (playerCar) playerCar.style.left = '50px';
  //   resetGame();
  // });

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
});
