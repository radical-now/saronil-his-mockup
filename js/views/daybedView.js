/* ==========================================================================
   SARONIL HMS - DAY CARE WORKFLOW VIEW (daybedView.js)
   ========================================================================== */

// Initialize Daycare Admissions State if not present
if (!window.state.daycareAdmissions) {
  const cached = localStorage.getItem('saronil_daycare_admissions');
  window.state.daycareAdmissions = cached ? JSON.parse(cached) : [];
}

window.saveDaycareState = function() {
  localStorage.setItem('saronil_daycare_admissions', JSON.stringify(window.state.daycareAdmissions));
};

// Global view container
window.views.daybed = function(container, subAnchor, params) {
  // Track selected daycare bed internally
  if (!window.selectedDaycareBed) {
    window.selectedDaycareBed = 'DC-B1'; // Default selection
  }

  // Active role
  const role = window.state?.activeUserRole || 'Administrator';
  
  // Get active daycare beds from global state
  const daycareWard = state.wards['DAYCARE'] || { name: "Daycare Unit", beds: [], price: 1500 };
  const daycareBeds = daycareWard.beds;

  // Retrieve admission for selected bed
  const activeAdmissions = window.state.daycareAdmissions || [];
  const currentBedAdmission = activeAdmissions.find(a => a.bedId === window.selectedDaycareBed && a.status !== 'Cleared & Discharged');

  // Render Left Column: Daycare Bed Grid (IPD style)
  const renderBedsGridHTML = () => {
    let bedCardsHTML = '';
    
    daycareBeds.forEach(bedId => {
      const statusObj = state.bedsStatus[bedId] || { status: 'Available' };
      const isSelected = window.selectedDaycareBed === bedId;
      
      let statusClass = 'bed-available';
      if (statusObj.status === 'Occupied') statusClass = 'bed-occupied';
      else if (statusObj.status === 'Reserved') statusClass = 'bed-reserved';
      else if (statusObj.status === 'Vacated - Pending Housekeeping') statusClass = 'bed-housekeeping-pending';
      else if (statusObj.status === 'Housekeeping In Progress') statusClass = 'bed-housekeeping-progress';

      const adm = activeAdmissions.find(a => a.bedId === bedId && a.status !== 'Cleared & Discharged');
      const patientName = adm ? adm.patient.name : '';

      bedCardsHTML += `
        <div class="bed-card ${statusClass}" 
             style="cursor: pointer; position: relative; border-width: ${isSelected ? '3px' : '2px'}; border-color: ${isSelected ? 'var(--primary)' : ''}; box-shadow: ${isSelected ? '0 0 8px rgba(59, 130, 246, 0.4)' : ''};" 
             onclick="window.selectDaycareBed('${bedId}')">
          <div class="bed-card-top">
            <span class="bed-name" style="font-size:0.8rem;">${bedId}</span>
            <span class="bed-icon">🛌</span>
          </div>
          <span class="bed-status-text" style="font-size:0.6rem;">${statusObj.status}</span>
          ${patientName ? `<div class="bed-patient-name" style="font-size:0.7rem; font-weight:700; margin-top:0.25rem;" title="${patientName}">${patientName}</div>` : ''}
        </div>
      `;
    });

    return `
      <div style="background: var(--bg-surface-elevated); padding: 1rem; border-radius: 8px; border: 1px solid var(--border-color); display: flex; flex-direction: column; gap: 1rem;">
        <h4 style="margin: 0; font-weight: 700; color: var(--primary); font-size: 0.9rem; border-bottom: 1px solid var(--border-color); padding-bottom: 0.5rem;">🛌 Wards & Bed Grid</h4>
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.5rem;">
          ${bedCardsHTML}
        </div>
        
        <div style="border-top:1px solid var(--border-color); padding-top:0.5rem; font-size:0.68rem; color:var(--text-secondary); display:flex; flex-direction:column; gap:0.25rem;">
          <div style="display:flex; align-items:center; gap:0.35rem;"><div style="background-color: var(--color-success); width: 8px; height: 8px; border-radius: 2px;"></div> Available</div>
          <div style="display:flex; align-items:center; gap:0.35rem;"><div style="background-color: var(--color-purple); width: 8px; height: 8px; border-radius: 2px;"></div> Occupied</div>
          <div style="display:flex; align-items:center; gap:0.35rem;"><div style="background-color: #f59e0b; width: 8px; height: 8px; border-radius: 2px;"></div> Vacated / Cleaning</div>
        </div>
      </div>
    `;
  };

  window.selectDaycareBed = function(bedId) {
    window.selectedDaycareBed = bedId;
    window.views.daybed(container, subAnchor, params);
  };

  const renderDaycareAdmissionSuccessHTML = (adm) => {
    const p = adm.patient;
    const dateStr = new Date(adm.admissionTimestamp).toLocaleDateString() + ' · ' + new Date(adm.admissionTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    return `
      <div style="background: var(--bg-surface); padding: 1.25rem; border-radius: 8px; border: 1px solid var(--border-color); display: flex; flex-direction: column; gap: 1.25rem;">
        <!-- Success Banner -->
        <div style="background-color: var(--color-success-bg); border: 1px solid var(--color-success); border-radius: 8px; padding: 1.25rem; display: flex; align-items: center; gap: 1rem; width: 100%;">
          <span style="font-size: 2.25rem;">🟢</span>
          <div>
            <h4 style="color: var(--color-success); margin: 0 0 0.25rem 0; font-weight: 700;">Daycare Admission Successful & Bed Assigned</h4>
            <p style="margin: 0; font-size: 0.85rem; color: var(--text-secondary);">
              Patient <strong>${p.name}</strong> (UHID: <span>${p.uhid}</span>) has been successfully admitted. Bed <strong>${adm.bedId}</strong> is now officially occupied under <span>${adm.consultantName}</span> for <strong>${adm.procedureName}</strong>.
            </p>
          </div>
        </div>

        <!-- Previews & Identity Tags -->
        <div style="background: var(--bg-surface-elevated); padding: 1rem; border-radius: 8px; border: 1px solid var(--border-color); display: flex; flex-direction: column; gap: 0.75rem;">
          <h5 style="margin:0; font-weight:700; color:var(--primary); font-size:0.9rem;">🖨️ Daycare Identity Tags & Wristband</h5>
          <div style="display: flex; gap: 1rem; align-items: center; flex-wrap: wrap; margin-bottom: 0.5rem;">
            <div class="form-group" style="margin-bottom: 0; flex-grow: 1; max-width: 300px;">
              <label class="form-label" style="font-size: 0.78rem; margin-bottom: 0.25rem;">Select Printer</label>
              <select id="daycare-sticker-printer" class="form-select" style="font-size: 0.78rem; height: 30px; padding: 2px 6px;">
                <option value="Daycare Thermal A">Wristband Printer (Daycare Unit)</option>
                <option value="Label Printer B">Label Printer B (Ward desk)</option>
              </select>
            </div>
            <button type="button" class="btn btn-primary" onclick="window.printAllDaycareStickers('${p.uhid}')" style="height: 32px; padding: 0 1.25rem; font-weight: 700; font-size: 0.8rem; margin-top: 1.2rem; cursor: pointer; display: flex; align-items: center; gap: 0.4rem;">🖨️ Print All Tags</button>
          </div>
          <div id="daycare-print-status" style="font-size: 0.75rem; color: var(--color-success); font-weight: 600;"></div>
        </div>

        <!-- Sticker Previews -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1rem;">
          <!-- Wristband -->
          <div class="sticker-card" style="padding: 0.85rem; border-radius: 6px; box-shadow: var(--shadow-sm); font-size: 0.75rem; background: #fafaf9; color: #0c0a09; border: 2px solid #1c1917; font-family: 'Courier New', Courier, monospace; display: flex; flex-direction: column; gap: 0.4rem; position: relative;">
            <div style="font-size: 0.6rem; font-weight: bold; border-bottom: 1px dashed #1c1917; padding-bottom: 0.2rem; display: flex; justify-content: space-between; color: #1c1917;">
              <span>DAYCARE WRISTBAND</span>
              <span>SARONIL HMS</span>
            </div>
            <div style="font-size: 0.8rem; font-weight: bold; margin-top: 0.2rem; color: #1c1917;">${p.name}</div>
            <div style="font-size: 0.65rem; color: #444; line-height: 1.2;">
              UHID: ${p.uhid} · ${p.age}Y / ${p.gender}<br>
              Bed: ${adm.bedId} · ${adm.ward}<br>
              Doc: ${adm.consultantName}
            </div>
            <div style="height: 20px; margin: 0.15rem 0; background: repeating-linear-gradient(90deg, #1c1917, #1c1917 2px, #fafaf9 2px, #fafaf9 5px); width: 100%;"></div>
            <div style="font-size: 0.6rem; border-top: 1px dashed #1c1917; padding-top: 0.2rem; display: flex; justify-content: space-between; align-items: center; color: #1c1917;">
              <span>Allergies: None</span>
              <button type="button" class="btn btn-sm btn-secondary" onclick="window.printSingleDaycareSticker('Wristband', '${p.uhid}')" style="font-size: 0.55rem; padding: 1px 4px; cursor: pointer;">Print</button>
            </div>
          </div>

          <!-- Specimen Label -->
          <div class="sticker-card" style="padding: 0.85rem; border-radius: 6px; box-shadow: var(--shadow-sm); font-size: 0.75rem; background: #fafaf9; color: #0c0a09; border: 2px solid #1c1917; font-family: 'Courier New', Courier, monospace; display: flex; flex-direction: column; gap: 0.4rem; position: relative;">
            <div style="font-size: 0.6rem; font-weight: bold; border-bottom: 1px dashed #1c1917; padding-bottom: 0.2rem; display: flex; justify-content: space-between; color: #1c1917;">
              <span>DAYCARE LAB SPECIMEN</span>
              <span>LIS-LABEL</span>
            </div>
            <div style="font-size: 0.8rem; font-weight: bold; margin-top: 0.2rem; color: #1c1917;">${p.name}</div>
            <div style="font-size: 0.65rem; color: #444; line-height: 1.2;">
              UHID: ${p.uhid} · Bed: ${adm.bedId}<br>
              Procedure: ${adm.procedureName}<br>
              Date: ${dateStr}
            </div>
            <div style="height: 20px; margin: 0.15rem 0; background: repeating-linear-gradient(90deg, #1c1917, #1c1917 2px, #fafaf9 2px, #fafaf9 5px); width: 100%;"></div>
            <div style="font-size: 0.6rem; border-top: 1px dashed #1c1917; padding-top: 0.2rem; display: flex; justify-content: space-between; align-items: center; color: #1c1917;">
              <span>Sample: BLOOD / VACUTAINER</span>
              <button type="button" class="btn btn-sm btn-secondary" onclick="window.printSingleDaycareSticker('Specimen', '${p.uhid}')" style="font-size: 0.55rem; padding: 1px 4px; cursor: pointer;">Print</button>
            </div>
          </div>
        </div>

        <!-- Proceed Button -->
        <div style="display: flex; justify-content: flex-end; border-top: 1px solid var(--border-color); padding-top: 1rem; margin-top: 0.5rem;">
          <button type="button" class="btn btn-primary" style="width: 100%; font-weight: 700; cursor: pointer;" onclick="window.completeDaycareAdmissionFlow()">Complete Admission & Proceed to Care Flow ➡️</button>
        </div>
      </div>
    `;
  };

  // --------------------------------------------------------------------------
  // RIGHT COL CONTENT RENDERING based on Bed Status & Progress State
  // --------------------------------------------------------------------------
  const renderRightPaneHTML = () => {
    const statusObj = state.bedsStatus[window.selectedDaycareBed] || { status: 'Available' };
    
    // RENDER SUCCESS SCREEN IF NEWLY ADMITTED
    if (window.daycareAdmissionStep === 'success' && window.newlyAdmittedDaycareBed === window.selectedDaycareBed) {
      const adm = activeAdmissions.find(a => a.bedId === window.selectedDaycareBed && a.status !== 'Cleared & Discharged');
      if (adm) {
        return renderDaycareAdmissionSuccessHTML(adm);
      }
    }

    // RENDER REGISTRATION FOR AVAILABLE BEDS (Screen 1 & 2 Combined)
    if (statusObj.status === 'Available' || !currentBedAdmission) {
      return `
        <div style="background: var(--bg-surface); padding: 1.25rem; border-radius: 8px; border: 1px solid var(--border-color); display: flex; flex-direction: column; gap: 1rem;">
          <h4 style="margin: 0; font-weight: 700; color: var(--primary); font-size: 0.95rem; border-bottom: 1px solid var(--border-color); padding-bottom: 0.5rem;">
            📝 Admit Patient on Bed: ${window.selectedDaycareBed}
          </h4>
          
          <div class="form-group" style="position: relative;">
            <label class="form-label">Search Patient (Pre-fill)</label>
            <input type="text" id="reg-search" class="form-control" placeholder="Type name, mobile, or UHID..." oninput="window.lookupExistingReg(this.value)">
            <div id="reg-search-results" style="background:var(--bg-surface-elevated); max-height: 150px; overflow-y: auto; border: 1px solid var(--border-color); display: none; margin-top: 0.25rem; border-radius: 4px; z-index:100; position:absolute; width: 100%;"></div>
          </div>
          
          <form id="daycare-reg-form" onsubmit="event.preventDefault(); window.saveDaycareRegistration();">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem;">
              <div class="form-group">
                <label class="form-label">Full Name</label>
                <input type="text" id="reg-name" class="form-control" required>
              </div>
              <div class="form-group">
                <label class="form-label">Age (Years)</label>
                <input type="number" id="reg-age" class="form-control" min="0" max="120" required>
              </div>
              <div class="form-group">
                <label class="form-label">Gender</label>
                <select id="reg-sex" class="form-select" required>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Mobile Number</label>
                <input type="tel" id="reg-mobile" class="form-control" required>
              </div>
              <div class="form-group" style="grid-column: span 2;">
                <label class="form-label">Address</label>
                <input type="text" id="reg-address" class="form-control" required>
              </div>
              <div class="form-group">
                <label class="form-label">Next of Kin Name</label>
                <input type="text" id="reg-nok-name" class="form-control" required>
              </div>
              <div class="form-group">
                <label class="form-label">NOK Mobile</label>
                <input type="tel" id="reg-nok-mobile" class="form-control" required>
              </div>
              <div class="form-group">
                <label class="form-label">Insurance?</label>
                <select id="reg-insurance" class="form-select" onchange="window.toggleRegInsuranceFields(this.value)" required>
                  <option value="No">No</option>
                  <option value="Yes">Yes</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Consultant Doctor</label>
                <select id="alloc-doc" class="form-select">
                  <option value="Dr. Amit Verma">Dr. Amit Verma (Pediatrics)</option>
                  <option value="Dr. Neha Sharma">Dr. Neha Sharma (Obstetrics)</option>
                  <option value="Dr. Rajesh Patel">Dr. Rajesh Patel (Psychiatry)</option>
                </select>
              </div>
              <div class="form-group" style="grid-column: span 2;">
                <label class="form-label">Procedure Name</label>
                <select id="alloc-proc" class="form-select">
                  <option value="Minor Debridement & Dressing">Minor Debridement & Dressing</option>
                  <option value="Chemotherapy Infusion">Chemotherapy Infusion</option>
                  <option value="Endoscopy Scope Evaluation">Endoscopy Scope Evaluation</option>
                  <option value="Intravenous Injection Session">Intravenous Injection Session</option>
                  <option value="Biopsy Sample Collection">Biopsy Sample Collection</option>
                </select>
              </div>
            </div>
            
            <div id="reg-insurance-fields" style="display: none; grid-template-columns: 1fr 1fr; gap: 0.75rem; margin-top: 0.5rem; background: var(--bg-surface-elevated); padding: 0.75rem; border-radius: 6px;">
              <div class="form-group" style="margin:0;">
                <label class="form-label">Policy Number</label>
                <input type="text" id="reg-policy" class="form-control">
              </div>
              <div class="form-group" style="margin:0;">
                <label class="form-label">TPA / Insurer Name</label>
                <input type="text" id="reg-tpa" class="form-control" placeholder="e.g. Star Health">
              </div>
            </div>

            <div style="display: flex; justify-content: flex-end; gap: 0.5rem; margin-top: 1rem;">
              <button type="submit" class="btn btn-primary" style="width:100%; font-weight:700;">Confirm Daycare Admission</button>
            </div>
          </form>
        </div>
      `;
    }

    // IF OCCUPIED: Render Progressive Workflow Form Desk directly in the panel
    const getWorkflowStageHTML = () => {
      const stages = [
        { label: 'Checklist', status: 'Registered' },
        { label: 'Orders', status: 'Pre-op Checklist Done' },
        { label: 'Nurse Board', status: 'Orders Saved' },
        { label: 'Post-op Vitals', status: 'Tasks Updated' },
        { label: 'Discharge', status: 'Post-op Monitored' },
        { label: 'Billing', status: 'Discharge Ordered' }
      ];

      return `
        <div style="display: flex; justify-content: space-between; align-items: center; background: var(--bg-surface-elevated); padding: 0.5rem 0.75rem; border-radius: 6px; font-size: 0.7rem; margin-bottom: 1rem; border: 1px solid var(--border-color);">
          ${stages.map((st, i) => {
            const isCompleted = activeAdmissions.some(a => a.bedId === window.selectedDaycareBed && a.historyLogs.some(l => l.action.includes(st.label)));
            const isActive = currentBedAdmission.status === st.status || (st.status === 'Tasks Updated' && currentBedAdmission.status === 'Tasks Updated');
            return `
              <div style="display: flex; align-items: center; gap: 0.25rem;">
                <span style="background: ${isActive ? 'var(--primary)' : (isCompleted ? '#10b981' : 'var(--border-color)')}; color: white; border-radius: 50%; width: 16px; height: 16px; display: inline-flex; align-items: center; justify-content: center; font-weight: 700;">${i+1}</span>
                <span style="font-weight: ${isActive ? '700' : '500'}; color: ${isActive ? 'var(--text-primary)' : 'var(--text-secondary)'};">${st.label}</span>
              </div>
            `;
          }).join(' → ')}
        </div>
      `;
    };

    // Render active form desk content progresively
    const renderActiveWorkflowFormHTML = () => {
      const status = currentBedAdmission.status;

      // 1. STAGE: REGISTERED -> RENDER PRE-OP CHECKLIST FORM
      if (status === 'Registered') {
        return `
          <form id="daycare-preop-form" onsubmit="event.preventDefault(); window.savePreProcedureChecklist('${currentBedAdmission.patient.uhid}');" style="display:flex; flex-direction:column; gap:0.75rem;">
            <h5 style="margin:0; font-weight:700; color:var(--primary); font-size:0.9rem;">📋 Step 1: Pre-Procedure Checklist Form</h5>
            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:0.5rem;">
              <div class="form-group">
                <label class="form-label">BP (mmHg)</label>
                <input type="text" id="pre-bp" class="form-control" placeholder="e.g. 120/80" required>
              </div>
              <div class="form-group">
                <label class="form-label">Pulse (bpm)</label>
                <input type="number" id="pre-pulse" class="form-control" placeholder="e.g. 72" required>
              </div>
              <div class="form-group">
                <label class="form-label">SpO2 (%)</label>
                <input type="number" id="pre-spo2" class="form-control" placeholder="e.g. 98" required>
              </div>
              <div class="form-group">
                <label class="form-label">Temp (F)</label>
                <input type="text" id="pre-temp" class="form-control" placeholder="e.g. 98.6" required>
              </div>
              <div class="form-group">
                <label class="form-label">Weight (kg)</label>
                <input type="number" id="pre-weight" class="form-control" placeholder="e.g. 70" required>
              </div>
            </div>

            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:0.5rem;">
              <div class="form-group">
                <label class="form-label">Fasting Status</label>
                <select id="pre-fasting" class="form-select" onchange="window.toggleFastingHours(this.value)" required>
                  <option value="No">No</option>
                  <option value="Yes">Yes</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Fasting Hours</label>
                <input type="number" id="pre-fasting-hours" class="form-control" value="0" disabled>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Consent Obtained?</label>
              <select id="pre-consent" class="form-select" required>
                <option value="No">No</option>
                <option value="Yes">Yes</option>
              </select>
            </div>

            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:0.5rem;">
              <div class="form-group">
                <label class="form-label">Allergy Flag</label>
                <select id="pre-allergy" class="form-select" onchange="window.toggleAllergyDetails(this.value)" required>
                  <option value="None">None</option>
                  <option value="Yes">Yes</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Allergy Details</label>
                <input type="text" id="pre-allergy-text" class="form-control" placeholder="Drug/food details..." disabled>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Pre-existing Conditions</label>
              <textarea id="pre-existing" class="form-control" rows="2" placeholder="e.g. Hypertension, Diabetes, None"></textarea>
            </div>

            <button type="submit" class="btn btn-primary" style="font-weight:700;">Submit Checklist & Lock</button>
          </form>
        `;
      }

      // 2. STAGE: PRE-OP CHECKLIST DONE -> RENDER DOCTOR ORDERS FORM
      if (status === 'Pre-op Checklist Done') {
        if (role !== 'Doctor' && role !== 'Administrator') {
          return `
            <div style="text-align:center; padding:2rem; color:var(--text-secondary);">
              <span style="font-size:2rem; display:block;">🔒</span>
              <p style="margin:0.5rem 0 0 0; font-weight:600;">Doctor orders panel is locked for Nurse/Billing profiles. Log in as a Doctor to record medication or lab orders.</p>
            </div>
          `;
        }

        // Initialize local collections
        if (!window.currentOrders) {
          window.currentOrders = { labs: [], meds: [], note: '', procedureCode: currentBedAdmission.procedureName };
        }

        return `
          <div style="display:flex; flex-direction:column; gap:0.75rem; text-align:left;">
            <h5 style="margin:0; font-weight:700; color:var(--primary); font-size:0.9rem;">📝 Step 2: Log Doctor Orders & Directives</h5>
            
            <div style="display:flex; border-bottom: 1px solid var(--border-color); margin-bottom: 0.5rem;">
              <button class="btn btn-secondary active" id="tab-lab-btn" style="flex:1; border-radius:0; border:none; border-bottom:2px solid var(--primary); padding:0.4rem;" onclick="window.switchOrdersTab('lab')">Lab Orders</button>
              <button class="btn btn-secondary" id="tab-med-btn" style="flex:1; border-radius:0; border:none; padding:0.4rem;" onclick="window.switchOrdersTab('med')">Medications</button>
              <button class="btn btn-secondary" id="tab-note-btn" style="flex:1; border-radius:0; border:none; padding:0.4rem;" onclick="window.switchOrdersTab('note')">Procedure Note</button>
            </div>

            <!-- LABS TAB -->
            <div id="pane-tab-lab" style="display:block; position:relative;">
              <div class="form-group" style="margin:0;">
                <label class="form-label">Search Lab Tests</label>
                <input type="text" id="order-lab-search" class="form-control" placeholder="Type test name e.g. CBC..." oninput="window.searchLabTestsOrder(this.value)">
                <div id="order-lab-matches" style="background:var(--bg-surface-elevated); max-height: 150px; overflow-y: auto; border: 1px solid var(--border-color); display: none; margin-top: 0.25rem; border-radius: 4px; position:absolute; width:100%; z-index:10;"></div>
              </div>
              <div id="ordered-labs-list" style="margin-top:0.5rem; display:flex; flex-direction:column; gap:0.25rem;"></div>
            </div>

            <!-- MEDS TAB -->
            <div id="pane-tab-med" style="display:none;">
              <div style="display:grid; grid-template-columns: 1.5fr 1fr 1fr 1fr; gap:0.4rem; align-items:end; margin-bottom:0.5rem;">
                <div class="form-group" style="margin:0;">
                  <label class="form-label">Drug Name</label>
                  <input type="text" id="ord-med-name" class="form-control" placeholder="e.g. Dolo 650mg">
                </div>
                <div class="form-group" style="margin:0;">
                  <label class="form-label">Dose</label>
                  <input type="text" id="ord-med-dose" class="form-control" placeholder="1 tab">
                </div>
                <div class="form-group" style="margin:0;">
                  <label class="form-label">Route</label>
                  <select id="ord-med-route" class="form-select" style="padding:0 0.5rem;">
                    <option value="Oral">Oral</option>
                    <option value="IV">IV</option>
                    <option value="IM">IM</option>
                    <option value="SC">SC</option>
                  </select>
                </div>
                <div class="form-group" style="margin:0;">
                  <label class="form-label">Freq</label>
                  <input type="text" id="ord-med-freq" class="form-control" placeholder="TDS">
                </div>
              </div>
              <button class="btn btn-secondary btn-xs" onclick="window.addMedicationToOrder()">+ Add Medication</button>
              <div id="ordered-meds-list" style="margin-top:0.5rem; display:flex; flex-direction:column; gap:0.25rem;"></div>
            </div>

            <!-- NOTE TAB -->
            <div id="pane-tab-note" style="display:none;">
              <div class="form-group" style="margin-bottom:0.5rem;">
                <label class="form-label">Planned Procedure</label>
                <input type="text" class="form-control" value="${currentBedAdmission.procedureName}" readonly style="background:var(--bg-surface-elevated);">
              </div>
              <div class="form-group" style="margin:0;">
                <label class="form-label">Procedure Clinical Notes</label>
                <textarea id="ord-procedure-note" class="form-control" rows="3" placeholder="Enter clinical notes..."></textarea>
              </div>
            </div>

            <div style="margin-top:1rem; border-top:1px solid var(--border-color); padding-top:0.75rem; display:flex; justify-content:space-between; align-items:center;">
              ${currentBedAdmission.patient.insurance === 'Yes' ? `
                <div style="display:flex; align-items:center; gap:0.35rem;">
                  <input type="checkbox" id="preauth-checked">
                  <label for="preauth-checked" style="margin:0; font-size:0.75rem; font-weight:600; cursor:pointer;">Pre-Auth (TPA: ${currentBedAdmission.patient.tpaName})</label>
                </div>
              ` : '<div></div>'}
              <button class="btn btn-primary" onclick="window.saveDoctorOrders('${currentBedAdmission.patient.uhid}')">Dispatch Orders</button>
            </div>
          </div>
        `;
      }

      // 3. STAGE: ORDERS SAVED -> RENDER NURSE TASK LIST & RECOVERY CHECK
      if (status === 'Orders Saved' || status === 'Tasks Updated') {
        return `
          <div style="display:flex; flex-direction:column; gap:0.75rem;">
            <h5 style="margin:0; font-weight:700; color:var(--primary); font-size:0.9rem;">⚙️ Step 3: Nurse Task Board & Recovery Checks</h5>
            
            <div style="display:flex; flex-direction:column; gap:0.4rem; background:var(--bg-surface-elevated); padding:0.6rem; border-radius:6px; border:1px solid var(--border-color);">
              <span style="font-weight:700; font-size:0.78rem; display:block; border-bottom:1px solid var(--border-color); padding-bottom:0.25rem; margin-bottom:0.25rem;">Active Care Tasks Checklist</span>
              ${(currentBedAdmission.tasks || []).map(t => `
                <div style="display:flex; justify-content:space-between; align-items:center; font-size:0.75rem; padding:0.2rem 0;">
                  <span style="${t.completed ? 'text-decoration: line-through; opacity:0.6;' : ''}"><strong>${t.name}</strong></span>
                  <button class="btn ${t.completed ? 'btn-secondary' : 'btn-primary'} btn-xs" style="padding:1px 6px;" onclick="window.toggleNurseTaskCompleted('${currentBedAdmission.patient.uhid}', '${t.id}')">
                    ${t.completed ? '✓' : 'Mark'}
                  </button>
                </div>
              `).join('')}
            </div>

            <div class="form-group" style="margin-bottom:0.5rem;">
              <label class="form-label">Nursing Observation Logs</label>
              <textarea id="nurse-notes-field" class="form-control" rows="2" placeholder="Patient status notes...">${currentBedAdmission.nursingNotes || ''}</textarea>
            </div>
            
            <button class="btn btn-secondary btn-sm" style="margin-bottom:0.5rem;" onclick="window.saveNurseTasksNotes('${currentBedAdmission.patient.uhid}')">Save Nurse Notes</button>

            <!-- POST-PROCEDURE RECOVERY VITALS -->
            <hr style="border:0; border-top:1px solid var(--border-color); margin:0.25rem 0;">
            <form id="daycare-postop-form" onsubmit="event.preventDefault(); window.savePostProcedureMonitoring('${currentBedAdmission.patient.uhid}');" style="display:flex; flex-direction:column; gap:0.5rem;">
              <span style="font-weight:700; font-size:0.78rem; color:var(--primary);">Post-Procedure Vitals & Condition</span>
              <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.4rem;">
                <div class="form-group" style="margin:0;">
                  <label class="form-label">BP (mmHg)</label>
                  <input type="text" id="post-bp" class="form-control" placeholder="118/78" required>
                </div>
                <div class="form-group" style="margin:0;">
                  <label class="form-label">Pulse (bpm)</label>
                  <input type="number" id="post-pulse" class="form-control" placeholder="74" required>
                </div>
                <div class="form-group" style="margin:0;">
                  <label class="form-label">SpO2 (%)</label>
                  <input type="number" id="post-spo2" class="form-control" placeholder="99" required>
                </div>
                <div class="form-group" style="margin:0;">
                  <label class="form-label">Temp (F)</label>
                  <input type="text" id="post-temp" class="form-control" placeholder="98.4" required>
                </div>
              </div>
              <div class="form-group" style="margin:0;">
                <label class="form-label">Recovery Condition</label>
                <select id="post-condition" class="form-select">
                  <option value="Stable">Stable</option>
                  <option value="Guarded">Guarded</option>
                  <option value="Poor">Poor</option>
                </select>
              </div>
              <div class="form-group" style="margin:0;">
                <label class="form-label">Clinical Recovery Notes</label>
                <textarea id="post-notes" class="form-control" rows="2" placeholder="Stable vitals, active reflexes..."></textarea>
              </div>
              <button type="submit" class="btn btn-success" style="font-weight:700;">Submit Recovery Vitals</button>
            </form>
          </div>
        `;
      }

      // 4. STAGE: POST-OP MONITORED -> RENDER DOCTOR DISCHARGE FORM
      if (status === 'Post-op Monitored') {
        if (role !== 'Doctor' && role !== 'Administrator') {
          return `
            <div style="text-align:center; padding:2rem; color:var(--text-secondary);">
              <span style="font-size:2rem; display:block;">🔒</span>
              <p style="margin:0.5rem 0 0 0; font-weight:600;">Discharge orders are locked for Nurse/Billing profiles. Log in as a Doctor to issue discharge directives.</p>
            </div>
          `;
        }

        return `
          <form id="daycare-discharge-form" onsubmit="event.preventDefault(); window.saveDischargeOrder('${currentBedAdmission.patient.uhid}');" style="display:flex; flex-direction:column; gap:0.75rem;">
            <h5 style="margin:0; font-weight:700; color:var(--primary); font-size:0.9rem;">🛑 Step 4: Issue Doctor Discharge Directive</h5>
            
            <div style="background:var(--bg-surface-elevated); padding:0.6rem; border-radius:6px; font-size:0.75rem; border:1px solid var(--border-color); display:grid; grid-template-columns:1fr 1fr; gap:0.25rem;">
              <div><strong>Procedure:</strong> ${currentBedAdmission.procedureName}</div>
              <div><strong>Recovery:</strong> ${currentBedAdmission.postopCheck?.condition || 'Stable'}</div>
              <div><strong>Pre-Op:</strong> BP ${currentBedAdmission.checklist?.bp} | SpO2 ${currentBedAdmission.checklist?.spo2}%</div>
              <div><strong>Post-Op:</strong> BP ${currentBedAdmission.postopCheck?.bp} | SpO2 ${currentBedAdmission.postopCheck?.spo2}%</div>
            </div>

            <div class="form-group" style="margin:0;">
              <label class="form-label">Discharge & Care Instructions</label>
              <textarea id="discharge-instr" class="form-control" rows="3" placeholder="Rest at home, Tab Dolo 650mg SOS..." required></textarea>
            </div>

            <div class="form-group" style="margin:0;">
              <label class="form-label">Follow-up Consult Date</label>
              <input type="date" id="discharge-followup" class="form-control" required value="${new Date(Date.now() + 7*24*60*60*1000).toISOString().split('T')[0]}">
            </div>

            <button type="submit" class="btn btn-primary" style="background:#ef4444; font-weight:700; border:none;">Submit Discharge & Clearances</button>
          </form>
        `;
      }

      // 5. STAGE: DISCHARGE ORDERED -> RENDER CLEARANCES & BILLING PAYMENTS
      if (status === 'Discharge Ordered' || status === 'Billing Cleared') {
        const allCleared = currentBedAdmission.clearances?.nursing?.cleared &&
                           currentBedAdmission.clearances?.pharmacy?.cleared &&
                           currentBedAdmission.clearances?.billing?.cleared;

        const bedCharge = 1500;
        const procCharge = currentBedAdmission.procedureName === 'Chemotherapy Infusion' ? 8000 : 3500;
        
        let medsTotal = 0;
        const medsItems = (currentBedAdmission.orders?.meds || []).map(m => {
          medsTotal += m.rate || 120;
          return { desc: `Medication: ${m.drugName}`, rate: m.rate || 120 };
        });

        let labsTotal = 0;
        const labsItems = (currentBedAdmission.orders?.labs || []).map(l => {
          labsTotal += l.rate || 500;
          return { desc: `Laboratory: ${l.name}`, rate: l.rate || 500 };
        });

        const grossTotal = bedCharge + procCharge + medsTotal + labsTotal + 500;
        const insuranceDeduction = currentBedAdmission.patient.insurance === 'Yes' ? Math.floor(grossTotal * 0.85) : 0;
        
        window.activeBillingInfo = {
          uhid: currentBedAdmission.patient.uhid,
          bedCharge,
          procCharge,
          medsTotal,
          labsTotal,
          consumables: 500,
          grossTotal,
          insuranceDeduction,
          discount: 0,
          netPayable: grossTotal - insuranceDeduction
        };

        return `
          <div style="display:flex; flex-direction:column; gap:0.75rem; text-align:left;">
            <h5 style="margin:0; font-weight:700; color:var(--primary); font-size:0.9rem;">💳 Step 5: clearances & billing desk</h5>
            
            <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:0.4rem; margin-bottom:0.25rem;">
              <div class="clearance-tile ${currentBedAdmission.clearances?.nursing?.cleared ? 'cleared' : 'pending'}" style="padding:0.4rem;" onclick="window.toggleDepartmentClearance('${currentBedAdmission.patient.uhid}', 'nursing')">
                <strong>Nurse</strong><br>
                <small style="font-size:0.65rem;">${currentBedAdmission.clearances?.nursing?.cleared ? 'Cleared ✓' : 'Pending'}</small>
              </div>
              <div class="clearance-tile ${currentBedAdmission.clearances?.pharmacy?.cleared ? 'cleared' : 'pending'}" style="padding:0.4rem;" onclick="window.toggleDepartmentClearance('${currentBedAdmission.patient.uhid}', 'pharmacy')">
                <strong>Pharmacy</strong><br>
                <small style="font-size:0.65rem;">${currentBedAdmission.clearances?.pharmacy?.cleared ? 'Cleared ✓' : 'Pending'}</small>
              </div>
              <div class="clearance-tile ${currentBedAdmission.clearances?.billing?.cleared ? 'cleared' : 'pending'}" style="padding:0.4rem;" onclick="window.toggleDepartmentClearance('${currentBedAdmission.patient.uhid}', 'billing')">
                <strong>Billing</strong><br>
                <small style="font-size:0.65rem;">${currentBedAdmission.clearances?.billing?.cleared ? 'Cleared ✓' : 'Pending'}</small>
              </div>
            </div>

            <table style="width:100%; font-size:0.75rem; border-collapse:collapse; margin-bottom:0.5rem; background:var(--bg-surface-elevated); padding:0.5rem; border-radius:6px; border:1px solid var(--border-color);">
              <tbody>
                <tr style="border-bottom:1px solid var(--border-color); font-weight:600;"><td style="padding:0.25rem;">Description</td><td style="text-align:right; padding:0.25rem;">Charge</td></tr>
                <tr><td style="padding:0.15rem 0.25rem;">Room Rent (${currentBedAdmission.bedNo})</td><td style="text-align:right; padding:0.15rem 0.25rem;">₹${bedCharge}</td></tr>
                <tr><td style="padding:0.15rem 0.25rem;">Procedure (${currentBedAdmission.procedureName})</td><td style="text-align:right; padding:0.15rem 0.25rem;">₹${procCharge}</td></tr>
                ${medsItems.map(m => `<tr><td style="padding:0.15rem 0.25rem;">${m.desc}</td><td style="text-align:right; padding:0.15rem 0.25rem;">₹${m.rate}</td></tr>`).join('')}
                ${labsItems.map(l => `<tr><td style="padding:0.15rem 0.25rem;">${l.desc}</td><td style="text-align:right; padding:0.15rem 0.25rem;">₹${l.rate}</td></tr>`).join('')}
                <tr><td style="padding:0.15rem 0.25rem;">Consumables & Syringes</td><td style="text-align:right; padding:0.15rem 0.25rem;">₹500</td></tr>
                <tr style="border-top:1px solid var(--border-color); font-weight:700;">
                  <td style="padding:0.25rem;">Gross Total</td>
                  <td style="text-align:right; padding:0.25rem;">₹${grossTotal}</td>
                </tr>
                ${currentBedAdmission.patient.insurance === 'Yes' ? `
                  <tr style="color:#059669;">
                    <td style="padding:0.15rem 0.25rem;">Insurance Pre-Auth (85%)</td>
                    <td style="text-align:right; padding:0.15rem 0.25rem;">- ₹${insuranceDeduction}</td>
                  </tr>
                ` : ''}
                <tr style="color:#2563eb;">
                  <td style="padding:0.15rem 0.25rem;">Apply Discount (%)</td>
                  <td style="text-align:right; padding:0.15rem 0.25rem;">
                    <input type="number" id="bill-discount-input" style="width:60px; height:20px; text-align:right;" value="0" min="0" max="100" oninput="window.recalcNetBillTotal(${grossTotal}, ${insuranceDeduction}, this.value)">
                  </td>
                </tr>
                <tr style="border-top:2px solid var(--border-color); font-weight:800;">
                  <td style="padding:0.25rem;">Net Payable</td>
                  <td style="text-align:right; padding:0.25rem;" id="bill-net-total-display">₹${grossTotal - insuranceDeduction}</td>
                </tr>
              </tbody>
            </table>
            
            <div style="display:flex; justify-content:space-between; align-items:center; gap:0.5rem;">
              <select id="bill-paymode" class="form-select" style="width:140px; height:32px;">
                <option value="Cash">Cash</option>
                <option value="Card">Card</option>
                <option value="UPI">UPI</option>
                <option value="Insurance Claim">Insurance Claim</option>
              </select>
              
              <button class="btn btn-primary btn-sm" id="bill-pay-btn" 
                      ${allCleared ? '' : 'disabled style="opacity:0.5; cursor:not-allowed;"'}
                      onclick="window.processDaycarePayment('${currentBedAdmission.patient.uhid}')">
                ${allCleared ? '💳 Complete Discharge Bill' : '🔒 Clear Departments'}
              </button>
            </div>
          </div>
        `;
      }
    };

    return `
      <div style="background: var(--bg-surface); padding: 1.25rem; border-radius: 8px; border: 1px solid var(--border-color); display: flex; flex-direction: column; gap: 1rem;">
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-color); padding-bottom: 0.5rem;">
          <h4 style="margin: 0; font-weight: 700;">👤 Inpatient: ${currentBedAdmission.patient.name} (${window.selectedDaycareBed})</h4>
          <span class="badge b-pu" style="text-transform: uppercase;">${currentBedAdmission.status}</span>
        </div>

        ${getWorkflowStageHTML()}

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; font-size: 0.75rem; background: var(--bg-surface-elevated); padding: 0.5rem 0.75rem; border-radius: 6px;">
          <div><strong>UHID:</strong> ${currentBedAdmission.patient.uhid}</div>
          <div><strong>Procedure:</strong> ${currentBedAdmission.procedureName}</div>
          <div><strong>Mobile:</strong> ${currentBedAdmission.patient.mobile}</div>
          <div><strong>Consultant:</strong> ${currentBedAdmission.consultantName}</div>
          <div><strong>NOK Name:</strong> ${currentBedAdmission.patient.nokName} (${currentBedAdmission.patient.nokMobile})</div>
          <div><strong>Insurance:</strong> ${currentBedAdmission.patient.insurance === 'Yes' ? `Yes (${currentBedAdmission.patient.tpaName})` : 'No'}</div>
        </div>

        <div style="border-top:1px solid var(--border-color); padding-top:0.75rem; margin-top:0.25rem;">
          ${renderActiveWorkflowFormHTML()}
        </div>
      </div>
    `;
  };

  // Render Left Column Bed Board + Right Column Stage Workspace
  container.innerHTML = `
    <style>
      .form-group { margin-bottom: 0.75rem; }
      .form-label { font-weight: 600; display: block; margin-bottom: 0.2rem; font-size: 0.8rem; }
      .form-select, .form-control { width: 100%; height: 32px; border-radius: 6px; border: 1px solid var(--border-color); padding: 0 0.5rem; font-size: 0.8rem; background: var(--bg-surface-elevated); color: var(--text-primary); }
      textarea.form-control { height: auto; padding: 0.4rem 0.5rem; }
      .daybed-panel-box { background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: 12px; min-height: 600px; display: flex; flex-direction: column; }
      .clearance-tile { border: 2px solid var(--border-color); border-radius: 8px; padding: 0.75rem; text-align: center; cursor: pointer; transition: all 0.2s ease; }
      .clearance-tile.cleared { border-color: #10b981; background: #ecfdf5; color: #065f46; }
      .clearance-tile.pending { border-color: #d97706; background: #fffbeb; color: #92400e; }
    </style>
    
    <div class="daybed-panel-box">
      <!-- Title & Info Header -->
      <div style="background-color: var(--primary-glow); padding: 1rem 1.25rem; border-bottom: 1px solid var(--border-color); border-top-left-radius: 12px; border-top-right-radius: 12px;">
        <h3 style="color: var(--primary); font-weight: 700; margin: 0; font-size: 1.15rem;">🛌 Daycare Unit Onboarding & Clinical Flow</h3>
        <p style="color: var(--text-secondary); margin: 0.25rem 0 0 0; font-size: 0.8rem;">Manage daycare registrations, assign beds, log clinical instructions, and process releases visually</p>
      </div>

      <!-- Split Grid Layout (Beds on Left, Workflow Form Desk on Right) -->
      <div style="display: grid; grid-template-columns: 320px 1fr; gap: 1.25rem; padding: 1.25rem; align-items: start; flex-grow: 1;">
        
        <!-- Left Panel: Wards & Bed Grid -->
        <div>
          ${renderBedsGridHTML()}
        </div>

        <!-- Right Panel: Dynamic Desk -->
        <div>
          ${renderRightPaneHTML()}
        </div>
      </div>
    </div>
  `;

  // --------------------------------------------------------------------------
  // REGISTRATION SUBMIT & PRE-FILL lookup (Screen 1 & 2)
  // --------------------------------------------------------------------------
  window.lookupExistingReg = function(query) {
    const resultsDiv = document.getElementById('reg-search-results');
    if (!resultsDiv) return;
    if (!query || query.length < 2) {
      resultsDiv.style.display = 'none';
      return;
    }

    const matches = window.state.patients.filter(p => 
      p.name.toLowerCase().includes(query.toLowerCase()) || 
      p.uhid.toLowerCase().includes(query.toLowerCase()) ||
      p.mobile.includes(query)
    );

    if (matches.length === 0) {
      resultsDiv.style.display = 'none';
      return;
    }

    resultsDiv.innerHTML = matches.map(p => `
      <div style="padding: 0.5rem; border-bottom: 1px solid var(--border-color); cursor: pointer; background: var(--bg-surface);" onclick="window.selectExistingRegPatient('${p.uhid}')">
        <strong>${p.name}</strong> (${p.gender}/${p.age} Yrs) <br>
        <small style="color:var(--text-muted)">UHID: ${p.uhid} | Mob: ${p.mobile}</small>
      </div>
    `).join('');
    resultsDiv.style.display = 'block';
  };

  window.selectExistingRegPatient = function(uhid) {
    const patient = window.state.patients.find(p => p.uhid === uhid);
    if (!patient) return;

    document.getElementById('reg-name').value = patient.name;
    document.getElementById('reg-age').value = patient.age;
    document.getElementById('reg-sex').value = patient.gender;
    document.getElementById('reg-mobile').value = patient.mobile;
    document.getElementById('reg-address').value = patient.address || 'New Delhi, India';
    document.getElementById('reg-nok-name').value = patient.nokName || 'Relative';
    document.getElementById('reg-nok-mobile').value = patient.nokMobile || patient.mobile;
    document.getElementById('reg-insurance').value = patient.insurance || 'No';
    window.toggleRegInsuranceFields(patient.insurance || 'No');
    if (patient.insurance === 'Yes') {
      document.getElementById('reg-policy').value = patient.policyNumber || '';
      document.getElementById('reg-tpa').value = patient.tpaName || '';
    }

    const resultsDiv = document.getElementById('reg-search-results');
    if (resultsDiv) resultsDiv.style.display = 'none';
  };

  window.toggleRegInsuranceFields = function(val) {
    const fields = document.getElementById('reg-insurance-fields');
    if (fields) {
      fields.style.display = val === 'Yes' ? 'grid' : 'none';
    }
  };

  window.saveDaycareRegistration = function() {
    const name = document.getElementById('reg-name').value;
    const age = parseInt(document.getElementById('reg-age').value);
    const gender = document.getElementById('reg-sex').value;
    const mobile = document.getElementById('reg-mobile').value;
    const address = document.getElementById('reg-address').value;
    const nokName = document.getElementById('reg-nok-name').value;
    const nokMobile = document.getElementById('reg-nok-mobile').value;
    const insurance = document.getElementById('reg-insurance').value;
    const policyNumber = insurance === 'Yes' ? document.getElementById('reg-policy').value : '';
    const tpaName = insurance === 'Yes' ? document.getElementById('reg-tpa').value : '';
    const docName = document.getElementById('alloc-doc').value;
    const procName = document.getElementById('alloc-proc').value;

    let patient = window.state.patients.find(p => p.mobile === mobile || p.name === name);
    if (!patient) {
      const randomId = Math.floor(100000 + Math.random() * 900000);
      const uhid = `UHID-${randomId}`;
      patient = {
        uhid, name, age, gender, mobile, address, nokName, nokMobile, insurance, policyNumber, tpaName,
        primaryConsultant: docName,
        status: "Day Care",
        type: "Daycare"
      };
      window.state.patients.push(patient);
    } else {
      patient.address = address;
      patient.nokName = nokName;
      patient.nokMobile = nokMobile;
      patient.insurance = insurance;
      patient.policyNumber = policyNumber;
      patient.tpaName = tpaName;
      patient.primaryConsultant = docName;
      patient.status = "Day Care";
      patient.type = "Daycare";
    }

    const bedId = window.selectedDaycareBed;
    if (state.bedsStatus[bedId]) {
      state.bedsStatus[bedId].status = 'Occupied';
      state.bedsStatus[bedId].patientUhid = patient.uhid;
      state.bedsStatus[bedId].notes = `Daycare Procedure: ${procName}`;
    }

    const admission = {
      patient,
      bedId: bedId,
      ward: 'Daycare Ward',
      bedNo: bedId,
      consultantName: docName,
      procedureName: procName,
      admissionType: 'Daycare',
      admissionTimestamp: new Date().toISOString(),
      status: 'Registered',
      historyLogs: [{ timestamp: new Date().toISOString(), action: 'Daycare Bed Allocated & Registered' }],
      tasks: [
        { id: 'vitals-1', name: 'Take Pre-Op Vitals (BP, pulse, SpO2, Temp)', completed: false },
        { id: 'meds-1', name: 'Verify Medication Dose and Frequency', completed: false },
        { id: 'postcheck-1', name: 'Post-procedure Site Assessment', completed: false }
      ]
    };

    window.state.daycareAdmissions.unshift(admission);
    window.saveDaycareState();
    
    if (state.bedAuditLogs) {
      state.bedAuditLogs.unshift({
        timestamp: new Date().toISOString(),
        bedId: bedId,
        ward: 'Daycare Ward',
        patientUhid: patient.uhid,
        action: 'Daycare Allotment',
        prevStatus: 'Available',
        newStatus: 'Occupied',
        operator: 'Admission Staff',
        remarks: `Procedure: ${procName}`
      });
    }

    window.daycareAdmissionStep = 'success';
    window.newlyAdmittedDaycareBed = bedId;
    window.views.daybed(container, subAnchor, params);
  };

  window.printAllDaycareStickers = function(uhid) {
    const printer = document.getElementById('daycare-sticker-printer').value;
    const statusEl = document.getElementById('daycare-print-status');
    if (statusEl) {
      statusEl.textContent = `🟢 Printed wristband & specimen label successfully on ${printer}!`;
    }
  };

  window.printSingleDaycareSticker = function(type, uhid) {
    const printer = document.getElementById('daycare-sticker-printer').value;
    const statusEl = document.getElementById('daycare-print-status');
    if (statusEl) {
      statusEl.textContent = `🟢 Printed ${type} tag successfully on ${printer}!`;
    }
  };

  window.completeDaycareAdmissionFlow = function() {
    window.daycareAdmissionStep = null;
    window.newlyAdmittedDaycareBed = null;
    window.views.daybed(container, subAnchor, params);
  };

  // --------------------------------------------------------------------------
  // DIALOG 3: PRE-PROCEDURE CHECKLIST (Screen 3)
  // --------------------------------------------------------------------------
  window.toggleFastingHours = function(val) {
    const input = document.getElementById('pre-fasting-hours');
    if (input) {
      input.disabled = val !== 'Yes';
      if (val !== 'Yes') input.value = 0;
    }
  };

  window.toggleAllergyDetails = function(val) {
    const input = document.getElementById('pre-allergy-text');
    if (input) {
      input.disabled = val !== 'Yes';
      if (val !== 'Yes') input.value = '';
    }
  };

  window.savePreProcedureChecklist = function(uhid) {
    const admission = window.state.daycareAdmissions.find(a => a.patient.uhid === uhid);
    if (!admission) return;

    admission.checklist = {
      bp: document.getElementById('pre-bp').value,
      pulse: parseInt(document.getElementById('pre-pulse').value),
      spo2: parseInt(document.getElementById('pre-spo2').value),
      temp: document.getElementById('pre-temp').value,
      weight: parseFloat(document.getElementById('pre-weight').value),
      fasting: document.getElementById('pre-fasting').value,
      fastingHours: parseInt(document.getElementById('pre-fasting-hours').value) || 0,
      consent: document.getElementById('pre-consent').value,
      allergyFlag: document.getElementById('pre-allergy').value,
      allergyDetails: document.getElementById('pre-allergy-text').value,
      preExistingConditions: document.getElementById('pre-existing').value,
      timestamp: new Date().toISOString()
    };

    admission.status = 'Pre-op Checklist Done';
    admission.historyLogs.push({ timestamp: new Date().toISOString(), action: 'Pre-Procedure Checklist Submitted & Locked' });

    window.saveDaycareState();
    window.views.daybed(container, subAnchor, params);
  };

  // --------------------------------------------------------------------------
  // DOCTOR ORDERS WORKSPACE PANE (Screen 4)
  // --------------------------------------------------------------------------
  window.switchOrdersTab = function(tab) {
    document.getElementById('pane-tab-lab').style.display = tab === 'lab' ? 'block' : 'none';
    document.getElementById('pane-tab-med').style.display = tab === 'med' ? 'block' : 'none';
    document.getElementById('pane-tab-note').style.display = tab === 'note' ? 'block' : 'none';

    document.getElementById('tab-lab-btn').style.borderBottom = tab === 'lab' ? '2px solid var(--primary)' : 'none';
    document.getElementById('tab-med-btn').style.borderBottom = tab === 'med' ? '2px solid var(--primary)' : 'none';
    document.getElementById('tab-note-btn').style.borderBottom = tab === 'note' ? '2px solid var(--primary)' : 'none';
  };

  window.searchLabTestsOrder = function(q) {
    const results = document.getElementById('order-lab-matches');
    if (!results) return;
    if (!q || q.length < 2) {
      results.style.display = 'none';
      return;
    }

    const testCatalog = [
      { code: 'LB-01', name: 'Complete Blood Count (CBC)', rate: 450 },
      { code: 'LB-02', name: 'Renal Function Test (RFT)', rate: 900 },
      { code: 'LB-03', name: 'Liver Function Test (LFT)', rate: 1200 },
      { code: 'LB-04', name: 'Basic Metabolic Panel (BMP)', rate: 650 },
      { code: 'LB-05', name: 'Electrocardiogram (ECG)', rate: 500 },
      { code: 'LB-06', name: 'Coagulation Profile (PT/INR)', rate: 750 }
    ];

    const matches = testCatalog.filter(t => t.name.toLowerCase().includes(q.toLowerCase()));
    if (matches.length === 0) {
      results.style.display = 'none';
      return;
    }

    results.innerHTML = matches.map(t => `
      <div style="padding: 0.5rem; border-bottom:1px solid var(--border-color); cursor:pointer; background:var(--bg-surface);" onclick="window.addLabToOrder('${t.code}', '${t.name}', ${t.rate})">
        <strong>${t.name}</strong> (Rate: ₹${t.rate})
      </div>
    `).join('');
    results.style.display = 'block';
  };

  window.addLabToOrder = function(code, name, rate) {
    if (!window.currentOrders.labs.some(l => l.code === code)) {
      window.currentOrders.labs.push({ code, name, rate });
    }
    document.getElementById('order-lab-matches').style.display = 'none';
    document.getElementById('order-lab-search').value = '';
    window.redrawOrderedLabs();
  };

  window.redrawOrderedLabs = function() {
    const div = document.getElementById('ordered-labs-list');
    if (!div) return;
    div.innerHTML = window.currentOrders.labs.map(l => `
      <div style="background:var(--bg-surface-elevated); padding:0.5rem; display:flex; justify-content:space-between; border-radius:4px; border:1px solid var(--border-color); font-size:0.85rem; margin-top:0.25rem;">
        <span>🧪 <strong>${l.name}</strong> (${l.code})</span>
        <span style="color:#ef4444; cursor:pointer;" onclick="window.removeLabFromOrder('${l.code}')">✕</span>
      </div>
    `).join('');
  };

  window.removeLabFromOrder = function(code) {
    window.currentOrders.labs = window.currentOrders.labs.filter(l => l.code !== code);
    window.redrawOrderedLabs();
  };

  window.addMedicationToOrder = function() {
    const drugName = document.getElementById('ord-med-name').value;
    const dose = document.getElementById('ord-med-dose').value;
    const route = document.getElementById('ord-med-route').value;
    const frequency = document.getElementById('ord-med-freq').value;

    if (!drugName) return;

    window.currentOrders.meds.push({ drugName, dose, route, frequency, rate: 120 });
    document.getElementById('ord-med-name').value = '';
    document.getElementById('ord-med-dose').value = '';
    document.getElementById('ord-med-freq').value = '';
    window.redrawOrderedMeds();
  };

  window.redrawOrderedMeds = function() {
    const div = document.getElementById('ordered-meds-list');
    if (!div) return;
    div.innerHTML = window.currentOrders.meds.map((m, idx) => `
      <div style="background:var(--bg-surface-elevated); padding:0.5rem; display:flex; justify-content:space-between; border-radius:4px; border:1px solid var(--border-color); font-size:0.85rem; margin-top:0.25rem;">
        <span>💊 <strong>${m.drugName}</strong> - ${m.dose} | ${m.route} | ${m.frequency}</span>
        <span style="color:#ef4444; cursor:pointer;" onclick="window.removeMedFromOrder(${idx})">✕</span>
      </div>
    `).join('');
  };

  window.removeMedFromOrder = function(idx) {
    window.currentOrders.meds.splice(idx, 1);
    window.redrawOrderedMeds();
  };

  window.saveDoctorOrders = function(uhid) {
    const admission = window.state.daycareAdmissions.find(a => a.patient.uhid === uhid);
    if (!admission) return;

    admission.orders = {
      labs: window.currentOrders.labs,
      meds: window.currentOrders.meds,
      note: document.getElementById('ord-procedure-note')?.value || '',
      preauthVerified: document.getElementById('preauth-checked')?.checked || false
    };

    admission.status = 'Orders Saved';
    admission.historyLogs.push({ timestamp: new Date().toISOString(), action: 'Doctor Orders & Prescriptions Dispatched' });

    window.saveDaycareState();
    window.views.daybed(container, subAnchor, params);
  };

  // --------------------------------------------------------------------------
  // NURSE TASKS (Screen 5)
  // --------------------------------------------------------------------------
  window.toggleNurseTaskCompleted = function(uhid, taskId) {
    const admission = window.state.daycareAdmissions.find(a => a.patient.uhid === uhid);
    if (!admission) return;

    const task = admission.tasks.find(t => t.id === taskId);
    if (task) {
      task.completed = !task.completed;
      admission.historyLogs.push({ timestamp: new Date().toISOString(), action: `Task ${task.name} toggled: ${task.completed ? 'Completed' : 'Pending'}` });
    }

    window.saveDaycareState();
    window.views.daybed(container, subAnchor, params);
  };

  window.saveNurseTasksNotes = function(uhid) {
    const admission = window.state.daycareAdmissions.find(a => a.patient.uhid === uhid);
    if (!admission) return;

    admission.nursingNotes = document.getElementById('nurse-notes-field').value;
    admission.status = 'Tasks Updated';
    
    window.saveDaycareState();
    window.views.daybed(container, subAnchor, params);
  };

  // --------------------------------------------------------------------------
  // DIALOG 6: POST-PROCEDURE MONITORING Form (Screen 6)
  // --------------------------------------------------------------------------
  window.savePostProcedureMonitoring = function(uhid) {
    const admission = window.state.daycareAdmissions.find(a => a.patient.uhid === uhid);
    if (!admission) return;

    admission.postopCheck = {
      bp: document.getElementById('post-bp').value,
      pulse: parseInt(document.getElementById('post-pulse').value),
      spo2: parseInt(document.getElementById('post-spo2').value),
      temp: document.getElementById('post-temp').value,
      condition: document.getElementById('post-condition').value,
      notes: document.getElementById('post-notes').value,
      timestamp: new Date().toISOString()
    };

    admission.status = 'Post-op Monitored';
    admission.doctorReviewFlag = true;
    admission.historyLogs.push({ timestamp: new Date().toISOString(), action: 'Post-op Recovery Logs Submitted & Saved' });

    window.saveDaycareState();
    window.views.daybed(container, subAnchor, params);
  };

  // --------------------------------------------------------------------------
  // DIALOG 7: DOCTOR DISCHARGE ORDER EDIT (Screen 7)
  // --------------------------------------------------------------------------
  window.saveDischargeOrder = function(uhid) {
    const admission = window.state.daycareAdmissions.find(a => a.patient.uhid === uhid);
    if (!admission) return;

    admission.discharge = {
      instructions: document.getElementById('discharge-instr').value,
      followupDate: document.getElementById('discharge-followup').value,
      timestamp: new Date().toISOString()
    };

    admission.clearances = {
      nursing: { cleared: false, note: '' },
      pharmacy: { cleared: false, note: '' },
      billing: { cleared: false, note: '' }
    };

    admission.status = 'Discharge Ordered';
    admission.historyLogs.push({ timestamp: new Date().toISOString(), action: 'Physician Discharge Orders Issued' });

    window.saveDaycareState();
    window.views.daybed(container, subAnchor, params);
  };

  // --------------------------------------------------------------------------
  // CLEARANCES & BILL PANEL DETAILS (Screen 8 & 9)
  // --------------------------------------------------------------------------
  window.toggleDepartmentClearance = function(uhid, dept) {
    const admission = window.state.daycareAdmissions.find(a => a.patient.uhid === uhid);
    if (!admission) return;

    admission.clearances[dept].cleared = !admission.clearances[dept].cleared;
    admission.historyLogs.push({ timestamp: new Date().toISOString(), action: `Department ${dept} clearance toggled: ${admission.clearances[dept].cleared ? 'Cleared' : 'Pending'}` });

    window.saveDaycareState();
    window.views.daybed(container, subAnchor, params);
  };

  window.recalcNetBillTotal = function(gross, insurance, discountPct) {
    const discountAmt = Math.floor(gross * (parseFloat(discountPct) || 0) / 100);
    const net = gross - insurance - discountAmt;
    
    window.activeBillingInfo.discount = discountPct;
    window.activeBillingInfo.netPayable = net;

    document.getElementById('bill-net-total-display').textContent = `₹${net}`;
  };

  // --------------------------------------------------------------------------
  // DIALOG 10: BED RELEASE CONFIRMATION (Screen 10)
  // --------------------------------------------------------------------------
  window.processDaycarePayment = function(uhid) {
    const admission = window.state.daycareAdmissions.find(a => a.patient.uhid === uhid);
    if (!admission) return;

    const bedId = admission.bedId;
    if (state.bedsStatus[bedId]) {
      state.bedsStatus[bedId].status = 'Available';
      state.bedsStatus[bedId].patientUhid = null;
      state.bedsStatus[bedId].notes = '';
    }

    const receiptNo = `REC-${Math.floor(100000 + Math.random() * 900000)}`;
    const dischargeTime = new Date().toISOString();

    admission.billingInfo = {
      ...window.activeBillingInfo,
      paymentMode: document.getElementById('bill-paymode').value,
      receiptNo,
      dischargeTimestamp: dischargeTime
    };

    admission.status = 'Cleared & Discharged';
    if (admission.patient) {
      admission.patient.status = 'Discharged';
      admission.patient.dischargedToday = true;
    }
    admission.historyLogs.push({ timestamp: dischargeTime, action: `Bill paid. Bed ${bedId} released to Available.` });

    if (state.bedAuditLogs) {
      state.bedAuditLogs.unshift({
        timestamp: dischargeTime,
        bedId: bedId,
        ward: 'Daycare Ward',
        patientUhid: uhid,
        action: 'Daycare Discharge',
        prevStatus: 'Occupied',
        newStatus: 'Available',
        operator: 'Billing Desk',
        remarks: `Receipt: ${receiptNo}`
      });
    }

    window.saveDaycareState();

    // Open Bed Release Confirmation modal
    let releaseModal = document.getElementById('daycare-release-modal');
    if (!releaseModal) {
      releaseModal = document.createElement('div');
      releaseModal.id = 'daycare-release-modal';
      releaseModal.className = 'modal-overlay';
      document.body.appendChild(releaseModal);
    }

    const durationHrs = Math.max(1, Math.round((new Date(dischargeTime) - new Date(admission.admissionTimestamp)) / (1000 * 60 * 60)));

    releaseModal.innerHTML = `
      <div class="modal-box" style="max-width: 480px; border-radius: 8px; background: var(--bg-surface); padding: 1.5rem; text-align: center; border:1px solid var(--border-color);">
        <span style="font-size:3.5rem; display:block; margin-bottom:0.5rem; color:#10b981;">✓</span>
        <h4 style="margin:0 0 1rem 0; font-weight:700; color:var(--primary);">Day Care Bed Released Instantly</h4>
        
        <div style="text-align: left; font-size:0.85rem; display:flex; flex-direction:column; gap:0.5rem; background:var(--bg-surface-elevated); padding:0.75rem; border-radius:6px; border:1px solid var(--border-color); margin-bottom:1.5rem;">
          <div><strong>Patient Name:</strong> ${admission.patient.name}</div>
          <div><strong>Bed Released:</strong> ${admission.bedNo}</div>
          <div><strong>Admission Time:</strong> ${new Date(admission.admissionTimestamp).toLocaleTimeString()}</div>
          <div><strong>Discharge Time:</strong> ${new Date(dischargeTime).toLocaleTimeString()}</div>
          <div><strong>Total Stay Duration:</strong> ${durationHrs} Hour(s)</div>
          <div><strong>Payment Receipt:</strong> ${receiptNo} (${admission.billingInfo.paymentMode})</div>
        </div>

        <button class="btn btn-primary" style="width:100%;" onclick="window.closeBedReleaseConfirmationAndRefresh()">Done & Refresh Board</button>
      </div>
    `;

    releaseModal.classList.add('active');
    releaseModal.style.display = 'flex';
  };

  window.closeBedReleaseConfirmationAndRefresh = function() {
    const modal = document.getElementById('daycare-release-modal');
    if (modal) {
      modal.classList.remove('active');
      modal.style.display = 'none';
    }
    window.views.daybed(container, subAnchor, params);
  };
};
