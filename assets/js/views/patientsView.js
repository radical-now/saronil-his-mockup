/* ==========================================================================
   SARONIL HMS - STREAMLINED CLINICAL EMR WORKSTATION & REGISTRY
   NABH-Accredited Private Hospital Standard daily workflow engine
   ========================================================================== */

window.views.patients = function(container, subAnchor, params) {
  params = params || {};
  const state = window.state || {};
  const activeUhid = params.uhid;
  const activeVisit = params.visit;
  
  if (params.tab) {
    window.activePatientsTab = params.tab;
    delete params.tab;
  }

  const requestedTab = params.p360tab;
  if (params.p360tab) {
    window.patient360ActiveTab = params.p360tab;
    delete params.p360tab;
  }
  
  if (params.action) {
    const act = params.action.toLowerCase();
    if (act === 'prescribe') window.p360ActiveModal = 'Prescribe';
    else if (act === 'orderlab') window.p360ActiveModal = 'Order Lab';
    else if (act === 'radiology') window.p360ActiveModal = 'Radiology';
    else if (act === 'note') window.p360ActiveModal = 'Write Note';
    else if (act === 'vitals') window.p360ActiveModal = 'Record Vitals';
    else if (act === 'discharge') window.p360ActiveModal = 'Discharge';
    else if (act === 'transfer') window.p360ActiveModal = 'Transfer';
    delete params.action;
  }
  
  ensure307PatientsExist();
  
  state.activeUserRole = state.activeUserRole || localStorage.getItem('saronil_active_user_role') || 'Doctor';
  
  if (activeUhid) {
    const patientsList = state.patients || [];
    let patient = patientsList.find(p => p.uhid === activeUhid);
    if (!patient) {
      // Find info in queues
      let name = params.name || "Rajesh Kumar";
      let consultant = "Dr. Ramesh Kumar";
      let dept = "Cardiology";
      let diagnosis = "Evaluation";
      let ward = "Ward A";
      let bed = "A-204";
      let type = activeVisit && activeVisit.startsWith("IP") ? "IPD" : "OPD";
      let status = activeVisit && activeVisit.startsWith("IP") ? "Admitted" : "Completed";

      // Look up in opdQueue
      if (state.opdQueue) {
        const found = state.opdQueue.find(q => q.uhid === activeUhid);
        if (found) {
          name = found.patient || found.name || name;
          consultant = found.doctor || consultant;
          dept = found.speciality || dept;
          type = "OPD";
          status = found.status || status;
        }
      }
      // Look up in appointments
      if (state.appointments) {
        const found = state.appointments.find(a => a.uhid === activeUhid);
        if (found) {
          name = found.patientName || found.name || name;
          consultant = found.doctorName || found.doctor || consultant;
          dept = found.department || dept;
          type = "OPD";
        }
      }
      // Look up in admissionRequests
      if (state.admissionRequests) {
        const found = state.admissionRequests.find(r => r.uhid === activeUhid);
        if (found) {
          name = found.name || found.patientName || name;
          consultant = found.refDoc || consultant;
          dept = found.department || dept;
          diagnosis = found.diagnosis || diagnosis;
          ward = found.ward || ward;
          type = "IPD";
          status = "Admitted";
        }
      }
      // Look up in transferRequests
      if (state.transferRequests) {
        const found = state.transferRequests.find(r => r.uhid === activeUhid);
        if (found) {
          name = found.name || found.patientName || name;
          consultant = found.requestedBy || consultant;
          ward = found.targetWard || ward;
          type = "IPD";
          status = "Admitted";
        }
      }
      // Look up in daycareAdmissions
      if (state.daycareAdmissions) {
        const found = state.daycareAdmissions.find(d => d.patient && d.patient.uhid === activeUhid);
        if (found) {
          name = found.patient.name || name;
          consultant = found.consultantName || consultant;
          ward = found.wardNo || ward;
          bed = found.bedNo || bed;
          type = "Daycare";
          status = found.status || status;
        }
      }
      // Look up in billing
      if (state.billing) {
        const found = state.billing.find(b => b.uhid === activeUhid);
        if (found) {
          name = found.patientName || found.name || name;
        }
      }

      patient = {
        uhid: activeUhid,
        name: name,
        age: params.age ? parseInt(params.age) : 45,
        gender: params.gender || "Male",
        type: type,
        mobile: "+91 98765 43210",
        bloodGroup: "B+",
        allergies: "Penicillin, Sulpha drugs",
        payer: "Star Health TPA",
        payerType: "TPA/Insurance",
        primaryConsultant: consultant,
        department: dept,
        status: status,
        vitals: { bp: "120/80", hr: 72, temp: 98.4, spo2: 98, weight: 70, bmi: 22.8, pain: 0, rr: 16 },
        clinicalData: { complaint: "General chest discomfort", hpi: "None", examination: "NAD", diagnosis: diagnosis, treatmentPlan: "Monitoring", carePlan: "Routine check" },
        prescriptions: [
          { name: "Tab Pantocid 40mg", dose: "1 tab", freq: "Once daily (Before breakfast)", duration: "10 Days", generic: "Pantoprazole", route: "Oral", active: true, scheduler: "H" }
        ],
        history: { pastConditions: "None", surgeries: "None", familyHistory: "None" },
        ward: ward,
        bed: bed,
        alerts: ["No alerts"],
        newsScore: 0,
        lastActivity: "Progress note · 2h ago",
        ipNumber: activeVisit && activeVisit.startsWith("IP") ? activeVisit : "—",
        opNumber: activeVisit && activeVisit.startsWith("OP") ? activeVisit : "—",
        vitalsOverdue: false,
        labsUnreviewed: false,
        los: 3,
        dischargeClearances: { clinical: false, billing: false, summaryReady: false }
      };
      patientsList.push(patient);
    }
    ensurePatientEMRInitialized(patient);
    renderPatient360Profile(container, patient, requestedTab || subAnchor || '', activeVisit);
  } else {
    renderMasterPatientRegistry(container);
  }
};

function randomRange(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function ensurePatientEMRInitialized(patient) {
  if (!patient) return;
  patient.timelineEvents = patient.timelineEvents || [];
  patient.prescriptions = patient.prescriptions || [];
  patient.dischargeClearances = patient.dischargeClearances || { clinical: false, billing: false, summaryReady: false };
  if (!patient.vitals) {
    patient.vitals = { bp: "120/80", hr: 72, temp: 98.4, spo2: 98, weight: 70, bmi: 22.8, pain: 0, rr: 16 };
  }
}

// --------------------------------------------------------------------------
// MOCK PATIENT GENERATOR (307 Patients matching daily clinical targets)
// --------------------------------------------------------------------------

// --------------------------------------------------------------------------
// MOCK PATIENT GENERATOR (101 Patients matching daily clinical targets)
// --------------------------------------------------------------------------
function ensure307PatientsExist() {
  const state = window.state || {};
  if (state.patients && state.patients.length === 100) {
    return;
  }
  const localData = localStorage.getItem('saronil_patients');
  if (localData) {
    const parsed = JSON.parse(localData);
    if (parsed && parsed.length === 100) {
      state.patients = parsed;
      return;
    }
  }
  // Otherwise, invoke seedState to regenerate from state.js if state is available
  if (typeof seedState === 'function') {
    seedState();
  }
}
function randomRange(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function ensurePatientEMRInitialized(patient) {
  if (!patient) return;
  patient.timelineEvents = patient.timelineEvents || [];
  patient.prescriptions = patient.prescriptions || [];
  patient.dischargeClearances = patient.dischargeClearances || { clinical: false, billing: false, summaryReady: false };
  if (!patient.vitals) {
    patient.vitals = { bp: "120/80", hr: 72, temp: 98.4, spo2: 98, weight: 70, bmi: 22.8, pain: 0, rr: 16 };
  }
}

// --------------------------------------------------------------------------
// 1. MASTER PATIENT REGISTRY (PART A) - Overhauled to Patient Records list
// --------------------------------------------------------------------------
function renderMasterPatientRegistry(container) {
  ensure307PatientsExist();

  // Initialize active search tab and filters
  if (window.activePatientsTab === undefined) {
    window.activePatientsTab = 'All';
  }
  if (window.patientsFilters === undefined) {
    window.patientsFilters = { dept: 'All', doctor: 'All', ward: 'All', payer: 'All', service: 'All', dateRange: 'All Patients', fromDate: '', toDate: '', singleDate: '' };
  }
  if (window.patientsSort === undefined) {
    window.patientsSort = 'Admission Time ↓';
  }
  if (window.patientsSearchQuery === undefined) {
    window.patientsSearchQuery = '';
  }

  // Inject Google Font for JetBrains Mono
  if (!document.getElementById('theme-font-link')) {
    const link = document.createElement('link');
    link.id = 'theme-font-link';
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&display=swap';
    document.head.appendChild(link);
  }

  // Inject styles to override container layout cleanly
  const workspaceStyles = `
    <style>
      .pr-wrap {
        --bg: var(--bg-base, #f8fafc);
        --surface: var(--bg-surface, #ffffff);
        --surface2: var(--bg-surface-elevated, #f1f5f9);
        --border: var(--border-color, #e2e8f0);
        --text: var(--text-primary, #0f172a);
        --text2: var(--text-secondary, #475569);
        --text3: var(--text-muted, #94a3b8);
        --blue: var(--primary, #2563eb);
        --blue-light: var(--primary-glow, #eff6ff);
        --green: var(--color-success, #10b981);
        --green-light: var(--color-success-bg, #ecfdf5);
        --amber: var(--color-warning, #f59e0b);
        --amber-light: var(--color-warning-bg, #fef3c7);
        --red: var(--color-danger, #ef4444);
        --red-light: var(--color-danger-bg, #fef2f2);
        --purple: var(--color-purple, #8b5cf6);
        --purple-light: var(--color-purple-bg, #f5f3ff);
        --cyan: #06b6d4;
        --cyan-light: #ecfeff;

        font-family: var(--font-body, 'Inter', sans-serif);
        font-size: 13px;
        color: var(--text);
        background: var(--bg);
        display: flex;
        flex-direction: column;
        gap: 16px;
        padding: 16px;
      }
      .pr-wrap .mono {
        font-family: 'JetBrains Mono', 'Courier New', monospace;
      }
      .pr-card {
        background: var(--surface);
        border: 1px solid var(--border);
        border-radius: 8px;
        padding: 16px;
        box-shadow: 0 1px 2px rgba(0,0,0,0.02);
      }
      
      /* Stats Row */
      .pr-stats-row {
        display: flex;
        gap: 12px;
        overflow-x: auto;
        scrollbar-width: none; /* Firefox */
        padding-bottom: 4px;
      }
      .pr-stats-row::-webkit-scrollbar {
        display: none; /* Chrome/Safari */
      }
      .pr-stat-card {
        flex: 0 0 160px;
        background: var(--surface);
        border: 1px solid var(--border);
        border-radius: 8px;
        padding: 12px 14px;
        cursor: pointer;
        position: relative;
        overflow: hidden;
        transition: all 0.15s ease-in-out;
        display: flex;
        flex-direction: column;
        gap: 2px;
      }
      .pr-stat-card::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 3px;
        background: var(--accent-color, var(--blue));
      }
      .pr-stat-card:hover {
        box-shadow: 0 2px 8px rgba(0,0,0,0.06);
        border-color: #cbd5e1;
      }
      .pr-stat-card.active {
        background: var(--accent-light, var(--blue-light));
        border-color: var(--accent-color, var(--blue));
      }
      .pr-stat-val {
        font-size: 24px;
        font-weight: 600;
        color: var(--accent-color, var(--blue));
        font-family: monospace;
        line-height: 1.1;
      }
      .pr-stat-label {
        font-size: 11px;
        color: var(--text3);
        text-transform: uppercase;
        letter-spacing: 0.5px;
        font-weight: 500;
      }
      .pr-stat-dimmed {
        opacity: 0.5;
      }

      /* Filter Tabs */
      .pr-tabs-strip {
        display: flex;
        border-bottom: 1px solid var(--border);
        overflow-x: auto;
        scrollbar-width: none;
        gap: 4px;
      }
      .pr-tabs-strip::-webkit-scrollbar {
        display: none;
      }
      .pr-tab {
        padding: 8px 16px;
        font-size: 13px;
        font-weight: 500;
        color: var(--text2);
        cursor: pointer;
        border-bottom: 2px solid transparent;
        white-space: nowrap;
        display: flex;
        align-items: center;
        gap: 6px;
        transition: all 0.15s;
      }
      .pr-tab:hover {
        background: var(--surface2);
      }
      .pr-tab.active {
        border-bottom-color: var(--blue);
        color: var(--blue);
        background: var(--blue-light);
      }
      .pr-tab.dimmed {
        color: var(--text3);
      }
      .pr-dot-red { color: var(--red); }
      .pr-dot-amber { color: var(--amber); }

      /* Search & Action */
      .pr-search-row {
        display: flex;
        gap: 12px;
        align-items: center;
        position: relative;
      }
      .pr-search-wrapper {
        flex: 1;
        position: relative;
        display: flex;
        align-items: center;
      }
      .pr-search-icon {
        position: absolute;
        left: 10px;
        color: var(--text3);
        pointer-events: none;
      }
      .pr-search-clear {
        position: absolute;
        right: 10px;
        color: var(--text3);
        cursor: pointer;
        font-size: 16px;
        user-select: none;
      }
      .pr-search-clear:hover {
        color: var(--text);
      }
      .pr-search-input {
        width: 100%;
        padding: 8px 10px 8px 30px;
        border: 1px solid var(--border);
        border-radius: 8px;
        outline: none;
        font-size: 13px;
        transition: border-color 0.15s;
      }
      .pr-search-input:focus {
        border-color: var(--blue);
      }
      .pr-btn-add {
        background: var(--blue);
        color: #fff;
        border: none;
        border-radius: 8px;
        padding: 8px 16px;
        font-size: 13px;
        font-weight: 500;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 6px;
        white-space: nowrap;
        height: 34px;
      }
      .pr-btn-add:hover {
        background: #082d6b;
      }

      /* Suggestive Dropdown */
      .pr-search-dropdown {
        position: absolute;
        top: 36px;
        left: 0;
        right: 0;
        background: var(--surface);
        border: 1px solid var(--border);
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.08);
        z-index: 100;
        max-height: 280px;
        overflow-y: auto;
      }
      .pr-search-result-row {
        padding: 8px 12px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        cursor: pointer;
        border-bottom: 1px solid var(--border);
      }
      .pr-search-result-row:last-child {
        border-bottom: none;
      }
      .pr-search-result-row.selected, .pr-search-result-row:hover {
        background: var(--blue-light);
      }
      .pr-avatar {
        width: 28px;
        height: 28px;
        border-radius: 50%;
        background: var(--blue-light);
        color: var(--blue);
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 600;
        font-size: 11px;
      }
      .pr-dropdown-view-all {
        text-align: center;
        padding: 8px;
        font-weight: 600;
        color: var(--blue);
        cursor: pointer;
        background: var(--surface2);
        font-size: 12px;
      }
      .pr-dropdown-view-all:hover {
        background: #e2e8f0;
      }

      /* Secondary Filters */
      .pr-filters-row {
        display: flex;
        gap: 8px;
        align-items: center;
        flex-wrap: wrap;
      }
      .pr-filter-select {
        height: 32px;
        border: 1px solid var(--border);
        border-radius: 8px;
        background: var(--surface);
        padding: 0 8px;
        font-size: 13px;
        outline: none;
        color: var(--text2);
        cursor: pointer;
      }
      .pr-filter-select.active {
        border-color: var(--blue);
        background: var(--blue-light);
        color: var(--blue);
        font-weight: 500;
      }
      .pr-clear-link {
        font-size: 13px;
        font-weight: 500;
        color: var(--blue);
        cursor: pointer;
        text-decoration: none;
        margin-left: auto;
        user-select: none;
      }
      .pr-clear-link:hover {
        text-decoration: underline;
      }

      /* Results & Sort */
      .pr-results-bar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 12px;
        color: var(--text2);
        font-weight: 500;
      }

      /* Table */
      .pr-table-container {
        overflow-x: auto;
        border: 1px solid var(--border);
        border-radius: 8px;
        background: var(--surface);
      }
      .pr-table {
        width: 100%;
        border-collapse: collapse;
        text-align: left;
      }
      .pr-table th {
        background: var(--surface2);
        padding: 10px 12px;
        font-weight: 600;
        color: var(--text2);
        border-bottom: 1px solid var(--border);
      }
      .pr-table td {
        padding: 10px 12px;
        border-bottom: 1px solid var(--border);
        vertical-align: middle;
      }
      .pr-table tbody tr {
        cursor: pointer;
        background: var(--surface);
        transition: background 0.1s;
      }
      .pr-table tbody tr:nth-child(even) {
        background: var(--surface);
      }
      .pr-table tbody tr:nth-child(odd) {
        background: var(--surface2);
      }
      .pr-table tbody tr:hover {
        background: var(--blue-light) !important;
      }
      
      /* Badges */
      .pr-badge {
        display: inline-block;
        padding: 2px 8px;
        border-radius: 4px;
        font-size: 11px;
        font-weight: 600;
        text-transform: uppercase;
      }
      .badge-ipd { background: var(--purple-light); color: var(--purple); }
      .badge-opd { background: var(--blue-light); color: var(--blue); }
      .badge-emergency { background: var(--red-light); color: var(--red); }
      .badge-daycare { background: #ecfeff; color: #0891b2; }

      .status-admitted { background: var(--green-light); color: var(--green); }
      .status-consultation { background: var(--blue-light); color: var(--blue); }
      .status-observation { background: var(--amber-light); color: var(--amber); }
      .status-preop { background: var(--purple-light); color: var(--purple); }
      .status-postop { background: var(--purple-light); color: var(--purple); }
      .status-discharged { background: #f1f5f9; color: var(--text3); }
      .status-pending { background: var(--amber-light); color: var(--amber); }
      .status-critical { background: var(--red-light); color: var(--red); }
      .status-lama { background: var(--red-light); color: var(--red); }

      .flag-pill {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        padding: 2px 6px;
        border-radius: 4px;
        font-size: 10px;
        font-weight: 600;
      }
      .flag-critical { background: var(--red-light); color: var(--red); }
      .flag-mlc { background: var(--amber-light); color: var(--amber); }
      .flag-dnr { background: #f1f5f9; color: var(--text2); }
      .flag-lama { background: var(--amber-light); color: var(--amber); }

      .btn-view {
        background: transparent;
        border: 1px solid var(--blue);
        color: var(--blue);
        padding: 2px 8px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 11px;
        font-weight: 600;
      }
      .btn-view:hover {
        background: var(--blue-light);
      }
      
      /* Dropdown Actions */
      .kebab-trigger {
        background: transparent;
        border: none;
        color: var(--text2);
        cursor: pointer;
        font-size: 16px;
        padding: 4px 8px;
      }
      .kebab-menu {
        position: absolute;
        right: 12px;
        background: var(--surface);
        border: 1px solid var(--border);
        border-radius: 6px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        z-index: 110;
        display: flex;
        flex-direction: column;
        width: 140px;
      }
      .kebab-item {
        padding: 6px 12px;
        text-align: left;
        font-size: 12px;
        border: none;
        background: transparent;
        color: var(--text2);
        cursor: pointer;
      }
      .kebab-item:hover {
        background: var(--surface2);
        color: var(--text);
      }

      /* Toast notifications */
      .pr-toast {
        position: fixed;
        bottom: 24px;
        right: 24px;
        background: #0f172a;
        color: #fff;
        padding: 10px 18px;
        border-radius: 6px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        font-size: 13px;
        font-weight: 500;
        z-index: 1000;
        display: flex;
        align-items: center;
        gap: 8px;
        animation: slideUp 0.2s ease-out;
      }
      @keyframes slideUp {
        from { transform: translateY(12px); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
      }

      /* Empty State */
      .pr-empty-state {
        padding: 48px 16px;
        text-align: center;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 10px;
        background: var(--surface);
        border-radius: 8px;
      }
    </style>
  `;

  function draw() {
    const data = window.state.patients;
    const activeTab = window.activePatientsTab;
    const filters = window.patientsFilters;
    const sort = window.patientsSort;
    const query = window.patientsSearchQuery;

    // Compute dynamic stats
    const countTotal = data.length;
    const countIpdActive = data.filter(p => p.type === 'IPD' && p.status !== 'Discharged').length;
    const countOpdToday = data.filter(p => p.type === 'OPD').length;
    const countEmergencyActive = data.filter(p => p.type === 'Emergency' && p.status !== 'Discharged').length;
    const countDaycareActive = data.filter(p => p.type === 'Daycare' && p.status !== 'Discharged').length;
    const countDischargedToday = data.filter(p => p.status === 'Discharged').length;
    const countCritical = data.filter(p => p.status === 'Critical' || (p.flags && p.flags.includes('Critical'))).length;
    const countMlcActive = data.filter(p => (p.flags && p.flags.includes('MLC')) && p.status !== 'Discharged').length;
    const countDischargePending = data.filter(p => p.status === 'Discharge Pending').length;

    // Filter logic
    let filtered = data;

    // Tab filtering
    if (activeTab === 'IPD') {
      filtered = filtered.filter(p => p.type === 'IPD' && p.status !== 'Discharged');
    } else if (activeTab === 'OPD') {
      filtered = filtered.filter(p => p.type === 'OPD');
    } else if (activeTab === 'Emergency') {
      filtered = filtered.filter(p => p.type === 'Emergency' && p.status !== 'Discharged');
    } else if (activeTab === 'Daycare') {
      filtered = filtered.filter(p => p.type === 'Daycare' && p.status !== 'Discharged');
    } else if (activeTab === 'Discharged Today') {
      filtered = filtered.filter(p => p.status === 'Discharged');
    } else if (activeTab === 'Critical') {
      filtered = filtered.filter(p => p.status === 'Critical' || (p.flags && p.flags.includes('Critical')));
    } else if (activeTab === 'MLC') {
      filtered = filtered.filter(p => p.flags && p.flags.includes('MLC'));
    } else if (activeTab === 'Discharge Pending') {
      filtered = filtered.filter(p => p.status === 'Discharge Pending');
    }

    // Secondary filters
    if (filters.dept !== 'All') {
      filtered = filtered.filter(p => p.department === filters.dept);
    }
    if (filters.doctor !== 'All') {
      filtered = filtered.filter(p => p.primaryConsultant === filters.doctor);
    }
    if (filters.ward !== 'All') {
      filtered = filtered.filter(p => p.ward === filters.ward);
    }
    if (filters.payer !== 'All') {
      filtered = filtered.filter(p => p.payer === filters.payer);
    }
    // Service Taken filter
    if (filters.service && filters.service !== 'All') {
      const sMap = {
        'OPD Consultation': 'OPD',
        'IPD Admission': 'IPD',
        'Daycare Procedure': 'Daycare',
        'Emergency Admission': 'Emergency'
      };
      const typeKey = sMap[filters.service];
      if (typeKey) {
        filtered = filtered.filter(p => p.type === typeKey);
      }
    }
    // Date filtering
    if (filters.dateRange === 'Custom Range' && filters.fromDate && filters.toDate) {
      const from = new Date(filters.fromDate);
      const to = new Date(filters.toDate);
      filtered = filtered.filter(p => {
        if (!p.admitted) return false;
        const parts = p.admitted.split(' · ')[0].split(' ');
        const months = { 'Jan':0, 'Feb':1, 'Mar':2, 'Apr':3, 'May':4, 'Jun':5, 'Jul':6, 'Aug':7, 'Sep':8, 'Oct':9, 'Nov':10, 'Dec':11 };
        const pDate = new Date(parseInt(parts[2]), months[parts[1]], parseInt(parts[0]));
        return pDate >= from && pDate <= to;
      });
    } else if (filters.dateRange === 'Single Date' && filters.singleDate) {
      const targetDatePretty = new Date(filters.singleDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
      filtered = filtered.filter(p => p.admitted && p.admitted.includes(targetDatePretty));
    } else if (filters.dateRange === 'Yesterday') {
      filtered = filtered.filter(p => p.admitted && (p.admitted.includes('27 Jun 2026') || p.admitted.includes(new Date(Date.now() - 86400000).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }))));
    } else if (filters.dateRange === 'Today') {
      filtered = filtered.filter(p => p.admitted && (p.admitted.includes('28 Jun 2026') || p.admitted.includes(new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }))));
    } else if (filters.dateRange === 'Last 7 Days') {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - 7);
      filtered = filtered.filter(p => {
        if (!p.admitted) return false;
        const parts = p.admitted.split(' · ')[0].split(' ');
        const months = { 'Jan':0, 'Feb':1, 'Mar':2, 'Apr':3, 'May':4, 'Jun':5, 'Jul':6, 'Aug':7, 'Sep':8, 'Oct':9, 'Nov':10, 'Dec':11 };
        const pDate = new Date(parseInt(parts[2]), months[parts[1]], parseInt(parts[0]));
        return pDate >= cutoff;
      });
    } else if (filters.dateRange === 'This Month') {
      const cutoff = new Date();
      cutoff.setDate(1);
      filtered = filtered.filter(p => {
        if (!p.admitted) return false;
        const parts = p.admitted.split(' · ')[0].split(' ');
        const months = { 'Jan':0, 'Feb':1, 'Mar':2, 'Apr':3, 'May':4, 'Jun':5, 'Jul':6, 'Aug':7, 'Sep':8, 'Oct':9, 'Nov':10, 'Dec':11 };
        const pDate = new Date(parseInt(parts[2]), months[parts[1]], parseInt(parts[0]));
        return pDate >= cutoff;
      });
    }

    // Search Query
    if (query.trim().length >= 2) {
      const q = query.toLowerCase().trim();
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(q) ||
        p.uhid.toLowerCase().includes(q) ||
        (p.mobile && p.mobile.includes(q)) ||
        (p.bed && p.bed.toLowerCase().includes(q))
      );
    }

    // Sort — Default: active OPD/IPD/Daycare on top (most recent first), discharged/completed after
    const parseAdmitted = (s) => {
      if (!s) return 0;
      try {
        const clean = s.replace(' · ', ' ').replace(/\./g, ':');
        return new Date(clean).getTime() || 0;
      } catch(e) { return 0; }
    };

    const sortByAdmittedDesc = (a, b) => parseAdmitted(b.admitted) - parseAdmitted(a.admitted);

    // Active = OPD/IPD/Daycare with no completed discharge and OPD not in done state
    const ACTIVE_STATUSES_OPD = ['Checked In', 'Registered', 'In Consultation', 'Waiting', 'Called'];
    const isActivePatient = (p) => {
      if (p.status === 'Discharged' || p.dischargeStatus === 'Completed') return false;
      if (p.type === 'OPD') return ACTIVE_STATUSES_OPD.includes(p.status);
      if (p.type === 'IPD' || p.type === 'Daycare') return true;
      return false;
    };
    // Priority order within active: OPD first, then IPD, then Daycare
    const typeOrder = { 'OPD': 0, 'IPD': 1, 'Daycare': 2 };
    const getTypePriority = (p) => (typeOrder[p.type] !== undefined ? typeOrder[p.type] : 99);

    if (sort === 'Admission Time ↓' || !sort) {
      filtered.sort((a, b) => {
        const aActive = isActivePatient(a);
        const bActive = isActivePatient(b);
        // Active patients come before inactive
        if (aActive !== bActive) return aActive ? -1 : 1;
        // Both active: sort by type priority (OPD→IPD→Daycare), then most recent first
        if (aActive && bActive) {
          const tDiff = getTypePriority(a) - getTypePriority(b);
          if (tDiff !== 0) return tDiff;
        }
        // Within same group: most recently admitted first
        return parseAdmitted(b.admitted) - parseAdmitted(a.admitted);
      });
    } else if (sort === 'Name A–Z') {
      filtered.sort((a,b) => a.name.localeCompare(b.name));
    } else if (sort === 'UHID') {
      // UHID descending = most recently registered first (higher number = newer)
      filtered.sort((a,b) => b.uhid.localeCompare(a.uhid));
    } else if (sort === 'Criticality') {
      const criticalOrder = { 'Critical': 3, 'In Triage': 3, 'Post-Op': 2, 'Admitted': 1, 'In Consultation': 1, 'Discharge Pending': 2, 'Discharged': -1 };
      filtered.sort((a,b) => (criticalOrder[b.status] || 0) - (criticalOrder[a.status] || 0));
    } else if (sort === 'Discharge Time') {
      filtered.sort(sortByAdmittedDesc);
    } else {
      // Fallback: always recent first
      filtered.sort(sortByAdmittedDesc);
    }

    // Render Stats Cards Row
    const statsHtml = `
      <div class="pr-stats-row">
        <div class="pr-stat-card ${activeTab === 'All' ? 'active' : ''}" style="--accent-color: var(--blue); --accent-light: var(--blue-light);" onclick="window.prSelectTab('All')">
          <span class="pr-stat-val">${countTotal}</span>
          <span class="pr-stat-label">Total Patients Today</span>
        </div>
        <div class="pr-stat-card ${activeTab === 'IPD' ? 'active' : ''}" style="--accent-color: var(--purple); --accent-light: var(--purple-light);" onclick="window.prSelectTab('IPD')">
          <span class="pr-stat-val">${countIpdActive}</span>
          <span class="pr-stat-label">IPD Active</span>
        </div>
        <div class="pr-stat-card ${activeTab === 'OPD' ? 'active' : ''}" style="--accent-color: var(--blue); --accent-light: var(--blue-light);" onclick="window.prSelectTab('OPD')">
          <span class="pr-stat-val">${countOpdToday}</span>
          <span class="pr-stat-label">OPD Today</span>
        </div>
        <div class="pr-stat-card ${activeTab === 'Emergency' ? 'active' : ''} ${countEmergencyActive === 0 ? 'pr-stat-dimmed' : ''}" style="--accent-color: var(--red); --accent-light: var(--red-light);" onclick="window.prSelectTab('Emergency')">
          <span class="pr-stat-val" style="color: ${countEmergencyActive === 0 ? 'var(--text3)' : 'var(--red)'};">${countEmergencyActive}</span>
          <span class="pr-stat-label">Emergency</span>
        </div>
        <div class="pr-stat-card ${activeTab === 'Daycare' ? 'active' : ''}" style="--accent-color: var(--cyan); --accent-light: var(--cyan-light);" onclick="window.prSelectTab('Daycare')">
          <span class="pr-stat-val" style="color: #0891b2;">${countDaycareActive}</span>
          <span class="pr-stat-label">Daycare</span>
        </div>
        <div class="pr-stat-card ${activeTab === 'Discharged Today' ? 'active' : ''}" style="--accent-color: var(--green); --accent-light: var(--green-light);" onclick="window.prSelectTab('Discharged Today')">
          <span class="pr-stat-val" style="color: var(--green);">${countDischargedToday}</span>
          <span class="pr-stat-label">Discharged Today</span>
        </div>
        <div class="pr-stat-card ${activeTab === 'Critical' ? 'active' : ''} ${countCritical === 0 ? 'pr-stat-dimmed' : ''}" style="--accent-color: var(--red); --accent-light: var(--red-light);" onclick="window.prSelectTab('Critical')">
          <span class="pr-stat-val" style="color: ${countCritical === 0 ? 'var(--text3)' : 'var(--red)'};">${countCritical}</span>
          <span class="pr-stat-label">Critical</span>
        </div>
        <div class="pr-stat-card ${activeTab === 'MLC' ? 'active' : ''}" style="--accent-color: var(--amber); --accent-light: var(--amber-light);" onclick="window.prSelectTab('MLC')">
          <span class="pr-stat-val" style="color: var(--amber);">${countMlcActive}</span>
          <span class="pr-stat-label">MLC Active</span>
        </div>
        <div class="pr-stat-card ${activeTab === 'Discharge Pending' ? 'active' : ''} ${countDischargePending === 0 ? 'pr-stat-dimmed' : ''}" style="--accent-color: var(--amber); --accent-light: var(--amber-light);" onclick="window.prSelectTab('Discharge Pending')">
          <span class="pr-stat-val" style="color: ${countDischargePending === 0 ? 'var(--text3)' : 'var(--amber)'};">${countDischargePending}</span>
          <span class="pr-stat-label">Discharge Pending</span>
        </div>
      </div>
    `;

    // Render Tabs
    const tabsHtml = `
      <div class="pr-tabs-strip">
        <div class="pr-tab ${activeTab === 'All' ? 'active' : ''}" onclick="window.prSelectTab('All')">All (${countTotal})</div>
        <div class="pr-tab ${activeTab === 'IPD' ? 'active' : ''} ${countIpdActive === 0 ? 'dimmed' : ''}" onclick="window.prSelectTab('IPD')">IPD (${countIpdActive})</div>
        <div class="pr-tab ${activeTab === 'OPD' ? 'active' : ''} ${countOpdToday === 0 ? 'dimmed' : ''}" onclick="window.prSelectTab('OPD')">OPD (${countOpdToday})</div>
        <div class="pr-tab ${activeTab === 'Emergency' ? 'active' : ''} ${countEmergencyActive === 0 ? 'dimmed' : ''}" onclick="window.prSelectTab('Emergency')">Emergency (${countEmergencyActive})</div>
        <div class="pr-tab ${activeTab === 'Daycare' ? 'active' : ''} ${countDaycareActive === 0 ? 'dimmed' : ''}" onclick="window.prSelectTab('Daycare')">Daycare (${countDaycareActive})</div>
        <div class="pr-tab ${activeTab === 'Discharged Today' ? 'active' : ''} ${countDischargedToday === 0 ? 'dimmed' : ''}" onclick="window.prSelectTab('Discharged Today')">Discharged Today (${countDischargedToday})</div>
        <div class="pr-tab ${activeTab === 'Critical' ? 'active' : ''} ${countCritical === 0 ? 'dimmed' : ''}" onclick="window.prSelectTab('Critical')"><span class="pr-dot-red">🔴</span> Critical (${countCritical})</div>
        <div class="pr-tab ${activeTab === 'MLC' ? 'active' : ''} ${countMlcActive === 0 ? 'dimmed' : ''}" onclick="window.prSelectTab('MLC')"><span class="pr-dot-amber">🟡</span> MLC (${countMlcActive})</div>
        <div class="pr-tab ${activeTab === 'Discharge Pending' ? 'active' : ''} ${countDischargePending === 0 ? 'dimmed' : ''}" onclick="window.prSelectTab('Discharge Pending')">Discharge Pending (${countDischargePending})</div>
      </div>
    `;

    const filtersActive = filters.dept !== 'All' || filters.doctor !== 'All' || filters.ward !== 'All' || filters.payer !== 'All' || (filters.service && filters.service !== 'All') || filters.dateRange !== 'All Patients' || query.trim().length >= 2;

    const depts = ["All Departments", "General Medicine", "Orthopaedics", "Psychiatry", "Cardiology", "Neurology", "Paediatrics", "Gynaecology", "Surgery", "ENT", "Dermatology", "ICU"];
    const doctors = ["All Doctors", "Dr. Srinivasan", "Dr. Mehta", "Dr. Krishnamurthy", "Dr. Anand", "Dr. Fatima Sheikh", "Dr. Ramesh Iyer", "Dr. Priya Nair"];
    const wardsList = ["All Wards", "General Ward", "Semi-Private", "Private", "ICU", "HDU", "Daycare Bay", "Emergency Bay"];
    const payersList = ["All Payers", "Self Pay", "Star Health", "HDFC ERGO", "New India Assurance", "United India", "ECHS", "CGHS", "PMJAY", "ESI", "Corporate"];
    const dateRanges = ["All Patients", "Today", "Yesterday", "Single Date", "Custom Range", "Last 7 Days", "This Month"];
    const servicesList = ["All Services", "OPD Consultation", "IPD Admission", "Daycare Procedure", "Emergency Admission"];

    const dropdownsHtml = `
      <div class="pr-filters-row">
        <select class="pr-filter-select ${filters.dept !== 'All' ? 'active' : ''}" onchange="window.prSetFilter('dept', this.value)">
          ${depts.map(d => `<option value="${d === 'All Departments' ? 'All' : d}" ${filters.dept === (d === 'All Departments' ? 'All' : d) ? 'selected' : ''}>${d}</option>`).join('')}
        </select>
        <select class="pr-filter-select ${filters.doctor !== 'All' ? 'active' : ''}" onchange="window.prSetFilter('doctor', this.value)">
          ${doctors.map(d => `<option value="${d === 'All Doctors' ? 'All' : d}" ${filters.doctor === (d === 'All Doctors' ? 'All' : d) ? 'selected' : ''}>${d}</option>`).join('')}
        </select>
        <select class="pr-filter-select ${filters.ward !== 'All' ? 'active' : ''}" onchange="window.prSetFilter('ward', this.value)">
          ${wardsList.map(w => `<option value="${w === 'All Wards' ? 'All' : w}" ${filters.ward === (w === 'All Wards' ? 'All' : w) ? 'selected' : ''}>${w}</option>`).join('')}
        </select>
        <select class="pr-filter-select ${filters.payer !== 'All' ? 'active' : ''}" onchange="window.prSetFilter('payer', this.value)">
          ${payersList.map(p => `<option value="${p === 'All Payers' ? 'All' : p}" ${filters.payer === (p === 'All Payers' ? 'All' : p) ? 'selected' : ''}>${p}</option>`).join('')}
        </select>
        <select class="pr-filter-select ${filters.service && filters.service !== 'All' ? 'active' : ''}" onchange="window.prSetFilter('service', this.value)">
          ${servicesList.map(s => `<option value="${s === 'All Services' ? 'All' : s}" ${filters.service === (s === 'All Services' ? 'All' : s) ? 'selected' : ''}>${s}</option>`).join('')}
        </select>
        <select class="pr-filter-select ${filters.dateRange !== 'All Patients' ? 'active' : ''}" onchange="window.prSetFilter('dateRange', this.value)">
          ${dateRanges.map(dr => `<option value="${dr}" ${filters.dateRange === dr ? 'selected' : ''}>${dr}</option>`).join('')}
        </select>

        ${filters.dateRange === 'Single Date' ? `
          <div style="display:inline-flex; align-items:center; gap:4px; font-size:12px;">
            <input type="date" class="pr-filter-select" style="height:32px;" value="${filters.singleDate || ''}" onchange="window.prSetFilter('singleDate', this.value)">
          </div>
        ` : ''}

        ${filters.dateRange === 'Custom Range' ? `
          <div style="display:inline-flex; align-items:center; gap:4px; font-size:12px;">
            <input type="date" class="pr-filter-select" style="height:32px;" value="${filters.fromDate || ''}" onchange="window.prSetFilter('fromDate', this.value)">
            <span style="color:var(--text3);">to</span>
            <input type="date" class="pr-filter-select" style="height:32px;" value="${filters.toDate || ''}" onchange="window.prSetFilter('toDate', this.value)">
          </div>
        ` : ''}

        ${filtersActive ? `
          <span class="pr-clear-link" onclick="window.prClearAllFilters()">Clear Filters</span>
        ` : ''}
      </div>
    `;

    let tableBodyHtml = '';
    if (filtered.length === 0) {
      tableBodyHtml = `
        <tr>
          <td colspan="9" style="padding:0;">
            <div class="pr-empty-state">
              <span style="font-size:32px;">🔍</span>
              <strong style="font-size:14px; color:var(--text);">No patients match your filters</strong>
              <span style="color:var(--text2);">Try clearing filters or searching by a different term</span>
              <button class="pr-btn-add" style="margin-top:4px;" onclick="window.prClearAllFilters()">Clear Filters</button>
            </div>
          </td>
        </tr>
      `;
    } else {
      tableBodyHtml = filtered.map((p, idx) => {
        const initials = p.name.split(' ').map(n=>n[0]).join('').substring(0,2).toUpperCase();
        
        let tBadge = '';
        const isDischarged = p.status === 'Discharged' || p.dischargeStatus === 'Completed';
        const isOpdCompleted = p.type === 'OPD' && !['Checked In', 'Registered', 'In Consultation', 'Waiting', 'Called'].includes(p.status);
        if (isDischarged || isOpdCompleted) {
          tBadge = '';
        } else {
          if (p.type === 'IPD') tBadge = '<span class="pr-badge badge-ipd">IPD</span>';
          else if (p.type === 'OPD') tBadge = '<span class="pr-badge badge-opd">OPD</span>';
          else if (p.type === 'Emergency') tBadge = '<span class="pr-badge badge-emergency">Emergency</span>';
          else if (p.type === 'Daycare') tBadge = '<span class="pr-badge badge-daycare">Daycare</span>';
        }

        let sClass = '';
        if (p.status === 'Admitted') sClass = 'status-admitted';
        else if (p.status === 'In Consultation') sClass = 'status-consultation';
        else if (p.status === 'Under Observation') sClass = 'status-observation';
        else if (p.status === 'Pre-Op') sClass = 'status-preop';
        else if (p.status === 'Post-Op') sClass = 'status-postop';
        else if (p.status === 'Discharged') sClass = 'status-discharged';
        else if (p.status === 'Discharge Pending') sClass = 'status-pending';
        else if (p.status === 'Critical') sClass = 'status-critical';
        else if (p.status === 'LAMA') sClass = 'status-lama';

        const flagHtml = (p.flags || []).map(f => {
          if (f === 'Critical') return '<span class="flag-pill flag-critical">🔴 Critical</span>';
          if (f === 'MLC') return '<span class="flag-pill flag-mlc">⚖️ MLC</span>';
          if (f === 'DNR') return '<span class="flag-pill flag-dnr">DNR</span>';
          if (f === 'LAMA') return '<span class="flag-pill flag-lama">LAMA</span>';
          return '';
        }).join(' ');

        return `
          <tr onclick="window.prOpenRecord('${p.uhid}', '${p.name}')">
            <td>
              <div style="display:flex; align-items:center; gap:10px;">
                <div class="pr-avatar">${initials}</div>
                <div>
                  <div style="font-weight:600; color:var(--text);">${p.name}</div>
                  <div class="mono" style="font-size:11px; color:var(--text3);">${p.uhid}</div>
                </div>
              </div>
            </td>
            <td>${tBadge}</td>
            <td>
              <div style="font-weight:500; color:var(--text);">${p.department}</div>
              <div style="font-size:11px; color:var(--text3);">${p.primaryConsultant}</div>
            </td>
            <td>
              <div style="font-weight:500; color:var(--text);">${p.ward}</div>
              <div class="mono" style="font-size:11px; color:var(--text3);">${p.bed}</div>
            </td>
            <td style="font-weight:500; color:var(--text2);">${p.payer}</td>
            <td><span class="pr-badge ${sClass}">${p.status}</span></td>
            <td class="mono" style="font-size:11px; color:var(--text2);">${p.admitted || '—'}</td>
            <td>${flagHtml || '—'}</td>
            <td onclick="event.stopPropagation()">
              <div style="display:flex; align-items:center; gap:4px; position:relative;">
                <button class="btn-view" onclick="window.prOpenRecord('${p.uhid}', '${p.name}')">View &rarr;</button>
                <button class="kebab-trigger" onclick="window.prToggleKebab(event, ${idx})">⋮</button>
                <div id="kebab-menu-${idx}" class="kebab-menu" style="display:none; top: 26px;">
                  <button class="kebab-item" onclick="window.prKebabAction('${p.uhid}', '${p.name}', 'View Record')">View Record</button>
                  <button class="kebab-item" onclick="window.prKebabAction('${p.uhid}', '${p.name}', 'Edit Details')">Edit Details</button>
                  <button class="kebab-item" onclick="window.prKebabAction('${p.uhid}', '${p.name}', 'Print Summary')">Print Summary</button>
                  ${p.type === 'OPD' ? '' : `
                    <button class="kebab-item" onclick="window.prKebabAction('${p.uhid}', '${p.name}', 'Transfer')">Transfer</button>
                    <button class="kebab-item" onclick="window.prKebabAction('${p.uhid}', '${p.name}', 'Initiate Discharge')">Initiate Discharge</button>
                  `}
                </div>
              </div>
            </td>
          </tr>
        `;
      }).join('');
    }

    let dropdownHtml = '';
    if (query.trim().length >= 2) {
      const q = query.toLowerCase().trim();
      const matches = data.filter(p => 
        p.name.toLowerCase().includes(q) ||
        p.uhid.toLowerCase().includes(q) ||
        (p.mobile && p.mobile.includes(q)) ||
        (p.bed && p.bed.toLowerCase().includes(q))
      ).slice(0, 6);

      if (matches.length > 0) {
        dropdownHtml = `
          <div class="pr-search-dropdown">
            ${matches.map(m => {
              const initials = m.name.split(' ').map(n=>n[0]).join('').substring(0,2).toUpperCase();
              return `
                <div class="pr-search-result-row" onclick="window.prSelectDropdownRow('${m.uhid}', '${m.name}')">
                  <div style="display:flex; align-items:center; gap:8px;">
                    <div class="pr-avatar">${initials}</div>
                    <div>
                      <strong style="color:var(--text);">${m.name}</strong>
                      <div style="font-size:11px; color:var(--text2);">${m.type} &bull; ${m.ward} &bull; ${m.bed} &bull; ${m.primaryConsultant}</div>
                    </div>
                  </div>
                  <span class="mono" style="font-size:11px; color:var(--text3); font-weight:500;">${m.uhid}</span>
                </div>
              `;
            }).join('')}
            <div class="pr-dropdown-view-all" onclick="window.prCloseSearchDropdown()">View all results</div>
          </div>
        `;
      }
    }

    container.innerHTML = `
      ${workspaceStyles}
      <div class="pr-wrap">
        <!-- Summary Dashboard row -->
        ${statsHtml}

        <!-- Filter Tabs -->
        ${tabsHtml}

        <!-- Search + Action Row -->
        <div class="pr-search-row">
          <div class="pr-search-wrapper">
            <span class="pr-search-icon">🔍</span>
            <input type="text" class="pr-search-input" id="pr-search" placeholder="Search by name, UHID, mobile, IP/OP number..." value="${query}" autocomplete="off" oninput="window.prHandleSearch(this.value)">
            ${query ? `<span class="pr-search-clear" onclick="window.prClearSearch()">×</span>` : ''}
            ${dropdownHtml}
          </div>
          <button class="pr-btn-add" onclick="window.prAddPatient()">+ Add New Patient</button>
        </div>

        <!-- Secondary Filters Row -->
        ${dropdownsHtml}

        <!-- Results bar -->
        <div class="pr-results-bar">
          <span>Showing ${filtered.length} patients</span>
          <div style="display:flex; align-items:center; gap:6px;">
            <span>Sort:</span>
            <select class="pr-filter-select" style="height:28px; padding:0 4px; font-size:12px;" onchange="window.prSetSort(this.value)">
              ${['Admission Time ↓', 'Name A–Z', 'UHID', 'Criticality', 'Discharge Time'].map(s => `<option value="${s}" ${sort === s ? 'selected' : ''}>${s}</option>`).join('')}
            </select>
          </div>
        </div>

        <!-- Patient Table -->
        <div class="pr-table-container">
          <table class="pr-table">
            <colgroup>
              <col style="width: 220px;">
              <col style="width: 80px;">
              <col style="width: 160px;">
              <col style="width: 100px;">
              <col style="width: 120px;">
              <col style="width: 110px;">
              <col style="width: 100px;">
              <col style="width: 80px;">
              <col style="width: 80px;">
            </colgroup>
            <thead>
              <tr>
                <th>Patient</th>
                <th>Type</th>
                <th>Dept / Doctor</th>
                <th>Ward / Bed</th>
                <th>Payer</th>
                <th>Status</th>
                <th>Admitted</th>
                <th>Flags</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              ${tableBodyHtml}
            </tbody>
          </table>
        </div>
      </div>
    `;

    // Keyboard handling inside search input
    const searchEl = document.getElementById('pr-search');
    if (searchEl) {
      searchEl.addEventListener('keydown', function(e) {
        const rows = document.querySelectorAll('.pr-search-result-row');
        if (rows.length === 0) return;
        
        let activeIndex = -1;
        rows.forEach((r, i) => {
          if (r.classList.contains('selected')) activeIndex = i;
        });

        if (e.key === 'ArrowDown') {
          e.preventDefault();
          const nextIndex = (activeIndex + 1) % rows.length;
          rows.forEach(r => r.classList.remove('selected'));
          rows[nextIndex].classList.add('selected');
          rows[nextIndex].scrollIntoView({ block: 'nearest' });
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          const prevIndex = (activeIndex - 1 + rows.length) % rows.length;
          rows.forEach(r => r.classList.remove('selected'));
          rows[prevIndex].classList.add('selected');
          rows[prevIndex].scrollIntoView({ block: 'nearest' });
        } else if (e.key === 'Enter') {
          e.preventDefault();
          if (activeIndex !== -1) {
            const row = rows[activeIndex];
            // Extract click handler trigger
            row.click();
          }
        } else if (e.key === 'Escape') {
          window.prCloseSearchDropdown();
        }
      });
    }
  }

  // Bind actions
  window.prSelectTab = function(tabName) {
    window.activePatientsTab = tabName;
    draw();
  };

  window.prSetFilter = function(filterName, value) {
    window.patientsFilters[filterName] = value;
    draw();
  };

  window.prClearAllFilters = function() {
    window.patientsFilters = { dept: 'All', doctor: 'All', ward: 'All', payer: 'All', service: 'All', dateRange: 'All Patients', fromDate: '', toDate: '', singleDate: '' };
    window.activePatientsTab = 'All';
    window.patientsSearchQuery = '';
    draw();
  };

  window.prSetSort = function(value) {
    window.patientsSort = value;
    draw();
  };

  window.prHandleSearch = function(value) {
    window.patientsSearchQuery = value;
    draw();
  };

  window.prClearSearch = function() {
    window.patientsSearchQuery = '';
    draw();
  };

  window.prCloseSearchDropdown = function() {
    window.patientsSearchQuery = '';
    draw();
  };

  window.prSelectDropdownRow = function(uhid, name) {
    window.patientsSearchQuery = '';
    window.prOpenRecord(uhid, name);
  };

  window.prAddPatient = function() {
    window.prShowToast("Opening registration form...");
    setTimeout(() => {
      window.router.navigate('registration?action=new');
    }, 400);
  };

  window.prOpenRecord = function(uhid, name) {
    window.prShowToast(`Opening patient record: ${name}...`);
    setTimeout(() => {
      window.router.navigate(`patients?uhid=${uhid}`);
    }, 400);
  };

  window.prToggleKebab = function(e, idx) {
    e.stopPropagation();
    document.querySelectorAll('.kebab-menu').forEach(menu => {
      if (menu.id !== `kebab-menu-${idx}`) {
        menu.style.display = 'none';
      }
    });
    const el = document.getElementById(`kebab-menu-${idx}`);
    if (el) {
      el.style.display = el.style.display === 'none' ? 'flex' : 'none';
    }
  };

  window.prKebabAction = function(uhid, name, action) {
    var pat = window.state.patients.find(p => p.uhid === uhid);
    var isOpd = pat && pat.type === 'OPD';

    if (action === 'View Record') {
      window.prOpenRecord(uhid, name);
    } else if (action === 'Transfer') {
      if (isOpd) {
        alert("⚠️ OPD Patient cannot have bed transfer option. Admit patient to a ward or daycare bed first.");
        return;
      }
      window.showUniversalTransferWorkflow(uhid);
    } else if (action === 'Initiate Discharge') {
      if (isOpd) {
        alert("⚠️ OPD Patient cannot have discharge options. Admitted IPD/daycare patients only.");
        return;
      }
      window.showUniversalDischargeWorkflow(uhid);
    } else {
      window.prShowToast(`${action} for ${name}...`);
    }
    document.querySelectorAll('.kebab-menu').forEach(menu => {
      menu.style.display = 'none';
    });
  };

  window.prShowToast = function(message) {
    const old = document.getElementById('pr-toast-notification');
    if (old) old.remove();

    const toast = document.createElement('div');
    toast.id = 'pr-toast-notification';
    toast.className = 'pr-toast';
    toast.innerHTML = `<span>🔔</span> <span>${message}</span>`;
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transition = 'opacity 0.25s';
      setTimeout(() => toast.remove(), 250);
    }, 2800);
  };

  // Close kebabs on click outside
  document.addEventListener('click', function() {
    document.querySelectorAll('.kebab-menu').forEach(menu => {
      menu.style.display = 'none';
    });
  });

  draw();
}
function renderPatient360Profile(container, patient, activeTab, activeVisit) {
  if (!patient) {
    container.innerHTML = `<div class="card"><div class="card-body"><h4>Patient profile not found.</h4></div></div>`;
    return;
  }

  // Determine role based on central header persona dropdown
  function getCurrentPatient360Role() {
    const globalRole = (window.state && window.state.activeUserRole) || 'Doctor';
    if (globalRole === 'Nurse') return 'Nurse';
    if (globalRole === 'Billing' || globalRole === 'CFO' || ['CASHIER', 'BILLING_EXECUTIVE', 'BILLING_SUPERVISOR', 'MRD_COORDINATOR', 'ACCOUNTS_MANAGER'].includes(globalRole)) return 'Billing';
    if (globalRole === 'Pharmacist') return 'Pharmacy';
    if (globalRole === 'Front Desk') return 'Front Desk';
    if (globalRole === 'ATD Officer') return 'Admission';
    return 'Doctor';
  }

  const mappedRole = getCurrentPatient360Role();
  if (window.patient360Role !== mappedRole) {
    window.patient360Role = mappedRole;
    window.patient360ActiveTab = 'Summary & Timeline';
  }

  if (activeTab && activeTab !== '') {
    window.patient360ActiveTab = activeTab;
  }

  // ── PATIENT-SPECIFIC STATE SYNCHRONIZATION ──
  const nowFor360 = new Date();
  const dateStrToday = nowFor360.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

  if (window.patient360CurrentUhid !== patient.uhid) {
    window.patient360CurrentUhid = patient.uhid;
    
    // Reset transient modal inputs
    window.p360ActiveModal = null;
    window.p360SelectedLabs = [];
    window.p360SelectedRadiology = [];
    window.p360SelectedMeds = [];
    window.labSearchQuery = "";
    window.radSearchQuery = "";
    window.medSearchQuery = "";
    window.prescribeSearchQuery = "";
    window.prescribeSelectedDrug = null;
    window.soapSubjective = "";
    window.soapObjectiveExam = "";
    window.soapAssessmentImpression = "";
    window.soapPlanDetails = "";
    
    // Initialize or load patient specific arrays
    if (!patient.patient360Vitals) {
      const baseVitals = patient.vitals || { bp: "120/80", hr: 72, temp: 98.4, spo2: 98, weight: 70, bmi: 22.8, pain: 0, rr: 16 };
      patient.patient360Vitals = [
        {
          d: dateStrToday,
          t: "09:30 AM",
          bp: baseVitals.bp || "120/80",
          hr: baseVitals.hr || 72,
          rr: baseVitals.rr || 16,
          temp: baseVitals.temp ? (baseVitals.temp.toString().includes('°F') ? baseVitals.temp : `${baseVitals.temp}°F`) : "98.4°F",
          spo2: baseVitals.spo2 ? (baseVitals.spo2.toString().includes('%') ? baseVitals.spo2 : `${baseVitals.spo2}%`) : "98%",
          wt: baseVitals.weight ? `${baseVitals.weight} kg` : "60 kg",
          by: "Staff Nurse Mary",
          news: patient.newsScore || 0
        }
      ];
    }
    
    if (!patient.patient360Meds) {
      if (patient.prescriptions && patient.prescriptions.length > 0) {
        patient.patient360Meds = patient.prescriptions.map(r => ({
          drug: r.name,
          route: r.route || "Oral",
          freq: r.dose ? `${r.dose} ${r.freq}` : r.freq || "Once daily",
          dur: r.duration || "5 days",
          status: r.active ? "Active" : "PRN",
          author: `Dr. ${patient.primaryConsultant || 'Priya Nair'}`
        }));
      } else {
        patient.patient360Meds = [
          { drug: "Tab Pantoprazole 40mg", route: "Oral", freq: "Once daily", dur: "5 days", status: "Active", author: "Dr. Priya Nair" }
        ];
      }
    }
    
    if (!patient.patient360Notes) {
      patient.patient360Notes = [
        {
          type: "PROGRESS NOTE",
          author: `Dr. ${patient.primaryConsultant || 'Ramesh Kumar'}`,
          dept: patient.department || "Cardiology",
          time: dateStrToday + " · 10:15 AM",
          s: patient.clinicalData?.complaint || "Patient presented for follow-up.",
          o: `BP ${patient.vitals?.bp || '120/80'}. Stable.`,
          a: patient.clinicalData?.diagnosis || "Under evaluation."
        }
      ];
    }
    
    if (!patient.patient360Diagnoses) {
      patient.patient360Diagnoses = patient.icdCode ? [patient.icdCode + " " + (patient.clinicalData?.diagnosis || "Evaluation")] : ["D64.9 Anaemia, unspecified"];
    }
    
    if (!patient.patient360DischargeClearances) {
      patient.patient360DischargeClearances = {
        doctorOrder: false,
        nursingClearance: false,
        pharmacyClearance: false,
        billingClearance: false,
        finalBillGenerated: false
      };
    }
    
    // Re-link window globals to patient variables
    window.patient360Vitals = patient.patient360Vitals;
    window.patient360Meds = patient.patient360Meds;
    window.patient360Notes = patient.patient360Notes;
    window.patient360Diagnoses = patient.patient360Diagnoses;
    window.patient360DischargeClearances = patient.patient360DischargeClearances;
  }
  
  if (window.patient360ActiveTab === undefined) {
    window.patient360ActiveTab = 'Summary & Timeline';
  }
  if (window.patient360CriticalAcked === undefined) {
    window.patient360CriticalAcked = false;
  }
  if (window.p360ActiveModal === undefined) {
    window.p360ActiveModal = null;
  }
  if (window.p360SelectedLabs === undefined) {
    window.p360SelectedLabs = [];
  }
  if (window.p360SelectedRadiology === undefined) {
    window.p360SelectedRadiology = [];
  }
  if (window.p360SelectedMeds === undefined) {
    window.p360SelectedMeds = [];
  }
  if (window.labSearchQuery === undefined) {
    window.labSearchQuery = "";
  }
  if (window.radSearchQuery === undefined) {
    window.radSearchQuery = "";
  }
  if (window.medSearchQuery === undefined) {
    window.medSearchQuery = "";
  }

  // Production-ready Laboratory test catalog (30 items)
  if (window.patient360LabCatalog === undefined) {
    window.patient360LabCatalog = [
      { name: "Complete Blood Count (CBC)", type: "Panel", sample: "Whole Blood EDTA", price: 450 },
      { name: "Liver Function Test (LFT)", type: "Panel", sample: "Serum", price: 950 },
      { name: "Renal Function Test (RFT)", type: "Panel", sample: "Serum", price: 850 },
      { name: "Thyroid Profile (T3, T4, TSH)", type: "Panel", sample: "Serum", price: 1200 },
      { name: "Lipid Profile", type: "Panel", sample: "Serum", price: 1000 },
      { name: "HbA1c", type: "Test", sample: "Whole Blood EDTA", price: 600 },
      { name: "Urine Routine & Microscopy", type: "Test", sample: "Urine Spot", price: 250 },
      { name: "Blood Culture & Sensitivity", type: "Test", sample: "Whole Blood Culture", price: 1500 },
      { name: "Dengue Serology (NS1, IgG, IgM)", type: "Panel", sample: "Serum", price: 1100 },
      { name: "Vitamin D (25-Hydroxy)", type: "Test", sample: "Serum", price: 1600 },
      { name: "Serum Electrolytes (Na, K, Cl)", type: "Panel", sample: "Serum", price: 650 },
      { name: "Serum Ferritin", type: "Test", sample: "Serum", price: 900 },
      { name: "Vitamin B12", type: "Test", sample: "Serum", price: 1200 },
      { name: "Fasting Blood Sugar (FBS)", type: "Test", sample: "Fluoride Blood", price: 150 },
      { name: "Post Prandial Blood Sugar (PPBS)", type: "Test", sample: "Fluoride Blood", price: 150 },
      { name: "Random Blood Sugar (RBS)", type: "Test", sample: "Fluoride Blood", price: 150 },
      { name: "Uric Acid", type: "Test", sample: "Serum", price: 300 },
      { name: "Serum Calcium", type: "Test", sample: "Serum", price: 350 },
      { name: "Cardiac Enzymes (Troponin T)", type: "Panel", sample: "Serum", price: 2000 },
      { name: "C-Reactive Protein (CRP)", type: "Test", sample: "Serum", price: 600 },
      { name: "Erythrocyte Sedimentation Rate (ESR)", type: "Test", sample: "Whole Blood EDTA", price: 200 },
      { name: "Coagulation Profile (PT/INR)", type: "Panel", sample: "Plasma Citrate", price: 800 },
      { name: "Amylase & Lipase", type: "Panel", sample: "Serum", price: 1200 },
      { name: "Rheumatoid Factor (RF)", type: "Test", sample: "Serum", price: 700 },
      { name: "Widal Test", type: "Test", sample: "Serum", price: 400 },
      { name: "Hepatitis B Surface Antigen (HBsAg)", type: "Test", sample: "Serum", price: 500 },
      { name: "HIV 1 & 2 Antibody", type: "Test", sample: "Serum", price: 600 },
      { name: "Urine Culture & Sensitivity", type: "Test", sample: "Urine Clean Catch", price: 950 },
      { name: "Stool Routine Examination", type: "Test", sample: "Stool Spot", price: 250 },
      { name: "Arterial Blood Gas (ABG)", type: "Panel", sample: "Heparinized Blood", price: 1200 }
    ];
  }

  // Production-ready Radiology test catalog (20 items)
  if (window.patient360RadiologyCatalog === undefined) {
    window.patient360RadiologyCatalog = [
      { name: "Chest X-Ray PA View", type: "X-Ray", modality: "CR", price: 400 },
      { name: "MRI Brain Contrast", type: "MRI", modality: "MR", price: 7500 },
      { name: "CT Abdomen & Pelvis", type: "CT", modality: "CT", price: 6500 },
      { name: "USG Whole Abdomen", type: "Ultrasound", modality: "US", price: 1500 },
      { name: "X-Ray Knee AP/LAT", type: "X-Ray", modality: "CR", price: 500 },
      { name: "MRI Lumbar Spine", type: "MRI", modality: "MR", price: 6000 },
      { name: "CT Chest HRCT", type: "CT", modality: "CT", price: 5500 },
      { name: "USG Pelvis (Gynec)", type: "Ultrasound", modality: "US", price: 1200 },
      { name: "USG Obstetric (Anomalies)", type: "Ultrasound", modality: "US", price: 2200 },
      { name: "X-Ray Spine AP/LAT", type: "X-Ray", modality: "CR", price: 600 },
      { name: "CT Brain Plain", type: "CT", modality: "CT", price: 2500 },
      { name: "Mammography Bilateral", type: "Mammography", modality: "MG", price: 2000 },
      { name: "HRCT Temporal Bone", type: "CT", modality: "CT", price: 4000 },
      { name: "MRI Cervical Spine", type: "MRI", modality: "MR", price: 6000 },
      { name: "MRI Shoulder Joint", type: "MRI", modality: "MR", price: 7000 },
      { name: "USG KUB (Kidney, Ureter, Bladder)", type: "Ultrasound", modality: "US", price: 1200 },
      { name: "USG Neck & Thyroid", type: "Ultrasound", modality: "US", price: 1500 },
      { name: "USG Breast Bilateral", type: "Ultrasound", modality: "US", price: 1800 },
      { name: "CT Paranasal Sinuses (PNS)", type: "CT", modality: "CT", price: 3000 },
      { name: "USG Color Doppler Arterial", type: "Doppler", modality: "US", price: 3500 }
    ];
  }

  // Production-ready Medication catalog (50 items)
  if (window.patient360MedicineCatalog === undefined) {
    window.patient360MedicineCatalog = [
      { name: "Tab. Pantoprazole 40mg", type: "Tablet", route: "Oral", stock: true },
      { name: "Tab. Paracetamol 650mg", type: "Tablet", route: "Oral", stock: true },
      { name: "Tab. Amoxicillin 500mg", type: "Tablet", route: "Oral", stock: false, alt: "Tab. Azithromycin 500mg" },
      { name: "Tab. Montelukast 10mg", type: "Tablet", route: "Oral", stock: false, alt: "Tab. Levocetirizine 5mg" },
      { name: "Syp. Cremaffin 150ml", type: "Syrup", route: "Oral", stock: true },
      { name: "Tab. Ferrous Sulphate 200mg", type: "Tablet", route: "Oral", stock: true },
      { name: "Tab. Amlodipine 5mg", type: "Tablet", route: "Oral", stock: true },
      { name: "Tab. Metformin 500mg", type: "Tablet", route: "Oral", stock: true },
      { name: "Tab. Atorvastatin 10mg", type: "Tablet", route: "Oral", stock: true },
      { name: "Tab. Clopidogrel 75mg", type: "Tablet", route: "Oral", stock: true },
      { name: "Tab. Azithromycin 500mg", type: "Tablet", route: "Oral", stock: true },
      { name: "Tab. Levocetirizine 5mg", type: "Tablet", route: "Oral", stock: true },
      { name: "Tab. Telmisartan 40mg", type: "Tablet", route: "Oral", stock: true },
      { name: "Tab. Losartan 50mg", type: "Tablet", route: "Oral", stock: true },
      { name: "Tab. Glimepiride 2mg", type: "Tablet", route: "Oral", stock: true },
      { name: "Tab. Sitagliptin 100mg", type: "Tablet", route: "Oral", stock: true },
      { name: "Tab. Empagliflozin 10mg", type: "Tablet", route: "Oral", stock: true },
      { name: "Tab. Ibuprofen 400mg", type: "Tablet", route: "Oral", stock: true },
      { name: "Tab. Diclofenac 50mg", type: "Tablet", route: "Oral", stock: true },
      { name: "Tab. Tramadol 50mg", type: "Tablet", route: "Oral", stock: true },
      { name: "Tab. Ciprofloxacin 500mg", type: "Tablet", route: "Oral", stock: false, alt: "Tab. Levofloxacin 500mg" },
      { name: "Tab. Levofloxacin 500mg", type: "Tablet", route: "Oral", stock: true },
      { name: "Tab. Cefuroxime 500mg", type: "Tablet", route: "Oral", stock: true },
      { name: "Tab. Amoxiclav 625mg", type: "Tablet", route: "Oral", stock: true },
      { name: "Tab. Doxycycline 100mg", type: "Tablet", route: "Oral", stock: true },
      { name: "Tab. Fluconazole 150mg", type: "Tablet", route: "Oral", stock: true },
      { name: "Tab. Prednisolone 10mg", type: "Tablet", route: "Oral", stock: true },
      { name: "Tab. Deflazacort 6mg", type: "Tablet", route: "Oral", stock: true },
      { name: "Tab. Methylprednisolone 8mg", type: "Tablet", route: "Oral", stock: true },
      { name: "Tab. Domperidone 10mg", type: "Tablet", route: "Oral", stock: true },
      { name: "Tab. Ondansetron 4mg", type: "Tablet", route: "Oral", stock: true },
      { name: "Tab. Metoclopramide 10mg", type: "Tablet", route: "Oral", stock: true },
      { name: "Tab. Gabapentin 300mg", type: "Tablet", route: "Oral", stock: true },
      { name: "Tab. Pregabalin 75mg", type: "Tablet", route: "Oral", stock: true },
      { name: "Tab. Amitriptyline 10mg", type: "Tablet", route: "Oral", stock: true },
      { name: "Tab. Clonazepam 0.5mg", type: "Tablet", route: "Oral", stock: true },
      { name: "Tab. Alprazolam 0.25mg", type: "Tablet", route: "Oral", stock: true },
      { name: "Tab. Escitalopram 10mg", type: "Tablet", route: "Oral", stock: true },
      { name: "Tab. Sertraline 50mg", type: "Tablet", route: "Oral", stock: true },
      { name: "Tab. Ranitidine 150mg", type: "Tablet", route: "Oral", stock: false, alt: "Tab. Famotidine 20mg" },
      { name: "Tab. Famotidine 20mg", type: "Tablet", route: "Oral", stock: true },
      { name: "Tab. Rabeprazole 20mg", type: "Tablet", route: "Oral", stock: true },
      { name: "Tab. Omeprazole 20mg", type: "Tablet", route: "Oral", stock: true },
      { name: "Tab. Spironolactone 25mg", type: "Tablet", route: "Oral", stock: true },
      { name: "Tab. Furosemide 40mg", type: "Tablet", route: "Oral", stock: true },
      { name: "Tab. Torsemide 10mg", type: "Tablet", route: "Oral", stock: true },
      { name: "Tab. Hydrochlorothiazide 12.5mg", type: "Tablet", route: "Oral", stock: true },
      { name: "Tab. Calcium Carbonate 500mg", type: "Tablet", route: "Oral", stock: true },
      { name: "Tab. Multivitamin", type: "Tablet", route: "Oral", stock: true },
      { name: "Tab. Folic Acid 5mg", type: "Tablet", route: "Oral", stock: true }
    ];
  }
  if (window.prescribeSearchQuery === undefined) {
    window.prescribeSearchQuery = "";
  }
  if (window.prescribeSelectedDrug === undefined) {
    window.prescribeSelectedDrug = null;
  }
  if (window.prescribeDose === undefined) {
    window.prescribeDose = "Once daily";
  }
  if (window.prescribeDuration === undefined) {
    window.prescribeDuration = "5 days";
  }
  if (window.prescribeInstructions === undefined) {
    window.prescribeInstructions = "";
  }
  
  if (window.patient360Vitals === undefined) {
    window.patient360Vitals = [
      { d: "24 Jun 2026", t: "09:30 AM", bp: "130/80", hr: 74, rr: 16, temp: "98.4°F", spo2: "99%", wt: "60 kg", by: "Staff Nurse Mary", news: 0 },
      { d: "24 Jun 2026", t: "06:00 AM", bp: "125/82", hr: 72, rr: 16, temp: "98.2°F", spo2: "98%", wt: "60 kg", by: "Staff Nurse Mary", news: 0 },
      { d: "23 Jun 2026", t: "10:00 PM", bp: "120/78", hr: 70, rr: 14, temp: "98.0°F", spo2: "99%", wt: "60 kg", by: "Nurse John", news: 0 },
      { d: "23 Jun 2026", t: "06:00 PM", bp: "132/84", hr: 78, rr: 18, temp: "98.6°F", spo2: "97%", wt: "60 kg", by: "Nurse John", news: 1 },
      { d: "23 Jun 2026", t: "02:00 PM", bp: "128/80", hr: 75, rr: 16, temp: "98.4°F", spo2: "99%", wt: "60 kg", by: "Staff Nurse Mary", news: 0 },
      { d: "23 Jun 2026", t: "10:00 AM", bp: "130/80", hr: 74, rr: 16, temp: "98.4°F", spo2: "99%", wt: "60 kg", by: "Staff Nurse Mary", news: 0 },
      { d: "23 Jun 2026", t: "06:00 AM", bp: "124/80", hr: 72, rr: 15, temp: "98.2°F", spo2: "98%", wt: "60 kg", by: "Nurse John", news: 0 }
    ];
  }
  
  if (window.patient360Meds === undefined) {
    window.patient360Meds = [
      { drug: "Tab Pantoprazole 40mg", route: "Oral", freq: "Once daily", dur: "5 days", status: "Active", author: "Dr. Priya Nair" },
      { drug: "Inj. Ondansetron 4mg", route: "IV", freq: "SOS", dur: "—", status: "PRN", author: "Dr. Priya Nair" },
      { drug: "Tab Ferrous Sulphate 200mg", route: "Oral", freq: "Twice daily", dur: "30 days", status: "Active", author: "Dr. Priya Nair" },
      { drug: "Tab Amlodipine 5mg", route: "Oral", freq: "Once daily", dur: "Ongoing", status: "Active", author: "Dr. Priya Nair" },
      { drug: "Tab Metformin 500mg", route: "Oral", freq: "Twice daily", dur: "Ongoing", status: "Active", author: "Dr. Priya Nair" }
    ];
  }
  if (window.patient360ActiveClinicalNoteSubtab === undefined) {
    window.patient360ActiveClinicalNoteSubtab = "Progress Note";
  }
  if (window.soapSubjective === undefined) window.soapSubjective = "";
  if (window.soapObjectiveExam === undefined) window.soapObjectiveExam = "";
  if (window.soapAssessmentImpression === undefined) window.soapAssessmentImpression = "";
  if (window.soapPlanDetails === undefined) window.soapPlanDetails = "";
  if (window.soapPlanMedicationCheck === undefined) window.soapPlanMedicationCheck = false;

  if (window.reviewStatus === undefined) window.reviewStatus = "";
  if (window.reviewPlan === undefined) window.reviewPlan = "";

  if (window.preopDiagnosis === undefined) window.preopDiagnosis = "";
  if (window.preopProcedure === undefined) window.preopProcedure = "";
  if (window.preopClearance === undefined) window.preopClearance = "";
  if (window.preopFasting === undefined) window.preopFasting = false;
  if (window.preopSiteMarked === undefined) window.preopSiteMarked = false;
  if (window.preopConsent === undefined) window.preopConsent = false;

  if (window.postopDiagnosis === undefined) window.postopDiagnosis = "";
  if (window.postopProcedure === undefined) window.postopProcedure = "";
  if (window.postopIntraop === undefined) window.postopIntraop = "";
  if (window.postopPlan === undefined) window.postopPlan = "";

  if (window.referralTarget === undefined) window.referralTarget = "";
  if (window.referralSummary === undefined) window.referralSummary = "";
  if (window.referralUrgency === undefined) window.referralUrgency = "Routine";

  if (window.dischargeDiagnosis === undefined) window.dischargeDiagnosis = "";
  if (window.dischargeCourse === undefined) window.dischargeCourse = "";
  if (window.dischargeInstructions === undefined) window.dischargeInstructions = "";
  if (window.dischargeMeds === undefined) window.dischargeMeds = "";

  if (window.patient360Notes === undefined) {
    window.patient360Notes = [
      {
        type: "PROGRESS NOTE",
        author: "Dr. Ramesh Kumar",
        dept: "Cardiology",
        time: "24 Jun 2026 · 10:15 AM",
        s: "Anemia symptoms worsening. Fatigue noted.",
        o: "BP 110/70. Conjunctival pallor.",
        a: "Iron deficiency anemia evaluation."
      },
      {
        type: "CONSULTANT RESPONSE",
        author: "Dr. Priya Nair",
        dept: "Gynaecology",
        time: "24 Jun 2026 · 09:30 AM",
        s: "Requested evaluation of heavy menstrual bleeding. Patient reports fatigue and weakness.",
        o: "Pallor present. Haemoglobin 8.2 g/dL.",
        a: "Anemia secondary to AUB. Advised iron infusion."
      }
    ];
  }
  if (window.patient360Diagnoses === undefined) {
    window.patient360Diagnoses = ["D64.9 Anaemia, unspecified"];
  }
  if (window.patient360SelectedDiagnosisTemp === undefined) {
    window.patient360SelectedDiagnosisTemp = "";
  }
  if (window.patient360DischargeClearances === undefined) {
    window.patient360DischargeClearances = {
      doctorOrder: true,
      nursingClearance: false,
      pharmacyClearance: false,
      billingClearance: true,
      finalBillGenerated: false
    };
  }

  // Predefined SOAP form inputs state
  if (window.soapSubjective === undefined) window.soapSubjective = "";
  if (window.soapObjectiveExam === undefined) window.soapObjectiveExam = "";
  if (window.soapAssessmentImpression === undefined) window.soapAssessmentImpression = "";
  if (window.soapPlanDetails === undefined) window.soapPlanDetails = "";
  if (window.soapPlanMedicationCheck === undefined) window.soapPlanMedicationCheck = true;

  // Nursing note inputs state
  if (window.nursingShift === undefined) window.nursingShift = "Morning";
  if (window.nursingObservations === undefined) window.nursingObservations = "";
  if (window.nursingActions === undefined) window.nursingActions = "";
  if (window.nursingInstructions === undefined) window.nursingInstructions = "";
  if (window.nursingNotesHistory === undefined) {
    window.nursingNotesHistory = [
      {
        type: "NURSING NOTE",
        author: "Staff Nurse Mary",
        desg: "Senior Ward Nurse",
        time: "24 Jun 2026 · 06:00 AM",
        shift: "Night",
        obs: "Patient slept well. No complaints of pain or discomfort.",
        actions: "Vitals recorded at 04:00 AM. IV line flushed.",
        instructions: "Monitor vitals Q4H. Dr. Priya Nair's rounds at 10:00 AM."
      }
    ];
  }

  // Styling block
  const p360Styles = `
    <style>
      .p360-wrap {
        font-family: var(--font-body, 'Inter', sans-serif);
        font-size: 13px;
        color: var(--text-secondary, #475569);
        background: var(--bg-base, #f8fafc);
        display: flex;
        flex-direction: column;
        gap: 12px;
        flex: 1;
        min-height: 0;
        overflow: hidden;
      }
      .p360-wrap .mono {
        font-family: 'JetBrains Mono', 'Courier New', monospace;
      }
      .p360-card {
        background: var(--bg-surface, #ffffff);
        border: 1px solid var(--border-color, #e2e8f0);
        border-radius: 8px;
        padding: 14px;
      }
      
      /* Top bar */
      .p360-topbar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        background: var(--bg-surface, #ffffff);
        border-bottom: 1px solid var(--border-color, #e2e8f0);
        padding: 8px 16px;
      }
      .p360-breadcrumb {
        font-size: 12px;
        color: var(--text-muted, #94a3b8);
        font-weight: 500;
      }
      .p360-breadcrumb b {
        color: var(--text-primary, #0f172a);
      }
      .p360-back-btn {
        background: transparent;
        border: 1px solid var(--border-color, #e2e8f0);
        color: var(--primary, #2563eb);
        font-weight: 600;
        padding: 4px 10px;
        border-radius: 4px;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        gap: 4px;
      }
      .p360-back-btn:hover {
        background: var(--primary-glow, #eff6ff);
      }
      
      /* Grid has been replaced with stacked full-width container flow */
      .p360-divider {
        height: 1px;
        background: var(--border-color, #e2e8f0);
        margin: 6px 0;
      }
      .p360-label-val {
        display: grid;
        grid-template-columns: 85px 1fr;
        gap: 4px;
        font-size: 11px;
        line-height: 1.4;
      }
      .p360-label {
        color: var(--text-muted, #94a3b8);
        font-weight: 500;
      }
      .p360-val {
        color: var(--text-primary, #0f172a);
        font-weight: 600;
      }
      
      /* Right Column - Side Tabs Layout */
      .p360-right-workspace {
        flex: 1;
        min-height: 0;
        display: flex;
        flex-direction: row;
        gap: 16px;
        overflow: hidden;
      }
      
      .p360-side-tab {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 12px;
        font-size: 12px;
        font-weight: 600;
        color: var(--text-secondary, #475569);
        cursor: pointer;
        border-radius: 6px;
        transition: all 0.15s;
      }
      .p360-side-tab:hover {
        background: var(--bg-surface-elevated, #f1f5f9);
        color: var(--text-primary, #0f172a);
      }
      .p360-side-tab.active {
        background: var(--primary-glow, #eff6ff);
        color: var(--primary, #2563eb);
      }
      
      /* Tabs bar */
      .p360-tabs-bar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 1px solid var(--border-color, #e2e8f0);
        background: var(--bg-surface, #ffffff);
        padding: 0 16px;
        flex-shrink: 0;
      }
      .p360-tabs-list {
        display: flex;
        gap: 20px;
      }
      .p360-tab-item {
        padding: 10px 0;
        font-size: 13px;
        font-weight: 600;
        color: var(--text-secondary, #475569);
        cursor: pointer;
        border-bottom: 2px solid transparent;
        transition: all 0.15s;
        white-space: nowrap;
      }
      .p360-tab-item.active {
        color: var(--primary, #2563eb);
        border-bottom-color: var(--primary, #2563eb);
      }
      
      /* Right Workspace Content Viewport */
      .p360-viewport {
        flex: 1;
        overflow-y: auto;
        background: var(--bg-surface, #ffffff);
        border: 1px solid var(--border-color, #e2e8f0);
        border-radius: 8px;
        padding: 16px;
      }

      /* Badges */
      .badge-type {
        font-size: 9px;
        font-weight: 700;
        padding: 2px 6px;
        border-radius: 4px;
        display: inline-block;
        letter-spacing: 0.5px;
      }
      .badge-dc { background: #ecfeff; color: #0891b2; }
      .badge-ipd { background: #f5f3ff; color: #7c3aed; }
      .badge-status-active { background: #d1fae5; color: #059669; }
      .badge-status-discharged { background: #f1f5f9; color: #64748b; }
      
      /* Safety flag chips */
      .flag-chip {
        display: inline-flex;
        align-items: center;
        padding: 2px 8px;
        border-radius: 4px;
        font-size: 10px;
        font-weight: 700;
        text-transform: uppercase;
        margin-right: 4px;
        margin-bottom: 4px;
      }
      
      /* Quick actions list */
      .actions-container {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }
      .btn-qa-primary {
        background: var(--primary, #2563eb);
        color: #ffffff;
        border: none;
        border-radius: 6px;
        padding: 7px 12px;
        font-weight: 600;
        cursor: pointer;
        width: auto;
        text-align: center;
      }
      .btn-qa-primary:hover {
        background: var(--primary-hover, #1d4ed8);
      }
      .btn-qa-secondary {
        background: var(--bg-surface-elevated, #f1f5f9);
        color: var(--text-primary, #0f172a);
        border: 1px solid var(--border-color, #e2e8f0);
        border-radius: 6px;
        padding: 6px 10px;
        font-weight: 600;
        cursor: pointer;
        font-size: 11px;
        text-align: center;
      }
      .btn-qa-secondary:hover {
        background: #e2e8f0;
      }
      .btn-qa-ghost {
        background: transparent;
        color: var(--primary, #2563eb);
        border: 1px solid var(--primary, #2563eb);
        border-radius: 6px;
        padding: 5px 10px;
        font-weight: 600;
        cursor: pointer;
        font-size: 11px;
        text-align: center;
      }
      .btn-qa-ghost:hover {
        background: var(--primary-glow, #eff6ff);
      }
      
      /* Activity Digest */
      .digest-list {
        list-style: none;
        padding: 0;
        margin: 0;
        display: flex;
        flex-direction: column;
        gap: 6px;
      }
      .digest-item {
        display: flex;
        gap: 6px;
        font-size: 11px;
        align-items: flex-start;
      }
      
      /* Wide modal overrides for 2-column forms */
      .p360-modal-content-wide {
        width: 960px !important;
        max-width: 95vw !important;
      }
      .modal-cols {
        display: flex;
        gap: 16px;
        flex: 1;
        overflow: hidden;
      }
      .modal-left-col {
        flex: 1.3;
        display: flex;
        flex-direction: column;
        gap: 12px;
        overflow-y: auto;
        padding-right: 4px;
      }
      .modal-right-col {
        width: 340px;
        flex-shrink: 0;
        display: flex;
        flex-direction: column;
        gap: 12px;
        border-left: 1px solid var(--border-color, #e2e8f0);
        padding-left: 16px;
        overflow-y: auto;
      }
      .chip-list {
        display: flex;
        gap: 6px;
        flex-wrap: wrap;
      }
      .quick-chip {
        background: var(--bg-surface-elevated, #f1f5f9);
        color: var(--text-secondary, #475569);
        padding: 4px 10px;
        font-size: 11px;
        font-weight: 600;
        border-radius: 20px;
        border: 1px solid var(--border-color, #e2e8f0);
        cursor: pointer;
        transition: all 0.1s;
      }
      .quick-chip:hover {
        background: var(--primary-glow, #eff6ff);
        color: var(--primary, #2563eb);
        border-color: var(--primary, #2563eb);
      }
      .selected-box {
        border: 1px solid var(--border-color, #e2e8f0);
        border-radius: 8px;
        background: #f8fafc;
        display: flex;
        flex-direction: column;
        overflow: hidden;
      }
      .selected-box-header {
        padding: 8px 12px;
        border-bottom: 1px solid var(--border-color, #e2e8f0);
        background: #f1f5f9;
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 11px;
        font-weight: 700;
        color: var(--text-primary, #0f172a);
      }
      .selected-box-body {
        padding: 0;
        max-height: 180px;
        overflow-y: auto;
      }
      .selected-box-footer {
        padding: 6px 12px;
        border-top: 1px solid var(--border-color, #e2e8f0);
        background: #f1f5f9;
        display: flex;
        justify-content: flex-start;
      }

      /* Modal Styles */
      .p360-modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(15, 23, 42, 0.4);
        backdrop-filter: blur(4px);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 2000;
      }
      .p360-modal-content {
        background: #ffffff;
        border-radius: 12px;
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
        width: 520px;
        max-width: 95%;
        max-height: 85vh;
        display: flex;
        flex-direction: column;
        overflow: hidden;
        border: 1px solid var(--border-color, #e2e8f0);
        animation: modalFadeIn 0.15s ease-out;
      }
      @keyframes modalFadeIn {
        from { opacity: 0; transform: scale(0.96); }
        to { opacity: 1; transform: scale(1); }
      }
      .p360-modal-header {
        padding: 12px 16px;
        border-bottom: 1px solid var(--border-color, #e2e8f0);
        display: flex;
        justify-content: space-between;
        align-items: center;
        background: var(--bg-surface-elevated, #f1f5f9);
      }
      .p360-modal-header h3 {
        margin: 0;
        font-size: 13px;
        font-weight: 700;
        color: var(--text-primary, #0f172a);
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
      .p360-modal-close {
        font-size: 20px;
        font-weight: bold;
        color: var(--text-muted, #94a3b8);
        cursor: pointer;
        background: transparent;
        border: none;
        outline: none;
      }
      .p360-modal-close:hover {
        color: var(--text-primary, #0f172a);
      }
      .p360-modal-body {
        padding: 16px;
        overflow-y: auto;
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
      .p360-modal-footer {
        padding: 12px 16px;
        border-top: 1px solid var(--border-color, #e2e8f0);
        display: flex;
        justify-content: flex-end;
        gap: 8px;
        background: var(--bg-surface-elevated, #f1f5f9);
      }

      /* Timeline styles */
      .timeline-container {
        display: flex;
        flex-direction: column;
        gap: 16px;
        position: relative;
        padding-left: 20px;
        margin-top: 10px;
      }
      .timeline-container::before {
        content: '';
        position: absolute;
        left: 6px;
        top: 4px;
        bottom: 4px;
        width: 2px;
        background: var(--border-color, #e2e8f0);
      }
      .timeline-item {
        position: relative;
        display: flex;
        flex-direction: column;
        gap: 2px;
      }
      .timeline-dot {
        position: absolute;
        left: -20px;
        top: 2px;
        width: 12px;
        height: 12px;
        border-radius: 50%;
        background: #ffffff;
        border: 2px solid var(--primary, #2563eb);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10;
      }
      .timeline-time {
        font-size: 10px;
        font-weight: 700;
        color: var(--text-muted, #94a3b8);
        font-family: 'JetBrains Mono', monospace;
      }
      .timeline-title {
        font-size: 12px;
        font-weight: 700;
        color: var(--text-primary, #0f172a);
      }
      .timeline-desc {
        font-size: 11px;
        color: var(--text-secondary, #475569);
        line-height: 1.4;
      }

      /* SOAP Composer layout */
      .clinical-notes-layout {
        display: flex;
        gap: 16px;
        height: 100%;
        overflow: hidden;
      }
      .note-composer-panel {
        width: 55%;
        display: flex;
        flex-direction: column;
        gap: 12px;
        overflow-y: auto;
        padding-right: 6px;
      }
      .note-history-panel {
        width: 45%;
        border-left: 1px solid var(--border-color, #e2e8f0);
        padding-left: 16px;
        display: flex;
        flex-direction: column;
        gap: 10px;
        overflow-y: auto;
      }
      
      /* Sub-tabs */
      .composer-subtabs {
        display: flex;
        gap: 8px;
        border-bottom: 1px solid var(--border-color, #e2e8f0);
        padding-bottom: 4px;
      }
      .subtab-item {
        padding: 4px 10px;
        font-size: 11px;
        font-weight: 600;
        cursor: pointer;
        border-radius: 4px;
        background: var(--bg-surface-elevated, #f1f5f9);
        color: var(--text-secondary, #475569);
      }
      .subtab-item.active {
        background: var(--primary, #2563eb);
        color: #ffffff;
      }
      
      /* Critical lab alert strip */
      .critical-alert-strip {
        background: #fee2e2;
        border: 1px solid #fecaca;
        color: #b91c1c;
        border-radius: 6px;
        padding: 8px 12px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 12px;
        font-weight: 600;
      }
      .btn-ack {
        background: #ef4444;
        color: #ffffff;
        border: none;
        border-radius: 4px;
        padding: 2px 8px;
        font-size: 10px;
        font-weight: 700;
        cursor: pointer;
      }
      .btn-ack:hover {
        background: #dc2626;
      }
      
      /* Forms */
      .form-group {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }
      .form-group label {
        font-size: 11px;
        font-weight: 700;
        color: var(--text-primary, #0f172a);
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
      .form-control {
        border: 1px solid var(--border-color, #e2e8f0);
        border-radius: 6px;
        padding: 6px 10px;
        font-size: 13px;
        outline: none;
      }
      .form-control:focus {
        border-color: var(--primary, #2563eb);
      }
      
      /* Vitals strip in SOAP */
      .vitals-data-strip {
        background: var(--bg-surface-elevated, #f1f5f9);
        border-radius: 6px;
        padding: 8px 12px;
        display: flex;
        justify-content: space-between;
        font-size: 11px;
        color: var(--text-secondary, #475569);
      }
      .vitals-data-strip b {
        color: var(--text-primary, #0f172a);
      }

      /* Note History Cards */
      .note-card {
        background: var(--bg-surface, #ffffff);
        border: 1px solid var(--border-color, #e2e8f0);
        border-radius: 6px;
        padding: 10px 12px;
        display: flex;
        flex-direction: column;
        gap: 4px;
      }
      .note-card-consultant {
        background: var(--primary-glow, #eff6ff);
        border-left: 3px solid var(--primary, #2563eb);
      }
      
      /* Tables */
      .p360-table {
        width: 100%;
        border-collapse: collapse;
        font-size: 12px;
        text-align: left;
      }
      .p360-table th {
        background: var(--bg-surface-elevated, #f1f5f9);
        color: var(--text-primary, #0f172a);
        font-weight: 600;
        padding: 8px;
        border-bottom: 1px solid var(--border-color, #e2e8f0);
      }
      .p360-table td {
        padding: 8px;
        border-bottom: 1px solid var(--border-color, #e2e8f0);
      }
      
      /* Diagnosis search wrapper */
      .diag-search-wrapper {
        position: relative;
        display: flex;
        flex-direction: column;
      }
      .diag-dropdown {
        position: absolute;
        top: 36px;
        left: 0;
        right: 0;
        background: var(--bg-surface, #ffffff);
        border: 1px solid var(--border-color, #e2e8f0);
        border-radius: 6px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        z-index: 200;
        max-height: 150px;
        overflow-y: auto;
      }
      .diag-option {
        padding: 6px 10px;
        cursor: pointer;
      }
      .diag-option:hover {
        background: var(--primary-glow, #eff6ff);
      }
      .diag-chip {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        background: var(--bg-surface-elevated, #f1f5f9);
        border: 1px solid var(--border-color, #e2e8f0);
        border-radius: 4px;
        padding: 2px 6px;
        font-size: 11px;
        font-weight: 600;
        margin-right: 4px;
        margin-top: 4px;
      }
      .diag-chip-remove {
        cursor: pointer;
        color: var(--color-danger, #ef4444);
        font-weight: bold;
      }
      
      /* Document card */
      .doc-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
        gap: 12px;
      }
      .doc-card {
        border: 1px solid var(--border-color, #e2e8f0);
        border-radius: 6px;
        padding: 10px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        text-align: center;
        gap: 6px;
        background: var(--bg-surface, #ffffff);
      }
      
      /* Discharge Checklist */
      .chk-item {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 13px;
        padding: 4px 0;
      }
    </style>
  `;

  // Draw Patient 360 Workspace
  function draw360() {
    const role = window.patient360Role;
    const tab = window.patient360ActiveTab;
    const isAcked = window.patient360CriticalAcked;

    // LEFT PANEL Quick Actions re-eval based on Role
    let quickActionsHtml = '';
    const isOpd = patient && patient.type === 'OPD';
    if (role === 'Doctor') {
      if (patient.status === 'Discharged') {
        quickActionsHtml = `
          <div style="display:flex; gap:6px; flex-wrap:wrap; align-items:center;">
            <button class="btn-qa-primary" style="background:#4f46e5; border-color:#4f46e5; color:white;" onclick="window.prTriggerAction('📅 Book Appointment')">📅 Book Appointment</button>
            <button class="btn-qa-primary" style="background:#059669; border-color:#059669; color:white;" onclick="window.prAdmitOPDPatient('${patient.uhid}', 'IPD')">🏥 Admit IPD</button>
            <button class="btn-qa-primary" style="background:#0d9488; border-color:#0d9488; color:white;" onclick="window.prAdmitOPDPatient('${patient.uhid}', 'Daycare')">🏥 Admit Daycare</button>
          </div>
        `;
      } else {
        let actionButtons = `
          <button class="btn-qa-primary" onclick="window.prTriggerAction('✏ Write Note')">✏ Write Note</button>
          <button class="btn-qa-secondary" onclick="window.prTriggerAction('💊 Prescribe')">💊 Prescribe</button>
          <button class="btn-qa-secondary" onclick="window.prTriggerAction('🔬 Order Lab')">🔬 Order Lab</button>
          <button class="btn-qa-secondary" onclick="window.prTriggerAction('🩻 Order Radiology')">🩻 Radiology</button>
          <button class="btn-qa-secondary" onclick="window.prTriggerAction('📋 Order Diet')">📋 Order Diet</button>
        `;

        if (patient.type === 'OPD') {
          quickActionsHtml = `
            <div style="display:flex; gap:6px; flex-wrap:wrap; align-items:center;">
              <button class="btn-qa-primary" style="background:#4f46e5; border-color:#4f46e5; color:white;" onclick="window.prTriggerAction('📅 Book Appointment')">📅 Book Appointment</button>
              <button class="btn-qa-primary" style="background:#10b981; border-color:#10b981; color:white;" onclick="window.router.navigate('emr?uhid=${patient.uhid}&start=true')">🩺 Start Consultation</button>
              <button class="btn-qa-primary" style="background:#059669; border-color:#059669; color:white;" onclick="window.prAdmitOPDPatient('${patient.uhid}', 'IPD')">🏥 Admit IPD</button>
              <button class="btn-qa-primary" style="background:#0d9488; border-color:#0d9488; color:white;" onclick="window.prAdmitOPDPatient('${patient.uhid}', 'Daycare')">🏥 Admit Daycare</button>
            </div>
          `;
        } else if (patient.type === 'Daycare') {
          var isDischarging = patient.dischargeStatus === 'In Progress — Clearances Pending';
          quickActionsHtml = `
            <div style="display:flex; gap:6px; flex-wrap:wrap; align-items:center;">
              ${actionButtons}
              ${isDischarging
                ? `<span style="display:inline-flex; align-items:center; gap:4px; padding:4px 10px; background:#fef9c3; border:1px solid #fbbf24; border-radius:6px; font-size:11px; font-weight:700; color:#854d0e;">⏳ Discharge In Progress</span>`
                : `<button class="btn-qa-ghost" onclick="window.prTriggerAction('🚪 Discharge')">🚪 Discharge</button>`
              }
              ${isDischarging ? '' : `<button class="btn-qa-ghost" style="color:#7c3aed; border-color:#c084fc;" onclick="window.prTransferDaycareToIPD('${patient.uhid}')">↔ Transfer IPD</button>`}
            </div>
          `;
        } else { // IPD patient
          var isDischarging = patient.dischargeStatus === 'In Progress — Clearances Pending';
          quickActionsHtml = `
            <div style="display:flex; gap:6px; flex-wrap:wrap; align-items:center;">
              ${actionButtons}
              ${isDischarging
                ? `<span style="display:inline-flex; align-items:center; gap:4px; padding:4px 10px; background:#fef9c3; border:1px solid #fbbf24; border-radius:6px; font-size:11px; font-weight:700; color:#854d0e;">⏳ Discharge In Progress</span>`
                : `<button class="btn-qa-ghost" onclick="window.prTriggerAction('🚪 Discharge')">🚪 Discharge</button>`
              }
              ${isDischarging ? '' : `<button class="btn-qa-ghost" onclick="window.prTriggerAction('↔ Transfer')">↔ Transfer</button>`}
            </div>
          `;
        }
      }
    } else if (role === 'Nurse') {
      quickActionsHtml = `
        <div style="display:flex; gap:6px; flex-wrap:wrap; align-items:center;">
          <button class="btn-qa-primary" onclick="window.prTriggerAction('📊 Record Vitals')">📊 Record Vitals</button>
          <button class="btn-qa-secondary" onclick="window.prTriggerAction('✅ Acknowledge Order')">✅ Ack Order</button>
          <button class="btn-qa-secondary" onclick="window.prTriggerAction('📝 Nursing Note')">📝 Nurse Note</button>
          <button class="btn-qa-ghost" onclick="window.prTriggerAction('🤝 Shift Handover')">🤝 Handover</button>
          <button class="btn-qa-ghost" onclick="window.prTriggerAction('⚠ Report Incident')">⚠ Incident</button>
        </div>
      `;
    } else if (role === 'Billing') {
      quickActionsHtml = `
        <div style="display:flex; gap:6px; flex-wrap:wrap; align-items:center;">
          <button class="btn-qa-primary" onclick="window.prTriggerAction('💰 View Bill')">💰 View Bill</button>
          <button class="btn-qa-secondary" onclick="window.prTriggerAction('💳 Collect Payment')">💳 Pay</button>
          <button class="btn-qa-secondary" onclick="window.prTriggerAction('📄 Generate Receipt')">📄 Receipt</button>
          <button class="btn-qa-ghost" onclick="window.prTriggerAction('↩ Process Refund')">↩ Refund</button>
          <button class="btn-qa-ghost" onclick="window.prTriggerAction('📤 Send Bill')">📤 Send Bill</button>
        </div>
      `;
    } else if (role === 'Admission') {
      var isDischarging = patient && patient.dischargeStatus === 'In Progress — Clearances Pending';
      var isUnallocated = !patient.bed || patient.bed === 'Unallocated' || patient.bed === '—';
      quickActionsHtml = isOpd ? `
        <div style="display:flex; gap:6px; flex-wrap:wrap; align-items:center;">
          <button class="btn-qa-primary" style="background:#059669; hover:bg:#047857; color:white;" onclick="window.prAdmitOPDPatient('${patient.uhid}')">🏥 Admit Patient</button>
        </div>
      ` : `
        <div style="display:flex; gap:6px; flex-wrap:wrap; align-items:center;">
          ${isUnallocated 
            ? `<button class="btn-qa-primary" style="background:#1b3a5c; border-color:#1b3a5c; color:white;" onclick="window.triggerAllocateBedWorkflow('${patient.uhid}')">🛏️ Allocate Bed</button>` 
            : `<button class="btn-qa-primary" onclick="window.prTriggerAction('🛏 Change Bed')">🛏 Change Bed</button>`}
          <button class="btn-qa-secondary" onclick="window.prTriggerAction('📋 Edit Admission')">📋 Edit Admission</button>
          ${isDischarging || isUnallocated ? '' : `<button class="btn-qa-secondary" onclick="window.prTriggerAction('↔ Transfer Ward')">↔ Transfer</button>`}
          ${isDischarging
            ? `<span style="display:inline-flex; align-items:center; gap:4px; padding:4px 10px; background:#fef9c3; border:1px solid #fbbf24; border-radius:6px; font-size:11px; font-weight:700; color:#854d0e;">⏳ Discharge In Progress</span>`
            : (isUnallocated ? '' : `<button class="btn-qa-ghost" onclick="window.prTriggerAction('🚪 Initiate Discharge')">🚪 Discharge</button>`)
          }
        </div>
      `;
    } else if (role === 'Pharmacy') {
      quickActionsHtml = `
        <div style="display:flex; gap:6px; flex-wrap:wrap; align-items:center;">
          <button class="btn-qa-primary" onclick="window.prTriggerAction('💊 View Prescriptions')">💊 Prescriptions</button>
          <button class="btn-qa-secondary" onclick="window.prTriggerAction('✅ Mark Dispensed')">✅ Dispense</button>
          <button class="btn-qa-secondary" onclick="window.prTriggerAction('↩ Process Return')">↩ Return</button>
        </div>
      `;
    } else if (role === 'Front Desk') {
      quickActionsHtml = `
        <div style="display:flex; gap:6px; flex-wrap:wrap; align-items:center;">
          <button class="btn-qa-primary" onclick="window.prTriggerAction('📱 Send SMS')">📱 Send SMS</button>
          <button class="btn-qa-secondary" onclick="window.prTriggerAction('🖨 Print Summary')">🖨 Print</button>
          <button class="btn-qa-secondary" onclick="window.prTriggerAction('📅 Book Appointment')">📅 Appointment</button>
          <button class="btn-qa-ghost" onclick="window.prTriggerAction('✏ Edit Contact Info')">✏ Edit Contact Info</button>
        </div>
      `;
    }

    // Tab bar list based on active role
    let visibleTabs = [];
    if (role === 'Doctor') {
      visibleTabs = ['Summary & Timeline', 'Clinical Notes', 'Vitals', 'Labs', 'Imaging', 'Medications', 'Prescriptions', 'Documents', 'Complaints', 'ATD'];
    } else if (role === 'Nurse') {
      visibleTabs = ['Summary & Timeline', 'Clinical Notes', 'Vitals', 'Labs', 'Imaging', 'Medications', 'Prescriptions', 'Nursing Notes', 'Documents', 'Complaints', 'ATD'];
    } else if (role === 'Billing') {
      visibleTabs = ['Summary & Timeline', 'Billing', 'Documents', 'Complaints', 'ATD'];
    } else if (role === 'Pharmacy') {
      visibleTabs = ['Summary & Timeline', 'Medications', 'Prescriptions', 'Labs', 'Imaging'];
    } else if (role === 'Front Desk') {
      visibleTabs = ['Summary & Timeline', 'Documents', 'Complaints', 'ATD'];
    } else if (role === 'Admission') {
      visibleTabs = ['Summary & Timeline', 'ATD'];
    }

    if (patient && patient.type === 'OPD') {
      visibleTabs = visibleTabs.filter(t => t !== 'ATD');
      // Enforce switching active tab away from ATD if set
      if (window.patient360ActiveTab === 'ATD') {
        window.patient360ActiveTab = 'Summary & Timeline';
      }
    }

    // Render Tab Workspace content
    let tabContentHtml = '';

    if (tab === 'Summary & Timeline') {
      const cd = patient.clinicalData || {};
      const isIpd = patient.type === 'IPD';
      const isDaycare = patient.type === 'Daycare';
      const isOpdPat = patient.type === 'OPD';

      // Build dynamic diagnosis / problem list from clinicalData
      const diagText = cd.diagnosis || patient.provisionalDiagnosis || 'Under evaluation';
      const complaintText = cd.complaint || patient.complaint || 'Routine consultation';
      const carePlanText = cd.carePlan || cd.treatmentPlan || 'As per consultant advice';
      const hpiText = cd.hpi || '';

      // Dynamic clinical narrative
      const admitLine = isOpdPat
        ? `${patient.name}, a ${patient.age}-year-old ${patient.gender.toLowerCase()}, presented for ${patient.visitType || 'OPD'} consultation with ${cd.complaint || 'Dr.'} ${patient.primaryConsultant || ''} (${patient.department || ''}).`
        : `${patient.name}, a ${patient.age}-year-old ${patient.gender.toLowerCase()}, ${isDaycare ? 'was admitted to Daycare' : 'was admitted to'} ${patient.bed ? patient.bed + (patient.ward ? ' — ' + patient.ward : '') : patient.ward || 'ward'} under ${patient.primaryConsultant || 'the consultant'} (${patient.department || ''}).`;

      const clinicalLine = `Chief complaint: <b>${complaintText}</b>. ${hpiText ? hpiText + ' ' : ''}Provisional diagnosis: <b>${diagText}</b>.`;

      // Build problem list — split multi-diagnosis by comma or semicolon
      const diagParts = diagText.split(/[,;]/).map(d => d.trim()).filter(Boolean);
      const alertsList = patient.alerts || [];
      const isCritical = (patient.newsScore || 0) >= 5 || alertsList.some(a => a.toLowerCase().includes('critical'));

      const problemRows = diagParts.map((diag, i) => {
        const isCrit = i === 0 && isCritical;
        const badgeStyle = isCrit
          ? 'background:#fee2e2; color:#ef4444; font-weight:700;'
          : i === 0 ? 'background:#dbeafe; color:#1d4ed8; font-weight:600;' : '';
        const badgeClass = isCrit ? 'badge-type badge-ipd' : 'badge-type badge-status-active';
        const badgeLabel = isCrit ? 'CRITICAL' : i === 0 ? 'PRIMARY DX' : 'COMORBIDITY';
        return `
          <div style="display:flex; justify-content:space-between; align-items:center; font-size:12px; ${i > 0 ? 'border-top:1px solid var(--border-color, #e2e8f0); padding-top:6px;' : ''}">
            <span>${i === 0 ? '<b>' + diag + '</b>' : diag}</span>
            <span class="${badgeClass}" style="${badgeStyle}">${badgeLabel}</span>
          </div>`;
      }).join('');

      // Extra alert rows
      const alertRows = alertsList.map(a => `
        <div style="display:flex; justify-content:space-between; align-items:center; font-size:12px; border-top:1px solid var(--border-color, #e2e8f0); padding-top:6px;">
          <span>🚨 ${a}</span>
          <span class="badge-type badge-ipd" style="background:#fee2e2; color:#ef4444; font-weight:700;">ACTIVE ALERT</span>
        </div>`).join('');

      // Care plan label based on type
      const carePlanLabel = isDaycare ? 'DAYCARE CARE PLAN' : isIpd ? 'INPATIENT CARE PLAN' : 'OPD CARE PLAN & FOLLOW-UP';

      // Build dynamic care plan tasks from carePlanText (split by full stop or newline)
      const carePlanLines = carePlanText
        .split(/\.\s+|\n/)
        .map(s => s.trim())
        .filter(s => s.length > 4);
      const isUnallocated = !patient.bed || patient.bed === 'Unallocated' || patient.bed === '—';
      const carePlanItems = carePlanLines.length > 0
        ? carePlanLines.map(line => {
            if (isIpd && isUnallocated && line.toLowerCase().includes('pending bed allocation')) {
              return `
                <div style="display:flex; align-items:center; justify-content:space-between; width:100%; padding: 4px 0;">
                  <span style="font-size:12px; font-weight: 500; color:#475569;">🛏️ Pending bed allocation</span>
                  <button class="btn btn-primary" style="padding:4px 10px; font-size:11px; background:#1b3a5c; border-color:#1b3a5c; font-weight:700; cursor:pointer;" onclick="window.triggerAllocateBedWorkflow('${patient.uhid}')">Allocate Bed</button>
                </div>
              `;
            }
            return `
              <label class="chk-item" style="font-size:12px; display:flex; align-items:center; gap:8px;">
                <input type="checkbox" onchange="window.prShowToast('Task noted')"> <span>${line}</span>
              </label>`;
          }).join('')
        : ((isIpd && isUnallocated && carePlanText.toLowerCase().includes('pending bed allocation'))
          ? `
            <div style="display:flex; align-items:center; justify-content:space-between; width:100%; padding: 4px 0;">
              <span style="font-size:12px; font-weight: 500; color:#475569;">🛏️ Pending bed allocation</span>
              <button class="btn btn-primary" style="padding:4px 10px; font-size:11px; background:#1b3a5c; border-color:#1b3a5c; font-weight:700; cursor:pointer;" onclick="window.triggerAllocateBedWorkflow('${patient.uhid}')">Allocate Bed</button>
            </div>
          `
          : `
            <label class="chk-item" style="font-size:12px; display:flex; align-items:center; gap:8px;">
              <input type="checkbox" onchange="window.prShowToast('Task noted')"> <span>${carePlanText}</span>
            </label>
          `);

      tabContentHtml = `
        <div style="display:flex; gap:20px; height:100%; overflow:hidden;">
          
          <!-- Left Column: Patient Summary -->
          <div style="width:55%; display:flex; flex-direction:column; gap:16px; overflow-y:auto; padding-right:10px;">
            
            <!-- Clinical Narrative Card -->
            <div class="p360-card" style="border-color:#dbeafe; background:#fcfdff; margin:0; padding:14px;">
              <h5 style="margin:0 0 8px 0; font-size:13px; font-weight:700; color:var(--primary, #2563eb); display:flex; align-items:center; gap:6px;">
                <span>📝</span> Visit Summary &amp; Clinical Narrative
              </h5>
              <p style="margin:0; font-size:12px; line-height:1.5; color:var(--text-secondary);">
                ${admitLine}
              </p>
              <p style="margin:6px 0 0 0; font-size:12px; line-height:1.5; color:var(--text-secondary);">
                ${clinicalLine}
              </p>
            </div>

            <!-- Active Conditions Card -->
            <div class="p360-card" style="margin:0; padding:14px;">
              <h5 style="margin:0 0 10px 0; font-size:12px; font-weight:700; color:var(--text-primary);">ACTIVE PROBLEMS &amp; DIAGNOSES</h5>
              <div style="display:flex; flex-direction:column; gap:8px;">
                ${problemRows || '<div style="font-size:12px; color:var(--text-muted);">No active diagnoses recorded.</div>'}
                ${alertRows}
              </div>
            </div>

            <!-- Care Plan Tasks Card -->
            <div class="p360-card" style="margin:0; padding:14px;">
              <h5 style="margin:0 0 10px 0; font-size:12px; font-weight:700; color:var(--text-primary);">${carePlanLabel}</h5>
              <div style="display:flex; flex-direction:column; gap:8px;">
                ${carePlanItems}
              </div>
            </div>

          </div>

          <!-- Right Column: Timeline -->
          <div style="width:45%; display:flex; flex-direction:column; gap:12px; overflow-y:auto; border-left:1px solid var(--border-color, #e2e8f0); padding-left:16px;">
            <h5 style="margin:0; font-size:12px; font-weight:700; color:var(--text-primary); display:flex; justify-content:space-between; align-items:center;">
              <span>📅 PATIENT ENGAGEMENT TIMELINE</span>
              <span style="font-size:10px; font-weight:normal; color:var(--text-muted);">Chronological Feed</span>
            </h5>
            
            <div class="timeline-container">
              ${(patient.timelineEvents && patient.timelineEvents.length > 0) ? patient.timelineEvents.map(event => {
                let color = '#3b82f6', bg = '#dbeafe';
                if (event.type === 'pharmacy' || event.title.includes('Medication') || event.title.includes('Prescription') || event.title.includes('Rx') || event.title.includes('Dispensed')) {
                  color = '#10b981'; bg = '#d1fae5';
                } else if (event.type === 'billing' || event.title.includes('Payment') || event.title.includes('Bill')) {
                  color = '#f59e0b'; bg = '#fef3c7';
                } else if (event.type === 'lab' || event.title.includes('Lab') || event.title.includes('Investigation') || event.title.includes('Test')) {
                  color = '#8b5cf6'; bg = '#ede9fe';
                } else if (event.title.includes('Critical') || event.title.includes('Alert') || event.title.includes('Failed')) {
                  color = '#ef4444'; bg = '#fee2e2';
                } else if (event.type === 'registration' || event.title.includes('Admission') || event.title.includes('Admitted') || event.title.includes('Transfer') || event.title.includes('Registered')) {
                  color = '#8b5cf6'; bg = '#f3e8ff';
                }
                
                let timeStr = event.date || 'Today';
                if (timeStr && timeStr.includes('T')) {
                  try {
                    const d = new Date(event.date);
                    timeStr = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) + ' • ' + d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
                  } catch (e) {}
                }
                
                let actionBtnHtml = '';
                if (event.hasDischargeSummary || event.title.includes('Discharge') || event.title.includes('Discharged')) {
                  actionBtnHtml = `
                    <div style="margin-top:6px;">
                      <button class="btn btn-secondary btn-xs" style="padding:2px 8px; font-size:10px; border-radius:4px; height:auto; color:#1e40af; border-color:#bfdbfe; background:#eff6ff;" onclick="window.showDischargeSummaryModal('${patient.uhid}')">📄 See Discharge Summary</button>
                    </div>
                  `;
                }
                
                return `
                  <div class="timeline-item">
                    <div class="timeline-dot" style="border-color:${color}; background:${bg}; display:flex; align-items:center; justify-content:center; font-size:10px;">${event.icon || '•'}</div>
                    <div class="timeline-time">${timeStr}</div>
                    <div class="timeline-title">${event.title}</div>
                    <div class="timeline-desc">${event.desc}</div>
                    ${actionBtnHtml}
                  </div>
                `;
              }).join('') : `
                <div class="timeline-item">
                  <div class="timeline-dot" style="border-color:#8b5cf6; background:#f3e8ff; display:flex; align-items:center; justify-content:center; font-size:10px;">📋</div>
                  <div class="timeline-time">${patient.admitted || 'Today'}</div>
                  <div class="timeline-title">${isOpdPat ? 'OPD Registration' : isDaycare ? 'Daycare Admission' : 'IPD Admission'}</div>
                  <div class="timeline-desc">${patient.name} registered under ${patient.primaryConsultant || 'consultant'}. ${complaintText}</div>
                </div>
              `}
            </div>
          </div>
          
        </div>
      `;
    } else if (tab === 'Clinical Notes') {
      const activeSubtab = window.patient360ActiveClinicalNoteSubtab || 'Progress Note';
      const subTabs = ['Progress Note', 'Review Note', 'Pre-op Note', 'Post-op Note', 'Referral Note', 'Discharge Note'];

      let subTabsHtml = '';
      if (role === 'Doctor') {
        subTabsHtml = `
          <div class="composer-subtabs">
            ${subTabs.map(st => `
              <span class="subtab-item ${activeSubtab === st ? 'active' : ''}" onclick="window.prSelectClinicalNoteSubtab('${st}')">${st}</span>
            `).join('')}
          </div>
        `;
      } else {
        subTabsHtml = `
          <div class="composer-subtabs">
            <span class="subtab-item active">Progress Note</span>
          </div>
        `;
      }

      // Critical Alert strip
      const alertStripHtml = !isAcked ? `
        <div class="critical-alert-strip">
          <span>🔴 K⁺ 6.8 — Critical value. Acknowledge before saving note.</span>
          <button class="btn-ack" onclick="window.prAcknowledgeCritical()">Acknowledge</button>
        </div>
      ` : '';

      // Diagnoses chips list
      const diagChipsHtml = window.patient360Diagnoses.map((d, i) => `
        <span class="diag-chip">
          <span>${d}</span>
          <span class="diag-chip-remove" onclick="window.prRemoveDiagnosis(${i})">×</span>
        </span>
      `).join('');

      // ICD-10 Search options list if typing
      let searchOptionsHtml = '';
      if (window.patient360SelectedDiagnosisTemp.trim().length > 0) {
        const query = window.patient360SelectedDiagnosisTemp.toLowerCase();
        const icd10list = [
          "D64.9 Anaemia, unspecified",
          "E11.9 Type 2 diabetes mellitus without complications",
          "I10 Essential (primary) hypertension",
          "N92.0 Excessive and frequent menstruation (AUB)",
          "K21.9 Gastro-oesophageal reflux disease without esophagitis",
          "I25.1 Chronic ischemic heart disease"
        ];
        const matches = icd10list.filter(item => item.toLowerCase().includes(query));
        if (matches.length > 0) {
          searchOptionsHtml = `
            <div class="diag-dropdown">
              ${matches.map(m => `<div class="diag-option" onclick="window.prAddDiagnosis('${m}')">${m}</div>`).join('')}
            </div>
          `;
        }
      }

      // Render Dynamic Forms for different Note types
      let formHtml = '';
      if (activeSubtab === 'Progress Note') {
        formHtml = `
          <div class="form-group" style="margin-top:4px;">
            <label>S — Subjective *</label>
            <textarea class="form-control" rows="3" placeholder="Chief complaint and patient's description..." id="soap-s" oninput="window.prValidateClinicalNote()">${window.soapSubjective}</textarea>
          </div>

          <div class="form-group">
            <label>O — Objective</label>
            <span style="font-size:11px; color:var(--text-muted); margin-bottom:2px;">Latest vitals</span>
            <div class="vitals-data-strip">
              <span>BP: <b>${patient.vitals?.bp || '—'}</b></span>
              <span>HR: <b>${patient.vitals?.hr || '—'}</b></span>
              <span>RR: <b>${patient.vitals?.rr || '—'}</b></span>
              <span>Temp: <b>${patient.vitals?.temp ? patient.vitals.temp + '°F' : '—'}</b></span>
              <span>SpO₂: <b>${patient.vitals?.spo2 ? patient.vitals.spo2 + '%' : '—'}</b></span>
            </div>
            <textarea class="form-control" rows="2" style="margin-top:6px;" placeholder="Examination findings..." id="soap-o-exam" oninput="window.soapObjectiveExam = this.value">${window.soapObjectiveExam}</textarea>
            
            <div style="margin-top:6px; display:flex; align-items:center; gap:6px;">
              <span style="font-size:11px; font-weight:700; color:var(--text-primary);">NEW LABS:</span>
              ${!isAcked ? `
                <span class="flag-chip" style="background:#fee2e2; color:#b91c1c; font-size:10px; margin:0;" onclick="window.prAcknowledgeCritical()">K⁺ 6.8 🔴 CRITICAL</span>
              ` : `
                <span class="flag-chip" style="background:#f1f5f9; color:#64748b; font-size:10px; margin:0; text-decoration:line-through;">K⁺ 6.8 Acknowledged</span>
              `}
            </div>
          </div>

          <div class="form-group">
            <label>A — Assessment & Diagnoses *</label>
            <div class="diag-search-wrapper">
              <input type="text" class="form-control" placeholder="Search ICD-10 codes..." id="soap-diag" value="${window.patient360SelectedDiagnosisTemp}" oninput="window.prSearchDiagnosis(this.value)">
              ${searchOptionsHtml}
            </div>
            <div style="margin-top:2px;">
              ${diagChipsHtml}
            </div>
            <textarea class="form-control" rows="2" style="margin-top:6px;" placeholder="Clinical impression..." id="soap-a-impression" oninput="window.prValidateClinicalNote()">${window.soapAssessmentImpression}</textarea>
          </div>

          <div class="form-group">
            <label>P — Plan</label>
            <label class="chk-item" style="text-transform:none; font-weight:normal; letter-spacing:0; padding:0;">
              <input type="checkbox" id="soap-p-medcheck" ${window.soapPlanMedicationCheck ? 'checked' : ''} onchange="window.soapPlanMedicationCheck = this.checked"> Continue current medications
            </label>
            <textarea class="form-control" rows="2" placeholder="Plan details..." id="soap-p-details" oninput="window.soapPlanDetails = this.value">${window.soapPlanDetails}</textarea>
          </div>
        `;
      } else if (activeSubtab === 'Review Note') {
        formHtml = `
          <div class="form-group" style="margin-top:4px;">
            <label>Clinical Status & Response to Treatment *</label>
            <textarea class="form-control" rows="4" placeholder="Document patient condition, response to active therapies, and symptoms progression..." id="rev-status" oninput="window.prValidateClinicalNote()">${window.reviewStatus}</textarea>
          </div>
          <div class="form-group">
            <label>Current Diagnoses</label>
            <div style="margin-top:2px;">${diagChipsHtml}</div>
          </div>
          <div class="form-group">
            <label>Revised Care & Monitoring Plan *</label>
            <textarea class="form-control" rows="4" placeholder="Document changes to dosage, laboratory schedules, or ward management..." id="rev-plan" oninput="window.prValidateClinicalNote()">${window.reviewPlan}</textarea>
          </div>
        `;
      } else if (activeSubtab === 'Pre-op Note') {
        formHtml = `
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-top:4px;">
            <div class="form-group">
              <label>Pre-operative Diagnoses *</label>
              <input type="text" class="form-control" placeholder="e.g. Iron Deficiency Anemia secondary to AUB" id="pre-diag" value="${window.preopDiagnosis}" oninput="window.prValidateClinicalNote()">
            </div>
            <div class="form-group">
              <label>Planned Surgical Procedure *</label>
              <input type="text" class="form-control" placeholder="e.g. Diagnostic Hysteroscopy" id="pre-proc" value="${window.preopProcedure}" oninput="window.prValidateClinicalNote()">
            </div>
          </div>
          <div class="form-group">
            <label>Pre-operative Clearance Checklist</label>
            <div style="display:flex; gap:12px; font-size:12px;">
              <label><input type="checkbox" id="pre-fast" ${window.preopFasting ? 'checked' : ''} onchange="window.preopFasting = this.checked"> NBM / Fasting orders</label>
              <label><input type="checkbox" id="pre-site" ${window.preopSiteMarked ? 'checked' : ''} onchange="window.preopSiteMarked = this.checked"> Site marked</label>
              <label><input type="checkbox" id="pre-cons" ${window.preopConsent ? 'checked' : ''} onchange="window.preopConsent = this.checked"> Consent signed</label>
            </div>
          </div>
          <div class="form-group">
            <label>Anesthesia Clearance & Risk Notes *</label>
            <textarea class="form-control" rows="3" placeholder="Anesthetic risk classification and pre-op vitals clearance notes..." id="pre-clear" oninput="window.preopClearance = this.value; window.prValidateClinicalNote()">${window.preopClearance}</textarea>
          </div>
        `;
      } else if (activeSubtab === 'Post-op Note') {
        formHtml = `
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-top:4px;">
            <div class="form-group">
              <label>Post-operative Diagnoses *</label>
              <input type="text" class="form-control" placeholder="e.g. AUB secondary to endometrial polyp" id="post-diag" value="${window.postopDiagnosis}" oninput="window.prValidateClinicalNote()">
            </div>
            <div class="form-group">
              <label>Procedure Performed & Surgeon *</label>
              <input type="text" class="form-control" placeholder="e.g. Hysteroscopic Polypectomy - Dr. Priya Nair" id="post-proc" value="${window.postopProcedure}" oninput="window.prValidateClinicalNote()">
            </div>
          </div>
          <div class="form-group">
            <label>Intra-operative Findings & Complications *</label>
            <textarea class="form-control" rows="3" placeholder="Log surgical findings, blood loss, sample biopsy reports, or details..." id="post-intra" oninput="window.prValidateClinicalNote()">${window.postopIntraop}</textarea>
          </div>
          <div class="form-group">
            <label>Post-operative Recovery Plan & Care *</label>
            <textarea class="form-control" rows="3" placeholder="Log recovery plans, IV infusion rates, pain control meds, and vitals tracking..." id="post-plan" oninput="window.prValidateClinicalNote()">${window.postopPlan}</textarea>
          </div>
        `;
      } else if (activeSubtab === 'Referral Note') {
        formHtml = `
          <div class="form-group" style="margin-top:4px;">
            <label>Target Provider & Specialty Department *</label>
            <input type="text" class="form-control" placeholder="e.g. Dr. Sunil Kumar, Cardiology Whitefield Campus" id="ref-tgt" value="${window.referralTarget}" oninput="window.prValidateClinicalNote()">
          </div>
          <div class="form-group">
            <label>Urgency Level</label>
            <select class="form-control" style="height:30px;" onchange="window.referralUrgency = this.value">
              <option ${window.referralUrgency==='Routine'?'selected':''}>Routine</option>
              <option ${window.referralUrgency==='Urgent'?'selected':''}>Urgent</option>
              <option ${window.referralUrgency==='Stat'?'selected':''}>Stat</option>
            </select>
          </div>
          <div class="form-group">
            <label>Clinical Summary & Reason for Referral *</label>
            <textarea class="form-control" rows="5" placeholder="Summarize active diagnosis evaluation, low haemoglobin alerts, and reason for second opinion..." id="ref-sum" oninput="window.prValidateClinicalNote()">${window.referralSummary}</textarea>
          </div>
        `;
      } else if (activeSubtab === 'Discharge Note') {
        formHtml = `
          <div class="form-group" style="margin-top:4px;">
            <label>Primary Discharge Diagnosis & Comorbidities *</label>
            <input type="text" class="form-control" placeholder="e.g. Severe Microcytic Anemia, resolved post IV Iron sucrose" id="dis-diag" value="${window.dischargeDiagnosis}" oninput="window.prValidateClinicalNote()">
          </div>
          <div class="form-group">
            <label>Summary of Treatment & Hospital Course *</label>
            <textarea class="form-control" rows="3" placeholder="Describe clinical course from daycare registration to vitals stabilization..." id="dis-course" oninput="window.prValidateClinicalNote()">${window.dischargeCourse}</textarea>
          </div>
          <div class="form-group">
            <label>Follow-up Instructions & Appointments</label>
            <textarea class="form-control" rows="2" placeholder="e.g. Visit OPD Gynaecology in 1 week..." id="dis-instr" oninput="window.dischargeInstructions = this.value">${window.dischargeInstructions}</textarea>
          </div>
          <div class="form-group">
            <label>Discharge Medications List</label>
            <textarea class="form-control" rows="2" placeholder="e.g. Tab. Paracetamol 650mg, Tab. Folic Acid 5mg..." id="dis-meds" oninput="window.dischargeMeds = this.value">${window.dischargeMeds}</textarea>
          </div>
        `;
      }

      // Notes History Cards
      const historyCardsHtml = window.patient360Notes.map((n, idx) => {
        const isConsultant = n.type === "CONSULTANT RESPONSE";
        
        let detailsHtml = '';
        if (n.type === 'PROGRESS NOTE') {
          detailsHtml = `
            <div><b>S:</b> ${n.s}</div>
            <div><b>O:</b> ${n.o}</div>
            <div><b>A:</b> ${n.a}</div>
            ${n.p ? `<div><b>P:</b> ${n.p}</div>` : ''}
          `;
        } else if (n.type === 'REVIEW NOTE') {
          detailsHtml = `
            <div><b>Review Status:</b> ${n.reviewStatus}</div>
            <div><b>Revised Plan:</b> ${n.reviewPlan}</div>
          `;
        } else if (n.type === 'PRE-OP NOTE') {
          detailsHtml = `
            <div><b>Diagnosis:</b> ${n.preopDiagnosis}</div>
            <div><b>Procedure:</b> ${n.preopProcedure}</div>
            ${n.preopClearance ? `<div><b>Clearance notes:</b> ${n.preopClearance}</div>` : ''}
            <div style="font-size:10px; color:var(--text-muted); margin-top:2px;"><b>Checklist:</b> ${n.preopChecklist}</div>
          `;
        } else if (n.type === 'POST-OP NOTE') {
          detailsHtml = `
            <div><b>Post-op Diagnosis:</b> ${n.postopDiagnosis}</div>
            <div><b>Procedure performed:</b> ${n.postopProcedure}</div>
            <div><b>Intra-op Findings:</b> ${n.postopIntraop}</div>
            <div><b>Post-op Plan:</b> ${n.postopPlan}</div>
          `;
        } else if (n.type === 'REFERRAL NOTE') {
          detailsHtml = `
            <div><b>Referral to:</b> ${n.referralTarget} (Urgency: <span style="font-weight:700; color:var(--primary);">${n.referralUrgency}</span>)</div>
            <div><b>Clinical summary:</b> ${n.referralSummary}</div>
          `;
        } else if (n.type === 'DISCHARGE NOTE') {
          detailsHtml = `
            <div><b>Discharge Diagnosis:</b> ${n.dischargeDiagnosis}</div>
            <div><b>Hospital Course summary:</b> ${n.dischargeCourse}</div>
            ${n.dischargeInstructions ? `<div><b>Follow-up:</b> ${n.dischargeInstructions}</div>` : ''}
            ${n.dischargeMeds ? `<div><b>Meds:</b> ${n.dischargeMeds}</div>` : ''}
          `;
        } else {
          detailsHtml = `
            <div><b>S:</b> ${n.s || ''}</div>
            <div><b>O:</b> ${n.o || ''}</div>
            <div><b>A:</b> ${n.a || ''}</div>
          `;
        }

        return `
          <div class="note-card ${isConsultant ? 'note-card-consultant' : ''}">
            <div style="display:flex; justify-content:space-between; align-items:center; font-size:10px;">
              <span class="mono" style="color: ${isConsultant ? 'var(--primary)' : 'var(--text-muted)'}; font-weight:700;">${n.type}</span>
              <span class="mono" style="color:var(--text-muted);">${n.time}</span>
            </div>
            <strong style="font-size:12px; color:var(--text-primary);">${n.author} &bull; <span style="font-weight:500; color:var(--text-secondary);">${n.dept}</span></strong>
            <div style="font-size:12px; line-height:1.4; color:var(--text-secondary); margin-top:2px;">
              ${detailsHtml}
            </div>
            <div style="display:flex; gap:8px; justify-content:flex-end; font-size:11px; margin-top:4px;">
              <span style="color:var(--primary); cursor:pointer;" onclick="window.prShowToast('Editing note...')">Edit</span>
              <span style="color:var(--text-muted);">|</span>
              <span style="color:var(--primary); cursor:pointer;" onclick="window.prShowToast('Printing note...')">Print</span>
            </div>
          </div>
        `;
      }).join('');

      tabContentHtml = `
        <div class="clinical-notes-layout">
          <!-- Left SOAP Composer -->
          <div class="note-composer-panel">
            ${subTabsHtml}
            ${alertStripHtml}

            <!-- Dynamic composer form panel fields based on subtab selection -->
            <div id="clinical-note-form-wrapper">
              ${formHtml}
            </div>

            <div style="display:flex; justify-content:space-between; align-items:center; margin-top:8px;">
              <div style="display:flex; gap:8px;">
                <button class="btn-qa-primary" id="btn-sign-save" style="width:auto; height:34px; padding:0 16px;" onclick="window.prSignAndSave()" disabled>Sign & Save</button>
                <button class="btn-qa-secondary" style="height:34px;" onclick="window.prShowToast('Draft saved.')">Save Draft</button>
              </div>
              <a href="#" class="mono" style="color:var(--color-danger, #ef4444); font-size:12px;" onclick="window.prDiscardSOAP()">Discard</a>
            </div>
          </div>

          <!-- Right Note History -->
          <div class="note-history-panel">
            <span class="mono" style="font-size:9px; color:var(--text-muted); font-weight:700;">NOTE HISTORY</span>
            ${historyCardsHtml}
            <div style="text-align:center; margin-top:8px;">
              <a href="#" class="mono" style="font-size:11px; color:var(--primary);" onclick="window.prShowToast('No older notes available')">Load older notes</a>
            </div>
          </div>
        </div>
      `;
    } else if (tab === 'Vitals') {
      const vitalsRows = window.patient360Vitals;

      tabContentHtml = `
        <div>
          <span style="font-size:11px; color:var(--text-muted); font-weight:700; display:block; margin-bottom:4px;">LATEST VITALS</span>
          <div class="vitals-data-strip" style="margin-bottom:12px;">
            <span>BP: <b>${patient.vitals?.bp || '—'}</b></span>
            <span>HR: <b>${patient.vitals?.hr || '—'} bpm</b></span>
            <span>RR: <b>${patient.vitals?.rr || '—'}</b></span>
            <span>Temp: <b>${patient.vitals?.temp ? patient.vitals.temp + '°F' : '—'}</b></span>
            <span>SpO₂: <b>${patient.vitals?.spo2 ? patient.vitals.spo2 + '%' : '—'}</b></span>
            <span>Weight: <b>${patient.vitals?.weight ? patient.vitals.weight + ' kg' : '—'}</b></span>
          </div>

          <table class="p360-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Time</th>
                <th>BP</th>
                <th>HR</th>
                <th>RR</th>
                <th>Temp</th>
                <th>SpO₂</th>
                <th>Weight</th>
                <th>NEWS2</th>
                <th>Recorded By</th>
              </tr>
            </thead>
            <tbody>
              ${vitalsRows.map(vr => {
                const color = vr.news >= 7 ? '#ef4444' : vr.news >= 4 ? '#f59e0b' : '#10b981';
                return `
                  <tr>
                    <td class="mono">${vr.d}</td>
                    <td class="mono">${vr.t}</td>
                    <td class="mono">${vr.bp}</td>
                    <td class="mono">${vr.hr}</td>
                    <td class="mono">${vr.rr}</td>
                    <td class="mono">${vr.temp}</td>
                    <td class="mono">${vr.spo2}</td>
                    <td class="mono">${vr.wt}</td>
                    <td>
                      <span class="mono" style="font-weight:700; color:${color};">${vr.news}</span>
                    </td>
                    <td>${vr.by}</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      `;
    } else if (tab === 'Labs') {
      const realReports = (patient && patient.medicalReports) ? patient.medicalReports.map(r => {
        let val = r.result || "—";
        let unit = "—";
        let range = "—";
        let status = "Normal";
        
        const resLower = val.toLowerCase();
        if (resLower.includes("hb:") || resLower.includes("hemoglobin")) {
          unit = "g/dL";
          range = "12–16";
          const match = val.match(/hb:\s*([\d\.]+)/i) || val.match(/hemoglobin:\s*([\d\.]+)/i) || val.match(/: ([\d\.]+)/);
          if (match) {
            val = match[1];
            const floatVal = parseFloat(val);
            if (floatVal < 11.0) status = "Abnormal";
            if (floatVal < 5.0) status = "Critical";
          }
        } else if (resLower.includes("k+:") || resLower.includes("potassium")) {
          unit = "mEq/L";
          range = "3.5–5.0";
          const match = val.match(/k\+:\s*([\d\.]+)/i) || val.match(/potassium:\s*([\d\.]+)/i) || val.match(/: ([\d\.]+)/);
          if (match) {
            val = match[1];
            const floatVal = parseFloat(val);
            if (floatVal > 5.0 || floatVal < 3.5) status = "Abnormal";
            if (floatVal > 6.0 || floatVal < 2.5) status = "Critical";
          }
        } else {
          const parts = val.split(":");
          if (parts.length > 1) {
            val = parts[1].trim();
          }
        }
        
        return {
          d: new Date().toLocaleDateString('en-GB', { day:'2-digit', month:'short' }),
          test: r.testName,
          val: val,
          unit: unit,
          range: range,
          status: status,
          by: patient.primaryConsultant || "Pathologist"
        };
      }) : [];

      // Only use real reports — no hardcoded fallback rows
      const labs = realReports;

      tabContentHtml = `
        <div>
          <span style="font-size:11px; color:var(--text-muted); font-weight:700; display:block; margin-bottom:6px;">LAB RESULTS</span>
          <table class="p360-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Test</th>
                <th>Result</th>
                <th>Unit</th>
                <th>Reference Range</th>
                <th>Status</th>
                <th>Ordered By</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              ${labs.map(l => {
                const isCrit = l.status === 'Critical';
                const rowStyle = isCrit ? 'style="border-left:3px solid #ef4444; background:#fff5f5;"' : '';
                
                let badge = '';
                if (l.status === 'Critical') badge = '<span class="badge-type badge-ipd" style="background:#fee2e2; color:#ef4444;">CRITICAL</span>';
                else if (l.status === 'Abnormal') badge = '<span class="badge-type" style="background:#fef3c7; color:#d97706;">ABNORMAL</span>';
                else badge = '<span class="badge-type badge-status-active">NORMAL</span>';

                let action = '—';
                if (isCrit) {
                  action = !isAcked ? `
                    <button class="btn-ack" onclick="window.prAcknowledgeCritical()">Acknowledge</button>
                  ` : '<span style="color:var(--text-muted); font-size:11px;">Acknowledged</span>';
                }

                return `
                  <tr ${rowStyle}>
                    <td class="mono">${l.d}</td>
                    <td><b>${l.test}</b></td>
                    <td class="mono" style="font-weight:700;">${l.val}</td>
                    <td class="mono">${l.unit}</td>
                    <td class="mono">${l.range}</td>
                    <td>${badge}</td>
                    <td>${l.by}</td>
                    <td>${action}</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      `;
    } else if (tab === 'Imaging') {
      const realImaging = (patient && patient.medicalReports) ? patient.medicalReports.filter(r => {
        const testName = r.testName.toLowerCase();
        return testName.includes("x-ray") || testName.includes("xray") || testName.includes("ct") || testName.includes("mri") || testName.includes("usg") || testName.includes("ultrasound") || testName.includes("doppler") || testName.includes("mammo");
      }).map(r => {
        let modality = "X-Ray";
        const nameLower = r.testName.toLowerCase();
        if (nameLower.includes("ct") || nameLower.includes("computed")) modality = "CT Scan";
        else if (nameLower.includes("mri") || nameLower.includes("magnetic")) modality = "MRI";
        else if (nameLower.includes("usg") || nameLower.includes("ultrasound") || nameLower.includes("doppler")) modality = "Ultrasound";
        else if (nameLower.includes("mammo")) modality = "Mammography";

        return {
          d: new Date().toLocaleDateString('en-GB', { day:'2-digit', month:'short' }),
          study: r.testName,
          modality: modality,
          status: "Released",
          result: r.result,
          by: patient.primaryConsultant || "Radiologist"
        };
      }) : [];

      // Only use real imaging reports — no hardcoded fallback rows
      const imaging = realImaging;

      tabContentHtml = `
        <div>
          <span style="font-size:11px; color:var(--text-muted); font-weight:700; display:block; margin-bottom:6px;">RADIOLOGY / IMAGING</span>
          <table class="p360-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Study</th>
                <th>Modality</th>
                <th>Status</th>
                <th>Report</th>
                <th>Ordered By</th>
              </tr>
            </thead>
            <tbody>
              ${imaging.map(img => `
                <tr>
                  <td class="mono">${img.d}</td>
                  <td><b>${img.study}</b></td>
                  <td class="mono">${img.modality}</td>
                  <td><span class="badge-type badge-status-active">Released</span></td>
                  <td>
                    <button class="btn-qa-ghost" style="padding:2px 8px; font-size:10px;" onclick="alert('STUDY FINDINGS FOR: ${img.study}\\n\\n${(img.result || "Report pending verification").replace(/\\n/g, '\\\\n').replace(/\n/g, '\\\\n')}')">View Report</button>
                  </td>
                  <td>${img.by}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;
    } else if (tab === 'Medications') {
      const activeMeds = window.patient360Meds;

      // Build dispensing log from patient's actual prescriptions
      const dispenseLogs = (patient.prescriptions || []).filter(rx => rx.active).map(rx => ({
        d: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        drug: rx.name || rx.drug || rx.generic,
        qty: rx.dose || '—',
        batch: 'On record',
        by: patient.primaryConsultant || 'Pharmacist'
      }));

      tabContentHtml = `
        <div style="display:flex; flex-direction:column; gap:16px;">
          <!-- Active Medications -->
          <div>
            <span style="font-size:11px; color:var(--text-muted); font-weight:700; display:block; margin-bottom:6px;">ACTIVE PRESCRIPTIONS</span>
            <table class="p360-table">
              <thead>
                <tr>
                  <th>Drug</th>
                  <th>Route</th>
                  <th>Frequency</th>
                  <th>Duration</th>
                  <th>Status</th>
                  <th>Prescribed By</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                ${activeMeds.map(m => {
                  let badge = '';
                  if (m.status === 'Active') badge = '<span class="badge-type badge-status-active">Active</span>';
                  else if (m.status === 'PRN') badge = '<span class="badge-type" style="background:#eff6ff; color:#2563eb;">PRN</span>';
                  
                  return `
                    <tr>
                      <td><b>${m.drug}</b></td>
                      <td class="mono">${m.route}</td>
                      <td>${m.freq}</td>
                      <td class="mono">${m.dur}</td>
                      <td>${badge}</td>
                      <td>${m.author}</td>
                      <td>
                        ${role === 'Doctor' ? `
                          <button class="btn-qa-ghost" style="padding:2px 6px; font-size:10px; border-color:#ef4444; color:#ef4444;" onclick="window.prShowToast('Discontinued ${m.drug}')">Discontinue</button>
                        ` : '—'}
                      </td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>

          <!-- Dispensing Log (Only shows details) -->
          <div>
            <span style="font-size:11px; color:var(--text-muted); font-weight:700; display:block; margin-bottom:6px;">DISPENSING LOG</span>
            <table class="p360-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Drug</th>
                  <th>Qty Dispensed</th>
                  <th>Batch</th>
                  <th>Dispensed By</th>
                </tr>
              </thead>
              <tbody>
                ${dispenseLogs.map(l => `
                  <tr>
                    <td class="mono">${l.d}</td>
                    <td><b>${l.drug}</b></td>
                    <td class="mono">${l.qty}</td>
                    <td class="mono">${l.batch}</td>
                    <td>${l.by}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `;
    } else if (tab === 'Prescriptions') {
      const rxHistory = patient.prescriptionHistory || [];
      
      window.prViewPrescriptionSlip = function(rxId) {
        const rx = (patient.prescriptionHistory || []).find(r => r.rxId === rxId);
        if (!rx) return;
        
        const overlay = document.createElement('div');
        overlay.id = 'rx-view-overlay';
        overlay.style.cssText = 'position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(15,23,42,0.6); backdrop-filter:blur(4px); display:flex; align-items:center; justify-content:center; z-index:20000;';
        
        overlay.innerHTML = `
          <div class="card" style="width:650px; max-height:85vh; background:#fff; border-radius:12px; box-shadow:var(--shadow-lg); overflow:hidden; border: 1px solid var(--border-color);">
            <div class="card-header" style="display:flex; justify-content:space-between; align-items:center; background:#f8fafc; border-bottom:1px solid var(--border-color); padding: 1.25rem 1.5rem;">
              <span class="card-title" style="font-weight:700; color:#1e3a8a;">📋 Prescription Slip Details - ${rx.rxId}</span>
              <button onclick="document.getElementById('rx-view-overlay').remove()" class="btn-qa-ghost" style="border:none; background:none; font-size:1.2rem; cursor:pointer; padding:4px;">✕</button>
            </div>
            <div class="card-body" style="padding:1.5rem; overflow-y:auto; display:flex; flex-direction:column; gap:16px;">
              <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; background:#f1f5f9; padding:0.75rem; border-radius:8px; font-size:0.8rem;">
                <div>
                  <strong>Patient Name:</strong> ${patient.name}<br>
                  <strong>UHID:</strong> ${patient.uhid}<br>
                  <strong>Prescribed By:</strong> ${rx.doctor || 'Dr. Priya Nair'}
                </div>
                <div>
                  <strong>Prescription Date:</strong> ${rx.date || 'Today'}<br>
                  <strong>Diagnosis:</strong> ${rx.diagnosis || 'General Checkup'}
                </div>
              </div>

              <div>
                <h5 style="margin:0 0 8px 0; font-size:11px; font-weight:700; color:var(--text-secondary); text-transform:uppercase; border-bottom:1px solid var(--border-color); padding-bottom:4px;">💊 Medications (Rx)</h5>
                <table class="custom-table" style="width:100%; border-collapse:collapse; font-size:0.8rem;">
                  <thead>
                    <tr style="background:#f8fafc; border-bottom:1px solid var(--border-color);">
                      <th style="padding:6px; text-align:left;">S.No</th>
                      <th style="padding:6px; text-align:left;">Drug Name</th>
                      <th style="padding:6px; text-align:left;">Frequency</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${(rx.medicines || []).map((med, idx) => `
                      <tr style="border-bottom:1px solid #f1f5f9;">
                        <td style="padding:6px;">${idx + 1}</td>
                        <td style="padding:6px;"><strong>${med}</strong></td>
                        <td style="padding:6px;">${(rx.instructions && rx.instructions[idx]) || '1-0-1'}</td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>

              ${rx.findings && rx.findings.length > 0 ? `
                <div>
                  <h5 style="margin:0 0 6px 0; font-size:11px; font-weight:700; color:var(--text-secondary); text-transform:uppercase;">📝 Clinical Findings</h5>
                  <p style="font-size:0.8rem; color:#475569; margin:0; line-height:1.4;">${rx.findings.join(', ')}</p>
                </div>
              ` : ''}

              ${rx.investigations && rx.investigations.length > 0 ? `
                <div>
                  <h5 style="margin:0 0 6px 0; font-size:11px; font-weight:700; color:var(--text-secondary); text-transform:uppercase;">🧪 Investigations Ordered</h5>
                  <div style="display:flex; flex-wrap:wrap; gap:6px;">
                    ${rx.investigations.map(inv => `<span class="badge badge-info">${inv}</span>`).join('')}
                  </div>
                </div>
              ` : ''}
            </div>
            <div style="padding:1rem; border-top:1px solid var(--border-color); display:flex; justify-content:flex-end; gap:8px; background:#f8fafc;">
              <button class="btn btn-secondary" onclick="window.prShowToast('Prescription printed successfully'); document.getElementById('rx-view-overlay').remove()">🖨️ Print</button>
              <button class="btn btn-primary" onclick="document.getElementById('rx-view-overlay').remove()">Close</button>
            </div>
          </div>
        `;
        document.body.appendChild(overlay);
      };

      tabContentHtml = `
        <div style="display:flex; flex-direction:column; gap:16px;">
          <div>
            <span style="font-size:11px; color:var(--text-muted); font-weight:700; display:block; margin-bottom:6px;">PAST PRESCRIPTIONS</span>
            <table class="p360-table">
              <thead>
                <tr>
                  <th>Prescription ID</th>
                  <th>Date</th>
                  <th>Prescribed By</th>
                  <th>Diagnosis</th>
                  <th>Medicines</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                ${rxHistory.map((rx, idx) => `
                  <tr>
                    <td><b>${rx.rxId || 'RX-' + (1000 + idx)}</b></td>
                    <td class="mono">${rx.date || '—'}</td>
                    <td>${rx.doctor || 'Dr. Priya Nair'}</td>
                    <td>${rx.diagnosis || 'General Checkup'}</td>
                    <td>
                      <div style="display:flex; flex-wrap:wrap; gap:4px;">
                        ${(rx.medicines || []).map(m => `<span class="badge-type" style="background:#f1f5f9; color:#475569; font-size:10px; padding:2px 6px;">${m}</span>`).join('')}
                      </div>
                    </td>
                    <td>
                      <button class="btn-qa-ghost" style="padding:2px 8px; font-size:10px; border-radius:4px; height:auto; color:#2563eb; border-color:#2563eb; background:transparent;" onclick="window.prViewPrescriptionSlip('${rx.rxId}')">👁️ View Slip</button>
                    </td>
                  </tr>
                `).join('')}
                ${rxHistory.length === 0 ? `
                  <tr>
                    <td colspan="6" style="text-align:center; color:#94a3b8; padding:2rem;">No past prescriptions recorded for this patient.</td>
                  </tr>
                ` : ''}
              </tbody>
            </table>
          </div>
        </div>
      `;
    } else if (tab === 'Documents') {
      const docCategories = ["All", "Consent Forms", "Lab Reports", "Radiology Reports", "Insurance Docs", "Discharge Summary", "ID Proof"];
      // Build docs from patient's actual files array, seeded or uploaded
      const rawDocs = (patient.files && patient.files.length > 0) ? patient.files.map(f => ({
        name: f.name || 'Document',
        cat: f.cat || 'Documents',
        type: (f.name || '').toLowerCase().endsWith('.jpg') || (f.name || '').toLowerCase().endsWith('.png') ? 'Image' : 'PDF',
        date: f.date || new Date().toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' }),
        author: f.author || patient.primaryConsultant || 'System'
      })) : [];
      // Always include a consent form entry (standard for every patient)
      const docs = [
        { name: 'Registration & Consent Form', cat: 'Consent Forms', type: 'PDF', date: patient.admitted ? new Date(patient.admitted).toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' }) : 'On record', author: 'Front Desk' },
        ...rawDocs
      ];

      tabContentHtml = `
        <div>
          <!-- Header and upload -->
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
            <div style="display:flex; gap:6px; flex-wrap:wrap;">
              ${docCategories.map(cat => `
                <span class="subtab-item ${cat === 'All' ? 'active' : ''}" onclick="window.prShowToast('${cat} docs filtered')">${cat}</span>
              `).join('')}
            </div>
            <button class="btn-qa-primary" style="width:auto; height:28px; padding:0 12px; font-size:11px;" onclick="window.prShowToast('Upload Document modal opened')">+ Upload Document</button>
          </div>

          <!-- Document Grid -->
          <div class="doc-grid">
            ${docs.map(d => `
              <div class="doc-card">
                <span style="font-size:24px;">${d.type === 'PDF' ? '📄' : '🖼️'}</span>
                <strong style="font-size:12px; display:block; color:var(--text-primary); max-width:140px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${d.name}</strong>
                <span style="font-size:10px; color:var(--text-muted); display:block;">${d.author} &bull; <span class="mono">${d.date}</span></span>
                <button class="btn-qa-ghost" style="padding:2px 8px; font-size:10px; margin-top:4px;" onclick="window.prShowToast('Viewing ${d.name}...')">View</button>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    } else if (tab === 'Complaints') {
      // Seed complaints on patient object if none exist
      patient.complaints = patient.complaints || [
        { id: 'CMP-001', date: '02 Jul 2026', time: '11:30 AM', category: 'Staff Behaviour', description: 'Night duty nurse was unresponsive to call-bell for over 20 minutes despite patient requesting pain medication.', raisedBy: 'Patient Attender', status: 'Open', severity: 'High', resolution: '' },
        { id: 'CMP-002', date: '28 Jun 2026', time: '02:15 PM', category: 'Facility & Cleanliness', description: 'Bathroom in room was not cleaned for over 12 hours despite multiple requests to housekeeping.', raisedBy: 'Patient', status: 'Resolved', severity: 'Medium', resolution: 'Housekeeping supervisor was notified. Room was deep-cleaned and a cleaning schedule was put in place. Patient satisfied with resolution.' }
      ];

      var openCount = patient.complaints.filter(c => c.status === 'Open').length;
      var resolvedCount = patient.complaints.filter(c => c.status === 'Resolved').length;

      var severityColor = { High: { bg: '#fee2e2', text: '#b91c1c' }, Medium: { bg: '#fef9c3', text: '#854d0e' }, Low: { bg: '#dbeafe', text: '#1d4ed8' } };

      tabContentHtml = `
        <div style="display:flex; flex-direction:column; gap:14px;">

          <!-- Header -->
          <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">
            <div>
              <h5 style="margin:0; font-size:13px; font-weight:800; color:var(--text-primary);">🚩 Patient Complaints</h5>
              <p style="margin:2px 0 0; font-size:11px; color:var(--text-muted);">Track, manage and resolve complaints raised by patient or attenders.</p>
            </div>
            <div style="display:flex; align-items:center; gap:10px;">
              <span style="font-size:11px; background:#fee2e2; color:#b91c1c; padding:3px 10px; border-radius:20px; font-weight:700;">${openCount} Open</span>
              <span style="font-size:11px; background:#dcfce7; color:#15803d; padding:3px 10px; border-radius:20px; font-weight:700;">${resolvedCount} Resolved</span>
              <button class="btn-qa-primary" style="height:30px; padding:0 14px; font-size:11px; display:flex; align-items:center; gap:5px;" onclick="window.prOpenNewComplaintForm('${patient.uhid}')">
                + Add New Complaint
              </button>
            </div>
          </div>

          <!-- Complaint List -->
          <div style="display:flex; flex-direction:column; gap:10px;">
            ${patient.complaints.length === 0
              ? `<div style="text-align:center; padding:40px; color:var(--text-muted); font-size:12px;">No complaints filed for this patient.</div>`
              : patient.complaints.map((c, i) => {
                  var sev = severityColor[c.severity] || severityColor.Medium;
                  var isOpen = c.status === 'Open';
                  return `
                    <div style="background:#fff; border:1px solid ${isOpen ? '#fecaca' : '#bbf7d0'}; border-radius:10px; padding:14px 16px; display:flex; justify-content:space-between; align-items:flex-start; gap:12px; cursor:pointer; transition:box-shadow .15s;" onclick="window.prOpenComplaintDetail('${patient.uhid}', ${i})" title="Click to view details">
                      <div style="flex:1; min-width:0;">
                        <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap; margin-bottom:5px;">
                          <span style="font-size:11px; font-weight:800; color:var(--text-primary); font-family:monospace;">${c.id}</span>
                          <span style="font-size:10px; background:${sev.bg}; color:${sev.text}; padding:2px 8px; border-radius:20px; font-weight:700;">${c.severity}</span>
                          <span style="font-size:10px; background:${isOpen ? '#fee2e2' : '#dcfce7'}; color:${isOpen ? '#b91c1c' : '#15803d'}; padding:2px 8px; border-radius:20px; font-weight:700;">${c.status}</span>
                          <span style="font-size:10px; background:#f1f5f9; color:#475569; padding:2px 8px; border-radius:20px;">${c.category}</span>
                        </div>
                        <p style="margin:0 0 4px; font-size:12px; color:var(--text-secondary); line-height:1.4; overflow:hidden; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical;">${c.description}</p>
                        <span style="font-size:10px; color:var(--text-muted);">Raised by: <b>${c.raisedBy}</b> &bull; ${c.date} at ${c.time}</span>
                      </div>
                      <div style="display:flex; flex-direction:column; align-items:flex-end; gap:6px; flex-shrink:0;">
                        ${isOpen
                          ? `<span style="font-size:18px;">🔴</span><span style="font-size:10px; color:#b91c1c; font-weight:700;">Pending</span>`
                          : `<span style="font-size:18px;">✅</span><span style="font-size:10px; color:#15803d; font-weight:700;">Resolved</span>`
                        }
                        <span style="font-size:10px; color:#6366f1; font-weight:600;">View →</span>
                      </div>
                    </div>
                  `;
                }).join('')
            }
          </div>
        </div>
      `;
    } else if (tab === 'ATD') {
      const isMlc = patient.flags && patient.flags.includes('MLC');
      const transferLogs = patient.transferLogs || [];
      const hasDischarge = patient.dischargeStatus && patient.dischargeStatus !== 'Not Initiated';
      const dischargeOrder = patient.dischargeOrder || {};
      const clearances = patient.dischargeClearances || {};
      const isDischarging = patient.dischargeStatus === 'In Progress — Clearances Pending';

      tabContentHtml = `
        <div style="display:flex; flex-direction:column; gap:16px;">
          <!-- Admission Details -->
          <div>
            <span style="font-size:11px; color:var(--text-muted); font-weight:700; display:block; margin-bottom:6px;">ADMISSION DETAILS</span>
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px;" class="p360-card">
              <div class="p360-label-val"><span class="p360-label">Admission Type</span><span class="p360-val">${patient.type || 'IPD'}</span></div>
              <div class="p360-label-val"><span class="p360-label">Admitted</span><span class="p360-val mono">${patient.admissionDate || '24 Jun 2026 • 10:15 AM'}</span></div>
              <div class="p360-label-val"><span class="p360-label">Admitting Doc</span><span class="p360-val">${patient.primaryConsultant || 'Dr. Priya Nair'}</span></div>
              ${patient.status === 'Discharged'
                ? `<div class="p360-label-val"><span class="p360-label" style="color:#15803d; font-weight:700;">Date of Discharge</span><span class="p360-val mono" style="color:#15803d; font-weight:700;">${patient.dischargeDate || 'N/A'}</span></div>`
                : `<div class="p360-label-val"><span class="p360-label">Ward / Bed</span><span class="p360-val">${patient.bed ? patient.bed + ' (' + patient.ward + ')' : 'No Bed Assigned'}</span></div>`
              }
              <div class="p360-label-val"><span class="p360-label">Reason</span><span class="p360-val">${patient.provisionalDiagnosis || 'General evaluation'}</span></div>
              <div class="p360-label-val"><span class="p360-label">MLC Case</span><span class="p360-val">${isMlc ? '🚨 Medico-Legal Case' : 'No'}</span></div>
              <div class="p360-label-val"><span class="p360-label">Deposit Status</span><span class="p360-val mono">₹10,000 Verified</span></div>
            </div>
          </div>

          <!-- Transfer History -->
          <div>
            <div style="display:flex; justify-content:between; align-items:center; margin-bottom:6px;">
              <span style="font-size:11px; color:var(--text-muted); font-weight:700; flex:1;">TRANSFER HISTORY & LOGS</span>
              ${isDischarging ? '' : `
                <button class="ipd-bed-btn cursor-pointer" style="padding:2px 8px; font-size:10px;" onclick="window.showUniversalTransferWorkflow('${patient.uhid}', '${patient.bed}')">
                  Raise Relocation Request 🔄
                </button>
              `}
            </div>
            <div class="p360-card" style="display:flex; flex-direction:column; gap:6px;">
              ${transferLogs.map(log => `
                <div style="padding:6px; border-bottom:1px solid #f1f5f9; font-size:11px; text-align:left;">
                  <strong class="text-slate-800">${log.date}</strong> &bull; ${log.type} from <strong>${log.from}</strong> ➜ <strong>${log.to}</strong><br>
                  <span style="color:var(--text-muted);">Reason: ${log.reason} | Executed by: ${log.executedBy}</span>
                </div>
              `).join('') || `<div class="mono" style="color:var(--text-muted); font-size:11px; padding:6px;">No transfers recorded in this episode</div>`}
            </div>
          </div>

          <!-- Discharge Section -->
          <div>
            <span style="font-size:11px; color:var(--text-muted); font-weight:700; display:block; margin-bottom:6px;">DISCHARGE CHECKLIST & CLEARANCES</span>
            <div class="p360-card" style="display:flex; flex-direction:column; gap:8px;">
              ${hasDischarge ? `
                <div class="bg-blue-50 border border-blue-100 rounded-xl p-3 text-xs text-blue-800 mb-2 flex justify-between items-center">
                  <div>
                    <div class="font-bold">Discharge Order: ${dischargeOrder.type || 'Regular'}</div>
                    <div class="text-[10px]">Issued by ${dischargeOrder.followUpDoctor || 'Consultant'}</div>
                  </div>
                  <div class="px-2.5 py-0.5 bg-blue-600 text-white rounded-lg text-[9px] font-bold">${patient.dischargeStatus}</div>
                </div>

                <div class="flex flex-col gap-2">
                  <div class="flex justify-between items-center text-xs">
                    <span class="text-slate-600">Nursing Clearance:</span>
                    <span class="font-bold ${clearances.nursing?.cleared ? 'text-emerald-600' : 'text-red-500'}">
                      ${clearances.nursing?.cleared ? '🟢 Cleared by ' + clearances.nursing.clearedBy : '🔴 Pending'}
                    </span>
                  </div>
                  <div class="flex justify-between items-center text-xs">
                    <span class="text-slate-600">Billing Clearance:</span>
                    <span class="font-bold ${clearances.billing?.cleared ? 'text-emerald-600' : 'text-red-500'}">
                      ${clearances.billing?.cleared ? '🟢 Cleared by ' + clearances.billing.clearedBy : '🔴 Pending'}
                    </span>
                  </div>
                  <div class="flex justify-between items-center text-xs">
                    <span class="text-slate-600">Pharmacy Clearance:</span>
                    <span class="font-bold ${clearances.pharmacy?.cleared ? 'text-emerald-600' : 'text-red-500'}">
                      ${clearances.pharmacy?.cleared ? '🟢 Cleared by ' + clearances.pharmacy.clearedBy : '🔴 Pending'}
                    </span>
                  </div>
                  ${clearances.tpa ? `
                    <div class="flex justify-between items-center text-xs">
                      <span class="text-slate-600">TPA Clearance:</span>
                      <span class="font-bold ${clearances.tpa?.cleared ? 'text-emerald-600' : 'text-red-500'}">
                        ${clearances.tpa?.cleared ? '🟢 Cleared by ' + clearances.tpa.clearedBy : '🔴 Pending'}
                      </span>
                    </div>
                  ` : ''}
                  ${clearances.lab ? `
                    <div class="flex justify-between items-center text-xs">
                      <span class="text-slate-600">Lab Clearance:</span>
                      <span class="font-bold ${clearances.lab?.cleared ? 'text-emerald-600' : 'text-red-500'}">
                        ${clearances.lab?.cleared ? '🟢 Cleared by ' + clearances.lab.clearedBy : '🔴 Pending'}
                      </span>
                    </div>
                  ` : ''}
                </div>

                <div style="margin-top:12px; border-t: 1px solid #f1f5f9;" class="pt-3">
                  <button class="py-2 px-5 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 cursor-pointer text-xs" onclick="window.showUniversalDischargeWorkflow('${patient.uhid}')">
                    Open Department Clearance Checklist ➡️
                  </button>
                </div>
              ` : `
                <div class="text-xs text-slate-500 italic py-2">
                  No discharge order issued yet by the treating consultant.
                </div>
                
                <div style="margin-top:8px;">
                  <button class="py-2 px-5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg cursor-pointer text-xs" onclick="window.showUniversalDischargeWorkflow('${patient.uhid}')">
                    Initiate Discharge Order 🚪
                  </button>
                </div>
              `}
            </div>
          </div>
        </div>
      `;
    } else if (tab === 'Nursing Notes') {
      const noteHistoryHtml = window.nursingNotesHistory.map(n => `
        <div class="note-card">
          <div style="display:flex; justify-content:space-between; align-items:center; font-size:10px;">
            <span class="mono" style="color:var(--text-muted); font-weight:700;">${n.type} (${n.shift} Shift)</span>
            <span class="mono" style="color:var(--text-muted);">${n.time}</span>
          </div>
          <strong style="font-size:12px; color:var(--text-primary);">${n.author} &bull; <span style="font-weight:500; color:var(--text-secondary);">${n.desg}</span></strong>
          <div style="font-size:12px; line-height:1.4; color:var(--text-secondary); margin-top:2px;">
            <div><b>Observations:</b> ${n.obs}</div>
            <div><b>Actions:</b> ${n.actions}</div>
            <div><b>Next Instructions:</b> ${n.instructions}</div>
          </div>
        </div>
      `).join('');

      tabContentHtml = `
        <div class="clinical-notes-layout">
          <!-- Composer -->
          <div class="note-composer-panel">
            <div class="composer-subtabs">
              <span class="subtab-item active">Nursing Note</span>
              <span class="subtab-item" onclick="window.prShowToast('Handover Note loaded')">Handover Note</span>
              <span class="subtab-item" onclick="window.prShowToast('Incident Report loaded')">Incident Report</span>
            </div>

            <div class="form-group" style="margin-top:6px;">
              <label>Shift *</label>
              <select class="form-control" style="height:32px; padding:0 8px;" id="nn-shift" onchange="window.nursingShift = this.value">
                <option value="Morning" ${window.nursingShift === 'Morning' ? 'selected' : ''}>Morning</option>
                <option value="Evening" ${window.nursingShift === 'Evening' ? 'selected' : ''}>Evening</option>
                <option value="Night" ${window.nursingShift === 'Night' ? 'selected' : ''}>Night</option>
              </select>
            </div>

            <div class="form-group">
              <label>Observations *</label>
              <textarea class="form-control" rows="3" placeholder="Describe patient status, complaints, and observations..." id="nn-obs" oninput="window.nursingObservations = this.value; window.prValidateNursingNote()">${window.nursingObservations}</textarea>
            </div>

            <div class="form-group">
              <label>Actions Taken</label>
              <textarea class="form-control" rows="2" placeholder="Medications administered, dressings changed, diagnostics sent..." id="nn-actions" oninput="window.nursingActions = this.value">${window.nursingActions}</textarea>
            </div>

            <div class="form-group">
              <label>Next Shift Instructions</label>
              <textarea class="form-control" rows="2" placeholder="Instructions for incoming shift nurse..." id="nn-instructions" oninput="window.nursingInstructions = this.value">${window.nursingInstructions}</textarea>
            </div>

            <div style="margin-top:8px; display:flex; gap:8px;">
              <button class="btn-qa-primary" id="btn-nn-save" style="width:auto; height:34px; padding:0 16px;" onclick="window.prSaveNursingNote()" disabled>Sign & Submit</button>
              <button class="btn-qa-secondary" style="height:34px;" onclick="window.prShowToast('Nursing note draft saved.')">Save Draft</button>
            </div>
          </div>

          <!-- History -->
          <div class="note-history-panel">
            <span class="mono" style="font-size:9px; color:var(--text-muted); font-weight:700;">NURSING NOTE HISTORY</span>
            ${noteHistoryHtml}
          </div>
        </div>
      `;
    } else if (tab === 'Billing') {
      const patOrders = (state && state.orders) ? state.orders.filter(o => o.uhid === patient.uhid && o.type === 'Laboratory') : [];
      let labChargeRows = [];
      if (patOrders.length > 0) {
        const priceMaster = {};
        if (state && state.lisTestMaster) {
          state.lisTestMaster.forEach(t => {
            priceMaster[t.code.toUpperCase()] = t.price;
            priceMaster[t.name.toUpperCase()] = t.price;
          });
        }
        patOrders.forEach(o => {
          const nameUpper = o.name.toUpperCase();
          let price = 350; // default NABL CBC price
          if (priceMaster[nameUpper]) {
            price = priceMaster[nameUpper];
          } else {
            const foundKey = Object.keys(priceMaster).find(k => nameUpper.includes(k) || k.includes(nameUpper));
            if (foundKey) price = priceMaster[foundKey];
          }
          labChargeRows.push({
            cat: "Lab Charges",
            desc: `${o.name} (${o.status})`,
            qty: "1",
            rate: `₹${price.toLocaleString('en-IN')}`,
            amt: `₹${price.toLocaleString('en-IN')}`,
            numericAmt: price
          });
        });
      } else {
        labChargeRows.push({ cat: "Lab Charges", desc: "CBC, LFT, RFT, Electrolytes", qty: "1", rate: "₹4,200", amt: "₹4,200", numericAmt: 4200 });
      }

      const patRadOrders = (state && state.orders) ? state.orders.filter(o => o.uhid === patient.uhid && o.type === 'Radiology') : [];
      let radChargeRows = [];
      if (patRadOrders.length > 0) {
        const priceMaster = {};
        if (state && state.risTestMaster) {
          state.risTestMaster.forEach(t => {
            priceMaster[t.code.toUpperCase()] = t.price;
            priceMaster[t.name.toUpperCase()] = t.price;
          });
        }
        patRadOrders.forEach(o => {
          const nameUpper = o.name.toUpperCase();
          let price = 1200; // default USG price
          if (priceMaster[nameUpper]) {
            price = priceMaster[nameUpper];
          } else {
            const foundKey = Object.keys(priceMaster).find(k => nameUpper.includes(k) || k.includes(nameUpper));
            if (foundKey) price = priceMaster[foundKey];
          }
          radChargeRows.push({
            cat: "Radiology Charges",
            desc: `${o.name} (${o.status})`,
            qty: "1",
            rate: `₹${price.toLocaleString('en-IN')}`,
            amt: `₹${price.toLocaleString('en-IN')}`,
            numericAmt: price
          });
        });
      } else {
        radChargeRows.push({ cat: "Radiology Charges", desc: "USG Abdomen / Chest X-Ray", qty: "1", rate: "₹1,650", amt: "₹1,650", numericAmt: 1650 });
      }

      const chargeDetails = [
        { cat: "Bed Charges", desc: "Daycare Bay &bull; 1 day", qty: "1", rate: "₹3,500", amt: "₹3,500", numericAmt: 3500 },
        { cat: "Consultant Fee", desc: patient.primaryConsultant || "Dr. Priya Nair", qty: "1", rate: "₹2,000", amt: "₹2,000", numericAmt: 2000 },
        ...labChargeRows,
        ...radChargeRows,
        { cat: "Pharmacy", desc: "Various medications", qty: "—", rate: "—", amt: "₹1,800", numericAmt: 1800 },
        { cat: "Procedures", desc: "IV Infusion &bull; Normal Saline", qty: "2", rate: "₹500", amt: "₹1,000", numericAmt: 1000 }
      ];

      const realSubTotal = chargeDetails.reduce((sum, c) => sum + (c.numericAmt || 0), 0);
      const isTpa = (patient.payerType && patient.payerType !== 'Cash' && patient.payerType !== 'Self Pay');
      const tpaDeduction = isTpa ? realSubTotal : 0;
      const patientShare = isTpa ? 0 : realSubTotal;
      const outstanding = Math.max(0, patientShare - 10000);

      tabContentHtml = `
        <div style="display:flex; flex-direction:column; gap:16px;">
          <!-- Financial summary strip -->
          <div class="vitals-data-strip" style="background:#fffbeb; border:1px solid #fef3c7;">
            <span>Estimated Bill: <b class="mono">₹${realSubTotal.toLocaleString('en-IN')}</b></span>
            <span>TPA Covered: <b class="mono">₹${tpaDeduction.toLocaleString('en-IN')}</b></span>
            <span>Deposit Paid: <b class="mono">₹10,000</b></span>
            <span>Outstanding Share: <b class="mono" style="color:#d97706;">₹${outstanding.toLocaleString('en-IN')}</b></span>
          </div>

          <!-- Charge details table -->
          <div>
            <span style="font-size:11px; color:var(--text-muted); font-weight:700; display:block; margin-bottom:6px;">CHARGE ITEMS</span>
            <table class="p360-table">
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Description</th>
                  <th>Qty</th>
                  <th>Rate</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                ${chargeDetails.map(c => `
                  <tr>
                    <td><b>${c.cat}</b></td>
                    <td>${c.desc}</td>
                    <td class="mono">${c.qty}</td>
                    <td class="mono">${c.rate}</td>
                    <td class="mono" style="font-weight:600;">${c.amt}</td>
                  </tr>
                `).join('')}
                <tr style="background:var(--bg-surface-elevated, #f1f5f9); font-weight:700;">
                  <td colspan="4" style="text-align:right;">Sub-total:</td>
                  <td class="mono">₹${realSubTotal.toLocaleString('en-IN')}</td>
                </tr>
                <tr style="background:#ecfdf5; font-weight:700; color:#059669;">
                  <td colspan="4" style="text-align:right;">TPA Approved Deduction:</td>
                  <td class="mono">-₹${tpaDeduction.toLocaleString('en-IN')}</td>
                </tr>
                <tr style="background:var(--bg-surface-elevated, #f1f5f9); font-weight:700;">
                  <td colspan="4" style="text-align:right;">Patient Out-of-Pocket Share:</td>
                  <td class="mono">₹${patientShare.toLocaleString('en-IN')}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Payment history -->
          <div>
            <span style="font-size:11px; color:var(--text-muted); font-weight:700; display:block; margin-bottom:6px;">PAYMENT RECEIPTS</span>
            <table class="p360-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Mode</th>
                  <th>Amount</th>
                  <th>Receipt No</th>
                  <th>Collected By</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td class="mono">24 Jun 2026</td>
                  <td>Cash</td>
                  <td class="mono" style="font-weight:600;">₹10,000</td>
                  <td class="mono">REC-2026-00441</td>
                  <td>Billing Clerk Anand</td>
                </tr>
          <!-- Actions -->
          <div style="display:flex; gap:8px; margin-top:8px;">
            <button class="btn-qa-primary" style="width:auto; height:34px; padding:0 20px;" onclick="window.prTriggerAction('Collect Payment')">Collect Payment</button>
            <button class="btn-qa-secondary" style="height:34px;" onclick="window.prTriggerAction('Generate Final Bill')">Generate Final Bill</button>
          </div>
        </div>
      `;
    }

    function getModalContent(activeModal) {
      if (!activeModal) return { title: "", isWide: false, bodyHtml: "", footerHtml: "" };
      
      let title = "";
      let isWide = false;
      let bodyHtml = "";
      let footerHtml = "";
      
      const todayStr = new Date().toLocaleDateString('en-GB') + ", " + new Date().toLocaleTimeString('en-US', {hour: '2-digit', minute:'2-digit'});

      if (activeModal === 'Order Lab') {
        title = "ORDER LAB - Patient: " + patient.name;
        isWide = true;
        
        const labQuery = window.labSearchQuery.trim().toLowerCase();
        let labMatches = [];
        if (labQuery.length > 0) {
          labMatches = window.patient360LabCatalog.filter(t => t.name.toLowerCase().includes(labQuery));
        }

        const frequentlyOrderedLabs = ["Complete Blood Count (CBC)", "Liver Function Test (LFT)", "Renal Function Test (RFT)", "HbA1c", "Lipid Profile", "Thyroid Profile (T3, T4, TSH)", "Urine Routine & Microscopy", "Blood Culture & Sensitivity", "Dengue Serology (NS1, IgG, IgM)", "Vitamin D (25-Hydroxy)"];

        const selectedLabNames = window.p360SelectedLabs.map(t => t.name);
        let cdssLabAdvice = "Select tests to see recommendations.";
        if (selectedLabNames.includes("Complete Blood Count (CBC)")) {
          cdssLabAdvice = `
            <div style="background:#fef3c7; border:1px solid #fcd34d; border-radius:6px; padding:8px 12px; font-size:11px; color:#92400e;">
              💡 <b>Severe Anemia Alert (Hb: 8.2 g/dL)</b>: Ordering CBC confirmed. It is strongly recommended to check iron stores.
              <div style="margin-top:6px;"><button class="btn-qa-primary" style="font-size:10px; padding:2px 8px; background:#d97706;" onclick="window.prAddLabTest('Serum Ferritin')">+ Add Serum Ferritin</button></div>
            </div>
          `;
        }

        bodyHtml = `
          <div class="modal-cols">
            <div class="modal-left-col">
              <div class="form-group" style="position: relative;">
                <label>Search & Add Investigations</label>
                <input type="text" id="p360-lab-search-input" class="form-control" placeholder="Search lab tests, panels, profiles, or test codes..." value="${window.labSearchQuery}" oninput="window.prSearchLabQuery(this.value)">
                ${labMatches.length > 0 ? `
                  <div style="background:#ffffff; border:1px solid #cbd5e1; border-radius:6px; max-height:150px; overflow-y:auto; position:absolute; z-index:2100; width:100%; top:58px; left:0; box-shadow:0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1);">
                    ${labMatches.map(t => `<div style="padding:6px 12px; cursor:pointer; font-size:12px; border-bottom:1px solid #f1f5f9;" onclick="window.prAddLabTest('${t.name}')">${t.name}</div>`).join('')}
                  </div>
                ` : ''}
              </div>

              <div class="form-group">
                <label style="font-size:10px; color:var(--text-muted);">Frequently Ordered</label>
                <div class="chip-list">
                  ${frequentlyOrderedLabs.map(chip => `<span class="quick-chip" onclick="window.prAddLabTest('${chip}')">${chip.replace(' (CBC)','').replace(' (LFT)','').replace(' (RFT)','').replace(' (T3, T4, TSH)','').replace(' & Microscopy','').replace(' & Sensitivity','').replace(' (NS1, IgG, IgM)','').replace(' (25-Hydroxy)','')}</span>`).join('')}
                </div>
              </div>

              <div class="selected-box">
                <div class="selected-box-header">
                  <span>Selected Investigations (${window.p360SelectedLabs.length})</span>
                  <button style="background:transparent; border:none; color:var(--primary); font-size:11px; cursor:pointer;" onclick="window.prClearLabs()">Clear Selection</button>
                </div>
                <div class="selected-box-body">
                  ${window.p360SelectedLabs.length === 0 ? `
                    <div style="padding:40px; text-align:center; color:var(--text-muted); font-size:12px;">
                      No investigations selected. Search or click quick access chips to add.
                    </div>
                  ` : `
                    <table class="p360-table" style="font-size:11px;">
                      <thead>
                        <tr>
                          <th>Test Name</th>
                          <th>Sample</th>
                          <th style="width:90px;">Priority</th>
                          <th>Instructions</th>
                          <th style="width:40px; text-align:center;">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        ${window.p360SelectedLabs.map((t, idx) => `
                          <tr>
                            <td><b>${t.name}</b></td>
                            <td class="mono">${t.sample}</td>
                            <td>
                              <select class="form-control" style="font-size:11px; padding:2px 4px; height:24px;" onchange="window.prUpdateLabPriority(${idx}, this.value)">
                                <option ${t.priority==='Routine'?'selected':''}>Routine</option>
                                <option ${t.priority==='Urgent'?'selected':''}>Urgent</option>
                                <option ${t.priority==='Stat'?'selected':''}>Stat</option>
                              </select>
                            </td>
                            <td>
                              <input type="text" class="form-control" style="font-size:11px; padding:2px 6px; height:24px;" placeholder="e.g. Fasting..." value="${t.instructions}" oninput="window.prUpdateLabInstructions(${idx}, this.value)">
                            </td>
                            <td style="text-align:center;">
                              <span style="color:#ef4444; font-weight:bold; cursor:pointer;" onclick="window.prRemoveLabTest(${idx})">&times;</span>
                            </td>
                          </tr>
                        `).join('')}
                      </tbody>
                    </table>
                  `}
                </div>
                <div class="selected-box-footer">
                  <button class="btn-qa-secondary" style="height:24px; font-size:10px; padding:2px 8px;" onclick="window.prClearLabs()">Bulk Remove</button>
                </div>
              </div>
            </div>

            <div class="modal-right-col">
              <span style="font-size:11px; color:var(--text-muted); font-weight:700; display:block;">Order Specifications</span>
              
              <div class="form-group">
                <label>Ordering Physician</label>
                <select class="form-control" style="height:30px; font-size:12px; padding:0 8px;">
                  <option>Dr. Priya Nair (Gynaecology)</option>
                  <option>Dr. Ramesh Kumar (Cardiology)</option>
                </select>
              </div>

              <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px;">
                <div class="form-group">
                  <label>Priority (Order-wide)</label>
                  <select class="form-control" style="height:30px; font-size:12px; padding:0 8px;">
                    <option>Routine</option>
                    <option>Urgent</option>
                    <option>Stat</option>
                  </select>
                </div>
                <div class="form-group">
                  <label>Collection Location</label>
                  <select class="form-control" style="height:30px; font-size:12px; padding:0 8px;">
                    <option>Daycare</option>
                    <option>IPD Ward</option>
                    <option>OPD Clinic</option>
                    <option>Emergency</option>
                  </select>
                </div>
              </div>

              <div class="form-group">
                <label>Collection Date & Time</label>
                <input type="text" class="form-control" style="height:30px; font-size:12px;" value="${todayStr}">
              </div>

              <div class="form-group">
                <label>Fasting Required?</label>
                <div style="display:flex; gap:12px; font-size:12px;">
                  <label><input type="radio" name="fasting" value="yes"> Yes</label>
                  <label><input type="radio" name="fasting" value="no" checked> No</label>
                </div>
              </div>

              <div class="form-group">
                <label>Clinical Notes / Diagnosis</label>
                <textarea class="form-control" rows="2" style="font-size:12px;" placeholder="Evaluation of anemia / AUB symptoms..."></textarea>
              </div>

              <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:10px;">
                <span style="font-size:10px; color:var(--text-muted); font-weight:700; display:block; margin-bottom:4px;">CLINICAL DECISION SUPPORT (CDSS)</span>
                ${cdssLabAdvice}
                <div style="font-size:10px; color:var(--text-secondary); margin-top:6px; border-top:1px solid #e2e8f0; padding-top:4px;">
                  <b>Latest values:</b> Hb 8.2 g/dL &bull; K⁺ 6.8 mEq/L (Critical)
                </div>
              </div>
            </div>
          </div>
        `;

        footerHtml = `
          <button class="btn-qa-secondary" style="height:34px;" onclick="window.prSaveDraftLabOrder()">Save Draft</button>
          <button class="btn-qa-secondary" style="height:34px;" onclick="window.prPrintLabRequisition()">Print Req.</button>
          <button class="btn-qa-secondary" style="height:34px;" onclick="window.prPlaceLabOrder()">Send to Lab</button>
          <button class="btn-qa-primary" style="height:34px; width:auto; background:var(--primary);" onclick="window.prPlaceLabOrder()">Place Lab Order</button>
        `;
      }
      else if (activeModal === 'Radiology') {
        title = "🩻 RADIOLOGY ORDER - Patient: " + patient.name;
        isWide = true;

        const radQuery = window.radSearchQuery.trim().toLowerCase();
        let radMatches = [];
        if (radQuery.length > 0) {
          radMatches = window.patient360RadiologyCatalog.filter(t => t.name.toLowerCase().includes(radQuery));
        }

        const frequentlyOrderedRad = ["Chest X-Ray PA View", "MRI Brain Contrast", "CT Abdomen & Pelvis", "USG Whole Abdomen", "X-Ray Knee AP/LAT", "MRI Lumbar Spine", "CT Chest HRCT"];

        bodyHtml = `
          <div class="modal-cols">
            <div class="modal-left-col">
              <div class="form-group" style="position: relative;">
                <label>Search & Add Imaging Studies</label>
                <input type="text" id="p360-rad-search-input" class="form-control" placeholder="Search radiology tests, body sites, or codes..." value="${window.radSearchQuery}" oninput="window.prSearchRadQuery(this.value)">
                ${radMatches.length > 0 ? `
                  <div style="background:#ffffff; border:1px solid #cbd5e1; border-radius:6px; max-height:150px; overflow-y:auto; position:absolute; z-index:2100; width:100%; top:58px; left:0; box-shadow:0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1);">
                    ${radMatches.map(t => `<div style="padding:6px 12px; cursor:pointer; font-size:12px; border-bottom:1px solid #f1f5f9;" onclick="window.prAddRadiologyTest('${t.name}')">${t.name}</div>`).join('')}
                  </div>
                ` : ''}
              </div>

              <div class="form-group">
                <label style="font-size:10px; color:var(--text-muted);">Frequently Ordered</label>
                <div class="chip-list">
                  ${frequentlyOrderedRad.map(chip => `<span class="quick-chip" onclick="window.prAddRadiologyTest('${chip}')">${chip}</span>`).join('')}
                </div>
              </div>

              <div class="selected-box">
                <div class="selected-box-header">
                  <span>Selected Studies (${window.p360SelectedRadiology.length})</span>
                  <button style="background:transparent; border:none; color:var(--primary); font-size:11px; cursor:pointer;" onclick="window.prClearRadiology()">Clear Selection</button>
                </div>
                <div class="selected-box-body">
                  ${window.p360SelectedRadiology.length === 0 ? `
                    <div style="padding:40px; text-align:center; color:var(--text-muted); font-size:12px;">
                      No radiology studies selected. Search or click quick access chips to add.
                    </div>
                  ` : `
                    <table class="p360-table" style="font-size:11px;">
                      <thead>
                        <tr>
                          <th>Study Name</th>
                          <th>Modality</th>
                          <th style="width:90px;">Priority</th>
                          <th>Instructions</th>
                          <th style="width:40px; text-align:center;">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        ${window.p360SelectedRadiology.map((t, idx) => `
                          <tr>
                            <td><b>${t.name}</b></td>
                            <td class="mono">${t.modality}</td>
                            <td>
                              <select class="form-control" style="font-size:11px; padding:2px 4px; height:24px;" onchange="window.prUpdateRadPriority(${idx}, this.value)">
                                <option ${t.priority==='Routine'?'selected':''}>Routine</option>
                                <option ${t.priority==='Urgent'?'selected':''}>Urgent</option>
                                <option ${t.priority==='Stat'?'selected':''}>Stat</option>
                              </select>
                            </td>
                            <td>
                              <input type="text" class="form-control" style="font-size:11px; padding:2px 6px; height:24px;" placeholder="e.g. Fasting..." value="${t.instructions}" oninput="window.prUpdateRadInstructions(${idx}, this.value)">
                            </td>
                            <td style="text-align:center;">
                              <span style="color:#ef4444; font-weight:bold; cursor:pointer;" onclick="window.prRemoveRadiologyTest(${idx})">&times;</span>
                            </td>
                          </tr>
                        `).join('')}
                      </tbody>
                    </table>
                  `}
                </div>
                <div class="selected-box-footer">
                  <button class="btn-qa-secondary" style="height:24px; font-size:10px; padding:2px 8px;" onclick="window.prClearRadiology()">Bulk Remove</button>
                </div>
              </div>
            </div>

            <div class="modal-right-col">
              <span style="font-size:11px; color:var(--text-muted); font-weight:700; display:block;">Order Specifications</span>
              
              <div class="form-group">
                <label>Ordering Physician</label>
                <select class="form-control" style="height:30px; font-size:12px; padding:0 8px;">
                  <option>Dr. Priya Nair (Gynaecology)</option>
                  <option>Dr. Ramesh Kumar (Cardiology)</option>
                </select>
              </div>

              <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px;">
                <div class="form-group">
                  <label>Priority (Order-wide)</label>
                  <select class="form-control" style="height:30px; font-size:12px; padding:0 8px;">
                    <option>Routine</option>
                    <option>Urgent</option>
                    <option>Stat</option>
                  </select>
                </div>
                <div class="form-group">
                  <label>Modality Room / Unit</label>
                  <select class="form-control" style="height:30px; font-size:12px; padding:0 8px;">
                    <option>MRI Suite - Room 1</option>
                    <option>CT Suite - Room 2</option>
                    <option>USG Room - 3</option>
                    <option>X-Ray Room - 4</option>
                  </select>
                </div>
              </div>

              <div class="form-group">
                <label>Scheduled Date & Time</label>
                <input type="text" class="form-control" style="height:30px; font-size:12px;" value="${todayStr}">
              </div>

              <div class="form-group">
                <label>Contrast Requirement?</label>
                <div style="display:flex; gap:12px; font-size:12px;">
                  <label><input type="radio" name="contrast" value="yes"> Yes (CECT/CEMRI)</label>
                  <label><input type="radio" name="contrast" value="no" checked> No (Non-Contrast)</label>
                </div>
              </div>

              <div class="form-group">
                <label>Clinical Notes / Diagnosis</label>
                <textarea class="form-control" rows="2" style="font-size:12px;" placeholder="Evaluation of radiculopathy / herniation..."></textarea>
              </div>
            </div>
          </div>
        `;

        footerHtml = `
          <button class="btn-qa-secondary" style="height:34px;" onclick="window.prSaveDraftRadiologyOrder()">Save Draft</button>
          <button class="btn-qa-secondary" style="height:34px;" onclick="window.prPrintRadiologyRequisition()">Print Req.</button>
          <button class="btn-qa-secondary" style="height:34px;" onclick="window.prPlaceRadiologyOrder()">Send to PACS</button>
          <button class="btn-qa-primary" style="height:34px; width:auto; background:var(--primary);" onclick="window.prPlaceRadiologyOrder()">Place Radiology Order</button>
        `;
      }
      else if (activeModal === 'Prescribe') {
        title = "💊 PRESCRIBE MEDICATION - Patient: " + patient.name;
        isWide = true;

        const medQuery = window.medSearchQuery.trim().toLowerCase();
        let medMatches = [];
        if (medQuery.length > 0) {
          medMatches = window.patient360MedicineCatalog.filter(t => t.name.toLowerCase().includes(medQuery));
        }

        const frequentlyOrderedMeds = ["Tab. Pantoprazole 40mg", "Tab. Paracetamol 650mg", "Tab. Amoxicillin 500mg", "Tab. Montelukast 10mg", "Syp. Cremaffin 150ml", "Tab. Ferrous Sulphate 200mg", "Tab. Amlodipine 5mg", "Tab. Metformin 500mg"];

        const selectedMedNames = window.p360SelectedMeds.map(m => m.name);
        let cdssMedAdvice = "Select medicines to see safety recommendations.";
        if (selectedMedNames.some(n => n.includes("Ferrous Sulphate"))) {
          cdssMedAdvice = `
            <div style="background:#eff6ff; border:1px solid #bfdbfe; border-radius:6px; padding:8px 12px; font-size:11px; color:#1e40af;">
              💡 <b>Absorption Alert</b>: Oral Iron absorption increases when taken with Vitamin C. Consider prescribing Vitamin C/Multivitamins.
            </div>
          `;
        }

        bodyHtml = `
          <div class="modal-cols">
            <div class="modal-left-col">
              <div class="form-group" style="position: relative;">
                <label>Search & Add Medicine</label>
                <input type="text" id="p360-med-search-input" class="form-control" placeholder="Search pharmacy catalog, brands, generics, or codes..." value="${window.medSearchQuery}" oninput="window.prSearchMedQuery(this.value)">
                ${medMatches.length > 0 ? `
                  <div style="background:#ffffff; border:1px solid #cbd5e1; border-radius:6px; max-height:150px; overflow-y:auto; position:absolute; z-index:2100; width:100%; top:58px; left:0; box-shadow:0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1);">
                    ${medMatches.map(m => {
                      return `<div style="padding:6px 12px; cursor:pointer; font-size:12px; border-bottom:1px solid #f1f5f9; display:flex; justify-content:space-between;" onclick="window.prAddMedPrescription('${m.name}')">
                        <span>${m.name}</span>
                        ${m.stock ? '<span style="color:#059669; font-size:10px;">In Stock</span>' : '<span style="color:#ef4444; font-size:10px;">Out of Stock</span>'}
                      </div>`;
                    }).join('')}
                  </div>
                ` : ''}
              </div>

              <div class="form-group">
                <label style="font-size:10px; color:var(--text-muted);">Frequently Prescribed</label>
                <div class="chip-list">
                  ${frequentlyOrderedMeds.map(chip => `<span class="quick-chip" onclick="window.prAddMedPrescription('${chip}')">${chip.replace('Tab. ','').replace('Syp. ','')}</span>`).join('')}
                </div>
              </div>

              <div class="selected-box">
                <div class="selected-box-header">
                  <span>Selected Medications (${window.p360SelectedMeds.length})</span>
                  <button style="background:transparent; border:none; color:var(--primary); font-size:11px; cursor:pointer;" onclick="window.prClearMeds()">Clear Selection</button>
                </div>
                <div class="selected-box-body">
                  ${window.p360SelectedMeds.length === 0 ? `
                    <div style="padding:40px; text-align:center; color:var(--text-muted); font-size:12px;">
                      No medications selected. Search or click quick access chips to add.
                    </div>
                  ` : `
                    <table class="p360-table" style="font-size:11px;">
                      <thead>
                        <tr>
                          <th>Drug Name</th>
                          <th style="width:110px;">Frequency</th>
                          <th style="width:90px;">Duration</th>
                          <th>Instructions</th>
                          <th style="width:20px; text-align:center;">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        ${window.p360SelectedMeds.map((m, idx) => {
                          const routeLabel = m.route || "Oral";
                          return `
                            <tr style="${!m.stock ? 'background:#fef2f2; border-left:3px solid #ef4444;' : ''}">
                              <td>
                                <b>${m.name}</b>
                                <div style="font-size:9px; color:var(--text-muted); margin-top:2px;">Route: ${routeLabel}</div>
                                ${!m.stock ? `
                                  <div style="color:#ef4444; font-size:9px; font-weight:700; margin-top:4px;">
                                    ⚠️ OUT OF STOCK. 
                                    ${m.alt ? `<a href="#" onclick="window.prUseAlternativeInSelected(${idx}, '${m.alt}'); return false;" style="text-decoration:underline; color:#2563eb;">Use Alternative: ${m.alt}</a>` : 'Contact Pharmacy.'}
                                  </div>
                                ` : ''}
                              </td>
                              <td>
                                <select class="form-control" style="font-size:11px; padding:2px 4px; height:24px;" onchange="window.prUpdateMedFreq(${idx}, this.value)">
                                  <option ${m.freq==='Once daily'?'selected':''}>Once daily</option>
                                  <option ${m.freq==='Twice daily'?'selected':''}>Twice daily</option>
                                  <option ${m.freq==='Three times daily'?'selected':''}>Three times daily</option>
                                  <option ${m.freq==='Four times daily'?'selected':''}>Four times daily</option>
                                  <option ${m.freq==='As needed (PRN)'?'selected':''}>As needed (PRN)</option>
                                </select>
                              </td>
                              <td>
                                <select class="form-control" style="font-size:11px; padding:2px 4px; height:24px;" onchange="window.prUpdateMedDur(${idx}, this.value)">
                                  <option ${m.dur==='1 day'?'selected':''}>1 day</option>
                                  <option ${m.dur==='3 days'?'selected':''}>3 days</option>
                                  <option ${m.dur==='5 days'?'selected':''}>5 days</option>
                                  <option ${m.dur==='7 days'?'selected':''}>7 days</option>
                                  <option ${m.dur==='10 days'?'selected':''}>10 days</option>
                                  <option ${m.dur==='14 days'?'selected':''}>14 days</option>
                                </select>
                              </td>
                              <td>
                                <input type="text" class="form-control" style="font-size:11px; padding:2px 6px; height:24px;" placeholder="e.g. After food..." value="${m.instructions}" oninput="window.prUpdateMedInstructions(${idx}, this.value)">
                              </td>
                              <td style="text-align:center;">
                                <span style="color:#ef4444; font-weight:bold; cursor:pointer;" onclick="window.prRemoveMedPrescription(${idx})">&times;</span>
                              </td>
                            </tr>
                          `;
                        }).join('')}
                      </tbody>
                    </table>
                  `}
                </div>
                <div class="selected-box-footer">
                  <button class="btn-qa-secondary" style="height:24px; font-size:10px; padding:2px 8px;" onclick="window.prClearMeds()">Bulk Remove</button>
                </div>
              </div>
            </div>

            <div class="modal-right-col">
              <span style="font-size:11px; color:var(--text-muted); font-weight:700; display:block;">Order Specifications</span>
              
              <div class="form-group">
                <label>Ordering Physician</label>
                <select class="form-control" style="height:30px; font-size:12px; padding:0 8px;">
                  <option>Dr. Priya Nair (Gynaecology)</option>
                  <option>Dr. Ramesh Kumar (Cardiology)</option>
                </select>
              </div>

              <div class="form-group">
                <label>Start Date</label>
                <input type="text" class="form-control" style="height:30px; font-size:12px;" value="Immediate (Today)">
              </div>

              <div class="form-group">
                <label>Dispensing Pharmacy Location</label>
                <select class="form-control" style="height:30px; font-size:12px; padding:0 8px;">
                  <option>Bangalore Campus Pharmacy</option>
                  <option>OPD Pharmacy Counter 1</option>
                </select>
              </div>

              <div class="form-group">
                <label>Clinical Notes / Indication</label>
                <textarea class="form-control" rows="2" style="font-size:12px;" placeholder="Iron deficiency anemia management..."></textarea>
              </div>

              <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:10px;">
                <span style="font-size:10px; color:var(--text-muted); font-weight:700; display:block; margin-bottom:4px;">CLINICAL DECISION SUPPORT (CDSS)</span>
                ${cdssMedAdvice}
                <div style="font-size:10px; color:var(--text-secondary); margin-top:6px; border-top:1px solid #e2e8f0; padding-top:4px;">
                  <b>Allergies:</b> None recorded.
                </div>
              </div>
            </div>
          </div>
        `;

        footerHtml = `
          <button class="btn-qa-secondary" style="height:34px;" onclick="window.prSaveDraftPrescriptionOrder()">Save Draft</button>
          <button class="btn-qa-secondary" style="height:34px;" onclick="window.prPrintPrescriptionRequisition()">Print Req.</button>
          <button class="btn-qa-secondary" style="height:34px;" onclick="window.prPlacePrescriptionOrder()">Send to Pharmacy</button>
          <button class="btn-qa-primary" style="height:34px; width:auto; background:var(--primary);" onclick="window.prPlacePrescriptionOrder()">Place Prescription Order</button>
        `;
      }
      else if (activeModal === 'Record Vitals') {
        title = "📊 Record Vitals Log";
        isWide = false;
        bodyHtml = `
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
            <div class="form-group">
              <label>Systolic BP (mmHg) *</label>
              <input type="number" class="form-control" id="mv-sbp" value="120">
            </div>
            <div class="form-group">
              <label>Diastolic BP (mmHg) *</label>
              <input type="number" class="form-control" id="mv-dbp" value="80">
            </div>
            <div class="form-group">
              <label>Heart Rate (bpm) *</label>
              <input type="number" class="form-control" id="mv-hr" value="72">
            </div>
            <div class="form-group">
              <label>Respiratory Rate (bpm) *</label>
              <input type="number" class="form-control" id="mv-rr" value="16">
            </div>
            <div class="form-group">
              <label>Temperature (°F) *</label>
              <input type="number" step="0.1" class="form-control" id="mv-temp" value="98.6">
            </div>
            <div class="form-group">
              <label>SpO₂ (%) *</label>
              <input type="number" class="form-control" id="mv-spo2" value="99">
            </div>
          </div>
        `;
        footerHtml = `
          <button class="btn-qa-secondary" style="height:32px; font-size:11px;" onclick="window.prCloseModal()">Cancel</button>
          <button class="btn-qa-primary" style="height:32px; font-size:11px; width:auto;" onclick="window.prSaveModalVitals()">Save Vitals</button>
        `;
      }
      else if (activeModal === 'Write Note') {
        title = "📝 Write SOAP Progress Note";
        isWide = false;
        bodyHtml = `
          <div class="form-group">
            <label>S — Subjective *</label>
            <textarea class="form-control" id="ms-s" rows="3" placeholder="Chief complaints and patient descriptions..."></textarea>
          </div>
          <div class="form-group">
            <label>O — Objective</label>
            <textarea class="form-control" id="ms-o" rows="2" placeholder="Clinical exam findings..."></textarea>
          </div>
          <div class="form-group">
            <label>A — Assessment & Clinical Diagnosis *</label>
            <textarea class="form-control" id="ms-a" rows="2" placeholder="Primary evaluation assessment..."></textarea>
          </div>
        `;
        footerHtml = `
          <button class="btn-qa-secondary" style="height:32px; font-size:11px;" onclick="window.prCloseModal()">Cancel</button>
          <button class="btn-qa-primary" style="height:32px; font-size:11px; width:auto;" onclick="window.prSaveModalSOAP()">Save Note</button>
        `;
      }
      else if (activeModal === 'Nursing Note') {
        title = "📝 Nursing Observation Shift Log";
        isWide = false;
        bodyHtml = `
          <div class="form-group">
            <label>Shift Observations *</label>
            <textarea class="form-control" rows="3" placeholder="Log shift findings..."></textarea>
          </div>
          <div class="form-group">
            <label>Actions Performed</label>
            <textarea class="form-control" rows="2" placeholder="e.g. Dressings changed, IV flushed..."></textarea>
          </div>
        `;
        footerHtml = `
          <button class="btn-qa-secondary" style="height:32px; font-size:11px;" onclick="window.prCloseModal()">Cancel</button>
          <button class="btn-qa-primary" style="height:32px; font-size:11px; width:auto;" onclick="window.prShowToast('Nursing shift log submitted'); window.prCloseModal()">Submit Log</button>
        `;
      }
      else if (activeModal === 'Discharge') {
        title = "🚪 Initiate Patient Discharge";
        isWide = false;
        bodyHtml = `
          <span style="font-size:11px; color:var(--text-muted); font-weight:700; display:block; margin-bottom:4px;">VERIFY CHECKLIST</span>
          <div style="display:flex; flex-direction:column; gap:6px;">
            <label class="chk-item"><input type="checkbox" checked disabled> Doctor Clearance Order Signed</label>
            <label class="chk-item"><input type="checkbox" checked> Nursing Handover Review Complete</label>
            <label class="chk-item"><input type="checkbox" checked> Pharmacy Returns Handed Over</label>
            <label class="chk-item"><input type="checkbox" checked> Billing Interim Clearance Done</label>
          </div>
        `;
        footerHtml = `
          <button class="btn-qa-secondary" style="height:32px; font-size:11px;" onclick="window.prCloseModal()">Cancel</button>
          <button class="btn-qa-primary" style="height:32px; font-size:11px; width:auto; background:#10b981;" onclick="window.prShowToast('Discharge process initiated successfully'); window.prCloseModal()">Confirm Discharge</button>
        `;
      }
      else if (activeModal === 'Transfer') {
        title = "↔ Transfer Patient Bed / Ward";
        isWide = false;
        bodyHtml = `
          <div class="form-group">
            <label>Target Ward *</label>
            <select class="form-control">
              <option>General Female Ward</option>
              <option>ICU Bay 2</option>
              <option>Deluxe Suite</option>
              <option>Daycare Ward (Current)</option>
            </select>
          </div>
          <div class="form-group">
            <label>Target Bed Number</label>
            <input type="text" class="form-control" value="F-102">
          </div>
        `;
        footerHtml = `
          <button class="btn-qa-secondary" style="height:32px; font-size:11px;" onclick="window.prCloseModal()">Cancel</button>
          <button class="btn-qa-primary" style="height:32px; font-size:11px; width:auto;" onclick="window.prShowToast('Transfer request submitted'); window.prCloseModal()">Initiate Transfer</button>
        `;
      }
      else if (activeModal === 'Order Placed') {
        const details = window.p360PlacedOrderDetails || { type: "Order", patientName: "", uhid: "", items: [] };
        title = `✓ ${details.type.toUpperCase()} ORDER PLACED`;
        isWide = false;
        const bulletList = details.items.map(item => `<li style="margin-bottom:6px; font-size:12px; color:var(--text-primary); list-style-type:disc;"><b>${item}</b></li>`).join('');
        bodyHtml = `
          <div style="padding:10px 0; text-align:center;">
            <div style="font-size:40px; color:#10b981; margin-bottom:12px;">✓</div>
            <h4 style="margin:0 0 8px 0; color:#10b981; font-size:16px;">Success!</h4>
            <p style="font-size:13px; color:var(--text-secondary); margin:0 0 16px 0;">
              The ${details.type.toLowerCase()} request has been successfully spooled and synchronized.
            </p>
          </div>
          <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:16px; margin-bottom:16px; text-align:left;">
            <div style="font-size:11px; color:var(--text-muted); font-weight:700; margin-bottom:8px; letter-spacing:0.5px;">PATIENT DETAILS</div>
            <div style="font-size:13px; margin-bottom:4px;">Patient Name: <b>${details.patientName}</b></div>
            <div style="font-size:13px; margin-bottom:12px;">UHID: <span class="mono"><b>${details.uhid}</b></span></div>
            
            <div style="font-size:11px; color:var(--text-muted); font-weight:700; margin-bottom:8px; letter-spacing:0.5px;">REQUESTED ITEMS</div>
            <ul style="margin:0; padding-left:20px; list-style-type:disc;">
              ${bulletList}
            </ul>
          </div>
        `;
        footerHtml = `
          <button class="btn-qa-primary" style="height:34px; width:100%; background:#10b981; border-color:#10b981; font-weight:bold; color:white; cursor:pointer; border-radius:4px;" onclick="window.prCloseModal()">OK</button>
        `;
      }
      else if (activeModal === 'Appointment') {
        title = "📅 Book Appointment";
        isWide = false;
        const deptOptions = ['General Medicine', 'Gynecology & Obs', 'Pediatrics', 'Orthopedics', 'Cardiology', 'Dermatology', 'ENT', 'Ophthalmology', 'Psychiatry', 'Neurology'];
        const timeSlots = ['08:00 AM', '08:30 AM', '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM', '12:00 PM', '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM', '05:00 PM'];
        const doctors = state.doctors || [];
        const today = new Date();
        const minDate = today.toISOString().split('T')[0];
        bodyHtml = `
          <div style="display:flex; flex-direction:column; gap:12px;">
            <div class="form-group">
              <label>Appointment Date *</label>
              <input type="date" class="form-control" id="appt-date" min="${minDate}" value="${minDate}">
            </div>
            <div class="form-group">
              <label>Time Slot *</label>
              <select class="form-control" id="appt-time">
                ${timeSlots.map(t => `<option value="${t}">${t}</option>`).join('')}
              </select>
            </div>
            <div class="form-group">
              <label>Department *</label>
              <select class="form-control" id="appt-dept">
                ${deptOptions.map(d => `<option value="${d}">${d}</option>`).join('')}
              </select>
            </div>
            <div class="form-group">
              <label>Doctor</label>
              <select class="form-control" id="appt-doctor">
                <option value="">— Any Available —</option>
                ${doctors.map(d => `<option value="${d.name}">${d.name} (${d.department || ''})</option>`).join('')}
              </select>
            </div>
            <div class="form-group">
              <label>Reason / Chief Complaint</label>
              <textarea class="form-control" id="appt-reason" rows="2" placeholder="e.g. Follow-up, Review reports, Routine checkup..."></textarea>
            </div>
            <div class="form-group">
              <label>Appointment Type</label>
              <div style="display:flex; gap:8px; flex-wrap:wrap; margin-top:4px;">
                <label style="display:flex;align-items:center;gap:4px;font-size:12px;font-weight:normal;"><input type="radio" name="appt-type" value="Follow-up" checked> Follow-up</label>
                <label style="display:flex;align-items:center;gap:4px;font-size:12px;font-weight:normal;"><input type="radio" name="appt-type" value="New Consultation"> New Consultation</label>
                <label style="display:flex;align-items:center;gap:4px;font-size:12px;font-weight:normal;"><input type="radio" name="appt-type" value="Review"> Review</label>
                <label style="display:flex;align-items:center;gap:4px;font-size:12px;font-weight:normal;"><input type="radio" name="appt-type" value="Emergency"> Emergency</label>
              </div>
            </div>
          </div>
        `;
        footerHtml = `
          <button class="btn-qa-secondary" style="height:32px; font-size:11px;" onclick="window.prCloseModal()">Cancel</button>
          <button class="btn-qa-primary" style="height:32px; font-size:11px; width:auto; background:#4f46e5; border-color:#4f46e5;" onclick="window.prBookAppointment()">📅 Confirm Booking</button>
        `;
      }
      else if (activeModal === 'Order Diet') {
        title = "ORDER DIET - Patient: " + patient.name;
        isWide = false;

        // Query active diet
        var activeDiet = 'Regular Diet';
        if (window.state.dietData && window.state.dietData.patients) {
          var dp = window.state.dietData.patients.find(pt => pt.uhid === patient.uhid);
          if (dp) {
            activeDiet = dp.dietRx;
          }
        }

        bodyHtml = `
          <form id="p360-diet-form" onsubmit="event.preventDefault(); window.prSubmitDietFromModal('${patient.uhid}')" style="display:flex; flex-direction:column; gap:12px; font-size:12px;">
            <div class="form-group">
              <label style="font-weight:700;">Diet Classification</label>
              <select id="p360-diet-select" class="form-select" style="width:100%; padding:6px; border-radius:6px; border:1px solid #cbd5e1; font-size:12px; background-color:#fff;">
                <option value="Regular Diet" ${activeDiet === 'Regular Diet' ? 'selected' : ''}>Regular Diet</option>
                <option value="Diabetic Diet" ${activeDiet === 'Diabetic Diet' ? 'selected' : ''}>Diabetic Diet</option>
                <option value="Low Sodium Diet" ${activeDiet === 'Low Sodium Diet' ? 'selected' : ''}>Low Sodium Diet</option>
                <option value="Renal Diet" ${activeDiet === 'Renal Diet' ? 'selected' : ''}>Renal Diet</option>
                <option value="Clear Liquid Diet" ${activeDiet === 'Clear Liquid Diet' ? 'selected' : ''}>Clear Liquid Diet</option>
                <option value="High Protein Diet" ${activeDiet === 'High Protein Diet' ? 'selected' : ''}>High Protein Diet</option>
                <option value="Soft Diet" ${activeDiet === 'Soft Diet' ? 'selected' : ''}>Soft Diet</option>
                <option value="NPO (Nil Per Oral)" ${activeDiet.includes('NPO') ? 'selected' : ''}>NPO (Nil Per Oral)</option>
              </select>
            </div>
            
            <div class="form-group">
              <label style="font-weight:700;">Dietary Restrictions / Instructions</label>
              <input type="text" id="p360-diet-instructions" class="form-control" placeholder="E.g., No raw onions, Jain meal, lactose intolerant..." style="width:100%; padding:6px; border-radius:6px; border:1px solid #cbd5e1; font-size:12px;">
            </div>

            <div class="form-group" style="display:flex; flex-direction:column; gap:4px;">
              <label style="display:flex; align-items:center; gap:6px; font-weight:normal;">
                <input type="checkbox" id="p360-diet-iv" checked> Active IV Fluids (Recommended if NPO)
              </label>
            </div>
          </form>
        `;

        footerHtml = `
          <button class="btn-qa-secondary" style="height:32px; padding:0 12px; font-size:12px;" onclick="window.prCloseModal()">Cancel</button>
          <button class="btn-qa-primary" style="height:32px; padding:0 12px; font-size:12px; background:#4f46e5; border-color:#4f46e5; width:auto;" onclick="window.prSubmitDietFromModal('${patient.uhid}')">Save Diet Order</button>
        `;
      }
      else {
        // Fallback for simple actions
        title = `Action: ${activeModal}`;
        isWide = false;
        bodyHtml = `
          <div style="font-size:13px; color:var(--text-secondary);">
            Are you sure you want to perform the <b>${activeModal}</b> action for Lakshmi Devi?
          </div>
        `;
        footerHtml = `
          <button class="btn-qa-secondary" style="height:32px; font-size:11px;" onclick="window.prCloseModal()">Cancel</button>
          <button class="btn-qa-primary" style="height:32px; font-size:11px; width:auto;" onclick="window.prShowToast('${activeModal} confirmed'); window.prCloseModal()">Confirm</button>
        `;
      }
      
      return { title, isWide, bodyHtml, footerHtml };
    }

    function renderModalHtml() {
      const activeModal = window.p360ActiveModal;
      if (!activeModal) return "";
      const { title, isWide, bodyHtml, footerHtml } = getModalContent(activeModal);
      return `
        <div class="p360-modal-overlay" onclick="if(event.target === this) window.prCloseModal()">
          <div class="p360-modal-content ${isWide ? 'p360-modal-content-wide' : ''}">
            <div class="p360-modal-header">
              <h3>${title}</h3>
              <button class="p360-modal-close" onclick="window.prCloseModal()">&times;</button>
            </div>
            <div class="p360-modal-body">
              ${bodyHtml}
            </div>
            <div class="p360-modal-footer">
              ${footerHtml}
            </div>
          </div>
        </div>
      `;
    }

    window.prDrawModal = function() {
      const activeModal = window.p360ActiveModal;
      const modalContainer = document.getElementById('p360-modal-container');
      if (!modalContainer) return;

      if (!activeModal) {
        modalContainer.innerHTML = '';
        return;
      }

      const { title, isWide, bodyHtml, footerHtml } = getModalContent(activeModal);

      // Check if the overlay backdrop is already present in DOM
      let overlay = document.querySelector('.p360-modal-overlay');
      if (!overlay) {
        modalContainer.innerHTML = `
          <div class="p360-modal-overlay" onclick="if(event.target === this) window.prCloseModal()">
            <div class="p360-modal-content ${isWide ? 'p360-modal-content-wide' : ''}">
              <div class="p360-modal-header">
                <h3>${title}</h3>
                <button class="p360-modal-close" onclick="window.prCloseModal()">&times;</button>
              </div>
              <div class="p360-modal-body">${bodyHtml}</div>
              <div class="p360-modal-footer">${footerHtml}</div>
            </div>
          </div>
        `;
      } else {
        // Overlay is present, ONLY update the content box elements
        const titleEl = document.querySelector('.p360-modal-header h3');
        const bodyEl = document.querySelector('.p360-modal-body');
        const footerEl = document.querySelector('.p360-modal-footer');

        if (titleEl) titleEl.innerHTML = title;
        if (bodyEl) bodyEl.innerHTML = bodyHtml;
        if (footerEl) footerEl.innerHTML = footerHtml;
      }

      // Programmatically restore search field focus
      if (activeModal === 'Order Lab') {
        const input = document.getElementById('p360-lab-search-input');
        if (input) {
          input.focus();
          const val = input.value;
          input.value = '';
          input.value = val;
        }
      } else if (activeModal === 'Radiology') {
        const input = document.getElementById('p360-rad-search-input');
        if (input) {
          input.focus();
          const val = input.value;
          input.value = '';
          input.value = val;
        }
      } else if (activeModal === 'Prescribe') {
        const input = document.getElementById('p360-med-search-input');
        if (input) {
          input.focus();
          const val = input.value;
          input.value = '';
          input.value = val;
        }
      }
    };

    container.innerHTML = `
      ${p360Styles}
      <div class="p360-wrap">
        
        <!-- Patient Details Header (Horizontal Card) -->
        <div class="p360-card" style="display:flex; flex-direction:column; gap:10px;">
          <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:16px;">
            
            <!-- Left Info -->
            <div style="display:flex; align-items:center; gap:12px;">
              <div class="pr-avatar" style="width:40px; height:40px; font-size:14px; font-weight:700; background:var(--primary); color:#ffffff; display:flex; align-items:center; justify-content:center; border-radius:50%;">LD</div>
              <div>
                <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
                  <h4 style="margin:0; font-size:15px; font-weight:700; color:var(--text-primary);">${patient.name}</h4>
                  <span class="badge-type badge-dc">${patient.type.toUpperCase()}</span>
                  ${patient.status === 'Discharged'
                    ? `<span class="badge-type" style="background:#dcfce7; color:#15803d; font-weight:800;">✓ Discharged</span>`
                    : patient.dischargeStatus === 'In Progress — Clearances Pending'
                      ? `<span class="badge-type" style="background:#fef9c3; color:#854d0e; font-weight:800;">⏳ Discharge In Progress</span>`
                      : `<span class="badge-type badge-status-active">Active</span>`
                  }
                </div>
                <div style="font-size:11px; color:var(--text-secondary); margin-top:2px;">
                  Age/Sex: <b>${patient.age || '60'} &bull; ${patient.gender || 'F'}</b> &bull; Blood: <b>${patient.bloodGroup || 'B+'}</b> &bull; Mobile: <span class="mono"><b>${patient.mobile}</b></span>
                </div>
              </div>
            </div>

            <!-- Identifiers -->
            <div style="font-size:11px; display:flex; gap:16px;">
              <div>
                <span class="p360-label">UHID:</span>
                <span class="p360-val mono">${patient.uhid}</span>
              </div>
              <div>
                <span class="p360-label">Record No:</span>
                <span class="p360-val mono">${patient.uhid.replace('SH-2026', 'DC-2026')}</span>
              </div>
            </div>

            <!-- Safety flags -->
            <div style="display:flex; align-items:center; gap:6px;">
              <span class="mono" style="font-size:9px; color:var(--text-muted); font-weight:700;">SAFETY FLAGS:</span>
              <span class="flag-chip" style="background:var(--bg-surface-elevated, #f1f5f9); color:var(--text-muted); font-size:10px; margin:0; padding:2px 8px; font-weight:700; border-radius:4px;">No Known Allergy</span>
            </div>
          </div>

          <div class="p360-divider" style="margin:0;"></div>

          <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:16px; font-size:11px;">
            <!-- Admission specifics -->
            <div style="display:flex; gap:20px; flex-wrap:wrap;">
              ${patient.status === 'Discharged' ? `
                <div><span class="p360-label">Admitted:</span> <span class="p360-val mono">${patient.admissionDate || 'N/A'}</span></div>
                <div><span class="p360-label" style="color:#15803d; font-weight:700;">Discharged:</span> <span class="p360-val mono" style="color:#15803d; font-weight:700;">${patient.dischargeDate || 'N/A'}</span></div>
                <div><span class="p360-label">Consultant:</span> <span class="p360-val">${patient.primaryConsultant}</span></div>
                <div><span class="p360-label">Payer:</span> <span class="p360-val">${patient.payer}</span></div>
              ` : `
                <div><span class="p360-label">Ward/Bed:</span> <span class="p360-val mono">${patient.ward || '—'} &bull; ${patient.bed || '—'}</span></div>
                <div><span class="p360-label">Consultant:</span> <span class="p360-val">${patient.primaryConsultant}</span></div>
                <div><span class="p360-label">Admitted:</span> <span class="p360-val mono">${patient.admissionDate || '—'}</span></div>
                <div><span class="p360-label">LOS:</span> <span class="p360-val">${patient.dischargeStatus === 'In Progress — Clearances Pending' ? '<span style="color:#854d0e; font-weight:700;">⏳ Discharge In Progress</span>' : 'Ongoing'}</span></div>
                <div><span class="p360-label">Payer:</span> <span class="p360-val">${patient.payer}</span></div>
                <div><span class="p360-label">LOA:</span> <span class="p360-val mono" style="color:#059669; font-weight:700;">₹80,000 Approved ✓</span></div>
              `}
            </div>

            <!-- Activity ticker (Very compact, inline) -->
            <div style="display:flex; align-items:center; gap:8px;">
              <span class="mono" style="font-size:9px; color:var(--text-muted); font-weight:700;">LAST 12H:</span>
              <div style="font-size:11px; display:flex; gap:12px; color:var(--text-secondary);">
                <span>📊 NEWS2: <b>0</b></span>
                <span>🔬 Labs: <b>3 (1 Critical)</b></span>
                <span>💊 Meds: <b>1 New</b></span>
              </div>
            </div>
          </div>
        </div>

        <!-- Quick Actions Row (Horizontal buttons row starting directly with first action) -->
        <div class="p360-card" style="padding:10px 16px; display:flex; align-items:center; gap:12px; flex-wrap:wrap;">
          ${quickActionsHtml}
        </div>

        <!-- Tab Workspace (Split: vertical navigation on the left, tab contents on the right) -->
        <div class="p360-right-workspace">
          
          <!-- Side vertical tabs panel -->
          <div class="p360-tabs-side" style="width:190px; flex-shrink:0; display:flex; flex-direction:column; gap:4px; border-right:1px solid var(--border-color, #e2e8f0); padding-right:12px;">
            ${visibleTabs.map(tName => {
              let icon = '📄';
              if (tName === 'Summary & Timeline') icon = '📋';
              else if (tName === 'Clinical Notes') icon = '✏️';
              else if (tName === 'Vitals') icon = '📊';
              else if (tName === 'Labs') icon = '🔬';
              else if (tName === 'Imaging') icon = '🩻';
              else if (tName === 'Medications') icon = '💊';
              else if (tName === 'Nursing Notes') icon = '📝';
              else if (tName === 'Documents') icon = '📁';
              else if (tName === 'Complaints') icon = '🚩';
              else if (tName === 'ATD') icon = '🚪';
              else if (tName === 'Billing') icon = '💰';

              return `
                <div class="p360-side-tab ${tab === tName ? 'active' : ''}" onclick="window.prSelectWorkspaceTab('${tName}')">
                  <span>${icon}</span> <span>${tName}</span>
                </div>
              `;
            }).join('')}
          </div>

          <!-- Viewport scrollable content -->
          <div class="p360-viewport" style="flex:1; min-height:0; overflow-y:auto; background:var(--bg-surface, #ffffff); border:1px solid var(--border-color, #e2e8f0); border-radius:8px; padding:16px;">
            ${tabContentHtml}
          </div>

        </div>

      </div>
      
      <div id="p360-modal-container"></div>
    `;

    // Rebind typeahead listeners if composer is active
    if (tab === 'Clinical Notes') {
      window.prValidateSOAP();
    }
    if (tab === 'Nursing Notes') {
      window.prValidateNursingNote();
    }

    // Programmatically render modal in-place without destroying main wrapper
    window.prDrawModal();
  }

  // Wide Modal Selection handlers
  window.prSearchLabQuery = function(val) {
    window.labSearchQuery = val;
    window.prDrawModal();
  };

  window.prAddLabTest = function(name) {
    const test = window.patient360LabCatalog.find(t => t.name === name);
    if (test && !window.p360SelectedLabs.some(t => t.name === name)) {
      window.p360SelectedLabs.push({
        name: test.name,
        type: test.type,
        sample: test.sample,
        priority: "Routine",
        instructions: ""
      });
      window.labSearchQuery = "";
      window.prDrawModal();
    }
  };

  window.prRemoveLabTest = function(idx) {
    window.p360SelectedLabs.splice(idx, 1);
    window.prDrawModal();
  };

  window.prUpdateLabPriority = function(idx, val) {
    window.p360SelectedLabs[idx].priority = val;
  };

  window.prUpdateLabInstructions = function(idx, val) {
    window.p360SelectedLabs[idx].instructions = val;
  };

  window.prClearLabs = function() {
    window.p360SelectedLabs = [];
    window.prDrawModal();
  };

  window.prSaveDraftLabOrder = function() {
    if (patient) {
      patient.draftLabs = [...window.p360SelectedLabs];
      window.prShowToast(`Draft saved with ${window.p360SelectedLabs.length} test(s).`);
    }
    window.prCloseModal();
  };

  window.prPrintLabRequisition = function() {
    if (window.p360SelectedLabs.length === 0) {
      window.prShowToast("Please select at least one laboratory investigation to print.");
      return;
    }
    const printWindow = window.open("", "_blank", "width=800,height=600");
    const testsList = window.p360SelectedLabs.map(t => `
      <tr>
        <td style="padding:8px; border-bottom:1px solid #ddd;"><b>${t.name}</b></td>
        <td style="padding:8px; border-bottom:1px solid #ddd; text-transform:capitalize;">${t.sample}</td>
        <td style="padding:8px; border-bottom:1px solid #ddd;">${t.priority}</td>
        <td style="padding:8px; border-bottom:1px solid #ddd;">${t.instructions || "Nil"}</td>
      </tr>
    `).join('');
    const docName = patient.primaryConsultant || "Dr. Priya Nair";
    const dateStr = new Date().toLocaleDateString('en-IN') + " " + new Date().toLocaleTimeString('en-IN');
    printWindow.document.write(`
      <html>
      <head>
        <title>Laboratory Investigation Requisition Form</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 30px; color: #333; }
          .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 20px; }
          .title { font-size: 20px; font-weight: bold; text-transform: uppercase; margin-top: 10px; }
          .patient-info { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 30px; border: 1px solid #ccc; padding: 15px; border-radius: 6px; background-color: #fafafa; }
          .patient-info div { font-size: 13px; line-height: 1.6; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th { background-color: #f2f2f2; padding: 10px; text-align: left; font-size: 13px; border-bottom: 2px solid #ddd; }
          .footer { margin-top: 50px; display: flex; justify-content: space-between; font-size: 13px; }
          .signature-box { border-top: 1px solid #000; width: 200px; text-align: center; padding-top: 5px; margin-top: 40px; }
          @media print {
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="no-print" style="margin-bottom: 20px; background: #e0f2fe; border: 1px solid #bae6fd; padding: 12px; border-radius: 6px; display: flex; justify-content: space-between; align-items: center;">
          <span style="font-size:13px; font-weight:bold; color:#0369a1;">Requisition preview ready:</span>
          <button onclick="window.print()" style="padding: 6px 16px; background-color: #0284c7; color: white; border: none; border-radius: 4px; font-weight: bold; cursor: pointer;">Print</button>
        </div>
        <div class="header">
          <div style="font-size: 24px; font-weight: 900; letter-spacing: 1px; color: #b91c1c;">SARONIL HEALTH MULTI-SPECIALTY HOSPITAL</div>
          <div style="font-size: 11px; color: #666; margin-top: 3px;">Plot 12, Sector 5, Dwarka, New Delhi - 110075 | Tel: +91-11-49902100 | NABL Lab MC-9021</div>
          <div class="title">LABORATORY INVESTIGATION REQUISITION SLIP</div>
        </div>
        <div class="patient-info">
          <div>
            <strong>Patient Name:</strong> ${patient.name}<br>
            <strong>UHID / Medical Reg ID:</strong> ${patient.uhid}<br>
            <strong>Age / Gender:</strong> ${patient.age} Yrs / ${patient.gender}
          </div>
          <div>
            <strong>Visit Type / Location:</strong> ${patient.type} / ${patient.ward || "OPD Clinic"}<br>
            <strong>Requisition Date/Time:</strong> ${dateStr}<br>
            <strong>Referring Clinician:</strong> ${docName}
          </div>
        </div>
        <div style="font-size: 14px; font-weight: bold; margin-bottom: 10px; text-transform: uppercase;">Ordered Investigations:</div>
        <table>
          <thead>
            <tr>
              <th>Investigation Panel</th>
              <th>Specimen Container</th>
              <th>Priority</th>
              <th>Clinical / Fasting Instructions</th>
            </tr>
          </thead>
          <tbody>
            ${testsList}
          </tbody>
        </table>
        <div class="footer">
          <div>
            <strong>Status:</strong> Electronic request spooled to Lab Information System
          </div>
          <div class="signature-box">
            Authorized Clinician<br>
            <strong>${docName}</strong>
          </div>
        </div>
        <script>
          window.onload = function() {
            setTimeout(function() { window.print(); }, 300);
          }
        </script>
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  window.prPlaceLabOrder = function() {
    if (window.p360SelectedLabs.length === 0) {
      window.prShowToast("Please select at least one laboratory investigation.");
      return;
    }
    
    // Push each selected lab test as an order in state.orders to sync with LIS
    window.p360SelectedLabs.forEach(lab => {
      const activeDoc = patient.primaryConsultant || "Dr. Priya Nair";
      state.orders.push({
        id: "ORD" + String(6000 + state.orders.length + 1),
        uhid: patient.uhid,
        patientName: patient.name,
        doctorName: activeDoc,
        type: "Laboratory",
        name: lab.name,
        date: new Date().toISOString().slice(0, 10),
        priority: lab.priority || "Routine",
        status: "Ordered",
        result: ""
      });
    });

    window.p360PlacedOrderDetails = {
      type: 'Laboratory',
      patientName: patient.name,
      uhid: patient.uhid,
      items: window.p360SelectedLabs.map(t => t.name)
    };
    
    // Clear draft and selected lists
    if (patient) patient.draftLabs = [];
    window.p360SelectedLabs = [];
    window.p360ActiveModal = 'Order Placed';
    draw360();
  };

  // Radiology Handlers
  window.prSearchRadQuery = function(val) {
    window.radSearchQuery = val;
    window.prDrawModal();
  };

  window.prAddRadiologyTest = function(name) {
    const test = window.patient360RadiologyCatalog.find(t => t.name === name);
    if (test && !window.p360SelectedRadiology.some(t => t.name === name)) {
      window.p360SelectedRadiology.push({
        name: test.name,
        type: test.type,
        modality: test.modality,
        priority: "Routine",
        instructions: ""
      });
      window.radSearchQuery = "";
      window.prDrawModal();
    }
  };

  window.prRemoveRadiologyTest = function(idx) {
    window.p360SelectedRadiology.splice(idx, 1);
    window.prDrawModal();
  };

  window.prUpdateRadPriority = function(idx, val) {
    window.p360SelectedRadiology[idx].priority = val;
  };

  window.prUpdateRadInstructions = function(idx, val) {
    window.p360SelectedRadiology[idx].instructions = val;
  };

  window.prClearRadiology = function() {
    window.p360SelectedRadiology = [];
    window.prDrawModal();
  };

  window.prPlaceRadiologyOrder = function() {
    if (!window.p360SelectedRadiology || window.p360SelectedRadiology.length === 0) {
      window.prShowToast("Please select at least one radiology procedure.");
      return;
    }
    
    window.p360SelectedRadiology.forEach(study => {
      const orderId = `ORD-RAD-${Math.floor(6000 + Math.random() * 3000)}`;
      window.state.orders.push({
        id: orderId,
        patientName: patient.name,
        uhid: patient.uhid,
        type: 'Radiology',
        name: study.name,
        status: 'Billed',
        priority: study.priority || 'Routine',
        doctorName: patient.primaryConsultant || 'Dr. Priya Nair',
        time: new Date().toLocaleTimeString('en-IN'),
        result: ''
      });
    });

    window.p360PlacedOrderDetails = {
      type: 'Radiology',
      patientName: patient.name,
      uhid: patient.uhid,
      items: window.p360SelectedRadiology.map(t => t.name)
    };
    window.p360SelectedRadiology = [];
    window.p360ActiveModal = 'Order Placed';
    draw360();
  };

  // Medication Handlers
  window.prSearchMedQuery = function(val) {
    window.medSearchQuery = val;
    window.prDrawModal();
  };

  window.prAddMedPrescription = function(name) {
    const med = window.patient360MedicineCatalog.find(m => m.name === name);
    if (med && !window.p360SelectedMeds.some(m => m.name === name)) {
      window.p360SelectedMeds.push({
        name: med.name,
        type: med.type,
        route: med.route,
        stock: med.stock,
        alt: med.alt || "",
        freq: "Once daily",
        dur: "5 days",
        instructions: ""
      });
      window.medSearchQuery = "";
      window.prDrawModal();
    }
  };

  window.prRemoveMedPrescription = function(idx) {
    window.p360SelectedMeds.splice(idx, 1);
    window.prDrawModal();
  };

  window.prUpdateMedFreq = function(idx, val) {
    window.p360SelectedMeds[idx].freq = val;
  };

  window.prUpdateMedDur = function(idx, val) {
    window.p360SelectedMeds[idx].dur = val;
  };

  window.prUpdateMedInstructions = function(idx, val) {
    window.p360SelectedMeds[idx].instructions = val;
  };

  window.prUseAlternativeInSelected = function(idx, altName) {
    window.p360SelectedMeds[idx].name = altName;
    window.p360SelectedMeds[idx].stock = true;
    window.p360SelectedMeds[idx].alt = "";
    window.prShowToast(`Swapped out-of-stock drug with alternative: ${altName}`);
    window.prDrawModal();
  };

  window.prClearMeds = function() {
    window.p360SelectedMeds = [];
    window.prDrawModal();
  };

  window.prPlacePrescriptionOrder = function() {
    if (window.p360SelectedMeds.length === 0) {
      window.prShowToast("Please select at least one medication to prescribe.");
      return;
    }
    
    // Check if any selected item is out of stock
    const oos = window.p360SelectedMeds.find(m => !m.stock);
    if (oos) {
      window.prShowToast(`Cannot place order. ${oos.name} is OUT OF STOCK. Swap to alternative first.`);
      return;
    }

    // Insert into global patient360Meds list
    window.p360SelectedMeds.forEach(m => {
      window.patient360Meds.unshift({
        drug: m.name,
        route: m.route,
        freq: m.freq,
        dur: m.dur,
        status: "Active",
        author: `Dr. Priya Nair`
      });
    });

    // Ensure pharmacy queue is initialized
    window.state.prescriptionsQueue = window.state.prescriptionsQueue || [
      { rxNo: "RX-20260627-0401", name: "Ramesh Kumar", uhid: "MH-2026-4802", source: "ICU-BED-02", doctor: "Dr. Amit Sharma", time: "10m ago", itemsCount: 4, schedule: "Schedule X", status: "Pending" },
      { rxNo: "RX-20260627-0402", name: "Sunita Devi", uhid: "MH-2026-1120", source: "PVT-204", doctor: "Dr. Joy Sen", time: "15m ago", itemsCount: 3, schedule: "Schedule H1", status: "Pending" },
      { rxNo: "RX-20260627-0403", name: "Gopal Banerjee", uhid: "MH-2026-3092", source: "SP-301", doctor: "Dr. Joy Sen", time: "25m ago", itemsCount: 5, schedule: "Schedule H", status: "Partially Dispensed" },
      { rxNo: "RX-20260627-0404", name: "Harpreet Singh", uhid: "MH-2026-8812", source: "PVT-201", doctor: "Dr. Amit Sharma", time: "30m ago", itemsCount: 2, schedule: "High Alert (Insulin)", status: "Pending" },
      { rxNo: "RX-20260627-0405", name: "Elena Gilbert", uhid: "MH-2026-4402", source: "OPD Retail Counter", doctor: "Dr. A. K. Mehta", time: "35m ago", itemsCount: 2, schedule: "OTC", status: "Pending" }
    ];

    // Build the sync items list
    const rxItems = window.p360SelectedMeds.map(m => {
      let days = parseInt(m.dur) || 5;
      let multiplier = 1;
      if (m.freq.includes("Twice")) multiplier = 2;
      else if (m.freq.includes("Three")) multiplier = 3;
      else if (m.freq.includes("Four")) multiplier = 4;
      const count = days * multiplier;
      const form = m.name.toLowerCase().includes("syp") ? "bottle" : (m.name.toLowerCase().includes("tab") ? "tabs" : "units");
      const qtyStr = `${count} ${form}`;

      return {
        drug: m.name,
        dose: m.route || "Oral",
        freq: m.freq,
        qty: qtyStr,
        batch: "B-PH-" + String(Math.floor(202600 + Math.random() * 1000)),
        expiry: "31-Dec-2027"
      };
    });

    const newRxNo = "RX-" + new Date().toISOString().slice(0, 10).replace(/-/g, "") + "-" + String(Math.floor(1000 + Math.random() * 9000));
    window.state.prescriptionsQueue.unshift({
      rxNo: newRxNo,
      name: patient.name,
      uhid: patient.uhid,
      source: patient.ward ? `${patient.ward} Bed ${patient.bed}` : "IPD Ward",
      doctor: patient.primaryConsultant || "Dr. Priya Nair",
      time: "Just now",
      itemsCount: rxItems.length,
      items: rxItems,
      schedule: "Schedule H",
      status: "Pending"
    });

    window.p360PlacedOrderDetails = {
      type: 'Prescription',
      patientName: patient.name,
      uhid: patient.uhid,
      items: window.p360SelectedMeds.map(m => `${m.name} (${m.freq}, ${m.dur})`)
    };
    window.p360SelectedMeds = [];
    window.p360ActiveModal = 'Order Placed';
    draw360();
  };

  // Modal Form Action Handlers
  window.prSearchPrescribeDrug = function(val) {
    window.prescribeSearchQuery = val;
    window.prescribeSelectedDrug = null;
    draw360();
  };

  window.prSelectPrescribeDrug = function(name, stock, altName) {
    if (!stock) {
      window.prShowToast(`Selected drug is OUT OF STOCK. Recommended alternative: ${altName}`);
      return;
    }
    window.prescribeSelectedDrug = name;
    window.prescribeSearchQuery = name;
    draw360();
  };

  window.prUseAlternativeDrug = function(altName) {
    window.prescribeSelectedDrug = altName;
    window.prescribeSearchQuery = altName;
    window.prShowToast(`Alternative drug selected: ${altName}`);
    draw360();
  };

  window.prSavePrescription = function() {
    const drug = window.prescribeSelectedDrug || window.prescribeSearchQuery;
    if (!drug || drug.trim() === "") {
      window.prShowToast("Please search and select a medicine.");
      return;
    }
    
    const dose = document.getElementById("m-dose").value;
    const dur = document.getElementById("m-dur").value;
    
    window.patient360Meds.unshift({
      drug: drug,
      route: "Oral",
      freq: dose,
      dur: dur,
      status: "Active",
      author: `Dr. ${window.patient360Role === 'Doctor' ? 'Priya Nair' : 'Ramesh Kumar'}`
    });
    
    window.prShowToast(`Prescribed: ${drug}`);
    window.prCloseModal();
  };

  window.prSaveModalVitals = function() {
    const sbp = document.getElementById("mv-sbp").value;
    const dbp = document.getElementById("mv-dbp").value;
    const hr = document.getElementById("mv-hr").value;
    const rr = document.getElementById("mv-rr").value;
    const temp = document.getElementById("mv-temp").value;
    const spo2 = document.getElementById("mv-spo2").value;
    
    if (!sbp || !dbp || !hr || !rr || !temp || !spo2) {
      window.prShowToast("Please enter all vital values.");
      return;
    }
    
    // Simple NEWS2 calculation logic
    let newsScore = 0;
    const rrVal = parseInt(rr);
    const hrVal = parseInt(hr);
    const spo2Val = parseInt(spo2);
    
    if (rrVal >= 25 || rrVal <= 8) newsScore += 3;
    else if (rrVal >= 21 || rrVal <= 11) newsScore += 2;
    
    if (hrVal >= 131 || hrVal <= 40) newsScore += 3;
    else if (hrVal >= 111 || hrVal <= 50) newsScore += 1;
    
    if (spo2Val <= 91) newsScore += 3;
    else if (spo2Val <= 93) newsScore += 2;
    else if (spo2Val <= 95) newsScore += 1;

    const now = new Date();
    const dateStr = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

    window.patient360Vitals.unshift({
      d: dateStr,
      t: timeStr,
      bp: `${sbp}/${dbp}`,
      hr: hrVal,
      rr: rrVal,
      temp: `${temp}°F`,
      spo2: `${spo2}%`,
      wt: "60 kg",
      by: "Nurse Mary",
      news: newsScore
    });

    window.prShowToast(`Vitals logged successfully. Computed NEWS2: ${newsScore}`);
    window.prCloseModal();
  };

  window.prSaveModalSOAP = function() {
    const s = document.getElementById("ms-s").value;
    const o = document.getElementById("ms-o").value;
    const a = document.getElementById("ms-a").value;
    
    if (!s || !a) {
      window.prShowToast("Subjective and Assessment fields are required.");
      return;
    }
    
    const now = new Date();
    const timeStr = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + " · " + now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    
    window.patient360Notes.unshift({
      type: "PROGRESS NOTE",
      author: "Dr. Priya Nair",
      dept: "Gynaecology",
      time: timeStr,
      s: s,
      o: o || "BP 130/80. Stable.",
      a: a
    });
    
    window.prShowToast("SOAP Progress Note saved.");
    window.prCloseModal();
  };

  // Clinical Notes dynamic type routing controllers
  window.prSelectClinicalNoteSubtab = function(st) {
    window.patient360ActiveClinicalNoteSubtab = st;
    draw360();
  };

  window.prValidateClinicalNote = function() {
    const st = window.patient360ActiveClinicalNoteSubtab;
    let isValid = false;
    
    if (st === 'Progress Note') {
      const s = document.getElementById("soap-s")?.value || "";
      const a = document.getElementById("soap-a-impression")?.value || "";
      window.soapSubjective = s;
      window.soapAssessmentImpression = a;
      isValid = (s.trim().length > 0 && a.trim().length > 0);
    } else if (st === 'Review Note') {
      const status = document.getElementById("rev-status")?.value || "";
      const plan = document.getElementById("rev-plan")?.value || "";
      window.reviewStatus = status;
      window.reviewPlan = plan;
      isValid = (status.trim().length > 0 && plan.trim().length > 0);
    } else if (st === 'Pre-op Note') {
      const diag = document.getElementById("pre-diag")?.value || "";
      const proc = document.getElementById("pre-proc")?.value || "";
      window.preopDiagnosis = diag;
      window.preopProcedure = proc;
      isValid = (diag.trim().length > 0 && proc.trim().length > 0);
    } else if (st === 'Post-op Note') {
      const diag = document.getElementById("post-diag")?.value || "";
      const proc = document.getElementById("post-proc")?.value || "";
      window.postopDiagnosis = diag;
      window.postopProcedure = proc;
      isValid = (diag.trim().length > 0 && proc.trim().length > 0);
    } else if (st === 'Referral Note') {
      const tgt = document.getElementById("ref-tgt")?.value || "";
      const sum = document.getElementById("ref-sum")?.value || "";
      window.referralTarget = tgt;
      window.referralSummary = sum;
      isValid = (tgt.trim().length > 0 && sum.trim().length > 0);
    } else if (st === 'Discharge Note') {
      const diag = document.getElementById("dis-diag")?.value || "";
      const course = document.getElementById("dis-course")?.value || "";
      window.dischargeDiagnosis = diag;
      window.dischargeCourse = course;
      isValid = (diag.trim().length > 0 && course.trim().length > 0);
    }

    const btn = document.getElementById("btn-sign-save");
    if (btn) btn.disabled = !isValid;
  };

  window.prDiscardSOAP = function() {
    window.soapSubjective = "";
    window.soapObjectiveExam = "";
    window.soapAssessmentImpression = "";
    window.soapPlanDetails = "";
    window.soapPlanMedicationCheck = false;

    window.reviewStatus = "";
    window.reviewPlan = "";

    window.preopDiagnosis = "";
    window.preopProcedure = "";
    window.preopClearance = "";
    window.preopFasting = false;
    window.preopSiteMarked = false;
    window.preopConsent = false;

    window.postopDiagnosis = "";
    window.postopProcedure = "";
    window.postopIntraop = "";
    window.postopPlan = "";

    window.referralTarget = "";
    window.referralSummary = "";
    window.referralUrgency = "Routine";

    window.dischargeDiagnosis = "";
    window.dischargeCourse = "";
    window.dischargeInstructions = "";
    window.dischargeMeds = "";

    window.prShowToast("Note draft discarded");
    draw360();
  };

  window.prSignAndSave = function() {
    const st = window.patient360ActiveClinicalNoteSubtab;
    const now = new Date();
    const timeStr = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + " · " + now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

    let noteObj = {
      type: st.toUpperCase(),
      author: "Dr. Priya Nair",
      dept: "Gynaecology",
      time: timeStr
    };

    if (st === 'Progress Note') {
      noteObj.s = window.soapSubjective;
      noteObj.o = window.soapObjectiveExam || "BP 130/80. Stable.";
      noteObj.a = window.soapAssessmentImpression;
      noteObj.p = window.soapPlanDetails;
    } else if (st === 'Review Note') {
      noteObj.reviewStatus = window.reviewStatus;
      noteObj.reviewPlan = window.reviewPlan;
    } else if (st === 'Pre-op Note') {
      noteObj.preopDiagnosis = window.preopDiagnosis;
      noteObj.preopProcedure = window.preopProcedure;
      noteObj.preopClearance = window.preopClearance;
      noteObj.preopChecklist = `Fasting: ${window.preopFasting ? 'Yes' : 'No'}, Site Marked: ${window.preopSiteMarked ? 'Yes' : 'No'}, Consent: ${window.preopConsent ? 'Yes' : 'No'}`;
    } else if (st === 'Post-op Note') {
      noteObj.postopDiagnosis = window.postopDiagnosis;
      noteObj.postopProcedure = window.postopProcedure;
      noteObj.postopIntraop = window.postopIntraop;
      noteObj.postopPlan = window.postopPlan;
    } else if (st === 'Referral Note') {
      noteObj.referralTarget = window.referralTarget;
      noteObj.referralSummary = window.referralSummary;
      noteObj.referralUrgency = window.referralUrgency;
    } else if (st === 'Discharge Note') {
      noteObj.dischargeDiagnosis = window.dischargeDiagnosis;
      noteObj.dischargeCourse = window.dischargeCourse;
      noteObj.dischargeInstructions = window.dischargeInstructions;
      noteObj.dischargeMeds = window.dischargeMeds;
    }

    window.patient360Notes.unshift(noteObj);
    window.prShowToast(`${st} signed and saved successfully.`);
    window.prDiscardSOAP(); // Clear inputs and redraw
  };

  // Interactive controllers on window
  window.prSwitchRole = function(newRole) {
    window.patient360Role = newRole;
    
    // Auto-update active tab per role requirement
    if (newRole === 'Doctor') window.patient360ActiveTab = 'Clinical Notes';
    else if (newRole === 'Nurse') window.patient360ActiveTab = 'Nursing Notes';
    else if (newRole === 'Billing') window.patient360ActiveTab = 'Billing';
    else if (newRole === 'Pharmacy') window.patient360ActiveTab = 'Medications';
    else if (newRole === 'Front Desk') window.patient360ActiveTab = 'Documents';
    else if (newRole === 'Admission') window.patient360ActiveTab = 'ATD';

    draw360();
  };

  window.prSelectWorkspaceTab = function(tName) {
    window.patient360ActiveTab = tName;
    window.p360ActiveModal = null;
    draw360();
  };

  window.prTriggerAction = function(actionLabel) {
    const labelClean = actionLabel.replace(/[^\w\s&]/g, '').trim();
    
    if (labelClean.includes("Write Note")) {
      window.p360ActiveModal = 'Write Note';
    } else if (labelClean.includes("Prescribe") || labelClean.includes("Prescriptions")) {
      window.p360ActiveModal = 'Prescribe';
      window.prescribeSearchQuery = "";
      window.prescribeSelectedDrug = null;
    } else if (labelClean.includes("Order Lab")) {
      window.p360ActiveModal = 'Order Lab';
      if (patient && patient.draftLabs) {
        window.p360SelectedLabs = [...patient.draftLabs];
      } else {
        window.p360SelectedLabs = [];
      }
    } else if (labelClean.includes("Radiology")) {
      window.p360ActiveModal = 'Radiology';
    } else if (labelClean.includes("Record Vitals")) {
      window.p360ActiveModal = 'Record Vitals';
    } else if (labelClean.includes("Nursing Note") || labelClean.includes("Nurse Note")) {
      window.p360ActiveModal = 'Nursing Note';
    } else if (labelClean.includes("Diet") || labelClean.includes("Order Diet")) {
      window.p360ActiveModal = 'Order Diet';
    } else if (labelClean.includes("Discharge")) {
      window.showUniversalDischargeWorkflow(patient.uhid);
      return;
    } else if (labelClean.includes("Transfer") || labelClean.includes("Change Bed")) {
      window.showUniversalTransferWorkflow(patient.uhid);
      return;
    } else if (labelClean.includes("Pay") || labelClean.includes("Collect Payment")) {
      window.p360ActiveModal = 'Collect Payment';
    } else if (labelClean.includes("Receipt")) {
      window.p360ActiveModal = 'Receipt';
    } else if (labelClean.includes("Dispense") || labelClean.includes("Dispensed")) {
      window.p360ActiveModal = 'Dispense';
    } else if (labelClean.includes("SMS") || labelClean.includes("Send SMS")) {
      window.p360ActiveModal = 'Send SMS';
    } else if (labelClean.includes("Appointment")) {
      window.p360ActiveModal = 'Appointment';
    } else if (labelClean.includes("Print")) {
      window.print();
      return;
    } else {
      window.prShowToast(`${actionLabel} opened`);
      return;
    }
    
    draw360();
  };

  window.prCloseModal = function() {
    window.p360ActiveModal = null;
    draw360();
  };

  window.prSubmitDietFromModal = function(uhid) {
    const dietSelect = document.getElementById('p360-diet-select');
    const dietVal = dietSelect ? dietSelect.value : 'Regular Diet';
    const notesInput = document.getElementById('p360-diet-instructions');
    const notes = notesInput ? notesInput.value : '';
    const ivCheckbox = document.getElementById('p360-diet-iv');
    const iv = (ivCheckbox && ivCheckbox.checked) ? "Yes" : "No";

    var p = window.state.patients.find(pt => pt.uhid === uhid);
    if (p) {
      if (!p.clinicalData) p.clinicalData = {};
      p.clinicalData.carePlan = `Follow ${dietVal}. Instructions: ${notes}.`;
    }

    if (!window.state.dietData) {
      window.state.dietData = { patients: [], screeningQueue: [], counsellingQueue: [], kitchenDispatches: [], activeNPOAlerts: [], dietOrdersCount: 42 };
    }

    var dp = window.state.dietData.patients.find(pt => pt.uhid === uhid);
    if (dp) {
      dp.dietRx = dietVal;
      dp.status = dietVal.includes('NPO') ? 'NPO Lock' : 'Active';
      if (notes) dp.allergies = notes;
    } else {
      window.state.dietData.patients.push({
        name: p ? p.name : "Patient",
        uhid: uhid,
        bed: p ? p.bed : "Ward",
        diagnosis: (p && p.clinicalData) ? p.clinicalData.diagnosis : "IPD Admitted",
        dietRx: dietVal,
        lastReview: "Today",
        status: dietVal.includes('NPO') ? 'NPO Lock' : 'Active',
        energy: 1800, protein: 70, fluid: 1500, route: "Oral",
        prepBy: "Doctor EMR Modal",
        preferences: "Veg",
        allergies: notes || "None",
        mealStats: { breakfast: "—", lunch: "—", dinner: "—" }
      });
    }

    window.state.dietData.dietOrdersCount = window.state.dietData.patients.length + 35;

    if (dietVal.includes('NPO')) {
      var npoAlertExists = window.state.dietData.activeNPOAlerts.some(n => n.uhid === uhid);
      if (!npoAlertExists) {
        window.state.dietData.activeNPOAlerts.unshift({
          name: p ? p.name : "Patient",
          uhid: uhid,
          bed: p ? p.bed : "Ward Room",
          duration: `8 hrs`,
          ivFluids: iv,
          status: "Warning Alert"
        });
      }
    } else {
      window.state.dietData.activeNPOAlerts = window.state.dietData.activeNPOAlerts.filter(n => n.uhid !== uhid);
    }

    alert(`Diet Order of ${dietVal} submitted successfully for ${p ? p.name : uhid}. Same will reflect in Diet & Nutrition module.`);
    window.prCloseModal();
  };

  window.prBookAppointment = function() {
    const date = document.getElementById('appt-date')?.value;
    const time = document.getElementById('appt-time')?.value;
    const dept = document.getElementById('appt-dept')?.value;
    const doctor = document.getElementById('appt-doctor')?.value;
    const reason = document.getElementById('appt-reason')?.value || '';
    const typeEl = document.querySelector('input[name="appt-type"]:checked');
    const apptType = typeEl ? typeEl.value : 'Follow-up';

    if (!date || !time || !dept) {
      window.prShowToast('⚠ Please fill all required fields.');
      return;
    }

    // Save appointment to patient record
    patient.appointments = patient.appointments || [];
    const apptId = 'APT-' + Date.now().toString().slice(-6);
    patient.appointments.unshift({
      id: apptId,
      date: date,
      time: time,
      department: dept,
      doctor: doctor || 'Any Available',
      reason: reason,
      type: apptType,
      status: 'Scheduled',
      bookedAt: new Date().toISOString()
    });

    window.p360ActiveModal = null;
    window.prShowToast(`✅ Appointment booked for ${date} at ${time} — ${dept}`);
    draw360();
  };

  window.prAcknowledgeCritical = function() {
    window.patient360CriticalAcked = true;
    window.prShowToast(`Critical value K⁺ 6.8 acknowledged by Dr. ${window.patient360Role === 'Doctor' ? 'Priya Nair' : 'Mary'}`);
    draw360();
  };

  window.prSearchDiagnosis = function(val) {
    window.patient360SelectedDiagnosisTemp = val;
    draw360();
  };

  window.prAddDiagnosis = function(code) {
    if (!window.patient360Diagnoses.includes(code)) {
      window.patient360Diagnoses.push(code);
    }
    window.patient360SelectedDiagnosisTemp = "";
    draw360();
  };

  window.prRemoveDiagnosis = function(idx) {
    window.patient360Diagnoses.splice(idx, 1);
    draw360();
  };

  window.prSetClearance = function(field, checked) {
    window.patient360DischargeClearances[field] = checked;
    draw360();
  };

  window.prDischargePatient = function() {
    window.prShowToast("Discharge process initiated successfully!");
  };

  window.prValidateSOAP = function() {
    const s = window.soapSubjective.trim();
    const btn = document.getElementById('btn-sign-save');
    if (!btn) return;
    
    // Sign & Save enabled if S is filled + critical acknowledged
    if (s.length > 0 && window.patient360CriticalAcked) {
      btn.disabled = false;
    } else {
      btn.disabled = true;
    }
  };

  window.prSignAndSave = function() {
    const s = window.soapSubjective.trim();
    const exam = window.soapObjectiveExam.trim();
    const impression = window.soapAssessmentImpression.trim();
    
    const formattedDiag = window.patient360Diagnoses.join(', ') || 'None';
    const impressionFinal = impression ? `${impression} (${formattedDiag})` : formattedDiag;

    window.patient360Notes.unshift({
      type: "PROGRESS NOTE",
      author: "Dr. Priya Nair",
      dept: "Gynaecology",
      time: "28 Jun 2026 · 11:30 AM",
      s: s,
      o: `BP: 130/80. ${exam}`,
      a: impressionFinal
    });

    // Clear form inputs
    window.soapSubjective = "";
    window.soapObjectiveExam = "";
    window.soapAssessmentImpression = "";
    window.soapPlanDetails = "";

    window.prShowToast("Progress Note signed & saved successfully!");
    draw360();
  };

  window.prDiscardSOAP = function() {
    window.soapSubjective = "";
    window.soapObjectiveExam = "";
    window.soapAssessmentImpression = "";
    window.soapPlanDetails = "";
    window.prShowToast("Progress Note changes discarded.");
    draw360();
  };

  window.prValidateNursingNote = function() {
    const obs = window.nursingObservations.trim();
    const btn = document.getElementById('btn-nn-save');
    if (!btn) return;
    
    if (obs.length > 0) {
      btn.disabled = false;
    } else {
      btn.disabled = true;
    }
  };

  window.prSaveNursingNote = function() {
    const shift = window.nursingShift;
    const obs = window.nursingObservations.trim();
    const acts = window.nursingActions.trim();
    const inst = window.nursingInstructions.trim();

    window.nursingNotesHistory.unshift({
      type: "NURSING NOTE",
      author: "Staff Nurse Mary",
      desg: "Senior Ward Nurse",
      time: "28 Jun 2026 · 11:30 AM",
      shift: shift,
      obs: obs,
      actions: acts || "None",
      instructions: inst || "None"
    });

    window.nursingObservations = "";
    window.nursingActions = "";
    window.nursingInstructions = "";

    window.prShowToast("Nursing note signed & saved successfully!");
    draw360();
  };

  draw360();
}

/* ── OPD → IPD / DAYCARE ADMISSION REQUEST GATING ─────────────────────── */
window.prAdmitOPDPatient = function(uhid, adType) {
  var pat = window.state.patients.find(p => p.uhid === uhid);
  if (!pat) return;

  var overlay = document.createElement('div');
  overlay.id = 'opd-admission-overlay';
  overlay.className = 'fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4';

  var accentColor = adType === 'Daycare' ? '#0d9488' : '#059669';
  var accentHover = adType === 'Daycare' ? '#0f766e' : '#047857';

  overlay.innerHTML = `
    <div class="bg-white rounded-2xl w-[480px] max-w-full shadow-2xl p-6 text-slate-700 text-left">
      <h3 class="font-extrabold text-lg mb-2 flex items-center gap-2" style="color:${accentColor}">🏥 Request ${adType || 'IPD'} Admission</h3>
      <p class="text-xs text-slate-500 mb-4">
        Raise an admission request for <strong>${pat.name}</strong> (${pat.uhid}). This will appear in the
        <strong>IPD &amp; Daycare Admission Dashboard</strong> for the ATD Coordinator to process.
      </p>

      <div class="flex flex-col gap-4">
        <div>
          <label class="block text-xs font-bold text-slate-600 mb-1">Provisional Diagnosis / Reason *</label>
          <input type="text" class="w-full p-2 border rounded-lg text-xs bg-white text-slate-800" id="adm-reason"
            placeholder="e.g. Acute Cholecystitis / IV Iron infusion / Pre-op workup"
            value="${adType === 'Daycare' ? 'Daycare procedure / IV infusion' : 'IPD inpatient admission'}">
        </div>

        <div>
          <label class="block text-xs font-bold text-slate-600 mb-1">Preferred Ward / Unit</label>
          <select class="w-full p-2 border rounded-lg text-xs bg-white font-semibold text-slate-800" id="adm-pref-ward">
            <option value="GENERAL-WARD-M">General Ward – Male</option>
            <option value="GENERAL-WARD-F">General Ward – Female</option>
            <option value="SEMI-PRIVATE">Semi-Private Room</option>
            <option value="PRIVATE">Private Room</option>
            <option value="CCU">Critical Care Unit (CCU)</option>
            <option value="DAYCARE" ${adType === 'Daycare' ? 'selected' : ''}>Daycare Unit</option>
          </select>
        </div>

        <div>
          <label class="block text-xs font-bold text-slate-600 mb-1">Referring / Requesting Doctor</label>
          <input type="text" class="w-full p-2 border rounded-lg text-xs bg-slate-50 text-slate-500 cursor-not-allowed"
            value="${pat.primaryConsultant || 'Dr. Priya Nair'}" readonly>
        </div>

        <div class="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-700">
          ⚠️ The admission request will be sent to the <strong>ATD Coordinator</strong>. The patient status will update
          once the bed is assigned and advance deposit collected by Billing.
        </div>
      </div>

      <div class="flex justify-end gap-3 mt-6 border-t pt-4">
        <button class="py-2 px-4 border rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer bg-white"
          onclick="document.getElementById('opd-admission-overlay').remove()">Cancel</button>
        <button class="py-2 px-5 text-white rounded-lg text-xs font-bold cursor-pointer"
          style="background:${accentColor};"
          onmouseover="this.style.background='${accentHover}'"
          onmouseout="this.style.background='${accentColor}'"
          onclick="window.confirmOPDAdmission('${uhid}', '${adType || 'IPD'}')">
          Send Admission Request →
        </button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);
};

window.confirmOPDAdmission = function(uhid, adType) {
  adType = adType || 'IPD';
  var reasonVal = document.getElementById('adm-reason')?.value?.trim();
  var prefWard  = document.getElementById('adm-pref-ward')?.value || (adType === 'Daycare' ? 'DAYCARE' : 'GENERAL-WARD-M');

  if (!reasonVal) {
    alert('Error: Please enter the provisional diagnosis / reason for admission.');
    return;
  }

  var pat = window.state.patients.find(p => p.uhid === uhid);
  if (!pat) return;

  // Build the admission request object (same schema as ipdAdmissionView.js seed data)
  window.state.admissionRequests = window.state.admissionRequests || [];

  // Prevent duplicate pending requests for the same patient
  var existing = window.state.admissionRequests.find(r => r.uhid === uhid && r.reqStatus === 'Pending');
  if (existing) {
    alert(`An admission request for ${pat.name} is already pending in the dashboard (ID: ${existing.id}). Please process that request first.`);
    document.getElementById('opd-admission-overlay').remove();
    return;
  }

  var reqId = 'REQ-' + Date.now().toString().slice(-6);
  var newReq = {
    id: reqId,
    name: pat.name,
    uhid: uhid,
    source: 'Patient Detail — Doctor Request',
    refDoc: pat.primaryConsultant || 'Dr. Priya Nair',
    diagnosis: reasonVal,
    ward: prefWard,
    admType: adType,
    advancePaid: false,
    waitingHrs: 0,
    branch: pat.branch || 'Bengaluru',
    reqStatus: 'Pending',
    requestedAt: new Date().toISOString()
  };
  window.state.admissionRequests.unshift(newReq);
  localStorage.setItem('saronil_admissionRequests', JSON.stringify(window.state.admissionRequests));

  // Send IPD Advance Deposit to Billing
  if (adType === 'IPD') {
    window.state.billing = window.state.billing || [];
    window.state.billing.push({
      id: 'INV-DEP-' + String(3000 + window.state.billing.length),
      uhid: uhid,
      patientName: pat.name,
      amount: 10000,
      paid: 0,
      status: 'Pending',
      visitType: 'IPD',
      date: new Date().toISOString().slice(0, 10),
      items: [
        { desc: 'IPD Admission Advance Deposit', qty: 1, rate: 10000, total: 10000 }
      ]
    });
    localStorage.setItem('saronil_billing', JSON.stringify(window.state.billing));
  }


  // Add pending status to patient timeline
  pat.timelineEvents = pat.timelineEvents || [];
  pat.timelineEvents.unshift({
    date: new Date().toLocaleDateString('en-CA') + ' ' + new Date().toLocaleTimeString('en-US', {hour:'2-digit', minute:'2-digit'}),
    type: 'clinical',
    icon: '📋',
    title: `${adType} Admission Request Raised`,
    desc: `Admission request (${reqId}) raised for ${adType}. Reason: ${reasonVal}. Preferred ward: ${WARD_RATES[prefWard]?.name || prefWard}. Pending ATD Coordinator processing.`
  });
  localStorage.setItem('saronil_patients', JSON.stringify(window.state.patients));

  document.getElementById('opd-admission-overlay').remove();
  window.prShowToast(`✅ ${adType} admission request sent to Dashboard (${reqId}). ATD Coordinator will process it.`);

  // Refresh view
  if (window.views.patients) {
    var main = document.getElementById('main-content');
    if (main) window.views.patients(main, null, { uhid: uhid });
  }
};

/* ── DAYCARE → IPD TRANSFER REQUEST ────────────────────────────────────── */
window.prTransferDaycareToIPD = function(uhid) {
  var pat = window.state.patients.find(p => p.uhid === uhid);
  if (!pat) return;

  var overlay = document.createElement('div');
  overlay.id = 'daycare-transfer-overlay';
  overlay.className = 'fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4';

  overlay.innerHTML = `
    <div class="bg-white rounded-2xl w-[480px] max-w-full shadow-2xl p-6 text-slate-700 text-left">
      <h3 class="font-extrabold text-lg text-violet-700 mb-2 flex items-center gap-2">↔ Request Transfer: Daycare → IPD</h3>
      <p class="text-xs text-slate-500 mb-4">
        Raise a transfer request for <strong>${pat.name}</strong> (${pat.uhid}) from <strong>Daycare</strong>
        to an <strong>IPD inpatient bed</strong>. This will appear in the
        <strong>Admission Dashboard → Transfer Requests</strong> queue.
      </p>

      <div class="flex flex-col gap-4">
        <div>
          <label class="block text-xs font-bold text-slate-600 mb-1">Current Bed / Location</label>
          <input type="text" class="w-full p-2 border rounded-lg text-xs bg-slate-50 text-slate-500 cursor-not-allowed font-semibold"
            value="${pat.bed || 'Daycare Unit'}" readonly>
        </div>

        <div>
          <label class="block text-xs font-bold text-slate-600 mb-1">Preferred IPD Ward *</label>
          <select class="w-full p-2 border rounded-lg text-xs bg-white font-semibold text-slate-800" id="trf-target-ward">
            <option value="GENERAL-WARD-M">General Ward – Male</option>
            <option value="GENERAL-WARD-F">General Ward – Female</option>
            <option value="SEMI-PRIVATE">Semi-Private Room</option>
            <option value="PRIVATE">Private Room</option>
            <option value="CCU">Critical Care Unit (CCU)</option>
          </select>
        </div>

        <div>
          <label class="block text-xs font-bold text-slate-600 mb-1">Clinical Reason / Indication *</label>
          <input type="text" class="w-full p-2 border rounded-lg text-xs bg-white text-slate-800" id="trf-reason"
            placeholder="e.g. Clinical deterioration, post-op monitoring required"
            value="Inpatient post-procedure monitoring">
        </div>

        <div class="bg-violet-50 border border-violet-200 rounded-lg p-3 text-xs text-violet-700">
          📋 This transfer request will be routed to the <strong>Nursing Supervisor / ATD Coordinator</strong> for
          bed allocation and approval.
        </div>
      </div>

      <div class="flex justify-end gap-3 mt-6 border-t pt-4">
        <button class="py-2 px-4 border rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer bg-white"
          onclick="document.getElementById('daycare-transfer-overlay').remove()">Cancel</button>
        <button class="py-2 px-5 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-xs font-bold cursor-pointer"
          onclick="window.confirmDaycareTransfer('${uhid}')">
          Send Transfer Request →
        </button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);
};

window.confirmDaycareTransfer = function(uhid) {
  var targetWard = document.getElementById('trf-target-ward')?.value || 'GENERAL-WARD-M';
  var reasonVal  = document.getElementById('trf-reason')?.value?.trim();

  if (!reasonVal) {
    alert('Error: Please enter the clinical reason / indication for transfer.');
    return;
  }

  var pat = window.state.patients.find(p => p.uhid === uhid);
  if (!pat) return;

  // Build transfer request (same schema as ipdAdmissionView.js transferRequests)
  window.state.transferRequests = window.state.transferRequests || [];

  var existing = window.state.transferRequests.find(r => r.uhid === uhid && (r.status || '').includes('Pending'));
  if (existing) {
    alert(`A transfer request for ${pat.name} is already pending (ID: ${existing.id}). Please process it first.`);
    document.getElementById('daycare-transfer-overlay').remove();
    return;
  }

  var reqId = 'TRF-' + Date.now().toString().slice(-6);
  var newTrf = {
    id: reqId,
    name: pat.name,
    uhid: uhid,
    currentBed: pat.bed || 'Daycare Unit',
    currentWard: 'DAYCARE',
    targetWard: targetWard,
    requestedBy: pat.primaryConsultant || 'Dr. Priya Nair',
    reason: `Daycare→IPD upgrade: ${reasonVal}`,
    requestedAt: new Date().toISOString(),
    status: 'Pending Nursing Supervisor Approval',
    branch: pat.branch || 'Bengaluru'
  };
  window.state.transferRequests.unshift(newTrf);
  localStorage.setItem('saronil_transferRequests', JSON.stringify(window.state.transferRequests));

  // Add timeline event
  pat.timelineEvents = pat.timelineEvents || [];
  pat.timelineEvents.unshift({
    date: new Date().toLocaleDateString('en-CA') + ' ' + new Date().toLocaleTimeString('en-US', {hour:'2-digit', minute:'2-digit'}),
    type: 'clinical',
    icon: '↔',
    title: 'IPD Transfer Request Raised',
    desc: `Transfer request (${reqId}) raised from Daycare to IPD (${WARD_RATES[targetWard]?.name || targetWard}). Reason: ${reasonVal}. Pending Nursing Supervisor approval.`
  });
  localStorage.setItem('saronil_patients', JSON.stringify(window.state.patients));

  document.getElementById('daycare-transfer-overlay').remove();
  window.prShowToast(`✅ IPD Transfer request sent to Dashboard (${reqId}). Nursing Supervisor will process it.`);

  // Refresh view
  if (window.views.patients) {
    var main = document.getElementById('main-content');
    if (main) window.views.patients(main, null, { uhid: uhid });
  }
};

/* ── DISCHARGE SUMMARY MODAL (Read-Only, from Patient Timeline) ─────────── */
window.showDischargeSummaryModal = function(uhid) {
  if (window.showUniversalDischargeWorkflow) {
    window.showUniversalDischargeWorkflow(uhid);
  } else {
    var pat = window.state && window.state.patients && window.state.patients.find(p => p.uhid === uhid);
    var summary = (pat && pat.dischargeOrder) || {};
    var dischargeDate = (pat && pat.dischargeDate) || 'N/A';
    alert(
      'DISCHARGE SUMMARY\n' +
      '─────────────────────────────\n' +
      'Patient: ' + (pat ? pat.name : uhid) + '\n' +
      'UHID: ' + uhid + '\n' +
      'Date of Discharge: ' + dischargeDate + '\n' +
      'Discharge Type: ' + (summary.type || 'Regular') + '\n' +
      'Condition at Discharge: ' + (summary.condition || 'Stable') + '\n' +
      'Final Diagnosis: ' + (summary.finalDiagnosis || 'Not specified') + '\n' +
      'Follow-up: ' + (summary.followUpDate || 'Not scheduled') + ' with ' + (summary.followUpDoctor || 'N/A') + '\n' +
      'Instructions: ' + (summary.summary || 'None provided.')
    );
  }
};

/* ══════════════════════════════════════════════════════════════════════════
   PATIENT COMPLAINTS — MODAL FUNCTIONS
   ══════════════════════════════════════════════════════════════════════════ */

/* ── NEW COMPLAINT FORM ─────────────────────────────────────────────────── */
window.prOpenNewComplaintForm = function(uhid) {
  if (document.getElementById('complaint-new-overlay')) return;

  var overlay = document.createElement('div');
  overlay.id = 'complaint-new-overlay';
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(15,23,42,0.55);backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center;z-index:9999;padding:16px;';

  overlay.innerHTML = `
    <div style="background:#fff;border-radius:16px;width:520px;max-width:100%;box-shadow:0 24px 60px rgba(0,0,0,0.18);overflow:hidden;font-family:inherit;">
      <div style="background:linear-gradient(135deg,#1e3a5f 0%,#1d4ed8 100%);padding:18px 22px;display:flex;justify-content:space-between;align-items:center;">
        <div>
          <h3 style="margin:0;color:#fff;font-size:15px;font-weight:800;">🚩 File New Complaint</h3>
          <p style="margin:3px 0 0;color:#bfdbfe;font-size:11px;">All complaints are tracked and escalated as per hospital policy.</p>
        </div>
        <button onclick="document.getElementById('complaint-new-overlay').remove()" style="background:rgba(255,255,255,0.15);border:none;color:#fff;width:28px;height:28px;border-radius:50%;font-size:14px;cursor:pointer;">✕</button>
      </div>
      <div style="padding:20px 22px;display:flex;flex-direction:column;gap:14px;">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;">
          <div>
            <label style="font-size:11px;font-weight:700;color:#374151;display:block;margin-bottom:5px;">Category *</label>
            <select id="cmp-category" style="width:100%;padding:8px 10px;border:1px solid #d1d5db;border-radius:8px;font-size:12px;color:#1f2937;background:#fff;">
              <option value="">— Select Category —</option>
              <option>Staff Behaviour</option>
              <option>Clinical Care</option>
              <option>Facility &amp; Cleanliness</option>
              <option>Billing &amp; Charges</option>
              <option>Food &amp; Nutrition</option>
              <option>Waiting Time</option>
              <option>Privacy &amp; Confidentiality</option>
              <option>Other</option>
            </select>
          </div>
          <div>
            <label style="font-size:11px;font-weight:700;color:#374151;display:block;margin-bottom:5px;">Severity *</label>
            <select id="cmp-severity" style="width:100%;padding:8px 10px;border:1px solid #d1d5db;border-radius:8px;font-size:12px;color:#1f2937;background:#fff;">
              <option value="">— Select Severity —</option>
              <option value="High">🔴 High — Urgent</option>
              <option value="Medium" selected>🟡 Medium</option>
              <option value="Low">🔵 Low</option>
            </select>
          </div>
        </div>
        <div>
          <label style="font-size:11px;font-weight:700;color:#374151;display:block;margin-bottom:5px;">Raised By *</label>
          <input type="text" id="cmp-raised-by" placeholder="e.g. Patient, Patient's Spouse, Attender Name..." style="width:100%;padding:8px 10px;border:1px solid #d1d5db;border-radius:8px;font-size:12px;color:#1f2937;box-sizing:border-box;">
        </div>
        <div>
          <label style="font-size:11px;font-weight:700;color:#374151;display:block;margin-bottom:5px;">Complaint Description *</label>
          <textarea id="cmp-description" rows="4" placeholder="Describe the complaint in detail — include time, place, and person(s) involved if applicable..." style="width:100%;padding:8px 10px;border:1px solid #d1d5db;border-radius:8px;font-size:12px;color:#1f2937;resize:vertical;box-sizing:border-box;font-family:inherit;"></textarea>
        </div>
        <div style="background:#fef9c3;border:1px solid #fbbf24;border-radius:8px;padding:10px 12px;font-size:11px;color:#854d0e;">
          ⚠️ High-severity complaints will be automatically escalated to the Patient Relations Officer within 1 hour.
        </div>
      </div>
      <div style="padding:14px 22px;border-top:1px solid #f1f5f9;display:flex;justify-content:flex-end;gap:10px;">
        <button onclick="document.getElementById('complaint-new-overlay').remove()" style="padding:8px 18px;border:1px solid #d1d5db;background:#fff;border-radius:8px;font-size:12px;font-weight:700;color:#374151;cursor:pointer;">Cancel</button>
        <button onclick="window.prSubmitNewComplaint('${uhid}')" style="padding:8px 20px;background:#1d4ed8;border:none;border-radius:8px;font-size:12px;font-weight:700;color:#fff;cursor:pointer;">Submit Complaint →</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);
  overlay.addEventListener('click', function(e) { if (e.target === overlay) overlay.remove(); });
};

window.prSubmitNewComplaint = function(uhid) {
  var category = (document.getElementById('cmp-category') || {}).value || '';
  var severity = (document.getElementById('cmp-severity') || {}).value || '';
  var raisedBy = ((document.getElementById('cmp-raised-by') || {}).value || '').trim();
  var description = ((document.getElementById('cmp-description') || {}).value || '').trim();

  if (!category) { alert('Please select a complaint category.'); return; }
  if (!severity) { alert('Please select severity level.'); return; }
  if (!raisedBy) { alert('Please enter who is raising this complaint.'); return; }
  if (description.length < 10) { alert('Please enter a complaint description (at least 10 characters).'); return; }

  var pat = window.state && window.state.patients && window.state.patients.find(function(p) { return p.uhid === uhid; });
  if (!pat) return;

  pat.complaints = pat.complaints || [];
  var now = new Date();
  var cmpId = 'CMP-' + String(pat.complaints.length + 1).padStart(3, '0');
  pat.complaints.unshift({
    id: cmpId,
    date: now.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
    time: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    category: category,
    description: description,
    raisedBy: raisedBy,
    status: 'Open',
    severity: severity,
    resolution: '',
    raisedAt: now.toISOString()
  });
  localStorage.setItem('saronil_patients', JSON.stringify(window.state.patients));

  var el = document.getElementById('complaint-new-overlay');
  if (el) el.remove();
  if (typeof window.prShowToast === 'function') window.prShowToast('✅ Complaint ' + cmpId + ' filed successfully. Patient Relations will follow up.');

  window.patient360ActiveTab = 'Complaints';
  var main = document.getElementById('main-content');
  if (main && window.views && window.views.patients) window.views.patients(main, null, { uhid: uhid });
};

/* ── COMPLAINT DETAIL POPUP ─────────────────────────────────────────────── */
window.prOpenComplaintDetail = function(uhid, idx) {
  var pat = window.state && window.state.patients && window.state.patients.find(function(p) { return p.uhid === uhid; });
  if (!pat || !pat.complaints || !pat.complaints[idx]) return;
  var c = pat.complaints[idx];

  var existing = document.getElementById('complaint-detail-overlay');
  if (existing) existing.remove();

  var isOpen = c.status === 'Open';
  var sevColors = { High: '#b91c1c', Medium: '#854d0e', Low: '#1d4ed8' };
  var sevBg    = { High: '#fee2e2', Medium: '#fef9c3', Low: '#dbeafe' };

  var overlay = document.createElement('div');
  overlay.id = 'complaint-detail-overlay';
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(15,23,42,0.55);backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center;z-index:9999;padding:16px;';

  overlay.innerHTML = `
    <div style="background:#fff;border-radius:16px;width:560px;max-width:100%;box-shadow:0 24px 60px rgba(0,0,0,0.2);overflow:hidden;font-family:inherit;">
      <div style="background:${isOpen ? 'linear-gradient(135deg,#7f1d1d,#dc2626)' : 'linear-gradient(135deg,#14532d,#16a34a)'};padding:18px 22px;display:flex;justify-content:space-between;align-items:flex-start;">
        <div>
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;flex-wrap:wrap;">
            <span style="font-family:monospace;font-size:13px;font-weight:800;color:#fff;">${c.id}</span>
            <span style="font-size:10px;background:rgba(255,255,255,0.2);color:#fff;padding:2px 8px;border-radius:20px;font-weight:700;">${c.severity} Severity</span>
            <span style="font-size:10px;background:rgba(255,255,255,0.2);color:#fff;padding:2px 8px;border-radius:20px;font-weight:700;">${c.status}</span>
          </div>
          <h3 style="margin:0;color:#fff;font-size:14px;font-weight:700;">${c.category}</h3>
          <p style="margin:3px 0 0;color:rgba(255,255,255,0.75);font-size:11px;">Raised by ${c.raisedBy} &bull; ${c.date} at ${c.time}</p>
        </div>
        <button onclick="document.getElementById('complaint-detail-overlay').remove()" style="background:rgba(255,255,255,0.2);border:none;color:#fff;width:28px;height:28px;border-radius:50%;font-size:14px;cursor:pointer;flex-shrink:0;">✕</button>
      </div>

      <div style="padding:20px 22px;display:flex;flex-direction:column;gap:16px;">
        <div>
          <p style="margin:0 0 6px;font-size:10px;font-weight:700;color:#6b7280;letter-spacing:0.06em;text-transform:uppercase;">Complaint Description</p>
          <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:12px 14px;font-size:12px;color:#374151;line-height:1.6;">${c.description}</div>
        </div>

        ${!isOpen && c.resolution ? `
          <div>
            <p style="margin:0 0 6px;font-size:10px;font-weight:700;color:#15803d;letter-spacing:0.06em;text-transform:uppercase;">✅ Resolution Provided</p>
            <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:12px 14px;font-size:12px;color:#166534;line-height:1.6;">${c.resolution}</div>
            <p style="margin:6px 0 0;font-size:10px;color:#6b7280;">Resolved on: ${c.resolvedAt || c.date} by <b>${c.resolvedBy || 'Staff'}</b></p>
          </div>
        ` : ''}

        ${isOpen ? `
          <div style="border-top:1px solid #f1f5f9;padding-top:16px;">
            <p style="margin:0 0 8px;font-size:11px;font-weight:700;color:#1d4ed8;">📝 Provide Resolution</p>
            <textarea id="cmp-resolution-text" rows="4" placeholder="Describe the steps taken to resolve this complaint. Be specific — this will be recorded in the patient file..." style="width:100%;padding:10px 12px;border:1.5px solid #93c5fd;border-radius:8px;font-size:12px;color:#1f2937;resize:vertical;box-sizing:border-box;font-family:inherit;outline:none;" onfocus="this.style.borderColor='#2563eb'" onblur="this.style.borderColor='#93c5fd'"></textarea>
            <p style="margin:5px 0 0;font-size:10px;color:#6b7280;">Minimum 15 characters required to mark as resolved.</p>
          </div>
        ` : ''}
      </div>

      <div style="padding:14px 22px;border-top:1px solid #f1f5f9;display:flex;justify-content:flex-end;gap:10px;">
        <button onclick="document.getElementById('complaint-detail-overlay').remove()" style="padding:8px 18px;border:1px solid #d1d5db;background:#fff;border-radius:8px;font-size:12px;font-weight:700;color:#374151;cursor:pointer;">${isOpen ? 'Cancel' : 'Close'}</button>
        ${isOpen ? `<button onclick="window.prComplaintResolve('${uhid}',${idx})" style="padding:8px 22px;background:linear-gradient(135deg,#16a34a,#059669);border:none;border-radius:8px;font-size:12px;font-weight:700;color:#fff;cursor:pointer;">✅ Mark as Resolved</button>` : ''}
      </div>
    </div>
  `;
  document.body.appendChild(overlay);
  overlay.addEventListener('click', function(e) { if (e.target === overlay) overlay.remove(); });
};

/* ── RESOLVE COMPLAINT ──────────────────────────────────────────────────── */
window.prComplaintResolve = function(uhid, idx) {
  var resText = ((document.getElementById('cmp-resolution-text') || {}).value || '').trim();
  if (resText.length < 15) {
    alert('Please enter a resolution (minimum 15 characters) before marking as resolved.');
    return;
  }

  var pat = window.state && window.state.patients && window.state.patients.find(function(p) { return p.uhid === uhid; });
  if (!pat || !pat.complaints || !pat.complaints[idx]) return;
  var c = pat.complaints[idx];

  var now = new Date();
  c.status = 'Resolved';
  c.resolution = resText;
  c.resolvedAt = now.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
               + ' at ' + now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  c.resolvedBy = window._ipdActiveRole || 'Staff';

  localStorage.setItem('saronil_patients', JSON.stringify(window.state.patients));

  /* Replace the modal content with a success screen */
  var overlay = document.getElementById('complaint-detail-overlay');
  if (!overlay) return;

  var successUhid = uhid;
  overlay.querySelector('div').innerHTML = `
    <div style="border-radius:16px;overflow:hidden;text-align:center;">
      <div style="background:linear-gradient(135deg,#14532d,#16a34a);padding:36px 28px 28px;">
        <div style="width:68px;height:68px;background:rgba(255,255,255,0.2);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:34px;margin:0 auto 14px;">✅</div>
        <h3 style="margin:0;color:#fff;font-size:18px;font-weight:800;">Complaint Resolved!</h3>
        <p style="margin:6px 0 0;color:rgba(255,255,255,0.8);font-size:12px;">${c.id} has been successfully closed.</p>
      </div>
      <div style="padding:22px 26px;display:flex;flex-direction:column;gap:14px;background:#fff;">
        <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;padding:14px;text-align:left;">
          <p style="margin:0 0 6px;font-size:10px;font-weight:700;color:#15803d;text-transform:uppercase;letter-spacing:0.06em;">Resolution Summary</p>
          <p style="margin:0;font-size:12px;color:#166534;line-height:1.55;">${resText}</p>
        </div>
        <p style="margin:0;font-size:11px;color:#6b7280;">Resolved by <b>${c.resolvedBy}</b> on <b>${c.resolvedAt}</b></p>
      </div>
      <div style="padding:14px 26px 20px;background:#fff;">
        <button id="cmp-success-close-btn" style="width:100%;padding:11px;background:linear-gradient(135deg,#14532d,#16a34a);border:none;border-radius:10px;font-size:13px;font-weight:800;color:#fff;cursor:pointer;">Close &amp; Return to Complaints</button>
      </div>
    </div>
  `;

  document.getElementById('cmp-success-close-btn').addEventListener('click', function() {
    overlay.remove();
    window.patient360ActiveTab = 'Complaints';
    var main = document.getElementById('main-content');
    if (main && window.views && window.views.patients) window.views.patients(main, null, { uhid: successUhid });
  });
};

