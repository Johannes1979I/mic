/* config.js — Configuration, Organism & Antibiotic Management */

function onOrganismChange() {
  const sel = document.getElementById('cfg-organism');
  const customRow = document.getElementById('custom-organism-row');
  if (sel.value === '__custom__') {
    customRow.classList.remove('hidden');
    document.getElementById('cfg-organism-custom').focus();
  } else {
    customRow.classList.add('hidden');
    state.organism = sel.value;
    updateBreakpointsForOrganism();
  }
}

function applyCustomOrganism() {
  const v = document.getElementById('cfg-organism-custom').value.trim();
  if (v) {
    state.organism = v;
    document.getElementById('custom-organism-row').classList.add('hidden');
    updateBreakpointsForOrganism();
  }
}

/* Update breakpoints when organism changes */
function updateBreakpointsForOrganism() {
  state.antibiotics.forEach(ab => {
    if (ab.id.startsWith('CUS_')) return;
    const bp = getBreakpoints(ab.id, state.organism);
    ab.bpS = bp.bpS;
    ab.bpR = bp.bpR;
  });
}

/* ── Colony Count — Scientific Notation ── */
function updateColonyCount() {
  const raw = document.getElementById('cfg-colony-count').value.trim();
  state.colonyCount = raw;

  // Try to parse and show scientific notation
  const display = document.getElementById('colony-sci-display');
  if (!display) return;

  const num = parseColonyNumber(raw);
  if (num !== null && num >= 1000) {
    state.colonyCountExp = toScientificNotation(num);
    display.innerHTML = '<span class="sci-notation">' + toScientificHTML(num) + ' UFC/mL</span>';
    display.classList.remove('hidden');
  } else if (raw) {
    state.colonyCountExp = raw;
    display.innerHTML = '';
    display.classList.add('hidden');
  } else {
    state.colonyCountExp = '';
    display.innerHTML = '';
    display.classList.add('hidden');
  }
}

function parseColonyNumber(raw) {
  if (!raw) return null;
  // Handle ">100000", "100.000", "1e5", "10^5" etc.
  let clean = raw.replace(/[><=~\s]/g, '').replace(/\./g, '').replace(/,/g, '');
  // Handle "10^5" notation
  const powMatch = clean.match(/^(\d+)\^(\d+)$/);
  if (powMatch) return Math.pow(parseInt(powMatch[1]), parseInt(powMatch[2]));
  // Handle "1e5" notation
  const eMatch = clean.match(/^(\d+(?:\.\d+)?)e(\d+)$/i);
  if (eMatch) return parseFloat(eMatch[1]) * Math.pow(10, parseInt(eMatch[2]));
  // Plain number
  const num = parseInt(clean);
  return isNaN(num) ? null : num;
}

function toScientificNotation(num) {
  if (num === 0) return '0';
  const exp = Math.floor(Math.log10(Math.abs(num)));
  const coeff = num / Math.pow(10, exp);
  const coeffRound = Math.round(coeff * 10) / 10;
  if (coeffRound === 1) return '10^' + exp;
  return coeffRound + ' x 10^' + exp;
}

function toScientificHTML(num) {
  if (num === 0) return '0';
  const exp = Math.floor(Math.log10(Math.abs(num)));
  const coeff = num / Math.pow(10, exp);
  const coeffRound = Math.round(coeff * 10) / 10;
  if (coeffRound === 1) return '10<sup>' + exp + '</sup>';
  return coeffRound + ' &times; 10<sup>' + exp + '</sup>';
}

/* For PDF (plain text) */
function toScientificPlain(num) {
  if (num === 0) return '0';
  const exp = Math.floor(Math.log10(Math.abs(num)));
  const coeff = num / Math.pow(10, exp);
  const coeffRound = Math.round(coeff * 10) / 10;
  if (coeffRound === 1) return '10^' + exp;
  return coeffRound + ' x 10^' + exp;
}

function getColonyDisplay() {
  const raw = state.colonyCount;
  if (!raw) return '';
  const prefix = raw.match(/^([><=~]+)/) ? raw.match(/^([><=~]+)/)[1] : '';
  const num = parseColonyNumber(raw);
  if (num !== null && num >= 1000) {
    return (prefix ? prefix + ' ' : '') + toScientificPlain(num) + ' UFC/mL';
  }
  return raw;
}

/* ── Add / Remove Antibiotics ── */
function showAddAntibioticModal() {
  const modal = document.getElementById('add-ab-modal');
  modal.classList.remove('hidden');
  renderAvailableAntibiotics();
}

function hideAddAntibioticModal() {
  document.getElementById('add-ab-modal').classList.add('hidden');
}

function renderAvailableAntibiotics() {
  const search = (document.getElementById('ab-search')?.value || '').toLowerCase();
  const currentIds = new Set(state.antibiotics.map(a => a.id));
  const container = document.getElementById('ab-available-list');

  const available = Object.entries(ANTIBIOTICS_DB)
    .filter(([code]) => !currentIds.has(code))
    .filter(([code, ab]) => !search || ab.name.toLowerCase().includes(search) || ab.class.toLowerCase().includes(search) || ab.brand.toLowerCase().includes(search) || code.toLowerCase().includes(search));

  if (available.length === 0) {
    container.innerHTML = '<div class="db-empty" style="padding:20px"><div>Nessun antibiotico disponibile da aggiungere</div></div>';
    return;
  }

  const grouped = {};
  available.forEach(([code, ab]) => {
    if (!grouped[ab.class]) grouped[ab.class] = [];
    grouped[ab.class].push({ code, ...ab });
  });

  container.innerHTML = Object.entries(grouped).map(([cls, abs]) => `
    <div class="ab-group">
      <div class="ab-group-title">${cls}</div>
      ${abs.map(ab => `
        <div class="ab-add-item" onclick="addAntibiotic('${ab.code}')">
          <span class="ab-add-name">${ab.name}</span>
          <span class="ab-add-brand">${ab.brand}</span>
          <span class="ab-add-btn">+ Aggiungi</span>
        </div>
      `).join('')}
    </div>
  `).join('');
}

function addAntibiotic(code) {
  if (state.antibiotics.find(a => a.id === code)) return;
  const ab = ANTIBIOTICS_DB[code];
  if (!ab) return;
  const bp = getBreakpoints(code, state.organism);
  state.antibiotics.push({ id: code, name: ab.name, class: ab.class, brand: ab.brand, mic: '', sir: '', notes: '', bpS: bp.bpS, bpR: bp.bpR });
  renderAvailableAntibiotics();
  renderDataTable();
}

function addCustomAntibiotic() {
  const name = document.getElementById('custom-ab-name').value.trim();
  const brand = document.getElementById('custom-ab-brand').value.trim();
  const cls = document.getElementById('custom-ab-class').value.trim() || 'Altro';
  if (!name) { alert('Inserire il nome dell\'antibiotico.'); return; }
  const code = 'CUS_' + Date.now().toString(36);
  state.antibiotics.push({ id: code, name, class: cls, brand: brand || '\u2014', mic: '', sir: '', notes: '', bpS: null, bpR: null });
  document.getElementById('custom-ab-name').value = '';
  document.getElementById('custom-ab-brand').value = '';
  document.getElementById('custom-ab-class').value = '';
  renderDataTable();
  hideAddAntibioticModal();
}

function removeAntibiotic(code) {
  state.antibiotics = state.antibiotics.filter(a => a.id !== code);
  renderDataTable();
}
