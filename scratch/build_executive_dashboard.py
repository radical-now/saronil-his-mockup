import re

# File Paths
index_path = "/Users/home/Desktop/Saronil IHS/Updated HIS /index.html"
dashboard_path = "/Users/home/Desktop/Saronil IHS/Updated HIS /assets/js/views/dashboardView.js"

# ---------------------------------------------------------
# 1. Patch index.html
# ---------------------------------------------------------
with open(index_path, "r", encoding="utf-8") as f:
    index_content = f.read()

# Replace global-persona-selector options
selector_regex = r'<select id="global-persona-selector"[\s\S]*?</select>'
new_selector = """<select id="global-persona-selector" class="facility-selector" onchange="window.switchGlobalPersona(this.value)">
              <optgroup label="─── Executive ───">
                <option value="Chairman">👑 Chairman</option>
                <option value="CEO">👔 CEO</option>
                <option value="COO">📈 COO</option>
                <option value="Medical Director">🩺 Medical Director</option>
                <option value="Medical Superintendent">🏥 Medical Superintendent</option>
                <option value="CFO">💰 CFO</option>
                <option value="General Manager">💼 General Manager</option>
              </optgroup>
              <optgroup label="─── Operations ───">
                <option value="Administrator">⚙️ Administrator</option>
                <option value="Doctor">🩺 Doctor</option>
                <option value="Nurse">👩‍⚕️ Nurse</option>
                <option value="Billing">💳 Billing Admin</option>
                <option value="Front Desk">🛎️ Front Desk</option>
                <option value="Lab">🧪 Lab Executive</option>
                <option value="Pharmacist">💊 Pharmacist</option>
                <option value="ATD Officer">🔄 ATD Coordinator</option>
                <option value="OPD Officer">🏥 OPD Officer</option>
                <option value="Information">ℹ️ Information Desk</option>
              </optgroup>
            </select>"""

index_content = re.sub(selector_regex, new_selector, index_content)

# Update roleToPersona and personaToRole dictionaries in index.html
role_to_persona_regex = r'const roleToPersona = \{[\s\S]*?\};'
new_role_to_persona = """const roleToPersona = {
        'Chairman': 'chairman',
        'CEO': 'ceo',
        'COO': 'coo',
        'Medical Director': 'medDir',
        'Medical Superintendent': 'medSuper',
        'CFO': 'cfo',
        'General Manager': 'gm',
        'Administrator': 'admin',
        'Doctor': 'doctor',
        'Nurse': 'nurse',
        'Billing': 'billing',
        'Front Desk': 'admission',
        'Lab': 'lab',
        'Pharmacist': 'pharmacy',
        'ATD Officer': 'atdOfficer',
        'OPD Officer': 'opdOfficer',
        'Information': 'information'
      };"""

index_content = re.sub(role_to_persona_regex, new_role_to_persona, index_content)

persona_to_role_regex = r'const personaToRole = \{[\s\S]*?\};'
new_persona_to_role = """const personaToRole = {
        'chairman': 'Chairman',
        'ceo': 'CEO',
        'coo': 'COO',
        'medDir': 'Medical Director',
        'medSuper': 'Medical Superintendent',
        'cfo': 'CFO',
        'gm': 'General Manager',
        'admin': 'Administrator',
        'doctor': 'Doctor',
        'nurse': 'Nurse',
        'billing': 'Billing',
        'admission': 'Front Desk',
        'lab': 'Lab',
        'pharmacy': 'Pharmacist',
        'atdOfficer': 'ATD Officer',
        'opdOfficer': 'OPD Officer',
        'information': 'Information'
      };"""

index_content = re.sub(persona_to_role_regex, new_persona_to_role, index_content)

with open(index_path, "w", encoding="utf-8") as f:
    f.write(index_content)
print("SUCCESS: index.html patched successfully!")

# ---------------------------------------------------------
# 2. Patch dashboardView.js
# ---------------------------------------------------------
with open(dashboard_path, "r", encoding="utf-8") as f:
    dashboard_content = f.read()

# Update roleToPersona in dashboardView.js
js_role_to_persona_regex = r'const roleToPersona = \{[\s\S]*?\};'
js_new_role_to_persona = """const roleToPersona = {
    'Chairman': 'chairman',
    'CEO': 'ceo',
    'COO': 'coo',
    'Medical Director': 'medDir',
    'Medical Superintendent': 'medSuper',
    'CFO': 'cfo',
    'General Manager': 'gm',
    'Administrator': 'admin',
    'Doctor': 'doctor',
    'Nurse': 'nurse',
    'Billing': 'billing',
    'Front Desk': 'admission',
    'Lab': 'lab',
    'Pharmacist': 'pharmacy',
    'ATD Officer': 'atdOfficer',
    'OPD Officer': 'opdOfficer',
    'Information': 'information'
  };"""

dashboard_content = re.sub(js_role_to_persona_regex, js_new_role_to_persona, dashboard_content, count=1)

# Update personaToRole in dashboardView.js
js_persona_to_role_regex = r'const personaToRole = \{[\s\S]*?\};'
js_new_persona_to_role = """const personaToRole = {
    'chairman': 'Chairman',
    'ceo': 'CEO',
    'coo': 'COO',
    'medDir': 'Medical Director',
    'medSuper': 'Medical Superintendent',
    'cfo': 'CFO',
    'gm': 'General Manager',
    'admin': 'Administrator',
    'doctor': 'Doctor',
    'nurse': 'Nurse',
    'billing': 'Billing',
    'admission': 'Front Desk',
    'lab': 'Lab',
    'pharmacy': 'Pharmacist',
    'atdOfficer': 'ATD Officer',
    'opdOfficer': 'OPD Officer',
    'information': 'Information'
  };"""

dashboard_content = re.sub(js_persona_to_role_regex, js_new_persona_to_role, dashboard_content, count=1)

# Update renderDashboardLayout in dashboardView.js
layout_regex = r'function renderDashboardLayout\(container, persona\) \{[\s\S]*?if \(persona === \'admin\'\) \{'
new_layout = """function renderDashboardLayout(container, persona) {
  container.innerHTML = `
    <!-- Active Persona Dashboard Viewport -->
    <div id="dashboard-persona-viewport"></div>
  `;

  const viewport = document.getElementById('dashboard-persona-viewport');
  
  if (['chairman', 'ceo', 'coo', 'medDir', 'medSuper', 'cfo', 'gm'].includes(persona)) {
    renderExecutiveDashboard(viewport, personaToRole[persona]);
  } else if (persona === 'admin') {"""

dashboard_content = re.sub(layout_regex, new_layout, dashboard_content)

# Append renderExecutiveDashboard to dashboardView.js
exec_dashboard_js = """
// --------------------------------------------------------------------------
// EXECUTIVE MANAGEMENT DASHBOARD (EXECUTIVE ROLES)
// --------------------------------------------------------------------------
function renderExecutiveDashboard(container, activeRole) {
  // Setup clock listener
  if (window.execClockInterval) clearInterval(window.execClockInterval);
  window.execClockInterval = setInterval(() => {
    const timeEl = document.getElementById('exec-live-time');
    if (timeEl) {
      const now = new Date();
      let hours = now.getHours();
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12;
      timeEl.textContent = `${String(hours).padStart(2, '0')}:${minutes} ${ampm}`;
    }
  }, 10000);

  // Sign Census handler
  window.signDailyCensusExec = function() {
    const btn = document.getElementById('sign-census-btn');
    if (btn) {
      btn.innerHTML = '✓ Census Certified';
      btn.style.background = '#dcfce7';
      btn.style.color = '#15803d';
      btn.style.borderColor = '#bbf7d0';
      btn.disabled = true;
    }
    const complianceStatusEl = document.getElementById('compliance-census-status');
    if (complianceStatusEl) {
      complianceStatusEl.innerHTML = 'Certified ✓';
      complianceStatusEl.className = 'exec-badge-green';
    }
    alert("Daily Census Certified & E-Signed successfully!");
  };

  // Approvals actions
  window.handleApproval = function(id, action, name, amount) {
    if (action === 'Approve') {
      alert(`APPROVED: ${name} ${amount ? '(Amount: ' + amount + ')' : ''}`);
      removeApprovalRow(id);
    } else if (action === 'Reject') {
      const reason = prompt("Enter reason for rejection:", "Criteria not met");
      if (reason !== null) {
        alert(`REJECTED: ${name}. Reason: ${reason}`);
        removeApprovalRow(id);
      }
    } else if (action === 'Delegate') {
      const delegateTo = prompt("Enter executive name or role to delegate to (e.g. COO, CFO):", "COO");
      if (delegateTo) {
        alert(`DELEGATED: ${name} has been assigned to ${delegateTo}.`);
        removeApprovalRow(id);
      }
    }
  };

  function removeApprovalRow(id) {
    const row = document.getElementById(`approval-row-${id}`);
    if (row) {
      row.remove();
    }
    // Check if table empty
    const tbody = document.getElementById('approvals-table-body');
    if (tbody && tbody.children.length === 0) {
      const parent = document.getElementById('approvals-section-container');
      if (parent) {
        parent.innerHTML = '<div style="font-size: 0.85rem; color: #64748b; font-style: italic; padding: 12px 0;">No approvals pending</div>';
      }
    }
  }

  // Resolve Attention Item
  window.resolveAttentionItem = function(id, desc) {
    if (id === 'all') {
      const list = document.getElementById('attention-items-list');
      if (list) list.innerHTML = '';
    } else {
      const item = document.getElementById(`attention-item-${id}`);
      if (item) {
        item.remove();
      }
    }
    // Check if empty
    const list = document.getElementById('attention-items-list');
    if (list && list.children.length === 0) {
      const panel = document.getElementById('attention-section-panel');
      if (panel) {
        panel.style.borderLeft = '4px solid #10b981';
        panel.innerHTML = `
          <div style="display: flex; align-items: center; gap: 8px; color: #15803d; font-weight: 600; font-size: 0.85rem;">
            <span>✓</span> All clear — no items requiring attention
          </div>
        `;
      }
    }
  };

  // Visibility Check helpers based on activeRole
  const hasFinance = ['Chairman', 'CEO', 'COO', 'CFO', 'General Manager'].includes(activeRole);
  const hasOps = ['Chairman', 'CEO', 'COO', 'Medical Director', 'Medical Superintendent', 'General Manager'].includes(activeRole);
  const hasApprovals = activeRole !== 'Medical Superintendent';
  const isMedDir = activeRole === 'Medical Director';
  
  // Date rendering
  const today = new Date();
  const options = { day: '2-digit', month: 'short', year: 'numeric' };
  const formattedDate = today.toLocaleDateString('en-GB', options).replace(/ /g, '-');
  const dayName = today.toLocaleDateString('en-US', { weekday: 'long' });

  container.innerHTML = `
    <style>
      .exec-dash-wrapper {
        min-width: 1440px;
        background-color: #f8fafc;
        font-family: 'Inter', sans-serif;
        color: #0f172a;
        display: flex;
        flex-direction: column;
        gap: 20px;
        padding-bottom: 60px;
      }
      .exec-sticky-header {
        position: sticky;
        top: 0;
        z-index: 100;
        background: #ffffff;
        border-bottom: 1px solid #cbd5e1;
        padding: 10px 24px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        box-shadow: 0 1px 3px rgba(0,0,0,0.05);
      }
      .exec-grid-10 {
        display: grid;
        grid-template-columns: repeat(10, 1fr);
        gap: 10px;
      }
      .exec-grid-5 {
        display: grid;
        grid-template-columns: repeat(5, 1fr);
        gap: 12px;
      }
      .exec-grid-2 {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 20px;
      }
      .exec-grid-3 {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 20px;
      }
      .exec-grid-4 {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 20px;
      }
      .exec-card {
        background: #ffffff;
        border: 1px solid #cbd5e1;
        border-radius: 8px;
        padding: 14px;
        box-shadow: 0 1px 2px rgba(0,0,0,0.05);
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        min-height: 105px;
        cursor: pointer;
        position: relative;
      }
      .exec-card:hover {
        background: #f8fafc;
        border-color: #94a3b8;
      }
      .exec-card-val {
        font-family: 'JetBrains Mono', monospace;
        font-size: 1.45rem;
        font-weight: 800;
        color: #0f172a;
        margin: 2px 0;
        line-height: 1.2;
      }
      .exec-card-name {
        font-size: 0.65rem;
        font-weight: 700;
        color: #64748b;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
      .exec-card-sub {
        font-size: 0.68rem;
        color: #475569;
      }
      .exec-status-dot-indicator {
        position: absolute;
        top: 14px;
        right: 14px;
        width: 8px;
        height: 8px;
        border-radius: 50%;
      }
      .exec-dot-green { background-color: #10b981; }
      .exec-dot-amber { background-color: #f59e0b; }
      .exec-dot-red { background-color: #ef4444; }

      .exec-section-title {
        font-size: 0.9rem;
        font-weight: 800;
        color: #0f172a;
        text-transform: uppercase;
        letter-spacing: 0.75px;
        margin: 0 0 12px 0;
        display: flex;
        align-items: center;
        gap: 6px;
      }
      .exec-table {
        width: 100%;
        border-collapse: collapse;
        font-size: 0.8rem;
      }
      .exec-table th {
        background: #f8fafc;
        border-bottom: 1px solid #cbd5e1;
        color: #475569;
        font-weight: 700;
        font-size: 0.68rem;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        padding: 8px 10px;
        text-align: left;
        font-family: 'Inter', sans-serif;
      }
      .exec-table td {
        padding: 8px 10px;
        border-bottom: 1px solid #e2e8f0;
        vertical-align: middle;
      }
      .exec-badge-red {
        background: #fee2e2;
        color: #991b1b;
        border: 1px solid #fca5a5;
        font-weight: 700;
        padding: 1px 5px;
        border-radius: 4px;
        font-size: 0.68rem;
        text-transform: uppercase;
      }
      .exec-badge-amber {
        background: #ffedd5;
        color: #9a3412;
        border: 1px solid #fed7aa;
        font-weight: 700;
        padding: 1px 5px;
        border-radius: 4px;
        font-size: 0.68rem;
        text-transform: uppercase;
      }
      .exec-badge-green {
        background: #dcfce7;
        color: #15803d;
        border: 1px solid #bbf7d0;
        font-weight: 700;
        padding: 1px 5px;
        border-radius: 4px;
        font-size: 0.68rem;
        text-transform: uppercase;
      }
      .exec-badge-blue {
        background: #eff6ff;
        color: #1e40af;
        border: 1px solid #bfdbfe;
        font-weight: 600;
        padding: 1px 5px;
        border-radius: 4px;
        font-size: 0.68rem;
        text-transform: uppercase;
      }
      .exec-badge-gray {
        background: #f1f5f9;
        color: #475569;
        border: 1px solid #cbd5e1;
        font-weight: 600;
        padding: 1px 5px;
        border-radius: 4px;
        font-size: 0.68rem;
        text-transform: uppercase;
      }
      .quick-nav-bar {
        position: fixed;
        bottom: 0;
        left: 240px; /* aligns outside sidebar */
        right: 0;
        background: #0f172a;
        color: #ffffff;
        display: flex;
        justify-content: space-around;
        padding: 8px 16px;
        box-shadow: 0 -2px 10px rgba(0,0,0,0.15);
        z-index: 999;
      }
      .quick-nav-btn {
        background: transparent;
        border: none;
        color: #cbd5e1;
        font-size: 0.72rem;
        font-weight: 700;
        cursor: pointer;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 2px;
      }
      .quick-nav-btn:hover {
        color: #ffffff;
      }
      .chart-toggle-btn {
        border: 1px solid #cbd5e1;
        background: #ffffff;
        color: #475569;
        font-size: 0.75rem;
        padding: 4px 10px;
        border-radius: 4px;
        font-weight: 600;
        cursor: pointer;
      }
      .chart-toggle-btn.active {
        background: #0f172a;
        color: #ffffff;
        border-color: #0f172a;
      }
    </style>

    <div class="exec-dash-wrapper">
      
      <!-- Sticky Executive Header -->
      <header class="exec-sticky-header">
        <!-- Left Section -->
        <div style="display: flex; align-items: center; gap: 1rem;">
          <div style="font-size: 1.1rem; font-weight: 800; color: #0f172a; display: flex; align-items: center; gap: 6px;">
            <span>🧬</span>
            <span>Saronil Health <span style="font-weight: 500; color: #64748b;">HIS</span></span>
          </div>
          <span style="color: #cbd5e1;">|</span>
          <select class="form-select" style="height: 30px; font-size: 0.76rem; font-weight:700; border-radius: 4px; border: 1px solid #cbd5e1; outline: none; cursor: pointer; padding: 0 8px; background: #fff;">
            <option>Bengaluru Campus (HQ)</option>
            <option>Delhi Campus</option>
            <option>Chennai Campus</option>
          </select>
        </div>

        <!-- Centre Section -->
        <div style="display: flex; align-items: center; gap: 1.5rem; font-size: 0.8rem; color: #475569; font-weight: 600;">
          <div style="display: flex; align-items: center; gap: 4px;">
            <span>📅</span>
            <span>${formattedDate} (${dayName})</span>
          </div>
          <div style="display: flex; align-items: center; gap: 4px;">
            <span>⏰</span>
            <span id="exec-live-time" style="font-family: 'JetBrains Mono', monospace; font-weight: 800; color: #0f172a;">01:15 AM</span>
          </div>
          <div style="font-size: 0.72rem; color: #64748b; font-style: italic; font-weight:normal;">
            <span>🔄</span> Updated 5 min ago
          </div>
        </div>

        <!-- Right Section -->
        <div style="display: flex; align-items: center; gap: 1rem;">
          <div style="position: relative; display: flex; align-items: center;">
            <span style="position: absolute; left: 8px; font-size: 0.75rem; color: #94a3b8; pointer-events: none;">🔍</span>
            <input type="text" placeholder="Global search..." style="padding-left: 1.8rem; font-size: 0.75rem; height: 30px; border-radius: 4px; border: 1px solid #cbd5e1; width: 160px; outline: none;">
          </div>
          
          <div style="display: flex; gap: 6px;">
            <div title="Notifications" style="position: relative; width: 30px; height: 30px; border-radius: 4px; border: 1px solid #cbd5e1; display: flex; align-items: center; justify-content: center; cursor: pointer; font-size: 0.85rem; background: #fff;">
              <span>🔔</span>
              <span style="position: absolute; top: -4px; right: -4px; background: #3b82f6; color: white; font-size: 0.62rem; font-weight: 700; width: 14px; height: 14px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-family: 'JetBrains Mono', monospace;">4</span>
            </div>
            <div title="Critical Alerts" style="position: relative; width: 30px; height: 30px; border-radius: 4px; border: 1px solid #cbd5e1; display: flex; align-items: center; justify-content: center; cursor: pointer; font-size: 0.85rem; background: #fff;">
              <span>🚨</span>
              <span id="critical-alert-badge" style="position: absolute; top: -4px; right: -4px; background: #ef4444; color: white; font-size: 0.62rem; font-weight: 700; width: 14px; height: 14px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-family: 'JetBrains Mono', monospace;">3</span>
            </div>
          </div>
          
          <div style="text-align: right; line-height: 1.1;">
            <div style="font-weight: 700; font-size: 0.8rem; color: #0f172a;">Dr. Amit Verma</div>
            <div style="font-size: 0.7rem; color: #64748b; font-weight: 600;">${activeRole}</div>
          </div>

          ${activeRole === 'Medical Superintendent' ? `
            <button id="sign-census-btn" onclick="window.signDailyCensusExec()" style="height: 30px; font-size: 0.74rem; font-weight: 700; border-radius: 4px; cursor: pointer; background: #ffedd5; color: #c2410c; border: 1px solid #fed7aa; padding: 0 10px; transition: all 0.2s;">
              ✍️ Sign Daily Census
            </button>
          ` : ''}
        </div>
      </header>

      <!-- Main Contents -->
      <div style="padding: 10px 24px; display: flex; flex-direction: column; gap: 24px;">
        
        <!-- SECTION 1 — HOSPITAL SNAPSHOT (KPI cards) -->
        <div style="display: flex; flex-direction: column; gap: 12px;">
          
          <!-- Row 1: Patient Operations (10 cards) -->
          <div>
            <div class="exec-section-title" style="margin-bottom:8px;">📊 Patient Operations Snapshot</div>
            <div class="exec-grid-10">
              
              <div class="exec-card" onclick="router.navigate('opd-dashboard')">
                <span class="exec-card-name">OPD Today</span>
                <span class="exec-card-val">342</span>
                <span class="exec-card-sub"><span style="color:#10b981">↑ 14%</span> · Appt: 220</span>
                <span class="exec-status-dot-indicator exec-dot-green"></span>
              </div>
              
              <div class="exec-card" onclick="router.navigate('appointments')">
                <span class="exec-card-name">Appointments</span>
                <span class="exec-card-val">220</span>
                <span class="exec-card-sub"><span style="color:#10b981">Comp: 185</span> · Pend: 25</span>
                <span class="exec-status-dot-indicator exec-dot-green"></span>
              </div>
              
              <div class="exec-card" style="border-color: #fca5a5; background: #fef2f2;" onclick="router.navigate('emergency')">
                <span class="exec-card-name">Emergency / Cas.</span>
                <span class="exec-card-val" style="color: #dc2626;">18</span>
                <span class="exec-card-sub" style="font-weight:700; color:#b91c1c;">MLC: 2 · BD: 1</span>
                <span class="exec-status-dot-indicator exec-dot-red"></span>
              </div>
              
              <div class="exec-card" onclick="router.navigate('atd')">
                <span class="exec-card-name">Admissions</span>
                <span class="exec-card-val">28</span>
                <span class="exec-card-sub">Elec: 18 · ER: 8</span>
                <span class="exec-status-dot-indicator exec-dot-green"></span>
              </div>
              
              <div class="exec-card" onclick="router.navigate('atd')">
                <span class="exec-card-name">Current IPD</span>
                <span class="exec-card-val">188</span>
                <span class="exec-card-sub">Crit: 12 · MLC: 3</span>
                <span class="exec-status-dot-indicator exec-dot-green"></span>
              </div>
              
              <div class="exec-card" style="border-color: #fca5a5; background: #fef2f2;" onclick="router.navigate('atd')">
                <span class="exec-card-name">Discharges Today</span>
                <span class="exec-card-val" style="color: #dc2626;">24</span>
                <span class="exec-card-sub" style="font-weight:700; color:#b91c1c;">Pending >6h: 3</span>
                <span class="exec-status-dot-indicator exec-dot-red"></span>
              </div>
              
              <div class="exec-card" onclick="router.navigate('daybed')">
                <span class="exec-card-name">Day Care Today</span>
                <span class="exec-card-val">14</span>
                <span class="exec-card-sub">Comp: 8 · Proc: 4</span>
                <span class="exec-status-dot-indicator exec-dot-green"></span>
              </div>
              
              <div class="exec-card" onclick="router.navigate('atd')">
                <span class="exec-card-name">Bed Occupancy</span>
                <span class="exec-card-val" style="color:#d97706;">81.7%</span>
                <span class="exec-card-sub">188/230 beds · ICU: 92%</span>
                <span class="exec-status-dot-indicator exec-dot-amber"></span>
              </div>
              
              <div class="exec-card" style="border-color: #fca5a5; background: #fef2f2;" onclick="router.navigate('atd')">
                <span class="exec-card-name">ICU Occupancy</span>
                <span class="exec-card-val" style="color: #dc2626;">92.0%</span>
                <span class="exec-card-sub" style="font-weight:700; color:#b91c1c;">Vent: 12 · Free: 2</span>
                <span class="exec-status-dot-indicator exec-dot-red"></span>
              </div>
              
              <div class="exec-card" style="border-color: #fca5a5; background: #fef2f2;" onclick="router.navigate('ot')">
                <span class="exec-card-name">OT Today</span>
                <span class="exec-card-val" style="color: #dc2626;">12</span>
                <span class="exec-card-sub" style="font-weight:700; color:#b91c1c;">Comp: 8 · Delayed: 1</span>
                <span class="exec-status-dot-indicator exec-dot-red"></span>
              </div>

            </div>
          </div>

          <!-- Row 2: Financial Overview (5 cards - visible for finance roles) -->
          ${hasFinance ? `
            <div>
              <div class="exec-section-title" style="margin-bottom:8px;">💰 Financial Snapshot</div>
              <div class="exec-grid-5">
                
                <div class="exec-card" onclick="router.navigate('billing')">
                  <span class="exec-card-name">Revenue Today</span>
                  <span class="exec-card-val">₹4,85,200</span>
                  <span class="exec-card-sub"><span style="color:#10b981">↑ 8% vs yesterday</span></span>
                  <span class="exec-status-dot-indicator exec-dot-green"></span>
                </div>
                
                <div class="exec-card" onclick="router.navigate('billing')">
                  <span class="exec-card-name">Collections Today</span>
                  <span class="exec-card-val">₹4,20,500</span>
                  <span class="exec-card-sub">UPI: ₹2.45L · Cash: ₹95K</span>
                  <span class="exec-status-dot-indicator exec-dot-green"></span>
                </div>
                
                <div class="exec-card" style="border-color: #fca5a5; background: #fef2f2;" onclick="router.navigate('billing')">
                  <span class="exec-card-name">Outstanding Receivables</span>
                  <span class="exec-card-val" style="color: #dc2626;">₹84,20,000</span>
                  <span class="exec-card-sub" style="font-weight:700; color:#b91c1c;">TPA: ₹42.5L · CGHS: ₹28.7L</span>
                  <span class="exec-status-dot-indicator exec-dot-red"></span>
                </div>
                
                <div class="exec-card" onclick="router.navigate('insurance')">
                  <span class="exec-card-name">Insurance Pending</span>
                  <span class="exec-card-val" style="color:#d97706;">85 claims</span>
                  <span class="exec-card-sub" style="font-weight:700; color:#d97706;">Value: ₹42.5L · Overdue: 5</span>
                  <span class="exec-status-dot-indicator exec-dot-amber"></span>
                </div>
                
                <div class="exec-card" onclick="router.navigate('billing')">
                  <span class="exec-card-name">Payer Mix</span>
                  <div style="font-family:'JetBrains Mono',monospace; font-size: 0.72rem; font-weight:700; display:flex; flex-direction:column; gap:2px; margin-top:2px;">
                    <div>Self: 35% | TPA: 45%</div>
                    <div>CGHS: 12% | PMJAY: 8%</div>
                  </div>
                  <span class="exec-status-dot-indicator exec-dot-green"></span>
                </div>

              </div>
            </div>
          ` : ''}

        </div>

        <!-- SECTION 2 — ITEMS REQUIRING EXECUTIVE ATTENTION -->
        <div id="attention-section-panel" style="background:#fff5f5; border: 1px solid #fecaca; border-left: 4px solid #ef4444; border-radius: 8px; padding: 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 12px; border-bottom:1px solid #fee2e2; padding-bottom:6px;">
            <div style="font-weight: 800; font-size: 0.85rem; text-transform:uppercase; color:#991b1b; letter-spacing:0.5px; display:flex; align-items:center; gap:6px;">
              <span>🚨</span> Requires Your Attention
            </div>
            <button class="btn btn-secondary btn-sm" onclick="window.resolveAttentionItem('all')" style="padding: 2px 8px; font-size: 0.7rem; border-color:#fca5a5; color:#991b1b; background:#fff; font-weight:700;">Resolve All</button>
          </div>
          
          <div id="attention-items-list" style="display:flex; flex-direction:column; gap:8px;">
            
            <div id="attention-item-1" style="display:flex; justify-content:space-between; align-items:center; font-size:0.8rem; background:#fff; border: 1px solid #fee2e2; padding:8px 12px; border-radius:6px;">
              <div style="display:flex; align-items:center; gap:8px;">
                <span class="exec-status-dot exec-status-red"></span>
                <strong>🔴 PATIENT SAFETY:</strong> Sentinel event reported — General Medicine — 09:30 AM today — RCA investigation pending
              </div>
              <button class="btn btn-primary btn-sm" onclick="window.resolveAttentionItem(1)" style="padding:2px 8px; font-size:0.75rem; background:#dc2626; border:none; height:24px;">Investigate →</button>
            </div>

            <div id="attention-item-2" style="display:flex; justify-content:space-between; align-items:center; font-size:0.8rem; background:#fff; border: 1px solid #fee2e2; padding:8px 12px; border-radius:6px;">
              <div style="display:flex; align-items:center; gap:8px;">
                <span class="exec-status-dot exec-status-red"></span>
                <strong>🔴 CLINICAL GOVERNANCE:</strong> Doctor credential expired — Dr. Sandeep Shah — Orthopedics Board Registration
              </div>
              <button class="btn btn-secondary btn-sm" onclick="window.resolveAttentionItem(2)" style="padding:2px 8px; font-size:0.75rem; height:24px;">Renew →</button>
            </div>

            <div id="attention-item-3" style="display:flex; justify-content:space-between; align-items:center; font-size:0.8rem; background:#fff; border: 1px solid #fee2e2; padding:8px 12px; border-radius:6px;">
              <div style="display:flex; align-items:center; gap:8px;">
                <span class="exec-status-dot exec-status-amber"></span>
                <strong>🟠 OPERATIONAL:</strong> ICU Occupancy at Critical Threshold (92%) — Only 2 isolation/ventilator beds remaining
              </div>
              <button class="btn btn-secondary btn-sm" onclick="window.resolveAttentionItem(3)" style="padding:2px 8px; font-size:0.75rem; height:24px;">Bed Board →</button>
            </div>

            <div id="attention-item-4" style="display:flex; justify-content:space-between; align-items:center; font-size:0.8rem; background:#fff; border: 1px solid #fee2e2; padding:8px 12px; border-radius:6px;">
              <div style="display:flex; align-items:center; gap:8px;">
                <span class="exec-status-dot exec-status-amber"></span>
                <strong>🟠 OPERATIONAL:</strong> Liquid Oxygen tank pressure critical at tank yard — Refill scheduled 04:00 AM
              </div>
              <button class="btn btn-secondary btn-sm" onclick="window.resolveAttentionItem(4)" style="padding:2px 8px; font-size:0.75rem; height:24px;">View SLA →</button>
            </div>

          </div>
        </div>

        <!-- SECTION 3 — LIVE DEPARTMENT STATUS (10 departments) -->
        ${hasOps ? `
          <div>
            <div class="exec-section-title">🏥 Live Department Status</div>
            <div class="exec-grid-5">
              
              <!-- Card 1: OPD -->
              <div class="exec-card" onclick="router.navigate('opd-dashboard')" style="min-height: 125px;">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                  <strong style="font-size:0.85rem; color:#0f172a;">OPD Services</strong>
                  <span class="exec-status-dot exec-status-green"></span>
                </div>
                <div style="font-family:'JetBrains Mono',monospace; font-size:0.76rem; color:#475569; margin-top:8px;">
                  <div>Waiting: <b>18 patients</b></div>
                  <div>Avg Wait: <b>22 min</b></div>
                </div>
                <div style="font-size:0.65rem; color:#64748b; font-style:italic; margin-top:4px;">🟢 SLA within normal threshold</div>
              </div>

              <!-- Card 2: Emergency -->
              <div class="exec-card" onclick="router.navigate('emergency')" style="border-color:#fca5a5; background:#fffafb; min-height: 125px;">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                  <strong style="font-size:0.85rem; color:#991b1b;">Emergency / Casualty</strong>
                  <span class="exec-status-dot exec-status-red"></span>
                </div>
                <div style="font-family:'JetBrains Mono',monospace; font-size:0.76rem; color:#991b1b; margin-top:8px;">
                  <div>Active cases: <b>14 cases</b></div>
                  <div>Resus Bay: <b style="color:#dc2626;">2/2 Occupied</b></div>
                </div>
                <div style="font-size:0.68rem; font-weight:700; color:#dc2626; margin-top:4px;">🚨 Resus full · MLC case active</div>
              </div>

              <!-- Card 3: IPD / ATD -->
              <div class="exec-card" onclick="router.navigate('atd')" style="border-color:#fed7aa; background:#fffbeb; min-height: 125px;">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                  <strong style="font-size:0.85rem; color:#9a3412;">IPD / ATD Admissions</strong>
                  <span class="exec-status-dot exec-status-amber"></span>
                </div>
                <div style="font-family:'JetBrains Mono',monospace; font-size:0.76rem; color:#9a3412; margin-top:8px;">
                  <div>Inpatients: <b>188 patients</b></div>
                  <div>D/C Pending: <b style="color:#ea580c;">8 cases</b></div>
                </div>
                <div style="font-size:0.68rem; font-weight:700; color:#ea580c; margin-top:4px;">⚠ 3 discharges pending >6h</div>
              </div>

              <!-- Card 4: ICU -->
              <div class="exec-card" onclick="router.navigate('atd')" style="border-color:#fca5a5; background:#fffafb; min-height: 125px;">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                  <strong style="font-size:0.85rem; color:#991b1b;">ICU Care Unit</strong>
                  <span class="exec-status-dot exec-status-red"></span>
                </div>
                <div style="font-family:'JetBrains Mono',monospace; font-size:0.76rem; color:#991b1b; margin-top:8px;">
                  <div>Occupancy: <b style="color:#dc2626;">23/25 beds</b></div>
                  <div>Ventilated: <b>12 patients</b></div>
                </div>
                <div style="font-size:0.68rem; font-weight:700; color:#dc2626; margin-top:4px;">🚨 ICU Occupancy >90%</div>
              </div>

              <!-- Card 5: OT -->
              <div class="exec-card" onclick="router.navigate('ot')" style="border-color:#fed7aa; background:#fffbeb; min-height: 125px;">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                  <strong style="font-size:0.85rem; color:#9a3412;">Operation Theatre</strong>
                  <span class="exec-status-dot exec-status-amber"></span>
                </div>
                <div style="font-family:'JetBrains Mono',monospace; font-size:0.76rem; color:#9a3412; margin-top:8px;">
                  <div>Cases Today: <b>12 scheduled</b></div>
                  <div>In progress: <b>3</b> · Delayed: <b style="color:#ea580c;">1</b></div>
                </div>
                <div style="font-size:0.68rem; font-weight:700; color:#ea580c; margin-top:4px;">⚠ OT case delayed >30 min</div>
              </div>

              <!-- Card 6: Laboratory -->
              <div class="exec-card" onclick="router.navigate('lab')" style="border-color:#fca5a5; background:#fffafb; min-height: 125px;">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                  <strong style="font-size:0.85rem; color:#991b1b;">LIS Pathology Lab</strong>
                  <span class="exec-status-dot exec-status-red"></span>
                </div>
                <div style="font-family:'JetBrains Mono',monospace; font-size:0.76rem; color:#991b1b; margin-top:8px;">
                  <div>Samples: <b>45 pending</b></div>
                  <div>Critical values: <b style="color:#dc2626;">2</b></div>
                </div>
                <div style="font-size:0.68rem; font-weight:700; color:#dc2626; margin-top:4px;">🚨 Unack critical lab values</div>
              </div>

              <!-- Card 7: Radiology -->
              <div class="exec-card" onclick="router.navigate('rad')" style="min-height: 125px;">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                  <strong style="font-size:0.85rem; color:#0f172a;">RIS Radiology / MRI</strong>
                  <span class="exec-status-dot exec-status-green"></span>
                </div>
                <div style="font-family:'JetBrains Mono',monospace; font-size:0.76rem; color:#475569; margin-top:8px;">
                  <div>Studies pending: <b>8 cases</b></div>
                  <div>Reports pending: <b>4</b></div>
                </div>
                <div style="font-size:0.65rem; color:#64748b; font-style:italic; margin-top:4px;">🟢 TAT limits on track</div>
              </div>

              <!-- Card 8: Pharmacy -->
              <div class="exec-card" onclick="router.navigate('pharmacy')" style="border-color:#fed7aa; background:#fffbeb; min-height: 125px;">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                  <strong style="font-size:0.85rem; color:#9a3412;">Pharmacy Issues</strong>
                  <span class="exec-status-dot exec-status-amber"></span>
                </div>
                <div style="font-family:'JetBrains Mono',monospace; font-size:0.76rem; color:#9a3412; margin-top:8px;">
                  <div>Rx to Dispense: <b>15 pending</b></div>
                  <div>Stock Alerts: <b style="color:#ea580c;">3 drugs</b></div>
                </div>
                <div style="font-size:0.68rem; font-weight:700; color:#ea580c; margin-top:4px;">⚠ Pantoprazole low stock</div>
              </div>

              <!-- Card 9: Billing -->
              <div class="exec-card" onclick="router.navigate('billing')" style="min-height: 125px;">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                  <strong style="font-size:0.85rem; color:#0f172a;">Billing Desk</strong>
                  <span class="exec-status-dot exec-status-green"></span>
                </div>
                <div style="font-family:'JetBrains Mono',monospace; font-size:0.76rem; color:#475569; margin-top:8px;">
                  <div>Discharges: <b>24 cleared</b></div>
                  <div>Reconciliation: <b>Completed ✓</b></div>
                </div>
                <div style="font-size:0.65rem; color:#64748b; font-style:italic; margin-top:4px;">🟢 Day closing verified</div>
              </div>

              <!-- Card 10: Insurance / TPA -->
              <div class="exec-card" onclick="router.navigate('insurance')" style="border-color:#fed7aa; background:#fffbeb; min-height: 125px;">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                  <strong style="font-size:0.85rem; color:#9a3412;">Insurance / TPA claims</strong>
                  <span class="exec-status-dot exec-status-amber"></span>
                </div>
                <div style="font-family:'JetBrains Mono',monospace; font-size:0.76rem; color:#9a3412; margin-top:8px;">
                  <div>Active Claims: <b>35 cases</b></div>
                  <div>Pre-auths pending: <b style="color:#ea580c;">12</b></div>
                </div>
                <div style="font-size:0.68rem; font-weight:700; color:#ea580c; margin-top:4px;">⚠ Star Health >48h pending</div>
              </div>

            </div>
          </div>
        ` : ''}

        <!-- SECTION 4 & 5 Split: Bed/Resource Status vs Financial Summary -->
        <div class="exec-grid-2">
          
          <!-- LEFT — BED BOARD SUMMARY & RESOURCE STATUS -->
          ${hasOps ? `
            <div style="background:#ffffff; border:1px solid #cbd5e1; border-radius:8px; padding:16px; box-shadow:0 1px 3px rgba(0,0,0,0.05); display:flex; flex-direction:column; gap:16px;">
              <div>
                <div class="exec-section-title" style="margin-bottom:8px; display:flex; justify-content:space-between; align-items:center;">
                  <span>🛏 Bed Board Occupancy Summary</span>
                  <a href="#atd" style="font-size:0.72rem; color:#2563eb; text-transform:none; font-weight:700;">View Full Bed Board &rarr;</a>
                </div>
                
                <table class="exec-table">
                  <thead>
                    <tr>
                      <th>Ward Category</th>
                      <th style="font-family:'JetBrains Mono',monospace;">Total</th>
                      <th style="font-family:'JetBrains Mono',monospace;">Occ</th>
                      <th style="font-family:'JetBrains Mono',monospace;">Avail</th>
                      <th style="font-family:'JetBrains Mono',monospace;">Clean</th>
                      <th style="font-family:'JetBrains Mono',monospace;">Block</th>
                      <th style="text-align:right;">Occ%</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>General Male</td>
                      <td style="font-family:'JetBrains Mono',monospace;">50</td>
                      <td style="font-family:'JetBrains Mono',monospace;">42</td>
                      <td style="font-family:'JetBrains Mono',monospace;">5</td>
                      <td style="font-family:'JetBrains Mono',monospace;">2</td>
                      <td style="font-family:'JetBrains Mono',monospace;">1</td>
                      <td style="text-align:right; font-weight:700; color:#d97706; font-family:'JetBrains Mono',monospace;">84%</td>
                    </tr>
                    <tr>
                      <td>General Female</td>
                      <td style="font-family:'JetBrains Mono',monospace;">50</td>
                      <td style="font-family:'JetBrains Mono',monospace;">44</td>
                      <td style="font-family:'JetBrains Mono',monospace;">4</td>
                      <td style="font-family:'JetBrains Mono',monospace;">1</td>
                      <td style="font-family:'JetBrains Mono',monospace;">1</td>
                      <td style="text-align:right; font-weight:700; color:#d97706; font-family:'JetBrains Mono',monospace;">88%</td>
                    </tr>
                    <tr>
                      <td>Semi-Private</td>
                      <td style="font-family:'JetBrains Mono',monospace;">40</td>
                      <td style="font-family:'JetBrains Mono',monospace;">32</td>
                      <td style="font-family:'JetBrains Mono',monospace;">6</td>
                      <td style="font-family:'JetBrains Mono',monospace;">1</td>
                      <td style="font-family:'JetBrains Mono',monospace;">1</td>
                      <td style="text-align:right; font-weight:700; color:#d97706; font-family:'JetBrains Mono',monospace;">80%</td>
                    </tr>
                    <tr>
                      <td>Private Room</td>
                      <td style="font-family:'JetBrains Mono',monospace;">30</td>
                      <td style="font-family:'JetBrains Mono',monospace;">21</td>
                      <td style="font-family:'JetBrains Mono',monospace;">8</td>
                      <td style="font-family:'JetBrains Mono',monospace;">1</td>
                      <td style="font-family:'JetBrains Mono',monospace;">0</td>
                      <td style="text-align:right; font-weight:700; color:#10b981; font-family:'JetBrains Mono',monospace;">70%</td>
                    </tr>
                    <tr>
                      <td>Deluxe Room</td>
                      <td style="font-family:'JetBrains Mono',monospace;">10</td>
                      <td style="font-family:'JetBrains Mono',monospace;">6</td>
                      <td style="font-family:'JetBrains Mono',monospace;">4</td>
                      <td style="font-family:'JetBrains Mono',monospace;">0</td>
                      <td style="font-family:'JetBrains Mono',monospace;">0</td>
                      <td style="text-align:right; font-weight:700; color:#10b981; font-family:'JetBrains Mono',monospace;">60%</td>
                    </tr>
                    <tr style="background:#fff5f5; font-weight:700; border-top:1px solid #fca5a5;">
                      <td style="color:#dc2626;">ICU Beds</td>
                      <td style="font-family:'JetBrains Mono',monospace;">25</td>
                      <td style="font-family:'JetBrains Mono',monospace; color:#dc2626;">23</td>
                      <td style="font-family:'JetBrains Mono',monospace;">1</td>
                      <td style="font-family:'JetBrains Mono',monospace;">1</td>
                      <td style="font-family:'JetBrains Mono',monospace;">0</td>
                      <td style="text-align:right; font-weight:800; color:#dc2626; font-family:'JetBrains Mono',monospace;">92%</td>
                    </tr>
                    <tr>
                      <td>HDU Beds</td>
                      <td style="font-family:'JetBrains Mono',monospace;">15</td>
                      <td style="font-family:'JetBrains Mono',monospace;">11</td>
                      <td style="font-family:'JetBrains Mono',monospace;">3</td>
                      <td style="font-family:'JetBrains Mono',monospace;">1</td>
                      <td style="font-family:'JetBrains Mono',monospace;">0</td>
                      <td style="text-align:right; font-weight:700; color:#10b981; font-family:'JetBrains Mono',monospace;">73%</td>
                    </tr>
                    <tr style="background:#fff5f5; font-weight:700;">
                      <td style="color:#dc2626;">NICU / PICU</td>
                      <td style="font-family:'JetBrains Mono',monospace;">10</td>
                      <td style="font-family:'JetBrains Mono',monospace; color:#dc2626;">9</td>
                      <td style="font-family:'JetBrains Mono',monospace;">1</td>
                      <td style="font-family:'JetBrains Mono',monospace;">0</td>
                      <td style="font-family:'JetBrains Mono',monospace;">0</td>
                      <td style="text-align:right; font-weight:800; color:#dc2626; font-family:'JetBrains Mono',monospace;">90%</td>
                    </tr>
                    <tr>
                      <td>Isolation Ward</td>
                      <td style="font-family:'JetBrains Mono',monospace;">5</td>
                      <td style="font-family:'JetBrains Mono',monospace;">2</td>
                      <td style="font-family:'JetBrains Mono',monospace;">3</td>
                      <td style="font-family:'JetBrains Mono',monospace;">0</td>
                      <td style="font-family:'JetBrains Mono',monospace;">0</td>
                      <td style="text-align:right; font-weight:700; color:#10b981; font-family:'JetBrains Mono',monospace;">40%</td>
                    </tr>
                    <tr>
                      <td>Daycare Ward</td>
                      <td style="font-family:'JetBrains Mono',monospace;">15</td>
                      <td style="font-family:'JetBrains Mono',monospace;">8</td>
                      <td style="font-family:'JetBrains Mono',monospace;">6</td>
                      <td style="font-family:'JetBrains Mono',monospace;">1</td>
                      <td style="font-family:'JetBrains Mono',monospace;">0</td>
                      <td style="text-align:right; font-weight:700; color:#10b981; font-family:'JetBrains Mono',monospace;">53%</td>
                    </tr>
                    <tr style="font-weight: 800; border-top: 2px solid #cbd5e1; background: #f1f5f9;">
                      <td>COMBINED TOTAL</td>
                      <td style="font-family:'JetBrains Mono',monospace;">250</td>
                      <td style="font-family:'JetBrains Mono',monospace;">201</td>
                      <td style="font-family:'JetBrains Mono',monospace;">41</td>
                      <td style="font-family:'JetBrains Mono',monospace;">8</td>
                      <td style="font-family:'JetBrains Mono',monospace;">3</td>
                      <td style="text-align:right; font-family:'JetBrains Mono',monospace; color:#d97706;">80.4%</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <!-- Resource status subpanel -->
              <div style="border-top:1px solid #cbd5e1; padding-top:12px; display:grid; grid-template-columns: repeat(2, 1fr); gap:12px; font-size:0.78rem;">
                <div>
                  <div style="font-weight:700; color:#475569; margin-bottom:4px;">⚙️ Resources</div>
                  <div>OT Utilisation: <b style="color:#10b981;">83.3%</b> (Completed: 8/12)</div>
                  <div>ICU Beds Status: <span class="exec-badge-red" style="font-size:0.65rem;">Critical Overload</span></div>
                  <div>Biomedical Down: <b>1 critical item</b> (MRI Console)</div>
                </div>
                <div>
                  <div style="font-weight:700; color:#475569; margin-bottom:4px;">👥 Staff On Duty</div>
                  <div>Doctors present: <b style="font-family:'JetBrains Mono',monospace;">48 / 50</b> scheduled</div>
                  <div>Nurses present: <b style="font-family:'JetBrains Mono',monospace;">110 / 115</b> scheduled</div>
                  <div>Absent unplanned: <b style="font-family:'JetBrains Mono',monospace; color:#10b981;">2</b> (SLA green)</div>
                </div>
              </div>
            </div>
          ` : ''}

          <!-- RIGHT — FINANCIAL SUMMARY (CFO / executives) -->
          ${hasFinance ? `
            <div style="background:#ffffff; border:1px solid #cbd5e1; border-radius:8px; padding:16px; box-shadow:0 1px 3px rgba(0,0,0,0.05); display:flex; flex-direction:column; gap:16px;">
              <div class="exec-section-title" style="margin-bottom:8px; display:flex; justify-content:space-between; align-items:center;">
                <span>💰 Executive Financial Summary</span>
                <a href="#billing" style="font-size:0.72rem; color:#2563eb; text-transform:none; font-weight:700;">Open Billing &rarr;</a>
              </div>
              
              <div style="display:grid; grid-template-columns: repeat(3, 1fr); gap:16px; font-size:0.78rem;">
                
                <!-- Revenue & Collections -->
                <div style="display:flex; flex-direction:column; gap:6px; border-right:1px solid #cbd5e1; padding-right:12px;">
                  <div style="font-weight:700; color:#475569; text-transform:uppercase; font-size:0.7rem; border-bottom:1px solid #cbd5e1; padding-bottom:2px;">Today's Revenue</div>
                  <div style="display:flex; justify-content:space-between;"><span>Gross Rev:</span><b style="font-family:'JetBrains Mono',monospace;">₹4,85,200</b></div>
                  <div style="display:flex; justify-content:space-between;"><span>Discounts:</span><span style="font-family:'JetBrains Mono',monospace; color:#dc2626;">-₹12,500</span></div>
                  <div style="display:flex; justify-content:space-between;"><span>Refunds:</span><span style="font-family:'JetBrains Mono',monospace; color:#dc2626;">-₹5,000</span></div>
                  <div style="display:flex; justify-content:space-between; font-weight:700; border-top:1px dashed #cbd5e1; padding-top:4px;"><span>Net Revenue:</span><b style="font-family:'JetBrains Mono',monospace;">₹4,67,700</b></div>
                  <div style="display:flex; justify-content:space-between; margin-top:4px;"><span>Collections:</span><b style="font-family:'JetBrains Mono',monospace;">₹4,20,500</b></div>
                  <div style="font-size:0.65rem; color:#64748b; margin-top:2px;">Cash: ₹95K · UPI: ₹2.45L · Card: ₹80K</div>
                </div>

                <!-- Receivables Aging -->
                <div style="display:flex; flex-direction:column; gap:6px; border-right:1px solid #cbd5e1; padding-right:12px;">
                  <div style="font-weight:700; color:#475569; text-transform:uppercase; font-size:0.7rem; border-bottom:1px solid #cbd5e1; padding-bottom:2px;">Receivables Aging</div>
                  <div style="display:flex; justify-content:space-between;"><span>TPA (85 claims):</span><b style="font-family:'JetBrains Mono',monospace;">₹42,50,000</b></div>
                  <div style="display:flex; justify-content:space-between;"><span>CGHS / ECHS:</span><b style="font-family:'JetBrains Mono',monospace;">₹28,70,000</b></div>
                  <div style="display:flex; justify-content:space-between;"><span>PMJAY:</span><b style="font-family:'JetBrains Mono',monospace;">₹8,00,000</b></div>
                  <div style="display:flex; justify-content:space-between;"><span>Corporate:</span><b style="font-family:'JetBrains Mono',monospace;">₹5,00,000</b></div>
                  <div style="display:flex; justify-content:space-between; font-weight:700; border-top:1px dashed #cbd5e1; padding-top:4px;"><span>Total:</span><b style="font-family:'JetBrains Mono',monospace; color:#dc2626;">₹84,20,000</b></div>
                  <div style="font-size:0.68rem; color:#64748b; margin-top:2px; font-family:'JetBrains Mono',monospace;">
                    0-30d: ₹45L | 31-60d: ₹25L | >90d: <span style="color:#dc2626; font-weight:700;">₹4.2L</span>
                  </div>
                </div>

                <!-- Insurance Operations -->
                <div style="display:flex; flex-direction:column; gap:6px;">
                  <div style="font-weight:700; color:#475569; text-transform:uppercase; font-size:0.7rem; border-bottom:1px solid #cbd5e1; padding-bottom:2px;">Insurance Operations</div>
                  <div style="display:flex; justify-content:space-between;"><span>Pre-auth Pending:</span><b style="font-family:'JetBrains Mono',monospace;">12 cases</b></div>
                  <div style="font-size:0.68rem; color:#64748b;">↳ &gt;24h: <span class="exec-badge-amber" style="font-size:10px; padding:0 3px;">7</span> | &gt;48h: <span class="exec-badge-red" style="font-size:10px; padding:0 3px;">5</span></div>
                  <div style="display:flex; justify-content:space-between; margin-top:2px;"><span>TPA Queries open:</span><b style="font-family:'JetBrains Mono',monospace;">6 queries</b></div>
                  <div style="display:flex; justify-content:space-between;"><span>LOA Expired:</span><b style="font-family:'JetBrains Mono',monospace; color:#dc2626;">3 cases</b></div>
                  <div style="display:flex; justify-content:space-between; border-top:1px dashed #cbd5e1; padding-top:4px;"><span>Settled Month:</span><b style="font-family:'JetBrains Mono',monospace;">₹54,00,000</b></div>
                </div>

              </div>
              
              <!-- Top Revenue Departments -->
              <div style="border-top:1px solid #cbd5e1; padding-top:8px; font-size:0.76rem; display:flex; justify-content:space-between; align-items:center;">
                <div style="font-weight:700; color:#475569;">Top Revenue Wards/Dept:</div>
                <div style="display:flex; gap:12px; font-family:'JetBrains Mono',monospace; font-weight:700;">
                  <span>Cardiology: ₹1.80L (37%)</span>
                  <span>General Surgery: ₹1.15L (24%)</span>
                  <span>Orthopedics: ₹79K (16%)</span>
                </div>
              </div>
            </div>
          ` : ''}

        </div>

        <!-- SECTION 6 & 7 Split: Clinical Operations Summary vs Quality & Safety -->
        ${hasOps ? `
          <div class="exec-grid-2">
            
            <!-- LEFT — CLINICAL OPERATIONS SUMMARY -->
            <div style="background:#ffffff; border:1px solid #cbd5e1; border-radius:8px; padding:16px; box-shadow:0 1px 3px rgba(0,0,0,0.05);">
              <div class="exec-section-title" style="margin-bottom:12px; display:flex; justify-content:space-between; align-items:center;">
                <span>🔬 Clinical Operations Summary</span>
              </div>
              
              <div style="display:grid; grid-template-columns: repeat(2, 2fr); gap:16px; font-size:0.78rem;">
                
                <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:6px; padding:10px; cursor:pointer;" onclick="router.navigate('lab')">
                  <div style="font-weight:700; color:#0f172a; margin-bottom:4px; display:flex; justify-content:space-between; align-items:center;">
                    <span>LIS Lab Workflow</span>
                    <span class="exec-status-dot exec-status-red"></span>
                  </div>
                  <div>Samples pending: <b style="font-family:'JetBrains Mono',monospace;">45 samples</b></div>
                  <div style="color:#dc2626; font-weight:700;">Critical unacknowledged: 2 values</div>
                  <div style="font-size:0.68rem; color:#64748b;">TAT breaches today: 3 runs</div>
                </div>

                <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:6px; padding:10px; cursor:pointer;" onclick="router.navigate('rad')">
                  <div style="font-weight:700; color:#0f172a; margin-bottom:4px; display:flex; justify-content:space-between; align-items:center;">
                    <span>RIS Radiology</span>
                    <span class="exec-status-dot exec-status-green"></span>
                  </div>
                  <div>Studies pending: <b style="font-family:'JetBrains Mono',monospace;">8 scans</b></div>
                  <div>Reports pending: <b style="font-family:'JetBrains Mono',monospace;">4 scans</b></div>
                  <div style="font-size:0.68rem; color:#64748b;">TAT breaches today: 1 scan</div>
                </div>

                <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:6px; padding:10px; cursor:pointer;" onclick="router.navigate('pharmacy')">
                  <div style="font-weight:700; color:#0f172a; margin-bottom:4px; display:flex; justify-content:space-between; align-items:center;">
                    <span>Pharmacy Dispatch</span>
                    <span class="exec-status-dot exec-status-amber"></span>
                  </div>
                  <div>Prescriptions pending: <b style="font-family:'JetBrains Mono',monospace;">15 bills</b></div>
                  <div style="color:#d97706; font-weight:700;">Low stock alerts: 3 drugs</div>
                  <div style="font-size:0.68rem; color:#64748b;">Narcotic Reconciliation: Done ✓</div>
                </div>

                <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:6px; padding:10px; cursor:pointer;" onclick="router.navigate('ot')">
                  <div style="font-weight:700; color:#0f172a; margin-bottom:4px; display:flex; justify-content:space-between; align-items:center;">
                    <span>Operation Theatre (OT)</span>
                    <span class="exec-status-dot exec-status-amber"></span>
                  </div>
                  <div>Scheduled today: <b style="font-family:'JetBrains Mono',monospace;">12 cases</b></div>
                  <div>In progress: <b>3</b> · Completed: <b>8</b></div>
                  <div style="color:#d97706; font-weight:700;">Delayed >30 min: 1 case</div>
                </div>

              </div>
            </div>

            <!-- RIGHT — QUALITY, COMPLIANCE & SAFETY -->
            <div style="background:#ffffff; border:1px solid #cbd5e1; border-radius:8px; padding:16px; box-shadow:0 1px 3px rgba(0,0,0,0.05); display:flex; flex-direction:column; gap:12px;">
              <div class="exec-section-title" style="margin-bottom:4px; display:flex; justify-content:space-between; align-items:center;">
                <span>🛡️ Quality &amp; Compliance Today</span>
                <a href="#hospMgmt" style="font-size:0.72rem; color:#2563eb; text-transform:none; font-weight:700;">Open Management Module &rarr;</a>
              </div>
              
              <div style="display:grid; grid-template-columns: repeat(2, 1fr); gap:20px; font-size:0.78rem;">
                
                <!-- Incidents & Complaints -->
                <div style="display:flex; flex-direction:column; gap:6px;">
                  <div style="font-weight:700; color:#475569; text-transform:uppercase; font-size:0.7rem; border-bottom:1px solid #cbd5e1; padding-bottom:2px;">Incidents &amp; Complaints</div>
                  <div style="display:flex; justify-content:space-between;"><span>Incidents today:</span><b style="font-family:'JetBrains Mono',monospace;">2 reports</b></div>
                  <div style="font-size:0.68rem; color:#64748b;">↳ Sentinel: <span class="exec-badge-red" style="font-size:10px; padding:0 3px;">1</span> | Serious: 0 | Minor: 1</div>
                  <div style="display:flex; justify-content:space-between; margin-top:2px;"><span>Active Complaints:</span><b style="font-family:'JetBrains Mono',monospace; color:#dc2626;">3 open</b></div>
                  <div style="display:flex; justify-content:space-between;"><span>↳ Overdue SLA:</span><span class="exec-badge-red" style="font-size:10px;">1 case</span></div>
                  <div style="display:flex; justify-content:space-between; margin-top:2px;"><span>MLC Active:</span><b style="font-family:'JetBrains Mono',monospace;">3 active</b></div>
                  <div style="display:flex; justify-content:space-between;"><span>Unexpected Deaths:</span><b style="font-family:'JetBrains Mono',monospace; color:#dc2626;">1 case</b></div>
                </div>

                <!-- Compliance Checklist -->
                <div style="display:flex; flex-direction:column; gap:6px;">
                  <div style="font-weight:700; color:#475569; text-transform:uppercase; font-size:0.7rem; border-bottom:1px solid #cbd5e1; padding-bottom:2px;">NABH / Statutory Compliance</div>
                  <div style="display:flex; justify-content:space-between; align-items:center;">
                    <span>NABH Overdue Actions:</span>
                    <span class="exec-badge-red">2 overdue</span>
                  </div>
                  <div style="display:flex; justify-content:space-between; align-items:center;">
                    <span>Doctor Registrations expired:</span>
                    <span class="exec-badge-red">1 warning</span>
                  </div>
                  <div style="display:flex; justify-content:space-between; align-items:center;">
                    <span>Daily Census certified:</span>
                    <span id="compliance-census-status" class="exec-badge-amber">Pending certification</span>
                  </div>
                  <div style="display:flex; justify-content:space-between; align-items:center;">
                    <span>BMW waste collected:</span>
                    <span class="exec-badge-green">Yes ✓</span>
                  </div>
                  <div style="display:flex; justify-content:space-between; align-items:center;">
                    <span>Narcotic register reconciled:</span>
                    <span class="exec-badge-green">Reconciled ✓</span>
                  </div>
                </div>

              </div>
            </div>

          </div>
        ` : ''}

        <!-- SECTION 8 — PENDING EXECUTIVE APPROVALS -->
        ${hasApprovals ? `
          <div style="background:#ffffff; border:1px solid #cbd5e1; border-radius:8px; padding:16px; box-shadow:0 1px 3px rgba(0,0,0,0.05);">
            <div class="exec-section-title" style="margin-bottom:12px; border-bottom:1px solid #cbd5e1; padding-bottom:6px;">
              <span>✅ Pending Executive Approvals</span>
            </div>
            
            <div id="approvals-section-container">
              <table class="exec-table">
                <thead>
                  <tr>
                    <th style="width: 40px;">#</th>
                    <th style="width: 140px;">Approval Type</th>
                    <th>Description</th>
                    <th style="width: 120px;">Department</th>
                    <th style="width: 110px; font-family:'JetBrains Mono',monospace;">Amount</th>
                    <th style="width: 150px;">Requested By</th>
                    <th style="width: 100px;">Since</th>
                    <th style="text-align: right; width: 280px;">Action</th>
                  </tr>
                </thead>
                <tbody id="approvals-table-body">
                  
                  ${(!isMedDir) ? `
                    <tr id="approval-row-1">
                      <td style="font-family:'JetBrains Mono',monospace; font-weight:700;">1</td>
                      <td><span class="exec-badge-amber">High discount</span></td>
                      <td>Discount request of 15% (₹12,500) for inpatient Rajesh Kumar (cardiac billing clearance)</td>
                      <td style="font-weight:600;">Billing</td>
                      <td style="font-family:'JetBrains Mono',monospace; font-weight:700;">₹12,500</td>
                      <td>Billing supervisor Rajesh</td>
                      <td>2h ago</td>
                      <td style="text-align: right;">
                        <button class="btn btn-secondary btn-sm" onclick="alert('DISCOUNT DETAILS:\\nPatient: Rajesh Kumar\\nUHID: MRC-240001\\nRequested: 15% discount on ICU bed charges (₹12,500 value)\\nReason: Long stay financial constraint approved by ward doctor')" style="padding: 2px 6px; font-size:0.75rem; height:24px;">Details</button>
                        <button class="btn btn-primary btn-sm" onclick="window.handleApproval(1, 'Approve', 'High-value discount', '₹12,500')" style="padding: 2px 8px; font-size:0.75rem; height:24px; background:#10b981; border:none;">Approve</button>
                        <button class="btn btn-secondary btn-sm" onclick="window.handleApproval(1, 'Reject', 'High-value discount')" style="padding: 2px 8px; font-size:0.75rem; height:24px; color:#dc2626; border-color:#fca5a5;">Reject</button>
                        <button class="btn btn-secondary btn-sm" onclick="window.handleApproval(1, 'Delegate', 'High-value discount')" style="padding: 2px 6px; font-size:0.75rem; height:24px;">Delegate</button>
                      </td>
                    </tr>
                  ` : ''}

                  <tr id="approval-row-2">
                    <td style="font-family:'JetBrains Mono',monospace; font-weight:700;">2</td>
                    <td><span class="exec-badge-blue">CapEx purchase</span></td>
                    <td>probe replacement request for Philips CX50 echo machine (Cardiology diagnostic unit)</td>
                    <td style="font-weight:600;">Cardiology</td>
                    <td style="font-family:'JetBrains Mono',monospace; font-weight:700;">₹1,50,000</td>
                    <td>Dr. Ramesh Kumar</td>
                    <td>4h ago</td>
                    <td style="text-align: right;">
                      <button class="btn btn-secondary btn-sm" onclick="alert('CAPEX REQUEST DETAILS:\\nItem: Philips CX50 echo probe replacement\\nAmount: ₹1,50,000\\nVendor: Philips Health India\\nUrgency: Urgent replacement required for active outpatient diagnostics')" style="padding: 2px 6px; font-size:0.75rem; height:24px;">Details</button>
                      <button class="btn btn-primary btn-sm" onclick="window.handleApproval(2, 'Approve', 'CapEx probe replacement', '₹1,50,000')" style="padding: 2px 8px; font-size:0.75rem; height:24px; background:#10b981; border:none;">Approve</button>
                      <button class="btn btn-secondary btn-sm" onclick="window.handleApproval(2, 'Reject', 'CapEx probe replacement')" style="padding: 2px 8px; font-size:0.75rem; height:24px; color:#dc2626; border-color:#fca5a5;">Reject</button>
                      <button class="btn btn-secondary btn-sm" onclick="window.handleApproval(2, 'Delegate', 'CapEx probe replacement')" style="padding: 2px 6px; font-size:0.75rem; height:24px;">Delegate</button>
                    </td>
                  </tr>

                  ${(!isMedDir) ? `
                    <tr id="approval-row-3">
                      <td style="font-family:'JetBrains Mono',monospace; font-weight:700;">3</td>
                      <td><span class="exec-badge-amber">TPA escalation</span></td>
                      <td>TPA dispute settlement above threshold regarding cardiac stent implant reimbursement approval</td>
                      <td style="font-weight:600;">Insurance</td>
                      <td style="font-family:'JetBrains Mono',monospace; font-weight:700;">₹45,000</td>
                      <td>Billing supervisor Rajesh</td>
                      <td>24h ago</td>
                      <td style="text-align: right;">
                        <button class="btn btn-secondary btn-sm" onclick="alert('TPA ESCALATION DETAILS:\\nCase: Stent reimbursement dispute\\nTPA: Star Health\\nDisputed Amount: ₹45,000\\nNote: Escalation to TPA medical team required for full implant release approval')" style="padding: 2px 6px; font-size:0.75rem; height:24px;">Details</button>
                        <button class="btn btn-primary btn-sm" onclick="window.handleApproval(3, 'Approve', 'TPA implant escalation', '₹45,000')" style="padding: 2px 8px; font-size:0.75rem; height:24px; background:#10b981; border:none;">Approve</button>
                        <button class="btn btn-secondary btn-sm" onclick="window.handleApproval(3, 'Reject', 'TPA implant escalation')" style="padding: 2px 8px; font-size:0.75rem; height:24px; color:#dc2626; border-color:#fca5a5;">Reject</button>
                        <button class="btn btn-secondary btn-sm" onclick="window.handleApproval(3, 'Delegate', 'TPA implant escalation')" style="padding: 2px 6px; font-size:0.75rem; height:24px;">Delegate</button>
                      </td>
                    </tr>
                  ` : ''}

                  <tr id="approval-row-4">
                    <td style="font-family:'JetBrains Mono',monospace; font-weight:700;">4</td>
                    <td><span class="exec-badge-gray">Pharmacy Drug</span></td>
                    <td>Non-formulary high-cost drug issue - injection Remdesivir special formulation request</td>
                    <td style="font-weight:600;">Pharmacy</td>
                    <td style="font-family:'JetBrains Mono',monospace; font-weight:700;">₹8,500</td>
                    <td>Chief Pharmacist Narendra</td>
                    <td>1h ago</td>
                    <td style="text-align: right;">
                      <button class="btn btn-secondary btn-sm" onclick="alert('PHARMACY REQUEST DETAILS:\\nDrug: Remdesivir special formulation\\nAmount: ₹8,500\\nPatient: Kavitha Nair (Emergency)\\nConsultant: Dr. Vikram S.')" style="padding: 2px 6px; font-size:0.75rem; height:24px;">Details</button>
                      <button class="btn btn-primary btn-sm" onclick="window.handleApproval(4, 'Approve', 'Non-formulary drug Remdesivir', '₹8,500')" style="padding: 2px 8px; font-size:0.75rem; height:24px; background:#10b981; border:none;">Approve</button>
                      <button class="btn btn-secondary btn-sm" onclick="window.handleApproval(4, 'Reject', 'Non-formulary drug Remdesivir')" style="padding: 2px 8px; font-size:0.75rem; height:24px; color:#dc2626; border-color:#fca5a5;">Reject</button>
                      <button class="btn btn-secondary btn-sm" onclick="window.handleApproval(4, 'Delegate', 'Non-formulary drug Remdesivir')" style="padding: 2px 6px; font-size:0.75rem; height:24px;">Delegate</button>
                    </td>
                  </tr>

                  <tr id="approval-row-5">
                    <td style="font-family:'JetBrains Mono',monospace; font-weight:700;">5</td>
                    <td><span class="exec-badge-red">LAMA override</span></td>
                    <td>ATD discharge warning override for high-risk cardiac patient seeking discharge against medical advice</td>
                    <td style="font-weight:600;">Admission</td>
                    <td style="font-family:'JetBrains Mono',monospace; font-weight:700;">—</td>
                    <td>ATD Coordinator Suresh</td>
                    <td>3h ago</td>
                    <td style="text-align: right;">
                      <button class="btn btn-secondary btn-sm" onclick="alert('LAMA OVERRIDE DETAILS:\\nPatient: Suresh G. (Cardiology)\\nConsultant: Dr. Ramesh Kumar\\nReason: Discharging against medical advice due to personal reasons. Indignity bond signed.')" style="padding: 2px 6px; font-size:0.75rem; height:24px;">Details</button>
                      <button class="btn btn-primary btn-sm" onclick="window.handleApproval(5, 'Approve', 'LAMA override Suresh G.', '')" style="padding: 2px 8px; font-size:0.75rem; height:24px; background:#10b981; border:none;">Approve Override</button>
                      <button class="btn btn-secondary btn-sm" onclick="window.handleApproval(5, 'Reject', 'LAMA override Suresh G.')" style="padding: 2px 8px; font-size:0.75rem; height:24px; color:#dc2626; border-color:#fca5a5;">Reject</button>
                      <button class="btn btn-secondary btn-sm" onclick="window.handleApproval(5, 'Delegate', 'LAMA override Suresh G.')" style="padding: 2px 6px; font-size:0.75rem; height:24px;">Delegate</button>
                    </td>
                  </tr>

                </tbody>
              </table>
            </div>
          </div>
        ` : ''}

        <!-- SECTION 9 — OPERATIONAL TRENDS -->
        <div>
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 12px;">
            <div class="exec-section-title" style="margin:0;">📈 Operational Trends</div>
            <div style="display:flex; gap:6px;">
              <button class="chart-toggle-btn active" id="btn-trend-7" onclick="alert('Range updated to 7 days')">Last 7 Days</button>
              <button class="chart-toggle-btn" id="btn-trend-30" onclick="alert('Range updated to 30 days')">Last 30 Days</button>
            </div>
          </div>
          
          <div class="exec-grid-3">
            
            <!-- Chart 1: OPD Visits -->
            <div style="background:#ffffff; border:1px solid #cbd5e1; border-radius:8px; padding:14px; box-shadow:0 1px 3px rgba(0,0,0,0.05);">
              <div style="font-weight:700; font-size:0.78rem; color:#475569; margin-bottom:10px;">OPD Visits vs Target</div>
              <!-- SVG Bar Chart -->
              <svg viewBox="0 0 300 120" style="width: 100%; height: 120px;">
                <line x1="20" y1="20" x2="290" y2="20" stroke="#f1f5f9" stroke-width="1" />
                <line x1="20" y1="50" x2="290" y2="50" stroke="#f1f5f9" stroke-width="1" />
                <line x1="20" y1="80" x2="290" y2="80" stroke="#f1f5f9" stroke-width="1" />
                <line x1="20" y1="100" x2="290" y2="100" stroke="#cbd5e1" stroke-width="1.5" />
                
                <rect x="35" y="32" width="16" height="68" fill="#cbd5e1" rx="2" />
                <rect x="75" y="24" width="16" height="76" fill="#3b82f6" rx="2" /> <!-- Today -->
                <rect x="115" y="38" width="16" height="62" fill="#cbd5e1" rx="2" />
                <rect x="155" y="27" width="16" height="73" fill="#cbd5e1" rx="2" />
                <rect x="195" y="31" width="16" height="69" fill="#cbd5e1" rx="2" />
                <rect x="235" y="25" width="16" height="75" fill="#cbd5e1" rx="2" />
                <rect x="275" y="70" width="16" height="30" fill="#94a3b8" rx="2" />
                
                <!-- Target Line -->
                <line x1="20" y1="30" x2="290" y2="30" stroke="#ef4444" stroke-width="1" stroke-dasharray="3,3" />
                <text x="25" y="15" fill="#ef4444" font-size="8px" font-weight="700">Target (320)</text>

                <!-- Labels -->
                <text x="43" y="112" fill="#64748b" font-size="8px" text-anchor="middle">Mon</text>
                <text x="83" y="112" fill="#0f172a" font-size="8px" font-weight="700" text-anchor="middle">Tue</text>
                <text x="123" y="112" fill="#64748b" font-size="8px" text-anchor="middle">Wed</text>
                <text x="163" y="112" fill="#64748b" font-size="8px" text-anchor="middle">Thu</text>
                <text x="203" y="112" fill="#64748b" font-size="8px" text-anchor="middle">Fri</text>
                <text x="243" y="112" fill="#64748b" font-size="8px" text-anchor="middle">Sat</text>
                <text x="283" y="112" fill="#64748b" font-size="8px" text-anchor="middle">Sun</text>
                
                <!-- Data Labels -->
                <text x="43" y="28" fill="#64748b" font-size="7px" text-anchor="middle" font-family="'JetBrains Mono',monospace;">310</text>
                <text x="83" y="20" fill="#3b82f6" font-size="7px" font-weight="700" text-anchor="middle" font-family="'JetBrains Mono',monospace;">342</text>
                <text x="283" y="66" fill="#64748b" font-size="7px" text-anchor="middle" font-family="'JetBrains Mono',monospace;">150</text>
              </svg>
            </div>

            <!-- Chart 2: Admissions & Discharges -->
            <div style="background:#ffffff; border:1px solid #cbd5e1; border-radius:8px; padding:14px; box-shadow:0 1px 3px rgba(0,0,0,0.05);">
              <div style="font-weight:700; font-size:0.78rem; color:#475569; margin-bottom:10px; display:flex; justify-content:space-between;">
                <span>Admissions vs Discharges</span>
                <span style="font-size:0.7rem; font-weight:normal; color:#64748b;">■ Adm  ■ D/C</span>
              </div>
              <!-- SVG Grouped Bar Chart -->
              <svg viewBox="0 0 300 120" style="width: 100%; height: 120px;">
                <line x1="20" y1="20" x2="290" y2="20" stroke="#f1f5f9" stroke-width="1" />
                <line x1="20" y1="50" x2="290" y2="50" stroke="#f1f5f9" stroke-width="1" />
                <line x1="20" y1="80" x2="290" y2="80" stroke="#f1f5f9" stroke-width="1" />
                <line x1="20" y1="100" x2="290" y2="100" stroke="#cbd5e1" stroke-width="1.5" />
                
                <!-- Mon -->
                <rect x="30" y="40" width="8" height="60" fill="#4f46e5" rx="1" />
                <rect x="39" y="50" width="8" height="50" fill="#10b981" rx="1" />
                <!-- Tue -->
                <rect x="70" y="32" width="8" height="68" fill="#4f46e5" rx="1" /> <!-- Adm 28 -->
                <rect x="79" y="44" width="8" height="56" fill="#10b981" rx="1" /> <!-- D/C 24 -->
                <!-- Wed -->
                <rect x="110" y="45" width="8" height="55" fill="#4f46e5" rx="1" />
                <rect x="119" y="48" width="8" height="52" fill="#10b981" rx="1" />
                <!-- Thu -->
                <rect x="150" y="38" width="8" height="62" fill="#4f46e5" rx="1" />
                <rect x="159" y="38" width="8" height="62" fill="#10b981" rx="1" />
                <!-- Fri -->
                <rect x="190" y="35" width="8" height="65" fill="#4f46e5" rx="1" />
                <rect x="199" y="40" width="8" height="60" fill="#10b981" rx="1" />
                <!-- Sat -->
                <rect x="230" y="55" width="8" height="45" fill="#4f46e5" rx="1" />
                <rect x="239" y="50" width="8" height="50" fill="#10b981" rx="1" />
                <!-- Sun -->
                <rect x="270" y="80" width="8" height="20" fill="#4f46e5" rx="1" />
                <rect x="279" y="85" width="8" height="15" fill="#10b981" rx="1" />

                <!-- Labels -->
                <text x="38" y="112" fill="#64748b" font-size="8px" text-anchor="middle">M</text>
                <text x="78" y="112" fill="#0f172a" font-size="8px" font-weight="700" text-anchor="middle">T</text>
                <text x="118" y="112" fill="#64748b" font-size="8px" text-anchor="middle">W</text>
                <text x="158" y="112" fill="#64748b" font-size="8px" text-anchor="middle">T</text>
                <text x="198" y="112" fill="#64748b" font-size="8px" text-anchor="middle">F</text>
                <text x="238" y="112" fill="#64748b" font-size="8px" text-anchor="middle">S</text>
                <text x="278" y="112" fill="#64748b" font-size="8px" text-anchor="middle">S</text>
              </svg>
            </div>

            <!-- Chart 3: Bed Occupancy % -->
            <div style="background:#ffffff; border:1px solid #cbd5e1; border-radius:8px; padding:14px; box-shadow:0 1px 3px rgba(0,0,0,0.05);">
              <div style="font-weight:700; font-size:0.78rem; color:#475569; margin-bottom:10px;">Daily Bed Occupancy %</div>
              <!-- SVG Line Chart -->
              <svg viewBox="0 0 300 120" style="width: 100%; height: 120px;">
                <line x1="20" y1="20" x2="290" y2="20" stroke="#f1f5f9" stroke-width="1" />
                <line x1="20" y1="50" x2="290" y2="50" stroke="#f1f5f9" stroke-width="1" />
                <line x1="20" y1="80" x2="290" y2="80" stroke="#f1f5f9" stroke-width="1" />
                <line x1="20" y1="100" x2="290" y2="100" stroke="#cbd5e1" stroke-width="1.5" />
                
                <!-- Threshold Line 85% at y=35 -->
                <line x1="20" y1="35" x2="290" y2="35" stroke="#ea580c" stroke-width="1" stroke-dasharray="3,3" />
                <text x="25" y="12" fill="#ea580c" font-size="7px" font-weight="700">Threshold (85%)</text>

                <!-- Line points -->
                <path d="M 40 45 L 80 38 L 120 40 L 160 42 L 200 36 L 240 40 L 280 41" fill="none" stroke="#2563eb" stroke-width="2.5" />
                
                <circle cx="40" cy="45" r="3.5" fill="#2563eb" />
                <circle cx="80" cy="38" r="3.5" fill="#2563eb" />
                <circle cx="120" cy="40" r="3.5" fill="#2563eb" />
                <circle cx="160" cy="42" r="3.5" fill="#2563eb" />
                <circle cx="200" cy="36" r="3.5" fill="#2563eb" />
                <circle cx="240" cy="40" r="3.5" fill="#2563eb" />
                <circle cx="280" cy="41" r="3.5" fill="#2563eb" />

                <text x="80" y="30" fill="#0f172a" font-size="7px" font-weight="800" text-anchor="middle" font-family="'JetBrains Mono',monospace;">81.7%</text>

                <!-- Labels -->
                <text x="40" y="112" fill="#64748b" font-size="8px" text-anchor="middle">M</text>
                <text x="80" y="112" fill="#0f172a" font-size="8px" font-weight="700" text-anchor="middle">T</text>
                <text x="120" y="112" fill="#64748b" font-size="8px" text-anchor="middle">W</text>
                <text x="160" y="112" fill="#64748b" font-size="8px" text-anchor="middle">T</text>
                <text x="200" y="112" fill="#64748b" font-size="8px" text-anchor="middle">F</text>
                <text x="240" y="112" fill="#64748b" font-size="8px" text-anchor="middle">S</text>
                <text x="280" y="112" fill="#64748b" font-size="8px" text-anchor="middle">S</text>
              </svg>
            </div>

            <!-- Chart 4: Revenue Collection -->
            ${hasFinance ? `
              <div style="background:#ffffff; border:1px solid #cbd5e1; border-radius:8px; padding:14px; box-shadow:0 1px 3px rgba(0,0,0,0.05);">
                <div style="font-weight:700; font-size:0.78rem; color:#475569; margin-bottom:10px;">Daily Net Collection (₹ Lakhs)</div>
                <svg viewBox="0 0 300 120" style="width: 100%; height: 120px;">
                  <line x1="20" y1="20" x2="290" y2="20" stroke="#f1f5f9" stroke-width="1" />
                  <line x1="20" y1="50" x2="290" y2="50" stroke="#f1f5f9" stroke-width="1" />
                  <line x1="20" y1="80" x2="290" y2="80" stroke="#f1f5f9" stroke-width="1" />
                  <line x1="20" y1="100" x2="290" y2="100" stroke="#cbd5e1" stroke-width="1.5" />
                  
                  <rect x="35" y="45" width="16" height="55" fill="#cbd5e1" rx="2" />
                  <rect x="75" y="38" width="16" height="62" fill="#10b981" rx="2" /> <!-- Today ₹4.20L -->
                  <rect x="115" y="42" width="16" height="58" fill="#cbd5e1" rx="2" />
                  <rect x="155" y="48" width="16" height="52" fill="#cbd5e1" rx="2" />
                  <rect x="195" y="40" width="16" height="60" fill="#cbd5e1" rx="2" />
                  <rect x="235" y="35" width="16" height="65" fill="#cbd5e1" rx="2" />
                  <rect x="275" y="80" width="16" height="20" fill="#94a3b8" rx="2" />
                  
                  <!-- Labels -->
                  <text x="43" y="112" fill="#64748b" font-size="8px" text-anchor="middle">M</text>
                  <text x="83" y="112" fill="#0f172a" font-size="8px" font-weight="700" text-anchor="middle">T</text>
                  <text x="123" y="112" fill="#64748b" font-size="8px" text-anchor="middle">W</text>
                  <text x="163" y="112" fill="#64748b" font-size="8px" text-anchor="middle">T</text>
                  <text x="203" y="112" fill="#64748b" font-size="8px" text-anchor="middle">F</text>
                  <text x="243" y="112" fill="#64748b" font-size="8px" text-anchor="middle">S</text>
                  <text x="283" y="112" fill="#64748b" font-size="8px" text-anchor="middle">S</text>

                  <text x="83" y="32" fill="#10b981" font-size="7px" font-weight="800" text-anchor="middle" font-family="'JetBrains Mono',monospace;">₹4.20L</text>
                </svg>
              </div>
            ` : ''}

            <!-- Chart 5: TPA Pre-auth & Claims -->
            ${(activeRole === 'CFO' || activeRole === 'CEO' || activeRole === 'Chairman' || activeRole === 'COO') ? `
              <div style="background:#ffffff; border:1px solid #cbd5e1; border-radius:8px; padding:14px; box-shadow:0 1px 3px rgba(0,0,0,0.05);">
                <div style="font-weight:700; font-size:0.78rem; color:#475569; margin-bottom:10px; display:flex; justify-content:space-between;">
                  <span>Weekly TPA Claims Processed</span>
                  <span style="font-size:0.7rem; font-weight:normal; color:#64748b;">■ Recv  ■ Subm</span>
                </div>
                <svg viewBox="0 0 300 120" style="width: 100%; height: 120px;">
                  <line x1="20" y1="20" x2="290" y2="20" stroke="#f1f5f9" stroke-width="1" />
                  <line x1="20" y1="50" x2="290" y2="50" stroke="#f1f5f9" stroke-width="1" />
                  <line x1="20" y1="80" x2="290" y2="80" stroke="#f1f5f9" stroke-width="1" />
                  <line x1="20" y1="100" x2="290" y2="100" stroke="#cbd5e1" stroke-width="1.5" />
                  
                  <rect x="40" y="45" width="10" height="55" fill="#3b82f6" rx="1.5" />
                  <rect x="52" y="40" width="10" height="60" fill="#1e40af" rx="1.5" />
                  <rect x="100" y="35" width="10" height="65" fill="#3b82f6" rx="1.5" />
                  <rect x="112" y="38" width="10" height="62" fill="#1e40af" rx="1.5" />
                  <rect x="160" y="30" width="10" height="70" fill="#3b82f6" rx="1.5" />
                  <rect x="172" y="25" width="10" height="75" fill="#1e40af" rx="1.5" />
                  <rect x="220" y="48" width="10" height="52" fill="#3b82f6" rx="1.5" />
                  <rect x="232" y="42" width="10" height="58" fill="#1e40af" rx="1.5" />

                  <!-- Labels -->
                  <text x="51" y="112" fill="#64748b" font-size="8px" text-anchor="middle">Wk 1</text>
                  <text x="111" y="112" fill="#64748b" font-size="8px" text-anchor="middle">Wk 2</text>
                  <text x="171" y="112" fill="#64748b" font-size="8px" text-anchor="middle">Wk 3</text>
                  <text x="231" y="112" fill="#64748b" font-size="8px" text-anchor="middle">Wk 4</text>
                </svg>
              </div>
            ` : ''}

            <!-- Chart 6: Average Length of Stay (ALOS) -->
            ${activeRole !== 'CFO' ? `
              <div style="background:#ffffff; border:1px solid #cbd5e1; border-radius:8px; padding:14px; box-shadow:0 1px 3px rgba(0,0,0,0.05);">
                <div style="font-weight:700; font-size:0.78rem; color:#475569; margin-bottom:10px;">Average Length of Stay (ALOS)</div>
                <svg viewBox="0 0 300 120" style="width: 100%; height: 120px;">
                  <line x1="20" y1="20" x2="290" y2="20" stroke="#f1f5f9" stroke-width="1" />
                  <line x1="20" y1="50" x2="290" y2="50" stroke="#f1f5f9" stroke-width="1" />
                  <line x1="20" y1="80" x2="290" y2="80" stroke="#f1f5f9" stroke-width="1" />
                  <line x1="20" y1="100" x2="290" y2="100" stroke="#cbd5e1" stroke-width="1.5" />
                  
                  <line x1="20" y1="50" x2="290" y2="50" stroke="#10b981" stroke-width="1" stroke-dasharray="3,3" />
                  <text x="25" y="12" fill="#10b981" font-size="7px" font-weight="700">Target (5.0 days)</text>

                  <path d="M 40 48 L 80 45 L 120 51 L 160 49 L 200 50 L 240 48 L 280 49" fill="none" stroke="#7c3aed" stroke-width="2.5" />
                  
                  <circle cx="40" cy="48" r="3.5" fill="#7c3aed" />
                  <circle cx="80" cy="45" r="3.5" fill="#7c3aed" />
                  <circle cx="120" cy="51" r="3.5" fill="#7c3aed" />
                  <circle cx="160" cy="49" r="3.5" fill="#7c3aed" />
                  <circle cx="200" cy="50" r="3.5" fill="#7c3aed" />
                  <circle cx="240" cy="48" r="3.5" fill="#7c3aed" />
                  <circle cx="280" cy="49" r="3.5" fill="#7c3aed" />

                  <text x="80" y="38" fill="#0f172a" font-size="7px" font-weight="800" text-anchor="middle" font-family="'JetBrains Mono',monospace;">5.5d</text>

                  <!-- Labels -->
                  <text x="40" y="112" fill="#64748b" font-size="8px" text-anchor="middle">M</text>
                  <text x="80" y="112" fill="#0f172a" font-size="8px" font-weight="700" text-anchor="middle">T</text>
                  <text x="120" y="112" fill="#64748b" font-size="8px" text-anchor="middle">W</text>
                  <text x="160" y="112" fill="#64748b" font-size="8px" text-anchor="middle">T</text>
                  <text x="200" y="112" fill="#64748b" font-size="8px" text-anchor="middle">F</text>
                  <text x="240" y="112" fill="#64748b" font-size="8px" text-anchor="middle">S</text>
                  <text x="280" y="112" fill="#64748b" font-size="8px" text-anchor="middle">S</text>
                </svg>
              </div>
            ` : ''}

          </div>
        </div>

      </div>

      <!-- Live Quick Navigation Bar (navigates direct to operational screens) -->
      <div class="quick-nav-bar">
        <button class="quick-nav-btn" onclick="router.navigate('atd')"><span>🏥</span>Bed Board</button>
        <button class="quick-nav-btn" onclick="router.navigate('emergency')"><span>🚨</span>Emergency</button>
        <button class="quick-nav-btn" onclick="router.navigate('atd')"><span>🛏</span>IPD / ATD</button>
        <button class="quick-nav-btn" onclick="router.navigate('billing')"><span>💰</span>Billing</button>
        <button class="quick-nav-btn" onclick="router.navigate('insurance')"><span>🛡</span>Insurance</button>
        <button class="quick-nav-btn" onclick="router.navigate('lab')"><span>🔬</span>Lab (LIS)</button>
        <button class="quick-nav-btn" onclick="router.navigate('rad')"><span>🩻</span>Radiology</button>
        <button class="quick-nav-btn" onclick="router.navigate('pharmacy')"><span>💊</span>Pharmacy</button>
        <button class="quick-nav-btn" onclick="router.navigate('ot')"><span>⚕</span>OT Schedule</button>
        <button class="quick-nav-btn" onclick="router.navigate('hospMgmt')"><span>📊</span>Daily Census</button>
        <button class="quick-nav-btn" onclick="router.navigate('hospMgmt')"><span>✅</span>Mgmt Roster</button>
      </div>

    </div>
  `;
}
"""

dashboard_content += exec_dashboard_js

with open(dashboard_path, "w", encoding="utf-8") as f:
    f.write(dashboard_content)
print("SUCCESS: dashboardView.js updated and renderExecutiveDashboard appended!")
