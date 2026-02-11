/* results.js — Results Summary & Diagnostic Interpretation (no emoji for PDF safety) */

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

  // Header info
  const colonyDisplay = getColonyDisplay();
  html += `<div class="result-header">
    <div class="result-field"><span class="result-label">Campione:</span> ${getSampleLabel()}</div>
    <div class="result-field"><span class="result-label">Microrganismo isolato:</span> <strong>${state.organism}</strong></div>
    ${colonyDisplay ? `<div class="result-field"><span class="result-label">Carica:</span> ${colonyDisplay}</div>` : ''}
    <div class="result-field"><span class="result-label">Antibiotici testati:</span> ${total}</div>
  </div>`;

  // Resistance bar
  html += `<div class="resistance-bar">
    <div class="rbar-s" style="width:${sPerc}%">${sensible.length} S (${sPerc}%)</div>
    ${intermediate.length ? `<div class="rbar-i" style="width:${Math.round(intermediate.length/total*100)}%">${intermediate.length} I</div>` : ''}
    <div class="rbar-r" style="width:${rPerc || 1}%">${resistant.length} R (${rPerc}%)</div>
  </div>`;

  // MDR warning
  if (rPerc >= 50) {
    html += `<div class="alert alert-danger"><strong>ATTENZIONE - Profilo Multi-Drug Resistant (MDR)</strong> -- Il microrganismo risulta resistente al ${rPerc}% degli antibiotici testati. Si consiglia consulenza infettivologica.</div>`;
  } else if (rPerc >= 30) {
    html += `<div class="alert alert-warning">Resistenze significative rilevate (${rPerc}%). Valutare attentamente la scelta terapeutica.</div>`;
  }

  // Detailed tables
  if (sensible.length > 0) {
    html += `<h3 class="section-subtitle" style="color:var(--success)">Antibiotici Sensibili (${sensible.length})</h3>`;
    html += buildAbTable(sensible, 'S');
  }
  if (intermediate.length > 0) {
    html += `<h3 class="section-subtitle" style="color:var(--warning)">Sensibilita Intermedia (${intermediate.length})</h3>`;
    html += buildAbTable(intermediate, 'I');
  }
  if (resistant.length > 0) {
    html += `<h3 class="section-subtitle" style="color:var(--danger)">Antibiotici Resistenti (${resistant.length})</h3>`;
    html += buildAbTable(resistant, 'R');
  }

  // Interpretation
  html += buildInterpretation(sensible, intermediate, resistant);

  // Screened species (for panels that have them, e.g. genitale, uretrale)
  const panel = SAMPLE_PANELS[state.sampleType];
  if (panel && panel.screenedSpecies) {
    html += '<div class="screened-species-box">';
    html += '<h3 class="section-subtitle" style="color:var(--primary)">Specie Ricercate (A.F. Genital System — Liofilchem ref. 74156)</h3>';
    html += '<table class="result-table"><thead><tr><th>Specie</th><th>Metodo</th><th>Esito</th></tr></thead><tbody>';
    panel.screenedSpecies.forEach(sp => {
      const isIsolated = state.organism && state.organism.toLowerCase().includes(sp.name.split(' ')[0].toLowerCase());
      const badge = isIsolated ? '<span class="sir-badge badge-r">ISOLATO</span>' : '<span class="sir-badge badge-s">Negativo</span>';
      html += `<tr><td><em>${sp.name}</em></td><td>${sp.method}</td><td>${badge}</td></tr>`;
    });
    html += '</tbody></table></div>';
  }

  el.innerHTML = html;
}

function buildAbTable(abs, sir) {
  const cls = sir === 'S' ? 'table-s' : sir === 'I' ? 'table-i' : 'table-r';
  return `<table class="result-table ${cls}">
    <thead><tr><th>Antibiotico</th><th>Classe</th><th>Nome Commerciale</th><th>MIC (ug/mL)</th><th>Breakpoint EUCAST</th><th>S/I/R</th></tr></thead>
    <tbody>${abs.map(a => {
      const bpText = formatBreakpointRange(a.bpS, a.bpR);
      return `<tr>
      <td><strong>${a.name}</strong></td>
      <td>${a.class}</td>
      <td>${a.brand}</td>
      <td>${a.mic || '\u2014'}</td>
      <td class="bp-cell-result">${bpText}</td>
      <td><span class="sir-badge badge-${sir.toLowerCase()}">${sir}</span></td>
    </tr>`;
    }).join('')}</tbody>
  </table>`;
}

function buildInterpretation(sensible, intermediate, resistant) {
  let html = '<div class="interpretation-box" id="interpretation-box">';
  html += '<h3 class="interp-title">Interpretazione Diagnostica e Suggerimento Terapeutico</h3>';

  const colonyDisplay = getColonyDisplay();
  html += `<p class="interp-text"><strong>Microrganismo isolato:</strong> <em>${state.organism}</em><br>`;
  if (colonyDisplay) html += `<strong>Carica microbica:</strong> ${colonyDisplay}<br>`;
  html += `<strong>Campione:</strong> ${getSampleLabel()}</p>`;

  if (sensible.length > 0) {
    html += '<h4 class="interp-subtitle">Antibiotici Consigliati (Sensibili)</h4>';
    html += '<div class="recommendation-grid">';
    sensible.forEach(a => {
      const micInfo = a.mic ? `MIC ${a.mic} ug/mL` : '';
      const bpInfo = formatBreakpointRange(a.bpS, a.bpR);
      html += `<div class="rec-card rec-card-s">
        <div class="rec-name">${a.name}</div>
        <div class="rec-brand">${a.brand}</div>
        <div class="rec-class">${a.class}</div>
        ${micInfo ? `<div class="rec-mic">${micInfo}</div>` : ''}
        <div class="rec-bp">BP: ${bpInfo}</div>
      </div>`;
    });
    html += '</div>';

    // Best choice
    html += '<div class="best-choice">';
    html += '<h4 class="interp-subtitle">Prima Scelta Consigliata</h4>';
    const firstChoice = pickFirstChoice(sensible);
    if (firstChoice) {
      html += `<p class="interp-text">In base al profilo di sensibilita e al tipo di campione (${getSampleLabel()}), si suggerisce come prima scelta:</p>`;
      html += `<div class="first-choice-card">
        <div class="fc-name">${firstChoice.name}</div>
        <div class="fc-brand">${firstChoice.brand}</div>
        ${firstChoice.mic ? `<div class="fc-mic">MIC: ${firstChoice.mic} ug/mL</div>` : ''}
      </div>`;
    }
    html += '</div>';
  } else {
    html += '<div class="alert alert-danger"><strong>Nessun antibiotico risulta sensibile.</strong> Si consiglia urgente consulenza infettivologica per valutare terapie combinate o antibiotici di ultima linea.</div>';
  }

  if (intermediate.length > 0) {
    html += '<h4 class="interp-subtitle">Opzioni a Sensibilita Intermedia</h4>';
    html += '<p class="interp-text">I seguenti antibiotici possono essere efficaci a dosaggio aumentato o in sedi favorevoli (es. alte concentrazioni urinarie):</p>';
    html += '<div class="interp-list">' + intermediate.map(a => `<span class="interp-pill pill-i">${a.name} (${a.brand})</span>`).join('') + '</div>';
  }

  if (resistant.length > 0) {
    html += '<h4 class="interp-subtitle">Antibiotici NON Raccomandati (Resistenti)</h4>';
    html += '<div class="interp-list">' + resistant.map(a => `<span class="interp-pill pill-r">${a.name}</span>`).join('') + '</div>';
  }

  // Resistance patterns
  const patterns = detectResistancePatterns(resistant);
  if (patterns.length > 0) {
    html += '<h4 class="interp-subtitle">Pattern di Resistenza Rilevati</h4>';
    html += '<ul class="pattern-list">' + patterns.map(p => `<li>${p}</li>`).join('') + '</ul>';
  }

  html += '<div class="interp-disclaimer"><em>Nota: L\'interpretazione e indicativa. La scelta terapeutica definitiva spetta al medico curante, tenendo conto della sede d\'infezione, delle condizioni cliniche del paziente, della farmacocinetica e delle interazioni farmacologiche. Breakpoints secondo criteri EUCAST v15.0 (2025).</em></div>';
  html += '</div>';
  return html;
}

function pickFirstChoice(sensible) {
  const priorityMap = {
    urine: ['FOS','NIT','AMX','AMC','CFX','SXT','CIP','LEV','CTX','CRO'],
    feci: ['AZI','CIP','CTX','CRO','SXT','AMC'],
    orofaringeo: ['AMX','AMC','AZI','CLA','PEN','CXM','LEV'],
    ferita: ['AMC','CXM','SXT','CLI','DOX','CIP','LEV'],
    espettorato: ['AMC','AZI','CLA','LEV','MOX','CXM','CTX'],
    genitale: ['DOX','AZI','CLA','CLI','OFX','ERY','AMC','CTX'],
    uretrale: ['DOX','AZI','CLA','CLI','OFX','ERY','AMC','CTX'],
    oculare: ['MOX','LEV','CIP','TOB','GEN','AZI','ERY','CXM','AMC'],
    sangue: ['CTX','CRO','TZP','MEM','VAN','DAP'],
    liquor: ['CTX','CRO','AMP','MEM','VAN'],
    generico: ['AMC','CIP','SXT','CTX'],
  };
  const priority = priorityMap[state.sampleType] || priorityMap.generico;
  for (const code of priority) {
    const match = sensible.find(a => a.id === code);
    if (match) return match;
  }
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

  if ((rIds.has('CTX') || rIds.has('CRO') || rIds.has('CAZ')) && !rIds.has('IMP') && !rIds.has('MEM')) {
    patterns.push('<strong>Sospetta produzione ESBL</strong> -- Resistenza a cefalosporine III gen. con sensibilita ai carbapenemi. Confermare con test fenotipico.');
  }
  if (rIds.has('IMP') || rIds.has('MEM') || rIds.has('ETP')) {
    patterns.push('<strong>Resistenza ai Carbapenemi (CRE)</strong> -- Microrganismo potenzialmente produttore di carbapenemasi. Attivare protocolli di sorveglianza e isolamento.');
  }
  if (rIds.has('OXA') && (rIds.has('PEN') || rIds.has('AMP'))) {
    patterns.push('<strong>Pattern MRSA</strong> -- Resistenza a oxacillina indica meticillino-resistenza. Considerare vancomicina, linezolid o daptomicina.');
  }
  if (rIds.has('CIP') && rIds.has('LEV')) {
    patterns.push('<strong>Resistenza ai Fluorochinoloni</strong> -- Ciprofloxacina e levofloxacina non utilizzabili.');
  }
  if (rIds.has('GEN') && rIds.has('TOB') && rIds.has('AMK')) {
    patterns.push('<strong>Resistenza a tutti gli Aminoglicosidi testati</strong> -- Possibile produzione di enzimi modificanti (AME).');
  }
  if (rIds.has('VAN') && (state.organism.toLowerCase().includes('enterococcus'))) {
    patterns.push('<strong>VRE -- Enterococco Vancomicina-Resistente</strong> -- Valutare linezolid o daptomicina. Attivare isolamento.');
  }
  return patterns;
}

function toggleInterpretation() {
  const box = document.getElementById('interpretation-box');
  if (box) box.classList.toggle('hidden');
}
