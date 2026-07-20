// =============================================================================
// Saronil HIS — Laboratory Information System (LIS) Command Center View
// File: assets/js/views/labDashboardView.js
// Description: Full-featured LIS view covering phlebotomy, processing, QC,
//              validation, critical alerts, blood bank, histopathology,
//              outsourcing, audit logs, and role-based access.
// Version: 2.0.0
// =============================================================================

(function () {
  'use strict';

  // ---------------------------------------------------------------------------
  // SECTION 1: State Initialisation
  // ---------------------------------------------------------------------------
  function initLabState() {
    window.state = window.state || {};

    // ── Test Master ──────────────────────────────────────────────────────────
    window.state.lisTestMaster = [
      { code: 'CBC',      name: 'Complete Blood Count',                dept: 'Haematology',       tubeColor: 'lavender',       price: 350,   tat: 4,    prepInstructions: 'No special preparation required.', icd10: 'D64.9' },
      { code: 'LFT',      name: 'Liver Function Test',                 dept: 'Biochemistry',      tubeColor: 'yellow',         price: 750,   tat: 6,    prepInstructions: '8-hour fasting required.', icd10: 'K21.9' },
      { code: 'KFT',      name: 'Kidney Function Test',                dept: 'Biochemistry',      tubeColor: 'yellow',         price: 650,   tat: 6,    prepInstructions: 'Avoid strenuous exercise 24h before test.', icd10: 'E11.9' },
      { code: 'HBA1C',    name: 'Glycated Haemoglobin (HbA1c)',        dept: 'Biochemistry',      tubeColor: 'lavender',       price: 450,   tat: 4,    prepInstructions: 'No fasting required.', icd10: 'E11.9' },
      { code: 'LIPID',    name: 'Lipid Profile',                       dept: 'Biochemistry',      tubeColor: 'yellow',         price: 800,   tat: 6,    prepInstructions: '12-hour fasting required. Avoid fatty foods for 24h.', icd10: 'I10' },
      { code: 'TSH',      name: 'Thyroid Stimulating Hormone',         dept: 'Serology',          tubeColor: 'yellow',         price: 300,   tat: 8,    prepInstructions: 'No special preparation. Collect in morning.', icd10: 'I10' },
      { code: 'DENGUE',   name: 'Dengue NS1 + IgM/IgG',               dept: 'Serology',          tubeColor: 'yellow',         price: 900,   tat: 8,    prepInstructions: 'No fasting required.', icd10: 'A90' },
      { code: 'WIDAL',    name: 'Widal Test',                          dept: 'Serology',          tubeColor: 'yellow',         price: 250,   tat: 6,    prepInstructions: 'No fasting required.', icd10: 'A01.0' },
      { code: 'HIV',      name: 'HIV 1&2 Antibody (ELISA)',            dept: 'Serology',          tubeColor: 'yellow',         price: 500,   tat: 8,    prepInstructions: 'Counselling and consent mandatory before collection.', icd10: 'B20' },
      { code: 'URINE_RM', name: 'Urine Routine & Microscopy',          dept: 'Clinical Pathology',tubeColor: 'yellow-cap',     price: 200,   tat: 2,    prepInstructions: 'Midstream urine sample. First morning sample preferred.', icd10: 'E11.9' },
      { code: 'BIOP_MED', name: 'Biopsy - Medium (Histopathology)',    dept: 'Histopathology',    tubeColor: 'formalin',       price: 1800,  tat: 72,   prepInstructions: 'Specimen must be placed in 10% buffered formalin immediately after collection.', icd10: 'N92.0' },
      { code: 'FNAC',     name: 'Fine Needle Aspiration Cytology',     dept: 'Cytology',          tubeColor: 'slides',         price: 1000,  tat: 48,   prepInstructions: 'Procedure done by pathologist. No preparation required.', icd10: 'N92.0' },
      { code: 'CULTURE',  name: 'Culture & Sensitivity (Blood/Urine/Pus)', dept: 'Microbiology', tubeColor: 'culture-bottle', price: 1200,  tat: 48,   prepInstructions: 'Collect before starting antibiotics. Use aseptic technique.', icd10: 'A49' },
      { code: 'ABG',      name: 'Arterial Blood Gas Analysis',         dept: 'Biochemistry',      tubeColor: 'lavender',       price: 600,   tat: 1,    prepInstructions: 'Radial artery sample - collect in heparinised syringe on ice.', icd10: 'I25.1' },
      { code: 'PROCALC',  name: 'Procalcitonin',                       dept: 'Biochemistry',      tubeColor: 'yellow',         price: 1800,  tat: 4,    prepInstructions: 'No fasting required. STAT priority for sepsis workup.', icd10: 'A49' },
      { code: 'COAG',     name: 'Coagulation Profile (PT/APTT/INR)',   dept: 'Haematology',       tubeColor: 'lavender',       price: 550,   tat: 3,    prepInstructions: 'Citrate tube. Fill to mark exactly.', icd10: 'I25.1' },
      { code: 'ECHO_BNP', name: 'NT-proBNP (Cardiac Biomarker)',       dept: 'Biochemistry',      tubeColor: 'yellow',         price: 2200,  tat: 4,    prepInstructions: 'No fasting required.', icd10: 'I25.1' },
      { code: 'OUT_GENE', name: 'Outsourced - Genetic Panel (BRCA1/2)',dept: 'Outsourced',        tubeColor: 'lavender',       price: 15000, tat: 1440, prepInstructions: 'Special transport kit required. Lab will arrange pick-up.', icd10: 'N92.0' }
    ];

    window.state.testPackages = [
      { id: 'PKG001', name: 'Master Health Checkup',    tests: ['CBC','LFT','KFT','LIPID'],                          price: 1500, description: 'Comprehensive routine health check' },
      { id: 'PKG002', name: 'Executive Wellness Panel', tests: ['CBC','LFT','KFT','LIPID','TSH','HBA1C'],            price: 3000, description: 'Complete executive health screening' },
      { id: 'PKG003', name: 'Diabetes Care Package',    tests: ['HBA1C','KFT','LIPID'],                              price: 1200, description: 'Diabetes monitoring and complication screening' },
      { id: 'PKG004', name: 'Pre-Employment Panel',     tests: ['CBC','LFT','KFT','HIV','URINE_RM'],                 price: 1800, description: 'Standard pre-employment fitness tests' },
      { id: 'PKG005', name: 'Senior Citizen Panel',     tests: ['CBC','LFT','KFT','LIPID','TSH','HBA1C','URINE_RM'], price: 2500, description: 'Comprehensive panel for 60+ years' },
      { id: 'PKG006', name: 'Sepsis Workup Bundle',     tests: ['CBC','CULTURE','PROCALC','ABG'],                    price: 3800, description: 'Critical care sepsis investigation panel' },
      { id: 'PKG007', name: 'Cardiac Risk Panel',       tests: ['ECHO_BNP','LIPID','CBC','COAG'],                    price: 4500, description: 'Cardiac biomarker and risk profiling' }
    ];

    // ── Dynamic IPD/DayCare/Emergency patient lookup ─────────────────────────
    var liveIPD = (window.state.patients || []).filter(function(p) {
      return (p.status === 'Admitted') && (p.type === 'IPD' || p.type === 'Daycare' || p.type === 'Emergency');
    });

    // Helper to pick a live patient or fall back to a stub
    function livePt(index, fallback) {
      return liveIPD[index] || fallback;
    }

    // Build accession number from patient index
    function acc(n) { return 'ACC-2026-' + String(700 + n).padStart(4,'0'); }
    function spec(n) { return 'SPEC-2026-' + String(700 + n).padStart(4,'0'); }

    var today = new Date();
    function ts(hh, mm) {
      var d = new Date(today);
      d.setHours(hh, mm, 0, 0);
      return d.toISOString();
    }

    // ── Real IPD patient references ──────────────────────────────────────────
    var p0 = livePt(0,  { uhid:'UH-50001', name:'Aarav Kumar',        age:52, gender:'Male',   ward:'General Ward (Male)',             bed:'GWM-101-B1', department:'General Medicine', primaryConsultant:'Dr. Amit Verma',   type:'IPD', blood_group:'B+',  mobile:'9876501001' });
    var p1 = livePt(1,  { uhid:'UH-50002', name:'Priya Sharma',       age:34, gender:'Female', ward:'General Ward (Female)',           bed:'GWF-103-B1', department:'Gynecology & Obs', primaryConsultant:'Dr. Priya Nair',   type:'IPD', blood_group:'O+',  mobile:'9876501002' });
    var p2 = livePt(2,  { uhid:'UH-50003', name:'Mohammed Farooq',    age:45, gender:'Male',   ward:'Semi-Private Ward',               bed:'SP-201-A',    department:'General Medicine', primaryConsultant:'Dr. Srinivasan',   type:'IPD', blood_group:'A+',  mobile:'9876501003' });
    var p3 = livePt(3,  { uhid:'UH-50004', name:'Sunita Reddy',       age:62, gender:'Female', ward:'Private Room',                    bed:'PVT-301',   department:'Cardiology',       primaryConsultant:'Dr. Anand',        type:'IPD', blood_group:'AB+', mobile:'9876501004' });
    var p4 = livePt(4,  { uhid:'UH-50005', name:'Vikram Nair',        age:28, gender:'Male',   ward:'General Ward (Male)',             bed:'GWM-101-B2', department:'General Surgery',  primaryConsultant:'Dr. Mehta',        type:'IPD', blood_group:'O-',  mobile:'9876501005' });
    var p5 = livePt(5,  { uhid:'UH-50006', name:'Lakshmi Iyer',       age:71, gender:'Female', ward:'Critical Care Unit',              bed:'CCU-B1', department:'General Medicine',primaryConsultant:'Dr. Amit Verma',   type:'IPD', blood_group:'B-',  mobile:'9876501006' });
    var p6 = livePt(6,  { uhid:'UH-50007', name:'Deepak Yadav',       age:40, gender:'Male',   ward:'Semi-Private Ward',               bed:'SP-201-B',    department:'Pediatrics',       primaryConsultant:'Dr. Ramesh Iyer',  type:'IPD', blood_group:'A-',  mobile:'9876501007' });
    var p7 = livePt(7,  { uhid:'UH-50008', name:'Anita Shetty',       age:55, gender:'Female', ward:'General Ward (Female)',           bed:'GWF-103-B2', department:'General Medicine', primaryConsultant:'Dr. Srinivasan',   type:'IPD', blood_group:'O+',  mobile:'9876501008' });
    var p8 = livePt(8,  { uhid:'UH-50009', name:'Rajesh Pillai',      age:67, gender:'Male',   ward:'Intensive Cardiac Care Unit',     bed:'ICCU-B1',department:'Cardiology',      primaryConsultant:'Dr. Anand',        type:'IPD', blood_group:'A+',  mobile:'9876501009' });
    var p9 = livePt(9,  { uhid:'UH-50010', name:'Geetha Krishnamurthy',age:48,gender:'Female', ward:'Private Room',                    bed:'PVT-302',   department:'General Surgery',  primaryConsultant:'Dr. Mehta',        type:'IPD', blood_group:'B+',  mobile:'9876501010' });
    // Emergency
    var p10 = livePt(20,{ uhid:'UH-50021', name:'Sanjay Verma',       age:38, gender:'Male',   ward:'EMERGENCY',                       bed:'ER-1-B1',    department:'Emergency Medicine',primaryConsultant:'Dr. Fatima Sheikh',type:'Emergency',blood_group:'O+',mobile:'9876501021' });
    var p11 = livePt(21,{ uhid:'UH-50022', name:'Rekha Malhotra',     age:29, gender:'Female', ward:'EMERGENCY',                       bed:'ER-1-B2',    department:'Emergency Medicine',primaryConsultant:'Dr. Fatima Sheikh',type:'Emergency',blood_group:'A+',mobile:'9876501022' });
    // Daycare
    var p12 = livePt(22,{ uhid:'UH-50031', name:'Harish Bajpai',      age:55, gender:'Male',   ward:'DAYCARE',                         bed:'DC-BED-1',     department:'General Medicine', primaryConsultant:'Dr. Srinivasan',   type:'Daycare', blood_group:'B+', mobile:'9876501031' });
    var p13 = livePt(23,{ uhid:'UH-50032', name:'Fatima Begum',       age:42, gender:'Female', ward:'DAYCARE',                         bed:'DC-BED-2',     department:'Gynecology & Obs', primaryConsultant:'Dr. Priya Nair',   type:'Daycare', blood_group:'AB+',mobile:'9876501032' });
    var p14 = livePt(24,{ uhid:'UH-50033', name:'Chandan Bose',       age:61, gender:'Male',   ward:'DAYCARE',                         bed:'DC-BED-3',     department:'Cardiology',       primaryConsultant:'Dr. Anand',        type:'Daycare', blood_group:'O-', mobile:'9876501033' });

    function ptName(p) { return p.name; }
    function ptAge(p)  { return p.age; }
    function ptGender(p) { return (p.gender === 'Female' || p.gender === 'F') ? 'F' : 'M'; }
    function ptWard(p) { return p.ward || '—'; }
    function ptBed(p)  { return p.bed || '—'; }
    function ptDoc(p)  { return p.primaryConsultant || 'Dr. Attending'; }

    // ── Phlebotomy Queue ─────────────────────────────────────────────────────
    window.state.phlebotomyQueue = [
      // IPD - CCU (STAT - post-op anaemia workup)
      { accNo: acc(1), uhid: p5.uhid, name: ptName(p5), age: ptAge(p5), gender: ptGender(p5),
        patientType: 'IPD', ward: ptWard(p5), bedNo: ptBed(p5), dept: 'Haematology',
        tests: ['CBC', 'COAG'], status: 'Queued', priority: 'STAT',
        bookedAt: ts(6,0), collectedBy: null, collectionTime: null,
        tubeColor: 'lavender', mlcFlag: false, bookingChannel: 'IPD Ward', refDoctor: ptDoc(p5),
        indication: 'Post-op Day 2 - haemoglobin monitoring, suspected anaemia' },

      // IPD - General Ward Male (Urgent - fever workup)
      { accNo: acc(2), uhid: p0.uhid, name: ptName(p0), age: ptAge(p0), gender: ptGender(p0),
        patientType: 'IPD', ward: ptWard(p0), bedNo: ptBed(p0), dept: 'Serology',
        tests: ['DENGUE', 'WIDAL'], status: 'Queued', priority: 'Urgent',
        bookedAt: ts(8,15), collectedBy: null, collectionTime: null,
        tubeColor: 'yellow', mlcFlag: false, bookingChannel: 'IPD Ward', refDoctor: ptDoc(p0),
        indication: 'Fever 5 days, thrombocytopaenia suspected' },

      // IPD - Semi-Private (Collected - sepsis)
      { accNo: acc(3), uhid: p2.uhid, name: ptName(p2), age: ptAge(p2), gender: ptGender(p2),
        patientType: 'IPD', ward: ptWard(p2), bedNo: ptBed(p2), dept: 'Microbiology',
        tests: ['CULTURE', 'PROCALC'], status: 'Collected', priority: 'STAT',
        bookedAt: ts(7,45), collectedBy: 'Ward Nurse Kavitha', collectionTime: ts(8,10),
        tubeColor: 'culture-bottle', mlcFlag: false, bookingChannel: 'IPD Ward', refDoctor: ptDoc(p2),
        indication: 'Fever spikes 39.8°C - Blood culture before antibiotics' },

      // ICCU - Cardiac (STAT)
      { accNo: acc(4), uhid: p8.uhid, name: ptName(p8), age: ptAge(p8), gender: ptGender(p8),
        patientType: 'IPD', ward: ptWard(p8), bedNo: ptBed(p8), dept: 'Biochemistry',
        tests: ['ECHO_BNP', 'LFT', 'KFT'], status: 'Queued', priority: 'STAT',
        bookedAt: ts(9,0), collectedBy: null, collectionTime: null,
        tubeColor: 'yellow', mlcFlag: false, bookingChannel: 'IPD Ward', refDoctor: ptDoc(p8),
        indication: 'NSTEMI admitted 2h ago - biomarker panel + organ function' },

      // IPD - Private Room (Post-op Day 1)
      { accNo: acc(5), uhid: p3.uhid, name: ptName(p3), age: ptAge(p3), gender: ptGender(p3),
        patientType: 'IPD', ward: ptWard(p3), bedNo: ptBed(p3), dept: 'Biochemistry',
        tests: ['LFT', 'KFT', 'CBG'], status: 'Queued', priority: 'Routine',
        bookedAt: ts(9,30), collectedBy: null, collectionTime: null,
        tubeColor: 'yellow', mlcFlag: false, bookingChannel: 'IPD Ward', refDoctor: ptDoc(p3),
        indication: 'Cardiac failure monitoring - Day 3 labs' },

      // Emergency - MLC (RTA)
      { accNo: acc(6), uhid: p10.uhid, name: ptName(p10), age: ptAge(p10), gender: ptGender(p10),
        patientType: 'IPD', ward: ptWard(p10), bedNo: ptBed(p10), dept: 'Haematology',
        tests: ['CBC', 'COAG', 'LFT', 'KFT'], status: 'Collected', priority: 'STAT',
        bookedAt: ts(5,30), collectedBy: 'Dr. Fatima Sheikh', collectionTime: ts(5,45),
        tubeColor: 'lavender', mlcFlag: true, mlcDetails: 'RTA - MVA, FIR No. 2026/GJ/1247, Referred from District Hospital',
        bookingChannel: 'IPD Ward', refDoctor: ptDoc(p10),
        indication: 'RTA - polytrauma, haemorrhagic shock workup' },

      // Emergency - Verbal Order (ward nurse collected, pending co-sign)
      { accNo: acc(7), uhid: p11.uhid, name: ptName(p11), age: ptAge(p11), gender: ptGender(p11),
        patientType: 'IPD', ward: ptWard(p11), bedNo: ptBed(p11), dept: 'Biochemistry',
        tests: ['ABG', 'KFT'], status: 'Collected', priority: 'STAT',
        bookedAt: ts(6,10), collectedBy: 'Staff Nurse Meenakshi', collectionTime: ts(6,20),
        tubeColor: 'lavender', mlcFlag: false, bookingChannel: 'IPD Ward', refDoctor: ptDoc(p11),
        indication: 'Acute respiratory distress - ABG monitoring', isVerbalOrder: true },

      // Daycare - DC-B1 (Chemotherapy day - pre-chemo CBC)
      { accNo: acc(8), uhid: p12.uhid, name: ptName(p12), age: ptAge(p12), gender: ptGender(p12),
        patientType: 'IPD', ward: ptWard(p12), bedNo: ptBed(p12), dept: 'Haematology',
        tests: ['CBC', 'COAG'], status: 'Queued', priority: 'Routine',
        bookedAt: ts(8,0), collectedBy: null, collectionTime: null,
        tubeColor: 'lavender', mlcFlag: false, bookingChannel: 'IPD Ward', refDoctor: ptDoc(p12),
        indication: 'DayCare Chemo Day 2 - Pre-chemo CBC mandatory gate' },

      // Daycare - DC-B2 (Dialysis session - pre-dialysis KFT)
      { accNo: acc(9), uhid: p13.uhid, name: ptName(p13), age: ptAge(p13), gender: ptGender(p13),
        patientType: 'IPD', ward: ptWard(p13), bedNo: ptBed(p13), dept: 'Biochemistry',
        tests: ['KFT', 'CBC'], status: 'Collected', priority: 'Urgent',
        bookedAt: ts(7,0), collectedBy: 'Ward Nurse Savitha', collectionTime: ts(7,15),
        tubeColor: 'yellow', mlcFlag: false, bookingChannel: 'IPD Ward', refDoctor: ptDoc(p13),
        indication: 'DayCare Haemodialysis - pre-session electrolytes and CBC' },

      // IPD - Semi-Private (Surgery Biopsy)
      { accNo: acc(10), uhid: p9.uhid, name: ptName(p9), age: ptAge(p9), gender: ptGender(p9),
        patientType: 'IPD', ward: ptWard(p9), bedNo: ptBed(p9), dept: 'Histopathology',
        tests: ['BIOP_MED'], status: 'Queued', priority: 'Routine',
        bookedAt: ts(10,30), collectedBy: null, collectionTime: null,
        tubeColor: 'formalin', mlcFlag: false, bookingChannel: 'IPD Ward', refDoctor: ptDoc(p9),
        indication: 'Post-surgical biopsy - breast lump excision specimen' },

      // OPD Walk-in
      { accNo: acc(11), uhid: 'UH-OPD-7721', name: 'Sunil Bansal', age: 48, gender: 'M',
        patientType: 'OPD', dept: 'Biochemistry', tests: ['LFT', 'KFT', 'HBA1C'],
        status: 'Queued', priority: 'Routine', bookedAt: ts(9,45),
        collectedBy: null, collectionTime: null, tubeColor: 'yellow',
        mlcFlag: false, bookingChannel: 'Walk-in', refDoctor: 'Dr. Meera Joshi',
        indication: 'Diabetic follow-up, annual liver and kidney function' },

      // External - Home Collection
      { accNo: acc(12), uhid: 'UH-EXT-3391', name: 'Mrs. Saraswathi Rao', age: 68, gender: 'F',
        patientType: 'External', dept: 'Haematology', tests: ['CBC', 'TSH'],
        status: 'Queued', priority: 'Routine', bookedAt: ts(7,30),
        collectedBy: null, collectionTime: null, tubeColor: 'yellow',
        mlcFlag: false, bookingChannel: 'Home Collection',
        homeAddress: 'No. 12, Subhash Nagar, Nashik 422005', collectionSlot: '8:00 AM - 10:00 AM',
        refDoctor: 'Dr. Vinod Pandey', indication: 'Elderly home-bound patient - thyroid and CBC monitoring' }
    ];

    // ── Processing Worklist ──────────────────────────────────────────────────
    window.state.processingWorklist = [
      // Daycare pre-dialysis (collected, in analysis)
      { specId: spec(1), accNo: acc(9), uhid: p13.uhid, name: ptName(p13), age: ptAge(p13), gender: ptGender(p13),
        dept: 'Biochemistry', tests: ['KFT', 'CBC'], stage: 'Analysis',
        instrument: 'Chemistry Analyser - Erba Chem 7', receivedAt: ts(7,20), tat: 6,
        status: 'In Progress', analyst: 'Lab Tech Anjali',
        ward: ptWard(p13), bed: ptBed(p13), patientType: 'Daycare', refDoctor: ptDoc(p13) },

      // Emergency RTA (STAT - result pending)
      { specId: spec(2), accNo: acc(6), uhid: p10.uhid, name: ptName(p10), age: ptAge(p10), gender: ptGender(p10),
        dept: 'Haematology', tests: ['CBC', 'COAG', 'LFT', 'KFT'], stage: 'Result Entry',
        instrument: 'Haematology Analyser - Sysmex XN-550', receivedAt: ts(5,50), tat: 4,
        status: 'Pending Result', analyst: 'Lab Tech Sundar',
        ward: ptWard(p10), bed: ptBed(p10), patientType: 'Emergency', mlcFlag: true, refDoctor: ptDoc(p10) },

      // IPD Sepsis - Microbiology
      { specId: spec(3), accNo: acc(3), uhid: p2.uhid, name: ptName(p2), age: ptAge(p2), gender: ptGender(p2),
        dept: 'Microbiology', tests: ['CULTURE', 'PROCALC'], stage: 'Inoculation',
        instrument: 'Blood Culture System - BD BACTEC', receivedAt: ts(8,15), tat: 48,
        status: 'In Progress', analyst: 'Lab Tech Rekha',
        ward: ptWard(p2), bed: ptBed(p2), patientType: 'IPD', refDoctor: ptDoc(p2) },

      // ICCU Cardiac STAT
      { specId: spec(4), accNo: acc(4), uhid: p8.uhid, name: ptName(p8), age: ptAge(p8), gender: ptGender(p8),
        dept: 'Biochemistry', tests: ['ECHO_BNP', 'LFT', 'KFT'], stage: 'Analysis',
        instrument: 'Chemistry Analyser - Erba Chem 7', receivedAt: ts(9,10), tat: 4,
        status: 'In Progress', analyst: 'Lab Tech Anjali',
        ward: ptWard(p8), bed: ptBed(p8), patientType: 'IPD', refDoctor: ptDoc(p8) },

      // IPD Surgery Biopsy - Histopathology pipeline
      { specId: spec(5), accNo: acc(10), uhid: p9.uhid, name: ptName(p9), age: ptAge(p9), gender: ptGender(p9),
        dept: 'Histopathology', tests: ['BIOP_MED'], stage: 'Grossing',
        instrument: 'Grossing Station', receivedAt: ts(11,0), tat: 72,
        status: 'In Progress', analyst: 'Dr. Poornima Shetty',
        histoStages: ['Received','Grossing','Processing','Embedding','Sectioning','Staining','Mounting','Reporting'],
        currentStageIndex: 1,
        ward: ptWard(p9), bed: ptBed(p9), patientType: 'IPD', refDoctor: ptDoc(p9) },

      // ABG - Emergency Verbal Order
      { specId: spec(6), accNo: acc(7), uhid: p11.uhid, name: ptName(p11), age: ptAge(p11), gender: ptGender(p11),
        dept: 'Biochemistry', tests: ['ABG', 'KFT'], stage: 'Analysis',
        instrument: 'Chemistry Analyser - Erba Chem 7', receivedAt: ts(6,25), tat: 1,
        status: 'In Progress', analyst: 'Lab Tech Anjali',
        ward: ptWard(p11), bed: ptBed(p11), patientType: 'Emergency', refDoctor: ptDoc(p11) },

      // CCU STAT CBC - haemoglobin drop
      { specId: spec(7), accNo: acc(1), uhid: p5.uhid, name: ptName(p5), age: ptAge(p5), gender: ptGender(p5),
        dept: 'Haematology', tests: ['CBC', 'COAG'], stage: 'Analysis',
        instrument: 'Haematology Analyser - Sysmex XN-550', receivedAt: ts(6,40), tat: 4,
        status: 'Pending Result', analyst: 'Lab Tech Sundar',
        ward: ptWard(p5), bed: ptBed(p5), patientType: 'IPD', refDoctor: ptDoc(p5) }
    ];

    // ── Validation Queue ─────────────────────────────────────────────────────
    window.state.validationQueue = [
      // CRITICAL - CCU haemoglobin
      { reportNo: 'RPT-2026-1101', accNo: acc(1), uhid: p5.uhid, name: ptName(p5), age: ptAge(p5), gender: ptGender(p5),
        dept: 'Haematology', tests: ['CBC'],
        result: { 'Haemoglobin': '5.8 g/dL', 'TLC': '14,200 /µL', 'Platelets': '98,000 /µL', 'PCV': '18%', 'Differential': 'Neutrophils 82%, Lymphocytes 12%' },
        flags: ['CRITICAL'], flagLabel: 'CRITICAL — Hb 5.8 g/dL (Ref: 12–16), Plt 98K (Low)',
        enteredBy: 'Lab Tech Sundar', enteredAt: ts(7,30), validatedBy: null, status: 'Pending Validation',
        ward: ptWard(p5), bed: ptBed(p5), refDoctor: ptDoc(p5) },

      // REACTIVE - Emergency Dengue
      { reportNo: 'RPT-2026-1102', accNo: acc(6), uhid: p10.uhid, name: ptName(p10), age: ptAge(p10), gender: ptGender(p10),
        dept: 'Serology', tests: ['DENGUE'],
        result: { 'NS1 Antigen': 'REACTIVE', 'IgM Antibody': 'REACTIVE', 'IgG Antibody': 'Non-Reactive' },
        flags: ['REACTIVE', 'CRITICAL'], flagLabel: 'REACTIVE — Dengue NS1 + IgM Positive (Day 4 illness)',
        enteredBy: 'Lab Tech Prakash', enteredAt: ts(9,45), validatedBy: null, status: 'Pending Validation',
        ward: ptWard(p10), bed: ptBed(p10), refDoctor: ptDoc(p10) },

      // HIGH - ICCU BNP
      { reportNo: 'RPT-2026-1103', accNo: acc(4), uhid: p8.uhid, name: ptName(p8), age: ptAge(p8), gender: ptGender(p8),
        dept: 'Biochemistry', tests: ['ECHO_BNP', 'KFT'],
        result: { 'NT-proBNP': '4,820 pg/mL', 'Creatinine': '2.1 mg/dL', 'Urea': '68 mg/dL', 'eGFR': '34 mL/min' },
        flags: ['H'], flagLabel: 'High — NT-proBNP 4820 pg/mL (Ref: <125), Creatinine 2.1 (CKD Stage 3)',
        enteredBy: 'Lab Tech Anjali', enteredAt: ts(9,50), validatedBy: null, status: 'Pending Validation',
        ward: ptWard(p8), bed: ptBed(p8), refDoctor: ptDoc(p8) },

      // DELTA CHECK - Daycare Dialysis KFT
      { reportNo: 'RPT-2026-1104', accNo: acc(9), uhid: p13.uhid, name: ptName(p13), age: ptAge(p13), gender: ptGender(p13),
        dept: 'Biochemistry', tests: ['KFT'],
        result: { 'Creatinine': '7.2 mg/dL', 'Urea': '142 mg/dL', 'Sodium': '132 mEq/L', 'Potassium': '5.8 mEq/L', 'eGFR': '9 mL/min' },
        flags: ['DELTA CHECK', 'CRITICAL'], flagLabel: 'Delta Check — K+ 5.8 mEq/L (raised from 4.9, +0.9), Creatinine 7.2 mg/dL',
        enteredBy: 'Lab Tech Anjali', enteredAt: ts(7,35), validatedBy: null, status: 'Pending Validation',
        ward: ptWard(p13), bed: ptBed(p13), refDoctor: ptDoc(p13) },

      // ABG Emergency (Verbal Order)
      { reportNo: 'RPT-2026-1105', accNo: acc(7), uhid: p11.uhid, name: ptName(p11), age: ptAge(p11), gender: ptGender(p11),
        dept: 'Biochemistry', tests: ['ABG'],
        result: { 'pH': '7.22', 'pCO2': '58 mmHg', 'pO2': '52 mmHg', 'HCO3': '18 mEq/L', 'SpO2': '84%', 'Base Excess': '-8' },
        flags: ['CRITICAL'], flagLabel: 'CRITICAL — Respiratory Acidosis + Hypoxaemia (pH 7.22, pO2 52)',
        enteredBy: 'Lab Tech Anjali', enteredAt: ts(6,30), validatedBy: null, status: 'Pending Validation',
        ward: ptWard(p11), bed: ptBed(p11), refDoctor: ptDoc(p11) }
    ];

    // ── Critical Values ──────────────────────────────────────────────────────
    window.state.criticalValues = [
      { id: 'CRIT-001', accNo: acc(1), uhid: p5.uhid, name: ptName(p5),
        dept: 'Haematology', test: 'Haemoglobin', value: '5.8 g/dL', criticalLimit: '< 7.0 g/dL',
        reportedAt: ts(7,32), reportedBy: 'Lab Tech Sundar', notifiedTo: null, ackStatus: 'Pending',
        refDoctor: ptDoc(p5), ward: ptWard(p5), bed: ptBed(p5) },

      { id: 'CRIT-002', accNo: acc(7), uhid: p11.uhid, name: ptName(p11),
        dept: 'Biochemistry', test: 'Arterial Blood Gas - pH', value: '7.22', criticalLimit: '< 7.25',
        reportedAt: ts(6,32), reportedBy: 'Lab Tech Anjali', notifiedTo: null, ackStatus: 'Pending',
        refDoctor: ptDoc(p11), ward: ptWard(p11), bed: ptBed(p11) },

      { id: 'CRIT-003', accNo: acc(4), uhid: p8.uhid, name: ptName(p8),
        dept: 'Biochemistry', test: 'NT-proBNP', value: '4,820 pg/mL', criticalLimit: '> 2,000 pg/mL (NSTEMI range)',
        reportedAt: ts(9,52), reportedBy: 'Lab Tech Anjali', notifiedTo: null, ackStatus: 'Pending',
        refDoctor: ptDoc(p8), ward: ptWard(p8), bed: ptBed(p8) },

      { id: 'CRIT-004', accNo: acc(9), uhid: p13.uhid, name: ptName(p13),
        dept: 'Biochemistry', test: 'Serum Potassium', value: '5.8 mEq/L', criticalLimit: '> 5.5 mEq/L (dialysis patient)',
        reportedAt: ts(7,38), reportedBy: 'Lab Tech Anjali', notifiedTo: null, ackStatus: 'Pending',
        refDoctor: ptDoc(p13), ward: ptWard(p13), bed: ptBed(p13) }
    ];

    window.state.criticalAckRegister = [
      { id: 'CRIT-ACK-001', critId: 'CRIT-HIST-005', accNo: 'PREV-2026-0441', uhid: 'UH-HIST-31',
        name: 'Harish Srivastav', test: 'Blood Glucose', value: '28 mg/dL',
        ackedBy: 'Lab Tech Prakash', ackedAt: ts(22,15), calledTo: 'Dr. Amit Verma (on-call)',
        readBackConfirmed: true, clinicianResponse: 'Patient given IV Dextrose 25%, monitoring q30min' },
      { id: 'CRIT-ACK-002', critId: 'CRIT-HIST-004', accNo: 'PREV-2026-0432', uhid: 'UH-HIST-22',
        name: 'Anita Desai', test: 'INR', value: '6.2',
        ackedBy: 'Lab Tech Ramesh', ackedAt: ts(19,40), calledTo: 'Dr. Anand (Cardiology)',
        readBackConfirmed: true, clinicianResponse: 'Warfarin held, IV Vitamin K administered, repeat INR in 6h' }
    ];

    // ── IQC Log ──────────────────────────────────────────────────────────────
    window.state.qcLog = [
      { id: 'QC-001', date: new Date().toISOString().slice(0,10),
        instrument: 'Haematology Analyser - Sysmex XN-550', dept: 'Haematology',
        controlLevel: 'Level 2 (Normal)', lotNo: 'LOT-HEM-2026-04',
        status: 'Pass', meanValue: '14.1', sdValue: '0.3', cvPercent: '2.1',
        analyst: 'Lab Tech Sundar', comments: 'All parameters within Westgard rules. Hb, TLC, Plt in range.' },
      { id: 'QC-002', date: new Date().toISOString().slice(0,10),
        instrument: 'Chemistry Analyser - Erba Chem 7', dept: 'Biochemistry',
        controlLevel: 'Level 1 (Low)', lotNo: 'LOT-BIO-2026-07',
        status: 'Fail', meanValue: '4.2', sdValue: '0.8', cvPercent: '19.0',
        analyst: 'Lab Tech Anjali', iqcHold: true,
        comments: '12S rule violation — Glucose control out of range. Instrument recalibrated. Re-run pending. All biochemistry results on HOLD.' },
      { id: 'QC-003', date: new Date().toISOString().slice(0,10),
        instrument: 'ELISA Reader - BioTek ELx800', dept: 'Serology',
        controlLevel: 'Positive Control', lotNo: 'LOT-SER-2026-03',
        status: 'Pass', meanValue: 'OD 1.45', sdValue: '0.05', cvPercent: '3.4',
        analyst: 'Lab Tech Prakash', comments: 'Dengue NS1, IgM kits validated. Widal antigen check passed.' },
      { id: 'QC-004', date: new Date().toISOString().slice(0,10),
        instrument: 'BD BACTEC FX Blood Culture System', dept: 'Microbiology',
        controlLevel: 'Positive Blood Culture Control', lotNo: 'LOT-MIC-2026-05',
        status: 'Pass', meanValue: 'FLAG+', sdValue: 'N/A', cvPercent: 'N/A',
        analyst: 'Lab Tech Rekha', comments: 'Positive and negative controls passed. System calibration verified.' }
    ];

    window.state.eqasRegister = [
      { id: 'EQAS-001', scheme: 'CMC Vellore PT Scheme',       dept: 'Biochemistry',  cycle: 'Q2-2026', submittedAt: '2026-04-30', result: 'Satisfactory',      score: '95/100', remarks: 'All analytes within acceptable limits. LFT, KFT, Glucose excellent.' },
      { id: 'EQAS-002', scheme: 'AIIMS EQAS Haematology',     dept: 'Haematology',   cycle: 'Q2-2026', submittedAt: '2026-04-30', result: 'Satisfactory',      score: '92/100', remarks: 'Minor deviation in Reticulocyte count — corrective action taken.' },
      { id: 'EQAS-003', scheme: 'NABL EQAS Serology',         dept: 'Serology',      cycle: 'Q2-2026', submittedAt: '2026-05-15', result: 'Satisfactory',      score: '98/100', remarks: 'Excellent performance in all viral markers. Dengue & Widal kits validated.' },
      { id: 'EQAS-004', scheme: 'IAP EQAS Microbiology',      dept: 'Microbiology',  cycle: 'Q1-2026', submittedAt: '2026-01-31', result: 'Needs Improvement', score: '74/100', remarks: 'AST interpretation for MRSA — retraining done, Q3-2026 improvement expected.' }
    ];

    window.state.outsourceRegister = [
      { id: 'OUT-001', accNo: 'OUT-2026-0051', uhid: p9.uhid, name: ptName(p9),
        test: 'OUT_GENE', testName: 'Genetic Panel — BRCA1/2 (NGS)',
        labName: 'SRL Diagnostics, Mumbai', dispatchedAt: ts(14,0), expectedTat: new Date(today.getTime()+72*3600000).toISOString(),
        status: 'Dispatched', trackingId: 'SRL-MUM-2026-78901', resultDoc: null },
      { id: 'OUT-002', accNo: 'OUT-2026-0048', uhid: 'UH-EXT-9901', name: 'Chandan Bose',
        test: 'OUT_GENE', testName: 'NGS Panel — Haematological Malignancies',
        labName: 'MedGenome Labs, Bengaluru', dispatchedAt: ts(11,0), expectedTat: new Date(today.getTime()+120*3600000).toISOString(),
        status: 'Dispatched', trackingId: 'MGX-BLR-2026-54312', resultDoc: null }
    ];

    window.state.reagentAlerts = [
      { id: 'REG-001', reagent: 'CBC Lyse Reagent (Sysmex)',       instrument: 'Haematology Analyser - Sysmex XN-550', currentStock: '2 packs',   reorderLevel: '5 packs',   status: 'Low Stock', lastOrderDate: '2026-07-01', vendor: 'Sysmex India Pvt Ltd' },
      { id: 'REG-002', reagent: 'Dengue NS1 Combo ELISA Kit',     instrument: 'ELISA Reader - BioTek ELx800',         currentStock: '18 tests',  reorderLevel: '50 tests',  status: 'Low Stock', lastOrderDate: '2026-06-25', vendor: 'J. Mitra & Co. Pvt Ltd' },
      { id: 'REG-003', reagent: 'Blood Culture Bottles (Aerobic)',instrument: 'BD BACTEC FX Blood Culture System',    currentStock: '6 bottles', reorderLevel: '20 bottles',status: 'Low Stock', lastOrderDate: '2026-07-05', vendor: 'Becton Dickinson India' },
      { id: 'REG-004', reagent: 'NT-proBNP Assay Cartridges',     instrument: 'Chemistry Analyser - Erba Chem 7',     currentStock: '4 tests',   reorderLevel: '15 tests',  status: 'Low Stock', lastOrderDate: '2026-07-08', vendor: 'Roche Diagnostics India' }
    ];

    window.state.reportDispatchLog = [
      { dispatchId: 'DISP-2026-0891', accNo: 'PREV-ACC-0891', uhid: 'UH-HIST-41', name: 'Geeta Sharma',   test: 'LFT + KFT', validatedBy: 'Dr. Anand (Biochemist)',      validatedAt: ts(18,0),  dispatchMode: 'Portal Auto-release + SMS',          dispatchedAt: ts(18,2),  status: 'Delivered' },
      { dispatchId: 'DISP-2026-0890', accNo: 'PREV-ACC-0890', uhid: 'UH-HIST-38', name: 'Ravi Naik',      test: 'CBC',       validatedBy: 'Dr. Priya Nair (Pathologist)',  validatedAt: ts(16,30), dispatchMode: 'IPD Ward — Nurse Station',            dispatchedAt: ts(16,31), status: 'Delivered' },
      { dispatchId: 'DISP-2026-0889', accNo: 'PREV-ACC-0889', uhid: 'UH-HIST-35', name: 'Kavya Menon',    test: 'TSH',       validatedBy: 'Dr. Srinivasan (Biochemist)',   validatedAt: ts(22,10), dispatchMode: 'WhatsApp + Portal (Home Collection)', dispatchedAt: ts(22,11), status: 'Delivered' }
    ];

    window.state.recollectionAlerts = [
      { id: 'RECOL-001', accNo: 'ACC-2026-PREV-0698', uhid: 'UH-HIST-29', name: 'Gopal Menon',
        test: 'HBA1C', reason: 'Haemolysed sample — sample quality unacceptable for analysis',
        requestedAt: ts(8,0), requestedBy: 'Lab Tech Sundar', status: 'Pending Recollection', contactNo: '9876501234' }
    ];

    window.state.rejectionRegister = [
      { id: 'REJ-001', accNo: 'REJ-2026-0031', uhid: 'UH-HIST-55', name: 'Suresh Nambiar',
        test: 'CULTURE', reason: 'Improper container — non-sterile bottle used',
        rejectedAt: ts(7,15), rejectedBy: 'Lab Tech Rekha', recollectionStatus: 'Recollection Ordered' },
      { id: 'REJ-002', accNo: 'REJ-2026-0030', uhid: 'UH-HIST-48', name: 'Meena Pillai',
        test: 'LFT', reason: 'Insufficient volume — less than 2 mL serum available',
        rejectedAt: ts(16,40), rejectedBy: 'Lab Tech Anjali', recollectionStatus: 'Recollected' }
    ];

    window.state.notifiableDiseaseLog = [
      { id: 'NOTIF-001', accNo: acc(6), uhid: p10.uhid, name: ptName(p10),
        disease: 'Dengue Fever (Probable)', result: 'NS1 + IgM REACTIVE', reportedToAuthority: 'District Health Officer, Nashik',
        reportedAt: ts(10,0), reportedBy: ptDoc(p10), status: 'Reported' },
      { id: 'NOTIF-002', accNo: 'TB-2026-0019', uhid: 'UH-HIST-77', name: 'Ram Kishore Yadav',
        disease: 'Pulmonary Tuberculosis', result: 'GeneXpert MTB Detected, RIF Sensitive',
        reportedToAuthority: 'RNTCP — District TB Officer', reportedAt: ts(14,30), reportedBy: 'Dr. Shalini Gupta', status: 'Reported' }
    ];

    window.state.lisAuditLogs = [
      { logId: 'AUDIT-LIS-0505', timestamp: ts(9,52), user: 'Lab Tech Anjali',       role: 'Laboratory Technician', action: 'Critical Value Raised',   details: 'NT-proBNP 4820 pg/mL for ' + ptName(p8) + ' (' + p8.uhid + '). CRIT-003 raised. CCU informed.', ipAddress: '192.168.1.45' },
      { logId: 'AUDIT-LIS-0504', timestamp: ts(9,45), user: 'Lab Tech Prakash',      role: 'Laboratory Technician', action: 'Result Entry',            details: 'Dengue NS1+IgM REACTIVE for ' + ptName(p10) + ' (' + p10.uhid + '). Notifiable disease flagged.', ipAddress: '192.168.1.47' },
      { logId: 'AUDIT-LIS-0503', timestamp: ts(8,10), user: 'Ward Nurse Kavitha',    role: 'Ward Nurse',            action: 'Sample Collected',        details: acc(3) + ' blood culture collected bedside at ' + ptWard(p2) + ' ' + ptBed(p2) + ' before antibiotics.', ipAddress: '192.168.1.61' },
      { logId: 'AUDIT-LIS-0502', timestamp: ts(7,32), user: 'Lab Tech Sundar',       role: 'Laboratory Technician', action: 'Critical Value Alert',    details: 'Hb 5.8 g/dL CRITICAL for ' + ptName(p5) + ' (' + p5.uhid + ') — ' + ptWard(p5) + '. Dr. alerted. CRIT-001 raised.', ipAddress: '192.168.1.44' },
      { logId: 'AUDIT-LIS-0501', timestamp: ts(6,30), user: 'Lab Tech Anjali',       role: 'Laboratory Technician', action: 'Critical Value Alert',    details: 'ABG pH 7.22 CRITICAL — Resp Acidosis for ' + ptName(p11) + ' (' + p11.uhid + '). EMG-02. CRIT-002 raised.', ipAddress: '192.168.1.45' },
      { logId: 'AUDIT-LIS-0500', timestamp: ts(6,10), user: 'Staff Nurse Meenakshi', role: 'Ward Nurse',            action: 'Verbal Order Collected',  details: 'Verbal order ABG+KFT for ' + ptName(p11) + ' (' + p11.uhid + '). Co-sign pending from Dr. Fatima Sheikh.', ipAddress: '192.168.1.60' }
    ];

    window.state.verbalLabOrders = [
      { orderId: 'VRB-2026-001', uhid: p11.uhid, patientName: ptName(p11),
        ward: ptWard(p11), bed: ptBed(p11), tests: ['ABG', 'KFT'],
        nurseName: 'Staff Nurse Meenakshi', orderingPhysician: ptDoc(p11),
        orderedAt: ts(6,10), status: 'Pending Co-sign', readBackConfirmed: true }
    ];

    window.state.bloodBankCrossMatches = [
      { id: 'CM-001', uhid: p5.uhid, name: ptName(p5), blood_group: p5.bloodGroup || 'B+',
        units_requested: 2, units_crossmatched: 2, product: 'Packed Red Cells',
        ordered_by: ptDoc(p5), ordered_at: ts(7,45), status: 'Crossmatched — Ready to Issue',
        crossmatched_by: 'Blood Bank Tech Ramesh' },
      { id: 'CM-002', uhid: p8.uhid, name: ptName(p8), blood_group: p8.bloodGroup || 'A+',
        units_requested: 1, units_crossmatched: 0, product: 'FFP',
        ordered_by: ptDoc(p8), ordered_at: ts(9,5), status: 'Pending Crossmatch',
        crossmatched_by: null }
    ];

    window.state.bloodStock = [
      { blood_group: 'A+',  packed_red_cells: 8,  platelets: 4, ffp: 6,  cryoprecipitate: 3 },
      { blood_group: 'A-',  packed_red_cells: 2,  platelets: 1, ffp: 2,  cryoprecipitate: 0 },
      { blood_group: 'B+',  packed_red_cells: 10, platelets: 5, ffp: 8,  cryoprecipitate: 2 },
      { blood_group: 'B-',  packed_red_cells: 1,  platelets: 0, ffp: 1,  cryoprecipitate: 0 },
      { blood_group: 'O+',  packed_red_cells: 14, platelets: 6, ffp: 10, cryoprecipitate: 4 },
      { blood_group: 'O-',  packed_red_cells: 3,  platelets: 2, ffp: 3,  cryoprecipitate: 1 },
      { blood_group: 'AB+', packed_red_cells: 5,  platelets: 3, ffp: 5,  cryoprecipitate: 2 },
      { blood_group: 'AB-', packed_red_cells: 1,  platelets: 0, ffp: 1,  cryoprecipitate: 0 }
    ];

    window.state.lisSampleStorage = [
      { id: 'STOR-001', specId: spec(1), location: 'Refrigerator B — Rack 2 — Position 4', storedAt: ts(7,25),  retentionDays: 7, retainTill: new Date(today.getTime()+7*86400000).toISOString().slice(0,10) },
      { id: 'STOR-002', specId: spec(3), location: 'Incubator — Blood Culture Rack A',     storedAt: ts(8,20),  retentionDays: 5, retainTill: new Date(today.getTime()+5*86400000).toISOString().slice(0,10) },
      { id: 'STOR-003', specId: spec(5), location: 'Formalin Cabinet — Shelf 1 — Jar F9',  storedAt: ts(11,5),  retentionDays: 30,retainTill: new Date(today.getTime()+30*86400000).toISOString().slice(0,10) }
    ];

    window.state.lisEquipments = [
      { id: 'EQ-001', name: 'Haematology Analyser - Sysmex XN-550',     dept: 'Haematology',   status: 'Operational',                   lastCalibrated: ts(7,0),  nextPM: new Date(today.getTime()+17*86400000).toISOString().slice(0,10), vendor: 'Sysmex India Pvt Ltd' },
      { id: 'EQ-002', name: 'Chemistry Analyser - Erba Chem 7',         dept: 'Biochemistry',  status: 'IQC Hold — Recalibration Pending',lastCalibrated: ts(8,0), nextPM: new Date(today.getTime()+12*86400000).toISOString().slice(0,10), vendor: 'Erba Mannheim India' },
      { id: 'EQ-003', name: 'ELISA Reader - BioTek ELx800',             dept: 'Serology',      status: 'Operational',                   lastCalibrated: ts(8,0),  nextPM: new Date(today.getTime()+23*86400000).toISOString().slice(0,10), vendor: 'BioTek Instruments India' },
      { id: 'EQ-004', name: 'BD BACTEC FX Blood Culture System',        dept: 'Microbiology',  status: 'Operational',                   lastCalibrated: ts(9,0),  nextPM: new Date(today.getTime()+28*86400000).toISOString().slice(0,10), vendor: 'Becton Dickinson India' },
      { id: 'EQ-005', name: 'Urine Analyser - Mindray UC-3500',         dept: 'Clinical Path', status: 'Operational',                   lastCalibrated: ts(8,30), nextPM: new Date(today.getTime()+45*86400000).toISOString().slice(0,10), vendor: 'Mindray Medical India' }
    ];

    // Sync any external labOrders from state
    if (window.state.labOrders && window.state.labOrders.length > 0) {
      window.state.labOrders.forEach(function (order) {
        var exists = window.state.phlebotomyQueue.some(function (q) { return q.accNo === order.accNo; });
        if (!exists) {
          window.state.phlebotomyQueue.push({
            accNo: order.accNo || ('ACC-EXT-' + Date.now()),
            uhid: order.uhid || 'N/A',
            name: order.patientName || 'Unknown',
            age: order.age || 0,
            gender: order.gender || 'M',
            patientType: order.patientType || 'OPD',
            dept: order.dept || 'General',
            tests: order.tests || [],
            status: 'Queued',
            priority: order.priority || 'Routine',
            bookedAt: order.orderedAt || new Date().toISOString(),
            collectedBy: null,
            collectionTime: null,
            tubeColor: 'yellow',
            mlcFlag: order.mlcFlag || false,
            bookingChannel: order.bookingChannel || 'Walk-in',
            refDoctor: order.refDoctor || 'N/A'
          });
        }
      });
    }
  }

  // ---------------------------------------------------------------------------
  // SECTION 2: Role Configuration
  // ---------------------------------------------------------------------------
  var ROLE_CONFIG = {
    'Laboratory Director':    { newOrder: false, panels: ['kpi', 'iqc_eqas', 'tat_compliance', 'audit'] },
    'Laboratory Manager':     { newOrder: true,  panels: ['all'] },
    'Pathologist':            { newOrder: false, panels: ['validation', 'critical_alerts', 'dispatch'] },
    'Microbiologist':         { newOrder: false, panels: ['validation', 'critical_alerts'] },
    'Biochemist':             { newOrder: false, panels: ['validation', 'critical_alerts'] },
    'Histopathologist':       { newOrder: false, panels: ['histopath_pipeline'] },
    'Laboratory Supervisor':  { newOrder: false, panels: ['phleb_queue', 'worklist', 'rejection', 'recollection', 'storage'] },
    'Laboratory Technician':  { newOrder: false, panels: ['worklist', 'qc', 'result_entry'] },
    'Phlebotomist':           { newOrder: false, panels: ['phleb_queue'] },
    'Ward Nurse':             { newOrder: false, panels: ['phleb_queue_ipd'] },
    'Laboratory Reception':   { newOrder: true,  panels: ['booking', 'phleb_queue'] }
  };

  var ROLE_DESCRIPTIONS = {
    'Laboratory Director':    'Director-level oversight: KPI analytics, QC/EQAS compliance, TAT monitoring, and audit trails.',
    'Laboratory Manager':     'Full access: All LIS modules including order booking, worklist, QC, and reporting.',
    'Pathologist':            'Clinical validation and sign-off: Pending reports, critical value management, and dispatch.',
    'Microbiologist':         'Microbiology-specific validation, culture sensitivity sign-off, and critical alerts.',
    'Biochemist':             'Biochemistry report validation, delta-check review, and critical value notification.',
    'Histopathologist':       'Histopathology/Cytology specimen pipeline: Grossing, processing, sectioning, and reporting.',
    'Laboratory Supervisor':  'Supervisory access: Phlebotomy queue, specimen worklist, rejections, and storage.',
    'Laboratory Technician':  'Bench technician: Processing worklist, IQC entry, and result entry.',
    'Phlebotomist':           'Phlebotomy queue management: Identity verification and sample collection confirmation.',
    'Ward Nurse':             'Ward-based sample collection: IPD patient queue and STAT order management.',
    'Laboratory Reception':   'Front-desk: New lab order booking, accession registration, and phlebotomy queue.'
  };

  // ---------------------------------------------------------------------------
  // SECTION 3: Main View Entry Point
  // ---------------------------------------------------------------------------
  window.views = window.views || {};

  window.views.labDashboard = function (container) {
    initLabState();

    var activeRole = localStorage.getItem('saronil_active_lab_role') || 'Laboratory Manager';

    container.innerHTML = buildTemplate(activeRole);
    attachGlobalListeners();
    applyRoleUI(activeRole);
    renderAllPanels();
  };

  // ---------------------------------------------------------------------------
  // SECTION 3A: Main HTML Template Builder
  // ---------------------------------------------------------------------------
  function buildTemplate(activeRole) {
    var roleOptions = Object.keys(ROLE_CONFIG).map(function (r) {
      return '<option value="' + r + '"' + (r === activeRole ? ' selected' : '') + '>' + r + '</option>';
    }).join('');
    var testOptions = (window.state.lisTestMaster || []).map(function (t) {
      return '<option value="' + t.code + '">' + t.name + ' (' + t.dept + ') — ₹' + t.price + '</option>';
    }).join('');
    var packageOptions = (window.state.testPackages || []).map(function (p) {
      return '<option value="' + p.id + '">' + p.name + ' — ₹' + p.price + '</option>';
    }).join('');
    var ipdPatients = (window.state.patients || []).filter(function (p) { return p.admissionStatus === 'Admitted'; });
    var ipdOptions = ipdPatients.map(function (p) {
      return '<option value="' + p.uhid + '">' + p.name + ' (' + p.uhid + ') — ' + (p.ward || '') + ' ' + (p.bed || '') + '</option>';
    }).join('') || '<option value="">No admitted patients found</option>';
    var allPatientOptions = (window.state.patients || []).map(function(p){
      return '<option value="' + p.uhid + '">' + p.name + ' (' + p.uhid + ')</option>';
    }).join('');

    return `
<style>
#lis-root *{box-sizing:border-box;}
#lis-root{font-family:Inter,'Segoe UI',system-ui,sans-serif;color:var(--text-primary,#111827);padding:0 0 32px;}
.lis-topbar{display:flex;align-items:center;justify-content:space-between;padding:14px 0 10px;border-bottom:2px solid var(--border-color,#e5e7eb);margin-bottom:14px;flex-wrap:wrap;gap:10px;}
.lis-topbar-title{font-size:1.25rem;font-weight:800;color:var(--text-primary,#111827);display:flex;align-items:center;gap:8px;}
.lis-topbar-actions{display:flex;align-items:center;gap:8px;flex-wrap:wrap;}
.lis-role-select{padding:6px 12px;border:1px solid var(--border-color,#e5e7eb);border-radius:8px;font-size:0.82rem;background:#f9fafb;cursor:pointer;}
.lis-role-select:focus{outline:none;border-color:#1d4ed8;}
.lis-role-banner{background:linear-gradient(90deg,#1e40af,#1d4ed8);color:#fff;border-radius:10px;padding:11px 18px;margin-bottom:14px;display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;}
.lis-role-name{font-size:0.9rem;font-weight:700;}
.lis-role-desc{font-size:0.78rem;opacity:.88;}
.lis-kpi-strip{display:grid;grid-template-columns:repeat(6,1fr);gap:10px;margin-bottom:14px;}
.lis-kpi{background:#fff;border:1px solid var(--border-color,#e5e7eb);border-radius:10px;padding:14px 10px;text-align:center;transition:box-shadow .2s,transform .15s;}
.lis-kpi:hover{box-shadow:0 4px 18px rgba(0,0,0,.1);transform:translateY(-1px);}
.lis-kpi-val{font-size:2.1rem;font-weight:800;line-height:1;color:#1d4ed8;}
.lis-kpi-lbl{font-size:0.68rem;color:var(--text-muted,#6b7280);margin-top:4px;font-weight:500;text-transform:uppercase;letter-spacing:.04em;}
.lis-kpi.kpi-danger .lis-kpi-val{color:#dc2626;}
.lis-kpi.kpi-warn .lis-kpi-val{color:#d97706;}
.lis-kpi.kpi-success .lis-kpi-val{color:#059669;}
.crit-strip{display:none;background:#fef2f2;border:2px solid #fca5a5;border-radius:10px;padding:11px 16px;margin-bottom:14px;align-items:center;gap:12px;flex-wrap:wrap;}
.crit-strip-icon{font-size:1.4rem;animation:lis-blink 1s infinite;}
@keyframes lis-blink{0%,100%{opacity:1}50%{opacity:.3}}
.crit-strip-text{font-weight:700;font-size:0.88rem;color:#991b1b;flex:1;}
.crit-strip-act{background:#dc2626;color:#fff;border:none;border-radius:7px;padding:6px 14px;font-size:0.8rem;font-weight:700;cursor:pointer;}
.crit-strip-act:hover{background:#b91c1c;}
.lis-nav-tabs{display:flex;gap:4px;background:#f1f5f9;border-radius:10px;padding:4px;margin-bottom:16px;overflow-x:auto;}
.lis-nav-tab{padding:8px 16px;border-radius:7px;font-size:0.82rem;font-weight:600;cursor:pointer;white-space:nowrap;color:var(--text-muted,#6b7280);transition:all .18s;border:none;background:none;display:flex;align-items:center;gap:5px;}
.lis-nav-tab.active{background:#fff;color:#1d4ed8;box-shadow:0 1px 8px rgba(0,0,0,.12);}
.lis-nav-tab:hover:not(.active){color:#111;background:rgba(255,255,255,.5);}
.lis-nav-badge{background:#dc2626;color:#fff;border-radius:10px;padding:1px 6px;font-size:0.68rem;font-weight:700;min-width:18px;text-align:center;display:inline-block;}
.lis-tab-pane{display:none;animation:fadeIn .18s ease;}
.lis-tab-pane.active{display:block;}
@keyframes fadeIn{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:none}}
.lis-panel{background:#fff;border:1px solid var(--border-color,#e5e7eb);border-radius:10px;margin-bottom:14px;overflow:hidden;}
.lis-panel-head{padding:11px 14px;background:#f8fafc;border-bottom:1px solid var(--border-color,#e5e7eb);display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap;}
.lis-panel-title{font-size:0.87rem;font-weight:700;color:var(--text-primary,#111827);display:flex;align-items:center;gap:6px;}
.lis-panel-body{padding:12px 14px;}
.lis-panel-body.np{padding:0;}
.lis-2col{display:grid;grid-template-columns:1fr 1fr;gap:14px;}
.lis-3col{display:grid;grid-template-columns:1fr 1fr 1fr;gap:14px;}
.lis-tbl{width:100%;border-collapse:collapse;font-size:0.8rem;}
.lis-tbl th{background:#1d4ed8;color:#fff;padding:7px 10px;text-align:left;font-size:0.73rem;white-space:nowrap;font-weight:600;}
.lis-tbl td{padding:7px 10px;border-bottom:1px solid #f1f5f9;vertical-align:middle;}
.lis-tbl tr:last-child td{border-bottom:none;}
.lis-tbl tr:hover td{background:#f8fafc;}
.lis-tbl-wrap{overflow-x:auto;}
.lis-tbl-scroll{max-height:380px;overflow-y:auto;}
.badge{display:inline-block;padding:2px 8px;border-radius:12px;font-size:0.7rem;font-weight:700;white-space:nowrap;}
.b-critical{background:#fee2e2;color:#991b1b;}
.b-urgent{background:#fef3c7;color:#92400e;}
.b-routine{background:#dcfce7;color:#14532d;}
.b-stat{background:#ffe4e6;color:#9f1239;}
.b-pass{background:#dcfce7;color:#14532d;}
.b-fail{background:#fee2e2;color:#991b1b;border:1px solid #fca5a5;}
.b-reactive{background:#fee2e2;color:#991b1b;}
.b-collected{background:#dcfce7;color:#14532d;}
.b-queued{background:#e0e7ff;color:#3730a3;}
.b-progress{background:#fef3c7;color:#92400e;}
.b-dispatched{background:#dbeafe;color:#1e40af;}
.b-delivered{background:#dcfce7;color:#14532d;}
.b-pending{background:#f3f4f6;color:#374151;}
.b-ipd{background:#ede9fe;color:#5b21b6;}
.b-opd{background:#dbeafe;color:#1e40af;}
.b-ext{background:#fce7f3;color:#9d174d;}
.b-mlc{background:#7c3aed;color:#fff;}
.b-verbal{background:#7c3aed;color:#fff;}
.b-hc{background:#0284c7;color:#fff;}
.b-delta{background:#fdf4ff;color:#7e22ce;}
.b-high{background:#fff7ed;color:#9a3412;}
.b-satisfactory{background:#dcfce7;color:#14532d;}
.b-needs-improvement{background:#fee2e2;color:#991b1b;}
.alert-card{border-radius:9px;padding:12px 14px;margin-bottom:10px;border-left:4px solid;display:flex;flex-direction:column;gap:7px;}
.alert-card:last-child{margin-bottom:0;}
.alert-card.ac-danger{background:#fef2f2;border-color:#dc2626;}
.alert-card.ac-warn{background:#fffbeb;border-color:#f59e0b;}
.alert-card.ac-info{background:#eff6ff;border-color:#3b82f6;}
.alert-card.ac-purple{background:#fdf4ff;border-color:#a855f7;}
.alert-card-row{display:flex;justify-content:space-between;align-items:flex-start;gap:8px;flex-wrap:wrap;}
.alert-card-main{flex:1;}
.alert-card-title{font-weight:700;font-size:0.87rem;}
.alert-card-sub{font-size:0.77rem;color:var(--text-muted,#6b7280);margin-top:2px;}
.alert-card-value{font-size:1.55rem;font-weight:800;font-family:monospace;white-space:nowrap;}
.alert-card-actions{display:flex;gap:6px;flex-wrap:wrap;align-items:center;}
.lis-sub-tabs{display:flex;gap:0;border-bottom:2px solid var(--border-color,#e5e7eb);margin-bottom:12px;}
.lis-sub-tab{padding:7px 16px;cursor:pointer;font-size:0.82rem;font-weight:600;color:var(--text-muted,#6b7280);border-bottom:3px solid transparent;margin-bottom:-2px;transition:all .15s;border:none;background:none;}
.lis-sub-tab.active{color:#1d4ed8;border-bottom-color:#1d4ed8;}
.lis-sub-tab:hover:not(.active){color:#111;}
.dept-pills{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:10px;}
.dept-pill{padding:4px 12px;border-radius:20px;font-size:0.78rem;font-weight:600;cursor:pointer;border:1px solid var(--border-color,#e5e7eb);background:#fff;transition:all .15s;}
.dept-pill.active{background:#1d4ed8;color:#fff;border-color:#1d4ed8;}
.dept-pill:hover:not(.active){background:#f3f4f6;}
.filter-chips{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:12px;}
.filter-chip{padding:4px 12px;border-radius:16px;font-size:0.77rem;font-weight:600;cursor:pointer;border:1px solid var(--border-color,#e5e7eb);background:#fff;transition:all .15s;}
.filter-chip.active{background:#1d4ed8;color:#fff;border-color:#1d4ed8;}
.histo-pipe{display:flex;border-radius:6px;overflow:hidden;margin:8px 0;}
.histo-step{flex:1;padding:5px 3px;text-align:center;font-size:0.65rem;font-weight:700;border-right:2px solid #fff;}
.histo-step:last-child{border-right:none;}
.histo-step.hs-done{background:#dcfce7;color:#14532d;}
.histo-step.hs-current{background:#1d4ed8;color:#fff;}
.histo-step.hs-pending{background:#f1f5f9;color:#94a3b8;}
.tat-wrap{background:#e5e7eb;border-radius:4px;height:5px;margin-top:4px;overflow:hidden;}
.tat-fill{height:5px;border-radius:4px;transition:width .4s;}
.tat-ok{background:#22c55e;}.tat-warn{background:#f59e0b;}.tat-breach{background:#dc2626;}
.modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,.55);z-index:1200;display:none;overflow-y:auto;}
.modal-box{background:#fff;border-radius:12px;max-width:720px;margin:40px auto;padding:28px;position:relative;box-shadow:0 20px 60px rgba(0,0,0,.28);}
.modal-box.wide{max-width:900px;}
.modal-box.narrow{max-width:510px;}
.modal-title{font-size:1.05rem;font-weight:700;margin-bottom:18px;color:var(--text-primary,#111827);border-bottom:2px solid #1d4ed8;padding-bottom:10px;display:flex;justify-content:space-between;align-items:center;}
.modal-close-btn{background:none;border:none;font-size:1.3rem;cursor:pointer;color:var(--text-muted,#6b7280);line-height:1;}
.nabl-gate{background:#fffbeb;border:1px solid #f59e0b;border-radius:7px;padding:10px 12px;font-size:0.8rem;color:#92400e;margin:8px 0;}
.nabl-gate-title{font-weight:700;margin-bottom:2px;}
.iqc-hold-warn{background:#fee2e2;border:1px solid #dc2626;border-radius:7px;padding:10px 12px;font-size:0.8rem;color:#991b1b;margin:8px 0;}
.chk-row{display:flex;align-items:flex-start;gap:8px;padding:8px 0;border-bottom:1px solid #f3f4f6;font-size:0.84rem;line-height:1.4;}
.chk-row:last-child{border-bottom:none;}
.chk-row input[type=checkbox]{width:16px;height:16px;cursor:pointer;accent-color:#1d4ed8;margin-top:1px;flex-shrink:0;}
.fg{display:flex;flex-direction:column;gap:4px;margin-bottom:10px;}
.fg label{font-size:0.8rem;font-weight:600;color:var(--text-muted,#6b7280);}
.fg input,.fg select,.fg textarea{border:1px solid var(--border-color,#e5e7eb);border-radius:6px;padding:7px 10px;font-size:0.88rem;background:#fff;width:100%;}
.fg input:focus,.fg select:focus,.fg textarea:focus{outline:none;border-color:#1d4ed8;box-shadow:0 0 0 2px rgba(29,78,216,.12);}
.form-2{display:grid;grid-template-columns:1fr 1fr;gap:12px;}
.form-3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;}
.pt-tabs{display:flex;border-radius:8px;overflow:hidden;border:1px solid var(--border-color,#e5e7eb);margin-bottom:14px;}
.pt-tab{flex:1;padding:9px;text-align:center;border:none;background:#f9fafb;cursor:pointer;font-size:0.85rem;font-weight:600;transition:all .15s;border-right:1px solid var(--border-color,#e5e7eb);}
.pt-tab:last-child{border-right:none;}
.pt-tab.active{background:#1d4ed8;color:#fff;}
.verbal-section{background:#fdf4ff;border:1px solid #e9d5ff;border-radius:8px;padding:12px;margin:10px 0;}
.mlc-badge{background:#7c3aed;color:#fff;padding:2px 8px;border-radius:10px;font-size:0.7rem;font-weight:700;}
.sec-lbl{font-size:0.72rem;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:var(--text-muted,#6b7280);margin:14px 0 6px;padding-bottom:4px;border-bottom:1px solid var(--border-color,#e5e7eb);}
.result-grid-2{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:10px;}
.result-field label{font-size:0.75rem;font-weight:600;color:var(--text-muted);display:block;margin-bottom:3px;}
.result-field input{border:1px solid var(--border-color,#e5e7eb);border-radius:5px;padding:5px 8px;font-size:0.88rem;font-family:monospace;width:100%;}
.tube-dot{display:inline-block;width:10px;height:10px;border-radius:50%;margin-right:4px;vertical-align:middle;}
.tube-lavender{background:#a78bfa;}.tube-yellow{background:#fbbf24;}.tube-yellow-cap{background:#f59e0b;}.tube-formalin{background:#7c3aed;}.tube-slides{background:#60a5fa;}.tube-culture-bottle{background:#34d399;}
.empty-msg{text-align:center;padding:28px 16px;color:var(--text-muted,#6b7280);font-size:0.85rem;}
.lis-modal-footer{display:flex;justify-content:flex-end;gap:8px;border-top:1px solid #e5e7eb;padding-top:14px;margin-top:14px;}
@media(max-width:1100px){.lis-kpi-strip{grid-template-columns:repeat(3,1fr);}.lis-2col{grid-template-columns:1fr;}.lis-3col{grid-template-columns:1fr 1fr;}}
@media(max-width:768px){.lis-kpi-strip{grid-template-columns:repeat(2,1fr);}.form-2,.form-3{grid-template-columns:1fr;}.lis-3col{grid-template-columns:1fr;}.lis-nav-tab{padding:8px 10px;font-size:0.78rem;}}
</style>

<!-- ===================== MODALS ===================== -->

<!-- M1: New Lab Order -->
<div class="modal-overlay" id="new-lab-order-modal" onclick="if(event.target===this)window.closeNewOrderModal()">
<div class="modal-box wide">
<div class="modal-title">📋 New Laboratory Order<button class="modal-close-btn" onclick="window.closeNewOrderModal()">✕</button></div>
<input type="hidden" id="ord-patient-type" value="OPD">
<div class="sec-lbl">Patient Type</div>
<div class="pt-tabs">
  <button class="pt-tab active" id="ptab-opd" onclick="window.switchOrdPatientType('OPD')">🏥 OPD</button>
  <button class="pt-tab" id="ptab-ipd" onclick="window.switchOrdPatientType('IPD')">🛏️ IPD</button>
  <button class="pt-tab" id="ptab-external" onclick="window.switchOrdPatientType('External')">🌐 External / Referred</button>
</div>

<div id="ord-opd-section">
  <input type="hidden" id="opd-booking-source" value="digital">
  <div class="pt-tabs" id="opd-booking-src-tabs" style="margin-bottom:12px;">
    <button class="pt-tab active" id="opd-src-btn-digital" onclick="window.switchOpdBookingSource('digital')">💻 Digital Order</button>
    <button class="pt-tab" id="opd-src-btn-carry" onclick="window.switchOpdBookingSource('carry')">📄 Prescription Carry-in</button>
  </div>

  <div id="opd-digital-section">
    <div class="form-2">
      <div class="fg"><label>Registered OPD Patient</label><select id="ord-opd-patient"><option value="">— Select patient —</option>${allPatientOptions}</select></div>
      <div class="fg"><label>Ordering Physician</label><input type="text" id="ord-opd-doctor" placeholder="Dr. Name / Designation"></div>
    </div>
  </div>

  <div id="opd-carry-section" style="display:none;">
    <div class="nabl-gate"><div class="nabl-gate-title">📄 Prescription Carry-in Path</div>Patient brings written/printed prescription. Select tests from catalog below. Prep instructions sent at booking.</div>
    <div class="form-2">
      <div class="fg"><label>Patient Name / UHID *</label><input type="text" id="opd-carry-search" placeholder="Type name or UHID to search…"></div>
      <div class="fg"><label>Prescription Reference</label><input type="text" id="opd-carry-rx" placeholder="Rx No. or prescribing doctor"></div>
    </div>
  </div>

  <div class="fg"><label>Clinical Indication *</label><input type="text" id="ord-opd-indication" placeholder="e.g. Fever with chills, 4 days"></div>
  <label class="chk-row"><input type="checkbox" id="chk-verbal-order" onchange="window.onVerbalOrderToggle()"><span>Verbal / Telephone order — must be co-signed by physician within 24h</span></label>
  <div id="verbal-order-section" class="verbal-section" style="display:none;">
    <div class="form-2">
      <div class="fg"><label>Requesting Nurse *</label><input type="text" id="ord-nurse-name" placeholder="Nurse full name"></div>
      <div class="fg"><label>Physician for Co-Sign</label><input type="text" id="ord-verbal-physician" placeholder="Dr. Name"></div>
    </div>
    <label class="chk-row"><input type="checkbox" id="chk-verbal-readback"><strong>Read-back confirmed</strong> — physician repeated the order back.</label>
  </div>
</div>

<div id="ord-ipd-section" style="display:none;">
  <div class="form-2">
    <div class="fg"><label>IPD Patient (Admitted)</label><select id="ord-ipd-patient"><option value="">— Select admitted patient —</option>${ipdOptions}</select></div>
    <div class="fg"><label>Ordering Physician</label><input type="text" id="ord-ipd-doctor" placeholder="Dr. Name / MCI Reg No."></div>
  </div>
  <div class="fg"><label>Clinical Indication *</label><input type="text" id="ord-ipd-indication" placeholder="e.g. Post-op day 1, monitor renal function"></div>
  <label class="chk-row"><input type="checkbox" id="chk-ipd-verbal" onchange="window.onVerbalOrderToggle()"><span>Verbal / Telephone order — co-sign within 24h required</span></label>
  <div id="verbal-order-section-ipd" class="verbal-section" style="display:none;">
    <div class="form-2">
      <div class="fg"><label>Requesting Nurse *</label><input type="text" id="ord-ipd-nurse" placeholder="Ward nurse name"></div>
      <div class="fg"><label>Physician for Co-Sign</label><input type="text" id="ord-ipd-cosign-doc" placeholder="Dr. Name"></div>
    </div>
    <label class="chk-row"><input type="checkbox" id="chk-ipd-readback"><strong>Read-back confirmed</strong></label>
  </div>
</div>

<div id="ord-external-section" style="display:none;">
  <div class="form-3">
    <div class="fg"><label>Patient Name *</label><input type="text" id="ord-ext-name" placeholder="Full name"></div>
    <div class="fg"><label>Mobile *</label><input type="tel" id="ord-ext-mobile" placeholder="10-digit number"></div>
    <div class="fg"><label>Critical Value Callback</label><input type="text" id="ord-ext-callback" placeholder="Name &amp; mobile for critical alerts"></div>
  </div>
  <div class="form-2">
    <div class="fg"><label>Referring Doctor / Clinic</label><input type="text" id="ord-ext-refdr" placeholder="Dr. Name or Clinic name (optional)"></div>
    <div class="fg"><label>Booking Channel</label>
      <select id="booking-channel-select" onchange="window.onBookingChannelChange()">
        <option value="Walk-in">Walk-in (immediate token)</option>
        <option value="Home Collection">Home Collection</option>
      </select>
    </div>
  </div>
  <div id="home-collection-section" style="display:none;">
    <div class="nabl-gate"><div class="nabl-gate-title">🏠 Home Collection — DPDP Act 2023 Notice</div>Address data is restricted to the dispatched phlebotomist's active session only.</div>
    <div class="form-2">
      <div class="fg"><label>Date &amp; Collection Slot</label><input type="text" id="ord-hc-slot" placeholder="e.g. 14-Jul-2026, 7–9 AM slot"></div>
      <div class="fg"><label>Full Address</label><input type="text" id="ord-hc-address" placeholder="Flat / House, Street, City, PIN"></div>
    </div>
  </div>
</div>

<div class="sec-lbl">Test Selection</div>
<div class="form-2">
  <div class="fg"><label>Catalog Type</label>
    <select id="ord-catalog-type" onchange="window.onCatalogTypeChange()">
      <option value="Individual">Individual Test</option>
      <option value="Package">Wellness Package</option>
      <option value="Addon">Add-on to Existing Booking</option>
    </select>
  </div>
  <div class="fg"><label>Priority</label>
    <select id="ord-priority"><option value="Routine">Routine</option><option value="Urgent">Urgent</option><option value="STAT">STAT</option></select>
  </div>
</div>
<div id="ord-individual-section" class="fg"><label>Select Test *</label>
  <select id="ord-test-individual" onchange="window.onTestOrPackageSelect()">${testOptions}</select>
</div>
<div id="ord-package-section" class="fg" style="display:none;"><label>Select Package *</label>
  <select id="ord-package-select" onchange="window.onTestOrPackageSelect()">${packageOptions}</select>
</div>
<div id="ord-addon-section" style="display:none;">
  <div class="form-2">
    <div class="fg"><label>Existing Booking ID</label><input type="text" id="ord-addon-booking-id" placeholder="BKG-XXXXX"></div>
    <div class="fg"><label>Add-on Test</label><select id="ord-addon-test" onchange="window.onTestOrPackageSelect()">${testOptions}</select></div>
  </div>
</div>
<div id="ord-pkg-expansion" style="display:none;background:#f0f9ff;border:1px solid #bae6fd;border-radius:6px;padding:10px;margin:8px 0;font-size:0.82rem;"></div>
<div id="ord-prep-notice" style="display:none;" class="nabl-gate"></div>
<div id="ord-cost-estimate" style="font-size:0.88rem;color:#059669;font-weight:700;margin:4px 0 8px;"></div>
<label class="chk-row"><input type="checkbox" id="chk-mlc-order"><span class="mlc-badge">MLC</span>&nbsp;Medico-Legal Case — FIR / Police reference required</label>
<div id="mlc-details-section" class="fg" style="display:none;margin-top:6px;"><label>MLC / FIR Reference Details</label><input type="text" id="ord-mlc-ref" placeholder="e.g. FIR No. 2026/MH/447, RTA - MVA"></div>
<div class="sec-lbl">Billing</div>
<div class="form-2">
  <div class="fg"><label>Payer Category</label>
    <select id="ord-payer"><option value="Self Pay">Self Pay / Cash</option><option value="CGHS">CGHS</option><option value="PM-JAY">PM-JAY</option><option value="TPA">TPA / Insurance</option><option value="Corporate">Corporate</option></select>
  </div>
  <div class="fg"><label>Billing / Payment Status *</label>
    <select id="ord-billing-status"><option value="Cleared">Cleared / Paid</option><option value="TPA Approved">TPA Pre-auth Approved</option><option value="Pending">Pending (blocks collection)</option></select>
  </div>
</div>
<div class="lis-modal-footer">
  <button class="btn btn-secondary" onclick="window.closeNewOrderModal()">Cancel</button>
  <button class="btn btn-primary" onclick="window.submitLabOrder()">✅ Create Lab Order &amp; Accession</button>
</div>
</div></div>

<!-- M2: Phlebotomy Verification -->
<div class="modal-overlay" id="phleb-verify-modal" onclick="if(event.target===this)window.closePhlebVerifyModal()">
<div class="modal-box narrow">
<div class="modal-title">🛡️ Identity Verification &amp; Sample Collection<button class="modal-close-btn" onclick="window.closePhlebVerifyModal()">✕</button></div>
<div id="phleb-patient-card" style="background:#f8fafc;border-radius:8px;padding:10px;margin-bottom:12px;font-size:0.82rem;line-height:1.7;"></div>
<div class="nabl-gate"><div class="nabl-gate-title">⚠️ NABL Gate — Two-Identifier Verification (mandatory)</div></div>
<div class="chk-row"><input type="checkbox" id="chk-id-confirmed"><span>❶ Patient identity confirmed — name, UHID, DOB verified verbally</span></div>
<div class="chk-row"><input type="checkbox" id="chk-test-list"><span>❷ Test list and tube(s) verified against request form</span></div>
<div class="chk-row"><input type="checkbox" id="chk-prep-compliance"><span>❸ Patient preparation compliance confirmed</span></div>
<div class="sec-lbl">Collector Details</div>
<div class="form-2">
  <div class="fg"><label>Collector Role *</label>
    <select id="phleb-collector-role" onchange="window.onCollectorRoleChange()"><option value="Phlebotomist">Phlebotomist</option><option value="Ward Nurse">Ward Nurse (IPD)</option></select>
  </div>
  <div class="fg" style="position:relative;">
    <label>Collector Name *</label>
    <input type="text" id="phleb-collector-name" placeholder="Type to search staff…" autocomplete="off"
      oninput="window.staffSuggest(this.value)" onfocus="window.staffSuggest(this.value)"
      style="padding-right:32px;">
    <span id="phleb-collector-clear" onclick="window.clearCollectorName()"
      style="position:absolute;right:10px;top:33px;cursor:pointer;color:#9ca3af;font-size:1rem;display:none;">✕</span>
    <div id="phleb-collector-dropdown" style="display:none;position:absolute;z-index:400;top:calc(100%);left:0;right:0;background:#fff;border:1px solid #e5e7eb;border-radius:8px;box-shadow:0 8px 24px rgba(0,0,0,.14);max-height:220px;overflow-y:auto;margin-top:2px;"></div>
  </div>
</div>
<div id="phleb-ipd-location" style="display:none;">
  <div class="form-2">
    <div class="fg"><label>Ward *</label><input type="text" id="phleb-ipd-ward" placeholder="e.g. Ward 2A"></div>
    <div class="fg"><label>Bed Number *</label><input type="text" id="phleb-ipd-bed" placeholder="e.g. Bed 05"></div>
  </div>
</div>
<div id="phleb-opd-location">
  <div class="fg"><label>Collection Counter</label>
    <select id="phleb-opd-counter"><option>Phlebotomy Counter 1</option><option>Phlebotomy Counter 2</option><option>Emergency Phlebotomy</option></select>
  </div>
</div>
<div id="phleb-hc-location" style="display:none;">
  <div class="form-2">
    <div class="fg"><label>Collection Address</label><input type="text" id="phleb-hc-address" placeholder="Address from booking"></div>
    <div class="fg"><label>Actual Collection Time</label><input type="text" id="phleb-hc-time" placeholder="e.g. 07:45 AM"></div>
  </div>
</div>
<div class="lis-modal-footer">
  <button class="btn btn-secondary" onclick="window.closePhlebVerifyModal()">Cancel</button>
  <button class="btn btn-primary" onclick="window.confirmPhlebCollection()">✅ Confirm Collection</button>
</div>
</div></div>

<!-- M3: Accession / Receive -->
<div class="modal-overlay" id="sample-receive-modal" onclick="if(event.target===this)window.closeReceiveModal()">
<div class="modal-box narrow">
<div class="modal-title">🔬 Sample Accession — Quality Gate<button class="modal-close-btn" onclick="window.closeReceiveModal()">✕</button></div>
<div id="recv-patient-card" style="background:#f8fafc;border-radius:8px;padding:10px;margin-bottom:12px;font-size:0.82rem;line-height:1.7;"></div>
<div class="nabl-gate"><div class="nabl-gate-title">NABL Accession Checklist — uncheck any item to switch to rejection mode</div></div>
<div class="chk-row"><input type="checkbox" id="recv-chk1" onchange="window.updateAccessionChecklistMode()" checked><span>Correct container / tube type for requested test(s)</span></div>
<div class="chk-row"><input type="checkbox" id="recv-chk2" onchange="window.updateAccessionChecklistMode()" checked><span>Label matches request form (patient name, UHID, date)</span></div>
<div class="chk-row"><input type="checkbox" id="recv-chk3" onchange="window.updateAccessionChecklistMode()" checked><span>Adequate volume for all requested tests</span></div>
<div class="chk-row"><input type="checkbox" id="recv-chk4" onchange="window.updateAccessionChecklistMode()" checked><span>No visible haemolysis, lipaemia, or icterus</span></div>
<div class="chk-row"><input type="checkbox" id="recv-chk5" onchange="window.updateAccessionChecklistMode()" checked><span>Sample received within acceptable transport TAT</span></div>
<div id="recv-rejection-section" style="display:none;margin-top:10px;">
  <div style="background:#fee2e2;border:1px solid #fca5a5;border-radius:6px;padding:9px;margin-bottom:8px;font-size:0.82rem;color:#991b1b;font-weight:600;">⛔ Rejection Mode — recollection notification will be auto-sent.</div>
  <div class="fg"><label>Rejection Reason *</label>
    <select id="recv-rejection-reason">
      <option value="Haemolysed sample">Haemolysed sample</option>
      <option value="Improper container">Improper container / wrong tube</option>
      <option value="Insufficient volume">Insufficient volume (QNS)</option>
      <option value="Clotted sample">Clotted sample</option>
      <option value="Unlabelled / mislabelled">Unlabelled / mislabelled</option>
      <option value="Transport delay exceeded">Transport delay exceeded stability</option>
      <option value="Lipaemic sample">Lipaemic sample</option>
    </select>
  </div>
  <div class="fg"><label>Comments</label><textarea id="recv-rejection-comments" rows="2" placeholder="Details for quality register..."></textarea></div>
</div>
<div class="lis-modal-footer" style="justify-content:space-between;">
  <button class="btn btn-secondary" style="border-color:#dc2626;color:#dc2626;" onclick="window.toggleReceiveRejection()">⛔ Reject Sample</button>
  <div style="display:flex;gap:8px;">
    <button class="btn btn-secondary" onclick="window.closeReceiveModal()">Cancel</button>
    <button class="btn btn-primary" id="btn-recv-confirm" onclick="window.confirmReceiveSample()">✅ Accept &amp; Accession</button>
  </div>
</div>
</div></div>

<!-- M4: Result Entry -->
<div class="modal-overlay" id="result-entry-modal" onclick="if(event.target===this)window.closeResultModal()">
<div class="modal-box">
<div class="modal-title">✍️ Result Entry<button class="modal-close-btn" onclick="window.closeResultModal()">✕</button></div>
<div id="result-patient-card" style="background:#f8fafc;border-radius:8px;padding:10px;margin-bottom:12px;font-size:0.82rem;line-height:1.7;"></div>
<div id="iqc-hold-warning-area" class="iqc-hold-warn" style="display:none;">⛔ <strong>IQC HOLD:</strong> This analyzer failed today's IQC. Patient results cannot be released until corrective action is logged and QC re-run passes. <button onclick="window.logQcCorrectiveAction()" style="margin-left:8px;background:#dc2626;color:#fff;border:none;border-radius:4px;padding:3px 8px;cursor:pointer;font-size:0.78rem;">Log Corrective Action</button></div>
<div class="sec-lbl">Result Values</div>
<div id="result-fields-area" class="result-grid-2"></div>
<div class="fg"><label>Instrument / Analyzer *</label>
  <select id="result-instrument">
    <option>Haematology Analyser - Sysmex XN-550</option>
    <option>Chemistry Analyser - Erba Chem 7</option>
    <option>ELISA Reader - BioTek ELx800</option>
    <option>Urine Analyser - Mindray UC-3500</option>
    <option>Manual Microscopy</option>
  </select>
</div>
<div class="fg"><label>Microscopic / Technical Observations</label><textarea id="result-observations" rows="2" placeholder="e.g. RBCs normocytic normochromic, mild anisocytosis..."></textarea></div>
<div id="delta-check-area" style="background:#fdf4ff;border:1px solid #d8b4fe;border-radius:6px;padding:8px;font-size:0.8rem;color:#7e22ce;margin:6px 0;display:none;"></div>
<div class="lis-modal-footer">
  <button class="btn btn-secondary" onclick="window.closeResultModal()">Cancel</button>
  <button class="btn btn-primary" onclick="window.saveResultEntry()">📤 Submit for Validation</button>
</div>
</div></div>

<!-- M5: Pathologist Sign-Off -->
<div class="modal-overlay" id="pathologist-signoff-modal" onclick="if(event.target===this)window.closeSignoffModal()">
<div class="modal-box narrow">
<div class="modal-title">✍️ Digital Sign-Off &amp; Report Release<button class="modal-close-btn" onclick="window.closeSignoffModal()">✕</button></div>
<div id="signoff-report-card" style="background:#f8fafc;border-radius:8px;padding:10px;margin-bottom:12px;font-size:0.82rem;line-height:1.7;"></div>
<div id="signoff-role-block" class="iqc-hold-warn" style="display:none;"></div>
<div class="chk-row"><input type="checkbox" id="chk-signoff-review"><span>I have reviewed all results, flags, and delta checks. Report is clinically validated.</span></div>
<div class="fg" style="margin-top:10px;"><label>Sign-Off Method</label>
  <select id="signoff-method"><option value="In-Person">In-Person (secure digital signature)</option><option value="Remote 2FA">Remote — 2FA verified</option></select>
</div>
<div id="signoff-delivery-mode" style="background:#f0fdf4;border:1px solid #86efac;border-radius:6px;padding:9px;font-size:0.82rem;color:#14532d;margin:8px 0;"></div>
<div class="lis-modal-footer" style="justify-content:space-between;">
  <button class="btn btn-secondary" onclick="window.repeatTestFromSignoff()">🔁 Request Rerun</button>
  <div style="display:flex;gap:8px;">
    <button class="btn btn-secondary" onclick="window.closeSignoffModal()">Cancel</button>
    <button class="btn btn-primary" style="background:#059669;border-color:#059669;" onclick="window.confirmSignoff()">✅ Sign &amp; Release</button>
  </div>
</div>
</div></div>

<!-- M6: Critical Ack -->
<div class="modal-overlay" id="crit-ack-modal" onclick="if(event.target===this)window.closeCritAckModal()">
<div class="modal-box narrow">
<div class="modal-title">📞 Critical Value — Verbal Callback Log<button class="modal-close-btn" onclick="window.closeCritAckModal()">✕</button></div>
<div id="crit-ack-patient-card" style="background:#fef2f2;border:1px solid #fca5a5;border-radius:8px;padding:10px;margin-bottom:12px;font-size:0.82rem;line-height:1.7;"></div>
<div class="nabl-gate"><div class="nabl-gate-title">NABL Mandatory: Verbal callback must be documented before this critical alert can be closed.</div></div>
<div class="form-2">
  <div class="fg"><label>Called To *</label><input type="text" id="crit-ack-called-to" placeholder="Dr. Name / Nurse / Ward In-charge"></div>
  <div class="fg"><label>Communication Mode *</label>
    <select id="crit-ack-mode"><option>Phone Call</option><option>Intercom</option><option>In-Person (bedside)</option><option>Pager</option></select>
  </div>
</div>
<div class="fg"><label>Clinician Response / Action Taken</label><textarea id="crit-ack-notes" rows="2" placeholder="e.g. Dr. Mehta acknowledged. Repeat CBC ordered, patient reviewed."></textarea></div>
<div class="chk-row" style="background:#fef2f2;border-radius:6px;padding:10px;border:1px solid #fca5a5;margin-top:6px;">
  <input type="checkbox" id="chk-readback-confirmed">
  <span><strong>Read-back confirmed</strong> — clinician repeated the critical value back to me verbatim (NABL mandatory gate).</span>
</div>
<div class="lis-modal-footer">
  <button class="btn btn-secondary" onclick="window.closeCritAckModal()">Cancel</button>
  <button class="btn btn-primary" style="background:#dc2626;border-color:#dc2626;" onclick="window.saveCritAck()">📞 Save Callback Log</button>
</div>
</div></div>

<!-- M7: Sample Rejection -->
<div class="modal-overlay" id="sample-rejection-modal" onclick="if(event.target===this)window.closeSampleRejectionModal()">
<div class="modal-box narrow">
<div class="modal-title">⛔ Specimen Rejection<button class="modal-close-btn" onclick="window.closeSampleRejectionModal()">✕</button></div>
<div id="rejection-patient-card" style="background:#f8fafc;border-radius:8px;padding:10px;margin-bottom:12px;font-size:0.82rem;"></div>
<div style="background:#fee2e2;border:1px solid #fca5a5;border-radius:6px;padding:9px;margin-bottom:12px;font-size:0.82rem;color:#991b1b;">Rejection will be logged in the Quality Register and a recollection notification sent to the requesting unit.</div>
<div class="fg"><label>Rejection Reason *</label>
  <select id="reject-reason">
    <option value="Haemolysed sample">Haemolysed sample</option>
    <option value="Improper container">Improper container / wrong tube</option>
    <option value="Insufficient volume">Insufficient volume (QNS)</option>
    <option value="Clotted sample">Clotted sample</option>
    <option value="Unlabelled / mislabelled">Unlabelled / mislabelled</option>
    <option value="Lipaemic sample">Lipaemic sample</option>
  </select>
</div>
<div class="fg"><label>Comments</label><textarea id="reject-comments" rows="2" placeholder="Additional context for quality register..."></textarea></div>
<div class="lis-modal-footer">
  <button class="btn btn-secondary" onclick="window.closeSampleRejectionModal()">Cancel</button>
  <button class="btn btn-primary" style="background:#dc2626;border-color:#dc2626;" onclick="window.confirmSampleRejection()">⛔ Confirm Rejection</button>
</div>
</div></div>

<!-- M8: Blood Bank -->
<div class="modal-overlay" id="blood-bank-modal" onclick="if(event.target===this)window.closeBloodBankModal()">
<div class="modal-box wide">
<div class="modal-title">🩸 Blood Bank Registry<button class="modal-close-btn" onclick="window.closeBloodBankModal()">✕</button></div>
<div class="lis-2col">
  <div><div class="sec-lbl">Component Stock</div><div id="blood-stock-body"></div></div>
  <div><div class="sec-lbl">Cross-Match Queue</div><div id="blood-crossmatch-body"></div></div>
</div>
</div></div>

<!-- M9: Upload Referral -->
<div class="modal-overlay" id="upload-referral-modal" onclick="if(event.target===this)window.closeUploadReferralModal()">
<div class="modal-box narrow">
<div class="modal-title">📎 Upload Outsource Result<button class="modal-close-btn" onclick="window.closeUploadReferralModal()">✕</button></div>
<div id="upload-referral-info" style="background:#f8fafc;border-radius:8px;padding:10px;margin-bottom:12px;font-size:0.82rem;"></div>
<div class="fg"><label>Result Document (PDF / Image)</label><input type="file" id="upload-referral-file" accept=".pdf,.jpg,.png"></div>
<div class="fg"><label>Reference Lab Report No.</label><input type="text" id="upload-referral-ref-no" placeholder="External lab report ID"></div>
<div class="fg"><label>Notes</label><textarea id="upload-referral-notes" rows="2" placeholder="Important notes from the reference lab..."></textarea></div>
<div class="lis-modal-footer">
  <button class="btn btn-secondary" onclick="window.closeUploadReferralModal()">Cancel</button>
  <button class="btn btn-primary" onclick="window.confirmUploadResult()">📎 Attach &amp; Close</button>
</div>
</div></div>

<!-- M10: Verbal Co-Sign -->
<div class="modal-overlay" id="verbal-cosign-modal" onclick="if(event.target===this)window.closeVerbalCosignModal()">
<div class="modal-box narrow">
<div class="modal-title">✍️ Verbal Order — Physician Co-Sign<button class="modal-close-btn" onclick="window.closeVerbalCosignModal()">✕</button></div>
<div id="cosign-order-card" style="background:#fdf4ff;border:1px solid #e9d5ff;border-radius:8px;padding:10px;margin-bottom:12px;font-size:0.82rem;line-height:1.7;"></div>
<div class="nabl-gate"><div class="nabl-gate-title">NABL: Verbal orders must be co-signed within 24 hours by the ordering physician.</div></div>
<div class="form-2">
  <div class="fg"><label>Physician Name *</label><input type="text" id="cosign-physician-name" placeholder="Dr. Full Name"></div>
  <div class="fg"><label>Registration No.</label><input type="text" id="cosign-physician-reg" placeholder="MCI / State reg. no."></div>
</div>
<label class="chk-row"><input type="checkbox" id="chk-cosign-confirm"><span>I confirm the above statement is accurate and I accept clinical responsibility for this order.</span></label>
<div class="lis-modal-footer">
  <button class="btn btn-secondary" onclick="window.closeVerbalCosignModal()">Cancel</button>
  <button class="btn btn-primary" onclick="window.confirmVerbalCosign()">✅ Co-sign Order</button>
</div>
</div></div>

<!-- ===================== MAIN DASHBOARD ===================== -->
<div id="lis-root">

<!-- Top Bar -->
<div class="lis-topbar">
  <div class="lis-topbar-title">🔬 Laboratory &amp; LIS Command Center</div>
  <div class="lis-topbar-actions">
    <select class="lis-role-select" id="lab-role-switcher" onchange="window.switchLabRole(this.value)">${roleOptions}</select>
    <button id="btn-new-lab-order" class="btn btn-primary" onclick="window.openNewOrderModal()" style="display:none;">📋 New Lab Order</button>
    <button class="btn btn-secondary btn-sm" onclick="window.openBloodBankModal()">🩸 Blood Bank</button>
    <button class="btn btn-secondary btn-sm" onclick="window.renderAllPanels()">🔄 Refresh</button>
  </div>
</div>

<!-- Role Banner -->
<div class="lis-role-banner">
  <div>
    <div class="lis-role-name" id="role-banner-title-text"></div>
    <div class="lis-role-desc" id="role-banner-desc-text"></div>
  </div>
</div>

<!-- Critical Alert Strip -->
<div class="crit-strip" id="critical-alert-banner">
  <span class="crit-strip-icon">🚨</span>
  <span class="crit-strip-text" id="critical-alert-banner-text"></span>
  <button class="crit-strip-act" onclick="window.switchMainTab('alerts')">View Alerts →</button>
</div>

<!-- KPI Strip -->
<div class="admin-kpi-scroll-row">
  <!-- Queued -->
  <div class="admin-kpi-card status-normal" style="cursor: default;">
    <div style="display: flex; justify-content: space-between; align-items: flex-start; width: 100%;">
      <span style="font-size: 0.72rem; font-weight: 700; text-transform: uppercase; color: var(--text-secondary);">Queued</span>
    </div>
    <div style="margin-top: 8px; margin-bottom: 8px;">
      <span class="admin-mono" id="kpi-val-queued" style="font-size: 1.45rem; font-weight: 700; color: var(--text-primary); letter-spacing: -0.02em;">—</span>
      <div style="font-size: 0.72rem; color: var(--text-muted); margin-top: 2px;">In Phlebotomy Queue</div>
    </div>
    <div style="display: flex; align-items: center; justify-content: space-between; margin-top: 4px; font-size: 0.72rem; border-top: 1px dashed var(--border-color); padding-top: 6px;">
      <span style="color: var(--color-success); font-weight: 600; display: flex; align-items: center; gap: 2px;">
        ▲ Live Queue
      </span>
    </div>
  </div>

  <!-- Processing -->
  <div class="admin-kpi-card status-warning" style="cursor: default;">
    <div style="display: flex; justify-content: space-between; align-items: flex-start; width: 100%;">
      <span style="font-size: 0.72rem; font-weight: 700; text-transform: uppercase; color: var(--text-secondary);">Processing</span>
    </div>
    <div style="margin-top: 8px; margin-bottom: 8px;">
      <span class="admin-mono" id="kpi-val-processing" style="font-size: 1.45rem; font-weight: 700; color: var(--text-primary); letter-spacing: -0.02em;">—</span>
      <div style="font-size: 0.72rem; color: var(--text-muted); margin-top: 2px;">In Laboratory Instruments</div>
    </div>
    <div style="display: flex; align-items: center; justify-content: space-between; margin-top: 4px; font-size: 0.72rem; border-top: 1px dashed var(--border-color); padding-top: 6px;">
      <span style="color: var(--color-warning); font-weight: 600; display: flex; align-items: center; gap: 2px;">
        ▲ Active Run
      </span>
    </div>
  </div>

  <!-- Pending Validation -->
  <div class="admin-kpi-card status-normal" style="cursor: default;">
    <div style="display: flex; justify-content: space-between; align-items: flex-start; width: 100%;">
      <span style="font-size: 0.72rem; font-weight: 700; text-transform: uppercase; color: var(--text-secondary);">Pending Validation</span>
    </div>
    <div style="margin-top: 8px; margin-bottom: 8px;">
      <span class="admin-mono" id="kpi-val-validation" style="font-size: 1.45rem; font-weight: 700; color: var(--text-primary); letter-spacing: -0.02em;">—</span>
      <div style="font-size: 0.72rem; color: var(--text-muted); margin-top: 2px;">Awaiting Pathologist sign-off</div>
    </div>
    <div style="display: flex; align-items: center; justify-content: space-between; margin-top: 4px; font-size: 0.72rem; border-top: 1px dashed var(--border-color); padding-top: 6px;">
      <span style="color: var(--color-success); font-weight: 600; display: flex; align-items: center; gap: 2px;">
        ▲ Verification Due
      </span>
    </div>
  </div>

  <!-- Dispatched Today -->
  <div class="admin-kpi-card status-normal" style="cursor: default;">
    <div style="display: flex; justify-content: space-between; align-items: flex-start; width: 100%;">
      <span style="font-size: 0.72rem; font-weight: 700; text-transform: uppercase; color: var(--text-secondary);">Dispatched Today</span>
    </div>
    <div style="margin-top: 8px; margin-bottom: 8px;">
      <span class="admin-mono" id="kpi-val-completed" style="font-size: 1.45rem; font-weight: 700; color: var(--text-primary); letter-spacing: -0.02em;">—</span>
      <div style="font-size: 0.72rem; color: var(--text-muted); margin-top: 2px;">Reports dispatched to Ward/Email</div>
    </div>
    <div style="display: flex; align-items: center; justify-content: space-between; margin-top: 4px; font-size: 0.72rem; border-top: 1px dashed var(--border-color); padding-top: 6px;">
      <span style="color: var(--color-success); font-weight: 600; display: flex; align-items: center; gap: 2px;">
        ▲ Dispatch SLA Met
      </span>
    </div>
  </div>

  <!-- Critical Pending -->
  <div class="admin-kpi-card status-critical" style="cursor: default;">
    <div style="display: flex; justify-content: space-between; align-items: flex-start; width: 100%;">
      <span style="font-size: 0.72rem; font-weight: 700; text-transform: uppercase; color: var(--text-secondary);">Critical Pending</span>
    </div>
    <div style="margin-top: 8px; margin-bottom: 8px;">
      <span class="admin-mono" id="kpi-val-critical" style="font-size: 1.45rem; font-weight: 700; color: var(--text-primary); letter-spacing: -0.02em;">—</span>
      <div style="font-size: 0.72rem; color: var(--text-muted); margin-top: 2px;">Awaiting clinician call log</div>
    </div>
    <div style="display: flex; align-items: center; justify-content: space-between; margin-top: 4px; font-size: 0.72rem; border-top: 1px dashed var(--border-color); padding-top: 6px;">
      <span style="color: var(--color-danger); font-weight: 600; display: flex; align-items: center; gap: 2px;">
        ▼ Immediate Action
      </span>
    </div>
  </div>

  <!-- IQC Holds -->
  <div class="admin-kpi-card status-warning" style="cursor: default;">
    <div style="display: flex; justify-content: space-between; align-items: flex-start; width: 100%;">
      <span style="font-size: 0.72rem; font-weight: 700; text-transform: uppercase; color: var(--text-secondary);">IQC Holds</span>
    </div>
    <div style="margin-top: 8px; margin-bottom: 8px;">
      <span class="admin-mono" id="kpi-val-iqc" style="font-size: 1.45rem; font-weight: 700; color: var(--text-primary); letter-spacing: -0.02em;">—</span>
      <div style="font-size: 0.72rem; color: var(--text-muted); margin-top: 2px;">Internal Quality Control fails</div>
    </div>
    <div style="display: flex; align-items: center; justify-content: space-between; margin-top: 4px; font-size: 0.72rem; border-top: 1px dashed var(--border-color); padding-top: 6px;">
      <span style="color: var(--color-warning); font-weight: 600; display: flex; align-items: center; gap: 2px;">
        ▲ Calibrator Issue
      </span>
    </div>
  </div>
</div>

<!-- Main Nav Tabs -->
<div class="lis-nav-tabs" id="lis-main-nav">
  <button class="lis-nav-tab active" data-tab="collection" onclick="window.switchMainTab('collection')">🩸 Collection</button>
  <button class="lis-nav-tab" data-tab="processing" onclick="window.switchMainTab('processing')">🔬 Processing</button>
  <button class="lis-nav-tab" data-tab="validation" onclick="window.switchMainTab('validation')">✍️ Validation</button>
  <button class="lis-nav-tab" data-tab="alerts" onclick="window.switchMainTab('alerts')">🚨 Alerts <span class="lis-nav-badge" id="nav-badge-alerts">0</span></button>
  <button class="lis-nav-tab" data-tab="qc" onclick="window.switchMainTab('qc')">🧫 QC &amp; Reagents</button>
  <button class="lis-nav-tab" data-tab="reports" onclick="window.switchMainTab('reports')">📨 Reports</button>
  <button class="lis-nav-tab" data-tab="audit" onclick="window.switchMainTab('audit')">🗒️ Audit Log</button>
</div>

<!-- TAB: Collection -->
<div class="lis-tab-pane active" id="tab-collection">
  <div class="lis-2col">
    <div>
      <div class="lis-panel">
        <div class="lis-panel-head">
          <span class="lis-panel-title">🩸 Phlebotomy Queue</span>
          <div style="display:flex;gap:6px;align-items:center;">
            <select id="phleb-filter-type" onchange="window.renderPhlebotomyQueue()" style="font-size:0.78rem;padding:3px 8px;border:1px solid var(--border-color,#e5e7eb);border-radius:6px;">
              <option value="All">All Types</option><option value="OPD">OPD</option><option value="IPD">IPD</option><option value="External">External</option>
            </select>
            <select id="phleb-filter-status" onchange="window.renderPhlebotomyQueue()" style="font-size:0.78rem;padding:3px 8px;border:1px solid var(--border-color,#e5e7eb);border-radius:6px;">
              <option value="All">All Status</option><option value="Queued">Queued</option><option value="Collected">Collected</option>
            </select>
          </div>
        </div>
        <div class="lis-panel-body np"><div id="phleb-queue-body" class="lis-tbl-wrap lis-tbl-scroll"></div></div>
      </div>
      <div class="lis-panel" id="card-verbal-orders">
        <div class="lis-panel-head"><span class="lis-panel-title"><span class="badge b-verbal">VERBAL</span>&nbsp;Pending Co-Sign Orders</span></div>
        <div class="lis-panel-body np"><div id="verbal-orders-body"></div></div>
      </div>
    </div>
    <div>
      <div class="lis-panel">
        <div class="lis-panel-head"><span class="lis-panel-title">⛔ Rejection &amp; Recollection</span></div>
        <div class="lis-panel-body">
          <div class="lis-sub-tabs">
            <button class="lis-sub-tab active" id="subtab-rejection" onclick="window.switchRejectionSubTab('rejection')">Rejections</button>
            <button class="lis-sub-tab" id="subtab-recollection" onclick="window.switchRejectionSubTab('recollection')">Recollections</button>
          </div>
          <div id="rejection-subtab-content" class="lis-tbl-wrap lis-tbl-scroll"></div>
        </div>
      </div>
      <div class="lis-panel">
        <div class="lis-panel-head"><span class="lis-panel-title">🗂️ Sample Storage Register</span></div>
        <div class="lis-panel-body np"><div id="storage-body" class="lis-tbl-wrap" style="max-height:240px;overflow-y:auto;"></div></div>
      </div>
      <div class="lis-panel" id="card-notifiable">
        <div class="lis-panel-head"><span class="lis-panel-title">⚕️ Notifiable Disease Register</span></div>
        <div class="lis-panel-body np"><div id="notifiable-body" class="lis-tbl-wrap" style="max-height:220px;overflow-y:auto;"></div></div>
      </div>
    </div>
  </div>
</div>

<!-- TAB: Processing -->
<div class="lis-tab-pane" id="tab-processing">
  <div class="lis-panel">
    <div class="lis-panel-head"><span class="lis-panel-title">🔬 Processing Worklist</span></div>
    <div class="lis-panel-body">
      <div class="dept-pills" id="worklist-dept-tabs"></div>
      <div id="worklist-body" class="lis-tbl-wrap lis-tbl-scroll"></div>
    </div>
  </div>
</div>

<!-- TAB: Validation -->
<div class="lis-tab-pane" id="tab-validation">
  <div class="lis-panel">
    <div class="lis-panel-head">
      <span class="lis-panel-title">✍️ Validation Queue <span id="validation-count-badge" class="badge b-critical" style="margin-left:6px;"></span></span>
    </div>
    <div class="lis-panel-body">
      <div class="filter-chips" id="validation-filter-row">
        <div class="filter-chip active" onclick="window.setValidationFilter('All',this)">All</div>
        <div class="filter-chip" onclick="window.setValidationFilter('CRITICAL',this)">🔴 Critical</div>
        <div class="filter-chip" onclick="window.setValidationFilter('REACTIVE',this)">⚠️ Reactive</div>
        <div class="filter-chip" onclick="window.setValidationFilter('DELTA CHECK',this)">📊 Delta</div>
        <div class="filter-chip" onclick="window.setValidationFilter('H',this)">↑ High</div>
      </div>
      <div id="validation-body"></div>
    </div>
  </div>
</div>

<!-- TAB: Alerts -->
<div class="lis-tab-pane" id="tab-alerts">
  <div class="lis-2col">
    <div>
      <div class="lis-panel">
        <div class="lis-panel-head"><span class="lis-panel-title">🚨 Active Critical Value Alerts</span></div>
        <div class="lis-panel-body">
          <div class="lis-sub-tabs">
            <button class="lis-sub-tab active" id="alerts-subtab-active" onclick="window.switchAlertsSubTab('active')">Active</button>
            <button class="lis-sub-tab" id="alerts-subtab-ack-register" onclick="window.switchAlertsSubTab('ack-register')">Acknowledged</button>
          </div>
          <div id="critical-alerts-body"></div>
          <div id="crit-ack-register-body" style="display:none;"></div>
        </div>
      </div>
    </div>
    <div>
      <div class="lis-panel">
        <div class="lis-panel-head"><span class="lis-panel-title">⚖️ MLC Chain-of-Custody</span></div>
        <div class="lis-panel-body np"><div id="mlc-log-body" class="lis-tbl-wrap" style="max-height:280px;overflow-y:auto;"></div></div>
      </div>
      <div class="lis-panel" id="card-eqas-compact">
        <div class="lis-panel-head"><span class="lis-panel-title">📊 EQAS / PT Performance</span></div>
        <div class="lis-panel-body np"><div id="eqas-body" class="lis-tbl-wrap" style="max-height:240px;overflow-y:auto;"></div></div>
      </div>
    </div>
  </div>
</div>

<!-- TAB: QC -->
<div class="lis-tab-pane" id="tab-qc">
  <div class="lis-panel">
    <div class="lis-panel-head"><span class="lis-panel-title">🧫 Quality Control &amp; Reagent Management</span></div>
    <div class="lis-panel-body">
      <div class="lis-sub-tabs">
        <button class="lis-sub-tab active" id="qc-subtab-iqc" onclick="window.switchQcSubTab('iqc')">IQC Log</button>
        <button class="lis-sub-tab" id="qc-subtab-reagents" onclick="window.switchQcSubTab('reagents')">Reagent Alerts</button>
        <button class="lis-sub-tab" id="qc-subtab-outsource" onclick="window.switchQcSubTab('outsource')">Outsource Register</button>
        <button class="lis-sub-tab" id="qc-subtab-equipment" onclick="window.switchQcSubTab('equipment')">Equipment Status</button>
      </div>
      <div id="qc-subtab-content"></div>
    </div>
  </div>
</div>

<!-- TAB: Reports -->
<div class="lis-tab-pane" id="tab-reports">
  <div class="lis-2col">
    <div>
      <div class="lis-panel">
        <div class="lis-panel-head"><span class="lis-panel-title">📨 Report Dispatch Log</span></div>
        <div class="lis-panel-body np"><div id="dispatch-log-body" class="lis-tbl-wrap lis-tbl-scroll"></div></div>
      </div>
    </div>
    <div>
      <div class="lis-panel">
        <div class="lis-panel-head"><span class="lis-panel-title">📈 Department Analytics &amp; TAT</span></div>
        <div class="lis-panel-body">
          <div class="dept-pills" id="analytics-dept-tabs"></div>
          <div id="analytics-body"></div>
        </div>
      </div>
    </div>
  </div>
</div>

<!-- TAB: Audit -->
<div class="lis-tab-pane" id="tab-audit">
  <div class="lis-panel">
    <div class="lis-panel-head">
      <span class="lis-panel-title">🗒️ LIS Immutable Audit Log</span>
      <div style="display:flex;gap:8px;align-items:center;">
        <input type="text" id="audit-search" placeholder="Search logs…" oninput="window.renderAuditLog()" style="border:1px solid var(--border-color,#e5e7eb);border-radius:6px;padding:5px 10px;font-size:0.82rem;width:200px;">
        <button class="btn btn-secondary btn-sm" onclick="window.exportAuditCsv()">📥 Export CSV</button>
      </div>
    </div>
    <div class="lis-panel-body np"><div id="audit-log-body" class="lis-tbl-wrap lis-tbl-scroll"></div></div>
  </div>
</div>

</div><!-- /lis-root -->
`;
  }


  // ---------------------------------------------------------------------------
  // SECTION 4: Attach Global Listeners & Window Functions
  // ---------------------------------------------------------------------------
  function attachGlobalListeners() {
    // Role switcher
    window.switchLabRole = function (role) {
      localStorage.setItem('saronil_active_lab_role', role);
      // Enhancement 2: keep select element in sync
      var sel = document.getElementById('lab-role-switcher');
      if (sel && sel.value !== role) sel.value = role;
      applyRoleUI(role);
      renderAllPanels();
    };

    // MLC checkbox handler
    var mlcChk = document.getElementById('chk-mlc-order');
    if (mlcChk) {
      mlcChk.onchange = function () {
        var sec = document.getElementById('mlc-details-section');
        if (sec) sec.style.display = this.checked ? 'block' : 'none';
      };
    }

    // Close staff dropdown when clicking outside
    document.addEventListener('click', function (e) {
      var input = document.getElementById('phleb-collector-name');
      var dropdown = document.getElementById('phleb-collector-dropdown');
      if (!input || !dropdown) return;
      if (!input.contains(e.target) && !dropdown.contains(e.target)) {
        dropdown.style.display = 'none';
      }
    });
  }

  // ---------------------------------------------------------------------------
  // Staff Suggestive Search — Collector Name field
  // ---------------------------------------------------------------------------

  // Build the combined staff pool from nurses + lab/phlebotomy staff
  function buildStaffPool() {
    var pool = [];

    // Nurses from window.state.nurses
    var nurses = window.state.nurses || [];
    nurses.forEach(function (n) {
      pool.push({ name: n.name, role: 'Ward Nurse', dept: n.dept || 'Nursing', shift: n.shift || '', id: n.id });
    });

    // Lab staff from window.state.staff
    var staff = window.state.staff || [];
    staff.forEach(function (s) {
      pool.push({ name: s.name, role: s.role || 'Staff', dept: s.dept || '', shift: s.shift || '', id: s.id });
    });

    // Always add hardcoded lab-specific roles that may not be in state yet
    var labStaff = [
      { name: 'Lab Tech Sundar',    role: 'Laboratory Technician', dept: 'Haematology',       shift: 'Morning' },
      { name: 'Lab Tech Anjali',    role: 'Laboratory Technician', dept: 'Biochemistry',      shift: 'Morning' },
      { name: 'Lab Tech Prakash',   role: 'Laboratory Technician', dept: 'Serology',          shift: 'Morning' },
      { name: 'Lab Tech Rekha',     role: 'Laboratory Technician', dept: 'Microbiology',      shift: 'Afternoon' },
      { name: 'Lab Tech Ramesh',    role: 'Phlebotomist',          dept: 'Phlebotomy',        shift: 'Morning' },
      { name: 'Lab Tech Kavitha',   role: 'Phlebotomist',          dept: 'Phlebotomy',        shift: 'Afternoon' },
      { name: 'Lab Tech Suresh',    role: 'Phlebotomist',          dept: 'Phlebotomy',        shift: 'Night' },
      { name: 'Ward Nurse Savitha', role: 'Ward Nurse',            dept: 'General Ward',      shift: 'Morning' },
      { name: 'Ward Nurse Kavitha', role: 'Ward Nurse',            dept: 'General Ward',      shift: 'Morning' },
      { name: 'Staff Nurse Meenakshi',role:'Ward Nurse',           dept: 'Emergency',         shift: 'Night' },
      { name: 'Staff Nurse Radha',  role: 'Ward Nurse',            dept: 'CCU',               shift: 'Morning' },
      { name: 'Staff Nurse Pavithra',role:'Ward Nurse',            dept: 'ICCU',              shift: 'Morning' },
      { name: 'Staff Nurse Deepa',  role: 'Ward Nurse',            dept: 'Daycare',           shift: 'Afternoon' },
      { name: 'Dr. Poornima Shetty',role:'Histopathologist',       dept: 'Histopathology',    shift: 'Morning' }
    ];

    // Merge, avoid exact-name duplicates
    labStaff.forEach(function (ls) {
      var exists = pool.some(function (p) { return p.name.toLowerCase() === ls.name.toLowerCase(); });
      if (!exists) pool.push(ls);
    });

    return pool;
  }

  window.staffSuggest = function (query) {
    var input    = document.getElementById('phleb-collector-name');
    var dropdown = document.getElementById('phleb-collector-dropdown');
    var clearBtn = document.getElementById('phleb-collector-clear');
    if (!dropdown || !input) return;

    // Show/hide clear button
    if (clearBtn) clearBtn.style.display = (input.value.length > 0) ? 'inline' : 'none';

    var roleEl = document.getElementById('phleb-collector-role');
    var selectedRole = roleEl ? roleEl.value : 'Phlebotomist';  // 'Phlebotomist' or 'Ward Nurse'

    var pool = buildStaffPool();
    var q = (query || '').toLowerCase().trim();

    // Filter by role affinity + query
    var filtered = pool.filter(function (s) {
      var nameMatch = q === '' || s.name.toLowerCase().includes(q);
      if (!nameMatch) return false;

      // Role filtering
      if (selectedRole === 'Ward Nurse') {
        return s.role.toLowerCase().includes('nurse');
      } else {
        // Phlebotomist — show phlebotomists, lab techs, and generic staff
        return !s.role.toLowerCase().includes('nurse') ||
               s.role.toLowerCase().includes('phlebotomist') ||
               s.role.toLowerCase().includes('lab');
      }
    }).slice(0, 8); // max 8 results

    if (filtered.length === 0) {
      dropdown.style.display = 'none';
      return;
    }

    var shiftIcon = { 'Morning': '🌅', 'Afternoon': '🌤️', 'Night': '🌙' };

    var html = filtered.map(function (s) {
      var roleColor = s.role.includes('Nurse') ? '#7c3aed' : s.role.includes('Phlebotomist') ? '#1d4ed8' : '#059669';
      var si = shiftIcon[s.shift] || '🕐';
      return '<div onclick="window.selectCollector(\'' + s.name.replace(/'/g, "\\'") + '\')"' +
        ' style="display:flex;align-items:center;gap:10px;padding:9px 14px;cursor:pointer;transition:background .12s;border-bottom:1px solid #f3f4f6;"' +
        ' onmouseenter="this.style.background=\'#f0f9ff\'" onmouseleave="this.style.background=\'\'">' +
        '<div style="width:34px;height:34px;border-radius:50%;background:' + roleColor + '22;display:flex;align-items:center;justify-content:center;font-size:1rem;flex-shrink:0;">' +
          (s.role.includes('Nurse') ? '👩‍⚕️' : s.role.includes('Phlebotomist') ? '🩸' : '🔬') +
        '</div>' +
        '<div style="flex:1;min-width:0;">' +
          '<div style="font-weight:600;font-size:0.87rem;color:#111827;">' + escHtml(s.name) + '</div>' +
          '<div style="font-size:0.74rem;color:#6b7280;">' +
            '<span style="background:' + roleColor + '1a;color:' + roleColor + ';border-radius:4px;padding:1px 6px;font-weight:600;">' + escHtml(s.role) + '</span>' +
            '&nbsp;·&nbsp;' + escHtml(s.dept) +
          '</div>' +
        '</div>' +
        '<div style="font-size:0.75rem;color:#9ca3af;white-space:nowrap;">' + si + ' ' + escHtml(s.shift) + '</div>' +
      '</div>';
    }).join('');

    dropdown.innerHTML = html;
    dropdown.style.display = 'block';
  };

  window.selectCollector = function (name) {
    var input    = document.getElementById('phleb-collector-name');
    var dropdown = document.getElementById('phleb-collector-dropdown');
    var clearBtn = document.getElementById('phleb-collector-clear');
    if (input)    { input.value = name; }
    if (dropdown) { dropdown.style.display = 'none'; }
    if (clearBtn) { clearBtn.style.display = 'inline'; }
  };

  window.clearCollectorName = function () {
    var input    = document.getElementById('phleb-collector-name');
    var dropdown = document.getElementById('phleb-collector-dropdown');
    var clearBtn = document.getElementById('phleb-collector-clear');
    if (input)    { input.value = ''; input.focus(); }
    if (dropdown) { dropdown.style.display = 'none'; }
    if (clearBtn) { clearBtn.style.display = 'none'; }
  };

  // ---------------------------------------------------------------------------
  // SECTION 4b: Main Tab Switcher
  // ---------------------------------------------------------------------------
  window.switchMainTab = function (tabId) {
    // Deactivate all panes and tabs
    document.querySelectorAll('.lis-tab-pane').forEach(function (el) { el.classList.remove('active'); });
    document.querySelectorAll('.lis-nav-tab').forEach(function (el) { el.classList.remove('active'); });
    // Activate selected
    var pane = document.getElementById('tab-' + tabId);
    if (pane) pane.classList.add('active');
    var tab = document.querySelector('.lis-nav-tab[data-tab="' + tabId + '"]');
    if (tab) tab.classList.add('active');
    // Render on demand
    if (tabId === 'alerts') { renderCriticalAlerts(); window.renderMlcLog(); window.renderEqas(); updateAlertBadge(); }
    if (tabId === 'qc') { renderQcSubTab('iqc'); }
    if (tabId === 'reports') { window.renderDispatchLog(); renderAnalyticsDeptTabs(); renderAnalytics('All'); }
    if (tabId === 'audit') { window.renderAuditLog(); }
    if (tabId === 'processing') { renderWorklistDeptTabs(); renderWorklistBody(); }
    if (tabId === 'validation') { window.renderValidationQueue(); }
    if (tabId === 'collection') { window.renderPhlebotomyQueue(); renderRejectionSubTab('rejection'); renderStorageBody(); renderNotifiableDiseases(); window.renderVerbalOrders(); }
  };

  window.switchAlertsSubTab = function (tab) {
    var activeBtn = document.getElementById('alerts-subtab-active');
    var ackBtn = document.getElementById('alerts-subtab-ack-register');
    var activeBody = document.getElementById('critical-alerts-body');
    var ackBody = document.getElementById('crit-ack-register-body');
    if (!activeBody || !ackBody) return;
    if (tab === 'active') {
      activeBody.style.display = '';
      ackBody.style.display = 'none';
      if (activeBtn) activeBtn.classList.add('active');
      if (ackBtn) ackBtn.classList.remove('active');
      renderCriticalAlerts();
    } else {
      activeBody.style.display = 'none';
      ackBody.style.display = 'block';
      if (activeBtn) activeBtn.classList.remove('active');
      if (ackBtn) ackBtn.classList.add('active');
      window.renderCritAckRegister();
    }
  };

  function updateAlertBadge() {
    var n = (window.state.criticalValues || []).filter(function (c) { return c.ackStatus === 'Pending'; }).length;
    var el = document.getElementById('nav-badge-alerts');
    if (el) el.textContent = n;
  }

  // ---------------------------------------------------------------------------
  // SECTION 5: Role UI Application
  // ---------------------------------------------------------------------------
  // Enhancement 1: role → allowed tabs mapping
  var ROLE_TAB_MAP = {
    'Laboratory Director':   ['qc','reports','audit'],
    'Laboratory Manager':    ['collection','processing','validation','alerts','qc','reports','audit'],
    'Pathologist':           ['validation','alerts'],
    'Microbiologist':        ['validation','alerts'],
    'Biochemist':            ['validation','alerts'],
    'Histopathologist':      ['processing'],
    'Laboratory Supervisor': ['collection','processing','qc'],
    'Laboratory Technician': ['processing','qc'],
    'Phlebotomist':          ['collection'],
    'Ward Nurse':            ['collection'],
    'Laboratory Reception':  ['collection','reports']
  };

  function applyRoleUI(role) {
    var config = ROLE_CONFIG[role] || ROLE_CONFIG['Laboratory Manager'];
    var desc = ROLE_DESCRIPTIONS[role] || '';

    // Update role banner
    var titleEl = document.getElementById('role-banner-title-text');
    var descEl = document.getElementById('role-banner-desc-text');
    if (titleEl) titleEl.textContent = '👤 Active Role: ' + role;
    if (descEl) descEl.textContent = desc;

    // Show/hide new order button
    var newOrderBtn = document.getElementById('btn-new-lab-order');
    if (newOrderBtn) newOrderBtn.style.display = config.newOrder ? 'inline-block' : 'none';

    // Enhancement 1: Show/hide nav tabs based on role
    var allowedTabs = ROLE_TAB_MAP[role] || ['collection','processing','validation','alerts','qc','reports','audit'];
    var firstAllowedTab = allowedTabs[0] || 'collection';
    document.querySelectorAll('.lis-nav-tab').forEach(function (tabBtn) {
      var tabId = tabBtn.getAttribute('data-tab');
      if (tabId) {
        tabBtn.style.display = allowedTabs.indexOf(tabId) !== -1 ? '' : 'none';
      }
    });
    // Switch to the first allowed tab for this role
    if (typeof window.switchMainTab === 'function') {
      window.switchMainTab(firstAllowedTab);
    }
  }

  // ---------------------------------------------------------------------------
  // SECTION 6: Render All Panels
  // ---------------------------------------------------------------------------
  function renderAllPanels() {
    renderKpis();
    renderCriticalBanner();
    renderPhlebotomyQueue();
    renderWorklist();
    renderValidationQueue();
    renderCriticalAlerts();
    renderDispatchLog();
    renderEqas();
    renderMlcLog();
    renderRejectionSubTab('rejection');
    renderStorageBody();
    renderVerbalOrders();
    renderQcSubTab('iqc');
    renderAnalyticsDeptTabs();
    renderAnalytics('All');
    renderAuditLog();
    renderNotifiableDiseases();
    renderBloodStockTable();
    renderBloodCrossMatches();
  }

  // ---------------------------------------------------------------------------
  // SECTION 7: KPI Rendering
  // ---------------------------------------------------------------------------
  window.renderKpis = function () {
    var queued = (window.state.phlebotomyQueue || []).filter(function (q) { return q.status === 'Queued'; }).length;
    var processing = (window.state.processingWorklist || []).filter(function (s) { return s.status === 'In Progress'; }).length;
    var validation = (window.state.validationQueue || []).filter(function (r) { return r.status === 'Pending Validation'; }).length;
    var dispatched = (window.state.reportDispatchLog || []).length;
    var critPending = (window.state.criticalValues || []).filter(function (c) { return c.ackStatus === 'Pending'; }).length;
    var iqcHold = (window.state.qcLog || []).filter(function (q) { return q.status === 'Fail' && q.iqcHold; }).length;

    function setKpi(id, val) {
      var el = document.getElementById(id);
      if (el) el.textContent = val;
    }
    setKpi('kpi-val-queued', queued);
    setKpi('kpi-val-processing', processing);
    setKpi('kpi-val-validation', validation);
    setKpi('kpi-val-completed', dispatched);
    setKpi('kpi-val-critical', critPending);
    setKpi('kpi-val-iqc', iqcHold);
  };

  // ---------------------------------------------------------------------------
  // SECTION 8: Critical Banner
  // ---------------------------------------------------------------------------
  function renderCriticalBanner() {
    var critPending = (window.state.criticalValues || []).filter(function (c) { return c.ackStatus === 'Pending'; });
    var banner = document.getElementById('critical-alert-banner');
    var text = document.getElementById('critical-alert-banner-text');
    if (!banner || !text) return;
    if (critPending.length > 0) {
      banner.style.display = 'flex';
      text.textContent = critPending.length + ' CRITICAL VALUE(S) PENDING ACKNOWLEDGEMENT — Immediate clinician notification required. ' +
        critPending.map(function (c) { return c.name + ': ' + c.test + ' = ' + c.value; }).join(' | ');
    } else {
      banner.style.display = 'none';
    }
  }

  // ---------------------------------------------------------------------------
  // SECTION 9: Phlebotomy Queue Render
  // ---------------------------------------------------------------------------
  window.renderPhlebotomyQueue = function () {
    var body = document.getElementById('phleb-queue-body');
    if (!body) return;
    var typeFilter = document.getElementById('phleb-filter-type') ? document.getElementById('phleb-filter-type').value : 'All';
    var statusFilter = document.getElementById('phleb-filter-status') ? document.getElementById('phleb-filter-status').value : 'All';

    var queue = (window.state.phlebotomyQueue || []).filter(function (q) {
      var typeOk = typeFilter === 'All' || q.patientType === typeFilter;
      var statusOk = statusFilter === 'All' || q.status === statusFilter;
      return typeOk && statusOk;
    });

    if (queue.length === 0) {
      body.innerHTML = '<div class="empty-msg"><div class="empty-msg-icon">🩸</div>No entries in queue</div>';
      return;
    }

    var html = '';
    queue.forEach(function (entry) {
      var priorityBadge = '';
      if (entry.priority === 'STAT') priorityBadge = '<span class="badge badge b-stat">STAT</span>';
      else if (entry.priority === 'Urgent') priorityBadge = '<span class="badge badge b-urgent">Urgent</span>';
      else priorityBadge = '<span class="badge badge b-routine">Routine</span>';

      var statusBadge = entry.status === 'Collected'
        ? '<span class="badge badge b-collected">Collected</span>'
        : '<span class="badge badge b-queued">Queued</span>';

      var tubeClass = 'tube-' + (entry.tubeColor || 'yellow').replace(/-/g, '');
      var tubeDot = '<span class="tube-dot ' + tubeClass + '"></span>';

      var mlcHtml = entry.mlcFlag ? ' <span class="mlc-flag">MLC</span>' : '';
      var homeHtml = entry.bookingChannel === 'Home Collection' ? ' <span class="home-collection-badge">HOME</span>' : '';

      // Enhancement 3: Patient Type coloured badge
      var ptBadge = '';
      var pt = (entry.patientType || '').toUpperCase();
      if (pt === 'IPD') ptBadge = '<span class="badge b-ipd">IPD</span>';
      else if (pt === 'OPD') ptBadge = '<span class="badge b-opd">OPD</span>';
      else if (pt === 'EXTERNAL') ptBadge = '<span class="badge b-ext">EXT</span>';
      else if (pt === 'DAYCARE') ptBadge = '<span class="badge" style="background:#f0fdf4;color:#15803d;border:1px solid #86efac;">DayCare</span>';
      else if (pt === 'EMERGENCY') ptBadge = '<span class="badge b-stat">EMG</span>';
      else ptBadge = '<span class="badge b-ext">' + escHtml(entry.patientType || '') + '</span>';

      var ipdInfo = '';
      if (entry.patientType === 'IPD') {
        ipdInfo = '<div style="font-size:0.75rem;color:var(--text-muted);">\uD83D\uDECF\uFE0F ' + (entry.ward || '') + ' ' + (entry.bedNo || '') + '</div>';
      }

      // Enhancement 9: Payment gate for OPD / External
      var isPaymentGated = (pt === 'OPD' || pt === 'EXTERNAL') && (!entry.billingStatus || entry.billingStatus === 'Pending');
      var actionBtn;
      if (entry.status === 'Collected') {
        actionBtn = '<button class="btn btn-secondary btn-sm" onclick="window.navigateToPatient(\'' + entry.uhid + '\')">\uD83D\uDC64 View</button>';
      } else if (isPaymentGated) {
        actionBtn = '<button class="btn btn-secondary btn-sm" disabled style="opacity:.55;cursor:not-allowed;" title="Payment not cleared \u2014 cannot collect">\uD83D\uDD12 Pymt Pending</button>';
      } else {
        actionBtn = '<button class="btn btn-primary btn-sm" onclick="window.markCollected(\'' + entry.accNo + '\')">\u2705 Collect</button>';
      }

      var timeStr = entry.bookedAt ? formatTime(entry.bookedAt) : '';

      html += '<div style="border:1px solid var(--border-color,#e5e7eb);border-radius:8px;padding:10px;margin-bottom:8px;background:#fff;">' +
        '<div style="display:flex;justify-content:space-between;align-items:flex-start;">' +
          '<div>' +
            '<div style="font-weight:700;font-size:0.88rem;">' + escHtml(entry.name) + mlcHtml + homeHtml + '</div>' +
            '<div style="font-size:0.78rem;color:var(--text-muted);margin-top:2px;">' + escHtml(entry.uhid) + ' \u00b7 ' + entry.age + 'y/' + entry.gender + ' &nbsp;' + ptBadge + '</div>' +
            ipdInfo +
            '<div style="font-size:0.78rem;margin-top:4px;">' + tubeDot + escHtml(entry.tests.join(', ')) + '</div>' +
            '<div style="font-size:0.72rem;color:var(--text-muted);">Dr: ' + escHtml(entry.refDoctor || '') + ' \u00b7 ' + timeStr + '</div>' +
          '</div>' +
          '<div style="text-align:right;">' +
            '<div>' + priorityBadge + '</div>' +
            '<div style="margin-top:4px;">' + statusBadge + '</div>' +
            '<div style="margin-top:6px;">' + actionBtn + '</div>' +
          '</div>' +
        '</div>' +
        '<div style="font-size:0.72rem;color:var(--text-muted);margin-top:4px;">' +
          '<span style="font-family:monospace;font-size:0.78rem;">' + escHtml(entry.accNo) + '</span>' +
          (entry.status === 'Collected' ? ' \u00b7 \uD83E\uDDEA By: ' + escHtml(entry.collectedBy || '') : '') +
          (isPaymentGated ? ' &nbsp;<span style="color:#dc2626;font-size:0.72rem;">\u26A0 Billing Pending</span>' : '') +
        '</div>' +
      '</div>';
    });

    body.innerHTML = html;
  };

  // ---------------------------------------------------------------------------
  // SECTION 10: Processing Worklist Render
  // ---------------------------------------------------------------------------
  var _currentWorklistDept = 'All';

  window.renderWorklist = function () {
    renderWorklistDeptTabs();
    renderWorklistBody();
  };

  function renderWorklistDeptTabs() {
    var tabsEl = document.getElementById('worklist-dept-tabs');
    if (!tabsEl) return;
    var depts = ['All'];
    (window.state.processingWorklist || []).forEach(function (s) {
      if (s.dept && depts.indexOf(s.dept) === -1) depts.push(s.dept);
    });
    tabsEl.innerHTML = depts.map(function (d) {
      return '<button class="dept-tab' + (d === _currentWorklistDept ? ' active' : '') + '" onclick="window.switchWorklistDept(\'' + escAttr(d) + '\')">' + escHtml(d) + '</button>';
    }).join('');
  }

  window.switchWorklistDept = function (dept) {
    _currentWorklistDept = dept;
    renderWorklistDeptTabs();
    renderWorklistBody();
  };

  function renderWorklistBody() {
    var body = document.getElementById('worklist-body');
    if (!body) return;
    var list = (window.state.processingWorklist || []).filter(function (s) {
      return _currentWorklistDept === 'All' || s.dept === _currentWorklistDept;
    });

    if (list.length === 0) {
      body.innerHTML = '<div class="empty-msg"><div class="empty-msg-icon">🔬</div>No specimens in worklist</div>';
      return;
    }

    var html = '';
    list.forEach(function (spec) {
      var statusBadge = '';
      if (spec.status === 'In Progress') statusBadge = '<span class="badge badge b-progress">In Progress</span>';
      else if (spec.status === 'Pending Result') statusBadge = '<span class="badge badge b-urgent">Pending Result</span>';
      else statusBadge = '<span class="badge badge b-routine">' + spec.status + '</span>';

      var histoHtml = '';
      if (spec.histoStages && spec.histoStages.length > 0) {
        histoHtml = '<div class="histo-pipeline">';
        spec.histoStages.forEach(function (st, idx) {
          var cls = idx < spec.currentStageIndex ? 'done' : idx === spec.currentStageIndex ? 'current' : 'pending';
          histoHtml += '<div class="histo-stage ' + cls + '">' + st + '</div>';
        });
        histoHtml += '</div>';
      }

      var tatPct = estimateTatPct(spec.receivedAt, spec.tat);
      var tatColor = tatPct < 60 ? 'tat-ok' : tatPct < 85 ? 'tat-warn' : 'tat-breach';

      var actionBtns = '';
      if (spec.status === 'Pending Result' || spec.stage === 'Result Entry') {
        actionBtns = '<button class="btn btn-primary btn-sm" onclick="window.openEnterResultModal(\'' + spec.specId + '\')">🖊️ Enter Result</button>';
      } else {
        actionBtns = '<button class="btn btn-secondary btn-sm" onclick="window.openReceiveModal(\'' + spec.specId + '\')">✅ Receive/QC</button>';
      }

      html += `<div style="border:1px solid var(--border-color,#e5e7eb);border-radius:8px;padding:10px;margin-bottom:8px;background:#fff;">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:4px;">
          <div>
            <div style="font-weight:700;font-size:0.88rem;">${escHtml(spec.name)}</div>
            <div style="font-size:0.75rem;color:var(--text-muted);">${spec.uhid} · ${spec.dept}</div>
            <div style="font-size:0.78rem;margin-top:2px;">Tests: ${escHtml(spec.tests.join(', '))}</div>
          </div>
          <div style="text-align:right;">
            ${statusBadge}
            <div style="margin-top:6px;font-size:0.75rem;">Stage: <strong>${escHtml(spec.stage)}</strong></div>
          </div>
        </div>
        ${histoHtml}
        <div class="tat-bar-wrap"><div class="tat-bar ${tatColor}" style="width:${tatPct}%;"></div></div>
        <div style="display:flex;justify-content:space-between;align-items:center;margin-top:6px;">
          <div style="font-size:0.72rem;color:var(--text-muted);">
            <span style="font-family:monospace;font-size:0.78rem;">${spec.specId}</span> · ${escHtml(spec.instrument || '')} · ${escHtml(spec.analyst || '')}
          </div>
          <div>${actionBtns}</div>
        </div>
      </div>`;
    });

    body.innerHTML = html;
  }

  // ---------------------------------------------------------------------------
  // SECTION 11: Validation Queue Render
  // ---------------------------------------------------------------------------
  var _validationFilter = 'All';

  window.setValidationFilter = function (filter, chipEl) {
    _validationFilter = filter;
    document.querySelectorAll('#validation-filter-row .filter-chip').forEach(function (c) { c.classList.remove('active'); });
    if (chipEl) chipEl.classList.add('active');
    renderValidationQueue();
  };

  window.renderValidationQueue = function () {
    var body = document.getElementById('validation-body');
    if (!body) return;

    // Enhancement 4: role-based dept filtering
    var activeRole = localStorage.getItem('saronil_active_lab_role') || 'Laboratory Manager';
    var ROLE_DEPT_MAP = {
      'Pathologist':      ['Haematology','Clinical Pathology','Cytology'],
      'Biochemist':       ['Biochemistry'],
      'Microbiologist':   ['Microbiology'],
      'Histopathologist': ['Histopathology']
    };
    var allowedDepts = ROLE_DEPT_MAP[activeRole]; // undefined means show all

    var list = (window.state.validationQueue || []).filter(function (r) {
      if (_validationFilter !== 'All' && !(r.flags && r.flags.indexOf(_validationFilter) !== -1)) return false;
      if (!allowedDepts) return true;
      return allowedDepts.indexOf(r.dept) !== -1;
    });

    // IQC: find all instruments/depts with active fail+hold
    var iqcFailedDepts = {};
    (window.state.qcLog || []).forEach(function (q) {
      if (q.status === 'Fail' && q.iqcHold) iqcFailedDepts[q.dept] = q.instrument || q.dept;
    });

    var countBadge = document.getElementById('validation-count-badge');
    if (countBadge) {
      var pending = (window.state.validationQueue || []).filter(function (r) { return r.status === 'Pending Validation'; }).length;
      countBadge.textContent = pending + ' pending';
    }

    if (list.length === 0) {
      body.innerHTML = '<div class="empty-msg"><div class="empty-msg-icon">\u2705</div>No reports pending validation</div>';
      return;
    }

    var html = '';
    list.forEach(function (rpt) {
      var flagHtml = '';
      (rpt.flags || []).forEach(function (f) {
        if (f === 'CRITICAL') flagHtml += '<span class="badge badge b-critical">\uD83D\uDEA8 CRITICAL</span> ';
        else if (f === 'REACTIVE') flagHtml += '<span class="badge badge b-reactive">\u26A0\uFE0F REACTIVE</span> ';
        else if (f === 'DELTA CHECK') flagHtml += '<span class="badge badge b-urgent">\uD83D\uDD04 DELTA</span> ';
        else if (f === 'H') flagHtml += '<span class="badge badge b-urgent">\u2191 HIGH</span> ';
        else flagHtml += '<span class="badge badge b-pending">' + escHtml(f) + '</span> ';
      });

      // Enhancement 4: dept tag badge
      var deptBadge = '<span class="badge" style="background:#dbeafe;color:#1e40af;margin-left:4px;">' + escHtml(rpt.dept || '') + '</span>';

      // Enhancement 5: IQC HOLD check per dept
      var isIqcHold = !!iqcFailedDepts[rpt.dept];
      if (isIqcHold) flagHtml += '<span class="badge b-fail">IQC HOLD</span> ';

      var resultHtml = '<table style="font-size:0.78rem;border-collapse:collapse;width:100%;margin-top:4px;">';
      if (rpt.result) {
        Object.keys(rpt.result).forEach(function (k) {
          resultHtml += '<tr><td style="color:var(--text-muted);padding:2px 6px;">' + escHtml(k) + '</td><td style="font-family:var(--font-mono,monospace);font-weight:600;padding:2px 6px;">' + escHtml(rpt.result[k]) + '</td></tr>';
        });
      }
      resultHtml += '</table>';

      var reqRole = window.getRequiredSpecialistRole(rpt.dept);
      var canValidate = (activeRole === 'Laboratory Manager' || activeRole === reqRole || activeRole === 'Laboratory Director');
      // Enhancement 4: dept-restriction locked button
      var isDeptLocked = allowedDepts && allowedDepts.indexOf(rpt.dept) === -1;

      var btnHtml;
      if (isIqcHold) {
        btnHtml = '<button class="btn btn-secondary btn-sm" disabled title="IQC Hold active — results quarantined">\u26D4 IQC Hold</button>';
      } else if (isDeptLocked) {
        btnHtml = '<button class="btn btn-secondary btn-sm" disabled title="Not in your department">\uD83D\uDD12 Not Your Dept</button>';
      } else if (canValidate) {
        btnHtml = '<button class="btn btn-primary btn-sm" onclick="window.openSignoffModal(\'' + rpt.reportNo + '\')">\u270D\uFE0F Sign-off</button>';
      } else {
        btnHtml = '<span style="font-size:0.75rem;color:#dc2626;">Requires: ' + escHtml(reqRole) + '</span>';
      }

      // Enhancement 3 (validation): Patient Type badge next to name
      var phlebEntry = (window.state.phlebotomyQueue || []).find(function (q) { return q.accNo === rpt.accNo; });
      var ptBadgeV = '';
      if (phlebEntry) {
        var ptV = (phlebEntry.patientType || '').toUpperCase();
        if (ptV === 'IPD') ptBadgeV = '<span class="badge b-ipd">IPD</span>';
        else if (ptV === 'OPD') ptBadgeV = '<span class="badge b-opd">OPD</span>';
        else if (ptV === 'EXTERNAL') ptBadgeV = '<span class="badge b-ext">EXT</span>';
        else if (ptV === 'DAYCARE') ptBadgeV = '<span class="badge" style="background:#f0fdf4;color:#15803d;border:1px solid #86efac;">DayCare</span>';
        else if (ptV === 'EMERGENCY') ptBadgeV = '<span class="badge b-stat">EMG</span>';
      }

      html += '<div style="border:1px solid var(--border-color,#e5e7eb);border-radius:8px;padding:10px;margin-bottom:10px;background:' + (isIqcHold ? '#fff7f7' : '#fff') + ';' + (isIqcHold ? 'border-left:3px solid #dc2626;' : '') + '">' +
        '<div style="display:flex;justify-content:space-between;align-items:flex-start;">' +
          '<div>' +
            '<div style="font-weight:700;">' + escHtml(rpt.name) + ' <span style="font-size:0.78rem;color:var(--text-muted);">' + rpt.age + 'y/' + rpt.gender + '</span> ' + ptBadgeV + '</div>' +
            '<div style="font-size:0.75rem;color:var(--text-muted);">' + escHtml(rpt.uhid) + ' \u00b7 ' + escHtml(rpt.tests.join(', ')) + deptBadge + '</div>' +
            '<div style="margin-top:4px;">' + flagHtml + '</div>' +
          '</div>' +
          '<div>' + btnHtml + '</div>' +
        '</div>' +
        '<div style="font-size:0.78rem;color:#991b1b;font-weight:600;margin-top:4px;">' + escHtml(rpt.flagLabel || '') + '</div>' +
        resultHtml +
        '<div style="font-size:0.72rem;color:var(--text-muted);margin-top:6px;">' +
          '<span style="font-family:monospace;font-size:0.78rem;">' + escHtml(rpt.reportNo) + '</span> \u00b7 By: ' + escHtml(rpt.enteredBy) + ' \u00b7 ' + formatDateTime(rpt.enteredAt) +
        '</div>' +
      '</div>';
    });

    body.innerHTML = html;
  };

  // ---------------------------------------------------------------------------
  // SECTION 12: Critical Alerts Render
  // ---------------------------------------------------------------------------
  window.renderCriticalAlerts = function () {
    var body = document.getElementById('critical-alerts-body');
    if (!body) return;
    var list = (window.state.criticalValues || []).filter(function (c) { return c.ackStatus === 'Pending'; });
    updateAlertBadge();
    if (list.length === 0) {
      body.innerHTML = '<div class="empty-msg">✅ No pending critical values — all acknowledged.</div>';
      return;
    }
    var html = '';
    list.forEach(function (crit) {
      var wardLine = crit.ward ? '<span style="font-size:0.78rem;">📍 ' + escHtml(crit.ward) + (crit.bed ? ' · ' + escHtml(crit.bed) : '') + '</span>' : '';
      html += '<div class="alert-card ac-danger">' +
        '<div class="alert-card-row">' +
          '<div class="alert-card-main">' +
            '<div class="alert-card-title">' + escHtml(crit.name) + ' &nbsp;<span class="badge b-critical">CRITICAL</span></div>' +
            '<div class="alert-card-sub">' + escHtml(crit.uhid) + ' &nbsp;·&nbsp; ' + escHtml(crit.dept) + ' &nbsp;·&nbsp; ' + escHtml(crit.test) + '</div>' +
            (crit.ward ? '<div style="font-size:0.77rem;margin-top:2px;">📍 ' + escHtml(crit.ward) + (crit.bed ? ' · ' + escHtml(crit.bed) : '') + '</div>' : '') +
          '</div>' +
          '<div style="text-align:right;">' +
            '<div class="alert-card-value">' + escHtml(crit.value) + '</div>' +
            '<div style="font-size:0.72rem;color:#991b1b;">Limit: ' + escHtml(crit.criticalLimit) + '</div>' +
          '</div>' +
        '</div>' +
        '<div class="alert-card-actions">' +
          '<button class="btn btn-primary btn-sm" style="background:#dc2626;border-color:#dc2626;" onclick="window.openCritAckModal(\'' + escAttr(crit.id) + '\')">📞 Acknowledge &amp; Log Callback</button>' +
          '<span style="font-size:0.75rem;color:#6b7280;">By: ' + escHtml(crit.reportedBy) + ' · ' + formatDateTime(crit.reportedAt) + '</span>' +
        '</div>' +
      '</div>';
    });
    body.innerHTML = html;
  };

  // ---------------------------------------------------------------------------
  // SECTION 13: Critical Ack Register Render
  // ---------------------------------------------------------------------------
  window.renderCritAckRegister = function () {
    var regBody = document.getElementById('crit-ack-register-body');
    if (!regBody) return;
    var list = window.state.criticalAckRegister || [];
    if (list.length === 0) {
      regBody.innerHTML = '<div class="empty-msg">No acknowledged critical values yet.</div>';
      return;
    }
    var html = '<div class="lis-tbl-wrap"><table class="lis-tbl"><thead><tr><th>ACK ID</th><th>Patient</th><th>Test</th><th>Value</th><th>Called To</th><th>Read-back</th><th>Response</th><th>By</th><th>At</th></tr></thead><tbody>';
    list.forEach(function (ack) {
      html += '<tr><td style="font-family:monospace;font-size:0.75rem;">' + escHtml(ack.id) + '</td><td>' + escHtml(ack.name) + '</td><td>' + escHtml(ack.test) + '</td><td style="font-weight:700;color:#dc2626;">' + escHtml(ack.value) + '</td><td>' + escHtml(ack.calledTo) + '</td><td>' + (ack.readBackConfirmed ? '<span class="badge b-pass">✅ Yes</span>' : '<span class="badge b-fail">❌ No</span>') + '</td><td>' + escHtml(ack.clinicianResponse) + '</td><td>' + escHtml(ack.ackedBy) + '</td><td>' + formatDateTime(ack.ackedAt) + '</td></tr>';
    });
    html += '</tbody></table></div>';
    regBody.innerHTML = html;
  };

  // ---------------------------------------------------------------------------
  // SECTION 14: Dispatch Log Render
  // ---------------------------------------------------------------------------
  window.renderDispatchLog = function () {
    var body = document.getElementById('dispatch-log-body');
    if (!body) return;
    var list = window.state.reportDispatchLog || [];
    if (list.length === 0) {
      body.innerHTML = '<div class="empty-msg">No dispatched reports today.</div>';
      return;
    }
    var html = '<table class="lis-tbl"><thead><tr><th>Dispatch ID</th><th>Patient</th><th>Test</th><th>Delivery Mode</th><th>Validated By</th><th>Status</th></tr></thead><tbody>';
    list.forEach(function (d) {
      var statusCls = d.status === 'Delivered' ? 'b-delivered' : 'b-dispatched';
      html += '<tr><td style="font-family:monospace;font-size:0.75rem;">' + escHtml(d.dispatchId) + '</td><td>' + escHtml(d.name) + '<br><span style="font-size:0.72rem;color:var(--text-muted);">' + escHtml(d.uhid) + '</span></td><td>' + escHtml(d.test) + '</td><td>' + escHtml(d.dispatchMode) + '</td><td>' + escHtml(d.validatedBy) + '</td><td><span class="badge ' + statusCls + '">' + escHtml(d.status) + '</span></td></tr>';
    });
    html += '</tbody></table>';
    body.innerHTML = html;
  };

  // ---------------------------------------------------------------------------
  // SECTION 15: EQAS Render
  // ---------------------------------------------------------------------------
  window.renderEqas = function () {
    var body = document.getElementById('eqas-body');
    if (!body) return;
    var list = window.state.eqasRegister || [];
    if (list.length === 0) { body.innerHTML = '<div class="empty-msg">No EQAS records.</div>'; return; }
    var html = '<table class="lis-tbl"><thead><tr><th>Scheme</th><th>Dept</th><th>Cycle</th><th>Score</th><th>Result</th><th>Remarks</th></tr></thead><tbody>';
    list.forEach(function (e) {
      var resultBadge = e.result === 'Satisfactory' ? '<span class="badge badge b-pass">Satisfactory</span>' : '<span class="badge badge b-fail">Needs Improvement</span>';
      html += '<tr><td>' + escHtml(e.scheme) + '</td><td>' + escHtml(e.dept) + '</td><td>' + escHtml(e.cycle) + '</td><td style="font-weight:700;">' + escHtml(e.score) + '</td><td>' + resultBadge + '</td><td style="font-size:0.78rem;">' + escHtml(e.remarks) + '</td></tr>';
    });
    html += '</tbody></table>';
    body.innerHTML = html;
  };

  // ---------------------------------------------------------------------------
  // SECTION 16: MLC Log Render
  // ---------------------------------------------------------------------------
  window.renderMlcLog = function () {
    var body = document.getElementById('mlc-log-body');
    if (!body) return;
    var list = (window.state.phlebotomyQueue || []).filter(function (q) { return q.mlcFlag; });
    if (list.length === 0) {
      body.innerHTML = '<div class="empty-msg">No MLC specimens registered today.</div>';
      return;
    }
    var html = '<table class="lis-tbl"><thead><tr><th>Accession</th><th>Patient</th><th>Tests</th><th>MLC Details</th><th>Status</th></tr></thead><tbody>';
    list.forEach(function (q) {
      html += '<tr><td style="font-family:monospace;font-size:0.78rem;">' + escHtml(q.accNo) + '</td><td>' + escHtml(q.name) + '<br><span style="font-size:0.72rem;">' + escHtml(q.uhid) + '</span></td><td>' + escHtml(q.tests.join(', ')) + '</td><td style="font-size:0.78rem;color:#7c3aed;">' + escHtml(q.mlcDetails || 'MLC - details not specified') + '</td><td><span class="badge badge-' + (q.status === 'Collected' ? 'collected' : 'queued') + '">' + escHtml(q.status) + '</span></td></tr>';
    });
    html += '</tbody></table>';
    body.innerHTML = html;
  };

  // ---------------------------------------------------------------------------
  // SECTION 17: Rejection & Recollection Sub-tabs
  // ---------------------------------------------------------------------------
  var _rejectionSubTab = 'rejection';

  window.switchRejectionSubTab = function (tab) {
    _rejectionSubTab = tab;
    document.getElementById('subtab-rejection').classList.toggle('active', tab === 'rejection');
    document.getElementById('subtab-recollection').classList.toggle('active', tab === 'recollection');
    renderRejectionSubTab(tab);
  };

  function renderRejectionSubTab(tab) {
    var body = document.getElementById('rejection-subtab-content');
    if (!body) return;
    if (tab === 'rejection') {
      var list = window.state.rejectionRegister || [];
      if (list.length === 0) { body.innerHTML = '<div class="empty-msg">No rejections on record.</div>'; return; }
      var html = '<table class="lis-tbl"><thead><tr><th>Accession</th><th>Patient</th><th>Test</th><th>Reason</th><th>By</th><th>Recollection</th></tr></thead><tbody>';
      list.forEach(function (r) {
        html += '<tr><td style="font-family:monospace;font-size:0.78rem;">' + escHtml(r.accNo) + '</td><td>' + escHtml(r.name) + '</td><td>' + escHtml(r.test) + '</td><td style="color:#dc2626;font-size:0.78rem;">' + escHtml(r.reason) + '</td><td>' + escHtml(r.rejectedBy) + '</td><td><span class="badge ' + (r.recollectionStatus === 'Recollected' ? 'badge b-collected' : 'badge b-urgent') + '">' + escHtml(r.recollectionStatus) + '</span></td></tr>';
      });
      html += '</tbody></table>';
      body.innerHTML = html;
    } else {
      var list2 = window.state.recollectionAlerts || [];
      if (list2.length === 0) { body.innerHTML = '<div class="empty-msg">No pending recollection alerts.</div>'; return; }
      var html2 = '<table class="lis-tbl"><thead><tr><th>Accession</th><th>Patient</th><th>Test</th><th>Reason</th><th>Contact</th><th>Status</th><th>Action</th></tr></thead><tbody>';
      list2.forEach(function (r) {
        html2 += '<tr><td style="font-family:monospace;font-size:0.78rem;">' + escHtml(r.accNo) + '</td><td>' + escHtml(r.name) + '</td><td>' + escHtml(r.test) + '</td><td style="font-size:0.78rem;color:#d97706;">' + escHtml(r.reason) + '</td><td>' + escHtml(r.contactNo || 'N/A') + '</td><td><span class="badge badge b-urgent">' + escHtml(r.status) + '</span></td><td><button class="btn btn-primary btn-sm" onclick="window.markRecollected(\'' + r.id + '\')">✅ Mark Done</button></td></tr>';
      });
      html2 += '</tbody></table>';
      body.innerHTML = html2;
    }
  }

  // ---------------------------------------------------------------------------
  // SECTION 18: Sample Storage Render
  // ---------------------------------------------------------------------------
  function renderStorageBody() {
    var body = document.getElementById('storage-body');
    if (!body) return;
    var list = window.state.lisSampleStorage || [];
    if (list.length === 0) { body.innerHTML = '<div class="empty-msg">No storage records.</div>'; return; }
    var html = '<table class="lis-tbl"><thead><tr><th>Spec ID</th><th>Location</th><th>Stored At</th><th>Retain Till</th><th>Days</th></tr></thead><tbody>';
    list.forEach(function (s) {
      html += '<tr><td style="font-family:monospace;font-size:0.78rem;">' + escHtml(s.specId) + '</td><td style="font-size:0.78rem;">' + escHtml(s.location) + '</td><td>' + formatDateTime(s.storedAt) + '</td><td>' + escHtml(s.retainTill) + '</td><td>' + s.retentionDays + 'd</td></tr>';
    });
    html += '</tbody></table>';
    body.innerHTML = html;
  }

  // ---------------------------------------------------------------------------
  // SECTION 19: Verbal Orders Render
  // ---------------------------------------------------------------------------
  window.renderVerbalOrders = function () {
    var body = document.getElementById('verbal-orders-body');
    if (!body) return;
    var list = window.state.verbalLabOrders || [];
    if (list.length === 0) {
      body.innerHTML = '<div class="empty-msg"><div class="empty-msg-icon">📞</div>No verbal orders pending co-signature</div>';
      return;
    }
    var html = '';
    var now = Date.now();
    list.forEach(function (vo) {
      var orderedAt = new Date(vo.orderedAt).getTime();
      var hoursElapsed = (now - orderedAt) / 3600000;
      var isOverdue = hoursElapsed > 24;
      var overdueClass = isOverdue ? 'alert-card ac-danger' : 'alert-card ac-warn';
      var overdueLabel = isOverdue 
        ? '<span class="badge b-critical">OVERDUE ' + Math.floor(hoursElapsed) + 'h</span>' 
        : '<span class="badge b-urgent">' + Math.max(0, Math.round(24 - hoursElapsed)) + 'h remaining</span>';
      
      html += '<div class="' + overdueClass + '" style="margin-bottom:8px;">' +
        '<div class="alert-card-row">' +
          '<div class="alert-card-main">' +
            '<div class="alert-card-title"><strong>' + escHtml(vo.patientName) + '</strong> &nbsp;' + overdueLabel + '</div>' +
            '<div class="alert-card-sub">Order ID: ' + escHtml(vo.orderId) + ' &nbsp;·&nbsp; Patient Type: ' + escHtml(vo.patientType || 'IPD') + '</div>' +
            '<div style="font-size:0.77rem;margin-top:2px;">🧪 Tests: <strong>' + escHtml((vo.tests || []).join(', ')) + '</strong></div>' +
            '<div style="font-size:0.74rem;color:var(--text-muted);margin-top:2px;">Requested by Nurse: <em>' + escHtml(vo.nurseName || 'N/A') + '</em> · Ordered At: ' + formatDateTime(vo.orderedAt) + '</div>' +
          '</div>' +
          '<div style="text-align:right;">' +
            '<div style="font-size:0.8rem;font-weight:600;color:#1e293b;">Physician:</div>' +
            '<div style="font-size:0.78rem;color:#475569;">' + escHtml(vo.orderingPhysician) + '</div>' +
          '</div>' +
        '</div>' +
        '<div class="alert-card-actions" style="margin-top:8px;display:flex;justify-content:space-between;align-items:center;">' +
          '<button class="btn btn-primary btn-sm" onclick="window.openVerbalCosignModal(\'' + vo.orderId + '\')">✍️ Co-sign Order</button>' +
          '<span style="font-size:0.72rem;color:var(--text-muted);">Read-back confirmed: Yes</span>' +
        '</div>' +
      '</div>';
    });
    body.innerHTML = html;
  };

  // ---------------------------------------------------------------------------
  // SECTION 20: QC Sub-tabs Render
  // ---------------------------------------------------------------------------
  var _qcSubTab = 'iqc';

  window.switchQcSubTab = function (tab) {
    _qcSubTab = tab;
    ['iqc', 'reagents', 'outsource', 'equipment'].forEach(function (t) {
      var el = document.getElementById('qc-subtab-' + t);
      if (el) el.classList.toggle('active', t === tab);
    });
    renderQcSubTab(tab);
  };

  function renderQcSubTab(tab) {
    var body = document.getElementById('qc-subtab-content');
    if (!body) return;

    if (tab === 'iqc') {
      var list = window.state.qcLog || [];
      if (list.length === 0) { body.innerHTML = '<div class="empty-msg">No IQC records.</div>'; return; }
      var html = '<table class="lis-tbl"><thead><tr><th>Date</th><th>Instrument</th><th>Dept</th><th>Control Level</th><th>Lot</th><th>Mean</th><th>SD</th><th>CV%</th><th>Status</th><th>Analyst</th><th>Comments</th></tr></thead><tbody>';
      list.forEach(function (q) {
        var statusBadge = q.status === 'Pass' ? '<span class="badge badge b-pass">✅ Pass</span>' : '<span class="badge badge b-fail">❌ Fail</span>';
        var holdHtml = q.iqcHold ? '<div class="iqc-hold-warning" style="margin-top:4px;font-size:0.72rem;">IQC Hold Active</div>' : '';
        html += '<tr><td>' + escHtml(q.date) + '</td><td style="font-size:0.78rem;">' + escHtml(q.instrument) + '</td><td>' + escHtml(q.dept) + '</td><td>' + escHtml(q.controlLevel) + '</td><td style="font-family:monospace;font-size:0.78rem;">' + escHtml(q.lotNo) + '</td><td>' + escHtml(q.meanValue) + '</td><td>' + escHtml(q.sdValue) + '</td><td>' + escHtml(q.cvPercent) + '%</td><td>' + statusBadge + holdHtml + '</td><td>' + escHtml(q.analyst) + '</td><td style="font-size:0.78rem;">' + escHtml(q.comments) + '</td></tr>';
      });
      html += '</tbody></table>';
      body.innerHTML = html;
    } else if (tab === 'reagents') {
      var list2 = window.state.reagentAlerts || [];
      if (list2.length === 0) { body.innerHTML = '<div class="empty-msg">No reagent alerts.</div>'; return; }
      var html2 = '<div class="iqc-hold-warning" style="margin-bottom:12px;"><strong>⚠️ ' + list2.length + ' reagent(s) below reorder level.</strong> Place procurement orders immediately.</div>';
      html2 += '<table class="lis-tbl"><thead><tr><th>Reagent</th><th>Instrument</th><th>Current Stock</th><th>Reorder Level</th><th>Status</th><th>Last Order</th><th>Vendor</th><th>Action</th></tr></thead><tbody>';
      list2.forEach(function (r) {
        html2 += '<tr><td>' + escHtml(r.reagent) + '</td><td style="font-size:0.78rem;">' + escHtml(r.instrument) + '</td><td style="color:#dc2626;font-weight:700;">' + escHtml(r.currentStock) + '</td><td>' + escHtml(r.reorderLevel) + '</td><td><span class="badge badge b-fail">Low Stock</span></td><td>' + escHtml(r.lastOrderDate) + '</td><td style="font-size:0.78rem;">' + escHtml(r.vendor) + '</td><td><button class="btn btn-primary btn-sm">📋 Order Now</button></td></tr>';
      });
      html2 += '</tbody></table>';
      body.innerHTML = html2;
    } else if (tab === 'outsource') {
      var list3 = window.state.outsourceRegister || [];
      if (list3.length === 0) { body.innerHTML = '<div class="empty-msg">No outsourced specimens.</div>'; return; }
      var html3 = '<table class="lis-tbl"><thead><tr><th>Out ID</th><th>Patient</th><th>Test</th><th>Reference Lab</th><th>Dispatched</th><th>Expected TAT</th><th>Tracking</th><th>Status</th><th>Action</th></tr></thead><tbody>';
      list3.forEach(function (o) {
        html3 += '<tr><td style="font-family:monospace;font-size:0.78rem;">' + escHtml(o.accNo) + '</td><td>' + escHtml(o.name) + '<br><span style="font-size:0.72rem;color:var(--text-muted);">' + escHtml(o.uhid) + '</span></td><td>' + escHtml(o.testName) + '</td><td>' + escHtml(o.labName) + '</td><td>' + formatDateTime(o.dispatchedAt) + '</td><td>' + formatDateTime(o.expectedTat) + '</td><td style="font-family:monospace;font-size:0.78rem;" style="font-size:0.78rem;">' + escHtml(o.trackingId) + '</td><td><span class="badge badge b-dispatched">' + escHtml(o.status) + '</span></td><td><button class="btn btn-secondary btn-sm" onclick="window.openUploadReferralModal(\'' + o.id + '\')">📎 Upload</button></td></tr>';
      });
      html3 += '</tbody></table>';
      body.innerHTML = html3;
    } else if (tab === 'equipment') {
      var list4 = window.state.lisEquipments || [];
      if (list4.length === 0) { body.innerHTML = '<div class="empty-msg">No equipment records.</div>'; return; }
      var html4 = '<table class="lis-tbl"><thead><tr><th>Equipment</th><th>Dept</th><th>Status</th><th>Last Calibrated</th><th>Next PM</th><th>Vendor</th></tr></thead><tbody>';
      list4.forEach(function (eq) {
        var statusClass = eq.status === 'Operational' ? 'equipment-status-operational' : 'equipment-status-hold';
        html4 += '<tr><td>' + escHtml(eq.name) + '</td><td>' + escHtml(eq.dept) + '</td><td class="' + statusClass + '">' + escHtml(eq.status) + '</td><td>' + formatDateTime(eq.lastCalibrated) + '</td><td>' + escHtml(eq.nextPM) + '</td><td style="font-size:0.78rem;">' + escHtml(eq.vendor) + '</td></tr>';
      });
      html4 += '</tbody></table>';
      body.innerHTML = html4;
    }
  }

  // ---------------------------------------------------------------------------
  // SECTION 21: Analytics / TAT Compliance Render
  // ---------------------------------------------------------------------------
  var _analyticsDept = 'All';

  function renderAnalyticsDeptTabs() {
    var tabsEl = document.getElementById('analytics-dept-tabs');
    if (!tabsEl) return;
    var depts = ['All', 'Haematology', 'Biochemistry', 'Serology', 'Microbiology', 'Histopathology', 'Clinical Pathology'];
    tabsEl.innerHTML = depts.map(function (d) {
      return '<button class="dept-tab' + (d === _analyticsDept ? ' active' : '') + '" onclick="window.switchAnalyticsDept(\'' + escAttr(d) + '\')">' + escHtml(d) + '</button>';
    }).join('');
  }

  window.switchAnalyticsDept = function (dept) {
    _analyticsDept = dept;
    renderAnalyticsDeptTabs();
    renderAnalytics(dept);
  };

  window.renderAnalytics = function (dept) {
    var body = document.getElementById('analytics-body');
    if (!body) return;

    var worklist = (window.state.processingWorklist || []).filter(function (s) {
      return dept === 'All' || s.dept === dept;
    });

    var queueFiltered = (window.state.phlebotomyQueue || []).filter(function (q) {
      return dept === 'All' || q.dept === dept;
    });

    var totalQueued = queueFiltered.filter(function (q) { return q.status === 'Queued'; }).length;
    var totalCollected = queueFiltered.filter(function (q) { return q.status === 'Collected'; }).length;
    var totalProcessing = worklist.filter(function (s) { return s.status === 'In Progress'; }).length;
    var pendingResult = worklist.filter(function (s) { return s.status === 'Pending Result'; }).length;

    var tatData = worklist.map(function (s) {
      return { name: s.name, dept: s.dept, tests: s.tests, tat: s.tat, pct: estimateTatPct(s.receivedAt, s.tat), stage: s.stage };
    });

    var deptBreakdown = {};
    worklist.forEach(function (s) {
      if (!deptBreakdown[s.dept]) deptBreakdown[s.dept] = { total: 0, inProgress: 0, pendingResult: 0 };
      deptBreakdown[s.dept].total++;
      if (s.status === 'In Progress') deptBreakdown[s.dept].inProgress++;
      if (s.status === 'Pending Result') deptBreakdown[s.dept].pendingResult++;
    });

    var html = '<div class="two-col-section">';

    // Summary KPIs
    html += '<div><div class="section-divider">Workflow Summary' + (dept !== 'All' ? ' — ' + escHtml(dept) : '') + '</div>';
    html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:12px;">';
    html += '<div class="kpi-card"><div class="kpi-value" style="font-size:1.5rem;">' + totalQueued + '</div><div class="kpi-label">Queued</div></div>';
    html += '<div class="kpi-card"><div class="kpi-value" style="font-size:1.5rem;">' + totalCollected + '</div><div class="kpi-label">Collected</div></div>';
    html += '<div class="kpi-card"><div class="kpi-value" style="font-size:1.5rem;">' + totalProcessing + '</div><div class="kpi-label">Processing</div></div>';
    html += '<div class="kpi-card"><div class="kpi-value" style="font-size:1.5rem;">' + pendingResult + '</div><div class="kpi-label">Pending Result</div></div>';
    html += '</div>';

    // Dept breakdown table
    if (Object.keys(deptBreakdown).length > 0) {
      html += '<div class="section-divider">Department Breakdown</div>';
      html += '<table class="lis-tbl"><thead><tr><th>Department</th><th>Total</th><th>In Progress</th><th>Pending Result</th></tr></thead><tbody>';
      Object.keys(deptBreakdown).forEach(function (d) {
        var dd = deptBreakdown[d];
        html += '<tr><td>' + escHtml(d) + '</td><td>' + dd.total + '</td><td>' + dd.inProgress + '</td><td>' + dd.pendingResult + '</td></tr>';
      });
      html += '</tbody></table>';
    }
    html += '</div>';

    // TAT Compliance
    html += '<div><div class="section-divider">TAT Compliance Tracker</div>';
    if (tatData.length === 0) {
      html += '<div class="empty-msg">No specimens to track.</div>';
    } else {
      tatData.forEach(function (item) {
        var barColor = item.pct < 60 ? 'tat-ok' : item.pct < 85 ? 'tat-warn' : 'tat-breach';
        var barLabel = item.pct < 60 ? '✅ On Track' : item.pct < 85 ? '⚠️ Warning' : '🔴 TAT Breach Risk';
        html += '<div style="margin-bottom:10px;">';
        html += '<div style="display:flex;justify-content:space-between;font-size:0.82rem;margin-bottom:3px;"><span><strong>' + escHtml(item.name) + '</strong> — ' + escHtml(item.tests.join(', ')) + '</span><span>' + barLabel + '</span></div>';
        html += '<div class="tat-bar-wrap"><div class="tat-bar ' + barColor + '" style="width:' + item.pct + '%;"></div></div>';
        html += '<div style="font-size:0.72rem;color:var(--text-muted);margin-top:2px;">Stage: ' + escHtml(item.stage) + ' · TAT: ' + item.tat + 'h · Elapsed: ~' + Math.round(item.pct * item.tat / 100 * 10) / 10 + 'h</div>';
        html += '</div>';
      });
    }
    html += '</div>';

    html += '</div>'; // two-col-section
    body.innerHTML = html;
  };

  // ---------------------------------------------------------------------------
  // SECTION 22: Audit Log Render
  // ---------------------------------------------------------------------------
  window.renderAuditLog = function () {
    var body = document.getElementById('audit-log-body');
    if (!body) return;
    var searchEl = document.getElementById('audit-search');
    var search = searchEl ? searchEl.value.toLowerCase().trim() : '';

    var list = (window.state.lisAuditLogs || []).filter(function (log) {
      if (!search) return true;
      return (log.logId + ' ' + log.user + ' ' + log.action + ' ' + log.details + ' ' + log.role).toLowerCase().indexOf(search) !== -1;
    });

    if (list.length === 0) {
      body.innerHTML = '<div class="empty-msg">No audit log entries found.</div>';
      return;
    }

    var html = '<table class="lis-tbl"><thead><tr><th>Log ID</th><th>Timestamp</th><th>User</th><th>Role</th><th>Action</th><th>Details</th><th>IP Address</th></tr></thead><tbody>';
    list.forEach(function (log) {
      html += '<tr><td style="font-family:monospace;font-size:0.78rem;">' + escHtml(log.logId) + '</td><td style="white-space:nowrap;">' + formatDateTime(log.timestamp) + '</td><td>' + escHtml(log.user) + '</td><td style="font-size:0.78rem;">' + escHtml(log.role) + '</td><td><strong>' + escHtml(log.action) + '</strong></td><td style="font-size:0.78rem;">' + escHtml(log.details) + '</td><td style="font-family:monospace;font-size:0.78rem;" style="font-size:0.75rem;">' + escHtml(log.ipAddress || '') + '</td></tr>';
    });
    html += '</tbody></table>';
    body.innerHTML = html;
  };

  // ---------------------------------------------------------------------------
  // SECTION 23: Notifiable Disease Log Render
  // ---------------------------------------------------------------------------
  function renderNotifiableDiseases() {
    var body = document.getElementById('notifiable-body');
    if (!body) return;
    var list = window.state.notifiableDiseaseLog || [];
    if (list.length === 0) { body.innerHTML = '<div class="empty-msg">No notifiable disease reports.</div>'; return; }
    var html = '<table class="lis-tbl"><thead><tr><th>ID</th><th>Patient</th><th>Disease</th><th>Result</th><th>Reported To</th><th>By</th><th>Status</th></tr></thead><tbody>';
    list.forEach(function (n) {
      html += '<tr><td style="font-family:monospace;font-size:0.78rem;">' + escHtml(n.id) + '</td><td>' + escHtml(n.name) + '<br><span style="font-size:0.72rem;">' + escHtml(n.uhid) + '</span></td><td style="font-weight:700;color:#7c3aed;">' + escHtml(n.disease) + '</td><td>' + escHtml(n.result) + '</td><td style="font-size:0.78rem;">' + escHtml(n.reportedToAuthority) + '</td><td>' + escHtml(n.reportedBy) + '</td><td><span class="badge badge b-collected">Reported</span></td></tr>';
    });
    html += '</tbody></table>';
    body.innerHTML = html;
  }

  // ---------------------------------------------------------------------------
  // SECTION 24: Blood Bank Render
  // ---------------------------------------------------------------------------
  function renderBloodStockTable() {
    var tbody = document.getElementById('blood-stock-tbody');
    if (!tbody) return;
    var list = window.state.bloodStock || [];
    var html = '';
    list.forEach(function (row) {
      function stockCell(val, threshold) {
        var cls = val <= threshold ? 'blood-stock-low' : 'blood-stock-ok';
        return '<td class="blood-stock-cell"><span class="' + cls + '">' + val + '</span></td>';
      }
      html += '<tr><td style="font-weight:700;">' + escHtml(row.blood_group) + '</td>' +
        stockCell(row.packed_red_cells, 3) +
        stockCell(row.platelets, 2) +
        stockCell(row.ffp, 2) +
        stockCell(row.cryoprecipitate, 1) +
        '</tr>';
    });
    tbody.innerHTML = html;
  }

  function renderBloodCrossMatches() {
    var tbody = document.getElementById('blood-cm-tbody');
    if (!tbody) return;
    var list = window.state.bloodBankCrossMatches || [];
    var html = '';
    list.forEach(function (cm) {
      var statusBadge = cm.status.indexOf('Ready') !== -1
        ? '<span class="badge badge b-collected">' + escHtml(cm.status) + '</span>'
        : '<span class="badge badge b-urgent">' + escHtml(cm.status) + '</span>';
      html += '<tr><td>' + escHtml(cm.name) + '</td><td style="font-family:monospace;font-size:0.78rem;">' + escHtml(cm.uhid) + '</td><td style="font-weight:700;">' + escHtml(cm.blood_group) + '</td><td>' + escHtml(cm.product) + '</td><td>' + cm.units_requested + '</td><td>' + cm.units_crossmatched + '</td><td>' + statusBadge + '</td><td>' + escHtml(cm.ordered_by) + '</td></tr>';
    });
    tbody.innerHTML = html;
  }

  // ===========================================================================
  // SECTION 25: BUSINESS LOGIC FUNCTIONS
  // ===========================================================================

  // --- Role helper ---
  window.getRequiredSpecialistRole = function (dept) {
    var map = {
      'Haematology': 'Pathologist',
      'Biochemistry': 'Biochemist',
      'Serology': 'Pathologist',
      'Clinical Pathology': 'Pathologist',
      'Histopathology': 'Histopathologist',
      'Cytology': 'Histopathologist',
      'Microbiology': 'Microbiologist',
      'Outsourced': 'Pathologist'
    };
    return map[dept] || 'Pathologist';
  };

  // --- Test master lookup ---
  window.getTestByCode = function (code) {
    return (window.state.lisTestMaster || []).find(function (t) { return t.code === code; });
  };

  // --- Package expansion ---
  window.expandPackageTests = function (packageId) {
    var pkg = (window.state.testPackages || []).find(function (p) { return p.id === packageId; });
    if (!pkg) return [];
    return pkg.tests.map(function (code) { return window.getTestByCode(code); }).filter(Boolean);
  };

  // --- New Order Modal ---
  window.openNewOrderModal = function () {
    var modal = document.getElementById('new-lab-order-modal');
    if (modal) {
      modal.style.display = 'block';
      window.onCatalogTypeChange();
      window.onOrdTypeChange();
    }
  };

  window.closeNewOrderModal = function () {
    var modal = document.getElementById('new-lab-order-modal');
    if (modal) modal.style.display = 'none';
  };

  window.switchOrdPatientType = function (type) {
    document.getElementById('ord-patient-type').value = type;
    ['OPD', 'IPD', 'External'].forEach(function (t) {
      var btn = document.getElementById('ptab-' + t.toLowerCase());
      if (btn) btn.classList.toggle('active', t === type);
    });
    window.onOrdTypeChange();
  };

  window.onOrdTypeChange = function () {
    var type = document.getElementById('ord-patient-type') ? document.getElementById('ord-patient-type').value : 'OPD';
    var opdSec = document.getElementById('ord-opd-section');
    var ipdSec = document.getElementById('ord-ipd-section');
    var extSec = document.getElementById('ord-external-section');
    var homeSec = document.getElementById('home-collection-section');
    var bookingChannel = document.getElementById('booking-channel-select') ? document.getElementById('booking-channel-select').value : 'Walk-in';

    if (opdSec) opdSec.style.display = type === 'OPD' ? 'block' : 'none';
    if (ipdSec) ipdSec.style.display = type === 'IPD' ? 'block' : 'none';
    if (extSec) extSec.style.display = type === 'External' ? 'block' : 'none';
    if (homeSec) homeSec.style.display = (type === 'External' && bookingChannel === 'Home Collection') ? 'block' : 'none';
  };

  window.switchOpdBookingSource = function (src) {
    var srcInput = document.getElementById('opd-booking-source');
    if (srcInput) srcInput.value = src;
    ['digital', 'carry'].forEach(function (s) {
      var btn = document.getElementById('opd-src-btn-' + s);
      if (btn) btn.classList.toggle('active', s === src);
    });
    var digSec = document.getElementById('opd-digital-section');
    var carSec = document.getElementById('opd-carry-section');
    if (digSec) digSec.style.display = src === 'digital' ? 'block' : 'none';
    if (carSec) carSec.style.display = src === 'carry' ? 'block' : 'none';
  };

  window.onVerbalOrderToggle = function () {
    var chk = document.getElementById('chk-verbal-order');
    var sec = document.getElementById('verbal-order-section');
    if (sec) sec.style.display = (chk && chk.checked) ? 'block' : 'none';

    var chkIpd = document.getElementById('chk-ipd-verbal');
    var secIpd = document.getElementById('verbal-order-section-ipd');
    if (secIpd) secIpd.style.display = (chkIpd && chkIpd.checked) ? 'block' : 'none';
  };

  window.onCatalogTypeChange = function () {
    var ct = document.getElementById('catalog-type-select') ? document.getElementById('catalog-type-select').value : 'Individual';
    var indDiv = document.getElementById('individual-test-section');
    var pkgDiv = document.getElementById('package-test-section');
    var addonDiv = document.getElementById('addon-test-section');
    if (indDiv) indDiv.style.display = ct === 'Individual' ? 'block' : 'none';
    if (pkgDiv) pkgDiv.style.display = ct === 'Package' ? 'block' : 'none';
    if (addonDiv) addonDiv.style.display = ct === 'Add-on' ? 'block' : 'none';
    window.onTestOrPackageSelect();
  };

  window.onTestOrPackageSelect = function () {
    var ct = document.getElementById('catalog-type-select') ? document.getElementById('catalog-type-select').value : 'Individual';
    var expandDiv = document.getElementById('package-expanded-display');
    var prepDiv = document.getElementById('prep-instructions-notice');
    var costDiv = document.getElementById('cost-estimate-display');
    var totalCost = 0;
    var prepNotes = [];
    var expandHTML = '';

    if (ct === 'Package') {
      var pkgSel = document.getElementById('package-select');
      if (pkgSel && pkgSel.value) {
        var tests = window.expandPackageTests(pkgSel.value);
        var pkg = (window.state.testPackages || []).find(function (p) { return p.id === pkgSel.value; });
        if (pkg) totalCost = pkg.price;
        expandHTML = '<div class="section-divider">Package Contents</div><ul style="margin:0;padding-left:18px;font-size:0.85rem;">';
        tests.forEach(function (t) {
          expandHTML += '<li>' + escHtml(t.name) + ' <span style="color:var(--text-muted);">(' + escHtml(t.dept) + ', TAT: ' + t.tat + 'h)</span></li>';
          if (t.prepInstructions) prepNotes.push(t.prepInstructions);
        });
        expandHTML += '</ul>';
      }
    } else {
      var testSel = ct === 'Add-on' ? document.getElementById('addon-test-select') : document.getElementById('test-select');
      if (testSel && testSel.value) {
        var t2 = window.getTestByCode(testSel.value);
        if (t2) {
          totalCost = t2.price;
          if (t2.prepInstructions) prepNotes.push(t2.prepInstructions);
          expandHTML = '<div class="section-divider">Selected Test</div><p style="font-size:0.85rem;margin:4px 0;">' + escHtml(t2.name) + ' &mdash; ' + escHtml(t2.dept) + ' | TAT: ' + t2.tat + 'h | Tube: ' + escHtml(t2.tubeColor) + '</p>';
        }
      }
    }

    if (expandDiv) expandDiv.innerHTML = expandHTML;

    if (prepDiv) {
      var unique = prepNotes.filter(function (v, i, a) { return a.indexOf(v) === i; });
      prepDiv.innerHTML = unique.length > 0 ? '<strong>Preparation Instructions:</strong><ul style="margin:4px 0 0;padding-left:18px;">' + unique.map(function (n) { return '<li>' + escHtml(n) + '</li>'; }).join('') + '</ul>' : '';
      prepDiv.style.display = unique.length > 0 ? 'block' : 'none';
    }

    if (costDiv) {
      var gst = Math.round(totalCost * 0.18);
      costDiv.innerHTML = totalCost > 0 ? 'Estimated Cost: <strong>₹' + totalCost.toLocaleString('en-IN') + '</strong> + GST ₹' + gst.toLocaleString('en-IN') + ' = <strong>₹' + (totalCost + gst).toLocaleString('en-IN') + '</strong> <small style="color:var(--text-muted);">(GST 18% applicable for diagnostic services)</small>' : '';
      costDiv.style.display = totalCost > 0 ? 'block' : 'none';
    }
  };

  window.onBookingChannelChange = function () {
    var ch = document.getElementById('booking-channel-select') ? document.getElementById('booking-channel-select').value : 'Walk-in';
    var homeFields = document.getElementById('home-collection-section');
    if (homeFields) homeFields.style.display = ch === 'Home Collection' ? 'block' : 'none';
  };

  // --- Submit Lab Order ---
  window.submitLabOrder = function () {
    var patType = document.getElementById('ord-patient-type') ? document.getElementById('ord-patient-type').value : 'OPD';
    
    // Resolve physician based on patient type
    var physician = '';
    if (patType === 'IPD') {
      physician = document.getElementById('ord-ipd-doctor') ? document.getElementById('ord-ipd-doctor').value.trim() : '';
    } else if (patType === 'OPD') {
      physician = document.getElementById('ord-opd-doctor') ? document.getElementById('ord-opd-doctor').value.trim() : '';
    } else {
      physician = document.getElementById('ord-ext-refdr') ? document.getElementById('ord-ext-refdr').value.trim() : 'External Referral';
    }
    if (!physician) physician = 'Dr. Attending';

    var catalogType = document.getElementById('ord-catalog-type') ? document.getElementById('ord-catalog-type').value : 'Individual';
    var tests = [];

    if (catalogType === 'Individual') {
      var testCode = document.getElementById('ord-test-individual') ? document.getElementById('ord-test-individual').value : '';
      if (!testCode) { alert('Please select a test.'); return; }
      tests = [testCode];
    } else if (catalogType === 'Package') {
      var packageId = document.getElementById('ord-package-select') ? document.getElementById('ord-package-select').value : '';
      if (!packageId) { alert('Please select a package.'); return; }
      var pkg = (window.state.testPackages || []).find(function (p) { return p.id === packageId; });
      if (pkg) tests = pkg.tests;
    } else if (catalogType === 'Addon') {
      var addCode = document.getElementById('ord-addon-test') ? document.getElementById('ord-addon-test').value : '';
      if (!addCode) { alert('Please select an add-on test.'); return; }
      tests = [addCode];
    }

    var accNo = 'ACC-' + new Date().getFullYear() + '-' + String(Math.floor(Math.random() * 900000) + 100000);
    
    var isVerbal = false;
    var nurseName = '';
    if (patType === 'IPD') {
      isVerbal = !!(document.getElementById('chk-ipd-verbal') && document.getElementById('chk-ipd-verbal').checked);
      nurseName = document.getElementById('ord-ipd-nurse') ? document.getElementById('ord-ipd-nurse').value.trim() : '';
    } else if (patType === 'OPD') {
      isVerbal = !!(document.getElementById('chk-verbal-order') && document.getElementById('chk-verbal-order').checked);
      nurseName = document.getElementById('ord-nurse-name') ? document.getElementById('ord-nurse-name').value.trim() : '';
    }

    var mlcFlag = !!(document.getElementById('chk-mlc-order') && document.getElementById('chk-mlc-order').checked);
    var mlcDetails = mlcFlag && document.getElementById('ord-mlc-ref') ? document.getElementById('ord-mlc-ref').value.trim() : '';
    var channel = patType === 'External' ? (document.getElementById('booking-channel-select') ? document.getElementById('booking-channel-select').value : 'Walk-in') : 'Walk-in';
    var billingStatus = (patType === 'IPD') ? 'Cleared' : (document.getElementById('ord-billing-status') ? document.getElementById('ord-billing-status').value : 'Cleared');
    var payer = document.getElementById('ord-payer') ? document.getElementById('ord-payer').value : 'Self Pay';

    var firstTest = window.getTestByCode(tests[0]);
    var dept = firstTest ? firstTest.dept : 'General';

    var patientName = 'Walk-in Patient';
    var uhid = 'UH-NEW-' + Date.now();
    var age = 30;
    var gender = 'M';
    var ward = '';
    var bedNo = '';
    var homeAddress = '';
    var collectionSlot = '';

    if (patType === 'IPD') {
      var ipdSel = document.getElementById('ord-ipd-patient');
      if (ipdSel && ipdSel.selectedIndex > 0) {
        patientName = ipdSel.options[ipdSel.selectedIndex].text.split('(')[0].trim();
        uhid = ipdSel.value;
        var ptObj = (window.state.patients || []).find(function(p) { return p.uhid === uhid; });
        if (ptObj) {
          age = ptObj.age || age;
          gender = ptObj.gender || gender;
          ward = ptObj.ward || '';
          bedNo = ptObj.bed || '';
        }
      } else {
        alert('Please select an admitted IPD patient.');
        return;
      }
    } else if (patType === 'OPD') {
      var opdSrc = document.getElementById('opd-booking-source') ? document.getElementById('opd-booking-source').value : 'digital';
      if (opdSrc === 'digital') {
        var opdSel = document.getElementById('ord-opd-patient');
        if (opdSel && opdSel.selectedIndex > 0) {
          patientName = opdSel.options[opdSel.selectedIndex].text.split('(')[0].trim();
          uhid = opdSel.value;
          var ptObj = (window.state.patients || []).find(function(p) { return p.uhid === uhid; });
          if (ptObj) {
            age = ptObj.age || age;
            gender = ptObj.gender || gender;
          }
        } else {
          alert('Please select a registered OPD patient.');
          return;
        }
      } else {
        var carrySearch = document.getElementById('opd-carry-search') ? document.getElementById('opd-carry-search').value.trim() : '';
        if (!carrySearch) { alert('Please enter Patient Name / UHID.'); return; }
        patientName = carrySearch;
        uhid = 'UH-OPD-' + String(Math.floor(Math.random() * 90000) + 10000);
        var ptObj = (window.state.patients || []).find(function(p) { return p.uhid === carrySearch || p.name.toLowerCase().indexOf(carrySearch.toLowerCase()) !== -1; });
        if (ptObj) {
          patientName = ptObj.name;
          uhid = ptObj.uhid;
          age = ptObj.age || age;
          gender = ptObj.gender || gender;
        }
      }
    } else {
      var extName = document.getElementById('ord-ext-name') ? document.getElementById('ord-ext-name').value.trim() : '';
      var extMobile = document.getElementById('ord-ext-mobile') ? document.getElementById('ord-ext-mobile').value.trim() : '';
      if (!extName || !extMobile) { alert('Patient Name and Mobile are required for External bookings.'); return; }
      patientName = extName;
      uhid = 'UH-EXT-' + String(Math.floor(Math.random() * 90000) + 10000);
      if (channel === 'Home Collection') {
        homeAddress = document.getElementById('ord-hc-address') ? document.getElementById('ord-hc-address').value.trim() : '';
        collectionSlot = document.getElementById('ord-hc-slot') ? document.getElementById('ord-hc-slot').value.trim() : '';
        if (!homeAddress) { alert('Address is required for Home Collection.'); return; }
      }
    }

    var newEntry = {
      accNo: accNo,
      uhid: uhid,
      name: patientName,
      age: age,
      gender: (gender === 'Female' || gender === 'F') ? 'F' : 'M',
      patientType: patType,
      ward: ward,
      bedNo: bedNo,
      dept: dept,
      tests: tests,
      status: 'Queued',
      priority: document.getElementById('ord-priority') ? document.getElementById('ord-priority').value : 'Routine',
      bookedAt: new Date().toISOString(),
      collectedBy: null,
      collectionTime: null,
      tubeColor: firstTest ? firstTest.tubeColor : 'yellow',
      mlcFlag: mlcFlag,
      mlcDetails: mlcDetails,
      bookingChannel: channel,
      refDoctor: physician,
      isVerbalOrder: isVerbal,
      billingStatus: billingStatus,
      payer: payer,
      homeAddress: homeAddress,
      collectionSlot: collectionSlot
    };

    window.state.phlebotomyQueue.push(newEntry);

    if (isVerbal) {
      window.state.verbalLabOrders.push({
        orderId: 'VERB-' + Date.now(),
        accNo: accNo,
        patientName: patientName,
        patientType: patType,
        nurseName: nurseName || 'Nurse',
        orderingPhysician: physician,
        tests: tests,
        orderedAt: new Date().toISOString(),
        cosignedBy: null,
        status: 'Pending Co-sign'
      });
    }

    window.state.lisAuditLogs.unshift({
      logId: 'AUDIT-LIS-' + Date.now(),
      timestamp: new Date().toISOString(),
      user: 'Lab Reception',
      role: 'Laboratory Reception',
      action: 'Lab Order Booking',
      details: 'New order booked for ' + patientName + '. Tests: ' + tests.join(', ') + '. Accession: ' + accNo + (mlcFlag ? ' [MLC]' : '') + (isVerbal ? ' [VERBAL]' : ''),
      ipAddress: '192.168.1.31'
    });

    window.closeNewOrderModal();
    window.renderPhlebotomyQueue();
    window.renderKpis();
    window.renderVerbalOrders();
    window.renderAuditLog();
    if (typeof window.renderCriticalBanner === 'function') window.renderCriticalBanner();
    alert('✅ Lab order ' + accNo + ' created successfully. Patient added to phlebotomy queue.');
  };

  // --- Phlebotomy Verification Modal ---
  window.openPhlebVerificationModal = function (accNo) {
    var entry = (window.state.phlebotomyQueue || []).find(function (q) { return q.accNo === accNo; });
    if (!entry) { alert('Accession not found.'); return; }

    var modal = document.getElementById('phleb-verify-modal');
    if (!modal) return;
    window._currentPhlebAcc = accNo;

    var detailCard = document.getElementById('phleb-patient-details-card');
    if (detailCard) {
      var ipdRow = entry.patientType === 'IPD' ? '<tr><td colspan="2"><span class="mlc-flag" style="background:#1d4ed8;">IPD</span> ' + escHtml(entry.ward || '') + ' · ' + escHtml(entry.bedNo || '') + '</td></tr>' : '';
      var mlcRow = entry.mlcFlag ? '<tr><td colspan="2" style="background:#f5f3ff;"><span class="mlc-flag">MLC</span> ' + escHtml(entry.mlcDetails || '') + '</td></tr>' : '';
      var homeRow = entry.bookingChannel === 'Home Collection' ? '<tr><td colspan="2"><span class="home-collection-badge">HOME</span> ' + escHtml(entry.homeAddress || '') + ' · Slot: ' + escHtml(entry.collectionSlot || '') + '</td></tr>' : '';

      detailCard.innerHTML = '<table class="lis-tbl">' +
        '<tr><th>Accession</th><td style="font-family:monospace;font-size:0.78rem;">' + escHtml(entry.accNo) + '</td><th>UHID</th><td style="font-family:monospace;font-size:0.78rem;">' + escHtml(entry.uhid) + '</td></tr>' +
        '<tr><th>Patient</th><td>' + escHtml(entry.name) + ' (' + entry.age + 'y/' + entry.gender + ')</td><th>Type</th><td>' + escHtml(entry.patientType) + '</td></tr>' +
        ipdRow + homeRow +
        '<tr><th>Tests</th><td colspan="3">' + escHtml(entry.tests.join(', ')) + '</td></tr>' +
        '<tr><th>Ref. Doctor</th><td>' + escHtml(entry.refDoctor || '') + '</td><th>Priority</th><td><span class="badge badge-' + (entry.priority === 'STAT' ? 'stat' : entry.priority === 'Urgent' ? 'urgent' : 'routine') + '">' + escHtml(entry.priority) + '</span></td></tr>' +
        mlcRow +
        '</table>';
    }

    // Uncheck all
    ['chk-id-confirmed', 'chk-test-list', 'chk-prep-compliance'].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.checked = false;
    });

    var collectorInput = document.getElementById('collector-name-input');
    if (collectorInput) collectorInput.value = '';

    // Location section visibility
    var ipdLoc = document.getElementById('phleb-ipd-location');
    var opdLoc = document.getElementById('phleb-opd-location');
    var homeLoc = document.getElementById('phleb-home-location');
    if (ipdLoc) ipdLoc.style.display = entry.patientType === 'IPD' ? 'block' : 'none';
    if (opdLoc) opdLoc.style.display = entry.patientType === 'OPD' ? 'block' : 'none';
    if (homeLoc) homeLoc.style.display = entry.bookingChannel === 'Home Collection' ? 'block' : 'none';

    modal.style.display = 'block';
  };

  window.closePhlebVerifyModal = function () {
    var modal = document.getElementById('phleb-verify-modal');
    if (modal) modal.style.display = 'none';
  };

  window.onCollectorRoleChange = function () {
    // Re-filter staff suggestions when role switches between Phlebotomist ↔ Ward Nurse
    var input = document.getElementById('phleb-collector-name');
    if (input) {
      input.value = '';
      var clearBtn = document.getElementById('phleb-collector-clear');
      if (clearBtn) clearBtn.style.display = 'none';
      var dropdown = document.getElementById('phleb-collector-dropdown');
      if (dropdown) dropdown.style.display = 'none';
    }
    // Show location fields based on role
    var role = document.getElementById('phleb-collector-role');
    if (!role) return;
    var ipdLoc = document.getElementById('phleb-ipd-location');
    var opdLoc = document.getElementById('phleb-opd-location');
    if (role.value === 'Ward Nurse') {
      if (ipdLoc) ipdLoc.style.display = 'block';
      if (opdLoc) opdLoc.style.display = 'none';
    } else {
      if (ipdLoc) ipdLoc.style.display = 'none';
      if (opdLoc) opdLoc.style.display = 'block';
    }
  };

  window.confirmPhlebCollection = function () {
    var checks = ['chk-id-confirmed', 'chk-test-list', 'chk-prep-compliance'];
    for (var i = 0; i < checks.length; i++) {
      var el = document.getElementById(checks[i]);
      if (!el || !el.checked) {
        alert('⚠️ Please confirm all NABL checklist items before proceeding.');
        return;
      }
    }
    var collector = (document.getElementById('phleb-collector-name') || {}).value || '';
    collector = collector.trim();
    if (!collector) { alert('Collector name is required.'); return; }

    var accNo = window._currentPhlebAcc;
    var entry = (window.state.phlebotomyQueue || []).find(function (q) { return q.accNo === accNo; });
    if (entry) {
      entry.status = 'Collected';
      entry.collectedBy = collector;
      entry.collectionTime = new Date().toISOString();
    }

    window.state.lisAuditLogs.unshift({
      logId: 'AUDIT-LIS-' + Date.now(),
      timestamp: new Date().toISOString(),
      user: collector,
      role: document.getElementById('collector-role-select') ? document.getElementById('collector-role-select').value : 'Phlebotomist',
      action: 'Sample Collection',
      details: 'Sample collected for ' + accNo + '. Identity verified per NABL SOP. 3-point ID check completed.',
      ipAddress: '192.168.1.60'
    });

    window.closePhlebVerifyModal();
    window.renderPhlebotomyQueue();
    window.renderKpis();
    window.renderAuditLog();
    alert('✅ Sample collection confirmed for ' + accNo);
  };

  window.markCollected = function (accNo) {
    window.openPhlebVerificationModal(accNo);
  };

  // --- Receive Modal ---
  window.openReceiveModal = function (specId) {
    window._currentReceiveSpec = specId;
    var modal = document.getElementById('verify-receive-modal');
    if (!modal) return;

    var spec = (window.state.processingWorklist || []).find(function (s) { return s.specId === specId; });
    var infoDiv = document.getElementById('recv-sample-info');
    if (infoDiv && spec) {
      infoDiv.innerHTML = '<strong>Specimen:</strong> ' + escHtml(spec.specId) + ' &nbsp;|&nbsp; <strong>Patient:</strong> ' + escHtml(spec.name) + ' (' + escHtml(spec.uhid) + ') &nbsp;|&nbsp; <strong>Tests:</strong> ' + escHtml(spec.tests.join(', ')) + ' &nbsp;|&nbsp; <strong>Dept:</strong> ' + escHtml(spec.dept);
    }

    ['recv-chk1', 'recv-chk2', 'recv-chk3', 'recv-chk4', 'recv-chk5'].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.checked = false;
    });

    var rejArea = document.getElementById('recv-rejection-area');
    if (rejArea) rejArea.style.display = 'none';

    modal.style.display = 'block';
  };

  window.closeReceiveModal = function () {
    var modal = document.getElementById('verify-receive-modal');
    if (modal) modal.style.display = 'none';
  };

  window.updateAccessionChecklistMode = function () {
    // Future: auto-suggest rejection if specific QC failures
  };

  window.toggleReceiveRejection = function () {
    var rejArea = document.getElementById('recv-rejection-area');
    if (rejArea) rejArea.style.display = rejArea.style.display === 'none' ? 'block' : 'none';
  };

  window.confirmReceiveSample = function () {
    var rejArea = document.getElementById('recv-rejection-area');
    var isRejecting = rejArea && rejArea.style.display !== 'none';
    var spec = (window.state.processingWorklist || []).find(function (s) { return s.specId === window._currentReceiveSpec; });

    if (isRejecting) {
      var reason = document.getElementById('recv-rejection-reason') ? document.getElementById('recv-rejection-reason').value : 'Unspecified';
      var comments = document.getElementById('recv-rejection-comments') ? document.getElementById('recv-rejection-comments').value : '';
      if (!reason) { alert('Please select a rejection reason.'); return; }

      if (spec) {
        window.state.rejectionRegister.unshift({
          id: 'REJ-' + Date.now(),
          accNo: spec.accNo,
          uhid: spec.uhid,
          name: spec.name,
          test: spec.tests.join(', '),
          reason: reason + (comments ? '. ' + comments : ''),
          rejectedAt: new Date().toISOString(),
          rejectedBy: 'Lab Reception',
          recollectionStatus: 'Recollection Ordered'
        });
        // Remove from worklist
        var idx = window.state.processingWorklist.findIndex(function (s) { return s.specId === window._currentReceiveSpec; });
        if (idx !== -1) window.state.processingWorklist.splice(idx, 1);
      }

      window.state.lisAuditLogs.unshift({
        logId: 'AUDIT-LIS-' + Date.now(),
        timestamp: new Date().toISOString(),
        user: 'Lab Reception',
        role: 'Laboratory Reception',
        action: 'Sample Rejection',
        details: 'Specimen ' + window._currentReceiveSpec + ' rejected. Reason: ' + reason,
        ipAddress: '192.168.1.31'
      });

      window.closeReceiveModal();
      window.renderWorklist();
      renderRejectionSubTab('rejection');
      window.renderKpis();
      window.renderAuditLog();
      alert('⛔ Sample rejected. Recollection notification sent to ward/patient.');
    } else {
      if (spec) {
        spec.stage = 'Received & Accepted';
        spec.receivedAt = new Date().toISOString();
      }
      window.state.lisAuditLogs.unshift({
        logId: 'AUDIT-LIS-' + Date.now(),
        timestamp: new Date().toISOString(),
        user: 'Lab Reception',
        role: 'Laboratory Reception',
        action: 'Sample Received',
        details: 'Specimen ' + window._currentReceiveSpec + ' accepted. All quality checks passed.',
        ipAddress: '192.168.1.31'
      });
      window.closeReceiveModal();
      window.renderWorklist();
      window.renderAuditLog();
      alert('✅ Sample accepted. Proceeding to analysis.');
    }
  };

  // --- Result Entry Modal ---
  window.openEnterResultModal = function (specId) {
    var spec = (window.state.processingWorklist || []).find(function (s) { return s.specId === specId; });
    if (!spec) { alert('Specimen not found.'); return; }

    if (spec.dept === 'Histopathology') {
      var stage = spec.stage || '';
      if (stage !== 'Staining' && stage !== 'Mounting' && stage !== 'Reporting') {
        alert('Histopathology specimen is at stage: ' + stage + '. Result entry is allowed only after Staining/Mounting stages.');
        return;
      }
    }

    var modal = document.getElementById('enter-result-dialog-modal');
    if (!modal) return;
    window._currentResultSpec = specId;

    // Patient context
    var ctx = document.getElementById('result-patient-context');
    if (ctx) {
      ctx.innerHTML = '<strong>' + escHtml(spec.name) + '</strong> · ' + escHtml(spec.uhid) + ' · <strong>' + escHtml(spec.dept) + '</strong> · Tests: ' + escHtml(spec.tests.join(', ')) + '<br><span style="font-size:0.78rem;color:var(--text-muted);">Specimen: ' + escHtml(spec.specId) + ' · Instrument: ' + escHtml(spec.instrument || '') + '</span>';
    }

    // Check IQC hold
    var failQc = (window.state.qcLog || []).find(function (q) { return q.dept === spec.dept && q.status === 'Fail' && q.iqcHold; });
    var iqcWarn = document.getElementById('iqc-gate-warning');
    if (iqcWarn) iqcWarn.style.display = failQc ? 'block' : 'none';

    // Build result fields based on test type
    var fieldsContainer = document.getElementById('result-fields-container');
    if (fieldsContainer) {
      var fields = getResultFieldsForTests(spec.tests);
      fieldsContainer.innerHTML = fields.map(function (f) {
        return '<div class="result-field"><label>' + escHtml(f.label) + ' <span style="font-size:0.72rem;color:var(--text-muted);">(' + escHtml(f.unit) + ')</span></label><input type="text" id="res-field-' + escAttr(f.key) + '" placeholder="' + escAttr(f.placeholder || '') + '"></div>';
      }).join('');
    }

    // Check delta check
    var deltaDiv = document.getElementById('delta-check-display');
    var deltaMsg = document.getElementById('delta-check-message');
    if (deltaDiv && deltaMsg) {
      // Simulate delta check for known patients
      var deltaCheck = checkDeltaForSpec(spec);
      if (deltaCheck) {
        deltaDiv.style.display = 'block';
        deltaMsg.innerHTML = escHtml(deltaCheck);
      } else {
        deltaDiv.style.display = 'none';
      }
    }

    // Set instrument
    var instrSel = document.getElementById('result-instrument-select');
    if (instrSel && spec.instrument) {
      for (var i = 0; i < instrSel.options.length; i++) {
        if (instrSel.options[i].text.indexOf(spec.instrument.substring(0, 15)) !== -1) {
          instrSel.selectedIndex = i;
          break;
        }
      }
    }

    modal.style.display = 'block';
  };

  window.closeResultModal = function () {
    var modal = document.getElementById('enter-result-dialog-modal');
    if (modal) modal.style.display = 'none';
  };

  window.saveResultEntry = function () {
    var spec = (window.state.processingWorklist || []).find(function (s) { return s.specId === window._currentResultSpec; });
    if (!spec) { alert('Specimen not found.'); return; }

    var failQc = (window.state.qcLog || []).find(function (q) { return q.dept === spec.dept && q.status === 'Fail' && q.iqcHold; });
    if (failQc) {
      alert('⛔ RETROSPECTIVE IQC QUARANTINE: Analyzer for ' + spec.dept + ' (' + (failQc.instrument || '') + ') has an active IQC failure/hold. No patient results can be entered or validation requested until a passing IQC run is logged.');
      return;
    }

    var fields = getResultFieldsForTests(spec.tests);
    var resultObj = {};
    fields.forEach(function (f) {
      var el = document.getElementById('res-field-' + f.key);
      if (el) resultObj[f.label] = el.value || 'N/A';
    });

    var comments = document.getElementById('result-comments') ? document.getElementById('result-comments').value : '';
    var analyst = 'Lab Tech';

    spec.status = 'Pending Validation';
    spec.stage = 'Result Entry Complete';

    // Add to validation queue
    window.state.validationQueue.push({
      reportNo: 'RPT-' + Date.now(),
      accNo: spec.accNo,
      uhid: spec.uhid,
      name: spec.name,
      age: 0,
      gender: 'U',
      dept: spec.dept,
      tests: spec.tests,
      result: resultObj,
      flags: failQc ? ['IQC-HOLD'] : [],
      flagLabel: failQc ? 'IQC Hold — results under recalibration' : (comments || 'Results entered'),
      enteredBy: analyst,
      enteredAt: new Date().toISOString(),
      validatedBy: null,
      status: 'Pending Validation'
    });

    window.state.lisAuditLogs.unshift({
      logId: 'AUDIT-LIS-' + Date.now(),
      timestamp: new Date().toISOString(),
      user: analyst,
      role: 'Laboratory Technician',
      action: 'Result Entry',
      details: 'Results entered for ' + spec.specId + ' (' + spec.tests.join(', ') + '). Sent for validation.',
      ipAddress: '192.168.1.45'
    });

    window.closeResultModal();
    window.renderWorklist();
    window.renderValidationQueue();
    window.renderKpis();
    window.renderAuditLog();
    alert('✅ Results saved and sent for pathologist validation.');
  };

  function getResultFieldsForTests(tests) {
    var fieldMap = {
      'CBC': [
        { key: 'Hb', label: 'Haemoglobin', unit: 'g/dL', placeholder: 'e.g. 12.5' },
        { key: 'TLC', label: 'Total Leucocyte Count', unit: '/µL', placeholder: 'e.g. 8500' },
        { key: 'PLT', label: 'Platelet Count', unit: '/µL', placeholder: 'e.g. 150000' },
        { key: 'PCV', label: 'PCV / Haematocrit', unit: '%', placeholder: 'e.g. 38' },
        { key: 'MCV', label: 'MCV', unit: 'fL', placeholder: 'e.g. 85' },
        { key: 'MCH', label: 'MCH', unit: 'pg', placeholder: 'e.g. 28' }
      ],
      'LFT': [
        { key: 'TotBili', label: 'Total Bilirubin', unit: 'mg/dL', placeholder: 'e.g. 1.0' },
        { key: 'DirBili', label: 'Direct Bilirubin', unit: 'mg/dL', placeholder: 'e.g. 0.3' },
        { key: 'SGOT', label: 'SGOT (AST)', unit: 'IU/L', placeholder: 'e.g. 35' },
        { key: 'SGPT', label: 'SGPT (ALT)', unit: 'IU/L', placeholder: 'e.g. 28' },
        { key: 'ALP', label: 'Alkaline Phosphatase', unit: 'IU/L', placeholder: 'e.g. 90' },
        { key: 'TotProt', label: 'Total Protein', unit: 'g/dL', placeholder: 'e.g. 7.0' }
      ],
      'KFT': [
        { key: 'Creatinine', label: 'Serum Creatinine', unit: 'mg/dL', placeholder: 'e.g. 1.0' },
        { key: 'Urea', label: 'Blood Urea', unit: 'mg/dL', placeholder: 'e.g. 30' },
        { key: 'SodiumK', label: 'Serum Potassium', unit: 'mEq/L', placeholder: 'e.g. 4.0' },
        { key: 'SodiumNa', label: 'Serum Sodium', unit: 'mEq/L', placeholder: 'e.g. 140' },
        { key: 'UricAcid', label: 'Uric Acid', unit: 'mg/dL', placeholder: 'e.g. 5.5' }
      ],
      'LIPID': [
        { key: 'TotCholesterol', label: 'Total Cholesterol', unit: 'mg/dL', placeholder: 'e.g. 180' },
        { key: 'Triglycerides', label: 'Triglycerides', unit: 'mg/dL', placeholder: 'e.g. 120' },
        { key: 'HDL', label: 'HDL Cholesterol', unit: 'mg/dL', placeholder: 'e.g. 50' },
        { key: 'LDL', label: 'LDL Cholesterol', unit: 'mg/dL', placeholder: 'e.g. 110' },
        { key: 'VLDL', label: 'VLDL Cholesterol', unit: 'mg/dL', placeholder: 'e.g. 24' }
      ],
      'TSH': [
        { key: 'TSH', label: 'TSH', unit: 'µIU/mL', placeholder: 'e.g. 2.5' }
      ],
      'HBA1C': [
        { key: 'HbA1c', label: 'HbA1c', unit: '%', placeholder: 'e.g. 6.5' },
        { key: 'eAG', label: 'Estimated Average Glucose', unit: 'mg/dL', placeholder: 'Auto-calculated' }
      ],
      'DENGUE': [
        { key: 'NS1', label: 'Dengue NS1 Antigen', unit: '', placeholder: 'REACTIVE / NON-REACTIVE' },
        { key: 'IgM', label: 'Dengue IgM Antibody', unit: '', placeholder: 'REACTIVE / NON-REACTIVE' },
        { key: 'IgG', label: 'Dengue IgG Antibody', unit: '', placeholder: 'REACTIVE / NON-REACTIVE' }
      ],
      'WIDAL': [
        { key: 'TO', label: 'S. typhi O', unit: 'titre', placeholder: 'e.g. 1:80' },
        { key: 'TH', label: 'S. typhi H', unit: 'titre', placeholder: 'e.g. 1:80' },
        { key: 'AO', label: 'S. paratyphi AO', unit: 'titre', placeholder: 'e.g. 1:40' },
        { key: 'BH', label: 'S. paratyphi BH', unit: 'titre', placeholder: 'e.g. 1:20' }
      ],
      'HIV': [
        { key: 'HIVResult', label: 'HIV 1&2 ELISA Result', unit: '', placeholder: 'REACTIVE / NON-REACTIVE' },
        { key: 'OD', label: 'OD Value', unit: '', placeholder: 'e.g. 0.12' }
      ],
      'URINE_RM': [
        { key: 'Colour', label: 'Colour', unit: '', placeholder: 'e.g. Pale Yellow' },
        { key: 'Turbidity', label: 'Turbidity', unit: '', placeholder: 'e.g. Clear' },
        { key: 'Protein', label: 'Protein', unit: '', placeholder: 'Nil / Trace / +' },
        { key: 'Sugar', label: 'Sugar', unit: '', placeholder: 'Nil / +' },
        { key: 'Pus_Cells', label: 'Pus Cells', unit: '/hpf', placeholder: 'e.g. 2-4' },
        { key: 'RBC', label: 'RBC', unit: '/hpf', placeholder: 'e.g. 0-2' }
      ],
      'CULTURE': [
        { key: 'GrowthAt24h', label: 'Growth at 24h', unit: '', placeholder: 'No Growth / Organism name' },
        { key: 'GrowthAt48h', label: 'Growth at 48h', unit: '', placeholder: 'No Growth / Organism name' },
        { key: 'Organism', label: 'Organism Identified', unit: '', placeholder: 'e.g. E. coli' },
        { key: 'Sensitivity', label: 'Sensitivity (key antibiotics)', unit: '', placeholder: 'e.g. Amikacin-S, Ciprofloxacin-R' }
      ],
      'BIOP_MED': [
        { key: 'MacroscopicDesc', label: 'Macroscopic Description', unit: '', placeholder: 'Tissue size, color, consistency' },
        { key: 'MicroscopicDesc', label: 'Microscopic Description', unit: '', placeholder: 'Histology findings' },
        { key: 'Diagnosis', label: 'Histopathological Diagnosis', unit: '', placeholder: 'Final diagnosis' }
      ],
      'FNAC': [
        { key: 'Adequacy', label: 'Adequacy of Sample', unit: '', placeholder: 'Adequate / Inadequate' },
        { key: 'CytologicDesc', label: 'Cytologic Description', unit: '', placeholder: 'Cell morphology findings' },
        { key: 'Impression', label: 'Cytological Impression', unit: '', placeholder: 'Final cytology impression' }
      ],
      'OUT_GENE': [
        { key: 'ExternalResult', label: 'External Lab Result (Summary)', unit: '', placeholder: 'Summary of genetic panel result' },
        { key: 'Interpretation', label: 'Pathologist Interpretation', unit: '', placeholder: 'Clinical interpretation' }
      ]
    };

    var fields = [];
    (tests || []).forEach(function (code) {
      if (fieldMap[code]) {
        fieldMap[code].forEach(function (f) {
          if (!fields.some(function (ff) { return ff.key === f.key; })) {
            fields.push(f);
          }
        });
      }
    });

    if (fields.length === 0) {
      fields = [{ key: 'Result', label: 'Result', unit: '', placeholder: 'Enter result value' }];
    }

    return fields;
  }

  function checkDeltaForSpec(spec) {
    // Simulate delta check for known patients
    if (spec.uhid === 'UH-20031') {
      return 'Delta Check Warning: Haemoglobin has dropped from 14.2 g/dL (previous, 2026-07-10) to current value. Verify clinically and confirm with treating physician.';
    }
    return null;
  }

  // --- Pathologist Sign-off Modal ---
  window.openSignoffModal = function (reportNo) {
    var rpt = (window.state.validationQueue || []).find(function (r) { return r.reportNo === reportNo; });
    if (!rpt) { alert('Report not found.'); return; }
    window._currentSignoffReport = reportNo;

    var modal = document.getElementById('pathologist-signoff-modal');
    if (!modal) return;

    var summary = document.getElementById('signoff-report-summary');
    if (summary) {
      var resultRows = '';
      if (rpt.result) {
        Object.keys(rpt.result).forEach(function (k) {
          resultRows += '<tr><td style="color:var(--text-muted);">' + escHtml(k) + '</td><td style="font-weight:700;font-family:var(--font-mono,monospace);">' + escHtml(rpt.result[k]) + '</td></tr>';
        });
      }
      summary.innerHTML = '<table class="lis-tbl"><tr><th>Patient</th><td>' + escHtml(rpt.name) + ' (' + rpt.age + 'y/' + rpt.gender + ')</td><th>UHID</th><td style="font-family:monospace;font-size:0.78rem;">' + escHtml(rpt.uhid) + '</td></tr>' +
        '<tr><th>Report No.</th><td style="font-family:monospace;font-size:0.78rem;">' + escHtml(rpt.reportNo) + '</td><th>Dept</th><td>' + escHtml(rpt.dept) + '</td></tr>' +
        '<tr><th colspan="4" style="background:#f9fafb;">Results</th></tr>' +
        resultRows +
        '</table>' +
        '<div style="margin-top:6px;"><strong>Flag:</strong> ' + escHtml(rpt.flagLabel || 'Normal') + '</div>';
    }

    // Delivery mode
    var deliveryDiv = document.getElementById('signoff-delivery-mode');
    if (deliveryDiv) {
      var deliveryMode = getDeliveryModeForReport(rpt);
      deliveryDiv.innerHTML = '📨 <strong>Delivery Mode:</strong> ' + escHtml(deliveryMode);
    }

    var activeRole = localStorage.getItem('saronil_active_lab_role') || 'Pathologist';
    var validatedByEl = document.getElementById('signoff-validated-by');
    if (validatedByEl) validatedByEl.value = activeRole;

    var commentsEl = document.getElementById('signoff-comments');
    if (commentsEl) commentsEl.value = '';

    var chk = document.getElementById('chk-signoff-review');
    if (chk) chk.checked = false;

    modal.style.display = 'block';
  };

  window.closeSignoffModal = function () {
    var modal = document.getElementById('pathologist-signoff-modal');
    if (modal) modal.style.display = 'none';
  };

  window.repeatTestFromSignoff = function () {
    if (confirm('Are you sure you want to recall this test for repeat analysis? This will move it back to the worklist.')) {
      window.closeSignoffModal();
      alert('Test recalled for repeat analysis. Worklist updated.');
    }
  };

  window.confirmSignoff = function () {
    var chk = document.getElementById('chk-signoff-review');
    if (!chk || !chk.checked) {
      alert('Please confirm you have reviewed all results before signing off.');
      return;
    }
    var reportNo = window._currentSignoffReport;
    var rpt = (window.state.validationQueue || []).find(function (r) { return r.reportNo === reportNo; });
    if (!rpt) { alert('Report not found.'); return; }

    var activeRole = localStorage.getItem('saronil_active_lab_role') || 'Pathologist';
    var signoffMode = document.getElementById('signoff-mode-select') ? document.getElementById('signoff-mode-select').value : 'Final';
    var comments = document.getElementById('signoff-comments') ? document.getElementById('signoff-comments').value : '';

    rpt.validatedBy = activeRole;
    rpt.status = 'Validated - ' + signoffMode;
    rpt.validatedAt = new Date().toISOString();

    // Check for critical and create CRIT record
    if (rpt.flags && rpt.flags.indexOf('CRITICAL') !== -1) {
      var existingCrit = (window.state.criticalValues || []).find(function (c) { return c.accNo === rpt.accNo; });
      if (!existingCrit) {
        window.state.criticalValues.unshift({
          id: 'CRIT-' + Date.now(),
          accNo: rpt.accNo,
          uhid: rpt.uhid,
          name: rpt.name,
          dept: rpt.dept,
          test: (rpt.tests || []).join(', '),
          value: rpt.flagLabel,
          criticalLimit: 'Critical range exceeded',
          reportedAt: new Date().toISOString(),
          reportedBy: activeRole,
          notifiedTo: null,
          ackStatus: 'Pending',
          refDoctor: 'Treating Physician'
        });
      }
    }

    // Add to dispatch log
    var deliveryMode = getDeliveryModeForReport(rpt);
    window.state.reportDispatchLog.unshift({
      dispatchId: 'DISP-' + Date.now(),
      accNo: rpt.accNo,
      uhid: rpt.uhid,
      name: rpt.name,
      test: (rpt.tests || []).join(', '),
      validatedBy: activeRole,
      validatedAt: new Date().toISOString(),
      dispatchMode: deliveryMode,
      dispatchedAt: new Date().toISOString(),
      status: 'Delivered'
    });

    // Enhancement 6: Auto-flag notifiable diseases
    var NOTIFIABLE_MAP = {
      'DENGUE': 'District Health Officer (IDSP)',
      'MALARIA': 'District Health Officer (IDSP)',
      'CULTURE': 'District Health Officer (IDSP)',
      'WIDAL': 'District Health Officer (IDSP)',
      'HIV': 'ICTC Coordinator',
      'TUBERCULOSIS': 'District TB Officer (RNTCP)',
      'TB': 'District TB Officer (RNTCP)',
      'COVID': 'District Health Officer (IDSP)',
      'HEPATITIS': 'District Health Officer (IDSP)'
    };

    var rptEntry = rpt;
    if (rptEntry) {
      var resultStr = JSON.stringify(rptEntry.result || {}).toUpperCase();
      var isPositive = resultStr.includes('REACTIVE') || resultStr.includes('DETECTED') || resultStr.includes('POSITIVE') || resultStr.includes('GROWTH') || resultStr.includes('ISOLATED');
      if (isPositive) {
        Object.keys(NOTIFIABLE_MAP).forEach(function(keyword) {
          var testStr = (rptEntry.tests || []).join(' ').toUpperCase();
          if (testStr.includes(keyword) || (keyword === 'CULTURE' && testStr.includes('CULTURE'))) {
            var alreadyLogged = (window.state.notifiableDiseaseLog || []).some(function(n) { return n.accNo === rptEntry.accNo && n.disease.toUpperCase().includes(keyword); });
            if (!alreadyLogged) {
              window.state.notifiableDiseaseLog = window.state.notifiableDiseaseLog || [];
              window.state.notifiableDiseaseLog.push({
                id: 'NOTIF-AUTO-' + Date.now(),
                accNo: rptEntry.accNo,
                uhid: rptEntry.uhid,
                name: rptEntry.name,
                disease: keyword.charAt(0) + keyword.slice(1).toLowerCase() + ' (Auto-flagged at validation)',
                result: resultStr.substring(0, 120),
                reportedToAuthority: NOTIFIABLE_MAP[keyword],
                reportedAt: new Date().toISOString(),
                reportedBy: 'System Auto-flag at Validation',
                status: 'Pending Reporting'
              });
            }
          }
        });
      }
    }

    // Remove from validation queue
    var idx = window.state.validationQueue.findIndex(function (r) { return r.reportNo === reportNo; });
    if (idx !== -1) window.state.validationQueue.splice(idx, 1);

    window.state.lisAuditLogs.unshift({
      logId: 'AUDIT-LIS-' + Date.now(),
      timestamp: new Date().toISOString(),
      user: activeRole,
      role: activeRole,
      action: 'Report Sign-off',
      details: signoffMode + ' report signed for ' + reportNo + ' (' + rpt.name + '). Mode: ' + signoffMode + (comments ? '. Comments: ' + comments : ''),
      ipAddress: '192.168.1.50'
    });

    window.closeSignoffModal();
    window.renderValidationQueue();
    window.renderDispatchLog();
    window.renderCriticalAlerts();
    renderCriticalBanner();
    window.renderKpis();
    window.renderAuditLog();
    alert('✅ Report ' + reportNo + ' signed and released. Delivery mode: ' + deliveryMode);
  };

  function getDeliveryModeForReport(rpt) {
    // Auto-determine delivery mode by patient type
    var entry = (window.state.phlebotomyQueue || []).find(function (q) { return q.accNo === rpt.accNo; });
    if (!entry) return 'Portal Auto-release';
    if (entry.patientType === 'IPD') return 'IPD Ward — Direct to Nurse Station';
    if (entry.bookingChannel === 'Home Collection') return 'WhatsApp + Portal';
    return 'Portal Auto-release + SMS';
  }

  // --- Critical Ack Modal ---
  window.openCritAckModal = function (critId) {
    var crit = (window.state.criticalValues || []).find(function (c) { return c.id === critId; });
    if (!crit) { alert('Critical record not found.'); return; }
    window._currentCritId = critId;

    var modal = document.getElementById('crit-ack-modal');
    if (!modal) return;

    var displayDiv = document.getElementById('crit-ack-value-display');
    if (displayDiv) {
      displayDiv.innerHTML = '<div class="crit-card"><div style="font-weight:700;font-size:1rem;">' + escHtml(crit.name) + '</div>' +
        '<div style="font-size:0.78rem;color:var(--text-muted);">' + escHtml(crit.uhid) + ' · ' + escHtml(crit.dept) + (crit.ward ? ' · 📍 ' + escHtml(crit.ward) + (crit.bed ? ' ' + escHtml(crit.bed) : '') : '') + '</div>' +
        '<div class="crit-card-value" style="margin-top:8px;">' + escHtml(crit.value) + '</div>' +
        '<div class="crit-card-limit">Critical Limit: ' + escHtml(crit.criticalLimit) + '</div>' +
        '<div class="crit-card-meta">Test: ' + escHtml(crit.test) + ' · Reported: ' + formatDateTime(crit.reportedAt) + '</div>' +
        '<div style="font-size:0.78rem;margin-top:4px;color:#1d4ed8;"><strong>Treating Doctor:</strong> ' + escHtml(crit.refDoctor) + '</div>' +
        '</div>';
    }

    var timeEl = document.getElementById('crit-ack-time');
    if (timeEl) {
      var now = new Date();
      now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
      timeEl.value = now.toISOString().slice(0, 16);
    }

    var clinicianEl = document.getElementById('crit-ack-clinician');
    if (clinicianEl) clinicianEl.value = crit.refDoctor || '';

    var responseEl = document.getElementById('crit-ack-response');
    if (responseEl) responseEl.value = '';

    var chk = document.getElementById('chk-readback-confirmed');
    if (chk) chk.checked = false;

    modal.style.display = 'block';
  };

  window.closeCritAckModal = function () {
    var modal = document.getElementById('crit-ack-modal');
    if (modal) modal.style.display = 'none';
  };

  window.saveCritAck = function () {
    var clinician = document.getElementById('crit-ack-clinician') ? document.getElementById('crit-ack-clinician').value.trim() : '';
    var response = document.getElementById('crit-ack-response') ? document.getElementById('crit-ack-response').value.trim() : '';
    var readback = document.getElementById('chk-readback-confirmed') && document.getElementById('chk-readback-confirmed').checked;

    if (!clinician) { alert('Please enter the name of the clinician notified.'); return; }
    if (!response) { alert('Please enter the clinician response/action taken.'); return; }
    if (!readback) { alert('⚠️ Read-back confirmation is mandatory per NABL requirements. Please confirm the clinician repeated the critical value.'); return; }

    var critId = window._currentCritId;
    var crit = (window.state.criticalValues || []).find(function (c) { return c.id === critId; });
    if (crit) {
      crit.ackStatus = 'Acknowledged';
      crit.notifiedTo = clinician;
    }

    var activeRole = localStorage.getItem('saronil_active_lab_role') || 'Laboratory Technician';
    window.state.criticalAckRegister.unshift({
      id: 'CRIT-ACK-' + Date.now(),
      critId: critId,
      accNo: crit ? crit.accNo : '',
      uhid: crit ? crit.uhid : '',
      name: crit ? crit.name : '',
      test: crit ? crit.test : '',
      value: crit ? crit.value : '',
      ackedBy: activeRole,
      ackedAt: new Date().toISOString(),
      calledTo: clinician,
      readBackConfirmed: true,
      clinicianResponse: response
    });

    window.state.lisAuditLogs.unshift({
      logId: 'AUDIT-LIS-' + Date.now(),
      timestamp: new Date().toISOString(),
      user: activeRole,
      role: activeRole,
      action: 'Critical Value Acknowledged',
      details: 'Critical value ' + critId + ' acknowledged. Notified ' + clinician + '. Read-back confirmed. Response: ' + response,
      ipAddress: '192.168.1.44'
    });

    window.closeCritAckModal();
    window.renderCriticalAlerts();
    renderCriticalBanner();
    window.renderKpis();
    window.renderAuditLog();
    alert('✅ Critical value acknowledgement saved. Register updated.');
  };

  // --- Sample Rejection Modal (from worklist context) ---
  window.openSampleRejectionModal = function (specId) {
    window._currentRejectionSpec = specId;
    var spec = (window.state.processingWorklist || []).find(function (s) { return s.specId === specId; });
    var modal = document.getElementById('sample-rejection-modal');
    if (!modal) return;

    var detailDiv = document.getElementById('rejection-sample-details');
    if (detailDiv && spec) {
      detailDiv.innerHTML = '<strong>Specimen:</strong> ' + escHtml(spec.specId) + ' &nbsp;|&nbsp; <strong>Patient:</strong> ' + escHtml(spec.name) + ' · ' + escHtml(spec.uhid) + ' &nbsp;|&nbsp; <strong>Test:</strong> ' + escHtml(spec.tests.join(', '));
    }

    var reasonSel = document.getElementById('rejection-reason-select');
    if (reasonSel) reasonSel.value = '';

    var commentsEl = document.getElementById('rejection-comments');
    if (commentsEl) commentsEl.value = '';

    modal.style.display = 'block';
  };

  window.closeSampleRejectionModal = function () {
    var modal = document.getElementById('sample-rejection-modal');
    if (modal) modal.style.display = 'none';
  };

  window.confirmSampleRejection = function () {
    var reason = document.getElementById('rejection-reason-select') ? document.getElementById('rejection-reason-select').value : '';
    var comments = document.getElementById('rejection-comments') ? document.getElementById('rejection-comments').value : '';
    if (!reason) { alert('Please select a rejection reason.'); return; }

    var specId = window._currentRejectionSpec;
    var spec = (window.state.processingWorklist || []).find(function (s) { return s.specId === specId; });

    if (spec) {
      window.state.rejectionRegister.unshift({
        id: 'REJ-' + Date.now(),
        accNo: spec.accNo,
        uhid: spec.uhid,
        name: spec.name,
        test: spec.tests.join(', '),
        reason: reason + (comments ? '. ' + comments : ''),
        rejectedAt: new Date().toISOString(),
        rejectedBy: localStorage.getItem('saronil_active_lab_role') || 'Lab Tech',
        recollectionStatus: 'Recollection Ordered'
      });
      var idx = window.state.processingWorklist.findIndex(function (s) { return s.specId === specId; });
      if (idx !== -1) window.state.processingWorklist.splice(idx, 1);
    }

    window.state.lisAuditLogs.unshift({
      logId: 'AUDIT-LIS-' + Date.now(),
      timestamp: new Date().toISOString(),
      user: localStorage.getItem('saronil_active_lab_role') || 'Lab Tech',
      role: 'Laboratory Technician',
      action: 'Sample Rejected',
      details: 'Specimen ' + (specId || '') + ' rejected. Reason: ' + reason,
      ipAddress: '192.168.1.45'
    });

    window.closeSampleRejectionModal();
    window.renderWorklist();
    renderRejectionSubTab('rejection');
    window.renderKpis();
    window.renderAuditLog();
    alert('⛔ Sample rejected and logged. Recollection notification initiated.');
  };

  // --- Blood Bank Modal ---
  window.openBloodBankModal = function () {
    var modal = document.getElementById('blood-bank-modal');
    if (!modal) return;
    renderBloodStockTable();
    renderBloodCrossMatches();
    modal.style.display = 'block';
  };

  window.closeBloodBankModal = function () {
    var modal = document.getElementById('blood-bank-modal');
    if (modal) modal.style.display = 'none';
  };

  // --- Upload Referral Modal ---
  window.openUploadReferralModal = function (outsourceId) {
    window._currentOutsourceId = outsourceId;
    var out = (window.state.outsourceRegister || []).find(function (o) { return o.id === outsourceId; });
    var modal = document.getElementById('upload-referral-modal');
    if (!modal) return;

    var ctx = document.getElementById('upload-referral-context');
    if (ctx && out) {
      ctx.innerHTML = '<strong>' + escHtml(out.name) + '</strong> · ' + escHtml(out.uhid) + ' · <strong>' + escHtml(out.testName) + '</strong><br>Lab: ' + escHtml(out.labName) + ' · Tracking: ' + escHtml(out.trackingId);
    }

    var labNameEl = document.getElementById('referral-lab-name');
    if (labNameEl && out) labNameEl.value = out.labName || '';

    var commentsEl = document.getElementById('referral-comments');
    if (commentsEl) commentsEl.value = '';

    modal.style.display = 'block';
  };

  window.closeUploadReferralModal = function () {
    var modal = document.getElementById('upload-referral-modal');
    if (modal) modal.style.display = 'none';
  };

  window.saveReferralUpload = function () {
    var labName = document.getElementById('referral-lab-name') ? document.getElementById('referral-lab-name').value.trim() : '';
    var reportDate = document.getElementById('referral-report-date') ? document.getElementById('referral-report-date').value : '';
    var fileEl = document.getElementById('referral-file-upload');
    var comments = document.getElementById('referral-comments') ? document.getElementById('referral-comments').value : '';

    if (!labName) { alert('Please enter the lab name.'); return; }
    if (!fileEl || !fileEl.files || fileEl.files.length === 0) { alert('Please select a report file to upload.'); return; }

    var outsourceId = window._currentOutsourceId;
    var out = (window.state.outsourceRegister || []).find(function (o) { return o.id === outsourceId; });
    if (out) {
      out.status = 'Result Received';
      out.resultDoc = fileEl.files[0].name;
    }

    window.state.lisAuditLogs.unshift({
      logId: 'AUDIT-LIS-' + Date.now(),
      timestamp: new Date().toISOString(),
      user: localStorage.getItem('saronil_active_lab_role') || 'Lab Tech',
      role: 'Laboratory Technician',
      action: 'Outsource Report Upload',
      details: 'Outsource report uploaded for ' + outsourceId + '. File: ' + fileEl.files[0].name + '. Lab: ' + labName,
      ipAddress: '192.168.1.45'
    });

    window.closeUploadReferralModal();
    window.switchQcSubTab('outsource');
    window.renderAuditLog();
    alert('✅ Outsource report uploaded successfully. Pathologist review required before dispatch.');
  };

  // --- Verbal Co-sign Modal ---
  window.openVerbalCosignModal = function (orderId) {
    window._currentVerbalOrderId = orderId;
    var vo = (window.state.verbalLabOrders || []).find(function (v) { return v.orderId === orderId; });
    var modal = document.getElementById('verbal-cosign-modal');
    if (!modal) return;

    var detailDiv = document.getElementById('verbal-order-details-display');
    if (detailDiv && vo) {
      detailDiv.innerHTML = '<span class="verbal-order-badge">VERBAL ORDER</span><br><br>' +
        '<strong>Order ID:</strong> ' + escHtml(vo.orderId) + '<br>' +
        '<strong>Patient:</strong> ' + escHtml(vo.patientName) + '<br>' +
        '<strong>Tests:</strong> ' + escHtml((vo.tests || []).join(', ')) + '<br>' +
        '<strong>Taken by Nurse:</strong> ' + escHtml(vo.nurseName || 'N/A') + '<br>' +
        '<strong>Physician to Co-sign:</strong> ' + escHtml(vo.orderingPhysician) + '<br>' +
        '<strong>Order Time:</strong> ' + formatDateTime(vo.orderedAt);
    }

    var physEl = document.getElementById('cosign-physician-name');
    if (physEl && vo) physEl.value = vo.orderingPhysician || '';

    var regEl = document.getElementById('cosign-physician-reg');
    if (regEl) regEl.value = '';

    var chk = document.getElementById('chk-cosign-confirm');
    if (chk) chk.checked = false;

    modal.style.display = 'block';
  };

  window.closeVerbalCosignModal = function () {
    var modal = document.getElementById('verbal-cosign-modal');
    if (modal) modal.style.display = 'none';
  };

  window.confirmVerbalCosign = function () {
    var physName = document.getElementById('cosign-physician-name') ? document.getElementById('cosign-physician-name').value.trim() : '';
    var regNo = document.getElementById('cosign-physician-reg') ? document.getElementById('cosign-physician-reg').value.trim() : '';
    var chk = document.getElementById('chk-cosign-confirm');

    if (!physName) { alert('Physician name is required.'); return; }
    if (!chk || !chk.checked) { alert('Physician must confirm and accept responsibility for this verbal order.'); return; }

    var orderId = window._currentVerbalOrderId;
    var vo = (window.state.verbalLabOrders || []).find(function (v) { return v.orderId === orderId; });
    if (vo) {
      vo.status = 'Co-signed';
      vo.cosignedBy = physName;
      vo.cosignedAt = new Date().toISOString();
      vo.cosignRegNo = regNo;
    }

    window.state.lisAuditLogs.unshift({
      logId: 'AUDIT-LIS-' + Date.now(),
      timestamp: new Date().toISOString(),
      user: physName,
      role: 'Physician',
      action: 'Verbal Order Co-sign',
      details: 'Verbal order ' + orderId + ' co-signed by Dr. ' + physName + (regNo ? ' (Reg: ' + regNo + ')' : '') + '. NABL compliance met.',
      ipAddress: '192.168.1.55'
    });

    window.closeVerbalCosignModal();
    window.renderVerbalOrders();
    window.renderAuditLog();
    alert('✅ Verbal order ' + orderId + ' co-signed by Dr. ' + physName + '. Compliance record saved.');
  };

  // --- Utility Functions ---
  window.markRecollected = function (recollectionId) {
    var item = (window.state.recollectionAlerts || []).find(function (r) { return r.id === recollectionId; });
    if (item) {
      item.status = 'Recollected';
      var rejItem = (window.state.rejectionRegister || []).find(function (r) { return r.accNo === item.accNo; });
      if (rejItem) rejItem.recollectionStatus = 'Recollected';
    }
    renderRejectionSubTab('recollection');
    alert('✅ Recollection marked as done.');
  };

  window.navigateToPatient = function (uhid) {
    if (typeof router !== 'undefined' && router.navigate) {
      router.navigate('patients?uhid=' + uhid);
    } else {
      alert('Navigation to patient record: UHID ' + uhid);
    }
  };

  window.toggleCollapsible = function (bodyId, iconId) {
    var body = document.getElementById(bodyId);
    var icon = document.getElementById(iconId);
    if (!body) return;
    var isHidden = body.style.display === 'none';
    body.style.display = isHidden ? '' : 'none';
    if (icon) icon.textContent = isHidden ? '▼' : '▶';
  };

  window.exportAuditCsv = function () {
    var list = window.state.lisAuditLogs || [];
    var headers = ['Log ID', 'Timestamp', 'User', 'Role', 'Action', 'Details', 'IP Address'];
    var rows = list.map(function (log) {
      return [log.logId, log.timestamp, log.user, log.role, log.action, log.details, log.ipAddress || ''].map(function (v) {
        return '"' + String(v || '').replace(/"/g, '""') + '"';
      }).join(',');
    });
    var csv = headers.join(',') + '\n' + rows.join('\n');
    var blob = new Blob([csv], { type: 'text/csv' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'LIS_Audit_Log_' + new Date().toISOString().slice(0, 10) + '.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // ---------------------------------------------------------------------------
  // SECTION 26: Helper / Utility Functions
  // ---------------------------------------------------------------------------

  function escHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function escAttr(str) {
    if (str === null || str === undefined) return '';
    return String(str).replace(/'/g, "\\'").replace(/"/g, '&quot;');
  }

  function formatDateTime(isoStr) {
    if (!isoStr) return '—';
    try {
      var d = new Date(isoStr);
      var dd = String(d.getDate()).padStart(2, '0');
      var mm = String(d.getMonth() + 1).padStart(2, '0');
      var yyyy = d.getFullYear();
      var hh = String(d.getHours()).padStart(2, '0');
      var min = String(d.getMinutes()).padStart(2, '0');
      return dd + '/' + mm + '/' + yyyy + ' ' + hh + ':' + min;
    } catch (e) {
      return isoStr;
    }
  }

  function formatTime(isoStr) {
    if (!isoStr) return '—';
    try {
      var d = new Date(isoStr);
      var hh = String(d.getHours()).padStart(2, '0');
      var min = String(d.getMinutes()).padStart(2, '0');
      return hh + ':' + min;
    } catch (e) {
      return isoStr;
    }
  }

  function estimateTatPct(receivedAt, tatHours) {
    if (!receivedAt || !tatHours) return 50;
    try {
      var received = new Date(receivedAt).getTime();
      var now = Date.now();
      var elapsed = (now - received) / (1000 * 60 * 60); // hours elapsed
      return Math.min(100, Math.round((elapsed / tatHours) * 100));
    } catch (e) {
      return 50;
    }
  }

  // ===========================================================================
  // END OF SARONIL HIS — LABORATORY LIS COMMAND CENTER VIEW
  // ===========================================================================

})();
