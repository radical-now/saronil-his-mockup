/* ==========================================================================
   SARONIL HIS — EMERGENCY CASUALTY & TRIAGE WORKFLOW MODULE (TIERED)
   Supports Standard Mode (4 tabs, Doctor/Nurse roles) & Advanced Mode (6 tabs, 5 roles)
   Persists tier choice in localStorage key 'saronil_ed_tier' ('standard' | 'advanced')
   ========================================================================== */

(function () {
  'use strict';

  // Local View States
  var activeRole = 'ED Doctor';
  var activeTab = 'cases';
  var triageFilter = 'All';
  var selectedPatientUhid = '';
  var bedViewMode = 'grid'; // grid | list
  
  // Registration Overlay States
  var regOverlayOpen = false;
  var regStep = 1;
  var regIsStable = true; 
  var regTriage = 'YELLOW';
  var isUnknownReg = false; 

  // Triage Assessment local state
  var triageAssessmentPatient = null;

  // Handover shift acknowledgements
  var handoverAcknowledged = {};

  // Reassignment tracking
  var reassignTargetBedId = '';
  var reassignSourceBedId = '';

  // Get current tier status from localStorage
  function getEDTier() {
    var tier = localStorage.getItem('saronil_ed_tier');
    if (!tier) {
      localStorage.setItem('saronil_ed_tier', 'standard');
      return 'standard';
    }
    return tier;
  }

  // Setup patients & beds registries
  function initEmergencyModuleState() {
    if (!window.state) window.state = {};
    if (!window.state.patients) window.state.patients = [];
    if (!window.state.admissions) window.state.admissions = [];
    if (!window.state.bedsStatus) window.state.bedsStatus = {};
    if (!window.state.wards) {
      window.state.wards = {
        'GW': { name: 'General Ward', beds: ['GW-101', 'GW-102', 'GW-103', 'GW-104'] },
        'ICU': { name: 'Intensive Care Unit', beds: ['ICU-201', 'ICU-202'] },
        'CCU': { name: 'Coronary Care Unit', beds: ['CCU-301', 'CCU-302'] }
      };
    }

    // Inject styles
    if (!document.getElementById('triage-colors-css')) {
      const style = document.createElement('style');
      style.id = 'triage-colors-css';
      style.textContent = `
        :root {
          --triage-red: #dc2626;
          --triage-orange: #ea580c;
          --triage-yellow: #d97706;
          --triage-green: #059669;
          --triage-black: #1e293b;
          --triage-red-light: #fee2e2;
          --triage-orange-light: #ffedd5;
          --triage-yellow-light: #fef3c7;
          --triage-green-light: #dcfce7;
          --triage-black-light: #f1f5f9;
        }
      `;
      document.head.appendChild(style);
    }

    // Default 9 sample patients
    var sampleData = [
      { name: "Mohammed Iqbal", uhid: "SH-2026-04799", age: 55, gender: "Male", triage: "RED", complaint: "Unresponsive, RTA", bed: "Resus 1", status: "Doctor Assessing", flags: ["MLC", "Critical"], time: "00:32" },
      { name: "Sunita Sharma", uhid: "SH-2026-04817", age: 68, gender: "Female", triage: "RED", complaint: "Chest pain, diaphoresis", bed: "Resus 2", status: "Under Treatment", flags: ["Critical"], time: "00:18" },
      { name: "Arun Pillai", uhid: "SH-2026-04788", age: 42, gender: "Male", triage: "ORANGE", complaint: "Breathlessness, wheeze", bed: "Acute Bay 1", status: "Awaiting Results", flags: ["Critical"], time: "00:45" },
      { name: "Fatima Begum", uhid: "SH-2026-04810", age: 31, gender: "Female", triage: "ORANGE", complaint: "Alleged assault, head injury", bed: "Acute Bay 2", status: "Doctor Assessing", flags: ["MLC", "Critical"], time: "01:12" },
      { name: "Rajesh Kumar", uhid: "SH-2026-04821", age: 58, gender: "Male", triage: "YELLOW", complaint: "Fever 5 days, vomiting", bed: "General Bay 1", status: "Awaiting Results", flags: [], time: "01:40" },
      { name: "Priya Menon", uhid: "SH-2026-04803", age: 24, gender: "Female", triage: "YELLOW", complaint: "Alleged poisoning", bed: "General Bay 2", status: "Under Treatment", flags: ["MLC", "NDPS"], time: "00:55" },
      { name: "Vikram Singh", uhid: "SH-2026-04790", age: 35, gender: "Male", triage: "GREEN", complaint: "Laceration right hand", bed: "Minor Bay 1", status: "Triaged", flags: [], time: "00:28" },
      { name: "Lakshmi Devi", uhid: "SH-2026-04801", age: 72, gender: "Female", triage: "GREEN", complaint: "Giddiness, fall at home", bed: "Waiting", status: "Awaiting Triage", flags: [], time: "01:05" },
      { name: "Unknown Male ~55yrs", uhid: "SH-2026-04999", age: 55, gender: "Male", triage: "ORANGE", complaint: "Unconscious, found on road. Brought by police. No ID.", bed: "Isolation 1", status: "Doctor Assessing", flags: ["MLC", "Critical"], time: "02:15", isUnidentified: true }
    ];

    // Build the 22 ED Beds Registry
    if (!window.state.emergencyBeds || window.state.emergencyBeds.length === 0) {
      window.state.emergencyBeds = [
        { id: "Resus 1", type: "Resus", status: "Occupied", patientUhid: "SH-2026-04799" },
        { id: "Resus 2", type: "Resus", status: "Occupied", patientUhid: "SH-2026-04817" },
        { id: "Acute Bay 1", type: "Acute", status: "Occupied", patientUhid: "SH-2026-04788" },
        { id: "Acute Bay 2", type: "Acute", status: "Occupied", patientUhid: "SH-2026-04810" },
        { id: "Acute Bay 3", type: "Acute", status: "Cleaning", patientUhid: null },
        { id: "Acute Bay 4", type: "Acute", status: "Available", patientUhid: null },
        { id: "Acute Bay 5", type: "Acute", status: "Available", patientUhid: null },
        { id: "Acute Bay 6", type: "Acute", status: "Available", patientUhid: null },
        { id: "General Bay 1", type: "General", status: "Occupied", patientUhid: "SH-2026-04821" },
        { id: "General Bay 2", type: "General", status: "Occupied", patientUhid: "SH-2026-04803" },
        { id: "General Bay 3", type: "General", status: "Available", patientUhid: null },
        { id: "General Bay 4", type: "General", status: "Available", patientUhid: null },
        { id: "General Bay 5", type: "General", status: "Available", patientUhid: null },
        { id: "General Bay 6", type: "General", status: "Available", patientUhid: null },
        { id: "General Bay 7", type: "General", status: "Available", patientUhid: null },
        { id: "General Bay 8", type: "General", status: "Available", patientUhid: null },
        { id: "Minor Bay 1", type: "Minor", status: "Occupied", patientUhid: "SH-2026-04790" },
        { id: "Minor Bay 2", type: "Minor", status: "Available", patientUhid: null },
        { id: "Minor Bay 3", type: "Minor", status: "Available", patientUhid: null },
        { id: "Minor Bay 4", type: "Minor", status: "Available", patientUhid: null },
        { id: "Isolation 1", type: "Isolation", status: "Occupied", patientUhid: "SH-2026-04999" },
        { id: "Isolation 2", type: "Isolation", status: "Available", patientUhid: null }
      ];
    }

    if (!window.state.emergencyPatients || window.state.emergencyPatients.length === 0) {
      window.state.emergencyPatients = [];
      sampleData.forEach(function (s) {
        var p = window.state.patients.find(pt => pt.uhid === s.uhid);
        if (!p) {
          p = {
            uhid: s.uhid,
            name: s.name,
            age: s.age,
            gender: s.gender,
            mobile: s.isUnidentified ? '—' : "+91 98450 " + Math.floor(10000 + Math.random() * 90000),
            address: s.isUnidentified ? '—' : "HSR Layout, Bengaluru",
            bloodGroup: "B+",
            allergies: s.flags.includes('MLC') ? 'Suspicious Trauma' : 'No Known Allergies',
            vitals: { bp: s.triage === 'RED' ? '85/55' : '120/80', hr: s.triage === 'RED' ? 120 : 72, temp: 98.4, spo2: s.triage === 'RED' ? 88 : 98, weight: 70, bmi: 22.8, pain: 4, rr: s.triage === 'RED' ? 24 : 18 },
            prescriptions: []
          };
          window.state.patients.push(p);
        }

        var ep = {
          uhid: s.uhid,
          erNumber: 'ER-2026-000' + s.uhid.slice(-2),
          triage: s.triage,
          complaint: s.complaint,
          bed: s.bed,
          status: s.status,
          flags: s.flags,
          timeInED: s.time,
          regIncomplete: s.isUnidentified || false,
          isUnidentified: s.isUnidentified || false,
          admittedAt: new Date(Date.now() - parseInt(s.time.split(':')[1]) * 60000 - parseInt(s.time.split(':')[0]) * 3600000).toISOString(),
          vitals: p.vitals || { bp: s.triage === 'RED' ? '85/55' : '120/80', hr: s.triage === 'RED' ? 120 : 72, temp: 98.4, spo2: s.triage === 'RED' ? 88 : 98, weight: 70, bmi: 22.8, pain: 4, rr: s.triage === 'RED' ? 24 : 18 },
          doctor: 'Dr. Fatima Sheikh',
          physicalDescription: s.isUnidentified ? {
            height: "172 cm",
            build: "Medium build",
            complexion: "Wheatish",
            features: "Surgical scar on right knee",
            clothing: "Blue jeans, black t-shirt",
            jewellery: "Silver wrist chain",
            broughtFrom: "HSR Ring Road near bridge",
            policeOfficer: "Sub-Inspector Gowda",
            policeStation: "HSR Layout PS",
            caseRef: "DD-902/2026"
          } : null,
          timeline: [
            { time: '10:45 AM', type: 'emergency', icon: '🚨', title: 'ED Intake', desc: 'Registered in Emergency Ward.' },
            { time: '11:00 AM', type: 'clinical', icon: '🩺', title: 'Triage Check', desc: `Triage Tagged: ${s.triage}. Vitals logged.` }
          ],
          primarySurvey: s.triage === 'RED' ? {
            saved: true,
            savedBy: 'Dr. Fatima Sheikh',
            timestamp: new Date(Date.now() - 20 * 60 * 1000).toLocaleTimeString(),
            airwayStatus: 'Patent ✓',
            airwayNotes: 'Airway clear, patient breathing spontaneously.',
            breathingRR: '24',
            breathingSpo2: '88',
            breathingDelivery: 'Mask',
            breathingNotes: 'Supplementary O2 started @ 6L/min.',
            circulationPulse: '120',
            circulationBP: '85/55',
            circulationIV: '×2 ✓',
            circulationFluids: 'NS 500ml',
            disabilityGcs: '10',
            disabilityPupils: 'Equal & Reactive',
            disabilityBsl: '112',
            exposureExam: 'Yes',
            exposureFindings: 'Bruising on right flank, no major external bleeding.',
            exposureTemp: '98.0',
            exposureWarming: 'Yes'
          } : null,
          resusEvents: s.triage === 'RED' ? [
            { time: '11:15 AM', type: 'Vitals', details: 'BP 85/55, HR 120, SpO₂ 88%', user: 'Nurse Mary' },
            { time: '11:10 AM', type: 'Drug given', details: 'Inj. Tramadol 50mg IV given for pain management', user: 'Nurse Mary' },
            { time: '11:02 AM', type: 'IV access', details: '18G IV bilateral antecubital secured', user: 'Nurse Mary' }
          ] : [],
          mlcDetails: s.flags.includes('MLC') ? {
            isMlc: true,
            diaryNo: 'MLC-2026-00' + s.uhid.slice(-2),
            confirmed: true,
            nature: s.complaint,
            weapon: 'Accident impact suspected',
            policeStation: 'HSR Layout PS',
            informedTime: new Date().toLocaleDateString() + ' · 10:30 AM',
            officerName: 'Sgt. Ravikumar',
            firNo: 'FIR-2026-' + s.uhid.slice(-3),
            acknowledged: true,
            witnessHistory: 'Found unconscious on HSR main road.',
            evidencePreserved: ['clothes']
          } : null
        };
        window.state.emergencyPatients.push(ep);

        // Occupy bed status registry mapping
        if (s.bed !== 'Waiting') {
          window.state.bedsStatus[s.bed] = {
            wardKey: 'EMERGENCY',
            status: 'Occupied',
            patientUhid: s.uhid,
            patientName: s.name,
            doctorName: 'Dr. Fatima Sheikh',
            diagnosis: `Casualty Intake - ${s.complaint}`,
            notes: `Emergency intake Triage ${s.triage}`
          };
        }
      });
      localStorage.setItem('saronil_bedsStatus', JSON.stringify(window.state.bedsStatus));
    }

    // Seed alert banners
    if (!window.state.emergencyAlerts) {
      window.state.emergencyAlerts = [
        { id: 'al-iqbal', uhid: 'SH-2026-04799', name: 'Mohammed Iqbal', text: '🔴 RESUS BAY 1 — Mohammed Iqbal — SpO₂ dropping: 88% → 84% — Last recorded 4 min ago', acknowledged: false }
      ];
    }

    // Seed waiting triage queue
    if (!window.state.emergencyTriageQueue) {
      window.state.emergencyTriageQueue = [
        { name: "Rajiv Malhotra", age: 48, gender: "Male", arrivalMode: "Ambulance", complaint: "Suspected stroke, facial droop", time: "11:15 AM", waitMins: 35 },
        { name: "Baby of Shalini", age: 3, gender: "Female", arrivalMode: "Walk-in", complaint: "High grade fever, convulsions", time: "11:40 AM", waitMins: 10 }
      ];
    }

    // Seed handover history registry
    if (!window.state.emergencyHandovers) {
      window.state.emergencyHandovers = [
        { date: 'Yesterday', shift: 'Night (12 AM)', outgoing: 'Dr. Srinivasan', incoming: 'Dr. Fatima Sheikh', patientsCount: 7 }
      ];
    }
  }

  // Get active patients filtered by Standard vs Advanced
  function getEDPatients() {
    var tier = getEDTier();
    var list = window.state.emergencyPatients || [];
    if (tier === 'advanced') {
      return list;
    } else {
      // Standard: 6 patients (exclude Arun Pillai, Fatima Begum, Lakshmi Devi)
      // also map ORANGE/BLACK to YELLOW/GREEN
      var std = list.filter(p => p.uhid !== 'SH-2026-04788' && p.uhid !== 'SH-2026-04810' && p.uhid !== 'SH-2026-04801');
      return std.map(p => {
        var copy = Object.assign({}, p);
        if (copy.triage === 'ORANGE') copy.triage = 'YELLOW';
        if (copy.triage === 'BLACK') copy.triage = 'YELLOW';
        return copy;
      });
    }
  }

  // Register main view inside router
  window.views.emergency = function (container, subAnchor, params) {
    var pageTitleEl = document.getElementById('active-page-title');
    if (pageTitleEl) pageTitleEl.textContent = 'Emergency Command Console';

    initEmergencyModuleState();

    if (params && params.uhid) {
      selectedPatientUhid = params.uhid;
    }

    injectEDStyles();
    renderEDDashboard(container);
  };

  function injectEDStyles() {
    if (document.getElementById('ed-styles-injected-v3')) return;
    const style = document.createElement('style');
    style.id = 'ed-styles-injected-v3';
    style.textContent = `
      .ed-wrap { display: flex; flex-direction: column; gap: 16px; font-family: 'Outfit', 'Inter', sans-serif; color: #1e293b; }
      .ed-badge { font-size: 0.7rem; font-weight: 700; text-transform: uppercase; padding: 3px 8px; border-radius: 4px; display: inline-block; }
      .ed-badge.red { background-color: var(--triage-red-light); color: var(--triage-red); border: 1px solid #fca5a5; }
      .ed-badge.orange { background-color: var(--triage-orange-light); color: var(--triage-orange); border: 1px solid #fdba74; }
      .ed-badge.yellow { background-color: var(--triage-yellow-light); color: var(--triage-yellow); border: 1px solid #fde68a; }
      .ed-badge.green { background-color: var(--triage-green-light); color: var(--triage-green); border: 1px solid #a7f3d0; }
      .ed-badge.black { background-color: var(--triage-black-light); color: var(--triage-black); border: 1px solid #cbd5e1; }
      
      .status-dot { height: 8px; width: 8px; border-radius: 50%; display: inline-block; margin-right: 6px; }
      .status-pulse { animation: pulse-animation 1.5s infinite; }
      @keyframes pulse-animation {
        0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(37, 99, 235, 0.7); }
        70% { transform: scale(1); box-shadow: 0 0 0 6px rgba(37, 99, 235, 0); }
        100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(37, 99, 235, 0); }
      }

      .tab-bar { position: sticky; top: 0; z-index: 10; background: #f8fafc; padding: 4px 0; display: flex; border-bottom: 2px solid #e2e8f0; gap: 4px; }
      .tab-btn { padding: 8px 16px; font-size: 0.85rem; font-weight: 600; border: none; background: transparent; color: #64748b; cursor: pointer; border-radius: 6px 6px 0 0; display: flex; align-items: center; gap: 6px; transition: all 0.2s; }
      .tab-btn:hover { background: #f1f5f9; color: #0f172a; }
      .tab-btn.active { background: #fff; color: #2563eb; border-bottom: 2px solid #2563eb; box-shadow: 0 1px 2px rgba(0,0,0,0.05); }

      .stat-chip { flex: 1; padding: 10px; border-radius: 8px; cursor: pointer; display: flex; flex-direction: column; align-items: center; gap: 4px; transition: all 0.15s; border: 1px solid transparent; }
      .stat-chip.active { box-shadow: inset 0 2px 4px rgba(0,0,0,0.06); }

      .er-table { width: 100%; border-collapse: collapse; font-size: 0.8rem; }
      .er-table th { background: #f8fafc; padding: 10px 12px; font-weight: 700; color: #475569; text-align: left; border-bottom: 2px solid #e2e8f0; }
      .er-table td { padding: 12px; border-bottom: 1px solid #e2e8f0; vertical-align: middle; }
      .er-table tr.RED { background-color: var(--triage-red-light); }
      .er-table tr.ORANGE { background-color: var(--triage-orange-light); }
      .er-table tr.YELLOW { background-color: var(--triage-yellow-light); }
      .er-table tr.GREEN { background-color: #ffffff; }
      .er-table tr.BLACK { background-color: var(--triage-black-light); }

      .action-pill { background: #3b82f6; color: #fff; border: none; padding: 4px 8px; border-radius: 4px; font-weight: 600; font-size: 0.7rem; cursor: pointer; }
      .action-pill:hover { background: #2563eb; }
      .kebab-btn { background: transparent; border: none; cursor: pointer; padding: 4px 8px; border-radius: 4px; font-weight: bold; }
      .kebab-btn:hover { background: rgba(0,0,0,0.05); }

      .dropdown-content { display: none; position: absolute; right: 0; background-color: #fff; min-width: 160px; box-shadow: 0px 8px 16px 0px rgba(0,0,0,0.1); z-index: 100; border-radius: 6px; border: 1px solid #cbd5e1; overflow: hidden; }
      .dropdown-content a { color: #1e293b; padding: 8px 12px; text-decoration: none; display: block; font-size: 0.75rem; font-weight: 600; }
      .dropdown-content a:hover { background-color: #f1f5f9; color: #000; }

      .form-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
      @media(max-width: 768px) { .form-grid { grid-template-columns: 1fr 1fr; } }
      .form-field { display: flex; flex-direction: column; gap: 4px; }
      .form-field label { font-size: 0.7rem; font-weight: 700; color: #475569; text-transform: uppercase; }
      .form-field input, .form-field select, .form-field textarea { padding: 8px 10px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 0.8rem; outline: none; }
      .form-field input:focus { border-color: #2563eb; }

      .triage-selector { display: flex; gap: 8px; margin-top: 8px; }
      .triage-sel-btn { flex: 1; padding: 10px; border-radius: 6px; font-weight: 800; font-size: 0.75rem; cursor: pointer; border: 2px solid transparent; text-align: center; transition: all 0.2s; }
      .triage-sel-btn.red { border-color: var(--triage-red); color: var(--triage-red); background: var(--triage-red-light); }
      .triage-sel-btn.red.active { background: var(--triage-red); color: #fff; }
      .triage-sel-btn.orange { border-color: var(--triage-orange); color: var(--triage-orange); background: var(--triage-orange-light); }
      .triage-sel-btn.orange.active { background: var(--triage-orange); color: #fff; }
      .triage-sel-btn.yellow { border-color: var(--triage-yellow); color: var(--triage-yellow); background: var(--triage-yellow-light); }
      .triage-sel-btn.yellow.active { background: var(--triage-yellow); color: #fff; }
      .triage-sel-btn.green { border-color: var(--triage-green); color: var(--triage-green); background: var(--triage-green-light); }
      .triage-sel-btn.green.active { background: var(--triage-green); color: #fff; }
      .triage-sel-btn.black { border-color: var(--triage-black); color: var(--triage-black); background: var(--triage-black-light); }
      .triage-sel-btn.black.active { background: var(--triage-black); color: #fff; }

      .checklist-card { background: #fff; border: 1px solid #cbd5e1; border-radius: 8px; padding: 12px; }
      .checklist-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 6px; }
      .checklist-item { display: flex; align-items: center; gap: 8px; font-size: 0.75rem; font-weight: 600; cursor: pointer; }

      .resus-timeline { border-left: 2px solid #cbd5e1; padding-left: 16px; margin-left: 10px; display: flex; flex-direction: column; gap: 16px; }
      .timeline-node { position: relative; }
      .timeline-node::before { content: ''; position: absolute; left: -22px; top: 2px; height: 10px; width: 10px; background: #3b82f6; border: 2px solid #fff; border-radius: 50%; }

      /* Bed View layout style cards */
      .bay-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 12px; }
      .bed-card { background: #fff; border: 1.5px solid #cbd5e1; border-radius: 10px; padding: 12px; display: flex; flex-direction: column; justify-content: space-between; min-height: 120px; transition: all 0.2s; }
      .bed-card.RED { background: var(--triage-red-light); border-color: var(--triage-red); }
      .bed-card.ORANGE { background: var(--triage-orange-light); border-color: var(--triage-orange); }
      .bed-card.YELLOW { background: var(--triage-yellow-light); border-color: var(--triage-yellow); }
      .bed-card.GREEN { background: var(--triage-green-light); border-color: var(--triage-green); }
      .bed-card.CLEANING { background: var(--triage-black-light); border-color: #94a3b8; }
      .bed-card.RESERVED { background: #eff6ff; border-color: #3b82f6; }
      .bed-card.AVAILABLE { border-style: dashed; }

      .toggle-switch-container { display: flex; background: #e2e8f0; border-radius: 6px; padding: 2px; align-items: center; }
      .toggle-switch-btn { border: none; padding: 4px 8px; font-size: 0.75rem; font-weight: 700; border-radius: 4px; cursor: pointer; transition: all 0.15s; background: transparent; color: #475569; }
      .toggle-switch-btn.active { background: #fff; color: #1e293b; box-shadow: 0 1px 2px rgba(0,0,0,0.05); }
    `;
    document.head.appendChild(style);
  }

  function renderEDDashboard(container) {
    if (selectedPatientUhid) {
      renderPatient360View(container, selectedPatientUhid);
      return;
    }

    if (regOverlayOpen) {
      renderRegistrationOverlay(container);
      return;
    }

    var tier = getEDTier();

    var html = `
      <div class="ed-wrap">
        <!-- Roster header command -->
        <div style="display:flex; justify-content:space-between; align-items:center; background:#fff; border:1px solid #cbd5e1; padding:12px 20px; border-radius:10px;">
          <div>
            <h2 style="margin:0; font-size:1.25rem; font-weight:800; color:#1e3a8a; display:flex; align-items:center; gap:8px;">🚨 ED Casualty Room</h2>
            <div style="font-size:0.75rem; color:#64748b; font-weight:600; margin-top:2px;">NABH Compliant Casualty Triage Protocol</div>
          </div>
          
          <div style="display:flex; align-items:center; gap:16px;">
            <!-- CRITICAL TIER TOGGLE -->
            <div style="display:flex; align-items:center; gap:6px;">
              <span style="font-size:0.75rem; font-weight:800; color:#475569; text-transform:uppercase;">Hospital Mode:</span>
              <div class="toggle-switch-container">
                <button class="toggle-switch-btn ${tier === 'standard' ? 'active' : ''}" onclick="window.switchEDMode('standard')">Standard</button>
                <button class="toggle-switch-btn ${tier === 'advanced' ? 'active' : ''}" onclick="window.switchEDMode('advanced')">Advanced</button>
              </div>
            </div>

            <!-- Role Selector -->
            <div style="display:flex; align-items:center; gap:6px;">
              <span style="font-size:0.8rem; font-weight:700; color:#475569;">Active Role:</span>
              <select id="ed-role-selector" style="padding:6px 10px; border-radius:6px; border:1px solid #cbd5e1; font-weight:600; font-size:0.8rem; background:#fff; cursor:pointer;" onchange="window.switchEDRole(this.value)">
                ${renderRoleOptions(tier)}
              </select>
            </div>
            
            <button class="btn btn-primary" style="background:#1d4ed8; border:none; padding:7px 14px; font-size:0.8rem; font-weight:700; border-radius:6px; margin-right:4px;" onclick="window.showStockRequestOverlay({dept:'Emergency', urgency:'STAT'})">
              📦 Request Stock
            </button>
            <button class="btn btn-primary" style="background:#2563eb; border:none; padding:7px 14px; font-size:0.8rem; font-weight:700; border-radius:6px;" onclick="window.openRegOverlay(true)">
              + New ED Patient
            </button>
          </div>
        </div>

        <!-- Sticky Tabs navigation bar -->
        <div class="tab-bar">
          ${renderTabButtons(tier)}
        </div>

        <div id="ed-tab-content">
          ${renderTabContent(tier)}
        </div>
        <!-- My Recent Requests -->
        ${window.renderMyRecentRequestsHTML ? window.renderMyRecentRequestsHTML('Emergency') : ''}
      </div>
    `;

    container.innerHTML = html;
  }

  // Switch hospital tier modes instantly
  window.switchEDMode = function (tier) {
    localStorage.setItem('saronil_ed_tier', tier);
    
    // Auto-adjust active role for standard mode
    if (tier === 'standard') {
      if (activeRole !== 'Doctor' && activeRole !== 'Nurse') {
        activeRole = 'Doctor';
      }
    } else {
      // Switch active role name if converting to advanced
      if (activeRole === 'Doctor') activeRole = 'ED Doctor';
      if (activeRole === 'Nurse') activeRole = 'Triage Nurse';
    }

    renderEDDashboard(document.getElementById('main-content'));
  };

  function renderRoleOptions(tier) {
    if (tier === 'standard') {
      return `
        <option value="Doctor" ${activeRole === 'Doctor' ? 'selected' : ''}>Doctor</option>
        <option value="Nurse" ${activeRole === 'Nurse' ? 'selected' : ''}>Nurse</option>
      `;
    } else {
      return `
        <option value="ED Doctor" ${activeRole === 'ED Doctor' ? 'selected' : ''}>ED Doctor</option>
        <option value="Triage Nurse" ${activeRole === 'Triage Nurse' ? 'selected' : ''}>Triage Nurse</option>
        <option value="ED Nurse" ${activeRole === 'ED Nurse' ? 'selected' : ''}>ED Nurse</option>
        <option value="Billing" ${activeRole === 'Billing' ? 'selected' : ''}>Billing Executive</option>
        <option value="Administrator" ${activeRole === 'Administrator' ? 'selected' : ''}>ED Administrator</option>
      `;
    }
  }

  function renderTabButtons(tier) {
    var tabs = [];
    if (tier === 'standard') {
      tabs = [
        { id: 'cases',    icon: '🚨',  label: 'Active Cases' },
        { id: 'triage',   icon: '🪑',  label: 'Triage Queue' },
        { id: 'beds',     icon: '🛏️', label: 'Bed View' },
        { id: 'mlc',      icon: '📋',  label: 'MLC Register' },
        { id: 'handover', icon: '🔄',  label: 'Handover' },
        { id: 'stats',    icon: '📊',  label: 'ED Stats' }
      ];
    } else {
      tabs = [
        { id: 'cases',    icon: '🚨',  label: 'Active Cases' },
        { id: 'triage',   icon: '🪑',  label: 'Triage Queue' },
        { id: 'beds',     icon: '🛏️', label: 'Bed View' },
        { id: 'mlc',      icon: '📋',  label: 'MLC Register' },
        { id: 'handover', icon: '🔄',  label: 'Shift Handover' },
        { id: 'stats',    icon: '📊',  label: 'ED Stats' }
      ];
    }

    return tabs.map(t => `
      <button class="tab-btn ${activeTab === t.id ? 'active' : ''}" onclick="window.switchEDTab('${t.id}')">
        <span>${t.icon}</span> ${t.label}
      </button>
    `).join('');
  }

  window.switchEDRole = function (role) {
    activeRole = role;
    var tier = getEDTier();
    
    // Auto-adjust default active tab per role in advanced mode
    if (tier === 'advanced') {
      if (role === 'ED Doctor') activeTab = 'cases';
      else if (role === 'Triage Nurse') activeTab = 'triage';
      else if (role === 'ED Nurse') activeTab = 'beds'; 
      else if (role === 'Administrator') activeTab = 'stats';
    }
    
    renderEDDashboard(document.getElementById('main-content'));
  };

  window.switchEDTab = function (tab) {
    activeTab = tab;
    renderEDDashboard(document.getElementById('main-content'));
  };

  function renderTabContent(tier) {
    switch (activeTab) {
      case 'cases':
        return renderActiveCasesTab(tier);
      case 'triage':
        return renderTriageQueueTab();
      case 'beds':
        return renderBedViewTab();
      case 'mlc':
        return renderMLCRegisterTab(tier);
      case 'handover':
        return renderHandoverTab(tier);
      case 'stats':
        return renderEDStatsTab(tier);
      default:
        return renderActiveCasesTab(tier);
    }
  }

  function renderEDKebabActions(ep) {
    var actionsHTML = '';
    var isDoc = (activeRole === 'ED Doctor' || activeRole === 'Doctor');
    var isNurse = (activeRole === 'Triage Nurse' || activeRole === 'ED Nurse' || activeRole === 'Nurse');
    var isBilling = (activeRole === 'Billing');

    if (isDoc) {
      actionsHTML += `
        <a href="javascript:void(0)" onclick="window.viewERPatient('${ep.uhid}')">👁️ View Record</a>
        <a href="javascript:void(0)" onclick="window.edToast('Write Note for ${ep.uhid}')">📝 Write Note</a>
        <a href="javascript:void(0)" onclick="window.edToast('Order Lab for ${ep.uhid}')">🩸 Order Lab</a>
        <a href="javascript:void(0)" onclick="window.viewERPatient('${ep.uhid}', 'disposition')">📤 Initiate Discharge</a>
        <a href="javascript:void(0)" onclick="window.viewERPatient('${ep.uhid}', 'disposition')">🏢 Transfer</a>
        ${!ep.flags.includes('MLC') ? `<a href="javascript:void(0)" onclick="window.triggerMLC('${ep.uhid}')">⚖️ Mark MLC</a>` : ''}
      `;
    } else if (isNurse) {
      actionsHTML += `
        <a href="javascript:void(0)" onclick="window.openNurseVitalsModal('${ep.uhid}')">🌡️ Record Vitals</a>
        <a href="javascript:void(0)" onclick="window.openNurseMarModal('${ep.uhid}')">💊 Administer Meds</a>
        <a href="javascript:void(0)" onclick="window.edToast('Acknowledge Orders for ${ep.uhid}')">✓ Acknowledge Order</a>
        <a href="javascript:void(0)" onclick="window.edToast('Escalate ${ep.uhid}')">⚠️ Escalate</a>
      `;
    } else if (isBilling) {
      actionsHTML += `
        <a href="javascript:void(0)" onclick="window.edToast('View Bill for ${ep.uhid}')">💵 View Bill</a>
        <a href="javascript:void(0)" onclick="window.edToast('Collect Deposit for ${ep.uhid}')">💳 Collect Deposit</a>
      `;
    } else {
      actionsHTML += `
        <a href="javascript:void(0)" onclick="window.viewERPatient('${ep.uhid}')">👁️ View Record</a>
      `;
    }
    return actionsHTML;
  }

  /* ==========================================================================
     TAB 1 — ACTIVE CASES
     ========================================================================== */
  function renderActiveCasesTab(tier) {
    var alertBannerHTML = '';
    var activeAlerts = (window.state.emergencyAlerts || []).filter(a => !a.acknowledged);
    activeAlerts.forEach(function(alert) {
      alertBannerHTML += `
        <div style="background:var(--triage-red-light); border-left:4px solid var(--triage-red); border-radius:6px; padding:12px 18px; margin-bottom:12px; display:flex; justify-content:space-between; align-items:center;">
          <div style="font-weight:700; color:#7f1d1d; font-size:0.85rem; display:flex; align-items:center; gap:8px;">
            <span>⚠️</span> ${alert.text}
          </div>
          <div style="display:flex; gap:8px;">
            <button class="btn btn-secondary btn-sm" style="background:#fff; border:1px solid #fca5a5; color:var(--triage-red); padding:4px 10px; font-weight:700; font-size:0.75rem;" onclick="window.ackAlert('${alert.id}')">Acknowledge</button>
            <button class="btn btn-primary btn-sm" style="background:var(--triage-red); border:none; color:#fff; padding:4px 10px; font-weight:700; font-size:0.75rem;" onclick="window.viewERPatient('${alert.uhid}')">View Patient</button>
          </div>
        </div>
      `;
    });

    var patients = getEDPatients();
    var totalCount = patients.length;
    var redCount = patients.filter(p => p.triage === 'RED').length;
    var orangeCount = patients.filter(p => p.triage === 'ORANGE').length;
    var yellowCount = patients.filter(p => p.triage === 'YELLOW').length;
    var greenCount = patients.filter(p => p.triage === 'GREEN').length;
    var blackCount = patients.filter(p => p.triage === 'BLACK').length;

    var summaryStripHTML = '';
    if (tier === 'standard') {
      summaryStripHTML = `
        <div style="display:flex; background:#fff; border:1px solid #cbd5e1; border-radius:8px; padding:6px; gap:6px; margin-bottom:16px;">
          <div class="stat-chip ${triageFilter === 'All' ? 'active' : ''}" style="background:${triageFilter === 'All' ? '#e2e8f0' : '#f8fafc'}; color:#0f172a;" onclick="window.setTriageFilter('All')">
            <strong>All (${totalCount})</strong>
          </div>
          <div class="stat-chip ${triageFilter === 'RED' ? 'active' : ''}" style="background:${triageFilter === 'RED' ? 'var(--triage-red)' : 'var(--triage-red-light)'}; color:${triageFilter === 'RED' ? '#fff' : 'var(--triage-red)'};" onclick="window.setTriageFilter('RED')">
            <strong>🔴 Red (${redCount})</strong>
          </div>
          <div class="stat-chip ${triageFilter === 'YELLOW' ? 'active' : ''}" style="background:${triageFilter === 'YELLOW' ? 'var(--triage-yellow)' : 'var(--triage-yellow-light)'}; color:${triageFilter === 'YELLOW' ? '#fff' : 'var(--triage-yellow)'};" onclick="window.setTriageFilter('YELLOW')">
            <strong>🟡 Yellow (${yellowCount})</strong>
          </div>
          <div class="stat-chip ${triageFilter === 'GREEN' ? 'active' : ''}" style="background:${triageFilter === 'GREEN' ? 'var(--triage-green)' : 'var(--triage-green-light)'}; color:${triageFilter === 'GREEN' ? '#fff' : 'var(--triage-green)'};" onclick="window.setTriageFilter('GREEN')">
            <strong>🟢 Green (${greenCount})</strong>
          </div>
        </div>
      `;
    } else {
      summaryStripHTML = `
        <div style="display:flex; background:#fff; border:1px solid #cbd5e1; border-radius:8px; padding:6px; gap:6px; margin-bottom:16px;">
          <div class="stat-chip ${triageFilter === 'All' ? 'active' : ''}" style="background:${triageFilter === 'All' ? '#e2e8f0' : '#f8fafc'}; color:#0f172a;" onclick="window.setTriageFilter('All')">
            <strong>All (${totalCount})</strong>
          </div>
          <div class="stat-chip ${triageFilter === 'RED' ? 'active' : ''}" style="background:${triageFilter === 'RED' ? 'var(--triage-red)' : 'var(--triage-red-light)'}; color:${triageFilter === 'RED' ? '#fff' : 'var(--triage-red)'};" onclick="window.setTriageFilter('RED')">
            <strong>🔴 Red (${redCount})</strong>
          </div>
          <div class="stat-chip ${triageFilter === 'ORANGE' ? 'active' : ''}" style="background:${triageFilter === 'ORANGE' ? 'var(--triage-orange)' : 'var(--triage-orange-light)'}; color:${triageFilter === 'ORANGE' ? '#fff' : 'var(--triage-orange)'};" onclick="window.setTriageFilter('ORANGE')">
            <strong>🟠 Orange (${orangeCount})</strong>
          </div>
          <div class="stat-chip ${triageFilter === 'YELLOW' ? 'active' : ''}" style="background:${triageFilter === 'YELLOW' ? 'var(--triage-yellow)' : 'var(--triage-yellow-light)'}; color:${triageFilter === 'YELLOW' ? '#fff' : 'var(--triage-yellow)'};" onclick="window.setTriageFilter('YELLOW')">
            <strong>🟡 Yellow (${yellowCount})</strong>
          </div>
          <div class="stat-chip ${triageFilter === 'GREEN' ? 'active' : ''}" style="background:${triageFilter === 'GREEN' ? 'var(--triage-green)' : 'var(--triage-green-light)'}; color:${triageFilter === 'GREEN' ? '#fff' : 'var(--triage-green)'};" onclick="window.setTriageFilter('GREEN')">
            <strong>🟢 Green (${greenCount})</strong>
          </div>
          <div class="stat-chip ${triageFilter === 'BLACK' ? 'active' : ''}" style="background:${triageFilter === 'BLACK' ? 'var(--triage-black)' : 'var(--triage-black-light)'}; color:${triageFilter === 'BLACK' ? '#fff' : 'var(--triage-black)'};" onclick="window.setTriageFilter('BLACK')">
            <strong>⚫ Black (${blackCount})</strong>
          </div>
        </div>
      `;
    }

    var filteredPatients = patients.filter(function(p) {
      if (triageFilter === 'All') return true;
      return p.triage === triageFilter;
    });

    var rowsHTML = '';
    filteredPatients.forEach(function(ep) {
      var isMlc = ep.flags.includes('MLC');
      var isUnid = ep.isUnidentified;
      
      var flagsHTML = '';
      if (isUnid) flagsHTML += `<span class="ed-badge" style="font-size:0.55rem; padding:1px 3px; background:#ffedd5; color:#ea580c; border:1px solid #fed7aa; margin-right:2px; vertical-align:middle;">🔍 UNID</span>`;
      if (isMlc) flagsHTML += `<span class="ed-badge" style="font-size:0.55rem; padding:1px 3px; background:#fee2e2; color:#b91c1c; border:1px solid #fca5a5; margin-right:2px; vertical-align:middle;">⚖️ MLC</span>`;
      ep.flags.forEach(f => {
        if (f !== 'MLC' && f !== 'Critical') {
          flagsHTML += `<span class="ed-badge" style="font-size:0.55rem; padding:1px 3px; background:#e2e8f0; color:#334155; margin-right:2px; vertical-align:middle;">${f}</span>`;
        }
      });

      var timeParts = ep.timeInED.split(':');
      var hours = parseInt(timeParts[0]);
      var timeColor = '#059669'; 
      if (hours >= 3) timeColor = '#dc2626'; 
      else if (hours >= 1) timeColor = '#d97706'; 

      var bpAbnormal = ep.vitals && ep.vitals.bp && parseInt(ep.vitals.bp.split('/')[0]) < 90;
      var spo2Abnormal = ep.vitals && ep.vitals.spo2 && ep.vitals.spo2 < 90;
      var vitalsHTML = `
        <span style="${bpAbnormal ? 'color:#ef4444; font-weight:bold;' : ''}">${ep.vitals?.bp || '--'}</span> · 
        <span>${ep.vitals?.hr || '--'}</span> · 
        <span style="${spo2Abnormal ? 'color:#ef4444; font-weight:bold;' : ''}">${ep.vitals?.spo2 || '--'}%</span>
      `;

      var statusColor = '#94a3b8';
      var pulsing = '';
      if (ep.status === 'Doctor Assessing') { statusColor = '#2563eb'; pulsing = 'status-pulse'; }
      else if (ep.status === 'Under Treatment') statusColor = '#10b981';
      else if (ep.status === 'Awaiting Results') statusColor = '#f59e0b';
      else if (ep.status === 'Awaiting Bed') statusColor = '#8b5cf6';
      else if (ep.status === 'Ready for Discharge') statusColor = '#06b6d4';
      else if (ep.status === 'Brought Dead') statusColor = '#1e293b';

      // Standard mode maps bed label to simply Bed (e.g. Resus 1 -> Bed 1)
      var bedLabel = ep.bed;
      if (tier === 'standard') {
        bedLabel = bedLabel.replace('Resus', 'Bed').replace('Acute Bay', 'Bed').replace('General Bay', 'Bed').replace('Minor Bay', 'Bed').replace('Isolation', 'Bed');
      }

      rowsHTML += `
        <tr class="${ep.triage}" style="cursor:pointer;" onclick="window.viewERPatient('${ep.uhid}')">
          <td><span class="ed-badge ${ep.triage.toLowerCase()}">${ep.triage}</span></td>
          <td>
            <strong style="font-size:0.85rem; color:#0f172a;">${window.state.patients.find(pt => pt.uhid === ep.uhid)?.name || 'Unknown Patient'}</strong>
            ${ep.regIncomplete ? `<span style="font-size:0.6rem; color:#d97706; border:1px solid #fde68a; background:#fef3c7; border-radius:3px; padding:1px 3px; margin-left:4px; font-weight:700;">Incomplete</span>` : ''}
            <div class="mono" style="font-size:0.65rem; color:#64748b; margin-top:2px;">${ep.erNumber}</div>
          </td>
          <td>${window.state.patients.find(pt => pt.uhid === ep.uhid)?.age || '--'} · ${window.state.patients.find(pt => pt.uhid === ep.uhid)?.gender.slice(0, 1) || '--'}</td>
          <td style="color:#334155; font-size:0.75rem;">${ep.complaint.length > 40 ? ep.complaint.substring(0, 40) + '...' : ep.complaint}</td>
          <td><strong style="color:#475569;">${bedLabel === 'Waiting' ? '⏳ Waiting' : bedLabel}</strong></td>
          <td><strong style="color:${timeColor};">${ep.timeInED}</strong></td>
          <td class="mono" style="font-size:0.75rem;">${vitalsHTML}</td>
          <td>
            <span class="status-dot ${pulsing}" style="background-color:${statusColor};"></span>
            <span style="font-size:0.7rem; font-weight:700; color:#334155;">${ep.status}</span>
          </td>
          ${tier === 'advanced' ? `<td style="color:#475569; font-size:0.75rem;">${ep.doctor}</td>` : ''}
          <td>${flagsHTML}</td>
          <td style="text-align:right;" onclick="event.stopPropagation()">
            <div style="position:relative; display:inline-block;">
              <button class="action-pill" onclick="window.viewERPatient('${ep.uhid}')">View</button>
              <button class="kebab-btn" onclick="window.toggleEDKebab(event, '${ep.uhid}')">⋮</button>
              <div class="dropdown-content" id="kebab-dropdown-${ep.uhid}">
                ${renderEDKebabActions(ep)}
              </div>
            </div>
          </td>
        </tr>
      `;
    });

    var headersHTML = '';
    if (tier === 'standard') {
      headersHTML = `
        <th style="width:60px;">Triage</th>
        <th style="width:180px;">Patient</th>
        <th style="width:60px;">Age/Sex</th>
        <th style="width:200px;">Chief Complaint</th>
        <th style="width:80px;">Bed</th>
        <th style="width:80px;">Time in ED</th>
        <th style="width:160px;">Vitals</th>
        <th style="width:110px;">Status</th>
        <th style="width:80px;">Flags</th>
        <th style="width:80px; text-align:right;">Actions</th>
      `;
    } else {
      headersHTML = `
        <th style="width:60px;">Triage</th>
        <th style="width:180px;">Patient</th>
        <th style="width:60px;">Age/Sex</th>
        <th style="width:200px;">Chief Complaint</th>
        <th style="width:80px;">Bay/Bed</th>
        <th style="width:80px;">Time in ED</th>
        <th style="width:160px;">Vitals</th>
        <th style="width:110px;">Status</th>
        <th style="width:120px;">Doctor</th>
        <th style="width:80px;">Flags</th>
        <th style="width:80px; text-align:right;">Actions</th>
      `;
    }

    var html = `
      ${alertBannerHTML}
      ${summaryStripHTML}
      
      <div style="background:#fff; border:1px solid #cbd5e1; border-radius:10px; box-shadow:0 1px 3px rgba(0,0,0,0.05); overflow:hidden;">
        <div style="padding:12px 18px; border-bottom:1px solid #cbd5e1; font-weight:700; font-size:0.85rem; color:#334155; background:#f8fafc;">
          Active Patients in Emergency Ward (${filteredPatients.length})
        </div>
        <div style="overflow-x:auto;">
          <table class="er-table">
            <thead>
              <tr>
                ${headersHTML}
              </tr>
            </thead>
            <tbody>
              ${rowsHTML}
            </tbody>
          </table>
        </div>
      </div>
    `;

    return html;
  }

  window.toggleEDKebab = function (event, uhid) {
    event.stopPropagation();
    const dropdown = document.getElementById(`kebab-dropdown-${uhid}`);
    const alreadyOpen = dropdown.style.display === 'block';
    document.querySelectorAll('.dropdown-content').forEach(d => d.style.display = 'none');
    if (!alreadyOpen) {
      dropdown.style.display = 'block';
      const closeHandler = function() {
        dropdown.style.display = 'none';
        document.removeEventListener('click', closeHandler);
      };
      setTimeout(() => document.addEventListener('click', closeHandler), 10);
    }
  };

  window.edToast = function (action) {
    alert(`[Action] recorded:\n"${action}" requested successfully inside Saronil HIS Emergency command.`);
  };

  window.setTriageFilter = function (filter) {
    triageFilter = filter;
    renderEDDashboard(document.getElementById('main-content'));
  };

  window.ackAlert = function (alertId) {
    var alertObj = window.state.emergencyAlerts.find(a => a.id === alertId);
    if (alertObj) alertObj.acknowledged = true;
    renderEDDashboard(document.getElementById('main-content'));
  };

  window.viewERPatient = function (uhid, subSection) {
    selectedPatientUhid = uhid;
    if (subSection) {
      setTimeout(() => {
        const el = document.getElementById(`tab-link-${subSection}`);
        if (el) el.click();
      }, 50);
    }
    renderEDDashboard(document.getElementById('main-content'));
  };

  window.triggerMLC = function (uhid) {
    var ep = window.state.emergencyPatients.find(p => p.uhid === uhid);
    if (ep) {
      if (!ep.flags.includes('MLC')) ep.flags.push('MLC');
      ep.mlcDetails = ep.mlcDetails || {
        isMlc: true,
        diaryNo: 'MLC-2026-00' + uhid.slice(-2),
        confirmed: false,
        nature: ep.complaint,
        policeStation: 'HSR Layout PS',
        informedTime: 'Awaiting doctor signature'
      };
      alert(`MLC Flag raised for ${window.state.patients.find(p=>p.uhid===uhid)?.name}.\nDoctor must confirm and fill injury details.`);
      renderEDDashboard(document.getElementById('main-content'));
    }
  };

  /* ==========================================================================
     TAB 2 — TRIAGE QUEUE (ADVANCED ONLY)
     ========================================================================== */
  function renderTriageQueueTab() {
    var newArrivalForm = `
      <div style="background:#fff; border:1px solid #cbd5e1; border-radius:10px; padding:16px; margin-bottom:16px;">
        <div style="font-size:0.75rem; font-weight:700; color:#334155; text-transform:uppercase; margin-bottom:12px; letter-spacing:0.05em; display:flex; justify-content:space-between; align-items:center;">
          <span>🛏️ Log New Arrival (Pre-registration)</span>
          <label style="font-size:0.75rem; color:#ea580c; font-weight:700; cursor:pointer; display:flex; align-items:center; gap:4px;">
            <input type="checkbox" id="triage-arr-unknown-chk" onchange="window.toggleTriageUnknown(this.checked)"> Unknown Patient Protocol
          </label>
        </div>
        <div style="display:flex; flex-wrap:wrap; gap:10px; align-items:flex-end;">
          <div style="flex:1.5; min-width:150px; display:flex; flex-direction:column; gap:4px;">
            <label style="font-size:0.65rem; font-weight:700; color:#64748b;">PATIENT NAME</label>
            <input type="text" id="triage-arr-name" placeholder="Name or Unknown Male" value="Jane Doe" style="padding:7px 10px; border:1px solid #cbd5e1; border-radius:6px; font-size:0.8rem; outline:none;">
          </div>
          <div style="flex:0.5; min-width:60px; display:flex; flex-direction:column; gap:4px;">
            <label style="font-size:0.65rem; font-weight:700; color:#64748b;">AGE</label>
            <input type="text" id="triage-arr-age" placeholder="Age" value="28" style="padding:7px 10px; border:1px solid #cbd5e1; border-radius:6px; font-size:0.8rem; outline:none;">
          </div>
          <div style="flex:0.7; min-width:80px; display:flex; flex-direction:column; gap:4px;">
            <label style="font-size:0.65rem; font-weight:700; color:#64748b;">SEX</label>
            <select id="triage-arr-gender" style="padding:7px 10px; border:1px solid #cbd5e1; border-radius:6px; font-size:0.8rem; outline:none; background:#fff; cursor:pointer;">
              <option value="Female">Female</option>
              <option value="Male">Male</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div style="flex:1; min-width:120px; display:flex; flex-direction:column; gap:4px;">
            <label style="font-size:0.65rem; font-weight:700; color:#64748b;">ARRIVAL MODE</label>
            <select id="triage-arr-mode" style="padding:7px 10px; border:1px solid #cbd5e1; border-radius:6px; font-size:0.8rem; outline:none; background:#fff; cursor:pointer;">
              <option value="Walk-in">Walk-in</option>
              <option value="Ambulance">Ambulance (108)</option>
              <option value="Police">Police Escort</option>
              <option value="Referred">Referred Transfer</option>
            </select>
          </div>
          <div style="flex:2; min-width:200px; display:flex; flex-direction:column; gap:4px;">
            <label style="font-size:0.65rem; font-weight:700; color:#64748b;">CHIEF COMPLAINT</label>
            <input type="text" id="triage-arr-complaint" placeholder="e.g. Abdominal Pain" value="Severe lower abdominal cramps" style="padding:7px 10px; border:1px solid #cbd5e1; border-radius:6px; font-size:0.8rem; outline:none;">
          </div>
          <button class="btn btn-primary" style="background:#2563eb; border:none; padding:8px 16px; font-size:0.8rem; font-weight:700; border-radius:6px; height:34px;" onclick="window.startTriageAssessment()">
            Start Triage →
          </button>
        </div>
      </div>
    `;

    var assessmentPanelHTML = '';
    if (triageAssessmentPatient) {
      assessmentPanelHTML = `
        <div style="background:#fff; border:1px solid #cbd5e1; border-radius:10px; padding:20px; margin-bottom:16px; box-shadow:0 4px 12px rgba(0,0,0,0.05);">
          <div style="display:flex; justify-content:space-between; border-bottom:1px solid #cbd5e1; padding-bottom:8px; margin-bottom:16px;">
            <h4 style="margin:0; font-size:0.95rem; font-weight:800; color:#1e3a8a;">🩺 Active Triage Assessment: ${triageAssessmentPatient.name}</h4>
            <span style="cursor:pointer; color:#ef4444; font-weight:bold; font-size:0.8rem;" onclick="window.cancelTriageAssessment()">Cancel</span>
          </div>

          <!-- Physical description form for unidentified cases -->
          ${triageAssessmentPatient.isUnidentified ? `
            <div class="checklist-card" style="background:#fff7ed; border-color:#ffedd5; margin-bottom:16px;">
              <div style="font-size:0.75rem; font-weight:800; color:#c2410c; margin-bottom:10px;">🔍 UNIDENTIFIED PATIENT PHYSICAL DESCRIPTION</div>
              <div style="display:grid; grid-template-columns: repeat(3, 1fr); gap:10px; margin-bottom:10px;">
                <div class="form-field"><label>Height (approx)</label><input type="text" id="ta-pd-height" placeholder="e.g. 175 cm"></div>
                <div class="form-field"><label>Build</label><input type="text" id="ta-pd-build" placeholder="e.g. Heavy, thin"></div>
                <div class="form-field"><label>Complexion</label><input type="text" id="ta-pd-complex" placeholder="e.g. Fair, Dark"></div>
              </div>
              <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:10px;">
                <div class="form-field"><label>Distinguishing Marks (tattoos, scars)</label><input type="text" id="ta-pd-marks" placeholder="scars/tattoos"></div>
                <div class="form-field"><label>Clothing Description</label><input type="text" id="ta-pd-clothes" placeholder="colour, type of clothes"></div>
              </div>
              <div style="display:grid; grid-template-columns:2fr 1fr; gap:10px; align-items:flex-end;">
                <div class="form-field"><label>Jewellery / Belongings list</label><input type="text" id="ta-pd-items" placeholder="belongings list"></div>
                <button class="btn btn-secondary" style="font-size:0.75rem; font-weight:700; height:34px;" onclick="alert('Camera frame simulated: Photo captured and linked to ER card.')">📷 Capture Photo</button>
              </div>
            </div>
          ` : ''}

          <div class="form-grid" style="margin-bottom:16px;">
            <div class="form-field">
              <label>BP Systolic / Diastolic</label>
              <input type="text" id="ta-bp" placeholder="e.g. 110/70" value="110/70">
            </div>
            <div class="form-field">
              <label>Pulse Rate (HR/min)</label>
              <input type="number" id="ta-hr" value="76">
            </div>
            <div class="form-field">
              <label>Respiratory Rate (RR/min)</label>
              <input type="number" id="ta-rr" value="18">
            </div>
            <div class="form-field">
              <label>SpO₂ (%)</label>
              <input type="number" id="ta-spo2" value="98">
            </div>
            <div class="form-field">
              <label>Temperature (°F)</label>
              <input type="text" id="ta-temp" value="98.4">
            </div>
            <div class="form-field">
              <label>GCS (/15)</label>
              <input type="number" id="ta-gcs" min="3" max="15" value="15">
            </div>
            <div class="form-field">
              <label>Blood Glucose (mg/dL)</label>
              <input type="number" id="ta-rbs" value="110">
            </div>
            <div class="form-field">
              <label>Pain Score (0-10)</label>
              <input type="number" id="ta-pain" min="0" max="10" value="4">
            </div>
          </div>

          <div style="display:grid; grid-template-columns:1.2fr 1fr; gap:16px; margin-bottom:16px;">
            <div class="form-field">
              <label>AVPU Responsiveness Scale</label>
              <div style="display:flex; gap:10px; margin-top:4px; font-size:0.8rem; font-weight:600;">
                <label style="cursor:pointer;"><input type="radio" name="ta-avpu" value="Alert" checked> Alert</label>
                <label style="cursor:pointer;"><input type="radio" name="ta-avpu" value="Voice"> Voice</label>
                <label style="cursor:pointer;"><input type="radio" name="ta-avpu" value="Pain"> Pain</label>
                <label style="cursor:pointer;"><input type="radio" name="ta-avpu" value="Unresponsive"> Unresponsive</label>
              </div>
            </div>
            <div class="form-field">
              <label>Chief Complaint Category</label>
              <select id="ta-category" style="padding:6px; font-size:0.8rem; border-radius:6px; border:1px solid #cbd5e1; background:#fff; cursor:pointer;">
                <option value="Abdominal Pain">Abdominal Pain</option>
                <option value="Chest Pain">Chest Pain</option>
                <option value="Breathlessness">Breathlessness</option>
                <option value="Trauma">Trauma / RTA</option>
                <option value="Poisoning/Overdose">Poisoning / Overdose</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <!-- Triage Colour assignment -->
          <div class="form-field" style="margin-bottom:16px;">
            <label>Triage Priority Colour Assignment</label>
            <div class="triage-selector" id="ta-triage-selector">
              <div class="triage-sel-btn red" onclick="window.setTATriage(this, 'RED')">🔴 RED — Immediate</div>
              <div class="triage-sel-btn orange" onclick="window.setTATriage(this, 'ORANGE')">🟠 ORANGE — Urgent</div>
              <div class="triage-sel-btn yellow active" onclick="window.setTATriage(this, 'YELLOW')">🟡 YELLOW — Semi-urgent</div>
              <div class="triage-sel-btn green" onclick="window.setTATriage(this, 'GREEN')">🟢 GREEN — Minor</div>
              <div class="triage-sel-btn black" onclick="window.setTATriage(this, 'BLACK')">⚫ BLACK — Expectant</div>
            </div>
          </div>

          <!-- MLC screening (mandatory checklist) -->
          <div class="checklist-card" style="margin-bottom:16px;">
            <div style="font-size:0.75rem; font-weight:800; color:#9b2c2c; margin-bottom:8px;">⚖️ MLC SCREENING CHECKLIST — Answer all</div>
            
            <div id="ta-mlc-banner" style="display:${triageAssessmentPatient.isUnidentified ? 'block' : 'none'}; background:#fff5f5; border:1px solid #feb2b2; border-radius:6px; padding:8px 12px; margin-bottom:10px; font-size:0.75rem; font-weight:700; color:#9b2c2c;">
              ⚠️ MLC Flag triggered. Doctor must confirm and initiate police intimation.
            </div>

            <div class="checklist-grid">
              <label class="checklist-item"><input type="checkbox" class="mlc-check" onchange="window.evalMlcCheck(this)"> Road traffic accident?</label>
              <label class="checklist-item"><input type="checkbox" class="mlc-check" onchange="window.evalMlcCheck(this)"> Assault / physical violence?</label>
              <label class="checklist-item"><input type="checkbox" class="mlc-check" onchange="window.evalMlcCheck(this)"> Burns / chemical exposure?</label>
              <label class="checklist-item"><input type="checkbox" class="mlc-check" onchange="window.evalMlcCheck(this)"> Poisoning / suspected overdose?</label>
              <label class="checklist-item"><input type="checkbox" class="mlc-check" onchange="window.evalMlcCheck(this)"> Unnatural or suspicious circumstances?</label>
              <label class="checklist-item"><input type="checkbox" class="mlc-check" ${triageAssessmentPatient.isUnidentified ? 'checked disabled' : ''} onchange="window.evalMlcCheck(this)"> Unknown / unidentified patient?</label>
              <label class="checklist-item"><input type="checkbox" class="mlc-check" onchange="window.evalMlcCheck(this)"> Brought dead?</label>
            </div>
          </div>

          <!-- Submit actions -->
          <div style="display:flex; justify-content:flex-end; gap:8px;">
            <button class="btn btn-secondary" onclick="window.cancelTriageAssessment()">Cancel</button>
            <button class="btn btn-primary" style="background:#2563eb; border:none; padding:8px 18px; font-weight:700; font-size:0.8rem; border-radius:6px;" onclick="window.confirmTriageAssessment()">
              Confirm Triage &amp; Assign Bay
            </button>
          </div>
        </div>
      `;
    }

    var queueRowsHTML = '';
    window.state.emergencyTriageQueue.forEach(function(q, idx) {
      var waitBgClass = '';
      var waitColor = '#1e293b';
      if (q.waitMins >= 60) {
        waitBgClass = 'background-color:#fee2e2; border-left:4px solid var(--triage-red)';
        waitColor = 'var(--triage-red)';
      } else if (q.waitMins >= 30) {
        waitBgClass = 'background-color:#fef3c7; border-left:4px solid var(--triage-yellow)';
        waitColor = 'var(--triage-yellow)';
      }

      queueRowsHTML += `
        <tr style="${waitBgClass}">
          <td style="padding:10px 12px; font-weight:600;">${q.time}</td>
          <td style="padding:10px 12px; font-weight:700; color:#1e3a8a;">${q.name}</td>
          <td style="padding:10px 12px;">${q.age} · ${q.gender.slice(0, 1)}</td>
          <td style="padding:10px 12px; color:#475569;">${q.arrivalMode}</td>
          <td style="padding:10px 12px; font-style:italic; font-size:0.75rem;">${q.complaint}</td>
          <td style="padding:10px 12px; font-weight:700; color:${waitColor};">${q.waitMins} mins</td>
          <td style="padding:10px 12px; text-align:right;">
            <button class="action-pill" onclick="window.pullTriageFromQueue(${idx})">Triage Now</button>
          </td>
        </tr>
      `;
    });

    var html = `
      ${newArrivalForm}
      ${assessmentPanelHTML}

      <div style="background:#fff; border:1px solid #cbd5e1; border-radius:10px; box-shadow:0 1px 3px rgba(0,0,0,0.05); overflow:hidden;">
        <div style="padding:12px 18px; border-bottom:1px solid #cbd5e1; font-weight:700; font-size:0.85rem; color:#334155; background:#f8fafc;">
          Patients Awaiting Triage &amp; Assessment (${window.state.emergencyTriageQueue.length})
        </div>
        <div style="overflow-x:auto;">
          <table class="er-table">
            <thead>
              <tr>
                <th>Arrival Time</th>
                <th>Patient Name</th>
                <th>Age/Sex</th>
                <th>Arrival Mode</th>
                <th>Chief Complaint</th>
                <th>Wait Time</th>
                <th style="text-align:right;">Action</th>
              </tr>
            </thead>
            <tbody>
              ${queueRowsHTML || `<tr><td colspan="7" style="text-align:center; padding:40px; color:#64748b; font-style:italic;">Triage queue is empty.</td></tr>`}
            </tbody>
          </table>
        </div>
      </div>
    `;

    return html;
  }

  window.toggleTriageUnknown = function (checked) {
    const nameEl = document.getElementById('triage-arr-name');
    const ageEl = document.getElementById('triage-arr-age');
    if (checked) {
      if (nameEl) nameEl.value = 'Unknown Male ~50yrs';
      if (ageEl) ageEl.value = '~50';
    } else {
      if (nameEl) nameEl.value = 'Jane Doe';
      if (ageEl) ageEl.value = '28';
    }
  };

  window.startTriageAssessment = function () {
    const name = document.getElementById('triage-arr-name').value.trim();
    const age = document.getElementById('triage-arr-age').value.trim();
    const gender = document.getElementById('triage-arr-gender').value;
    const mode = document.getElementById('triage-arr-mode').value;
    const complaint = document.getElementById('triage-arr-complaint').value.trim();
    const isUnid = document.getElementById('triage-arr-unknown-chk').checked;

    if (!name || !age) {
      alert("Name and age are required to begin triage.");
      return;
    }

    triageAssessmentPatient = {
      name: name,
      age: age,
      gender: gender,
      arrivalMode: mode,
      complaint: complaint,
      isUnidentified: isUnid,
      triage: 'YELLOW', 
      mlcTriggered: isUnid 
    };

    renderEDDashboard(document.getElementById('main-content'));
  };

  window.cancelTriageAssessment = function () {
    triageAssessmentPatient = null;
    renderEDDashboard(document.getElementById('main-content'));
  };

  window.pullTriageFromQueue = function (idx) {
    const q = window.state.emergencyTriageQueue[idx];
    if (q) {
      triageAssessmentPatient = {
        name: q.name,
        age: q.age,
        gender: q.gender,
        arrivalMode: q.arrivalMode,
        complaint: q.complaint,
        isUnidentified: false,
        triage: 'YELLOW',
        mlcTriggered: false
      };
      window.state.emergencyTriageQueue.splice(idx, 1);
      renderEDDashboard(document.getElementById('main-content'));
    }
  };

  window.setTATriage = function (btn, color) {
    if (triageAssessmentPatient) {
      triageAssessmentPatient.triage = color;
      document.querySelectorAll('#ta-triage-selector .triage-sel-btn').forEach(b => {
        b.classList.remove('active');
      });
      btn.classList.add('active');
    }
  };

  window.evalMlcCheck = function (chk) {
    const banner = document.getElementById('ta-mlc-banner');
    if (banner) {
      var anyChecked = false;
      document.querySelectorAll('.mlc-check').forEach(c => {
        if (c.checked) anyChecked = true;
      });
      banner.style.display = anyChecked ? 'block' : 'none';
    }
  };

  window.confirmTriageAssessment = function () {
    if (!triageAssessmentPatient) return;

    const bp = document.getElementById('ta-bp').value.trim();
    const hr = parseInt(document.getElementById('ta-hr').value);
    const rr = parseInt(document.getElementById('ta-rr').value);
    const spo2 = parseInt(document.getElementById('ta-spo2').value);
    const temp = parseFloat(document.getElementById('ta-temp').value) || 98.4;
    const gcs = parseInt(document.getElementById('ta-gcs').value) || 15;
    const pain = parseInt(document.getElementById('ta-pain').value) || 0;

    const category = document.getElementById('ta-category').value;
    
    var mlcFlags = [];
    document.querySelectorAll('.mlc-check:checked').forEach(c => {
      mlcFlags.push(c.parentElement.textContent.trim());
    });

    var hasMlc = mlcFlags.length > 0 || triageAssessmentPatient.isUnidentified;

    const newUhid = 'SH-2026-0' + Math.floor(4850 + Math.random() * 140);
    const newErNo = 'ER-2026-00' + newUhid.slice(-2);

    const patObj = {
      uhid: newUhid,
      name: triageAssessmentPatient.name,
      age: parseInt(triageAssessmentPatient.age) || 30,
      gender: triageAssessmentPatient.gender,
      mobile: triageAssessmentPatient.isUnidentified ? '—' : '+91 90000 ' + Math.floor(10000 + Math.random()*90000),
      address: triageAssessmentPatient.isUnidentified ? '—' : 'Bengaluru',
      bloodGroup: 'O+',
      allergies: 'No Known Allergies',
      admitted: new Date().toLocaleDateString('en-GB') + ' · ' + new Date().toLocaleTimeString('en-US', {hour:'2-digit', minute:'2-digit'}),
      type: 'Emergency',
      status: 'Admitted',
      ward: 'Emergency Ward',
      bed: 'Waiting',
      primaryConsultant: 'Dr. Fatima Sheikh',
      department: 'Emergency Medicine',
      alerts: hasMlc ? ['MLC'] : [],
      prescriptions: []
    };
    window.state.patients.push(patObj);

    const ep = {
      uhid: newUhid,
      erNumber: newErNo,
      triage: triageAssessmentPatient.triage,
      complaint: triageAssessmentPatient.complaint || category,
      bed: 'Waiting', 
      status: 'Triaged',
      flags: hasMlc ? ['MLC'] : [],
      timeInED: '00:01',
      regIncomplete: triageAssessmentPatient.isUnidentified,
      isUnidentified: triageAssessmentPatient.isUnidentified,
      admittedAt: new Date().toISOString(),
      vitals: { bp, hr, temp, spo2, rr, gcs, pain },
      doctor: 'Dr. Fatima Sheikh',
      timeline: [
        { time: 'Just now', type: 'clinical', icon: '🩺', title: 'Triage Confirmed', desc: `Tagged as ${triageAssessmentPatient.triage}. Vitals recorded.` }
      ],
      primarySurvey: null,
      resusEvents: [],
      mlcDetails: hasMlc ? {
        isMlc: true,
        diaryNo: 'MLC-2026-00' + newUhid.slice(-2),
        confirmed: false,
        nature: triageAssessmentPatient.complaint,
        policeStation: 'HSR Layout PS',
        informedTime: 'Awaiting police notification details'
      } : null
    };

    if (triageAssessmentPatient.isUnidentified) {
      ep.flags.push('Critical');
      ep.physicalDescription = {
        height: document.getElementById('ta-pd-height')?.value || '—',
        build: document.getElementById('ta-pd-build')?.value || '—',
        complexion: document.getElementById('ta-pd-complex')?.value || '—',
        features: document.getElementById('ta-pd-marks')?.value || '—',
        clothing: document.getElementById('ta-pd-clothes')?.value || '—',
        jewellery: document.getElementById('ta-pd-items')?.value || '—',
        broughtFrom: 'ED Intake Call',
        policeOfficer: '—', policeStation: '—', caseRef: '—'
      };
    }

    window.state.emergencyPatients.unshift(ep);
    localStorage.setItem('saronil_patients', JSON.stringify(window.state.patients));

    alert(`Triage successfully completed for ${triageAssessmentPatient.name}!\n\nPriority: ${triageAssessmentPatient.triage}\nPatient placed in Waiting area.`);
    triageAssessmentPatient = null;
    activeTab = 'cases';
    renderEDDashboard(document.getElementById('main-content'));
  };

  /* ==========================================================================
     TAB 3 — ED BED VIEW (ADVANCED ONLY)
     ========================================================================== */
  function renderBedViewTab() {
    const totalBeds = window.state.emergencyBeds.length;
    const occupied = window.state.emergencyBeds.filter(b => b.status === 'Occupied').length;
    const cleaning = window.state.emergencyBeds.filter(b => b.status === 'Cleaning').length;
    const available = window.state.emergencyBeds.filter(b => b.status === 'Available').length;

    const resusOcc = window.state.emergencyBeds.filter(b => b.type === 'Resus' && b.status === 'Occupied').length;
    const resusTot = window.state.emergencyBeds.filter(b => b.type === 'Resus').length;

    const acuteOcc = window.state.emergencyBeds.filter(b => b.type === 'Acute' && b.status === 'Occupied').length;
    const acuteTot = window.state.emergencyBeds.filter(b => b.type === 'Acute').length;

    const genOcc = window.state.emergencyBeds.filter(b => b.type === 'General' && b.status === 'Occupied').length;
    const genTot = window.state.emergencyBeds.filter(b => b.type === 'General').length;

    const minOcc = window.state.emergencyBeds.filter(b => b.type === 'Minor' && b.status === 'Occupied').length;
    const minTot = window.state.emergencyBeds.filter(b => b.type === 'Minor').length;

    const isoOcc = window.state.emergencyBeds.filter(b => b.type === 'Isolation' && b.status === 'Occupied').length;
    const isoTot = window.state.emergencyBeds.filter(b => b.type === 'Isolation').length;

    var summaryStripHTML = `
      <div style="background:#fff; border:1px solid #cbd5e1; border-radius:10px; padding:12px 18px; font-size:0.75rem; font-weight:700; color:#334155; display:flex; justify-content:space-between; flex-wrap:wrap; gap:12px; margin-bottom:16px;">
        <div>
          Total ED Beds: <strong>${totalBeds}</strong> | Occupied: <strong style="color:var(--triage-red);">${occupied}</strong> | Available: <strong style="color:var(--triage-green);">${available}</strong> | Cleaning: <strong style="color:#d97706;">${cleaning}</strong>
        </div>
        <div style="display:flex; gap:10px; flex-wrap:wrap;">
          <span>🔴 Resus: ${resusOcc}/${resusTot}</span>
          <span>🟠 Acute: ${acuteOcc}/${acuteTot}</span>
          <span>🟡 General: ${genOcc}/${genTot}</span>
          <span>🟢 Minor: ${minOcc}/${minTot}</span>
          <span>🔒 Isolation: ${isoOcc}/${isoTot}</span>
        </div>
      </div>
    `;

    var actionHeader = `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
        <span style="font-size:0.8rem; font-weight:800; color:#334155; text-transform:uppercase;">ED Casualty Floor Bay Layout Map</span>
        <button class="btn btn-secondary btn-sm" onclick="window.toggleBedViewMode()">
          ${bedViewMode === 'grid' ? '📋 Table List View' : '🛏️ Visual Grid View'}
        </button>
      </div>
    `;

    var reassignHTML = '';
    if (reassignSourceBedId) {
      const srcBed = window.state.emergencyBeds.find(b => b.id === reassignSourceBedId);
      const ep = window.state.emergencyPatients.find(p => p.uhid === srcBed.patientUhid);
      const name = window.state.patients.find(pt => pt.uhid === ep.uhid)?.name;
      
      const avBeds = window.state.emergencyBeds.filter(b => b.status === 'Available');

      reassignHTML = `
        <div style="background:#fff; border:1.5px solid #3b82f6; border-radius:10px; padding:18px; margin-bottom:16px; box-shadow:0 4px 15px rgba(59,130,246,0.15);">
          <div style="font-size:0.8rem; font-weight:800; color:#1e3a8a; margin-bottom:10px;">🔄 Reassign Bed: ${name} (${reassignSourceBedId})</div>
          <div style="display:flex; gap:12px; align-items:flex-end;">
            <div class="form-field" style="flex:1;">
              <label>Select Destination Bed</label>
              <select id="reassign-dest-bed" style="padding:6px; font-size:0.8rem; background:#fff; border-radius:6px; border:1px solid #cbd5e1; cursor:pointer;">
                ${avBeds.map(b => `<option value="${b.id}">${b.id} (${b.type})</option>`).join('') || '<option value="">No available beds</option>'}
              </select>
            </div>
            <div class="form-field" style="flex:2;">
              <label>Reason for Move</label>
              <input type="text" id="reassign-reason" value="Clinical priority adjustment">
            </div>
            <button class="btn btn-primary" style="background:#3b82f6; border:none; padding:8px 16px; border-radius:6px; font-weight:700;" onclick="window.confirmReassignBed()">
              Confirm Reassign
            </button>
            <button class="btn btn-secondary" onclick="window.cancelReassignBed()">Cancel</button>
          </div>
        </div>
      `;
    }

    if (bedViewMode === 'list') {
      return summaryStripHTML + actionHeader + reassignHTML + renderBedListView(occupied);
    }

    const bayTypes = ["Resus", "Acute", "General", "Minor", "Isolation"];
    var gridHTML = '';

    bayTypes.forEach(type => {
      const beds = window.state.emergencyBeds.filter(b => b.type === type);
      
      var cardsHTML = beds.map(bed => {
        var cardClass = 'AVAILABLE';
        var bodyHTML = '';
        
        if (bed.status === 'Occupied') {
          const ep = window.state.emergencyPatients.find(p => p.uhid === bed.patientUhid);
          if (ep) {
            cardClass = ep.triage;
            var isMlc = ep.flags.includes('MLC');
            var isUnid = ep.isUnidentified;
            
            bodyHTML = `
              <div style="margin-top:4px;">
                <strong style="font-size:0.85rem; color:#0f172a;">${window.state.patients.find(pt=>pt.uhid===ep.uhid)?.name}</strong>
                ${isUnid ? `<span style="font-size:0.55rem; background:#ffedd5; color:#ea580c; border:1px solid #fed7aa; border-radius:3px; padding:1px 3px; font-weight:700; margin-left:3px;">🔍 UNID</span>` : ''}
                <div style="font-size:0.7rem; color:#475569; margin-top:2px;">${window.state.patients.find(pt=>pt.uhid===ep.uhid)?.age || '--'} · ${window.state.patients.find(pt=>pt.uhid===ep.uhid)?.gender.slice(0, 1)} · ${ep.timeInED} in ED</div>
                <div style="font-size:0.65rem; color:#64748b; margin-top:4px;">
                  ${isMlc ? '<span class="mlc-badge" style="padding:1px 4px; font-size:8px;">⚖️ MLC</span>' : ''} 
                  <strong style="color:#1e293b;">${ep.status}</strong>
                </div>
              </div>
              <div style="display:flex; gap:6px; margin-top:10px; border-top:1px solid rgba(0,0,0,0.06); padding-top:6px;">
                <button class="action-pill" style="flex:1; padding:2px; font-size:0.7rem;" onclick="window.viewERPatient('${ep.uhid}')">View</button>
                <button class="btn btn-secondary btn-sm" style="flex:1.2; padding:2px; font-size:0.7rem; font-weight:700; border-color:#cbd5e1;" onclick="window.triggerReassignBed('${bed.id}')">🔄 Reassign</button>
              </div>
            `;
          }
        } else if (bed.status === 'Cleaning') {
          cardClass = 'CLEANING';
          bodyHTML = `
            <div style="text-align:center; padding:10px 0;">
              <strong style="color:#64748b; font-size:0.8rem; text-transform:uppercase;">🧹 Cleaning</strong>
              <div style="font-size:0.65rem; color:#94a3b8; margin-top:2px;">Housekeeping turnover</div>
            </div>
            <button class="btn btn-secondary btn-sm" style="padding:3px; font-size:0.7rem; font-weight:700; width:100%; margin-top:6px;" onclick="window.markBedCleaned('${bed.id}')">Mark Ready</button>
          `;
        } else {
          bodyHTML = `
            <div style="text-align:center; padding:10px 0;">
              <strong style="color:var(--triage-green); font-size:0.85rem; text-transform:uppercase;">AVAILABLE</strong>
            </div>
            <button class="btn btn-primary btn-sm" style="background:var(--triage-green); border:none; padding:4px; font-size:0.7rem; font-weight:700; width:100%; margin-top:6px;" onclick="window.assignPatientToBedPrompt('${bed.id}')">
              Assign Patient
            </button>
          `;
        }

        var dotHTML = (bed.status === 'Occupied') ? `<span style="font-size:0.7rem;">🔴</span>` : '';

        return `
          <div class="bed-card ${cardClass}">
            <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid rgba(0,0,0,0.06); padding-bottom:4px;">
              <strong style="font-size:0.75rem; color:#334155; text-transform:uppercase;">${bed.id}</strong>
              ${dotHTML}
            </div>
            ${bodyHTML}
          </div>
        `;
      }).join('');

      gridHTML += `
        <div style="margin-bottom:20px;">
          <div style="font-size:0.8rem; font-weight:800; color:#475569; margin-bottom:8px; text-transform:uppercase; display:flex; align-items:center; gap:6px;">
            <span>🏢</span> ${type} Bay Slots
          </div>
          <div class="bay-grid">
            ${cardsHTML}
          </div>
        </div>
      `;
    });

    return summaryStripHTML + actionHeader + reassignHTML + gridHTML;
  }

  window.toggleBedViewMode = function () {
    bedViewMode = (bedViewMode === 'grid') ? 'list' : 'grid';
    renderEDDashboard(document.getElementById('main-content'));
  };

  function renderBedListView(occupiedCount) {
    var rowsHTML = '';
    window.state.emergencyBeds.forEach(function(bed) {
      var statusClass = 'green';
      var statusText = bed.status;
      var patHTML = '—';
      var ageSex = '—';
      var triageHTML = '—';
      var waitHTML = '—';
      var flagsHTML = '—';
      var actionHTML = '';

      if (bed.status === 'Occupied') {
        statusClass = 'red';
        const ep = window.state.emergencyPatients.find(p => p.uhid === bed.patientUhid);
        if (ep) {
          patHTML = `<strong>${window.state.patients.find(pt=>pt.uhid===ep.uhid)?.name}</strong><br><span class="mono" style="font-size:10px; color:#64748b;">${ep.uhid}</span>`;
          ageSex = `${window.state.patients.find(pt=>pt.uhid===ep.uhid)?.age || '--'} · ${window.state.patients.find(pt=>pt.uhid===ep.uhid)?.gender.slice(0, 1)}`;
          triageHTML = `<span class="ed-badge ${ep.triage.toLowerCase()}">${ep.triage}</span>`;
          waitHTML = ep.timeInED;
          
          var isMlc = ep.flags.includes('MLC');
          flagsHTML = isMlc ? '<span class="mlc-badge">⚖️ MLC</span>' : 'None';
          if (ep.isUnidentified) flagsHTML += ' <span class="ed-badge orange" style="font-size:0.55rem; padding:1px 3px;">🔍 UNID</span>';

          actionHTML = `
            <button class="action-pill" onclick="window.viewERPatient('${ep.uhid}')">View</button>
            <button class="btn btn-secondary btn-sm" style="padding:2px 6px; font-size:10px; font-weight:700; border-color:#cbd5e1;" onclick="window.triggerReassignBed('${bed.id}')">🔄 Reassign</button>
          `;
        }
      } else if (bed.status === 'Cleaning') {
        statusClass = 'yellow';
        actionHTML = `<button class="btn btn-secondary btn-sm" style="padding:2px 6px; font-size:10px; font-weight:700; border-color:#cbd5e1;" onclick="window.markBedCleaned('${bed.id}')">Mark Ready</button>`;
      } else {
        actionHTML = `<button class="btn btn-primary btn-sm" style="background:var(--triage-green); border:none; padding:2px 6px; font-size:10px; font-weight:700;" onclick="window.assignPatientToBedPrompt('${bed.id}')">Assign</button>`;
      }

      rowsHTML += `
        <tr style="border-bottom:1px solid #cbd5e1;">
          <td style="padding:10px 12px;"><strong>${bed.id}</strong></td>
          <td style="padding:10px 12px;"><span class="ed-badge ${statusClass}">${statusText}</span></td>
          <td style="padding:10px 12px;">${patHTML}</td>
          <td style="padding:10px 12px;">${ageSex}</td>
          <td style="padding:10px 12px;">${triageHTML}</td>
          <td style="padding:10px 12px;">${waitHTML}</td>
          <td style="padding:10px 12px;">${flagsHTML}</td>
          <td style="padding:10px 12px; text-align:right; display:flex; gap:6px; justify-content:flex-end;">${actionHTML}</td>
        </tr>
      `;
    });

    return `
      <div style="background:#fff; border:1px solid #cbd5e1; border-radius:10px; box-shadow:0 1px 3px rgba(0,0,0,0.05); overflow:hidden;">
        <table class="er-table">
          <thead>
            <tr>
              <th>Bay/Bed</th>
              <th>Status</th>
              <th>Patient</th>
              <th>Age/Sex</th>
              <th>Triage</th>
              <th>Time in ED</th>
              <th>Flags</th>
              <th style="text-align:right;">Action</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHTML}
          </tbody>
        </table>
      </div>
    `;
  }

  window.markBedCleaned = function (bedId) {
    var bed = window.state.emergencyBeds.find(b => b.id === bedId);
    if (bed) {
      bed.status = "Available";
      window.state.bedsStatus[bedId] = {
        wardKey: 'EMERGENCY',
        status: 'Available',
        patientUhid: null
      };
      localStorage.setItem('saronil_bedsStatus', JSON.stringify(window.state.bedsStatus));
      alert(`Housekeeping cleared bed: ${bedId}.\nBed is now available for admissions.`);
      renderEDDashboard(document.getElementById('main-content'));
    }
  };

  window.triggerReassignBed = function (bedId) {
    reassignSourceBedId = bedId;
    renderEDDashboard(document.getElementById('main-content'));
  };

  window.cancelReassignBed = function () {
    reassignSourceBedId = '';
    renderEDDashboard(document.getElementById('main-content'));
  };

  window.confirmReassignBed = function () {
    const destBedId = document.getElementById('reassign-dest-bed').value;
    const reason = document.getElementById('reassign-reason').value.trim();

    if (!destBedId) {
      alert("No destination bed selected.");
      return;
    }

    var srcBed = window.state.emergencyBeds.find(b => b.id === reassignSourceBedId);
    var destBed = window.state.emergencyBeds.find(b => b.id === destBedId);
    var ep = window.state.emergencyPatients.find(p => p.uhid === srcBed.patientUhid);

    if (srcBed && destBed && ep) {
      srcBed.status = 'Cleaning';
      srcBed.patientUhid = null;
      window.state.bedsStatus[reassignSourceBedId] = {
        wardKey: 'EMERGENCY',
        status: 'Available',
        patientUhid: null
      };

      destBed.status = 'Occupied';
      destBed.patientUhid = ep.uhid;
      window.state.bedsStatus[destBedId] = {
        wardKey: 'EMERGENCY',
        status: 'Occupied',
        patientUhid: ep.uhid,
        patientName: window.state.patients.find(pt => pt.uhid === ep.uhid)?.name
      };

      ep.bed = destBedId;
      ep.timeline = ep.timeline || [];
      ep.timeline.unshift({
        time: new Date().toLocaleTimeString('en-US', {hour:'2-digit', minute:'2-digit'}),
        type: 'clinical',
        icon: '🔄',
        title: 'Bed Reassignment',
        desc: `Moved from ${reassignSourceBedId} to ${destBedId}. Reason: ${reason}`
      });

      localStorage.setItem('saronil_bedsStatus', JSON.stringify(window.state.bedsStatus));

      alert(`Bed Reassigned successfully!\n\nPatient is now in ${destBedId}.\nOriginal bed ${reassignSourceBedId} set to Cleaning.`);
      
      reassignSourceBedId = '';
      renderEDDashboard(document.getElementById('main-content'));
    }
  };

  window.assignPatientToBedPrompt = function(bedId) {
    const unassigned = window.state.emergencyPatients.filter(p => p.bed === 'Waiting');
    if (unassigned.length === 0) {
      alert("No active patients currently in waiting list to assign.");
      return;
    }

    const selectOptions = unassigned.map(p => 
      `<option value="${p.uhid}">${window.state.patients.find(pt => pt.uhid === p.uhid)?.name} (${p.triage})</option>`
    ).join('');

    const modal = document.createElement('div');
    modal.id = 'assign-patient-modal';
    modal.className = 'modal-overlay';
    modal.style.cssText = "position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.5); z-index:9999; display:flex; align-items:center; justify-content:center;";
    modal.innerHTML = `
      <div class="modal-box" style="background:#fff; border-radius:10px; width:400px; padding:20px; box-shadow:0 10px 25px rgba(0,0,0,0.2);">
        <div style="font-size:0.85rem; font-weight:800; color:#1e3a8a; margin-bottom:12px;">Assign Waiting Patient to ${bedId}</div>
        <div class="form-field" style="margin-bottom:16px;">
          <label>Choose Patient</label>
          <select id="ap-patient-select" style="padding:8px; font-size:0.8rem; background:#fff; border-radius:6px; border:1px solid #cbd5e1; cursor:pointer; width:100%;">
            ${selectOptions}
          </select>
        </div>
        <div style="display:flex; justify-content:flex-end; gap:8px;">
          <button class="btn btn-secondary" onclick="document.getElementById('assign-patient-modal').remove()">Cancel</button>
          <button class="btn btn-primary" style="background:#2563eb; border:none; padding:8px 16px; border-radius:6px; font-weight:700;" onclick="window.confirmBedAssign('${bedId}')">Assign Patient</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  };

  window.confirmBedAssign = function(bedId) {
    const uhid = document.getElementById('ap-patient-select').value;
    var ep = window.state.emergencyPatients.find(p => p.uhid === uhid);
    var bed = window.state.emergencyBeds.find(b => b.id === bedId);
    var pat = window.state.patients.find(pt => pt.uhid === uhid);

    if (ep && bed && pat) {
      ep.bed = bedId;
      bed.status = 'Occupied';
      bed.patientUhid = uhid;

      window.state.bedsStatus[bedId] = {
        wardKey: 'EMERGENCY',
        status: 'Occupied',
        patientUhid: uhid,
        patientName: pat.name,
        doctorName: 'Dr. Fatima Sheikh',
        diagnosis: ep.complaint
      };
      localStorage.setItem('saronil_bedsStatus', JSON.stringify(window.state.bedsStatus));

      ep.timeline = ep.timeline || [];
      ep.timeline.unshift({
        time: new Date().toLocaleTimeString('en-US', {hour:'2-digit', minute:'2-digit'}),
        type: 'clinical',
        icon: '🛏️',
        title: 'Bed Allocation',
        desc: `Assigned to ${bedId} bay slot.`
      });

      alert("Patient successfully moved to ED bed!");
      document.getElementById('assign-patient-modal').remove();
      renderEDDashboard(document.getElementById('main-content'));
    }
  };

  /* ==========================================================================
     TAB 4 — MLC REGISTER
     ========================================================================== */
  function renderMLCRegisterTab(tier) {
    var mlcPatients = window.state.emergencyPatients.filter(p => p.mlcDetails && p.mlcDetails.isMlc);
    
    var rowsHTML = '';
    mlcPatients.forEach(function(ep) {
      var details = ep.mlcDetails;
      var statusClass = 'black';
      var statusText = 'Intimation Pending';
      if (details.confirmed) {
        statusClass = 'orange';
        statusText = 'Police Intimated';
      }
      if (details.firNo) {
        statusClass = 'red';
        statusText = 'FIR Registered';
      }

      var cellsHTML = '';
      if (tier === 'standard') {
        cellsHTML = `
          <td class="mono" style="font-weight:700; color:#7f1d1d;">${details.diaryNo}</td>
          <td>
            <strong>${window.state.patients.find(pt => pt.uhid === ep.uhid)?.name || 'Unknown Patient'}</strong>
            <div class="mono" style="font-size:0.65rem; color:#64748b;">${ep.uhid}</div>
          </td>
          <td>${new Date(ep.admittedAt).toLocaleDateString('en-GB')}</td>
          <td>${details.nature}</td>
          <td>${details.policeStation}</td>
          <td><span class="ed-badge ${statusClass}">${statusText}</span></td>
        `;
      } else {
        cellsHTML = `
          <td class="mono" style="font-weight:700; color:#7f1d1d;">${details.diaryNo}</td>
          <td>
            <strong>${window.state.patients.find(pt => pt.uhid === ep.uhid)?.name || 'Unknown Patient'}</strong>
            <div class="mono" style="font-size:0.65rem; color:#64748b;">${ep.uhid}</div>
          </td>
          <td class="mono">${ep.erNumber}</td>
          <td>${new Date(ep.admittedAt).toLocaleDateString('en-GB')}</td>
          <td>${details.nature}</td>
          <td>${details.policeStation}</td>
          <td>${details.informedTime || '—'}</td>
          <td class="mono">${details.firNo || 'Awaiting FIR'}</td>
          <td><span class="ed-badge ${statusClass}">${statusText}</span></td>
          <td>${ep.doctor}</td>
        `;
      }

      rowsHTML += `
        <tr>
          ${cellsHTML}
          <td style="text-align:right;">
            <button class="action-pill" style="background:#475569;" onclick="window.printMLCCertificate('${ep.uhid}')">Print MLC</button>
          </td>
        </tr>
      `;
    });

    var tableHeaders = '';
    if (tier === 'standard') {
      tableHeaders = `
        <th>MLC Number</th>
        <th>Patient</th>
        <th>Date</th>
        <th>Injury Type</th>
        <th>Police Station</th>
        <th>Status</th>
        <th style="text-align:right;">Action</th>
      `;
    } else {
      tableHeaders = `
        <th>MLC Number</th>
        <th>Patient Profile</th>
        <th>ER Number</th>
        <th>Intake Date</th>
        <th>Injury Description</th>
        <th>Police Station</th>
        <th>Intimation Time</th>
        <th>FIR Number</th>
        <th>Status</th>
        <th>Doctor</th>
        <th style="text-align:right;">Action</th>
      `;
    }

    var html = `
      <div style="background:#fff; border:1px solid #cbd5e1; border-radius:10px; box-shadow:0 1px 3px rgba(0,0,0,0.05); overflow:hidden;">
        <div style="padding:12px 18px; border-bottom:1px solid #cbd5e1; font-weight:700; font-size:0.85rem; color:#334155; background:#f8fafc; display:flex; justify-content:space-between; align-items:center;">
          <span>⚖️ Medico-Legal Cases (MLC) Master Register (${mlcPatients.length})</span>
        </div>
        <div style="overflow-x:auto;">
          <table class="er-table">
            <thead>
              <tr>
                ${tableHeaders}
              </tr>
            </thead>
            <tbody>
              ${rowsHTML || `<tr><td colspan="11" style="text-align:center; padding:40px; color:#64748b; font-style:italic;">No MLC cases logged.</td></tr>`}
            </tbody>
          </table>
        </div>
      </div>
    `;

    return html;
  }

  window.printMLCCertificate = function (uhid) {
    var ep = window.state.emergencyPatients.find(p => p.uhid === uhid);
    if (!ep || !ep.mlcDetails) return;
    
    var pat = window.state.patients.find(pt => pt.uhid === uhid);
    var details = ep.mlcDetails;

    var printWindow = window.open('', '_blank', 'width=800,height=600');
    printWindow.document.write(`
      <html>
        <head>
          <title>MLC Certificate - ${pat.name}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 30px; line-height: 1.6; color: #111; }
            .header { text-align: center; border-bottom: 2px double #111; padding-bottom: 12px; margin-bottom: 20px; }
            .field-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 20px; }
            .section { font-weight: bold; border-bottom: 1px solid #222; margin-top: 20px; margin-bottom: 10px; text-transform: uppercase; }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>SARONIL HOSPITAL & RESEARCH CENTRE</h2>
            <div style="font-size:12px; color:#555;">Casualty Department — Medico-Legal Certificate</div>
          </div>
          
          <div style="float:right; font-weight:bold;">MLC Number: ${details.diaryNo}</div>
          <div style="font-weight:bold; margin-bottom:20px;">ER Record: ${ep.erNumber}</div>
          
          <div class="section">Patient Demographics</div>
          <div class="field-grid">
            <div><strong>Patient Name:</strong> ${pat.name}</div>
            <div><strong>Age / Gender:</strong> ${pat.age} Yrs / ${pat.gender}</div>
            <div><strong>UHID:</strong> ${pat.uhid}</div>
            <div><strong>Arrival Date/Time:</strong> ${new Date(ep.admittedAt).toLocaleString()}</div>
          </div>

          <div class="section">Injury & Case Details</div>
          <div><strong>Nature of Injury (Primary Documentation):</strong></div>
          <p>${details.witnessHistory || details.nature || 'Trauma evaluation findings recorded.'}</p>
          
          <div class="section">Police Jurisdiction Intimation</div>
          <div class="field-grid">
            <div><strong>Police Station:</strong> ${details.policeStation}</div>
            <div><strong>Informed At:</strong> ${details.informedTime || 'N/A'}</div>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    setTimeout(() => printWindow.print(), 500);
  };

  /* ==========================================================================
     TAB 5 — HANDOVER
     ========================================================================== */
  function renderHandoverTab(tier) {
    var activePatients = getEDPatients();

    if (tier === 'standard') {
      // Standard: Single-step simple form
      var patsHTML = activePatients.map(p => `
        <div style="display:flex; align-items:center; gap:12px; border-bottom:1px solid #cbd5e1; padding:10px 0;">
          <input type="checkbox" style="cursor:pointer;" checked>
          <div style="flex:1;">
            <strong>${window.state.patients.find(pt => pt.uhid === p.uhid)?.name}</strong>
            <span class="ed-badge ${p.triage.toLowerCase()}" style="margin-left:8px; font-size:0.6rem; padding:1px 4px;">${p.triage}</span>
          </div>
          <div class="form-field" style="flex:2;"><input type="text" placeholder="Key clinical concerns..." value="Stable clinical pathway."></div>
          <div class="form-field" style="flex:1.5;"><input type="text" placeholder="Pending labs/actions..." value="Labs pending."></div>
        </div>
      `).join('');

      return `
        <div style="background:#fff; border:1px solid #cbd5e1; border-radius:10px; padding:20px; max-width:700px; margin:0 auto; box-shadow:0 1px 3px rgba(0,0,0,0.05);">
          <div style="font-size:0.85rem; font-weight:800; color:#1e3a8a; border-bottom:1px solid #cbd5e1; padding-bottom:8px; margin-bottom:16px;">🔄 Outgoing Shift Handover Checkoff</div>
          
          <div class="form-field" style="margin-bottom:14px;">
            <label>Shift Period</label>
            <select id="ho-shift" style="padding:6px; background:#fff;">
              <option value="Morning">Morning Shift (8 AM)</option>
              <option value="Evening">Evening Shift (4 PM)</option>
              <option value="Night">Night Shift (12 AM)</option>
            </select>
          </div>

          <div style="margin-bottom:16px;">
            <label style="font-size:0.7rem; font-weight:700; color:#475569; text-transform:uppercase;">Active Patients Review</label>
            ${patsHTML}
          </div>

          <div class="form-field" style="margin-bottom:16px;">
            <label>Overall Handoff Instructions / Notes</label>
            <textarea id="ho-notes-std" rows="3" style="padding:6px; resize:none;" placeholder="Special notes..."></textarea>
          </div>

          <button class="btn btn-primary" style="background:#2563eb; width:100%; border:none; padding:10px; font-weight:700;" onclick="window.submitStandardHandover()">
            🔄 Sign &amp; Complete Handover
          </button>
        </div>
      `;
    }

    // Advanced: 3-step structured handover
    var rowsHTML = '';
    activePatients.forEach(function(ep) {
      var isAck = handoverAcknowledged[ep.uhid] ? 'checked' : '';
      rowsHTML += `
        <tr>
          <td style="padding:10px 12px; width:40px;">
            <input type="checkbox" style="cursor:pointer;" ${isAck} onchange="window.toggleHandoverAck('${ep.uhid}', this.checked)">
          </td>
          <td style="padding:10px 12px; font-weight:700; color:#1e3a8a;">${window.state.patients.find(pt => pt.uhid === ep.uhid)?.name}</td>
          <td style="padding:10px 12px;"><span class="ed-badge ${ep.triage.toLowerCase()}">${ep.triage}</span></td>
          <td style="padding:10px 12px; font-weight:600; font-size:0.75rem;">${ep.status}</td>
          <td style="padding:10px 12px; font-style:italic; color:#475569;">Stable clinical path</td>
          <td style="padding:10px 12px; color:#ef4444; font-weight:600;">Labs pending</td>
        </tr>
      `;
    });

    var alertsHTML = `
      <ul style="margin:0; padding-left:16px; font-size:0.75rem; color:#7f1d1d; display:flex; flex-direction:column; gap:4px;">
        <li>Critical RED Tags: ${activePatients.filter(p => p.triage === 'RED').map(p => p.uhid).join(', ') || 'None'}</li>
        <li>Pending MLC police intimations: ${activePatients.filter(p => p.mlcDetails && !p.mlcDetails.firNo).map(p => p.mlcDetails.diaryNo).join(', ') || 'None'}</li>
        <li>Patients waiting beds &gt;2 hrs: ${activePatients.filter(p => p.bed === 'Waiting').map(p => window.state.patients.find(pt=>pt.uhid===p.uhid)?.name).join(', ') || 'None'}</li>
      </ul>
    `;

    var pastHandoversHTML = (window.state.emergencyHandovers || []).map(function(h) {
      return `
        <div style="background:#f8fafc; border:1px solid #cbd5e1; border-radius:6px; padding:10px; display:flex; justify-content:space-between; font-size:0.75rem; margin-bottom:6px;">
          <div>
            <strong>Shift ${h.shift} Handover</strong> — Outgoing: <strong>${h.outgoing}</strong> | Incoming: <strong>${h.incoming}</strong>
          </div>
          <div style="color:#64748b;">
            👥 ${h.patientsCount} patients transferred
          </div>
        </div>
      `;
    }).join('');

    var html = `
      <div style="display:grid; grid-template-columns: 2fr 1fr; gap:20px;">
        <div style="background:#fff; border:1px solid #cbd5e1; border-radius:10px; box-shadow:0 1px 3px rgba(0,0,0,0.05); overflow:hidden; display:flex; flex-direction:column;">
          <div style="padding:12px 18px; border-bottom:1px solid #cbd5e1; font-weight:700; font-size:0.85rem; color:#334155; background:#f8fafc;">
            Step 1 — Outgoing Shift Patient Checkoff &amp; Handover
          </div>
          <div style="overflow-x:auto;">
            <table class="er-table">
              <thead>
                <tr>
                  <th>Ack</th>
                  <th>Patient Name</th>
                  <th>Triage</th>
                  <th>Status</th>
                  <th>Key Concern</th>
                  <th>Pending Actions</th>
                </tr>
              </thead>
              <tbody>
                ${rowsHTML}
              </tbody>
            </table>
          </div>
        </div>

        <div style="display:flex; flex-direction:column; gap:16px;">
          <div style="background:#fff5f5; border:1px solid #feb2b2; border-radius:10px; padding:16px;">
            <div style="font-size:0.75rem; font-weight:800; color:#9b2c2c; margin-bottom:8px; text-transform:uppercase;">Step 2 — Handover Alerts</div>
            ${alertsHTML}
          </div>

          <div style="background:#fff; border:1px solid #cbd5e1; border-radius:10px; padding:16px; display:flex; flex-direction:column; gap:12px;">
            <div style="font-size:0.75rem; font-weight:800; color:#334155; text-transform:uppercase;">Step 3 — Shift Notes &amp; Handover Sign-off</div>
            
            <div class="form-field">
              <label>Incoming Responsible Clinician</label>
              <select id="ho-incoming-staff" style="padding:6px; font-size:0.8rem; border-radius:6px; border:1px solid #cbd5e1; background:#fff; cursor:pointer;">
                <option value="Dr. Srinivasan">Dr. Srinivasan (General Medicine)</option>
                <option value="Dr. Mehta">Dr. Mehta (Surgery)</option>
                <option value="Dr. Fatima Sheikh">Dr. Fatima Sheikh (Emergency)</option>
              </select>
            </div>

            <div class="form-field">
              <label>Handover Instructions / Notes</label>
              <textarea id="ho-notes" rows="3" placeholder="Shift status report notes..." style="padding:6px; font-size:0.8rem; border-radius:6px; border:1px solid #cbd5e1; resize:none;"></textarea>
            </div>

            <button class="btn btn-primary" style="background:#2563eb; border:none; padding:10px; border-radius:6px; font-weight:700; font-size:0.8rem;" onclick="window.submitHandover()">
              🔄 Sign &amp; Complete Handover
            </button>
          </div>
        </div>
      </div>

      <div style="background:#fff; border:1px solid #cbd5e1; border-radius:10px; box-shadow:0 1px 3px rgba(0,0,0,0.05); padding:16px; margin-top:20px; display:flex; flex-direction:column; gap:10px;">
        <div style="font-size:0.75rem; font-weight:800; color:#334155; text-transform:uppercase;">Shift Handover Archive History</div>
        ${pastHandoversHTML}
      </div>
    `;

    return html;
  }

  window.toggleHandoverAck = function (uhid, checked) {
    handoverAcknowledged[uhid] = checked;
  };

  window.submitStandardHandover = function () {
    var pats = getEDPatients();
    var shift = document.getElementById('ho-shift').value;
    var notes = document.getElementById('ho-notes-std').value.trim();

    alert(`Standard Handover Signed!\n\nShift: ${shift}\nPatients: ${pats.length} transferred.\nNotes: "${notes || 'None'}"`);
    activeTab = 'cases';
    renderEDDashboard(document.getElementById('main-content'));
  };

  window.submitHandover = function () {
    var pats = getEDPatients();
    const unacknowledged = pats.filter(p => !handoverAcknowledged[p.uhid]);
    if (unacknowledged.length > 0) {
      alert(`Handover incomplete. Please check off all patients.`);
      return;
    }

    const incoming = document.getElementById('ho-incoming-staff').value;
    const notes = document.getElementById('ho-notes').value.trim();

    window.state.emergencyHandovers = window.state.emergencyHandovers || [];
    window.state.emergencyHandovers.unshift({
      date: 'Today',
      shift: new Date().toLocaleTimeString('en-US', {hour:'2-digit', minute:'2-digit'}),
      outgoing: activeRole === 'ED Doctor' ? 'Dr. Fatima Sheikh' : 'Staff Nurse Mary',
      incoming: incoming,
      patientsCount: pats.length
    });

    alert(`Handover completed to ${incoming}. Shift notes: "${notes || 'None'}".`);
    handoverAcknowledged = {};
    renderEDDashboard(document.getElementById('main-content'));
  };

  /* ==========================================================================
     TAB 6 — ED STATS
     ========================================================================== */
  function renderEDStatsTab(tier) {
    const ep = getEDPatients();
    const totalAttendances = ep.length + 15; 
    
    const red = ep.filter(p => p.triage === 'RED').length;
    const yellow = ep.filter(p => p.triage === 'YELLOW').length;
    const green = ep.filter(p => p.triage === 'GREEN').length;
    const mlc = ep.filter(p => p.mlcDetails?.isMlc).length;
    
    var statsStripHTML = '';
    if (tier === 'standard') {
      statsStripHTML = `
        <div style="display:grid; grid-template-columns: repeat(4, 1fr); gap:12px; margin-bottom:20px;">
          <div style="background:#fff; border:1px solid #cbd5e1; border-radius:8px; padding:12px; display:flex; flex-direction:column; align-items:center;">
            <span style="font-size:0.65rem; font-weight:700; color:#64748b; text-transform:uppercase;">Total Attendances</span>
            <strong style="font-size:1.4rem; color:#1e3a8a; margin-top:4px;">${totalAttendances}</strong>
          </div>
          <div style="background:#fff; border:1px solid #cbd5e1; border-radius:8px; padding:12px; display:flex; flex-direction:column; align-items:center; border-left:4px solid var(--triage-red);">
            <span style="font-size:0.65rem; font-weight:700; color:#64748b; text-transform:uppercase;">🔴 RED Priority</span>
            <strong style="font-size:1.4rem; color:var(--triage-red); margin-top:4px;">${red}</strong>
          </div>
          <div style="background:#fff; border:1px solid #cbd5e1; border-radius:8px; padding:12px; display:flex; flex-direction:column; align-items:center; border-left:4px solid var(--triage-yellow);">
            <span style="font-size:0.65rem; font-weight:700; color:#64748b; text-transform:uppercase;">🟡 YELLOW Priority</span>
            <strong style="font-size:1.4rem; color:var(--triage-yellow); margin-top:4px;">${yellow}</strong>
          </div>
          <div style="background:#fff; border:1px solid #cbd5e1; border-radius:8px; padding:12px; display:flex; flex-direction:column; align-items:center; border-left:4px solid var(--triage-green);">
            <span style="font-size:0.65rem; font-weight:700; color:#64748b; text-transform:uppercase;">🟢 GREEN Priority</span>
            <strong style="font-size:1.4rem; color:var(--triage-green); margin-top:4px;">${green}</strong>
          </div>
        </div>
        <div style="background:#fff; border:1px solid #cbd5e1; border-radius:10px; padding:16px;">
          <div style="font-size:0.75rem; font-weight:800; color:#334155; text-transform:uppercase; margin-bottom:8px;">Compliance Rate</div>
          <div>MLC Compliance rate: <strong>100%</strong> (${mlc} of ${mlc} intimated on time).</div>
        </div>
      `;
      return statsStripHTML;
    }

    // Advanced: Adds wait time table and beds list
    const orange = ep.filter(p => p.triage === 'ORANGE').length;
    
    statsStripHTML = `
      <div style="display:grid; grid-template-columns: repeat(6, 1fr); gap:12px; margin-bottom:20px;">
        <div style="background:#fff; border:1px solid #cbd5e1; border-radius:8px; padding:12px; display:flex; flex-direction:column; align-items:center;">
          <span style="font-size:0.65rem; font-weight:700; color:#64748b; text-transform:uppercase;">Total Arrivals</span>
          <strong style="font-size:1.4rem; color:#1e3a8a; margin-top:4px;">${totalAttendances}</strong>
        </div>
        <div style="background:#fff; border:1px solid #cbd5e1; border-radius:8px; padding:12px; display:flex; flex-direction:column; align-items:center; border-left:4px solid var(--triage-red);">
          <span style="font-size:0.65rem; font-weight:700; color:#64748b; text-transform:uppercase;">🔴 RED</span>
          <strong style="font-size:1.4rem; color:var(--triage-red); margin-top:4px;">${red}</strong>
        </div>
        <div style="background:#fff; border:1px solid #cbd5e1; border-radius:8px; padding:12px; display:flex; flex-direction:column; align-items:center; border-left:4px solid var(--triage-orange);">
          <span style="font-size:0.65rem; font-weight:700; color:#64748b; text-transform:uppercase;">🟠 ORANGE</span>
          <strong style="font-size:1.4rem; color:var(--triage-orange); margin-top:4px;">${orange}</strong>
        </div>
        <div style="background:#fff; border:1px solid #cbd5e1; border-radius:8px; padding:12px; display:flex; flex-direction:column; align-items:center; border-left:4px solid var(--triage-yellow);">
          <span style="font-size:0.65rem; font-weight:700; color:#64748b; text-transform:uppercase;">🟡 YELLOW</span>
          <strong style="font-size:1.4rem; color:var(--triage-yellow); margin-top:4px;">${yellow}</strong>
        </div>
        <div style="background:#fff; border:1px solid #cbd5e1; border-radius:8px; padding:12px; display:flex; flex-direction:column; align-items:center; border-left:4px solid var(--triage-green);">
          <span style="font-size:0.65rem; font-weight:700; color:#64748b; text-transform:uppercase;">🟢 GREEN</span>
          <strong style="font-size:1.4rem; color:var(--triage-green); margin-top:4px;">${green}</strong>
        </div>
        <div style="background:#fff; border:1px solid #cbd5e1; border-radius:8px; padding:12px; display:flex; flex-direction:column; align-items:center;">
          <span style="font-size:0.65rem; font-weight:700; color:#64748b; text-transform:uppercase;">⚖️ MLC CASES</span>
          <strong style="font-size:1.4rem; color:#7f1d1d; margin-top:4px;">${mlc}</strong>
        </div>
      </div>
    `;

    const bedWaitPats = ep.filter(p => p.bed === 'Waiting');
    const waitingNamesHTML = bedWaitPats.map(p => `
      <div style="padding:6px 12px; background:#fff5f5; border:1px solid #feb2b2; border-radius:6px; font-size:0.75rem; font-weight:700; color:#9b2c2c; display:flex; justify-content:space-between; align-items:center;">
        <span>👤 ${window.state.patients.find(pt=>pt.uhid===p.uhid)?.name} (${p.uhid})</span>
        <span>🕒 Wait: ${p.timeInED}</span>
      </div>
    `).join('') || '<div style="color:#64748b; font-style:italic; font-size:0.8rem;">No patients waiting.</div>';

    return `
      ${statsStripHTML}
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:20px;">
        <div style="background:#fff; border:1px solid #cbd5e1; border-radius:10px; padding:18px; display:flex; flex-direction:column; gap:12px;">
          <div style="font-size:0.75rem; font-weight:800; color:#334155; text-transform:uppercase; border-bottom:1px solid #e2e8f0; padding-bottom:6px;">⏱️ Triage to Doctor Wait Performance</div>
          <div style="display:flex; justify-content:space-between; font-size:0.8rem; padding:6px 0; border-bottom:1px dashed #e2e8f0;">
            <span>🔴 RED Tag</span>
            <span>avg 4 min <strong style="color:#059669; margin-left:6px;">✓ Pass</strong></span>
          </div>
          <div style="display:flex; justify-content:space-between; font-size:0.8rem; padding:6px 0; border-bottom:1px dashed #e2e8f0;">
            <span>🟠 ORANGE Tag</span>
            <span>avg 18 min <strong style="color:#ea580c; margin-left:6px;">⚠️ Dev</strong></span>
          </div>
          <div style="display:flex; justify-content:space-between; font-size:0.8rem; padding:6px 0; border-bottom:1px dashed #e2e8f0;">
            <span>🟡 YELLOW Tag</span>
            <span>avg 34 min <strong style="color:#ea580c; margin-left:6px;">⚠️ Dev</strong></span>
          </div>
          <div style="display:flex; justify-content:space-between; font-size:0.8rem; padding:6px 0;">
            <span>🟢 GREEN Tag</span>
            <span>avg 52 min <strong style="color:#059669; margin-left:6px;">✓ Pass</strong></span>
          </div>
        </div>

        <div style="background:#fff; border:1px solid #cbd5e1; border-radius:10px; padding:18px; display:flex; flex-direction:column; gap:12px;">
          <div style="font-size:0.75rem; font-weight:800; color:#334155; text-transform:uppercase; border-bottom:1px solid #e2e8f0; padding-bottom:6px;">🏥 IPD Bed Allotment Wait Queue</div>
          <div style="display:flex; flex-direction:column; gap:6px;">
            ${waitingNamesHTML}
          </div>
        </div>
      </div>
    `;
  }

  /* ==========================================================================
     REGISTRATION FLOW OVERLAY
     ========================================================================== */
  window.openRegOverlay = function (stable) {
    regOverlayOpen = true;
    regStep = 1;
    regIsStable = stable;
    regTriage = 'YELLOW';
    isUnknownReg = false;
    renderEDDashboard(document.getElementById('main-content'));
  };

  window.closeRegOverlay = function () {
    regOverlayOpen = false;
    renderEDDashboard(document.getElementById('main-content'));
  };

  window.switchRegTriage = function (color) {
    regTriage = color;
    document.querySelectorAll('.triage-sel-btn').forEach(btn => {
      btn.classList.remove('active');
    });
    const selected = document.querySelector(`.triage-sel-btn.${color.toLowerCase()}`);
    if (selected) selected.classList.add('active');
  };

  window.toggleRegUnknown = function (checked) {
    isUnknownReg = checked;
    const nameEl = document.getElementById('rapid-reg-name');
    const ageEl = document.getElementById('rapid-reg-age');
    if (checked) {
      if (nameEl) nameEl.value = 'Unknown Male ~45yrs';
      if (ageEl) ageEl.value = '45';
    } else {
      if (nameEl) nameEl.value = 'Jane Doe';
      if (ageEl) ageEl.value = '28';
    }
  };

  window.prevRegStep = function () {
    if (regStep > 1) {
      regStep--;
      renderEDDashboard(document.getElementById('main-content'));
    }
  };

  window.nextRegStep = function () {
    if (regStep < 3) {
      regStep++;
      renderEDDashboard(document.getElementById('main-content'));
    }
  };

  window.submitStandardReg = function () {
    const name = document.getElementById('std-reg-name').value.trim();
    const age = document.getElementById('std-reg-age').value.trim();
    const gender = document.getElementById('std-reg-gender').value;
    const complaint = document.getElementById('std-reg-complaint').value.trim();
    const payer = document.getElementById('std-reg-payer').value;

    if (!name || !age || !complaint) {
      alert("Name, age and complaint are required.");
      return;
    }

    const newUhid = 'SH-2026-0' + Math.floor(4850 + Math.random() * 140);
    const newErNo = 'ER-2026-00' + newUhid.slice(-2);

    const patObj = {
      uhid: newUhid,
      name: name,
      age: parseInt(age) || 30,
      gender: gender,
      mobile: name.includes('Unknown') ? '—' : '+91 90000 ' + Math.floor(10000 + Math.random()*90000),
      address: 'Bengaluru',
      bloodGroup: 'O+',
      allergies: 'No Known Allergies',
      admitted: new Date().toLocaleDateString('en-GB') + ' · ' + new Date().toLocaleTimeString('en-US', {hour:'2-digit', minute:'2-digit'}),
      type: 'Emergency',
      status: 'Admitted',
      ward: 'Emergency Ward',
      bed: 'Waiting',
      primaryConsultant: 'Dr. Fatima Sheikh',
      department: 'Emergency Medicine',
      alerts: name.includes('Unknown') ? ['MLC'] : [],
      prescriptions: []
    };
    window.state.patients.push(patObj);

    const ep = {
      uhid: newUhid,
      erNumber: newErNo,
      triage: regTriage,
      complaint: complaint,
      bed: 'Waiting',
      status: 'Triaged',
      flags: name.includes('Unknown') ? ['MLC'] : [],
      timeInED: '00:01',
      regIncomplete: name.includes('Unknown'),
      isUnidentified: name.includes('Unknown'),
      admittedAt: new Date().toISOString(),
      vitals: { bp: '120/80', hr: 72, temp: 98.4, spo2: 98, weight: 70, rr: 18, gcs: 15, pain: 4 },
      doctor: 'Dr. Fatima Sheikh',
      timeline: [
        { time: 'Just now', type: 'clinical', icon: '📝', title: 'Intake Registered', desc: `Registered under ${payer}.` }
      ],
      primarySurvey: null,
      resusEvents: [],
      mlcDetails: name.includes('Unknown') ? {
        isMlc: true,
        diaryNo: 'MLC-2026-00' + newUhid.slice(-2),
        confirmed: false,
        nature: complaint,
        policeStation: 'HSR Layout PS',
        informedTime: 'Awaiting police notification details'
      } : null
    };

    window.state.emergencyPatients.unshift(ep);
    localStorage.setItem('saronil_patients', JSON.stringify(window.state.patients));

    alert(`Standard patient registered successfully!\n\nUHID: ${newUhid}\nER: ${newErNo}`);
    regOverlayOpen = false;
    activeTab = 'cases';
    renderEDDashboard(document.getElementById('main-content'));
  };

  window.submitStableReg = function () {
    const name = document.getElementById('reg-stable-name').value.trim();
    const age = document.getElementById('reg-stable-age').value.trim();
    const gender = document.getElementById('reg-stable-gender').value;
    const mobile = document.getElementById('reg-stable-mobile').value.trim();
    const address = document.getElementById('reg-stable-address').value.trim();
    const complaint = document.getElementById('reg-stable-complaint').value.trim();

    if (!name || !age || !mobile || !complaint) {
      alert("Please fill all required fields marked with *");
      return;
    }

    const newUhid = 'SH-2026-0' + Math.floor(4850 + Math.random() * 140);
    const newErNo = 'ER-2026-00' + newUhid.slice(-2);

    const patObj = {
      uhid: newUhid,
      name: name,
      age: parseInt(age) || 30,
      gender: gender,
      mobile: mobile,
      address: address,
      bloodGroup: 'B+',
      allergies: 'No Known Allergies',
      admitted: new Date().toLocaleDateString('en-GB') + ' · ' + new Date().toLocaleTimeString('en-US', {hour:'2-digit', minute:'2-digit'}),
      type: 'Emergency',
      status: 'Admitted',
      ward: 'Emergency Ward',
      bed: 'Waiting',
      primaryConsultant: 'Dr. Fatima Sheikh',
      department: 'Emergency Medicine',
      alerts: [],
      prescriptions: []
    };
    window.state.patients.push(patObj);

    const ep = {
      uhid: newUhid,
      erNumber: newErNo,
      triage: 'YELLOW',
      complaint: complaint,
      bed: 'Waiting',
      status: 'Triaged',
      flags: [],
      timeInED: '00:01',
      regIncomplete: false,
      isUnidentified: false,
      admittedAt: new Date().toISOString(),
      vitals: { bp: '120/80', hr: 72, temp: 98.4, spo2: 98, weight: 70, rr: 18, gcs: 15, pain: 4 },
      doctor: 'Dr. Fatima Sheikh',
      timeline: [
        { time: 'Just now', type: 'clinical', icon: '📝', title: 'Intake Registered', desc: 'Registered in Emergency Ward.' }
      ],
      primarySurvey: null,
      resusEvents: [],
      mlcDetails: null
    };

    window.state.emergencyPatients.unshift(ep);
    localStorage.setItem('saronil_patients', JSON.stringify(window.state.patients));

    alert(`Patient successfully registered!\n\nUHID: ${newUhid}\nER Number: ${newErNo}`);
    regOverlayOpen = false;
    activeTab = 'cases';
    renderEDDashboard(document.getElementById('main-content'));
  };

  window.submitRapidIntake = function () {
    const name = document.getElementById('rapid-reg-name').value.trim();
    const age = document.getElementById('rapid-reg-age').value.trim();
    const gender = document.getElementById('rapid-reg-gender').value;
    const complaint = document.getElementById('rapid-reg-complaint').value.trim();
    const isUnid = document.getElementById('reg-unknown-chk').checked;

    if (!name || !age || !complaint) {
      alert("All fields are required.");
      return;
    }

    const newUhid = 'SH-2026-0' + Math.floor(4900 + Math.random() * 100);
    const newErNo = 'ER-2026-00' + newUhid.slice(-2);

    const avBeds = window.state.emergencyBeds.filter(b => b.status === 'Available');
    const assignedBed = avBeds.length > 0 ? avBeds[0].id : 'Resus 1';

    const patObj = {
      uhid: newUhid,
      name: name,
      age: parseInt(age) || 45,
      gender: gender,
      mobile: isUnid ? '—' : '+91 99999 01' + Math.floor(10 + Math.random()*90),
      address: isUnid ? '—' : 'Casualty Resus Area',
      bloodGroup: 'B+',
      allergies: 'No Known Allergies',
      admitted: new Date().toLocaleDateString('en-GB') + ' · ' + new Date().toLocaleTimeString('en-US', {hour:'2-digit', minute:'2-digit'}),
      type: 'Emergency',
      status: 'Admitted',
      ward: 'Emergency Ward',
      bed: assignedBed,
      primaryConsultant: 'Dr. Fatima Sheikh',
      department: 'Emergency Medicine',
      alerts: ['Critical'],
      prescriptions: []
    };
    window.state.patients.push(patObj);

    const ep = {
      uhid: newUhid,
      erNumber: newErNo,
      triage: regTriage,
      complaint: complaint,
      bed: assignedBed,
      status: 'Doctor Assessing',
      flags: isUnid ? ['Critical', 'MLC'] : ['Critical'], 
      timeInED: '00:05',
      regIncomplete: true,
      isUnidentified: isUnid,
      admittedAt: new Date().toISOString(),
      vitals: { bp: '80/50', hr: 120, temp: 98.4, spo2: 88, weight: 70, rr: 24, gcs: 9, pain: 8 },
      doctor: 'Dr. Fatima Sheikh',
      physicalDescription: isUnid ? {
        height: '—', build: '—', complexion: '—', features: '—', clothing: '—', jewellery: '—',
        broughtFrom: 'ED Rapid Intake', policeOfficer: '—', policeStation: '—', caseRef: '—'
      } : null,
      timeline: [
        { time: 'Just now', type: 'emergency', icon: '🚨', title: 'Rapid Intake', desc: `Critical patient admitted directly to Resus ${assignedBed}.` }
      ],
      primarySurvey: null,
      resusEvents: [],
      mlcDetails: isUnid ? {
        isMlc: true,
        diaryNo: 'MLC-2026-00' + newUhid.slice(-2),
        confirmed: false,
        nature: complaint,
        policeStation: 'HSR Layout PS',
        informedTime: 'Awaiting police notification details'
      } : null
    };
    window.state.emergencyPatients.unshift(ep);

    var bed = window.state.emergencyBeds.find(b => b.id === assignedBed);
    if (bed) {
      bed.status = 'Occupied';
      bed.patientUhid = newUhid;
    }

    window.state.bedsStatus[assignedBed] = {
      wardKey: 'EMERGENCY',
      status: 'Occupied',
      patientUhid: newUhid,
      patientName: name,
      doctorName: 'Dr. Fatima Sheikh',
      diagnosis: `Rapid Intake RED — ${complaint}`
    };

    localStorage.setItem('saronil_patients', JSON.stringify(window.state.patients));
    localStorage.setItem('saronil_bedsStatus', JSON.stringify(window.state.bedsStatus));

    alert(`Rapid intake registered successfully!\n\nUHID: ${newUhid}\nBed: ${assignedBed}`);
    regOverlayOpen = false;
    activeTab = 'cases';
    renderEDDashboard(document.getElementById('main-content'));
  };

  function renderRegistrationOverlay(container) {
    var tier = getEDTier();
    
    // Standard mode single-screen rapid form
    if (tier === 'standard') {
      container.innerHTML = `
        <div style="background:#fff; border:1px solid #cbd5e1; border-radius:12px; padding:24px; max-width:600px; margin: 2rem auto; box-shadow:0 10px 25px rgba(0,0,0,0.15);">
          <div style="display:flex; justify-content:space-between; border-bottom:1px solid #cbd5e1; padding-bottom:12px; margin-bottom:20px;">
            <h3 style="margin:0; font-size:1.15rem; font-weight:800; color:#1e3a8a;">📝 New ED Patient Registration (Standard Mode)</h3>
            <span style="cursor:pointer; color:#64748b; font-weight:bold;" onclick="window.closeRegOverlay()">&times;</span>
          </div>

          <div style="display:flex; flex-direction:column; gap:14px; margin-bottom:20px;">
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <div class="form-field" style="flex:1;">
                <label>Name (or "Unknown Male ~45yrs") *</label>
                <input type="text" id="std-reg-name" placeholder="Patient Name" value="Jane Doe">
              </div>
              <label style="margin-left:12px; margin-top:14px; font-size:0.75rem; font-weight:700; color:#ea580c; cursor:pointer;">
                <input type="checkbox" onchange="document.getElementById('std-reg-name').value = this.checked ? 'Unknown Male ~45yrs' : 'Jane Doe'"> Unknown Patient
              </label>
            </div>

            <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
              <div class="form-field">
                <label>Age (approx OK) *</label>
                <input type="text" id="std-reg-age" value="28">
              </div>
              <div class="form-field">
                <label>Sex</label>
                <select id="std-reg-gender" style="padding:8px; border:1px solid #cbd5e1; border-radius:6px; background:#fff;">
                  <option value="Female">Female</option>
                  <option value="Male">Male</option>
                  <option value="Unknown">Unknown</option>
                </select>
              </div>
            </div>

            <div class="form-field">
              <label>Chief Complaint *</label>
              <input type="text" id="std-reg-complaint" value="Severe lower abdominal cramps">
            </div>

            <div class="form-field">
              <label>Arrival Mode</label>
              <select id="std-reg-arrival" style="padding:8px; border:1px solid #cbd5e1; border-radius:6px; background:#fff;">
                <option value="Walk-in">Walk-in</option>
                <option value="Ambulance">Ambulance</option>
                <option value="Police">Police</option>
                <option value="Bystander">Bystander</option>
                <option value="Referred">Referred</option>
                <option value="Unknown">Unknown</option>
              </select>
            </div>

            <div class="form-field">
              <label>Triage Priority</label>
              <div class="triage-selector">
                <div class="triage-sel-btn red" onclick="window.switchRegTriage('RED')">🔴 RED</div>
                <div class="triage-sel-btn yellow active" onclick="window.switchRegTriage('YELLOW')">🟡 YELLOW</div>
                <div class="triage-sel-btn green" onclick="window.switchRegTriage('GREEN')">🟢 GREEN</div>
              </div>
            </div>

            <div class="form-field">
              <label>Payer Tariff</label>
              <select id="std-reg-payer" style="padding:8px; border:1px solid #cbd5e1; border-radius:6px; background:#fff;">
                <option value="Self Pay">Self Pay</option>
                <option value="CGHS">CGHS</option>
                <option value="ECHS">ECHS</option>
                <option value="Insurance">Insurance Policy</option>
              </select>
            </div>
          </div>

          <div style="display:flex; justify-content:flex-end; gap:8px;">
            <button class="btn btn-secondary" onclick="window.closeRegOverlay()">Cancel</button>
            <button class="btn btn-primary" style="background:#2563eb; border:none; padding:10px 20px; font-weight:700;" onclick="window.submitStandardReg()">
              Register &amp; Proceed →
            </button>
          </div>
        </div>
      `;
      return;
    }

    // Advanced mode: tiered by triage (Red/Orange vs Yellow/Green wizard)
    if (!regIsStable) {
      container.innerHTML = `
        <div style="background:#fff; border:1px solid #cbd5e1; border-radius:12px; padding:24px; max-width:600px; margin: 2rem auto; box-shadow:0 10px 25px rgba(0,0,0,0.15);">
          <div style="display:flex; justify-content:space-between; border-bottom:1px solid #cbd5e1; padding-bottom:12px; margin-bottom:20px;">
            <h3 style="margin:0; font-size:1.15rem; font-weight:800; color:#dc2626;">🚨 RAPID intake registration (RED/ORANGE Critical)</h3>
            <span style="cursor:pointer; color:#64748b; font-weight:bold;" onclick="window.closeRegOverlay()">&times;</span>
          </div>

          <div style="display:flex; flex-direction:column; gap:14px; margin-bottom:20px;">
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <div class="form-field" style="flex:1;">
                <label>Name or Identity Tag (e.g. Unknown Male ~45yrs)</label>
                <input type="text" id="rapid-reg-name" placeholder="Name or Unknown ID" value="Unknown Male ~45yrs">
              </div>
              <label style="margin-left:12px; margin-top:14px; font-size:0.75rem; font-weight:700; color:#ea580c; cursor:pointer;">
                <input type="checkbox" id="reg-unknown-chk" checked onchange="window.toggleRegUnknown(this.checked)"> Unknown Patient
              </label>
            </div>

            <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
              <div class="form-field">
                <label>Approx Age</label>
                <input type="text" id="rapid-reg-age" placeholder="Age (e.g. 45)" value="45">
              </div>
              <div class="form-field">
                <label>Sex</label>
                <select id="rapid-reg-gender" style="padding:8px; border-radius:6px; border:1px solid #cbd5e1; background:#fff; cursor:pointer;">
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div class="form-field">
              <label>Chief Complaint / Trauma Description</label>
              <textarea id="rapid-reg-complaint" rows="2" style="padding:8px; border-radius:6px; border:1px solid #cbd5e1; resize:none;">Polytrauma stable, brought by ambulance</textarea>
            </div>

            <div class="form-field">
              <label>Triage Tag Priority</label>
              <div class="triage-selector">
                <div class="triage-sel-btn red active" onclick="window.switchRegTriage('RED')">🔴 RED</div>
                <div class="triage-sel-btn orange" onclick="window.switchRegTriage('ORANGE')">🟠 ORANGE</div>
              </div>
            </div>
          </div>

          <div style="display:flex; justify-content:flex-end; gap:8px;">
            <button class="btn btn-secondary" onclick="window.closeRegOverlay()">Cancel</button>
            <button class="btn btn-primary" style="background:#dc2626; border:none; padding:10px 20px; font-weight:700; border-radius:6px;" onclick="window.submitRapidIntake()">
              Register &amp; Send to Resus →
            </button>
          </div>
        </div>
      `;
      return;
    }

    var stepContent = '';
    if (regStep === 1) {
      stepContent = `
        <div style="display:flex; flex-direction:column; gap:12px;">
          <div style="font-size:0.8rem; font-weight:700; color:#475569; margin-bottom:8px;">STEP 1: IDENTITY DETAILS</div>
          <div class="form-field">
            <label>Full Name *</label>
            <input type="text" id="reg-stable-name" placeholder="Full Name" value="Karan Malhotra">
          </div>
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
            <div class="form-field">
              <label>Age *</label>
              <input type="number" id="reg-stable-age" placeholder="Age" value="34">
            </div>
            <div class="form-field">
              <label>Sex *</label>
              <select id="reg-stable-gender" style="padding:8px; border-radius:6px; border:1px solid #cbd5e1; background:#fff; cursor:pointer;">
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
          <div class="form-field">
            <label>Mobile Number *</label>
            <input type="tel" id="reg-stable-mobile" placeholder="10-digit phone" value="9876501234">
          </div>
          <div class="form-field">
            <label>Address</label>
            <input type="text" id="reg-stable-address" placeholder="Address line" value="Sector 4 HSR Layout, Bengaluru">
          </div>
        </div>
      `;
    } else if (regStep === 2) {
      stepContent = `
        <div style="display:flex; flex-direction:column; gap:12px;">
          <div style="font-size:0.8rem; font-weight:700; color:#475569; margin-bottom:8px;">STEP 2: CLINICAL CONCERNS</div>
          <div class="form-field">
            <label>Chief Complaint *</label>
            <input type="text" id="reg-stable-complaint" placeholder="Clinical complaints" value="Acute abdominal pain, vomiting">
          </div>
          <div class="form-field">
            <label>Known Allergies</label>
            <input type="text" id="reg-stable-allergies" value="No Known Allergies">
          </div>
        </div>
      `;
    } else {
      stepContent = `
        <div style="display:flex; flex-direction:column; gap:12px;">
          <div style="font-size:0.8rem; font-weight:700; color:#475569; margin-bottom:8px;">STEP 3: PAYER &amp; BILLING CONFIG</div>
          <div class="form-field">
            <label>Payer Type</label>
            <select id="reg-stable-payer" style="padding:8px; border-radius:6px; border:1px solid #cbd5e1; background:#fff; cursor:pointer;">
              <option value="Self Pay">Self Pay / Cash Tariff</option>
              <option value="Star Health">Star Health Insurance</option>
              <option value="HDFC ERGO">HDFC ERGO TPA</option>
            </select>
          </div>
          <div class="form-field">
            <label>Initial Deposit Collected (₹)</label>
            <input type="number" id="reg-stable-deposit" value="2000">
          </div>
        </div>
      `;
    }

    container.innerHTML = `
      <div style="background:#fff; border:1px solid #cbd5e1; border-radius:12px; padding:24px; max-width:650px; margin: 2rem auto; box-shadow:0 10px 25px rgba(0,0,0,0.15);">
        <div style="display:flex; justify-content:space-between; border-bottom:1px solid #cbd5e1; padding-bottom:12px; margin-bottom:16px;">
          <h3 style="margin:0; font-size:1.15rem; font-weight:800; color:#1e3a8a;">📝 New Patient ED Intake Form (Step ${regStep}/3)</h3>
          <span style="cursor:pointer; color:#64748b; font-weight:bold;" onclick="window.closeRegOverlay()">&times;</span>
        </div>

        <div style="margin-bottom:20px;">
          ${stepContent}
        </div>

        <div style="display:flex; justify-content:space-between; align-items:center;">
          <div>
            ${regStep > 1 ? `<button class="btn btn-secondary" style="padding:8px 16px;" onclick="window.prevRegStep()">← Back</button>` : ''}
          </div>
          <div style="display:flex; gap:8px;">
            <button class="btn btn-secondary" onclick="window.closeRegOverlay()">Cancel</button>
            ${regStep < 3 ? 
              `<button class="btn btn-primary" style="background:#2563eb; border:none; padding:8px 16px; font-weight:700; border-radius:6px;" onclick="window.nextRegStep()">Continue →</button>` : 
              `<button class="btn btn-primary" style="background:#059669; border:none; padding:8px 18px; font-weight:700; border-radius:6px;" onclick="window.submitStableReg()">Register &amp; Save</button>`
            }
          </div>
        </div>
      </div>
    `;
  }

  /* ==========================================================================
     360° DETAILED PATIENT RECORD VIEW
     ========================================================================== */
  function renderPatient360View(container, uhid) {
    var ep = window.state.emergencyPatients.find(p => p.uhid === uhid);
    if (!ep) {
      alert("Emergency Patient record not found.");
      selectedPatientUhid = '';
      renderEDDashboard(container);
      return;
    }

    var pat = window.state.patients.find(pt => pt.uhid === uhid);
    var isMlc = ep.flags.includes('MLC');
    var tier = getEDTier();
    
    container.innerHTML = `
      <div class="ed-wrap" style="background:#fff; border:1px solid #cbd5e1; border-radius:12px; padding:24px; box-shadow:0 4px 15px rgba(0,0,0,0.05);">
        
        <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:2px solid #cbd5e1; padding-bottom:14px; margin-bottom:20px;">
          <div style="display:flex; align-items:center; gap:12px;">
            <button class="btn btn-secondary" style="padding:6px 12px; font-weight:700;" onclick="window.closeED360()">← Back</button>
            <div>
              <h2 style="margin:0; font-size:1.3rem; font-weight:800; color:#1e3a8a;">👤 ${pat.name}</h2>
              <div style="font-size:0.75rem; color:#64748b; font-weight:600; margin-top:2px; display:flex; gap:12px;">
                <span>ER: <strong class="mono">${ep.erNumber}</strong></span>
                <span>UHID: <strong class="mono">${ep.uhid}</strong></span>
                <span>Age/Sex: <strong>${pat.age} · ${pat.gender}</strong></span>
              </div>
            </div>
          </div>
          <div style="display:flex; align-items:center; gap:8px;">
            ${isMlc || ep.triage === 'RED' ? `
              <button class="btn btn-danger" style="background:#dc2626; border:none; padding:4px 8px; font-size:0.7rem; font-weight:700; border-radius:4px;" onclick="window.showEDTraumaPackOverlay('${ep.uhid}')">
                🚨 Request Trauma Pack
              </button>
            ` : ''}
            ${ep.isUnidentified ? '<span class="ed-badge orange">🔍 UNIDENTIFIED</span>' : '<span class="ed-badge green">✓ IDENTIFIED</span>'}
            <span class="ed-badge ${ep.triage.toLowerCase()}">${ep.triage} PRIORITY</span>
            ${isMlc ? `<span class="mlc-badge" style="padding:4px 8px; font-size:10px;">⚖️ MLC Case</span>` : ''}
          </div>
        </div>

        <div style="display:flex; border-bottom:1px solid #cbd5e1; gap:6px; margin-bottom:20px;" id="patient-360-tabs">
          <button class="tab-btn active" id="tab-link-clinical" onclick="window.switchED360Tab('clinical')">📋 Clinical Log</button>
          ${ep.isUnidentified ? `<button class="tab-btn" id="tab-link-identity" onclick="window.switchED360Tab('identity')">🔍 Resolve Identity</button>` : ''}
          ${ep.triage === 'RED' ? `<button class="tab-btn" id="tab-link-resus" onclick="window.switchED360Tab('resus')">🔴 Resus Protocol</button>` : ''}
          ${isMlc ? `<button class="tab-btn" id="tab-link-mlc" onclick="window.switchED360Tab('mlc')">⚖️ MLC Police Form</button>` : ''}
          <button class="tab-btn" id="tab-link-disposition" onclick="window.switchED360Tab('disposition')">📤 Disposition Decision</button>
        </div>

        <div id="patient-360-section-content">
          ${renderClinicalLogSection(ep, pat)}
        </div>
      </div>
    `;
  }

  window.closeED360 = function() { selectedPatientUhid = ''; renderEDDashboard(document.getElementById('main-content')); };

  function renderClinicalLogSection(ep, pat) {
    var bedsideRegBanner = '';
    if (ep.regIncomplete) {
      bedsideRegBanner = `
        <div style="background:#fffbeb; border:1px solid #fde68a; border-radius:8px; padding:12px; margin-bottom:16px; display:flex; justify-content:space-between; align-items:center;">
          <span style="font-size:0.75rem; font-weight:700; color:#92400e;">⚠️ Registration details incomplete bedside. Resolve identity to complete.</span>
          <button class="btn btn-secondary btn-sm" style="background:#fff; border-color:#fde68a; color:#92400e; font-weight:700;" onclick="window.switchED360Tab('identity')">Resolve Identity</button>
        </div>
      `;
    }

    var html = `
      ${bedsideRegBanner}
      <div style="display:grid; grid-template-columns:1.5fr 1fr; gap:20px;">
        <div style="display:flex; flex-direction:column; gap:16px;">
          <div class="checklist-card" style="background:#fafafa;">
            <div style="font-size:0.75rem; font-weight:800; color:#475569; border-bottom:1px solid #cbd5e1; padding-bottom:6px; margin-bottom:10px;">CHIEF COMPLAINT & PRESENTATION</div>
            <div style="font-size:0.85rem; color:#1e293b; font-weight:600; line-height:1.5;">
              "${ep.complaint}"
            </div>
            <div style="font-size:0.75rem; color:#64748b; margin-top:8px;">
              Vitals: <strong>BP: ${ep.vitals?.bp} | HR: ${ep.vitals?.hr}/min | Temp: ${ep.vitals?.temp}°F | SpO₂: ${ep.vitals?.spo2}%</strong>
            </div>
          </div>

          <div style="background:#fff; border:1px solid #cbd5e1; border-radius:8px; padding:14px;">
            <div style="font-size:0.75rem; font-weight:800; color:#334155; margin-bottom:10px;">MEDICATIONS ADMINISTERED (MAR)</div>
            <table class="er-table" style="width:100%; font-size:0.75rem;">
              <thead>
                <tr style="background:#f8fafc; border-bottom:1px solid #cbd5e1;">
                  <th>Time</th>
                  <th>Drug / Dose</th>
                  <th>Route</th>
                  <th>Admin By</th>
                  <th style="text-align:right;">Status</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style="padding:8px 6px;">11:10 AM</td>
                  <td style="padding:8px 6px;"><strong>Inj. Tramadol 50mg</strong></td>
                  <td style="padding:8px 6px;">IV Push</td>
                  <td style="padding:8px 6px;">Nurse Mary</td>
                  <td style="padding:8px 6px; text-align:right; color:#059669; font-weight:bold;">Given</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div style="background:#fafafa; border:1px solid #cbd5e1; border-radius:8px; padding:16px;">
          <div style="font-size:0.75rem; font-weight:800; color:#475569; border-bottom:1px solid #cbd5e1; padding-bottom:6px; margin-bottom:14px; text-transform:uppercase;">ED Case Timeline Log</div>
          <div class="resus-timeline">
            ${(ep.timeline || []).map(t => `
              <div class="timeline-node" style="padding-bottom:12px;">
                <div style="font-size:0.65rem; font-weight:700; color:#64748b;">🕒 ${t.time || '—'}</div>
                <div style="font-size:0.75rem; font-weight:700; color:#1e293b; margin-top:2px;">${t.icon} ${t.title}</div>
                <div style="font-size:0.7rem; color:#475569; margin-top:2px;">${t.desc}</div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
    return html;
  }

  function renderIdentityResolutionSection(ep) {
    var desc = ep.physicalDescription || {};
    return `
      <div style="background:#fff; border:1px solid #cbd5e1; border-radius:10px; padding:20px;">
        <div style="font-size:0.8rem; font-weight:800; color:#1e3a8a; border-bottom:1px solid #cbd5e1; padding-bottom:6px; margin-bottom:16px;">🔍 RESOLVE UNIDENTIFIED PATIENT IDENTITY</div>
        
        <div style="display:grid; grid-template-columns:1.5fr 1fr; gap:20px;">
          <div style="display:flex; flex-direction:column; gap:12px;">
            <div class="form-field">
              <label>Confirmed Full Name *</label>
              <input type="text" id="id-res-name" placeholder="Enter confirmed patient name" value="Manjunath Gowda">
            </div>
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
              <div class="form-field">
                <label>Confirmed Age *</label>
                <input type="number" id="id-res-age" value="55">
              </div>
              <div class="form-field">
                <label>Confirmed Gender *</label>
                <select id="id-res-gender" style="padding:8px; border-radius:6px; border:1px solid #cbd5e1; background:#fff; cursor:pointer;">
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>
            </div>
            <div class="form-field">
              <label>Mobile Number</label>
              <input type="tel" id="id-res-mobile" value="9845091234">
            </div>
            <div class="form-field">
              <label>Home Address</label>
              <input type="text" id="id-res-address" value="23, 4th Cross, HSR Sector 2, Bengaluru">
            </div>
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
              <div class="form-field">
                <label>ID Proof Document Type</label>
                <select id="id-res-proof" style="padding:8px; border-radius:6px; border:1px solid #cbd5e1; background:#fff;">
                  <option value="Aadhaar">Aadhaar Card</option>
                  <option value="Voter ID">Voter ID</option>
                  <option value="Passport">Passport</option>
                </select>
              </div>
              <div class="form-field">
                <label>ID proof number</label>
                <input type="text" id="id-res-proof-num" value="9082 1234 4567">
              </div>
            </div>
            <div style="display:grid; grid-template-columns:1.2fr 1fr; gap:12px;">
              <div class="form-field">
                <label>Identified by</label>
                <select id="id-res-by" style="padding:8px; border-radius:6px; border:1px solid #cbd5e1; background:#fff;">
                  <option value="Family">Family Member / Relative</option>
                  <option value="Police">Police Officer</option>
                  <option value="Self">Self identification</option>
                </select>
              </div>
              <div class="form-field">
                <label>Relationship (if family)</label>
                <input type="text" id="id-res-rel" value="Son">
              </div>
            </div>

            <button class="btn btn-primary" style="background:#059669; border:none; padding:12px; border-radius:6px; font-weight:700; font-size:0.85rem;" onclick="window.resolvePatientIdentity('${ep.uhid}')">
              ✓ Save Identity Resolution &amp; Update Records
            </button>
          </div>

          <div style="background:#fafafa; border:1px solid #cbd5e1; border-radius:8px; padding:14px; display:flex; flex-direction:column; gap:8px; font-size:0.75rem;">
            <div style="font-weight:800; border-bottom:1px solid #e2e8f0; padding-bottom:4px; color:#475569;">PHYSICAL DESCRIPTION DETAILS LOGGED AT INTAKE</div>
            <div>Height: <strong>${desc.height || '—'}</strong> | Build: <strong>${desc.build || '—'}</strong></div>
            <div>Complexion: <strong>${desc.complexion || '—'}</strong></div>
            <div>Distinguishing Marks: <em>"${desc.features || '—'}"</em></div>
            <div>Clothing: <em>"${desc.clothing || '—'}"</em></div>
            <div style="margin-top:10px; color:#64748b; font-style:italic;">
              Resolving identity propagates patient name updates across all EMR registers instantly.
            </div>
          </div>
        </div>
      </div>
    `;
  }

  window.resolvePatientIdentity = function(uhid) {
    var ep = window.state.emergencyPatients.find(p => p.uhid === uhid);
    var pat = window.state.patients.find(pt => pt.uhid === uhid);

    if (ep && pat) {
      const name = document.getElementById('id-res-name').value.trim();
      const age = document.getElementById('id-res-age').value.trim();
      const gender = document.getElementById('id-res-gender').value;
      const mobile = document.getElementById('id-res-mobile').value.trim();
      const address = document.getElementById('id-res-address').value.trim();
      const proof = document.getElementById('id-res-proof').value;

      if (!name || !age) {
        alert("Name and age are required to resolve identity.");
        return;
      }

      pat.name = name;
      pat.age = parseInt(age);
      pat.gender = gender;
      pat.mobile = mobile;
      pat.address = address;

      const bedId = ep.bed;
      if (bedId && window.state.bedsStatus[bedId]) {
        window.state.bedsStatus[bedId].patientName = name;
      }

      ep.isUnidentified = false; 
      ep.regIncomplete = false;
      ep.timeline = ep.timeline || [];
      ep.timeline.unshift({
        time: new Date().toLocaleTimeString('en-US', {hour:'2-digit', minute:'2-digit'}),
        type: 'clinical',
        icon: '✓',
        title: 'Identity Resolved',
        desc: `Verified name: ${name} via ${proof}.`
      });

      localStorage.setItem('saronil_patients', JSON.stringify(window.state.patients));
      localStorage.setItem('saronil_bedsStatus', JSON.stringify(window.state.bedsStatus));

      alert("Patient Identity successfully resolved and synchronized across all records!");
      selectedPatientUhid = ''; 
      renderEDDashboard(document.getElementById('main-content'));
    }
  };

  window.switchED360Tab = function (tabName) {
    const ep = window.state.emergencyPatients.find(p => p.uhid === selectedPatientUhid);
    const pat = window.state.patients.find(pt => pt.uhid === selectedPatientUhid);
    
    document.querySelectorAll('#patient-360-tabs .tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.id === `tab-link-${tabName}`);
    });

    const content = document.getElementById('patient-360-section-content');
    if (content) {
      if (tabName === 'clinical') content.innerHTML = renderClinicalLogSection(ep, pat);
      else if (tabName === 'identity') content.innerHTML = renderIdentityResolutionSection(ep);
      else if (tabName === 'resus') content.innerHTML = renderResusSection(ep);
      else if (tabName === 'mlc') content.innerHTML = renderMlcSection(ep);
      else if (tabName === 'disposition') content.innerHTML = renderDispositionSection(ep);
    }
  };

  // Resus Section with Standard vs Advanced Survey Modes
  function renderResusSection(ep) {
    var tier = getEDTier();
    var isLocked = ep.primarySurvey && ep.primarySurvey.saved;
    var survey = ep.primarySurvey || {};

    if (tier === 'standard') {
      // Standard mode: simple checklist + single notes block, one save survey button
      return `
        <div style="background:#fff; border:1px solid #cbd5e1; border-radius:10px; padding:20px;">
          <div style="font-size:0.85rem; font-weight:800; color:#1e3a8a; border-bottom:1px solid #cbd5e1; padding-bottom:6px; margin-bottom:16px;">🩺 Primary Survey Checkoff (Standard Mode)</div>
          
          <div class="checklist-grid" style="margin-bottom:16px;">
            <label class="checklist-item"><input type="checkbox" id="std-rs-airway" checked> Airway patent and secure</label>
            <label class="checklist-item"><input type="checkbox" id="std-rs-breathing" checked> Breathing spontaneous and equal</label>
            <label class="checklist-item"><input type="checkbox" id="std-rs-circulation" checked> IV access secured bilateral</label>
            <label class="checklist-item"><input type="checkbox" id="std-rs-disability" checked> Pupils equal and reactive</label>
            <label class="checklist-item"><input type="checkbox" id="std-rs-exposure" checked> Full exposure examination completed</label>
          </div>

          <div class="form-field" style="margin-bottom:16px;">
            <label>Primary Survey Clinical Notes</label>
            <textarea id="std-rs-notes" rows="4" placeholder="Clinical survey comments..."></textarea>
          </div>

          <button class="btn btn-primary" style="background:#059669; width:100%; border:none; padding:10px; font-weight:700;" onclick="window.saveStandardSurvey('${ep.uhid}')">
            Save Primary Survey
          </button>
        </div>
      `;
    }

    // Advanced: dynamic separately time-stamped locked survey
    var airwayHTML = `
      <div style="background:${isLocked ? '#f1f5f9' : '#fff'}; border:1px solid #cbd5e1; border-radius:8px; padding:14px; margin-bottom:12px;">
        <div style="font-size:0.75rem; font-weight:800; color:#1e3a8a; margin-bottom:10px;">A — AIRWAY</div>
        <div style="display:grid; grid-template-columns:1fr 2fr; gap:12px;">
          <div class="form-field">
            <label>Airway Status</label>
            <select id="rs-airway-status" ${isLocked ? 'disabled' : ''} style="padding:6px; font-size:0.8rem;">
              <option value="Patent ✓" ${survey.airwayStatus === 'Patent ✓' ? 'selected' : ''}>Patent ✓</option>
              <option value="Compromised" ${survey.airwayStatus === 'Compromised' ? 'selected' : ''}>Compromised</option>
              <option value="Intubated" ${survey.airwayStatus === 'Intubated' ? 'selected' : ''}>Intubated</option>
            </select>
          </div>
          <div class="form-field">
            <label>Clinical Notes</label>
            <input type="text" id="rs-airway-notes" value="${survey.airwayNotes || ''}" ${isLocked ? 'readonly' : ''}>
          </div>
        </div>
      </div>
    `;

    var breathingHTML = `
      <div style="background:${isLocked ? '#f1f5f9' : '#fff'}; border:1px solid #cbd5e1; border-radius:8px; padding:14px; margin-bottom:12px;">
        <div style="font-size:0.75rem; font-weight:800; color:#1e3a8a; margin-bottom:10px;">B — BREATHING</div>
        <div style="display:grid; grid-template-columns:1fr 1fr 1fr 2fr; gap:12px;">
          <div class="form-field"><label>RR</label><input type="number" id="rs-rr" value="${survey.breathingRR || '24'}" ${isLocked ? 'readonly' : ''}></div>
          <div class="form-field"><label>SpO₂</label><input type="number" id="rs-spo2" value="${survey.breathingSpo2 || '88'}" ${isLocked ? 'readonly' : ''}></div>
          <div class="form-field">
            <label>O₂ Delivery</label>
            <select id="rs-delivery" ${isLocked ? 'disabled' : ''} style="padding:6px;">
              <option value="Mask" ${survey.breathingDelivery === 'Mask' ? 'selected' : ''}>Mask</option>
              <option value="None" ${survey.breathingDelivery === 'None' ? 'selected' : ''}>None</option>
            </select>
          </div>
          <div class="form-field"><label>Auscultation Notes</label><input type="text" id="rs-breathing-notes" value="${survey.breathingNotes || ''}" ${isLocked ? 'readonly' : ''}></div>
        </div>
      </div>
    `;

    return `
      <div style="display:grid; grid-template-columns:2fr 1fr; gap:20px;">
        <div>
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
            <span style="font-size:0.8rem; font-weight:800; color:#334155;">Trauma Primary Survey Log (ABCDE)</span>
            ${isLocked ? 
              `<span style="font-size:0.7rem; color:#059669; font-weight:700; border:1px solid #a7f3d0; background:#ecfdf5; border-radius:4px; padding:2px 8px;">🔒 Locked: ${survey.savedBy} (${survey.timestamp})</span>` : 
              `<button class="btn btn-primary btn-sm" style="background:#059669; border:none; padding:4px 12px; font-size:0.75rem; font-weight:700; border-radius:4px;" onclick="window.savePrimarySurvey('${ep.uhid}')">Save Primary Survey</button>`
            }
          </div>
          ${airwayHTML}
          ${breathingHTML}
        </div>
        <div style="background:#fafafa; border:1px solid #cbd5e1; border-radius:8px; padding:16px;">
          <div style="font-size:0.75rem; font-weight:800; color:#334155; border-bottom:1px solid #cbd5e1; padding-bottom:6px; margin-bottom:10px;">⏱️ Resus Event Log</div>
          <div style="display:flex; flex-direction:column; gap:6px;">
            <div class="form-field"><label>Event Details</label><input type="text" id="re-details" placeholder="e.g. Inj. Adrenaline 1mg IV"></div>
            <button class="btn btn-primary btn-sm" style="background:#2563eb; border:none; padding:6px; font-weight:700;" onclick="window.addResusEvent('${ep.uhid}')">+ Add Event</button>
          </div>
        </div>
      </div>
    `;
  }

  window.saveStandardSurvey = function (uhid) {
    var ep = window.state.emergencyPatients.find(p => p.uhid === uhid);
    if (ep) {
      ep.timeline = ep.timeline || [];
      ep.timeline.unshift({
        time: new Date().toLocaleTimeString('en-US', {hour:'2-digit', minute:'2-digit'}),
        type: 'clinical',
        icon: '✓',
        title: 'Primary Survey Saved',
        desc: document.getElementById('std-rs-notes').value.trim() || 'Survey checkoff completed.'
      });
      alert("Standard Primary Survey checklist documented.");
      window.switchED360Tab('clinical');
    }
  };

  window.savePrimarySurvey = function (uhid) {
    var ep = window.state.emergencyPatients.find(p => p.uhid === uhid);
    if (!ep) return;
    ep.primarySurvey = {
      saved: true,
      savedBy: activeRole === 'ED Doctor' ? 'Dr. Fatima Sheikh' : 'Staff Nurse Mary',
      timestamp: new Date().toLocaleTimeString('en-US', {hour:'2-digit', minute:'2-digit'}),
      airwayStatus: document.getElementById('rs-airway-status').value,
      airwayNotes: document.getElementById('rs-airway-notes').value.trim(),
      breathingRR: document.getElementById('rs-rr').value,
      breathingSpo2: document.getElementById('rs-spo2').value,
      breathingDelivery: document.getElementById('rs-delivery').value,
      breathingNotes: document.getElementById('rs-breathing-notes').value.trim(),
    };
    alert("Primary Survey locked.");
    window.switchED360Tab('resus');
  };

  window.addResusEvent = function (uhid) {
    var ep = window.state.emergencyPatients.find(p => p.uhid === uhid);
    if (!ep) return;
    var details = document.getElementById('re-details').value.trim();
    if (!details) { alert("Please enter event details."); return; }
    ep.resusEvents = ep.resusEvents || [];
    ep.resusEvents.unshift({
      time: new Date().toLocaleTimeString('en-US', {hour:'2-digit', minute:'2-digit'}),
      type: 'Event Log',
      details: details,
      user: activeRole === 'ED Doctor' ? 'Dr. Fatima Sheikh' : 'Staff Nurse Mary'
    });
    alert("Event logged.");
    window.switchED360Tab('resus');
  };

  // MLC workflow triggers
  function renderMlcSection(ep) {
    var details = ep.mlcDetails || {};
    var isConfirmed = details.confirmed;
    return `
      <div style="background:#fff; border:1px solid #cbd5e1; border-radius:10px; padding:20px;">
        <div style="font-size:0.8rem; font-weight:800; color:#7f1d1d; border-bottom:1px solid #cbd5e1; padding-bottom:6px; margin-bottom:16px;">⚖️ MLC CASE FILE CONFIRMATION &amp; INJURY LOGS</div>
        
        <div style="background:#fff5f5; border:1px solid #feb2b2; border-radius:8px; padding:12px; margin-bottom:16px; display:flex; justify-content:space-between; align-items:center;">
          <span style="font-size:0.75rem; font-weight:700; color:#9b2c2c;">⚠️ Police notification required for MLC cases.</span>
          ${!isConfirmed ? 
            `<button class="btn btn-primary btn-sm" style="background:#7f1d1d; border:none;" onclick="window.confirmMlcStatus('${ep.uhid}')">Confirm MLC Case</button>` : 
            `<span style="font-size:0.7rem; font-weight:700; color:#059669; border:1px solid #a7f3d0; background:#ecfdf5; border-radius:4px; padding:2px 8px;">⚖️ MLC Confirmed (${details.diaryNo})</span>`
          }
        </div>

        <div style="display:grid; grid-template-columns:1.5fr 1fr; gap:20px;">
          <div style="display:flex; flex-direction:column; gap:12px;">
            <div class="form-field">
              <label>Nature of Injuries *</label>
              <textarea id="mlc-nature" rows="3" style="padding:6px; font-size:0.8rem; border-radius:6px; border:1px solid #cbd5e1; resize:none;">${details.nature || ''}</textarea>
            </div>
            <div class="form-field">
              <label>Suspected Weapon / Cause</label>
              <input type="text" id="mlc-weapon" value="${details.weapon || ''}">
            </div>
            <div class="form-field">
              <label>Jurisdiction Police Station Informed *</label>
              <input type="text" id="mlc-ps" value="${details.policeStation || ''}">
            </div>
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
              <div class="form-field"><label>Informed Time *</label><input type="text" id="mlc-informed-time" value="${details.informedTime || '11:45 AM'}"></div>
              <div class="form-field"><label>FIR Reference Number</label><input type="text" id="mlc-fir" value="${details.firNo || ''}"></div>
            </div>
            <button class="btn btn-primary" style="background:#7f1d1d; border:none; padding:10px; border-radius:6px; font-weight:700;" onclick="window.savePoliceIntimation('${ep.uhid}')">
              💾 Save Police Intimation Details
            </button>
          </div>
          <div style="background:#fafafa; border:1px solid #cbd5e1; border-radius:8px; padding:14px; display:flex; flex-direction:column; gap:10px;">
            <button class="btn btn-secondary" style="font-weight:700; border-color:#cbd5e1; width:100%;" onclick="window.printMLCCertificate('${ep.uhid}')">🖨️ Print MLC Certificate</button>
          </div>
        </div>
      </div>
    `;
  }

  window.confirmMlcStatus = function(uhid) {
    var ep = window.state.emergencyPatients.find(p => p.uhid === uhid);
    if (ep && ep.mlcDetails) {
      ep.mlcDetails.confirmed = true;
      ep.mlcDetails.diaryNo = 'MLC-2026-00' + uhid.slice(-2);
      ep.mlcDetails.informedTime = new Date().toLocaleDateString('en-GB') + ' · ' + new Date().toLocaleTimeString('en-US', {hour:'2-digit', minute:'2-digit'});
      alert(`MLC Confirmed! Number: ${ep.mlcDetails.diaryNo}`);
      window.switchED360Tab('mlc');
    }
  };

  window.savePoliceIntimation = function (uhid) {
    var ep = window.state.emergencyPatients.find(p => p.uhid === uhid);
    if (ep && ep.mlcDetails) {
      const ps = document.getElementById('mlc-ps').value.trim();
      const informed = document.getElementById('mlc-informed-time').value.trim();
      const fir = document.getElementById('mlc-fir').value.trim();
      if (!ps) { alert("Police station name is required."); return; }
      ep.mlcDetails.confirmed = true;
      ep.mlcDetails.policeStation = ps;
      ep.mlcDetails.informedTime = informed;
      ep.mlcDetails.firNo = fir;
      ep.mlcDetails.witnessHistory = document.getElementById('mlc-nature').value;
      ep.mlcDetails.weapon = document.getElementById('mlc-weapon').value;
      alert("MLC Police Intimation saved!");
      window.switchED360Tab('mlc');
    }
  };

  // Dispositions selector
  function renderDispositionSection(ep) {
    var isMlc = ep.flags.includes('MLC');
    var isIntimated = ep.mlcDetails && ep.mlcDetails.confirmed;

    var wardBedsHTML = '';
    Object.keys(window.state.wards).forEach(function(wKey) {
      const ward = window.state.wards[wKey];
      const avBeds = ward.beds.filter(b => window.state.bedsStatus[b]?.status === 'Available');
      avBeds.forEach(function(bedId) {
        wardBedsHTML += `<option value="${wKey}|${bedId}">${ward.name} — Bed ${bedId}</option>`;
      });
    });

    return `
      <div style="display:grid; grid-template-columns:1.2fr 1fr; gap:24px;">
        <div style="background:#fff; border:1px solid #cbd5e1; border-radius:10px; padding:20px;">
          <div class="form-field" style="margin-bottom:16px;">
            <label>Clinician Disposition Decision</label>
            <select id="disp-decision" style="padding:8px; border-radius:6px; border:1px solid #cbd5e1; background:#fff; font-weight:600; cursor:pointer;" onchange="window.switchEDDispView(this.value)">
              <option value="discharge">Discharge from ED</option>
              <option value="admit">Admit to IPD</option>
              <option value="transfer">Transfer Out</option>
              <option value="death">Death in ED</option>
              <option value="lama">LAMA</option>
            </select>
          </div>

          <div id="ed-disp-panel-content">
            ${renderDischargeDispHTML(ep, isMlc, isIntimated)}
          </div>
        </div>
      </div>
    `;
  }

  function renderDischargeDispHTML(ep, isMlc, isIntimated) {
    var dischargeActive = (!isMlc || isIntimated);
    return `
      <div style="display:flex; flex-direction:column; gap:12px;">
        <div class="checklist-grid" style="background:#fafafa; border:1px solid #cbd5e1; border-radius:6px; padding:10px; display:flex; flex-direction:column; gap:6px;">
          <label class="checklist-item"><input type="checkbox" id="chk-summary" checked> Discharge Summary Written</label>
          <label class="checklist-item"><input type="checkbox" id="chk-rx" checked> Prescription Generated (Generic)</label>
          <label class="checklist-item"><input type="checkbox" id="chk-nurse" checked> Nursing Clearance Checklist</label>
          <label class="checklist-item"><input type="checkbox" id="chk-bill" checked> Billing Counter Clearance Approved</label>
        </div>
        <button class="btn btn-primary" style="background:#059669; border:none; padding:12px; border-radius:6px; font-weight:700;" ${dischargeActive ? '' : 'disabled'} onclick="window.executeEDDischarge('${ep.uhid}')">
          Confirm Discharge from ED
        </button>
      </div>
    `;
  }

  function renderAdmitDispHTML(wardBedsHTML) {
    return `
      <div style="display:flex; flex-direction:column; gap:12px;">
        <div class="form-field">
          <label>Target Ward &amp; Bed Pool</label>
          <select id="disp-ipd-bed" style="padding:6px; font-size:0.8rem; border-radius:6px; border:1px solid #cbd5e1; background:#fff; cursor:pointer;">
            ${wardBedsHTML || '<option value="">No available ward beds</option>'}
          </select>
        </div>
        <div class="form-field">
          <label>Admitting Consultant</label>
          <select id="disp-ipd-doc" style="padding:6px; font-size:0.8rem; border-radius:6px; border:1px solid #cbd5e1; background:#fff;">
            <option value="Dr. Srinivasan">Dr. Srinivasan (General Medicine)</option>
          </select>
        </div>
        <button class="btn btn-primary" style="background:#2563eb; border:none; padding:12px; border-radius:6px; font-weight:700;" onclick="window.executeEDAdmit('${selectedPatientUhid}')">
          Send Admission Request &amp; Admit
        </button>
      </div>
    `;
  }

  function renderTransferDispHTML() {
    return `
      <div style="display:flex; flex-direction:column; gap:12px;">
        <div class="form-field"><label>Receiving Hospital Name</label><input type="text" id="trf-hospital" value="NIMHANS, Bengaluru"></div>
        <button class="btn btn-primary" style="background:#7c3aed; border:none; padding:12px; border-radius:6px; font-weight:700;" onclick="window.executeEDTransfer('${selectedPatientUhid}')">
          Confirm Transfer Out
        </button>
      </div>
    `;
  }

  function renderDeathDispHTML(ep) {
    return `
      <div style="display:flex; flex-direction:column; gap:12px;">
        <div class="form-field"><label>Time of Death (declared)</label><input type="text" id="death-time" value="11:45 AM"></div>
        <button class="btn btn-primary" style="background:#1e293b; border:none; padding:12px; border-radius:6px; font-weight:700;" onclick="window.executeEDDeath('${ep.uhid}')">
          Confirm Death &amp; Send to Mortuary
        </button>
      </div>
    `;
  }

  function renderLamaDispHTML() {
    return `
      <div style="display:flex; flex-direction:column; gap:12px;">
        <div class="form-field"><label>Reason stated by patient / attender</label><textarea id="lama-reason" rows="2" style="padding:6px; resize:none;">Refusing admission.</textarea></div>
        <button class="btn btn-primary" style="background:#d97706; border:none; padding:12px; border-radius:6px; font-weight:700;" onclick="window.executeEDLama('${selectedPatientUhid}')">
          Confirm LAMA Discharge
        </button>
      </div>
    `;
  }

  window.switchEDDispView = function (val) {
    const ep = window.state.emergencyPatients.find(p => p.uhid === selectedPatientUhid);
    const content = document.getElementById('ed-disp-panel-content');
    if (!content || !ep) return;

    if (val === 'discharge') {
      var isMlc = ep.flags.includes('MLC');
      var isIntimated = ep.mlcDetails && ep.mlcDetails.confirmed;
      content.innerHTML = renderDischargeDispHTML(ep, isMlc, isIntimated);
    } else if (val === 'admit') {
      var wardBedsHTML = '';
      Object.keys(window.state.wards).forEach(function(wKey) {
        const ward = window.state.wards[wKey];
        const avBeds = ward.beds.filter(b => window.state.bedsStatus[b]?.status === 'Available');
        avBeds.forEach(function(bedId) {
          wardBedsHTML += `<option value="${wKey}|${bedId}">${ward.name} — Bed ${bedId}</option>`;
        });
      });
      content.innerHTML = renderAdmitDispHTML(wardBedsHTML);
    } else if (val === 'transfer') {
      content.innerHTML = renderTransferDispHTML();
    } else if (val === 'death') {
      content.innerHTML = renderDeathDispHTML(ep);
    } else if (val === 'lama') {
      content.innerHTML = renderLamaDispHTML();
    }
  };

  window.executeEDDischarge = function (uhid) {
    var ep = window.state.emergencyPatients.find(p => p.uhid === uhid);
    if (ep) {
      if (ep.bed !== 'Waiting') {
        const bed = window.state.emergencyBeds.find(b => b.id === ep.bed);
        if (bed) {
          bed.status = 'Available';
          bed.patientUhid = null;
        }
        window.state.bedsStatus[ep.bed] = { wardKey: 'EMERGENCY', status: 'Available', patientUhid: null };
      }
      var masterPat = window.state.patients.find(p => p.uhid === uhid);
      if (masterPat) masterPat.status = 'Discharged';
      window.state.emergencyPatients = window.state.emergencyPatients.filter(p => p.uhid !== uhid);
      localStorage.setItem('saronil_patients', JSON.stringify(window.state.patients));
      localStorage.setItem('saronil_bedsStatus', JSON.stringify(window.state.bedsStatus));
      alert("Patient discharged from ED.");
      selectedPatientUhid = '';
      renderEDDashboard(document.getElementById('main-content'));
    }
  };

  window.executeEDAdmit = function (uhid) {
    const val = document.getElementById('disp-ipd-bed').value;
    if (!val) { alert("Please select a bed."); return; }
    const [wardKey, bedId] = val.split('|');
    const doc = document.getElementById('disp-ipd-doc').value;

    var ep = window.state.emergencyPatients.find(p => p.uhid === uhid);
    var pat = window.state.patients.find(pt => pt.uhid === uhid);

    if (ep && pat) {
      if (ep.bed !== 'Waiting') {
        const bed = window.state.emergencyBeds.find(b => b.id === ep.bed);
        if (bed) {
          bed.status = 'Available';
          bed.patientUhid = null;
        }
        window.state.bedsStatus[ep.bed] = { wardKey: 'EMERGENCY', status: 'Available', patientUhid: null };
      }
      window.state.bedsStatus[bedId] = { wardKey: wardKey, status: 'Occupied', patientUhid: uhid, patientName: pat.name, doctorName: doc };
      window.state.admissions = window.state.admissions || [];
      window.state.admissions.push({ id: 'ADM' + String(5000 + window.state.admissions.length + 1), uhid: uhid, patientName: pat.name, doctorName: doc, ward: wardKey, bed: bedId, date: new Date().toISOString().slice(0,10), status: 'Active' });
      
      pat.type = 'IPD';
      pat.status = 'Admitted';
      pat.ward = window.state.wards[wardKey]?.name || 'Ward';
      pat.bed = bedId;
      pat.primaryConsultant = doc;

      window.state.emergencyPatients = window.state.emergencyPatients.filter(p => p.uhid !== uhid);
      localStorage.setItem('saronil_patients', JSON.stringify(window.state.patients));
      localStorage.setItem('saronil_admissions', JSON.stringify(window.state.admissions));
      localStorage.setItem('saronil_bedsStatus', JSON.stringify(window.state.bedsStatus));
      alert(`IPD Admission request executed! Admitted to ${pat.ward} — Bed ${bedId}.`);
      selectedPatientUhid = '';
      renderEDDashboard(document.getElementById('main-content'));
    }
  };

  window.executeEDTransfer = function (uhid) {
    var ep = window.state.emergencyPatients.find(p => p.uhid === uhid);
    if (ep) {
      if (ep.bed !== 'Waiting') {
        const bed = window.state.emergencyBeds.find(b => b.id === ep.bed);
        if (bed) { bed.status = 'Available'; bed.patientUhid = null; }
        window.state.bedsStatus[ep.bed] = { wardKey: 'EMERGENCY', status: 'Available', patientUhid: null };
      }
      var masterPat = window.state.patients.find(p => p.uhid === uhid);
      if (masterPat) masterPat.status = 'Discharged';
      window.state.emergencyPatients = window.state.emergencyPatients.filter(p => p.uhid !== uhid);
      localStorage.setItem('saronil_patients', JSON.stringify(window.state.patients));
      localStorage.setItem('saronil_bedsStatus', JSON.stringify(window.state.bedsStatus));
      alert("Patient transferred out.");
      selectedPatientUhid = '';
      renderEDDashboard(document.getElementById('main-content'));
    }
  };

  window.executeEDDeath = function (uhid) {
    var ep = window.state.emergencyPatients.find(p => p.uhid === uhid);
    if (ep) {
      if (ep.bed !== 'Waiting') {
        const bed = window.state.emergencyBeds.find(b => b.id === ep.bed);
        if (bed) { bed.status = 'Available'; bed.patientUhid = null; }
        window.state.bedsStatus[ep.bed] = { wardKey: 'EMERGENCY', status: 'Available', patientUhid: null };
      }
      var masterPat = window.state.patients.find(p => p.uhid === uhid);
      if (masterPat) masterPat.status = 'Deceased';
      window.state.emergencyPatients = window.state.emergencyPatients.filter(p => p.uhid !== uhid);
      localStorage.setItem('saronil_patients', JSON.stringify(window.state.patients));
      localStorage.setItem('saronil_bedsStatus', JSON.stringify(window.state.bedsStatus));
      alert("Death declaration documented.");
      selectedPatientUhid = '';
      renderEDDashboard(document.getElementById('main-content'));
    }
  };

  window.executeEDLama = function (uhid) {
    var ep = window.state.emergencyPatients.find(p => p.uhid === uhid);
    if (ep) {
      if (ep.bed !== 'Waiting') {
        const bed = window.state.emergencyBeds.find(b => b.id === ep.bed);
        if (bed) { bed.status = 'Available'; bed.patientUhid = null; }
        window.state.bedsStatus[ep.bed] = { wardKey: 'EMERGENCY', status: 'Available', patientUhid: null };
      }
      var masterPat = window.state.patients.find(p => p.uhid === uhid);
      if (masterPat) masterPat.status = 'Left Against Medical Advice';
      window.state.emergencyPatients = window.state.emergencyPatients.filter(p => p.uhid !== uhid);
      localStorage.setItem('saronil_patients', JSON.stringify(window.state.patients));
      localStorage.setItem('saronil_bedsStatus', JSON.stringify(window.state.bedsStatus));
      alert("LAMA Discharge recorded.");
      selectedPatientUhid = '';
      renderEDDashboard(document.getElementById('main-content'));
    }
  };

  /* ==========================================================================
     NURSE OVERLAYS
     ========================================================================== */
  window.openNurseVitalsModal = function (uhid) {
    var ep = window.state.emergencyPatients.find(p => p.uhid === uhid);
    if (!ep) return;
    var pat = window.state.patients.find(pt => pt.uhid === uhid);
    var modal = document.createElement('div');
    modal.id = 'nurse-vitals-modal';
    modal.className = 'modal-overlay';
    modal.style.cssText = "position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.5); z-index:9999; display:flex; align-items:center; justify-content:center;";
    modal.innerHTML = `
      <div class="modal-box" style="background:#fff; border-radius:10px; width:400px; padding:20px;">
        <div style="display:flex; justify-content:space-between; border-bottom:1px solid #cbd5e1; padding-bottom:8px; margin-bottom:14px;">
          <h4 style="margin:0; font-weight:800; color:#1e3a8a;">Record Vitals: ${pat.name}</h4>
          <span style="cursor:pointer; font-weight:bold;" onclick="document.getElementById('nurse-vitals-modal').remove()">&times;</span>
        </div>
        <div style="display:flex; flex-direction:column; gap:10px; margin-bottom:16px;">
          <div class="form-field"><label>BP</label><input type="text" id="nv-bp" value="120/80"></div>
          <div class="form-field"><label>HR</label><input type="number" id="nv-hr" value="72"></div>
          <div class="form-field"><label>SpO₂ (%)</label><input type="number" id="nv-spo2" value="98"></div>
        </div>
        <div style="display:flex; justify-content:flex-end; gap:8px;">
          <button class="btn btn-secondary" onclick="document.getElementById('nurse-vitals-modal').remove()">Cancel</button>
          <button class="btn btn-primary" style="background:#2563eb; border:none;" onclick="window.saveNurseVitals('${uhid}')">Save Vitals</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  };

  window.saveNurseVitals = function (uhid) {
    var ep = window.state.emergencyPatients.find(p => p.uhid === uhid);
    if (ep) {
      const bp = document.getElementById('nv-bp').value;
      const hr = parseInt(document.getElementById('nv-hr').value);
      const spo2 = parseInt(document.getElementById('nv-spo2').value);

      ep.vitals = { bp: bp, hr: hr, temp: 98.4, spo2: spo2, weight: 70, rr: 18, gcs: 15, pain: 2 };
      
      let alarmTriggered = (spo2 < 90);

      if (alarmTriggered) {
        window.state.emergencyAlerts = window.state.emergencyAlerts || [];
        window.state.emergencyAlerts.unshift({
          id: 'al-dyn-' + Date.now(),
          uhid: uhid,
          name: window.state.patients.find(p=>p.uhid===uhid)?.name || 'Patient',
          text: `🔴 ALERT — ${window.state.patients.find(p=>p.uhid===uhid)?.name} — SpO₂ dropping below 90%!`,
          acknowledged: false
        });
      }

      ep.timeline = ep.timeline || [];
      ep.timeline.unshift({
        time: new Date().toLocaleTimeString('en-US', {hour:'2-digit', minute:'2-digit'}),
        type: 'clinical',
        icon: '🌡️',
        title: 'Vitals Logged',
        desc: `BP: ${bp} | HR: ${hr} | SpO₂: ${spo2}%`
      });

      alert("Vital signs logged.");
      document.getElementById('nurse-vitals-modal').remove();
      renderEDDashboard(document.getElementById('main-content'));
    }
  };

  window.openNurseMarModal = function (uhid) {
    var ep = window.state.emergencyPatients.find(p => p.uhid === uhid);
    if (!ep) return;
    var pat = window.state.patients.find(pt => pt.uhid === uhid);
    var modal = document.createElement('div');
    modal.id = 'nurse-mar-modal';
    modal.className = 'modal-overlay';
    modal.style.cssText = "position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.5); z-index:9999; display:flex; align-items:center; justify-content:center;";
    modal.innerHTML = `
      <div class="modal-box" style="background:#fff; border-radius:10px; width:400px; padding:20px;">
        <div style="display:flex; justify-content:space-between; border-bottom:1px solid #cbd5e1; padding-bottom:8px; margin-bottom:14px;">
          <h4 style="margin:0; font-weight:800; color:#1e3a8a;">Medication MAR: ${pat.name}</h4>
          <span style="cursor:pointer; font-weight:bold;" onclick="document.getElementById('nurse-mar-modal').remove()">&times;</span>
        </div>
        <div style="display:flex; flex-direction:column; gap:10px; margin-bottom:16px;">
          <div class="form-field"><label>Medication</label><input type="text" id="mar-drug" value="Inj. Pantocid 40mg"></div>
          <div class="form-field"><label>Dose</label><input type="text" id="mar-dose" value="40 mg"></div>
        </div>
        <div style="display:flex; justify-content:flex-end; gap:8px;">
          <button class="btn btn-secondary" onclick="document.getElementById('nurse-mar-modal').remove()">Cancel</button>
          <button class="btn btn-primary" style="background:#059669; border:none;" onclick="window.administerDrug('${uhid}')">Administer</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  };

  window.administerDrug = function(uhid) {
    var ep = window.state.emergencyPatients.find(p => p.uhid === uhid);
    if (ep) {
      const drug = document.getElementById('mar-drug').value.trim();
      const dose = document.getElementById('mar-dose').value.trim();
      ep.timeline = ep.timeline || [];
      ep.timeline.unshift({
        time: new Date().toLocaleTimeString('en-US', {hour:'2-digit', minute:'2-digit'}),
        type: 'pharmacy',
        icon: '💊',
        title: 'Medication Administered',
        desc: `${drug} (${dose}) administered by Nurse Mary.`
      });
      alert(`Medication administered.`);
      document.getElementById('nurse-mar-modal').remove();
      renderEDDashboard(document.getElementById('main-content'));
    }
  };

  // ==========================================================================
  // ED SPECIFIC TRAUMA PACK REQUEST OVERLAY
  // ==========================================================================
  window.showEDTraumaPackOverlay = function(uhid) {
    var pat = window.state.patients.find(p => p.uhid === uhid) || { name: 'Unknown Male ~55yrs' };

    var overlayId = 'ed-trauma-pack-overlay';
    var existing = document.getElementById(overlayId);
    if (existing) existing.remove();

    var overlayDiv = document.createElement('div');
    overlayDiv.id = overlayId;
    overlayDiv.style.cssText = 'position:fixed; inset:0; background:rgba(0,0,0,0.6); z-index:99999; display:flex; justify-content:center; align-items:center; font-family:var(--font-body);';

    var items = [
      { name: 'IV NS 500ml', qty: 4, stock: 145, status: '✓' },
      { name: 'IV cannula 18G', qty: 6, stock: 200, status: '✓' },
      { name: 'Sterile Gloves', qty: 4, stock: 950, status: '✓' },
      { name: 'Sterile Drape', qty: 2, stock: 8, status: '✓' },
      { name: 'Dressing Gauze', qty: 10, stock: 4, status: '⚠ LOW' },
      { name: 'Sutures (Silk 2-0)', qty: 3, stock: 18, status: '✓' }
    ];

    overlayDiv.innerHTML = `
      <div style="background:var(--bg-surface); border:1px solid var(--border-color); border-radius:8px; width:92%; max-width:620px; box-shadow:var(--shadow-lg); overflow:hidden;" onclick="event.stopPropagation()">
        <!-- Header -->
        <div style="padding:16px 24px; display:flex; justify-content:space-between; align-items:center; background:#ef4444; color:#fff;">
          <h3 style="margin:0; font-size:1.1rem; font-family:var(--font-display); font-weight:700;">🚨 Trauma Pack Request — STAT</h3>
          <button onclick="document.getElementById('${overlayId}').remove()" style="background:none; border:none; font-size:1.4rem; cursor:pointer; color:inherit; font-weight:bold;">&times;</button>
        </div>

        <!-- Body -->
        <div style="padding:20px 24px; max-height:60vh; overflow-y:auto; display:flex; flex-direction:column; gap:12px; text-align:left; color:var(--text-primary);">
          <div style="background:var(--bg-base-elevated); padding:12px; border-radius:4px; border:1px solid var(--border-color); font-size:0.75rem;">
            <strong>Patient:</strong> ${pat.name} &middot; <span class="mono">${uhid}</span><br>
            <strong>Pack Type:</strong> Major Trauma Template
          </div>

          <table class="custom-table" style="font-size:0.75rem; width:100%;">
            <thead>
              <tr>
                <th>Item</th>
                <th>Qty</th>
                <th>In Stock</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${items.map(it => {
                var trStyle = it.stock < 10 ? 'background-color:#fffbeb; color:#d97706;' : '';
                return `
                  <tr style="${trStyle}">
                    <td><strong>${it.name}</strong></td>
                    <td>${it.qty}</td>
                    <td>${it.stock}</td>
                    <td><strong>${it.status}</strong></td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>

        <!-- Footer -->
        <div style="padding:16px 24px; border-top:1px solid var(--border-color); display:flex; justify-content:flex-end; gap:12px; background:var(--bg-base-elevated);">
          <button class="btn btn-secondary btn-sm" onclick="document.getElementById('${overlayId}').remove()">Cancel</button>
          <button class="btn btn-primary btn-sm" style="background:#ef4444; border-color:#ef4444;" onclick="window.submitEDTraumaPack('${uhid}')">STAT Request</button>
        </div>
      </div>
    `;

    window.submitEDTraumaPack = function(u) {
      var reqId = "IND-2026-0" + Math.floor(642 + Math.random() * 50);
      window.state.invIndents.unshift({
        id: reqId,
        type: "Consumable",
        dept: "Emergency",
        itemsCount: items.length,
        raisedBy: "ER Coordinator",
        raisedAt: "Today",
        urgency: "STAT",
        status: "Pending",
        notes: `STAT Trauma Pack: Major Trauma for ${pat.name}`,
        items: items.map(itm => ({
          code: 'ITM-CON-ER', name: itm.name, req: itm.qty, av: itm.stock, unit: 'pcs', issueQty: itm.qty, batch: '—', notes: itm.status
        }))
      });
      alert(`STAT Trauma pack request submitted successfully: ${reqId}`);
      overlayDiv.remove();
      if (window.router && window.router.currentPage && window.views[window.router.currentPage]) {
        window.views[window.router.currentPage](window.router.container, window.router.currentSubAnchor || '', window.router.currentParams || {});
      }
    };

    document.body.appendChild(overlayDiv);
  };

})();
