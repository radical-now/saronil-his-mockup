// ATD (Admission, Transfer & Discharge) Dashboard
// Saronil Health HIS

(function() {
  function initAtdState() {
    if (!window.state) window.state = {};
    window.state.admissionRequests = window.state.admissionRequests || [
      { id: "AR-901", patientName: "Rajesh Chandra", uhid: "MH-2026-9081", source: "OPD (Dr. Amit Sharma)", priority: "Urgent", wardPref: "General Ward Male", date: "27-Jun-2026" },
      { id: "AR-902", patientName: "Priya Devi", uhid: "MH-2026-2901", source: "Emergency Room", priority: "STAT", wardPref: "ICU Bed", date: "27-Jun-2026" }
    ];

    window.state.transferRequests = window.state.transferRequests || [
      { id: "TR-401", patientName: "Baby of Pinky", uhid: "MH-2026-0812", fromWard: "NICU", toWard: "General Ward Female", reason: "Stable - Step down care", status: "Pending Clearance" }
    ];

    window.state.dischargeQueue = window.state.dischargeQueue || [
      { id: "DC-101", patientName: "Gopal Banerjee", uhid: "MH-2026-3092", ward: "General Ward Male", bed: "GW-M-12", doctor: "Dr. Joy Sen", summaryStatus: "Signed Off", billingStatus: "Awaiting Clearance" }
    ];
  }

  window.views = window.views || {};
  window.views.atdDashboard = function(container) {
    initAtdState();

    container.innerHTML = `
      <div style="padding: 12px 0;">
        <!-- Page Header -->
        <div style="margin-top: 4px; margin-bottom: 16px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
          <div>
            <h1 style="font-size: 1.35rem; font-weight: 700; color: var(--text-primary); margin: 0; font-family: var(--font-display);">ATD Command Center</h1>
            <div style="font-size: 0.78rem; color: var(--text-muted); margin-top: 2px;">Inpatient Admissions · Ward Transfers · Discharge Summary Clearances</div>
          </div>
          <div class="admin-mono" style="font-size: 0.72rem; background: var(--bg-surface-elevated); padding: 4px 10px; border-radius: 4px; border: 1px solid var(--border-color); font-weight: 500;">
            🏢 Desk Role: ATD Coordinator
          </div>
        </div>

        <!-- KPI Stats Cards -->
        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 16px;">
          <div class="card" style="padding: 12px; display:flex; flex-direction:column; justify-content:space-between; min-height:80px;">
            <div style="font-size:0.68rem; color:var(--text-secondary); font-weight:600;">Active Admitted Patients</div>
            <div style="font-size:1.3rem; font-weight:bold; color:var(--text-primary); margin-top:4px;">182 Patients</div>
            <div style="font-size:0.6rem; color:var(--text-muted);">91% Bed Occupancy</div>
          </div>
          <div class="card" style="padding: 12px; display:flex; flex-direction:column; justify-content:space-between; min-height:80px;">
            <div style="font-size:0.68rem; color:var(--text-secondary); font-weight:600;">Vacant Beds Available</div>
            <div style="font-size:1.3rem; font-weight:bold; color:#059669; margin-top:4px;">18 Beds</div>
            <div style="font-size:0.6rem; color:var(--text-muted);">View live bed board below</div>
          </div>
          <div class="card" style="padding: 12px; display:flex; flex-direction:column; justify-content:space-between; min-height:80px;">
            <div style="font-size:0.68rem; color:var(--text-secondary); font-weight:600;">Pending Admissions</div>
            <div style="font-size:1.3rem; font-weight:bold; color:#D97706; margin-top:4px;">${window.state.admissionRequests.length} Cases</div>
            <div style="font-size:0.6rem; color:var(--text-muted);">Awaiting bed allotments</div>
          </div>
          <div class="card" style="padding: 12px; display:flex; flex-direction:column; justify-content:space-between; min-height:80px;">
            <div style="font-size:0.68rem; color:var(--text-secondary); font-weight:600;">Transfers in Queue</div>
            <div style="font-size:1.3rem; font-weight:bold; color:#2563EB; margin-top:4px;">${window.state.transferRequests.length} Requests</div>
            <div style="font-size:0.6rem; color:var(--text-muted);">Ward clearances pending</div>
          </div>
        </div>

        <!-- Quick Action Bar -->
        <div style="background-color: var(--bg-surface); padding: 10px 16px; border: 1px solid var(--border-color); border-radius: 6px; display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 16px;">
          <button class="btn btn-primary btn-sm" onclick="window.mockAtdAction('Admit')">🆕 Admit Patient</button>
          <button class="btn btn-secondary btn-sm" onclick="window.mockAtdAction('Transfer')">🔄 Initiate Transfer</button>
          <button class="btn btn-secondary btn-sm" onclick="window.mockAtdAction('Discharge')">🔏 Clear Discharge</button>
          <button class="btn btn-secondary btn-sm" onclick="window.mockAtdAction('Layout')">🗺️ Bed Layout View</button>
        </div>

        <!-- Main 3-Column Desk -->
        <div style="display: grid; grid-template-columns: 35% 35% 30%; gap: 12px; min-width: 1200px; align-items: start;">
          
          <!-- Column 1: Admission Requests -->
          <div class="card">
            <div class="card-header" style="border-bottom: 1px solid var(--border-color); padding: 10px 12px;">
              <h3 style="font-size: 0.85rem; font-weight: 700; color: var(--text-primary); margin:0;">1. Admission Requests Queue</h3>
            </div>
            <div class="card-body" style="padding: 10px; display: flex; flex-direction: column; gap: 8px;">
              ${window.state.admissionRequests.map(r => `
                <div style="border: 1px solid var(--border-color); border-radius: 6px; padding: 10px; background-color: white; font-size: 0.72rem; display:flex; flex-direction:column; gap:4px;">
                  <div style="display:flex; justify-content:space-between; align-items:center;">
                    <span class="admin-mono font-bold" style="font-size:0.7rem;">${r.id}</span>
                    <span class="badge ${r.priority === 'STAT' ? 'badge-priority-stat' : 'badge-priority-urgent'}" style="font-size:8px; padding:1px 4px;">${r.priority}</span>
                  </div>
                  <div>
                    <div style="font-weight:600; color:var(--text-primary);">${r.patientName}</div>
                    <div style="color:var(--text-secondary); font-size:0.68rem;">UHID: <span class="admin-mono font-semibold">${r.uhid}</span> · Pref: ${r.wardPref}</div>
                    <div style="color:var(--text-muted); font-size:0.65rem;">Source: ${r.source} · Date: ${r.date}</div>
                  </div>
                  <div style="border-top:1px dashed var(--border-color); padding-top:4px; margin-top:2px; display:flex; justify-content:flex-end; gap:4px;">
                    <button class="btn btn-primary text-[9px]" onclick="window.mockAllotBed('${r.id}')" style="padding:2px 6px; background-color:#2563EB;">Allot Bed & Admit</button>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- Column 2: Live Bed Board & Transfers -->
          <div class="card">
            <div class="card-header" style="border-bottom: 1px solid var(--border-color); padding: 10px 12px; display:flex; justify-content:space-between; align-items:center;">
              <h3 style="font-size: 0.85rem; font-weight: 700; color: var(--text-primary); margin:0;">2. Bed Board & Transfers</h3>
            </div>
            <div class="card-body" style="padding: 10px; display: flex; flex-direction: column; gap: 8px;">
              <div style="background: #EFF6FF; border: 1px solid #BFDBFE; color: #1E40AF; padding: 8px; border-radius: 4px; font-size:0.68rem; margin-bottom: 6px;">
                <strong>Transfer Requests:</strong>
                ${window.state.transferRequests.map(t => `
                  <div style="margin-top:4px; border-top:1px dashed #BFDBFE; padding-top:4px; display:flex; justify-content:space-between; align-items:center;">
                    <div>${t.patientName} (${t.fromWard} → ${t.toWard})</div>
                    <button class="btn btn-xs btn-primary" onclick="window.mockApproveTransfer('${t.id}')" style="font-size:8px; padding:1px 3px;">Approve</button>
                  </div>
                `).join('')}
              </div>

              <div style="font-weight:bold; font-size:0.72rem; color:var(--text-primary); margin-bottom:4px;">Live Bed Board Index:</div>
              <div style="font-size:0.68rem; line-height:1.6; color:var(--text-secondary);">
                • ICU: <span class="admin-mono font-bold text-red-600">14/15 Occupied</span> (93%)<br>
                • HDU: <span class="admin-mono font-bold text-amber-600">8/10 Occupied</span> (80%)<br>
                • Gen Ward Male: <span class="admin-mono font-bold text-emerald-600">12/15 Occupied</span> (80%)<br>
                • Gen Ward Female: <span class="admin-mono font-bold text-emerald-600">6/15 Occupied</span> (40%)
              </div>
            </div>
          </div>

          <!-- Column 3: Pending Discharges -->
          <div class="card">
            <div class="card-header" style="border-bottom: 1px solid var(--border-color); padding: 10px 12px;">
              <h3 style="font-size: 0.85rem; font-weight: 700; color: var(--text-primary); margin:0;">3. Discharges & Clearances</h3>
            </div>
            <div class="card-body" style="padding: 10px; display: flex; flex-direction: column; gap: 8px;">
              ${window.state.dischargeQueue.map(d => `
                <div style="border: 1px solid var(--border-color); border-radius: 6px; padding: 10px; background-color: white; font-size: 0.72rem; display:flex; flex-direction:column; gap:4px;">
                  <div style="display:flex; justify-content:space-between; align-items:center;">
                    <span class="admin-mono font-bold" style="font-size:0.7rem;">${d.id}</span>
                    <span class="badge" style="background:#FEF3C7; color:#D97706; font-size:8px; padding:1px 4px;">${d.billingStatus}</span>
                  </div>
                  <div>
                    <div style="font-weight:600; color:var(--text-primary);">${d.patientName} (${d.bed})</div>
                    <div style="color:var(--text-secondary); font-size:0.68rem;">UHID: <span class="admin-mono font-semibold">${d.uhid}</span> · Doctor: ${d.doctor}</div>
                    <div style="color:var(--text-muted); font-size:0.65rem;">Discharge summary: <strong style="color:#059669;">${d.summaryStatus}</strong></div>
                  </div>
                  <div style="border-top:1px dashed var(--border-color); padding-top:4px; margin-top:2px; display:flex; justify-content:flex-end;">
                    <button class="btn btn-secondary text-[9px]" onclick="window.mockReleaseBed('${d.id}')" style="padding:2px 6px; border-color:#EF4444; color:#EF4444;">Release Bed & Finalize</button>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      </div>
    `;
  };

  window.mockAtdAction = function(action) {
    alert(`${action} Workspace drawer spooled. Initiating transaction...`);
  };

  window.mockAllotBed = function(id) {
    alert(`Allotted Bed for ${id}. Admission checklist generated. Auto-notified ward nurse.`);
    window.state.admissionRequests = window.state.admissionRequests.filter(r => r.id !== id);
    window.views.atdDashboard(document.getElementById('dashboard-persona-viewport'));
  };

  window.mockApproveTransfer = function(id) {
    alert(`Transfer request ${id} approved and finalized. Bed allocation updated.`);
    window.state.transferRequests = window.state.transferRequests.filter(t => t.id !== id);
    window.views.atdDashboard(document.getElementById('dashboard-persona-viewport'));
  };

  window.mockReleaseBed = function(id) {
    alert(`Discharge summary verified. Final billing cleared. Bed has been vacated and routed for cleaning.`);
    window.state.dischargeQueue = window.state.dischargeQueue.filter(d => d.id !== id);
    window.views.atdDashboard(document.getElementById('dashboard-persona-viewport'));
  };

})();
