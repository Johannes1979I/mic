/* presets.js — Sample Type Preset Cards, Custom Label, Custom Panel Merging */

function renderPresets() {
  const grid = document.getElementById('preset-grid');
  grid.innerHTML = PRESETS.map(p => `
    <div class="preset-card ${state.preset === p.id ? 'selected' : ''}" onclick="selectPreset('${p.id}')" style="--preset-color:${p.color}">
      <div class="preset-icon-letter" style="background:${p.color}">${p.icon}</div>
      <div class="preset-name">${p.name}</div>
      <div class="preset-desc">${p.desc}</div>
    </div>
  `).join('');

  // Show/hide custom sample label field
  const customLabelRow = document.getElementById('custom-sample-label-row');
  if (customLabelRow) {
    customLabelRow.classList.toggle('hidden', state.preset !== 'generico');
  }
}

function selectPreset(id) {
  // If genitale, show sub-site selector first
  if (id === 'genitale') {
    showGenitaleSiteModal();
    return;
  }

  applyPreset(id);
}

function showGenitaleSiteModal() {
  const sites = SAMPLE_PANELS.genitale.subSites;
  let html = '<div class="modal-overlay" id="genitale-modal" onclick="if(event.target===this)this.remove()">';
  html += '<div class="modal-box" style="max-width:420px">';
  html += '<h3 style="margin-bottom:16px;color:var(--primary)">Seleziona sede del tampone genitale</h3>';
  sites.forEach(s => {
    html += `<button class="btn btn-outline" style="display:block;width:100%;margin-bottom:8px;text-align:left;padding:12px 16px" onclick="selectGenitaleSite('${s}')">${s}</button>`;
  });
  html += '<button class="btn btn-sm" style="margin-top:8px;width:100%" onclick="this.closest(\'.modal-overlay\').remove()">Annulla</button>';
  html += '</div></div>';
  document.body.insertAdjacentHTML('beforeend', html);
}

function selectGenitaleSite(site) {
  state.genitaleSite = site;
  document.getElementById('genitale-modal')?.remove();
  applyPreset('genitale');
}

function applyPreset(id) {
  state.preset = id;
  state.sampleType = id;
  const panel = SAMPLE_PANELS[id];
  if (!panel) return;

  // Start with default antibiotics
  const abCodes = [...panel.antibiotics];

  // Merge custom panels associated with this exam type
  const customPanels = getCustomPanels();
  const extras = customPanels.filter(cp => cp.associatedExams && cp.associatedExams.includes(id));
  extras.forEach(cp => {
    cp.antibiotics.forEach(code => {
      if (!abCodes.includes(code)) abCodes.push(code);
    });
  });

  // Build antibiotic panel with breakpoints
  state.antibiotics = abCodes.map(code => {
    const ab = ANTIBIOTICS_DB[code];
    if (!ab) return null;
    return { id: code, name: ab.name, class: ab.class, brand: ab.brand, mic: '', sir: '', notes: '', bpS: ab.bpS, bpR: ab.bpR };
  }).filter(Boolean);

  // Populate organism dropdown
  const orgSel = document.getElementById('cfg-organism');
  orgSel.innerHTML = '<option value="">-- Seleziona microrganismo --</option>' +
    panel.organisms.map(o => `<option value="${o}">${o}</option>`).join('') +
    '<option value="__custom__">* Altro (inserisci manualmente)</option>';

  // For generico: show custom sample label or use default
  if (id === 'generico') {
    const customLabel = document.getElementById('custom-sample-label')?.value.trim();
    document.getElementById('cfg-sample-label').textContent = customLabel || panel.label;
  } else if (id === 'genitale' && state.genitaleSite) {
    document.getElementById('cfg-sample-label').textContent = 'Tampone Genitale — ' + state.genitaleSite;
  } else {
    document.getElementById('cfg-sample-label').textContent = panel.label;
  }

  // Show merged panel info
  if (extras.length > 0) {
    const names = extras.map(cp => cp.name).join(', ');
    document.getElementById('cfg-sample-label').textContent += ' [+ ' + names + ']';
  }

  renderPresets();
}

function onCustomSampleLabelChange() {
  const v = document.getElementById('custom-sample-label').value.trim();
  if (state.preset === 'generico') {
    const panel = SAMPLE_PANELS.generico;
    // Override label in state for PDF/results
    if (v) {
      SAMPLE_PANELS.generico._customLabel = v;
      document.getElementById('cfg-sample-label').textContent = v;
    } else {
      delete SAMPLE_PANELS.generico._customLabel;
      document.getElementById('cfg-sample-label').textContent = panel.label;
    }
  }
}

/* Override getSampleLabel to respect custom label and genital sub-site */
function getSampleLabel() {
  if (state.sampleType === 'generico' && SAMPLE_PANELS.generico._customLabel) {
    return SAMPLE_PANELS.generico._customLabel;
  }
  if (state.sampleType === 'genitale' && state.genitaleSite) {
    return 'Tampone Genitale — ' + state.genitaleSite;
  }
  return SAMPLE_PANELS[state.sampleType]?.label || state.sampleType;
}
