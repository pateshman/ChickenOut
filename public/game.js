let round = 1;
let pointsA = 0;
let pointsB = 0;
let timer;
let timeLeft = 5;
let playerAAction = null;
let gamePaused = false; // Флаг для отслеживания состояния игры

let speed = 0; // Начальная скорость
let intervalId; // ID интервала для анимации

// Функция для начала игры
function startGame() {
  resetGame();
  // round = 1; // Сбросить номер раунда
  // startRound(); // Запустить первый раунд
}

function startRound() {
  if (gamePaused) return; // Если игра приостановлена, не начинаем новый раунд

  timeLeft = 5;               // Ставим стартовое значение времени
  playerAAction = null;

  document.getElementById('time').innerText = timeLeft;  // Показываем 5 сразу
  document.getElementById('result').innerText = '';
  document.getElementById('continueButton').style.display = 'none'; // Скрываем кнопку "Продолжить"

  clearInterval(timer);        // Очищаем старый таймер
  timer = setInterval(updateTimer, 1000); // Запускаем новый таймер с интервалом 1 секунда
}

// Функция для обновления таймера
function updateTimer() {
  document.getElementById('time').innerText = timeLeft; // Сначала показываем текущее значение
  console.log('Time', {timeLeft}); // Для отладки

  timeLeft--; // Потом уменьшаем

  if (timeLeft < 0) {
      clearInterval(timer);
      endRound();
  }
}


function chooseAction(action) {
    if (playerAAction === null) { // Проверяем, не сделал ли игрок A выбор ранее
      playerAAction = action; // Сохраняем выбор игрока A
      clearInterval(timer);
      
      let playerBAction = Math.random() < 0.5 ? 'газ' : 'тормоз'; // Пример случайного выбора для игрока B
      let comment = '';
    
      if (playerAAction === 'газ' && playerBAction === 'газ') {
          comment = 'Столкновение';
          pointsA -= 20;
          pointsB -= 20;
      } else if (playerAAction === 'газ' && playerBAction === 'тормоз') {
          comment = 'Игрок A победил';
          pointsA += 40; // Игрок A выигрывает
          pointsB -= 10;
      } else if (playerAAction === 'тормоз' && playerBAction === 'газ') {
          comment = 'Игрок B победил';
          pointsA -= 10;
          pointsB += 40; // Игрок B выигрывает  > 
      } else {
          comment = 'Ничья';
          pointsA += 20;
          pointsB += 20;
      }

      updateScores();
      addToHistory(round, playerAAction, playerBAction, pointsA, pointsB, comment);
      round++;
      document.getElementById('round').innerText = round;
      
      // Запуск нового раунда через 1 секунду
      setTimeout(startRound, 1000);
  }
}

function endRound() {
  // Если время истекло и игрок A не сделал выбор, считаем, что он выбрал "тормоз"
  if (playerAAction === null) {
      playerAAction = 'газ'; // Автоматически выбираем "газ"
  }

  let playerBAction = Math.random() < 0.5 ? 'газ' : 'тормоз'; // Случайный выбор для игрока B
  let comment = '';

  if (playerAAction === 'газ' && playerBAction === 'газ') {
    comment = 'Столкновение';
    pointsA -= 20;
    pointsB -= 20;
  } else if (playerAAction === 'газ' && playerBAction === 'тормоз') {
    comment = 'Игрок A победил';
    pointsA += 40; // Игрок A выигрывает
    pointsB -= 10;
  } else if (playerAAction === 'тормоз' && playerBAction === 'газ') {
    comment = 'Игрок B победил';
    pointsA -= 10;
    pointsB += 40; // Игрок B выигрывает
  } else {
    comment = 'Ничья';
    pointsA += 20;
    pointsB += 20;
  }

  updateScores();
  addToHistory(round, playerAAction, playerBAction, pointsA, pointsB, comment);
  round++;
  document.getElementById('round').innerText = round;

  // Запуск нового раунда через 1 секунду
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
  timeLeft = 0; // Устанавливаем время на 0
  document.getElementById('time').innerText = timeLeft; // Обновляем отображение времени
  gamePaused = true; // Приостанавливаем игру

  toggleButtonVisibility(true);

  alert('Игра остановлена! Нажмите "Продолжить", чтобы возобновить игру.');
}

function continueGame() {
  console.log("Кнопка 'Продолжить' нажата"); // Для отладки
  if (gamePaused) { // Проверяем, приостановлена ли игра
      gamePaused = false; // Снимаем флаг приостановки игры
      startRound(); // Запускаем таймер (предполагается, что у вас есть функция для этого)

      toggleButtonVisibility(false);
    }
}

function resetGame() {
  clearInterval(timer); // Очищаем таймер
  pointsA = 0; // Сбрасываем очки игрока A
  pointsB = 0; // Сбрасываем очки игрока B
  round = 1; // Сбрасываем раунд
  gamePaused = false; // Убираем флаг приостановки игры

  updateScores(); // Обновляем отображение очков
  document.getElementById('round').innerText = round; // Обновляем отображение раунда
  document.getElementById('history-body').innerHTML = ''; // Очищаем историю

  // Скрываем кнопку "Продолжить" и показываем кнопку "Остановить игру"
  toggleButtonVisibility(false);

  startRound(); // Запускаем первый раунд
}

function moveCar() {
  if (speed > 0) {
      const currentPosition = parseInt(playerCar.style.left) || 0;

      if (currentPosition + speed <= 600 - 50) {
          playerCar.style.left = currentPosition + speed + 'px';
      } else {
          playerCar.style.left = '550px';
          speed = 0;
      }
  }
}

document.getElementById('startButton').addEventListener('click', function() {
  const playerCar = document.getElementById('playerCar');
  const computerCar = document.getElementById('computerCar');
  
  // Получаем выбранный цвет
  const color = document.getElementById('color').value;
  
  // Устанавливаем цвет машинки игрока
  playerCar.style.backgroundColor = color;


  moveCar()
});

// Кнопка "Газ"
document.getElementById('gas').addEventListener('click', function() {
  speed += 5; // Увеличиваем скорость
  if (!intervalId) {
      intervalId = setInterval(moveCar, 100); // Запускаем движение
  }
});

// Кнопка "Тормоз"
document.getElementById('brake').addEventListener('click', function() {
  speed = Math.max(0, speed - 5); // Уменьшаем скорость, не ниже нуля
});

// Кнопка "Сбросить"
document.getElementById('resetButton').addEventListener('click', function() {
  clearInterval(intervalId); // Останавливаем движение
  intervalId = null; // Сбрасываем ID интервала
  speed = 0; // Сбрасываем скорость
  playerCar.style.left = '0'; // Возвращаем машину на стартовую позицию
});



// Уберите дублирующиеся DOMContentLoaded и объедините их в один блок
document.addEventListener('DOMContentLoaded', function() {
  // Инициализация игры
  // resetGame(); // Используйте resetGame() вместо startRound(), чтобы корректно начать игру
  document.getElementById('startButton').addEventListener('click', startGame);

  // Обработчики кнопок
  document.getElementById('continueButton').addEventListener('click', continueGame);
  document.getElementById('resetButton').addEventListener('click', resetGame);

  // Обработчики для кнопок "Газ" и "Тормоз"
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

  // Обработчики для анимации машины
  document.getElementById('start').addEventListener('click', function() {
    const playerCar = document.getElementById('playerCar');
    const color = document.getElementById('color').value;
    playerCar.style.backgroundColor = color;
  });

  // document.getElementById('gas').addEventListener('click', function() {
  //   speed += 5;
  //   if (!intervalId) {
  //     intervalId = setInterval(moveCar, 100);
  //   }
  // });


  document.getElementById('resetButton').addEventListener('click', function() {
    clearInterval(intervalId);
    intervalId = null;
    speed = 0;
    const playerCar = document.getElementById('playerCar');
    if (playerCar) playerCar.style.left = '0';
  });

});

