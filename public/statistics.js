async function fetchAndRenderStats() {
    try {
      const response = await fetch('/api/stats');
      const stats = await response.json();
  
      console.log('Статистика с сервера:', stats);
  
      // === Круговая диаграмма стратегий ===
      const strategyLabels = ['A: Прямо', 'A: Свернуть', 'B: Прямо', 'B: Свернуть'];
      const strategyData = [
        stats.strategyCounts.A_straight,
        stats.strategyCounts.A_turn,
        stats.strategyCounts.B_straight,
        stats.strategyCounts.B_turn
      ];
  
      new Chart(document.getElementById('strategyChart'), {
        type: 'pie',
        data: {
          labels: strategyLabels,
          datasets: [{
            data: strategyData,
            backgroundColor: [
              'rgba(255, 99, 132, 0.7)',
              'rgba(255, 159, 64, 0.7)',
              'rgba(54, 162, 235, 0.7)',
              'rgba(153, 102, 255, 0.7)'
            ]
          }]
        },
        options: {
          responsive: true,
          plugins: {
            title: { display: true, text: 'Частота выбора стратегий' }
          }
        }
      });
  
      // === Столбчатая диаграмма исходов ===
      const outcomeLabels = ['Катастрофа', 'Победа A', 'Победа B', 'Обе уступили'];
      const outcomeData = [
        stats.outcomes.catastrophe,
        stats.outcomes.A_win,
        stats.outcomes.B_win,
        stats.outcomes.both_turn
      ];
  
      new Chart(document.getElementById('outcomeChart'), {
        type: 'bar',
        data: {
          labels: outcomeLabels,
          datasets: [{
            label: 'Количество',
            data: outcomeData,
            backgroundColor: 'rgba(75, 192, 192, 0.7)'
          }]
        },
        options: {
          responsive: true,
          scales: {
            y: { beginAtZero: true }
          },
          plugins: {
            title: { display: true, text: 'Распределение исходов игр' }
          }
        }
      });
  
      // === Диаграмма средних очков ===
      new Chart(document.getElementById('averagePointsChart'), {
        type: 'bar',
        data: {
          labels: ['Player A', 'Player B'],
          datasets: [{
            label: 'Средний выигрыш',
            data: [stats.avgPointsA.toFixed(2), stats.avgPointsB.toFixed(2)],
            backgroundColor: ['rgba(255, 99, 132, 0.7)', 'rgba(54, 162, 235, 0.7)']
          }]
        },
        options: {
          responsive: true,
          scales: {
            y: { beginAtZero: true }
          },
          plugins: {
            title: { display: true, text: 'Средний выигрыш игроков' }
          }
        }
      });
  
    } catch (error) {
      console.error('Ошибка загрузки статистики:', error);
      alert('Не удалось загрузить статистику');
    }
  }
  
  window.onload = fetchAndRenderStats;
  