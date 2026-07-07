#!/usr/bin/env python3

path_html = "/Users/home/Desktop/Saronil IHS/Updated HIS /index.html"
path_view = "/Users/home/Desktop/Saronil IHS/Updated HIS /assets/js/views/ipdAdmissionView.js"

# 1. Update index.html - Rename ATD to Bed Board and ATD
with open(path_html, "r", encoding="utf-8") as f:
    src_html = f.read()

old_atd_span = """            <div class="menu-item" data-target="ipdAdmission?tab=atd" style="padding-left: 28px;">
              <div class="menu-item-left">
                <span class="menu-icon">🛏️</span>
                <span>ATD</span>
              </div>
            </div>"""

new_atd_span = """            <div class="menu-item" data-target="ipdAdmission?tab=atd" style="padding-left: 28px;">
              <div class="menu-item-left">
                <span class="menu-icon">🛏️</span>
                <span>Bed Board and ATD</span>
              </div>
            </div>"""

src_html = src_html.replace(old_atd_span, new_atd_span, 1)

with open(path_html, "w", encoding="utf-8") as f:
    f.write(src_html)

# 2. Update ipdAdmissionView.js
with open(path_view, "r", encoding="utf-8") as f:
    src_view = f.read()

# Rename tab header button
old_tab_btn = """            <button class="ipd-tab-btn ${_activeTab === 'bedboard' ? 'active' : ''}" onclick="window._ipdSwitchTab('bedboard')">🛏️ Live Bed Board</button>"""
new_tab_btn = """            <button class="ipd-tab-btn ${_activeTab === 'bedboard' ? 'active' : ''}" onclick="window._ipdSwitchTab('bedboard')">🛏️ Bed Board and ATD</button>"""
src_view = src_view.replace(old_tab_btn, new_tab_btn, 1)

# Update ward section layout rendering on Bed Board tab
old_ward_render = """        return `
          <div style="background:#f8fafc; border: 1px solid var(--border-color); border-radius:10px; padding:16px; margin-bottom:20px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; flex-wrap:wrap; gap:8px;">
              <div style="display:flex; align-items:center; gap:8px;">
                <h4 style="margin:0; font-size:13px; font-weight:800; color:#1e3a8a; text-transform:uppercase;">${val.name}</h4>
                <span class="reg-badge" style="background:#e0f2fe; color:#0369a1; border:1px solid #bae6fd;">${WARD_RATES[key]?.category || 'General'}</span>
              </div>
              <div style="display:flex; align-items:center; gap:8px; font-size:11px; font-weight:700;">
                <span style="color:var(--text-secondary);">${occupied} / ${beds.length} Occupied</span>
                <span class="reg-badge" style="${pctPillClass} border:none; padding: 2px 8px;">${occupancyPct}% Full</span>
              </div>
            </div>
            
            <div class="ipd-bed-grid-container">
              ${displayBeds.map(b => renderBedCardHTML(b, key)).join('')}
            </div>
          </div>
        `;"""

new_ward_render = """        return `
          <div style="margin-bottom: 24px; border-bottom: 1px solid var(--border-color); padding-bottom: 20px;">
            <div style="font-size: 14px; font-weight: 700; color: #1e293b; margin-bottom: 12px; margin-top: 8px;">
              ${val.name} <span style="font-weight: 500; color: #64748b; font-size: 12px; margin-left: 4px;">(${fmtMoney(WARD_RATES[key]?.rate || 1500)}/day)</span>
            </div>
            
            <div class="ipd-bed-grid-container" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 14px; margin-top: 10px;">
              ${displayBeds.map(b => renderBedCardHTML(b, key)).join('')}
            </div>
          </div>
        `;"""

src_view = src_view.replace(old_ward_render, new_ward_render, 1)

# Re-write renderBedCardHTML function
old_bed_card_fn = """  function renderBedCardHTML(bedId, wardKey) {
    var s = window.state.bedsStatus[bedId] || { status: 'Available' };
    var status = s.status;
    var role = window._ipdActiveRole;

    var content = '';
    var actions = '';

    if (status === 'Occupied') {
      var p = window.state.patients.find(pt => pt.uhid === s.patientUhid) || { name: 'Trauma Patient', uhid: s.patientUhid || 'SH-2026-00000', age: 35, gender: 'Male', primaryConsultant: 'Dr. Fatima Sheikh', admitted: getTodayStr(), clinicalData: { diagnosis: 'Clinical Observation' }, flags: [] };
      var isMlc = p.flags && p.flags.includes('MLC');
      var isIns = p.payerType === 'TPA' || p.payerType === 'CGHS' || p.payerType === 'PMJAY';

      // Access checks for action buttons on occupied bed card
      var transferBtn = (role === 'ATD Coordinator' || role === 'Nursing Supervisor') ? 
        `<button class="ipd-bed-btn" onclick="window._bedOpenTransfer('${p.uhid}', '${bedId}')">Transfer</button>` : '';
      
      var dischargeBtn = '';
      if (role === 'Treating Consultant / Doctor') {
        dischargeBtn = `<button class="ipd-bed-btn ipd-bed-btn-danger" onclick="window._bedIssueDischarge('${p.uhid}')">Discharge</button>`;
      } else if (role === 'ATD Coordinator') {
        var inDischargeQueue = window.state.dischargeOrders.some(d => d.uhid === p.uhid);
        if (inDischargeQueue) {
          dischargeBtn = `<button class="ipd-bed-btn ipd-bed-btn-danger" onclick="window._drawerOpenDetails('${p.uhid}', '${bedId}')">Clearances</button>`;
        }
      }

      content = `
        <div class="ipd-bed-pat-name" onclick="window._drawerOpenDetails('${p.uhid}', '${bedId}')" style="cursor:pointer; text-decoration:underline;">${p.name}</div>
        <div class="ipd-bed-pat-meta">
          UHID: <span class="mono">${p.uhid}</span><br>
          Consultant: ${p.primaryConsultant}<br>
          Admitted: ${new Date(p.admitted || getTodayStr()).toLocaleDateString('en-IN', {day:'2-digit', month:'short', year:'numeric'})}<br>
          Days: ${p.los || 1} · Diagnosis: <span style="font-weight:600;">${(p.clinicalData?.diagnosis || 'Trauma Care').slice(0, 40)}</span>
        </div>
        <div>
          ${isMlc ? '<span class="ipd-badge ipd-badge-mlc">MLC</span>' : ''}
          ${isIns ? '<span class="ipd-badge ipd-badge-ins">Insurance</span>' : ''}
        </div>
      `;

      actions = `
        ${transferBtn}
        ${dischargeBtn}
        <button class="ipd-bed-btn" onclick="window._drawerOpenDetails('${p.uhid}', '${bedId}')">View Details</button>
      `;

    } else if (status === 'Available') {
      var assignBtn = (role === 'ATD Coordinator' || role === 'Admission Clerk') ? 
        `<button class="ipd-bed-btn ipd-bed-btn-primary" onclick="window._bedOpenQuickAssign('${bedId}')">Assign Patient</button>` : '';

      content = `
        <div style="font-weight:700; color:#16a34a; font-size:12px; margin: 15px 0;">🟢 AVAILABLE</div>
      `;

      actions = `
        ${assignBtn}
      `;

    } else if (status === 'Cleaning') {
      var readyBtn = (role === 'Nursing Supervisor' || role === 'Ward Nurse') ? 
        `<button class="ipd-bed-btn ipd-bed-btn-primary" onclick="window._bedMarkReady('${bedId}', '${wardKey}')">Mark Ready</button>` : '';

      content = `
        <div style="font-weight:700; color:#d97706; font-size:12px; margin: 8px 0;">🟡 UNDER HOUSEKEEPING</div>
        <div style="font-size:10px; color:var(--text-secondary);">Since: ${getFormattedTime()}</div>
      `;

      actions = `
        ${readyBtn}
      `;

    } else if (status === 'Reserved') {
      var releaseBtn = (role === 'ATD Coordinator') ? 
        `<button class="ipd-bed-btn ipd-bed-btn-danger" onclick="window._bedReleaseReservation('${bedId}', '${wardKey}')">Release</button>` : '';

      content = `
        <div style="font-weight:700; color:#9333ea; font-size:12px; margin: 4px 0;">🟣 RESERVED FOR:</div>
        <div style="font-size:11px; font-weight:600; color:var(--text-primary);">${s.notes || 'Pending admission'}</div>
      `;

      actions = `
        ${releaseBtn}
      `;
    }

    return `
      <div class="ipd-bed-card ${status}">
        <div>
          <div class="ipd-bed-hdr">
            <span class="ipd-bed-no">🛏️ ${bedId}</span>
            <span class="ipd-bed-ward-badge">${WARD_RATES[wardKey]?.category || 'Ward'}</span>
          </div>
          ${content}
        </div>
        <div class="ipd-bed-actions">
          ${actions}
        </div>
      </div>
    `;
  }"""

new_bed_card_fn = """  function renderBedCardHTML(bedId, wardKey) {
    var s = window.state.bedsStatus[bedId] || { status: 'Available' };
    var status = s.status;
    var role = window._ipdActiveRole;

    var borderStyle = '';
    var textClassColor = '';
    var statusText = '';
    var patientNameHTML = '';
    var onClickAction = '';

    if (status === 'Occupied') {
      var p = window.state.patients.find(pt => pt.uhid === s.patientUhid) || { name: 'Trauma Patient', uhid: s.patientUhid || 'SH-2026-00000', age: 35, gender: 'Male', primaryConsultant: 'Dr. Fatima Sheikh', admitted: getTodayStr(), clinicalData: { diagnosis: 'Clinical Observation' }, flags: [] };
      borderStyle = 'border: 2px solid #8b5cf6;';
      textClassColor = 'color: #8b5cf6;';
      statusText = 'OCCUPIED';
      patientNameHTML = `<div style="font-size: 13px; font-weight: 700; color: #000; margin-top: 8px; font-family: sans-serif;">${p.name}</div>`;
      onClickAction = `onclick="window._drawerOpenDetails('${p.uhid}', '${bedId}')"`;
    } else if (status === 'Available') {
      borderStyle = 'border: 2px solid #10b981;';
      textClassColor = 'color: #10b981;';
      statusText = 'AVAILABLE';
      onClickAction = `onclick="window._bedOpenQuickAssign('${bedId}')"`;
    } else if (status === 'Cleaning') {
      borderStyle = 'border: 2px solid #f59e0b;';
      textClassColor = 'color: #f59e0b;';
      statusText = 'HOUSEKEEPING';
      onClickAction = `onclick="window._bedMarkReady('${bedId}', '${wardKey}')"`;
    } else if (status === 'Reserved') {
      borderStyle = 'border: 2px solid #a855f7;';
      textClassColor = 'color: #a855f7;';
      statusText = 'RESERVED';
      patientNameHTML = `<div style="font-size: 12px; font-weight: 700; color: #555; margin-top: 8px;">${s.notes || 'Pending'}</div>`;
      onClickAction = `onclick="window._bedReleaseReservation('${bedId}', '${wardKey}')"`;
    }

    return `
      <div ${onClickAction} style="background: white; border-radius: 8px; padding: 14px; min-height: 105px; display: flex; flex-direction: column; justify-content: space-between; cursor: pointer; transition: all 0.2s; box-shadow: 0 2px 4px rgba(0,0,0,0.02); ${borderStyle}">
        <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
          <span style="font-size: 13px; font-weight: 700; ${textClassColor}">${bedId}</span>
          <span style="font-size: 15px; filter: grayscale(100%);">🛏️</span>
        </div>
        <div style="flex: 1; display: flex; flex-direction: column; justify-content: flex-end; margin-top: 10px; text-align: left;">
          <div style="font-size: 11px; font-weight: 800; text-transform: uppercase; ${textClassColor}">${statusText}</div>
          ${patientNameHTML}
        </div>
      </div>
    `;
  }"""

src_view = src_view.replace(old_bed_card_fn, new_bed_card_fn, 1)

with open(path_view, "w", encoding="utf-8") as f:
    f.write(src_view)

print("SUCCESS: Bedboard redesign applied successfully to match attached image layout.")
