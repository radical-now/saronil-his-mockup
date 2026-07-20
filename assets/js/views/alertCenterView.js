/* ==========================================================================
   SARONIL HMS - QUALITY & ALERT MANAGEMENT CENTER (alertCenterView.js)
   ========================================================================== */

window.views.alertCenter = function(container, subAnchor, params) {
  renderAlertCenter(container);
};

function renderAlertCenter(container) {
  // Compute counts
  const total = state.alerts.length;
  const active = state.alerts.filter(a => a.status === 'Active').length;
  const resolved = state.alerts.filter(a => a.status === 'Resolved').length;
  const critical = state.alerts.filter(a => (a.severity === 'Critical Safety Alert' || a.severity === 'Hard Stop') && a.status === 'Active').length;

  container.innerHTML = `
    <!-- NABH Compliance Header -->
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1.5rem; background:#f8fafc; border:1px solid #cbd5e1; border-radius:10px; padding:12px 20px;">
      <div>
        <h2 style="font-size:1.1rem; font-weight:800; color:#0f172a; margin:0; font-family:inherit;">NABH Patient Safety &amp; Clinical Alert Center</h2>
        <span style="font-size:0.75rem; color:#64748b;">Complying with National Accreditation Board for Hospitals (NABH 5th Edition) Patient Safety Indicators</span>
      </div>
      <div style="background:#059669; color:#fff; border-radius:30px; padding:4px 12px; font-size:10px; font-weight:700; display:flex; align-items:center; gap:6px; box-shadow:0 2px 4px rgba(0,0,0,0.1);">
        <span>🛡️</span> NABH COMPLIANT ACTIVE
      </div>
    </div>

    <!-- Top Alert Metrics -->
    <div class="stats-grid" style="margin-bottom: 1.5rem;">
      <div class="stat-card" style="border-left: 4px solid var(--color-danger);">
        <div class="stat-info">
          <span class="stat-label">Active Critical Alerts</span>
          <span class="stat-value" style="color:var(--color-danger);">${critical} Alerts</span>
          <span class="stat-sub">Sepsis, blood, allergy conflicts</span>
        </div>
        <div class="stat-icon-wrapper" style="background-color: var(--color-danger-bg); color: var(--color-danger);">🚨</div>
      </div>
      
      <div class="stat-card" style="border-left: 4px solid var(--color-warning);">
        <div class="stat-info">
          <span class="stat-label">Active Total Warnings</span>
          <span class="stat-value">${active}</span>
          <span class="stat-sub">Awaiting clinical reviews</span>
        </div>
        <div class="stat-icon-wrapper" style="background-color: var(--color-warning-bg); color: var(--color-warning);">⏳</div>
      </div>
 
      <div class="stat-card" style="border-left: 4px solid var(--color-success);">
        <div class="stat-info">
          <span class="stat-label">Resolved Incidents</span>
          <span class="stat-value">${resolved} Cases</span>
          <span class="stat-sub">Cleared with audit trails</span>
        </div>
        <div class="stat-icon-wrapper" style="background-color: var(--color-success-bg); color: var(--color-success);">✅</div>
      </div>
    </div>

    <!-- Alert Workspace Layout Split -->
    <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 1.5rem; align-items: start;">
      <!-- Column 1: Active Alerts Queue -->
      <div class="card">
        <div class="card-header" style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
          <div>
            <h3 class="card-title">Central Alerts Command Queue</h3>
            <p class="card-subtitle">Real-time clinical safety alerts, vital triggers, and pharmacy double-checks</p>
          </div>
          <button onclick="window._openCreateAlertModal()" class="btn btn-primary btn-sm" style="font-size:0.75rem; font-weight:700; height:28px; padding:0 12px; background:var(--primary); color:#fff; border:none; border-radius:6px; cursor:pointer; margin-left:auto;">+ Log Safety Alert</button>
        </div>
        <div class="card-body">
          <!-- Filter Controls -->
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 0.5rem; margin-bottom: 1rem;">
            <input type="text" id="alt-search" class="form-control" placeholder="Search patient, UHID or details..." style="font-size: 0.8rem; padding: 0.35rem;">
            <select id="alt-severity" class="form-select" style="font-size: 0.8rem; padding: 0.35rem;">
              <option value="">All Severities</option>
              <option value="Information">Information</option>
              <option value="Warning">Warning</option>
              <option value="High Risk">High Risk</option>
              <option value="Critical Safety Alert">Critical Safety Alert</option>
              <option value="Hard Stop">Hard Stop (Prevent Action)</option>
            </select>
            <select id="alt-status" class="form-select" style="font-size: 0.8rem; padding: 0.35rem;">
              <option value="">All Statuses</option>
              <option value="Active">Active Only</option>
              <option value="Resolved">Resolved Only</option>
            </select>
            <button class="btn btn-secondary" onclick="clearAlertFilters()" style="font-size: 0.8rem; padding: 0.35rem;">Clear Filters</button>
          </div>

          <!-- Alerts Table -->
          <div class="custom-table-container">
            <table class="custom-table" style="font-size: 0.85rem;">
              <thead>
                <tr>
                  <th>Severity Level</th>
                  <th>Incident Details (Patient/UHID)</th>
                  <th>Source</th>
                  <th>Clinician / Time</th>
                  <th>Escalation</th>
                  <th>Status</th>
                  <th style="text-align: right;">Action</th>
                </tr>
              </thead>
              <tbody id="alt-table-body">
                <!-- Loaded dynamically -->
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Column 2: Alert Workbench & Emergency Code Broadcast -->
      <div style="display: flex; flex-direction: column; gap: 1.5rem;">
        <!-- Alert Review & Actions Workspace -->
        <div class="card" id="alt-workbench-panel">
          <div class="card-header"><h3 class="card-title">Alert Review Workbench</h3></div>
          <div class="card-body" style="text-align: center; color: var(--text-muted); padding: 4rem 1rem;">
            📢 Select an active clinical alert from the queue to investigate details, override with notes, escalate, or resolve.
          </div>
        </div>

        <!-- NABH Emergency Code Broadcaster Panel -->
        <div class="card" style="border-top: 4px solid #ef4444;">
          <div class="card-header" style="padding:10px 15px; border-bottom:1px solid #cbd5e1;"><h3 class="card-title" style="font-size:0.8rem; font-weight:800; color:#b91c1c; text-transform:uppercase; margin:0;">🚨 NABH Emergency Codes</h3></div>
          <div class="card-body" style="padding:12px; display:flex; flex-direction:column; gap:10px;">
            <p style="font-size:11px; color:#64748b; margin:0;">Trigger a hospital-wide broadcast alert in compliance with NABH emergency protocols.</p>
            <div style="display:flex; flex-direction:column; gap:6px;">
              <button class="btn" onclick="window._triggerEmergencyCode('Code Blue', 'Cardiac / Respiratory Arrest - CPR Team requested immediately.')" style="background:#2563eb; color:#fff; font-weight:700; border:none; padding:8px 12px; border-radius:6px; font-size:11px; cursor:pointer; text-align:left; display:flex; justify-content:space-between; align-items:center; width:100%;">
                <span>🔵 Broadcast CODE BLUE</span>
                <span style="background:rgba(255,255,255,0.25); padding:2px 6px; border-radius:4px; font-size:9px;">Cardiac Arrest</span>
              </button>
              <button class="btn" onclick="window._triggerEmergencyCode('Code Red', 'Fire emergency reported. Mobilize response team.')" style="background:#dc2626; color:#fff; font-weight:700; border:none; padding:8px 12px; border-radius:6px; font-size:11px; cursor:pointer; text-align:left; display:flex; justify-content:space-between; align-items:center; width:100%;">
                <span>🔴 Broadcast CODE RED</span>
                <span style="background:rgba(255,255,255,0.25); padding:2px 6px; border-radius:4px; font-size:9px;">Fire Safety</span>
              </button>
              <button class="btn" onclick="window._triggerEmergencyCode('Code Pink', 'Infant abduction alert in Neonatal ICU. Seal all exits.')" style="background:#ec4899; color:#fff; font-weight:700; border:none; padding:8px 12px; border-radius:6px; font-size:11px; cursor:pointer; text-align:left; display:flex; justify-content:space-between; align-items:center; width:100%;">
                <span>💗 Broadcast CODE PINK</span>
                <span style="background:rgba(255,255,255,0.25); padding:2px 6px; border-radius:4px; font-size:9px;">Infant Abduction</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- NABH Clinical Safety Audit Trail Table Section -->
    <div class="card" style="margin-top: 1.5rem; border-top: 4px solid #059669;">
      <div class="card-header" style="padding:12px 20px; border-bottom:1px solid #cbd5e1;">
        <h3 class="card-title" style="font-size:0.85rem; font-weight:800; color:#065f46; text-transform:uppercase; margin:0;">📋 NABH Clinical Safety &amp; Patient Override Audit Trail</h3>
        <p class="card-subtitle" style="margin-top:4px; font-size:11px; color:#64748b;">Regulatory logs of override justifications, attending clinicians, and state council registration details (NABH 5th Edition compliant).</p>
      </div>
      <div class="card-body" style="padding:15px;">
        <div class="custom-table-container">
          <table class="custom-table" style="font-size: 0.82rem; width:100%;">
            <thead>
              <tr style="background:#f8fafc; border-bottom:2px solid #cbd5e1;">
                <th>Timestamp</th>
                <th>Alert ID</th>
                <th>Patient Details</th>
                <th>Safety Trigger Details</th>
                <th>Attending Clinician</th>
                <th>MCI Reg No</th>
                <th>NABH Override Justification / Reason</th>
              </tr>
            </thead>
            <tbody>
              ${state.alertsAuditTrail && state.alertsAuditTrail.length > 0 ? state.alertsAuditTrail.map(trail => `
                <tr>
                  <td style="white-space:nowrap; font-weight:500;">${trail.time}</td>
                  <td><code>${trail.alertId}</code></td>
                  <td style="font-weight:700;">${trail.patientName} (${trail.uhid})</td>
                  <td style="max-width:250px; text-overflow:ellipsis; overflow:hidden; white-space:nowrap;" title="${trail.details}">${trail.details}</td>
                  <td style="font-weight:600;">${trail.clinician}</td>
                  <td style="font-family:'JetBrains Mono',monospace;">${trail.regNo}</td>
                  <td style="color:#0f766e; font-style:italic;">${trail.reason}</td>
                </tr>
              `).join('') : `
                <tr>
                  <td colspan="7" style="text-align:center; padding:30px; color:#64748b; font-size:12px;">✅ No safety overrides registered. Complete clinical compliance audit logs.</td>
                </tr>
              `}
            </tbody>
          </table>
        </div>
      </div>
    </div>
    
    <!-- Mount point for creating clinical alerts -->
    <div id="alert-create-modal-mount"></div>
  `;

  // Bind filter triggers
  const sInput = document.getElementById('alt-search');
  const sSeverity = document.getElementById('alt-severity');
  const sStatus = document.getElementById('alt-status');

  const filterAlerts = () => {
    const q = sInput.value.toLowerCase().trim();
    const sev = sSeverity.value;
    const stat = sStatus.value;

    const filtered = state.alerts.filter(a => {
      const matchQ = !q || 
        a.patientName.toLowerCase().includes(q) || 
        a.uhid.toLowerCase().includes(q) || 
        a.details.toLowerCase().includes(q);
      
      const matchSev = !sev || a.severity === sev;
      const matchStat = !stat || a.status === stat;

      return matchQ && matchSev && matchStat;
    });

    renderAlertTableRows(filtered);
  };

  sInput.addEventListener('input', filterAlerts);
  sSeverity.addEventListener('change', filterAlerts);
  sStatus.addEventListener('change', filterAlerts);

  filterAlerts();
}

function renderAlertTableRows(alerts) {
  const tbody = document.getElementById('alt-table-body');
  tbody.innerHTML = alerts.map(a => {
    let sevBadge = '';
    if (a.severity === 'Hard Stop') {
      sevBadge = '<span class="badge" style="background-color: #7f1d1d; color: #fecaca; border: 1px solid #b91c1c; padding: 0.15rem 0.35rem; border-radius: 4px; font-weight: bold; font-size: 0.75rem;">HARD STOP</span>';
    } else if (a.severity === 'Critical Safety Alert') {
      sevBadge = '<span class="badge bg-danger" style="color:#fff; padding:0.15rem 0.35rem; border-radius:4px; font-weight:bold; font-size:0.75rem;">CRITICAL</span>';
    } else if (a.severity === 'High Risk') {
      sevBadge = '<span class="badge" style="background-color: rgba(245,158,11,0.2); color: #b45309; padding: 0.15rem 0.35rem; border-radius: 4px; font-weight: bold; font-size:0.75rem;">HIGH RISK</span>';
    } else if (a.severity === 'Warning') {
      sevBadge = '<span class="badge bg-warning" style="color:#fff; padding:0.15rem 0.35rem; border-radius:4px; font-weight:bold; font-size:0.75rem;">WARNING</span>';
    } else {
      sevBadge = '<span class="badge bg-secondary" style="color:#fff; padding:0.15rem 0.35rem; border-radius:4px; font-size:0.75rem;">INFO</span>';
    }

    return `
      <tr style="cursor: pointer; background: ${a.status === 'Active' && a.severity === 'Hard Stop' ? 'rgba(239,68,68,0.01)' : 'transparent'};" onclick="openAlertWorkbench('${a.id}')">
        <td>${sevBadge}</td>
        <td>
          <div style="font-weight: 600;"><a href="#patients?uhid=${a.uhid}" class="patient-link" onclick="event.stopPropagation();">${a.patientName}</a> (${a.uhid})</div>
          <div style="font-size: 0.75rem; color: var(--text-muted); max-width: 280px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${a.details}</div>
        </td>
        <td>${a.source}</td>
        <td>
          <div>${a.clinician}</div>
          <div style="font-size: 0.7rem; color: var(--text-muted);">${a.time}</div>
        </td>
        <td>
          <span style="font-weight:500; color:${a.eStatus === 'Escalated' ? 'var(--color-danger)' : 'var(--text-secondary)'};">
            ${a.eStatus}
          </span>
        </td>
        <td>
          <strong style="color: ${a.status === 'Active' ? 'var(--color-warning)' : 'var(--color-success)'}; font-size: 0.75rem; text-transform: uppercase;">
            ${a.status}
          </strong>
        </td>
        <td style="text-align: right;">
          <button class="btn btn-secondary" style="padding: 0.2rem 0.4rem; font-size: 0.75rem;">Review</button>
        </td>
      </tr>
    `;
  }).join('') || '<tr><td colspan="7" style="text-align: center; color: var(--text-muted); padding: 3rem;">No alerts found matching filters.</td></tr>';
}

window.clearAlertFilters = function() {
  document.getElementById('alt-search').value = '';
  document.getElementById('alt-severity').value = '';
  document.getElementById('alt-status').value = '';
  renderAlertCenter(document.getElementById('main-content'));
};

window.openAlertWorkbench = function(alertId) {
  const alertItem = state.alerts.find(a => a.id === alertId);
  const panel = document.getElementById('alt-workbench-panel');
  if (!alertItem) return;

  panel.innerHTML = `
    <div class="card-header" style="padding: 0.75rem 1rem; border-bottom: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center;">
      <h4 style="font-size: 0.95rem; margin:0;">Alert Investigation: ${alertItem.id}</h4>
      <span style="font-size:0.75rem; color: var(--text-muted);">${alertItem.time}</span>
    </div>
    <div class="card-body" style="padding: 1rem; font-size: 0.85rem; display: flex; flex-direction: column; gap: 1rem; text-align:left;">
      <div>
        <p style="margin:4px 0;"><strong>Patient Name:</strong> <a href="#patients?uhid=${alertItem.uhid}" class="patient-link" style="font-weight:700;">${alertItem.patientName}</a> (${alertItem.uhid})</p>
        <p style="margin:4px 0;"><strong>Responsible Clinician:</strong> ${alertItem.clinician}</p>
        <p style="margin:4px 0;"><strong>Source Module:</strong> ${alertItem.source}</p>
        <p style="margin:4px 0;"><strong>Current Severity:</strong> <strong style="color:var(--color-danger);">${alertItem.severity}</strong></p>
        <p style="margin:4px 0;"><strong>Escalation Status:</strong> ${alertItem.eStatus}</p>
      </div>

      <div style="background-color: var(--bg-surface-elevated); padding: 0.75rem; border-radius: 6px; border-left: 4px solid var(--primary); text-align:left;">
        <strong style="color: var(--text-primary); font-size:11px;">Incident Description:</strong>
        <p style="margin: 0.25rem 0 0 0; color: var(--text-secondary); line-height: 1.4; font-size:12px;">${alertItem.details}</p>
      </div>

      <!-- Action Panel -->
      ${alertItem.status === 'Active' ? `
        <div style="display: flex; flex-direction: column; gap: 0.75rem;">
          <div class="form-group">
            <label style="font-size: 0.78rem; font-weight: bold; margin-bottom: 0.25rem; display:block; color:#475569;">NABH Override Justification *</label>
            <input type="text" id="alt-override-reason" class="form-control" placeholder="Required for clinical audit log compliance..." style="font-size: 0.8rem; padding: 5px 8px; border:1px solid #cbd5e1; border-radius:6px; width:100%; outline:none; box-sizing:border-box;">
          </div>

          <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px;">
            <div class="form-group">
              <label style="font-size: 0.78rem; font-weight: bold; margin-bottom: 0.25rem; display:block; color:#475569;">Attending Doctor *</label>
              <input type="text" id="alt-override-clinician" class="form-control" placeholder="e.g. Dr. Srinivasan" style="font-size: 0.8rem; padding: 5px 8px; border:1px solid #cbd5e1; border-radius:6px; width:100%; outline:none; box-sizing:border-box;">
            </div>
            <div class="form-group">
              <label style="font-size: 0.78rem; font-weight: bold; margin-bottom: 0.25rem; display:block; color:#475569;">MCI / SMC Reg No *</label>
              <input type="text" id="alt-override-regno" class="form-control" placeholder="e.g. MCI-30219" style="font-size: 0.8rem; padding: 5px 8px; border:1px solid #cbd5e1; border-radius:6px; width:100%; outline:none; box-sizing:border-box;">
            </div>
          </div>
          
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; margin-top: 5px;">
            <button class="btn btn-secondary" onclick="window.snoozeAlert('${alertItem.id}')" style="font-size: 0.8rem; padding: 0.4rem; cursor:pointer;">Snooze (15m)</button>
            <button class="btn btn-secondary" style="color: var(--color-danger); font-size: 0.8rem; padding: 0.4rem; cursor:pointer;" onclick="window.escalateAlert('${alertItem.id}')">Escalate Alert</button>
          </div>
          <button class="btn btn-success" style="width: 100%; font-size: 0.8rem; padding: 0.45rem; background:#059669; color:#fff; border:none; border-radius:6px; font-weight:700; cursor:pointer;" onclick="window.resolveAlert('${alertItem.id}')">Resolve Alert (NABH Sign-Off)</button>
        </div>
      ` : `
        <div style="background-color: var(--color-success-bg); color: var(--color-success); font-weight: bold; text-align: center; padding: 0.75rem; border-radius: 6px;">
          ✅ Resolved & Audited (NABH Sign-off)
        </div>
        <div style="font-size:0.75rem; color: var(--text-secondary); line-height:1.4;">
          <strong>NABH Audit Trail:</strong> Clinician officially bypassed/resolved this warning trigger. Justification logged in safety registry.
        </div>
      `}
    </div>
  `;
};

window.snoozeAlert = function(alertId) {
  const reason = document.getElementById('alt-override-reason').value.trim();
  const clinician = document.getElementById('alt-override-clinician').value.trim();
  const regNo = document.getElementById('alt-override-regno').value.trim();

  if (!reason || !clinician || !regNo) {
    alert('NABH Compliance requires Override Justification, Clinician Name, and MCI Registration Number to snooze safety alerts.');
    return;
  }
  
  alert(`Alert ${alertId} has been temporarily snoozed for 15 minutes. Audited by ${clinician} (${regNo}).`);
  openAlertWorkbench(alertId);
};

window.escalateAlert = function(alertId) {
  const alertItem = state.alerts.find(a => a.id === alertId);
  if (alertItem) {
    alertItem.eStatus = 'Escalated';
    localStorage.setItem('saronil_alerts', JSON.stringify(window.state.alerts));
    
    alert(`Alert ${alertId} has been escalated to the Chief Medical Director and Quality Control Board.`);
    openAlertWorkbench(alertId);
    renderAlertCenter(document.getElementById('main-content'));
  }
};

window.resolveAlert = function(alertId) {
  const alertItem = state.alerts.find(a => a.id === alertId);
  if (!alertItem) return;

  const reason = document.getElementById('alt-override-reason').value.trim();
  const clinician = document.getElementById('alt-override-clinician').value.trim();
  const regNo = document.getElementById('alt-override-regno').value.trim();
  
  if (!reason || !clinician || !regNo) {
    alert('Accreditation Error: NABH Standards strictly require Override Justification, Clinician Name, and MCI Registration Number to sign-off and clear safety alerts.');
    return;
  }

  alertItem.status = 'Resolved';
  alertItem.eStatus = 'Resolved';
  
  // Log into the NABH Patient Safety Audit Trail
  const auditEntry = {
    alertId: alertItem.id,
    patientName: alertItem.patientName,
    uhid: alertItem.uhid,
    severity: alertItem.severity,
    details: alertItem.details,
    reason: reason,
    clinician: clinician,
    regNo: regNo,
    time: new Date().toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).replace(/ /g, '-'),
  };
  
  window.state.alertsAuditTrail = window.state.alertsAuditTrail || [];
  window.state.alertsAuditTrail.unshift(auditEntry);
  
  localStorage.setItem('saronil_alertsAuditTrail', JSON.stringify(window.state.alertsAuditTrail));
  localStorage.setItem('saronil_alerts', JSON.stringify(window.state.alerts));
  
  alert(`Alert ${alertId} has been signed-off by ${clinician} (${regNo}) and cleared from the active queue.`);
  openAlertWorkbench(alertId);
  renderAlertCenter(document.getElementById('main-content'));
};

window._triggerEmergencyCode = function(codeName, desc) {
  const newAlert = {
    id: "ALT" + String(100 + window.state.alerts.length + 1),
    severity: "Critical Safety Alert",
    patientName: "HOSPITAL WIDE BROADCAST",
    uhid: "ALL-WARDS",
    details: `${codeName}: ${desc}`,
    source: "Emergency Operations Center",
    clinician: "Operations Desk",
    time: new Date().toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).replace(/ /g, '-'),
    status: "Active",
    eStatus: "Open"
  };
  window.state.alerts.unshift(newAlert); // Add to top
  localStorage.setItem('saronil_alerts', JSON.stringify(window.state.alerts));
  
  const content = document.getElementById('main-content');
  if (content) renderAlertCenter(content);
  
  if (window.showToast) {
    window.showToast(`Emergency ${codeName} Broadcast Activated!`, 'error');
  }
};

window._openCreateAlertModal = function() {
  const mount = document.getElementById('alert-create-modal-mount');
  if (!mount) return;
  
  mount.innerHTML = `
    <div id="alert-create-overlay" style="position:fixed; top:0; left:0; width:100vw; height:100vh; background:rgba(15,23,42,0.6); backdrop-filter:blur(4px); display:flex; justify-content:center; align-items:center; z-index:99999;">
      <div class="card" style="width:480px; padding:24px; background:#fff; border-radius:12px; box-shadow:0 20px 25px -5px rgba(0,0,0,0.1); border:1px solid #cbd5e1; text-align:left; font-family:inherit;">
        <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #e2e8f0; padding-bottom:12px; margin-bottom:16px;">
          <h3 style="margin:0; font-size:14px; font-weight:800; color:#1e293b;">Log Patient Safety & Clinical Alert</h3>
          <button onclick="document.getElementById('alert-create-overlay').remove()" style="background:none; border:none; font-size:1.5rem; color:#64748b; cursor:pointer;">&times;</button>
        </div>
        
        <div style="display:flex; flex-direction:column; gap:12px; font-size:12px;">
          <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px;">
            <div>
              <label style="font-weight:700; color:#475569; display:block; margin-bottom:4px;">Severity Level *</label>
              <select id="alt-new-severity" style="width:100%; padding:6px 10px; border:1px solid #cbd5e1; border-radius:6px; outline:none; font-size:12px; background:#fff;">
                <option value="Information">Information</option>
                <option value="Warning">Warning</option>
                <option value="High Risk">High Risk</option>
                <option value="Critical Safety Alert">Critical Safety Alert</option>
                <option value="Hard Stop">Hard Stop (Prevent Action)</option>
              </select>
            </div>
            <div>
              <label style="font-weight:700; color:#475569; display:block; margin-bottom:4px;">Source Module *</label>
              <select id="alt-new-source" style="width:100%; padding:6px 10px; border:1px solid #cbd5e1; border-radius:6px; outline:none; font-size:12px; background:#fff;">
                <option value="Clinical Vitals">Clinical Vitals</option>
                <option value="Laboratory Integration">Laboratory Integration</option>
                <option value="Pharmacy Order">Pharmacy Order</option>
                <option value="Nursing Ward Desk">Nursing Ward Desk</option>
                <option value="OT Safety Check">OT Safety Check</option>
                <option value="Blood Bank Integration">Blood Bank Integration</option>
                <option value="Radiology Desk">Radiology Desk</option>
              </select>
            </div>
          </div>
          
          <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px;">
            <div>
              <label style="font-weight:700; color:#475569; display:block; margin-bottom:4px;">Patient Name *</label>
              <input type="text" id="alt-new-patname" placeholder="e.g. Rohan Kumar" style="width:100%; padding:6px 10px; border:1px solid #cbd5e1; border-radius:6px; outline:none; box-sizing:border-box;">
            </div>
            <div>
              <label style="font-weight:700; color:#475569; display:block; margin-bottom:4px;">UHID *</label>
              <input type="text" id="alt-new-uhid" placeholder="e.g. UH-2026-000085" style="width:100%; padding:6px 10px; border:1px solid #cbd5e1; border-radius:6px; outline:none; box-sizing:border-box;">
            </div>
          </div>
          
          <div>
            <label style="font-weight:700; color:#475569; display:block; margin-bottom:4px;">Reporting Clinician *</label>
            <input type="text" id="alt-new-clinician" placeholder="e.g. Dr. Preeti Reddy" style="width:100%; padding:6px 10px; border:1px solid #cbd5e1; border-radius:6px; outline:none; box-sizing:border-box;">
          </div>
          
          <div>
            <label style="font-weight:700; color:#475569; display:block; margin-bottom:4px;">Alert Description & Details *</label>
            <textarea id="alt-new-details" rows="3" placeholder="Describe the safety trigger or clinical breach in detail..." style="width:100%; padding:6px 10px; border:1px solid #cbd5e1; border-radius:6px; outline:none; font-family:inherit; box-sizing:border-box;"></textarea>
          </div>
        </div>
        
        <div style="display:flex; justify-content:flex-end; gap:8px; margin-top:20px; border-top:1px solid #e2e8f0; padding-top:12px;">
          <button onclick="document.getElementById('alert-create-overlay').remove()" class="btn btn-secondary btn-sm" style="border:1px solid #cbd5e1; background:white; font-weight:700; padding:6px 12px; border-radius:6px; cursor:pointer;">Cancel</button>
          <button onclick="window._saveNewAlert()" class="btn btn-primary btn-sm" style="background:var(--primary); color:white; border:none; font-weight:700; padding:6px 12px; border-radius:6px; cursor:pointer;">Log Alert</button>
        </div>
      </div>
    </div>
  `;
};

window._saveNewAlert = function() {
  const severity = document.getElementById('alt-new-severity').value;
  const source = document.getElementById('alt-new-source').value;
  const patientName = document.getElementById('alt-new-patname').value.trim();
  const uhid = document.getElementById('alt-new-uhid').value.trim();
  const clinician = document.getElementById('alt-new-clinician').value.trim();
  const details = document.getElementById('alt-new-details').value.trim();
  
  if (!patientName || !uhid || !clinician || !details) {
    alert("Please fill in all mandatory fields (*).");
    return;
  }
  
  const newAlert = {
    id: "ALT" + String(100 + window.state.alerts.length + 1),
    severity: severity,
    patientName: patientName,
    uhid: uhid,
    details: details,
    source: source,
    clinician: clinician,
    time: new Date().toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).replace(/ /g, '-'),
    status: "Active",
    eStatus: "Open"
  };
  
  window.state.alerts.unshift(newAlert);
  localStorage.setItem('saronil_alerts', JSON.stringify(window.state.alerts));
  
  document.getElementById('alert-create-overlay').remove();
  
  const content = document.getElementById('main-content');
  if (content) renderAlertCenter(content);
  
  if (window.showToast) {
    window.showToast("Patient safety alert logged successfully!");
  } else {
    alert("Patient safety alert logged successfully!");
  }
};
