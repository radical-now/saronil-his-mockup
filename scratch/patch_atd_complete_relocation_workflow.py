#!/usr/bin/env python3

path = "/Users/home/Desktop/Saronil IHS/Updated HIS /assets/js/views/ipdAdmissionView.js"

with open(path, "r", encoding="utf-8") as f:
    src = f.read()

# 1. Update State Variable Declarations at the top
old_state_vars = """  var _transferToWard = 'GENERAL-WARD-M';
  var _transferToBed = '';
  var _transferReviewMode = false;
  var _transferReason = 'Clinical deterioration';"""

new_state_vars = """  var _transferToWard = 'GENERAL-WARD-M';
  var _transferToRoom = 'Room 401 (Male)';
  var _transferToBed = '';
  var _transferReviewMode = false;
  var _transferReason = 'Clinical deterioration';
  var _transferPatientCondition = 'Stable';
  var _transferDateTime = '';"""

src = src.replace(old_state_vars, new_state_vars, 1)

# 2. Insert helper functions for Ward, Room and Bed mapping
helper_functions = """  // Helper functions for Dynamic Ward/Room/Bed mapping
  function getRoomsForWard(wardKey) {
    if (wardKey === 'GENERAL-WARD-M') {
      return ['Room 401 (Male)', 'Room 402 (Male)'];
    } else if (wardKey === 'GENERAL-WARD-F') {
      return ['Room 403 (Female)', 'Room 404 (Female)'];
    } else if (wardKey === 'SEMI-PRIVATE') {
      return ['Room 301', 'Room 302'];
    } else if (wardKey === 'PRIVATE') {
      return ['Room 201', 'Room 202', 'Room 203'];
    } else if (wardKey === 'DELUXE') {
      return ['Suite 501', 'Suite 502'];
    } else if (wardKey === 'CCU') {
      return ['CCU Room A', 'CCU Room B'];
    } else if (wardKey === 'ICCU') {
      return ['ICCU Room A'];
    } else if (wardKey === 'EMERGENCY') {
      return ['ER Bay 1', 'ER Bay 2'];
    } else if (wardKey === 'DAYCARE') {
      return ['Daycare Ward A', 'Daycare Ward B'];
    }
    return ['General Room'];
  }

  function getBedsForRoom(wardKey, roomName) {
    var beds = window.state.wards[wardKey]?.beds || [];
    if (!roomName) return beds;
    
    // Split beds roughly between the room lists
    if (roomName.includes('Room 401') || roomName.includes('Room 403') || roomName.includes('Room 301') || roomName.includes('Room 201') || roomName.includes('Suite 501') || roomName.includes('CCU Room A') || roomName.includes('ER Bay 1') || roomName.includes('Daycare Ward A')) {
      return beds.slice(0, Math.ceil(beds.length / 2));
    } else {
      return beds.slice(Math.ceil(beds.length / 2));
    }
  }

  window.showToastNotification = function(msg) {
    var toast = document.createElement('div');
    toast.style.position = 'fixed';
    toast.style.top = '24px';
    toast.style.left = '50%';
    toast.style.transform = 'translateX(-50%)';
    toast.style.background = '#1e293b';
    toast.style.color = '#ffffff';
    toast.style.padding = '12px 24px';
    toast.style.borderRadius = '12px';
    toast.style.boxShadow = '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)';
    toast.style.zIndex = '9999';
    toast.style.fontSize = '12px';
    toast.style.fontWeight = '700';
    toast.style.display = 'flex';
    toast.style.alignItems = 'center';
    toast.style.gap = '8px';
    toast.innerHTML = `<span>✓</span> <span>${msg}</span>`;
    document.body.appendChild(toast);
    setTimeout(function() {
      toast.remove();
    }, 3000);
  };
"""

# Insert helpers right before renderDashboardScreen
src = src.replace("  /* ── SCREEN 1: IPD DASHBOARD ────────────────────────────────── */", helper_functions + "\n  /* ── SCREEN 1: IPD DASHBOARD ────────────────────────────────── */", 1)

# 3. Update window._bedOpenTransfer, window._transferSetWard, and window._transferConfirmSubmit
old_ops = """  window._bedOpenTransfer = function(uhid, bedId) {
    _transferModalOpen = true;
    _transferPatientUhid = uhid;
    _transferFromBed = bedId;
    _transferReviewMode = false;
    
    // Preset default target
    var pat = window.state.patients.find(pt => pt.uhid === uhid);
    _transferToWard = pat?.gender === 'Female' ? 'GENERAL-WARD-F' : 'GENERAL-WARD-M';

    var targetBeds = window.state.wards[_transferToWard]?.beds || [];
    _transferToBed = targetBeds.find(b => (window.state.bedsStatus[b] || {}).status === 'Available') || '';

    var c = document.getElementById('main-content');
    if (c) renderWorkspace(c);
  };

  window._transferModalClose = function() {
    _transferModalOpen = false;
    _transferReviewMode = false;
    var c = document.getElementById('main-content');
    if (c) renderWorkspace(c);
  };

  window.backToTransferEdit = function() {
    _transferReviewMode = false;
    var c = document.getElementById('main-content');
    if (c) renderWorkspace(c);
  };

  window.proceedToTransferReview = function() {
    var notesEl = document.getElementById('trf-notes');
    if (notesEl) _transferNotes = notesEl.value;

    var reasonEl = document.getElementById('trf-reason');
    if (reasonEl) _transferReason = reasonEl.value;

    var bedEl = document.getElementById('trf-target-bed');
    if (bedEl) _transferToBed = bedEl.value;

    if (!_transferToBed) {
      alert('Please select a destination bed before reviewing.');
      return;
    }

    _transferReviewMode = true;
    var c = document.getElementById('main-content');
    if (c) renderWorkspace(c);
  };

  window._transferSetWard = function(val) {
    _transferToWard = val;
    var targetBeds = window.state.wards[val]?.beds || [];
    _transferToBed = targetBeds.find(b => (window.state.bedsStatus[b] || {}).status === 'Available') || '';
    var c = document.getElementById('main-content');
    if (c) renderWorkspace(c);
  };

  window._transferSetBed = function(val) {
    _transferToBed = val;
  };

  window._transferSetType = function(val) {
    _transferType = val;
    var c = document.getElementById('main-content');
    if (c) renderWorkspace(c);
  };

  window._transferConfirmSubmit = function() {
    var pat = window.state.patients.find(pt => pt.uhid === _transferPatientUhid);
    if (!pat) return;

    var destBedId = _transferToBed;
    var destWardKey = _transferToWard;

    // Check availability
    var currentStatus = window.state.bedsStatus[destBedId]?.status;
    if (currentStatus !== 'Available' && currentStatus !== 'Vacant') {
      alert(`Transfer failed: Destination bed ${destBedId} is no longer available.`);
      return;
    }

    var currentWardKey = window.state.bedsStatus[_transferFromBed]?.wardKey || 'GENERAL-WARD-M';

    // 1. Vacate old bed
    window.state.bedsStatus[_transferFromBed] = {
      wardKey: currentWardKey,
      status: 'Cleaning',
      patientUhid: null,
      notes: `Awaiting cleaning after transfer of ${pat.name} to ${destBedId}`
    };

    // 2. Occupy new bed
    window.state.bedsStatus[destBedId] = {
      wardKey: destWardKey,
      status: 'Occupied',
      patientUhid: pat.uhid,
      notes: `Transferred from ${_transferFromBed}`
    };

    // 3. Update patient EMR
    pat.ward = WARD_RATES[destWardKey].name;
    pat.bed = destBedId;

    // 4. Log Bed Movement
    window.state.logBedMovement({
      patientId: pat.uhid,
      bedId: destBedId,
      wardKey: destWardKey,
      prevStatus: 'Available',
      newStatus: 'Occupied',
      action: 'Transferred',
      remarks: `Transferred from ${_transferFromBed}`
    });

    localStorage.setItem('saronil_patients', JSON.stringify(window.state.patients));
    localStorage.setItem('saronil_bedsStatus', JSON.stringify(window.state.bedsStatus));

    _transferModalOpen = false;
    _transferReviewMode = false;
    
    alert(`✓ Bed Transfer executed successfully!\\n${pat.name} moved to ${destBedId} in ${WARD_RATES[destWardKey].name}.`);

    var c = document.getElementById('main-content');
    if (c) renderWorkspace(c);
  };"""

new_ops = """  window._bedOpenTransfer = function(uhid, bedId) {
    _transferModalOpen = true;
    _transferPatientUhid = uhid;
    _transferFromBed = bedId;
    _transferReviewMode = false;
    _transferPatientCondition = 'Stable';
    
    var pat = window.state.patients.find(pt => pt.uhid === uhid);
    _transferToWard = pat?.gender === 'Female' ? 'GENERAL-WARD-F' : 'GENERAL-WARD-M';
    
    var rooms = getRoomsForWard(_transferToWard);
    _transferToRoom = rooms[0] || 'Room 401';
    
    var targetBeds = getBedsForRoom(_transferToWard, _transferToRoom);
    _transferToBed = targetBeds.find(b => (window.state.bedsStatus[b] || {}).status === 'Available') || '';

    // Prefill date time
    var now = new Date();
    var y = now.getFullYear();
    var m = String(now.getMonth() + 1).padStart(2, '0');
    var d = String(now.getDate()).padStart(2, '0');
    var hr = String(now.getHours()).padStart(2, '0');
    var mn = String(now.getMinutes()).padStart(2, '0');
    _transferDateTime = `${y}-${m}-${d}T${hr}:${mn}`;

    var c = document.getElementById('main-content');
    if (c) renderWorkspace(c);
  };

  window._transferModalClose = function() {
    _transferModalOpen = false;
    _transferReviewMode = false;
    var c = document.getElementById('main-content');
    if (c) renderWorkspace(c);
  };

  window.backToTransferEdit = function() {
    _transferReviewMode = false;
    var c = document.getElementById('main-content');
    if (c) renderWorkspace(c);
  };

  window.proceedToTransferReview = function() {
    var notesEl = document.getElementById('trf-notes');
    if (notesEl) _transferNotes = notesEl.value;

    var reasonEl = document.getElementById('trf-reason');
    if (reasonEl) _transferReason = reasonEl.value;

    var dateEl = document.getElementById('transfer-datetime');
    if (dateEl) _transferDateTime = dateEl.value;

    var condEl = document.getElementById('trf-condition');
    if (condEl) _transferPatientCondition = condEl.value;

    if (!_transferToBed) {
      alert('Please select an available destination bed before reviewing.');
      return;
    }

    _transferReviewMode = true;
    var c = document.getElementById('main-content');
    if (c) renderWorkspace(c);
  };

  window._transferSetWard = function(val) {
    _transferToWard = val;
    var rooms = getRoomsForWard(val);
    _transferToRoom = rooms[0] || 'Room 401';
    var targetBeds = getBedsForRoom(val, _transferToRoom);
    _transferToBed = targetBeds.find(b => (window.state.bedsStatus[b] || {}).status === 'Available') || '';
    
    var c = document.getElementById('main-content');
    if (c) renderWorkspace(c);
  };

  window._transferSetRoom = function(val) {
    _transferToRoom = val;
    var targetBeds = getBedsForRoom(_transferToWard, val);
    _transferToBed = targetBeds.find(b => (window.state.bedsStatus[b] || {}).status === 'Available') || '';
    
    var c = document.getElementById('main-content');
    if (c) renderWorkspace(c);
  };

  window._transferSetBed = function(val) {
    _transferToBed = val;
    var c = document.getElementById('main-content');
    if (c) renderWorkspace(c);
  };

  window._transferConfirmSubmit = function() {
    var pat = window.state.patients.find(pt => pt.uhid === _transferPatientUhid);
    if (!pat) return;

    if (!_transferToBed) {
      alert('Please choose a valid destination Bed.');
      return;
    }

    // Push Request into Admission Dashboard queue (transferRequests)
    window.state.transferRequests = window.state.transferRequests || [];
    window.state.transferRequests.push({
      id: 'TRF' + String(100 + window.state.transferRequests.length + 1),
      name: pat.name,
      uhid: pat.uhid,
      currentBed: _transferFromBed,
      currentWard: pat.ward || 'General Ward (Male)',
      targetWard: _transferToWard,
      targetBed: _transferToBed,
      targetRoom: _transferToRoom,
      condition: _transferPatientCondition,
      requestedBy: pat.primaryConsultant || 'Dr. Ramesh Kumar',
      reason: _transferReason,
      requestedAt: _transferDateTime,
      status: 'Pending Nursing Supervisor Approval',
      branch: 'Bengaluru'
    });

    // Update patient profile local condition flag
    pat.condition = _transferPatientCondition;

    // Log timeline event for audit trail
    pat.timelineEvents = pat.timelineEvents || [];
    pat.timelineEvents.unshift({
      date: new Date().toLocaleDateString('en-CA') + ' ' + new Date().toLocaleTimeString('en-US', {hour:'2-digit', minute:'2-digit'}),
      type: 'clinical',
      icon: '🔄',
      title: 'Relocation Request raised',
      desc: `Transfer request TRF-${100+window.state.transferRequests.length} raised for Bed ${_transferToBed} (${_transferPatientCondition})`
    });

    localStorage.setItem('saronil_patients', JSON.stringify(window.state.patients));

    _transferModalOpen = false;
    _transferReviewMode = false;
    
    // Trigger Success Toast
    window.showToastNotification('Transfer Request sent successfully.');

    var c = document.getElementById('main-content');
    if (c) renderWorkspace(c);
  };"""

src = src.replace(old_ops, new_ops, 1)

# 4. Overwrite transfer request popup markup
old_markup = """    // 2. Transfer Request Modal
    if (_transferModalOpen && _transferPatientUhid) {
      var pat = window.state.patients.find(pt => pt.uhid === _transferPatientUhid);
      var currentWardName = WARD_RATES[pat?.ward] ? WARD_RATES[pat.ward].name : pat?.ward || 'General Ward (Male)';

      if (_transferReviewMode) {
        var destWardName = WARD_RATES[_transferToWard]?.name || _transferToWard;

        overlaysHTML += `
          <div class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[1100] p-4 animate-fade-in">
            <div class="bg-white rounded-2xl w-[600px] max-w-[95vw] shadow-2xl overflow-hidden flex flex-col transform transition-all duration-200">
              
              <!-- Header -->
              <div class="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center">
                <h3 class="margin-0 text-blue-600 font-bold text-lg flex items-center gap-2">📋 Review Patient Transfer Summary</h3>
                <button class="text-slate-400 hover:text-slate-600 text-xl font-bold cursor-pointer transition-colors duration-150" onclick="window._transferModalClose()">✕</button>
              </div>

              <!-- Body -->
              <div class="p-6 overflow-y-auto flex-1 flex flex-col gap-4 text-left">
                
                <p class="margin-0 text-xs text-slate-500">
                  Please verify the following shift details before submitting the patient relocation order.
                </p>

                <!-- Patient & Log details -->
                <div class="bg-slate-50 border border-slate-100 rounded-xl p-4.5 grid grid-cols-2 gap-x-6 gap-y-2 text-xs">
                  <div class="col-span-2 border-b border-slate-200 pb-1.5 font-bold text-blue-600">Patient Information:</div>
                  <div>
                    <span class="text-slate-500 font-medium">Patient Name:</span>
                    <span class="text-slate-800 font-bold ml-1">${pat?.name}</span>
                  </div>
                  <div>
                    <span class="text-slate-500 font-medium">UHID / MRN:</span>
                    <span class="text-slate-800 font-bold ml-1">${pat?.uhid}</span>
                  </div>
                  <div>
                    <span class="text-slate-500 font-medium">Admission ID:</span>
                    <span class="text-slate-800 font-bold ml-1">ADM5001</span>
                  </div>
                  <div>
                    <span class="text-slate-500 font-medium">Treating Doctor:</span>
                    <span class="text-slate-800 font-bold ml-1">${pat?.primaryConsultant || 'Dr. Ramesh Kumar'}</span>
                  </div>

                  <div class="col-span-2 border-b border-slate-200 pt-2 pb-1.5 font-bold text-blue-600">Transfer Log Details:</div>
                  <div>
                    <span class="text-slate-500 font-medium">Transfer Reason:</span>
                    <span class="px-2 py-0.5 bg-emerald-50 text-emerald-700 font-bold rounded text-[10px] ml-1">${_transferReason}</span>
                  </div>
                  <div>
                    <span class="text-slate-500 font-medium">Effective Time:</span>
                    <span class="text-slate-800 font-bold ml-1">${new Date().toLocaleString('en-IN')}</span>
                  </div>
                </div>

                <!-- Comparative Origin vs Destination Readout -->
                <div class="flex items-center justify-between gap-4 bg-slate-50 p-4 border border-slate-200 rounded-xl text-center">
                  <div class="flex-1">
                    <span class="text-[10px] text-slate-400 block font-bold tracking-wider uppercase">ORIGIN BED</span>
                    <strong class="text-purple-600 text-base font-extrabold">${_transferFromBed}</strong>
                    <span class="text-[10px] text-slate-500 block">${currentWardName}</span>
                  </div>
                  <div class="text-xl text-slate-400 font-bold">➡️</div>
                  <div class="flex-1">
                    <span class="text-[10px] text-slate-400 block font-bold tracking-wider uppercase">DESTINATION BED</span>
                    <strong class="text-emerald-600 text-base font-extrabold">${_transferToBed}</strong>
                    <span class="text-[10px] text-slate-500 block">${destWardName}</span>
                  </div>
                </div>

                <div class="text-xs text-slate-600 bg-slate-50 p-3 border border-slate-200 rounded-lg">
                  <strong>Transfer Notes / Special instructions:</strong><br>
                  <p class="margin-0 mt-1 italic">${_transferNotes || 'No special handoff notes provided.'}</p>
                </div>

              </div>

              <!-- Footer Buttons -->
              <div class="bg-slate-50 px-6 py-3 border-t border-slate-200 flex justify-end gap-3">
                <button class="py-2 px-5 border border-slate-300 rounded-lg text-xs font-bold text-slate-600 bg-white hover:bg-slate-100" onclick="window.backToTransferEdit()">⬅️ Back to Edit</button>
                <button class="py-2 px-5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5" onclick="window._transferConfirmSubmit()">Confirm Transfer Now 🔄</button>
              </div>

            </div>
          </div>
        `;
      } else {
        overlaysHTML += `
          <div class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[1100] p-4 animate-fade-in">
            <div class="bg-white rounded-2xl w-[640px] max-w-[95vw] max-h-[90vh] shadow-2xl overflow-hidden flex flex-col transform transition-all duration-200">
              
              <!-- Header -->
              <div class="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center">
                <h3 class="margin-0 text-blue-600 font-bold text-lg flex items-center gap-2">🔄 Transfer Patient: ${pat?.name}</h3>
                <button class="text-slate-400 hover:text-slate-600 text-xl font-bold cursor-pointer transition-colors duration-150" onclick="window._transferModalClose()">✕</button>
              </div>

              <!-- Body -->
              <div class="p-6 overflow-y-auto flex-1 flex flex-col gap-4 text-left">
                
                <!-- Patient Info Capsule Card -->
                <div class="bg-slate-50 border border-slate-100 rounded-xl p-4.5 grid grid-cols-2 gap-x-6 gap-y-2 text-xs">
                  <div>
                    <span class="text-slate-500 font-medium">Patient:</span>
                    <span class="text-slate-800 font-bold ml-1">${pat?.name} (${pat?.age || 45} / ${pat?.gender})</span>
                  </div>
                  <div>
                    <span class="text-slate-500 font-medium">UHID / MRN:</span>
                    <span class="text-slate-800 font-bold ml-1">${pat?.uhid}</span>
                  </div>
                  <div>
                    <span class="text-slate-500 font-medium">Admission ID:</span>
                    <span class="text-slate-800 font-bold ml-1">ADM5001</span>
                  </div>
                  <div>
                    <span class="text-slate-500 font-medium">Admitted Date:</span>
                    <span class="text-slate-800 font-bold ml-1">2026-06-20 10:00 AM</span>
                  </div>
                  <div>
                    <span class="text-slate-500 font-medium">Current Location:</span>
                    <span class="text-purple-600 font-bold ml-1">${_transferFromBed} (${currentWardName})</span>
                  </div>
                  <div>
                    <span class="text-slate-500 font-medium">Room & Category:</span>
                    <span class="text-slate-800 font-bold ml-1">${_transferFromBed} (${currentWardName})</span>
                  </div>
                  <div>
                    <span class="text-slate-500 font-medium">Treating Doctor:</span>
                    <span class="text-slate-800 font-bold ml-1">${pat?.primaryConsultant || 'Dr. Ramesh Kumar'}</span>
                  </div>
                  <div>
                    <span class="text-slate-500 font-medium">Department:</span>
                    <span class="text-slate-800 font-bold ml-1">Cardiology</span>
                  </div>
                  <div class="col-span-2">
                    <span class="text-slate-500 font-medium">Nursing Station:</span>
                    <span class="text-slate-800 font-bold ml-1">${currentWardName} Nursing Desk</span>
                  </div>
                </div>

                <!-- Destination Location Fieldset Box -->
                <div class="border border-blue-100 rounded-xl p-4">
                  <div class="text-blue-600 font-bold text-sm mb-3 flex items-center gap-1.5">📍 Destination Location (Transfer To)</div>
                  <div class="grid grid-cols-3 gap-3">
                    <div>
                      <label class="block text-xs font-bold text-slate-700 mb-1">New Ward *</label>
                      <select class="w-full p-2 border border-slate-200 rounded-lg text-xs font-semibold" onchange="window._transferSetWard(this.value)">
                        <option value="">-- Choose Ward --</option>
                        ${Object.entries(WARD_RATES).map(([k, v]) => `<option value="${k}" ${k === _transferToWard ? 'selected' : ''}>${v.name}</option>`).join('')}
                      </select>
                    </div>
                    <div>
                      <label class="block text-xs font-bold text-slate-700 mb-1">New Room *</label>
                      <select class="w-full p-2 border border-slate-200 rounded-lg text-xs font-semibold" id="transfer-new-room">
                        ${_transferToWard.includes('PRIVATE') ? `
                          <option value="Room 201">Room 201</option>
                          <option value="Room 202">Room 202</option>
                        ` : _transferToWard.includes('SEMI-PRIVATE') ? `
                          <option value="Room 301">Room 301</option>
                          <option value="Room 302">Room 302</option>
                        ` : `
                          <option value="Room 402 (Male)">Room 402 (Male)</option>
                        `}
                      </select>
                    </div>
                    <div>
                      <label class="block text-xs font-bold text-slate-700 mb-1">New Bed *</label>
                      <select class="w-full p-2 border border-slate-200 rounded-lg text-xs font-semibold" id="trf-target-bed" onchange="window._transferSetBed(this.value)">
                        <option value="">-- Choose Bed --</option>
                        ${(window.state.wards[_transferToWard]?.beds || []).filter(b => (window.state.bedsStatus[b] || {}).status === 'Available').map(b => `<option value="${b}" ${b === _transferToBed ? 'selected' : ''}>${b}</option>`).join('')}
                      </select>
                    </div>
                  </div>
                </div>

                <!-- Extra form parameters -->
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="block text-xs font-bold text-slate-700 mb-1">Reason for Transfer *</label>
                    <select class="w-full p-2 border border-slate-200 rounded-lg text-xs font-semibold" id="trf-reason" onchange="_transferReason = this.value">
                      <option value="">-- Choose Reason --</option>
                      <option value="Clinical deterioration" ${_transferReason === 'Clinical deterioration' ? 'selected' : ''}>Clinical deterioration</option>
                      <option value="ICU upgrade" ${_transferReason === 'ICU upgrade' ? 'selected' : ''}>ICU Clinical Upgrade</option>
                      <option value="ICU step-down" ${_transferReason === 'ICU step-down' ? 'selected' : ''}>Stable clinical Step-down</option>
                      <option value="Bed request by family" ${_transferReason === 'Bed request by family' ? 'selected' : ''}>Bed category upgrade request</option>
                    </select>
                  </div>
                  <div>
                    <label class="block text-xs font-bold text-slate-700 mb-1">Effective Date & Time *</label>
                    <input type="text" class="w-full p-2 border border-slate-200 rounded-lg text-xs font-semibold" id="transfer-datetime" value="${new Date().toLocaleDateString('en-IN') + ', ' + new Date().toLocaleTimeString('en-US', {hour:'2-digit', minute:'2-digit'})}">
                  </div>
                  <div>
                    <label class="block text-xs font-bold text-slate-700 mb-1">Requested By *</label>
                    <select class="w-full p-2 border border-slate-200 rounded-lg text-xs font-semibold" id="transfer-requested-by">
                      <option value="Dr. Ramesh Kumar">${pat?.primaryConsultant || 'Dr. Ramesh Kumar'} (General Medicine)</option>
                    </select>
                  </div>
                  <div>
                    <label class="block text-xs font-bold text-slate-700 mb-1">Approved By (Optional)</label>
                    <input type="text" class="w-full p-2 border border-slate-200 rounded-lg text-xs font-semibold" id="transfer-approved-by" placeholder="Coordinator name">
                  </div>
                </div>

                <!-- Handoff notes -->
                <div class="mt-2">
                  <label class="block text-xs font-bold text-slate-700 mb-1">Transfer / Handoff Notes</label>
                  <textarea class="w-full p-2 border border-slate-200 rounded-lg text-xs font-semibold" id="trf-notes" rows="2" placeholder="Transport precautions, oxygen requirement, clinic status..."></textarea>
                </div>

              </div>

              <!-- Footer Buttons -->
              <div class="bg-slate-50 px-6 py-3 border-t border-slate-200 flex justify-end gap-3">
                <button class="py-2 px-5 border border-slate-300 rounded-lg text-xs font-bold text-slate-600 bg-white hover:bg-slate-100" onclick="window._transferModalClose()">Cancel</button>
                <button class="py-2 px-5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5" onclick="window.proceedToTransferReview()">Review Transfer ➡️</button>
              </div>

            </div>
          </div>
        `;
      }
    }"""

new_markup = """    // 2. Transfer Request Modal (Fully dynamic relocation journey)
    if (_transferModalOpen && _transferPatientUhid) {
      var pat = window.state.patients.find(pt => pt.uhid === _transferPatientUhid);
      var currentWardName = WARD_RATES[pat?.ward] ? WARD_RATES[pat.ward].name : pat?.ward || 'General Ward (Male)';

      if (_transferReviewMode) {
        var destWardName = WARD_RATES[_transferToWard]?.name || _transferToWard;

        overlaysHTML += `
          <div class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[1100] p-4 animate-fade-in">
            <div class="bg-white rounded-2xl w-[600px] max-w-[95vw] shadow-2xl overflow-hidden flex flex-col transform transition-all duration-200">
              
              <!-- Header -->
              <div class="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center">
                <h3 class="margin-0 text-blue-600 font-bold text-lg flex items-center gap-2">📋 Confirm Relocation Request</h3>
                <button class="text-slate-400 hover:text-slate-600 text-xl font-bold cursor-pointer transition-colors duration-150" onclick="window._transferModalClose()">✕</button>
              </div>

              <!-- Body -->
              <div class="p-6 overflow-y-auto flex-1 flex flex-col gap-4 text-left">
                
                <p class="margin-0 text-xs text-slate-500">
                  Please verify the following shift details before submitting the patient relocation order.
                </p>

                <!-- Patient & Log details -->
                <div class="bg-slate-50 border border-slate-100 rounded-xl p-4.5 grid grid-cols-2 gap-x-6 gap-y-2 text-xs">
                  <div class="col-span-2 border-b border-slate-200 pb-1.5 font-bold text-blue-600">Patient Information:</div>
                  <div>
                    <span class="text-slate-500 font-medium">Patient Name:</span>
                    <span class="text-slate-800 font-bold ml-1">${pat?.name}</span>
                  </div>
                  <div>
                    <span class="text-slate-500 font-medium">UHID / MRN:</span>
                    <span class="text-slate-800 font-bold ml-1">${pat?.uhid}</span>
                  </div>
                  <div>
                    <span class="text-slate-500 font-medium">Current Condition:</span>
                    <span class="px-2 py-0.5 bg-red-50 text-red-700 font-bold rounded text-[10px] ml-1">${_transferPatientCondition}</span>
                  </div>
                  <div>
                    <span class="text-slate-500 font-medium">Treating Doctor:</span>
                    <span class="text-slate-800 font-bold ml-1">${pat?.primaryConsultant || 'Dr. Ramesh Kumar'}</span>
                  </div>

                  <div class="col-span-2 border-b border-slate-200 pt-2 pb-1.5 font-bold text-blue-600">Transfer Log Details:</div>
                  <div>
                    <span class="text-slate-500 font-medium">Transfer Reason:</span>
                    <span class="px-2 py-0.5 bg-emerald-50 text-emerald-700 font-bold rounded text-[10px] ml-1">${_transferReason}</span>
                  </div>
                  <div>
                    <span class="text-slate-500 font-medium">Effective Time:</span>
                    <span class="text-slate-800 font-bold ml-1">${new Date(_transferDateTime).toLocaleString('en-IN')}</span>
                  </div>
                </div>

                <!-- Comparative Origin vs Destination Readout -->
                <div class="flex items-center justify-between gap-4 bg-slate-50 p-4 border border-slate-200 rounded-xl text-center">
                  <div class="flex-1">
                    <span class="text-[10px] text-slate-400 block font-bold tracking-wider uppercase">ORIGIN BED</span>
                    <strong class="text-purple-600 text-base font-extrabold">${_transferFromBed}</strong>
                    <span class="text-[10px] text-slate-500 block">${currentWardName}</span>
                  </div>
                  <div class="text-xl text-slate-400 font-bold">➡️</div>
                  <div class="flex-1">
                    <span class="text-[10px] text-slate-400 block font-bold tracking-wider uppercase">DESTINATION BED</span>
                    <strong class="text-emerald-600 text-base font-extrabold">${_transferToBed}</strong>
                    <span class="text-[10px] text-slate-500 block">${destWardName} · ${_transferToRoom}</span>
                  </div>
                </div>

                <div class="text-xs text-slate-600 bg-slate-50 p-3 border border-slate-200 rounded-lg">
                  <strong>Transfer Notes / Special instructions:</strong><br>
                  <p class="margin-0 mt-1 italic">${_transferNotes || 'No special handoff notes provided.'}</p>
                </div>

              </div>

              <!-- Footer Buttons -->
              <div class="bg-slate-50 px-6 py-3 border-t border-slate-200 flex justify-end gap-3">
                <button class="py-2 px-5 border border-slate-300 rounded-lg text-xs font-bold text-slate-600 bg-white hover:bg-slate-100" onclick="window.backToTransferEdit()">⬅️ Back to Edit</button>
                <button class="py-2 px-5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5" onclick="window._transferConfirmSubmit()">Confirm & Raise Request ➡️</button>
              </div>

            </div>
          </div>
        `;
      } else {
        var roomBeds = getBedsForRoom(_transferToWard, _transferToRoom);
        var availableBeds = roomBeds.filter(b => (window.state.bedsStatus[b] || {}).status === 'Available');

        overlaysHTML += `
          <div class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[1100] p-4 animate-fade-in">
            <div class="bg-white rounded-2xl w-[640px] max-w-[95vw] max-h-[90vh] shadow-2xl overflow-hidden flex flex-col transform transition-all duration-200">
              
              <!-- Header -->
              <div class="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center">
                <h3 class="margin-0 text-blue-600 font-bold text-lg flex items-center gap-2">🔄 Transfer Patient: ${pat?.name}</h3>
                <button class="text-slate-400 hover:text-slate-600 text-xl font-bold cursor-pointer transition-colors duration-150" onclick="window._transferModalClose()">✕</button>
              </div>

              <!-- Body -->
              <div class="p-6 overflow-y-auto flex-1 flex flex-col gap-4 text-left">
                
                <!-- Patient Info Capsule Card -->
                <div class="bg-slate-50 border border-slate-100 rounded-xl p-4.5 grid grid-cols-2 gap-x-6 gap-y-2 text-xs">
                  <div>
                    <span class="text-slate-500 font-medium">Patient:</span>
                    <span class="text-slate-800 font-bold ml-1">${pat?.name} (${pat?.age || 45} / ${pat?.gender})</span>
                  </div>
                  <div>
                    <span class="text-slate-500 font-medium">UHID / MRN:</span>
                    <span class="text-slate-800 font-bold ml-1">${pat?.uhid}</span>
                  </div>
                  <div>
                    <span class="text-slate-500 font-medium">Admission ID:</span>
                    <span class="text-slate-800 font-bold ml-1">ADM5001</span>
                  </div>
                  <div>
                    <span class="text-slate-500 font-medium">Admitted Date:</span>
                    <span class="text-slate-800 font-bold ml-1">2026-06-20 10:00 AM</span>
                  </div>
                  <div>
                    <span class="text-slate-500 font-medium">Current Location:</span>
                    <span class="text-purple-600 font-bold ml-1">${_transferFromBed} (${currentWardName})</span>
                  </div>
                  <div>
                    <span class="text-slate-500 font-medium">Patient Condition:</span>
                    <span class="font-bold ml-1 ${pat?.condition === 'Critical' ? 'text-red-600' : pat?.condition === 'Serious' ? 'text-amber-500' : 'text-emerald-600'}">${pat?.condition || 'Stable'}</span>
                  </div>
                </div>

                <!-- Destination Location Fieldset Box -->
                <div class="border border-blue-100 rounded-xl p-4">
                  <div class="text-blue-600 font-bold text-sm mb-3 flex items-center gap-1.5">📍 Destination Location (Transfer To)</div>
                  <div class="grid grid-cols-2 gap-3 mb-3">
                    <div>
                      <label class="block text-xs font-bold text-slate-700 mb-1">New Ward *</label>
                      <select class="w-full p-2 border border-slate-200 rounded-lg text-xs font-semibold" onchange="window._transferSetWard(this.value)">
                        ${Object.entries(WARD_RATES).map(([k, v]) => `<option value="${k}" ${k === _transferToWard ? 'selected' : ''}>${v.name} - ${fmtMoney(v.rate)}/day</option>`).join('')}
                      </select>
                    </div>
                    <div>
                      <label class="block text-xs font-bold text-slate-700 mb-1">New Room *</label>
                      <select class="w-full p-2 border border-slate-200 rounded-lg text-xs font-semibold" onchange="window._transferSetRoom(this.value)">
                        ${getRoomsForWard(_transferToWard).map(r => `<option value="${r}" ${r === _transferToRoom ? 'selected' : ''}>${r}</option>`).join('')}
                      </select>
                    </div>
                  </div>
                  
                  <!-- Selectable Bed Boxes (Clickable Cards) -->
                  <div>
                    <label class="block text-xs font-bold text-slate-700 mb-1">Select Bed *</label>
                    <div class="flex flex-wrap gap-2 mt-2">
                      ${availableBeds.map(b => {
                        var isSelected = (b === _transferToBed);
                        var activeClass = isSelected ? 'bg-blue-600 text-white border-blue-600 shadow-md scale-105' : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200';
                        return `
                          <button type="button" class="py-1.5 px-3 border rounded-lg text-xs font-bold transition-all cursor-pointer ${activeClass}" onclick="window._transferSetBed('${b}')">
                            🛏️ ${b}
                          </button>
                        `;
                      }).join('') || '<span class="text-xs text-red-500 font-semibold">⚠️ No available beds in this room</span>'}
                    </div>
                  </div>
                </div>

                <!-- Extra form parameters -->
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="block text-xs font-bold text-slate-700 mb-1">Reason for Transfer *</label>
                    <select class="w-full p-2 border border-slate-200 rounded-lg text-xs font-semibold" id="trf-reason" onchange="_transferReason = this.value">
                      <option value="Clinical deterioration" ${_transferReason === 'Clinical deterioration' ? 'selected' : ''}>Clinical deterioration</option>
                      <option value="ICU upgrade" ${_transferReason === 'ICU upgrade' ? 'selected' : ''}>ICU Clinical Upgrade</option>
                      <option value="ICU step-down" ${_transferReason === 'ICU step-down' ? 'selected' : ''}>Stable clinical Step-down</option>
                      <option value="Bed request by family" ${_transferReason === 'Bed request by family' ? 'selected' : ''}>Bed category upgrade request</option>
                    </select>
                  </div>
                  <div>
                    <label class="block text-xs font-bold text-slate-700 mb-1">Effective Date & Time *</label>
                    <input type="datetime-local" class="w-full p-2 border border-slate-200 rounded-lg text-xs font-semibold" id="transfer-datetime" value="${_transferDateTime}">
                  </div>
                  <div>
                    <label class="block text-xs font-bold text-slate-700 mb-1">Requested By *</label>
                    <select class="w-full p-2 border border-slate-200 rounded-lg text-xs font-semibold" id="transfer-requested-by">
                      <option value="Dr. Ramesh Kumar">${pat?.primaryConsultant || 'Dr. Ramesh Kumar'} (General Medicine)</option>
                    </select>
                  </div>
                  <div>
                    <label class="block text-xs font-bold text-slate-700 mb-1">Patient Condition *</label>
                    <select class="w-full p-2 border border-slate-200 rounded-lg text-xs font-semibold" id="trf-condition" onchange="_transferPatientCondition = this.value">
                      <option value="Stable" ${_transferPatientCondition === 'Stable' ? 'selected' : ''}>🟢 Stable</option>
                      <option value="Serious" ${_transferPatientCondition === 'Serious' ? 'selected' : ''}>🟡 Serious</option>
                      <option value="Critical" ${_transferPatientCondition === 'Critical' ? 'selected' : ''}>🔴 Critical</option>
                    </select>
                  </div>
                </div>

                <!-- Handoff notes -->
                <div class="mt-2">
                  <label class="block text-xs font-bold text-slate-700 mb-1">Transfer / Handoff Notes</label>
                  <textarea class="w-full p-2 border border-slate-200 rounded-lg text-xs font-semibold" id="trf-notes" rows="2" placeholder="Transport precautions, oxygen requirement, clinic status..."></textarea>
                </div>

              </div>

              <!-- Footer Buttons -->
              <div class="bg-slate-50 px-6 py-3 border-t border-slate-200 flex justify-end gap-3">
                <button class="py-2 px-5 border border-slate-300 rounded-lg text-xs font-bold text-slate-600 bg-white hover:bg-slate-100" onclick="window._transferModalClose()">Cancel</button>
                <button class="py-2 px-5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5" onclick="window.proceedToTransferReview()">Review Transfer ➡️</button>
              </div>

            </div>
          </div>
        `;
      }
    }"""

src = src.replace(old_markup, new_markup, 1)

with open(path, "w", encoding="utf-8") as f:
    f.write(src)

print("SUCCESS: Full dynamic transfer request and approval journey implemented with pricing, room dropdowns, bed chip boxes, and success toast.")
