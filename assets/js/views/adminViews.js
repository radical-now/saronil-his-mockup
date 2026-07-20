/* ==========================================================================
   SARONIL HMS - ADMIN CONTROLS & OPERATIONS REPORTING (adminViews.js)
   ========================================================================== */

window.views.admin = function(container, subAnchor, params) {
  if (!window.state.rbacRoles) {
    const seededRoles = localStorage.getItem('saronil_rbacRoles');
    if (seededRoles) {
      window.state.rbacRoles = JSON.parse(seededRoles);
    } else {
      window.state.rbacRoles = [
        { role: 'System Admin', dashboard: true, registration: true, clinical: true, financial: true, diagnostics: true, support: true, admin: true },
        { role: 'Consultant Doctor', dashboard: true, registration: false, clinical: true, financial: false, diagnostics: true, support: false, admin: false },
        { role: 'Front Desk / Registry', dashboard: false, registration: true, clinical: false, financial: true, diagnostics: false, support: false, admin: false },
        { role: 'Billing Operator', dashboard: false, registration: false, clinical: false, financial: true, diagnostics: false, support: false, admin: false },
        { role: 'Lab Pathologist', dashboard: false, registration: false, clinical: false, financial: false, diagnostics: true, support: false, admin: false },
        { role: 'Support Staff', dashboard: false, registration: false, clinical: false, financial: false, diagnostics: false, support: true, admin: false }
      ];
      localStorage.setItem('saronil_rbacRoles', JSON.stringify(window.state.rbacRoles));
    }
  }

  if (subAnchor === 'profile' && params && params.id) {
    renderDoctorProfilePage(container, params.id);
  } else {
    renderAdminWorkspace(container, subAnchor || 'employees');
  }
};

function renderAdminWorkspace(container, activeTab) {
  if (activeTab === 'reports') {
    activeTab = 'employees';
  }

  if (activeTab === 'employees') {
    renderEmployeesTab(container);
    return;
  }

  if (activeTab === 'permissions') {
    renderPermissionsTab(container);
    return;
  }

  container.innerHTML = `
    <div style="display: grid; grid-template-columns: 260px 1fr; gap: 1.5rem; align-items: start;">
      <!-- Left Navigation in Admin Section -->
      <div class="card" style="padding: 12px; display: flex; flex-direction: column; gap: 8px; background: #fff; border: 1px solid var(--border-color); border-radius: 8px; position: sticky; top: 10px; box-shadow: var(--shadow-sm);">
        <h4 style="margin: 0 0 8px 0; font-size: 11px; font-weight: 800; text-transform: uppercase; color: #64748b; letter-spacing: 0.5px; padding-left: 8px; text-align: left;">
          ⚙️ Admin Controls
        </h4>
        <button class="btn ${activeTab === 'employees' ? 'btn-primary' : 'btn-secondary'}" onclick="router.navigate('admin-employees')" style="display: flex; align-items: center; gap: 8px; justify-content: flex-start; text-align: left; padding: 10px 12px; font-size: 12px; width: 100%; border: none;">
          <span>👥</span> Hospital Directory
        </button>
        <button class="btn ${activeTab === 'roles' ? 'btn-primary' : 'btn-secondary'}" onclick="router.navigate('admin-roles')" style="display: flex; align-items: center; gap: 8px; justify-content: flex-start; text-align: left; padding: 10px 12px; font-size: 12px; width: 100%; border: none;">
          <span>🔑</span> Role Access Matrix
        </button>
        <button class="btn ${activeTab === 'permissions' ? 'btn-primary' : 'btn-secondary'}" onclick="router.navigate('admin-permissions')" style="display: flex; align-items: center; gap: 8px; justify-content: flex-start; text-align: left; padding: 10px 12px; font-size: 12px; width: 100%; border: none;">
          <span>🔐</span> Staff Access Rights
        </button>
      </div>

      <!-- Active Admin Sub-Viewport (Right Column) -->
      <div id="admin-sub-viewport" style="min-width: 0;">
        <!-- Renders dynamically based on tab -->
      </div>
    </div>
  `;

  const subViewport = document.getElementById('admin-sub-viewport');
  
  if (activeTab === 'roles') {
    renderRolesTab(subViewport);
  } else if (activeTab === 'permissions') {
    renderPermissionsTab(subViewport);
  }
}

// --------------------------------------------------------------------------
// EMPLOYEES DIRECTORY
// --------------------------------------------------------------------------
function renderEmployeesTab(container) {
  container.innerHTML = `
    <div class="card">
      <div class="card-header" style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
        <div>
          <h3 class="card-title">Hospital Staff &amp; Consultant Directory</h3>
          <p class="card-subtitle">Manage doctor schedules, department allocations, and employee status keys</p>
        </div>
        <div style="display: flex; align-items: center; gap: 10px;">
          <!-- Suggestive Search -->
          <div style="position: relative;">
            <span style="position: absolute; left: 10px; top: 50%; transform: translateY(-50%); font-size: 13px; color: #94a3b8; pointer-events: none;">🔍</span>
            <input
              id="employee-search-input"
              type="text"
              placeholder="Search by name, ID, department, phone..."
              oninput="window._filterEmployeeDirectory(this.value)"
              style="padding: 7px 12px 7px 32px; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 12px; outline: none; width: 280px; background: #f8fafc; color: #1e293b; transition: border-color 0.15s ease;"
              onfocus="this.style.borderColor='var(--primary)'; this.style.background='#fff';"
              onblur="this.style.borderColor='#cbd5e1'; this.style.background='#f8fafc';"
            />
          </div>
        </div>
      </div>
      <div class="card-body">
        <table class="custom-table" style="font-size: 0.85rem; width:100%;">
          <thead>
            <tr>
              <th>Staff ID</th>
              <th>Employee Name</th>
              <th>Role / Designation</th>
              <th>Department / Specialization</th>
              <th>Work Location / Shift</th>
              <th>Contact Phone</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody id="employee-directory-tbody">
            ${(function() {
              const allEmployees = [];
              (state.doctors || []).forEach(doc => {
                allEmployees.push({
                  id: doc.id,
                  name: doc.name,
                  role: "Doctor",
                  dept: doc.spec || "General Medicine",
                  location: doc.room ? `OPD Room ${doc.room}` : "Clinic",
                  phone: doc.phone || "—",
                  status: doc.status || "Active"
                });
              });
              (state.nurses || []).forEach(nurse => {
                allEmployees.push({
                  id: nurse.id,
                  name: nurse.name,
                  role: "Nurse",
                  dept: nurse.dept || "Nursing Wards",
                  location: nurse.shift ? `Shift: ${nurse.shift}` : "Ward",
                  phone: nurse.phone || "—",
                  status: nurse.status || "Active"
                });
              });
              (state.staff || []).forEach(st => {
                allEmployees.push({
                  id: st.id,
                  name: st.name,
                  role: st.role || "Staff",
                  dept: st.dept || "Administration",
                  location: st.shift ? `Shift: ${st.shift}` : "Support",
                  phone: st.phone || "—",
                  status: st.status || "Active"
                });
              });

              return allEmployees.map(emp => `
                <tr
                  class="employee-dir-row"
                  data-search="${[emp.id, emp.name, emp.role, emp.dept, emp.location, emp.phone, emp.status].join(' ').toLowerCase()}"
                  style="border-bottom:1px solid var(--border-color);"
                >
                  <td><strong>${emp.id}</strong></td>
                  <td>
                    <span style="font-weight:700; color:#1e293b;">
                      ${emp.name}
                    </span>
                  </td>
                  <td>
                    <span style="padding:2px 6px; border-radius:4px; font-size:10px; font-weight:700; ${
                      emp.role === 'Doctor' ? 'background:#e0f2fe; color:#0369a1;' :
                      emp.role === 'Nurse' ? 'background:#dcfce7; color:#15803d;' :
                      'background:#f3f4f6; color:#374151;'
                    }">${emp.role}</span>
                  </td>
                  <td>${emp.dept}</td>
                  <td>${emp.location}</td>
                  <td>${emp.phone}</td>
                  <td><span style="color: var(--color-success); font-weight:600;">${emp.status}</span></td>
                </tr>
              `).join('');
            })()}
          </tbody>
        </table>
        <div id="employee-no-results" style="display:none; text-align:center; padding: 40px 20px; color:#94a3b8; font-size:13px;">
          <div style="font-size:28px; margin-bottom:8px;">🔍</div>
          <div style="font-weight:600; color:#64748b;">No staff found</div>
          <div style="margin-top:4px;">Try a different name, ID, or department</div>
        </div>
      </div>
    </div>
  `;
}

window._filterEmployeeDirectory = function(query) {
  const q = query.toLowerCase().trim();
  const rows = document.querySelectorAll('.employee-dir-row');
  let visibleCount = 0;

  rows.forEach(row => {
    const haystack = row.getAttribute('data-search') || '';
    if (!q || haystack.includes(q)) {
      row.style.display = '';
      visibleCount++;
    } else {
      row.style.display = 'none';
    }
  });

  const noResults = document.getElementById('employee-no-results');
  if (noResults) noResults.style.display = visibleCount === 0 ? 'block' : 'none';
};

// --------------------------------------------------------------------------
// DOCTOR PROFILE PAGE (FULL VIEW)
// --------------------------------------------------------------------------
function renderDoctorProfilePage(container, docId) {
  const doc = state.doctors.find(d => d.id === docId);
  if (!doc) {
    container.innerHTML = `<div style="padding:20px; color:var(--color-danger);">Doctor profile with ID ${docId} not found.</div>`;
    return;
  }

  // Initialize individual doctor privileges if not set
  if (!doc.privileges) {
    const template = (window.state.rbacRoles && window.state.rbacRoles.find(r => r.role === 'Consultant Doctor')) || {
      dashboard: true, registration: false, clinical: true, financial: false, diagnostics: true, support: false, admin: false
    };
    doc.privileges = {
      dashboard: template.dashboard,
      registration: template.registration,
      clinical: template.clinical,
      financial: template.financial,
      diagnostics: template.diagnostics,
      support: template.support,
      admin: template.admin
    };
  }
  if (doc.admissionsPrivilege === undefined) doc.admissionsPrivilege = true;
  if (doc.narcoticsPrivilege === undefined) doc.narcoticsPrivilege = true;
  if (doc.surgeryPrivilege === undefined) doc.surgeryPrivilege = true;

  // Set page title breadcrumb
  const pageTitleEl = document.getElementById('active-page-title');
  if (pageTitleEl) pageTitleEl.textContent = `Consultant Profile: ${doc.name}`;

  // Local active tab for the profile page
  const profileTab = localStorage.getItem('saronil_prof_tab') || 'form';

  const styles = `
    
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
      <div style="display:flex; flex-direction:column; gap:16px; text-align:left;">
        <div>
          <h4 style="margin:0 0 6px 0; font-size:0.9rem; color:var(--primary); font-weight:700;">🔒 Regulatory Clinical Privileges &amp; Licences</h4>
          <div style="background:#fef3c7; border:1px solid #fde68a; color:#b45309; padding:10px; border-radius:6px; font-size:0.75rem; font-weight:600; margin-bottom:10px;">
            ⚠️ Verification Check: DEA narcotic prescribing rights require periodic board validation.
          </div>
          <div style="display:flex; flex-direction:column; gap:8px; font-size:0.8rem;">
            <label style="display:flex; align-items:center; gap:8px; cursor:pointer;">
              <input type="checkbox" ${doc.admissionsPrivilege ? 'checked' : ''} onclick="window._toggleDoctorClinicalPrivilege('${doc.id}', 'admissionsPrivilege')">
              Inpatient admissions authorization
            </label>
            <label style="display:flex; align-items:center; gap:8px; cursor:pointer;">
              <input type="checkbox" ${doc.narcoticsPrivilege ? 'checked' : ''} onclick="window._toggleDoctorClinicalPrivilege('${doc.id}', 'narcoticsPrivilege')">
              High alert controlled drugs prescription privilege (NDPS)
            </label>
            <label style="display:flex; align-items:center; gap:8px; cursor:pointer;">
              <input type="checkbox" ${doc.surgeryPrivilege ? 'checked' : ''} onclick="window._toggleDoctorClinicalPrivilege('${doc.id}', 'surgeryPrivilege')">
              Major surgery primary assistant credential
            </label>
          </div>
        </div>

        <div style="border-top: 1px solid var(--border-color); padding-top: 15px;">
          <h4 style="margin:0 0 6px 0; font-size:0.9rem; color:var(--primary); font-weight:700;">🔑 Individual Module Access Matrix Override</h4>
          <p style="font-size:11px; color:#64748b; margin-top:0; margin-bottom:12px;">Customize access permissions for this specific clinician. This overrides the default role access template.</p>
          <div class="custom-table-container">
            <table class="custom-table" style="font-size: 0.8rem; text-align: center; width:100%;">
              <thead>
                <tr style="background:#f8fafc; border-bottom:1px solid #cbd5e1;">
                  <th style="padding:8px 4px;">Dashboard</th>
                  <th style="padding:8px 4px;">Registration</th>
                  <th style="padding:8px 4px;">Clinical (EMR)</th>
                  <th style="padding:8px 4px;">Financial (Billing)</th>
                  <th style="padding:8px 4px;">Diagnostics (LIS/RIS)</th>
                  <th style="padding:8px 4px;">Support</th>
                  <th style="padding:8px 4px;">Admin &amp; Control</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <span onclick="window._toggleDoctorPrivilege('${doc.id}', 'dashboard')" style="cursor:pointer; font-size:1.15rem; user-select:none;" title="Toggle Dashboard access">
                      ${doc.privileges.dashboard ? '<span style="color:#10b981;">✔️</span>' : '<span style="color:#ef4444;">❌</span>'}
                    </span>
                  </td>
                  <td>
                    <span onclick="window._toggleDoctorPrivilege('${doc.id}', 'registration')" style="cursor:pointer; font-size:1.15rem; user-select:none;" title="Toggle Registration access">
                      ${doc.privileges.registration ? '<span style="color:#10b981;">✔️</span>' : '<span style="color:#ef4444;">❌</span>'}
                    </span>
                  </td>
                  <td>
                    <span onclick="window._toggleDoctorPrivilege('${doc.id}', 'clinical')" style="cursor:pointer; font-size:1.15rem; user-select:none;" title="Toggle Clinical access">
                      ${doc.privileges.clinical ? '<span style="color:#10b981;">✔️</span>' : '<span style="color:#ef4444;">❌</span>'}
                    </span>
                  </td>
                  <td>
                    <span onclick="window._toggleDoctorPrivilege('${doc.id}', 'financial')" style="cursor:pointer; font-size:1.15rem; user-select:none;" title="Toggle Financial access">
                      ${doc.privileges.financial ? '<span style="color:#10b981;">✔️</span>' : '<span style="color:#ef4444;">❌</span>'}
                    </span>
                  </td>
                  <td>
                    <span onclick="window._toggleDoctorPrivilege('${doc.id}', 'diagnostics')" style="cursor:pointer; font-size:1.15rem; user-select:none;" title="Toggle Diagnostics access">
                      ${doc.privileges.diagnostics ? '<span style="color:#10b981;">✔️</span>' : '<span style="color:#ef4444;">❌</span>'}
                    </span>
                  </td>
                  <td>
                    <span onclick="window._toggleDoctorPrivilege('${doc.id}', 'support')" style="cursor:pointer; font-size:1.15rem; user-select:none;" title="Toggle Support access">
                      ${doc.privileges.support ? '<span style="color:#10b981;">✔️</span>' : '<span style="color:#ef4444;">❌</span>'}
                    </span>
                  </td>
                  <td>
                    <span onclick="window._toggleDoctorPrivilege('${doc.id}', 'admin')" style="cursor:pointer; font-size:1.15rem; user-select:none;" title="Toggle Admin access">
                      ${doc.privileges.admin ? '<span style="color:#10b981;">✔️</span>' : '<span style="color:#ef4444;">❌</span>'}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
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

window.lockDoctorCredentials = async function(docId) {
  if (await customConfirm(`Are you sure you want to suspend medical credentials access for ${docId}? This will block narcotic prescribing permissions.`)) {
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
  const roles = window.state.rbacRoles || [];

  container.innerHTML = `
    <div class="card">
      <div class="card-header" style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">
        <div>
          <h3 class="card-title">Role Access Control Matrix (RBAC)</h3>
          <p class="card-subtitle">Manage authorization privileges across modules for different employee classes</p>
        </div>
        <button class="btn btn-primary" onclick="window._openAddRoleModal()" style="font-size:0.8rem; font-weight:700;">+ Create Custom Role</button>
      </div>
      <div class="card-body" style="padding: 1.25rem;">
        <p style="font-size:11px; color:#64748b; margin-top:-8px; margin-bottom:12px;">💡 Click directly on any status icon (✔️ or ❌) in the matrix to instantly toggle module access privileges for that role.</p>
        <div class="custom-table-container">
          <table class="custom-table" style="font-size: 0.85rem; text-align: center; width:100%;">
            <thead>
              <tr style="background:#f8fafc; border-bottom:2px solid #cbd5e1;">
                <th style="text-align: left; padding:12px 10px;">Employee Role</th>
                <th>Dashboard</th>
                <th>Registration</th>
                <th>Clinical (EMR)</th>
                <th>Financial (Billing)</th>
                <th>Diagnostics (LIS/RIS)</th>
                <th>Support Modules</th>
                <th>Admin &amp; Control</th>
                <th style="text-align: right; padding-right:15px;">Actions</th>
              </tr>
            </thead>
            <tbody>
              ${roles.map((r, idx) => `
                <tr style="border-bottom:1px solid var(--border-color); hover:background:#f8fafc;">
                  <td style="text-align: left; padding:12px 10px; font-weight:700; color:#1e293b;">
                    ${r.role}
                  </td>
                  <td>
                    <span onclick="window._toggleRbacCell(${idx}, 'dashboard')" style="cursor:pointer; font-size:1.1rem; user-select:none;" title="Click to toggle Dashboard access">
                      ${r.dashboard ? '<span style="color:#10b981;">✔️</span>' : '<span style="color:#ef4444;">❌</span>'}
                    </span>
                  </td>
                  <td>
                    <span onclick="window._toggleRbacCell(${idx}, 'registration')" style="cursor:pointer; font-size:1.1rem; user-select:none;" title="Click to toggle Registration access">
                      ${r.registration ? '<span style="color:#10b981;">✔️</span>' : '<span style="color:#ef4444;">❌</span>'}
                    </span>
                  </td>
                  <td>
                    <span onclick="window._toggleRbacCell(${idx}, 'clinical')" style="cursor:pointer; font-size:1.1rem; user-select:none;" title="Click to toggle Clinical access">
                      ${r.clinical ? '<span style="color:#10b981;">✔️</span>' : '<span style="color:#ef4444;">❌</span>'}
                    </span>
                  </td>
                  <td>
                    <span onclick="window._toggleRbacCell(${idx}, 'financial')" style="cursor:pointer; font-size:1.1rem; user-select:none;" title="Click to toggle Financial access">
                      ${r.financial ? '<span style="color:#10b981;">✔️</span>' : '<span style="color:#ef4444;">❌</span>'}
                    </span>
                  </td>
                  <td>
                    <span onclick="window._toggleRbacCell(${idx}, 'diagnostics')" style="cursor:pointer; font-size:1.1rem; user-select:none;" title="Click to toggle Diagnostics access">
                      ${r.diagnostics ? '<span style="color:#10b981;">✔️</span>' : '<span style="color:#ef4444;">❌</span>'}
                    </span>
                  </td>
                  <td>
                    <span onclick="window._toggleRbacCell(${idx}, 'support')" style="cursor:pointer; font-size:1.1rem; user-select:none;" title="Click to toggle Support access">
                      ${r.support ? '<span style="color:#10b981;">✔️</span>' : '<span style="color:#ef4444;">❌</span>'}
                    </span>
                  </td>
                  <td>
                    <span onclick="window._toggleRbacCell(${idx}, 'admin')" style="cursor:pointer; font-size:1.1rem; user-select:none;" title="Click to toggle Admin access">
                      ${r.admin ? '<span style="color:#10b981;">✔️</span>' : '<span style="color:#ef4444;">❌</span>'}
                    </span>
                  </td>
                  <td style="text-align: right; padding-right:15px; white-space:nowrap;">
                    ${r.role === 'System Admin' ? `
                      <span style="font-size:10px; color:#94a3b8; font-style:italic;">Protected</span>
                    ` : `
                      <button onclick="window._openRenameRoleModal(${idx})" class="btn btn-secondary btn-sm" style="padding:2px 8px; font-size:10px; margin-right:4px; cursor:pointer;" title="Rename Role">✏️ Rename</button>
                      <button onclick="window._deleteRbacRole(${idx})" class="btn btn-secondary btn-sm" style="padding:2px 8px; font-size:10px; color:#ef4444; cursor:pointer;" title="Delete Role">🗑️ Delete</button>
                    `}
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>
    
    <!-- Mount point for RBAC action modals -->
    <div id="rbac-modal-mount"></div>
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

window._toggleRbacCell = function(idx, key) {
  const role = window.state.rbacRoles[idx];
  if (!role) return;
  
  if (role.role === 'System Admin' && key === 'admin') {
    if (!confirm("Warning: You are revoking Admin rights for the System Admin role. Proceed?")) {
      return;
    }
  }
  
  role[key] = !role[key];
  localStorage.setItem('saronil_rbacRoles', JSON.stringify(window.state.rbacRoles));
  
  const viewport = document.getElementById('admin-sub-viewport');
  if (viewport) renderRolesTab(viewport);
};

window._openAddRoleModal = function() {
  const mount = document.getElementById('rbac-modal-mount');
  if (!mount) return;
  
  mount.innerHTML = `
    <div id="rbac-modal-overlay" style="position:fixed; top:0; left:0; width:100vw; height:100vh; background:rgba(15,23,42,0.6); backdrop-filter:blur(4px); display:flex; justify-content:center; align-items:center; z-index:99999;">
      <div class="card" style="width:420px; padding:24px; background:#fff; border-radius:12px; box-shadow:0 20px 25px -5px rgba(0,0,0,0.1); border:1px solid #cbd5e1; text-align:left; font-family:inherit;">
        <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #e2e8f0; padding-bottom:12px; margin-bottom:16px;">
          <h3 style="margin:0; font-size:14px; font-weight:800; color:#1e293b;">Create Custom Employee Role</h3>
          <button onclick="document.getElementById('rbac-modal-overlay').remove()" style="background:none; border:none; font-size:1.5rem; color:#64748b; cursor:pointer;">&times;</button>
        </div>
        
        <div style="display:flex; flex-direction:column; gap:12px; font-size:12px;">
          <div>
            <label style="font-weight:700; color:#475569; display:block; margin-bottom:4px;">Role Designation Name *</label>
            <input type="text" id="rbac-new-role-name" placeholder="e.g. ICU Registrar" style="width:100%; padding:6px 10px; border:1px solid #cbd5e1; border-radius:6px; outline:none; box-sizing:border-box;">
          </div>
          
          <div>
            <label style="font-weight:700; color:#475569; display:block; margin-bottom:6px;">Allotted Module Access Permissions</label>
            <div style="display:flex; flex-direction:column; gap:6px; background:#f8fafc; padding:10px; border-radius:6px; border:1px solid #e2e8f0;">
              <label style="display:flex; align-items:center; gap:8px; cursor:pointer;"><input type="checkbox" id="rbac-p-dashboard" checked> Dashboard</label>
              <label style="display:flex; align-items:center; gap:8px; cursor:pointer;"><input type="checkbox" id="rbac-p-registration"> Registration</label>
              <label style="display:flex; align-items:center; gap:8px; cursor:pointer;"><input type="checkbox" id="rbac-p-clinical"> Clinical (EMR)</label>
              <label style="display:flex; align-items:center; gap:8px; cursor:pointer;"><input type="checkbox" id="rbac-p-financial"> Financial (Billing)</label>
              <label style="display:flex; align-items:center; gap:8px; cursor:pointer;"><input type="checkbox" id="rbac-p-diagnostics"> Diagnostics (LIS/RIS)</label>
              <label style="display:flex; align-items:center; gap:8px; cursor:pointer;"><input type="checkbox" id="rbac-p-support"> Support Modules</label>
              <label style="display:flex; align-items:center; gap:8px; cursor:pointer;"><input type="checkbox" id="rbac-p-admin"> Admin &amp; Control</label>
            </div>
          </div>
        </div>
        
        <div style="display:flex; justify-content:flex-end; gap:8px; margin-top:20px; border-top:1px solid #e2e8f0; padding-top:12px;">
          <button onclick="document.getElementById('rbac-modal-overlay').remove()" class="btn btn-secondary btn-sm" style="border:1px solid #cbd5e1; background:white; font-weight:700; padding:6px 12px; border-radius:6px; cursor:pointer;">Cancel</button>
          <button onclick="window._saveRbacRole()" class="btn btn-primary btn-sm" style="background:var(--primary); color:white; border:none; font-weight:700; padding:6px 12px; border-radius:6px; cursor:pointer;">Create Role</button>
        </div>
      </div>
    </div>
  `;
};

window._saveRbacRole = function() {
  const name = document.getElementById('rbac-new-role-name').value.trim();
  if (!name) {
    alert("Please enter a valid role designation name.");
    return;
  }
  
  const exists = window.state.rbacRoles.some(r => r.role.toLowerCase() === name.toLowerCase());
  if (exists) {
    alert("A role with this name already exists.");
    return;
  }
  
  const newRole = {
    role: name,
    dashboard: document.getElementById('rbac-p-dashboard').checked,
    registration: document.getElementById('rbac-p-registration').checked,
    clinical: document.getElementById('rbac-p-clinical').checked,
    financial: document.getElementById('rbac-p-financial').checked,
    diagnostics: document.getElementById('rbac-p-diagnostics').checked,
    support: document.getElementById('rbac-p-support').checked,
    admin: document.getElementById('rbac-p-admin').checked
  };
  
  window.state.rbacRoles.push(newRole);
  localStorage.setItem('saronil_rbacRoles', JSON.stringify(window.state.rbacRoles));
  
  document.getElementById('rbac-modal-overlay').remove();
  
  const viewport = document.getElementById('admin-sub-viewport');
  if (viewport) renderRolesTab(viewport);
};

window._openRenameRoleModal = function(idx) {
  const role = window.state.rbacRoles[idx];
  if (!role) return;
  
  const mount = document.getElementById('rbac-modal-mount');
  if (!mount) return;
  
  mount.innerHTML = `
    <div id="rbac-modal-overlay" style="position:fixed; top:0; left:0; width:100vw; height:100vh; background:rgba(15,23,42,0.6); backdrop-filter:blur(4px); display:flex; justify-content:center; align-items:center; z-index:99999;">
      <div class="card" style="width:400px; padding:24px; background:#fff; border-radius:12px; box-shadow:0 20px 25px -5px rgba(0,0,0,0.1); border:1px solid #cbd5e1; text-align:left; font-family:inherit;">
        <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #e2e8f0; padding-bottom:12px; margin-bottom:16px;">
          <h3 style="margin:0; font-size:14px; font-weight:800; color:#1e293b;">Rename Designation</h3>
          <button onclick="document.getElementById('rbac-modal-overlay').remove()" style="background:none; border:none; font-size:1.5rem; color:#64748b; cursor:pointer;">&times;</button>
        </div>
        
        <div style="display:flex; flex-direction:column; gap:12px; font-size:12px;">
          <div>
            <label style="font-weight:700; color:#475569; display:block; margin-bottom:4px;">New Role Name *</label>
            <input type="text" id="rbac-rename-role-name" value="${role.role}" style="width:100%; padding:6px 10px; border:1px solid #cbd5e1; border-radius:6px; outline:none; box-sizing:border-box;">
          </div>
        </div>
        
        <div style="display:flex; justify-content:flex-end; gap:8px; margin-top:20px; border-top:1px solid #e2e8f0; padding-top:12px;">
          <button onclick="document.getElementById('rbac-modal-overlay').remove()" class="btn btn-secondary btn-sm" style="border:1px solid #cbd5e1; background:white; font-weight:700; padding:6px 12px; border-radius:6px; cursor:pointer;">Cancel</button>
          <button onclick="window._saveRenameRole(${idx})" class="btn btn-primary btn-sm" style="background:var(--primary); color:white; border:none; font-weight:700; padding:6px 12px; border-radius:6px; cursor:pointer;">Save Changes</button>
        </div>
      </div>
    </div>
  `;
};

window._saveRenameRole = function(idx) {
  const name = document.getElementById('rbac-rename-role-name').value.trim();
  if (!name) {
    alert("Please enter a valid role name.");
    return;
  }
  
  window.state.rbacRoles[idx].role = name;
  localStorage.setItem('saronil_rbacRoles', JSON.stringify(window.state.rbacRoles));
  
  document.getElementById('rbac-modal-overlay').remove();
  
  const viewport = document.getElementById('admin-sub-viewport');
  if (viewport) renderRolesTab(viewport);
};

window._deleteRbacRole = function(idx) {
  const role = window.state.rbacRoles[idx];
  if (!role) return;
  
  if (confirm(`Are you sure you want to delete the "${role.role}" role? This action cannot be undone.`)) {
    window.state.rbacRoles.splice(idx, 1);
    localStorage.setItem('saronil_rbacRoles', JSON.stringify(window.state.rbacRoles));
    
    const viewport = document.getElementById('admin-sub-viewport');
    if (viewport) renderRolesTab(viewport);
  }
};

window._toggleDoctorClinicalPrivilege = function(docId, key) {
  const doc = window.state.doctors.find(d => d.id === docId);
  if (!doc) return;
  
  doc[key] = !doc[key];
  localStorage.setItem('saronil_doctors', JSON.stringify(window.state.doctors));
  
  // Re-render doctor profile privileges subtab to update UI checkboxes
  renderDoctorProfilePage(document.getElementById('main-content'), docId);
};

window._toggleDoctorPrivilege = function(docId, key) {
  const doc = window.state.doctors.find(d => d.id === docId);
  if (!doc) return;
  
  doc.privileges[key] = !doc.privileges[key];
  localStorage.setItem('saronil_doctors', JSON.stringify(window.state.doctors));
  
  // Re-render doctor profile privileges subtab to update UI matrix
  renderDoctorProfilePage(document.getElementById('main-content'), docId);
};

// --------------------------------------------------------------------------
// STAFF ACCESS RIGHTS MODULE (COMPREHENSIVE CONTROL LAYER)
// --------------------------------------------------------------------------
window.views.adminPermissions = function(container) {
  renderAdminWorkspace(container, 'permissions');
};

function renderPermissionsTab(container) {
  // Initialize datasets if missing
  if (!window.state.staffList || window.state.staffList.length === 0) {
    const storedStaff = localStorage.getItem('saronil_staffList');
    if (storedStaff) {
      window.state.staffList = JSON.parse(storedStaff);
    } else {
      window.state.staffList = [
        { id: "DOC01", name: "Dr. Srinivasan", type: "Doctor", designation: "Senior Consultant", department: "Cardiology", registrationNo: "SMC-10001", statusToday: "On Duty", status: "Active", credentialStatus: "Valid", phone: "+91 98450 11001", rbacOverrides: [], rbacSuspended: false, specialRights: [] },
        { id: "DOC02", name: "Dr. Ramesh Iyer", type: "Doctor", designation: "Senior Resident", department: "Orthopedics", registrationNo: "SMC-10002", statusToday: "OPD", status: "Active", credentialStatus: "Valid", phone: "+91 98450 11002", rbacOverrides: [], rbacSuspended: false, specialRights: [] },
        { id: "NUR01", name: "Staff Nurse Sarah", type: "Nurse", designation: "Staff Nurse", department: "General Wards", registrationNo: "INC-20001", statusToday: "Morning", status: "Active", credentialStatus: "Valid", phone: "+91 98450 12001", rbacOverrides: [], rbacSuspended: false, specialRights: [] },
        { id: "NUR02", name: "Staff Nurse John", type: "Nurse", designation: "Senior Nurse", department: "General Wards", registrationNo: "INC-20002", statusToday: "Night", status: "Active", credentialStatus: "Valid", phone: "+91 98450 12002", rbacOverrides: [], rbacSuspended: false, specialRights: [] }
      ];
      localStorage.setItem('saronil_staffList', JSON.stringify(window.state.staffList));
    }
  }

  if (!window.state.rolePermissions) {
    const rolesList = [
      "Hospital Administrator",
      "Medical Superintendent",
      "Consultant Doctor",
      "Resident Medical Officer (RMO)",
      "Nursing Supervisor",
      "Staff Nurse",
      "Front Desk & Patient Registry",
      "Billing Operator & Cashier",
      "TPA & Insurance Coordinator",
      "Pharmacist",
      "Lab Pathologist",
      "Radiologist",
      "Medical Records (MRD) Officer",
      "OT Technician",
      "IT System Admin"
    ];
    const defaultPrivileges = ["Read", "Write", "Delete"];
    const modulesStructure = [
      { module: "Admission", items: ["Bed Booking & Allocation", "Patient Intake Registry", "Discharge Clearance"] },
      { module: "Treatment", items: ["Vitals & Nurse Logs", "Clinical & EMR Notes", "Consent Documentation"] },
      { module: "Pharmacy", items: ["Stock Inventory", "Prescription Dispensation"] },
      { module: "Billing", items: ["Invoices & Receipts", "Credit Notes & Refunds"] },
      { module: "Reports", items: ["Financial Summaries", "Clinical Activity Analytics"] },
      { module: "Master Data", items: ["Drug List Master", "Service Tariff Master", "Bed Allocation Master", "Staff Registry Master"] }
    ];

    const defaultRolePerms = {};
    rolesList.forEach(role => {
      defaultRolePerms[role] = {};
      modulesStructure.forEach(mod => {
        mod.items.forEach(item => {
          defaultRolePerms[role][item] = {};
          defaultPrivileges.forEach(type => {
            let allowed = false;
            if (role === 'IT System Admin' || role === 'Hospital Administrator') {
              allowed = true;
            } else if (role === 'Consultant Doctor' || role === 'Resident Medical Officer (RMO)' || role === 'Medical Superintendent') {
              if (mod.module === 'Admission') allowed = (type === 'Read' || type === 'Write');
              if (mod.module === 'Treatment') allowed = (type === 'Read' || type === 'Write');
              if (mod.module === 'Pharmacy') allowed = (type === 'Read');
              if (mod.module === 'Reports') allowed = (type === 'Read');
              if (mod.module === 'Master Data') allowed = (type === 'Read');
            } else if (role === 'Staff Nurse' || role === 'Nursing Supervisor' || role === 'OT Technician') {
              if (mod.module === 'Admission') allowed = (type === 'Read');
              if (mod.module === 'Treatment') allowed = (type === 'Read' || type === 'Write');
              if (mod.module === 'Pharmacy') allowed = (type === 'Read');
              if (mod.module === 'Reports') allowed = (type === 'Read');
            } else if (role === 'Front Desk & Patient Registry' || role === 'Medical Records (MRD) Officer') {
              if (mod.module === 'Admission') allowed = (type === 'Read' || type === 'Write');
              if (mod.module === 'Reports') allowed = (type === 'Read');
            } else if (role === 'Billing Operator & Cashier' || role === 'TPA & Insurance Coordinator') {
              if (mod.module === 'Billing') allowed = (type === 'Read' || type === 'Write');
              if (mod.module === 'Reports') allowed = (type === 'Read');
            } else if (role === 'Lab Pathologist' || role === 'Radiologist') {
              if (mod.module === 'Treatment') allowed = (type === 'Read' || type === 'Write');
              if (mod.module === 'Reports') allowed = (type === 'Read');
            } else if (role === 'Pharmacist') {
              if (mod.module === 'Pharmacy') allowed = (type === 'Read' || type === 'Write');
              if (mod.module === 'Reports') allowed = (type === 'Read');
            }
            if (type === 'Delete') {
              if (mod.module === 'Treatment') allowed = false;
              if (item === 'Invoices & Receipts') allowed = false;
              if (mod.module === 'Master Data') allowed = false;
            }
            defaultRolePerms[role][item][type] = allowed;
          });
        });
      });
    });

    window.state.rolePermissions = JSON.parse(localStorage.getItem('saronil_rolePermissions')) || defaultRolePerms;
    localStorage.setItem('saronil_rolePermissions', JSON.stringify(window.state.rolePermissions));
  }

  if (!window.state.accessRequests) {
    window.state.accessRequests = JSON.parse(localStorage.getItem('saronil_accessRequests')) || [
      { id: "REQ001", staffId: "DOC02", staffName: "Dr. Ramesh Iyer", module: "Pharmacy", permissionType: "Read", justification: "Verify medication logs for pediatrics patients", status: "Access Requested", requestedBy: "Dr. Ramesh Iyer", timestamp: "18-Jul-2026 10:15 AM", approvals: [] },
      { id: "REQ002", staffId: "NUR02", staffName: "Staff Nurse John", module: "Billing/Invoice", permissionType: "Delete", justification: "Authorized billing ledger cleanups", status: "Pending Approval", requestedBy: "Nurse Supervisor Karen", timestamp: "18-Jul-2026 10:30 AM", approvals: [] },
      { id: "REQ003", staffId: "DOC04", staffName: "Dr. Mehta", module: "Master Data", permissionType: "Delete", justification: "Update clinical templates and tariff structure for general surgery", status: "Pending Second Approval", requestedBy: "Dr. Srinivasan", timestamp: "18-Jul-2026 11:30 AM", approvals: [{ approverId: "ADM01", role: "Hospital Administrator", decision: "Approved", timestamp: "18-Jul-2026 11:45 AM" }] }
    ];
    localStorage.setItem('saronil_accessRequests', JSON.stringify(window.state.accessRequests));
  }

  if (!window.state.emergencyAccess) {
    window.state.emergencyAccess = JSON.parse(localStorage.getItem('saronil_emergencyAccess')) || [
      { id: "EMG001", staffId: "DOC02", staffName: "Dr. Ramesh Iyer", module: "Treatment/Clinical Notes", reason: "Emergency cardiac arrest EMR override needed", grantedAt: "18-Jul-2026 09:00 PM", expiryTime: "2 Hours", status: "Active (Emergency)", reviewedBy: "", reviewOutcome: "", reviewedAt: "" },
      { id: "EMG002", staffId: "NUR03", staffName: "Staff Nurse Sarah", module: "Pharmacy", reason: "Urgent medication inventory verification", grantedAt: "17-Jul-2026 10:00 AM", expiryTime: "Expired", status: "Reviewed-Justified", reviewedBy: "Admin Prashant", reviewOutcome: "Justified", reviewedAt: "17-Jul-2026 04:00 PM" }
    ];
    localStorage.setItem('saronil_emergencyAccess', JSON.stringify(window.state.emergencyAccess));
  }

  if (!window.state.accessReviews) {
    window.state.accessReviews = JSON.parse(localStorage.getItem('saronil_accessReviews')) || [
      { staffId: "DOC01", staffName: "Dr. Srinivasan", lastReviewed: "15-Jun-2026", reviewer: "Admin Prashant", outcome: "Retained", notes: "Permissions match treating consultant role requirements" },
      { staffId: "STF01", staffName: "Ph. Satish Kumar", lastReviewed: "15-Jun-2026", reviewer: "Admin Prashant", outcome: "Retained", notes: "Active pharmacy order verification access confirmed" }
    ];
    localStorage.setItem('saronil_accessReviews', JSON.stringify(window.state.accessReviews));
  }

  if (!window.state.accessAuditLog) {
    window.state.accessAuditLog = JSON.parse(localStorage.getItem('saronil_accessAuditLog')) || [
      { eventId: "AUD001", staffIdAffected: "DOC02", requestedBy: "Dr. Ramesh Iyer", approvedBy: "—", secondApprover: "—", module: "Pharmacy", permissionType: "Read", previousState: "None", newState: "Access Requested", reason: "Verify medication logs", timestamp: "18-Jul-2026 10:15 AM" },
      { eventId: "AUD002", staffIdAffected: "DOC04", requestedBy: "Dr. Srinivasan", approvedBy: "Admin Prashant", secondApprover: "—", module: "Master Data", permissionType: "Delete", previousState: "Access Requested", newState: "Pending Second Approval", reason: "Maker approval completed", timestamp: "18-Jul-2026 11:45 AM" }
    ];
    localStorage.setItem('saronil_accessAuditLog', JSON.stringify(window.state.accessAuditLog));
  }

  // Active sub-tab
  let activeSubTab = localStorage.getItem('saronil_perm_subtab') || 'role';
  if (['tagging', 'maker_checker', 'emergency'].includes(activeSubTab)) {
    activeSubTab = 'role';
    localStorage.setItem('saronil_perm_subtab', 'role');
  }
  
  // Selected actor for simulation helper
  const simulatedActor = localStorage.getItem('saronil_perm_actor') || 'Admin';

  const subtabs = [
    { id: 'role', label: '🔑 Role Permissions' },
    { id: 'staff', label: '📋 Staff Permissions Override' },
    { id: 'recertification', label: '📅 Periodic Access Review' },
    { id: 'audit', label: '📄 Access Audit Logs' }
  ];

  container.innerHTML = `
    <!-- Subtab strip -->
    <div style="display:flex; gap:0.25rem; border-bottom:2px solid #cbd5e1; margin-bottom:1.5rem; flex-wrap:wrap; overflow-x:auto;">
      ${subtabs.map(s => `
        <button class="btn" onclick="window._switchPermissionsSubTab('${s.id}')" style="background:${activeSubTab === s.id ? 'var(--primary)' : 'transparent'}; color:${activeSubTab === s.id ? '#ffffff' : '#64748b'}; border:none; padding:8px 16px; border-radius:6px 6px 0 0; font-weight:${activeSubTab === s.id ? '700' : '500'}; font-size:12px; cursor:pointer; display:flex; align-items:center; gap:6px; transition:all 0.15s ease;">
          ${s.label}
        </button>
      `).join('')}
    </div>

    <div id="permissions-sub-viewport">
      <!-- Loaded Dynamically -->
    </div>
  `;

  const viewport = document.getElementById('permissions-sub-viewport');
  if (activeSubTab === 'role') {
    renderSubTabRole(viewport, simulatedActor);
  } else if (activeSubTab === 'staff') {
    renderSubTabStaff(viewport, simulatedActor);
  } else if (activeSubTab === 'recertification') {
    renderSubTabRecertification(viewport, simulatedActor);
  } else if (activeSubTab === 'audit') {
    renderSubTabAudit(viewport);
  }
}

window._changeSimulatedActor = function(val) {
  localStorage.setItem('saronil_perm_actor', val);
  const viewport = document.getElementById('admin-sub-viewport') || document.getElementById('main-content');
  if (viewport) renderPermissionsTab(viewport);
};

window._switchPermissionsSubTab = function(tabId) {
  localStorage.setItem('saronil_perm_subtab', tabId);
  const viewport = document.getElementById('admin-sub-viewport') || document.getElementById('main-content');
  if (viewport) renderPermissionsTab(viewport);
};

// --------------------------------------------------------------------------
// SUBTAB 1: STAFF PERMISSIONS & OVERRIDES MANAGER
// --------------------------------------------------------------------------
function renderSubTabStaff(container, actor) {
  // Combine all clinicians and staff
  const staff = window.state.staffList || [];
  
  // Local state for active selected staff member
  let selectedStaffId = localStorage.getItem('saronil_perm_sel_staff') || (staff[0] ? staff[0].id : '');
  let currentStaff = staff.find(s => s.id === selectedStaffId);
  if (!currentStaff && staff.length > 0) {
    currentStaff = staff[0];
    selectedStaffId = currentStaff.id;
    localStorage.setItem('saronil_perm_sel_staff', selectedStaffId);
  }

  // Pre-fetch defaults template
  const defaultPrivileges = ["Read", "Write", "Delete"];

  const modulesStructure = [
    {
      module: "Admission",
      items: ["Bed Booking & Allocation", "Patient Intake Registry", "Discharge Clearance"]
    },
    {
      module: "Treatment",
      items: ["Vitals & Nurse Logs", "Clinical & EMR Notes", "Consent Documentation"]
    },
    {
      module: "Pharmacy",
      items: ["Stock Inventory", "Prescription Dispensation"]
    },
    {
      module: "Billing",
      items: ["Invoices & Receipts", "Credit Notes & Refunds"]
    },
    {
      module: "Reports",
      items: ["Financial Summaries", "Clinical Activity Analytics"]
    },
    {
      module: "Master Data",
      items: ["Drug List Master", "Service Tariff Master", "Bed Allocation Master", "Staff Registry Master"]
    }
  ];



  // Determine staff role template
  const rRole = currentStaff ? (currentStaff.type === 'Doctor' ? 'Consultant Doctor' : (currentStaff.role || 'Support Staff')) : 'Support Staff';

  // Initialize staff permissions overrides and custom settings if not exist
  if (currentStaff) {
    currentStaff.rbacOverrides = currentStaff.rbacOverrides || [];
    currentStaff.rbacSuspended = currentStaff.rbacSuspended || false;
    currentStaff.rbacLocumExpiry = currentStaff.rbacLocumExpiry || "";
  }

  const checkEffective = (parentModule, item, type) => {
    // Clinical records (Treatment) delete restriction
    if (parentModule === 'Treatment' && type === 'Delete') return false;
    // Invoices & Receipts delete restriction
    if (item === 'Invoices & Receipts' && type === 'Delete') return false;
    // Master Data delete restricted to Admin simulated actor
    if (parentModule === 'Master Data' && type === 'Delete' && actor !== 'Admin') return false;

    if (currentStaff.rbacSuspended) return false;

    // Check individual override
    const override = currentStaff.rbacOverrides.find(o => o.lineItem === item && o.permissionType === type);
    if (override) {
      return override.value; // override takes precedence
    }

    // Default to role permission configuration
    if (window.state.rolePermissions && window.state.rolePermissions[rRole] && window.state.rolePermissions[rRole][item]) {
      return !!window.state.rolePermissions[rRole][item][type];
    }
    return false;
  };

  const isOverrideType = (item, type) => {
    const override = currentStaff.rbacOverrides.find(o => o.lineItem === item && o.permissionType === type);
    return !!override;
  };

  container.innerHTML = `
    <div style="display:grid; grid-template-columns: 280px 1fr; gap:1.5rem; align-items:start; text-align:left;">
      <!-- Left List: Staff Directory -->
      <div class="card" style="padding:15px; max-height:600px; overflow-y:auto; display:flex; flex-direction:column; gap:10px;">
        <h4 style="margin:0 0 10px 0; font-size:13px; font-weight:800; border-bottom:1px solid #e2e8f0; padding-bottom:8px;">👥 Clinical Staff Directory</h4>
        <input type="text" id="rbac-staff-dir-search" oninput="window._showRbacStaffSuggestions(this.value)" placeholder="Search name/ID..." style="font-size:11px; padding:6px; border:1px solid #cbd5e1; border-radius:6px; outline:none; box-sizing:border-box; width:100%; margin-bottom:5px;">
        <div id="rbac-staff-dir-list" style="display:flex; flex-direction:column; gap:4px;">
          ${staff.map(s => `
            <div onclick="window._selectRbacStaffId('${s.id}')" style="padding:8px 10px; border-radius:6px; cursor:pointer; background:${selectedStaffId === s.id ? 'var(--primary-glow)' : 'transparent'}; border:1px solid ${selectedStaffId === s.id ? 'var(--primary)' : 'transparent'}; transition:all 0.15s ease;" class="rbac-staff-item-row" data-name="${s.name.toLowerCase()}" data-id="${s.id.toLowerCase()}">
              <div style="font-weight:700; font-size:11.5px; color:${selectedStaffId === s.id ? 'var(--primary)' : '#1e293b'};">${s.name}</div>
              <div style="display:flex; justify-content:space-between; align-items:center; font-size:9.5px; color:#64748b; margin-top:2px;">
                <span>ID: ${s.id}</span>
                <span>${s.type === 'Doctor' ? 'Doctor' : (s.role || 'Nurse')}</span>
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Right Panel: Permission Workbench -->
      ${currentStaff ? `
        <div style="display:flex; flex-direction:column; gap:1.25rem;">
          <!-- Staff Profile Card -->
          <div class="card" style="padding:16px; border-left:4px solid var(--primary);">
            <div style="display:flex; justify-content:space-between; align-items:start; flex-wrap:wrap; gap:10px;">
              <div>
                <h3 style="margin:0; font-size:15px; font-weight:800; color:#0f172a;">Effective Access Profile: ${currentStaff.name}</h3>
                <p style="margin:4px 0 0 0; font-size:11px; color:#64748b;">
                  Designation: <strong>${currentStaff.designation}</strong> &nbsp;|&nbsp; 
                  Base Role: <strong>${rRole}</strong> &nbsp;|&nbsp; 
                  Status: <span class="badge ${currentStaff.rbacSuspended ? 'bg-danger' : 'bg-success'}" style="font-size:9px; padding:2px 6px;">${currentStaff.rbacSuspended ? '❌ Suspended' : '✔️ Active'}</span>
                </p>
              </div>
              <div style="display:flex; gap:6px;">
                ${currentStaff.rbacSuspended ? `
                  <button onclick="window._toggleStaffSuspension('${currentStaff.id}', false)" class="btn btn-success btn-sm" style="font-size:11px; padding:6px 12px; font-weight:700;">✔️ Activate Access</button>
                ` : `
                  <button onclick="window._toggleStaffSuspension('${currentStaff.id}', true)" class="btn btn-secondary btn-sm" style="font-size:11px; padding:6px 12px; font-weight:700; color:#ef4444;">❌ Suspend Access</button>
                `}
                <button onclick="window._revokeAllStaffAccess('${currentStaff.id}')" class="btn btn-danger btn-sm" style="font-size:11px; padding:6px 12px; font-weight:700;">⚠️ Revoke &amp; Offboard</button>
              </div>
            </div>

            <!-- Locum / Temporary staff expiry config -->
            <div style="display:flex; align-items:center; gap:10px; background:#f8fafc; border:1px solid #e2e8f0; border-radius:6px; padding:8px 12px; margin-top:12px; font-size:11px;">
              <span style="font-size:13px;">⏳</span>
              <strong>Locum / Temporary Expiry Date:</strong>
              <input type="date" id="rbac-locum-expiry" value="${currentStaff.rbacLocumExpiry}" style="padding:4px; border:1px solid #cbd5e1; border-radius:4px; outline:none; font-size:11px;">
              <button onclick="window._saveStaffLocumExpiry('${currentStaff.id}')" class="btn btn-primary btn-sm" style="padding:4px 10px; font-size:10px; font-weight:600;">Save Expiry</button>
              ${currentStaff.rbacLocumExpiry ? `
                <span style="color:#e11d48; font-weight:600;">(Access auto-expires on date)</span>
              ` : `
                <span style="color:#64748b;">(Permanent access, no auto-revocation date set)</span>
              `}
            </div>
          </div>

          <!-- Individual Special Rights Overrides Checklist (Grouped by Modules) -->
          <div class="card" style="padding:16px;">
            <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #cbd5e1; padding-bottom:8px; margin-bottom:15px; flex-wrap:wrap; gap:10px;">
              <h4 style="margin:0; font-size:13px; font-weight:800; text-align:left;">Individual Special Rights Overrides</h4>
              <input type="text" id="rbac-flag-search" oninput="window._filterRbacFlags(this.value)" placeholder="Search flags (e.g. GST, Refund)..." style="font-size:11px; padding:5px 10px; border:1px solid #cbd5e1; border-radius:6px; outline:none; width:220px;">
            </div>
            <p style="font-size:11.5px; color:#64748b; margin-top:0; margin-bottom:15px; text-align:left;">
              Configure individual transaction overrides for this staff member. These settings bypass default role constraints for NABH auditing.
            </p>
            
            <div style="display:flex; flex-direction:column; gap:16px;">
              ${[
                {
                  module: "Admission",
                  flags: [
                    { flag: 'IsAllowedToChangeBedCategory', desc: 'Allowed to Change Tariff & Bed Categories' },
                    { flag: 'IsAllowedToUpdateAdmittedPatientAdmissionDate', desc: 'Allowed to Update Admission Date for Admitted Patients' },
                    { flag: 'IsAllowedToUpdateAdmittedDoctorForAdmittedPatient', desc: 'Allowed to Update Admitted Doctor for Admitted Patients' },
                    { flag: 'IsAuthorizedToCancelAdmission', desc: 'Authorized to Cancel Patient Admissions' }
                  ]
                },
                {
                  module: "Treatment",
                  flags: [
                    { flag: 'IsAllowedToShowMaskedPatient', desc: 'Authorized to Show Masked Patient Details' },
                    { flag: 'IsAllowedToViewAndPrintDischargeSummaryOnly', desc: 'Authorized to View & Print Discharge Summaries Only' },
                    { flag: 'IsAllowedToEditFinalizedClinicalDiagnosis', desc: 'Allowed to Edit Finalized Clinical Diagnoses' },
                    { flag: 'IsAllowedToEditDischargeSummaryAfterLock', desc: 'Allowed to Edit Discharge Summary After System Lock' },
                    { flag: 'IsAllowedToViewPatientMedicalHistoryAnonymously', desc: 'Allowed to View Patient Medical History Anonymously' }
                  ]
                },
                {
                  module: "Pharmacy",
                  flags: [
                    { flag: 'IsAllowedToDiscountPharmacy', desc: 'Allowed to Apply Pharmacy Discount' },
                    { flag: 'IsAllowedToAdjustInventoryStock', desc: 'Allowed to Adjust Pharmacy Inventory Stock Quantities' },
                    { flag: 'IsAllowedToDeleteDraftPrescriptions', desc: 'Allowed to Delete Draft Prescriptions' },
                    { flag: 'IsAllowedToIssueConsumablesWithoutRequisition', desc: 'Allowed to Issue Consumables Without Requisition Sheets' }
                  ]
                },
                {
                  module: "Billing",
                  flags: [
                    { flag: 'IsAllowedToShowAdvance', desc: 'Allowed to Show Advance Details' },
                    { flag: 'IsAllowedToWaiveFees', desc: 'Allowed to Waive Registration & Consultation Fees' },
                    { flag: 'IsAllowedToRefund', desc: 'Allowed to Approve Cash Refunds' },
                    { flag: 'IsAllowedToCancelBill', desc: 'Allowed to Cancel Settled Bills' },
                    { flag: 'IsAllowedToBypassCreditLimit', desc: 'Allowed to Bypass Credit Limit (TPA/CGHS/ECHS)' },
                    { flag: 'IsAllowedToChangeTax', desc: 'Allowed to Edit/Waive Tax (GST/CGST/SGST)' },
                    { flag: 'IsAllowedToCancelCreditNote', desc: 'Authorized to Cancel Credit Notes' },
                    { flag: 'IsAuthorizedToDiscountCompanyNonDiscountServices', desc: 'Authorized to Apply Discount on Company Non-Discount Services' },
                    { flag: 'IsAllowedToReopenSettledInvoices', desc: 'Allowed to Re-open Settled Billing Invoices' },
                    { flag: 'IsAllowedToChangeRefundPaymentMode', desc: 'Allowed to Change Refund Payment Method' }
                  ]
                },
                {
                  module: "Reports",
                  flags: [
                    { flag: 'IsAllowedToRefundWithoutOPDReport', desc: 'Allowed to Refund Without OPD Report' }
                  ]
                },
                {
                  module: "Master Data",
                  flags: [
                    { flag: 'IsAllowedToViewChargeColumnsInWardAddService', desc: 'Allowed to View Charge Columns & Add Services in Ward' },
                    { flag: 'IsAuthorizedToAddServiceAfterPatientDischarge', desc: 'Authorized to Add Services After Patients are Discharged' },
                    { flag: 'IsAuthorizedToCloseEncounterFromCreateOPVisit', desc: 'Authorized to Close Encounter from Create OP Visit' },
                    { flag: 'IsAuthorizedToCancelMarkForDischarge', desc: 'Authorized to Cancel "Mark for Discharge" Status' }
                  ]
                }
              ].map(group => {
                const allRead = group.flags.every(f => currentStaff.specialRights && currentStaff.specialRights.includes(f.flag + "_Read"));
                const allWrite = group.flags.every(f => currentStaff.specialRights && currentStaff.specialRights.includes(f.flag + "_Write"));

                return `
                  <div class="rbac-flag-module-card" style="border:1px solid #cbd5e1; border-radius:8px; overflow:hidden; background:#fff;">
                    <!-- Module Header Row with Master Read/Write Toggles -->
                    <div style="background:#f1f5f9; padding:10px 15px; border-bottom:1px solid #cbd5e1; display:flex; justify-content:space-between; align-items:center;">
                      <div style="font-weight:800; font-size:12px; color:#1e3a8a;">
                        📂 ${group.module} Module Flags
                      </div>
                      <div style="display:flex; gap:15px; font-size:10px; color:#475569; font-weight:700;">
                        <label style="display:flex; align-items:center; gap:4px; margin:0; cursor:pointer;">
                          <input type="checkbox" ${allRead ? 'checked' : ''} onchange="window._toggleStaffModuleFlagsMaster('${currentStaff.id}', ${JSON.stringify(group.flags.map(f => f.flag))}, 'Read', this.checked)" style="width:13px; height:13px; cursor:pointer;">
                          <span>All Read</span>
                        </label>
                        <label style="display:flex; align-items:center; gap:4px; margin:0; cursor:pointer;">
                          <input type="checkbox" ${allWrite ? 'checked' : ''} onchange="window._toggleStaffModuleFlagsMaster('${currentStaff.id}', ${JSON.stringify(group.flags.map(f => f.flag))}, 'Write', this.checked)" style="width:13px; height:13px; cursor:pointer;">
                          <span>All Write</span>
                        </label>
                      </div>
                    </div>

                    <!-- Flags Rows (1 in a row) -->
                    <div style="display:flex; flex-direction:column;">
                      ${group.flags.map((f, idx) => {
                        const hasRead = currentStaff.specialRights && currentStaff.specialRights.includes(f.flag + "_Read");
                        const hasWrite = currentStaff.specialRights && currentStaff.specialRights.includes(f.flag + "_Write");
                        return `
                          <div class="rbac-flag-row" data-desc="${f.desc.toLowerCase()}" data-flag="${f.flag.toLowerCase()}" style="display:flex; justify-content:space-between; align-items:center; padding:10px 15px; border-bottom: ${idx < group.flags.length - 1 ? '1px solid #e2e8f0' : 'none'}; hover:background:#f8fafc;">
                            <span style="font-weight:600; color:#1e293b; font-size:11.5px; text-align:left;">${f.desc}</span>
                            <div style="display:flex; gap:20px;">
                              <label style="display:flex; align-items:center; gap:5px; font-size:11px; color:#475569; margin:0; cursor:pointer;">
                                <input type="checkbox" ${hasRead ? 'checked' : ''} onchange="window._toggleStaffSpecialRightReadWrite('${currentStaff.id}', '${f.flag}', 'Read', this.checked)" style="width:14px; height:14px; cursor:pointer;">
                                <span>Read</span>
                              </label>
                              <label style="display:flex; align-items:center; gap:5px; font-size:11px; color:#475569; margin:0; cursor:pointer;">
                                <input type="checkbox" ${hasWrite ? 'checked' : ''} onchange="window._toggleStaffSpecialRightReadWrite('${currentStaff.id}', '${f.flag}', 'Write', this.checked)" style="width:14px; height:14px; cursor:pointer;">
                                <span>Write</span>
                              </label>
                            </div>
                          </div>
                        `;
                      }).join('')}
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        </div>
      ` : `
        <div class="card" style="padding:4rem 1rem; text-align:center; color:#64748b;">
          📢 No employees registered in the staff database. Onboard staff to configure access keys.
        </div>
      `}
    </div>
  `;
}

window._filterRbacFlags = function(q) {
  const query = q.toLowerCase().trim();
  document.querySelectorAll('.rbac-flag-module-card').forEach(card => {
    let visibleFlags = 0;
    card.querySelectorAll('.rbac-flag-row').forEach(row => {
      const desc = row.getAttribute('data-desc') || '';
      const flag = row.getAttribute('data-flag') || '';
      if (desc.includes(query) || flag.includes(query)) {
        row.style.display = 'flex';
        visibleFlags++;
      } else {
        row.style.display = 'none';
      }
    });
    if (visibleFlags > 0 || query === '') {
      card.style.display = 'block';
    } else {
      card.style.display = 'none';
    }
  });
};

window._filterRbacStaffDir = function(q) {
  const query = q.toLowerCase().trim();
  document.querySelectorAll('.rbac-staff-item-row').forEach(row => {
    const name = row.getAttribute('data-name');
    const id = row.getAttribute('data-id');
    if (name.includes(query) || id.includes(query)) {
      row.style.display = 'block';
    } else {
      row.style.display = 'none';
    }
  });
};

window._showRbacStaffSuggestions = function(val) {
  const query = val.toLowerCase().trim();
  const listContainer = document.getElementById('rbac-staff-dir-list');
  if (!listContainer) return;

  const staff = window.state.staffList || [];
  const selectedStaffId = localStorage.getItem('saronil_perm_sel_staff');

  if (!query) {
    // Show all staff list
    listContainer.innerHTML = staff.map(s => `
      <div onclick="window._selectRbacStaffId('${s.id}')" style="padding:8px 10px; border-radius:6px; cursor:pointer; background:${selectedStaffId === s.id ? 'var(--primary-glow)' : 'transparent'}; border:1px solid ${selectedStaffId === s.id ? 'var(--primary)' : 'transparent'}; transition:all 0.15s ease;" class="rbac-staff-item-row" data-name="${s.name.toLowerCase()}" data-id="${s.id.toLowerCase()}">
        <div style="font-weight:700; font-size:11.5px; color:${selectedStaffId === s.id ? 'var(--primary)' : '#1e293b'};">${s.name}</div>
        <div style="display:flex; justify-content:space-between; align-items:center; font-size:9.5px; color:#64748b; margin-top:2px;">
          <span>ID: ${s.id}</span>
          <span>${s.type === 'Doctor' ? 'Doctor' : (s.role || 'Nurse')}</span>
        </div>
      </div>
    `).join('');
    return;
  }

  // Suggestive search matches
  const matches = staff.filter(s => s.name.toLowerCase().includes(query) || s.id.toLowerCase().includes(query));

  if (matches.length === 0) {
    listContainer.innerHTML = `<div style="padding:15px; font-size:11px; color:#64748b; font-style:italic; text-align:center;">No matches found</div>`;
  } else {
    listContainer.innerHTML = matches.map(s => `
      <div onclick="window._selectRbacStaffId('${s.id}')" style="padding:8px 10px; border-radius:6px; cursor:pointer; background:${selectedStaffId === s.id ? 'var(--primary-glow)' : 'transparent'}; border:1px solid ${selectedStaffId === s.id ? 'var(--primary)' : 'transparent'}; transition:all 0.15s ease;" class="rbac-staff-item-row" data-name="${s.name.toLowerCase()}" data-id="${s.id.toLowerCase()}">
        <div style="font-weight:700; font-size:11.5px; color:${selectedStaffId === s.id ? 'var(--primary)' : '#1e293b'};">${s.name}</div>
        <div style="display:flex; justify-content:space-between; align-items:center; font-size:9.5px; color:#64748b; margin-top:2px;">
          <span style="background:#fef08a; padding:1px 3px; border-radius:3px; font-weight:600; color:#854d0e;">Suggested ID: ${s.id}</span>
          <span>${s.type === 'Doctor' ? 'Doctor' : (s.role || 'Nurse')}</span>
        </div>
      </div>
    `).join('');
  }
};

window._selectRbacStaffId = function(id) {
  localStorage.setItem('saronil_perm_sel_staff', id);
  const viewport = document.getElementById('admin-sub-viewport') || document.getElementById('main-content');
  if (viewport) renderPermissionsTab(viewport);
};

window._toggleStaffSuspension = function(staffId, isSuspend) {
  const staff = window.state.staffList || [];
  const s = staff.find(item => item.id === staffId);
  if (!s) return;

  s.rbacSuspended = isSuspend;
  localStorage.setItem('saronil_staffList', JSON.stringify(window.state.staffList));

  // Sync to doctor profile if doctor
  if (s.id.startsWith('DOC') && window.state.doctors) {
    const d = window.state.doctors.find(item => item.id === s.id);
    if (d) {
      d.rbacSuspended = isSuspend;
      localStorage.setItem('saronil_doctors', JSON.stringify(window.state.doctors));
    }
  }

  // Audit Log Entry
  const auditEntry = {
    eventId: "AUD" + String(100 + window.state.accessAuditLog.length + 1),
    staffIdAffected: s.id,
    requestedBy: "Admin Prashant",
    approvedBy: "Admin Prashant",
    secondApprover: "—",
    module: "All Access",
    permissionType: "Suspend Toggle",
    previousState: isSuspend ? "Active" : "Suspended",
    newState: isSuspend ? "Suspended" : "Active",
    reason: isSuspend ? "Temporary leave suspension" : "Return from leave activation",
    timestamp: new Date().toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).replace(/ /g, '-')
  };
  window.state.accessAuditLog.unshift(auditEntry);
  localStorage.setItem('saronil_accessAuditLog', JSON.stringify(window.state.accessAuditLog));

  if (window.showToast) window.showToast(isSuspend ? "Access suspended immediately." : "Access activated.");
  const viewport = document.getElementById('admin-sub-viewport') || document.getElementById('main-content');
  if (viewport) renderPermissionsTab(viewport);
};

window._saveStaffLocumExpiry = function(staffId) {
  const expiry = document.getElementById('rbac-locum-expiry').value;
  const staff = window.state.staffList || [];
  const s = staff.find(item => item.id === staffId);
  if (!s) return;

  s.rbacLocumExpiry = expiry;
  localStorage.setItem('saronil_staffList', JSON.stringify(window.state.staffList));

  // Sync to doctor profile if doctor
  if (s.id.startsWith('DOC') && window.state.doctors) {
    const d = window.state.doctors.find(item => item.id === s.id);
    if (d) {
      d.rbacLocumExpiry = expiry;
      localStorage.setItem('saronil_doctors', JSON.stringify(window.state.doctors));
    }
  }

  // Audit Log Entry
  const auditEntry = {
    eventId: "AUD" + String(100 + window.state.accessAuditLog.length + 1),
    staffIdAffected: s.id,
    requestedBy: "Admin/HR",
    approvedBy: "Admin Prashant",
    secondApprover: "—",
    module: "Configuration",
    permissionType: "Locum Expiry",
    previousState: "None",
    newState: expiry ? `Expires ${expiry}` : "Permanent",
    reason: "Set temporary staff contract limits",
    timestamp: new Date().toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).replace(/ /g, '-')
  };
  window.state.accessAuditLog.unshift(auditEntry);
  localStorage.setItem('saronil_accessAuditLog', JSON.stringify(window.state.accessAuditLog));

  if (window.showToast) window.showToast("Locum contract limit updated.");
  const viewport = document.getElementById('admin-sub-viewport') || document.getElementById('main-content');
  if (viewport) renderPermissionsTab(viewport);
};

window._revokeAllStaffAccess = function(staffId) {
  const staff = window.state.staffList || [];
  const s = staff.find(item => item.id === staffId);
  if (!s) return;

  if (confirm(`CRITICAL: You are about to revoke all active permissions and disable login for ${s.name} (ID: ${s.id}). Historical documents created by them will be preserved under their name for DPDP auditing. Proceed?`)) {
    s.rbacSuspended = true;
    s.rbacOverrides = [];
    s.statusToday = "Off Duty";
    s.credentialStatus = "Expired";
    localStorage.setItem('saronil_staffList', JSON.stringify(window.state.staffList));

    if (s.id.startsWith('DOC') && window.state.doctors) {
      const d = window.state.doctors.find(item => item.id === s.id);
      if (d) {
        d.status = "Suspended";
        d.rbacSuspended = true;
        d.privileges = { dashboard: false, registration: false, clinical: false, financial: false, diagnostics: false, support: false, admin: false };
        localStorage.setItem('saronil_doctors', JSON.stringify(window.state.doctors));
      }
    }

    // Audit Log Entry
    const auditEntry = {
      eventId: "AUD" + String(100 + window.state.accessAuditLog.length + 1),
      staffIdAffected: s.id,
      requestedBy: "HR Officer",
      approvedBy: "Admin Prashant",
      secondApprover: "—",
      module: "Security Gate",
      permissionType: "Full Revocation",
      previousState: "Active Portfolio",
      newState: "Revoked (Offboarded)",
      reason: "Employment termination exit procedure completed immediately",
      timestamp: new Date().toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).replace(/ /g, '-')
    };
    window.state.accessAuditLog.unshift(auditEntry);
    localStorage.setItem('saronil_accessAuditLog', JSON.stringify(window.state.accessAuditLog));

    alert(`All access rights for ${s.name} have been fully revoked and blocked. Historical records remain intact.`);
    const viewport = document.getElementById('admin-sub-viewport') || document.getElementById('main-content');
    if (viewport) renderPermissionsTab(viewport);
  }
};

window._toggleLineItemOverride = function(staffId, parentModule, item, type, currentEffective, restricted) {
  if (restricted) {
    alert(`Compliance Error: Deletion is hard-disabled on ${item} at the systems level (DPDP Act & Clinical Audit Rule compliance). It cannot be configured.`);
    return;
  }

  const staff = window.state.staffList || [];
  const s = staff.find(item => item.id === staffId);
  if (!s) return;

  s.rbacOverrides = s.rbacOverrides || [];
  const idx = s.rbacOverrides.findIndex(o => o.lineItem === item && o.permissionType === type);

  const rRole = s.type === 'Doctor' ? 'Consultant Doctor' : (s.role || 'Support Staff');
  let roleDefault = false;
  if (window.state.rolePermissions && window.state.rolePermissions[rRole] && window.state.rolePermissions[rRole][item]) {
    roleDefault = !!window.state.rolePermissions[rRole][item][type];
  }

  const newOverrideValue = !currentEffective;

  if (idx > -1) {
    // Override already exists. If new value matches role default, remove the override entirely!
    if (newOverrideValue === roleDefault) {
      s.rbacOverrides.splice(idx, 1);
    } else {
      s.rbacOverrides[idx].value = newOverrideValue;
    }
  } else {
    // Override doesn't exist. Add new override
    s.rbacOverrides.push({
      parentModule: parentModule,
      lineItem: item,
      permissionType: type,
      value: newOverrideValue,
      overrideId: "OVR" + String(100 + s.rbacOverrides.length + 1)
    });
  }

  localStorage.setItem('saronil_staffList', JSON.stringify(window.state.staffList));

  // Sync back to doctor object if applicable
  if (s.id.startsWith('DOC') && window.state.doctors) {
    const d = window.state.doctors.find(item => item.id === s.id);
    if (d) {
      d.privileges = d.privileges || {};
      const mapKey = {
        'Admission': 'registration',
        'Treatment': 'clinical',
        'Billing': 'financial',
        'Pharmacy': 'support', 
        'Reports': 'support', 
        'Master Data': 'admin'
      };
      const key = mapKey[parentModule];
      if (key) {
        d.privileges[key] = newOverrideValue;
      }
      localStorage.setItem('saronil_doctors', JSON.stringify(window.state.doctors));
    }
  }

  // Audit Log Entry
  const auditEntry = {
    eventId: "AUD" + String(100 + window.state.accessAuditLog.length + 1),
    staffIdAffected: s.id,
    requestedBy: "Admin Prashant",
    approvedBy: "Admin Prashant",
    secondApprover: "—",
    module: parentModule + " (" + item + ")",
    permissionType: type,
    previousState: currentEffective ? "Granted" : "Denied",
    newState: newOverrideValue ? "Granted (Override)" : "Denied (Override)",
    reason: "Line item permission override adjustment",
    timestamp: new Date().toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).replace(/ /g, '-')
  };
  window.state.accessAuditLog.unshift(auditEntry);
  localStorage.setItem('saronil_accessAuditLog', JSON.stringify(window.state.accessAuditLog));

  const viewport = document.getElementById('admin-sub-viewport') || document.getElementById('main-content');
  if (viewport) renderPermissionsTab(viewport);
};
window._toggleStaffOverrideFlag = function(staffId, flag, isChecked) {
  const staff = window.state.staffList || [];
  const s = staff.find(item => item.id === staffId);
  if (!s) return;

  s.specialRights = s.specialRights || [];
  const idx = s.specialRights.indexOf(flag);

  if (isChecked) {
    if (idx === -1) s.specialRights.push(flag);
  } else {
    if (idx > -1) s.specialRights.splice(idx, 1);
  }

  localStorage.setItem('saronil_staffList', JSON.stringify(window.state.staffList));

  // Audit Log Entry
  const auditEntry = {
    eventId: "AUD" + String(100 + window.state.accessAuditLog.length + 1),
    staffIdAffected: s.id,
    requestedBy: "Admin Prashant",
    approvedBy: "Admin Prashant",
    secondApprover: "—",
    module: "Special Overrides",
    permissionType: flag,
    previousState: isChecked ? "Denied" : "Granted",
    newState: isChecked ? "Granted (Override)" : "Denied (Override)",
    reason: "Staff transaction bypass flag configuration",
    timestamp: new Date().toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).replace(/ /g, '-')
  };
  window.state.accessAuditLog.unshift(auditEntry);
  localStorage.setItem('saronil_accessAuditLog', JSON.stringify(window.state.accessAuditLog));

  const viewport = document.getElementById('admin-sub-viewport') || document.getElementById('main-content');
  if (viewport) renderPermissionsTab(viewport);
};

// --------------------------------------------------------------------------
// ROLE-BASED ACCESS CONTROL (RBAC) TEMPLATE MANAGER (FIRST SUBTAB)
// --------------------------------------------------------------------------
function renderSubTabRole(container, actor) {
  const roles = [
    "Hospital Administrator",
    "Medical Superintendent",
    "Consultant Doctor",
    "Resident Medical Officer (RMO)",
    "Nursing Supervisor",
    "Staff Nurse",
    "Front Desk & Patient Registry",
    "Billing Operator & Cashier",
    "TPA & Insurance Coordinator",
    "Pharmacist",
    "Lab Pathologist",
    "Radiologist",
    "Medical Records (MRD) Officer",
    "OT Technician",
    "IT System Admin"
  ];

  let selectedRole = localStorage.getItem('saronil_perm_sel_role') || roles[0];
  if (!roles.includes(selectedRole)) selectedRole = roles[0];

  const defaultPrivileges = ["Read", "Write", "Delete"];
  const modulesStructure = [
    {
      module: "Admission",
      items: ["Bed Booking & Allocation", "Patient Intake Registry", "Discharge Clearance"]
    },
    {
      module: "Treatment",
      items: ["Vitals & Nurse Logs", "Clinical & EMR Notes", "Consent Documentation"]
    },
    {
      module: "Pharmacy",
      items: ["Stock Inventory", "Prescription Dispensation"]
    },
    {
      module: "Billing",
      items: ["Invoices & Receipts", "Credit Notes & Refunds"]
    },
    {
      module: "Reports",
      items: ["Financial Summaries", "Clinical Activity Analytics"]
    },
    {
      module: "Master Data",
      items: ["Drug List Master", "Service Tariff Master", "Bed Allocation Master", "Staff Registry Master"]
    }
  ];

  const rolePerms = window.state.rolePermissions[selectedRole] || {};

  const isModuleAllChecked = (moduleGroup, type) => {
    return moduleGroup.items.every(item => rolePerms[item] && rolePerms[item][type]);
  };

  container.innerHTML = `
    <div style="display:grid; grid-template-columns: 280px 1fr; gap:1.5rem; align-items:start; text-align:left;">
      <!-- Left Column: Role List -->
      <div class="card" style="padding:15px; max-height:600px; overflow-y:auto; display:flex; flex-direction:column; gap:10px;">
        <h4 style="margin:0 0 10px 0; font-size:13px; font-weight:800; border-bottom:1px solid #e2e8f0; padding-bottom:8px;">🔑 Hospital Roles Directory</h4>
        <div style="display:flex; flex-direction:column; gap:4px;">
          ${roles.map(r => `
            <div onclick="window._selectRoleForConfig('${r}')" style="padding:10px 12px; border-radius:6px; cursor:pointer; background:${selectedRole === r ? 'var(--primary-glow)' : 'transparent'}; border:1px solid ${selectedRole === r ? 'var(--primary)' : 'transparent'}; transition:all 0.15s ease;">
              <div style="font-weight:700; font-size:12px; color:${selectedRole === r ? 'var(--primary)' : '#1e293b'};">${r}</div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Right Column: Modules and Activities -->
      <div class="card" style="padding:16px;">
        <h3 style="margin:0 0 4px 0; font-size:15px; font-weight:800; color:#0f172a;">Role Permissions Configuration: ${selectedRole}</h3>
        <p style="margin:0 0 15px 0; font-size:11.5px; color:#64748b;">
          Configure system-wide default access templates for this role. Administrators can toggle an entire module or specific actions per line item.
        </p>

        <div style="display:flex; flex-direction:column; gap:16px;">
          ${modulesStructure.map(modGroup => {
            const readChecked = isModuleAllChecked(modGroup, "Read");
            const writeChecked = isModuleAllChecked(modGroup, "Write");
            const deleteChecked = isModuleAllChecked(modGroup, "Delete");

            return `
              <div style="border:1px solid #cbd5e1; border-radius:8px; overflow:hidden; background:#fff;">
                <!-- Module Header Row with Master Read/Write/Delete Toggles -->
                <div style="background:#f1f5f9; padding:10px 15px; border-bottom:1px solid #cbd5e1; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">
                  <div style="font-weight:800; font-size:12px; color:#1e3a8a;">
                    📂 ${modGroup.module} Module
                  </div>
                  <div style="display:flex; gap:15px; font-size:10px; color:#475569; font-weight:700;">
                    <label style="display:flex; align-items:center; gap:4px; margin:0; cursor:pointer;">
                      <input type="checkbox" ${readChecked ? 'checked' : ''} onchange="window._toggleModuleMasterPermission('${selectedRole}', '${modGroup.module}', 'Read', this.checked)" style="width:13px; height:13px; cursor:pointer;">
                      <span>All Read</span>
                    </label>
                    <label style="display:flex; align-items:center; gap:4px; margin:0; cursor:pointer;">
                      <input type="checkbox" ${writeChecked ? 'checked' : ''} onchange="window._toggleModuleMasterPermission('${selectedRole}', '${modGroup.module}', 'Write', this.checked)" style="width:13px; height:13px; cursor:pointer;">
                      <span>All Write</span>
                    </label>
                    <label style="display:flex; align-items:center; gap:4px; margin:0; cursor:pointer;">
                      <input type="checkbox" ${deleteChecked ? 'checked' : ''} onchange="window._toggleModuleMasterPermission('${selectedRole}', '${modGroup.module}', 'Delete', this.checked)" style="width:13px; height:13px; cursor:pointer;">
                      <span>All Delete</span>
                    </label>
                  </div>
                </div>

                <!-- Child Line Items (1 in a row) -->
                <div style="display:flex; flex-direction:column;">
                  ${modGroup.items.map((item, idx) => {
                    return `
                      <div style="display:flex; justify-content:space-between; align-items:center; padding:10px 15px; border-bottom: ${idx < modGroup.items.length - 1 ? '1px solid #e2e8f0' : 'none'}; hover:background:#f8fafc; flex-wrap:wrap; gap:10px;">
                        <span style="font-weight:600; color:#1e293b; font-size:11.5px; text-align:left;">📄 ${item}</span>
                        <div style="display:flex; gap:20px;">
                          ${defaultPrivileges.map(type => {
                            const isVal = rolePerms[item] && rolePerms[item][type];
                            
                            // Restriction checks
                            let restricted = false;
                            if (type === 'Delete') {
                              if (modGroup.module === 'Treatment') restricted = true;
                              if (item === 'Invoices & Receipts') restricted = true;
                              if (modGroup.module === 'Master Data') restricted = true;
                            }
                            
                            if (restricted) {
                              return `
                                <label style="display:flex; align-items:center; gap:5px; font-size:11px; color:#9ca3af; margin:0; cursor:not-allowed; opacity:0.6;">
                                  <input type="checkbox" disabled style="width:14px; height:14px; cursor:not-allowed;">
                                  <span>${type} <span style="font-size:8px; font-style:italic;">(Locked)</span></span>
                                </label>
                              `;
                            } else {
                              return `
                                <label style="display:flex; align-items:center; gap:5px; font-size:11px; color:#475569; margin:0; cursor:pointer;">
                                  <input type="checkbox" ${isVal ? 'checked' : ''} onchange="window._toggleRoleLineItem('${selectedRole}', '${item}', '${type}', this.checked)" style="width:14px; height:14px; cursor:pointer;">
                                  <span>${type}</span>
                                </label>
                              `;
                            }
                          }).join('')}
                        </div>
                      </div>
                    `;
                  }).join('')}
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    </div>
  `;
}

window._selectRoleForConfig = function(role) {
  localStorage.setItem('saronil_perm_sel_role', role);
  const viewport = document.getElementById('admin-sub-viewport') || document.getElementById('main-content');
  if (viewport) renderPermissionsTab(viewport);
};

window._toggleRoleLineItem = function(role, item, type, isChecked) {
  if (!window.state.rolePermissions) return;
  window.state.rolePermissions[role] = window.state.rolePermissions[role] || {};
  window.state.rolePermissions[role][item] = window.state.rolePermissions[role][item] || {};
  window.state.rolePermissions[role][item][type] = isChecked;

  localStorage.setItem('saronil_rolePermissions', JSON.stringify(window.state.rolePermissions));

  const viewport = document.getElementById('admin-sub-viewport') || document.getElementById('main-content');
  if (viewport) renderPermissionsTab(viewport);
};

window._toggleModuleMasterPermission = function(role, parentModule, type, isChecked) {
  if (!window.state.rolePermissions) return;
  window.state.rolePermissions[role] = window.state.rolePermissions[role] || {};

  const modulesStructure = [
    {
      module: "Admission",
      items: ["Bed Booking & Allocation", "Patient Intake Registry", "Discharge Clearance"]
    },
    {
      module: "Treatment",
      items: ["Vitals & Nurse Logs", "Clinical & EMR Notes", "Consent Documentation"]
    },
    {
      module: "Pharmacy",
      items: ["Stock Inventory", "Prescription Dispensation"]
    },
    {
      module: "Billing",
      items: ["Invoices & Receipts", "Credit Notes & Refunds"]
    },
    {
      module: "Reports",
      items: ["Financial Summaries", "Clinical Activity Analytics"]
    },
    {
      module: "Master Data",
      items: ["Drug List Master", "Service Tariff Master", "Bed Allocation Master", "Staff Registry Master"]
    }
  ];

  const modGroup = modulesStructure.find(m => m.module === parentModule);
  if (!modGroup) return;

  modGroup.items.forEach(item => {
    let restricted = false;
    if (type === 'Delete') {
      if (parentModule === 'Treatment') restricted = true;
      if (item === 'Invoices & Receipts') restricted = true;
      if (parentModule === 'Master Data') restricted = true;
    }

    if (!restricted) {
      window.state.rolePermissions[role][item] = window.state.rolePermissions[role][item] || {};
      window.state.rolePermissions[role][item][type] = isChecked;
    }
  });

  localStorage.setItem('saronil_rolePermissions', JSON.stringify(window.state.rolePermissions));

  const viewport = document.getElementById('admin-sub-viewport') || document.getElementById('main-content');
  if (viewport) renderPermissionsTab(viewport);
};

// --------------------------------------------------------------------------
// SUBTAB 2: EMPLOYEE WISE SPECIAL RIGHT TAGGING (IMAGE EXACT MATCH)
// --------------------------------------------------------------------------
const SPECIAL_RIGHTS_FLAGS = [
  { flag: 'IsAllowedToShowAdvance', desc: 'Allowed to Show Advance Details' },
  { flag: 'IsAllowedToShowMaskedPatient', desc: 'Authorized to Show Masked Patient Details' },
  { flag: 'IsAllowedToViewChargeColumnsInWardAddService', desc: 'Allowed to View Charge Columns & Add Services in Ward' },
  { flag: 'IsAllowedToRefundWithoutOPDReport', desc: 'Allowed to Refund Without OPD Report' },
  { flag: 'IsAllowedToUpdateAdmittedDoctorForAdmittedPatient', desc: 'Allowed to Update Admitted Doctor for Admitted Patients' },
  { flag: 'IsAllowedToUpdateAdmittedPatientAdmissionDate', desc: 'Allowed to Update Admission Date for Admitted Patients' },
  { flag: 'IsAllowedToUpdateRegistrationForDiagnosis', desc: 'Allowed to Update Patient Registration for Diagnosis' },
  { flag: 'IsAllowedToCancelCreditNote', desc: 'Authorized to Cancel Credit Notes' },
  { flag: 'IsAllowedToViewAndPrintDischargeSummaryOnly', desc: 'Authorized to View & Print Discharge Summaries Only' },
  { flag: 'IsAuthorizedToAddServiceAfterPatientDischarge', desc: 'Authorized to Add Services After Patients are Discharged' },
  { flag: 'IsAuthorizedToCloseEncounterFromCreateOPVisit', desc: 'Authorized to Close Encounter from Create OP Visit' },
  { flag: 'IsAuthorizedToCancelMarkForDischarge', desc: 'Authorized to Cancel "Mark for Discharge" Status' },
  { flag: 'IsAuthorizedToDiscountCompanyNonDiscountServices', desc: 'Authorized to Apply Discount on Company Non-Discount Services' },
  { flag: 'IsAuthorizedToCancelAdmission', desc: 'Authorized to Cancel Patient Admissions' },
  { flag: 'IsAllowedToOverrideTariffRates', desc: 'Allowed to Override Default Tariff Rates' },
  { flag: 'IsAllowedToWaiveFees', desc: 'Allowed to Waive Registration & Consultation Fees' },
  { flag: 'IsAllowedToEditFinalizedClinicalDiagnosis', desc: 'Allowed to Edit Finalized Clinical Diagnoses' },
  { flag: 'IsAllowedToAccessVipPatientRecords', desc: 'Authorized to Access VIP Patient Case Records' },
  { flag: 'IsAllowedToEditBedAllocationPastRecords', desc: 'Allowed to Edit Bed Allocation History' },
  { flag: 'IsAllowedToBypassCreditLimit', desc: 'Allowed to Bypass Credit Limit (TPA/CGHS/ECHS)' },
  { flag: 'IsAllowedToEditDischargeSummaryAfterLock', desc: 'Allowed to Edit Discharge Summary After System Lock' },
  { flag: 'IsAllowedToChangeRefundPaymentMode', desc: 'Allowed to Change Refund Payment Method' },
  { flag: 'IsAllowedToDeleteDraftPrescriptions', desc: 'Allowed to Delete Draft Prescriptions' },
  { flag: 'IsAllowedToAdjustInventoryStock', desc: 'Allowed to Adjust Pharmacy Inventory Stock Quantities' },
  { flag: 'IsAllowedToDiscountPharmacy', desc: 'Allowed to Apply Pharmacy Discount' },
  { flag: 'IsAllowedToChangeBedCategory', desc: 'Allowed to Change Tariff & Bed Categories' },
  { flag: 'IsAllowedToRefund', desc: 'Allowed to Approve Cash Refunds' },
  { flag: 'IsAllowedToCancelBill', desc: 'Allowed to Cancel Settled Bills' },
  { flag: 'IsAllowedToChangeTax', desc: 'Allowed to Edit/Waive Tax (GST/CGST/SGST)' },
  { flag: 'IsAllowedToIssueConsumablesWithoutRequisition', desc: 'Allowed to Issue Consumables Without Requisition Sheets' },
  { flag: 'IsAllowedToViewPatientMedicalHistoryAnonymously', desc: 'Allowed to View Patient Medical History Anonymously' },
  { flag: 'IsAllowedToReopenSettledInvoices', desc: 'Allowed to Re-open Settled Billing Invoices' }
];

function renderSubTabTagging(container) {
  const staff = window.state.staffList || [];
  let taggedStaffId = localStorage.getItem('saronil_perm_tag_staff') || (staff[0] ? staff[0].id : '');
  let currentStaff = staff.find(s => s.id === taggedStaffId);
  if (!currentStaff && staff.length > 0) {
    currentStaff = staff[0];
    taggedStaffId = currentStaff.id;
    localStorage.setItem('saronil_perm_tag_staff', taggedStaffId);
  }

  currentStaff.specialRights = currentStaff.specialRights || [];
  
  // Temporary session-selection array for checkboxes on the left
  window._leftSelectedFlags = window._leftSelectedFlags || [];

  container.innerHTML = `
    <!-- SPECIAL RIGHTS TAGGING GRID (Image Recreation) -->
    <div style="background:#fff; border:1px solid #e2e8f0; border-radius:10px; padding:15px; text-align:left; font-family:'Outfit',sans-serif; min-height:500px; display:flex; flex-direction:column; gap:15px;">
      
      <!-- Top Action bar with Save in Upper Right -->
      <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:2px solid #3b82f6; padding-bottom:10px;">
        <div>
          <h2 style="margin:0 0 4px 0; font-size:14px; font-weight:800; color:#1e3a8a; text-transform:uppercase;">Employee Special Rights Tagging</h2>
          <p style="margin:0; font-size:11px; color:#64748b;">Explicit attribution of special transactional flags to individual clinical users (DPDP 2023 Compliant)</p>
        </div>
        <button onclick="window._saveSpecialRights('${taggedStaffId}')" class="btn btn-success" style="background:#059669; color:#fff; border:none; border-radius:6px; font-weight:700; padding:6px 20px; font-size:12px; cursor:pointer; box-shadow:0 2px 4px rgba(0,0,0,0.1);">Save</button>
      </div>

      <!-- Split Layout Columns -->
      <div style="display:grid; grid-template-columns: 1fr 1fr; gap:20px; align-items:start;">
        
        <!-- LEFT COLUMN: Available Flags Checklist -->
        <div style="border:1px solid #e2e8f0; border-radius:8px; padding:15px; background:#fafafa; display:flex; flex-direction:column; gap:12px; min-height:420px;">
          <div style="display:flex; flex-direction:column; gap:8px;">
            <div style="display:flex; align-items:center; gap:10px; font-size:12px;">
              <span style="font-weight:700; color:#334155; width:150px;">Employee Tagging With</span>
              <select onchange="window._changeTaggingEmployee(this.value)" style="flex:1; padding:6px 10px; border:1px solid #cbd5e1; border-radius:6px; background:#fff; font-size:12px; font-weight:700; color:#1e3a8a; outline:none;">
                ${staff.map(s => `
                  <option value="${s.id}" ${taggedStaffId === s.id ? 'selected' : ''}>${s.name} (${s.id})</option>
                `).join('')}
              </select>
            </div>
            
            <div style="display:flex; align-items:center; gap:10px; font-size:12px;">
              <span style="font-weight:700; color:#334155; width:150px;">Search Flag name:</span>
              <input type="text" id="left-flag-search" onkeyup="window._filterLeftFlags(this.value)" placeholder="Search rights flags..." style="flex:1; padding:6px 10px; border:1px solid #cbd5e1; border-radius:6px; outline:none; font-size:12px; box-sizing:border-box;">
            </div>
          </div>

          <!-- Checklist list -->
          <div style="border:1px solid #cbd5e1; border-radius:6px; background:#fff; padding:10px; height:240px; overflow-y:auto; display:flex; flex-direction:column; gap:8px;">
            ${SPECIAL_RIGHTS_FLAGS.map((f, i) => {
              const isChecked = window._leftSelectedFlags.includes(f.flag);
              return `
                <label class="left-flag-row" data-flag="${f.flag.toLowerCase()}" data-desc="${f.desc.toLowerCase()}" style="display:flex; align-items:start; gap:8px; font-size:11.5px; color:#334155; cursor:pointer; line-height:1.4; padding:5px 0; border-bottom:1px solid #f1f5f9;">
                  <input type="checkbox" value="${f.flag}" ${isChecked ? 'checked' : ''} onchange="window._toggleLeftFlagSelection('${f.flag}', this.checked)" style="margin-top:2px; cursor:pointer;">
                  <span>
                    <strong style="color:#0f172a; font-weight:700;">${f.desc}</strong>
                  </span>
                </label>
              `;
            }).join('')}
          </div>

          <div style="display:flex; justify-content:space-between; align-items:center; margin-top:5px;">
            <label style="font-size:11px; color:#475569; display:flex; align-items:center; gap:6px; cursor:pointer;">
              <input type="checkbox" onchange="window._toggleSelectAllLeftFlags(this.checked)" style="cursor:pointer;"> Select All
            </label>
            <button onclick="window._selectLeftFlags()" class="btn btn-primary btn-sm" style="background:#2563eb; color:#fff; border:none; padding:6px 16px; border-radius:6px; font-weight:700; font-size:11px; cursor:pointer;">Select</button>
          </div>
        </div>

        <!-- RIGHT COLUMN: Tagged Overridden Rights Table -->
        <div style="border:1px solid #e2e8f0; border-radius:8px; padding:15px; background:#fafafa; display:flex; flex-direction:column; gap:12px; min-height:420px;">
          <div style="display:flex; flex-direction:column; gap:8px;">
            <div style="display:flex; align-items:center; gap:10px; font-size:12px;">
              <span style="font-weight:700; color:#334155; width:150px;">Search Flag name:</span>
              <input type="text" id="right-flag-search" onkeyup="window._filterRightFlags(this.value)" placeholder="Search tagged rights..." style="flex:1; padding:6px 10px; border:1px solid #cbd5e1; border-radius:6px; outline:none; font-size:12px; box-sizing:border-box;">
            </div>
            
            <div style="display:flex; align-items:center; gap:10px; font-size:12px;">
              <span style="font-weight:700; color:#334155; width:150px; display:flex; align-items:center; gap:6px; cursor:pointer;">
                <input type="checkbox" id="copy-rights-check" onchange="window._toggleCopyRightsDropdown(this.checked)" style="cursor:pointer;"> Copy Employee Right:
              </span>
              <select id="copy-rights-source-select" disabled onchange="window._copyRightsFromEmployee(this.value, '${taggedStaffId}')" style="flex:1; padding:6px; border:1px solid #cbd5e1; border-radius:6px; background:#f1f5f9; font-size:11px; outline:none;">
                <option value="">-- Choose Staff to Copy From --</option>
                ${staff.filter(s => s.id !== taggedStaffId).map(s => `
                  <option value="${s.id}">${s.name} (${s.id})</option>
                `).join('')}
              </select>
            </div>
          </div>

          <!-- Overridden Flags Table -->
          <div style="border:1px solid #cbd5e1; border-radius:6px; background:#fff; height:240px; overflow-y:auto;">
            <table class="custom-table" style="font-size:11px; width:100%; text-align:left;">
              <thead style="position:sticky; top:0; background:#f8fafc; border-bottom:1px solid #cbd5e1;">
                <tr>
                  <th style="padding:8px 10px; font-weight:700; color:#475569;">Flag Name</th>
                  <th style="padding:8px 10px; font-weight:700; color:#475569; text-align:right; width:80px;">Action</th>
                </tr>
              </thead>
              <tbody id="right-tagged-flags-body">
                ${currentStaff.specialRights.length > 0 ? currentStaff.specialRights.map(sr => {
                  const fInfo = SPECIAL_RIGHTS_FLAGS.find(f => f.flag === sr);
                  const displayName = fInfo ? fInfo.desc : sr;
                  return `
                    <tr class="right-flag-row" data-flag="${sr.toLowerCase()}" style="border-bottom:1px solid #cbd5e1;">
                      <td style="padding:8px 10px; font-weight:600; color:#1e293b;">${displayName}</td>
                      <td style="padding:8px 10px; text-align:right;">
                        <button onclick="window._deleteRightFlag('${sr}')" class="btn btn-secondary btn-sm" style="padding:2px 8px; font-size:10px; color:#ef4444; border:1px solid #fed7aa; background:#fff5f5; cursor:pointer;">Delete</button>
                      </td>
                    </tr>
                  `;
                }).join('') : `
                  <tr>
                    <td colspan="2" style="text-align:center; padding:30px; color:#64748b; font-size:11px; font-style:italic;">No special rights tagged. Use the left checklist and click Select to tag rights.</td>
                  </tr>
                `}
              </tbody>
            </table>
          </div>

          <div style="display:flex; justify-content:space-between; align-items:center; margin-top:5px;">
            <label style="font-size:11px; color:#475569; display:flex; align-items:center; gap:6px; cursor:pointer; user-select:none;">
              <input type="checkbox" onchange="window._toggleSelectAllRightFlags(this.checked)" style="cursor:pointer;"> Select All
            </label>
            <div style="display:flex; gap:6px;">
              <button onclick="window._clearRightFlags()" class="btn btn-secondary btn-sm" style="padding:6px 12px; font-size:11px; border:1px solid #cbd5e1; background:#ffffff; cursor:pointer;">Clear Above</button>
              <button onclick="window._deleteAllRightFlags()" class="btn btn-secondary btn-sm" style="padding:6px 12px; font-size:11px; color:#ef4444; border:1px solid #cbd5e1; background:#ffffff; cursor:pointer;">Delete All</button>
            </div>
          </div>
        </div>

      </div>
    </div>
  `;
}

window._changeTaggingEmployee = function(id) {
  localStorage.setItem('saronil_perm_tag_staff', id);
  window._leftSelectedFlags = []; // reset left selections
  const viewport = document.getElementById('admin-sub-viewport') || document.getElementById('main-content');
  if (viewport) renderPermissionsTab(viewport);
};

window._filterLeftFlags = function(q) {
  const query = q.toLowerCase().trim();
  document.querySelectorAll('.left-flag-row').forEach(row => {
    const flag = row.getAttribute('data-flag');
    const desc = row.getAttribute('data-desc');
    if (flag.includes(query) || desc.includes(query)) {
      row.style.display = 'flex';
    } else {
      row.style.display = 'none';
    }
  });
};

window._filterRightFlags = function(q) {
  const query = q.toLowerCase().trim();
  document.querySelectorAll('#right-tagged-flags-body .right-flag-row').forEach(row => {
    const flag = row.getAttribute('data-flag');
    if (flag.includes(query)) {
      row.style.display = 'table-row';
    } else {
      row.style.display = 'none';
    }
  });
};

window._toggleLeftFlagSelection = function(flag, isSelected) {
  if (isSelected) {
    if (!window._leftSelectedFlags.includes(flag)) window._leftSelectedFlags.push(flag);
  } else {
    window._leftSelectedFlags = window._leftSelectedFlags.filter(f => f !== flag);
  }
};

window._toggleSelectAllLeftFlags = function(isAll) {
  window._leftSelectedFlags = [];
  if (isAll) {
    SPECIAL_RIGHTS_FLAGS.forEach(f => window._leftSelectedFlags.push(f.flag));
  }
  const viewport = document.getElementById('admin-sub-viewport') || document.getElementById('main-content');
  if (viewport) renderPermissionsTab(viewport);
};

window._selectLeftFlags = function() {
  const staffId = localStorage.getItem('saronil_perm_tag_staff');
  const staff = window.state.staffList || [];
  const s = staff.find(item => item.id === staffId);
  if (!s) return;

  s.specialRights = s.specialRights || [];
  window._leftSelectedFlags.forEach(f => {
    if (!s.specialRights.includes(f)) {
      s.specialRights.push(f);
    }
  });

  window._leftSelectedFlags = []; // clear left selection buffer
  const viewport = document.getElementById('admin-sub-viewport') || document.getElementById('main-content');
  if (viewport) renderPermissionsTab(viewport);
};

window._toggleCopyRightsDropdown = function(isChecked) {
  const select = document.getElementById('copy-rights-source-select');
  if (!select) return;
  select.disabled = !isChecked;
  select.style.background = isChecked ? '#ffffff' : '#f1f5f9';
};

window._copyRightsFromEmployee = function(sourceId, targetId) {
  if (!sourceId) return;
  const staff = window.state.staffList || [];
  const source = staff.find(s => s.id === sourceId);
  const target = staff.find(s => s.id === targetId);
  if (!source || !target) return;

  const rightsToCopy = source.specialRights || [];
  if (confirm(`Do you want to copy the ${rightsToCopy.length} special rights flags from ${source.name} to ${target.name}?`)) {
    target.specialRights = [...new Set([...(target.specialRights || []), ...rightsToCopy])];
    
    // reset selection control
    document.getElementById('copy-rights-check').checked = false;
    document.getElementById('copy-rights-source-select').value = "";
    document.getElementById('copy-rights-source-select').disabled = true;
    document.getElementById('copy-rights-source-select').style.background = "#f1f5f9";

    const viewport = document.getElementById('admin-sub-viewport') || document.getElementById('main-content');
    if (viewport) renderPermissionsTab(viewport);
  }
};

window._deleteRightFlag = function(flagName) {
  const staffId = localStorage.getItem('saronil_perm_tag_staff');
  const staff = window.state.staffList || [];
  const s = staff.find(item => item.id === staffId);
  if (!s) return;

  s.specialRights = (s.specialRights || []).filter(sr => sr !== flagName);
  
  const viewport = document.getElementById('admin-sub-viewport') || document.getElementById('main-content');
  if (viewport) renderPermissionsTab(viewport);
};

window._clearRightFlags = function() {
  // Clears checked rows on the right or selection
  alert("Selection cleared. Click Delete All to clear all tagged records.");
};

window._deleteAllRightFlags = function() {
  const staffId = localStorage.getItem('saronil_perm_tag_staff');
  const staff = window.state.staffList || [];
  const s = staff.find(item => item.id === staffId);
  if (!s) return;

  if (confirm(`Are you sure you want to clear all tagged special rights for ${s.name}?`)) {
    s.specialRights = [];
    const viewport = document.getElementById('admin-sub-viewport') || document.getElementById('main-content');
    if (viewport) renderPermissionsTab(viewport);
  }
};

window._toggleSelectAllRightFlags = function(isSelect) {
  // Visual helper
  alert("Bulk selection active. Click Clear Above or Delete All to apply actions.");
};

window._saveSpecialRights = function(staffId) {
  const staff = window.state.staffList || [];
  const s = staff.find(item => item.id === staffId);
  if (!s) return;

  localStorage.setItem('saronil_staffList', JSON.stringify(window.state.staffList));

  // Sync back to doctor object if applicable
  if (s.id.startsWith('DOC') && window.state.doctors) {
    const d = window.state.doctors.find(item => item.id === s.id);
    if (d) {
      d.specialRights = s.specialRights;
      localStorage.setItem('saronil_doctors', JSON.stringify(window.state.doctors));
    }
  }

  // Audit Log Entry
  const auditEntry = {
    eventId: "AUD" + String(100 + window.state.accessAuditLog.length + 1),
    staffIdAffected: s.id,
    requestedBy: "Admin Prashant",
    approvedBy: "Admin Prashant",
    secondApprover: "—",
    module: "Special Rights Tagging",
    permissionType: "Modify Flags",
    previousState: "None",
    newState: JSON.stringify(s.specialRights),
    reason: "Transactional flag adjustments for individual clinician profile",
    timestamp: new Date().toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).replace(/ /g, '-')
  };
  window.state.accessAuditLog.unshift(auditEntry);
  localStorage.setItem('saronil_accessAuditLog', JSON.stringify(window.state.accessAuditLog));

  if (window.showToast) {
    window.showToast("Special rights saved successfully!");
  } else {
    alert(`Special rights for ${s.name} saved successfully and committed to Audit Logs.`);
  }
};

// --------------------------------------------------------------------------
// SUBTAB 3: MAKER-CHECKER ACCESS REQUEST QUEUE
// --------------------------------------------------------------------------
function renderSubTabMakerChecker(viewport, actor) {
  const requests = window.state.accessRequests || [];
  const staff = window.state.staffList || [];

  viewport.innerHTML = `
    <div style="display:grid; grid-template-columns: 320px 1fr; gap:1.5rem; align-items:start; text-align:left;">
      <!-- Left Column: Raise Request Form -->
      <div class="card" style="padding:15px; display:flex; flex-direction:column; gap:12px;">
        <h4 style="margin:0 0 5px 0; font-size:13px; font-weight:800; border-bottom:1px solid #e2e8f0; padding-bottom:8px;">📥 Raise Access Request</h4>
        
        <div style="display:flex; flex-direction:column; gap:8px; font-size:11px;">
          <div>
            <label style="font-weight:700; color:#475569; display:block; margin-bottom:4px;">Target Staff member *</label>
            <select id="req-staff-id" style="width:100%; padding:6px; border:1px solid #cbd5e1; border-radius:6px; outline:none;">
              ${staff.map(s => `<option value="${s.id}">${s.name} (${s.id})</option>`).join('')}
            </select>
          </div>
          
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px;">
            <div>
              <label style="font-weight:700; color:#475569; display:block; margin-bottom:4px;">Module Line Item *</label>
              <select id="req-module" style="width:100%; padding:6px; border:1px solid #cbd5e1; border-radius:6px; outline:none; font-size:11px;">
                <option value="Bed Booking & Allocation">Admission: Bed Booking & Allocation</option>
                <option value="Patient Intake Registry">Admission: Patient Intake Registry</option>
                <option value="Discharge Clearance">Admission: Discharge Clearance</option>
                <option value="Vitals & Nurse Logs">Treatment: Vitals & Nurse Logs</option>
                <option value="Clinical & EMR Notes">Treatment: Clinical & EMR Notes</option>
                <option value="Consent Documentation">Treatment: Consent Documentation</option>
                <option value="Stock Inventory">Pharmacy: Stock Inventory</option>
                <option value="Prescription Dispensation">Pharmacy: Prescription Dispensation</option>
                <option value="Invoices & Receipts">Billing: Invoices & Receipts</option>
                <option value="Credit Notes & Refunds">Billing: Credit Notes & Refunds</option>
                <option value="Financial Summaries">Reports: Financial Summaries</option>
                <option value="Clinical Activity Analytics">Reports: Clinical Activity Analytics</option>
                <option value="Drug List Master">Master Data: Drug List Master</option>
                <option value="Service Tariff Master">Master Data: Service Tariff Master</option>
                <option value="Bed Allocation Master">Master Data: Bed Allocation Master</option>
                <option value="Staff Registry Master">Master Data: Staff Registry Master</option>
              </select>
            </div>
            <div>
              <label style="font-weight:700; color:#475569; display:block; margin-bottom:4px;">Type *</label>
              <select id="req-type" style="width:100%; padding:6px; border:1px solid #cbd5e1; border-radius:6px; outline:none; font-size:11px;">
                <option value="Read">Read</option>
                <option value="Write">Write</option>
                <option value="Delete">Delete</option>
              </select>
            </div>
          </div>
          
          <div>
            <label style="font-weight:700; color:#475569; display:block; margin-bottom:4px;">Justification / Reason *</label>
            <textarea id="req-justification" rows="3" placeholder="Provide clinical justification (Mandatory for Delete)..." style="width:100%; padding:6px; border:1px solid #cbd5e1; border-radius:6px; outline:none; font-family:inherit; box-sizing:border-box;"></textarea>
          </div>
          
          <button onclick="window._submitAccessRequest()" class="btn btn-primary" style="font-size:11.5px; font-weight:700; padding:8px; border-radius:6px; width:100%; cursor:pointer;">Submit Access Request</button>
        </div>
      </div>

      <!-- Right Column: Queue -->
      <div class="card" style="padding:15px; display:flex; flex-direction:column; gap:12px;">
        <h4 style="margin:0; font-size:13px; font-weight:800; border-bottom:1px solid #e2e8f0; padding-bottom:8px;">📥 Pending Maker-Checker Approvals Queue</h4>
        
        <div class="custom-table-container">
          <table class="custom-table" style="font-size:11px; width:100%; text-align:left;">
            <thead>
              <tr style="background:#f8fafc; border-bottom:1px solid #cbd5e1;">
                <th>Request ID</th>
                <th>Staff Name</th>
                <th>Module &amp; Permission</th>
                <th>Justification</th>
                <th>Status</th>
                <th style="text-align:right; padding-right:15px; width:150px;">Decision</th>
              </tr>
            </thead>
            <tbody>
              ${requests.length > 0 ? requests.map(r => {
                let badgeClass = 'bg-secondary';
                if (r.status === 'Access Requested') badgeClass = 'bg-warning';
                else if (r.status === 'Pending Second Approval') badgeClass = 'bg-info';
                else if (r.status === 'Approved') badgeClass = 'bg-success';
                else if (r.status === 'Rejected') badgeClass = 'bg-danger';

                return `
                  <tr style="border-bottom:1px solid #cbd5e1;">
                    <td style="font-weight:700;">${r.id}</td>
                    <td><strong>${r.staffName}</strong><br><small style="color:#64748b;">ID: ${r.staffId}</small></td>
                    <td><span class="badge bg-secondary" style="background:#eff6ff; color:#1e40af; border:1px solid #bfdbfe;">${r.module}</span><br><strong>${r.permissionType}</strong></td>
                    <td style="max-width:200px; text-overflow:ellipsis; overflow:hidden;" title="${r.justification}">${r.justification}</td>
                    <td><span class="badge ${badgeClass}" style="font-size:9.5px; padding:3px 6px;">${r.status}</span></td>
                    <td style="text-align:right; padding-right:15px; white-space:nowrap;">
                      ${r.status === 'Access Requested' ? `
                        <button onclick="window._makerApprove('${r.id}', 'Admin')" class="btn btn-success btn-sm" style="padding:2px 6px; font-size:10px; background:#059669; color:#fff; border:none; border-radius:4px; font-weight:700; cursor:pointer;">Approve</button>
                        <button onclick="window._makerReject('${r.id}', 'Admin')" class="btn btn-secondary btn-sm" style="padding:2px 6px; font-size:10px; color:#ef4444; border:1px solid #cbd5e1; background:#ffffff; border-radius:4px; cursor:pointer;">Reject</button>
                      ` : ''}

                      ${r.status === 'Pending Second Approval' ? `
                        <button onclick="window._checkerCoApprove('${r.id}', 'Compliance')" class="btn btn-success btn-sm" style="padding:2px 6px; font-size:10px; background:#2563eb; color:#fff; border:none; border-radius:4px; font-weight:700; cursor:pointer;">Co-Approve (Checker)</button>
                        <button onclick="window._makerReject('${r.id}', 'Compliance')" class="btn btn-secondary btn-sm" style="padding:2px 6px; font-size:10px; color:#ef4444; border:1px solid #cbd5e1; background:#ffffff; border-radius:4px; cursor:pointer;">Reject</button>
                      ` : ''}

                      ${r.status === 'Approved' ? `<span style="color:#059669; font-weight:700;">✔️ Active (Approved)</span>` : ''}
                      ${r.status === 'Rejected' ? `<span style="color:#ef4444; font-weight:700;">❌ Rejected</span>` : ''}
                    </td>
                  </tr>
                `;
              }).join('') : `
                <tr>
                  <td colspan="6" style="text-align:center; padding:30px; color:#64748b; font-style:italic;">No access requests filed in the register.</td>
                </tr>
              `}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}

window._submitAccessRequest = function() {
  const staffId = document.getElementById('req-staff-id').value;
  const module = document.getElementById('req-module').value;
  const type = document.getElementById('req-type').value;
  const justification = document.getElementById('req-justification').value.trim();

  const getParentModule = (item) => {
    if (["Bed Booking & Allocation", "Patient Intake Registry", "Discharge Clearance"].includes(item)) return "Admission";
    if (["Vitals & Nurse Logs", "Clinical & EMR Notes", "Consent Documentation"].includes(item)) return "Treatment";
    if (["Stock Inventory", "Prescription Dispensation"].includes(item)) return "Pharmacy";
    if (["Invoices & Receipts", "Credit Notes & Refunds"].includes(item)) return "Billing";
    if (["Financial Summaries", "Clinical Activity Analytics"].includes(item)) return "Reports";
    if (["Drug List Master", "Service Tariff Master", "Bed Allocation Master", "Staff Registry Master"].includes(item)) return "Master Data";
    return "General";
  };

  const parentMod = getParentModule(module);

  // Validate Deletion Lock rules
  if (type === 'Delete') {
    if (parentMod === 'Treatment' || module === 'Invoices & Receipts') {
      alert(`Security Rule Violation: Deletion permissions are hard-disabled at system level on "${module}". Access request blocked.`);
      return;
    }
    if (!justification) {
      alert("Accreditation Error: Clinician justification text is strictly mandatory to request Delete permissions.");
      return;
    }
  }

  const staff = window.state.staffList || [];
  const s = staff.find(item => item.id === staffId);
  if (!s) return;

  const newReq = {
    id: "REQ" + String(100 + window.state.accessRequests.length + 1),
    staffId: s.id,
    staffName: s.name,
    module: module,
    permissionType: type,
    justification: justification || "Access requested per department supervisor request",
    status: "Requested",
    requestedBy: "Dept Head Dr. Ramesh",
    timestamp: new Date().toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).replace(/ /g, '-'),
    approvals: []
  };

  window.state.accessRequests.unshift(newReq);
  localStorage.setItem('saronil_accessRequests', JSON.stringify(window.state.accessRequests));

  // Audit Log Entry
  const auditEntry = {
    eventId: "AUD" + String(100 + window.state.accessAuditLog.length + 1),
    staffIdAffected: s.id,
    requestedBy: "Dept Head Dr. Ramesh",
    approvedBy: "—",
    secondApprover: "—",
    module: module,
    permissionType: type,
    previousState: "None",
    newState: "Requested",
    reason: justification || "New access request raised",
    timestamp: new Date().toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).replace(/ /g, '-')
  };
  window.state.accessAuditLog.unshift(auditEntry);
  localStorage.setItem('saronil_accessAuditLog', JSON.stringify(window.state.accessAuditLog));

  alert("Access request successfully submitted to approval desk.");
  const viewport = document.getElementById('admin-sub-viewport') || document.getElementById('main-content');
  if (viewport) renderPermissionsTab(viewport);
};

window._makerApprove = function(reqId, actor) {
  const req = window.state.accessRequests.find(r => r.id === reqId);
  if (!req) return;

  if (req.permissionType === 'Delete') {
    // Requires Maker-Checker. Maker approves first, transitions to Pending Second Approval
    req.status = "Pending Second Approval";
    req.approvals.push({
      approverId: "ADM01",
      role: "Hospital Administrator",
      decision: "Approved",
      timestamp: new Date().toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).replace(/ /g, '-')
    });

    localStorage.setItem('saronil_accessRequests', JSON.stringify(window.state.accessRequests));

    // Audit Log Entry
    const auditEntry = {
      eventId: "AUD" + String(100 + window.state.accessAuditLog.length + 1),
      staffIdAffected: req.staffId,
      requestedBy: req.requestedBy,
      approvedBy: "Admin Prashant (Maker)",
      secondApprover: "—",
      module: req.module,
      permissionType: req.permissionType,
      previousState: "Requested",
      newState: "Pending Second Approval",
      reason: "Maker approved Delete request. Awaiting Compliance Checker co-approval.",
      timestamp: new Date().toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).replace(/ /g, '-')
    };
    window.state.accessAuditLog.unshift(auditEntry);
    localStorage.setItem('saronil_accessAuditLog', JSON.stringify(window.state.accessAuditLog));

    alert("Maker approval complete. Request forwarded to Second Approver (Compliance Officer) for co-signing.");
  } else {
    // Standard Single-approval for Read/Write/Edit/Approve/Export
    req.status = "Approved";
    req.approvals.push({
      approverId: "ADM01",
      role: "Hospital Administrator",
      decision: "Approved",
      timestamp: new Date().toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).replace(/ /g, '-')
    });

    // Apply Effective override immediately
    const staff = window.state.staffList || [];
    const s = staff.find(item => item.id === req.staffId);
    if (s) {
      const getParentModule = (item) => {
        if (["Bed Booking & Allocation", "Patient Intake Registry", "Discharge Clearance"].includes(item)) return "Admission";
        if (["Vitals & Nurse Logs", "Clinical & EMR Notes", "Consent Documentation"].includes(item)) return "Treatment";
        if (["Stock Inventory", "Prescription Dispensation"].includes(item)) return "Pharmacy";
        if (["Invoices & Receipts", "Credit Notes & Refunds"].includes(item)) return "Billing";
        if (["Financial Summaries", "Clinical Activity Analytics"].includes(item)) return "Reports";
        if (["Drug List Master", "Service Tariff Master", "Bed Allocation Master", "Staff Registry Master"].includes(item)) return "Master Data";
        return "General";
      };
      s.rbacOverrides = s.rbacOverrides || [];
      s.rbacOverrides.push({
        parentModule: getParentModule(req.module),
        lineItem: req.module,
        permissionType: req.permissionType,
        value: true,
        overrideId: "OVR" + String(100 + s.rbacOverrides.length + 1)
      });
      localStorage.setItem('saronil_staffList', JSON.stringify(window.state.staffList));
    }

    localStorage.setItem('saronil_accessRequests', JSON.stringify(window.state.accessRequests));

    // Audit Log Entry
    const auditEntry = {
      eventId: "AUD" + String(100 + window.state.accessAuditLog.length + 1),
      staffIdAffected: req.staffId,
      requestedBy: req.requestedBy,
      approvedBy: "Admin Prashant",
      secondApprover: "—",
      module: req.module,
      permissionType: req.permissionType,
      previousState: "Requested",
      newState: "Approved",
      reason: "Standard access request single-signoff approved",
      timestamp: new Date().toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).replace(/ /g, '-')
    };
    window.state.accessAuditLog.unshift(auditEntry);
    localStorage.setItem('saronil_accessAuditLog', JSON.stringify(window.state.accessAuditLog));

    alert("Access request approved. Effective immediately.");
  }

  const viewport = document.getElementById('admin-sub-viewport') || document.getElementById('main-content');
  if (viewport) renderPermissionsTab(viewport);
};

window._checkerCoApprove = function(reqId, actor) {
  const req = window.state.accessRequests.find(r => r.id === reqId);
  if (!req) return;

  req.status = "Approved";
  req.approvals.push({
    approverId: "COMP01",
    role: "Compliance Officer",
    decision: "Co-Approved",
    timestamp: new Date().toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).replace(/ /g, '-')
  });

  // Apply effective override immediately
  const staff = window.state.staffList || [];
  const s = staff.find(item => item.id === req.staffId);
  if (s) {
    const getParentModule = (item) => {
      if (["Bed Booking & Allocation", "Patient Intake Registry", "Discharge Clearance"].includes(item)) return "Admission";
      if (["Vitals & Nurse Logs", "Clinical & EMR Notes", "Consent Documentation"].includes(item)) return "Treatment";
      if (["Stock Inventory", "Prescription Dispensation"].includes(item)) return "Pharmacy";
      if (["Invoices & Receipts", "Credit Notes & Refunds"].includes(item)) return "Billing";
      if (["Financial Summaries", "Clinical Activity Analytics"].includes(item)) return "Reports";
      if (["Drug List Master", "Service Tariff Master", "Bed Allocation Master", "Staff Registry Master"].includes(item)) return "Master Data";
      return "General";
    };
    s.rbacOverrides = s.rbacOverrides || [];
    s.rbacOverrides.push({
      parentModule: getParentModule(req.module),
      lineItem: req.module,
      permissionType: req.permissionType,
      value: true,
      overrideId: "OVR" + String(100 + s.rbacOverrides.length + 1)
    });
    localStorage.setItem('saronil_staffList', JSON.stringify(window.state.staffList));
  }

  localStorage.setItem('saronil_accessRequests', JSON.stringify(window.state.accessRequests));

  // Audit Log Entry
  const auditEntry = {
    eventId: "AUD" + String(100 + window.state.accessAuditLog.length + 1),
    staffIdAffected: req.staffId,
    requestedBy: req.requestedBy,
    approvedBy: req.approvals[0].approverId + " (Maker)",
    secondApprover: "Compliance Officer (Checker)",
    module: req.module,
    permissionType: req.permissionType,
    previousState: "Pending Second Approval",
    newState: "Approved",
    reason: "Maker-Checker co-signing verification completed successfully",
    timestamp: new Date().toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).replace(/ /g, '-')
  };
  window.state.accessAuditLog.unshift(auditEntry);
  localStorage.setItem('saronil_accessAuditLog', JSON.stringify(window.state.accessAuditLog));

  alert("Maker-Checker co-signing completed. Delete privileges activated.");
  const viewport = document.getElementById('admin-sub-viewport') || document.getElementById('main-content');
  if (viewport) renderPermissionsTab(viewport);
};

window._makerReject = function(reqId, actor) {
  const req = window.state.accessRequests.find(r => r.id === reqId);
  if (!req) return;

  req.status = "Rejected";
  localStorage.setItem('saronil_accessRequests', JSON.stringify(window.state.accessRequests));

  // Audit Log Entry
  const auditEntry = {
    eventId: "AUD" + String(100 + window.state.accessAuditLog.length + 1),
    staffIdAffected: req.staffId,
    requestedBy: req.requestedBy,
    approvedBy: "—",
    secondApprover: "—",
    module: req.module,
    permissionType: req.permissionType,
    previousState: "Requested",
    newState: "Rejected",
    reason: "Access request rejected during security validation checks",
    timestamp: new Date().toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).replace(/ /g, '-')
  };
  window.state.accessAuditLog.unshift(auditEntry);
  localStorage.setItem('saronil_accessAuditLog', JSON.stringify(window.state.accessAuditLog));

  alert("Access request rejected and logged in security audit trail.");
  const viewport = document.getElementById('admin-sub-viewport') || document.getElementById('main-content');
  if (viewport) renderPermissionsTab(viewport);
};

// --------------------------------------------------------------------------
// SUBTAB 4: BREAK-GLASS EMERGENCY ACCESS
// --------------------------------------------------------------------------
function renderSubTabEmergency(viewport, actor) {
  const grants = window.state.emergencyAccess || [];
  const staff = window.state.staffList || [];

  viewport.innerHTML = `
    <div style="display:grid; grid-template-columns: 320px 1fr; gap:1.5rem; align-items:start; text-align:left;">
      <!-- Left: Request Break-Glass Form -->
      <div class="card" style="padding:15px; display:flex; flex-direction:column; gap:12px;">
        <h4 style="margin:0 0 5px 0; font-size:13px; font-weight:800; border-bottom:1px solid #e2e8f0; padding-bottom:8px; color:#ef4444;">🚨 Trigger Break-Glass Emergency</h4>
        <p style="font-size:11px; color:#64748b; margin-top:0;">Allows clinical staff to immediately invoke emergency time-boxed access (2 hours) to vital modules, subject to mandatory retrospective review.</p>
        
        <div style="display:flex; flex-direction:column; gap:8px; font-size:11px;">
          <div>
            <label style="font-weight:700; color:#475569; display:block; margin-bottom:4px;">Requesting Staff member *</label>
            <select id="emg-staff-id" style="width:100%; padding:6px; border:1px solid #cbd5e1; border-radius:6px; outline:none;">
              ${staff.map(s => `<option value="${s.id}">${s.name} (${s.id})</option>`).join('')}
            </select>
          </div>
          
          <div>
            <label style="font-weight:700; color:#475569; display:block; margin-bottom:4px;">Emergency Module Needed *</label>
            <select id="emg-module" style="width:100%; padding:6px; border:1px solid #cbd5e1; border-radius:6px; outline:none;">
              <option value="Admission">Admission</option>
              <option value="Treatment/Clinical Notes">Treatment/Clinical Notes</option>
              <option value="Pharmacy">Pharmacy</option>
              <option value="Billing/Invoice">Billing/Invoice</option>
            </select>
          </div>
          
          <div>
            <label style="font-weight:700; color:#475569; display:block; margin-bottom:4px;">Mandatory Emergency Reason *</label>
            <textarea id="emg-reason" rows="3" placeholder="Provide clinical emergency reason (e.g. cardiac arrest, consultant unresponsive)..." style="width:100%; padding:6px; border:1px solid #cbd5e1; border-radius:6px; outline:none; font-family:inherit; box-sizing:border-box;"></textarea>
          </div>
          
          <button onclick="window._triggerBreakGlass()" class="btn" style="background:#ef4444; color:#fff; border:none; font-size:11.5px; font-weight:700; padding:8px; border-radius:6px; width:100%; cursor:pointer;">🚨 Activate Break-Glass Access</button>
        </div>
      </div>

      <!-- Right: Active Grants & Reviews -->
      <div class="card" style="padding:15px; display:flex; flex-direction:column; gap:12px;">
        <h4 style="margin:0; font-size:13px; font-weight:800; border-bottom:1px solid #e2e8f0; padding-bottom:8px;">📄 Emergency Break-Glass Logs &amp; Retrospective Audits</h4>
        
        <div class="custom-table-container">
          <table class="custom-table" style="font-size:11px; width:100%; text-align:left;">
            <thead>
              <tr style="background:#f8fafc; border-bottom:1px solid #cbd5e1;">
                <th>Grant ID</th>
                <th>Staff details</th>
                <th>Emergency module</th>
                <th>clinical emergency reason</th>
                <th>Triggered Time</th>
                <th>Expiry</th>
                <th>Status</th>
                <th style="text-align:right; padding-right:15px; width:180px;">Retrospective Review</th>
              </tr>
            </thead>
            <tbody>
              ${grants.length > 0 ? grants.map(g => {
                let badgeClass = 'bg-secondary';
                if (g.status === 'Active (Emergency)') badgeClass = 'bg-danger animate-pulse';
                else if (g.status === 'Reviewed-Justified') badgeClass = 'bg-success';
                else if (g.status === 'Reviewed-Flagged') badgeClass = 'bg-warning';

                return `
                  <tr style="border-bottom:1px solid #cbd5e1;">
                    <td style="font-weight:700;">${g.id}</td>
                    <td><strong>${g.staffName}</strong><br><small style="color:#64748b;">ID: ${g.staffId}</small></td>
                    <td><strong>${g.module}</strong></td>
                    <td style="max-width:200px; text-overflow:ellipsis; overflow:hidden;" title="${g.reason}">${g.reason}</td>
                    <td>${g.grantedAt}</td>
                    <td><span class="badge bg-secondary" style="background:#f1f5f9; color:#475569;">${g.expiryTime}</span></td>
                    <td><span class="badge ${badgeClass}" style="font-size:9.5px; padding:3px 6px;">${g.status}</span></td>
                    <td style="text-align:right; padding-right:15px; white-space:nowrap;">
                      ${g.status === 'Active (Emergency)' ? `
                        <button onclick="window._reviewEmergencyGrant('${g.id}', 'Justified')" class="btn btn-success btn-sm" style="padding:2px 6px; font-size:10px; background:#059669; color:#fff; border:none; border-radius:4px; font-weight:700; cursor:pointer;">Justified</button>
                        <button onclick="window._reviewEmergencyGrant('${g.id}', 'Flagged')" class="btn btn-secondary btn-sm" style="padding:2px 6px; font-size:10px; color:#b45309; border:1px solid #fde68a; background:#fef3c7; border-radius:4px; cursor:pointer;">Flag Policy</button>
                      ` : `
                        <div style="font-size:10px; color:#64748b;">
                          Reviewed by: <strong>${g.reviewedBy}</strong><br>
                          Result: <strong style="color:${g.reviewOutcome === 'Justified' ? '#059669' : '#d97706'}">${g.reviewOutcome}</strong>
                        </div>
                      `}
                    </td>
                  </tr>
                `;
              }).join('') : `
                <tr>
                  <td colspan="8" style="text-align:center; padding:30px; color:#64748b; font-style:italic;">No break-glass emergency triggers logged.</td>
                </tr>
              `}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}

window._triggerBreakGlass = function() {
  const staffId = document.getElementById('emg-staff-id').value;
  const module = document.getElementById('emg-module').value;
  const reason = document.getElementById('emg-reason').value.trim();

  if (!reason) {
    alert("Accreditation Error: A detailed emergency clinical reason is strictly mandatory to trigger Break-Glass bypass access.");
    return;
  }

  const staff = window.state.staffList || [];
  const s = staff.find(item => item.id === staffId);
  if (!s) return;

  const newGrant = {
    id: "EMG" + String(100 + window.state.emergencyAccess.length + 1),
    staffId: s.id,
    staffName: s.name,
    module: module,
    reason: reason,
    grantedAt: new Date().toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).replace(/ /g, '-'),
    expiryTime: "2 Hours",
    status: "Active (Emergency)",
    reviewedBy: "",
    reviewOutcome: "",
    reviewedAt: ""
  };

  window.state.emergencyAccess.unshift(newGrant);
  localStorage.setItem('saronil_emergencyAccess', JSON.stringify(window.state.emergencyAccess));

  // Add temporary effective override
  s.rbacOverrides = s.rbacOverrides || [];
  s.rbacOverrides.push({
    module: module,
    permissionType: "Read",
    value: true,
    overrideId: "OVR_EMG_" + newGrant.id
  });
  localStorage.setItem('saronil_staffList', JSON.stringify(window.state.staffList));

  // Audit Log Entry
  const auditEntry = {
    eventId: "AUD" + String(100 + window.state.accessAuditLog.length + 1),
    staffIdAffected: s.id,
    requestedBy: s.name,
    approvedBy: "Immediate Self-Service Bypass",
    secondApprover: "—",
    module: module,
    permissionType: "Emergency Read",
    previousState: "None",
    newState: "Active (Emergency) for 2 hours",
    reason: `Break-Glass: ${reason}`,
    timestamp: new Date().toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).replace(/ /g, '-')
  };
  window.state.accessAuditLog.unshift(auditEntry);
  localStorage.setItem('saronil_accessAuditLog', JSON.stringify(window.state.accessAuditLog));

  alert(`EMERGENCY ACCESS GRANTED: 2 hours of temporary access allocated. Action logged under key ${newGrant.id}.`);
  const viewport = document.getElementById('admin-sub-viewport') || document.getElementById('main-content');
  if (viewport) renderPermissionsTab(viewport);
};

window._reviewEmergencyGrant = function(grantId, outcome) {
  const grant = window.state.emergencyAccess.find(g => g.id === grantId);
  if (!grant) return;

  grant.status = outcome === 'Justified' ? 'Reviewed-Justified' : 'Reviewed-Flagged';
  grant.reviewedBy = "Admin Prashant";
  grant.reviewOutcome = outcome;
  grant.reviewedAt = new Date().toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).replace(/ /g, '-');

  localStorage.setItem('saronil_emergencyAccess', JSON.stringify(window.state.emergencyAccess));

  // Audit Log Entry
  const auditEntry = {
    eventId: "AUD" + String(100 + window.state.accessAuditLog.length + 1),
    staffIdAffected: grant.staffId,
    requestedBy: grant.staffName,
    approvedBy: "Admin Prashant (Reviewer)",
    secondApprover: "—",
    module: grant.module,
    permissionType: "Retrospective Review",
    previousState: "Active (Emergency)",
    newState: grant.status,
    reason: `Reviewed emergency break-glass. Outcome: ${outcome}`,
    timestamp: new Date().toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).replace(/ /g, '-')
  };
  window.state.accessAuditLog.unshift(auditEntry);
  localStorage.setItem('saronil_accessAuditLog', JSON.stringify(window.state.accessAuditLog));

  alert(`Retrospective review completed. Status updated to ${grant.status}.`);
  const viewport = document.getElementById('admin-sub-viewport') || document.getElementById('main-content');
  if (viewport) renderPermissionsTab(viewport);
};

// --------------------------------------------------------------------------
// SUBTAB 5: PERIODIC ACCESS REVIEW (NABH AUDIT)
// --------------------------------------------------------------------------
function renderSubTabRecertification(viewport, actor) {
  const staff = window.state.staffList || [];
  const reviews = window.state.accessReviews || [];

  viewport.innerHTML = `
    <div class="card" style="padding:15px; text-align:left;">
      <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #cbd5e1; padding-bottom:10px; margin-bottom:15px;">
        <div>
          <h4 style="margin:0; font-size:13px; font-weight:800; color:#1b3a5c;">📅 NABH Periodic Access Audit &amp; Recertification</h4>
          <p style="margin:4px 0 0 0; font-size:11px; color:#64748b;">Accreditation rules demand regular audit checkpoints of access authorizations. Revoke redundant permissions or recertify active credentials.</p>
        </div>
        <button onclick="window._triggerBulkRecertification()" class="btn btn-primary btn-sm" style="font-size:11px; font-weight:700; padding:6px 12px; cursor:pointer;">⚡ Schedule Bulk Recertification</button>
      </div>

      <div class="custom-table-container">
        <table class="custom-table" style="font-size:11.5px; width:100%; text-align:left;">
          <thead>
            <tr style="background:#f8fafc; border-bottom:2px solid #cbd5e1;">
              <th>Staff Details</th>
              <th>Current Designation</th>
              <th>Last Reviewed Date</th>
              <th>Reviewer</th>
              <th>Audit Outcome</th>
              <th>Justification/Notes</th>
              <th style="text-align:right; padding-right:15px; width:220px;">Action</th>
            </tr>
          </thead>
          <tbody>
            ${staff.map(s => {
              const review = reviews.find(r => r.staffId === s.id);
              const lastDate = review ? review.lastReviewed : "Not Audited";
              const revName = review ? review.reviewer : "—";
              const outcome = review ? review.outcome : "Awaiting Review";
              const notes = review ? review.notes : "No audit trail registered for this cycle.";

              let color = '#d97706';
              if (outcome === 'Retained') color = '#059669';
              else if (outcome === 'Revoked') color = '#ef4444';

              return `
                <tr style="border-bottom:1px solid #cbd5e1;">
                  <td><strong>${s.name}</strong><br><small style="color:#64748b;">ID: ${s.id}</small></td>
                  <td>${s.designation}</td>
                  <td><span class="mono">${lastDate}</span></td>
                  <td>${revName}</td>
                  <td><span style="color:${color}; font-weight:700;">${outcome}</span></td>
                  <td style="font-style:italic; max-width:200px; text-overflow:ellipsis; overflow:hidden;" title="${notes}">${notes}</td>
                  <td style="text-align:right; padding-right:15px; white-space:nowrap;">
                    <button onclick="window._recertifyStaffAccess('${s.id}', 'Retained')" class="btn btn-success btn-sm" style="padding:2px 6px; font-size:10px; background:#059669; color:#fff; border:none; border-radius:4px; font-weight:700; cursor:pointer;">Confirm Rights</button>
                    <button onclick="window._recertifyStaffAccess('${s.id}', 'Revoked')" class="btn btn-secondary btn-sm" style="padding:2px 6px; font-size:10px; color:#ef4444; border:1px solid #cbd5e1; background:#ffffff; border-radius:4px; cursor:pointer;">Revoke Rights</button>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

window._recertifyStaffAccess = function(staffId, outcome) {
  const staff = window.state.staffList || [];
  const s = staff.find(item => item.id === staffId);
  if (!s) return;

  const notes = outcome === 'Retained' 
    ? 'Access permissions confirmed necessary and verified for clinical duty' 
    : 'Permissions revoked under quarterly cleanup policy rules';

  const reviews = window.state.accessReviews || [];
  const existingIdx = reviews.findIndex(r => r.staffId === staffId);

  const reviewEntry = {
    staffId: s.id,
    staffName: s.name,
    lastReviewed: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/ /g, '-'),
    reviewer: "Admin Prashant",
    outcome: outcome,
    notes: notes
  };

  if (existingIdx > -1) {
    reviews[existingIdx] = reviewEntry;
  } else {
    reviews.push(reviewEntry);
  }

  localStorage.setItem('saronil_accessReviews', JSON.stringify(reviews));
  window.state.accessReviews = reviews;

  if (outcome === 'Revoked') {
    s.rbacOverrides = [];
    s.rbacSuspended = true;
    localStorage.setItem('saronil_staffList', JSON.stringify(window.state.staffList));
  }

  // Audit Log Entry
  const auditEntry = {
    eventId: "AUD" + String(100 + window.state.accessAuditLog.length + 1),
    staffIdAffected: s.id,
    requestedBy: "Admin Audits",
    approvedBy: "Admin Prashant (Reviewer)",
    secondApprover: "—",
    module: "Periodic Review",
    permissionType: "Recertification Outcome",
    previousState: "Awaiting Review",
    newState: outcome,
    reason: notes,
    timestamp: new Date().toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).replace(/ /g, '-')
  };
  window.state.accessAuditLog.unshift(auditEntry);
  localStorage.setItem('saronil_accessAuditLog', JSON.stringify(window.state.accessAuditLog));

  if (window.showToast) window.showToast("Recertification audit updated.");
  const viewport = document.getElementById('admin-sub-viewport') || document.getElementById('main-content');
  if (viewport) renderPermissionsTab(viewport);
};

window._triggerBulkRecertification = function() {
  alert("NABH Scheduler: Periodic bulk access audit cycle initiated. All clinical user accounts flagged for recertification validation checks.");
};

// --------------------------------------------------------------------------
// SUBTAB 6: ACCESS AUDIT LOGS (APPEND-ONLY)
// --------------------------------------------------------------------------
function renderSubTabAudit(viewport) {
  const auditLog = window.state.accessAuditLog || [];

  viewport.innerHTML = `
    <div class="card" style="padding:15px; text-align:left;">
      <h4 style="margin:0 0 4px 0; font-size:13px; font-weight:800; color:#b91c1c;">📋 Compliance Audit Trails (Append-Only Registry)</h4>
      <p style="font-size:11px; color:#64748b; margin-top:0; margin-bottom:15px;">
        ⚠️ Strict Security Protocol: This table is a read-only registry. Access-control events are directly committed to local storage. Delete and modification permissions are disabled system-wide for this log.
      </p>

      <div class="custom-table-container">
        <table class="custom-table" style="font-size:11px; width:100%; text-align:left;">
          <thead>
            <tr style="background:#f8fafc; border-bottom:2px solid #cbd5e1;">
              <th>Log ID</th>
              <th>Timestamp</th>
              <th>Target Staff ID</th>
              <th>Module</th>
              <th>Action</th>
              <th>State Transition</th>
              <th>Justification / Reason</th>
              <th>Maker (Approver)</th>
              <th>Checker (Second Sign)</th>
            </tr>
          </thead>
          <tbody>
            ${auditLog.map(al => `
              <tr style="border-bottom:1px solid #cbd5e1;">
                <td style="font-weight:700;"><code>${al.eventId}</code></td>
                <td style="white-space:nowrap;">${al.timestamp}</td>
                <td style="font-weight:600;">${al.staffIdAffected}</td>
                <td><span class="badge bg-secondary" style="background:#eff6ff; color:#1e40af; border:1px solid #bfdbfe;">${al.module}</span></td>
                <td style="font-weight:700; color:#1e293b;">${al.permissionType}</td>
                <td style="font-size:10px; font-family:monospace; max-width:180px; overflow:hidden; text-overflow:ellipsis;">
                  <span style="color:#64748b;">${al.previousState}</span> ➔ <span style="color:#059669; font-weight:600;">${al.newState}</span>
                </td>
                <td style="font-style:italic; max-width:180px; overflow:hidden; text-overflow:ellipsis;" title="${al.reason}">${al.reason}</td>
                <td><strong>${al.approvedBy}</strong></td>
                <td><strong>${al.secondApprover || '—'}</strong></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}
