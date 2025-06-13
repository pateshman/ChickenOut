async function loadData() {
    const response = await fetch('/statistics');
    const data = await response.json();
  
    renderStrategyChart(data.strategyDistribution);
    renderGameTypeChart(data.gameTypes);
  }
  
  function renderStrategyChart(distribution) {
    const ctx = document.getElementById('strategyChart').getContext('2d');
    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: Object.keys(distribution),
        datasets: [{
          label: 'Количество',
          data: Object.values(distribution),
          backgroundColor: ['#36a2eb', '#ff6384', '#ffcd56', '#4caf50']
        }]
      }
    });
  }
  
  function renderGameTypeChart(gameTypes) {
    const ctx = document.getElementById('gameTypeChart').getContext('2d');
    new Chart(ctx, {
      type: 'pie',
      data: {
        labels: Object.keys(gameTypes),
        datasets: [{
          data: Object.values(gameTypes),
          backgroundColor: ['#4caf50', '#f44336', '#2196f3', '#ff9800', '#9e9e9e']
        }]
      }
    });
  }

  async function loadAvgPointsByTrust() {
  const response = await fetch('/api/avg-points-by-trust');
  const data = await response.json();

  const labels = data.map(d => d.trustRange);
  const avgA = data.map(d => d.avgA);
  const avgB = data.map(d => d.avgB);

  const ctx = document.getElementById('avgPointsByTrustChart').getContext('2d');
  new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Player A',
          data: avgA,
          borderColor: '#36a2eb',
          fill: false,
          tension: 0.1
        },
        {
          label: 'Player B',
          data: avgB,
          borderColor: '#ff6384',
          fill: false,
          tension: 0.1
        }
      ]
    },
    options: {
      scales: {
        y: {
          beginAtZero: true,
          title: { display: true, text: 'Средние очки' }
        },
        x: {
          title: { display: true, text: 'Доверие (группы по 10)' }
        }
      }
    }
  });
}

async function loadAvgPointsByTrust() {
    const response = await fetch('/api/avg-points-by-trust');
    const data = await response.json();
  
    const labels = data.map(d => d.trustRange);
    const avgA = data.map(d => d.avgA);
    const avgB = data.map(d => d.avgB);
  
    const ctx = document.getElementById('avgPointsByTrustChart').getContext('2d');
    new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Player A',
            data: avgA,
            borderColor: '#36a2eb',
            fill: false,
            tension: 0.1
          },
          {
            label: 'Player B',
            data: avgB,
            borderColor: '#ff6384',
            fill: false,
            tension: 0.1
          }
        ]
      },
      options: {
        scales: {
          y: {
            beginAtZero: true,
            title: { display: true, text: 'Средние очки' }
          },
          x: {
            title: { display: true, text: 'Доверие (группы по 10)' }
          }
        }
      }
    });
  }
  
  async function loadBotStats() {
    const response = await fetch('/api/stats-by-bot');
    const data = await response.json();
  
    const labels = Object.keys(data);
    const goCounts = labels.map(bot => data[bot].strategyCount['газ']);
    const swerveCounts = labels.map(bot => data[bot].strategyCount['тормоз']);


    const ctx = document.getElementById('botStrategyChart').getContext('2d');
    new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'Газ',
            data: goCounts,
            backgroundColor: '#36a2eb'
          },
          {
            label: 'Тормоз',
            data: swerveCounts,
            backgroundColor: '#ff6384'
          }
        ]
      },
      options: {
        responsive: true,
      }
    });
  }
  
  
  // Первичная загрузка
loadData();
  // Автообновление каждые 5 секунд
setInterval(loadData, 5000);
loadAvgPointsByTrust();
loadBotStats();
setInterval(() => {
  loadData();
  loadAvgPointsByTrust();
  loadBotStats();
}, 5000);
