/* ==========================================================================
   SARONIL HMS - DAY CARE WORKFLOW VIEW (daybedView.js)
   ========================================================================== */

// Initialize Daycare State variables if not present
if (!window.state.daycareAdmissions) {
  const cached = localStorage.getItem('saronil_daycare_admissions');
  window.state.daycareAdmissions = cached ? JSON.parse(cached) : [];
}
if (!window.state.daycareBookings) {
  window.state.daycareBookings = [];
}
if (!window.state.daycareAuditLogs) {
  window.state.daycareAuditLogs = [];
}
if (!window.state.unplannedReturns) {
  window.state.unplannedReturns = [];
}

window.saveDaycareState = function() {
  localStorage.setItem('saronil_daycare_admissions', JSON.stringify(window.state.daycareAdmissions));
};

// Global daycare tab tracking state
if (!window.activeDaycareTab) {
  window.activeDaycareTab = 'board'; // 'board' | 'booking' | 'followup' | 'audit'
}

// Global active role simulation for testing daycare RBAC
if (!window.daycareRole) {
  window.daycareRole = 'Daycare Nurse'; // 'Daycare Nurse' | 'Daycare Unit In-charge (Nursing)' | 'Daycare Physician' | 'Anesthesiologist' | 'OT Technician' | 'Billing Desk' | 'Hospital Administrator'
}

window.views.daybed = function(container, subAnchor, params) {
  // Clear any existing timer interval to prevent duplicates
  if (window._daycareTimerId) {
    clearInterval(window._daycareTimerId);
  }

  // Active daycare beds from global state configuration
  const daycareWard = window.state.wards['DAYCARE'] || { name: "Daycare Unit", beds: [], price: 1500 };
  const daycareBeds = daycareWard.beds;

  // Selected bed default tracking
  if (!window.selectedDaycareBed) {
    window.selectedDaycareBed = daycareBeds[0] || 'DC-B1';
  }

  const activeAdmissions = window.state.daycareAdmissions || [];
  const currentBedAdmission = activeAdmissions.find(a => a.bedId === window.selectedDaycareBed && a.status !== 'Cleared & Discharged');

  // helper to compute elapsed stays
  function getElapsedTime(admissionTimestamp) {
    const elapsedMs = Date.now() - new Date(admissionTimestamp).getTime();
    const totalMinutes = Math.floor(elapsedMs / (60 * 1000));
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return { hours, minutes, totalMinutes };
  }

  // --------------------------------------------------------------------------
  // INTERFACE HEADER & TAB RENDERERS
  // --------------------------------------------------------------------------
  const renderHeaderHTML = () => {
    return `
      <div style="background-color: var(--primary-glow); padding: 1.25rem; border-bottom: 1px solid var(--border-color); border-top-left-radius: 12px; border-top-right-radius: 12px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px;">
        <div>
          <h3 style="color: var(--primary); font-weight: 700; margin: 0; font-size: 1.2rem; display:flex; align-items:center; gap:8px;">🛌 Daycare Unit Ward (12-Hour Ceiling)</h3>
          <p style="color: var(--text-secondary); margin: 0.25rem 0 0 0; font-size: 0.8rem;">Admissions, recovery checks, Aldrete scoring, cashless eligibility filters, and IPD transfers.</p>
        </div>
        <div style="display:flex; align-items:center; gap:8px; background:white; padding:6px 12px; border-radius:6px; border:1.5px solid #cbd5e1;">
          <label style="font-size:11px; font-weight:800; color:var(--text-secondary); text-transform:uppercase;">Active Role:</label>
          <select class="form-select" id="role-select" style="font-size:12px; font-weight:700; height:28px; padding:2px 6px; border:1px solid #cbd5e1;" onchange="window.setDaycareRole(this.value)">
            <option value="Daycare Nurse" ${window.daycareRole === 'Daycare Nurse' ? 'selected' : ''}>Daycare Nurse</option>
            <option value="Daycare Unit In-charge (Nursing)" ${window.daycareRole === 'Daycare Unit In-charge (Nursing)' ? 'selected' : ''}>Daycare Unit In-charge (Nursing)</option>
            <option value="Daycare Physician" ${window.daycareRole === 'Daycare Physician' ? 'selected' : ''}>Daycare Physician / Specialist</option>
            <option value="Anesthesiologist" ${window.daycareRole === 'Anesthesiologist' ? 'selected' : ''}>Anesthesiologist</option>
            <option value="OT Technician" ${window.daycareRole === 'OT Technician' ? 'selected' : ''}>OT/Procedure Tech</option>
            <option value="Billing Desk" ${window.daycareRole === 'Billing Desk' ? 'selected' : ''}>Billing/TPA Desk</option>
            <option value="Hospital Administrator" ${window.daycareRole === 'Hospital Administrator' ? 'selected' : ''}>Hospital Administrator</option>
          </select>
        </div>
      </div>
      <!-- Tab Headers -->
      <div style="display:flex; background:var(--bg-surface-elevated); border-bottom:1px solid var(--border-color); font-size:12px;">
        <button onclick="window.setDaycareTab('board')" style="flex:1; padding:12px; border:none; background:${window.activeDaycareTab === 'board' ? 'white' : 'transparent'}; border-bottom:${window.activeDaycareTab === 'board' ? '3px solid var(--primary)' : 'none'}; font-weight:${window.activeDaycareTab === 'board' ? '800' : '600'}; color:${window.activeDaycareTab === 'board' ? 'var(--primary)' : 'var(--text-secondary)'}; cursor:pointer;">📋 Clinical Care Board</button>
        <button onclick="window.setDaycareTab('booking')" style="flex:1; padding:12px; border:none; background:${window.activeDaycareTab === 'booking' ? 'white' : 'transparent'}; border-bottom:${window.activeDaycareTab === 'booking' ? '3px solid var(--primary)' : 'none'}; font-weight:${window.activeDaycareTab === 'booking' ? '800' : '600'}; color:${window.activeDaycareTab === 'booking' ? 'var(--primary)' : 'var(--text-secondary)'}; cursor:pointer;">🎫 Daycare Booking Gate</button>
        <button onclick="window.setDaycareTab('followup')" style="flex:1; padding:12px; border:none; background:${window.activeDaycareTab === 'followup' ? 'white' : 'transparent'}; border-bottom:${window.activeDaycareTab === 'followup' ? '3px solid var(--primary)' : 'none'}; font-weight:${window.activeDaycareTab === 'followup' ? '800' : '600'}; color:${window.activeDaycareTab === 'followup' ? 'var(--primary)' : 'var(--text-secondary)'}; cursor:pointer;">📞 Post-Discharge & Returns</button>
        <button onclick="window.setDaycareTab('audit')" style="flex:1; padding:12px; border:none; background:${window.activeDaycareTab === 'audit' ? 'white' : 'transparent'}; border-bottom:${window.activeDaycareTab === 'audit' ? '3px solid var(--primary)' : 'none'}; font-weight:${window.activeDaycareTab === 'audit' ? '800' : '600'}; color:${window.activeDaycareTab === 'audit' ? 'var(--primary)' : 'var(--text-secondary)'}; cursor:pointer;">🛡️ Daycare Audit Ledger</button>
      </div>
    `;
  };

  // --------------------------------------------------------------------------
  // TAB 1: CLINICAL CARE BOARD (SPLIT WARD GRID LAYOUT LIKE ATD)
  // --------------------------------------------------------------------------
  const renderLegendHTML = () => {
    let vacantCount = 0;
    let occupiedCount = 0;
    let warningCount = 0;
    let breachCount = 0;

    daycareBeds.forEach(bedId => {
      const statusObj = window.state.bedsStatus[bedId] || { status: 'Available' };
      const adm = activeAdmissions.find(a => a.bedId === bedId && a.status !== 'Cleared & Discharged');
      
      if (statusObj.status === 'Occupied' && adm) {
        const elapsed = getElapsedTime(adm.admissionTimestamp);
        if (elapsed.hours >= 12) breachCount++;
        else if (elapsed.hours >= 10) warningCount++;
        else occupiedCount++;
      } else {
        vacantCount++;
      }
    });

    return `
      <div class="bed-board-header" style="background-color: var(--bg-surface); padding: 0.75rem 1rem; border-radius: 8px; border: 1px solid var(--border-color); margin-bottom: 1rem; text-align: left;">
        <div class="bed-legend" style="display: flex; flex-wrap: wrap; gap: 0.85rem; font-size: 0.72rem; justify-content: space-between; align-items: center;">
          <div style="display: flex; align-items: center; gap: 0.35rem;"><div style="background-color: var(--color-success); width: 12px; height: 12px; border-radius: 3px;"></div> Available (${vacantCount})</div>
          <div style="display: flex; align-items: center; gap: 0.35rem;"><div style="background-color: var(--color-purple); width: 12px; height: 12px; border-radius: 3px;"></div> Occupied (${occupiedCount})</div>
          <div style="display: flex; align-items: center; gap: 0.35rem;"><div style="background-color: #f59e0b; width: 12px; height: 12px; border-radius: 3px;"></div> Warning Limit (${warningCount})</div>
          <div style="display: flex; align-items: center; gap: 0.35rem;"><div style="background-color: var(--color-danger); width: 12px; height: 12px; border-radius: 3px;"></div> Ceiling Breached (${breachCount})</div>
        </div>
      </div>
    `;
  };

  const renderBedsGridHTML = () => {
    let bedHTML = '';
    
    daycareBeds.forEach(bedId => {
      const statusObj = window.state.bedsStatus[bedId] || { status: 'Available' };
      const adm = activeAdmissions.find(a => a.bedId === bedId && a.status !== 'Cleared & Discharged');
      const isSelected = window.selectedDaycareBed === bedId;

      let statusClass = statusObj.status === 'Occupied' ? 'bed-occupied' : 'bed-available';
      if (statusObj.status === 'Reserved') statusClass = 'bed-reserved';
      else if (statusObj.status === 'Vacated - Pending Housekeeping') statusClass = 'bed-housekeeping-pending';
      else if (statusObj.status === 'Housekeeping In Progress') statusClass = 'bed-housekeeping-progress';

      // Custom highlights for selection
      let selectedStyle = isSelected ? 'border: 3.2px solid var(--primary); box-shadow: 0 0 10px rgba(59,130,246,0.3); transform: translateY(-2px);' : '';

      let elapsedHTML = '';
      let patientName = '';
      let procedureText = '';

      if (statusObj.status === 'Occupied' && adm) {
        patientName = adm.patient.name;
        procedureText = adm.procedureName;
        const elapsed = getElapsedTime(adm.admissionTimestamp);
        
        let timerColor = 'var(--color-success)';
        if (elapsed.hours >= 10 && elapsed.hours < 12) {
          timerColor = '#f59e0b';
          statusClass += ' bed-housekeeping-pending'; // gives orange tint
        } else if (elapsed.hours >= 12) {
          timerColor = 'var(--color-danger)';
          statusClass += ' sla-breached-alert'; // triggers built-in flashing animation!
        }

        elapsedHTML = `
          <div class="live-stay-timer" data-admitted-time="${adm.admissionTimestamp}" style="font-size: 0.7rem; font-weight: bold; margin-top: 0.35rem; color: ${timerColor};">
            🕒 ${elapsed.hours}h ${elapsed.minutes}m elapsed
            ${elapsed.hours >= 12 ? '<span class="badge" style="background-color: var(--color-danger); color: white; padding: 1px 4px; border-radius: 3px; font-size: 0.55rem; margin-left: 0.25rem;">CEILING BREACHED</span>' : ''}
          </div>
        `;
      }

      bedHTML += `
        <div class="bed-card ${statusClass}" style="${selectedStyle}" onclick="window.selectDaycareBed('${bedId}')">
          <div class="bed-card-top">
            <span class="bed-name">${bedId}</span>
            <span class="bed-icon">🛌</span>
          </div>
          <span class="bed-status-text">${statusObj.status}</span>
          ${elapsedHTML}
          ${patientName ? `<div class="bed-patient-name" title="${patientName}" style="margin-top: 4px;">${patientName}</div>` : ''}
          ${procedureText ? `<div style="font-size: 10px; color: var(--text-secondary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-top:1px;" title="${procedureText}">${procedureText}</div>` : ''}
        </div>
      `;
    });

    return `
      <div class="bed-floor-section">
        <h3 class="floor-title" style="margin-top: 0; margin-bottom: 0.75rem; text-align: left; font-size:14px; font-weight:700;">
          Daycare Ward Bed grid
          <span style="font-size: 0.8rem; font-weight: normal; color: var(--text-muted);"> (₹1,500/day · Hard 12h Stay Limit)</span>
        </h3>
        <div class="beds-grid" style="grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));">
          ${bedHTML}
        </div>
      </div>
    `;
  };

  const renderClinicalCareDeskHTML = () => {
    if (!currentBedAdmission) {
      return `
        <div class="card" style="box-shadow: var(--shadow-sm); border: 1px solid var(--border-color); text-align:center; padding:50px 0; color:#64748b; background: white; border-radius:12px;">
          <span style="font-size:3rem; display:block; margin-bottom:10px;">🛌</span>
          <h4 style="margin:0; font-weight:700;">No Patient Admitted on Bed ${window.selectedDaycareBed}</h4>
          <p style="font-size:12px; margin:5px 0 15px 0;">Select a vacant bed and check-in a patient, or allocate a booking.</p>
          <button class="btn btn-primary" onclick="window.setDaycareTab('booking')" style="background:#1b3a5c; font-size:11px; font-weight:800;">Go to Bookings</button>
        </div>
      `;
    }

    const p = currentBedAdmission.patient;
    const stage = currentBedAdmission.status || 'Registered';

    const renderActiveSection = () => {
      if (stage === 'Registered') {
        return `
          <div style="text-align:left;">
            <h5 style="font-size:13px; font-weight:800; color:#1b3a5c; margin-bottom:10px; border-bottom:1px solid #cbd5e1; padding-bottom:4px;">📋 Step 1: Pre-Procedure Clinical Checklist</h5>
            <form onsubmit="event.preventDefault(); window.submitPreProcedureChecklist('${p.uhid}');">
              <div style="display:grid; grid-template-columns:repeat(2, 1fr); gap:12px; margin-bottom:12px;">
                <div class="form-group">
                  <label class="form-label">BP Baseline (mmHg)</label>
                  <input type="text" id="pre-bp" class="form-control" value="120/80" required>
                </div>
                <div class="form-group">
                  <label class="form-label">Heart Rate (bpm)</label>
                  <input type="number" id="pre-pulse" class="form-control" value="72" required>
                </div>
                <div class="form-group">
                  <label class="form-label">SpO2 (%)</label>
                  <input type="number" id="pre-spo2" class="form-control" value="99" required>
                </div>
                <div class="form-group">
                  <label class="form-label">Temp (°F)</label>
                  <input type="text" id="pre-temp" class="form-control" value="98.4" required>
                </div>
              </div>
              <div style="display:grid; grid-template-columns:1fr 1fr; gap:15px; margin-bottom:15px;">
                <div class="form-group">
                  <label class="form-label">Fasting (NPO) Verified?</label>
                  <select id="pre-fasting" class="form-select" onchange="window.onPreopFastingChanged(this.value)">
                    <option value="Yes">Yes (NPO Verified)</option>
                    <option value="No">No (Inadequate Fasting)</option>
                  </select>
                </div>
                <div class="form-group">
                  <label class="form-label">Actual Fasting Hours</label>
                  <input type="number" id="pre-fasting-hours" class="form-control" value="8" min="0">
                </div>
              </div>
              
              <div style="background:#f8fafc; border:1px solid #cbd5e1; border-radius:6px; padding:12px; margin-bottom:15px; display:flex; flex-direction:column; gap:8px;">
                <div style="display:flex; align-items:center; gap:8px;">
                  <input type="checkbox" id="pre-consent-proc" style="width:16px; height:16px; cursor:pointer;" required>
                  <label for="pre-consent-proc" style="font-size:11.5px; font-weight:700; cursor:pointer;">Patient Informed Consent Signed & Documented</label>
                </div>
                <div style="display:flex; align-items:center; gap:8px;">
                  <input type="checkbox" id="pre-consent-anes" style="width:16px; height:16px; cursor:pointer;" required>
                  <label for="pre-consent-anes" style="font-size:11.5px; font-weight:700; cursor:pointer;">Anesthesia Informed Consent Filed</label>
                </div>
                <div style="display:flex; align-items:center; gap:8px;">
                  <input type="checkbox" id="pre-safety-timeout" style="width:16px; height:16px; cursor:pointer;" required>
                  <label for="pre-safety-timeout" style="font-size:11.5px; font-weight:700; color:#b45309; cursor:pointer;">Pre-Op Safety Checklist Completed</label>
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">Drug Allergies</label>
                <input type="text" id="pre-allergies" class="form-control" value="None">
              </div>

              <div style="text-align:right;">
                <button type="submit" class="btn btn-primary" style="background:#1b3a5c; padding:8px 18px; font-size:12px; border-radius:6px; font-weight:800; cursor:pointer; width:100%;">Lock Checklist & Proceed</button>
              </div>
            </form>
          </div>
        `;
      }

      if (stage === 'Pre-op Checklist Done') {
        const isAnesRole = (window.daycareRole === 'Anesthesiologist' || window.daycareRole === 'Hospital Administrator');
        return `
          <div style="text-align:left;">
            <h5 style="font-size:13px; font-weight:800; color:#1b3a5c; margin-bottom:10px; border-bottom:1px solid #cbd5e1; padding-bottom:4px;">🩺 Step 2: Pre-Anesthesia Fitness Check & Anesthesia Log</h5>
            
            ${!isAnesRole ? `
              <div style="background:#fffbeb; border:1px solid #fde68a; color:#92400e; padding:10px 12px; border-radius:6px; font-size:11px; margin-bottom:12px; font-weight:700;">
                🔒 LOCKED: Pre-anesthesia checks must be completed by the Anesthesiologist role. Switch role above to sign off.
              </div>
            ` : ''}
            
            <form onsubmit="event.preventDefault(); window.submitPreAnesthesiaFitness('${p.uhid}');">
              <div style="display:grid; grid-template-columns:1fr; gap:12px; margin-bottom:12px;">
                <div class="form-group">
                  <label class="form-label">ASA Physical Status Rating *</label>
                  <select id="anes-asa" class="form-select" ${!isAnesRole ? 'disabled' : ''} required>
                    <option value="ASA I">ASA Class I (Normal healthy patient)</option>
                    <option value="ASA II">ASA Class II (Mild systemic disease)</option>
                    <option value="ASA III">ASA Class III (Severe systemic disease)</option>
                    <option value="ASA IV">ASA Class IV (Life threatening systemic disease)</option>
                  </select>
                </div>
                <div class="form-group">
                  <label class="form-label">Airway Evaluation (Mallampati Score) *</label>
                  <select id="anes-mallampati" class="form-select" ${!isAnesRole ? 'disabled' : ''} required>
                    <option value="Class I">Class I (Full visualization of tonsils/palate)</option>
                    <option value="Class II">Class II (Partial visualization)</option>
                    <option value="Class III">Class III (Soft palate only)</option>
                    <option value="Class IV">Class IV (Hard palate only)</option>
                  </select>
                </div>
              </div>

              <div style="background:#f8fafc; border:1px solid #cbd5e1; border-radius:6px; padding:12px; margin-bottom:15px; display:flex; flex-direction:column; gap:8px;">
                <div style="display:flex; align-items:center; gap:8px;">
                  <input type="checkbox" id="anes-fitness-cleared" style="width:16px; height:16px; cursor:pointer;" ${!isAnesRole ? 'disabled' : ''} required>
                  <label for="anes-fitness-cleared" style="font-size:12px; font-weight:700; cursor:pointer;">Anesthesiology Fitness Declared & Cleared</label>
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">Pre-Medication Directed</label>
                <input type="text" id="anes-premeds" class="form-control" value="Inj Midazolam 1mg IV static" ${!isAnesRole ? 'disabled' : ''}>
              </div>

              <div style="text-align:right;">
                <button type="submit" class="btn btn-primary" style="background:#15803d; padding:8px 18px; font-size:12px; border-radius:6px; font-weight:800; cursor:pointer; width:100%;" ${!isAnesRole ? 'disabled style="opacity:0.5;"' : ''}>Sign off Fitness & Dispatch Orders</button>
              </div>
            </form>
          </div>
        `;
      }

      if (stage === 'Orders Saved') {
        return `
          <div style="text-align:left;">
            <h5 style="font-size:13px; font-weight:800; color:#1b3a5c; margin-bottom:10px; border-bottom:1px solid #cbd5e1; padding-bottom:4px;">⚙️ Step 3: Nurse Prep & Handover to OT</h5>
            
            <div style="background:#eff6ff; border:1px solid #bfdbfe; padding:10px 12px; border-radius:6px; font-size:11px; margin-bottom:12px;">
              ℹ️ Pre-op instructions verified. Fasting verified. Pre-medication administered.
            </div>

            <div style="display:flex; flex-direction:column; gap:10px; margin-bottom:20px; border:1px solid #cbd5e1; padding:12px; border-radius:8px; background:white;">
              <div style="font-weight:700; font-size:12px; color:#334155; margin-bottom:4px;">Handover Prep Items checklist:</div>
              <div style="display:flex; align-items:center; gap:8px;">
                <input type="checkbox" id="prep-iv" style="width:16px; height:16px; cursor:pointer;" required>
                <label for="prep-iv" style="font-size:12px; font-weight:600; cursor:pointer;">IV Cannula inserted & patent</label>
              </div>
              <div style="display:flex; align-items:center; gap:8px;">
                <input type="checkbox" id="prep-gown" style="width:16px; height:16px; cursor:pointer;" required>
                <label for="prep-gown" style="font-size:12px; font-weight:600; cursor:pointer;">Gown changed, identity wristband verified</label>
              </div>
              <div style="display:flex; align-items:center; gap:8px;">
                <input type="checkbox" id="prep-handover" style="width:16px; height:16px; cursor:pointer;" required>
                <label for="prep-handover" style="font-size:12px; font-weight:700; color:#1e3a8a; cursor:pointer;">Patient Handover complete to OT</label>
              </div>
            </div>

            <div style="text-align:right;">
              <button class="btn btn-primary" style="background:#1b3a5c; padding:8px 18px; font-size:12px; border-radius:6px; font-weight:800; cursor:pointer; width:100%;" onclick="window.savePrepHandover('${p.uhid}')">Dispatch to Procedure room</button>
            </div>
          </div>
        `;
      }

      if (stage === 'Tasks Updated') {
        const isTechRole = (window.daycareRole === 'OT Technician' || window.daycareRole === 'Daycare Physician' || window.daycareRole === 'Hospital Administrator');
        return `
          <div style="text-align:left;">
            <h5 style="font-size:13px; font-weight:800; color:#1b3a5c; margin-bottom:10px; border-bottom:1px solid #cbd5e1; padding-bottom:4px;">😷 Step 4: Log Procedure & Consumables</h5>

            ${!isTechRole ? `
              <div style="background:#fffbeb; border:1px solid #fde68a; color:#92400e; padding:10px 12px; border-radius:6px; font-size:11px; margin-bottom:12px; font-weight:700;">
                🔒 LOCKED: Logging procedure logs and consumable bills requires OT Tech or Physician roles.
              </div>
            ` : ''}

            <form onsubmit="event.preventDefault(); window.submitProcedureLog('${p.uhid}');">
              <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:12px;">
                <div class="form-group">
                  <label class="form-label">Proc Start</label>
                  <input type="time" id="proc-start" class="form-control" value="11:30" ${!isTechRole ? 'disabled' : ''} required>
                </div>
                <div class="form-group">
                  <label class="form-label">Proc End</label>
                  <input type="time" id="proc-end" class="form-control" value="12:15" ${!isTechRole ? 'disabled' : ''} required>
                </div>
              </div>

              <div style="background:#f8fafc; border:1px solid #cbd5e1; border-radius:8px; padding:12px; margin-bottom:15px;">
                <div style="font-size:12px; font-weight:800; color:#334155; margin-bottom:6px; display:flex; justify-content:space-between; align-items:center;">
                  <span>Sterile Implants & Consumables</span>
                </div>
                <div style="display:grid; grid-template-columns:1fr; gap:10px; margin-bottom:10px;">
                  <select id="proc-consumable-select" class="form-select" style="height:32px;" ${!isTechRole ? 'disabled' : ''}>
                    <option value="IM-Cataract-IOL|Intraocular Lens Implant (Lot #IOL-9921)">Intraocular Lens Implant (Lot #IOL-9921) - ₹12,000</option>
                    <option value="CS-Chemo-Cnv|Chemotherapy Port Kit (Lot #CHM-1123)">Chemotherapy Port Kit (Lot #CHM-1123) - ₹5,500</option>
                    <option value="CS-Endo-Kit|Endoscopy Biopsy Forceps (Sterile)">Endoscopy Biopsy Forceps (Sterile) - ₹1,800</option>
                    <option value="CS-Syr-02|Disposable Sterile Syringes (Pack of 5)">Disposable Sterile Syringes (Pack of 5) - ₹250</option>
                    <option value="CS-Cann-01|IV Cannula & Extension Set (Lot #CAN-991)">IV Cannula & Extension Set (Lot #CAN-991) - ₹300</option>
                  </select>
                  <button type="button" class="btn btn-secondary" onclick="window.addConsumableToProcedure()" style="font-size:11px; font-weight:800; cursor:pointer;" ${!isTechRole ? 'disabled' : ''}>➕ Add Item</button>
                </div>
                
                <div id="added-consumables-list" style="display:flex; flex-direction:column; gap:5px; margin-top:8px;">
                  <div style="font-size:11px; color:#64748b; font-style:italic;">No consumables logged yet.</div>
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">Procedure Findings</label>
                <textarea id="proc-notes" class="form-control" style="height:55px;" ${!isTechRole ? 'disabled' : ''}>Procedure executed successfully without complications. Patient transferred stable to Recovery Bay.</textarea>
              </div>

              <div style="text-align:right;">
                <button type="submit" class="btn btn-primary" style="background:#1b3a5c; padding:8px 18px; font-size:12px; border-radius:6px; font-weight:800; cursor:pointer; width:100%;" ${!isTechRole ? 'disabled style="opacity:0.5;"' : ''}>Log Procedure & Transfer Recovery</button>
              </div>
            </form>
          </div>
        `;
      }

      if (stage === 'Post-op Monitored') {
        const isPhysician = (window.daycareRole === 'Daycare Physician' || window.daycareRole === 'Hospital Administrator');
        const isNurse = (window.daycareRole === 'Daycare Nurse' || window.daycareRole === 'Daycare Unit In-charge (Nursing)' || isPhysician);
        return `
          <div style="text-align:left;">
            <h5 style="font-size:13px; font-weight:800; color:#1b3a5c; margin-bottom:10px; border-bottom:1px solid #cbd5e1; padding-bottom:4px;">📈 Step 5: Post-Procedure Recovery & Modified Aldrete Score</h5>
            
            <div style="display:flex; flex-direction:column; gap:12px; margin-bottom:15px;">
              
              <!-- Vitals logs -->
              <div>
                <div style="font-weight:700; font-size:11.5px; color:#475569; margin-bottom:8px;">Structured Recovery Vitals:</div>
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px;">
                  <div class="form-group" style="margin:0;">
                    <label class="form-label" style="font-size:11px;">Post-op BP</label>
                    <input type="text" id="post-bp" class="form-control" style="height:28px;" value="122/82" ${!isNurse ? 'disabled' : ''}>
                  </div>
                  <div class="form-group" style="margin:0;">
                    <label class="form-label" style="font-size:11px;">Post-op Heart Rate</label>
                    <input type="number" id="post-hr" class="form-control" style="height:28px;" value="74" ${!isNurse ? 'disabled' : ''}>
                  </div>
                  <div class="form-group" style="margin:0;">
                    <label class="form-label" style="font-size:11px;">Post-op SpO2 (%)</label>
                    <input type="number" id="post-spo2" class="form-control" style="height:28px;" value="98" ${!isNurse ? 'disabled' : ''}>
                  </div>
                  <div class="form-group" style="margin:0;">
                    <label class="form-label" style="font-size:11px;">Pain Score (0-10)</label>
                    <input type="number" id="post-pain" class="form-control" style="height:28px;" value="2" ${!isNurse ? 'disabled' : ''}>
                  </div>
                </div>
              </div>

              <!-- Modified Aldrete Score Calculator -->
              <div style="background:#fafaf9; border:1px solid #e7e5e4; border-radius:8px; padding:12px;">
                <div style="font-weight:800; font-size:12px; color:#78350f; margin-bottom:6px; display:flex; justify-content:space-between;">
                  <span>🩺 Modified Aldrete Score</span>
                  <span style="font-size:11.5px; font-weight:900;" id="aldrete-total-display">Score: 10/10</span>
                </div>
                <div style="display:flex; flex-direction:column; gap:6px; font-size:11px;">
                  <div style="display:flex; justify-content:space-between; align-items:center;">
                    <span>Activity (0-2):</span>
                    <select id="aldrete-activity" style="font-size:10px; height:22px;" onchange="window.recalcAldreteScore()" ${!isNurse ? 'disabled' : ''}>
                      <option value="2" selected>2 - Able to move 4 extremities</option>
                      <option value="1">1 - Able to move 2 extremities</option>
                      <option value="0">0 - Unable to move extremities</option>
                    </select>
                  </div>
                  <div style="display:flex; justify-content:space-between; align-items:center;">
                    <span>Respiration (0-2):</span>
                    <select id="aldrete-respiration" style="font-size:10px; height:22px;" onchange="window.recalcAldreteScore()" ${!isNurse ? 'disabled' : ''}>
                      <option value="2" selected>2 - Deep breathe and cough freely</option>
                      <option value="1">1 - Dyspnea or limited breathing</option>
                      <option value="0">0 - Apneic</option>
                    </select>
                  </div>
                  <div style="display:flex; justify-content:space-between; align-items:center;">
                    <span>Circulation (0-2):</span>
                    <select id="aldrete-circulation" style="font-size:10px; height:22px;" onchange="window.recalcAldreteScore()" ${!isNurse ? 'disabled' : ''}>
                      <option value="2" selected>2 - BP ±20% of baseline</option>
                      <option value="1">1 - BP ±20% to 50% of baseline</option>
                      <option value="0">0 - BP ±50% of baseline</option>
                    </select>
                  </div>
                  <div style="display:flex; justify-content:space-between; align-items:center;">
                    <span>Consciousness (0-2):</span>
                    <select id="aldrete-consciousness" style="font-size:10px; height:22px;" onchange="window.recalcAldreteScore()" ${!isNurse ? 'disabled' : ''}>
                      <option value="2" selected>2 - Fully awake</option>
                      <option value="1">1 - Arousable on calling</option>
                      <option value="0">0 - Unresponsive</option>
                    </select>
                  </div>
                  <div style="display:flex; justify-content:space-between; align-items:center;">
                    <span>O2 Saturation (0-2):</span>
                    <select id="aldrete-oxygen" style="font-size:10px; height:22px;" onchange="window.recalcAldreteScore()" ${!isNurse ? 'disabled' : ''}>
                      <option value="2" selected>2 - SpO2 >92% on room air</option>
                      <option value="1">1 - Requires O2 to keep SpO2 >90%</option>
                      <option value="0">0 - SpO2 <90% even with O2</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <!-- Mandatory Attendant Presence checklist gate -->
            <div style="border:1px dashed #cbd5e1; padding:12px; border-radius:8px; background:#f8fafc; margin-bottom:15px;">
              <div style="font-weight:700; font-size:11.5px; color:#1e3a8a; margin-bottom:8px;">👤 Attendant &amp; Discharge Checklist</div>
              <div style="display:grid; grid-template-columns:1fr; gap:8px; margin-bottom:10px;">
                <div class="form-group" style="margin:0;">
                  <label class="form-label" style="font-size:11px;">Attendant Name *</label>
                  <input type="text" id="attendant-name" class="form-control" style="height:28px;" value="Sarah Swamy" ${!isNurse ? 'disabled' : ''}>
                </div>
                <div class="form-group" style="margin:0;">
                  <label class="form-label" style="font-size:11px;">Attendant Mobile *</label>
                  <input type="tel" id="attendant-phone" class="form-control" style="height:28px;" value="+91 99112 23344" ${!isNurse ? 'disabled' : ''}>
                </div>
              </div>
              <div style="display:flex; flex-direction:column; gap:6px;">
                <div style="display:flex; align-items:center; gap:8px;">
                  <input type="checkbox" id="check-attendant-present" style="width:16px; height:16px; cursor:pointer;" ${!isNurse ? 'disabled' : ''} checked>
                  <label for="check-attendant-present" style="font-size:11px; font-weight:700; cursor:pointer; color:#1b3a5c;">Attendant present &amp; verified *</label>
                </div>
                <div style="display:flex; align-items:center; gap:8px;">
                  <input type="checkbox" id="check-oral-intake" style="width:16px; height:16px; cursor:pointer;" ${!isNurse ? 'disabled' : ''} checked>
                  <label for="check-oral-intake" style="font-size:11px; font-weight:600; cursor:pointer;">Tolerating oral intake *</label>
                </div>
                <div style="display:flex; align-items:center; gap:8px;">
                  <input type="checkbox" id="check-voiding" style="width:16px; height:16px; cursor:pointer;" ${!isNurse ? 'disabled' : ''} checked>
                  <label for="check-voiding" style="font-size:11px; font-weight:600; cursor:pointer;">Voiding successfully (passed urine)</label>
                </div>
              </div>
            </div>

            <!-- Physician Discharge order sign-off -->
            <div style="border-top:1.5px solid #cbd5e1; padding-top:12px; display:flex; flex-direction:column; gap:10px;">
              <div>
                ${!isPhysician ? `
                  <span style="font-size:10px; color:#ef4444; font-weight:700;">🔒 Discharge sign-off requires Doctor/Physician credentials.</span>
                ` : `
                  <span style="font-size:10px; color:#15803d; font-weight:700;">✓ Ready for Physician Discharge Sign-off.</span>
                `}
              </div>
              <div style="display:flex; gap:8px;">
                <button class="btn btn-secondary" style="flex:1; border-color:#ef4444; color:#ef4444; background:#fef2f2; font-size:11px; padding:6px; font-weight:800;" onclick="window.triggerIPDConversionPanel('${p.uhid}')">IPD Convert</button>
                <button class="btn btn-primary" style="flex:1.5; background:#15803d; font-size:11px; padding:6px; font-weight:800;" ${!isPhysician ? 'disabled style="opacity:0.5; cursor:not-allowed;"' : ''} onclick="window.signOffDischargeOrder('${p.uhid}')">Sign Off Discharge ➡️</button>
              </div>
            </div>
          </div>
        `;
      }

      if (stage === 'Discharge Ordered') {
        const isBillingRole = (window.daycareRole === 'Billing Desk' || window.daycareRole === 'Hospital Administrator');
        
        let procFee = 1500;
        let consumedSum = 0;
        let consumedItems = [];
        if (currentBedAdmission.consumablesUsed) {
          currentBedAdmission.consumablesUsed.forEach(c => {
            consumedSum += c.rate;
            consumedItems.push({ desc: c.name, rate: c.rate });
          });
        }

        let grossBill = procFee + consumedSum;
        
        return `
          <div style="text-align:left;">
            <h5 style="font-size:13px; font-weight:800; color:#1b3a5c; margin-bottom:10px; border-bottom:1px solid #cbd5e1; padding-bottom:4px;">💳 Step 6: Final Billing Reconciliation &amp; Release</h5>
            
            ${!isBillingRole ? `
              <div style="background:#fffbeb; border:1px solid #fde68a; color:#92400e; padding:10px 12px; border-radius:6px; font-size:11px; margin-bottom:12px; font-weight:700;">
                🔒 LOCKED: Billing reconciliation must be verified by Billing Desk.
              </div>
            ` : ''}

            <div style="display:flex; flex-direction:column; gap:12px; margin-bottom:15px;">
              <div>
                <table style="width:100%; font-size:11.5px; border-collapse:collapse; background:#f8fafc; border:1px solid #cbd5e1;">
                  <thead>
                    <tr style="background:#e2e8f0; font-weight:700; border-bottom:1px solid #cbd5e1;">
                      <th style="padding:6px; text-align:left;">Charge Description</th>
                      <th style="padding:6px; text-align:right;">Amount (₹)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style="padding:6px;">Daycare Bay Charge</td>
                      <td style="padding:6px; text-align:right;">₹${procFee}</td>
                    </tr>
                    ${consumedItems.map(item => `
                      <tr>
                        <td style="padding:6px;">${item.desc}</td>
                        <td style="padding:6px; text-align:right;">₹${item.rate}</td>
                      </tr>
                    `).join('')}
                    <tr style="border-top:1.5px solid #cbd5e1; font-weight:800; background:#f1f5f9;">
                      <td style="padding:6px;">Gross Payable</td>
                      <td style="padding:6px; text-align:right;">₹${grossBill}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div>
                <div style="border:1px solid #cbd5e1; padding:12px; border-radius:8px; background:white; font-size:11px; display:flex; flex-direction:column; gap:6px;">
                  <div><strong>Payer:</strong> ${p.payer}</div>
                  <div><strong>Claim Classification:</strong> ${p.payer === 'Self Pay' ? 'Self Settlement' : 'Cashless TPA Authorized'}</div>
                  <div style="margin-top:4px;">
                    <label class="form-label" style="font-size:10px;">Payment Mode</label>
                    <select id="dc-paymode" class="form-select" style="height:28px; font-size:11px;" ${!isBillingRole ? 'disabled' : ''}>
                      <option value="UPI">UPI / NetBanking</option>
                      <option value="Cash">Cash</option>
                      <option value="Card">Credit Card</option>
                      <option value="TPA Cashless">TPA Cashless Settlement</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div style="text-align:right; border-top:1px solid #cbd5e1; padding-top:12px;">
              <button class="btn btn-primary" style="background:#15803d; padding:8px 20px; font-weight:800; font-size:12px; cursor:pointer; width:100%;" ${!isBillingRole ? 'disabled style="opacity:0.5;"' : ''} onclick="window.completeDischargeRelease('${p.uhid}')">💳 Verify Payment &amp; Release Bed</button>
            </div>
          </div>
        `;
      }

      return '';
    };

    return `
      <div style="text-align:left; background: white; padding: 1.25rem; border-radius: 12px; border: 1px solid var(--border-color); box-shadow: var(--shadow-sm);">
        <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1.5px solid var(--border-color); padding-bottom:6px; margin-bottom:12px;">
          <h4 style="margin:0; font-weight:800; color:#1b3a5c; font-size:13.5px;">👤 Patient Desk: ${p.name}</h4>
          <span style="font-size:10px; font-weight:800; background:#f1f5f9; padding:2px 8px; border-radius:4px; text-transform:uppercase; color:#1b3a5c;">${stage}</span>
        </div>

        <div style="display:flex; flex-direction:column; gap:4px; font-size:11.5px; background:#f8fafc; border:1px solid #cbd5e1; padding:8px 10px; border-radius:8px; margin-bottom:15px;">
          <div><strong>UHID:</strong> <span class="mono">${p.uhid}</span></div>
          <div><strong>Bed Allotted:</strong> <span>DC-B${window.selectedDaycareBed.replace(/[^0-9]/g, '')}</span></div>
          <div><strong>Procedure:</strong> ${currentBedAdmission.procedureName}</div>
          <div><strong>Payer Category:</strong> ${p.payer}</div>
        </div>

        ${renderActiveSection()}
      </div>
    `;
  };

  const renderClinicalBoardHTML = () => {
    return `
      <div style="display: grid; grid-template-columns: 2fr 1.2fr; gap: 1.5rem; align-items: start; margin-top: 10px;">
        <!-- Left Column: Legend and Bed Board Grid -->
        <div>
          ${renderLegendHTML()}
          ${renderBedsGridHTML()}
        </div>
        
        <!-- Right Column: Active Bed Action Desk -->
        <div>
          ${renderClinicalCareDeskHTML()}
        </div>
      </div>
    `;
  };

  // --------------------------------------------------------------------------
  // TAB 2: DAYCARE BOOKING GATE & ELIGIBILITY filters
  // --------------------------------------------------------------------------
  const renderBookingGateHTML = () => {
    const activeAdmissions = window.state.daycareAdmissions || [];
    const appointments = window.state.appointments || [];
    const pendingProcApts = appointments.filter(apt => {
      if (apt.visitType !== 'Procedure Appointment') return false;
      const admitted = activeAdmissions.some(a => a.patient.uhid === apt.uhid && a.status !== 'Cleared & Discharged');
      return !admitted;
    });

    let queueHTML = '';
    if (pendingProcApts.length > 0) {
      queueHTML = `
        <div style="background:#fffbeb; border:1px solid #fde68a; border-radius:8px; padding:15px; margin-bottom:20px; text-align:left;">
          <h5 style="margin:0 0 10px 0; color:#92400e; font-weight:800; font-size:12px; display:flex; align-items:center; gap:6px;">
            <span>📅 Pending Central Procedure Appointments Queue (${pendingProcApts.length})</span>
          </h5>
          <div style="display:flex; flex-direction:column; gap:8px;">
            ${pendingProcApts.map(apt => `
              <div style="background:white; border:1px solid #cbd5e1; border-radius:6px; padding:10px; display:flex; justify-content:space-between; align-items:center; font-size:11.5px;">
                <div>
                  <strong>${apt.patientName}</strong> (${apt.uhid}) <br>
                  <span style="color:#1e3a8a; font-weight:700;">Procedure: ${apt.procedureName}</span> · Specialist: ${apt.doctorName} <br>
                  <small style="color:#64748b;">Scheduled Slot: ${new Date(apt.dateTime).toLocaleString()}</small>
                </div>
                <button type="button" class="btn btn-primary" style="background:#1b3a5c; font-size:10px; padding:4px 8px; font-weight:800; cursor:pointer;" onclick="window.selectProcedureAppointmentCheckin('${apt.appointmentId}')">⚡ Intake Check-in</button>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }

    return `
      <div style="max-width:800px; margin:0 auto; text-align:left;">
        <h4 style="font-size:14px; font-weight:800; color:#1b3a5c; border-bottom:1.5px solid var(--border-color); padding-bottom:6px; margin-bottom:15px; display:flex; justify-content:space-between; align-items:center;">
          <span>🎫 Daycare Procedure Booking Intake</span>
          <span style="font-size:11px; color:#64748b; font-weight:600;">Active Bed Allocated: <strong>${window.selectedDaycareBed}</strong></span>
        </h4>
        
        ${queueHTML}
        
        <!-- Search Patient Pre-fill -->
        <div class="form-group" style="position: relative; margin-bottom:15px;">
          <label class="form-label" style="font-weight:700; font-size:12px;">🔍 Search Central Registry (UHID or Mobile Number)</label>
          <input type="text" id="booking-uhid-lookup" class="form-control" style="height:36px;" placeholder="Type Name, Mobile or UHID to pre-fill..." oninput="window.lookupBookingPatient(this.value)">
          <div id="booking-lookup-results" style="background:var(--bg-surface-elevated); max-height: 150px; overflow-y: auto; border: 1px solid var(--border-color); display: none; margin-top: 0.25rem; border-radius: 4px; z-index:100; position:absolute; width: 100%;"></div>
        </div>

        <form id="daycare-booking-form" onsubmit="event.preventDefault(); window.submitDaycareBooking();">
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:15px; margin-bottom:15px;">
            <div class="form-group">
              <label class="form-label">Full Name *</label>
              <input type="text" id="book-name" class="form-control" style="height:36px;" required>
            </div>
            <div class="form-group">
              <label class="form-label">Age (Years) *</label>
              <input type="number" id="book-age" class="form-control" style="height:36px;" min="0" max="120" required>
            </div>
            <div class="form-group">
              <label class="form-label">Gender *</label>
              <select id="book-gender" class="form-select" style="height:36px;" required>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Mobile Number *</label>
              <input type="tel" id="book-mobile" class="form-control" style="height:36px;" required>
            </div>
            <div class="form-group" style="grid-column:span 2;">
              <label class="form-label">Permanent Address</label>
              <input type="text" id="book-address" class="form-control" style="height:36px;" placeholder="Address Details">
            </div>
            <div class="form-group">
              <label class="form-label">Next of Kin Name *</label>
              <input type="text" id="book-nok-name" class="form-control" style="height:36px;" required>
            </div>
            <div class="form-group">
              <label class="form-label">NOK Mobile *</label>
              <input type="tel" id="book-nok-mobile" class="form-control" style="height:36px;" required>
            </div>
            <div class="form-group">
              <label class="form-label">Payer Category *</label>
              <select id="book-payer" class="form-select" style="height:36px;" onchange="window.onBookingPayerChanged(this.value)" required>
                <option value="Self Pay">Self Pay (Cash/UPI)</option>
                <option value="Star Health">Star Health Insurance</option>
                <option value="HDFC ERGO">HDFC ERGO Cashless</option>
                <option value="ICICI Lombard">ICICI Lombard Cashless</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Consultant / Surgeon *</label>
              <select id="book-doctor" class="form-select" style="height:36px;" required>
                ${window.state.doctors.map(d => `<option value="${d.name}">${d.name} (${d.spec})</option>`).join('')}
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Daycare Procedure *</label>
              <select id="book-procedure" class="form-select" style="height:36px;" onchange="window.onBookingProcedureChanged(this.value)" required>
                <option value="Cataract Surgery">Cataract Surgery (Expected: 3h)</option>
                <option value="Chemotherapy Infusion">Chemotherapy Infusion (Expected: 4h)</option>
                <option value="Biopsy Sample Collection">Biopsy Sample Collection (Expected: 2h)</option>
                <option value="Endoscopy Scope Evaluation">Endoscopy Scope Evaluation (Expected: 2h)</option>
                <option value="Dialysis Treatment">Dialysis Treatment (Expected: 5h)</option>
                <option value="Laparoscopic Cholecystectomy">Laparoscopic Cholecystectomy (Expected: 10h)</option>
                <option value="Major Spine Reconstruction">Major Spine Reconstruction (Expected: 13h - Warning Ceiling)</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Procedure Expected Duration (Hours) *</label>
              <input type="number" id="book-duration" class="form-control" style="height:36px;" min="1" max="24" value="3" oninput="window.onBookingDurationInput(this.value)" required>
              <div id="duration-warning" style="display:none; font-size:11px; font-weight:700; color:#ef4444; margin-top:4px;">
                ⚠️ Warning: Procedure exceeds 12-hour daycare stay ceiling. Recommending IPD Admission.
              </div>
            </div>
          </div>

          <!-- Payer Cashless Eligibility Verification Gate -->
          <div id="payer-gate-box" style="display:none; background:#eff6ff; border:1px solid #bfdbfe; border-radius:8px; padding:15px; margin-bottom:15px;">
            <div style="font-size:12px; font-weight:800; color:#1e3a8a; margin-bottom:6px; display:flex; justify-content:space-between; align-items:center;">
              <span>🛡️ Payer Cashless Daycare Eligibility Gate</span>
              <span id="payer-gate-status" class="badge" style="font-size:10px;">Eligible</span>
            </div>
            <p id="payer-gate-msg" style="font-size:11px; color:#475569; margin:0 0 10px 0;"></p>
            
            <!-- Logged Override reason box -->
            <div id="payer-override-box" style="display:none;">
              <label class="form-label" style="font-size:11px; font-weight:700; color:#b45309; margin-bottom:4px;">⚠️ Logged Override Reason (Mandatory to bypass Cashless blockage):</label>
              <textarea id="payer-override-reason" class="form-control" style="height:55px; border:1.5px solid #f59e0b;" placeholder="Provide clinical / operational reason for override check..."></textarea>
            </div>
          </div>

          <!-- Fasting & Attendant pre-op instructions -->
          <div style="background:#f8fafc; border:1.5px solid #e2e8f0; border-radius:8px; padding:15px; margin-bottom:20px;">
            <div style="font-size:12px; font-weight:800; color:#334155; margin-bottom:8px;">📝 Pre-Procedure Instructions</div>
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:15px;">
              <div class="form-group" style="margin:0;">
                <label class="form-label">Sedation / GA Required?</label>
                <select id="book-sedation" class="form-select" style="height:32px;" onchange="window.onBookingSedationChanged(this.value)">
                  <option value="No">No</option>
                  <option value="Yes">Yes (Sedation/General Anesthesia)</option>
                </select>
              </div>
              <div class="form-group" style="margin:0;">
                <label class="form-label">Required Fasting (NPO) Hours</label>
                <input type="number" id="book-fasting-req" class="form-control" style="height:32px;" min="0" max="12" value="0">
              </div>
            </div>
            <div id="attendant-warning-box" style="display:none; font-size:11px; color:#475569; margin-top:8px; font-weight:600;">
              ℹ️ Attendant Policy: Since sedation/GA is checked, the patient is required to arrive accompanied by a responsible adult attendant for recovery handover and discharge clearance.
            </div>
          </div>

          <div style="text-align:right;">
            <button type="submit" class="btn btn-primary" style="padding:10px 24px; font-weight:800; font-size:13px; background:#1b3a5c;">Confirm Daycare Booking & Admission</button>
          </div>
        </form>
      </div>
    `;
  };

  // --------------------------------------------------------------------------
  // TAB 3: POST-DISCHARGE & RETURNS LOGS
  // --------------------------------------------------------------------------
  const renderFollowUpHTML = () => {
    const discharged = activeAdmissions.filter(a => a.status === 'Cleared & Discharged');
    const returnLogs = window.state.unplannedReturns || [];

    return `
      <div style="text-align:left;">
        <h4 style="font-size:14px; font-weight:800; color:#1b3a5c; border-bottom:1.5px solid var(--border-color); padding-bottom:6px; margin-bottom:15px;">📞 24-48h Post-Discharge Callbacks &amp; Returns</h4>

        <div style="display:grid; grid-template-columns:1.5fr 1fr; gap:20px;">
          <!-- Left side: Discharged callbacks -->
          <div>
            <div style="font-weight:800; font-size:12px; color:#334155; margin-bottom:10px;">Post-Discharge Call Task List (24-48 Hours)</div>
            ${discharged.length === 0 ? `
              <div style="font-size:12px; color:#64748b; font-style:italic; background:#f8fafc; border:1px dashed #cbd5e1; padding:20px; text-align:center; border-radius:8px;">
                No discharged daycare patients ready for post-discharge call tasking yet.
              </div>
            ` : `
              <div style="display:flex; flex-direction:column; gap:10px;">
                ${discharged.map(a => {
                  const completed = a.callbackComplete;
                  return `
                    <div style="background:white; border:1px solid #cbd5e1; border-radius:8px; padding:12px 15px; display:flex; justify-content:space-between; align-items:center;">
                      <div>
                        <div style="font-weight:800; color:#1b3a5c; font-size:12.5px;">${a.patient.name}</div>
                        <div style="font-size:11px; color:#64748b; margin-top:2px;">UHID: ${a.patient.uhid} | Mob: ${a.patient.mobile}</div>
                        <div style="font-size:11px; color:#475569; font-weight:600;">Discharged: ${new Date(a.billingInfo.dischargeTimestamp).toLocaleString()}</div>
                      </div>
                      <div>
                        ${completed ? `
                          <span style="font-size:11px; font-weight:800; color:#15803d; background:#dcfce7; padding:4px 10px; border-radius:12px;">✓ Call Logged</span>
                        ` : `
                          <button class="btn-primary" style="background:#1b3a5c; font-size:10px; padding:4px 10px;" onclick="window.triggerCallbackLog('${a.patient.uhid}')">📞 Log Callback</button>
                        `}
                      </div>
                    </div>
                  `;
                }).join('')}
              </div>
            `}
          </div>

          <!-- Right side: Unplanned Return Linkages (7 Days Readmissions Quality) -->
          <div>
            <div style="font-weight:800; font-size:12px; color:#991b1b; margin-bottom:10px;">7-Day Unplanned ER Return link log (Quality Indicator)</div>
            
            <div style="background:#fff5f5; border:1px solid #feb2b2; border-radius:8px; padding:12px; margin-bottom:15px;">
              <div style="font-size:11.5px; font-weight:700; color:#c53030; margin-bottom:6px;">⚠️ Simulate ER Return / Readmission:</div>
              <p style="font-size:10px; color:#742a2a; margin:0 0 10px 0;">Trigger a simulated unplanned ER return for a discharged patient within 7 days to record readmission linking.</p>
              
              <div style="display:grid; grid-template-columns:1.5fr 1fr; gap:6px;">
                <select id="simulate-return-uhid" class="form-select" style="height:28px; font-size:11px;">
                  ${discharged.map(a => `<option value="${a.patient.uhid}">${a.patient.name} (${a.patient.uhid})</option>`).join('')}
                  ${discharged.length === 0 ? `<option value="">No patients available</option>` : ''}
                </select>
                <button class="btn-primary" style="background:#c53030; font-size:10px; padding:4px 8px;" ${discharged.length === 0 ? 'disabled' : ''} onclick="window.simulateERReturnLink()">🚨 Trigger Return</button>
              </div>
            </div>

            <div style="font-weight:700; font-size:12px; color:#475569; margin-bottom:8px;">Linked Return Registry:</div>
            <div style="display:flex; flex-direction:column; gap:8px;">
              ${returnLogs.length === 0 ? `
                <div style="font-size:11px; color:#64748b; font-style:italic;">No unplanned return logs recorded yet.</div>
              ` : `
                ${returnLogs.map(r => `
                  <div style="background:#fafafa; border:1px solid #cbd5e1; border-radius:6px; padding:8px 12px; font-size:11px;">
                    <div style="font-weight:800; color:#1b3a5c;">Patient: ${r.patientName} (${r.uhid})</div>
                    <div style="color:#ef4444; font-weight:700; margin-top:2px;">Linked Return: ER Admitted (${r.daysSinceDischarge} Days post-discharge)</div>
                    <div style="color:#64748b; font-size:10px;">Attributed Event ID: ${r.episodeId} | Checked: ${new Date(r.flaggedAt).toLocaleString()}</div>
                  </div>
                `).join('')}
              `}
            </div>
          </div>
        </div>
      </div>
    `;
  };

  // --------------------------------------------------------------------------
  // TAB 4: DAYCARE AUDIT LEDGER
  // --------------------------------------------------------------------------
  const renderAuditHTML = () => {
    const logs = window.state.daycareAuditLogs || [];
    return `
      <div style="text-align:left;">
        <h4 style="font-size:14px; font-weight:800; color:#1b3a5c; border-bottom:1.5px solid var(--border-color); padding-bottom:6px; margin-bottom:15px;">🛡️ Daycare Quality Audit Trail (NABH Compliance)</h4>
        
        <div style="overflow-x:auto; background:white; border:1px solid #cbd5e1; border-radius:8px;">
          <table style="width:100%; font-size:11.5px; border-collapse:collapse;">
            <thead>
              <tr style="background:#f1f5f9; font-weight:700; border-bottom:1px solid #cbd5e1; text-transform:uppercase;">
                <th style="padding:10px; text-align:left;">Timestamp</th>
                <th style="padding:10px; text-align:left;">Patient UHID</th>
                <th style="padding:10px; text-align:left;">Workflow Phase</th>
                <th style="padding:10px; text-align:left;">Action Detail</th>
                <th style="padding:10px; text-align:left;">User Operator</th>
              </tr>
            </thead>
            <tbody>
              ${logs.length === 0 ? `
                <tr><td colspan="5" style="padding:20px; text-align:center; color:#64748b; font-style:italic;">No daycare audit actions recorded in session yet.</td></tr>
              ` : `
                ${logs.map(l => `
                  <tr style="border-bottom:1px solid #e2e8f0;">
                    <td style="padding:8px 10px; font-family:monospace; color:#64748b;">${new Date(l.timestamp).toLocaleString()}</td>
                    <td style="padding:8px 10px; font-weight:700; color:#1e3a8a;">${l.uhid}</td>
                    <td style="padding:8px 10px;"><span class="badge" style="font-size:9.5px;">${l.phase}</span></td>
                    <td style="padding:8px 10px; color:#334155;">${l.action}</td>
                    <td style="padding:8px 10px; font-weight:600; color:#475569;">${l.user} (${l.role})</td>
                  </tr>
                `).join('')}
              `}
            </tbody>
          </table>
        </div>
      </div>
    `;
  };

  // Render workspace
  container.innerHTML = `
    <div style="background: white; border: 1px solid var(--border-color); border-radius: 12px; display: flex; flex-direction: column;">
      ${renderHeaderHTML()}
      
      <div style="padding: 20px; min-height: 500px;">
        ${window.activeDaycareTab === 'board' ? renderClinicalBoardHTML() : ''}
        ${window.activeDaycareTab === 'booking' ? renderBookingGateHTML() : ''}
        ${window.activeDaycareTab === 'followup' ? renderFollowUpHTML() : ''}
        ${window.activeDaycareTab === 'audit' ? renderAuditHTML() : ''}
      </div>
    </div>

    <!-- IPD Conversion Modal Box -->
    <div id="ipd-conversion-modal" style="display:none; position:fixed; inset:0; background:rgba(0,0,0,0.5); z-index:9999; justify-content:center; align-items:center;">
      <div style="background:white; border-radius:8px; max-width:480px; width:100%; border:1px solid #cbd5e1; padding:20px; text-align:left;">
        <h4 style="margin:0 0 10px 0; font-weight:800; color:#ef4444; border-bottom:1px solid #e2e8f0; padding-bottom:6px;">⚠️ Request IPD Admission Conversion</h4>
        <p style="font-size:12px; color:#475569; line-height:1.4; margin-bottom:12px;">This action converts the patient's daycare package status, voids Daycare accommodation charges, and schedules bed transfer requests to the IPD Ward.</p>
        
        <input type="hidden" id="conv-uhid-input">
        
        <div class="form-group">
          <label class="form-label" style="font-weight:700;">Clinical Justification (Required) *</label>
          <textarea id="conv-justification" class="form-control" style="height:60px;" placeholder="e.g., Post-op voiding failure, requires overnight cardiac monitoring..."></textarea>
        </div>

        <div class="form-group">
          <label class="form-label" style="font-weight:700;">Target IPD Ward Category *</label>
          <select id="conv-ward-cat" class="form-select">
            <option value="GENERAL-WARD-M">General Ward (Male) - Deposit: ₹5,000</option>
            <option value="GENERAL-WARD-F">General Ward (Female) - Deposit: ₹5,000</option>
            <option value="SEMI-PRIVATE">Semi-Private Ward - Deposit: ₹10,000</option>
            <option value="PRIVATE">Private Room - Deposit: ₹15,000</option>
          </select>
        </div>

        <div style="display:flex; justify-content:flex-end; gap:10px; margin-top:15px;">
          <button class="btn btn-secondary" onclick="window.closeIPDConversionPanel()">Cancel</button>
          <button class="btn btn-primary" style="background:#ef4444; border-color:#ef4444;" onclick="window.submitIPDConversion()">Confirm IPD Conversion</button>
        </div>
      </div>
    </div>
  `;

  // Start Interval Timer to calculate elapsed stays without losing typed state
  window._daycareTimerId = setInterval(updateLiveStayTimers, 10000);

  function updateLiveStayTimers() {
    const timerEls = document.querySelectorAll('.live-stay-timer');
    timerEls.forEach(el => {
      const admittedTime = el.getAttribute('data-admitted-time');
      if (!admittedTime) return;
      const elapsed = getElapsedTime(admittedTime);
      el.textContent = `🕒 ${elapsed.hours}h ${elapsed.minutes}m elapsed`;

      // Update color coding and alert cards dynamically
      const parentCard = el.closest('.bed-card');
      if (parentCard) {
        // Reset classes
        parentCard.classList.remove('bed-housekeeping-pending', 'sla-breached-alert');
        
        if (elapsed.hours < 10) {
          el.style.color = 'var(--color-success)';
        } else if (elapsed.hours >= 10 && elapsed.hours < 12) {
          el.style.color = '#f59e0b';
          parentCard.classList.add('bed-housekeeping-pending');
        } else {
          el.style.color = 'var(--color-danger)';
          parentCard.classList.add('sla-breached-alert');
        }
      }
    });
  }

  // --------------------------------------------------------------------------
  // EVENT ACTIONS & INTERACTIVE JS FUNCTIONS
  // --------------------------------------------------------------------------
  window.setDaycareTab = function(tabName) {
    window.activeDaycareTab = tabName;
    window.views.daybed(container, subAnchor, params);
  };

  window.setDaycareRole = function(roleName) {
    window.daycareRole = roleName;
    window.views.daybed(container, subAnchor, params);
  };

  window.selectDaycareBed = function(bedId) {
    window.selectedDaycareBed = bedId;
    window.views.daybed(container, subAnchor, params);
  };

  // --------------------------------------------------------------------------
  // PATIENT LOOKUP & PRE-FILL
  // --------------------------------------------------------------------------
  window.lookupBookingPatient = function(query) {
    const resultsDiv = document.getElementById('booking-lookup-results');
    if (!resultsDiv) return;
    if (!query || query.length < 2) {
      resultsDiv.style.display = 'none';
      return;
    }

    const matches = (window.state.patients || []).filter(p => 
      p.name.toLowerCase().includes(query.toLowerCase()) ||
      p.uhid.toLowerCase().includes(query.toLowerCase()) ||
      (p.mobile && p.mobile.includes(query))
    );

    if (matches.length === 0) {
      resultsDiv.style.display = 'none';
      return;
    }

    resultsDiv.innerHTML = matches.map(p => `
      <div style="padding: 6px; border-bottom: 1px solid var(--border-color); cursor: pointer; background: var(--bg-surface); font-size:12px;" onclick="window.selectBookingPatient('${p.uhid}')">
        <strong>${p.name}</strong> (${p.gender}/${p.age} Yrs) <br>
        <small style="color:var(--text-muted)">UHID: ${p.uhid} | Mob: ${p.mobile || 'N/A'}</small>
      </div>
    `).join('');
    resultsDiv.style.display = 'block';
  };

  window.selectBookingPatient = function(uhid) {
    const patient = window.state.patients.find(p => p.uhid === uhid);
    if (!patient) return;

    document.getElementById('book-name').value = patient.name;
    document.getElementById('book-age').value = patient.age;
    document.getElementById('book-gender').value = patient.gender;
    document.getElementById('book-mobile').value = patient.mobile || '';
    document.getElementById('book-address').value = patient.address || '';
    document.getElementById('book-nok-name').value = patient.nokName || (patient.emergencyContact ? patient.emergencyContact.name : 'Relative');
    document.getElementById('book-nok-mobile').value = patient.nokMobile || (patient.emergencyContact ? patient.emergencyContact.phone : '');
    
    const resultsDiv = document.getElementById('booking-lookup-results');
    if (resultsDiv) resultsDiv.style.display = 'none';
  };

  window.selectProcedureAppointmentCheckin = function(aptId) {
    const apt = (window.state.appointments || []).find(a => a.appointmentId === aptId);
    if (!apt) return;

    // Prefill central registry fields
    document.getElementById('book-name').value = apt.patientName;
    document.getElementById('book-mobile').value = apt.mobile || '';
    
    // Find patient profile for remaining demographics
    const patient = (window.state.patients || []).find(p => p.uhid === apt.uhid);
    if (patient) {
      document.getElementById('book-age').value = patient.age || '';
      document.getElementById('book-gender').value = patient.gender || 'Male';
      document.getElementById('book-address').value = patient.address || '';
      document.getElementById('book-nok-name').value = patient.nokName || (patient.emergencyContact ? patient.emergencyContact.name : 'Relative');
      document.getElementById('book-nok-mobile').value = patient.nokMobile || (patient.emergencyContact ? patient.emergencyContact.phone : '');
    }

    // Prefill procedure & doctor & payer
    document.getElementById('book-procedure').value = apt.procedureName;
    document.getElementById('book-doctor').value = apt.doctorName;
    
    // If patient is CGHS or has payer, map it
    if (patient && patient.payer) {
      document.getElementById('book-payer').value = patient.payer;
    } else {
      document.getElementById('book-payer').value = 'Self Pay';
    }

    // Trigger updates
    window.onBookingProcedureChanged(apt.procedureName);

    // Alert user
    alert(`Pre-filled booking details for ${apt.patientName}. Select an active bed and click Confirm Daycare Booking.`);
  };

  // --------------------------------------------------------------------------
  // ELIGIBILITY FILTERS & GATES
  // --------------------------------------------------------------------------
  window.onBookingPayerChanged = function(payer) {
    const gateBox = document.getElementById('payer-gate-box');
    const gateStatus = document.getElementById('payer-gate-status');
    const gateMsg = document.getElementById('payer-gate-msg');
    const overrideBox = document.getElementById('payer-override-box');

    if (!gateBox) return;

    if (payer === 'Self Pay') {
      gateBox.style.display = 'none';
      overrideBox.style.display = 'none';
      return;
    }

    gateBox.style.display = 'block';
    const proc = document.getElementById('book-procedure').value;
    const eligibleList = window.state.daycarePayerProcedureLists[payer] || [];
    const isEligible = eligibleList.includes(proc);

    if (isEligible) {
      gateStatus.textContent = 'ELIGIBLE';
      gateStatus.style.background = '#dcfce7';
      gateStatus.style.color = '#15803d';
      gateMsg.innerHTML = `✓ <strong>${proc}</strong> is on <strong>${payer}</strong>'s pre-approved cashless daycare procedure list. Eligible for cashless billing.`;
      overrideBox.style.display = 'none';
    } else {
      gateStatus.textContent = 'BLOCKED';
      gateStatus.style.background = '#fee2e2';
      gateStatus.style.color = '#b91c1c';
      gateMsg.innerHTML = `❌ <strong>Blockage Gate:</strong> <strong>${proc}</strong> is not listed on <strong>${payer}</strong>'s cashless daycare list. Cashless booking is blocked.`;
      overrideBox.style.display = 'block';
    }
  };

  window.onBookingProcedureChanged = function(proc) {
    const durationInput = document.getElementById('book-duration');
    const sedationSelect = document.getElementById('book-sedation');
    const NPOInput = document.getElementById('book-fasting-req');

    // Expected defaults
    if (proc === 'Cataract Surgery') { durationInput.value = 3; NPOInput.value = 6; sedationSelect.value = 'Yes'; }
    else if (proc === 'Chemotherapy Infusion') { durationInput.value = 4; NPOInput.value = 0; sedationSelect.value = 'No'; }
    else if (proc === 'Biopsy Sample Collection') { durationInput.value = 2; NPOInput.value = 4; sedationSelect.value = 'Yes'; }
    else if (proc === 'Endoscopy Scope Evaluation') { durationInput.value = 2; NPOInput.value = 6; sedationSelect.value = 'Yes'; }
    else if (proc === 'Dialysis Treatment') { durationInput.value = 5; NPOInput.value = 0; sedationSelect.value = 'No'; }
    else if (proc === 'Laparoscopic Cholecystectomy') { durationInput.value = 10; NPOInput.value = 8; sedationSelect.value = 'Yes'; }
    else if (proc === 'Major Spine Reconstruction') { durationInput.value = 13; NPOInput.value = 8; sedationSelect.value = 'Yes'; }

    window.onBookingDurationInput(durationInput.value);
    window.onBookingPayerChanged(document.getElementById('book-payer').value);
    window.onBookingSedationChanged(sedationSelect.value);
  };

  window.onBookingDurationInput = function(hours) {
    const warning = document.getElementById('duration-warning');
    if (warning) {
      warning.style.display = parseInt(hours) >= 12 ? 'block' : 'none';
    }
  };

  window.onBookingSedationChanged = function(sedation) {
    const attendantMsg = document.getElementById('attendant-warning-box');
    if (attendantMsg) {
      attendantMsg.style.display = sedation === 'Yes' ? 'block' : 'none';
    }
  };

  // Submit Booking
  window.submitDaycareBooking = function() {
    const name = document.getElementById('book-name').value;
    const age = parseInt(document.getElementById('book-age').value);
    const gender = document.getElementById('book-gender').value;
    const mobile = document.getElementById('book-mobile').value;
    const address = document.getElementById('book-address').value;
    const nokName = document.getElementById('book-nok-name').value;
    const nokMobile = document.getElementById('book-nok-mobile').value;
    const payer = document.getElementById('book-payer').value;
    const doctor = document.getElementById('book-doctor').value;
    const proc = document.getElementById('book-procedure').value;
    const duration = parseInt(document.getElementById('book-duration').value);
    const sedation = document.getElementById('book-sedation').value;
    const fastingReq = parseInt(document.getElementById('book-fasting-req').value);

    // Duration Check Gate
    if (duration >= 12) {
      alert("Booking Blocked: Procedure's expected stay exceeds the hard 12-hour ceiling. Please refer patient to IPD admission instead.");
      return;
    }

    // Eligibility check
    const eligibleList = window.state.daycarePayerProcedureLists[payer] || [];
    const isEligible = eligibleList.includes(proc) || payer === 'Self Pay';
    let overrideReason = '';

    if (!isEligible) {
      overrideReason = document.getElementById('payer-override-reason').value.trim();
      if (!overrideReason) {
        alert("Booking Blocked: Cashless authorization failed. Logged override reason is required for non-eligible procedures.");
        return;
      }
    }

    // Setup Patient Profile
    let patient = window.state.patients.find(p => p.mobile === mobile);
    if (!patient) {
      const randomId = Math.floor(100000 + Math.random() * 900000);
      patient = {
        uhid: `SH-2026-0${randomId}`,
        name, age, gender, mobile, address,
        nokName, nokMobile, payer, primaryConsultant: doctor,
        status: "Day Care", type: "Daycare"
      };
      window.state.patients.push(patient);
    } else {
      patient.payer = payer;
      patient.primaryConsultant = doctor;
      patient.status = "Day Care";
    }

    // Allocate Bed
    const bedId = window.selectedDaycareBed;
    window.state.bedsStatus[bedId] = {
      wardKey: "DAYCARE",
      status: "Occupied",
      patientUhid: patient.uhid,
      notes: `Daycare: ${proc}`
    };

    // Push Admission
    const newAdm = {
      patient,
      bedId,
      ward: "Daycare Ward",
      bedNo: bedId,
      consultantName: doctor,
      procedureName: proc,
      admissionType: "Daycare",
      admissionTimestamp: new Date().toISOString(),
      status: "Registered",
      sedationRequired: sedation,
      fastingReqHours: fastingReq,
      overrideLogged: overrideReason || null,
      historyLogs: [{ timestamp: new Date().toISOString(), action: "Daycare Booking Admitted & Bed Allocated" }],
      tasks: [
        { id: "vitals-1", name: "Take Pre-Op Vitals (BP, pulse, SpO2, Temp)", completed: false },
        { id: "meds-1", name: "Verify Medication Dose and Frequency", completed: false },
        { id: "postcheck-1", name: "Post-procedure Site Assessment", completed: false }
      ],
      consumablesUsed: []
    };

    window.state.daycareAdmissions.unshift(newAdm);
    window.saveDaycareState();

    // Log Audit Event
    window.state.daycareAuditLogs.push({
      timestamp: new Date().toISOString(),
      uhid: patient.uhid,
      phase: "Admission",
      action: `Daycare Bed Allocated. Cashless Check: ${isEligible ? 'Passed' : 'Overridden'}. Est Duration: ${duration}h.`,
      user: "Front Office Desk",
      role: window.daycareRole
    });

    alert("Daycare Booking Successful & Bed Assigned!");
    window.activeDaycareTab = 'board';
    window.views.daybed(container, subAnchor, params);
  };

  // --------------------------------------------------------------------------
  // CLINICAL CARE DESK LOGS
  // --------------------------------------------------------------------------
  window.onPreopFastingChanged = function(fasting) {
    const hours = document.getElementById('pre-fasting-hours');
    if (hours) {
      hours.disabled = fasting !== 'Yes';
    }
  };

  window.submitPreProcedureChecklist = function(uhid) {
    const adm = activeAdmissions.find(a => a.patient.uhid === uhid && a.status !== 'Cleared & Discharged');
    if (!adm) return;

    const bp = document.getElementById('pre-bp').value;
    const pulse = parseInt(document.getElementById('pre-pulse').value);
    const spo2 = parseInt(document.getElementById('pre-spo2').value);
    const temp = document.getElementById('pre-temp').value;
    const fasting = document.getElementById('pre-fasting').value;
    const fastingHours = parseInt(document.getElementById('pre-fasting-hours').value) || 0;

    // Hard gate Fasting check if sedation required
    if (adm.sedationRequired === 'Yes' && (fasting !== 'Yes' || fastingHours < adm.fastingReqHours)) {
      alert(`Critical Gate Blockage: Patient has inadequate fasting (${fastingHours}h vs required ${adm.fastingReqHours}h NPO). Procedure under Sedation/GA cannot proceed.`);
      return;
    }

    adm.checklist = {
      bp, pulse, spo2, temp, fasting, fastingHours,
      consent: 'Yes',
      timestamp: new Date().toISOString()
    };
    adm.status = 'Pre-op Checklist Done';
    adm.historyLogs.push({ timestamp: new Date().toISOString(), action: "Pre-Procedure Checklist Verified & Signed Off" });
    
    // Log Audit Event
    window.state.daycareAuditLogs.push({
      timestamp: new Date().toISOString(),
      uhid: uhid,
      phase: "Pre-Op Preparation",
      action: `Checklist Verified. BP: ${bp}, Pulse: ${pulse}, Fasting Hours: ${fastingHours}h.`,
      user: "Daycare Staff Nurse",
      role: window.daycareRole
    });

    window.saveDaycareState();
    window.views.daybed(container, subAnchor, params);
  };

  window.submitPreAnesthesiaFitness = function(uhid) {
    const adm = activeAdmissions.find(a => a.patient.uhid === uhid && a.status !== 'Cleared & Discharged');
    if (!adm) return;

    const asa = document.getElementById('anes-asa').value;
    const mallampati = document.getElementById('anes-mallampati').value;
    const premeds = document.getElementById('anes-premeds').value;

    adm.anesthesiaLog = {
      asa, mallampati, premeds,
      fitnessCleared: true,
      anesthesiologist: "Dr. Arvind Prasad",
      timestamp: new Date().toISOString()
    };

    adm.status = 'Orders Saved';
    adm.historyLogs.push({ timestamp: new Date().toISOString(), action: "Pre-Anesthesia Fitness Check Cleared" });

    // Log Audit Event
    window.state.daycareAuditLogs.push({
      timestamp: new Date().toISOString(),
      uhid: uhid,
      phase: "Anesthesiology",
      action: `Fitness Cleared. ASA: ${asa}, Mallampati: ${mallampati}. Pre-meds ordered: ${premeds}`,
      user: "Dr. Arvind Prasad",
      role: window.daycareRole
    });

    window.saveDaycareState();
    window.views.daybed(container, subAnchor, params);
  };

  window.savePrepHandover = function(uhid) {
    const adm = activeAdmissions.find(a => a.patient.uhid === uhid && a.status !== 'Cleared & Discharged');
    if (!adm) return;

    adm.status = 'Tasks Updated';
    adm.historyLogs.push({ timestamp: new Date().toISOString(), action: "OT/Procedure Room Handover Verified" });

    // Log Audit Event
    window.state.daycareAuditLogs.push({
      timestamp: new Date().toISOString(),
      uhid: uhid,
      phase: "Handover",
      action: "Patient Handover Completed to OT Coordinator.",
      user: "Daycare Staff Nurse",
      role: window.daycareRole
    });

    window.saveDaycareState();
    window.views.daybed(container, subAnchor, params);
  };

  // --------------------------------------------------------------------------
  // PROCEDURE ROOM LOGS & CONSUMABLES
  // --------------------------------------------------------------------------
  window.addConsumableToProcedure = function() {
    const select = document.getElementById('proc-consumable-select');
    if (!select) return;
    const val = select.value;
    const parts = val.split('|');
    const code = parts[0];
    const name = parts[1];
    
    // Default prices mapping
    let rate = 300;
    if (code === 'IM-Cataract-IOL') rate = 12000;
    if (code === 'CS-Chemo-Cnv') rate = 5500;
    if (code === 'CS-Endo-Kit') rate = 1800;
    if (code === 'CS-Syr-02') rate = 250;

    if (!currentBedAdmission.consumablesUsed) {
      currentBedAdmission.consumablesUsed = [];
    }

    currentBedAdmission.consumablesUsed.push({ code, name, rate });
    window.redrawProcedureConsumables();
  };

  window.redrawProcedureConsumables = function() {
    const div = document.getElementById('added-consumables-list');
    if (!div) return;
    if (!currentBedAdmission.consumablesUsed || currentBedAdmission.consumablesUsed.length === 0) {
      div.innerHTML = `<div style="font-size:11px; color:#64748b; font-style:italic;">No consumables logged yet.</div>`;
      return;
    }

    div.innerHTML = currentBedAdmission.consumablesUsed.map((c, i) => `
      <div style="background:#f1f5f9; border:1px solid #cbd5e1; padding:6px 10px; border-radius:4px; font-size:11.5px; display:flex; justify-content:space-between; align-items:center;">
        <span>📦 <strong>${c.name}</strong></span>
        <div style="display:flex; align-items:center; gap:8px;">
          <span style="font-weight:700; color:#1e3a8a;">₹${c.rate}</span>
          <span style="color:#ef4444; font-weight:900; cursor:pointer;" onclick="window.removeProcedureConsumable(${i})">✕</span>
        </div>
      </div>
    `).join('');
  };

  window.removeProcedureConsumable = function(idx) {
    if (currentBedAdmission.consumablesUsed) {
      currentBedAdmission.consumablesUsed.splice(idx, 1);
    }
    window.redrawProcedureConsumables();
  };

  window.submitProcedureLog = function(uhid) {
    const adm = activeAdmissions.find(a => a.patient.uhid === uhid && a.status !== 'Cleared & Discharged');
    if (!adm) return;

    adm.procedureLog = {
      startTime: document.getElementById('proc-start').value,
      endTime: document.getElementById('proc-end').value,
      notes: document.getElementById('proc-notes').value,
      timestamp: new Date().toISOString()
    };

    adm.status = 'Post-op Monitored';
    adm.historyLogs.push({ timestamp: new Date().toISOString(), action: "Procedure Completed & Recovery Logs Dispatched" });

    // Log Audit Event
    window.state.daycareAuditLogs.push({
      timestamp: new Date().toISOString(),
      uhid: uhid,
      phase: "Procedure",
      action: `Procedure logged complete. Start: ${adm.procedureLog.startTime}, End: ${adm.procedureLog.endTime}.`,
      user: "OT Coordinator",
      role: window.daycareRole
    });

    window.saveDaycareState();
    window.views.daybed(container, subAnchor, params);
  };

  // --------------------------------------------------------------------------
  // ALDRETE RECOVERY CALCULATORS
  // --------------------------------------------------------------------------
  window.recalcAldreteScore = function() {
    const act = parseInt(document.getElementById('aldrete-activity').value);
    const resp = parseInt(document.getElementById('aldrete-respiration').value);
    const circ = parseInt(document.getElementById('aldrete-circulation').value);
    const cons = parseInt(document.getElementById('aldrete-consciousness').value);
    const o2 = parseInt(document.getElementById('aldrete-oxygen').value);

    const total = act + resp + circ + cons + o2;
    const display = document.getElementById('aldrete-total-display');
    if (display) {
      display.textContent = `Score: ${total}/10`;
      display.style.color = total >= 9 ? '#15803d' : '#b91c1c';
    }
  };

  window.signOffDischargeOrder = function(uhid) {
    const adm = activeAdmissions.find(a => a.patient.uhid === uhid && a.status !== 'Cleared & Discharged');
    if (!adm) return;

    // Recalculate Aldrete
    const act = parseInt(document.getElementById('aldrete-activity').value);
    const resp = parseInt(document.getElementById('aldrete-respiration').value);
    const circ = parseInt(document.getElementById('aldrete-circulation').value);
    const cons = parseInt(document.getElementById('aldrete-consciousness').value);
    const o2 = parseInt(document.getElementById('aldrete-oxygen').value);
    const aldreteTotal = act + resp + circ + cons + o2;

    // Checklist gates
    const bp = document.getElementById('post-bp').value;
    const hr = parseInt(document.getElementById('post-hr').value);
    const spo2 = parseInt(document.getElementById('post-spo2').value);
    
    const attendantName = document.getElementById('attendant-name').value.trim();
    const attendantPhone = document.getElementById('attendant-phone').value.trim();
    const attendantPresent = document.getElementById('check-attendant-present').checked;
    const oralIntake = document.getElementById('check-oral-intake').checked;

    // Aldrete Gate Check
    if (adm.sedationRequired === 'Yes' && aldreteTotal < 9) {
      alert(`Discharge Blocked: Aldrete recovery score is inadequate (${aldreteTotal}/10). An objective recovery score >= 9 is required for safe ambulatory release.`);
      return;
    }

    // Attendant Gate Check
    if (adm.sedationRequired === 'Yes' && (!attendantPresent || !attendantName || !attendantPhone)) {
      alert("Discharge Blocked: A verified responsible adult attendant must be physically present and documented for Sedation/GA discharge.");
      return;
    }

    if (!oralIntake) {
      alert("Discharge Blocked: Patient must tolerate oral intake before ambulatory release.");
      return;
    }

    // Issue Physician Discharge
    adm.dischargeLog = {
      bp, hr, spo2, aldreteTotal,
      attendantName, attendantPhone,
      signedOffBy: "Dr. Amit Verma",
      timestamp: new Date().toISOString()
    };

    adm.status = 'Discharge Ordered';
    adm.historyLogs.push({ timestamp: new Date().toISOString(), action: "Physician Discharge Release Signed Off" });

    // Sync to window.state.patients for clearances checklist queue & dashboards
    const pat = window.state.patients.find(p => p.uhid === adm.patient.uhid);
    if (pat) {
      pat.dischargeStatus = 'In Progress — Clearances Pending';
      pat.dischargeOrder = {
        type: 'Daycare',
        condition: 'Stable',
        finalDiagnosis: adm.procedureName || 'Daycare Procedure',
        summary: `Daycare procedure completed. Aldrete score: ${aldreteTotal}. Attendant: ${attendantName}.`,
        timestamp: new Date().toISOString(),
        followUpDoctor: pat.primaryConsultant || 'Dr. Amit Verma'
      };
      pat.dischargeClearances = {
        nursing: { cleared: true, clearedBy: 'Daycare Nurse', clearedAt: new Date().toISOString(), notes: `Aldrete score: ${aldreteTotal}. Voiding checklist OK.` },
        billing: { cleared: false, clearedBy: null, clearedAt: null, outstanding: 1500, receipt: '', notes: '' },
        pharmacy: { cleared: true, clearedBy: 'Pharmacist', clearedAt: new Date().toISOString(), notes: 'No take-home meds needed.' }
      };
      // TPA Cashless authorization if not self-pay
      if (adm.payerType && adm.payerType !== 'Self Pay') {
        pat.dischargeClearances.tpa = { cleared: false, clearedBy: null, clearedAt: null, refNo: '', notes: '' };
      }
      localStorage.setItem('saronil_patients', JSON.stringify(window.state.patients));
    }


    // Log Audit Event
    window.state.daycareAuditLogs.push({
      timestamp: new Date().toISOString(),
      uhid: uhid,
      phase: "Discharge Readiness",
      action: `Discharge Signed Off. Aldrete Score: ${aldreteTotal}. Attendant Present: ${attendantName}.`,
      user: "Dr. Amit Verma",
      role: window.daycareRole
    });

    window.saveDaycareState();
    window.views.daybed(container, subAnchor, params);
  };

  // --------------------------------------------------------------------------
  // BILLING RECONCILIATION & BED RELEASE
  // --------------------------------------------------------------------------
  window.completeDischargeRelease = function(uhid) {
    const adm = activeAdmissions.find(a => a.patient.uhid === uhid && a.status !== 'Cleared & Discharged');
    if (!adm) return;

    const bedId = adm.bedId;
    window.state.bedsStatus[bedId] = {
      wardKey: "DAYCARE",
      status: "Available",
      patientUhid: null,
      notes: ""
    };

    const receiptNo = `REC-${Math.floor(100000 + Math.random() * 900000)}`;
    const dischargeTime = new Date().toISOString();
    const duration = getElapsedTime(adm.admissionTimestamp);

    adm.billingInfo = {
      paymentMode: document.getElementById('dc-paymode').value,
      receiptNo,
      dischargeTimestamp: dischargeTime,
      totalStayMinutes: duration.totalMinutes
    };

    adm.status = 'Cleared & Discharged';
    if (adm.patient) {
      adm.patient.status = 'Discharged';
    }

    // Sync to window.state.patients
    const pat = window.state.patients.find(p => p.uhid === uhid);
    if (pat) {
      pat.status = 'Discharged';
      pat.dischargeStatus = 'Completed';
      pat.dischargeDate = new Date().toLocaleDateString('en-CA') + ' ' + new Date().toLocaleTimeString('en-US', {hour:'2-digit', minute:'2-digit'});
      localStorage.setItem('saronil_patients', JSON.stringify(window.state.patients));
    }

    adm.historyLogs.push({ timestamp: dischargeTime, action: `Payment verified. Bed DC-B${bedId.replace(/[^0-9]/g, '')} released.` });

    // Log Audit Event
    window.state.daycareAuditLogs.push({
      timestamp: new Date().toISOString(),
      uhid: uhid,
      phase: "Billing & Release",
      action: `Bill Cleared. Receipt: ${receiptNo}. Duration: ${duration.hours}h ${duration.minutes}m. Bed released.`,
      user: "Billing Cashier Desk",
      role: window.daycareRole
    });

    window.saveDaycareState();

    alert(`Daycare Release Complete!\nTotal Stay: ${duration.hours}h ${duration.minutes}m.\nReceipt: ${receiptNo} generated.`);
    window.activeDaycareTab = 'board';
    window.views.daybed(container, subAnchor, params);
  };

  // --------------------------------------------------------------------------
  // CONVERSION TO IPD PANEL
  // --------------------------------------------------------------------------
  window.triggerIPDConversionPanel = function(uhid) {
    // RBAC: Restricted to Physician or Unit In-charge
    if (window.daycareRole !== 'Daycare Physician' && window.daycareRole !== 'Daycare Unit In-charge (Nursing)' && window.daycareRole !== 'Hospital Administrator') {
      alert("Role Blocked: IPD Admission Conversion is restricted to Physician or Daycare Unit In-charge roles only.");
      return;
    }

    document.getElementById('conv-uhid-input').value = uhid;
    document.getElementById('conv-justification').value = '';
    
    const modal = document.getElementById('ipd-conversion-modal');
    if (modal) {
      modal.style.display = 'flex';
    }
  };

  window.closeIPDConversionPanel = function() {
    const modal = document.getElementById('ipd-conversion-modal');
    if (modal) {
      modal.style.display = 'none';
    }
  };

  window.submitIPDConversion = function() {
    const uhid = document.getElementById('conv-uhid-input').value;
    const justification = document.getElementById('conv-justification').value.trim();
    const targetWardKey = document.getElementById('conv-ward-cat').value;

    if (!justification) {
      alert("Justification is required for IPD conversion.");
      return;
    }

    const adm = activeAdmissions.find(a => a.patient.uhid === uhid && a.status !== 'Cleared & Discharged');
    if (!adm) return;

    const conversionTime = new Date().toISOString();
    const bedId = adm.bedId;

    // IPD Bed Transfer Request creation
    const reqId = `REQ-${Math.floor(100 + Math.random() * 900)}`;
    window.state.ipdAdmissionRequests = window.state.ipdAdmissionRequests || [];
    window.state.ipdAdmissionRequests.push({
      id: reqId,
      uhid: uhid,
      patientName: adm.patient.name,
      doctorName: adm.consultantName,
      ward: targetWardKey,
      diagnose: `Converted from daycare. Justification: ${justification}`,
      payer: adm.patient.payer || "Self Pay",
      status: "Requested",
      requestedAt: conversionTime
    });

    // Void Daycare bill & reclassify to IPD Deposit
    let depositRequired = targetWardKey === 'PRIVATE' ? 15000 : (targetWardKey === 'SEMI-PRIVATE' ? 10000 : 5000);
    window.state.billing.push({
      id: `INV-${Math.floor(70000 + Math.random() * 9000)}`,
      uhid: uhid,
      patientName: adm.patient.name,
      amount: depositRequired,
      paid: 0,
      status: "Pending",
      date: window._HIS_DATE(0),
      items: [{ desc: `IPD Advance Deposit - Room Classify: ${targetWardKey}`, qty: 1, rate: depositRequired, total: depositRequired }]
    });

    // Release daycare bed
    window.state.bedsStatus[bedId] = {
      wardKey: "DAYCARE",
      status: "Available",
      patientUhid: null,
      notes: ""
    };

    // Update daycare episode status to 'Converted to IPD'
    adm.status = 'Converted to IPD';
    adm.conversionEvent = {
      triggeredBy: window.daycareRole,
      justification,
      triggeredAt: conversionTime,
      bedTransferRequestId: reqId
    };

    // Audit logs
    window.state.daycareAuditLogs.push({
      timestamp: conversionTime,
      uhid: uhid,
      phase: "IPD Conversion",
      action: `IPD Conversion requested. Billing reclassified to IPD deposit. Transfer Request: ${reqId}.`,
      user: "Dr. Amit Verma",
      role: window.daycareRole
    });

    window.saveDaycareState();
    window.closeIPDConversionPanel();

    alert(`Conversion Complete!\nBilling reclassified to IPD deposit.\nBed Transfer Request ${reqId} dispatched to ward queue.`);
    window.activeDaycareTab = 'board';
    window.views.daybed(container, subAnchor, params);
  };

  // --------------------------------------------------------------------------
  // FOLLOW UP & SIMULATED ER RETURNS
  // --------------------------------------------------------------------------
  window.triggerCallbackLog = function(uhid) {
    const adm = activeAdmissions.find(a => a.patient.uhid === uhid);
    if (!adm) return;

    adm.callbackComplete = true;
    adm.historyLogs.push({ timestamp: new Date().toISOString(), action: "24-48h Post-discharge callback logged" });

    // Log Audit Event
    window.state.daycareAuditLogs.push({
      timestamp: new Date().toISOString(),
      uhid: uhid,
      phase: "Post-Discharge Follow-Up",
      action: "24-48h callback task completed. Patient reported stable recovery.",
      user: "Daycare Coordinator",
      role: window.daycareRole
    });

    window.saveDaycareState();
    window.views.daybed(container, subAnchor, params);
  };

  window.simulateERReturnLink = function() {
    const uhid = document.getElementById('simulate-return-uhid').value;
    if (!uhid) return;

    const adm = activeAdmissions.find(a => a.patient.uhid === uhid);
    if (!adm) return;

    const days = Math.floor(1 + Math.random() * 5);
    const returnTime = new Date().toISOString();

    window.state.unplannedReturns = window.state.unplannedReturns || [];
    window.state.unplannedReturns.push({
      uhid,
      patientName: adm.patient.name,
      episodeId: `DC-EP-${Math.floor(100 + Math.random() * 900)}`,
      daysSinceDischarge: days,
      flaggedAt: returnTime
    });

    // Log Audit Event
    window.state.daycareAuditLogs.push({
      timestamp: returnTime,
      uhid: uhid,
      phase: "Quality Auditing",
      action: `Unplanned readmission return linked back to daycare episode (Days since discharge: ${days}).`,
      user: "ER Registrar Desk",
      role: window.daycareRole
    });

    window.views.daybed(container, subAnchor, params);
  };
};
