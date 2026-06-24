/* ==========================================================================
   SARONIL HMS - NABH-COMPLIANT PATIENT REGISTRATION & ONBOARDING WORKSPACE
   ========================================================================== */

window.views.registration = function(container, subAnchor, params) {
  // Setup local states on window context if not present
  window.currentRegRole = window.currentRegRole || 'Front Desk';
  window.searchPerformed = window.searchPerformed || false;
  window.abhaLinked = window.abhaLinked || false;
  window.tempCapturedPhoto = window.tempCapturedPhoto || null;
  window.tempUploadedDocs = window.tempUploadedDocs || [];
  window.activeRegTab = window.activeRegTab || 'search';
  window.activeInnerFormTab = window.activeInnerFormTab || 'inner-demo';
  window.regFormOpened = window.regFormOpened || false;
  
  // Set registration flow active if URL matches action=new or subAnchor=new
  if (subAnchor === 'new' || params.action === 'new') {
    window.registrationModeActive = true;
  } else {
    window.registrationModeActive = window.registrationModeActive || false;
  }

  // Override SPA header title
  const pageTitleEl = document.getElementById('active-page-title');
  if (pageTitleEl) pageTitleEl.textContent = 'New Patient Registration';

  // Seed auditLogs if empty
  state.auditLogs = state.auditLogs || [
    { timestamp: "09:05 AM 2026-06-17", user: "Front Desk Staff", action: "System Start", details: "Onboarding terminal active and connected to ABDM core." },
    { timestamp: "09:12 AM 2026-06-17", user: "Front Desk Staff", action: "Sticker Print", details: "Printed registration card for Ramesh Chandra (UHID20000001)." }
  ];

  // Render main layout
  container.innerHTML = `
    <style>
      .reg-container {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }
      .reg-tab-panel {
        display: none;
      }
      .reg-tab-panel.active {
        display: block;
      }
      .inner-form-tabs {
        display: flex;
        gap: 0.5rem;
        margin-bottom: 1.25rem;
        border-bottom: 2px solid var(--border-color);
        padding-bottom: 0.5rem;
        flex-wrap: wrap;
      }
      .inner-tab-btn {
        background: var(--bg-surface-elevated);
        border: 1px solid var(--border-color);
        padding: 0.5rem 1rem;
        border-radius: 4px;
        font-size: 0.8rem;
        cursor: pointer;
        font-weight: 600;
        color: var(--text-secondary);
        transition: all 0.15s ease;
      }
      .inner-tab-btn.active {
        background: var(--primary);
        color: white;
        border-color: var(--primary);
      }
      .inner-tab-content {
        display: none;
        padding: 1rem 0;
      }
      .inner-tab-content.active {
        display: block;
      }
      .mock-webcam-box {
        width: 100%;
        max-width: 300px;
        height: 200px;
        background: #1e293b;
        border-radius: 8px;
        border: 2px dashed #475569;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        color: #94a3b8;
        position: relative;
        overflow: hidden;
      }
      .mock-webcam-overlay {
        position: absolute;
        top: 10px;
        left: 10px;
        background: rgba(239, 68, 68, 0.85);
        color: white;
        padding: 0.2rem 0.5rem;
        font-size: 0.7rem;
        border-radius: 3px;
        font-weight: bold;
        animation: blink 1.5s infinite;
      }
      @keyframes blink {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.4; }
      }
      .sticker-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
        gap: 1.5rem;
        margin-top: 1rem;
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
      .role-pill {
        transition: all 0.2s ease;
      }
      .compliance-locked {
        background-color: var(--bg-surface-elevated);
        border: 1px solid var(--border-color);
        padding: 1rem;
        border-radius: 6px;
        text-align: center;
        color: var(--text-muted);
        margin: 2rem 0;
      }
      .similarity-badge {
        padding: 0.2rem 0.4rem;
        border-radius: 4px;
        font-size: 0.75rem;
        font-weight: 700;
        background-color: var(--color-warning-bg);
        color: var(--color-warning);
      }
    </style>

    <div class="reg-container">
      <!-- Top Header: Title, Subtitle, and Action Button -->
      <div style="display: flex; justify-content: space-between; align-items: center; background: var(--bg-surface); padding: 1.25rem 1.5rem; border-radius: var(--radius-md); border: 1px solid var(--border-color); flex-wrap: wrap; gap: 1rem;">
        <div>
          <h3 style="margin: 0; font-size: 1.4rem; font-weight: 800; color: var(--text-primary); display: flex; align-items: center; gap: 0.5rem;">
            <span>🏥</span> New Patient Registration
          </h3>
          <p style="margin: 0.25rem 0 0 0; font-size: 0.8rem; color: var(--text-muted);">
            NABH-Compliant & Ayushman Bharat Digital Mission (ABDM) Workstation
          </p>
        </div>
        
        <div>
          ${!window.registrationModeActive ? `
            <button class="btn btn-primary" onclick="startNewRegistrationFlow()" style="font-weight: 700; padding: 0.6rem 1.25rem; font-size: 0.9rem; display: flex; align-items: center; gap: 0.5rem; box-shadow: var(--shadow-sm);">
              <span>➕</span> Start New Patient Registration
            </button>
          ` : `
            <button class="btn btn-secondary" onclick="exitRegistrationFlow()" style="font-weight: 700; padding: 0.6rem 1.25rem; font-size: 0.9rem; display: flex; align-items: center; gap: 0.5rem;">
              <span>⬅</span> Back to Master Patient Registry
            </button>
          `}
        </div>
      </div>

      <!-- Main Layout -->
      <div style="display: flex; flex-direction: column; gap: 1.5rem;">
        <!-- Bottom Workspace Area (Switches between Registry List or Onboarding Flow tabs) -->
        <div id="reg-bottom-workspace">
          <!-- Loaded Dynamically -->
        </div>
      </div>

    </div>

    <div id="new-token-modal" class="modal-overlay" style="display:none;">
      <div class="modal-box" style="max-width:900px; padding:1.5rem;">
        <h4 style="margin:0 0 1rem 0; font-weight:700;">🎫 Issue New Check-in Token</h4>
        <div class="form-group" style="margin-bottom:1rem;">
          <label class="form-label">Select Patient</label>
          <select id="token-patient-select" class="form-select">
            ${state.patients.map(p => `<option value="${p.uhid}">${p.name} (${p.uhid})</option>`).join('')}
          </select>
        </div>
        <div class="form-group" style="margin-bottom:1rem;">
          <label class="form-label">Consulting Department</label>
          <select id="token-dept-select" class="form-select" onchange="updateTokenDoctorDropdown()">
            <option value="Cardiology">Cardiology</option>
            <option value="Pediatrics">Pediatrics</option>
            <option value="General Medicine">General Medicine</option>
            <option value="Orthopedics">Orthopedics</option>
          </select>
        </div>
        <div class="form-group" style="margin-bottom:1.5rem;">
          <label class="form-label">Admitted Doctor</label>
          <select id="token-doctor-select" class="form-select">
            <!-- Dynamically populated -->
          </select>
        </div>
        <div style="display:flex; gap:0.5rem;">
          <button class="btn btn-secondary" style="flex:1;" onclick="closeTokenDialog()">Cancel</button>
          <button class="btn btn-primary" style="flex:1;" onclick="issueNewQueueToken()">Generate Token</button>
        </div>
      </div>
    </div>
  `;

  // Standard local function declarations to ensure hoisting works correctly.
  
  function switchRegTab(tabId) {
    window.activeRegTab = tabId;
    document.querySelectorAll('.reg-tab-panel').forEach(panel => {
      panel.classList.remove('active');
    });
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.classList.remove('active');
      btn.style.borderBottomColor = 'transparent';
      btn.style.color = 'var(--text-secondary)';
    });

    const activePanel = document.getElementById(`panel-${tabId}`);
    const activeBtn = document.getElementById(`tab-btn-${tabId}`);
    if (activePanel) activePanel.classList.add('active');
    if (activeBtn) {
      activeBtn.classList.add('active');
      activeBtn.style.borderBottomColor = 'var(--primary)';
      activeBtn.style.color = 'var(--primary)';
    }

    // Dynamic renders on tab switch
    if (tabId === 'audit') renderAuditLogs();
    if (tabId === 'stickers') renderStickersPrintHistory();
    if (tabId === 'queue') renderQueueTokensTable();
    if (tabId === 'form' && window.regFormOpened) {
      setTimeout(() => {
        switchInnerFormTab(window.activeInnerFormTab || 'inner-demo');
      }, 0);
    }
    
    applyRolePermissions();
  }

  function openDemographicsFormWithCarryforward() {
    const searchName = document.getElementById('forced-search-name') ? document.getElementById('forced-search-name').value.trim() : '';
    const searchMobile = document.getElementById('forced-search-mobile') ? document.getElementById('forced-search-mobile').value.trim() : '';

    window.regFormOpened = true;
    renderBottomWorkspace();
    switchRegTab('form');

    if (searchName) {
      const parts = searchName.split(/\s+/);
      const firstName = parts[0] || '';
      const lastName = parts.slice(1).join(' ') || '';
      const firstNameEl = document.getElementById('reg-first-name');
      const lastNameEl = document.getElementById('reg-last-name');
      if (firstNameEl) firstNameEl.value = firstName;
      if (lastNameEl) lastNameEl.value = lastName;
    }
    if (searchMobile) {
      const mobileEl = document.getElementById('reg-mobile');
      if (mobileEl) mobileEl.value = searchMobile;
    }
    
    // Initialize wizard step 1
    switchInnerFormTab('inner-demo');
  }

  function resetRegFormCTA() {
    window.regFormOpened = false;
    renderBottomWorkspace();
  }

  function switchRegRole(role) {
    window.currentRegRole = role;
    
    // Highlight active role pill
    document.querySelectorAll('.role-pill').forEach(btn => {
      btn.className = 'btn btn-sm btn-secondary role-pill';
    });
    const activeBtnMap = {
      'Front Desk': 'role-pill-frontdesk',
      'Admin': 'role-pill-admin',
      'Doctor': 'role-pill-doctor',
      'Nurse': 'role-pill-nurse',
      'Billing': 'role-pill-billing'
    };
    const activeId = activeBtnMap[role];
    if (document.getElementById(activeId)) {
      document.getElementById(activeId).className = 'btn btn-sm btn-primary role-pill';
    }
    
    // Log audit action
    addLocalAuditLog('Role Switch', `Workstation operators role changed to: ${role}`);
    
    // Apply locks
    applyRolePermissions();
    
    // Redraw audit log panel if it's open
    if (window.activeRegTab === 'audit') renderAuditLogs();
  }

  function applyRolePermissions() {
    const role = window.currentRegRole;
    
    const inputs = document.querySelectorAll('#patient-registration-form input, #patient-registration-form select, #patient-registration-form textarea');
    const submitBtn = document.getElementById('reg-submit-btn');
    const emergencyBtn = document.getElementById('tab-btn-fast');
    const saveEmergBtn = document.getElementById('emerg-submit-btn');
    
    if (role === 'Doctor' || role === 'Nurse') {
      inputs.forEach(el => el.disabled = true);
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Save Locked (Read-Only Workstation)';
      }
      if (emergencyBtn) emergencyBtn.disabled = true;
      if (saveEmergBtn) saveEmergBtn.disabled = true;
    } else if (role === 'Billing') {
      // Billing can edit TPA insurance fields and consent/ABHA, but demographics are read-only
      inputs.forEach(el => {
        const isBillingField = el.id.includes('ins') || 
                               el.id.includes('sponsor') || 
                               el.id.includes('payer') || 
                               el.id.includes('abha') ||
                               el.id.includes('policy') ||
                               el.id.includes('member') ||
                               el.id.includes('corp') ||
                               el.id.includes('emp') ||
                               el.id.includes('consent');
        el.disabled = !isBillingField;
      });
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Update Insurance & ABHA Settings';
      }
      if (emergencyBtn) emergencyBtn.disabled = true;
    } else {
      // Front Desk / Admin: Full access
      inputs.forEach(el => el.disabled = false);
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Save Patient Details';
      }
      if (emergencyBtn && window.searchPerformed) emergencyBtn.disabled = false;
      if (saveEmergBtn) saveEmergBtn.disabled = false;
    }
  }

  function renderWorkspaceKPICards() {
    const kpiCardsBox = document.getElementById('reg-kpi-cards');
    if (!kpiCardsBox) return;

    const totalReg = state.patients.length;
    const opdCheck = state.patients.filter(p => p.status === 'Checked In').length;
    const ipdAdmit = state.admissions.filter(a => a.status === 'Active').length;
    const abhaLinkedCount = state.patients.filter(p => p.abhaId && p.abhaId !== 'No ABHA Tagged').length;
    const abhaRate = totalReg > 0 ? ((abhaLinkedCount / totalReg) * 100).toFixed(0) : 0;
    const activeTokens = state.tokens.filter(t => t.status === 'Waiting').length;

    kpiCardsBox.innerHTML = `
      <div class="kpi-card status-normal" onclick="filterRegistryByCard('all')">
        <div class="kpi-header">
          <span class="kpi-title">Total Registrations</span>
          <span class="kpi-icon" style="background-color: var(--primary-glow); color: var(--primary);">👤</span>
        </div>
        <div class="kpi-body">
          <span class="kpi-value">${totalReg}</span>
          <span class="kpi-subtext">Cumulative master files</span>
        </div>
        <div class="kpi-footer">
          <span class="kpi-trend up">▲ +12% this week</span>
          <span class="kpi-timestamp">Live</span>
        </div>
        <div class="kpi-hover-overlay"><span>Click to filter all registries</span></div>
      </div>

      <div class="kpi-card status-success" onclick="filterRegistryByCard('opd')">
        <div class="kpi-header">
          <span class="kpi-title">OPD Check-ins</span>
          <span class="kpi-icon" style="background-color: var(--color-success-bg); color: var(--color-success);">🏥</span>
        </div>
        <div class="kpi-body">
          <span class="kpi-value">${opdCheck}</span>
          <span class="kpi-subtext">Active clinic lobby visits</span>
        </div>
        <div class="kpi-footer">
          <span class="kpi-trend up">▲ 4 Checked in now</span>
          <span class="kpi-timestamp">Live</span>
        </div>
        <div class="kpi-hover-overlay"><span>Click to filter Checked In</span></div>
      </div>

      <div class="kpi-card status-normal" onclick="filterRegistryByCard('ipd')">
        <div class="kpi-header">
          <span class="kpi-title">IPD Admissions</span>
          <span class="kpi-icon" style="background-color: var(--color-purple-bg); color: var(--color-purple);">🛏️</span>
        </div>
        <div class="kpi-body">
          <span class="kpi-value">${ipdAdmit}</span>
          <span class="kpi-subtext">Active ward bed patients</span>
        </div>
        <div class="kpi-footer">
          <span class="kpi-trend neutral">— Stable ward loads</span>
          <span class="kpi-timestamp">Live</span>
        </div>
        <div class="kpi-hover-overlay"><span>Click to filter Admitted</span></div>
      </div>

      <div class="kpi-card status-normal" onclick="filterRegistryByCard('abha')">
        <div class="kpi-header">
          <span class="kpi-title">ABHA Link Ratio</span>
          <span class="kpi-icon" style="background-color: var(--color-info-bg); color: var(--color-info);">🆔</span>
        </div>
        <div class="kpi-body">
          <span class="kpi-value">${abhaRate}%</span>
          <span class="kpi-subtext">${abhaLinkedCount} Linked ABDM files</span>
        </div>
        <div class="kpi-footer">
          <span class="kpi-trend up">▲ +5% vs last month</span>
          <span class="kpi-timestamp">Live</span>
        </div>
        <div class="kpi-hover-overlay"><span>Click to filter Linked ABHA</span></div>
      </div>

      <div class="kpi-card status-warning" onclick="switchRegTab('queue')">
        <div class="kpi-header">
          <span class="kpi-title">Queue Tokens Active</span>
          <span class="kpi-icon" style="background-color: var(--color-warning-bg); color: var(--color-warning);">🎫</span>
        </div>
        <div class="kpi-body">
          <span class="kpi-value">${activeTokens}</span>
          <span class="kpi-subtext">Patients in registration line</span>
        </div>
        <div class="kpi-footer">
          <span class="kpi-trend down">▼ peak volume hour</span>
          <span class="kpi-timestamp">Live</span>
        </div>
        <div class="kpi-hover-overlay"><span>Click to view Token Queue Board</span></div>
      </div>

      <div class="kpi-card status-normal">
        <div class="kpi-header">
          <span class="kpi-title">Avg Registration Time</span>
          <span class="kpi-icon" style="background-color: var(--color-info-bg); color: var(--color-info);">⏱️</span>
        </div>
        <div class="kpi-body">
          <span class="kpi-value">12 Min</span>
          <span class="kpi-subtext">NABH compliance standard</span>
        </div>
        <div class="kpi-footer">
          <span class="kpi-trend up">▲ 98% SLA success</span>
          <span class="kpi-timestamp">Live</span>
        </div>
        <div class="kpi-hover-overlay"><span>compliance verified</span></div>
      </div>
    `;
  }

  function filterRegistryByCard(type) {
    // If not active, filter the table rows
    if (!window.registrationModeActive) {
      if (type === 'opd') {
        renderTableRows(state.patients.filter(p => p.status === 'Checked In'));
      } else if (type === 'ipd') {
        renderTableRows(state.patients.filter(p => p.status === 'Admitted'));
      } else if (type === 'abha') {
        renderTableRows(state.patients.filter(p => p.abhaId && p.abhaId !== 'No ABHA Tagged'));
      } else {
        renderTableRows(state.patients);
      }
    } else {
      // If onboarding active, use search filter list
      if (type === 'opd') {
        renderRegistryList(state.patients.filter(p => p.status === 'Checked In'));
      } else if (type === 'ipd') {
        renderRegistryList(state.patients.filter(p => p.status === 'Admitted'));
      } else if (type === 'abha') {
        renderRegistryList(state.patients.filter(p => p.abhaId && p.abhaId !== 'No ABHA Tagged'));
      } else {
        renderRegistryList(state.patients);
      }
    }
  }

  function performPatientSearch() {
    const nameVal = document.getElementById('forced-search-name').value.trim().toLowerCase();
    const mobileVal = document.getElementById('forced-search-mobile').value.trim();

    if (!nameVal && !mobileVal) {
      alert('⚠️ Input Required: You must specify a Name/UHID or Mobile number to check for duplicate records first.');
      return;
    }

    // Filter matches
    const matches = state.patients.filter(p => {
      const matchName = nameVal && (p.name.toLowerCase().includes(nameVal) || p.uhid.toLowerCase() === nameVal);
      const matchMobile = mobileVal && p.mobile.includes(mobileVal);
      return matchName || matchMobile;
    });

    const statusEl = document.getElementById('search-check-status');
    
    // Unlock tabs
    window.searchPerformed = true;
    const formTab = document.getElementById('tab-btn-form');
    const fastTab = document.getElementById('tab-btn-fast');
    if (formTab) formTab.removeAttribute('disabled');
    if (fastTab) fastTab.removeAttribute('disabled');
    if (formTab) formTab.textContent = '📝 2. Full Onboarding Form';
    if (fastTab) fastTab.textContent = '⚡ 3. Emergency Fast-Track';

    if (matches.length > 0) {
      // Potential duplicates detected
      statusEl.innerHTML = `
        <div style="background-color: var(--color-warning-bg); color: var(--color-warning); padding: 1rem; border-radius: 6px; border: 1px solid var(--color-warning); font-size: 0.85rem; margin-top: 1rem;">
          <h5 style="margin: 0 0 0.5rem 0; font-weight:700;">⚠️ Potential Duplicate Records Found (${matches.length})</h5>
          <p style="margin:0 0 0.75rem 0;">We found matching patient records. Please verify if the patient already has a file before creating a new one.</p>
          <div style="display:flex; gap:0.5rem;">
            <button class="btn btn-sm btn-secondary" onclick="openDemographicsFormWithCarryforward()">Bypass & Register New Patient anyway</button>
            <button class="btn btn-sm btn-primary" onclick="filterRegistryToMatches()">View matched duplicates below</button>
          </div>
        </div>
      `;
      renderRegistryList(matches);
      addLocalAuditLog('Search Check', `Duplicate verification check run: ${matches.length} matches detected.`);
    } else {
      // Clear: Proceed to create
      statusEl.innerHTML = `
        <div style="background-color: var(--color-success-bg); color: var(--color-success); padding: 1rem; border-radius: 6px; border: 1px solid var(--color-success); font-size: 0.85rem; margin-top: 1rem;">
          <h5 style="margin: 0 0 0.25rem 0; font-weight:700;">✓ Duplicate Search Complete: No matches detected</h5>
          <p style="margin:0 0 0.5rem 0;">No matching patient files were found. You are cleared to create a new patient record or use Emergency Fast-Track.</p>
          <div style="display:flex; gap:0.5rem;">
            <button class="btn btn-sm btn-primary" onclick="openDemographicsFormWithCarryforward()">Create Standard Patient Record</button>
            <button class="btn btn-sm btn-danger" onclick="switchRegTab('fast')">Emergency Fast-Track Admission</button>
          </div>
        </div>
      `;
      renderRegistryList(state.patients);
      addLocalAuditLog('Search Check', `Duplicate verification check run: Clear. No matches detected.`);
    }
  }

  function filterRegistryToMatches() {
    const nameVal = document.getElementById('forced-search-name').value.trim().toLowerCase();
    const mobileVal = document.getElementById('forced-search-mobile').value.trim();
    
    const matches = state.patients.filter(p => {
      const matchName = nameVal && (p.name.toLowerCase().includes(nameVal) || p.uhid.toLowerCase() === nameVal);
      const matchMobile = mobileVal && p.mobile.includes(mobileVal);
      return matchName || matchMobile;
    });
    renderRegistryList(matches);
  }

  function renderRegistryList(patientList) {
    const tbody = document.getElementById('forced-search-table-body');
    if (!tbody) return;

    if (patientList.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="8" style="text-align: center; color: var(--text-muted); padding: 2rem;">
            No patient files matched search constraints. Use "Forced Search Desk" above.
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = patientList.map(p => {
      let statusClass = 'badge-primary';
      if (p.status === 'Admitted') statusClass = 'badge-purple';
      if (p.status === 'Checked In') statusClass = 'badge-success';
      if (p.status === 'Day Care') statusClass = 'badge-info';

      return `
        <tr>
          <td>
            <div style="font-weight: 700; color: var(--text-primary);">${p.uhid}</div>
            <div style="font-size: 0.75rem; color: var(--text-muted);">${p.abhaId || 'No ABHA Tagged'}</div>
          </td>
          <td><a href="#patients?uhid=${p.uhid}" class="patient-link" style="font-weight:700;">${p.name}</a></td>
          <td>${p.age} Yrs / ${p.gender}</td>
          <td>${p.mobile}</td>
          <td>${p.primaryConsultant}</td>
          <td>
            <div>${p.sponsor}</div>
            <div style="font-size: 0.75rem; color: var(--text-muted);">${p.payerType || 'Direct'}</div>
          </td>
          <td><span class="badge ${statusClass}">${p.status}</span></td>
          <td style="text-align: right;">
            <div style="display: inline-flex; gap: 0.25rem;">
              <button class="btn btn-secondary btn-sm" onclick="router.navigate('patients?uhid=${p.uhid}')">Profile 360</button>
              <button class="btn btn-primary btn-sm" onclick="selectPatientForWristband('${p.uhid}')">Sticker</button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  }

  function togglePayerTPAFields() {
    const payerType = document.getElementById('reg-payer-type').value;
    const insSection = document.getElementById('payer-insurance-section');
    const corpSection = document.getElementById('payer-corporate-section');
    
    if (insSection) insSection.style.display = payerType === 'Insurance' ? 'block' : 'none';
    if (corpSection) corpSection.style.display = payerType === 'Corporate' ? 'block' : 'none';
  }

  function handleRegDOBChange() {
    const dobEl = document.getElementById('reg-dob');
    const ageEl = document.getElementById('reg-age');
    if (!dobEl || !dobEl.value) return;

    const birthDate = new Date(dobEl.value);
    if (birthDate > Date.now()) {
      alert('Date of Birth cannot be in the future.');
      dobEl.value = '';
      if (ageEl) ageEl.value = '';
      return;
    }

    const ageDiff = Date.now() - birthDate.getTime();
    const ageDate = new Date(ageDiff);
    const age = Math.abs(ageDate.getUTCFullYear() - 1970);
    
    if (ageEl) {
      ageEl.value = age;
    }
  }

  function handleRegAgeChange() {
    const dobEl = document.getElementById('reg-dob');
    const ageEl = document.getElementById('reg-age');
    if (!ageEl || !ageEl.value) return;

    const age = parseInt(ageEl.value, 10);
    if (isNaN(age) || age < 0 || age > 120) {
      return;
    }

    const currentYear = new Date().getFullYear();
    const estimatedBirthYear = currentYear - age;
    
    if (dobEl) {
      dobEl.value = `${estimatedBirthYear}-01-01`;
    }
  }

  function lookupPincode() {
    const pin = document.getElementById('reg-pincode').value.trim();
    const cityEl = document.getElementById('reg-city');
    const stateEl = document.getElementById('reg-state');
    
    const pinDb = {
      '560001': { city: 'Bengaluru', state: 'Karnataka' },
      '110001': { city: 'New Delhi', state: 'Delhi' },
      '400001': { city: 'Mumbai', state: 'Maharashtra' },
      '700001': { city: 'Kolkata', state: 'West Bengal' },
      '600001': { city: 'Chennai', state: 'Tamil Nadu' },
      '500001': { city: 'Hyderabad', state: 'Telangana' },
      '380001': { city: 'Ahmedabad', state: 'Gujarat' },
      '800001': { city: 'Patna', state: 'Bihar' }
    };
    
    const pinSuccess = document.getElementById('pincode-success-msg');
    if (pinDb[pin]) {
      cityEl.value = pinDb[pin].city;
      stateEl.value = pinDb[pin].state;
      if (pinSuccess) {
        pinSuccess.textContent = `✓ Auto-filled: ${pinDb[pin].city}, ${pinDb[pin].state}`;
        pinSuccess.style.color = 'var(--color-success)';
      }
      addLocalAuditLog('Pincode Lookup', `Pincode ${pin} looked up successfully.`);
    } else {
      if (pinSuccess) {
        pinSuccess.textContent = `✗ Pincode not in auto-fill db. Enter city/state manually.`;
        pinSuccess.style.color = 'var(--color-danger)';
      }
    }
  }

  function triggerWebcamSim() {
    const canvas = document.createElement('canvas');
    canvas.width = 150;
    canvas.height = 150;
    const ctx = canvas.getContext('2d');
    
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(0, 0, 150, 150);
    
    ctx.fillStyle = '#475569';
    ctx.beginPath();
    ctx.arc(75, 60, 30, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.beginPath();
    ctx.arc(75, 130, 50, Math.PI, 0);
    ctx.fill();
    
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 4;
    ctx.strokeRect(0, 0, 150, 150);
    
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 9px sans-serif';
    ctx.fillText('MOCK PHOTO', 42, 140);
    
    const dataUrl = canvas.toDataURL();
    const photoBox = document.getElementById('webcam-photo-preview');
    if (photoBox) {
      photoBox.innerHTML = `<img src="${dataUrl}" style="width: 100%; height: 100%; object-fit: cover; border-radius: var(--radius-md); border: 2px solid var(--color-success);" />`;
    }
    window.tempCapturedPhoto = dataUrl;
    
    addLocalAuditLog('Photo Capture', 'Simulated webcam photo captured for new patient.');
    alert('Photo captured successfully via simulated webcam!');
  }

  function triggerDocUploadSim(docType) {
    const nextFile = `${docType.toLowerCase().replace(/ /g, '_')}_scan.pdf`;
    window.tempUploadedDocs.push(nextFile);
    
    if (docType === 'ID Proof') {
      const statusEl = document.getElementById('id-proof-status');
      if (statusEl) statusEl.innerHTML = `<span style="color:var(--color-success); font-weight:bold;">✓ ${nextFile} (Scanned & Verified)</span>`;
    } else if (docType === 'Insurance Card') {
      const statusEl = document.getElementById('insurance-card-status');
      if (statusEl) statusEl.innerHTML = `<span style="color:var(--color-success); font-weight:bold;">✓ ${nextFile} (Scanned & Verified)</span>`;
    }
    
    addLocalAuditLog('Doc Scan', `Scanned and attached patient credential document: ${docType}`);
    alert(`Document "${docType}" scanned successfully!`);
  }

  function triggerABHAVerification() {
    const abhaVal = document.getElementById('reg-abha').value.trim();
    if (!abhaVal) {
      alert('Please enter an ABHA ID (e.g. 91-0000-0000-0000) to verify.');
      return;
    }
    
    let otpModal = document.getElementById('abha-otp-modal');
    if (!otpModal) {
      otpModal = document.createElement('div');
      otpModal.id = 'abha-otp-modal';
      otpModal.className = 'modal-overlay';
      document.body.appendChild(otpModal);
    }
    
    otpModal.innerHTML = `
      <div class="modal-box" style="max-width: 900px; padding: 1.5rem;">
        <div style="text-align: center; margin-bottom: 1rem;">
          <span style="font-size: 2.5rem;">📱</span>
          <h4 style="margin: 0.5rem 0 0.25rem 0;">ABDM Consent & OTP Verification</h4>
          <p style="font-size: 0.8rem; color: var(--text-secondary);">An Aadhaar/ABHA linked OTP has been sent to the patient's registered mobile number ending in *3210.</p>
        </div>
        <div class="form-group" style="margin-bottom: 1rem;">
          <label class="form-label" style="font-weight: 700;">Enter 6-Digit OTP (Demo OTP: 123456)</label>
          <input type="text" id="abha-otp-input" class="form-control" placeholder="123456" style="text-align: center; letter-spacing: 0.5rem; font-size: 1.25rem;" maxlength="6">
        </div>
        <div style="display: flex; gap: 0.5rem;">
          <button class="btn btn-secondary" style="flex:1;" onclick="closeABHAOTPModal()">Cancel</button>
          <button class="btn btn-primary" style="flex:1;" onclick="verifyABHAOTP()">Verify & Link</button>
        </div>
      </div>
    `;
    otpModal.style.display = 'flex';
    otpModal.classList.add('active');
  }

  function closeABHAOTPModal() {
    const modal = document.getElementById('abha-otp-modal');
    if (modal) {
      modal.style.display = 'none';
      modal.classList.remove('active');
    }
  }

  function verifyABHAOTP() {
    const otpVal = document.getElementById('abha-otp-input').value.trim();
    if (otpVal === '123456') {
      closeABHAOTPModal();
      const abhaStatusBadge = document.getElementById('abha-verification-status');
      if (abhaStatusBadge) {
        abhaStatusBadge.innerHTML = `<span class="badge bg-success" style="color:white; padding:0.25rem 0.5rem; border-radius:4px; font-weight:700;">✓ ABDM VERIFIED & LINKED</span>`;
      }
      window.abhaLinked = true;
      addLocalAuditLog('ABHA Link', 'Linked verified ABHA ID via OTP validation.');
      alert('ABHA ID successfully verified and linked to Ayushman Bharat Digital Mission (ABDM) system!');
    } else {
      alert('Invalid OTP entered. Please use the Demo OTP: 123456');
    }
  }

  function submitRegistrationForm(event) {
    event.preventDefault();

    // Verify consents
    const consentReg = document.getElementById('reg-consent-registration');
    const consentPrivacy = document.getElementById('reg-consent-privacy');
    if (consentReg && !consentReg.checked) {
      alert('⚠️ Registration Consent is mandatory to onboarding a patient.');
      return;
    }
    if (consentPrivacy && !consentPrivacy.checked) {
      alert('⚠️ Privacy Consent is mandatory to onboarding a patient.');
      return;
    }

    const title = document.getElementById('reg-title').value;
    const firstName = document.getElementById('reg-first-name').value.trim();
    const lastName = document.getElementById('reg-last-name').value.trim();
    const gender = document.getElementById('reg-gender').value;
    const dob = document.getElementById('reg-dob').value;
    const ageVal = document.getElementById('reg-age').value.trim();
    const blood = document.getElementById('reg-blood').value;
    const aadhaar = document.getElementById('reg-aadhaar').value.trim();
    const passport = document.getElementById('reg-passport').value.trim();
    const consultantId = document.getElementById('reg-consultant').value;
    const mobile = document.getElementById('reg-mobile').value.trim();
    const religion = document.getElementById('reg-religion').value;
    const occupation = document.getElementById('reg-occupation').value.trim();
    const category = document.getElementById('reg-patient-category').value;
    const nationality = document.getElementById('reg-nationality').value.trim();
    const abhaVal = document.getElementById('reg-abha').value.trim();

    // Contact info
    const email = document.getElementById('reg-email').value.trim();
    const address = document.getElementById('reg-address').value.trim();
    const city = document.getElementById('reg-city').value.trim();
    const stateVal = document.getElementById('reg-state').value.trim();
    const pincode = document.getElementById('reg-pincode').value.trim();

    // Emergency contact
    const emergName = document.getElementById('reg-emerg-name').value.trim();
    const emergRelation = document.getElementById('reg-emerg-relation').value;
    const emergPhone = document.getElementById('reg-emerg-phone').value.trim();

    // Payer info
    const payerType = document.getElementById('reg-payer-type').value;
    let payerName = 'Cash Tariff';
    let policyNo = '';
    let memberId = '';
    let corpName = '';
    let corpEmpId = '';

    if (payerType === 'Insurance') {
      const insCompany = document.getElementById('reg-insurance-company').value;
      policyNo = document.getElementById('reg-policy-number').value.trim();
      memberId = document.getElementById('reg-member-id').value.trim();
      if (!policyNo || !memberId) {
        alert('⚠️ Policy Number and Member ID are required for Insurance payer type.');
        return;
      }
      payerName = insCompany + ' INSURANCE CO.';
    } else if (payerType === 'Corporate') {
      corpName = document.getElementById('reg-corporate-name').value.trim();
      corpEmpId = document.getElementById('reg-employee-id').value.trim();
      if (!corpName || !corpEmpId) {
        alert('⚠️ Company Name and Employee ID are required for Corporate payer type.');
        return;
      }
      payerName = corpName + ' CORP.';
    }

    // Clinical Alerts & Referrals
    const drugAllergy = document.getElementById('reg-drug-allergy').value.trim();
    const foodAllergy = document.getElementById('reg-food-allergy').value.trim();
    const specialNotes = document.getElementById('reg-special-notes').value.trim();
    const referredDoctor = document.getElementById('reg-referred-doctor').value.trim();
    const referredFacility = document.getElementById('reg-referred-facility').value.trim();

    // Validations
    if (!firstName || !lastName) {
      alert('⚠️ First name and Last name are required.');
      return;
    }
    if (!dob && !ageVal) {
      alert('⚠️ Date of Birth or Age is required.');
      return;
    }
    if (!mobile) {
      alert('⚠️ Mobile Number is required.');
      return;
    }
    if (!address || !city || !stateVal || !pincode) {
      alert('⚠️ Full Address (Address Line, City, State, Pincode) is required.');
      return;
    }
    if (!emergName || !emergPhone) {
      alert('⚠️ Emergency Contact Name and Mobile are required.');
      return;
    }

    // Clinical validations via state
    const validateDemo = state.validate('Demographic Entry', { dob, mobile, email, abhaId: abhaVal, aadhaar });
    if (validateDemo && validateDemo.status === 'BLOCK') {
      alert(validateDemo.message);
      return;
    }

    // Calculate age/DOB
    let calculatedAge = 0;
    if (dob) {
      const birthDate = new Date(dob);
      const ageDiff = Date.now() - birthDate.getTime();
      const ageDate = new Date(ageDiff);
      calculatedAge = Math.abs(ageDate.getUTCFullYear() - 1970);
    } else if (ageVal) {
      calculatedAge = parseInt(ageVal, 10);
    }

    const doc = state.doctors.find(d => d.id === consultantId);

    const nextId = state.patients.length + 1;
    const uhid = "UHID" + String(20000000 + nextId);

    // Allergies construct
    let allergyStr = "No Known Allergies";
    if (drugAllergy && foodAllergy) {
      allergyStr = `${drugAllergy} (Drug), ${foodAllergy} (Food)`;
    } else if (drugAllergy) {
      allergyStr = drugAllergy;
    } else if (foodAllergy) {
      allergyStr = `${foodAllergy} (Food)`;
    }

    const newPatient = {
      uhid: uhid,
      abhaId: window.abhaLinked ? (abhaVal || 'No ABHA Tagged') : 'No ABHA Tagged',
      aadhaar: aadhaar || 'Not Provided',
      passport: passport || 'Not Provided',
      name: `${firstName} ${lastName}`,
      age: calculatedAge,
      gender: gender,
      mobile: mobile,
      email: email || 'Not Provided',
      address: `${address}, ${city}, ${stateVal} - ${pincode}`,
      bloodGroup: blood,
      allergies: allergyStr,
      religion: religion,
      occupation: occupation || 'Not Provided',
      patientCategory: category,
      nationality: nationality || 'Indian',
      emergencyContact: { name: emergName, relation: emergRelation, phone: emergPhone },
      payer: payerName,
      payerType: payerType,
      insuranceDetails: { company: payerType === 'Insurance' ? payerName : '', policyNo, memberId },
      corporateDetails: { companyName: corpName, employeeId: corpEmpId },
      clinicalAlerts: { drugAllergy, foodAllergy, specialNotes },
      referredBy: { doctorName: referredDoctor, facility: referredFacility },
      consents: {
        registration: true,
        privacy: true,
        abdm: document.getElementById('reg-consent-abdm') ? document.getElementById('reg-consent-abdm').checked : false
      },
      attachments: {
        photo: window.tempCapturedPhoto || null,
        scans: [...window.tempUploadedDocs]
      },
      primaryConsultant: doc ? doc.name : 'Unknown Doctor',
      department: doc ? doc.spec : 'General Medicine',
      type: "OPD",
      status: "Registered",
      vitals: { bp: "120/80", hr: 74, temp: 98.4, spo2: 99, weight: 68, bmi: 22.1 },
      clinicalData: {
        complaint: "Routine outpatient check-in",
        hpi: "Requested physical exam.",
        examination: "Patient is alert, stable.",
        diagnosis: "Healthy subject observation",
        treatmentPlan: "Advice standard yearly check-up",
        carePlan: "Normal activities."
      },
      prescriptions: [],
      history: { pastConditions: "None", surgeries: "None", familyHistory: "None" }
    };

    // Duplicate Similarity Checks via state
    const duplicateCheck = state.validate('Duplicate Entry', {
      name: `${firstName} ${lastName}`,
      age: calculatedAge,
      mobile,
      abhaId: abhaVal,
      aadhaar,
      passport
    });

    if (duplicateCheck && duplicateCheck.status === 'WARNING') {
      window.tempNewPatient = newPatient;
      showDuplicateWarningModal(newPatient, duplicateCheck.existingPatient, duplicateCheck.score, duplicateCheck.reasons);
      return;
    }

    // Direct save
    saveCreatedPatient(newPatient);
  }

  function saveCreatedPatient(patient) {
    state.patients.unshift(patient);
    
    // Add default token
    const nextTokenNo = "REG-" + String(state.tokens.length + 1).padStart(3, '0');
    state.tokens.push({
      tokenNo: nextTokenNo,
      uhid: patient.uhid,
      patientName: patient.name,
      department: patient.department,
      doctor: patient.primaryConsultant,
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      status: "Waiting",
      queuePos: String(state.tokens.filter(t => t.status === 'Waiting').length),
      estWait: "15 mins"
    });

    addLocalAuditLog('Register Patient', `Onboarded patient ${patient.name} (${patient.uhid}) in registry and generated token.`);
    
    // Display custom success modal with recommended next actions
    showRegistrationSuccessModal(patient);
  }

  function showRegistrationSuccessModal(patient) {
    let modal = document.getElementById('registration-success-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'registration-success-modal';
      modal.className = 'modal-overlay';
      document.body.appendChild(modal);
    }

    modal.innerHTML = `
      <div class="modal-box" style="max-width: 900px; text-align: center; padding: 2rem;">
        <div style="font-size: 4rem; color: var(--color-success); margin-bottom: 1rem; animation: scaleUp 0.3s ease;">
          🎉
        </div>
        <h3 class="modal-title" style="margin: 0 0 0.5rem 0; font-size: 1.5rem; font-weight: 800; color: var(--text-primary);">
          Patient Registered Successfully!
        </h3>
        <p style="color: var(--text-secondary); font-size: 0.85rem; margin-bottom: 1.5rem;">
          Patient chart initialized. Unique health identifier assigned.
        </p>

        <!-- Patient Info Card -->
        <div style="background: var(--bg-surface-elevated); border: 1px solid var(--border-color); border-radius: 8px; padding: 1.25rem; text-align: left; margin-bottom: 1.75rem; display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; font-size: 0.85rem; line-height: 1.4;">
          <div><strong>Patient Name:</strong> ${patient.name}</div>
          <div><strong>UHID:</strong> <span style="font-family: monospace; font-weight: bold; color: var(--primary);">${patient.uhid}</span></div>
          <div><strong>Mobile:</strong> ${patient.mobile}</div>
          <div><strong>Payer Tariff:</strong> ${patient.payer}</div>
          <div style="grid-column: span 2;"><strong>Consultant:</strong> ${patient.primaryConsultant} (${patient.department})</div>
        </div>

        <h5 style="text-align: left; font-weight: 700; color: var(--text-primary); margin-bottom: 0.75rem; border-bottom: 1px solid var(--border-color); padding-bottom: 0.35rem;">Recommended Next Steps:</h5>
        
        <div style="display: flex; flex-direction: column; gap: 0.75rem; margin-bottom: 1.5rem;">
          <!-- Book OPD Appointment -->
          <button class="btn btn-primary" onclick="handleSuccessModalAction('appointments', '${patient.uhid}')" style="justify-content: center; gap: 0.5rem; font-weight: 700;">
            📅 Book Outpatient (OPD) Appointment
          </button>
          
          <!-- Admit to IPD Bed -->
          <button class="btn btn-secondary" onclick="handleSuccessModalAction('ipdAdmission', '${patient.uhid}')" style="justify-content: center; gap: 0.5rem; font-weight: 700; background: var(--secondary); color: white; border-color: var(--secondary);">
            🏥 Admit to Inpatient (IPD) Bed
          </button>

          <!-- Print Wristband Stickers -->
          <button class="btn btn-outline" onclick="handleSuccessModalAction('stickers', '${patient.uhid}')" style="justify-content: center; gap: 0.5rem; font-weight: 600;">
            🏷️ Print Admission Wristband & Stickers
          </button>
        </div>

        <div style="display: flex; justify-content: flex-end; padding-top: 1rem; border-top: 1px solid var(--border-color);">
          <button class="btn btn-secondary" onclick="handleSuccessModalAction('exit', '')" style="font-size: 0.85rem;">
            Close & Back to Registry
          </button>
        </div>
      </div>
    `;

    modal.style.display = 'flex';
    modal.classList.add('active');
  }

  function handleSuccessModalAction(action, uhid) {
    closeSuccessRegistrationModal();
    
    // Clear registration flow states
    window.searchPerformed = false;
    window.abhaLinked = false;
    window.tempUploadedDocs = [];
    window.tempCapturedPhoto = null;
    window.regFormOpened = false;
    window.registrationModeActive = false;
    window.activeInnerFormTab = 'inner-demo';

    if (action === 'stickers') {
      window.activeRegTab = 'stickers';
      router.navigate('registration');
      setTimeout(() => {
        const select = document.getElementById('sticker-patient-select');
        if (select) {
          select.value = uhid;
          if (typeof window.updateStickerPreview === 'function') {
            window.updateStickerPreview();
          }
        }
      }, 100);
    } else if (action === 'appointments') {
      router.navigate(`appointments?uhid=${uhid}`);
    } else if (action === 'ipdAdmission') {
      router.navigate(`ipdAdmission?uhid=${uhid}`);
    } else {
      exitRegistrationFlow();
    }
  }

  function closeSuccessRegistrationModal() {
    const modal = document.getElementById('registration-success-modal');
    if (modal) {
      modal.style.display = 'none';
      modal.classList.remove('active');
    }
  }

  function showDuplicateWarningModal(newPatient, existingPatient, score, reasons) {
    let modal = document.getElementById('duplicate-warning-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'duplicate-warning-modal';
      modal.className = 'modal-overlay';
      document.body.appendChild(modal);
    }

    modal.innerHTML = `
      <div class="modal-box" style="max-width: 900px;">
        <div class="modal-header" style="background-color: var(--color-danger-bg); color: var(--color-danger); border-bottom:1px solid var(--border-color);">
          <h4 class="modal-title" style="margin: 0; font-weight:700;">⚠️ Potential Duplicate Chart Detected</h4>
          <span class="modal-close" style="cursor:pointer; font-size:1.5rem;" onclick="closeDuplicateModal()">&times;</span>
        </div>
        <div class="modal-body" style="padding: 1.5rem; display:flex; flex-direction:column; gap:1rem; font-size:0.85rem;">
          <div style="background-color: var(--color-warning-bg); color: var(--color-warning); padding:0.75rem; border-radius:6px; font-weight:bold; text-align:center;">
            Similarity Matching Score: ${score}% Match
          </div>
          <p>The patient details provided match an existing file in our system:</p>

          <div style="background:var(--bg-surface-elevated); padding:1rem; border-radius:6px; border:1px solid var(--border-color);">
            <p><strong>Existing Patient Name:</strong> ${existingPatient.name} (${existingPatient.uhid})</p>
            <p><strong>Mobile:</strong> ${existingPatient.mobile} | <strong>Aadhaar:</strong> ${existingPatient.aadhaar}</p>
            <p><strong>Age/Gender:</strong> ${existingPatient.age} Yrs / ${existingPatient.gender}</p>
            <p><strong>Consultant:</strong> ${existingPatient.primaryConsultant} (${existingPatient.department})</p>
          </div>

          <p><strong>Match Reasons:</strong> ${reasons.join(', ')}</p>

          <div style="background-color: var(--primary-glow); padding:0.75rem; border-radius:6px; color:var(--primary); font-weight:600;">
            NABH Recommendation: Open the existing record or merge details to avoid charting fragmentation.
          </div>

          <div class="form-group">
            <label class="form-label" style="font-weight:700;">If bypassing duplicate warning, enter Operator Justification:</label>
            <input type="text" id="duplicate-override-reason" class="form-control" placeholder="e.g. Verified Aadhaar and patient is indeed a twin...">
          </div>

          <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.75rem; margin-top:0.5rem;">
            <button class="btn btn-primary" onclick="cancelAndLinkDuplicate('${existingPatient.uhid}')">Cancel & Open Existing EMR</button>
            <button class="btn btn-danger" onclick="bypassDuplicateCheck()">Bypass Warning & Create New File</button>
          </div>
        </div>
      </div>
    `;
    modal.style.display = 'flex';
    modal.classList.add('active');
  }

  function closeDuplicateModal() {
    const modal = document.getElementById('duplicate-warning-modal');
    if (modal) {
      modal.style.display = 'none';
      modal.classList.remove('active');
    }
  }

  function cancelAndLinkDuplicate(uhid) {
    closeDuplicateModal();
    addLocalAuditLog('Duplicate Block', `Operator cancelled new registration to use existing record ${uhid}`);
    router.navigate(`patients?uhid=${uhid}`);
  }

  function bypassDuplicateCheck() {
    const reason = document.getElementById('duplicate-override-reason').value.trim();
    if (!reason) {
      alert('⚠️ Input Required: Please provide an Operator justification reason before bypassing compliance warning.');
      return;
    }

    const patient = window.tempNewPatient;
    if (!patient) return;

    closeDuplicateModal();
    
    // Add override bypass to alerts log
    state.alerts.unshift({
      id: "ALT" + String(100 + state.alerts.length + 1),
      severity: "Warning",
      source: "Registration",
      patientName: patient.name,
      uhid: patient.uhid,
      details: `Bypassed duplicate registration match. Override reason: "${reason}"`,
      clinician: "Front Desk Staff",
      time: new Date().toLocaleTimeString('en-US') + " " + new Date().toLocaleDateString('en-US'),
      status: "Active",
      eStatus: "Open"
    });

    addLocalAuditLog('Duplicate Bypass', `Bypassed duplicate warning for ${patient.name} (${patient.uhid}). Reason: "${reason}"`);
    saveCreatedPatient(patient);
  }

  function submitEmergencyFastTrack(event) {
    event.preventDefault();

    const name = document.getElementById('emerg-name').value.trim();
    const gender = document.getElementById('emerg-gender').value;
    const age = parseInt(document.getElementById('emerg-age').value);
    const phone = document.getElementById('emerg-phone').value.trim();
    const doctorId = document.getElementById('emerg-consultant').value;
    const ward = document.getElementById('emerg-ward').value;

    const docObj = state.doctors.find(d => d.id === doctorId);
    
    const nextId = state.patients.length + 1;
    const tempUhid = "UHID-TEMP-" + String(20000000 + nextId);

    const emergPatient = {
      uhid: tempUhid,
      abhaId: 'No ABHA Tagged',
      aadhaar: 'Not Provided',
      passport: 'Not Provided',
      name: name,
      age: age,
      gender: gender,
      mobile: phone || '9999999999',
      address: 'EMERGENCY TRAUMA WARD',
      bloodGroup: 'O+',
      allergies: "Unknown Allergies (TRAUMA BLOCK)",
      emergencyContact: { name: 'Trauma Desk', relation: 'Guardian', phone: '9999999999' },
      payer: 'Cash Tariff',
      payerType: 'Direct',
      sponsor: 'Self',
      primaryConsultant: docObj ? docObj.name : 'Emergency Consultant',
      department: 'Emergency Medicine',
      status: "Admitted",
      vitals: { bp: "110/70", hr: 95, temp: 98.6, spo2: 95, weight: 70, bmi: 22.8 },
      clinicalData: {
        complaint: "Emergency trauma admission",
        hpi: "Brought to emergency room via ambulance.",
        examination: "Emergency clinical triage required.",
        diagnosis: "Accident / Trauma triage pending",
        treatmentPlan: "Immediate trauma evaluation.",
        carePlan: "NPO."
      },
      prescriptions: [],
      history: { pastConditions: "Unknown", surgeries: "Unknown", familyHistory: "Unknown" }
    };

    state.patients.unshift(emergPatient);
    
    // Automatically add active admission
    state.admissions.unshift({
      uhid: tempUhid,
      patientName: name,
      doctorName: docObj ? docObj.name : 'Emergency Consultant',
      ward: ward,
      bed: ward === 'EMERGENCY' ? 'EMG-01' : 'CCU-BED-01',
      diagnosis: 'Acute Trauma / ER Triage',
      date: new Date().toISOString().split('T')[0],
      status: 'Active'
    });

    // Generate emergency token
    const tokenNo = "EMG-" + String(900 + state.tokens.length + 1);
    state.tokens.unshift({
      tokenNo: tokenNo,
      uhid: tempUhid,
      patientName: name,
      department: 'Emergency Medicine',
      doctor: docObj ? docObj.name : 'Emergency Consultant',
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      status: "Waiting",
      queuePos: "Immediate",
      estWait: "0 mins (Trauma)"
    });

    addLocalAuditLog('Emergency Fast-Track', `Created emergency file ${name} (${tempUhid}) and generated trauma token.`);
    alert(`Emergency fast-track file initialized! Temporary UHID: ${tempUhid}. Patient assigned to emergency bed.`);

    window.searchPerformed = false;
    exitRegistrationFlow();
  }

  function selectPatientForWristband(uhid) {
    startNewRegistrationFlow(); // Open tabs flow
    switchRegTab('stickers');
    const select = document.getElementById('sticker-patient-select');
    if (select) {
      select.value = uhid;
      updateStickerPreview();
    }
  }

  function updateStickerPreview() {
    const selectEl = document.getElementById('sticker-patient-select');
    if (!selectEl) return;
    const uhid = selectEl.value;
    const patient = state.patients.find(p => p.uhid === uhid);
    if (!patient) return;

    // Wristband
    const prevWbName = document.getElementById('prev-wb-name');
    const prevWbDetails = document.getElementById('prev-wb-details');
    const prevWbAllergies = document.getElementById('prev-wb-allergies');
    if (prevWbName) prevWbName.textContent = patient.name;
    if (prevWbDetails) prevWbDetails.textContent = `${patient.uhid} | ${patient.age}Y/${patient.gender.charAt(0)} | ${patient.bloodGroup || 'B+'}`;
    if (prevWbAllergies) prevWbAllergies.textContent = `Allergies: ${patient.allergies}`;

    // Lab
    const prevLabName = document.getElementById('prev-lab-name');
    const prevLabDetails = document.getElementById('prev-lab-details');
    if (prevLabName) prevLabName.textContent = patient.name;
    if (prevLabDetails) prevLabDetails.textContent = `UHID: ${patient.uhid} | ${patient.age}Y/${patient.gender.charAt(0)}`;

    // Reg
    const prevRegName = document.getElementById('prev-reg-name');
    const prevRegDetails = document.getElementById('prev-reg-details');
    if (prevRegName) prevRegName.textContent = patient.name;
    if (prevRegDetails) prevRegDetails.textContent = `UHID: ${patient.uhid} | Sponsor: ${patient.sponsor}`;
  }

  function printSticker(type) {
    const patientUhid = document.getElementById('sticker-patient-select').value;
    const patient = state.patients.find(p => p.uhid === patientUhid);
    if (!patient) {
      alert('Please select a patient.');
      return;
    }

    const copies = parseInt(document.getElementById('sticker-copies').value) || 1;
    const printer = document.getElementById('sticker-printer-select').value;

    const printStatusBox = document.getElementById('print-status-box');
    if (printStatusBox) {
      printStatusBox.innerHTML = `
        <div style="background-color: var(--primary-glow); border: 1px solid var(--primary); padding: 0.75rem; border-radius: 6px; display:flex; align-items:center; gap: 0.5rem; font-size:0.8rem; font-weight: 500;">
          <span style="display:inline-block; width:14px; height:14px; border: 2px solid var(--primary); border-top: 2px solid transparent; border-radius:50%; animation: spin 1s linear infinite;"></span>
          <span>Sending job to printer "${printer}" (${copies} copies)...</span>
        </div>
      `;
    }

    setTimeout(() => {
      const nextPrintId = "PRN" + String(1000 + state.printHistory.length + 1);
      const newJob = {
        id: nextPrintId,
        patientName: patient.name,
        uhid: patient.uhid,
        type: type,
        copies: copies,
        printer: printer,
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) + " " + new Date().toLocaleDateString('en-US')
      };
      
      state.printHistory.unshift(newJob);
      addLocalAuditLog('Sticker Print', `Printed ${copies} copies of ${type} for patient ${patient.name} (${patient.uhid}) on printer ${printer}.`);

      if (printStatusBox) {
        printStatusBox.innerHTML = `
          <div style="background-color: var(--color-success-bg); border: 1px solid var(--color-success); padding: 0.75rem; border-radius: 6px; display:flex; align-items:center; gap: 0.5rem; font-size:0.8rem; font-weight: 500; color: var(--color-success);">
            <span>✓</span>
            <span>Printed job successfully! (ID: ${nextPrintId})</span>
          </div>
        `;
      }
      
      renderStickersPrintHistory();
    }, 1200);
  }

  function changeTokenStatus(tokenNo, status) {
    const token = state.tokens.find(t => t.tokenNo === tokenNo);
    if (!token) return;

    token.status = status;
    if (status === 'Completed') {
      token.queuePos = '-';
      token.estWait = '-';
    }

    addLocalAuditLog('Token Change', `Changed queue status of token ${tokenNo} for ${token.patientName} to ${status}`);
    renderQueueTokensTable();
    renderWorkspaceKPICards();
  }

  function switchInnerFormTab(innerTabId) {
    const currentActiveTab = document.querySelector('.inner-tab-content.active');
    const currentTabId = currentActiveTab ? currentActiveTab.id : null;
    
    const tabOrder = ['inner-demo', 'inner-address', 'inner-payer', 'inner-clinical', 'inner-consent'];
    const currentIndex = tabOrder.indexOf(currentTabId);
    const targetIndex = tabOrder.indexOf(innerTabId);
    
    // If going forward, validate current tab
    if (currentTabId && targetIndex > currentIndex) {
      // Validate each step between current and target
      for (let i = currentIndex; i < targetIndex; i++) {
        if (!validateTabFields(tabOrder[i])) {
          switchTabActions(tabOrder[i]);
          return;
        }
      }
    }
    
    switchTabActions(innerTabId);
  }

  function validateTabFields(tabId) {
    if (tabId === 'inner-demo') {
      const firstName = document.getElementById('reg-first-name') ? document.getElementById('reg-first-name').value.trim() : '';
      const lastName = document.getElementById('reg-last-name') ? document.getElementById('reg-last-name').value.trim() : '';
      const dob = document.getElementById('reg-dob') ? document.getElementById('reg-dob').value : '';
      const ageVal = document.getElementById('reg-age') ? document.getElementById('reg-age').value.trim() : '';
      const mobile = document.getElementById('reg-mobile') ? document.getElementById('reg-mobile').value.trim() : '';
      const consultant = document.getElementById('reg-consultant') ? document.getElementById('reg-consultant').value : '';
      
      if (!firstName || !lastName) {
        alert('⚠️ First name and Last name are required.');
        return false;
      }
      if (!dob && !ageVal) {
        alert('⚠️ Date of Birth or Age is required.');
        return false;
      }
      if (!mobile) {
        alert('⚠️ Mobile Number is required.');
        return false;
      }
      if (mobile.length !== 10) {
        alert('⚠️ Mobile Number must be exactly 10 digits.');
        return false;
      }
      if (!consultant) {
        alert('⚠️ Preferred Consultant is required.');
        return false;
      }
    } else if (tabId === 'inner-address') {
      const address = document.getElementById('reg-address') ? document.getElementById('reg-address').value.trim() : '';
      const city = document.getElementById('reg-city') ? document.getElementById('reg-city').value.trim() : '';
      const stateVal = document.getElementById('reg-state') ? document.getElementById('reg-state').value.trim() : '';
      const pincode = document.getElementById('reg-pincode') ? document.getElementById('reg-pincode').value.trim() : '';
      const emergName = document.getElementById('reg-emerg-name') ? document.getElementById('reg-emerg-name').value.trim() : '';
      const emergPhone = document.getElementById('reg-emerg-phone') ? document.getElementById('reg-emerg-phone').value.trim() : '';

      if (!address || !city || !stateVal || !pincode) {
        alert('⚠️ Full Address (Address Line, City, State, Pincode) is required.');
        return false;
      }
      if (!emergName || !emergPhone) {
        alert('⚠️ Emergency Contact Name and Mobile are required.');
        return false;
      }
      if (emergPhone.length !== 10) {
        alert('⚠️ Emergency Mobile Number must be exactly 10 digits.');
        return false;
      }
    } else if (tabId === 'inner-payer') {
      const payerType = document.getElementById('reg-payer-type') ? document.getElementById('reg-payer-type').value : '';
      if (payerType === 'Insurance') {
        const policyNo = document.getElementById('reg-policy-number') ? document.getElementById('reg-policy-number').value.trim() : '';
        const memberId = document.getElementById('reg-member-id') ? document.getElementById('reg-member-id').value.trim() : '';
        if (!policyNo || !memberId) {
          alert('⚠️ Policy Number and Member ID are required for Insurance payer type.');
          return false;
        }
      } else if (payerType === 'Corporate') {
        const corpName = document.getElementById('reg-corporate-name') ? document.getElementById('reg-corporate-name').value.trim() : '';
        const corpEmpId = document.getElementById('reg-employee-id') ? document.getElementById('reg-employee-id').value.trim() : '';
        if (!corpName || !corpEmpId) {
          alert('⚠️ Company Name and Employee ID are required for Corporate payer type.');
          return false;
        }
      }
    }
    return true;
  }

  function switchTabActions(innerTabId) {
    document.querySelectorAll('.inner-tab-content').forEach(content => {
      content.classList.remove('active');
    });
    document.querySelectorAll('.inner-tab-btn').forEach(btn => {
      btn.classList.remove('active');
    });

    const targetEl = document.getElementById(innerTabId);
    if (targetEl) targetEl.classList.add('active');
    
    // Highlight button
    const buttons = document.querySelectorAll('.inner-tab-btn');
    buttons.forEach(btn => {
      if (btn.getAttribute('onclick') && btn.getAttribute('onclick').includes(innerTabId)) {
        btn.classList.add('active');
      }
    });

    window.activeInnerFormTab = innerTabId;
    renderInnerFormActions(innerTabId);
  }

  function renderInnerFormActions(innerTabId) {
    const actionsEl = document.getElementById('inner-form-actions');
    if (!actionsEl) return;
    
    if (innerTabId === 'inner-demo') {
      actionsEl.innerHTML = `
        <button type="button" class="btn btn-secondary" onclick="exitRegistrationFlow()">Cancel</button>
        <button type="button" class="btn btn-primary" onclick="switchInnerFormTab('inner-address')" style="display: flex; align-items: center; gap: 0.5rem; font-weight: 700;">
          Next: Address & Emergency ➡️
        </button>
      `;
    } else if (innerTabId === 'inner-address') {
      actionsEl.innerHTML = `
        <button type="button" class="btn btn-secondary" onclick="switchInnerFormTab('inner-demo')" style="display: flex; align-items: center; gap: 0.5rem; font-weight: 700;">
          ⬅️ Back: Patient Info
        </button>
        <button type="button" class="btn btn-primary" onclick="switchInnerFormTab('inner-payer')" style="display: flex; align-items: center; gap: 0.5rem; font-weight: 700;">
          Next: Payer Sponsor ➡️
        </button>
      `;
    } else if (innerTabId === 'inner-payer') {
      actionsEl.innerHTML = `
        <button type="button" class="btn btn-secondary" onclick="switchInnerFormTab('inner-address')" style="display: flex; align-items: center; gap: 0.5rem; font-weight: 700;">
          ⬅️ Back: Address
        </button>
        <button type="button" class="btn btn-primary" onclick="switchInnerFormTab('inner-clinical')" style="display: flex; align-items: center; gap: 0.5rem; font-weight: 700;">
          Next: Clinical & Referrals ➡️
        </button>
      `;
    } else if (innerTabId === 'inner-clinical') {
      actionsEl.innerHTML = `
        <button type="button" class="btn btn-secondary" onclick="switchInnerFormTab('inner-payer')" style="display: flex; align-items: center; gap: 0.5rem; font-weight: 700;">
          ⬅️ Back: Payer Details
        </button>
        <button type="button" class="btn btn-primary" onclick="switchInnerFormTab('inner-consent')" style="display: flex; align-items: center; gap: 0.5rem; font-weight: 700;">
          Next: Attachments & Consents ➡️
        </button>
      `;
    } else if (innerTabId === 'inner-consent') {
      actionsEl.innerHTML = `
        <button type="button" class="btn btn-secondary" onclick="switchInnerFormTab('inner-clinical')" style="display: flex; align-items: center; gap: 0.5rem; font-weight: 700;">
          ⬅️ Back: Clinical & Referrals
        </button>
        <div style="display: flex; gap: 1rem;">
          <button type="button" class="btn btn-secondary" onclick="exitRegistrationFlow()">Cancel</button>
          <button type="submit" class="btn btn-primary" id="reg-submit-btn" style="font-weight: 700;">Save Patient Details</button>
        </div>
      `;
    }
  }

  function triggerNewTokenDialog() {
    const modal = document.getElementById('new-token-modal');
    if (modal) {
      modal.style.display = 'flex';
      modal.classList.add('active');
      updateTokenDoctorDropdown();
    }
  }

  function closeTokenDialog() {
    const modal = document.getElementById('new-token-modal');
    if (modal) {
      modal.style.display = 'none';
      modal.classList.remove('active');
    }
  }

  function updateTokenDoctorDropdown() {
    const dept = document.getElementById('token-dept-select').value;
    const docSelect = document.getElementById('token-doctor-select');
    if (!docSelect) return;

    const filteredDocs = state.doctors.filter(d => d.spec.toLowerCase().includes(dept.toLowerCase()) || dept.toLowerCase().includes(d.spec.toLowerCase()));
    
    if (filteredDocs.length > 0) {
      docSelect.innerHTML = filteredDocs.map(d => `<option value="${d.name}">${d.name} (${d.spec})</option>`).join('');
    } else {
      docSelect.innerHTML = state.doctors.map(d => `<option value="${d.name}">${d.name} (${d.spec})</option>`).join('');
    }
  }

  function issueNewQueueToken() {
    const uhid = document.getElementById('token-patient-select').value;
    const dept = document.getElementById('token-dept-select').value;
    const doc = document.getElementById('token-doctor-select').value;

    const patient = state.patients.find(p => p.uhid === uhid);
    if (!patient) return;

    closeTokenDialog();

    const nextTokenNo = "REG-" + String(state.tokens.length + 1).padStart(3, '0');
    state.tokens.push({
      tokenNo: nextTokenNo,
      uhid: uhid,
      patientName: patient.name,
      department: dept,
      doctor: doc,
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      status: "Waiting",
      queuePos: String(state.tokens.filter(t => t.status === 'Waiting').length),
      estWait: "20 mins"
    });

    addLocalAuditLog('Token Generate', `Generated check-in token ${nextTokenNo} for ${patient.name} to see ${doc}.`);
    renderQueueTokensTable();
    renderWorkspaceKPICards();
    alert(`Token ${nextTokenNo} generated successfully for patient ${patient.name}!`);
  }

  function renderAuditLogs() {
    const tbody = document.getElementById('audit-logs-table-body');
    if (!tbody) return;

    tbody.innerHTML = state.auditLogs.map(l => `
      <tr>
        <td style="color:var(--text-muted); font-size:0.75rem;">${l.timestamp}</td>
        <td><span class="badge ${l.user === 'Administrator' ? 'badge-purple' : 'badge-primary'}">${l.user}</span></td>
        <td><strong>${l.action}</strong></td>
        <td style="font-size:0.8rem; max-width:400px; word-wrap:break-word;">${l.details}</td>
      </tr>
    `).join('');
  }

  function renderStickersPrintHistory() {
    const tbody = document.getElementById('print-history-table-body');
    if (!tbody) return;

    tbody.innerHTML = state.printHistory.map(p => `
      <tr>
        <td><code>${p.id}</code></td>
        <td>${p.patientName}</td>
        <td><code>${p.uhid}</code></td>
        <td><strong>${p.type}</strong></td>
        <td>${p.copies} Copy</td>
        <td>${p.printer}</td>
        <td>${p.time}</td>
      </tr>
    `).join('');
  }

  function renderQueueTokensTable() {
    const tbody = document.getElementById('token-queue-table-body');
    if (!tbody) return;

    tbody.innerHTML = state.tokens.map(t => {
      let statusStyle = 'color: var(--color-warning); font-weight:bold;';
      if (t.status === 'Completed') statusStyle = 'color: var(--color-success); font-weight:bold;';
      if (t.status === 'Called') statusStyle = 'color: var(--primary); font-weight:bold; animation: blink 1s infinite;';
      
      return `
        <tr>
          <td><strong style="color:var(--primary); font-size:0.95rem;">${t.tokenNo}</strong></td>
          <td><code>${t.uhid}</code></td>
          <td>${t.patientName}</td>
          <td>${t.department}</td>
          <td>${t.doctor}</td>
          <td>${t.time}</td>
          <td>${t.estWait}</td>
          <td><span style="${statusStyle}">${t.status}</span></td>
          <td style="text-align: right;">
            <div style="display:inline-flex; gap:0.25rem;">
              <button class="btn btn-outline btn-sm" onclick="changeTokenStatus('${t.tokenNo}', 'Called')" ${t.status === 'Completed' ? 'disabled' : ''}>Call</button>
              <button class="btn btn-secondary btn-sm" onclick="changeTokenStatus('${t.tokenNo}', 'Completed')" ${t.status === 'Completed' ? 'disabled' : ''}>Done</button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  }

  function addLocalAuditLog(action, details) {
    const newLog = {
      timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) + " " + new Date().toLocaleDateString('en-US'),
      user: window.currentRegRole === 'Front Desk' ? 'Front Desk Staff' : (window.currentRegRole === 'Admin' ? 'Administrator' : window.currentRegRole),
      action: action,
      details: details
    };
    state.auditLogs.unshift(newLog);
  }

  // Helper function to render Master Patient Registry table rows
  function renderTableRows(patientList) {
    const tbody = document.getElementById('registry-table-body');
    if (!tbody) return;
    
    if (patientList.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="8" style="text-align: center; color: var(--text-muted); padding: 3rem;">
            No matching patient records found in active database.
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = patientList.map(p => {
      let statusClass = 'badge-primary';
      if (p.status === 'Admitted') statusClass = 'badge-purple';
      if (p.status === 'Checked In') statusClass = 'badge-success';
      if (p.status === 'Day Care') statusClass = 'badge-info';

      return `
        <tr>
          <td>
            <div style="font-weight: 700; color: var(--text-primary);">${p.uhid}</div>
            <div style="font-size: 0.75rem; color: var(--text-muted);">${p.abhaId || 'No ABHA Tagged'}</div>
          </td>
          <td><a href="#patients?uhid=${p.uhid}" class="patient-link" style="font-weight:700;">${p.name}</a></td>
          <td>${p.age} Yrs / ${p.gender}</td>
          <td>${p.mobile}</td>
          <td>
            <div>${p.primaryConsultant}</div>
            <div style="font-size: 0.75rem; color: var(--text-muted);">${p.department}</div>
          </td>
          <td>
            <div>${p.sponsor}</div>
            <div style="font-size: 0.75rem; color: var(--text-muted);">${p.payerType}</div>
          </td>
          <td><span class="badge ${statusClass}">${p.status}</span></td>
          <td style="text-align: right;">
            <div style="display: inline-flex; gap: 0.5rem; justify-content: flex-end;">
              <button class="btn btn-secondary btn-sm" onclick="router.navigate('emr?uhid=${p.uhid}')">EMR Profile</button>
              ${p.status === 'Registered' ? `<button class="btn btn-primary btn-sm" onclick="router.navigate('appointments?uhid=${p.uhid}')">Book OPD</button>` : ''}
              ${p.status === 'Checked In' ? `<button class="btn btn-outline btn-sm" onclick="router.navigate('ipdAdmission?uhid=${p.uhid}')">Admit IPD</button>` : ''}
            </div>
          </td>
        </tr>
      `;
    }).join('');
  }

  // Flows navigation helpers
  function startNewRegistrationFlow() {
    window.registrationModeActive = true;
    window.searchPerformed = false;
    window.regFormOpened = false;
    window.activeRegTab = 'search';
    router.navigate('registration-new');
  }

  function exitRegistrationFlow() {
    window.registrationModeActive = false;
    window.regFormOpened = false;
    window.activeInnerFormTab = 'inner-demo';
    router.navigate('registration');
  }

  // Dynamic renderer of the bottom area
  function renderBottomWorkspace() {
    const bottomArea = document.getElementById('reg-bottom-workspace');
    if (!bottomArea) return;

    if (!window.registrationModeActive) {
      // Show Registry Search & Table
      bottomArea.innerHTML = `
        <!-- 6 Workspace KPI Cards (rendered only on the main registration registry page) -->
        <div class="stats-grid" id="reg-kpi-cards" style="margin-bottom: 1.5rem;">
          <!-- Loaded Dynamically -->
        </div>

        <div class="card">
          <div class="card-header">
            <div>
              <h3 class="card-title">Master Patient Registry</h3>
              <p class="card-subtitle">Search, filter, and review active hospital patient records</p>
            </div>
          </div>
          <div class="card-body">
            <!-- Search & Filter Controls -->
            <div style="display: flex; gap: 1rem; margin-bottom: 1.5rem; flex-wrap: wrap;">
              <input type="text" id="reg-search-input" class="form-control" placeholder="Search by Name, UHID, Mobile, or ABHA ID..." style="flex: 1; min-width: 250px;">
              <select id="reg-payer-filter" class="form-select" style="width: 180px;">
                <option value="">All Payers</option>
                <option value="Direct">Cash Tariff</option>
                <option value="Company">Insurance / TPA</option>
              </select>
              <select id="reg-status-filter" class="form-select" style="width: 180px;">
                <option value="">All Statuses</option>
                <option value="Registered">Registered Only</option>
                <option value="Checked In">Checked In (OPD)</option>
                <option value="Admitted">Admitted (IPD)</option>
              </select>
              <button class="btn btn-secondary" id="reg-filter-clear">Clear Filters</button>
            </div>

            <!-- Patients Data Table -->
            <div class="custom-table-container">
              <table class="custom-table">
                <thead>
                  <tr>
                    <th>UHID / ABHA ID</th>
                    <th>Patient Name</th>
                    <th>Age / Gender</th>
                    <th>Mobile Number</th>
                    <th>Primary Consultant</th>
                    <th>Payer Group</th>
                    <th>Status</th>
                    <th style="text-align: right;">Actions</th>
                  </tr>
                </thead>
                <tbody id="registry-table-body">
                  <!-- Rendered dynamically -->
                </tbody>
              </table>
            </div>
          </div>
        </div>
      `;

      // Bind filter triggers
      const searchInput = document.getElementById('reg-search-input');
      const payerFilter = document.getElementById('reg-payer-filter');
      const statusFilter = document.getElementById('reg-status-filter');
      const clearBtn = document.getElementById('reg-filter-clear');

      const filterRegistry = () => {
        const query = searchInput.value.toLowerCase().trim();
        const payerVal = payerFilter.value;
        const statusVal = statusFilter.value;

        const filtered = state.patients.filter(p => {
          const matchesQuery = !query || 
            p.name.toLowerCase().includes(query) || 
            p.uhid.toLowerCase().includes(query) || 
            p.mobile.includes(query) || 
            p.abhaId.toLowerCase().includes(query);

          const matchesPayer = !payerVal || p.payerType === payerVal;
          const matchesStatus = !statusVal || p.status === statusVal;

          return matchesQuery && matchesPayer && matchesStatus;
        });

        renderTableRows(filtered);
      };

      searchInput.addEventListener('input', filterRegistry);
      payerFilter.addEventListener('change', filterRegistry);
      statusFilter.addEventListener('change', filterRegistry);
      clearBtn.addEventListener('click', () => {
        searchInput.value = '';
        payerFilter.value = '';
        statusFilter.value = '';
        filterRegistry();
      });

      // Initial table render
      renderTableRows(state.patients);
      renderWorkspaceKPICards();
    } else {
      // Show tabs navigation & panels
      bottomArea.innerHTML = `
        <!-- Main Onboarding Tabs Navigation -->
        <div style="display: flex; border-bottom: 2px solid var(--border-color); margin-bottom: 1.5rem; gap: 0.5rem; flex-wrap: wrap;">
          <button class="tab-btn ${window.activeRegTab === 'search' ? 'active' : ''}" id="tab-btn-search" onclick="switchRegTab('search')" style="background: none; border: none; border-bottom: 3px solid ${window.activeRegTab === 'search' ? 'var(--primary)' : 'transparent'}; padding: 0.75rem 1rem; font-weight: 700; cursor: pointer; color: ${window.activeRegTab === 'search' ? 'var(--primary)' : 'var(--text-secondary)'};">📝 1. Basic Details</button>
          <button class="tab-btn ${window.activeRegTab === 'form' ? 'active' : ''}" id="tab-btn-form" onclick="switchRegTab('form')" style="background: none; border: none; border-bottom: 3px solid ${window.activeRegTab === 'form' ? 'var(--primary)' : 'transparent'}; padding: 0.75rem 1rem; font-weight: 600; cursor: pointer; color: ${window.activeRegTab === 'form' ? 'var(--primary)' : 'var(--text-secondary)'};" ${window.searchPerformed ? '' : 'disabled'}>📝 2. Full Onboarding Form ${window.searchPerformed ? '' : '🔒'}</button>
          <button class="tab-btn ${window.activeRegTab === 'fast' ? 'active' : ''}" id="tab-btn-fast" onclick="switchRegTab('fast')" style="display: none; background: none; border: none; border-bottom: 3px solid ${window.activeRegTab === 'fast' ? 'var(--primary)' : 'transparent'}; padding: 0.75rem 1rem; font-weight: 600; cursor: pointer; color: ${window.activeRegTab === 'fast' ? 'var(--primary)' : 'var(--text-secondary)'};" ${window.searchPerformed ? '' : 'disabled'}>⚡ 3. Emergency Fast-Track ${window.searchPerformed ? '' : '🔒'}</button>
          <button class="tab-btn ${window.activeRegTab === 'stickers' ? 'active' : ''}" id="tab-btn-stickers" onclick="switchRegTab('stickers')" style="display: none; background: none; border: none; border-bottom: 3px solid ${window.activeRegTab === 'stickers' ? 'var(--primary)' : 'transparent'}; padding: 0.75rem 1rem; font-weight: 600; cursor: pointer; color: ${window.activeRegTab === 'stickers' ? 'var(--primary)' : 'var(--text-secondary)'};">🏷️ 4. Sticker & Wristbands</button>
          <button class="tab-btn ${window.activeRegTab === 'queue' ? 'active' : ''}" id="tab-btn-queue" onclick="switchRegTab('queue')" style="display: none; background: none; border: none; border-bottom: 3px solid ${window.activeRegTab === 'queue' ? 'var(--primary)' : 'transparent'}; padding: 0.75rem 1rem; font-weight: 600; cursor: pointer; color: ${window.activeRegTab === 'queue' ? 'var(--primary)' : 'var(--text-secondary)'};">🎫 5. Token Queue Desk</button>
          <button class="tab-btn ${window.activeRegTab === 'audit' ? 'active' : ''}" id="tab-btn-audit" onclick="switchRegTab('audit')" style="display: none; background: none; border: none; border-bottom: 3px solid ${window.activeRegTab === 'audit' ? 'var(--primary)' : 'transparent'}; padding: 0.75rem 1rem; font-weight: 600; cursor: pointer; color: ${window.activeRegTab === 'audit' ? 'var(--primary)' : 'var(--text-secondary)'};">📜 6. Compliance Logs</button>
        </div>

        <!-- Panels -->
        <!-- Tab Panel 1: Basic Details -->
        <div id="panel-search" class="reg-tab-panel ${window.activeRegTab === 'search' ? 'active' : ''}">
          <div class="card" style="margin-bottom: 1.5rem;">
            <div class="card-header">
              <h4 class="card-title" style="margin: 0; display:flex; align-items:center; gap:0.5rem; color: var(--text-primary);">
                <span>📝</span> Basic Details Search & Duplicate Check
              </h4>
            </div>
            <div class="card-body" style="padding: 1.25rem;">
              <p style="font-size: 0.85rem; margin-top: 0; color: var(--text-secondary);">
                Enter patient name or mobile number to query the master registry before starting a new file.
              </p>
              
              <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1.25rem; align-items: flex-end;">
                <div class="form-group">
                  <label class="form-label" style="font-weight:700;">Patient Name / UHID</label>
                  <input type="text" id="forced-search-name" class="form-control" placeholder="Ramesh Chandra or UHID...">
                </div>
                <div class="form-group">
                  <label class="form-label" style="font-weight:700;">Mobile Number</label>
                  <input type="tel" id="forced-search-mobile" class="form-control" placeholder="9876543210">
                </div>
                <div class="form-group">
                  <button type="button" class="btn btn-primary" onclick="performPatientSearch()" style="width:100%; height:40px;">🔍 Run Duplicate Verification Check</button>
                </div>
              </div>
              
              <div id="search-check-status" style="margin-top: 1rem;"></div>
            </div>
          </div>

          <div class="card">
            <div class="card-header"><h3 class="card-title">Active Database Search Matches</h3></div>
            <div class="card-body">
              <div class="custom-table-container">
                <table class="custom-table">
                  <thead>
                    <tr>
                      <th>UHID / ABHA ID</th>
                      <th>Patient Name</th>
                      <th>Age / Gender</th>
                      <th>Mobile</th>
                      <th>Consultant</th>
                      <th>Sponsor Group</th>
                      <th>Status</th>
                      <th style="text-align: right;">Action</th>
                    </tr>
                  </thead>
                  <tbody id="forced-search-table-body">
                    <!-- Loaded dynamically -->
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <!-- Tab Panel 2: Full Form -->
        <div id="panel-form" class="reg-tab-panel ${window.activeRegTab === 'form' ? 'active' : ''}">
          ${!window.regFormOpened ? `
            <div class="card" style="text-align: center; padding: 4rem 2rem; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 1.5rem; background: var(--bg-surface); border: 1px dashed var(--border-color); border-radius: var(--radius-md);">
              <div style="font-size: 3rem; background: var(--primary-glow); width: 80px; height: 80px; display: flex; align-items: center; justify-content: center; border-radius: 50%; color: var(--primary);">
                📝
              </div>
              <div style="max-width: 480px;">
                <h3 style="margin: 0 0 0.5rem 0; font-size: 1.5rem; font-weight: 800; color: var(--text-primary);">Detailed Demographic Onboarding</h3>
                <p style="margin: 0; font-size: 0.85rem; color: var(--text-muted); line-height: 1.5;">
                  Initialize a new standard medical file. This captures complete demographics, addresses with pincode auto-fill, emergency contacts, corporate insurance billing parameters, and biometric webcam attachments.
                </p>
              </div>
              <div>
                <button type="button" class="btn btn-primary" onclick="openDemographicsFormWithCarryforward()" style="font-weight: 700; padding: 0.75rem 2rem; font-size: 1rem; display: flex; align-items: center; gap: 0.5rem; box-shadow: var(--shadow-md);">
                  <span>✍️</span> Register New Patient
                </button>
              </div>
            </div>
          ` : `
            <div class="card">
              <div class="card-header" style="display: flex; justify-content: space-between; align-items: center;">
                <div>
                  <h3 class="card-title">Detailed Demographic & Insurance Entry</h3>
                  <p class="card-subtitle">Complete all sections to generate standard medical file & UHID</p>
                </div>
                <button class="btn btn-sm btn-secondary" onclick="resetRegFormCTA()" style="font-size: 0.75rem;">Collapse Form</button>
              </div>
              <div class="card-body" style="padding: 1.5rem;">
                <div class="inner-form-tabs">
                  <button type="button" class="inner-tab-btn active" onclick="switchInnerFormTab('inner-demo')">1. Patient Info & ID</button>
                  <button type="button" class="inner-tab-btn" onclick="switchInnerFormTab('inner-address')">2. Address & Emergency</button>
                  <button type="button" class="inner-tab-btn" onclick="switchInnerFormTab('inner-payer')">3. Payer Sponsor Details</button>
                  <button type="button" class="inner-tab-btn" onclick="switchInnerFormTab('inner-clinical')">4. Clinical & Referrals</button>
                  <button type="button" class="inner-tab-btn" onclick="switchInnerFormTab('inner-consent')">5. Attachments & Consents</button>
                </div>

                <form id="patient-registration-form" onsubmit="submitRegistrationForm(event)">
                <!-- Tab 1: Patient Info & ID -->
                <div id="inner-demo" class="inner-tab-content active">
                  <h5 style="color:var(--primary); font-weight:700; border-bottom:1px solid var(--border-color); padding-bottom:0.25rem; margin-top:0; margin-bottom:1rem;">Patient Information</h5>
                  <div class="grid-3">
                    <div class="form-group">
                      <label class="form-label">Title <span>*</span></label>
                      <select id="reg-title" class="form-select" required>
                        <option value="Mr.">Mr.</option>
                        <option value="Mrs.">Mrs.</option>
                        <option value="Ms.">Ms.</option>
                        <option value="Dr.">Dr.</option>
                        <option value="Baby Of">Baby Of</option>
                      </select>
                    </div>
                    <div class="form-group">
                      <label class="form-label">First Name <span>*</span></label>
                      <input type="text" id="reg-first-name" class="form-control" required placeholder="Vijay">
                    </div>
                    <div class="form-group">
                      <label class="form-label">Last Name <span>*</span></label>
                      <input type="text" id="reg-last-name" class="form-control" required placeholder="Kumar">
                    </div>
                  </div>

                  <div class="grid-3" style="margin-top: 1rem;">
                    <div class="form-group">
                      <label class="form-label">Gender <span>*</span></label>
                      <select id="reg-gender" class="form-select" required>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div class="form-group">
                      <label class="form-label">Date of Birth <span>*</span></label>
                      <input type="date" id="reg-dob" class="form-control" onchange="handleRegDOBChange()" required>
                    </div>
                    <div class="form-group">
                      <label class="form-label">Age (Years) <span>*</span></label>
                      <input type="number" id="reg-age" class="form-control" placeholder="36" min="0" max="120" oninput="handleRegAgeChange()" required>
                    </div>
                  </div>

                  <div class="grid-3" style="margin-top: 1rem;">
                    <div class="form-group">
                      <label class="form-label">Mobile Number <span>*</span></label>
                      <input type="tel" id="reg-mobile" class="form-control" placeholder="9876543210" maxlength="10" required>
                    </div>
                    <div class="form-group">
                      <label class="form-label">Religion</label>
                      <select id="reg-religion" class="form-select">
                        <option value="Hinduism">Hinduism</option>
                        <option value="Islam">Islam</option>
                        <option value="Christianity">Christianity</option>
                        <option value="Sikhism">Sikhism</option>
                        <option value="Buddhism">Buddhism</option>
                        <option value="Jainism">Jainism</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div class="form-group">
                      <label class="form-label">Occupation</label>
                      <input type="text" id="reg-occupation" class="form-control" placeholder="e.g. Software Engineer">
                    </div>
                  </div>

                  <div class="grid-3" style="margin-top: 1rem;">
                    <div class="form-group">
                      <label class="form-label">VIP / Service Status</label>
                      <select id="reg-patient-category" class="form-select">
                        <option value="Regular">Regular</option>
                        <option value="VIP">VIP</option>
                        <option value="Ex-Servicemen">Ex-Servicemen</option>
                      </select>
                    </div>
                    <div class="form-group">
                      <label class="form-label">Preferred Consultant <span>*</span></label>
                      <select id="reg-consultant" class="form-select" required>
                        ${state.doctors.map(d => `<option value="${d.id}">${d.name} (${d.spec})</option>`).join('')}
                      </select>
                    </div>
                    <div class="form-group">
                      <label class="form-label">Blood Group</label>
                      <select id="reg-blood" class="form-select">
                        <option value="A+">A+</option>
                        <option value="A-">A-</option>
                        <option value="B+">B+</option>
                        <option value="B-">B-</option>
                        <option value="O+">O+</option>
                        <option value="O-">O-</option>
                        <option value="AB+">AB+</option>
                        <option value="AB-">AB-</option>
                      </select>
                    </div>
                  </div>

                  <div class="grid-3" style="margin-top: 1rem;">
                    <div class="form-group">
                      <label class="form-label">Preferred Language</label>
                      <input type="text" id="reg-language" class="form-control" value="Hindi">
                    </div>
                  </div>

                  <h5 style="color:var(--primary); font-weight:700; border-bottom:1px solid var(--border-color); padding-bottom:0.25rem; margin-top:1.5rem; margin-bottom:1rem;">Identification & ABDM Integration</h5>
                  <div class="grid-2">
                    <div class="form-group">
                      <label class="form-label">ABHA ID / Address Number</label>
                      <div style="display:flex; gap:0.5rem;">
                        <input type="text" id="reg-abha" class="form-control" placeholder="91-2000-3455-6789" value="91-2000-3455-6789">
                        <button type="button" class="btn btn-primary" onclick="triggerABHAVerification()">Verify ABHA</button>
                      </div>
                      <div id="abha-verification-status" style="margin-top:0.35rem;">
                        <span class="badge bg-warning" style="color:#000; padding:0.25rem 0.5rem; border-radius:4px; font-weight:700;">⚡ ABDM UNLINKED (OTP PENDING)</span>
                      </div>
                    </div>
                    <div class="grid-3">
                      <div class="form-group">
                        <label class="form-label">Nationality</label>
                        <input type="text" id="reg-nationality" class="form-control" value="Indian">
                      </div>
                      <div class="form-group">
                        <label class="form-label">Aadhaar Card Number (12 Digits)</label>
                        <input type="text" id="reg-aadhaar" class="form-control" placeholder="123456789012" maxlength="12">
                      </div>
                      <div class="form-group">
                        <label class="form-label">Passport Number (Optional)</label>
                        <input type="text" id="reg-passport" class="form-control" placeholder="Z9000001">
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Tab 2: Address & Emergency -->
                <div id="inner-address" class="inner-tab-content">
                  <div style="display:grid; grid-template-columns: 1.2fr 1fr; gap:1.5rem;">
                    <!-- Contact Details -->
                    <div>
                      <h5 style="color:var(--primary); font-weight:700; border-bottom:1px solid var(--border-color); padding-bottom:0.25rem; margin-top:0; margin-bottom:1rem;">Contact Details</h5>
                      <div class="form-group">
                        <label class="form-label">Email Address</label>
                        <input type="email" id="reg-email" class="form-control" placeholder="patient@saronilhms.com">
                      </div>
                      <div class="form-group">
                        <label class="form-label">Address Line <span>*</span></label>
                        <textarea id="reg-address" class="form-control" rows="2" placeholder="Flat No., Building Name, Street..."></textarea>
                      </div>
                      <div class="grid-3" style="margin-top:0.75rem;">
                        <div class="form-group">
                          <label class="form-label">Pincode <span>*</span></label>
                          <div style="display:flex; gap:0.25rem;">
                            <input type="text" id="reg-pincode" class="form-control" placeholder="560001">
                            <button type="button" class="btn btn-secondary" onclick="lookupPincode()" style="padding:0 0.5rem;">Fetch</button>
                          </div>
                          <small id="pincode-success-msg" style="display:block; margin-top:0.25rem; font-weight:bold; font-size:0.7rem;"></small>
                        </div>
                        <div class="form-group">
                          <label class="form-label">City <span>*</span></label>
                          <input type="text" id="reg-city" class="form-control" placeholder="Bengaluru">
                        </div>
                        <div class="form-group">
                          <label class="form-label">State <span>*</span></label>
                          <input type="text" id="reg-state" class="form-control" placeholder="Karnataka">
                        </div>
                      </div>
                    </div>

                    <!-- Emergency Contact -->
                    <div>
                      <h5 style="color:var(--primary); font-weight:700; border-bottom:1px solid var(--border-color); padding-bottom:0.25rem; margin-top:0; margin-bottom:1rem;">Emergency Contact</h5>
                      <div class="form-group">
                        <label class="form-label">Contact Name <span>*</span></label>
                        <input type="text" id="reg-emerg-name" class="form-control" placeholder="Sanjay Kumar">
                      </div>
                      <div class="form-group" style="margin-top:0.75rem;">
                        <label class="form-label">Relationship <span>*</span></label>
                        <select id="reg-emerg-relation" class="form-select">
                          <option value="Spouse">Spouse</option>
                          <option value="Parent">Parent</option>
                          <option value="Child">Child</option>
                          <option value="Sibling">Sibling</option>
                          <option value="Guardian">Guardian / Other</option>
                        </select>
                      </div>
                      <div class="form-group" style="margin-top:0.75rem;">
                        <label class="form-label">Mobile Number <span>*</span></label>
                        <input type="tel" id="reg-emerg-phone" class="form-control" placeholder="9876543210" maxlength="10">
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Tab 3: Payer Sponsor Details -->
                <div id="inner-payer" class="inner-tab-content">
                  <h5 style="color:var(--primary); font-weight:700; border-bottom:1px solid var(--border-color); padding-bottom:0.25rem; margin-top:0; margin-bottom:1rem;">Payer Sponsor Settings</h5>
                  <div class="form-group" style="max-width: 400px; margin-bottom: 1.5rem;">
                    <label class="form-label">Payer Type <span>*</span></label>
                    <select id="reg-payer-type" class="form-select" required onchange="togglePayerTPAFields()">
                      <option value="Self Pay">Self Pay</option>
                      <option value="Insurance">Insurance</option>
                      <option value="Corporate">Corporate</option>
                    </select>
                  </div>

                  <!-- Insurance details (toggled dynamically) -->
                  <div id="payer-insurance-section" style="display:none; margin-top: 1rem; background: var(--bg-surface-elevated); padding: 1.25rem; border-radius: 8px; border: 1px solid var(--border-color);">
                    <h5 style="color:var(--primary); font-weight:700; border-bottom:1px solid var(--border-color); padding-bottom:0.25rem; margin-bottom:1rem; margin-top:0;">Insurance Details</h5>
                    <div class="grid-3">
                      <div class="form-group">
                        <label class="form-label">Insurance Company <span>*</span></label>
                        <select id="reg-insurance-company" class="form-select">
                          <option value="STAR HEALTH">STAR HEALTH AND ALLIED INSURANCE</option>
                          <option value="NIVA BUPA">NIVA BUPA HEALTH INSURANCE</option>
                          <option value="ICICI LOMBARD">ICICI LOMBARD GENERAL INSURANCE</option>
                          <option value="CGHS">CGHS PATNA (Govt Scheme)</option>
                        </select>
                      </div>
                      <div class="form-group">
                        <label class="form-label">Policy Number <span>*</span></label>
                        <input type="text" id="reg-policy-number" class="form-control" placeholder="POL100011">
                      </div>
                      <div class="form-group">
                        <label class="form-label">Member ID <span>*</span></label>
                        <input type="text" id="reg-member-id" class="form-control" placeholder="MEM90022">
                      </div>
                    </div>
                  </div>

                  <!-- Corporate details (toggled dynamically) -->
                  <div id="payer-corporate-section" style="display:none; margin-top: 1rem; background: var(--bg-surface-elevated); padding: 1.25rem; border-radius: 8px; border: 1px solid var(--border-color);">
                    <h5 style="color:var(--primary); font-weight:700; border-bottom:1px solid var(--border-color); padding-bottom:0.25rem; margin-bottom:1rem; margin-top:0;">Corporate Details</h5>
                    <div class="grid-2">
                      <div class="form-group">
                        <label class="form-label">Company Name <span>*</span></label>
                        <input type="text" id="reg-corporate-name" class="form-control" placeholder="e.g. Google India Pvt Ltd">
                      </div>
                      <div class="form-group">
                        <label class="form-label">Employee ID <span>*</span></label>
                        <input type="text" id="reg-employee-id" class="form-control" placeholder="EMP45678">
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Tab 4: Clinical & Referrals -->
                <div id="inner-clinical" class="inner-tab-content">
                  <div style="display:grid; grid-template-columns: 1fr 1fr; gap:1.5rem;">
                    <!-- Clinical Alerts -->
                    <div>
                      <h5 style="color:var(--primary); font-weight:700; border-bottom:1px solid var(--border-color); padding-bottom:0.25rem; margin-top:0; margin-bottom:1rem;">Clinical Alerts</h5>
                      <div class="form-group">
                        <label class="form-label">Drug Allergy</label>
                        <input type="text" id="reg-drug-allergy" class="form-control" placeholder="e.g. Penicillin, Sulfa, None">
                      </div>
                      <div class="form-group">
                        <label class="form-label">Food Allergy</label>
                        <input type="text" id="reg-food-allergy" class="form-control" placeholder="e.g. Peanuts, Gluten, None">
                      </div>
                      <div class="form-group">
                        <label class="form-label">Special Notes</label>
                        <textarea id="reg-special-notes" class="form-control" rows="3" placeholder="Enter clinical warnings, behavior alerts, or mobility needs..."></textarea>
                      </div>
                    </div>

                    <!-- Referrals -->
                    <div>
                      <h5 style="color:var(--primary); font-weight:700; border-bottom:1px solid var(--border-color); padding-bottom:0.25rem; margin-top:0; margin-bottom:1rem;">Referred by</h5>
                      <div class="form-group">
                        <label class="form-label">Doctor Name</label>
                        <input type="text" id="reg-referred-doctor" class="form-control" placeholder="Dr. Ananya Sen">
                      </div>
                      <div class="form-group">
                        <label class="form-label">Clinic or Hospital</label>
                        <input type="text" id="reg-referred-facility" class="form-control" placeholder="e.g. Metro Clinic, St. Johns Hospital">
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Tab 5: Attachments & Consents -->
                <div id="inner-consent" class="inner-tab-content">
                  <div style="display:grid; grid-template-columns: 1fr 1fr; gap:1.5rem;">
                    <!-- Attachments -->
                    <div>
                      <h5 style="color:var(--primary); font-weight:700; border-bottom:1px solid var(--border-color); padding-bottom:0.25rem; margin-top:0; margin-bottom:1rem;">Attachments & Documents</h5>
                      
                      <!-- Patient Photo -->
                      <div style="margin-bottom:1.25rem;">
                        <label class="form-label" style="font-weight:700;">Patient Photo <span>*</span></label>
                        <div style="display:flex; gap:1rem; align-items:center;">
                          <div id="webcam-photo-preview" style="width:85px; height:85px; background:var(--bg-surface-elevated); border:1px solid var(--border-color); border-radius:8px; display:flex; align-items:center; justify-content:center; font-size:1.5rem; overflow:hidden;">
                            👤
                          </div>
                          <div>
                            <button type="button" class="btn btn-sm btn-secondary" onclick="triggerWebcamSim()" style="margin-bottom:0.35rem;">📸 Capture Webcam</button>
                            <input type="file" id="reg-photo-file" class="form-control" style="font-size:0.75rem; padding:0.25rem;" accept="image/*">
                          </div>
                        </div>
                      </div>

                      <!-- ID Proof -->
                      <div style="margin-bottom:1.25rem;">
                        <label class="form-label" style="font-weight:700;">ID Proof <span>*</span></label>
                        <div style="display:flex; gap:0.5rem; align-items:center;">
                          <button type="button" class="btn btn-sm btn-outline" onclick="triggerDocUploadSim('ID Proof')">📄 Scan Aadhaar / Passport</button>
                          <input type="file" id="reg-id-proof" class="form-control" style="font-size:0.75rem; padding:0.25rem; flex:1;">
                        </div>
                        <div id="id-proof-status" style="margin-top:0.35rem; font-size:0.75rem; color:var(--text-muted);">Status: No file uploaded</div>
                      </div>

                      <!-- Insurance Card -->
                      <div style="margin-bottom:1.25rem;">
                        <label class="form-label">Insurance Card</label>
                        <div style="display:flex; gap:0.5rem; align-items:center;">
                          <button type="button" class="btn btn-sm btn-outline" onclick="triggerDocUploadSim('Insurance Card')">💳 Scan Insurance Card</button>
                          <input type="file" id="reg-insurance-card" class="form-control" style="font-size:0.75rem; padding:0.25rem; flex:1;">
                        </div>
                        <div id="insurance-card-status" style="margin-top:0.35rem; font-size:0.75rem; color:var(--text-muted);">Status: No file uploaded</div>
                      </div>
                    </div>

                    <!-- Consents -->
                    <div>
                      <h5 style="color:var(--primary); font-weight:700; border-bottom:1px solid var(--border-color); padding-bottom:0.25rem; margin-top:0; margin-bottom:1rem;">Regulatory Consents</h5>
                      
                      <div class="form-group" style="background:var(--bg-surface-elevated); padding:1rem; border-radius:8px; border:1px solid var(--border-color); display:flex; flex-direction:column; gap:0.75rem;">
                        <label style="display:flex; gap:0.5rem; font-size:0.8rem; cursor:pointer; font-weight:500; align-items:flex-start;">
                          <input type="checkbox" id="reg-consent-registration" required style="margin-top:0.2rem;">
                          <span><strong>Registration Consent <span>*</span></strong><br><span style="font-size:0.75rem; color:var(--text-muted);">I consent to registration and authorize opening of standard medical record.</span></span>
                        </label>
                        
                        <label style="display:flex; gap:0.5rem; font-size:0.8rem; cursor:pointer; font-weight:500; align-items:flex-start; margin-top:0.5rem; border-top:1px solid var(--border-color); padding-top:0.75rem;">
                          <input type="checkbox" id="reg-consent-privacy" required style="margin-top:0.2rem;">
                          <span><strong>Privacy Consent <span>*</span></strong><br><span style="font-size:0.75rem; color:var(--text-muted);">I agree to the privacy policy for personal and health data processing under DPDPA.</span></span>
                        </label>

                        <label style="display:flex; gap:0.5rem; font-size:0.8rem; cursor:pointer; font-weight:500; align-items:flex-start; margin-top:0.5rem; border-top:1px solid var(--border-color); padding-top:0.75rem;">
                          <input type="checkbox" id="reg-consent-abdm" style="margin-top:0.2rem;">
                          <span><strong>ABDM Link Consent (Optional)</strong><br><span style="font-size:0.75rem; color:var(--text-muted);">I authorize linking Saronil EMR reports to ABDM via my ABHA ID.</span></span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Actions -->
                <div id="inner-form-actions" style="display: flex; gap: 1rem; justify-content: space-between; padding-top: 1.5rem; border-top: 1px solid var(--border-color); margin-top: 1.5rem;">
                  <!-- Dynamic actions will be rendered here -->
                </div>
              </form>
            </div>
          </div>
          `}
        </div>

        <!-- Tab Panel 3: Fast-Track -->
        <div id="panel-fast" class="reg-tab-panel ${window.activeRegTab === 'fast' ? 'active' : ''}">
          <div class="card" style="border-color: var(--color-danger);">
            <div class="card-header" style="background-color: var(--color-danger-bg); border-bottom: 1px solid var(--border-color);">
              <div>
                <h3 class="card-title" style="color: var(--color-danger); margin: 0;">⚡ Emergency Fast-Track Registration</h3>
                <p class="card-subtitle" style="color: var(--color-danger); margin: 0.25rem 0 0 0;">Generates temporary UHID instantly for trauma care admission.</p>
              </div>
            </div>
            <div class="card-body" style="padding: 1.5rem;">
              <form id="emergency-fast-form" onsubmit="submitEmergencyFastTrack(event)">
                <div class="grid-3">
                  <div class="form-group">
                    <label class="form-label">Patient Name (Use Alias if unidentified) <span>*</span></label>
                    <input type="text" id="emerg-name" class="form-control" required placeholder="e.g. Unknown Patient A" value="Unknown Male Trau-A">
                  </div>
                  <div class="form-group">
                    <label class="form-label">Gender <span>*</span></label>
                    <select id="emerg-gender" class="form-select" required>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div class="form-group">
                    <label class="form-label">Approximate Age <span>*</span></label>
                    <input type="number" id="emerg-age" class="form-control" required placeholder="e.g. 40" value="40">
                  </div>
                </div>
                <div class="grid-3" style="margin-top: 1rem;">
                  <div class="form-group">
                    <label class="form-label">Accompanying Person Phone</label>
                    <input type="tel" id="emerg-phone" class="form-control" placeholder="9999911111" value="9999911111">
                  </div>
                  <div class="form-group">
                    <label class="form-label">Emergency consultant <span>*</span></label>
                    <select id="emerg-consultant" class="form-select" required>
                      ${state.doctors.map(d => `<option value="${d.id}">${d.name} (${d.spec})</option>`).join('')}
                    </select>
                  </div>
                  <div class="form-group">
                    <label class="form-label">Assign Ward category <span>*</span></label>
                    <select id="emerg-ward" class="form-select" required>
                      <option value="EMERGENCY">Emergency Trauma Ward</option>
                      <option value="CCU">Critical Care Unit (CCU)</option>
                    </select>
                  </div>
                </div>
                <div style="display: flex; gap: 1rem; justify-content: flex-end; padding-top: 1.5rem; border-top: 1px solid var(--border-color); margin-top: 1.5rem;">
                  <button type="button" class="btn btn-secondary" onclick="exitRegistrationFlow()">Cancel</button>
                  <button type="submit" class="btn btn-danger" id="emerg-submit-btn">Admit Traumatic Patient</button>
                </div>
              </form>
            </div>
          </div>
        </div>

        <!-- Tab Panel 4: Stickers -->
        <div id="panel-stickers" class="reg-tab-panel ${window.activeRegTab === 'stickers' ? 'active' : ''}">
          <div class="card">
            <div class="card-header"><h3 class="card-title">Barcode Stickers & Wristband Terminal</h3></div>
            <div class="card-body" style="padding: 1.5rem;">
              <div style="display:grid; grid-template-columns: 1fr 2fr; gap:1.5rem; margin-bottom:1.5rem;">
                <div style="background:var(--bg-surface-elevated); padding:1rem; border-radius:8px; border:1px solid var(--border-color); display:flex; flex-direction:column; gap:1rem;">
                  <h5 style="color:var(--primary); font-weight:700; margin-top:0; border-bottom:1px solid var(--border-color); padding-bottom:0.25rem;">Sticker Configuration</h5>
                  <div class="form-group">
                    <label class="form-label">Select Registered Patient</label>
                    <select id="sticker-patient-select" class="form-select" onchange="updateStickerPreview()">
                      ${state.patients.map(p => `<option value="${p.uhid}">${p.name} (${p.uhid})</option>`).join('')}
                    </select>
                  </div>
                  <div class="form-group">
                    <label class="form-label">Thermal Printer Output</label>
                    <select id="sticker-printer-select" class="form-select">
                      <option value="Thermal Printer A">Wristband Printer A (IPD desk)</option>
                      <option value="Label Printer B">Label Printer B (OPD front desk)</option>
                      <option value="Lab Printer C">Specimen Printer C (Diagnostics)</option>
                    </select>
                  </div>
                  <div class="form-group">
                    <label class="form-label">Number of Copies</label>
                    <input type="number" id="sticker-copies" class="form-control" value="1" min="1" max="10">
                  </div>
                  <div id="print-status-box"></div>
                </div>
                <div>
                  <h5 style="color:var(--primary); font-weight:700; margin-top:0;">Interactive Sticker Layout Previews</h5>
                  <div class="sticker-grid">
                    <div class="sticker-card">
                      <div class="sticker-header"><span>IPD ADMISSION WRISTBAND</span><span>SARONIL HMS</span></div>
                      <div style="font-size:0.85rem; font-weight:700;" id="prev-wb-name">Ramesh Chandra</div>
                      <div style="font-size:0.75rem;" id="prev-wb-details">UHID20000001 | 42Y/M | B+</div>
                      <div class="sticker-barcode"></div>
                      <div class="sticker-footer"><span id="prev-wb-allergies">Allergies: PENICILLIN (CRITICAL)</span></div>
                      <button type="button" class="btn btn-sm btn-primary" onclick="printSticker('Wristband')" style="margin-top:0.5rem; font-size:0.75rem;">Print Wristband</button>
                    </div>
                    <div class="sticker-card">
                      <div class="sticker-header"><span>LIS SPECIMEN STICKER</span><span>LAB-SPECIMEN</span></div>
                      <div style="font-size:0.85rem; font-weight:700;" id="prev-lab-name">Ramesh Chandra</div>
                      <div style="font-size:0.75rem;" id="prev-lab-details">UHID: UHID20000001 | 42Y/M</div>
                      <div class="sticker-barcode"></div>
                      <div class="sticker-footer"><span>Sample: BLOOD VACUTAINER</span></div>
                      <button type="button" class="btn btn-sm btn-primary" onclick="printSticker('Laboratory Sticker')" style="margin-top:0.5rem; font-size:0.75rem;">Print Specimen Label</button>
                    </div>
                    <div class="sticker-card">
                      <div class="sticker-header"><span>PATIENT RECORD FILE</span><span>REGISTRATION CARD</span></div>
                      <div style="font-size:0.85rem; font-weight:700;" id="prev-reg-name">Ramesh Chandra</div>
                      <div style="font-size:0.75rem;" id="prev-reg-details">UHID: UHID20000001 | Star Health</div>
                      <div class="sticker-barcode"></div>
                      <div class="sticker-footer"><span>Date: 2026-06-17</span></div>
                      <button type="button" class="btn btn-sm btn-primary" onclick="printSticker('Registration Sticker')" style="margin-top:0.5rem; font-size:0.75rem;">Print File Label</button>
                    </div>
                  </div>
                </div>
              </div>
              <h5 style="color:var(--primary); font-weight:700;">Terminal Print Queue History</h5>
              <div class="custom-table-container">
                <table class="custom-table">
                  <thead>
                    <tr>
                      <th>Print Job ID</th>
                      <th>Patient Name</th>
                      <th>UHID</th>
                      <th>Sticker Type</th>
                      <th>Copies</th>
                      <th>Printer Name</th>
                      <th>Timestamp</th>
                    </tr>
                  </thead>
                  <tbody id="print-history-table-body">
                    <!-- Loaded dynamically -->
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <!-- Tab Panel 5: Queue -->
        <div id="panel-queue" class="reg-tab-panel ${window.activeRegTab === 'queue' ? 'active' : ''}">
          <div class="card">
            <div class="card-header" style="display:flex; justify-content:space-between; align-items:center;">
              <div>
                <h3 class="card-title">OPD Patient Check-In & Token Queue Board</h3>
                <p class="card-subtitle">Manage token appointments, waiting times, and patient callings</p>
              </div>
              <button type="button" class="btn btn-primary" onclick="triggerNewTokenDialog()">🎫 Issue New Queue Token</button>
            </div>
            <div class="card-body" style="padding:1.5rem;">
              <div class="custom-table-container">
                <table class="custom-table">
                  <thead>
                    <tr>
                      <th>Token Number</th>
                      <th>UHID</th>
                      <th>Patient Name</th>
                      <th>Consulting Department</th>
                      <th>Admitted Doctor</th>
                      <th>Check-In Time</th>
                      <th>Estimated Wait</th>
                      <th>Queue Status</th>
                      <th style="text-align: right;">Token Controls</th>
                    </tr>
                  </thead>
                  <tbody id="token-queue-table-body">
                    <!-- Loaded dynamically -->
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <!-- Tab Panel 6: Audit -->
        <div id="panel-audit" class="reg-tab-panel ${window.activeRegTab === 'audit' ? 'active' : ''}">
          <div class="card">
            <div class="card-header">
              <div>
                <h3 class="card-title">Workstation Action Audit Log (Compliance Trail)</h3>
                <p class="card-subtitle">Immutable log tracking overrides and operations</p>
              </div>
            </div>
            <div class="card-body" style="padding:1.5rem;">
              <div class="custom-table-container">
                <table class="custom-table">
                  <thead>
                    <tr>
                      <th>Timestamp</th>
                      <th>Operator Persona</th>
                      <th>Logged Action</th>
                      <th>Audit Details</th>
                    </tr>
                  </thead>
                  <tbody id="audit-logs-table-body">
                    <!-- Loaded dynamically -->
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      `;
    }
  }

  // Initialize UI components (now fully safe due to hoisted function declarations)
  switchRegRole(window.currentRegRole);
  renderBottomWorkspace();

  // Bind Standard functions globally to the window object so HTML handles triggers correctly
  window.switchRegTab = switchRegTab;
  window.switchRegRole = switchRegRole;
  window.performPatientSearch = performPatientSearch;
  window.filterRegistryToMatches = filterRegistryToMatches;
  window.filterRegistryByCard = filterRegistryByCard;
  window.togglePayerTPAFields = togglePayerTPAFields;
  window.handleRegDOBChange = handleRegDOBChange;
  window.handleRegAgeChange = handleRegAgeChange;
  window.lookupPincode = lookupPincode;
  window.triggerWebcamSim = triggerWebcamSim;
  window.triggerDocUploadSim = triggerDocUploadSim;
  window.triggerABHAVerification = triggerABHAVerification;
  window.closeABHAOTPModal = closeABHAOTPModal;
  window.verifyABHAOTP = verifyABHAOTP;
  window.submitRegistrationForm = submitRegistrationForm;
  window.closeDuplicateModal = closeDuplicateModal;
  window.cancelAndLinkDuplicate = cancelAndLinkDuplicate;
  window.bypassDuplicateCheck = bypassDuplicateCheck;
  window.submitEmergencyFastTrack = submitEmergencyFastTrack;
  window.selectPatientForWristband = selectPatientForWristband;
  window.updateStickerPreview = updateStickerPreview;
  window.printSticker = printSticker;
  window.changeTokenStatus = changeTokenStatus;
  window.switchInnerFormTab = switchInnerFormTab;
  window.triggerNewTokenDialog = triggerNewTokenDialog;
  window.closeTokenDialog = closeTokenDialog;
  window.updateTokenDoctorDropdown = updateTokenDoctorDropdown;
  window.issueNewQueueToken = issueNewQueueToken;
  window.startNewRegistrationFlow = startNewRegistrationFlow;
  window.exitRegistrationFlow = exitRegistrationFlow;
  window.openDemographicsFormWithCarryforward = openDemographicsFormWithCarryforward;
  window.resetRegFormCTA = resetRegFormCTA;
  window.showRegistrationSuccessModal = showRegistrationSuccessModal;
  window.handleSuccessModalAction = handleSuccessModalAction;
  window.closeSuccessRegistrationModal = closeSuccessRegistrationModal;
};
