/* ==========================================================================
   SARONIL HIS — 100 PRODUCTION-READY PATIENTS (patients100.js)
   Adds 100 realistic patients across all specialties — OPD, IPD, Emergency,
   Daycare — for universal prototype use. Runs after productionSeed.js.
   All dates dynamic via window._HIS_PRETTY / window._HIS_DATE helpers.
   All UHIDs: SH-2026-04891 through SH-2026-04990
   Specialty coverage:
     General Medicine · Cardiology · Orthopedics · Gynecology & Obs ·
     Pediatrics · General Surgery · Neurology · Psychiatry · Oncology ·
     Pulmonology · Endocrinology · Nephrology · Urology · Gastroenterology ·
     ENT · Ophthalmology · Dermatology · Rheumatology
   Payer mix: Cash (30%), TPA/Insurance (40%), CGHS/ECHS (15%), PMJAY (10%), ESI (5%)
   ========================================================================== */

(function () {
  'use strict';

  /* ── Date helpers ──────────────────────────────────────────────────────── */
  const T  = () => window._HIS_TODAY        || new Date().toISOString().slice(0, 10);
  const P  = (n, t) => window._HIS_PRETTY ? window._HIS_PRETTY(n, t) : new Date(Date.now() - n * 86400000).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + (t ? ' · ' + t : '');
  const D  = (n) => window._HIS_DATE   ? window._HIS_DATE(n) : new Date(Date.now() - n * 86400000).toISOString().slice(0, 10);

  /* ── Wait for state ────────────────────────────────────────────────────── */
  function waitAndSeed() {
    if (!window.state || !window.state.patients) { setTimeout(waitAndSeed, 80); return; }
    seedPatients();
    seedWardBeds();
    reconcileBeds();
    seedAlerts();
    console.log('[Patients100] ✅ 100 production patients seeded.');
  }

  /* ── Clinical safety alerts tied to real patients ──────────────────────── */
  function seedAlerts() {
    if (!Array.isArray(window.state.alerts) || window.state.alerts.length) return;
    const pts = window.state.patients;
    const pick = (n) => pts[n % pts.length];
    const allergic = pts.filter(p => p.allergies && p.allergies !== 'None' && p.allergies !== '—');
    const highNews = pts.filter(p => (p.newsScore || 0) >= 3);
    const inpatients = pts.filter(p => p.type !== 'OPD');

    // [severity, source, eStatus, status, details, timeOffset, timeStr]
    const scenarios = [
      ['Hard Stop', 'EMR Prescribing (CDSS)', 'Escalated', 'Active', 'Prescribed cefixime conflicts with documented penicillin/cephalosporin allergy. Order blocked pending clinician override.', 0, '08:20'],
      ['Hard Stop', 'Pharmacy Dispensing', 'Escalated', 'Active', 'Potassium chloride IV order exceeds safe infusion rate (>10 mEq/hr). Dispense halted for pharmacist review.', 0, '09:05'],
      ['Critical Safety Alert', 'Nursing Vitals (NEWS2)', 'Escalated', 'Active', 'NEWS2 score 7 — SpO₂ 88% on room air, RR 26. Rapid Response Team notified for possible sepsis.', 0, '07:45'],
      ['Critical Safety Alert', 'Laboratory Critical Value', 'Pending', 'Active', 'Critical serum potassium 6.8 mmol/L reported. Repeat sample and ECG requested; endocrine consult raised.', 0, '10:15'],
      ['Critical Safety Alert', 'Radiology Reporting', 'Pending', 'Active', 'CT head flagged acute subdural haemorrhage. Neurosurgery on-call paged for urgent review.', 0, '11:30'],
      ['High Risk', 'Nursing Assessment', 'Monitored', 'Active', 'Morse Fall Scale 65 — high fall risk. Bed rails up, hourly rounding and yellow wristband applied.', 1, '14:10'],
      ['High Risk', 'EMR Prescribing (CDSS)', 'Monitored', 'Active', 'Warfarin + azithromycin interaction — INR monitoring advised; consider dose reduction.', 1, '15:25'],
      ['High Risk', 'Infection Control', 'Monitored', 'Active', 'MRSA screen positive. Contact isolation precautions initiated; cohort nursing arranged.', 1, '16:40'],
      ['Warning', 'Nursing Vitals', 'Pending', 'Active', 'Vitals observation overdue by 45 minutes for this admitted patient. Nursing station reminded.', 0, '12:05'],
      ['Warning', 'Billing & TPA', 'Pending', 'Active', 'Insurance pre-authorization nearing expiry in 24 hours. Enhancement request recommended.', 2, '13:20'],
      ['Warning', 'Pharmacy Stock', 'Pending', 'Active', 'Duplicate proton-pump inhibitor order detected across two active prescriptions. Reconcile advised.', 2, '11:50'],
      ['Info', 'Care Coordination', 'Monitored', 'Resolved', 'Discharge medication counselling completed and documented. Follow-up scheduled in OPD.', 3, '10:30'],
      ['Info', 'Dietetics', 'Monitored', 'Resolved', 'Diabetic diet plan reviewed and confirmed with patient. No further action required.', 3, '09:40'],
      ['High Risk', 'Laboratory Critical Value', 'Pending', 'Active', 'Haemoglobin 6.4 g/dL — severe anaemia. Cross-match requested; transfusion consent in progress.', 1, '08:55']
    ];

    // Prefer real patients whose profile matches the scenario, else round-robin.
    const preferred = [
      allergic[0], allergic[1] || allergic[0], highNews[0], highNews[1] || pick(3),
      highNews[2] || pick(5), inpatients[4], inpatients[7], inpatients[10],
      inpatients[2], pick(20), pick(24), pick(30), pick(34), highNews[3] || pick(12)
    ];

    window.state.alerts = scenarios.map((sc, i) => {
      const p = preferred[i] || pick(i);
      return {
        id: 'ALERT-' + String(4001 + i),
        severity: sc[0],
        source: sc[1],
        eStatus: sc[2],
        status: sc[3],
        uhid: p.uhid,
        patientName: p.name,
        details: sc[4],
        clinician: p.primaryConsultant || 'Dr. Srinivasan',
        time: P(sc[5], sc[6])
      };
    });
  }

  /* ── Reconcile bed occupancy from patient records (single source of truth) ─
     Every admitted non-OPD patient holding a real bed marks that bed Occupied;
     any bed flagged Occupied without a matching active inpatient is released.
     Keeps the IPD-census KPI (occupied beds) exactly aligned with the roster. */
  function reconcileBeds() {
    const bs = window.state.bedsStatus;
    if (!bs) return;
    const hasBed = (p) => p.bed && p.bed !== '—' && p.bed !== '' && bs[p.bed];
    const active = window.state.patients.filter(p =>
      p.type !== 'OPD' && !/discharg/i.test(p.status || '') && hasBed(p));
    const claimed = new Set();

    // Pick an unclaimed bed, preferring the same ward as the patient.
    const freeBed = (wardKey) => {
      const ids = Object.keys(bs);
      let cand = ids.find(k => !claimed.has(k) && bs[k].wardKey === wardKey);
      if (!cand) cand = ids.find(k => !claimed.has(k));
      return cand || null;
    };

    active.forEach(p => {
      let bedId = p.bed;
      // Resolve double-booking: if this bed is already taken by someone else,
      // move the patient to a free bed (same ward first) and sync their record.
      if (claimed.has(bedId)) {
        const alt = freeBed(bs[bedId].wardKey || p.wardKey);
        if (alt) { bedId = alt; p.bed = alt; }
        else return; // no beds left (should not happen: 87 beds > roster)
      }
      const dx = (p.clinicalData && p.clinicalData.diagnosis) || (p.clinicalData && p.clinicalData.complaint) || '';
      bs[bedId].status = 'Occupied';
      bs[bedId].patientUhid = p.uhid;
      bs[bedId].wardKey = bs[bedId].wardKey || p.wardKey || null;
      bs[bedId].notes = (p.primaryConsultant ? p.primaryConsultant + ' · ' : '') + dx;
      claimed.add(bedId);
    });
    // Release stale occupancy (occupied but no active inpatient points here).
    Object.keys(bs).forEach(k => {
      if (bs[k].status === 'Occupied' && !claimed.has(k)) {
        bs[k].status = 'Available'; bs[k].patientUhid = null; bs[k].notes = '';
      }
    });
  }

  /* ── Expand ward beds to support more patients ─────────────────────────── */
  function seedWardBeds() {
    const expand = {
      'GENERAL-WARD-M': ['GW(M)-409','GW(M)-410','GW(M)-411','GW(M)-412','GW(M)-413','GW(M)-414','GW(M)-415','GW(M)-416','GW(M)-417','GW(M)-418','GW(M)-419','GW(M)-420'],
      'GENERAL-WARD-F': ['GW(F)-414','GW(F)-415','GW(F)-416','GW(F)-417','GW(F)-418','GW(F)-419','GW(F)-420','GW(F)-421','GW(F)-422','GW(F)-423','GW(F)-424','GW(F)-425'],
      'SEMI-PRIVATE':   ['SP-301','SP-302','SP-303','SP-304','SP-305','SP-306','SP-307','SP-308','SP-309','SP-310','SP-311','SP-312'],
      'PRIVATE':        ['PVT-201','PVT-202','PVT-203','PVT-204','PVT-205','PVT-206','PVT-207','PVT-208','PVT-209','PVT-210'],
      'DELUXE':         ['DELUXE-401','DELUXE-402','DELUXE-403','DELUXE-404','DELUXE-405','DELUXE-406'],
      'HDU':            ['HDU-01','HDU-02','HDU-03','HDU-04','HDU-05','HDU-06'],
      'CCU':            ['CCU-BED-01','CCU-BED-02','CCU-BED-03','CCU-BED-04','CCU-BED-05','CCU-BED-06'],
      'ICCU':           ['ICCU-BED-01','ICCU-BED-02','ICCU-BED-03','ICCU-BED-04','ICCU-BED-05'],
      'EMERGENCY':      ['EMG-01','EMG-02','EMG-03','EMG-04','EMG-05','EMG-06','EMG-07','EMG-08'],
      'DAYCARE':        ['DC-B1','DC-B2','DC-B3','DC-B4','DC-B5','DC-B6','DC-B7','DC-B8','DC-B9','DC-B10']
    };
    for (const [key, beds] of Object.entries(expand)) {
      if (window.state.wards[key]) {
        window.state.wards[key].beds = beds;
        beds.forEach(b => {
          if (!window.state.bedsStatus[b]) {
            window.state.bedsStatus[b] = { wardKey: key, status: 'Available', patientUhid: null, notes: '' };
          }
        });
      } else {
        window.state.wards[key] = { name: key, beds: beds, price: (window.WARD_RATES||{})[key]?.rate || 2000 };
        beds.forEach(b => {
          window.state.bedsStatus[b] = { wardKey: key, status: 'Available', patientUhid: null, notes: '' };
        });
      }
    }
  }

  function occupyBed(bedId, wardKey, uhid, notes) {
    if (window.state.bedsStatus[bedId]) {
      window.state.bedsStatus[bedId] = { wardKey, status: 'Occupied', patientUhid: uhid, notes: notes || '' };
    }
  }

  /* ── Core patient template ─────────────────────────────────────────────── */
  function mkPatient(o) {
    const existing = (window.state.patients || []).find(p => p.uhid === o.uhid);
    if (existing) return;
    const p = {
      uhid: o.uhid,
      name: o.name,
      age: o.age,
      gender: o.gender,
      type: o.type || 'OPD',
      ward: o.ward || '—',
      wardKey: o.wardKey || null,
      bed: o.bed || '—',
      los: o.los || 0,
      status: o.status || (o.type === 'OPD' ? 'In Consultation' : 'Admitted'),
      primaryConsultant: o.consultant,
      department: o.dept,
      payer: o.payer,
      payerType: o.payerType || 'Cash',
      preAuthStatus: o.preAuthStatus || '—',
      mobile: o.mobile || ('98' + String(Math.floor(Math.random() * 100000000)).padStart(8, '0')),
      bloodGroup: o.bg || 'B+',
      allergies: o.allergies || 'None',
      alerts: o.alerts || [],
      newsScore: o.news || 0,
      flags: o.flags || [],
      admitted: o.admitted || P(0, '09:00'),
      ipNumber: o.type === 'IPD' || o.type === 'Emergency' ? (o.ipNo || 'IP-' + o.uhid.split('-')[2]) : '—',
      opNumber: o.type === 'OPD' ? (o.opNo || 'OP-' + o.uhid.split('-')[2]) : '—',
      vitals: o.vitals || { bp: '120/80', hr: 74, temp: 98.4, spo2: 99, weight: 65, bmi: 22.5, pain: 0, rr: 16 },
      vitalsOverdue: false,
      labsUnreviewed: false,
      prescriptions: o.rx || [],
      clinicalData: o.clinical || { complaint: o.complaint || 'Routine consultation', hpi: 'Patient presented for consultation.', examination: 'NAD', diagnosis: o.dx || 'Under evaluation', treatmentPlan: 'As per consultant advice', carePlan: 'OPD follow-up as required' },
      history: o.history || { pastConditions: 'None', surgeries: 'None', familyHistory: 'None' },
      dischargeClearances: { clinical: false, billing: false, summaryReady: false },
      timelineEvents: o.timeline || [{ date: o.admitted || P(0, '09:00'), type: 'registration', icon: '📋', title: (o.type === 'OPD' ? 'OPD Registration' : 'IPD Admission'), desc: `${o.name} registered under ${o.consultant}. ${o.complaint || ''}` }],
      mlcNumber: o.mlc || null,
      icdCode: o.icd || null
    };
    window.state.patients.push(p);
    // Occupy bed if IPD/Emergency/Daycare
    if ((o.type === 'IPD' || o.type === 'Emergency' || o.type === 'Daycare') && o.wardKey && o.bed && o.bed !== '—') {
      occupyBed(o.bed, o.wardKey, o.uhid, o.consultant + ' · ' + (o.dx || ''));
    }
    // Seed appointment for OPD patients
    if (o.type === 'OPD') {
      const apptExists = (window.state.appointments || []).find(a => a.uhid === o.uhid);
      if (!apptExists) {
        window.state.appointments.push({
          id: 'APT-' + o.uhid,
          uhid: o.uhid,
          patientName: o.name,
          doctorName: o.consultant,
          spec: o.dept,
          deptName: o.dept,
          date: T(),
          time: o.time || '10:00 AM',
          status: o.apptStatus || 'Checked-in',
          type: 'OPD Regular',
          visitType: o.visitType || 'New',
          mobile: o.mobile || '9800000000',
          gender: o.gender,
          age: o.age,
          waitTime: o.waitTime || Math.floor(Math.random() * 45 + 5)
        });
      }
    }
  }

  function seedPatients() {

    /* ══════════════════════════════════════════════════════════════════════
       GENERAL MEDICINE — 12 patients (6 OPD + 6 IPD)
    ══════════════════════════════════════════════════════════════════════ */
    mkPatient({ uhid:'SH-2026-04891', name:'Ramnarayan Tiwari', age:58, gender:'Male', type:'OPD', dept:'General Medicine', consultant:'Dr. Srinivasan', payer:'CGHS', payerType:'Govt Scheme', complaint:'Persistent cough for 3 weeks, mild fever', dx:'Suspected LRTI / Pulmonary Koch\'s', icd:'J06.9', bg:'B+', admitted:P(0,'09:15'), time:'09:15 AM', visitType:'New', news:0, opNo:'OP-241001' });
    mkPatient({ uhid:'SH-2026-04892', name:'Geeta Rani Sharma', age:63, gender:'Female', type:'OPD', dept:'General Medicine', consultant:'Dr. Srinivasan', payer:'Self Pay', payerType:'Cash', complaint:'Generalized weakness, fatigue for 2 weeks', dx:'Anaemia — evaluation needed', icd:'D64.9', bg:'A+', admitted:P(0,'09:30'), time:'09:30 AM', visitType:'Follow-up', news:0, opNo:'OP-241002' });
    mkPatient({ uhid:'SH-2026-04893', name:'Mohan Lal Verma', age:49, gender:'Male', type:'OPD', dept:'General Medicine', consultant:'Dr. Srinivasan', payer:'Star Health', payerType:'TPA/Insurance', complaint:'Elevated blood sugar — follow-up', dx:'Type 2 Diabetes Mellitus', icd:'E11.9', bg:'O+', admitted:P(0,'10:00'), time:'10:00 AM', visitType:'Follow-up', news:0, opNo:'OP-241003' });
    mkPatient({ uhid:'SH-2026-04894', name:'Padmavathi Nair', age:71, gender:'Female', type:'OPD', dept:'General Medicine', consultant:'Dr. Srinivasan', payer:'PMJAY', payerType:'Govt Scheme', complaint:'Knee pain and swelling', dx:'Osteoarthritis (bilateral knees)', icd:'M17.1', bg:'B-', admitted:P(0,'10:45'), time:'10:45 AM', visitType:'New', news:0, opNo:'OP-241004' });
    mkPatient({ uhid:'SH-2026-04895', name:'Santosh Kumar Gupta', age:36, gender:'Male', type:'OPD', dept:'General Medicine', consultant:'Dr. Srinivasan', payer:'New India Assurance', payerType:'TPA/Insurance', complaint:'Recurrent headaches, dizziness', dx:'Tension-type headache', icd:'G44.2', bg:'A-', admitted:P(0,'11:00'), time:'11:00 AM', visitType:'New', news:0, opNo:'OP-241005' });
    mkPatient({ uhid:'SH-2026-04896', name:'Lakshmi Bai Patel', age:44, gender:'Female', type:'OPD', dept:'General Medicine', consultant:'Dr. Srinivasan', payer:'ESI', payerType:'Govt Scheme', complaint:'Abdominal pain, loose stools ×3 days', dx:'Acute Gastroenteritis', icd:'A09', bg:'O+', admitted:P(0,'11:30'), time:'11:30 AM', visitType:'New', news:0, opNo:'OP-241006' });
    // IPD
    mkPatient({ uhid:'SH-2026-04897', name:'Ranjit Singh Yadav', age:55, gender:'Male', type:'IPD', wardKey:'GENERAL-WARD-M', ward:'General Ward (Male)', bed:'GW(M)-414', los:2, dept:'General Medicine', consultant:'Dr. Srinivasan', payer:'United India', payerType:'TPA/Insurance', preAuthStatus:'LOA ✓', complaint:'High fever, rigors for 4 days', dx:'Malaria (P. Vivax)', icd:'B51.9', bg:'B+', admitted:P(2,'08:30'), news:2, alerts:['Fever'], ipNo:'IP-241007', vitals:{ bp:'106/70', hr:102, temp:102.4, spo2:96, weight:68, bmi:22.3, pain:2, rr:20 }, rx:[{ name:'Tab Chloroquine 500mg', dose:'1 tab', freq:'Twice daily', duration:'3 days', generic:'Chloroquine', route:'Oral', active:true }] });
    mkPatient({ uhid:'SH-2026-04898', name:'Pushpa Devi Sharma', age:67, gender:'Female', type:'IPD', wardKey:'GENERAL-WARD-F', ward:'General Ward (Female)', bed:'GW(F)-419', los:3, dept:'General Medicine', consultant:'Dr. Srinivasan', payer:'CGHS', payerType:'Govt Scheme', complaint:'Breathlessness, pedal oedema — COPD exacerbation', dx:'COPD Exacerbation (GOLD Stage III)', icd:'J44.1', bg:'A+', admitted:P(3,'09:45'), news:4, alerts:['SpO2 Low'], ipNo:'IP-241008', vitals:{ bp:'140/90', hr:98, temp:98.8, spo2:91, weight:72, bmi:25.6, pain:1, rr:24 }, rx:[{ name:'Inj Hydrocortisone 100mg', dose:'1 vial', freq:'Q6H', duration:'3 days', generic:'Hydrocortisone', route:'IV', active:true }] });
    mkPatient({ uhid:'SH-2026-04899', name:'Krishnamurthy Iyer', age:52, gender:'Male', type:'IPD', wardKey:'SEMI-PRIVATE', ward:'Semi-Private Ward', bed:'SP-306', los:1, dept:'General Medicine', consultant:'Dr. Srinivasan', payer:'HDFC ERGO', payerType:'TPA/Insurance', complaint:'New onset hypertension, BP 180/112', dx:'Hypertensive Urgency', icd:'I10', bg:'O+', admitted:P(1,'11:00'), news:3, alerts:[], ipNo:'IP-241009', vitals:{ bp:'158/96', hr:88, temp:98.4, spo2:98, weight:80, bmi:26.8, pain:1, rr:18 }, rx:[{ name:'Tab Amlodipine 5mg', dose:'1 tab', freq:'Once daily', duration:'30 days', generic:'Amlodipine', route:'Oral', active:true }] });
    mkPatient({ uhid:'SH-2026-04900', name:'Kavitha Krishnan', age:39, gender:'Female', type:'IPD', wardKey:'GENERAL-WARD-F', ward:'General Ward (Female)', bed:'GW(F)-420', los:2, dept:'General Medicine', consultant:'Dr. Srinivasan', payer:'Self Pay', payerType:'Cash', complaint:'High fever, rash — Dengue suspected', dx:'Dengue Fever (NS1 Positive)', icd:'A97.0', bg:'AB+', admitted:P(2,'10:15'), news:3, alerts:['Platelet Low'], ipNo:'IP-241010', vitals:{ bp:'100/65', hr:108, temp:103.2, spo2:97, weight:54, bmi:20.2, pain:2, rr:20 }, rx:[{ name:'Inj NS 0.9%', dose:'100 ml/h', freq:'Continuous', duration:'2 days', generic:'Normal Saline', route:'IV', active:true }] });
    mkPatient({ uhid:'SH-2026-04901', name:'Suryanarayana Rao', age:61, gender:'Male', type:'IPD', wardKey:'SEMI-PRIVATE', ward:'Semi-Private Ward', bed:'SP-307', los:4, dept:'General Medicine', consultant:'Dr. Srinivasan', payer:'Oriental Insurance', payerType:'TPA/Insurance', complaint:'Fever, arthralgia, rash — Chikungunya', dx:'Chikungunya Fever', icd:'A92.0', bg:'B+', admitted:P(4,'08:00'), news:1, alerts:[], ipNo:'IP-241011', vitals:{ bp:'122/80', hr:82, temp:100.1, spo2:98, weight:74, bmi:24.5, pain:3, rr:16 }, rx:[{ name:'Tab Paracetamol 650mg', dose:'1 tab', freq:'TDS', duration:'5 days', generic:'Paracetamol', route:'Oral', active:true }] });
    mkPatient({ uhid:'SH-2026-04902', name:'Annapurna Devi', age:48, gender:'Female', type:'IPD', wardKey:'GENERAL-WARD-F', ward:'General Ward (Female)', bed:'GW(F)-421', los:2, dept:'General Medicine', consultant:'Dr. Srinivasan', payer:'Star Health', payerType:'TPA/Insurance', complaint:'Altered sensorium, high fever — Cerebral Malaria', dx:'Severe Malaria — Cerebral', icd:'B50.0', bg:'O-', admitted:P(2,'02:30'), news:6, alerts:['Critical','Altered Sensorium'], flags:['Critical'], ipNo:'IP-241012', vitals:{ bp:'100/60', hr:118, temp:104.2, spo2:93, weight:58, bmi:22.1, pain:0, rr:26 }, rx:[{ name:'Inj Artesunate 120mg', dose:'IV', freq:'As per protocol', duration:'7 days', generic:'Artesunate', route:'IV', active:true }] });

    /* ══════════════════════════════════════════════════════════════════════
       CARDIOLOGY — 10 patients (4 OPD + 6 IPD)
    ══════════════════════════════════════════════════════════════════════ */
    mkPatient({ uhid:'SH-2026-04903', name:'Jagdish Prasad Mehrotra', age:64, gender:'Male', type:'OPD', dept:'Cardiology', consultant:'Dr. Anand', payer:'Max Bupa', payerType:'TPA/Insurance', complaint:'Exertional chest pain — stable angina', dx:'Stable Angina Pectoris', icd:'I20.9', bg:'B+', admitted:P(0,'08:30'), time:'08:30 AM', visitType:'Follow-up', opNo:'OP-241013' });
    mkPatient({ uhid:'SH-2026-04904', name:'Vasantha Kumari', age:56, gender:'Female', type:'OPD', dept:'Cardiology', consultant:'Dr. Anand', payer:'Medi Assist', payerType:'TPA/Insurance', complaint:'Palpitations, irregular heartbeat', dx:'Paroxysmal Atrial Fibrillation', icd:'I48.0', bg:'A+', admitted:P(0,'09:00'), time:'09:00 AM', visitType:'New', opNo:'OP-241014' });
    mkPatient({ uhid:'SH-2026-04905', name:'Balachandran Pillai', age:72, gender:'Male', type:'OPD', dept:'Cardiology', consultant:'Dr. Anand', payer:'CGHS', payerType:'Govt Scheme', complaint:'Follow-up post PTCA 3 months ago', dx:'Post-PTCA — Stent in LAD', icd:'Z95.5', bg:'O+', admitted:P(0,'09:45'), time:'09:45 AM', visitType:'Follow-up', opNo:'OP-241015' });
    mkPatient({ uhid:'SH-2026-04906', name:'Meenakshi Sundaram', age:41, gender:'Female', type:'OPD', dept:'Cardiology', consultant:'Dr. Anand', payer:'Self Pay', payerType:'Cash', complaint:'Dyspnoea on exertion, mild cyanosis', dx:'Mitral Valve Regurgitation — Moderate', icd:'I34.0', bg:'AB-', admitted:P(0,'10:30'), time:'10:30 AM', visitType:'Referral', opNo:'OP-241016' });
    // IPD
    mkPatient({ uhid:'SH-2026-04907', name:'Krishnaswamy Naidu', age:68, gender:'Male', type:'IPD', wardKey:'CCU', ward:'Cardiac Care Unit (CCU)', bed:'CCU-BED-05', los:2, dept:'Cardiology', consultant:'Dr. Anand', payer:'United India', payerType:'TPA/Insurance', preAuthStatus:'LOA ✓', complaint:'Sudden chest pain, diaphoresis — Anterior STEMI', dx:'ST Elevation Myocardial Infarction (Anterior)', icd:'I21.0', bg:'B+', admitted:P(2,'03:15'), news:8, alerts:['Critical','STEMI'], flags:['Critical','MLC'], ipNo:'IP-241017', vitals:{ bp:'90/60', hr:110, temp:98.6, spo2:92, weight:78, bmi:25.8, pain:8, rr:22 }, rx:[{ name:'Inj Tenecteplase 40mg', dose:'IV bolus', freq:'Once', duration:'Once', generic:'Tenecteplase', route:'IV', active:true }] });
    mkPatient({ uhid:'SH-2026-04908', name:'Sarojini Patnaik', age:54, gender:'Female', type:'IPD', wardKey:'ICCU', ward:'Intensive Cardiac Care Unit (ICCU)', bed:'ICCU-BED-04', los:4, dept:'Cardiology', consultant:'Dr. Anand', payer:'Star Health', payerType:'TPA/Insurance', preAuthStatus:'LOA ✓', complaint:'Decompensated heart failure, BNP markedly elevated', dx:'Congestive Cardiac Failure — Decompensated', icd:'I50.9', bg:'A+', admitted:P(4,'06:00'), news:6, alerts:['Critical'], ipNo:'IP-241018', vitals:{ bp:'95/65', hr:122, temp:98.6, spo2:88, weight:88, bmi:31.2, pain:4, rr:28 }, rx:[{ name:'Inj Furosemide 40mg', dose:'1 amp', freq:'Q8H', duration:'5 days', generic:'Furosemide', route:'IV', active:true }] });
    mkPatient({ uhid:'SH-2026-04909', name:'Harish Chandra Agrawal', age:59, gender:'Male', type:'IPD', wardKey:'CCU', ward:'Cardiac Care Unit (CCU)', bed:'CCU-BED-06', los:1, dept:'Cardiology', consultant:'Dr. Anand', payer:'Max Bupa', payerType:'TPA/Insurance', preAuthStatus:'LOA ✓', complaint:'NSTEMI — chest pain at rest', dx:'Non-ST Elevation Myocardial Infarction', icd:'I21.4', bg:'O+', admitted:P(1,'22:00'), news:5, alerts:['Critical'], ipNo:'IP-241019', vitals:{ bp:'148/92', hr:96, temp:98.2, spo2:95, weight:82, bmi:27.1, pain:5, rr:20 }, rx:[{ name:'Tab Clopidogrel 300mg', dose:'Loading dose', freq:'Once', duration:'Once', generic:'Clopidogrel', route:'Oral', active:true }] });
    mkPatient({ uhid:'SH-2026-04910', name:'Indrani Bose', age:47, gender:'Female', type:'IPD', wardKey:'SEMI-PRIVATE', ward:'Semi-Private Ward', bed:'SP-308', los:3, dept:'Cardiology', consultant:'Dr. Anand', payer:'Bajaj Allianz', payerType:'TPA/Insurance', complaint:'Complete Heart Block — pacemaker implantation done', dx:'Complete AV Block — Post Pacemaker Implant', icd:'I44.2', bg:'B+', admitted:P(3,'08:00'), news:1, ipNo:'IP-241020', vitals:{ bp:'120/78', hr:68, temp:98.4, spo2:98, weight:65, bmi:23.4, pain:1, rr:16 }, rx:[{ name:'Tab Aspirin 75mg', dose:'1 tab', freq:'Once daily', duration:'Lifelong', generic:'Aspirin', route:'Oral', active:true }] });
    mkPatient({ uhid:'SH-2026-04911', name:'Narayanan Swamy', age:76, gender:'Male', type:'IPD', wardKey:'PRIVATE', ward:'Private Room', bed:'PVT-206', los:5, dept:'Cardiology', consultant:'Dr. Anand', payer:'Self Pay', payerType:'Cash', complaint:'Severe AS — awaiting TAVI evaluation', dx:'Severe Aortic Stenosis — TAVI Candidate', icd:'I35.0', bg:'AB+', admitted:P(5,'09:30'), news:3, ipNo:'IP-241021', vitals:{ bp:'160/98', hr:78, temp:98.4, spo2:96, weight:71, bmi:23.8, pain:2, rr:18 }, rx:[{ name:'Tab Bisoprolol 2.5mg', dose:'1 tab', freq:'Once daily', duration:'Till TAVI', generic:'Bisoprolol', route:'Oral', active:true }] });
    mkPatient({ uhid:'SH-2026-04912', name:'Subhadra Rao', age:62, gender:'Female', type:'IPD', wardKey:'SEMI-PRIVATE', ward:'Semi-Private Ward', bed:'SP-309', los:2, dept:'Cardiology', consultant:'Dr. Anand', payer:'ECHS', payerType:'Govt Scheme', complaint:'Hypertensive emergency — BP 220/140', dx:'Hypertensive Emergency with LVH', icd:'I11.0', bg:'O+', admitted:P(2,'21:30'), news:5, alerts:['BP Critical'], ipNo:'IP-241022', vitals:{ bp:'196/120', hr:102, temp:98.6, spo2:96, weight:77, bmi:27.0, pain:3, rr:20 }, rx:[{ name:'Inj Labetalol 20mg', dose:'IV bolus', freq:'SOS Q15 min', duration:'48h', generic:'Labetalol', route:'IV', active:true }] });

    /* ══════════════════════════════════════════════════════════════════════
       ORTHOPEDICS — 8 patients (3 OPD + 5 IPD)
    ══════════════════════════════════════════════════════════════════════ */
    mkPatient({ uhid:'SH-2026-04913', name:'Rajendra Singh Chouhan', age:54, gender:'Male', type:'OPD', dept:'Orthopedics', consultant:'Dr. Munna Kumar', payer:'CGHS', payerType:'Govt Scheme', complaint:'Right hip pain, restricted movement — OA hip', dx:'Osteoarthritis — Right Hip', icd:'M16.1', bg:'O+', admitted:P(0,'10:15'), time:'10:15 AM', visitType:'Referral', opNo:'OP-241023' });
    mkPatient({ uhid:'SH-2026-04914', name:'Nirmala Desai', age:42, gender:'Female', type:'OPD', dept:'Orthopedics', consultant:'Dr. Munna Kumar', payer:'Self Pay', payerType:'Cash', complaint:'Wrist pain post fall — rule out fracture', dx:'Distal Radius Fracture (Colles)', icd:'S52.5', bg:'A+', admitted:P(0,'11:00'), time:'11:00 AM', visitType:'New', apptStatus:'Checked-in', opNo:'OP-241024' });
    mkPatient({ uhid:'SH-2026-04915', name:'Prabhakaran Nambiar', age:38, gender:'Male', type:'OPD', dept:'Orthopedics', consultant:'Dr. Munna Kumar', payer:'Religare Health', payerType:'TPA/Insurance', complaint:'ACL tear right knee — post-op follow-up', dx:'ACL Reconstruction — Post-Op Week 4', icd:'Z96.651', bg:'B+', admitted:P(0,'11:30'), time:'11:30 AM', visitType:'Follow-up', opNo:'OP-241025' });
    // IPD
    mkPatient({ uhid:'SH-2026-04916', name:'Gopal Krishnan', age:72, gender:'Male', type:'IPD', wardKey:'SEMI-PRIVATE', ward:'Semi-Private Ward', bed:'SP-310', los:3, dept:'Orthopedics', consultant:'Dr. Munna Kumar', payer:'CGHS', payerType:'Govt Scheme', preAuthStatus:'Approved', complaint:'Post-op hip replacement — Day 3 recovery', dx:'Total Hip Replacement (Right) — Post-Op', icd:'Z96.641', bg:'B+', admitted:P(3,'07:00'), news:1, ipNo:'IP-241026', vitals:{ bp:'128/80', hr:76, temp:98.8, spo2:98, weight:72, bmi:24.5, pain:2, rr:16 }, rx:[{ name:'Inj Enoxaparin 40mg', dose:'0.4ml SC', freq:'Once daily', duration:'28 days', generic:'Enoxaparin', route:'SC', active:true }] });
    mkPatient({ uhid:'SH-2026-04917', name:'Ratna Bai Meena', age:58, gender:'Female', type:'IPD', wardKey:'GENERAL-WARD-F', ward:'General Ward (Female)', bed:'GW(F)-422', los:2, dept:'Orthopedics', consultant:'Dr. Munna Kumar', payer:'PMJAY', payerType:'Govt Scheme', complaint:'Pathological fracture lumbar vertebra', dx:'Osteoporotic Vertebral Fracture L3', icd:'M80.08', bg:'A+', admitted:P(2,'14:00'), news:2, ipNo:'IP-241027', vitals:{ bp:'118/76', hr:78, temp:98.4, spo2:99, weight:55, bmi:21.1, pain:4, rr:16 }, rx:[{ name:'Inj Zoledronic Acid 5mg/100ml', dose:'100ml IV', freq:'Once annually', duration:'Once', generic:'Zoledronic Acid', route:'IV Infusion', active:true }] });
    mkPatient({ uhid:'SH-2026-04918', name:'Vikram Rathore', age:29, gender:'Male', type:'IPD', wardKey:'GENERAL-WARD-M', ward:'General Ward (Male)', bed:'GW(M)-415', los:1, dept:'Orthopedics', consultant:'Dr. Munna Kumar', payer:'Max Bupa', payerType:'TPA/Insurance', complaint:'RTA — compound fracture tibia fibula right leg', dx:'Compound Fracture Tibia-Fibula Right Leg', icd:'S82.2', bg:'O-', admitted:P(1,'20:00'), news:3, alerts:['MLC'], flags:['MLC'], mlc:'MLC-2026-092', ipNo:'IP-241028', vitals:{ bp:'108/70', hr:102, temp:98.6, spo2:97, weight:74, bmi:23.3, pain:7, rr:20 }, rx:[{ name:'Inj Cefuroxime 1.5g', dose:'IV', freq:'Q8H', duration:'5 days', generic:'Cefuroxime', route:'IV', active:true }] });
    mkPatient({ uhid:'SH-2026-04919', name:'Sumalatha Reddy', age:45, gender:'Female', type:'IPD', wardKey:'PRIVATE', ward:'Private Room', bed:'PVT-207', los:4, dept:'Orthopedics', consultant:'Dr. Munna Kumar', payer:'Bajaj Allianz', payerType:'TPA/Insurance', complaint:'Total knee replacement — bilateral staged', dx:'Bilateral TKR — Stage 1 Right Knee', icd:'Z96.651', bg:'B-', admitted:P(4,'07:30'), news:1, ipNo:'IP-241029', vitals:{ bp:'126/82', hr:74, temp:98.6, spo2:99, weight:82, bmi:29.3, pain:2, rr:16 }, rx:[{ name:'Tab Tramadol 50mg', dose:'1 tab', freq:'Q8H SOS', duration:'7 days', generic:'Tramadol', route:'Oral', active:true }] });
    mkPatient({ uhid:'SH-2026-04920', name:'Chandrashekhar Nayak', age:22, gender:'Male', type:'IPD', wardKey:'GENERAL-WARD-M', ward:'General Ward (Male)', bed:'GW(M)-416', los:2, dept:'Orthopedics', consultant:'Dr. Munna Kumar', payer:'ESI', payerType:'Govt Scheme', complaint:'Dislocation shoulder joint right — recurrent', dx:'Recurrent Anterior Shoulder Dislocation (Right)', icd:'S43.0', bg:'AB+', admitted:P(2,'16:00'), news:1, ipNo:'IP-241030', vitals:{ bp:'118/76', hr:78, temp:98.4, spo2:99, weight:72, bmi:23.1, pain:3, rr:16 }, rx:[{ name:'Tab Ibuprofen 400mg', dose:'1 tab', freq:'TDS with food', duration:'5 days', generic:'Ibuprofen', route:'Oral', active:true }] });

    /* ══════════════════════════════════════════════════════════════════════
       GYNECOLOGY & OBSTETRICS — 10 patients (4 OPD + 6 IPD)
    ══════════════════════════════════════════════════════════════════════ */
    mkPatient({ uhid:'SH-2026-04921', name:'Asha Rani Tiwari', age:26, gender:'Female', type:'OPD', dept:'Gynecology & Obs', consultant:'Dr. Priya Nair', payer:'Self Pay', payerType:'Cash', complaint:'Antenatal check — 28 weeks, all normal', dx:'Normal Antenatal Care — 28 Weeks', icd:'Z34.2', bg:'A+', admitted:P(0,'08:30'), time:'08:30 AM', visitType:'Follow-up', opNo:'OP-241031' });
    mkPatient({ uhid:'SH-2026-04922', name:'Rekha Pillai', age:32, gender:'Female', type:'OPD', dept:'Gynecology & Obs', consultant:'Dr. Priya Nair', payer:'Star Health', payerType:'TPA/Insurance', complaint:'Vaginal bleeding first trimester — threatened abortion', dx:'Threatened Abortion — 10 Weeks POA', icd:'O20.0', bg:'O+', admitted:P(0,'09:00'), time:'09:00 AM', visitType:'New', apptStatus:'In-Consultation', opNo:'OP-241032' });
    mkPatient({ uhid:'SH-2026-04923', name:'Shobha Ranganathan', age:38, gender:'Female', type:'OPD', dept:'Gynecology & Obs', consultant:'Dr. Priya Nair', payer:'CGHS', payerType:'Govt Scheme', complaint:'Post-menopausal bleeding — evaluation', dx:'Postmenopausal Bleeding — Endometrial Biopsy Planned', icd:'N95.0', bg:'B+', admitted:P(0,'10:00'), time:'10:00 AM', visitType:'New', opNo:'OP-241033' });
    mkPatient({ uhid:'SH-2026-04924', name:'Vandana Singh', age:29, gender:'Female', type:'OPD', dept:'Gynecology & Obs', consultant:'Dr. Priya Nair', payer:'Self Pay', payerType:'Cash', complaint:'Primary infertility — evaluation with husband', dx:'Primary Infertility — PCOS', icd:'N97.0', bg:'A-', admitted:P(0,'11:15'), time:'11:15 AM', visitType:'New', opNo:'OP-241034' });
    // IPD
    mkPatient({ uhid:'SH-2026-04925', name:'Bharathi Subramaniam', age:27, gender:'Female', type:'IPD', wardKey:'PRIVATE', ward:'Private Room', bed:'PVT-208', los:2, dept:'Gynecology & Obs', consultant:'Dr. Priya Nair', payer:'Max Bupa', payerType:'TPA/Insurance', preAuthStatus:'LOA ✓', complaint:'Full term labour — admitted for LSCS', dx:'Full-Term Pregnancy — LSCS (Elective)', icd:'O82', bg:'O+', admitted:P(2,'06:00'), news:0, ipNo:'IP-241035', vitals:{ bp:'120/78', hr:82, temp:98.6, spo2:99, weight:74, bmi:25.6, pain:2, rr:18 }, rx:[{ name:'Inj Oxytocin 10IU', dose:'10 IU IM', freq:'After delivery', duration:'Once', generic:'Oxytocin', route:'IM', active:true }] });
    mkPatient({ uhid:'SH-2026-04926', name:'Saraswati Kumari', age:22, gender:'Female', type:'IPD', wardKey:'GENERAL-WARD-F', ward:'General Ward (Female)', bed:'GW(F)-423', los:1, dept:'Gynecology & Obs', consultant:'Dr. Priya Nair', payer:'PMJAY', payerType:'Govt Scheme', complaint:'Post-partum haemorrhage — managed, stable', dx:'Primary PPH — Atonic Uterus — Controlled', icd:'O72.1', bg:'B+', admitted:P(1,'01:30'), news:3, alerts:['Blood Transfusion Done'], ipNo:'IP-241036', vitals:{ bp:'102/68', hr:110, temp:98.8, spo2:97, weight:60, bmi:22.4, pain:2, rr:20 }, rx:[{ name:'Inj Carboprost 250mcg', dose:'1 amp IM', freq:'Q15 min SOS', duration:'TDS', generic:'Carboprost', route:'IM', active:true }] });
    mkPatient({ uhid:'SH-2026-04927', name:'Deepa Mohan', age:35, gender:'Female', type:'IPD', wardKey:'SEMI-PRIVATE', ward:'Semi-Private Ward', bed:'SP-311', los:3, dept:'Gynecology & Obs', consultant:'Dr. Priya Nair', payer:'Bajaj Allianz', payerType:'TPA/Insurance', complaint:'Ectopic pregnancy — laparoscopy done', dx:'Right Tubal Ectopic Pregnancy — Post Laparoscopy', icd:'O00.1', bg:'A+', admitted:P(3,'20:00'), news:2, ipNo:'IP-241037', vitals:{ bp:'112/72', hr:88, temp:98.4, spo2:99, weight:57, bmi:21.3, pain:2, rr:16 }, rx:[{ name:'Inj Methotrexate 50mg', dose:'IM', freq:'Once', duration:'Once (residual)', generic:'Methotrexate', route:'IM', active:false }] });
    mkPatient({ uhid:'SH-2026-04928', name:'Girija Nambiar', age:31, gender:'Female', type:'IPD', wardKey:'GENERAL-WARD-F', ward:'General Ward (Female)', bed:'GW(F)-424', los:2, dept:'Gynecology & Obs', consultant:'Dr. Priya Nair', payer:'ESI', payerType:'Govt Scheme', complaint:'Severe pre-eclampsia — BP 160/110 at 36 weeks', dx:'Severe Pre-eclampsia — 36 Weeks', icd:'O14.1', bg:'O-', admitted:P(2,'23:00'), news:5, alerts:['BP Critical'], ipNo:'IP-241038', vitals:{ bp:'158/108', hr:92, temp:98.6, spo2:98, weight:79, bmi:26.9, pain:2, rr:18 }, rx:[{ name:'Inj Magnesium Sulphate 4g', dose:'IV loading', freq:'4g over 20 min', duration:'24h maintenance', generic:'MgSO4', route:'IV', active:true }] });
    mkPatient({ uhid:'SH-2026-04929', name:'Nithya Chandrasekaran', age:24, gender:'Female', type:'IPD', wardKey:'GENERAL-WARD-F', ward:'General Ward (Female)', bed:'GW(F)-425', los:1, dept:'Gynecology & Obs', consultant:'Dr. Priya Nair', payer:'Self Pay', payerType:'Cash', complaint:'Normal spontaneous vaginal delivery — post-partum', dx:'Normal Delivery — Day 1 Post-Partum', icd:'Z37.0', bg:'A+', admitted:P(1,'14:30'), news:0, ipNo:'IP-241039', vitals:{ bp:'110/72', hr:76, temp:98.4, spo2:99, weight:62, bmi:23.1, pain:1, rr:16 }, rx:[{ name:'Tab Iron + Folic Acid', dose:'1 tab', freq:'Once daily', duration:'90 days', generic:'Ferrous Sulphate + Folic Acid', route:'Oral', active:true }] });
    mkPatient({ uhid:'SH-2026-04930', name:'Priyadarshini Iyer', age:43, gender:'Female', type:'IPD', wardKey:'PRIVATE', ward:'Private Room', bed:'PVT-209', los:4, dept:'Gynecology & Obs', consultant:'Dr. Priya Nair', payer:'HDFC ERGO', payerType:'TPA/Insurance', complaint:'Myomectomy done — large fibroid uterus', dx:'Uterine Fibroids — Post Myomectomy', icd:'D25.1', bg:'B+', admitted:P(4,'07:30'), news:1, ipNo:'IP-241040', vitals:{ bp:'118/76', hr:74, temp:98.6, spo2:99, weight:67, bmi:24.1, pain:2, rr:16 }, rx:[{ name:'Tab Mefenamic Acid 500mg', dose:'1 tab', freq:'TDS', duration:'5 days', generic:'Mefenamic Acid', route:'Oral', active:true }] });

    /* ══════════════════════════════════════════════════════════════════════
       PEDIATRICS — 8 patients (4 OPD + 4 IPD)
    ══════════════════════════════════════════════════════════════════════ */
    mkPatient({ uhid:'SH-2026-04931', name:'Aryan Mehta', age:4, gender:'Male', type:'OPD', dept:'Pediatrics', consultant:'Dr. Ramesh Iyer', payer:'Self Pay', payerType:'Cash', complaint:'Fever, ear pain — AOM suspected', dx:'Acute Otitis Media (Left)', icd:'H66.0', bg:'A+', admitted:P(0,'09:30'), time:'09:30 AM', visitType:'New', opNo:'OP-241041' });
    mkPatient({ uhid:'SH-2026-04932', name:'Pooja Patel', age:7, gender:'Female', type:'OPD', dept:'Pediatrics', consultant:'Dr. Ramesh Iyer', payer:'CGHS', payerType:'Govt Scheme', complaint:'Recurrent bronchospasm — asthma follow-up', dx:'Bronchial Asthma — Persistent Mild', icd:'J45.20', bg:'O+', admitted:P(0,'10:00'), time:'10:00 AM', visitType:'Follow-up', opNo:'OP-241042' });
    mkPatient({ uhid:'SH-2026-04933', name:'Karthik Raja', age:11, gender:'Male', type:'OPD', dept:'Pediatrics', consultant:'Dr. Ramesh Iyer', payer:'Star Health', payerType:'TPA/Insurance', complaint:'Abdominal pain, vomiting — evaluation', dx:'Constipation — Functional', icd:'K59.00', bg:'B+', admitted:P(0,'11:00'), time:'11:00 AM', visitType:'New', opNo:'OP-241043' });
    mkPatient({ uhid:'SH-2026-04934', name:'Divya Sharma', age:2, gender:'Female', type:'OPD', dept:'Pediatrics', consultant:'Dr. Ramesh Iyer', payer:'PMJAY', payerType:'Govt Scheme', complaint:'Failure to thrive — weight 8.2 kg at 2 yrs', dx:'Severe Acute Malnutrition (SAM)', icd:'E43', bg:'O+', admitted:P(0,'11:45'), time:'11:45 AM', visitType:'New', opNo:'OP-241044' });
    // IPD
    mkPatient({ uhid:'SH-2026-04935', name:'Rahil Sheikh', age:6, gender:'Male', type:'IPD', wardKey:'GENERAL-WARD-M', ward:'General Ward (Male)', bed:'GW(M)-417', los:3, dept:'Pediatrics', consultant:'Dr. Ramesh Iyer', payer:'Star Health', payerType:'TPA/Insurance', complaint:'Febrile seizures × 2 — admitted for monitoring', dx:'Febrile Seizures — Complex', icd:'R56.01', bg:'B+', admitted:P(3,'21:00'), news:2, ipNo:'IP-241045', vitals:{ bp:'96/62', hr:112, temp:102.8, spo2:98, weight:20, bmi:15.6, pain:0, rr:24 }, rx:[{ name:'Tab Sodium Valproate 200mg', dose:'5ml syrup', freq:'Twice daily', duration:'6 months', generic:'Sodium Valproate', route:'Oral', active:true }] });
    mkPatient({ uhid:'SH-2026-04936', name:'Priya Nambiar', age:5, gender:'Female', type:'IPD', wardKey:'GENERAL-WARD-F', ward:'General Ward (Female)', bed:'GW(F)-414', los:2, dept:'Pediatrics', consultant:'Dr. Ramesh Iyer', payer:'HDFC ERGO', payerType:'TPA/Insurance', complaint:'Acute diarrhoea with severe dehydration', dx:'Acute Gastroenteritis with Severe Dehydration', icd:'A09', bg:'A+', admitted:P(2,'16:00'), news:3, alerts:['Dehydration'], ipNo:'IP-241046', vitals:{ bp:'90/58', hr:126, temp:100.4, spo2:98, weight:17, bmi:14.8, pain:1, rr:28 }, rx:[{ name:'IV RL Solution', dose:'50 ml/kg over 3h', freq:'Continuous', duration:'24h', generic:'Ringer\'s Lactate', route:'IV', active:true }] });
    mkPatient({ uhid:'SH-2026-04937', name:'Mihir Joshi', age:9, gender:'Male', type:'IPD', wardKey:'GENERAL-WARD-M', ward:'General Ward (Male)', bed:'GW(M)-418', los:1, dept:'Pediatrics', consultant:'Dr. Ramesh Iyer', payer:'PMJAY', payerType:'Govt Scheme', complaint:'Typhoid fever — widal positive, fever 14 days', dx:'Typhoid Fever — Confirmed (Widal + Culture +ve)', icd:'A01.0', bg:'O+', admitted:P(1,'10:00'), news:2, ipNo:'IP-241047', vitals:{ bp:'100/64', hr:98, temp:102.2, spo2:98, weight:28, bmi:16.2, pain:0, rr:20 }, rx:[{ name:'Inj Ceftriaxone 1g', dose:'IV', freq:'OD', duration:'10 days', generic:'Ceftriaxone', route:'IV', active:true }] });
    mkPatient({ uhid:'SH-2026-04938', name:'Swara Bhatt', age:3, gender:'Female', type:'IPD', wardKey:'GENERAL-WARD-F', ward:'General Ward (Female)', bed:'GW(F)-415', los:2, dept:'Pediatrics', consultant:'Dr. Ramesh Iyer', payer:'Self Pay', payerType:'Cash', complaint:'Bronchiolitis — SpO2 88%, tachypnoea', dx:'Acute Bronchiolitis (RSV)', icd:'J21.0', bg:'A-', admitted:P(2,'04:00'), news:4, alerts:['SpO2 Low'], ipNo:'IP-241048', vitals:{ bp:'88/56', hr:142, temp:99.4, spo2:89, weight:14, bmi:15.8, pain:1, rr:48 }, rx:[{ name:'Nebulisation 3% Saline', dose:'4 ml', freq:'Q4H', duration:'48h', generic:'Hypertonic Saline', route:'Nebulization', active:true }] });

    /* ══════════════════════════════════════════════════════════════════════
       GENERAL SURGERY — 8 patients (2 OPD + 6 IPD)
    ══════════════════════════════════════════════════════════════════════ */
    mkPatient({ uhid:'SH-2026-04939', name:'Chandrakant Shukla', age:47, gender:'Male', type:'OPD', dept:'General Surgery', consultant:'Dr. Mehta', payer:'Self Pay', payerType:'Cash', complaint:'Right iliac fossa pain — appendix evaluation', dx:'Acute Appendicitis — Surgical Review', icd:'K37', bg:'B+', admitted:P(0,'09:00'), time:'09:00 AM', visitType:'New', apptStatus:'In-Consultation', opNo:'OP-241049' });
    mkPatient({ uhid:'SH-2026-04940', name:'Leela Varghese', age:55, gender:'Female', type:'OPD', dept:'General Surgery', consultant:'Dr. Mehta', payer:'CGHS', payerType:'Govt Scheme', complaint:'Painful lump right breast — biopsy planned', dx:'Breast Lump Right — Suspected Carcinoma', icd:'N63', bg:'A+', admitted:P(0,'10:30'), time:'10:30 AM', visitType:'Referral', opNo:'OP-241050' });
    // IPD
    mkPatient({ uhid:'SH-2026-04941', name:'Devraj Patil', age:38, gender:'Male', type:'IPD', wardKey:'GENERAL-WARD-M', ward:'General Ward (Male)', bed:'GW(M)-419', los:2, dept:'General Surgery', consultant:'Dr. Mehta', payer:'United India', payerType:'TPA/Insurance', complaint:'Post-lap appendectomy — day 2', dx:'Acute Appendicitis — Post Laparoscopic Appendectomy', icd:'K37', bg:'O+', admitted:P(2,'08:00'), news:1, ipNo:'IP-241051', vitals:{ bp:'118/76', hr:78, temp:98.6, spo2:99, weight:70, bmi:22.7, pain:1, rr:16 }, rx:[{ name:'Tab Co-Amoxiclav 625mg', dose:'1 tab', freq:'TDS', duration:'5 days', generic:'Amoxicillin-Clavulanate', route:'Oral', active:true }] });
    mkPatient({ uhid:'SH-2026-04942', name:'Meera Nambiar', age:44, gender:'Female', type:'IPD', wardKey:'SEMI-PRIVATE', ward:'Semi-Private Ward', bed:'SP-312', los:3, dept:'General Surgery', consultant:'Dr. Mehta', payer:'Max Bupa', payerType:'TPA/Insurance', complaint:'Inguinal hernia repair — Lichtenstein technique', dx:'Right Inguinal Hernia — Post Lichtenstein Repair', icd:'K40.9', bg:'B+', admitted:P(3,'07:30'), news:0, ipNo:'IP-241052', vitals:{ bp:'120/80', hr:74, temp:98.4, spo2:99, weight:64, bmi:23.1, pain:1, rr:16 }, rx:[{ name:'Tab Ibuprofen 400mg', dose:'1 tab', freq:'TDS', duration:'5 days', generic:'Ibuprofen', route:'Oral', active:true }] });
    mkPatient({ uhid:'SH-2026-04943', name:'Bhupendra Yadav', age:52, gender:'Male', type:'IPD', wardKey:'GENERAL-WARD-M', ward:'General Ward (Male)', bed:'GW(M)-420', los:5, dept:'General Surgery', consultant:'Dr. Mehta', payer:'PMJAY', payerType:'Govt Scheme', complaint:'Large bowel obstruction — Hartmann procedure done', dx:'Obstructed Carcinoma Sigmoid Colon — Post Hartmann', icd:'K56.6', bg:'O-', admitted:P(5,'14:00'), news:4, alerts:['Stoma Care'], ipNo:'IP-241053', vitals:{ bp:'108/70', hr:102, temp:99.2, spo2:96, weight:62, bmi:21.3, pain:3, rr:20 }, rx:[{ name:'Inj Piperacillin-Tazobactam 4.5g', dose:'IV', freq:'Q8H', duration:'7 days', generic:'Pip-Taz', route:'IV', active:true }] });
    mkPatient({ uhid:'SH-2026-04944', name:'Prameela Kumari', age:31, gender:'Female', type:'IPD', wardKey:'GENERAL-WARD-F', ward:'General Ward (Female)', bed:'GW(F)-416', los:1, dept:'General Surgery', consultant:'Dr. Mehta', payer:'Bajaj Allianz', payerType:'TPA/Insurance', complaint:'Acute pancreatitis — gallstone, pain score 8/10', dx:'Acute Gallstone Pancreatitis (Mild)', icd:'K85.1', bg:'A+', admitted:P(1,'22:00'), news:3, ipNo:'IP-241054', vitals:{ bp:'106/68', hr:114, temp:99.0, spo2:96, weight:72, bmi:25.7, pain:8, rr:22 }, rx:[{ name:'Inj Morphine 2mg', dose:'IV', freq:'Q4H SOS', duration:'48h', generic:'Morphine', route:'IV', active:true }] });
    mkPatient({ uhid:'SH-2026-04945', name:'Anupam Srivastava', age:65, gender:'Male', type:'IPD', wardKey:'PRIVATE', ward:'Private Room', bed:'PVT-210', los:6, dept:'General Surgery', consultant:'Dr. Mehta', payer:'Star Health', payerType:'TPA/Insurance', preAuthStatus:'LOA ✓', complaint:'Carcinoma rectum — anterior resection done', dx:'Carcinoma Rectum — Post Anterior Resection', icd:'C20', bg:'AB+', admitted:P(6,'07:00'), news:2, ipNo:'IP-241055', vitals:{ bp:'126/82', hr:80, temp:98.6, spo2:98, weight:68, bmi:23.3, pain:2, rr:16 }, rx:[{ name:'Inj Cefazolin 1g', dose:'IV', freq:'Q8H', duration:'3 days', generic:'Cefazolin', route:'IV', active:true }] });
    mkPatient({ uhid:'SH-2026-04946', name:'Roopa Shetty', age:27, gender:'Female', type:'IPD', wardKey:'GENERAL-WARD-F', ward:'General Ward (Female)', bed:'GW(F)-417', los:2, dept:'General Surgery', consultant:'Dr. Mehta', payer:'Self Pay', payerType:'Cash', complaint:'Breast abscess — incision and drainage done', dx:'Breast Abscess — Right Breast — Post I&D', icd:'N61', bg:'O+', admitted:P(2,'15:00'), news:1, ipNo:'IP-241056', vitals:{ bp:'118/76', hr:80, temp:99.2, spo2:99, weight:56, bmi:21.5, pain:2, rr:16 }, rx:[{ name:'Tab Augmentin 625mg', dose:'1 tab', freq:'TDS', duration:'7 days', generic:'Amoxicillin-Clavulanate', route:'Oral', active:true }] });

    /* ══════════════════════════════════════════════════════════════════════
       NEUROLOGY — 6 patients (2 OPD + 4 IPD)
    ══════════════════════════════════════════════════════════════════════ */
    mkPatient({ uhid:'SH-2026-04947', name:'Viswanathan Pillai', age:66, gender:'Male', type:'OPD', dept:'Neurology', consultant:'Dr. Krishnaswamy', payer:'CGHS', payerType:'Govt Scheme', complaint:'Follow-up post-stroke — left hemiplegia improving', dx:'Ischaemic Stroke — Left MCA — Recovery Phase', icd:'I63.5', bg:'B+', admitted:P(0,'09:15'), time:'09:15 AM', visitType:'Follow-up', opNo:'OP-241057' });
    mkPatient({ uhid:'SH-2026-04948', name:'Alamelu Ramasamy', age:44, gender:'Female', type:'OPD', dept:'Neurology', consultant:'Dr. Krishnaswamy', payer:'Oriental Insurance', payerType:'TPA/Insurance', complaint:'Migraine with aura — three attacks last month', dx:'Migraine with Visual Aura (G43.1)', icd:'G43.1', bg:'A+', admitted:P(0,'10:00'), time:'10:00 AM', visitType:'New', opNo:'OP-241058' });
    // IPD
    mkPatient({ uhid:'SH-2026-04949', name:'Surendra Kapoor', age:58, gender:'Male', type:'IPD', wardKey:'HDU', ward:'High Dependency Unit (HDU)', bed:'HDU-01', los:3, dept:'Neurology', consultant:'Dr. Krishnaswamy', payer:'HDFC ERGO', payerType:'TPA/Insurance', complaint:'Acute ischaemic stroke — right hemiplegia, aphasia', dx:'Acute Ischaemic Stroke — Right MCA Territory', icd:'I63.5', bg:'O+', admitted:P(3,'07:00'), news:5, alerts:['Neuro Watch'], ipNo:'IP-241059', vitals:{ bp:'168/102', hr:86, temp:98.6, spo2:96, weight:74, bmi:24.5, pain:0, rr:18 }, rx:[{ name:'Tab Aspirin 325mg', dose:'Loading, then 75mg OD', freq:'OD', duration:'Lifelong', generic:'Aspirin', route:'Oral', active:true }] });
    mkPatient({ uhid:'SH-2026-04950', name:'Malathi Suresh', age:52, gender:'Female', type:'IPD', wardKey:'SEMI-PRIVATE', ward:'Semi-Private Ward', bed:'SP-301', los:2, dept:'Neurology', consultant:'Dr. Krishnaswamy', payer:'Star Health', payerType:'TPA/Insurance', complaint:'Status epilepticus — controlled, now monitoring', dx:'Status Epilepticus — Controlled on Levetiracetam', icd:'G41.9', bg:'A+', admitted:P(2,'03:00'), news:4, ipNo:'IP-241060', vitals:{ bp:'140/90', hr:92, temp:99.0, spo2:97, weight:64, bmi:23.1, pain:0, rr:18 }, rx:[{ name:'Inj Levetiracetam 1500mg', dose:'IV', freq:'BD', duration:'7 days', generic:'Levetiracetam', route:'IV', active:true }] });
    mkPatient({ uhid:'SH-2026-04951', name:'Ramkumar Chettiar', age:74, gender:'Male', type:'IPD', wardKey:'GENERAL-WARD-M', ward:'General Ward (Male)', bed:'GW(M)-409', los:5, dept:'Neurology', consultant:'Dr. Krishnaswamy', payer:'CGHS', payerType:'Govt Scheme', complaint:'Parkinson\'s disease — acute worsening, aspiration pneumonia', dx:'Parkinson\'s Disease with Aspiration Pneumonia', icd:'G20', bg:'B+', admitted:P(5,'11:00'), news:4, alerts:['Aspiration Risk'], ipNo:'IP-241061', vitals:{ bp:'118/74', hr:88, temp:100.2, spo2:93, weight:58, bmi:20.8, pain:1, rr:22 }, rx:[{ name:'Tab Levodopa/Carbidopa 25/100mg', dose:'1 tab', freq:'TDS', duration:'Lifelong', generic:'Levodopa-Carbidopa', route:'Oral', active:true }] });
    mkPatient({ uhid:'SH-2026-04952', name:'Usha Balakrishnan', age:49, gender:'Female', type:'IPD', wardKey:'PRIVATE', ward:'Private Room', bed:'PVT-201', los:3, dept:'Neurology', consultant:'Dr. Krishnaswamy', payer:'Max Bupa', payerType:'TPA/Insurance', complaint:'Multiple sclerosis relapse — IV methylprednisolone course', dx:'Multiple Sclerosis — Relapsing-Remitting — Active', icd:'G35', bg:'AB-', admitted:P(3,'10:00'), news:2, ipNo:'IP-241062', vitals:{ bp:'124/80', hr:76, temp:98.6, spo2:99, weight:60, bmi:22.5, pain:2, rr:16 }, rx:[{ name:'Inj Methylprednisolone 1g', dose:'IV', freq:'OD', duration:'5 days', generic:'Methylprednisolone', route:'IV', active:true }] });

    /* ══════════════════════════════════════════════════════════════════════
       PSYCHIATRY — 6 patients (3 OPD + 3 IPD)
    ══════════════════════════════════════════════════════════════════════ */
    mkPatient({ uhid:'SH-2026-04953', name:'Arjun Bhatia', age:26, gender:'Male', type:'OPD', dept:'Psychiatry', consultant:'Dr. Krishnamurthy', payer:'Self Pay', payerType:'Cash', complaint:'Panic attacks — 2-3 per week, chest pain, breathlessness', dx:'Panic Disorder (F41.0)', icd:'F41.0', bg:'O+', admitted:P(0,'09:00'), time:'09:00 AM', visitType:'New', opNo:'OP-241063' });
    mkPatient({ uhid:'SH-2026-04954', name:'Seema Kapoor', age:34, gender:'Female', type:'OPD', dept:'Psychiatry', consultant:'Dr. Krishnamurthy', payer:'Max Bupa', payerType:'TPA/Insurance', complaint:'Post-partum depression — 6 weeks post-delivery', dx:'Post-Partum Depression (F53.0)', icd:'F53.0', bg:'A+', admitted:P(0,'10:00'), time:'10:00 AM', visitType:'New', opNo:'OP-241064' });
    mkPatient({ uhid:'SH-2026-04955', name:'Rajiv Mehrotra', age:42, gender:'Male', type:'OPD', dept:'Psychiatry', consultant:'Dr. Krishnamurthy', payer:'Star Health', payerType:'TPA/Insurance', complaint:'Alcohol dependence — follow-up on deaddiction protocol', dx:'Alcohol Use Disorder — Moderate (F10.2)', icd:'F10.2', bg:'B+', admitted:P(0,'11:00'), time:'11:00 AM', visitType:'Follow-up', opNo:'OP-241065' });
    // IPD
    mkPatient({ uhid:'SH-2026-04956', name:'Supriya Patil', age:28, gender:'Female', type:'IPD', wardKey:'PRIVATE', ward:'Private Room', bed:'PVT-202', los:5, dept:'Psychiatry', consultant:'Dr. Krishnamurthy', payer:'HDFC ERGO', payerType:'TPA/Insurance', complaint:'Acute suicidal crisis — admitted under observation', dx:'Major Depressive Disorder — Severe with Suicidal Ideation', icd:'F32.2', bg:'O+', admitted:P(5,'09:00'), news:0, ipNo:'IP-241066', vitals:{ bp:'118/76', hr:74, temp:98.6, spo2:99, weight:58, bmi:22.3, pain:0, rr:16 }, rx:[{ name:'Tab Sertraline 50mg', dose:'1 tab', freq:'Once daily morning', duration:'6 months', generic:'Sertraline', route:'Oral', active:true }] });
    mkPatient({ uhid:'SH-2026-04957', name:'Prakash Nair', age:35, gender:'Male', type:'IPD', wardKey:'SEMI-PRIVATE', ward:'Semi-Private Ward', bed:'SP-302', los:3, dept:'Psychiatry', consultant:'Dr. Krishnamurthy', payer:'Reliance General', payerType:'TPA/Insurance', complaint:'First episode psychosis — positive symptoms dominant', dx:'First Episode Psychosis — Schizophrenia Spectrum (F20)', icd:'F20.0', bg:'A+', admitted:P(3,'14:00'), news:0, ipNo:'IP-241067', vitals:{ bp:'122/80', hr:78, temp:98.4, spo2:99, weight:70, bmi:22.7, pain:0, rr:16 }, rx:[{ name:'Inj Olanzapine 10mg', dose:'IM', freq:'Once daily', duration:'7 days', generic:'Olanzapine', route:'IM', active:true }] });
    mkPatient({ uhid:'SH-2026-04958', name:'Nalini Krishnan', age:19, gender:'Female', type:'IPD', wardKey:'GENERAL-WARD-F', ward:'General Ward (Female)', bed:'GW(F)-418', los:2, dept:'Psychiatry', consultant:'Dr. Krishnamurthy', payer:'PMJAY', payerType:'Govt Scheme', complaint:'Anorexia nervosa — BMI 15.2 — refeeding protocol', dx:'Anorexia Nervosa — Restrictive Type (F50.0)', icd:'F50.0', bg:'B-', admitted:P(2,'10:00'), news:1, ipNo:'IP-241068', vitals:{ bp:'98/62', hr:52, temp:97.8, spo2:99, weight:36, bmi:15.2, pain:0, rr:14 }, rx:[{ name:'Refeeding: Fortisip 200ml', dose:'200ml', freq:'TDS', duration:'14 days', generic:'ONS (Oral Nutritional Supplement)', route:'Oral', active:true }] });

    /* ══════════════════════════════════════════════════════════════════════
       ONCOLOGY — 6 patients (2 OPD + 4 IPD/Daycare)
    ══════════════════════════════════════════════════════════════════════ */
    mkPatient({ uhid:'SH-2026-04959', name:'Gajanan Rao', age:58, gender:'Male', type:'OPD', dept:'Oncology', consultant:'Dr. Shrawan Kumar', payer:'CGHS', payerType:'Govt Scheme', complaint:'Follow-up post chemotherapy Cycle 3 — lung carcinoma', dx:'NSCLC Stage IIIA — Post Chemo Cycle 3', icd:'C34.1', bg:'O+', admitted:P(0,'09:30'), time:'09:30 AM', visitType:'Follow-up', opNo:'OP-241069' });
    mkPatient({ uhid:'SH-2026-04960', name:'Santhi Venkatesan', age:46, gender:'Female', type:'OPD', dept:'Oncology', consultant:'Dr. Shrawan Kumar', payer:'United India', payerType:'TPA/Insurance', complaint:'Breast carcinoma Stage II — planning radiation', dx:'Breast Carcinoma Stage II — Hormone Receptor Positive', icd:'C50.9', bg:'A+', admitted:P(0,'10:30'), time:'10:30 AM', visitType:'Referral', opNo:'OP-241070' });
    // IPD Chemo
    mkPatient({ uhid:'SH-2026-04961', name:'Bhimrao Kamble', age:52, gender:'Male', type:'Daycare', wardKey:'DAYCARE', ward:'Daycare Unit', bed:'DC-B4', los:0, dept:'Oncology', consultant:'Dr. Shrawan Kumar', payer:'PMJAY', payerType:'Govt Scheme', complaint:'IV Chemotherapy — FOLFOX Cycle 4 — Colorectal Ca', dx:'Carcinoma Colon Stage III — FOLFOX Cycle 4', icd:'C18.9', bg:'B+', admitted:P(0,'08:00'), status:'Under Observation', ipNo:'IP-241071', vitals:{ bp:'118/76', hr:74, temp:98.4, spo2:99, weight:64, bmi:22.3, pain:0, rr:16 }, rx:[{ name:'Inj 5-Fluorouracil 2400mg/m²', dose:'Per BSA', freq:'46h infusion', duration:'Cycle 4', generic:'5-FU', route:'IV', active:true }] });
    mkPatient({ uhid:'SH-2026-04962', name:'Tarini Devi Ghosh', age:55, gender:'Female', type:'IPD', wardKey:'PRIVATE', ward:'Private Room', bed:'PVT-203', los:5, dept:'Oncology', consultant:'Dr. Shrawan Kumar', payer:'Star Health', payerType:'TPA/Insurance', complaint:'Post-mastectomy — wound care, starting adjuvant chemo', dx:'Invasive Ductal Carcinoma Right Breast — Post Mastectomy', icd:'C50.91', bg:'A-', admitted:P(5,'08:00'), news:1, ipNo:'IP-241072', vitals:{ bp:'122/80', hr:78, temp:98.6, spo2:99, weight:66, bmi:24.2, pain:2, rr:16 }, rx:[{ name:'Tab Tamoxifen 20mg', dose:'1 tab', freq:'Once daily', duration:'5 years', generic:'Tamoxifen', route:'Oral', active:true }] });
    mkPatient({ uhid:'SH-2026-04963', name:'Chetan Malhotra', age:43, gender:'Male', type:'IPD', wardKey:'SEMI-PRIVATE', ward:'Semi-Private Ward', bed:'SP-303', los:3, dept:'Oncology', consultant:'Dr. Shrawan Kumar', payer:'Max Bupa', payerType:'TPA/Insurance', complaint:'Febrile neutropenia — post chemotherapy cycle 2', dx:'Febrile Neutropenia (ANC < 500) Post Chemotherapy', icd:'D70.1', bg:'O+', admitted:P(3,'23:00'), news:4, alerts:['Neutropenia'], ipNo:'IP-241073', vitals:{ bp:'102/68', hr:112, temp:101.6, spo2:96, weight:74, bmi:24.8, pain:1, rr:22 }, rx:[{ name:'Inj Meropenem 1g', dose:'IV', freq:'Q8H', duration:'7 days', generic:'Meropenem', route:'IV', active:true }] });
    mkPatient({ uhid:'SH-2026-04964', name:'Sulochana Nair', age:61, gender:'Female', type:'Daycare', wardKey:'DAYCARE', ward:'Daycare Unit', bed:'DC-B5', los:0, dept:'Oncology', consultant:'Dr. Shrawan Kumar', payer:'HDFC ERGO', payerType:'TPA/Insurance', complaint:'Paclitaxel + Carboplatin — Cycle 2 — Ovarian Ca', dx:'Ovarian Carcinoma Stage IIIC — Paclitaxel + Carboplatin Cycle 2', icd:'C56.9', bg:'B+', admitted:P(0,'08:30'), status:'Under Observation', ipNo:'IP-241074', vitals:{ bp:'128/82', hr:78, temp:98.4, spo2:99, weight:60, bmi:22.1, pain:0, rr:16 }, rx:[{ name:'Inj Paclitaxel 175mg/m²', dose:'Per BSA', freq:'3h infusion', duration:'Cycle 2', generic:'Paclitaxel', route:'IV', active:true }] });

    /* ══════════════════════════════════════════════════════════════════════
       PULMONOLOGY — 5 patients (2 OPD + 3 IPD)
    ══════════════════════════════════════════════════════════════════════ */
    mkPatient({ uhid:'SH-2026-04965', name:'Narendra Tripathi', age:54, gender:'Male', type:'OPD', dept:'Pulmonology', consultant:'Dr. Srinivasan', payer:'ECHS', payerType:'Govt Scheme', complaint:'Pulmonary TB — follow-up month 3 on DOTS', dx:'Pulmonary Tuberculosis — DOTS Category I (Month 3)', icd:'A15.0', bg:'B+', admitted:P(0,'09:00'), time:'09:00 AM', visitType:'Follow-up', opNo:'OP-241075' });
    mkPatient({ uhid:'SH-2026-04966', name:'Kamala Sharma', age:48, gender:'Female', type:'OPD', dept:'Pulmonology', consultant:'Dr. Srinivasan', payer:'Religare Health', payerType:'TPA/Insurance', complaint:'Obstructive sleep apnoea — CPAP titration results', dx:'Obstructive Sleep Apnoea — Moderate (AHI 22)', icd:'G47.33', bg:'A+', admitted:P(0,'10:30'), time:'10:30 AM', visitType:'Follow-up', opNo:'OP-241076' });
    // IPD
    mkPatient({ uhid:'SH-2026-04967', name:'Suryaprakash Naidu', age:67, gender:'Male', type:'IPD', wardKey:'HDU', ward:'High Dependency Unit (HDU)', bed:'HDU-02', los:4, dept:'Pulmonology', consultant:'Dr. Srinivasan', payer:'United India', payerType:'TPA/Insurance', complaint:'Severe community-acquired pneumonia — HAP-CURB score 4', dx:'Severe Community-Acquired Pneumonia (CURB-65: 4)', icd:'J18.9', bg:'O+', admitted:P(4,'06:30'), news:6, alerts:['SpO2 Low'], ipNo:'IP-241077', vitals:{ bp:'100/65', hr:114, temp:102.8, spo2:88, weight:72, bmi:24.8, pain:2, rr:32 }, rx:[{ name:'Inj Piperacillin-Tazobactam 4.5g', dose:'IV', freq:'Q6H', duration:'7 days', generic:'Pip-Taz', route:'IV', active:true }] });
    mkPatient({ uhid:'SH-2026-04968', name:'Ahalya Krishnamurti', age:42, gender:'Female', type:'IPD', wardKey:'GENERAL-WARD-F', ward:'General Ward (Female)', bed:'GW(F)-416', los:2, dept:'Pulmonology', consultant:'Dr. Srinivasan', payer:'Star Health', payerType:'TPA/Insurance', complaint:'Pleural effusion right — diagnostic tap done', dx:'Right Pleural Effusion — Exudative (TB etiology suspected)', icd:'J91.0', bg:'A+', admitted:P(2,'11:00'), news:2, ipNo:'IP-241078', vitals:{ bp:'118/76', hr:86, temp:99.4, spo2:94, weight:56, bmi:21.2, pain:1, rr:24 }, rx:[{ name:'Tab Prednisolone 40mg', dose:'1 tab', freq:'Once daily morning', duration:'4 weeks', generic:'Prednisolone', route:'Oral', active:true }] });
    mkPatient({ uhid:'SH-2026-04969', name:'Balakrishna Shetty', age:61, gender:'Male', type:'IPD', wardKey:'SEMI-PRIVATE', ward:'Semi-Private Ward', bed:'SP-304', los:3, dept:'Pulmonology', consultant:'Dr. Srinivasan', payer:'CGHS', payerType:'Govt Scheme', complaint:'Asthma severe exacerbation — PEFR 35% predicted', dx:'Severe Acute Asthma Exacerbation', icd:'J45.51', bg:'B+', admitted:P(3,'02:00'), news:5, alerts:['Wheeze'], ipNo:'IP-241079', vitals:{ bp:'128/84', hr:118, temp:98.6, spo2:91, weight:74, bmi:25.3, pain:2, rr:28 }, rx:[{ name:'Inj Hydrocortisone 200mg', dose:'IV', freq:'Q6H', duration:'48h', generic:'Hydrocortisone', route:'IV', active:true }] });

    /* ══════════════════════════════════════════════════════════════════════
       ENDOCRINOLOGY — 5 patients (3 OPD + 2 IPD)
    ══════════════════════════════════════════════════════════════════════ */
    mkPatient({ uhid:'SH-2026-04970', name:'Lalitha Subramaniam', age:52, gender:'Female', type:'OPD', dept:'Endocrinology', consultant:'Dr. Ramesh Iyer', payer:'Self Pay', payerType:'Cash', complaint:'Hypothyroidism — TSH 14.2, fatigue, weight gain', dx:'Hypothyroidism — Primary — Undertreated', icd:'E03.9', bg:'A+', admitted:P(0,'09:30'), time:'09:30 AM', visitType:'Follow-up', opNo:'OP-241080' });
    mkPatient({ uhid:'SH-2026-04971', name:'Senthil Kumar', age:38, gender:'Male', type:'OPD', dept:'Endocrinology', consultant:'Dr. Ramesh Iyer', payer:'Max Bupa', payerType:'TPA/Insurance', complaint:'Acromegaly — IGF-1 elevated — pituitary MRI done', dx:'Acromegaly — GH-Secreting Pituitary Adenoma', icd:'E22.0', bg:'B+', admitted:P(0,'10:15'), time:'10:15 AM', visitType:'Referral', opNo:'OP-241081' });
    mkPatient({ uhid:'SH-2026-04972', name:'Vasudha Menon', age:29, gender:'Female', type:'OPD', dept:'Endocrinology', consultant:'Dr. Ramesh Iyer', payer:'HDFC ERGO', payerType:'TPA/Insurance', complaint:'Polycystic ovary syndrome — insulin resistance markers', dx:'PCOS with Insulin Resistance — Metabolic Syndrome', icd:'E28.2', bg:'O+', admitted:P(0,'11:00'), time:'11:00 AM', visitType:'New', opNo:'OP-241082' });
    // IPD
    mkPatient({ uhid:'SH-2026-04973', name:'Chandrasekhar Murthy', age:56, gender:'Male', type:'IPD', wardKey:'HDU', ward:'High Dependency Unit (HDU)', bed:'HDU-03', los:3, dept:'Endocrinology', consultant:'Dr. Ramesh Iyer', payer:'Bajaj Allianz', payerType:'TPA/Insurance', complaint:'DKA — pH 7.12, glucose 640 mg/dL, bicarbonate 8', dx:'Diabetic Ketoacidosis — Severe', icd:'E11.10', bg:'A+', admitted:P(3,'01:00'), news:6, alerts:['DKA Protocol'], ipNo:'IP-241083', vitals:{ bp:'102/66', hr:122, temp:98.2, spo2:97, weight:78, bmi:26.1, pain:3, rr:26 }, rx:[{ name:'Inj Regular Insulin', dose:'0.1 IU/kg/h', freq:'Continuous infusion', duration:'Till DKA resolved', generic:'Regular Insulin', route:'IV', active:true }] });
    mkPatient({ uhid:'SH-2026-04974', name:'Vijayalakshmi Nair', age:43, gender:'Female', type:'IPD', wardKey:'SEMI-PRIVATE', ward:'Semi-Private Ward', bed:'SP-305', los:2, dept:'Endocrinology', consultant:'Dr. Ramesh Iyer', payer:'CGHS', payerType:'Govt Scheme', complaint:'Thyroid storm — post-thyroidectomy — HR 148, fever 104F', dx:'Thyroid Storm — Post-Op Complication', icd:'E05.5', bg:'B+', admitted:P(2,'18:00'), news:7, alerts:['Critical'], ipNo:'IP-241084', vitals:{ bp:'148/92', hr:148, temp:104.2, spo2:96, weight:62, bmi:22.5, pain:2, rr:24 }, rx:[{ name:'Tab Propranolol 40mg', dose:'1 tab', freq:'Q6H', duration:'7 days', generic:'Propranolol', route:'Oral', active:true }] });

    /* ══════════════════════════════════════════════════════════════════════
       NEPHROLOGY — 5 patients (2 OPD + 3 IPD)
    ══════════════════════════════════════════════════════════════════════ */
    mkPatient({ uhid:'SH-2026-04975', name:'Ramprasad Gupta', age:62, gender:'Male', type:'OPD', dept:'Nephrology', consultant:'Dr. Srinivasan', payer:'United India', payerType:'TPA/Insurance', complaint:'CKD Stage 4 — eGFR 22 — pre-dialysis counselling', dx:'Chronic Kidney Disease Stage 4 (G4)', icd:'N18.4', bg:'O+', admitted:P(0,'09:00'), time:'09:00 AM', visitType:'Follow-up', opNo:'OP-241085' });
    mkPatient({ uhid:'SH-2026-04976', name:'Parveen Akhtar', age:35, gender:'Female', type:'OPD', dept:'Nephrology', consultant:'Dr. Srinivasan', payer:'Star Health', payerType:'TPA/Insurance', complaint:'Nephrotic syndrome — proteinuria 5g/day', dx:'Nephrotic Syndrome — Minimal Change Disease', icd:'N04.0', bg:'A+', admitted:P(0,'10:30'), time:'10:30 AM', visitType:'Referral', opNo:'OP-241086' });
    // IPD
    mkPatient({ uhid:'SH-2026-04977', name:'Radhakrishnan Nair', age:68, gender:'Male', type:'IPD', wardKey:'HDU', ward:'High Dependency Unit (HDU)', bed:'HDU-04', los:4, dept:'Nephrology', consultant:'Dr. Srinivasan', payer:'CGHS', payerType:'Govt Scheme', complaint:'Acute kidney injury — oliguria, creatinine 8.2 mg/dL — dialysis started', dx:'Acute Kidney Injury Stage 3 — Haemodialysis Initiated', icd:'N17.9', bg:'B+', admitted:P(4,'09:00'), news:6, alerts:['Critical','Dialysis'], ipNo:'IP-241087', vitals:{ bp:'178/108', hr:96, temp:98.6, spo2:95, weight:82, bmi:27.3, pain:0, rr:20 }, rx:[{ name:'Inj Furosemide 200mg', dose:'IV', freq:'Continuous infusion 40mg/h', duration:'24h', generic:'Furosemide', route:'IV', active:true }] });
    mkPatient({ uhid:'SH-2026-04978', name:'Sharada Bai', age:55, gender:'Female', type:'IPD', wardKey:'GENERAL-WARD-F', ward:'General Ward (Female)', bed:'GW(F)-419', los:3, dept:'Nephrology', consultant:'Dr. Srinivasan', payer:'New India Assurance', payerType:'TPA/Insurance', complaint:'Urinary tract infection — ascending, pyelonephritis', dx:'Acute Pyelonephritis — E. coli (ESBL)', icd:'N10', bg:'O-', admitted:P(3,'14:00'), news:3, ipNo:'IP-241088', vitals:{ bp:'118/76', hr:102, temp:101.8, spo2:98, weight:64, bmi:23.3, pain:3, rr:20 }, rx:[{ name:'Inj Imipenem-Cilastatin 500mg', dose:'IV', freq:'Q6H', duration:'10 days', generic:'Imipenem', route:'IV', active:true }] });
    mkPatient({ uhid:'SH-2026-04979', name:'Nandkumar Rane', age:48, gender:'Male', type:'IPD', wardKey:'SEMI-PRIVATE', ward:'Semi-Private Ward', bed:'SP-302', los:5, dept:'Nephrology', consultant:'Dr. Srinivasan', payer:'HDFC ERGO', payerType:'TPA/Insurance', complaint:'IgA Nephropathy flare — haematuria, rising creatinine', dx:'IgA Nephropathy — Crescentic (ANCA negative)', icd:'N02.8', bg:'A+', admitted:P(5,'10:00'), news:2, ipNo:'IP-241089', vitals:{ bp:'158/102', hr:82, temp:98.4, spo2:99, weight:74, bmi:24.8, pain:0, rr:16 }, rx:[{ name:'Tab Prednisolone 60mg', dose:'OD morning', freq:'Once daily', duration:'8 weeks taper', generic:'Prednisolone', route:'Oral', active:true }] });

    /* ══════════════════════════════════════════════════════════════════════
       GASTROENTEROLOGY — 5 patients (2 OPD + 3 IPD)
    ══════════════════════════════════════════════════════════════════════ */
    mkPatient({ uhid:'SH-2026-04980', name:'Mahesh Chandra Trivedi', age:49, gender:'Male', type:'OPD', dept:'Gastroenterology', consultant:'Dr. Mehta', payer:'Bajaj Allianz', payerType:'TPA/Insurance', complaint:'Upper GI bleed — melena, haematemesis, haemoglobin 7.2', dx:'Upper GI Bleeding — Peptic Ulcer (Forrest Ib)', icd:'K25.0', bg:'B+', admitted:P(0,'08:00'), time:'08:00 AM', visitType:'New', apptStatus:'In-Consultation', opNo:'OP-241090' });
    mkPatient({ uhid:'SH-2026-04981', name:'Kavita Menon', age:37, gender:'Female', type:'OPD', dept:'Gastroenterology', consultant:'Dr. Mehta', payer:'Self Pay', payerType:'Cash', complaint:'Ulcerative colitis — bloody diarrhoea ×10/day', dx:'Ulcerative Colitis — Moderate (Mayo Score 6)', icd:'K51.0', bg:'A+', admitted:P(0,'10:00'), time:'10:00 AM', visitType:'Follow-up', opNo:'OP-241091' });
    // IPD
    mkPatient({ uhid:'SH-2026-04982', name:'Madhusudan Pillai', age:58, gender:'Male', type:'IPD', wardKey:'HDU', ward:'High Dependency Unit (HDU)', bed:'HDU-05', los:3, dept:'Gastroenterology', consultant:'Dr. Mehta', payer:'Star Health', payerType:'TPA/Insurance', complaint:'Alcoholic hepatitis — MELD 28 — jaundice, ascites', dx:'Severe Alcoholic Hepatitis — MELD 28 (Maddrey 58)', icd:'K70.1', bg:'O+', admitted:P(3,'09:00'), news:5, alerts:['Liver Failure'], ipNo:'IP-241092', vitals:{ bp:'100/65', hr:110, temp:99.4, spo2:96, weight:84, bmi:28.2, pain:2, rr:22 }, rx:[{ name:'Tab Prednisolone 40mg', dose:'OD', freq:'Once daily', duration:'28 days', generic:'Prednisolone', route:'Oral', active:true }] });
    mkPatient({ uhid:'SH-2026-04983', name:'Sunitha Vijayakumar', age:43, gender:'Female', type:'IPD', wardKey:'GENERAL-WARD-F', ward:'General Ward (Female)', bed:'GW(F)-420', los:2, dept:'Gastroenterology', consultant:'Dr. Mehta', payer:'CGHS', payerType:'Govt Scheme', complaint:'Post ERCP — managed CBD stone, mild pancreatitis', dx:'Common Bile Duct Stone — Post ERCP/Sphincterotomy', icd:'K80.5', bg:'B+', admitted:P(2,'11:00'), news:2, ipNo:'IP-241093', vitals:{ bp:'118/78', hr:84, temp:98.8, spo2:98, weight:68, bmi:24.1, pain:2, rr:16 }, rx:[{ name:'Inj Pantoprazole 80mg', dose:'IV bolus', freq:'Q12H', duration:'3 days', generic:'Pantoprazole', route:'IV', active:true }] });
    mkPatient({ uhid:'SH-2026-04984', name:'Govind Shivram', age:34, gender:'Male', type:'IPD', wardKey:'GENERAL-WARD-M', ward:'General Ward (Male)', bed:'GW(M)-410', los:1, dept:'Gastroenterology', consultant:'Dr. Mehta', payer:'Max Bupa', payerType:'TPA/Insurance', complaint:'Acute appendicitis — laparoscopy planned', dx:'Acute Appendicitis — Alvarado Score 8', icd:'K37', bg:'A-', admitted:P(1,'19:00'), news:2, ipNo:'IP-241094', vitals:{ bp:'118/76', hr:96, temp:99.8, spo2:99, weight:72, bmi:22.7, pain:6, rr:18 }, rx:[{ name:'Inj Metronidazole 500mg', dose:'IV', freq:'Q8H', duration:'3 days', generic:'Metronidazole', route:'IV', active:true }] });

    /* ══════════════════════════════════════════════════════════════════════
       ENT / OPHTHALMOLOGY / DERMATOLOGY / UROLOGY / RHEUMATOLOGY
       — 12 patients mixed
    ══════════════════════════════════════════════════════════════════════ */
    // ENT
    mkPatient({ uhid:'SH-2026-04985', name:'Muthuswamy Pillai', age:52, gender:'Male', type:'OPD', dept:'ENT', consultant:'Dr. Ramesh Iyer', payer:'Self Pay', payerType:'Cash', complaint:'Hearing loss bilateral — audiometry planned', dx:'Bilateral SNHL — Presbyacusis (H91.10)', icd:'H91.10', bg:'B+', admitted:P(0,'09:30'), time:'09:30 AM', visitType:'New', opNo:'OP-241095' });
    mkPatient({ uhid:'SH-2026-04986', name:'Asha Prabhakar', age:8, gender:'Female', type:'IPD', wardKey:'GENERAL-WARD-F', ward:'General Ward (Female)', bed:'GW(F)-421', los:1, dept:'ENT', consultant:'Dr. Ramesh Iyer', payer:'PMJAY', payerType:'Govt Scheme', complaint:'Tonsillectomy and adenoidectomy — post-op day 1', dx:'Chronic Tonsillitis with Adenoid Hypertrophy — Post T&A', icd:'J35.3', bg:'O+', admitted:P(1,'07:30'), news:0, ipNo:'IP-241096', vitals:{ bp:'96/62', hr:88, temp:98.6, spo2:99, weight:24, bmi:15.8, pain:2, rr:20 }, rx:[{ name:'Tab Amoxicillin 250mg', dose:'1 tab', freq:'TDS', duration:'7 days', generic:'Amoxicillin', route:'Oral', active:true }] });
    // Ophthalmology
    mkPatient({ uhid:'SH-2026-04987', name:'Vimala Krishnaswamy', age:67, gender:'Female', type:'OPD', dept:'Ophthalmology', consultant:'Dr. Priya Nair', payer:'CGHS', payerType:'Govt Scheme', complaint:'Cataract left eye — vision 6/36 corrected', dx:'Mature Cataract Left Eye — Phaco Planned', icd:'H26.9', bg:'A+', admitted:P(0,'10:00'), time:'10:00 AM', visitType:'Referral', opNo:'OP-241097' });
    mkPatient({ uhid:'SH-2026-04988', name:'Prakash Chandran', age:55, gender:'Male', type:'Daycare', wardKey:'DAYCARE', ward:'Daycare Unit', bed:'DC-B6', los:0, dept:'Ophthalmology', consultant:'Dr. Priya Nair', payer:'Max Bupa', payerType:'TPA/Insurance', complaint:'Cataract right eye — phacoemulsification done', dx:'Right Eye Cataract — Post Phacoemulsification + IOL', icd:'H26.9', bg:'B+', admitted:P(0,'07:00'), status:'Discharge Ready', ipNo:'IP-241098', vitals:{ bp:'126/82', hr:72, temp:98.4, spo2:99, weight:74, bmi:24.8, pain:0, rr:16 }, rx:[{ name:'Eye drops Moxifloxacin 0.5%', dose:'1 drop', freq:'QID', duration:'2 weeks', generic:'Moxifloxacin', route:'Topical', active:true }] });
    // Dermatology
    mkPatient({ uhid:'SH-2026-04989', name:'Divyabharathi Rajan', age:23, gender:'Female', type:'OPD', dept:'Dermatology', consultant:'Dr. Krishnamurthy', payer:'Self Pay', payerType:'Cash', complaint:'Acne vulgaris — inflammatory nodules, scarring', dx:'Nodulocystic Acne Vulgaris — Grade IV', icd:'L70.0', bg:'O+', admitted:P(0,'11:30'), time:'11:30 AM', visitType:'New', opNo:'OP-241099' });
    // Urology
    mkPatient({ uhid:'SH-2026-04990', name:'Narasimhachar Reddy', age:64, gender:'Male', type:'IPD', wardKey:'SEMI-PRIVATE', ward:'Semi-Private Ward', bed:'SP-301', los:3, dept:'Urology', consultant:'Dr. Munna Kumar', payer:'HDFC ERGO', payerType:'TPA/Insurance', complaint:'BPH severe — TURP done yesterday', dx:'Benign Prostatic Hypertrophy — Post TURP', icd:'N40.1', bg:'B+', admitted:P(3,'07:30'), news:1, ipNo:'IP-241100', vitals:{ bp:'136/86', hr:76, temp:98.6, spo2:98, weight:78, bmi:26.1, pain:2, rr:16 }, rx:[{ name:'Tab Tamsulosin 0.4mg', dose:'1 tab', freq:'Once daily at night', duration:'3 months', generic:'Tamsulosin', route:'Oral', active:true }] });

    /* ══════════════════════════════════════════════════════════════════════
       EMERGENCY / CRITICAL — 5 patients
    ══════════════════════════════════════════════════════════════════════ */
    mkPatient({ uhid:'SH-2026-04985B', name:'Ravindra Prasad', age:44, gender:'Male', type:'Emergency', wardKey:'EMERGENCY', ward:'Emergency Ward', bed:'EMG-02', los:0, dept:'Emergency Medicine', consultant:'Dr. Anand', payer:'Self Pay', payerType:'Cash', complaint:'Drug overdose — unconscious, found at home', dx:'Acute Drug Overdose — Organophosphorus Poisoning', icd:'T60.0', bg:'O+', admitted:P(0,'08:45'), news:8, alerts:['Critical','Poisoning'], flags:['Critical','MLC'], mlc:'MLC-2026-093', ipNo:'IP-241101', vitals:{ bp:'82/50', hr:48, temp:97.2, spo2:85, weight:70, bmi:22.7, pain:0, rr:8 }, rx:[{ name:'Inj Atropine 2mg', dose:'IV bolus', freq:'Q5 min till secretions dry', duration:'Till effect', generic:'Atropine', route:'IV', active:true }] });
    mkPatient({ uhid:'SH-2026-04985C', name:'Bhavana Desai', age:19, gender:'Female', type:'Emergency', wardKey:'EMERGENCY', ward:'Emergency Ward', bed:'EMG-03', los:0, dept:'Emergency Medicine', consultant:'Dr. Priya Nair', payer:'Self Pay', payerType:'Cash', complaint:'Alleged sexual assault — forensic examination, crisis counselling', dx:'Sexual Assault — Forensic Evaluation', icd:'T74.21', bg:'A+', admitted:P(0,'23:00'), news:0, alerts:['Sensitive','MLC'], flags:['MLC'], mlc:'MLC-2026-094', ipNo:'IP-241102', vitals:{ bp:'108/72', hr:98, temp:98.6, spo2:99, weight:52, bmi:20.3, pain:0, rr:18 } });
    mkPatient({ uhid:'SH-2026-04985D', name:'Suresh Nayak', age:57, gender:'Male', type:'Emergency', wardKey:'EMERGENCY', ward:'Emergency Ward', bed:'EMG-04', los:0, dept:'Emergency Medicine', consultant:'Dr. Anand', payer:'CGHS', payerType:'Govt Scheme', complaint:'Sudden loss of consciousness — witnessed collapse', dx:'Cardiac Arrest — ROSC Achieved — Post-Arrest Care', icd:'I46.9', bg:'B+', admitted:P(0,'11:20'), news:10, alerts:['Critical','Post-ROSC'], flags:['Critical'], ipNo:'IP-241103', vitals:{ bp:'96/60', hr:52, temp:97.8, spo2:90, weight:80, bmi:26.8, pain:0, rr:10 }, rx:[{ name:'Inj Noradrenaline 4mg/250ml', dose:'0.1 mcg/kg/min', freq:'Continuous', duration:'Till haemodynamically stable', generic:'Noradrenaline', route:'IV', active:true }] });

    console.log('[Patients100] Total patients now: ' + window.state.patients.length);
  }

  waitAndSeed();

})();
