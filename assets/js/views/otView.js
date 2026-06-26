/* ==========================================================================
   SARONIL HMS - OPERATION THEATRE (OT) MODULE (otView.js)
   ========================================================================== */

// Initialize state elements for OT if not already existing
if (!state.ot) {
  state.ot = {
    theatres: [
      { code: "OT-01", name: "General Surgery Theatre 1", speciality: "General Surgery", location: "3rd Floor, A-Wing", tables: 1, cleaningTime: 30, start: "08:00", end: "20:00", status: "Active", emergency: false, ahu: "Laminar Flow", lastCleaned: "2026-06-25" },
      { code: "OT-ORTHO", name: "Orthopaedic Theatre", speciality: "Orthopaedics", location: "3rd Floor, B-Wing", tables: 1, cleaningTime: 40, start: "08:00", end: "20:00", status: "Active", emergency: false, ahu: "Laminar Flow", lastCleaned: "2026-06-25" },
      { code: "OT-OBG", name: "Obstetrics Gynaecology OT", speciality: "OBG", location: "2nd Floor, C-Wing", tables: 1, cleaningTime: 30, start: "00:00", end: "24:00", status: "Active", emergency: true, ahu: "Laminar Flow", lastCleaned: "2026-06-26" },
      { code: "OT-EMGCY", name: "Emergency & Trauma OT", speciality: "Emergency", location: "1st Floor, Emergency Wing", tables: 1, cleaningTime: 30, start: "00:00", end: "24:00", status: "Active", emergency: true, ahu: "Conventional", lastCleaned: "2026-06-26" }
    ],
    equipment: [
      { code: "EQ-OT-001", name: "Laparoscopy High-Def Stack", assigned: "OT-01", manufacturer: "Stryker", model: "1688 AIM", serial: "SN-998822", maintenance: "2026-06-01", nextMaintenance: "2026-09-01", calibration: "2026-12-01", status: "Operational", availability: "Available" },
      { code: "EQ-OT-002", name: "Mobile C-Arm Imaging Unit", assigned: "OT-ORTHO", manufacturer: "Siemens", model: "Cios Select", serial: "SN-112233", maintenance: "2026-05-15", nextMaintenance: "2026-08-15", calibration: "2026-11-15", status: "Operational", availability: "Available" },
      { code: "EQ-OT-003", name: "Advanced Anaesthesia Workstation", assigned: "OT-01", manufacturer: "Dräger", model: "Primus", serial: "SN-445566", maintenance: "2026-06-10", nextMaintenance: "2026-09-10", calibration: "2026-12-10", status: "Operational", availability: "Available" },
      { code: "EQ-OT-004", name: "Electrosurgical Diathermy Unit", assigned: "OT-EMGCY", manufacturer: "Covidien", model: "ForceTriad", serial: "SN-778899", maintenance: "2026-06-12", nextMaintenance: "2026-09-12", calibration: "2026-12-12", status: "Operational", availability: "Available" }
    ],
    instrumentSets: [
      { code: "SET-LAP-01", name: "Laparotomy Core Set", procedure: "Exploratory Laparotomy", sterilisation: "Autoclave", duration: 45, lastSterilised: "2026-06-25 18:00", expiry: "2026-07-02 18:00", status: "Available", itemsCount: 48 },
      { code: "SET-CHOLE-02", name: "Lap Cholecystectomy Set", procedure: "Laparoscopic Cholecystectomy", sterilisation: "ETO", duration: 60, lastSterilised: "2026-06-26 02:00", expiry: "2026-07-26 02:00", status: "Available", itemsCount: 36 },
      { code: "SET-LSCS-01", name: "Obstetric Caesarean Set", procedure: "LSCS Emergency", sterilisation: "Autoclave", duration: 45, lastSterilised: "2026-06-26 07:00", expiry: "2026-07-03 07:00", status: "Available", itemsCount: 42 },
      { code: "SET-TKR-01", name: "Total Knee Replacement Set", procedure: "Total Knee Arthroplasty", sterilisation: "Plasma", duration: 90, lastSterilised: "2026-06-24 14:00", expiry: "2026-07-01 14:00", status: "Available", itemsCount: 64 }
    ],
    sterilisationLog: [
      { cycle: "CYC-2026-101", setCode: "SET-CHOLE-02", sentBy: "Sister Maria", sentAt: "2026-06-25 23:00", method: "ETO", temp: "55°C", pressure: "1.5 bar", duration: 60, indicator: "Passed", releasedBy: "CSSD Supervisor", expiry: "2026-07-26" }
    ],
    biLogs: [
      { id: "BI-2026-001", sterilizer: "Autoclave #1", cycleNo: "CYC-2026-101", method: "Steam Autoclave", type: "Geobacillus stearothermophilus", result: "Passed", readTime: "2026-06-26 08:00", readBy: "CSSD Supervisor", status: "Released" },
      { id: "BI-2026-002", sterilizer: "ETO Sterilizer #2", cycleNo: "CYC-2026-102", method: "ETO Gas", type: "Bacillus atrophaeus", result: "Pending", readTime: "Expected 2026-06-27 10:00", readBy: "--", status: "In Incubation" }
    ],
    dutyRoster: [
      { date: "2026-06-26", shift: "Morning (08:00 - 14:00)", role: "OT Incharge", staff: "Sister Latha", status: "On Duty", onCall: false },
      { date: "2026-06-26", shift: "Morning (08:00 - 14:00)", role: "Scrub Nurse", staff: "Sister Jessy", status: "On Duty", onCall: false },
      { date: "2026-06-26", shift: "Morning (08:00 - 14:00)", role: "Circulating Nurse", staff: "Brother Jose", status: "On Duty", onCall: false },
      { date: "2026-06-26", shift: "Morning (08:00 - 14:00)", role: "OT Technician", staff: "Anil Sharma", status: "On Duty", onCall: false },
      { date: "2026-06-26", shift: "Morning (08:00 - 14:00)", role: "Anaesthetist", staff: "Dr. Ajay Kumar", status: "On Duty", onCall: false },
      { date: "2026-06-26", shift: "Morning (08:00 - 14:00)", role: "Primary Surgeon", staff: "Dr. Sunita P.", status: "On Duty", onCall: false },
      { date: "2026-06-26", shift: "Night (20:00 - 08:00)", role: "Anaesthetist", staff: "Dr. Amit Patel", status: "On Call", onCall: true },
      { date: "2026-06-26", shift: "Night (20:00 - 08:00)", role: "Primary Surgeon", staff: "Dr. Sunita P.", status: "On Call", onCall: true },
      { date: "2026-06-26", shift: "Night (20:00 - 08:00)", role: "Scrub Nurse", staff: "Sister Shiny", status: "On Call", onCall: true }
    ],
    scheduledCases: [
      {
        id: "OT-CASE-1001",
        patientUhid: "UHID20000003",
        patientName: "Rahul Sharma",
        age: 34, gender: "Male", ward: "Semi-Private Ward", bed: "SP-302",
        admissionNo: "ADM00231",
        diagnosis: "Calculus of gallbladder with acute cholecystitis (ICD-10 K80.2)",
        procedure: "Laparoscopic Cholecystectomy (CPT 47562)",
        surgeon: "Dr. Sunita P.",
        anaesthetist: "Dr. Ajay Kumar",
        scrubNurse: "Sister Latha",
        circulatingNurse: "Brother Jose",
        technician: "Anil Sharma",
        theatre: "OT-01",
        date: "2026-06-26",
        time: "10:30",
        duration: "01:30",
        status: "Scheduled", // Scheduled, Shifting, Pre-Op, Intra-Op, PACU, Completed, Cancelled
        priority: "Elective",
        bloodReq: "Yes", bloodUnits: "2 Units PRBC", bloodStatus: "Reserved",
        patientPosition: "Supine",
        positioningChecked: false,
        tourniquetLimb: "None",
        tourniquetPressure: 0,
        tourniquetInflated: false,
        tourniquetInflatedTime: "",
        tourniquetDeflatedTime: "",
        tourniquetTotalMinutes: 0,
        instrumentCount: { opening: 36, closing: 36, status: "Pending", needlesOpening: 10, needlesClosing: 10, spongesOpening: 20, spongesClosing: 20 },
        consentChecklist: { surgical: true, anaesthesia: true, blood: true, implant: false },
        preOpInvestigations: [
          { test: "Complete Blood Count (CBC)", value: "Hb: 13.8 g/dL, PLT: 2.5L", status: "Normal", reviewed: true },
          { test: "PT/INR", value: "INR: 1.02", status: "Normal", reviewed: true },
          { test: "ECG", value: "Normal Sinus Rhythm", status: "Normal", reviewed: true }
        ],
        preOpChecklist: { wardComplete: false, holdingComplete: false, siteMarked: true, npoSolid: "2026-06-25 22:00", npoClear: "2026-06-26 06:00", asaStatus: "ASA II" },
        whoChecklist: { signIn: false, timeOut: false, signOut: false },
        anaesthesiaRecord: { type: "General Anaesthesia", inductionTime: "", extubationTime: "", agents: [], vitals: [] },
        implants: [],
        consumables: [
          { code: "CON-OT-01", name: "OT Disposables Pack - Lap", qty: 1, rate: 4500 },
          { code: "CON-OT-02", name: "Vicryl 2-0 Suture", qty: 2, rate: 850 },
          { code: "CON-OT-03", name: "Laparoscopic Clip Cartridge", qty: 1, rate: 2200 }
        ],
        auditHistory: [
          { time: "2026-06-25 15:30", user: "Dr. Sunita P.", action: "Case Requested", remarks: "Laparoscopic cholecystectomy for symptomatic gallstones." },
          { time: "2026-06-25 17:00", user: "OT Incharge", action: "Case Scheduled", remarks: "Allocated OT-1, 10:30 slot." }
        ]
      },
      {
        id: "OT-CASE-1002",
        patientUhid: "UHID20000004",
        patientName: "Kavita Sen",
        age: 28, gender: "Female", ward: "Labour Room", bed: "LR-BED-02",
        admissionNo: "ADM00244",
        diagnosis: "Fetal distress, breech presentation (ICD-10 O64.1)",
        procedure: "Emergency Lower Segment Caesarean Section (LSCS)",
        surgeon: "Dr. Priyanka Sen",
        anaesthetist: "Dr. Amit Patel",
        scrubNurse: "Sister Jessy",
        circulatingNurse: "Sister Shiny",
        technician: "Ramesh Lal",
        theatre: "OT-OBG",
        date: "2026-06-26",
        time: "09:00",
        duration: "01:00",
        status: "Completed",
        priority: "Emergency",
        bloodReq: "Yes", bloodUnits: "1 Unit PRBC", bloodStatus: "Transfused",
        patientPosition: "Supine with Left Uterine Displacement",
        positioningChecked: true,
        tourniquetLimb: "None",
        tourniquetPressure: 0,
        tourniquetInflated: false,
        tourniquetInflatedTime: "",
        tourniquetDeflatedTime: "",
        tourniquetTotalMinutes: 0,
        instrumentCount: { opening: 42, closing: 42, status: "Correct", needlesOpening: 8, needlesClosing: 8, spongesOpening: 15, spongesClosing: 15 },
        consentChecklist: { surgical: true, anaesthesia: true, blood: true, implant: false },
        preOpInvestigations: [
          { test: "Complete Blood Count (CBC)", value: "Hb: 11.2 g/dL", status: "Normal", reviewed: true }
        ],
        preOpChecklist: { wardComplete: true, holdingComplete: true, siteMarked: true, npoSolid: "Emergency NPO", npoClear: "Emergency NPO", asaStatus: "ASA II" },
        whoChecklist: { signIn: true, timeOut: true, signOut: true },
        anaesthesiaRecord: { type: "Spinal Anaesthesia", inductionTime: "09:05", extubationTime: "10:00", agents: ["Bupivacaine Heavy 0.5%"], vitals: [] },
        implants: [],
        consumables: [
          { code: "CON-OT-04", name: "Obstetric Delivery Kit", qty: 1, rate: 3500 },
          { code: "CON-OT-05", name: "Suture Chromic Catgut 1-0", qty: 3, rate: 450 }
        ],
        auditHistory: []
      }
    ],
    narcoticsRegister: [
      { date: "2026-06-26", caseId: "OT-CASE-1002", drug: "Fentanyl", batch: "FN-8812", drawn: "100 mcg", given: "100 mcg", wastage: "0 mcg", witness: "Sister Shiny" }
    ],
    incidents: [],
    auditTrail: [
      { timestamp: "2026-06-26 08:30:12.445", user: "Admin", role: "Administrator", action: "OT Module Loaded", target: "System", remarks: "User initialized operating theatre console." }
    ]
  };
}

let activeOTTab = "dashboard"; // dashboard, schedule, scheduler, pacu, cssd, reports, audit
let activeOTCaseId = null;
let otCaseFilterTheatre = "";
let otCaseFilterSurgeon = "";
let selectedCasePanel = "preop"; // preop, intraop, anaesthesia, postop, billing

function formatINR(val) {
  return "₹" + Number(val).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

window.views.ot = function(container, subAnchor, params) {
  renderOTModule(container);
};

window.switchOTTab = function(tab) {
  activeOTTab = tab;
  activeOTCaseId = null;
  const container = document.getElementById('main-content');
  renderOTModule(container);
};

window.switchOTCasePanel = function(panel) {
  selectedCasePanel = panel;
  const space = document.getElementById('case-detail-sub-workspace');
  if (space) renderOTCasePanel(space);
};

function renderOTModule(container) {
  if (!container) return;

  // Audit load event
  if (state.ot.auditTrail.length === 1) {
    state.ot.auditTrail.push({
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 23) + " IST",
      user: window.state.activeUserRole || "Admin",
      role: "User",
      action: "Workspace Switched",
      target: "OT Console",
      remarks: "User opened Operation Theatre Registry."
    });
  }

  // Count metrics
  const activeCases = state.ot.scheduledCases.filter(c => ["Scheduled", "Shifting", "Pre-Op", "Intra-Op", "PACU"].includes(c.status)).length;
  const inProgressCases = state.ot.scheduledCases.filter(c => c.status === "Intra-Op").length;
  const pendingSterilisation = state.ot.instrumentSets.filter(s => ["Being Sterilised", "Expired Sterility"].includes(s.status)).length;

  container.innerHTML = `
    <!-- Top Shell styled with modern Saronil light theme -->
    <div class="space-y-6 font-sans antialiased text-slate-800 bg-[#F8FAFC] min-h-screen p-4">
      
      <!-- Module Header Bar -->
      <div class="flex flex-col md:flex-row md:items-center md:justify-between pb-6 border-b border-slate-200">
        <div>
          <div class="flex items-center gap-2">
            <span class="text-2xl">😷</span>
            <h1 class="text-2xl font-bold tracking-tight text-slate-900" style="font-family: 'Outfit', sans-serif;">
              Operation Theatre (OT) Module
            </h1>
          </div>
          <p class="text-sm text-slate-500 mt-1">
            Real-time surgical cockpit: Elective scheduling, WHO safety checklist safeguards, anaesthesia logs, and CSSD tracing.
          </p>
        </div>

        <div class="mt-4 md:mt-0 flex items-center gap-3">
          <button class="bg-[#1B3A5C] text-white hover:bg-slate-850 px-4 py-2 rounded-xl text-xs font-bold shadow-sm transition" onclick="window.openNewOTCaseModal()">
            ➕ Schedule Surgery Case
          </button>
          <button class="bg-red-950 text-white hover:bg-red-900 px-4 py-2 rounded-xl text-xs font-bold shadow-sm transition animate-pulse" onclick="window.triggerEmergencyOTBooking()">
            🚨 Emergency Crash Case (LSCS / Trauma)
          </button>
        </div>
      </div>

      <!-- Navigation Tabs -->
      <div class="flex flex-wrap border-b border-slate-200 bg-white rounded-xl shadow-sm p-1 gap-1">
        <button class="px-5 py-3 rounded-lg text-sm font-medium transition-all ${activeOTTab === 'dashboard' ? 'bg-[#1B3A5C] text-white shadow-sm font-bold' : 'text-slate-600 hover:bg-slate-50'}" onclick="window.switchOTTab('dashboard')">
          🏠 OT Dashboard
        </button>
        <button class="px-5 py-3 rounded-lg text-sm font-medium transition-all ${activeOTTab === 'schedule' ? 'bg-[#1B3A5C] text-white shadow-sm font-bold' : 'text-slate-600 hover:bg-slate-50'}" onclick="window.switchOTTab('schedule')">
          📋 Daily Surgical Board (${activeCases})
        </button>
        <button class="px-5 py-3 rounded-lg text-sm font-medium transition-all ${activeOTTab === 'scheduler' ? 'bg-[#1B3A5C] text-white shadow-sm font-bold' : 'text-slate-600 hover:bg-slate-50'}" onclick="window.switchOTTab('scheduler')">
          🗓️ Scheduling Board
        </button>
        <button class="px-5 py-3 rounded-lg text-sm font-medium transition-all ${activeOTTab === 'consents' ? 'bg-[#1B3A5C] text-white shadow-sm font-bold' : 'text-slate-600 hover:bg-slate-50'}" onclick="window.switchOTTab('consents')">
          📜 Consent Registry
        </button>
        <button class="px-5 py-3 rounded-lg text-sm font-medium transition-all ${activeOTTab === 'roster' ? 'bg-[#1B3A5C] text-white shadow-sm font-bold' : 'text-slate-600 hover:bg-slate-50'}" onclick="window.switchOTTab('roster')">
          📅 Duty Roster
        </button>
        <button class="px-5 py-3 rounded-lg text-sm font-medium transition-all ${activeOTTab === 'pacu' ? 'bg-[#1B3A5C] text-white shadow-sm font-bold' : 'text-slate-600 hover:bg-slate-50'}" onclick="window.switchOTTab('pacu')">
          🛌 PACU Recovery Room
        </button>
        <button class="px-5 py-3 rounded-lg text-sm font-medium transition-all ${activeOTTab === 'cssd' ? 'bg-[#1B3A5C] text-white shadow-sm font-bold' : 'text-slate-600 hover:bg-slate-50'}" onclick="window.switchOTTab('cssd')">
          🧼 CSSD & Equipment
        </button>
        <button class="px-5 py-3 rounded-lg text-sm font-medium transition-all ${activeOTTab === 'reports' ? 'bg-[#1B3A5C] text-white shadow-sm font-bold' : 'text-slate-600 hover:bg-slate-50'}" onclick="window.switchOTTab('reports')">
          📈 Reports & Analytics
        </button>
        <button class="px-5 py-3 rounded-lg text-sm font-medium transition-all ${activeOTTab === 'audit' ? 'bg-[#1B3A5C] text-white shadow-sm font-bold' : 'text-slate-600 hover:bg-slate-50'}" onclick="window.switchOTTab('audit')">
          🔬 Medico-Legal Audit Log
        </button>
      </div>

      <!-- Active Sub-Workspace Content -->
      <div id="ot-workspace" class="space-y-6">
        <!-- Rendered dynamically -->
      </div>
    </div>
  `;

  renderOTTabContent();
}

function renderOTTabContent() {
  const workspace = document.getElementById('ot-workspace');
  if (!workspace) return;

  if (activeOTTab === "dashboard") {
    renderOTDashboard(workspace);
  } else if (activeOTTab === "schedule") {
    renderOTSchedule(workspace);
  } else if (activeOTTab === "scheduler") {
    renderOTGridBoard(workspace);
  } else if (activeOTTab === "pacu") {
    renderOTPacuRecovery(workspace);
  } else if (activeOTTab === "cssd") {
    renderOTCssdMaster(workspace);
  } else if (activeOTTab === "reports") {
    renderOTReports(workspace);
  } else if (activeOTTab === "audit") {
    renderOTAuditTrail(workspace);
  } else if (activeOTTab === "consents") {
    renderOTConsents(workspace);
  } else if (activeOTTab === "roster") {
    renderOTRoster(workspace);
  }
}

function renderUnifiedTabContent() {
  const workspace = document.getElementById('ot-workspace');
  if (workspace) {
    renderOTTabContent();
  }
  const space = document.getElementById('case-detail-sub-workspace');
  if (space) {
    const c = state.ot.scheduledCases.find(cs => cs.id === activeOTCaseId);
    if (c) renderOTCasePanel(space, c);
  }
}

/* ==========================================================================
   PART 1: OT DASHBOARD
   ========================================================================== */
function renderOTDashboard(space) {
  const scheduledCount = state.ot.scheduledCases.filter(c => c.status === "Scheduled").length;
  const inProgress = state.ot.scheduledCases.filter(c => c.status === "Intra-Op").length;
  const completedCount = state.ot.scheduledCases.filter(c => c.status === "Completed").length;
  const activeTheatres = state.ot.theatres.filter(t => t.status === "Active").length;

  space.innerHTML = `
    <!-- Top metrics panels -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div class="bg-white border border-slate-200 p-5 rounded-xl shadow-sm flex items-center justify-between">
        <div>
          <div class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Scheduled Today</div>
          <div class="text-2xl font-bold text-slate-800 mt-1">${scheduledCount} cases</div>
        </div>
        <span class="text-3xl text-slate-300">🗓️</span>
      </div>
      <div class="bg-white border border-slate-200 p-5 rounded-xl shadow-sm flex items-center justify-between">
        <div>
          <div class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active In-Surgery</div>
          <div class="text-2xl font-bold text-emerald-600 mt-1 animate-pulse">${inProgress} active</div>
        </div>
        <span class="text-3xl text-emerald-300">😷</span>
      </div>
      <div class="bg-white border border-slate-200 p-5 rounded-xl shadow-sm flex items-center justify-between">
        <div>
          <div class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Sterile Trays Available</div>
          <div class="text-2xl font-bold text-slate-800 mt-1">${state.ot.instrumentSets.filter(s => s.status === 'Available').length} sets</div>
        </div>
        <span class="text-3xl text-blue-300">🧼</span>
      </div>
      <div class="bg-white border border-slate-200 p-5 rounded-xl shadow-sm flex items-center justify-between">
        <div>
          <div class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Theatres</div>
          <div class="text-2xl font-bold text-slate-800 mt-1">${activeTheatres} OTs</div>
        </div>
        <span class="text-3xl text-slate-300">🏥</span>
      </div>
    </div>

    <!-- Active schedule view list -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
        <div class="flex justify-between items-center pb-3 border-b border-slate-100">
          <h2 class="text-base font-bold text-slate-900">⚡ Live Theatre Scheduler Activity</h2>
          <span class="text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full font-semibold">Turnover buffer: 30-40 min</span>
        </div>

        <div class="divide-y divide-slate-100">
          ${state.ot.scheduledCases.map(c => `
            <div class="py-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
              <div>
                <div class="flex items-center gap-2">
                  <span class="text-[10px] bg-[#1B3A5C]/10 text-[#1B3A5C] font-mono px-2 py-0.5 rounded font-bold">${c.id}</span>
                  <span class="text-[10px] font-bold ${c.priority === 'Emergency' ? 'bg-red-550 text-white animate-pulse' : 'bg-amber-100 text-amber-800'} px-2 py-0.5 rounded uppercase">${c.priority}</span>
                  <span class="text-xs text-slate-400 font-medium">${c.time} | ${c.duration} duration</span>
                </div>
                <div class="font-bold text-slate-800 text-sm mt-1">${c.patientName} (${c.age}Y/${c.gender})</div>
                <div class="text-xs text-slate-500 font-semibold">${c.procedure} &bull; <span class="text-[#1B3A5C]">${c.surgeon}</span></div>
              </div>
              <div class="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
                <span class="text-xs font-mono bg-slate-50 border border-slate-200 text-slate-700 px-2 py-1 rounded font-bold">${c.theatre}</span>
                <span class="px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider ${
                  c.status === 'Completed' ? 'bg-slate-100 text-slate-600' :
                  c.status === 'Intra-Op' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 animate-pulse' :
                  c.status === 'PACU' ? 'bg-purple-100 text-purple-800' :
                  'bg-blue-100 text-blue-800'
                }">${c.status}</span>
                <button class="bg-[#1B3A5C] hover:bg-slate-850 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition" onclick="window.openOTCaseCockpit('${c.id}')">
                  Manage Case
                </button>
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <div class="space-y-6">
        <!-- Safety compliance card -->
        <div class="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
          <h3 class="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center justify-between">
            <span>🛡️ NABH Safety Checks</span>
            <span class="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">100% WHO Target</span>
          </h3>
          <div class="space-y-3 text-xs">
            <div class="flex justify-between items-center p-2.5 rounded bg-slate-50 border border-slate-200">
              <span class="font-medium text-slate-600">WHO Checklist Sign-in Compliance:</span>
              <span class="font-bold text-emerald-600">100%</span>
            </div>
            <div class="flex justify-between items-center p-2.5 rounded bg-slate-50 border border-slate-200">
              <span class="font-medium text-slate-600">Time-Out Verification Rate:</span>
              <span class="font-bold text-emerald-600">100%</span>
            </div>
            <div class="flex justify-between items-center p-2.5 rounded bg-slate-50 border border-slate-200">
              <span class="font-medium text-slate-600">Instrument Count Discrepancy:</span>
              <span class="font-bold text-emerald-600">0 Reported</span>
            </div>
          </div>
        </div>

        <!-- Autoclave logs alerts -->
        <div class="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
          <h3 class="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center justify-between">
            <span>🧼 Sterility Shelf-life Expiries</span>
            <span class="text-[10px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-bold">CSSD Alerts</span>
          </h3>
          <div class="space-y-2 text-xs">
            ${state.ot.instrumentSets.map(s => {
              const daysLeft = Math.ceil((new Date(s.expiry) - new Date()) / (1000 * 60 * 60 * 24));
              const badgeClass = daysLeft <= 2 ? 'bg-red-550 text-white font-bold' : 'bg-slate-50 text-slate-600 border border-slate-200';
              return `
                <div class="p-2.5 rounded ${badgeClass} flex justify-between items-center">
                  <div>
                    <div class="font-bold">${s.name}</div>
                    <span class="font-mono text-[10px] text-slate-400">${s.code}</span>
                  </div>
                  <span class="font-bold text-[10px]">${daysLeft <= 0 ? 'Expired sterility' : daysLeft + ' days left'}</span>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      </div>
    </div>
  `;
}

/* ==========================================================================
   PART 2: DAILY SURGICAL BOARD & COCKPIT (THE ACTION AREA)
   ========================================================================== */
function renderOTSchedule(space) {
  if (activeOTCaseId) {
    renderOTCaseCockpit(space, activeOTCaseId);
    return;
  }

  const pendingRequests = state.ot.scheduledCases.filter(c => c.status === "Requested");
  const approvedCases = state.ot.scheduledCases.filter(c => c.status !== "Requested" && (!otCaseFilterTheatre || c.theatre === otCaseFilterTheatre));

  space.innerHTML = `
    <!-- Pending Clinician OT Requests Queue -->
    ${pendingRequests.length > 0 ? `
      <div class="bg-[#1B3A5C]/5 border border-[#1B3A5C]/20 rounded-xl p-5 shadow-sm space-y-4 text-left">
        <h3 class="text-sm font-bold text-slate-900 flex items-center gap-2">
          <span>📋 Pending Doctor OT Booking Requests</span>
          <span class="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full">${pendingRequests.length} pending review</span>
        </h3>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          ${pendingRequests.map(r => `
            <div class="p-4 bg-white border border-slate-200 rounded-xl flex flex-col justify-between gap-3 shadow-sm hover:border-slate-350 transition">
              <div>
                <div class="flex items-center justify-between">
                  <span class="text-[10px] bg-slate-100 font-mono font-bold px-2 py-0.5 rounded text-slate-700">${r.id}</span>
                  <span class="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded uppercase">${r.priority}</span>
                </div>
                <div class="font-bold text-slate-800 text-xs mt-1.5">${r.patientName} (${r.age}Y/${r.gender})</div>
                <div class="text-[11px] text-slate-600 mt-1 font-semibold">Procedure: ${r.procedure}</div>
                <div class="text-[10px] text-slate-500 mt-0.5">Surgeon: ${r.surgeon} &bull; Theatre Room: <span class="font-bold text-slate-700">${r.theatre}</span></div>
                <div class="text-[10px] text-slate-400 mt-1 font-mono">Suggested Slot: ${r.date} &bull; ${r.time} (${r.duration} hrs)</div>
              </div>
              
              <div class="flex items-center gap-2 border-t pt-3 mt-1">
                <button class="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-1.5 rounded text-[10px] shadow-sm transition" onclick="window.approveOTRequest('${r.id}')">
                  ✔️ Approve Slot
                </button>
                <button class="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold py-1.5 rounded text-[10px] transition" onclick="window.openRescheduleRequestModal('${r.id}')">
                  🗓️ Re-schedule Slot
                </button>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    ` : ''}

    <div class="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-6">
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <h2 class="text-base font-bold text-slate-900">📋 Daily Operating List Dashboard</h2>
          <p class="text-xs text-slate-400">Filters cases currently in progress, scheduled or waiting in PACU.</p>
        </div>

        <div class="flex flex-wrap gap-3">
          <select class="rounded-lg border border-slate-300 px-3 py-1.5 text-xs outline-none bg-white" onchange="window.filterOTListTheatre(this.value)">
            <option value="">All Operating Theatres</option>
            ${state.ot.theatres.map(t => `<option value="${t.code}" ${otCaseFilterTheatre === t.code ? 'selected' : ''}>${t.name}</option>`).join('')}
          </select>
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-slate-200 text-xs text-left">
          <thead class="bg-slate-50 text-slate-500 uppercase font-semibold">
            <tr>
              <th class="px-6 py-3">Case ID</th>
              <th class="px-6 py-3">Patient Details</th>
              <th class="px-6 py-3">Planned Surgery</th>
              <th class="px-6 py-3">Surgical Team</th>
              <th class="px-6 py-3">Theatre / Time</th>
              <th class="px-6 py-3">Safe Status</th>
              <th class="px-6 py-3 text-center">Status</th>
              <th class="px-6 py-3 text-center">Cockpit</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200 bg-white">
            ${approvedCases.length === 0 ? `
              <tr>
                <td colspan="8" class="px-6 py-10 text-center text-slate-400 italic">No approved scheduled cases active today.</td>
              </tr>
            ` : approvedCases.map(c => `
                <tr class="hover:bg-slate-50/50">
                  <td class="px-6 py-4 font-mono font-bold text-slate-900">${c.id}</td>
                  <td class="px-6 py-4">
                    <div class="font-bold text-slate-800">${c.patientName}</div>
                    <span class="text-[10px] text-slate-400 font-mono">${c.patientUhid} | Ward: ${c.bed}</span>
                  </td>
                  <td class="px-6 py-4">
                    <div class="font-semibold text-slate-800">${c.procedure}</div>
                    <span class="text-[10px] text-slate-400 truncate max-w-[200px] block">${c.diagnosis}</span>
                  </td>
                  <td class="px-6 py-4">
                    <div class="font-semibold text-slate-800">Surgeon: ${c.surgeon}</div>
                    <span class="text-[10px] text-[#1B3A5C] font-semibold">Anaesthetist: ${c.anaesthetist}</span>
                  </td>
                  <td class="px-6 py-4 font-semibold text-slate-700">
                    <div class="font-bold">${c.theatre}</div>
                    <span class="text-[10px] text-slate-500">${c.time} (${c.duration} hrs)</span>
                  </td>
                  <td class="px-6 py-4">
                    <div class="flex items-center gap-1.5">
                      <span class="inline-block w-2.5 h-2.5 rounded-full ${c.preOpChecklist.holdingComplete ? 'bg-emerald-500' : 'bg-amber-400'}"></span>
                      <span class="text-[10px] font-bold text-slate-600">${c.preOpChecklist.holdingComplete ? 'HOLDING OK' : 'PRE-OP PENDING'}</span>
                    </div>
                  </td>
                  <td class="px-6 py-4 text-center">
                    <span class="px-2.5 py-1 rounded text-[10px] font-bold uppercase ${
                      c.status === 'Completed' ? 'bg-slate-100 text-slate-600' :
                      c.status === 'Intra-Op' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 animate-pulse' :
                      c.status === 'PACU' ? 'bg-purple-100 text-purple-800' :
                      'bg-blue-100 text-blue-800'
                    }">${c.status}</span>
                  </td>
                  <td class="px-6 py-4 text-center">
                    <button class="bg-[#1B3A5C] hover:bg-slate-850 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition" onclick="window.openOTCaseCockpit('${c.id}')">
                      Launch 🚀
                    </button>
                  </td>
                </tr>
              `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

window.approveOTRequest = function(caseId) {
  const c = state.ot.scheduledCases.find(cs => cs.id === caseId);
  if (c) {
    c.status = "Scheduled";
    state.ot.auditTrail.push({
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 23) + " IST",
      user: window.state.activeUserRole || "Admin",
      role: "OT Incharge",
      action: "Request Approved",
      target: caseId,
      remarks: `Approved clinician OT booking for ${c.patientName} in room ${c.theatre} at ${c.time}.`
    });
    alert(`Clinician OT Request ${caseId} approved and scheduled successfully.`);
    renderUnifiedTabContent();
  }
};

window.openRescheduleRequestModal = function(caseId) {
  const c = state.ot.scheduledCases.find(cs => cs.id === caseId);
  if (!c) return;

  let modal = document.getElementById('ot-reschedule-modal-overlay');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'ot-reschedule-modal-overlay';
    modal.className = "fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900 bg-opacity-50 backdrop-blur-sm p-4";
    document.body.appendChild(modal);
  }

  modal.innerHTML = `
    <div class="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md p-6 font-sans antialiased text-slate-800 text-xs space-y-4 text-left">
      <div class="flex items-center justify-between border-b pb-2">
        <h3 class="text-sm font-bold text-slate-900">🗓️ Reschedule Clinical OT Request</h3>
        <button class="text-slate-400 font-bold" onclick="window.closeRescheduleRequestModal()">✕</button>
      </div>

      <form id="ot-reschedule-form" class="space-y-3" onsubmit="event.preventDefault(); window.saveRescheduledOTRequest('${caseId}');">
        <div>
          <label class="block text-[10px] font-bold text-slate-400 uppercase mb-1">Select OT Theatre Room</label>
          <select id="resched-room" class="w-full border rounded p-2 bg-white">
            ${state.ot.theatres.map(t => `<option value="${t.code}" ${t.code === c.theatre ? 'selected' : ''}>${t.name} (${t.speciality})</option>`).join('')}
          </select>
        </div>
        
        <div>
          <label class="block text-[10px] font-bold text-slate-400 uppercase mb-1">Preferred Slot Date</label>
          <input type="date" id="resched-date" class="w-full border rounded p-2 bg-white font-mono" value="${c.date}" required>
        </div>

        <div>
          <label class="block text-[10px] font-bold text-slate-400 uppercase mb-1">Preferred Slot Time (HH:MM)</label>
          <input type="text" id="resched-time" class="w-full border rounded p-2 bg-white font-mono" value="${c.time}" required>
        </div>

        <div class="flex justify-end gap-3 pt-3">
          <button type="button" class="border px-3 py-1.5 rounded" onclick="window.closeRescheduleRequestModal()">Cancel</button>
          <button type="submit" class="bg-[#1B3A5C] text-white px-4 py-1.5 rounded font-bold">Update & Approve Slot</button>
        </div>
      </form>
    </div>
  `;
};

window.closeRescheduleRequestModal = function() {
  const modal = document.getElementById('ot-reschedule-modal-overlay');
  if (modal) modal.remove();
};

window.saveRescheduledOTRequest = function(caseId) {
  const room = document.getElementById('resched-room')?.value;
  const date = document.getElementById('resched-date')?.value;
  const time = document.getElementById('resched-time')?.value;

  const c = state.ot.scheduledCases.find(cs => cs.id === caseId);
  if (c) {
    // Check theatre room speciality matching
    const selectedTheatre = state.ot?.theatres?.find(t => t.code === room);
    let specialityMatches = true;
    if (selectedTheatre) {
      const tSpec = selectedTheatre.speciality.toLowerCase();
      const pName = c.procedure.toLowerCase();
      if (tSpec === "orthopaedics" && !(pName.includes("knee") || pName.includes("arthroplasty") || pName.includes("fracture"))) {
        specialityMatches = false;
      } else if (tSpec === "obg" && !pName.includes("caesarean") && !pName.includes("lscs") && !pName.includes("hysterectomy")) {
        specialityMatches = false;
      } else if (tSpec === "general surgery" && (pName.includes("caesarean") || pName.includes("knee"))) {
        specialityMatches = false;
      }
    }

    if (!specialityMatches && selectedTheatre) {
      const confirmRoomOverride = confirm(`⚠️ THEATRE SPECIALITY MISMATCH:\nYou are rescheduling ${c.procedure} to ${selectedTheatre.name} (Speciality: ${selectedTheatre.speciality}).\n\nDo you want to authorize this cross-theatre allocation?`);
      if (!confirmRoomOverride) {
        return;
      }
    }

    const oldRoom = c.theatre;
    const oldTime = c.time;
    
    c.theatre = room;
    c.date = date;
    c.time = time;
    c.status = "Scheduled";

    state.ot.auditTrail.push({
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 23) + " IST",
      user: window.state.activeUserRole || "Admin",
      role: "OT Incharge",
      action: "Request Rescheduled & Approved",
      target: caseId,
      remarks: `Rescheduled OT request from room ${oldRoom} at ${oldTime} to room ${room} at ${time}.`
    });

    window.closeRescheduleRequestModal();
    alert(`OT request ${caseId} updated to new slot and approved.`);
    renderUnifiedTabContent();
  }
};

window.filterOTListTheatre = function(val) {
  otCaseFilterTheatre = val;
  renderOTTabContent();
};

window.openOTCaseCockpit = function(caseId) {
  activeOTCaseId = caseId;
  const container = document.getElementById('main-content');
  renderOTModule(container);
};

window.closeOTCaseCockpit = function() {
  activeOTCaseId = null;
  selectedCasePanel = "preop";
  const container = document.getElementById('main-content');
  renderOTModule(container);
};

/* ==========================================================================
   PART 3: CASE WORKSPACE & TIMELINE (COCKPIT PANEL DETAILS)
   ========================================================================== */
function renderOTCaseCockpit(space, caseId) {
  const c = state.ot.scheduledCases.find(cs => cs.id === caseId);
  if (!c) {
    space.innerHTML = `<div class="p-6 text-red-650 font-bold">Case not found in scheduled list.</div>`;
    return;
  }

  space.innerHTML = `
    <!-- Top cockpit details card -->
    <div class="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
      <div class="flex items-center justify-between border-b border-slate-100 pb-4">
        <div class="flex items-center gap-3">
          <button class="text-slate-500 hover:text-slate-900 font-bold border rounded px-2.5 py-1 text-xs bg-white" onclick="window.closeOTCaseCockpit()">← Back to list</button>
          <div>
            <h2 class="text-base font-bold text-slate-900">${c.patientName} (${c.age}Y/${c.gender})</h2>
            <p class="text-xs text-slate-500 mt-0.5">Case ID: <span class="font-mono font-bold">${c.id}</span> | UHID: <span class="font-mono font-bold">${c.patientUhid}</span> &bull; Status: <span class="text-indigo-650 font-bold uppercase">${c.status}</span></p>
          </div>
        </div>
        <div class="flex items-center gap-3">
          <label class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Clinical Status Action Desk:</label>
          <select id="cockpit-status-switcher" class="rounded border px-2.5 py-1.5 text-xs font-bold bg-[#1B3A5C] text-white" onchange="window.switchCaseActualStatus('${c.id}', this.value)">
            <option value="Scheduled" ${c.status === 'Scheduled' ? 'selected' : ''}>Scheduled</option>
            <option value="Shifting" ${c.status === 'Shifting' ? 'selected' : ''}>Shifting Patient</option>
            <option value="Pre-Op" ${c.status === 'Pre-Op' ? 'selected' : ''}>Pre-Operative Bedside</option>
            <option value="Intra-Op" ${c.status === 'Intra-Op' ? 'selected' : ''}>Intra-Operative (Surgery Live)</option>
            <option value="PACU" ${c.status === 'PACU' ? 'selected' : ''}>PACU Recovery Stay</option>
            <option value="Completed" ${c.status === 'Completed' ? 'selected' : ''}>Case Completed</option>
            <option value="Cancelled" ${c.status === 'Cancelled' ? 'selected' : ''}>Case Cancelled</option>
          </select>
        </div>
      </div>

      <!-- Quick summary row -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
        <div>
          <span class="text-slate-400 font-medium block">Planned Surgery</span>
          <span class="font-bold text-slate-700">${c.procedure}</span>
        </div>
        <div>
          <span class="text-slate-400 font-medium block">Surgical Team</span>
          <span class="font-bold text-slate-700">Surgeon: ${c.surgeon} | Anaesthetist: ${c.anaesthetist}</span>
        </div>
        <div>
          <span class="text-slate-400 font-medium block">Theatre Allocation</span>
          <span class="font-bold text-slate-700">${c.theatre} | Time: ${c.time}</span>
        </div>
        <div>
          <span class="text-slate-400 font-medium block">Blood Reservation</span>
          <span class="font-bold text-emerald-600">${c.bloodUnits} &bull; Status: ${c.bloodStatus}</span>
        </div>
      </div>
    </div>

    <!-- Sub-tab panel selector -->
    <div class="flex border-b border-slate-200 bg-white rounded-xl shadow-sm p-1 gap-1">
      <button class="px-4 py-2.5 rounded-lg text-xs font-semibold transition-all ${selectedCasePanel === 'preop' ? 'bg-[#1B3A5C] text-white shadow-sm font-bold' : 'text-slate-600 hover:bg-slate-50'}" onclick="window.switchOTCasePanel('preop')">
        📋 1. Pre-Op Checklist & Anaesthesia Review
      </button>
      <button class="px-4 py-2.5 rounded-lg text-xs font-semibold transition-all ${selectedCasePanel === 'intraop' ? 'bg-[#1B3A5C] text-white shadow-sm font-bold' : 'text-slate-600 hover:bg-slate-50'}" onclick="window.switchOTCasePanel('intraop')">
        😷 2. Intra-Op Safeties & Vitals Log
      </button>
      <button class="px-4 py-2.5 rounded-lg text-xs font-semibold transition-all ${selectedCasePanel === 'anaesthesia' ? 'bg-[#1B3A5C] text-white shadow-sm font-bold' : 'text-slate-600 hover:bg-slate-50'}" onclick="window.switchOTCasePanel('anaesthesia')">
        🧪 3. Anaesthesia & Narcotic Record
      </button>
      <button class="px-4 py-2.5 rounded-lg text-xs font-semibold transition-all ${selectedCasePanel === 'postop' ? 'bg-[#1B3A5C] text-white shadow-sm font-bold' : 'text-slate-600 hover:bg-slate-50'}" onclick="window.switchOTCasePanel('postop')">
        🛌 4. Post-Op PACU Recovery Room
      </button>
      <button class="px-4 py-2.5 rounded-lg text-xs font-semibold transition-all ${selectedCasePanel === 'billing' ? 'bg-[#1B3A5C] text-white shadow-sm font-bold' : 'text-slate-600 hover:bg-slate-50'}" onclick="window.switchOTCasePanel('billing')">
        💳 5. OT Charges & Consumables Billing
      </button>
    </div>

    <!-- Active Detail Workspace -->
    <div id="case-detail-sub-workspace" class="space-y-6">
      <!-- Rendered dynamically -->
    </div>
  `;

  renderOTCasePanel(document.getElementById('case-detail-sub-workspace'), c);
}

window.switchCaseActualStatus = function(caseId, status) {
  const c = state.ot.scheduledCases.find(cs => cs.id === caseId);
  if (c) {
    c.status = status;
    state.ot.auditTrail.push({
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 23) + " IST",
      user: window.state.activeUserRole || "Admin",
      role: "OT Incharge",
      action: "Status Update",
      target: c.id,
      remarks: `Surgery case state changed manually to ${status}.`
    });
    
    // Auto post charges if status becomes "Completed"
    if (status === "Completed") {
      window.postOTCaseChargesToBilling(c);
    }
    
    const container = document.getElementById('main-content');
    renderOTModule(container);
  }
};

function renderOTCasePanel(space, c) {
  if (!c) {
    c = state.ot.scheduledCases.find(cs => cs.id === activeOTCaseId);
  }
  if (!c) return;

  if (selectedCasePanel === "preop") {
    renderPreOpPanel(space, c);
  } else if (selectedCasePanel === "intraop") {
    renderIntraOpPanel(space, c);
  } else if (selectedCasePanel === "anaesthesia") {
    renderAnaesthesiaPanel(space, c);
  } else if (selectedCasePanel === "postop") {
    renderPostOpPACUPanel(space, c);
  } else if (selectedCasePanel === "billing") {
    renderOTBillingPanel(space, c);
  }
}

/* ==========================================================================
   PART 3.1: PRE-OP PANEL
   ========================================================================== */
function renderPreOpPanel(space, c) {
  space.innerHTML = `
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 text-left">
      <!-- Pre-Op Nurse checklist -->
      <div class="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
        <h3 class="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2">📋 Clinical Pre-Op Nurse Checklist</h3>
        
        <div class="space-y-3 text-xs">
          <label class="flex items-center gap-3 p-2 bg-slate-50 border rounded-lg hover:bg-slate-100 cursor-pointer">
            <input type="checkbox" class="h-4 w-4 rounded text-[#1B3A5C]" ${c.preOpChecklist.wardComplete ? 'checked' : ''} onchange="window.togglePreOpCheck(this, '${c.id}', 'wardComplete')">
            <div>
              <span class="font-bold text-slate-700">Patient Identification wristband verified</span>
              <p class="text-[10px] text-slate-400">Match name and UHID against clinical folder.</p>
            </div>
          </label>

          <label class="flex items-center gap-3 p-2 bg-slate-50 border rounded-lg hover:bg-slate-100 cursor-pointer">
            <input type="checkbox" class="h-4 w-4 rounded text-[#1B3A5C]" ${c.preOpChecklist.siteMarked ? 'checked' : ''} onchange="window.togglePreOpCheck(this, '${c.id}', 'siteMarked')">
            <div>
              <span class="font-bold text-slate-700">Surgical Site Marking Done</span>
              <p class="text-[10px] text-slate-400">Marked by primary surgeon (mandatory for lateralised limbs).</p>
            </div>
          </label>

          <label class="flex items-center gap-3 p-2 bg-slate-50 border rounded-lg hover:bg-slate-100 cursor-pointer">
            <input type="checkbox" class="h-4 w-4 rounded text-[#1B3A5C]" ${c.preOpChecklist.holdingComplete ? 'checked' : ''} onchange="window.togglePreOpCheck(this, '${c.id}', 'holdingComplete')">
            <div>
              <span class="font-bold text-slate-700">Patient NPO Status Confirmed</span>
              <p class="text-[10px] text-slate-400">Nil Per Os: Solid food NPO since ${c.preOpChecklist.npoSolid}.</p>
            </div>
          </label>
        </div>

        <div class="border-t border-slate-150 pt-3 mt-3">
          <span class="block text-[10px] font-bold text-slate-400 uppercase mb-2">📜 Required Consent Verification</span>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
            <label class="flex items-center gap-2 p-1.5 border rounded bg-slate-50">
              <input type="checkbox" ${c.consentChecklist?.surgical ? 'checked' : ''} onchange="window.updateConsentStatus('${c.id}', 'surgical', this.checked)">
              <span>Surgical Consent</span>
            </label>
            <label class="flex items-center gap-2 p-1.5 border rounded bg-slate-50">
              <input type="checkbox" ${c.consentChecklist?.anaesthesia ? 'checked' : ''} onchange="window.updateConsentStatus('${c.id}', 'anaesthesia', this.checked)">
              <span>Anaesthesia Consent</span>
            </label>
            <label class="flex items-center gap-2 p-1.5 border rounded bg-slate-50">
              <input type="checkbox" ${c.consentChecklist?.blood ? 'checked' : ''} onchange="window.updateConsentStatus('${c.id}', 'blood', this.checked)">
              <span>Blood Transfusion Consent</span>
            </label>
            <label class="flex items-center gap-2 p-1.5 border rounded bg-slate-50">
              <input type="checkbox" ${c.consentChecklist?.implant ? 'checked' : ''} onchange="window.updateConsentStatus('${c.id}', 'implant', this.checked)">
              <span>Implant Consent</span>
            </label>
          </div>
        </div>
      </div>

      <!-- Pre-Op Anaesthesia Assessment & Investigations -->
      <div class="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
        <h3 class="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2">🩺 Pre-Anaesthetic Evaluation & Investigations</h3>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div>
            <label class="block text-[10px] font-bold text-slate-400 uppercase">ASA Physical Classification</label>
            <select class="mt-1 block w-full rounded border border-slate-300 p-1.5 bg-white font-semibold text-slate-700" onchange="window.updatePreOpAssessmentField('${c.id}', 'asaStatus', this.value)">
              <option value="ASA I" ${c.preOpChecklist.asaStatus === 'ASA I' ? 'selected' : ''}>ASA I: Healthy Patient</option>
              <option value="ASA II" ${c.preOpChecklist.asaStatus === 'ASA II' ? 'selected' : ''}>ASA II: Mild Systemic Disease</option>
              <option value="ASA III" ${c.preOpChecklist.asaStatus === 'ASA III' ? 'selected' : ''}>ASA III: Severe Systemic Disease</option>
              <option value="ASA IV" ${c.preOpChecklist.asaStatus === 'ASA IV' ? 'selected' : ''}>ASA IV: Life Threatening Comorbidity</option>
            </select>
          </div>
          <div>
            <label class="block text-[10px] font-bold text-slate-400 uppercase">Mallampati Airway Grade</label>
            <select class="mt-1 block w-full rounded border border-slate-300 p-1.5 bg-white font-semibold text-slate-700">
              <option>Class I: Soft palate, fauces fully visible</option>
              <option selected>Class II: Soft palate, fauces partially visible</option>
              <option>Class III: Only soft palate visible</option>
              <option>Class IV: Hard palate only</option>
            </select>
          </div>
        </div>

        <div class="border-t border-slate-150 pt-3">
          <span class="block text-[10px] font-bold text-slate-400 uppercase mb-2">🧪 Pre-Op Lab & Diagnostics Review</span>
          <div class="space-y-2">
            ${(c.preOpInvestigations || []).map((inv, idx) => `
              <div class="p-2 border rounded-lg bg-slate-50 flex items-center justify-between text-xs">
                <div>
                  <span class="font-bold text-slate-800">${inv.test}</span>
                  <span class="block text-[10px] text-slate-500 font-mono">${inv.value}</span>
                </div>
                <div class="flex items-center gap-2">
                  <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">${inv.status}</span>
                  <label class="flex items-center gap-1 cursor-pointer">
                    <input type="checkbox" ${inv.reviewed ? 'checked' : ''} onchange="window.togglePreOpInvestigation('${c.id}', ${idx}, this.checked)">
                    <span class="text-[10px] text-slate-600 font-semibold">Reviewed</span>
                  </label>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    </div>
  `;
}

window.togglePreOpCheck = function(el, caseId, field) {
  const c = state.ot.scheduledCases.find(cs => cs.id === caseId);
  if (c) {
    c.preOpChecklist[field] = el.checked;
    c.preOpChecklist.holdingComplete = c.preOpChecklist.wardComplete && c.preOpChecklist.siteMarked;
    renderUnifiedTabContent();
  }
};

window.updatePreOpAssessmentField = function(caseId, field, val) {
  const c = state.ot.scheduledCases.find(cs => cs.id === caseId);
  if (c) {
    c.preOpChecklist[field] = val;
    renderUnifiedTabContent();
  }
};

window.updateConsentStatus = function(caseId, consentType, checked) {
  const c = state.ot.scheduledCases.find(cs => cs.id === caseId);
  if (c) {
    if (!c.consentChecklist) c.consentChecklist = {};
    c.consentChecklist[consentType] = checked;
    state.ot.auditTrail.push({
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 23) + " IST",
      user: window.state.activeUserRole || "Admin",
      role: "OT Incharge",
      action: "Consent Verification",
      target: caseId,
      remarks: `${consentType.toUpperCase()} consent checked status changed to ${checked}.`
    });
    renderUnifiedTabContent();
  }
};

window.togglePreOpInvestigation = function(caseId, idx, checked) {
  const c = state.ot.scheduledCases.find(cs => cs.id === caseId);
  if (c && c.preOpInvestigations && c.preOpInvestigations[idx]) {
    c.preOpInvestigations[idx].reviewed = checked;
    state.ot.auditTrail.push({
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 23) + " IST",
      user: window.state.activeUserRole || "Admin",
      role: "Anaesthetist",
      action: "Investigation Reviewed",
      target: caseId,
      remarks: `Reviewed diagnostic result: ${c.preOpInvestigations[idx].test}.`
    });
    renderUnifiedTabContent();
  }
};

/* ==========================================================================
   PART 3.2: INTRA-OP PANEL (SURGERY WORKSPACE WITH WHO CHECKS)
   ========================================================================== */
function renderIntraOpPanel(space, c) {
  // Check emergency blood standby
  const isEmergency = c.priority === "Emergency" || c.id.startsWith("OT-CRASH");

  // Format elapsed tourniquet time if active
  let tourniquetStatusText = "Off";
  if (c.tourniquetInflated) {
    tourniquetStatusText = `Inflated at ${c.tourniquetInflatedTime}`;
  }

  space.innerHTML = `
    <!-- Emergency Blood standby banner alert -->
    ${isEmergency ? `
      <div class="bg-red-50 border-l-4 border-red-500 p-4 rounded-xl mb-6 shadow-sm flex items-center justify-between animate-pulse">
        <div class="flex items-center gap-3">
          <span class="text-xl">🚨</span>
          <div>
            <h4 class="font-bold text-red-800 text-xs uppercase">EMERGENCY O-NEGATIVE BLOOD STANDBY ACTIVE</h4>
            <p class="text-[10px] text-red-600 mt-0.5">Blood Bank dispatched 4 Units uncrossmatched O-Neg PRBC. Crossmatch override authorized by Trauma HOD.</p>
          </div>
        </div>
        <span class="text-[10px] bg-red-650 text-white font-bold px-2 py-1 rounded">LIFE-THREATENING AUTO-RELEASE</span>
      </div>
    ` : ''}

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 text-left">
      
      <!-- Left Column: WHO Safety checklist & Positioning / Tourniquet -->
      <div class="lg:col-span-2 space-y-6">
        
        <!-- WHO safety checklists -->
        <div class="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
          <h3 class="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2 flex justify-between items-center">
            <span>📋 WHO Surgical Safety Checklist (WHO Pause Points)</span>
            <span class="text-[10px] text-slate-400">NABH Quality Safe Surgery standard</span>
          </h3>
          
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <!-- Sign In -->
            <div class="p-3 bg-blue-50/50 border border-blue-200 rounded-lg">
              <div class="flex items-center justify-between mb-2">
                <span class="font-bold text-slate-800">1. SIGN IN (Pre-Induction)</span>
                <input type="checkbox" class="h-4 w-4 text-blue-600" ${c.whoChecklist.signIn ? 'checked' : ''} onchange="window.toggleWhoSign('${c.id}', 'signIn', this.checked)">
              </div>
              <div class="text-[10px] text-slate-500 space-y-1">
                <div>&bull; Patient identity & site verified</div>
                <div>&bull; Anaesthesia machine check OK</div>
                <div>&bull; Pulse oximeter operational</div>
              </div>
            </div>

            <!-- Time Out -->
            <div class="p-3 bg-amber-50/50 border border-amber-200 rounded-lg">
              <div class="flex items-center justify-between mb-2">
                <span class="font-bold text-slate-800">2. TIME OUT (Pre-Incision)</span>
                <input type="checkbox" class="h-4 w-4 text-amber-600" ${c.whoChecklist.timeOut ? 'checked' : ''} onchange="window.toggleWhoSign('${c.id}', 'timeOut', this.checked)">
              </div>
              <div class="text-[10px] text-slate-500 space-y-1">
                <div>&bull; All team members introduced</div>
                <div>&bull; Site / lateral marking confirmed</div>
                <div>&bull; Antibiotics given <60m ago</div>
              </div>
            </div>

            <!-- Sign Out -->
            <div class="p-3 bg-emerald-50/50 border border-emerald-200 rounded-lg">
              <div class="flex items-center justify-between mb-2">
                <span class="font-bold text-slate-800">3. SIGN OUT (Pre-Closure)</span>
                <input type="checkbox" class="h-4 w-4 text-emerald-600" ${c.whoChecklist.signOut ? 'checked' : ''} onchange="window.toggleWhoSign('${c.id}', 'signOut', this.checked)">
              </div>
              <div class="text-[10px] text-slate-500 space-y-1">
                <div>&bull; Instrument/sponge counts correct</div>
                <div>&bull; Specimen labels checked</div>
                <div>&bull; Surgical wound safety closed</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Positioning & Tourniquet Controls -->
        <div class="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
          <h3 class="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2">📐 Positioning & Tourniquet Dashboard</h3>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            <!-- Patient Positioning -->
            <div class="space-y-3">
              <div class="font-bold text-slate-700">Patient Surgical Positioning</div>
              <div>
                <label class="block text-[10px] font-bold text-slate-400 uppercase mb-1">Select Surgical Position</label>
                <select id="position-dropdown" class="w-full border rounded p-1.5 bg-white font-semibold" onchange="window.updatePositioning('${c.id}', this.value)">
                  <option value="Supine" ${c.patientPosition === 'Supine' ? 'selected' : ''}>Supine</option>
                  <option value="Prone" ${c.patientPosition === 'Prone' ? 'selected' : ''}>Prone (Spine/Posterior)</option>
                  <option value="Trendelenburg" ${c.patientPosition === 'Trendelenburg' ? 'selected' : ''}>Trendelenburg</option>
                  <option value="Reverse Trendelenburg" ${c.patientPosition === 'Reverse Trendelenburg' ? 'selected' : ''}>Reverse Trendelenburg</option>
                  <option value="Lithotomy" ${c.patientPosition === 'Lithotomy' ? 'selected' : ''}>Lithotomy (Perineal/OBG)</option>
                  <option value="Lateral Decubitus" ${c.patientPosition === 'Lateral Decubitus' ? 'selected' : ''}>Lateral Decubitus</option>
                  <option value="Beach Chair" ${c.patientPosition === 'Beach Chair' ? 'selected' : ''}>Beach Chair (Shoulder)</option>
                </select>
              </div>
              
              <div class="space-y-2">
                <label class="flex items-center gap-2 cursor-pointer p-1 border rounded bg-slate-50">
                  <input type="checkbox" ${c.positioningChecked ? 'checked' : ''} onchange="window.togglePositionCheck('${c.id}', this.checked)">
                  <span class="font-semibold text-slate-700">Verfied protective padding & pressure points</span>
                </label>
                <p class="text-[10px] text-slate-400 italic">Occiput, heels, brachial plexus nerves checked. Undergarments/jewelry removed.</p>
              </div>
            </div>

            <!-- Tourniquet Control -->
            <div class="space-y-3 border-l pl-6 border-slate-150">
              <div class="font-bold text-slate-700 flex justify-between items-center">
                <span>Pneumatic Tourniquet Control</span>
                <span class="text-[10px] font-mono bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-bold">Status: ${tourniquetStatusText}</span>
              </div>
              
              <div class="grid grid-cols-2 gap-2">
                <div>
                  <label class="block text-[10px] font-bold text-slate-400 uppercase mb-1">Target Limb</label>
                  <select id="tourniquet-limb" class="w-full border rounded p-1 bg-white font-semibold" onchange="window.updateTourniquetLimb('${c.id}', this.value)">
                    <option value="None" ${c.tourniquetLimb === 'None' ? 'selected' : ''}>None</option>
                    <option value="Left Arm" ${c.tourniquetLimb === 'Left Arm' ? 'selected' : ''}>Left Arm</option>
                    <option value="Right Arm" ${c.tourniquetLimb === 'Right Arm' ? 'selected' : ''}>Right Arm</option>
                    <option value="Left Leg" ${c.tourniquetLimb === 'Left Leg' ? 'selected' : ''}>Left Leg</option>
                    <option value="Right Leg" ${c.tourniquetLimb === 'Right Leg' ? 'selected' : ''}>Right Leg</option>
                  </select>
                </div>
                <div>
                  <label class="block text-[10px] font-bold text-slate-400 uppercase mb-1">Pressure (mmHg)</label>
                  <input type="number" id="tourniquet-pressure" class="w-full border rounded p-1 bg-white font-mono font-bold" value="${c.tourniquetPressure || 0}" onchange="window.updateTourniquetPressure('${c.id}', this.value)">
                </div>
              </div>

              <div class="flex items-center gap-2">
                <button class="flex-1 py-1 rounded bg-[#1B3A5C] text-white font-bold hover:bg-slate-800 disabled:opacity-50" ${c.tourniquetLimb === 'None' ? 'disabled' : ''} onclick="window.triggerTourniquetInflate('${c.id}')">
                  Inflate
                </button>
                <button class="flex-1 py-1 rounded bg-red-650 text-white font-bold hover:bg-red-750 disabled:opacity-50" ${!c.tourniquetInflated ? 'disabled' : ''} onclick="window.triggerTourniquetDeflate('${c.id}')">
                  Deflate
                </button>
              </div>

              ${c.tourniquetTotalMinutes > 90 ? `
                <div class="bg-red-50 text-red-800 border border-red-200 p-2 rounded text-[10px] font-bold animate-pulse text-center">
                  ⚠️ TOURNIQUET LIMIT EXCEEDED (>90 min)! Notify Surgeon immediately.
                </div>
              ` : ''}
            </div>
          </div>
        </div>

      </div>

      <!-- Right Column: Counts & Implant Stickers -->
      <div class="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-6">
        
        <!-- Multi instrument count block -->
        <div>
          <h3 class="text-xs font-bold text-slate-800 border-b border-slate-100 pb-2 uppercase tracking-wide">📦 Surgical Count Verification Log</h3>
          
          <div class="space-y-3 mt-3 text-xs">
            <!-- Instruments -->
            <div class="flex justify-between items-center gap-2 p-1.5 bg-slate-50 border rounded-lg">
              <span class="font-bold text-slate-600">Instruments:</span>
              <div class="flex items-center gap-1 font-mono">
                <input type="number" class="w-12 border rounded text-center p-0.5 bg-white font-bold" value="${c.instrumentCount.opening}" onchange="window.updateInstrumentCounts('${c.id}', 'opening', this.value)">
                <span>/</span>
                <input type="number" class="w-12 border rounded text-center p-0.5 bg-white font-bold" value="${c.instrumentCount.closing}" onchange="window.updateInstrumentCounts('${c.id}', 'closing', this.value)">
              </div>
            </div>

            <!-- Needles -->
            <div class="flex justify-between items-center gap-2 p-1.5 bg-slate-50 border rounded-lg">
              <span class="font-bold text-slate-600">Suture Needles:</span>
              <div class="flex items-center gap-1 font-mono">
                <input type="number" class="w-12 border rounded text-center p-0.5 bg-white font-bold" value="${c.instrumentCount.needlesOpening || 10}" onchange="window.updateGenericCounts('${c.id}', 'needlesOpening', this.value)">
                <span>/</span>
                <input type="number" class="w-12 border rounded text-center p-0.5 bg-white font-bold" value="${c.instrumentCount.needlesClosing || 10}" onchange="window.updateGenericCounts('${c.id}', 'needlesClosing', this.value)">
              </div>
            </div>

            <!-- Sponges/Gauze -->
            <div class="flex justify-between items-center gap-2 p-1.5 bg-slate-50 border rounded-lg">
              <span class="font-bold text-slate-600">Gauze/Sponges:</span>
              <div class="flex items-center gap-1 font-mono">
                <input type="number" class="w-12 border rounded text-center p-0.5 bg-white font-bold" value="${c.instrumentCount.spongesOpening || 20}" onchange="window.updateGenericCounts('${c.id}', 'spongesOpening', this.value)">
                <span>/</span>
                <input type="number" class="w-12 border rounded text-center p-0.5 bg-white font-bold" value="${c.instrumentCount.spongesClosing || 20}" onchange="window.updateGenericCounts('${c.id}', 'spongesClosing', this.value)">
              </div>
            </div>

            <!-- Discrepancy Status Warning -->
            ${c.instrumentCount.status.includes("ALERT") ? `
              <div class="p-2 border border-red-300 bg-red-50 text-red-800 rounded-lg font-bold text-[10px] leading-tight space-y-1">
                <div>⚠️ COUNT DISCREPANCY DETECTED!</div>
                <div class="font-normal">Wound closure blocked. Explore surgical field immediately. Order portable X-ray of operative field.</div>
              </div>
            ` : `
              <div class="p-2 border border-emerald-300 bg-emerald-50 text-emerald-800 rounded-lg font-bold text-[10px] text-center">
                ✔ Counts Synchronized (Correct)
              </div>
            `}
          </div>
        </div>

        <!-- Logged Implants -->
        <div class="border-t border-slate-100 pt-4">
          <label class="block text-[10px] font-bold text-slate-400 uppercase mb-2">Logged Implants (Traceability)</label>
          <div id="implants-dock" class="space-y-2 text-xs">
            ${c.implants.length === 0 ? '<span class="text-slate-400 block italic">No implants logged for this case.</span>' : c.implants.map((imp, idx) => `
              <div class="p-2 border rounded bg-slate-50">
                <div class="font-bold text-slate-800">${imp.name}</div>
                <div class="text-[10px] text-slate-400 font-mono">Lot: ${imp.lot} | Serial: ${imp.serial}</div>
              </div>
            `).join('')}
          </div>
          <button class="mt-3 w-full border border-dashed border-slate-350 hover:bg-slate-50 py-1.5 rounded text-xs font-semibold text-[#1B3A5C]" onclick="window.openAddImplantModal('${c.id}')">
            ➕ Log Suture / Mesh / Hardware Sticker
          </button>
        </div>

      </div>

    </div>
  `;
}

window.toggleWhoSign = function(caseId, step, checked) {
  const c = state.ot.scheduledCases.find(cs => cs.id === caseId);
  if (c) {
    c.whoChecklist[step] = checked;
    state.ot.auditTrail.push({
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 23) + " IST",
      user: window.state.activeUserRole || "Admin",
      role: "OT Scrub Nurse",
      action: "WHO Check",
      target: c.id,
      remarks: `WHO Surgical Checklist ${step} verified: ${checked}.`
    });
    renderUnifiedTabContent();
  }
};

window.updateInstrumentCounts = function(caseId, field, val) {
  const c = state.ot.scheduledCases.find(cs => cs.id === caseId);
  if (c) {
    c.instrumentCount[field] = parseInt(val) || 0;
    if (c.instrumentCount.opening === c.instrumentCount.closing) {
      c.instrumentCount.status = "Correct";
    } else {
      c.instrumentCount.status = "DISCREPANCY ALERT";
      state.ot.incidents.push({
        id: "INC-" + Math.floor(Math.random() * 9000 + 1000),
        caseId: c.id,
        type: "Instrument Mismatch",
        remarks: `Opening count was ${c.instrumentCount.opening}, closing count was ${c.instrumentCount.closing}. Exploration required.`
      });
    }
    renderUnifiedTabContent();
  }
};

window.updateGenericCounts = function(caseId, field, val) {
  const c = state.ot.scheduledCases.find(cs => cs.id === caseId);
  if (c) {
    if (!c.instrumentCount) c.instrumentCount = {};
    c.instrumentCount[field] = parseInt(val) || 0;
    
    const openingTotal = (c.instrumentCount.opening || 0) + (c.instrumentCount.needlesOpening || 10) + (c.instrumentCount.spongesOpening || 20);
    const closingTotal = (c.instrumentCount.closing || 0) + (c.instrumentCount.needlesClosing || 10) + (c.instrumentCount.spongesClosing || 20);
    
    if (openingTotal === closingTotal) {
      c.instrumentCount.status = "Correct";
    } else {
      c.instrumentCount.status = "DISCREPANCY ALERT";
    }
    renderUnifiedTabContent();
  }
};

window.updatePositioning = function(caseId, val) {
  const c = state.ot.scheduledCases.find(cs => cs.id === caseId);
  if (c) {
    c.patientPosition = val;
    state.ot.auditTrail.push({
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 23) + " IST",
      user: window.state.activeUserRole || "Admin",
      role: "Primary Surgeon",
      action: "Patient Positioned",
      target: caseId,
      remarks: `Patient surgical position changed to ${val}.`
    });
    renderUnifiedTabContent();
  }
};

window.togglePositionCheck = function(caseId, checked) {
  const c = state.ot.scheduledCases.find(cs => cs.id === caseId);
  if (c) {
    c.positioningChecked = checked;
    renderUnifiedTabContent();
  }
};

window.updateTourniquetLimb = function(caseId, val) {
  const c = state.ot.scheduledCases.find(cs => cs.id === caseId);
  if (c) {
    c.tourniquetLimb = val;
    renderUnifiedTabContent();
  }
};

window.updateTourniquetPressure = function(caseId, val) {
  const c = state.ot.scheduledCases.find(cs => cs.id === caseId);
  if (c) {
    c.tourniquetPressure = parseInt(val) || 0;
    renderUnifiedTabContent();
  }
};

window.triggerTourniquetInflate = function(caseId) {
  const c = state.ot.scheduledCases.find(cs => cs.id === caseId);
  if (c) {
    c.tourniquetInflated = true;
    c.tourniquetInflatedTime = new Date().toLocaleTimeString('en-US', { hour12: false });
    c.tourniquetTotalMinutes = 0;
    
    // Simulate 95-minute tourniquet elapsed time for demonstration if requested
    state.ot.auditTrail.push({
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 23) + " IST",
      user: window.state.activeUserRole || "Admin",
      role: "OT Technician",
      action: "Tourniquet Inflated",
      target: caseId,
      remarks: `Tourniquet inflated on ${c.tourniquetLimb} at pressure ${c.tourniquetPressure} mmHg.`
    });
    renderUnifiedTabContent();
  }
};

window.triggerTourniquetDeflate = function(caseId) {
  const c = state.ot.scheduledCases.find(cs => cs.id === caseId);
  if (c) {
    c.tourniquetInflated = false;
    c.tourniquetDeflatedTime = new Date().toLocaleTimeString('en-US', { hour12: false });
    c.tourniquetTotalMinutes = 45; // Simulated elapsed
    
    state.ot.auditTrail.push({
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 23) + " IST",
      user: window.state.activeUserRole || "Admin",
      role: "OT Technician",
      action: "Tourniquet Deflated",
      target: caseId,
      remarks: `Tourniquet deflated on ${c.tourniquetLimb}. Total time: ${c.tourniquetTotalMinutes} minutes.`
    });
    renderUnifiedTabContent();
  }
};

/* ==========================================================================
   PART 3.3: ANAESTHESIA & NARCOTIC PANEL
   ========================================================================== */
function renderAnaesthesiaPanel(space, c) {
  space.innerHTML = `
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 text-left">
      
      <!-- Anaesthesia Vitals Simulator -->
      <div class="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
        <div class="flex justify-between items-center border-b border-slate-100 pb-2">
          <h3 class="text-sm font-bold text-slate-800">📊 Live Vitals Telemetry (Dräger Workstation Stream)</h3>
          <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 animate-ping">● LIVE</span>
        </div>

        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div class="bg-black text-emerald-400 p-4 rounded-xl font-mono">
            <span class="text-[10px] text-slate-400 uppercase block font-sans">Heart Rate</span>
            <div class="text-3xl font-bold mt-1">72 <span class="text-xs">bpm</span></div>
          </div>
          <div class="bg-black text-[#F59E0B] p-4 rounded-xl font-mono">
            <span class="text-[10px] text-slate-400 uppercase block font-sans">Arterial BP</span>
            <div class="text-3xl font-bold mt-1">120/80</div>
          </div>
          <div class="bg-black text-cyan-400 p-4 rounded-xl font-mono">
            <span class="text-[10px] text-slate-400 uppercase block font-sans">SpO2</span>
            <div class="text-3xl font-bold mt-1">99 <span class="text-xs">%</span></div>
          </div>
          <div class="bg-black text-purple-400 p-4 rounded-xl font-mono">
            <span class="text-[10px] text-slate-400 uppercase block font-sans">EtCO2</span>
            <div class="text-3xl font-bold mt-1">36 <span class="text-xs">mmHg</span></div>
          </div>
        </div>
      </div>

      <!-- Narcotic Drugs Control -->
      <div class="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
        <h3 class="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2">🔒 Narcotic / Schedule X Registry Control</h3>
        
        <div class="space-y-3 text-xs">
          <div class="border rounded bg-slate-50 p-3 space-y-2">
            <div class="font-bold text-slate-700">Fentanyl (Fentagesic) 200 mcg Ampule</div>
            <div class="flex justify-between text-[11px] text-slate-500">
              <span>Batch Number: FN-9901</span>
              <span>Expiry: 2027-10</span>
            </div>
            <div class="grid grid-cols-2 gap-2 mt-2">
              <div>
                <label class="block text-[9px] font-bold text-slate-400">Administered</label>
                <input type="text" id="narc-administered" class="w-full border rounded px-2 py-1 bg-white" placeholder="e.g. 150 mcg">
              </div>
              <div>
                <label class="block text-[9px] font-bold text-slate-400">Wastage Disposed</label>
                <input type="text" id="narc-wastage" class="w-full border rounded px-2 py-1 bg-white" placeholder="e.g. 50 mcg">
              </div>
            </div>
            <div class="mt-2">
              <label class="block text-[9px] font-bold text-slate-400">Disposal Witness (OT Nurse / Pharmacist)</label>
              <input type="text" id="narc-witness" class="w-full border rounded px-2 py-1 bg-white" placeholder="e.g. Sister Shiny">
            </div>
            <button class="w-full bg-[#1B3A5C] text-white py-1.5 rounded font-bold text-xs mt-2" onclick="window.reconcileNarcoticsUsed('${c.id}')">
              Submit & Reconcile
            </button>
          </div>

          <!-- Logged Narcotics History -->
          <div class="space-y-1">
            <span class="font-bold text-[10px] text-slate-400 uppercase">Logged Ledger for this Case:</span>
            ${state.ot.narcoticsRegister.filter(n => n.caseId === c.id).length === 0 ? '<span class="text-slate-400 block italic">No narcotics logged for this case yet.</span>' : state.ot.narcoticsRegister.filter(n => n.caseId === c.id).map(n => `
              <div class="p-2 border rounded bg-slate-50 flex justify-between items-center">
                <div>
                  <div class="font-semibold text-slate-700">${n.drug} (Batch: ${n.batch})</div>
                  <div class="text-[10px] text-slate-400">Drawn: ${n.drawn} | Administered: ${n.given}</div>
                </div>
                <span class="text-[10px] bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded font-bold">Witness: ${n.witness}</span>
              </div>
            `).join('')}
          </div>
        </div>
      </div>

    </div>
  `;
}

window.reconcileNarcoticsUsed = function(caseId) {
  const given = document.getElementById('narc-administered')?.value;
  const wastage = document.getElementById('narc-wastage')?.value;
  const witness = document.getElementById('narc-witness')?.value;

  if (!given || !witness) {
    alert("Please fill in Administered amount and Witness details.");
    return;
  }

  state.ot.narcoticsRegister.push({
    date: new Date().toISOString().split('T')[0],
    caseId: caseId,
    drug: "Fentanyl",
    batch: "FN-9901",
    drawn: "200 mcg",
    given: given,
    wastage: wastage || "0 mcg",
    witness: witness
  });

  state.ot.auditTrail.push({
    timestamp: new Date().toISOString().replace('T', ' ').substring(0, 23) + " IST",
    user: window.state.activeUserRole || "Admin",
    role: "Anaesthetist",
    action: "Narcotic Logged",
    target: caseId,
    remarks: `Reconciled Fentanyl: administered ${given}, wasted ${wastage || 0} witnessed by ${witness}.`
  });

  alert("Narcotic entry added to the Schedule X Controlled Register.");
  renderUnifiedTabContent();
};

/* ==========================================================================
   PART 3.4: POST-OP RECOVERY (PACU ROOM ALDRETE RECORD)
   ========================================================================== */
function renderPostOpPACUPanel(space, c) {
  space.innerHTML = `
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 text-left">
      
      <!-- Modified Aldrete Discharge score -->
      <div class="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
        <h3 class="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2">🛌 Post-Anaesthetic Aldrete Scoring Grid</h3>
        <p class="text-xs text-slate-500">Modified Aldrete score >= 9 is mandatory before discharge to standard ward rooms.</p>

        <div class="space-y-3 text-xs">
          <!-- Activity -->
          <div class="flex justify-between items-center p-2.5 rounded bg-slate-50 border">
            <div>
              <span class="font-bold block text-slate-800">Motor Activity</span>
              <span class="text-[10px] text-slate-400">Ability to lift extremities on command.</span>
            </div>
            <select class="rounded border p-1 font-bold bg-white" id="aldrete-activity" onchange="window.recalcAldreteScore()">
              <option value="2">2 - Moves 4 extremities</option>
              <option value="1">1 - Moves 2 extremities</option>
              <option value="0">0 - Moves 0 extremities</option>
            </select>
          </div>

          <!-- Respiration -->
          <div class="flex justify-between items-center p-2.5 rounded bg-slate-50 border">
            <div>
              <span class="font-bold block text-slate-800">Respiration</span>
              <span class="text-[10px] text-slate-400">Breathing patterns and cough effort.</span>
            </div>
            <select class="rounded border p-1 font-bold bg-white" id="aldrete-resp" onchange="window.recalcAldreteScore()">
              <option value="2">2 - Breathes deeply & coughs</option>
              <option value="1">1 - Dyspneic / shallow breathing</option>
              <option value="0">0 - Apneic</option>
            </select>
          </div>

          <!-- Circulation -->
          <div class="flex justify-between items-center p-2.5 rounded bg-slate-50 border">
            <div>
              <span class="font-bold block text-slate-800">Circulation (Blood Pressure)</span>
              <span class="text-[10px] text-slate-400">Deviation of BP from pre-op baseline.</span>
            </div>
            <select class="rounded border p-1 font-bold bg-white" id="aldrete-circ" onchange="window.recalcAldreteScore()">
              <option value="2">2 - BP +/- 20% of baseline</option>
              <option value="1">1 - BP +/- 20-50% of baseline</option>
              <option value="0">0 - BP +/- 50% of baseline</option>
            </select>
          </div>

          <!-- Consciousness -->
          <div class="flex justify-between items-center p-2.5 rounded bg-slate-50 border">
            <div>
              <span class="font-bold block text-slate-800">Consciousness</span>
              <span class="text-[10px] text-slate-400">Arousability response.</span>
            </div>
            <select class="rounded border p-1 font-bold bg-white" id="aldrete-cons" onchange="window.recalcAldreteScore()">
              <option value="2">2 - Fully awake</option>
              <option value="1">1 - Arousable on calling</option>
              <option value="0">0 - Unresponsive</option>
            </select>
          </div>

          <!-- Oxygen Saturation -->
          <div class="flex justify-between items-center p-2.5 rounded bg-slate-50 border">
            <div>
              <span class="font-bold block text-slate-800">O2 Saturation (SpO2)</span>
              <span class="text-[10px] text-slate-400">Saturation levels on room air.</span>
            </div>
            <select class="rounded border p-1 font-bold bg-white" id="aldrete-spo2" onchange="window.recalcAldreteScore()">
              <option value="2">2 - Maintains >92% on room air</option>
              <option value="1">1 - Needs supplemental O2 for >90%</option>
              <option value="0">0 - Saturation <90% on O2</option>
            </select>
          </div>
        </div>

        <div class="p-4 bg-slate-100 border border-slate-200 rounded-xl flex justify-between items-center text-xs mt-4">
          <span class="font-bold text-slate-500 uppercase">Total Aldrete Score:</span>
          <span id="aldrete-score-tot" class="text-lg font-black text-[#1B3A5C]">10 / 10 (Clear)</span>
        </div>
      </div>

      <!-- ICU Handover & Post-Op booking status -->
      <div class="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
        <h3 class="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2">🏥 ICU/HDU Post-Op Transfer Handover</h3>
        
        <div class="space-y-4 text-xs">
          <div>
            <label class="block text-[10px] font-bold text-slate-400 uppercase">Select Post-Op Transfer Destination</label>
            <select class="mt-1 block w-full rounded border border-slate-300 p-1.5 bg-white" id="transfer-dest">
              <option value="Ward">Standard Recovery Ward Room</option>
              <option value="HDU">High Dependency Unit (HDU)</option>
              <option value="ICU">Intensive Care Unit (ICU)</option>
            </select>
          </div>
          <div>
            <label class="block text-[10px] font-bold text-slate-400 uppercase">Recovery Handover Comments</label>
            <textarea class="mt-1 block w-full rounded border border-slate-300 p-1.5 h-20 bg-white" placeholder="Extubated successfully in recovery room. Vitals stable. Pain controlled with Paracetamol 1g IV. Handover complete."></textarea>
          </div>
          <button class="w-full bg-[#1B3A5C] text-white py-2 rounded-lg font-bold text-xs shadow" onclick="window.confirmPACUDischarge('${c.id}')">
            Lock Recovery Handover & Discharge Patient
          </button>
        </div>
      </div>

    </div>
  `;
}

window.recalcAldreteScore = function() {
  const act = parseInt(document.getElementById('aldrete-activity')?.value || "2");
  const resp = parseInt(document.getElementById('aldrete-resp')?.value || "2");
  const circ = parseInt(document.getElementById('aldrete-circ')?.value || "2");
  const cons = parseInt(document.getElementById('aldrete-cons')?.value || "2");
  const spo2 = parseInt(document.getElementById('aldrete-spo2')?.value || "2");

  const total = act + resp + circ + cons + spo2;
  const statusEl = document.getElementById('aldrete-score-tot');
  if (statusEl) {
    if (total >= 9) {
      statusEl.className = "text-lg font-black text-emerald-600";
      statusEl.textContent = `${total} / 10 (Clear for Transfer)`;
    } else {
      statusEl.className = "text-lg font-black text-red-600";
      statusEl.textContent = `${total} / 10 (Keep in Recovery)`;
    }
  }
};

window.confirmPACUDischarge = function(caseId) {
  const c = state.ot.scheduledCases.find(cs => cs.id === caseId);
  if (c) {
    c.status = "Completed";
    state.ot.auditTrail.push({
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 23) + " IST",
      user: window.state.activeUserRole || "Admin",
      role: "PACU Recovery Nurse",
      action: "Recovery Discharge",
      target: c.id,
      remarks: "Patient discharged from PACU to standard ward."
    });
    alert("Post-Op Recovery record complete. Patient discharged from PACU.");
    window.closeOTCaseCockpit();
  }
};

/* ==========================================================================
   PART 3.5: OT BILLING PANEL (AUTO CHARGE POSTING GATEWAY)
   ========================================================================== */
function renderOTBillingPanel(space, c) {
  let totalConsumables = c.consumables.reduce((acc, curr) => acc + (curr.qty * curr.rate), 0);
  
  const surgeonFee = 15000; 
  const assistantFee = 3500;
  const anaesthesiaFee = 5000;
  const theatreUsageFee = 8000; 
  
  const grandTotal = totalConsumables + surgeonFee + assistantFee + anaesthesiaFee + theatreUsageFee;

  space.innerHTML = `
    <div class="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-6 text-left">
      <div>
        <h3 class="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2">💳 Automated OT Charge Posting Audit</h3>
        <p class="text-xs text-slate-500 mt-1">This grid previews the charges scheduled to post to the patient's active IPD account on case completion.</p>
      </div>

      <div class="border border-slate-200 rounded-lg overflow-hidden text-xs">
        <table class="min-w-full divide-y divide-slate-200 text-left">
          <thead class="bg-slate-50 text-slate-500 uppercase font-semibold">
            <tr>
              <th class="px-4 py-2.5">Charge Item</th>
              <th class="px-4 py-2.5">Category</th>
              <th class="px-4 py-2.5 text-center">Qty / Duration</th>
              <th class="px-4 py-2.5 text-right">Rate</th>
              <th class="px-4 py-2.5 text-right">Line Total</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200 bg-white">
            <tr>
              <td class="px-4 py-3 font-semibold text-slate-800">${c.procedure}</td>
              <td class="px-4 py-3">Surgical Procedures</td>
              <td class="px-4 py-3 text-center">1</td>
              <td class="px-4 py-3 text-right font-mono">${formatINR(surgeonFee)}</td>
              <td class="px-4 py-3 text-right font-mono font-bold">${formatINR(surgeonFee)}</td>
            </tr>
            <tr>
              <td class="px-4 py-3 font-semibold text-slate-800">Anaesthesia Service Charge</td>
              <td class="px-4 py-3">Anaesthesia</td>
              <td class="px-4 py-3 text-center">General</td>
              <td class="px-4 py-3 text-right font-mono">${formatINR(anaesthesiaFee)}</td>
              <td class="px-4 py-3 text-right font-mono font-bold">${formatINR(anaesthesiaFee)}</td>
            </tr>
            <tr>
              <td class="px-4 py-3 font-semibold text-slate-800">Theatre Operational Charge (1.5 Hrs)</td>
              <td class="px-4 py-3">OT Charges</td>
              <td class="px-4 py-3 text-center">1.5 hours</td>
              <td class="px-4 py-3 text-right font-mono">${formatINR(theatreUsageFee)}</td>
              <td class="px-4 py-3 text-right font-mono font-bold">${formatINR(theatreUsageFee)}</td>
            </tr>
            <tr>
              <td class="px-4 py-3 font-semibold text-slate-800">Assistant Surgeon Fee</td>
              <td class="px-4 py-3">OT Charges</td>
              <td class="px-4 py-3 text-center">1</td>
              <td class="px-4 py-3 text-right font-mono">${formatINR(assistantFee)}</td>
              <td class="px-4 py-3 text-right font-mono font-bold">${formatINR(assistantFee)}</td>
            </tr>
            ${c.consumables.map(item => `
              <tr>
                <td class="px-4 py-3 font-semibold text-slate-800">${item.name}</td>
                <td class="px-4 py-3">Consumables</td>
                <td class="px-4 py-3 text-center">${item.qty}</td>
                <td class="px-4 py-3 text-right font-mono">${formatINR(item.rate)}</td>
                <td class="px-4 py-3 text-right font-mono font-bold">${formatINR(item.qty * item.rate)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      <div class="flex justify-between items-center p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold">
        <div>
          <span class="text-slate-500 uppercase block font-bold">Total Billable Consumables</span>
          <span class="text-base font-bold text-slate-800">${formatINR(totalConsumables)}</span>
        </div>
        <div class="text-right">
          <span class="text-slate-500 uppercase block font-bold">Grand Estimated Total</span>
          <span class="text-lg font-black text-indigo-600">${formatINR(grandTotal)}</span>
        </div>
      </div>

      <div class="flex justify-end gap-3 pt-3 border-t border-slate-100">
        <button class="bg-[#1B3A5C] text-white px-5 py-2.5 rounded-lg text-xs font-bold transition shadow hover:bg-slate-800" onclick="window.postOTCaseChargesToBillingDirect('${c.id}')">
          🚀 Finalise & Post Charges to Patient's IPD Bill
        </button>
      </div>
    </div>
  `;
}

window.postOTCaseChargesToBilling = function(caseObj) {
  if (state.billing) {
    const existing = state.billing.find(b => b.admissionNo === caseObj.admissionNo);
    const invoiceObj = existing || {
      invoiceNo: "INV-" + Math.floor(Math.random() * 9000 + 1000),
      admissionNo: caseObj.admissionNo,
      patientUhid: caseObj.patientUhid,
      patientName: caseObj.patientName,
      date: new Date().toISOString().split('T')[0],
      charges: [],
      grandTotal: 0
    };

    invoiceObj.charges.push(
      { desc: `${caseObj.procedure} - Surgeon Fee`, qty: 1, rate: 15000, total: 15000 },
      { desc: "Anaesthesia Administration", qty: 1, rate: 5000, total: 5000 },
      { desc: "OT Theatre Operating Charge (Flat)", qty: 1, rate: 8000, total: 8000 }
    );

    caseObj.consumables.forEach(con => {
      invoiceObj.charges.push({
        desc: con.name,
        qty: con.qty,
        rate: con.rate,
        total: con.qty * con.rate
      });
    });

    if (!existing) {
      state.billing.push(invoiceObj);
    }
  }
};

window.postOTCaseChargesToBillingDirect = function(caseId) {
  const c = state.ot.scheduledCases.find(cs => cs.id === caseId);
  if (c) {
    window.postOTCaseChargesToBilling(c);
    state.ot.auditTrail.push({
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 23) + " IST",
      user: window.state.activeUserRole || "Admin",
      role: "Billing Desk",
      action: "Charges Posted",
      target: c.id,
      remarks: "Surgical and anaesthetic service codes successfully posted to active IPD invoice."
    });
    alert("Success! All surgical, anaesthetic, and consumable charges have been posted to the patient's billing account.");
  }
};

/* ==========================================================================
   PART 4: SCHEDULING BOARD TIMELINE GRID (VISUAL TIME BOARD)
   ========================================================================== */
let activeOTGridDate = new Date().toISOString().split('T')[0];

window.changeOTGridDate = function(val) {
  activeOTGridDate = val;
  renderUnifiedTabContent();
};

function renderOTGridBoard(space) {
  const slots = [
    { start: 8, end: 10 },
    { start: 10, end: 12 },
    { start: 12, end: 14 },
    { start: 14, end: 16 },
    { start: 16, end: 18 },
    { start: 18, end: 20 },
    { start: 20, end: 22 }
  ];

  space.innerHTML = `
    <div class="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-6 text-left">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-3">
        <div>
          <h2 class="text-base font-bold text-slate-900">🗓️ Real-time OT Grid Scheduling Board</h2>
          <p class="text-xs text-slate-400">Shows daily occupancy and slot layouts of Saronil Health OTs.</p>
        </div>
        <div class="flex items-center gap-2">
          <label class="text-xs font-bold text-slate-500">Board Date Selection:</label>
          <input type="date" class="border rounded px-3 py-1.5 text-xs font-mono font-bold bg-white" value="${activeOTGridDate}" onchange="window.changeOTGridDate(this.value)">
        </div>
      </div>

      <!-- Time grid axis -->
      <div class="grid grid-cols-8 gap-2 text-center text-xs font-bold text-slate-500 py-2 bg-slate-50 border rounded-lg">
        <div>Operating Rooms</div>
        <div>08:00 - 10:00</div>
        <div>10:00 - 12:00</div>
        <div>12:00 - 14:00</div>
        <div>14:00 - 16:00</div>
        <div>16:00 - 18:00</div>
        <div>18:00 - 20:00</div>
        <div>20:00 - 22:00</div>
      </div>

      <!-- Theatres timeline layout -->
      <div class="space-y-4">
        ${state.ot.theatres.map(t => {
          const dateCases = state.ot.scheduledCases.filter(c => c.date === activeOTGridDate && c.theatre === t.code && c.status !== "Requested" && c.status !== "Cancelled");
          
          return `
            <div class="grid grid-cols-8 gap-2 text-xs items-stretch">
              <div class="p-3 bg-[#1B3A5C]/5 border border-[#1B3A5C]/15 rounded-lg font-bold text-slate-800 flex flex-col justify-center">
                <div class="truncate font-bold">${t.name}</div>
                <span class="text-[9px] text-[#1B3A5C] tracking-wide block uppercase mt-0.5">${t.speciality}</span>
              </div>
              
              <!-- Timeline Blocks -->
              ${slots.map(slot => {
                const slotCase = dateCases.find(c => {
                  if (!c.time) return false;
                  const hr = parseInt(c.time.split(':')[0]) || 8;
                  return hr >= slot.start && hr < slot.end;
                });

                if (slotCase) {
                  const isCrash = slotCase.id.startsWith("OT-CRASH");
                  return `
                    <div class="border rounded-lg p-2.5 text-left transition cursor-pointer hover:shadow-sm ${isCrash ? 'bg-red-50 border-red-300 text-red-950 hover:bg-red-100' : 'bg-amber-50 border-amber-300 text-amber-950 hover:bg-amber-100'}" onclick="window.openOTCaseCockpit('${slotCase.id}')">
                      <span class="font-bold block font-mono text-[9px] ${isCrash ? 'text-red-750' : 'text-amber-800'}">${slotCase.time} (${slotCase.duration}h)</span>
                      <span class="font-bold block truncate mt-0.5" title="${slotCase.patientName}">${slotCase.patientName}</span>
                      <span class="text-[9px] text-slate-500 font-semibold block truncate" title="${slotCase.procedure}">${slotCase.procedure}</span>
                    </div>
                  `;
                } else {
                  return `
                    <div class="bg-slate-50 border border-dashed border-slate-200 rounded-lg p-2 flex items-center justify-center text-center text-slate-400 italic">
                      <span>Available</span>
                    </div>
                  `;
                }
              }).join('')}
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;
}

/* ==========================================================================
   PART 5: PACU RECOVERY ROOM LIST
   ========================================================================== */
function renderOTPacuRecovery(space) {
  const pacuCases = state.ot.scheduledCases.filter(c => c.status === "PACU");

  space.innerHTML = `
    <div class="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-6 text-left">
      <div class="flex items-center justify-between border-b border-slate-100 pb-3">
        <div>
          <h2 class="text-base font-bold text-slate-900">🛌 PACU Post-Anaesthesia Recovery Room</h2>
          <p class="text-xs text-slate-400">Patients currently recovering and awaiting discharge criteria evaluation.</p>
        </div>
      </div>

      ${pacuCases.length === 0 ? `
        <div class="text-center py-10 space-y-4">
          <span class="text-4xl">🛏️</span>
          <h4 class="text-sm font-bold text-slate-900">Recovery room is empty</h4>
          <p class="text-xs text-slate-500">All patients have been successfully transferred back to ward rooms.</p>
        </div>
      ` : `
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          ${pacuCases.map(c => `
            <div class="p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-350 transition space-y-3">
              <div class="flex justify-between items-center pb-2 border-b border-slate-100">
                <span class="font-bold text-slate-800 text-sm">${c.patientName}</span>
                <span class="bg-purple-100 text-purple-800 text-[10px] font-bold px-2 py-0.5 rounded font-mono uppercase">PACU RECOVERY</span>
              </div>
              <div class="text-xs text-slate-500 space-y-1">
                <div>Procedure: <span class="font-semibold text-slate-700">${c.procedure}</span></div>
                <div>Anaesthesia: <span class="font-semibold text-slate-700">${c.anaesthesiaRecord.type}</span></div>
                <div>Admission No: <span class="font-mono text-slate-700">${c.admissionNo}</span></div>
              </div>
              <div class="pt-2">
                <button class="w-full bg-[#1B3A5C] text-white py-1.5 rounded-lg text-xs font-bold shadow-sm" onclick="window.openOTCaseCockpit('${c.id}')">
                  Scoring & Discharge Handover
                </button>
              </div>
            </div>
          `).join('')}
        </div>
      `}
    </div>
  `;
}

/* ==========================================================================
   PART 6: CSSD & EQUIPMENT MASTER
   ========================================================================== */
function renderOTCssdMaster(space) {
  // Check if any biological indicator has failed to trigger quarantine alert
  const failedBI = state.ot.biLogs?.find(b => b.result === "Failed");

  space.innerHTML = `
    <!-- BI Quarantine Alert -->
    ${failedBI ? `
      <div class="bg-red-50 border-l-4 border-red-500 p-4 rounded-xl mb-6 shadow-sm flex items-center justify-between animate-bounce">
        <div class="flex items-center gap-3">
          <span class="text-xl">☣️</span>
          <div>
            <h4 class="font-bold text-red-800 text-xs uppercase">BIOLOGICAL INDICATOR FAILURE - CRITICAL QUARANTINE</h4>
            <p class="text-[10px] text-red-600 mt-0.5">Autoclave Cycle ${failedBI.cycleNo} failed BI test. Immediately quarantine all instrument sets from this load. Audit trail notified.</p>
          </div>
        </div>
        <span class="text-[10px] bg-red-650 text-white font-bold px-2 py-1 rounded">QUARANTINE ENFORCED</span>
      </div>
    ` : ''}

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 text-left">
      
      <!-- Sterile Instrument Trays -->
      <div class="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
        <h3 class="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2 flex justify-between items-center">
          <span>🧼 Sterile Instrument Trays Shelf-life Registry</span>
          <button class="bg-[#1B3A5C] text-white px-2 py-1 rounded text-[10px] font-bold" onclick="window.reSterilizeExpiredSets()">Recycle Expired Trays</button>
        </h3>
        
        <div class="overflow-x-auto text-xs">
          <table class="min-w-full divide-y divide-slate-200 text-left">
            <thead class="bg-slate-50 text-slate-500 uppercase font-semibold">
              <tr>
                <th class="px-3 py-2">Tray Name</th>
                <th class="px-3 py-2">Method</th>
                <th class="px-3 py-2">Expiry Date</th>
                <th class="px-3 py-2 text-center">Status</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-200 bg-white font-medium">
              ${state.ot.instrumentSets.map(s => `
                <tr>
                  <td class="px-3 py-2.5">
                    <div class="font-bold text-slate-800">${s.name}</div>
                    <span class="font-mono text-[10px] text-slate-400">${s.code}</span>
                  </td>
                  <td class="px-3 py-2.5 font-semibold text-slate-600">${s.sterilisation}</td>
                  <td class="px-3 py-2.5 font-mono text-slate-500">${s.expiry}</td>
                  <td class="px-3 py-2.5 text-center">
                    <span class="px-2 py-0.5 rounded text-[9px] font-bold uppercase ${s.status === 'Available' ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-800'}">${s.status}</span>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Biological Indicator Run Logs -->
      <div class="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
        <h3 class="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2">☣️ CSSD Biological Indicator (BI) Run Logs</h3>
        
        <div class="space-y-3">
          <div class="grid grid-cols-2 gap-2 text-xs">
            <div>
              <label class="block text-[10px] font-bold text-slate-400 mb-1">Cycle Number</label>
              <input type="text" id="bi-form-cycle" class="w-full border rounded p-1.5 bg-white font-mono" value="CYC-2026-103">
            </div>
            <div>
              <label class="block text-[10px] font-bold text-slate-400 mb-1">Test Result</label>
              <select id="bi-form-result" class="w-full border rounded p-1.5 bg-white">
                <option value="Passed">Passed (No growth)</option>
                <option value="Failed">Failed (Growth detected - ALERT)</option>
              </select>
            </div>
          </div>
          <button class="w-full bg-[#1B3A5C] text-white py-1.5 rounded text-xs font-bold" onclick="window.logBIResult()">Log biological indicator result</button>

          <div class="overflow-x-auto text-xs pt-2">
            <table class="min-w-full divide-y divide-slate-200 text-left">
              <thead class="bg-slate-50 text-slate-500 uppercase font-semibold">
                <tr>
                  <th class="px-2 py-1">Cycle</th>
                  <th class="px-2 py-1">Sterilizer</th>
                  <th class="px-2 py-1">Result</th>
                  <th class="px-2 py-1">Time</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-250 bg-white font-mono text-[10px]">
                ${(state.ot.biLogs || []).map(b => `
                  <tr>
                    <td class="px-2 py-2 font-bold">${b.cycleNo}</td>
                    <td class="px-2 py-2">${b.sterizer || b.sterilizer}</td>
                    <td class="px-2 py-2">
                      <span class="px-1.5 py-0.5 rounded font-bold ${b.result === 'Passed' ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-800 animate-pulse'}">${b.result}</span>
                    </td>
                    <td class="px-2 py-2 text-slate-400">${b.readTime}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Preventative Maintenance Equipment lists -->
      <div class="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4 lg:col-span-2">
        <h3 class="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2">⚙️ Medical Equipment PM Calibration Alerts & Fault Logs</h3>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="md:col-span-2 overflow-x-auto text-xs">
            <table class="min-w-full divide-y divide-slate-200 text-left">
              <thead class="bg-slate-50 text-slate-500 uppercase font-semibold">
                <tr>
                  <th class="px-3 py-2">Equipment</th>
                  <th class="px-3 py-2">PM Due</th>
                  <th class="px-3 py-2">Calibration</th>
                  <th class="px-3 py-2 text-center">Status</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-200 bg-white">
                ${state.ot.equipment.map(e => `
                  <tr>
                    <td class="px-3 py-2.5">
                      <div class="font-bold text-slate-800">${e.name}</div>
                      <span class="font-mono text-[10px] text-slate-400">${e.code}</span>
                    </td>
                    <td class="px-3 py-2.5 font-mono text-slate-600">${e.nextMaintenance}</td>
                    <td class="px-3 py-2.5 font-mono text-slate-500">${e.calibration}</td>
                    <td class="px-3 py-2.5 text-center">
                      <span class="px-2 py-0.5 rounded text-[9px] font-bold uppercase ${e.status === 'Operational' ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-800'}">${e.status}</span>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>

          <!-- Fault Reporter -->
          <div class="p-4 border rounded-xl bg-slate-50 space-y-3 text-xs">
            <span class="font-bold text-slate-800 block">🚨 Report Equipment Fault / PM Alert</span>
            <div>
              <label class="block text-[10px] text-slate-500 mb-1">Select Equipment</label>
              <select id="fault-equipment" class="w-full border rounded p-1 bg-white font-semibold">
                ${state.ot.equipment.map(e => `<option value="${e.code}">${e.name}</option>`).join('')}
              </select>
            </div>
            <div>
              <label class="block text-[10px] text-slate-500 mb-1">Describe Malfunction</label>
              <textarea id="fault-desc" class="w-full border rounded p-1 bg-white" placeholder="Diathermy pen not grounding, error code E-04."></textarea>
            </div>
            <button class="w-full bg-red-650 hover:bg-red-750 text-white font-bold py-1.5 rounded" onclick="window.reportEquipmentFault()">Submit Fault Ticket</button>
          </div>
        </div>
      </div>

    </div>
  `;
}

window.logBIResult = function() {
  const cycle = document.getElementById('bi-form-cycle')?.value;
  const result = document.getElementById('bi-form-result')?.value;

  if (!cycle) return;

  state.ot.biLogs.push({
    id: "BI-2026-" + Math.floor(Math.random() * 900 + 100),
    sterilizer: "Autoclave #1",
    cycleNo: cycle,
    method: "Steam Autoclave",
    type: "Geobacillus stearothermophilus",
    result: result,
    readTime: new Date().toISOString().replace('T', ' ').substring(0, 16),
    readBy: "CSSD Supervisor",
    status: result === "Passed" ? "Released" : "Quarantined"
  });

  state.ot.auditTrail.push({
    timestamp: new Date().toISOString().replace('T', ' ').substring(0, 23) + " IST",
    user: window.state.activeUserRole || "Admin",
    role: "CSSD Incharge",
    action: "BI Logged",
    target: "CSSD",
    remarks: `Logged Biological Indicator for cycle ${cycle}: ${result}.`
  });

  if (result === "Failed") {
    alert("⚠️ Biological Indicator Failed! Cycle Quarantined. All sets used from this batch must be recalled immediately.");
  } else {
    alert("Biological indicator log successfully saved.");
  }
  renderUnifiedTabContent();
};

window.reportEquipmentFault = function() {
  const code = document.getElementById('fault-equipment')?.value;
  const desc = document.getElementById('fault-desc')?.value;

  if (!desc) {
    alert("Please provide fault descriptions.");
    return;
  }

  const eq = state.ot.equipment.find(e => e.code === code);
  if (eq) {
    eq.status = "Under Repair";
    state.ot.auditTrail.push({
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 23) + " IST",
      user: window.state.activeUserRole || "Admin",
      role: "OT Technician",
      action: "Fault Reported",
      target: code,
      remarks: `Equipment malfunction reported: ${desc}. Status set to Under Repair.`
    });
    alert(`Success! Fault reported for ${eq.name}. Status updated to Under Repair.`);
    renderUnifiedTabContent();
  }
};

window.reSterilizeExpiredSets = function() {
  state.ot.instrumentSets.forEach(s => {
    if (s.status === "Expired Sterility") {
      s.status = "Available";
      s.expiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().replace('T', ' ').substring(0, 16);
    }
  });
  alert("All sterility-expired sets refreshed & dispatched back to sterile storage.");
  renderUnifiedTabContent();
};

/* ==========================================================================
   PART 7: REPORTS & ANALYTICS
   ========================================================================== */
function renderOTReports(space) {
  space.innerHTML = `
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 text-left">
      
      <!-- Operational metrics -->
      <div class="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
        <h3 class="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2">📈 Surgical Room Utilisation Report</h3>
        
        <div class="space-y-4 text-xs">
          <div>
            <div class="flex justify-between font-bold text-slate-600 mb-1">
              <span>General Surgery Theatre (OT-01)</span>
              <span>78% Utilization</span>
            </div>
            <div class="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
              <div class="bg-[#1B3A5C] h-full" style="width: 78%"></div>
            </div>
          </div>

          <div>
            <div class="flex justify-between font-bold text-slate-600 mb-1">
              <span>Orthopaedic Theatre (OT-ORTHO)</span>
              <span>65% Utilization</span>
            </div>
            <div class="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
              <div class="bg-[#1B3A5C] h-full" style="width: 65%"></div>
            </div>
          </div>

          <div>
            <div class="flex justify-between font-bold text-slate-600 mb-1">
              <span>Obstetrics Gynaecology OT (OT-OBG)</span>
              <span>85% Utilization</span>
            </div>
            <div class="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
              <div class="bg-emerald-600 h-full" style="width: 85%"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- SSI and Quality analytics -->
      <div class="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
        <h3 class="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2">🛡️ Surgical Site Infection (SSI) Audit Log</h3>
        
        <div class="space-y-3 text-xs">
          <div class="p-3 bg-emerald-50 text-emerald-800 rounded-lg font-semibold border border-emerald-200 flex justify-between items-center">
            <span>Hospital Acquired SSI Rate (Last 30 Days):</span>
            <span class="text-sm font-black">0.24% (Target: <0.5%)</span>
          </div>
          
          <div class="p-3 bg-slate-50 rounded-lg text-slate-600 border border-slate-200 space-y-1">
            <span class="font-bold block text-slate-800">Quality Indicators Status:</span>
            <div>&bull; Autoclave Biological indicator validation checks: <strong>100% Passed</strong></div>
            <div>&bull; Median Turnaround Room Cleaning time: <strong>32.5 Minutes</strong></div>
            <div>&bull; LSCS Category 1 Decision-to-Incision Median: <strong>26 Minutes (Target: <30 min)</strong></div>
          </div>
        </div>
      </div>

    </div>
  `;
}

/* ==========================================================================
   PART 8: AUDIT TRAIL
   ========================================================================== */
function renderOTAuditTrail(space) {
  space.innerHTML = `
    <div class="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4 text-left">
      <h2 class="text-base font-bold text-slate-900 border-b border-slate-100 pb-2">🔬 Medico-Legal Append-Only Audit Trail</h2>
      <p class="text-xs text-slate-400">Chronological ledger of clinical inputs, status revisions, WHO checks, and narcotic dispersals.</p>

      <div class="space-y-3 font-mono text-xs">
        ${state.ot.auditTrail.slice().reverse().map(log => `
          <div class="p-3 border rounded bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-2">
            <div>
              <span class="text-indigo-600 font-bold">[${log.timestamp}]</span>
              <span class="text-slate-700 font-semibold ml-2">${log.user} (${log.role}):</span>
              <span class="text-slate-800 font-bold ml-1">${log.action}</span>
              <span class="text-slate-500 italic block mt-1 text-[11px]">${log.remarks}</span>
            </div>
            <span class="text-[10px] bg-slate-200 text-slate-600 px-2 py-0.5 rounded font-bold uppercase tracking-wider self-start md:self-auto">${log.target || 'GLOBAL'}</span>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

/* ==========================================================================
   POPUP MODAL: SCHEDULE NEW ELECTIVE CASE
   ========================================================================== */
window.openNewOTCaseModal = function() {
  let modal = document.getElementById('ot-case-modal-overlay');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'ot-case-modal-overlay';
    modal.className = "fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900 bg-opacity-50 backdrop-blur-sm p-4";
    document.body.appendChild(modal);
  }

  const surgeons = state.doctors?.filter(d => d.spec === "General Surgery" || d.spec === "Orthopedics" || d.spec === "Gynecology & Obs") || [];
  const anaesthetists = state.doctors?.filter(d => d.spec === "Emergency Medicine" || d.spec === "Neurology" || d.spec === "Cardiology") || [];

  modal.innerHTML = `
    <div class="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-2xl max-h-[90vh] overflow-y-auto flex flex-col font-sans antialiased text-slate-800 text-left">
      
      <!-- Header -->
      <div class="flex items-center justify-between px-6 py-4 border-b border-slate-200">
        <h2 class="text-lg font-bold text-slate-900" style="font-family: 'Outfit', sans-serif;">
          ➕ Schedule Operating Theatre Case
        </h2>
        <button class="text-slate-400 hover:text-slate-700 text-lg font-bold font-mono" onclick="window.closeNewOTCaseModal()">✕</button>
      </div>

      <!-- Body -->
      <div class="p-6">
        <form id="ot-case-schedule-form" class="space-y-4" onsubmit="event.preventDefault(); window.saveScheduledOTCase();">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            
            <div>
              <label class="block text-[10px] font-bold text-slate-400 uppercase mb-1">Patient UHID</label>
              <input type="text" id="ot-form-uhid" class="w-full rounded border border-slate-300 p-2 bg-white" value="UHID20000003" required>
            </div>

            <div>
              <label class="block text-[10px] font-bold text-slate-400 uppercase mb-1">Patient Full Name</label>
              <input type="text" id="ot-form-name" class="w-full rounded border border-slate-300 p-2 bg-white" value="Rahul Sharma" required>
            </div>

            <div class="md:col-span-2">
              <label class="block text-[10px] font-bold text-slate-400 uppercase mb-1">Diagnosis (ICD-10)</label>
              <input type="text" id="ot-form-diagnosis" class="w-full rounded border border-slate-300 p-2 bg-white" value="Calculus of gallbladder with acute cholecystitis (ICD-10 K80.2)" required>
            </div>

            <div class="md:col-span-2">
              <label class="block text-[10px] font-bold text-slate-400 uppercase mb-1">Planned Procedure</label>
              <input type="text" id="ot-form-procedure" class="w-full rounded border border-slate-300 p-2 bg-white" value="Laparoscopic Cholecystectomy (CPT 47562)" required>
            </div>

            <div>
              <label class="block text-[10px] font-bold text-slate-400 uppercase mb-1">Primary Surgeon</label>
              <select id="ot-form-surgeon" class="w-full rounded border border-slate-300 p-2 bg-white">
                ${surgeons.map(s => `<option value="${s.name}">${s.name} (${s.spec})</option>`).join('')}
              </select>
            </div>

            <div>
              <label class="block text-[10px] font-bold text-slate-400 uppercase mb-1">Anaesthetist</label>
              <select id="ot-form-anaesthetist" class="w-full rounded border border-slate-300 p-2 bg-white">
                ${anaesthetists.map(a => `<option value="${a.name}">${a.name} (${a.spec})</option>`).join('')}
              </select>
            </div>

            <div>
              <label class="block text-[10px] font-bold text-slate-400 uppercase mb-1">Operating Theatre (OT Room)</label>
              <select id="ot-form-room" class="w-full rounded border border-slate-300 p-2 bg-white">
                ${state.ot.theatres.map(t => `<option value="${t.code}">${t.name}</option>`).join('')}
              </select>
            </div>

            <div>
              <label class="block text-[10px] font-bold text-slate-400 uppercase mb-1">Preferred Slot Time (HH:MM)</label>
              <input type="text" id="ot-form-time" class="w-full rounded border border-slate-300 p-2 bg-white" value="13:30" required>
            </div>

          </div>

          <div class="flex justify-end gap-3 pt-4 border-t border-slate-100 mt-6">
            <button type="button" class="border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg text-xs font-semibold" onclick="window.closeNewOTCaseModal()">Cancel</button>
            <button type="submit" class="bg-[#1B3A5C] text-white px-5 py-2.5 rounded-lg text-xs font-semibold">Schedule Case</button>
          </div>
        </form>
      </div>

    </div>
  `;
};

window.closeNewOTCaseModal = function() {
  const modal = document.getElementById('ot-case-modal-overlay');
  if (modal) modal.remove();
};

window.saveScheduledOTCase = function() {
  const uhid = document.getElementById('ot-form-uhid')?.value;
  const name = document.getElementById('ot-form-name')?.value;
  const diag = document.getElementById('ot-form-diagnosis')?.value;
  const proc = document.getElementById('ot-form-procedure')?.value;
  const surgeon = document.getElementById('ot-form-surgeon')?.value;
  const anaes = document.getElementById('ot-form-anaesthetist')?.value;
  const room = document.getElementById('ot-form-room')?.value;
  const time = document.getElementById('ot-form-time')?.value;

  // Credentials privilege verification: e.g. Gynecology can't perform knee replacement, etc.
  const doc = state.doctors?.find(d => d.name === surgeon);
  let isCredentialed = true;
  if (doc) {
    if (proc.toLowerCase().includes("cholecystectomy") && doc.spec !== "General Surgery") {
      isCredentialed = false;
    } else if ((proc.toLowerCase().includes("knee") || proc.toLowerCase().includes("arthroplasty")) && doc.spec !== "Orthopedics") {
      isCredentialed = false;
    } else if (proc.toLowerCase().includes("caesarean") && doc.spec !== "Gynecology & Obs") {
      isCredentialed = false;
    }
  }

  if (!isCredentialed) {
    const confirmOverride = confirm(`⚠️ CREDENTIALING PRIVILEGE ALERT:\n${surgeon} is not credentialed to perform ${proc} (Specialty: ${doc ? doc.spec : 'Unknown'}).\n\nDo you want to request a HOD Clinical Privilege Override?`);
    if (!confirmOverride) {
      return;
    }
  }

  const newCase = {
    id: "OT-CASE-" + Math.floor(Math.random() * 9000 + 1000),
    patientUhid: uhid,
    patientName: name,
    age: 45, gender: "Male", ward: "General Ward", bed: "GW-104",
    admissionNo: "ADM00259",
    diagnosis: diag,
    procedure: proc,
    surgeon: surgeon,
    anaesthetist: anaes,
    scrubNurse: "Sister Jessy",
    circulatingNurse: "Brother Jose",
    technician: "Ramesh Lal",
    theatre: room,
    date: new Date().toISOString().split('T')[0],
    time: time,
    duration: "01:30",
    status: "Scheduled",
    priority: "Elective",
    bloodReq: "No", bloodUnits: "N/A", bloodStatus: "N/A",
    patientPosition: "Supine",
    positioningChecked: false,
    tourniquetLimb: "None",
    tourniquetPressure: 0,
    tourniquetInflated: false,
    tourniquetInflatedTime: "",
    tourniquetDeflatedTime: "",
    tourniquetTotalMinutes: 0,
    instrumentCount: { opening: 36, closing: 36, status: "Pending", needlesOpening: 10, needlesClosing: 10, spongesOpening: 20, spongesClosing: 20 },
    consentChecklist: { surgical: true, anaesthesia: true, blood: true, implant: false },
    preOpInvestigations: [
      { test: "Complete Blood Count (CBC)", value: "Hb: 13.8 g/dL, PLT: 2.5L", status: "Normal", reviewed: true },
      { test: "PT/INR", value: "INR: 1.02", status: "Normal", reviewed: true },
      { test: "ECG", value: "Normal Sinus Rhythm", status: "Normal", reviewed: true }
    ],
    preOpChecklist: { wardComplete: false, holdingComplete: false, siteMarked: true, npoSolid: "NPO Solid", npoClear: "NPO Clear", asaStatus: "ASA I" },
    whoChecklist: { signIn: false, timeOut: false, signOut: false },
    anaesthesiaRecord: { type: "General Anaesthesia", inductionTime: "", extubationTime: "", agents: [], vitals: [] },
    implants: [],
    consumables: [
      { code: "CON-OT-01", name: "OT Disposables Pack - Standard", qty: 1, rate: 2500 }
    ],
    auditHistory: []
  };

  state.ot.scheduledCases.push(newCase);
  state.ot.auditTrail.push({
    timestamp: new Date().toISOString().replace('T', ' ').substring(0, 23) + " IST",
    user: window.state.activeUserRole || "Admin",
    role: "OT Incharge",
    action: "Scheduled Surgery",
    target: newCase.id,
    remarks: `Scheduled elective surgery for ${name} in theatre ${room} at slot ${time}. ${!isCredentialed ? '(HOD Override Signed)' : ''}`
  });

  window.closeNewOTCaseModal();
  alert(`Case ${newCase.id} successfully scheduled.`);
  
  const container = document.getElementById('main-content');
  renderOTModule(container);
};

/* ==========================================================================
   🚨 EMERGENCY CRASH CASE SCHEDULER
   ========================================================================== */
window.triggerEmergencyOTBooking = function() {
  const newCase = {
    id: "OT-CRASH-" + Math.floor(Math.random() * 9000 + 1000),
    patientUhid: "UHID-UNREG-" + Math.floor(Math.random() * 900 + 100),
    patientName: "Trauma Patient (Unregistered Red Code)",
    age: 25, gender: "Male", ward: "Emergency ER", bed: "ER-TRAUMA-1",
    admissionNo: "ADM-EMG-" + Math.floor(Math.random() * 9000 + 1000),
    diagnosis: "Severe polytrauma, internal haemorrhage",
    procedure: "Emergency Exploratory Laparotomy",
    surgeon: "Dr. Sunita P.",
    anaesthetist: "Dr. Amit Patel",
    scrubNurse: "Sister Shiny",
    circulatingNurse: "Sister Jessy",
    technician: "Anil Sharma",
    theatre: "OT-EMGCY",
    date: new Date().toISOString().split('T')[0],
    time: "ASAP",
    duration: "02:00",
    status: "Intra-Op",
    priority: "Emergency",
    bloodReq: "Yes", bloodUnits: "4 Units O-Neg PRBC", bloodStatus: "On Standby",
    preOpChecklist: { wardComplete: true, holdingComplete: true, siteMarked: true, npoSolid: "Emergency", npoClear: "Emergency", asaStatus: "ASA IV" },
    whoChecklist: { signIn: true, timeOut: true, signOut: false },
    instrumentCount: { opening: 48, closing: 48, status: "Correct" },
    anaesthesiaRecord: { type: "General Anaesthesia", inductionTime: "Immediate", extubationTime: "", agents: [], vitals: [] },
    implants: [],
    consumables: [
      { code: "CON-OT-01", name: "Trauma Disposables Pack", qty: 1, rate: 8500 }
    ],
    auditHistory: []
  };

  state.ot.scheduledCases.push(newCase);
  state.ot.auditTrail.push({
    timestamp: new Date().toISOString().replace('T', ' ').substring(0, 23) + " IST",
    user: window.state.activeUserRole || "Admin",
    role: "OT Incharge",
    action: "Emergency Trauma Crash Triggered",
    target: newCase.id,
    remarks: "Category 1 emergency laparotomy case launched immediately. O-Negative uncrossmatched blood dispatched."
  });

  alert("🚨 Emergency Red Crash Triggered! O-Negative blood sent to OT-EMGCY. Loading Live Case workspace.");
  window.openOTCaseCockpit(newCase.id);
};

/* ==========================================================================
   POPUP MODAL: LOG IMPLANT STICKER
   ========================================================================== */
window.openAddImplantModal = function(caseId) {
  let modal = document.getElementById('implant-modal-overlay');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'implant-modal-overlay';
    modal.className = "fixed inset-0 z-[10000] flex items-center justify-center bg-slate-900 bg-opacity-50 backdrop-blur-sm p-4";
    document.body.appendChild(modal);
  }

  modal.innerHTML = `
    <div class="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-md p-6 font-sans antialiased text-slate-800 text-xs space-y-4 text-left">
      <div class="flex items-center justify-between border-b pb-2">
        <h3 class="text-sm font-bold text-slate-900">➕ Log Implant Suture / Mesh Sticker</h3>
        <button class="text-slate-400 font-bold" onclick="window.closeAddImplantModal()">✕</button>
      </div>

      <form id="implant-log-form" class="space-y-3" onsubmit="event.preventDefault(); window.saveImplantSticker('${caseId}');">
        <div>
          <label class="block text-[10px] font-bold text-slate-400 uppercase mb-1">Implant Title / Description</label>
          <input type="text" id="imp-form-name" class="w-full border rounded p-2 bg-white" value="Polypropylene Hernia Mesh 15x15cm" required>
        </div>
        
        <div class="grid grid-cols-2 gap-2">
          <div>
            <label class="block text-[10px] font-bold text-slate-400 uppercase mb-1">Manufacturer</label>
            <input type="text" id="imp-form-mfg" class="w-full border rounded p-2 bg-white" value="Ethicon Johnson" required>
          </div>
          <div>
            <label class="block text-[10px] font-bold text-slate-400 uppercase mb-1">Size / Dimension</label>
            <input type="text" id="imp-form-size" class="w-full border rounded p-2 bg-white" value="15 x 15 cm" required>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-2">
          <div>
            <label class="block text-[10px] font-bold text-slate-400 uppercase mb-1">Batch / Lot Number</label>
            <input type="text" id="imp-form-lot" class="w-full border rounded p-2 bg-white" value="LOT-998812" required>
          </div>
          <div>
            <label class="block text-[10px] font-bold text-slate-400 uppercase mb-1">Serial Code</label>
            <input type="text" id="imp-form-serial" class="w-full border rounded p-2 bg-white" value="SN-44558" required>
          </div>
        </div>

        <div class="flex justify-end gap-3 pt-3">
          <button type="button" class="border px-3 py-1.5 rounded" onclick="window.closeAddImplantModal()">Cancel</button>
          <button type="submit" class="bg-[#1B3A5C] text-white px-4 py-1.5 rounded font-bold">Log Sticker</button>
        </div>
      </form>
    </div>
  `;
};

window.closeAddImplantModal = function() {
  const modal = document.getElementById('implant-modal-overlay');
  if (modal) modal.remove();
};

window.saveImplantSticker = function(caseId) {
  const name = document.getElementById('imp-form-name')?.value;
  const mfg = document.getElementById('imp-form-mfg')?.value;
  const size = document.getElementById('imp-form-size')?.value;
  const lot = document.getElementById('imp-form-lot')?.value;
  const serial = document.getElementById('imp-form-serial')?.value;

  const c = state.ot.scheduledCases.find(cs => cs.id === caseId);
  if (c) {
    c.implants.push({ name, mfg, size, lot, serial });
    
    c.consumables.push({
      code: "IMP-OT-" + Math.floor(Math.random() * 900 + 100),
      name: name + " (Logged Implant)",
      qty: 1,
      rate: 18500
    });

    state.ot.auditTrail.push({
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 23) + " IST",
      user: window.state.activeUserRole || "Admin",
      role: "OT Scrub Nurse",
      action: "Implant Logged",
      target: caseId,
      remarks: `Pasted implant sticker: ${name}, Lot ${lot}, Serial ${serial}. Added to consumables list.`
    });

    window.closeAddImplantModal();
    window.switchOTCasePanel('intraop');
  }
};

/* ==========================================================================
   PART 9: CONSENT REGISTRY & DUTY ROSTER VIEWS
   ========================================================================== */
function renderOTConsents(space) {
  space.innerHTML = `
    <div class="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-6 text-left">
      <div class="flex items-center justify-between border-b border-slate-100 pb-3">
        <div>
          <h2 class="text-base font-bold text-slate-900">📜 Consent Management Registry</h2>
          <p class="text-xs text-slate-400">Review status and verification of required informed clinical consents.</p>
        </div>
      </div>

      <div class="overflow-x-auto text-xs">
        <table class="min-w-full divide-y divide-slate-200 text-left">
          <thead class="bg-slate-50 text-slate-500 uppercase font-semibold">
            <tr>
              <th class="px-4 py-3">Patient Case</th>
              <th class="px-4 py-3">Surgical Consent</th>
              <th class="px-4 py-3">Anaesthesia Consent</th>
              <th class="px-4 py-3">Blood Transfusion</th>
              <th class="px-4 py-3">Implant Consent</th>
              <th class="px-4 py-3 text-center">Status</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200 bg-white">
            ${state.ot.scheduledCases.map(c => `
              <tr>
                <td class="px-4 py-4">
                  <div class="font-bold text-slate-800">${c.patientName}</div>
                  <span class="font-mono text-[10px] text-slate-400">${c.id}</span>
                </td>
                <td class="px-4 py-4">
                  <span class="px-2 py-0.5 rounded font-bold ${c.consentChecklist?.surgical ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-800'}">
                    ${c.consentChecklist?.surgical ? 'Verified' : 'Pending'}
                  </span>
                </td>
                <td class="px-4 py-4">
                  <span class="px-2 py-0.5 rounded font-bold ${c.consentChecklist?.anaesthesia ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-800'}">
                    ${c.consentChecklist?.anaesthesia ? 'Verified' : 'Pending'}
                  </span>
                </td>
                <td class="px-4 py-4">
                  <span class="px-2 py-0.5 rounded font-bold ${c.consentChecklist?.blood ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-800'}">
                    ${c.consentChecklist?.blood ? 'Verified' : 'Pending'}
                  </span>
                </td>
                <td class="px-4 py-4">
                  <span class="px-2 py-0.5 rounded font-bold ${c.consentChecklist?.implant ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-800'}">
                    ${c.consentChecklist?.implant ? 'Verified' : 'Pending'}
                  </span>
                </td>
                <td class="px-4 py-4 text-center">
                  <button class="bg-[#1B3A5C] text-white px-2 py-1 rounded text-[10px] font-bold" onclick="window.openOTCaseCockpit('${c.id}')">Verify</button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function renderOTRoster(space) {
  space.innerHTML = `
    <div class="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-6 text-left">
      <div class="flex items-center justify-between border-b border-slate-100 pb-3">
        <div>
          <h2 class="text-base font-bold text-slate-900">📅 Operation Theatre Duty & On-Call Roster</h2>
          <p class="text-xs text-slate-400">Shift allocations and on-call assignments for Bengaluru campus OTs.</p>
        </div>
      </div>

      <!-- Fatigue Warning Indicator -->
      <div class="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs flex items-center gap-3">
        <span class="text-lg">⚠️</span>
        <div>
          <span class="font-bold text-amber-800">NABH Shift Fatigue Guard Active</span>
          <p class="text-[10px] text-amber-600 mt-0.5">Alerts trigger if nursing or anaesthesia staff are scheduled for back-to-back night & morning shifts.</p>
        </div>
      </div>

      <div class="overflow-x-auto text-xs">
        <table class="min-w-full divide-y divide-slate-200 text-left">
          <thead class="bg-slate-50 text-slate-500 uppercase font-semibold">
            <tr>
              <th class="px-4 py-3">Date</th>
              <th class="px-4 py-3">Shift</th>
              <th class="px-4 py-3">Role</th>
              <th class="px-4 py-3">Staff Member</th>
              <th class="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200 bg-white font-medium">
            ${(state.ot.dutyRoster || []).map(r => `
              <tr>
                <td class="px-4 py-3 font-mono text-slate-500">${r.date}</td>
                <td class="px-4 py-3 text-slate-700">${r.shift}</td>
                <td class="px-4 py-3 text-slate-800 font-bold">${r.role}</td>
                <td class="px-4 py-3 text-slate-800">${r.staff}</td>
                <td class="px-4 py-3">
                  <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase ${r.onCall ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}">
                    ${r.status}
                  </span>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}
