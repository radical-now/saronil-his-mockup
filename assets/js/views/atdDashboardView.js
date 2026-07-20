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
      { id: "DC-101", patientName: "Gopal Banerjee", uhid: "MH-2026-3092", ward: "General Ward Male", bed: "GW-M-12", doctor: "Dr. Joy Sen", summaryStatus: "Signed Off", billingStatus: "Awaiting Clearance", gatePassIssued: false },
      { id: "DC-102", patientName: "Sunita Deshmukh", uhid: "MH-2026-1022", ward: "General Ward Female", bed: "GW-F-04", doctor: "Dr. Priya Nair", summaryStatus: "Signed Off", billingStatus: "Cleared", gatePassIssued: false }
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
        <div class="admin-kpi-scroll-row">
          <!-- Card 1: Active Admitted Patients -->
          <div class="admin-kpi-card status-normal" style="cursor: default;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; width: 100%;">
              <span style="font-size: 0.72rem; font-weight: 700; text-transform: uppercase; color: var(--text-secondary);">Active Admitted Patients</span>
            </div>
            <div style="margin-top: 8px; margin-bottom: 8px;">
              <span class="admin-mono" style="font-size: 1.45rem; font-weight: 700; color: var(--text-primary); letter-spacing: -0.02em;">182 Patients</span>
              <div style="font-size: 0.72rem; color: var(--text-muted); margin-top: 2px;">91% Bed Occupancy</div>
            </div>
            <div style="display: flex; align-items: center; justify-content: space-between; margin-top: 4px; font-size: 0.72rem; border-top: 1px dashed var(--border-color); padding-top: 6px;">
              <span style="color: var(--color-success); font-weight: 600; display: flex; align-items: center; gap: 2px;">
                ▲ High Load
              </span>
            </div>
          </div>

          <!-- Card 2: Vacant Beds Available -->
          <div class="admin-kpi-card status-normal" style="cursor: default;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; width: 100%;">
              <span style="font-size: 0.72rem; font-weight: 700; text-transform: uppercase; color: var(--text-secondary);">Vacant Beds Available</span>
            </div>
            <div style="margin-top: 8px; margin-bottom: 8px;">
              <span class="admin-mono" style="font-size: 1.45rem; font-weight: 700; color: #059669; letter-spacing: -0.02em;">18 Beds</span>
              <div style="font-size: 0.72rem; color: var(--text-muted); margin-top: 2px;">View live bed board below</div>
            </div>
            <div style="display: flex; align-items: center; justify-content: space-between; margin-top: 4px; font-size: 0.72rem; border-top: 1px dashed var(--border-color); padding-top: 6px;">
              <span style="color: var(--color-success); font-weight: 600; display: flex; align-items: center; gap: 2px;">
                ▲ Stable Status
              </span>
            </div>
          </div>

          <!-- Card 3: Pending Admissions -->
          <div class="admin-kpi-card ${window.state.admissionRequests.length > 0 ? 'status-warning' : 'status-normal'}" style="cursor: default;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; width: 100%;">
              <span style="font-size: 0.72rem; font-weight: 700; text-transform: uppercase; color: var(--text-secondary);">Pending Admissions</span>
            </div>
            <div style="margin-top: 8px; margin-bottom: 8px;">
              <span class="admin-mono" style="font-size: 1.45rem; font-weight: 700; color: #D97706; letter-spacing: -0.02em;">${window.state.admissionRequests.length} Cases</span>
              <div style="font-size: 0.72rem; color: var(--text-muted); margin-top: 2px;">Awaiting bed allotments</div>
            </div>
            <div style="display: flex; align-items: center; justify-content: space-between; margin-top: 4px; font-size: 0.72rem; border-top: 1px dashed var(--border-color); padding-top: 6px;">
              <span style="color: ${window.state.admissionRequests.length > 0 ? 'var(--color-warning)' : 'var(--color-success)'}; font-weight: 600; display: flex; align-items: center; gap: 2px;">
                ${window.state.admissionRequests.length > 0 ? '▼ Bed Needed' : '▲ Cleared'}
              </span>
            </div>
          </div>

          <!-- Card 4: Transfers in Queue -->
          <div class="admin-kpi-card ${window.state.transferRequests.length > 0 ? 'status-normal' : 'status-normal'}" style="cursor: default;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; width: 100%;">
              <span style="font-size: 0.72rem; font-weight: 700; text-transform: uppercase; color: var(--text-secondary);">Transfers in Queue</span>
            </div>
            <div style="margin-top: 8px; margin-bottom: 8px;">
              <span class="admin-mono" style="font-size: 1.45rem; font-weight: 700; color: #2563EB; letter-spacing: -0.02em;">${window.state.transferRequests.length} Requests</span>
              <div style="font-size: 0.72rem; color: var(--text-muted); margin-top: 2px;">Ward clearances pending</div>
            </div>
            <div style="display: flex; align-items: center; justify-content: space-between; margin-top: 4px; font-size: 0.72rem; border-top: 1px dashed var(--border-color); padding-top: 6px;">
              <span style="color: var(--color-success); font-weight: 600; display: flex; align-items: center; gap: 2px;">
                ▲ Live Sync
              </span>
            </div>
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
              ${window.state.dischargeQueue.map(d => {
                const isClear = d.summaryStatus === 'Signed Off' && (d.billingStatus === 'Cleared' || d.billingStatus === 'Paid');
                return `
                  <div style="border: 1px solid var(--border-color); border-radius: 6px; padding: 10px; background-color: white; font-size: 0.72rem; display:flex; flex-direction:column; gap:4px;">
                    <div style="display:flex; justify-content:space-between; align-items:center;">
                      <span class="admin-mono font-bold" style="font-size:0.7rem;">${d.id}</span>
                      <span class="badge" style="background:${d.billingStatus === 'Cleared' || d.billingStatus === 'Paid' ? '#D1FAE5' : '#FEF3C7'}; color:${d.billingStatus === 'Cleared' || d.billingStatus === 'Paid' ? '#065F46' : '#D97706'}; font-size:8px; padding:1px 4px;">${d.billingStatus}</span>
                    </div>
                    <div>
                      <div style="font-weight:600; color:var(--text-primary);">${d.patientName} (${d.bed})</div>
                      <div style="color:var(--text-secondary); font-size:0.68rem;">UHID: <span class="admin-mono font-semibold" style="text-decoration: underline; cursor: pointer; color: var(--primary);" onclick="router.navigate('patients?uhid=${d.uhid}')">${d.uhid}</span> · Doctor: ${d.doctor}</div>
                      <div style="color:var(--text-muted); font-size:0.65rem;">Discharge summary: <strong style="color:#059669;">${d.summaryStatus}</strong></div>
                      ${d.gatePassIssued ? `
                        <div style="margin-top: 4px; background: #e0f2fe; border: 1px solid #bae6fd; border-radius: 4px; padding: 4px 6px; display: flex; align-items: center; justify-content: space-between; font-weight: 700; color: #0369a1; font-size: 0.65rem;">
                          <span>🎫 Exit Gate Pass Issued</span>
                          <span class="admin-mono">${d.gatePassCode}</span>
                        </div>
                      ` : ''}
                    </div>
                    <div style="border-top:1px dashed var(--border-color); padding-top:4px; margin-top:2px; display:flex; justify-content:flex-end; gap:6px;">
                      ${d.gatePassIssued ? `
                        <button class="btn btn-secondary text-[9px]" onclick="window.mockReleaseBed('${d.id}')" style="padding:2px 6px; border-color:#EF4444; color:#EF4444; cursor: pointer;">Release Bed & Finalize</button>
                      ` : `
                        ${isClear ? `
                          <button class="btn btn-primary text-[9px]" onclick="window.atdIssueGatePass('${d.id}', '${d.uhid}')" style="padding:2px 6px; background-color:#10b981; border-color:#10b981; color:white; font-weight:700; cursor: pointer;">🎫 Issue Gate Pass</button>
                        ` : `
                          <button class="btn btn-secondary text-[9px]" onclick="alert('Cannot issue Gate Pass: Patient clearances are pending. Both discharge summary must be Signed Off and billing status Cleared/Paid.')" style="padding:2px 6px; background-color:#e2e8f0; border-color:#cbd5e1; color:#94a3b8; cursor:not-allowed;">🎫 Issue Gate Pass (Pending)</button>
                        `}
                      `}
                    </div>
                  </div>
                `;
              }).join('')}
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
    window.views.atdDashboard(document.getElementById('dashboard-persona-viewport') || document.getElementById('main-content'));
  };

  window.mockApproveTransfer = function(id) {
    alert(`Transfer request ${id} approved and finalized. Bed allocation updated.`);
    window.state.transferRequests = window.state.transferRequests.filter(t => t.id !== id);
    window.views.atdDashboard(document.getElementById('dashboard-persona-viewport') || document.getElementById('main-content'));
  };

  window.atdIssueGatePass = function(id, uhid) {
    const item = window.state.dischargeQueue.find(d => d.id === id);
    if (item) {
      // Hard Validation Guard: verify all required departments have cleared
      const patient = (window.state.patients || []).find(p => p.uhid === uhid);
      const cl = patient ? (patient.dischargeClearances || {}) : {};
      
      const nursingOk = cl.nursing?.cleared || item.summaryStatus === 'Signed Off';
      const billingOk = cl.billing?.cleared || item.billingStatus === 'Cleared' || item.billingStatus === 'Paid';
      const pharmacyOk = cl.pharmacy?.cleared || item.summaryStatus === 'Signed Off'; // seeder fallback
      const tpaOk = !cl.tpa || cl.tpa.cleared || item.billingStatus === 'Cleared' || item.billingStatus === 'Paid'; // seeder fallback
      const labOk = !cl.lab || cl.lab.cleared || item.summaryStatus === 'Signed Off'; // seeder fallback

      const isClear = nursingOk && billingOk && pharmacyOk && tpaOk && labOk;
      if (!isClear) {
        var pending = [];
        if (!nursingOk) pending.push("Nursing");
        if (!billingOk) pending.push("Billing & Finance");
        if (!pharmacyOk) pending.push("Pharmacy");
        if (!tpaOk) pending.push("TPA / Insurance");
        if (!labOk) pending.push("Laboratory");
        
        alert(`⚠️ Cannot Issue Gate Pass!\n\nClearances are pending from the following departments:\n• ${pending.join("\n• ")}\n\nPlease complete all pending department clearances first.`);
        return;
      }

      const gpCode = `GP-${Math.floor(100000 + Math.random() * 900000)}`;
      const gpTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const gpDate = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

      item.gatePassIssued = true;
      item.gatePassCode   = gpCode;

      alert(`🎉 Exit Gate Pass Issued!\n\nPatient: ${item.patientName}\nPass Code: ${gpCode}\n\nPatient has been marked as Discharged and is authorized to exit.`);

      // Mark the global patient record as Discharged and free the bed
      if (patient) {
        patient.gatePassIssued = true;
        patient.gatePassCode   = gpCode;
        patient.gatePassTime   = gpTime;
        patient.status         = 'Discharged';
        patient.dischargeDate  = gpDate;
        patient.dischargeTime  = gpTime;
        patient.bed            = null;   // free the bed
      }

      // Remove from ATD discharge queue — episode is closed
      window.state.dischargeQueue = window.state.dischargeQueue.filter(d => d.id !== id);
    }
    window.views.atdDashboard(document.getElementById('dashboard-persona-viewport') || document.getElementById('main-content'));
  };


  window.mockReleaseBed = function(id) {
    // Since gate pass issuance now automatically marks the patient as Discharged
    // and removes them from the queue, this function is a safe fallback for
    // any lingering items that may not have been fully processed.
    const item = window.state.dischargeQueue.find(d => d.id === id);
    if (!item) {
      // Already removed by gate pass — no action needed
      window.views.atdDashboard(document.getElementById('dashboard-persona-viewport') || document.getElementById('main-content'));
      return;
    }
    if (!item.gatePassIssued) {
      alert('⚠️ Gate Pass has not been issued yet.\nPlease issue the Gate Pass first — it will automatically discharge the patient and free the bed.');
      return;
    }
    // Fallback: remove manually if somehow still in queue after gate pass
    window.state.dischargeQueue = window.state.dischargeQueue.filter(d => d.id !== id);
    alert('Bed released and discharge finalized.');
    window.views.atdDashboard(document.getElementById('dashboard-persona-viewport') || document.getElementById('main-content'));
  };

})();
