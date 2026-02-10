/* results.js — Results Summary & Diagnostic Interpretation */

function renderResultsSummary() {
  const el = document.getElementById('results-summary-content');
  const filled = state.antibiotics.filter(a => a.sir);
  const sensible = filled.filter(a => a.sir === 'S');
  const intermediate = filled.filter(a => a.sir === 'I');
  const resistant = filled.filter(a => a.sir === 'R');

  const total = filled.length;
  const sPerc = total ? Math.round(sensible.length / total * 100) : 0;
  const rPerc = total ? Math.round(resistant.length / total * 100) : 0;

  let html = '';

  // ── Header info ──
  html += `<div class="result-header">
    <div class="result-field"><span class="result-label">Campione:</span> ${SAMPLE_PANELS[state.sampleType]?.label || state.sampleType}</div>
    <div class="result-field"><span class="result-label">Microrganismo isolato:</span> <strong>${state.organism}</strong></div>
    ${state.colonyCount ? `<div class="result-field"><span class="result-label">Carica:</span> ${state.colonyCount}</div>` : ''}
    <div class="result-field"><span class="result-label">Antibiotici testati:</span> ${total}</div>
  </div>`;

  // ── Resistance profile ──
  html += `<div class="resistance-bar">
    <div class="rbar-s" style="width:${sPerc}%">${sensible.length} S (${sPerc}%)</div>
    ${intermediate.length ? `<div class="rbar-i" style="width:${Math.round(intermediate.length/total*100)}%">${intermediate.length} I</div>` : ''}
    <div class="rbar-r" style="width:${rPerc || 1}%">${resistant.length} R (${rPerc}%)</div>
  </div>`;

  // ── MDR warning ──
  if (rPerc >= 50) {
    html += `<div class="alert alert-danger">⚠️ <strong>Profilo Multi-Drug Resistant (MDR)</strong> — Il microrganismo risulta resistente al ${rPerc}% degli antibiotici testati. Si consiglia consulenza infettivologica.</div>`;
  } else if (rPerc >= 30) {
    html += `<div class="alert alert-warning">⚠️ Resistenze significative rilevate (${rPerc}%). Valutare attentamente la scelta terapeutica.</div>`;
  }

  // ── Detailed tables ──
  if (sensible.length > 0) {
    html += `<h3 class="section-subtitle" style="color:var(--success)">✅ Antibiotici Sensibili (${sensible.length})</h3>`;
    html += buildAbTable(sensible, 'S');
  }
  if (intermediate.length > 0) {
    html += `<h3 class="section-subtitle" style="color:var(--warning)">⚠️ Sensibilità Intermedia (${intermediate.length})</h3>`;
    html += buildAbTable(intermediate, 'I');
  }
  if (resistant.length > 0) {
    html += `<h3 class="section-subtitle" style="color:var(--danger)">🔴 Antibiotici Resistenti (${resistant.length})</h3>`;
    html += buildAbTable(resistant, 'R');
  }

  // ── Interpretation ──
  html += buildInterpretation(sensible, intermediate, resistant);

  el.innerHTML = html;
}

function buildAbTable(abs, sir) {
  const cls = sir === 'S' ? 'table-s' : sir === 'I' ? 'table-i' : 'table-r';
  return `<table class="result-table ${cls}">
    <thead><tr><th>Antibiotico</th><th>Classe</th><th>Nome Commerciale</th><th>MIC (µg/mL)</th><th>S/I/R</th></tr></thead>
    <tbody>${abs.map(a => `<tr>
      <td><strong>${a.name}</strong></td>
      <td>${a.class}</td>
      <td>${a.brand}</td>
      <td>${a.mic || '—'}</td>
      <td><span class="sir-badge badge-${sir.toLowerCase()}">${sir}</span></td>
    </tr>`).join('')}</tbody>
  </table>`;
}

function buildInterpretation(sensible, intermediate, resistant) {
  let html = '<div class="interpretation-box" id="interpretation-box">';
  html += '<h3 class="interp-title">📋 Interpretazione Diagnostica e Suggerimento Terapeutico</h3>';

  html += `<p class="interp-text"><strong>Microrganismo isolato:</strong> <em>${state.organism}</em><br>`;
  if (state.colonyCount) html += `<strong>Carica microbica:</strong> ${state.colonyCount}<br>`;
  html += `<strong>Campione:</strong> ${SAMPLE_PANELS[state.sampleType]?.label || state.sampleType}</p>`;

  // Group sensible by class for recommendations
  const sByClass = {};
  sensible.forEach(a => {
    if (!sByClass[a.class]) sByClass[a.class] = [];
    sByClass[a.class].push(a);
  });

  if (sensible.length > 0) {
    html += '<h4 class="interp-subtitle">💊 Antibiotici Consigliati (Sensibili)</h4>';
    html += '<div class="recommendation-grid">';
    sensible.forEach(a => {
      const micInfo = a.mic ? `MIC ${a.mic} µg/mL` : '';
      html += `<div class="rec-card rec-card-s">
        <div class="rec-name">${a.name}</div>
        <div class="rec-brand">📦 ${a.brand}</div>
        <div class="rec-class">${a.class}</div>
        ${micInfo ? `<div class="rec-mic">${micInfo}</div>` : ''}
      </div>`;
    });
    html += '</div>';

    // Best choice logic
    html += '<div class="best-choice">';
    html += '<h4 class="interp-subtitle">🎯 Suggerimento Prima Scelta</h4>';
    const firstChoice = pickFirstChoice(sensible);
    if (firstChoice) {
      html += `<p class="interp-text">In base al profilo di sensibilità e al tipo di campione (${SAMPLE_PANELS[state.sampleType]?.label || ''}), si suggerisce come prima scelta:</p>`;
      html += `<div class="first-choice-card">
        <div class="fc-name">${firstChoice.name}</div>
        <div class="fc-brand">${firstChoice.brand}</div>
        ${firstChoice.mic ? `<div class="fc-mic">MIC: ${firstChoice.mic} µg/mL</div>` : ''}
      </div>`;
    }
    html += '</div>';
  } else {
    html += '<div class="alert alert-danger"><strong>⚠️ Nessun antibiotico risulta sensibile.</strong> Si consiglia urgente consulenza infettivologica per valutare terapie combinate o antibiotici di ultima linea.</div>';
  }

  if (intermediate.length > 0) {
    html += '<h4 class="interp-subtitle">⚠️ Opzioni a Sensibilità Intermedia</h4>';
    html += '<p class="interp-text">I seguenti antibiotici possono essere efficaci a dosaggio aumentato o in sedi favorevoli (es. alte concentrazioni urinarie):</p>';
    html += '<div class="interp-list">' + intermediate.map(a => `<span class="interp-pill pill-i">${a.name} (${a.brand})</span>`).join('') + '</div>';
  }

  if (resistant.length > 0) {
    html += '<h4 class="interp-subtitle">🚫 Antibiotici NON Raccomandati (Resistenti)</h4>';
    html += '<div class="interp-list">' + resistant.map(a => `<span class="interp-pill pill-r">${a.name}</span>`).join('') + '</div>';
  }

  // Resistance patterns
  const patterns = detectResistancePatterns(resistant);
  if (patterns.length > 0) {
    html += '<h4 class="interp-subtitle">🔬 Pattern di Resistenza Rilevati</h4>';
    html += '<ul class="pattern-list">' + patterns.map(p => `<li>${p}</li>`).join('') + '</ul>';
  }

  html += '<div class="interp-disclaimer">⚕️ <em>Nota: L\'interpretazione è indicativa. La scelta terapeutica definitiva spetta al medico curante, tenendo conto della sede d\'infezione, delle condizioni cliniche del paziente, della farmacocinetica e delle interazioni farmacologiche. Breakpoints secondo criteri EUCAST.</em></div>';
  html += '</div>';
  return html;
}

function pickFirstChoice(sensible) {
  // Priority logic by sample type
  const priorityMap = {
    urine: ['FOS','NIT','AMX','AMC','CFX','SXT','CIP','LEV','CTX','CRO'],
    feci: ['AZI','CIP','CTX','CRO','SXT','AMC'],
    orofaringeo: ['AMX','AMC','AZI','CLA','PEN','CXM','LEV'],
    ferita: ['AMC','CXM','SXT','CLI','DOX','CIP','LEV'],
    espettorato: ['AMC','AZI','CLA','LEV','MOX','CXM','CTX'],
    vaginale: ['AMX','AMC','AZI','CLI','MTZ','NIT','CTX'],
    sangue: ['CTX','CRO','TZP','MEM','VAN','DAP'],
    liquor: ['CTX','CRO','AMP','MEM','VAN'],
    generico: ['AMC','CIP','SXT','CTX'],
  };
  const priority = priorityMap[state.sampleType] || priorityMap.generico;
  for (const code of priority) {
    const match = sensible.find(a => a.id === code);
    if (match) return match;
  }
  // Fallback: lowest MIC if available
  const withMic = sensible.filter(a => a.mic && !isNaN(parseFloat(a.mic)));
  if (withMic.length > 0) {
    withMic.sort((a, b) => parseFloat(a.mic) - parseFloat(b.mic));
    return withMic[0];
  }
  return sensible[0];
}

function detectResistancePatterns(resistant) {
  const rIds = new Set(resistant.map(a => a.id));
  const patterns = [];

  // ESBL suspected
  if ((rIds.has('CTX') || rIds.has('CRO') || rIds.has('CAZ')) && !rIds.has('IMP') && !rIds.has('MEM')) {
    patterns.push('🔬 <strong>Sospetta produzione ESBL</strong> — Resistenza a cefalosporine III gen. con sensibilità ai carbapenemi. Confermare con test fenotipico.');
  }
  // Carbapenem resistance
  if (rIds.has('IMP') || rIds.has('MEM') || rIds.has('ETP')) {
    patterns.push('🚨 <strong>Resistenza ai Carbapenemi (CRE)</strong> — Microrganismo potenzialmente produttore di carbapenemasi. Attivare protocolli di sorveglianza e isolamento.');
  }
  // MRSA pattern
  if (rIds.has('OXA') && (rIds.has('PEN') || rIds.has('AMP'))) {
    patterns.push('🦠 <strong>Pattern MRSA</strong> — Resistenza a oxacillina indica meticillino-resistenza. Considerare vancomicina, linezolid o daptomicina.');
  }
  // Fluoroquinolone resistance
  if (rIds.has('CIP') && rIds.has('LEV')) {
    patterns.push('⚠️ <strong>Resistenza ai Fluorochinoloni</strong> — Ciprofloxacina e levofloxacina non utilizzabili.');
  }
  // Pan-aminoglycoside resistance
  if (rIds.has('GEN') && rIds.has('TOB') && rIds.has('AMK')) {
    patterns.push('⚠️ <strong>Resistenza a tutti gli Aminoglicosidi testati</strong> — Possibile produzione di enzimi modificanti (AME).');
  }
  // VRE
  if (rIds.has('VAN') && (state.organism.toLowerCase().includes('enterococcus'))) {
    patterns.push('🚨 <strong>VRE — Enterococco Vancomicina-Resistente</strong> — Valutare linezolid o daptomicina. Attivare isolamento.');
  }
  return patterns;
}

function toggleInterpretation() {
  const box = document.getElementById('interpretation-box');
  if (box) box.classList.toggle('hidden');
}
