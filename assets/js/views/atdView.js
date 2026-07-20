/* ==========================================================================
   SARONIL HMS - BED BOARD & ADMISSION/TRANSFER/DISCHARGE (atdView.js)
   ========================================================================== */

// Helper status class mapping for CSS styles
const statusClassMap = {
  'Available': 'bed-available',
  'Reserved': 'bed-reserved',
  'Occupied': 'bed-occupied',
  'Vacated - Pending Housekeeping': 'bed-housekeeping-pending',
  'Housekeeping In Progress': 'bed-housekeeping-progress',
  'Isolation Cleaning Required': 'bed-isolation',
  'Maintenance Required': 'bed-maintenance',
  'Out of Service / Blocked': 'bed-out-of-service',
  // Fallbacks for older status strings
  'Vacant': 'bed-available',
  'House Keeping': 'bed-housekeeping-pending',
  'Blocked': 'bed-out-of-service'
};

window.views.atd = function(container, subAnchor, params) {
  renderBedBoard(container);
  
  // Set up real-time ticking timer to refresh elapsed times every 30 seconds
  if (window.hkTimer) clearInterval(window.hkTimer);
  window.hkTimer = setInterval(() => {
    const activeAnchor = window.location.hash.split('?')[0];
    const mainContent = document.getElementById('main-content');
    if (activeAnchor === '#atd' && mainContent) {
      renderBedBoard(mainContent);
    } else {
      clearInterval(window.hkTimer);
    }
  }, 30000);
};

window.updateHkSlaLimit = function(value) {
  const limit = parseInt(value) || 15;
  state.hkSlaLimit = limit;
  renderBedBoard(document.getElementById('main-content'));
};

function renderBedBoard(container) {
  // Compute counts
  const totalBeds = Object.keys(state.bedsStatus).length;
  const dischargingBeds = Object.values(state.bedsStatus).filter(b => {
    if (b.status !== 'Occupied' || !b.patientUhid) return false;
    const patient = state.patients.find(p => p.uhid === b.patientUhid);
    return patient && patient.dischargeStatus === 'In Progress — Clearances Pending';
  }).length;
  const occupiedBeds = Object.values(state.bedsStatus).filter(b => b.status === "Occupied").length - dischargingBeds;
  const vacantBeds = Object.values(state.bedsStatus).filter(b => b.status === "Available" || b.status === "Vacant").length;
  const reservedBeds = Object.values(state.bedsStatus).filter(b => b.status === "Reserved").length;
  const vacatedBeds = Object.values(state.bedsStatus).filter(b => b.status === "Vacated - Pending Housekeeping").length;
  const hkProgressBeds = Object.values(state.bedsStatus).filter(b => b.status === "Housekeeping In Progress").length;
  const maintBeds = Object.values(state.bedsStatus).filter(b => b.status === "Maintenance Required").length;
  const blockedBeds = Object.values(state.bedsStatus).filter(b => b.status === "Out of Service / Blocked" || b.status === "Blocked").length;
  const isoBeds = Object.values(state.bedsStatus).filter(b => b.status === "Isolation Cleaning Required").length;

  container.innerHTML = `
    <!-- Top SLA target configuration bar -->
    <div class="sla-config-bar" style="background-color: var(--bg-surface-elevated); padding: 0.75rem 1rem; border-radius: 8px; margin-bottom: 1.5rem; display: flex; align-items: center; justify-content: space-between; gap: 1rem; font-size: 0.85rem; border: 1px solid var(--border-color);">
      <div>
        <span>⏱️ <strong>Housekeeping SLA Target:</strong></span>
        <input type="number" id="hk-sla-limit-input" value="${state.hkSlaLimit || 15}" min="1" style="width: 60px; padding: 2px 6px; border-radius: 4px; border: 1px solid var(--border-color); background: var(--bg-surface); color: var(--text-primary); text-align: center;" onchange="window.updateHkSlaLimit(this.value)">
        <span>minutes before escalation alert.</span>
      </div>
      <div style="display:flex; align-items:center; gap:12px;">
        <button class="btn btn-secondary btn-sm" style="background:#1d4ed8; color:#fff;" onclick="window.showStockRequestOverlay({dept:'ATD Desk', urgency:'Routine'})">📦 Request Stock</button>
        <strong style="color: var(--text-primary);">Total Facility Beds: ${totalBeds}</strong>
      </div>
    </div>

    <!-- Main Workspace Split Layout -->
    <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 1.5rem; align-items: start;">
      
      <!-- Left Column: Wards & Bed Grid -->
      <div>
        <!-- Legend Area -->
        <div class="bed-board-header" style="background-color: var(--bg-surface); padding: 0.75rem 1rem; border-radius: 8px; border: 1px solid var(--border-color); margin-bottom: 1.5rem;">
          <div class="bed-legend" style="display: flex; flex-wrap: wrap; gap: 0.85rem; font-size: 0.72rem; justify-content: space-between; align-items: center;">
            <div class="legend-item" style="display: flex; align-items: center; gap: 0.35rem;"><div class="legend-color" style="background-color: var(--color-success); width: 12px; height: 12px; border-radius: 3px;"></div> Available (${vacantBeds})</div>
            <div class="legend-item" style="display: flex; align-items: center; gap: 0.35rem;"><div class="legend-color" style="background-color: var(--primary); width: 12px; height: 12px; border-radius: 3px;"></div> Reserved (${reservedBeds})</div>
            <div class="legend-item" style="display: flex; align-items: center; gap: 0.35rem;"><div class="legend-color" style="background-color: var(--color-purple); width: 12px; height: 12px; border-radius: 3px;"></div> Occupied (${occupiedBeds})</div>
            <div class="legend-item" style="display: flex; align-items: center; gap: 0.35rem;"><div class="legend-color" style="background-color: #f97316; width: 12px; height: 12px; border-radius: 3px;"></div> Discharging (${dischargingBeds})</div>
            <div class="legend-item" style="display: flex; align-items: center; gap: 0.35rem;"><div class="legend-color" style="background-color: #f59e0b; width: 12px; height: 12px; border-radius: 3px;"></div> Vacated (${vacatedBeds})</div>
            <div class="legend-item" style="display: flex; align-items: center; gap: 0.35rem;"><div class="legend-color" style="background-color: #fbbf24; width: 12px; height: 12px; border-radius: 3px;"></div> In Progress (${hkProgressBeds})</div>
            <div class="legend-item" style="display: flex; align-items: center; gap: 0.35rem;"><div class="legend-color" style="background-color: #ec4899; width: 12px; height: 12px; border-radius: 3px;"></div> Isolation (${isoBeds})</div>
            <div class="legend-item" style="display: flex; align-items: center; gap: 0.35rem;"><div class="legend-color" style="background-color: #b91c1c; width: 12px; height: 12px; border-radius: 3px;"></div> Maint (${maintBeds})</div>
            <div class="legend-item" style="display: flex; align-items: center; gap: 0.35rem;"><div class="legend-color" style="background-color: #4b5563; width: 12px; height: 12px; border-radius: 3px;"></div> Blocked / OOS (${blockedBeds})</div>
          </div>
        </div>

        <div id="wards-grid-container" style="display: flex; flex-direction: column; gap: 1.5rem;">
          <!-- Wards rendered here dynamically -->
        </div>
      </div>

      <!-- Right Column: Housekeeping Worklist & SLA Monitor -->
      <div class="card" style="box-shadow: var(--shadow-sm); border: 1px solid var(--border-color);">
        <div class="card-header" style="border-bottom: 1px solid var(--border-color); background-color: var(--bg-surface-elevated); padding: 0.75rem 1rem;">
          <h3 class="card-title" style="font-size: 0.95rem; margin: 0; font-weight: 700; display: flex; align-items: center; gap: 0.5rem;">🧹 Housekeeping Worklist</h3>
        </div>
        <div class="card-body" style="padding: 1rem; display: flex; flex-direction: column; gap: 1rem; max-height: 600px; overflow-y: auto;">
          <div id="housekeeping-tasks-list">
            <!-- Housekeeping tasks rendered dynamically -->
          </div>
        </div>
      </div>

    </div>

    <!-- Bed Audit Trail Log Section (Immutable logs) -->
    <div class="card" style="margin-top: 2rem; border: 1px solid var(--border-color);">
      <div class="card-header" style="border-bottom: 1px solid var(--border-color); padding: 0.75rem 1rem; display: flex; justify-content: space-between; align-items: center;">
        <h3 class="card-title" style="font-size: 0.95rem; margin: 0; font-weight: 700;">📜 Bed Occupancy & Movement Audit Trail</h3>
        <span style="font-size: 0.75rem; color: var(--text-muted);">Compliance Standard: JCI/NABH IMMUTABLE</span>
      </div>
      <div class="card-body" style="padding: 0; overflow-x: auto; max-height: 250px; overflow-y: auto;">
        <table class="custom-table" style="font-size: 0.75rem; margin: 0;">
          <thead style="position: sticky; top: 0; background: var(--bg-surface); z-index: 1;">
            <tr>
              <th>Timestamp</th>
              <th>Bed ID</th>
              <th>Ward</th>
              <th>Patient UHID</th>
              <th>Action Performed</th>
              <th>Previous Status</th>
              <th>New Status</th>
              <th>Operator</th>
              <th>Remarks</th>
            </tr>
          </thead>
          <tbody id="bed-audit-logs-body">
            <!-- Bed logs rendered dynamically -->
          </tbody>
        </table>
      </div>
    </div>

    <!-- Transfers Log Section -->
    <div class="card" style="margin-top: 1.5rem; border: 1px solid var(--border-color);">
      <div class="card-header" style="border-bottom: 1px solid var(--border-color); padding: 0.75rem 1rem; display: flex; justify-content: space-between; align-items: center;">
        <h3 class="card-title" style="font-size: 0.95rem; margin: 0; font-weight: 700;">🔄 Transfers Log</h3>
        <span style="font-size: 0.75rem; color: var(--text-muted);">All intra-facility bed transfers — latest first</span>
      </div>
      <div class="card-body" style="padding: 0; overflow-x: auto;">
        <table class="custom-table" style="font-size: 0.75rem; margin: 0;">
          <thead style="position: sticky; top: 0; background: var(--bg-surface); z-index: 1;">
            <tr>
              <th>Date</th>
              <th>Patient</th>
              <th>UHID</th>
              <th>From Bed</th>
              <th>To Bed</th>
              <th>Ward</th>
              <th>Reason</th>
              <th>Consultant</th>
            </tr>
          </thead>
          <tbody id="transfers-log-body">
            <!-- Populated dynamically -->
          </tbody>
        </table>
      </div>
    </div>

    <!-- Bed Action Modal -->
    <div id="bed-action-modal" class="modal" style="display: none;">
      <div class="modal-content" style="max-width: 480px; background: var(--bg-surface); border-radius: 12px; border: 1px solid var(--border-color); box-shadow: var(--shadow-lg);">
        <div class="modal-header" style="border-bottom: 1px solid var(--border-color); padding: 1rem; display: flex; justify-content: space-between; align-items: center;">
          <h4 id="modal-bed-title" style="margin:0; font-weight: 700;">Bed Details</h4>
          <span class="modal-close" style="cursor:pointer; font-size:1.5rem;" onclick="window.closeBedModal()">&times;</span>
        </div>
        <div class="modal-body" id="modal-bed-body" style="padding: 1rem;">
          <!-- Populated dynamically -->
        </div>
      </div>
    </div>
  `;

  // Render ward sections
  const gridContainer = document.getElementById('wards-grid-container');
  const slaLimit = state.hkSlaLimit || 15;
  let slaBreachCount = 0;
  
  for (const [wardKey, wardInfo] of Object.entries(state.wards)) {
    const floorSection = document.createElement('div');
    floorSection.className = 'bed-floor-section';

    // Filter beds belonging to this ward
    const beds = wardInfo.beds;
    let bedHTML = '';
    
    beds.forEach(bedId => {
      // Auto-initialize missing bed entries (e.g. newly added wards not yet seeded)
      if (!state.bedsStatus[bedId]) {
        state.bedsStatus[bedId] = { wardKey: wardKey, status: 'Available', patientUhid: null, notes: '' };
      }
      const statusObj = state.bedsStatus[bedId];
      let statusClass = statusClassMap[statusObj.status] || 'bed-available';
      let patientName = '';
      let elapsedHTML = '';
      let displayStatus = statusObj.status;
      
      if (statusObj.status === 'Occupied' && statusObj.patientUhid) {
        const patient = state.patients.find(p => p.uhid === statusObj.patientUhid);
        patientName = patient ? patient.name : 'Unknown Patient';
        if (patient && patient.dischargeStatus === 'In Progress — Clearances Pending') {
          statusClass = 'bed-discharge-progress';
          displayStatus = 'Discharge in progress';
        }
      }

      // Compute SLA elapsed time for housekeeping pending
      if (statusObj.status === 'Vacated - Pending Housekeeping' && statusObj.transitionTimestamp) {
        const diffMs = new Date() - new Date(statusObj.transitionTimestamp);
        const diffMins = Math.floor(diffMs / 60000);
        const isBreached = diffMins >= slaLimit;
        
        if (isBreached) {
          statusClass += ' sla-breached-alert';
          slaBreachCount++;
        }
        
        elapsedHTML = `
          <div class="elapsed-time" style="font-size: 0.72rem; font-weight: bold; margin-top: 0.35rem; color: ${isBreached ? 'var(--color-danger)' : '#d97706'};">
            ⏱️ ${diffMins} min${diffMins !== 1 ? 's' : ''} ago
            ${isBreached ? '<span class="badge" style="background-color: var(--color-danger); color: white; padding: 1px 4px; border-radius: 3px; font-size: 0.62rem; margin-left: 0.25rem;">SLA OVERDUE</span>' : ''}
          </div>
        `;
      }

      bedHTML += `
        <div class="bed-card ${statusClass}" onclick="openBedModal('${bedId}')">
          <div class="bed-card-top">
            <span class="bed-name">${bedId}</span>
            <span class="bed-icon">🛏️</span>
          </div>
          <span class="bed-status-text">${displayStatus}</span>
          ${elapsedHTML}
          ${patientName ? `<div class="bed-patient-name" title="${patientName}"><a href="#patients?uhid=${statusObj.patientUhid}" class="patient-link" style="color: inherit; font-size: inherit;" onclick="event.stopPropagation(); closeBedModal();">${patientName}</a></div>` : ''}
        </div>
      `;
    });

    floorSection.innerHTML = `
      <h3 class="floor-title" style="margin-top: 0; margin-bottom: 0.75rem;">${wardInfo.name} <span style="font-size: 0.8rem; font-weight: normal; color: var(--text-muted);"> (₹${wardInfo.price.toLocaleString('en-IN')}/day)</span></h3>
      <div class="beds-grid">
        ${bedHTML}
      </div>
    `;

    gridContainer.appendChild(floorSection);
  }

  // Update SLA Counter Alert
  const breachCounterDiv = document.getElementById('sla-breach-counter');
  if (breachCounterDiv) {
    if (slaBreachCount > 0) {
      breachCounterDiv.innerHTML = `⚠️ ${slaBreachCount} Housekeeping SLA Breach${slaBreachCount > 1 ? 'es' : ''} Detected!`;
      breachCounterDiv.style.display = 'block';
    } else {
      breachCounterDiv.style.display = 'none';
    }
  }

  // Render Housekeeping Task List
  renderHousekeepingList();

  // Render Audit Logs
  renderAuditLogs();

  // Render Transfers Log
  renderTransfersLog();
}

function renderHousekeepingList() {
  const listContainer = document.getElementById('housekeeping-tasks-list');
  if (!listContainer) return;

  const activeTasks = (state.housekeepingTasks || []).filter(t => t.status !== 'Completed');

  if (activeTasks.length === 0) {
    listContainer.innerHTML = `
      <div style="text-align: center; padding: 2rem 1rem; color: var(--text-muted);">
        <span style="font-size: 1.5rem;">✔️</span>
        <p style="margin: 0.5rem 0 0 0; font-size: 0.8rem;">All beds are currently clean and cleared.</p>
      </div>
    `;
    return;
  }

  let tasksHTML = '';
  const slaLimit = state.hkSlaLimit || 15;

  activeTasks.forEach(task => {
    const createdDate = new Date(task.createdAt);
    const diffMs = new Date() - createdDate;
    const elapsedMins = Math.floor(diffMs / 60000);
    const isBreached = elapsedMins >= slaLimit;
    
    let priorityBadgeColor = 'background-color: var(--primary-glow); color: var(--primary);';
    if (task.priority === 'High') {
      priorityBadgeColor = 'background-color: var(--color-danger-bg); color: var(--color-danger); font-weight: bold;';
    }

    let actionButtonHTML = '';
    if (task.status === 'Pending') {
      actionButtonHTML = `<button class="btn btn-secondary" style="font-size: 0.72rem; padding: 0.25rem 0.5rem; width: 100%;" onclick="startCleaningTask('${task.taskId}')">🧼 Start Cleaning</button>`;
    } else if (task.status === 'In Progress') {
      actionButtonHTML = `<button class="btn btn-success" style="font-size: 0.72rem; padding: 0.25rem 0.5rem; width: 100%;" onclick="completeCleaningTask('${task.taskId}')">✔️ Complete Cleaning</button>`;
    }

    tasksHTML += `
      <div class="task-card" style="border: 1px solid var(--border-color); border-radius: 8px; padding: 0.75rem; background-color: var(--bg-surface); display: flex; flex-direction: column; gap: 0.5rem; margin-bottom: 0.75rem; ${isBreached ? 'border-color: var(--color-danger); box-shadow: 0 0 4px rgba(239, 68, 68, 0.2);' : ''}">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span style="font-weight: 700; font-size: 0.85rem;">Bed ${task.bedId}</span>
          <span class="badge" style="font-size: 0.65rem; padding: 2px 6px; border-radius: 4px; ${priorityBadgeColor}">${task.priority} Priority</span>
        </div>
        <div style="font-size: 0.75rem; color: var(--text-muted);">
          <div>Ward: ${state.wards[task.wardKey]?.name || task.wardKey}</div>
          <div>Status: <span style="font-weight: 600; color: ${task.status === 'In Progress' ? '#eab308' : '#d97706'};">${task.status}</span></div>
          <div style="margin-top: 0.25rem; font-weight: 600; color: ${isBreached ? 'var(--color-danger)' : 'inherit'};">
            ⏱️ Elapsed: ${elapsedMins} min${elapsedMins !== 1 ? 's' : ''} ${isBreached ? '(SLA Breach)' : ''}
          </div>
        </div>
        <div style="margin-top: 0.25rem;">
          ${actionButtonHTML}
        </div>
      </div>
    `;
  });

  listContainer.innerHTML = tasksHTML;
}

function renderAuditLogs() {
  const tbody = document.getElementById('bed-audit-logs-body');
  if (!tbody) return;

  const logs = state.bedAuditLogs || [];
  if (logs.length === 0) {
    tbody.innerHTML = `<tr><td colspan="9" style="text-align: center; color: var(--text-muted);">No bed movement logs recorded.</td></tr>`;
    return;
  }

  // Show latest logs first
  const sortedLogs = [...logs].reverse();

  tbody.innerHTML = sortedLogs.map(log => {
    const dateStr = new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' ' + new Date(log.timestamp).toLocaleDateString();
    return `
      <tr>
        <td><strong>${dateStr}</strong></td>
        <td><strong style="color: var(--primary);">${log.bedId}</strong></td>
        <td>${state.wards[log.wardKey]?.name || log.wardKey || 'N/A'}</td>
        <td>${log.patientId ? `<a href="#patients?uhid=${log.patientId}" class="patient-link" onclick="window.closeBedModal();">${log.patientId}</a>` : 'N/A'}</td>
        <td><span class="badge" style="background-color: var(--bg-surface-elevated); color: var(--text-primary); font-size: 0.65rem;">${log.action}</span></td>
        <td><span style="color: var(--text-muted);">${log.prevStatus}</span></td>
        <td><strong style="color: ${log.newStatus === 'Available' ? 'var(--color-success)' : (log.newStatus === 'Occupied' ? 'var(--color-purple)' : '#d97706')};">${log.newStatus}</strong></td>
        <td>${log.user} (${log.role})</td>
        <td title="${log.remarks || ''}">${log.remarks ? (log.remarks.length > 25 ? log.remarks.substring(0, 25) + '...' : log.remarks) : '-'}</td>
      </tr>
    `;
  }).join('');
}

function renderTransfersLog() {
  const tbody = document.getElementById('transfers-log-body');
  if (!tbody) return;

  // Collect all transferLogs from every admission, annotated with patient info
  const allTransfers = [];
  (state.admissions || []).forEach(adm => {
    if (!adm.transferLogs || adm.transferLogs.length === 0) return;
    const patient = (state.patients || []).find(p => p.uhid === adm.patientId || p.uhid === adm.uhid);
    const patientName = patient ? patient.name : (adm.patientName || '-');
    const uhid = adm.patientId || adm.uhid || '-';
    const consultant = adm.primaryConsultant || (patient && patient.primaryConsultant) || '-';
    // Resolve destination ward from the dest bed
    adm.transferLogs.forEach(t => {
      const destBedStatus = state.bedsStatus ? state.bedsStatus[t.dest] : null;
      let ward = '-';
      if (destBedStatus && destBedStatus.wardKey && state.wards && state.wards[destBedStatus.wardKey]) {
        ward = state.wards[destBedStatus.wardKey].name;
      } else {
        // fallback: search wards
        for (const [wk, wi] of Object.entries(state.wards || {})) {
          if ((wi.beds || []).includes(t.dest)) { ward = wi.name; break; }
        }
      }
      allTransfers.push({ date: t.date, patientName, uhid, source: t.source, dest: t.dest, ward, reason: t.reason || '-', consultant });
    });
  });

  if (allTransfers.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; padding:1.5rem; color:var(--text-muted); font-style:italic;">No intra-facility transfers recorded yet.</td></tr>`;
    return;
  }

  // Latest first (sort by date descending)
  allTransfers.sort((a, b) => (b.date > a.date ? 1 : b.date < a.date ? -1 : 0));

  tbody.innerHTML = allTransfers.map(t => `
    <tr>
      <td style="white-space:nowrap;">${t.date}</td>
      <td style="font-weight:600; color:var(--primary);">${t.patientName}</td>
      <td class="admin-mono" style="font-size:0.7rem;">${t.uhid}</td>
      <td><span class="badge badge-danger" style="font-size:0.68rem;">${t.source}</span></td>
      <td><span class="badge badge-success" style="font-size:0.68rem;">${t.dest}</span></td>
      <td style="font-size:0.72rem; color:var(--text-secondary);">${t.ward}</td>
      <td style="font-size:0.72rem; max-width:180px; white-space:normal;">${t.reason}</td>
      <td style="font-size:0.72rem;">${t.consultant}</td>
    </tr>
  `).join('');
}

window.startCleaningTask = function(taskId) {
  const task = state.housekeepingTasks.find(t => t.taskId === taskId);
  if (task) {
    task.status = 'In Progress';
    task.assignedStaff = 'HK Staff Team C';
    const bedId = task.bedId;
    if (state.bedsStatus[bedId]) {
      const prev = state.bedsStatus[bedId].status;
      state.bedsStatus[bedId].status = 'Housekeeping In Progress';
      
      // Log Bed Movement
      state.logBedMovement({
        bedId: bedId,
        wardKey: state.bedsStatus[bedId].wardKey,
        prevStatus: prev,
        newStatus: 'Housekeeping In Progress',
        action: 'Housekeeping Initiated',
        remarks: 'Cleaning staff started sanitization cycle'
      });
    }
    renderBedBoard(document.getElementById('main-content'));
  }
};

window.completeCleaningTask = function(taskId) {
  const task = state.housekeepingTasks.find(t => t.taskId === taskId);
  if (task) {
    task.status = 'Completed';
    const bedId = task.bedId;
    if (state.bedsStatus[bedId]) {
      const prev = state.bedsStatus[bedId].status;
      state.bedsStatus[bedId].status = 'Available';
      state.bedsStatus[bedId].transitionTimestamp = null;
      
      // Log Bed Movement
      state.logBedMovement({
        bedId: bedId,
        wardKey: state.bedsStatus[bedId].wardKey,
        prevStatus: prev,
        newStatus: 'Available',
        action: 'Housekeeping Completed',
        remarks: 'Bed cleaned, sanitized, and cleared for admissions'
      });
    }
    renderBedBoard(document.getElementById('main-content'));
  }
};

// Modal handling
window.closeBedModal = function() {
  const modal = document.getElementById('bed-action-modal');
  if (modal) {
    modal.classList.remove('active');
    modal.style.display = 'none';
  }
};

window.openBedModal = function(bedId) {
  let modal = document.getElementById('bed-action-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'bed-action-modal';
    modal.className = 'modal';
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.width = '100vw';
    modal.style.height = '100vh';
    modal.style.backgroundColor = 'rgba(15, 23, 42, 0.6)';
    modal.style.backdropFilter = 'blur(4px)';
    modal.style.display = 'none';
    modal.style.justifyContent = 'center';
    modal.style.alignItems = 'center';
    modal.style.zIndex = '2000';

    modal.innerHTML = `
      <div class="modal-content" style="max-width: 480px; width: 90%; background: #ffffff; border-radius: 16px; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04); font-family: 'Inter', sans-serif; overflow: hidden; border: 1px solid #e2e8f0;">
        <div class="modal-header" style="border-bottom: 1px solid #e2e8f0; padding: 1.25rem; display: flex; justify-content: space-between; align-items: center;">
          <h4 id="modal-bed-title" style="margin:0; font-weight: 700; color: #1e293b; font-size: 1.1rem;">Bed Details</h4>
          <span class="modal-close" style="cursor:pointer; font-size:1.5rem; color: #94a3b8; font-weight: 700;" onclick="window.closeBedModal()">&times;</span>
        </div>
        <div class="modal-body" id="modal-bed-body" style="padding: 1.25rem;">
          <!-- Populated dynamically -->
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  }

  const title = document.getElementById('modal-bed-title');
  const body = document.getElementById('modal-bed-body');
  
  if (!modal || !title || !body) return;

  const statusObj = state.bedsStatus[bedId] || { wardKey: null, status: 'Unknown', patientUhid: null, notes: '' };
  


  const wardInfo = statusObj.wardKey ? (state.wards[statusObj.wardKey] || { name: statusObj.wardKey, price: 1500 }) : { name: 'Unknown Ward', price: 1500 };
  
  title.innerText = `Bed Action: ${bedId}`;
  modal.classList.add('active');
  modal.style.display = 'flex';

  let patientInfoHTML = '';
  let actionsHTML = '';

  if (statusObj.status === 'Occupied') {
    const patient = state.patients.find(p => p.uhid === statusObj.patientUhid);
    let admission = state.admissions.find(a => a.uhid === statusObj.patientUhid && a.status === 'Active');
    if (!admission && statusObj.wardKey === 'DAYCARE') {
      const activeAdmissions = window.state.daycareAdmissions || [];
      admission = activeAdmissions.find(a => a.patient.uhid === statusObj.patientUhid && a.status !== 'Cleared & Discharged');
    }
    
    const admissionDate = admission ? (admission.date || (admission.admissionTimestamp ? new Date(admission.admissionTimestamp).toLocaleDateString() : 'N/A')) : 'N/A';

    patientInfoHTML = `
      <div style="background-color: #eff6ff; border: 1.5px solid #bfdbfe; border-radius: 12px; padding: 1rem; margin-bottom: 1rem; text-align: left; box-shadow: 0 1px 2px rgba(0,0,0,0.02);">
        <h5 style="margin-top: 0; margin-bottom: 0.5rem; color: #2563eb; font-weight: 700; font-size: 0.95rem;">Patient Information</h5>
        <p style="margin: 0 0 0.25rem 0; font-size: 0.85rem;"><strong>Name:</strong> ${patient ? `<a href="#patients?uhid=${patient.uhid}" class="patient-link" style="color: #2563eb; font-weight: 700; text-decoration: underline;" onclick="window.closeBedModal();">${patient.name}</a>` : 'N/A'}</p>
        <p style="margin: 0 0 0.25rem 0; font-size: 0.85rem;"><strong>UHID:</strong> ${statusObj.patientUhid}</p>
        <p style="margin: 0 0 0.25rem 0; font-size: 0.85rem;"><strong>Admitted Date:</strong> ${admissionDate}</p>
        <p style="margin: 0 0 0.25rem 0; font-size: 0.85rem;"><strong>Doctor In-charge:</strong> ${patient ? (patient.primaryConsultant || 'Dr. Mehta') : 'Dr. Mehta'}</p>
        <p style="margin: 0; font-size: 0.85rem;"><strong>Diagnosis:</strong> ${patient ? (patient.clinicalData?.diagnosis || 'Evaluation') : 'Evaluation'}</p>
        ${admission?.procedureName ? `<p style="margin: 0.25rem 0 0 0; font-size: 0.85rem;"><strong>Day Care Procedure:</strong> ${admission.procedureName}</p>` : ''}
      </div>
    `;

    actionsHTML = `
      <div style="display: flex; flex-direction: column; gap: 0.75rem; width: 100%; box-sizing: border-box;">
        <button class="btn btn-primary" style="background-color: #2563eb; color: white; border: none; padding: 10px; border-radius: 8px; font-weight: 700; width: 100%; cursor: pointer; font-size: 0.9rem; text-align: center; box-sizing: border-box;" onclick="initiateBedTransfer('${bedId}')">Transfer Bed</button>
        <button class="btn btn-danger" style="background-color: #fef2f2; border: 1.5px solid #fca5a5; color: #b91c1c; padding: 10px; border-radius: 8px; font-weight: 700; width: 100%; cursor: pointer; font-size: 0.9rem; text-align: center; box-sizing: border-box;" onclick="dischargePatientFromBed('${bedId}')">Approve Discharge & Initiate Billing</button>
        <button class="btn btn-secondary" disabled title="Bed can be sent for housekeeping only after patient discharge, transfer, or bed vacation." style="background-color: #f8fafc; border: 1.5px solid #e2e8f0; color: #94a3b8; padding: 10px; border-radius: 8px; font-weight: 700; width: 100%; cursor: not-allowed; font-size: 0.9rem; text-align: center; box-sizing: border-box; opacity: 0.6;">Send to House Keeping</button>
        ${statusObj.wardKey === 'DAYCARE' ? `
          <button class="btn btn-primary" style="background-color: #7c3aed; color: white; border: none; padding: 10px; border-radius: 8px; font-weight: 700; width: 100%; cursor: pointer; font-size: 0.9rem; text-align: center; box-sizing: border-box; margin-top: 4px;" onclick="window.closeBedModal(); window.selectedDaycareBed = '${bedId}'; router.navigate('daybed');">Go to Day Care Clinical Flow</button>
        ` : ''}
      </div>
    `;
  } else if (statusObj.status === 'Available' || statusObj.status === 'Vacant') {
    patientInfoHTML = `
      <p style="color: var(--text-muted); margin-bottom: 1.5rem;">This bed is clean, available, and ready for patient allotment.</p>
    `;
    if (statusObj.wardKey === 'DAYCARE') {
      actionsHTML = `
        <div style="display: flex; flex-direction: column; gap: 0.75rem;">
          <button class="btn btn-primary" onclick="window.closeBedModal(); window.selectedDaycareBed = '${bedId}'; router.navigate('daybed');">Admit Patient (Day Care)</button>
          <button class="btn btn-danger" onclick="markBedStatus('${bedId}', 'Out of Service / Blocked')">Block Bed / Out of Service</button>
        </div>
      `;
    } else {
      actionsHTML = `
        <div style="display: flex; flex-direction: column; gap: 0.75rem;">
          <button class="btn btn-primary" onclick="router.navigate('ipdAdmission?bed=${bedId}')">Admit Patient on this Bed</button>
          <button class="btn btn-secondary" onclick="initiateBedReservation('${bedId}')">Reserve Bed</button>
          <button class="btn btn-danger" onclick="markBedStatus('${bedId}', 'Out of Service / Blocked')">Block Bed / Out of Service</button>
        </div>
      `;
    }
  } else if (statusObj.status === 'Reserved') {
    const patient = state.patients.find(p => p.uhid === statusObj.patientUhid);
    patientInfoHTML = `
      <div style="background-color: var(--bg-surface-elevated); padding: 1rem; border-radius: 8px; margin-bottom: 1.5rem; border: 1px solid var(--border-color);">
        <h5 style="margin-bottom: 0.5rem; color: var(--primary); font-weight:700;">Temporary Reservation</h5>
        <p><strong>Patient Name:</strong> ${patient ? patient.name : 'Unknown'}</p>
        <p><strong>UHID:</strong> ${statusObj.patientUhid || 'N/A'}</p>
        <p style="margin-bottom:0; color:var(--text-muted);">Bed is reserved. Cancel or confirm admission below.</p>
      </div>
    `;
    actionsHTML = `
      <div style="display: flex; flex-direction: column; gap: 0.75rem;">
        <button class="btn btn-primary" onclick="router.navigate('ipdAdmission?bed=${bedId}&uhid=${statusObj.patientUhid}')">Confirm Admission</button>
        <button class="btn btn-secondary" onclick="markBedStatus('${bedId}', 'Available')">Cancel Reservation</button>
      </div>
    `;
  } else if (statusObj.status === 'Vacated - Pending Housekeeping') {
    patientInfoHTML = `
      <p style="color: var(--text-warning); margin-bottom: 1.5rem;">🧹 Bed has been vacated. Housekeeping cleaning assignment is pending.</p>
    `;
    actionsHTML = `
      <div style="display: flex; flex-direction: column; gap: 0.75rem;">
        <button class="btn btn-primary" onclick="markBedStatus('${bedId}', 'Housekeeping In Progress')">Start Cleaning (In Progress)</button>
        <button class="btn btn-secondary" onclick="markBedStatus('${bedId}', 'Maintenance Required')">Mark Maintenance Required</button>
        <button class="btn btn-danger" onclick="markBedStatus('${bedId}', 'Out of Service / Blocked')">Mark Out of Service</button>
      </div>
    `;
  } else if (statusObj.status === 'Housekeeping In Progress') {
    patientInfoHTML = `
      <p style="color: #fbbf24; margin-bottom: 1.5rem;">🧼 Sanitization and disinfection cycle is currently in progress.</p>
    `;
    actionsHTML = `
      <div style="display: flex; flex-direction: column; gap: 0.75rem;">
        <button class="btn btn-success" onclick="markBedStatus('${bedId}', 'Available')">Complete Cleaning (Set Available)</button>
        <button class="btn btn-secondary" onclick="markBedStatus('${bedId}', 'Maintenance Required')">Mark Maintenance Required</button>
      </div>
    `;
  } else if (statusObj.status === 'Isolation Cleaning Required') {
    patientInfoHTML = `
      <div style="background-color: rgba(236, 72, 153, 0.05); border: 1px solid #ec4899; padding: 1rem; border-radius: 8px; margin-bottom: 1.5rem;">
        <h5 style="color: #ec4899; margin: 0 0 0.5rem 0; font-weight: bold; display: flex; align-items: center; gap: 0.25rem;">☣️ Biohazard / Isolation Alert</h5>
        <p style="margin: 0; font-size: 0.8rem; color: var(--text-primary);">This bed is flagged for isolation risk. Dedicated deep disinfection is mandatory. Additional infection control clearance required before releasing.</p>
      </div>
    `;
    actionsHTML = `
      <div style="display: flex; flex-direction: column; gap: 0.75rem;">
        <button class="btn btn-danger" onclick="markBedStatus('${bedId}', 'Available')">Log Infection Control Clearance (Set Available)</button>
      </div>
    `;
  } else if (statusObj.status === 'Maintenance Required') {
    patientInfoHTML = `
      <p style="color: var(--color-danger); margin-bottom: 1.5rem;">🔧 Bed is out of service due to electrical or mechanical maintenance issue.</p>
    `;
    actionsHTML = `
      <div style="display: flex; flex-direction: column; gap: 0.75rem;">
        <button class="btn btn-success" onclick="markBedStatus('${bedId}', 'Available')">Resolve maintenance (Set Available)</button>
        <button class="btn btn-danger" onclick="markBedStatus('${bedId}', 'Out of Service / Blocked')">Mark Out of Service / Blocked</button>
      </div>
    `;
  } else if (statusObj.status === 'Out of Service / Blocked' || statusObj.status === 'Blocked') {
    patientInfoHTML = `
      <p style="color: var(--color-danger); margin-bottom: 1.5rem;">⚠️ This bed is blocked temporarily for renovation or deep isolation prep.</p>
    `;
    actionsHTML = `
      <div style="display: flex; flex-direction: column; gap: 0.75rem;">
        <button class="btn btn-success" onclick="markBedStatus('${bedId}', 'Available')">Release Block (Set Available)</button>
      </div>
    `;
  }

  body.innerHTML = `
    <div style="margin-bottom: 1.25rem; font-size: 0.9rem;">
      <p style="margin-bottom: 0.35rem;"><strong>Ward Room:</strong> ${wardInfo.name}</p>
      <p style="margin-bottom: 0.35rem;"><strong>Daily Tariff:</strong> ₹${wardInfo.price.toLocaleString('en-IN')}/day</p>
      <p style="margin-bottom: 0.35rem;"><strong>Current Status:</strong> <span style="font-weight: 700;">${statusObj.status}</span></p>
    </div>
    ${patientInfoHTML}
    ${actionsHTML}
  `;
};

window.initiateBedReservation = function(bedId) {
  let optionsHTML = '';
  // Show registered outpatient files
  state.patients.filter(p => p.status !== 'Admitted').forEach(p => {
    optionsHTML += `<option value="${p.uhid}">${p.name} (${p.uhid})</option>`;
  });
  
  const body = document.getElementById('modal-bed-body');
  body.innerHTML = `
    <p style="margin-bottom: 1rem;">Reserve bed <strong>${bedId}</strong> temporarily for an incoming admission.</p>
    <div class="form-group" style="margin-bottom: 1.5rem;">
      <label>Choose Registered Patient</label>
      <select id="reserve-patient-uhid" class="form-select">
        ${optionsHTML || '<option value="">No patients available for reservation</option>'}
      </select>
    </div>
    <div style="display: flex; gap: 1rem;">
      <button class="btn btn-secondary" style="flex: 1;" onclick="openBedModal('${bedId}')">Back</button>
      <button class="btn btn-primary" style="flex: 1;" onclick="executeBedReservation('${bedId}')">Confirm Reservation</button>
    </div>
  `;
};

window.executeBedReservation = function(bedId) {
  const uhid = document.getElementById('reserve-patient-uhid').value;
  if (!uhid) {
    alert('Please select a patient.');
    return;
  }
  
  const prevStatus = state.bedsStatus[bedId] ? state.bedsStatus[bedId].status : 'Available';
  state.bedsStatus[bedId] = {
    wardKey: state.bedsStatus[bedId].wardKey,
    status: 'Reserved',
    patientUhid: uhid,
    notes: `Bed reserved for patient ${uhid}`
  };
  
  // Log movement
  state.logBedMovement({
    patientId: uhid,
    bedId: bedId,
    wardKey: state.bedsStatus[bedId].wardKey,
    prevStatus: prevStatus,
    newStatus: 'Reserved',
    action: 'Bed Reservation',
    remarks: 'Reserved bed coordinates for upcoming admission'
  });
  
  const patientObj = state.patients.find(p => p.uhid === uhid);
  if (patientObj) {
    const todayStr = new Date().toLocaleDateString('en-CA');
    const nowTime = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    patientObj.timelineEvents = patientObj.timelineEvents || [];
    patientObj.timelineEvents.unshift({
      date: `${todayStr} ${nowTime}`,
      type: 'clinical',
      icon: '🛏️',
      title: 'Bed Reserved',
      desc: `Bed ${bedId} reserved in ward ${state.bedsStatus[bedId].wardKey}`
    });
  }

  closeBedModal();
  renderBedBoard(document.getElementById('main-content'));
};

window.markBedStatus = function(bedId, newStatus) {
  if (state.bedsStatus[bedId]) {
    // Validate the bed status change against active JCI validation rules
    const check = state.validate('Bed Status Update', { bedId, newStatus });
    if (check && check.status === 'BLOCK') {
      alert(check.message);
      return;
    }

    const prev = state.bedsStatus[bedId].status;
    state.bedsStatus[bedId].status = newStatus;
    
    if (newStatus !== 'Occupied' && newStatus !== 'Reserved') {
      state.bedsStatus[bedId].patientUhid = null;
      state.bedsStatus[bedId].transitionTimestamp = null;
    }

    // Clean up active housekeeping task if marked Available
    if (newStatus === 'Available') {
      if (typeof state.completeHousekeepingTasks === 'function') {
        state.completeHousekeepingTasks(bedId);
      } else {
        const taskIndex = (state.housekeepingTasks || []).findIndex(t => t.bedId === bedId && t.status !== 'Completed');
        if (taskIndex !== -1) {
          state.housekeepingTasks[taskIndex].status = 'Completed';
        }
      }
    }

    // Auto trigger housekeeping request if marked vacated/dirty
    if (newStatus === 'Vacated - Pending Housekeeping' || newStatus === 'Cleaning') {
      if (typeof state.triggerHousekeepingRequest === 'function') {
        state.triggerHousekeepingRequest(bedId, state.bedsStatus[bedId].wardKey, `Manual status change to ${newStatus}`);
      }
    }

    // Log Bed Movement
    state.logBedMovement({
      bedId: bedId,
      wardKey: state.bedsStatus[bedId].wardKey,
      prevStatus: prev,
      newStatus: newStatus,
      action: 'Status Correction',
      remarks: `Manual status change to ${newStatus}`
    });

    closeBedModal();
    renderBedBoard(document.getElementById('main-content'));
  }
};

window.initiateBedTransfer = function(currentBedId) {
  const statusObj = state.bedsStatus[currentBedId];
  if (statusObj && statusObj.patientUhid) {
    closeBedModal();
    window.showUniversalTransferWorkflow(statusObj.patientUhid, currentBedId);
  } else {
    alert("No patient currently assigned to this bed.");
  }
};

window.executeBedTransfer = function(currentBedId, patientUhid) {
  const destBedId = document.getElementById('transfer-dest-bed').value;
  if (!destBedId) {
    alert('Please select a destination bed.');
    return;
  }

  const isIsolation = document.getElementById('transfer-isolation-flag')?.checked || 
                      (state.bedsStatus[currentBedId] && (state.bedsStatus[currentBedId].wardKey === 'CCU' || state.bedsStatus[currentBedId].wardKey === 'ICCU'));

  // Update State
  const statusObj = state.bedsStatus[currentBedId];
  const oldBedPrevStatus = statusObj.status;
  const newBedPrevStatus = state.bedsStatus[destBedId] ? state.bedsStatus[destBedId].status : 'Available';

  state.bedsStatus[destBedId] = {
    wardKey: state.bedsStatus[destBedId].wardKey,
    status: 'Occupied',
    patientUhid: patientUhid,
    notes: `Transferred from ${currentBedId}`
  };

  const targetStatus = isIsolation ? 'Isolation Cleaning Required' : 'Vacated - Pending Housekeeping';
  state.bedsStatus[currentBedId] = {
    wardKey: statusObj.wardKey,
    status: targetStatus,
    patientUhid: null,
    transitionTimestamp: new Date().toISOString(),
    notes: 'Awaiting cleaning after patient transfer'
  };

  // Auto-create housekeeping task
  const isHighPriority = currentBedId.startsWith('EMG') || currentBedId.startsWith('CCU') || currentBedId.startsWith('ICCU');
  state.housekeepingTasks = state.housekeepingTasks || [];
  state.housekeepingTasks.push({
    taskId: 'HK-' + String(1000 + state.housekeepingTasks.length + 1),
    bedId: currentBedId,
    wardKey: statusObj.wardKey,
    priority: isHighPriority ? 'High' : 'Normal',
    status: 'Pending',
    assignedStaff: null,
    createdAt: new Date().toISOString(),
    notes: 'Awaiting cleaning after patient transfer'
  });

  // Update Admission Record
  const admission = state.admissions.find(a => a.uhid === patientUhid && a.status === 'Active');
  if (admission) {
    admission.bed = destBedId;
    admission.ward = state.bedsStatus[destBedId].wardKey;
  }

  // Log Bed Movements
  state.logBedMovement({
    patientId: patientUhid,
    encounterId: admission ? admission.id : null,
    bedId: currentBedId,
    wardKey: statusObj.wardKey,
    prevStatus: oldBedPrevStatus,
    newStatus: targetStatus,
    action: 'Patient Transfer (Vacate)',
    remarks: `Transferred to ${destBedId}`
  });

  state.logBedMovement({
    patientId: patientUhid,
    encounterId: admission ? admission.id : null,
    bedId: destBedId,
    wardKey: state.bedsStatus[destBedId].wardKey,
    prevStatus: newBedPrevStatus,
    newStatus: 'Occupied',
    action: 'Patient Transfer (Occupy)',
    remarks: `Transferred from ${currentBedId}`
  });

  if (patientUhid) {
    const patientObj = state.patients.find(p => p.uhid === patientUhid);
    if (patientObj) {
      const todayStr = new Date().toLocaleDateString('en-CA');
      const nowTime = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
      patientObj.timelineEvents = patientObj.timelineEvents || [];
      patientObj.timelineEvents.unshift({
        date: `${todayStr} ${nowTime}`,
        type: 'clinical',
        icon: '🔄',
        title: 'Bed Transferred',
        desc: `Transferred from Bed ${currentBedId} to Bed ${destBedId}`
      });
    }
  }

  closeBedModal();
  renderBedBoard(document.getElementById('main-content'));
};

window.dischargePatientFromBed = function(bedId) {
  const statusObj = state.bedsStatus[bedId];
  const patientUhid = statusObj?.patientUhid;
  if (patientUhid) {
    closeBedModal();
    window.showUniversalDischargeWorkflow(patientUhid);
  } else {
    alert("No patient currently assigned to this bed.");
  }
};

window._updatePatientDietFromBedBoard = function(uhid, newDiet) {
  if (!window.state.dietData) {
    window.state.dietData = { patients: [], screeningQueue: [], counsellingQueue: [], kitchenDispatches: [], activeNPOAlerts: [], dietOrdersCount: 42 };
  }
  // Update patient clinicalData if present
  var p = window.state.patients.find(pt => pt.uhid === uhid);
  if (p) {
    if (!p.clinicalData) p.clinicalData = {};
    p.clinicalData.carePlan = `Follow ${newDiet}. Daily walking for 30 minutes. Monitor blood pressure charts.`;
  }
  var dp = window.state.dietData.patients.find(pt => pt.uhid === uhid);
  if (dp) {
    dp.dietRx = newDiet;
    dp.status = newDiet.includes('NPO') ? 'NPO Lock' : 'Active';
  } else {
    window.state.dietData.patients.push({
      name: p ? p.name : "Patient",
      uhid: uhid,
      bed: p ? p.bed : "Ward Room",
      diagnosis: (p && p.clinicalData) ? p.clinicalData.diagnosis : "IPD Admitted",
      dietRx: newDiet,
      lastReview: "Today",
      status: newDiet.includes('NPO') ? 'NPO Lock' : 'Active',
      energy: 1800, protein: 70, fluid: 1500, route: "Oral",
      prepBy: "Doctor Bed Board",
      preferences: "Veg",
      allergies: "None",
      mealStats: { breakfast: "—", lunch: "—", dinner: "—" }
    });
  }

  if (newDiet.includes('NPO')) {
    var npoAlertExists = window.state.dietData.activeNPOAlerts.some(n => n.uhid === uhid);
    if (!npoAlertExists) {
      window.state.dietData.activeNPOAlerts.unshift({
        name: p ? p.name : "Patient",
        uhid: uhid,
        bed: p ? p.bed : "Ward Room",
        duration: `8 hrs`,
        ivFluids: "No",
        status: "Warning Alert"
      });
    }
  } else {
    window.state.dietData.activeNPOAlerts = window.state.dietData.activeNPOAlerts.filter(n => n.uhid !== uhid);
  }
  
  // Save state
  localStorage.setItem('saronil_patients', JSON.stringify(window.state.patients));
  
  alert(`Diet order updated to ${newDiet} for patient ${p ? p.name : uhid}.`);
};

window.sendOccupiedBedToHousekeeping = function(bedId) {
  const statusObj = state.bedsStatus[bedId];
  if (!statusObj) return;
  const patientUhid = statusObj.patientUhid;
  if (patientUhid) {
    if (!confirm(`Are you sure you want to vacate patient (UHID: ${patientUhid}) from bed ${bedId} and send it to House Keeping?`)) {
      return;
    }
    // Set bed to vacated - pending housekeeping
    const prev = statusObj.status;
    statusObj.status = 'Vacated - Pending Housekeeping';
    statusObj.patientUhid = null;
    statusObj.transitionTimestamp = new Date().toISOString();
    statusObj.notes = 'Sent to housekeeping';

    // Remove patient from active IPD admission record bed field if exists
    const admission = state.admissions.find(a => a.uhid === patientUhid && a.status === 'Active');
    if (admission) {
      admission.bed = null;
    }

    // Auto trigger housekeeping request
    if (typeof state.triggerHousekeepingRequest === 'function') {
      state.triggerHousekeepingRequest(bedId, statusObj.wardKey, `Occupied bed sent to housekeeping manually`);
    }

    // Log Bed Movement
    state.logBedMovement({
      patientId: patientUhid,
      bedId: bedId,
      wardKey: statusObj.wardKey,
      prevStatus: prev,
      newStatus: 'Vacated - Pending Housekeeping',
      action: 'Housekeeping Assigned',
      remarks: `Occupied bed sent to housekeeping manually`
    });

    closeBedModal();
    const mainContent = document.getElementById('main-content');
    if (mainContent) {
      if (window.location.hash.includes('ipdAdmission')) {
        if (window.router && typeof window.router.handleRouting === 'function') {
          window.router.handleRouting();
        }
      } else {
        renderBedBoard(mainContent);
      }
    }
  } else {
    alert("No patient currently assigned to this bed.");
  }
};

