# 🧫 Antibiogramma MIC

**Sistema di refertazione per esami microbiologici con antibiogramma MIC**
Interpretazione diagnostica automatica, suggerimenti terapeutici e archivio pazienti.

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?style=flat&logo=javascript&logoColor=black)
![Chart.js](https://img.shields.io/badge/Chart.js-4.4-FF6384?style=flat&logo=chart.js&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green.svg)

---

## ✨ Funzionalità

### 9 Tipi di Campione Preconfigurati
- **Urinocoltura** — IVU, cistiti, pielonefriti (25 antibiotici, 18 microrganismi)
- **Coprocoltura** — Salmonella, Shigella, Campylobacter (19 antibiotici)
- **Tampone Orofaringeo** — Streptococco, Stafilococco (22 antibiotici)
- **Tampone Ferita/Cute** — Infezioni tessuti molli (27 antibiotici)
- **Espettorato/Broncoaspirato** — Infezioni respiratorie (27 antibiotici)
- **Tampone Vaginale** — Infezioni vaginali, GBS (23 antibiotici)
- **Emocoltura** — Batteriemia, sepsi (28 antibiotici)
- **Liquor Cefalorachidiano** — Meningiti (15 antibiotici)
- **Altro Materiale** — Pannello generico personalizzabile

### Database Antibiotici Completo
- **45+ antibiotici** con principio attivo, classe farmacologica e nome commerciale italiano
- Penicilline, Cefalosporine (I-IV gen), Carbapenemi, Fluorochinoloni, Aminoglicosidi, Macrolidi, Glicopeptidi, Ossazolidinoni, Polimixine e altri
- Possibilità di aggiungere/rimuovere antibiotici dal pannello
- Aggiunta antibiotici personalizzati con nome, brand e classe

### Inserimento Antibiogramma
- Tabella organizzata per classe farmacologica
- Input MIC (µg/mL) e classificazione S/I/R
- Badge colorati in tempo reale (Sensibile/Intermedio/Resistente)
- Nome commerciale visibile per ogni antibiotico

### Interpretazione Diagnostica Automatica
- **Profilo di resistenza** con barra grafica percentuale
- **Rilevamento MDR** (Multi-Drug Resistant) con alert
- **Suggerimento prima scelta** basato su tipo di campione e profilo di sensibilità
- **Antibiotici consigliati** con nome commerciale e MIC
- **Pattern di resistenza**: ESBL, CRE (Carbapenemasi), MRSA, VRE, resistenza fluorochinoloni, pan-aminoglicosidi
- Disclaimer conforme per uso clinico

### Generazione PDF
- Report professionale su pagina A4
- Header personalizzabile con logo
- Tabella antibiogramma con badge S/I/R colorati
- Grafico donut profilo resistenza
- Interpretazione con antibiotici consigliati e nomi commerciali
- Metodica e disclaimer

### Archivio Pazienti
- Database locale (localStorage)
- Ricerca per cognome, CF, microrganismo, data
- Statistiche: referti, pazienti, microrganismi isolati
- Export/Import JSON, download PDF da cache

---

## 🚀 Utilizzo

### Apertura diretta
```
git clone https://github.com/YOUR_USER/antibiogramma-mic.git
cd antibiogramma-mic
open index.html
```

### Server locale
```bash
python -m http.server 8080    # Python
npx serve .                    # Node.js
```

### GitHub Pages
Settings → Pages → Branch: main, folder: / (root)

---

## 📁 Struttura

```
├── index.html              # Pagina principale
├── css/styles.css          # Stili completi
├── js/
│   ├── state.js            # DB antibiotici, pannelli, preset
│   ├── presets.js           # Selezione tipo campione
│   ├── config.js            # Gestione microrganismi e pannello
│   ├── navigation.js        # Navigazione sezioni
│   ├── data-entry.js        # Tabella antibiogramma
│   ├── charts.js            # Grafici resistenza (Chart.js)
│   ├── results.js           # Interpretazione diagnostica
│   ├── pdf-generator.js     # Generazione PDF (jsPDF)
│   ├── storage.js           # Persistenza impostazioni
│   ├── database.js          # Archivio pazienti/referti
│   └── init.js              # Bootstrap
├── README.md
├── LICENSE
└── .gitignore
```

---

## 🛡️ Privacy

- **Zero trasmissione dati** — tutto resta nel browser
- Funzionamento completamente offline
- Archivio esportabile come JSON

---

## 📄 Licenza

[MIT License](LICENSE)

---

*Uso clinico-laboratoristico. L'interpretazione automatica è indicativa: la scelta terapeutica spetta al medico curante. Breakpoints EUCAST.*
