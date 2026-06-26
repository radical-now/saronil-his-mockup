/* ==========================================================================
   SARONIL HMS - UNIFIED IPD ADMISSION & ONBOARDING CONTROL (ipdAdmissionView.js)
   ========================================================================== */

window.views.ipdAdmission = function(container, subAnchor, params) {
  const selectedUhid = params.uhid || '';
  const initialPatient = selectedUhid ? state.patients.find(p => p.uhid === selectedUhid) : null;
  const initialPatientText = initialPatient ? `${initialPatient.name} (${initialPatient.uhid})` : '';

  container.innerHTML = `
    <style>
      .ipd-step1-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1.5rem;
        width: 100%;
        align-items: start;
      }
      @media (max-width: 900px) {
        .ipd-step1-grid {
          grid-template-columns: 1fr;
        }
      }
      .checklist-modules-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 0.75rem;
        width: 100%;
      }
      @media (max-width: 1250px) {
        .checklist-modules-grid {
          grid-template-columns: 1fr;
        }
      }
      .adm-header-row {
        display: grid;
        grid-template-columns: 1.2fr 0.8fr;
        gap: 1rem;
        width: 100%;
      }
      @media (max-width: 600px) {
        .adm-header-row {
          grid-template-columns: 1fr;
        }
      }
      .sticker-card {
        background: #fafaf9;
        color: #0c0a09;
        border: 2px solid #1c1917;
        padding: 1.25rem;
        font-family: 'Courier New', Courier, monospace;
        border-radius: 6px;
        box-shadow: var(--shadow-md);
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        position: relative;
      }
      .sticker-header {
        font-size: 0.75rem;
        font-weight: bold;
        border-bottom: 1px dashed #1c1917;
        padding-bottom: 0.25rem;
        display: flex;
        justify-content: space-between;
      }
      .sticker-barcode {
        height: 35px;
        background: repeating-linear-gradient(90deg, #1c1917, #1c1917 2px, #fafaf9 2px, #fafaf9 6px);
        width: 100%;
        margin: 0.25rem 0;
      }
      .sticker-footer {
        font-size: 0.7rem;
        border-top: 1px dashed #1c1917;
        padding-top: 0.25rem;
        margin-top: auto;
      }
    </style>

    <div class="card" style="width: 100%; max-width: 100%; margin: 0; box-shadow: var(--shadow-sm);">
      <div class="card-header" style="background-color: var(--primary-glow); padding: 1rem 1.5rem;">
        <div>
          <h3 class="card-title" style="color: var(--primary); font-weight: 700; margin: 0;">IPD Inpatient Onboarding & Admission Control</h3>
          <p class="card-subtitle" style="color: var(--text-secondary); margin: 0.25rem 0 0 0; font-size: 0.85rem;">Assign bed, validate pre-admission checklists, and print wristbands & attendant passes in a unified dashboard</p>
        </div>
      </div>
      
      <div class="card-body" style="padding: 1.5rem;">
        <form id="ipd-admission-single-form" style="display: flex; flex-direction: column; gap: 1.5rem; width: 100%;">
          
          <!-- Step 1: Admission Details & Checklist -->
          <div id="ipd-step-1" style="display: block; width: 100%;">
            <div class="ipd-step1-grid">
              
              <!-- Column 1: Admission & Bed Details -->
              <div style="background: var(--bg-surface-elevated); padding: 1.25rem; border-radius: 8px; border: 1px solid var(--border-color); display: flex; flex-direction: column; gap: 1rem; min-height: 600px;">
                <h4 style="color: var(--primary); font-weight: 700; margin: 0 0 0.5rem 0; font-size: 0.95rem; border-bottom: 1px solid var(--border-color); padding-bottom: 0.5rem; display: flex; align-items: center; gap: 0.5rem;">🛏️ 1. Admission & Bed Details</h4>
                
                <!-- Patient Selection & Admission Date Row -->
                <div class="adm-header-row">
                  <!-- Patient Selection -->
                  <div class="form-group">
                    <label class="form-label" for="adm-uhid-search">Select Patient <span>*</span></label>
                    <div class="patient-search-wrapper" style="position: relative; width: 100%;">
                      <span style="position: absolute; left: 10px; top: 50%; transform: translateY(-50%); font-size: 0.8rem; color: var(--text-muted);">🔎</span>
                      <input type="text" id="adm-uhid-search" class="form-control" placeholder="Search patient globally..." style="padding-left: 2rem; font-size: 0.85rem; height: 36px;" autocomplete="off" value="${initialPatientText}" required>
                      <input type="hidden" id="adm-uhid" value="${selectedUhid}" required>
                      <div id="adm-uhid-autocomplete" class="autocomplete-dropdown" style="display: none;"></div>
                    </div>
                  </div>

                  <!-- Admission Date -->
                  <div class="form-group">
                    <label class="form-label" for="adm-date">Admission Date <span>*</span></label>
                    <input type="date" id="adm-date" class="form-control" value="2026-06-21" required style="font-size: 0.85rem; height: 36px;">
                  </div>
                </div>

                <!-- Admitting Consultant -->
                <div class="form-group">
                  <label class="form-label" for="adm-doctor">Admitting Consultant <span>*</span></label>
                  <select id="adm-doctor" class="form-select" required style="font-size: 0.85rem;">
                    ${state.doctors.map(d => `<option value="${d.name}">${d.name} (${d.spec})</option>`).join('')}
                  </select>
                </div>

                <!-- Ward Category -->
                <div class="form-group">
                  <label class="form-label" for="adm-ward">Ward Category <span>*</span></label>
                  <select id="adm-ward" class="form-select" required style="font-size: 0.85rem;">
                    <option value="">-- Choose Ward --</option>
                    ${Object.entries(state.wards).map(([key, info]) => `<option value="${key}">${info.name} (₹${info.price}/day)</option>`).join('')}
                  </select>
                </div>
                
                <!-- Available Bed (Graphical Picker) -->
                <div class="form-group">
                  <label class="form-label">Available Bed <span>*</span></label>
                  <select id="adm-bed" class="form-select" required style="display: none;">
                    <option value="">-- Choose Bed --</option>
                  </select>
                  <div id="adm-bed-board-wrapper" style="border: 1px solid var(--border-color); border-radius: 6px; padding: 0.75rem; background: var(--bg-base); max-height: 250px; overflow-y: auto; width: 100%;">
                    <div style="font-size: 0.72rem; color: var(--text-muted); font-style: italic; text-align: center;" id="adm-bed-board-placeholder">Select a Ward Category above to load beds map...</div>
                    <div id="adm-bed-board-legend" style="display: none; justify-content: flex-start; gap: 0.65rem; font-size: 0.65rem; margin-bottom: 0.65rem; border-bottom: 1px dashed var(--border-color); padding-bottom: 0.4rem; flex-wrap: wrap;">
                      <div style="display: flex; align-items: center; gap: 0.25rem;"><div style="background-color: var(--color-success); width: 8px; height: 8px; border-radius: 2px;"></div> Available</div>
                      <div style="display: flex; align-items: center; gap: 0.25rem;"><div style="background-color: var(--color-purple); width: 8px; height: 8px; border-radius: 2px;"></div> Occupied</div>
                      <div style="display: flex; align-items: center; gap: 0.25rem;"><div style="background-color: var(--primary); width: 8px; height: 8px; border-radius: 2px;"></div> Reserved</div>
                      <div style="display: flex; align-items: center; gap: 0.25rem;"><div style="background-color: #fbbf24; width: 8px; height: 8px; border-radius: 2px;"></div> Cleaning</div>
                    </div>
                    <div id="adm-bed-board-grid" class="beds-grid" style="grid-template-columns: repeat(auto-fill, minmax(90px, 1fr)); gap: 0.5rem; display: none;">
                      <!-- Beds drawn graphically -->
                    </div>
                  </div>
                </div>

                <!-- Admitting Diagnosis -->
                <div class="form-group">
                  <label class="form-label" for="adm-diagnosis">Diagnosis / Complaint <span>*</span></label>
                  <textarea id="adm-diagnosis" class="form-control" placeholder="Admitting diagnosis..." required style="font-size: 0.85rem; height: 75px; resize: none;"></textarea>
                </div>
              </div>

              <!-- Column 2: Pre-Admission Checklist Validation -->
              <div style="background: var(--bg-surface-elevated); padding: 1.25rem; border-radius: 8px; border: 1px solid var(--border-color); display: flex; flex-direction: column; gap: 1rem; min-height: 600px;">
                <h4 style="color: var(--primary); font-weight: 700; margin: 0 0 0.5rem 0; font-size: 0.95rem; border-bottom: 1px solid var(--border-color); padding-bottom: 0.5rem; display: flex; align-items: center; gap: 0.5rem;">📋 2. Pre-Admission Checklist</h4>
                
                <div class="checklist-modules-grid">
                  <!-- 1. Govt Approved Photo ID -->
                  <div style="background: var(--bg-base); padding: 0.85rem; border-radius: 6px; border: 1px solid var(--border-color);">
                    <h6 style="margin: 0 0 0.5rem 0; font-weight: 700; font-size: 0.8rem; color: var(--primary);">1. Government Photo ID Verified</h6>
                    <div id="chk-id-status-area" style="font-size: 0.78rem;">
                      <span style="color: var(--text-muted); font-style: italic;">Select a patient to verify ID status...</span>
                    </div>
                  </div>

                  <!-- 2. Medical Consent Form -->
                  <div style="background: var(--bg-base); padding: 0.85rem; border-radius: 6px; border: 1px solid var(--border-color);">
                    <h6 style="margin: 0 0 0.5rem 0; font-weight: 700; font-size: 0.8rem; color: var(--primary);">2. Signed Medical Consent Form <span>*</span></h6>
                    <input type="file" id="chk-consent-file" class="form-control" style="font-size: 0.75rem;" required disabled>
                    <div id="consent-file-status" style="font-size: 0.75rem; font-weight: 600; color: var(--text-muted); margin-top: 0.25rem;">No consent uploaded</div>
                  </div>

                  <!-- 3. Admission Advance Deposit -->
                  <div style="background: var(--bg-base); padding: 0.85rem; border-radius: 6px; border: 1px solid var(--border-color);">
                    <h6 style="margin: 0 0 0.5rem 0; font-weight: 700; font-size: 0.8rem; color: var(--primary);">3. Advance Deposit / Billing Approval</h6>
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.4rem; font-size: 0.78rem;">
                      <span>Balance Paid: <strong id="chk-total-paid-display" style="font-size: 0.82rem;">₹0</strong></span>
                      <span id="chk-billing-status-badge" class="badge badge-secondary" style="font-size: 0.65rem;">Pending</span>
                    </div>
                    <div style="display: flex; gap: 0.35rem; align-items: center; margin-top: 0.4rem;">
                      <input type="number" id="chk-new-advance-amount" class="form-control" placeholder="Add Deposit (₹)" min="0" style="font-size: 0.78rem; height: 28px; flex-grow: 1;" disabled>
                      <button type="button" class="btn btn-secondary" onclick="window.addTempAdvanceDeposit()" style="height: 28px; font-size: 0.75rem; padding: 0 0.5rem; cursor: pointer;">Add</button>
                    </div>
                    <div id="advance-deposit-status" style="margin-top: 0.25rem; font-size: 0.72rem; font-weight: 600; color: var(--color-success);"></div>
                  </div>

                  <!-- 4. Insurance Pre-Auth Coverage -->
                  <div style="background: var(--bg-base); padding: 0.85rem; border-radius: 6px; border: 1px solid var(--border-color);">
                    <h6 style="margin: 0 0 0.5rem 0; font-weight: 700; font-size: 0.8rem; color: var(--primary);">4. Insurance Pre-Auth Intimation</h6>
                    <div id="chk-insurance-status-area" style="font-size: 0.78rem;">
                      <span style="color: var(--text-muted); font-style: italic;">Select a patient to verify insurance...</span>
                    </div>
                  </div>

                  <!-- Optional Attendant Details -->
                  <div style="background: var(--bg-base); padding: 0.85rem; border-radius: 6px; border: 1px solid var(--border-color); display: flex; flex-direction: column; gap: 0.5rem;">
                    <h6 style="margin: 0; font-weight: 700; font-size: 0.8rem; color: var(--primary);">5. Caregiver Attendant Details (Optional)</h6>
                    <input type="text" id="chk-attendant-name" class="form-control" placeholder="Attendant Full Name" style="height: 28px; font-size: 0.75rem;" disabled>
                    <input type="text" id="chk-attendant-relation" class="form-control" placeholder="Relationship to Patient" style="height: 28px; font-size: 0.75rem;" disabled>
                    <input type="text" id="chk-attendant-phone" class="form-control" placeholder="Attendant Mobile" style="height: 28px; font-size: 0.75rem;" disabled>
                    <input type="text" id="chk-attendant-id" class="form-control" placeholder="Attendant Photo ID (Aadhaar)" style="height: 28px; font-size: 0.75rem;" disabled>
                  </div>

                  <!-- Emergency Contact Details -->
                  <div style="background: var(--bg-base); padding: 0.85rem; border-radius: 6px; border: 1px solid var(--border-color); display: flex; flex-direction: column; gap: 0.5rem;">
                    <h6 style="margin: 0; font-weight: 700; font-size: 0.8rem; color: var(--primary);">6. Emergency Contact Details (Optional)</h6>
                    <input type="text" id="chk-emergency-name" class="form-control" placeholder="Contact Full Name" style="height: 28px; font-size: 0.75rem;" disabled>
                    <input type="text" id="chk-emergency-relation" class="form-control" placeholder="Relationship" style="height: 28px; font-size: 0.75rem;" disabled>
                    <input type="text" id="chk-emergency-phone" class="form-control" placeholder="Mobile Number" style="height: 28px; font-size: 0.75rem;" disabled>
                  </div>
                </div>

              </div>

            </div>
            
            <!-- Actions at the bottom of Step 1 -->
            <div style="display: flex; gap: 1rem; justify-content: flex-end; padding-top: 1.5rem; margin-top: 1.5rem; border-top: 1px solid var(--border-color); width: 100%;">
              <button type="button" class="btn btn-secondary" onclick="router.navigate('registration')" style="padding: 0.65rem 1.5rem; font-weight: 600; cursor: pointer;">Cancel</button>
              <button type="submit" class="btn btn-primary" style="padding: 0.65rem 2.5rem; font-weight: 700; font-size: 0.9rem; cursor: pointer;">Complete Onboarding & Proceed ➡️</button>
            </div>
          </div>

          <!-- Step 2: Success Banner & Prints/Identity Tags -->
          <div id="ipd-step-2" style="display: none; width: 100%; flex-direction: column; gap: 1.5rem;">
            
            <!-- Success Banner -->
            <div style="background-color: var(--color-success-bg); border: 1px solid var(--color-success); border-radius: 8px; padding: 1.25rem; display: flex; align-items: center; gap: 1rem; margin-bottom: 0.5rem; width: 100%;">
              <span style="font-size: 2.25rem;">🟢</span>
              <div>
                <h4 style="color: var(--color-success); margin: 0 0 0.25rem 0; font-weight: 700;">Inpatient Admission Successful & Bed Assigned</h4>
                <p style="margin: 0; font-size: 0.85rem; color: var(--text-secondary);">
                  Patient <strong id="success-pat-readout-name">-</strong> (UHID: <span id="success-pat-readout-uhid">-</span>) has been successfully admitted. Bed <strong id="success-pat-readout-bed">-</strong> is now officially occupied under <span id="success-pat-readout-doc">-</span>.
                </p>
              </div>
            </div>

            <!-- Printer Settings & Status Box -->
            <div style="background: var(--bg-surface-elevated); padding: 1.25rem; border-radius: 8px; border: 1px solid var(--border-color); display: flex; flex-direction: column; gap: 0.75rem; width: 100%;">
              <h5 style="margin: 0; font-weight: 700; color: var(--primary); font-size: 0.9rem; border-bottom: 1px solid var(--border-color); padding-bottom: 0.5rem;">🖨️ Printer Settings & Logs</h5>
              <div style="display: flex; gap: 1rem; align-items: center; flex-wrap: wrap;">
                <div class="form-group" style="margin-bottom: 0; flex-grow: 1; max-width: 350px;">
                  <label class="form-label" style="font-size: 0.78rem; margin-bottom: 0.25rem;">Sticker / Label Destination Printer</label>
                  <select id="adm-sticker-printer" class="form-select" style="font-size: 0.78rem; height: 30px; padding: 2px 6px;">
                    <option value="Thermal Printer A">Wristband Printer A (IPD desk)</option>
                    <option value="Label Printer B">Label Printer B (Ward desk)</option>
                  </select>
                </div>
                <button type="button" class="btn btn-primary" onclick="window.printAllStickersAndPasses()" style="height: 34px; padding: 0 1.5rem; font-weight: 700; font-size: 0.82rem; margin-top: 1.2rem; cursor: pointer; display: flex; align-items: center; gap: 0.4rem;">🖨️ Print All Identity Tags & Caregiver Pass</button>
              </div>
              <div id="adm-print-status-box" style="margin: 0.25rem 0;"></div>
            </div>

            <!-- Previews & Identity Tags -->
            <div style="background: var(--bg-surface-elevated); padding: 1.25rem; border-radius: 8px; border: 1px solid var(--border-color); display: flex; flex-direction: column; gap: 1rem; width: 100%;">
              <h4 style="color: var(--primary); font-weight: 700; margin: 0 0 0.5rem 0; font-size: 0.95rem; border-bottom: 1px solid var(--border-color); padding-bottom: 0.5rem; display: flex; align-items: center; gap: 0.5rem;">🖨️ 3. Previews & Identity Tags</h4>
              
              <div class="sticker-grid-horizontal" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 1.25rem; width: 100%;">
                
                <!-- Wristband -->
                <div class="sticker-card" style="padding: 1rem; border-radius: 6px; box-shadow: var(--shadow-sm); font-size: 0.78rem; background: #fafaf9; color: #0c0a09; border: 2px solid #1c1917; font-family: 'Courier New', Courier, monospace; display: flex; flex-direction: column; gap: 0.5rem; position: relative;">
                  <div class="sticker-header" style="font-size: 0.65rem; font-weight: bold; border-bottom: 1px dashed #1c1917; padding-bottom: 0.25rem; display: flex; justify-content: space-between; color: #1c1917;">
                    <span>IPD ADMISSION WRISTBAND</span>
                    <span>SARONIL HMS</span>
                  </div>
                  <div style="font-size: 0.88rem; font-weight: bold; margin-top: 0.25rem;" id="prev-adm-wb-name">-</div>
                  <div style="font-size: 0.7rem; color: var(--text-secondary);" id="prev-adm-wb-details">-</div>
                  <div class="sticker-barcode" style="height: 25px; margin: 0.2rem 0; background: repeating-linear-gradient(90deg, #1c1917, #1c1917 2px, #fafaf9 2px, #fafaf9 6px); width: 100%;"></div>
                  <div class="sticker-footer" style="font-size: 0.65rem; border-top: 1px dashed #1c1917; padding-top: 0.25rem; margin-top: auto; display: flex; justify-content: space-between; align-items: center;">
                    <span id="prev-adm-wb-allergies" style="color: var(--color-danger); font-weight: bold;">Allergies: None</span>
                    <button type="button" class="btn btn-sm btn-secondary" onclick="window.printAdmSticker('Wristband')" style="font-size: 0.62rem; padding: 1px 4px; cursor: pointer;">Print</button>
                  </div>
                </div>

                <!-- Attendant Pass Card -->
                <div class="sticker-card" id="prev-attendant-card" style="border: 2px solid #0f766e; background: #f0fdfa; padding: 1rem; border-radius: 6px; box-shadow: var(--shadow-sm); font-size: 0.78rem; font-family: 'Courier New', Courier, monospace; display: none; flex-direction: column; gap: 0.5rem; position: relative;">
                  <div class="sticker-header" style="font-size: 0.65rem; border-bottom: 1px dashed #0f766e; color: #0f766e; font-weight: bold; padding-bottom: 0.25rem; display: flex; justify-content: space-between;">
                    <span>PATIENT ATTENDANT PASS</span>
                    <span>SARONIL HMS</span>
                  </div>
                  <div style="font-size: 0.88rem; font-weight: bold; color: #0f766e; margin-top: 0.25rem;" id="prev-adm-attendant-name">-</div>
                  <div style="font-size: 0.7rem; line-height: 1.3; color: var(--text-primary);">
                    <div id="prev-adm-attendant-relation">-</div>
                    <div id="prev-adm-attendant-patient">-</div>
                    <div id="prev-adm-attendant-bed">-</div>
                  </div>
                  <div class="sticker-barcode" style="height: 25px; background: repeating-linear-gradient(90deg, #0f766e, #0f766e 2px, #f0fdfa 2px, #f0fdfa 6px); margin: 0.2rem 0; width: 100%;"></div>
                  <div class="sticker-footer" style="border-top: 1px dashed #0f766e; color: #0f766e; font-size: 0.65rem; padding-top: 0.25rem; margin-top: auto; display: flex; justify-content: space-between; align-items: center;">
                    <span>Validity: Active Admission</span>
                    <button type="button" class="btn btn-sm btn-secondary" onclick="window.printAdmSticker('Attendant Pass')" style="font-size: 0.62rem; padding: 1px 4px; cursor: pointer;">Print</button>
                  </div>
                </div>

                <!-- Specimen Label -->
                <div class="sticker-card" style="padding: 1rem; border-radius: 6px; box-shadow: var(--shadow-sm); font-size: 0.78rem; background: #fafaf9; color: #0c0a09; border: 2px solid #1c1917; font-family: 'Courier New', Courier, monospace; display: flex; flex-direction: column; gap: 0.5rem; position: relative;">
                  <div class="sticker-header" style="font-size: 0.65rem; font-weight: bold; border-bottom: 1px dashed #1c1917; padding-bottom: 0.25rem; display: flex; justify-content: space-between; color: #1c1917;">
                    <span>LIS SPECIMEN LABEL</span>
                    <span>LAB-SPECIMEN</span>
                  </div>
                  <div style="font-size: 0.88rem; font-weight: bold; margin-top: 0.25rem;" id="prev-adm-lab-name">-</div>
                  <div style="font-size: 0.7rem; color: var(--text-secondary);" id="prev-adm-lab-details">-</div>
                  <div class="sticker-barcode" style="height: 25px; margin: 0.2rem 0; background: repeating-linear-gradient(90deg, #1c1917, #1c1917 2px, #fafaf9 2px, #fafaf9 6px); width: 100%;"></div>
                  <div class="sticker-footer" style="font-size: 0.65rem; border-top: 1px dashed #1c1917; padding-top: 0.25rem; margin-top: auto; display: flex; justify-content: space-between; align-items: center;">
                    <span>Sample: BLOOD VACUTAINER</span>
                    <button type="button" class="btn btn-sm btn-secondary" onclick="window.printAdmSticker('Specimen Label')" style="font-size: 0.62rem; padding: 1px 4px; cursor: pointer;">Print</button>
                  </div>
                </div>

                <!-- Chart Label -->
                <div class="sticker-card" style="padding: 1rem; border-radius: 6px; box-shadow: var(--shadow-sm); font-size: 0.78rem; background: #fafaf9; color: #0c0a09; border: 2px solid #1c1917; font-family: 'Courier New', Courier, monospace; display: flex; flex-direction: column; gap: 0.5rem; position: relative;">
                  <div class="sticker-header" style="font-size: 0.65rem; font-weight: bold; border-bottom: 1px dashed #1c1917; padding-bottom: 0.25rem; display: flex; justify-content: space-between; color: #1c1917;">
                    <span>IPD CHART FILE LABEL</span>
                    <span>MEDICAL RECORD</span>
                  </div>
                  <div style="font-size: 0.88rem; font-weight: bold; margin-top: 0.25rem;" id="prev-adm-chart-name">-</div>
                  <div style="font-size: 0.7rem; color: var(--text-secondary);" id="prev-adm-chart-details">-</div>
                  <div class="sticker-barcode" style="height: 25px; margin: 0.2rem 0; background: repeating-linear-gradient(90deg, #1c1917, #1c1917 2px, #fafaf9 2px, #fafaf9 6px); width: 100%;"></div>
                  <div class="sticker-footer" style="font-size: 0.65rem; border-top: 1px dashed #1c1917; padding-top: 0.25rem; margin-top: auto; display: flex; justify-content: space-between; align-items: center;">
                    <span>IPD Chart Folder</span>
                    <button type="button" class="btn btn-sm btn-secondary" onclick="window.printAdmSticker('Chart Label')" style="font-size: 0.62rem; padding: 1px 4px; cursor: pointer;">Print</button>
                  </div>
                </div>

              </div>
            </div>

            <!-- Footer Actions for Step 2 -->
            <div style="display: flex; gap: 1rem; justify-content: flex-end; padding-top: 1.5rem; border-top: 1px solid var(--border-color); width: 100%;">
              <button type="button" class="btn btn-secondary" onclick="window.resetIpdAdmissionFlow()" style="padding: 0.65rem 1.5rem; font-weight: 600; cursor: pointer;">Admit Another Patient</button>
              <button type="button" class="btn btn-primary" onclick="router.navigate('atd')" style="padding: 0.65rem 2.5rem; font-weight: 700; font-size: 0.9rem; cursor: pointer;">Done & Go to Bed Board ➡️</button>
            </div>

          </div>
        </form>
      </div>
    </div>
  `;

  // References to selectors in Column 1
  const wardSelect = document.getElementById('adm-ward');
  const bedSelect = document.getElementById('adm-bed');
  const doctorSelect = document.getElementById('adm-doctor');
  const patientSelect = document.getElementById('adm-uhid');
  const patientSearchInput = document.getElementById('adm-uhid-search');
  const dateInput = document.getElementById('adm-date');
  const diagnosisInput = document.getElementById('adm-diagnosis');

  // References to inputs in Column 2
  const consentFile = document.getElementById('chk-consent-file');
  const advanceAmountInput = document.getElementById('chk-new-advance-amount');
  const attNameInput = document.getElementById('chk-attendant-name');
  const attRelationInput = document.getElementById('chk-attendant-relation');
  const attPhoneInput = document.getElementById('chk-attendant-phone');
  const attIdInput = document.getElementById('chk-attendant-id');
  const emerNameInput = document.getElementById('chk-emergency-name');
  const emerRelationInput = document.getElementById('chk-emergency-relation');
  const emerPhoneInput = document.getElementById('chk-emergency-phone');

  // Real-time Preview updates helper
  function updateRealTimePreviews() {
    const uhid = patientSelect.value;
    const patient = state.patients.find(p => p.uhid === uhid);
    const attCard = document.getElementById('prev-attendant-card');
    
    if (!patient) {
      document.getElementById('prev-adm-wb-name').textContent = '-';
      document.getElementById('prev-adm-wb-details').textContent = '-';
      document.getElementById('prev-adm-wb-allergies').textContent = 'Allergies: None';
      document.getElementById('prev-adm-lab-name').textContent = '-';
      document.getElementById('prev-adm-lab-details').textContent = '-';
      document.getElementById('prev-adm-chart-name').textContent = '-';
      document.getElementById('prev-adm-chart-details').textContent = '-';
      document.getElementById('prev-adm-attendant-name').textContent = '-';
      document.getElementById('prev-adm-attendant-relation').textContent = '-';
      document.getElementById('prev-adm-attendant-patient').textContent = '-';
      document.getElementById('prev-adm-attendant-bed').textContent = '-';
      if (attCard) attCard.style.display = 'none';
      return;
    }

    const docName = doctorSelect.value;
    const wardName = wardSelect.options[wardSelect.selectedIndex]?.text.split(' (')[0] || 'N/A';
    const bed = bedSelect.value || 'TBD';

    // Update Wristband
    document.getElementById('prev-adm-wb-name').textContent = patient.name;
    document.getElementById('prev-adm-wb-details').textContent = `UHID: ${patient.uhid} | Bed: ${bed} | Group: ${patient.bloodGroup || 'A+'}`;
    document.getElementById('prev-adm-wb-allergies').textContent = `Allergies: ${patient.allergies || 'No Known Allergies'}`;

    // Update Lab Label
    document.getElementById('prev-adm-lab-name').textContent = patient.name;
    document.getElementById('prev-adm-lab-details').textContent = `UHID: ${patient.uhid} | Ward: ${wardName} | Bed: ${bed}`;

    // Update Chart Label
    document.getElementById('prev-adm-chart-name').textContent = patient.name;
    document.getElementById('prev-adm-chart-details').textContent = `UHID: ${patient.uhid} | Bed: ${bed} | Consultant: ${docName}`;

    // Update Attendant Pass
    const attName = attNameInput.value.trim();
    const attRelation = attRelationInput.value.trim() || 'N/A';
    const attPhone = attPhoneInput.value.trim() || 'N/A';
    
    if (attCard) {
      if (attName) {
        attCard.style.display = 'flex';
        document.getElementById('prev-adm-attendant-name').textContent = `Attendant: ${attName}`;
        document.getElementById('prev-adm-attendant-relation').textContent = `Relation: ${attRelation} | Mobile: ${attPhone}`;
        document.getElementById('prev-adm-attendant-patient').textContent = `Patient Name: ${patient.name}`;
        document.getElementById('prev-adm-attendant-bed').textContent = `Bed: ${bed} (${wardName})`;
      } else {
        attCard.style.display = 'none';
      }
    }
  }

  // Handle patient selection and enable checklist
  const onPatientSelected = (patient) => {
    if (!patient) return;
    
    // Fill Diagnosis & Consultant
    diagnosisInput.value = patient.clinicalData.diagnosis || patient.clinicalData.complaint;
    doctorSelect.value = patient.primaryConsultant;

    // Enable checklist & attendant inputs in Column 2
    consentFile.disabled = false;
    advanceAmountInput.disabled = false;
    attNameInput.disabled = false;
    attRelationInput.disabled = false;
    attPhoneInput.disabled = false;
    attIdInput.disabled = false;
    emerNameInput.disabled = false;
    emerRelationInput.disabled = false;
    emerPhoneInput.disabled = false;

    // 1. Govt Photo ID Section Update
    const hasIdOnFile = patient.aadhaar || patient.passport;
    const idArea = document.getElementById('chk-id-status-area');
    if (idArea) {
      if (hasIdOnFile) {
        idArea.innerHTML = `
          <div style="display: flex; align-items: center; gap: 0.4rem; color: var(--color-success); font-weight: 600; margin-bottom: 0.25rem;">
            <span>✅ ID Verified on File</span>
          </div>
          <div style="font-family: monospace; color: var(--text-primary); font-size: 0.75rem;">
            ${patient.aadhaar ? `Aadhaar Card: XXXX-XXXX-${patient.aadhaar.slice(-4)}` : `Passport No: ${patient.passport}`}
          </div>
        `;
      } else {
        idArea.innerHTML = `
          <div style="color: var(--color-danger); font-weight: 600; margin-bottom: 0.4rem;">
            ⚠️ No Photo ID on file
          </div>
          <div class="form-group" style="margin-bottom: 0;">
            <input type="text" id="chk-new-id-number" class="form-control" placeholder="Enter Aadhaar/Passport No. *" required style="font-size: 0.75rem; height: 28px;">
          </div>
        `;
      }
    }

    // 2. Billing & Advance Payments calculation
    const billingRecords = state.billing.filter(b => b.uhid === patient.uhid);
    const totalPaid = billingRecords.reduce((sum, b) => sum + (b.paid || 0), 0);
    window.initialTotalPaid = totalPaid;
    window.tempAdvancePaid = 0;

    const paidDisplay = document.getElementById('chk-total-paid-display');
    if (paidDisplay) {
      paidDisplay.textContent = `₹${totalPaid}`;
      paidDisplay.style.color = totalPaid > 0 ? 'var(--color-success)' : 'var(--text-muted)';
    }
    const badgeEl = document.getElementById('chk-billing-status-badge');
    if (badgeEl) {
      badgeEl.className = totalPaid > 0 ? 'badge badge-success' : 'badge badge-danger';
      badgeEl.textContent = totalPaid > 0 ? 'Billing Approved' : 'Payment Required';
    }

    // 3. Insurance Coverage section
    const insuranceArea = document.getElementById('chk-insurance-status-area');
    if (insuranceArea) {
      if (patient.insuranceId || patient.payerType === 'Company') {
        insuranceArea.innerHTML = `
          <div style="display: flex; align-items: center; gap: 0.4rem; color: var(--color-success); font-weight: 600; margin-bottom: 0.25rem;">
            <span>✅ Pre-Auth Processed</span>
          </div>
          <div style="color: var(--text-primary); font-size: 0.72rem; line-height: 1.4;">
            <div><strong>Cover:</strong> ${patient.payer || 'Religare TPA'}</div>
            <div><strong>Policy ID:</strong> ${patient.insuranceId || 'POL983210'}</div>
          </div>
        `;
      } else {
        insuranceArea.innerHTML = `
          <div style="background: #eff6ff; color: #1e40af; border: 1px solid #bfdbfe; padding: 0.4rem; border-radius: 4px; font-size: 0.72rem; margin-bottom: 0.4rem; font-weight: 500;">
            Self-Paying Patient
          </div>
          <div style="display: flex; align-items: center; gap: 0.35rem;">
            <input type="checkbox" id="chk-self-pay-approve" required checked style="cursor: pointer;">
            <label for="chk-self-pay-approve" style="font-size: 0.75rem; font-weight: 600; cursor: pointer;">Financial Responsibility Signed</label>
          </div>
        `;
      }
    }

    // Prefill emergency contact details
    if (patient.emergencyContact) {
      emerNameInput.value = patient.emergencyContact.name || '';
      emerRelationInput.value = patient.emergencyContact.relation || '';
      emerPhoneInput.value = patient.emergencyContact.phone || '';
    }

    updateRealTimePreviews();
  };

  // Helper to render the graphical bed grid
  function renderGraphicalBedBoard(wardKey) {
    const placeholder = document.getElementById('adm-bed-board-placeholder');
    const legend = document.getElementById('adm-bed-board-legend');
    const grid = document.getElementById('adm-bed-board-grid');
    
    if (!placeholder || !legend || !grid) return;

    if (!wardKey) {
      placeholder.style.display = 'block';
      legend.style.display = 'none';
      grid.style.display = 'none';
      grid.innerHTML = '';
      return;
    }

    placeholder.style.display = 'none';
    legend.style.display = 'flex';
    grid.style.display = 'grid';

    // Get all beds belonging to this ward category
    const wardBeds = Object.entries(state.bedsStatus)
      .filter(([bedId, info]) => info.wardKey === wardKey);

    if (wardBeds.length === 0) {
      grid.innerHTML = `<div style="grid-column: span 12; text-align: center; color: var(--text-muted); font-size: 0.8rem; font-style: italic; padding: 1rem 0;">No beds mapped for this category.</div>`;
      return;
    }

    const statusClassMap = {
      'Available': 'bed-vacant',
      'Vacant': 'bed-vacant',
      'Occupied': 'bed-occupied',
      'Reserved': 'bed-reserved',
      'Housekeeping In Progress': 'bed-housekeeping-progress',
      'Vacated - Pending Housekeeping': 'bed-housekeeping-pending',
      'Isolation Cleaning Required': 'bed-isolation',
      'Maintenance Required': 'bed-maintenance',
      'Blocked': 'bed-blocked',
      'Out of Service / Blocked': 'bed-blocked'
    };

    grid.innerHTML = wardBeds.map(([bedId, info]) => {
      const statusClass = statusClassMap[info.status] || 'bed-blocked';
      const isAvailable = info.status === 'Available' || info.status === 'Vacant';
      const isSelected = bedSelect.value === bedId;
      const selectStyle = isSelected 
        ? 'border-color: var(--primary); box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.25); transform: translateY(-1px); font-weight: bold;'
        : '';
      const onclickAttr = isAvailable 
        ? `onclick="window.selectAdmBedGraphical('${bedId}')"`
        : `style="cursor: not-allowed; opacity: 0.55;" title="Bed is ${info.status}"`;

      return `
        <div id="adm-bed-card-${bedId}" class="bed-card ${statusClass}" ${onclickAttr} style="padding: 0.4rem; border-radius: 4px; gap: 0.25rem; ${selectStyle}">
          <div class="bed-card-top" style="font-size: 0.72rem; display: flex; align-items: center; justify-content: space-between;">
            <span class="bed-name">${bedId}</span>
            <span class="bed-icon" style="font-size: 0.9rem;">🛏️</span>
          </div>
          <span class="bed-status-text" style="font-size: 0.55rem; font-weight: 600; text-transform: uppercase;">${info.status.split(' ')[0]}</span>
        </div>
      `;
    }).join('');
  }

  // Graphical Bed selector trigger
  window.selectAdmBedGraphical = function(bedId) {
    const bedSelect = document.getElementById('adm-bed');
    if (!bedSelect) return;

    bedSelect.value = bedId;
    
    // Highlight selected card
    const cards = document.querySelectorAll('#adm-bed-board-grid .bed-card');
    cards.forEach(card => {
      card.style.borderColor = '';
      card.style.boxShadow = '';
      card.style.transform = '';
      card.style.fontWeight = '';
    });

    const selectedCard = document.getElementById(`adm-bed-card-${bedId}`);
    if (selectedCard) {
      selectedCard.style.borderColor = 'var(--primary)';
      selectedCard.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.25)';
      selectedCard.style.transform = 'translateY(-1px)';
      selectedCard.style.fontWeight = 'bold';
    }

    // Trigger preview update
    updateRealTimePreviews();
  };

  // Bind dropdown cascade for beds
  wardSelect.addEventListener('change', () => {
    const wardKey = wardSelect.value;
    if (!wardKey) {
      bedSelect.innerHTML = `<option value="">-- Choose Bed --</option>`;
      renderGraphicalBedBoard('');
      updateRealTimePreviews();
      return;
    }

    // Get available beds in that ward category
    const vacantBeds = Object.entries(state.bedsStatus)
      .filter(([bedId, info]) => info.wardKey === wardKey && (info.status === 'Available' || info.status === 'Vacant'))
      .map(([bedId]) => bedId);

    if (vacantBeds.length === 0) {
      bedSelect.innerHTML = `<option value="">No vacant beds available</option>`;
    } else {
      bedSelect.innerHTML = `<option value="">-- Choose Bed --</option>` + vacantBeds.map(b => `<option value="${b}">${b}</option>`).join('');
    }

    // Render graphical bed board
    renderGraphicalBedBoard(wardKey);
    updateRealTimePreviews();
  });

  // Listeners to trigger live updates in previews
  bedSelect.addEventListener('change', () => {
    const selectedBedId = bedSelect.value;
    const cards = document.querySelectorAll('#adm-bed-board-grid .bed-card');
    cards.forEach(card => {
      card.style.borderColor = '';
      card.style.boxShadow = '';
      card.style.transform = '';
      card.style.fontWeight = '';
    });

    if (selectedBedId) {
      const selectedCard = document.getElementById(`adm-bed-card-${selectedBedId}`);
      if (selectedCard) {
        selectedCard.style.borderColor = 'var(--primary)';
        selectedCard.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.25)';
        selectedCard.style.transform = 'translateY(-1px)';
        selectedCard.style.fontWeight = 'bold';
      }
    }
    updateRealTimePreviews();
  });

  doctorSelect.addEventListener('change', updateRealTimePreviews);
  attNameInput.addEventListener('input', updateRealTimePreviews);
  attRelationInput.addEventListener('input', updateRealTimePreviews);
  attPhoneInput.addEventListener('input', updateRealTimePreviews);

  // Monitor hidden patient select updates (triggered by autocomplete)
  patientSearchInput.addEventListener('change', () => {
    setTimeout(() => {
      const uhid = patientSelect.value;
      const patient = state.patients.find(p => p.uhid === uhid);
      if (patient) {
        onPatientSelected(patient);
      }
    }, 150);
  });

  // Initialize Patient Autocomplete Search
  window.setupPatientAutocomplete({
    searchInputId: 'adm-uhid-search',
    hiddenInputId: 'adm-uhid',
    autocompleteListId: 'adm-uhid-autocomplete',
    filterFn: p => p.status !== 'Admitted' && p.status !== 'Day Care'
  });

  // Prefill parameter triggers
  if (selectedUhid) {
    setTimeout(() => {
      const patient = state.patients.find(p => p.uhid === selectedUhid);
      if (patient) {
        onPatientSelected(patient);
      }
    }, 200);
  }

  // File consent status handler
  consentFile.addEventListener('change', () => {
    const fileStatus = document.getElementById('consent-file-status');
    if (fileStatus && consentFile.files.length > 0) {
      fileStatus.innerHTML = `<span style="color: var(--color-success); font-weight: 600;">✅ ${consentFile.files[0].name}</span>`;
    }
  });

  // Handle unified single form submit
  const mainForm = document.getElementById('ipd-admission-single-form');
  mainForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const uhid = patientSelect.value;
    if (!uhid) {
      alert("Please select a patient first.");
      return;
    }

    const patient = state.patients.find(p => p.uhid === uhid);
    if (!patient) return;

    const docName = doctorSelect.value;
    const wardKey = wardSelect.value;
    const bed = bedSelect.value;
    const dateVal = dateInput.value;
    const diagnosis = diagnosisInput.value.trim();

    if (!wardKey || !bed) {
      alert("Please choose a valid ward and available bed.");
      return;
    }

    // Process new ID if missing from profile
    const newIdInput = document.getElementById('chk-new-id-number');
    if (newIdInput && newIdInput.value.trim()) {
      const idVal = newIdInput.value.trim();
      if (idVal.length === 12 && /^\d+$/.test(idVal)) {
        patient.aadhaar = idVal;
      } else {
        patient.passport = idVal;
      }
    }

    // Emergency Contact details
    const emerName = emerNameInput.value.trim();
    const emerRelation = emerRelationInput.value.trim();
    const emerPhone = emerPhoneInput.value.trim();
    if (emerName || emerRelation || emerPhone) {
      patient.emergencyContact = {
        name: emerName,
        relation: emerRelation,
        phone: emerPhone
      };
    }

    // Attendant details
    const attName = attNameInput.value.trim();
    const attRelation = attRelationInput.value.trim();
    const attPhone = attPhoneInput.value.trim();
    const attId = attIdInput.value.trim();

    if (attName) {
      window.attendantDetails = {
        name: attName,
        relation: attRelation || 'N/A',
        phone: attPhone || 'N/A',
        id: attId || 'N/A'
      };
    } else {
      window.attendantDetails = null;
    }

    // 1. Create IPD Inpatient Admission Log
    const admId = "ADM" + String(5000 + state.admissions.length + 1);
    state.admissions.push({
      id: admId,
      uhid: patient.uhid,
      patientName: patient.name,
      date: dateVal,
      ward: wardKey,
      bed: bed,
      doctorName: docName,
      diagnosis: diagnosis,
      status: "Active"
    });

    // 2. Set Bed status to Occupied
    const prevStatus = state.bedsStatus[bed] ? state.bedsStatus[bed].status : 'Available';
    state.bedsStatus[bed] = {
      wardKey: wardKey,
      status: "Occupied",
      patientUhid: patient.uhid,
      notes: wardKey === "DAYCARE" ? `Daycare Procedure: ${diagnosis}` : `Admitted under ${docName} for ${diagnosis}`
    };

    // Log bed movement
    state.logBedMovement({
      patientId: patient.uhid,
      encounterId: admId,
      bedId: bed,
      wardKey: wardKey,
      prevStatus: prevStatus,
      newStatus: 'Occupied',
      action: wardKey === "DAYCARE" ? 'Daycare Admission' : 'Inpatient Admission',
      remarks: wardKey === "DAYCARE" ? `Admitted for daycare procedure: ${diagnosis}` : `Admitted under ${docName} for ${diagnosis}`
    });

    // 3. Update Patient registry status and enroll in daycare clinical flow if applicable
    if (wardKey === "DAYCARE") {
      patient.status = "Day Care";
      
      window.state.daycareAdmissions = window.state.daycareAdmissions || [];
      if (!window.state.daycareAdmissions.some(a => a.patient.uhid === patient.uhid)) {
        window.state.daycareAdmissions.unshift({
          patient: patient,
          bedId: bed,
          ward: 'Daycare Ward',
          bedNo: bed,
          consultantName: docName,
          procedureName: diagnosis || 'Minor Procedure',
          admissionType: 'Daycare',
          admissionTimestamp: new Date().toISOString(),
          status: 'Registered',
          historyLogs: [{ timestamp: new Date().toISOString(), action: 'Daycare Bed Allocated & Registered (via Admission Desk)' }],
          tasks: [
            { id: 'vitals-1', name: 'Take Pre-Op Vitals (BP, pulse, SpO2, Temp)', completed: false },
            { id: 'meds-1', name: 'Verify Medication Dose and Frequency', completed: false },
            { id: 'postcheck-1', name: 'Post-procedure Site Assessment', completed: false }
          ]
        });
        localStorage.setItem('saronil_daycare_admissions', JSON.stringify(window.state.daycareAdmissions));
      }
    } else {
      patient.status = "Admitted";
    }

    // 4. Create Initial Billing invoice
    const wardPrice = state.wards[wardKey].price;
    const billId = "INV" + String(8000 + state.billing.length + 1);
    const depositPaid = (window.initialTotalPaid || 0) + (window.tempAdvancePaid || 0);

    state.billing.push({
      id: billId,
      uhid: patient.uhid,
      patientName: patient.name,
      date: dateVal,
      amount: wardPrice + 800 + 1500, // Bed + Consult + Nursing
      paid: depositPaid,
      status: depositPaid >= (wardPrice + 800 + 1500) ? "Settled" : "Outstanding",
      items: [
        { desc: `Room Rent / Bed Charges (${state.wards[wardKey].name})`, qty: 1, rate: wardPrice, total: wardPrice },
        { desc: "Clinical Admission Consultation", qty: 1, rate: 800, total: 800 },
        { desc: "Nursing Administration Charges", qty: 1, rate: 1500, total: 1500 }
      ]
    });

    // Write audit logs
    state.auditLogs = state.auditLogs || [];
    state.auditLogs.unshift({
      timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) + " " + new Date().toLocaleDateString('en-US'),
      user: 'Admission Officer',
      action: 'IPD Admission',
      details: `Admitted patient ${patient.name} (${patient.uhid}) to Bed: ${bed} under ${docName}.`
    });
    if (window.tempAdvancePaid > 0) {
      state.auditLogs.unshift({
        timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) + " " + new Date().toLocaleDateString('en-US'),
        user: 'Admission Officer',
        action: 'Advance Payment',
        details: `Received advance payment ₹${window.tempAdvancePaid} for patient ${patient.name}.`
      });
    }

    // Populate success readout fields in Step 2
    document.getElementById('success-pat-readout-name').textContent = patient.name;
    document.getElementById('success-pat-readout-uhid').textContent = patient.uhid;
    document.getElementById('success-pat-readout-bed').textContent = `${bed} (${state.wards[wardKey].name})`;
    document.getElementById('success-pat-readout-doc').textContent = docName;

    // Update print previews with finalized inputs
    updateRealTimePreviews();

    // Transition to Step 2
    document.getElementById('ipd-step-1').style.display = 'none';
    document.getElementById('ipd-step-2').style.display = 'flex';
  });

  window.addTempAdvanceDeposit = function() {
    if (advanceAmountInput.disabled) return;
    const val = parseInt(advanceAmountInput.value) || 0;
    if (val <= 0) {
      alert("Please enter a valid deposit amount.");
      return;
    }
    window.tempAdvancePaid = (window.tempAdvancePaid || 0) + val;
    const displayVal = window.initialTotalPaid + window.tempAdvancePaid;
    
    // Update UI display
    const totalPaidDisplay = document.getElementById('chk-total-paid-display');
    if (totalPaidDisplay) {
      totalPaidDisplay.textContent = `₹${displayVal}`;
      totalPaidDisplay.style.color = 'var(--color-success)';
    }
    
    const statusBadge = document.getElementById('chk-billing-status-badge');
    if (statusBadge) {
      statusBadge.textContent = 'Billing Approved';
      statusBadge.className = 'badge badge-success';
    }
    
    const statusBox = document.getElementById('advance-deposit-status');
    if (statusBox) {
      statusBox.textContent = `✅ Added ₹${val} advance deposit. Total: ₹${displayVal}`;
    }
    advanceAmountInput.value = '';
  };

  window.printAllStickersAndPasses = function() {
    const printer = document.getElementById('adm-sticker-printer').value;
    const uhid = patientSelect.value;
    const patient = state.patients.find(p => p.uhid === uhid);
    const patientName = patient ? patient.name : 'Patient';
    const hasAttendant = attNameInput && attNameInput.value.trim();

    state.auditLogs = state.auditLogs || [];
    const printLogs = ['Wristband', 'LIS Specimen Label', 'IPD Chart File Label'];
    if (hasAttendant) {
      printLogs.push('Caregiver Attendant Pass');
    }

    printLogs.forEach(type => {
      state.auditLogs.unshift({
        timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) + " " + new Date().toLocaleDateString('en-US'),
        user: 'Admission Officer',
        action: 'Print Sticker',
        details: `Printed ${type} for ${patientName} on printer: ${printer}.`
      });
    });

    const statusBox = document.getElementById('adm-print-status-box');
    if (statusBox) {
      statusBox.innerHTML = `
        <div style="background-color: var(--color-success-bg); color: var(--color-success); padding: 0.5rem; border-radius: 6px; font-size: 0.8rem; font-weight: bold; text-align: center; margin-top: 0.5rem;">
          🟢 Printed ${printLogs.length} items successfully!
        </div>
      `;
      setTimeout(() => {
        statusBox.innerHTML = '';
      }, 3000);
    }
  };

  window.printAdmSticker = function(stickerType) {
    if (stickerType === 'Attendant Pass') {
      const hasAttendant = attNameInput && attNameInput.value.trim();
      if (!hasAttendant) {
        alert("Cannot print Attendant Pass because attendant details are not provided.");
        return;
      }
    }
    const printer = document.getElementById('adm-sticker-printer').value;
    const patientUhid = patientSelect.value;
    const patient = state.patients.find(p => p.uhid === patientUhid);
    const patientName = patient ? patient.name : 'Patient';

    state.auditLogs = state.auditLogs || [];
    state.auditLogs.unshift({
      timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) + " " + new Date().toLocaleDateString('en-US'),
      user: 'Admission Officer',
      action: 'Print Sticker',
      details: `Printed IPD ${stickerType} for ${patientName} on printer: ${printer}.`
    });

    const statusBox = document.getElementById('adm-print-status-box');
    if (statusBox) {
      statusBox.innerHTML = `
        <div style="background-color: var(--color-success-bg); color: var(--color-success); padding: 0.5rem; border-radius: 6px; font-size: 0.8rem; font-weight: bold; text-align: center; margin-top: 0.5rem;">
          🟢 Printed ${stickerType} successfully!
        </div>
      `;
      setTimeout(() => {
        statusBox.innerHTML = '';
      }, 3000);
    }
  };

  window.resetIpdAdmissionFlow = function() {
    // Reset form fields
    const form = document.getElementById('ipd-admission-single-form');
    if (form) form.reset();

    // Reset autocomplete selections and custom values
    patientSelect.value = '';
    patientSearchInput.value = '';
    bedSelect.innerHTML = `<option value="">-- Choose Bed --</option>`;
    renderGraphicalBedBoard('');

    // Reset checklists & inputs
    consentFile.disabled = true;
    const consentFileStatus = document.getElementById('consent-file-status');
    if (consentFileStatus) consentFileStatus.innerHTML = 'No consent uploaded';
    
    advanceAmountInput.disabled = true;
    const totalPaidDisplay = document.getElementById('chk-total-paid-display');
    if (totalPaidDisplay) {
      totalPaidDisplay.textContent = '₹0';
      totalPaidDisplay.style.color = 'var(--text-muted)';
    }
    const statusBadge = document.getElementById('chk-billing-status-badge');
    if (statusBadge) {
      statusBadge.textContent = 'Pending';
      statusBadge.className = 'badge badge-secondary';
    }
    const advanceStatus = document.getElementById('advance-deposit-status');
    if (advanceStatus) advanceStatus.textContent = '';
    
    attNameInput.disabled = true;
    attRelationInput.disabled = true;
    attPhoneInput.disabled = true;
    attIdInput.disabled = true;
    emerNameInput.disabled = true;
    emerRelationInput.disabled = true;
    emerPhoneInput.disabled = true;

    // Reset checklists display sections
    const idArea = document.getElementById('chk-id-status-area');
    if (idArea) {
      idArea.innerHTML = `<span style="color: var(--text-muted); font-style: italic;">Select a patient to verify ID status...</span>`;
    }
    const insuranceArea = document.getElementById('chk-insurance-status-area');
    if (insuranceArea) {
      insuranceArea.innerHTML = `<span style="color: var(--text-muted); font-style: italic;">Select a patient to verify insurance...</span>`;
    }

    // Reset local cache variables
    window.initialTotalPaid = 0;
    window.tempAdvancePaid = 0;

    // Trigger update previews to show blank states
    updateRealTimePreviews();

    // Show Step 1, Hide Step 2
    document.getElementById('ipd-step-2').style.display = 'none';
    document.getElementById('ipd-step-1').style.display = 'block';
  };
};
