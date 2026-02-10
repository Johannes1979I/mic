/* database.js — Patient & Report Archive (localStorage) */

const DB_KEY = 'abg_archive';

function getArchive() {
  try { const r = localStorage.getItem(DB_KEY); return r ? JSON.parse(r) : []; }
  catch(e) { return []; }
}
function saveArchive(archive) {
  try { localStorage.setItem(DB_KEY, JSON.stringify(archive)); } catch(e) {}
}
function generateId() { return Date.now().toString(36) + Math.random().toString(36).substr(2, 6); }

function saveReportToArchive() {
  const archive = getArchive();
  const record = {
    id: generateId(),
    timestamp: new Date().toISOString(),
    patient: {
      cognome: document.getElementById('pt-cognome').value || '',
      nome: document.getElementById('pt-nome').value || '',
      dob: document.getElementById('pt-dob').value || '',
      sesso: document.getElementById('pt-sesso').value || 'M',
      cf: document.getElementById('pt-cf').value || '',
      dataEsame: document.getElementById('pt-data-esame').value || '',
      medico: document.getElementById('pt-medico').value || '',
      accettazione: document.getElementById('pt-accettazione').value || '',
    },
    sample: {
      type: state.sampleType,
      label: SAMPLE_PANELS[state.sampleType]?.label || state.sampleType,
      organism: state.organism,
      colonyCount: state.colonyCount,
    },
    antibiotics: state.antibiotics.map(a => ({ ...a })),
    methodology: document.getElementById('methodology').value || '',
  };
  archive.unshift(record);
  saveArchive(archive);
  return record;
}

function autoSaveReport(pdfDataUri) {
  const record = saveReportToArchive();
  try { localStorage.setItem('abg_pdf_' + record.id, pdfDataUri); } catch(e) {}
}

function loadReport(id) {
  const archive = getArchive();
  const rec = archive.find(r => r.id === id);
  if (!rec) { alert('Referto non trovato.'); return; }

  document.getElementById('pt-cognome').value = rec.patient.cognome;
  document.getElementById('pt-nome').value = rec.patient.nome;
  document.getElementById('pt-dob').value = rec.patient.dob;
  document.getElementById('pt-sesso').value = rec.patient.sesso;
  document.getElementById('pt-cf').value = rec.patient.cf;
  document.getElementById('pt-data-esame').value = rec.patient.dataEsame;
  document.getElementById('pt-medico').value = rec.patient.medico;
  document.getElementById('pt-accettazione').value = rec.patient.accettazione;

  state.sampleType = rec.sample.type;
  state.preset = rec.sample.type;
  state.organism = rec.sample.organism;
  state.colonyCount = rec.sample.colonyCount;
  state.antibiotics = rec.antibiotics.map(a => ({ ...a }));

  document.getElementById('cfg-organism').value = rec.sample.organism;
  document.getElementById('cfg-colony-count').value = rec.sample.colonyCount || '';
  document.getElementById('methodology').value = rec.methodology;

  renderPresets();
  renderDataTable();
  showSection('data');
}

function deleteReport(id) {
  if (!confirm('Eliminare questo referto?')) return;
  let archive = getArchive();
  archive = archive.filter(r => r.id !== id);
  saveArchive(archive);
  try { localStorage.removeItem('abg_pdf_' + id); } catch(e) {}
  renderArchive();
}

function downloadSavedPdf(id) {
  const archive = getArchive();
  const rec = archive.find(r => r.id === id);
  if (!rec) return;
  const data = localStorage.getItem('abg_pdf_' + id);
  if (data) {
    const a = document.createElement('a');
    a.href = data; a.download = 'ABG_' + rec.patient.cognome + '_' + rec.patient.nome + '.pdf';
    document.body.appendChild(a); a.click(); setTimeout(() => document.body.removeChild(a), 100);
  } else { alert('PDF non in cache. Ricaricare e rigenerare.'); }
}

function exportArchive() {
  const archive = getArchive();
  if (!archive.length) { alert('Archivio vuoto.'); return; }
  const blob = new Blob([JSON.stringify(archive, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'archivio_antibiogrammi_' + new Date().toISOString().split('T')[0] + '.json';
  document.body.appendChild(a); a.click(); setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url); }, 100);
}

function importArchive(event) {
  const file = event.target.files[0]; if (!file) return;
  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const imported = JSON.parse(e.target.result);
      if (!Array.isArray(imported)) throw new Error('Formato non valido');
      const existing = getArchive();
      const ids = new Set(existing.map(r => r.id));
      let added = 0;
      imported.forEach(rec => { if (!ids.has(rec.id)) { existing.unshift(rec); added++; } });
      saveArchive(existing);
      renderArchive();
      alert('Importati ' + added + ' referti nuovi.');
    } catch(err) { alert('Errore: ' + err.message); }
  };
  reader.readAsText(file);
  event.target.value = '';
}

function renderArchive() {
  const archive = getArchive();
  const statsEl = document.getElementById('archive-stats');
  const listEl = document.getElementById('archive-list');

  const patients = new Set(archive.map(r => (r.patient.cognome + r.patient.nome + r.patient.cf).toLowerCase())).size;
  const organisms = new Set(archive.map(r => r.sample?.organism)).size;
  statsEl.innerHTML = `
    <div class="db-stat"><div class="db-stat-num">${archive.length}</div><div class="db-stat-label">Referti</div></div>
    <div class="db-stat"><div class="db-stat-num">${patients}</div><div class="db-stat-label">Pazienti</div></div>
    <div class="db-stat"><div class="db-stat-num">${organisms}</div><div class="db-stat-label">Microrganismi</div></div>
  `;

  if (!archive.length) {
    listEl.innerHTML = '<div class="db-empty"><div class="db-empty-icon">🗃️</div><div>Nessun referto archiviato</div></div>';
    return;
  }

  const search = (document.getElementById('archive-search')?.value || '').toLowerCase();
  let filtered = archive;
  if (search) {
    filtered = archive.filter(r =>
      (r.patient.cognome + ' ' + r.patient.nome + ' ' + r.patient.cf + ' ' + r.sample?.organism + ' ' + r.sample?.label + ' ' + r.patient.dataEsame)
        .toLowerCase().includes(search));
  }

  listEl.innerHTML = filtered.map(r => {
    const date = r.patient.dataEsame || r.timestamp?.split('T')[0] || '';
    const s = (r.antibiotics || []).filter(a => a.sir === 'S').length;
    const rr = (r.antibiotics || []).filter(a => a.sir === 'R').length;
    return `<div class="db-item">
      <div class="db-item-info" onclick="loadReport('${r.id}')">
        <div class="db-item-name">${r.patient.cognome || '—'} ${r.patient.nome || ''}</div>
        <div class="db-item-meta">${date} · ${r.sample?.label || ''} · <em>${r.sample?.organism || ''}</em>
          <span class="db-tag db-tag-s">${s}S</span><span class="db-tag db-tag-r">${rr}R</span>
        </div>
      </div>
      <div class="db-item-actions">
        <button class="btn btn-outline btn-sm" onclick="loadReport('${r.id}')" title="Carica">📂</button>
        <button class="btn btn-outline btn-sm" onclick="downloadSavedPdf('${r.id}')" title="PDF">📄</button>
        <button class="btn btn-danger-outline btn-sm" onclick="deleteReport('${r.id}')" title="Elimina">🗑️</button>
      </div>
    </div>`;
  }).join('');
}

function clearArchive() {
  if (!confirm('⚠️ Eliminare TUTTI i referti? Azione irreversibile.')) return;
  if (!confirm('Conferma definitiva?')) return;
  const archive = getArchive();
  archive.forEach(r => { try { localStorage.removeItem('abg_pdf_' + r.id); } catch(e) {} });
  localStorage.removeItem(DB_KEY);
  renderArchive();
}
