#!/usr/bin/env python3

path = "/Users/home/Desktop/Saronil IHS/Updated HIS /assets/js/views/ipdAdmissionView.js"

with open(path, "r", encoding="utf-8") as f:
    src = f.read()

# We need to replace the old renderBedBoardScreen() implementation.
# Let's locate exactly where it is in the file.
# It starts at: function renderBedBoardScreen() {
# And ends before: window._gridSetWard = function(val) {

old_render_bedboard = """  function renderBedBoardScreen() {
    var wards = window.state.wards || {};
    var isNurse = window._ipdActiveRole === 'Ward Nurse';

    return `
      <!-- Filter Bar -->
      <div style="background:#f8fafc; border: 1px solid var(--border-color); padding: 12px 18px; border-radius: 8px; margin-bottom: 20px; display:flex; gap:12px; align-items:center; flex-wrap:wrap;">
        <div class="er-field" style="margin:0;">
          <select class="er-select" style="padding: 6px 12px; font-size:12px;" onchange="window._ipdChangeBranchFilter(this.value)">
            <option value="All" ${_selectedBranch === 'All' ? 'selected' : ''}>All Branches</option>
            <option value="Bengaluru" ${_selectedBranch === 'Bengaluru' ? 'selected' : ''}>Bengaluru (Main)</option>
            <option value="Whitefield" ${_selectedBranch === 'Whitefield' ? 'selected' : ''}>Whitefield</option>
            <option value="Electronic City" ${_selectedBranch === 'Electronic City' ? 'selected' : ''}>Electronic City</option>
          </select>
        </div>
        <div class="er-field" style="margin:0;">
          <select class="er-select" style="padding: 6px 12px; font-size:12px;" onchange="window._gridSetWard(this.value)">
            <option value="All" ${_gridWardFilter === 'All' ? 'selected' : ''}>All Wards</option>
            ${Object.entries(wards).map(function([key, val]) {
              if (isNurse && key !== 'GENERAL-WARD-M') return '';
              return `<option value="${key}" ${key === _gridWardFilter ? 'selected' : ''}>${val.name}</option>`;
            }).join('')}
          </select>
        </div>
        <div class="er-field" style="margin:0;">
          <select class="er-select" style="padding: 6px 12px; font-size:12px;" onchange="window._gridSetStatus(this.value)">
            <option value="All" ${_gridStatusFilter === 'All' ? 'selected' : ''}>All Statuses</option>
            <option value="Occupied" ${_gridStatusFilter === 'Occupied' ? 'selected' : ''}>Occupied</option>
            <option value="Available" ${_gridStatusFilter === 'Available' ? 'selected' : ''}>Available</option>
            <option value="Cleaning" ${_gridStatusFilter === 'Cleaning' ? 'selected' : ''}>Under Housekeeping</option>
            <option value="Reserved" ${_gridStatusFilter === 'Reserved' ? 'selected' : ''}>Reserved</option>
          </select>
        </div>
        <div class="er-field" style="margin:0; flex:1; min-width:200px;">
          <input type="text" class="er-input" style="padding: 6px 12px; font-size:12px;" placeholder="Search Patient name or UHID..." value="${_gridSearchFilter}" oninput="window._gridSetSearch(this.value)">
        </div>
      </div>

      <!-- Ward Bed Sections -->
      ${Object.entries(wards).map(function([key, val]) {
        // Restricted scope checks
        if (isNurse && key !== 'GENERAL-WARD-M') return '';
        if (_gridWardFilter !== 'All' && key !== _gridWardFilter) return '';

        var beds = val.beds || [];
        var occupied = beds.filter(b => (window.state.bedsStatus[b] || {}).status === 'Occupied').length;
        var occupancyPct = beds.length > 0 ? Math.round((occupied / beds.length) * 100) : 0;
        
        var pctPillClass = occupancyPct > 90 ? 'background:#fee2e2; color:#b91c1c;' : (occupancyPct >= 80 ? 'background:#fffbeb; color:#d97706;' : 'background:#ecfdf5; color:#047857;');

        // Filter cards by status & search
        var displayBeds = beds.filter(b => {
          var s = window.state.bedsStatus[b] || { status: 'Available' };
          
          if (_gridStatusFilter !== 'All' && s.status !== _gridStatusFilter) return false;
          
          if (_gridSearchFilter.trim() !== '') {
            var q = _gridSearchFilter.toLowerCase();
            if (s.status === 'Occupied' && s.patientUhid) {
              var p = window.state.patients.find(pt => pt.uhid === s.patientUhid);
              if (p) {
                var nameMatch = p.name.toLowerCase().includes(q);
                var uhidMatch = p.uhid.toLowerCase().includes(q);
                return nameMatch || uhidMatch;
              }
            } else if (s.status === 'Reserved' && s.notes) {
              return s.notes.toLowerCase().includes(q);
            }
            return b.toLowerCase().includes(q);
          }

          return true;
        });

        if (displayBeds.length === 0 && (_gridStatusFilter !== 'All' || _gridSearchFilter.trim() !== '')) {
          return ''; // Hide ward section if filters yield empty
        }

        return `
          <div style="margin-bottom: 24px; border-bottom: 1px solid var(--border-color); padding-bottom: 20px;">
            <div style="font-size: 14px; font-weight: 700; color: #1e293b; margin-bottom: 12px; margin-top: 8px;">
              ${val.name} <span style="font-weight: 500; color: #64748b; font-size: 12px; margin-left: 4px;">(${fmtMoney(WARD_RATES[key]?.rate || 1500)}/day)</span>
            </div>
            
            <div class="ipd-bed-grid-container" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 14px; margin-top: 10px;">
              ${displayBeds.map(b => renderBedCardHTML(b, key)).join('')}
            </div>
          </div>
        `;
      }).join('')}
    `;
  }"""

new_render_bedboard = """  function renderBedBoardScreen() {
    var wards = window.state.wards || {};
    var isNurse = window._ipdActiveRole === 'Ward Nurse';

    // Build the visual bed grid left side
    var bedBoardLeftHTML = `
      <!-- Filter Bar -->
      <div style="background:#f8fafc; border: 1px solid var(--border-color); padding: 12px 18px; border-radius: 8px; margin-bottom: 20px; display:flex; gap:12px; align-items:center; flex-wrap:wrap;">
        <div class="er-field" style="margin:0;">
          <select class="er-select" style="padding: 6px 12px; font-size:12px;" onchange="window._ipdChangeBranchFilter(this.value)">
            <option value="All" ${_selectedBranch === 'All' ? 'selected' : ''}>All Branches</option>
            <option value="Bengaluru" ${_selectedBranch === 'Bengaluru' ? 'selected' : ''}>Bengaluru (Main)</option>
            <option value="Whitefield" ${_selectedBranch === 'Whitefield' ? 'selected' : ''}>Whitefield</option>
            <option value="Electronic City" ${_selectedBranch === 'Electronic City' ? 'selected' : ''}>Electronic City</option>
          </select>
        </div>
        <div class="er-field" style="margin:0;">
          <select class="er-select" style="padding: 6px 12px; font-size:12px;" onchange="window._gridSetWard(this.value)">
            <option value="All" ${_gridWardFilter === 'All' ? 'selected' : ''}>All Wards</option>
            ${Object.entries(wards).map(function([key, val]) {
              if (isNurse && key !== 'GENERAL-WARD-M') return '';
              return `<option value="${key}" ${key === _gridWardFilter ? 'selected' : ''}>${val.name}</option>`;
            }).join('')}
          </select>
        </div>
        <div class="er-field" style="margin:0;">
          <select class="er-select" style="padding: 6px 12px; font-size:12px;" onchange="window._gridSetStatus(this.value)">
            <option value="All" ${_gridStatusFilter === 'All' ? 'selected' : ''}>All Statuses</option>
            <option value="Occupied" ${_gridStatusFilter === 'Occupied' ? 'selected' : ''}>Occupied</option>
            <option value="Available" ${_gridStatusFilter === 'Available' ? 'selected' : ''}>Available</option>
            <option value="Cleaning" ${_gridStatusFilter === 'Cleaning' ? 'selected' : ''}>Under Housekeeping</option>
            <option value="Reserved" ${_gridStatusFilter === 'Reserved' ? 'selected' : ''}>Reserved</option>
          </select>
        </div>
        <div class="er-field" style="margin:0; flex:1; min-width:180px;">
          <input type="text" class="er-input" style="padding: 6px 12px; font-size:12px;" placeholder="Search Patient name or UHID..." value="${_gridSearchFilter}" oninput="window._gridSetSearch(this.value)">
        </div>
      </div>

      <!-- Ward Bed Sections -->
      ${Object.entries(wards).map(function([key, val]) {
        // Restricted scope checks
        if (isNurse && key !== 'GENERAL-WARD-M') return '';
        if (_gridWardFilter !== 'All' && key !== _gridWardFilter) return '';

        var beds = val.beds || [];
        var occupied = beds.filter(b => (window.state.bedsStatus[b] || {}).status === 'Occupied').length;
        var occupancyPct = beds.length > 0 ? Math.round((occupied / beds.length) * 100) : 0;
        
        var pctPillClass = occupancyPct > 90 ? 'background:#fee2e2; color:#b91c1c;' : (occupancyPct >= 80 ? 'background:#fffbeb; color:#d97706;' : 'background:#ecfdf5; color:#047857;');

        // Filter cards by status & search
        var displayBeds = beds.filter(b => {
          var s = window.state.bedsStatus[b] || { status: 'Available' };
          
          if (_gridStatusFilter !== 'All' && s.status !== _gridStatusFilter) return false;
          
          if (_gridSearchFilter.trim() !== '') {
            var q = _gridSearchFilter.toLowerCase();
            if (s.status === 'Occupied' && s.patientUhid) {
              var p = window.state.patients.find(pt => pt.uhid === s.patientUhid);
              if (p) {
                var nameMatch = p.name.toLowerCase().includes(q);
                var uhidMatch = p.uhid.toLowerCase().includes(q);
                return nameMatch || uhidMatch;
              }
            } else if (s.status === 'Reserved' && s.notes) {
              return s.notes.toLowerCase().includes(q);
            }
            return b.toLowerCase().includes(q);
          }

          return true;
        });

        if (displayBeds.length === 0 && (_gridStatusFilter !== 'All' || _gridSearchFilter.trim() !== '')) {
          return ''; // Hide ward section if filters yield empty
        }

        return `
          <div style="margin-bottom: 24px; border-bottom: 1px solid var(--border-color); padding-bottom: 20px;">
            <div style="font-size: 14px; font-weight: 700; color: #1e293b; margin-bottom: 12px; margin-top: 8px;">
              ${val.name} <span style="font-weight: 500; color: #64748b; font-size: 12px; margin-left: 4px;">(${fmtMoney(WARD_RATES[key]?.rate || 1500)}/day)</span>
            </div>
            
            <div class="ipd-bed-grid-container" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 14px; margin-top: 10px;">
              ${displayBeds.map(b => renderBedCardHTML(b, key)).join('')}
            </div>
          </div>
        `;
      }).join('')}
    `;

    // Build the updates and requests feed right side
    var updatesRightHTML = renderUpdatesAndRequestsPanel();

    return `
      <div style="display: grid; grid-template-columns: minmax(0, 3fr) 300px; gap: 20px; align-items: start;">
        <div>
          ${bedBoardLeftHTML}
        </div>
        <div style="position: sticky; top: 15px;">
          ${updatesRightHTML}
        </div>
      </div>
    `;
  }

  function renderUpdatesAndRequestsPanel() {
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

src = src.replace(old_render_bedboard, new_render_bedboard, 1)

with open(path, "w", encoding="utf-8") as f:
    f.write(src)

print("SUCCESS: Two-column grid with right-side Updates and Requests panel added.")
