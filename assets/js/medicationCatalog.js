/* ==========================================================================
   SARONIL HIS — MEDICATION CATALOG (medicationCatalog.js)
   Builds window.medicationCatalog with ~60,000 Indian-market formulations,
   aligned to NLEM 2022 categories and CDSCO drug schedules (H / H1 / X / OTC).
   Every record carries the full field set consumed by EMR prescribing,
   pharmacy dispensing and inventory:
     brandName, genericName, saltComposition, strength, dosageForm, route,
     price, category, code, manufacturer, schedule, hsnCode, minStock, stock,
     batch, expiry
   Deterministic (seeded by record index) so the catalog is stable across
   reloads. Loaded BEFORE prescriptionWorkflow.js, which appends its curated
   brand shortlist and seeds state.inventory.pharmacy from this catalog.
   ========================================================================== */

(function () {
  'use strict';

  /* ── Deterministic PRNG (mulberry32) ───────────────────────────────────── */
  function mulberry32(seed) {
    return function () {
      seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  const pick = (rng, arr) => arr[Math.floor(rng() * arr.length) % arr.length];
  const between = (rng, lo, hi) => lo + Math.floor(rng() * (hi - lo + 1));
  const round5 = (n) => Math.max(1, Math.round(n / 5) * 5 - 1); // ₹ realism (…9, …4)

  /* ── HSN codes by kind (CDSCO/GST pharma chapter 30) ───────────────────── */
  const HSN = {
    tab: '30049099', cap: '30049099', syrup: '30049069', inj: '30042099',
    iv: '30049099', insulin: '30043100', topical: '30049099', eye: '30049099',
    resp: '30049099', vitamin: '30045000', ors: '21069099'
  };

  /* ── Form / route templates by kind ────────────────────────────────────── */
  const FORMS = {
    tab:     [['Tablet', 'PO'], ['Tablet DT', 'PO']],
    cap:     [['Capsule', 'PO'], ['Capsule SR', 'PO']],
    syrup:   [['Syrup', 'PO'], ['Suspension', 'PO']],
    inj:     [['Injection', 'IV'], ['Injection', 'IM']],
    iv:      [['IV Fluid', 'IV']],
    insulin: [['Injection', 'SC']],
    topical: [['Cream', 'Topical'], ['Ointment', 'Topical'], ['Gel', 'Topical']],
    eye:     [['Eye Drops', 'Ophthalmic']],
    resp:    [['Respule', 'Inhalation'], ['Rotacap', 'Inhalation'], ['Inhaler', 'Inhalation']],
    vitamin: [['Tablet', 'PO'], ['Capsule', 'PO']],
    ors:     [['Sachet', 'PO']]
  };

  /* base price band (₹) per kind, before strength scaling */
  const PRICE = {
    tab: [8, 90], cap: [12, 140], syrup: [40, 180], inj: [30, 900],
    iv: [35, 120], insulin: [180, 1600], topical: [45, 320], eye: [60, 380],
    resp: [120, 620], vitamin: [30, 260], ors: [12, 45]
  };

  /* ── Indian pharma manufacturers ───────────────────────────────────────── */
  const MFRS = [
    'Cipla Ltd', 'Sun Pharmaceutical', "Dr. Reddy's Laboratories", 'Lupin Ltd',
    'Mankind Pharma', 'Alkem Laboratories', 'Torrent Pharmaceuticals',
    'Zydus Healthcare', 'Glenmark Pharmaceuticals', 'Aurobindo Pharma',
    'Abbott Healthcare', 'GSK Pharmaceuticals', 'Pfizer Ltd', 'Intas Pharmaceuticals',
    'Micro Labs', 'Macleods Pharmaceuticals', 'Ipca Laboratories', 'Wockhardt Ltd',
    'Cadila Pharmaceuticals', 'Emcure Pharmaceuticals', 'USV Pvt Ltd',
    'Biocon Biologics', 'Hetero Drugs', 'Ajanta Pharma', 'Eris Lifesciences',
    'Sanofi India', 'Novartis India', 'FDC Ltd', 'Unichem Laboratories',
    'Indoco Remedies', 'Bal Pharma', 'Panacea Biotec', 'Serum Institute',
    'Natco Pharma', 'Jubilant Pharmova', 'Alembic Pharmaceuticals',
    'Bharat Serums', 'Themis Medicare', 'Blue Cross Laboratories', 'Franco-Indian'
  ];

  /* ── Brand-name roots (Indian-style, phonetic) ─────────────────────────── */
  const ROOTS = (
    'Zoxil Moxil Cifran Alcip Novamox Rancip Doxid Zenflox Ceftum Monocef Taxim ' +
    'Augpen Clavam Fixim Compass Aziwok Zathrin Azee Erythrocin Clarion Roxid ' +
    'Dolo Calpol Pacimol Zerodol Nimucet Aceclo Voveran Enzoflam Etova Signoflam ' +
    'Amlong Amlopres Stamlo Telma Telsar Losar Repace Cardace Envas Metpure ' +
    'Aten Concor Nebicard Cilacar Nicardia Ecosprin Deplatt Clopilet Storvas Rosuvas ' +
    'Atocor Ecosprin Lipvas Fibractiv Glycomet Glimestar Amaryl Janumet Zita ' +
    'Galvus Forxiga Jardiance Pioz Volix Lantus Novomix Huminsulin Basalog Mixtard ' +
    'Asthalin Levolin Duolin Budecort Foracort Seroflo Montek Deriphyllin Mucaryl ' +
    'Ambrolite Grilinctus Alerid Cetzine Allegra Montair Levorid Debrid Okacet ' +
    'Omez Pantocid Pan Razo Nexpro Aciloc Rantac Domstal Emeset Perinorm ' +
    'Cyclopam Drotin Meftal Colimex Duphalac Cremaffin Eldoper Enterogermina Sucral ' +
    'Udiliv Sporidex Mox Novaclox Ampoxin Metrogyl Flagyl Linezalk Meronem Zosyn ' +
    'Mikacin Garamycin Septran Nitrofur Faropen Magnamycin Vancocin Targocid ' +
    'Forcan Syscan Itaspor Nizral Terbinaforce Fungitop Amphonex Vorizol Candid ' +
    'Zovirax Acivir Valcivir Tamiflu Tenvir Fabiflu Rcinex Isokin Combutol Pyzina ' +
    'Lariago Falcigo Malirid Zybend Bandy Ivermectol Banocide Wysolone Omnacortil ' +
    'Dexona Solu-Medrol Betnesol Defcort Eltroxin Thyronorm Neomercazole Gabapin ' +
    'Pregeb Nortip Amitone Serta Nexito Fludac Paxidep Duzela Venlor Mirtaz ' +
    'Oleanz Risdone Seroquin Arip Serenace Lonazep Ativan Alprax Valium Levipil ' +
    'Encorate Tegrital Oxetol Eptoin Lamitor Topamac Donep Syndopa Liofen Sirdalud ' +
    'Urimax Silodal Fincar Dutas Vesica Roliten Penegra Tadact Clofert Fertyl ' +
    'Regestrone Pause Ovaa Cytolog Duphaston Adaferin Sotret T-Bact Fucidin ' +
    'Clonate Tacroz Permite Caladryl Salicyl Vigamox Glucomol Latoprost Refresh ' +
    'Olopat Veenat Xeloda Folitrax Endoxan Platinex Mitotax Tamodex Armotraz ' +
    'Propofol Ketmin Fulsed Fentanyl Xylocaine Sensorcaine Tracrium Neostig Manniton ' +
    'Shelcal Gemcal Uprise Nurokind Meganeuron Livogen Autrin Zincovit Becosules Limcee'
  ).trim().split(/\s+/);

  /* ── Generics: [name, salt, category, schedule, kind, strengths[]] ──────── */
  const G = [];
  const add = (n, c, sch, k, st, salt) => G.push({ n, salt: salt || n, c, sch, k, st });

  /* Analgesics / NSAIDs / Antipyretics */
  add('Paracetamol', 'Analgesic & Antipyretic', 'OTC', 'tab', ['500mg', '650mg', '1000mg']);
  add('Ibuprofen', 'Analgesic & NSAID', 'OTC', 'tab', ['200mg', '400mg', '600mg']);
  add('Diclofenac Sodium', 'Analgesic & NSAID', 'H', 'tab', ['50mg', '75mg', '100mg SR']);
  add('Aceclofenac', 'Analgesic & NSAID', 'H', 'tab', ['100mg', '200mg SR']);
  add('Naproxen', 'Analgesic & NSAID', 'H', 'tab', ['250mg', '500mg']);
  add('Aspirin', 'Antiplatelet & Analgesic', 'OTC', 'tab', ['75mg', '150mg', '325mg']);
  add('Ketorolac', 'Analgesic & NSAID', 'H', 'inj', ['10mg', '30mg']);
  add('Etoricoxib', 'Analgesic & NSAID', 'H', 'tab', ['60mg', '90mg', '120mg']);
  add('Nimesulide', 'Analgesic & NSAID', 'H', 'tab', ['100mg']);
  add('Tramadol', 'Opioid Analgesic', 'H', 'cap', ['50mg', '100mg SR']);
  add('Tapentadol', 'Opioid Analgesic', 'H1', 'tab', ['50mg', '100mg']);
  add('Mefenamic Acid', 'Analgesic & NSAID', 'H', 'tab', ['250mg', '500mg']);
  add('Piroxicam', 'Analgesic & NSAID', 'H', 'cap', ['10mg', '20mg']);

  /* Antibiotics */
  add('Amoxicillin', 'Antibiotic', 'H', 'cap', ['250mg', '500mg']);
  add('Amoxicillin + Clavulanic Acid', 'Antibiotic', 'H', 'tab', ['375mg', '625mg', '1000mg'], 'Amoxicillin 500mg + Clavulanic Acid 125mg');
  add('Azithromycin', 'Antibiotic', 'H', 'tab', ['250mg', '500mg']);
  add('Ciprofloxacin', 'Antibiotic', 'H', 'tab', ['250mg', '500mg', '750mg']);
  add('Levofloxacin', 'Antibiotic', 'H', 'tab', ['250mg', '500mg', '750mg']);
  add('Ofloxacin', 'Antibiotic', 'H', 'tab', ['200mg', '400mg']);
  add('Ceftriaxone', 'Antibiotic', 'H', 'inj', ['250mg', '500mg', '1000mg']);
  add('Cefixime', 'Antibiotic', 'H', 'tab', ['100mg', '200mg']);
  add('Cefuroxime', 'Antibiotic', 'H', 'tab', ['250mg', '500mg']);
  add('Cefpodoxime', 'Antibiotic', 'H', 'tab', ['100mg', '200mg']);
  add('Doxycycline', 'Antibiotic', 'H', 'cap', ['100mg']);
  add('Metronidazole', 'Antibiotic & Antiprotozoal', 'H', 'tab', ['200mg', '400mg']);
  add('Clarithromycin', 'Antibiotic', 'H', 'tab', ['250mg', '500mg']);
  add('Clindamycin', 'Antibiotic', 'H', 'cap', ['150mg', '300mg']);
  add('Linezolid', 'Antibiotic', 'H1', 'tab', ['600mg']);
  add('Meropenem', 'Antibiotic', 'H1', 'inj', ['500mg', '1000mg']);
  add('Piperacillin + Tazobactam', 'Antibiotic', 'H1', 'inj', ['2.25g', '4.5g'], 'Piperacillin 4g + Tazobactam 0.5g');
  add('Amikacin', 'Antibiotic', 'H', 'inj', ['250mg', '500mg']);
  add('Gentamicin', 'Antibiotic', 'H', 'inj', ['40mg', '80mg']);
  add('Cotrimoxazole', 'Antibiotic', 'H', 'tab', ['480mg', '960mg'], 'Sulfamethoxazole 800mg + Trimethoprim 160mg');
  add('Nitrofurantoin', 'Antibiotic', 'H', 'tab', ['50mg', '100mg']);
  add('Faropenem', 'Antibiotic', 'H1', 'tab', ['150mg', '200mg']);
  add('Cefoperazone + Sulbactam', 'Antibiotic', 'H1', 'inj', ['1.5g', '3g'], 'Cefoperazone 1g + Sulbactam 0.5g');
  add('Vancomycin', 'Antibiotic', 'H1', 'inj', ['500mg', '1000mg']);
  add('Ampicillin + Cloxacillin', 'Antibiotic', 'H', 'cap', ['250mg', '500mg'], 'Ampicillin 250mg + Cloxacillin 250mg');
  add('Norfloxacin', 'Antibiotic', 'H', 'tab', ['400mg']);

  /* Antifungals / Antivirals */
  add('Fluconazole', 'Antifungal', 'H', 'tab', ['50mg', '150mg', '200mg']);
  add('Itraconazole', 'Antifungal', 'H', 'cap', ['100mg', '200mg']);
  add('Ketoconazole', 'Antifungal', 'H', 'tab', ['200mg']);
  add('Terbinafine', 'Antifungal', 'H', 'tab', ['250mg']);
  add('Voriconazole', 'Antifungal', 'H1', 'tab', ['50mg', '200mg']);
  add('Clotrimazole', 'Antifungal', 'OTC', 'topical', ['1%']);
  add('Acyclovir', 'Antiviral', 'H', 'tab', ['200mg', '400mg', '800mg']);
  add('Valacyclovir', 'Antiviral', 'H', 'tab', ['500mg', '1000mg']);
  add('Oseltamivir', 'Antiviral', 'H1', 'cap', ['30mg', '45mg', '75mg']);
  add('Tenofovir + Emtricitabine', 'Antiretroviral', 'H1', 'tab', ['300mg'], 'Tenofovir 300mg + Emtricitabine 200mg');

  /* Antitubercular / Antimalarial / Anthelmintic */
  add('Rifampicin + Isoniazid', 'Antitubercular', 'H', 'tab', ['450mg', '600mg'], 'Rifampicin 450mg + Isoniazid 300mg');
  add('Ethambutol', 'Antitubercular', 'H', 'tab', ['400mg', '800mg']);
  add('Pyrazinamide', 'Antitubercular', 'H', 'tab', ['500mg', '750mg']);
  add('Artemether + Lumefantrine', 'Antimalarial', 'H', 'tab', ['80mg'], 'Artemether 80mg + Lumefantrine 480mg');
  add('Chloroquine', 'Antimalarial', 'H', 'tab', ['250mg']);
  add('Hydroxychloroquine', 'Antimalarial & DMARD', 'H', 'tab', ['200mg', '400mg']);
  add('Albendazole', 'Anthelmintic', 'OTC', 'tab', ['400mg']);
  add('Ivermectin', 'Anthelmintic', 'H', 'tab', ['6mg', '12mg']);
  add('Diethylcarbamazine', 'Anthelmintic', 'H', 'tab', ['100mg']);

  /* Cardiovascular / Antihypertensive */
  add('Amlodipine', 'Antihypertensive', 'H', 'tab', ['2.5mg', '5mg', '10mg']);
  add('Telmisartan', 'Antihypertensive', 'H', 'tab', ['20mg', '40mg', '80mg']);
  add('Losartan', 'Antihypertensive', 'H', 'tab', ['25mg', '50mg', '100mg']);
  add('Ramipril', 'Antihypertensive', 'H', 'tab', ['2.5mg', '5mg', '10mg']);
  add('Enalapril', 'Antihypertensive', 'H', 'tab', ['2.5mg', '5mg', '10mg']);
  add('Metoprolol', 'Beta Blocker', 'H', 'tab', ['25mg', '50mg', '100mg']);
  add('Atenolol', 'Beta Blocker', 'H', 'tab', ['25mg', '50mg', '100mg']);
  add('Bisoprolol', 'Beta Blocker', 'H', 'tab', ['2.5mg', '5mg', '10mg']);
  add('Carvedilol', 'Beta Blocker', 'H', 'tab', ['3.125mg', '6.25mg', '12.5mg']);
  add('Nebivolol', 'Beta Blocker', 'H', 'tab', ['2.5mg', '5mg']);
  add('Cilnidipine', 'Antihypertensive', 'H', 'tab', ['5mg', '10mg']);
  add('Clonidine', 'Antihypertensive', 'H', 'tab', ['100mcg']);
  add('Hydrochlorothiazide', 'Diuretic', 'H', 'tab', ['12.5mg', '25mg']);
  add('Chlorthalidone', 'Diuretic', 'H', 'tab', ['6.25mg', '12.5mg']);
  add('Furosemide', 'Diuretic', 'H', 'tab', ['40mg']);
  add('Torsemide', 'Diuretic', 'H', 'tab', ['5mg', '10mg', '20mg']);
  add('Spironolactone', 'Diuretic', 'H', 'tab', ['25mg', '50mg']);
  add('Digoxin', 'Cardiac Glycoside', 'H', 'tab', ['0.25mg']);
  add('Ivabradine', 'Antianginal', 'H', 'tab', ['5mg', '7.5mg']);
  add('Isosorbide Mononitrate', 'Antianginal', 'H', 'tab', ['10mg', '20mg', '40mg SR']);
  add('Ranolazine', 'Antianginal', 'H', 'tab', ['500mg', '1000mg']);

  /* Antiplatelet / Anticoagulant / Lipid */
  add('Clopidogrel', 'Antiplatelet', 'H', 'tab', ['75mg', '150mg']);
  add('Ticagrelor', 'Antiplatelet', 'H', 'tab', ['90mg']);
  add('Rivaroxaban', 'Anticoagulant', 'H', 'tab', ['10mg', '15mg', '20mg']);
  add('Apixaban', 'Anticoagulant', 'H', 'tab', ['2.5mg', '5mg']);
  add('Dabigatran', 'Anticoagulant', 'H', 'cap', ['75mg', '110mg', '150mg']);
  add('Enoxaparin', 'Anticoagulant', 'H', 'inj', ['40mg', '60mg']);
  add('Warfarin', 'Anticoagulant', 'H', 'tab', ['1mg', '2mg', '5mg']);
  add('Acenocoumarol', 'Anticoagulant', 'H', 'tab', ['1mg', '2mg', '4mg']);
  add('Atorvastatin', 'Lipid Lowering', 'H', 'tab', ['10mg', '20mg', '40mg']);
  add('Rosuvastatin', 'Lipid Lowering', 'H', 'tab', ['5mg', '10mg', '20mg']);
  add('Simvastatin', 'Lipid Lowering', 'H', 'tab', ['10mg', '20mg', '40mg']);
  add('Fenofibrate', 'Lipid Lowering', 'H', 'tab', ['145mg', '160mg', '200mg']);
  add('Ezetimibe', 'Lipid Lowering', 'H', 'tab', ['10mg']);

  /* Antidiabetic */
  add('Metformin', 'Antidiabetic', 'H', 'tab', ['500mg', '850mg', '1000mg SR']);
  add('Glimepiride', 'Antidiabetic', 'H', 'tab', ['1mg', '2mg', '4mg']);
  add('Gliclazide', 'Antidiabetic', 'H', 'tab', ['40mg', '80mg', '30mg MR']);
  add('Sitagliptin', 'Antidiabetic', 'H', 'tab', ['50mg', '100mg']);
  add('Vildagliptin', 'Antidiabetic', 'H', 'tab', ['50mg']);
  add('Teneligliptin', 'Antidiabetic', 'H', 'tab', ['20mg']);
  add('Dapagliflozin', 'Antidiabetic', 'H', 'tab', ['5mg', '10mg']);
  add('Empagliflozin', 'Antidiabetic', 'H', 'tab', ['10mg', '25mg']);
  add('Pioglitazone', 'Antidiabetic', 'H', 'tab', ['7.5mg', '15mg', '30mg']);
  add('Voglibose', 'Antidiabetic', 'H', 'tab', ['0.2mg', '0.3mg']);
  add('Repaglinide', 'Antidiabetic', 'H', 'tab', ['0.5mg', '1mg', '2mg']);
  add('Insulin Glargine', 'Insulin', 'H', 'insulin', ['100IU/mL']);
  add('Insulin Aspart', 'Insulin', 'H', 'insulin', ['100IU/mL']);
  add('Human Insulin (Regular)', 'Insulin', 'H', 'insulin', ['40IU/mL', '100IU/mL']);
  add('Insulin Isophane (NPH)', 'Insulin', 'H', 'insulin', ['40IU/mL', '100IU/mL']);

  /* Respiratory / Antihistamine */
  add('Salbutamol', 'Bronchodilator', 'H', 'resp', ['100mcg', '2.5mg']);
  add('Levosalbutamol', 'Bronchodilator', 'H', 'resp', ['50mcg', '1.25mg']);
  add('Ipratropium + Levosalbutamol', 'Bronchodilator', 'H', 'resp', ['20mcg'], 'Ipratropium 20mcg + Levosalbutamol 50mcg');
  add('Budesonide', 'Inhaled Corticosteroid', 'H', 'resp', ['100mcg', '200mcg', '400mcg']);
  add('Budesonide + Formoterol', 'Respiratory Combination', 'H', 'resp', ['200mcg'], 'Budesonide 200mcg + Formoterol 6mcg');
  add('Fluticasone + Salmeterol', 'Respiratory Combination', 'H', 'resp', ['125mcg'], 'Fluticasone 125mcg + Salmeterol 25mcg');
  add('Montelukast', 'Anti-Asthmatic', 'H', 'tab', ['4mg', '5mg', '10mg']);
  add('Theophylline', 'Bronchodilator', 'H', 'tab', ['100mg', '200mg', '400mg SR']);
  add('Doxofylline', 'Bronchodilator', 'H', 'tab', ['200mg', '400mg']);
  add('Ambroxol', 'Mucolytic', 'OTC', 'syrup', ['15mg/5mL', '30mg']);
  add('Levocetirizine', 'Antihistamine', 'OTC', 'tab', ['5mg']);
  add('Cetirizine', 'Antihistamine', 'OTC', 'tab', ['10mg']);
  add('Fexofenadine', 'Antihistamine', 'H', 'tab', ['120mg', '180mg']);
  add('Loratadine', 'Antihistamine', 'OTC', 'tab', ['10mg']);
  add('Desloratadine', 'Antihistamine', 'H', 'tab', ['5mg']);
  add('Chlorpheniramine Maleate', 'Antihistamine', 'OTC', 'tab', ['4mg']);
  add('Bilastine', 'Antihistamine', 'H', 'tab', ['20mg']);

  /* Gastrointestinal */
  add('Omeprazole', 'Proton Pump Inhibitor', 'H', 'cap', ['10mg', '20mg', '40mg']);
  add('Pantoprazole', 'Proton Pump Inhibitor', 'H', 'tab', ['20mg', '40mg']);
  add('Rabeprazole', 'Proton Pump Inhibitor', 'H', 'tab', ['10mg', '20mg']);
  add('Esomeprazole', 'Proton Pump Inhibitor', 'H', 'tab', ['20mg', '40mg']);
  add('Lansoprazole', 'Proton Pump Inhibitor', 'H', 'cap', ['15mg', '30mg']);
  add('Famotidine', 'H2 Receptor Antagonist', 'OTC', 'tab', ['20mg', '40mg']);
  add('Domperidone', 'Prokinetic & Antiemetic', 'H', 'tab', ['10mg']);
  add('Ondansetron', 'Antiemetic', 'H', 'tab', ['4mg', '8mg']);
  add('Metoclopramide', 'Antiemetic', 'H', 'tab', ['10mg']);
  add('Dicyclomine', 'Antispasmodic', 'H', 'tab', ['10mg', '20mg']);
  add('Drotaverine', 'Antispasmodic', 'H', 'tab', ['40mg', '80mg']);
  add('Mebeverine', 'Antispasmodic', 'H', 'tab', ['135mg', '200mg SR']);
  add('Lactulose', 'Laxative', 'OTC', 'syrup', ['10g/15mL']);
  add('Bisacodyl', 'Laxative', 'OTC', 'tab', ['5mg', '10mg']);
  add('Loperamide', 'Antidiarrhoeal', 'OTC', 'tab', ['2mg']);
  add('Racecadotril', 'Antidiarrhoeal', 'H', 'cap', ['100mg']);
  add('Oral Rehydration Salts', 'Electrolyte', 'OTC', 'ors', ['21.8g']);
  add('Sucralfate', 'Anti-Ulcer', 'H', 'syrup', ['1g/10mL']);
  add('Ursodeoxycholic Acid', 'Hepatoprotective', 'H', 'tab', ['150mg', '300mg']);
  add('Rifaximin', 'Antibiotic (Gut)', 'H', 'tab', ['200mg', '400mg', '550mg']);
  add('Mesalamine', 'Anti-Inflammatory (GI)', 'H', 'tab', ['400mg', '800mg', '1.2g']);

  /* Vitamins / Supplements / Haematinics */
  add('Cholecalciferol (Vitamin D3)', 'Vitamin & Supplement', 'OTC', 'vitamin', ['1000IU', '2000IU', '60000IU']);
  add('Methylcobalamin (Vitamin B12)', 'Vitamin & Supplement', 'OTC', 'vitamin', ['500mcg', '1500mcg']);
  add('Folic Acid', 'Vitamin & Supplement', 'OTC', 'vitamin', ['5mg']);
  add('Ferrous Ascorbate + Folic Acid', 'Haematinic', 'OTC', 'vitamin', ['100mg'], 'Ferrous Ascorbate 100mg + Folic Acid 1.5mg');
  add('Calcium Carbonate + Vitamin D3', 'Vitamin & Supplement', 'OTC', 'vitamin', ['500mg'], 'Calcium Carbonate 500mg + Vitamin D3 250IU');
  add('Ascorbic Acid (Vitamin C)', 'Vitamin & Supplement', 'OTC', 'vitamin', ['500mg']);
  add('Zinc Sulphate', 'Vitamin & Supplement', 'OTC', 'vitamin', ['20mg', '50mg']);
  add('Multivitamin + Multimineral', 'Vitamin & Supplement', 'OTC', 'vitamin', ['Combination']);

  /* Corticosteroids / Thyroid */
  add('Prednisolone', 'Corticosteroid', 'H', 'tab', ['5mg', '10mg', '20mg', '40mg']);
  add('Dexamethasone', 'Corticosteroid', 'H', 'tab', ['0.5mg', '4mg', '8mg']);
  add('Methylprednisolone', 'Corticosteroid', 'H', 'tab', ['4mg', '8mg', '16mg']);
  add('Betamethasone', 'Corticosteroid', 'H', 'tab', ['0.5mg', '1mg']);
  add('Deflazacort', 'Corticosteroid', 'H', 'tab', ['6mg', '18mg', '30mg']);
  add('Levothyroxine', 'Thyroid Hormone', 'H', 'tab', ['25mcg', '50mcg', '100mcg']);
  add('Carbimazole', 'Antithyroid', 'H', 'tab', ['5mg', '10mg']);

  /* Neurology / Psychiatry */
  add('Gabapentin', 'Neuropathic Analgesic', 'H', 'cap', ['100mg', '300mg', '400mg']);
  add('Pregabalin', 'Neuropathic Analgesic', 'H', 'cap', ['50mg', '75mg', '150mg']);
  add('Amitriptyline', 'Antidepressant', 'H', 'tab', ['10mg', '25mg', '75mg']);
  add('Nortriptyline', 'Antidepressant', 'H', 'tab', ['10mg', '25mg']);
  add('Sertraline', 'Antidepressant', 'H', 'tab', ['25mg', '50mg', '100mg']);
  add('Escitalopram', 'Antidepressant', 'H', 'tab', ['5mg', '10mg', '20mg']);
  add('Fluoxetine', 'Antidepressant', 'H', 'cap', ['10mg', '20mg']);
  add('Duloxetine', 'Antidepressant', 'H', 'cap', ['20mg', '30mg', '60mg']);
  add('Venlafaxine', 'Antidepressant', 'H', 'cap', ['37.5mg', '75mg', '150mg']);
  add('Mirtazapine', 'Antidepressant', 'H', 'tab', ['7.5mg', '15mg', '30mg']);
  add('Olanzapine', 'Antipsychotic', 'H', 'tab', ['2.5mg', '5mg', '10mg']);
  add('Risperidone', 'Antipsychotic', 'H', 'tab', ['1mg', '2mg', '3mg']);
  add('Quetiapine', 'Antipsychotic', 'H', 'tab', ['25mg', '50mg', '100mg', '200mg']);
  add('Aripiprazole', 'Antipsychotic', 'H', 'tab', ['5mg', '10mg', '15mg']);
  add('Haloperidol', 'Antipsychotic', 'H', 'tab', ['0.5mg', '1.5mg', '5mg']);
  add('Clonazepam', 'Benzodiazepine', 'H1', 'tab', ['0.25mg', '0.5mg', '1mg']);
  add('Lorazepam', 'Benzodiazepine', 'H1', 'tab', ['1mg', '2mg']);
  add('Alprazolam', 'Benzodiazepine', 'H1', 'tab', ['0.25mg', '0.5mg', '1mg']);
  add('Diazepam', 'Benzodiazepine', 'H1', 'tab', ['2mg', '5mg', '10mg']);
  add('Levetiracetam', 'Antiepileptic', 'H', 'tab', ['250mg', '500mg', '1000mg']);
  add('Sodium Valproate', 'Antiepileptic', 'H', 'tab', ['200mg', '300mg', '500mg CR']);
  add('Carbamazepine', 'Antiepileptic', 'H', 'tab', ['100mg', '200mg', '400mg CR']);
  add('Oxcarbazepine', 'Antiepileptic', 'H', 'tab', ['150mg', '300mg', '600mg']);
  add('Phenytoin', 'Antiepileptic', 'H', 'tab', ['100mg']);
  add('Lamotrigine', 'Antiepileptic', 'H', 'tab', ['25mg', '50mg', '100mg']);
  add('Topiramate', 'Antiepileptic & Antimigraine', 'H', 'tab', ['25mg', '50mg', '100mg']);
  add('Donepezil', 'Anti-Dementia', 'H', 'tab', ['5mg', '10mg']);
  add('Levodopa + Carbidopa', 'Anti-Parkinson', 'H', 'tab', ['110mg'], 'Levodopa 100mg + Carbidopa 10mg');
  add('Baclofen', 'Muscle Relaxant', 'H', 'tab', ['10mg', '25mg']);
  add('Tizanidine', 'Muscle Relaxant', 'H', 'tab', ['2mg', '4mg']);

  /* Urology / Gynaecology */
  add('Tamsulosin', 'Alpha Blocker (BPH)', 'H', 'cap', ['0.4mg']);
  add('Silodosin', 'Alpha Blocker (BPH)', 'H', 'cap', ['4mg', '8mg']);
  add('Finasteride', 'BPH & Antiandrogen', 'H', 'tab', ['1mg', '5mg']);
  add('Dutasteride', 'BPH & Antiandrogen', 'H', 'tab', ['0.5mg']);
  add('Solifenacin', 'Overactive Bladder', 'H', 'tab', ['5mg', '10mg']);
  add('Sildenafil', 'PDE5 Inhibitor', 'H', 'tab', ['25mg', '50mg', '100mg']);
  add('Tadalafil', 'PDE5 Inhibitor', 'H', 'tab', ['5mg', '10mg', '20mg']);
  add('Clomiphene', 'Ovulation Inducer', 'H', 'tab', ['25mg', '50mg', '100mg']);
  add('Letrozole', 'Aromatase Inhibitor', 'H', 'tab', ['2.5mg']);
  add('Norethisterone', 'Progestogen', 'H', 'tab', ['5mg']);
  add('Tranexamic Acid', 'Antifibrinolytic', 'H', 'tab', ['500mg']);
  add('Dydrogesterone', 'Progestogen', 'H', 'tab', ['10mg']);

  /* Dermatology / Ophthalmology */
  add('Adapalene', 'Retinoid (Topical)', 'H', 'topical', ['0.1%', '0.3%']);
  add('Isotretinoin', 'Systemic Retinoid', 'H', 'cap', ['10mg', '20mg']);
  add('Mupirocin', 'Topical Antibiotic', 'H', 'topical', ['2%']);
  add('Fusidic Acid', 'Topical Antibiotic', 'H', 'topical', ['2%']);
  add('Clobetasol', 'Topical Corticosteroid', 'H', 'topical', ['0.05%']);
  add('Tacrolimus', 'Topical Immunomodulator', 'H', 'topical', ['0.03%', '0.1%']);
  add('Permethrin', 'Scabicide', 'OTC', 'topical', ['5%']);
  add('Moxifloxacin', 'Ophthalmic Antibiotic', 'H', 'eye', ['0.5%']);
  add('Timolol', 'Anti-Glaucoma', 'H', 'eye', ['0.5%']);
  add('Latanoprost', 'Anti-Glaucoma', 'H', 'eye', ['0.005%']);
  add('Carboxymethylcellulose', 'Ocular Lubricant', 'OTC', 'eye', ['0.5%', '1%']);
  add('Olopatadine', 'Ophthalmic Antihistamine', 'H', 'eye', ['0.1%', '0.2%']);

  /* Oncology */
  add('Imatinib', 'Antineoplastic', 'H1', 'tab', ['100mg', '400mg']);
  add('Capecitabine', 'Antineoplastic', 'H1', 'tab', ['150mg', '500mg']);
  add('Methotrexate', 'Antineoplastic & DMARD', 'H', 'tab', ['2.5mg', '7.5mg', '10mg']);
  add('Cyclophosphamide', 'Antineoplastic', 'H1', 'inj', ['200mg', '500mg', '1000mg']);
  add('Cisplatin', 'Antineoplastic', 'H1', 'inj', ['10mg', '50mg']);
  add('Paclitaxel', 'Antineoplastic', 'H1', 'inj', ['30mg', '100mg', '260mg']);
  add('Tamoxifen', 'Antineoplastic (Hormonal)', 'H', 'tab', ['10mg', '20mg']);
  add('Anastrozole', 'Antineoplastic (Hormonal)', 'H', 'tab', ['1mg']);

  /* Anaesthesia / IV fluids / Emergency */
  add('Sodium Chloride 0.9%', 'IV Fluid', 'H', 'iv', ['100mL', '500mL', '1000mL']);
  add('Ringer Lactate', 'IV Fluid', 'H', 'iv', ['500mL', '1000mL']);
  add('Dextrose 5%', 'IV Fluid', 'H', 'iv', ['500mL', '1000mL']);
  add('Dextrose Normal Saline', 'IV Fluid', 'H', 'iv', ['500mL', '1000mL']);
  add('Mannitol 20%', 'Osmotic Diuretic', 'H', 'iv', ['100mL', '350mL']);
  add('Propofol', 'General Anaesthetic', 'H1', 'inj', ['200mg']);
  add('Ketamine', 'General Anaesthetic', 'X', 'inj', ['50mg/mL']);
  add('Midazolam', 'Sedative', 'H1', 'inj', ['1mg/mL', '5mg/mL']);
  add('Fentanyl', 'Opioid Analgesic', 'X', 'inj', ['50mcg/mL']);
  add('Lignocaine', 'Local Anaesthetic', 'H', 'inj', ['2%']);
  add('Bupivacaine', 'Local Anaesthetic', 'H', 'inj', ['0.5%']);
  add('Atracurium', 'Muscle Relaxant', 'H1', 'inj', ['10mg/mL']);
  add('Neostigmine', 'Anticholinesterase', 'H', 'inj', ['0.5mg/mL']);
  add('Adrenaline', 'Vasopressor', 'H', 'inj', ['1mg/mL']);
  add('Noradrenaline', 'Vasopressor', 'H', 'inj', ['2mg/mL']);
  add('Dopamine', 'Inotrope', 'H', 'inj', ['40mg/mL']);
  add('Hydrocortisone', 'Corticosteroid', 'H', 'inj', ['100mg', '200mg']);
  add('Pheniramine Maleate', 'Antihistamine', 'H', 'inj', ['22.75mg/mL']);
  add('Pantoprazole IV', 'Proton Pump Inhibitor', 'H', 'inj', ['40mg']);

  /* ── Build catalog ─────────────────────────────────────────────────────── */
  const TARGET = 60000;
  const brandsPerGeneric = Math.ceil(TARGET / G.length);
  const catalog = new Array(G.length * brandsPerGeneric);
  let idx = 0;

  const EXPIRIES = [];
  for (let y = 2026; y <= 2028; y++) {
    for (let m = 1; m <= 12; m++) {
      EXPIRIES.push(y + '-' + String(m).padStart(2, '0') + '-' + (m === 2 ? '28' : '30'));
    }
  }

  for (let gi = 0; gi < G.length; gi++) {
    const g = G[gi];
    const forms = FORMS[g.k];
    const [pLo, pHi] = PRICE[g.k];
    const hsn = HSN[g.k];
    for (let b = 0; b < brandsPerGeneric; b++) {
      const rng = mulberry32((gi + 1) * 100003 + b * 7919);
      const strength = g.st[(b) % g.st.length];
      const [form, route] = forms[b % forms.length];
      const root = ROOTS[(gi * 13 + b) % ROOTS.length];
      const mfr = MFRS[(gi * 3 + b) % MFRS.length];
      // Brand label uses the leading numeric of the strength (e.g. "Dolo 650").
      const numTag = (strength.match(/[\d.]+/) || [''])[0];
      // Combination salts already embed their component strengths; single
      // salts get the record strength appended.
      const salt = g.salt.indexOf('+') !== -1 ? g.salt : g.salt + ' ' + strength;

      // price scales with strength index and kind band, deterministic
      const strengthFactor = 1 + (b % g.st.length) * 0.35;
      const price = round5((pLo + rng() * (pHi - pLo)) * strengthFactor);
      const stock = rng() < 0.08 ? 0 : between(rng, 20, 900);
      const minStock = [50, 75, 100, 150, 200][Math.floor(rng() * 5) % 5];

      catalog[idx] = {
        brandName: numTag ? root + ' ' + numTag : root,
        genericName: g.n,
        saltComposition: salt,
        strength: strength,
        dosageForm: form,
        route: route,
        price: price,
        category: g.c,
        code: 'RX-MED-' + String(idx + 1).padStart(6, '0'),
        manufacturer: mfr,
        schedule: g.sch,
        hsnCode: hsn,
        minStock: minStock,
        stock: stock,
        batch: 'BAT-2026-' + String(between(rng, 1000, 9999)),
        expiry: EXPIRIES[Math.floor(rng() * EXPIRIES.length) % EXPIRIES.length]
      };
      idx++;
    }
  }

  window.medicationCatalog = catalog;
  console.log('[MedicationCatalog] ✅ ' + catalog.length.toLocaleString('en-IN') +
              ' formulations across ' + G.length + ' generics seeded.');
})();
