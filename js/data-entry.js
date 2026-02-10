/* data-entry.js — Antibiogram Data Table */

function renderDataTable() {
  const tbody = document.querySelector('#abg-table tbody');
  const title = document.getElementById('data-title');
  title.textContent = (SAMPLE_PANELS[state.sampleType]?.label || 'Esame') + ' — ' + state.organism;

  // Group by class
  const grouped = {};
  state.antibiotics.forEach(ab => {
    if (!grouped[ab.class]) grouped[ab.class] = [];
    grouped[ab.class].push(ab);
  });

  let html = '';
  Object.entries(grouped).forEach(([cls, abs]) => {
    html += `<tr class="class-separator"><td colspan="6"><span class="class-label">${cls}</span></td></tr>`;
    abs.forEach(ab => {
      html += `<tr class="abg-row" id="row-${ab.id}">
        <td class="ab-name-cell">
          <div class="ab-name">${ab.name}</div>
          <div class="ab-brand">${ab.brand}</div>
        </td>
        <td class="ab-code-cell">${ab.id.startsWith('CUS_') ? '—' : ab.id}</td>
        <td><input type="text" class="mic-input" id="mic-${ab.id}" value="${ab.mic}" placeholder="µg/mL" oninput="onMicInput('${ab.id}')"></td>
        <td>
          <select class="sir-select" id="sir-${ab.id}" onchange="onSirChange('${ab.id}')">
            <option value="">—</option>
            <option value="S" ${ab.sir==='S'?'selected':''}>S</option>
            <option value="I" ${ab.sir==='I'?'selected':''}>I</option>
            <option value="R" ${ab.sir==='R'?'selected':''}>R</option>
          </select>
        </td>
        <td class="sir-badge-cell" id="badge-${ab.id}"></td>
        <td><button class="btn-remove" onclick="removeAntibiotic('${ab.id}')" title="Rimuovi">✕</button></td>
      </tr>`;
    });
  });

  tbody.innerHTML = html;

  // Update badges for pre-filled values
  state.antibiotics.forEach(ab => { if (ab.sir) updateBadge(ab.id, ab.sir); });

  document.getElementById('ab-count').textContent = state.antibiotics.length + ' antibiotici nel pannello';
}

function onMicInput(id) {
  const ab = state.antibiotics.find(a => a.id === id);
  if (ab) ab.mic = document.getElementById('mic-' + id).value;
}

function onSirChange(id) {
  const val = document.getElementById('sir-' + id).value;
  const ab = state.antibiotics.find(a => a.id === id);
  if (ab) ab.sir = val;
  updateBadge(id, val);
}

function updateBadge(id, sir) {
  const cell = document.getElementById('badge-' + id);
  const row = document.getElementById('row-' + id);
  if (!cell) return;

  const map = {
    'S': { cls: 'badge-s', text: '✅ Sensibile', rowCls: 'row-s' },
    'I': { cls: 'badge-i', text: '⚠️ Intermedio', rowCls: 'row-i' },
    'R': { cls: 'badge-r', text: '🔴 Resistente', rowCls: 'row-r' },
    '':  { cls: '', text: '', rowCls: '' },
  };
  const m = map[sir] || map[''];
  cell.innerHTML = m.text ? `<span class="sir-badge ${m.cls}">${m.text}</span>` : '';
  if (row) { row.classList.remove('row-s','row-i','row-r'); if (m.rowCls) row.classList.add(m.rowCls); }
}
