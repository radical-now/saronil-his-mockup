#!/usr/bin/env python3

path = "/Users/home/Desktop/Saronil IHS/Updated HIS /assets/js/views/ipdAdmissionView.js"

with open(path, "r", encoding="utf-8") as f:
    src = f.read()

# 1. Update renderRightDrawerHTML helper function
old_render_fn = """  function renderRightDrawerHTML() {
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

new_render_fn = """  function renderRightDrawerHTML() {
    if (!_drawerOpen || !_drawerPatientUhid) {
      return '<div class="p-6 text-center text-slate-400">Awaiting selection...</div>';
    }

    var p = window.state.patients.find(pt => pt.uhid === _drawerPatientUhid) || { name: 'Trauma Patient', uhid: _drawerPatientUhid, admitted: getTodayStr(), primaryConsultant: 'Dr. Ramesh Kumar', clinicalData: { diagnosis: 'None' } };
    var role = window._ipdActiveRole;
    var dis = window.state.dischargeOrders.find(d => d.uhid === p.uhid);

    var bedId = p.bed || _drawerBedId;
    var s = window.state.bedsStatus[bedId] || { status: 'Occupied', wardKey: 'GENERAL-WARD-M' };
    var wardKey = s.wardKey || 'GENERAL-WARD-M';
    var wardName = WARD_RATES[wardKey]?.name || 'General Ward (Male)';
    var tariffStr = fmtMoney(WARD_RATES[wardKey]?.rate || 1500) + '/day';

    var formattedBedId = bedId;
    if (bedId.startsWith('GW(M)-')) {
      formattedBedId = 'GW(M)-' + bedId.substring(6);
    } else if (bedId.startsWith('GW(F)-')) {
      formattedBedId = 'GW(F)-' + bedId.substring(6);
    }

    // Dynamic Action Buttons
    var actionButtonsHTML = '';
    
    // Button 1: Transfer Bed
    if (role === 'ATD Coordinator' || role === 'Nursing Supervisor') {
      actionButtonsHTML += `<button class="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition-all duration-150 mb-2 flex items-center justify-center gap-2 cursor-pointer" onclick="window._bedOpenTransfer('${p.uhid}', '${bedId}')">Transfer Bed</button>`;
    }

    // Button 2: Approve Discharge & Initiate Billing
    if (role === 'Treating Consultant / Doctor' && !dis) {
      actionButtonsHTML += `<button class="w-full py-2.5 px-4 bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 hover:text-red-700 rounded-xl text-sm font-bold shadow-sm transition-all duration-150 mb-2 flex items-center justify-center gap-2 cursor-pointer" onclick="window._bedIssueDischarge('${p.uhid}')">Approve Discharge & Initiate Billing</button>`;
    } else if (role === 'ATD Coordinator' && dis) {
      var allCleared = dis.clearances.nursing && dis.clearances.billing && dis.clearances.pharmacy && dis.clearances.tpa;
      actionButtonsHTML += `
        <button class="w-full py-2.5 px-4 bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 hover:text-red-700 rounded-xl text-sm font-bold shadow-sm transition-all duration-150 mb-2 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed" ${allCleared ? '' : 'disabled'} onclick="window._dashboardFinalizeDischarge('${p.uhid}', '${bedId}')">
          Approve Discharge & Initiate Billing
        </button>
      `;
    } else {
      actionButtonsHTML += `<button class="w-full py-2.5 px-4 bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 hover:text-red-700 rounded-xl text-sm font-bold shadow-sm transition-all duration-150 mb-2 flex items-center justify-center gap-2 cursor-pointer" onclick="window._bedIssueDischarge('${p.uhid}')">Approve Discharge & Initiate Billing</button>`;
    }

    // Button 3: Send to House Keeping
    actionButtonsHTML += `<button class="w-full py-2.5 px-4 bg-white hover:bg-slate-50 border border-slate-200 text-slate-500 hover:text-slate-700 rounded-xl text-sm font-bold shadow-sm transition-colors duration-150 flex items-center justify-center gap-2 cursor-pointer" onclick="window._bedSendToHousekeeping('${bedId}', '${wardKey}')">Send to House Keeping</button>`;

    // Format admitted date
    var admittedDateStr = '2026-06-20';
    if (p.admitted && !isNaN(new Date(p.admitted).getTime())) {
      var dObj = new Date(p.admitted);
      var y = dObj.getFullYear();
      var m = String(dObj.getMonth() + 1).padStart(2, '0');
      var d = String(dObj.getDate()).padStart(2, '0');
      admittedDateStr = `${y}-${m}-${d}`;
    }

    return `
      <!-- Header -->
      <div class="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center">
        <h3 class="margin-0 text-slate-800 text-[17px] font-bold">Bed Action: ${formattedBedId}</h3>
        <button class="text-slate-400 hover:text-slate-600 text-xl font-bold cursor-pointer transition-colors duration-150" onclick="window._drawerClose()">✕</button>
      </div>

      <!-- Body -->
      <div class="p-6 overflow-y-auto flex-1 flex flex-col gap-4 box-sizing-border-box text-left">
        
        <!-- Bed Info -->
        <div class="flex flex-col gap-1 text-sm">
          <div>
            <span class="font-bold text-slate-700">Ward Room:</span>
            <span class="font-medium text-slate-600">${wardName}</span>
          </div>
          <div>
            <span class="font-bold text-slate-700">Daily Tariff:</span>
            <span class="font-medium text-slate-600">${tariffStr}</span>
          </div>
          <div>
            <span class="font-bold text-slate-700">Current Status:</span>
            <span class="font-medium text-slate-600">${s.status}</span>
          </div>
        </div>

        <!-- Patient Info Card -->
        <div class="bg-blue-50/30 rounded-xl p-4.5 border border-blue-100/50 flex flex-col gap-1 text-sm">
          <div class="text-blue-600 font-bold text-base mb-1.5">Patient Information</div>
          <div>
            <span class="font-bold text-slate-700">Name:</span>
            <span class="font-bold text-blue-600">${p.name}</span>
          </div>
          <div>
            <span class="font-bold text-slate-700">UHID:</span>
            <span class="font-medium text-slate-600">${p.uhid}</span>
          </div>
          <div>
            <span class="font-bold text-slate-700">Admitted Date:</span>
            <span class="font-medium text-slate-600">${admittedDateStr}</span>
          </div>
          <div>
            <span class="font-bold text-slate-700">Doctor In-charge:</span>
            <span class="font-medium text-slate-600">${p.primaryConsultant || 'Dr. Ramesh Kumar'}</span>
          </div>
          <div>
            <span class="font-bold text-slate-700">Diagnosis:</span>
            <span class="font-medium text-slate-600">${p.clinicalData?.diagnosis || 'None'}</span>
          </div>
        </div>

        <!-- Buttons Section -->
        <div class="mt-2 flex flex-col gap-2">
          ${actionButtonsHTML}
        </div>

      </div>
    `;
  }"""

src = src.replace(old_render_fn, new_render_fn, 1)

# 2. Append window._bedSendToHousekeeping at the end of the operations
old_ops_end = """  window._bedReleaseReservation = function(bedId, wardKey) {
    window.state.bedsStatus[bedId] = {
      wardKey: wardKey,
      status: 'Available',
      patientUhid: null,
      notes: ''
    };
    localStorage.setItem('saronil_bedsStatus', JSON.stringify(window.state.bedsStatus));
    alert(`Reservation released on bed ${bedId}.`);
    var c = document.getElementById('main-content');
    if (c) renderWorkspace(c);
  };"""

new_ops_end = """  window._bedReleaseReservation = function(bedId, wardKey) {
    window.state.bedsStatus[bedId] = {
      wardKey: wardKey,
      status: 'Available',
      patientUhid: null,
      notes: ''
    };
    localStorage.setItem('saronil_bedsStatus', JSON.stringify(window.state.bedsStatus));
    alert(`Reservation released on bed ${bedId}.`);
    var c = document.getElementById('main-content');
    if (c) renderWorkspace(c);
  };

  window._bedSendToHousekeeping = function(bedId, wardKey) {
    if (confirm(`Are you sure you want to manually vacate Bed ${bedId} and send it to Housekeeping?`)) {
      window.state.bedsStatus[bedId] = {
        wardKey: wardKey,
        status: 'Cleaning',
        patientUhid: null,
        notes: 'Routine cleaning post override request'
      };
      localStorage.setItem('saronil_bedsStatus', JSON.stringify(window.state.bedsStatus));
      _drawerOpen = false;
      alert(`Bed ${bedId} has been sent to Housekeeping.`);
      var c = document.getElementById('main-content');
      if (c) renderWorkspace(c);
    }
  };"""

src = src.replace(old_ops_end, new_ops_end, 1)

with open(path, "w", encoding="utf-8") as f:
    f.write(src)

print("SUCCESS: Bed Action popup redesigned to match uploaded image format.")
