#!/usr/bin/env python3

path = "/Users/home/Desktop/Saronil IHS/Updated HIS /assets/js/views/ipdAdmissionView.js"

with open(path, "r", encoding="utf-8") as f:
    src = f.read()

# Replace the legacy discharge modal layout with clean Tailwind CSS
old_dis_markup = """    // 3. Discharge Form Modal
    if (_dischargeModalOpen && _dischargePatientUhid) {
      var pat = window.state.patients.find(pt => pt.uhid === _dischargePatientUhid);

      overlaysHTML += `
        <div class="ipd-modal-overlay">
          <div class="ipd-modal" style="width:480px;">
            <div class="ipd-modal-hdr">
              <h4 class="ipd-modal-title">✍️ Issue Discharge Clinical Order</h4>
              <button class="ipd-drawer-close" style="color:#000;" onclick="window._dischargeModalClose()">✕</button>
            </div>
            <div class="ipd-modal-body">
              <div style="font-size:12px; color:var(--text-secondary); margin-bottom:12px;">
                Patient: <strong>${pat?.name}</strong> (${pat?.uhid}) · Bed: <strong>${pat?.bed}</strong>
              </div>

              <div class="ipd-modal-field">
                <div class="er-label">Discharge Type</div>
                <select class="er-select" onchange="window._dischargeSetType(this.value)">
                  <option value="Regular">Regular medical discharge</option>
                  <option value="LAMA">LAMA (Against advice)</option>
                  <option value="Referred">Referred to external facility</option>
                  <option value="Death">Death case file</option>
                </select>
              </div>

              ${_dischargeType === 'LAMA' ? `
                <div class="ipd-modal-field">
                  <div class="er-label" style="color:#b91c1c;">LAMA Attender refusal Reason <span>*</span></div>
                  <input type="text" class="er-input" id="dis-lama-reason" placeholder="e.g. Financial constraints or alternative opinion">
                </div>
              ` : ''}

              <div class="ipd-modal-field">
                <div class="er-label">Final diagnosis <span>*</span></div>
                <input type="text" class="er-input" id="dis-diag" value="${_dischargeDiagnosis}">
              </div>

              <div class="ipd-modal-field">
                <div class="er-label">Course Summary in hospital <span>*</span></div>
                <textarea class="er-textarea" id="dis-summary" rows="2" placeholder="Course details, labs summaries, treatments given..."></textarea>
              </div>

              <div class="ipd-modal-field">
                <div class="er-label">Follow-up advice & medications</div>
                <textarea class="er-textarea" id="dis-followup" rows="2" placeholder="Medications, dosage timings, warning symptoms, follow-up date..."></textarea>
              </div>

              <div style="margin: 12px 0;">
                <label style="font-weight:700; display:flex; align-items:center; gap:8px; font-size:12px; color:#1e3a8a; cursor:pointer;">
                  <input type="checkbox" id="dis-pin"> Authorize with Doctor Electronic Signature (e-Sign PIN verification)
                </label>
              </div>

              <div class="btn-row" style="margin-top:16px;">
                <button class="btn btn-secondary" onclick="window._dischargeModalClose()">Cancel</button>
                <button class="btn btn-primary" style="background:#ef4444;" onclick="window._dischargeConfirmSubmit()">Sign & Save Order</button>
              </div>
            </div>
          </div>
        </div>
      `;
    }"""

new_dis_markup = """    // 3. Discharge Form Modal (Redesigned with Tailwind CSS)
    if (_dischargeModalOpen && _dischargePatientUhid) {
      var pat = window.state.patients.find(pt => pt.uhid === _dischargePatientUhid);

      overlaysHTML += `
        <div class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[1100] p-4 animate-fade-in">
          <div class="bg-white rounded-2xl w-[480px] max-w-[95vw] max-h-[90vh] shadow-2xl overflow-hidden flex flex-col transform transition-all duration-200">
            
            <!-- Header -->
            <div class="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center">
              <h3 class="margin-0 text-red-600 font-bold text-lg flex items-center gap-2">✍️ Issue Discharge Order</h3>
              <button class="text-slate-400 hover:text-slate-600 text-xl font-bold cursor-pointer transition-colors duration-150" onclick="window._dischargeModalClose()">✕</button>
            </div>

            <!-- Body -->
            <div class="p-6 overflow-y-auto flex-1 flex flex-col gap-4 text-left">
              
              <div class="bg-slate-50 border border-slate-100 rounded-xl p-3.5 text-xs text-slate-600">
                Patient: <span class="font-bold text-slate-800">${pat?.name}</span> (${pat?.uhid}) · Bed: <span class="font-bold text-slate-800">${pat?.bed || _drawerBedId}</span>
              </div>

              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">Discharge Type</label>
                <select class="w-full p-2 border border-slate-200 rounded-lg text-xs font-semibold" onchange="window._dischargeSetType(this.value)">
                  <option value="Regular" ${_dischargeType === 'Regular' ? 'selected' : ''}>Regular medical discharge</option>
                  <option value="LAMA" ${_dischargeType === 'LAMA' ? 'selected' : ''}>LAMA (Against advice)</option>
                  <option value="Referred" ${_dischargeType === 'Referred' ? 'selected' : ''}>Referred to external facility</option>
                  <option value="Death" ${_dischargeType === 'Death' ? 'selected' : ''}>Death case file</option>
                </select>
              </div>

              ${_dischargeType === 'LAMA' ? `
                <div>
                  <label class="block text-xs font-bold text-red-600 mb-1">LAMA Attender Refusal Reason *</label>
                  <input type="text" class="w-full p-2 border border-slate-200 rounded-lg text-xs font-semibold" id="dis-lama-reason" placeholder="e.g. Financial constraints or alternative opinion">
                </div>
              ` : ''}

              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">Final Diagnosis *</label>
                <input type="text" class="w-full p-2 border border-slate-200 rounded-lg text-xs font-semibold" id="dis-diag" value="${_dischargeDiagnosis}">
              </div>

              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">Course Summary in Hospital *</label>
                <textarea class="w-full p-2 border border-slate-200 rounded-lg text-xs font-semibold" id="dis-summary" rows="2" placeholder="Course details, labs summaries, treatments given...">${_dischargeSummary}</textarea>
              </div>

              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">Follow-up Advice & Medications</label>
                <textarea class="w-full p-2 border border-slate-200 rounded-lg text-xs font-semibold" id="dis-followup" rows="2" placeholder="Medications, dosage timings, warning symptoms, follow-up date...">${_dischargeFollowup}</textarea>
              </div>

              <div class="mt-2">
                <label class="flex items-center gap-2 text-xs font-bold text-blue-600 cursor-pointer">
                  <input type="checkbox" id="dis-pin" class="rounded border-slate-300"> Authorize with Doctor Electronic Signature (e-Sign PIN)
                </label>
              </div>

            </div>

            <!-- Footer Buttons -->
            <div class="bg-slate-50 px-6 py-3 border-t border-slate-200 flex justify-end gap-3">
              <button class="py-2 px-5 border border-slate-300 rounded-lg text-xs font-bold text-slate-600 bg-white hover:bg-slate-100" onclick="window._dischargeModalClose()">Cancel</button>
              <button class="py-2 px-5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold" onclick="window._dischargeConfirmSubmit()">Sign & Save Order</button>
            </div>

          </div>
        </div>
      `;
    }"""

src = src.replace(old_dis_markup, new_dis_markup, 1)

with open(path, "w", encoding="utf-8") as f:
    f.write(src)

print("SUCCESS: Doctor's Discharge Order popup fully migrated to Tailwind CSS styles.")
