/* state.js — Global State, Antibiotic DB with EUCAST Breakpoints, Organisms, Sample Presets */

const state = {
  preset: null,
  sampleType: '',
  genitaleSite: '',
  organism: '',
  colonyCount: '',
  colonyCountExp: '',
  antibiotics: [],
  customAntibiotics: [],
};

/* ── Antibiotic Master Database ──
   Breakpoints EUCAST v15.0 (2025) — Enterobacterales (default)
   bpS = MIC ≤ value → Sensibile
   bpR = MIC > value → Resistente
   Between bpS and bpR → Intermedio (sensibilita' aumentata)
*/
const ANTIBIOTICS_DB = {
  // PENICILLINE
  AMP:  { name:'Ampicillina',              class:'Penicilline',         brand:'Amplital, Ampi',                bpS:8,    bpR:8 },
  AMX:  { name:'Amoxicillina',             class:'Penicilline',         brand:'Zimox, Velamox',                bpS:8,    bpR:8 },
  AMC:  { name:'Amoxicillina/Ac. Clavulanico', class:'Penicilline + Inibitore', brand:'Augmentin, Clavulin',   bpS:8,    bpR:8 },
  AMS:  { name:'Ampicillina/Sulbactam',    class:'Penicilline + Inibitore', brand:'Unasyn, Bethacil',          bpS:8,    bpR:8 },
  PIP:  { name:'Piperacillina',            class:'Penicilline',         brand:'Piperital',                     bpS:8,    bpR:16 },
  TZP:  { name:'Piperacillina/Tazobactam', class:'Penicilline + Inibitore', brand:'Tazocin, Piperacillina/Tazob.', bpS:8, bpR:16 },
  OXA:  { name:'Oxacillina',               class:'Penicilline',         brand:'Penstapho',                     bpS:2,    bpR:2 },
  PEN:  { name:'Penicillina G',            class:'Penicilline',         brand:'Penicillina, Benzilpenicillina',bpS:0.06, bpR:0.06 },

  // CEFALOSPORINE
  CFZ:  { name:'Cefalexina',               class:'Cefalosporine I gen', brand:'Keforal, Ceporex',              bpS:16,   bpR:16 },
  CXM:  { name:'Cefuroxima',               class:'Cefalosporine II gen', brand:'Zinnat, Cefurim',              bpS:8,    bpR:8 },
  CTX:  { name:'Cefotaxime',               class:'Cefalosporine III gen', brand:'Claforan, Zariviz',           bpS:1,    bpR:2 },
  CRO:  { name:'Ceftriaxone',              class:'Cefalosporine III gen', brand:'Rocefin, Fidato',             bpS:1,    bpR:2 },
  CAZ:  { name:'Ceftazidime',              class:'Cefalosporine III gen', brand:'Glazidim, Spectrum',           bpS:1,    bpR:4 },
  CFX:  { name:'Cefixime',                 class:'Cefalosporine III gen (orale)', brand:'Cefixoral, Suprax',   bpS:1,    bpR:1 },
  FEP:  { name:'Cefepime',                 class:'Cefalosporine IV gen', brand:'Maxipime',                     bpS:1,    bpR:4 },
  CZA:  { name:'Ceftazidime/Avibactam',    class:'Cefalosporine + Inibitore', brand:'Zavicefta',               bpS:8,    bpR:8 },
  CZT:  { name:'Ceftolozane/Tazobactam',   class:'Cefalosporine + Inibitore', brand:'Zerbaxa',                 bpS:2,    bpR:2 },

  // CARBAPENEMI
  IMP:  { name:'Imipenem',                 class:'Carbapenemi',         brand:'Tienam, Imipenem/Cilastatina',  bpS:2,    bpR:4 },
  MEM:  { name:'Meropenem',                class:'Carbapenemi',         brand:'Merrem',                        bpS:2,    bpR:8 },
  ETP:  { name:'Ertapenem',                class:'Carbapenemi',         brand:'Invanz',                        bpS:0.5,  bpR:1 },

  // FLUOROCHINOLONI
  CIP:  { name:'Ciprofloxacina',           class:'Fluorochinoloni',     brand:'Ciproxin',                      bpS:0.25, bpR:0.5 },
  LEV:  { name:'Levofloxacina',            class:'Fluorochinoloni',     brand:'Levoxacin, Tavanic',            bpS:0.5,  bpR:1 },
  NOR:  { name:'Norfloxacina',             class:'Fluorochinoloni',     brand:'Noroxin, Norflox',              bpS:0.25, bpR:0.5 },
  MOX:  { name:'Moxifloxacina',            class:'Fluorochinoloni',     brand:'Avalox, Octegra',               bpS:0.25, bpR:0.25 },
  NAL:  { name:'Acido Nalidixico',         class:'Chinoloni',           brand:'Negram, Nalidix',               bpS:16,   bpR:16 },
  OFX:  { name:'Ofloxacina',              class:'Fluorochinoloni',     brand:'Oflocin, Exocin',               bpS:0.25, bpR:0.5 },
  PEF:  { name:'Pefloxacina',             class:'Fluorochinoloni',     brand:'Peflacin, Peflox',              bpS:1,    bpR:4 },

  // AMINOGLICOSIDI
  GEN:  { name:'Gentamicina',              class:'Aminoglicosidi',      brand:'Gentalyn, Gentamicina',         bpS:2,    bpR:4 },
  TOB:  { name:'Tobramicina',              class:'Aminoglicosidi',      brand:'Nebicina, Bramitob',            bpS:2,    bpR:4 },
  AMK:  { name:'Amikacina',                class:'Aminoglicosidi',      brand:'Amikacina, BBK8',               bpS:8,    bpR:16 },

  // MACROLIDI
  ERY:  { name:'Eritromicina',             class:'Macrolidi',           brand:'Eritrocina, Lauromicina',       bpS:1,    bpR:2 },
  AZI:  { name:'Azitromicina',             class:'Macrolidi',           brand:'Zitromax, Azitromicina',        bpS:0.25, bpR:0.5 },
  CLA:  { name:'Claritromicina',           class:'Macrolidi',           brand:'Klacid, Macladin',              bpS:1,    bpR:2 },
  JOS:  { name:'Josamicina',              class:'Macrolidi',           brand:'Josacine, Josamicina',          bpS:2,    bpR:8 },

  // TETRACICLINE
  TET:  { name:'Tetraciclina',             class:'Tetracicline',        brand:'Ambramicina',                   bpS:4,    bpR:4 },
  DOX:  { name:'Doxiciclina',              class:'Tetracicline',        brand:'Bassado, Miraclin',             bpS:1,    bpR:2 },
  MIN:  { name:'Minociclina',             class:'Tetracicline',        brand:'Minocin, Minociclina',          bpS:4,    bpR:8 },
  TGC:  { name:'Tigeciclina',              class:'Glicilcicline',       brand:'Tygacil',                       bpS:0.25, bpR:0.5 },

  // SULFAMIDICI
  SXT:  { name:'Trimetoprim/Sulfametoxazolo', class:'Sulfamidici',      brand:'Bactrim, Eusaprim',             bpS:2,    bpR:4 },
  TMP:  { name:'Trimetoprim',              class:'Sulfamidici',         brand:'Trimetoprim',                   bpS:2,    bpR:4 },

  // GLICOPEPTIDI
  VAN:  { name:'Vancomicina',              class:'Glicopeptidi',        brand:'Vancocin, Vancomicina',         bpS:2,    bpR:2 },
  TEI:  { name:'Teicoplanina',             class:'Glicopeptidi',        brand:'Targocid, Teicoplanina',        bpS:2,    bpR:2 },

  // LINCOSAMIDI
  CLI:  { name:'Clindamicina',             class:'Lincosamidi',         brand:'Dalacin, Cleocin',              bpS:0.25, bpR:0.5 },

  // OSSAZOLIDINONI
  LZD:  { name:'Linezolid',                class:'Ossazolidinoni',      brand:'Zyvox, Linezolid',              bpS:4,    bpR:4 },

  // POLIMIXINE
  COL:  { name:'Colistina',                class:'Polimixine',          brand:'Colimicina, Colistimetato',     bpS:2,    bpR:2 },

  // NITROFURANI
  NIT:  { name:'Nitrofurantoina',          class:'Nitrofurani',         brand:'Neofuradantin, Furadantin',     bpS:64,   bpR:64 },

  // FOSFOMICINA
  FOS:  { name:'Fosfomicina',              class:'Fosfomicine',         brand:'Monuril, Fosfomicina',          bpS:8,    bpR:8 },

  // ANSAMICINE
  RIF:  { name:'Rifampicina',              class:'Ansamicine',          brand:'Rifadin, Rifinah',              bpS:0.06, bpR:0.5 },

  // ALTRI
  MTZ:  { name:'Metronidazolo',            class:'Nitroimidazoli',      brand:'Flagyl, Deflamon',              bpS:4,    bpR:4 },
  DAP:  { name:'Daptomicina',              class:'Lipopeptidi',         brand:'Cubicin',                       bpS:1,    bpR:1 },
  FDC:  { name:'Acido Fusidico',           class:'Steroidi antibatterici', brand:'Fucidin',                    bpS:1,    bpR:1 },
  MUP:  { name:'Mupirocina',               class:'Antibiotici topici',  brand:'Bactroban',                     bpS:1,    bpR:256 },
};

/* ── Organism-specific Breakpoint Overrides (EUCAST) ── */
const ORGANISM_BP = {
  PEN:  { 'staphylococcus': { bpS:0.12, bpR:0.12 }, 'streptococcus pneumoniae': { bpS:0.06, bpR:2 }, 'streptococcus pyogenes': { bpS:0.25, bpR:0.25 } },
  OXA:  { 'staphylococcus aureus': { bpS:2, bpR:2 }, 'staphylococcus epidermidis': { bpS:0.25, bpR:0.25 } },
  AMP:  { 'enterococcus': { bpS:4, bpR:8 }, 'haemophilus': { bpS:1, bpR:1 } },
  AMC:  { 'staphylococcus': { bpS:0.25, bpR:0.25 } },
  VAN:  { 'enterococcus': { bpS:4, bpR:4 }, 'staphylococcus': { bpS:2, bpR:2 } },
  TEI:  { 'enterococcus': { bpS:2, bpR:2 }, 'staphylococcus': { bpS:2, bpR:4 } },
  ERY:  { 'staphylococcus': { bpS:1, bpR:2 }, 'streptococcus': { bpS:0.25, bpR:0.5 } },
  CLI:  { 'staphylococcus': { bpS:0.25, bpR:0.5 }, 'streptococcus': { bpS:0.5, bpR:0.5 } },
  TZP:  { 'pseudomonas': { bpS:16, bpR:16 } },
  CAZ:  { 'pseudomonas': { bpS:8, bpR:8 } },
  FEP:  { 'pseudomonas': { bpS:8, bpR:8 } },
  IMP:  { 'pseudomonas': { bpS:4, bpR:4 } },
  CIP:  { 'pseudomonas': { bpS:0.25, bpR:0.5 }, 'staphylococcus': { bpS:1, bpR:1 } },
  GEN:  { 'pseudomonas': { bpS:4, bpR:4 }, 'staphylococcus': { bpS:1, bpR:1 } },
  TOB:  { 'pseudomonas': { bpS:2, bpR:4 }, 'staphylococcus': { bpS:1, bpR:1 } },
  LZD:  { 'staphylococcus': { bpS:4, bpR:4 }, 'enterococcus': { bpS:4, bpR:4 } },
  DAP:  { 'staphylococcus': { bpS:1, bpR:1 }, 'enterococcus': { bpS:4, bpR:4 } },
  RIF:  { 'staphylococcus': { bpS:0.06, bpR:0.5 } },
  SXT:  { 'staphylococcus': { bpS:2, bpR:4 }, 'streptococcus pneumoniae': { bpS:1, bpR:2 } },
  NIT:  { 'enterococcus faecalis': { bpS:64, bpR:64 } },
  COL:  { 'pseudomonas': { bpS:2, bpR:2 }, 'acinetobacter': { bpS:2, bpR:2 } },
};

/* Helper: get breakpoints for a specific antibiotic + organism */
function getBreakpoints(abCode, organism) {
  const ab = ANTIBIOTICS_DB[abCode];
  if (!ab) return { bpS: null, bpR: null };
  let bpS = ab.bpS, bpR = ab.bpR;
  const overrides = ORGANISM_BP[abCode];
  if (overrides && organism) {
    const orgLower = organism.toLowerCase();
    for (const [pattern, bp] of Object.entries(overrides)) {
      if (orgLower.includes(pattern)) { bpS = bp.bpS; bpR = bp.bpR; break; }
    }
  }
  return { bpS, bpR };
}

/* Helper: format breakpoint range for display */
function formatBreakpointRange(bpS, bpR) {
  if (bpS == null && bpR == null) return '\u2014';
  if (bpS === bpR) return 'S \u2264' + bpS + ' | R >' + bpS;
  return 'S \u2264' + bpS + ' | I ' + bpS + '-' + bpR + ' | R >' + bpR;
}

/* Helper: auto-classify S/I/R from MIC value */
function autoClassify(micVal, bpS, bpR) {
  const mic = parseFloat(micVal);
  if (isNaN(mic) || bpS == null) return '';
  if (mic <= bpS) return 'S';
  if (bpS !== bpR && mic <= bpR) return 'I';
  return 'R';
}

/* ── Default Panels per Tipo di Campione ── */
const SAMPLE_PANELS = {
  urine: {
    label: 'Urinocoltura',
    antibiotics: ['AMP','AMX','AMC','CFZ','CXM','CFX','CTX','CRO','CAZ','FEP','ETP','IMP','MEM','CIP','LEV','NOR','GEN','TOB','AMK','SXT','TMP','NIT','FOS','TZP','COL'],
    organisms: ['Escherichia coli','Klebsiella pneumoniae','Proteus mirabilis','Proteus vulgaris','Enterococcus faecalis','Enterococcus faecium','Pseudomonas aeruginosa','Enterobacter cloacae','Enterobacter aerogenes','Citrobacter freundii','Citrobacter koseri','Serratia marcescens','Morganella morganii','Staphylococcus saprophyticus','Staphylococcus aureus','Candida albicans','Candida spp.','Streptococcus agalactiae (Gruppo B)'],
  },
  feci: {
    label: 'Coprocoltura',
    antibiotics: ['AMP','AMC','CTX','CRO','CAZ','CIP','LEV','SXT','GEN','AMK','TZP','IMP','MEM','ETP','TET','COL','AZI','NOR','MTZ'],
    organisms: ['Salmonella spp.','Salmonella typhimurium','Salmonella enteritidis','Shigella spp.','Shigella flexneri','Shigella sonnei','Campylobacter jejuni','Campylobacter coli','Yersinia enterocolitica','Escherichia coli O157:H7','Escherichia coli (EPEC/ETEC)','Clostridioides difficile','Staphylococcus aureus','Vibrio cholerae'],
  },
  orofaringeo: {
    label: 'Tampone Orofaringeo',
    antibiotics: ['PEN','AMP','AMX','AMC','CXM','CTX','CRO','ERY','AZI','CLA','CLI','VAN','TEI','LZD','LEV','MOX','SXT','RIF','OXA','TET','DOX','GEN'],
    organisms: ['Streptococcus pyogenes (Gruppo A)','Streptococcus pneumoniae','Streptococcus agalactiae (Gruppo B)','Staphylococcus aureus','Staphylococcus aureus (MRSA)','Haemophilus influenzae','Moraxella catarrhalis','Neisseria meningitidis','Candida albicans','Corynebacterium diphtheriae','Enterococcus faecalis'],
  },
  ferita: {
    label: 'Tampone Ferita / Cute',
    antibiotics: ['OXA','AMP','AMC','AMS','CXM','CTX','CRO','FEP','CIP','LEV','GEN','TOB','AMK','SXT','CLI','ERY','VAN','TEI','LZD','RIF','DAP','FDC','MUP','DOX','TZP','IMP','MEM'],
    organisms: ['Staphylococcus aureus','Staphylococcus aureus (MRSA)','Staphylococcus epidermidis','Streptococcus pyogenes (Gruppo A)','Streptococcus agalactiae (Gruppo B)','Pseudomonas aeruginosa','Escherichia coli','Klebsiella pneumoniae','Proteus mirabilis','Enterococcus faecalis','Enterobacter cloacae','Acinetobacter baumannii','Serratia marcescens'],
  },
  espettorato: {
    label: 'Espettorato / Broncoaspirato',
    antibiotics: ['AMP','AMC','TZP','CXM','CTX','CRO','CAZ','FEP','IMP','MEM','ETP','CIP','LEV','MOX','GEN','TOB','AMK','ERY','AZI','CLA','SXT','CLI','VAN','LZD','COL','OXA','RIF'],
    organisms: ['Streptococcus pneumoniae','Haemophilus influenzae','Moraxella catarrhalis','Staphylococcus aureus','Staphylococcus aureus (MRSA)','Pseudomonas aeruginosa','Klebsiella pneumoniae','Escherichia coli','Enterobacter cloacae','Acinetobacter baumannii','Stenotrophomonas maltophilia','Serratia marcescens','Mycobacterium tuberculosis'],
  },
  genitale: {
    label: 'Tampone Genitale',
    subSites: ['Vaginale', 'Cervicale', 'Vaginale + Cervicale', 'Uretrale', 'Prepuziale', 'Glande', 'Altra sede genitale'],
    antibiotics: ['PEN','AMP','AMX','AMC','CXM','CTX','CRO','ERY','AZI','CLA','CLI','VAN','TEI','LZD','GEN','CIP','LEV','NIT','SXT','MTZ','DOX','TET','RIF','OFX','PEF','MIN','JOS'],
    organisms: ['Ureaplasma spp.','Mycoplasma hominis','Trichomonas vaginalis','Escherichia coli','Proteus spp.','Providencia spp.','Pseudomonas spp.','Gardnerella vaginalis','Staphylococcus aureus','Enterococcus faecalis','Neisseria gonorrhoeae','Streptococcus agalactiae (Gruppo B)','Candida albicans','Candida spp.','Chlamydia trachomatis','Lactobacillus spp.'],
    screenedSpecies: [
      { name: 'Ureaplasma spp.', method: 'A.F. Genital System' },
      { name: 'Mycoplasma hominis', method: 'A.F. Genital System' },
      { name: 'Trichomonas vaginalis', method: 'Esame microscopico' },
      { name: 'Escherichia coli', method: 'A.F. Genital System' },
      { name: 'Proteus spp. / Providencia spp.', method: 'A.F. Genital System' },
      { name: 'Pseudomonas spp.', method: 'A.F. Genital System' },
      { name: 'Gardnerella vaginalis', method: 'A.F. Genital System' },
      { name: 'Staphylococcus aureus', method: 'A.F. Genital System' },
      { name: 'Enterococcus faecalis', method: 'A.F. Genital System' },
      { name: 'Neisseria gonorrhoeae', method: 'A.F. Genital System' },
      { name: 'Streptococcus agalactiae (Gruppo B)', method: 'A.F. Genital System' },
      { name: 'Candida spp.', method: 'A.F. Genital System' },
    ],
  },
  sangue: {
    label: 'Emocoltura',
    antibiotics: ['PEN','AMP','AMC','OXA','TZP','CTX','CRO','CAZ','FEP','CZA','IMP','MEM','ETP','CIP','LEV','GEN','TOB','AMK','ERY','CLI','VAN','TEI','LZD','DAP','SXT','RIF','COL','TGC'],
    organisms: ['Staphylococcus aureus','Staphylococcus aureus (MRSA)','Staphylococcus epidermidis','Enterococcus faecalis','Enterococcus faecium','Escherichia coli','Klebsiella pneumoniae','Pseudomonas aeruginosa','Acinetobacter baumannii','Enterobacter cloacae','Serratia marcescens','Streptococcus pneumoniae','Streptococcus pyogenes (Gruppo A)','Candida albicans'],
  },
  liquor: {
    label: 'Liquor Cefalorachidiano',
    antibiotics: ['PEN','AMP','CTX','CRO','MEM','CIP','LEV','VAN','LZD','GEN','AMK','SXT','RIF','CLI','CXM'],
    organisms: ['Neisseria meningitidis','Streptococcus pneumoniae','Haemophilus influenzae','Listeria monocytogenes','Escherichia coli','Staphylococcus aureus','Streptococcus agalactiae (Gruppo B)','Enterococcus faecalis','Cryptococcus neoformans'],
  },
  oculare: {
    label: 'Tampone Oculare',
    antibiotics: ['AMC','AMP','CXM','CTX','CRO','CFX','CIP','LEV','MOX','NOR','GEN','TOB','AMK','ERY','AZI','CLA','CLI','SXT','OXA','VAN','TEI','FDC','RIF','DOX','TET'],
    organisms: ['Staphylococcus aureus','Staphylococcus aureus (MRSA)','Staphylococcus epidermidis','Streptococcus pneumoniae','Streptococcus pyogenes (Gruppo A)','Haemophilus influenzae','Moraxella catarrhalis','Pseudomonas aeruginosa','Neisseria gonorrhoeae','Chlamydia trachomatis','Serratia marcescens','Enterobacter cloacae','Escherichia coli','Corynebacterium spp.','Candida albicans'],
  },
  generico: {
    label: 'Altro Materiale',
    antibiotics: ['AMP','AMX','AMC','OXA','TZP','CXM','CTX','CRO','CAZ','FEP','IMP','MEM','ETP','CIP','LEV','GEN','TOB','AMK','ERY','AZI','CLA','CLI','VAN','TEI','LZD','SXT','NIT','FOS','COL','RIF','DOX','MTZ'],
    organisms: ['Staphylococcus aureus','Escherichia coli','Klebsiella pneumoniae','Pseudomonas aeruginosa','Enterococcus faecalis','Streptococcus pyogenes (Gruppo A)','Proteus mirabilis','Acinetobacter baumannii','Altro (specificare)'],
  },
};

/* ── Custom Antibiotic Panels (user-created, saved in localStorage) ──
   Format: { id, name, antibiotics: [codes], associatedExams: [preset ids] }
*/
function getCustomPanels() {
  try { const r = localStorage.getItem('abg_custom_panels'); return r ? JSON.parse(r) : []; }
  catch(e) { return []; }
}
function saveCustomPanels(panels) {
  try { localStorage.setItem('abg_custom_panels', JSON.stringify(panels)); } catch(e) {}
}

/* ── Preset Cards ── */
const PRESETS = [
  { id:'urine',       name:'Urinocoltura',        icon:'U',  desc:'IVU, cistiti, pielonefriti', color:'#2d5a3d' },
  { id:'feci',        name:'Coprocoltura',         icon:'C',  desc:'Salmonella, Shigella, Campylobacter', color:'#8b6914' },
  { id:'orofaringeo', name:'Tampone Orofaringeo',  icon:'O',  desc:'Streptococco, Stafilococco', color:'#c4563a' },
  { id:'ferita',      name:'Tampone Ferita',       icon:'F',  desc:'Infezioni cute e tessuti molli', color:'#6b3fa0' },
  { id:'espettorato', name:'Espettorato',          icon:'E',  desc:'Infezioni respiratorie basse', color:'#1a6b7a' },
  { id:'genitale',    name:'Tampone Genitale',    icon:'G',  desc:'Vaginale, cervicale, prepuziale — Kit A.F. Genital System', color:'#a0527a' },
  { id:'oculare',     name:'Tampone Oculare',      icon:'Oc', desc:'Congiuntiviti, cheratiti, dacriocistiti', color:'#2980b9' },
  { id:'sangue',      name:'Emocoltura',           icon:'S',  desc:'Batteriemia, sepsi', color:'#b82020' },
  { id:'liquor',      name:'Liquor',               icon:'L',  desc:'Meningiti, encefaliti', color:'#3a5fc4' },
  { id:'generico',    name:'Altro Materiale',      icon:'A',  desc:'Pannello generico personalizzabile', color:'#555' },
];
