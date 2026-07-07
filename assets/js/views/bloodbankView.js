/* ==========================================================================
   SARONIL HMS - BLOOD BANK MODULE (bloodbankView.js)
   ========================================================================== */

if (!window.state.bloodbank) {
  window.state.bloodbank = {
    activeRole: 'Blood Bank Technician',
    activeTab: 'dashboard',
    inventoryFilter: { component: 'All', group: 'All', expired: 'All' },
    camps: [
      { id: 'CAMP-2026-001', name: 'Rotary Club Koramangala Health Camp', location: 'Rotary Hall, Koramangala', date: '2026-06-20', status: 'Completed', registered: 45, deferred: 8, collected: 37, TTIReactive: 1 }
    ],
    alerts: [
      { id: 'bb-alt-001', type: 'danger', message: 'Unit BB-2026-0441 — HBsAg REACTIVE — Quarantine immediately', actionText: 'Quarantine', resolved: false },
      { id: 'bb-alt-002', type: 'warning', message: 'O-Negative stock critically low: 2 units (threshold: 5)', actionText: 'Request Donor', resolved: false }
    ],
    donors: [
      { id: 'DON-2026-0041', name: 'Rajesh Kumar', age: 35, sex: 'Male', bloodGroup: 'B+', type: 'Voluntary', history: [{ date: '2026-06-24', vol: '450ml', tti: 'All clear', component: 'PRBC', status: 'Issued' }] },
      { id: 'DON-2026-0038', name: 'Priya Menon', age: 38, sex: 'Female', bloodGroup: 'O+', type: 'Replacement', history: [{ date: '2026-06-24', vol: '350ml', tti: 'All clear', component: 'FFP', status: 'Available' }] },
      { id: 'DON-2026-0035', name: 'Amit Patel', age: 29, sex: 'Male', bloodGroup: 'B+', type: 'Voluntary', history: [{ date: '2026-06-18', vol: '450ml', tti: 'HBsAg reactive', component: '—', status: 'Deferred' }] }
    ],
    ttiQueue: [
      { unitId: 'BB-2026-0441', donorName: 'Rajesh Kumar', group: 'B+', collected: '2026-07-06 08:00', tests: 'HIV/HBsAg/HCV/VDRL/Malaria', status: 'Pending', kitLot: 'LOT-441' },
      { unitId: 'BB-2026-0440', donorName: 'Priya Menon', group: 'O+', collected: '2026-07-06 09:15', tests: 'HIV/HBsAg/HCV/VDRL/Malaria', status: 'In progress', kitLot: 'LOT-440' }
    ],
    unitInventory: [
      { unitId: 'BB-PRBC-2026-0441', component: 'PRBC', group: 'B+', volume: '280ml', collected: '2026-06-24', expiry: '2026-07-28', status: 'Available', location: 'Fridge-1', activeTransfusion: null },
      { unitId: 'BB-FFP-2026-0440', component: 'FFP', group: 'O+', volume: '220ml', collected: '2026-06-24', expiry: '2027-06-24', status: 'Available', location: 'Freezer-1' },
      { unitId: 'BB-PLT-2026-0439', component: 'Platelets', group: 'A+', volume: '50ml', collected: '2026-07-01', expiry: '2026-07-05', status: 'Expired', location: 'Agitator-1' },
      { unitId: 'BB-PRBC-2026-0438', component: 'PRBC', group: 'O-', volume: '280ml', collected: '2026-06-20', expiry: '2026-07-24', status: 'Reserved', location: 'Fridge-1', patientName: 'Priya Menon', patientUhid: 'SH-2026-04803' },
      { unitId: 'BB-PRBC-2026-0430', component: 'PRBC', group: 'B+', volume: '280ml', collected: '2026-06-15', expiry: '2026-07-19', status: 'Quarantine', location: 'Quarantine shelf', counsellingDone: false }
    ],
    pendingRequests: [
      { reqId: 'BR-2026-0041', patientName: 'Rajesh Kumar', uhid: 'SH-2026-04821', ward: 'ICU', component: 'PRBC', units: 2, urgency: 'Urgent', waiting: '22 min', status: 'Pending Crossmatch', sampleReceived: true },
      { reqId: 'BR-2026-0040', patientName: 'Priya Menon', uhid: 'SH-2026-04803', ward: 'OT', component: 'FFP', units: 4, urgency: 'Emergency', waiting: '8 min', status: 'Pending Issue', sampleReceived: true }
    ],
    tempLogs: [
      { unit: 'Fridge-1', date: '2026-07-06', readings: { '08:00': '4.1°C', '12:00': '4.3°C', '16:00': '4.0°C', '20:00': '3.8°C', '00:00': '4.2°C', '04:00': '4.1°C' }, breachAction: '' },
      { unit: 'Freezer-1', date: '2026-07-06', readings: { '08:00': '-18.5°C', '12:00': '-19.0°C', '16:00': '-18.2°C', '20:00': '-18.8°C', '00:00': '-17.5°C', '04:00': '-18.1°C' }, breachAction: '' },
      { unit: 'Freezer-2 (FRZE-02)', date: '2026-07-06', readings: { '08:00': '-19.1°C', '12:00': '-18.6°C', '16:00': '-14.0°C ⚠️', '20:00': '-13.8°C ⚠️', '00:00': '-18.5°C', '04:00': '-18.2°C' }, breachAction: 'Checked door seal. Closed fully. Temp recovered.' }
    ],
    reactions: [
      { date: '2026-07-06', type: 'Transfusion reaction', name: 'Rajesh Kumar', unitId: 'BB-PRBC-2026-0441', event: 'FNHTR', severity: 'Minor', reported: 'MS Verified', action: 'Transfusion stopped. Anti-pyretic administered.' }
    ]
  };
}

window.views.bloodbank = function(container, subAnchor, params) {
  renderBloodBankModule(container);
};

function renderBloodBankModule(container) {
  const b = window.state.bloodbank;
  const role = localStorage.getItem('saronil_bb_role') || b.activeRole;
  const activeTab = localStorage.getItem('saronil_bb_tab') || b.activeTab;

  const styles = `
    <style>
      :root {
        --bb-red: #dc2626;       --bb-red-light: #fee2e2;
        --bb-blue: #0C3E91;      --bb-blue-light: #dbeafe;
        --bb-green: #059669;     --bb-green-light: #d1fae5;
        --bb-amber: #d97706;     --bb-amber-light: #fef3c7;
        --bb-purple: #7c3aed;    --bb-purple-light: #ede9fe;
        --bb-slate: #475569;     --bb-slate-light: #f1f5f9;
      }
      .bb-container {
        font-family: 'Outfit', sans-serif;
        color: var(--text-primary);
        display: flex;
        flex-direction: column;
        gap: 1.25rem;
      }
      .bb-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 1px solid var(--border-color);
        padding-bottom: 1rem;
        flex-wrap: wrap;
        gap: 12px;
      }
      .bb-tab-bar {
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
      .bb-tab-btn {
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
      .bb-tab-btn.active {
        background: var(--bb-red);
        color: white;
      }
      .alert-strip {
        background: var(--bb-red-light);
        border: 1px solid var(--bb-red);
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
      .stock-matrix-table {
        width: 100%;
        border-collapse: collapse;
        font-size: 0.82rem;
        margin-top: 8px;
      }
      .stock-matrix-table th, .stock-matrix-table td {
        border: 1px solid var(--border-color);
        padding: 8px;
        text-align: center;
      }
      .stock-cell {
        font-weight: 700;
        cursor: pointer;
        transition: transform 0.1s ease;
      }
      .stock-cell:hover {
        transform: scale(1.08);
      }
      .stock-cell.green { background: var(--bb-green-light); color: var(--bb-green); }
      .stock-cell.amber { background: var(--bb-amber-light); color: var(--bb-amber); }
      .stock-cell.red { background: var(--bb-red-light); color: var(--bb-red); }
      
      .status-badge {
        font-size: 0.72rem;
        font-weight: 700;
        padding: 2px 8px;
        border-radius: 12px;
        text-transform: uppercase;
      }
      .status-badge.available { background: var(--bb-green-light); color: var(--bb-green); }
      .status-badge.reserved { background: var(--bb-blue-light); color: var(--bb-blue); }
      .status-badge.crossmatch { background: var(--bb-amber-light); color: var(--bb-amber); }
      .status-badge.issued { background: var(--bb-slate-light); color: var(--bb-slate); }
      .status-badge.quarantine { background: var(--bb-red-light); color: var(--bb-red); }
      .status-badge.expired { background: var(--bb-red-light); color: var(--bb-red); text-decoration: line-through; }
      .status-badge.discarded { background: var(--bb-slate-light); color: var(--bb-slate); }
      
      .stat-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
        gap: 10px;
      }
      .stat-box {
        background: var(--bg-surface);
        border: 1px solid var(--border-color);
        border-radius: 8px;
        padding: 12px;
        text-align: center;
        cursor: pointer;
        transition: all 0.2s ease;
      }
      .stat-box:hover {
        box-shadow: var(--shadow-sm);
        border-color: var(--bb-red);
      }
      .form-group {
        display: flex;
        flex-direction: column;
        gap: 4px;
        text-align: left;
      }
      .form-group label {
        font-size: 0.78rem;
        font-weight: 700;
        color: var(--text-muted);
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

  // Define tabs and their role access
  const allTabs = [
    { id: 'dashboard', label: '📊 Dashboard', roles: ['Blood Bank Technician', 'Blood Bank Officer', 'Transfusion Medicine Officer', 'Donor Counsellor', 'Ward Nurse (request + transfusion)', 'Administrator'] },
    { id: 'donor-mgmt', label: '🩸 Donor Management', roles: ['Blood Bank Technician', 'Blood Bank Officer', 'Transfusion Medicine Officer', 'Donor Counsellor', 'Administrator'] },
    { id: 'testing-processing', label: '🧪 Testing & Processing', roles: ['Blood Bank Technician', 'Blood Bank Officer', 'Transfusion Medicine Officer', 'Administrator'] },
    { id: 'inventory', label: '🗄 Inventory', roles: ['Blood Bank Technician', 'Blood Bank Officer', 'Transfusion Medicine Officer', 'Administrator'] },
    { id: 'issue-crossmatch', label: '💉 Issue & Crossmatch', roles: ['Blood Bank Technician', 'Blood Bank Officer', 'Transfusion Medicine Officer', 'Ward Nurse (request + transfusion)', 'Administrator'] },
    { id: 'reactions', label: '⚠️ Reactions & Haemovigilance', roles: ['Blood Bank Officer', 'Transfusion Medicine Officer', 'Donor Counsellor', 'Ward Nurse (request + transfusion)', 'Administrator'] },
    { id: 'statutory', label: '📜 Statutory Registers', roles: ['Blood Bank Technician', 'Blood Bank Officer', 'Transfusion Medicine Officer', 'Donor Counsellor', 'Administrator'] },
    { id: 'camps', label: '🏕 Blood Camps', roles: ['Blood Bank Officer', 'Transfusion Medicine Officer', 'Administrator'] }
  ];

  const visibleTabs = allTabs.filter(t => t.roles.includes(role));

  // Tab guard checks
  let currentTab = activeTab;
  if (!visibleTabs.some(t => t.id === currentTab)) {
    currentTab = visibleTabs[0] ? visibleTabs[0].id : 'dashboard';
  }

  container.innerHTML = styles + `
    <div class="bb-container">
      <!-- Top header bar with persona switcher -->
      <div class="bb-header">
        <div>
          <h1 style="font-size:1.4rem; font-weight:800; color:var(--bb-red); margin:0;">Blood Transfusion Medicine Services</h1>
          <p style="font-size:0.78rem; color:var(--text-muted); margin-top:2px;">Statutory registers &middot; Transfusion Safety checkoff &middot; Live Stock Matrix &middot; Haemovigilance</p>
        </div>
        <div style="display:flex; align-items:center; gap:8px;">
          <button class="btn btn-secondary btn-sm" style="background:var(--bb-red); color:#fff;" onclick="window.showStockRequestOverlay({dept:'Blood Bank', urgency:'Urgent'})">📦 Request Consumables</button>
          <label style="font-size:0.75rem; font-weight:700; color:var(--text-muted);">Duty Persona:</label>
          <select id="bb-role-select" onchange="window.switchBBRole(this.value)" class="form-select" style="font-size:0.75rem; font-weight:700; width:220px; padding:4px 8px; border-radius:4px; border:1px solid var(--border-color); background:var(--bg-surface-elevated);">
            <option value="Blood Bank Technician" ${role === 'Blood Bank Technician' ? 'selected' : ''}>Blood Bank Technician</option>
            <option value="Blood Bank Officer" ${role === 'Blood Bank Officer' ? 'selected' : ''}>Blood Bank Officer</option>
            <option value="Transfusion Medicine Officer" ${role === 'Transfusion Medicine Officer' ? 'selected' : ''}>Transfusion Medicine Officer</option>
            <option value="Donor Counsellor" ${role === 'Donor Counsellor' ? 'selected' : ''}>Donor Counsellor</option>
            <option value="Ward Nurse (request + transfusion)" ${role === 'Ward Nurse (request + transfusion)' ? 'selected' : ''}>Ward Nurse (Request &amp; Transfuse)</option>
            <option value="Administrator" ${role === 'Administrator' ? 'selected' : ''}>Administrator</option>
          </select>
        </div>
      </div>

      <!-- Tab bar navigation -->
      <div class="bb-tab-bar">
        ${visibleTabs.map(t => `
          <button onclick="window.switchBBTab('${t.id}')" class="bb-tab-btn ${currentTab === t.id ? 'active' : ''}">${t.label}</button>
        `).join('')}
      </div>

      <!-- Tab viewport content panel -->
      <div id="bb-tab-viewport"></div>
    </div>
  `;

  const viewport = document.getElementById('bb-tab-viewport');
  if (currentTab === 'dashboard') {
    renderBBDashboardTab(viewport);
  } else if (currentTab === 'donor-mgmt') {
    renderBBDonorTab(viewport);
  } else if (currentTab === 'testing-processing') {
    renderBBTestingTab(viewport);
  } else if (currentTab === 'inventory') {
    renderBBInventoryTab(viewport);
  } else if (currentTab === 'issue-crossmatch') {
    renderBBIssueTab(viewport);
  } else if (currentTab === 'reactions') {
    renderBBReactionsTab(viewport);
  } else if (currentTab === 'statutory') {
    renderBBStatutoryTab(viewport);
  } else if (currentTab === 'camps') {
    renderBBCampsTab(viewport);
  }
}

// Global actions
window.switchBBRole = function(role) {
  localStorage.setItem('saronil_bb_role', role);
  window.state.bloodbank.activeRole = role;
  
  // Set default tabs per role
  let tab = 'dashboard';
  if (role === 'Donor Counsellor') tab = 'donor-mgmt';
  else if (role === 'Ward Nurse (request + transfusion)') tab = 'issue-crossmatch';

  localStorage.setItem('saronil_bb_tab', tab);
  window.state.bloodbank.activeTab = tab;
  
  renderBloodBankModule(document.getElementById('main-content'));
  showBBToast(`Persona switched to: ${role}`);
};

window.switchBBTab = function(tabId) {
  localStorage.setItem('saronil_bb_tab', tabId);
  window.state.bloodbank.activeTab = tabId;
  renderBloodBankModule(document.getElementById('main-content'));
};

window.resolveBBAlert = function(alertId) {
  const alertItem = window.state.bloodbank.alerts.find(a => a.id === alertId);
  if (alertItem) {
    alertItem.resolved = true;
    showBBToast("Alert action resolved and logged.");
    
    // Perform corresponding redirect actions
    if (alertId === 'bb-alt-001') {
      window.switchBBTab('testing-processing');
    } else if (alertId === 'bb-alt-002') {
      window.switchBBTab('donor-mgmt');
    }
  }
};

function showBBToast(msg) {
  const toast = document.createElement('div');
  toast.className = 'toast-notification';
  toast.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    padding: 12px 24px;
    background: var(--bb-blue);
    color: white;
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0,0,0,0.15);
    z-index: 100005;
    font-size: 0.85rem;
    font-weight: 600;
    font-family: 'Outfit', sans-serif;
  `;
  toast.innerText = msg;
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 2500);
}

// ──────────────────────────────────────────────────────────────────────────
// TAB 1 - DASHBOARD
// ──────────────────────────────────────────────────────────────────────────
function renderBBDashboardTab(container) {
  const b = window.state.bloodbank;
  const activeAlerts = b.alerts.filter(a => !a.resolved);

  // 1A - Critical Alert Strip
  let alertStripHTML = '';
  if (activeAlerts.length > 0) {
    alertStripHTML = `
      <div class="alert-strip">
        ${activeAlerts.map(a => `
          <div class="alert-item">
            <span>${a.type === 'danger' ? '🔴' : '⚠️'} ${a.message}</span>
            <button class="btn btn-secondary btn-xs" style="background:#fff; color:#991b1b; border:1px solid #fca5a5; font-size:9.5px;" onclick="window.resolveBBAlert('${a.id}')">${a.actionText}</button>
          </div>
        `).join('')}
      </div>
    `;
  }

  // 1B - Stock Summary Matrix
  // Matrix data source structure
  const components = ["PRBC", "FFP", "Platelets", "Cryoprecipitate", "Whole Blood"];
  const groups = ["O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-"];
  
  // Custom stock matrix lookup
  const getCellStock = (comp, grp) => {
    if (comp === 'Whole Blood') return 0;
    // Map comp names to state structure keys
    const componentKey = comp === 'Cryoprecipitate' ? 'ffp' : comp.toLowerCase(); // Map cryo to ffp or default safely
    const groupStock = window.state.bloodStock[grp];
    if (groupStock) {
      if (componentKey === 'prbc') return groupStock.components.rbc;
      if (componentKey === 'platelets') return groupStock.components.platelets;
      if (componentKey === 'ffp') return groupStock.components.ffp;
      // return default component matching safely
      return groupStock.components[componentKey] || 0;
    }
    return 0;
  };

  const tableHeaderHTML = `
    <thead>
      <tr style="background:var(--bg-slate-light);">
        <th>Blood Component</th>
        ${groups.map(g => `<th>${g}</th>`).join('')}
      </tr>
    </thead>
  `;

  const tableBodyHTML = components.map(comp => {
    return `
      <tr>
        <td style="font-weight:700; text-align:left;">${comp}</td>
        ${groups.map(grp => {
          const val = getCellStock(comp, grp);
          let cellClass = 'green';
          if (val === 0 || val === 1) cellClass = 'red';
          else if (val >= 2 && val <= 4) cellClass = 'amber';
          return `<td class="stock-cell ${cellClass}" onclick="window.filterStock('${comp}', '${grp}')">${val}</td>`;
        }).join('')}
      </tr>
    `;
  }).join('');

  // 1C - Stat Cards
  const totalStockCount = Object.values(window.state.bloodStock).reduce((acc, current) => acc + current.bags, 0);

  const statsHTML = `
    <div class="stat-grid" style="margin-top:10px;">
      <div class="stat-box" onclick="window.switchBBTab('inventory')">
        <div style="font-size:0.72rem; font-weight:700; color:var(--text-muted);">UNITS IN STOCK</div>
        <div style="font-size:1.4rem; font-weight:800; color:var(--bb-red); margin-top:2px;">${totalStockCount}</div>
      </div>
      <div class="stat-box" onclick="window.switchBBTab('donor-mgmt')">
        <div style="font-size:0.72rem; font-weight:700; color:var(--text-muted);">DONORS TODAY</div>
        <div style="font-size:1.4rem; font-weight:800; color:var(--bb-blue); margin-top:2px;">3</div>
      </div>
      <div class="stat-box" onclick="window.switchBBTab('issue-crossmatch')">
        <div style="font-size:0.72rem; font-weight:700; color:var(--text-muted);">PENDING REQUESTS</div>
        <div style="font-size:1.4rem; font-weight:800; color:var(--bb-purple); margin-top:2px;">2</div>
      </div>
      <div class="stat-box" onclick="window.filterStock('All', 'All', 'expiring')">
        <div style="font-size:0.72rem; font-weight:700; color:var(--text-muted);">EXPIRING &lt; 48HRS</div>
        <div style="font-size:1.4rem; font-weight:800; color:var(--bb-amber); margin-top:2px;">4</div>
      </div>
      <div class="stat-box" onclick="window.switchBBTab('testing-processing')">
        <div style="font-size:0.72rem; font-weight:700; color:var(--text-muted);">REACTIVE UNITS</div>
        <div style="font-size:1.4rem; font-weight:800; color:var(--bb-red); margin-top:2px;">1</div>
      </div>
    </div>
  `;

  // 1D - Pending Requests Table
  const pendingRequestsRowsHTML = b.pendingRequests.map(r => {
    let bgStyle = '';
    if (r.urgency === 'Emergency') bgStyle = 'style="background:var(--bb-red-light); color:#991b1b;"';
    
    return `
      <tr ${bgStyle}>
        <td class="admin-mono"><strong>${r.reqId}</strong></td>
        <td><strong>${r.patientName}</strong></td>
        <td class="admin-mono">${r.uhid}</td>
        <td>${r.ward}</td>
        <td><span class="badge badge-purple">${r.component}</span></td>
        <td>${r.units}</td>
        <td><span class="status-badge ${r.urgency.toLowerCase()}">${r.urgency}</span></td>
        <td>${r.waiting}</td>
        <td style="text-align:right;">
          ${r.urgency === 'Emergency' ? `
            <button class="btn btn-secondary btn-xs" style="background:var(--bb-red); color:#fff; border:none;" onclick="window.openEmergencyReleaseModal('${r.reqId}')">Issue O-neg</button>
          ` : `
            <button class="btn btn-primary btn-xs" onclick="window.openCrossmatchModal('${r.reqId}')">Crossmatch</button>
          `}
        </td>
      </tr>
    `;
  }).join('');

  container.innerHTML = `
    ${alertStripHTML}
    ${statsHTML}

    <!-- Stock matrix panel -->
    <div class="card" style="margin-top:1.25rem; text-align:left;">
      <div class="card-header">
        <h3 class="card-title" style="margin:0; font-size:1rem; font-weight:800;">🩸 Real-time Blood Stock Matrix</h3>
      </div>
      <div class="card-body" style="padding:0; overflow-x:auto;">
        <table class="stock-matrix-table">
          ${tableHeaderHTML}
          <tbody>
            ${tableBodyHTML}
          </tbody>
        </table>
      </div>
    </div>

    <!-- Pending Transfusion/Issue requests -->
    <div class="card" style="margin-top:1.25rem; text-align:left;">
      <div class="card-header">
        <h3 class="card-title" style="margin:0; font-size:1rem; font-weight:800;">📋 Pending Crossmatch &amp; Release Queue</h3>
      </div>
      <div class="card-body" style="padding:0; overflow-x:auto;">
        <table class="custom-table" style="font-size:0.8rem; width:100%;">
          <thead>
            <tr style="background:var(--bg-slate-light); border-bottom:2px solid var(--border-color);">
              <th>Req ID</th>
              <th>Patient</th>
              <th>UHID</th>
              <th>Ward</th>
              <th>Component</th>
              <th>Units</th>
              <th>Urgency</th>
              <th>Waiting</th>
              <th style="text-align:right;">Action</th>
            </tr>
          </thead>
          <tbody>
            ${pendingRequestsRowsHTML}
          </tbody>
        </table>
      </div>
    </div>

    <!-- Inventory Recent Requests strip integration -->
    ${window.renderMyRecentRequestsHTML ? window.renderMyRecentRequestsHTML('Blood Bank') : ''}
  `;
}

window.filterStock = function(comp, grp, special = '') {
  window.state.bloodbank.inventoryFilter = {
    component: comp === 'Whole Blood' ? 'All' : comp,
    group: grp,
    expired: special === 'expiring' ? 'Expiring' : 'All'
  };
  window.switchBBTab('inventory');
};

// ──────────────────────────────────────────────────────────────────────────
// TAB 2 - DONOR MANAGEMENT
// ──────────────────────────────────────────────────────────────────────────
function renderBBDonorTab(container) {
  const b = window.state.bloodbank;

  // Active Donor Search History timeline
  const activeDonorSearch = b.activeDonorSearch || '';
  let historyTimelineHTML = '';
  if (activeDonorSearch) {
    const d = b.donors.find(dn => dn.id === activeDonorSearch || dn.name.toLowerCase().includes(activeDonorSearch.toLowerCase()));
    if (d) {
      historyTimelineHTML = `
        <div style="background:var(--bg-slate-light); border:1px solid var(--border-color); border-radius:8px; padding:12px; margin-top:12px;">
          <h4 style="margin:0 0 8px 0; color:var(--bb-blue); font-size:0.85rem;">Donation History Timeline &mdash; ${d.name} (${d.bloodGroup})</h4>
          <div style="font-size:0.75rem; color:var(--text-muted); margin-bottom:8px;">Donor ID: ${d.id} · Total Donations: ${d.history.length}</div>
          <table class="custom-table" style="font-size:0.75rem; background:#fff; width:100%;">
            <thead>
              <tr style="background:var(--bg-slate-light);">
                <th>Date</th>
                <th>Volume</th>
                <th>TTI Screen</th>
                <th>Component</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${d.history.map(h => `
                <tr>
                  <td>${h.date}</td>
                  <td>${h.vol}</td>
                  <td><span style="font-weight:600; color:${h.tti.includes('reactive') ? 'var(--bb-red)' : 'var(--bb-green)'}">${h.tti}</span></td>
                  <td>${h.component}</td>
                  <td><span class="status-badge ${h.status.toLowerCase()}">${h.status}</span></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;
    } else {
      historyTimelineHTML = `<div style="font-size:0.75rem; color:var(--bb-red); margin-top:10px;">Donor profile not found.</div>`;
    }
  }

  container.innerHTML = `
    <div style="display:grid; grid-template-columns:1fr 1fr; gap:1.25rem; align-items:start; text-align:left;">
      <!-- Donor registration form card -->
      <div class="card">
        <div class="card-header">
          <h3 class="card-title" style="margin:0; font-size:0.95rem; font-weight:800;">✍ Donor Registration</h3>
        </div>
        <div class="card-body" style="font-size:0.8rem; display:flex; flex-direction:column; gap:10px;">
          <div>
            <label style="font-weight:700;">Full Name *</label>
            <input type="text" id="dnr-reg-name" class="form-control" placeholder="e.g. Anand Sharma" style="font-size:0.75rem;">
          </div>
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px;">
            <div>
              <label style="font-weight:700;">DOB / Age *</label>
              <input type="text" id="dnr-reg-age" class="form-control" placeholder="e.g. 34" style="font-size:0.75rem;">
            </div>
            <div>
              <label style="font-weight:700;">Sex *</label>
              <select id="dnr-reg-sex" class="form-select" style="font-size:0.75rem;">
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
          <div>
            <label style="font-weight:700;">Mobile Number *</label>
            <input type="text" id="dnr-reg-mobile" class="form-control" placeholder="e.g. 9876543210" style="font-size:0.75rem;">
          </div>
          <div>
            <label style="font-weight:700;">Address *</label>
            <textarea id="dnr-reg-address" class="form-control" rows="2" placeholder="Donor address" style="font-size:0.75rem;"></textarea>
          </div>
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px;">
            <div>
              <label style="font-weight:700;">ID Proof Type</label>
              <select id="dnr-reg-idtype" class="form-select" style="font-size:0.75rem;">
                <option value="Aadhaar">Aadhaar Card</option>
                <option value="Voter ID">Voter ID</option>
                <option value="PAN">PAN Card</option>
                <option value="License">Driving Licence</option>
              </select>
            </div>
            <div>
              <label style="font-weight:700;">ID Number *</label>
              <input type="text" id="dnr-reg-idno" class="form-control" placeholder="ID reference number" style="font-size:0.75rem;">
            </div>
          </div>
          <div>
            <label style="font-weight:700;">Donor Type</label>
            <select id="dnr-reg-type" class="form-select" style="font-size:0.75rem;">
              <option value="Voluntary">Voluntary</option>
              <option value="Replacement">Replacement</option>
              <option value="Autologous">Autologous</option>
              <option value="Directed">Directed</option>
            </select>
          </div>
          <button class="btn btn-primary" onclick="window.registerDonorProfile()" style="margin-top:10px;">Register New Donor</button>
        </div>
      </div>

      <!-- Pre-Donation Triage & Collection Logs -->
      <div style="display:flex; flex-direction:column; gap:1.25rem;">
        <div class="card">
          <div class="card-header">
            <h3 class="card-title" style="margin:0; font-size:0.95rem; font-weight:800;">🩺 Donor Pre-Donation Triage &amp; Deferrals</h3>
          </div>
          <div class="card-body" style="font-size:0.8rem; display:flex; flex-direction:column; gap:8px;">
            <div style="display:grid; grid-template-columns:1.5fr 1fr; gap:8px; align-items:center;">
              <label style="font-weight:700;">Select Registered Donor</label>
              <select id="dnr-select-triage" class="form-select" style="font-size:0.75rem;" onchange="window.selectDonorForTriage(this.value)">
                <option value="">-- select donor --</option>
                ${b.donors.map(d => `<option value="${d.id}">${d.name} (${d.id})</option>`).join('')}
              </select>
            </div>

            <!-- Vitals fields -->
            <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:8px; margin-top:8px;">
              <div>
                <label style="font-size:10px;">Weight (kg) *</label>
                <input type="number" id="dnr-vit-weight" class="form-control" value="65" onchange="window.validateDonorVitals()" style="font-size:11px; padding:2px 4px;">
              </div>
              <div>
                <label style="font-size:10px;">Hb (g/dL) *</label>
                <input type="number" id="dnr-vit-hb" class="form-control" value="14.2" step="0.1" onchange="window.validateDonorVitals()" style="font-size:11px; padding:2px 4px;">
              </div>
              <div>
                <label style="font-size:10px;">BP (Sys/Dia) *</label>
                <div style="display:flex; gap:2px;">
                  <input type="number" id="dnr-vit-bps" class="form-control" value="120" onchange="window.validateDonorVitals()" style="font-size:11px; padding:2px 4px; width:50%;">
                  <input type="number" id="dnr-vit-bpd" class="form-control" value="80" onchange="window.validateDonorVitals()" style="font-size:11px; padding:2px 4px; width:50%;">
                </div>
              </div>
            </div>

            <!-- Deferral trigger warning boxes -->
            <div id="dnr-triage-warning" style="display:none; background:var(--bb-red-light); color:#b91c1c; font-size:11px; padding:8px; border-radius:4px; font-weight:700;"></div>

            <!-- Deferrals checklists -->
            <div style="margin-top:8px;">
              <h4 style="margin:0 0 4px 0; font-size:0.75rem;">Permanent Deferrals (check to block)</h4>
              <label style="display:flex; align-items:center; gap:6px; font-size:11px;"><input type="checkbox" id="def-hiv-reactive" onchange="window.checkPermanentDefer()"> HIV/HBV/HCV/Syphilis history</label>
              <label style="display:flex; align-items:center; gap:6px; font-size:11px;"><input type="checkbox" id="def-cancer" onchange="window.checkPermanentDefer()"> Malignancy / bleeding disorder history</label>
            </div>

            <div style="margin-top:8px;">
              <h4 style="margin:0 0 4px 0; font-size:0.75rem;">Temporary Deferrals</h4>
              <label style="display:flex; align-items:center; gap:6px; font-size:11px;"><input type="checkbox" id="def-donation-3mo" onchange="window.checkTempDefer(3, 'months')"> Last donation &lt; 3 months (defer 3 months)</label>
              <label style="display:flex; align-items:center; gap:6px; font-size:11px;"><input type="checkbox" id="def-fever" onchange="window.checkTempDefer(2, 'weeks')"> Fever / infection &lt; 2 weeks (defer 2 weeks)</label>
            </div>

            <div id="def-calc-return" style="display:none; background:var(--bb-amber-light); color:#b45309; font-size:11px; padding:8px; border-radius:4px; font-weight:700; margin-top:4px;"></div>

            <!-- Consent -->
            <div style="border-top:1px solid var(--border-color); padding-top:8px; margin-top:8px; display:flex; flex-direction:column; gap:4px;">
              <label style="display:flex; align-items:center; gap:6px; font-size:11px;"><input type="checkbox" id="dnr-consent-chk"> Donor consent form signed &amp; witnessed *</label>
              <button class="btn btn-secondary w-full" id="dnr-triage-btn" onclick="window.triageAcceptDonor()">Accept Donor for Collection</button>
            </div>
          </div>
        </div>

        <!-- Collection operations log -->
        <div class="card">
          <div class="card-header">
            <h3 class="card-title" style="margin:0; font-size:0.95rem; font-weight:800;">💉 Donor Collection details</h3>
          </div>
          <div class="card-body" style="font-size:0.8rem; display:flex; flex-direction:column; gap:8px;">
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px;">
              <div>
                <label style="font-weight:700;">Bag Type</label>
                <select id="col-bagtype" class="form-select" style="font-size:0.75rem;">
                  <option value="Single">Single Bag</option>
                  <option value="Double" selected>Double Bag</option>
                  <option value="Triple">Triple Bag</option>
                </select>
              </div>
              <div>
                <label style="font-weight:700;">Suggested Volume</label>
                <input type="text" id="col-volume" value="450ml" class="form-control" style="font-size:0.75rem;" readonly>
              </div>
            </div>
            <div style="display:grid; grid-template-columns:1.5fr 1fr; gap:8px; align-items:center;">
              <div>
                <label style="font-weight:700;">Phlebotomist Name *</label>
                <input type="text" id="col-phleb" value="Tech Kavitha" class="form-control" style="font-size:0.75rem;">
              </div>
              <div>
                <label style="font-weight:700;">Segment tubes count</label>
                <input type="number" id="col-segments" value="4" class="form-control" style="font-size:0.75rem;">
              </div>
            </div>
            <button class="btn btn-primary" onclick="window.saveDonorCollection()">Log Collection &amp; Start Rest Timer</button>
          </div>
        </div>

        <!-- Search / timeline view -->
        <div class="card">
          <div class="card-header">
            <h3 class="card-title" style="margin:0; font-size:0.95rem; font-weight:800;">🔍 Donor History Lookup</h3>
          </div>
          <div class="card-body" style="font-size:0.8rem;">
            <div style="display:flex; gap:8px;">
              <input type="text" id="dnr-history-search" class="form-control" placeholder="Enter ID or Name..." style="font-size:0.75rem;">
              <button class="btn btn-secondary btn-sm" onclick="window.searchDonorHistory()">Search</button>
            </div>
            ${historyTimelineHTML}
          </div>
        </div>
      </div>
    </div>
  `;
}

window.registerDonorProfile = function() {
  const name = document.getElementById('dnr-reg-name').value;
  const age = document.getElementById('dnr-reg-age').value;
  const sex = document.getElementById('dnr-reg-sex').value;
  const mobile = document.getElementById('dnr-reg-mobile').value;
  const address = document.getElementById('dnr-reg-address').value;
  const idno = document.getElementById('dnr-reg-idno').value;
  const type = document.getElementById('dnr-reg-type').value;

  if (!name || !age || !idno) {
    alert("Mandatory fields full name, age, ID number must be filled.");
    return;
  }

  const newId = "DON-2026-" + Math.floor(Math.random() * 10000 + 1000).toString();
  window.state.bloodbank.donors.push({
    id: newId,
    name: name,
    age: parseInt(age),
    sex: sex,
    bloodGroup: 'O+',
    type: type,
    history: []
  });

  showBBToast(`Donor ${name} registered. ID Generated: ${newId}`);
  renderBloodBankModule(document.getElementById('main-content'));
};

window.selectDonorForTriage = function(val) {
  if (!val) return;
  const d = window.state.bloodbank.donors.find(dn => dn.id === val);
  if (d) {
    // Auto calculate bags suggestions based on typical weights/vitals
    document.getElementById('dnr-vit-weight').value = d.sex === 'Female' ? 52 : 68;
    window.validateDonorVitals();
  }
};

window.validateDonorVitals = function() {
  const w = parseFloat(document.getElementById('dnr-vit-weight').value) || 0;
  const hb = parseFloat(document.getElementById('dnr-vit-hb').value) || 0;
  const bps = parseInt(document.getElementById('dnr-vit-bps').value) || 0;
  const bpd = parseInt(document.getElementById('dnr-vit-bpd').value) || 0;

  const warningDiv = document.getElementById('dnr-triage-warning');
  let errors = [];

  // Reset colors
  document.getElementById('dnr-vit-weight').style.borderColor = '';
  document.getElementById('dnr-vit-hb').style.borderColor = '';
  document.getElementById('dnr-vit-bps').style.borderColor = '';
  document.getElementById('dnr-vit-bpd').style.borderColor = '';

  if (w < 45) {
    document.getElementById('dnr-vit-weight').style.borderColor = 'var(--bb-red)';
    errors.push("Weight below min 45 kg");
  }
  if (hb < 12.5) {
    document.getElementById('dnr-vit-hb').style.borderColor = 'var(--bb-red)';
    errors.push("Hb level below min 12.5 g/dL");
  }
  if (bps < 100 || bps > 180 || bpd < 60 || bpd > 100) {
    document.getElementById('dnr-vit-bps').style.borderColor = 'var(--bb-red)';
    document.getElementById('dnr-vit-bpd').style.borderColor = 'var(--bb-red)';
    errors.push("Blood Pressure out of range (100-180 / 60-100)");
  }

  if (errors.length > 0) {
    warningDiv.innerHTML = `⚠️ DEFERRAL TRIGGERED:<br>${errors.join('<br>')}`;
    warningDiv.style.display = 'block';
    document.getElementById('dnr-triage-btn').className = 'btn btn-secondary w-full';
    document.getElementById('dnr-triage-btn').innerText = 'Defer Donor';
  } else {
    warningDiv.style.display = 'none';
    document.getElementById('dnr-triage-btn').className = 'btn btn-primary w-full';
    document.getElementById('dnr-triage-btn').innerText = 'Accept Donor for Collection';
  }

  // Suggest bag volume
  document.getElementById('col-volume').value = w >= 60 ? '450ml' : '350ml';
};

window.checkPermanentDefer = function() {
  const hiv = document.getElementById('def-hiv-reactive').checked;
  const cancer = document.getElementById('def-cancer').checked;
  
  if (hiv || cancer) {
    alert("🔴 PERMANENT DEFERRAL DETECTED!\n\nThis donor has conditions that trigger permanent deferral. No collection is allowed.");
    document.getElementById('dnr-triage-btn').disabled = true;
  } else {
    document.getElementById('dnr-triage-btn').disabled = false;
  }
};

window.checkTempDefer = function(num, period) {
  const d1 = document.getElementById('def-donation-3mo').checked;
  const d2 = document.getElementById('def-fever').checked;

  const returnDiv = document.getElementById('def-calc-return');
  if (d1 || d2) {
    let date = new Date();
    if (d1) date.setMonth(date.getMonth() + 3);
    else if (d2) date.setDate(date.getDate() + 14);

    returnDiv.innerText = `⏳ Temporary Deferral Return Date: ${date.toDateString()}`;
    returnDiv.style.display = 'block';
  } else {
    returnDiv.style.display = 'none';
  }
};

window.triageAcceptDonor = function() {
  const dId = document.getElementById('dnr-select-triage').value;
  if (!dId) {
    alert("Please select a registered donor first.");
    return;
  }
  if (!document.getElementById('dnr-consent-chk').checked) {
    alert("Consent check is mandatory before proceeding to collection.");
    return;
  }

  const triageAction = document.getElementById('dnr-triage-btn').innerText;
  if (triageAction.includes('Defer')) {
    showBBToast("Donor status set to DEFERRED.");
  } else {
    showBBToast("Donor accepted. Proceed to Phlebotomy Collection.");
  }
};

window.saveDonorCollection = function() {
  const phleb = document.getElementById('col-phleb').value;
  if (!phleb) {
    alert("Phlebotomist name is required.");
    return;
  }
  showBBToast("✓ Collection details logged. Bag segment labels issued. Rest timer started (15 min).");
};

window.searchDonorHistory = function() {
  const val = document.getElementById('dnr-history-search').value;
  window.state.bloodbank.activeDonorSearch = val;
  renderBloodBankModule(document.getElementById('main-content'));
};

// ──────────────────────────────────────────────────────────────────────────
// TAB 3 - TESTING & PROCESSING
// ──────────────────────────────────────────────────────────────────────────
function renderBBTestingTab(container) {
  const b = window.state.bloodbank;

  const queueRows = b.ttiQueue.map(q => {
    return `
      <tr style="border-bottom:1px solid var(--border-color);">
        <td class="admin-mono"><strong>${q.unitId}</strong></td>
        <td>${q.donorName}</td>
        <td><span class="badge" style="background:#fecaca; color:#b91c1c;">${q.group}</span></td>
        <td>${q.collected}</td>
        <td>${q.tests}</td>
        <td><span class="status-badge ${q.status.toLowerCase().replace(' ', '-')}">${q.status}</span></td>
        <td style="text-align:right;">
          <button class="btn btn-primary btn-xs" onclick="window.enterTTIResults('${q.unitId}')">Enter Results</button>
        </td>
      </tr>
    `;
  }).join('');

  container.innerHTML = `
    <div style="display:grid; grid-template-columns:1.5fr 1fr; gap:1.25rem; align-items:start; text-align:left;">
      <!-- Queue Panel -->
      <div style="display:flex; flex-direction:column; gap:1.25rem;">
        <div class="card">
          <div class="card-header">
            <h3 class="card-title" style="margin:0; font-size:0.95rem; font-weight:800;">🧪 Transfusion Transmissible Infections (TTI) Testing Queue</h3>
          </div>
          <div class="card-body" style="padding:0; overflow-x:auto;">
            <table class="custom-table" style="font-size:0.8rem; width:100%;">
              <thead>
                <tr style="background:var(--bg-slate-light);">
                  <th>Unit ID</th>
                  <th>Donor</th>
                  <th>Group</th>
                  <th>Collected</th>
                  <th>Required Tests</th>
                  <th>Status</th>
                  <th style="text-align:right;">Action</th>
                </tr>
              </thead>
              <tbody>
                ${queueRows}
              </tbody>
            </table>
          </div>
        </div>

        <!-- Blood Grouping Checkoff -->
        <div class="card">
          <div class="card-header">
            <h3 class="card-title" style="margin:0; font-size:0.95rem; font-weight:800;">🩸 Blood Grouping Dual-Check (Forward vs Reverse)</h3>
          </div>
          <div class="card-body" style="font-size:0.8rem; display:flex; flex-direction:column; gap:10px;">
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px;">
              <div class="form-group">
                <label>Unit ID</label>
                <input type="text" id="grp-unit-id" value="BB-2026-0440" class="form-control" style="font-size:0.75rem;">
              </div>
              <div class="form-group">
                <label>ABO/Rh Result</label>
                <select id="grp-final-select" class="form-select" style="font-size:0.75rem;">
                  <option value="O Positive">O Positive</option>
                  <option value="B Positive">B Positive</option>
                  <option value="A Positive">A Positive</option>
                </select>
              </div>
            </div>
            <!-- Agglutination forward -->
            <div style="background:var(--bg-slate-light); padding:10px; border-radius:6px;">
              <h4 style="margin:0 0 6px 0; font-size:0.75rem; color:var(--bb-blue);">Forward Agglutination</h4>
              <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:6px;">
                <label><input type="checkbox" id="agg-anti-a"> Anti-A</label>
                <label><input type="checkbox" id="agg-anti-b"> Anti-B</label>
                <label><input type="checkbox" id="agg-anti-d" checked> Anti-D (Rh)</label>
              </div>
            </div>
            <!-- Agglutination reverse -->
            <div style="background:var(--bg-slate-light); padding:10px; border-radius:6px;">
              <h4 style="margin:0 0 6px 0; font-size:0.75rem; color:var(--bb-blue);">Reverse Agglutination</h4>
              <div style="display:grid; grid-template-columns:1fr 1fr; gap:6px;">
                <label><input type="checkbox" id="agg-a-cells" checked> A Cells</label>
                <label><input type="checkbox" id="agg-b-cells" checked> B Cells</label>
              </div>
            </div>
            <button class="btn btn-primary" onclick="window.saveBloodGroupResults()">Save Grouping Result</button>
          </div>
        </div>
      </div>

      <!-- Component processing separation -->
      <div class="card">
        <div class="card-header">
          <h3 class="card-title" style="margin:0; font-size:0.95rem; font-weight:800;">🔬 Blood Component Processing Separation</h3>
        </div>
        <div class="card-body" style="font-size:0.8rem; display:flex; flex-direction:column; gap:10px;">
          <div>
            <strong>Unit ID: BB-2026-0440 · O+ &mdash; Cleared</strong>
          </div>
          <div>
            <label style="font-weight:700;">Centrifugation Protocol</label>
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px;">
              <input type="text" value="3800 RPM" class="form-control" style="font-size:0.75rem;" placeholder="Speed">
              <input type="text" value="12 mins" class="form-control" style="font-size:0.75rem;" placeholder="Duration">
            </div>
          </div>
          <div style="border-top:1px solid var(--border-color); padding-top:10px;">
            <h4 style="margin:0 0 6px 0; font-size:0.75rem; color:var(--bb-red);">Separation Outputs</h4>
            <div style="display:flex; flex-direction:column; gap:6px;">
              <label style="display:flex; justify-content:space-between;">
                <span>PRBC Pack (280ml)</span>
                <input type="checkbox" checked>
              </label>
              <label style="display:flex; justify-content:space-between;">
                <span>FFP Plasma Pack (220ml)</span>
                <input type="checkbox" checked>
              </label>
              <label style="display:flex; justify-content:space-between;">
                <span>Cryoprecipitate Pack (50ml)</span>
                <input type="checkbox">
              </label>
            </div>
          </div>
          <button class="btn btn-primary" onclick="showBBToast('✓ Component processing separation logs stored. New unit labels generated.')">Save Separation</button>
        </div>
      </div>
    </div>
  `;
}

window.enterTTIResults = function(unitId) {
  const result = prompt("Enter TTI Test Results for " + unitId + ":\n(Options: ALL CLEAR | HBsAg Reactive | HIV Reactive)", "ALL CLEAR");
  if (!result) return;

  const b = window.state.bloodbank;
  const q = b.ttiQueue.find(qi => qi.unitId === unitId);
  if (q) {
    if (result.toUpperCase().includes('CLEAR')) {
      q.status = 'All clear';
      // Add components to inventory
      b.unitInventory.unshift({
        unitId: `BB-PRBC-2026-${unitId.split('-')[2]}`,
        component: 'PRBC',
        group: q.group,
        volume: '280ml',
        collected: '2026-07-06',
        expiry: '2026-08-10',
        status: 'Available',
        location: 'Fridge-1'
      });
      showBBToast(`✓ TTI Results all clear for ${unitId}. Unit transferred to Processing Queue.`);
    } else {
      q.status = 'TTI Reactive';
      // Mark reactive warning in state
      b.unitInventory.unshift({
        unitId: `BB-PRBC-2026-${unitId.split('-')[2]}`,
        component: 'PRBC',
        group: q.group,
        volume: '280ml',
        collected: '2026-07-06',
        expiry: '2026-08-10',
        status: 'Quarantine',
        location: 'Quarantine shelf',
        counsellingDone: false
      });
      // Trigger Counsellor assign alerts
      alert(`⚠️ TTI REACTIVE DETECTED!\n\nUnit ${unitId} is flagged reactive. Quarantine status auto-applied. Counsellor assignment required.`);
    }
    renderBloodBankModule(document.getElementById('main-content'));
  }
};

window.saveBloodGroupResults = function() {
  const finalGroup = document.getElementById('grp-final-select').value;
  const antiA = document.getElementById('agg-anti-a').checked;
  const antiB = document.getElementById('agg-anti-b').checked;

  // Discrepancy check: O type requires no anti-A and no anti-B agglutination
  if (finalGroup.includes('O') && (antiA || antiB)) {
    alert("🔴 GROUP DISCREPANCY DETECTED!\n\nForward grouping anti-A/B agglutinations do not match reverse results. Blocked for supervisor review.");
    return;
  }
  showBBToast(`Blood group confirmed as ${finalGroup} and stored successfully.`);
};

// ──────────────────────────────────────────────────────────────────────────
// TAB 4 - INVENTORY
// ──────────────────────────────────────────────────────────────────────────
function renderBBInventoryTab(container) {
  const b = window.state.bloodbank;
  const filter = b.inventoryFilter;

  // Filter unitInventory
  let filteredInventory = b.unitInventory;
  if (filter.component !== 'All') {
    filteredInventory = filteredInventory.filter(i => i.component === filter.component);
  }
  if (filter.group !== 'All') {
    filteredInventory = filteredInventory.filter(i => i.group === filter.group);
  }
  if (filter.expired === 'Expiring') {
    // Show closest to expiry
    filteredInventory = filteredInventory.sort((x, y) => new Date(x.expiry) - new Date(y.expiry));
  }

  const invRows = filteredInventory.map(i => {
    return `
      <tr style="border-bottom:1px solid var(--border-color);">
        <td class="admin-mono"><strong>${i.unitId}</strong></td>
        <td><span class="badge badge-purple">${i.component}</span></td>
        <td><span class="badge" style="background:#fee2e2; color:#dc2626;">${i.group}</span></td>
        <td>${i.volume}</td>
        <td>${i.collected}</td>
        <td>${i.expiry}</td>
        <td><span class="status-badge ${i.status.toLowerCase()}">${i.status}</span></td>
        <td>${i.location}</td>
        <td style="text-align:right;">
          ${i.status === 'Available' ? `
            <button class="btn btn-primary btn-xs" onclick="window.reserveUnit('${i.unitId}')">Reserve</button>
            <button class="btn btn-secondary btn-xs" onclick="window.directIssueUnit('${i.unitId}')">Issue</button>
          ` : `<button class="btn btn-outline btn-xs" disabled>Reserved</button>`}
        </td>
      </tr>
    `;
  }).join('');

  container.innerHTML = `
    <div style="display:grid; grid-template-columns:2fr 1fr; gap:1.25rem; align-items:start; text-align:left;">
      <!-- Stock Register Panel -->
      <div class="card">
        <div class="card-header" style="display:flex; justify-content:space-between; align-items:center;">
          <h3 class="card-title" style="margin:0; font-size:0.95rem; font-weight:800;">🗄 Blood Bank Stock Register</h3>
          <div style="display:flex; gap:6px;">
            <select class="form-select" style="font-size:10.5px; width:90px;" onchange="window.updateInvFilter('component', this.value)">
              <option value="All">All Comps</option>
              <option value="PRBC">PRBC</option>
              <option value="FFP">FFP</option>
              <option value="Platelets">Platelets</option>
            </select>
            <select class="form-select" style="font-size:10.5px; width:80px;" onchange="window.updateInvFilter('group', this.value)">
              <option value="All">All Groups</option>
              <option value="O+">O+</option>
              <option value="O-">O-</option>
              <option value="B+">B+</option>
              <option value="A+">A+</option>
            </select>
          </div>
        </div>
        <div class="card-body" style="padding:0; overflow-x:auto;">
          <table class="custom-table" style="font-size:0.8rem; width:100%;">
            <thead>
              <tr style="background:var(--bg-slate-light);">
                <th>Unit ID</th>
                <th>Component</th>
                <th>Group</th>
                <th>Volume</th>
                <th>Collected</th>
                <th>Expiry Date</th>
                <th>Status</th>
                <th>Location</th>
                <th style="text-align:right;">Action</th>
              </tr>
            </thead>
            <tbody>
              ${invRows}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Temperature Logs & Discard Registrations -->
      <div style="display:flex; flex-direction:column; gap:1.25rem;">
        <!-- Fridge Temp log -->
        <div class="card">
          <div class="card-header">
            <h3 class="card-title" style="margin:0; font-size:0.95rem; font-weight:800;">🌡 Compartment Temperature Logs</h3>
          </div>
          <div class="card-body" style="font-size:0.8rem; display:flex; flex-direction:column; gap:10px;">
            ${b.tempLogs.map(l => `
              <div style="border-bottom:1px solid var(--border-color); padding-bottom:8px; margin-bottom:8px;">
                <div style="display:flex; justify-content:space-between; font-weight:700;">
                  <span>${l.unit}</span>
                  <span style="color:var(--bb-green);">Target: 2-6°C</span>
                </div>
                <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:6px; margin-top:4px; font-size:11px;" class="admin-mono">
                  <span>08:00: ${l.readings['08:00']}</span>
                  <span>12:00: ${l.readings['12:00']}</span>
                  <span style="color:${l.readings['16:00'].includes('⚠️') ? 'var(--bb-red)' : ''}">16:00: ${l.readings['16:00']}</span>
                </div>
                ${l.readings['16:00'].includes('⚠️') && !l.breachAction ? `
                  <button class="btn btn-secondary btn-xs" style="margin-top:6px;" onclick="window.logTempBreach('${l.unit}')">Log Breach Action</button>
                ` : (l.breachAction ? `<div style="font-size:10px; color:var(--bb-green); margin-top:4px;">Action logged: ${l.breachAction}</div>` : '')}
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Discards log -->
        <div class="card">
          <div class="card-header">
            <h3 class="card-title" style="margin:0; font-size:0.95rem; font-weight:800;">🗑 Discard Register Logging</h3>
          </div>
          <div class="card-body" style="font-size:0.8rem; display:flex; flex-direction:column; gap:10px;">
            <div class="form-group">
              <label>Unit ID</label>
              <input type="text" id="disc-unit-id" class="form-control" placeholder="e.g. BB-PRBC-2026-0430" style="font-size:0.75rem;">
            </div>
            <div class="form-group">
              <label>Reason for Discard</label>
              <select id="disc-reason" class="form-select" style="font-size:0.75rem;">
                <option value="TTI reactive">TTI reactive (Incinerate)</option>
                <option value="Expired">Expired</option>
                <option value="Damaged bag">Damaged bag</option>
                <option value="Contaminated">Contaminated</option>
              </select>
            </div>
            <button class="btn btn-primary" onclick="window.saveDiscardEntry()">Submit Discard Entry</button>
          </div>
        </div>
      </div>
    </div>
  `;
}

window.updateInvFilter = function(key, val) {
  window.state.bloodbank.inventoryFilter[key] = val;
  renderBloodBankModule(document.getElementById('main-content'));
};

window.reserveUnit = function(unitId) {
  const i = window.state.bloodbank.unitInventory.find(ui => ui.unitId === unitId);
  if (i) {
    i.status = 'Reserved';
    showBBToast(`Unit ${unitId} successfully reserved.`);
    renderBloodBankModule(document.getElementById('main-content'));
  }
};

window.directIssueUnit = function(unitId) {
  const i = window.state.bloodbank.unitInventory.find(ui => ui.unitId === unitId);
  if (i) {
    i.status = 'Issued';
    showBBToast(`Unit ${unitId} successfully issued.`);
    renderBloodBankModule(document.getElementById('main-content'));
  }
};

window.logTempBreach = function(unitName) {
  const action = prompt("Enter mandatory Temperature Breach corrective action:");
  if (action) {
    const l = window.state.bloodbank.tempLogs.find(log => log.unit === unitName);
    if (l) {
      l.breachAction = action;
      showBBToast("Breach corrective action saved successfully.");
      renderBloodBankModule(document.getElementById('main-content'));
    }
  }
};

window.saveDiscardEntry = function() {
  const id = document.getElementById('disc-unit-id').value;
  const reason = document.getElementById('disc-reason').value;

  if (!id) {
    alert("Unit ID is mandatory.");
    return;
  }

  const u = window.state.bloodbank.unitInventory.find(ui => ui.unitId === id);
  if (u) {
    u.status = 'Discarded';
    showBBToast(`Unit ${id} discarded successfully.`);
    renderBloodBankModule(document.getElementById('main-content'));
  } else {
    alert("Unit ID not found in stock inventory register.");
  }
};

// ──────────────────────────────────────────────────────────────────────────
// TAB 5 - ISSUE & CROSSMATCH
// ──────────────────────────────────────────────────────────────────────────
function renderBBIssueTab(container) {
  const b = window.state.bloodbank;

  container.innerHTML = `
    <div style="display:grid; grid-template-columns:1.5fr 1fr; gap:1.25rem; align-items:start; text-align:left;">
      <!-- Section A: Crossmatch panel and entries -->
      <div style="display:flex; flex-direction:column; gap:1.25rem;">
        <div class="card">
          <div class="card-header">
            <h3 class="card-title" style="margin:0; font-size:0.95rem; font-weight:800;">🔬 Blood Major Crossmatch Lab Work</h3>
          </div>
          <div class="card-body" style="font-size:0.8rem; display:flex; flex-direction:column; gap:10px;">
            <div>
              <strong>Request: BR-2026-0041 · Rajesh Kumar &middot; ICU</strong>
            </div>
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px;">
              <div class="form-group">
                <label>Enforced FEFO Unit Selected</label>
                <input type="text" id="xm-unit-selected" value="BB-PRBC-2026-0441" class="form-control" style="font-size:0.75rem;" readonly>
              </div>
              <div class="form-group">
                <label>Compatibility Result</label>
                <select id="xm-result-select" class="form-select" style="font-size:0.75rem;">
                  <option value="Compatible">Compatible ✓</option>
                  <option value="Incompatible">Incompatible 🔴</option>
                </select>
              </div>
            </div>
            <div style="background:var(--bg-slate-light); padding:10px; border-radius:6px; display:grid; grid-template-columns:repeat(3, 1fr); gap:6px;">
              <label><input type="checkbox" checked> Immediate Spin</label>
              <label><input type="checkbox" checked> 37°C incubation</label>
              <label><input type="checkbox" checked> AHG verified</label>
            </div>
            <button class="btn btn-primary" onclick="window.saveCrossmatchResults()">Save Crossmatch (Post to Issue Queue)</button>
          </div>
        </div>

        <!-- Section B: Pre-transfusion Bedside check (Nurse persona) -->
        <div class="card">
          <div class="card-header">
            <h3 class="card-title" style="margin:0; font-size:0.95rem; font-weight:800;">🏥 Pre-Transfusion Bedside Verification (Ward Nurse)</h3>
          </div>
          <div class="card-body" style="font-size:0.8rem; display:flex; flex-direction:column; gap:8px;">
            <div style="background:var(--bb-blue-light); padding:10px; border-radius:6px; color:var(--bb-blue);">
              <strong>Active Transfusion: Unit BB-PRBC-2026-0441 (Rajesh Kumar)</strong>
            </div>
            <label style="display:flex; align-items:center; gap:6px; font-size:11px;"><input type="checkbox" id="bed-verify-id"> 1. Patient identity confirmed (wristband + verbal check) *</label>
            <label style="display:flex; align-items:center; gap:6px; font-size:11px;"><input type="checkbox" id="bed-verify-group"> 2. Blood group on bag matches patient group *</label>
            <label style="display:flex; align-items:center; gap:6px; font-size:11px;"><input type="checkbox" id="bed-verify-idmatch"> 3. Unit ID on bag matches issue slip *</label>
            <label style="display:flex; align-items:center; gap:6px; font-size:11px;"><input type="checkbox" id="bed-verify-int"> 4. Bag integrity checked (no leaks/clots) *</label>
            <label style="display:flex; align-items:center; gap:6px; font-size:11px;"><input type="checkbox" id="bed-verify-consent"> 5. Transfusion consent confirmed *</label>
            
            <button class="btn btn-primary" onclick="window.startTransfusionTimer('BB-PRBC-2026-0441')">Start Transfusion (14:48)</button>
          </div>
        </div>
      </div>

      <!-- Section C: Emergency Release -->
      <div class="card" style="border-left:5px solid var(--bb-red);">
        <div class="card-header">
          <h3 class="card-title" style="margin:0; font-size:0.95rem; font-weight:800; color:var(--bb-red);">⚠️ Emergency Release (Uncrossmatched O-Neg)</h3>
        </div>
        <div class="card-body" style="font-size:0.8rem; display:flex; flex-direction:column; gap:10px;">
          <div>
            <label style="font-weight:700;">Patient Name</label>
            <input type="text" value="Priya Menon" class="form-control" style="font-size:0.75rem;" readonly>
          </div>
          <div>
            <label style="font-weight:700;">Ward / Unit</label>
            <input type="text" value="OT Room 2" class="form-control" style="font-size:0.75rem;" readonly>
          </div>
          <div style="background:#fee2e2; border:1px solid #fecaca; color:#b91c1c; padding:8px; border-radius:6px; font-weight:bold; font-size:11px;">
            ⚠️ Label: "UNCROSSMATCHED — EMERGENCY USE ONLY" will be auto-printed.
          </div>
          <label style="display:flex; align-items:center; gap:6px;"><input type="checkbox" id="emg-doc-signed"> Doctor emergency request form signed *</label>
          <div>
            <label style="font-weight:700;">Clinical Justification *</label>
            <input type="text" id="emg-justification" placeholder="e.g. Life-threatening post-partum haemorrhage" class="form-control" style="font-size:0.75rem;">
          </div>
          <button class="btn btn-primary" style="background:var(--bb-red); border:none;" onclick="window.confirmEmergencyRelease()">Confirm Emergency Release</button>
        </div>
      </div>
    </div>
  `;
}

window.saveCrossmatchResults = function() {
  const res = document.getElementById('xm-result-select').value;
  if (res === 'Incompatible') {
    alert("🔴 INCOMPATIBLE CROSSMATCH!\n\nUnit is blocked. Clinician notification is mandatory. Investigation logged.");
    return;
  }
  showBBToast("✓ Major crossmatch compatible. Unit BB-PRBC-2026-0441 posted as ready for issue.");
};

window.confirmEmergencyRelease = function() {
  const signed = document.getElementById('emg-doc-signed').checked;
  const just = document.getElementById('emg-justification').value;

  if (!signed || !just) {
    alert("Doctor emergency request verification and justification are mandatory.");
    return;
  }

  showBBToast("✓ Emergency Release successful. Uncrossmatched O-negative bag BB-PRBC-2026-0438 dispatched.");
};

window.startTransfusionTimer = function(unitId) {
  const c1 = document.getElementById('bed-verify-id').checked;
  const c2 = document.getElementById('bed-verify-group').checked;
  const c3 = document.getElementById('bed-verify-idmatch').checked;
  const c4 = document.getElementById('bed-verify-int').checked;
  const c5 = document.getElementById('bed-verify-consent').checked;

  if (!c1 || !c2 || !c3 || !c4 || !c5) {
    alert("All bedside checks must be ticked and verified before starting transfusion.");
    return;
  }

  // Update unit status in state
  const i = window.state.bloodbank.unitInventory.find(ui => ui.unitId === unitId);
  if (i) {
    i.activeTransfusion = { start: new Date(), timerId: setInterval(() => checkTransfusionTimeout(unitId), 1000) };
  }

  showBBToast(`✓ Transfusion started at ${new Date().toLocaleTimeString()}. 4-hour max duration warning timer active.`);
};

function checkTransfusionTimeout(unitId) {
  const i = window.state.bloodbank.unitInventory.find(ui => ui.unitId === unitId);
  if (i && i.activeTransfusion) {
    const elapsedHrs = (new Date() - i.activeTransfusion.start) / 3600000;
    if (elapsedHrs > 4.0) {
      clearInterval(i.activeTransfusion.timerId);
      alert(`🚨 TRANSFUSION DURATION EXCEEDED!\n\nUnit ${unitId} has been infusing for over 4 hours. Transfusion aborted. Remaining blood must be discarded.`);
    }
  }
}

// ──────────────────────────────────────────────────────────────────────────
// TAB 6 - REACTIONS & HAEMOVIGILANCE
// ──────────────────────────────────────────────────────────────────────────
function renderBBReactionsTab(container) {
  const b = window.state.bloodbank;

  const reactionRows = b.reactions.map(r => {
    return `
      <tr style="border-bottom:1px solid var(--border-color);">
        <td>${r.date}</td>
        <td>${r.name}</td>
        <td class="admin-mono">${r.unitId}</td>
        <td><strong>${r.event}</strong></td>
        <td><span class="badge badge-purple">${r.severity}</span></td>
        <td><span class="badge badge-success">${r.reported}</span></td>
        <td>${r.action}</td>
      </tr>
    `;
  }).join('');

  container.innerHTML = `
    <div style="display:grid; grid-template-columns:1.5fr 1fr; gap:1.25rem; align-items:start; text-align:left;">
      <!-- Reactions panel -->
      <div style="display:flex; flex-direction:column; gap:1.25rem;">
        <div class="card">
          <div class="card-header" style="display:flex; justify-content:space-between; align-items:center;">
            <h3 class="card-title" style="margin:0; font-size:0.95rem; font-weight:800;">⚠️ Adverse Reactions &amp; Near-Miss Register</h3>
            <button class="btn btn-secondary btn-sm" onclick="showBBToast('Haemovigilance report generated.')">Monthly MS Report</button>
          </div>
          <div class="card-body" style="padding:0; overflow-x:auto;">
            <table class="custom-table" style="font-size:0.8rem; width:100%;">
              <thead>
                <tr style="background:var(--bg-slate-light);">
                  <th>Date</th>
                  <th>Patient/Donor</th>
                  <th>Unit ID</th>
                  <th>Reaction Type</th>
                  <th>Severity</th>
                  <th>Escalation</th>
                  <th>Action Logs</th>
                </tr>
              </thead>
              <tbody>
                ${reactionRows}
              </tbody>
            </table>
          </div>
        </div>

        <!-- Log Reaction form -->
        <div class="card">
          <div class="card-header">
            <h3 class="card-title" style="margin:0; font-size:0.95rem; font-weight:800;">✍ Log Adverse Reaction Event</h3>
          </div>
          <div class="card-body" style="font-size:0.8rem; display:flex; flex-direction:column; gap:10px;">
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px;">
              <div class="form-group">
                <label>Patient UHID</label>
                <input type="text" id="react-uhid" value="SH-2026-04821" class="form-control" style="font-size:0.75rem;">
              </div>
              <div class="form-group">
                <label>Unit ID</label>
                <input type="text" id="react-unit-id" value="BB-PRBC-2026-0441" class="form-control" style="font-size:0.75rem;">
              </div>
            </div>
            <div class="form-group">
              <label>Reaction Classification</label>
              <select id="react-type" class="form-select" style="font-size:0.75rem;">
                <option value="FNHTR">FNHTR (Fever ≥1°C rise, no haemolysis)</option>
                <option value="Acute haemolytic">Acute haemolytic (rigors + hypotension)</option>
                <option value="Allergic mild">Allergic mild (urticaria)</option>
                <option value="TRALI">TRALI (lung injury within 6 hrs)</option>
              </select>
            </div>
            <div style="background:var(--bg-slate-light); padding:10px; border-radius:6px;">
              <h4 style="margin:0 0 6px 0; font-size:0.75rem; color:var(--bb-red);">Required Immediate Transfusion Protocol Actions</h4>
              <label style="display:flex; align-items:center; gap:6px; font-size:11px;"><input type="checkbox" checked> Transfusion stopped immediately</label>
              <label style="display:flex; align-items:center; gap:6px; font-size:11px;"><input type="checkbox" checked> IV patency maintained with normal saline</label>
              <label style="display:flex; align-items:center; gap:6px; font-size:11px;"><input type="checkbox" checked> Blood bag and tubing returned to blood bank</label>
            </div>
            <button class="btn btn-primary" onclick="window.saveReactionLog()">Save Reaction &amp; Check Escalation</button>
          </div>
        </div>
      </div>

      <!-- Donor counselling for reactive tests -->
      <div class="card">
        <div class="card-header">
          <h3 class="card-title" style="margin:0; font-size:0.95rem; font-weight:800; color:var(--bb-red);">🗂 Donor Counselling (TTI Reactive Donors)</h3>
        </div>
        <div class="card-body" style="font-size:0.8rem; display:flex; flex-direction:column; gap:10px;">
          <div>
            <strong>Donor: DON-2026-0035 &middot; Amit Patel</strong><br>
            <span style="color:var(--bb-red);">Reactive Test: HBsAg (ELISA)</span>
          </div>
          <div style="display:flex; flex-direction:column; gap:6px;">
            <label style="display:flex; align-items:center; gap:6px; font-size:11px;"><input type="checkbox" id="cns-done"> Counselling completed and documented *</label>
            <label style="display:flex; align-items:center; gap:6px; font-size:11px;"><input type="checkbox" id="cns-refer"> Confirmatory referral given (Hepatologist) *</label>
            <label style="display:flex; align-items:center; gap:6px; font-size:11px;"><input type="checkbox" id="cns-consent"> Family disclosure consent logged *</label>
          </div>
          <button class="btn btn-primary" onclick="window.confirmCounselling()">Confirm Counselling &amp; Unlock Discard</button>
        </div>
      </div>
    </div>
  `;
}

window.saveReactionLog = function() {
  const type = document.getElementById('react-type').value;
  if (type === 'Acute haemolytic' || type === 'TRALI') {
    alert("🚨 SERIOUS ADVERSE REACTION REPORT REQUIRED!\n\nThis event is classified as serious. A statutory report must be filed to the state haemovigilance board within 72 hours.");
  }
  showBBToast("Adverse reaction successfully registered to Haemovigilance program.");
};

window.confirmCounselling = function() {
  const c1 = document.getElementById('cns-done').checked;
  const c2 = document.getElementById('cns-refer').checked;
  const c3 = document.getElementById('cns-consent').checked;

  if (!c1 || !c2 || !c3) {
    alert("All counselling checklists must be verified and checked.");
    return;
  }

  // Update donor counselling status in state
  const u = window.state.bloodbank.unitInventory.find(ui => ui.unitId === 'BB-PRBC-2026-0430');
  if (u) {
    u.counsellingDone = true;
  }
  showBBToast("✓ Counselling recorded. Discard disposal process unlocked.");
};

// ──────────────────────────────────────────────────────────────────────────
// TAB 7 - STATUTORY REGISTERS
// ──────────────────────────────────────────────────────────────────────────
function renderBBStatutoryTab(container) {
  container.innerHTML = `
    <div style="text-align:left;">
      <div class="card">
        <div class="card-header" style="display:flex; justify-content:space-between; align-items:center;">
          <h3 class="card-title" style="margin:0; font-size:0.95rem; font-weight:800;">📜 Drugs &amp; Cosmetics Act Schedule F Part XII registers</h3>
          <button class="btn btn-primary btn-sm" onclick="showBBToast('Generating PDF of statutory registers...')">Print All Registers</button>
        </div>
        <div class="card-body" style="display:flex; flex-direction:column; gap:12px; font-size:0.82rem;">
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
            <div style="background:var(--bg-slate-light); padding:10px; border-radius:6px;">
              <strong>Donor Register (Form 24-C)</strong><br>
              <span style="font-size:11px; color:var(--text-muted);">Lists all voluntary and replacement collections.</span>
              <button class="btn btn-secondary btn-xs w-full" style="margin-top:6px;" onclick="showBBToast('Printing Donor Register...')">Print Register</button>
            </div>
            <div style="background:var(--bg-slate-light); padding:10px; border-radius:6px;">
              <strong>TTI Testing &amp; ELISA Register</strong><br>
              <span style="font-size:11px; color:var(--text-muted);">Tracks kit lots, tested and verified dates.</span>
              <button class="btn btn-secondary btn-xs w-full" style="margin-top:6px;" onclick="showBBToast('Printing TTI Register...')">Print Register</button>
            </div>
          </div>
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
            <div style="background:var(--bg-slate-light); padding:10px; border-radius:6px;">
              <strong>Crossmatch &amp; Issue Register</strong><br>
              <span style="font-size:11px; color:var(--text-muted);">Recipient details, compatibility, issued by/received by signatures.</span>
              <button class="btn btn-secondary btn-xs w-full" style="margin-top:6px;" onclick="showBBToast('Printing Issue Register...')">Print Register</button>
            </div>
            <div style="background:var(--bg-slate-light); padding:10px; border-radius:6px;">
              <strong>Incineration &amp; Discard Register</strong><br>
              <span style="font-size:11px; color:var(--text-muted);">Records bio-waste compliance disposal times.</span>
              <button class="btn btn-secondary btn-xs w-full" style="margin-top:6px;" onclick="showBBToast('Printing Discard Register...')">Print Register</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

// ──────────────────────────────────────────────────────────────────────────
// TAB 8 - BLOOD CAMPS
// ──────────────────────────────────────────────────────────────────────────
function renderBBCampsTab(container) {
  const b = window.state.bloodbank;

  container.innerHTML = `
    <div style="display:grid; grid-template-columns:1.2fr 1fr; gap:1.25rem; align-items:start; text-align:left;">
      <!-- Active camps panel -->
      <div class="card">
        <div class="card-header">
          <h3 class="card-title" style="margin:0; font-size:0.95rem; font-weight:800;">🏕 Active &amp; Scheduled Blood Camps</h3>
        </div>
        <div class="card-body" style="padding:0; overflow-x:auto;">
          <table class="custom-table" style="font-size:0.8rem; width:100%;">
            <thead>
              <tr style="background:var(--bg-slate-light);">
                <th>Camp ID</th>
                <th>Name</th>
                <th>Location</th>
                <th>Date</th>
                <th>Collected</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${b.camps.map(c => `
                <tr>
                  <td class="admin-mono"><strong>${c.id}</strong></td>
                  <td>${c.name}</td>
                  <td>${c.location}</td>
                  <td>${c.date}</td>
                  <td>${c.collected} bags</td>
                  <td><span class="badge badge-success">${c.status}</span></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Camp registration form -->
      <div class="card">
        <div class="card-header">
          <h3 class="card-title" style="margin:0; font-size:0.95rem; font-weight:800;">📋 Register Voluntary Blood Camp (Form 10)</h3>
        </div>
        <div class="card-body" style="font-size:0.8rem; display:flex; flex-direction:column; gap:10px;">
          <div>
            <label style="font-weight:700;">Camp Name *</label>
            <input type="text" id="cmp-name" class="form-control" placeholder="e.g. Koramangala Rotary Camp" style="font-size:0.75rem;">
          </div>
          <div>
            <label style="font-weight:700;">Organiser Contact *</label>
            <input type="text" id="cmp-org" class="form-control" placeholder="Organiser Name &amp; Phone" style="font-size:0.75rem;">
          </div>
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px;">
            <div>
              <label style="font-weight:700;">Location *</label>
              <input type="text" id="cmp-loc" class="form-control" placeholder="Location" style="font-size:0.75rem;">
            </div>
            <div>
              <label style="font-weight:700;">Date *</label>
              <input type="date" id="cmp-date" class="form-control" value="2026-07-06" style="font-size:0.75rem;">
            </div>
          </div>
          <div style="background:var(--bg-slate-light); padding:10px; border-radius:6px;">
            <h4 style="margin:0 0 6px 0; font-size:0.75rem; color:var(--bb-blue);">Form 10 Licensing &amp; Supply Checklist</h4>
            <label style="display:flex; align-items:center; gap:6px; font-size:11px;"><input type="checkbox" checked> Form 10 Filed with DCGI Licensing Authority</label>
            <label style="display:flex; align-items:center; gap:6px; font-size:11px;"><input type="checkbox" checked> Doctor / Medical Officer assigned</label>
            <label style="display:flex; align-items:center; gap:6px; font-size:11px;"><input type="checkbox" checked> Cold storage transport boxes loaded</label>
          </div>
          <button class="btn btn-primary" onclick="window.saveCampRegistration()">Register &amp; Print DCGI Roster</button>
        </div>
      </div>
    </div>
  `;
}

window.saveCampRegistration = function() {
  const name = document.getElementById('cmp-name').value;
  if (!name) {
    alert("Camp name is mandatory.");
    return;
  }
  
  const newCamp = {
    id: 'CAMP-2026-00' + (window.state.bloodbank.camps.length + 1),
    name: name,
    location: document.getElementById('cmp-loc').value || 'Bengaluru Campus',
    date: document.getElementById('cmp-date').value || '2026-07-06',
    status: 'Scheduled',
    collected: 0
  };
  window.state.bloodbank.camps.push(newCamp);
  showBBToast(`✓ Camp ${name} registered. DCGI Form 10 approval filed.`);
  renderBloodBankModule(document.getElementById('main-content'));
};

// Modals
window.openEmergencyReleaseModal = function(reqId) {
  if (confirm(`🚨 EMERGENCY RELEASE WARNING!\n\nAre you sure you want to release uncrossmatched O-Negative blood immediately?`)) {
    showBBToast("Emergency Release confirmation: O-Negative bag dispatched.");
  }
};

window.openCrossmatchModal = function(reqId) {
  window.switchBBTab('issue-crossmatch');
};
