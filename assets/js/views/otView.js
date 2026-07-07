/* ==========================================================================
   SARONIL HMS - OPERATION THEATRE (OT) MODULE (otView.js)
   ========================================================================== */

// Initialize state elements for OT if not already existing
if (!window.state.ot) {
  window.state.ot = {
    activeRole: 'OT Incharge',
    activeTab: 'today-list',
    selectedCaseId: null,
    alerts: [
      { id: 'alt-cssd-rajesh', type: 'danger', message: 'OT-2 BLOCKED — CSSD clearance not received for Rajesh Kumar (Hip Replacement 09:00)', actionText: 'Chase CSSD', resolved: false },
      { id: 'alt-consent-priya', type: 'danger', message: 'Consent missing — Priya Menon (Lap Chole 11:00)', actionText: 'View Patient', resolved: false },
      { id: 'alt-pac-iqbal', type: 'warning', message: 'Anaesthesia pre-assessment not done — Mohammed Iqbal (Appendicectomy 14:00)', actionText: 'Notify Anaesthetist', resolved: false },
      { id: 'alt-implant-rajesh', type: 'warning', message: 'Implant not confirmed — Zimmer Hip Stem for Rajesh Kumar', actionText: 'Check Implant', resolved: false }
    ],
    equipmentChecklist: {
      date: '2026-07-06',
      signed: false,
      signedBy: '',
      signedAt: '',
      faults: {}
    },
    scheduledCases: [
      {
        id: "OT-CASE-001",
        time: "08:30",
        ot: "OT-1",
        patientName: "Rajesh Kumar",
        uhid: "SH-2026-04821",
        ageSex: "45 M",
        procedure: "Left Hip Replacement",
        surgeon: "Dr. Mehta",
        anaesthetist: "Dr. Sharma",
        anaesthesiaType: "GA",
        status: "In OT",
        bloodGroup: "B+",
        bloodConfirmed: true,
        bloodArranged: true,
        preOpComplete: true,
        preOpSignedBy: "Kavitha Nair (Scrub Nurse)",
        preOpSignedAt: "2026-07-06 08:15",
        whoSignIn: true,
        whoSignInSignedBy: "Dr. Sharma",
        whoSignInSignedAt: "2026-07-06 08:35",
        whoTimeOut: true,
        whoTimeOutSignedBy: "Dr. Mehta",
        whoTimeOutSignedAt: "2026-07-06 08:45",
        whoSignOut: false,
        whoSignOutSignedBy: "",
        whoSignOutSignedAt: "",
        pacStatus: "Fit",
        pacNotes: "Borderline Hb, cardiac clearance received.",
        consentSigned: true,
        fastingNpo: "22:00",
        vitals: { bp: "138/86", hr: "78", spo2: "98" },
        investigationsReviewed: true,
        ivAccess: "18G right antecubital",
        preMedication: "Inj. Midazolam 1mg IV at 08:15",
        siteMarked: true,
        implantConfirmed: true,
        implantSize: "58mm Stem, Size 3 Cup",
        cssdCleared: true,
        instrumentSetName: "Hip Set 1",
        countRecord: {
          sponges4x4: { initial: 20, closure: 20, final: 20 },
          spongesLap: { initial: 4, closure: 4, final: 4 },
          needles: { initial: 8, closure: 8, final: 8 },
          instruments: { initial: 48, closure: 48, final: 48 },
          blades: { initial: 2, closure: 2, final: 2 },
          saved: true
        },
        anaesthesiaLog: {
          type: "GA",
          technique: "ETT 8.0",
          inductionAgent: "Inj. Propofol 150mg IV",
          inductionTime: "08:42",
          maintenanceAgent: "Isoflurane 1.2% + O2/Air",
          maintenanceAdd: "Inj. Fentanyl 100mcg IV",
          reversalAgent: "Inj. Neostigmine 2.5mg + Glycopyrrolate 0.5mg IV",
          extubationTime: "",
          spo2Post: "",
          complications: "None",
          vitalsLog: [
            { time: "08:42", bp: "138/86", hr: "78", spo2: "99", etco2: "35", agent: "1.0%" },
            { time: "08:57", bp: "126/80", hr: "72", spo2: "99", etco2: "34", agent: "1.2%" },
            { time: "09:12", bp: "122/78", hr: "70", spo2: "98", etco2: "35", agent: "1.2%" }
          ],
          signed: true,
          signedBy: "Dr. Sharma",
          signedAt: "2026-07-06 09:30"
        },
        operNotes: {
          type: "Elective",
          preOpDiag: "Left hip osteoarthritis",
          postOpDiag: "Left hip osteoarthritis",
          procedureDetails: "Standard posterior approach, cemented fixation.",
          implants: [
            { name: "Zimmer Hip Stem 58mm (Size 3)", serial: "ZIM-2026-00441", lot: "L123456" },
            { name: "Zimmer Acetabular Cup Size 52", serial: "ZIM-2026-00442", lot: "L123457" }
          ],
          implantsConfirmed: false,
          specimen: "None",
          drains: "Jackson-Pratt 1, right hip",
          closure: "Layer by layer, skin staples",
          bloodLoss: "350 ml",
          signed: false
        },
        postOp: {
          shiftedTo: "Recovery Room",
          shiftTime: "",
          shiftedBy: "",
          condition: "Stable",
          aldrete: { activity: 2, respiration: 2, circulation: 2, consciousness: 2, spo2: 2 },
          signed: false
        }
      },
      {
        id: "OT-CASE-002",
        time: "09:00",
        ot: "OT-2",
        patientName: "Priya Menon",
        uhid: "SH-2026-04803",
        ageSex: "38 F",
        procedure: "Laparoscopic Cholecystectomy",
        surgeon: "Dr. Krishnamurthy",
        anaesthetist: "Dr. Anand",
        anaesthesiaType: "SA",
        status: "Blocked",
        bloodGroup: "A+",
        bloodConfirmed: true,
        bloodArranged: false,
        preOpComplete: false,
        consentSigned: false,
        fastingNpo: "23:00",
        vitals: { bp: "120/75", hr: "72", spo2: "99" },
        investigationsReviewed: true,
        ivAccess: "18G left hand",
        preMedication: "",
        siteMarked: false,
        implantConfirmed: false,
        implantSize: "N/A",
        cssdCleared: false,
        instrumentSetName: "Lap Set 2",
        countRecord: { saved: false },
        anaesthesiaLog: { signed: false },
        operNotes: { implantsConfirmed: false, signed: false },
        postOp: { signed: false }
      },
      {
        id: "OT-CASE-003",
        time: "11:00",
        ot: "OT-1",
        patientName: "Sunita Sharma",
        uhid: "SH-2026-04817",
        ageSex: "52 F",
        procedure: "Thyroidectomy",
        surgeon: "Dr. Ramesh Iyer",
        anaesthetist: "Dr. Sharma",
        anaesthesiaType: "GA",
        status: "Pre-op Ready",
        bloodGroup: "O+",
        bloodConfirmed: true,
        bloodArranged: true,
        preOpComplete: true,
        preOpSignedBy: "Sister Jessy",
        preOpSignedAt: "2026-07-06 10:15",
        consentSigned: true,
        fastingNpo: "04:00",
        vitals: { bp: "130/80", hr: "76", spo2: "98" },
        investigationsReviewed: true,
        ivAccess: "20G left arm",
        preMedication: "Inj. Glycopyrrolate 0.2mg IV",
        siteMarked: true,
        implantConfirmed: true,
        implantSize: "N/A",
        cssdCleared: true,
        instrumentSetName: "General Set 3",
        countRecord: { saved: false },
        anaesthesiaLog: { signed: false },
        operNotes: { implantsConfirmed: false, signed: false },
        postOp: { signed: false }
      },
      {
        id: "OT-CASE-004",
        time: "11:30",
        ot: "OT-3",
        patientName: "Arun Pillai",
        uhid: "SH-2026-04788",
        ageSex: "42 M",
        procedure: "TURP",
        surgeon: "Dr. Mehta",
        anaesthetist: "Dr. Anand",
        anaesthesiaType: "SA",
        status: "Scheduled",
        bloodGroup: "B-",
        bloodConfirmed: true,
        bloodArranged: true,
        preOpComplete: false,
        consentSigned: true,
        fastingNpo: "05:00",
        vitals: { bp: "128/82", hr: "74", spo2: "99" },
        investigationsReviewed: true,
        ivAccess: "18G left wrist",
        preMedication: "",
        siteMarked: true,
        implantConfirmed: true,
        implantSize: "N/A",
        cssdCleared: true,
        instrumentSetName: "TURP Set 1",
        countRecord: { saved: false },
        anaesthesiaLog: { signed: false },
        operNotes: { implantsConfirmed: false, signed: false },
        postOp: { signed: false }
      },
      {
        id: "OT-CASE-005",
        time: "13:00",
        ot: "OT-2",
        patientName: "Mohammed Iqbal",
        uhid: "SH-2026-04799",
        ageSex: "62 M",
        procedure: "Appendicectomy (Emergency)",
        surgeon: "Dr. Krishnamurthy",
        anaesthetist: "Dr. Anand",
        anaesthesiaType: "GA",
        status: "Scheduled",
        bloodGroup: "AB+",
        bloodConfirmed: true,
        bloodArranged: true,
        preOpComplete: false,
        consentSigned: true,
        fastingNpo: "08:00",
        vitals: { bp: "142/90", hr: "95", spo2: "96" },
        investigationsReviewed: true,
        ivAccess: "18G right arm",
        preMedication: "Inj. Cefotaxime 1g IV",
        siteMarked: true,
        implantConfirmed: true,
        implantSize: "N/A",
        cssdCleared: true,
        instrumentSetName: "Emergency Set A",
        countRecord: { saved: false },
        anaesthesiaLog: { signed: false },
        operNotes: { implantsConfirmed: false, signed: false },
        postOp: { signed: false }
      },
      {
        id: "OT-CASE-006",
        time: "14:00",
        ot: "OT-1",
        patientName: "Kavitha Nair",
        uhid: "SH-2026-04822",
        ageSex: "34 F",
        procedure: "Caesarean Section",
        surgeon: "Dr. Priya Nair",
        anaesthetist: "Dr. Sharma",
        anaesthesiaType: "SA",
        status: "Scheduled",
        bloodGroup: "O-",
        bloodConfirmed: true,
        bloodArranged: true,
        preOpComplete: false,
        consentSigned: true,
        fastingNpo: "07:30",
        vitals: { bp: "124/76", hr: "80", spo2: "98" },
        investigationsReviewed: true,
        ivAccess: "18G left forearm",
        preMedication: "Inj. Ranitidine 50mg IV",
        siteMarked: true,
        implantConfirmed: true,
        implantSize: "N/A",
        cssdCleared: true,
        instrumentSetName: "LSCS Set 2",
        countRecord: { saved: false },
        anaesthesiaLog: { signed: false },
        operNotes: { implantsConfirmed: false, signed: false },
        postOp: { signed: false }
      },
      {
        id: "OT-CASE-007",
        time: "15:00",
        ot: "OT-3",
        patientName: "Vikram Singh",
        uhid: "SH-2026-04790",
        ageSex: "58 M",
        procedure: "Cataract (Right Eye)",
        surgeon: "Dr. Fatima Sheikh",
        anaesthetist: "Local",
        anaesthesiaType: "LA",
        status: "Scheduled",
        bloodGroup: "B+",
        bloodConfirmed: true,
        bloodArranged: false,
        preOpComplete: false,
        consentSigned: true,
        fastingNpo: "09:00",
        vitals: { bp: "136/84", hr: "70", spo2: "98" },
        investigationsReviewed: true,
        ivAccess: "22G left wrist",
        preMedication: "Tropicamide eye drops",
        siteMarked: true,
        implantConfirmed: true,
        implantSize: "Alcon IOL +21.0 D",
        cssdCleared: true,
        instrumentSetName: "Ophthalmic Set 1",
        countRecord: { saved: false },
        anaesthesiaLog: { signed: false },
        operNotes: { implantsConfirmed: false, signed: false },
        postOp: { signed: false }
      },
      {
        id: "OT-CASE-008",
        time: "16:00",
        ot: "OT-4",
        patientName: "Anitha Rao",
        uhid: "SH-2026-04831",
        ageSex: "29 F",
        procedure: "Diagnostic Lap",
        surgeon: "Dr. Priya Nair",
        anaesthetist: "Dr. Anand",
        anaesthesiaType: "GA",
        status: "Scheduled",
        bloodGroup: "A-",
        bloodConfirmed: true,
        bloodArranged: true,
        preOpComplete: false,
        consentSigned: true,
        fastingNpo: "10:00",
        vitals: { bp: "118/74", hr: "72", spo2: "99" },
        investigationsReviewed: true,
        ivAccess: "20G left forearm",
        preMedication: "",
        siteMarked: true,
        implantConfirmed: true,
        implantSize: "N/A",
        cssdCleared: true,
        instrumentSetName: "Lap Set 1",
        countRecord: { saved: false },
        anaesthesiaLog: { signed: false },
        operNotes: { implantsConfirmed: false, signed: false },
        postOp: { signed: false }
      }
    ],
    theatreStatus: {
      'OT-1': { status: 'In Progress', currentCase: 'Rajesh Kumar', runningTime: '1h 33m', surgeon: 'Dr. Mehta' },
      'OT-2': { status: 'Blocked', currentCase: 'Priya Menon', reason: 'Consent & CSSD Blocked' },
      'OT-3': { status: 'Ready', currentCase: 'None' },
      'OT-4': { status: 'Turnover', currentCase: 'None', previousCase: 'Anitha Rao (prev. finished)', nextCase: 'None' }
    }
  };
}

window.views.ot = function(container, subAnchor, params) {
  renderOTModule(container);
};

function renderOTModule(container) {
  const o = window.state.ot;
  const role = localStorage.getItem('saronil_ot_role') || o.activeRole;
  const activeTab = localStorage.getItem('saronil_ot_tab') || o.activeTab;

  const styles = `
    <style>
      :root {
        --ot-green: #059669;    --ot-green-light: #d1fae5;
        --ot-blue: #0C3E91;     --ot-blue-light: #dbeafe;
        --ot-amber: #d97706;    --ot-amber-light: #fef3c7;
        --ot-red: #dc2626;      --ot-red-light: #fee2e2;
        --ot-purple: #7c3aed;   --ot-purple-light: #ede9fe;
        --ot-slate: #475569;    --ot-slate-light: #f1f5f9;
      }
      .ot-container {
        font-family: 'Outfit', sans-serif;
        color: var(--text-primary);
        display: flex;
        flex-direction: column;
        gap: 1.25rem;
      }
      .ot-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 1px solid var(--border-color);
        padding-bottom: 1rem;
        flex-wrap: wrap;
        gap: 12px;
      }
      .ot-tab-bar {
        display: flex;
        gap: 4px;
        background: var(--bg-surface-elevated);
        border: 1px solid var(--border-color);
        padding: 4px;
        border-radius: 8px;
        position: sticky;
        top: 0;
        z-index: 100;
        overflow-x: auto;
        white-space: nowrap;
      }
      .ot-tab-btn {
        background: transparent;
        border: none;
        padding: 6px 14px;
        border-radius: 6px;
        font-size: 0.8rem;
        font-weight: 700;
        color: var(--text-muted);
        cursor: pointer;
        transition: all 0.2s ease;
      }
      .ot-tab-btn.active {
        background: var(--primary);
        color: white;
      }
      .alert-strip {
        background: var(--ot-red-light);
        border: 1px solid var(--ot-red);
        border-radius: 8px;
        padding: 12px 16px;
        color: #991b1b;
        display: flex;
        flex-direction: column;
        gap: 8px;
        text-align: left;
      }
      .alert-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 0.8rem;
        font-weight: 600;
        border-bottom: 1px dashed rgba(220, 38, 38, 0.2);
        padding-bottom: 6px;
      }
      .alert-item:last-child {
        border-bottom: none;
        padding-bottom: 0;
      }
      .ot-summary-strip {
        display: flex;
        justify-content: space-between;
        align-items: center;
        background: var(--bg-surface);
        border: 1px solid var(--border-color);
        border-radius: 8px;
        padding: 10px 16px;
        font-size: 0.78rem;
        font-weight: 700;
        flex-wrap: wrap;
        gap: 12px;
      }
      .ot-indicator {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 2px 8px;
        border-radius: 12px;
      }
      .ot-indicator.green { background: var(--ot-green-light); color: var(--ot-green); }
      .ot-indicator.red { background: var(--ot-red-light); color: var(--ot-red); }
      .ot-indicator.amber { background: var(--ot-amber-light); color: var(--ot-amber); }
      .ot-indicator.orange { background: var(--ot-amber-light); color: var(--ot-amber); }
      .ot-indicator.grey { background: var(--ot-slate-light); color: var(--ot-slate); }
      
      .status-badge {
        font-size: 0.7rem;
        font-weight: 700;
        padding: 2px 8px;
        border-radius: 12px;
        text-transform: uppercase;
      }
      .status-badge.in-ot { background: var(--ot-green-light); color: var(--ot-green); animation: pulse-green 1.5s infinite; }
      .status-badge.blocked { background: var(--ot-red-light); color: var(--ot-red); }
      .status-badge.ready { background: var(--ot-blue-light); color: var(--ot-blue); }
      .status-badge.scheduled { background: var(--ot-slate-light); color: var(--ot-slate); }
      .status-badge.done { background: var(--ot-slate-light); color: var(--ot-slate); }
      .status-badge.cancelled { background: var(--ot-red-light); color: var(--ot-red); text-decoration: line-through; }
      .status-badge.delayed { background: var(--ot-amber-light); color: var(--ot-amber); }
      
      @keyframes pulse-green {
        0% { box-shadow: 0 0 0 0 rgba(5, 150, 105, 0.4); }
        70% { box-shadow: 0 0 0 6px rgba(5, 150, 105, 0); }
        100% { box-shadow: 0 0 0 0 rgba(5, 150, 105, 0); }
      }
      .section-card {
        background: var(--bg-surface);
        border: 1px solid var(--border-color);
        border-radius: 8px;
        padding: 1.25rem;
        margin-bottom: 1rem;
        text-align: left;
      }
      .section-title {
        font-size: 0.95rem;
        font-weight: 800;
        border-bottom: 1px solid var(--border-color);
        padding-bottom: 6px;
        margin-bottom: 12px;
        color: var(--primary);
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .form-grid-2 {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 12px;
      }
      .form-grid-3 {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 12px;
      }
    </style>
  `;

  // Filter visible tabs based on role switcher context
  const allTabs = [
    { id: 'today-list', label: '📋 Today\'s OT List', roles: ['OT Incharge', 'Surgeon', 'Anaesthetist', 'Scrub Nurse', 'Circulating Nurse', 'OT Coordinator', 'Administrator'] },
    { id: 'status-board', label: '🏥 OT Status Board', roles: ['OT Incharge', 'Surgeon', 'Anaesthetist', 'Scrub Nurse', 'Circulating Nurse', 'OT Coordinator', 'Administrator'] },
    { id: 'schedule', label: '📅 Schedule', roles: ['OT Incharge', 'Surgeon', 'Anaesthetist', 'OT Coordinator', 'Administrator'] },
    { id: 'instruments', label: '🔬 Instruments & CSSD', roles: ['OT Incharge', 'Scrub Nurse', 'Circulating Nurse', 'OT Coordinator', 'Administrator'] },
    { id: 'anaesthesia', label: '💊 Anaesthesia', roles: ['OT Incharge', 'Anaesthetist', 'Administrator'] },
    { id: 'implants', label: '📦 Implants & Consumables', roles: ['OT Incharge', 'Scrub Nurse', 'Circulating Nurse', 'OT Coordinator', 'Administrator'] },
    { id: 'reports', label: '📊 Reports', roles: ['OT Incharge', 'Surgeon', 'Anaesthetist', 'OT Coordinator', 'Administrator'] }
  ];

  const visibleTabs = allTabs.filter(t => t.roles.includes(role));
  
  // Guard tab selection
  let currentTab = activeTab;
  if (!visibleTabs.some(t => t.id === currentTab)) {
    currentTab = visibleTabs[0] ? visibleTabs[0].id : 'today-list';
  }

  container.innerHTML = styles + `
    <div class="ot-container">
      <!-- Header bar with title and persistent role switcher -->
      <div class="ot-header">
        <div>
          <h1 style="font-size:1.4rem; font-weight:800; color:var(--ot-blue); margin:0;">Operation Theatre Suite Console</h1>
          <p style="font-size:0.78rem; color:var(--text-muted); margin-top:2px;">Live OT List &middot; WHO Surgical Safety Checklists &middot; Sterile Instruments Log &middot; Implant Billing</p>
        </div>
        <div style="display:flex; align-items:center; gap:8px;">
          <button class="btn btn-secondary btn-sm" style="background:#1d4ed8; color:#fff;" onclick="window.showStockRequestOverlay({dept:'OT', urgency:'Urgent'})">📦 Request Stock</button>
          <label style="font-size:0.75rem; font-weight:700; color:var(--text-muted);">Active Duty Role:</label>
          <select id="ot-role-select" onchange="window.switchOTRole(this.value)" class="form-select" style="font-size:0.75rem; font-weight:700; width:180px; padding:4px 8px; border-radius:4px; border:1px solid var(--border-color); background:var(--bg-surface-elevated);">
            <option value="OT Incharge" ${role === 'OT Incharge' ? 'selected' : ''}>OT Incharge</option>
            <option value="Surgeon" ${role === 'Surgeon' ? 'selected' : ''}>Surgeon</option>
            <option value="Anaesthetist" ${role === 'Anaesthetist' ? 'selected' : ''}>Anaesthetist</option>
            <option value="Scrub Nurse" ${role === 'Scrub Nurse' ? 'selected' : ''}>Scrub Nurse</option>
            <option value="Circulating Nurse" ${role === 'Circulating Nurse' ? 'selected' : ''}>Circulating Nurse</option>
            <option value="OT Coordinator" ${role === 'OT Coordinator' ? 'selected' : ''}>OT Coordinator</option>
            <option value="Administrator" ${role === 'Administrator' ? 'selected' : ''}>Administrator</option>
          </select>
        </div>
      </div>

      <!-- Tab bar -->
      <div class="ot-tab-bar">
        ${visibleTabs.map(t => `
          <button onclick="window.switchOTTab('${t.id}')" class="ot-tab-btn ${currentTab === t.id ? 'active' : ''}">${t.label}</button>
        `).join('')}
      </div>

      <!-- Tab View Viewport -->
      <div id="ot-tab-viewport"></div>
    </div>
  `;

  // Render active tab inside the viewport
  const viewport = document.getElementById('ot-tab-viewport');
  if (currentTab === 'today-list') {
    renderTodayList(viewport, role);
  } else if (currentTab === 'status-board') {
    renderStatusBoard(viewport);
  } else if (currentTab === 'schedule') {
    renderSchedule(viewport);
  } else if (currentTab === 'instruments') {
    renderInstruments(viewport);
  } else if (currentTab === 'anaesthesia') {
    renderAnaesthesia(viewport);
  } else if (currentTab === 'implants') {
    renderImplants(viewport);
  } else if (currentTab === 'reports') {
    renderReports(viewport);
  }

  // Handle row click details overlay
  if (o.selectedCaseId) {
    renderCaseDetailOverlay(o.selectedCaseId, role);
  }
}

// Global actions triggers
window.switchOTRole = function(role) {
  localStorage.setItem('saronil_ot_role', role);
  window.state.ot.activeRole = role;
  
  // Set default tab based on role
  let tab = 'today-list';
  if (role === 'Anaesthetist') tab = 'anaesthesia';
  else if (role === 'Scrub Nurse' || role === 'Circulating Nurse') tab = 'today-list';
  
  localStorage.setItem('saronil_ot_tab', tab);
  window.state.ot.activeTab = tab;
  
  renderOTModule(document.getElementById('main-content'));
  showToast(`Switched view to ${role} persona.`);
};

window.switchOTTab = function(tabId) {
  localStorage.setItem('saronil_ot_tab', tabId);
  window.state.ot.activeTab = tabId;
  renderOTModule(document.getElementById('main-content'));
};

window.resolveAlert = function(id) {
  const alertItem = window.state.ot.alerts.find(a => a.id === id);
  if (alertItem) {
    alertItem.resolved = true;
    showToast(`Alert resolved and removed.`);
    renderOTModule(document.getElementById('main-content'));
  }
};

function showToast(message, type = 'success') {
  const toast = document.createElement('div');
  toast.className = 'toast-notification';
  toast.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    padding: 12px 24px;
    background: ${type === 'danger' ? '#dc2626' : '#10b981'};
    color: white;
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0,0,0,0.15);
    z-index: 100005;
    font-size: 0.85rem;
    font-weight: 600;
    font-family: 'Outfit', sans-serif;
  `;
  toast.innerText = message;
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 2500);
}

// ──────────────────────────────────────────────────────────────────────────
// TAB 1 - TODAY'S OT LIST
// ──────────────────────────────────────────────────────────────────────────
function renderTodayList(container, role) {
  const o = window.state.ot;
  const activeAlerts = o.alerts.filter(a => !a.resolved);

  // 1A - Alert Strip
  let alertStripHTML = '';
  if (activeAlerts.length > 0) {
    alertStripHTML = `
      <div class="alert-strip">
        ${activeAlerts.map(a => `
          <div class="alert-item">
            <span>${a.type === 'danger' ? '🔴' : '⚠️'} ${a.message}</span>
            <button class="btn btn-secondary btn-xs" style="background:#fff; color:#991b1b; border:1px solid #fca5a5; font-size:9.5px; padding:2px 8px;" onclick="window.resolveAlert('${a.id}')">${a.actionText}</button>
          </div>
        `).join('')}
      </div>
    `;
  }

  // 1B - OT Summary Strip
  const stats = {
    total: o.scheduledCases.length,
    done: o.scheduledCases.filter(c => c.status === 'Done').length,
    inProg: o.scheduledCases.filter(c => c.status === 'In OT').length,
    pending: o.scheduledCases.filter(c => c.status === 'Scheduled' || c.status === 'Pre-op Ready').length,
    cancelled: o.scheduledCases.filter(c => c.status === 'Cancelled').length,
    delayed: o.scheduledCases.filter(c => c.status === 'Delayed').length
  };

  const summaryStripHTML = `
    <div class="ot-summary-strip">
      <div style="display:flex; gap:12px; flex-wrap:wrap;">
        <span class="ot-indicator green">OT-1: In Progress</span>
        <span class="ot-indicator red">OT-2: Blocked</span>
        <span class="ot-indicator amber">OT-3: Ready</span>
        <span class="ot-indicator orange">OT-4: Turnover</span>
      </div>
      <div style="color:var(--text-muted);">
        Cases Today: <strong style="color:var(--text-primary); font-family:monospace;">${stats.total}</strong> &middot; 
        Done: <strong style="color:#059669; font-family:monospace;">${stats.done}</strong> &middot; 
        In Progress: <strong style="color:#1d4ed8; font-family:monospace;">${stats.inProg}</strong> &middot; 
        Pending: <strong style="color:var(--text-primary); font-family:monospace;">${stats.pending}</strong> &middot; 
        Cancelled: <strong style="color:#dc2626; font-family:monospace;">${stats.cancelled}</strong> &middot; 
        Delayed: <strong style="color:#d97706; font-family:monospace;">${stats.delayed}</strong>
      </div>
    </div>
  `;

  // 1C - Case List Table
  const tableRowsHTML = o.scheduledCases.map(c => {
    let checklistIcon = '🔴';
    if (c.preOpComplete && c.whoSignIn && c.whoTimeOut) checklistIcon = '✓';
    else if (c.preOpComplete) checklistIcon = '⚠';

    let timeClass = '';
    if (c.status === 'Delayed') timeClass = 'style="color:var(--ot-red); font-weight:700;"';

    return `
      <tr onclick="window.viewCaseDetails('${c.id}')" style="cursor:pointer; border-bottom:1px solid var(--border-color);">
        <td ${timeClass} class="admin-mono"><strong>${c.time}</strong></td>
        <td><strong class="admin-mono">${c.ot}</strong></td>
        <td>
          <div style="font-weight:700;">${c.patientName}</div>
          <div style="font-size:0.75rem; color:var(--text-muted);" class="admin-mono">${c.uhid}</div>
        </td>
        <td>${c.ageSex}</td>
        <td>${c.procedure}</td>
        <td>${c.surgeon}</td>
        <td>${c.anaesthetist}</td>
        <td><span class="status-badge ${c.status.toLowerCase().replace(' ', '-')}">${c.status}</span></td>
        <td style="text-align:center; font-weight:bold; font-size:1.1rem;">${checklistIcon}</td>
        <td style="text-align:right;" onclick="event.stopPropagation();">
          <div style="display:flex; gap:4px; justify-content:end;">
            <button class="btn btn-secondary btn-xs" onclick="window.viewCaseDetails('${c.id}')">View</button>
            <select style="font-size:10px; width:75px; padding:2px; border:1px solid var(--border-color); border-radius:4px;" onchange="window.handleRowKebab('${c.id}', this.value); this.value='';">
              <option value="">Action</option>
              <option value="preop">Pre-op Check</option>
              <option value="anes">Anaesthesia</option>
              <option value="inot">Mark In OT</option>
              <option value="done">Mark Done</option>
              <option value="cancel">Cancel Case</option>
              <option value="swap">Swap OT</option>
            </select>
          </div>
        </td>
      </tr>
    `;
  }).join('');

  container.innerHTML = `
    ${alertStripHTML}
    ${summaryStripHTML}
    <div class="card" style="margin-top:10px;">
      <div class="card-header" style="display:flex; justify-content:space-between; align-items:center;">
        <h3 class="card-title" style="margin:0;">Today's Surgical Worklist</h3>
        <button class="btn btn-primary btn-sm" onclick="window.openEmergencyCaseModal()">🚨 Add Emergency Case</button>
      </div>
      <div class="card-body" style="padding:0; overflow-x:auto;">
        <table class="custom-table" style="font-size:0.82rem; width:100%;">
          <thead>
            <tr style="border-bottom:2px solid var(--border-color); background:var(--bg-slate-light);">
              <th>Time</th>
              <th>OT</th>
              <th>Patient</th>
              <th>Age/Sex</th>
              <th>Procedure</th>
              <th>Surgeon</th>
              <th>Anaesthetist</th>
              <th>Status</th>
              <th style="text-align:center;">Checklist</th>
              <th style="text-align:right;">Actions</th>
            </tr>
          </thead>
          <tbody>
            ${tableRowsHTML}
          </tbody>
        </table>
      </div>
    </div>

    <!-- My Recent Requests Strip -->
    ${window.renderMyRecentRequestsHTML ? window.renderMyRecentRequestsHTML('OT') : ''}
  `;
}

window.viewCaseDetails = function(id) {
  window.state.ot.selectedCaseId = id;
  renderOTModule(document.getElementById('main-content'));
};

window.handleRowKebab = function(caseId, action) {
  const c = window.state.ot.scheduledCases.find(cs => cs.id === caseId);
  if (!c) return;

  if (action === 'preop') {
    window.viewCaseDetails(caseId);
    setTimeout(() => window.switchDetailSection('preop'), 100);
  } else if (action === 'anes') {
    window.viewCaseDetails(caseId);
    setTimeout(() => window.switchDetailSection('anaesthesia'), 100);
  } else if (action === 'inot') {
    if (!c.preOpComplete) {
      alert("Error: Pre-op checklist must be marked complete before entering OT.");
      return;
    }
    c.status = 'In OT';
    showToast(`${c.patientName} marked In OT.`);
    renderOTModule(document.getElementById('main-content'));
  } else if (action === 'done') {
    if (!c.whoSignIn || !c.whoTimeOut || !c.whoSignOut) {
      alert("Error: All 3 WHO Surgical Safety timeouts must be signed before finalizing the case.");
      return;
    }
    c.status = 'Done';
    showToast(`${c.patientName} marked Done.`);
    renderOTModule(document.getElementById('main-content'));
  } else if (action === 'cancel') {
    window.openCancelCaseModal(caseId);
  } else if (action === 'swap') {
    const target = prompt("Enter target OT (OT-1, OT-2, OT-3, OT-4):", c.ot);
    if (target) {
      c.ot = target;
      showToast(`Case swapped to ${target}.`);
      renderOTModule(document.getElementById('main-content'));
    }
  }
};

// ──────────────────────────────────────────────────────────────────────────
// TAB 2 - OT STATUS BOARD
// ──────────────────────────────────────────────────────────────────────────
function renderStatusBoard(container) {
  const o = window.state.ot;
  
  container.innerHTML = `
    <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(280px, 1fr)); gap:1.25rem; text-align:left;">
      <!-- OT-1 Card -->
      <div class="card" style="border-left:5px solid var(--ot-green);">
        <div class="card-header" style="display:flex; justify-content:space-between; align-items:center;">
          <h3 class="card-title" style="margin:0;">OT-1</h3>
          <span class="badge badge-success">🟢 IN PROGRESS</span>
        </div>
        <div class="card-body" style="font-size:0.8rem; display:flex; flex-direction:column; gap:6px;">
          <div>Patient: <strong>Rajesh Kumar</strong> &middot; 45 M</div>
          <div>Procedure: <strong>Left Hip Replacement</strong></div>
          <div>Surgeon: Dr. Mehta</div>
          <div>Started: 08:42 | Running: 1h 33m</div>
          <div>Expected End: 11:30</div>
          <div>Scrub Nurse: Kavitha Nair</div>
          <div style="display:flex; gap:6px; margin-top:8px;">
            <button class="btn btn-primary btn-xs" onclick="window.viewCaseDetails('OT-CASE-001')">View Case</button>
            <button class="btn btn-secondary btn-xs" onclick="window.updateStatusBoard('OT-1', 'Done')">Update Status</button>
          </div>
        </div>
      </div>

      <!-- OT-2 Card -->
      <div class="card" style="border-left:5px solid var(--ot-red);">
        <div class="card-header" style="display:flex; justify-content:space-between; align-items:center;">
          <h3 class="card-title" style="margin:0;">OT-2</h3>
          <span class="badge badge-danger">🔴 BLOCKED</span>
        </div>
        <div class="card-body" style="font-size:0.8rem; display:flex; flex-direction:column; gap:6px;">
          <div>Patient: <strong>Priya Menon</strong> &middot; Lap Chole</div>
          <div>Blockers:
            <ul style="margin:4px 0 0 15px; padding:0; color:#dc2626;">
              <li>Consent form missing</li>
              <li>CSSD set not cleared</li>
            </ul>
          </div>
          <div style="display:flex; gap:6px; margin-top:14px;">
            <button class="btn btn-primary btn-xs" onclick="window.viewCaseDetails('OT-CASE-002')">Resolve Blockers</button>
          </div>
        </div>
      </div>

      <!-- OT-3 Card -->
      <div class="card" style="border-left:5px solid var(--ot-blue);">
        <div class="card-header" style="display:flex; justify-content:space-between; align-items:center;">
          <h3 class="card-title" style="margin:0;">OT-3</h3>
          <span class="badge badge-primary">🟡 READY</span>
        </div>
        <div class="card-body" style="font-size:0.8rem; display:flex; flex-direction:column; gap:6px;">
          <div>No active surgery in progress.</div>
          <div>Next Scheduled: <strong>Arun Pillai (TURP)</strong> at 11:30.</div>
          <div style="display:flex; gap:6px; margin-top:20px;">
            <button class="btn btn-secondary btn-xs" onclick="window.updateStatusBoard('OT-3', 'Start Case')">Start Case</button>
          </div>
        </div>
      </div>

      <!-- OT-4 Card -->
      <div class="card" style="border-left:5px solid var(--ot-amber);">
        <div class="card-header" style="display:flex; justify-content:space-between; align-items:center;">
          <h3 class="card-title" style="margin:0;">OT-4</h3>
          <span class="badge badge-warning">🟠 TURNOVER</span>
        </div>
        <div class="card-body" style="font-size:0.8rem; display:flex; flex-direction:column; gap:6px;">
          <div>Previous: <strong>Anitha Rao</strong> &middot; Diag Lap (Completed)</div>
          <div>Housekeeping: <strong style="color:var(--ot-amber);">Cleaning In Progress</strong></div>
          <div>CSSD Ready: ☑ Yes</div>
          <div style="display:flex; gap:6px; margin-top:20px;">
            <button class="btn btn-primary btn-xs" onclick="window.markOTReady('OT-4')">Mark Ready</button>
          </div>
        </div>
      </div>
    </div>
  `;
}

window.updateStatusBoard = function(otId, action) {
  showToast(`${action} action triggered for ${otId}`);
};

window.markOTReady = function(otId) {
  // Finds next case scheduled in OT-4
  const nextCase = window.state.ot.scheduledCases.find(c => c.ot === otId && c.status === 'Scheduled');
  if (nextCase) {
    nextCase.status = 'Pre-op Ready';
  }
  showToast(`${otId} turnover complete. Next case set to Pre-op Ready.`);
  renderOTModule(document.getElementById('main-content'));
};

// ──────────────────────────────────────────────────────────────────────────
// TAB 3 - SCHEDULE
// ──────────────────────────────────────────────────────────────────────────
function renderSchedule(container) {
  const o = window.state.ot;

  // Render OT columns schedule grid layout
  const hours = ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00"];
  const gridCellsHTML = hours.map(hr => {
    return `
      <tr style="border-bottom:1px solid var(--border-color);">
        <td style="padding:10px; font-weight:700; background:var(--bg-slate-light); text-align:center; width:60px;" class="admin-mono">${hr}</td>
        ${["OT-1", "OT-2", "OT-3", "OT-4"].map(ot => {
          const activeCase = o.scheduledCases.find(c => c.ot === ot && c.time.startsWith(hr.slice(0, 2)));
          if (activeCase) {
            return `
              <td style="padding:4px; vertical-align:middle;">
                <div onclick="window.viewCaseDetails('${activeCase.id}')" style="background:var(--ot-blue-light); border-left:4px solid var(--ot-blue); border-radius:6px; padding:6px; font-size:0.75rem; text-align:left; cursor:pointer;" title="${activeCase.procedure} / ${activeCase.surgeon}">
                  <div style="font-weight:800; color:var(--ot-blue);">${activeCase.patientName}</div>
                  <div>${activeCase.procedure}</div>
                  <div style="font-size:0.65rem; color:var(--text-muted);">${activeCase.surgeon} &middot; ${activeCase.anaesthesiaType}</div>
                </div>
              </td>
            `;
          } else {
            return `<td style="padding:10px; background:rgba(255,255,255,0.2);"></td>`;
          }
        }).join('')}
      </tr>
    `;
  }).join('');

  container.innerHTML = `
    <div style="display:grid; grid-template-columns: 2fr 1fr; gap:1.25rem; align-items:start;">
      <!-- Schedule Grid -->
      <div class="card">
        <div class="card-header" style="display:flex; justify-content:space-between; align-items:center;">
          <h3 class="card-title" style="margin:0;">OT Schedule Grid</h3>
          <span style="font-size:0.75rem; font-weight:700; color:var(--text-muted);">Week View (Today's Cases)</span>
        </div>
        <div class="card-body" style="padding:0;">
          <table class="custom-table" style="width:100%; border-collapse:collapse;">
            <thead>
              <tr style="background:var(--bg-slate-light); border-bottom:2px solid var(--border-color);">
                <th style="width:60px;">Time</th>
                <th>OT-1</th>
                <th>OT-2</th>
                <th>OT-3</th>
                <th>OT-4</th>
              </tr>
            </thead>
            <tbody>
              ${gridCellsHTML}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Add Case Form -->
      <div class="card" style="text-align:left;">
        <div class="card-header">
          <h3 class="card-title" style="margin:0;">📅 Schedule New Surgery</h3>
        </div>
        <div class="card-body" style="font-size:0.8rem; display:flex; flex-direction:column; gap:10px;">
          <div>
            <label style="font-weight:700;">Patient UHID / Name *</label>
            <input type="text" id="sched-uhid" class="form-control" placeholder="e.g. SH-2026-04821" style="font-size:0.75rem;">
          </div>
          <div>
            <label style="font-weight:700;">Procedure *</label>
            <input type="text" id="sched-proc" class="form-control" placeholder="Procedure name" style="font-size:0.75rem;">
          </div>
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px;">
            <div>
              <label style="font-weight:700;">OT Room</label>
              <select id="sched-ot" class="form-select" style="font-size:0.75rem;">
                <option value="OT-1">OT-1</option>
                <option value="OT-2">OT-2</option>
                <option value="OT-3">OT-3</option>
                <option value="OT-4">OT-4</option>
              </select>
            </div>
            <div>
              <label style="font-weight:700;">Date *</label>
              <input type="date" id="sched-date" class="form-control" value="2026-07-06" style="font-size:0.75rem;">
            </div>
          </div>
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px;">
            <div>
              <label style="font-weight:700;">Time *</label>
              <input type="time" id="sched-time" class="form-control" value="09:00" style="font-size:0.75rem;">
            </div>
            <div>
              <label style="font-weight:700;">Est. Duration (hrs) *</label>
              <input type="number" id="sched-duration" class="form-control" value="1.5" step="0.5" style="font-size:0.75rem;">
            </div>
          </div>
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px;">
            <div>
              <label style="font-weight:700;">Surgeon Name *</label>
              <input type="text" id="sched-surgeon" class="form-control" value="Dr. Mehta" style="font-size:0.75rem;">
            </div>
            <div>
              <label style="font-weight:700;">Anaesthetist *</label>
              <input type="text" id="sched-anes" class="form-control" value="Dr. Sharma" style="font-size:0.75rem;">
            </div>
          </div>
          <div>
            <label style="font-weight:700;">Case &amp; Priority Type</label>
            <div style="display:flex; gap:12px; margin-top:4px;">
              <label><input type="radio" name="sched-priority" value="Routine" checked> Routine</label>
              <label><input type="radio" name="sched-priority" value="Urgent"> Urgent</label>
            </div>
          </div>
          <button class="btn btn-primary" style="margin-top:8px;" onclick="window.addCaseToSchedule()">Add to Schedule</button>
        </div>
      </div>
    </div>
  `;
}

window.addCaseToSchedule = function() {
  const uhid = document.getElementById('sched-uhid').value;
  const proc = document.getElementById('sched-proc').value;
  const ot = document.getElementById('sched-ot').value;
  const time = document.getElementById('sched-time').value;
  const surgeon = document.getElementById('sched-surgeon').value;
  const anes = document.getElementById('sched-anes').value;
  const priority = document.querySelector('input[name="sched-priority"]:checked').value;

  if (!uhid || !proc) {
    alert("Please fill in patient identification and procedure details.");
    return;
  }

  const newCase = {
    id: "OT-CASE-" + (window.state.ot.scheduledCases.length + 1).toString().padStart(3, '0'),
    time: time,
    ot: ot,
    patientName: uhid.includes('SH') ? 'Lookup Patient' : uhid,
    uhid: uhid.includes('SH') ? uhid : 'SH-2026-04800',
    ageSex: "40 M",
    procedure: proc,
    surgeon: surgeon,
    anaesthetist: anes,
    anaesthesiaType: "GA",
    status: "Scheduled",
    bloodGroup: "O+",
    bloodConfirmed: false,
    bloodArranged: false,
    preOpComplete: false,
    consentSigned: false,
    fastingNpo: "",
    vitals: {},
    investigationsReviewed: false,
    ivAccess: "",
    preMedication: "",
    siteMarked: false,
    implantConfirmed: false,
    implantSize: "N/A",
    cssdCleared: false,
    instrumentSetName: "General Set 1",
    countRecord: { saved: false },
    anaesthesiaLog: { signed: false },
    operNotes: { implantsConfirmed: false, signed: false },
    postOp: { signed: false }
  };

  window.state.ot.scheduledCases.push(newCase);
  showToast("New case successfully added to schedule.");
  renderOTModule(document.getElementById('main-content'));
};

window.openEmergencyCaseModal = function() {
  const patientName = prompt("Enter Emergency Patient Name:", "Raman Nair");
  if (!patientName) return;

  if (confirm(`🚨 EMERGENCY CASE INTRUSION WARNING!\n\nAdding this emergency case will delay subsequent scheduled surgeries on the selected theatre. Notify patient families and proceed?`)) {
    const newCase = {
      id: "OT-CASE-EMG-" + (window.state.ot.scheduledCases.length + 1),
      time: "10:30",
      ot: "OT-2",
      patientName: patientName,
      uhid: "SH-2026-04999",
      ageSex: "50 M",
      procedure: "Emergency Laparotomy",
      surgeon: "Dr. Krishnamurthy",
      anaesthetist: "Dr. Anand",
      anaesthesiaType: "GA",
      status: "Scheduled",
      bloodGroup: "B+",
      bloodConfirmed: true,
      bloodArranged: true,
      preOpComplete: true,
      consentSigned: true,
      fastingNpo: "None",
      vitals: { bp: "110/70", hr: "110", spo2: "94" },
      investigationsReviewed: true,
      ivAccess: "16G Left antecubital",
      preMedication: "",
      siteMarked: true,
      implantConfirmed: true,
      implantSize: "N/A",
      cssdCleared: true,
      instrumentSetName: "Emergency Set B",
      countRecord: { saved: false },
      anaesthesiaLog: { signed: false },
      operNotes: { implantsConfirmed: false, signed: false },
      postOp: { signed: false }
    };
    window.state.ot.scheduledCases.unshift(newCase);
    showToast("Emergency case inserted. Worklist updated and notifications sent.");
    renderOTModule(document.getElementById('main-content'));
  }
};

window.openCancelCaseModal = function(caseId) {
  const c = window.state.ot.scheduledCases.find(cs => cs.id === caseId);
  if (!c) return;

  const reason = prompt("Enter mandatory Cancellation Reason:\n(Patient unfit | Refused | Equipment failure | Surgeon unavailable | CSSD failure):", "Patient unfit (pre-op)");
  if (reason) {
    c.status = 'Cancelled';
    c.cancellationReason = reason;
    showToast(`Case ${caseId} cancelled: ${reason}`);
    renderOTModule(document.getElementById('main-content'));
  }
};

// ──────────────────────────────────────────────────────────────────────────
// TAB 4 - INSTRUMENTS & CSSD
// ──────────────────────────────────────────────────────────────────────────
function renderInstruments(container) {
  const o = window.state.ot;

  // Instrument status list
  const instrumentStatusRows = o.scheduledCases.map(c => {
    return `
      <tr style="border-bottom:1px solid var(--border-color);">
        <td><strong>${c.patientName}</strong> &middot; ${c.uhid}</td>
        <td>${c.procedure}</td>
        <td>${c.instrumentSetName}</td>
        <td>
          <span class="badge ${c.cssdCleared ? 'badge-success' : 'badge-danger'}">
            ${c.cssdCleared ? '✓ Cleared' : '⏳ Pending Clearance'}
          </span>
        </td>
        <td>
          <button class="btn btn-secondary btn-xs" onclick="window.chaseCSSD('${c.id}')">Chase CSSD</button>
        </td>
      </tr>
    `;
  }).join('');

  container.innerHTML = `
    <div style="display:grid; grid-template-columns: 1.5fr 1fr; gap:1.25rem; align-items:start; text-align:left;">
      <!-- Section A: Instrument Clearance -->
      <div style="display:flex; flex-direction:column; gap:1rem;">
        <div class="card">
          <div class="card-header">
            <h3 class="card-title" style="margin:0;">Instrument Set Clearance Status</h3>
          </div>
          <div class="card-body" style="padding:0;">
            <table class="custom-table" style="font-size:0.8rem;">
              <thead>
                <tr style="background:var(--bg-slate-light); border-bottom:2px solid var(--border-color);">
                  <th>Patient</th>
                  <th>Procedure</th>
                  <th>Set Name</th>
                  <th>CSSD Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                ${instrumentStatusRows}
              </tbody>
            </table>
          </div>
        </div>

        <!-- Section B: Instrument Count Log -->
        <div class="card">
          <div class="card-header">
            <h3 class="card-title" style="margin:0;">Instrument Post-op Return &amp; Count Log</h3>
          </div>
          <div class="card-body" style="font-size:0.8rem; display:flex; flex-direction:column; gap:8px;">
            <div>
              <label style="font-weight:700;">Select Case</label>
              <select id="inst-return-case" class="form-select" style="font-size:0.75rem;">
                ${o.scheduledCases.map(c => `<option value="${c.id}">${c.patientName} (${c.procedure})</option>`).join('')}
              </select>
            </div>
            <div style="display:grid; grid-template-columns: 2fr 1fr 1fr; gap:8px; align-items:center; font-weight:bold; border-bottom:1px solid var(--border-color); padding-bottom:4px; margin-top:8px;">
              <span>Instrument Set Item</span>
              <span>Issued</span>
              <span>Returned</span>
            </div>
            <div style="display:grid; grid-template-columns: 2fr 1fr 1fr; gap:8px; align-items:center;">
              <span>Bone Rongeur Large</span>
              <span class="admin-mono">1</span>
              <input type="number" id="inst-ret-rongeur" class="form-control" value="1" style="height:26px; font-size:0.75rem; text-align:center;">
            </div>
            <div style="display:grid; grid-template-columns: 2fr 1fr 1fr; gap:8px; align-items:center;">
              <span>Hip Retractor Set</span>
              <span class="admin-mono">1</span>
              <input type="number" id="inst-ret-retractor" class="form-control" value="1" style="height:26px; font-size:0.75rem; text-align:center;">
            </div>
            <div style="display:grid; grid-template-columns: 2fr 1fr 1fr; gap:8px; align-items:center;">
              <span>Surgical Bone Mallet</span>
              <span class="admin-mono">1</span>
              <input type="number" id="inst-ret-mallet" class="form-control" value="1" style="height:26px; font-size:0.75rem; text-align:center;">
            </div>
            <button class="btn btn-primary" style="margin-top:10px;" onclick="window.submitInstrumentReturn()">Submit Instrument Return</button>
          </div>
        </div>
      </div>

      <!-- Section C: Daily Equipment Checklist -->
      <div class="card">
        <div class="card-header">
          <h3 class="card-title" style="margin:0;">OT Equipment Checklist (Daily)</h3>
        </div>
        <div class="card-body" style="font-size:0.8rem; display:flex; flex-direction:column; gap:10px;">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <span>Anaesthesia machine checked</span>
            <input type="checkbox" id="eq-chk-anes" ${o.equipmentChecklist.signed ? 'checked disabled' : ''}>
          </div>
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <span>Diathermy machine (Bovie) tested</span>
            <input type="checkbox" id="eq-chk-bovie" ${o.equipmentChecklist.signed ? 'checked disabled' : ''}>
          </div>
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <span>OT Table accessories present</span>
            <input type="checkbox" id="eq-chk-table" ${o.equipmentChecklist.signed ? 'checked disabled' : ''}>
          </div>
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <span>Suction and medical gases verified</span>
            <input type="checkbox" id="eq-chk-suction" ${o.equipmentChecklist.signed ? 'checked disabled' : ''}>
          </div>
          <div style="border-top:1px solid var(--border-color); padding-top:10px; margin-top:6px;">
            ${o.equipmentChecklist.signed ? `
              <div style="background:var(--ot-green-light); color:var(--ot-green); padding:8px; border-radius:6px; font-weight:bold; font-size:0.72rem;">
                ✓ SIGNED BY ${o.equipmentChecklist.signedBy} at ${o.equipmentChecklist.signedAt}
              </div>
            ` : `
              <button class="btn btn-primary w-full" onclick="window.signEquipmentCheck()">Sign Equipment Check</button>
            `}
          </div>
        </div>
      </div>
    </div>
  `;
}

window.chaseCSSD = function(caseId) {
  const c = window.state.ot.scheduledCases.find(cs => cs.id === caseId);
  if (c) {
    c.cssdCleared = true;
    showToast(`Clearance request sent. Instrument cleared for ${c.patientName}.`);
    renderOTModule(document.getElementById('main-content'));
  }
};

window.submitInstrumentReturn = function() {
  const r1 = parseInt(document.getElementById('inst-ret-rongeur').value) || 0;
  const r2 = parseInt(document.getElementById('inst-ret-retractor').value) || 0;
  const r3 = parseInt(document.getElementById('inst-ret-mallet').value) || 0;

  if (r1 !== 1 || r2 !== 1 || r3 !== 1) {
    alert("⚠️ COUNT MISMATCH DETECTED!\n\nAll items must be matched and returned. Raise a check and execute an X-ray to confirm if missing.");
    return;
  }
  showToast("✓ Instrument return count matched and logged successfully.");
};

window.signEquipmentCheck = function() {
  const o = window.state.ot;
  o.equipmentChecklist.signed = true;
  o.equipmentChecklist.signedBy = 'Pooja Singh (OT Incharge)';
  o.equipmentChecklist.signedAt = '2026-07-06 07:30';
  showToast("Equipment daily check signed and locked.");
  renderOTModule(document.getElementById('main-content'));
};

// ──────────────────────────────────────────────────────────────────────────
// TAB 5 - ANAESTHESIA
// ──────────────────────────────────────────────────────────────────────────
function renderAnaesthesia(container) {
  const o = window.state.ot;
  
  container.innerHTML = `
    <div style="display:grid; grid-template-columns: 1fr 1fr; gap:1.25rem; align-items:start; text-align:left;">
      <!-- Pre-anaesthesia Assessment PAC -->
      <div class="card">
        <div class="card-header">
          <h3 class="card-title" style="margin:0;">Pre-Anaesthesia Checkup (PAC)</h3>
        </div>
        <div class="card-body" style="font-size:0.8rem; display:flex; flex-direction:column; gap:8px;">
          <div>
            <label style="font-weight:700;">Select Patient</label>
            <select id="pac-uhid-select" class="form-select" style="font-size:0.75rem;">
              ${o.scheduledCases.map(c => `<option value="${c.id}">${c.patientName} (${c.uhid})</option>`).join('')}
            </select>
          </div>
          <div>
            <label style="font-weight:700;">Mallampati Classification</label>
            <select id="pac-mallampati" class="form-select" style="font-size:0.75rem;">
              <option value="I">Class I</option>
              <option value="II" selected>Class II</option>
              <option value="III">Class III</option>
              <option value="IV">Class IV</option>
            </select>
          </div>
          <div>
            <label style="font-weight:700;">ASA Physical Status</label>
            <select id="pac-asa" class="form-select" style="font-size:0.75rem;">
              <option value="ASA I">ASA I</option>
              <option value="ASA II" selected>ASA II</option>
              <option value="ASA III">ASA III</option>
              <option value="ASA IV">ASA IV</option>
            </select>
          </div>
          <div>
            <label style="font-weight:700;">Systemic Medical Conditions</label>
            <textarea id="pac-history" class="form-control" rows="2" style="font-size:0.75rem;">Known HTN, DM. Cardiac clearance obtained.</textarea>
          </div>
          <div>
            <label style="font-weight:700;">Clinical Fitness status</label>
            <select id="pac-fitness" class="form-select" style="font-size:0.75rem;">
              <option value="Fit">Fit for Surgery</option>
              <option value="Unfit">Unfit</option>
              <option value="Optimise First">Optimise Medical Status First</option>
            </select>
          </div>
          <button class="btn btn-primary" onclick="window.savePACAssessment()">Sign PAC Assessment</button>
        </div>
      </div>

      <!-- Drug Drawup Log & High Risk Consent -->
      <div style="display:flex; flex-direction:column; gap:1.25rem;">
        <div class="card">
          <div class="card-header">
            <h3 class="card-title" style="margin:0;">💊 Emergency &amp; Controlled Drug Drawup Log</h3>
          </div>
          <div class="card-body" style="font-size:0.8rem; display:flex; flex-direction:column; gap:6px;">
            <div style="display:grid; grid-template-columns: 2fr 1fr 1fr; gap:6px; font-weight:bold; border-bottom:1px solid var(--border-color); padding-bottom:4px;">
              <span>Drug</span>
              <span>Drawn</span>
              <span>Given</span>
            </div>
            <div style="display:grid; grid-template-columns: 2fr 1fr 1fr; gap:6px; align-items:center;">
              <span style="color:#b91c1c; font-weight:600;">Inj. Fentanyl 100mcg (NDPS) *</span>
              <span class="admin-mono">100mcg</span>
              <input type="text" value="100mcg" class="form-control" style="height:24px; font-size:0.75rem; text-align:center;">
            </div>
            <div style="display:grid; grid-template-columns: 2fr 1fr 1fr; gap:6px; align-items:center;">
              <span style="color:#b91c1c; font-weight:600;">Inj. Midazolam 2mg (NDPS) *</span>
              <span class="admin-mono">2mg</span>
              <input type="text" value="2mg" class="form-control" style="height:24px; font-size:0.75rem; text-align:center;">
            </div>
            <div style="display:grid; grid-template-columns: 2fr 1fr 1fr; gap:6px; align-items:center;">
              <span>Inj. Propofol 1% 20ml</span>
              <span class="admin-mono">200mg</span>
              <input type="text" value="150mg" class="form-control" style="height:24px; font-size:0.75rem; text-align:center;">
            </div>
            <button class="btn btn-primary" style="margin-top:8px;" onclick="window.saveDrugDrawupLog()">Save Drug Drawup (Auto-NDPS Register)</button>
          </div>
        </div>

        <div class="card">
          <div class="card-header">
            <h3 class="card-title" style="margin:0;">✍ High-Risk Anaesthesia Consent</h3>
          </div>
          <div class="card-body" style="font-size:0.8rem; display:flex; flex-direction:column; gap:6px;">
            <label><input type="checkbox" checked> Patient informed on general &amp; regional anaesthesia risks</label>
            <label><input type="checkbox" checked> Sore throat, nausea &amp; ventilation complications details explained</label>
            <label><input type="checkbox" checked> High alert medications consent sign obtained</label>
            <button class="btn btn-secondary" onclick="showToast('High-Risk Consent form saved successfully.')">Save Anaesthesia Consent</button>
          </div>
        </div>
      </div>
    </div>
  `;
}

window.savePACAssessment = function() {
  const caseId = document.getElementById('pac-uhid-select').value;
  const fitness = document.getElementById('pac-fitness').value;
  
  const c = window.state.ot.scheduledCases.find(cs => cs.id === caseId);
  if (c) {
    c.pacStatus = fitness;
    c.status = fitness === 'Fit' ? 'Scheduled' : 'Blocked';
    showToast(`PAC Fitness set to ${fitness} for ${c.patientName}.`);
    renderOTModule(document.getElementById('main-content'));
  }
};

window.saveDrugDrawupLog = function() {
  showToast("✓ Drawn drugs logged and linked. NDPS statutory records auto-posted.");
};

// ──────────────────────────────────────────────────────────────────────────
// TAB 6 - IMPLANTS & CONSUMABLES
// ──────────────────────────────────────────────────────────────────────────
function renderImplants(container) {
  const o = window.state.ot;

  // Consumable stock verification template
  container.innerHTML = `
    <div style="display:grid; grid-template-columns:1.5fr 1fr; gap:1.25rem; align-items:start; text-align:left;">
      <!-- Section A: Case-wise Implant Tracking -->
      <div style="display:flex; flex-direction:column; gap:1.25rem;">
        <div class="card">
          <div class="card-header">
            <h3 class="card-title" style="margin:0;">Case-wise Consignment Implant Tracking</h3>
          </div>
          <div class="card-body" style="font-size:0.8rem; display:flex; flex-direction:column; gap:10px;">
            <div>
              <strong>Case: Rajesh Kumar &middot; Left Hip Replacement &middot; OT-1</strong>
            </div>
            <table class="custom-table" style="font-size:0.75rem;">
              <thead>
                <tr style="background:var(--bg-slate-light);">
                  <th>Implant</th>
                  <th>Supplier</th>
                  <th>Serial No</th>
                  <th>Lot No</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Zimmer Hip Stem 58mm</td>
                  <td>Zimmer Biomet</td>
                  <td><span class="admin-mono">ZIM-2026-00441</span></td>
                  <td><span class="admin-mono">L123456</span></td>
                  <td><span class="badge badge-success">✓ Consigned</span></td>
                </tr>
                <tr>
                  <td>Zimmer Cup Size 52</td>
                  <td>Zimmer Biomet</td>
                  <td><span class="admin-mono">ZIM-2026-00442</span></td>
                  <td><span class="admin-mono">L123457</span></td>
                  <td><span class="badge badge-success">✓ Consigned</span></td>
                </tr>
              </tbody>
            </table>
            <button class="btn btn-primary" onclick="window.confirmImplantsUsed('OT-CASE-001')">Confirm Implants Used (Post Charges &amp; Replenish)</button>
          </div>
        </div>

        <!-- Section B: Case Consumable Logging -->
        <div class="card">
          <div class="card-header">
            <h3 class="card-title" style="margin:0;">📦 Case Consumables Logging</h3>
          </div>
          <div class="card-body" style="font-size:0.8rem; display:flex; flex-direction:column; gap:8px;">
            <div style="display:grid; grid-template-columns:2fr 1fr 1fr; gap:6px; font-weight:bold; border-bottom:1px solid var(--border-color); padding-bottom:4px;">
              <span>Consumable Item</span>
              <span>Qty Used</span>
              <span>Batch Ref</span>
            </div>
            <div style="display:grid; grid-template-columns:2fr 1fr 1fr; gap:6px; align-items:center;">
              <span>IV NS 500ml</span>
              <input type="number" class="form-control" value="3" style="height:24px; font-size:0.75rem; text-align:center;">
              <span class="admin-mono">BAT-2025-201</span>
            </div>
            <div style="display:grid; grid-template-columns:2fr 1fr 1fr; gap:6px; align-items:center;">
              <span>Sterile Drape Set</span>
              <input type="number" class="form-control" value="1" style="height:24px; font-size:0.75rem; text-align:center;">
              <span class="admin-mono">BAT-2026-041</span>
            </div>
            <button class="btn btn-secondary" onclick="showToast('Consumable log saved.')">Save Consumables</button>
          </div>
        </div>
      </div>

      <!-- Section C: Pre-case Stock Verification -->
      <div class="card">
        <div class="card-header">
          <h3 class="card-title" style="margin:0;">Stock Pre-Verification</h3>
        </div>
        <div class="card-body" style="font-size:0.8rem; display:flex; flex-direction:column; gap:10px;">
          <div style="background:#fef2f2; border:1px solid #fecaca; color:#991b1b; padding:10px; border-radius:6px; font-weight:bold; font-size:0.75rem;">
            ⚠️ Dressing Gauze is running SHORT for the next surgery!
          </div>
          <div style="display:flex; flex-direction:column; gap:6px;">
            <div style="display:flex; justify-content:space-between;">
              <span>Dressing Gauze required:</span>
              <strong>5 rolls</strong>
            </div>
            <div style="display:flex; justify-content:space-between;">
              <span>Available in OT sub-store:</span>
              <strong style="color:#b91c1c;">4 rolls</strong>
            </div>
          </div>
          <div style="display:flex; gap:6px; margin-top:8px;">
            <button class="btn btn-secondary btn-sm" style="background:#1d4ed8; color:#fff;" onclick="window.requestShortItems()">Request Short Items</button>
            <button class="btn btn-outline btn-sm" onclick="showToast('Verification bypassed. Proceed unlocked.')">Bypass Override</button>
          </div>
        </div>
      </div>
    </div>
  `;
}

window.confirmImplantsUsed = function(caseId) {
  const c = window.state.ot.scheduledCases.find(cs => cs.id === caseId);
  if (c) {
    c.operNotes.implantsConfirmed = true;
    
    // Add charges to patient's bill
    if (window.state.billing) {
      window.state.billing.unshift({
        id: "BL-INV-OT-" + Math.floor(Math.random() * 1000),
        uhid: c.uhid,
        patientName: c.patientName,
        date: "2026-07-06",
        description: "Implants & Consumables: Zimmer Hip Stem & Cup",
        amount: 85000,
        status: "Unpaid"
      });
    }

    // Trigger consignment replenishment indent
    if (window.state.invIndents) {
      window.state.invIndents.unshift({
        id: "IND-2026-0091",
        type: "Purchase Request",
        dept: "OT",
        itemsCount: 2,
        raisedBy: "OT Incharge",
        raisedAt: "2026-07-06",
        urgency: "Routine",
        status: "Pending",
        notes: `Consignment replenishment for ${c.patientName} implants.`,
        items: [
          { code: "ITM-IMPL-001", name: "Zimmer Hip Stem 58mm", req: 1, av: 0, unit: "pcs" },
          { code: "ITM-IMPL-002", name: "Zimmer Acetabular Cup Size 52", req: 1, av: 0, unit: "pcs" }
        ]
      });
    }

    showToast("✓ Zimmer Hip implants marked Used. Charge posted to patient ledger. Replenishment request sent.");
    renderOTModule(document.getElementById('main-content'));
  }
};

window.requestShortItems = function() {
  window.showStockRequestOverlay({
    dept: 'OT',
    urgency: 'Urgent',
    prefillItem: { code: 'ITM-CON-004', name: 'Dressing Gauze', qty: 20, unit: 'rolls' }
  });
};

// ──────────────────────────────────────────────────────────────────────────
// TAB 7 - REPORTS
// ──────────────────────────────────────────────────────────────────────────
function renderReports(container) {
  container.innerHTML = `
    <div style="display:grid; grid-template-columns:1fr 1fr; gap:1.25rem; text-align:left;">
      <div class="card">
        <div class="card-header">
          <h3 class="card-title" style="margin:0;">Today's OT Efficiency Summary</h3>
        </div>
        <div class="card-body" style="font-size:0.8rem; display:flex; flex-direction:column; gap:10px;">
          <div style="display:flex; justify-content:space-between; border-bottom:1px solid var(--border-color); padding-bottom:6px;">
            <span>Total surgeries scheduled:</span>
            <strong>8</strong>
          </div>
          <div style="display:flex; justify-content:space-between; border-bottom:1px solid var(--border-color); padding-bottom:6px;">
            <span>Completed successfully:</span>
            <strong style="color:#059669;">2</strong>
          </div>
          <div style="display:flex; justify-content:space-between; border-bottom:1px solid var(--border-color); padding-bottom:6px;">
            <span>Turnover delay rate:</span>
            <strong style="color:#d97706;">12 min average</strong>
          </div>
          <div style="display:flex; justify-content:space-between; border-bottom:1px solid var(--border-color); padding-bottom:6px;">
            <span>Checklist Compliance rate:</span>
            <strong>100% NABH</strong>
          </div>
          <button class="btn btn-secondary btn-sm" onclick="showToast('Exporting to Excel...')">Export to Excel</button>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <h3 class="card-title" style="margin:0;">NABH Timeout &amp; Count Audits</h3>
        </div>
        <div class="card-body" style="font-size:0.8rem; display:flex; flex-direction:column; gap:10px;">
          <div style="display:flex; justify-content:space-between; border-bottom:1px solid var(--border-color); padding-bottom:6px;">
            <span>WHO timeout sign-offs complete:</span>
            <strong>100%</strong>
          </div>
          <div style="display:flex; justify-content:space-between; border-bottom:1px solid var(--border-color); padding-bottom:6px;">
            <span>Count discrepancies logged:</span>
            <strong style="color:#059669;">0 cases</strong>
          </div>
          <div style="display:flex; justify-content:space-between; border-bottom:1px solid var(--border-color); padding-bottom:6px;">
            <span>Post-operative SSI infection rate:</span>
            <strong>0.2%</strong>
          </div>
          <button class="btn btn-secondary btn-sm" onclick="showToast('Generating PDF Report...')">Print PDF Report</button>
        </div>
      </div>
    </div>
  `;
}

// ──────────────────────────────────────────────────────────────────────────
// CASE DETAIL VIEW OVERLAY & SECTIONS Stack
// ──────────────────────────────────────────────────────────────────────────
function renderCaseDetailOverlay(caseId, role) {
  const o = window.state.ot;
  const c = o.scheduledCases.find(cs => cs.id === caseId);
  if (!c) return;

  const overlay = document.createElement('div');
  overlay.id = 'ot-case-detail-overlay';
  overlay.style.cssText = `
    position: fixed; top: 0; left: 0; width: 100%; height: 100%;
    background: rgba(15, 23, 42, 0.6); backdrop-filter: blur(4px);
    z-index: 10000; overflow-y: auto; display: flex; justify-content: center;
    align-items: start; padding: 30px 10px;
  `;

  // Dynamic sections selection state
  const activeSec = window.state.ot.activeDetailSection || 'header';

  const sectionsMenu = [
    { id: 'header', label: 'Section A: Header' },
    { id: 'preop', label: 'Section B: Pre-op Checklist' },
    { id: 'safety', label: 'Section C: WHO Safety Checklist' },
    { id: 'counts', label: 'Section D: Counts Verification' },
    { id: 'anaesthesia', label: 'Section E: Anaesthesia Log' },
    { id: 'notes', label: 'Section F: Operative Notes' },
    { id: 'postop', label: 'Section G: Post-op & Recovery' }
  ];

  overlay.innerHTML = `
    <div style="background:var(--bg-surface); border-radius:12px; width:100%; max-width:850px; box-shadow:var(--shadow-lg); font-family:'Outfit',sans-serif; overflow:hidden; border:1px solid var(--border-color);">
      <!-- Modal header -->
      <div style="background:var(--ot-blue); color:#fff; padding:15px 20px; display:flex; justify-content:space-between; align-items:center;">
        <div>
          <h2 style="margin:0; font-size:1.15rem; font-weight:800;">Surgical Case Explorer &mdash; ${c.patientName}</h2>
          <div style="font-size:0.75rem; opacity:0.85;">UHID: ${c.uhid} &middot; Bed: ${c.ot} &middot; Time: ${c.time}</div>
        </div>
        <button onclick="window.closeCaseDetail()" style="background:transparent; border:none; color:#fff; font-size:1.25rem; font-weight:bold; cursor:pointer;">&times;</button>
      </div>

      <!-- Split content panel -->
      <div style="display:grid; grid-template-columns: 240px 1fr; min-height:550px;">
        <!-- Left Sidebar Navigation -->
        <div style="background:var(--bg-slate-light); border-right:1px solid var(--border-color); padding:15px; display:flex; flex-direction:column; gap:6px;">
          ${sectionsMenu.map(s => `
            <button onclick="window.switchDetailSection('${s.id}')" style="text-align:left; padding:8px 12px; border:none; border-radius:6px; font-size:0.78rem; font-weight:700; cursor:pointer; background:${activeSec === s.id ? 'var(--ot-blue)' : 'transparent'}; color:${activeSec === s.id ? '#fff' : 'var(--text-muted)'};">
              ${s.label}
            </button>
          `).join('')}
        </div>

        <!-- Right Content viewport -->
        <div style="padding:20px; overflow-y:auto; max-height:600px; text-align:left;" id="detail-section-viewport">
          <!-- Dynamic details section goes here -->
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  // Render detail view parts
  const viewport = document.getElementById('detail-section-viewport');
  if (activeSec === 'header') renderSectionA(viewport, c);
  else if (activeSec === 'preop') renderSectionB(viewport, c, role);
  else if (activeSec === 'safety') renderSectionC(viewport, c);
  else if (activeSec === 'counts') renderSectionD(viewport, c);
  else if (activeSec === 'anaesthesia') renderSectionE(viewport, c, role);
  else if (activeSec === 'notes') renderSectionF(viewport, c, role);
  else if (activeSec === 'postop') renderSectionG(viewport, c);
}

window.closeCaseDetail = function() {
  window.state.ot.selectedCaseId = null;
  const overlay = document.getElementById('ot-case-detail-overlay');
  if (overlay) overlay.remove();
  renderOTModule(document.getElementById('main-content'));
};

window.switchDetailSection = function(secId) {
  window.state.ot.activeDetailSection = secId;
  const overlay = document.getElementById('ot-case-detail-overlay');
  if (overlay) overlay.remove();
  renderCaseDetailOverlay(window.state.ot.selectedCaseId, localStorage.getItem('saronil_ot_role'));
};

// ──────────────────────────────────────────────────────────────────────────
// SECTIONS IMPLEMENTATIONS
// ──────────────────────────────────────────────────────────────────────────
function renderSectionA(viewport, c) {
  viewport.innerHTML = `
    <div style="display:flex; flex-direction:column; gap:12px;">
      <h3 style="margin:0; font-size:1.1rem; border-bottom:2px solid var(--border-color); padding-bottom:8px; color:var(--ot-blue);">Section A &mdash; Patient Demographic &amp; Clinical Overview</h3>
      <div style="background:var(--bg-slate-light); padding:12px; border-radius:8px; display:grid; grid-template-columns:1fr 1fr; gap:12px;">
        <div>
          <span style="font-size:0.75rem; color:var(--text-muted);">Patient Name</span>
          <div style="font-size:1.15rem; font-weight:800;">${c.patientName}</div>
        </div>
        <div>
          <span style="font-size:0.75rem; color:var(--text-muted);">UHID</span>
          <div style="font-size:1rem; font-weight:700;" class="admin-mono">${c.uhid}</div>
        </div>
        <div>
          <span style="font-size:0.75rem; color:var(--text-muted);">Age / Gender</span>
          <div>${c.ageSex}</div>
        </div>
        <div>
          <span style="font-size:0.75rem; color:var(--text-muted);">Blood Group</span>
          <strong style="color:#b91c1c;">${c.bloodGroup || 'B+'}</strong>
        </div>
      </div>

      <div style="display:flex; gap:8px; align-items:center; margin-top:8px;">
        <span style="font-size:0.78rem; font-weight:700;">EMR Allergies:</span>
        <span class="badge badge-danger" style="font-size:10px;">⚠️ Penicillin</span>
      </div>

      <div style="display:flex; gap:20px; align-items:center; margin-top:12px; background:var(--ot-blue-light); padding:10px; border-radius:6px; color:var(--ot-blue);">
        <label><input type="checkbox" checked disabled> Blood group verified by transfusion desk</label>
        <label><input type="checkbox" checked disabled> 2 Units PRBC crossmatched and reserved</label>
      </div>
    </div>
  `;
}

function renderSectionB(viewport, c, role) {
  viewport.innerHTML = `
    <div style="display:flex; flex-direction:column; gap:12px;">
      <h3 style="margin:0; font-size:1.1rem; border-bottom:2px solid var(--border-color); padding-bottom:8px; color:var(--ot-blue);">Section B &mdash; Pre-operative Safety Checklist</h3>
      
      <div style="font-size:0.75rem; color:var(--text-muted);">Nurse checkoff sheet. Mandatory items (*) must be checked before OT transfer is permitted.</div>

      <div style="display:flex; flex-direction:column; gap:8px; margin-top:8px;">
        <label><input type="checkbox" id="pre-verify-id" checked ${c.preOpComplete ? 'disabled' : ''}> Identity verification (wristband + UHID match 2-person check) *</label>
        <label><input type="checkbox" id="pre-consent" checked ${c.preOpComplete ? 'disabled' : ''}> Consent form signed by patient / guardian *</label>
        <label><input type="checkbox" id="pre-marked" checked ${c.preOpComplete ? 'disabled' : ''}> Surgical site marked by primary surgeon *</label>
        <label><input type="checkbox" id="pre-pac" checked ${c.preOpComplete ? 'disabled' : ''}> Pre-anaesthesia PAC assessment check done *</label>
        <label><input type="checkbox" id="pre-npo" checked ${c.preOpComplete ? 'disabled' : ''}> NPO Fasting verified (minimum 6 hrs solids, 2 hrs liquids) *</label>
        <label><input type="checkbox" id="pre-cssd" checked ${c.preOpComplete ? 'disabled' : ''}> Sterile instrument sets CSSD clearance received *</label>
      </div>

      <div style="border-top:1px solid var(--border-color); padding-top:15px; margin-top:10px;">
        ${c.preOpComplete ? `
          <div style="background:var(--ot-green-light); color:var(--ot-green); padding:10px; border-radius:6px; font-weight:bold; font-size:0.78rem;">
            ✓ SIGNED OFF by ${c.preOpSignedBy} at ${c.preOpSignedAt}
          </div>
        ` : `
          <button class="btn btn-primary" onclick="window.signPreOpChecklist('${c.id}')">Sign Pre-op Checklist</button>
        `}
      </div>
    </div>
  `;
}

window.signPreOpChecklist = function(caseId) {
  const c = window.state.ot.scheduledCases.find(cs => cs.id === caseId);
  if (c) {
    c.preOpComplete = true;
    c.preOpSignedBy = "Kavitha Nair (Scrub Nurse)";
    c.preOpSignedAt = "2026-07-06 08:15";
    c.status = 'Pre-op Ready';
    showToast("Pre-op checklist successfully signed and validated.");
    window.switchDetailSection('preop');
  }
};

function renderSectionC(viewport, c) {
  viewport.innerHTML = `
    <div style="display:flex; flex-direction:column; gap:12px;">
      <h3 style="margin:0; font-size:1.1rem; border-bottom:2px solid var(--border-color); padding-bottom:8px; color:var(--ot-blue);">Section C &mdash; Surgical Safety Checklist (WHO / NABH)</h3>
      
      <!-- Timeout 1 -->
      <div class="card" style="padding:12px;">
        <h4 style="margin:0 0 8px 0; color:var(--ot-blue);">1. SIGN IN (Before Induction)</h4>
        <div style="display:flex; flex-direction:column; gap:4px; font-size:0.75rem;">
          <label><input type="checkbox" checked disabled> Surgeon &amp; Anaesthetist present</label>
          <label><input type="checkbox" checked disabled> Patient confirmed identity, procedure &amp; consent</label>
          <label><input type="checkbox" checked disabled> Airway &amp; allergies checked</label>
        </div>
        <div style="margin-top:8px;">
          ${c.whoSignIn ? `
            <span class="badge badge-success">Signed by Dr. Sharma at 08:35</span>
          ` : `
            <button class="btn btn-primary btn-xs" onclick="window.signTimeout('${c.id}', 'signIn')">Sign In</button>
          `}
        </div>
      </div>

      <!-- Timeout 2 -->
      <div class="card" style="padding:12px;">
        <h4 style="margin:0 0 8px 0; color:var(--ot-blue);">2. TIME OUT (Before Incision)</h4>
        <div style="display:flex; flex-direction:column; gap:4px; font-size:0.75rem;">
          <label><input type="checkbox" checked disabled> All team members introduced</label>
          <label><input type="checkbox" checked disabled> Relevant imaging displayed</label>
          <label><input type="checkbox" checked disabled> Antibiotic prophylaxis given (Inj. Cefazolin 1g IV)</label>
        </div>
        <div style="margin-top:8px;">
          ${c.whoTimeOut ? `
            <span class="badge badge-success">Signed by Dr. Mehta at 08:45</span>
          ` : `
            <button class="btn btn-primary btn-xs" onclick="window.signTimeout('${c.id}', 'timeOut')">Time Out</button>
          `}
        </div>
      </div>

      <!-- Timeout 3 -->
      <div class="card" style="padding:12px;">
        <h4 style="margin:0 0 8px 0; color:var(--ot-blue);">3. SIGN OUT (Before Leaving OT)</h4>
        <div style="display:flex; flex-direction:column; gap:4px; font-size:0.75rem;">
          <label><input type="checkbox" id="signout-count-chk"> Instrument, sponge &amp; needle counts matched</label>
          <label><input type="checkbox" id="signout-spec-chk"> Specimen labelled (if applicable)</label>
          <label><input type="checkbox" id="signout-equip-chk"> Equipment problems verified</label>
        </div>
        <div style="margin-top:8px;">
          ${c.whoSignOut ? `
            <span class="badge badge-success">Signed by Scrub Nurse at ${c.whoSignOutSignedAt}</span>
          ` : `
            <button class="btn btn-primary btn-xs" onclick="window.signTimeout('${c.id}', 'signOut')">Sign Out</button>
          `}
        </div>
      </div>
    </div>
  `;
}

window.signTimeout = function(caseId, step) {
  const c = window.state.ot.scheduledCases.find(cs => cs.id === caseId);
  if (!c) return;

  if (step === 'signOut') {
    if (!document.getElementById('signout-count-chk').checked) {
      alert("Please confirm that counts are verified before signing Sign Out.");
      return;
    }
    if (c.countRecord && !c.countRecord.saved) {
      alert("Please save and match counts in Section D before completing Sign Out.");
      return;
    }
    c.whoSignOut = true;
    c.whoSignOutSignedBy = "Kavitha Nair (Scrub Nurse)";
    c.whoSignOutSignedAt = "2026-07-06 11:15";
  } else {
    c[step === 'signIn' ? 'whoSignIn' : 'whoTimeOut'] = true;
  }

  showToast(`${step} timeout logged successfully.`);
  window.switchDetailSection('safety');
};

function renderSectionD(viewport, c) {
  const saved = c.countRecord && c.countRecord.saved;
  
  viewport.innerHTML = `
    <div style="display:flex; flex-direction:column; gap:12px;">
      <h3 style="margin:0; font-size:1.1rem; border-bottom:2px solid var(--border-color); padding-bottom:8px; color:var(--ot-blue);">Section D &mdash; Surgical Count Record</h3>
      
      <div style="font-size:0.75rem; color:var(--text-muted); margin-bottom:8px;">Scrub nurse and circulating nurse independently confirm opening and closure counts.</div>

      <table class="custom-table" style="font-size:0.8rem; width:100%;">
        <thead>
          <tr style="background:var(--bg-slate-light);">
            <th>Item Category</th>
            <th style="text-align:center;">Initial Count</th>
            <th style="text-align:center;">After Closure</th>
            <th style="text-align:center;">Final Count</th>
            <th style="text-align:center;">Match?</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Sponges (4&times;4)</td>
            <td style="text-align:center;">20</td>
            <td><input type="number" id="cnt-sponge4-cls" value="${saved ? 20 : 20}" style="width:60px; text-align:center;" class="form-control"></td>
            <td><input type="number" id="cnt-sponge4-fnl" value="${saved ? 20 : 20}" style="width:60px; text-align:center;" class="form-control"></td>
            <td style="text-align:center; font-weight:bold; color:green;">✓</td>
          </tr>
          <tr>
            <td>Sponges (lap)</td>
            <td style="text-align:center;">4</td>
            <td><input type="number" id="cnt-spongel-cls" value="${saved ? 4 : 4}" style="width:60px; text-align:center;" class="form-control"></td>
            <td><input type="number" id="cnt-spongel-fnl" value="${saved ? 4 : 4}" style="width:60px; text-align:center;" class="form-control"></td>
            <td style="text-align:center; font-weight:bold; color:green;">✓</td>
          </tr>
          <tr>
            <td>Needles</td>
            <td style="text-align:center;">8</td>
            <td><input type="number" id="cnt-needle-cls" value="${saved ? 8 : 8}" style="width:60px; text-align:center;" class="form-control"></td>
            <td><input type="number" id="cnt-needle-fnl" value="${saved ? 8 : 8}" style="width:60px; text-align:center;" class="form-control"></td>
            <td style="text-align:center; font-weight:bold; color:green;">✓</td>
          </tr>
          <tr>
            <td>Blades</td>
            <td style="text-align:center;">2</td>
            <td><input type="number" id="cnt-blades-cls" value="${saved ? 2 : 2}" style="width:60px; text-align:center;" class="form-control"></td>
            <td><input type="number" id="cnt-blades-fnl" value="${saved ? 2 : 2}" style="width:60px; text-align:center;" class="form-control"></td>
            <td style="text-align:center; font-weight:bold; color:green;">✓</td>
          </tr>
        </tbody>
      </table>

      <div style="margin-top:10px;">
        <button class="btn btn-primary" onclick="window.saveCountsLog('${c.id}')">Save Count Logs</button>
      </div>
    </div>
  `;
}

window.saveCountsLog = function(caseId) {
  const c = window.state.ot.scheduledCases.find(cs => cs.id === caseId);
  if (!c) return;

  const cls4 = parseInt(document.getElementById('cnt-sponge4-cls').value) || 0;
  const fnl4 = parseInt(document.getElementById('cnt-sponge4-fnl').value) || 0;
  const clsl = parseInt(document.getElementById('cnt-spongel-cls').value) || 0;
  const fnll = parseInt(document.getElementById('cnt-spongel-fnl').value) || 0;
  
  if (cls4 !== 20 || fnl4 !== 20 || clsl !== 4 || fnll !== 4) {
    alert("🔴 COUNT MISMATCH DETECTED!\n\nClosure/Final counts do not match initial counts. Mismatch must be investigated. Take post-op X-ray verification to confirm.");
    return;
  }

  c.countRecord = {
    sponges4x4: { initial: 20, closure: 20, final: 20 },
    spongesLap: { initial: 4, closure: 4, final: 4 },
    needles: { initial: 8, closure: 8, final: 8 },
    instruments: { initial: 48, closure: 48, final: 48 },
    blades: { initial: 2, closure: 2, final: 2 },
    saved: true
  };

  showToast("✓ Counts successfully reconciled and verified.");
  window.switchDetailSection('counts');
};

function renderSectionE(viewport, c, role) {
  viewport.innerHTML = `
    <div style="display:flex; flex-direction:column; gap:12px;">
      <h3 style="margin:0; font-size:1.1rem; border-bottom:2px solid var(--border-color); padding-bottom:8px; color:var(--ot-blue);">Section E &mdash; Anaesthesia Clinical Log</h3>
      
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
        <div>
          <label style="font-weight:700;">Anaesthesia Type</label>
          <input type="text" value="${c.anaesthesiaLog.type || 'General (GA)'}" class="form-control" style="font-size:0.75rem;">
        </div>
        <div>
          <label style="font-weight:700;">Technique</label>
          <input type="text" value="${c.anaesthesiaLog.technique || 'ETT 8.0'}" class="form-control" style="font-size:0.75rem;">
        </div>
      </div>

      <div style="display:grid; grid-template-columns:1.5fr 1fr; gap:12px; margin-top:8px;">
        <div>
          <label style="font-weight:700;">Induction Agent</label>
          <input type="text" value="${c.anaesthesiaLog.inductionAgent || 'Inj. Propofol 150mg IV'}" class="form-control" style="font-size:0.75rem;">
        </div>
        <div>
          <label style="font-weight:700;">Induction Time</label>
          <input type="text" value="${c.anaesthesiaLog.inductionTime || '08:42'}" class="form-control" style="font-size:0.75rem;">
        </div>
      </div>

      <!-- Vitals Table -->
      <div style="margin-top:10px;">
        <h4 style="margin:0 0 6px 0; font-size:0.8rem;">Intraoperative Vitals Log (15-min intervals)</h4>
        <table class="custom-table" style="font-size:0.72rem; width:100%;">
          <thead>
            <tr style="background:var(--bg-slate-light);">
              <th>Time</th>
              <th>BP</th>
              <th>HR</th>
              <th>SpO2</th>
              <th>EtCO2</th>
              <th>Agent %</th>
            </tr>
          </thead>
          <tbody>
            ${(c.anaesthesiaLog.vitalsLog || []).map(v => `
              <tr>
                <td class="admin-mono">${v.time}</td>
                <td class="admin-mono">${v.bp}</td>
                <td class="admin-mono">${v.hr}</td>
                <td class="admin-mono">${v.spo2}%</td>
                <td class="admin-mono">${v.etco2}</td>
                <td class="admin-mono">${v.agent}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      <div style="border-top:1px solid var(--border-color); padding-top:15px; margin-top:10px;">
        ${c.anaesthesiaLog.signed ? `
          <span class="badge badge-success">✓ Signed by ${c.anaesthesiaLog.signedBy} at ${c.anaesthesiaLog.signedAt}</span>
        ` : `
          <button class="btn btn-primary" onclick="window.signAnaesthesiaLog('${c.id}')">Sign Anaesthesia Record</button>
        `}
      </div>
    </div>
  `;
}

window.signAnaesthesiaLog = function(caseId) {
  const c = window.state.ot.scheduledCases.find(cs => cs.id === caseId);
  if (c) {
    c.anaesthesiaLog.signed = true;
    c.anaesthesiaLog.signedBy = "Dr. Sharma";
    c.anaesthesiaLog.signedAt = "2026-07-06 09:30";
    showToast("Anaesthesia record signed and sealed.");
    window.switchDetailSection('anaesthesia');
  }
};

function renderSectionF(viewport, c, role) {
  viewport.innerHTML = `
    <div style="display:flex; flex-direction:column; gap:12px;">
      <h3 style="margin:0; font-size:1.1rem; border-bottom:2px solid var(--border-color); padding-bottom:8px; color:var(--ot-blue);">Section F &mdash; Surgeon's Operative Note</h3>
      
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
        <div>
          <label style="font-weight:700;">Pre-op Diagnosis</label>
          <input type="text" value="${c.operNotes.preOpDiag || 'Left hip osteoarthritis'}" class="form-control" style="font-size:0.75rem;">
        </div>
        <div>
          <label style="font-weight:700;">Post-op Diagnosis</label>
          <input type="text" value="${c.operNotes.postOpDiag || 'Left hip osteoarthritis'}" class="form-control" style="font-size:0.75rem;">
        </div>
      </div>

      <div>
        <label style="font-weight:700;">Procedure Details</label>
        <textarea class="form-control" rows="3" style="font-size:0.75rem;">${c.operNotes.procedureDetails || 'Standard posterior approach, cemented fixation.'}</textarea>
      </div>

      <!-- Implants used list -->
      <div>
        <h4 style="margin:0 0 6px 0; font-size:0.8rem; color:var(--ot-blue);">Implants Utilised &amp; Barcodes</h4>
        <div style="display:flex; flex-direction:column; gap:8px;">
          ${(c.operNotes.implants || []).map((imp, idx) => `
            <div style="background:var(--bg-slate-light); padding:8px; border-radius:6px; display:flex; justify-content:space-between; align-items:center;">
              <div>
                <strong>${imp.name}</strong><br>
                <span class="admin-mono" style="font-size:0.7rem; color:var(--text-muted);">S/N: ${imp.serial} &middot; Lot: ${imp.lot}</span>
              </div>
              <button class="btn btn-secondary btn-xs" onclick="window.scanImplantBarcode('${c.id}', ${idx})">Scan Barcode</button>
            </div>
          `).join('')}
        </div>
      </div>

      <div style="border-top:1px solid var(--border-color); padding-top:15px; margin-top:10px;">
        ${c.operNotes.signed ? `
          <span class="badge badge-success">✓ Operative note signed by Dr. Mehta</span>
        ` : `
          <button class="btn btn-primary" onclick="window.signOperativeNotes('${c.id}')">Sign Operative Note</button>
        `}
      </div>
    </div>
  `;
}

window.scanImplantBarcode = function(caseId, idx) {
  showToast("Barcode sticker scanned successfully. Serial and Lot number loaded.");
};

window.signOperativeNotes = function(caseId) {
  const c = window.state.ot.scheduledCases.find(cs => cs.id === caseId);
  if (c) {
    c.operNotes.signed = true;
    showToast("Operative note signed by Dr. Mehta.");
    window.switchDetailSection('notes');
  }
};

function renderSectionG(viewport, c) {
  viewport.innerHTML = `
    <div style="display:flex; flex-direction:column; gap:12px;">
      <h3 style="margin:0; font-size:1.1rem; border-bottom:2px solid var(--border-color); padding-bottom:8px; color:var(--ot-blue);">Section G &mdash; Post-operative Recovery</h3>
      
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
        <div>
          <label style="font-weight:700;">Shifted To</label>
          <select id="post-shifted" class="form-select" style="font-size:0.75rem;">
            <option value="Recovery Room" selected>Recovery Room</option>
            <option value="ICU">ICU Ward</option>
            <option value="HDU">HDU Ward</option>
            <option value="Ward">General Ward</option>
          </select>
        </div>
        <div>
          <label style="font-weight:700;">Condition on Shift</label>
          <input type="text" id="post-condition" value="Stable, conscious" class="form-control" style="font-size:0.75rem;">
        </div>
      </div>

      <!-- Aldrete scoring -->
      <div style="background:var(--bg-slate-light); padding:12px; border-radius:8px; margin-top:10px;">
        <h4 style="margin:0 0 6px 0; font-size:0.8rem; color:var(--ot-blue);">Aldrete Recovery Scoring (Discharge threshold: score &ge; 9)</h4>
        <div style="display:flex; flex-direction:column; gap:4px; font-size:0.75rem;">
          <label><input type="checkbox" id="ald-act" checked> Activity: Able to move limbs voluntarily/on command (2 pts)</label>
          <label><input type="checkbox" id="ald-resp" checked> Respiration: Deep breathe &amp; cough freely (2 pts)</label>
          <label><input type="checkbox" id="ald-circ" checked> Circulation: BP &plusmn; 20% of pre-op level (2 pts)</label>
          <label><input type="checkbox" id="ald-cons" checked> Consciousness: Fully awake (2 pts)</label>
          <label><input type="checkbox" id="ald-spo2" checked> Oxygen Saturation: SpO2 &gt; 92% on room air (2 pts)</label>
        </div>
      </div>

      <div style="border-top:1px solid var(--border-color); padding-top:15px; margin-top:10px;">
        <button class="btn btn-primary" onclick="window.dischargeFromRecovery('${c.id}')">Sign Recovery Discharge</button>
      </div>
    </div>
  `;
}

window.dischargeFromRecovery = function(caseId) {
  const c = window.state.ot.scheduledCases.find(cs => cs.id === caseId);
  if (!c) return;

  const scoreChecked = [
    document.getElementById('ald-act').checked,
    document.getElementById('ald-resp').checked,
    document.getElementById('ald-circ').checked,
    document.getElementById('ald-cons').checked,
    document.getElementById('ald-spo2').checked
  ].filter(Boolean).length * 2;

  if (scoreChecked < 10) {
    alert(`🔴 CANNOT DISCHARGE!\n\nAldrete recovery score is ${scoreChecked}/10. Score must be >= 9 for recovery discharge safety validation.`);
    return;
  }

  c.status = 'Done';
  c.postOp.signed = true;
  showToast(`✓ Case finalized. Rajesh Kumar shifted and recovery sign-off completed.`);
  window.closeCaseDetail();
};
