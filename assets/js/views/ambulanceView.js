/* ==========================================================================
   SARONIL HIS — AMBULANCE OPERATIONS MODULE
   Tabs: Fleet Board | Active Trips | Trip Log | Fleet Management
   Roles: Dispatcher | Driver | ED Nurse | Billing | Administrator
   Trip Types: Outbound | Inbound | Transfer (with pre-dispatch verification checklists)
   ========================================================================== */

(function () {
  'use strict';

  // Local View States
  var activeTab = 'fleet';
  var activeRole = 'Dispatcher';
  var selectedTripId = '';
  
  // Trip creation overlay state
  var tripOverlayOpen = false;
  var tripStep = 1;
  var selectedTripType = 'outbound'; // outbound | inbound | transfer
  
  // Selected patient for transfers
  var selectedTransferUhid = '';

  // Log filter states
  var logTypeFilter = 'All';
  var logUnitFilter = 'All';

  // Expandable Fleet rows
  var expandedUnits = {};

  // Setup state registries
  function initAmbulanceState() {
    if (!window.state) window.state = {};
    
    // Inject Styles
    if (!document.getElementById('amb-styles-v5')) {
      const style = document.createElement('style');
      style.id = 'amb-styles-v5';
      style.textContent = `
        :root {
          --amb-green: #059669;      --amb-green-light: #d1fae5;
          --amb-blue: #2563eb;       --amb-blue-light: #dbeafe;
          --amb-amber: #d97706;      --amb-amber-light: #fef3c7;
          --amb-red: #dc2626;        --amb-red-light: #fee2e2;
          --amb-grey: #64748b;       --amb-grey-light: #f1f5f9;
        }
        .amb-wrap { display: flex; flex-direction: column; gap: 1.5rem; font-family: var(--font-body); color: var(--text-primary); }
        
        .trip-prog-item { font-size: 0.7rem; font-weight: 700; color: var(--text-muted); }
        .trip-prog-item.active { color: var(--text-primary); font-size: 0.75rem; border-bottom: 2px solid var(--primary); }

        .amb-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.55); z-index: 9999; display: flex; align-items: center; justify-content: center; }
        .amb-overlay-box { background: var(--bg-surface); border-radius: var(--radius-lg); padding: 1.5rem; max-width: 600px; width: 90%; box-shadow: var(--shadow-lg); max-height: 90vh; overflow-y: auto; }
        
        .checklist-card { border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 1rem; background-color: var(--bg-base); margin-bottom: 1rem; }
      `;
      document.head.appendChild(style);
    }

    // Default Seed Data
    window.state.ambulances = window.state.ambulances || [
      { id: "KA-01-AB-1234", type: "ALS", status: "On Trip", driver: "Rajan Kumar", insuranceExpiry: "2026-07-31", lastService: "2026-05-15", fitnessExpiry: "2026-11-30", loadedEquipment: ["O₂ cylinder", "Defibrillator", "Suction machine", "IV kit", "Cardiac monitor", "Spine board"] },
      { id: "KA-01-AB-5678", type: "BLS", status: "Available", driver: "Venkat Rao", insuranceExpiry: "2027-02-28", lastService: "2026-04-20", fitnessExpiry: "2027-01-31", loadedEquipment: ["O₂ cylinder", "Suction machine", "IV kit", "Spine board"] },
      { id: "KA-01-AB-9012", type: "BLS", status: "Maintenance", driver: "—", insuranceExpiry: "2027-03-15", lastService: "2026-01-10", fitnessExpiry: "2027-02-28", maintenanceReason: "Tyre replacement", maintenanceSince: "2026-06-24", loadedEquipment: ["O₂ cylinder", "Suction machine", "Spine board"] },
      { id: "KA-01-AB-3456", type: "Mortuary", status: "Available", driver: "Suresh Babu", insuranceExpiry: "2026-09-30", lastService: "2026-06-10", fitnessExpiry: "2026-08-31", loadedEquipment: ["Spine board"] }
    ];

    window.state.ambulanceTrips = window.state.ambulanceTrips || [
      { id: "AMB-2026-00341", type: "Outbound", unitId: "KA-01-AB-1234", patientName: "Rajesh Kumar", uhid: "SH-2026-04821", driver: "Rajan Kumar", status: "En Route to Patient", departedTime: "14:22", estReturn: "15:30", routeHistory: ["Assigned", "Dispatched", "En Route to Patient"], notes: "Trauma emergency response.", distanceKm: 31 },
      { id: "AMB-2026-00340", type: "Transfer", unitId: "KA-01-AB-5678", patientName: "Priya Menon", uhid: "SH-2026-04803", driver: "Venkat Rao", status: "Patient Delivered", departedTime: "11:30", estReturn: "13:30", routeHistory: ["Checklist Pending", "Ready", "Dispatched", "En Route", "Patient Delivered"], notes: "Escorted transfer to cardiac unit.", distanceKm: 18 }
    ];

    window.state.ambulanceDrivers = window.state.ambulanceDrivers || [
      { name: "Rajan Kumar", licence: "KA-123456", expiry: "2028-08-15", firstAidCert: "Valid · Jun 2027", assignedUnit: "KA-01-AB-1234", status: "Active" },
      { name: "Venkat Rao", licence: "KA-789012", expiry: "2027-03-20", firstAidCert: "Valid · Dec 2026", assignedUnit: "KA-01-AB-5678", status: "Active" },
      { name: "Suresh Babu", licence: "KA-345678", expiry: "2026-11-10", firstAidCert: "Expired ⚠️", assignedUnit: "KA-01-AB-3456", status: "Active" }
    ];
  }

  // Active view router mount point
  window.views.ambulance = function (container, subAnchor, params) {
    var pageTitleEl = document.getElementById('active-page-title');
    if (pageTitleEl) pageTitleEl.textContent = 'Ambulance Operations Console';

    initAmbulanceState();
    
    if (params && params.tripId) {
      selectedTripId = params.tripId;
    }

    renderAmbulanceDashboard(container);
  };

  function renderAmbulanceDashboard(container) {
    if (tripOverlayOpen) {
      renderTripCreationOverlay(container);
      return;
    }

    var html = `
      <div class="amb-wrap">
        <!-- Module Header -->
        <div style="display:flex; justify-content:space-between; align-items:center; background:var(--bg-surface); border:1px solid var(--border-color); padding:1rem 1.5rem; border-radius:var(--radius-md); box-shadow:var(--shadow-sm);">
          <div>
            <h2 style="margin:0; font-size:1.2rem; font-weight:700; color:var(--text-primary); display:flex; align-items:center; gap:8px;">🚑 Ambulance Dispatch Board</h2>
            <div style="font-size:0.75rem; color:var(--text-muted); font-weight:500; margin-top:2px;">Hospital Fleet Tracking · Critical Trauma Transport Protocols</div>
          </div>
          
          <div style="display:flex; align-items:center; gap:16px;">
            <div style="display: flex; align-items: center; gap: 0.5rem;">
              <span class="form-label" style="margin: 0; white-space: nowrap; font-weight:600;">Console Role:</span>
              <select id="amb-role-selector" class="form-select" style="padding: 0.35rem 1.75rem 0.35rem 0.75rem; width: auto; font-size: 0.8rem; font-weight: 600;" onchange="window.switchAmbRole(this.value)">
                <option value="Dispatcher" ${activeRole === 'Dispatcher' ? 'selected' : ''}>Dispatcher</option>
                <option value="Driver" ${activeRole === 'Driver' ? 'selected' : ''}>Driver</option>
                <option value="ED Nurse" ${activeRole === 'ED Nurse' ? 'selected' : ''}>ED Nurse</option>
                <option value="Billing" ${activeRole === 'Billing' ? 'selected' : ''}>Billing Executive</option>
                <option value="Administrator" ${activeRole === 'Administrator' ? 'selected' : ''}>Administrator</option>
              </select>
            </div>
            
            <button class="btn btn-primary" style="padding: 0.45rem 1rem; font-size:0.8rem; font-weight:600;" onclick="window.openTripOverlay()">
              + New Trip
            </button>
          </div>
        </div>

        <!-- Sticky Tab Container (Aligned to Design System) -->
        <div class="tab-container" style="position: sticky; top: -1.5rem; background: var(--bg-base); z-index: 10; padding: 10px 0; margin-bottom: 0.5rem; margin-top: -8px;">
          <div class="tab-item ${activeTab === 'fleet' ? 'active' : ''}" onclick="window.switchAmbTab('fleet')">🚑 Fleet Board</div>
          <div class="tab-item ${activeTab === 'active' ? 'active' : ''}" onclick="window.switchAmbTab('active')">📋 Active Trips</div>
          <div class="tab-item ${activeTab === 'log' ? 'active' : ''}" onclick="window.switchAmbTab('log')">📜 Trip Log</div>
          <div class="tab-item ${activeTab === 'manage' ? 'active' : ''}" onclick="window.switchAmbTab('manage')">🔧 Fleet Management</div>
        </div>

        <div id="amb-tab-content">
          ${renderTabContent()}
        </div>
      </div>
    `;

    container.innerHTML = html;
  }

  window.switchAmbTab = function(tab) {
    activeTab = tab;
    renderAmbulanceDashboard(document.getElementById('main-content'));
  };

  window.switchAmbRole = function(role) {
    activeRole = role;
    if (role === 'Dispatcher') activeTab = 'fleet';
    else if (role === 'Driver' || role === 'ED Nurse' || role === 'Billing') activeTab = 'active';
    else if (role === 'Administrator') activeTab = 'manage';
    
    renderAmbulanceDashboard(document.getElementById('main-content'));
  };

  function renderTabContent() {
    switch (activeTab) {
      case 'fleet':
        return renderFleetBoardTab();
      case 'active':
        return renderActiveTripsTab();
      case 'log':
        return renderTripLogTab();
      case 'manage':
        return renderFleetManagementTab();
      default:
        return renderFleetBoardTab();
    }
  }

  /* ==========================================================================
     TAB 1 — FLEET BOARD
     ========================================================================== */
  function renderFleetBoardTab() {
    const total = window.state.ambulances.length;
    const av = window.state.ambulances.filter(a => a.status === 'Available').length;
    const trip = window.state.ambulances.filter(a => a.status === 'On Trip').length;
    const maint = window.state.ambulances.filter(a => a.status === 'Maintenance').length;

    // Stat strip
    var statsHTML = `
      <div style="background:var(--bg-surface); border:1px solid var(--border-color); border-radius:var(--radius-md); padding:1rem; font-size:0.8rem; font-weight:700; color:var(--text-secondary); display:flex; justify-content:space-between; flex-wrap:wrap; gap:12px; margin-bottom:1.5rem; box-shadow:var(--shadow-sm);">
        <span>Total Units: <strong>${total}</strong></span>
        <div style="display:flex; gap:16px;">
          <span style="color:var(--amb-green);">🟢 Available: ${av}</span>
          <span style="color:var(--amb-blue);">🔵 On Trip: ${trip}</span>
          <span style="color:var(--amb-amber);">🟠 Maintenance: ${maint}</span>
        </div>
      </div>
    `;

    // Visual cards grid using Design System card layout
    var gridHTML = '<div class="grid-2" style="margin-bottom:1.5rem;">';
    window.state.ambulances.forEach(function (amb) {
      var colorVar = amb.status === 'Available' ? 'var(--amb-green)' : (amb.status === 'On Trip' ? 'var(--amb-blue)' : 'var(--amb-amber)');
      var badgeClass = amb.status === 'Available' ? 'badge-success' : (amb.status === 'On Trip' ? 'badge-primary' : 'badge-warning');
      var statusText = amb.status === 'Available' ? 'Available' : (amb.status === 'On Trip' ? 'On Trip' : 'Maintenance');
      
      var bodyHTML = '';
      if (amb.status === 'On Trip') {
        const tripObj = window.state.ambulanceTrips.find(t => t.unitId === amb.id && t.status !== 'Closed');
        var tripId = tripObj ? tripObj.id : '—';
        var tripType = tripObj ? tripObj.type : '—';
        var tripStatus = tripObj ? tripObj.status : '—';
        var dep = tripObj ? tripObj.departedTime : '—';
        var est = tripObj ? tripObj.estReturn : '—';

        bodyHTML = `
          <div style="font-size:0.8rem; color:var(--text-secondary); margin-top:8px; line-height:1.6;">
            Driver: <strong>${amb.driver}</strong><br>
            Trip: <span class="mono" style="font-weight:700;">${tripId}</span> · ${tripType}<br>
            Status: <span style="font-weight:700; color:var(--amb-blue);">${tripStatus}</span><br>
            Departed: <span class="mono">${dep}</span> · Est. return: <span class="mono">${est}</span>
          </div>
          <button class="btn btn-secondary btn-sm" style="margin-top:12px; width:100%;" onclick="window.switchAmbTab('active')">View Trip Details</button>
        `;
      } else if (amb.status === 'Available') {
        bodyHTML = `
          <div style="font-size:0.8rem; color:var(--text-secondary); margin-top:8px; line-height:1.6; min-height:80px;">
            Driver: <strong>${amb.driver}</strong><br>
            Last trip: <span class="mono">12:40</span> · Returned <span class="mono">13:15</span>
          </div>
          <button class="btn btn-primary btn-sm" style="background:var(--amb-green); border:none; margin-top:12px; width:100%; font-weight:700;" onclick="window.openTripOverlay()">Dispatch →</button>
        `;
      } else {
        bodyHTML = `
          <div style="font-size:0.8rem; color:var(--text-secondary); margin-top:8px; line-height:1.6; min-height:80px;">
            In workshop since: <span class="mono">${amb.maintenanceSince || '24 Jun'}</span> · Est: <span class="mono">26 Jun</span><br>
            Reason: <strong>${amb.maintenanceReason || 'Service'}</strong>
          </div>
          <button class="btn btn-secondary btn-sm" style="margin-top:12px; width:100%; font-weight:700;" onclick="window.switchAmbTab('manage')">View Maintenance Details</button>
        `;
      }

      gridHTML += `
        <div class="card" style="border-left: 4px solid ${colorVar}; padding: 1.25rem; display:flex; flex-direction:column; justify-content:space-between; min-height:150px; box-shadow:var(--shadow-sm);">
          <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid var(--border-color); padding-bottom:8px;">
            <span class="badge ${badgeClass}">${statusText}</span>
            <span class="mono" style="font-size:0.85rem; font-weight:700; color:var(--text-primary);">${amb.id} <span style="font-size:9px; background:var(--bg-base-elevated); padding:2px 6px; border-radius:3px; color:var(--text-secondary); font-weight:600;">${amb.type}</span></span>
          </div>
          ${bodyHTML}
        </div>
      `;
    });
    gridHTML += '</div>';

    // Compliance alerts strip
    var complianceAlertsHTML = '';
    const now = new Date();
    window.state.ambulances.forEach(function (amb) {
      if (amb.insuranceExpiry) {
        var diff = Math.ceil((new Date(amb.insuranceExpiry) - now) / 86400000);
        if (diff <= 30) {
          complianceAlertsHTML += `
            <div style="background:var(--amb-red-light); border-left:4px solid var(--amb-red); border-radius:var(--radius-sm); padding:10px 16px; margin-bottom:8px; font-size:0.8rem; font-weight:700; color:#991b1b; display:flex; justify-content:space-between; align-items:center; box-shadow:var(--shadow-sm);">
              <span>⚠️ ${amb.id} — Insurance expiring ${amb.insuranceExpiry} (${diff} days)</span>
              <button class="btn btn-secondary btn-sm" style="background:#fff; border-color:#fca5a5; color:#991b1b;" onclick="window.scrollToUnit('${amb.id}')">View Details</button>
            </div>
          `;
        }
      }
    });

    window.state.ambulanceDrivers.forEach(function (drv) {
      if (drv.firstAidCert.includes('Expired')) {
        complianceAlertsHTML += `
          <div style="background:var(--amb-red-light); border-left:4px solid var(--amb-red); border-radius:var(--radius-sm); padding:10px 16px; margin-bottom:8px; font-size:0.8rem; font-weight:700; color:#991b1b; display:flex; justify-content:space-between; align-items:center; box-shadow:var(--shadow-sm);">
            <span>⚠️ ${drv.name} — First Aid Certificate Expired</span>
            <button class="btn btn-secondary btn-sm" style="background:#fff; border-color:#fca5a5; color:#991b1b;" onclick="window.switchAmbTab('manage')">View Profile</button>
          </div>
        `;
      }
    });

    return statsHTML + gridHTML + complianceAlertsHTML;
  }

  window.scrollToUnit = function(unitId) {
    activeTab = 'manage';
    expandedUnits[unitId] = true;
    renderAmbulanceDashboard(document.getElementById('main-content'));
  };

  /* ==========================================================================
     TAB 2 — ACTIVE TRIPS
     ========================================================================== */
  function renderActiveTripsTab() {
    var activeTrips = window.state.ambulanceTrips.filter(t => t.status !== 'Closed');

    var rowsHTML = '';
    activeTrips.forEach(function (t) {
      var badgeClass = t.type === 'Outbound' ? 'badge-primary' : (t.type === 'Inbound' ? 'badge-success' : 'badge-purple');
      var isCurrentUpdate = selectedTripId === t.id;

      rowsHTML += `
        <tr style="border-bottom:1px solid var(--border-color);">
          <td style="padding:12px; font-weight:700;" class="mono">${t.id}</td>
          <td style="padding:12px;"><span class="badge ${badgeClass}">${t.type}</span></td>
          <td style="padding:12px; font-weight:700;" class="mono">${t.unitId}</td>
          <td style="padding:12px; font-weight:700; color:var(--primary);">${t.patientName}</td>
          <td style="padding:12px;">${t.driver}</td>
          <td style="padding:12px; font-weight:700; color:var(--amb-blue);">${t.status}</td>
          <td style="padding:12px;" class="mono">${t.departedTime}</td>
          <td style="padding:12px; text-align:right; display:flex; gap:6px; justify-content:flex-end;">
            <button class="btn btn-secondary btn-sm" style="padding: 3px 8px; font-weight:600;" onclick="window.triggerTripUpdate('${t.id}')">Update</button>
            <button class="btn btn-secondary btn-sm" style="padding: 3px 8px; font-weight:600; border-color:var(--color-danger); color:var(--color-danger);" onclick="window.closeTripPrompt('${t.id}')">Close Trip</button>
          </td>
        </tr>
        ${isCurrentUpdate ? `
          <tr>
            <td colspan="8" style="padding:1rem; background:var(--bg-base-elevated); border-bottom:1px solid var(--border-color);">
              ${renderTripUpdatePanel(t)}
            </td>
          </tr>
        ` : ''}
      `;
    });

    var html = `
      <div class="card" style="box-shadow:var(--shadow-sm); overflow:hidden;">
        <div class="card-header" style="background:var(--bg-base-elevated);">
          <h3 class="card-title" style="font-size:0.9rem; color:var(--text-primary);">Active Ambulance Trips (${activeTrips.length})</h3>
        </div>
        <div class="custom-table-container">
          <table class="custom-table">
            <thead>
              <tr>
                <th>Trip ID</th>
                <th>Type</th>
                <th>Unit</th>
                <th>Patient</th>
                <th>Driver</th>
                <th>Current Status</th>
                <th>Departed</th>
                <th style="text-align:right;">Action</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHTML || `<tr><td colspan="8" style="text-align:center; padding:40px; color:var(--text-muted); font-style:italic;">No active trips running.</td></tr>`}
            </tbody>
          </table>
        </div>
      </div>
    `;

    return html;
  }

  window.triggerTripUpdate = function (tripId) {
    selectedTripId = selectedTripId === tripId ? '' : tripId;
    renderAmbulanceDashboard(document.getElementById('main-content'));
  };

  function renderTripUpdatePanel(t) {
    var outboundProg = ["Assigned", "Dispatched", "En Route to Patient", "Patient Picked Up", "En Route to Hospital", "Arrived at Hospital", "Returning", "Returned"];
    var inboundProg = ["Alert Sent", "ETA Confirmed", "Patient Arrived", "Handed to ED"];
    var transferProg = ["Checklist Pending", "Ready", "Dispatched", "En Route", "Patient Delivered", "Returning", "Returned"];

    var currentIdx = -1;
    var list = [];
    if (t.type === 'Outbound') { list = outboundProg; }
    else if (t.type === 'Inbound') { list = inboundProg; }
    else { list = transferProg; }

    currentIdx = list.indexOf(t.status);
    var nextStatus = (currentIdx !== -1 && currentIdx < list.length - 1) ? list[currentIdx + 1] : '';

    return `
      <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px;">
        <div>
          <div style="font-size:0.75rem; color:var(--text-muted); font-weight:700; text-transform:uppercase; margin-bottom:6px;">Status Progression Pipeline</div>
          <div style="display:flex; gap:8px; align-items:center; flex-wrap:wrap;">
            ${list.map((st, i) => `
              <span class="trip-prog-item ${st === t.status ? 'active' : ''}" style="${i <= currentIdx ? 'color:var(--amb-blue);' : ''}">
                ${st} ${i < list.length - 1 ? '→' : ''}
              </span>
            `).join('')}
          </div>
        </div>

        <div style="display:flex; gap:10px; align-items:center;">
          ${nextStatus ? `
            <button class="btn btn-primary btn-sm" onclick="window.saveTripNextStatus('${t.id}', '${nextStatus}')">
              Move to: ${nextStatus} →
            </button>
          ` : '<span style="font-size:0.75rem; color:var(--color-success); font-weight:700;">Trip ready for closure.</span>'}
          <button class="btn btn-secondary btn-sm" style="border-color:var(--color-danger); color:var(--color-danger);" onclick="window.logTripIncident('${t.id}')">⚠️ Mark Incident</button>
        </div>
      </div>
    `;
  }

  window.saveTripNextStatus = function (tripId, nextSt) {
    var t = window.state.ambulanceTrips.find(tr => tr.id === tripId);
    if (t) {
      t.status = nextSt;
      t.routeHistory = t.routeHistory || [];
      t.routeHistory.push(nextSt);
      
      if (nextSt === 'Arrived at Hospital') {
        alert("Ambulance Arrived at Hospital!\n\nED Nurse must link patient and assign UHID to release the vehicle.");
      }

      alert(`Trip status updated: ${nextSt}`);
      renderAmbulanceDashboard(document.getElementById('main-content'));
    }
  };

  window.logTripIncident = async function(tripId) {
    var reason = await customPrompt("Describe the ambulance trip incident / delay reason:");
    if (reason) {
      var t = window.state.ambulanceTrips.find(tr => tr.id === tripId);
      if (t) {
        t.notes += ` | INCIDENT: ${reason}`;
        alert("Incident logged to trip sheet.");
      }
    }
  };

  window.closeTripPrompt = function (tripId) {
    var t = window.state.ambulanceTrips.find(tr => tr.id === tripId);
    if (!t) return;

    const modal = document.createElement('div');
    modal.id = 'amb-billing-modal';
    modal.className = 'amb-overlay';
    modal.innerHTML = `
      <div class="amb-overlay-box" style="width:400px;">
        <div style="font-size:1.15rem; font-weight:700; color:var(--text-primary); border-bottom:1px solid var(--border-color); padding-bottom:8px; margin-bottom:16px; font-family:var(--font-display);">🧾 Ambulance Billing Invoice</div>
        
        <div style="font-size:0.8rem; color:var(--text-secondary); display:flex; flex-direction:column; gap:8px; line-height:1.6; margin-bottom:20px;">
          <div>Trip Ref: <strong class="mono">${t.id}</strong></div>
          <div>Patient: <strong>${t.patientName} (${t.uhid || 'External Patient'})</strong></div>
          <div>Unit Type: <strong>${t.type} Class</strong></div>
          <div>Distance: <strong>${t.distanceKm || '12'} km</strong></div>
          
          <hr style="border:none; border-top:1px dashed var(--border-color); margin:8px 0;">
          
          <div style="display:flex; justify-content:space-between;"><span>Base fare (first 5 km):</span><strong>₹500</strong></div>
          <div style="display:flex; justify-content:space-between;"><span>Additional km (${(t.distanceKm || 12) - 5} × ₹25):</span><strong>₹${((t.distanceKm || 12) - 5) * 25}</strong></div>
          <div style="display:flex; justify-content:space-between;"><span>Surcharge:</span><strong>₹1,000</strong></div>
          
          <hr style="border:none; border-top:1px dashed var(--border-color); margin:8px 0;">
          <div style="display:flex; justify-content:space-between; font-size:0.9rem; font-weight:700; color:var(--text-primary);">
            <span>TOTAL AMOUNT DUE:</span>
            <span>₹${500 + ((t.distanceKm || 12) - 5) * 25 + 1000}</span>
          </div>
        </div>

        <div style="display:flex; justify-content:flex-end; gap:8px;">
          <button class="btn btn-secondary" onclick="document.getElementById('amb-billing-modal').remove()">Cancel</button>
          <button class="btn btn-primary" style="background:#059669; border:none; font-weight:700;" onclick="window.finalizeTripClose('${tripId}')">Send to Billing</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  };

  window.finalizeTripClose = function (tripId) {
    var t = window.state.ambulanceTrips.find(tr => tr.id === tripId);
    if (t) {
      t.status = "Closed";
      
      var amb = window.state.ambulances.find(a => a.id === t.unitId);
      if (amb) {
        amb.status = "Available";
      }

      if (t.uhid && window.state.billing) {
        window.state.billing.push({
          uhid: t.uhid,
          item: `Ambulance service ${t.id}`,
          amount: 2950,
          date: new Date().toLocaleDateString('en-GB')
        });
      }

      alert("Trip closed. Invoice posted to central Patient Billing Ledger.");
      document.getElementById('amb-billing-modal').remove();
      renderAmbulanceDashboard(document.getElementById('main-content'));
    }
  };

  /* ==========================================================================
     TAB 3 — TRIP LOG
     ========================================================================== */
  function renderTripLogTab() {
    var logs = window.state.ambulanceTrips.filter(t => t.status === 'Closed');

    var rowsHTML = '';
    logs.forEach(function (t) {
      rowsHTML += `
        <tr style="border-bottom:1px solid var(--border-color);">
          <td style="padding:10px 12px; font-weight:700;" class="mono">${t.id}</td>
          <td style="padding:10px 12px;">${t.type}</td>
          <td style="padding:10px 12px;" class="mono">${t.unitId}</td>
          <td style="padding:10px 12px; font-weight:700; color:var(--primary);">${t.patientName}</td>
          <td style="padding:10px 12px;" class="mono">${t.uhid || '—'}</td>
          <td style="padding:10px 12px;">${t.distanceKm || '12'} km</td>
          <td style="padding:10px 12px; font-weight:700;">₹2,950</td>
          <td style="padding:10px 12px;"><span class="badge badge-success">Closed</span></td>
          <td style="padding:10px 12px; text-align:right;">
            <button class="btn btn-secondary btn-sm" onclick="window.printTripSheet('${t.id}')">Print Sheet</button>
          </td>
        </tr>
      `;
    });

    var html = `
      <div class="card" style="box-shadow:var(--shadow-sm); overflow:hidden;">
        <div class="card-header" style="background:var(--bg-base-elevated);">
          <h3 class="card-title" style="font-size:0.9rem; color:var(--text-primary);">📜 Historical Trip Log Archive (${logs.length})</h3>
        </div>
        <div class="custom-table-container">
          <table class="custom-table">
            <thead>
              <tr>
                <th>Trip ID</th>
                <th>Type</th>
                <th>Unit</th>
                <th>Patient Name</th>
                <th>UHID</th>
                <th>Distance</th>
                <th>Amount</th>
                <th>Status</th>
                <th style="text-align:right;">Action</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHTML || `<tr><td colspan="9" style="text-align:center; padding:40px; color:var(--text-muted); font-style:italic;">No logged historical trips.</td></tr>`}
            </tbody>
          </table>
        </div>
      </div>
    `;

    return html;
  }

  window.printTripSheet = function (tripId) {
    var t = window.state.ambulanceTrips.find(tr => tr.id === tripId);
    if (!t) return;

    var printWindow = window.open('', '_blank', 'width=800,height=600');
    printWindow.document.write(`
      <html>
        <head>
          <title>Ambulance Trip Log Sheet - ${t.id}</title>
          <style>
            body { font-family: monospace; padding: 30px; line-height: 1.5; color: #111; }
            .header { text-align: center; border-bottom: 2px dashed #111; padding-bottom: 12px; margin-bottom: 20px; }
            .grid { display: grid; grid-template-columns: 140px 1fr; gap: 8px; font-size: 13px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>SARONIL HEALTH HIS</h2>
            <h3>Ambulance Trip Sheet &amp; Billing Statement</h3>
          </div>
          <div style="float:right; font-weight:bold;">Trip ID: ${t.id}</div>
          <div style="font-weight:bold; margin-bottom:20px;">Unit Registration: ${t.unitId}</div>
          
          <div class="grid">
            <div>Patient Name:</div><strong>${t.patientName}</strong>
            <div>UHID:</div><strong>${t.uhid || '—'}</strong>
            <div>Trip Type:</div><strong>${t.type} Transport</strong>
            <div>Assigned Driver:</div><strong>${t.driver}</strong>
            <div>Departed Time:</div><strong>${t.departedTime}</strong>
            <div>Distance Covered:</div><strong>${t.distanceKm || '12'} km</strong>
            <div>Trip Billing:</div><strong>₹2,950 (Posted to IPD bill)</strong>
            <div>Special Notes:</div><strong>${t.notes || '—'}</strong>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    setTimeout(() => printWindow.print(), 500);
  };

  /* ==========================================================================
     TAB 4 — FLEET MANAGEMENT
     ========================================================================== */
  function renderFleetManagementTab() {
    var analyticsHTML = `
      <div class="stats-grid" style="margin-bottom:1.5rem;">
        <div class="stat-card">
          <div class="stat-info">
            <span class="stat-label">Avg Response Time</span>
            <span class="stat-value">18 mins</span>
            <span class="stat-sub">Target dispatch <span>&lt;15 mins</span></span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-info">
            <span class="stat-label">Fleet Utilisation</span>
            <span class="stat-value">74%</span>
            <span class="stat-sub">4 units active roster</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-info">
            <span class="stat-label">Compliance Alerts</span>
            <span class="stat-value" style="color:var(--color-danger);">2 Alerts</span>
            <span class="stat-sub">Insurance / Licences check</span>
          </div>
        </div>
      </div>
    `;

    var unitsRows = '';
    window.state.ambulances.forEach(function (amb) {
      var isExpanded = expandedUnits[amb.id] ? true : false;
      var now = new Date();
      var diff = Math.ceil((new Date(amb.insuranceExpiry) - now) / 86400000);
      var expColor = diff <= 30 ? 'var(--color-danger)' : (diff <= 60 ? 'var(--color-warning)' : 'var(--color-success)');

      unitsRows += `
        <tr style="border-bottom:1px solid var(--border-color); cursor:pointer;" onclick="window.toggleUnitRow('${amb.id}')">
          <td style="padding:10px 12px; font-weight:700;">${amb.id}</td>
          <td style="padding:10px 12px;">${amb.type}</td>
          <td style="padding:10px 12px;"><span class="badge ${amb.status === 'Available' ? 'badge-success' : 'badge-primary'}">${amb.status}</span></td>
          <td style="padding:10px 12px;">${amb.driver}</td>
          <td style="padding:10px 12px;" class="mono">${amb.lastService}</td>
          <td style="padding:10px 12px; font-weight:700; color:${expColor};" class="mono">${amb.insuranceExpiry}</td>
          <td style="padding:10px 12px; text-align:right;">
            <button class="btn btn-secondary btn-sm" onclick="event.stopPropagation(); window.toggleUnitRow('${amb.id}')">
              ${isExpanded ? 'Collapse' : 'Expand Details'}
            </button>
          </td>
        </tr>
        ${isExpanded ? `
          <tr>
            <td colspan="7" style="background:var(--bg-base-elevated); padding:1.25rem; border-bottom:1px solid var(--border-color); font-size:0.8rem; line-height:1.6;">
              <div style="display:grid; grid-template-columns:1.5fr 1fr; gap:20px;">
                <div>
                  <div style="font-weight:700; color:var(--text-primary); margin-bottom:8px;">🔧 UNIT DOCUMENTATION &amp; EQUIPMENT LIST</div>
                  Registration: <strong>${amb.id}</strong> (Type: ${amb.type})<br>
                  Equipments loaded: <em>${amb.loadedEquipment.join(', ')}</em><br>
                  Insurance Policy: <strong>New India Assurance (NIA-8911)</strong> · Expiry: <strong style="color:${expColor};">${amb.insuranceExpiry}</strong><br>
                  Fitness Certification Expiry: <strong>${amb.fitnessExpiry}</strong><br>
                  Pollution cert: <strong>2026-08-31</strong> · Permit: <strong>State permit</strong>
                </div>
                <div style="display:flex; flex-direction:column; gap:8px; justify-content:center;">
                  ${amb.status !== 'Maintenance' ? `
                    <button class="btn btn-secondary btn-sm" style="border-color:var(--amb-amber); color:var(--amb-amber); font-weight:700;" onclick="window.sendUnitToMaintenance('${amb.id}')">
                      Send to Maintenance
                    </button>
                  ` : `
                    <button class="btn btn-primary btn-sm" style="background:var(--amb-green); border:none; font-weight:700;" onclick="window.markUnitReady('${amb.id}')">
                      Mark Ready (Release Unit)
                    </button>
                  `}
                </div>
              </div>
            </td>
          </tr>
        ` : ''}
      `;
    });

    var unitRegHTML = `
      <div class="card" style="box-shadow:var(--shadow-sm); overflow:hidden; margin-bottom:1.5rem;">
        <div class="card-header" style="background:var(--bg-base-elevated);">
          <h3 class="card-title" style="font-size:0.9rem; color:var(--text-primary);">🏢 Ambulance Units Register</h3>
        </div>
        <div class="custom-table-container">
          <table class="custom-table">
            <thead>
              <tr>
                <th>Unit No</th>
                <th>Type</th>
                <th>Status</th>
                <th>Assigned Driver</th>
                <th>Last Service</th>
                <th>Insurance Expiry</th>
                <th style="text-align:right;">Action</th>
              </tr>
            </thead>
            <tbody>
              ${unitsRows}
            </tbody>
          </table>
        </div>
      </div>
    `;

    var driverRows = '';
    window.state.ambulanceDrivers.forEach(function (drv) {
      var isExpired = drv.firstAidCert.includes('Expired');

      driverRows += `
        <tr style="border-bottom:1px solid var(--border-color); ${isExpired ? 'background-color:var(--color-danger-bg);' : ''}">
          <td style="padding:10px 12px; font-weight:700;">${drv.name}</td>
          <td style="padding:10px 12px;" class="mono">${drv.licence}</td>
          <td style="padding:10px 12px;" class="mono">${drv.expiry}</td>
          <td style="padding:10px 12px; font-weight:700; color:${isExpired ? 'var(--color-danger)' : 'var(--color-success)'};">${drv.firstAidCert}</td>
          <td style="padding:10px 12px;" class="mono">${drv.assignedUnit}</td>
          <td style="padding:10px 12px;"><span class="badge badge-success">${drv.status}</span></td>
        </tr>
      `;
    });

    var driverRegHTML = `
      <div class="card" style="box-shadow:var(--shadow-sm); overflow:hidden;">
        <div class="card-header" style="background:var(--bg-base-elevated);">
          <h3 class="card-title" style="font-size:0.9rem; color:var(--text-primary);">👨‍✈️ Driver Register &amp; Certification Logs</h3>
        </div>
        <div class="custom-table-container">
          <table class="custom-table">
            <thead>
              <tr>
                <th>Driver</th>
                <th>Licence No</th>
                <th>Licence Expiry</th>
                <th>First Aid Cert</th>
                <th>Assigned Unit</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${driverRows}
            </tbody>
          </table>
        </div>
      </div>
    `;

    return analyticsHTML + unitRegHTML + driverRegHTML;
  }

  window.toggleUnitRow = function (id) {
    expandedUnits[id] = !expandedUnits[id];
    renderAmbulanceDashboard(document.getElementById('main-content'));
  };

  window.sendUnitToMaintenance = async function (id) {
    const reason = await customPrompt("Enter Maintenance / Service reason field details:");
    if (reason) {
      var amb = window.state.ambulances.find(a => a.id === id);
      if (amb) {
        amb.status = "Maintenance";
        amb.maintenanceReason = reason;
        amb.maintenanceSince = new Date().toISOString().slice(0, 10);
        alert(`Ambulance unit ${id} sent to maintenance workshop.`);
        renderAmbulanceDashboard(document.getElementById('main-content'));
      }
    }
  };

  window.markUnitReady = function (id) {
    var amb = window.state.ambulances.find(a => a.id === id);
    if (amb) {
      amb.status = "Available";
      alert(`Ambulance unit ${id} repaired and marked Available.`);
      renderAmbulanceDashboard(document.getElementById('main-content'));
    }
  };

  /* ==========================================================================
     TRIP CREATION OVERLAY FLOWS
     ========================================================================== */
  window.openTripOverlay = function () {
    tripOverlayOpen = true;
    tripStep = 1;
    selectedTripType = 'outbound';
    selectedTransferUhid = '';
    renderAmbulanceDashboard(document.getElementById('main-content'));
  };

  window.closeTripOverlay = function () {
    tripOverlayOpen = false;
    renderAmbulanceDashboard(document.getElementById('main-content'));
  };

  window.switchTripType = function (type) {
    selectedTripType = type;
    tripStep = 2;
    renderAmbulanceDashboard(document.getElementById('main-content'));
  };

  window.prevTripStep = function () {
    if (tripStep > 1) {
      tripStep--;
      renderAmbulanceDashboard(document.getElementById('main-content'));
    }
  };

  window.nextTripStep = function () {
    if (tripStep === 2 && selectedTripType === 'inbound') {
      alert("Arrival Alert Sent successfully to ED nurse + duty doctor!");
      tripOverlayOpen = false;
      renderAmbulanceDashboard(document.getElementById('main-content'));
      return;
    }
    
    tripStep++;
    renderAmbulanceDashboard(document.getElementById('main-content'));
  };

  window.selectTransferPatient = function (uhid) {
    selectedTransferUhid = uhid;
    var p = window.state.patients.find(pt => pt.uhid === uhid);
    const nameEl = document.getElementById('trf-patient-name');
    if (nameEl && p) {
      nameEl.value = p.name;
    }
  };

  window.confirmDispatchTrip = function () {
    const tripId = "AMB-2026-00" + Math.floor(342 + Math.random() * 50);
    const avUnits = window.state.ambulances.filter(a => a.status === 'Available');
    
    if (avUnits.length === 0) {
      alert("No available ambulances in the dispatch pool.");
      return;
    }

    const assignedUnit = avUnits[0];
    assignedUnit.status = 'On Trip';

    var pName = 'Emergency Patient';
    if (selectedTripType === 'transfer' && selectedTransferUhid) {
      pName = window.state.patients.find(p => p.uhid === selectedTransferUhid)?.name || 'Patient';
    } else if (selectedTripType === 'outbound') {
      pName = document.getElementById('out-caller-name')?.value || 'Emergency Caller';
    }

    const newTrip = {
      id: tripId,
      type: selectedTripType === 'outbound' ? 'Outbound' : 'Transfer',
      unitId: assignedUnit.id,
      patientName: pName,
      uhid: selectedTransferUhid || '',
      driver: assignedUnit.driver,
      status: selectedTripType === 'outbound' ? 'En Route to Patient' : 'Dispatched',
      departedTime: new Date().toLocaleTimeString('en-US', {hour:'2-digit', minute:'2-digit'}),
      estReturn: '15:45',
      routeHistory: [selectedTripType === 'outbound' ? 'En Route to Patient' : 'Dispatched'],
      notes: 'New trip dispatched.',
      distanceKm: selectedTripType === 'outbound' ? 12 : 25
    };

    window.state.ambulanceTrips.unshift(newTrip);

    alert(`Trip ${tripId} successfully dispatched!\n\nAmbulance Assigned: ${assignedUnit.id}\nDriver: ${assignedUnit.driver}`);
    tripOverlayOpen = false;
    activeTab = 'active';
    renderAmbulanceDashboard(document.getElementById('main-content'));
  };

  function renderTripCreationOverlay(container) {
    var stepContent = '';

    if (tripStep === 1) {
      stepContent = `
        <div style="display:flex; flex-direction:column; gap:16px;">
          <div style="font-size:0.85rem; font-weight:800; color:var(--text-primary); text-transform:uppercase; font-family:var(--font-display);">Step 1 — Choose Trip Type</div>
          <button class="btn btn-primary" style="background:var(--amb-blue); border:none; padding:14px; text-align:left; font-weight:700; border-radius:8px;" onclick="window.switchTripType('outbound')">
            🚑 Outbound — Pick up patient / Dispatch Emergency
          </button>
          <button class="btn btn-primary" style="background:var(--amb-green); border:none; padding:14px; text-align:left; font-weight:700; border-radius:8px;" onclick="window.switchTripType('inbound')">
            📥 Inbound — Receive incoming external ambulance
          </button>
          <button class="btn btn-primary" style="background:#7c3aed; border:none; padding:14px; text-align:left; font-weight:700; border-radius:8px;" onclick="window.switchTripType('transfer')">
            🔄 Transfer — Move patient to another facility
          </button>
        </div>
      `;
    } else if (tripStep === 2) {
      if (selectedTripType === 'outbound') {
        stepContent = `
          <div style="display:flex; flex-direction:column; gap:12px;">
            <div style="font-size:0.9rem; font-weight:700; color:var(--text-primary);">Outbound Request Details</div>
            <div class="form-group"><label class="form-label">Caller Name</label><input type="text" id="out-caller-name" class="form-control" value="Amit Kumar"></div>
            <div class="form-group"><label class="form-label">Caller Mobile *</label><input type="tel" id="out-caller-mob" class="form-control" value="9845011982"></div>
            <div class="form-group"><label class="form-label">Pickup Address *</label><input type="text" id="out-address" class="form-control" value="Sector 4 HSR Layout, near Park"></div>
            <div class="form-group"><label class="form-label">Chief Complaint</label><input type="text" id="out-complaint" class="form-control" value="Severe breathing difficulty"></div>
          </div>
        `;
      } else if (selectedTripType === 'inbound') {
        stepContent = `
          <div style="display:flex; flex-direction:column; gap:12px;">
            <div style="font-size:0.9rem; font-weight:700; color:var(--text-primary);">Inbound Incoming Details</div>
            <div class="form-group"><label class="form-label">ETA (Est. arrival time)</label><input type="text" id="in-eta" class="form-control" value="14:47"></div>
            <div class="form-group">
              <label class="form-label">Sending Party</label>
              <select id="in-party" class="form-select">
                <option value="Another hospital">Another Hospital Transfer</option>
                <option value="Police">Police Escort</option>
                <option value="Bystander">Bystander</option>
              </select>
            </div>
            <div class="form-group"><label class="form-label">Suspected Diagnosis</label><input type="text" id="in-diagnosis" class="form-control" value="Acute Cardiac Arrest"></div>
            
            <div class="checklist-card">
              <label style="font-size:0.75rem; font-weight:700; color:var(--text-primary); text-transform:uppercase;">Special requirements on arrival</label>
              <div style="display:flex; flex-direction:column; gap:8px; margin-top:8px; font-size:12px; font-weight:600;">
                <label style="cursor:pointer; display:flex; align-items:center; gap:6px;"><input type="checkbox" checked> Resus bay ready</label>
                <label style="cursor:pointer; display:flex; align-items:center; gap:6px;"><input type="checkbox" checked> Ventilator standby</label>
                <label style="cursor:pointer; display:flex; align-items:center; gap:6px;"><input type="checkbox"> Blood bank alert</label>
              </div>
            </div>
          </div>
        `;
      } else {
        const patients = window.state.patients || [];
        stepContent = `
          <div style="display:flex; flex-direction:column; gap:12px;">
            <div style="font-size:0.9rem; font-weight:700; color:var(--text-primary);">Transfer Details</div>
            <div class="form-group">
              <label class="form-label">Patient UHID *</label>
              <select class="form-select" onchange="window.selectTransferPatient(this.value)">
                <option value="">-- Select Admitted Patient --</option>
                ${patients.map(p => `<option value="${p.uhid}">${p.name} (${p.uhid})</option>`).join('')}
              </select>
            </div>
            <div class="form-group"><label class="form-label">Patient Name</label><input type="text" id="trf-patient-name" class="form-control" readonly style="background:#f1f5f9;"></div>
            <div class="form-group"><label class="form-label">Destination Facility *</label><input type="text" id="trf-destination" class="form-control" value="Fortis Hospital, Bannerghatta Road"></div>
            <div class="form-group"><label class="form-label">Receiving Doctor</label><input type="text" id="trf-doc" class="form-control" value="Dr. Ramesh Gowda"></div>
          </div>
        `;
      }
    } else if (tripStep === 3) {
      if (selectedTripType === 'outbound') {
        stepContent = `
          <div style="display:flex; flex-direction:column; gap:12px;">
            <div style="font-size:0.9rem; font-weight:700; color:var(--text-primary);">Assign Ambulance Unit</div>
            <div class="form-group">
              <label class="form-label">Required Equipment</label>
              <select id="out-equip" class="form-select">
                <option value="ALS">ALS (Advanced Life Support)</option>
                <option value="BLS">BLS (Basic Life Support)</option>
              </select>
            </div>
            <div class="form-group"><label class="form-label">Assigned Paramedic / EMT</label><input type="text" id="out-paramedic" class="form-control" value="EMT Mary John"></div>
          </div>
        `;
      } else {
        stepContent = `
          <div style="display:flex; flex-direction:column; gap:12px;">
            <div style="font-size:0.9rem; font-weight:700; color:var(--text-primary);">Equipment &amp; Escort</div>
            <div class="checklist-card">
              <label style="font-size:0.75rem; font-weight:700; color:var(--text-primary); text-transform:uppercase;">Equipment on board</label>
              <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px; font-size:12px; margin-top:8px; font-weight:600;">
                <label style="display:flex; align-items:center; gap:6px;"><input type="checkbox" checked> O₂ cylinder</label>
                <label style="display:flex; align-items:center; gap:6px;"><input type="checkbox" checked> Cardiac monitor</label>
                <label style="display:flex; align-items:center; gap:6px;"><input type="checkbox"> IV pump</label>
                <label style="display:flex; align-items:center; gap:6px;"><input type="checkbox"> Suction machine</label>
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">Medical Escort Staff</label>
              <div style="display:flex; gap:16px; margin-top:6px; font-size:12px; font-weight:600;">
                <label style="cursor:pointer; display:flex; align-items:center; gap:6px;"><input type="radio" name="trf-escort" value="paramedic" checked> Paramedic only</label>
                <label style="cursor:pointer; display:flex; align-items:center; gap:6px;"><input type="radio" name="trf-escort" value="nurse"> Nurse Escort</label>
                <label style="cursor:pointer; display:flex; align-items:center; gap:6px;"><input type="radio" name="trf-escort" value="doctor"> Doctor Escort</label>
              </div>
            </div>
          </div>
        `;
      }
    } else if (tripStep === 4) {
      if (selectedTripType === 'outbound') {
        stepContent = `
          <div style="display:flex; flex-direction:column; gap:12px;">
            <div style="font-size:0.9rem; font-weight:700; color:var(--text-primary);">Step 4 — Outbound Summary</div>
            <div class="checklist-card" style="background:var(--primary-glow); font-size:0.8rem; line-height:1.6; border-color:var(--primary);">
              Caller: <strong>Amit Kumar (9845011982)</strong><br>
              Location: <strong>Sector 4 HSR Layout, near Park</strong><br>
              Complaint: <strong>Severe breathing difficulty</strong><br>
              Equipment: <strong>ALS Class Ambulance</strong>
            </div>
          </div>
        `;
      } else {
        var hasMlc = false;
        if (selectedTransferUhid) {
          const ep = window.state.emergencyPatients?.find(p => p.uhid === selectedTransferUhid);
          if (ep && ep.flags.includes('MLC')) hasMlc = true;
        }

        stepContent = `
          <div style="display:flex; flex-direction:column; gap:12px;">
            <div style="font-size:0.9rem; font-weight:700; color:var(--text-primary); border-bottom:1px solid var(--border-color); padding-bottom:6px;">Pre-Transfer Verification Checklist</div>
            
            <div style="display:flex; flex-direction:column; gap:8px; font-size:12px; font-weight:600;">
              <label style="cursor:pointer; display:flex; align-items:center; gap:6px;"><input type="checkbox" class="trf-chk" onchange="window.evalTrfCheck(this)"> Receiving hospital confirmed bed + doctor</label>
              <label style="cursor:pointer; display:flex; align-items:center; gap:6px;"><input type="checkbox" class="trf-chk" onchange="window.evalTrfCheck(this)"> Handover call made — Time: 14:00 PM</label>
              <label style="cursor:pointer; display:flex; align-items:center; gap:6px;"><input type="checkbox" class="trf-chk" onchange="window.evalTrfCheck(this)"> Transfer summary printed + signed</label>
              <label style="cursor:pointer; display:flex; align-items:center; gap:6px;"><input type="checkbox" class="trf-chk" onchange="window.evalTrfCheck(this)"> Patient / guardian consent signed</label>
              <label style="cursor:pointer; display:flex; align-items:center; gap:6px;"><input type="checkbox" class="trf-chk" onchange="window.evalTrfCheck(this)"> IV access patent — confirmed by nurse</label>
              
              <!-- MLC police check block -->
              <label id="trf-mlc-row" style="cursor:pointer; display:${hasMlc ? 'flex' : 'none'}; align-items:center; gap:6px; padding:8px; border-radius:var(--radius-sm); border:1px solid var(--color-danger); background:var(--color-danger-bg); color:var(--color-danger);">
                <input type="checkbox" class="trf-chk" onchange="window.evalTrfCheck(this)"> MLC: police intimated before transfer
              </label>
            </div>
          </div>
        `;
      }
    } else if (tripStep === 5) {
      stepContent = `
        <div style="display:flex; flex-direction:column; gap:12px;">
          <div style="font-size:0.9rem; font-weight:700; color:var(--text-primary);">Step 5 — Dispatch Summary</div>
          <div class="checklist-card" style="background:var(--primary-glow); font-size:0.8rem; line-height:1.6; border-color:var(--primary);">
            Transfer Trip Request Verified!<br>
            Destination: <strong>Fortis Hospital, Bannerghatta Road</strong><br>
            Receiving Doctor: <strong>Dr. Ramesh Gowda</strong><br>
            Verification Status: <strong style="color:var(--color-success);">All checklist gates cleared ✓</strong>
          </div>
        </div>
      `;
    }

    container.innerHTML = `
      <div class="amb-overlay">
        <div class="amb-overlay-box">
          <div style="display:flex; justify-content:space-between; border-bottom:1px solid var(--border-color); padding-bottom:10px; margin-bottom:16px;">
            <h3 style="margin:0; font-size:1.15rem; font-weight:700; color:var(--text-primary); font-family:var(--font-display);">🚑 Ambulance Trip Dispatch Form</h3>
            <span style="cursor:pointer; color:var(--text-muted); font-weight:bold; font-size:1.2rem;" onclick="window.closeTripOverlay()">&times;</span>
          </div>

          <div style="margin-bottom:20px;">
            ${stepContent}
          </div>

          <div style="display:flex; justify-content:space-between; align-items:center;">
            <div>
              ${tripStep > 1 ? `<button class="btn btn-secondary" style="padding: 0.45rem 1rem;" onclick="window.prevTripStep()">← Back</button>` : ''}
            </div>
            <div style="display:flex; gap:8px;">
              <button class="btn btn-secondary" style="padding: 0.45rem 1rem;" onclick="window.closeTripOverlay()">Cancel</button>
              ${renderOverlayNextButton()}
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function renderOverlayNextButton() {
    if (tripStep === 1) return '';

    if (selectedTripType === 'outbound' && tripStep === 4) {
      return `<button class="btn btn-primary" style="padding: 0.45rem 1rem;" onclick="window.confirmDispatchTrip()">Confirm &amp; Dispatch</button>`;
    }

    if (selectedTripType === 'transfer' && tripStep === 4) {
      return `<button class="btn btn-primary" id="trf-next-btn" style="padding: 0.45rem 1rem;" disabled onclick="window.nextTripStep()">Continue →</button>`;
    }

    if (selectedTripType === 'transfer' && tripStep === 5) {
      return `<button class="btn btn-primary" style="padding: 0.45rem 1rem;" onclick="window.confirmDispatchTrip()">Confirm &amp; Dispatch</button>`;
    }

    return `<button class="btn btn-primary" style="padding: 0.45rem 1rem;" onclick="window.nextTripStep()">Continue →</button>`;
  }

  window.evalTrfCheck = function (chk) {
    const nextBtn = document.getElementById('trf-next-btn');
    if (!nextBtn) return;

    var allChecked = true;
    document.querySelectorAll('.trf-chk').forEach(c => {
      if (c.parentElement.style.display !== 'none') {
        if (!c.checked) allChecked = false;
      }
    });

    nextBtn.disabled = !allChecked;
  };

})();
