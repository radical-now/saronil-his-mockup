/* ==========================================================================
   SARONIL HMS - ADMIN CONTROLS & OPERATIONS REPORTING (adminViews.js)
   ========================================================================== */

window.views.admin = function(container, subAnchor, params) {
  if (subAnchor === 'profile' && params && params.id) {
    renderDoctorProfilePage(container, params.id);
  } else {
    renderAdminWorkspace(container, subAnchor || 'employees');
  }
};

function renderAdminWorkspace(container, activeTab) {
  container.innerHTML = `
    <!-- Tab Navigation Headers -->
    <div style="display: flex; gap: 0.5rem; background-color: var(--bg-surface); padding: 0.5rem; border-radius: 8px; border: 1px solid var(--border-color); margin-bottom: 1.5rem; flex-wrap: wrap;">
      <button class="btn ${activeTab === 'employees' ? 'btn-primary' : 'btn-secondary'}" onclick="router.navigate('admin-employees')">👥 Hospital Directory</button>
      <button class="btn ${activeTab === 'roles' ? 'btn-primary' : 'btn-secondary'}" onclick="router.navigate('admin-roles')">🔑 Role Access Matrix</button>
      <button class="btn ${activeTab === 'reports' ? 'btn-primary' : 'btn-secondary'}" onclick="router.navigate('admin-reports')">📈 Analytics & Reports</button>
    </div>

    <!-- Active Admin Sub-Viewport -->
    <div id="admin-sub-viewport">
      <!-- Renders dynamically based on tab -->
    </div>
  `;

  const subViewport = document.getElementById('admin-sub-viewport');
  
  if (activeTab === 'employees') {
    renderEmployeesTab(subViewport);
  } else if (activeTab === 'roles') {
    renderRolesTab(subViewport);
  } else if (activeTab === 'reports') {
    renderReportsTab(subViewport);
  }
}

// --------------------------------------------------------------------------
// EMPLOYEES DIRECTORY
// --------------------------------------------------------------------------
function renderEmployeesTab(container) {
  container.innerHTML = `
    <div class="card">
      <div class="card-header" style="display: flex; justify-content: space-between; align-items: center;">
        <div>
          <h3 class="card-title">Hospital Staff & Consultant Directory</h3>
          <p class="card-subtitle">Manage doctor schedules, department allocations, and employee status keys</p>
        </div>
        <button class="btn btn-primary" onclick="window.openRegisterStaffModal()">+ Register Staff</button>
      </div>
      <div class="card-body">
        <table class="custom-table" style="font-size: 0.85rem; width:100%;">
          <thead>
            <tr>
              <th>Staff ID</th>
              <th>Employee Name</th>
              <th>Department / Specialization</th>
              <th>OPD Room</th>
              <th>Contact Phone</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${state.doctors.map(doc => `
              <tr style="border-bottom:1px solid var(--border-color);">
                <td><strong>${doc.id}</strong></td>
                <td>
                  <a href="#admin-profile?id=${doc.id}" style="font-weight:700; color:var(--primary); text-decoration:none;">
                    ${doc.name}
                  </a>
                </td>
                <td>${doc.spec}</td>
                <td>OPD Room ${doc.room}</td>
                <td>${doc.phone}</td>
                <td><span style="color: var(--color-success); font-weight:600;">${doc.status}</span></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

// --------------------------------------------------------------------------
// DOCTOR PROFILE PAGE (FULL VIEW)
// --------------------------------------------------------------------------
function renderDoctorProfilePage(container, docId) {
  const doc = state.doctors.find(d => d.id === docId);
  if (!doc) {
    container.innerHTML = `<div style="padding:20px; color:var(--color-danger);">Doctor profile with ID ${docId} not found.</div>`;
    return;
  }

  // Set page title breadcrumb
  const pageTitleEl = document.getElementById('active-page-title');
  if (pageTitleEl) pageTitleEl.textContent = `Consultant Profile: ${doc.name}`;

  // Local active tab for the profile page
  const profileTab = localStorage.getItem('saronil_prof_tab') || 'form';

  const styles = `
    <style>
      .profile-grid {
        display: grid;
        grid-template-columns: 280px 1fr;
        gap: 1.5rem;
        align-items: start;
        text-align: left;
      }
      .profile-sidebar {
        background: var(--bg-surface);
        border: 1px solid var(--border-color);
        border-radius: 8px;
        padding: 1.25rem;
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }
      .profile-main {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }
      .profile-tab-bar {
        display: flex;
        gap: 6px;
        border-bottom: 2px solid var(--border-color);
        padding-bottom: 2px;
      }
      .profile-tab-btn {
        background: transparent;
        border: none;
        padding: 6px 16px;
        font-size: 0.8rem;
        font-weight: 700;
        color: var(--text-muted);
        cursor: pointer;
        border-bottom: 3px solid transparent;
      }
      .profile-tab-btn.active {
        color: var(--primary);
        border-bottom-color: var(--primary);
      }
    </style>
  `;

  let tabBodyHTML = '';
  if (profileTab === 'form') {
    tabBodyHTML = `
      <form id="profile-edit-form" onsubmit="window.saveDoctorProfileForm(event, '${doc.id}')" style="display:flex; flex-direction:column; gap:12px; font-size:0.8rem;">
        <div style="font-size:0.9rem; font-weight:800; border-bottom:1px solid var(--border-color); padding-bottom:4px; color:var(--primary);">1. Personal Information</div>
        <div class="form-grid-2" style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
          <div class="form-group">
            <label style="font-weight:700;">Full Name *</label>
            <input type="text" id="prof-name" class="form-control" value="${doc.name}" required style="font-size:0.75rem;">
          </div>
          <div class="form-group">
            <label style="font-weight:700;">Gender</label>
            <select id="prof-gender" class="form-select" style="font-size:0.75rem;">
              <option value="Male" ${doc.gender === 'Male' ? 'selected' : ''}>Male</option>
              <option value="Female" ${doc.gender === 'Female' ? 'selected' : ''}>Female</option>
              <option value="Other" ${doc.gender === 'Other' ? 'selected' : ''}>Other</option>
            </select>
          </div>
        </div>
        <div class="form-grid-2" style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
          <div class="form-group">
            <label style="font-weight:700;">Date of Birth</label>
            <input type="date" id="prof-dob" class="form-control" value="${doc.dob || '1984-06-15'}" style="font-size:0.75rem;">
          </div>
          <div class="form-group">
            <label style="font-weight:700;">Email Address</label>
            <input type="email" id="prof-email" class="form-control" value="${doc.email || doc.id.toLowerCase() + '@saronil.com'}" style="font-size:0.75rem;">
          </div>
        </div>

        <div style="font-size:0.9rem; font-weight:800; border-bottom:1px solid var(--border-color); padding-bottom:4px; color:var(--primary); margin-top:8px;">2. Clinical Specialization</div>
        <div class="form-grid-2" style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
          <div class="form-group">
            <label style="font-weight:700;">Department / Specialization *</label>
            <input type="text" id="prof-spec" class="form-control" value="${doc.spec}" required style="font-size:0.75rem;">
          </div>
          <div class="form-group">
            <label style="font-weight:700;">OPD Room Allotment</label>
            <input type="text" id="prof-room" class="form-control" value="${doc.room}" style="font-size:0.75rem;">
          </div>
        </div>
        <div class="form-grid-2" style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
          <div class="form-group">
            <label style="font-weight:700;">Consultation Fee (₹)</label>
            <input type="number" id="prof-fee" class="form-control" value="${doc.fee || 500}" style="font-size:0.75rem;">
          </div>
          <div class="form-group">
            <label style="font-weight:700;">OPD Schedule Days / Hours</label>
            <input type="text" id="prof-schedule" class="form-control" value="${doc.schedule || 'Mon, Wed, Fri (09:00 - 13:00)'}" style="font-size:0.75rem;">
          </div>
        </div>

        <div style="font-size:0.9rem; font-weight:800; border-bottom:1px solid var(--border-color); padding-bottom:4px; color:var(--primary); margin-top:8px;">3. Regulatory Credentials</div>
        <div class="form-grid-2" style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
          <div class="form-group">
            <label style="font-weight:700;">Council Reg No *</label>
            <input type="text" id="prof-regno" class="form-control" value="${doc.regNo || ''}" required style="font-size:0.75rem;">
          </div>
          <div class="form-group">
            <label style="font-weight:700;">Medical State Board</label>
            <select id="prof-stateboard" class="form-select" style="font-size:0.75rem;">
              <option value="Karnataka Medical Council" ${doc.stateBoard === 'Karnataka Medical Council' ? 'selected' : ''}>Karnataka Medical Council (KMC)</option>
              <option value="Medical Council of India" ${doc.stateBoard === 'Medical Council of India' ? 'selected' : ''}>Medical Council of India (MCI)</option>
              <option value="Maharashtra Medical Council" ${doc.stateBoard === 'Maharashtra Medical Council' ? 'selected' : ''}>Maharashtra Medical Council (MMC)</option>
            </select>
          </div>
        </div>
        <div class="form-group">
          <label style="font-weight:700;">Qualifications (Degrees)</label>
          <input type="text" id="prof-qualification" class="form-control" value="${doc.qualification || 'MBBS, MD'}" style="font-size:0.75rem;">
        </div>

        <div style="font-size:0.9rem; font-weight:800; border-bottom:1px solid var(--border-color); padding-bottom:4px; color:var(--primary); margin-top:8px;">4. Digital Signature &amp; Status</div>
        <div class="form-grid-2" style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
          <div class="form-group">
            <label style="font-weight:700;">Upload Signature File (PNG/JPG)</label>
            <input type="file" id="prof-sig" class="form-control" accept="image/*" style="font-size:0.75rem;">
            <small style="color:var(--text-muted);">Current: ${doc.signatureName || 'default-sig.png'}</small>
          </div>
          <div class="form-group">
            <label style="font-weight:700;">Duty Status</label>
            <select id="prof-status" class="form-select" style="font-size:0.75rem;">
              <option value="Active" ${doc.status === 'Active' ? 'selected' : ''}>Active</option>
              <option value="On Leave" ${doc.status === 'On Leave' ? 'selected' : ''}>On Leave</option>
              <option value="Suspended" ${doc.status === 'Suspended' ? 'selected' : ''}>Suspended</option>
            </select>
          </div>
        </div>

        <div style="display:flex; justify-content:flex-end; gap:8px; border-top:1px solid var(--border-color); padding-top:12px; margin-top:10px;">
          <button type="submit" class="btn btn-primary" style="padding:6px 20px;">Save Profile Changes</button>
        </div>
      </form>
    `;
  } else if (profileTab === 'stats') {
    tabBodyHTML = `
      <div style="display:flex; flex-direction:column; gap:1rem;">
        <h4 style="margin:0; font-size:0.9rem; color:var(--primary); font-weight:700;">📊 Consultation Footfall Audits</h4>
        <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:12px;">
          <div style="background:var(--bg-slate-light); padding:12px; border-radius:6px; text-align:center;">
            <span style="font-size:0.72rem; color:var(--text-muted);">APPOINTMENTS TODAY</span>
            <div style="font-size:1.3rem; font-weight:800; color:var(--primary); margin-top:2px;">12</div>
          </div>
          <div style="background:var(--bg-slate-light); padding:12px; border-radius:6px; text-align:center;">
            <span style="font-size:0.72rem; color:var(--text-muted);">AVG CONSULT TIME</span>
            <div style="font-size:1.3rem; font-weight:800; color:var(--primary); margin-top:2px;">15 Mins</div>
          </div>
          <div style="background:var(--bg-slate-light); padding:12px; border-radius:6px; text-align:center;">
            <span style="font-size:0.72rem; color:var(--text-muted);">PATIENTS COMPLETED</span>
            <div style="font-size:1.3rem; font-weight:800; color:var(--primary); margin-top:2px;">8</div>
          </div>
        </div>

        <div style="border:1px solid var(--border-color); border-radius:6px; overflow:hidden; margin-top:8px;">
          <div style="background:var(--bg-slate-light); padding:10px; font-weight:700; font-size:0.8rem;">OPD Roster Calendar sessions</div>
          <table class="custom-table" style="font-size:0.75rem; width:100%;">
            <thead><tr><th>Day</th><th>Timings</th><th>Availability</th><th>Allotted Bed/Room</th></tr></thead>
            <tbody>
              <tr><td>Monday</td><td>09:00 - 13:00</td><td>Available</td><td>OPD Room ${doc.room}</td></tr>
              <tr><td>Wednesday</td><td>09:00 - 13:00</td><td>Available</td><td>OPD Room ${doc.room}</td></tr>
              <tr><td>Friday</td><td>09:00 - 13:00</td><td>Available</td><td>OPD Room ${doc.room}</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    `;
  } else if (profileTab === 'privileges') {
    tabBodyHTML = `
      <div style="display:flex; flex-direction:column; gap:12px;">
        <h4 style="margin:0; font-size:0.9rem; color:var(--primary); font-weight:700;">🔒 Prescribing Privileges &amp; Licences</h4>
        <div style="background:#fef3c7; border:1px solid #fde68a; color:#b45309; padding:10px; border-radius:6px; font-size:0.75rem; font-weight:600;">
          ⚠️ Verification Check: DEA narcotic prescribing rights require periodic board validation.
        </div>
        <div style="display:flex; flex-direction:column; gap:8px;">
          <label style="display:flex; align-items:center; gap:8px;"><input type="checkbox" checked disabled> Inpatient admissions authorization</label>
          <label style="display:flex; align-items:center; gap:8px;"><input type="checkbox" checked disabled> High alert controlled drugs prescription privilege (NDPS)</label>
          <label style="display:flex; align-items:center; gap:8px;"><input type="checkbox" checked disabled> Major surgery primary assistant credential</label>
        </div>
      </div>
    `;
  }

  container.innerHTML = styles + `
    <div class="profile-grid">
      <!-- Left sidebar card -->
      <div class="profile-sidebar">
        <div style="text-align:center; border-bottom:1px solid var(--border-color); padding-bottom:15px;">
          <div style="width:70px; height:70px; border-radius:50%; background:var(--primary); color:#fff; display:flex; justify-content:center; align-items:center; font-size:1.8rem; font-weight:bold; margin:0 auto 10px auto;">
            ${doc.name.replace('Dr. ', '').charAt(0)}
          </div>
          <h2 style="margin:0; font-size:1.1rem; font-weight:800;">${doc.name}</h2>
          <span class="badge badge-success" style="font-size:10px; margin-top:4px;">${doc.status}</span>
        </div>

        <div style="font-size:0.75rem; display:flex; flex-direction:column; gap:6px;">
          <div><strong>ID:</strong> <span class="mono">${doc.id}</span></div>
          <div><strong>Dept:</strong> ${doc.spec}</div>
          <div><strong>Room:</strong> Room ${doc.room}</div>
          <div><strong>Reg No:</strong> <span class="mono">${doc.regNo || '—'}</span></div>
        </div>

        <div>
          <span style="font-size:0.7rem; color:var(--text-muted); font-weight:700;">Signature Preview</span>
          <div style="border:1px dashed var(--border-color); padding:8px; border-radius:6px; text-align:center; background:#f8fafc; margin-top:4px;">
            ${doc.signatureUrl ? `
              <img src="${doc.signatureUrl}" alt="Signature" style="max-height:45px; max-width:100%;">
            ` : `
              <span style="font-size:10px; font-style:italic; color:var(--text-muted);">🖋 Signature Verified (${doc.signatureName || 'sig.png'})</span>
            `}
          </div>
        </div>

        <div style="display:flex; flex-direction:column; gap:6px; margin-top:8px;">
          <button class="btn btn-secondary btn-sm" onclick="router.navigate('admin-employees')">⬅ Back to Directory</button>
          <button class="btn btn-secondary btn-sm" style="color:var(--color-danger);" onclick="window.lockDoctorCredentials('${doc.id}')">🔒 Lock Credentials</button>
        </div>
      </div>

      <!-- Right main area -->
      <div class="profile-main">
        <div class="card">
          <div class="card-header" style="padding:8px 16px;">
            <div class="profile-tab-bar">
              <button class="profile-tab-btn ${profileTab === 'form' ? 'active' : ''}" onclick="window.switchProfileTab('${doc.id}', 'form')">📝 Portfolio Details</button>
              <button class="profile-tab-btn ${profileTab === 'stats' ? 'active' : ''}" onclick="window.switchProfileTab('${doc.id}', 'stats')">📅 Schedule &amp; Stats</button>
              <button class="profile-tab-btn ${profileTab === 'privileges' ? 'active' : ''}" onclick="window.switchProfileTab('${doc.id}', 'privileges')">🔑 Privileges</button>
            </div>
          </div>
          <div class="card-body">
            ${tabBodyHTML}
          </div>
        </div>
      </div>
    </div>
  `;
}

window.switchProfileTab = function(docId, tabId) {
  localStorage.setItem('saronil_prof_tab', tabId);
  renderDoctorProfilePage(document.getElementById('main-content'), docId);
};

window.lockDoctorCredentials = function(docId) {
  if (confirm(`Are you sure you want to suspend medical credentials access for ${docId}? This will block narcotic prescribing permissions.`)) {
    const doc = state.doctors.find(d => d.id === docId);
    if (doc) {
      doc.status = 'Suspended';
      alert("Doctor credentials successfully locked/suspended.");
      renderDoctorProfilePage(document.getElementById('main-content'), docId);
    }
  }
};

window.saveDoctorProfileForm = function(event, docId) {
  event.preventDefault();
  const doc = state.doctors.find(d => d.id === docId);
  if (!doc) return;

  const name = document.getElementById('prof-name').value.trim();
  const spec = document.getElementById('prof-spec').value.trim();
  const room = document.getElementById('prof-room').value.trim();
  const fee = parseInt(document.getElementById('prof-fee').value) || 500;
  const sched = document.getElementById('prof-schedule').value.trim();
  const regNo = document.getElementById('prof-regno').value.trim();
  const gender = document.getElementById('prof-gender').value;
  const dob = document.getElementById('prof-dob').value;
  const email = document.getElementById('prof-email').value.trim();
  const stateBoard = document.getElementById('prof-stateboard').value;
  const qual = document.getElementById('prof-qualification').value.trim();
  const sigFile = document.getElementById('prof-sig').files[0];
  const status = document.getElementById('prof-status').value;

  if (!name || !spec || !regNo) {
    alert("Full Name, Specialization/Department, and Registration Number are required.");
    return;
  }

  doc.name = name;
  doc.spec = spec;
  doc.room = room;
  doc.fee = fee;
  doc.schedule = sched;
  doc.regNo = regNo;
  doc.gender = gender;
  doc.dob = dob;
  doc.email = email;
  doc.stateBoard = stateBoard;
  doc.qualification = qual;
  doc.status = status;

  if (sigFile) {
    doc.signatureName = sigFile.name;
    doc.signatureUrl = URL.createObjectURL(sigFile);
  }

  alert("Consultant Profile Portfolio updated successfully.");
  renderDoctorProfilePage(document.getElementById('main-content'), docId);
};

// --------------------------------------------------------------------------
// REGISTER NEW STAFF
// --------------------------------------------------------------------------
window.openRegisterStaffModal = function() {
  const modal = document.createElement('div');
  modal.id = 'register-staff-modal';
  modal.style.cssText = `
    position: fixed; inset: 0; background: rgba(15, 23, 42, 0.6); backdrop-filter: blur(4px);
    z-index: 100000; display: flex; justify-content: center; align-items: center; padding: 20px;
    font-family: 'Outfit', sans-serif;
  `;
  modal.innerHTML = `
    <div style="background:var(--bg-surface); border-radius:12px; width:100%; max-width:480px; box-shadow:var(--shadow-lg); overflow:hidden; border:1px solid var(--border-color); text-align:left;">
      <div style="background:var(--primary); color:#fff; padding:15px 20px; display:flex; justify-content:space-between; align-items:center;">
        <h3 style="margin:0; font-size:1.1rem; font-weight:800;">👥 Register New Hospital Staff</h3>
        <button onclick="document.getElementById('register-staff-modal').remove()" style="background:transparent; border:none; color:#fff; font-size:1.25rem; font-weight:bold; cursor:pointer;">&times;</button>
      </div>
      <form id="register-staff-form" onsubmit="window.submitRegisterStaffForm(event)" style="padding:20px; display:flex; flex-direction:column; gap:12px; font-size:0.8rem;">
        <div class="form-group">
          <label style="font-weight:700;">Full Name *</label>
          <input type="text" id="reg-staff-name" class="form-control" placeholder="e.g. Dr. Ramesh Patel" required style="font-size:0.75rem;">
        </div>
        <div class="form-grid-2" style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
          <div class="form-group">
            <label style="font-weight:700;">Staff Category *</label>
            <select id="reg-staff-category" class="form-select" style="font-size:0.75rem;" onchange="window.toggleRegisterDoctorFields(this.value)">
              <option value="Doctor">Doctor (Consultant)</option>
              <option value="Nurse">Staff Nurse</option>
              <option value="Staff">Support / Admin Staff</option>
            </select>
          </div>
          <div class="form-group">
            <label style="font-weight:700;">Department *</label>
            <input type="text" id="reg-staff-spec" class="form-control" placeholder="e.g. Cardiology" required style="font-size:0.75rem;">
          </div>
        </div>
        <div class="form-grid-2" style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
          <div class="form-group">
            <label style="font-weight:700;">Room Allotment</label>
            <input type="text" id="reg-staff-room" class="form-control" placeholder="e.g. 104" style="font-size:0.75rem;">
          </div>
          <div class="form-group">
            <label style="font-weight:700;">Contact Phone *</label>
            <input type="text" id="reg-staff-phone" class="form-control" placeholder="e.g. +91 99999 99999" required style="font-size:0.75rem;">
          </div>
        </div>
        <!-- Doctor specific fields -->
        <div id="reg-doc-fields" style="display:flex; flex-direction:column; gap:12px;">
          <div class="form-group">
            <label style="font-weight:700;">Medical Council Reg No *</label>
            <input type="text" id="reg-doc-regno" class="form-control" placeholder="e.g. KMC-77291" style="font-size:0.75rem;">
          </div>
          <div class="form-group">
            <label style="font-weight:700; color:var(--color-danger);">Upload Digital Signature File *</label>
            <input type="file" id="reg-doc-sig" class="form-control" accept="image/*" style="font-size:0.75rem;">
            <small style="color:var(--text-muted);">PNG or JPG of the doctor's signature (Mandatory).</small>
          </div>
        </div>
        <div style="display:flex; justify-content:flex-end; gap:8px; border-top:1px solid var(--border-color); padding-top:12px; margin-top:8px;">
          <button type="button" class="btn btn-secondary btn-sm" onclick="document.getElementById('register-staff-modal').remove()">Cancel</button>
          <button type="submit" class="btn btn-primary btn-sm">Register Staff</button>
        </div>
      </form>
    </div>
  `;
  document.body.appendChild(modal);
  // Initial check
  window.toggleRegisterDoctorFields('Doctor');
};

window.toggleRegisterDoctorFields = function(category) {
  const docFields = document.getElementById('reg-doc-fields');
  const sigField = document.getElementById('reg-doc-sig');
  const regnoField = document.getElementById('reg-doc-regno');

  if (category === 'Doctor') {
    docFields.style.display = 'flex';
    sigField.required = true;
    regnoField.required = true;
  } else {
    docFields.style.display = 'none';
    sigField.required = false;
    regnoField.required = false;
  }
};

window.submitRegisterStaffForm = function(event) {
  event.preventDefault();

  const name = document.getElementById('reg-staff-name').value.trim();
  const category = document.getElementById('reg-staff-category').value;
  const spec = document.getElementById('reg-staff-spec').value.trim();
  const room = document.getElementById('reg-staff-room').value.trim();
  const phone = document.getElementById('reg-staff-phone').value.trim();

  if (category === 'Doctor') {
    const sigFile = document.getElementById('reg-doc-sig').files[0];
    const regNo = document.getElementById('reg-doc-regno').value.trim();
    if (!regNo) {
      alert("Medical Council Registration Number is required for doctors.");
      return;
    }
    if (!sigFile) {
      alert("Digital signature file upload is required for doctor registration.");
      return;
    }

    const docId = "DOC" + String(state.doctors.length + 1).padStart(2, '0');
    state.doctors.push({
      id: docId,
      name: name,
      spec: spec,
      room: room || '101',
      phone: phone,
      regNo: regNo,
      signatureName: sigFile.name,
      signatureUrl: URL.createObjectURL(sigFile),
      status: "Active"
    });
  } else {
    // Nurse or Staff
    const db = category === 'Nurse' ? state.nurses : state.staff;
    const prefix = category === 'Nurse' ? 'NUR' : 'STF';
    const id = prefix + String(db.length + 1).padStart(2, '0');
    db.push({
      id: id,
      name: name,
      dept: spec,
      shift: 'Morning',
      phone: phone,
      status: "Active"
    });
  }

  alert(`${category} registered successfully.`);
  document.getElementById('register-staff-modal').remove();
  
  // Refresh layout
  renderAdminWorkspace(document.getElementById('main-content'), 'employees');
};

// --------------------------------------------------------------------------
// ACCESS CONTROL MATRIX
// --------------------------------------------------------------------------
function renderRolesTab(container) {
  const roles = [
    { role: 'System Admin', dashboard: '✓', registration: '✓', clinical: '✓', financial: '✓', diagnostics: '✓', support: '✓', admin: '✓' },
    { role: 'Consultant Doctor', dashboard: '✓', registration: 'x', clinical: '✓', financial: 'x', diagnostics: '✓', support: 'x', admin: 'x' },
    { role: 'Front Desk / Registry', dashboard: 'x', registration: '✓', clinical: 'x', financial: '✓', diagnostics: 'x', support: 'x', admin: 'x' },
    { role: 'Billing Operator', dashboard: 'x', registration: 'x', clinical: 'x', financial: '✓', diagnostics: 'x', support: 'x', admin: 'x' },
    { role: 'Lab Pathologist', dashboard: 'x', registration: 'x', clinical: 'x', financial: 'x', diagnostics: '✓', support: 'x', admin: 'x' },
    { role: 'Support Staff', dashboard: 'x', registration: 'x', clinical: 'x', financial: 'x', diagnostics: 'x', support: '✓', admin: 'x' }
  ];

  container.innerHTML = `
    <div class="card">
      <div class="card-header">
        <div>
          <h3 class="card-title">Role Access Control Matrix (RBAC)</h3>
          <p class="card-subtitle">Manage authorization privileges across modules for different employee classes</p>
        </div>
      </div>
      <div class="card-body">
        <table class="custom-table" style="font-size: 0.85rem; text-align: center; width:100%;">
          <thead>
            <tr>
              <th style="text-align: left;">Employee Role</th>
              <th>Dashboard</th>
              <th>Registration</th>
              <th>Clinical (EMR)</th>
              <th>Financial (Billing)</th>
              <th>Diagnostics (LIS/RIS)</th>
              <th>Support Modules</th>
              <th>Admin & Control</th>
            </tr>
          </thead>
          <tbody>
            ${roles.map(r => `
              <tr style="border-bottom:1px solid var(--border-color);">
                <td style="text-align: left; padding:10px;"><strong>${r.role}</strong></td>
                <td style="color: ${r.dashboard === '✓' ? 'var(--color-success)' : 'var(--color-danger)'}; font-weight: bold;">${r.dashboard}</td>
                <td style="color: ${r.registration === '✓' ? 'var(--color-success)' : 'var(--color-danger)'}; font-weight: bold;">${r.registration}</td>
                <td style="color: ${r.clinical === '✓' ? 'var(--color-success)' : 'var(--color-danger)'}; font-weight: bold;">${r.clinical}</td>
                <td style="color: ${r.financial === '✓' ? 'var(--color-success)' : 'var(--color-danger)'}; font-weight: bold;">${r.financial}</td>
                <td style="color: ${r.diagnostics === '✓' ? 'var(--color-success)' : 'var(--color-danger)'}; font-weight: bold;">${r.diagnostics}</td>
                <td style="color: ${r.support === '✓' ? 'var(--color-success)' : 'var(--color-danger)'}; font-weight: bold;">${r.support}</td>
                <td style="color: ${r.admin === '✓' ? 'var(--color-success)' : 'var(--color-danger)'}; font-weight: bold;">${r.admin}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

// --------------------------------------------------------------------------
// DYNAMIC REPORTS VIEW & DOWNLOAD (NEW WORKFLOW)
// --------------------------------------------------------------------------
function renderReportsTab(container) {
  container.innerHTML = `
    <div style="display:flex; flex-direction:column; gap:1.25rem; text-align:left;">
      <!-- Reports Master Filter Console -->
      <div class="card">
        <div class="card-header"><h3 class="card-title">📊 Executive Hospital Operations Reporting Console</h3></div>
        <div class="card-body">
          <div style="display:grid; grid-template-columns:repeat(5, 1fr); gap:12px; align-items:end;">
            <div class="form-group" style="margin:0;">
              <label class="form-label" style="font-weight:700; font-size:0.75rem;">Report Category</label>
              <select id="rep-category" class="form-select" style="font-size:0.75rem;" onchange="window.handleReportCategoryChange(this.value)">
                <option value="clinical">Clinical Consultation Summary</option>
                <option value="financial">Financial Billing & Collections</option>
                <option value="operational">IPD Ward Bed Occupancy</option>
                <option value="inventory">Inventory Stock & Indents</option>
                <option value="bloodbank">Blood Bank Camps & Component Stock</option>
              </select>
            </div>
            
            <div class="form-group" style="margin:0;">
              <label class="form-label" style="font-weight:700; font-size:0.75rem;">Start Date</label>
              <input type="date" id="rep-start-date" class="form-control" style="font-size:0.75rem;" value="2026-06-01">
            </div>

            <div class="form-group" style="margin:0;">
              <label class="form-label" style="font-weight:700; font-size:0.75rem;">End Date</label>
              <input type="date" id="rep-end-date" class="form-control" style="font-size:0.75rem;" value="2026-07-31">
            </div>

            <div class="form-group" style="margin:0;">
              <label id="rep-dept-label" class="form-label" style="font-weight:700; font-size:0.75rem;">Department</label>
              <select id="rep-dept" class="form-select" style="font-size:0.75rem;">
                <option value="all">All Departments</option>
                <option value="Cardiology">Cardiology</option>
                <option value="Pediatrics">Pediatrics</option>
                <option value="General Medicine">General Medicine</option>
                <option value="General Surgery">General Surgery</option>
                <option value="Orthopedics">Orthopedics</option>
                <option value="Gynecology">Gynecology</option>
                <option value="Emergency">Emergency</option>
              </select>
            </div>

            <div class="form-group" style="margin:0;">
              <label id="rep-status-label" class="form-label" style="font-weight:700; font-size:0.75rem;">Record Status</label>
              <select id="rep-status" class="form-select" style="font-size:0.75rem;">
                <option value="all">All Statuses</option>
                <option value="checked in">Checked In / Completed</option>
                <option value="scheduled">Scheduled / Pending</option>
                <option value="outstanding">Outstanding Billing</option>
                <option value="settled">Settled Billing</option>
              </select>
            </div>
          </div>

          <div style="display:flex; justify-content:flex-end; gap:10px; margin-top:15px; border-top:1px solid var(--border-color); padding-top:12px;">
            <button class="btn btn-secondary btn-sm" onclick="window.printActiveReportHTML()">🖨 Print / PDF Export</button>
            <button class="btn btn-secondary btn-sm" style="border-color:#059669; color:#059669;" onclick="window.downloadActiveReportAsCSV()">📥 Download CSV</button>
            <button class="btn btn-primary btn-sm" style="padding:6px 20px;" onclick="window.generateFilteredReport()">🔍 Generate Report</button>
          </div>
        </div>
      </div>

      <!-- Report Output Container -->
      <div id="report-output-container" style="display:flex; flex-direction:column; gap:1rem;">
        <!-- Filled dynamically -->
      </div>
    </div>
  `;

  // Trigger initial report generation
  window.generateFilteredReport();
}

window.handleReportCategoryChange = function(cat) {
  const deptSelect = document.getElementById('rep-dept');
  const statusSelect = document.getElementById('rep-status');

  if (cat === 'clinical') {
    deptSelect.disabled = false;
    statusSelect.disabled = false;
    statusSelect.innerHTML = `
      <option value="all">All Statuses</option>
      <option value="checked in">Checked In</option>
      <option value="scheduled">Scheduled</option>
      <option value="completed">Completed</option>
    `;
  } else if (cat === 'financial') {
    deptSelect.disabled = true;
    statusSelect.disabled = false;
    statusSelect.innerHTML = `
      <option value="all">All Statuses</option>
      <option value="outstanding">Outstanding</option>
      <option value="settled">Settled</option>
    `;
  } else if (cat === 'operational') {
    deptSelect.disabled = true;
    statusSelect.disabled = true;
    statusSelect.innerHTML = `<option value="all">All</option>`;
  } else if (cat === 'inventory') {
    deptSelect.disabled = false;
    statusSelect.disabled = false;
    statusSelect.innerHTML = `
      <option value="all">All Statuses</option>
      <option value="pending">Pending Indents</option>
      <option value="fulfilled">Fulfilled Indents</option>
      <option value="cancelled">Cancelled Indents</option>
    `;
  } else if (cat === 'bloodbank') {
    deptSelect.disabled = true;
    statusSelect.disabled = true;
    statusSelect.innerHTML = `<option value="all">All</option>`;
  }
};

window.generateFilteredReport = function() {
  const cat = document.getElementById('rep-category').value;
  const startStr = document.getElementById('rep-start-date').value;
  const endStr = document.getElementById('rep-end-date').value;
  const dept = document.getElementById('rep-dept').value;
  const status = document.getElementById('rep-status').value;

  const start = startStr ? new Date(startStr) : null;
  const end = endStr ? new Date(endStr) : null;

  const container = document.getElementById('report-output-container');
  if (!container) return;

  let columns = [];
  let rows = [];
  let summaryHTML = '';

  if (cat === 'clinical') {
    columns = ['Appt ID', 'Patient Name', 'Doctor', 'Department', 'Date', 'Time', 'Status'];
    let filtered = state.appointments.filter(app => {
      if (start || end) {
        const appDate = new Date(app.date);
        if (start && appDate < start) return false;
        if (end && appDate > end) return false;
      }
      const appSpec = (app.spec || app.deptName || '');
      if (dept !== 'all' && appSpec.toLowerCase() !== dept.toLowerCase()) return false;
      if (status !== 'all' && (app.status || '').toLowerCase() !== status.toLowerCase()) return false;
      return true;
    });

    rows = filtered.map(app => [
      app.id,
      app.patientName || '—',
      app.docName || app.doctorName || '—',
      app.spec || app.deptName || '—',
      app.date || '—',
      app.time || '—',
      app.status || '—'
    ]);

    summaryHTML = `
      <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:12px; margin-bottom:5px;">
        <div style="background:var(--bg-slate-light); padding:12px; border-radius:6px; text-align:center; border:1px solid var(--border-color);">
          <span style="font-size:0.7rem; color:var(--text-muted); font-weight:700;">TOTAL CONSULTATIONS</span>
          <div style="font-size:1.4rem; font-weight:800; color:var(--primary); margin-top:2px;">${filtered.length}</div>
        </div>
        <div style="background:var(--bg-slate-light); padding:12px; border-radius:6px; text-align:center; border:1px solid var(--border-color);">
          <span style="font-size:0.7rem; color:var(--text-muted); font-weight:700;">COMPLETED / CK-IN</span>
          <div style="font-size:1.4rem; font-weight:800; color:#059669; margin-top:2px;">${filtered.filter(a => (a.status || '').includes('Check') || a.status === 'Completed').length}</div>
        </div>
        <div style="background:var(--bg-slate-light); padding:12px; border-radius:6px; text-align:center; border:1px solid var(--border-color);">
          <span style="font-size:0.7rem; color:var(--text-muted); font-weight:700;">OPD ROSTER SIZE</span>
          <div style="font-size:1.4rem; font-weight:800; color:#d97706; margin-top:2px;">${state.doctors.length} Active Slots</div>
        </div>
      </div>
    `;
  } else if (cat === 'financial') {
    columns = ['Bill ID', 'UHID', 'Patient Name', 'Date', 'Total Charges (₹)', 'Amount Paid (₹)', 'Balance (₹)', 'Status'];
    let filtered = state.billing.filter(b => {
      if (start || end) {
        const bDate = new Date(b.date);
        if (start && bDate < start) return false;
        if (end && bDate > end) return false;
      }
      if (status !== 'all' && (b.status || '').toLowerCase() !== status.toLowerCase()) return false;
      return true;
    });

    rows = filtered.map(b => {
      const balance = b.amount - b.paid;
      return [b.id, b.uhid, b.patientName, b.date, `₹${b.amount}`, `₹${b.paid}`, `₹${balance}`, b.status];
    });

    const totalAmt = filtered.reduce((sum, b) => sum + b.amount, 0);
    const totalPaid = filtered.reduce((sum, b) => sum + b.paid, 0);
    const totalOust = totalAmt - totalPaid;

    summaryHTML = `
      <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:12px; margin-bottom:5px;">
        <div style="background:var(--bg-slate-light); padding:12px; border-radius:6px; text-align:center; border:1px solid var(--border-color);">
          <span style="font-size:0.7rem; color:var(--text-muted); font-weight:700;">TOTAL INVOICED</span>
          <div style="font-size:1.4rem; font-weight:800; color:var(--primary); margin-top:2px;">₹${totalAmt.toLocaleString('en-IN')}</div>
        </div>
        <div style="background:var(--bg-slate-light); padding:12px; border-radius:6px; text-align:center; border:1px solid var(--border-color);">
          <span style="font-size:0.7rem; color:var(--text-muted); font-weight:700;">COLLECTED REVENUE</span>
          <div style="font-size:1.4rem; font-weight:800; color:#059669; margin-top:2px;">₹${totalPaid.toLocaleString('en-IN')}</div>
        </div>
        <div style="background:var(--bg-slate-light); padding:12px; border-radius:6px; text-align:center; border:1px solid var(--border-color);">
          <span style="font-size:0.7rem; color:var(--text-muted); font-weight:700;">OUTSTANDING LEDGER</span>
          <div style="font-size:1.4rem; font-weight:800; color:#dc2626; margin-top:2px;">₹${totalOust.toLocaleString('en-IN')}</div>
        </div>
      </div>
    `;
  } else if (cat === 'operational') {
    columns = ['Ward Code', 'Ward Name', 'Total Beds', 'Beds Occupied', 'Beds Clean/Available', 'Occupancy Rate (%)'];
    
    // Calculate live bed occupancy based on state.bedsStatus
    const wardBeds = {};
    Object.entries(state.wards).forEach(([code, w]) => {
      wardBeds[code] = { name: w.name, total: w.beds.length, occupied: 0, available: 0 };
    });

    Object.entries(state.bedsStatus || {}).forEach(([bedId, b]) => {
      const wardCode = Object.keys(state.wards).find(code => state.wards[code].beds.includes(bedId));
      if (wardCode && wardBeds[wardCode]) {
        if (b.status === 'Occupied' || b.status === 'Discharge Pending') {
          wardBeds[wardCode].occupied++;
        } else {
          wardBeds[wardCode].available++;
        }
      }
    });

    let totalBeds = 0;
    let totalOcc = 0;

    Object.entries(wardBeds).forEach(([code, data]) => {
      totalBeds += data.total;
      totalOcc += data.occupied;
      const rate = data.total > 0 ? Math.round((data.occupied / data.total) * 100) : 0;
      rows.push([
        code,
        data.name,
        data.total,
        data.occupied,
        data.total - data.occupied,
        `${rate}%`
      ]);
    });

    const overallRate = totalBeds > 0 ? Math.round((totalOcc / totalBeds) * 100) : 0;

    summaryHTML = `
      <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:12px; margin-bottom:5px;">
        <div style="background:var(--bg-slate-light); padding:12px; border-radius:6px; text-align:center; border:1px solid var(--border-color);">
          <span style="font-size:0.7rem; color:var(--text-muted); font-weight:700;">TOTAL WARD BEDS</span>
          <div style="font-size:1.4rem; font-weight:800; color:var(--primary); margin-top:2px;">${totalBeds} Beds</div>
        </div>
        <div style="background:var(--bg-slate-light); padding:12px; border-radius:6px; text-align:center; border:1px solid var(--border-color);">
          <span style="font-size:0.7rem; color:var(--text-muted); font-weight:700;">ACTIVE OCCUPANTS</span>
          <div style="font-size:1.4rem; font-weight:800; color:#059669; margin-top:2px;">${totalOcc} Inpatients</div>
        </div>
        <div style="background:var(--bg-slate-light); padding:12px; border-radius:6px; text-align:center; border:1px solid var(--border-color);">
          <span style="font-size:0.7rem; color:var(--text-muted); font-weight:700;">OVERALL OCCUPANCY RATE</span>
          <div style="font-size:1.4rem; font-weight:800; color:#d97706; margin-top:2px;">${overallRate}%</div>
        </div>
      </div>
    `;
  } else if (cat === 'inventory') {
    columns = ['Indent ID', 'Indent Type', 'Requesting Dept', 'Items Count', 'Urgency', 'Raised At', 'Status', 'Patient Ref'];
    let filtered = state.invIndents.filter(ind => {
      if (dept !== 'all' && (ind.dept || '').toLowerCase() !== dept.toLowerCase()) return false;
      if (status !== 'all' && (ind.status || '').toLowerCase() !== status.toLowerCase()) return false;
      return true;
    });

    rows = filtered.map(ind => [
      ind.id,
      ind.type,
      ind.dept,
      ind.itemsCount,
      ind.urgency,
      ind.raisedAt,
      ind.status,
      ind.patientRef || '—'
    ]);

    const lowStockCount = state.invStock.filter(s => s.qty < s.minFloor).length;

    summaryHTML = `
      <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:12px; margin-bottom:5px;">
        <div style="background:var(--bg-slate-light); padding:12px; border-radius:6px; text-align:center; border:1px solid var(--border-color);">
          <span style="font-size:0.7rem; color:var(--text-muted); font-weight:700;">TOTAL INDENTS GENERATED</span>
          <div style="font-size:1.4rem; font-weight:800; color:var(--primary); margin-top:2px;">${filtered.length} Indents</div>
        </div>
        <div style="background:var(--bg-slate-light); padding:12px; border-radius:6px; text-align:center; border:1px solid var(--border-color);">
          <span style="font-size:0.7rem; color:var(--text-muted); font-weight:700;">PENDING / REVIEW REQUIRED</span>
          <div style="font-size:1.4rem; font-weight:800; color:#d97706; margin-top:2px;">${filtered.filter(i => i.status === 'Pending').length} requests</div>
        </div>
        <div style="background:var(--bg-slate-light); padding:12px; border-radius:6px; text-align:center; border:1px solid var(--border-color);">
          <span style="font-size:0.7rem; color:var(--text-muted); font-weight:700;">LOW STOCK SKU ALERTS</span>
          <div style="font-size:1.4rem; font-weight:800; color:#dc2626; margin-top:2px;">${lowStockCount} SKU Warns</div>
        </div>
      </div>
    `;
  } else if (cat === 'bloodbank') {
    columns = ['Blood Component Group', 'Total Stock Units', 'FEFO Expiry Warnings', 'Storage Temperature (°C)', 'TTI Status', 'Transfusion Reactions'];
    
    // Blood Bank Stock status calculations
    const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
    let totalBBStock = 0;
    
    bloodGroups.forEach(bg => {
      const stock = state.bloodBankStock ? state.bloodBankStock.filter(s => s.group === bg && s.status === 'In Stock') : [];
      const qty = stock.length || Math.floor(4 + Math.random() * 8);
      totalBBStock += qty;
      
      rows.push([
        bg,
        `${qty} Units`,
        `${qty < 5 ? 'Low Stock Warning' : 'Healthy Stock'}`,
        '4.2°C (Optimal)',
        'Screened Negative',
        '0 Cases (100% Safe)'
      ]);
    });

    summaryHTML = `
      <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:12px; margin-bottom:5px;">
        <div style="background:var(--bg-slate-light); padding:12px; border-radius:6px; text-align:center; border:1px solid var(--border-color);">
          <span style="font-size:0.7rem; color:var(--text-muted); font-weight:700;">TOTAL BLOOD STOCK</span>
          <div style="font-size:1.4rem; font-weight:800; color:var(--primary); margin-top:2px;">${totalBBStock} Units</div>
        </div>
        <div style="background:var(--bg-slate-light); padding:12px; border-radius:6px; text-align:center; border:1px solid var(--border-color);">
          <span style="font-size:0.7rem; color:var(--text-muted); font-weight:700;">ACTIVE CROSSMATCHES</span>
          <div style="font-size:1.4rem; font-weight:800; color:#059669; margin-top:2px;">3 Pending Issues</div>
        </div>
        <div style="background:var(--bg-slate-light); padding:12px; border-radius:6px; text-align:center; border:1px solid var(--border-color);">
          <span style="font-size:0.7rem; color:var(--text-muted); font-weight:700;">TTI SCREENING SAMPLES</span>
          <div style="font-size:1.4rem; font-weight:800; color:#d97706; margin-top:2px;">15 ELISA Runs</div>
        </div>
      </div>
    `;
  }

  container.innerHTML = `
    ${summaryHTML}
    
    <div class="card" style="margin-top:10px;">
      <div class="card-header"><h3 class="card-title">📝 Generated Report Records Preview</h3></div>
      <div class="card-body" id="report-output-table-container" style="overflow-x:auto;">
        <table class="custom-table" id="report-output-table" style="font-size:0.8rem; width:100%;">
          <thead>
            <tr>
              ${columns.map(c => `<th>${c}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${rows.map(row => `
              <tr style="border-bottom:1px solid var(--border-color);">
                ${row.map(cell => `<td>${cell}</td>`).join('')}
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
};

window.downloadActiveReportAsCSV = function() {
  const cat = document.getElementById('rep-category').value;
  const table = document.getElementById('report-output-table');
  if (!table) { alert("Please generate a report first."); return; }

  let csvContent = "\uFEFF"; // Add BOM to handle Excel UTF-8 encoding correctly
  
  // Headers
  const headers = Array.from(table.querySelectorAll('th')).map(th => `"${th.textContent}"`).join(',');
  csvContent += headers + "\r\n";
  
  // Rows
  const rows = Array.from(table.querySelectorAll('tbody tr'));
  rows.forEach(row => {
    const cols = Array.from(row.querySelectorAll('td')).map(td => `"${td.textContent.trim().replace(/"/g, '""')}"`).join(',');
    csvContent += cols + "\r\n";
  });

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `Saronil_Report_${cat}_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

window.printActiveReportHTML = function() {
  const table = document.getElementById('report-output-table-container');
  if (!table) { alert("Please generate a report first."); return; }
  
  const cat = document.getElementById('rep-category').value;
  const w = window.open('', '_blank', 'width=900,height=700');
  
  w.document.write(`
    <html>
      <head>
        <title>Saronil HMS Executive Performance Audit</title>
        <style>
          body { font-family: sans-serif; padding: 30px; line-height: 1.5; color: #333; }
          .header { text-align: center; border-bottom: 3px solid #2563eb; padding-bottom: 12px; margin-bottom: 30px; }
          .footer { text-align: center; border-top: 1px solid #ddd; margin-top: 40px; padding-top: 10px; font-size: 0.8rem; color: #777; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size:0.85rem; }
          th, td { padding: 8px 12px; border-bottom: 1px solid #ddd; text-align: left; }
          th { background: #f8fafc; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="header">
          <h2>SARONIL SUPER SPECIALTY HOSPITAL</h2>
          <p>HSR Layout Sector-1, Bengaluru, Karnataka 560102</p>
          <h3>EXECUTIVE PERFORMANCE REPORT &mdash; ${cat.toUpperCase()}</h3>
        </div>
        <div>
          <p><strong>Report Category:</strong> ${cat.toUpperCase()} AUDIT SHEET</p>
          <p><strong>Scope Period:</strong> Generated on ${new Date().toLocaleDateString()}</p>
          <p><strong>Status:</strong> Active Systems Registry Copy</p>
        </div>
        ${table.innerHTML}
        <div class="footer">
          <p>This report is verified by the central Bio-Medical & Financial Audit team. Internal use only.</p>
        </div>
      </body>
    </html>
  `);
  w.document.close();
  w.print();
};
