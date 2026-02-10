/* state.js — Global State, Antibiotic DB, Organisms, Sample Presets */

const state = {
  preset: null,
  sampleType: '',
  organism: '',
  colonyCount: '',
  antibiotics: [],   // current panel [{id, name, class, brand, mic, sir, breakpointS, breakpointR}]
  customAntibiotics: [],
};

/* ── Antibiotic Master Database ── */
const ANTIBIOTICS_DB = {
  // PENICILLINE
  AMP:  { name:'Ampicillina',              class:'Penicilline',         brand:'Amplital, Ampi' },
  AMX:  { name:'Amoxicillina',             class:'Penicilline',         brand:'Zimox, Velamox' },
  AMC:  { name:'Amoxicillina/Ac. Clavulanico', class:'Penicilline + Inibitore', brand:'Augmentin, Clavulin' },
  AMS:  { name:'Ampicillina/Sulbactam',    class:'Penicilline + Inibitore', brand:'Unasyn, Bethacil' },
  PIP:  { name:'Piperacillina',            class:'Penicilline',         brand:'Piperital' },
  TZP:  { name:'Piperacillina/Tazobactam', class:'Penicilline + Inibitore', brand:'Tazocin, Piperacillina/Tazob.' },
  OXA:  { name:'Oxacillina',               class:'Penicilline',         brand:'Penstapho' },
  PEN:  { name:'Penicillina G',            class:'Penicilline',         brand:'Penicillina, Benzilpenicillina' },

  // CEFALOSPORINE
  CFZ:  { name:'Cefalexina',               class:'Cefalosporine I gen', brand:'Keforal, Ceporex' },
  CXM:  { name:'Cefuroxima',               class:'Cefalosporine II gen', brand:'Zinnat, Cefurim' },
  CTX:  { name:'Cefotaxime',               class:'Cefalosporine III gen', brand:'Claforan, Zariviz' },
  CRO:  { name:'Ceftriaxone',              class:'Cefalosporine III gen', brand:'Rocefin, Fidato' },
  CAZ:  { name:'Ceftazidime',              class:'Cefalosporine III gen', brand:'Glazidim, Spectrum' },
  CFX:  { name:'Cefixime',                 class:'Cefalosporine III gen (orale)', brand:'Cefixoral, Suprax' },
  FEP:  { name:'Cefepime',                 class:'Cefalosporine IV gen', brand:'Maxipime' },
  CZA:  { name:'Ceftazidime/Avibactam',    class:'Cefalosporine + Inibitore', brand:'Zavicefta' },
  CZT:  { name:'Ceftolozane/Tazobactam',   class:'Cefalosporine + Inibitore', brand:'Zerbaxa' },

  // CARBAPENEMI
  IMP:  { name:'Imipenem',                 class:'Carbapenemi',         brand:'Tienam, Imipenem/Cilastatina' },
  MEM:  { name:'Meropenem',                class:'Carbapenemi',         brand:'Merrem' },
  ETP:  { name:'Ertapenem',                class:'Carbapenemi',         brand:'Invanz' },

  // FLUOROCHINOLONI
  CIP:  { name:'Ciprofloxacina',           class:'Fluorochinoloni',     brand:'Ciproxin' },
  LEV:  { name:'Levofloxacina',            class:'Fluorochinoloni',     brand:'Levoxacin, Tavanic' },
  NOR:  { name:'Norfloxacina',             class:'Fluorochinoloni',     brand:'Noroxin, Norflox' },
  MOX:  { name:'Moxifloxacina',            class:'Fluorochinoloni',     brand:'Avalox, Octegra' },
  NAL:  { name:'Acido Nalidixico',         class:'Chinoloni',           brand:'Negram, Nalidix' },

  // AMINOGLICOSIDI
  GEN:  { name:'Gentamicina',              class:'Aminoglicosidi',      brand:'Gentalyn, Gentamicina' },
  TOB:  { name:'Tobramicina',              class:'Aminoglicosidi',      brand:'Nebicina, Bramitob' },
  AMK:  { name:'Amikacina',                class:'Aminoglicosidi',      brand:'Amikacina, BBK8' },

  // MACROLIDI
  ERY:  { name:'Eritromicina',             class:'Macrolidi',           brand:'Eritrocina, Lauromicina' },
  AZI:  { name:'Azitromicina',             class:'Macrolidi',           brand:'Zitromax, Azitromicina' },
  CLA:  { name:'Claritromicina',           class:'Macrolidi',           brand:'Klacid, Macladin' },

  // TETRACICLINE
  TET:  { name:'Tetraciclina',             class:'Tetracicline',        brand:'Ambramicina' },
  DOX:  { name:'Doxiciclina',              class:'Tetracicline',        brand:'Bassado, Miraclin' },
  TGC:  { name:'Tigeciclina',              class:'Glicilcicline',       brand:'Tygacil' },

  // SULFAMIDICI
  SXT:  { name:'Trimetoprim/Sulfametoxazolo', class:'Sulfamidici',      brand:'Bactrim, Eusaprim' },
  TMP:  { name:'Trimetoprim',              class:'Sulfamidici',         brand:'Trimetoprim' },

  // GLICOPEPTIDI
  VAN:  { name:'Vancomicina',              class:'Glicopeptidi',        brand:'Vancocin, Vancomicina' },
  TEI:  { name:'Teicoplanina',             class:'Glicopeptidi',        brand:'Targocid, Teicoplanina' },

  // LINCOSAMIDI
  CLI:  { name:'Clindamicina',             class:'Lincosamidi',         brand:'Dalacin, Cleocin' },

  // OSSAZOLIDINONI
  LZD:  { name:'Linezolid',                class:'Ossazolidinoni',      brand:'Zyvox, Linezolid' },

  // POLIMIXINE
  COL:  { name:'Colistina',                class:'Polimixine',          brand:'Colimicina, Colistimetato' },

  // NITROFURANI
  NIT:  { name:'Nitrofurantoina',          class:'Nitrofurani',         brand:'Neofuradantin, Furadantin' },

  // FOSFOMICINA
  FOS:  { name:'Fosfomicina',              class:'Fosfomicine',         brand:'Monuril, Fosfomicina' },

  // ANSAMICINE
  RIF:  { name:'Rifampicina',              class:'Ansamicine',          brand:'Rifadin, Rifinah' },

  // ALTRI
  MTZ:  { name:'Metronidazolo',            class:'Nitroimidazoli',      brand:'Flagyl, Deflamon' },
  DAP:  { name:'Daptomicina',              class:'Lipopeptidi',         brand:'Cubicin' },
  FDC:  { name:'Acido Fusidico',           class:'Steroidi antibatterici', brand:'Fucidin' },
  MUP:  { name:'Mupirocina',               class:'Antibiotici topici',  brand:'Bactroban' },
};

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
  vaginale: {
    label: 'Tampone Vaginale',
    antibiotics: ['PEN','AMP','AMX','AMC','CXM','CTX','CRO','ERY','AZI','CLA','CLI','VAN','TEI','LZD','GEN','CIP','LEV','NIT','SXT','MTZ','DOX','TET','RIF'],
    organisms: ['Streptococcus agalactiae (Gruppo B)','Escherichia coli','Gardnerella vaginalis','Candida albicans','Candida glabrata','Staphylococcus aureus','Enterococcus faecalis','Lactobacillus spp.','Ureaplasma urealyticum','Mycoplasma hominis','Trichomonas vaginalis','Neisseria gonorrhoeae','Chlamydia trachomatis'],
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
  generico: {
    label: 'Altro Materiale',
    antibiotics: ['AMP','AMX','AMC','OXA','TZP','CXM','CTX','CRO','CAZ','FEP','IMP','MEM','ETP','CIP','LEV','GEN','TOB','AMK','ERY','AZI','CLA','CLI','VAN','TEI','LZD','SXT','NIT','FOS','COL','RIF','DOX','MTZ'],
    organisms: ['Staphylococcus aureus','Escherichia coli','Klebsiella pneumoniae','Pseudomonas aeruginosa','Enterococcus faecalis','Streptococcus pyogenes (Gruppo A)','Proteus mirabilis','Acinetobacter baumannii','Altro (specificare)'],
  },
};

/* ── Preset Cards ── */
const PRESETS = [
  { id:'urine',       name:'Urinocoltura',        icon:'🧪', desc:'IVU, cistiti, pielonefriti', color:'#2d5a3d' },
  { id:'feci',        name:'Coprocoltura',         icon:'🔬', desc:'Salmonella, Shigella, Campylobacter', color:'#8b6914' },
  { id:'orofaringeo', name:'Tampone Orofaringeo',  icon:'👅', desc:'Streptococco, Stafilococco', color:'#c4563a' },
  { id:'ferita',      name:'Tampone Ferita',       icon:'🩹', desc:'Infezioni cute e tessuti molli', color:'#6b3fa0' },
  { id:'espettorato', name:'Espettorato',          icon:'🫁', desc:'Infezioni respiratorie basse', color:'#1a6b7a' },
  { id:'vaginale',    name:'Tampone Vaginale',     icon:'🔎', desc:'Infezioni vaginali, GBS', color:'#a0527a' },
  { id:'sangue',      name:'Emocoltura',           icon:'🩸', desc:'Batteriemia, sepsi', color:'#b82020' },
  { id:'liquor',      name:'Liquor',               icon:'🧠', desc:'Meningiti, encefaliti', color:'#3a5fc4' },
  { id:'generico',    name:'Altro Materiale',      icon:'📋', desc:'Pannello generico personalizzabile', color:'#555' },
];
