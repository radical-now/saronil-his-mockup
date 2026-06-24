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
    <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 1.5rem;">
      <!-- Column 1: Active Alerts Queue -->
      <div class="card">
        <div class="card-header" style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
          <div>
            <h3 class="card-title">Central Alerts Command Queue</h3>
            <p class="card-subtitle">Real-time WHO and JCI patient safety alerts, vital triggers, and pharmacy stop checks</p>
          </div>
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
                  <th>clinician / Time</th>
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

      <!-- Column 2: Alert Review & Actions Workspace -->
      <div class="card" id="alt-workbench-panel">
        <div class="card-header"><h3 class="card-title">Alert Review Workbench</h3></div>
        <div class="card-body" style="text-align: center; color: var(--text-muted); padding: 4rem 1rem;">
          📢 Select an active clinical alert from the queue to investigate details, override with notes, escalate, or resolve.
        </div>
      </div>
    </div>
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
      <h4 style="font-size: 0.95rem;">Alert Investigation: ${alertItem.id}</h4>
      <span style="font-size:0.75rem; color: var(--text-muted);">${alertItem.time}</span>
    </div>
    <div class="card-body" style="padding: 1rem; font-size: 0.85rem; display: flex; flex-direction: column; gap: 1rem;">
      <div>
        <p><strong>Patient Name:</strong> <a href="#patients?uhid=${alertItem.uhid}" class="patient-link">${alertItem.patientName}</a> (${alertItem.uhid})</p>
        <p><strong>Responsible Clinician:</strong> ${alertItem.clinician}</p>
        <p><strong>Source Module:</strong> ${alertItem.source}</p>
        <p><strong>Current Severity:</strong> <strong style="color:var(--color-danger);">${alertItem.severity}</strong></p>
        <p><strong>Escalation Status:</strong> ${alertItem.eStatus}</p>
      </div>

      <div style="background-color: var(--bg-surface-elevated); padding: 0.75rem; border-radius: 6px; border-left: 4px solid var(--primary);">
        <strong style="color: var(--text-primary);">Incident Description:</strong>
        <p style="margin-top: 0.25rem; color: var(--text-secondary); line-height: 1.4;">${alertItem.details}</p>
      </div>

      <!-- Action Panel -->
      ${alertItem.status === 'Active' ? `
        <div style="display: flex; flex-direction: column; gap: 0.75rem;">
          <div class="form-group">
            <label style="font-size: 0.8rem; font-weight: bold; margin-bottom: 0.25rem; display:block;">Clinical Override / Audit Reason</label>
            <input type="text" id="alt-override-reason" class="form-control" placeholder="Required for JCI/NABH audit log compliance..." style="font-size: 0.8rem; padding: 0.35rem;">
          </div>
          
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem;">
            <button class="btn btn-secondary" onclick="snoozeAlert('${alertItem.id}')" style="font-size: 0.8rem; padding: 0.4rem;">Snooze (15m)</button>
            <button class="btn btn-secondary" style="color: var(--color-danger); font-size: 0.8rem; padding: 0.4rem;" onclick="escalateAlert('${alertItem.id}')">Escalate Alert</button>
          </div>
          <button class="btn btn-success" style="width: 100%; font-size: 0.8rem; padding: 0.45rem;" onclick="resolveAlert('${alertItem.id}')">Resolve Alert (Sign-Off)</button>
        </div>
      ` : `
        <div style="background-color: var(--color-success-bg); color: var(--color-success); font-weight: bold; text-align: center; padding: 0.75rem; border-radius: 6px;">
          ✅ Resolved & Audited
        </div>
        <div style="font-size:0.75rem; color: var(--text-secondary);">
          <strong>Audit Trace:</strong> Clinician signed off. Action cleared. Complies with clinical safety override rules.
        </div>
      `}
    </div>
  `;
};

window.snoozeAlert = function(alertId) {
  const reason = document.getElementById('alt-override-reason').value;
  if (!reason) {
    alert('JCI compliance requires an override justification reason to snooze safety alerts.');
    return;
  }
  alert(`Alert ${alertId} has been snoozed for 15 minutes. Audit log updated.`);
  openAlertWorkbench(alertId);
};

window.escalateAlert = function(alertId) {
  const alertItem = state.alerts.find(a => a.id === alertId);
  if (alertItem) {
    alertItem.eStatus = 'Escalated';
    alert(`Alert ${alertId} escalated to Chief Medical Director & Bio-medical quality control team.`);
    openAlertWorkbench(alertId);
    renderAlertCenter(document.getElementById('main-content'));
  }
};

window.resolveAlert = function(alertId) {
  const alertItem = state.alerts.find(a => a.id === alertId);
  const reason = document.getElementById('alt-override-reason').value;
  
  if (alertItem.severity === 'Hard Stop' && !reason) {
    alert('HARD STOP ERROR: A JCI clinical safety justification is strictly mandatory to resolve Hard Stop alerts.');
    return;
  }

  if (alertItem) {
    alertItem.status = 'Resolved';
    alertItem.eStatus = 'Resolved';
    alert(`Alert ${alertId} officially signed-off and cleared.`);
    openAlertWorkbench(alertId);
    renderAlertCenter(document.getElementById('main-content'));
  }
};
