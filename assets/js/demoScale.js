/* ==========================================================================
   SARONIL HIS — DEMO SCALE-UP (demoScale.js)
   Loads AFTER patients100.js. Grows the prototype into a full-fledged demo of
   a multi-specialty hospital ~6 months into operation:
     • +200 patients (SH-2026-05001 … 05200) — diverse Indian demographics,
       all 20 specialties, realistic payer mix, dates spread 1 Jan – 5 Jul 2026
     • ≥10 consultations per doctor (a full day list + historical volume)
     • OPD live queue tokens, invoices, lab & radiology orders cross-linked by uhid
   Deterministic (seeded by index) so the demo is stable across reloads.
   New IPD/Daycare/Emergency patients are HISTORICAL (discharged) so they add
   6-month volume without disturbing the live bed board.
   ========================================================================== */

(function () {
  'use strict';

  function mulberry32(seed) {
    return function () {
      seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  const pick = (rng, a) => a[Math.floor(rng() * a.length) % a.length];
  const between = (rng, lo, hi) => lo + Math.floor(rng() * (hi - lo + 1));

  const ANCHOR = window._HIS_ANCHOR || '2026-07-05';
  const WINDOW_DAYS = 185; // 1 Jan 2026 → 5 Jul 2026
  // UTC-based so the ISO date never drifts a day across timezones.
  function isoAgo(n) { const d = new Date(ANCHOR + 'T00:00:00Z'); d.setUTCDate(d.getUTCDate() - n); return d.toISOString().slice(0, 10); }
  function prettyAgo(n, t) {
    const d = new Date(ANCHOR + 'T00:00:00Z'); d.setUTCDate(d.getUTCDate() - n);
    const p = d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' });
    return t ? p + ' · ' + t : p;
  }

  /* ── Demographic pools ─────────────────────────────────────────────────── */
  const NAMES = {
    hindu: {
      m: ['Rajesh', 'Suresh', 'Ramesh', 'Mahesh', 'Venkatesh', 'Anil', 'Sunil', 'Vijay', 'Ajay', 'Manoj', 'Deepak', 'Prakash', 'Ravi', 'Kiran', 'Naveen', 'Girish', 'Harish', 'Mukesh', 'Dinesh', 'Ganesh', 'Srinivas', 'Karthik', 'Aravind', 'Nagaraj', 'Shivakumar', 'Basavaraj', 'Prasad', 'Gopal', 'Balaji', 'Sridhar', 'Murali', 'Ashok', 'Lokesh', 'Yogesh', 'Umesh'],
      f: ['Priya', 'Lakshmi', 'Sunita', 'Geeta', 'Sushma', 'Latha', 'Radha', 'Kavya', 'Deepa', 'Anita', 'Meena', 'Rekha', 'Shanti', 'Vani', 'Uma', 'Padma', 'Shobha', 'Roopa', 'Bhavya', 'Divya', 'Nandini', 'Sowmya', 'Aishwarya', 'Pooja', 'Sneha', 'Anjali', 'Shruti', 'Manju', 'Vidya', 'Kalpana', 'Jayanthi', 'Ramya', 'Harini', 'Swati', 'Chaitra'],
      l: ['Kumar', 'Sharma', 'Verma', 'Gupta', 'Reddy', 'Nair', 'Iyer', 'Rao', 'Shetty', 'Gowda', 'Hegde', 'Murthy', 'Prasad', 'Naidu', 'Menon', 'Pillai', 'Bhat', 'Kulkarni', 'Desai', 'Patel', 'Yadav', 'Joshi', 'Nayak', 'Acharya', 'Pai', 'Kamath', 'Shenoy']
    },
    muslim: {
      m: ['Mohammed', 'Abdul', 'Iqbal', 'Ayaan', 'Imran', 'Faizal', 'Yusuf', 'Salman', 'Aamir', 'Zaid', 'Sameer', 'Naeem', 'Tariq', 'Arif', 'Junaid', 'Nadeem', 'Riyaz', 'Ibrahim'],
      f: ['Fatima', 'Ayesha', 'Zainab', 'Nadia', 'Saira', 'Farida', 'Rukhsana', 'Shabana', 'Nasreen', 'Yasmin', 'Rehana', 'Sana', 'Heena', 'Noor', 'Zoya', 'Asma', 'Rabia', 'Salma'],
      l: ['Khan', 'Sheikh', 'Ahmed', 'Ansari', 'Syed', 'Qureshi', 'Baig', 'Hussain', 'Pasha', 'Rahman', 'Sait']
    },
    christian: {
      m: ['Joseph', 'Thomas', 'Anthony', 'John', 'George', 'Peter', 'Paul', 'Michael', 'Stephen', 'Rohan', 'Ryan', 'Denzil', 'Clifford', 'Melwin'],
      f: ['Mary', 'Sarah', 'Grace', 'Rita', 'Anitha', 'Jennifer', 'Sheela', 'Rosita', 'Flavia', 'Diana', 'Christine', 'Nirmala', 'Prema'],
      l: ['Thomas', 'Mathew', "D'Souza", 'Fernandes', 'Pereira', 'Pinto', 'Lobo', 'Rodrigues', 'Menezes', 'Saldanha', 'Coelho', 'Jenkins']
    },
    sikh: {
      m: ['Harpreet', 'Ranjit', 'Gurdeep', 'Jaspreet', 'Manpreet', 'Sukhwinder', 'Baldev', 'Amrit', 'Tejinder', 'Harjeet'],
      f: ['Gurleen', 'Simran', 'Harleen', 'Manjit', 'Kiranjeet', 'Amanpreet', 'Jaswinder', 'Rupinder', 'Navneet', 'Paramjit'],
      lm: ['Singh'], lf: ['Kaur']
    },
    jewish: {
      m: ['David', 'Isaac', 'Aaron', 'Samuel', 'Daniel', 'Benjamin', 'Solomon'],
      f: ['Rachel', 'Rebecca', 'Ruth', 'Esther', 'Naomi'],
      l: ['Cohen', 'Benjamin', 'Joseph', 'Ezekiel', 'Abraham']
    }
  };
  const COMMUNITY = [['hindu', 62], ['muslim', 18], ['christian', 10], ['sikh', 7], ['jewish', 3]];

  function makeName(rng) {
    const r = rng() * 100; let acc = 0, comm = 'hindu';
    for (const [c, w] of COMMUNITY) { acc += w; if (r <= acc) { comm = c; break; } }
    const gender = rng() < 0.5 ? 'Male' : 'Female';
    const set = NAMES[comm];
    const first = pick(rng, gender === 'Male' ? set.m : set.f);
    let last;
    if (comm === 'sikh') last = pick(rng, gender === 'Male' ? set.lm : set.lf);
    else last = pick(rng, set.l);
    return { name: first + ' ' + last, gender: gender, first: first };
  }

  const LOCALITIES = ['Jayanagar', 'Koramangala', 'Indiranagar', 'Whitefield', 'JP Nagar', 'Malleshwaram', 'Basavanagudi', 'HSR Layout', 'BTM Layout', 'Rajajinagar', 'Yelahanka', 'Marathahalli', 'Banashankari', 'Electronic City', 'RT Nagar', 'Hebbal', 'Sarjapur Road', 'Bellandur', 'Ulsoor', 'Frazer Town'];
  const EMAIL_DOM = ['gmail.com', 'yahoo.com', 'outlook.com'];
  const BLOOD = ['O+', 'A+', 'B+', 'AB+', 'O-', 'A-', 'B-', 'AB-'];
  const LEAD = ['Walk-in', 'Doctor Referral', 'Online Booking', 'Health Camp', 'Ambulance', 'Corporate Tie-up', 'Insurance Desk'];
  const ALLERGIES = ['None', 'None', 'None', 'Penicillin', 'Sulfa drugs', 'Aspirin', 'Iodine contrast', 'Peanuts', 'Dust / Pollen'];

  const PAYERS = {
    cash: { list: ['Self Pay', 'Cash Payment'], type: 'Cash' },
    ins: { list: ['Star Health', 'HDFC ERGO', 'ICICI Lombard', 'New India Assurance', 'United India', 'Care Health', 'Bajaj Allianz', 'Aditya Birla Health', 'Niva Bupa'], type: 'TPA/Insurance' },
    govt: { list: ['CGHS', 'ECHS', 'PMJAY', 'ESI'], type: 'Govt Scheme' }
  };
  function makePayer(rng) {
    const r = rng();
    const bucket = r < 0.30 ? PAYERS.cash : r < 0.70 ? PAYERS.ins : PAYERS.govt;
    return { payer: pick(rng, bucket.list), payerType: bucket.type };
  }

  /* condition bank keyed by specialty */
  const COND = {
    'General Medicine': [['Fever with body ache ×4 days', 'Viral Pyrexia', 'R50.9'], ['Uncontrolled blood sugar', 'Type 2 Diabetes Mellitus', 'E11.9'], ['Fatigue and giddiness', 'Iron Deficiency Anaemia', 'D50.9'], ['Raised BP on routine check', 'Essential Hypertension', 'I10'], ['Loose stools ×3 days', 'Acute Gastroenteritis', 'A09']],
    'Cardiology': [['Chest tightness on exertion', 'Stable Angina', 'I20.9'], ['Palpitations and breathlessness', 'Atrial Fibrillation', 'I48.91'], ['Follow-up post angioplasty', 'Coronary Artery Disease', 'I25.10'], ['Ankle swelling, orthopnoea', 'Congestive Heart Failure', 'I50.9'], ['Uncontrolled hypertension', 'Hypertensive Heart Disease', 'I11.9']],
    'Orthopedics': [['Low back pain radiating to leg', 'Lumbar Disc Prolapse (L4-L5)', 'M51.16'], ['Right knee pain, difficulty walking', 'Osteoarthritis Knee', 'M17.1'], ['Wrist pain after fall', 'Colles Fracture', 'S52.5'], ['Shoulder stiffness', 'Adhesive Capsulitis', 'M75.0'], ['Neck pain with tingling', 'Cervical Spondylosis', 'M47.812']],
    'Gynecology & Obs': [['Irregular menstrual cycles', 'Polycystic Ovarian Syndrome', 'E28.2'], ['Antenatal check-up (2nd trimester)', 'Normal Pregnancy — 22 weeks', 'Z34.0'], ['Lower abdominal pain', 'Pelvic Inflammatory Disease', 'N73.9'], ['Heavy menstrual bleeding', 'Dysfunctional Uterine Bleeding', 'N93.8'], ['Postmenopausal check-up', 'Menopausal Syndrome', 'N95.1']],
    'Pediatrics': [['High fever and cough in child', 'Acute Bronchiolitis', 'J21.9'], ['Loose motions, poor feeding', 'Acute Diarrhoeal Disease', 'A09'], ['Routine immunisation visit', 'Well Child Visit', 'Z00.129'], ['Rash with fever', 'Viral Exanthem', 'B09'], ['Poor weight gain', 'Failure to Thrive', 'R62.51']],
    'General Surgery': [['Right lower abdominal pain', 'Acute Appendicitis', 'K35.80'], ['Lump in groin', 'Inguinal Hernia', 'K40.90'], ['Gallstone colic', 'Cholelithiasis', 'K80.20'], ['Perianal pain and bleeding', 'Haemorrhoids Grade II', 'K64.1'], ['Thyroid swelling', 'Multinodular Goitre', 'E04.2']],
    'Neurology': [['Recurrent one-sided headache', 'Migraine without Aura', 'G43.009'], ['Sudden weakness of right limbs', 'Cerebrovascular Accident', 'I63.9'], ['Episodes of loss of consciousness', 'Generalised Seizure Disorder', 'G40.409'], ['Tremors and slowness', "Parkinson's Disease", 'G20'], ['Tingling numbness in feet', 'Peripheral Neuropathy', 'G62.9']],
    'Psychiatry': [['Persistent low mood, poor sleep', 'Major Depressive Disorder', 'F32.9'], ['Excessive worry and restlessness', 'Generalised Anxiety Disorder', 'F41.1'], ['Sleep disturbance', 'Insomnia Disorder', 'F51.01'], ['Follow-up mood stabiliser', 'Bipolar Affective Disorder', 'F31.9'], ['Alcohol dependence review', 'Alcohol Use Disorder', 'F10.20']],
    'Oncology': [['Follow-up chemotherapy cycle', 'Carcinoma Breast (on treatment)', 'C50.919'], ['Weight loss, cough', 'Carcinoma Lung — evaluation', 'C34.90'], ['Blood counts review', 'Chronic Myeloid Leukaemia', 'C92.10'], ['Post-surgery oncology review', 'Colorectal Carcinoma', 'C18.9'], ['Palliative care visit', 'Metastatic Disease — supportive', 'C79.9']],
    'Pulmonology': [['Breathlessness on exertion', 'COPD (GOLD II)', 'J44.9'], ['Chronic cough with wheeze', 'Bronchial Asthma', 'J45.909'], ['Cough with fever ×1 week', 'Community Acquired Pneumonia', 'J18.9'], ['Snoring, daytime sleepiness', 'Obstructive Sleep Apnoea', 'G47.33'], ['Follow-up TB treatment', 'Pulmonary Tuberculosis (on ATT)', 'A15.0']],
    'Endocrinology': [['Uncontrolled diabetes on insulin', 'Type 1 Diabetes Mellitus', 'E10.9'], ['Weight gain, cold intolerance', 'Hypothyroidism', 'E03.9'], ['Tremor, weight loss', 'Thyrotoxicosis', 'E05.90'], ['Bone pain, low vitamin D', 'Vitamin D Deficiency', 'E55.9'], ['Obesity counselling', 'Metabolic Syndrome', 'E88.81']],
    'Nephrology': [['Facial puffiness, frothy urine', 'Nephrotic Syndrome', 'N04.9'], ['Rising creatinine', 'Chronic Kidney Disease Stage 3', 'N18.3'], ['Follow-up dialysis', 'End Stage Renal Disease', 'N18.6'], ['Recurrent urinary infection', 'Recurrent UTI', 'N39.0'], ['Flank pain, haematuria', 'Renal Calculus', 'N20.0']],
    'Urology': [['Poor urinary stream in elderly male', 'Benign Prostatic Hyperplasia', 'N40.1'], ['Loin pain, burning micturition', 'Ureteric Calculus', 'N20.1'], ['Blood in urine', 'Haematuria — evaluation', 'R31.9'], ['Scrotal swelling', 'Hydrocele', 'N43.3'], ['Erectile dysfunction consult', 'Erectile Dysfunction', 'N52.9']],
    'Gastroenterology': [['Burning upper abdominal pain', 'Gastro-oesophageal Reflux Disease', 'K21.9'], ['Yellowish discolouration of eyes', 'Viral Hepatitis', 'B19.9'], ['Chronic constipation', 'Irritable Bowel Syndrome', 'K58.9'], ['Blood in stools', 'Ulcerative Colitis', 'K51.90'], ['Abdominal distension', 'Chronic Liver Disease', 'K74.60']],
    'ENT': [['Ear pain and discharge', 'Chronic Otitis Media', 'H66.90'], ['Nasal block, sneezing', 'Allergic Rhinitis', 'J30.9'], ['Sore throat, difficulty swallowing', 'Acute Tonsillitis', 'J03.90'], ['Giddiness on head movement', 'Benign Positional Vertigo', 'H81.10'], ['Hoarseness of voice', 'Chronic Laryngitis', 'J37.0']],
    'Ophthalmology': [['Gradual dimness of vision', 'Senile Cataract', 'H25.9'], ['Redness and watering of eye', 'Allergic Conjunctivitis', 'H10.45'], ['Raised eye pressure on screening', 'Primary Open Angle Glaucoma', 'H40.11X0'], ['Blurring in diabetic patient', 'Diabetic Retinopathy', 'E11.319'], ['Eye strain, headache', 'Refractive Error', 'H52.7']],
    'Dermatology': [['Itchy scaly patches', 'Chronic Plaque Psoriasis', 'L40.0'], ['Recurrent facial acne', 'Acne Vulgaris', 'L70.0'], ['Hair fall over months', 'Androgenetic Alopecia', 'L64.9'], ['Ring-shaped itchy lesions', 'Tinea Corporis', 'B35.4'], ['Hives and swelling', 'Chronic Urticaria', 'L50.1']],
    'Rheumatology': [['Multiple joint pains, morning stiffness', 'Rheumatoid Arthritis', 'M06.9'], ['Big toe pain, redness', 'Gouty Arthritis', 'M10.9'], ['Facial rash, joint pain', 'Systemic Lupus Erythematosus', 'M32.9'], ['Low back stiffness in young male', 'Ankylosing Spondylitis', 'M45.9'], ['Widespread body pain', 'Fibromyalgia', 'M79.7']],
    'Emergency Medicine': [['Road traffic accident, multiple injuries', 'Polytrauma — under evaluation', 'T07'], ['Sudden severe chest pain', 'Acute Coronary Syndrome', 'I24.9'], ['Breathlessness, wheeze', 'Acute Asthma Exacerbation', 'J45.901'], ['Poisoning / overdose', 'Acute Poisoning', 'T65.91'], ['High fever with altered sensorium', 'Sepsis — under evaluation', 'A41.9']]
  };
  function condFor(rng, spec) { const arr = COND[spec] || COND['General Medicine']; return pick(rng, arr); }

  function makeVitals(rng, age) {
    const sys = between(rng, 106, 148), dia = between(rng, 66, 92);
    const w = between(rng, age < 14 ? 15 : 48, age < 14 ? 40 : 92);
    const h = age < 14 ? 1.2 : 1.65;
    return { bp: sys + '/' + dia, hr: between(rng, 64, 98), temp: (976 + between(rng, 0, 28)) / 10, spo2: between(rng, 95, 100), weight: w, bmi: +(w / (h * h)).toFixed(1), pain: between(rng, 0, 3), rr: between(rng, 14, 20) };
  }

  const OPD_TIMES = ['09:00 AM', '09:20 AM', '09:40 AM', '10:00 AM', '10:20 AM', '10:40 AM', '11:00 AM', '11:20 AM', '11:40 AM', '12:00 PM', '12:20 PM', '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM', '05:00 PM'];

  const IPD_WARDS = [
    { key: 'GENERAL-WARD-M', name: 'General Ward (Male)', rate: 2500, gender: 'Male' },
    { key: 'GENERAL-WARD-F', name: 'General Ward (Female)', rate: 2500, gender: 'Female' },
    { key: 'SEMI-PRIVATE', name: 'Semi-Private Ward', rate: 4500 },
    { key: 'PRIVATE', name: 'Private Ward', rate: 7000 },
    { key: 'DELUXE', name: 'Deluxe Room', rate: 12000 }
  ];

  function waitAndSeed() {
    const s = window.state;
    if (!s || !s.patients || !s.doctors || s.doctors.length < 10 || s.patients.length < 100) { setTimeout(waitAndSeed, 120); return; }
    if (window.__demoScaleSeeded) return; window.__demoScaleSeeded = true;
    try {
      const created = seedPatients();
      seedConsultations(created);
      seedFinancialsAndDiagnostics(created);
      console.log('[DemoScale] ✅ ' + created.length + ' patients added · appointments now ' +
        s.appointments.length + ' · invoices ' + s.billing.length +
        ' · labs ' + s.labOrders.length + ' · rads ' + s.radOrders.length);
    } catch (e) { console.error('[DemoScale] seeding error', e); }
  }

  /* ── 200 patients across all specialties ───────────────────────────────── */
  function seedPatients() {
    const s = window.state;
    const specs = Array.from(new Set(s.doctors.map(d => d.specialty || d.spec).filter(Boolean)));
    const docsBySpec = {};
    s.doctors.forEach(d => { const sp = d.specialty || d.spec; (docsBySpec[sp] = docsBySpec[sp] || []).push(d); });
    const created = [];

    for (let i = 0; i < 200; i++) {
      const rng = mulberry32(500000 + i * 2654435761);
      const uhid = 'SH-2026-' + String(5001 + i).padStart(5, '0');
      const spec = specs[i % specs.length];
      const doc = pick(rng, docsBySpec[spec] || s.doctors);
      const nm = makeName(rng);
      const age = between(rng, spec === 'Pediatrics' ? 1 : 17, spec === 'Pediatrics' ? 14 : 86);
      const [complaint, dx, icd] = condFor(rng, spec);
      const pay = makePayer(rng);
      const regN = between(rng, 0, WINDOW_DAYS);        // registration day within window
      const locality = pick(rng, LOCALITIES);
      const emailUser = (nm.first + '.' + uhid.slice(-4)).toLowerCase();

      // type mix: 60% OPD, 22% IPD(discharged), 8% Emergency(discharged), 10% Daycare(discharged)
      const tr = rng();
      let type = 'OPD', status = 'Completed', ward = '—', wardKey = null, bed = '—', los = 0, admitted;
      let dischargeStatus = null;
      if (tr < 0.60) { type = 'OPD'; status = pick(rng, ['Completed', 'Completed', 'Registered', 'In Consultation']); admitted = prettyAgo(regN, pick(rng, OPD_TIMES)); }
      else if (tr < 0.82) { type = 'IPD'; los = between(rng, 2, 12); }
      else if (tr < 0.90) { type = 'Emergency'; los = between(rng, 1, 4); }
      else { type = 'Daycare'; los = 1; }

      if (type !== 'OPD') {
        const admitN = Math.min(WINDOW_DAYS, regN);
        const dischN = Math.max(0, admitN - los);
        admitted = prettyAgo(admitN, '10:30');
        status = 'Discharged';
        dischargeStatus = 'Completed';
        const w = IPD_WARDS.filter(x => !x.gender || x.gender === nm.gender);
        const wd = pick(rng, w.length ? w : IPD_WARDS);
        ward = type === 'Daycare' ? 'Day Care Unit' : type === 'Emergency' ? 'Emergency (Casualty)' : wd.name;
        wardKey = type === 'Daycare' ? 'DAYCARE' : type === 'Emergency' ? 'EMERGENCY' : wd.key;
        bed = '—'; // historical — not holding a live bed
        var dischargeDay = dischN;
      }

      const p = {
        uhid: uhid, name: nm.name, age: age, gender: nm.gender, type: type,
        ward: ward, wardKey: wardKey, bed: bed, los: los,
        status: status, primaryConsultant: doc.name, department: spec,
        payer: pay.payer, payerType: pay.payerType, preAuthStatus: pay.payerType === 'Cash' ? '—' : pick(rng, ['LOA ✓', 'LOA ✓', 'Settled', 'Approved']),
        mobile: '98' + String(between(rng, 10000000, 99999999)),
        email: emailUser + '@' + pick(rng, EMAIL_DOM),
        address: locality + ', Bengaluru, Karnataka ' + between(rng, 560001, 560103),
        location: 'Bengaluru — Main Campus', leadSource: pick(rng, LEAD),
        bloodGroup: pick(rng, BLOOD), allergies: pick(rng, ALLERGIES),
        alerts: [], newsScore: type === 'Emergency' ? between(rng, 1, 4) : between(rng, 0, 1), flags: [],
        admitted: admitted,
        registrationDate: isoAgo(regN),
        ipNumber: (type === 'IPD' || type === 'Emergency' || type === 'Daycare') ? 'IP-25' + String(5001 + i) : '—',
        opNumber: type === 'OPD' ? 'OP-25' + String(5001 + i) : '—',
        vitals: makeVitals(rng, age),
        vitalsOverdue: false, labsUnreviewed: false,
        prescriptions: [],
        clinicalData: { complaint: complaint, hpi: 'Patient presented with ' + complaint.toLowerCase() + '. Evaluated by ' + doc.name + '.', examination: 'Systemic examination done. ' + (type === 'Emergency' ? 'Stabilised in casualty.' : 'No acute distress.'), diagnosis: dx, treatmentPlan: 'Managed as per ' + spec + ' protocol.', carePlan: type === 'OPD' ? 'OPD follow-up in 2 weeks.' : 'Discharged in stable condition with advice.' },
        history: { pastConditions: pick(rng, ['None significant', 'Hypertension', 'Type 2 Diabetes', 'Hypothyroidism', 'None significant']), surgeries: pick(rng, ['None', 'None', 'Appendectomy (2019)', 'LSCS (2021)']), familyHistory: pick(rng, ['Non-contributory', 'Diabetes (father)', 'Hypertension (mother)', 'Non-contributory']) },
        dischargeClearances: { clinical: type !== 'OPD', billing: type !== 'OPD', summaryReady: type !== 'OPD' },
        dischargeStatus: dischargeStatus,
        timelineEvents: [{ date: admitted, type: 'registration', icon: '📋', title: (type === 'OPD' ? 'OPD Registration' : type + ' Admission'), desc: nm.name + ' registered under ' + doc.name + '. ' + complaint }],
        icdCode: icd, mlcNumber: type === 'Emergency' && rng() < 0.4 ? 'MLC-2026-' + between(rng, 100, 999) : null
      };
      if (type !== 'OPD') {
        p.timelineEvents.push({ date: prettyAgo(dischargeDay, '15:00'), type: 'discharge', icon: '🏠', title: 'Discharged', desc: 'Discharged in stable condition after ' + los + ' day(s). Follow-up advised.' });
      }
      s.patients.push(p);
      created.push({ p: p, regN: regN, doc: doc, spec: spec, rng: rng });
    }
    return created;
  }

  /* ── Consultations: ≥10 per doctor (today's list + historical) ─────────── */
  function seedConsultations(created) {
    const s = window.state;
    s.appointments = s.appointments || [];
    s.opdQueue = s.opdQueue || [];
    // group created patients by department for realistic subject assignment
    const byDept = {};
    created.forEach(c => { (byDept[c.spec] = byDept[c.spec] || []).push(c.p); });

    let apptSeq = 0, tokenSeq = 500;
    const TODAY = isoAgo(0);
    // status distribution for today's day list
    const todayStatuses = ['Completed', 'Completed', 'Completed', 'In-Consultation', 'Waiting', 'Waiting', 'Waiting', 'Checked-in', 'Checked-in', 'Waiting', 'Completed', 'Waiting'];

    s.doctors.forEach((doc, di) => {
      const spec = doc.specialty || doc.spec;
      const pool = (byDept[spec] && byDept[spec].length ? byDept[spec] : created.map(c => c.p));
      const rng = mulberry32(900000 + di * 40503);

      // 12 consultations TODAY (the live day list / queue)
      for (let k = 0; k < 12; k++) {
        const subj = pool[(k + di) % pool.length];
        const st = todayStatuses[k % todayStatuses.length];
        s.appointments.push({
          id: 'APT-D' + String(++apptSeq),
          uhid: subj.uhid, patientName: subj.name, doctorName: doc.name,
          spec: spec, deptName: spec, date: TODAY, time: OPD_TIMES[k % OPD_TIMES.length],
          status: st, type: 'OPD Regular', visitType: rng() < 0.5 ? 'New' : 'Follow-up',
          mobile: subj.mobile, gender: subj.gender, age: subj.age,
          checkedInTime: (st === 'Waiting' || st === 'Checked-in' || st === 'In-Consultation' || st === 'Completed') ? OPD_TIMES[k % OPD_TIMES.length] : '',
          waitTime: (st === 'Waiting' || st === 'Checked-in') ? between(rng, 5, 55) : 0
        });
        // live token for those still in queue
        if (st === 'Waiting' || st === 'Checked-in' || st === 'In-Consultation') {
          s.opdQueue.push({
            token: 'OPD-TK-' + (++tokenSeq), patient: subj.name, uhid: subj.uhid,
            doctor: doc.name, speciality: spec,
            status: st === 'In-Consultation' ? 'In Consultation' : st,
            time: OPD_TIMES[k % OPD_TIMES.length], waitTime: between(rng, 5, 55)
          });
        }
      }
      // 6 historical completed consultations spread across the window
      for (let h = 0; h < 6; h++) {
        const subj = pool[(h * 3 + di) % pool.length];
        const n = between(rng, 3, WINDOW_DAYS);
        s.appointments.push({
          id: 'APT-D' + String(++apptSeq),
          uhid: subj.uhid, patientName: subj.name, doctorName: doc.name,
          spec: spec, deptName: spec, date: isoAgo(n), time: pick(rng, OPD_TIMES),
          status: 'Completed', type: 'OPD Regular', visitType: 'Follow-up',
          mobile: subj.mobile, gender: subj.gender, age: subj.age,
          checkedInTime: pick(rng, OPD_TIMES), waitTime: 0
        });
      }
    });
  }

  /* ── Invoices, lab & radiology orders (6-month volume) ─────────────────── */
  function seedFinancialsAndDiagnostics(created) {
    const s = window.state;
    s.billing = s.billing || [];
    s.labOrders = s.labOrders || [];
    s.radOrders = s.radOrders || [];

    const LAB_TESTS = [['Complete Blood Count', 'Haematology', 'lavender', 350], ['Fasting Blood Sugar', 'Biochemistry', 'grey', 120], ['HbA1c', 'Biochemistry', 'lavender', 550], ['Lipid Profile', 'Biochemistry', 'yellow', 800], ['Liver Function Test', 'Biochemistry', 'yellow', 900], ['Kidney Function Test', 'Biochemistry', 'yellow', 850], ['Thyroid Profile (T3 T4 TSH)', 'Immunoassay', 'yellow', 750], ['Urine Routine', 'Clinical Pathology', 'yellow', 200], ['Serum Electrolytes', 'Biochemistry', 'yellow', 450], ['CRP (Quantitative)', 'Immunoassay', 'yellow', 600]];
    const RAD_STUDIES = [['Chest X-Ray PA View', 'X-Ray', 'ROOM-XR1', 600], ['USG Abdomen & Pelvis', 'Ultrasound', 'ROOM-US1', 1500], ['CT Brain Plain', 'CT', 'ROOM-CT1', 3500], ['MRI Lumbar Spine', 'MRI', 'ROOM-MR1', 8500], ['2D Echocardiography', 'Echo', 'ROOM-ECHO', 2500], ['Mammography Bilateral', 'Mammo', 'ROOM-MG1', 2200], ['X-Ray Knee AP/Lateral', 'X-Ray', 'ROOM-XR2', 700]];

    let invSeq = 0, labSeq = 0, radSeq = 0;

    created.forEach((c, i) => {
      const rng = c.rng, p = c.p, n = c.regN;
      const old = n > 20; // older invoices are more likely settled

      // ── Invoice per patient (consultation or admission)
      let items;
      if (p.type === 'OPD') {
        const fee = between(rng, 500, 1500);
        items = [{ desc: p.department + ' Consultation', qty: 1, rate: fee, total: fee }];
        if (rng() < 0.5) { const proc = between(rng, 200, 1200); items.push({ desc: 'Procedure / Dressing Charges', qty: 1, rate: proc, total: proc }); }
      } else {
        const wardRate = (IPD_WARDS.find(w => w.key === p.wardKey) || { rate: 3000 }).rate;
        const days = Math.max(1, p.los);
        const nursing = 800 * days;
        items = [
          { desc: p.ward + ' — Room Charges (' + days + ' days)', qty: days, rate: wardRate, total: wardRate * days },
          { desc: 'Nursing & Monitoring Charges', qty: days, rate: 800, total: nursing },
          { desc: 'Consultant Visit Charges', qty: days, rate: 600, total: 600 * days },
          { desc: 'Pharmacy & Consumables', qty: 1, rate: between(rng, 1500, 9000), total: 0 }
        ];
        items[3].total = items[3].rate;
      }
      const amount = items.reduce((a, x) => a + x.total, 0);
      let paid, status;
      if (old && rng() < 0.85) { paid = amount; status = 'Paid'; }
      else if (rng() < 0.5) { paid = Math.round(amount * (rng() * 0.5 + 0.2)); status = 'Partial'; }
      else { paid = 0; status = p.payerType === 'Cash' ? 'Outstanding' : 'Credit Approved'; }
      s.billing.push({
        id: 'INV-D' + String(9000 + (++invSeq)), uhid: p.uhid, patientName: p.name,
        amount: amount, paid: paid, status: status, date: isoAgo(n),
        payer: p.payer, department: p.department, items: items
      });

      // ── Lab order for ~55% of patients
      if (rng() < 0.55) {
        const t = pick(rng, LAB_TESTS);
        const ln = between(rng, 0, Math.min(n + 1, WINDOW_DAYS));
        s.labOrders.push({
          id: 'LO-D' + String(++labSeq), uhid: p.uhid, patientName: p.name,
          ward: p.type === 'OPD' ? 'OPD' : (p.ward || 'IPD'), test: t[0], dept: t[1], tube: t[2],
          priority: pick(rng, ['Routine', 'Routine', 'Urgent']), orderedBy: p.primaryConsultant,
          orderedAt: isoAgo(ln), status: ln > 3 ? pick(rng, ['Completed', 'Resulted', 'Verified']) : pick(rng, ['Pending', 'Collected', 'In-Process']),
          accNo: 'ACC-2026-' + String(10000 + labSeq)
        });
      }
      // ── Radiology order for ~35% of patients
      if (rng() < 0.35) {
        const st = pick(rng, RAD_STUDIES);
        const rn = between(rng, 0, Math.min(n + 1, WINDOW_DAYS));
        s.radOrders.push({
          id: 'RO-D' + String(++radSeq), uhid: p.uhid, patientName: p.name,
          ward: p.type === 'OPD' ? 'OPD' : (p.ward || 'IPD'), study: st[0], modality: st[1],
          priority: pick(rng, ['Routine', 'Routine', 'Urgent']), orderedBy: p.primaryConsultant,
          orderedAt: isoAgo(rn), status: rn > 3 ? pick(rng, ['Reported', 'Completed', 'Verified']) : pick(rng, ['Scheduled', 'In-Progress', 'Awaiting Report']),
          room: st[2], studyId: 'STD-2026-' + String(20000 + radSeq)
        });
      }
    });
  }

  waitAndSeed();
})();
