/* custom-panels.js — User-defined Antibiotic Panels associated with Exam Types */

function showCustomPanelsModal() {
  document.getElementById('custom-panels-modal').classList.remove('hidden');
  renderCustomPanelsList();
}

function hideCustomPanelsModal() {
  document.getElementById('custom-panels-modal').classList.add('hidden');
}

function renderCustomPanelsList() {
  const panels = getCustomPanels();
  const container = document.getElementById('custom-panels-list');

  if (panels.length === 0) {
    container.innerHTML = '<div class="db-empty" style="padding:20px;text-align:center;color:var(--text-muted)"><div style="font-size:24px;margin-bottom:8px">Nessun pannello personalizzato</div><div>Crea il tuo primo pannello aggiuntivo di antibiotici</div></div>';
    return;
  }

  container.innerHTML = panels.map((p, idx) => {
    const examNames = (p.associatedExams || []).map(eid => {
      const preset = PRESETS.find(pr => pr.id === eid);
      return preset ? preset.name : eid;
    }).join(', ');
    const abNames = (p.antibiotics || []).map(code => {
      const ab = ANTIBIOTICS_DB[code];
      return ab ? ab.name : code;
    });
    return `<div class="cp-item">
      <div class="cp-item-header">
        <div>
          <div class="cp-item-name">${p.name}</div>
          <div class="cp-item-meta">${p.antibiotics.length} antibiotici &middot; Associato a: ${examNames || '<em>nessun esame</em>'}</div>
        </div>
        <div class="cp-item-actions">
          <button class="btn btn-outline btn-sm" onclick="editCustomPanel(${idx})" title="Modifica">Modifica</button>
          <button class="btn btn-danger-outline btn-sm" onclick="deleteCustomPanel(${idx})" title="Elimina">Elimina</button>
        </div>
      </div>
      <div class="cp-item-abs">${abNames.slice(0, 8).join(', ')}${abNames.length > 8 ? ' e altri ' + (abNames.length - 8) + '...' : ''}</div>
    </div>`;
  }).join('');
}

/* ── Create / Edit Panel ── */
let editingPanelIdx = -1;

function showNewPanelForm() {
  editingPanelIdx = -1;
  document.getElementById('cp-form-title').textContent = 'Nuovo Pannello Antibiotici';
  document.getElementById('cp-panel-name').value = '';
  // Uncheck all exams
  document.querySelectorAll('.cp-exam-check').forEach(cb => cb.checked = false);
  // Uncheck all antibiotics
  document.querySelectorAll('.cp-ab-check').forEach(cb => cb.checked = false);
  document.getElementById('cp-form-section').classList.remove('hidden');
  document.getElementById('cp-list-section').classList.add('hidden');
}

function editCustomPanel(idx) {
  const panels = getCustomPanels();
  const p = panels[idx];
  if (!p) return;

  editingPanelIdx = idx;
  document.getElementById('cp-form-title').textContent = 'Modifica: ' + p.name;
  document.getElementById('cp-panel-name').value = p.name;

  // Set exam checkboxes
  document.querySelectorAll('.cp-exam-check').forEach(cb => {
    cb.checked = (p.associatedExams || []).includes(cb.value);
  });

  // Set antibiotic checkboxes
  document.querySelectorAll('.cp-ab-check').forEach(cb => {
    cb.checked = (p.antibiotics || []).includes(cb.value);
  });

  document.getElementById('cp-form-section').classList.remove('hidden');
  document.getElementById('cp-list-section').classList.add('hidden');
}

function cancelPanelForm() {
  document.getElementById('cp-form-section').classList.add('hidden');
  document.getElementById('cp-list-section').classList.remove('hidden');
  editingPanelIdx = -1;
}

function savePanelForm() {
  const name = document.getElementById('cp-panel-name').value.trim();
  if (!name) { alert('Inserire un nome per il pannello.'); return; }

  const selectedExams = [];
  document.querySelectorAll('.cp-exam-check:checked').forEach(cb => selectedExams.push(cb.value));

  const selectedAbs = [];
  document.querySelectorAll('.cp-ab-check:checked').forEach(cb => selectedAbs.push(cb.value));

  if (selectedAbs.length === 0) { alert('Selezionare almeno un antibiotico.'); return; }

  const panels = getCustomPanels();

  const panel = {
    id: editingPanelIdx >= 0 ? panels[editingPanelIdx].id : 'cp_' + Date.now().toString(36),
    name,
    antibiotics: selectedAbs,
    associatedExams: selectedExams,
  };

  if (editingPanelIdx >= 0) {
    panels[editingPanelIdx] = panel;
  } else {
    panels.push(panel);
  }

  saveCustomPanels(panels);
  cancelPanelForm();
  renderCustomPanelsList();

  // If a preset is currently selected, re-apply to merge new panel
  if (state.preset) selectPreset(state.preset);
}

function deleteCustomPanel(idx) {
  if (!confirm('Eliminare questo pannello personalizzato?')) return;
  const panels = getCustomPanels();
  panels.splice(idx, 1);
  saveCustomPanels(panels);
  renderCustomPanelsList();
  if (state.preset) selectPreset(state.preset);
}

/* ── Filter antibiotics in panel form ── */
function filterPanelAntibiotics() {
  const search = (document.getElementById('cp-ab-search')?.value || '').toLowerCase();
  document.querySelectorAll('.cp-ab-row').forEach(row => {
    const text = (row.dataset.name + ' ' + row.dataset.class + ' ' + row.dataset.brand).toLowerCase();
    row.style.display = (!search || text.includes(search)) ? '' : 'none';
  });
}

/* ── Select/Deselect All ── */
function cpSelectAllAbs(select) {
  document.querySelectorAll('.cp-ab-check').forEach(cb => {
    if (cb.closest('.cp-ab-row').style.display !== 'none') cb.checked = select;
  });
}

/* ── Build the form contents (called once on page load) ── */
function buildCustomPanelFormContent() {
  // Exam checkboxes
  const examContainer = document.getElementById('cp-exam-checkboxes');
  if (examContainer) {
    examContainer.innerHTML = PRESETS.map(p => `
      <label class="cp-exam-label">
        <input type="checkbox" class="cp-exam-check" value="${p.id}">
        <span class="cp-exam-name" style="border-left:3px solid ${p.color};padding-left:6px">${p.name}</span>
      </label>
    `).join('');
  }

  // Antibiotic checkboxes grouped by class
  const abContainer = document.getElementById('cp-ab-checkboxes');
  if (abContainer) {
    const grouped = {};
    Object.entries(ANTIBIOTICS_DB).forEach(([code, ab]) => {
      if (!grouped[ab.class]) grouped[ab.class] = [];
      grouped[ab.class].push({ code, ...ab });
    });

    abContainer.innerHTML = Object.entries(grouped).map(([cls, abs]) => `
      <div class="cp-ab-group">
        <div class="cp-ab-group-title">${cls}</div>
        ${abs.map(ab => `
          <label class="cp-ab-row" data-name="${ab.name}" data-class="${ab.class}" data-brand="${ab.brand}">
            <input type="checkbox" class="cp-ab-check" value="${ab.code}">
            <span class="cp-ab-label">${ab.name} <small style="color:var(--text-muted)">(${ab.brand})</small></span>
          </label>
        `).join('')}
      </div>
    `).join('');
  }
}
