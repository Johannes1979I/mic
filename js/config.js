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
  }
}

function applyCustomOrganism() {
  const v = document.getElementById('cfg-organism-custom').value.trim();
  if (v) { state.organism = v; document.getElementById('custom-organism-row').classList.add('hidden'); }
}

function updateColonyCount() {
  state.colonyCount = document.getElementById('cfg-colony-count').value;
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

  // Group by class
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
  state.antibiotics.push({ id: code, name: ab.name, class: ab.class, brand: ab.brand, mic: '', sir: '', notes: '' });
  renderAvailableAntibiotics();
  renderDataTable();
}

function addCustomAntibiotic() {
  const name = document.getElementById('custom-ab-name').value.trim();
  const brand = document.getElementById('custom-ab-brand').value.trim();
  const cls = document.getElementById('custom-ab-class').value.trim() || 'Altro';
  if (!name) { alert('Inserire il nome dell\'antibiotico.'); return; }
  const code = 'CUS_' + Date.now().toString(36);
  state.antibiotics.push({ id: code, name, class: cls, brand: brand || '—', mic: '', sir: '', notes: '' });
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
