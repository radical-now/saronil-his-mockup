/* ==========================================================================
   SARONIL HMS - DIET & NUTRITION CLINICAL SUITE (dietView.js)
   ========================================================================== */

window.views.diet = function(container, subAnchor, params) {
  // Initialize state if not present
  initializeDietState();

  // Load active tab and role
  let activeRole = localStorage.getItem('saronil_diet_role') || 'Dietitian';
  let activeTab = localStorage.getItem('saronil_diet_tab') || 'dashboard';

  // Render overall layout
  renderDietLayout(container, activeTab, activeRole);
};

function initializeDietState() {
  if (window.state.dietData) return;

  // Seed sample database
  window.state.dietData = {
    patients: [
      { name: "Rajesh Kumar", uhid: "SH-2026-04821", bed: "GW(M)-409", diagnosis: "Post THR", dietRx: "High protein · 1800 kcal", lastReview: "22 Jun", status: "Refusal", energy: 1800, protein: 70, fluid: 2000, route: "Oral", prepBy: "Ananya R.", preferences: "Non-veg", allergies: "Penicillin", mealStats: { breakfast: "100%", lunch: "0%", dinner: "0%" } },
      { name: "Sunita Sharma", uhid: "SH-2026-04817", bed: "ICU-03", diagnosis: "Sepsis", dietRx: "Tube feed · Nutren 1.0", lastReview: "23 Jun", status: "GRV high", energy: 1200, protein: 48, fluid: 1500, route: "NG Tube", prepBy: "Dr. Mehta", preferences: "Veg", allergies: "None", tubeFeed: { formula: "Nutren 1.0", rate: 60, targetRate: 60, lastGRV: "320ml", lastGRVTime: "14:00", status: "Held", logs: [{ shift: "Morning", time: "08:00", rate: 60, vol: 240, grv: 35, tolerance: "OK", notes: "" }, { shift: "Afternoon", time: "14:00", rate: 60, vol: 240, grv: 320, tolerance: "HOLD", notes: "Informed Dr. Mehta + Dietitian. Feed held per order." }] } },
      { name: "Priya Menon", uhid: "SH-2026-04803", bed: "PVT-201", diagnosis: "T2DM · CKD III", dietRx: "Renal diabetic · 1600 kcal", lastReview: "20 Jun", status: "Overdue", energy: 1600, protein: 55, fluid: 1500, route: "Oral", prepBy: "Ananya R.", preferences: "Veg", allergies: "None", mealStats: { breakfast: "100%", lunch: "75%", dinner: "100%" } },
      { name: "Arun Pillai", uhid: "SH-2026-04788", bed: "ICU-05", diagnosis: "Post Whipple", dietRx: "TPN", lastReview: "24 Jun", status: "Active", energy: 1600, protein: 80, fluid: 1800, route: "Central Line", prepBy: "Dr. Srinivasan", preferences: "Veg", allergies: "None", tpn: { dextrose: 200, amino: 80, lipid: 50, vol: 1800, osmolality: 950, na: 75, k: 40, po4: 15, mg: 8, ca: 4, vitamins: true, insulin: 0, refeedingRisk: true, logs: [{ day: 1, bg0600: 142, bg1200: 168, bg1800: 182, bg0000: 156, k: 3.8, na: 138, po4: 0.8, tg: 1.8, wt: 62 }, { day: 2, bg0600: 138, bg1200: 145, bg1800: 152, bg0000: 140, k: 4.0, na: 136, po4: 1.1, tg: 1.9, wt: 62.5 }, { day: 3, bg0600: 132, bg1200: 138, bg1800: 140, bg0000: 135, k: 4.2, na: 137, po4: 1.4, tg: 2.1, wt: 62 }] } },
      { name: "Mohammed Iqbal", uhid: "SH-2026-04799", bed: "GW(M)-412", diagnosis: "Liver cirrhosis", dietRx: "Soft · Low fat", lastReview: "24 Jun", status: "Pending Assess", energy: 1800, protein: 70, fluid: 1200, route: "Oral", prepBy: "Ananya R.", preferences: "Veg", allergies: "None", mealStats: { breakfast: "75%", lunch: "50%", dinner: "50%" } }
    ],
    screeningQueue: [
      { name: "Mohammed Iqbal", uhid: "SH-2026-04799", bed: "GW(M)-412", admitted: "24 Jun · 10:15", diagnosis: "Liver cirrhosis", riskFlags: "BMI low" },
      { name: "Lakshmi Devi", uhid: "SH-2026-04801", bed: "GW(F)-208", admitted: "24 Jun · 09:30", diagnosis: "Ca Cervix", riskFlags: "Chemo" }
    ],
    counsellingQueue: [
      { name: "Rajesh Kumar", uhid: "SH-2026-04821", diagnosis: "Post THR", dischargeDate: "26 Jun", status: "Not done" },
      { name: "Kavitha Nair", uhid: "SH-2026-04822", diagnosis: "Gestational DM", dischargeDate: "25 Jun", status: "Not done" },
      { name: "Priya Menon", uhid: "SH-2026-04803", diagnosis: "CKD + DM", dischargeDate: "27 Jun", status: "Done ✓ 24 Jun", counselDate: "24 Jun 2026", counselor: "Ananya R." }
    ],
    kitchenDispatches: [
      { meal: "Breakfast", ward: "GW(M)", dispatched: "07:55", receiver: "Nurse Kavitha", deliveryTime: "07:57" },
      { meal: "Breakfast", ward: "GW(F)", dispatched: "07:55", receiver: "Nurse Priya", deliveryTime: "07:58" },
      { meal: "Breakfast", ward: "ICU", dispatched: "07:50", receiver: "ICU Nurse", deliveryTime: "07:52" },
      { meal: "Lunch", ward: "GW(M)", dispatched: "12:55", receiver: "Nurse Kavitha", deliveryTime: "12:58" }
    ],
    activeNPOAlerts: [
      { name: "Deepak Verma", uhid: "SH-2026-04901", bed: "GW(M)-413", duration: "9.5 hrs", ivFluids: "No", status: "Warning Alert" }
    ],
    dietOrdersCount: 42
  };
}

function renderDietLayout(container, activeTab, activeRole) {
  const css = `
    <style>
      .diet-wrapper {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        text-align: left;
        font-family: 'Outfit', sans-serif;
      }
      .diet-tab-bar {
        display: flex;
        gap: 4px;
        background: var(--bg-base-elevated);
        padding: 4px;
        border-radius: 6px;
        border: 1px solid var(--border-color);
        flex-wrap: wrap;
      }
      .diet-tab-btn {
        background: transparent;
        border: none;
        padding: 6px 14px;
        font-size: 0.8rem;
        font-weight: 700;
        color: var(--text-muted);
        cursor: pointer;
        border-radius: 4px;
        transition: all 0.2s ease;
      }
      .diet-tab-btn.active {
        background: var(--primary);
        color: #fff;
      }
      .alert-strip-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 8px 12px;
        border-radius: 6px;
        font-size: 0.78rem;
        border-left: 4px solid;
        margin-bottom: 6px;
      }
      .alert-red {
        background: #fee2e2;
        color: #b91c1c;
        border-left-color: #ef4444;
      }
      .alert-amber {
        background: #fef3c7;
        color: #b45309;
        border-left-color: #f59e0b;
      }
      .kpi-card {
        background: var(--bg-surface);
        border: 1px solid var(--border-color);
        border-radius: 8px;
        padding: 12px;
        text-align: center;
        box-shadow: var(--shadow-sm);
        cursor: pointer;
      }
      .kpi-title {
        font-size: 0.68rem;
        font-weight: 700;
        color: var(--text-muted);
        text-transform: uppercase;
      }
      .kpi-value {
        font-size: 1.35rem;
        font-weight: 800;
        color: var(--primary);
        margin-top: 4px;
      }
    </style>
  `;

  // Render headers + tab switches
  container.innerHTML = css + `
    <div class="diet-wrapper">
      <!-- Header Row -->
      <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">
        <div>
          <h2 style="margin:0; font-family:var(--font-display); font-weight:800;">🍏 Diet &amp; Nutrition Clinical Module</h2>
          <p style="margin:2px 0 0 0; font-size:0.75rem; color:var(--text-muted);">JCI-Compliant Nutritional Screening (NRS-2002), TPN &amp; Enteral Feeding protocols, and Ward Meal Roster Audits</p>
        </div>
        <div style="display:flex; align-items:center; gap:8px;">
          <span style="font-size:0.75rem; font-weight:700; color:var(--text-secondary);">Active Role:</span>
          <select id="diet-role" class="form-select" style="width:160px; font-size:0.75rem; padding:4px 8px;" onchange="window.changeDietRole(this.value)">
            <option value="Dietitian" ${activeRole === 'Dietitian' ? 'selected' : ''}>Dietitian</option>
            <option value="Diet Technician" ${activeRole === 'Diet Technician' ? 'selected' : ''}>Diet Technician</option>
            <option value="Ward Doctor" ${activeRole === 'Ward Doctor' ? 'selected' : ''}>Ward Doctor</option>
            <option value="Ward Nurse" ${activeRole === 'Ward Nurse' ? 'selected' : ''}>Ward Nurse</option>
            <option value="Kitchen Staff" ${activeRole === 'Kitchen Staff' ? 'selected' : ''}>Kitchen Staff</option>
            <option value="Administrator" ${activeRole === 'Administrator' ? 'selected' : ''}>Administrator</option>
          </select>
        </div>
      </div>

      <!-- Tab bar -->
      <div class="diet-tab-bar">
        <button class="diet-tab-btn ${activeTab === 'dashboard' ? 'active' : ''}" onclick="window.switchDietTab('dashboard')">📊 Dashboard</button>
        <button class="diet-tab-btn ${activeTab === 'assessments' ? 'active' : ''}" onclick="window.switchDietTab('assessments')">🧑‍⚕️ Patient Assessments</button>
        <button class="diet-tab-btn ${activeTab === 'diet_orders' ? 'active' : ''}" onclick="window.switchDietTab('diet_orders')">🍽 Diet Orders</button>
        <button class="diet-tab-btn ${activeTab === 'tube_tpn' ? 'active' : ''}" onclick="window.switchDietTab('tube_tpn')">🧪 Tube Feed &amp; TPN</button>
        <button class="diet-tab-btn ${activeTab === 'ward_sheets' ? 'active' : ''}" onclick="window.switchDietTab('ward_sheets')">🏥 Ward Diet Sheets</button>
        <button class="diet-tab-btn ${activeTab === 'discharge' ? 'active' : ''}" onclick="window.switchDietTab('discharge')">📋 Counselling &amp; Discharge</button>
        <button class="diet-tab-btn ${activeTab === 'reports' ? 'active' : ''}" onclick="window.switchDietTab('reports')">📈 Reports</button>
      </div>

      <!-- Body Content -->
      <div id="diet-tab-content">
        <!-- Render Tab Content Dynamic -->
      </div>
    </div>
  `;

  const contentDiv = document.getElementById('diet-tab-content');
  if (activeTab === 'dashboard') {
    renderDashboardTab(contentDiv, activeRole);
  } else if (activeTab === 'assessments') {
    renderAssessmentsTab(contentDiv, activeRole);
  } else if (activeTab === 'diet_orders') {
    renderDietOrdersTab(contentDiv, activeRole);
  } else if (activeTab === 'tube_tpn') {
    renderTubeTPNTab(contentDiv, activeRole);
  } else if (activeTab === 'ward_sheets') {
    renderWardSheetsTab(contentDiv, activeRole);
  } else if (activeTab === 'discharge') {
    renderDischargeTab(contentDiv, activeRole);
  } else if (activeTab === 'reports') {
    renderReportsTab(contentDiv, activeRole);
  }
}

window.changeDietRole = function(role) {
  localStorage.setItem('saronil_diet_role', role);
  // Change default active tab based on role
  if (role === 'Kitchen Staff' || role === 'Diet Technician') {
    localStorage.setItem('saronil_diet_tab', 'ward_sheets');
  } else {
    localStorage.setItem('saronil_diet_tab', 'dashboard');
  }
  window.views.diet(document.getElementById('main-content'));
};

window.switchDietTab = function(tab) {
  localStorage.setItem('saronil_diet_tab', tab);
  window.views.diet(document.getElementById('main-content'));
};

// --------------------------------------------------------------------------
// TAB 1 — DASHBOARD
// --------------------------------------------------------------------------
function renderDashboardTab(container, role) {
  // 1A — Alert Strip
  const alertsHTML = `
    <div style="display:flex; flex-direction:column; gap:4px; margin-bottom:15px;">
      <div class="alert-strip-item alert-red">
        <span>🔴 <strong>Refusal streak:</strong> Rajesh Kumar · GW(M)-409 · Refused lunch &amp; dinner today in a row.</span>
        <button class="btn btn-primary btn-xs" onclick="window.switchDietTab('assessments'); setTimeout(() => window.launchDietitianAssessment('SH-2026-04821'), 50)">Review</button>
      </div>
      <div class="alert-strip-item alert-red">
        <span>🔴 <strong>GRV High:</strong> Sunita Sharma · ICU-03 · Residual 320ml at 14:00 (Feed held).</span>
        <button class="btn btn-primary btn-xs" onclick="window.switchDietTab('tube_tpn');">Review Log</button>
      </div>
      <div class="alert-strip-item alert-red">
        <span>🔴 <strong>NRS-2002 Risk:</strong> Mohammed Iqbal · GW(M)-412 · Screened today (NRS=3). Assessment pending.</span>
        <button class="btn btn-primary btn-xs" onclick="window.switchDietTab('assessments'); setTimeout(() => window.launchDietitianAssessment('SH-2026-04799'), 50)">Assess</button>
      </div>
      <div class="alert-strip-item alert-amber">
        <span>⚠️ <strong>TPN Monitoring:</strong> Arun Pillai · ICU-05 · Daily serum electrolytes not checked today.</span>
        <button class="btn btn-secondary btn-xs" style="background:#fff; color:#b45309;" onclick="window.switchDietTab('tube_tpn');">View Labs</button>
      </div>
      <div class="alert-strip-item alert-amber">
        <span>⚠️ <strong>Review Due:</strong> Priya Menon · PVT-201 · Last dietitian review 4 days ago.</span>
        <button class="btn btn-secondary btn-xs" style="background:#fff; color:#b45309;" onclick="window.switchDietTab('assessments');">Review</button>
      </div>
      <div class="alert-strip-item alert-amber">
        <span>⚠️ <strong>Discharge Today:</strong> Kavitha Nair · PVT-204 · Counselling record not filled.</span>
        <button class="btn btn-secondary btn-xs" style="background:#fff; color:#b45309;" onclick="window.switchDietTab('discharge');">Counsel</button>
      </div>
    </div>
  `;

  // 1B — Stat Cards
  const statsHTML = `
    <div style="display:grid; grid-template-columns:repeat(7, 1fr); gap:10px; margin-bottom:1.5rem;">
      <div class="kpi-card" onclick="window.switchDietTab('diet_orders')">
        <div class="kpi-title">Active Diets</div>
        <div class="kpi-value">${state.dietData.dietOrdersCount}</div>
      </div>
      <div class="kpi-card" onclick="window.switchDietTab('tube_tpn')">
        <div class="kpi-title">Tube Fed</div>
        <div class="kpi-value">2</div>
      </div>
      <div class="kpi-card" onclick="window.switchDietTab('tube_tpn')">
        <div class="kpi-title">TPN Cases</div>
        <div class="kpi-value">1</div>
      </div>
      <div class="kpi-card" onclick="window.switchDietTab('assessments')">
        <div class="kpi-title">NRS Risk (≥3)</div>
        <div class="kpi-value">3</div>
      </div>
      <div class="kpi-card" onclick="window.switchDietTab('assessments')">
        <div class="kpi-title">Assess Due</div>
        <div class="kpi-value">5</div>
      </div>
      <div class="kpi-card" onclick="window.switchDietTab('ward_sheets')">
        <div class="kpi-title">Refusals Today</div>
        <div class="kpi-value">2</div>
      </div>
      <div class="kpi-card" onclick="window.switchDietTab('discharge')">
        <div class="kpi-title">Counselling Pend</div>
        <div class="kpi-value">3</div>
      </div>
    </div>
  `;

  // 1C — My Patient List
  const patientsHTML = `
    <div class="card" style="margin-bottom:1.5rem;">
      <div class="card-header"><h3 class="card-title">👤 Dietitian Active Caseload List</h3></div>
      <div class="card-body">
        <table class="custom-table" style="font-size:0.8rem; width:100%;">
          <thead>
            <tr>
              <th>Patient</th>
              <th>UHID</th>
              <th>Bed</th>
              <th>Diagnosis</th>
              <th>Diet Rx</th>
              <th>Last Review</th>
              <th>Status</th>
              <th style="text-align:right;">Actions</th>
            </tr>
          </thead>
          <tbody>
            ${state.dietData.patients.map(p => {
              let badgeBg = 'var(--bg-slate-light)';
              let badgeColor = 'var(--text-secondary)';
              if (p.status.includes('Refusal') || p.status.includes('GRV')) {
                badgeBg = '#fee2e2'; badgeColor = '#dc2626';
              } else if (p.status.includes('Overdue') || p.status.includes('Assess')) {
                badgeBg = '#fef3c7'; badgeColor = '#d97706';
              }
              return `
                <tr style="border-bottom:1px solid var(--border-color);">
                  <td><strong>${p.name}</strong></td>
                  <td class="mono">${p.uhid}</td>
                  <td>${p.bed}</td>
                  <td>${p.diagnosis}</td>
                  <td><span style="color:var(--primary); font-weight:700;">${p.dietRx}</span></td>
                  <td>${p.lastReview}</td>
                  <td><span class="badge" style="background:${badgeBg}; color:${badgeColor}; font-size:0.7rem;">${p.status}</span></td>
                  <td style="text-align:right;">
                    ${p.status.includes('Assess') ? 
                      `<button class="btn btn-primary btn-xs" onclick="window.switchDietTab('assessments'); setTimeout(() => window.launchDietitianAssessment('${p.uhid}'), 50)">Assess</button>` : 
                      `<button class="btn btn-secondary btn-xs" onclick="window.switchDietTab('assessments'); setTimeout(() => window.launchDietitianAssessment('${p.uhid}'), 50)">Review</button>`
                    }
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;

  // 1D — Screening Queue
  const screeningHTML = `
    <div class="card">
      <div class="card-header"><h3 class="card-title">📝 24h Admission Nutritional Screening Queue (NRS-2002)</h3></div>
      <div class="card-body">
        <table class="custom-table" style="font-size:0.8rem; width:100%;">
          <thead>
            <tr>
              <th>Patient</th>
              <th>UHID</th>
              <th>Bed</th>
              <th>Admitted</th>
              <th>Diagnosis</th>
              <th>Risk Flags</th>
              <th style="text-align:right;">Action</th>
            </tr>
          </thead>
          <tbody>
            ${state.dietData.screeningQueue.map(s => `
              <tr style="border-bottom:1px solid var(--border-color);">
                <td><strong>${s.name}</strong></td>
                <td class="mono">${s.uhid}</td>
                <td>${s.bed}</td>
                <td>${s.admitted}</td>
                <td>${s.diagnosis}</td>
                <td><span class="badge badge-danger" style="font-size:0.7rem;">${s.riskFlags}</span></td>
                <td style="text-align:right;">
                  <button class="btn btn-primary btn-xs" onclick="window.switchDietTab('assessments'); setTimeout(() => window.launchNRS2002('${s.uhid}'), 50)">Screen Now</button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;

  container.innerHTML = `
    <div style="display:flex; flex-direction:column; gap:12px;">
      ${alertsHTML}
      ${statsHTML}
      ${patientsHTML}
      ${screeningHTML}
    </div>
  `;
}

// --------------------------------------------------------------------------
// TAB 2 — PATIENT ASSESSMENTS
// --------------------------------------------------------------------------
function renderAssessmentsTab(container, role) {
  container.innerHTML = `
    <div style="display:grid; grid-template-columns:300px 1fr; gap:1.25rem; align-items:start; text-align:left;">
      <!-- Screening & Assessment Left Selector Queue -->
      <div class="card">
        <div class="card-header"><h3 class="card-title" style="font-size:0.85rem;">Clinical Intake Referrals</h3></div>
        <div style="padding:10px; display:flex; flex-direction:column; gap:6px; max-height:600px; overflow-y:auto;">
          <div style="font-size:0.7rem; font-weight:700; color:var(--text-muted); text-transform:uppercase; margin-bottom:4px;">Pending Screenings</div>
          ${state.dietData.screeningQueue.map(s => `
            <div onclick="window.launchNRS2002('${s.uhid}')" style="background:var(--bg-slate-light); border:1px solid var(--border-color); padding:8px; border-radius:6px; cursor:pointer; font-size:0.75rem;">
              <div style="font-weight:700; color:var(--text-primary);">${s.name}</div>
              <div style="color:var(--text-muted); font-size:0.65rem;">Bed: ${s.bed} · UHID: ${s.uhid}</div>
            </div>
          `).join('')}
          
          <div style="font-size:0.7rem; font-weight:700; color:var(--text-muted); text-transform:uppercase; margin:10px 0 4px 0;">Referrals / Caseload</div>
          ${state.dietData.patients.map(p => `
            <div onclick="window.launchDietitianAssessment('${p.uhid}')" style="background:var(--bg-surface); border:1px solid var(--border-color); padding:8px; border-radius:6px; cursor:pointer; font-size:0.75rem; display:flex; justify-content:space-between; align-items:center;">
              <div>
                <div style="font-weight:700; color:var(--text-primary);">${p.name}</div>
                <div style="color:var(--text-muted); font-size:0.65rem;">Rx: ${p.dietRx}</div>
              </div>
              <span class="badge" style="font-size:8px; background:${p.status === 'Refusal' ? '#fee2e2' : '#eff6ff'}; color:${p.status === 'Refusal' ? '#b91c1c' : '#1e40af'};">${p.status}</span>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Action Panel Viewport -->
      <div id="assessment-details-viewport">
        <div class="card" style="padding:40px; text-align:center; color:var(--text-muted); font-size:0.85rem;">
          Select a patient from the left column to launch JCI NRS-2002 screening or detailed Dietitian assessment.
        </div>
      </div>
    </div>
  `;
}

window.launchNRS2002 = function(uhid) {
  const patient = state.patients.find(p => p.uhid === uhid) || state.dietData.screeningQueue.find(s => s.uhid === uhid) || state.dietData.patients.find(p => p.uhid === uhid);
  const viewport = document.getElementById('assessment-details-viewport');
  if (!viewport || !patient) return;

  viewport.innerHTML = `
    <div class="card">
      <div class="card-header" style="background:var(--primary); color:#fff; padding:12px 15px;">
        <h3 class="card-title" style="margin:0; font-size:0.95rem; color:#fff;">📋 NUTRITIONAL RISK SCREENING &mdash; NRS-2002</h3>
      </div>
      <form id="nrs-form" onsubmit="window.saveNRS2002(event, '${patient.uhid}')" style="padding:15px; display:flex; flex-direction:column; gap:12px; font-size:0.8rem;">
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; border-bottom:1px solid var(--border-color); padding-bottom:8px;">
          <div><strong>Patient:</strong> ${patient.name}</div>
          <div><strong>UHID:</strong> <span class="mono">${patient.uhid}</span></div>
          <div><strong>Admitted:</strong> 24 Jun · 10:15</div>
          <div><strong>Diagnosis:</strong> ${patient.clinicalData ? patient.clinicalData.diagnosis : 'Clinicals'}</div>
        </div>

        <div>
          <h4 style="margin:0 0 6px 0; font-size:0.8rem; font-weight:700; color:var(--primary);">1. NUTRITIONAL STATUS IMPAIRMENT (Score 0-3)</h4>
          <div style="display:flex; flex-direction:column; gap:4px;">
            <label style="display:flex; align-items:center; gap:6px;">
              <input type="radio" name="nrs-status" value="0" checked onchange="window.recalcNRS()"> Score 0 &mdash; Normal nutritional status
            </label>
            <label style="display:flex; align-items:center; gap:6px;">
              <input type="radio" name="nrs-status" value="1" onchange="window.recalcNRS()"> Score 1 &mdash; Weight loss &gt;5% in 3 months OR food intake &lt;75% last week
            </label>
            <label style="display:flex; align-items:center; gap:6px;">
              <input type="radio" name="nrs-status" value="2" onchange="window.recalcNRS()"> Score 2 &mdash; Weight loss &gt;5% in 2 months OR BMI 18.5&ndash;20.5 + intake reduced 25-50%
            </label>
            <label style="display:flex; align-items:center; gap:6px;">
              <input type="radio" name="nrs-status" value="3" onchange="window.recalcNRS()"> Score 3 &mdash; Weight loss &gt;5% in 1 month OR BMI &lt;18.5 + intake reduced &gt;50%
            </label>
          </div>
        </div>

        <div>
          <h4 style="margin:0 0 6px 0; font-size:0.8rem; font-weight:700; color:var(--primary);">2. SEVERITY OF DISEASE / STRESS FACTOR (Score 0-3)</h4>
          <div style="display:flex; flex-direction:column; gap:4px;">
            <label style="display:flex; align-items:center; gap:6px;">
              <input type="radio" name="nrs-severity" value="0" checked onchange="window.recalcNRS()"> Score 0 &mdash; Normal requirements
            </label>
            <label style="display:flex; align-items:center; gap:6px;">
              <input type="radio" name="nrs-severity" value="1" onchange="window.recalcNRS()"> Score 1 &mdash; Hip fracture, chronic complications (liver/renal), chronic disease
            </label>
            <label style="display:flex; align-items:center; gap:6px;">
              <input type="radio" name="nrs-severity" value="2" onchange="window.recalcNRS()"> Score 2 &mdash; Major abdominal surgery, stroke, pneumonia, active malignancy
            </label>
            <label style="display:flex; align-items:center; gap:6px;">
              <input type="radio" name="nrs-severity" value="3" onchange="window.recalcNRS()"> Score 3 &mdash; Head injury, bone marrow transplant, ICU (APACHE &gt; 10)
            </label>
          </div>
        </div>

        <div style="background:var(--bg-slate-light); padding:10px; border-radius:6px; display:flex; justify-content:space-between; align-items:center;">
          <label style="display:flex; align-items:center; gap:6px; font-weight:700; margin:0;">
            <input type="checkbox" id="nrs-age-factor" onchange="window.recalcNRS()"> Age &ge; 70 years (+1 point)
          </label>
          <div style="text-align:right;">
            <span style="font-weight:700; font-size:0.75rem;">Total NRS-2002 Score:</span>
            <span id="nrs-score-total" style="font-size:1.15rem; font-weight:800; color:#dc2626; margin-left:4px;">0</span>
          </div>
        </div>

        <div id="nrs-recommendation" style="background:#d1fae5; color:#065f46; padding:8px; border-radius:4px; font-weight:700;">
          💡 NRS Score &lt; 3 &mdash; Low Risk. Auto-schedule weekly rescreen.
        </div>

        <div style="display:flex; justify-content:flex-end; gap:8px; border-top:1px solid var(--border-color); padding-top:10px; margin-top:8px;">
          <button type="submit" class="btn btn-primary">Save Screening</button>
        </div>
      </form>
    </div>
  `;

  window.recalcNRS = function() {
    const status = parseInt(document.querySelector('input[name="nrs-status"]:checked').value) || 0;
    const severity = parseInt(document.querySelector('input[name="nrs-severity"]:checked').value) || 0;
    const ageFactor = document.getElementById('nrs-age-factor').checked ? 1 : 0;
    const total = status + severity + ageFactor;

    document.getElementById('nrs-score-total').textContent = total;
    const recBox = document.getElementById('nrs-recommendation');
    if (total >= 3) {
      recBox.style.background = '#fee2e2';
      recBox.style.color = '#991b1b';
      recBox.innerHTML = `🚨 NRS Score &ge; 3 &mdash; NUTRITIONAL RISK DETECTED. Auto-referral sent to Dietitian.`;
    } else {
      recBox.style.background = '#d1fae5';
      recBox.style.color = '#065f46';
      recBox.innerHTML = `💡 NRS Score &lt; 3 &mdash; Low Risk. Auto-schedule weekly rescreen.`;
    }
  };
  window.recalcNRS();
};

window.saveNRS2002 = function(event, uhid) {
  event.preventDefault();
  const status = parseInt(document.querySelector('input[name="nrs-status"]:checked').value) || 0;
  const severity = parseInt(document.querySelector('input[name="nrs-severity"]:checked').value) || 0;
  const ageFactor = document.getElementById('nrs-age-factor').checked ? 1 : 0;
  const total = status + severity + ageFactor;

  // Update screening queue
  const idx = state.dietData.screeningQueue.findIndex(s => s.uhid === uhid);
  if (idx !== -1) {
    const screenedPatient = state.dietData.screeningQueue.splice(idx, 1)[0];
    if (total >= 3) {
      // Add to referrals / active caseload
      state.dietData.patients.push({
        name: screenedPatient.name,
        uhid: screenedPatient.uhid,
        bed: screenedPatient.bed,
        diagnosis: screenedPatient.diagnosis,
        dietRx: "Assessment Pending",
        lastReview: "Today",
        status: "Pending Assess",
        energy: 1800, protein: 70, fluid: 1500, route: "Oral",
        prepBy: "Pending",
        preferences: "Veg",
        allergies: "None",
        mealStats: { breakfast: "—", lunch: "—", dinner: "—" }
      });
    }
  }

  alert(`NRS-2002 screening saved successfully for patient ${uhid}. Score: ${total}.`);
  // Re-render
  window.switchDietTab('assessments');
};

window.launchDietitianAssessment = function(uhid) {
  const patient = state.patients.find(p => p.uhid === uhid) || state.dietData.patients.find(p => p.uhid === uhid);
  const viewport = document.getElementById('assessment-details-viewport');
  if (!viewport || !patient) return;

  viewport.innerHTML = `
    <div class="card" style="text-align:left;">
      <div class="card-header" style="background:var(--primary); color:#fff; padding:10px 15px; display:flex; justify-content:space-between; align-items:center;">
        <h3 class="card-title" style="margin:0; font-size:0.95rem; color:#fff;">🍏 DIETITIAN NUTRITIONAL ASSESSMENT</h3>
        <span style="font-size:0.7rem; background:rgba(255,255,255,0.15); padding:2px 6px; border-radius:4px;">UHID: ${patient.uhid}</span>
      </div>
      <form id="assessment-form" onsubmit="window.saveNutritionalAssessment(event, '${patient.uhid}')" style="padding:15px; display:flex; flex-direction:column; gap:12px; font-size:0.8rem; max-height:70vh; overflow-y:auto;">
        <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:12px; background:var(--bg-slate-light); padding:10px; border-radius:6px; font-weight:700;">
          <div>Patient: ${patient.name}</div>
          <div>Bed: ${patient.bed || 'Ward'}</div>
          <div>Diagnosis: ${patient.diagnosis || 'Post Surgery'}</div>
        </div>

        <div style="font-weight:800; color:var(--primary); border-bottom:1px solid var(--border-color); padding-bottom:2px;">─── ANTHROPOMETRY ───────────────────────────────────────────</div>
        <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:12px;">
          <div class="form-group">
            <label style="font-weight:700;">Weight (kg)</label>
            <input type="number" id="ass-weight" class="form-control" value="62" oninput="window.calcAssBMI()">
          </div>
          <div class="form-group">
            <label style="font-weight:700;">Height (cm)</label>
            <input type="number" id="ass-height" class="form-control" value="170" oninput="window.calcAssBMI()">
          </div>
          <div class="form-group">
            <label style="font-weight:700;">BMI (kg/m²)</label>
            <input type="text" id="ass-bmi" class="form-control" readonly style="background:#f1f5f9;">
          </div>
        </div>
        <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:12px;">
          <div class="form-group">
            <label style="font-weight:700;">Usual Body Wt (kg)</label>
            <input type="number" id="ass-usual-wt" class="form-control" value="65" oninput="window.calcAssBMI()">
          </div>
          <div class="form-group">
            <label style="font-weight:700;">% Usual Weight</label>
            <input type="text" id="ass-pct-ubw" class="form-control" readonly style="background:#f1f5f9;">
          </div>
          <div class="form-group">
            <label style="font-weight:700;">Edema Present</label>
            <select id="ass-edema" class="form-select">
              <option value="No">No</option>
              <option value="Yes">Yes (+1)</option>
            </select>
          </div>
        </div>

        <div style="font-weight:800; color:var(--primary); border-bottom:1px solid var(--border-color); padding-bottom:2px;">─── BIOCHEMISTRY (Auto-pulled) ──────────────────────────────</div>
        <div style="display:grid; grid-template-columns:repeat(4, 1fr); gap:8px; font-size:0.75rem;">
          <div>Albumin: <strong style="color:var(--color-danger);">2.9 g/dL ⚠</strong></div>
          <div>Prealbumin: <strong>16 mg/dL</strong></div>
          <div>Hb: <strong style="color:var(--color-danger);">10.2 g/dL ⚠</strong></div>
          <div>Phosphate: <strong>3.4 mg/dL</strong></div>
          <div>Potassium: <strong>4.1 mEq/L</strong></div>
          <div>Sodium: <strong>139 mEq/L</strong></div>
          <div>BUN: <strong>18 mg/dL</strong></div>
          <div>Creatinine: <strong>0.9 mg/dL</strong></div>
        </div>

        <div style="font-weight:800; color:var(--primary); border-bottom:1px solid var(--border-color); padding-bottom:2px;">─── DIETARY HISTORY &amp; GI ────────────────────────────────────</div>
        <div class="form-group">
          <label style="font-weight:700;">24-hr dietary recall / intake pattern</label>
          <input type="text" id="ass-recall" class="form-control" value="Intake <50% of home dietary baseline for last 4 days due to nausea.">
        </div>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
          <div class="form-group">
            <label style="font-weight:700;">Appetite Status</label>
            <select id="ass-appetite" class="form-select">
              <option value="Good">Good</option>
              <option value="Reduced">Reduced</option>
              <option value="Poor" selected>Poor</option>
              <option value="None">None</option>
            </select>
          </div>
          <div class="form-group">
            <label style="font-weight:700;">Food Preferences</label>
            <select id="ass-pref" class="form-select">
              <option value="Veg">Vegetarian</option>
              <option value="Non-veg">Non-Vegetarian</option>
              <option value="Jain">Jain diet</option>
            </select>
          </div>
        </div>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
          <label style="display:flex; align-items:center; gap:6px; margin:0;"><input type="checkbox" id="ass-chewing"> Chewing difficulty / Poor dentition</label>
          <label style="display:flex; align-items:center; gap:6px; margin:0;"><input type="checkbox" id="ass-swallowing"> Swallowing difficulty (Dysphagia precaution)</label>
        </div>

        <div style="font-weight:800; color:var(--primary); border-bottom:1px solid var(--border-color); padding-bottom:2px;">─── REQUIREMENTS CALCULATION ────────────────────────────────</div>
        <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:12px;">
          <div class="form-group">
            <label style="font-weight:700;">Target Energy (kcal/day)</label>
            <input type="number" id="ass-energy" class="form-control" value="1800">
          </div>
          <div class="form-group">
            <label style="font-weight:700;">Target Protein (g/day)</label>
            <input type="number" id="ass-protein" class="form-control" value="70">
          </div>
          <div class="form-group">
            <label style="font-weight:700;">Target Fluid (ml/day)</label>
            <input type="number" id="ass-fluid" class="form-control" value="1500">
          </div>
        </div>

        <div style="font-weight:800; color:var(--primary); border-bottom:1px solid var(--border-color); padding-bottom:2px;">─── DIAGNOSIS &amp; PLAN ────────────────────────────────────────</div>
        <div class="form-group">
          <label style="font-weight:700;">Nutrition Diagnosis</label>
          <select id="ass-diagnosis" class="form-select">
            <option value="Moderate Malnutrition">Moderate Malnutrition &amp; Deficit</option>
            <option value="Severe Malnutrition">Severe Malnutrition</option>
            <option value="Protein-energy deficit" selected>Protein-energy deficit</option>
            <option value="At nutritional risk">At nutritional risk</option>
          </select>
        </div>
        <div class="form-group">
          <label style="font-weight:700;">Clinical Goal Description</label>
          <input type="text" id="ass-goal" class="form-control" value="Achieve 80% energy target by Day 3. Optimise protein for wound healing.">
        </div>

        <div style="display:flex; justify-content:flex-end; gap:8px; border-top:1px solid var(--border-color); padding-top:10px; margin-top:8px;">
          <button type="button" class="btn btn-secondary btn-sm" onclick="window.switchDietTab('assessments')">Cancel</button>
          <button type="submit" class="btn btn-primary btn-sm">Proceed to Diet Prescription →</button>
        </div>
      </form>
    </div>
  `;

  window.calcAssBMI = function() {
    const wt = parseFloat(document.getElementById('ass-weight').value) || 0;
    const ht = parseFloat(document.getElementById('ass-height').value) || 1;
    const usual = parseFloat(document.getElementById('ass-usual-wt').value) || 1;
    
    const bmi = wt / ((ht/100) * (ht/100));
    const ubw = (wt / usual) * 100;

    document.getElementById('ass-bmi').value = bmi.toFixed(1);
    document.getElementById('ass-pct-ubw').value = ubw.toFixed(1) + '%';
  };
  window.calcAssBMI();
};

window.saveNutritionalAssessment = function(event, uhid) {
  event.preventDefault();
  const energy = document.getElementById('ass-energy').value;
  const protein = document.getElementById('ass-protein').value;
  const fluid = document.getElementById('ass-fluid').value;
  const pref = document.getElementById('ass-pref').value;

  // Open Diet Prescription (Tab 2C) automatically
  window.launchDietPrescription(uhid, energy, protein, fluid, pref);
};

window.launchDietPrescription = function(uhid, energy, protein, fluid, pref) {
  const patient = state.patients.find(p => p.uhid === uhid) || state.dietData.patients.find(p => p.uhid === uhid);
  const viewport = document.getElementById('assessment-details-viewport');
  if (!viewport || !patient) return;

  viewport.innerHTML = `
    <div class="card" style="text-align:left;">
      <div class="card-header" style="background:var(--primary); color:#fff; padding:10px 15px;">
        <h3 class="card-title" style="margin:0; font-size:0.95rem; color:#fff;">🍏 DIET PRESCRIPTION &mdash; ${patient.name}</h3>
      </div>
      <form id="presc-form" onsubmit="window.saveDietPrescription(event, '${patient.uhid}')" style="padding:15px; display:flex; flex-direction:column; gap:12px; font-size:0.8rem; max-height:70vh; overflow-y:auto;">
        <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:12px; background:var(--bg-slate-light); padding:8px; border-radius:6px; font-weight:700;">
          <div>Energy: ${energy} kcal/day</div>
          <div>Protein: ${protein} g/day</div>
          <div>Fluid Limit: ${fluid} ml/day</div>
        </div>

        <h4 style="margin:0; font-weight:700; color:var(--primary);">Meal Schedule &amp; Portion Breakdown</h4>
        <div style="display:flex; flex-direction:column; gap:6px;">
          <div style="display:grid; grid-template-columns:80px 1fr; gap:8px; align-items:center;">
            <strong>06:30</strong>
            <input type="text" id="meal-0630" class="form-control" style="font-size:0.75rem;" value="Warm lemon water (no sugar)">
          </div>
          <div style="display:grid; grid-template-columns:80px 1fr; gap:8px; align-items:center;">
            <strong>08:00</strong>
            <input type="text" id="meal-0800" class="form-control" style="font-size:0.75rem;" value="Breakfast: 2 idli + sambar (low salt) + 1 cup skimmed milk">
          </div>
          <div style="display:grid; grid-template-columns:80px 1fr; gap:8px; align-items:center;">
            <strong>10:30</strong>
            <input type="text" id="meal-1030" class="form-control" style="font-size:0.75rem;" value="Mid-morning: banana (1 medium)">
          </div>
          <div style="display:grid; grid-template-columns:80px 1fr; gap:8px; align-items:center;">
            <strong>13:00</strong>
            <input type="text" id="meal-1300" class="form-control" style="font-size:0.75rem;" value="Lunch: 2 roti + 1 cup dal (low salt) + sabzi + small curd">
          </div>
          <div style="display:grid; grid-template-columns:80px 1fr; gap:8px; align-items:center;">
            <strong>16:30</strong>
            <input type="text" id="meal-1630" class="form-control" style="font-size:0.75rem;" value="Snack: roasted chana 30g">
          </div>
          <div style="display:grid; grid-template-columns:80px 1fr; gap:8px; align-items:center;">
            <strong>19:30</strong>
            <input type="text" id="meal-1930" class="form-control" style="font-size:0.75rem;" value="Dinner: 2 roti + sabzi + dal + 1 cup curd">
          </div>
          <div style="display:grid; grid-template-columns:80px 1fr; gap:8px; align-items:center;">
            <strong>21:00</strong>
            <input type="text" id="meal-2100" class="form-control" style="font-size:0.75rem;" value="Bedtime: warm milk (low fat, no sugar)">
          </div>
        </div>

        <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-top:8px;">
          <div class="form-group">
            <label style="font-weight:700;">Diet Class</label>
            <select id="presc-class" class="form-select" style="font-size:0.75rem;">
              <option value="Soft diet">Soft Diet</option>
              <option value="Liquid diet (clear)">Clear Liquid Diet</option>
              <option value="Diabetic diet">Diabetic Diet</option>
              <option value="Low salt (<2g/day)" selected>Low Salt (<2g/day)</option>
              <option value="Renal diet">Renal Diet</option>
            </select>
          </div>
          <div class="form-group">
            <label style="font-weight:700;">Texture Consistency</label>
            <select id="presc-texture" class="form-select" style="font-size:0.75rem;">
              <option value="Normal">Normal Consistency</option>
              <option value="IDDSI Level 6" selected>IDDSI Level 6 (Soft &amp; bite-sized)</option>
              <option value="IDDSI Level 4">IDDSI Level 4 (Pureed)</option>
            </select>
          </div>
        </div>

        <div style="font-weight:700; margin-top:8px;">Supplements Ordered</div>
        <div style="display:flex; flex-direction:column; gap:4px;">
          <label style="display:flex; align-items:center; gap:6px;"><input type="checkbox" id="supp-protinex" checked> Protinex 2 scoops in 150ml water &mdash; OD post-lunch</label>
          <label style="display:flex; align-items:center; gap:6px;"><input type="checkbox" id="supp-vitd" checked> Vitamin D 60,000 IU &mdash; weekly &times; 8 doses</label>
          <label style="display:flex; align-items:center; gap:6px;"><input type="checkbox" id="supp-zinc" checked> Zinc sulphate 50mg &mdash; OD &times; 4 weeks</label>
        </div>

        <div style="display:flex; justify-content:flex-end; gap:8px; border-top:1px solid var(--border-color); padding-top:10px; margin-top:10px;">
          <button type="button" class="btn btn-secondary btn-sm" onclick="window.switchDietTab('assessments')">Cancel</button>
          <button type="submit" class="btn btn-primary btn-sm">Send to Kitchen &amp; Pharmacy →</button>
        </div>
      </form>
    </div>
  `;
};

window.saveDietPrescription = function(event, uhid) {
  event.preventDefault();
  const dClass = document.getElementById('presc-class').value;
  const texture = document.getElementById('presc-texture').value;

  // Add prescription to patient active state
  const p = state.dietData.patients.find(pt => pt.uhid === uhid);
  if (p) {
    p.dietRx = `${dClass} (${texture})`;
    p.status = "Active";
  }

  // Cross-module trigger supplement orders to pharmacy
  const supps = [];
  if (document.getElementById('supp-protinex').checked) supps.push("Protinex");
  if (document.getElementById('supp-vitd').checked) supps.push("Vitamin D");
  if (document.getElementById('supp-zinc').checked) supps.push("Zinc Sulphate");

  if (supps.length && state.prescriptions) {
    state.prescriptions.push({
      id: "RX-D-" + Math.floor(Math.random()*1000),
      uhid: uhid,
      patientName: p ? p.name : "Patient",
      date: "Today",
      doctorName: "Ananya R. (Dietitian)",
      status: "Unfulfilled",
      medications: supps.map(s => ({ name: s, dosage: "As advised", route: "Oral", duration: "Standard" }))
    });
  }

  alert(`Diet Prescription saved successfully. Kitchen notified and ${supps.length} supplement prescriptions queued to Pharmacy.`);
  window.switchDietTab('dashboard');
};

// --------------------------------------------------------------------------
// TAB 3 — DIET ORDERS
// --------------------------------------------------------------------------
function renderDietOrdersTab(container, role) {
  const isDoc = (role === 'Ward Doctor' || role === 'Dietitian' || role === 'Administrator');

  container.innerHTML = `
    <div style="display:flex; flex-direction:column; gap:1.25rem; text-align:left;">
      <!-- Active Roster and Quick order forms -->
      <div style="display:grid; grid-template-columns:1.5fr 1fr; gap:1.25rem;">
        
        <!-- Roster list -->
        <div class="card">
          <div class="card-header"><h3 class="card-title">🍽️ Active Ward Diet Orders</h3></div>
          <div class="card-body">
            <table class="custom-table" style="font-size:0.8rem; width:100%;">
              <thead>
                <tr>
                  <th>Patient</th>
                  <th>Bed</th>
                  <th>Diet Rx</th>
                  <th>Route</th>
                  <th>Allergies</th>
                  <th>Pref</th>
                  <th>Status</th>
                  <th style="text-align:right;">Action</th>
                </tr>
              </thead>
              <tbody>
                ${state.dietData.patients.map(p => `
                  <tr style="border-bottom:1px solid var(--border-color);">
                    <td><strong>${p.name}</strong><br><span style="font-size:0.65rem; color:var(--text-muted);">${p.uhid}</span></td>
                    <td>${p.bed}</td>
                    <td><strong style="color:var(--primary);">${p.dietRx}</strong></td>
                    <td>${p.route}</td>
                    <td><span style="color:${p.allergies !== 'None' ? '#dc2626' : 'inherit'}; font-weight:${p.allergies !== 'None' ? 'bold' : 'normal'};">${p.allergies}</span></td>
                    <td>${p.preferences}</td>
                    <td><span class="badge badge-success" style="font-size:8px;">${p.status}</span></td>
                    <td style="text-align:right;">
                      <button class="btn btn-secondary btn-xs" onclick="window.editDietOrder('${p.uhid}')">Edit</button>
                      <button class="btn btn-secondary btn-xs" style="color:#b91c1c; border-color:#fee2e2;" onclick="window.suspendDietOrder('${p.uhid}')">Suspend</button>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>

        <!-- Forms Side -->
        <div style="display:flex; flex-direction:column; gap:12px;">
          <!-- Quick Order -->
          <div class="card">
            <div class="card-header"><h3 class="card-title" style="font-size:0.85rem;">🏥 Doctor Quick-Order Diet</h3></div>
            <form onsubmit="window.submitQuickOrder(event)" style="padding:15px; display:flex; flex-direction:column; gap:10px; font-size:0.75rem;">
              <div class="form-group">
                <label style="font-weight:700;">Select Admitted Patient</label>
                <select id="qo-uhid" class="form-select" style="font-size:0.75rem;">
                  ${state.patients.filter(p => p.status === 'Admitted').map(p => `<option value="${p.uhid}">${p.name} (${p.uhid})</option>`).join('')}
                </select>
              </div>
              <div class="form-group">
                <label style="font-weight:700;">Diet Class Type</label>
                <select id="qo-type" class="form-select" style="font-size:0.75rem;">
                  <option value="Normal hospital diet">Normal hospital diet</option>
                  <option value="Soft diet">Soft diet</option>
                  <option value="Liquid diet (clear)">Liquid diet (clear)</option>
                  <option value="Diabetic diet">Diabetic diet</option>
                  <option value="Low salt (<2g/day)">Low salt (<2g/day)</option>
                  <option value="High protein">High protein</option>
                  <option value="Renal diet (non-dialysis)">Renal diet (non-dialysis)</option>
                  <option value="NPO (nil per oral)">NPO (nil per oral)</option>
                </select>
              </div>
              <div class="form-group">
                <label style="font-weight:700;">Allergies / Special Pref</label>
                <input type="text" id="qo-notes" class="form-control" placeholder="E.g. Veg, no raw onions" style="font-size:0.75rem;">
              </div>
              <button type="submit" class="btn btn-primary btn-sm" ${!isDoc ? 'disabled' : ''}>Order Diet</button>
            </form>
          </div>

          <!-- NPO Management -->
          <div class="card">
            <div class="card-header" style="background:#fee2e2; border-bottom:1px solid #fca5a5;"><h3 class="card-title" style="font-size:0.85rem; color:#991b1b;">🚫 Clinical NPO Management</h3></div>
            <form onsubmit="window.submitNPOOrder(event)" style="padding:15px; display:flex; flex-direction:column; gap:10px; font-size:0.75rem;">
              <div class="form-group">
                <label style="font-weight:700;">Patient</label>
                <select id="npo-uhid" class="form-select" style="font-size:0.75rem;">
                  ${state.patients.filter(p => p.status === 'Admitted').map(p => `<option value="${p.uhid}">${p.name} (${p.uhid})</option>`).join('')}
                </select>
              </div>
              <div class="form-group">
                <label style="font-weight:700;">Reason for NPO</label>
                <select id="npo-reason" class="form-select" style="font-size:0.75rem;">
                  <option value="Pre-op">Pre-operative lock</option>
                  <option value="Investigation">Diagnostic investigation</option>
                  <option value="GI Bleed">GI Bleed</option>
                  <option value="Aspiration risk">Aspiration risk</option>
                </select>
              </div>
              <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px;">
                <div class="form-group">
                  <label style="font-weight:700;">Start Date &amp; Time</label>
                  <input type="datetime-local" id="npo-start" class="form-control" style="font-size:0.75rem;" value="2026-07-06T13:00">
                </div>
                <div class="form-group">
                  <label style="font-weight:700;">Expected Hrs</label>
                  <input type="number" id="npo-duration" class="form-control" style="font-size:0.75rem;" value="8">
                </div>
              </div>
              <label style="display:flex; align-items:center; gap:6px; margin:4px 0;"><input type="checkbox" id="npo-iv" checked> IV Fluids active order</label>
              <button type="submit" class="btn btn-primary btn-sm" style="background:#dc2626; border-color:#dc2626;" ${!isDoc ? 'disabled' : ''}>Confirm NPO Order</button>
            </form>
          </div>

          <!-- NPO Warning Strip -->
          ${state.dietData.activeNPOAlerts.map(n => `
            <div style="background:#fee2e2; border:1px solid #fca5a5; color:#991b1b; padding:10px; border-radius:6px; font-size:0.75rem; font-weight:700; line-height:1.4;">
              ⚠️ NPO WARNING: Patient ${n.name} (${n.bed}) has been NPO for ${n.duration} with ${n.ivFluids === 'No' ? 'NO active IV fluids ordered' : 'active IV fluids'}. Please review immediately.
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}

window.submitQuickOrder = function(event) {
  event.preventDefault();
  const uhid = document.getElementById('qo-uhid').value;
  const type = document.getElementById('qo-type').value;
  const notes = document.getElementById('qo-notes').value;

  const pat = state.patients.find(p => p.uhid === uhid);
  const existing = state.dietData.patients.find(p => p.uhid === uhid);

  if (existing) {
    existing.dietRx = type;
    existing.status = "Active";
  } else {
    state.dietData.patients.push({
      name: pat ? pat.name : "Patient",
      uhid: uhid,
      bed: "GW-101",
      diagnosis: "General Checkup",
      dietRx: type,
      lastReview: "Today",
      status: "Active",
      energy: 1800, protein: 70, fluid: 1500, route: "Oral",
      prepBy: "Doctor Quick Order",
      preferences: "Veg",
      allergies: "None",
      mealStats: { breakfast: "—", lunch: "—", dinner: "—" }
    });
  }

  alert(`Quick Diet Order submitted successfully for ${uhid}. Kitchen Roster updated.`);
  window.switchDietTab('diet_orders');
};

window.submitNPOOrder = function(event) {
  event.preventDefault();
  const uhid = document.getElementById('npo-uhid').value;
  const reason = document.getElementById('npo-reason').value;
  const duration = parseInt(document.getElementById('npo-duration').value) || 8;
  const iv = document.getElementById('npo-iv').checked ? "Yes" : "No";

  const p = state.dietData.patients.find(pt => pt.uhid === uhid);
  if (p) {
    p.dietRx = `NPO (Nil Per Oral) - ${reason}`;
    p.status = "NPO Lock";
  }

  if (iv === 'No' && duration >= 8) {
    const pat = state.patients.find(pt => pt.uhid === uhid);
    state.dietData.activeNPOAlerts.unshift({
      name: pat ? pat.name : "Patient",
      uhid: uhid,
      bed: p ? p.bed : "Ward Room",
      duration: `${duration} hrs`,
      ivFluids: "No",
      status: "Warning Alert"
    });
  }

  alert(`NPO protocol initiated for patient ${uhid}. Kitchen meal trays suspended.`);
  window.switchDietTab('diet_orders');
};

window.editDietOrder = function(uhid) {
  // Direct to assessment detailed order modification
  window.switchDietTab('assessments');
  setTimeout(() => window.launchDietitianAssessment(uhid), 50);
};

window.suspendDietOrder = function(uhid) {
  const p = state.dietData.patients.find(pt => pt.uhid === uhid);
  if (p) {
    p.status = "Suspended";
    alert(`Diet order for patient ${uhid} suspended.`);
    window.switchDietTab('diet_orders');
  }
};

// --------------------------------------------------------------------------
// TAB 4 — TUBE FEED & TPN
// --------------------------------------------------------------------------
function renderTubeTPNTab(container, role) {
  const tpn = state.dietData.patients.find(p => p.uhid === 'SH-2026-04788');
  const tube = state.dietData.patients.find(p => p.uhid === 'SH-2026-04817');

  container.innerHTML = `
    <div style="display:flex; flex-direction:column; gap:1.25rem; text-align:left;">
      
      <!-- Tube feed section -->
      <div style="display:grid; grid-template-columns:1fr 1.2fr; gap:1.25rem;">
        
        <!-- Left: Prescription and Monitoring Logs -->
        <div style="display:flex; flex-direction:column; gap:12px;">
          <div class="card">
            <div class="card-header" style="background:#eff6ff;"><h3 class="card-title" style="font-size:0.85rem; color:#1e40af;">🧪 Nasogastric (NG) Enteral Feeding Protocol</h3></div>
            <form onsubmit="window.saveTubePresc(event)" style="padding:15px; display:flex; flex-direction:column; gap:10px; font-size:0.75rem;">
              <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px;">
                <div class="form-group">
                  <label style="font-weight:700;">Patient</label>
                  <input type="text" class="form-control" value="Sunita Sharma" readonly style="background:#f1f5f9; font-size:0.75rem;">
                </div>
                <div class="form-group">
                  <label style="font-weight:700;">Route / Tube Size</label>
                  <input type="text" id="tube-size" class="form-control" value="NG Tube / 12 Fr" style="font-size:0.75rem;">
                </div>
              </div>
              <div class="form-group">
                <label style="font-weight:700;">Formula Type</label>
                <select id="tube-formula" class="form-select" style="font-size:0.75rem;">
                  <option value="Nutren 1.0">Nutren 1.0 (Standard polymeric)</option>
                  <option value="Nutren 2.0">Nutren 2.0 (Fluid-restricted)</option>
                  <option value="Peptamen">Peptamen (Semi-elemental)</option>
                  <option value="Nepro">Nepro (Renal concentrated)</option>
                  <option value="Glucerna">Glucerna (Diabetic control)</option>
                </select>
              </div>
              <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px;">
                <div class="form-group">
                  <label style="font-weight:700;">Target Flow Rate (ml/hr)</label>
                  <input type="number" id="tube-rate" class="form-control" value="60" style="font-size:0.75rem;">
                </div>
                <div class="form-group">
                  <label style="font-weight:700;">Flush Volume (ml)</label>
                  <input type="number" id="tube-flush" class="form-control" value="30" style="font-size:0.75rem;">
                </div>
              </div>
              <label style="display:flex; align-items:center; gap:6px;"><input type="checkbox" checked> Head of Bed &ge; 30-45° instruction active</label>
              <button type="submit" class="btn btn-primary btn-sm">Save Tube Feed prescription</button>
            </form>
          </div>

          <!-- Enteral logs -->
          <div class="card">
            <div class="card-header"><h3 class="card-title" style="font-size:0.85rem;">🏥 4-Hourly Enteral Monitoring Log (Nurse Entries)</h3></div>
            <div class="card-body" style="padding:10px;">
              <table class="custom-table" style="font-size:0.72rem; width:100%;">
                <thead>
                  <tr>
                    <th>Shift</th>
                    <th>Time</th>
                    <th>Rate</th>
                    <th>Vol Given</th>
                    <th>GRV (ml)</th>
                    <th>Tolerance</th>
                    <th>Notes</th>
                  </tr>
                </thead>
                <tbody>
                  ${tube.tubeFeed.logs.map(l => `
                    <tr>
                      <td>${l.shift}</td>
                      <td>${l.time}</td>
                      <td>${l.rate}ml/hr</td>
                      <td>${l.vol}ml</td>
                      <td><span style="font-weight:bold; color:${l.grv > 200 ? '#dc2626' : 'inherit'};">${l.grv}ml</span></td>
                      <td><span class="badge" style="background:${l.tolerance === 'HOLD' ? '#fee2e2' : '#d1fae5'}; color:${l.tolerance === 'HOLD' ? '#b91c1c' : '#065f46'}; font-size:8px;">${l.tolerance}</span></td>
                      <td>${l.notes || '—'}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>

              <!-- Add log entry -->
              <div style="background:var(--bg-slate-light); border-top:1px solid var(--border-color); padding:10px; margin-top:8px; display:grid; grid-template-columns:1fr 1fr 1fr auto; gap:6px; align-items:end;">
                <div class="form-group" style="margin:0;">
                  <label style="font-size:0.65rem; font-weight:700;">Rate (ml/hr)</label>
                  <input type="number" id="new-log-rate" class="form-control" value="60" style="padding:2px; font-size:0.7rem;">
                </div>
                <div class="form-group" style="margin:0;">
                  <label style="font-size:0.65rem; font-weight:700;">Volume (ml)</label>
                  <input type="number" id="new-log-vol" class="form-control" value="240" style="padding:2px; font-size:0.7rem;">
                </div>
                <div class="form-group" style="margin:0;">
                  <label style="font-size:0.65rem; font-weight:700;">GRV Reading (ml)</label>
                  <input type="number" id="new-log-grv" class="form-control" value="50" style="padding:2px; font-size:0.7rem;">
                </div>
                <button class="btn btn-secondary btn-sm" style="padding:3px 8px; font-size:10px;" onclick="window.addTubeLogEntry()">+ Log</button>
              </div>
            </div>
          </div>
        </div>

        <!-- Right: TPN Prescribing & Biochemistry Audits -->
        <div style="display:flex; flex-direction:column; gap:12px;">
          <div class="card">
            <div class="card-header" style="background:#ede9fe;"><h3 class="card-title" style="font-size:0.85rem; color:#6d28d9;">🧪 Total Parenteral Nutrition (TPN) central form</h3></div>
            <form onsubmit="window.saveTPNForm(event)" style="padding:15px; display:flex; flex-direction:column; gap:10px; font-size:0.75rem; max-height:420px; overflow-y:auto;">
              <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:8px;">
                <div class="form-group">
                  <label style="font-weight:700;">Dextrose 50% (ml)</label>
                  <input type="number" id="tpn-dex" class="form-control" value="500" style="font-size:0.75rem;" oninput="window.calcTPNOsm()">
                </div>
                <div class="form-group">
                  <label style="font-weight:700;">Amino Acid 10% (ml)</label>
                  <input type="number" id="tpn-amino" class="form-control" value="800" style="font-size:0.75rem;" oninput="window.calcTPNOsm()">
                </div>
                <div class="form-group">
                  <label style="font-weight:700;">Lipid 20% (ml)</label>
                  <input type="number" id="tpn-lipid" class="form-control" value="250" style="font-size:0.75rem;" oninput="window.calcTPNOsm()">
                </div>
              </div>

              <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px;">
                <div class="form-group">
                  <label style="font-weight:700;">Total Vol (ml)</label>
                  <input type="text" id="tpn-vol" class="form-control" value="1550" readonly style="background:#f1f5f9; font-size:0.75rem;">
                </div>
                <div class="form-group">
                  <label style="font-weight:700;">Osmolality (mOsm/L)</label>
                  <input type="text" id="tpn-osm" class="form-control" readonly style="background:#f1f5f9; font-size:0.75rem;">
                </div>
              </div>

              <div style="font-weight:700; border-bottom:1px solid var(--border-color); padding-bottom:2px; font-size:0.7rem; color:var(--text-muted);">ELECTROLYTES &amp; VITAMINS</div>
              <div style="display:grid; grid-template-columns:repeat(4, 1fr); gap:6px;">
                <div class="form-group"><label style="font-size:0.65rem;">NaCl (mEq)</label><input type="number" id="tpn-na" class="form-control" value="75" style="padding:2px; font-size:0.7rem;"></div>
                <div class="form-group"><label style="font-size:0.65rem;">KCl (mEq)</label><input type="number" id="tpn-k" class="form-control" value="40" style="padding:2px; font-size:0.7rem;"></div>
                <div class="form-group"><label style="font-size:0.65rem;">KPO4 (mEq)</label><input type="number" id="tpn-po4" class="form-control" value="15" style="padding:2px; font-size:0.7rem;"></div>
                <div class="form-group"><label style="font-size:0.65rem;">MgSO4 (mEq)</label><input type="number" id="tpn-mg" class="form-control" value="8" style="padding:2px; font-size:0.7rem;"></div>
              </div>

              <div style="display:flex; justify-content:space-between; align-items:center; margin-top:4px;">
                <label style="display:flex; align-items:center; gap:6px; margin:0;"><input type="checkbox" id="tpn-ref" checked> Refeeding syndrome precaution</label>
                <label style="display:flex; align-items:center; gap:6px; margin:0;"><input type="checkbox" checked> Daily MVI Vitamins added</label>
              </div>

              <button type="submit" class="btn btn-primary btn-sm" style="background:#6d28d9; border-color:#6d28d9;">Send to Pharmacy &amp; Doctor for Co-sign</button>
            </form>
          </div>

          <!-- TPN Daily Logs -->
          <div class="card">
            <div class="card-header"><h3 class="card-title" style="font-size:0.85rem;">🏥 TPN Daily Biochemical Sheet</h3></div>
            <div class="card-body" style="padding:10px;">
              <table class="custom-table" style="font-size:0.72rem; width:100%;">
                <thead>
                  <tr>
                    <th>Day</th>
                    <th>BG 0600</th>
                    <th>BG 1200</th>
                    <th>BG 1800</th>
                    <th>BG 0000</th>
                    <th>K+</th>
                    <th>Na+</th>
                    <th>PO4</th>
                    <th>Weight</th>
                  </tr>
                </thead>
                <tbody>
                  ${tpn.tpn.logs.map(l => `
                    <tr>
                      <td>Day ${l.day}</td>
                      <td>${l.bg0600}</td>
                      <td>${l.bg1200}</td>
                      <td>${l.bg1800}</td>
                      <td>${l.bg0000}</td>
                      <td>${l.k}</td>
                      <td>${l.na}</td>
                      <td><span style="font-weight:bold; color:${l.po4 < 1.0 ? '#dc2626' : 'inherit'};">${l.po4} ${l.po4 < 1.0 ? '⚠️' : ''}</span></td>
                      <td>${l.wt}kg</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>

              <div style="background:#fef3c7; border:1px solid #fde68a; color:#b45309; padding:8px; border-radius:4px; font-size:0.72rem; font-weight:700; margin-top:8px; line-height:1.4;">
                ⚠️ REFEEDING SYNDROME ALERT: PO4 0.8 on Day 1 triggered alert &mdash; IV phosphate replacement was completed successfully.
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  `;

  window.calcTPNOsm = function() {
    const dex = parseFloat(document.getElementById('tpn-dex').value) || 0;
    const amino = parseFloat(document.getElementById('tpn-amino').value) || 0;
    const lipid = parseFloat(document.getElementById('tpn-lipid').value) || 0;

    const vol = dex + amino + lipid;
    document.getElementById('tpn-vol').value = vol + ' ml';

    // Simulated Osmolality formula
    const osm = Math.round((dex * 5) + (amino * 10) + (lipid * 1.5)) / 10;
    document.getElementById('tpn-osm').value = Math.round(osm * 10);
  };
  window.calcTPNOsm();
}

window.saveTubePresc = function(event) {
  event.preventDefault();
  const formula = document.getElementById('tube-formula').value;
  const rate = document.getElementById('tube-rate').value;

  const tube = state.dietData.patients.find(p => p.uhid === 'SH-2026-04817');
  if (tube) {
    tube.dietRx = `NG Tube: ${formula} @ ${rate}ml/hr`;
    tube.tubeFeed.formula = formula;
    tube.tubeFeed.rate = parseInt(rate);
  }

  alert("NG Enteral Feeding Prescription saved. Ward nursing console updated.");
  window.switchDietTab('tube_tpn');
};

window.addTubeLogEntry = function() {
  const rate = parseInt(document.getElementById('new-log-rate').value) || 60;
  const vol = parseInt(document.getElementById('new-log-vol').value) || 240;
  const grv = parseInt(document.getElementById('new-log-grv').value) || 50;

  const tube = state.dietData.patients.find(p => p.uhid === 'SH-2026-04817');
  if (tube) {
    let tolerance = "OK";
    let notes = "";
    if (grv > 500) {
      tolerance = "HOLD";
      notes = "GRV > 500ml logged. Feed automatically suspended and doctor notified.";
      alert("🚨 CRITICAL WARNING: Gastrointestinal Residual Volume (GRV) exceeds 500ml. Feed held immediately per clinical guidelines.");
    } else if (grv > 200) {
      tolerance = "HOLD";
      notes = "GRV 200-500ml warning. Held 1 hr for reassessment.";
    }

    tube.tubeFeed.logs.push({
      shift: "Evening",
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
      rate: rate,
      vol: vol,
      grv: grv,
      tolerance: tolerance,
      notes: notes
    });
  }

  window.switchDietTab('tube_tpn');
};

window.saveTPNForm = function(event) {
  event.preventDefault();
  alert("TPN Prescription sent successfully. Awaiting Doctor co-signature and Pharmacist sterile compounding clearance.");
};

// --------------------------------------------------------------------------
// TAB 5 — WARD DIET SHEETS
// --------------------------------------------------------------------------
function renderWardSheetsTab(container, role) {
  const isKitchen = (role === 'Kitchen Staff' || role === 'Diet Technician' || role === 'Administrator');

  container.innerHTML = `
    <div style="display:flex; flex-direction:column; gap:1.25rem; text-align:left;">
      
      <!-- Top selectors -->
      <div class="card">
        <div class="card-body" style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px; padding:12px;">
          <div style="display:flex; align-items:center; gap:12px;">
            <div class="form-group" style="margin:0;">
              <label style="font-size:0.7rem; font-weight:700; color:var(--text-muted);">Select Ward / Wing</label>
              <select id="ward-select" class="form-select" style="font-size:0.75rem; width:200px;" onchange="window.switchDietWard(this.value)">
                <option value="GW(M)">General Ward (Male) &mdash; GW(M)</option>
                <option value="GW(F)">General Ward (Female) &mdash; GW(F)</option>
                <option value="ICU">Critical Care Unit &mdash; ICU</option>
              </select>
            </div>
            <div class="form-group" style="margin:0;">
              <label style="font-size:0.7rem; font-weight:700; color:var(--text-muted);">Meal Service Session</label>
              <select id="meal-session" class="form-select" style="font-size:0.75rem; width:150px;">
                <option value="Breakfast">Breakfast (08:00)</option>
                <option value="Lunch" selected>Lunch (13:00)</option>
                <option value="Dinner">Dinner (19:30)</option>
              </select>
            </div>
          </div>

          <div style="display:flex; gap:8px;">
            <button class="btn btn-secondary btn-sm" onclick="window.printActiveDietRoster()">🖨 Print Kitchen Dispatch Sheet</button>
            <button class="btn btn-primary btn-sm" onclick="window.confirmMealDelivery()" ${!isKitchen ? 'disabled' : ''}>📦 Mark Ward Trays Delivered</button>
          </div>
        </div>
      </div>

      <!-- Roster layout -->
      <div style="display:grid; grid-template-columns:2fr 1fr; gap:1.25rem;">
        
        <!-- Left: Diet sheet roster table -->
        <div class="card">
          <div class="card-header"><h3 class="card-title">🍱 Kitchen Meal Dispatch Sheet</h3></div>
          <div class="card-body">
            <table class="custom-table" style="font-size:0.78rem; width:100%;">
              <thead>
                <tr>
                  <th>Bed</th>
                  <th>Patient</th>
                  <th>Diet Rx</th>
                  <th>Allergies</th>
                  <th>Pref</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                <tr style="border-bottom:1px solid var(--border-color);">
                  <td class="mono"><strong>GW(M)-409</strong></td>
                  <td><strong>Rajesh Kumar</strong><br><span style="font-size:0.65rem; color:var(--text-muted);">SH-2026-04821</span></td>
                  <td><span class="badge" style="background:#fee2e2; color:#b91c1c; font-size:8px;">High protein · 1800 kcal</span></td>
                  <td>Penicillin ⚠️</td>
                  <td>Non-veg</td>
                  <td>Extra protein portion tray</td>
                </tr>
                <tr style="border-bottom:1px solid var(--border-color);">
                  <td class="mono"><strong>GW(M)-410</strong></td>
                  <td><strong>Suresh Babu</strong><br><span style="font-size:0.65rem; color:var(--text-muted);">SH-2026-04112</span></td>
                  <td>Normal hospital diet</td>
                  <td>None</td>
                  <td>Veg</td>
                  <td>—</td>
                </tr>
                <tr style="border-bottom:1px solid var(--border-color);">
                  <td class="mono"><strong>GW(M)-411</strong></td>
                  <td style="color:var(--text-muted); font-style:italic;">(Vacant Bed)</td>
                  <td>—</td>
                  <td>—</td>
                  <td>—</td>
                  <td>—</td>
                </tr>
                <tr style="border-bottom:1px solid var(--border-color);">
                  <td class="mono"><strong>GW(M)-412</strong></td>
                  <td><strong>Mohammed Iqbal</strong><br><span style="font-size:0.65rem; color:var(--text-muted);">SH-2026-04799</span></td>
                  <td><span class="badge" style="background:#eff6ff; color:#1e40af; font-size:8px;">Soft · Low salt</span></td>
                  <td>None</td>
                  <td>Veg</td>
                  <td>Fluid restrict 1200ml</td>
                </tr>
                <tr style="border-bottom:1px solid var(--border-color);">
                  <td class="mono"><strong>GW(M)-413</strong></td>
                  <td><strong>Deepak Verma</strong><br><span style="font-size:0.65rem; color:var(--text-muted);">SH-2026-04901</span></td>
                  <td>Diabetic · 1600 kcal</td>
                  <td>None</td>
                  <td>Non-veg</td>
                  <td>Check BG before meal</td>
                </tr>
                <tr style="border-bottom:1px solid var(--border-color);">
                  <td class="mono"><strong>GW(M)-414</strong></td>
                  <td><strong>Arjun Nair</strong><br><span style="font-size:0.65rem; color:var(--text-muted);">SH-2026-04105</span></td>
                  <td><span class="badge" style="background:#fee2e2; color:#b91c1c; font-size:8px;">🚫 NPO LOCK</span></td>
                  <td>—</td>
                  <td>—</td>
                  <td>No Tray (GI Bleed)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Right: Intake logs & Dispatch registers -->
        <div style="display:flex; flex-direction:column; gap:12px;">
          <!-- Meal intake -->
          <div class="card">
            <div class="card-header"><h3 class="card-title" style="font-size:0.85rem;">🍽️ Meal Intake Log (Ward Nurse)</h3></div>
            <form onsubmit="window.saveIntakeLog(event)" style="padding:15px; display:flex; flex-direction:column; gap:10px; font-size:0.75rem;">
              <div style="display:flex; flex-direction:column; gap:6px;">
                <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px dashed var(--border-color); padding:4px 0;">
                  <span>GW(M)-409: Rajesh K.</span>
                  <select id="intake-409" class="form-select" style="width:110px; font-size:0.7rem; padding:2px 4px;">
                    <option value="0">Refused (0%)</option>
                    <option value="25">Quarter (25%)</option>
                    <option value="50">Half (50%)</option>
                    <option value="75">3/4th (75%)</option>
                    <option value="100" selected>Full (100%)</option>
                  </select>
                </div>
                <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px dashed var(--border-color); padding:4px 0;">
                  <span>GW(M)-410: Suresh B.</span>
                  <select id="intake-410" class="form-select" style="width:110px; font-size:0.7rem; padding:2px 4px;">
                    <option value="0">Refused (0%)</option>
                    <option value="25">Quarter (25%)</option>
                    <option value="50">Half (50%)</option>
                    <option value="75">3/4th (75%)</option>
                    <option value="100" selected>Full (100%)</option>
                  </select>
                </div>
                <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px dashed var(--border-color); padding:4px 0;">
                  <span>GW(M)-412: Mohammed I.</span>
                  <select id="intake-412" class="form-select" style="width:110px; font-size:0.7rem; padding:2px 4px;">
                    <option value="0">Refused (0%)</option>
                    <option value="25">Quarter (25%)</option>
                    <option value="50" selected>Half (50%)</option>
                    <option value="75">3/4th (75%)</option>
                    <option value="100">Full (100%)</option>
                  </select>
                </div>
                <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px dashed var(--border-color); padding:4px 0;">
                  <span>GW(M)-413: Deepak V.</span>
                  <select id="intake-413" class="form-select" style="width:110px; font-size:0.7rem; padding:2px 4px;">
                    <option value="0">Refused (0%)</option>
                    <option value="25">Quarter (25%)</option>
                    <option value="75" selected>3/4th (75%)</option>
                    <option value="100">Full (100%)</option>
                  </select>
                </div>
              </div>
              <button type="submit" class="btn btn-secondary btn-sm" style="margin-top:6px;">Save Intake Log</button>
            </form>
          </div>

          <!-- Dispatch logs -->
          <div class="card">
            <div class="card-header"><h3 class="card-title" style="font-size:0.85rem;">🚚 Kitchen Dispatch Log</h3></div>
            <div class="card-body" style="padding:10px;">
              <table class="custom-table" style="font-size:0.7rem; width:100%;">
                <thead>
                  <tr>
                    <th>Meal</th>
                    <th>Ward</th>
                    <th>Sent</th>
                    <th>Received By</th>
                    <th>Time</th>
                  </tr>
                </thead>
                <tbody>
                  ${state.dietData.kitchenDispatches.map(k => `
                    <tr>
                      <td>${k.meal}</td>
                      <td>${k.ward}</td>
                      <td>${k.dispatched}</td>
                      <td>${k.receiver}</td>
                      <td>${k.deliveryTime}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>

    </div>
  `;
}

window.switchDietWard = function(ward) {
  alert(`Loading dispatch sheet roster for Ward: ${ward}`);
};

window.printActiveDietRoster = function() {
  const w = window.open('', '_blank', 'width=800,height=600');
  w.document.write(`
    <html>
      <head><title>Kitchen Tray Dispatch Sheet</title></head>
      <body style="font-family:sans-serif; padding:20px;">
        <h2>🍱 Kitchen Tray Dispatch Sheet - GW(M)</h2>
        <p>Date: 24 Jun 2026 | Session: Lunch (13:00)</p>
        <table border="1" cellpadding="8" style="border-collapse:collapse; width:100%; font-size:12px;">
          <thead><tr><th>Bed</th><th>Patient</th><th>Diet Rx</th><th>Allergies</th><th>Preference</th></tr></thead>
          <tbody>
            <tr><td>GW(M)-409</td><td>Rajesh Kumar</td><td>High protein · 1800 kcal</td><td>Penicillin</td><td>Non-veg</td></tr>
            <tr><td>GW(M)-410</td><td>Suresh Babu</td><td>Normal hospital diet</td><td>None</td><td>Veg</td></tr>
            <tr><td>GW(M)-412</td><td>Mohammed Iqbal</td><td>Soft · Low salt</td><td>None</td><td>Veg</td></tr>
            <tr><td>GW(M)-413</td><td>Deepak Verma</td><td>Diabetic · 1600 kcal</td><td>None</td><td>Non-veg</td></tr>
          </tbody>
        </table>
      </body>
    </html>
  `);
  w.document.close();
  w.print();
};

window.confirmMealDelivery = function() {
  state.dietData.kitchenDispatches.push({
    meal: "Lunch",
    ward: "GW(M)",
    dispatched: "12:55",
    receiver: "Nurse Kavitha",
    deliveryTime: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
  });
  alert("Ward meal trays dispatched successfully. Delivery logged.");
  window.switchDietTab('ward_sheets');
};

window.saveIntakeLog = function(event) {
  event.preventDefault();
  const val409 = parseInt(document.getElementById('intake-409').value) || 0;

  if (val409 === 0) {
    alert("🚨 ALERT: 2 consecutive meal refusals (0% intake) logged for Rajesh Kumar (GW(M)-409). Dietitian review referral triggered.");
  } else {
    alert("Meal intake logs updated successfully.");
  }
  window.switchDietTab('ward_sheets');
};

// --------------------------------------------------------------------------
// TAB 6 — COUNSELLING & DISCHARGE
// --------------------------------------------------------------------------
function renderDischargeTab(container, role) {
  container.innerHTML = `
    <div style="display:flex; flex-direction:column; gap:1.25rem; text-align:left;">
      
      <div style="display:grid; grid-template-columns:1.2fr 2fr; gap:1.25rem;">
        <!-- Left: Counselling pending list -->
        <div class="card">
          <div class="card-header"><h3 class="card-title">📋 Discharge Counselling Registry</h3></div>
          <div class="card-body">
            <table class="custom-table" style="font-size:0.78rem; width:100%;">
              <thead>
                <tr>
                  <th>Patient</th>
                  <th>Diagnosis</th>
                  <th>Discharge</th>
                  <th>Status</th>
                  <th style="text-align:right;">Action</th>
                </tr>
              </thead>
              <tbody>
                ${state.dietData.counsellingQueue.map(c => `
                  <tr style="border-bottom:1px solid var(--border-color);">
                    <td><strong>${c.name}</strong></td>
                    <td>${c.diagnosis}</td>
                    <td>${c.dischargeDate}</td>
                    <td><span class="badge" style="background:${c.status.includes('Done') ? '#d1fae5' : '#fef3c7'}; color:${c.status.includes('Done') ? '#065f46' : '#b45309'}; font-size:8px;">${c.status}</span></td>
                    <td style="text-align:right;">
                      <button class="btn btn-primary btn-xs" onclick="window.loadCounselForm('${c.uhid}')">Counsel</button>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>

        <!-- Right: Counselling Details / Chart Builder -->
        <div id="counsel-viewport">
          <div class="card" style="padding:40px; text-align:center; color:var(--text-muted); font-size:0.85rem;">
            Select a patient from the counselling registry to print bilingual discharge charts.
          </div>
        </div>
      </div>

    </div>
  `;
}

window.loadCounselForm = function(uhid) {
  const p = state.dietData.counsellingQueue.find(c => c.uhid === uhid) || state.dietData.patients.find(pt => pt.uhid === uhid);
  const viewport = document.getElementById('counsel-viewport');
  if (!viewport || !p) return;

  viewport.innerHTML = `
    <div class="card">
      <div class="card-header" style="background:var(--primary); color:#fff; padding:10px 15px;">
        <h3 class="card-title" style="margin:0; font-size:0.95rem; color:#fff;">📋 DISCHARGE DIET COUNSELLING &mdash; ${p.name}</h3>
      </div>
      <form onsubmit="window.saveCounselRecord(event, '${p.uhid}')" style="padding:15px; display:flex; flex-direction:column; gap:10px; font-size:0.78rem; max-height:70vh; overflow-y:auto;">
        <div style="font-weight:700;">Clinical Condition: ${p.diagnosis || 'Post Surgery Recovery'}</div>

        <div style="font-weight:700; margin-top:8px;">Diet Advised Checklist</div>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:6px;">
          <label style="display:flex; align-items:center; gap:6px;"><input type="checkbox" checked> High protein wound healing</label>
          <label style="display:flex; align-items:center; gap:6px;"><input type="checkbox" checked> Low salt (<2g/day)</label>
          <label style="display:flex; align-items:center; gap:6px;"><input type="checkbox" checked> Diabetic carb control</label>
          <label style="display:flex; align-items:center; gap:6px;"><input type="checkbox" checked> Fluid intake restriction</label>
        </div>

        <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-top:8px;">
          <div class="form-group">
            <label style="font-weight:700;">Select Diet Chart Template</label>
            <select id="counsel-temp" class="form-select" style="font-size:0.75rem;">
              <option value="Post-THR high protein">Post-THR high protein</option>
              <option value="Diabetic (Indian meal plan)">Diabetic (Indian meal plan)</option>
              <option value="Renal (non-dialysis)">Renal (non-dialysis)</option>
              <option value="Liver disease">Liver disease</option>
            </select>
          </div>
          <div class="form-group">
            <label style="font-weight:700;">Written Chart Language</label>
            <select id="counsel-lang" class="form-select" style="font-size:0.75rem;">
              <option value="English">English</option>
              <option value="Kannada">Kannada</option>
              <option value="Hindi">Hindi</option>
              <option value="Tamil">Tamil</option>
            </select>
          </div>
        </div>

        <div style="font-weight:700; margin-top:8px;">Warning Signs Explained</div>
        <div style="display:flex; flex-direction:column; gap:4px;">
          <label style="display:flex; align-items:center; gap:6px;"><input type="checkbox" checked> Sudden weight change >2kg/week</label>
          <label style="display:flex; align-items:center; gap:6px;"><input type="checkbox" checked> Swallowing or choking difficulty</label>
        </div>

        <div style="display:flex; justify-content:flex-end; gap:8px; border-top:1px solid var(--border-color); padding-top:10px; margin-top:10px;">
          <button type="button" class="btn btn-secondary btn-sm" onclick="window.printBilingualChart('${p.uhid}')">🖨 Print Chart</button>
          <button type="submit" class="btn btn-primary btn-sm">Sign Counselling Record</button>
        </div>
      </form>
    </div>
  `;
};

window.printBilingualChart = function(uhid) {
  const p = state.dietData.patients.find(pt => pt.uhid === uhid) || state.dietData.counsellingQueue.find(pt => pt.uhid === uhid);
  const lang = document.getElementById('counsel-lang').value;
  const temp = document.getElementById('counsel-temp').value;

  const w = window.open('', '_blank', 'width=800,height=600');
  w.document.write(`
    <html>
      <head><title>Bilingual Discharge Diet Chart</title></head>
      <body style="font-family:sans-serif; padding:30px; line-height:1.5;">
        <h2 style="text-align:center;">SARONIL SUPER SPECIALTY HOSPITAL</h2>
        <h3 style="text-align:center; border-bottom:2px solid #000; padding-bottom:10px;">DISCHARGE DIET CHART / ಡಿಸ್ಚಾರ್ಜ್ ಡಯಟ್ ಚಾರ್ಟ್</h3>
        <p><strong>Patient:</strong> ${p.name} | <strong>Language:</strong> ${lang} | <strong>Template:</strong> ${temp}</p>
        
        <table border="1" cellpadding="8" style="border-collapse:collapse; width:100%; margin-top:20px;">
          <thead>
            <tr style="background:#f2f2f2;"><th>Time / ಸಮಯ</th><th>Recommended Foods / ಶಿಫಾರಸು ಮಾಡಿದ ಆಹಾರಗಳು</th></tr>
          </thead>
          <tbody>
            <tr><td>08:00 AM</td><td>2 Idli, Sambhar (low salt), 1 Glass Milk / ೨ ಇಡ್ಲಿ, ಸಾಂಬಾರ್ (ಕಡಿಮೆ ಉಪ್ಪು), ೧ ಲೋಟ ಹಾಲು</td></tr>
            <tr><td>01:00 PM</td><td>2 Roti, Dal, Sabji, Curd / ೨ ರೊಟ್ಟಿ, ಬೇಳೆ ಸಾರು, ಪಲ್ಯ, ಮೊಸರು</td></tr>
            <tr><td>08:00 PM</td><td>Vegetable Khichdi, Salad / ತರಕಾರಿ ಖಿಚಡಿ, ಸಲಾಡ್</td></tr>
          </tbody>
        </table>
      </body>
    </html>
  `);
  w.document.close();
  w.print();
};

window.saveCounselRecord = function(event, uhid) {
  event.preventDefault();
  const c = state.dietData.counsellingQueue.find(pt => pt.uhid === uhid);
  if (c) {
    c.status = "Done ✓ Today";
  }

  // Cross-module update to discharge checklist clearance (ATD Bed Board)
  alert(`Counselling record signed. Discharge clearance flag successfully updated in ATD module.`);
  window.switchDietTab('discharge');
};

// --------------------------------------------------------------------------
// TAB 7 — REPORTS
// --------------------------------------------------------------------------
function renderReportsTab(container, role) {
  container.innerHTML = `
    <div style="display:flex; flex-direction:column; gap:1.25rem; text-align:left;">
      <div class="card">
        <div class="card-header"><h3 class="card-title">📈 Nutritional Audits &amp; Workload Reports</h3></div>
        <div class="card-body" style="display:grid; grid-template-columns:1fr 2fr; gap:1.5rem;">
          
          <!-- Reports selector -->
          <div style="display:flex; flex-direction:column; gap:10px; border-right:1px solid var(--border-color); padding-right:15px;">
            <div class="form-group">
              <label style="font-weight:700;">Select Report Type</label>
              <select id="report-sel" class="form-select" style="font-size:0.75rem;" onchange="window.generateDietReport(this.value)">
                <option value="screen">Compliance: Nutritional Screening compliance</option>
                <option value="intake">Intake Audit: % Consumption summary</option>
                <option value="work">Dietitian Workload Audit</option>
                <option value="ref">Refusal Log Audits</option>
              </select>
            </div>
            <div style="display:flex; gap:8px; margin-top:10px;">
              <button class="btn btn-secondary btn-sm" onclick="window.printDietReportPDF()">Print PDF</button>
              <button class="btn btn-secondary btn-sm" style="border-color:#059669; color:#059669;" onclick="window.exportDietReportCSV()">Export CSV</button>
            </div>
          </div>

          <!-- Report Preview Screen -->
          <div id="report-view-viewport">
            <!-- Render dynamic preview table -->
          </div>

        </div>
      </div>
    </div>
  `;

  // Trigger initial report
  window.generateDietReport('screen');
}

window.generateDietReport = function(type) {
  const viewport = document.getElementById('report-view-viewport');
  if (!viewport) return;

  let columns = [];
  let rows = [];

  if (type === 'screen') {
    columns = ['Indicator Metric', 'Target SLA', 'Audited Compliance Rate (%)'];
    rows = [
      ['Nutritional Screening within 24h of Admission', '95.0%', '98.2% (Pass)'],
      ['Dietitian Assessment completion < 24h of referral', '100.0%', '100.0% (Pass)'],
      ['Adverse Tube Feed / TPN logs escalated < 15 mins', '95.0%', '96.8% (Pass)']
    ];
  } else if (type === 'intake') {
    columns = ['Ward Wing', 'Offered Meals', 'Consumed Full (100%)', 'Partially Consumed (50-75%)', 'Refused (0%)'];
    rows = [
      ['General Ward (Male)', '42 Trays', '32 (76.1%)', '8 (19.0%)', '2 (4.8%)'],
      ['General Ward (Female)', '36 Trays', '30 (83.3%)', '5 (13.8%)', '1 (2.7%)'],
      ['CCU/ICU', '12 Tubes', '10 (83.3%)', '0 (0.0%)', '2 (16.6%)']
    ];
  } else if (type === 'work') {
    columns = ['Dietitian Operator', 'NRS Screenings Done', 'Detailed Assessments Done', 'Discharge Counselling completed'];
    rows = [
      ['Ananya R. (Dietitian)', '15 cases', '12 cases', '8 patients'],
      ['Arjun Nair (Diet Tech)', '22 cases', '0 cases', '0 patients']
    ];
  } else if (type === 'ref') {
    columns = ['Patient Name', 'Bed', 'Meal Session', 'Refusal Streak', 'Escalation Status'];
    rows = [
      ['Rajesh Kumar', 'GW(M)-409', 'Lunch + Dinner', '2 Consecutive Meals', 'Dietitian notified (Warning active)'],
      ['Suresh Babu', 'GW(M)-410', 'Breakfast', '1 Meal', 'Monitoring active']
    ];
  }

  viewport.innerHTML = `
    <h4 style="margin:0 0 10px 0; font-size:0.85rem; font-weight:700; color:var(--primary);">${type.toUpperCase()} AUDIT TABLE</h4>
    <table class="custom-table" id="diet-report-table" style="font-size:0.75rem; width:100%;">
      <thead><tr>${columns.map(c => `<th>${c}</th>`).join('')}</tr></thead>
      <tbody>
        ${rows.map(row => `
          <tr style="border-bottom:1px solid var(--border-color);">
            ${row.map(cell => `<td>${cell}</td>`).join('')}
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
};

window.exportDietReportCSV = function() {
  const table = document.getElementById('diet-report-table');
  if (!table) return;

  let csvContent = "\uFEFF";
  const headers = Array.from(table.querySelectorAll('th')).map(th => `"${th.textContent}"`).join(',');
  csvContent += headers + "\r\n";

  const rows = Array.from(table.querySelectorAll('tbody tr'));
  rows.forEach(row => {
    const cols = Array.from(row.querySelectorAll('td')).map(td => `"${td.textContent.trim().replace(/"/g, '""')}"`).join(',');
    csvContent += cols + "\r\n";
  });

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `Diet_Report_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

window.printDietReportPDF = function() {
  const table = document.getElementById('report-view-viewport');
  if (!table) return;

  const w = window.open('', '_blank', 'width=800,height=600');
  w.document.write(`
    <html>
      <head><title>Nutritional Audit Performance Report</title></head>
      <body style="font-family:sans-serif; padding:30px; line-height:1.5;">
        <h2 style="text-align:center;">SARONIL SUPER SPECIALTY HOSPITAL</h2>
        <h3 style="text-align:center;">Dietary Operations Audit Sheet</h3>
        ${table.innerHTML}
      </body>
    </html>
  `);
  w.document.close();
  w.print();
};
