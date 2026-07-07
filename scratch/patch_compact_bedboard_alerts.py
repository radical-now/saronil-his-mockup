#!/usr/bin/env python3

path = "/Users/home/Desktop/Saronil IHS/Updated HIS /assets/js/views/ipdAdmissionView.js"

with open(path, "r", encoding="utf-8") as f:
    src = f.read()

# 1. Update css declaration in injectIPDStyles to make the gaps tighter
old_css_grid = """.ipd-bed-grid-container { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)) !important; gap: 14px; margin-top: 10px; }"""
new_css_grid = """.ipd-bed-grid-container { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)) !important; gap: 8px; margin-top: 10px; }"""

src = src.replace(old_css_grid, new_css_grid, 1)

# 2. Update inline style in renderBedBoardScreen to set gap: 8px
old_inline_grid = """<div class="ipd-bed-grid-container" style="display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 14px; margin-top: 10px;">"""
new_inline_grid = """<div class="ipd-bed-grid-container" style="display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 8px; margin-top: 10px;">"""

src = src.replace(old_inline_grid, new_inline_grid, 1)

# 3. Update renderBedCardHTML to make it highly compact
old_bed_card_fn = """  function renderBedCardHTML(bedId, wardKey) {
    var s = window.state.bedsStatus[bedId] || { status: 'Available' };
    var status = s.status;
    var role = window._ipdActiveRole;

    var formattedBedId = bedId;
    if (bedId.startsWith('GW(M)-')) {
      formattedBedId = 'GW(Male) - ' + bedId.substring(6);
    } else if (bedId.startsWith('GW(F)-')) {
      formattedBedId = 'GW(Female) - ' + bedId.substring(6);
    } else {
      var parts = bedId.split('-');
      if (parts.length === 2) {
        formattedBedId = parts[0] + ' - ' + parts[1];
      }
    }

    var borderStyle = '';
    var badgeBg = '';
    var statusText = '';
    var patientNameHTML = '';
    var onClickAction = '';

    if (status === 'Occupied') {
      var p = window.state.patients.find(pt => pt.uhid === s.patientUhid) || { name: 'Trauma Patient', uhid: s.patientUhid || 'SH-2026-00000' };
      borderStyle = 'border: 3px solid #334155;';
      badgeBg = '#334155';
      statusText = 'Occupied';
      patientNameHTML = `
        <div style="font-size: 16px; font-weight: 800; color: #000; margin-top: 10px; font-family: sans-serif;">${p.name}</div>
        <div style="font-size: 13px; color: #4b5563; margin-top: 2px; font-family: sans-serif;">${p.uhid}</div>
      `;
      onClickAction = `onclick="window._drawerOpenDetails('${p.uhid}', '${bedId}')"`;
    } else if (status === 'Available') {
      borderStyle = 'border: 3px solid #10b981;';
      badgeBg = '#10b981';
      statusText = 'Available';
      patientNameHTML = `
        <div style="font-size: 16px; font-weight: 800; color: #94a3b8; margin-top: 10px; font-family: sans-serif;">No Patient</div>
        <div style="font-size: 13px; color: #94a3b8; margin-top: 2px; font-family: sans-serif;">Awaiting Assignment</div>
      `;
      onClickAction = `onclick="window._bedOpenQuickAssign('${bedId}')"`;
    } else if (status === 'Cleaning') {
      borderStyle = 'border: 3px solid #f59e0b;';
      badgeBg = '#f59e0b';
      statusText = 'Cleaning';
      patientNameHTML = `
        <div style="font-size: 16px; font-weight: 800; color: #d97706; margin-top: 10px; font-family: sans-serif;">Sanitizing</div>
        <div style="font-size: 13px; color: #d97706; margin-top: 2px; font-family: sans-serif;">Housekeeping in progress</div>
      `;
      onClickAction = `onclick="window._bedMarkReady('${bedId}', '${wardKey}')"`;
    } else if (status === 'Reserved') {
      borderStyle = 'border: 3px solid #8b5cf6;';
      badgeBg = '#8b5cf6';
      statusText = 'Reserved';
      patientNameHTML = `
        <div style="font-size: 16px; font-weight: 800; color: #7c3aed; margin-top: 10px; font-family: sans-serif;">Reserved</div>
        <div style="font-size: 13px; color: #7c3aed; margin-top: 2px; font-family: sans-serif;">${s.notes || 'Pending Admit'}</div>
      `;
      onClickAction = `onclick="window._bedReleaseReservation('${bedId}', '${wardKey}')"`;
    }

    return `
      <div ${onClickAction} style="background: white; border-radius: 16px; padding: 18px; display: flex; flex-direction: column; cursor: pointer; transition: all 0.2s; box-shadow: none; box-sizing: border-box; ${borderStyle}">
        <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
          <span style="font-size: 16px; font-weight: 800; color: #000; font-family: sans-serif;">${formattedBedId}</span>
          <span style="font-size: 20px;">🛏️</span>
        </div>
        <div style="text-align: left; margin-top: 6px; margin-bottom: 2px;">
          <span style="background: ${badgeBg}; color: white; padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: 700; display: inline-block; font-family: sans-serif;">${statusText}</span>
        </div>
        <div style="text-align: left;">
          ${patientNameHTML}
        </div>
      </div>
    `;
  }"""

new_bed_card_fn = """  function renderBedCardHTML(bedId, wardKey) {
    var s = window.state.bedsStatus[bedId] || { status: 'Available' };
    var status = s.status;
    var role = window._ipdActiveRole;

    var formattedBedId = bedId;
    if (bedId.startsWith('GW(M)-')) {
      formattedBedId = 'GW(Male) - ' + bedId.substring(6);
    } else if (bedId.startsWith('GW(F)-')) {
      formattedBedId = 'GW(Female) - ' + bedId.substring(6);
    } else {
      var parts = bedId.split('-');
      if (parts.length === 2) {
        formattedBedId = parts[0] + ' - ' + parts[1];
      }
    }

    var borderStyle = '';
    var badgeBg = '';
    var statusText = '';
    var patientNameHTML = '';
    var onClickAction = '';

    if (status === 'Occupied') {
      var p = window.state.patients.find(pt => pt.uhid === s.patientUhid) || { name: 'Trauma Patient', uhid: s.patientUhid || 'SH-2026-00000' };
      borderStyle = 'border: 2px solid #334155;';
      badgeBg = '#334155';
      statusText = 'Occupied';
      patientNameHTML = `
        <div style="font-size: 13px; font-weight: 800; color: #000; margin-top: 6px; font-family: sans-serif; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${p.name}">${p.name}</div>
        <div style="font-size: 11px; color: #4b5563; margin-top: 1px; font-family: sans-serif;">${p.uhid}</div>
      `;
      onClickAction = `onclick="window._drawerOpenDetails('${p.uhid}', '${bedId}')"`;
    } else if (status === 'Available') {
      borderStyle = 'border: 2px solid #10b981;';
      badgeBg = '#10b981';
      statusText = 'Available';
      patientNameHTML = `
        <div style="font-size: 13px; font-weight: 800; color: #94a3b8; margin-top: 6px; font-family: sans-serif;">No Patient</div>
        <div style="font-size: 11px; color: #94a3b8; margin-top: 1px; font-family: sans-serif;">Vacant</div>
      `;
      onClickAction = `onclick="window._bedOpenQuickAssign('${bedId}')"`;
    } else if (status === 'Cleaning') {
      borderStyle = 'border: 2px solid #f59e0b;';
      badgeBg = '#f59e0b';
      statusText = 'Cleaning';
      patientNameHTML = `
        <div style="font-size: 13px; font-weight: 800; color: #d97706; margin-top: 6px; font-family: sans-serif;">Sanitizing</div>
        <div style="font-size: 11px; color: #d97706; margin-top: 1px; font-family: sans-serif;">Housekeeping</div>
      `;
      onClickAction = `onclick="window._bedMarkReady('${bedId}', '${wardKey}')"`;
    } else if (status === 'Reserved') {
      borderStyle = 'border: 2px solid #8b5cf6;';
      badgeBg = '#8b5cf6';
      statusText = 'Reserved';
      patientNameHTML = `
        <div style="font-size: 13px; font-weight: 800; color: #7c3aed; margin-top: 6px; font-family: sans-serif; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">Reserved</div>
        <div style="font-size: 11px; color: #7c3aed; margin-top: 1px; font-family: sans-serif; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${s.notes || 'Pending Admit'}">${s.notes || 'Pending Admit'}</div>
      `;
      onClickAction = `onclick="window._bedReleaseReservation('${bedId}', '${wardKey}')"`;
    }

    return `
      <div ${onClickAction} style="background: white; border-radius: 12px; padding: 10px 12px; min-height: 85px; display: flex; flex-direction: column; cursor: pointer; transition: all 0.2s; box-shadow: none; box-sizing: border-box; ${borderStyle}">
        <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
          <span style="font-size: 13px; font-weight: 800; color: #000; font-family: sans-serif;">${formattedBedId}</span>
          <span style="font-size: 15px;">🛏️</span>
        </div>
        <div style="text-align: left; margin-top: 4px; margin-bottom: 2px;">
          <span style="background: ${badgeBg}; color: white; padding: 2px 8px; border-radius: 20px; font-size: 9px; font-weight: 700; display: inline-block; font-family: sans-serif;">${statusText}</span>
        </div>
        <div style="text-align: left;">
          ${patientNameHTML}
        </div>
      </div>
    `;
  }"""

src = src.replace(old_bed_card_fn, new_bed_card_fn, 1)

# 4. Re-write renderUpdatesAndRequestsPanel to output alerts, requests, and housekeeping
old_panel_fn = """  function renderUpdatesAndRequestsPanel() {
    var branch = _selectedBranch;
    var role = window._ipdActiveRole;

    // 1. Awaiting Admissions
    var pendingAdmissions = (window.state.admissionRequests || []).filter(r => branch === 'All' || r.branch === branch);

    // 2. Pending Transfers
    var pendingTransfers = (window.state.transferRequests || []).filter(t => branch === 'All' || t.branch === branch);

    // 3. Housekeeping Beds
    var cleaningBeds = [];
    Object.entries(window.state.bedsStatus || {}).forEach(function([bedId, s]) {
      if (s.status === 'Cleaning') {
        var ward = window.state.wards[s.wardKey] || { name: 'Ward' };
        cleaningBeds.push({ bedId: bedId, wardName: ward.name, wardKey: s.wardKey });
      }
    });

    var itemsHTML = '';

    // Render Admissions
    pendingAdmissions.forEach(r => {
      var canAssign = (role === 'ATD Coordinator' || role === 'Admission Clerk');
      var actionBtn = canAssign ? 
        `<button class="btn btn-primary btn-sm" style="padding: 2px 8px; font-size: 10px; margin-top: 6px;" onclick="window._dashboardAssignBed('${r.uhid}')">Assign Bed</button>` : '';

      itemsHTML += `
        <div style="padding: 10px 0; border-bottom: 1px solid var(--border-color);">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <span style="font-weight:700; font-size:11px; color:#1e3a8a;">➕ Admission Req</span>
            <span style="font-size:10px; color:#64748b; font-weight:600;" class="admin-mono">${r.uhid}</span>
          </div>
          <div style="font-size:12px; font-weight:700; color:#1e293b; margin-top:4px;">${r.name}</div>
          <div style="font-size:11px; color:#64748b; margin-top:2px; line-height: 1.3;">
            Route: ${r.source}<br>
            Preference: ${WARD_RATES[r.ward]?.name || r.ward}
          </div>
          ${actionBtn}
        </div>
      `;
    });

    // Render Transfers
    pendingTransfers.forEach((t, index) => {
      var isApproved = t.status.includes('Approved');
      var canApprove = (role === 'Nursing Supervisor');
      var canExecute = (role === 'ATD Coordinator');

      var actionBtn = '';
      if (!isApproved && canApprove) {
        actionBtn = `<button class="btn btn-primary btn-sm" style="padding: 2px 8px; font-size: 10px; margin-top: 6px;" onclick="window._dashboardApproveTransfer(${index}, true)">Approve</button>`;
      } else if (isApproved && canExecute) {
        actionBtn = `<button class="btn btn-primary btn-sm" style="padding: 2px 8px; font-size: 10px; margin-top: 6px; background:#7c3aed;" onclick="window._dashboardExecuteTransfer(${index})">Execute</button>`;
      }

      itemsHTML += `
        <div style="padding: 10px 0; border-bottom: 1px solid var(--border-color);">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <span style="font-weight:700; font-size:11px; color:#b45309;">🔄 Transfer Req</span>
            <span style="font-size:9px; background:#fef3c7; color:#d97706; padding:1px 4px; border-radius:4px; font-weight:700;">${isApproved ? 'Approved' : 'Pending'}</span>
          </div>
          <div style="font-size:12px; font-weight:700; color:#1e293b; margin-top:4px;">${t.name}</div>
          <div style="font-size:11px; color:#64748b; margin-top:2px; line-height: 1.3;">
            From Bed: ${t.currentBed}<br>
            To Ward: ${WARD_RATES[t.targetWard]?.name || t.targetWard}
          </div>
          ${actionBtn}
        </div>
      `;
    });

    // Render Housekeeping
    cleaningBeds.forEach(b => {
      var canMark = (role === 'Nursing Supervisor' || role === 'Ward Nurse');
      var actionBtn = canMark ? 
        `<button class="btn btn-secondary btn-sm" style="padding: 2px 8px; font-size: 10px; margin-top: 6px;" onclick="window._bedMarkReady('${b.bedId}', '${b.wardKey}')">Mark Ready</button>` : '';

      itemsHTML += `
        <div style="padding: 10px 0; border-bottom: 1px solid var(--border-color);">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <span style="font-weight:700; font-size:11px; color:#d97706;">🧹 Housekeeping</span>
            <span style="font-size:10px; color:#d97706; font-weight:700;">Cleaning</span>
          </div>
          <div style="font-size:12px; font-weight:700; color:#1e293b; margin-top:4px;">Bed ${b.bedId}</div>
          <div style="font-size:11px; color:#64748b; margin-top:2px; line-height: 1.3;">
            Ward: ${b.wardName}
          </div>
          ${actionBtn}
        </div>
      `;
    });

    if (!itemsHTML) {
      itemsHTML = `<div style="text-align:center; padding:30px; font-size:12px; color:var(--text-muted);">No pending updates or alerts active</div>`;
    }

    return `
      <div class="admin-card" style="box-sizing:border-box;">
        <div style="display:flex; align-items:center; gap:8px; border-bottom:2px solid var(--border-color); padding-bottom:8px; margin-bottom:10px;">
          <span style="font-size:16px;">🔔</span>
          <h3 style="margin:0; font-size:13px; font-weight:800; color:#1e3a8a; text-transform:uppercase; letter-spacing:0.5px;">Updates & Requests</h3>
        </div>
        <div style="max-height: 550px; overflow-y: auto; padding-right: 4px;">
          ${itemsHTML}
        </div>
      </div>
    `;
  }"""

new_panel_fn = """  function renderUpdatesAndRequestsPanel() {
    var branch = _selectedBranch;
    var role = window._ipdActiveRole;

    // 1. Critical Alerts (Delayed events, MLC tags, Pending clearance alerts)
    var alerts = [];
    var pendingAdmissions = (window.state.admissionRequests || []).filter(r => branch === 'All' || r.branch === branch);
    var pendingTransfers = (window.state.transferRequests || []).filter(t => branch === 'All' || t.branch === branch);
    var pendingDischarges = (window.state.dischargeOrders || []);

    pendingAdmissions.forEach(r => {
      if (r.waitingHrs > 6) {
        alerts.push({
          type: 'Delayed Intake',
          title: `Intake Delayed >6h: ${r.name}`,
          meta: `UHID: ${r.uhid} · Waiting: ${r.waitingHrs}h`,
          color: '#ef4444',
          icon: '⚠️'
        });
      }
    });

    pendingDischarges.forEach(d => {
      if (d.waitingHrs > 6) {
        alerts.push({
          type: 'Delayed Discharge',
          title: `Discharge Delayed >6h: ${d.patientName}`,
          meta: `UHID: ${d.uhid} · Waiting: ${d.waitingHrs}h`,
          color: '#ef4444',
          icon: '🚨'
        });
      }
      // MLC checks
      var p = window.state.patients.find(pt => pt.uhid === d.uhid);
      if (p && p.flags && p.flags.includes('MLC')) {
        alerts.push({
          type: 'MLC Clearance',
          title: `MLC Case Discharge: ${d.patientName}`,
          meta: `Police notification & medico-legal summary required`,
          color: '#b91c1c',
          icon: '👮'
        });
      }
    });

    // 2. Awaiting Admissions
    var itemsHTML = '';

    // Render Alerts Section
    var alertsHTML = '';
    alerts.forEach(a => {
      alertsHTML += `
        <div style="padding: 8px 10px; border-radius: 6px; background: #fff5f5; border-left: 3px solid ${a.color}; margin-bottom: 8px; font-size:11px;">
          <div style="display:flex; align-items:center; gap: 4px; font-weight:700; color:${a.color};">
            <span>${a.icon}</span>
            <span>${a.type}</span>
          </div>
          <div style="font-weight:700; color:#1e293b; margin-top:2px;">${a.title}</div>
          <div style="color:#64748b; font-size:10px; margin-top:1px;">${a.meta}</div>
        </div>
      `;
    });

    if (alertsHTML) {
      alertsHTML = `
        <div style="margin-bottom: 15px;">
          <div style="font-size:10px; font-weight:800; text-transform:uppercase; color:#ef4444; letter-spacing:0.5px; margin-bottom:6px;">⚠️ Critical Alerts</div>
          ${alertsHTML}
        </div>
      `;
    }

    // Render Admissions
    var reqsHTML = '';
    pendingAdmissions.forEach(r => {
      var canAssign = (role === 'ATD Coordinator' || role === 'Admission Clerk');
      var actionBtn = canAssign ? 
        `<button class="btn btn-primary btn-sm" style="padding: 2px 6px; font-size: 9px; margin-top: 4px;" onclick="window._dashboardAssignBed('${r.uhid}')">Assign Bed</button>` : '';

      reqsHTML += `
        <div style="padding: 8px 0; border-bottom: 1px solid var(--border-color); font-size:11px;">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <span style="font-weight:700; color:#1e3a8a;">➕ Admission</span>
            <span style="font-size:9px; color:#64748b;" class="admin-mono">${r.uhid}</span>
          </div>
          <div style="font-weight:700; color:#1e293b; margin-top:2px;">${r.name}</div>
          <div style="color:#64748b; font-size:10px; margin-top:1px; line-height:1.2;">
            Route: ${r.source} · Pref: ${WARD_RATES[r.ward]?.category || r.ward}
          </div>
          ${actionBtn}
        </div>
      `;
    });

    // Render Transfers
    pendingTransfers.forEach((t, index) => {
      var isApproved = t.status.includes('Approved');
      var canApprove = (role === 'Nursing Supervisor');
      var canExecute = (role === 'ATD Coordinator');

      var actionBtn = '';
      if (!isApproved && canApprove) {
        actionBtn = `<button class="btn btn-primary btn-sm" style="padding: 2px 6px; font-size: 9px; margin-top: 4px;" onclick="window._dashboardApproveTransfer(${index}, true)">Approve</button>`;
      } else if (isApproved && canExecute) {
        actionBtn = `<button class="btn btn-primary btn-sm" style="padding: 2px 6px; font-size: 9px; margin-top: 4px; background:#7c3aed;" onclick="window._dashboardExecuteTransfer(${index})">Execute</button>`;
      }

      reqsHTML += `
        <div style="padding: 8px 0; border-bottom: 1px solid var(--border-color); font-size:11px;">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <span style="font-weight:700; color:#b45309;">🔄 Transfer</span>
            <span style="font-size:9px; background:#fef3c7; color:#d97706; padding:1px 4px; border-radius:4px; font-weight:700;">${isApproved ? 'Approved' : 'Pending'}</span>
          </div>
          <div style="font-weight:700; color:#1e293b; margin-top:2px;">${t.name}</div>
          <div style="color:#64748b; font-size:10px; margin-top:1px; line-height:1.2;">
            From Bed: ${t.currentBed} ➜ To Ward: ${WARD_RATES[t.targetWard]?.category || t.targetWard}
          </div>
          ${actionBtn}
        </div>
      `;
    });

    if (reqsHTML) {
      reqsHTML = `
        <div style="margin-bottom: 15px;">
          <div style="font-size:10px; font-weight:800; text-transform:uppercase; color:#1e3a8a; letter-spacing:0.5px; margin-bottom:6px;">🛏️ Pending Requests</div>
          ${reqsHTML}
        </div>
      `;
    }

    // Render Housekeeping
    var updatesHTML = '';
    var cleaningBeds = [];
    Object.entries(window.state.bedsStatus || {}).forEach(function([bedId, s]) {
      if (s.status === 'Cleaning') {
        var ward = window.state.wards[s.wardKey] || { name: 'Ward' };
        cleaningBeds.push({ bedId: bedId, wardName: ward.name, wardKey: s.wardKey });
      }
    });

    cleaningBeds.forEach(b => {
      var canMark = (role === 'Nursing Supervisor' || role === 'Ward Nurse');
      var actionBtn = canMark ? 
        `<button class="btn btn-secondary btn-sm" style="padding: 2px 6px; font-size: 9px; margin-top: 4px;" onclick="window._bedMarkReady('${b.bedId}', '${b.wardKey}')">Mark Ready</button>` : '';

      updatesHTML += `
        <div style="padding: 8px 0; border-bottom: 1px solid var(--border-color); font-size:11px;">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <span style="font-weight:700; color:#d97706;">🧹 Housekeeping</span>
            <span style="font-size:9px; color:#d97706; font-weight:700;">Cleaning</span>
          </div>
          <div style="font-weight:700; color:#1e293b; margin-top:2px;">Bed ${b.bedId}</div>
          <div style="color:#64748b; font-size:10px; margin-top:1px; line-height:1.2;">
            Ward: ${b.wardName}
          </div>
          ${actionBtn}
        </div>
      `;
    });

    if (updatesHTML) {
      updatesHTML = `
        <div style="margin-bottom: 10px;">
          <div style="font-size:10px; font-weight:800; text-transform:uppercase; color:#d97706; letter-spacing:0.5px; margin-bottom:6px;">✨ Live Bed Updates</div>
          ${updatesHTML}
        </div>
      `;
    }

    var finalHTML = alertsHTML + reqsHTML + updatesHTML;
    if (!finalHTML) {
      finalHTML = `<div style="text-align:center; padding:30px; font-size:11px; color:var(--text-muted);">No pending alerts, requests, or updates logged.</div>`;
    }

    return `
      <div class="admin-card" style="box-sizing:border-box; padding: 12px !important;">
        <div style="display:flex; align-items:center; gap:6px; border-bottom:2px solid var(--border-color); padding-bottom:8px; margin-bottom:12px;">
          <span style="font-size:14px;">🔔</span>
          <h3 style="margin:0; font-size:12px; font-weight:800; color:#1e3a8a; text-transform:uppercase; letter-spacing:0.5px;">Alerts, Requests & Updates</h3>
        </div>
        <div style="max-height: 520px; overflow-y: auto; padding-right: 4px; scrollbar-width:thin;">
          ${finalHTML}
        </div>
      </div>
    `;
  }"""

src = src.replace(old_panel_fn, new_panel_fn, 1)

with open(path, "w", encoding="utf-8") as f:
    f.write(src)

print("SUCCESS: Bed Board layout compacted and right panel alerts feed added.")
