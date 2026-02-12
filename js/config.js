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
    if (ab._custom || ab.id.startsWith('CUS_')) return;
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

/* ── Custom Antibiotics DB (localStorage) ── */
const CUSTOM_AB_KEY = 'abg_custom_antibiotics';

function getCustomAntibioticsDB() {
  try { const r = localStorage.getItem(CUSTOM_AB_KEY); return r ? JSON.parse(r) : {}; }
  catch(e) { return {}; }
}
function saveCustomAntibioticsDB(db) {
  try { localStorage.setItem(CUSTOM_AB_KEY, JSON.stringify(db)); } catch(e) {}
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

  // Merge built-in + custom DB
  const allAB = { ...ANTIBIOTICS_DB };
  const customDB = getCustomAntibioticsDB();
  Object.entries(customDB).forEach(([code, ab]) => {
    if (!allAB[code]) allAB[code] = ab;
  });

  const container = document.getElementById('ab-available-list');
  const available = Object.entries(allAB)
    .filter(([code]) => !currentIds.has(code))
    .filter(([code, ab]) => !search || ab.name.toLowerCase().includes(search) || ab.class.toLowerCase().includes(search) || ab.brand.toLowerCase().includes(search) || code.toLowerCase().includes(search));

  if (available.length === 0) {
    container.innerHTML = '<div class="db-empty" style="padding:20px"><div>Nessun antibiotico disponibile da aggiungere</div></div>';
    return;
  }

  const grouped = {};
  available.forEach(([code, ab]) => {
    if (!grouped[ab.class]) grouped[ab.class] = [];
    grouped[ab.class].push({ code, ...ab, _isCustom: !!customDB[code] });
  });

  container.innerHTML = Object.entries(grouped).map(([cls, abs]) => `
    <div class="ab-group">
      <div class="ab-group-title">${cls}</div>
      ${abs.map(ab => `
        <div class="ab-add-item" style="display:flex;align-items:center;gap:6px">
          <span class="ab-add-name" style="flex:1;cursor:pointer" onclick="addAntibiotic('${ab.code}')">${ab.name} ${ab._isCustom ? '<small style="color:var(--accent)">[custom]</small>' : ''}</span>
          <span class="ab-add-brand">${ab.brand}</span>
          ${ab._isCustom ? `<button class="btn-remove" onclick="event.stopPropagation();deleteFromCustomDB('${ab.code}')" title="Elimina dal DB" style="color:var(--danger);font-size:11px">🗑</button>` : ''}
          <span class="ab-add-btn" onclick="addAntibiotic('${ab.code}')">+ Aggiungi</span>
        </div>
      `).join('')}
    </div>
  `).join('');
}

function addAntibiotic(code) {
  if (state.antibiotics.find(a => a.id === code)) return;
  // Check built-in first, then custom DB
  let ab = ANTIBIOTICS_DB[code];
  let isCustom = false;
  if (!ab) {
    const customDB = getCustomAntibioticsDB();
    ab = customDB[code];
    isCustom = true;
  }
  if (!ab) return;
  const bp = isCustom ? { bpS: ab.bpS, bpR: ab.bpR } : getBreakpoints(code, state.organism);
  state.antibiotics.push({ id: code, name: ab.name, class: ab.class, brand: ab.brand, mic: '', sir: '', notes: '', bpS: bp.bpS, bpR: bp.bpR, _custom: isCustom });
  renderAvailableAntibiotics();
  renderDataTable();
}

function addCustomAntibiotic() {
  const name = document.getElementById('custom-ab-name').value.trim();
  const brand = document.getElementById('custom-ab-brand').value.trim();
  const cls = document.getElementById('custom-ab-class').value.trim() || 'Altro';
  const codeRaw = document.getElementById('custom-ab-code').value.trim().toUpperCase();
  const bpSraw = document.getElementById('custom-ab-bps').value;
  const bpRraw = document.getElementById('custom-ab-bpr').value;
  if (!name) { alert('Inserire il nome dell\'antibiotico.'); return; }

  const code = codeRaw || ('CUS_' + Date.now().toString(36));
  if (state.antibiotics.find(a => a.id === code)) { alert('Codice "' + code + '" gia presente nel pannello.'); return; }
  if (ANTIBIOTICS_DB[code]) { alert('Codice "' + code + '" gia presente nel database built-in.'); return; }

  const bpS = bpSraw !== '' ? parseFloat(bpSraw) : null;
  const bpR = bpRraw !== '' ? parseFloat(bpRraw) : (bpS !== null ? bpS : null);

  const abData = { name, class: cls, brand: brand || '\u2014', bpS, bpR };

  // Save to persistent custom DB
  const db = getCustomAntibioticsDB();
  db[code] = abData;
  saveCustomAntibioticsDB(db);

  // Add to current panel
  state.antibiotics.push({ id: code, ...abData, mic: '', sir: '', notes: '', _custom: true });

  // Clear fields
  ['custom-ab-name','custom-ab-brand','custom-ab-class','custom-ab-code','custom-ab-bps','custom-ab-bpr'].forEach(id => { document.getElementById(id).value = ''; });
  renderDataTable();
  hideAddAntibioticModal();
}

function editCustomAntibiotic(code) {
  const ab = state.antibiotics.find(a => a.id === code);
  if (!ab) return;
  const db = getCustomAntibioticsDB();
  const dbEntry = db[code] || {};

  let html = '<div class="modal-overlay" id="edit-ab-modal" onclick="if(event.target===this)this.remove()">';
  html += '<div class="modal-box" style="max-width:480px">';
  html += '<h3 style="margin-bottom:16px;color:var(--primary)">Modifica Antibiotico: ' + ab.name + '</h3>';
  html += '<div class="grid-2" style="gap:10px">';
  html += '<div class="form-group"><label>Nome</label><input type="text" id="edit-ab-name" value="' + (ab.name || '') + '"></div>';
  html += '<div class="form-group"><label>Nome Commerciale</label><input type="text" id="edit-ab-brand" value="' + (ab.brand || '') + '"></div>';
  html += '<div class="form-group"><label>Classe</label><input type="text" id="edit-ab-class" value="' + (ab.class || '') + '"></div>';
  html += '<div class="form-group"><label>Codice</label><input type="text" id="edit-ab-code" value="' + code + '" disabled style="opacity:.6"></div>';
  html += '<div class="form-group"><label>BP S &le; (mg/L)</label><input type="number" id="edit-ab-bps" value="' + (ab.bpS != null ? ab.bpS : '') + '" step="any" min="0"></div>';
  html += '<div class="form-group"><label>BP R &gt; (mg/L)</label><input type="number" id="edit-ab-bpr" value="' + (ab.bpR != null ? ab.bpR : '') + '" step="any" min="0"></div>';
  html += '</div>';
  html += '<div style="display:flex;gap:8px;margin-top:16px">';
  html += '<button class="btn btn-primary" onclick="saveEditedAntibiotic(\'' + code + '\')">Salva</button>';
  html += '<button class="btn btn-outline" onclick="this.closest(\'.modal-overlay\').remove()">Annulla</button>';
  html += '<button class="btn btn-outline" style="margin-left:auto;color:var(--danger);border-color:var(--danger)" onclick="deleteFromCustomDB(\'' + code + '\');this.closest(\'.modal-overlay\').remove()">Elimina dal DB</button>';
  html += '</div></div></div>';
  document.body.insertAdjacentHTML('beforeend', html);
}

function saveEditedAntibiotic(code) {
  const name = document.getElementById('edit-ab-name').value.trim();
  const brand = document.getElementById('edit-ab-brand').value.trim();
  const cls = document.getElementById('edit-ab-class').value.trim() || 'Altro';
  const bpSraw = document.getElementById('edit-ab-bps').value;
  const bpRraw = document.getElementById('edit-ab-bpr').value;
  if (!name) { alert('Inserire il nome.'); return; }

  const bpS = bpSraw !== '' ? parseFloat(bpSraw) : null;
  const bpR = bpRraw !== '' ? parseFloat(bpRraw) : (bpS !== null ? bpS : null);

  // Update in custom DB
  const db = getCustomAntibioticsDB();
  db[code] = { name, class: cls, brand: brand || '\u2014', bpS, bpR };
  saveCustomAntibioticsDB(db);

  // Update in current panel
  const ab = state.antibiotics.find(a => a.id === code);
  if (ab) { ab.name = name; ab.brand = brand || '\u2014'; ab.class = cls; ab.bpS = bpS; ab.bpR = bpR; }

  document.getElementById('edit-ab-modal')?.remove();
  renderDataTable();
}

function deleteFromCustomDB(code) {
  if (!confirm('Eliminare "' + code + '" dal database personalizzato?')) return;
  const db = getCustomAntibioticsDB();
  delete db[code];
  saveCustomAntibioticsDB(db);
  // Also remove from current panel if present
  state.antibiotics = state.antibiotics.filter(a => a.id !== code);
  renderDataTable();
  renderAvailableAntibiotics();
}

function removeAntibiotic(code) {
  state.antibiotics = state.antibiotics.filter(a => a.id !== code);
  renderDataTable();
}
