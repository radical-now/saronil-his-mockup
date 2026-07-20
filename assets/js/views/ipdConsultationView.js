/* ==========================================================================
   SARONIL HMS — IPD CONSULTATION MODULE
   Route: #ipdConsultation  |  RBAC: Consultant, Resident, Duty Doc, Referred Specialist, Nurse
   ========================================================================== */
'use strict';
window.views = window.views || {};

(function () {

  // Initialize central database keys if not present
  function initIPDConsultationState() {
    if (!window.state) window.state = {};
    
    // Seed default collections if empty
    if (!window.state.progressNotes) {
      window.state.progressNotes = [
        {
          note_id: 'NOTE-101',
          uhid: 'SH-2026-00001',
          visit_type: 'Round',
          soap_subjective: 'Patient reports mild chest discomfort during exertion.',
          soap_objective: 'Chest clear. HR 78, BP 130/85. Heart sounds normal.',
          soap_assessment: 'CAD status post-PTCA, stable.',
          soap_plan: 'Continue Tab Pantocid 40mg. Monitor vitals Q8H.',
          authored_by: 'Resident Dr. Rohan',
          cosign_status: 'pending',
          cosigned_by: null,
          locked_at: new Date(Date.now() - 3600000).toISOString(),
          addenda: []
        },
        {
          note_id: 'NOTE-102',
          uhid: 'SH-2026-00002',
          visit_type: 'Round',
          soap_subjective: 'Patient feels much better. No dyspnea today.',
          soap_objective: 'BP 118/75, Lungs clear.',
          soap_assessment: 'Post-op recovery - Day 3, progressing well.',
          soap_plan: 'Escalate mobilization. Plan discharge tomorrow.',
          authored_by: 'Dr. Priya Nair',
          cosign_status: 'signed',
          cosigned_by: 'Dr. Priya Nair',
          locked_at: new Date(Date.now() - 7200000).toISOString(),
          addenda: []
        }
      ];
    }

    if (!window.state.orderSets) {
      window.state.orderSets = [
        {
          order_id: 'ORD-501',
          uhid: 'SH-2026-00001',
          order_type: 'medication',
          details: 'Tab Pantoprazole 40mg once daily',
          clinical_indication: 'Prophylaxis for acid reflux',
          tpa_preauth_required: false,
          status: 'Active'
        },
        {
          order_id: 'ORD-502',
          uhid: 'SH-2026-00001',
          order_type: 'procedure',
          details: 'Coronary Angiography (CAG)',
          clinical_indication: 'Recurrent angina',
          tpa_preauth_required: true,
          status: 'Pending Consent'
        }
      ];
    }

    if (!window.state.referralRequests) {
      window.state.referralRequests = [
        {
          referral_id: 'REF-201',
          uhid: 'SH-2026-00001',
          from_consultant_id: 'Dr. Priya Nair',
          to_specialty: 'Cardiology',
          to_consultant_id: 'Dr. Ramesh Kumar',
          reason: 'Evaluate for CAG planning',
          urgency: 'Routine',
          status: 'Pending'
        }
      ];
    }

    if (!window.state.criticalValueAlerts) {
      window.state.criticalValueAlerts = [
        {
          alert_id: 'ALR-801',
          uhid: 'SH-2026-00001',
          value_type: 'Serum Potassium (K+)',
          value: '6.8 mEq/L',
          flagged_at: new Date(Date.now() - 1200000).toISOString(), // 20 min ago
          acknowledged_by: null,
          acknowledged_at: null,
          escalated_to: null,
          escalated_at: null
        }
      ];
    }

    if (!window.state.verbalOrders) {
      window.state.verbalOrders = [
        {
          order_id: 'VORD-901',
          uhid: 'SH-2026-00002',
          details: 'Inj Furosemide 20mg IV stat',
          entered_by_nurse: 'Staff Nurse Mary',
          read_back_confirmed: true,
          ordering_doctor_id: 'Dr. Priya Nair',
          cosign_status: 'pending',
          cosigned_at: null
        }
      ];
    }

    if (!window.state.shiftHandovers) {
      window.state.shiftHandovers = [
        {
          handover_id: 'HND-401',
          uhid: 'SH-2026-00001',
          outgoing_doctor_id: 'Dr. Priya Nair',
          incoming_doctor_id: 'Dr. Ramesh Kumar',
          situation: 'Stable post CAG.',
          background: 'History of CAD.',
          assessment: 'No active pain today.',
          recommendation: 'Monitor vitals Q4H. Watch radial sheath site.',
          timestamp: new Date(Date.now() - 43200000).toISOString()
        }
      ];
    }

    if (!window.state.limitationOfCareRecords) {
      window.state.limitationOfCareRecords = [];
    }

    // Default simulation persona role if not set
    if (!window._ipdActiveRole) {
      window._ipdActiveRole = 'Consultant';
    }
  }

  // Active state role list helper
  var ROLES = [
    'Consultant',
    'Resident / Covering Doctor',
    'Duty / On-call Doctor',
    'Referred Specialist',
    'Nurse'
  ];

  /* ── VIEW ROUTE ENTRY ────────────────────────────────────────────────────── */
  window.views.ipdConsultation = function (container, subAnchor, params) {
    initIPDConsultationState();

    // Enforce active role dropdown synchronization
    var pageTitleEl = document.getElementById('active-page-title');
    if (pageTitleEl) pageTitleEl.textContent = 'IPD Consultation Module';

    // Run active critical value alert escalation timer checks
    checkUnacknowledgedEscalations();

    var patients = window.state.patients || [];
    var ipdPatients = patients.filter(p => {
      if (p.type !== 'IPD') return false;
      if (p.status === 'Discharged') return false;
      if (p.dischargeStatus === 'Completed') return false;
      if (p.status === 'Discharge Pending') return false;
      if (p.dischargeStatus && p.dischargeStatus.toLowerCase().includes('discharge')) return false;
      if (p.status && p.status.toLowerCase().includes('discharge')) return false;
      return true;
    });

    // Compute KPI metrics
    var totalAdmitted = ipdPatients.length;
    var criticalCount = ipdPatients.filter(p => (p.flags || []).includes('Critical') || (p.newsScore || 0) >= 5).length;
    var unreviewedCount = ipdPatients.filter(p => p.labsUnreviewed).length;
    var verbalPendingCount = (window.state.verbalOrders || []).filter(v => v.cosign_status === 'pending').length;

    // Gather unique consultants list
    const uniqueConsultants = [...new Set(ipdPatients.map(p => p.primaryConsultant).filter(Boolean))].sort();

    // Initialize dropdown filters if undefined
    window._ipdSelectedWard = window._ipdSelectedWard || 'all';
    window._ipdSelectedDoctor = window._ipdSelectedDoctor || 'all';
    window._ipdSelectedSeverity = window._ipdSelectedSeverity || 'all';

    // Helper to extract admission timestamp
    const getAdmissionTime = (p) => {
      if (!p.admitted) return 0;
      const parts = p.admitted.split(' · ');
      const dateStr = parts[0];
      const timeStr = parts[1] || '00:00';
      let parsed = Date.parse(dateStr + ' ' + timeStr);
      if (isNaN(parsed)) {
        const dParts = dateStr.split('/');
        if (dParts.length === 3) {
          const day = parseInt(dParts[0], 10);
          const month = parseInt(dParts[1], 10) - 1;
          const year = parseInt(dParts[2], 10);
          const tParts = timeStr.split(':');
          const hour = parseInt(tParts[0], 10) || 0;
          const min = parseInt(tParts[1], 10) || 0;
          parsed = new Date(year, month, day, hour, min).getTime();
        }
      }
      return isNaN(parsed) ? 0 : parsed;
    };

    // Sort: Recent admissions first (descending timestamp)
    ipdPatients.sort((a, b) => getAdmissionTime(b) - getAdmissionTime(a));

    // Filter by Ward
    if (window._ipdSelectedWard !== 'all') {
      ipdPatients = ipdPatients.filter(p => p.ward === window._ipdSelectedWard);
    }

    // Filter by Attending Doctor
    if (window._ipdSelectedDoctor !== 'all') {
      ipdPatients = ipdPatients.filter(p => p.primaryConsultant === window._ipdSelectedDoctor);
    }

    // Filter by Severity
    if (window._ipdSelectedSeverity !== 'all') {
      ipdPatients = ipdPatients.filter(p => {
        const isCrit = (p.flags || []).includes('Critical') || (p.newsScore || 0) >= 5;
        const hasCritAlarm = (window.state.criticalValueAlerts || []).some(a => a.uhid === p.uhid && !a.acknowledged_by);
        const hasVerbalPending = (window.state.verbalOrders || []).some(v => v.uhid === p.uhid && v.cosign_status === 'pending');
        
        if (window._ipdSelectedSeverity === 'Critical') return isCrit;
        if (window._ipdSelectedSeverity === 'Verbal') return hasVerbalPending;
        if (window._ipdSelectedSeverity === 'Panic') return hasCritAlarm;
        if (window._ipdSelectedSeverity === 'Stable') return !isCrit && !hasCritAlarm && !hasVerbalPending;
        return true;
      });
    }

    // Filter by Search Query
    var searchVal = window._ipdConsultSearchQuery || '';
    if (searchVal.trim() !== '') {
      var q = searchVal.toLowerCase();
      ipdPatients = ipdPatients.filter(p => 
        p.name.toLowerCase().includes(q) || 
        p.uhid.toLowerCase().includes(q) ||
        (p.bed && p.bed.toLowerCase().includes(q))
      );
    }

    // Build patient rows / list HTML
    var listHTML = '';
    if (ipdPatients.length === 0) {
      listHTML = `
        <div style="text-align:center; padding:60px 20px; color:var(--text-muted); background:white; border-radius:12px; border:1px dashed var(--border-color);">
          <span style="font-size:36px;">🩺</span>
          <h4 style="margin:12px 0 6px 0; color:var(--text-primary);">No IPD patients found</h4>
          <p style="margin:0; font-size:12px;">Verify search filter constraints or register inpatient admissions.</p>
        </div>
      `;
    } else {
      listHTML = `
        <div class="pr-table-container" style="background:white; border-radius:12px; border:1px solid var(--border-color); overflow:hidden; box-shadow:0 1px 3px rgba(0,0,0,0.02);">
          <table class="pr-table" style="width:100%; border-collapse:collapse; font-size:12px;">
            <thead>
              <tr style="background:#f8fafc; border-bottom:1px solid var(--border-color); text-align:left;">
                <th style="padding:12px 16px; font-weight:700; color:var(--text-secondary);">Patient Details</th>
                <th style="padding:12px 16px; font-weight:700; color:var(--text-secondary);">Ward / Bed</th>
                <th style="padding:12px 16px; font-weight:700; color:var(--text-secondary);">Attending Consultant</th>
                <th style="padding:12px 16px; font-weight:700; color:var(--text-secondary);">Latest Vitals</th>
                <th style="padding:12px 16px; font-weight:700; color:var(--text-secondary);">Alerts & Indicators</th>
                <th style="padding:12px 16px; font-weight:700; color:var(--text-secondary);">Daily SOAP Note</th>
                <th style="padding:12px 16px; font-weight:700; color:var(--text-secondary); text-align:right;">Action</th>
              </tr>
            </thead>
            <tbody>
              ${ipdPatients.map((p, idx) => renderPatientRow(p, idx)).join('')}
            </tbody>
          </table>
        </div>
      `;
    }

    // Construct UI view template
    var viewHTML = `
      <div style="padding: 2px 0 20px 0; font-family:'Inter', sans-serif;">
        
        <!-- Header Persona Switcher & Configurations -->
        <div style="background:#fff; border:1px solid var(--border-color); border-radius:12px; padding:16px 20px; margin-bottom:20px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:16px;">
          <div style="display:flex; align-items:center; gap:10px;">
            <div style="font-size:24px;">🔐</div>
            <div>
              <div style="font-size:10px; font-weight:800; color:var(--text-secondary); text-transform:uppercase; letter-spacing:0.5px;">Treating Team Persona Simulator</div>
              <div style="font-size:13px; font-weight:700; color:var(--text-primary); margin-top:2px;">
                Active Simulation Role: <span style="color:var(--primary); font-weight:800;">${window._ipdActiveRole}</span>
              </div>
            </div>
          </div>
          <div style="display:flex; align-items:center; gap:10px;">
            <span style="font-size:12px; color:var(--text-muted);">Change Role:</span>
            <select class="form-select role-select-box" onchange="window._ipdSetSimulationRole(this.value)" style="font-size:12px; padding:6px 12px; width:220px; border-radius:6px;">
              ${ROLES.map(r => `<option value="${r}" ${window._ipdActiveRole === r ? 'selected' : ''}>${r}</option>`).join('')}
            </select>
          </div>
        </div>

        <!-- KPI dashboard grids -->
        <div class="stats-grid" style="grid-template-columns:repeat(4, 1fr); gap:16px; margin-bottom:20px;">
          <div class="stat-card" style="border-left:4px solid var(--primary); padding:16px;">
            <div class="stat-info">
              <span class="stat-label">Total Admitted IPD</span>
              <span class="stat-value">${totalAdmitted}</span>
              <span class="stat-sub">Active inpatient census</span>
            </div>
            <div class="stat-icon-wrapper" style="background:var(--primary-glow); color:var(--primary);">&#127973;</div>
          </div>
          <div class="stat-card" style="border-left:4px solid var(--color-danger); padding:16px;">
            <div class="stat-info">
              <span class="stat-label">Critical / ICU Patients</span>
              <span class="stat-value" style="color:var(--color-danger);">${criticalCount}</span>
              <span class="stat-sub">Flagged high-risk severity</span>
            </div>
            <div class="stat-icon-wrapper" style="background:var(--color-danger-bg); color:var(--color-danger);">&#128308;</div>
          </div>
          <div class="stat-card" style="border-left:4px solid var(--color-warning); padding:16px;">
            <div class="stat-info">
              <span class="stat-label">Unreviewed Lab/Rad</span>
              <span class="stat-value" style="color:#d97706;">${unreviewedCount}</span>
              <span class="stat-sub">Pending diagnostic reviews</span>
            </div>
            <div class="stat-icon-wrapper" style="background:#fef3c7; color:#d97706;">&#128302;</div>
          </div>
          <div class="stat-card" style="border-left:4px solid var(--color-info); padding:16px;">
            <div class="stat-info">
              <span class="stat-label">Verbal Orders Pending</span>
              <span class="stat-value" style="color:var(--color-info);">${verbalPendingCount}</span>
              <span class="stat-sub">Awaiting doctor co-signature</span>
            </div>
            <div class="stat-icon-wrapper" style="background:var(--color-info-bg); color:var(--color-info);">&#128260;</div>
          </div>
        </div>

        <!-- Search & list workspace -->
        <div class="card" style="padding:14px 16px; margin-bottom:16px; background:#f8fafc; border:1px solid var(--border-color);">
          <div style="display:flex; flex-wrap:wrap; align-items:center; gap:12px; font-size:11.5px;">
            <div style="display:flex; align-items:center; gap:6px; flex:1; min-width:200px; position:relative;">
              <span style="position:absolute; left:10px; color:#94a3b8; font-size:14px;">🔍</span>
              <input type="text" id="ipd-consult-search" class="form-control" placeholder="Search by name, bed, UHID..." value="${searchVal}" oninput="window._ipdConsultSearch(this.value)" style="font-size:12px; padding:6px 12px 6px 28px; height:32px;">
            </div>
            
            <!-- Ward Filter -->
            <div style="display:flex; align-items:center; gap:4px;">
              <label style="font-weight:700; color:#475569; margin:0; font-size:11px; white-space:nowrap;">Ward:</label>
              <select class="form-select" onchange="window._ipdConsultSetWard(this.value)" style="font-size:12px; height:32px; padding:4px 24px 4px 8px; width:130px; border-radius:6px; border:1px solid #cbd5e1; outline:none; background-color:white;">
                <option value="all" ${window._ipdSelectedWard === 'all' ? 'selected' : ''}>All Wards</option>
                <option value="General Ward" ${window._ipdSelectedWard === 'General Ward' ? 'selected' : ''}>General Ward</option>
                <option value="Private" ${window._ipdSelectedWard === 'Private' ? 'selected' : ''}>Private</option>
                <option value="Semi-Private" ${window._ipdSelectedWard === 'Semi-Private' ? 'selected' : ''}>Semi-Private</option>
                <option value="HDU" ${window._ipdSelectedWard === 'HDU' ? 'selected' : ''}>HDU</option>
                <option value="ICU" ${window._ipdSelectedWard === 'ICU' ? 'selected' : ''}>ICU</option>
              </select>
            </div>

            <!-- Consultant Filter -->
            <div style="display:flex; align-items:center; gap:4px;">
              <label style="font-weight:700; color:#475569; margin:0; font-size:11px; white-space:nowrap;">Consultant:</label>
              <select class="form-select" onchange="window._ipdConsultSetDoctor(this.value)" style="font-size:12px; height:32px; padding:4px 24px 4px 8px; width:150px; border-radius:6px; border:1px solid #cbd5e1; outline:none; background-color:white;">
                <option value="all" ${window._ipdSelectedDoctor === 'all' ? 'selected' : ''}>All Doctors</option>
                ${uniqueConsultants.map(doc => `<option value="${doc}" ${window._ipdSelectedDoctor === doc ? 'selected' : ''}>${doc}</option>`).join('')}
              </select>
            </div>

            <!-- Severity / Alerts Filter -->
            <div style="display:flex; align-items:center; gap:4px;">
              <label style="font-weight:700; color:#475569; margin:0; font-size:11px; white-space:nowrap;">Severity:</label>
              <select class="form-select" onchange="window._ipdConsultSetSeverity(this.value)" style="font-size:12px; height:32px; padding:4px 24px 4px 8px; width:140px; border-radius:6px; border:1px solid #cbd5e1; outline:none; background-color:white;">
                <option value="all" ${window._ipdSelectedSeverity === 'all' ? 'selected' : ''}>All Severities</option>
                <option value="Critical" ${window._ipdSelectedSeverity === 'Critical' ? 'selected' : ''}>🚨 Critical</option>
                <option value="Verbal" ${window._ipdSelectedSeverity === 'Verbal' ? 'selected' : ''}>⚠️ Verbal Pending</option>
                <option value="Panic" ${window._ipdSelectedSeverity === 'Panic' ? 'selected' : ''}>🔴 Panic Lab</option>
                <option value="Stable" ${window._ipdSelectedSeverity === 'Stable' ? 'selected' : ''}>Stable</option>
              </select>
            </div>

            <div style="margin-left:auto; font-size:11px; color:var(--text-muted); font-weight:600; white-space:nowrap;">
              Showing <b>${ipdPatients.length}</b> patients (Recent admissions first)
            </div>
          </div>
        </div>

        <!-- Patients list table -->
        ${listHTML}

      </div>
    `;

    window.ipdSafeRender(container, viewHTML);

    // Rebind search events
    const sInput = document.getElementById('ipd-consult-search');
    if (sInput) {
      sInput.addEventListener('keyup', function(e) {
        if (e.key === 'Escape') {
          window._ipdConsultSearch('');
        }
      });
    }
  };

  /* ── ROW RENDERER ────────────────────────────────────────────────────────── */
  function renderPatientRow(p, idx) {
    var isCrit = (p.flags || []).includes('Critical') || (p.newsScore || 0) >= 5;
    var initials = p.name.split(' ').map(n=>n[0]).join('').substring(0,2).toUpperCase();

    // Vitals readout
    var v = p.vitals || {};
    var bp = v.bp || '120/80';
    var hr = v.hr || 72;
    var temp = v.temp || '98.4';
    var spo2 = v.spo2 || '98%';

    // Check status events
    var todayStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    var hasTodayNote = (window.state.progressNotes || []).some(n => n.uhid === p.uhid && n.locked_at && n.locked_at.includes(todayStr));
    
    // Critical laboratory alarm
    var hasCritAlarm = (window.state.criticalValueAlerts || []).some(a => a.uhid === p.uhid && !a.acknowledged_by);
    var hasVerbalPending = (window.state.verbalOrders || []).some(v => v.uhid === p.uhid && v.cosign_status === 'pending');

    var indicators = [];
    if (isCrit) {
      indicators.push(`<span style="background:#fee2e2; border:1px solid #fca5a5; color:#ef4444; padding:1px 6px; border-radius:10px; font-size:9.5px; font-weight:800;">🚨 Critical</span>`);
    }
    if (hasCritAlarm) {
      indicators.push(`<span style="background:#fee2e2; border:1px solid #ef4444; color:#b91c1c; padding:1px 6px; border-radius:10px; font-size:9.5px; font-weight:800;">🔴 Panic Lab</span>`);
    }
    if (hasVerbalPending) {
      indicators.push(`<span style="background:#fef9c3; border:1px solid #fde047; color:#854d0e; padding:1px 6px; border-radius:10px; font-size:9.5px; font-weight:700;">⚠️ Verbal Order</span>`);
    }
    if (p.labsUnreviewed) {
      indicators.push(`<span style="background:#ede9fe; border:1px solid #ddd6fe; color:#6d28d9; padding:1px 6px; border-radius:10px; font-size:9.5px; font-weight:700;">🔬 Unreviewed</span>`);
    }
    if ((p.flags || []).includes('MLC')) {
      indicators.push(`<span style="background:#f1f5f9; border:1px solid #cbd5e1; color:#334155; padding:1px 6px; border-radius:10px; font-size:9.5px; font-weight:700;">⚖️ MLC</span>`);
    }

    return `
      <tr onclick="window._ipdGoToPatientDetails('${p.uhid}')" style="border-bottom:1px solid var(--border-color); cursor:pointer; background:${isCrit ? '#fff8f8' : 'white'}; transition: background 0.1s ease;" onmouseover="this.style.background='${isCrit ? '#fee2e2' : '#f8fafc'}'" onmouseout="this.style.background='${isCrit ? '#fff8f8' : 'white'}'">
        <td style="padding:12px 16px;">
          <div style="display:flex; align-items:center; gap:10px;">
            <div class="pr-avatar" style="width:32px; height:32px; font-size:11px; font-weight:800; background:${isCrit ? '#ef4444' : 'var(--primary)'}; color:#fff; display:flex; align-items:center; justify-content:center; border-radius:50%;">
              ${initials}
            </div>
            <div>
              <div style="font-weight:600; color:var(--text-primary);">${p.name}</div>
              <div class="mono text-muted" style="font-size:10px; margin-top:1px;">${p.uhid} &bull; ${p.age || '40'}/${p.gender || 'M'}</div>
            </div>
          </div>
        </td>
        <td style="padding:12px 16px;">
          <div style="font-weight:600; color:#1e40af;">${p.ward || 'General'}</div>
          <div class="mono" style="font-size:10.5px; color:var(--text-secondary);">${p.bed || '—'}</div>
        </td>
        <td style="padding:12px 16px;">
          <div style="font-weight:600; color:var(--text-primary);">${p.primaryConsultant || 'Dr. Priya Nair'}</div>
          <div style="font-size:10.5px; color:var(--text-muted);">${p.department || 'Cardiology'}</div>
        </td>
        <td style="padding:12px 16px;">
          <div style="display:flex; flex-direction:column; gap:2px; font-size:10px;">
            <div>BP: <b>${bp}</b> &bull; HR: <b>${hr}</b></div>
            <div>T: <b>${temp}°F</b> &bull; SpO2: <b>${spo2}</b></div>
          </div>
        </td>
        <td style="padding:12px 16px;">
          <div style="display:flex; flex-wrap:wrap; gap:4px;">
            ${indicators.join('') || '<span style="color:var(--text-muted); font-size:11px;">—</span>'}
          </div>
        </td>
        <td style="padding:12px 16px;">
          ${hasTodayNote 
            ? `<span style="color:#16a34a; font-weight:800;">✓ Logged</span>`
            : `<span style="color:#b45309; font-weight:800;">⚠️ Missing</span>`
          }
        </td>
        <td style="padding:12px 16px; text-align:right;">
          <button class="btn btn-secondary btn-sm" style="font-size:11px; padding:3px 8px; border-radius:4px; height:auto;">View &rarr;</button>
        </td>
      </tr>
    `;
  }

  /* ── ESCALATION TIMER VERIFICATION ────────────────────────────────────────── */
  function checkUnacknowledgedEscalations() {
    var alerts = window.state.criticalValueAlerts || [];
    var now = new Date();
    alerts.forEach(a => {
      if (!a.acknowledged_by && !a.escalated_to) {
        var diffMs = now - new Date(a.flagged_at);
        if (diffMs > 300000) { // 5 minutes escalation window configuration
          a.escalated_to = 'Duty Doctor On-Call';
          a.escalated_at = now.toISOString();
          console.warn(`[Statutory Escalation] Critical value for Alert ${a.alert_id} unacknowledged after 5 min window. Escalated automatically to duty officer.`);
          window.prShowToast && window.prShowToast(`🔴 Escalation triggered: Critical lab value automatically escalated to duty doctor on-call!`);
        }
      }
    });
  }

  /* ── GLOBAL EVENT HANDLERS ───────────────────────────────────────────────── */
  window._ipdConsultSearch = function (val) {
    window._ipdConsultSearchQuery = val;
    var c = document.getElementById('main-content');
    if (c) window.views.ipdConsultation(c);
  };

  window._ipdConsultSetWard = function (ward) {
    window._ipdSelectedWard = ward;
    var c = document.getElementById('main-content');
    if (c) window.views.ipdConsultation(c);
  };

  window._ipdConsultSetDoctor = function (doc) {
    window._ipdSelectedDoctor = doc;
    var c = document.getElementById('main-content');
    if (c) window.views.ipdConsultation(c);
  };

  window._ipdConsultSetSeverity = function (severity) {
    window._ipdSelectedSeverity = severity;
    var c = document.getElementById('main-content');
    if (c) window.views.ipdConsultation(c);
  };

  window._ipdSetSimulationRole = function (role) {
    window._ipdActiveRole = role;
    
    // Sync to EMR workspace role if active
    if (window.state) {
      window.state.activeUserRole = role;
      localStorage.setItem('saronil_active_user_role', role);
    }
    
    var c = document.getElementById('main-content');
    if (c) window.views.ipdConsultation(c);
  };

  window._ipdGoToPatientDetails = function (uhid) {
    window.router.navigate(`patients?uhid=${uhid}&p360tab=IPD Consultation`);
  };

  /* ==========================================================================
     ── EMR PROFILE INTEGRATION TAB: renderIPDConsultationTab ─────────────────
     ========================================================================== */
  window.renderIPDConsultationTab = function (patient) {
    initIPDConsultationState();

    // Check active alerts
    var alerts = (window.state.criticalValueAlerts || []).filter(a => a.uhid === patient.uhid);
    var unackedAlert = alerts.find(a => !a.acknowledged_by);
    
    // Check verbal orders
    var patientVerbals = (window.state.verbalOrders || []).filter(v => v.uhid === patient.uhid);
    var patientHandovers = (window.state.shiftHandovers || []).filter(h => h.uhid === patient.uhid);
    
    // Filter progress notes history for this patient
    var patientNotes = (window.state.progressNotes || []).filter(n => n.uhid === patient.uhid);
    
    // Build SOAP notes log list
    var soapNotesHistoryHTML = patientNotes.map(n => {
      var dateFormatted = new Date(n.locked_at).toLocaleString('en-IN', { day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit' });
      var isPending = n.cosign_status === 'pending';
      var addendaHtml = (n.addenda || []).map(a => `
        <div style="margin-top:6px; border-left:2.5px solid #d97706; padding-left:8px; font-size:11px; background:#fffbeb; padding:4px 6px; border-radius:4px;">
          <span style="color:#d97706; font-weight:700;">Addendum logged by ${a.by} (${new Date(a.at).toLocaleDateString('en-GB')}):</span> ${a.text}
        </div>
      `).join('');

      var actionHTML = '';
      if (isPending && window._ipdActiveRole === 'Consultant') {
        actionHTML = `<button class="btn btn-secondary btn-xs" style="background:#15803d; border:none; color:white; font-size:10px; padding:2px 6px;" onclick="window._ipdCosignNote('${n.note_id}')">✍ Co-sign Resident Note</button>`;
      }

      return `
        <div class="card" style="padding:12px; margin-bottom:10px; border-color:#e2e8f0; text-align:left;">
          <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #f1f5f9; padding-bottom:6px; margin-bottom:8px;">
            <div style="font-size:11px;">
              <b>SOAP Progress Note</b> (Locked) &bull; <span style="color:var(--text-muted);">${dateFormatted}</span>
            </div>
            <div style="display:flex; gap:6px; align-items:center;">
              <span class="reg-badge" style="background:#f1f5f9; color:#475569; font-size:9px;">By: ${n.authored_by}</span>
              ${isPending 
                ? `<span class="reg-badge" style="background:#fef9c3; color:#854d0e; font-size:9px; font-weight:800;">Pending Co-sign</span>`
                : `<span class="reg-badge" style="background:#ecfdf5; color:#047857; font-size:9px; font-weight:800;">✓ Consultant Signed</span>`
              }
              ${actionHTML}
            </div>
          </div>
          <div style="font-size:11.5px; line-height:1.4; display:grid; grid-template-columns:1fr; gap:6px;">
            <div><b>[S] Subjective:</b> ${n.soap_subjective}</div>
            <div><b>[O] Objective:</b> ${n.soap_objective}</div>
            <div><b>[A] Assessment:</b> ${n.soap_assessment}</div>
            <div><b>[P] Plan:</b> ${n.soap_plan}</div>
          </div>
          ${addendaHtml}
          
          <!-- Addendum composer -->
          <div style="margin-top:10px; border-top:1px dashed #e2e8f0; padding-top:8px; display:flex; gap:8px; align-items:center;">
            <input type="text" id="addendum-input-${n.note_id}" placeholder="Type correction/addendum..." style="flex:1; font-size:11px; padding:4px 8px; height:26px; border:1px solid #cbd5e1; border-radius:4px;">
            <button class="btn btn-secondary btn-xs" style="height:26px; font-size:11px;" onclick="window._ipdSaveAddendum('${n.note_id}')">Add Addendum</button>
          </div>
        </div>
      `;
    }).join('');

    // Pre-round unreviewed investigation alert
    var resultsAlertStrip = '';
    if (patient.labsUnreviewed) {
      resultsAlertStrip = `
        <div style="background:#ede9fe; border:1px solid #ddd6fe; border-radius:8px; padding:10px 14px; margin-bottom:16px; display:flex; justify-content:space-between; align-items:center; font-size:11.5px; color:#5c21b8; font-weight:600;">
          <span>🔬 Pre-round Alert: Patient has pending unreviewed diagnostic lab/imaging results!</span>
          <button class="btn btn-secondary btn-xs" style="background:#6d28d9; border:none; color:white; padding:2px 8px; font-size:10px;" onclick="window._ipdReviewDiagnosticResults('${patient.uhid}')">Mark Reviewed</button>
        </div>
      `;
    }

    // Unacknowledged critical alarm strip
    var criticalAlertStrip = '';
    if (unackedAlert) {
      var isEscalated = unackedAlert.escalated_to ? true : false;
      criticalAlertStrip = `
        <div style="background:#fee2e2; border:2px solid #ef4444; border-radius:8px; padding:12px; margin-bottom:16px; display:flex; flex-direction:column; gap:8px; animation: card-alert-pulse 2s infinite;">
          <div style="display:flex; justify-content:space-between; align-items:center; font-size:12px; color:#991b1b; font-weight:800;">
            <span>🚨 PANIC LAB VALUE DETECTED: ${unackedAlert.value_type} is ${unackedAlert.value}</span>
            <span class="reg-badge" style="background:#b91c1c; color:white;">Action Required</span>
          </div>
          <div style="display:flex; justify-content:space-between; align-items:center; font-size:11px; color:#7f1d1d;">
            <span>Flagged: ${new Date(unackedAlert.flagged_at).toLocaleTimeString('en-US', { hour:'2-digit', minute:'2-digit' })} &bull; 
            ${isEscalated ? `⚠️ Escalated to: <b style="color:#b91c1c;">${unackedAlert.escalated_to}</b>` : 'Acknowledge within 5 minutes to avoid automatic duty coordinator escalation.'}</span>
            <button class="btn btn-secondary btn-xs" style="background:#b91c1c; border:none; color:white; font-size:10px; font-weight:800; padding:4px 10px;" onclick="window._ipdAcknowledgeCritical('${unackedAlert.alert_id}')">Acknowledge Alert</button>
          </div>
        </div>
      `;
    }

    // DNR/Limitation of care record
    var limitationRecord = (window.state.limitationOfCareRecords || []).find(r => r.uhid === patient.uhid);
    var dnrAlertHTML = '';
    if (limitationRecord) {
      dnrAlertHTML = `
        <div style="background:#fff7ed; border:1.5px solid #f97316; border-radius:8px; padding:10px 14px; margin-bottom:16px; display:flex; justify-content:space-between; align-items:center; font-size:12px; color:#c2410c;">
          <span>⚠️ <b>LIMITATION OF CARE ACTIVE: DNR (Do Not Resuscitate)</b> &bull; Signed by family and consultant</span>
          <span style="font-weight:800; text-transform:uppercase; letter-spacing:0.5px;">✓ DNR Locked</span>
        </div>
      `;
    }

    return `
      <!-- IPD Consultation Active tab workspace layout -->
      <div style="display:flex; flex-direction:column; gap:16px; padding:4px 0 20px 0; font-family:'Inter', sans-serif;">
        
        <!-- Alerts & Escalations Zone -->
        ${dnrAlertHTML}
        ${criticalAlertStrip}
        ${resultsAlertStrip}

        <div style="display:grid; grid-template-columns: 1.5fr 1fr; gap:16px; align-items:start;">
          
          <!-- Left Main Area: SOAP Clinical note and SBAR Handover -->
          <div style="display:flex; flex-direction:column; gap:16px;">
            
            <!-- SOAP Note Composer -->
            <div class="card" style="padding:16px; text-align:left; border-radius:12px; background:white;">
              <h3 style="margin:0 0 12px 0; font-size:13px; font-weight:800; color:#1e3a8a; border-bottom:1.5px solid #f1f5f9; padding-bottom:8px;">
                📝 Daily SOAP Progress Note
              </h3>
              
              <div style="display:grid; grid-template-columns:1fr; gap:10px; margin-bottom:12px;">
                <div>
                  <label style="font-size:11px; font-weight:700; color:var(--text-secondary); margin-bottom:4px; display:block;">[S] Subjective Narrative:</label>
                  <textarea id="soap-s" class="form-control" style="font-size:12px; height:60px;" placeholder="Chief complaints, subjective patient feedback..."></textarea>
                </div>
                <div>
                  <label style="font-size:11px; font-weight:700; color:var(--text-secondary); margin-bottom:4px; display:block;">[O] Objective Exam Findings (System-wise):</label>
                  <textarea id="soap-o" class="form-control" style="font-size:12px; height:60px;" placeholder="Vitals, physical systemic exam findings..."></textarea>
                </div>
                <div>
                  <label style="font-size:11px; font-weight:700; color:var(--text-secondary); margin-bottom:4px; display:block;">[A] Assessment / Clinical Impression:</label>
                  <textarea id="soap-a" class="form-control" style="font-size:12px; height:45px;" placeholder="Diagnostic impression, prognosis index..."></textarea>
                </div>
                <div>
                  <label style="font-size:11px; font-weight:700; color:var(--text-secondary); margin-bottom:4px; display:block;">[P] Treatment Plan:</label>
                  <textarea id="soap-p" class="form-control" style="font-size:12px; height:45px;" placeholder="Action plan, nursing orders..."></textarea>
                </div>
              </div>

              <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px;">
                <div style="font-size:11px; color:var(--text-muted);">
                  Author Role: <b>${window._ipdActiveRole}</b> &bull; Note Status: 
                  <span style="font-weight:700; color:#1e3a8a;">${window._ipdActiveRole === 'Consultant' ? 'Auto-Signed' : 'Pending Consultant Co-sign'}</span>
                </div>
                <button class="btn btn-primary" onclick="window._ipdSaveProgressNote('${patient.uhid}')" style="height:32px; font-size:12px; padding:6px 16px;">
                  Save & Lock Progress Note
                </button>
              </div>
            </div>

            <!-- SOAP Progress Note History Log -->
            <div class="card" style="padding:16px; text-align:left; border-radius:12px; background:white;">
              <h3 style="margin:0 0 12px 0; font-size:13px; font-weight:800; color:#1e3a8a; border-bottom:1.5px solid #f1f5f9; padding-bottom:8px;">
                📖 Admitted Progress Notes History
              </h3>
              ${soapNotesHistoryHTML || `<div style="text-align:center; padding:20px; font-size:11.5px; color:var(--text-muted);">No progress notes logged for this admission yet.</div>`}
            </div>

            <!-- SBAR Shift Handover Log -->
            <div class="card" style="padding:16px; text-align:left; border-radius:12px; background:white;">
              <h3 style="margin:0 0 12px 0; font-size:13px; font-weight:800; color:#1e3a8a; border-bottom:1.5px solid #f1f5f9; padding-bottom:8px;">
                🔄 Duty Doctor Shift Handover (SBAR)
              </h3>
              <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:12px;">
                <div>
                  <label style="font-size:11px; font-weight:700; color:var(--text-secondary); margin-bottom:4px; display:block;">[S] Situation:</label>
                  <input type="text" id="sbar-s" class="form-control" style="font-size:11px;" placeholder="e.g. Admitted stable post CAG">
                </div>
                <div>
                  <label style="font-size:11px; font-weight:700; color:var(--text-secondary); margin-bottom:4px; display:block;">[B] Background:</label>
                  <input type="text" id="sbar-b" class="form-control" style="font-size:11px;" placeholder="e.g. Known CAD, hypertension">
                </div>
                <div>
                  <label style="font-size:11px; font-weight:700; color:var(--text-secondary); margin-bottom:4px; display:block;">[A] Assessment:</label>
                  <input type="text" id="sbar-a" class="form-control" style="font-size:11px;" placeholder="e.g. Vitals stable, chest pain resolved">
                </div>
                <div>
                  <label style="font-size:11px; font-weight:700; color:var(--text-secondary); margin-bottom:4px; display:block;">[R] Recommendation:</label>
                  <input type="text" id="sbar-r" class="form-control" style="font-size:11px;" placeholder="e.g. Monitor Q4H, plan discharge tomorrow">
                </div>
              </div>
              
              <div style="display:flex; justify-content:space-between; align-items:center;">
                <span style="font-size:11px; color:var(--text-muted);">SBAR handover log ensures seamless cross-coverage overnight.</span>
                <button class="btn btn-secondary" style="height:28px; font-size:11px;" onclick="window._ipdSaveShiftHandover('${patient.uhid}')">Log Shift Handover</button>
              </div>

              <!-- Handover Log Lists -->
              ${patientHandovers.length > 0 ? `
                <div style="margin-top:12px; border-top:1px solid #f1f5f9; padding-top:10px;">
                  <span style="font-size:11px; font-weight:700; color:var(--text-secondary); margin-bottom:6px; display:block;">Past Shift Handovers:</span>
                  ${patientHandovers.map(h => `
                    <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:6px; padding:8px; margin-bottom:6px; font-size:11px; line-height:1.4;">
                      <div style="display:flex; justify-content:space-between; font-weight:700; margin-bottom:4px; color:var(--text-primary);">
                        <span>Outgoing: ${h.outgoing_doctor_id} &rarr; Incoming: ${h.incoming_doctor_id}</span>
                        <span style="color:var(--text-muted); font-weight:normal;">${new Date(h.timestamp).toLocaleString('en-IN', { hour:'2-digit', minute:'2-digit', day:'2-digit', month:'short' })}</span>
                      </div>
                      <div><b>[S]</b> ${h.situation} &bull; <b>[B]</b> ${h.background} &bull; <b>[A]</b> ${h.assessment} &bull; <b>[R]</b> ${h.recommendation}</div>
                    </div>
                  `).join('')}
                </div>
              ` : ''}
            </div>

          </div>

          <!-- Right Column: Orders panel, referrals, verbal orders, discharge triggers -->
          <div style="display:flex; flex-direction:column; gap:16px;">
            
            <!-- Quick Orders Panel -->
            <div class="card" style="padding:16px; text-align:left; border-radius:12px; background:white;">
              <h3 style="margin:0 0 12px 0; font-size:13px; font-weight:800; color:#1e3a8a; border-bottom:1.5px solid #f1f5f9; padding-bottom:8px;">
                ⚡ Daily Rounds Orders
              </h3>

              <div style="display:flex; flex-direction:column; gap:10px; margin-bottom:12px;">
                
                <!-- Diet Order Card -->
                <div style="border:1px solid #e2e8f0; border-radius:8px; padding:10px;">
                  <span style="font-size:11px; font-weight:800; color:var(--text-secondary); display:block; margin-bottom:6px;">DIET & NPO INSTRUCTIONS</span>
                  <div style="display:flex; gap:8px;">
                    <select id="diet-selection" class="form-select" style="font-size:11.5px; height:28px; padding:0 8px; flex:1;" onchange="window._ipdUpdateDietOrder('${patient.uhid}', this.value)">
                      <option value="Regular Diet" ${patient.dietType === 'Regular Diet' ? 'selected' : ''}>Regular Diet</option>
                      <option value="Soft Diet" ${patient.dietType === 'Soft Diet' ? 'selected' : ''}>Soft Diet</option>
                      <option value="Clear Liquid" ${patient.dietType === 'Clear Liquid' ? 'selected' : ''}>Clear Liquid</option>
                      <option value="Diabetic Diet" ${patient.dietType === 'Diabetic Diet' ? 'selected' : ''}>Diabetic Diet</option>
                      <option value="Low Sodium" ${patient.dietType === 'Low Sodium' ? 'selected' : ''}>Low Sodium</option>
                      <option value="NPO (Nil Per Os)" ${patient.dietType === 'NPO (Nil Per Os)' ? 'selected' : ''}>NPO (Nil Per Os)</option>
                    </select>
                  </div>
                  <span style="font-size:9.5px; color:#059669; display:block; margin-top:4px;">✓ Diet updates sync immediately to Pantry Dispatch Gate.</span>
                </div>

                <!-- Medication Order -->
                <div style="border:1px solid #e2e8f0; border-radius:8px; padding:10px;">
                  <span style="font-size:11px; font-weight:800; color:var(--text-secondary); display:block; margin-bottom:6px;">ADD MEDICATION (PHARMACY)</span>
                  <div style="display:flex; flex-direction:column; gap:6px;">
                    <input type="text" id="order-med-name" placeholder="Medication name (e.g. Penicillin 500mg)" style="font-size:11px; padding:4px 8px; height:26px; border:1px solid #cbd5e1; border-radius:4px;">
                    <button class="btn btn-secondary btn-xs" style="height:26px; font-size:11px; font-weight:700;" onclick="window._ipdPlaceMedicationOrder('${patient.uhid}')">Place Med Order</button>
                  </div>
                </div>

                <!-- LIS / RIS Investigation Order -->
                <div style="border:1px solid #e2e8f0; border-radius:8px; padding:10px;">
                  <span style="font-size:11px; font-weight:800; color:var(--text-secondary); display:block; margin-bottom:6px;">INVESTIGATION (LIS / RIS)</span>
                  <div style="display:flex; flex-direction:column; gap:6px;">
                    <input type="text" id="order-inv-name" placeholder="Test Name (e.g. CBC, Chest X-Ray)" style="font-size:11px; padding:4px 8px; height:26px; border:1px solid #cbd5e1; border-radius:4px;">
                    <input type="text" id="order-inv-indication" placeholder="Clinical Indication (Required by TPA)" style="font-size:11px; padding:4px 8px; height:26px; border:1px solid #cbd5e1; border-radius:4px;">
                    <div style="display:flex; align-items:center; gap:6px; font-size:10.5px;">
                      <input type="checkbox" id="order-inv-tpa" style="width:14px; height:14px;">
                      <span>Trigger TPA Cashless Pre-Auth</span>
                    </div>
                    <button class="btn btn-secondary btn-xs" style="height:26px; font-size:11px; font-weight:700;" onclick="window._ipdPlaceInvestigationOrder('${patient.uhid}')">Place Investigation Order</button>
                  </div>
                </div>

                <!-- Procedure Order with Consent Checklist Warning -->
                <div style="border:1px solid #e2e8f0; border-radius:8px; padding:10px;">
                  <span style="font-size:11px; font-weight:800; color:var(--text-secondary); display:block; margin-bottom:6px;">PROCEDURE ORDER</span>
                  <div style="display:flex; flex-direction:column; gap:6px;">
                    <input type="text" id="order-proc-name" placeholder="Procedure (e.g. Angioplasty)" style="font-size:11px; padding:4px 8px; height:26px; border:1px solid #cbd5e1; border-radius:4px;">
                    <button class="btn btn-secondary btn-xs" style="height:26px; font-size:11px; font-weight:700;" onclick="window._ipdPlaceProcedureOrder('${patient.uhid}')">Place Procedure Order</button>
                  </div>
                </div>

              </div>

              <!-- List of Active Orders placed this session -->
              <div style="border-top:1.5px solid #f1f5f9; padding-top:10px;">
                <span style="font-size:11px; font-weight:800; color:var(--text-secondary); margin-bottom:8px; display:block;">Active Round Orders:</span>
                ${(window.state.orderSets || []).filter(o => o.uhid === patient.uhid).map(o => `
                  <div style="display:flex; justify-content:space-between; align-items:center; background:#f8fafc; padding:6px 10px; border-radius:6px; margin-bottom:6px; font-size:11.5px; border:1px solid #cbd5e1;">
                    <div>
                      <div><b>${o.details}</b> <span style="font-size:9.5px; text-transform:uppercase; color:#1d4ed8; font-weight:700;">(${o.order_type})</span></div>
                      ${o.clinical_indication ? `<div style="font-size:9.5px; color:var(--text-muted);">Indication: ${o.clinical_indication}</div>` : ''}
                    </div>
                    <div>
                      <span class="reg-badge" style="${o.status.includes('Consent') ? 'background:#fee2e2; color:#ef4444;' : 'background:#ecfdf5; color:#047857;'} font-size:9px; font-weight:800;">
                        ${o.status}
                      </span>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>

            <!-- Referral co-consultation panel -->
            <div class="card" style="padding:16px; text-align:left; border-radius:12px; background:white;">
              <h3 style="margin:0 0 12px 0; font-size:13px; font-weight:800; color:#1e3a8a; border-bottom:1.5px solid #f1f5f9; padding-bottom:8px;">
                🤝 Specialty co-consultation Referrals
              </h3>
              
              <div style="display:grid; grid-template-columns:1fr; gap:6px; margin-bottom:10px;">
                <select id="referral-dept" class="form-select" style="font-size:11px; height:28px; padding:0 8px;">
                  <option value="Cardiology">Cardiology</option>
                  <option value="Neurology">Neurology</option>
                  <option value="Nephrology">Nephrology</option>
                  <option value="General Surgery">General Surgery</option>
                  <option value="Gastroenterology">Gastroenterology</option>
                </select>
                <input type="text" id="referral-reason" placeholder="Reason for referral..." style="font-size:11px; padding:4px 8px; height:26px; border:1px solid #cbd5e1; border-radius:4px;">
                <button class="btn btn-secondary btn-xs" style="height:26px; font-size:11px;" onclick="window._ipdPlaceReferral('${patient.uhid}')">Send Referral Request</button>
              </div>

              <!-- Referrals Log list -->
              ${(window.state.referralRequests || []).filter(r => r.uhid === patient.uhid).map(r => `
                <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:6px; padding:8px; margin-bottom:6px; font-size:11px; line-height:1.4;">
                  <div style="display:flex; justify-content:space-between; font-weight:700; margin-bottom:3px;">
                    <span>Referral to ${r.to_specialty}</span>
                    <span class="reg-badge" style="background:#ede9fe; color:#5c21b8; font-size:9px;">${r.status}</span>
                  </div>
                  <div>Reason: ${r.reason}</div>
                  <div style="font-size:9.5px; color:var(--text-muted); margin-top:2px;">Requested by: ${r.from_consultant_id}</div>
                </div>
              `).join('')}
            </div>

            <!-- Verbal Orders / DNR/ MLC flags -->
            <div class="card" style="padding:16px; text-align:left; border-radius:12px; background:white;">
              <h3 style="margin:0 0 12px 0; font-size:13px; font-weight:800; color:#1e3a8a; border-bottom:1.5px solid #f1f5f9; padding-bottom:8px;">
                ⚖️ Statutory & Verbal Flags
              </h3>
              
              <!-- Telephonic Verbal Orders List -->
              <div style="border-bottom:1px dashed #cbd5e1; padding-bottom:10px; margin-bottom:10px;">
                <span style="font-size:11px; font-weight:800; color:var(--text-secondary); margin-bottom:6px; display:block;">TELEPHONIC VERBAL ORDERS</span>
                
                <!-- Nurse input box -->
                ${window._ipdActiveRole === 'Nurse' ? `
                  <div style="display:flex; flex-direction:column; gap:6px; margin-bottom:10px; border:1px solid var(--border-color); border-radius:6px; padding:8px; background:#fafafa;">
                    <span style="font-size:10px; color:#1e3a8a; font-weight:700;">Nurse verbal entry portal:</span>
                    <input type="text" id="verbal-details" placeholder="Verbal instructions detail..." style="font-size:11px; padding:4px 8px; height:26px; border:1px solid #cbd5e1; border-radius:4px;">
                    <div style="display:flex; align-items:center; gap:6px; font-size:10.5px;">
                      <input type="checkbox" id="verbal-readback" style="width:14px; height:14px;">
                      <span>Log Verbal Read-back Confirmed</span>
                    </div>
                    <button class="btn btn-secondary btn-xs" style="height:24px; font-size:10px; background:#1e3a8a; border:none; color:white;" onclick="window._ipdSaveVerbalOrder('${patient.uhid}')">Log Verbal Order</button>
                  </div>
                ` : ''}

                <!-- Verbal Orders Listing -->
                ${patientVerbals.map(v => {
                  var isPending = v.cosign_status === 'pending';
                  var actionBtn = '';
                  if (isPending && (window._ipdActiveRole === 'Consultant' || window._ipdActiveRole === 'Duty / On-call Doctor')) {
                    actionBtn = `<button class="btn btn-secondary btn-xs" style="background:#15803d; border:none; color:white; font-size:9.5px; padding:2px 4px;" onclick="window._ipdCosignVerbalOrder('${v.order_id}')">✍ Co-sign Order (24h Limit)</button>`;
                  }
                  return `
                    <div style="background:#f8fafc; border:1.5px solid #cbd5e1; border-radius:6px; padding:8px; margin-bottom:6px; font-size:11px; line-height:1.4;">
                      <div style="display:flex; justify-content:space-between; align-items:center; font-weight:700; margin-bottom:4px;">
                        <span>📞 ${v.details}</span>
                        ${isPending 
                          ? `<span class="reg-badge" style="background:#fef9c3; color:#854d0e; font-size:9px;">Pending Co-sign</span>`
                          : `<span class="reg-badge" style="background:#ecfdf5; color:#047857; font-size:9px;">✓ Co-signed</span>`
                        }
                      </div>
                      <div style="display:flex; justify-content:space-between; align-items:center; font-size:9.5px; color:var(--text-muted); margin-top:2px;">
                        <span>Log: ${v.entered_by_nurse} (Read-back: ${v.read_back_confirmed ? 'Yes' : 'No'})</span>
                        ${actionBtn}
                      </div>
                    </div>
                  `;
                }).join('') || `<div style="font-size:10.5px; color:var(--text-muted);">No verbal orders logged.</div>`}
              </div>

              <!-- Medico-Legal Case (MLC) Flag -->
              <div style="border-bottom:1px dashed #cbd5e1; padding-bottom:10px; margin-bottom:10px; display:flex; justify-content:space-between; align-items:center; font-size:11.5px;">
                <div>
                  <span style="font-weight:700; display:block;">MLC Registration Flag:</span>
                  <span style="font-size:9.5px; color:var(--text-muted);">Routes to MLC Coordinator for statutory reporting.</span>
                </div>
                <div>
                  <button class="btn btn-secondary btn-xs" style="${(patient.flags || []).includes('MLC') ? 'background:#ef4444; border-color:#ef4444; color:white;' : ''}" onclick="window._ipdToggleMLCFlag('${patient.uhid}')">
                    ${(patient.flags || []).includes('MLC') ? '⚖️ MLC Active' : 'Flag as MLC'}
                  </button>
                </div>
              </div>

              <!-- DNR / Limitation of care record -->
              <div style="display:flex; justify-content:space-between; align-items:center; font-size:11.5px;">
                <div>
                  <span style="font-weight:700; display:block;">DNR Consent Trail:</span>
                  <span style="font-size:9.5px; color:var(--text-muted);">Requires consultant & family signature.</span>
                </div>
                <div>
                  ${limitationRecord 
                    ? `<span style="color:#059669; font-weight:800;">✓ Signed & Locked</span>`
                    : `<button class="btn btn-secondary btn-xs" onclick="window._ipdSignDNRConsent('${patient.uhid}')">Sign DNR Consent</button>`
                  }
                </div>
              </div>
            </div>

            <!-- Discharge Trigger checklist -->
            <div class="card" style="padding:16px; text-align:left; border-radius:12px; background:white;">
              <h3 style="margin:0 0 12px 0; font-size:13px; font-weight:800; color:#1e3a8a; border-bottom:1.5px solid #f1f5f9; padding-bottom:8px;">
                🚪 Discharge Initiation
              </h3>
              <p style="font-size:11px; color:var(--text-secondary); margin:0 0 12px 0; line-height:1.4;">
                Marking the patient fit for discharge will immediately spool details into the existing MRD & Discharge Checklist Queue.
              </p>
              
              <div style="display:flex; flex-direction:column; gap:8px;">
                <button class="btn btn-primary" style="background:#059669; border-color:#059669; height:32px; font-size:12px; font-weight:800;" onclick="window._ipdInitiateDischarge('${patient.uhid}')">
                  🚀 Mark Fit & Trigger Discharge
                </button>
              </div>
            </div>

          </div>

        </div>

      </div>
    `;
  };

  /* ── EMR INTERACTION METHODS ─────────────────────────────────────────────── */
  
  // Acknowledge critical panic value alert
  window._ipdAcknowledgeCritical = function (alertId) {
    var alerts = window.state.criticalValueAlerts || [];
    var alert = alerts.find(a => a.alert_id === alertId);
    if (alert) {
      alert.acknowledged_by = window._ipdActiveRole;
      alert.acknowledged_at = new Date().toISOString();
      window.prShowToast && window.prShowToast('✓ Critical value alert acknowledged successfully!');
      
      // Re-draw EMR Patient Details
      var c = document.querySelector('.p360-modal-body') || document.getElementById('main-content');
      // Force SPA update
      const activeUhid = window.patient360CurrentUhid;
      if (activeUhid) {
        var pat = window.state.patients.find(p => p.uhid === activeUhid);
        if (pat && typeof window.views.patients === 'function') {
          window.views.patients(document.getElementById('main-content'), 'IPD Consultation', { uhid: activeUhid });
        }
      }
    }
  };

  // Mark pending unreviewed results reviewed
  window._ipdReviewDiagnosticResults = function (uhid) {
    var pat = window.state.patients.find(p => p.uhid === uhid);
    if (pat) {
      pat.labsUnreviewed = false;
      window.prShowToast && window.prShowToast('✓ Diagnostic results marked reviewed!');
      
      // Re-draw
      if (typeof window.views.patients === 'function') {
        window.views.patients(document.getElementById('main-content'), 'IPD Consultation', { uhid: uhid });
      }
    }
  };

  // SOAP progress note save & lock
  window._ipdSaveProgressNote = function (uhid) {
    var s = document.getElementById('soap-s').value;
    var o = document.getElementById('soap-o').value;
    var a = document.getElementById('soap-a').value;
    var p = document.getElementById('soap-p').value;

    if (!s.trim() || !o.trim() || !a.trim() || !p.trim()) {
      alert('All SOAP note sections (Subjective, Objective, Assessment, Plan) are mandatory per statutory guidelines.');
      return;
    }

    var newNote = {
      note_id: 'NOTE-' + Math.floor(Math.random() * 10000),
      uhid: uhid,
      visit_type: 'Round',
      soap_subjective: s,
      soap_objective: o,
      soap_assessment: a,
      soap_plan: p,
      authored_by: window._ipdActiveRole === 'Consultant' ? 'Dr. Priya Nair' : 'Resident Dr. Rohan',
      cosign_status: window._ipdActiveRole === 'Consultant' ? 'signed' : 'pending',
      cosigned_by: window._ipdActiveRole === 'Consultant' ? 'Dr. Priya Nair' : null,
      locked_at: new Date().toISOString(),
      addenda: []
    };

    window.state.progressNotes.push(newNote);
    window.prShowToast && window.prShowToast('✓ Daily Progress Note saved and locked successfully.');

    // Clear fields
    document.getElementById('soap-s').value = '';
    document.getElementById('soap-o').value = '';
    document.getElementById('soap-a').value = '';
    document.getElementById('soap-p').value = '';

    // Re-draw
    if (typeof window.views.patients === 'function') {
      window.views.patients(document.getElementById('main-content'), 'IPD Consultation', { uhid: uhid });
    }
  };

  // Save addendum correction
  window._ipdSaveAddendum = function (noteId) {
    var val = document.getElementById('addendum-input-' + noteId).value;
    if (!val.trim()) {
      alert('Addendum correction text cannot be empty.');
      return;
    }

    var note = window.state.progressNotes.find(n => n.note_id === noteId);
    if (note) {
      if (!note.addenda) note.addenda = [];
      note.addenda.push({
        text: val,
        by: window._ipdActiveRole,
        at: new Date().toISOString()
      });
      window.prShowToast && window.prShowToast('✓ Addendum correction appended to note log!');
      
      // Re-draw
      const activeUhid = window.patient360CurrentUhid;
      if (activeUhid && typeof window.views.patients === 'function') {
        window.views.patients(document.getElementById('main-content'), 'IPD Consultation', { uhid: activeUhid });
      }
    }
  };

  // Co-sign resident progress note
  window._ipdCosignNote = function (noteId) {
    var note = window.state.progressNotes.find(n => n.note_id === noteId);
    if (note) {
      note.cosign_status = 'signed';
      note.cosigned_by = 'Dr. Priya Nair';
      window.prShowToast && window.prShowToast('✓ Resident note co-signed successfully!');
      
      // Re-draw
      const activeUhid = window.patient360CurrentUhid;
      if (activeUhid && typeof window.views.patients === 'function') {
        window.views.patients(document.getElementById('main-content'), 'IPD Consultation', { uhid: activeUhid });
      }
    }
  };

  // SBAR Handover Log
  window._ipdSaveShiftHandover = function (uhid) {
    var s = document.getElementById('sbar-s').value;
    var b = document.getElementById('sbar-b').value;
    var a = document.getElementById('sbar-a').value;
    var r = document.getElementById('sbar-r').value;

    if (!s.trim() || !b.trim() || !a.trim() || !r.trim()) {
      alert('All SBAR handover sections (Situation, Background, Assessment, Recommendation) are required.');
      return;
    }

    var newHandover = {
      handover_id: 'HND-' + Math.floor(Math.random() * 10000),
      uhid: uhid,
      outgoing_doctor_id: window._ipdActiveRole,
      incoming_doctor_id: 'Dr. Ramesh Kumar',
      situation: s,
      background: b,
      assessment: a,
      recommendation: r,
      timestamp: new Date().toISOString()
    };

    window.state.shiftHandovers.push(newHandover);
    window.prShowToast && window.prShowToast('✓ SBAR Handover logged successfully.');

    // Clear fields
    document.getElementById('sbar-s').value = '';
    document.getElementById('sbar-b').value = '';
    document.getElementById('sbar-a').value = '';
    document.getElementById('sbar-r').value = '';

    // Re-draw
    if (typeof window.views.patients === 'function') {
      window.views.patients(document.getElementById('main-content'), 'IPD Consultation', { uhid: uhid });
    }
  };

  // Diet selection change update
  window._ipdUpdateDietOrder = function (uhid, dietVal) {
    var pat = window.state.patients.find(p => p.uhid === uhid);
    if (pat) {
      pat.dietType = dietVal;
      
      // Also push to Pantry & Kitchen dispatch gate immediately
      if (!window.state.dietOrders) window.state.dietOrders = [];
      
      // Update or create pantry order record
      var existingOrder = window.state.dietOrders.find(o => o.uhid === uhid);
      if (existingOrder) {
        existingOrder.dietType = dietVal;
        existingOrder.timestamp = new Date().toISOString();
        existingOrder.status = 'Updated';
      } else {
        window.state.dietOrders.push({
          order_id: 'DIET-' + Math.floor(Math.random() * 100),
          uhid: uhid,
          patientName: pat.name,
          ward: pat.ward || 'General',
          bed: pat.bed || '—',
          dietType: dietVal,
          status: 'Placed',
          timestamp: new Date().toISOString()
        });
      }
      
      window.prShowToast && window.prShowToast(`✓ Bedside diet updated: "${dietVal}" synced to Pantry immediately.`);
    }
  };

  // Place Medication Order with EMR Allergy check
  window._ipdPlaceMedicationOrder = function (uhid) {
    var name = document.getElementById('order-med-name').value;
    if (!name.trim()) {
      alert('Please enter a medication name.');
      return;
    }

    var pat = window.state.patients.find(p => p.uhid === uhid);
    if (pat) {
      // Simulate drug interaction / allergy check against patient allergy profile
      var drugNameLower = name.toLowerCase();
      var patientAllergies = (pat.allergies || '').toLowerCase();
      
      var isAllergic = false;
      if (drugNameLower.includes('penicillin') && patientAllergies.includes('penicillin')) isAllergic = true;
      if (drugNameLower.includes('sulpha') && patientAllergies.includes('sulpha')) isAllergic = true;

      if (isAllergic) {
        alert(`🚨 EMR CLINICAL WARNING: Order Blocked! Patient allergy log indicates sensitivity to "${name}". Check alternative therapeutics.`);
        return;
      }

      // Add order
      window.state.orderSets.push({
        order_id: 'ORD-' + Math.floor(Math.random() * 10000),
        uhid: uhid,
        order_type: 'medication',
        details: name,
        clinical_indication: 'Clinical round Rx',
        tpa_preauth_required: false,
        status: 'Active'
      });

      window.prShowToast && window.prShowToast(`✓ Medication "${name}" ordered successfully.`);
      document.getElementById('order-med-name').value = '';

      // Re-draw
      if (typeof window.views.patients === 'function') {
        window.views.patients(document.getElementById('main-content'), 'IPD Consultation', { uhid: uhid });
      }
    }
  };

  // Place investigation order with clinical indication and TPA triggers
  window._ipdPlaceInvestigationOrder = function (uhid) {
    var name = document.getElementById('order-inv-name').value;
    var indication = document.getElementById('order-inv-indication').value;
    var triggerTPA = document.getElementById('order-inv-tpa').checked;

    if (!name.trim()) {
      alert('Please enter a test/investigation name.');
      return;
    }
    if (!indication.trim()) {
      alert('Statutory TPA/Insurance validation requires a mandatory clinical indication for all lab/imaging orders.');
      return;
    }

    // Add order
    window.state.orderSets.push({
      order_id: 'ORD-' + Math.floor(Math.random() * 10000),
      uhid: uhid,
      order_type: 'investigation',
      details: name,
      clinical_indication: indication,
      tpa_preauth_required: triggerTPA,
      status: triggerTPA ? 'Pre-Auth Submitted to TPA' : 'Active'
    });

    if (triggerTPA) {
      window.prShowToast && window.prShowToast(`✓ LIS/RIS order placed. TPA cashless pre-auth request spooled to Insurance Queue!`);
    } else {
      window.prShowToast && window.prShowToast(`✓ LIS/RIS order "${name}" placed.`);
    }

    // Clear fields
    document.getElementById('order-inv-name').value = '';
    document.getElementById('order-inv-indication').value = '';
    document.getElementById('order-inv-tpa').checked = false;

    // Re-draw
    if (typeof window.views.patients === 'function') {
      window.views.patients(document.getElementById('main-content'), 'IPD Consultation', { uhid: uhid });
    }
  };

  // Place procedure order with Consent checklist warning
  window._ipdPlaceProcedureOrder = function (uhid) {
    var name = document.getElementById('order-proc-name').value;
    if (!name.trim()) {
      alert('Please enter a procedure name.');
      return;
    }

    // Add order in pending consent state
    window.state.orderSets.push({
      order_id: 'ORD-' + Math.floor(Math.random() * 10000),
      uhid: uhid,
      order_type: 'procedure',
      details: name,
      clinical_indication: 'Clinical round indication',
      tpa_preauth_required: false,
      status: 'Pending Consent'
    });

    alert(`⚠️ PROCEDURE CONSENT WARNING: Informed consent is required for "${name}". Procedure scheduling is BLOCKED until consent is signed.`);

    window.prShowToast && window.prShowToast(`✓ Procedure order spooled. Awaiting consent.`);
    document.getElementById('order-proc-name').value = '';

    // Re-draw
    if (typeof window.views.patients === 'function') {
      window.views.patients(document.getElementById('main-content'), 'IPD Consultation', { uhid: uhid });
    }
  };

  // Send specialty referral request
  window._ipdPlaceReferral = function (uhid) {
    var dept = document.getElementById('referral-dept').value;
    var reason = document.getElementById('referral-reason').value;

    if (!reason.trim()) {
      alert('Please enter a reason for the referral.');
      return;
    }

    window.state.referralRequests.push({
      referral_id: 'REF-' + Math.floor(Math.random() * 1000),
      uhid: uhid,
      from_consultant_id: 'Dr. Priya Nair',
      to_specialty: dept,
      to_consultant_id: null,
      reason: reason,
      urgency: 'Routine',
      status: 'Pending'
    });

    window.prShowToast && window.prShowToast(`✓ Referral request to ${dept} sent successfully.`);
    document.getElementById('referral-reason').value = '';

    // Re-draw
    if (typeof window.views.patients === 'function') {
      window.views.patients(document.getElementById('main-content'), 'IPD Consultation', { uhid: uhid });
    }
  };

  // Save Verbal Order (logged by nurse)
  window._ipdSaveVerbalOrder = function (uhid) {
    var details = document.getElementById('verbal-details').value;
    var readback = document.getElementById('verbal-readback').checked;

    if (!details.trim()) {
      alert('Verbal order details cannot be empty.');
      return;
    }
    if (!readback) {
      alert('Nurse must confirm that verbal instructions were read-back and confirmed before logging.');
      return;
    }

    window.state.verbalOrders.push({
      order_id: 'VORD-' + Math.floor(Math.random() * 10000),
      uhid: uhid,
      details: details,
      entered_by_nurse: 'Staff Nurse Mary',
      read_back_confirmed: true,
      ordering_doctor_id: 'Dr. Priya Nair',
      cosign_status: 'pending',
      cosigned_at: null
    });

    window.prShowToast && window.prShowToast('✓ Verbal order logged. surfaces as pending co-signature.');
    document.getElementById('verbal-details').value = '';
    document.getElementById('verbal-readback').checked = false;

    // Re-draw
    if (typeof window.views.patients === 'function') {
      window.views.patients(document.getElementById('main-content'), 'IPD Consultation', { uhid: uhid });
    }
  };

  // Co-sign Verbal Order (by doctor)
  window._ipdCosignVerbalOrder = function (orderId) {
    var v = window.state.verbalOrders.find(o => o.order_id === orderId);
    if (v) {
      v.cosign_status = 'signed';
      v.cosigned_at = new Date().toISOString();
      window.prShowToast && window.prShowToast('✓ Verbal order co-signed and finalized!');
      
      // Re-draw
      const activeUhid = window.patient360CurrentUhid;
      if (activeUhid && typeof window.views.patients === 'function') {
        window.views.patients(document.getElementById('main-content'), 'IPD Consultation', { uhid: activeUhid });
      }
    }
  };

  // Toggle MLC Flag
  window._ipdToggleMLCFlag = function (uhid) {
    var pat = window.state.patients.find(p => p.uhid === uhid);
    if (pat) {
      if (!pat.flags) pat.flags = [];
      
      var idx = pat.flags.indexOf('MLC');
      if (idx !== -1) {
        pat.flags.splice(idx, 1);
        window.prShowToast && window.prShowToast('MLC Flag removed.');
      } else {
        pat.flags.push('MLC');
        alert('🚨 STATUTORY WARNING: Patient flagged as Medico-Legal Case (MLC). Case records routed to MLC Coordinator for statutory reporting.');
        window.prShowToast && window.prShowToast('MLC Flag active.');
      }

      // Re-draw
      if (typeof window.views.patients === 'function') {
        window.views.patients(document.getElementById('main-content'), 'IPD Consultation', { uhid: uhid });
      }
    }
  };

  // Sign DNR Consent record
  window._ipdSignDNRConsent = async function (uhid) {
    var pat = window.state.patients.find(p => p.uhid === uhid);
    if (pat) {
      var ok = await customConfirm('Confirm DNR Limitation of Care signature? This action requires consultant and next-of-kin acknowledgment and is logged permanently.');
      if (ok) {
        if (!window.state.limitationOfCareRecords) window.state.limitationOfCareRecords = [];
        window.state.limitationOfCareRecords.push({
          record_id: 'LCR-' + Math.floor(Math.random() * 100),
          uhid: uhid,
          type: 'DNR',
          consultant_id: 'Dr. Priya Nair',
          family_acknowledged_by: 'Spouse / Next-of-Kin',
          cosigned_at: new Date().toISOString()
        });
        
        window.prShowToast && window.prShowToast('✓ DNR Limitation-of-Care Signed & Locked.');

        // Re-draw
        if (typeof window.views.patients === 'function') {
          window.views.patients(document.getElementById('main-content'), 'IPD Consultation', { uhid: uhid });
        }
      }
    }
  };

  // Mark fit & Trigger Discharge Checklist
  window._ipdInitiateDischarge = function (uhid) {
    var pat = window.state.patients.find(p => p.uhid === uhid);
    if (pat) {
      // Set discharge status in patient record
      pat.dischargeStatus = 'In Progress — Clearances Pending';
      pat.dischargeOrder = {
        timestamp: new Date().toISOString(),
        orderedBy: 'Dr. Priya Nair'
      };

      // Spool into MRD & Discharge Checklist Queue
      if (!window.state.dischargeQueue) window.state.dischargeQueue = [];
      var existingQueueEntry = window.state.dischargeQueue.find(q => q.uhid === uhid);
      if (!existingQueueEntry) {
        window.state.dischargeQueue.push({
          uhid: uhid,
          name: pat.name,
          ward: pat.ward || 'General',
          bed: pat.bed || '—',
          clinicalStatus: 'Pending Summary Signoff',
          billingStatus: 'Pending Clearances',
          mrdStatus: 'Incomplete',
          triggeredAt: new Date().toISOString()
        });
      }

      alert('🚀 DISCHARGE CHECKLIST TRIGGERED: Patient marked fit. Record sent to MRD & Discharge Checklist Queue. Billing clearances triggered.');
      window.prShowToast && window.prShowToast('✓ Patient fit for discharge logged.');

      // Return to IPD Consultation list
      window.router.navigate('ipdConsultation');
    }
  };

})();
