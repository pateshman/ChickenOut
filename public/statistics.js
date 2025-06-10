async function fetchGameData() {
    try {
      const response = await fetch('/api/stats');
      if (!response.ok) throw new Error('Ошибка загрузки данных');
      const data = await response.json();
  
      data.reverse();
  
      const roundsLabels = data.map((item, i) => `Раунд ${i + 1}`);
      const pointsA = data.map(item => item.result === 'A' ? item.trust : 0);
      const pointsB = data.map(item => item.result === 'B' ? item.trust : 0);
  
      const wins = data.filter(item => item.result === 'A').length;
      const losses = data.filter(item => item.result === 'B').length;
      const draws = data.filter(item => item.result === 'draw').length;
  
      new Chart(document.getElementById('pointsChart').getContext('2d'), {
        type: 'bar',
        data: {
          labels: roundsLabels,
          datasets: [
            {
              label: 'Очки Player A',
              data: pointsA,
              backgroundColor: 'rgba(255, 99, 132, 0.7)'
            },
            {
              label: 'Очки Player B',
              data: pointsB,
              backgroundColor: 'rgba(54, 162, 235, 0.7)'
            }
          ]
        },
        options: {
          responsive: true,
          scales: { y: { beginAtZero: true } }
        }
      });
  
      new Chart(document.getElementById('winLossChart').getContext('2d'), {
        type: 'pie',
        data: {
          labels: ['Выигрыши A', 'Выигрыши B', 'Ничьи'],
          datasets: [{
            data: [wins, losses, draws],
            backgroundColor: [
              'rgba(255, 99, 132, 0.7)',
              'rgba(54, 162, 235, 0.7)',
              'rgba(201, 203, 207, 0.7)'
            ]
          }]
        }
      });
  
      new Chart(document.getElementById('scoreOverRoundsChart').getContext('2d'), {
        type: 'line',
        data: {
          labels: roundsLabels,
          datasets: [
            {
              label: 'Player A',
              data: pointsA,
              fill: false,
              borderColor: 'rgba(255, 99, 132, 1)',
              tension: 0.1
            },
            {
              label: 'Player B',
              data: pointsB,
              fill: false,
              borderColor: 'rgba(54, 162, 235, 1)',
              tension: 0.1
            }
          ]
        },
        options: {
          responsive: true,
          scales: { y: { beginAtZero: true } }
        }
      });
  
    } catch (error) {
      console.error('Ошибка при загрузке статистики:', error);
      alert('Не удалось загрузить статистику.');
    }
  }
  
  window.onload = fetchGameData;
  