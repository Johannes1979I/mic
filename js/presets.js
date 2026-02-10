/* presets.js — Sample Type Preset Cards & Selection */

function renderPresets() {
  const grid = document.getElementById('preset-grid');
  grid.innerHTML = PRESETS.map(p => `
    <div class="preset-card ${state.preset === p.id ? 'selected' : ''}" onclick="selectPreset('${p.id}')" style="--preset-color:${p.color}">
      <div class="preset-icon-letter" style="background:${p.color}">${p.icon}</div>
      <div class="preset-name">${p.name}</div>
      <div class="preset-desc">${p.desc}</div>
    </div>
  `).join('');
}

function selectPreset(id) {
  state.preset = id;
  state.sampleType = id;
  const panel = SAMPLE_PANELS[id];
  if (!panel) return;

  // Build antibiotic panel with breakpoints
  state.antibiotics = panel.antibiotics.map(code => {
    const ab = ANTIBIOTICS_DB[code];
    return { id: code, name: ab.name, class: ab.class, brand: ab.brand, mic: '', sir: '', notes: '', bpS: ab.bpS, bpR: ab.bpR };
  });

  // Populate organism dropdown
  const orgSel = document.getElementById('cfg-organism');
  orgSel.innerHTML = '<option value="">-- Seleziona microrganismo --</option>' +
    panel.organisms.map(o => `<option value="${o}">${o}</option>`).join('') +
    '<option value="__custom__">* Altro (inserisci manualmente)</option>';

  document.getElementById('cfg-sample-label').textContent = panel.label;
  renderPresets();
}
