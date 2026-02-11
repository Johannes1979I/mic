/* pdf-generator.js — Single-Page PDF Antibiogram Report — NO EMOJI (jsPDF safe) */

async function loadJsPDF() {
  if (window.jspdf && window.jspdf.jsPDF) return window.jspdf.jsPDF;
  throw new Error('jsPDF non disponibile');
}

async function generatePDF() {
  const btn = document.getElementById('btn-gen-pdf');
  btn.disabled = true; btn.textContent = 'Generazione in corso...';

  try {
    const jsPDF = await loadJsPDF();
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pw = 210, ph = 297, mx = 12, my = 10;
    const cw = pw - 2 * mx;
    let y = my;

    // Header image
    const headerImg = document.getElementById('header-preview');
    if (headerImg && !headerImg.classList.contains('hidden') && headerImg.src) {
      try { doc.addImage(headerImg.src, 'PNG', mx, y, cw, 18); y += 22; }
      catch(e) { /* skip */ }
    }

    // Title
    const title = document.getElementById('pdf-title').value || 'Referto Esame Microbiologico con Antibiogramma';
    doc.setFont('helvetica', 'bold'); doc.setFontSize(13);
    doc.setTextColor(45, 90, 61);
    doc.text(title, pw / 2, y, { align: 'center' }); y += 7;

    // Separator
    doc.setDrawColor(45, 90, 61); doc.setLineWidth(0.5);
    doc.line(mx, y, pw - mx, y); y += 4;

    // Patient data (compact 2-col)
    doc.setFontSize(7.5); doc.setTextColor(60, 60, 60); doc.setFont('helvetica', 'normal');
    const fields = [
      ['Cognome', document.getElementById('pt-cognome').value],
      ['Nome', document.getElementById('pt-nome').value],
      ['Data Nascita', document.getElementById('pt-dob').value],
      ['Sesso', document.getElementById('pt-sesso').value],
      ['Codice Fiscale', document.getElementById('pt-cf').value],
      ['Data Esame', document.getElementById('pt-data-esame').value],
      ['Medico', document.getElementById('pt-medico').value],
      ['N. Accettazione', document.getElementById('pt-accettazione').value],
    ];
    const colW = cw / 2;
    for (let i = 0; i < fields.length; i += 2) {
      const lx = mx, rx = mx + colW;
      doc.setFont('helvetica', 'bold'); doc.text(fields[i][0] + ':', lx, y);
      doc.setFont('helvetica', 'normal'); doc.text(fields[i][1] || '--', lx + 24, y);
      if (fields[i + 1]) {
        doc.setFont('helvetica', 'bold'); doc.text(fields[i+1][0] + ':', rx, y);
        doc.setFont('helvetica', 'normal'); doc.text(fields[i+1][1] || '--', rx + 24, y);
      }
      y += 3.8;
    }
    y += 1;

    // Sample info box
    const colonyDisplay = getColonyDisplay();
    doc.setFillColor(240, 245, 240); doc.roundedRect(mx, y, cw, 10, 1.5, 1.5, 'F');
    doc.setFont('helvetica', 'bold'); doc.setFontSize(8); doc.setTextColor(45, 90, 61);
    doc.text('Campione: ', mx + 3, y + 4);
    doc.setFont('helvetica', 'normal'); doc.setTextColor(30, 30, 30);
    doc.text(getSampleLabel(), mx + 22, y + 4);
    doc.setFont('helvetica', 'bold'); doc.setTextColor(45, 90, 61);
    doc.text('Microrganismo isolato: ', mx + 3, y + 8);
    doc.setFont('helvetica', 'normal'); doc.setTextColor(30, 30, 30);
    doc.text(state.organism, mx + 40, y + 8);
    if (colonyDisplay) {
      doc.setFont('helvetica', 'bold'); doc.setTextColor(45, 90, 61);
      doc.text('Carica: ', mx + colW + 10, y + 4);
      doc.setFont('helvetica', 'normal'); doc.setTextColor(30, 30, 30);
      doc.text(colonyDisplay, mx + colW + 24, y + 4);
    }
    y += 13;

    // Antibiogram table
    const filled = state.antibiotics.filter(a => a.sir);
    const includeGraph = document.getElementById('pdf-include-graph')?.checked;
    const includeInterp = document.getElementById('pdf-include-interp')?.checked;

    // Detect method: if ANY antibiotic has a numeric MIC → MIC method; otherwise → Kirby-Bauer
    const hasMicValues = filled.some(a => a.mic && a.mic.trim() !== '');
    const isKirbyBauer = !hasMicValues;

    // Table header — adapt columns based on method
    doc.setFillColor(45, 90, 61); doc.rect(mx, y, cw, 5, 'F');
    doc.setFont('helvetica', 'bold'); doc.setFontSize(6); doc.setTextColor(255, 255, 255);

    if (isKirbyBauer) {
      // Kirby-Bauer: no MIC, no Breakpoint columns — wider spacing
      const kbCols = [mx + 2, mx + 50, mx + 90, mx + 130, mx + 160];
      doc.text('Antibiotico', kbCols[0], y + 3.5);
      doc.text('Classe', kbCols[1], y + 3.5);
      doc.text('N. Commerciale', kbCols[2], y + 3.5);
      doc.text('S/I/R', kbCols[3], y + 3.5);
      doc.text('Interpretaz.', kbCols[4], y + 3.5);
      y += 5;

      doc.setFontSize(5.5); doc.setTextColor(30, 30, 30);
      filled.forEach((a, idx) => {
        if (y > ph - 40) { doc.addPage(); y = my; }
        const bg = idx % 2 === 0 ? [250, 250, 250] : [255, 255, 255];
        doc.setFillColor(...bg); doc.rect(mx, y, cw, 4.2, 'F');

        doc.setFont('helvetica', 'bold'); doc.text(a.name.substring(0, 32), kbCols[0], y + 3);
        doc.setFont('helvetica', 'normal');
        doc.text((a.class || '').substring(0, 24), kbCols[1], y + 3);
        doc.text((a.brand || '').substring(0, 22), kbCols[2], y + 3);

        // S/I/R badge
        const sirColor = a.sir === 'S' ? [39, 174, 96] : a.sir === 'I' ? [243, 156, 18] : [231, 76, 60];
        doc.setFillColor(...sirColor);
        doc.roundedRect(kbCols[3], y + 0.5, 8, 3.2, 0.8, 0.8, 'F');
        doc.setTextColor(255, 255, 255); doc.setFont('helvetica', 'bold');
        doc.text(a.sir, kbCols[3] + 2.5, y + 3);
        doc.setTextColor(30, 30, 30); doc.setFont('helvetica', 'normal');

        const interpText = a.sir === 'S' ? 'Sensibile' : a.sir === 'I' ? 'Intermedio' : 'Resistente';
        doc.text(interpText, kbCols[4], y + 3);
        y += 4.2;
      });

    } else {
      // MIC method: full table with MIC + Breakpoint columns
      const cols = [mx + 2, mx + 42, mx + 72, mx + 96, mx + 114, mx + 138, mx + 157];
      doc.text('Antibiotico', cols[0], y + 3.5);
      doc.text('Classe', cols[1], y + 3.5);
      doc.text('N. Commerciale', cols[2], y + 3.5);
      doc.text('MIC (ug/mL)', cols[3], y + 3.5);
      doc.text('Breakpoint EUCAST', cols[4], y + 3.5);
      doc.text('S/I/R', cols[5], y + 3.5);
      doc.text('Interpretaz.', cols[6], y + 3.5);
      y += 5;

      doc.setFontSize(5.5); doc.setTextColor(30, 30, 30);
      filled.forEach((a, idx) => {
        if (y > ph - 40) { doc.addPage(); y = my; }
        const bg = idx % 2 === 0 ? [250, 250, 250] : [255, 255, 255];
        doc.setFillColor(...bg); doc.rect(mx, y, cw, 4.2, 'F');

        doc.setFont('helvetica', 'bold'); doc.text(a.name.substring(0, 28), cols[0], y + 3);
        doc.setFont('helvetica', 'normal');
        doc.text((a.class || '').substring(0, 20), cols[1], y + 3);
        doc.text((a.brand || '').substring(0, 18), cols[2], y + 3);
        doc.text(a.mic || '--', cols[3], y + 3);

        // Breakpoint text
        const bpS = a.bpS, bpR = a.bpR;
        let bpText = '--';
        if (bpS != null) {
          if (bpS === bpR) bpText = 'S<=' + bpS + ' R>' + bpS;
          else bpText = 'S<=' + bpS + ' I ' + bpS + '-' + bpR + ' R>' + bpR;
        }
        doc.setFontSize(5); doc.text(bpText, cols[4], y + 3); doc.setFontSize(5.5);

        // S/I/R badge
        const sirColor = a.sir === 'S' ? [39, 174, 96] : a.sir === 'I' ? [243, 156, 18] : [231, 76, 60];
        doc.setFillColor(...sirColor);
        doc.roundedRect(cols[5], y + 0.5, 8, 3.2, 0.8, 0.8, 'F');
        doc.setTextColor(255, 255, 255); doc.setFont('helvetica', 'bold');
        doc.text(a.sir, cols[5] + 2.5, y + 3);
        doc.setTextColor(30, 30, 30); doc.setFont('helvetica', 'normal');

        const interpText = a.sir === 'S' ? 'Sensibile' : a.sir === 'I' ? 'Intermedio' : 'Resistente';
        doc.text(interpText, cols[6], y + 3);
        y += 4.2;
      });
    }
    y += 3;

    // Chart
    if (includeGraph && typeof Chart !== 'undefined') {
      try {
        const chartImg = await renderChartToImage('donut');
        const chartSize = 50;
        if (y + chartSize + 5 < ph - 30) {
          doc.addImage(chartImg, 'PNG', pw / 2 - chartSize / 2, y, chartSize, chartSize);
          y += chartSize + 4;
        }
      } catch(e) { /* skip */ }
    }

    // Interpretation — ALL PLAIN TEXT, NO EMOJI
    if (includeInterp) {
      const sensible = filled.filter(a => a.sir === 'S');
      const resistant = filled.filter(a => a.sir === 'R');
      const rPerc = filled.length ? Math.round(resistant.length / filled.length * 100) : 0;

      if (y + 20 > ph - 15) { doc.addPage(); y = my; }

      doc.setFillColor(240, 248, 240); doc.roundedRect(mx, y, cw, 4, 1, 1, 'F');
      doc.setFont('helvetica', 'bold'); doc.setFontSize(7.5); doc.setTextColor(45, 90, 61);
      doc.text('INTERPRETAZIONE E SUGGERIMENTO TERAPEUTICO', mx + 3, y + 3); y += 6;

      doc.setFontSize(6.5); doc.setTextColor(30, 30, 30); doc.setFont('helvetica', 'normal');

      if (rPerc >= 50) {
        doc.setTextColor(200, 0, 0); doc.setFont('helvetica', 'bold');
        doc.text('ATTENZIONE: Profilo Multi-Drug Resistant (MDR) - Resistente al ' + rPerc + '% degli antibiotici testati.', mx + 2, y);
        y += 4; doc.setTextColor(30, 30, 30); doc.setFont('helvetica', 'normal');
      }

      if (sensible.length > 0) {
        doc.setFont('helvetica', 'bold');
        doc.text('Antibiotici consigliati (Sensibili):', mx + 2, y); y += 3.5;
        doc.setFont('helvetica', 'normal');

        sensible.forEach(a => {
          if (y > ph - 15) { doc.addPage(); y = my; }
          let line = '  - ' + a.name + ' (' + a.brand + ')';
          if (!isKirbyBauer && a.mic) line += ' -- MIC: ' + a.mic + ' ug/mL';
          if (!isKirbyBauer) {
            const bpS = a.bpS, bpR = a.bpR;
            if (bpS != null) {
              if (bpS === bpR) line += ' [BP: S<=' + bpS + ' R>' + bpS + ']';
              else line += ' [BP: S<=' + bpS + ' I ' + bpS + '-' + bpR + ' R>' + bpR + ']';
            }
          }
          doc.text(line, mx + 4, y); y += 3.2;
        });
        y += 1;

        const first = pickFirstChoice(sensible);
        if (first) {
          doc.setFont('helvetica', 'bold'); doc.setTextColor(45, 90, 61);
          doc.text('PRIMA SCELTA CONSIGLIATA: ' + first.name + ' (' + first.brand + ')', mx + 2, y);
          y += 4; doc.setTextColor(30, 30, 30); doc.setFont('helvetica', 'normal');
        }
      } else {
        doc.setTextColor(200, 0, 0);
        doc.text('Nessun antibiotico sensibile - consulenza infettivologica urgente raccomandata.', mx + 2, y);
        y += 4; doc.setTextColor(30, 30, 30);
      }

      // Patterns
      const patterns = detectResistancePatterns(resistant);
      if (patterns.length > 0 && y + patterns.length * 4 < ph - 15) {
        doc.setFont('helvetica', 'bold');
        doc.text('Pattern di resistenza:', mx + 2, y); y += 3.5;
        doc.setFont('helvetica', 'normal');
        patterns.forEach(p => {
          const clean = p.replace(/<[^>]+>/g, '').replace(/--/g, '-');
          const lines = doc.splitTextToSize(clean, cw - 8);
          lines.forEach(l => { if (y > ph - 12) { doc.addPage(); y = my; } doc.text(l, mx + 4, y); y += 3; });
        });
      }
    }

    // Methodology — auto-adapt based on method
    const methodology = document.getElementById('methodology').value;
    if (y + 8 < ph - 12) {
      y += 2;
      doc.setFontSize(5.5); doc.setTextColor(120, 120, 120);
      let methText;
      if (isKirbyBauer) {
        methText = 'Metodica: Antibiogramma qualitativo con metodo di diffusione in agar (Kirby-Bauer). Interpretazione secondo criteri EUCAST v15.0 (2025).';
      } else {
        methText = methodology ? 'Metodica: ' + methodology.replace(/\n/g, ' | ').substring(0, 180)
          : 'Metodica: Determinazione MIC (Concentrazione Minima Inibente). Breakpoints EUCAST v15.0 (2025).';
      }
      doc.text(methText, mx, y);
      y += 4;
    }

    // Disclaimer
    doc.setFontSize(5); doc.setTextColor(150, 150, 150);
    const discl = isKirbyBauer
      ? 'La scelta terapeutica definitiva spetta al medico curante. Metodo Kirby-Bauer, interpretazione EUCAST v15.0 (2025).'
      : 'La scelta terapeutica definitiva spetta al medico curante. Breakpoints EUCAST v15.0 (2025). Interpretazione automatica indicativa.';
    doc.text(discl, mx, ph - 8);

    // Footer
    const pages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pages; i++) {
      doc.setPage(i);
      doc.setFontSize(5); doc.setTextColor(170, 170, 170);
      doc.text('Generato il ' + new Date().toLocaleDateString('it-IT') + ' - Pag. ' + i + '/' + pages, pw / 2, ph - 4, { align: 'center' });
    }

    // Output
    const pdfData = doc.output('datauristring');
    showPdfPreview(pdfData);
    autoSaveReport(pdfData);

    const nome = document.getElementById('pt-cognome').value || 'Paziente';
    doc.save('Antibiogramma_' + nome + '_' + new Date().toISOString().split('T')[0] + '.pdf');

  } catch(e) {
    alert('Errore generazione PDF: ' + e.message);
    console.error(e);
  } finally {
    btn.disabled = false;
    btn.textContent = 'Genera PDF';
  }
}

function showPdfPreview(dataUri) {
  const container = document.getElementById('pdf-preview');
  if (container) {
    container.innerHTML = `<iframe src="${dataUri}" style="width:100%;height:500px;border:1px solid var(--border-light);border-radius:8px"></iframe>`;
    container.classList.remove('hidden');
  }
}
