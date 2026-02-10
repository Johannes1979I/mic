/* charts.js — Resistance Chart (screen + PDF export) */

let resistanceChart = null;

function renderResistanceChart() {
  const filled = state.antibiotics.filter(a => a.sir);
  const sCount = filled.filter(a => a.sir === 'S').length;
  const iCount = filled.filter(a => a.sir === 'I').length;
  const rCount = filled.filter(a => a.sir === 'R').length;

  const canvas = document.getElementById('resistanceChart');
  if (!canvas || typeof Chart === 'undefined') return;

  if (resistanceChart) resistanceChart.destroy();

  resistanceChart = new Chart(canvas, {
    type: 'doughnut',
    data: {
      labels: ['Sensibile (S)', 'Intermedio (I)', 'Resistente (R)'],
      datasets: [{
        data: [sCount, iCount, rCount],
        backgroundColor: ['#27ae60', '#f39c12', '#e74c3c'],
        borderWidth: 2,
        borderColor: '#fff',
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: { position: 'bottom', labels: { padding: 16, font: { size: 13, family: 'DM Sans' } } },
        title: {
          display: true,
          text: `Profilo di Resistenza — ${state.organism}`,
          font: { size: 15, family: 'Source Serif 4', weight: '600' },
          padding: { bottom: 12 }
        }
      }
    }
  });
}

function renderBarChart() {
  const filled = state.antibiotics.filter(a => a.sir);
  const canvas = document.getElementById('barChart');
  if (!canvas || typeof Chart === 'undefined' || filled.length === 0) return;

  if (window._barChart) window._barChart.destroy();

  const labels = filled.map(a => a.id.startsWith('CUS_') ? a.name.substring(0,8) : a.id);
  const colors = filled.map(a => a.sir === 'S' ? '#27ae60' : a.sir === 'I' ? '#f39c12' : '#e74c3c');

  window._barChart = new Chart(canvas, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Risultato ABG',
        data: filled.map(a => a.sir === 'S' ? 3 : a.sir === 'I' ? 2 : 1),
        backgroundColor: colors,
        borderRadius: 4,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      indexAxis: 'y',
      scales: {
        x: { display: false, max: 3.5 },
        y: { ticks: { font: { size: 11, family: 'DM Sans' } } }
      },
      plugins: {
        legend: { display: false },
        title: {
          display: true,
          text: 'Sensibilità per Antibiotico',
          font: { size: 14, family: 'Source Serif 4', weight: '600' }
        },
        tooltip: {
          callbacks: {
            label: ctx => {
              const ab = filled[ctx.dataIndex];
              return `${ab.name}: ${ab.sir}${ab.mic ? ' (MIC '+ab.mic+' µg/mL)' : ''}`;
            }
          }
        }
      }
    }
  });
}

/* Export chart as image for PDF */
function renderChartToImage(type) {
  return new Promise(resolve => {
    const filled = state.antibiotics.filter(a => a.sir);
    const sCount = filled.filter(a => a.sir === 'S').length;
    const iCount = filled.filter(a => a.sir === 'I').length;
    const rCount = filled.filter(a => a.sir === 'R').length;

    const canvas = document.getElementById('pdfChartCanvas');
    canvas.width = 440; canvas.height = 440;
    const ctx = canvas.getContext('2d');

    const chart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Sensibile (S)', 'Intermedio (I)', 'Resistente (R)'],
        datasets: [{ data: [sCount, iCount, rCount], backgroundColor: ['#27ae60', '#f39c12', '#e74c3c'], borderWidth: 2, borderColor: '#fff' }]
      },
      options: {
        responsive: false,
        animation: false,
        plugins: {
          legend: { position: 'bottom', labels: { padding: 14, font: { size: 12 } } },
          title: { display: true, text: `Profilo di Resistenza`, font: { size: 14, weight: '600' }, padding: { bottom: 8 } }
        }
      }
    });

    setTimeout(() => {
      const img = canvas.toDataURL('image/png', 1.0);
      chart.destroy();
      resolve(img);
    }, 300);
  });
}
