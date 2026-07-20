/* ==========================================================================
   SARONIL HMS — STAFF & DOCTOR DETAIL PROFILE MODULE (staffProfileView.js)
   Renders a consolidated detail view modal triggered dynamically.
   ========================================================================== */

(function () {
  'use strict';

  function injectStyles() {
    if (document.getElementById('staff-profile-styles')) return;
    const s = document.createElement('style');
    s.id = 'staff-profile-styles';
    s.textContent = `
      .sp-backdrop {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(15, 23, 42, 0.6);
        backdrop-filter: blur(4px);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
        font-family: 'Inter', sans-serif;
      }
      .sp-modal {
        background: #ffffff;
        border-radius: 16px;
        width: 900px;
        max-width: 95vw;
        height: 650px;
        max-height: 90vh;
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
        display: flex;
        flex-direction: column;
        overflow: hidden;
        animation: sp-scale-in 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        text-align: left;
      }
      @keyframes sp-scale-in {
        from { transform: scale(0.95); opacity: 0; }
        to { transform: scale(1); opacity: 1; }
      }
      .sp-header {
        background: #0f172a;
        color: #ffffff;
        padding: 16px 24px;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .sp-header-title {
        margin: 0;
        font-size: 1.1rem;
        font-weight: 800;
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .sp-body {
        display: flex;
        flex: 1;
        height: calc(100% - 110px);
        overflow: hidden;
      }
      .sp-sidebar {
        width: 240px;
        border-right: 1px solid #e2e8f0;
        background: #f8fafc;
        padding: 20px;
        display: flex;
        flex-direction: column;
        gap: 16px;
        overflow-y: auto;
      }
      .sp-content {
        flex: 1;
        padding: 24px;
        overflow-y: auto;
        background: #ffffff;
      }
      .sp-avatar {
        width: 64px;
        height: 64px;
        border-radius: 9999px;
        background: #e2e8f0;
        color: #475569;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.5rem;
        font-weight: 800;
        margin: 0 auto;
        border: 2px solid #cbd5e1;
      }
      .sp-sidebar-info {
        text-align: center;
      }
      .sp-tab-list {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }
      .sp-tab-btn {
        background: transparent;
        border: none;
        text-align: left;
        padding: 8px 12px;
        font-size: 0.78rem;
        font-weight: 600;
        color: #475569;
        cursor: pointer;
        border-radius: 6px;
        transition: all 0.15s;
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .sp-tab-btn:hover {
        background: #f1f5f9;
        color: #0f172a;
      }
      .sp-tab-btn.active {
        background: #e2e8f0;
        color: #0f172a;
      }
      .sp-tab-btn.disabled {
        opacity: 0.4;
        cursor: not-allowed;
      }
      .sp-badge-green { background: #dcfce7; color: #166534; padding: 2px 8px; border-radius: 999px; font-size: 0.65rem; font-weight: 700; }
      .sp-badge-red { background: #fee2e2; color: #b91c1c; padding: 2px 8px; border-radius: 999px; font-size: 0.65rem; font-weight: 700; }
      .sp-badge-amber { background: #fef3c7; color: #b45309; padding: 2px 8px; border-radius: 999px; font-size: 0.65rem; font-weight: 700; }
      .sp-badge-blue { background: #dbeafe; color: #1d4ed8; padding: 2px 8px; border-radius: 999px; font-size: 0.65rem; font-weight: 700; }
      
      .sp-footer {
        background: #f8fafc;
        border-top: 1px solid #e2e8f0;
        padding: 12px 24px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 0.72rem;
      }
      .sp-form-label {
        font-weight: 700;
        color: #1e293b;
        font-size: 0.75rem;
        margin-bottom: 4px;
        display: block;
      }
      .sp-form-control {
        width: 100%;
        border: 1px solid #cbd5e1;
        border-radius: 6px;
        padding: 6px 10px;
        font-size: 0.75rem;
        color: #334155;
        background: #ffffff;
      }
      .sp-form-control:focus {
        border-color: #3b82f6;
        outline: none;
      }
      .sp-section-title {
        font-size: 0.85rem;
        font-weight: 800;
        color: #0f172a;
        border-bottom: 2px solid #e2e8f0;
        padding-bottom: 6px;
        margin-top: 0;
        margin-bottom: 12px;
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      .sp-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 12px;
      }
      .sp-form-view-text {
        padding: 6px 10px;
        font-size: 0.75rem;
        color: #0f172a;
        background: #f8fafc;
        border: 1px dashed #cbd5e1;
        border-radius: 6px;
        min-height: 31px;
        display: flex;
        align-items: center;
        font-weight: 500;
        box-sizing: border-box;
      }
    `;
    document.head.appendChild(s);
  }

  // Active state within modal session
  let activeStaffId = null;
  let activeTab = 'employment';
  let activePersona = 'Super Admin';
  window.profileEditMode = false;

  window.openStaffProfile = function (staffIdOrName) {
    injectStyles();
    
    // Look up staff list
    if (!window.state || !window.state.staffList || !window.state.staffList.some(s => s.id === 'DOC_AMIT')) {
      if (typeof window.initHospMgmtState === 'function') window.initHospMgmtState();
    }
    const list = window.state.staffList || [];
    
    // Attempt match by ID first, then case-insensitive name contains
    let staff = list.find(s => s.id === staffIdOrName);
    if (!staff && typeof staffIdOrName === 'string') {
      staff = list.find(s => s.name.toLowerCase().includes(staffIdOrName.toLowerCase()));
    }
    
    if (!staff) {
      alert(`Staff profile not found for: "${staffIdOrName}"`);
      return;
    }

    activeStaffId = staff.id;
    window.profileEditMode = false;
    
    // Check local storage for active viewing persona or initialize
    const storedPersona = localStorage.getItem('saronil_profile_view_persona');
    if (storedPersona) activePersona = storedPersona;

    // Reset tab if current active tab is restricted for new persona
    enforceTabAccessRestrictions();

    renderOverlay();
  };

  function enforceTabAccessRestrictions() {
    if (activePersona === 'Food Safety Officer' && activeTab !== 'health') {
      activeTab = 'health';
    } else if (activePersona === 'Department Head' && (activeTab === 'disciplinary' || activeTab === 'salary')) {
      activeTab = 'employment';
    } else if (activePersona === 'Credentialing Officer' && (activeTab === 'disciplinary' || activeTab === 'salary')) {
      activeTab = 'credentials';
    }
  }

  window.spSwitchTab = function (tab) {
    // Check if disabled/restricted
    if (isTabRestricted(tab)) return;
    activeTab = tab;
    renderOverlay();
  };

  window.spChangePersona = function (persona) {
    activePersona = persona;
    localStorage.setItem('saronil_profile_view_persona', persona);
    enforceTabAccessRestrictions();
    renderOverlay();
  };

  function isTabRestricted(tab) {
    if (activePersona === 'Food Safety Officer') {
      return tab !== 'health';
    }
    if (activePersona === 'Department Head') {
      return tab === 'disciplinary' || tab === 'salary';
    }
    if (activePersona === 'Credentialing Officer') {
      return tab === 'disciplinary' || tab === 'salary';
    }
    if (activePersona === 'Staff Member (Self)') {
      return tab === 'disciplinary';
    }
    return false;
  }

  window.spEnterEdit = function () {
    window.profileEditMode = true;
    renderOverlay();
  };

  window.spCancelEdit = function () {
    window.profileEditMode = false;
    renderOverlay();
  };

  window.spUploadSignature = function (input) {
    if (input.files && input.files[0]) {
      const reader = new FileReader();
      reader.onload = function (e) {
        const preview = document.getElementById('sp-signature-preview-img');
        if (preview) {
          preview.src = e.target.result;
        }
        window.spUploadedSignatureBase64 = e.target.result;
      };
      reader.readAsDataURL(input.files[0]);
    }
  };

  window.spSaveAll = async function () {
    const staff = window.state.staffList.find(s => s.id === activeStaffId);
    if (!staff) return;

    // Gather values from inputs (checking if they exist in DOM)
    const designation = document.getElementById('sp-edit-designation')?.value;
    const department = document.getElementById('sp-edit-department')?.value;
    const type = document.getElementById('sp-edit-type')?.value;
    const manager = document.getElementById('sp-edit-manager')?.value;
    const phone = document.getElementById('sp-edit-phone')?.value;
    const email = document.getElementById('sp-edit-email')?.value;
    const address = document.getElementById('sp-edit-address')?.value;
    const status = document.getElementById('sp-edit-status')?.value;
    const fee = document.getElementById('sp-edit-fee')?.value;

    const regNo = document.getElementById('sp-edit-regno')?.value;
    const regExpiry = document.getElementById('sp-edit-regexpiry')?.value;
    const credStatus = document.getElementById('sp-edit-credstatus')?.value;
    const otPrivs = document.getElementById('sp-priv-ot-checkbox')?.checked;

    const healthExpiry = document.getElementById('sp-edit-healthexpiry')?.value;
    const healthStatus = document.getElementById('sp-edit-healthstatus')?.value;

    // Validations
    if (email && !email.includes('@')) {
      alert('Please enter a valid email address.');
      return;
    }
    if (phone && phone.trim() !== "" && phone.length < 10) {
      alert('Please enter a valid phone number (minimum 10 digits).');
      return;
    }
    if (fee !== undefined && fee.trim() !== "" && (isNaN(fee) || Number(fee) < 0)) {
      alert('Please enter a valid consultation fee.');
      return;
    }

    // Apply updates
    if (designation !== undefined) staff.designation = designation;
    if (department !== undefined) staff.department = department;
    if (type !== undefined) staff.employmentType = type;
    if (manager !== undefined) staff.reportingTo = manager;
    if (phone !== undefined) staff.phone = phone;
    if (email !== undefined) staff.email = email;
    if (address !== undefined) staff.address = address;
    if (fee !== undefined) staff.consultationFee = Number(fee);
    
    if (window.spUploadedSignatureBase64) {
      staff.signatureImage = window.spUploadedSignatureBase64;
      window.spUploadedSignatureBase64 = null;
    }
    
    if (status !== undefined && status !== staff.status) {
      const oldStatus = staff.status;
      
      // Prompt for status change reason
      const reason = await customPrompt(`Please enter a reason for changing status from ${oldStatus} to ${status}:`);
      if (reason === null) return; // cancelled
      if (!reason.trim()) {
        alert('Reason is mandatory for status change.');
        return;
      }

      staff.status = status;
      if (!staff.statusHistory) staff.statusHistory = [];
      staff.statusHistory.unshift({
        date: new Date().toLocaleDateString('en-GB') + ' ' + new Date().toLocaleTimeString('en-IN', {hour: '2-digit', minute: '2-digit'}),
        status: status,
        reason: reason,
        user: activePersona
      });
    }

    if (regNo !== undefined) staff.registrationNo = regNo;
    if (regExpiry !== undefined) staff.regValidTill = regExpiry;
    if (credStatus !== undefined) staff.credentialStatus = credStatus;
    if (otPrivs !== undefined) staff.otPrivileges = otPrivs;

    if (staff.credentials) {
      const cred = staff.credentials.find(c => c.name.includes('Registration') || c.name.includes('Certificate') || c.name.includes('Medical'));
      if (cred) {
        if (regExpiry !== undefined) cred.expiryDate = regExpiry;
        if (credStatus !== undefined) cred.status = credStatus;
      }

      const healthCert = staff.credentials.find(c => c.name.includes('Fitness') || c.name.includes('Health') || c.name.includes('Medical'));
      if (healthCert) {
        if (healthExpiry !== undefined) healthCert.expiryDate = healthExpiry;
        if (healthStatus !== undefined) healthCert.status = healthStatus;
      }
    }

    // Save to localStorage
    localStorage.setItem('saronil_staffList', JSON.stringify(window.state.staffList));
    alert('✓ All staff details updated successfully.');

    // Exit edit mode
    window.profileEditMode = false;
    renderOverlay();
  };

  window.spEndorseLeave = function (lvId, approve) {
    const staff = window.state.staffList.find(s => s.id === activeStaffId);
    if (staff && staff.leaveRequests) {
      const req = staff.leaveRequests.find(r => r.id === lvId);
      if (req) {
        req.status = approve ? 'Approved' : 'Rejected';
        if (approve && staff.leaveBalances) {
          const typeMap = { 'Casual Leave': 'Casual', 'Sick Leave': 'Sick', 'Earned Leave': 'Earned' };
          const balKey = typeMap[req.type] || 'Casual';
          if (staff.leaveBalances[balKey] !== undefined) {
            staff.leaveBalances[balKey] = Math.max(0, staff.leaveBalances[balKey] - req.days);
          }
        }
        localStorage.setItem('saronil_staffList', JSON.stringify(window.state.staffList));
        alert(`Leave request ${approve ? 'Approved' : 'Rejected'}.`);
        renderOverlay();
      }
    }
  };

  window.spTogglePrivilege = function (privName, hasPriv) {
    const staff = window.state.staffList.find(s => s.id === activeStaffId);
    if (staff) {
      if (privName === 'OT') {
        staff.otPrivileges = hasPriv;
      }
      localStorage.setItem('saronil_staffList', JSON.stringify(window.state.staffList));
      window.prShowToast && window.prShowToast('Privilege status updated.');
    }
  };

  window.spUpdateHealthCert = async function () {
    const expiry = document.getElementById('sp-edit-healthexpiry').value;
    const status = document.getElementById('sp-edit-healthstatus').value;

    const staff = window.state.staffList.find(s => s.id === activeStaffId);
    if (staff) {
      staff.regValidTill = expiry;
      staff.credentialStatus = status;

      const cert = (staff.credentials || []).find(c => c.name.includes('Fitness') || c.name.includes('Health') || c.name.includes('Medical'));
      if (cert) {
        cert.expiryDate = expiry;
        cert.status = status;
      }

      localStorage.setItem('saronil_staffList', JSON.stringify(window.state.staffList));
      await customAlert('✓ Health certificate validation status updated.');
      renderOverlay();
      
      if (window.location.hash === '#pantryKitchen' && typeof window.views.pantryKitchen === 'function') {
        window.views.pantryKitchen(document.getElementById('main-content'));
      }
    }
  };

  window.closeStaffProfile = function () {
    window.location.hash = '#hospMgmt?tab=staff';
  };

  function renderOverlay() {
    const mainContent = document.getElementById('main-content');
    if (!mainContent) return;

    const staff = window.state.staffList.find(s => s.id === activeStaffId);
    if (!staff) return;

    const initials = staff.name.replace('Dr. ', '').split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    
    let dpdpSummary = '';
    if (activePersona === 'Food Safety Officer') {
      dpdpSummary = '🔒 DPDP Gate: Limited view. Only Food Handler Health status is visible.';
    } else {
      dpdpSummary = `✓ Viewing profile as ${activePersona}. Actions logged for compliance.`;
    }

    const sections = [
      { id: 'employment', label: '💼 Employment Core Details', renderer: renderEmploymentTab },
      { id: 'credentials', label: '📜 Credentialing & Registration Records', renderer: renderCredentialsTab },
      { id: 'health', label: '🩺 Health & Food Safety Compliance', renderer: renderHealthTab },
      { id: 'access', label: '🔑 System Role & Module Access Privileges', renderer: renderAccessTab },
      { id: 'roster', label: '📅 Attendance, Shift Roster & Leave Balances', renderer: renderRosterTab },
      { id: 'training', label: '📚 Training Compliance & CME Credits', renderer: renderTrainingTab },
      { id: 'performance', label: '📈 Clinical Workload & Incidents Performance', renderer: renderPerformanceTab },
      { id: 'disciplinary', label: '⚠ Disciplinary Log & Confidential Records', renderer: renderDisciplinaryTab }
    ];

    mainContent.innerHTML = `
      <div class="rep-center flex flex-col gap-6 w-full" style="padding: 1.5rem; font-family: 'Inter', sans-serif;">
        <!-- Top Toolbar Header -->
        <div class="card mb-2" style="border: 1px solid #e2e8f0; border-radius: 12px; background: #fff; overflow: hidden;">
          <div class="card-body flex justify-between items-center flex-wrap gap-4" style="padding: 1rem 1.25rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap;">
            <div class="flex items-center gap-4" style="display: flex; align-items: center; gap: 1rem;">
              <button class="btn btn-outline btn-sm text-xs flex items-center gap-1" onclick="window.closeStaffProfile()" style="cursor: pointer; padding: 6px 12px; border: 1px solid #cbd5e1; border-radius: 6px; background:#fff; font-weight: 600; font-size: 0.75rem;">
                ← Back to Staff Register
              </button>
              <h2 class="text-base font-bold m-0 text-slate-800" style="margin: 0; font-size: 1.1rem; color: #1e293b;">👤 Staff &amp; Clinician Profile Registry</h2>
            </div>
            <div class="flex items-center gap-3" style="display: flex; align-items: center; gap: 0.75rem;">
              <label class="text-xs font-semibold text-slate-500" style="font-size: 0.75rem; color: #64748b; font-weight: 600;">Simulate Access Role:</label>
              <select id="sp-simulate-persona" class="form-select text-xs py-1 px-2" style="width:160px; background:#f8fafc; border: 1px solid #cbd5e1; padding: 4px 6px; border-radius: 6px; font-size: 0.75rem;" onchange="window.spChangePersona(this.value)">
                ${['Super Admin', 'HR Administrator', 'Department Head', 'Credentialing Officer', 'Food Safety Officer', 'Staff Member (Self)'].map(p => 
                  `<option value="${p}" ${p === activePersona ? 'selected' : ''}>${p}</option>`
                ).join('')}
              </select>
              
              <!-- Mode Toggle Buttons -->
              ${window.profileEditMode ? `
                <button class="btn btn-outline btn-sm text-xs" onclick="window.spCancelEdit()" style="cursor: pointer; padding: 6px 12px; border: 1px solid #cbd5e1; border-radius: 6px; background:#fff; font-weight: 600; font-size: 0.75rem; color: #475569;">
                  Cancel
                </button>
                <button class="btn btn-primary btn-sm text-xs" onclick="window.spSaveAll()" style="cursor: pointer; padding: 6px 12px; border: none; border-radius: 6px; background:#2563eb; color:#fff; font-weight: 600; font-size: 0.75rem;">
                  Save Changes
                </button>
              ` : `
                <button class="btn btn-primary btn-sm text-xs" onclick="window.spEnterEdit()" style="cursor: pointer; padding: 6px 12px; border: none; border-radius: 6px; background:#2563eb; color:#fff; font-weight: 600; font-size: 0.75rem;">
                  📝 Edit Profile
                </button>
              `}
            </div>
          </div>
        </div>

        <!-- Staff Summary Header Card -->
        <div class="card bg-white" style="padding: 1.5rem; border: 1px solid #e2e8f0; border-radius: 12px; background: #fff;">
          <div class="flex items-center gap-4" style="display: flex; align-items: center; gap: 1rem;">
            <div class="sp-avatar" style="margin: 0; width: 56px; height: 56px; font-size: 1.25rem; display: flex; align-items: center; justify-content: center; background: #e2e8f0; border-radius: 50%; color: #475569; font-weight: bold; border: 2px solid #cbd5e1;">${initials}</div>
            <div>
              <h3 class="text-lg font-bold text-slate-800 m-0" style="margin: 0; font-size: 1.15rem; color: #1e293b;">${staff.name}</h3>
              <p class="text-xs text-slate-500 m-0 mt-1 uppercase font-semibold" style="margin: 4px 0 0 0; font-size: 0.72rem; color: #64748b;">${staff.designation} &nbsp;|&nbsp; Department: ${staff.department} &nbsp;|&nbsp; ID: ${staff.id}</p>
            </div>
            <div style="margin-left: auto;">
              <span class="${staff.status === 'Active' ? 'sp-badge-green' : (staff.status === 'Suspended' ? 'sp-badge-red' : 'sp-badge-amber')}" style="padding: 4px 12px; font-size: 0.72rem; border-radius: 999px; font-weight: bold;">
                Status: ${staff.statusToday || staff.status}
              </span>
            </div>
          </div>
          <div style="margin-top: 1rem; border-top: 1px solid #f1f5f9; padding-top: 0.75rem; font-size: 0.72rem; display: flex; justify-content: space-between; align-items: center;">
            <span style="font-weight: 700; color: ${dpdpSummary.includes('Gate') ? '#ef4444' : '#64748b'};">${dpdpSummary}</span>
            <span style="color: #94a3b8; font-weight: 600;">Saronil HIS Compliance Engine</span>
          </div>
        </div>

        <!-- Stacked Scrollable Sections -->
        <div class="flex flex-col gap-6" style="display: flex; flex-direction: column; gap: 1.5rem;">
          ${sections.map(sec => {
            const restricted = isTabRestricted(sec.id);
            return `
              <div class="card bg-white" id="sec-${sec.id}" style="border: 1px solid #e2e8f0; border-radius: 12px; background: #fff; overflow: hidden;">
                <div class="card-header bg-slate-50" style="padding: 0.75rem 1.25rem; border-bottom: 1px solid #e2e8f0; background: #f8fafc;">
                  <h4 class="text-xs font-bold text-slate-700 m-0 uppercase tracking-wider" style="margin: 0; font-size: 0.75rem; color: #475569;">${sec.label}</h4>
                </div>
                <div class="card-body" style="padding: 1.25rem;">
                  ${restricted ? `
                    <div style="padding: 20px; text-align: center; color: #ef4444; background: #fef2f2; border: 1px solid #fca5a5; border-radius: 8px; font-size: 0.75rem;">
                      🔒 Access Blocked: DPDP Act Privacy constraint for simulated role (${activePersona}).
                    </div>
                  ` : sec.renderer(staff)}
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }

  function renderEmploymentTab(staff) {
    const isHR = activePersona === 'HR Administrator' || activePersona === 'Super Admin';
    const isSelf = activePersona === 'Staff Member (Self)';
    const isDoc = staff.type === 'Doctor' || (staff.id && staff.id.startsWith('DOC_'));
    
    // Dynamic fallback signature SVG if no file has been uploaded
    const signatureSrc = staff.signatureImage || '';
    const fallbackSvg = `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='220' height='60' viewBox='0 0 220 60'><text x='15' y='38' font-family='cursive, Dancing Script, Arial' font-size='24' font-style='italic' fill='%231e293b'>${staff.name}</text></svg>`;

    if (!window.profileEditMode) {
      return `
        <div>
          <div class="sp-section-title">Core Employment Registry</div>
          <div class="sp-grid">
            <div>
              <label class="sp-form-label">Full Name</label>
              <div class="sp-form-view-text">${staff.name}</div>
            </div>
            <div>
              <label class="sp-form-label">Designation</label>
              <div class="sp-form-view-text">${staff.designation}</div>
            </div>
            <div>
              <label class="sp-form-label">Department / Unit</label>
              <div class="sp-form-view-text">${staff.department}</div>
            </div>
            <div>
              <label class="sp-form-label">Employment Type</label>
              <div class="sp-form-view-text">${staff.employmentType}</div>
            </div>
            <div>
              <label class="sp-form-label">Reporting Manager</label>
              <div class="sp-form-view-text">${staff.reportingTo || 'Medical Superintendent'}</div>
            </div>
            <div>
              <label class="sp-form-label">Date of Joining</label>
              <div class="sp-form-view-text">${staff.joiningDate || '2023-01-10'}</div>
            </div>
            ${isDoc ? `
            <div>
              <label class="sp-form-label">Doctor Consultation Fee (₹)</label>
              <div class="sp-form-view-text">₹${staff.consultationFee || 500}</div>
            </div>
            ` : ''}
          </div>

          <div class="sp-section-title" style="margin-top:20px;">Verification Signature Record</div>
          <div class="sp-grid">
            <div class="col-span-2" style="grid-column: span 2;">
              <label class="sp-form-label">Verified Digital Signature Image</label>
              <div style="padding: 12px; border: 1px solid #e2e8f0; border-radius: 8px; background: #fafafa; display: inline-block;">
                <img src="${signatureSrc}" style="max-height: 50px; display: block;" onerror="this.onerror=null; this.src=\`${fallbackSvg}\`"/>
              </div>
            </div>
          </div>

          <div class="sp-section-title" style="margin-top:20px;">Contact &amp; Personal Info</div>
          <div class="sp-grid">
            <div>
              <label class="sp-form-label">Phone Number</label>
              <div class="sp-form-view-text">${staff.phone || '—'}</div>
            </div>
            <div>
              <label class="sp-form-label">Email Address</label>
              <div class="sp-form-view-text">${staff.email || '—'}</div>
            </div>
            <div class="col-span-2" style="grid-column: span 2;">
              <label class="sp-form-label">Residential Address</label>
              <div class="sp-form-view-text">${staff.address || '—'}</div>
            </div>
            <div>
              <label class="sp-form-label">DOB</label>
              <div class="sp-form-view-text">${staff.dob || '—'}</div>
            </div>
            <div>
              <label class="sp-form-label">Emergency Contact Name</label>
              <div class="sp-form-view-text">${staff.emergencyName || '—'}</div>
            </div>
            <div>
              <label class="sp-form-label">Emergency Phone</label>
              <div class="sp-form-view-text">${staff.emergencyPhone || '—'}</div>
            </div>
            <div>
              <label class="sp-form-label">Blood Group</label>
              <div class="sp-form-view-text">${staff.bloodGroup || '—'}</div>
            </div>
          </div>

          <div class="sp-section-title" style="margin-top:20px;">Employment Status Log</div>
          <table class="custom-table" style="font-size:0.7rem; width:100%;">
            <thead>
              <tr><th>Timestamp</th><th>Status</th><th>Reason</th><th>By User</th></tr>
            </thead>
            <tbody>
              ${(staff.statusHistory || []).map(h => `
                <tr>
                  <td>${h.date}</td>
                  <td><span class="${h.status === 'Active' ? 'sp-badge-green' : 'sp-badge-red'}">${h.status}</span></td>
                  <td>${h.reason}</td>
                  <td>${h.user}</td>
                </tr>
              `).join('') || '<tr><td colspan="4" style="text-align:center; color:#94a3b8;">No status history entries.</td></tr>'}
            </tbody>
          </table>
        </div>
      `;
    }

    return `
      <div>
        <div class="sp-section-title">
          <span>Core Employment Registry (Edit Mode)</span>
        </div>
        
        <div class="sp-grid">
          <div>
            <label class="sp-form-label">Full Name</label>
            <input type="text" class="sp-form-control" value="${staff.name}" disabled style="background:#f1f5f9; cursor:not-allowed;">
          </div>
          <div>
            <label class="sp-form-label">Designation (Suggestive Search)</label>
            <input type="text" id="sp-edit-designation" class="sp-form-control" value="${staff.designation}" list="sp-designation-suggestions" ${isHR ? '' : 'disabled style="background:#f1f5f9; cursor:not-allowed;"'}>
          </div>
          <div>
            <label class="sp-form-label">Department / Unit (Suggestive Search)</label>
            <input type="text" id="sp-edit-department" class="sp-form-control" value="${staff.department}" list="sp-department-suggestions" ${isHR ? '' : 'disabled style="background:#f1f5f9; cursor:not-allowed;"'}>
          </div>
          <div>
            <label class="sp-form-label">Employment Type</label>
            <select id="sp-edit-type" class="sp-form-control" ${isHR ? '' : 'disabled style="background:#f1f5f9; cursor:not-allowed;"'}>
              <option ${staff.employmentType === 'Permanent' ? 'selected' : ''}>Permanent</option>
              <option ${staff.employmentType === 'Visiting Consultant' ? 'selected' : ''}>Visiting Consultant</option>
              <option ${staff.employmentType === 'Contract' ? 'selected' : ''}>Contract</option>
              <option ${staff.employmentType === 'Resident' ? 'selected' : ''}>Resident</option>
            </select>
          </div>
          <div>
            <label class="sp-form-label">Reporting Manager (Suggestive Search)</label>
            <input type="text" id="sp-edit-manager" class="sp-form-control" value="${staff.reportingTo || ''}" list="sp-manager-suggestions" ${isHR ? '' : 'disabled style="background:#f1f5f9; cursor:not-allowed;"'}>
          </div>
          <div>
            <label class="sp-form-label">Date of Joining</label>
            <input type="text" class="sp-form-control" value="${staff.joiningDate || '2023-01-10'}" disabled style="background:#f1f5f9; cursor:not-allowed;">
          </div>
          <div>
            <label class="sp-form-label">Change Status</label>
            <select id="sp-edit-status" class="sp-form-control" ${isHR ? '' : 'disabled style="background:#f1f5f9; cursor:not-allowed;"'}>
              <option value="Active" ${staff.status === 'Active' ? 'selected' : ''}>Active</option>
              <option value="Suspended" ${staff.status === 'Suspended' ? 'selected' : ''}>Suspended</option>
              <option value="On Leave" ${staff.status === 'On Leave' ? 'selected' : ''}>On Leave</option>
            </select>
          </div>
          ${isDoc ? `
          <div>
            <label class="sp-form-label">Doctor Consultation Fee (₹) *</label>
            <input type="number" id="sp-edit-fee" class="sp-form-control" value="${staff.consultationFee || 500}" min="0" ${isHR ? '' : 'disabled style="background:#f1f5f9; cursor:not-allowed;"'}>
          </div>
          ` : ''}
        </div>

        <div class="sp-section-title" style="margin-top:20px;">Upload Signature Record (Edit Mode)</div>
        <div class="sp-grid">
          <div class="col-span-2" style="grid-column: span 2; display: flex; flex-direction: column; gap: 8px;">
            <label class="sp-form-label">Select Signature Image File</label>
            <input type="file" id="sp-edit-signature-file" class="sp-form-control" accept="image/*" onchange="window.spUploadSignature(this)" ${isHR || isSelf ? '' : 'disabled style="background:#f1f5f9; cursor:not-allowed;"'}>
            <div style="margin-top: 6px; padding: 10px; border: 1px solid #cbd5e1; border-radius: 6px; display: inline-block; width: max-content;">
              <img id="sp-signature-preview-img" src="${signatureSrc}" style="max-height: 50px; display: block;" onerror="this.onerror=null; this.src=\`${fallbackSvg}\`"/>
            </div>
          </div>
        </div>

        <div class="sp-section-title" style="margin-top:20px;">Contact &amp; Personal Info (Edit Mode)</div>
        <div class="sp-grid">
          <div>
            <label class="sp-form-label">Phone Number *</label>
            <input type="text" id="sp-edit-phone" class="sp-form-control" value="${staff.phone || ''}" ${isHR || isSelf ? '' : 'disabled style="background:#f1f5f9; cursor:not-allowed;"'}>
          </div>
          <div>
            <label class="sp-form-label">Email Address *</label>
            <input type="text" id="sp-edit-email" class="sp-form-control" value="${staff.email || ''}" ${isHR || isSelf ? '' : 'disabled style="background:#f1f5f9; cursor:not-allowed;"'}>
          </div>
          <div class="col-span-2" style="grid-column: span 2;">
            <label class="sp-form-label">Residential Address</label>
            <input type="text" id="sp-edit-address" class="sp-form-control" value="${staff.address || ''}" ${isHR || isSelf ? '' : 'disabled style="background:#f1f5f9; cursor:not-allowed;"'}>
          </div>
          <div>
            <label class="sp-form-label">DOB</label>
            <input type="text" class="sp-form-control" value="${staff.dob || ''}" disabled style="background:#f1f5f9; cursor:not-allowed;">
          </div>
          <div>
            <label class="sp-form-label">Emergency Contact Name</label>
            <input type="text" class="sp-form-control" value="${staff.emergencyName || ''}" disabled style="background:#f1f5f9; cursor:not-allowed;">
          </div>
          <div>
            <label class="sp-form-label">Emergency Phone</label>
            <input type="text" class="sp-form-control" value="${staff.emergencyPhone || ''}" disabled style="background:#f1f5f9; cursor:not-allowed;">
          </div>
          <div>
            <label class="sp-form-label">Blood Group</label>
            <input type="text" class="sp-form-control" value="${staff.bloodGroup || ''}" disabled style="background:#f1f5f9; cursor:not-allowed;">
          </div>
        </div>

        <div class="sp-section-title" style="margin-top:20px;">Employment Status Log</div>
        <table class="custom-table" style="font-size:0.7rem; width:100%;">
          <thead>
            <tr><th>Timestamp</th><th>Status</th><th>Reason</th><th>By User</th></tr>
          </thead>
          <tbody>
            ${(staff.statusHistory || []).map(h => `
              <tr>
                <td>${h.date}</td>
                <td><span class="${h.status === 'Active' ? 'sp-badge-green' : 'sp-badge-red'}">${h.status}</span></td>
                <td>${h.reason}</td>
                <td>${h.user}</td>
              </tr>
            `).join('') || '<tr><td colspan="4" style="text-align:center; color:#94a3b8;">No status history entries.</td></tr>'}
          </tbody>
        </table>

        <!-- Autocomplete Suggestions Datalists -->
        <datalist id="sp-designation-suggestions">
          <option value="Consultant Physician">
          <option value="Resident Doctor">
          <option value="Duty Nurse">
          <option value="Nursing Supervisor">
          <option value="Chef">
          <option value="Storekeeper">
          <option value="Cook">
          <option value="Dietitian">
          <option value="Medical Superintendent">
          <option value="HR Administrator">
        </datalist>

        <datalist id="sp-department-suggestions">
          <option value="General Medicine">
          <option value="Pediatrics">
          <option value="Cardiology">
          <option value="Dietary & Kitchen">
          <option value="Nursing Ward">
          <option value="Billing & Reception">
          <option value="Administration">
          <option value="Pharmacy">
          <option value="Laboratory">
          <option value="OT & Anesthesia">
        </datalist>

        <datalist id="sp-manager-suggestions">
          ${(window.state.staffList || []).map(s => `<option value="${s.name}">`).join('')}
        </datalist>
      </div>
    `;
  }

  function renderCredentialsTab(staff) {
    const isCredOfficer = activePersona === 'Credentialing Officer' || activePersona === 'Super Admin';
    const isDoc = staff.type === 'Doctor';
    const expired = staff.credentialStatus === 'Expired';
    
    if (!window.profileEditMode) {
      return `
        <div>
          <div class="sp-section-title">Council Registrations &amp; Licensing</div>
          <div class="sp-grid">
            <div>
              <label class="sp-form-label">Medical Council Registration No. / License</label>
              <div class="sp-form-view-text">${staff.registrationNo || '—'}</div>
            </div>
            <div>
              <label class="sp-form-label">Registration Validity Expiry</label>
              <div class="sp-form-view-text">${staff.regValidTill || '—'}</div>
            </div>
            <div>
              <label class="sp-form-label">Credential Verification Status</label>
              <div class="sp-form-view-text">${staff.credentialStatus || '—'}</div>
            </div>
            <div>
              <label class="sp-form-label">OT Procedure Lead Status</label>
              <div class="sp-form-view-text">${staff.otPrivileges ? 'Granted (OT Procedure Lead)' : 'Not Granted / Standard Ward Care'}</div>
            </div>
          </div>

          ${expired ? `
            <div style="margin-top:16px; background:#fef2f2; border:1px solid #fca5a5; padding:10px; border-radius:6px; color:#b91c1c; font-size:0.7rem; font-weight:700;">
              ⚠ WARNING: Council Registration is currently EXPIRED. This staff member is blocked from signing clinical summaries and performing OT procedures.
            </div>
          ` : ''}

          <div class="sp-section-title" style="margin-top:20px;">Credentials Documents Verification</div>
          <table class="custom-table" style="font-size:0.7rem; width:100%;">
            <thead>
              <tr><th>Certificate Name</th><th>Expiry Date</th><th>Verification Status</th></tr>
            </thead>
            <tbody>
              ${(staff.credentials || []).map(c => `
                <tr>
                  <td>${c.name}</td>
                  <td>${c.expiryDate || 'Perpetual'}</td>
                  <td><span class="${c.status === 'Valid' ? 'sp-badge-green' : 'sp-badge-red'}">${c.status}</span></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;
    }

    return `
      <div>
        <div class="sp-section-title">Council Registrations &amp; Licensing (Edit Mode)</div>
        <div class="sp-grid">
          <div>
            <label class="sp-form-label">Medical Council Registration No. / License</label>
            <input type="text" id="sp-edit-regno" class="sp-form-control" value="${staff.registrationNo || ''}" ${isCredOfficer ? '' : 'disabled style="background:#f1f5f9; cursor:not-allowed;"'}>
          </div>
          <div>
            <label class="sp-form-label">Registration Validity Expiry</label>
            <input type="date" id="sp-edit-regexpiry" class="sp-form-control" value="${staff.regValidTill || ''}" ${isCredOfficer ? '' : 'disabled style="background:#f1f5f9; cursor:not-allowed;"'}>
          </div>
          <div>
            <label class="sp-form-label">Credential Verification Status</label>
            <select id="sp-edit-credstatus" class="sp-form-control" ${isCredOfficer ? '' : 'disabled style="background:#f1f5f9; cursor:not-allowed;"'}>
              <option ${staff.credentialStatus === 'Valid' ? 'selected' : ''}>Valid</option>
              <option ${staff.credentialStatus === 'Expired' ? 'selected' : ''}>Expired</option>
              <option ${staff.credentialStatus === 'Expiring soon' ? 'selected' : ''}>Expiring soon</option>
            </select>
          </div>
        </div>

        ${expired ? `
          <div style="margin-top:16px; background:#fef2f2; border:1px solid #fca5a5; padding:10px; border-radius:6px; color:#b91c1c; font-size:0.7rem; font-weight:700;">
            ⚠ WARNING: Council Registration is currently EXPIRED. This staff member is blocked from signing clinical summaries and performing OT procedures.
          </div>
        ` : ''}

        <div class="sp-section-title" style="margin-top:20px;">Granted Clinical Privileges Checklist (Edit Mode)</div>
        <div style="display:flex; flex-direction:column; gap:8px; font-size:0.75rem;">
          ${isDoc ? `
            <label style="display:flex; align-items:center; gap:8px;">
              <input type="checkbox" id="sp-priv-ot-checkbox" ${staff.otPrivileges ? 'checked' : ''} ${isCredOfficer ? '' : 'disabled'}>
              <strong>OT Procedure Lead</strong> — Permitted to act as operating surgeon.
            </label>
          ` : `
            <label style="display:flex; align-items:center; gap:8px;">
              <input type="checkbox" checked disabled>
              <strong>General Nursing Care</strong> — Standard ward procedures and medication administration.
            </label>
          `}
        </div>

        <div class="sp-section-title" style="margin-top:20px;">Credentials Documents Verification</div>
        <table class="custom-table" style="font-size:0.7rem; width:100%;">
          <thead>
            <tr><th>Certificate Name</th><th>Expiry Date</th><th>Verification Status</th></tr>
          </thead>
          <tbody>
            ${(staff.credentials || []).map(c => `
              <tr>
                <td>${c.name}</td>
                <td>${c.expiryDate || 'Perpetual'}</td>
                <td><span class="${c.status === 'Valid' ? 'sp-badge-green' : 'sp-badge-red'}">${c.status}</span></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  function renderHealthTab(staff) {
    const isFoodOfficer = activePersona === 'Food Safety Officer' || activePersona === 'Super Admin';
    const healthCert = (staff.credentials || []).find(c => c.name.includes('Fitness') || c.name.includes('Health') || c.name.includes('Medical'));
    
    if (activePersona === 'Food Safety Officer' && staff.department !== 'Dietary & Kitchen') {
      return `
        <div style="text-align:center; padding:32px 0; color:#ef4444;">
          <h4>🔒 Restricted Access</h4>
          <p style="font-size:0.72rem; color:#64748b;">Food Safety Officer is only permitted to view health status of staff members assigned to the Dietary &amp; Kitchen department.</p>
        </div>
      `;
    }

    if (!window.profileEditMode) {
      return `
        <div>
          <div class="sp-section-title">Food Handler Medical Fitness Certificate</div>
          ${healthCert ? `
            <div class="sp-grid" style="margin-bottom:16px;">
              <div>
                <label class="sp-form-label">Certificate Expiry Date</label>
                <div class="sp-form-view-text">${healthCert.expiryDate || '—'}</div>
              </div>
              <div>
                <label class="sp-form-label">Certification Status</label>
                <div class="sp-form-view-text">${healthCert.status || '—'}</div>
              </div>
            </div>
          ` : `
            <p style="color:#64748b; font-size:0.75rem;">No active food handler certificates uploaded for this staff category.</p>
          `}

          ${activePersona !== 'Food Safety Officer' ? `
            <div class="sp-section-title" style="margin-top:20px;">Clinical Health &amp; Immunizations</div>
            <div style="font-size:0.75rem; display:flex; flex-direction:column; gap:8px;">
              <div>💉 <strong>Hepatitis B Vaccination Course:</strong> Complete (Dose 3 completed on 12-Nov-2025)</div>
              <div>🩺 <strong>Period Health Screening:</strong> Fit to Work (Last screened 15-Jan-2026)</div>
              <div>🛡️ <strong>Tuberculosis (Mantoux Test):</strong> Negative (Readings clear 15-Jan-2026)</div>
            </div>
          ` : `
            <div style="background:#f1f5f9; padding:8px 12px; border-radius:6px; font-size:0.68rem; color:#64748b; font-weight:600;">
              🔒 Immunization, TB, and screening records are withheld from the Food Safety Officer role per DPDP Act constraints.
            </div>
          `}
        </div>
      `;
    }

    return `
      <div>
        <div class="sp-section-title">Food Handler Medical Fitness Certificate (Edit Mode)</div>
        ${healthCert ? `
          <div class="sp-grid" style="margin-bottom:16px;">
            <div>
              <label class="sp-form-label">Certificate Expiry Date</label>
              <input type="date" id="sp-edit-healthexpiry" class="sp-form-control" value="${healthCert.expiryDate}" ${isFoodOfficer ? '' : 'disabled style="background:#f1f5f9; cursor:not-allowed;"'}>
            </div>
            <div>
              <label class="sp-form-label">Certification Status</label>
              <select id="sp-edit-healthstatus" class="sp-form-control" ${isFoodOfficer ? '' : 'disabled style="background:#f1f5f9; cursor:not-allowed;"'}>
                <option value="Valid" ${healthCert.status === 'Valid' ? 'selected' : ''}>Valid</option>
                <option value="Expired" ${healthCert.status === 'Expired' ? 'selected' : ''}>Expired</option>
              </select>
            </div>
          </div>
        ` : `
          <p style="color:#64748b; font-size:0.75rem;">No active food handler certificates uploaded for this staff category.</p>
        `}

        ${activePersona !== 'Food Safety Officer' ? `
          <div class="sp-section-title" style="margin-top:20px;">Clinical Health &amp; Immunizations</div>
          <div style="font-size:0.75rem; display:flex; flex-direction:column; gap:8px;">
            <div>💉 <strong>Hepatitis B Vaccination Course:</strong> Complete (Dose 3 completed on 12-Nov-2025)</div>
            <div>🩺 <strong>Period Health Screening:</strong> Fit to Work (Last screened 15-Jan-2026)</div>
            <div>🛡️ <strong>Tuberculosis (Mantoux Test):</strong> Negative (Readings clear 15-Jan-2026)</div>
          </div>
        ` : `
          <div style="background:#f1f5f9; padding:8px 12px; border-radius:6px; font-size:0.68rem; color:#64748b; font-weight:600;">
            🔒 Immunization, TB, and screening records are withheld from the Food Safety Officer role per DPDP Act constraints.
          </div>
        `}
      </div>
    `;
  }

  function renderAccessTab(staff) {
    return `
      <div>
        <div class="sp-section-title">System Role &amp; Module Access Privileges</div>
        <p style="font-size:0.72rem; color:#64748b; margin-top:-6px;">Audit record of active user privileges across Saronil HIS software modules.</p>
        
        <table class="custom-table" style="font-size:0.7rem; width:100%; margin-bottom:20px;">
          <thead>
            <tr><th>Module</th><th>System Role Name</th><th>Auth Classification</th></tr>
          </thead>
          <tbody>
            <tr><td>Hospital Management (HR)</td><td>View-Only Staff directory</td><td>Read Level 1</td></tr>
            ${staff.type === 'Doctor' ? `
              <tr><td>IPD Consultation</td><td>Consultant Physician</td><td>Read/Write Level 3</td></tr>
              <tr><td>OT Management</td><td>Lead Operating Surgeon</td><td>Read/Write Level 3</td></tr>
            ` : ''}
            ${staff.type === 'Nurse' ? `
              <tr><td>Diet &amp; Nutrition Sheets</td><td>Ward Nurse Receiver</td><td>Read/Write Level 2</td></tr>
              <tr><td>EMR Records</td><td>Vitals Author</td><td>Read/Write Level 2</td></tr>
            ` : ''}
            ${staff.department === 'Dietary & Kitchen' ? `
              <tr><td>Pantry &amp; Kitchen</td><td>${staff.designation}</td><td>Read/Write Level 2</td></tr>
            ` : ''}
          </tbody>
        </table>

        <div class="sp-section-title">DPDP Act System Access Audit Trail (Last 5 Entries)</div>
        <table class="custom-table" style="font-size:0.68rem; width:100%;">
          <thead>
            <tr><th>Access Time</th><th>IP Address</th><th>Module Accessed</th><th>Action Code</th></tr>
          </thead>
          <tbody>
            <tr><td>Today 11:24 AM</td><td>192.168.1.104</td><td>EMR Vitals File</td><td>READ_RECORD</td></tr>
            <tr><td>Today 09:15 AM</td><td>192.168.1.104</td><td>Shift Roster Board</td><td>VIEW_SCHEDULE</td></tr>
            <tr><td>Yesterday 04:30 PM</td><td>192.168.1.104</td><td>OT Cases Log</td><td>UPDATE_PRE_OP</td></tr>
            <tr><td>08-Jul-2026 10:12 AM</td><td>192.168.1.92</td><td>Hosp Mgmt Profile</td><td>SELF_EDIT_CONTACT</td></tr>
            <tr><td>07-Jul-2026 02:40 PM</td><td>192.168.1.92</td><td>Pantry Inventory</td><td>INGREDIENT_ISSUE</td></tr>
          </tbody>
        </table>
      </div>
    `;
  }

  function renderRosterTab(staff) {
    const isDeptHead = activePersona === 'Department Head' || activePersona === 'Super Admin' || activePersona === 'HR Administrator';
    
    return `
      <div>
        <div class="sp-section-title">Roster &amp; Shift Schedule</div>
        <div style="font-size:0.75rem; background:#f8fafc; border:1px solid #e2e8f0; padding:10px; border-radius:6px; margin-bottom:16px;">
          <div>📆 <strong>Current Shift Pattern:</strong> ${staff.statusToday || 'General Shift'} (09:00 AM - 05:00 PM)</div>
          <div style="margin-top:4px;">⏱️ <strong>Shift Adherence (Last 30 Days):</strong> 96.4% on-time attendance rate</div>
        </div>

        <div class="sp-section-title">Leave Balance Balances</div>
        <div style="display:flex; gap:16px; margin-bottom:16px;">
          <div style="flex:1; border:1px solid #cbd5e1; border-radius:8px; padding:10px; text-align:center;">
            <div style="font-size:1.2rem; font-weight:800; color:#3b82f6;">${(staff.leaveBalances || {}).Casual || 10}</div>
            <div style="font-size:0.65rem; color:#64748b; font-weight:700; text-transform:uppercase;">Casual Leave</div>
          </div>
          <div style="flex:1; border:1px solid #cbd5e1; border-radius:8px; padding:10px; text-align:center;">
            <div style="font-size:1.2rem; font-weight:800; color:#eab308;">${(staff.leaveBalances || {}).Sick || 8}</div>
            <div style="font-size:0.65rem; color:#64748b; font-weight:700; text-transform:uppercase;">Sick Leave</div>
          </div>
          <div style="flex:1; border:1px solid #cbd5e1; border-radius:8px; padding:10px; text-align:center;">
            <div style="font-size:1.2rem; font-weight:800; color:#10b981;">${(staff.leaveBalances || {}).Earned || 15}</div>
            <div style="font-size:0.65rem; color:#64748b; font-weight:700; text-transform:uppercase;">Earned Leave</div>
          </div>
        </div>

        <div class="sp-section-title">Leave Request Approvals</div>
        <table class="custom-table" style="font-size:0.7rem; width:100%;">
          <thead>
            <tr><th>Leave Type</th><th>Dates Range</th><th>Days</th><th>Reason</th><th>Status</th><th>Actions</th></tr>
          </thead>
          <tbody>
            ${(staff.leaveRequests || []).map(lv => `
              <tr>
                <td>${lv.type}</td>
                <td>${lv.fromDate} to ${lv.toDate}</td>
                <td>${lv.days}</td>
                <td>${lv.reason}</td>
                <td><span class="${lv.status === 'Approved' ? 'sp-badge-green' : (lv.status === 'Rejected' ? 'sp-badge-red' : 'sp-badge-amber')}">${lv.status}</span></td>
                <td>
                  ${lv.status === 'Pending Endorsement' && isDeptHead ? `
                    <button class="btn btn-primary btn-sm" style="padding:1px 6px; font-size:0.6rem;" onclick="window.spEndorseLeave('${lv.id}', true)">Endorse</button>
                    <button class="btn btn-secondary btn-sm" style="padding:1px 6px; font-size:0.6rem;" onclick="window.spEndorseLeave('${lv.id}', false)">Reject</button>
                  ` : '—'}
                </td>
              </tr>
            `).join('') || '<tr><td colspan="6" style="text-align:center; color:#94a3b8;">No pending leave requests.</td></tr>'}
          </tbody>
        </table>
      </div>
    `;
  }

  function renderTrainingTab(staff) {
    const isDoc = staff.type === 'Doctor';
    return `
      <div>
        <div class="sp-section-title">Mandatory Training Compliance Check</div>
        <table class="custom-table" style="font-size:0.7rem; width:100%; margin-bottom:20px;">
          <thead>
            <tr><th>Mandatory Training Course</th><th>Completed Date</th><th>Validity Expiry</th><th>Status</th></tr>
          </thead>
          <tbody>
            ${(staff.trainingLogs || []).map(t => `
              <tr>
                <td>${t.name}</td>
                <td>${t.completedDate}</td>
                <td>${t.expiryDate || 'N/A'}</td>
                <td><span class="${t.status === 'Valid' ? 'sp-badge-green' : 'sp-badge-red'}">${t.status}</span></td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        ${isDoc ? `
          <div class="sp-section-title">Doctor Continuing Medical Education (CME) Credits</div>
          <div style="font-size:0.75rem; background:#eff6ff; border:1px solid #bfdbfe; padding:12px; border-radius:8px; display:flex; justify-content:space-between; align-items:center;">
            <div>
              <div style="font-weight:800; color:#1e40af;">Active CME cycle compliance</div>
              <div style="font-size:0.68rem; color:#60a5fa; margin-top:2px;">Target: 30 credits per year</div>
            </div>
            <div style="text-align:right;">
              <span style="font-size:1.3rem; font-weight:800; color:#1e40af;">${(staff.cmeCredits || {}).earned || 15}</span>
              <span style="font-size:0.72rem; color:#60a5fa;">/ ${(staff.cmeCredits || {}).required || 30} CME Credits</span>
            </div>
          </div>
        ` : ''}
      </div>
    `;
  }

  function renderPerformanceTab(staff) {
    const isDeptHead = activePersona === 'Department Head' || activePersona === 'Super Admin' || activePersona === 'HR Administrator';
    const workloadText = staff.type === 'Doctor' 
      ? `📋 Active Patients on Ward Queue: <strong>${(window.state.patients || []).filter(p => p.type === 'IPD' && p.status === 'Admitted').length % 5 + 1}</strong>`
      : `🧑‍⚕️ Ward beds under care: <strong>6 beds</strong>`;

    return `
      <div>
        <div class="sp-section-title">Clinical Workload Snapshot</div>
        <div style="font-size:0.75rem; display:flex; flex-direction:column; gap:6px; background:#f8fafc; border:1px solid #e2e8f0; padding:12px; border-radius:8px; margin-bottom:16px;">
          <div>${workloadText}</div>
          <div>📈 Daily Average Admissions: <strong>3.2 patients</strong></div>
        </div>

        <div class="sp-section-title">Incident Reports &amp; Adverse Logs</div>
        <div style="display:flex; justify-content:space-between; align-items:center; background:#fee2e2; border:1px solid #fca5a5; padding:10px 14px; border-radius:8px; margin-bottom:16px;">
          <div style="font-size:0.75rem; color:#991b1b; font-weight:700;">
            Adverse Incidents Involved (Last 12 Months):
          </div>
          <div style="font-size:1.4rem; font-weight:800; color:#991b1b;">
            ${staff.incidents || 0}
          </div>
        </div>

        ${isDeptHead && staff.incidents > 0 ? `
          <div style="font-size:0.72rem; border-left:3px solid #ef4444; padding-left:10px; margin-top:10px;">
            <strong>Incident Log #INC-2026-0091:</strong><br>
            <span style="color:#64748b;">Reported by Emergency Supervisor on 15-Jun-2026: Shift handover delayed due to staff missing. Corrective action taken.</span>
          </div>
        ` : `
          <div style="font-size:0.68rem; color:#64748b; background:#f1f5f9; padding:8px; border-radius:4px; text-align:center;">
            🔒 Incident description records are restricted to Department Head and HR roles.
          </div>
        `}
      </div>
    `;
  }

  function renderDisciplinaryTab(staff) {
    return `
      <div>
        <div class="sp-section-title">Background Verification &amp; Police Check</div>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-bottom:20px; font-size:0.75rem;">
          <div style="background:#f0fdf4; border:1px solid #bbf7d0; padding:10px; border-radius:6px; color:#166534; display:flex; justify-content:space-between;">
            <span>👮 Police verification certificate:</span>
            <strong>${staff.policeVerification || 'Verified'}</strong>
          </div>
          <div style="background:#f0fdf4; border:1px solid #bbf7d0; padding:10px; border-radius:6px; color:#166534; display:flex; justify-content:space-between;">
            <span>🛡️ Background Check Status:</span>
            <strong>${staff.backgroundStatus || 'Completed'}</strong>
          </div>
        </div>

        <div class="sp-section-title">Disciplinary Records Log</div>
        <table class="custom-table" style="font-size:0.7rem; width:100%; margin-bottom:20px;">
          <thead>
            <tr><th>Date Logged</th><th>Incident Ref</th><th>Action Taken</th><th>Logged By</th></tr>
          </thead>
          <tbody>
            ${(staff.disciplinaryHistory || []).map(d => `
              <tr>
                <td>${d.date}</td>
                <td>${d.incidentRef}</td>
                <td>${d.action}</td>
                <td>${d.loggedBy}</td>
              </tr>
            `).join('') || '<tr><td colspan="4" style="text-align:center; color:#94a3b8;">No active disciplinary records.</td></tr>'}
          </tbody>
        </table>

        <div class="sp-section-title">Sensitive Payroll &amp; Compensation</div>
        <div style="background:#f8fafc; border:1px solid #cbd5e1; padding:12px; border-radius:8px; font-size:0.75rem; display:flex; justify-content:space-between; align-items:center;">
          <span>Monthly Consolidated Salary:</span>
          <strong style="font-size:1.15rem; color:#0f172a;">${staff.salary || '—'}</strong>
        </div>
      </div>
    `;
  }

  window.openActiveUserProfile = function() {
    const persona = localStorage.getItem('saronil_active_persona') || 'admin';
    if (persona === 'doctor') {
      if (typeof window.toggleDoctorSwitcher === 'function') {
        window.toggleDoctorSwitcher(window.event);
      }
    } else {
      const nameEl = document.getElementById('sidebar-user-name');
      const name = nameEl ? nameEl.textContent.trim() : '';
      if (name) {
        window.openStaffProfile(name);
      }
    }
  };

})();
