/* ==========================================================================
   SARONIL HMS - DYNAMIC ROLE-BASED DASHBOARDS (dashboardView.js)
   ========================================================================== */

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
    pharmacy: { name: "Narendra P.", role: "Chief Pharmacist", avatar: "NP" }
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
  const roleToPersona = {
    'Administrator': 'admin',
    'Doctor': 'doctor',
    'Nurse': 'nurse',
    'Billing': 'billing',
    'Front Desk': 'admission',
    'Lab': 'lab',
    'Pharmacist': 'pharmacy'
  };

  const personaToRole = {
    'admin': 'Administrator',
    'doctor': 'Doctor',
    'nurse': 'Nurse',
    'billing': 'Billing',
    'admission': 'Front Desk',
    'lab': 'Lab',
    'pharmacy': 'Pharmacist'
  };

  // Read active persona from local storage or default to 'admin'
  let activePersona = localStorage.getItem('saronil_active_persona') || 'admin';
  
  if (subAnchor) {
    activePersona = subAnchor;
    localStorage.setItem('saronil_active_persona', activePersona);
    const matchedRole = personaToRole[activePersona];
    if (matchedRole && window.state) {
      window.state.activeUserRole = matchedRole;
      const selector = document.getElementById('global-persona-selector');
      if (selector) {
        selector.value = matchedRole;
      }
    }
  } else if (window.state && window.state.activeUserRole) {
    activePersona = roleToPersona[window.state.activeUserRole] || 'admin';
  }

  // Ensure sidebar user details are updated
  window.updateDynamicSidebarUser(activePersona);

  // Sync dropdown selector and state on initial or direct load
  const matchedRole = personaToRole[activePersona];
  if (matchedRole && window.state) {
    window.state.activeUserRole = matchedRole;
    const selector = document.getElementById('global-persona-selector');
    if (selector) {
      selector.value = matchedRole;
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
  
  if (persona === 'admin') {
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
  const personaToRole = {
    'admin': 'Administrator',
    'doctor': 'Doctor',
    'nurse': 'Nurse',
    'billing': 'Billing',
    'admission': 'Front Desk',
    'lab': 'Lab',
    'pharmacy': 'Pharmacist'
  };
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
    const matchesPrefix = p.uhid.startsWith('MH-2026-');
    const matchesType = (type === 'All') || (p.type === type);
    return matchesPrefix && matchesType;
  }).sort((a, b) => b.uhid.localeCompare(a.uhid)).slice(0, 15);

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
  
  const totalBeds = Object.keys(state.bedsStatus).length;
  const occupiedBeds = Object.values(state.bedsStatus).filter(b => b.status === "Occupied").length;
  const occupancyRate = ((occupiedBeds / totalBeds) * 100).toFixed(1);

  container.innerHTML = `
    <!-- KPI Cards -->
    <div class="stats-grid" style="margin-bottom: 1.5rem;">
      ${window.renderKPICard({
        id: 'revenue_analytics',
        title: 'Total Revenue',
        value: `₹${totalRevenue.toLocaleString('en-IN')}`,
        subtext: 'Settle collections',
        status: 'normal',
        trendText: '+12% compared to last month',
        trendDirection: 'up',
        icon: '🪙',
        iconBg: 'var(--color-success-bg)',
        iconColor: 'var(--color-success)',
        recordsCount: state.billing.length
      })}
      ${window.renderKPICard({
        id: 'occupancy_rate',
        title: 'Bed Occupancy Rate',
        value: `${occupancyRate}%`,
        subtext: `${occupiedBeds} / ${totalBeds} Active beds`,
        status: parseFloat(occupancyRate) > 80 ? 'warning' : 'normal',
        trendText: 'Steady trend',
        trendDirection: 'neutral',
        icon: '🛏️',
        iconBg: 'var(--primary-glow)',
        iconColor: 'var(--primary)',
        recordsCount: occupiedBeds
      })}
      ${window.renderKPICard({
        id: 'patients_today',
        title: 'Patients Today',
        value: state.patients.length,
        subtext: 'Master registries',
        status: 'normal',
        trendText: '+5% vs yesterday',
        trendDirection: 'up',
        icon: '👤',
        iconBg: 'var(--color-purple-bg)',
        iconColor: 'var(--color-purple)',
        recordsCount: state.patients.length
      })}
      ${window.renderKPICard({
        id: 'admissions_today',
        title: 'OPD / IPD Load',
        value: `${state.appointments.length} / ${state.admissions.filter(a => a.status === 'Active').length}`,
        subtext: 'Scheduled counters',
        status: 'normal',
        trendText: '+8% vs yesterday',
        trendDirection: 'up',
        icon: '🏥',
        iconBg: 'var(--color-warning-bg)',
        iconColor: 'var(--color-warning)',
        recordsCount: state.admissions.length
      })}
      ${window.renderKPICard({
        id: 'beds_available',
        title: 'Avg Length of Stay',
        value: '4.2 Days',
        subtext: 'Inpatient discharge index',
        status: 'normal',
        trendText: '-2% vs last month',
        trendDirection: 'down',
        icon: '⏳',
        iconBg: 'var(--color-info-bg)',
        iconColor: 'var(--color-info)',
        recordsCount: Object.values(state.bedsStatus).filter(b => b.status === "Available" || b.status === "Vacant").length
      })}
      ${window.renderKPICard({
        id: 'critical_alerts',
        title: 'Staff / Satisfaction',
        value: '92% / 4.8',
        subtext: 'Staff utilization / Rating',
        status: 'normal',
        trendText: '+0.2 rating',
        trendDirection: 'up',
        icon: '⭐',
        iconBg: 'var(--color-purple-bg)',
        iconColor: 'var(--color-purple)',
        recordsCount: 2
      })}
    </div>

    <!-- Quick Actions -->
    <div style="background-color: var(--bg-surface); padding: 0.75rem 1rem; border-radius: var(--radius-md); border: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center; gap: 0.75rem; flex-wrap: wrap; margin-bottom: 1.5rem;">
      <div style="display: flex; gap: 0.75rem; flex-wrap: wrap; align-items: center;">
        <button class="btn btn-secondary" onclick="router.navigate('admin-reports')">Hospital Reports</button>
        <button class="btn btn-secondary" onclick="router.navigate('admin-roles')">User Management</button>
        <button class="btn btn-secondary" onclick="router.navigate('admin-employees')">Department Management</button>
        <button class="btn btn-secondary" onclick="alert('Navigating to system settings...')">System Settings</button>
        <button class="btn btn-secondary" onclick="alert('Opening audit logs...')">Audit Logs</button>
      </div>
      ${window.renderDashboardSearchInline()}
    </div>

    <!-- Main Grid Row -->
    <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 1.5rem; margin-bottom: 1.5rem;">
      <!-- Chart Widgets -->
      <div class="card">
        <div class="card-header"><h3 class="card-title">Hospital Performance & Trends</h3></div>
        <div class="card-body" style="display: flex; flex-direction: column; gap: 1.5rem;">
          <!-- Custom CSS Graph: Admissions & Occupancy Trend -->
          <div>
            <h5 style="margin-bottom: 0.5rem; font-size: 0.85rem;">Admissions Trend (Past 6 Months)</h5>
            <div style="display: flex; align-items: flex-end; justify-content: space-between; height: 120px; border-bottom: 2px solid var(--border-color); padding: 0 1rem;">
              <div style="display: flex; flex-direction: column; align-items: center; flex: 1;">
                <div style="width: 30px; height: 40px; background-color: var(--color-purple); border-radius: 3px 3px 0 0;"></div>
                <span style="font-size: 0.7rem; color: var(--text-muted); margin-top: 0.35rem;">Jan</span>
              </div>
              <div style="display: flex; flex-direction: column; align-items: center; flex: 1;">
                <div style="width: 30px; height: 65px; background-color: var(--color-purple); border-radius: 3px 3px 0 0;"></div>
                <span style="font-size: 0.7rem; color: var(--text-muted); margin-top: 0.35rem;">Feb</span>
              </div>
              <div style="display: flex; flex-direction: column; align-items: center; flex: 1;">
                <div style="width: 30px; height: 55px; background-color: var(--color-purple); border-radius: 3px 3px 0 0;"></div>
                <span style="font-size: 0.7rem; color: var(--text-muted); margin-top: 0.35rem;">Mar</span>
              </div>
              <div style="display: flex; flex-direction: column; align-items: center; flex: 1;">
                <div style="width: 30px; height: 90px; background-color: var(--color-purple); border-radius: 3px 3px 0 0;"></div>
                <span style="font-size: 0.7rem; color: var(--text-muted); margin-top: 0.35rem;">Apr</span>
              </div>
              <div style="display: flex; flex-direction: column; align-items: center; flex: 1;">
                <div style="width: 30px; height: 80px; background-color: var(--color-purple); border-radius: 3px 3px 0 0;"></div>
                <span style="font-size: 0.7rem; color: var(--text-muted); margin-top: 0.35rem;">May</span>
              </div>
              <div style="display: flex; flex-direction: column; align-items: center; flex: 1;">
                <div style="width: 30px; height: 110px; background-color: var(--primary); border-radius: 3px 3px 0 0;"></div>
                <span style="font-size: 0.7rem; color: var(--primary); font-weight: bold; margin-top: 0.35rem;">Jun</span>
              </div>
            </div>
          </div>

          <!-- Department-wise Revenue Split -->
          <div>
            <h5 style="margin-bottom: 0.5rem; font-size: 0.85rem;">Department Performance (Revenue Split)</h5>
            <div style="display: flex; flex-direction: column; gap: 0.5rem;">
              <div>
                <div style="display:flex; justify-content:space-between; font-size:0.75rem; margin-bottom:0.15rem;"><span>Cardiology</span><strong>42% (₹${(totalRevenue*0.42).toLocaleString('en-IN', {maximumFractionDigits:0})})</strong></div>
                <div style="width:100%; height:8px; background:#e2e8f0; border-radius:4px;"><div style="width:42%; height:100%; background:var(--primary); border-radius:4px;"></div></div>
              </div>
              <div>
                <div style="display:flex; justify-content:space-between; font-size:0.75rem; margin-bottom:0.15rem;"><span>General Medicine</span><strong>28% (₹${(totalRevenue*0.28).toLocaleString('en-IN', {maximumFractionDigits:0})})</strong></div>
                <div style="width:100%; height:8px; background:#e2e8f0; border-radius:4px;"><div style="width:28%; height:100%; background:var(--color-purple); border-radius:4px;"></div></div>
              </div>
              <div>
                <div style="display:flex; justify-content:space-between; font-size:0.75rem; margin-bottom:0.15rem;"><span>Pediatrics</span><strong>15% (₹${(totalRevenue*0.15).toLocaleString('en-IN', {maximumFractionDigits:0})})</strong></div>
                <div style="width:100%; height:8px; background:#e2e8f0; border-radius:4px;"><div style="width:15%; height:100%; background:var(--color-success); border-radius:4px;"></div></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Alerts Center -->
      <div class="card">
        <div class="card-header"><h3 class="card-title">Alerts & Compliance Center</h3></div>
        <div class="card-body" style="padding: 0.75rem; display: flex; flex-direction: column; gap: 0.75rem;">
          <div style="border-left: 4px solid var(--color-danger); background-color: var(--color-danger-bg); padding: 0.5rem; border-radius: 4px; font-size: 0.8rem;">
            <strong>⚠️ Critical Patient Alert</strong><br>
            2 Critical patients logged in CCU requiring ventilator checks.
          </div>
          <div style="border-left: 4px solid var(--color-warning); background-color: var(--color-warning-bg); padding: 0.5rem; border-radius: 4px; font-size: 0.8rem;">
            <strong>📋 Delayed Discharges</strong><br>
            4 Discharges pending billing settlements in Private Rooms.
          </div>
          <div style="border-left: 4px solid var(--color-info); background-color: var(--color-info-bg); padding: 0.5rem; border-radius: 4px; font-size: 0.8rem;">
            <strong>🛡️ Pending Claims</strong><br>
            12 TPA Pre-auth claims pending insurer validation.
          </div>
          <div style="border-left: 4px solid var(--color-danger); background-color: var(--color-danger-bg); padding: 0.5rem; border-radius: 4px; font-size: 0.8rem;">
            <strong>💊 Low Inventory alert</strong><br>
            Paracetamol stock below min reorder level in main pharmacy.
          </div>
        </div>
      </div>
    </div>
  `;
}

// ==========================================================================
// 2. ADMISSION DESK DASHBOARD
// ==========================================================================
function renderAdmissionDashboard(container) {
  const admittedCount = state.admissions.filter(a => a.status === 'Active').length;
  const totalBeds = Object.keys(state.bedsStatus).length;
  const vacantBeds = Object.values(state.bedsStatus).filter(b => b.status === "Available" || b.status === "Vacant").length;

  container.innerHTML = `
    <!-- KPI Cards -->
    <div class="stats-grid" style="margin-bottom: 1.5rem;">
      ${window.renderKPICard({
        id: 'admissions_today',
        title: "Today's Admissions",
        value: `${admittedCount} Patients`,
        subtext: 'IPD active roster',
        status: 'normal',
        trendText: '+4% vs yesterday',
        trendDirection: 'up',
        icon: '🛎️',
        iconBg: 'var(--primary-glow)',
        iconColor: 'var(--primary)',
        recordsCount: admittedCount
      })}
      ${window.renderKPICard({
        id: 'admissions_pending',
        title: 'Pending Admissions',
        value: '5',
        subtext: 'Advised in OPD EMR',
        status: 'warning',
        trendText: '+1 in queue',
        trendDirection: 'up',
        icon: '⏳',
        iconBg: 'var(--color-warning-bg)',
        iconColor: 'var(--color-warning)',
        recordsCount: 5
      })}
      ${window.renderKPICard({
        id: 'beds_available',
        title: 'Available Beds',
        value: `${vacantBeds} / ${totalBeds}`,
        subtext: 'Vacant slots',
        status: vacantBeds < 5 ? 'critical' : 'normal',
        trendText: '3 released today',
        trendDirection: 'up',
        icon: '🛏️',
        iconBg: 'var(--color-success-bg)',
        iconColor: 'var(--color-success)',
        recordsCount: vacantBeds
      })}
      ${window.renderKPICard({
        id: 'discharges_today',
        title: 'Discharges Today',
        value: '8',
        subtext: 'DC summaries approved',
        status: 'normal',
        trendText: '+2 vs yesterday',
        trendDirection: 'up',
        icon: '🚪',
        iconBg: 'var(--color-purple-bg)',
        iconColor: 'var(--color-purple)',
        recordsCount: 8
      })}
      ${window.renderKPICard({
        id: 'admissions_today',
        title: 'Emergency Admissions',
        value: state.admissions.filter(a => a.ward === 'EMERGENCY' && a.status === 'Active').length,
        subtext: 'Shifted from trauma',
        status: 'normal',
        trendText: 'Immediate action required',
        trendDirection: 'up',
        icon: '🚨',
        iconBg: 'var(--color-danger-bg)',
        iconColor: 'var(--color-danger)',
        recordsCount: state.admissions.filter(a => a.ward === 'EMERGENCY' && a.status === 'Active').length
      })}
      ${window.renderKPICard({
        id: 'admissions_pending',
        title: 'Avg Admission Time',
        value: '18 Mins',
        subtext: 'Onboarding workflow index',
        status: 'normal',
        trendText: '-2 mins vs last week',
        trendDirection: 'down',
        icon: '⏱️',
        iconBg: 'var(--color-info-bg)',
        iconColor: 'var(--color-info)',
        recordsCount: 4
      })}
    </div>

    <!-- Quick Actions -->
    <div style="background-color: var(--bg-surface); padding: 0.75rem 1rem; border-radius: var(--radius-md); border: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center; gap: 0.75rem; flex-wrap: wrap; margin-bottom: 1.5rem;">
      <div style="display: flex; gap: 0.75rem; flex-wrap: wrap; align-items: center;">
        <button class="btn btn-primary" onclick="router.navigate('registration-new')">New Registration</button>
        <button class="btn btn-primary" onclick="router.navigate('ipdAdmission')">Admit Patient</button>
        <button class="btn btn-secondary" onclick="window.openCompactTransferModal()">Transfer Patient</button>
        <button class="btn btn-secondary" onclick="alert('Printing blank admission form kits...')">Print Admission Forms</button>
        <button class="btn btn-secondary" onclick="router.navigate('insurance')">Insurance Verification</button>
      </div>
      ${window.renderDashboardSearchInline()}
    </div>

    <!-- Tables and Queue lists -->
    <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 1.5rem; margin-bottom: 1.5rem;">
      <!-- Recent Registrations -->
      <div class="card" style="margin-bottom: 0;">
        <div class="card-header" style="display: flex; justify-content: space-between; align-items: center; padding: 0.75rem 1rem; border-bottom: 1px solid var(--border-color);">
          <h3 class="card-title" style="font-size: 0.95rem; font-weight: 700; color: var(--text-primary); text-transform: uppercase; margin: 0;">Recent Registrations</h3>
          <div style="display: flex; align-items: center; gap: 0.75rem;">
            <div style="display: flex; align-items: center; gap: 0.35rem;">
              <label style="font-size: 0.78rem; color: var(--text-secondary); font-weight: 600;">Filter Type:</label>
              <select id="recent-reg-filter" class="facility-selector" style="font-size: 0.78rem; padding: 0.2rem 0.5rem; height: 28px; border-radius: 4px; border: 1px solid var(--border-color); background-color: var(--bg-surface); cursor: pointer;" onchange="window.filterRecentRegistrations(this.value)">
                <option value="All">All</option>
                <option value="OPD">OPD</option>
                <option value="IPD">IPD</option>
                <option value="Daycare">Daycare</option>
                <option value="Emergency">Emergency</option>
              </select>
            </div>
            <button class="btn btn-secondary btn-sm" style="padding: 0.25rem 0.75rem; border-radius: 4px; font-size: 0.8rem; border: 1px solid var(--border-color); background-color: var(--bg-surface); cursor: pointer;" onclick="router.navigate('registration')">View All</button>
          </div>
        </div>
        <div class="card-body" style="padding: 0; overflow-x: auto;">
          <table class="custom-table" style="font-size: 0.85rem; width: 100%;">
            <thead>
              <tr style="background-color: var(--bg-surface-elevated); border-bottom: 1px solid var(--border-color);">
                <th style="padding: 0.75rem 1rem; font-weight: 600; color: var(--text-muted); text-transform: uppercase; font-size: 0.72rem; text-align: left;">Patient ID</th>
                <th style="padding: 0.75rem 1rem; font-weight: 600; color: var(--text-muted); text-transform: uppercase; font-size: 0.72rem; text-align: left;">Name</th>
                <th style="padding: 0.75rem 1rem; font-weight: 600; color: var(--text-muted); text-transform: uppercase; font-size: 0.72rem; text-align: left;">Age/Sex</th>
                <th style="padding: 0.75rem 1rem; font-weight: 600; color: var(--text-muted); text-transform: uppercase; font-size: 0.72rem; text-align: left;">Type</th>
                <th style="padding: 0.75rem 1rem; font-weight: 600; color: var(--text-muted); text-transform: uppercase; font-size: 0.72rem; text-align: left;">Doctor</th>
                <th style="padding: 0.75rem 1rem; font-weight: 600; color: var(--text-muted); text-transform: uppercase; font-size: 0.72rem; text-align: left;">Status</th>
                <th style="padding: 0.75rem 1rem; font-weight: 600; color: var(--text-muted); text-transform: uppercase; font-size: 0.72rem; text-align: right;"></th>
              </tr>
            </thead>
            <tbody id="recent-regs-tbody">
              ${state.patients.filter(p => p.uhid.startsWith('MH-2026-')).sort((a, b) => b.uhid.localeCompare(a.uhid)).slice(0, 15).map(pat => {
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

                // Retrieve details dynamically based on patient type
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
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Admission Queues -->
      <div class="card" style="margin-bottom: 0;">
        <div class="card-header" style="padding: 0.75rem 1rem; border-bottom: 1px solid var(--border-color);"><h3 class="card-title" style="font-size: 0.95rem; font-weight: 700; color: var(--text-primary); text-transform: uppercase; margin: 0;">Admission Queues</h3></div>
        <div class="card-body" style="padding: 0.75rem; display: flex; flex-direction: column; gap: 0.75rem;">
          <div>
            <strong>Waiting Queue:</strong>
            <div style="font-size: 0.8rem; color: var(--text-secondary); background: var(--bg-surface-elevated); padding: 0.5rem; border-radius: 4px; margin-top: 0.25rem;">
              • Ramesh Chandra (GW bed advised)<br>
              • Seema Singh (Semi-Private advised)
            </div>
          </div>
          <div>
            <strong>Pending Documentation:</strong>
            <div style="font-size: 0.8rem; color: var(--text-secondary); background: var(--bg-surface-elevated); padding: 0.5rem; border-radius: 4px; margin-top: 0.25rem;">
              • Amit Patel (ABHA ID verification pending)<br>
              • site check consent forms unsigned
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

// ==========================================================================
// 3. DOCTOR DASHBOARD
// ==========================================================================
function renderDoctorDashboard(container) {
  const activeDocId = window.state?.activeDoctor || 'Dr. Amit Verma';
  const doctorObj = (window.state?.doctors || []).find(d => d.id === activeDocId) || { name: "Dr. Amit Verma", spec: "Pediatrics Consultant" };
  const docName = doctorObj.name;
  
  // Filter OPD appointments strictly by active doctor selection
  const opdList = state.appointments.filter(a => a.doctorName === docName);

  // Filter IPD admitted patients strictly by active doctor selection
  const ipdList = state.patients.filter(p => (p.status === 'Admitted' || p.status === 'Day Care') && p.primaryConsultant === docName);

  // Pull doctor clinical details
  const opdCount = state.appointments.filter(a => a.doctorName.includes('Kumar') || a.doctorName.includes('Abhishek')).length;
  
  // Select active patient details (Ramesh Chandra)
  const patient = state.patients.find(p => p.uhid === 'UHID20000001') || state.patients[0];

  container.innerHTML = `
    <!-- KPI Cards -->
    <div class="stats-grid" style="margin-bottom: 1.5rem;">
      ${window.renderKPICard({
        id: 'patients_today',
        title: 'Patients Today',
        value: `${opdCount + 2} Patients`,
        subtext: 'OPD Schedule load',
        status: 'normal',
        trendText: '+2 vs yesterday',
        trendDirection: 'up',
        icon: '👥',
        iconBg: 'var(--primary-glow)',
        iconColor: 'var(--primary)',
        recordsCount: opdCount + 2
      })}
      ${window.renderKPICard({
        id: 'patients_today',
        title: 'Consultations Pending',
        value: opdCount,
        subtext: 'Waiting in OPD lobby',
        status: 'warning',
        trendText: '-1 vs last hour',
        trendDirection: 'down',
        icon: '⌛',
        iconBg: 'var(--color-warning-bg)',
        iconColor: 'var(--color-warning)',
        recordsCount: opdCount
      })}
      ${window.renderKPICard({
        id: 'patients_critical',
        title: 'Critical Patients',
        value: '2',
        subtext: 'Bed board alerts',
        status: 'critical',
        trendText: 'Immediate check-in',
        trendDirection: 'neutral',
        icon: '🚨',
        iconBg: 'var(--color-danger-bg)',
        iconColor: 'var(--color-danger)',
        recordsCount: 2
      })}
      ${window.renderKPICard({
        id: 'lab_reviews_pending',
        title: 'Lab Results to Review',
        value: '4 Reports',
        subtext: 'LIS validated releases',
        status: 'normal',
        trendText: 'New results ready',
        trendDirection: 'up',
        icon: '🔬',
        iconBg: 'var(--color-success-bg)',
        iconColor: 'var(--color-success)',
        recordsCount: 4
      })}
      ${window.renderKPICard({
        id: 'discharges_today',
        title: 'Discharges Pending',
        value: '2',
        subtext: 'DC summary approvals',
        status: 'normal',
        trendText: 'Cleared by billing',
        trendDirection: 'neutral',
        icon: '🚪',
        iconBg: 'var(--color-purple-bg)',
        iconColor: 'var(--color-purple)',
        recordsCount: 2
      })}
      ${window.renderKPICard({
        id: 'patients_today',
        title: 'Follow-up Consults',
        value: '3',
        subtext: 'Booked for today',
        status: 'normal',
        trendText: 'Steady queue',
        trendDirection: 'neutral',
        icon: '🗓️',
        iconBg: 'var(--color-info-bg)',
        iconColor: 'var(--color-info)',
        recordsCount: 3
      })}
    </div>

    <!-- Quick Actions -->
    <div style="background-color: var(--bg-surface); padding: 0.75rem 1rem; border-radius: var(--radius-md); border: 1px solid var(--border-color); display: flex; justify-content: flex-end; align-items: center; gap: 0.75rem; flex-wrap: wrap; margin-bottom: 1.5rem;">
      ${window.renderDashboardSearchInline()}
    </div>

    <!-- Doctor Grid -->
    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem; margin-bottom: 1.5rem;">
      <!-- Column 1: OPD Appointment Queue -->
      <div class="card">
        <div class="card-header"><h3 class="card-title">📅 OPD Appointment Queue</h3></div>
        <div class="card-body" style="padding: 1.25rem;">
          <table class="custom-table" style="font-size: 0.85rem; width: 100%;">
            <thead>
              <tr>
                <th>Patient Details</th>
                <th>Time Slot</th>
                <th>Status</th>
                <th style="text-align: right;">Action</th>
              </tr>
            </thead>
            <tbody>
              ${opdList.slice(0, 4).map(appt => `
                <tr>
                  <td>
                    <div style="font-weight:600;"><a href="#patients?uhid=${appt.uhid}" class="patient-link">${appt.patientName}</a></div>
                    <div style="font-size:0.75rem; color:var(--text-muted);">${appt.uhid}</div>
                  </td>
                  <td><strong>${appt.time}</strong></td>
                  <td><strong style="color:var(--color-success);">${appt.status}</strong></td>
                  <td style="text-align: right;">
                    ${window.state?.activeUserRole === 'Doctor' ? `<button class="btn btn-primary" style="padding: 0.2rem 0.5rem; font-size: 0.75rem;" onclick="router.navigate('emr?uhid=${appt.uhid}')">Consult EMR</button>` : ''}
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Column 2: IPD Admitted Patients -->
      <div class="card">
        <div class="card-header"><h3 class="card-title">🛏️ IPD Patients</h3></div>
        <div class="card-body" style="padding: 1.25rem;">
          <table class="custom-table" style="font-size: 0.85rem; width: 100%;">
            <thead>
              <tr>
                <th>Patient Details</th>
                <th>Ward / Bed</th>
                <th>Status</th>
                <th style="text-align: right;">Action</th>
              </tr>
            </thead>
            <tbody>
              ${ipdList.slice(0, 4).map(pat => {
                const admission = state.admissions.find(a => a.uhid === pat.uhid && a.status === 'Active');
                const bedStr = admission ? `${admission.ward.replace('-WARD', '')} / ${admission.bed}` : 'Gen-Ward / 102';
                return `
                  <tr>
                    <td>
                      <div style="font-weight:600;"><a href="#patients?uhid=${pat.uhid}" class="patient-link">${pat.name}</a></div>
                      <div style="font-size:0.75rem; color:var(--text-muted);">${pat.uhid}</div>
                    </td>
                    <td><strong>${bedStr}</strong></td>
                    <td><span class="badge bg-success" style="color:#fff; padding:0.1rem 0.3rem; border-radius:3px; font-size:0.7rem;">admited</span></td>
                    <td style="text-align: right;">
                      <button class="btn btn-primary" style="padding: 0.2rem 0.5rem; font-size: 0.75rem;" onclick="router.navigate('patients?uhid=${pat.uhid}')">See Patient</button>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Column 3: Alerts/Reminders & Patient Profile Quickview (stacked) -->
      <div style="display: flex; flex-direction: column; gap: 1.5rem;">
        <!-- Alerts and Important Reminders Card -->
        <div class="card" style="border: 1px solid #fca5a5; background: #fffcfc;">
          <div class="card-header" style="background: #fee2e2; border-bottom: 1px solid #fca5a5;"><h3 class="card-title" style="color: #991b1b; font-weight: 700; display: flex; align-items: center; gap: 0.35rem;">🚨 Alerts & Reminders</h3></div>
          <div class="card-body" style="padding: 1.25rem; font-size: 0.85rem; display: flex; flex-direction: column; gap: 0.75rem;">
            <div style="display: flex; gap: 0.5rem; align-items: flex-start; padding: 0.5rem; background: #fff5f5; border-radius: 6px; border-left: 4px solid #ef4444; line-height: 1.4;">
              <span style="font-size: 1.1rem; line-height: 1;">⚠️</span>
              <div>
                <strong style="color: #ef4444;">Sepsis Warning</strong>: Patient <strong>Ramesh Chandra</strong> shows critical NEWS Score elevation (Score: 6). Prompt evaluation recommended.
              </div>
            </div>
            <div style="display: flex; gap: 0.5rem; align-items: flex-start; padding: 0.5rem; background: #fffcf0; border-radius: 6px; border-left: 4px solid #f59e0b; line-height: 1.4;">
              <span style="font-size: 1.1rem; line-height: 1;">🔬</span>
              <div>
                <strong>Lab Review</strong>: 3 biochemistry panels ready for review (Patient: <strong>Sunita Sharma</strong>).
              </div>
            </div>
            <div style="display: flex; gap: 0.5rem; align-items: flex-start; padding: 0.5rem; background: #eff6ff; border-radius: 6px; border-left: 4px solid #3b82f6; line-height: 1.4;">
              <span style="font-size: 1.1rem; line-height: 1;">📅</span>
              <div>
                <strong>Appointment Alert</strong>: Doctor session starting in 15 minutes. 4 patients checked-in.
              </div>
            </div>
          </div>
        </div>

        <!-- Patient Overview Widget (360 Details) -->
        <div class="card">
          <div class="card-header"><h3 class="card-title">Patient Profile Quickview</h3></div>
          <div class="card-body" style="font-size: 0.85rem; display: flex; flex-direction: column; gap: 0.75rem;">
            <div>
              <strong>Active Patient:</strong> <a href="#patients?uhid=${patient.uhid}" class="patient-link">${patient.name}</a> (${patient.uhid})
            </div>
            <div>
              <p><strong>Primary Diagnosis:</strong> ${patient.clinicalData.diagnosis}</p>
              <p><strong>Allergies:</strong> <span style="color:var(--color-danger); font-weight:500;">${patient.allergies}</span></p>
            </div>
            <div style="background-color: var(--bg-surface-elevated); padding: 0.75rem; border-radius: 6px;">
              <strong>Latest Recorded Vitals:</strong><br>
              BP: ${patient.vitals?.bp || '--'} | HR: ${patient.vitals?.hr || '--'} bpm | Temp: ${patient.vitals?.temp || '--'}°F | SpO2: ${patient.vitals?.spo2 || '--'}%
              <div style="margin-top:0.4rem; text-align:right;">
                <a href="javascript:void(0)" onclick="if (typeof window.openActionModal === 'function') { window.openActionModal('rec-vitals', '${patient.uhid}'); } else { alert('Vitals registration is accessible via Patients tab.'); }" style="font-size: 0.7rem; color: var(--primary); text-decoration: none; font-weight:600; cursor: pointer;">+ Record Vitals</a>
              </div>
            </div>
            <div>
              <strong>Prescribed Medications:</strong>
              <ul style="padding-left: 1.25rem; margin-top: 0.25rem;">
                ${patient.prescriptions.map(p => `<li>${p.drug} (${p.dose})</li>`).join('') || '<li>No active medications</li>'}
              </ul>
            </div>
            <div style="margin-top: 0.5rem; border-top: 1px solid var(--border-color); padding-top: 0.75rem;">
              <button class="btn btn-primary" style="width: 100%; height: 36px; background-color: #10b981; border: none; font-weight: 700; color: #fff; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 0.35rem;" onclick="router.navigate('${patient.status === 'Admitted' ? 'patients' : 'emr'}?uhid=${patient.uhid}')">
                <span>🩺 ${patient.status === 'Admitted' ? 'See Patient' : 'Consult Now'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

// ==========================================================================
// 4. NURSE DASHBOARD
// ==========================================================================
function renderNurseDashboard(container) {
  const admitted = state.patients.filter(p => p.status === 'Admitted' || p.status === 'Day Care');

  container.innerHTML = `
    <!-- KPI Cards -->
    <div class="stats-grid" style="margin-bottom: 1.5rem;">
      ${window.renderKPICard({
        id: 'patients_today',
        title: 'Assigned Patients',
        value: `${admitted.length} Inpatients`,
        subtext: 'Active Ward shift load',
        status: 'normal',
        trendText: 'Patient roster',
        trendDirection: 'neutral',
        icon: '👩‍⚕️',
        iconBg: 'var(--primary-glow)',
        iconColor: 'var(--primary)',
        recordsCount: admitted.length
      })}
      ${window.renderKPICard({
        id: 'medication_due',
        title: 'Medications Due',
        value: '4 Patients',
        subtext: 'Scheduled hourly slots',
        status: 'warning',
        trendText: 'Next run in 15m',
        trendDirection: 'neutral',
        icon: '💊',
        iconBg: 'var(--color-warning-bg)',
        iconColor: 'var(--color-warning)',
        recordsCount: 4
      })}
      ${window.renderKPICard({
        id: 'critical_alerts',
        title: 'Critical Alerts',
        value: '2',
        subtext: 'Vitals parameters warnings',
        status: 'critical',
        trendText: 'Immediate action',
        trendDirection: 'neutral',
        icon: '🚨',
        iconBg: 'var(--color-danger-bg)',
        iconColor: 'var(--color-danger)',
        recordsCount: 2
      })}
      ${window.renderKPICard({
        id: 'medication_due',
        title: 'Pending Procedures',
        value: '3',
        subtext: 'Wound dress, IV line starts',
        status: 'normal',
        trendText: 'Routine shift tasks',
        trendDirection: 'neutral',
        icon: '🩹',
        iconBg: 'var(--color-info-bg)',
        iconColor: 'var(--color-info)',
        recordsCount: 3
      })}
      ${window.renderKPICard({
        id: 'occupancy_rate',
        title: 'Ward Bed Occupancy',
        value: '85%',
        subtext: 'General & semi-private wards',
        status: 'warning',
        trendText: 'High occupancy',
        trendDirection: 'up',
        icon: '🛏️',
        iconBg: 'var(--color-purple-bg)',
        iconColor: 'var(--color-purple)',
        recordsCount: 6
      })}
      ${window.renderKPICard({
        id: 'critical_alerts',
        title: 'Shift Handover items',
        value: '2 Records',
        subtext: 'Pending handover signoff',
        status: 'normal',
        trendText: 'Ready for next shift',
        trendDirection: 'neutral',
        icon: '📋',
        iconBg: 'var(--color-purple-bg)',
        iconColor: 'var(--color-purple)',
        recordsCount: 2
      })}
    </div>

    <!-- Quick Actions -->
    <div style="background-color: var(--bg-surface); padding: 0.75rem 1rem; border-radius: var(--radius-md); border: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center; gap: 0.75rem; flex-wrap: wrap; margin-bottom: 1.5rem;">
      <div style="display: flex; gap: 0.75rem; flex-wrap: wrap; align-items: center;">
        <button class="btn btn-primary" onclick="router.navigate('emr')">Record Vitals</button>
        <button class="btn btn-secondary" onclick="router.navigate('pharmacy')">Administer Medication</button>
        <button class="btn btn-secondary" onclick="router.navigate('emr')">Update Nursing Notes</button>
        <button class="btn btn-secondary" onclick="alert('Notifying consultant on-call...')">Request Doctor Review</button>
        <button class="btn btn-secondary" onclick="window.openCompactTransferModal()">Transfer Patient</button>
      </div>
      ${window.renderDashboardSearchInline()}
    </div>

    <!-- Ward Overview Table -->
    <div class="card">
      <div class="card-header"><h3 class="card-title">Inpatient Shift & Ward Overview</h3></div>
      <div class="card-body">
        <table class="custom-table" style="font-size: 0.85rem;">
          <thead>
            <tr>
              <th>Room / Bed No.</th>
              <th>Patient Details (UHID)</th>
              <th>attending consultant</th>
              <th>Triage Risk</th>
              <th>Last Vital Time</th>
              <th>Next Med Slot</th>
              <th style="text-align: right;">Action</th>
            </tr>
          </thead>
          <tbody>
            ${admitted.slice(0, 4).map(pat => {
              const admission = state.admissions.find(a => a.uhid === pat.uhid && a.status === 'Active');
              const isCrit = pat.vitals && pat.vitals.hr > 95;
              return `
                <tr>
                  <td><strong>${admission ? `${admission.ward.replace('-WARD', '')} / ${admission.bed}` : 'EMG-01'}</strong></td>
                  <td>
                    <div style="font-weight:600;"><a href="#patients?uhid=${pat.uhid}" class="patient-link">${pat.name}</a></div>
                    <div style="font-size:0.75rem; color:var(--text-muted);">${pat.uhid}</div>
                  </td>
                  <td>${pat.primaryConsultant}</td>
                  <td>
                    <span class="badge ${isCrit ? 'bg-danger' : 'bg-success'}" style="color:#fff; padding:0.1rem 0.3rem; border-radius:3px;">
                      ${isCrit ? 'CRITICAL' : 'STABLE'}
                    </span>
                  </td>
                  <td>12:30 PM (BP: ${pat.vitals?.bp || '--'})</td>
                  <td><strong>02:00 PM</strong></td>
                  <td style="text-align: right;">
                    <button class="btn btn-secondary" style="padding: 0.2rem 0.5rem; font-size: 0.75rem;" onclick="router.navigate('emr?uhid=${pat.uhid}')">Log Shift</button>
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
// 5. BILLING EXECUTIVE DASHBOARD
// ==========================================================================
function renderBillingDashboard(container) {
  let settledRev = 0;
  state.billing.forEach(b => settledRev += b.paid);
  
  let outstandingBal = 0;
  state.billing.forEach(b => outstandingBal += (b.amount - b.paid));

  container.innerHTML = `
    <!-- KPI Cards -->
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
  const labOrders = state.orders.filter(o => o.type === 'Laboratory');

  container.innerHTML = `
    <!-- KPI Cards -->
    <div class="stats-grid" style="margin-bottom: 1.5rem;">
      ${window.renderKPICard({
        id: 'tests_ordered_today',
        title: 'Tests Ordered Today',
        value: `${labOrders.length} Tests`,
        subtext: 'OPD & IPD clinical releases',
        status: 'normal',
        trendText: '+10% vs yesterday',
        trendDirection: 'up',
        icon: '🧪',
        iconBg: 'var(--primary-glow)',
        iconColor: 'var(--primary)',
        recordsCount: labOrders.length
      })}
      ${window.renderKPICard({
        id: 'tests_ordered_today',
        title: 'Samples Collected',
        value: `${labOrders.filter(o => o.status === 'Sample Collected').length} Samples`,
        subtext: 'Tube labels printed',
        status: 'normal',
        trendText: 'In queue for analyzer',
        trendDirection: 'neutral',
        icon: '🔬',
        iconBg: 'var(--color-warning-bg)',
        iconColor: 'var(--color-warning)',
        recordsCount: labOrders.filter(o => o.status === 'Sample Collected').length
      })}
      ${window.renderKPICard({
        id: 'tests_ordered_today',
        title: 'Tests In Progress',
        value: '2',
        subtext: 'Analyzer cycle runs',
        status: 'normal',
        trendText: 'Running in LIS',
        trendDirection: 'neutral',
        icon: '⚙️',
        iconBg: 'var(--color-purple-bg)',
        iconColor: 'var(--color-purple)',
        recordsCount: 2
      })}
      ${window.renderKPICard({
        id: 'lab_results_critical',
        title: 'Critical Results',
        value: '1',
        subtext: 'Abnormal alerts flagged',
        status: 'critical',
        trendText: 'Immediate physician alert',
        trendDirection: 'neutral',
        icon: '🚨',
        iconBg: 'var(--color-danger-bg)',
        iconColor: 'var(--color-danger)',
        recordsCount: 1
      })}
      ${window.renderKPICard({
        id: 'lab_results_critical',
        title: 'Awaiting Validation',
        value: `${labOrders.filter(o => o.status === 'Result Entered').length} Reports`,
        subtext: 'Pathologist sign-off pending',
        status: 'warning',
        trendText: 'Pending signature',
        trendDirection: 'neutral',
        icon: '🖋️',
        iconBg: 'var(--color-warning-bg)',
        iconColor: 'var(--color-warning)',
        recordsCount: labOrders.filter(o => o.status === 'Result Entered').length
      })}
      ${window.renderKPICard({
        id: 'tests_ordered_today',
        title: 'Reports Released',
        value: `${labOrders.filter(o => o.status === 'Approved').length} Released`,
        subtext: 'Validated EMR releases',
        status: 'normal',
        trendText: '+15% release speed',
        trendDirection: 'up',
        icon: '✅',
        iconBg: 'var(--color-success-bg)',
        iconColor: 'var(--color-success)',
        recordsCount: labOrders.filter(o => o.status === 'Approved').length
      })}
    </div>

    <!-- Quick Actions -->
    <div style="background-color: var(--bg-surface); padding: 0.75rem 1rem; border-radius: var(--radius-md); border: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center; gap: 0.75rem; flex-wrap: wrap; margin-bottom: 1.5rem;">
      <div style="display: flex; gap: 0.75rem; flex-wrap: wrap; align-items: center;">
        <button class="btn btn-primary" onclick="router.navigate('lab')">Collect Sample</button>
        <button class="btn btn-secondary" onclick="router.navigate('lab')">Start Processing</button>
        <button class="btn btn-secondary" onclick="router.navigate('lab')">Validate Report</button>
        <button class="btn btn-secondary" onclick="router.navigate('lab')">Release Report</button>
        <button class="btn btn-danger" onclick="alert('Triggering sample collection alert...')">Recollect Sample</button>
      </div>
      ${window.renderDashboardSearchInline()}
    </div>

    <!-- Lab Worklist -->
    <div class="card">
      <div class="card-header"><h3 class="card-title">LIS Worklist & Sample Queue</h3></div>
      <div class="card-body">
        <table class="custom-table" style="font-size: 0.85rem;">
          <thead>
            <tr>
              <th>Specimen ID</th>
              <th>Patient Name</th>
              <th>Test Ordered</th>
              <th>Collection Date</th>
              <th>LIS Status</th>
              <th>Technician</th>
              <th style="text-align: right;">Process Specimen</th>
            </tr>
          </thead>
          <tbody>
            ${labOrders.slice(0, 4).map(o => `
              <tr>
                <td><code>SPEC-${o.id}</code></td>
                <td><a href="#patients?uhid=${o.uhid}" class="patient-link">${o.patientName}</a><br><small style="color:var(--text-muted);">${o.uhid}</small></td>
                <td>${o.name}</td>
                <td>${o.date}</td>
                <td><strong style="color:${o.status === 'Approved' ? 'var(--color-success)' : 'var(--color-warning)'};">${o.status}</strong></td>
                <td>Lab Tech Amit</td>
                <td style="text-align: right;">
                  <button class="btn btn-secondary" style="padding: 0.2rem 0.5rem; font-size: 0.75rem;" onclick="router.navigate('lab')">Open Specimen</button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

// ==========================================================================
// 7. PHARMACY DASHBOARD
// ==========================================================================
function renderPharmacyDashboard(container) {
  const patientRxCount = state.patients.filter(p => p.prescriptions && p.prescriptions.length > 0).length;
  const lowStock = state.inventory.pharmacy.filter(item => item.stock < item.minStock).length;

  container.innerHTML = `
    <!-- KPI Cards -->
    <div class="stats-grid" style="margin-bottom: 1.5rem;">
      ${window.renderKPICard({
        id: 'pharmacy_stock_low',
        title: 'Prescriptions Today',
        value: `${patientRxCount + 3} Orders`,
        subtext: 'OPD & IPD queues',
        status: 'normal',
        trendText: 'Active prescribing',
        trendDirection: 'neutral',
        icon: '📋',
        iconBg: 'var(--primary-glow)',
        iconColor: 'var(--primary)',
        recordsCount: patientRxCount + 3
      })}
      ${window.renderKPICard({
        id: 'pharmacy_stock_low',
        title: 'Medicines Dispensed',
        value: '42 Packs',
        subtext: 'Daily drug logs',
        status: 'normal',
        trendText: 'Dispatched to wards',
        trendDirection: 'neutral',
        icon: '💊',
        iconBg: 'var(--color-success-bg)',
        iconColor: 'var(--color-success)',
        recordsCount: 42
      })}
      ${window.renderKPICard({
        id: 'pharmacy_stock_low',
        title: 'Low Stock Items',
        value: `${lowStock} Drugs`,
        subtext: 'Below min threshold',
        status: 'critical',
        trendText: 'Needs replenishment',
        trendDirection: 'neutral',
        icon: '⚠️',
        iconBg: 'var(--color-danger-bg)',
        iconColor: 'var(--color-danger)',
        recordsCount: lowStock
      })}
      ${window.renderKPICard({
        id: 'pharmacy_expiry_near',
        title: 'Expiring Medicines',
        value: '2 Items',
        subtext: 'Approaching 90 days threshold',
        status: 'warning',
        trendText: 'Action required',
        trendDirection: 'neutral',
        icon: '⌛',
        iconBg: 'var(--color-warning-bg)',
        iconColor: 'var(--color-warning)',
        recordsCount: 2
      })}
      ${window.renderKPICard({
        id: 'pharmacy_stock_low',
        title: 'Inventory Valuation',
        value: '₹8.4 Lakhs',
        subtext: 'Formulary stock value',
        status: 'normal',
        trendText: 'Stable valuation',
        trendDirection: 'neutral',
        icon: '💵',
        iconBg: 'var(--color-info-bg)',
        iconColor: 'var(--color-info)',
        recordsCount: 0
      })}
      ${window.renderKPICard({
        id: 'pharmacy_stock_low',
        title: 'PO Pending',
        value: '3 Orders',
        subtext: 'Vendor restock batches',
        status: 'normal',
        trendText: 'Awaiting delivery',
        trendDirection: 'neutral',
        icon: '📥',
        iconBg: 'var(--color-purple-bg)',
        iconColor: 'var(--color-purple)',
        recordsCount: 3
      })}
    </div>

    <!-- Quick Actions -->
    <div style="background-color: var(--bg-surface); padding: 0.75rem 1rem; border-radius: var(--radius-md); border: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center; gap: 0.75rem; flex-wrap: wrap; margin-bottom: 1.5rem;">
      <div style="display: flex; gap: 0.75rem; flex-wrap: wrap; align-items: center;">
        <button class="btn btn-primary" onclick="router.navigate('pharmacy')">Dispense Medicine</button>
        <button class="btn btn-secondary" onclick="router.navigate('pharmacy')">Verify Prescription</button>
        <button class="btn btn-secondary" onclick="router.navigate('pharmacy')">Add Inventory</button>
        <button class="btn btn-secondary" onclick="alert('Creating vendor purchase order...')">Create Purchase Order</button>
        <button class="btn btn-danger" onclick="alert('Returning medication batch...')">Return Medication</button>
      </div>
      ${window.renderDashboardSearchInline()}
    </div>

    <!-- Inventory Table -->
    <div class="card">
      <div class="card-header"><h3 class="card-title">Pharmacy Stock Levels & Batch Expiries</h3></div>
      <div class="card-body">
        <table class="custom-table" style="font-size: 0.85rem;">
          <thead>
            <tr>
              <th>Medicine Name</th>
              <th>Batch Number</th>
              <th>Available Stock</th>
              <th>Expiry Date</th>
              <th>Reorder Level</th>
              <th>Supplier Vendor</th>
            </tr>
          </thead>
          <tbody>
            ${state.inventory.pharmacy.slice(0, 4).map(item => `
              <tr>
                <td><strong>${item.name}</strong><br><small style="color:var(--text-muted);">${item.category}</small></td>
                <td><code>B-${item.code}</code></td>
                <td>${item.stock} Units</td>
                <td>${item.expiry}</td>
                <td>${item.minStock} Units</td>
                <td>Cipla Pharmaceuticals India</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

// ==========================================================================
// DRILLDOWN WORKSPACE & HIERARCHICAL DRILLDOWN RENDERERS
// ==========================================================================
window.renderKPICard = function({
  id,
  title,
  value,
  subtext,
  status, // 'normal' | 'warning' | 'critical'
  trendText, // e.g. '+8% compared to yesterday'
  trendDirection, // 'up' | 'down' | 'neutral'
  icon,
  iconBg,
  iconColor,
  recordsCount
}) {
  const trendClass = trendDirection === 'up' ? 'up' : (trendDirection === 'down' ? 'down' : '');
  const trendIcon = trendDirection === 'up' ? '▲' : (trendDirection === 'down' ? '▼' : '—');
  
  return `
    <div class="kpi-card status-${status}" onclick="router.navigate('dashboard?kpi=${id}')">
      <div class="kpi-header">
        <span class="kpi-title">${title}</span>
        <span class="kpi-icon" style="background-color: ${iconBg}; color: ${iconColor};">${icon}</span>
      </div>
      <div class="kpi-body">
        <span class="kpi-value">${value}</span>
        <span class="kpi-subtext">${subtext}</span>
      </div>
      <div class="kpi-footer">
        <span class="kpi-trend ${trendClass}">${trendIcon} ${trendText}</span>
        <span class="kpi-timestamp">Updated just now</span>
      </div>
      <div class="kpi-hover-overlay">
        <span>Click to view ${recordsCount} patient records →</span>
      </div>
    </div>
  `;
};

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
