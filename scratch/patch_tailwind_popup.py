#!/usr/bin/env python3

path = "/Users/home/Desktop/Saronil IHS/Updated HIS /assets/js/views/ipdAdmissionView.js"

with open(path, "r", encoding="utf-8") as f:
    src = f.read()

# Locate renderRightDrawerHTML body and replace it
# Starts at: function renderRightDrawerHTML() {
# Ends at: window._drawerOpenDetails = function

old_render_fn = """  function renderRightDrawerHTML() {
    if (!_drawerOpen || !_drawerPatientUhid) {
      return '<div style="padding:20px; color:var(--text-muted);">Awaiting selection...</div>';
    }

    var p = window.state.patients.find(pt => pt.uhid === _drawerPatientUhid);
    if (!p) return '<div style="padding:20px; color:var(--text-muted);">Patient profile not found.</div>';

    var role = window._ipdActiveRole;
    var dis = window.state.dischargeOrders.find(d => d.uhid === p.uhid);

    var clinicalBlockHTML = '';
    // Clinical section visible only to Clinical Roles
    if (role === 'Treating Consultant / Doctor' || role === 'Ward Nurse' || role === 'Nursing Supervisor' || role === 'ATD Coordinator' || role === 'Administrator / Medical Superintendent') {
      clinicalBlockHTML = `
        <div class="ipd-drawer-sect-title">Clinical status</div>
        <div class="ipd-drawer-row">
          <span class="ipd-drawer-label">Last vitals BP/Pulse:</span>
          <span class="ipd-drawer-val">${p.vitals?.bp || '120/80'} / ${p.vitals?.hr || 72}bpm</span>
        </div>
        <div class="ipd-drawer-row">
          <span class="ipd-drawer-label">SpO2 / Temperature:</span>
          <span class="ipd-drawer-val">${p.vitals?.spo2 || 98}% / ${p.vitals?.temp || 98.4}°F</span>
        </div>
        <div class="ipd-drawer-row">
          <span class="ipd-drawer-label">Diet / Mobility:</span>
          <span class="ipd-drawer-val">Soft / Assisted walk</span>
        </div>
        <div class="ipd-drawer-row">
          <span class="ipd-drawer-label">Isolation Protocol:</span>
          <span class="ipd-drawer-val" style="color:${p.flags?.includes('Isolation') ? '#ef4444' : 'inherit'}; font-weight:700;">
            ${p.flags?.includes('Isolation') ? 'Yes (Airborne)' : 'No'}
          </span>
        </div>
        <div class="ipd-drawer-row">
          <span class="ipd-drawer-label">Pending Lab/Rx Orders:</span>
          <span class="ipd-drawer-val" style="color:${p.prescriptions?.length > 0 ? '#ef4444' : 'inherit'};">
            ${p.prescriptions?.length || 0} active
          </span>
        </div>
      `;
    }

    var dischargeClearanceBlockHTML = '';
    if (dis) {
      dischargeClearanceBlockHTML = `
        <div class="ipd-drawer-sect-title">Discharge clear status</div>
        <div style="font-size:11px; display:grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 12px;">
          <div style="padding:6px; border:1px solid #cbd5e1; border-radius:6px; display:flex; justify-content:space-between; align-items:center;">
            <span>Nursing:</span> 
            <strong>${dis.clearances.nursing ? '🟢' : '🔴'}</strong>
          </div>
          <div style="padding:6px; border:1px solid #cbd5e1; border-radius:6px; display:flex; justify-content:space-between; align-items:center;">
            <span>Billing:</span> 
            <strong>${dis.clearances.billing ? '🟢' : '🔴'}</strong>
          </div>
          <div style="padding:6px; border:1px solid #cbd5e1; border-radius:6px; display:flex; justify-content:space-between; align-items:center;">
            <span>Pharmacy:</span> 
            <strong>${dis.clearances.pharmacy ? '🟢' : '🔴'}</strong>
          </div>
          <div style="padding:6px; border:1px solid #cbd5e1; border-radius:6px; display:flex; justify-content:space-between; align-items:center;">
            <span>TPA/Ins:</span> 
            <strong>${dis.clearances.tpa ? '🟢' : '🔴'}</strong>
          </div>
        </div>
      `;
    }

    // Role dynamic action button panel bottom
    var actionButtonsHTML = '';
    
    // 1. View Full Record (All roles)
    actionButtonsHTML += `<button class="btn btn-secondary" style="width:100%; margin-bottom:6px;" onclick="window._drawerNavigatePatient360('${p.uhid}')">📋 View Patient 360° Record</button>`;

    // 2. Transfer actions
    if (role === 'ATD Coordinator' || role === 'Nursing Supervisor') {
      actionButtonsHTML += `<button class="btn btn-primary" style="width:100%; margin-bottom:6px; background:#3b82f6;" onclick="window._bedOpenTransfer('${p.uhid}', '${_drawerBedId}')">🔀 Transfer Patient</button>`;
    }

    // 3. Discharge order (Doctor)
    if (role === 'Treating Consultant / Doctor' && !dis) {
      actionButtonsHTML += `<button class="btn btn-primary" style="width:100%; margin-bottom:6px; background:#ef4444;" onclick="window._bedIssueDischarge('${p.uhid}')">Issue Discharge Order</button>`;
    }

    // 4. Complete discharge (ATD Coordinator)
    if (role === 'ATD Coordinator' && dis) {
      var allCleared = dis.clearances.nursing && dis.clearances.billing && dis.clearances.pharmacy && dis.clearances.tpa;
      actionButtonsHTML += `
        <button class="btn btn-primary" style="width:100%; margin-bottom:6px; background:#10b981; opacity:${allCleared ? 1 : 0.65};" ${allCleared ? '' : 'disabled'} onclick="window._dashboardFinalizeDischarge('${p.uhid}', '${_drawerBedId}')">
          Complete Discharge
        </button>
      `;
    }

    // 5. Add nursing note (Nurse/Supervisor)
    if (role === 'Ward Nurse' || role === 'Nursing Supervisor') {
      actionButtonsHTML += `<button class="btn btn-secondary" style="width:100%; margin-bottom:6px;" onclick="window._drawerAddNursingNote('${p.uhid}')">✍️ Add Nursing Note</button>`;
    }

    var bedId = p.bed || _drawerBedId;
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

    return `
      <div class="ipd-drawer-hdr">
        <div>
          <h3 style="margin:0; font-size:16px; font-weight:800;">🛏️ ${formattedBedId}</h3>
          <p style="margin:4px 0 0 0; font-size:12px; opacity:0.9;">${p.name}</p>
        </div>
        <button class="ipd-drawer-close" onclick="window._drawerClose()">✕</button>
      </div>
      <div class="ipd-drawer-body">
        
        <div class="ipd-drawer-sect-title">Patient Profile summary</div>
        <div class="ipd-drawer-row"><span class="ipd-drawer-label">Age / Gender:</span><span class="ipd-drawer-val">${p.age}y / ${p.gender}</span></div>
        <div class="ipd-drawer-row"><span class="ipd-drawer-label">UHID:</span><span class="ipd-drawer-val mono">${p.uhid}</span></div>
        <div class="ipd-drawer-row"><span class="ipd-drawer-label">Admitted date:</span><span class="ipd-drawer-val">${isNaN(new Date(p.admitted).getTime()) ? '24-Jun' : new Date(p.admitted).toLocaleDateString('en-IN', {day:'2-digit', month:'short'})}</span></div>
        <div class="ipd-drawer-row"><span class="ipd-drawer-label">Days in hospital:</span><span class="ipd-drawer-val">${p.los || 1} Days</span></div>
        <div class="ipd-drawer-row"><span class="ipd-drawer-label">Treating consultant:</span><span class="ipd-drawer-val">${p.primaryConsultant}</span></div>
        <div class="ipd-drawer-row"><span class="ipd-drawer-label">Diagnosis:</span><span class="ipd-drawer-val">${p.clinicalData?.diagnosis || 'Inpatient Observation'}</span></div>

        <div class="ipd-drawer-sect-title">Admission details</div>
        <div class="ipd-drawer-row"><span class="ipd-drawer-label">Type:</span><span class="ipd-drawer-val">${p.type || 'IPD'}</span></div>
        <div class="ipd-drawer-row"><span class="ipd-drawer-label">Payer Type:</span><span class="ipd-drawer-val">${p.payerType || 'Self (Cash/Card)'}</span></div>
        <div class="ipd-drawer-row"><span class="ipd-drawer-label">Advance Paid:</span><span class="ipd-drawer-val">${fmtMoney(p.billingAccount?.advancePaid || 5000)}</span></div>

        ${clinicalBlockHTML}
        
        ${dischargeClearanceBlockHTML}

        <div style="margin-top:auto; padding-top:16px; border-top: 1px solid var(--border-color);">
          ${actionButtonsHTML}
        </div>
      </div>
    `;
  }"""

new_render_fn = """  function renderRightDrawerHTML() {
    if (!_drawerOpen || !_drawerPatientUhid) {
      return '<div class="p-6 text-center text-slate-400">Awaiting selection...</div>';
    }

    var p = window.state.patients.find(pt => pt.uhid === _drawerPatientUhid);
    if (!p) return '<div class="p-6 text-center text-slate-400">Patient profile not found.</div>';

    var role = window._ipdActiveRole;
    var dis = window.state.dischargeOrders.find(d => d.uhid === p.uhid);

    var clinicalBlockHTML = '';
    // Clinical section visible only to Clinical Roles
    if (role === 'Treating Consultant / Doctor' || role === 'Ward Nurse' || role === 'Nursing Supervisor' || role === 'ATD Coordinator' || role === 'Administrator / Medical Superintendent') {
      clinicalBlockHTML = `
        <div class="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider border-b border-slate-100 pb-1 mt-4 first:mt-0">Clinical status</div>
        <div class="flex justify-between items-center text-sm py-1">
          <span class="text-slate-500 font-medium">Last vitals BP/Pulse:</span>
          <span class="text-slate-800 font-semibold">${p.vitals?.bp || '120/80'} / ${p.vitals?.hr || 72}bpm</span>
        </div>
        <div class="flex justify-between items-center text-sm py-1">
          <span class="text-slate-500 font-medium">SpO2 / Temperature:</span>
          <span class="text-slate-800 font-semibold">${p.vitals?.spo2 || 98}% / ${p.vitals?.temp || 98.4}°F</span>
        </div>
        <div class="flex justify-between items-center text-sm py-1">
          <span class="text-slate-500 font-medium">Diet / Mobility:</span>
          <span class="text-slate-800 font-semibold">Soft / Assisted walk</span>
        </div>
        <div class="flex justify-between items-center text-sm py-1">
          <span class="text-slate-500 font-medium">Isolation Protocol:</span>
          <span class="font-bold text-right ${p.flags?.includes('Isolation') ? 'text-red-500' : 'text-slate-800'}">
            ${p.flags?.includes('Isolation') ? 'Yes (Airborne)' : 'No'}
          </span>
        </div>
        <div class="flex justify-between items-center text-sm py-1">
          <span class="text-slate-500 font-medium">Pending Lab/Rx Orders:</span>
          <span class="font-semibold text-right ${p.prescriptions?.length > 0 ? 'text-red-500' : 'text-slate-800'}">
            ${p.prescriptions?.length || 0} active
          </span>
        </div>
      `;
    }

    var dischargeClearanceBlockHTML = '';
    if (dis) {
      dischargeClearanceBlockHTML = `
        <div class="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider border-b border-slate-100 pb-1 mt-4 first:mt-0">Discharge clear status</div>
        <div class="grid grid-cols-2 gap-2 mt-2">
          <div class="p-2 border border-slate-100 rounded-lg flex justify-between items-center text-xs bg-slate-50/50">
            <span class="text-slate-500 font-medium">Nursing:</span> 
            <span class="font-bold">${dis.clearances.nursing ? '🟢' : '🔴'}</span>
          </div>
          <div class="p-2 border border-slate-100 rounded-lg flex justify-between items-center text-xs bg-slate-50/50">
            <span class="text-slate-500 font-medium">Billing:</span> 
            <span class="font-bold">${dis.clearances.billing ? '🟢' : '🔴'}</span>
          </div>
          <div class="p-2 border border-slate-100 rounded-lg flex justify-between items-center text-xs bg-slate-50/50">
            <span class="text-slate-500 font-medium">Pharmacy:</span> 
            <span class="font-bold">${dis.clearances.pharmacy ? '🟢' : '🔴'}</span>
          </div>
          <div class="p-2 border border-slate-100 rounded-lg flex justify-between items-center text-xs bg-slate-50/50">
            <span class="text-slate-500 font-medium">TPA/Ins:</span> 
            <span class="font-bold">${dis.clearances.tpa ? '🟢' : '🔴'}</span>
          </div>
        </div>
      `;
    }

    // Role dynamic action button panel bottom
    var actionButtonsHTML = '';
    
    // 1. View Full Record (All roles)
    actionButtonsHTML += `<button class="w-full py-2.5 px-4 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 active:bg-slate-100 transition-colors duration-150 mb-2 flex items-center justify-center gap-2 cursor-pointer" onclick="window._drawerNavigatePatient360('${p.uhid}')">📋 View Patient 360° Record</button>`;

    // 2. Transfer actions
    if (role === 'ATD Coordinator' || role === 'Nursing Supervisor') {
      actionButtonsHTML += `<button class="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition-all duration-150 mb-2 flex items-center justify-center gap-2 cursor-pointer" onclick="window._bedOpenTransfer('${p.uhid}', '${_drawerBedId}')">🔀 Transfer Patient</button>`;
    }

    // 3. Discharge order (Doctor)
    if (role === 'Treating Consultant / Doctor' && !dis) {
      actionButtonsHTML += `<button class="w-full py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition-all duration-150 mb-2 flex items-center justify-center gap-2 cursor-pointer" onclick="window._bedIssueDischarge('${p.uhid}')">Issue Discharge Order</button>`;
    }

    // 4. Complete discharge (ATD Coordinator)
    if (role === 'ATD Coordinator' && dis) {
      var allCleared = dis.clearances.nursing && dis.clearances.billing && dis.clearances.pharmacy && dis.clearances.tpa;
      actionButtonsHTML += `
        <button class="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition-all duration-150 mb-2 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed" ${allCleared ? '' : 'disabled'} onclick="window._dashboardFinalizeDischarge('${p.uhid}', '${_drawerBedId}')">
          Complete Discharge
        </button>
      `;
    }

    // 5. Add nursing note (Nurse/Supervisor)
    if (role === 'Ward Nurse' || role === 'Nursing Supervisor') {
      actionButtonsHTML += `<button class="w-full py-2.5 px-4 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 active:bg-slate-100 transition-colors duration-150 mb-2 flex items-center justify-center gap-2 cursor-pointer" onclick="window._drawerAddNursingNote('${p.uhid}')">✍️ Add Nursing Note</button>`;
    }

    var bedId = p.bed || _drawerBedId;
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

    return `
      <div class="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4 flex justify-between items-center">
        <div>
          <h3 class="margin-0 text-base font-extrabold flex items-center gap-1.5">🛏️ ${formattedBedId}</h3>
          <p class="margin-0 text-xs text-blue-100 mt-0.5 font-medium">${p.name}</p>
        </div>
        <button class="text-white hover:text-blue-100 text-xl font-bold cursor-pointer transition-colors duration-150" onclick="window._drawerClose()">✕</button>
      </div>
      <div class="p-6 overflow-y-auto flex-1 flex flex-col gap-4 box-sizing-border-box">
        
        <div class="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider border-b border-slate-100 pb-1 mt-0">Patient Profile summary</div>
        <div class="flex justify-between items-center text-sm py-1"><span class="text-slate-500 font-medium">Age / Gender:</span><span class="text-slate-800 font-semibold">${p.age}y / ${p.gender}</span></div>
        <div class="flex justify-between items-center text-sm py-1"><span class="text-slate-500 font-medium">UHID:</span><span class="text-slate-800 font-semibold font-mono">${p.uhid}</span></div>
        <div class="flex justify-between items-center text-sm py-1"><span class="text-slate-500 font-medium">Admitted date:</span><span class="text-slate-800 font-semibold">${isNaN(new Date(p.admitted).getTime()) ? '24-Jun' : new Date(p.admitted).toLocaleDateString('en-IN', {day:'2-digit', month:'short'})}</span></div>
        <div class="flex justify-between items-center text-sm py-1"><span class="text-slate-500 font-medium">Days in hospital:</span><span class="text-slate-800 font-semibold">${p.los || 1} Days</span></div>
        <div class="flex justify-between items-center text-sm py-1"><span class="text-slate-500 font-medium">Treating consultant:</span><span class="text-slate-800 font-semibold">${p.primaryConsultant}</span></div>
        <div class="flex justify-between items-center text-sm py-1"><span class="text-slate-500 font-medium">Diagnosis:</span><span class="text-slate-800 font-semibold">${p.clinicalData?.diagnosis || 'Inpatient Observation'}</span></div>

        <div class="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider border-b border-slate-100 pb-1 mt-4">Admission details</div>
        <div class="flex justify-between items-center text-sm py-1"><span class="text-slate-500 font-medium">Type:</span><span class="text-slate-800 font-semibold">${p.type || 'IPD'}</span></div>
        <div class="flex justify-between items-center text-sm py-1"><span class="text-slate-500 font-medium">Payer Type:</span><span class="text-slate-800 font-semibold">${p.payerType || 'Self (Cash/Card)'}</span></div>
        <div class="flex justify-between items-center text-sm py-1"><span class="text-slate-500 font-medium">Advance Paid:</span><span class="text-slate-800 font-semibold">${fmtMoney(p.billingAccount?.advancePaid || 5000)}</span></div>

        ${clinicalBlockHTML}
        
        ${dischargeClearanceBlockHTML}

        <div class="mt-4 pt-4 border-t border-slate-100">
          ${actionButtonsHTML}
        </div>
      </div>
    `;
  }"""

src = src.replace(old_render_fn, new_render_fn, 1)

with open(path, "w", encoding="utf-8") as f:
    f.write(src)

print("SUCCESS: renderRightDrawerHTML fully migrated to Tailwind CSS classes.")
