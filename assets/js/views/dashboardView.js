/* ==========================================================================
   SARONIL HMS - DYNAMIC ROLE-BASED DASHBOARDS (dashboardView.js)
   ========================================================================== */

const roleToPersona = {
  'Chairman': 'chairman',
  'CEO': 'ceo',
  'COO': 'coo',
  'Medical Director': 'medDir',
  'Medical Superintendent': 'medSuper',
  'CFO': 'cfo',
  'General Manager': 'gm',
  'Administrator': 'admin',
  'Doctor': 'doctor',
  'Nurse': 'nurse',
  'Billing': 'billing',
  'CASHIER': 'billing',
  'BILLING_EXECUTIVE': 'billing',
  'BILLING_SUPERVISOR': 'billing',
  'MRD_COORDINATOR': 'billing',
  'ACCOUNTS_MANAGER': 'billing',
  'Front Desk': 'admission',
  'Lab': 'lab',
  'Pharmacist': 'pharmacy',
  'ATD Officer': 'atdOfficer',
  'OPD Officer': 'opdOfficer',
  'Information': 'information'
};

const personaToRole = {
  'chairman': 'Chairman',
  'ceo': 'CEO',
  'coo': 'COO',
  'medDir': 'Medical Director',
  'medSuper': 'Medical Superintendent',
  'cfo': 'CFO',
  'gm': 'General Manager',
  'admin': 'Administrator',
  'doctor': 'Doctor',
  'nurse': 'Nurse',
  'billing': 'BILLING_EXECUTIVE',
  'admission': 'Front Desk',
  'lab': 'Lab',
  'pharmacy': 'Pharmacist',
  'atdOfficer': 'ATD Officer',
  'opdOfficer': 'OPD Officer',
  'information': 'Information'
};


window.updateDynamicSidebarUser = function(persona) {
  const nameEl = document.getElementById('sidebar-user-name');
  const selectEl = document.getElementById('sidebar-doctor-select');
  const roleEl = document.getElementById('sidebar-user-role');
  const avatarEl = document.getElementById('sidebar-user-avatar');

  if (!nameEl || !roleEl || !avatarEl) return;

  const users = {
    admin: { name: "Dr. Amit Verma", role: "System Admin", avatar: "AV" },
    admission: { name: "Sarah Jones", role: "Admission Coord", avatar: "SJ" },
    doctor: { name: "Dr. Amit Verma", role: "Sr. Consultant", avatar: "AV" },
    nurse: { name: "Sister Maria", role: "Head Nurse", avatar: "SM" },
    billing: { name: "Rajesh Kumar", role: "Billing Manager", avatar: "RK" },
    lab: { name: "Dr. Anil K.", role: "Pathology Lead", avatar: "AK" },
    pharmacy: { name: "Narendra P.", role: "Chief Pharmacist", avatar: "NP" },
    atdOfficer: { name: "Suresh Menon", role: "ATD Coordinator", avatar: "SM" },
    opdOfficer: { name: "Kavya Reddy", role: "OPD Officer", avatar: "KR" },
    information: { name: "Pooja Singh", role: "Enquiry Executive", avatar: "PS" }
  };

  const user = users[persona] || users.admin;

  if (persona === 'doctor') {
    if (nameEl) nameEl.style.display = 'none';
    if (selectEl) {
      selectEl.style.display = 'block';
      
      // Populate select if empty
      if (selectEl.options.length === 0 && window.state && window.state.doctors) {
        const docs = [{ name: "Dr. Amit Verma", spec: "Sr. Consultant", id: "DOC_AMIT" }, ...window.state.doctors];
        docs.forEach(doc => {
          const opt = document.createElement('option');
          opt.value = doc.id;
          opt.textContent = `${doc.name} (${doc.spec})`;
          selectEl.appendChild(opt);
        });
      }
      
      // Select the active doctor
      const activeDocId = localStorage.getItem('saronil_active_doctor_id') || 'DOC_AMIT';
      selectEl.value = activeDocId;
      
      // Update UI with selected doctor info
      const docs = [{ name: "Dr. Amit Verma", spec: "Sr. Consultant", id: "DOC_AMIT" }, ...(window.state ? window.state.doctors : [])];
      const doc = docs.find(d => d.id === activeDocId) || docs[0];
      
      const initials = doc.name.replace('Dr. ', '').split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
      avatarEl.textContent = initials;
      roleEl.textContent = doc.spec === 'Sr. Consultant' ? 'Sr. Consultant' : `${doc.spec} Consultant`;
      
      if (window.state) {
        window.state.activeDoctor = doc.name;
      }
    }
  } else {
    if (nameEl) {
      nameEl.style.display = 'block';
      nameEl.textContent = user.name;
    }
    if (selectEl) selectEl.style.display = 'none';
    roleEl.textContent = user.role;
    avatarEl.textContent = user.avatar;
    if (window.state) {
      window.state.activeDoctor = null;
    }
  }
};

window.changeSidebarDoctor = function(docId) {
  localStorage.setItem('saronil_active_doctor_id', docId);
  
  // Find doctor and update state
  const docs = [{ name: "Dr. Amit Verma", spec: "Sr. Consultant", id: "DOC_AMIT" }, ...(window.state ? window.state.doctors : [])];
  const doc = docs.find(d => d.id === docId) || docs[0];
  if (window.state) {
    window.state.activeDoctor = doc.name;
  }
  
  // Also filter patients in EMR view if applicable
  window.activeEmrDoctorFilter = doc.name === 'Dr. Amit Verma' ? '' : doc.name;
  
  window.updateDynamicSidebarUser('doctor');
  
  if (window.router && typeof window.router.handleRouting === 'function') {
    window.router.handleRouting();
  }
};


window.views.dashboard = function(container, subAnchor, params) {

  // Read active persona from local storage or default to 'admin'
  let activePersona = localStorage.getItem('saronil_active_persona') || 'admin';
  
  if (subAnchor) {
    activePersona = subAnchor;
    localStorage.setItem('saronil_active_persona', activePersona);
    const currentRole = window.state && window.state.activeUserRole;
    if (roleToPersona[currentRole] !== activePersona) {
      const matchedRole = personaToRole[activePersona];
      if (matchedRole && window.state) {
        window.state.activeUserRole = matchedRole;
        const selector = document.getElementById('global-persona-selector');
        if (selector) {
          selector.value = matchedRole;
        }
      }
    }
  } else if (window.state && window.state.activeUserRole) {
    activePersona = roleToPersona[window.state.activeUserRole] || 'admin';
  }

  // Ensure sidebar user details are updated
  window.updateDynamicSidebarUser(activePersona);

  // Sync dropdown selector and state on initial or direct load
  const currentRole = window.state && window.state.activeUserRole;
  if (roleToPersona[currentRole] !== activePersona) {
    const matchedRole = personaToRole[activePersona];
    if (matchedRole && window.state) {
      window.state.activeUserRole = matchedRole;
      const selector = document.getElementById('global-persona-selector');
      if (selector) {
        selector.value = matchedRole;
      }
    }
  } else {
    const selector = document.getElementById('global-persona-selector');
    if (selector && currentRole) {
      selector.value = currentRole;
    }
  }

  if (params && params.kpi) {
    renderKPIWorkspace(container, params.kpi, activePersona);
  } else {
    renderDashboardLayout(container, activePersona);
  }
};

function renderDashboardLayout(container, persona) {
  container.innerHTML = `
    <!-- Active Persona Dashboard Viewport -->
    <div id="dashboard-persona-viewport"></div>
  `;

  const viewport = document.getElementById('dashboard-persona-viewport');
  
  if (['chairman', 'ceo', 'coo', 'medDir', 'medSuper', 'cfo', 'gm'].includes(persona)) {
    renderExecutiveDashboard(viewport, personaToRole[persona]);
  } else if (persona === 'admin') {
    renderAdminDashboard(viewport);
  } else if (persona === 'admission') {
    renderAdmissionDashboard(viewport);
  } else if (persona === 'doctor') {
    renderDoctorDashboard(viewport);
  } else if (persona === 'nurse') {
    renderNurseDashboard(viewport);
  } else if (persona === 'billing') {
    renderBillingDashboard(viewport);
  } else if (persona === 'lab') {
    renderLabDashboard(viewport);
  } else if (persona === 'pharmacy') {
    renderPharmacyDashboard(viewport);
  } else if (persona === 'atdOfficer') {
    if (window.views && typeof window.views.atdDashboard === 'function') {
      window.views.atdDashboard(viewport);
    }
  } else if (persona === 'opdOfficer') {
    if (window.views && typeof window.views.opdDashboard === 'function') {
      window.views.opdDashboard(viewport);
    }
  } else if (persona === 'information') {
    if (window.views && typeof window.views.informationDashboard === 'function') {
      window.views.informationDashboard(viewport);
    }
  } else {
    renderAdminDashboard(viewport);
  }

  // Initialize Search Event Listeners
  initDashboardSearch();
}

window.renderDashboardSearchInline = function() {
  return `
    <div style="position: relative; width: 320px; display: flex; gap: 0.5rem; align-items: center; margin-left: auto;">
      <div style="position: relative; flex-grow: 1;">
        <span style="position: absolute; left: 10px; top: 50%; transform: translateY(-50%); font-size: 0.8rem; color: var(--text-muted);">🔎</span>
        <input type="text" id="dashboard-patient-search" class="form-control" placeholder="Search patients globally..." style="padding-left: 2rem; height: 36px; font-size: 0.8rem; width: 100%; border-radius: var(--radius-sm);" autocomplete="off">
      </div>
      <button class="btn btn-primary" onclick="window.triggerDashboardSearch()" style="height: 36px; padding: 0 0.75rem; font-size: 0.8rem; font-weight: 600; cursor: pointer;">Search</button>
      <div id="dashboard-search-results" style="display: none; position: absolute; top: 100%; left: 0; right: 0; z-index: 1000; background-color: var(--bg-surface); border: 1px solid var(--border-color); border-radius: var(--radius-sm); box-shadow: var(--shadow-lg); max-height: 250px; overflow-y: auto; margin-top: 4px;"></div>
    </div>
  `;
};


function initDashboardSearch() {
  const searchInput = document.getElementById('dashboard-patient-search');
  const resultsDiv = document.getElementById('dashboard-search-results');
  if (!searchInput || !resultsDiv) return;

  const performSearch = () => {
    const q = searchInput.value.toLowerCase().trim();
    if (!q) {
      resultsDiv.style.display = 'none';
      resultsDiv.innerHTML = '';
      return;
    }

    const matches = state.patients.filter(p => 
      p.name.toLowerCase().includes(q) ||
      p.uhid.toLowerCase().includes(q) ||
      p.mobile.includes(q) ||
      (p.abhaId && p.abhaId.toLowerCase().includes(q))
    ).slice(0, 10);

    if (matches.length === 0) {
      resultsDiv.innerHTML = `
        <div style="padding: 0.75rem 1rem; color: var(--text-muted); font-size: 0.85rem; font-style: italic;">
          No matching patients found.
        </div>
      `;
    } else {
      resultsDiv.innerHTML = matches.map(p => `
        <div class="dashboard-search-item" onclick="window.selectDashboardPatient('${p.uhid}')" style="padding: 0.75rem 1rem; border-bottom: 1px solid var(--border-color); cursor: pointer; display: flex; justify-content: space-between; align-items: center; transition: background-color 0.2s ease;">
          <div>
            <strong style="color: var(--text-primary); font-size: 0.88rem;">${p.name}</strong>
            <div style="font-size: 0.75rem; color: var(--text-secondary); margin-top: 0.15rem;">
              UHID: <span style="font-family: monospace;">${p.uhid}</span> | Mobile: ${p.mobile}
            </div>
          </div>
          <span class="badge ${p.type === 'IPD' ? 'badge-purple' : p.type === 'Emergency' ? 'badge-danger' : 'badge-primary'}" style="font-size: 0.68rem; text-transform: uppercase;">
            ${p.type}
          </span>
        </div>
      `).join('');
    }
    resultsDiv.style.display = 'block';
  };

  searchInput.addEventListener('input', performSearch);
  
  // Listen for enter key
  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const q = searchInput.value.toLowerCase().trim();
      const firstMatch = state.patients.find(p => 
        p.name.toLowerCase().includes(q) ||
        p.uhid.toLowerCase().includes(q) ||
        p.mobile.includes(q) ||
        (p.abhaId && p.abhaId.toLowerCase().includes(q))
      );
      if (firstMatch) {
        window.selectDashboardPatient(firstMatch.uhid);
      }
    }
  });

  // Hide on click outside
  document.addEventListener('click', (e) => {
    if (!e.target.closest('#dashboard-patient-search') && !e.target.closest('#dashboard-search-results')) {
      resultsDiv.style.display = 'none';
    }
  });
}

window.selectDashboardPatient = function(uhid) {
  const searchInput = document.getElementById('dashboard-patient-search');
  const resultsDiv = document.getElementById('dashboard-search-results');
  if (searchInput) searchInput.value = '';
  if (resultsDiv) resultsDiv.style.display = 'none';
  router.navigate(`patients?uhid=${uhid}`);
};

window.triggerDashboardSearch = function() {
  const searchInput = document.getElementById('dashboard-patient-search');
  if (searchInput) {
    const q = searchInput.value.toLowerCase().trim();
    const firstMatch = state.patients.find(p => 
      p.name.toLowerCase().includes(q) ||
      p.uhid.toLowerCase().includes(q) ||
      p.mobile.includes(q) ||
      (p.abhaId && p.abhaId.toLowerCase().includes(q))
    );
    if (firstMatch) {
      window.selectDashboardPatient(firstMatch.uhid);
    } else {
      alert("No matching patient found.");
    }
  }
};


window.switchDashboardPersona = function(persona) {
  const role = personaToRole[persona];
  if (role && typeof window.switchGlobalPersona === 'function') {
    window.switchGlobalPersona(role);
  } else {
    localStorage.setItem('saronil_active_persona', persona);
    window.updateDynamicSidebarUser(persona);
    renderDashboardLayout(document.getElementById('main-content'), persona);
  }
};

window.toggleRegRowExpand = function(uhid) {
  const subrow = document.getElementById(`reg-subrow-${uhid}`);
  if (subrow) {
    subrow.style.display = subrow.style.display === 'none' ? 'table-row' : 'none';
  }
};

window.filterRecentRegistrations = function(type) {
  const tbody = document.getElementById('recent-regs-tbody');
  if (!tbody) return;

  const filteredPatients = state.patients.filter(p => {
    const matchesPrefix = p.uhid && (p.uhid.startsWith('SH-2026-') || p.uhid.startsWith('MH-2026-'));
    const matchesType = (type === 'All') || (p.type === type);
    return matchesPrefix && matchesType;
  }).sort((a, b) => {
    // Sort by UHID number descending (higher = more recently registered)
    const aNum = parseInt((a.uhid || '').split('-')[2]) || 0;
    const bNum = parseInt((b.uhid || '').split('-')[2]) || 0;
    return bNum - aNum;
  }).slice(0, 15);

  if (filteredPatients.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" style="padding: 1.5rem; text-align: center; color: var(--text-muted); font-style: italic;">
          No recent registrations found for "${type}".
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = filteredPatients.map(pat => {
    let typeBadge = '';
    if (pat.type === 'OPD') {
      typeBadge = `<span class="badge badge-primary badge-clickable" style="border-radius: 20px; font-size: 0.7rem; padding: 0.2rem 0.5rem; text-transform: uppercase;" onclick="toggleRegRowExpand('${pat.uhid}')" title="Click to view appointment details">OPD</span>`;
    } else if (pat.type === 'IPD') {
      typeBadge = `<span class="badge badge-purple badge-clickable" style="border-radius: 20px; font-size: 0.7rem; padding: 0.2rem 0.5rem; text-transform: uppercase;" onclick="toggleRegRowExpand('${pat.uhid}')" title="Click to view ward & bed details">IPD</span>`;
    } else if (pat.type === 'Emergency') {
      typeBadge = `<span class="badge badge-danger badge-clickable" style="border-radius: 20px; font-size: 0.7rem; padding: 0.2rem 0.5rem; text-transform: uppercase;" onclick="toggleRegRowExpand('${pat.uhid}')" title="Click to view emergency details">Emergency</span>`;
    } else if (pat.type === 'Daycare') {
      typeBadge = `<span class="badge badge-info badge-clickable" style="border-radius: 20px; font-size: 0.7rem; padding: 0.2rem 0.5rem; text-transform: uppercase;" onclick="toggleRegRowExpand('${pat.uhid}')" title="Click to view daycare details">Daycare</span>`;
    }

    let statusBadge = '';
    if (pat.status === 'Registered') {
      statusBadge = `<span class="badge badge-success" style="font-size: 0.72rem; padding: 0.2rem 0.5rem;">Registered</span>`;
    } else if (pat.status === 'Bed Pending') {
      statusBadge = `<span class="badge badge-warning" style="font-size: 0.72rem; padding: 0.2rem 0.5rem;">Bed Pending</span>`;
    } else if (pat.status === 'Admitted') {
      statusBadge = `<span class="badge badge-success" style="font-size: 0.72rem; padding: 0.2rem 0.5rem;">Admitted</span>`;
    } else if (pat.status === 'Day Care') {
      statusBadge = `<span class="badge badge-info" style="font-size: 0.72rem; padding: 0.2rem 0.5rem; background-color: var(--primary-glow); color: var(--primary);">Day Care</span>`;
    }

    let actionButton = '';
    if (pat.status === 'Bed Pending') {
      actionButton = `<button class="btn btn-primary btn-sm" style="padding: 0.35rem 0.75rem; border-radius: 20px; font-size: 0.75rem; font-weight: 600; cursor: pointer;" onclick="router.navigate('ipdAdmission?uhid=${pat.uhid}')">Allot Bed</button>`;
    } else {
      actionButton = `<button class="btn btn-secondary btn-sm" style="padding: 0.35rem 0.75rem; border-radius: 20px; font-size: 0.75rem; color: var(--text-primary); border: 1px solid var(--border-color); background-color: var(--bg-surface); cursor: pointer;" onclick="router.navigate('patients?uhid=${pat.uhid}')">Open</button>`;
    }

    let detailsHTML = '';
    if (pat.type === 'OPD') {
      const appt = state.appointments.find(a => a.uhid === pat.uhid);
      if (appt) {
        detailsHTML = `
          <div class="expandable-details-card" style="padding: 0.6rem 0.85rem; background-color: var(--bg-surface-elevated); border-radius: 4px; border: 1px dashed var(--border-color); display: flex; flex-direction: column; gap: 0.35rem; text-align: left;">
            <div style="font-size: 0.78rem; font-weight: 700; color: var(--text-primary);">📅 OPD Appointment Details:</div>
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.5rem; font-size: 0.78rem; color: var(--text-secondary);">
              <div><strong>Consultant:</strong> ${appt.doctorName} (${appt.spec})</div>
              <div><strong>Schedule:</strong> ${appt.date} at ${appt.time}</div>
              <div><strong>Status:</strong> <span class="badge badge-success" style="font-size: 0.68rem; padding: 0.1rem 0.35rem; vertical-align: middle;">${appt.status}</span></div>
            </div>
          </div>
        `;
      } else {
        detailsHTML = `<div class="expandable-details-card" style="padding: 0.5rem; color: var(--text-muted); font-style: italic; font-size: 0.78rem; text-align: left;">No active OPD appointment found.</div>`;
      }
    } else if (pat.type === 'IPD') {
      if (pat.status === 'Bed Pending') {
        detailsHTML = `
          <div class="expandable-details-card" style="padding: 0.6rem 0.85rem; background-color: var(--bg-surface-elevated); border-radius: 4px; border: 1px dashed var(--border-color); display: flex; flex-direction: column; gap: 0.35rem; text-align: left;">
            <div style="font-size: 0.78rem; font-weight: 700; color: var(--text-primary);">🛎️ IPD Admission Advice:</div>
            <div style="font-size: 0.78rem; color: var(--text-secondary);">
              Inpatient admission (IPD) advised by <strong>${pat.primaryConsultant}</strong>. Bed allotment is currently pending.
            </div>
          </div>
        `;
      } else {
        const adm = state.admissions.find(a => a.uhid === pat.uhid);
        if (adm) {
          const wardName = state.wards[adm.ward]?.name || adm.ward;
          detailsHTML = `
            <div class="expandable-details-card" style="padding: 0.6rem 0.85rem; background-color: var(--bg-surface-elevated); border-radius: 4px; border: 1px dashed var(--border-color); display: flex; flex-direction: column; gap: 0.35rem; text-align: left;">
              <div style="font-size: 0.78rem; font-weight: 700; color: var(--text-primary);">🛏️ IPD Bed Allocation Details:</div>
              <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.5rem; font-size: 0.78rem; color: var(--text-secondary);">
                <div><strong>Ward:</strong> ${wardName}</div>
                <div><strong>Bed Assigned:</strong> <strong style="color:var(--primary);">${adm.bed}</strong></div>
                <div><strong>Admitting Doctor:</strong> ${adm.doctorName}</div>
                <div><strong>Admitted On:</strong> ${adm.date}</div>
              </div>
            </div>
          `;
        } else {
          detailsHTML = `<div class="expandable-details-card" style="padding: 0.5rem; color: var(--text-muted); font-style: italic; font-size: 0.78rem; text-align: left;">No active IPD bed allocation record.</div>`;
        }
      }
    } else if (pat.type === 'Emergency') {
      const adm = state.admissions.find(a => a.uhid === pat.uhid);
      if (adm) {
        const wardName = state.wards[adm.ward]?.name || adm.ward;
        detailsHTML = `
          <div class="expandable-details-card" style="padding: 0.6rem 0.85rem; background-color: var(--bg-surface-elevated); border-radius: 4px; border: 1px dashed var(--border-color); display: flex; flex-direction: column; gap: 0.35rem; text-align: left;">
            <div style="font-size: 0.78rem; font-weight: 700; color: var(--text-primary);">🚨 Emergency Admission Bed Details:</div>
            <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.5rem; font-size: 0.78rem; color: var(--text-secondary);">
              <div><strong>Ward:</strong> ${wardName}</div>
              <div><strong>Bed Assigned:</strong> <strong style="color:var(--color-danger);">${adm.bed}</strong></div>
              <div><strong>ER Consultant:</strong> ${adm.doctorName}</div>
              <div><strong>Shifted On:</strong> ${adm.date}</div>
            </div>
          </div>
        `;
      } else {
        detailsHTML = `<div class="expandable-details-card" style="padding: 0.5rem; color: var(--text-muted); font-style: italic; font-size: 0.78rem; text-align: left;">No active Emergency trauma admission record.</div>`;
      }
    } else if (pat.type === 'Daycare') {
      detailsHTML = `
        <div class="expandable-details-card" style="padding: 0.6rem 0.85rem; background-color: var(--bg-surface-elevated); border-radius: 4px; border: 1px dashed var(--border-color); display: flex; flex-direction: column; gap: 0.35rem; text-align: left;">
          <div style="font-size: 0.78rem; font-weight: 700; color: var(--text-primary);">🌼 Daycare Procedure Details:</div>
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.5rem; font-size: 0.78rem; color: var(--text-secondary);">
            <div><strong>Procedure:</strong> Chemotherapy / Dialysis</div>
            <div><strong>Attending Doctor:</strong> ${pat.primaryConsultant}</div>
            <div><strong>Scheduled On:</strong> 2026-06-21</div>
          </div>
        </div>
      `;
    }

    return `
      <tr style="border-bottom: 1px solid var(--border-color);">
        <td style="padding: 0.85rem 1rem; color: var(--text-muted); font-family: monospace; font-size: 0.8rem;">${pat.uhid}</td>
        <td style="padding: 0.85rem 1rem;"><strong>${pat.name}</strong></td>
        <td style="padding: 0.85rem 1rem; color: var(--text-secondary);">${pat.age} / ${pat.gender.charAt(0)}</td>
        <td style="padding: 0.85rem 1rem;">${typeBadge}</td>
        <td style="padding: 0.85rem 1rem; color: var(--text-secondary);">${pat.primaryConsultant}</td>
        <td style="padding: 0.85rem 1rem;">${statusBadge}</td>
        <td style="padding: 0.85rem 1rem; text-align: right;">${actionButton}</td>
      </tr>
      <tr id="reg-subrow-${pat.uhid}" style="display: none; background-color: var(--bg-surface-elevated);">
        <td colspan="7" style="padding: 0.5rem 1rem;">
          ${detailsHTML}
        </td>
      </tr>
    `;
  }).join('');
};


// ==========================================================================
// 1. HOSPITAL ADMINISTRATOR DASHBOARD
// ==========================================================================
function renderAdminDashboard(container) {
  // Compute analytics
  let totalRevenue = 0;
  state.billing.forEach(b => totalRevenue += b.paid);
  
  const totalBeds = Object.keys(state.bedsStatus || {}).length || 240;
  const occupiedBeds = Object.values(state.bedsStatus || {}).filter(b => b.status === "Occupied").length || 188;
  const occupancyRate = totalBeds > 0 ? ((occupiedBeds / totalBeds) * 100).toFixed(1) : 78.3;
  const ptsToday = state.patients.length || 342;
  const opdLoad = state.appointments.length || 290;
  const ipdLoad = state.admissions.filter(a => a.status === 'Active').length || 52;
  const revenueVal = totalRevenue > 0 ? totalRevenue : 1245830;

  // Initialize department split data
  window.state.adminDashboardDepts = [
    { name: "Cardiology", revenue: 523250, pct: 42 },
    { name: "General Medicine", revenue: 348830, pct: 28 },
    { name: "Pediatrics", revenue: 186870, pct: 15 },
    { name: "Orthopedics", revenue: 99660, pct: 8 },
    { name: "Neurology", revenue: 62290, pct: 5 },
    { name: "Gynecology", revenue: 24930, pct: 2 }
  ];

  // Helper for rendering KPI cards
  function renderAdminKPICard({ title, value, subtext, status, trendText, trendDirection, isInverse, showComplaintBadge }) {
    let isGood = false;
    if (trendDirection === 'up') {
      isGood = !isInverse;
    } else if (trendDirection === 'down') {
      isGood = isInverse;
    }
    const trendColor = isGood ? 'var(--color-success)' : 'var(--color-danger)';
    const trendIcon = trendDirection === 'up' ? '▲' : (trendDirection === 'down' ? '▼' : '—');
    
    return `
      <div class="admin-kpi-card status-${status}" onclick="alert('Viewing detail for ${title}')">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; width: 100%;">
          <span style="font-size: 0.72rem; font-weight: 700; text-transform: uppercase; color: var(--text-secondary);">${title}</span>
          ${showComplaintBadge && parseInt(value) > 5 ? `<span style="background-color: var(--color-danger); color: white; padding: 2px 6px; border-radius: 4px; font-size: 0.65rem; font-weight: 800;">SLA BREACH</span>` : ''}
        </div>
        <div style="margin-top: 8px; margin-bottom: 8px;">
          <span class="admin-mono" style="font-size: 1.45rem; font-weight: 700; color: var(--text-primary); letter-spacing: -0.02em;">${value}</span>
          <div style="font-size: 0.72rem; color: var(--text-muted); margin-top: 2px;">${subtext}</div>
        </div>
        <div style="display: flex; align-items: center; justify-content: space-between; margin-top: 4px; font-size: 0.72rem; border-top: 1px dashed var(--border-color); padding-top: 6px;">
          <span style="color: ${trendColor}; font-weight: 600; display: flex; align-items: center; gap: 2px;">
            ${trendIcon} ${trendText}
          </span>
          <span style="color: var(--text-muted); font-size: 0.65rem;">Updated just now</span>
        </div>
      </div>
    `;
  }

  // Sort function for department split
  window.sortDeptPerformance = function(sortBy) {
    const depts = window.state.adminDashboardDepts;
    if (sortBy === 'name') {
      depts.sort((a, b) => a.name.localeCompare(b.name));
      const btnName = document.getElementById('sort-dept-name');
      const btnRev = document.getElementById('sort-dept-rev');
      if (btnName && btnRev) {
        btnName.className = 'btn btn-sm btn-primary';
        btnRev.className = 'btn btn-sm btn-secondary';
      }
    } else if (sortBy === 'revenue') {
      depts.sort((a, b) => b.revenue - a.revenue);
      const btnName = document.getElementById('sort-dept-name');
      const btnRev = document.getElementById('sort-dept-rev');
      if (btnName && btnRev) {
        btnName.className = 'btn btn-sm btn-secondary';
        btnRev.className = 'btn btn-sm btn-primary';
      }
    }
    
    const listEl = document.getElementById('dept-performance-list');
    if (listEl) {
      listEl.innerHTML = depts.map(d => `
        <div style="margin-bottom: 12px;">
          <div style="display: flex; justify-content: space-between; font-size: 0.78rem; margin-bottom: 4px; font-weight: 500;">
            <span style="color: var(--text-primary); font-weight: 600;">${d.name}</span>
            <span class="admin-mono" style="color: var(--text-secondary); font-weight: 600;">₹${d.revenue.toLocaleString('en-IN')} (${d.pct}%)</span>
          </div>
          <div style="width: 100%; height: 8px; background-color: var(--border-color); border-radius: 4px; overflow: hidden;">
            <div style="width: ${d.pct}%; height: 100%; background-color: var(--primary); border-radius: 4px; transition: width 0.3s ease;"></div>
          </div>
        </div>
      `).join('');
    }
  };

  const kpis = [
    { title: 'Total Revenue', value: `₹${revenueVal.toLocaleString('en-IN')}`, subtext: "Today's collections", status: 'normal', trendText: '+12.4%', trendDirection: 'up', isInverse: false },
    { title: 'Bed Occupancy %', value: `${occupancyRate}%`, subtext: `${occupiedBeds} / ${totalBeds} beds active`, status: parseFloat(occupancyRate) > 80 ? 'warning' : 'normal', trendText: '+3.1%', trendDirection: 'up', isInverse: false },
    { title: 'Patients Today', value: `${ptsToday}`, subtext: 'New & returning', status: 'normal', trendText: '+8.2%', trendDirection: 'up', isInverse: false },
    { title: 'OPD / IPD Load', value: `${opdLoad} / ${ipdLoad}`, subtext: 'Active registers', status: 'normal', trendText: '+5.7%', trendDirection: 'up', isInverse: false },
    { title: 'Avg Length of Stay', value: '4.1 Days', subtext: 'IPD discharge index', status: 'normal', trendText: '-2.4%', trendDirection: 'down', isInverse: true },
    { title: 'OT Utilisation %', value: '84.5%', subtext: '11 / 13 OTs active', status: 'normal', trendText: '+1.8%', trendDirection: 'up', isInverse: false },
    { title: 'Complaint Count', value: '6', subtext: '4 pending SLA breach', status: 'critical', trendText: '+1', trendDirection: 'up', isInverse: true, showComplaintBadge: true },
    { title: 'NABH Quality Score', value: '9.42 / 10', subtext: 'Compliance index', status: 'normal', trendText: '+0.05', trendDirection: 'up', isInverse: false }
  ];

  container.innerHTML = `
    <style>
      @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&display=swap');
      
      :root {
        --sidebar-width: 240px !important;
        --header-height: 52px !important;
      }
      
      .admin-mono {
        font-family: 'JetBrains Mono', 'Courier New', Courier, monospace !important;
      }
      
      .admin-card {
        background-color: #ffffff;
        border: 1px solid var(--border-color);
        border-radius: var(--radius-md);
        padding: 16px !important;
        box-shadow: var(--shadow-sm);
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
      
      .admin-kpi-scroll-row {
        display: flex;
        gap: 12px;
        overflow-x: auto;
        padding-bottom: 8px;
        margin-bottom: 16px;
        scrollbar-width: thin;
      }
      
      .admin-kpi-scroll-row::-webkit-scrollbar {
        height: 6px;
      }
      
      .admin-kpi-scroll-row::-webkit-scrollbar-thumb {
        background-color: var(--border-color);
        border-radius: 3px;
      }
      
      .admin-kpi-card {
        flex: 0 0 calc(12.5% - 11px);
        min-width: 170px;
        background-color: #ffffff;
        border: 1px solid var(--border-color);
        border-radius: var(--radius-md);
        padding: 16px;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        box-shadow: var(--shadow-sm);
        cursor: pointer;
        transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
        border-left: 4px solid var(--border-color);
      }
      
      .admin-kpi-card.status-normal {
        border-left-color: var(--color-success);
      }
      
      .admin-kpi-card.status-warning {
        border-left-color: var(--color-warning);
      }
      
      .admin-kpi-card.status-critical {
        border-left-color: var(--color-danger);
      }
      
      .admin-kpi-card:hover {
        transform: translateY(-2px);
        box-shadow: var(--shadow-md);
        border-color: var(--primary);
      }
      
      .alert-row {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 10px 12px;
        border-radius: 6px;
        font-size: 0.8rem;
        cursor: pointer;
        transition: transform 0.2s, filter 0.2s;
        border-left: 4px solid var(--border-color);
        text-decoration: none;
      }
      
      .alert-row:hover {
        filter: brightness(0.97);
        transform: translateX(2px);
      }
      
      .on-call-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        display: inline-block;
      }
      
      .on-call-dot.active {
        background-color: var(--color-success);
        box-shadow: 0 0 8px var(--color-success);
      }
      
      .on-call-dot.occupied {
        background-color: var(--color-danger);
        box-shadow: 0 0 8px var(--color-danger);
      }
      
      @media (max-width: 900px) {
        .admin-two-col {
          grid-template-columns: 1fr !important;
        }
        .admin-bottom-row {
          grid-template-columns: 1fr !important;
        }
      }
    </style>

    <!-- PAGE HEADING -->
    <div style="margin-top: 4px; margin-bottom: 16px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
      <div>
        <h1 style="font-size: 1.35rem; font-weight: 700; color: var(--text-primary); margin: 0; font-family: var(--font-display);">Hospital Overview Dashboard</h1>
        <div style="font-size: 0.78rem; color: var(--text-muted); margin-top: 2px;">Real-time clinical, financial, operations, and compliance indicators.</div>
      </div>
      <div class="admin-mono" style="font-size: 0.72rem; background-color: var(--primary-glow); color: var(--primary); padding: 4px 12px; border-radius: 20px; font-weight: 600; border: 1px solid var(--border-color);">
        Role: Hospital Administrator
      </div>
    </div>

    <!-- SECTION 1: KPI STAT CARDS ROW -->
    <div class="admin-kpi-scroll-row">
      ${kpis.map(k => renderAdminKPICard(k)).join('')}
    </div>

    <!-- SECTION 2: QUICK ACTIONS BAR -->
    <div style="background-color: #ffffff; padding: 12px 16px; border-radius: var(--radius-md); border: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center; gap: 12px; flex-wrap: wrap; margin-bottom: 16px; box-shadow: var(--shadow-sm);">
      <div style="display: flex; gap: 8px; flex-wrap: wrap; align-items: center;">
        <button class="btn btn-secondary" onclick="router.navigate('admin-reports')" style="font-size: 0.8rem; font-weight: 600; padding: 6px 12px; height: 34px;">Hospital Reports</button>
        <button class="btn btn-secondary" onclick="router.navigate('admin-roles')" style="font-size: 0.8rem; font-weight: 600; padding: 6px 12px; height: 34px;">User Management</button>
        <button class="btn btn-secondary" onclick="router.navigate('admin-employees')" style="font-size: 0.8rem; font-weight: 600; padding: 6px 12px; height: 34px;">Department Management</button>
        <button class="btn btn-secondary" onclick="alert('Navigating to system settings...')" style="font-size: 0.8rem; font-weight: 600; padding: 6px 12px; height: 34px;">System Settings</button>
        <button class="btn btn-secondary" onclick="alert('Opening audit logs...')" style="font-size: 0.8rem; font-weight: 600; padding: 6px 12px; height: 34px;">Audit Logs</button>
        <button class="btn btn-secondary" onclick="router.navigate('ruleManager')" style="font-size: 0.8rem; font-weight: 600; padding: 6px 12px; height: 34px;">BMW Compliance</button>
        <button class="btn btn-secondary" onclick="alert('Opening Grievance Tracker...')" style="font-size: 0.8rem; font-weight: 600; padding: 6px 12px; height: 34px;">Grievance Tracker</button>
        <button class="btn btn-secondary" onclick="router.navigate('admin-employees')" style="font-size: 0.8rem; font-weight: 600; padding: 6px 12px; height: 34px;">Credentialing Alerts</button>
      </div>
    </div>

    <!-- SECTION 3: TWO-COLUMN MAIN AREA -->
    <div class="admin-two-col" style="display: grid; grid-template-columns: 3fr 2fr; gap: 16px; margin-bottom: 16px;">
      
      <!-- LEFT COLUMN (60%) -->
      <div style="display: flex; flex-direction: column; gap: 16px;">
        
        <!-- a) Admissions Trend stacked bar chart -->
        <div class="admin-card">
          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-color); padding-bottom: 8px; margin-bottom: 8px;">
            <h3 style="font-size: 0.85rem; font-weight: 700; text-transform: uppercase; margin: 0; color: var(--text-primary);">Admissions Trend (Past 6 Months)</h3>
            <div style="display: flex; gap: 12px; font-size: 0.72rem; font-weight: 500;">
              <span style="display: flex; align-items: center; gap: 4px;"><span style="width: 8px; height: 8px; background-color: var(--primary); border-radius: 2px;"></span>OPD (Blue)</span>
              <span style="display: flex; align-items: center; gap: 4px;"><span style="width: 8px; height: 8px; background-color: var(--secondary); border-radius: 2px;"></span>IPD (Indigo)</span>
            </div>
          </div>
          <div style="display: flex; height: 160px; align-items: flex-end; justify-content: space-between; border-left: 1px solid var(--border-color); border-bottom: 1px solid var(--border-color); padding: 10px 10px 0 24px; position: relative; margin-top: 12px; margin-left: 12px;">
            <!-- Horizontal dashed gridlines -->
            <div style="position: absolute; left: 0; right: 0; bottom: 40px; border-bottom: 1px dashed var(--border-color); pointer-events: none;"></div>
            <div style="position: absolute; left: 0; right: 0; bottom: 80px; border-bottom: 1px dashed var(--border-color); pointer-events: none;"></div>
            <div style="position: absolute; left: 0; right: 0; bottom: 120px; border-bottom: 1px dashed var(--border-color); pointer-events: none;"></div>
            
            <!-- Axis values -->
            <div style="position: absolute; left: -25px; bottom: 35px; font-size: 0.65rem; color: var(--text-muted); font-family: monospace;">100</div>
            <div style="position: absolute; left: -25px; bottom: 75px; font-size: 0.65rem; color: var(--text-muted); font-family: monospace;">200</div>
            <div style="position: absolute; left: -25px; bottom: 115px; font-size: 0.65rem; color: var(--text-muted); font-family: monospace;">300</div>
            
            <!-- Jan -->
            <div style="display: flex; flex-direction: column; align-items: center; flex: 1; gap: 4px; z-index: 1;">
              <div style="display: flex; flex-direction: column; width: 28px; height: 116px; border-radius: 3px 3px 0 0; overflow: hidden; box-shadow: var(--shadow-sm);">
                <div style="height: 20px; background-color: var(--secondary);" title="IPD: 45"></div>
                <div style="height: 96px; background-color: var(--primary);" title="OPD: 210"></div>
              </div>
              <span class="admin-mono" style="font-size: 0.7rem; color: var(--text-secondary); margin-top: 2px;">Jan</span>
            </div>
            
            <!-- Feb -->
            <div style="display: flex; flex-direction: column; align-items: center; flex: 1; gap: 4px; z-index: 1;">
              <div style="display: flex; flex-direction: column; width: 28px; height: 132px; border-radius: 3px 3px 0 0; overflow: hidden; box-shadow: var(--shadow-sm);">
                <div style="height: 22px; background-color: var(--secondary);" title="IPD: 50"></div>
                <div style="height: 110px; background-color: var(--primary);" title="OPD: 240"></div>
              </div>
              <span class="admin-mono" style="font-size: 0.7rem; color: var(--text-secondary); margin-top: 2px;">Feb</span>
            </div>
            
            <!-- Mar -->
            <div style="display: flex; flex-direction: column; align-items: center; flex: 1; gap: 4px; z-index: 1;">
              <div style="display: flex; flex-direction: column; width: 28px; height: 125px; border-radius: 3px 3px 0 0; overflow: hidden; box-shadow: var(--shadow-sm);">
                <div style="height: 22px; background-color: var(--secondary);" title="IPD: 48"></div>
                <div style="height: 103px; background-color: var(--primary);" title="OPD: 225"></div>
              </div>
              <span class="admin-mono" style="font-size: 0.7rem; color: var(--text-secondary); margin-top: 2px;">Mar</span>
            </div>
            
            <!-- Apr -->
            <div style="display: flex; flex-direction: column; align-items: center; flex: 1; gap: 4px; z-index: 1;">
              <div style="display: flex; flex-direction: column; width: 28px; height: 144px; border-radius: 3px 3px 0 0; overflow: hidden; box-shadow: var(--shadow-sm);">
                <div style="height: 25px; background-color: var(--secondary);" title="IPD: 55"></div>
                <div style="height: 119px; background-color: var(--primary);" title="OPD: 260"></div>
              </div>
              <span class="admin-mono" style="font-size: 0.7rem; color: var(--text-secondary); margin-top: 2px;">Apr</span>
            </div>
            
            <!-- May -->
            <div style="display: flex; flex-direction: column; align-items: center; flex: 1; gap: 4px; z-index: 1;">
              <div style="display: flex; flex-direction: column; width: 28px; height: 154px; border-radius: 3px 3px 0 0; overflow: hidden; box-shadow: var(--shadow-sm);">
                <div style="height: 26px; background-color: var(--secondary);" title="IPD: 58"></div>
                <div style="height: 128px; background-color: var(--primary);" title="OPD: 280"></div>
              </div>
              <span class="admin-mono" style="font-size: 0.7rem; color: var(--text-secondary); margin-top: 2px;">May</span>
            </div>
            
            <!-- Jun -->
            <div style="display: flex; flex-direction: column; align-items: center; flex: 1; gap: 4px; z-index: 1;">
              <div style="display: flex; flex-direction: column; width: 28px; height: 156px; border-radius: 3px 3px 0 0; overflow: hidden; box-shadow: var(--shadow-sm);">
                <div style="height: 24px; background-color: var(--secondary);" title="IPD: 52"></div>
                <div style="height: 132px; background-color: var(--primary);" title="OPD: 290"></div>
              </div>
              <span class="admin-mono" style="font-size: 0.7rem; color: var(--primary); font-weight: 700; margin-top: 2px;">Jun</span>
            </div>
          </div>
        </div>

        <!-- b) Department Performance (Revenue Split) sortable -->
        <div class="admin-card">
          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-color); padding-bottom: 8px; margin-bottom: 8px;">
            <h3 style="font-size: 0.85rem; font-weight: 700; text-transform: uppercase; margin: 0; color: var(--text-primary);">Department Performance (Revenue Split)</h3>
            <div style="display: flex; gap: 6px;">
              <button id="sort-dept-rev" class="btn btn-sm btn-primary" onclick="window.sortDeptPerformance('revenue')" style="font-size: 0.75rem; padding: 2px 8px; height: 26px; border-radius: 4px;">Sort by Revenue</button>
              <button id="sort-dept-name" class="btn btn-sm btn-secondary" onclick="window.sortDeptPerformance('name')" style="font-size: 0.75rem; padding: 2px 8px; height: 26px; border-radius: 4px;">Sort by Name</button>
            </div>
          </div>
          <div id="dept-performance-list" style="display: flex; flex-direction: column; gap: 10px; margin-top: 8px;">
            <!-- Rendered dynamically -->
          </div>
        </div>

        <!-- c) OT Utilisation Table -->
        <div class="admin-card" style="overflow-x: auto;">
          <div style="border-bottom: 1px solid var(--border-color); padding-bottom: 8px; margin-bottom: 8px;">
            <h3 style="font-size: 0.85rem; font-weight: 700; text-transform: uppercase; margin: 0; color: var(--text-primary);">OT Utilisation Summary</h3>
          </div>
          <table class="custom-table" style="font-size: 0.82rem; width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background-color: var(--bg-surface-elevated); border-bottom: 1px solid var(--border-color);">
                <th style="padding: 8px 10px; text-align: left; font-weight: 600; color: var(--text-primary); font-size: 0.72rem; text-transform: uppercase;">OT Name</th>
                <th style="padding: 8px 10px; text-align: center; font-weight: 600; color: var(--text-primary); font-size: 0.72rem; text-transform: uppercase;">Scheduled</th>
                <th style="padding: 8px 10px; text-align: center; font-weight: 600; color: var(--text-primary); font-size: 0.72rem; text-transform: uppercase;">Completed</th>
                <th style="padding: 8px 10px; text-align: center; font-weight: 600; color: var(--text-primary); font-size: 0.72rem; text-transform: uppercase;">Cancelled</th>
                <th style="padding: 8px 10px; text-align: right; font-weight: 600; color: var(--text-primary); font-size: 0.72rem; text-transform: uppercase;">Utilisation %</th>
              </tr>
            </thead>
            <tbody>
              <tr style="border-bottom: 1px solid var(--border-color);">
                <td style="padding: 8px 10px; font-weight: 600; color: var(--text-primary);">OT-1 (General Surgery)</td>
                <td class="admin-mono" style="padding: 8px 10px; text-align: center;">5</td>
                <td class="admin-mono" style="padding: 8px 10px; text-align: center; color: var(--color-success);">4</td>
                <td class="admin-mono" style="padding: 8px 10px; text-align: center; color: var(--color-danger);">1</td>
                <td class="admin-mono" style="padding: 8px 10px; text-align: right; font-weight: 700; color: var(--color-success);">80.0%</td>
              </tr>
              <tr style="border-bottom: 1px solid var(--border-color);">
                <td style="padding: 8px 10px; font-weight: 600; color: var(--text-primary);">OT-2 (Orthopaedics)</td>
                <td class="admin-mono" style="padding: 8px 10px; text-align: center;">4</td>
                <td class="admin-mono" style="padding: 8px 10px; text-align: center; color: var(--color-success);">3</td>
                <td class="admin-mono" style="padding: 8px 10px; text-align: center; color: var(--color-danger);">1</td>
                <td class="admin-mono" style="padding: 8px 10px; text-align: right; font-weight: 700; color: var(--color-success);">75.0%</td>
              </tr>
              <tr style="border-bottom: 1px solid var(--border-color);">
                <td style="padding: 8px 10px; font-weight: 600; color: var(--text-primary);">OT-3 (Cardiology)</td>
                <td class="admin-mono" style="padding: 8px 10px; text-align: center;">3</td>
                <td class="admin-mono" style="padding: 8px 10px; text-align: center; color: var(--color-success);">3</td>
                <td class="admin-mono" style="padding: 8px 10px; text-align: center; color: var(--text-success);">0</td>
                <td class="admin-mono" style="padding: 8px 10px; text-align: right; font-weight: 700; color: var(--color-success);">100.0%</td>
              </tr>
              <tr style="border-bottom: 1px solid var(--border-color);">
                <td style="padding: 8px 10px; font-weight: 600; color: var(--text-primary);">OT-4 (Neurology)</td>
                <td class="admin-mono" style="padding: 8px 10px; text-align: center;">2</td>
                <td class="admin-mono" style="padding: 8px 10px; text-align: center; color: var(--color-success);">1</td>
                <td class="admin-mono" style="padding: 8px 10px; text-align: center; color: var(--text-success);">0</td>
                <td class="admin-mono" style="padding: 8px 10px; text-align: right; font-weight: 700; color: var(--color-warning);">50.0%</td>
              </tr>
              <tr style="border-bottom: 1px solid var(--border-color);">
                <td style="padding: 8px 10px; font-weight: 600; color: var(--text-primary);">OT-5 (Maternity)</td>
                <td class="admin-mono" style="padding: 8px 10px; text-align: center;">6</td>
                <td class="admin-mono" style="padding: 8px 10px; text-align: center; color: var(--color-success);">5</td>
                <td class="admin-mono" style="padding: 8px 10px; text-align: center; color: var(--color-danger);">1</td>
                <td class="admin-mono" style="padding: 8px 10px; text-align: right; font-weight: 700; color: var(--color-success);">83.3%</td>
              </tr>
              <tr>
                <td style="padding: 8px 10px; font-weight: 600; color: var(--text-primary);">OT-6 (Emergency Trauma)</td>
                <td class="admin-mono" style="padding: 8px 10px; text-align: center;">8</td>
                <td class="admin-mono" style="padding: 8px 10px; text-align: center; color: var(--color-success);">8</td>
                <td class="admin-mono" style="padding: 8px 10px; text-align: center; color: var(--text-success);">0</td>
                <td class="admin-mono" style="padding: 8px 10px; text-align: right; font-weight: 700; color: var(--color-success);">100.0%</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- d) Government Scheme Summary -->
        <div class="admin-card" style="overflow-x: auto;">
          <div style="border-bottom: 1px solid var(--border-color); padding-bottom: 8px; margin-bottom: 8px;">
            <h3 style="font-size: 0.85rem; font-weight: 700; text-transform: uppercase; margin: 0; color: var(--text-primary);">Government Schemes Claims Summary</h3>
          </div>
          <table class="custom-table" style="font-size: 0.82rem; width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background-color: var(--bg-surface-elevated); border-bottom: 1px solid var(--border-color);">
                <th style="padding: 8px 10px; text-align: left; font-weight: 600; color: var(--text-primary); font-size: 0.72rem; text-transform: uppercase;">Scheme</th>
                <th style="padding: 8px 10px; text-align: center; font-weight: 600; color: var(--text-primary); font-size: 0.72rem; text-transform: uppercase;">Submitted</th>
                <th style="padding: 8px 10px; text-align: center; font-weight: 600; color: var(--text-primary); font-size: 0.72rem; text-transform: uppercase;">Approved</th>
                <th style="padding: 8px 10px; text-align: center; font-weight: 600; color: var(--text-primary); font-size: 0.72rem; text-transform: uppercase;">Pending</th>
                <th style="padding: 8px 10px; text-align: center; font-weight: 600; color: var(--text-primary); font-size: 0.72rem; text-transform: uppercase;">Rejected</th>
                <th style="padding: 8px 10px; text-align: right; font-weight: 600; color: var(--text-primary); font-size: 0.72rem; text-transform: uppercase;">Total Claim Value</th>
              </tr>
            </thead>
            <tbody>
              <tr style="border-bottom: 1px solid var(--border-color);">
                <td style="padding: 8px 10px; font-weight: 600; color: var(--text-primary);">PMJAY (Ayushman Bharat)</td>
                <td class="admin-mono" style="padding: 8px 10px; text-align: center;">145</td>
                <td class="admin-mono" style="padding: 8px 10px; text-align: center; color: var(--color-success); font-weight: 600;">120</td>
                <td class="admin-mono" style="padding: 8px 10px; text-align: center; color: var(--color-warning);">18</td>
                <td class="admin-mono" style="padding: 8px 10px; text-align: center; color: var(--color-danger);">7</td>
                <td class="admin-mono" style="padding: 8px 10px; text-align: right; font-weight: 600; color: var(--text-primary);">₹18,20,000</td>
              </tr>
              <tr style="border-bottom: 1px solid var(--border-color);">
                <td style="padding: 8px 10px; font-weight: 600; color: var(--text-primary);">CGHS (Central Govt)</td>
                <td class="admin-mono" style="padding: 8px 10px; text-align: center;">98</td>
                <td class="admin-mono" style="padding: 8px 10px; text-align: center; color: var(--color-success); font-weight: 600;">85</td>
                <td class="admin-mono" style="padding: 8px 10px; text-align: center; color: var(--color-warning);">10</td>
                <td class="admin-mono" style="padding: 8px 10px; text-align: center; color: var(--color-danger);">3</td>
                <td class="admin-mono" style="padding: 8px 10px; text-align: right; font-weight: 600; color: var(--text-primary);">₹12,50,000</td>
              </tr>
              <tr style="border-bottom: 1px solid var(--border-color);">
                <td style="padding: 8px 10px; font-weight: 600; color: var(--text-primary);">ECHS (Ex-Servicemen)</td>
                <td class="admin-mono" style="padding: 8px 10px; text-align: center;">64</td>
                <td class="admin-mono" style="padding: 8px 10px; text-align: center; color: var(--color-success); font-weight: 600;">52</td>
                <td class="admin-mono" style="padding: 8px 10px; text-align: center; color: var(--color-warning);">9</td>
                <td class="admin-mono" style="padding: 8px 10px; text-align: center; color: var(--color-danger);">3</td>
                <td class="admin-mono" style="padding: 8px 10px; text-align: right; font-weight: 600; color: var(--text-primary);">₹8,40,000</td>
              </tr>
              <tr>
                <td style="padding: 8px 10px; font-weight: 600; color: var(--text-primary);">State Scheme (Arogya Karnataka)</td>
                <td class="admin-mono" style="padding: 8px 10px; text-align: center;">112</td>
                <td class="admin-mono" style="padding: 8px 10px; text-align: center; color: var(--color-success); font-weight: 600;">95</td>
                <td class="admin-mono" style="padding: 8px 10px; text-align: center; color: var(--color-warning);">12</td>
                <td class="admin-mono" style="padding: 8px 10px; text-align: center; color: var(--color-danger);">5</td>
                <td class="admin-mono" style="padding: 8px 10px; text-align: right; font-weight: 600; color: var(--text-primary);">₹14,10,000</td>
              </tr>
            </tbody>
          </table>
        </div>

      </div>

      <!-- RIGHT COLUMN (40%) -->
      <div style="display: flex; flex-direction: column; gap: 16px;">
        
        <!-- a) Alerts & Compliance Center -->
        <div class="admin-card">
          <div style="border-bottom: 1px solid var(--border-color); padding-bottom: 8px; margin-bottom: 8px;">
            <h3 style="font-size: 0.85rem; font-weight: 700; text-transform: uppercase; margin: 0; color: var(--text-primary);">Alerts & Compliance Center</h3>
          </div>
          <div style="display: flex; flex-direction: column; gap: 8px;">
            <!-- Critical Patient Alert (red) -->
            <div class="alert-row" style="background-color: var(--color-danger-bg); border-left-color: var(--color-danger); color: #991b1b;" onclick="router.navigate('emergency')">
              <span style="font-size: 1.1rem; line-height: 1;">🚨</span>
              <div style="flex: 1;">
                <strong>Critical Patient Alert</strong><br>
                2 Trauma patients logged in CCU requiring urgent ventilator checks.
              </div>
            </div>
            
            <!-- Delayed Discharges (amber) -->
            <div class="alert-row" style="background-color: var(--color-warning-bg); border-left-color: var(--color-warning); color: #92400e;" onclick="router.navigate('atd')">
              <span style="font-size: 1.1rem; line-height: 1;">⏳</span>
              <div style="flex: 1;">
                <strong>Delayed Discharges</strong><br>
                4 IPD discharges delayed beyond 2 hours due to billing approvals.
              </div>
            </div>

            <!-- Pending Claims (blue) -->
            <div class="alert-row" style="background-color: var(--color-info-bg); border-left-color: var(--color-info); color: #0369a1;" onclick="router.navigate('insurance')">
              <span style="font-size: 1.1rem; line-height: 1;">🛡️</span>
              <div style="flex: 1;">
                <strong>Pending TPA Claims</strong><br>
                12 TPA Pre-auth claims waiting for insurance desk upload.
              </div>
            </div>

            <!-- Low Inventory (amber) -->
            <div class="alert-row" style="background-color: var(--color-warning-bg); border-left-color: var(--color-warning); color: #92400e;" onclick="router.navigate('pharmacy')">
              <span style="font-size: 1.1rem; line-height: 1;">💊</span>
              <div style="flex: 1;">
                <strong>Low Inventory Alert</strong><br>
                Paracetamol stock below min reorder level in main pharmacy.
              </div>
            </div>

            <!-- BMW waste compliance status (red if overdue) -->
            <div class="alert-row" style="background-color: var(--color-danger-bg); border-left-color: var(--color-danger); color: #991b1b;" onclick="router.navigate('ruleManager')">
              <span style="font-size: 1.1rem; line-height: 1;">☣️</span>
              <div style="flex: 1;">
                <strong>BMW Compliance Overdue</strong><br>
                Bio-Medical Waste clearance overdue by 3.5 hours in Block-C.
              </div>
            </div>

            <!-- MLC cases pending closure (purple) -->
            <div class="alert-row" style="background-color: #faf5ff; border-left-color: #a855f7; color: #6b21a8;" onclick="router.navigate('emergency')">
              <span style="font-size: 1.1rem; line-height: 1;">⚖️</span>
              <div style="flex: 1;">
                <strong>MLC Cases Pending</strong><br>
                3 Medico-Legal cases pending police reports and closure.
              </div>
            </div>

            <!-- Staff credentialing expiries (orange) -->
            <div class="alert-row" style="background-color: #fff7ed; border-left-color: #f97316; color: #c2410c;" onclick="router.navigate('admin-employees')">
              <span style="font-size: 1.1rem; line-height: 1;">👨‍⚕️</span>
              <div style="flex: 1;">
                <strong>Credential Expiries</strong><br>
                5 Nurses credentials expiring within 30 days. Renewal required.
              </div>
            </div>

            <!-- Infection control (red if triggered) -->
            <div class="alert-row" style="background-color: var(--color-danger-bg); border-left-color: var(--color-danger); color: #991b1b;" onclick="router.navigate('ruleManager')">
              <span style="font-size: 1.1rem; line-height: 1;">⚠️</span>
              <div style="flex: 1;">
                <strong>Infection Control Alert</strong><br>
                HAI rate threshold breach detected in CCU yesterday.
              </div>
            </div>
          </div>
        </div>

        <!-- b) NABH Quality Indicators mini-panel -->
        <div class="admin-card">
          <div style="border-bottom: 1px solid var(--border-color); padding-bottom: 8px; margin-bottom: 8px;">
            <h3 style="font-size: 0.85rem; font-weight: 700; text-transform: uppercase; margin: 0; color: var(--text-primary);">NABH Quality Indicators</h3>
          </div>
          <div style="display: flex; flex-direction: column; gap: 10px;">
            
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 4px 0; border-bottom: 1px dashed var(--border-color);">
              <span style="font-size: 0.78rem; font-weight: 500; color: var(--text-secondary);">HAI (Infection) Rate</span>
              <div style="display: flex; align-items: center; gap: 8px;">
                <span style="font-size: 0.7rem; color: var(--text-muted);">Target &lt; 0.5%</span>
                <span class="admin-mono" style="font-size: 0.78rem; font-weight: 700; color: var(--color-success);">0.32%</span>
                <span style="width: 8px; height: 8px; border-radius: 50%; background-color: var(--color-success);"></span>
              </div>
            </div>

            <div style="display: flex; justify-content: space-between; align-items: center; padding: 4px 0; border-bottom: 1px dashed var(--border-color);">
              <span style="font-size: 0.78rem; font-weight: 500; color: var(--text-secondary);">Patient Fall Rate</span>
              <div style="display: flex; align-items: center; gap: 8px;">
                <span style="font-size: 0.7rem; color: var(--text-muted);">Target &lt; 0.1%</span>
                <span class="admin-mono" style="font-size: 0.78rem; font-weight: 700; color: var(--color-success);">0.08%</span>
                <span style="width: 8px; height: 8px; border-radius: 50%; background-color: var(--color-success);"></span>
              </div>
            </div>

            <div style="display: flex; justify-content: space-between; align-items: center; padding: 4px 0; border-bottom: 1px dashed var(--border-color);">
              <span style="font-size: 0.78rem; font-weight: 500; color: var(--text-secondary);">Medication Error Rate</span>
              <div style="display: flex; align-items: center; gap: 8px;">
                <span style="font-size: 0.7rem; color: var(--text-muted);">Target: 0%</span>
                <span class="admin-mono" style="font-size: 0.78rem; font-weight: 700; color: var(--color-warning);">0.02%</span>
                <span style="width: 8px; height: 8px; border-radius: 50%; background-color: var(--color-warning);"></span>
              </div>
            </div>

            <div style="display: flex; justify-content: space-between; align-items: center; padding: 4px 0; border-bottom: 1px dashed var(--border-color);">
              <span style="font-size: 0.78rem; font-weight: 500; color: var(--text-secondary);">Readmission Rate (30d)</span>
              <div style="display: flex; align-items: center; gap: 8px;">
                <span style="font-size: 0.7rem; color: var(--text-muted);">Target &lt; 5.0%</span>
                <span class="admin-mono" style="font-size: 0.78rem; font-weight: 700; color: var(--color-success);">4.10%</span>
                <span style="width: 8px; height: 8px; border-radius: 50%; background-color: var(--color-success);"></span>
              </div>
            </div>

            <div style="display: flex; justify-content: space-between; align-items: center; padding: 4px 0; border-bottom: 1px dashed var(--border-color);">
              <span style="font-size: 0.78rem; font-weight: 500; color: var(--text-secondary);">Mortality Index</span>
              <div style="display: flex; align-items: center; gap: 8px;">
                <span style="font-size: 0.7rem; color: var(--text-muted);">Target &lt; 1.0</span>
                <span class="admin-mono" style="font-size: 0.78rem; font-weight: 700; color: var(--color-success);">0.85</span>
                <span style="width: 8px; height: 8px; border-radius: 50%; background-color: var(--color-success);"></span>
              </div>
            </div>

            <div style="display: flex; justify-content: space-between; align-items: center; padding: 4px 0;">
              <span style="font-size: 0.78rem; font-weight: 500; color: var(--text-secondary);">Complaint TAT (Resolution)</span>
              <div style="display: flex; align-items: center; gap: 8px;">
                <span style="font-size: 0.7rem; color: var(--text-muted);">Target &lt; 24h</span>
                <span class="admin-mono" style="font-size: 0.78rem; font-weight: 700; color: var(--color-success);">18.5h</span>
                <span style="width: 8px; height: 8px; border-radius: 50%; background-color: var(--color-success);"></span>
              </div>
            </div>

          </div>
        </div>

        <!-- c) Complaint & Grievance Tracker -->
        <div class="admin-card">
          <div style="border-bottom: 1px solid var(--border-color); padding-bottom: 8px; margin-bottom: 8px;">
            <h3 style="font-size: 0.85rem; font-weight: 700; text-transform: uppercase; margin: 0; color: var(--text-primary);">Grievance Tracker</h3>
          </div>
          
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; text-align: center; background-color: var(--bg-surface-elevated); padding: 8px; border-radius: 6px;">
            <div>
              <span style="font-size: 0.65rem; text-transform: uppercase; color: var(--text-secondary); font-weight: 600;">Open</span>
              <div class="admin-mono" style="font-size: 1.15rem; font-weight: 700; color: var(--color-danger);">6</div>
            </div>
            <div>
              <span style="font-size: 0.65rem; text-transform: uppercase; color: var(--text-secondary); font-weight: 600;">Ack</span>
              <div class="admin-mono" style="font-size: 1.15rem; font-weight: 700; color: var(--color-warning);">12</div>
            </div>
            <div>
              <span style="font-size: 0.65rem; text-transform: uppercase; color: var(--text-secondary); font-weight: 600;">Resolved</span>
              <div class="admin-mono" style="font-size: 1.15rem; font-weight: 700; color: var(--color-success);">45</div>
            </div>
          </div>
          
          <div style="font-size: 0.78rem; margin: 4px 0; font-weight: 500; display: flex; justify-content: space-between;">
            <span>Avg Resolution Time:</span>
            <strong class="admin-mono" style="color: var(--text-primary);">14.2 Hours</strong>
          </div>
          
          <div style="margin-top: 8px; border-top: 1px solid var(--border-color); padding-top: 8px;">
            <div style="font-size: 0.72rem; font-weight: 700; text-transform: uppercase; color: var(--text-muted); margin-bottom: 6px;">Top 3 Overdue Grievances</div>
            
            <div style="display: flex; flex-direction: column; gap: 8px;">
              <div style="background-color: var(--color-danger-bg); padding: 6px 8px; border-radius: 4px; font-size: 0.75rem;">
                <div style="display: flex; justify-content: space-between; font-weight: 600; margin-bottom: 2px;">
                  <span class="admin-mono" style="color: #991b1b;">#COMP-9428</span>
                  <span style="color: var(--color-danger); font-weight: bold;">4 Days Overdue</span>
                </div>
                <div style="color: #7f1d1d;">Billing discrepancy regarding deluxe ward upgrade charges.</div>
              </div>
              
              <div style="background-color: var(--color-warning-bg); padding: 6px 8px; border-radius: 4px; font-size: 0.75rem;">
                <div style="display: flex; justify-content: space-between; font-weight: 600; margin-bottom: 2px;">
                  <span class="admin-mono" style="color: #92400e;">#COMP-9511</span>
                  <span style="color: var(--color-warning); font-weight: bold;">2 Days Overdue</span>
                </div>
                <div style="color: #78350f;">Dietary services delayed lunch delivery in Room 405.</div>
              </div>
              
              <div style="background-color: var(--color-warning-bg); padding: 6px 8px; border-radius: 4px; font-size: 0.75rem;">
                <div style="display: flex; justify-content: space-between; font-weight: 600; margin-bottom: 2px;">
                  <span class="admin-mono" style="color: #92400e;">#COMP-9584</span>
                  <span style="color: var(--color-warning); font-weight: bold;">1 Day Overdue</span>
                </div>
                <div style="color: #78350f;">Nursing service slow response to patient call bells in CCU.</div>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>

    <!-- SECTION 4: BOTTOM ROW (3 equal cards) -->
    <div class="admin-bottom-row" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px;">
      
      <!-- Staff On-Call Status -->
      <div class="admin-card">
        <div style="border-bottom: 1px solid var(--border-color); padding-bottom: 8px; margin-bottom: 8px;">
          <h3 style="font-size: 0.85rem; font-weight: 700; text-transform: uppercase; margin: 0; color: var(--text-primary);">Staff On-Call Roster</h3>
        </div>
        <div style="display: flex; flex-direction: column; gap: 8px;">
          
          <div style="display: flex; justify-content: space-between; align-items: center; padding: 4px 0; border-bottom: 1px dashed var(--border-color);">
            <div>
              <div style="font-weight: 600; font-size: 0.8rem; color: var(--text-primary);">Dr. Abhishek Kumar</div>
              <div style="font-size: 0.72rem; color: var(--text-muted);">Cardiology | <span class="admin-mono">+91 98450 11022</span></div>
            </div>
            <span style="background-color: var(--color-danger-bg); color: var(--color-danger); padding: 2px 8px; border-radius: 20px; font-size: 0.7rem; font-weight: 600; display: flex; align-items: center; gap: 4px;">
              <span class="on-call-dot occupied"></span> Occupied
            </span>
          </div>

          <div style="display: flex; justify-content: space-between; align-items: center; padding: 4px 0; border-bottom: 1px dashed var(--border-color);">
            <div>
              <div style="font-weight: 600; font-size: 0.8rem; color: var(--text-primary);">Dr. Devanti Devi</div>
              <div style="font-size: 0.72rem; color: var(--text-muted);">Gen Medicine | <span class="admin-mono">+91 98450 11027</span></div>
            </div>
            <span style="background-color: var(--color-success-bg); color: var(--color-success); padding: 2px 8px; border-radius: 20px; font-size: 0.7rem; font-weight: 600; display: flex; align-items: center; gap: 4px;">
              <span class="on-call-dot active"></span> Available
            </span>
          </div>

          <div style="display: flex; justify-content: space-between; align-items: center; padding: 4px 0; border-bottom: 1px dashed var(--border-color);">
            <div>
              <div style="font-weight: 600; font-size: 0.8rem; color: var(--text-primary);">Dr. Sarah Jenkins</div>
              <div style="font-size: 0.72rem; color: var(--text-muted);">Orthopedics | <span class="admin-mono">+91 98450 11029</span></div>
            </div>
            <span style="background-color: var(--color-success-bg); color: var(--color-success); padding: 2px 8px; border-radius: 20px; font-size: 0.7rem; font-weight: 600; display: flex; align-items: center; gap: 4px;">
              <span class="on-call-dot active"></span> Available
            </span>
          </div>

          <div style="display: flex; justify-content: space-between; align-items: center; padding: 4px 0;">
            <div>
              <div style="font-weight: 600; font-size: 0.8rem; color: var(--text-primary);">Dr. Amit Patel</div>
              <div style="font-size: 0.72rem; color: var(--text-muted);">Pediatrics | <span class="admin-mono">+91 98450 11024</span></div>
            </div>
            <span style="background-color: var(--color-danger-bg); color: var(--color-danger); padding: 2px 8px; border-radius: 20px; font-size: 0.7rem; font-weight: 600; display: flex; align-items: center; gap: 4px;">
              <span class="on-call-dot occupied"></span> Occupied
            </span>
          </div>

        </div>
      </div>
      
      <!-- Patient Satisfaction Drill-down -->
      <div class="admin-card">
        <div style="border-bottom: 1px solid var(--border-color); padding-bottom: 8px; margin-bottom: 8px;">
          <h3 style="font-size: 0.85rem; font-weight: 700; text-transform: uppercase; margin: 0; color: var(--text-primary);">Patient Satisfaction</h3>
        </div>
        
        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 8px;">
          <div class="admin-mono" style="font-size: 1.8rem; font-weight: 800; color: var(--primary);">4.5<span style="font-size: 1rem; color: var(--text-muted);">/5.0</span></div>
          <div>
            <div style="font-size: 0.78rem; font-weight: bold; color: var(--text-primary);">89.2% Positive Feedback</div>
            <div style="font-size: 0.7rem; color: var(--text-muted);">Based on 280 discharges this month</div>
          </div>
        </div>

        <table style="width: 100%; font-size: 0.78rem; border-collapse: collapse;">
          <thead>
            <tr style="border-bottom: 1px solid var(--border-color); text-align: left; font-weight: 600; color: var(--text-muted);">
              <th style="padding: 4px 0;">Department</th>
              <th style="text-align: right; padding: 4px 0;">Score</th>
              <th style="text-align: right; padding: 4px 0;">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr style="border-bottom: 1px dashed var(--border-color);">
              <td style="padding: 4px 0; font-weight: 600;">Cardiology</td>
              <td class="admin-mono" style="text-align: right; padding: 4px 0;">4.7</td>
              <td style="text-align: right; padding: 4px 0; color: var(--color-success); font-weight: bold;">Excel</td>
            </tr>
            <tr style="border-bottom: 1px dashed var(--border-color);">
              <td style="padding: 4px 0; font-weight: 600;">General Medicine</td>
              <td class="admin-mono" style="text-align: right; padding: 4px 0;">4.2</td>
              <td style="text-align: right; padding: 4px 0; color: var(--color-success); font-weight: bold;">Good</td>
            </tr>
            <tr style="border-bottom: 1px dashed var(--border-color);">
              <td style="padding: 4px 0; font-weight: 600;">Emergency Medicine</td>
              <td class="admin-mono" style="text-align: right; padding: 4px 0; color: var(--color-warning);">3.8</td>
              <td style="text-align: right; padding: 4px 0; color: var(--color-warning); font-weight: bold;">Fair</td>
            </tr>
            <tr style="border-bottom: 1px dashed var(--border-color);">
              <td style="padding: 4px 0; font-weight: 600;">Pediatrics</td>
              <td class="admin-mono" style="text-align: right; padding: 4px 0;">4.6</td>
              <td style="text-align: right; padding: 4px 0; color: var(--color-success); font-weight: bold;">Excel</td>
            </tr>
            <tr>
              <td style="padding: 4px 0; font-weight: 600;">Gynecology & Obs</td>
              <td class="admin-mono" style="text-align: right; padding: 4px 0;">4.5</td>
              <td style="text-align: right; padding: 4px 0; color: var(--color-success); font-weight: bold;">Excel</td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <!-- Mortality & Morbidity Summary -->
      <div class="admin-card">
        <div style="border-bottom: 1px solid var(--border-color); padding-bottom: 8px; margin-bottom: 8px;">
          <h3 style="font-size: 0.85rem; font-weight: 700; text-transform: uppercase; margin: 0; color: var(--text-primary);">Mortality & Morbidity</h3>
        </div>
        
        <div style="display: flex; flex-direction: column; gap: 8px;">
          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px dashed var(--border-color); padding-bottom: 6px;">
            <span style="font-size: 0.78rem; color: var(--text-secondary); font-weight: 600;">Deaths (This Month):</span>
            <span class="admin-mono" style="font-size: 0.95rem; font-weight: 700; color: var(--text-primary);">8 Cases</span>
          </div>
          
          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px dashed var(--border-color); padding-bottom: 6px;">
            <span style="font-size: 0.78rem; color: var(--text-secondary); font-weight: 600;">Expected vs. Actual:</span>
            <span class="admin-mono" style="font-size: 0.85rem; color: var(--color-success); font-weight: bold;">10 vs. 8 (Index 0.8)</span>
          </div>

          <div style="background-color: var(--primary-glow); padding: 8px; border-radius: 6px; border: 1px solid var(--border-color); margin-top: 2px;">
            <div style="font-size: 0.65rem; font-weight: 700; text-transform: uppercase; color: var(--primary);">Upcoming M&M Committee Meeting</div>
            <div class="admin-mono" style="font-size: 0.78rem; font-weight: 700; color: var(--text-primary); margin-top: 2px;">05-Jul-2026 | 03:00 PM IST</div>
            <div style="font-size: 0.65rem; color: var(--text-muted); margin-top: 1px;">Boardroom A & MS Teams link</div>
          </div>
          
          <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 2px; font-size: 0.75rem;">
            <span style="color: var(--text-secondary); font-weight: 600;">Pending Case Audits:</span>
            <span class="admin-mono" style="color: var(--color-danger); font-weight: 700; background-color: var(--color-danger-bg); padding: 1px 6px; border-radius: 4px;">2 Cases Pending</span>
          </div>
        </div>
      </div>

    </div>
  `;

  // Draw the initial sorted departments split
  window.sortDeptPerformance('revenue');
}

// ==========================================================================
// 2. ADMISSION DESK DASHBOARD
// ==========================================================================
function renderAdmissionDashboard(container) {
  if (window.views && window.views.admissionDashboard) {
    window.views.admissionDashboard(container);
  } else {
    container.innerHTML = `<div style="padding: 2rem;">Loading Admission & Bed Command Center...</div>`;
  }
}

// ==========================================================================
// 3. DOCTOR DASHBOARD
// ==========================================================================
function renderDoctorDashboard(container) {
  // Pull doctor clinical details
  const activeDocId = localStorage.getItem('saronil_active_doctor_id') || 'DOC_AMIT';
  const doctorObj = (window.state?.doctors || []).find(d => d.id === activeDocId) || { name: "Dr. Amit Verma", spec: "Cardiology" };
  const docName = doctorObj.name;
  
  // Set window.state default mock values for doctor dashboard if not exists
  if (!window.state.doctorActivePatients) {
    window.state.doctorActivePatients = [
      {
        uhid: 'UHID20000001',
        name: 'Ramesh Chandra',
        age: 62,
        gender: 'Male',
        bloodGroup: 'O+',
        diagnosis: 'Acute Coronary Syndrome',
        icd10: 'I24.9',
        allergies: 'Penicillin (Anaphylaxis)',
        vitalsTrend: [
          { bp: '135/85', hr: 92, temp: 98.4, spo2: 96, time: '12:00' },
          { bp: '138/90', hr: 95, temp: 98.6, spo2: 95, time: '13:00' },
          { bp: '142/95', hr: 104, temp: 99.1, spo2: 94, time: '14:00' }
        ],
        news2: 2,
        medications: [
          { name: 'Tab. Aspirin', dose: '150 mg OD' },
          { name: 'Inj. Heparin', dose: '5000 IU IV' },
          { name: 'Tab. Atorvastatin', dose: '40 mg HS' }
        ],
        goals: [
          'Maintain SpO2 > 94% on room air',
          'Keep systolic BP below 140 mmHg'
        ],
        consents: [
          { id: 'con-1', name: 'Informed Consent for Coronary Angiography', signed: false }
        ]
      },
      {
        uhid: 'UHID20000002',
        name: 'Sourav Desai',
        age: 45,
        gender: 'Male',
        bloodGroup: 'B+',
        diagnosis: 'Severe Pneumonia / Urosepsis',
        icd10: 'J18.9 / A41.9',
        allergies: 'Sulfa Drugs (Rash)',
        vitalsTrend: [
          { bp: '110/70', hr: 88, temp: 99.8, spo2: 94, time: '10:00' },
          { bp: '102/65', hr: 98, temp: 101.2, spo2: 91, time: '12:00' },
          { bp: '92/58', hr: 115, temp: 102.4, spo2: 89, time: '14:00' }
        ],
        news2: 10,
        medications: [
          { name: 'Inj. Piperacillin-Tazobactam', dose: '4.5 g IV Q6H' },
          { name: 'Inj. Paracetamol', dose: '1 g IV Q6H' },
          { name: 'Nasal Oxygen', dose: '4 L/min' }
        ],
        goals: [
          'Maintain MAP > 65 mmHg',
          'Broad-spectrum antibiotics within 1h'
        ],
        consents: [
          { id: 'con-2', name: 'Informed Consent for Central Venous Line', signed: false }
        ]
      },
      {
        uhid: 'UHID20000003',
        name: 'Amit Sharma',
        age: 29,
        gender: 'Male',
        bloodGroup: 'A+',
        diagnosis: 'Acute Appendicitis',
        icd10: 'K35.8',
        allergies: 'No Known Allergies',
        vitalsTrend: [
          { bp: '120/80', hr: 72, temp: 98.6, spo2: 99, time: '09:00' },
          { bp: '118/78', hr: 75, temp: 98.9, spo2: 98, time: '11:00' },
          { bp: '122/82', hr: 78, temp: 99.2, spo2: 99, time: '13:00' }
        ],
        news2: 0,
        medications: [
          { name: 'Tab. Paracetamol', dose: '650 mg TDS' },
          { name: 'Inj. Cefuroxime', dose: '1.5 g IV pre-op' }
        ],
        goals: [
          'NPO (Nil Per Os) post-midnight',
          'Pain score monitoring Q4H'
        ],
        consents: [
          { id: 'con-3', name: 'Informed Consent for Laparoscopic Appendectomy', signed: false }
        ]
      }
    ];
  }

  if (!window.state.criticalBannerItems) {
    window.state.criticalBannerItems = [
      { id: 'crit-1', text: 'Critical Lab Value: Haemoglobin 6.4 g/dL for patient Fatima Begum', patientUhid: 'SH-2026-04810', type: 'lab' },
      { id: 'crit-2', text: 'Critical NEWS Score: 7 for patient Deepak Verma in Emergency Bay', patientUhid: 'SH-2026-04755', type: 'news' }
    ];
  }

  if (!window.state.doctorAlerts) {
    window.state.doctorAlerts = [
      { id: 'alt-1', type: 'sepsis', severity: 'red', text: 'Sepsis Warning: Patient Deepak Verma (Emergency) NEWS Score: 7. Evaluate immediately.', patientUhid: 'SH-2026-04755', time: '15 mins ago' },
      { id: 'alt-2', type: 'lab', severity: 'red', text: 'Critical Lab: Haemoglobin 6.4 g/dL (Ref: 11.5-15.5) for Fatima Begum', patientUhid: 'SH-2026-04810', time: '10 mins ago' },
      { id: 'alt-3', type: 'drug', severity: 'orange', text: 'Drug-Drug Interaction Flagged: Aspirin + Heparin co-prescription for Vikram Singh.', patientUhid: 'SH-2026-04790', time: '30 mins ago' },
      { id: 'alt-4', type: 'allergy', severity: 'orange', text: 'Allergy Alert: Patient Rajesh Kumar allergic to Penicillin — check prescriptions.', patientUhid: 'SH-2026-04821', time: '5 mins ago' },
      { id: 'alt-5', type: 'prn', severity: 'amber', text: 'PRN Med Review: Inj. Tramadol SOS due for review for Mohammed Iqbal.', patientUhid: 'SH-2026-04799', time: '1 hour ago' },
      { id: 'alt-6', type: 'ready', severity: 'blue', text: '4 Lab Results Ready for Review — 2 critical flags (Fatima Begum, Vikram Singh).', patientUhid: 'SH-2026-04810', time: 'Just now' },
      { id: 'alt-7', type: 'session', severity: 'blue', text: 'OPD consultation session active. 7 patients in queue, 3 waiting.', time: '20 mins ago' },
      { id: 'alt-8', type: 'referral', severity: 'purple', text: 'Referral Received from Cardiology (Dr. Anand) for Pramod Rao.', patientUhid: 'SH-2026-04851', time: '2 hours ago' }
    ];
  }

  window.state.doctorDutyStatus = window.state.doctorDutyStatus || 'On Duty';
  window.state.activeDoctorPatientUhid = window.state.activeDoctorPatientUhid || 'SH-2026-04821';

  // Toggle duty availability
  window.setDoctorDutyStatus = function(status) {
    window.state.doctorDutyStatus = status;
    const now = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    alert(`Status updated to "${status}". Nursing station notified at ${now}.`);
    const viewport = document.getElementById('dashboard-persona-viewport');
    if (viewport) {
      renderDoctorDashboard(viewport);
    }
  };

  // Switch active patient profile quickview
  window.selectDoctorDashboardPatient = function(uhid) {
    window.state.activeDoctorPatientUhid = uhid;
    const viewport = document.getElementById('dashboard-persona-viewport');
    if (viewport) {
      renderDoctorDashboard(viewport);
    }
  };

  // Route critical alerts to respective landing pages
  window.reviewCriticalResult = function(uhid, type) {
    let p360tab = 'Summary & Timeline';
    if (type === 'lab') {
      p360tab = 'Labs';
    } else if (type === 'news') {
      p360tab = 'Vitals';
    }
    window.router.navigate(`patients?uhid=${uhid}&p360tab=${p360tab}`);
  };

  // Sign consent form
  window.signPatientConsent = function(consentId, patientUhid, event) {
    event.stopPropagation();
    const patient = window.state.doctorActivePatients.find(p => p.uhid === patientUhid);
    if (patient) {
      const consent = patient.consents.find(c => c.id === consentId);
      if (consent) {
        consent.signed = true;
        alert(`Consent Form Signed: "${consent.name}" logged successfully.`);
        const viewport = document.getElementById('dashboard-persona-viewport');
        if (viewport) {
          renderDoctorDashboard(viewport);
        }
      }
    }
  };

  // Dismiss critical banner item
  window.dismissCriticalBannerItem = function(id, event) {
    event.stopPropagation();
    window.state.criticalBannerItems = window.state.criticalBannerItems.filter(item => item.id !== id);
    const viewport = document.getElementById('dashboard-persona-viewport');
    if (viewport) {
      renderDoctorDashboard(viewport);
    }
  };

  // Acknowledge Alert
  window.acknowledgeDoctorAlert = function(id, event) {
    event.stopPropagation();
    const alertItem = window.state.doctorAlerts.find(a => a.id === id);
    if (alertItem) {
      const now = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
      alert(`Alert Acknowledged.\nDoctor ID: ${activeDocId}\nTimestamp: ${now}`);
      window.state.doctorAlerts = window.state.doctorAlerts.filter(a => a.id !== id);
      const viewport = document.getElementById('dashboard-persona-viewport');
      if (viewport) {
        renderDoctorDashboard(viewport);
      }
    }
  };

  // Pull active patient
  const activePatient = window.state.doctorActivePatients.find(p => p.uhid === window.state.activeDoctorPatientUhid) || window.state.doctorActivePatients[0];

  // Helper for rendering Doctor KPI Cards
  function renderDocKPICard({ title, value, subtext, status, trendText, trendDirection, isInverse }) {
    let isGood = false;
    if (trendDirection === 'up') {
      isGood = !isInverse;
    } else if (trendDirection === 'down') {
      isGood = isInverse;
    }
    const trendColor = isGood ? 'var(--color-success)' : 'var(--color-danger)';
    const trendIcon = trendDirection === 'up' ? '▲' : (trendDirection === 'down' ? '▼' : '—');
    
    return `
      <div class="doctor-kpi-card status-${status}">
        <span style="font-size: 0.72rem; font-weight: 700; text-transform: uppercase; color: var(--text-secondary);">${title}</span>
        <div style="margin-top: 6px; margin-bottom: 6px;">
          <span class="admin-mono" style="font-size: 1.4rem; font-weight: 700; color: var(--text-primary); letter-spacing: -0.02em;">${value}</span>
          <div style="font-size: 0.72rem; color: var(--text-muted); margin-top: 1px;">${subtext}</div>
        </div>
        <div style="display: flex; align-items: center; justify-content: space-between; font-size: 0.72rem; border-top: 1px dashed var(--border-color); padding-top: 4px; margin-top: 4px;">
          <span style="color: ${trendColor}; font-weight: 600; display: flex; align-items: center; gap: 2px;">
            ${trendIcon} ${trendText}
          </span>
        </div>
      </div>
    `;
  }

  // Define doctor dashboard data
  const kpis = [
    { title: 'Patients Today', value: '13', subtext: 'OPD scheduled load', status: 'normal', trendText: '+2 vs yesterday', trendDirection: 'up', isInverse: false },
    { title: 'Consultations Pending', value: '11', subtext: 'Waiting in lobby', status: 'warning', trendText: '-1 vs last hour', trendDirection: 'down', isInverse: true },
    { title: 'Critical Patients', value: '3', subtext: 'NEWS ≥ 5 or ICU status', status: 'critical', trendText: '+1 in CCU', trendDirection: 'up', isInverse: true },
    { title: 'Lab Results to Review', value: `${window.state.criticalBannerItems.filter(b => b.type === 'lab').length + 2}`, subtext: 'Unread LIS alerts', status: 'warning', trendText: '+2 unread', trendDirection: 'up', isInverse: true },
    { title: 'Discharges Pending', value: '2', subtext: 'Awaiting doctor summary', status: 'normal', trendText: 'Steady queue', trendDirection: 'neutral', isInverse: false },
    { title: 'Follow-up Consults', value: '3', subtext: 'Booked today', status: 'normal', trendText: '+1 scheduled', trendDirection: 'up', isInverse: false },
    { title: 'Consent Forms Pending', value: '2', subtext: 'Pre-op unsigned', status: 'warning', trendText: '+1 urgent', trendDirection: 'up', isInverse: true },
    { title: 'Referrals Inbox', value: '1', subtext: 'Inbound unread', status: 'normal', trendText: '+1 new', trendDirection: 'up', isInverse: true }
  ];

  const opdQueueData = (() => {
    const todayAppts = (window.state.appointments || []).filter(a =>
      a.date === '2026-06-29' || a.date === '2026-06-17'
    );
    const liveQueue = todayAppts.map(a => ({
      name: a.patientName,
      uhid: a.uhid,
      waitTime: a.waitTime || Math.floor(Math.random() * 60 + 5),
      visitType: a.visitType || a.type || 'OPD',
      time: a.time,
      status: a.status === 'Checked-in' || a.status === 'Arrived' ? 'Checked-in' :
              a.status === 'In-Consultation' || a.status === 'In Consultation' ? 'In-Consultation' :
              a.status === 'Completed' ? 'Completed' :
              a.status === 'No-show' || a.status === 'No Show' ? 'No-show' : 'Scheduled'
    }));
    // Fallback static queue if no live appointments seeded yet
    if (liveQueue.length === 0) {
      return [
        { name: 'Sunita Sharma', uhid: 'SH-2026-04817', waitTime: 42, visitType: 'Follow-up', time: '10:15 AM', status: 'Checked-in' },
        { name: 'Rajan Pillai', uhid: 'SH-2026-04840', waitTime: 67, visitType: 'Follow-up', time: '09:45 AM', status: 'In-Consultation' },
        { name: 'Anjali Bose', uhid: 'SH-2026-04845', waitTime: 28, visitType: 'New', time: '11:00 AM', status: 'Checked-in' },
        { name: 'Vikrant Gupta', uhid: 'SH-2026-04862', waitTime: 13, visitType: 'New', time: '11:15 AM', status: 'Checked-in' },
        { name: 'Pramod Rao', uhid: 'SH-2026-04851', waitTime: 88, visitType: 'Referral', time: '09:00 AM', status: 'Completed' },
        { name: 'Nandita Kumari', uhid: 'SH-2026-04855', waitTime: 5, visitType: 'Follow-up', time: '11:30 AM', status: 'Scheduled' }
      ];
    }
    return liveQueue;
  })();
  opdQueueData.sort((a, b) => b.waitTime - a.waitTime);

  const otListData = [
    { name: 'Amit Sharma', proc: 'Laparoscopic Appendectomy', ot: 'OT-3', time: '02:00 PM', cssd: 'Y', anaesthesia: 'Y' },
    { name: 'Ramesh Chandra', proc: 'Coronary Angiography', ot: 'Cath Lab 1', time: '04:30 PM', cssd: 'Y', anaesthesia: 'N' }
  ];

  const ipdQueueData = (() => {
    const activeIPD = (window.state.patients || []).filter(p =>
      p.type === 'IPD' && p.status !== 'Discharged' && p.bed && p.bed !== '—'
    ).slice(0, 6);
    if (activeIPD.length > 0) {
      return activeIPD.map(p => ({
        name: p.name,
        uhid: p.uhid,
        bed: `${p.ward} / ${p.bed}`,
        los: p.los || 1,
        news: p.newsScore || 0,
        status: p.dischargeStatus ? 'Discharge Pending' : (p.newsScore >= 5 ? 'Critical' : p.newsScore >= 3 ? 'Review Due' : 'Stable')
      }));
    }
    return [
      { name: 'Rajesh Kumar', uhid: 'SH-2026-04821', bed: 'General Ward / B-12', los: 3, news: 1, status: 'Discharge Pending' },
      { name: 'Mohammed Iqbal', uhid: 'SH-2026-04799', bed: 'HDU / H-02', los: 5, news: 4, status: 'Discharge Pending' },
      { name: 'Vikram Singh', uhid: 'SH-2026-04790', bed: 'ICU / ICU-05', los: 5, news: 5, status: 'Critical' },
      { name: 'Arjun Nair', uhid: 'SH-2026-04798', bed: 'ICU / ICU-07', los: 5, news: 1, status: 'Stable' }
    ];
  })();
  ipdQueueData.sort((a, b) => b.news - a.news);

  const pendingOrdersData = [
    { name: 'Ramesh Chandra', test: 'Troponin-T Fast', ordered: '14:15', tat: '1 hour', status: 'Processing' },
    { name: 'Sourav Desai', test: 'Blood Culture & Sensitivity', ordered: '11:00', tat: '4 hours', status: 'Delayed' },
    { name: 'KL Bose', test: 'Chest X-Ray Portable', ordered: '15:10', tat: '2 hours', status: 'Sample Collected' }
  ];

  container.innerHTML = `
    <style>
      @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&display=swap');
      
      :root {
        --sidebar-width: 240px !important;
        --header-height: 52px !important;
      }
      
      .admin-mono {
        font-family: 'JetBrains Mono', 'Courier New', Courier, monospace !important;
      }
      
      .admin-kpi-scroll-row {
        display: flex;
        gap: 12px;
        overflow-x: auto;
        padding-bottom: 8px;
        margin-bottom: 16px;
        scrollbar-width: thin;
      }
      
      @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.5; }
      }
      
      .doctor-critical-banner {
        position: sticky;
        top: -1.5rem;
        margin: -1.5rem -1.5rem 16px -1.5rem;
        z-index: 99;
        display: flex;
        flex-direction: column;
      }
      
      .doctor-critical-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        background-color: #fee2e2;
        border-bottom: 1px solid #fca5a5;
        padding: 10px 24px;
        color: #991b1b;
        font-size: 0.8rem;
        font-weight: 600;
        box-shadow: var(--shadow-sm);
      }
      
      .doctor-kpi-card {
        flex: 0 0 calc(12.5% - 11px);
        min-width: 170px;
        background-color: #ffffff;
        border: 1px solid var(--border-color);
        border-radius: var(--radius-md);
        padding: 14px;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        box-shadow: var(--shadow-sm);
        cursor: pointer;
        transition: transform 0.2s ease, box-shadow 0.2s ease;
        border-left: 4px solid var(--border-color);
      }
      
      .doctor-kpi-card.status-normal {
        border-left-color: var(--color-success);
      }
      
      .doctor-kpi-card.status-warning {
        border-left-color: var(--color-warning);
      }
      
      .doctor-kpi-card.status-critical {
        border-left-color: var(--color-danger);
      }
      
      .doctor-kpi-card:hover {
        transform: translateY(-2px);
        box-shadow: var(--shadow-md);
      }
      
      .doctor-card {
        background-color: #ffffff;
        border: 1px solid var(--border-color);
        border-radius: var(--radius-md);
        padding: 16px !important;
        box-shadow: var(--shadow-sm);
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
      
      .duty-bar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        background-color: #ffffff;
        border: 1px solid var(--border-color);
        border-radius: var(--radius-md);
        padding: 10px 16px;
        margin-bottom: 16px;
        box-shadow: var(--shadow-sm);
        flex-wrap: wrap;
        gap: 12px;
      }
      
      .toggle-btn {
        padding: 6px 12px;
        font-size: 0.78rem;
        font-weight: 600;
        border: 1px solid var(--border-color);
        background-color: #ffffff;
        color: var(--text-secondary);
        cursor: pointer;
        outline: none;
        transition: all 0.2s ease;
      }
      
      .toggle-btn.active {
        background-color: var(--primary);
        color: #ffffff;
        border-color: var(--primary);
      }
      
      .toggle-group {
        display: flex;
        border-radius: 6px;
        overflow: hidden;
      }
      
      .alert-row-dr {
        display: flex;
        gap: 8px;
        align-items: flex-start;
        padding: 8px 10px;
        border-radius: 6px;
        font-size: 0.78rem;
        border-left: 4px solid var(--border-color);
        line-height: 1.4;
      }
      
      .table-row-clickable {
        cursor: pointer;
        transition: background-color 0.2s ease;
      }
      
      .table-row-clickable:hover {
        background-color: var(--bg-surface-elevated);
      }
      
      .table-row-active {
        background-color: var(--primary-glow) !important;
        border-left: 3px solid var(--primary);
      }
      
      @media (max-width: 960px) {
        .doctor-three-col {
          grid-template-columns: 1fr !important;
        }
        .doctor-bottom-row {
          grid-template-columns: 1fr !important;
        }
        .admin-kpi-scroll-row {
          padding-bottom: 12px;
        }
      }
    </style>

    <!-- SECTION 1: CRITICAL BANNER -->
    ${window.state.criticalBannerItems.length > 0 ? `
      <div class="doctor-critical-banner">
        ${window.state.criticalBannerItems.map(item => `
          <div class="doctor-critical-item ${item.type === 'news' ? 'news-severity' : ''}">
            <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
              <span>🚨</span>
              <span><strong>${item.text}</strong></span>
              <button class="btn btn-sm btn-primary" onclick="window.reviewCriticalResult('${item.patientUhid}', '${item.type}')" style="padding: 2px 8px; font-size: 0.7rem; font-weight: 700; height: 22px;">Review Results →</button>
            </div>
            <button onclick="window.dismissCriticalBannerItem('${item.id}', event)" style="background: none; border: none; color: inherit; font-size: 1rem; cursor: pointer; font-weight: bold;">✕</button>
          </div>
        `).join('')}
      </div>
    ` : ''}

    <!-- PAGE HEADING -->
    <div style="margin-top: 4px; margin-bottom: 16px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
      <div>
        <h1 style="font-size: 1.3rem; font-weight: 700; color: var(--text-primary); margin: 0; font-family: var(--font-display);">Doctor Workspace & Clinical Command Center</h1>
        <div style="font-size: 0.78rem; color: var(--text-muted); margin-top: 2px;">Patient management, diagnostic reviews, EMR consultations, and critical alerts tracker.</div>
      </div>
      <div style="display: flex; align-items: center; gap: 8px;">
        <span style="font-size: 0.8rem; font-weight: 600; color: var(--text-secondary);">Provider:</span>
        <strong style="font-size: 0.82rem; color: var(--text-primary);">${docName} (${doctorObj.spec})</strong>
      </div>
    </div>

    <!-- SECTION 2: KPI STAT CARDS ROW -->
    <div class="admin-kpi-scroll-row">
      ${kpis.map(k => renderDocKPICard(k)).join('')}
    </div>

    <!-- SECTION 3: ON-CALL / DUTY STATUS BAR -->
    <div class="duty-bar">
      <div style="display: flex; align-items: center; gap: 12px; flex-wrap: wrap;">
        <div class="toggle-group">
          <button class="toggle-btn ${window.state.doctorDutyStatus === 'On Duty' ? 'active' : ''}" onclick="window.setDoctorDutyStatus('On Duty')">On Duty</button>
          <button class="toggle-btn ${window.state.doctorDutyStatus === 'Off Duty' ? 'active' : ''}" onclick="window.setDoctorDutyStatus('Off Duty')">Off Duty</button>
          <button class="toggle-btn ${window.state.doctorDutyStatus === 'On Call' ? 'active' : ''}" onclick="window.setDoctorDutyStatus('On Call')">On Call</button>
        </div>
        <div style="font-size: 0.78rem; color: var(--text-secondary);">
          Specialty: <strong style="color: var(--text-primary);">${doctorObj.spec}</strong>
        </div>
        <div style="font-size: 0.78rem; color: var(--text-secondary);">
          Shift Time: <strong class="admin-mono" style="color: var(--text-primary);">08:00 AM - 04:00 PM</strong>
        </div>
      </div>
      <div style="display: flex; align-items: center; gap: 6px;">
        <span style="font-size: 0.78rem; font-weight: 600; color: var(--text-secondary);">Active Medico-Legal Cases (MLC):</span>
        <span class="admin-mono" style="background-color: var(--color-danger); color: white; padding: 2px 8px; border-radius: 4px; font-size: 0.75rem; font-weight: bold;">2 Cases</span>
      </div>
    </div>

    <!-- SECTION 4: THREE-COLUMN MAIN AREA -->
    <div class="doctor-three-col" style="display: grid; grid-template-columns: 3.5fr 3.5fr 3fr; gap: 16px; margin-bottom: 16px;">
      
      <!-- LEFT COLUMN (35%) -->
      <div style="display: flex; flex-direction: column; gap: 16px;">
        
        <!-- a) OPD Appointment Queue -->
        <div class="doctor-card">
          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-color); padding-bottom: 6px; margin-bottom: 2px;">
            <h3 style="font-size: 0.82rem; font-weight: 700; text-transform: uppercase; margin: 0; color: var(--text-primary);">OPD Appointment Queue</h3>
            <a href="#appointments" style="font-size: 0.75rem; font-weight: 600;">View All →</a>
          </div>
          <div style="overflow-x: auto;">
            <table class="custom-table" style="font-size: 0.78rem; width: 100%; border-collapse: collapse;">
              <thead>
                <tr style="background-color: var(--bg-surface-elevated); border-bottom: 1px solid var(--border-color);">
                  <th style="padding: 6px 8px; text-align: left;">Patient</th>
                  <th style="padding: 6px 8px; text-align: center;">Wait Time</th>
                  <th style="padding: 6px 8px; text-align: center;">Visit</th>
                  <th style="padding: 6px 8px; text-align: center;">Time</th>
                  <th style="padding: 6px 8px; text-align: right;">Action</th>
                </tr>
              </thead>
              <tbody>
                ${opdQueueData.slice(0, 8).map(appt => {
                  const isActive = appt.uhid === activePatient.uhid;
                  const statusColors = {
                    'Scheduled': 'color: var(--text-muted);',
                    'Checked-in': 'color: var(--color-warning); font-weight: 600;',
                    'In-Consultation': 'color: var(--primary); font-weight: 700;',
                    'Completed': 'color: var(--color-success); font-weight: 600;',
                    'No-show': 'color: var(--color-danger); font-weight: 500;'
                  };
                  return `
                    <tr class="table-row-clickable ${isActive ? 'table-row-active' : ''}" onclick="window.selectDoctorDashboardPatient('${appt.uhid}')" style="border-bottom: 1px solid var(--border-color);">
                      <td style="padding: 6px 8px;">
                        <div style="font-weight: 600; color: var(--text-primary);">${appt.name}</div>
                        <div class="admin-mono" style="font-size: 0.68rem; color: var(--text-muted);">${appt.uhid}</div>
                      </td>
                      <td class="admin-mono" style="padding: 6px 8px; text-align: center; font-weight: bold; color: ${appt.waitTime > 30 ? 'var(--color-danger)' : 'var(--text-secondary)'};">${appt.waitTime}m</td>
                      <td style="padding: 6px 8px; text-align: center; font-size: 0.72rem;">${appt.visitType}</td>
                      <td class="admin-mono" style="padding: 6px 8px; text-align: center;">${appt.time}</td>
                      <td style="padding: 6px 8px; text-align: right;">
                        ${appt.status === 'Checked-in' || appt.status === 'In-Consultation' ? `
                          <button class="btn btn-primary" style="padding: 2px 6px; font-size: 0.7rem; font-weight: 700; height: 22px;" onclick="event.stopPropagation(); router.navigate('emr?uhid=${appt.uhid}')">Consult</button>
                        ` : `
                          <span style="font-size:0.72rem; ${statusColors[appt.status]}">${appt.status}</span>
                        `}
                      </td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>

        <!-- b) Today's OT / Procedure List -->
        ${otListData.length > 0 ? `
          <div class="doctor-card">
            <div style="border-bottom: 1px solid var(--border-color); padding-bottom: 6px; margin-bottom: 2px;">
              <h3 style="font-size: 0.82rem; font-weight: 700; text-transform: uppercase; margin: 0; color: var(--text-primary);">Today's OT & Procedures</h3>
            </div>
            <table class="custom-table" style="font-size: 0.78rem; width: 100%; border-collapse: collapse;">
              <thead>
                <tr style="background-color: var(--bg-surface-elevated); border-bottom: 1px solid var(--border-color);">
                  <th style="padding: 6px 8px; text-align: left;">Patient</th>
                  <th style="padding: 6px 8px; text-align: left;">Procedure</th>
                  <th style="padding: 6px 8px; text-align: center;">OT No.</th>
                  <th style="padding: 6px 8px; text-align: center;">Time</th>
                  <th style="padding: 6px 8px; text-align: center;">CSSD</th>
                  <th style="padding: 6px 8px; text-align: right;">Anaes</th>
                </tr>
              </thead>
              <tbody>
                ${otListData.map(ot => `
                  <tr style="border-bottom: 1px solid var(--border-color);">
                    <td style="padding: 6px 8px; font-weight: 600; color: var(--text-primary);">${ot.name}</td>
                    <td style="padding: 6px 8px; font-size: 0.72rem;">${ot.proc}</td>
                    <td class="admin-mono" style="padding: 6px 8px; text-align: center; font-weight: bold;">${ot.ot}</td>
                    <td class="admin-mono" style="padding: 6px 8px; text-align: center;">${ot.time}</td>
                    <td style="padding: 6px 8px; text-align: center;">
                      <span class="badge" style="background-color: ${ot.cssd === 'Y' ? 'var(--color-success-bg)' : 'var(--color-danger-bg)'}; color: ${ot.cssd === 'Y' ? 'var(--color-success)' : 'var(--color-danger)'}; padding: 1px 4px; font-size: 0.65rem; font-weight: bold;">${ot.cssd}</span>
                    </td>
                    <td style="padding: 6px 8px; text-align: right;">
                      <span class="badge" style="background-color: ${ot.anaesthesia === 'Y' ? 'var(--color-success-bg)' : 'var(--color-danger-bg)'}; color: ${ot.anaesthesia === 'Y' ? 'var(--color-success)' : 'var(--color-danger)'}; padding: 1px 4px; font-size: 0.65rem; font-weight: bold;">${ot.anaesthesia}</span>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        ` : ''}

      </div>

      <!-- MIDDLE COLUMN (35%) -->
      <div style="display: flex; flex-direction: column; gap: 16px;">
        
        <!-- a) IPD Patients -->
        <div class="doctor-card">
          <div style="border-bottom: 1px solid var(--border-color); padding-bottom: 6px; margin-bottom: 2px;">
            <h3 style="font-size: 0.82rem; font-weight: 700; text-transform: uppercase; margin: 0; color: var(--text-primary);">IPD Admitted Patients</h3>
          </div>
          <div style="overflow-x: auto;">
            <table class="custom-table" style="font-size: 0.78rem; width: 100%; border-collapse: collapse;">
              <thead>
                <tr style="background-color: var(--bg-surface-elevated); border-bottom: 1px solid var(--border-color);">
                  <th style="padding: 6px 8px; text-align: left;">Patient</th>
                  <th style="padding: 6px 8px; text-align: center;">Ward/Bed</th>
                  <th style="padding: 6px 8px; text-align: center;">LOS</th>
                  <th style="padding: 6px 8px; text-align: center;">NEWS2</th>
                  <th style="padding: 6px 8px; text-align: right;">Action</th>
                </tr>
              </thead>
              <tbody>
                ${ipdQueueData.map(pat => {
                  const isActive = pat.uhid === activePatient.uhid;
                  const newsBadgeColor = pat.news < 3 ? 'background-color: var(--color-success); color: white;' : pat.news < 5 ? 'background-color: var(--color-warning); color: #78350f;' : 'background-color: var(--color-danger); color: white; animation: pulse 2s infinite;';
                  return `
                    <tr class="table-row-clickable ${isActive ? 'table-row-active' : ''}" onclick="window.selectDoctorDashboardPatient('${pat.uhid}')" style="border-bottom: 1px solid var(--border-color);">
                      <td style="padding: 6px 8px;">
                        <div style="font-weight: 600; color: var(--text-primary);">${pat.name}</div>
                        <div class="admin-mono" style="font-size: 0.68rem; color: var(--text-muted);">${pat.uhid}</div>
                      </td>
                      <td class="admin-mono" style="padding: 6px 8px; text-align: center; font-size:0.72rem; font-weight: 600;">${pat.bed}</td>
                      <td class="admin-mono" style="padding: 6px 8px; text-align: center;">${pat.los}d</td>
                      <td style="padding: 6px 8px; text-align: center;">
                        <span class="admin-mono" style="padding: 2px 6px; border-radius: 4px; font-weight: 800; font-size: 0.72rem; ${newsBadgeColor}">${pat.news}</span>
                      </td>
                      <td style="padding: 6px 8px; text-align: right;">
                        <button class="btn btn-primary" style="padding: 2px 6px; font-size: 0.7rem; font-weight: 700; height: 22px;" onclick="event.stopPropagation(); router.navigate('patients?uhid=${pat.uhid}')">See Patient</button>
                      </td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>

        <!-- b) Pending Orders -->
        <div class="doctor-card">
          <div style="border-bottom: 1px solid var(--border-color); padding-bottom: 6px; margin-bottom: 2px;">
            <h3 style="font-size: 0.82rem; font-weight: 700; text-transform: uppercase; margin: 0; color: var(--text-primary);">Pending Diagnostic Orders</h3>
          </div>
          <table class="custom-table" style="font-size: 0.78rem; width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background-color: var(--bg-surface-elevated); border-bottom: 1px solid var(--border-color);">
                <th style="padding: 6px 8px; text-align: left;">Patient</th>
                <th style="padding: 6px 8px; text-align: left;">Test/Study</th>
                <th style="padding: 6px 8px; text-align: center;">Ordered</th>
                <th style="padding: 6px 8px; text-align: center;">TAT</th>
                <th style="padding: 6px 8px; text-align: right;">Status</th>
              </tr>
            </thead>
            <tbody>
              ${pendingOrdersData.map(order => `
                <tr style="border-bottom: 1px solid var(--border-color);">
                  <td style="padding: 6px 8px; font-weight: 600; color: var(--text-primary);">${order.name}</td>
                  <td style="padding: 6px 8px; font-size: 0.72rem;">${order.test}</td>
                  <td class="admin-mono" style="padding: 6px 8px; text-align: center;">${order.ordered}</td>
                  <td style="padding: 6px 8px; text-align: center; color: var(--text-secondary); font-size: 0.72rem;">${order.tat}</td>
                  <td style="padding: 6px 8px; text-align: right;">
                    ${order.status === 'Delayed' ? `
                      <span class="badge" style="background-color: var(--color-danger-bg); color: var(--color-danger); padding: 1px 4px; font-size: 0.65rem; font-weight: bold; border: 1px solid var(--color-danger);">Delayed</span>
                    ` : `
                      <span class="badge" style="background-color: var(--bg-surface-elevated); color: var(--text-secondary); padding: 1px 4px; font-size: 0.65rem; font-weight: 600;">${order.status}</span>
                    `}
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

      </div>

      <!-- RIGHT COLUMN (30%) -->
      <div style="display: flex; flex-direction: column; gap: 16px;">
        
        <!-- a) Alerts & Reminders -->
        <div class="doctor-card" style="border: 1px solid #fca5a5; background: #fffcfc;">
          <div style="border-bottom: 1px solid #fca5a5; padding-bottom: 6px; margin-bottom: 2px; display: flex; align-items: center; gap: 6px;">
            <span style="font-size: 1.05rem;">🚨</span>
            <h3 style="font-size: 0.82rem; font-weight: 700; text-transform: uppercase; margin: 0; color: #991b1b;">Alerts & Reminders</h3>
          </div>
          <div style="display: flex; flex-direction: column; gap: 8px; max-height: 250px; overflow-y: auto; padding-right: 2px;">
            ${window.state.doctorAlerts.map(alert => {
              let bg = '';
              let border = '';
              let textCol = '';
              let badgeIcon = '';
              
              if (alert.severity === 'red') {
                bg = '#fff5f5'; border = '#ef4444'; textCol = '#991b1b'; badgeIcon = '⚠️';
              } else if (alert.severity === 'orange') {
                bg = '#fff7ed'; border = '#f97316'; textCol = '#c2410c'; badgeIcon = '🚫';
              } else if (alert.severity === 'amber') {
                bg = '#fffdf5'; border = '#f59e0b'; textCol = '#78350f'; badgeIcon = '💊';
              } else if (alert.severity === 'purple') {
                bg = '#faf5ff'; border = '#a855f7'; textCol = '#6b21a8'; badgeIcon = '📥';
              } else {
                bg = '#eff6ff'; border = '#3b82f6'; textCol = '#1e3a8a'; badgeIcon = '🔬';
              }

              return `
                <div class="alert-row-dr" style="background-color: ${bg}; border-left-color: ${border}; color: ${textCol};">
                  <span style="font-size: 1rem; line-height: 1;">${badgeIcon}</span>
                  <div style="flex: 1;">
                    <div style="font-weight: 500;">${alert.text}</div>
                    <div style="font-size: 0.65rem; opacity: 0.8; margin-top: 2px; display: flex; justify-content: space-between; align-items: center;">
                      <span class="admin-mono">${alert.time}</span>
                      <button onclick="window.acknowledgeDoctorAlert('${alert.id}', event)" style="background: none; border: none; text-decoration: underline; color: inherit; font-size: 0.68rem; font-weight: bold; cursor: pointer; padding: 0;">Acknowledge</button>
                    </div>
                  </div>
                </div>
              `;
            }).join('')}
            ${window.state.doctorAlerts.length === 0 ? `
              <div style="text-align: center; color: var(--text-muted); font-size: 0.78rem; padding: 12px; font-style: italic;">No active clinical alerts.</div>
            ` : ''}
          </div>
        </div>



      </div>

    </div>

    <!-- SECTION 5: BOTTOM ROW (3 equal cards) -->
    <div class="doctor-bottom-row" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px;">
      
      <!-- a) Discharge Summary Queue -->
      <div class="doctor-card">
        <div style="border-bottom: 1px solid var(--border-color); padding-bottom: 6px; margin-bottom: 2px;">
          <h3 style="font-size: 0.82rem; font-weight: 700; text-transform: uppercase; margin: 0; color: var(--text-primary);">Discharge Summary Queue</h3>
        </div>
        <table class="custom-table" style="font-size: 0.78rem; width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background-color: var(--bg-surface-elevated); border-bottom: 1px solid var(--border-color);">
              <th style="padding: 6px 8px; text-align: left;">Patient</th>
              <th style="padding: 6px 8px; text-align: center;">Ward</th>
              <th style="padding: 6px 8px; text-align: center;">Date Ordered</th>
              <th style="padding: 6px 8px; text-align: center;">Pending</th>
              <th style="padding: 6px 8px; text-align: right;">Action</th>
            </tr>
          </thead>
          <tbody>
            <tr style="border-bottom: 1px solid var(--border-color); background-color: #fef2f2;"> <!-- Red highlight because pending > 24 hours -->
              <td style="padding: 6px 8px; font-weight: 600; color: #991b1b;">
                Vijay Pipil
                <div class="admin-mono" style="font-size:0.68rem; color: #b91c1c;">UHID20000012</div>
              </td>
              <td style="padding: 6px 8px; text-align: center; color: #7f1d1d;">PRIVATE</td>
              <td class="admin-mono" style="padding: 6px 8px; text-align: center; color: #7f1d1d;">2026-06-25</td>
              <td class="admin-mono" style="padding: 6px 8px; text-align: center; font-weight: bold; color: var(--color-danger);">2d</td>
              <td style="padding: 6px 8px; text-align: right;">
                <button class="btn btn-primary" style="padding: 2px 6px; font-size: 0.7rem; font-weight: 700; height: 22px; background-color: var(--color-danger); border-color: var(--color-danger);" onclick="alert('Opening discharge summary draft for Vijay Pipil...')">Write D/C</button>
              </td>
            </tr>
            <tr>
              <td style="padding: 6px 8px; font-weight: 600; color: var(--text-primary);">
                Sarah Jones
                <div class="admin-mono" style="font-size:0.68rem; color: var(--text-muted);">UHID20000021</div>
              </td>
              <td style="padding: 6px 8px; text-align: center;">GENERAL</td>
              <td class="admin-mono" style="padding: 6px 8px; text-align: center;">2026-06-27</td>
              <td class="admin-mono" style="padding: 6px 8px; text-align: center; font-weight: 600; color: var(--text-secondary);">4h</td>
              <td style="padding: 6px 8px; text-align: right;">
                <button class="btn btn-primary" style="padding: 2px 6px; font-size: 0.7rem; font-weight: 700; height: 22px;" onclick="alert('Opening discharge summary draft for Sarah Jones...')">Write D/C</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- b) Prescription / Rx Sign-off Queue -->
      <div class="doctor-card">
        <div style="border-bottom: 1px solid var(--border-color); padding-bottom: 6px; margin-bottom: 2px;">
          <h3 style="font-size: 0.82rem; font-weight: 700; text-transform: uppercase; margin: 0; color: var(--text-primary);">Prescription Sign-off Queue</h3>
        </div>
        <table class="custom-table" style="font-size: 0.78rem; width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background-color: var(--bg-surface-elevated); border-bottom: 1px solid var(--border-color);">
              <th style="padding: 6px 8px; text-align: left;">Patient</th>
              <th style="padding: 6px 8px; text-align: left;">Drug/Dose</th>
              <th style="padding: 6px 8px; text-align: center;">Written By</th>
              <th style="padding: 6px 8px; text-align: center;">Time</th>
              <th style="padding: 6px 8px; text-align: right;">Action</th>
            </tr>
          </thead>
          <tbody>
            <tr style="border-bottom: 1px solid var(--border-color);">
              <td style="padding: 6px 8px; font-weight: 600; color: var(--text-primary);">
                Ramesh Chandra
                <div class="admin-mono" style="font-size:0.68rem; color: var(--text-muted);">UHID20000001</div>
              </td>
              <td style="padding: 6px 8px; font-size: 0.72rem;">Inj. Fentanyl 50 mcg IV</td>
              <td style="padding: 6px 8px; text-align: center; font-size: 0.72rem;">Dr. Neha (Res)</td>
              <td class="admin-mono" style="padding: 6px 8px; text-align: center;">15:40</td>
              <td style="padding: 6px 8px; text-align: right;">
                <button class="btn btn-primary" style="padding: 2px 6px; font-size: 0.7rem; font-weight: 700; height: 22px;" onclick="alert('Co-signed Fentanyl prescription for Ramesh Chandra')">Co-Sign</button>
              </td>
            </tr>
            <tr>
              <td style="padding: 6px 8px; font-weight: 600; color: var(--text-primary);">
                Amit Sharma
                <div class="admin-mono" style="font-size:0.68rem; color: var(--text-muted);">UHID20000003</div>
              </td>
              <td style="padding: 6px 8px; font-size: 0.72rem;">Tab. Pantoprazole 40 mg</td>
              <td style="padding: 6px 8px; text-align: center; font-size: 0.72rem;">Dr. Ajay (Int)</td>
              <td class="admin-mono" style="padding: 6px 8px; text-align: center;">15:50</td>
              <td style="padding: 6px 8px; text-align: right;">
                <button class="btn btn-primary" style="padding: 2px 6px; font-size: 0.7rem; font-weight: 700; height: 22px;" onclick="alert('Co-signed Pantoprazole prescription for Amit Sharma')">Co-Sign</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- c) Follow-up & Referral Tracker -->
      <div class="doctor-card">
        <div style="border-bottom: 1px solid var(--border-color); padding-bottom: 6px; margin-bottom: 2px;">
          <h3 style="font-size: 0.82rem; font-weight: 700; text-transform: uppercase; margin: 0; color: var(--text-primary);">Follow-up & Referral Tracker</h3>
        </div>
        <table class="custom-table" style="font-size: 0.78rem; width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background-color: var(--bg-surface-elevated); border-bottom: 1px solid var(--border-color);">
              <th style="padding: 6px 8px; text-align: left;">Patient</th>
              <th style="padding: 6px 8px; text-align: left;">Referred To / Follow-up</th>
              <th style="padding: 6px 8px; text-align: center;">Target Date</th>
              <th style="padding: 6px 8px; text-align: right;">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr style="border-bottom: 1px solid var(--border-color);">
              <td style="padding: 6px 8px; font-weight: 600; color: var(--text-primary);">
                Amit Sharma
                <div class="admin-mono" style="font-size:0.68rem; color: var(--text-muted);">UHID20000003</div>
              </td>
              <td style="padding: 6px 8px; font-size: 0.72rem;">Cardiology clearance</td>
              <td class="admin-mono" style="padding: 6px 8px; text-align: center;">2026-06-27</td>
              <td style="padding: 6px 8px; text-align: right;">
                <span class="badge" style="background-color: var(--color-success-bg); color: var(--color-success); padding: 1px 6px; font-size: 0.7rem; font-weight: bold;">Seen</span>
              </td>
            </tr>
            <tr>
              <td style="padding: 6px 8px; font-weight: 600; color: var(--text-primary);">
                Sourav Desai
                <div class="admin-mono" style="font-size:0.68rem; color: var(--text-muted);">UHID20000002</div>
              </td>
              <td style="padding: 6px 8px; font-size: 0.72rem;">Nephrology consultation</td>
              <td class="admin-mono" style="padding: 6px 8px; text-align: center;">2026-06-28</td>
              <td style="padding: 6px 8px; text-align: right;">
                <span class="badge" style="background-color: var(--color-warning-bg); color: var(--color-warning); padding: 1px 6px; font-size: 0.7rem; font-weight: bold;">Pending</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
        </table>
      </div>
    </div>
  `;
}

// ==========================================================================
// 4. NURSE DASHBOARD
// ==========================================================================
function renderNurseDashboard(container) {
  // Initialize nurse state if not exists
  if (!window.state.nurseActivePatients) {
    window.state.nurseActivePatients = [
      {
        uhid: 'UHID20000001',
        name: 'Ramesh Chandra',
        age: 62,
        gender: 'Male',
        bloodGroup: 'O+',
        bed: 'CCU-BED-04',
        diagnosis: 'Acute Coronary Syndrome',
        icd10: 'I24.9',
        los: 4,
        consultant: 'Dr. Amit Verma',
        allergies: 'Penicillin (Anaphylaxis)',
        dietType: 'Low Sodium / Diabetic',
        morseScore: 45, // High Risk
        bradenScore: 14, // Moderate Risk
        restraint: { active: 'Yes', type: '2-Point Limb', reason: 'Prevent line pulling', reviewDue: '18:00' },
        vitalsHistory: [
          { bp: '135/85', hr: 92, rr: 18, temp: 98.4, spo2: 96, avpu: 'A', pain: 3, time: '12:00', news: 2 },
          { bp: '138/90', hr: 95, rr: 20, temp: 98.6, spo2: 95, avpu: 'A', pain: 4, time: '13:00', news: 2 },
          { bp: '142/95', hr: 104, rr: 22, temp: 99.1, spo2: 94, avpu: 'A', pain: 5, time: '14:00', news: 3 }
        ],
        education: { explainedDiagnosis: 'Yes', explainedMeds: 'No', dischargeInsts: 'No' },
        consents: [
          { id: 'con-n1', name: 'Consent for Angiography', status: 'Signed' }
        ],
        devices: {
          iv: { type: 'Peripheral IV', site: 'Left Forearm', gauge: '20G', inserted: '2026-06-25 10:00', lastDressing: '2026-06-25', inSitu: 2 },
          catheter: { type: 'Foley Urinary', inserted: '2026-06-26 12:00', inSitu: 1, lastCare: '2026-06-27 08:00', output: 400 },
          wound: { site: 'Groin access site', type: 'Pressure dressing', lastDressing: '2026-06-27 08:00', nextDue: '2026-06-28 08:00' }
        },
        io: {
          intake: [
            { type: 'Oral Fluids', vol: 200, time: '12:30' },
            { type: 'IV Normal Saline', vol: 500, time: '13:00' }
          ],
          output: [
            { type: 'Urine', vol: 300, time: '13:15' }
          ]
        },
        notes: [
          { time: '2026-06-27 12:30', user: 'Sister Mercy, RN', content: 'Checked vitals, SpO2 stable. Mild chest tightness reported.' }
        ]
      },
      {
        uhid: 'UHID20000002',
        name: 'Sourav Desai',
        age: 45,
        gender: 'Male',
        bloodGroup: 'B+',
        bed: 'CCU-BED-02',
        diagnosis: 'Severe Pneumonia / Urosepsis',
        icd10: 'J18.9 / A41.9',
        los: 6,
        consultant: 'Dr. Sarah Jenkins',
        allergies: 'Sulfa Drugs (Rash)',
        dietType: 'Soft / High Protein',
        morseScore: 20, // Low Risk
        bradenScore: 10, // High Risk
        restraint: { active: 'No', type: 'None', reason: 'N/A', reviewDue: 'N/A' },
        vitalsHistory: [
          { bp: '110/70', hr: 88, rr: 20, temp: 99.8, spo2: 94, avpu: 'A', pain: 2, time: '10:00', news: 2 },
          { bp: '102/65', hr: 98, temp: 101.2, spo2: 91, avpu: 'V', pain: 1, time: '12:00', news: 6 },
          { bp: '92/58', hr: 115, temp: 102.4, spo2: 89, avpu: 'V', pain: 2, time: '14:00', news: 10 }
        ],
        education: { explainedDiagnosis: 'Yes', explainedMeds: 'Yes', dischargeInsts: 'No' },
        consents: [
          { id: 'con-n2', name: 'Consent for Central Line', status: 'Pending' }
        ],
        devices: {
          iv: { type: 'Central Line', site: 'Right IJ', gauge: '7 Fr Triple Lumen', inserted: '2026-06-19 09:00', lastDressing: '2026-06-19', inSitu: 8 },
          catheter: { type: 'Foley Urinary', inserted: '2026-06-23 11:00', inSitu: 4, lastCare: '2026-06-26 20:00', output: 150 },
          wound: { site: 'Sacral ulcer', type: 'Hydrocolloid dressing', lastDressing: '2026-06-26 14:00', nextDue: '2026-06-27 14:00' }
        },
        io: {
          intake: [
            { type: 'IV Piperacillin', vol: 100, time: '12:00' },
            { type: 'IV Fluids D5½NS', vol: 400, time: '13:00' }
          ],
          output: [
            { type: 'Urine', vol: 150, time: '14:00' }
          ]
        },
        notes: [
          { time: '2026-06-27 14:15', user: 'Sister Mercy, RN', content: 'NEWS2 critical. Oxygen started at 4 L/min. Doctor notified.' }
        ]
      },
      {
        uhid: 'UHID20000003',
        name: 'Amit Sharma',
        age: 29,
        gender: 'Male',
        bloodGroup: 'A+',
        bed: 'GW(M)-409',
        diagnosis: 'Acute Appendicitis',
        icd10: 'K35.8',
        los: 1,
        consultant: 'Dr. Sunita Rao',
        allergies: 'No Known Allergies',
        dietType: 'NPO (Nil Per Os)',
        morseScore: 10,
        bradenScore: 21,
        restraint: { active: 'No', type: 'None', reason: 'N/A', reviewDue: 'N/A' },
        vitalsHistory: [
          { bp: '120/80', hr: 72, temp: 98.6, spo2: 99, avpu: 'A', pain: 4, time: '09:00', news: 0 },
          { bp: '118/78', hr: 75, temp: 98.9, spo2: 98, avpu: 'A', pain: 5, time: '11:00', news: 0 },
          { bp: '122/82', hr: 78, temp: 99.2, spo2: 99, avpu: 'A', pain: 5, time: '13:00', news: 0 }
        ],
        education: { explainedDiagnosis: 'Yes', explainedMeds: 'Yes', dischargeInsts: 'No' },
        consents: [
          { id: 'con-n3', name: 'Consent for Appendectomy', status: 'Signed' }
        ],
        devices: null,
        io: { intake: [], output: [] },
        notes: [
          { time: '2026-06-27 09:00', user: 'Sister Mercy, RN', content: 'Admitted, pre-op checklist completed. Consents signed.' }
        ]
      },
      {
        uhid: 'UHID20000012',
        name: 'Vijay Pipil',
        age: 52,
        gender: 'Male',
        bloodGroup: 'B-',
        bed: 'PVT-201',
        diagnosis: 'Dengue Fever',
        icd10: 'A90',
        los: 3,
        consultant: 'Dr. Sunita P.',
        allergies: 'No Known Allergies',
        dietType: 'Soft Diet',
        morseScore: 25,
        bradenScore: 19,
        restraint: { active: 'No', type: 'None', reason: 'N/A', reviewDue: 'N/A' },
        vitalsHistory: [
          { bp: '110/70', hr: 78, temp: 99.2, spo2: 97, avpu: 'A', pain: 2, time: '10:00', news: 1 },
          { bp: '108/68', hr: 80, temp: 99.0, spo2: 98, avpu: 'A', pain: 1, time: '12:00', news: 1 },
          { bp: '112/70', hr: 82, temp: 98.7, spo2: 98, avpu: 'A', pain: 1, time: '14:00', news: 0 }
        ],
        education: { explainedDiagnosis: 'Yes', explainedMeds: 'Yes', dischargeInsts: 'Yes' },
        consents: [],
        devices: {
          iv: { type: 'Peripheral IV', site: 'Left Forearm', gauge: '20G', inserted: '2026-06-23 11:00', lastDressing: '2026-06-23', inSitu: 4 },
          catheter: null,
          wound: null
        },
        io: {
          intake: [
            { type: 'Oral Fluids', vol: 300, time: '12:00' },
            { type: 'IV Fluids', vol: 500, time: '14:00' }
          ],
          output: [
            { type: 'Urine', vol: 400, time: '14:30' }
          ]
        },
        notes: [
          { time: '2026-06-27 10:30', user: 'Sister Mercy, RN', content: 'Stable. Preparing discharge documentation.' }
        ]
      }
    ];
  }

  if (!window.state.nurseMeds) {
    window.state.nurseMeds = [
      { id: 'm-1', name: 'Ramesh Chandra', bed: 'CCU-BED-04', drug: 'Inj. Heparin', dose: '5000 IU', route: 'Subcutaneous', time: '16:00', status: 'Pending', patientUhid: 'UHID20000001' },
      { id: 'm-2', name: 'Sourav Desai', bed: 'CCU-BED-02', drug: 'Inj. Piperacillin-Tazobactam', dose: '4.5 g', route: 'IV Infusion', time: '15:30', status: 'Pending', patientUhid: 'UHID20000002' },
      { id: 'm-3', name: 'Amit Sharma', bed: 'GW(M)-409', drug: 'Inj. Cefuroxime', dose: '1.5 g', route: 'IV Push', time: '16:30', status: 'Pending', patientUhid: 'UHID20000003' },
      { id: 'm-4', name: 'Vijay Pipil', bed: 'PVT-201', drug: 'Tab. Paracetamol', dose: '650 mg', route: 'Oral', time: '16:00', status: 'Pending', patientUhid: 'UHID20000012' }
    ];
  }

  if (!window.state.nursePrnMeds) {
    window.state.nursePrnMeds = [
      { name: 'Ramesh Chandra', bed: 'CCU-BED-04', drug: 'Tab. Sorbitrate 5mg', route: 'SL', lastAdmin: 'Sister Mercy', lastTime: '12:40' },
      { name: 'Sourav Desai', bed: 'CCU-BED-02', drug: 'Inj. Fentanyl 50mcg', route: 'IV', lastAdmin: 'Staff Rahul', lastTime: '08:15' }
    ];
  }

  if (!window.state.nurseDoctorOrders) {
    window.state.nurseDoctorOrders = [
      { id: 'ord-n1', name: 'Sourav Desai', bed: 'CCU-BED-02', type: 'Lab', detail: 'CBC & ABG blood panel', orderedBy: 'Dr. Sarah Jenkins', time: '15:20', priority: 'STAT', patientUhid: 'UHID20000002', status: 'Pending' },
      { id: 'ord-n2', name: 'Ramesh Chandra', bed: 'CCU-BED-04', type: 'Diet', detail: 'Low sodium cardiac diet, limit 1.5L', orderedBy: 'Dr. Amit Verma', time: '14:30', priority: 'Routine', patientUhid: 'UHID20000001', status: 'Pending' }
    ];
  }

  if (!window.state.nurseProcedures) {
    window.state.nurseProcedures = [
      { id: 'proc-n1', name: 'Sourav Desai', bed: 'CCU-BED-02', procedure: 'Sacral Ulcer Dressing', dueTime: '15:00', lastDone: 'Yesterday 14:00', patientUhid: 'UHID20000002', status: 'Pending' },
      { id: 'proc-n2', name: 'Ramesh Chandra', bed: 'CCU-BED-04', procedure: 'Nebulisation with Duolin', dueTime: '16:00', lastDone: '12:00 today', patientUhid: 'UHID20000001', status: 'Pending' }
    ];
  }

  if (!window.state.nurseSamples) {
    window.state.nurseSamples = [
      { id: 'samp-n1', name: 'Sourav Desai', bed: 'CCU-BED-02', tests: 'CBC, Blood Culture', tubes: 'Purple, Culture Bottle', priority: 'STAT', patientUhid: 'UHID20000002', status: 'Pending' },
      { id: 'samp-n2', name: 'Vijay Pipil', bed: 'PVT-201', tests: 'Platelet Count Check', tubes: 'EDTA Purple', priority: 'Routine', patientUhid: 'UHID20000012', status: 'Pending' }
    ];
  }

  if (!window.state.nurseAlerts) {
    window.state.nurseAlerts = [
      { id: 'nalt-1', type: 'news', severity: 'red', text: 'NEWS2 Alert: Sourav Desai score is 10 (Critical). Escalate now.', patientUhid: 'UHID20000002', time: '15 min ago' },
      { id: 'nalt-2', type: 'lab', severity: 'red', text: 'Critical Lab Value: Hemoglobin 6.4 g/dL for Ramesh Chandra', patientUhid: 'UHID20000001', time: '10 min ago' },
      { id: 'nalt-3', type: 'med', severity: 'orange', text: 'Medication Overdue: Inj. Piperacillin for Sourav Desai is overdue.', patientUhid: 'UHID20000002', time: 'Just now' },
      { id: 'nalt-4', type: 'fall', severity: 'amber', text: 'Fall Risk High: Ramesh Chandra (Morse: 45) - Ensure rails raised.', patientUhid: 'UHID20000001', time: '30 min ago' },
      { id: 'nalt-5', type: 'ulcer', severity: 'amber', text: 'Pressure Ulcer Risk High: Sourav Desai (Braden: 10) - Turn Q2H.', patientUhid: 'UHID20000002', time: '1 hour ago' },
      { id: 'nalt-6', type: 'device', severity: 'amber', text: 'Central Line in situ > 7 days for Sourav Desai.', patientUhid: 'UHID20000002', time: '2 hours ago' }
    ];
  }

  window.state.activeNursePatientUhid = window.state.activeNursePatientUhid || '';
  window.state.activeNurseTab = window.state.activeNurseTab || 'Overview';
  window.state.showHandoverPanel = window.state.showHandoverPanel || false;

  const activePatient = window.state.nurseActivePatients.find(p => p.uhid === window.state.activeNursePatientUhid);

  // Dynamic status bar updates
  window.selectNursePatient = function(uhid) {
    window.state.activeNursePatientUhid = uhid;
    window.state.activeNurseTab = 'Overview';
    const viewport = document.getElementById('dashboard-persona-viewport');
    if (viewport) {
      renderNurseDashboard(viewport);
    }
  };

  window.closeNurseDrawer = function() {
    window.state.activeNursePatientUhid = '';
    const viewport = document.getElementById('dashboard-persona-viewport');
    if (viewport) {
      renderNurseDashboard(viewport);
    }
  };

  window.setNurseDetailTab = function(tabName) {
    window.state.activeNurseTab = tabName;
    const viewport = document.getElementById('dashboard-persona-viewport');
    if (viewport) {
      renderNurseDashboard(viewport);
    }
  };

  // Quick Action triggers
  window.triggerQuickAction = function(actionName) {
    if (actionName === 'Record Vitals' || actionName === 'Administer Medication' || actionName === 'Execute Order') {
      const p = window.state.nurseActivePatients[0];
      window.selectNursePatient(p.uhid);
      window.setNurseDetailTab(actionName === 'Record Vitals' ? 'Vitals' : (actionName === 'Administer Medication' ? 'MAR' : 'Orders'));
    } else {
      alert(`Action "${actionName}" triggered. Logging standard audit report...`);
    }
  };

  // Event handlers for MAR / Orders / Handover
  window.administerNurseMed = function(id) {
    const med = window.state.nurseMeds.find(m => m.id === id);
    if (med) {
      const patientDob = prompt(`Confirm patient identity.\nPlease type the Date of Birth (YYYY-MM-DD) for patient "${med.name}":\n(Hint: any date to verify)`);
      if (!patientDob) return;
      const drugConfirm = confirm(`Administering drug:\n- Drug: ${med.drug}\n- Dose: ${med.dose}\n- Route: ${med.route}\nConfirm dosage and patient name match exactly?`);
      if (drugConfirm) {
        let site = '';
        if (med.route.toLowerCase().includes('iv') || med.route.toLowerCase().includes('subcutaneous')) {
          site = prompt(`Enter injection/infusion site location:\n(e.g., Left forearm, Right thigh)`);
        }
        med.status = 'Administered';
        // Add notes in MAR audit
        const pat = window.state.nurseActivePatients.find(p => p.uhid === med.patientUhid);
        if (pat) {
          const now = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
          pat.notes.unshift({
            time: `2026-06-27 ${now}`,
            user: 'Sister Mercy, RN',
            content: `Administered ${med.drug} ${med.dose} via ${med.route}. Site: ${site || 'N/A'}. Co-signature validated.`
          });
        }
        alert('Medication administered successfully. Audit log and MAR grid updated.');
        const viewport = document.getElementById('dashboard-persona-viewport');
        if (viewport) {
          renderNurseDashboard(viewport);
        }
      }
    }
  };

  window.holdRefuseNurseMed = function(id, action) {
    const med = window.state.nurseMeds.find(m => m.id === id);
    if (med) {
      const reason = prompt(`Enter reason for ${action === 'Hold' ? 'holding' : 'refusing'} medication:\n(e.g., Patient sleeping, Nausea, Refused by bedside relative)`);
      if (reason) {
        med.status = action === 'Hold' ? 'Held' : 'Refused';
        const pat = window.state.nurseActivePatients.find(p => p.uhid === med.patientUhid);
        if (pat) {
          const now = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
          pat.notes.unshift({
            time: `2026-06-27 ${now}`,
            user: 'Sister Mercy, RN',
            content: `Medication ${med.drug} ${action === 'Hold' ? 'Held' : 'Refused'}. Reason: ${reason}`
          });
        }
        alert(`Medication status marked as "${med.status}".`);
        const viewport = document.getElementById('dashboard-persona-viewport');
        if (viewport) {
          renderNurseDashboard(viewport);
        }
      }
    }
  };

  window.executeNurseOrder = function(id) {
    const order = window.state.nurseDoctorOrders.find(o => o.id === id);
    if (order) {
      order.status = 'Executed';
      const now = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
      alert(`Order executed successfully!\nTimestamp: ${now}\nValidated by: Sister Mercy, RN`);
      window.state.nurseDoctorOrders = window.state.nurseDoctorOrders.filter(o => o.id !== id);
      const viewport = document.getElementById('dashboard-persona-viewport');
      if (viewport) {
        renderNurseDashboard(viewport);
      }
    }
  };

  window.completeNurseProcedure = function(id) {
    const proc = window.state.nurseProcedures.find(p => p.id === id);
    if (proc) {
      proc.status = 'Completed';
      alert(`Procedure "${proc.procedure}" marked as completed.`);
      window.state.nurseProcedures = window.state.nurseProcedures.filter(p => p.id !== id);
      const viewport = document.getElementById('dashboard-persona-viewport');
      if (viewport) {
        renderNurseDashboard(viewport);
      }
    }
  };

  window.collectNurseSample = function(id) {
    const sample = window.state.nurseSamples.find(s => s.id === id);
    if (sample) {
      sample.status = 'Collected';
      alert(`Sample for "${sample.tests}" collected in tube(s) "${sample.tubes}". Dispatched to lab.`);
      window.state.nurseSamples = window.state.nurseSamples.filter(s => s.id !== id);
      const viewport = document.getElementById('dashboard-persona-viewport');
      if (viewport) {
        renderNurseDashboard(viewport);
      }
    }
  };

  window.saveNurseVitals = function(uhid) {
    const hr = parseInt(document.getElementById('vit-hr').value);
    const sbp = parseInt(document.getElementById('vit-sbp').value);
    const dbp = parseInt(document.getElementById('vit-dbp').value);
    const rr = parseInt(document.getElementById('vit-rr').value);
    const temp = parseFloat(document.getElementById('vit-temp').value);
    const spo2 = parseInt(document.getElementById('vit-spo2').value);
    const avpu = document.getElementById('vit-avpu').value;
    const pain = parseInt(document.getElementById('vit-pain').value);

    if (!hr || !sbp || !dbp || !rr || !temp || !spo2) {
      alert('Please fill out all vital fields.');
      return;
    }

    // Auto-calculate NEWS2
    let news = 0;
    if (rr <= 8 || rr >= 25) news += 3;
    else if (rr >= 21) news += 2;
    else if (rr <= 11) news += 1;

    if (spo2 <= 91) news += 3;
    else if (spo2 <= 93) news += 2;
    else if (spo2 <= 95) news += 1;

    if (temp <= 95.0 || temp >= 102.2) news += 3;
    else if (temp >= 100.4) news += 2;
    else if (temp <= 96.8) news += 1;

    if (sbp <= 90 || sbp >= 220) news += 3;
    else if (sbp <= 100) news += 2;
    else if (sbp <= 110) news += 1;

    if (hr <= 40 || hr >= 131) news += 3;
    else if (hr >= 111) news += 2;
    else if (hr <= 50 || hr >= 91) news += 1;

    if (avpu !== 'A') news += 3;

    const patient = window.state.nurseActivePatients.find(p => p.uhid === uhid);
    if (patient) {
      const now = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
      patient.vitalsHistory.unshift({
        bp: `${sbp}/${dbp}`, hr, rr, temp, spo2, avpu, pain, time: now, news
      });
      patient.news2 = news;

      if (news >= 5) {
        // Auto-generate sepsis alert
        window.state.nurseAlerts.unshift({
          id: `nalt-${Date.now()}`,
          type: 'news',
          severity: 'red',
          text: `NEWS2 Warning: ${patient.name} score is ${news} (Critical). Escalate immediately.`,
          patientUhid: uhid,
          time: 'Just now'
        });
        alert(`NEWS2 score calculated: ${news}.\nWarning: Score is elevated (>= 5). Sepsis alert triggered. Prompt evaluation required!`);
      } else {
        alert(`Vitals saved. NEWS2 score calculated: ${news}.`);
      }

      const viewport = document.getElementById('dashboard-persona-viewport');
      if (viewport) {
        renderNurseDashboard(viewport);
      }
    }
  };

  window.addNurseFluid = function(uhid) {
    const type = document.getElementById('io-type').value;
    const vol = parseInt(document.getElementById('io-vol').value);
    const cat = document.getElementById('io-cat').value;
    if (!type || !vol) {
      alert('Please fill out fluid details.');
      return;
    }
    const patient = window.state.nurseActivePatients.find(p => p.uhid === uhid);
    if (patient) {
      const now = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
      if (cat === 'intake') {
        patient.io.intake.unshift({ type, vol, time: now });
      } else {
        patient.io.output.unshift({ type, vol, time: now });
      }
      alert('Fluid input/output logged.');
      const viewport = document.getElementById('dashboard-persona-viewport');
      if (viewport) {
        renderNurseDashboard(viewport);
      }
    }
  };

  window.addNurseNote = function(uhid) {
    const content = document.getElementById('note-content').value;
    if (!content) {
      alert('Note content cannot be empty.');
      return;
    }
    const patient = window.state.nurseActivePatients.find(p => p.uhid === uhid);
    if (patient) {
      const now = new Date().toLocaleString('en-IN', { hour: '2-digit', minute: '2-digit', year: 'numeric', month: '2-digit', day: '2-digit' });
      patient.notes.unshift({
        time: now,
        user: 'Sister Mercy, RN',
        content
      });
      alert('Nursing progress note saved.');
      const viewport = document.getElementById('dashboard-persona-viewport');
      if (viewport) {
        renderNurseDashboard(viewport);
      }
    }
  };

  window.signNurseConsent = function(uhid, consentId) {
    const patient = window.state.nurseActivePatients.find(p => p.uhid === uhid);
    if (patient) {
      const consent = patient.consents.find(c => c.id === consentId);
      if (consent) {
        consent.status = 'Signed';
        alert(`Consent form "${consent.name}" signed at bedside.`);
        const viewport = document.getElementById('dashboard-persona-viewport');
        if (viewport) {
          renderNurseDashboard(viewport);
        }
      }
    }
  };

  window.toggleHandoverPanel = function(show) {
    window.state.showHandoverPanel = show;
    const viewport = document.getElementById('dashboard-persona-viewport');
    if (viewport) {
      renderNurseDashboard(viewport);
    }
  };

  window.submitHandover = function() {
    // Check if notes are filled for all patients
    let allFilled = true;
    window.state.nurseActivePatients.forEach(p => {
      const noteVal = document.getElementById(`handover-note-${p.uhid}`)?.value;
      if (!noteVal || noteVal.trim() === '') {
        allFilled = false;
      }
    });

    if (!allFilled) {
      alert('Please fill out a handover note for all patients before submitting.');
      return;
    }

    const confirmSubmit = confirm('Are you sure you want to submit the shift handover? This will lock the current shift details and notify incoming staff.');
    if (confirmSubmit) {
      alert('Shift Handover Submitted successfully!\n- Outgoing Shift locked.\n- Incoming Nurse notified.\n- Handover logged under auditor.');
      window.state.showHandoverPanel = false;
      const viewport = document.getElementById('dashboard-persona-viewport');
      if (viewport) {
        renderNurseDashboard(viewport);
      }
    }
  };

  // Helper calculation for NEWS Color
  function getNewsColor(score) {
    if (score < 3) return 'background-color: var(--color-success); color: white;';
    if (score < 5) return 'background-color: var(--color-warning); color: #78350f;';
    return 'background-color: var(--color-danger); color: white; animation: pulse 2s infinite;';
  }

  // Count totals for shift counting
  const vitalsDueCount = window.state.nurseActivePatients.filter(p => p.news2 >= 5).length || 1;
  const pendingMedsCount = window.state.nurseMeds.filter(m => m.status === 'Pending').length;
  const pendingOrdersCount = window.state.nurseDoctorOrders.filter(o => o.status === 'Pending').length;
  const criticalNewsCount = window.state.nurseActivePatients.filter(p => p.news2 >= 5).length;
  const proceduresCount = window.state.nurseProcedures.filter(p => p.status === 'Pending').length;
  const samplesCount = window.state.nurseSamples.filter(s => s.status === 'Pending').length;

  // Dynamic nurse pending discharge count
  const nursePendingDis = (window.state.patients || []).filter(p => p.dischargeStatus === 'In Progress — Clearances Pending' && p.dischargeClearances && p.dischargeClearances.nursing && !p.dischargeClearances.nursing.cleared);
  const nursePendingVal = nursePendingDis.length;
  const nursePendingSub = nursePendingVal > 0 ? `${nursePendingDis[0].name} pending` : 'All nursing cleared';

  const kpis = [
    { title: 'Patients in Ward', value: `${window.state.nurseActivePatients.length}`, subtext: 'Occupied beds in shift roster', status: 'normal', trendText: 'Ward capacity', trendDirection: 'neutral' },
    { title: 'Vitals Due Now', value: `${vitalsDueCount}`, subtext: 'Overdue or due in 15m', status: vitalsDueCount > 0 ? 'warning' : 'normal', trendText: 'Routine check due', trendDirection: 'up' },
    { title: 'Medication Round Due', value: `${pendingMedsCount}`, subtext: 'Pending scheduled MAR', status: pendingMedsCount > 0 ? 'critical' : 'normal', trendText: 'Hourly rounds', trendDirection: 'up' },
    { title: 'Pending Doctor Orders', value: `${pendingOrdersCount}`, subtext: 'Awaiting execution', status: pendingOrdersCount > 0 ? 'warning' : 'normal', trendText: '+1 STAT order', trendDirection: 'up' },
    { title: 'Critical NEWS Alerts', value: `${criticalNewsCount}`, subtext: 'Patients with NEWS2 ≥ 5', status: criticalNewsCount > 0 ? 'critical' : 'normal', trendText: 'CCU-BED-02 critical', trendDirection: 'up' },
    { title: 'Discharges Pending', value: `${nursePendingVal}`, subtext: nursePendingSub, status: nursePendingVal > 0 ? 'warning' : 'normal', trendText: 'Clearance queue', trendDirection: 'neutral' },
    { title: 'Procedures Due', value: `${proceduresCount}`, subtext: 'Dressing & nebulisations', status: 'normal', trendText: 'Dressing due', trendDirection: 'neutral' },
    { title: 'Samples Pending', value: `${samplesCount}`, subtext: 'Phlebotomy queue', status: 'warning', trendText: '+1 STAT draw', trendDirection: 'up' }
  ];

  // Shift countdown display
  const shiftTimeRemaining = '07h 46m remaining';

  container.innerHTML = `
    <style>
      @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&display=swap');
      
      :root {
        --sidebar-width: 240px !important;
        --header-height: 52px !important;
      }
      
      .admin-mono {
        font-family: 'JetBrains Mono', 'Courier New', Courier, monospace !important;
      }
      
      .admin-kpi-scroll-row {
        display: flex;
        gap: 12px;
        overflow-x: auto;
        padding-bottom: 8px;
        margin-bottom: 16px;
        scrollbar-width: thin;
      }
      
      .nurse-status-bar {
        position: sticky;
        top: -1.5rem;
        margin: -1.5rem -1.5rem 16px -1.5rem;
        z-index: 80;
        background-color: #ffffff;
        border-bottom: 1px solid var(--border-color);
        padding: 12px 24px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-wrap: wrap;
        gap: 12px;
        box-shadow: var(--shadow-sm);
      }
      
      .nurse-kpi-card {
        flex: 0 0 calc(12.5% - 11px);
        min-width: 170px;
        background-color: #ffffff;
        border: 1px solid var(--border-color);
        border-radius: var(--radius-md);
        padding: 14px;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        box-shadow: var(--shadow-sm);
        cursor: pointer;
        transition: transform 0.2s ease, box-shadow 0.2s ease;
        border-left: 4px solid var(--border-color);
      }
      
      .nurse-kpi-card.status-normal {
        border-left-color: var(--color-success);
      }
      
      .nurse-kpi-card.status-warning {
        border-left-color: var(--color-warning);
      }
      
      .nurse-kpi-card.status-critical {
        border-left-color: var(--color-danger);
      }
      
      .nurse-card {
        background-color: #ffffff;
        border: 1px solid var(--border-color);
        border-radius: var(--radius-md);
        padding: 16px !important;
        box-shadow: var(--shadow-sm);
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
      
      .nurse-bed-row {
        cursor: pointer;
        transition: background-color 0.2s ease;
      }
      
      .nurse-bed-row:hover {
        background-color: var(--bg-surface-elevated);
      }
      
      .nurse-bed-row.active-row {
        background-color: var(--primary-glow) !important;
        border-left: 3px solid var(--primary);
      }
      
      .badge-risk {
        padding: 1px 6px;
        border-radius: 4px;
        font-size: 0.65rem;
        font-weight: 700;
        text-transform: uppercase;
      }
      
      .risk-high { background-color: var(--color-danger-bg); color: var(--color-danger); }
      .risk-medium { background-color: var(--color-warning-bg); color: var(--color-warning); }
      .risk-low { background-color: var(--color-success-bg); color: var(--color-success); }
      
      /* Sliding Detail Drawer style */
      .nurse-detail-drawer {
        position: fixed;
        top: 0;
        right: 0;
        height: 100vh;
        width: 680px;
        max-width: 95vw;
        background-color: #ffffff;
        box-shadow: -10px 0 30px rgba(0,0,0,0.15);
        z-index: 1000;
        display: flex;
        flex-direction: column;
        transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        transform: ${activePatient ? 'translateX(0)' : 'translateX(100%)'};
      }
      
      .drawer-header {
        padding: 16px 24px;
        border-bottom: 1px solid var(--border-color);
        background: linear-gradient(135deg, #1B3A5C, #2563EB);
        color: #ffffff;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      
      .drawer-body {
        flex: 1;
        overflow-y: auto;
        padding: 24px;
      }
      
      .drawer-tabs {
        display: flex;
        gap: 2px;
        border-bottom: 1px solid var(--border-color);
        background-color: var(--bg-base);
        padding: 4px 12px 0 12px;
      }
      
      .drawer-tab {
        padding: 8px 12px;
        font-size: 0.78rem;
        font-weight: 600;
        cursor: pointer;
        color: var(--text-secondary);
        border: 1px solid transparent;
        border-bottom: none;
        border-radius: 4px 4px 0 0;
      }
      
      .drawer-tab.active {
        background-color: #ffffff;
        color: var(--primary);
        border-color: var(--border-color);
        margin-bottom: -1px;
      }
      
      .alert-box-nr {
        display: flex;
        gap: 8px;
        align-items: flex-start;
        padding: 8px;
        border-radius: 6px;
        font-size: 0.75rem;
        border-left: 4px solid var(--border-color);
        line-height: 1.4;
      }
      
      .fluid-bar {
        height: 12px;
        background-color: var(--border-color);
        border-radius: 6px;
        overflow: hidden;
        display: flex;
        margin-top: 8px;
      }
      
      .handover-overlay {
        position: fixed;
        inset: 0;
        background: rgba(15,23,42,0.6);
        z-index: 2000;
        display: ${window.state.showHandoverPanel ? 'flex' : 'none'};
        align-items: center;
        justify-content: center;
        padding: 20px;
      }
      
      .handover-modal {
        background: #ffffff;
        border-radius: var(--radius-md);
        width: 850px;
        max-width: 95vw;
        max-height: 90vh;
        box-shadow: var(--shadow-lg);
        overflow-y: auto;
        display: flex;
        flex-direction: column;
      }
      
      @media (max-width: 1024px) {
        .nurse-three-col {
          grid-template-columns: 1fr !important;
        }
        .nurse-bottom-row {
          grid-template-columns: 1fr !important;
        }
        .nurse-kpi-card {
          min-width: 150px;
        }
      }
    </style>

    <!-- SECTION 1: SHIFT STATUS BAR -->
    <div class="nurse-status-bar">
      <div style="display: flex; align-items: center; gap: 12px; flex-wrap: wrap;">
        <div>
          <strong style="font-size: 0.88rem; color: var(--text-primary);">Sister Mercy, RN</strong>
          <span style="font-size: 0.72rem; color: var(--text-muted); margin-left: 4px;">Senior Staff Nurse · CCU & Gen-Ward</span>
        </div>
        <div style="font-size: 0.78rem; background-color: var(--bg-surface-elevated); padding: 2px 8px; border-radius: 4px; border: 1px solid var(--border-color);">
          Shift: <strong>Evening (04:00 PM - 12:00 AM)</strong>
        </div>
        <div class="admin-mono" style="font-size: 0.78rem; color: var(--color-warning); font-weight: bold; display: flex; align-items: center; gap: 4px;">
          ⏳ ${shiftTimeRemaining}
        </div>
        <span class="admin-mono" style="background-color: var(--color-warning-bg); color: var(--color-warning); border: 1px solid var(--color-warning); font-size: 0.7rem; font-weight: 700; padding: 2px 8px; border-radius: 20px;">
          Handover Due Soon
        </span>
      </div>
      
      <div style="display: flex; align-items: center; gap: 12px;">
        <span style="font-size: 0.78rem; color: var(--text-secondary);">Patient Load: <strong>4 Assigned Inpatients</strong></span>
        <button class="btn btn-primary" onclick="window.toggleHandoverPanel(true)" style="font-size: 0.78rem; font-weight: 700; height: 32px; background-color: var(--color-warning); border-color: var(--color-warning); color: #fff;">Start Handover</button>
      </div>
    </div>

    <!-- PAGE HEADING -->
    <div style="margin-top: 4px; margin-bottom: 16px;">
      <h1 style="font-size: 1.3rem; font-weight: 700; color: var(--text-primary); margin: 0; font-family: var(--font-display);">Nurse Station & Ward Command Center</h1>
      <div style="font-size: 0.78rem; color: var(--text-muted); margin-top: 2px;">Active ward patient vitals tracking, medications schedules, and tasks checklist.</div>
    </div>

    <!-- SECTION 2: KPI STAT CARDS ROW -->
    <div class="admin-kpi-scroll-row">
      ${kpis.map(k => `
        <div class="nurse-kpi-card status-${k.status}">
          <span style="font-size: 0.72rem; font-weight: 700; text-transform: uppercase; color: var(--text-secondary);">${k.title}</span>
          <div style="margin-top: 6px; margin-bottom: 6px;">
            <span class="admin-mono" style="font-size: 1.4rem; font-weight: 700; color: var(--text-primary); letter-spacing: -0.02em;">${k.value}</span>
            <div style="font-size: 0.72rem; color: var(--text-muted); margin-top: 1px;">${k.subtext}</div>
          </div>
          <div style="display: flex; align-items: center; justify-content: space-between; font-size: 0.72rem; border-top: 1px dashed var(--border-color); padding-top: 4px; margin-top: 4px;">
            <span style="color: ${k.status === 'normal' ? 'var(--color-success)' : 'var(--color-danger)'}; font-weight: 600;">
              ${k.trendText}
            </span>
          </div>
        </div>
      `).join('')}
    </div>

    <!-- SECTION 3: THREE-COLUMN MAIN AREA -->
    <div class="nurse-three-col" style="display: grid; grid-template-columns: 3.5fr 3.5fr 3fr; gap: 16px; margin-bottom: 16px;">
      
      <!-- LEFT COLUMN (35%) — BED BOARD & QUICK NAVIGATION -->
      <div style="display: flex; flex-direction: column; gap: 16px;">
        
        <!-- Ward Bed Board -->
        <div class="nurse-card" style="max-height: 380px; overflow-y: auto;">
          <div style="border-bottom: 1px solid var(--border-color); padding-bottom: 6px; margin-bottom: 2px; display: flex; justify-content: space-between; align-items: center;">
            <h3 style="font-size: 0.82rem; font-weight: 700; text-transform: uppercase; margin: 0; color: var(--text-primary);">Ward Bed Board</h3>
            <span style="font-size: 0.72rem; color: var(--text-muted);">Occupied: 4 beds</span>
          </div>
          <table class="custom-table" style="font-size: 0.78rem; width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background-color: var(--bg-surface-elevated); border-bottom: 1px solid var(--border-color);">
                <th style="padding: 6px 8px; text-align: left;">Bed</th>
                <th style="padding: 6px 8px; text-align: left;">Patient Details</th>
                <th style="padding: 6px 8px; text-align: center;">NEWS2</th>
                <th style="padding: 6px 8px; text-align: right;">Action</th>
              </tr>
            </thead>
            <tbody>
              ${window.state.nurseActivePatients.map(pat => {
                const isActive = activePatient && pat.uhid === activePatient.uhid;
                return `
                  <tr class="nurse-bed-row ${isActive ? 'active-row' : ''}" onclick="window.selectNursePatient('${pat.uhid}')" style="border-bottom: 1px solid var(--border-color);">
                    <td class="admin-mono" style="padding: 6px 8px; font-weight: bold; color: var(--primary);">${pat.bed.split('-')[1] || pat.bed}</td>
                    <td style="padding: 6px 8px;">
                      <div style="font-weight: 600; color: var(--text-primary);">${pat.name}</div>
                      <div class="admin-mono" style="font-size: 0.68rem; color: var(--text-muted);">${pat.uhid}</div>
                      <div style="display: flex; gap: 4px; margin-top: 2px;">
                        <span class="badge-risk ${pat.morseScore >= 45 ? 'risk-high' : 'risk-low'}">Fall: ${pat.morseScore >= 45 ? 'High' : 'Low'}</span>
                        <span class="badge-risk ${pat.bradenScore <= 12 ? 'risk-high' : 'risk-low'}">Ulcer: ${pat.bradenScore <= 12 ? 'High' : 'Low'}</span>
                      </div>
                    </td>
                    <td style="padding: 6px 8px; text-align: center;">
                      <span class="admin-mono" style="padding: 2px 6px; border-radius: 4px; font-weight: bold; font-size: 0.72rem; ${getNewsColor(pat.news2)}">${pat.news2}</span>
                    </td>
                    <td style="padding: 6px 8px; text-align: right;">
                      <button class="btn btn-primary" style="padding: 2px 6px; font-size: 0.7rem; font-weight: 700; height: 22px;">See Patient</button>
                    </td>
                  </tr>
                `;
              }).join('')}
              <!-- Mock Vacant beds -->
              <tr style="background-color: var(--bg-base); opacity: 0.7; border-bottom: 1px solid var(--border-color);">
                <td class="admin-mono" style="padding: 6px 8px; color: var(--text-muted);">BED 01</td>
                <td style="padding: 6px 8px; color: var(--text-muted); font-style: italic;">Vacant Bed</td>
                <td style="padding: 6px 8px; text-align: center; color: var(--text-muted);">—</td>
                <td style="padding: 6px 8px; text-align: right; color: var(--text-muted); font-size: 0.7rem;">Available</td>
              </tr>
              <tr style="background-color: var(--bg-base); opacity: 0.7; border-bottom: 1px solid var(--border-color);">
                <td class="admin-mono" style="padding: 6px 8px; color: var(--text-muted);">BED 03</td>
                <td style="padding: 6px 8px; color: var(--text-muted); font-style: italic;">Vacant Bed</td>
                <td style="padding: 6px 8px; text-align: center; color: var(--text-muted);">—</td>
                <td style="padding: 6px 8px; text-align: right; color: var(--text-muted); font-size: 0.7rem;">Available</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Quick Actions -->
        <div class="nurse-card">
          <div style="border-bottom: 1px solid var(--border-color); padding-bottom: 6px; margin-bottom: 6px;">
            <h3 style="font-size: 0.82rem; font-weight: 700; text-transform: uppercase; margin: 0; color: var(--text-primary);">Quick Actions</h3>
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
            ${['Record Vitals', 'Administer Medication', 'Execute Order', 'Incident Report', 'Call Doctor', 'Request Housekeeping'].map(action => `
              <button class="btn btn-secondary" onclick="window.triggerQuickAction('${action}')" style="font-size: 0.72rem; padding: 6px 4px; text-align: center; height: 38px; display: flex; align-items: center; justify-content: center; font-weight: 600;">
                ${action}
              </button>
            `).join('')}
          </div>
        </div>

      </div>

      <!-- MIDDLE COLUMN (35%) — MEDICATION ROUND & CLINICAL PROCEDURES -->
      <div style="display: flex; flex-direction: column; gap: 16px;">
        
        <!-- Medication Round (MAR) -->
        <div class="nurse-card" style="max-height: 380px; overflow-y: auto;">
          <div style="border-bottom: 1px solid var(--border-color); padding-bottom: 6px; margin-bottom: 2px;">
            <h3 style="font-size: 0.82rem; font-weight: 700; text-transform: uppercase; margin: 0; color: var(--text-primary);">Medication Round (MAR)</h3>
          </div>
          <div style="display: flex; flex-direction: column; gap: 8px;">
            ${window.state.nurseMeds.map(med => {
              const isOverdue = med.time < '16:00'; // 15:30 is overdue
              return `
                <div style="border: 1px solid var(--border-color); border-radius: 6px; padding: 8px; background-color: ${med.status === 'Administered' ? 'var(--color-success-bg)' : '#ffffff'}; position: relative;">
                  <div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 0.75rem;">
                    <span>${med.name} (${med.bed.split('-')[1] || med.bed})</span>
                    <span class="admin-mono" style="color: ${isOverdue && med.status === 'Pending' ? 'var(--color-danger)' : 'var(--text-secondary)'}; font-weight: bold;">
                      ${med.time} ${isOverdue && med.status === 'Pending' ? '<span class="badge" style="background:#fee2e2;color:#ef4444;font-size:0.6rem;padding:1px 4px;">OVERDUE</span>' : ''}
                    </span>
                  </div>
                  <div style="font-size: 0.72rem; color: var(--text-primary); margin-top: 4px;">
                    <strong>${med.drug}</strong> · ${med.dose} · ${med.route}
                  </div>
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 6px; font-size: 0.7rem; border-top: 1px dashed var(--border-color); padding-top: 6px;">
                    <span style="font-weight: 700; color: ${med.status === 'Administered' ? 'var(--color-success)' : 'var(--text-secondary)'};">${med.status}</span>
                    ${med.status === 'Pending' ? `
                      <div style="display: flex; gap: 4px;">
                        <button class="btn btn-primary" onclick="window.administerNurseMed('${med.id}')" style="padding: 1px 6px; font-size: 0.65rem; height: 20px; font-weight: 700;">Give</button>
                        <button class="btn btn-secondary" onclick="window.holdRefuseNurseMed('${med.id}', 'Hold')" style="padding: 1px 6px; font-size: 0.65rem; height: 20px;">Hold</button>
                        <button class="btn btn-secondary" onclick="window.holdRefuseNurseMed('${med.id}', 'Refuse')" style="padding: 1px 6px; font-size: 0.65rem; height: 20px;">Refuse</button>
                      </div>
                    ` : ''}
                  </div>
                </div>
              `;
            }).join('')}
          </div>
          
          <!-- PRN Medications section -->
          <div style="border-top: 1px solid var(--border-color); margin-top: 12px; padding-top: 10px;">
            <div style="font-size: 0.75rem; font-weight: 700; text-transform: uppercase; color: var(--text-secondary); margin-bottom: 6px;">Active PRN Medications</div>
            ${window.state.nursePrnMeds.map(prn => `
              <div style="background-color: var(--bg-surface-elevated); border: 1px dashed var(--border-color); border-radius: 4px; padding: 6px; font-size: 0.72rem; margin-bottom: 6px;">
                <div style="display: flex; justify-content: space-between; font-weight: 600;">
                  <span>${prn.name} (${prn.bed.split('-')[1] || prn.bed})</span>
                  <span>${prn.route}</span>
                </div>
                <div style="color: var(--text-primary); font-weight: 700; margin-top: 2px;">${prn.drug}</div>
                <div style="font-size: 0.65rem; color: var(--text-muted); margin-top: 2px; text-align: right;">
                  Last: ${prn.lastAdmin} @ <span class="admin-mono">${prn.lastTime}</span>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Procedures Due -->
        <div class="nurse-card" style="max-height: 250px; overflow-y: auto;">
          <div style="border-bottom: 1px solid var(--border-color); padding-bottom: 6px; margin-bottom: 2px;">
            <h3 style="font-size: 0.82rem; font-weight: 700; text-transform: uppercase; margin: 0; color: var(--text-primary);">Procedures Due</h3>
          </div>
          <div style="display: flex; flex-direction: column; gap: 6px;">
            ${window.state.nurseProcedures.map(proc => {
              const isOverdue = proc.dueTime < '16:00';
              return `
                <div style="border: 1px solid var(--border-color); border-radius: 4px; padding: 6px; font-size: 0.72rem; background-color: ${isOverdue ? '#fef2f2' : '#ffffff'};">
                  <div style="display: flex; justify-content: space-between; font-weight: 600;">
                    <span>${proc.name} (${proc.bed.split('-')[1] || proc.bed})</span>
                    <span class="admin-mono" style="color: ${isOverdue ? 'var(--color-danger)' : 'var(--text-secondary)'}; font-weight: bold;">
                      Due: ${proc.dueTime}
                    </span>
                  </div>
                  <div style="color: var(--text-primary); margin-top: 2px;">${proc.procedure}</div>
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 4px; font-size: 0.65rem; border-top: 1px dashed var(--border-color); padding-top: 4px;">
                    <span>Last: ${proc.lastDone}</span>
                    <button class="btn btn-primary" onclick="window.completeNurseProcedure('${proc.id}')" style="padding: 1px 6px; font-size: 0.65rem; height: 18px; font-weight: 700;">Done</button>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>

      </div>

      <!-- RIGHT COLUMN (30%) — CLINICAL ALERTS & ORDERS QUEUE -->
      <div style="display: flex; flex-direction: column; gap: 16px;">
        
        <!-- Alerts & Escalations -->
        <div class="nurse-card" style="border: 1px solid #fca5a5; background: #fffcfc; max-height: 220px; overflow-y: auto;">
          <div style="border-bottom: 1px solid #fca5a5; padding-bottom: 6px; margin-bottom: 2px; display: flex; align-items: center; gap: 6px;">
            <span style="font-size: 1.05rem;">🚨</span>
            <h3 style="font-size: 0.82rem; font-weight: 700; text-transform: uppercase; margin: 0; color: #991b1b;">Alerts & Escalations</h3>
          </div>
          <div style="display: flex; flex-direction: column; gap: 6px;">
            ${window.state.nurseAlerts.map(alert => {
              let bg = '#fff5f5';
              let border = '#ef4444';
              let textCol = '#991b1b';
              if (alert.severity === 'orange') { bg = '#fff7ed'; border = '#f97316'; textCol = '#c2410c'; }
              if (alert.severity === 'amber') { bg = '#fffdf5'; border = '#f59e0b'; textCol = '#78350f'; }

              return `
                <div class="alert-box-nr" style="background-color: ${bg}; border-left-color: ${border}; color: ${textCol};">
                  <div style="flex: 1;">
                    <div style="font-weight: 600;">${alert.text}</div>
                    <div style="font-size: 0.65rem; opacity: 0.8; margin-top: 2px; display: flex; justify-content: space-between; align-items: center;">
                      <span class="admin-mono">${alert.time}</span>
                      <button onclick="alert('Doctor notified via paging system for ${alert.patientUhid || 'patient'}. Escalation logged.');" style="background: none; border: none; text-decoration: underline; color: inherit; font-size: 0.68rem; font-weight: bold; cursor: pointer; padding: 0;">Escalate</button>
                    </div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <!-- Doctor Orders Queue -->
        <div class="nurse-card" style="max-height: 200px; overflow-y: auto;">
          <div style="border-bottom: 1px solid var(--border-color); padding-bottom: 6px; margin-bottom: 2px;">
            <h3 style="font-size: 0.82rem; font-weight: 700; text-transform: uppercase; margin: 0; color: var(--text-primary);">Doctor Orders Queue</h3>
          </div>
          <div style="display: flex; flex-direction: column; gap: 6px;">
            ${window.state.nurseDoctorOrders.map(ord => `
              <div style="border: 1px solid var(--border-color); border-radius: 4px; padding: 6px; font-size: 0.72rem;">
                <div style="display: flex; justify-content: space-between; font-weight: 600;">
                  <span>${ord.name} (${ord.bed.split('-')[1] || ord.bed})</span>
                  <span class="badge" style="background-color: ${ord.priority === 'STAT' ? 'var(--color-danger-bg)' : 'var(--primary-glow)'}; color: ${ord.priority === 'STAT' ? 'var(--color-danger)' : 'var(--primary)'}; font-size: 0.62rem; padding: 1px 4px;">${ord.priority}</span>
                </div>
                <div style="margin-top: 3px; color: var(--text-primary);">
                  <strong>${ord.type}</strong>: ${ord.detail}
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 4px; font-size: 0.65rem; border-top: 1px dashed var(--border-color); padding-top: 4px;">
                  <span class="admin-mono">${ord.time} · ${ord.orderedBy}</span>
                  <button class="btn btn-primary" onclick="window.executeNurseOrder('${ord.id}')" style="padding: 1px 6px; font-size: 0.65rem; height: 18px; font-weight: 700;">Execute</button>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Sample Collection Queue -->
        <div class="nurse-card" style="max-height: 200px; overflow-y: auto;">
          <div style="border-bottom: 1px solid var(--border-color); padding-bottom: 6px; margin-bottom: 2px;">
            <h3 style="font-size: 0.82rem; font-weight: 700; text-transform: uppercase; margin: 0; color: var(--text-primary);">Sample Collection (Phleb)</h3>
          </div>
          <div style="display: flex; flex-direction: column; gap: 6px;">
            ${window.state.nurseSamples.map(samp => `
              <div style="border: 1px solid var(--border-color); border-radius: 4px; padding: 6px; font-size: 0.72rem;">
                <div style="display: flex; justify-content: space-between; font-weight: 600;">
                  <span>${samp.name} (${samp.bed.split('-')[1] || samp.bed})</span>
                  <span class="badge" style="background-color: ${samp.priority === 'STAT' ? 'var(--color-danger-bg)' : 'var(--primary-glow)'}; color: ${samp.priority === 'STAT' ? 'var(--color-danger)' : 'var(--primary)'}; font-size: 0.62rem; padding: 1px 4px;">${samp.priority}</span>
                </div>
                <div style="color: var(--text-primary); margin-top: 2px;">
                  <strong>Tests:</strong> ${samp.tests}<br>
                  <span style="color: var(--text-muted); font-size: 0.68rem;">Tubes: ${samp.tubes}</span>
                </div>
                <div style="text-align: right; margin-top: 4px; border-top: 1px dashed var(--border-color); padding-top: 4px;">
                  <button class="btn btn-primary" onclick="window.collectNurseSample('${samp.id}')" style="padding: 1px 6px; font-size: 0.65rem; height: 18px; font-weight: 700;">Collected</button>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

      </div>
    </div>

    <!-- SECTION 5: BOTTOM SUMMARY ROW (3 equal cards) -->
    <div class="nurse-bottom-row" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 16px;">
      
      <!-- a) Vitals Compliance -->
      <div class="nurse-card">
        <div style="border-bottom: 1px solid var(--border-color); padding-bottom: 6px; margin-bottom: 2px; display: flex; justify-content: space-between; align-items: center;">
          <h3 style="font-size: 0.82rem; font-weight: 700; text-transform: uppercase; margin: 0; color: var(--text-primary);">Vitals Compliance</h3>
          <span class="admin-mono" style="font-weight: 800; color: var(--color-success); font-size: 0.95rem;">75%</span>
        </div>
        <div style="font-size: 0.75rem; color: var(--text-secondary);">
          <div>Recorded in scheduled window: <strong>3 / 4 Patients</strong></div>
          <div style="margin-top: 6px; font-weight: 700; color: var(--color-danger);">Overdue > 1 Hour:</div>
          <div style="background-color: #fef2f2; color: #991b1b; padding: 4px 8px; border-radius: 4px; font-size: 0.7rem; border-left: 3px solid #ef4444; margin-top: 4px; display: flex; justify-content: space-between;">
            <span>Sourav Desai (Bed 02)</span>
            <span class="admin-mono" style="font-weight: bold;">1h 15m Overdue</span>
          </div>
        </div>
      </div>

      <!-- b) Medication Compliance -->
      <div class="nurse-card">
        <div style="border-bottom: 1px solid var(--border-color); padding-bottom: 6px; margin-bottom: 2px; display: flex; justify-content: space-between; align-items: center;">
          <h3 style="font-size: 0.82rem; font-weight: 700; text-transform: uppercase; margin: 0; color: var(--text-primary);">Medication Compliance</h3>
          <span class="admin-mono" style="font-weight: 800; color: var(--color-success); font-size: 0.95rem;">80%</span>
        </div>
        <div style="font-size: 0.75rem; color: var(--text-secondary);">
          <div>Dispensed in active round: <strong>0 / 4 Pending</strong></div>
          <div style="margin-top: 6px; font-weight: 700; color: var(--color-warning);">Held / Refused Meds:</div>
          <div style="background-color: var(--color-warning-bg); color: #78350f; padding: 4px 8px; border-radius: 4px; font-size: 0.7rem; border-left: 3px solid var(--color-warning); margin-top: 4px; display: flex; justify-content: space-between;">
            <span>Inj. Heparin (Held)</span>
            <span>Reason: Awaiting labs</span>
          </div>
        </div>
      </div>

      <!-- c) Incidents This Shift -->
      <div class="nurse-card">
        <div style="border-bottom: 1px solid var(--border-color); padding-bottom: 6px; margin-bottom: 2px; display: flex; justify-content: space-between; align-items: center;">
          <h3 style="font-size: 0.82rem; font-weight: 700; text-transform: uppercase; margin: 0; color: var(--text-primary);">Incidents This Shift</h3>
          <button class="btn btn-primary" onclick="alert('Incident reporting form loaded. Logging audit index...')" style="padding: 2px 8px; font-size: 0.68rem; font-weight: 700; height: 22px; background: var(--color-danger); border-color: var(--color-danger);">Report Incident</button>
        </div>
        <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.75rem; height: 100%; margin-top: 8px;">
          <div style="text-align: center; flex: 1;">
            <div class="admin-mono" style="font-size: 1.25rem; font-weight: bold; color: var(--text-primary);">0</div>
            <div style="font-size: 0.65rem; color: var(--text-muted); text-transform: uppercase;">Falls</div>
          </div>
          <div style="text-align: center; flex: 1; border-left: 1px solid var(--border-color); border-right: 1px solid var(--border-color);">
            <div class="admin-mono" style="font-size: 1.25rem; font-weight: bold; color: var(--text-primary);">0</div>
            <div style="font-size: 0.65rem; color: var(--text-muted); text-transform: uppercase;">Near-misses</div>
          </div>
          <div style="text-align: center; flex: 1;">
            <div class="admin-mono" style="font-size: 1.25rem; font-weight: bold; color: var(--text-primary);">0</div>
            <div style="font-size: 0.65rem; color: var(--text-muted); text-transform: uppercase;">Med Errors</div>
          </div>
        </div>
      </div>

    </div>

    <!-- SECTION 4: PATIENT DETAIL DRAWER PANEL (Slides in from right) -->
    <div class="nurse-detail-drawer" id="nurse-patient-drawer">
      ${activePatient ? `
        <div class="drawer-header">
          <div>
            <span style="font-size: 0.7rem; text-transform: uppercase; opacity: 0.8; font-weight: 700;">Inpatient Details</span>
            <h2 style="font-size: 1.15rem; font-weight: 800; margin: 2px 0 0 0;">${activePatient.name}</h2>
          </div>
          <button onclick="window.closeNurseDrawer()" style="background: none; border: none; color: white; font-size: 1.3rem; cursor: pointer; font-weight: bold; padding: 4px;">✕</button>
        </div>
        
        <div class="drawer-tabs">
          ${['Overview', 'Vitals', 'MAR', 'Orders', 'Devices', 'I&O', 'Notes', 'Documents'].map(tab => `
            <div class="drawer-tab ${window.state.activeNurseTab === tab ? 'active' : ''}" onclick="window.setNurseDetailTab('${tab}')">${tab}</div>
          `).join('')}
        </div>

        <div class="drawer-body">
          
          <!-- TAB: Overview -->
          ${window.state.activeNurseTab === 'Overview' ? `
            <div style="display: flex; flex-direction: column; gap: 12px;">
              <div style="display: flex; justify-content: space-between; align-items: center; background-color: var(--bg-surface-elevated); padding: 8px 12px; border-radius: 6px; border: 1px solid var(--border-color);">
                <div>
                  <strong style="color: var(--text-primary); font-size: 0.85rem;">UHID: ${activePatient.uhid}</strong>
                  <div style="font-size: 0.72rem; color: var(--text-secondary); margin-top: 2px;">Age: ${activePatient.age}y | Gender: ${activePatient.gender} | Blood: ${activePatient.bloodGroup}</div>
                </div>
                <div class="admin-mono" style="font-size: 0.78rem; font-weight: bold; color: var(--primary);">${activePatient.bed}</div>
              </div>

              ${activePatient.allergies && activePatient.allergies !== 'No Known Allergies' ? `
                <div style="background-color: #fef2f2; border: 1px solid #fee2e2; border-left: 4px solid var(--color-danger); padding: 8px 12px; border-radius: 6px; color: #991b1b; font-size: 0.78rem; font-weight: bold;">
                  🚨 ALLERGY WARNING: ${activePatient.allergies}
                </div>
              ` : ''}

              <div style="font-size: 0.78rem; color: var(--text-primary);">
                <p><strong>Primary Diagnosis:</strong> ${activePatient.diagnosis} (${activePatient.icd10})</p>
                <p><strong>Attending Consultant:</strong> ${activePatient.consultant}</p>
                <p><strong>Length of Stay (LOS):</strong> ${activePatient.los} Days</p>
                <p><strong>Diet Type:</strong> <span class="badge" style="background:#eff6ff;color:#1e40af;font-size:0.7rem;padding:2px 6px;">${activePatient.dietType}</span></p>
              </div>

              <!-- NEWS2 Breakdown -->
              <div style="background-color: #fafafa; border: 1px solid var(--border-color); border-radius: 6px; padding: 12px; margin-top: 4px;">
                <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-color); padding-bottom: 4px; margin-bottom: 6px;">
                  <strong style="font-size: 0.75rem; text-transform: uppercase; color: var(--text-secondary);">NEWS2 Component Breakdown</strong>
                  <span class="admin-mono" style="padding: 2px 8px; border-radius: 4px; font-weight: 800; font-size: 0.8rem; ${getNewsColor(activePatient.news2)}">Score: ${activePatient.news2}</span>
                </div>
                <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; font-size: 0.72rem; text-align: center;">
                  <div style="background:#ffffff; padding: 4px; border: 1px solid var(--border-color); border-radius: 4px;">
                    <div style="color: var(--text-muted);">Resp Rate</div>
                    <strong class="admin-mono">${activePatient.vitalsHistory[0]?.rr || '--'} /min</strong>
                  </div>
                  <div style="background:#ffffff; padding: 4px; border: 1px solid var(--border-color); border-radius: 4px;">
                    <div style="color: var(--text-muted);">SpO2</div>
                    <strong class="admin-mono">${activePatient.vitalsHistory[0]?.spo2 || '--'}%</strong>
                  </div>
                  <div style="background:#ffffff; padding: 4px; border: 1px solid var(--border-color); border-radius: 4px;">
                    <div style="color: var(--text-muted);">Temp</div>
                    <strong class="admin-mono">${activePatient.vitalsHistory[0]?.temp || '--'}°F</strong>
                  </div>
                  <div style="background:#ffffff; padding: 4px; border: 1px solid var(--border-color); border-radius: 4px;">
                    <div style="color: var(--text-muted);">Blood Pres</div>
                    <strong class="admin-mono">${activePatient.vitalsHistory[0]?.bp || '--'}</strong>
                  </div>
                </div>
              </div>

              <!-- Safety indicators -->
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                <div style="border: 1px solid var(--border-color); border-radius: 6px; padding: 8px; font-size: 0.75rem;">
                  <strong>Fall Risk Checklist (Morse):</strong>
                  <div style="font-size: 0.78rem; font-weight: bold; margin-top: 4px; color: ${activePatient.morseScore >= 45 ? 'var(--color-danger)' : 'var(--color-success)'};">
                    Score: ${activePatient.morseScore} (${activePatient.morseScore >= 45 ? 'High Risk' : 'Low Risk'})
                  </div>
                </div>
                <div style="border: 1px solid var(--border-color); border-radius: 6px; padding: 8px; font-size: 0.75rem;">
                  <strong>Pressure Ulcer (Braden):</strong>
                  <div style="font-size: 0.78rem; font-weight: bold; margin-top: 4px; color: ${activePatient.bradenScore <= 12 ? 'var(--color-danger)' : 'var(--color-success)'};">
                    Score: ${activePatient.bradenScore} (${activePatient.bradenScore <= 12 ? 'High Risk' : 'Low Risk'})
                  </div>
                </div>
              </div>

              <!-- Restraints -->
              <div style="border: 1px solid var(--border-color); border-radius: 6px; padding: 8px; font-size: 0.75rem; background-color: ${activePatient.restraint.active === 'Yes' ? '#fffbeb' : '#ffffff'};">
                <strong>Bedside Restraints Status (MHCA compliance):</strong>
                <div style="margin-top: 4px;">
                  Active: <strong>${activePatient.restraint.active}</strong>
                  ${activePatient.restraint.active === 'Yes' ? `
                    · Type: <strong>${activePatient.restraint.type}</strong><br>
                    Reason: <em>${activePatient.restraint.reason}</em> · Review Due: <strong class="admin-mono">${activePatient.restraint.reviewDue}</strong>
                  ` : ''}
                </div>
              </div>

              <!-- Patient Education Checklist -->
              <div style="border: 1px solid var(--border-color); border-radius: 6px; padding: 8px; font-size: 0.75rem;">
                <strong>Patient & Family Education Tracker:</strong>
                <div style="display: flex; flex-direction: column; gap: 4px; margin-top: 6px;">
                  <label style="display: flex; align-items: center; gap: 6px;">
                    <input type="checkbox" ${activePatient.education.explainedDiagnosis === 'Yes' ? 'checked' : ''} onchange="activePatient.education.explainedDiagnosis = this.checked ? 'Yes' : 'No'">
                    Diagnosis and care plan explained
                  </label>
                  <label style="display: flex; align-items: center; gap: 6px;">
                    <input type="checkbox" ${activePatient.education.explainedMeds === 'Yes' ? 'checked' : ''} onchange="activePatient.education.explainedMeds = this.checked ? 'Yes' : 'No'">
                    Medication safety & side effects explained
                  </label>
                  <label style="display: flex; align-items: center; gap: 6px;">
                    <input type="checkbox" ${activePatient.education.dischargeInsts === 'Yes' ? 'checked' : ''} onchange="activePatient.education.dischargeInsts = this.checked ? 'Yes' : 'No'">
                    Discharge instructions explained
                  </label>
                </div>
              </div>

              <!-- Consent Forms -->
              <div style="border: 1px solid var(--border-color); border-radius: 6px; padding: 8px; font-size: 0.75rem;">
                <strong>Signed Bedside Consents:</strong>
                <div style="display: flex; flex-direction: column; gap: 4px; margin-top: 4px;">
                  ${activePatient.consents.map(c => `
                    <div style="display: flex; justify-content: space-between; align-items: center; background-color: var(--bg-surface-elevated); padding: 4px 8px; border-radius: 4px;">
                      <span>${c.name}</span>
                      ${c.status === 'Signed' ? `
                        <span style="color: var(--color-success); font-weight: bold;">✓ Signed</span>
                      ` : `
                        <button class="btn btn-sm btn-primary" onclick="window.signNurseConsent('${activePatient.uhid}', '${c.id}')" style="padding: 1px 6px; font-size: 0.65rem; height: 18px;">Sign Bedside</button>
                      `}
                    </div>
                  `).join('')}
                  ${activePatient.consents.length === 0 ? '<div style="color: var(--text-muted); font-style: italic;">No consent forms listed.</div>' : ''}
                </div>
              </div>
            </div>
          ` : ''}

          <!-- TAB: Vitals -->
          ${window.state.activeNurseTab === 'Vitals' ? `
            <div style="display: flex; flex-direction: column; gap: 16px;">
              <div class="nurse-card" style="padding: 12px !important; background: var(--bg-surface-elevated);">
                <strong style="font-size: 0.78rem; text-transform: uppercase; color: var(--text-secondary); display: block; border-bottom: 1px solid var(--border-color); padding-bottom: 4px; margin-bottom: 8px;">Record New Vitals Entry</strong>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size: 0.75rem;">
                  <div>
                    <label>Heart Rate (bpm)</label>
                    <input type="number" id="vit-hr" class="form-control" style="height:30px; font-size:0.75rem;" value="85">
                  </div>
                  <div>
                    <label>Blood Pressure (Systolic)</label>
                    <input type="number" id="vit-sbp" class="form-control" style="height:30px; font-size:0.75rem;" value="120">
                  </div>
                  <div>
                    <label>Blood Pressure (Diastolic)</label>
                    <input type="number" id="vit-dbp" class="form-control" style="height:30px; font-size:0.75rem;" value="80">
                  </div>
                  <div>
                    <label>Resp Rate (/min)</label>
                    <input type="number" id="vit-rr" class="form-control" style="height:30px; font-size:0.75rem;" value="16">
                  </div>
                  <div>
                    <label>Temperature (°F)</label>
                    <input type="number" step="0.1" id="vit-temp" class="form-control" style="height:30px; font-size:0.75rem;" value="98.6">
                  </div>
                  <div>
                    <label>SpO2 (%)</label>
                    <input type="number" id="vit-spo2" class="form-control" style="height:30px; font-size:0.75rem;" value="98">
                  </div>
                  <div>
                    <label>AVPU Scale</label>
                    <select id="vit-avpu" class="form-select" style="height:30px; font-size:0.75rem; padding: 0 4px;">
                      <option value="A" selected>Alert</option>
                      <option value="V">Voice</option>
                      <option value="P">Pain</option>
                      <option value="U">Unresponsive</option>
                    </select>
                  </div>
                  <div>
                    <label>Pain Score (0-10)</label>
                    <input type="number" id="vit-pain" class="form-control" style="height:30px; font-size:0.75rem;" value="2">
                  </div>
                </div>
                <button class="btn btn-primary" onclick="window.saveNurseVitals('${activePatient.uhid}')" style="width: 100%; margin-top: 12px; font-weight: 700; height: 34px;">Record Vitals & Calculate NEWS2</button>
              </div>

              <!-- History table -->
              <div>
                <strong style="font-size: 0.78rem; text-transform: uppercase; color: var(--text-secondary); display: block; margin-bottom: 6px;">Vitals Log History (Last 10)</strong>
                <table style="width: 100%; font-size: 0.72rem; border-collapse: collapse;">
                  <thead>
                    <tr style="background-color: var(--bg-base); border-bottom: 1px solid var(--border-color); color: var(--text-muted); text-align: left;">
                      <th style="padding: 4px 6px;">Time</th>
                      <th style="padding: 4px 6px; text-align: center;">BP</th>
                      <th style="padding: 4px 6px; text-align: center;">HR</th>
                      <th style="padding: 4px 6px; text-align: center;">RR</th>
                      <th style="padding: 4px 6px; text-align: center;">Temp</th>
                      <th style="padding: 4px 6px; text-align: center;">SpO2</th>
                      <th style="padding: 4px 6px; text-align: center;">AVPU</th>
                      <th style="padding: 4px 6px; text-align: right;">NEWS2</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${activePatient.vitalsHistory.map(v => {
                      const spo2Red = v.spo2 < 92;
                      const hrRed = v.hr > 100 || v.hr < 50;
                      return `
                        <tr style="border-bottom: 1px dashed var(--border-color);">
                          <td class="admin-mono" style="padding: 6px; font-weight: 600;">${v.time}</td>
                          <td class="admin-mono" style="padding: 6px; text-align: center;">${v.bp}</td>
                          <td class="admin-mono" style="padding: 6px; text-align: center; color: ${hrRed ? 'var(--color-danger)' : 'inherit'}; font-weight: ${hrRed ? 'bold' : 'normal'};">${v.hr}</td>
                          <td class="admin-mono" style="padding: 6px; text-align: center;">${v.rr}</td>
                          <td class="admin-mono" style="padding: 6px; text-align: center;">${v.temp}°F</td>
                          <td class="admin-mono" style="padding: 6px; text-align: center; color: ${spo2Red ? 'var(--color-danger)' : 'inherit'}; font-weight: ${spo2Red ? 'bold' : 'normal'};">${v.spo2}%</td>
                          <td class="admin-mono" style="padding: 6px; text-align: center;">${v.avpu}</td>
                          <td style="padding: 6px; text-align: right;">
                            <span class="admin-mono" style="padding: 1px 4px; border-radius: 3px; font-weight: bold; ${getNewsColor(v.news)}">${v.news}</span>
                          </td>
                        </tr>
                      `;
                    }).join('')}
                  </tbody>
                </table>
              </div>
            </div>
          ` : ''}

          <!-- TAB: MAR -->
          ${window.state.activeNurseTab === 'MAR' ? `
            <div style="display: flex; flex-direction: column; gap: 16px;">
              <strong style="font-size: 0.78rem; text-transform: uppercase; color: var(--text-secondary);">MAR Grid (Scheduled Administrations)</strong>
              
              <!-- Grid simulation table -->
              <table style="width: 100%; font-size: 0.7rem; border-collapse: collapse; text-align: center;">
                <thead>
                  <tr style="background-color: var(--bg-base); border-bottom: 1px solid var(--border-color); color: var(--text-muted);">
                    <th style="padding: 6px; text-align: left;">Medication</th>
                    <th style="padding: 6px;">08:00</th>
                    <th style="padding: 6px;">12:00</th>
                    <th style="padding: 6px;">16:00</th>
                    <th style="padding: 6px;">20:00</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style="border-bottom: 1px solid var(--border-color);">
                    <td style="padding: 6px; text-align: left;">
                      <strong>Inj. Heparin 5000 IU</strong>
                      <div style="font-size: 0.65rem; color: var(--text-muted);">Subcutaneous · Q8H</div>
                    </td>
                    <td style="color: var(--color-success); font-weight: bold; font-size: 0.8rem;">✓ <span style="font-size: 0.58rem; font-weight: normal; color: var(--text-muted);">SM</span></td>
                    <td style="color: var(--color-success); font-weight: bold; font-size: 0.8rem;">✓ <span style="font-size: 0.58rem; font-weight: normal; color: var(--text-muted);">SM</span></td>
                    <td style="font-weight: bold; color: var(--color-warning); font-size: 0.78rem;">Pending</td>
                    <td style="color: var(--text-muted);">—</td>
                  </tr>
                  <tr style="border-bottom: 1px solid var(--border-color);">
                    <td style="padding: 6px; text-align: left;">
                      <strong>Inj. Pip-Tazo 4.5g</strong>
                      <div style="font-size: 0.65rem; color: var(--text-muted);">IV Infusion · Q6H</div>
                    </td>
                    <td style="color: var(--color-success); font-weight: bold; font-size: 0.8rem;">✓ <span style="font-size: 0.58rem; font-weight: normal; color: var(--text-muted);">SM</span></td>
                    <td style="color: var(--color-warning); font-weight: bold; font-size: 0.75rem;">H <span style="font-size: 0.58rem; font-weight: normal; color: var(--text-muted);">SM</span></td>
                    <td style="font-weight: bold; color: var(--color-danger); font-size: 0.78rem;">Overdue</td>
                    <td style="color: var(--text-muted);">—</td>
                  </tr>
                </tbody>
              </table>

              <!-- Audit Trail -->
              <div style="margin-top: 12px; border-top: 1px solid var(--border-color); padding-top: 10px;">
                <strong style="font-size: 0.75rem; text-transform: uppercase; color: var(--text-secondary); display: block; margin-bottom: 6px;">Administration Log & Audit Trail</strong>
                <div style="display: flex; flex-direction: column; gap: 6px;">
                  <div style="background-color: var(--bg-surface-elevated); padding: 6px; border-radius: 4px; font-size: 0.72rem;">
                    <div style="display: flex; justify-content: space-between; font-weight: 600;">
                      <span>Inj. Heparin given @ 12:00</span>
                      <span>Sister Mercy, RN</span>
                    </div>
                    <div style="color: var(--text-muted); font-size: 0.68rem; margin-top: 2px;">Batch: HEP-99201 · Expiry: 12/28 · Site: Left abdomen</div>
                  </div>
                </div>
              </div>
            </div>
          ` : ''}

          <!-- TAB: Orders -->
          ${window.state.activeNurseTab === 'Orders' ? `
            <div style="display: flex; flex-direction: column; gap: 12px;">
              <strong style="font-size: 0.78rem; text-transform: uppercase; color: var(--text-secondary);">Doctor Clinical Orders & Directives</strong>
              
              <div style="display: flex; flex-direction: column; gap: 8px;">
                ${window.state.nurseDoctorOrders.filter(o => o.patientUhid === activePatient.uhid || activePatient.uhid === 'UHID20000001').map(ord => `
                  <div style="border: 1px solid var(--border-color); border-radius: 6px; padding: 10px; font-size: 0.75rem;">
                    <div style="display: flex; justify-content: space-between; font-weight: 700;">
                      <span>Type: ${ord.type}</span>
                      <span class="badge" style="background-color: ${ord.priority === 'STAT' ? 'var(--color-danger-bg)' : 'var(--primary-glow)'}; color: ${ord.priority === 'STAT' ? 'var(--color-danger)' : 'var(--primary)'}; font-size: 0.65rem; padding: 2px 6px;">${ord.priority}</span>
                    </div>
                    <div style="margin-top: 4px; color: var(--text-primary);">
                      Order: <strong>${ord.detail}</strong>
                    </div>
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 6px; border-top: 1px dashed var(--border-color); padding-top: 6px; font-size: 0.68rem; color: var(--text-muted);">
                      <span>Ordered By: ${ord.orderedBy} @ ${ord.time}</span>
                      <button class="btn btn-primary" onclick="window.executeNurseOrder('${ord.id}')" style="padding: 2px 8px; font-size: 0.7rem; font-weight: 700; height: 22px;">Mark Executed</button>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
          ` : ''}

          <!-- TAB: Devices -->
          ${window.state.activeNurseTab === 'Devices' ? `
            <div style="display: flex; flex-direction: column; gap: 16px; font-size: 0.78rem;">
              
              <!-- IV Lines -->
              <div style="border: 1px solid var(--border-color); border-radius: 6px; padding: 12px;">
                <div style="display: flex; justify-content: space-between; border-bottom: 1px solid var(--border-color); padding-bottom: 4px; margin-bottom: 8px;">
                  <strong style="text-transform: uppercase; font-size: 0.72rem; color: var(--text-secondary);">IV Access Lines</strong>
                  ${activePatient.devices?.iv?.inSitu >= 3 ? `<span class="badge" style="background:#fee2e2;color:#ef4444;font-size:0.65rem;font-weight:bold;">LINE CHANGE DUE (>72H)</span>` : ''}
                </div>
                ${activePatient.devices?.iv ? `
                  <p>Line Type: <strong>${activePatient.devices.iv.type}</strong> (${activePatient.devices.iv.gauge})</p>
                  <p>Site Location: <strong>${activePatient.devices.iv.site}</strong></p>
                  <p>Inserted: <strong>${activePatient.devices.iv.inserted}</strong> · Days in situ: <strong class="admin-mono" style="color: ${activePatient.devices.iv.inSitu >= 3 ? 'var(--color-danger)' : 'inherit'};">${activePatient.devices.iv.inSitu} Days</strong></p>
                  <div style="display: flex; gap: 8px; margin-top: 8px; border-top: 1px dashed var(--border-color); padding-top: 8px;">
                    <button class="btn btn-secondary" onclick="alert('IV Dressing Changed and logged.')" style="padding: 4px 8px; font-size: 0.7rem;">Change Dressing</button>
                    <button class="btn btn-secondary" onclick="activePatient.devices.iv = null; alert('IV line removed successfully.'); window.closeNurseDrawer();" style="padding: 4px 8px; font-size: 0.7rem; color: var(--color-danger); border-color: var(--color-danger);">Remove Line</button>
                  </div>
                ` : '<div style="color: var(--text-muted); font-style: italic;">No active IV access lines.</div>'}
              </div>

              <!-- Catheters -->
              <div style="border: 1px solid var(--border-color); border-radius: 6px; padding: 12px;">
                <div style="border-bottom: 1px solid var(--border-color); padding-bottom: 4px; margin-bottom: 8px;">
                  <strong style="text-transform: uppercase; font-size: 0.72rem; color: var(--text-secondary);">Catheters & Drains</strong>
                </div>
                ${activePatient.devices?.catheter ? `
                  <p>Device Type: <strong>${activePatient.devices.catheter.type}</strong></p>
                  <p>Inserted: <strong>${activePatient.devices.catheter.inserted}</strong> · Days in situ: <strong>${activePatient.devices.catheter.inSitu} Days</strong></p>
                  <p>Last Care Checked: <strong>${activePatient.devices.catheter.lastCare}</strong></p>
                  <p>Last Recorded Output: <strong>${activePatient.devices.catheter.output} mL</strong></p>
                  <div style="display: flex; gap: 8px; margin-top: 8px; border-top: 1px dashed var(--border-color); padding-top: 8px;">
                    <button class="btn btn-secondary" onclick="const vol=prompt('Enter urinary output volume (mL):'); if(vol){ activePatient.devices.catheter.output=parseInt(vol); alert('Output logged.'); window.closeNurseDrawer(); }" style="padding: 4px 8px; font-size: 0.7rem;">Record Output</button>
                    <button class="btn btn-secondary" onclick="activePatient.devices.catheter = null; alert('Catheter removed.'); window.closeNurseDrawer();" style="padding: 4px 8px; font-size: 0.7rem; color: var(--color-danger); border-color: var(--color-danger);">Remove Catheter</button>
                  </div>
                ` : '<div style="color: var(--text-muted); font-style: italic;">No active catheters or drains.</div>'}
              </div>

              <!-- Wounds & Dressings -->
              <div style="border: 1px solid var(--border-color); border-radius: 6px; padding: 12px;">
                <div style="border-bottom: 1px solid var(--border-color); padding-bottom: 4px; margin-bottom: 8px;">
                  <strong style="text-transform: uppercase; font-size: 0.72rem; color: var(--text-secondary);">Wounds & Surgical Site Dressings</strong>
                </div>
                ${activePatient.devices?.wound ? `
                  <p>Surgical Site: <strong>${activePatient.devices.wound.site}</strong></p>
                  <p>Dressing Type: <strong>${activePatient.devices.wound.type}</strong></p>
                  <p>Last Dressed: <strong>${activePatient.devices.wound.lastDressing}</strong> · Next Due: <strong>${activePatient.devices.wound.nextDue}</strong></p>
                  <div style="display: flex; gap: 8px; margin-top: 8px; border-top: 1px dashed var(--border-color); padding-top: 8px;">
                    <button class="btn btn-secondary" onclick="alert('Groin dressing completed. Size: 2x2cm, Appearance: clean, Exudate: none.'); activePatient.devices.wound.lastDressing='Just now'; window.closeNurseDrawer();" style="padding: 4px 8px; font-size: 0.7rem;">Do Dressing</button>
                  </div>
                ` : '<div style="color: var(--text-muted); font-style: italic;">No active dressings or wounds listed.</div>'}
              </div>

            </div>
          ` : ''}

          <!-- TAB: I&O -->
          ${window.state.activeNurseTab === 'I&O' ? `
            <div style="display: flex; flex-direction: column; gap: 16px; font-size: 0.78rem;">
              
              <!-- running totals -->
              <div style="display: flex; gap: 12px;">
                <div style="flex: 1; border: 1px solid var(--border-color); border-radius: 6px; padding: 8px; background: #ecfdf5;">
                  <span style="font-size:0.68rem; color:#065f46; text-transform:uppercase; font-weight:700;">Shift Intake</span>
                  <div class="admin-mono" style="font-size:1.15rem; font-weight:bold; color:#047857; margin-top:2px;">
                    ${activePatient.io.intake.reduce((sum, item) => sum + item.vol, 0)} mL
                  </div>
                </div>
                <div style="flex: 1; border: 1px solid var(--border-color); border-radius: 6px; padding: 8px; background: #fff5f5;">
                  <span style="font-size:0.68rem; color:#991b1b; text-transform:uppercase; font-weight:700;">Shift Output</span>
                  <div class="admin-mono" style="font-size:1.15rem; font-weight:bold; color:#b91c1c; margin-top:2px;">
                    ${activePatient.io.output.reduce((sum, item) => sum + item.vol, 0)} mL
                  </div>
                </div>
                <div style="flex: 1; border: 1px solid var(--border-color); border-radius: 6px; padding: 8px; background: var(--bg-surface-elevated);">
                  <span style="font-size:0.68rem; color:var(--text-secondary); text-transform:uppercase; font-weight:700;">Net Balance</span>
                  <div class="admin-mono" style="font-size:1.15rem; font-weight:bold; color: var(--text-primary); margin-top:2px;">
                    ${activePatient.io.intake.reduce((sum, item) => sum + item.vol, 0) - activePatient.io.output.reduce((sum, item) => sum + item.vol, 0)} mL
                  </div>
                </div>
              </div>

              <!-- entry form -->
              <div style="background-color: var(--bg-surface-elevated); padding: 12px; border-radius: 6px; border: 1px dashed var(--border-color);">
                <strong style="font-size:0.75rem; text-transform:uppercase; color:var(--text-secondary); display:block; margin-bottom:8px;">Add Intake/Output Entry</strong>
                <div style="display: flex; gap: 8px; align-items: flex-end;">
                  <div style="flex: 1;">
                    <label style="font-size: 0.65rem;">Fluid Type</label>
                    <input type="text" id="io-type" placeholder="e.g. Water, Cranberry, Urine" class="form-control" style="height: 30px; font-size: 0.72rem;">
                  </div>
                  <div style="width: 100px;">
                    <label style="font-size: 0.65rem;">Vol (mL)</label>
                    <input type="number" id="io-vol" class="form-control" style="height: 30px; font-size: 0.72rem;" value="150">
                  </div>
                  <div style="width: 100px;">
                    <label style="font-size: 0.65rem;">Category</label>
                    <select id="io-cat" class="form-select" style="height: 30px; font-size: 0.72rem; padding: 0 4px;">
                      <option value="intake">Intake</option>
                      <option value="output">Output</option>
                    </select>
                  </div>
                  <button class="btn btn-primary" onclick="window.addNurseFluid('${activePatient.uhid}')" style="height: 30px; padding: 0 12px; font-size: 0.72rem; font-weight:bold;">Add</button>
                </div>
              </div>

              <!-- List log -->
              <div>
                <strong style="font-size: 0.75rem; text-transform: uppercase; color: var(--text-secondary); display:block; margin-bottom:6px;">Current Shift running ledger</strong>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                  <div>
                    <strong style="font-size: 0.7rem; color: var(--color-success);">Fluid Intakes:</strong>
                    <ul style="padding-left: 12px; margin-top: 4px; font-size:0.72rem;">
                      ${activePatient.io.intake.map(i => `<li>${i.time} - ${i.type}: <strong class="admin-mono">${i.vol} mL</strong></li>`).join('')}
                    </ul>
                  </div>
                  <div>
                    <strong style="font-size: 0.7rem; color: var(--color-danger);">Fluid Outputs:</strong>
                    <ul style="padding-left: 12px; margin-top: 4px; font-size:0.72rem;">
                      ${activePatient.io.output.map(o => `<li>${o.time} - ${o.type}: <strong class="admin-mono">${o.vol} mL</strong></li>`).join('')}
                    </ul>
                  </div>
                </div>
              </div>

            </div>
          ` : ''}

          <!-- TAB: Notes -->
          ${window.state.activeNurseTab === 'Notes' ? `
            <div style="display: flex; flex-direction: column; gap: 12px; font-size: 0.78rem;">
              <strong style="text-transform: uppercase; font-size: 0.75rem; color: var(--text-secondary);">Nursing Narrative / Progress Notes (SOAP)</strong>
              
              <textarea id="note-content" class="form-textarea" placeholder="Subjective, Objective, Assessment, Plan..." style="font-size:0.75rem; height: 90px; padding: 8px;"></textarea>
              <button class="btn btn-primary" onclick="window.addNurseNote('${activePatient.uhid}')" style="width: 100%; font-weight:700; height: 34px;">Add Note & Timestamp</button>

              <div style="margin-top: 10px; border-top: 1px solid var(--border-color); padding-top: 10px;">
                <strong style="font-size:0.75rem; text-transform:uppercase; color:var(--text-secondary); display:block; margin-bottom:6px;">Previous Shift entries</strong>
                <div style="display: flex; flex-direction: column; gap: 8px;">
                  ${activePatient.notes.map(note => `
                    <div style="background-color: var(--bg-surface-elevated); padding: 8px; border-radius: 4px; border: 1px solid var(--border-color);">
                      <div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 0.7rem; color: var(--text-secondary);">
                        <span>${note.user}</span>
                        <span class="admin-mono">${note.time}</span>
                      </div>
                      <p style="margin-top: 4px; font-size: 0.75rem; line-height: 1.4; color: var(--text-primary);">${note.content}</p>
                    </div>
                  `).join('')}
                </div>
              </div>
            </div>
          ` : ''}

          <!-- TAB: Documents -->
          ${window.state.activeNurseTab === 'Documents' ? `
            <div style="display: flex; flex-direction: column; gap: 12px; font-size:0.78rem;">
              <strong style="text-transform: uppercase; font-size: 0.75rem; color: var(--text-secondary);">Patient Handouts & Instructions</strong>
              <div style="background-color: var(--bg-surface-elevated); padding: 8px; border-radius: 6px; border: 1px solid var(--border-color);">
                <p><strong>Standard Admission Checklist</strong>: Mark given and bedside review completed.</p>
                <div style="display: flex; gap: 8px; margin-top: 8px;">
                  <button class="btn btn-secondary" onclick="alert('Checklist printed.')" style="padding: 4px 8px; font-size: 0.7rem;">Print handout</button>
                  <button class="btn btn-primary" onclick="alert('Admissions document flagged as given.')" style="padding: 4px 8px; font-size: 0.7rem;">Mark as Given</button>
                </div>
              </div>
            </div>
          ` : ''}

        </div>
      ` : ''}
    </div>

    <!-- SECTION 6: SHIFT HANDOVER PANEL (Modal overlay) -->
    <div class="handover-overlay" id="handover-modal-overlay">
      <div class="handover-modal">
        <div style="background: linear-gradient(135deg, #1e3a8a, #3b82f6); padding: 14px 20px; color: #ffffff; display: flex; justify-content: space-between; align-items: center; border-radius: 8px 8px 0 0;">
          <h2 style="margin: 0; font-size: 1.1rem; font-weight: 800;">📋 Shift Handover & End-of-Shift Sign-Off</h2>
          <button onclick="window.toggleHandoverPanel(false)" style="background: none; border: none; color: white; font-size: 1.3rem; cursor: pointer; font-weight: bold;">✕</button>
        </div>
        
        <div style="padding: 20px; flex: 1; overflow-y: auto;">
          <p style="font-size: 0.78rem; color: var(--text-muted); margin-bottom: 12px;">Ensure a concise summary is logged for all assigned patients before shift locks.</p>
          
          <div style="display: flex; flex-direction: column; gap: 12px;">
            ${window.state.nurseActivePatients.map(p => {
              const overdueMedsCount = window.state.nurseMeds.filter(m => m.patientUhid === p.uhid && m.status === 'Pending').length;
              return `
                <div style="border: 1px solid var(--border-color); border-radius: 6px; padding: 12px;">
                  <div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 0.8rem; border-bottom: 1px solid var(--border-color); padding-bottom: 4px; margin-bottom: 8px;">
                    <span>Bed: ${p.bed.split('-')[1] || p.bed} · Patient: ${p.name} (${p.uhid})</span>
                    <span class="admin-mono" style="padding: 1px 6px; border-radius: 4px; font-weight: bold; ${getNewsColor(p.news2)}">NEWS2: ${p.news2}</span>
                  </div>
                  
                  <div style="font-size: 0.72rem; color: var(--text-secondary); display: grid; grid-template-columns: 2fr 1fr 1.5fr; gap: 12px;">
                    <div>Diagnosis: <strong>${p.diagnosis}</strong></div>
                    <div>Meds Pending: <strong style="color: ${overdueMedsCount > 0 ? 'var(--color-danger)' : 'inherit'};">${overdueMedsCount} drugs</strong></div>
                    <div>Devices: <strong>${p.devices?.iv ? p.devices.iv.type : 'No IV'} | ${p.devices?.catheter ? 'Foley Catheter' : 'No Catheter'}</strong></div>
                  </div>

                  <div style="margin-top: 8px; display: flex; gap: 8px; align-items: flex-end;">
                    <div style="flex: 1;">
                      <label style="font-size: 0.65rem; font-weight: 700; color: var(--text-secondary);">End-of-Shift Handover Narrative Notes:</label>
                      <textarea id="handover-note-${p.uhid}" placeholder="Vitals trends, key complaints, medications given, pending plans..." style="width: 100%; height: 50px; font-size: 0.72rem; padding: 4px; border: 1px solid var(--border-color); border-radius: 4px;"></textarea>
                    </div>
                    <label style="font-size: 0.7rem; font-weight: bold; display: flex; align-items: center; gap: 4px; background-color: var(--bg-surface-elevated); padding: 6px; border-radius: 4px; cursor: pointer; border: 1px solid var(--border-color); margin-bottom: 2px;">
                      <input type="checkbox" id="handover-check-${p.uhid}">
                      Done
                    </label>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
        
        <div style="padding: 12px 20px; border-top: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center; background-color: var(--bg-base); border-radius: 0 0 8px 8px;">
          <button class="btn btn-secondary" onclick="window.print()" style="font-size: 0.78rem;">Print Handover Sheets</button>
          <div style="display: flex; gap: 8px;">
            <button class="btn btn-secondary" onclick="window.toggleHandoverPanel(false)" style="font-size: 0.78rem;">Cancel</button>
            <button class="btn btn-primary" onclick="window.submitHandover()" style="font-size: 0.78rem; font-weight: 800; background-color: var(--color-success); border-color: var(--color-success);">Submit & Sign-Off Shift</button>
          </div>
        </div>
      </div>
    </div>
  `;
}

// ==========================================================================
// 5. BILLING EXECUTIVE DASHBOARD
// ==========================================================================
function renderBillingDashboard(container) {
  let settledRev = 0;
  state.billing.forEach(b => settledRev += b.paid);
  
  let outstandingBal = 0;
  state.billing.forEach(b => outstandingBal += (b.amount - b.paid));

  // Compute pending billing discharges dynamically
  const billingPendingDis = (window.state.patients || []).filter(p => p.dischargeStatus === 'In Progress — Clearances Pending' && p.dischargeClearances && p.dischargeClearances.billing && !p.dischargeClearances.billing.cleared);
  const billingPendingCount = billingPendingDis.length;
  const outstandingStr = billingPendingCount > 0 ? `₹${(billingPendingCount * 1500).toLocaleString('en-IN')}` : '₹0';

  container.innerHTML = `
    <!-- KPI Cards -->
    <!-- ── Revenue Strip + Quick Actions ── -->
    ${window.renderRevenueStrip ? window.renderRevenueStrip() : ''}
    ${window.renderQuickActions ? window.renderQuickActions([
      ['💳','New Bill','billing','#7C3AED'],
      ['💰','Collect Payment','billing','#065F46'],
      ['📄','Print Receipt','billing','#1B3A5C'],
      ['🔖','Apply Package','chargeMaster','#B45309'],
      ['📋','Insurance Claim','insurance','#0369A1'],
      ['🔴','Pending Discharge','ipdAdmission','#991B1B']
    ]) : ''}
    <div style="background:#FEF9EC;border:1px solid #FDE68A;border-radius:12px;padding:12px 16px;margin-bottom:16px;display:flex;justify-content:space-between;align-items:center;">
      <div style="font-size:12px;font-weight:700;color:#92400E;">⚠️ ${billingPendingCount} patients awaiting discharge financial clearance &nbsp;·&nbsp; ${outstandingStr} outstanding receivables</div>
      <button onclick="window.router.navigate('ipdAdmission?tab=discharges')" style="background:#D97706;color:#fff;border:none;padding:5px 12px;border-radius:8px;font-size:11px;font-weight:700;cursor:pointer;">Review →</button>
    </div>
    <div class="stats-grid" style="margin-bottom: 1.5rem;">
      ${window.renderKPICard({
        id: 'revenue_analytics',
        title: 'Revenue Today',
        value: `₹${settledRev.toLocaleString('en-IN')}`,
        subtext: 'Settled counters cash/UPI',
        status: 'normal',
        trendText: '+15% vs yesterday',
        trendDirection: 'up',
        icon: '🪙',
        iconBg: 'var(--color-success-bg)',
        iconColor: 'var(--color-success)',
        recordsCount: state.billing.length
      })}
      ${window.renderKPICard({
        id: 'payments_outstanding',
        title: 'Outstanding Payments',
        value: `₹${outstandingBal.toLocaleString('en-IN')}`,
        subtext: 'Unbilled and balance debts',
        status: 'critical',
        trendText: 'Action required',
        trendDirection: 'neutral',
        icon: '⚠️',
        iconBg: 'var(--color-danger-bg)',
        iconColor: 'var(--color-danger)',
        recordsCount: state.billing.filter(b => b.amount > b.paid).length
      })}
      ${window.renderKPICard({
        id: 'claims_pending',
        title: 'Insurance Claims Pending',
        value: `${state.claims.filter(c => c.status === 'Pending').length} Claims`,
        subtext: 'Awaiting TPA approval codes',
        status: 'warning',
        trendText: 'Follow-up needed',
        trendDirection: 'neutral',
        icon: '🛡️',
        iconBg: 'var(--color-warning-bg)',
        iconColor: 'var(--color-warning)',
        recordsCount: state.claims.filter(c => c.status === 'Pending').length
      })}
      ${window.renderKPICard({
        id: 'claims_pending',
        title: 'Claims Approved',
        value: `${state.claims.filter(c => c.status === 'Approved').length} Approved`,
        subtext: 'Part coverage credited',
        status: 'normal',
        trendText: 'Credited to account',
        trendDirection: 'up',
        icon: '✅',
        iconBg: 'var(--color-success-bg)',
        iconColor: 'var(--color-success)',
        recordsCount: state.claims.filter(c => c.status === 'Approved').length
      })}
      ${window.renderKPICard({
        id: 'claims_pending',
        title: 'Claims Rejected',
        value: '1 Claim',
        subtext: 'Required documentation queries',
        status: 'critical',
        trendText: 'Needs attention',
        trendDirection: 'neutral',
        icon: '❌',
        iconBg: 'var(--color-danger-bg)',
        iconColor: 'var(--color-danger)',
        recordsCount: 1
      })}
      ${window.renderKPICard({
        id: 'revenue_analytics',
        title: 'Collection Rate',
        value: '91.4%',
        subtext: 'Sponsor credit ratio',
        status: 'normal',
        trendText: '+1.2% this quarter',
        trendDirection: 'up',
        icon: '📈',
        iconBg: 'var(--color-info-bg)',
        iconColor: 'var(--color-info)',
        recordsCount: state.billing.length
      })}
    </div>

    <!-- Quick Actions -->
    <div style="background-color: var(--bg-surface); padding: 0.75rem 1rem; border-radius: var(--radius-md); border: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center; gap: 0.75rem; flex-wrap: wrap; margin-bottom: 1.5rem;">
      <div style="display: flex; gap: 0.75rem; flex-wrap: wrap; align-items: center;">
        <button class="btn btn-primary" onclick="router.navigate('billing')">Create Invoice</button>
        <button class="btn btn-primary" onclick="router.navigate('billing')">Process Payment</button>
        <button class="btn btn-secondary" onclick="alert('Generating estimate calculation sheet...')">Generate Estimate</button>
        <button class="btn btn-secondary" onclick="router.navigate('insurance')">Insurance Approval</button>
        <button class="btn btn-secondary" onclick="router.navigate('billing')">Print Receipt</button>
      </div>
      ${window.renderDashboardSearchInline()}
    </div>

    <!-- Billing Roster -->
    <div class="card">
      <div class="card-header"><h3 class="card-title">Daily Financial Accounts Worklist</h3></div>
      <div class="card-body">
        <table class="custom-table" style="font-size: 0.85rem;">
          <thead>
            <tr>
              <th>Patient Details</th>
              <th>UHID</th>
              <th>Invoice Value</th>
              <th>Paid Amount</th>
              <th>Balance Due</th>
              <th>Insurance Covered</th>
              <th>Billing Status</th>
              <th style="text-align: right;">Post Payment</th>
            </tr>
          </thead>
          <tbody>
            ${state.billing.slice(0, 4).map(b => {
              const balance = b.amount - b.paid;
              const hasInsurance = state.claims.find(c => c.uhid === b.uhid);
              return `
                <tr>
                  <td><a href="#patients?uhid=${b.uhid}" class="patient-link">${b.patientName}</a></td>
                  <td><code>${b.uhid}</code></td>
                  <td>₹${b.amount.toLocaleString('en-IN')}</td>
                  <td>₹${b.paid.toLocaleString('en-IN')}</td>
                  <td><strong style="color:${balance > 0 ? 'var(--color-danger)' : 'var(--color-success)'};">₹${balance.toLocaleString('en-IN')}</strong></td>
                  <td>${hasInsurance ? `₹${hasInsurance.approvedAmt.toLocaleString('en-IN')}` : '₹0'}</td>
                  <td>
                    <span class="badge ${b.status === 'Settled' ? 'bg-success' : 'bg-warning'}" style="color:#fff; padding:0.1rem 0.3rem; border-radius:3px;">
                      ${b.status}
                    </span>
                  </td>
                  <td style="text-align: right;">
                    <button class="btn btn-secondary" style="padding: 0.2rem 0.5rem; font-size: 0.75rem;" onclick="router.navigate('billing')">Collect</button>
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

// ==========================================================================
// 6. LABORATORY DASHBOARD
// ==========================================================================
function renderLabDashboard(container) {
  if (window.views && window.views.labDashboard) {
    window.views.labDashboard(container);
  } else {
    container.innerHTML = `<div style="padding: 2rem;">Loading Lab Command Center...</div>`;
  }
}

// ==========================================================================
// 7. PHARMACY DASHBOARD
// ==========================================================================
function renderPharmacyDashboard(container) {
  if (window.views && window.views.pharmacyDashboard) {
    window.views.pharmacyDashboard(container);
  } else {
    container.innerHTML = `<div style="padding: 2rem;">Loading Pharmacy Command Center...</div>`;
  }
}

// ==========================================================================
// 8. KPI WORKSPACE RENDERING
// ==========================================================================
function renderKPIWorkspace(container, kpiKey, persona) {
  let title = '';
  let filterLabel = '';
  let tableHeaderHTML = '';
  let listData = [];
  
  if (kpiKey === 'admissions_today') {
    title = "Today's Admissions";
    filterLabel = "Admitted Date = 2026-06-16/17";
    listData = state.admissions;
    tableHeaderHTML = `
      <tr>
        <th>UHID</th>
        <th>Patient Name</th>
        <th>Age/Gender</th>
        <th>Attending Doctor</th>
        <th>Assigned Bed</th>
        <th>Diagnosis</th>
        <th>Admission Date</th>
        <th style="text-align: right;">Actions</th>
      </tr>
    `;
    
    window.renderWorkspaceRows = function(data) {
      return data.map(adm => {
        const patient = state.patients.find(p => p.uhid === adm.uhid);
        return `
          <tr>
            <td><code>${adm.uhid}</code></td>
            <td><a href="#patients?uhid=${adm.uhid}" class="patient-link" style="font-weight: 600;">${adm.patientName}</a></td>
            <td>${patient ? `${patient.age}Y/${patient.gender.charAt(0)}` : 'N/A'}</td>
            <td>${adm.doctorName}</td>
            <td><span class="badge badge-success">${adm.bed}</span></td>
            <td>${adm.diagnosis}</td>
            <td>${adm.date}</td>
            <td style="text-align: right;">
              <button class="btn btn-secondary btn-sm" onclick="router.navigate('patients?uhid=${adm.uhid}')">Open Profile</button>
              ${window.state?.activeUserRole === 'Doctor' ? `<button class="btn btn-primary btn-sm" onclick="router.navigate('emr?uhid=${adm.uhid}')">OPD Consult</button>` : ''}
              <button class="btn btn-secondary btn-sm" onclick="router.navigate('billing?uhid=${adm.uhid}')">Billing</button>
            </td>
          </tr>
        `;
      }).join('');
    };
  } else if (kpiKey === 'admissions_pending') {
    title = "Pending Admissions Queue";
    filterLabel = "Status = Pending IPD Onboarding";
    listData = state.patients.filter(p => p.status === 'Checked In');
    tableHeaderHTML = `
      <tr>
        <th>UHID</th>
        <th>Patient Name</th>
        <th>Age/Gender</th>
        <th>Mobile</th>
        <th>Assigned Doctor</th>
        <th>Missing Compliance Checklist</th>
        <th style="text-align: right;">Actions</th>
      </tr>
    `;
    window.renderWorkspaceRows = function(data) {
      return data.map((p, idx) => {
        const compliances = [
          `<span style="color:var(--color-danger); font-weight:600;">⚠️ Unsigned Consent Forms</span>`,
          `<span style="color:var(--color-warning); font-weight:600;">⏳ Insurance Pre-Auth Pending</span>`,
          `<span style="color:var(--color-danger); font-weight:600;">⚠️ Bed Assignment Missing</span>`
        ];
        const compliance = compliances[idx % compliances.length];
        return `
          <tr>
            <td><code>${p.uhid}</code></td>
            <td><a href="#patients?uhid=${p.uhid}" class="patient-link" style="font-weight: 600;">${p.name}</a></td>
            <td>${p.age}Y/${p.gender.charAt(0)}</td>
            <td>${p.mobile}</td>
            <td>${p.primaryConsultant}</td>
            <td>${compliance}</td>
            <td style="text-align: right;">
              <button class="btn btn-primary btn-sm" onclick="router.navigate('ipdAdmission?uhid=${p.uhid}')">Complete Onboarding</button>
              <button class="btn btn-secondary btn-sm" onclick="router.navigate('insurance')">Verify Insurance</button>
            </td>
          </tr>
        `;
      }).join('');
    };
  } else if (kpiKey === 'beds_available') {
    title = "Bed Board Management";
    filterLabel = "Bed Board Status = Available";
    listData = Object.entries(state.bedsStatus).filter(([id, b]) => b.status === 'Available' || b.status === 'Vacant');
    tableHeaderHTML = `
      <tr>
        <th>Bed Code</th>
        <th>Ward Category</th>
        <th>Daily Tariff</th>
        <th>Status</th>
        <th style="text-align: right;">Quick Actions</th>
      </tr>
    `;
    window.renderWorkspaceRows = function(data) {
      return data.map(([bedId, info]) => {
        const price = state.wards[info.wardKey] ? state.wards[info.wardKey].price : 2000;
        const wardName = state.wards[info.wardKey] ? state.wards[info.wardKey].name : info.wardKey;
        return `
          <tr>
            <td><strong>${bedId}</strong></td>
            <td>${wardName}</td>
            <td>₹${price.toLocaleString('en-IN')}/day</td>
            <td><span class="badge bg-success" style="color:#fff; padding:0.15rem 0.35rem; border-radius:4px;">VACANT</span></td>
            <td style="text-align: right;">
              <button class="btn btn-primary btn-sm" onclick="router.navigate('ipdAdmission')">Allocate Bed</button>
              <button class="btn btn-secondary btn-sm" onclick="alert('Bed ${bedId} reserved for upcoming surgery schedule.')">Reserve</button>
              <button class="btn btn-secondary btn-sm" onclick="state.bedsStatus['${bedId}'].status = 'Maintenance'; alert('Bed ${bedId} marked under Maintenance.'); router.navigate('dashboard?kpi=beds_available');">Maintenance</button>
            </td>
          </tr>
        `;
      }).join('');
    };
  } else if (kpiKey === 'discharges_today') {
    title = "Inpatient Discharge Workbench";
    filterLabel = "Discharge Process = Active";
    listData = state.admissions.slice(0, 4); // Simulate active discharge queue
    tableHeaderHTML = `
      <tr>
        <th>UHID</th>
        <th>Patient Name</th>
        <th>Assigned Ward/Bed</th>
        <th>Financial Clearance</th>
        <th>Discharge Summary</th>
        <th>Medications Dispensed</th>
        <th style="text-align: right;">Actions</th>
      </tr>
    `;
    window.renderWorkspaceRows = function(data) {
      return data.map((adm, idx) => {
        const patient = state.patients.find(p => p.uhid === adm.uhid);
        const bill = state.billing.find(b => b.uhid === adm.uhid);
        const outstanding = bill ? (bill.amount - bill.paid) : 0;
        
        const isFinClear = outstanding <= 0;
        const isSummaryDone = idx % 2 === 0;
        const isMedsDisp = idx % 3 !== 0;

        return `
          <tr>
            <td><code>${adm.uhid}</code></td>
            <td><a href="#patients?uhid=${adm.uhid}" class="patient-link" style="font-weight: 600;">${adm.patientName}</a></td>
            <td>${adm.ward.replace('-WARD', '')} / ${adm.bed}</td>
            <td>
              <span class="badge ${isFinClear ? 'bg-success' : 'bg-warning'}" style="color:#fff; padding:0.15rem 0.35rem; border-radius:4px;">
                ${isFinClear ? '✅ Clear' : '⚠️ Due: ₹' + outstanding.toLocaleString('en-IN')}
              </span>
            </td>
            <td>
              <span class="badge ${isSummaryDone ? 'bg-success' : 'bg-secondary'}" style="color:#fff; padding:0.15rem 0.35rem; border-radius:4px;">
                ${isSummaryDone ? '✅ Completed' : '⏳ Pending Approval'}
              </span>
            </td>
            <td>
              <span class="badge ${isMedsDisp ? 'bg-success' : 'bg-secondary'}" style="color:#fff; padding:0.15rem 0.35rem; border-radius:4px;">
                ${isMedsDisp ? '✅ Dispensed' : '⏳ Awaiting Pharmacy'}
              </span>
            </td>
            <td style="text-align: right;">
              <button class="btn btn-primary btn-sm" onclick="router.navigate('patients-summary?uhid=${adm.uhid}')">Approve Gate Pass</button>
              <button class="btn btn-secondary btn-sm" onclick="router.navigate('billing?uhid=${adm.uhid}')">Settle Billing</button>
            </td>
          </tr>
        `;
      }).join('');
    };
  } else if (kpiKey === 'patients_today') {
    title = "OPD Consultations Schedule";
    filterLabel = "OPD Doctor Schedule = Active";
    listData = state.appointments;
    tableHeaderHTML = `
      <tr>
        <th>Appt ID</th>
        <th>Slot Time</th>
        <th>Patient Details</th>
        <th>Visit Type</th>
        <th>Status</th>
        <th style="text-align: right;">Actions</th>
      </tr>
    `;
    window.renderWorkspaceRows = function(data) {
      return data.map(appt => `
        <tr>
          <td><code>${appt.id}</code></td>
          <td><strong>${appt.time}</strong></td>
          <td><a href="#patients?uhid=${appt.uhid}" class="patient-link" style="font-weight: 600;">${appt.patientName}</a><br><small style="color:var(--text-muted);">${appt.uhid}</small></td>
          <td><span class="badge bg-purple" style="color:#fff; padding:0.15rem 0.35rem; border-radius:4px;">${appt.type}</span></td>
          <td><span class="badge bg-success" style="color:#fff; padding:0.15rem 0.35rem; border-radius:4px;">${appt.status}</span></td>
          <td style="text-align: right;">
            ${window.state?.activeUserRole === 'Doctor' ? `<button class="btn btn-primary btn-sm" onclick="router.navigate('emr?uhid=${appt.uhid}')">Log Consultation EMR</button>` : ''}
            <button class="btn btn-secondary btn-sm" onclick="router.navigate('billing?uhid=${appt.uhid}')">Process Payment</button>
          </td>
        </tr>
      `).join('');
    };
  } else if (kpiKey === 'patients_critical') {
    title = "Critical Patients Command Center";
    filterLabel = "NEWS2 Score >= 5 (Physiological Alert)";
    listData = state.patients.filter(p => (p.status === 'Admitted' || p.status === 'Day Care') && p.vitals && (p.vitals.hr > 95 || p.vitals.spo2 < 93));
    tableHeaderHTML = `
      <tr>
        <th>UHID</th>
        <th>Patient Name</th>
        <th>Ward/Bed</th>
        <th>NEWS2 Score</th>
        <th>Vitals Alert</th>
        <th>Clinician On-Call</th>
        <th style="text-align: right;">Actions</th>
      </tr>
    `;
    window.renderWorkspaceRows = function(data) {
      return data.map((p, idx) => {
        const admission = state.admissions.find(a => a.uhid === p.uhid && a.status === 'Active');
        const score = idx === 0 ? 7 : 5;
        return `
          <tr>
            <td><code>${p.uhid}</code></td>
            <td><a href="#patients?uhid=${p.uhid}" class="patient-link" style="font-weight: 600; color: var(--color-danger);">${p.name}</a></td>
            <td>${admission ? `${admission.ward.replace('-WARD', '')} / ${admission.bed}` : 'ER-01'}</td>
            <td><span class="badge bg-danger" style="color:#fff; font-weight:bold; padding:0.2rem 0.4rem; border-radius:4px; font-size:0.8rem;">🚨 Score: ${score}</span></td>
            <td><code style="color: var(--color-danger);">HR: ${p.vitals?.hr || '--'} bpm | SpO2: ${p.vitals?.spo2 || '--'}% | Temp: ${p.vitals?.temp || '--'} F</code></td>
            <td>Dr. Amit Verma</td>
            <td style="text-align: right;">
              <button class="btn btn-danger btn-sm" onclick="alert('Critical Alert broadcasted to Rapid Response Team (RRT) for ${p.name}.')">Escalate Care</button>
              <button class="btn btn-primary btn-sm" onclick="router.navigate('atd')">Transfer to ICU</button>
              ${window.state?.activeUserRole === 'Doctor' ? `<button class="btn btn-secondary btn-sm" onclick="router.navigate('emr?uhid=${p.uhid}')">EMR</button>` : ''}
            </td>
          </tr>
        `;
      }).join('');
    };
  } else if (kpiKey === 'lab_reviews_pending') {
    title = "LIS Diagnostics Verification Workspace";
    filterLabel = "Lab Report = Awaiting Doctor Review";
    listData = state.orders.filter(o => o.type === 'Laboratory' && o.status !== 'Approved');
    tableHeaderHTML = `
      <tr>
        <th>Order ID</th>
        <th>Patient Name</th>
        <th>Lab Investigation</th>
        <th>Ordered Date</th>
        <th>Technician Status</th>
        <th style="text-align: right;">Clinician Sign-off</th>
      </tr>
    `;
    window.renderWorkspaceRows = function(data) {
      return data.map(o => `
        <tr>
          <td><code>SPEC-${o.id}</code></td>
          <td><a href="#patients?uhid=${o.uhid}" class="patient-link" style="font-weight: 600;">${o.patientName}</a><br><small style="color:var(--text-muted);">${o.uhid}</small></td>
          <td>${o.name}</td>
          <td>${o.date}</td>
          <td><strong style="color: var(--color-warning);">${o.status}</strong></td>
          <td style="text-align: right;">
            <button class="btn btn-success btn-sm" onclick="state.orders.find(ord => ord.id === '${o.id}').status = 'Approved'; alert('Laboratory Report verified & released to EMR patient chart.'); router.navigate('dashboard?kpi=lab_reviews_pending');">Approve & Release</button>
            <button class="btn btn-secondary btn-sm" onclick="const com = prompt('Enter clinician review query:'); if(com) { alert('Query sent to Lab technician: ' + com); }">Query</button>
          </td>
        </tr>
      `).join('');
    };
  } else if (kpiKey === 'medication_due') {
    title = "Medication Administration Record (MAR)";
    filterLabel = "Scheduled Dose Slots = Due Now";
    listData = [
      { name: "Ramesh Chandra", uhid: "UHID20000001", bed: "GW-01", drug: "Dolo 650mg (Paracetamol)", dose: "1 tab", route: "Oral", time: "02:00 PM" },
      { name: "Priya Sharma", uhid: "UHID20000003", bed: "SP-02", drug: "Pan-D (Pantoprazole)", dose: "1 cap", route: "Oral", time: "02:00 PM" },
      { name: "Amit Patel", uhid: "UHID20000004", bed: "GW-05", drug: "Ceftriaxone IV", dose: "1 gm", route: "Intravenous (IV)", time: "02:30 PM" },
      { name: "Sunita Chandra", uhid: "UHID20000002", bed: "PV-03", drug: "Calpol Syrup", dose: "10 ml", route: "Oral", time: "03:00 PM" }
    ];
    tableHeaderHTML = `
      <tr>
        <th>Bed</th>
        <th>Patient Name</th>
        <th>Drug Description</th>
        <th>Dosage & Route</th>
        <th>Scheduled Slot</th>
        <th style="text-align: right;">Administration Actions</th>
      </tr>
    `;
    window.renderWorkspaceRows = function(data) {
      return data.map(m => `
        <tr>
          <td><strong style="color:var(--primary);">${m.bed}</strong></td>
          <td><a href="#patients?uhid=${m.uhid}" class="patient-link" style="font-weight: 600;">${m.name}</a><br><small style="color:var(--text-muted);">${m.uhid}</small></td>
          <td><strong>${m.drug}</strong></td>
          <td><code>${m.dose} via ${m.route}</code></td>
          <td><strong>${m.time}</strong></td>
          <td style="text-align: right;">
            <button class="btn btn-success btn-sm" onclick="alert('Dose of ${m.drug} successfully logged as administered in Patient ${m.name}\\'s MAR.');">Administer</button>
            <button class="btn btn-secondary btn-sm" onclick="alert('Dose marked as skipped in clinical MAR.');">Skip</button>
            <button class="btn btn-danger btn-sm" onclick="alert('Clinical alert escalated to attending doctor.');">Escalate</button>
          </td>
        </tr>
      `).join('');
    };
  } else if (kpiKey === 'critical_alerts') {
    title = "Patient Safety & Alert Center";
    filterLabel = "Severity = High Risk / Sepsis Alert";
    listData = state.alerts;
    tableHeaderHTML = `
      <tr>
        <th>Alert ID</th>
        <th>Severity</th>
        <th>Patient Details</th>
        <th>Alert Details</th>
        <th>Timestamp</th>
        <th>Status</th>
        <th style="text-align: right;">Resolution Actions</th>
      </tr>
    `;
    window.renderWorkspaceRows = function(data) {
      return data.map(a => `
        <tr>
          <td><code>${a.id}</code></td>
          <td><span class="badge ${a.severity.includes('Critical') ? 'bg-danger' : 'bg-warning'}" style="color:#fff; padding:0.15rem 0.35rem; border-radius:4px;">${a.severity}</span></td>
          <td><a href="#patients?uhid=${a.uhid}" class="patient-link" style="font-weight: 600;">${a.patientName}</a><br><small style="color:var(--text-muted);">${a.uhid}</small></td>
          <td><code>${a.details}</code></td>
          <td>${a.time}</td>
          <td><strong style="color:var(--color-danger);">${a.status}</strong></td>
          <td style="text-align: right; display:flex; gap:0.25rem; justify-content:flex-end;">
            <button class="btn btn-primary btn-sm" onclick="alert('Alert ${a.id} acknowledged and logged in Quality center.');">Acknowledge</button>
            <button class="btn btn-secondary btn-sm" onclick="state.alerts.find(al => al.id === '${a.id}').status = 'Resolved'; alert('Alert ${a.id} marked as resolved.'); router.navigate('dashboard?kpi=critical_alerts');">Resolve</button>
          </td>
        </tr>
      `).join('');
    };
  } else if (kpiKey === 'payments_outstanding') {
    title = "Accounts Receivable & Outstanding Debts";
    filterLabel = "Invoice Status = Outstanding";
    listData = state.billing.filter(b => b.status === 'Outstanding');
    tableHeaderHTML = `
      <tr>
        <th>Invoice ID</th>
        <th>Patient Name</th>
        <th>UHID</th>
        <th>Invoice Amount</th>
        <th>Paid Amount</th>
        <th>Outstanding Balance</th>
        <th style="text-align: right;">Quick Actions</th>
      </tr>
    `;
    window.renderWorkspaceRows = function(data) {
      return data.map(b => {
        const balance = b.amount - b.paid;
        return `
          <tr>
            <td><code>${b.id}</code></td>
            <td><a href="#patients?uhid=${b.uhid}" class="patient-link" style="font-weight: 600;">${b.patientName}</a></td>
            <td><code>${b.uhid}</code></td>
            <td>₹${b.amount.toLocaleString('en-IN')}</td>
            <td>₹${b.paid.toLocaleString('en-IN')}</td>
            <td><strong style="color: var(--color-danger);">₹${balance.toLocaleString('en-IN')}</strong></td>
            <td style="text-align: right;">
              <button class="btn btn-primary btn-sm" onclick="router.navigate('billing?uhid=${b.uhid}')">Collect Payments</button>
              <button class="btn btn-secondary btn-sm" onclick="router.navigate('insurance')">Verify Sponsor Claims</button>
            </td>
          </tr>
        `;
      }).join('');
    };
  } else if (kpiKey === 'claims_pending') {
    title = "Corporate & TPA Claims Pre-Auth Worklist";
    filterLabel = "Pre-Auth Claims Status = Awaiting TPA Review";
    listData = state.claims.filter(c => c.status === 'Pending' || c.status === 'Query Raised');
    tableHeaderHTML = `
      <tr>
        <th>Claim ID</th>
        <th>Patient Name</th>
        <th>TPA / Insurer Sponsor</th>
        <th>Estimated Cost</th>
        <th>Status</th>
        <th style="text-align: right;">Actions</th>
      </tr>
    `;
    window.renderWorkspaceRows = function(data) {
      return data.map(c => `
        <tr>
          <td><code>${c.id}</code></td>
          <td><a href="#patients?uhid=${c.uhid}" class="patient-link" style="font-weight: 600;">${c.patientName}</a><br><small style="color:var(--text-muted);">${c.uhid}</small></td>
          <td>${c.insurer}</td>
          <td>₹${c.estimatedAmt.toLocaleString('en-IN')}</td>
          <td><span class="badge bg-warning" style="color:#fff; padding:0.15rem 0.35rem; border-radius:4px;">${c.status}</span></td>
          <td style="text-align: right;">
            <button class="btn btn-success btn-sm" onclick="window.approvePreAuth('${c.id}', ${c.estimatedAmt}); router.navigate('dashboard?kpi=claims_pending');">Approve Code</button>
            <button class="btn btn-secondary btn-sm" onclick="window.raiseClaimQuery('${c.id}'); router.navigate('dashboard?kpi=claims_pending');">Query</button>
          </td>
        </tr>
      `).join('');
    };
  } else if (kpiKey === 'tests_ordered_today') {
    title = "Laboratory LIS Specimen Directory";
    filterLabel = "Lab test orders date = Today";
    listData = state.orders.filter(o => o.type === 'Laboratory');
    tableHeaderHTML = `
      <tr>
        <th>Specimen ID</th>
        <th>Patient Name</th>
        <th>Lab Test Ordered</th>
        <th>Ordered Date</th>
        <th>LIS Status</th>
        <th style="text-align: right;">Specimen Processing</th>
      </tr>
    `;
    window.renderWorkspaceRows = function(data) {
      return data.map(o => `
        <tr>
          <td><code>SPEC-${o.id}</code></td>
          <td><a href="#patients?uhid=${o.uhid}" class="patient-link" style="font-weight: 600;">${o.patientName}</a><br><small style="color:var(--text-muted);">${o.uhid}</small></td>
          <td>${o.name}</td>
          <td>${o.date}</td>
          <td><strong style="color:var(--color-warning);">${o.status}</strong></td>
          <td style="text-align: right; display:flex; gap:0.25rem; justify-content:flex-end;">
            <button class="btn btn-primary btn-sm" onclick="state.orders.find(ord => ord.id === '${o.id}').status = 'Sample Collected'; alert('Sample collected for ${o.patientName}.'); router.navigate('dashboard?kpi=tests_ordered_today');">Collect Sample</button>
            <button class="btn btn-secondary btn-sm" onclick="state.orders.find(ord => ord.id === '${o.id}').status = 'In Progress'; alert('Analyzer run started.'); router.navigate('dashboard?kpi=tests_ordered_today');">Process Run</button>
            <button class="btn btn-secondary btn-sm" onclick="state.orders.find(ord => ord.id === '${o.id}').status = 'Result Entered'; alert('Results entered in LIS.'); router.navigate('dashboard?kpi=tests_ordered_today');">Enter Result</button>
          </td>
        </tr>
      `).join('');
    };
  } else if (kpiKey === 'lab_results_critical') {
    title = "LIS Critical Laboratory Alerts";
    filterLabel = "Result Value = Out of Reference Range (Critical)";
    listData = [
      { name: "Ramesh Chandra", uhid: "UHID20000001", test: "Serum Potassium", val: "6.2 mEq/L", ref: "3.5 - 5.1 mEq/L", status: "Awaiting Action" },
      { name: "Priya Sharma", uhid: "UHID20000003", test: "Hemoglobin", val: "6.5 g/dL", ref: "12.0 - 15.5 g/dL", status: "Awaiting Action" }
    ];
    tableHeaderHTML = `
      <tr>
        <th>UHID</th>
        <th>Patient Name</th>
        <th>Test Name</th>
        <th>Abnormal Result</th>
        <th>Expected Range</th>
        <th>Action Status</th>
        <th style="text-align: right;">Critical Notifications</th>
      </tr>
    `;
    window.renderWorkspaceRows = function(data) {
      return data.map(l => `
        <tr>
          <td><code>${l.uhid}</code></td>
          <td><a href="#patients?uhid=${l.uhid}" class="patient-link" style="font-weight: 600; color:var(--color-danger);">${l.name}</a></td>
          <td><strong>${l.test}</strong></td>
          <td><strong style="color:var(--color-danger);">${l.val}</strong></td>
          <td><code>${l.ref}</code></td>
          <td><span class="badge bg-danger" style="color:#fff; padding:0.15rem 0.35rem; border-radius:4px;">${l.status}</span></td>
          <td style="text-align: right;">
            <button class="btn btn-danger btn-sm" onclick="alert('SMS page sent to attending doctor for Patient ${l.name}. Action logged.');">Notify Attending Doctor</button>
            <button class="btn btn-secondary btn-sm" onclick="alert('Critical alert escalated to Clinical Pathology chief.');">Escalate</button>
          </td>
        </tr>
      `).join('');
    };
  } else if (kpiKey === 'pharmacy_stock_low') {
    title = "Pharmacy Low Stock Alerts";
    filterLabel = "Available Stock < Reorder Level";
    listData = state.inventory.pharmacy.filter(item => item.stock < item.minStock);
    tableHeaderHTML = `
      <tr>
        <th>Drug Code</th>
        <th>Brand Name</th>
        <th>Salt Composition</th>
        <th>Current Stock</th>
        <th>Reorder Level</th>
        <th>Unit Price</th>
        <th style="text-align: right;">Purchase Stock Actions</th>
      </tr>
    `;
    window.renderWorkspaceRows = function(data) {
      return data.map(item => `
        <tr>
          <td><code>B-${item.code}</code></td>
          <td><strong>${item.name}</strong><br><small style="color:var(--text-muted);">${item.category}</small></td>
          <td>${item.genericName} ${item.strength}</td>
          <td><strong style="color:var(--color-danger);">${item.stock} Units</strong></td>
          <td>${item.minStock} Units</td>
          <td>₹${item.price}</td>
          <td style="text-align: right;">
            <button class="btn btn-primary btn-sm" onclick="alert('Indent purchase order generated for 500 units of ${item.name}.');">Create Indent PO</button>
            <button class="btn btn-secondary btn-sm" onclick="alert('Request sent to General Hospital warehouse stock.');">Transfer Stock</button>
          </td>
        </tr>
      `).join('');
    };
  } else if (kpiKey === 'pharmacy_expiry_near') {
    title = "Pharmacy Expiry Control Workspace";
    filterLabel = "Drug Expiry Date < 90 Days";
    listData = [
      { name: "Dolo 650mg (Paracetamol)", batch: "D420", expiry: "2026-08-15", qty: 450, left: 59 },
      { name: "Clavam 625 (Amoxicillin)", batch: "C810", expiry: "2026-09-01", qty: 120, left: 76 }
    ];
    tableHeaderHTML = `
      <tr>
        <th>Medicine Name</th>
        <th>Batch Code</th>
        <th>Expiry Date</th>
        <th>Current Quantity</th>
        <th>Days Remaining</th>
        <th style="text-align: right;">Disposal Actions</th>
      </tr>
    `;
    window.renderWorkspaceRows = function(data) {
      return data.map(item => `
        <tr>
          <td><strong>${item.name}</strong></td>
          <td><code>${item.batch}</code></td>
          <td><strong style="color:var(--color-warning);">${item.expiry}</strong></td>
          <td>${item.qty} tabs</td>
          <td><span class="badge bg-warning" style="color:#fff; padding:0.15rem 0.35rem; border-radius:4px;">${item.left} Days Left</span></td>
          <td style="text-align: right;">
            <button class="btn btn-primary btn-sm" onclick="alert('Return invoice posted to distributor vendor.');">Return Stock</button>
            <button class="btn btn-secondary btn-sm" onclick="alert('Batch ${item.batch} locked and marked for clinical disposal.');">Mark Disposal</button>
          </td>
        </tr>
      `).join('');
    };
  } else if (kpiKey === 'occupancy_rate') {
    renderOccupancyDrilldown(container);
    return;
  } else if (kpiKey === 'revenue_analytics') {
    renderRevenueDrilldown(container);
    return;
  } else {
    router.navigate('dashboard');
    return;
  }

  container.innerHTML = `
    <div style="margin-bottom: 1.5rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
      <div style="display: flex; align-items: center; gap: 0.5rem;">
        <button class="btn btn-secondary" onclick="router.navigate('dashboard-${persona}')" style="padding: 0.35rem 0.65rem; font-size: 0.8rem; border: 1px solid var(--border-color); cursor: pointer;">← Back to Dashboard</button>
        <h3 style="margin: 0; font-size: 1.25rem; color: var(--primary); vertical-align: middle;">Operational Workspace: ${title}</h3>
      </div>
      <div style="display: flex; gap: 0.5rem; align-items: center;">
        <span class="badge bg-success" style="color: #fff; padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.75rem;">Active Filter: ${filterLabel}</span>
      </div>
    </div>

    <div class="card">
      <div class="card-header" style="display: flex; justify-content: space-between; align-items: center; padding: 0.75rem 1rem;">
        <div style="width: 100%; display: flex; gap: 1rem; align-items: center;">
          <span style="font-size: 0.9rem; color: var(--text-muted);">🔍 Filter Worksheet:</span>
          <input type="text" id="ws-search-input" class="form-control" placeholder="Search by name, UHID, or metadata..." style="max-width: 400px; font-size: 0.8rem; padding: 0.35rem;">
        </div>
      </div>
      <div class="card-body" style="padding: 0;">
        <table class="custom-table" style="font-size: 0.85rem; margin-bottom: 0;">
          <thead>
            ${tableHeaderHTML}
          </thead>
          <tbody id="ws-table-body">
            ${window.renderWorkspaceRows(listData)}
          </tbody>
        </table>
      </div>
    </div>
  `;

  const sInput = document.getElementById('ws-search-input');
  const tbody = document.getElementById('ws-table-body');
  sInput.addEventListener('input', () => {
    const q = sInput.value.toLowerCase().trim();
    const filtered = listData.filter(item => {
      const str = JSON.stringify(item).toLowerCase();
      return str.includes(q);
    });
    tbody.innerHTML = window.renderWorkspaceRows(filtered);
  });
}

function renderOccupancyDrilldown(container) {
  const totalBeds = Object.keys(state.bedsStatus).length;
  const occupiedBeds = Object.values(state.bedsStatus).filter(b => b.status === "Occupied").length;
  const occupancyRate = ((occupiedBeds / totalBeds) * 100).toFixed(1);

  container.innerHTML = `
    <div style="margin-bottom: 1.5rem; display: flex; align-items: center; gap: 0.5rem;">
      <button class="btn btn-secondary" onclick="router.navigate('dashboard-admin')" style="padding: 0.35rem 0.65rem; font-size: 0.8rem; border: 1px solid var(--border-color); cursor: pointer;">← Back to Dashboard</button>
      <h3 style="margin: 0; font-size: 1.25rem; color: var(--primary);">Hospital Capacity & Bed Board Drilldown</h3>
    </div>

    <div class="card" style="margin-bottom: 1.5rem;">
      <div class="card-header" style="background-color: var(--primary-glow); display: flex; justify-content: space-between; align-items: center;">
        <h4 class="card-title" style="color: var(--primary);">Level 1: Hospital Overview (Bengaluru Campus)</h4>
        <strong style="color: var(--primary); font-size: 1.1rem;">Occupancy: ${occupancyRate}% (${occupiedBeds} / ${totalBeds} Beds Occupied)</strong>
      </div>
      <div class="card-body" style="display: flex; flex-direction: column; gap: 1rem;">
        
        <details class="drilldown-block" open style="background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: 6px; padding: 0.75rem; margin-bottom: 0.5rem;">
          <summary style="font-weight: 700; cursor: pointer; color: var(--text-primary);">🏢 Level 2: Main Inpatient Wing (Occupancy: 87.5% - 14 / 16 Beds)</summary>
          <div style="padding-left: 1.5rem; margin-top: 0.75rem; display: flex; flex-direction: column; gap: 0.75rem;">
            
            <details style="background: var(--bg-surface-elevated); border: 1px solid var(--border-color); border-radius: 4px; padding: 0.5rem;">
              <summary style="font-weight: 600; cursor: pointer; color: var(--text-secondary);">📶 Level 3: Floor 1 (Critical Care - Occupancy: 100%)</summary>
              <div style="padding-left: 1.5rem; margin-top: 0.5rem;">
                <p style="font-weight: 600; color: var(--color-danger); margin-bottom: 0.25rem;">🩺 Level 4: ICU WARD</p>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 0.5rem;">
                  ${Object.entries(state.bedsStatus).filter(([id, b]) => b.wardKey === 'ICU').map(([bedId, info]) => {
                    const statusText = info.status === 'Occupied' ? `🔴 Occupied [Patient UHID: ${info.patientUhid}]` : '🟢 Vacant';
                    const link = info.status === 'Occupied' ? `<a href="#patients?uhid=${info.patientUhid}" class="patient-link" style="font-size:0.75rem; display:block; margin-top:2px;">View Patient Profile (Level 5)</a>` : '';
                    return `<div style="border: 1px solid var(--border-color); padding: 0.5rem; border-radius: 4px; background: var(--bg-surface);">
                      <strong>Bed: ${bedId}</strong><br>
                      <span style="font-size:0.8rem; color:${info.status === 'Occupied' ? 'var(--color-danger)' : 'var(--color-success)'};">${statusText}</span>
                      ${link}
                    </div>`;
                  }).join('')}
                </div>
              </div>
            </details>

            <details style="background: var(--bg-surface-elevated); border: 1px solid var(--border-color); border-radius: 4px; padding: 0.5rem;">
              <summary style="font-weight: 600; cursor: pointer; color: var(--text-secondary);">📶 Level 3: Floor 2 (General Medicine - Occupancy: 83%)</summary>
              <div style="padding-left: 1.5rem; margin-top: 0.5rem;">
                <p style="font-weight: 600; color: var(--primary); margin-bottom: 0.25rem;">🩺 Level 4: GENERAL WARD</p>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 0.5rem;">
                  ${Object.entries(state.bedsStatus).filter(([id, b]) => b.wardKey === 'GENERAL-WARD').slice(0, 4).map(([bedId, info]) => {
                    const statusText = info.status === 'Occupied' ? `🔴 Occupied [Patient: ${info.patientUhid}]` : '🟢 Vacant';
                    const link = info.status === 'Occupied' ? `<a href="#patients?uhid=${info.patientUhid}" class="patient-link" style="font-size:0.75rem; display:block; margin-top:2px;">View Patient Profile (Level 5)</a>` : '';
                    return `<div style="border: 1px solid var(--border-color); padding: 0.5rem; border-radius: 4px; background: var(--bg-surface);">
                      <strong>Bed: ${bedId}</strong><br>
                      <span style="font-size:0.8rem; color:${info.status === 'Occupied' ? 'var(--color-danger)' : 'var(--color-success)'};">${statusText}</span>
                      ${link}
                    </div>`;
                  }).join('')}
                </div>
              </div>
            </details>

            <details style="background: var(--bg-surface-elevated); border: 1px solid var(--border-color); border-radius: 4px; padding: 0.5rem;">
              <summary style="font-weight: 600; cursor: pointer; color: var(--text-secondary);">📶 Level 3: Floor 3 (Specialty Suites - Occupancy: 50%)</summary>
              <div style="padding-left: 1.5rem; margin-top: 0.5rem;">
                <p style="font-weight: 600; color: var(--color-purple); margin-bottom: 0.25rem;">🩺 Level 4: PRIVATE WARD</p>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 0.5rem;">
                  ${Object.entries(state.bedsStatus).filter(([id, b]) => b.wardKey === 'PRIVATE-WARD').slice(0, 4).map(([bedId, info]) => {
                    const statusText = info.status === 'Occupied' ? `🔴 Occupied [Patient: ${info.patientUhid}]` : '🟢 Vacant';
                    const link = info.status === 'Occupied' ? `<a href="#patients?uhid=${info.patientUhid}" class="patient-link" style="font-size:0.75rem; display:block; margin-top:2px;">View Patient Profile (Level 5)</a>` : '';
                    return `<div style="border: 1px solid var(--border-color); padding: 0.5rem; border-radius: 4px; background: var(--bg-surface);">
                      <strong>Bed: ${bedId}</strong><br>
                      <span style="font-size:0.8rem; color:${info.status === 'Occupied' ? 'var(--color-danger)' : 'var(--color-success)'};">${statusText}</span>
                      ${link}
                    </div>`;
                  }).join('')}
                </div>
              </div>
            </details>
          </div>
        </details>

        <details class="drilldown-block" style="background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: 6px; padding: 0.75rem;">
          <summary style="font-weight: 700; cursor: pointer; color: var(--text-primary);">🏢 Level 2: Emergency Wing Trauma Block (Occupancy: 50% - 2 / 4 Beds)</summary>
          <div style="padding-left: 1.5rem; margin-top: 0.75rem; display: flex; flex-direction: column; gap: 0.75rem;">
            <p style="font-weight: 600; color: var(--color-danger); margin-bottom: 0.25rem;">🩺 Level 4: EMERGENCY BEDS</p>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 0.5rem;">
              ${Object.entries(state.bedsStatus).filter(([id, b]) => b.wardKey === 'EMERGENCY').slice(0, 4).map(([bedId, info]) => {
                const statusText = info.status === 'Occupied' ? `🔴 Occupied [Patient: ${info.patientUhid}]` : '🟢 Vacant';
                const link = info.status === 'Occupied' ? `<a href="#patients?uhid=${info.patientUhid}" class="patient-link" style="font-size:0.75rem; display:block; margin-top:2px;">View Patient Profile (Level 5)</a>` : '';
                return `<div style="border: 1px solid var(--border-color); padding: 0.5rem; border-radius: 4px; background: var(--bg-surface);">
                  <strong>Bed: ${bedId}</strong><br>
                  <span style="font-size:0.8rem; color:${info.status === 'Occupied' ? 'var(--color-danger)' : 'var(--color-success)'};">${statusText}</span>
                  ${link}
                </div>`;
              }).join('')}
            </div>
          </div>
        </details>

      </div>
    </div>
  `;
}

function renderRevenueDrilldown(container) {
  let totalRevenue = 0;
  state.billing.forEach(b => totalRevenue += b.paid);

  container.innerHTML = `
    <div style="margin-bottom: 1.5rem; display: flex; align-items: center; gap: 0.5rem;">
      <button class="btn btn-secondary" onclick="router.navigate('dashboard-admin')" style="padding: 0.35rem 0.65rem; font-size: 0.8rem; border: 1px solid var(--border-color); cursor: pointer;">← Back to Dashboard</button>
      <h3 style="margin: 0; font-size: 1.25rem; color: var(--primary);">Hospital Revenue Analytics Drilldown</h3>
    </div>

    <div class="card" style="margin-bottom: 1.5rem;">
      <div class="card-header" style="background-color: var(--primary-glow); display: flex; justify-content: space-between; align-items: center;">
        <h4 class="card-title" style="color: var(--primary);">Level 1: Total Revenue Collections</h4>
        <strong style="color: var(--primary); font-size: 1.1rem;">Total Billed Settlement: ₹${totalRevenue.toLocaleString('en-IN')}</strong>
      </div>
      <div class="card-body" style="display: flex; flex-direction: column; gap: 1rem;">
        
        <details class="drilldown-block" open style="background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: 6px; padding: 0.75rem; margin-bottom: 0.5rem;">
          <summary style="font-weight: 700; cursor: pointer; color: var(--text-primary);">🫀 Level 2: Cardiology Department (42% Revenue Share - ₹${(totalRevenue*0.42).toLocaleString('en-IN', {maximumFractionDigits:0})})</summary>
          <div style="padding-left: 1.5rem; margin-top: 0.75rem;">
            
            <details open style="background: var(--bg-surface-elevated); border: 1px solid var(--border-color); border-radius: 4px; padding: 0.5rem; margin-bottom: 0.5rem;">
              <summary style="font-weight: 600; cursor: pointer; color: var(--text-secondary);">🩺 Level 3: Practitioner - Dr. Amit Verma</summary>
              <div style="padding-left: 1.5rem; margin-top: 0.5rem;">
                
                <p style="font-weight: 600; margin-bottom: 0.25rem;">💰 Level 4: Revenue Streams</p>
                <div style="display: flex; flex-direction: column; gap: 0.5rem; font-size: 0.8rem;">
                  <div style="border-bottom: 1px dashed var(--border-color); padding: 0.25rem 0; display:flex; justify-content:space-between;">
                    <span>Room Rent / Bed Charges (GW / ICU)</span>
                    <strong>₹45,000</strong>
                  </div>
                  <div style="border-bottom: 1px dashed var(--border-color); padding: 0.25rem 0; display:flex; justify-content:space-between;">
                    <span>Clinical Consultation Fees</span>
                    <strong>₹15,000</strong>
                  </div>
                  <div style="padding: 0.25rem 0; display:flex; justify-content:space-between;">
                    <span>Cardiac Diagnostics (ECG / ECHO)</span>
                    <strong>₹8,000</strong>
                  </div>
                </div>

                <div style="margin-top: 0.75rem;">
                  <span style="font-weight: 600; font-size: 0.75rem; text-transform: uppercase; color: var(--text-muted);">Level 5: Top Billing Accounts</span>
                  <table class="custom-table" style="font-size:0.75rem; margin-top:0.25rem;">
                    <thead>
                      <tr>
                        <th>Invoice No</th>
                        <th>Patient Name</th>
                        <th>Settled Amount</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${state.billing.slice(0, 2).map(b => `
                        <tr>
                          <td><code>${b.id}</code></td>
                          <td><a href="#patients?uhid=${b.uhid}" class="patient-link">${b.patientName}</a></td>
                          <td><strong>₹${b.paid.toLocaleString('en-IN')}</strong></td>
                          <td><button class="btn btn-secondary btn-sm" style="font-size:0.65rem; padding:1px 4px;" onclick="router.navigate('billing?uhid=${b.uhid}')">View Ledger</button></td>
                        </tr>
                      `).join('')}
                    </tbody>
                  </table>
                </div>

              </div>
            </details>

          </div>
        </details>

        <details class="drilldown-block" style="background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: 6px; padding: 0.75rem;">
          <summary style="font-weight: 700; cursor: pointer; color: var(--text-primary);">🩹 Level 2: General Medicine Department (25% Revenue Share - ₹${(totalRevenue*0.25).toLocaleString('en-IN', {maximumFractionDigits:0})})</summary>
          <div style="padding-left: 1.5rem; margin-top: 0.75rem;">
            <details style="background: var(--bg-surface-elevated); border: 1px solid var(--border-color); border-radius: 4px; padding: 0.5rem;">
              <summary style="font-weight: 600; cursor: pointer; color: var(--text-secondary);">🩺 Level 3: Practitioner - Dr. Rajesh</summary>
              <div style="padding-left: 1.5rem; margin-top: 0.5rem;">
                <p style="font-weight: 600; margin-bottom: 0.25rem;">💰 Level 4: Revenue Streams</p>
                <div style="display: flex; flex-direction: column; gap: 0.5rem; font-size: 0.8rem;">
                  <div style="border-bottom: 1px dashed var(--border-color); padding: 0.25rem 0; display:flex; justify-content:space-between;">
                    <span>Clinical Consultations</span>
                    <strong>₹24,000</strong>
                  </div>
                  <div style="padding: 0.25rem 0; display:flex; justify-content:space-between;">
                    <span>Outpatient Pharmacy Issues</span>
                    <strong>₹16,000</strong>
                  </div>
                </div>
              </div>
            </details>
          </div>
        </details>

      </div>
    </div>
  `;
}

// --------------------------------------------------------------------------
// EXECUTIVE MANAGEMENT DASHBOARD (EXECUTIVE ROLES) — v3.0
// Spec: Branch-aware, role-based, no header/footer, page content only
// --------------------------------------------------------------------------
function renderExecutiveDashboard(container, activeRole) {

  if (window.edAlertsExpanded === undefined) {
    window.edAlertsExpanded = false;
  }
  window.edToggleAlertsExpanded = function() {
    window.edAlertsExpanded = !window.edAlertsExpanded;
    const content = document.getElementById('ed-alerts-content');
    const chevron = document.getElementById('ed-alerts-chevron');
    if (content && chevron) {
      if (window.edAlertsExpanded) {
        content.style.display = 'block';
        chevron.textContent = '▲';
      } else {
        content.style.display = 'none';
        chevron.textContent = '▼';
      }
    }
  };

  // ── Role visibility flags ─────────────────────────────────────────────────
  const financialRoles = ['Chairman','CEO','COO','CFO','General Manager'];
  const approvalFullRoles = ['Chairman','CEO','COO','CFO'];
  const hasFinance  = financialRoles.includes(activeRole);
  const hasFullApproval = approvalFullRoles.includes(activeRole);
  const isMS = activeRole === 'Medical Superintendent';

  // ── Branch data ───────────────────────────────────────────────────────────
  const branches = {
    all: { id:'all', label:'All Branches — Consolidated', short:'All', health:'red' },
    blr: { id:'blr', label:'Bengaluru Campus', short:'BLR', health:'red' },
    wf:  { id:'wf',  label:'Whitefield', short:'WF', health:'amber' },
    ec:  { id:'ec',  label:'Electronic City', short:'EC', health:'green' }
  };

  const branchKPI = {
    blr: { opd:220, emergency:8, admissions:10, discharges:14, pendingDischarge:5,
            bedTotal:160, bedOcc:134, bedPct:83.8, icuTotal:18, icuOcc:17, icuPct:94.4,
            revenue:310000, collections:285000 },
    wf:  { opd:80, emergency:6, admissions:10, discharges:7, pendingDischarge:2,
            bedTotal:55, bedOcc:42, bedPct:76.4, icuTotal:12, icuOcc:11, icuPct:91.7,
            revenue:105000, collections:90000 },
    ec:  { opd:42, emergency:4, admissions:8, discharges:3, pendingDischarge:1,
            bedTotal:35, bedOcc:24, bedPct:68.6, icuTotal:10, icuOcc:7, icuPct:72.0,
            revenue:75000, collections:62000 }
  };

  const consolidated = {
    opd: 342, emergency: 18, admissions: 28, discharges: 24, pendingDischarge: 8,
    bedTotal: 250, bedOcc: 201, bedPct: 80.4, icuTotal: 40, icuOcc: 36, icuPct: 90.0,
    revenue: 485200, collections: 420500,
    outstanding: 8420000, insurancePending: 85
  };

  const bedTable = [
    { cat:'General Wards',     total:116, occ:86, avail:15, blr:'84%', wf:'76%', ec:'71%', pct:74, status:'green' },
    { cat:'Private / Deluxe',  total: 78, occ:51, avail:19, blr:'78%', wf:'65%', ec:'60%', pct:65, status:'green' },
    { cat:'ICU / HDU',         total: 40, occ:36, avail: 3, blr:'96%', wf:'88%', ec:'72%', pct:90, status:'red' },
    { cat:'NICU / Isolation',  total: 16, occ:11, avail: 4, blr:'75%', wf:'60%', ec:'62%', pct:69, status:'green' },
  ];

  // ── Alert data ────────────────────────────────────────────────────────────
  const alerts = [
    { level:'red',   branch:'blr', text:'Sentinel event — General Medicine — RCA investigation pending', elapsed:'2h 14m', link:'hospMgmt', label:'Investigate →' },
    { level:'red',   branch:'blr', text:'Doctor credential expired — Dr. Sandeep Shah — Orthopedics Board Registration', elapsed:'6h 30m', link:'hospMgmt', label:'Renew →' },
    { level:'red',   branch:'blr', text:'Critical lab unacknowledged >30 min — Rajesh Kumar · 32 min', elapsed:'32m', link:'lab', label:'Act →' },
    { level:'amber', branch:'all', text:'Discharge pending >6h — 3 patients (Bengaluru: 2 · Whitefield: 1)', elapsed:'6h+', link:'atd', label:'Queue →' },
    { level:'amber', branch:'blr', text:'ICU Occupancy at critical threshold — 94.4% · 1 free bed remaining', elapsed:'1h 45m', link:'atd', label:'Bed Board →' },
    { level:'yellow',branch:'blr', text:'Daily census not certified — Bengaluru Campus (MS signature pending)', elapsed:'14h', link:'hospMgmt', label:'Sign →' },
  ];

  // ── Approval data ─────────────────────────────────────────────────────────
  const approvals = [
    { type:'HIGH DISCOUNT',   typeClass:'atype-red',    desc:'Rajesh Kumar — 15% discount on IPD bill', dept:'Billing',     branch:'BLR', amount:'₹12,500',  by:'Dr. Anita Rao',      since:'2h ago' },
    { type:'CAPEX PURCHASE',  typeClass:'atype-blue',   desc:'Philips CX50 cardiac probe replacement',  dept:'Cardiology',  branch:'BLR', amount:'₹1,50,000', by:'HOD Cardiology',     since:'4h ago' },
    { type:'TPA ESCALATION',  typeClass:'atype-orange', desc:'Cardiac stent implant reimbursement',      dept:'Insurance',   branch:'WF',  amount:'₹45,000',   by:'Insurance Desk',     since:'24h ago' },
    { type:'PHARMACY DRUG',   typeClass:'atype-purple', desc:'Inj. Remdesivir — non-formulary request',  dept:'Pharmacy',    branch:'EC',  amount:'₹8,500',    by:'Dr. Meera Pillai',   since:'7h ago' },
    { type:'LAMA OVERRIDE',   typeClass:'atype-amber',  desc:'High-risk cardiac patient — LAMA request', dept:'Admission',   branch:'BLR', amount:'—',          by:'Dr. Suresh Nambiar', since:'3h ago' },
  ];

  // ── Trend chart data ──────────────────────────────────────────────────────
  const trendDays7 = ['22-Jun','23-Jun','24-Jun','25-Jun','26-Jun','27-Jun','28-Jun'];
  const opdBlr7 = [198,210,224,208,215,218,220];
  const opdWf7  = [72,75,78,74,76,78,80];
  const opdEc7  = [38,40,41,39,40,41,42];
  const opdTgt7 = [200,200,210,210,220,220,230];
  const adm7    = [24,26,28,25,27,30,28];
  const dis7    = [22,25,26,24,26,27,24];
  const bedBlr7 = [82,83,84,83,84,84,84];
  const bedWf7  = [74,75,75,76,76,76,76];
  const bedEc7  = [66,67,68,68,68,69,69];

  // ── State ─────────────────────────────────────────────────────────────────
  let activeBranch = 'all';
  let trendPeriod  = '7d';

  // ── Helpers ───────────────────────────────────────────────────────────────
  const fmt   = n => n.toLocaleString('en-IN');
  const fmtRs = n => '₹' + (n >= 100000 ? (n/100000).toFixed(1) + 'L' : fmt(n));
  const statusDot = s => `<span class="ed-dot ed-dot-${s}"></span>`;
  const healthDot = h => ({ red:'🔴', amber:'🟡', green:'🟢' }[h] || '⚪');

  function pct(a, b) { return b > 0 ? ((a/b)*100).toFixed(1) : '0'; }
  function pctStatus(p) { return p >= 90 ? 'red' : p >= 75 ? 'amber' : 'green'; }

  // ── SVG chart helpers ─────────────────────────────────────────────────────
  function svgLine(data, W, H, color, yMin, yMax) {
    const n = data.length;
    const xs = i => (i / (n-1)) * W;
    const ys = v => H - ((v - yMin) / (yMax - yMin)) * H;
    const pts = data.map((v,i) => `${xs(i).toFixed(1)},${ys(v).toFixed(1)}`).join(' ');
    return `<polyline points="${pts}" fill="none" stroke="${color}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>`;
  }
  function svgBar(data, W, H, color, yMin, yMax) {
    const n = data.length; const bw = (W / n) * 0.6; const gap = W / n;
    return data.map((v,i) => {
      const h = Math.max(2, ((v - yMin) / (yMax - yMin)) * H);
      const x = i * gap + (gap - bw) / 2;
      return `<rect x="${x.toFixed(1)}" y="${(H-h).toFixed(1)}" width="${bw.toFixed(1)}" height="${h.toFixed(1)}" fill="${color}" rx="2"/>`;
    }).join('');
  }
  function svgDashedH(val, W, H, color, yMin, yMax) {
    const y = H - ((val - yMin) / (yMax - yMin)) * H;
    return `<line x1="0" y1="${y.toFixed(1)}" x2="${W}" y2="${y.toFixed(1)}" stroke="${color}" stroke-width="1.5" stroke-dasharray="4,3"/>`;
  }
  function svgXLabels(labels, W) {
    const n = labels.length; const gap = W / n;
    return labels.map((l,i) => {
      const x = i * gap + gap/2;
      return `<text x="${x.toFixed(1)}" y="0" fill="#94a3b8" font-size="9" text-anchor="middle">${l}</text>`;
    }).join('');
  }

  // ── Main render ───────────────────────────────────────────────────────────
  function render() {
    const branch = branches[activeBranch];
    const isSingle = activeBranch !== 'all';
    const kpi = isSingle ? branchKPI[activeBranch] : consolidated;
    const bLabel = isSingle ? branch.label : 'All Branches — Combined';

    // Filter alerts
    const visAlerts = isSingle
      ? alerts.filter(a => a.branch === activeBranch || a.branch === 'all')
      : alerts;

    // ── CSS ───────────────────────────────────────────────────────────────
    const css = `
      <style>
        .ed-wrap { font-family:'Inter',system-ui,sans-serif; color:#0f172a; min-width:1280px; display:flex; flex-direction:column; gap:16px; background:#f8fafc; padding-bottom:32px; }
        .ed-wrap *, .ed-wrap *::before, .ed-wrap *::after { box-sizing:border-box; }
        .ed-wrap .mono { font-family:'JetBrains Mono','Courier New',monospace; }

        /* Branch bar */
        .ed-branch-bar { position:sticky; top:0; z-index:50; background:#f8fafc; border-bottom:1px solid #e2e8f0; padding:10px 20px; display:flex; justify-content:space-between; align-items:center; }
        .ed-branch-pills { display:flex; align-items:center; gap:8px; flex-wrap:wrap; }
        .ed-branch-label { font-size:0.75rem; color:#94a3b8; font-weight:600; margin-right:4px; }
        .ed-pill { display:inline-flex; align-items:center; gap:5px; padding:4px 12px; border-radius:20px; font-size:0.76rem; font-weight:700; cursor:pointer; border:1.5px solid #cbd5e1; background:#fff; color:#475569; transition:all .15s; user-select:none; }
        .ed-pill:hover { border-color:#64748b; color:#0f172a; }
        .ed-pill.active { background:#0f172a; color:#fff; border-color:#0f172a; }
        .ed-branch-meta { font-size:0.74rem; color:#64748b; text-align:right; line-height:1.6; }
        .ed-branch-meta b { color:#0f172a; font-weight:700; }

        /* Dots */
        .ed-dot { display:inline-block; width:8px; height:8px; border-radius:50%; flex-shrink:0; }
        .ed-dot-red    { background:#ef4444; }
        .ed-dot-amber  { background:#f59e0b; }
        .ed-dot-green  { background:#10b981; }
        .ed-dot-pill { width:7px; height:7px; }

        /* Cards */
        .ed-card { background:#fff; border:1px solid #e2e8f0; border-radius:8px; padding:14px; }
        .ed-card-red    { border-left:3px solid #ef4444; }
        .ed-card-amber  { border-left:3px solid #f59e0b; }
        .ed-card-green  { border-left:3px solid #10b981; }
        .ed-section-title { font-size:0.72rem; font-weight:800; text-transform:uppercase; letter-spacing:.6px; color:#475569; margin-bottom:10px; display:flex; align-items:center; justify-content:space-between; }
        .ed-section-link  { font-size:0.72rem; font-weight:700; color:#2563eb; text-transform:none; letter-spacing:0; cursor:pointer; }
        .ed-section-link:hover { text-decoration:underline; }

        /* Alerts */
        .ed-alert-row { display:flex; justify-content:space-between; align-items:flex-start; padding:8px 10px; border-radius:6px; font-size:0.79rem; gap:12px; }
        .ed-alert-row+.ed-alert-row { border-top:1px solid #f1f5f9; }
        .ed-alert-red    { background:#fff5f5; }
        .ed-alert-amber  { background:#fffbeb; }
        .ed-alert-yellow { background:#fefce8; }
        .ed-alert-body { display:flex; align-items:flex-start; gap:8px; flex:1; min-width:0; }
        .ed-alert-text { flex:1; min-width:0; line-height:1.5; }
        .ed-elapsed { font-size:0.68rem; color:#94a3b8; font-family:'JetBrains Mono',monospace; white-space:nowrap; margin-top:2px; }
        .ed-act-btn { padding:3px 10px; border-radius:4px; font-size:0.72rem; font-weight:700; border:none; cursor:pointer; white-space:nowrap; flex-shrink:0; }
        .ed-act-red    { background:#fee2e2; color:#991b1b; }
        .ed-act-amber  { background:#fef3c7; color:#92400e; }
        .ed-act-yellow { background:#fef9c3; color:#713f12; }
        .ed-clear-bar  { background:#f0fdf4; border:1px solid #bbf7d0; border-radius:8px; padding:10px 16px; font-size:0.8rem; color:#166534; font-weight:600; }

        /* Two-col layout */
        .ed-two-col { display:grid; grid-template-columns:60% 40%; gap:16px; }

        /* KPI cards */
        .ed-kpi-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:10px; margin-bottom:10px; }
        .ed-kpi-fin  { display:grid; grid-template-columns:repeat(5,1fr); gap:10px; }
        .ed-kpi { background:#fff; border:1px solid #e2e8f0; border-radius:8px; padding:12px; cursor:pointer; transition:box-shadow .15s; position:relative; overflow:hidden; }
        .ed-kpi:hover { box-shadow:0 2px 8px rgba(0,0,0,.08); }
        .ed-kpi.border-red   { border-left:3px solid #ef4444; }
        .ed-kpi.border-amber { border-left:3px solid #f59e0b; }
        .ed-kpi.border-green { border-left:3px solid #10b981; }
        .ed-kpi-name { font-size:0.7rem; font-weight:700; color:#64748b; text-transform:uppercase; letter-spacing:.4px; }
        .ed-kpi-val  { font-size:1.55rem; font-weight:800; color:#0f172a; font-family:'JetBrains Mono',monospace; margin:4px 0 2px; line-height:1; }
        .ed-kpi-sub  { font-size:0.68rem; color:#64748b; line-height:1.4; }
        .ed-kpi-delta { font-size:0.68rem; font-weight:700; margin-top:3px; }
        .ed-kpi-status { position:absolute; top:10px; right:10px; }
        .ed-kpi-branch { font-size:0.63rem; color:#94a3b8; margin-top:3px; font-family:'JetBrains Mono',monospace; }

        /* Dept status */
        .ed-dept-list { display:flex; flex-direction:column; gap:0; }
        .ed-dept-row  { padding:10px 12px; border-bottom:1px solid #f1f5f9; display:flex; flex-direction:column; gap:2px; cursor:pointer; transition:background .1s; }
        .ed-dept-row:last-child { border-bottom:none; }
        .ed-dept-row:hover { background:#f8fafc; }
        .ed-dept-header { display:flex; justify-content:space-between; align-items:center; }
        .ed-dept-name { font-size:0.79rem; font-weight:700; color:#0f172a; display:flex; align-items:center; gap:6px; }
        .ed-dept-link { font-size:0.68rem; color:#2563eb; font-weight:700; }
        .ed-dept-meta { font-size:0.73rem; color:#475569; }
        .ed-dept-alert-line { font-size:0.7rem; color:#b45309; font-weight:600; }
        .ed-resource-strip { background:#f8fafc; border:1px solid #e2e8f0; border-radius:6px; padding:10px 12px; margin-top:10px; display:flex; flex-direction:column; gap:5px; font-size:0.74rem; color:#475569; }
        .ed-resource-line { display:flex; align-items:center; gap:6px; }

        /* Bed table */
        .ed-bed-table { width:100%; border-collapse:collapse; font-size:0.76rem; }
        .ed-bed-table th { background:#f8fafc; font-size:0.68rem; font-weight:700; text-transform:uppercase; letter-spacing:.4px; color:#64748b; padding:6px 10px; border-bottom:1px solid #e2e8f0; text-align:right; }
        .ed-bed-table th:first-child { text-align:left; }
        .ed-bed-table td { padding:7px 10px; border-bottom:1px solid #f1f5f9; text-align:right; font-family:'JetBrains Mono',monospace; font-size:0.75rem; color:#374151; }
        .ed-bed-table td:first-child { text-align:left; font-family:'Inter',sans-serif; font-weight:600; color:#0f172a; }
        .ed-bed-table tr:last-child td { border-bottom:none; background:#f8fafc; font-weight:700; }
        .ed-bed-table tr:hover td { background:#f8fafc; }
        .ed-bed-occ-red    { color:#dc2626; font-weight:800; }
        .ed-bed-occ-amber  { color:#d97706; font-weight:700; }
        .ed-bed-occ-green  { color:#059669; }

        /* Approvals */
        .ed-app-table { width:100%; border-collapse:collapse; font-size:0.76rem; }
        .ed-app-table th { background:#f8fafc; font-size:0.68rem; font-weight:700; text-transform:uppercase; letter-spacing:.4px; color:#64748b; padding:7px 10px; border-bottom:1px solid #e2e8f0; white-space:nowrap; }
        .ed-app-table td { padding:9px 10px; border-bottom:1px solid #f1f5f9; color:#374151; vertical-align:middle; }
        .ed-app-table tr:hover td { background:#f8fafc; }
        .atype-badge { display:inline-block; padding:2px 7px; border-radius:3px; font-size:0.64rem; font-weight:800; letter-spacing:.3px; white-space:nowrap; }
        .atype-red    { background:#fee2e2; color:#991b1b; }
        .atype-blue   { background:#dbeafe; color:#1e40af; }
        .atype-orange { background:#ffedd5; color:#c2410c; }
        .atype-purple { background:#ede9fe; color:#5b21b6; }
        .atype-amber  { background:#fef3c7; color:#92400e; }
        .ed-app-actions { display:flex; gap:5px; }
        .btn-act { padding:3px 9px; border-radius:4px; font-size:0.7rem; font-weight:700; border:1px solid; cursor:pointer; white-space:nowrap; }
        .btn-details  { border-color:#cbd5e1; background:#fff; color:#475569; }
        .btn-approve  { border-color:#10b981; background:#f0fdf4; color:#065f46; }
        .btn-reject   { border-color:#ef4444; background:#fff5f5; color:#991b1b; }
        .btn-delegate { border-color:#a78bfa; background:#f5f3ff; color:#5b21b6; }
        .btn-act:hover { opacity:.8; }
        .ed-app-amount { font-family:'JetBrains Mono',monospace; font-weight:700; }
        .ed-app-since  { font-family:'JetBrains Mono',monospace; font-size:0.7rem; color:#94a3b8; }
        .ed-no-approvals { padding:16px; text-align:center; color:#94a3b8; font-size:0.8rem; }

        /* Charts */
        .ed-charts-row { display:grid; grid-template-columns:repeat(3,1fr); gap:14px; }
        .ed-chart-card { background:#fff; border:1px solid #e2e8f0; border-radius:8px; padding:14px; }
        .ed-chart-title { font-size:0.72rem; font-weight:800; text-transform:uppercase; letter-spacing:.5px; color:#475569; margin-bottom:10px; }
        .ed-chart-svg-wrap { overflow:visible; }
        .ed-chart-legend { display:flex; gap:12px; margin-top:8px; flex-wrap:wrap; }
        .ed-legend-item { display:flex; align-items:center; gap:4px; font-size:0.68rem; color:#64748b; }
        .ed-legend-dot  { width:8px; height:8px; border-radius:2px; }
        .ed-period-toggle { display:flex; gap:6px; margin-bottom:14px; }
        .ed-toggle-btn { padding:4px 12px; border-radius:4px; font-size:0.72rem; font-weight:700; cursor:pointer; border:1px solid #cbd5e1; background:#fff; color:#64748b; }
        .ed-toggle-btn.active { background:#0f172a; color:#fff; border-color:#0f172a; }

        /* Confirm modal */
        .ed-modal-overlay { position:fixed; inset:0; background:rgba(15,23,42,.45); z-index:1000; display:flex; align-items:center; justify-content:center; }
        .ed-modal { background:#fff; border-radius:10px; padding:24px; width:380px; box-shadow:0 20px 60px rgba(0,0,0,.2); }
        .ed-modal h3 { margin:0 0 8px; font-size:1rem; color:#0f172a; }
        .ed-modal p  { margin:0 0 16px; font-size:0.82rem; color:#475569; line-height:1.5; }
        .ed-modal-actions { display:flex; gap:8px; justify-content:flex-end; }
        .btn-modal-cancel  { padding:6px 16px; border-radius:5px; border:1px solid #cbd5e1; background:#fff; font-weight:700; font-size:0.8rem; cursor:pointer; }
        .btn-modal-confirm { padding:6px 16px; border-radius:5px; border:none; font-weight:700; font-size:0.8rem; cursor:pointer; }
        .btn-modal-approve { background:#10b981; color:#fff; }
        .btn-modal-reject  { background:#ef4444; color:#fff; }
      </style>`;

    // ── Branch selector ────────────────────────────────────────────────────
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-IN', { hour:'2-digit', minute:'2-digit', hour12:true });
    const dateStr = now.toLocaleDateString('en-IN', { weekday:'long', day:'2-digit', month:'short', year:'numeric' }).replace(/\//g,'-');

    const pillHtml = Object.values(branches).map(b => {
      const dot = healthDot(b.health);
      return `<span class="ed-pill${activeBranch === b.id ? ' active' : ''}" data-branch="${b.id}">${dot} ${b.label}</span>`;
    }).join('');

    const branchBar = `
      <div class="ed-branch-bar" id="ed-branch-bar">
        <div class="ed-branch-pills">
          <span class="ed-branch-label">Viewing:</span>
          ${pillHtml}
        </div>
        <div class="ed-branch-meta">
          <div>🔄 <b>Updated 3 min ago</b></div>
          <div>${dateStr.split(',')[0]}, ${now.toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'})} | ${timeStr}</div>
        </div>
      </div>`;

    // ── Section 1: Alerts ─────────────────────────────────────────────────
    let alertsHtml;
    if (visAlerts.length === 0) {
      alertsHtml = `<div class="ed-clear-bar">✓ All clear — no items requiring attention${isSingle ? ' for ' + branch.label : ' across all branches'}</div>`;
    } else {
      const rows = visAlerts.slice(0,6).map(a => {
        const cls = a.level === 'red' ? 'red' : a.level === 'amber' ? 'amber' : 'yellow';
        const icon = a.level === 'red' ? '🔴' : a.level === 'amber' ? '🟠' : '🟡';
        const branchTag = (!isSingle && a.branch !== 'all')
          ? `<span style="font-size:0.66rem;background:#f1f5f9;padding:1px 5px;border-radius:3px;color:#64748b;font-weight:700;">${branches[a.branch]?.short || a.branch.toUpperCase()}</span> `
          : '';
        return `
          <div class="ed-alert-row ed-alert-${cls}">
            <div class="ed-alert-body">
              <span style="font-size:0.85rem;margin-top:1px;flex-shrink:0;">${icon}</span>
              <div class="ed-alert-text">
                ${branchTag}${a.text}
                <div class="ed-elapsed">⏱ ${a.elapsed} elapsed</div>
              </div>
            </div>
            <button class="ed-act-btn ed-act-${cls}" onclick="router.navigate('${a.link}')">${a.label}</button>
          </div>`;
      }).join('');

      const moreCount = visAlerts.length - 6;
      const moreLink = moreCount > 0 ? `<div style="text-align:right;padding-top:8px;"><span class="ed-section-link">+ ${moreCount} more →</span></div>` : '';

      alertsHtml = `
        <div class="ed-card ed-card-red" style="padding:0;overflow:hidden;">
          <div style="padding:10px 14px;border-bottom:1px solid #fee2e2;display:flex;justify-content:space-between;align-items:center;cursor:pointer;" onclick="window.edToggleAlertsExpanded()">
            <div style="font-weight:800;font-size:0.8rem;color:#991b1b;text-transform:uppercase;letter-spacing:.5px;display:flex;align-items:center;gap:6px;">
              <span>⚠ Requires Immediate Attention</span>
              <span style="font-size:0.72rem;background:#fee2e2;color:#dc2626;padding:1px 6px;border-radius:10px;font-family:monospace;" class="mono">${visAlerts.length}</span>
              <span id="ed-alerts-chevron" style="font-size:0.7rem;color:#94a3b8;">${window.edAlertsExpanded ? '▲' : '▼'}</span>
            </div>
            <button class="btn-act btn-details" onclick="event.stopPropagation(); window.edResolveAll()" style="font-size:0.7rem;">Resolve All</button>
          </div>
          <div id="ed-alerts-content" style="${window.edAlertsExpanded ? '' : 'display:none;'}">
            ${rows}
            ${moreLink}
          </div>
        </div>`;
    }

    // ── KPI Row A — Patient Operations ────────────────────────────────────
    const opdPct = kpi.opd > 300 ? '+4%' : '+6%';
    const bedSt = pctStatus(parseFloat(kpi.bedPct));
    const icuSt = pctStatus(parseFloat(kpi.icuPct));
    const disSt = kpi.pendingDischarge > 5 ? 'amber' : 'green';

    const kpiCards = [
      {
        name:'OPD Today', val:fmt(kpi.opd), sub:`Appt: ${fmt(Math.round(kpi.opd*.64))} · Walk-in: ${fmt(Math.round(kpi.opd*.36))}`,
        delta:`<span style="color:#10b981;">↑ ${opdPct} vs yesterday</span>`,
        branchSub: !isSingle ? 'BLR: 220 · WF: 80 · EC: 42' : '',
        status:'green', link:'opd-dashboard'
      },
      {
        name:'Emergency Today', val:fmt(kpi.emergency), sub:`MLC: 2 · BD: 1`,
        subStyle:'color:#dc2626;font-weight:700;',
        status:'amber', link:'emergency'
      },
      {
        name:'Admissions Today', val:fmt(kpi.admissions), sub:`Elective: ${Math.round(kpi.admissions*.7)} · Emergency: ${Math.round(kpi.admissions*.3)}`,
        status:'green', link:'atd'
      },
      {
        name:'Discharges Today', val:fmt(kpi.discharges),
        sub:`Pending: ${kpi.pendingDischarge}${kpi.pendingDischarge > 5 ? ' 🟠' : ''} · Any >6h: ${kpi.pendingDischarge > 3 ? '3 🔴' : '0'}`,
        subStyle: kpi.pendingDischarge > 5 ? 'color:#d97706;font-weight:700;' : '',
        status: disSt, link:'atd'
      },
      {
        name:'Bed Occupancy', val:kpi.bedPct + '%', sub:`${kpi.bedOcc} / ${kpi.bedTotal} beds · ICU: ${kpi.icuPct}%`,
        branchSub: !isSingle ? 'BLR: 84% · WF: 76% · EC: 69%' : '',
        status: bedSt, link:'atd'
      },
      {
        name:'ICU Occupancy', val:kpi.icuPct + '%', sub:`${kpi.icuOcc}/${kpi.icuTotal} · Vent: 12 · Free: ${kpi.icuTotal - kpi.icuOcc}`,
        subStyle: kpi.icuPct >= 90 ? 'color:#dc2626;font-weight:700;' : '',
        branchSub: !isSingle ? 'BLR: 94% · WF: 88% · EC: 72%' : '',
        status: icuSt, link:'atd'
      }
    ];

    const kpiOpsHtml = kpiCards.map(k => `
      <div class="ed-kpi border-${k.status}" onclick="router.navigate('${k.link}')">
        <div class="ed-kpi-status">${statusDot(k.status)}</div>
        <div class="ed-kpi-name">${k.name}</div>
        <div class="ed-kpi-val mono">${k.val}</div>
        <div class="ed-kpi-sub"${k.subStyle ? ` style="${k.subStyle}"` : ''}>${k.sub}</div>
        ${k.delta ? `<div class="ed-kpi-delta">${k.delta}</div>` : ''}
        ${k.branchSub ? `<div class="ed-kpi-branch">${k.branchSub}</div>` : ''}
      </div>`).join('');

    // ── KPI Row B — Financial ─────────────────────────────────────────────
    let kpiFinHtml = '';
    if (hasFinance) {
      const finCards = [
        { name:'Revenue Today',  val:fmtRs(kpi.revenue || consolidated.revenue),
          sub:'OPD ₹1.2L · IPD ₹2.8L · Pharma ₹0.9L', delta:'<span style="color:#10b981;">↑ 8% vs yesterday</span>',
          branchSub: !isSingle ? 'BLR: ₹3.1L · WF: ₹1.0L · EC: ₹0.7L' : '', status:'green', link:'billing' },
        { name:'Collections Today', val:fmtRs(kpi.collections || consolidated.collections),
          sub:'Cash ₹95K · UPI ₹2.4L · Card ₹83K', status:'green', link:'billing' },
        { name:'Outstanding Receivables', val:'₹84.2L',
          sub:'TPA ₹42.5L · CGHS ₹28.7L · Corp ₹3L', status:'red', link:'billing' },
        { name:'Insurance Pending', val:'85 claims',
          sub:'Overdue: 5 🔴 · Queries: 6', status:'amber', link:'insurance' },
        { name:'Payer Mix', val:'',
          sub:'Self: 35% · TPA: 45%<br>CGHS: 12% · PMJAY: 8%', status:'green', link:'billing' },
      ];
      kpiFinHtml = `
        <div>
          <div class="ed-section-title" style="margin-bottom:6px;">💰 Financial Snapshot</div>
          <div class="ed-kpi-fin">
            ${finCards.map(k => `
              <div class="ed-kpi border-${k.status}" onclick="router.navigate('${k.link}')">
                <div class="ed-kpi-status">${statusDot(k.status)}</div>
                <div class="ed-kpi-name">${k.name}</div>
                ${k.val ? `<div class="ed-kpi-val mono" style="font-size:1.15rem;">${k.val}</div>` : ''}
                <div class="ed-kpi-sub">${k.sub}</div>
                ${k.delta ? `<div class="ed-kpi-delta">${k.delta}</div>` : ''}
                ${k.branchSub ? `<div class="ed-kpi-branch">${k.branchSub}</div>` : ''}
              </div>`).join('')}
          </div>
        </div>`;
    }

    // ── Right: Dept Status ────────────────────────────────────────────────
    const depts = [
      { status:'green', name:'OPD Services',
        meta:'Waiting: 18 · Avg wait: 22 min',
        alert: !isSingle ? 'All branches within SLA' : '', alertAmber:false, link:'opd-dashboard' },
      { status:'red', name:'Emergency / Casualty',
        meta:`Active: ${kpi.emergency} · Resus: 2/2${!isSingle ? ' (BLR full)' : ''}`,
        alert:'⚠ MLC case active · Resus bay full', alertAmber:true, link:'emergency' },
      { status:'amber', name:'IPD / ATD',
        meta:`Inpatients: ${kpi.bedOcc} · D/C pending: ${kpi.pendingDischarge}`,
        alert:`⚠ 3 pending >6h${!isSingle ? ' (BLR: 2 · WF: 1)' : ''}`, alertAmber:true, link:'atd' },
      { status:'amber', name:'Diagnostics (Lab + Radiology)',
        meta:'Lab: 45 pending · Critical: 2 🔴 · Radiology: 8 studies',
        alert:'⚠ 2 critical unacknowledged results', alertAmber:true, link:'lab' },
      { status:'amber', name:'Billing & Insurance',
        meta:'Recon: ✓ · Pre-auths pending: 12',
        alert:'⚠ TPA queries: 6 · LOA expired: 3', alertAmber:true, link:'billing' },
    ];

    const deptHtml = `
      <div class="ed-card" style="padding:0;overflow:hidden;">
        <div class="ed-section-title" style="padding:10px 14px;border-bottom:1px solid #f1f5f9;margin:0;">
          🏥 Live Department Status
          ${!isSingle ? '<span style="font-size:0.66rem;color:#94a3b8;font-weight:600;">Worst status across branches</span>' : ''}
        </div>
        <div class="ed-dept-list">
          ${depts.map(d => `
            <div class="ed-dept-row" onclick="router.navigate('${d.link}')">
              <div class="ed-dept-header">
                <div class="ed-dept-name">${statusDot(d.status)} ${d.name}</div>
                <span class="ed-dept-link">[→ ${d.name.split(' ')[0]}]</span>
              </div>
              <div class="ed-dept-meta">${d.meta}</div>
              ${d.alert ? `<div class="ed-dept-alert-line">${d.alert}</div>` : ''}
            </div>`).join('')}
        </div>
        <div class="ed-resource-strip">
          <div class="ed-resource-line"><span>🔪</span><span>OT: 83.3% utilisation (8/12) · Delayed: 1 🟠</span><span class="ed-section-link" onclick="router.navigate('ot')" style="margin-left:auto;">[→ OT]</span></div>
          <div class="ed-resource-line"><span>👥</span><span>Staff on duty: Doctors <b class="mono">48/50</b> · Nurses <b class="mono">110/115</b> · Absent unplanned: <b class="mono">2</b> 🟢</span></div>
          <div class="ed-resource-line"><span>🔧</span><span>Biomedical: 1 critical item down — MRI Console${!isSingle ? ' (BLR)' : ''} 🔴</span><span class="ed-section-link" onclick="router.navigate('hospMgmt')" style="margin-left:auto;">[→ Tickets]</span></div>
        </div>
      </div>`;

    // ── Bed Summary ───────────────────────────────────────────────────────
    const bedBranchCols = !isSingle ? `<th>BLR</th><th>WF</th><th>EC</th>` : '';
    const bedRows = bedTable.map(r => {
      const cls = r.status === 'red' ? 'ed-bed-occ-red' : r.status === 'amber' ? 'ed-bed-occ-amber' : 'ed-bed-occ-green';
      const dot = statusDot(r.status);
      return `<tr>
        <td>${r.cat}</td>
        <td>${r.total}</td><td>${r.occ}</td><td>${r.avail}</td>
        ${!isSingle ? `<td>${r.blr}</td><td>${r.wf}</td><td>${r.ec}</td>` : ''}
        <td class="${cls}">${r.pct}% ${dot}</td>
      </tr>`;
    }).join('');

    // Totals
    const totTotal = bedTable.reduce((s,r)=>s+r.total,0);
    const totOcc   = bedTable.reduce((s,r)=>s+r.occ,0);
    const totAvail = bedTable.reduce((s,r)=>s+r.avail,0);
    const totPct   = Math.round(totOcc/totTotal*100);
    const totSt    = pctStatus(totPct);
    const totCls   = totSt === 'red' ? 'ed-bed-occ-red' : totSt === 'amber' ? 'ed-bed-occ-amber' : 'ed-bed-occ-green';

    const bedSummary = `
      <div class="ed-card">
        <div class="ed-section-title">
          🛏 Bed Occupancy Summary
          <span class="ed-section-link" onclick="router.navigate('atd')">View Full Bed Board →</span>
        </div>
        <table class="ed-bed-table">
          <thead><tr>
            <th>Category</th><th>Total</th><th>Occ</th><th>Avail</th>
            ${bedBranchCols}
            <th>Occ%</th>
          </tr></thead>
          <tbody>
            ${bedRows}
            <tr>
              <td>TOTAL</td>
              <td>${totTotal}</td><td>${totOcc}</td><td>${totAvail}</td>
              ${!isSingle ? `<td>84%</td><td>76%</td><td>68%</td>` : ''}
              <td class="${totCls}">${totPct}% ${statusDot(totSt)}</td>
            </tr>
          </tbody>
        </table>
        <div style="font-size:0.68rem;color:#94a3b8;margin-top:8px;">Cleaning: 8 beds &nbsp;·&nbsp; Blocked: 3 beds (excluded from availability)</div>
      </div>`;

    // ── Section 4: Approvals ──────────────────────────────────────────────
    let appContent;
    if (approvals.length === 0) {
      appContent = `<div class="ed-no-approvals">No approvals pending</div>`;
    } else {
      const appRows = approvals.map((a,i) => {
        const actionBtns = hasFullApproval
          ? `<button class="btn-act btn-details"  onclick="window.edApprovalModal(${i},'details')">Details</button>
             <button class="btn-act btn-approve"  onclick="window.edApprovalModal(${i},'approve')">Approve</button>
             <button class="btn-act btn-reject"   onclick="window.edApprovalModal(${i},'reject')">Reject</button>
             <button class="btn-act btn-delegate" onclick="window.edApprovalModal(${i},'delegate')">Delegate</button>`
          : `<button class="btn-act btn-details"  onclick="window.edApprovalModal(${i},'details')">View Details</button>`;
        return `<tr>
          <td style="color:#94a3b8;font-family:'JetBrains Mono',monospace;font-size:0.7rem;">${i+1}</td>
          <td><span class="atype-badge ${a.typeClass}">${a.type}</span></td>
          <td style="max-width:220px;">${a.desc}</td>
          <td style="color:#64748b;">${a.dept}</td>
          ${!isSingle ? `<td style="color:#94a3b8;font-size:0.7rem;font-weight:700;">${a.branch}</td>` : ''}
          <td class="ed-app-amount">${a.amount}</td>
          <td style="color:#64748b;font-size:0.72rem;">${a.by}</td>
          <td class="ed-app-since">${a.since}</td>
          <td><div class="ed-app-actions">${actionBtns}</div></td>
        </tr>`;
      }).join('');

      appContent = `
        <div style="overflow-x:auto;">
          <table class="ed-app-table">
            <thead><tr>
              <th>#</th><th>Type</th><th>Description</th><th>Dept</th>
              ${!isSingle ? '<th>Branch</th>' : ''}
              <th>Amount</th><th>Requested By</th><th>Since</th><th>Actions</th>
            </tr></thead>
            <tbody>${appRows}</tbody>
          </table>
        </div>`;
    }

    const appSection = `
      <div class="ed-card">
        <div class="ed-section-title">📋 Pending Executive Approvals</div>
        ${appContent}
      </div>`;

    // ── Section 5: Trend Charts ───────────────────────────────────────────
    const W = 240, H = 90;
    const xLabels = trendDays7;

    // Chart 1: OPD Visits vs Target
    const opdMin = 30, opdMax = 250;
    const c1 = `
      <svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" class="ed-chart-svg-wrap">
        ${svgBar(opdBlr7, W, H, '#3b82f6', opdMin, opdMax)}
        ${svgBar(opdWf7.map((v,i)=>v+opdBlr7[i]), W, H, '#10b981', opdMin, opdMax)}
        ${svgBar(opdEc7.map((v,i)=>v+opdBlr7[i]+opdWf7[i]), W, H, '#06b6d4', opdMin, opdMax)}
        ${svgDashedH(230, W, H, '#ef4444', opdMin, opdMax)}
      </svg>`;

    // Chart 2: Admissions & Discharges
    const adMin = 15, adMax = 35;
    const c2 = `
      <svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" class="ed-chart-svg-wrap">
        ${svgBar(adm7, W, H, '#6366f1', adMin, adMax)}
        ${svgBar(dis7, W, H, '#10b981', adMin, adMax)}
      </svg>`;

    // Chart 3: Bed Occupancy %
    const boMin = 60, boMax = 100;
    const c3 = `
      <svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" class="ed-chart-svg-wrap">
        ${svgLine(bedBlr7, W, H, '#3b82f6', boMin, boMax)}
        ${svgLine(bedWf7,  W, H, '#10b981', boMin, boMax)}
        ${svgLine(bedEc7,  W, H, '#06b6d4', boMin, boMax)}
        ${svgDashedH(85, W, H, '#ef4444', boMin, boMax)}
      </svg>`;

    const xLabelSvg = `<svg width="${W}" height="14" viewBox="0 0 ${W} 14"><g>${svgXLabels(xLabels.map(d=>d.split('-')[0]), W)}</g></svg>`;

    const chartsSection = `
      <div class="ed-card">
        <div class="ed-section-title">
          📈 Operational Trends
          <div class="ed-period-toggle" style="margin:0;">
            <button class="ed-toggle-btn${trendPeriod==='7d'?' active':''}" onclick="window.edTogglePeriod('7d')">Last 7 Days</button>
            <button class="ed-toggle-btn${trendPeriod==='30d'?' active':''}" onclick="window.edTogglePeriod('30d')">Last 30 Days</button>
          </div>
        </div>
        <div class="ed-charts-row">
          <div class="ed-chart-card">
            <div class="ed-chart-title">OPD Visits vs Target</div>
            ${c1}${xLabelSvg}
            <div class="ed-chart-legend">
              <div class="ed-legend-item"><div class="ed-legend-dot" style="background:#3b82f6"></div>BLR</div>
              <div class="ed-legend-item"><div class="ed-legend-dot" style="background:#10b981"></div>WF</div>
              <div class="ed-legend-item"><div class="ed-legend-dot" style="background:#06b6d4"></div>EC</div>
              <div class="ed-legend-item"><div class="ed-legend-dot" style="background:#ef4444;height:3px;border-radius:0;"></div>Target</div>
            </div>
          </div>
          <div class="ed-chart-card">
            <div class="ed-chart-title">Admissions &amp; Discharges</div>
            ${c2}${xLabelSvg}
            <div class="ed-chart-legend">
              <div class="ed-legend-item"><div class="ed-legend-dot" style="background:#6366f1"></div>Admissions</div>
              <div class="ed-legend-item"><div class="ed-legend-dot" style="background:#10b981"></div>Discharges</div>
            </div>
          </div>
          <div class="ed-chart-card">
            <div class="ed-chart-title">Bed Occupancy %</div>
            ${c3}${xLabelSvg}
            <div class="ed-chart-legend">
              <div class="ed-legend-item"><div class="ed-legend-dot" style="background:#3b82f6"></div>BLR</div>
              <div class="ed-legend-item"><div class="ed-legend-dot" style="background:#10b981"></div>WF</div>
              <div class="ed-legend-item"><div class="ed-legend-dot" style="background:#06b6d4"></div>EC</div>
              <div class="ed-legend-item"><div class="ed-legend-dot" style="background:#ef4444;height:2px;border-radius:0;"></div>85% threshold</div>
            </div>
          </div>
        </div>
      </div>`;

    // ── Sign census button for MS ─────────────────────────────────────────
    const signBtn = isMS ? `
      <div style="margin-bottom:4px;">
        <button id="ed-sign-census" onclick="window.signDailyCensusExec()" style="background:#ffedd5;color:#c2410c;border:1px solid #fed7aa;border-radius:6px;padding:8px 16px;font-weight:700;font-size:0.8rem;cursor:pointer;display:flex;align-items:center;gap:6px;">
          ✍️ Sign Daily Census — Bengaluru Campus (pending)
        </button>
      </div>` : '';

    // ── Assemble ──────────────────────────────────────────────────────────
    container.innerHTML = `
      ${css}
      <div class="ed-wrap" id="ed-main-wrap">
        ${branchBar}
        <div style="padding:0 20px;display:flex;flex-direction:column;gap:14px;">
          ${signBtn}
          ${alertsHtml}
          <div class="ed-two-col">
            <div style="display:flex;flex-direction:column;gap:10px;">
              ${hasFinance ? `<div class="ed-card">${kpiFinHtml}</div>` : ''}
              <div class="ed-card">
                <div class="ed-section-title">📊 Patient Operations — <span style="font-weight:600;text-transform:none;">${bLabel}</span></div>
                <div class="ed-kpi-grid">${kpiOpsHtml}</div>
              </div>
            </div>
            ${deptHtml}
          </div>
          ${bedSummary}
          ${appSection}
          ${chartsSection}
        </div>
      </div>`;

    // ── Event: branch pills ───────────────────────────────────────────────
    document.querySelectorAll('.ed-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        activeBranch = pill.dataset.branch;
        render();
      });
    });

    // ── Event: resolve all alerts ─────────────────────────────────────────
    window.edResolveAll = function() {
      const section = document.querySelector('.ed-card.ed-card-red');
      if (section) {
        section.outerHTML = `<div class="ed-clear-bar">✓ All alerts acknowledged — monitoring continues</div>`;
      }
    };

    // ── Event: approval modal ─────────────────────────────────────────────
    window.edApprovalModal = function(idx, action) {
      const a = approvals[idx];
      if (!a) return;
      let title, body, confirmClass, confirmLabel;
      if (action === 'approve') {
        title = 'Confirm Approval'; body = `Approve <b>${a.type}</b> request for <b>${a.desc}</b>?${a.amount !== '—' ? ' Amount: <b>' + a.amount + '</b>.' : ''} This action cannot be undone.`;
        confirmClass = 'btn-modal-approve'; confirmLabel = 'Approve';
      } else if (action === 'reject') {
        title = 'Confirm Rejection'; body = `Reject <b>${a.type}</b> request: <b>${a.desc}</b>? Please note the reason will be recorded.`;
        confirmClass = 'btn-modal-reject'; confirmLabel = 'Reject';
      } else if (action === 'delegate') {
        title = 'Delegate Approval'; body = `Delegate <b>${a.type}</b> — <b>${a.desc}</b> to another executive for review.`;
        confirmClass = 'btn-modal-approve'; confirmLabel = 'Delegate';
      } else {
        title = 'Approval Details'; body = `<b>${a.type}</b><br>${a.desc}<br>Dept: ${a.dept} · Branch: ${a.branch} · Amount: ${a.amount}<br>Requested by: ${a.by} · ${a.since}`;
        confirmClass = 'btn-modal-approve'; confirmLabel = 'Close';
      }
      const overlay = document.createElement('div');
      overlay.className = 'ed-modal-overlay';
      overlay.innerHTML = `
        <div class="ed-modal">
          <h3>${title}</h3>
          <p>${body}</p>
          <div class="ed-modal-actions">
            <button class="btn-modal-cancel" onclick="this.closest('.ed-modal-overlay').remove()">Cancel</button>
            <button class="btn-modal-confirm ${confirmClass}" onclick="this.closest('.ed-modal-overlay').remove()">${confirmLabel}</button>
          </div>
        </div>`;
      document.body.appendChild(overlay);
    };

    // ── Event: trend period toggle ────────────────────────────────────────
    window.edTogglePeriod = function(period) {
      trendPeriod = period;
      render();
    };

    // ── Sign census ───────────────────────────────────────────────────────
    window.signDailyCensusExec = function() {
      const btn = document.getElementById('ed-sign-census');
      if (btn) { btn.style.background='#d1fae5'; btn.style.color='#065f46'; btn.style.borderColor='#6ee7b7'; btn.textContent='✓ Daily Census Signed — Bengaluru Campus'; btn.disabled=true; }
    };
    // Pre-Auth handlers
    window.approvePreAuth = function(claimId, amount) {
      const claim = state.claims.find(c => c.id === claimId);
      if (claim) {
        claim.status = 'Approved';
        alert(`Pre-Auth Claim ${claimId} approved successfully for ₹${amount.toLocaleString('en-IN')}.`);
      }
    };

    window.raiseClaimQuery = function(claimId) {
      const claim = state.claims.find(c => c.id === claimId);
      if (claim) {
        const queryText = prompt(`Enter Query / Clarification request for Claim ${claimId}:`, "Please upload detailed OT notes and implant sticker.");
        if (queryText && queryText.trim()) {
          claim.status = 'Query Raised';
          claim.queryText = queryText;
          alert(`Query successfully raised to TPA for Claim ${claimId}.`);
        }
      }
    };
  }

  render();
}


