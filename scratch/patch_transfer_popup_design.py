#!/usr/bin/env python3

path = "/Users/home/Desktop/Saronil IHS/Updated HIS /assets/js/views/ipdAdmissionView.js"

with open(path, "r", encoding="utf-8") as f:
    src = f.read()

# 1. Update window._transferConfirmSubmit to bypass the authorization check (since the checkbox is removed from the design)
old_submit_fn = """  window._transferConfirmSubmit = function() {
    var isConfirmed = document.getElementById('trf-toggle-confirm').checked;
    if (!isConfirmed) {
      alert('Treating consultant authorization toggle is required before raising transfer.');
      return;
    }

    var notes = document.getElementById('trf-notes').value.trim();
    var pat = window.state.patients.find(pt => pt.uhid === _transferPatientUhid);"""

new_submit_fn = """  window._transferConfirmSubmit = function() {
    var notes = document.getElementById('trf-notes')?.value?.trim() || '';
    var pat = window.state.patients.find(pt => pt.uhid === _transferPatientUhid);"""

src = src.replace(old_submit_fn, new_submit_fn, 1)

# 2. Add window._transferSetWard helper function next to window._transferModalClose
old_modal_close = """  window._transferModalClose = function() {
    _transferModalOpen = false;
    var c = document.getElementById('main-content');
    if (c) renderWorkspace(c);
  };"""

new_modal_close = """  window._transferModalClose = function() {
    _transferModalOpen = false;
    var c = document.getElementById('main-content');
    if (c) renderWorkspace(c);
  };

  window._transferSetWard = function(val) {
    _transferToWard = val;
    var c = document.getElementById('main-content');
    if (c) renderWorkspace(c);
  };"""

src = src.replace(old_modal_close, new_modal_close, 1)

# 3. Replace the transfer modal markup
old_transfer_markup = """    // 2. Transfer Request Modal
    if (_transferModalOpen && _transferPatientUhid) {
      var pat = window.state.patients.find(pt => pt.uhid === _transferPatientUhid);
      var currentWardName = WARD_RATES[pat?.ward] ? WARD_RATES[pat.ward].name : pat?.ward || 'GENERAL-WARD-M';

      overlaysHTML += `
        <div class="ipd-modal-overlay">
          <div class="ipd-modal" style="width:480px;">
            <div class="ipd-modal-hdr">
              <h4 class="ipd-modal-title">🔀 Initiate Ward Bed Transfer</h4>
              <button class="ipd-drawer-close" style="color:#000;" onclick="window._transferModalClose()">✕</button>
            </div>
            <div class="ipd-modal-body">
              <div class="ipd-modal-field">
                <div class="er-label">Patient name</div>
                <input type="text" class="er-input" readonly value="${pat?.name} (${pat?.uhid})">
              </div>
              <div class="ipd-modal-field">
                <div class="er-label">Current bed + ward</div>
                <input type="text" class="er-input" readonly value="${_transferFromBed} (${currentWardName})">
              </div>
              
              <div class="ipd-modal-field">
                <div class="er-label">Transfer Type</div>
                <select class="er-select" onchange="window._transferSetType(this.value)">
                  <option value="Internal ward-to-ward" ${_transferType === 'Internal ward-to-ward' ? 'selected' : ''}>Internal ward-to-ward</option>
                  <option value="ICU escalation" ${_transferType === 'ICU escalation' ? 'selected' : ''}>ICU Escalation</option>
                  <option value="ICU step-down" ${_transferType === 'ICU step-down' ? 'selected' : ''}>ICU Step-down</option>
                  <option value="Inter-branch" ${_transferType === 'Inter-branch' ? 'selected' : ''}>Inter-branch Transfer</option>
                </select>
              </div>

              ${_transferType !== 'Inter-branch' ? `
                <div class="ipd-modal-field">
                  <div class="er-label">Transfer to ward</div>
                  <select class="er-select" id="trf-target-ward" onchange="_transferToWard = this.value">
                    ${Object.entries(WARD_RATES).map(([k, v]) => `<option value="${k}" ${k === _transferToWard ? 'selected' : ''}>${v.name}</option>`).join('')}
                  </select>
                </div>
              ` : `
                <div class="ipd-modal-field">
                  <div class="er-label">Receiving Branch</div>
                  <select class="er-select" onchange="_transferExtBranch = this.value">
                    <option value="Whitefield">Whitefield</option>
                    <option value="Electronic City">Electronic City</option>
                  </select>
                </div>
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:10px;">
                  <div class="ipd-modal-field" style="margin:0;">
                    <div class="er-label">Receiving Doctor</div>
                    <input type="text" class="er-input" id="trf-ext-doc" placeholder="Doctor's name">
                  </div>
                  <div class="ipd-modal-field" style="margin:0;">
                    <div class="er-label">Ambulance Required?</div>
                    <select class="er-select" onchange="_transferExtAmbulance = this.value">
                      <option value="Yes">Yes, Cardiac Ambulance</option>
                      <option value="No">No, Self travel</option>
                    </select>
                  </div>
                </div>
              `}

              <div class="ipd-modal-field">
                <div class="er-label">Reason for transfer</div>
                <select class="er-select" id="trf-reason" onchange="_transferReason = this.value">
                  <option value="Clinical deterioration">Clinical deterioration</option>
                  <option value="Bed request by family">Bed category upgrade request</option>
                  <option value="ICU upgrade">ICU Clinical Upgrade</option>
                  <option value="ICU step-down">Stable clinical Step-down</option>
                </select>
              </div>

              <div class="ipd-modal-field">
                <div class="er-label">Transfer Clinical Notes</div>
                <textarea class="er-textarea" id="trf-notes" rows="2" placeholder="Clinical handoff summary..."></textarea>
              </div>

              <div style="margin: 12px 0;">
                <label style="font-weight:700; display:flex; align-items:center; gap:8px; font-size:12px; color:#1e3a8a; cursor:pointer;">
                  <input type="checkbox" id="trf-toggle-confirm"> Confirm Treating Consultant Authorization (Required)
                </label>
              </div>

              <div class="btn-row" style="margin-top:16px;">
                <button class="btn btn-secondary" onclick="window._transferModalClose()">Cancel</button>
                <button class="btn btn-primary" onclick="window._transferConfirmSubmit()">Submit Request</button>
              </div>
            </div>
          </div>
        </div>
      `;
    }"""

new_transfer_markup = """    // 2. Transfer Request Modal
    if (_transferModalOpen && _transferPatientUhid) {
      var pat = window.state.patients.find(pt => pt.uhid === _transferPatientUhid);
      var currentWardName = WARD_RATES[pat?.ward] ? WARD_RATES[pat.ward].name : pat?.ward || 'General Ward (Male)';

      overlaysHTML += `
        <div class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[1100] p-4">
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
                    <select class="w-full p-2 border border-slate-200 rounded-lg text-xs font-semibold">
                      <option value="">Room 402 (Male)</option>
                    </select>
                  </div>
                  <div>
                    <label class="block text-xs font-bold text-slate-700 mb-1">New Bed *</label>
                    <select class="w-full p-2 border border-slate-200 rounded-lg text-xs font-semibold">
                      <option value="">-- Choose Bed --</option>
                      ${(window.state.wards[_transferToWard]?.beds || []).filter(b => (window.state.bedsStatus[b] || {}).status === 'Available').map(b => `<option value="${b}">${b}</option>`).join('')}
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
                  <input type="text" class="w-full p-2 border border-slate-200 rounded-lg text-xs font-semibold" value="${new Date().toLocaleDateString('en-IN') + ', ' + new Date().toLocaleTimeString('en-US', {hour:'2-digit', minute:'2-digit'})}">
                </div>
                <div>
                  <label class="block text-xs font-bold text-slate-700 mb-1">Requested By *</label>
                  <select class="w-full p-2 border border-slate-200 rounded-lg text-xs font-semibold">
                    <option value="Dr. Ramesh Kumar">${pat?.primaryConsultant || 'Dr. Ramesh Kumar'} (General Medicine)</option>
                  </select>
                </div>
                <div>
                  <label class="block text-xs font-bold text-slate-700 mb-1">Approved By (Optional)</label>
                  <input type="text" class="w-full p-2 border border-slate-200 rounded-lg text-xs font-semibold" placeholder="Coordinator name">
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
              <button class="py-2 px-5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5" onclick="window._transferConfirmSubmit()">Review Transfer ➡️</button>
            </div>

          </div>
        </div>
      `;
    }"""

src = src.replace(old_transfer_markup, new_transfer_markup, 1)

with open(path, "w", encoding="utf-8") as f:
    f.write(src)

print("SUCCESS: Transfer patient form popup redesigned to match uploaded image format.")
