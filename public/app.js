document.addEventListener('DOMContentLoaded', () => {
  const chartCanvas = document.getElementById('indexChart');
  const buttons = document.querySelectorAll('.symbol-btn');
  const loader = document.getElementById('loader');

  let currentChart = null;

  // --- 1) Function to fetch data and update chart ---
  const loadChartData = async (symbol) => {
    console.log(`Requesting data for ${symbol}...`);

    loader.classList.remove('hidden');
    chartCanvas.style.display = 'none';

    buttons.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.symbol === symbol);
    });

    try {

      const response = await fetch(`/api/data?symbol=${symbol}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch data');
      }

      const data = await response.json();

      renderChart(data);

    } catch (error) {
      console.error('Error:', error);
      alert(`Error loading data: ${error.message}`);
    } finally {

      loader.classList.add('hidden');
      chartCanvas.style.display = 'block';
    }
  };

  // === 2. Function to render the chart ===
  const renderChart = (data) => {

    if (currentChart) {
      currentChart.destroy();
    }

    const ctx = chartCanvas.getContext('2d');
    currentChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: data.labels, // X-axis (dates)
        datasets: [{
          label: `30-Day Closing Price (${data.symbol})`,
          data: data.values, // Y-axis (prices)
          borderColor: '#007aff',
          backgroundColor: 'rgba(0, 122, 255, 0.1)',
          borderWidth: 2,
          fill: true,
          tension: 0.1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        scales: {
          y: {
            beginAtZero: false,
            ticks: {
              // Format as currency
              callback: (value) => `$${value.toFixed(2)}`
            }
          },
          x: {
            ticks: {
              maxRotation: 90,
              minRotation: 45,
              maxTicksLimit: 10 
            }
          }
        },
        plugins: {
          tooltip: {
            callbacks: {
              label: (context) => `Price: $${context.parsed.y.toFixed(2)}`
            }
          }
        }
      }
    });
  };

  //--- 3) add event listeners to buttons ---
  buttons.forEach(button => {
    button.addEventListener('click', () => {
      const symbol = button.dataset.symbol;
      loadChartData(symbol);
    });
  });

  //--- 4) Initial load ---
  loadChartData('SPY');
});