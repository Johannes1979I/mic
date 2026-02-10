/* navigation.js — Section Tabs & Navigation */

const SECTIONS = ['setup', 'data', 'results', 'pdf', 'archive'];

function showSection(id) {
  SECTIONS.forEach(s => {
    const el = document.getElementById('section-' + s);
    if (el) el.classList.toggle('hidden', s !== id);
  });
  document.querySelectorAll('.section-tab').forEach((tab, i) => {
    tab.classList.toggle('active', SECTIONS[i] === id);
  });
  window.scrollTo({ top: 0, behavior: 'smooth' });

  if (id === 'archive') renderArchive();
}

function proceedToData() {
  if (!state.preset) { alert('Seleziona un tipo di campione.'); return; }
  const org = document.getElementById('cfg-organism').value;
  if (!org) { alert('Seleziona un microrganismo isolato.'); return; }
  if (org === '__custom__') {
    const c = document.getElementById('cfg-organism-custom').value.trim();
    if (!c) { alert('Inserisci il nome del microrganismo.'); return; }
    state.organism = c;
  } else {
    state.organism = org;
  }
  state.colonyCount = document.getElementById('cfg-colony-count').value;
  renderDataTable();
  showSection('data');
}

function proceedToResults() {
  // Collect values from table
  state.antibiotics.forEach(ab => {
    const micEl = document.getElementById('mic-' + ab.id);
    const sirEl = document.getElementById('sir-' + ab.id);
    if (micEl) ab.mic = micEl.value;
    if (sirEl) ab.sir = sirEl.value;
  });

  const filled = state.antibiotics.filter(a => a.sir);
  if (filled.length === 0) { alert('Inserire almeno un risultato S/I/R.'); return; }

  renderResultsSummary();
  renderResistanceChart();
  showSection('results');
}
