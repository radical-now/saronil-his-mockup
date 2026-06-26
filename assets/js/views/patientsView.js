/* ==========================================================================
   SARONIL HMS - CONSOLIDATED PATIENT DETAILS & CORE WORKSPACE (patientsView.js)
   ========================================================================== */

window.views.patients = function(container, subAnchor, params) {
  const activeUhid = params.uhid;
  
  if (activeUhid) {
    const patient = state.patients.find(p => p.uhid === activeUhid);
    ensurePatientEMRInitialized(patient);
    renderPatient360Profile(container, patient, subAnchor || 'overview');
  } else {
    renderMasterPatientRegistry(container);
  }
};

// --------------------------------------------------------------------------
// 1. MASTER PATIENT REGISTRY (DASHBOARD ROSTER)
// --------------------------------------------------------------------------
function renderMasterPatientRegistry(container) {
  window.activeRegistryTab = 'all';

  const ipdCount = state.patients.filter(p => p.type === 'IPD' && p.status !== 'Registered').length;
  const opdCount = state.patients.filter(p => p.type === 'OPD' && p.status !== 'Registered').length;
  const emgCount = state.patients.filter(p => p.type === 'Emergency' && p.status !== 'Registered').length;
  const dcCount = state.patients.filter(p => (p.type === 'Daycare' || p.type === 'Day Care') && p.status !== 'Registered').length;
  const upcomingCount = state.patients.filter(p => p.status === 'Scheduled').length;
  const dischargedCount = state.patients.filter(p => p.dischargedToday === true).length;

  container.innerHTML = `
    <style>
      .stats-grid {
        display: grid;
        grid-template-columns: repeat(7, 1fr);
        gap: 0.75rem;
        margin-bottom: 1.5rem;
      }
      @media (max-width: 1400px) {
        .stats-grid {
          grid-template-columns: repeat(4, 1fr);
        }
      }
      @media (max-width: 900px) {
        .stats-grid {
          grid-template-columns: repeat(3, 1fr);
        }
      }
      @media (max-width: 600px) {
        .stats-grid {
          grid-template-columns: repeat(2, 1fr);
        }
      }
      @media (max-width: 400px) {
        .stats-grid {
          grid-template-columns: repeat(1, 1fr);
        }
      }
      
      .kpi-card {
        position: relative;
        background-color: var(--bg-surface);
        border: 1px solid var(--border-color);
        border-radius: var(--radius-md);
        padding: 1.25rem;
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        box-shadow: var(--shadow-sm);
        transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
        cursor: pointer;
        overflow: hidden;
        min-height: 120px;
      }
      .kpi-card:hover {
        transform: translateY(-4px);
        box-shadow: var(--shadow-lg);
        border-color: var(--primary);
      }
      .kpi-card.status-normal {
        border-left: 4px solid var(--color-success);
      }
      .kpi-card.status-warning {
        border-left: 4px solid var(--color-warning);
      }
      .kpi-card.status-critical {
        border-left: 4px solid var(--color-danger);
      }
      .kpi-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        width: 100%;
      }
      .kpi-title {
        font-size: 0.75rem;
        font-weight: 700;
        text-transform: uppercase;
        color: var(--text-muted);
      }
      .kpi-icon {
        width: 28px;
        height: 28px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0.9rem;
      }
      .kpi-body {
        display: flex;
        flex-direction: column;
        gap: 0.15rem;
      }
      .kpi-value {
        font-size: 1.8rem;
        font-weight: 800;
        color: var(--text-primary);
        line-height: 1.1;
      }
      .kpi-subtext {
        font-size: 0.72rem;
        color: var(--text-muted);
      }
      
      .tab-btn-link {
        background: var(--bg-surface-elevated);
        border: 1px solid var(--border-color);
        padding: 0.35rem 0.85rem;
        font-size: 0.82rem;
        font-weight: 500;
        cursor: pointer;
        color: var(--text-secondary);
        display: flex;
        align-items: center;
        gap: 0.35rem;
        border-radius: 20px;
        transition: all 0.25s ease;
      }
      .tab-btn-link.active {
        background: var(--bg-surface);
        border-color: #3b82f6 !important;
        color: #2563eb !important;
        font-weight: 600 !important;
        box-shadow: 0 1px 3px rgba(37, 99, 235, 0.1);
      }
      
      .tab-btn-link:hover {
        border-color: #3b82f6;
        color: #2563eb;
      }
      
      .patient-avatar-circle {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        color: #fff;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 700;
        font-size: 0.78rem;
        box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      }
      
      .badge-type-ipd {
        background-color: #f3e8ff;
        color: #7c3aed;
        font-weight: 600;
        padding: 0.15rem 0.45rem;
        border-radius: 12px;
        font-size: 0.72rem;
      }
      .badge-type-opd {
        background-color: #dbeafe;
        color: #2563eb;
        font-weight: 600;
        padding: 0.15rem 0.45rem;
        border-radius: 12px;
        font-size: 0.72rem;
      }
      .badge-type-er {
        background-color: #fee2e2;
        color: #dc2626;
        font-weight: 600;
        padding: 0.15rem 0.45rem;
        border-radius: 12px;
        font-size: 0.72rem;
      }
      .badge-type-dc {
        background-color: #ffedd5;
        color: #ea580c;
        font-weight: 600;
        padding: 0.15rem 0.45rem;
        border-radius: 12px;
        font-size: 0.72rem;
      }
    </style>

    <!-- Stats Banner -->
    <div class="stats-grid">
      <!-- 1. Total Patients -->
      <div class="kpi-card status-normal" onclick="window.filterPatientsByCard('all')">
        <div class="kpi-header">
          <span class="kpi-title">Total Patients</span>
          <span class="kpi-icon" style="background-color: var(--primary-glow); color: var(--primary);">👥</span>
        </div>
        <div class="kpi-body">
          <span class="kpi-value">${state.patients.length}</span>
          <span class="kpi-subtext">All time registered</span>
        </div>
      </div>

      <!-- 2. IPD Today -->
      <div class="kpi-card status-normal" onclick="window.filterPatientsByCard('IPD')">
        <div class="kpi-header">
          <span class="kpi-title">IPD Today</span>
          <span class="kpi-icon" style="background-color: #f3e8ff; color: #7c3aed;">🏥</span>
        </div>
        <div class="kpi-body">
          <span class="kpi-value">${ipdCount}</span>
          <span class="kpi-subtext">Active inpatients</span>
        </div>
      </div>

      <!-- 3. OPD Today -->
      <div class="kpi-card status-normal" onclick="window.filterPatientsByCard('OPD')">
        <div class="kpi-header">
          <span class="kpi-title">OPD Today</span>
          <span class="kpi-icon" style="background-color: #dbeafe; color: #2563eb;">🩺</span>
        </div>
        <div class="kpi-body">
          <span class="kpi-value">${opdCount}</span>
          <span class="kpi-subtext">Outpatient visits</span>
        </div>
      </div>

      <!-- 4. Upcoming OPD -->
      <div class="kpi-card status-normal" onclick="window.filterPatientsByCard('Upcoming')">
        <div class="kpi-header">
          <span class="kpi-title">Upcoming OPD</span>
          <span class="kpi-icon" style="background-color: #eff6ff; color: #1d4ed8;">📅</span>
        </div>
        <div class="kpi-body">
          <span class="kpi-value">${upcomingCount}</span>
          <span class="kpi-subtext">Scheduled appts</span>
        </div>
      </div>

      <!-- 5. Day Care -->
      <div class="kpi-card status-warning" onclick="window.filterPatientsByCard('Daycare')">
        <div class="kpi-header">
          <span class="kpi-title">Day Care</span>
          <span class="kpi-icon" style="background-color: #ffedd5; color: #ea580c;">🕒</span>
        </div>
        <div class="kpi-body">
          <span class="kpi-value">${dcCount}</span>
          <span class="kpi-subtext">Active day cases</span>
        </div>
      </div>

      <!-- 6. Emergency -->
      <div class="kpi-card status-critical" onclick="window.filterPatientsByCard('Emergency')">
        <div class="kpi-header">
          <span class="kpi-title">Emergency</span>
          <span class="kpi-icon" style="background-color: #fee2e2; color: #dc2626;">🚨</span>
        </div>
        <div class="kpi-body">
          <span class="kpi-value">${emgCount}</span>
          <span class="kpi-subtext">Active ER cases</span>
        </div>
      </div>

      <!-- 7. Discharged Today -->
      <div class="kpi-card status-normal" onclick="window.filterPatientsByCard('Discharged')">
        <div class="kpi-header">
          <span class="kpi-title">Discharged Today</span>
          <span class="kpi-icon" style="background-color: #ecfdf5; color: #10b981;">✅</span>
        </div>
        <div class="kpi-body">
          <span class="kpi-value">${dischargedCount}</span>
          <span class="kpi-subtext">Discharged patients</span>
        </div>
      </div>
    </div>

    <!-- Main Card container -->
    <div class="card" style="box-shadow: var(--shadow-sm); border: 1px solid var(--border-color); border-radius: 8px;">
      <div class="card-body" style="padding: 1.25rem;">
        
        <!-- Search and filters row -->
        <div style="display: flex; gap: 0.5rem; align-items: center; margin-bottom: 1.25rem; flex-wrap: wrap; width: 100%;">
          <div style="position: relative; flex-grow: 1; min-width: 250px;">
            <span style="position: absolute; left: 12px; top: 50%; transform: translateY(-50%); font-size: 0.82rem; color: var(--text-muted);">🔍</span>
            <input type="text" id="m-search" class="form-control" placeholder="Search by UHID, MRN, Name, Mobile, Aadhaar, ABHA ID..." style="padding-left: 2.2rem; font-size: 0.82rem; height: 38px; border-radius: 6px;">
          </div>
          
          <!-- Removed redundant All Types dropdown since tabs serve the same purpose -->

          <select id="m-dept" class="form-select" style="width: auto; height: 38px; font-size: 0.82rem; min-width: 140px; border-radius: 6px; cursor: pointer;">
            <option value="">All Departments</option>
            <option value="Cardiology">Cardiology</option>
            <option value="General Medicine">General Medicine</option>
            <option value="Pediatrics">Pediatrics</option>
            <option value="Psychiatry">Psychiatry</option>
            <option value="Neurology">Neurology</option>
            <option value="General Surgery">General Surgery</option>
          </select>

          <select id="m-doctor" class="form-select" style="width: auto; height: 38px; font-size: 0.82rem; min-width: 120px; border-radius: 6px; cursor: pointer;">
            <option value="">All Doctors</option>
            ${state.doctors.map(d => `<option value="${d.name}">${d.name} (${d.spec})</option>`).join('')}
          </select>

          <select id="m-ward" class="form-select" style="width: auto; height: 38px; font-size: 0.82rem; min-width: 110px; border-radius: 6px; cursor: pointer;">
            <option value="">All Wards</option>
            <option value="Ward A">Ward A</option>
            <option value="Ward B">Ward B</option>
            <option value="Emergency Bay">Emergency Bay</option>
            <option value="Day Care Unit">Day Care Unit</option>
          </select>

          <select id="m-insurance" class="form-select" style="width: auto; height: 38px; font-size: 0.82rem; min-width: 120px; border-radius: 6px; cursor: pointer;">
            <option value="">All Insurance</option>
            <option value="Star Health">Star Health</option>
            <option value="United India">United India</option>
            <option value="HDFC Ergo">HDFC Ergo</option>
            <option value="New India">New India</option>
            <option value="Cash">Cash</option>
          </select>

          <select id="m-date-filter" class="form-select" style="width: auto; height: 38px; font-size: 0.82rem; min-width: 100px; border-radius: 6px; cursor: pointer;">
            <option value="Today">Today</option>
            <option value="All Time">All Time</option>
          </select>

          <button class="btn btn-secondary" style="height: 38px; font-size: 0.82rem; padding: 0 0.75rem; border-radius: 6px; cursor: pointer; display: flex; align-items: center; gap: 0.25rem; border: 1px solid #bfdbfe; color: #2563eb; background: #eff6ff; font-weight: 500;">+ More Filters</button>
        </div>

        <!-- Tabs & Results row -->
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-color); margin-bottom: 1rem; flex-wrap: wrap; gap: 0.5rem; padding-bottom: 0.25rem; width: 100%;">
          <div style="display: flex; gap: 0.25rem; flex-wrap: wrap;" id="m-tabs-container">
            <button class="tab-btn-link active" data-filter="all" onclick="window.switchRegistryFilterTab(this, 'all')">All Patients</button>
            <button class="tab-btn-link" data-filter="IPD" onclick="window.switchRegistryFilterTab(this, 'IPD')">IPD <span class="badge" style="background: #f3e8ff; color: #7c3aed; font-size: 0.68rem; padding: 1px 5px; border-radius: 10px;">${ipdCount}</span></button>
            <button class="tab-btn-link" data-filter="OPD" onclick="window.switchRegistryFilterTab(this, 'OPD')">OPD <span class="badge" style="background: #dbeafe; color: #2563eb; font-size: 0.68rem; padding: 1px 5px; border-radius: 10px;">${opdCount}</span></button>
            <button class="tab-btn-link" data-filter="Emergency" onclick="window.switchRegistryFilterTab(this, 'Emergency')">Emergency <span class="badge" style="background: #fee2e2; color: #dc2626; font-size: 0.68rem; padding: 1px 5px; border-radius: 10px;">${emgCount}</span></button>
            <button class="tab-btn-link" data-filter="Daycare" onclick="window.switchRegistryFilterTab(this, 'Daycare')">Day Care <span class="badge" style="background: #ffedd5; color: #ea580c; font-size: 0.68rem; padding: 1px 5px; border-radius: 10px;">${dcCount}</span></button>
            <button class="tab-btn-link" data-filter="Upcoming" onclick="window.switchRegistryFilterTab(this, 'Upcoming')">Upcoming Appts <span class="badge" style="background: #eff6ff; color: #1d4ed8; font-size: 0.68rem; padding: 1px 5px; border-radius: 10px;">${upcomingCount}</span></button>
            <button class="tab-btn-link" data-filter="Discharged" onclick="window.switchRegistryFilterTab(this, 'Discharged')">Discharged Today <span class="badge" style="background: #ecfdf5; color: #10b981; font-size: 0.68rem; padding: 1px 5px; border-radius: 10px;">${dischargedCount}</span></button>
          </div>
          <div style="display: flex; align-items: center; gap: 1rem; font-size: 0.8rem; color: var(--text-muted);">
            <span id="m-results-count" style="font-weight: 500;">0 results</span>
            <button class="btn btn-secondary btn-sm" style="padding: 0.25rem 0.5rem; font-size: 0.75rem; border-radius: 4px; cursor: pointer; display: flex; align-items: center; gap: 0.25rem; height: 28px; border: 1px solid var(--border-color); background: var(--bg-surface-elevated); color: var(--text-secondary);"><span style="font-size: 0.7rem; color: #9ca3af;">🔳</span> Columns</button>
          </div>
        </div>

        <!-- Master Data Table -->
        <div class="custom-table-container" style="overflow-y: visible; max-height: none;">
          <table class="custom-table" style="font-size: 0.82rem; width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="border-bottom: 1px solid var(--border-color); text-align: left;">
                <th style="width: 40px; padding: 0.75rem 0.5rem;"><input type="checkbox" id="m-select-all" onclick="toggleSelectAllRegistry(this.checked)" style="cursor: pointer;"></th>
                <th style="padding: 0.75rem 0.5rem; font-weight: 600; color: var(--text-secondary); font-size: 0.68rem; text-transform: uppercase; letter-spacing: 0.05em;">PATIENT</th>
                <th style="padding: 0.75rem 0.5rem; font-weight: 600; color: var(--text-secondary); font-size: 0.68rem; text-transform: uppercase; letter-spacing: 0.05em;">AGE / SEX</th>
                <th style="padding: 0.75rem 0.5rem; font-weight: 600; color: var(--text-secondary); font-size: 0.68rem; text-transform: uppercase; letter-spacing: 0.05em;">VISIT TYPE</th>
                <th style="padding: 0.75rem 0.5rem; font-weight: 600; color: var(--text-secondary); font-size: 0.68rem; text-transform: uppercase; letter-spacing: 0.05em;">DEPARTMENT / DOCTOR</th>
                <th style="padding: 0.75rem 0.5rem; font-weight: 600; color: var(--text-secondary); font-size: 0.68rem; text-transform: uppercase; letter-spacing: 0.05em;">WARD / BED</th>
                <th style="padding: 0.75rem 0.5rem; font-weight: 600; color: var(--text-secondary); font-size: 0.68rem; text-transform: uppercase; letter-spacing: 0.05em;">PAYMENT TYPE</th>
                <th style="padding: 0.75rem 0.5rem; font-weight: 600; color: var(--text-secondary); font-size: 0.68rem; text-transform: uppercase; letter-spacing: 0.05em;">ALERTS</th>
                <th style="padding: 0.75rem 0.5rem; font-weight: 600; color: var(--text-secondary); font-size: 0.68rem; text-transform: uppercase; letter-spacing: 0.05em;">STATUS</th>
                <th style="padding: 0.75rem 0.5rem; font-weight: 600; color: var(--text-secondary); font-size: 0.68rem; text-transform: uppercase; letter-spacing: 0.05em;">LAST ACTIVITY</th>
                <th style="padding: 0.75rem 0.5rem; text-align: right;"></th>
              </tr>
            </thead>
            <tbody id="m-table-body">
              <!-- Dynamically rendered -->
            </tbody>
          </table>
        </div>

        <!-- Pagination Controls -->
        <div id="m-pagination" style="display: flex; justify-content: space-between; align-items: center; margin-top: 1rem; padding-top: 1rem; border-top: 1px solid var(--border-color); flex-wrap: wrap; gap: 0.5rem;">
        </div>

      </div>
    </div>
  `;

  // Bind roster filter triggers
  const sInput = document.getElementById('m-search');
  const sType = document.getElementById('m-type');
  const sDept = document.getElementById('m-dept');
  const sDoc = document.getElementById('m-doctor');
  const sWard = document.getElementById('m-ward');
  const sInsurance = document.getElementById('m-insurance');
  const sDateFilter = document.getElementById('m-date-filter');

  window.registryCurrentPage = 1;

  window.filterMasterRegistry = (resetPage = false) => {
    if (resetPage) {
      window.registryCurrentPage = 1;
    }

    const q = sInput.value.toLowerCase().trim();
    const typeVal = sType ? sType.value : '';
    const deptVal = sDept.value;
    const docVal = sDoc.value;
    const wardVal = sWard.value;
    const insVal = sInsurance.value;
    const dateVal = sDateFilter.value;
    const activeTab = window.activeRegistryTab || 'all';

    const filtered = state.patients.filter(p => {
      // 1. Universal Search
      const matchQ = !q || 
        p.name.toLowerCase().includes(q) || 
        p.uhid.toLowerCase().includes(q) || 
        (p.mobile && p.mobile.includes(q)) || 
        (p.abhaId && p.abhaId.toLowerCase().includes(q)) ||
        (p.aadhaar && p.aadhaar.includes(q));

      // 2. Type Filter
      let matchType = true;
      if (typeVal === "OPD") matchType = p.type === "OPD";
      else if (typeVal === "IPD") matchType = p.type === "IPD";
      else if (typeVal === "Emergency") matchType = p.type === "Emergency";
      else if (typeVal === "Daycare") matchType = p.type === "Daycare" || p.type === "Day Care";

      // 3. Dept Filter
      const matchDept = !deptVal || p.department === deptVal;

      // 4. Doctor Filter
      const matchDoc = !docVal || p.primaryConsultant === docVal;

      // 5. Ward Filter
      let matchWard = true;
      if (wardVal) {
        matchWard = p.ward && p.ward.toLowerCase().includes(wardVal.toLowerCase());
      }

      // 6. Insurance Filter
      let matchInsurance = true;
      if (insVal) {
        if (insVal === 'Cash') {
          matchInsurance = !p.insurance || !p.insurance.provider || p.insurance.provider.toLowerCase() === 'cash';
        } else {
          matchInsurance = p.insurance && p.insurance.provider && p.insurance.provider.toLowerCase().includes(insVal.toLowerCase());
        }
      }

      // 7. Active Tab Filter
      let matchTab = true;
      if (activeTab === 'IPD') {
        matchTab = p.type === 'IPD' && p.status !== 'Registered';
      } else if (activeTab === 'OPD') {
        matchTab = p.type === 'OPD' && p.status !== 'Registered';
      } else if (activeTab === 'Emergency') {
        matchTab = p.type === 'Emergency' && p.status !== 'Registered';
      } else if (activeTab === 'Daycare') {
        matchTab = (p.type === 'Daycare' || p.type === 'Day Care') && p.status !== 'Registered';
      } else if (activeTab === 'Upcoming') {
        matchTab = p.status === 'Scheduled';
      } else if (activeTab === 'Discharged') {
        matchTab = p.dischargedToday === true;
      }

      return matchQ && matchType && matchDept && matchDoc && matchWard && matchInsurance && matchTab;
    });

    const countEl = document.getElementById('m-results-count');
    if (countEl) countEl.textContent = `${filtered.length} results`;

    const rowsPerPage = 10;
    const totalItems = filtered.length;
    const totalPages = Math.ceil(totalItems / rowsPerPage) || 1;

    if (window.registryCurrentPage > totalPages) {
      window.registryCurrentPage = totalPages;
    }
    if (window.registryCurrentPage < 1) {
      window.registryCurrentPage = 1;
    }

    const startIndex = (window.registryCurrentPage - 1) * rowsPerPage;
    const endIndex = Math.min(startIndex + rowsPerPage, totalItems);
    const pageData = filtered.slice(startIndex, endIndex);

    renderMasterTableRows(pageData);
    renderPaginationControls(totalItems, startIndex, endIndex, totalPages);
  };

  window.switchRegistryFilterTab = function(btn, tabVal) {
    window.activeRegistryTab = tabVal;
    
    // Toggle active classes on tab buttons
    document.querySelectorAll('.tab-btn-link').forEach(b => {
      b.classList.remove('active');
    });
    
    btn.classList.add('active');
    
    // Re-filter and reset page
    if (window.filterMasterRegistry) {
      window.filterMasterRegistry(true);
    }
  };

  window.filterPatientsByCard = function(tabVal) {
    const tabBtn = document.querySelector(`#m-tabs-container button[data-filter="${tabVal}"]`);
    if (tabBtn) {
      window.switchRegistryFilterTab(tabBtn, tabVal);
    }
  };

  sInput.addEventListener('input', () => window.filterMasterRegistry(true));
  if (sType) sType.addEventListener('change', () => window.filterMasterRegistry(true));
  sDept.addEventListener('change', () => window.filterMasterRegistry(true));
  sDoc.addEventListener('change', () => window.filterMasterRegistry(true));
  sWard.addEventListener('change', () => window.filterMasterRegistry(true));
  sInsurance.addEventListener('change', () => window.filterMasterRegistry(true));
  sDateFilter.addEventListener('change', () => window.filterMasterRegistry(true));

  window.filterMasterRegistry();
}

function renderMasterTableRows(patients) {
  const tbody = document.getElementById('m-table-body');
  
  const getInitialsBgAndText = (name) => {
    const nameLower = name.toLowerCase();
    if (nameLower.includes('rajesh kumar')) return { bg: '#e11d48', initials: 'RK' };
    if (nameLower.includes('priya sharma')) return { bg: '#7c3aed', initials: 'PS' };
    if (nameLower.includes('kavitha nair')) return { bg: '#e11d48', initials: 'KN' };
    if (nameLower.includes('arjun mehta')) return { bg: '#d97706', initials: 'AM' };
    if (nameLower.includes('meena iyer')) return { bg: '#059669', initials: 'MI' };
    if (nameLower.includes('suresh patel')) return { bg: '#2563eb', initials: 'SP' };
    if (nameLower.includes('meena pillai')) return { bg: '#7c3aed', initials: 'HP' };
    
    const initials = name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    const colors = ['#ef4444', '#a855f7', '#f97316', '#10b981', '#3b82f6', '#8b5cf6', '#14b8a6', '#ec4899'];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const bg = colors[Math.abs(hash) % colors.length];
    return { bg, initials };
  };

  const renderAlertBadges = (alerts) => {
    if (!alerts || alerts.length === 0) return '<span style="color:var(--text-muted); font-size:0.75rem;">—</span>';
    return alerts.map(a => {
      let bg = '#f3f4f6', color = '#4b5563', border = '1px solid #d1d5db';
      let prefix = '';
      if (a === 'Critical') { bg = '#fef2f2'; color = '#dc2626'; border = '1px solid #fca5a5'; prefix = '⚠️ '; }
      else if (a === 'MLC Case') { bg = '#fef2f2'; color = '#dc2626'; border = '1px solid #fca5a5'; }
      else if (a === 'Pending labs' || a === 'Follow-up due' || a === 'Bill hold' || a === 'Discharge pending') { bg = '#fffbeb'; color = '#b45309'; border = '1px solid #fde68a'; }
      else if (a === 'No alerts') { bg = '#ecfdf5'; color = '#047857'; border = '1px solid #a7f3d0'; }
      else if (a.startsWith('Pre-op') || a.startsWith('Appt:')) { bg = '#eff6ff'; color = '#1d4ed8'; border = '1px solid #bfdbfe'; }
      
      return `<span class="badge" style="background: ${bg}; color: ${color}; border: ${border}; font-size: 0.72rem; padding: 0.15rem 0.45rem; border-radius: 4px; font-weight: 500; margin-right: 0.25rem; display: inline-block;">${prefix}${a}</span>`;
    }).join('');
  };

  tbody.innerHTML = patients.map(p => {
    const { bg: initialsBg, initials } = getInitialsBgAndText(p.name);
    
    let visitText = p.type || 'OPD';
    if (visitText === 'Daycare') visitText = 'Day Care';
    
    let visitTypeBg = '#f3f4f6', visitTypeColor = '#4b5563';
    if (visitText === 'IPD') { visitTypeBg = '#f3e8ff'; visitTypeColor = '#7c3aed'; }
    else if (visitText === 'OPD') { visitTypeBg = '#dbeafe'; visitTypeColor = '#2563eb'; }
    else if (visitText === 'Emergency') { visitTypeBg = '#fee2e2'; visitTypeColor = '#dc2626'; }
    else if (visitText === 'Day Care') { visitTypeBg = '#ffedd5'; visitTypeColor = '#ea580c'; }

    let statusBg = '#f3f4f6', statusColor = '#4b5563';
    const statusText = p.status || 'Registered';
    if (statusText === 'Admitted') { statusBg = '#f3e8ff'; statusColor = '#7c3aed'; }
    else if (statusText === 'OPD' || statusText === 'Checked In') { statusBg = '#dbeafe'; statusColor = '#2563eb'; }
    else if (statusText === 'Emergency') { statusBg = '#fee2e2'; statusColor = '#dc2626'; }
    else if (statusText === 'Discharge pending') { statusBg = '#ffedd5'; statusColor = '#ea580c'; }
    else if (statusText === 'Day Care' || statusText === 'Daycare') { statusBg = '#ffedd5'; statusColor = '#ea580c'; }
    else if (statusText === 'Registered') { statusBg = '#ecfdf5'; statusColor = '#10b981'; }
    else if (statusText === 'Scheduled') { statusBg = '#f3f4f6'; statusColor = '#4b5563'; }

    const email = p.email || (p.name.toLowerCase().replace(/\s+/g, '') + '@email.com');
    const ward = p.ward || '—';
    const bed = p.bed || '—';
    const lastActivity = p.lastActivity || '09:00 AM';
    
    let displayAlerts = p.alerts || [];
    if (displayAlerts.length === 0) {
      if (p.isCritical) displayAlerts.push("Critical");
      if (p.history?.familyHistory?.includes('MLC')) displayAlerts.push("MLC Case");
      const pendingOrders = state.orders.filter(o => o.uhid === p.uhid && o.status !== 'Approved').length;
      if (pendingOrders > 0) displayAlerts.push("Pending labs");
      if (displayAlerts.length === 0) displayAlerts.push("No alerts");
    }

    let insProvider = 'Cash';
    let insPlan = '';
    if (p.insurance) {
      insProvider = p.insurance.provider;
      insPlan = p.insurance.plan;
    } else if (p.payerType === 'Company') {
      insProvider = p.sponsor || p.payer;
      insPlan = p.status === 'Admitted' ? 'Pre-auth approved' : 'OPD plan';
    }

    return `
      <tr style="border-bottom: 1px solid var(--border-color); vertical-align: middle; transition: background-color 0.2s;">
        <td style="padding: 0.75rem 0.5rem;"><input type="checkbox" class="m-row-check" value="${p.uhid}" style="cursor: pointer;"></td>
        <td style="padding: 0.75rem 0.5rem;">
          <div style="display: flex; align-items: center; gap: 0.65rem;">
            <div class="patient-avatar-circle" style="background-color: ${initialsBg};">
              ${initials}
            </div>
            <div>
              <div style="font-weight: 700; color: var(--text-primary); font-size: 0.85rem; cursor: pointer;" onclick="router.navigate('patients?uhid=${p.uhid}')">${p.name}</div>
              <div style="font-size: 0.72rem; color: var(--text-muted); line-height: 1.25; margin-top: 0.1rem;">${p.mobile}</div>
              <div style="font-size: 0.72rem; line-height: 1.25; margin-top: 0.05rem;"><a href="#patients?uhid=${p.uhid}" style="color: #2563eb; text-decoration: none; font-weight: 600;">${p.uhid}</a></div>
            </div>
          </div>
        </td>
        <td style="padding: 0.75rem 0.5rem; font-weight: 500; color: var(--text-primary); font-size: 0.82rem;">
          ${p.age} / ${p.gender === 'Male' ? 'M' : 'F'}
        </td>
        <td style="padding: 0.75rem 0.5rem;">
          <span class="${visitText === 'Day Care' ? 'badge-type-dc' : (visitText === 'IPD' ? 'badge-type-ipd' : (visitText === 'OPD' ? 'badge-type-opd' : 'badge-type-er'))}">
            ${visitText}
          </span>
        </td>
        <td style="padding: 0.75rem 0.5rem;">
          <div style="font-weight: 600; color: var(--text-primary); font-size: 0.82rem;">${p.department}</div>
          <div style="font-size: 0.72rem; color: var(--text-muted); margin-top: 0.1rem;">${p.primaryConsultant}</div>
        </td>
        <td style="padding: 0.75rem 0.5rem;">
          ${ward !== '—' ? `
            <div style="font-weight: 500; color: var(--text-primary); font-size: 0.82rem;">${ward}</div>
            <div style="font-size: 0.72rem; color: var(--text-muted); margin-top: 0.1rem;">${bed}</div>
          ` : `<span style="color: var(--text-muted); font-size: 0.82rem;">—</span>`}
        </td>
        <td style="padding: 0.75rem 0.5rem;">
          <div style="font-weight: 600; color: var(--text-primary); font-size: 0.82rem;">${insProvider}</div>
          ${insPlan ? `<div style="font-size: 0.72rem; color: ${insPlan.includes('approved') || insPlan.includes('active') ? '#10b981' : '#ea580c'}; font-weight: 500; margin-top: 0.1rem;">${insPlan}</div>` : ''}
        </td>
        <td style="padding: 0.75rem 0.5rem;">
          <div style="display: flex; flex-wrap: wrap; gap: 0.25rem;">
            ${renderAlertBadges(displayAlerts)}
          </div>
        </td>
        <td style="padding: 0.75rem 0.5rem;">
          <span class="badge" style="background: ${statusBg}; color: ${statusColor}; padding: 0.25rem 0.6rem; border-radius: 20px; font-weight: 600; font-size: 0.72rem; display: inline-block;">
            ${statusText}
          </span>
        </td>
        <td style="padding: 0.75rem 0.5rem; color: var(--text-secondary); font-size: 0.8rem;">
          ${lastActivity}
        </td>
        <td style="padding: 0.75rem 0.5rem; text-align: right;">
          <div style="display: flex; gap: 0.35rem; justify-content: flex-end; align-items: center;">
            <button class="btn btn-primary btn-sm" style="padding: 0.25rem 0.75rem; font-size: 0.78rem; border-radius: 6px; cursor: pointer; background-color: #2563eb; color: #fff; font-weight: 600; border: none; height: 28px;" onclick="router.navigate('patients?uhid=${p.uhid}')">Open</button>
            <button class="btn btn-secondary btn-sm" style="padding: 0.25rem 0.5rem; font-size: 0.78rem; border-radius: 6px; cursor: pointer; border: 1px solid var(--border-color); background: var(--bg-surface-elevated); color: var(--text-secondary); height: 28px; line-height: 1;" onclick="alert('Menu actions for ${p.uhid}')">•••</button>
          </div>
        </td>
      </tr>
    `;
  }).join('') || '<tr><td colspan="12" style="text-align: center; color: var(--text-muted); padding: 2rem;">No matching patients found.</td></tr>';
}

window.toggleSelectAllRegistry = function(checked) {
  document.querySelectorAll('.m-row-check').forEach(cb => cb.checked = checked);
};

window.setRegistryPage = function(page) {
  window.registryCurrentPage = page;
  if (window.filterMasterRegistry) {
    window.filterMasterRegistry();
  }
};

function renderPaginationControls(totalItems, startIndex, endIndex, totalPages) {
  const pagContainer = document.getElementById('m-pagination');
  if (!pagContainer) return;
  
  if (totalItems === 0) {
    pagContainer.innerHTML = '';
    return;
  }
  
  const currentPage = window.registryCurrentPage || 1;
  let pageButtonsHTML = '';
  
  // Prev button
  const prevDisabled = currentPage === 1 ? 'disabled' : '';
  const prevStyle = currentPage === 1 
    ? 'cursor: not-allowed; opacity: 0.5;' 
    : 'cursor: pointer;';
  pageButtonsHTML += `
    <button class="btn btn-secondary btn-sm" ${prevDisabled} style="padding: 0.25rem 0.6rem; font-size: 0.75rem; border-radius: 6px; border: 1px solid var(--border-color); background: var(--bg-surface-elevated); color: var(--text-secondary); ${prevStyle}" onclick="window.setRegistryPage(${currentPage - 1})">
      &larr; Prev
    </button>
  `;
  
  // Determine page ranges to show
  const maxVisiblePages = 5;
  let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
  let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
  
  if (endPage - startPage + 1 < maxVisiblePages) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1);
  }
  
  if (startPage > 1) {
    pageButtonsHTML += `
      <button class="btn btn-secondary btn-sm" style="padding: 0.25rem 0.6rem; font-size: 0.75rem; border-radius: 6px; border: 1px solid var(--border-color); background: var(--bg-surface-elevated); color: var(--text-secondary); cursor: pointer;" onclick="window.setRegistryPage(1)">1</button>
    `;
    if (startPage > 2) {
      pageButtonsHTML += `<span style="color: var(--text-muted); font-size: 0.8rem; padding: 0 0.25rem;">...</span>`;
    }
  }
  
  for (let p = startPage; p <= endPage; p++) {
    const isActive = p === currentPage;
    const activeStyle = isActive 
      ? 'background: #2563eb; color: #fff; border-color: #2563eb; font-weight: 600;' 
      : 'background: var(--bg-surface-elevated); color: var(--text-secondary); border: 1px solid var(--border-color); cursor: pointer;';
    pageButtonsHTML += `
      <button class="btn btn-secondary btn-sm" style="padding: 0.25rem 0.6rem; font-size: 0.75rem; border-radius: 6px; ${activeStyle}" onclick="window.setRegistryPage(${p})">${p}</button>
    `;
  }
  
  if (endPage < totalPages) {
    if (endPage < totalPages - 1) {
      pageButtonsHTML += `<span style="color: var(--text-muted); font-size: 0.8rem; padding: 0 0.25rem;">...</span>`;
    }
    pageButtonsHTML += `
      <button class="btn btn-secondary btn-sm" style="padding: 0.25rem 0.6rem; font-size: 0.75rem; border-radius: 6px; border: 1px solid var(--border-color); background: var(--bg-surface-elevated); color: var(--text-secondary); cursor: pointer;" onclick="window.setRegistryPage(${totalPages})">${totalPages}</button>
    `;
  }
  
  // Next button
  const nextDisabled = currentPage === totalPages ? 'disabled' : '';
  const nextStyle = currentPage === totalPages 
    ? 'cursor: not-allowed; opacity: 0.5;' 
    : 'cursor: pointer;';
  pageButtonsHTML += `
    <button class="btn btn-secondary btn-sm" ${nextDisabled} style="padding: 0.25rem 0.6rem; font-size: 0.75rem; border-radius: 6px; border: 1px solid var(--border-color); background: var(--bg-surface-elevated); color: var(--text-secondary); ${nextStyle}" onclick="window.setRegistryPage(${currentPage + 1})">
      Next &rarr;
    </button>
  `;
  
  pagContainer.innerHTML = `
    <div style="font-size: 0.8rem; color: var(--text-muted);">
      Showing <span style="font-weight: 600; color: var(--text-primary);">${startIndex + 1}</span> to <span style="font-weight: 600; color: var(--text-primary);">${endIndex}</span> of <span style="font-weight: 600; color: var(--text-primary);">${totalItems}</span> entries
    </div>
    <div style="display: flex; gap: 0.25rem; align-items: center;">
      ${pageButtonsHTML}
    </div>
  `;
}

window.triggerBulkAction = function(action) {
  const selected = Array.from(document.querySelectorAll('.m-row-check:checked')).map(cb => cb.value);
  if (selected.length === 0) {
    alert('Please select at least one patient record to perform bulk actions.');
    return;
  }
  if (action === 'label') {
    alert(`Generating wristband and document identification barcodes for ${selected.length} patients.`);
  } else if (action === 'export') {
    alert(`Exporting clinical health summary (FHIR JSON/XML) for ${selected.length} patients.`);
  }
};

// --------------------------------------------------------------------------
// 2. CORE PATIENT DETAILS PAGE (OPD + IPD COHORT WORKSPACE)
// --------------------------------------------------------------------------
function renderPatient360Profile(container, patient, activeTab) {
  if (!patient) {
    container.innerHTML = `<div class="card"><div class="card-body"><h4>Patient profile not found.</h4></div></div>`;
    return;
  }

  const activeRole = state.activeUserRole || 'Administrator';
  const isIpd = patient.type === 'IPD';
  
  // Outstanding and details calculations
  const activeBill = state.billing.find(b => b.uhid === patient.uhid && b.status !== 'Settled');
  const outstandingBal = activeBill ? (activeBill.amount - activeBill.paid) : 0;
  const isMlc = patient.history.familyHistory && patient.history.familyHistory.includes('MLC') || patient.isMlc;

  const getInitialsBgAndText = (name) => {
    const nameLower = name.toLowerCase();
    if (nameLower.includes('rajesh kumar')) return { bg: '#e11d48', initials: 'RK' };
    if (nameLower.includes('priya sharma')) return { bg: '#7c3aed', initials: 'PS' };
    if (nameLower.includes('kavitha nair')) return { bg: '#e11d48', initials: 'KN' };
    if (nameLower.includes('arjun mehta')) return { bg: '#d97706', initials: 'AM' };
    if (nameLower.includes('meena iyer')) return { bg: '#059669', initials: 'MI' };
    if (nameLower.includes('suresh patel')) return { bg: '#2563eb', initials: 'SP' };
    if (nameLower.includes('meena pillai')) return { bg: '#7c3aed', initials: 'HP' };
    
    const initials = name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    const colors = ['#ef4444', '#a855f7', '#f97316', '#10b981', '#3b82f6', '#8b5cf6', '#14b8a6', '#ec4899'];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const bg = colors[Math.abs(hash) % colors.length];
    return { bg, initials };
  };

  const { bg: avatarBg, initials: avatarInitials } = getInitialsBgAndText(patient.name);

  // Visit Type and Status display colors
  let typeColor = '#2563eb';
  let typeLabel = 'Outpatient — OPD';
  let typeBadgeClass = 'b-bl';
  if (patient.type === 'IPD') {
    typeColor = '#7c3aed';
    typeLabel = 'Admitted — IPD';
    typeBadgeClass = 'b-pu';
  } else if (patient.type === 'Emergency') {
    typeColor = '#dc2626';
    typeLabel = 'Emergency';
    typeBadgeClass = 'b-re';
  } else if (patient.type === 'Daycare' || patient.type === 'Day Care') {
    typeColor = '#ea580c';
    typeLabel = 'Day Care';
    typeBadgeClass = 'b-or';
  }

  // Render Page Layout
  container.innerHTML = `
    <style>
      .patient-workspace-container {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        height: calc(100vh - 64px - 3rem);
        overflow: hidden;
        font-family: Inter, system-ui, sans-serif;
      }
      .patient-header-bar {
        background: #ffffff;
        border: 1px solid #e2e8f0;
        border-radius: 12px;
        display: flex;
        flex-direction: column;
        padding: 1rem 1.25rem;
        box-shadow: 0 1px 3px rgba(0,0,0,0.05);
      }
      .patient-header-summary {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1.5rem;
        flex-wrap: wrap;
      }
      .patient-header-details-grid {
        display: none;
        grid-template-columns: repeat(4, 1fr);
        gap: 1.5rem;
        margin-top: 1rem;
        padding-top: 1rem;
        border-top: 1px solid #f1f5f9;
      }
      .patient-header-bar.expanded .patient-header-details-grid {
        display: grid;
      }
      .patient-header-bar.expanded .patient-header-details-grid.expanded-row-2 {
        display: grid;
      }
      .patient-header-col {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
      }
      .patient-header-col-title {
        font-size: 10px;
        font-weight: 600;
        letter-spacing: 0.6px;
        text-transform: uppercase;
        color: #94a3b8;
        font-family: 'JetBrains Mono', monospace;
        border-bottom: 1px solid #f1f5f9;
        padding-bottom: 4px;
        margin-bottom: 4px;
      }
      .right-panel {
        display: flex;
        flex-direction: column;
        overflow: hidden;
        flex: 1;
      }
      .avatar-lg {
        width: 52px;
        height: 52px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #fff;
        font-size: 18px;
        font-weight: 700;
        font-family: 'JetBrains Mono', monospace;
        flex-shrink: 0;
      }
      .status-pill {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        font-size: 10px;
        font-weight: 600;
        padding: 3px 8px;
        border-radius: 999px;
        border: 1px solid;
      }
      .info-row {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        padding: 4px 0;
        font-size: 13.5px;
      }
      .info-label {
        color: #94a3b8;
        flex-shrink: 0;
        min-width: 96px;
        font-size: 13.5px;
      }
      .info-val {
        color: #1e293b;
        font-weight: 500;
        text-align: right;
        word-break: break-word;
        font-size: 13.5px;
      }
      .allergy-tag {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        background: #fee2e2;
        color: #991b1b;
        border: 1px solid #fca5a5;
        font-size: 10px;
        font-weight: 600;
        padding: 2px 7px;
        border-radius: 999px;
        margin: 2px;
      }
      .ptabs {
        display: flex;
        background: #fff;
        border: 1px solid #e2e8f0;
        border-radius: 12px;
        overflow-x: auto;
        padding: 0 1rem;
      }
      .ptabs::-webkit-scrollbar {
        height: 3px;
      }
      .ptabs::-webkit-scrollbar-thumb {
        background: #e2e8f0;
        border-radius: 2px;
      }
      .ptab {
        padding: 12px 14px;
        font-size: 11.5px;
        font-weight: 500;
        color: #64748b;
        cursor: pointer;
        border-bottom: 2px solid transparent;
        white-space: nowrap;
        background: none;
        border-top: none;
        border-left: none;
        border-right: none;
        transition: all .15s;
      }
      .ptab:hover {
        color: #1e293b;
      }
      .ptab.on {
        color: #2563eb;
        border-bottom-color: #2563eb;
        font-weight: 600;
      }
      #profile-tab-viewport {
        flex: 1;
        overflow-y: auto;
        padding-top: 1rem;
      }
      #profile-tab-viewport::-webkit-scrollbar {
        width: 5px;
      }
      #profile-tab-viewport::-webkit-scrollbar-thumb {
        background: #cbd5e1;
        border-radius: 3px;
      }
      .card {
        background: #fff;
        border: 1px solid #e2e8f0;
        border-radius: 12px;
        overflow: hidden;
        margin-bottom: 1rem;
      }
      .card:last-child {
        margin-bottom: 0;
      }
      .card-hdr {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 10px 16px;
        border-bottom: 1px solid #f1f5f9;
        background: #ffffff;
      }
      .card-title {
        font-size: 10px;
        font-weight: 600;
        letter-spacing: .6px;
        text-transform: uppercase;
        color: #64748b;
        font-family: 'JetBrains Mono', monospace;
      }
      .badge {
        display: inline-flex;
        align-items: center;
        font-size: 10px;
        font-weight: 600;
        padding: 2px 8px;
        border-radius: 999px;
        border: 1px solid;
        white-space: nowrap;
      }
      .b-gr { background: #d1fae5; color: #065f46; border-color: #6ee7b7; }
      .b-bl { background: #dbeafe; color: #1e40af; border-color: #93c5fd; }
      .b-am { background: #fef3c7; color: #92400e; border-color: #fcd34d; }
      .b-re { background: #fee2e2; color: #991b1b; border-color: #fca5a5; }
      .b-pu { background: #ede9fe; color: #5b21b6; border-color: #c4b5fd; }
      .b-cy { background: #cffafe; color: #164e63; border-color: #67e8f9; }
      .b-sl { background: #f1f5f9; color: #475569; border-color: #cbd5e1; }
      .b-or { background: #ffedd5; color: #9a3412; border-color: #fdba74; }
      .b-pk { background: #fce7f3; color: #9d174d; border-color: #fbcfe8; }

      .btn-p {
        background: #2563eb;
        color: #fff;
        border: none;
        padding: 5px 12px;
        border-radius: 7px;
        font-size: 11px;
        font-weight: 500;
        cursor: pointer;
        white-space: nowrap;
        display: inline-flex;
        align-items: center;
        gap: 5px;
      }
      .btn-p:hover { background: #1d4ed8; }
      .btn-g {
        background: #fff;
        color: #475569;
        border: 1px solid #e2e8f0;
        padding: 5px 12px;
        border-radius: 7px;
        font-size: 11px;
        font-weight: 500;
        cursor: pointer;
        white-space: nowrap;
        display: inline-flex;
        align-items: center;
        gap: 5px;
      }
      .btn-g:hover { background: #f8fafc; }
      .btn-xs { padding: 3px 8px; font-size: 10.5px; border-radius: 6px; }

      .profile-table {
        width: 100%;
        border-collapse: collapse;
      }
      .profile-table th {
        text-align: left;
        padding: 8px 14px;
        font-size: 10px;
        font-weight: 600;
        letter-spacing: .5px;
        text-transform: uppercase;
        color: #64748b;
        background: #f8fafc;
        border-bottom: 1px solid #f1f5f9;
        font-family: 'JetBrains Mono', monospace;
        white-space: nowrap;
      }
      .profile-table td {
        padding: 10px 14px;
        font-size: 12px;
        color: #1e293b;
        border-bottom: 1px solid #f8fafc;
        vertical-align: middle;
      }
      .profile-table tr:last-child td {
        border-bottom: none;
      }
      .profile-table tr:hover td {
        background: rgba(248, 250, 252, 0.7);
      }
      .mono { font-family: 'JetBrains Mono', monospace; }

      .vital-box {
        background: #f8fafc;
        border: 1px solid #e2e8f0;
        border-radius: 10px;
        padding: 12px;
        text-align: center;
      }
      .vital-val {
        font-size: 18px;
        font-weight: 700;
        font-family: 'JetBrains Mono', monospace;
        color: #0f172a;
        line-height: 1;
      }
      .vital-unit {
        font-size: 9px;
        color: #94a3b8;
        margin-top: 1px;
      }
      .vital-label {
        font-size: 10px;
        color: #64748b;
        margin-top: 4px;
        font-weight: 500;
      }

      .tl-item {
        display: flex;
        gap: 12px;
        padding: 10px 0;
        position: relative;
      }
      .tl-item:not(:last-child)::before {
        content: '';
        position: absolute;
        left: 7px;
        top: 22px;
        bottom: -10px;
        width: 1px;
        background: #e2e8f0;
      }
      .tl-dot {
        width: 16px;
        height: 16px;
        border-radius: 50%;
        flex-shrink: 0;
        margin-top: 1px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 8px;
        color: #fff;
        font-weight: 700;
      }
      .tl-body {
        flex: 1;
        min-width: 0;
      }
      .tl-title {
        font-size: 12.5px;
        font-weight: 600;
        color: #1e293b;
      }
      .tl-meta {
        font-size: 10px;
        color: #94a3b8;
        margin-top: 2px;
      }
      .tl-time {
        font-size: 9px;
        font-family: 'JetBrains Mono', monospace;
        color: #94a3b8;
        white-space: nowrap;
        padding-top: 3px;
      }

      .more-dd {
        position: relative;
        display: inline-block;
      }
      .more-dd-menu {
        display: none;
        position: absolute;
        top: 100%;
        left: 0;
        min-width: 160px;
        background: #fff;
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);
        z-index: 200;
        padding: 4px 0;
      }
      .more-dd-menu.open {
        display: block;
      }
      .more-opt {
        display: block;
        width: 100%;
        padding: 8px 12px;
        font-size: 11.5px;
        color: #475569;
        text-align: left;
        border: none;
        background: none;
        cursor: pointer;
      }
      .more-opt:hover {
        background: #f8fafc;
        color: #1e293b;
      }

      /* Side by side layout for Medical History & Timeline */
      .timeline-workspace-split {
        display: grid;
        grid-template-columns: 1.3fr 1.1fr;
        gap: 1.25rem;
        align-items: start;
      }

      /* ATD Tab Workspace Grid */
      .atd-grid-container {
        display: grid;
        grid-template-columns: 1.2fr 1.2fr 1fr;
        gap: 1.25rem;
        align-items: start;
      }
      
      @media (max-width: 1024px) {
        .patient-header-details-grid {
          grid-template-columns: repeat(2, 1fr);
        }
        .timeline-workspace-split {
          grid-template-columns: 1fr;
        }
        .atd-grid-container {
          grid-template-columns: 1fr;
        }
      }
      @media (max-width: 640px) {
        .patient-header-details-grid {
          grid-template-columns: 1fr;
        }
      }
    </style>

    <div class="patient-workspace-container">
      
      <!-- ── TOP: HORIZONTAL COLLAPSIBLE PATIENT DETAILS BAR ── -->
      <div class="patient-header-bar">
        <div class="patient-header-summary">
          <!-- Left: Avatar & Basic demographic details -->
          <div style="display:flex;align-items:center;gap:12px;min-width:0;flex:1">
            <div class="avatar-lg" style="background-color: ${avatarBg};">${avatarInitials}</div>
            <div style="min-width:0">
              <div style="font-size:16px;font-weight:600;color:#0f172a;line-height:1.2">${patient.name}</div>
              <div style="font-size:13px;color:#94a3b8;margin-top:3px;font-family:'JetBrains Mono',monospace">
                ${patient.uhid} · ABHA: ${patient.abhaId || 'N/A'} · Age/Sex: ${patient.age} Yrs / ${patient.gender} · Blood Group: ${patient.bloodGroup} · Mobile: ${patient.mobile}
              </div>
              <div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:8px">
                <span class="badge ${typeBadgeClass}">${typeLabel}</span>
                ${patient.isCritical || patient.vitals?.pain > 7 ? '<span class="badge b-re">⚠ High Risk</span>' : ''}
                ${isMlc ? '<span class="badge b-re">🚨 MLC Case</span>' : ''}
                ${isIpd ? `<span class="badge b-pu">Bed: ${patient.bed || patient.admission?.bed || 'A-204'}</span>` : ''}
              </div>
            </div>
          </div>

          <!-- Right: Expand/Collapse Toggle -->
          <div>
            <button id="toggle-details-btn-el" class="btn-g btn-xs" style="font-weight:600;border-color:#2563eb;color:#2563eb" onclick="window.togglePatientDetailsExpand()">▼ Show Details</button>
          </div>
        </div>

        <!-- Row 2: All Quick Action Buttons in a single line -->
        <div class="patient-actions-row" style="display:flex;gap:8px;margin-top:12px;padding-top:12px;border-top:1px solid #f1f5f9;flex-wrap:wrap">
          ${(!isIpd && state.activeUserRole === 'Doctor') ? `<button class="btn-p btn-xs" style="background-color: #10b981;" onclick="router.navigate('emr?uhid=${patient.uhid}')">🩺 Consult Now</button>` : ''}
          <button class="btn-p btn-xs" onclick="window.openActionModal('add-note', '${patient.uhid}')">📋 Add Note</button>
          ${isIpd ? `
            <button class="btn-g btn-xs" onclick="window.openActionModal('create-rx', '${patient.uhid}')">💊 Prescribe</button>
            <button class="btn-g btn-xs" onclick="window.openActionModal('order-lab', '${patient.uhid}')">🔬 Order Lab</button>
            <button class="btn-g btn-xs" onclick="window.openActionModal('order-rad', '${patient.uhid}')">💀 Order Radiology</button>
            <button class="btn-g btn-xs" onclick="window.openActionModal('order-proc', '${patient.uhid}')">🪡 Request Procedure</button>
          ` : ''}
          <button class="btn-g btn-xs" onclick="window.openActionModal('upload-doc', '${patient.uhid}')">📂 Upload Document</button>
          ${!isIpd ? `
            <button class="btn-g btn-xs" onclick="window.openActionModal('book-appt', '${patient.uhid}')">📅 Book Follow-up</button>
            <button class="btn-g btn-xs" onclick="window.openActionModal('admit', '${patient.uhid}')">🏥 Admit Patient</button>
          ` : ''}
        </div>

        <!-- Expanded 4-Column Details Grid -->
        <div class="patient-header-details-grid">
          <!-- Col 1: Demographics -->
          <div class="patient-header-col">
            <div class="patient-header-col-title">Demographics</div>
            <div class="info-row"><span class="info-label">DOB</span><span class="info-val mono">15 Mar ${2026 - patient.age}</span></div>
            <div class="info-row"><span class="info-label">Aadhaar</span><span class="info-val mono">${patient.aadhaar ? 'XXXX XXXX ' + patient.aadhaar.substring(patient.aadhaar.length - 4) : 'XXXX XXXX 4321'}</span></div>
            <div class="info-row"><span class="info-label">Email</span><span class="info-val">${patient.email || '—'}</span></div>
            <div class="info-row"><span class="info-label">Address</span><span class="info-val" style="text-align:right">${patient.address || '—'}</span></div>
          </div>

          <!-- Col 2: Emergency Contact -->
          <div class="patient-header-col">
            <div class="patient-header-col-title">Emergency Contact</div>
            <div class="info-row"><span class="info-label">Name</span><span class="info-val">${patient.emergencyContact?.name || 'Relative'}</span></div>
            <div class="info-row"><span class="info-label">Relation</span><span class="info-val">${patient.emergencyContact?.relation || 'Sibling'}</span></div>
            <div class="info-row"><span class="info-label">Mobile</span><span class="info-val">${patient.emergencyContact?.phone || '+91 99999 99900'}</span></div>
          </div>

          <!-- Col 3: Insurance / Payment -->
          <div class="patient-header-col">
            <div class="patient-header-col-title">Insurance / Payment</div>
            <div class="info-row"><span class="info-label">Provider</span><span class="info-val">${patient.payerType === 'Company' ? (patient.payer || 'Star Health') : 'Cash Tariff self-pay'}</span></div>
            <div class="info-row"><span class="info-label">Policy No.</span><span class="info-val mono">${patient.insuranceId || 'SH-2026-XXXX-4821'}</span></div>
            <div class="info-row"><span class="info-label">Pre-Auth</span><span class="info-val"><span class="badge ${patient.payerType === 'Company' ? 'b-gr' : 'b-sl'}">${patient.payerType === 'Company' ? 'Approved ₹2,00,000' : 'No Cover'}</span></span></div>
            <div class="info-row"><span class="info-label">Type</span><span class="info-val">${patient.payerType || 'Direct'}</span></div>
          </div>

          <!-- Col 4: Visit & Clinical Summary -->
          <div class="patient-header-col">
            <div class="patient-header-col-title">Visit &amp; Care Details</div>
            <div class="info-row"><span class="info-label">Consultant</span><span class="info-val">${patient.primaryConsultant}</span></div>
            <div class="info-row"><span class="info-label">Department</span><span class="info-val">${patient.department || 'General Medicine'}</span></div>
            ${isIpd ? `
              <div class="info-row"><span class="info-label">Admitted on</span><span class="info-val mono">${patient.admission?.date || '14 Jun 2026 · 08:30'}</span></div>
              <div class="info-row"><span class="info-label">Admission Dx</span><span class="info-val" style="text-align:right">${patient.clinicalData?.complaint || 'Unstable Angina'}</span></div>
            ` : ''}
          </div>
        </div>

        <!-- Optional: Discharge Widget if IPD -->
        ${isIpd ? `
          <div class="patient-header-details-grid expanded-row-2">
            <div style="grid-column: span 4; border-top: 2px dashed #fca5a5; background: #fff5f5; border-radius: 8px; padding: 10px 14px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px; margin-top:0.25rem;">
              <div style="display:flex; gap:1.5rem; flex-wrap:wrap; align-items:center;">
                <div style="font-size:13px; font-weight:600; color:#991b1b; display:flex; align-items:center; gap:5px">🚪 Discharge Clearance Status:</div>
                <div style="font-size:13px; display:flex; gap:1rem;">
                  <span>Doctor: <span class="badge ${patient.dischargeClearances.clinical ? 'b-gr' : 'b-am'}">${patient.dischargeClearances.clinical ? 'Cleared' : 'Pending'}</span></span>
                  <span>Billing: <span class="badge ${patient.dischargeClearances.billing ? 'b-gr' : 'b-am'}">${patient.dischargeClearances.billing ? 'Cleared' : 'Pending'}</span></span>
                  <span>Summary: <span class="badge ${patient.dischargeClearances.summaryReady ? 'b-gr' : 'b-am'}">${patient.dischargeClearances.summaryReady ? 'Entered' : 'Pending'}</span></span>
                </div>
              </div>
              <div style="display:flex; gap:0.5rem;">
                <button class="btn btn-g btn-xs" onclick="window.initiatePatientDischarge('${patient.uhid}')">Initiate Discharge</button>
                <button class="btn btn-p btn-xs" style="background:#ef4444;" onclick="window.initiatePatientDischarge('${patient.uhid}')" ${(!patient.dischargeClearances.clinical || !patient.dischargeClearances.billing) ? 'disabled' : ''}>Complete Discharge</button>
              </div>
            </div>
          </div>
        ` : ''}
      </div>

      <!-- ── BOTTOM: TAB WORKSPACE PANEL ── -->
      <div class="right-panel">
        
        <!-- Tab bar -->
        <div class="ptabs" role="tablist">
          <button class="ptab ${activeTab === 'overview' ? 'on' : ''}" onclick="window.switchPatientTab('overview', '${patient.uhid}')">Timeline</button>
          <button class="ptab ${activeTab === 'vitals' ? 'on' : ''}" onclick="window.switchPatientTab('vitals', '${patient.uhid}')">Vitals</button>
          <button class="ptab ${activeTab === 'clinical' ? 'on' : ''}" onclick="window.switchPatientTab('clinical', '${patient.uhid}')">Clinical</button>
          <button class="ptab ${activeTab === 'medications' ? 'on' : ''}" onclick="window.switchPatientTab('medications', '${patient.uhid}')">Medications</button>
          <button class="ptab ${activeTab === 'orders' ? 'on' : ''}" onclick="window.switchPatientTab('orders', '${patient.uhid}')">Orders &amp; Investigations</button>
          <button class="ptab ${activeTab === 'documents' ? 'on' : ''}" onclick="window.switchPatientTab('documents', '${patient.uhid}')">Uploaded Files</button>
          <button class="ptab ${activeTab === 'admission' ? 'on' : ''}" onclick="window.switchPatientTab('admission', '${patient.uhid}')">ATD</button>
        </div>

        <!-- Active Tab Display Panel -->
        <div id="profile-tab-viewport">
          <!-- Rendered dynamically -->
        </div>

      </div><!-- /right-panel -->

      <!-- Reusable Action Overlay Modal -->
      <div id="patient-action-modal" class="modal-overlay">
        <div class="modal-box" style="max-width: 900px; border-radius: var(--radius-md); box-shadow: var(--shadow-lg);">
          <div class="modal-header" style="background-color: var(--bg-surface-elevated); border-bottom: 1px solid var(--border-color); padding: 1rem; display: flex; justify-content: space-between; align-items: center;">
            <h4 class="modal-title" id="action-modal-title" style="margin: 0; font-weight: 700;">Action Panel</h4>
            <span class="modal-close" style="cursor: pointer; font-size: 1.5rem; line-height: 1;" onclick="window.closeActionModal()">&times;</span>
          </div>
          <div class="modal-body" id="action-modal-body" style="padding: 1.5rem; font-size: 0.85rem; display: flex; flex-direction: column; gap: 1.25rem;">
            <!-- Populated dynamically -->
          </div>
        </div>
      </div>

      <!-- Reusable ATD Modal for transfers -->
      <div id="profile-atd-modal" class="modal-overlay">
        <div class="modal-box" style="max-width: 900px; border-radius: var(--radius-md); box-shadow: var(--shadow-lg);">
          <div class="modal-header" style="background-color: var(--bg-surface-elevated); border-bottom: 1px solid var(--border-color); padding: 1rem; display: flex; justify-content: space-between; align-items: center;">
            <h4 class="modal-title" id="profile-atd-modal-title" style="margin: 0; font-weight: 700;">ATD Action</h4>
            <span class="modal-close" style="cursor: pointer; font-size: 1.5rem; line-height: 1;" onclick="window.closeProfileAtdModal()">&times;</span>
          </div>
          <div class="modal-body" id="profile-atd-modal-body" style="padding: 1.5rem; font-size: 0.85rem; display: flex; flex-direction: column; gap: 1.25rem;">
            <!-- Populated dynamically -->
          </div>
        </div>
      </div>

    </div>
  `;

  // Custom click listener helper for dropdown toggle
  window.toggleMoreDropdown = function(event) {
    event.stopPropagation();
    const menu = document.getElementById('more-dd-menu-el');
    if (menu) menu.classList.toggle('open');
  };
  window.togglePatientDetailsExpand = function() {
    const bar = document.querySelector('.patient-header-bar');
    const btn = document.getElementById('toggle-details-btn-el');
    if (!bar || !btn) return;
    
    const isExpanded = bar.classList.toggle('expanded');
    btn.innerHTML = isExpanded 
      ? '▲ Hide Details' 
      : '▼ Show Details';
  };
  if (typeof document !== 'undefined' && typeof document.addEventListener === 'function') {
    document.addEventListener('click', function() {
      const menu = document.getElementById('more-dd-menu-el');
      if (menu) menu.classList.remove('open');
    });
  }

  const panel = document.getElementById('profile-tab-viewport');
  renderTabContent(panel, patient, activeTab);
}

// --------------------------------------------------------------------------
// 3. TAB CONTROLLER & SUB-RENDERERS
// --------------------------------------------------------------------------
window.switchPatientTab = function(tabName, uhid) {
  const patient = state.patients.find(p => p.uhid === uhid);
  if (!patient) return;

  document.querySelectorAll('.ptab').forEach(btn => {
    if (btn.getAttribute('onclick').includes(`'${tabName}'`)) {
      btn.classList.add('on');
    } else {
      btn.classList.remove('on');
    }
  });

  const panel = document.getElementById('profile-tab-viewport');
  renderTabContent(panel, patient, tabName);
};

function renderTabContent(panel, patient, tabName) {
  panel.innerHTML = ''; 

  switch(tabName) {
    case 'overview':
      renderOverviewTab(panel, patient);
      break;
    case 'vitals':
      renderVitalsTab(panel, patient);
      break;
    case 'clinical':
      renderClinicalTab(panel, patient);
      break;
    case 'orders':
      renderOrdersTab(panel, patient);
      break;
    case 'reports':
      renderReportsTab(panel, patient);
      break;
    case 'medications':
      renderMedicationsTab(panel, patient);
      break;
    case 'admission':
      renderAdmissionTab(panel, patient);
      break;
    case 'referrals':
      renderReferralsTab(panel, patient);
      break;
    case 'billing':
      renderBillingTab(panel, patient);
      break;
    case 'documents':
      renderDocumentsTab(panel, patient);
      break;
    default:
      renderOverviewTab(panel, patient);
  }
}

// Helpers
function isActionGroupVisible(groupKey, role) {
  if (role === 'Administrator') return true;
  if (role === 'Doctor') return ['clinical', 'common'].includes(groupKey);
  if (role === 'Nurse') return ['nursing', 'common'].includes(groupKey);
  if (role === 'Billing') return ['admin', 'common'].includes(groupKey);
  if (role === 'Front Desk') return ['admin', 'common'].includes(groupKey);
  return true;
}

// --------------------------------------------------------------------------
// TAB 1: OVERVIEW SUMMARY + TIMELINE 2-COLUMN SPLIT GRID
// --------------------------------------------------------------------------
function renderOverviewTab(panel, patient) {
  let events = [
    { date: '2026-06-15 09:15 AM', icon: '👤', title: 'Registration Onboard', desc: 'Registered in EMR. UHID: ' + patient.uhid },
    { date: '2026-06-15 10:00 AM', icon: '🩺', title: 'Outpatient Consultation Visit', desc: 'Consulted with Dr. Abhishek Kumar for Chief Complaint of ' + patient.clinicalData.complaint },
    { date: '2026-06-15 10:15 AM', icon: '🧪', title: 'Diagnostics Lab Order', desc: 'CBC and LFT lab blood work ordered.' },
    { date: '2026-06-16 09:00 AM', icon: '🏥', title: 'Admissions coordinates shift', desc: 'Admitted as Inpatient under Consultant ' + patient.primaryConsultant },
    { date: '2026-06-16 11:30 AM', icon: '💀', title: 'Radiology Scan Completed', desc: 'Chest X-Ray PA View completed in PACS radiology center' },
    { date: '2026-06-17 08:30 AM', icon: '🌡️', title: 'Vitals Logged', desc: 'Recorded Vitals: BP: ' + patient.vitals.bp + ' | HR: ' + patient.vitals.hr + ' bpm | SpO2: ' + patient.vitals.spo2 + '%' }
  ];

  if (patient.timelineEvents) {
    events = [...patient.timelineEvents, ...events];
  }

  const seenDates = new Set();
  const uniqueEvents = [];
  events.forEach(e => {
    const key = `${e.date}-${e.title}`;
    if (!seenDates.has(key)) {
      seenDates.add(key);
      uniqueEvents.push(e);
    }
  });
  uniqueEvents.sort((a, b) => new Date(b.date) - new Date(a.date));

  panel.innerHTML = `
    <div class="timeline-workspace-split">
      
      <!-- Left Column: Timeline -->
      <div class="timeline-column">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px">
          <h2 style="font-size:15px;font-weight:600;margin:0">Patient Timeline</h2>
          <div style="display:flex;gap:8px">
            <select style="background:#fff;border:1px solid #e2e8f0;border-radius:8px;padding:4px 10px;font-size:11px;color:#475569;cursor:pointer">
              <option>All Events</option><option>Admissions</option><option>Labs</option><option>Prescriptions</option><option>Billing</option>
            </select>
            <button class="btn-g" onclick="alert('Exporting timeline report...')">⬇ Export</button>
          </div>
        </div>

        <div class="card" style="padding:16px 20px">
          ${uniqueEvents.map(e => {
            const dt = new Date(e.date);
            const dayStr = isNaN(dt) ? e.date.split(' ')[0] : dt.toLocaleDateString('en-CA', { day: 'numeric', month: 'short', year: 'numeric' });
            const timeStr = e.date.includes('AM') || e.date.includes('PM') ? e.date.substring(e.date.length - 8) : '';
            
            let dotColor = '#2563eb';
            if (e.icon === '⚠' || e.icon === '🚨') dotColor = '#dc2626';
            else if (e.icon === '💊') dotColor = '#10b981';
            else if (e.icon === '📋' || e.icon === '📝') dotColor = '#8b5cf6';
            else if (e.icon === '🔬' || e.icon === '🧪') dotColor = '#0891b2';
            else if (e.icon === '🩻' || e.icon === '💀') dotColor = '#f59e0b';
            else if (e.icon === '🛏️' || e.icon === '🏥' || e.icon === '🔄') dotColor = '#7c3aed';
            
            let editButtonHtml = '';
            if (e.title === 'Procedure Requested') {
              const otCase = state.ot?.scheduledCases?.find(c => c.patientUhid === patient.uhid && c.status === 'Requested');
              if (otCase) {
                editButtonHtml = `<div style="margin-top: 4px;"><button class="btn btn-xs" style="font-size: 10px; padding: 2px 6px; border: 1px solid #1B3A5C; color: #1B3A5C; border-radius: 4px; background: transparent; cursor: pointer; display: inline-flex; align-items: center; gap: 3px;" onclick="window.openEditOTRequestModal('${otCase.id}')">✏️ Edit OT Request</button></div>`;
              }
            }

            return `
              <div class="tl-item">
                <div class="tl-dot" style="background:${dotColor}">${e.icon || '📝'}</div>
                <div class="tl-body">
                  <div class="tl-title">${e.title}</div>
                  <div class="tl-meta">${e.desc}${editButtonHtml}</div>
                </div>
                <div class="tl-time">${dayStr} ${timeStr}</div>
              </div>
            `;
          }).join('')}
        </div>
      </div>

      <!-- Right Column: Medical History -->
      <div class="medical-history-column">
        <h2 style="font-size:15px;font-weight:600;margin-bottom:16px">Medical History</h2>
        
        <!-- Allergies -->
        <div class="card" style="margin-bottom: 1rem;">
          <div class="card-hdr"><span class="card-title">Allergies</span></div>
          <div style="padding: 14px 16px;">
            ${patient.allergies && patient.allergies !== 'No Known Allergies' ? 
              patient.allergies.split(',').map(a => `<span class="allergy-tag">⚠ ${a.trim()}</span>`).join('') : 
              '<span style="color:#94a3b8; font-size:13px;">No Known Allergies</span>'
            }
          </div>
        </div>

        <!-- Chronic Conditions -->
        <div class="card" style="margin-bottom: 1rem;">
          <div class="card-hdr"><span class="card-title">Chronic Conditions</span></div>
          <div style="padding: 14px 16px; display:flex; flex-direction:column; gap:8px;">
            <div style="display:flex;justify-content:space-between;font-size:13px"><span style="color:#1e293b">Type 2 Diabetes Mellitus</span><span class="badge b-am">Active</span></div>
            <div style="display:flex;justify-content:space-between;font-size:13px"><span style="color:#1e293b">Hypertension</span><span class="badge b-am">Active</span></div>
          </div>
        </div>

        <!-- Detailed Medical History Dossier -->
        <div class="card">
          <div class="card-hdr"><span class="card-title">Medical / Surgical History</span></div>
          <div style="padding: 14px 16px; display:flex; flex-direction:column; gap:12px;">
            <div>
              <div style="font-size:10px;font-weight:600;color:#94a3b8;font-family:'JetBrains Mono',monospace;text-transform:uppercase;letter-spacing:.5px;margin-bottom:4px">Past Medical Conditions</div>
              <div style="font-size:13px;color:#475569;line-height:1.6">
                ${patient.history.pastConditions ? patient.history.pastConditions.split('\n').map(c => `• ${c}`).join('<br>') : '• None reported'}
              </div>
            </div>
            <div>
              <div style="font-size:10px;font-weight:600;color:#94a3b8;font-family:'JetBrains Mono',monospace;text-transform:uppercase;letter-spacing:.5px;margin-bottom:4px">Surgical History</div>
              <div style="font-size:13px;color:#475569;line-height:1.6">
                ${patient.history.surgeries ? patient.history.surgeries.split('\n').map(s => `• ${s}`).join('<br>') : '• None reported'}
              </div>
            </div>
            <div>
              <div style="font-size:10px;font-weight:600;color:#94a3b8;font-family:'JetBrains Mono',monospace;text-transform:uppercase;letter-spacing:.5px;margin-bottom:4px">Family History</div>
              <div style="font-size:13px;color:#475569;line-height:1.6">
                ${patient.history.familyHistory ? patient.history.familyHistory.split('\n').map(f => `• ${f}`).join('<br>') : '• Father: MI at 52 yrs (deceased)<br>• Mother: T2DM, Hypertension'}
              </div>
            </div>
            <div>
              <div style="font-size:10px;font-weight:600;color:#94a3b8;font-family:'JetBrains Mono',monospace;text-transform:uppercase;letter-spacing:.5px;margin-bottom:4px">Social History</div>
              <div style="font-size:13px;color:#475569;line-height:1.6">
                • Non-smoker<br>
                • Occasional alcohol<br>
                • Sedentary lifestyle
              </div>
            </div>
          </div>
        </div>
      </div>
      
    </div>
  `;
}

function renderVitalsTab(panel, patient) {
  const weight = patient.vitals.weight || 70;
  const height = patient.vitals.height || 174;
  const heightM = height / 100;
  const bmiVal = (weight / (heightM * heightM)).toFixed(1);
  let bmiClass = 'Normal';
  let bmiColor = '#059669';
  if (bmiVal >= 25 && bmiVal < 30) { bmiClass = 'Overweight'; bmiColor = '#d97706'; }
  else if (bmiVal >= 30) { bmiClass = 'Obese'; bmiColor = '#dc2626'; }
  else if (bmiVal < 18.5) { bmiClass = 'Underweight'; bmiColor = '#2563eb'; }

  panel.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px">
      <h2 style="font-size:15px;font-weight:600;margin:0">Patient Vitals</h2>
      <button class="btn-p" onclick="window.openActionModal('rec-vitals', '${patient.uhid}')">+ Record Vitals</button>
    </div>

    <div class="card" style="padding:16px">
      <div style="font-size:10px;font-weight:600;letter-spacing:.6px;text-transform:uppercase;color:#64748b;font-family:'JetBrains Mono',monospace;margin-bottom:12px">Latest Reading</div>
      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:14px">
        <div class="vital-box" style="border-color:#e2e8f0;">
          <div class="vital-val">${patient.vitals.bp || '120/80'}</div>
          <div class="vital-unit">mmHg</div>
          <div class="vital-label">Blood Pressure</div>
        </div>
        <div class="vital-box">
          <div class="vital-val">${patient.vitals.hr || '78'}</div>
          <div class="vital-unit">bpm</div>
          <div class="vital-label">Heart Rate</div>
        </div>
        <div class="vital-box">
          <div class="vital-val">${patient.vitals.temp || '98.6'}°F</div>
          <div class="vital-unit"></div>
          <div class="vital-label">Temperature</div>
        </div>
        <div class="vital-box">
          <div class="vital-val">${patient.vitals.rr || '18'}</div>
          <div class="vital-unit">breaths/min</div>
          <div class="vital-label">Resp. Rate</div>
        </div>
      </div>
      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px">
        <div class="vital-box">
          <div class="vital-val">${patient.vitals.spo2 || '98'}%</div>
          <div class="vital-unit"></div>
          <div class="vital-label">SpO₂</div>
        </div>
        <div class="vital-box">
          <div class="vital-val">${height}</div>
          <div class="vital-unit">cm</div>
          <div class="vital-label">Height</div>
        </div>
        <div class="vital-box">
          <div class="vital-val">${weight}</div>
          <div class="vital-unit">kg</div>
          <div class="vital-label">Weight</div>
        </div>
        <div class="vital-box" style="border-color:${bmiColor};">
          <div class="vital-val" style="color:${bmiColor}">${bmiVal}</div>
          <div class="vital-unit"></div>
          <div class="vital-label" style="color:${bmiColor}">BMI · ${bmiClass}</div>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="card-hdr">
        <span class="card-title">Vitals History</span>
        <select style="background:#fff;border:1px solid #e2e8f0;border-radius:6px;padding:3px 8px;font-size:11px;color:#475569">
          <option>Last 7 days</option><option>Last 30 days</option>
        </select>
      </div>
      <table class="profile-table">
        <thead><tr><th>Date / Time</th><th>BP</th><th>Pulse</th><th>Temp</th><th>SpO₂</th><th>RR</th><th>Recorded By</th></tr></thead>
        <tbody>
          ${(patient.vitalsHistory || []).map(v => `
            <tr>
              <td class="mono" style="font-size:11px">${v.date}</td>
              <td class="mono">${v.bp || '120/80'}</td>
              <td class="mono">${v.hr || '78'}</td>
              <td class="mono">${v.temp || '98.6'}°F</td>
              <td class="mono">${v.spo2 || '98'}%</td>
              <td class="mono">${v.rr || '18'}</td>
              <td style="color:#64748b">Nurse Preethi</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

function renderClinicalTab(panel, patient) {
  panel.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px">
      <h2 style="font-size:15px;font-weight:600;margin:0">Clinical Documentation</h2>
      <div style="display:flex;gap:8px">
        <button class="btn-p" onclick="window.openActionModal('add-note', '${patient.uhid}')">+ Add Note</button>
        <button class="btn-g" onclick="window.openActionModal('add-diag', '${patient.uhid}')">+ Add Diagnosis</button>
      </div>
    </div>

    <div class="card">
      <div class="card-hdr"><span class="card-title">Diagnosis & ICD-10 Coding</span></div>
      <div style="padding:14px 16px">
        <div style="margin-bottom:12px">
          <div style="font-size:10px;font-weight:600;color:#94a3b8;font-family:'JetBrains Mono',monospace;text-transform:uppercase;letter-spacing:.5px;margin-bottom:8px">Primary / Provisional</div>
          <div style="display:flex;align-items:center;justify-content:space-between;padding:8px 10px;background:#fff5f5;border:1px solid #fca5a5;border-radius:8px">
            <div>
              <div style="font-size:12.5px;font-weight:600;color:#1e293b">${patient.clinicalData.diagnosis || 'Unstable Angina — NSTEMI'}</div>
              <div style="font-size:10px;color:#94a3b8;margin-top:2px;font-family:'JetBrains Mono',monospace">ICD-10: I21.4 · Confirmed · 14 Jun 2026</div>
            </div>
            <span class="badge b-re">Active</span>
          </div>
        </div>
        <div>
          <div style="font-size:10px;font-weight:600;color:#94a3b8;font-family:'JetBrains Mono',monospace;text-transform:uppercase;letter-spacing:.5px;margin-bottom:8px">Active Diagnoses / Co-morbidities</div>
          <div style="display:flex;flex-direction:column;gap:6px">
            ${(patient.diagnosesList || []).map(d => `
              <div style="display:flex;align-items:center;justify-content:space-between;padding:6px 10px;border:1px solid #e2e8f0;border-radius:8px">
                <div>
                  <div style="font-size:12px;font-weight:500">${d.name}</div>
                  <div style="font-size:10px;color:#94a3b8;font-family:'JetBrains Mono',monospace">ICD-10: ${d.code} · ${d.date || '2026-06-15'}</div>
                </div>
                <span class="badge ${d.status === 'Active' ? 'b-re' : 'b-sl'}">${d.status}</span>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="card-hdr"><span class="card-title">Consultation / SOAP Progress Notes</span></div>
      <div style="padding:14px 16px; display:flex; flex-direction:column; gap:10px;">
        ${(patient.clinicalNotes || []).map(n => `
          <div style="padding:10px 12px;border:1px solid #e2e8f0;border-radius:8px;">
            <div style="display:flex;justify-content:space-between;margin-bottom:6px">
              <span style="font-size:12px;font-weight:600">${n.type} — ${n.author}</span>
              <span style="font-size:10px;color:#94a3b8;font-family:'JetBrains Mono',monospace">${n.date}</span>
            </div>
            <div style="font-size:11.5px;color:#475569;line-height:1.6;white-space:pre-wrap;">${n.content}</div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function renderOrdersTab(panel, patient) {
  const patientOrders = state.orders.filter(o => o.uhid === patient.uhid);

  panel.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px">
      <h2 style="font-size:15px;font-weight:600;margin:0">Unified Diagnostic & Procedure Orders</h2>
      <div style="display:flex;gap:8px">
        <button class="btn-p" onclick="window.openActionModal('order-lab', '${patient.uhid}')">+ Order Lab</button>
        <button class="btn-g" onclick="window.openActionModal('order-rad', '${patient.uhid}')">+ Order Radiology</button>
        <button class="btn-g" onclick="window.openActionModal('order-proc', '${patient.uhid}')">+ Request Procedure</button>
      </div>
    </div>

    <div class="card">
      <table class="profile-table">
        <thead>
          <tr>
            <th>Order Detail</th>
            <th>Type</th>
            <th>Ordered By</th>
            <th>Date Ordered</th>
            <th>Priority</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          ${patientOrders.length === 0 ? `<tr><td colspan="6" style="text-align:center;color:#64748b;">No active orders found for this patient.</td></tr>` : 
            patientOrders.map(o => {
              const otCase = o.otCaseId ? state.ot?.scheduledCases?.find(c => c.id === o.otCaseId) : state.ot?.scheduledCases?.find(c => c.patientUhid === patient.uhid && c.procedure === o.name && c.status === 'Requested');
              const canEdit = otCase && otCase.status === 'Requested';
              return `
              <tr>
                <td class="fw6">
                  <strong>${o.name}</strong>
                  ${otCase ? `
                    <div style="font-size: 10px; color: #475569; margin-top: 3px; font-weight: normal; line-height: 1.4;">
                      🗓️ <strong>OT Slot:</strong> ${otCase.date} ${otCase.time} (${otCase.duration} hrs) in <strong>${otCase.theatre}</strong><br>
                      👨‍⚕️ <strong>Surgeon:</strong> ${otCase.surgeon} &bull; <strong>Anaesthetist:</strong> ${otCase.anaesthetist}
                    </div>
                  ` : ''}
                  <div style="display: flex; gap: 8px; margin-top: 5px; margin-bottom: 2px;">
                    ${otCase ? `<button class="btn btn-xs" style="font-size: 10px; padding: 2px 6px; border: 1px solid #1B3A5C; color: #1B3A5C; border-radius: 4px; background: transparent; cursor: pointer; display: inline-flex; align-items: center; gap: 3px;" onclick="window.viewOTRequestDetails('${otCase.id}')">👁️ View Details</button>` : ''}
                    ${canEdit ? `<button class="btn btn-xs" style="font-size: 10px; padding: 2px 6px; border: 1px solid #0f766e; color: #0f766e; border-radius: 4px; background: transparent; cursor: pointer; display: inline-flex; align-items: center; gap: 3px;" onclick="window.openEditOTRequestModal('${otCase.id}')">✏️ Edit Request</button>` : ''}
                  </div>
                  <small style="color:#94a3b8;">Order ID: ${o.id}</small>
                </td>
                <td><span class="badge ${o.type === 'Laboratory' ? 'b-cy' : (o.type === 'Radiology' ? 'b-pu' : 'b-or')}">${o.type}</span></td>
                <td style="color:#64748b">${o.doctorName || 'Dr. Ramesh Kumar'}</td>
                <td class="mono" style="font-size:11px;color:#64748b">${o.date}</td>
                <td><span class="badge ${o.priority === 'Urgent' ? 'b-re' : 'b-sl'}">${o.priority}</span></td>
                <td><span class="badge ${o.status === 'Approved' || o.status === 'Completed' ? 'b-gr' : 'b-am'}">${o.status}</span></td>
              </tr>
              `;
            }).join('')
          }
        </tbody>
      </table>
    </div>
  `;
}

function renderReportsTab(panel, patient) {
  panel.innerHTML = `
    <div style="margin-bottom:16px">
      <h2 style="font-size:15px;font-weight:600;margin:0">Diagnostic Reports Dossier</h2>
    </div>

    <!-- Laboratory Reports -->
    <div class="card">
      <div class="card-hdr"><span class="card-title">Laboratory Reports</span></div>
      <table class="profile-table">
        <thead><tr><th>Test Name</th><th>Sample ID</th><th>Date</th><th>Result</th><th>Flag</th><th>Validated By</th><th></th></tr></thead>
        <tbody>
          <tr>
            <td class="fw6" style="font-weight:600">Cardiac Markers (Troponin I)</td>
            <td class="mono" style="font-size:11px;color:#94a3b8">SP-2026-7741</td>
            <td class="mono" style="font-size:11px">16 Jun 2026</td>
            <td><span style="font-size:12px;font-weight:600;color:#dc2626">${patient.vitals.temp > 100 || patient.name.includes('Rajesh') ? '8.4 ng/mL' : '0.02 ng/mL'}</span></td>
            <td><span class="badge ${patient.vitals.temp > 100 || patient.name.includes('Rajesh') ? 'b-re' : 'b-gr'}">${patient.vitals.temp > 100 || patient.name.includes('Rajesh') ? 'Critical ↑' : 'Normal'}</span></td>
            <td style="color:#64748b;font-size:11px">Dr. Anand M.</td>
            <td><button class="btn-g btn-xs" onclick="alert('Displaying Troponin I PDF Report...')">View PDF</button></td>
          </tr>
          <tr>
            <td class="fw6" style="font-weight:600">CK-MB</td>
            <td class="mono" style="font-size:11px;color:#94a3b8">SP-2026-7741</td>
            <td class="mono" style="font-size:11px">16 Jun 2026</td>
            <td><span style="font-size:12px;font-weight:600;color:#d97706">${patient.vitals.temp > 100 || patient.name.includes('Rajesh') ? '48 U/L' : '12 U/L'}</span></td>
            <td><span class="badge ${patient.vitals.temp > 100 || patient.name.includes('Rajesh') ? 'b-am' : 'b-gr'}">${patient.vitals.temp > 100 || patient.name.includes('Rajesh') ? 'High ↑' : 'Normal'}</span></td>
            <td style="color:#64748b;font-size:11px">Dr. Anand M.</td>
            <td><button class="btn-g btn-xs" onclick="alert('Displaying CK-MB PDF Report...')">View PDF</button></td>
          </tr>
          <tr>
            <td class="fw6" style="font-weight:600">Lipid Profile</td>
            <td class="mono" style="font-size:11px;color:#94a3b8">SP-2026-7639</td>
            <td class="mono" style="font-size:11px">02 Jun 2026</td>
            <td><span style="font-size:12px;color:#475569">Total Chol: 224</span></td>
            <td><span class="badge b-am">Borderline ↑</span></td>
            <td style="color:#64748b;font-size:11px">Dr. Anand M.</td>
            <td><button class="btn-g btn-xs" onclick="alert('Displaying Lipid Profile PDF Report...')">View PDF</button></td>
          </tr>
          <tr>
            <td class="fw6" style="font-weight:600">HbA1c (Glycated Haemoglobin)</td>
            <td class="mono" style="font-size:11px;color:#94a3b8">SP-2026-7612</td>
            <td class="mono" style="font-size:11px">02 Jun 2026</td>
            <td><span style="font-size:12px;font-weight:600;color:#d97706">8.1%</span></td>
            <td><span class="badge b-am">High ↑</span></td>
            <td style="color:#64748b;font-size:11px">Dr. Anand M.</td>
            <td><button class="btn-g btn-xs" onclick="alert('Displaying HbA1c PDF Report...')">View PDF</button></td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Radiology Reports -->
    <div class="card">
      <div class="card-hdr"><span class="card-title">Radiology Reports</span></div>
      <table class="profile-table">
        <thead><tr><th>Study</th><th>Modality</th><th>Date</th><th>Impression</th><th>Radiologist</th><th></th></tr></thead>
        <tbody>
          <tr>
            <td class="fw6" style="font-weight:600">Chest PA View</td>
            <td><span class="badge b-pu">X-Ray</span></td>
            <td class="mono" style="font-size:11px">16 Jun 2026</td>
            <td style="font-size:11.5px;color:#475569">Mild cardiomegaly. No consolidation or pleural effusion.</td>
            <td style="color:#64748b;font-size:11px">Dr. Kavitha R.</td>
            <td><button class="btn-g btn-xs" onclick="alert('Opening Chest PA X-Ray View Report...')">View Report</button></td>
          </tr>
          <tr>
            <td class="fw6" style="font-weight:600">Echocardiogram 2D</td>
            <td><span class="badge b-cy">USG</span></td>
            <td class="mono" style="font-size:11px">14 Jun 2026</td>
            <td style="font-size:11.5px;color:#475569">EF 45%. Regional wall motion abnormality. Mild MR.</td>
            <td style="color:#64748b;font-size:11px">Dr. Kavitha R.</td>
            <td><button class="btn-g btn-xs" onclick="alert('Opening Echocardiogram Report...')">View Report</button></td>
          </tr>
        </tbody>
      </table>
    </div>
  `;
}

function renderMedicationsTab(panel, patient) {
  panel.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px">
      <h2 style="font-size:15px;font-weight:600;margin:0">Medications Management</h2>
      <button class="btn-p" onclick="window.openActionModal('create-rx', '${patient.uhid}')">+ Prescribe</button>
    </div>

    <div style="display:grid; grid-template-columns: 2fr 1.2fr; gap:1.25rem;">
      <!-- Active Medications -->
      <div class="card" style="margin-bottom:0;">
        <div class="card-hdr"><span class="card-title">Active Medications</span></div>
        <table class="profile-table">
          <thead>
            <tr>
              <th>Drug</th>
              <th>Dose / Route</th>
              <th>Frequency</th>
              <th>Duration</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            ${patient.prescriptions.length === 0 ? `<tr><td colspan="6" style="text-align:center;color:#64748b;">No active prescriptions found.</td></tr>` : 
              patient.prescriptions.map((p, idx) => `
                <tr>
                  <td class="fw6" style="font-weight:600">💊 ${p.drug}</td>
                  <td>${p.dose || '75 mg'} · Oral</td>
                  <td>${p.freq || 'Once daily'}</td>
                  <td>${p.duration || 'Continued'}</td>
                  <td><span class="badge b-pu">Active</span></td>
                  <td>
                    <button class="btn-g btn-xs" onclick="window.stopMedicationFromProfile('${patient.uhid}', ${idx})">Stop</button>
                  </td>
                </tr>
              `).join('')
            }
          </tbody>
        </table>
      </div>

      <!-- Medication History -->
      <div class="card" style="margin-bottom:0;">
        <div class="card-hdr"><span class="card-title">Medication Logs / Stopped</span></div>
        <div style="padding:14px; display:flex; flex-direction:column; gap:8px;">
          ${(patient.pastPrescriptions || []).map(pp => `
            <div style="background:#f8fafc; border:1px solid #e2e8f0; padding:10px; border-radius:8px; border-left:3px solid #94a3b8;">
              <div style="font-size:12px; font-weight:600; color:#1e293b;">${pp.drug}</div>
              <div style="font-size:10.5px; color:#64748b; margin-top:2px;">Dose: ${pp.dose} · Stopped: ${pp.stopReason || 'Course completed'}</div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;

  // Custom stop medication handler that updates the UI immediately
  window.stopMedicationFromProfile = function(uhid, idx) {
    const p = state.patients.find(pt => pt.uhid === uhid);
    if (!p) return;
    const stopped = p.prescriptions.splice(idx, 1)[0];
    p.pastPrescriptions.unshift({
      drug: stopped.drug,
      dose: stopped.dose || '75 mg',
      freq: stopped.freq,
      duration: stopped.duration,
      stopReason: "Stopped by Clinician rounds"
    });
    
    state.auditLogs.push({
      timestamp: new Date().toISOString(),
      user: state.activeUserRole || 'Doctor',
      uhid: p.uhid,
      patientName: p.name,
      action: "Stop Medication",
      details: `Stopped prescribing: ${stopped.drug}`
    });

    renderMedicationsTab(panel, p);
  };
  
  // Compatibility alias
  window.stopMedication = window.stopMedicationFromProfile;
}

function renderAdmissionTab(panel, patient) {
  const admission = state.admissions.find(a => a.uhid === patient.uhid && a.status === 'Active');

  panel.innerHTML = `
    <div style="margin-bottom:16px">
      <h2 style="font-size:15px;font-weight:600;margin:0">ATD (Admission, Transfer &amp; Discharge)</h2>
    </div>

    <div class="atd-grid-container">
      <!-- Current Inpatient details -->
      <div class="card" style="margin-bottom:0; border-color:#c4b5fd;">
        <div class="card-hdr" style="background:#f5f3ff;">
          <span class="card-title" style="color:#7c3aed; font-weight:700;">Current Inpatient Admission</span>
          <span class="badge b-pu">${admission ? 'Active · ' + (patient.age % 5 + 1) + ' days' : 'No Active Admission'}</span>
        </div>
        <div style="padding:14px 16px; display:flex; flex-direction:column; gap:12px;">
          ${admission ? `
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
              <div>
                <div style="font-size:10px;color:#94a3b8;font-family:'JetBrains Mono',monospace;text-transform:uppercase;letter-spacing:.5px;margin-bottom:3px">Admitted</div>
                <div style="font-size:12.5px;font-weight:500">${admission.date} · 08:30</div>
              </div>
              <div>
                <div style="font-size:10px;color:#94a3b8;font-family:'JetBrains Mono',monospace;text-transform:uppercase;letter-spacing:.5px;margin-bottom:3px">Ward / Bed</div>
                <div style="font-size:12.5px;font-weight:500">${admission.ward} · Bed ${admission.bed}</div>
              </div>
              <div>
                <div style="font-size:10px;color:#94a3b8;font-family:'JetBrains Mono',monospace;text-transform:uppercase;letter-spacing:.5px;margin-bottom:3px">Consultant</div>
                <div style="font-size:12.5px;font-weight:500">${admission.doctorName}</div>
              </div>
              <div>
                <div style="font-size:10px;color:#94a3b8;font-family:'JetBrains Mono',monospace;text-transform:uppercase;letter-spacing:.5px;margin-bottom:3px">Admission Type</div>
                <div style="font-size:12.5px;font-weight:500">Regular Inpatient Care</div>
              </div>
            </div>
            <div style="border-top:1px solid #f1f5f9; padding-top:10px; display:flex; gap:8px; margin-top:4px;">
              <button class="btn btn-p btn-xs" onclick="window.initiatePatientTransfer('${patient.uhid}')">🔁 Transfer Bed</button>
              <button class="btn btn-g btn-xs" onclick="window.initiatePatientTransfer('${patient.uhid}')">🛏️ Change Ward</button>
            </div>
            
            <div style="border-top:1px solid #f1f5f9; padding-top:10px;">
              <div style="font-size:10px;font-weight:600;color:#94a3b8;font-family:'JetBrains Mono',monospace;text-transform:uppercase;letter-spacing:.5px;margin-bottom:8px">Bed Transfer Log</div>
              <div style="display:flex;align-items:center;justify-content:space-between;font-size:11.5px">
                <div style="display:flex;align-items:center;gap:8px"><span class="badge b-re">Emergency Resus 1</span><span style="color:#94a3b8">→</span><span class="badge b-pu">${admission.ward} · Bed ${admission.bed}</span></div>
                <span style="font-size:10px;color:#94a3b8;font-family:'JetBrains Mono',monospace">16 Jun · 10:45 AM</span>
              </div>
            </div>
          ` : `
            <div style="text-align:center; color:#64748b; padding:12px 0;">
              This patient is currently not admitted to any Inpatient ward.
              ${patient.type !== 'IPD' ? `<div style="margin-top:8px;"><button class="btn-p btn-xs" onclick="window.openActionModal('admit', '${patient.uhid}')">🏥 Admit Patient</button></div>` : ''}
            </div>
          `}
        </div>
      </div>

      <!-- Card 2: Patient Discharge Workflow -->
      <div class="card" style="margin-bottom:0; border-color:#fca5a5;">
        <div class="card-hdr" style="background:#fff5f5;">
          <span class="card-title" style="color:#dc2626; font-weight:700;">🚪 Patient Discharge Workflow</span>
          <span class="badge ${patient.status === 'Discharged' ? 'b-gr' : 'b-re'}">${patient.status === 'Discharged' ? 'Discharged' : 'Pending Clearance'}</span>
        </div>
        <div style="padding:14px 16px; display:flex; flex-direction:column; gap:12px;">
          ${admission ? `
            <div style="font-size:13px; display:flex; flex-direction:column; gap:0.5rem; margin-bottom:4px;">
              <div style="display:flex; justify-content:space-between; align-items:center;">
                <span style="font-weight:500; color:#475569">Doctor Clearance:</span>
                <span class="badge ${patient.dischargeClearances?.clinical ? 'b-gr' : 'b-am'}">
                  ${patient.dischargeClearances?.clinical ? 'Cleared' : 'Pending'}
                </span>
              </div>
              <div style="display:flex; justify-content:space-between; align-items:center;">
                <span style="font-weight:500; color:#475569">Billing Clearance:</span>
                <span class="badge ${patient.dischargeClearances?.billing ? 'b-gr' : 'b-am'}">
                  ${patient.dischargeClearances?.billing ? 'Cleared' : 'Pending'}
                </span>
              </div>
              <div style="display:flex; justify-content:space-between; align-items:center;">
                <span style="font-weight:500; color:#475569">Summary Status:</span>
                <span class="badge ${patient.dischargeClearances?.summaryReady ? 'b-gr' : 'b-am'}">
                  ${patient.dischargeClearances?.summaryReady ? 'Entered' : 'Pending'}
                </span>
              </div>
            </div>
            
            <div style="border-top:1px solid #f1f5f9; padding-top:12px; display:flex; flex-direction:column; gap:8px;">
              <button class="btn btn-g btn-sm" style="width:100%; justify-content:center;" onclick="window.initiatePatientDischarge('${patient.uhid}')">Initiate Discharge</button>
              <button class="btn btn-p btn-sm" style="width:100%; justify-content:center; background:#ef4444; color:#fff; border:none;" onclick="window.initiatePatientDischarge('${patient.uhid}')" ${(!patient.dischargeClearances?.clinical || !patient.dischargeClearances?.billing) ? 'disabled' : ''}>Complete Discharge</button>
            </div>
          ` : `
            <div style="text-align:center; color:#64748b; padding:12px 0;">
              Discharge actions are only applicable for currently admitted inpatient cases.
            </div>
          `}
        </div>
      </div>

      <!-- Card 3: Past Admissions History -->
      <div class="card" style="margin-bottom:0;">
        <div class="card-hdr"><span class="card-title">Past Admissions History</span></div>
        <table class="profile-table">
          <thead><tr><th>Date</th><th>Days</th><th>Diagnosis</th></tr></thead>
          <tbody>
            <tr>
              <td class="mono" style="font-size:11px">08 Mar 2025</td>
              <td class="mono">6</td>
              <td>ACS</td>
            </tr>
            <tr>
              <td class="mono" style="font-size:11px">12 Nov 2024</td>
              <td class="mono">2</td>
              <td>Colonoscopy</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function renderReferralsTab(panel, patient) {
  panel.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px">
      <h2 style="font-size:15px;font-weight:600;margin:0">Referrals &amp; Consultant Consultations</h2>
      <button class="btn-p" onclick="alert('Creating new consultation referral request...')">+ New Referral</button>
    </div>

    <div class="card">
      <table class="profile-table">
        <thead><tr><th>Referral To</th><th>Specialty</th><th>Reason</th><th>Referred By</th><th>Date Requested</th><th>Status</th><th>Outcome / Details</th></tr></thead>
        <tbody>
          <tr>
            <td class="fw6" style="font-weight:600">Dr. Vikram P.</td>
            <td><span class="badge b-bl">Diabetology</span></td>
            <td style="font-size:11.5px;color:#475569">Uncontrolled T2DM, HbA1c 8.1%</td>
            <td style="font-size:11px;color:#64748b">Dr. Ramesh Kumar</td>
            <td class="mono" style="font-size:11px">16 Jun 2026</td>
            <td><span class="badge b-gr">Completed</span></td>
            <td style="font-size:11.5px;color:#475569">Insulin therapy initiated. Monitor sugar levels.</td>
          </tr>
          <tr>
            <td class="fw6" style="font-weight:600">Dr. Anand S.</td>
            <td><span class="badge b-pu">Cardiac Cath</span></td>
            <td style="font-size:11.5px;color:#475569">Coronary angiography — NSTEMI workup</td>
            <td style="font-size:11px;color:#64748b">Dr. Ramesh Kumar</td>
            <td class="mono" style="font-size:11px">17 Jun 2026</td>
            <td><span class="badge b-am">Scheduled</span></td>
            <td style="font-size:11.5px;color:#94a3b8">Appt set for 18 Jun 2026</td>
          </tr>
        </tbody>
      </table>
    </div>
  `;
}

function renderBillingTab(panel, patient) {
  const activeBill = state.billing.find(b => b.uhid === patient.uhid && b.status !== 'Settled') || { id: "INV8002", amount: 184250, paid: 25000, items: [] };
  const outstandingBal = activeBill.amount - activeBill.paid;
  const isCorporate = patient.payerType === 'Company' || patient.payer === 'STAR HEALTH AND ALLIED INSURANCE CO. LTD';

  panel.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px">
      <h2 style="font-size:15px;font-weight:600;margin:0">Billing &amp; Financial Ledger</h2>
      <div style="display:flex;gap:8px">
        <button class="btn-p" onclick="window.openActionModal('collect-pay', '${patient.uhid}')">💵 Collect Payment</button>
        <button class="btn-g" onclick="window.openActionModal('gen-bill', '${patient.uhid}')">+ Generate Charge</button>
      </div>
    </div>

    <!-- Summary cards -->
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:16px">
      <div style="background:#fff;border:1px solid #e2e8f0;border-radius:10px;padding:14px">
        <div style="font-size:10px;color:#94a3b8;font-family:'JetBrains Mono',monospace;text-transform:uppercase;letter-spacing:.5px;margin-bottom:5px">Total Charges</div>
        <div style="font-size:22px;font-weight:700;font-family:'JetBrains Mono',monospace;color:#0f172a">₹${activeBill.amount.toLocaleString('en-IN')}</div>
        <div style="font-size:10px;color:#94a3b8;margin-top:3px">Accumulated to date</div>
      </div>
      <div style="background:#fff;border:1px solid #e2e8f0;border-radius:10px;padding:14px">
        <div style="font-size:10px;color:#94a3b8;font-family:'JetBrains Mono',monospace;text-transform:uppercase;letter-spacing:.5px;margin-bottom:5px">Pre-Auth Approved</div>
        <div style="font-size:22px;font-weight:700;font-family:'JetBrains Mono',monospace;color:#059669">${isCorporate ? '₹2,00,000' : '₹0'}</div>
        <div style="font-size:10px;color:#059669;margin-top:3px;font-weight:500">${isCorporate ? 'Insurance · Star Health' : 'No corporate sponsor'}</div>
      </div>
      <div style="background:#fff;border:1px solid #e2e8f0;border-radius:10px;padding:14px">
        <div style="font-size:10px;color:#94a3b8;font-family:'JetBrains Mono',monospace;text-transform:uppercase;letter-spacing:.5px;margin-bottom:5px">Outstanding Balance</div>
        <div style="font-size:22px;font-weight:700;font-family:'JetBrains Mono',monospace;color:${outstandingBal > 0 ? '#dc2626' : '#0f172a'}">₹${outstandingBal.toLocaleString('en-IN')}</div>
        <div style="font-size:10px;color:#94a3b8;margin-top:3px">Dues pending payment</div>
      </div>
    </div>

    <!-- Charge breakdown -->
    <div class="card">
      <div class="card-hdr"><span class="card-title">Detailed Charge Items Breakdown</span></div>
      <table class="profile-table">
        <thead><tr><th>Service / Item</th><th>Category</th><th>Date Charged</th><th>Qty</th><th>Amount (₹)</th></tr></thead>
        <tbody>
          ${activeBill.items && activeBill.items.length > 0 ? 
            activeBill.items.map(item => `
              <tr>
                <td class="fw6" style="font-weight:600">${item.desc}</td>
                <td><span class="badge b-sl">Service</span></td>
                <td class="mono" style="font-size:11px">17 Jun</td>
                <td class="mono">${item.qty}</td>
                <td class="mono fw6" style="font-weight:600">₹${item.total}</td>
              </tr>
            `).join('') : `
            <tr><td class="fw6" style="font-weight:600">Room / Bed Charges — Ward A</td><td><span class="badge b-pu">Ward</span></td><td class="mono" style="font-size:11px">14–17 Jun</td><td class="mono">3 days</td><td class="mono fw6" style="font-weight:600">₹12,000</td></tr>
            <tr><td class="fw6" style="font-weight:600">Cardiology Specialist Consultation</td><td><span class="badge b-gr">OPD</span></td><td class="mono" style="font-size:11px">14 Jun</td><td class="mono">1</td><td class="mono fw6" style="font-weight:600">₹1,500</td></tr>
            <tr><td class="fw6" style="font-weight:600">Cardiac Markers Panel</td><td><span class="badge b-cy">Lab</span></td><td class="mono" style="font-size:11px">16 Jun</td><td class="mono">1</td><td class="mono fw6" style="font-weight:600">₹4,800</td></tr>
            <tr><td class="fw6" style="font-weight:600">Echocardiogram 2D</td><td><span class="badge b-cy">Radiology</span></td><td class="mono" style="font-size:11px">14 Jun</td><td class="mono">1</td><td class="mono fw6" style="font-weight:600">₹5,500</td></tr>
            <tr><td class="fw6" style="font-weight:600">Chest X-Ray PA View</td><td><span class="badge b-pu">Radiology</span></td><td class="mono" style="font-size:11px">16 Jun</td><td class="mono">1</td><td class="mono fw6" style="font-weight:600">₹800</td></tr>
            <tr><td class="fw6" style="font-weight:600">Inpatient Care Pharmacy Medications</td><td><span class="badge b-pk">Pharmacy</span></td><td class="mono" style="font-size:11px">14–17 Jun</td><td class="mono">—</td><td class="mono fw6" style="font-weight:600">₹18,650</td></tr>
            <tr><td class="fw6" style="font-weight:600">Nursing Charges</td><td><span class="badge b-bl">Nursing</span></td><td class="mono" style="font-size:11px">14–17 Jun</td><td class="mono">3 days</td><td class="mono fw6" style="font-weight:600">₹3,000</td></tr>
          `}
        </tbody>
      </table>
    </div>
  `;
}

function renderDocumentsTab(panel, patient) {
  panel.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px">
      <h2 style="font-size:15px;font-weight:600;margin:0">Uploaded Dossier Documents</h2>
      <button class="btn-p" onclick="window.openActionModal('upload-doc', '${patient.uhid}')">+ Upload Document</button>
    </div>

    <div class="card">
      <table class="profile-table">
        <thead>
          <tr>
            <th>File Name</th>
            <th>Category</th>
            <th>Uploaded Date</th>
            <th>File Size</th>
            <th>Uploaded By</th>
            <th style="text-align:right;">Actions</th>
          </tr>
        </thead>
        <tbody>
          ${(patient.documents || []).map(d => `
            <tr>
              <td class="fw6" style="font-weight:600">📁 ${d.name}</td>
              <td><span class="badge b-sl">${d.type}</span></td>
              <td class="mono" style="font-size:11px">${d.date}</td>
              <td class="mono">${d.size}</td>
              <td style="color:#64748b">${d.author || 'Front Desk'}</td>
              <td style="text-align:right;">
                <button class="btn btn-g btn-xs" onclick="alert('Opening Document Preview for ${d.name}...')">Preview</button>
                <button class="btn btn-g btn-xs" onclick="alert('Sending document ${d.name} to default printer...')">Print</button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

// --------------------------------------------------------------------------
// 4. DOSSIER ACTION OVERLAY FORM TRIGGERS
// --------------------------------------------------------------------------
window.closeActionModal = function() {
  const modal = document.getElementById('patient-action-modal');
  if (modal) {
    if (modal.classList && typeof modal.classList.remove === 'function') {
      modal.classList.remove('active');
    }
    if (modal.style) {
      modal.style.display = 'none';
      modal.style.overflowY = '';
      modal.style.alignItems = 'center';
    }
    const modalBox = (typeof modal.querySelector === 'function') ? modal.querySelector('.modal-box') : null;
    const modalBody = (typeof modal.querySelector === 'function') ? modal.querySelector('.modal-body') : null;
    if (modalBox && modalBox.style) {
      modalBox.style.maxWidth = '900px';
      modalBox.style.maxHeight = '90vh';
      modalBox.style.margin = '0';
    }
    if (modalBody && modalBody.style) {
      modalBody.style.overflowY = 'auto';
    }
  }
  window.apptConfirmPhase = false;
};

window.openActionModal = function(actionKey, uhid, optionalType) {
  const patient = state.patients.find(p => p.uhid === uhid);
  if (!patient) return;

  let modal = document.getElementById('patient-action-modal');
  if (!modal && typeof document.createElement === 'function') {
    modal = document.createElement('div');
    modal.id = 'patient-action-modal';
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="modal-box" style="max-width: 900px; border-radius: var(--radius-md); box-shadow: var(--shadow-lg);">
        <div class="modal-header" style="background-color: var(--bg-surface-elevated); border-bottom: 1px solid var(--border-color); padding: 1rem; display: flex; justify-content: space-between; align-items: center;">
          <h4 class="modal-title" id="action-modal-title" style="margin: 0; font-weight: 700;">Action Panel</h4>
          <span class="modal-close" style="cursor: pointer; font-size: 1.5rem; line-height: 1;" onclick="window.closeActionModal()">&times;</span>
        </div>
        <div class="modal-body" id="action-modal-body" style="padding: 1.5rem; font-size: 0.85rem; display: flex; flex-direction: column; gap: 1.25rem;">
          <!-- Populated dynamically -->
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  }

  const title = document.getElementById('action-modal-title');
  const body = document.getElementById('action-modal-body');
  
  if (modal) {
    const modalBox = (typeof modal.querySelector === 'function') ? modal.querySelector('.modal-box') : null;
    const modalBody = (typeof modal.querySelector === 'function') ? modal.querySelector('.modal-body') : null;
    if (actionKey === 'order-lab' || actionKey === 'create-rx' || actionKey === 'order-rad') {
      if (modalBox && modalBox.style) {
        modalBox.style.maxWidth = '900px';
        modalBox.style.maxHeight = 'none';
        modalBox.style.margin = '2rem auto';
      }
      if (modalBody && modalBody.style) {
        modalBody.style.overflowY = 'visible';
      }
      if (modal.style) {
        modal.style.overflowY = 'auto';
        modal.style.alignItems = 'flex-start';
      }
    } else {
      if (modalBox && modalBox.style) {
        modalBox.style.maxWidth = '900px';
        modalBox.style.maxHeight = '90vh';
        modalBox.style.margin = '0';
      }
      if (modalBody && modalBody.style) {
        modalBody.style.overflowY = 'auto';
      }
      if (modal.style) {
        modal.style.overflowY = '';
        modal.style.alignItems = 'center';
      }
    }
  }

  title.innerText = `${actionKey.toUpperCase().replace('-', ' ')} - Patient: ${patient.name}`;

  switch(actionKey) {
    case 'start-consult':
      body.innerHTML = `
        <div class="form-group">
          <label class="form-label">Consultation Rounds Type</label>
          <select id="consult-type" class="form-select">
            <option>OPD First Visit Consultation</option>
            <option>OPD Followup Rounds</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Clinical Progress Notes (SOAP Format)</label>
          <textarea id="consult-notes" class="form-control" rows="4" placeholder="S: patient reports...&#10;O: chest clear...&#10;A: stable...&#10;P: Dolo 650mg..." required></textarea>
        </div>
        <div style="display:flex; justify-content:flex-end; gap:0.5rem; margin-top:1rem;">
          <button class="btn btn-secondary" onclick="window.closeActionModal()">Cancel</button>
          <button class="btn btn-primary" onclick="window.executePatientAction('start-consult', '${uhid}')">Save Consultation</button>
        </div>
      `;
      break;

    case 'add-note':
      const defaultNoteType = optionalType || 'Clinical SOAP Note';
      body.innerHTML = `
        <div class="form-group">
          <label class="form-label">Clinical Note Category</label>
          <input type="text" id="note-type" class="form-control" value="${defaultNoteType}" disabled>
        </div>
        <div class="form-group">
          <label class="form-label">EMR Narrative Note Content</label>
          <textarea id="note-content" class="form-control" rows="4" placeholder="Type findings or rounds notes here..." required></textarea>
        </div>
        <div style="display:flex; justify-content:flex-end; gap:0.5rem; margin-top:1rem;">
          <button class="btn btn-secondary" onclick="window.closeActionModal()">Cancel</button>
          <button class="btn btn-primary" onclick="window.executePatientAction('add-note', '${uhid}')">Save note</button>
        </div>
      `;
      break;

    case 'add-diag':
      body.innerHTML = `
        <div class="form-group">
          <label class="form-label">ICD-10 Code Reference</label>
          <input type="text" id="diag-code" class="form-control" placeholder="e.g. I10" required>
        </div>
        <div class="form-group">
          <label class="form-label">Diagnosis Description Name</label>
          <input type="text" id="diag-name" class="form-control" placeholder="e.g. Essential hypertension" required>
        </div>
        <div style="display:flex; justify-content:flex-end; gap:0.5rem; margin-top:1rem;">
          <button class="btn btn-secondary" onclick="window.closeActionModal()">Cancel</button>
          <button class="btn btn-primary" onclick="window.executePatientAction('add-diag', '${uhid}')">Add Diagnosis</button>
        </div>
      `;
      break;

    case 'create-rx':
      setTimeout(() => {
        window.renderPrescriptionWorkflow(body, patient);
      }, 0);
      break;

    case 'order-lab':
      window.tempSelectedLabTests = [];
      setTimeout(() => {
        window.renderLabOrderingWorkflow(body, patient);
      }, 0);
      break;

    case 'order-rad':
      window.tempSelectedRadInvestigations = [];
      setTimeout(() => {
        window.renderRadOrderingWorkflow(body, patient);
      }, 0);
      break;

    case 'book-appt':
      // Define helper functions for date, time slot, and doctor autocomplete selection
      window.selectApptDateTab = function(btn, dateVal) {
        document.querySelectorAll('.date-tab-btn').forEach(el => el.classList.remove('active'));
        btn.classList.add('active');
        document.getElementById('appt-date').value = dateVal;
      };
      
      window.selectApptCustomDate = function(dateVal) {
        if (!dateVal) return;
        const btn = document.getElementById('custom-date-tab-btn');
        const formattedDate = new Date(dateVal).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
        btn.innerText = formattedDate;
        window.selectApptDateTab(btn, dateVal);
      };
      
      window.selectApptTimeSlot = function(btn, timeVal) {
        document.querySelectorAll('.time-slot-btn').forEach(el => el.classList.remove('active'));
        btn.classList.add('active');
        document.getElementById('appt-time-slot').value = timeVal;
      };

      window.filterApptDoctors = function(query) {
        const div = document.getElementById('appt-doctor-suggestions');
        if (!query.trim()) {
          div.style.display = 'none';
          return;
        }
        const filtered = state.doctors.filter(d => 
          d.name.toLowerCase().includes(query.toLowerCase()) || 
          d.spec.toLowerCase().includes(query.toLowerCase())
        );
        if (filtered.length === 0) {
          div.innerHTML = `<div style="padding: 0.5rem 0.75rem; font-size: 0.8rem; color: #64748b;">No matching specialists found</div>`;
        } else {
          div.innerHTML = filtered.map(d => `
            <div style="padding: 0.5rem 0.75rem; font-size: 0.8rem; cursor: pointer; border-bottom: 1px solid #f1f5f9; display: flex; justify-content: space-between; align-items: center;" onclick="window.selectApptDoctor('${d.name}', '${d.spec}')" onmouseover="this.style.background='#f8fafc'" onmouseout="this.style.background='none'">
              <strong>${d.name}</strong> <span style="color: #64748b; font-size: 0.75rem;">${d.spec}</span>
            </div>
          `).join('');
        }
        div.style.display = 'block';
      };

      window.selectApptDoctor = function(name, spec) {
        document.getElementById('appt-doctor-search').value = `${name} (${spec})`;
        document.getElementById('appt-doctor').value = name;
        document.getElementById('appt-doctor-suggestions').style.display = 'none';
      };

      // Add event listener to close suggestions when clicking outside
      document.addEventListener('click', function(e) {
        const suggs = document.getElementById('appt-doctor-suggestions');
        const searchInput = document.getElementById('appt-doctor-search');
        if (suggs && searchInput && !suggs.contains(e.target) && e.target !== searchInput) {
          suggs.style.display = 'none';
        }
      });

      const defaultDoctor = state.doctors[0] || { name: 'Dr. Abhishek Kumar', spec: 'Cardiologist' };

      body.innerHTML = `
        <style>
          .date-tab-btn {
            background: #f1f5f9;
            color: #475569;
            border: 1px solid #cbd5e1;
            border-radius: 6px;
            padding: 0.5rem 0.75rem;
            font-size: 0.8rem;
            font-weight: 500;
            cursor: pointer;
            white-space: nowrap;
            transition: all 0.2s;
          }
          .date-tab-btn.active {
            background: #fff;
            color: #0f172a;
            border-color: #0f172a;
            font-weight: 700;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          }
          .time-slot-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
            gap: 0.5rem;
            margin-bottom: 1rem;
          }
          .time-slot-btn {
            background: #f1f5f9;
            color: #475569;
            border: 1px solid #cbd5e1;
            border-radius: 6px;
            padding: 0.5rem;
            font-size: 0.8rem;
            text-align: center;
            cursor: pointer;
            font-weight: 500;
            transition: all 0.2s;
          }
          .time-slot-btn.active {
            background: #4a1228;
            color: #fff;
            border-color: #4a1228;
            font-weight: 600;
          }
        </style>

        <div class="form-group" style="margin-bottom: 1.25rem; position: relative;">
          <label class="form-label">Consulting Specialist</label>
          <input type="text" id="appt-doctor-search" class="form-control" placeholder="Search specialist by name or specialty..." oninput="window.filterApptDoctors(this.value)" value="${defaultDoctor.name} (${defaultDoctor.spec})" style="height: 38px;" autocomplete="off">
          <input type="hidden" id="appt-doctor" value="${defaultDoctor.name}">
          <div id="appt-doctor-suggestions" style="position: absolute; left: 0; top: 100%; width: 100%; background: #fff; border: 1px solid #cbd5e1; border-radius: 6px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); z-index: 1000; display: none; max-height: 180px; overflow-y: auto; margin-top: 2px;">
          </div>
        </div>

        <div class="form-group" style="margin-bottom: 1rem;">
          <label class="form-label">Select Date</label>
          <div class="appt-date-tabs" style="display: flex; gap: 0.5rem; overflow-x: auto; padding-bottom: 0.5rem; margin-bottom: 0.5rem;">
            <button class="date-tab-btn active" data-date="2026-06-25" onclick="window.selectApptDateTab(this, '2026-06-25')">25th Jun 2026</button>
            <button class="date-tab-btn" data-date="2026-06-26" onclick="window.selectApptDateTab(this, '2026-06-26')">26th Jun 2026</button>
            <button class="date-tab-btn" data-date="2026-06-27" onclick="window.selectApptDateTab(this, '2026-06-27')">27th Jun 2026</button>
            <button class="date-tab-btn" data-date="2026-06-28" onclick="window.selectApptDateTab(this, '2026-06-28')">28th Jun 2026</button>
            <button class="date-tab-btn" data-date="2026-06-29" onclick="window.selectApptDateTab(this, '2026-06-29')">29th Jun 2026</button>
            <div style="position: relative; display: inline-block;">
              <button class="date-tab-btn" id="custom-date-tab-btn" onclick="document.getElementById('appt-custom-date').showPicker()">Select Date</button>
              <input type="date" id="appt-custom-date" onchange="window.selectApptCustomDate(this.value)" style="opacity: 0; position: absolute; left: 0; top: 0; width: 100%; height: 100%; cursor: pointer;">
            </div>
          </div>
          <input type="hidden" id="appt-date" value="2026-06-25">
        </div>

        <div class="form-group" style="margin-bottom: 1rem;">
          <label class="form-label" style="font-weight: 600; display: block; margin-bottom: 0.5rem;">Morning</label>
          <div class="time-slot-grid">
            <button class="time-slot-btn" onclick="window.selectApptTimeSlot(this, '09:00 am - 09:15 am')">09:00 am - 09:15 am</button>
            <button class="time-slot-btn active" onclick="window.selectApptTimeSlot(this, '09:15 am - 09:30 am')">09:15 am - 09:30 am</button>
            <button class="time-slot-btn" onclick="window.selectApptTimeSlot(this, '09:30 am - 09:45 am')">09:30 am - 09:45 am</button>
            <button class="time-slot-btn" onclick="window.selectApptTimeSlot(this, '09:45 am - 10:00 am')">09:45 am - 10:00 am</button>
            <button class="time-slot-btn" onclick="window.selectApptTimeSlot(this, '10:00 am - 10:15 am')">10:00 am - 10:15 am</button>
          </div>
        </div>

        <div class="form-group" style="margin-bottom: 1rem;">
          <label class="form-label" style="font-weight: 600; display: block; margin-bottom: 0.5rem;">Evening</label>
          <div class="time-slot-grid">
            <button class="time-slot-btn" onclick="window.selectApptTimeSlot(this, '04:00 pm - 04:15 pm')">04:00 pm - 04:15 pm</button>
            <button class="time-slot-btn" onclick="window.selectApptTimeSlot(this, '04:15 pm - 04:30 pm')">04:15 pm - 04:30 pm</button>
            <button class="time-slot-btn" onclick="window.selectApptTimeSlot(this, '04:30 pm - 04:45 pm')">04:30 pm - 04:45 pm</button>
            <button class="time-slot-btn" onclick="window.selectApptTimeSlot(this, '04:45 pm - 05:00 pm')">04:45 pm - 05:00 pm</button>
            <button class="time-slot-btn" onclick="window.selectApptTimeSlot(this, '05:00 pm - 05:15 pm')">05:00 pm - 05:15 pm</button>
          </div>
          <input type="hidden" id="appt-time-slot" value="09:15 am - 09:30 am">
        </div>

        <div style="display:flex; justify-content:flex-end; gap:0.5rem; margin-top:1.5rem;">
          <button class="btn btn-secondary" onclick="window.closeActionModal()">Cancel</button>
          <button class="btn btn-primary" onclick="window.executePatientAction('book-appt', '${uhid}')">Book Appointment</button>
        </div>
      `;
      break;

    case 'admit':
      body.innerHTML = `
        <div class="form-group">
          <label class="form-label">Ward Category Selection</label>
          <select id="admit-ward" class="form-select" onchange="window.updateAdmitBedsList()">
            ${Object.entries(state.wards).map(([key, val]) => `<option value="${key}">${val.name} (₹${val.price}/day)</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Select vacant Bed ID</label>
          <select id="admit-bed" class="form-select" required>
            <!-- Loaded dynamically -->
          </select>
        </div>
        <div style="display:flex; justify-content:flex-end; gap:0.5rem; margin-top:1rem;">
          <button class="btn btn-secondary" onclick="window.closeActionModal()">Cancel</button>
          <button class="btn btn-primary" onclick="window.executePatientAction('admit', '${uhid}')">Confirm Bed Admission</button>
        </div>
      `;
      window.updateAdmitBedsList = function() {
        const wKey = document.getElementById('admit-ward').value;
        const bSelect = document.getElementById('admit-bed');
        let options = '';
        state.wards[wKey]?.beds.forEach(bed => {
          if (state.bedsStatus[bed]?.status === 'Available') {
            options += `<option value="${bed}">${bed}</option>`;
          }
        });
        bSelect.innerHTML = options || '<option value="">No beds available in this ward</option>';
      };
      window.updateAdmitBedsList();
      break;

    case 'rec-vitals':
      body.innerHTML = `
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.5rem;">
          <div class="form-group">
            <label class="form-label">Temperature (°F)</label>
            <input type="number" id="v-temp" class="form-control" value="${patient.vitals.temp || '98.6'}" step="0.1" required>
          </div>
          <div class="form-group">
            <label class="form-label">Pulse Rate (bpm)</label>
            <input type="number" id="v-hr" class="form-control" value="${patient.vitals.hr || '78'}" required>
          </div>
          <div class="form-group">
            <label class="form-label">BP (mmHg)</label>
            <input type="text" id="v-bp" class="form-control" value="${patient.vitals.bp || '120/80'}" required>
          </div>
          <div class="form-group">
            <label class="form-label">Respiratory Rate (/min)</label>
            <input type="number" id="v-rr" class="form-control" value="${patient.vitals.rr || '18'}" required>
          </div>
          <div class="form-group">
            <label class="form-label">SpO₂ (%)</label>
            <input type="number" id="v-spo2" class="form-control" value="${patient.vitals.spo2 || '98'}" required>
          </div>
          <div class="form-group">
            <label class="form-label">Weight (kg)</label>
            <input type="number" id="v-weight" class="form-control" value="${patient.vitals.weight || '70'}" required>
          </div>
          <div class="form-group">
            <label class="form-label">Pain Score (0-10)</label>
            <input type="number" id="v-pain" class="form-control" value="${patient.vitals.pain !== undefined ? patient.vitals.pain : '0'}" min="0" max="10" required>
          </div>
          <div class="form-group">
            <label class="form-label">Blood Sugar (mg/dL)</label>
            <input type="number" id="v-sugar" class="form-control" value="${patient.vitals.sugar || '110'}" required>
          </div>
          <div class="form-group">
            <label class="form-label">Urine Output (mL)</label>
            <input type="number" id="v-urine" class="form-control" value="${patient.vitals.urine || '500'}" required>
          </div>
          <div class="form-group">
            <label class="form-label">Oxygen Support</label>
            <input type="text" id="v-oxygen" class="form-control" value="${patient.vitals.oxygen || 'N/A'}" required>
          </div>
          <div class="form-group" style="grid-column: span 2;">
            <label class="form-label">Notes</label>
            <textarea id="v-notes" class="form-control" rows="2" placeholder="Enter clinical notes...">${patient.vitals.notes || ''}</textarea>
          </div>
        </div>
        <div style="display:flex; justify-content:flex-end; gap:0.5rem; margin-top:1rem;">
          <button class="btn btn-secondary" onclick="window.closeActionModal()">Cancel</button>
          <button class="btn btn-primary" onclick="window.executePatientAction('rec-vitals', '${uhid}')">Save Vitals</button>
        </div>
      `;
      break;

    case 'order-proc':
      const doctors = state.doctors || [];
      const surgeonsList = doctors.filter(d => d.spec === "General Surgery" || d.spec === "Orthopedics" || d.spec === "Gynecology & Obs" || d.spec === "Cardiology") || [];
      const anaesthetistsList = doctors.filter(d => d.spec === "Emergency Medicine" || d.spec === "Neurology" || d.spec === "Cardiology") || [];
      const theatresList = state.ot?.theatres || [];

      body.innerHTML = `
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-left">
          <div class="form-group md:col-span-2">
            <label class="form-label font-bold text-slate-700">Requested Procedure Name</label>
            <select id="proc-name" class="form-select w-full border rounded p-2 bg-white" onchange="window.onProcedureSelectChange(this.value)">
              <option value="Laparoscopic Cholecystectomy (CPT 47562)">Laparoscopic Cholecystectomy (CPT 47562)</option>
              <option value="Emergency Lower Segment Caesarean Section (LSCS)">Emergency Lower Segment Caesarean Section (LSCS)</option>
              <option value="Total Knee Arthroplasty (CPT 27447)">Total Knee Arthroplasty (CPT 27447)</option>
              <option value="Exploratory Laparotomy">Exploratory Laparotomy</option>
              <option value="Diagnostic Coronary Angiography">Diagnostic Coronary Angiography</option>
              <option value="Upper GI Endoscopy">Upper GI Endoscopy</option>
              <option value="Colonoscopy Diagnostic">Colonoscopy Diagnostic</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label font-bold text-slate-700">Priority</label>
            <select id="proc-priority" class="form-select w-full border rounded p-2 bg-white" onchange="window.onProcedurePriorityChange(this.value)">
              <option value="Elective">Elective</option>
              <option value="Urgent">Urgent</option>
              <option value="Emergency">Emergency</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label font-bold text-slate-700">Indications / Diagnosis</label>
            <input type="text" id="proc-diag" class="form-control w-full border rounded p-2 bg-white" value="${patient.clinicalData?.complaint || 'Calculus of gallbladder with acute cholecystitis'}">
          </div>

          <div class="md:col-span-2 border-t pt-3 mt-2">
            <label class="flex items-center gap-2 cursor-pointer font-bold text-[#1B3A5C] text-sm">
              <input type="checkbox" id="book-ot-checkbox" class="h-4 w-4 rounded" onchange="window.toggleOTBookingSection(this.checked)">
              <span>Schedule Operating Theatre (OT) Room booking immediately?</span>
            </label>
          </div>

          <div id="ot-booking-section" class="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4 border p-4 bg-slate-50 rounded-xl hidden">
            <h5 class="md:col-span-2 font-bold text-slate-800 border-b pb-1.5 flex items-center gap-1.5">
              <span>😷 Operating Theatre Allocation Details</span>
            </h5>
            
            <div>
              <label class="block text-[10px] font-bold text-slate-400 uppercase mb-1">Select OT Theatre Room</label>
              <select id="ot-proc-room" class="w-full border rounded p-2 bg-white">
                ${theatresList.map(t => `<option value="${t.code}">${t.name} (${t.speciality})</option>`).join('')}
              </select>
            </div>

            <div>
              <label class="block text-[10px] font-bold text-slate-400 uppercase mb-1">Primary Surgeon</label>
              <select id="ot-proc-surgeon" class="w-full border rounded p-2 bg-white">
                ${surgeonsList.map(s => `<option value="${s.name}" ${s.name === patient.primaryConsultant ? 'selected' : ''}>${s.name} (${s.spec})</option>`).join('')}
              </select>
            </div>

            <div>
              <label class="block text-[10px] font-bold text-slate-400 uppercase mb-1">Preferred Anaesthetist</label>
              <select id="ot-proc-anaesthetist" class="w-full border rounded p-2 bg-white">
                ${anaesthetistsList.map(a => `<option value="${a.name}">${a.name} (${a.spec})</option>`).join('')}
              </select>
            </div>

            <div>
              <label class="block text-[10px] font-bold text-slate-400 uppercase mb-1">Preferred Slot Date</label>
              <input type="date" id="ot-proc-date" class="w-full border rounded p-2 bg-white font-mono" value="${new Date().toISOString().split('T')[0]}">
            </div>

            <div>
              <label class="block text-[10px] font-bold text-slate-400 uppercase mb-1">Preferred Slot Time (HH:MM)</label>
              <input type="text" id="ot-proc-time" class="w-full border rounded p-2 bg-white font-mono" value="11:00">
            </div>

            <div>
              <label class="block text-[10px] font-bold text-slate-400 uppercase mb-1">Estimated Duration (Hrs)</label>
              <input type="text" id="ot-proc-duration" class="w-full border rounded p-2 bg-white font-mono" value="01:30">
            </div>

            <div>
              <label class="block text-[10px] font-bold text-slate-400 uppercase mb-1">Blood Units Standby Required?</label>
              <select id="ot-proc-blood" class="w-full border rounded p-2 bg-white">
                <option value="No">No</option>
                <option value="Yes">Yes (2 Units PRBC Standby)</option>
              </select>
            </div>
          </div>
        </div>

        <div style="display:flex; justify-content:flex-end; gap:0.5rem; margin-top:1.5rem;">
          <button class="btn btn-secondary" onclick="window.closeActionModal()">Cancel</button>
          <button class="btn btn-primary bg-[#1B3A5C] text-white hover:bg-slate-800" onclick="window.executePatientAction('order-proc', '${uhid}')">Confirm & Request</button>
        </div>
      `;

      // Define helper handlers in global window scope
      window.toggleOTBookingSection = function(checked) {
        const sec = document.getElementById('ot-booking-section');
        if (sec) {
          if (checked) {
            sec.classList.remove('hidden');
          } else {
            sec.classList.add('hidden');
          }
        }
      };

      window.onProcedureSelectChange = function(val) {
        // Auto select best theatre room based on procedure name keywords
        const roomSelect = document.getElementById('ot-proc-room');
        if (!roomSelect) return;
        
        if (val.toLowerCase().includes("caesarean")) {
          roomSelect.value = "OT-OBG";
        } else if (val.toLowerCase().includes("knee") || val.toLowerCase().includes("arthroplasty")) {
          roomSelect.value = "OT-ORTHO";
        } else {
          roomSelect.value = "OT-01";
        }
      };

      window.onProcedurePriorityChange = function(val) {
        const check = document.getElementById('book-ot-checkbox');
        const roomSelect = document.getElementById('ot-proc-room');
        const timeInput = document.getElementById('ot-proc-time');
        
        if (val === "Emergency" || val === "Urgent") {
          if (check) {
            check.checked = true;
            window.toggleOTBookingSection(true);
          }
          if (val === "Emergency" && roomSelect) {
            roomSelect.value = "OT-EMGCY";
            if (timeInput) timeInput.value = "ASAP";
          }
        }
      };
      break;

    case 'upload-doc':
      body.innerHTML = `
        <div class="form-group">
          <label class="form-label">File Title Name</label>
          <input type="text" id="doc-title" class="form-control" placeholder="e.g. Prescription_OPD" required>
        </div>
        <div class="form-group">
          <label class="form-label">File Category Type</label>
          <select id="doc-cat" class="form-select">
            <option>Prescription</option>
            <option>Lab Report</option>
            <option>Radiology Report</option>
            <option>Consent Form</option>
            <option>Discharge Summary</option>
          </select>
        </div>
        <div style="display:flex; justify-content:flex-end; gap:0.5rem; margin-top:1rem;">
          <button class="btn btn-secondary" onclick="window.closeActionModal()">Cancel</button>
          <button class="btn btn-primary" onclick="window.executePatientAction('upload-doc', '${uhid}')">Confirm Upload</button>
        </div>
      `;
      break;

    case 'gen-bill':
      body.innerHTML = `
        <div class="form-group">
          <label class="form-label">Charge item details</label>
          <input type="text" id="bill-desc" class="form-control" placeholder="Clinical consultation rounds" required>
        </div>
        <div class="form-group">
          <label class="form-label">Rate (₹)</label>
          <input type="number" id="bill-rate" class="form-control" value="800" required>
        </div>
        <div style="display:flex; justify-content:flex-end; gap:0.5rem; margin-top:1rem;">
          <button class="btn btn-secondary" onclick="window.closeActionModal()">Cancel</button>
          <button class="btn btn-primary" onclick="window.executePatientAction('gen-bill', '${uhid}')">Add Charge</button>
        </div>
      `;
      break;

    case 'collect-pay':
      const ob = activeBill ? (activeBill.amount - activeBill.paid) : 10500;
      body.innerHTML = `
        <div class="form-group">
          <label class="form-label">Amount Outstanding</label>
          <input type="text" class="form-control" value="₹${ob.toLocaleString('en-IN')}" disabled>
        </div>
        <div class="form-group">
          <label class="form-label">Collection Amount (₹)</label>
          <input type="number" id="pay-collected" class="form-control" value="${ob}" max="${ob}" required>
        </div>
        <div style="display:flex; justify-content:flex-end; gap:0.5rem; margin-top:1rem;">
          <button class="btn btn-secondary" onclick="window.closeActionModal()">Cancel</button>
          <button class="btn btn-primary" onclick="window.executePatientAction('collect-pay', '${uhid}')">Collect Settlement</button>
        </div>
      `;
      break;

    case 'print-docs':
      body.innerHTML = `
        <div class="form-group">
          <label class="form-label">Select record sheet</label>
          <select id="print-item-sel" class="form-select">
            <option>Clinical Prescription Rx</option>
            <option>Laboratory Report sheet</option>
            <option>Radiology RIS scans report</option>
            <option>Discharge summary Gatepass</option>
          </select>
        </div>
        <div style="display:flex; justify-content:flex-end; gap:0.5rem; margin-top:1rem;">
          <button class="btn btn-secondary" onclick="window.closeActionModal()">Cancel</button>
          <button class="btn btn-primary" onclick="window.executePatientAction('print-docs', '${uhid}')">🖨️ Send Print</button>
        </div>
      `;
      break;

    default:
      body.innerHTML = `<p>Action form unavailable.</p>`;
  }

  if (modal) {
    if (modal.classList && typeof modal.classList.add === 'function') {
      modal.classList.add('active');
    }
    if (modal.style) {
      modal.style.display = 'flex';
    }
  }
};

window.executePatientAction = function(actionKey, uhid, extraParam) {
  const patient = state.patients.find(p => p.uhid === uhid);
  if (!patient) return;

  const todayStr = new Date().toLocaleDateString('en-CA');
  const nowTime = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  const auditUser = state.activeUserRole || 'System Admin';

  let descText = '';
  let date, doc, timeSlot;

  if (actionKey === 'start-consult') {
    const type = document.getElementById('consult-type').value;
    const notes = document.getElementById('consult-notes').value.trim();
    if (!notes) return alert("Please enter progress notes.");

    patient.clinicalNotes.unshift({
      id: "NOTE" + (100 + patient.clinicalNotes.length + 1),
      date: `${todayStr} ${nowTime}`,
      author: patient.primaryConsultant,
      role: "Doctor",
      type: type,
      content: notes
    });

    patient.timelineEvents = patient.timelineEvents || [];
    patient.timelineEvents.unshift({
      date: `${todayStr} ${nowTime}`,
      type: 'clinical',
      icon: '🩺',
      title: 'Consultation Rounds Logged',
      desc: `${type} completed by ${patient.primaryConsultant}.`
    });

    descText = `Logged consultation round notes: "${notes.substring(0, 30)}..."`;
  }

  else if (actionKey === 'add-note') {
    const type = document.getElementById('note-type').value;
    const content = document.getElementById('note-content').value.trim();
    if (!content) return alert("Please enter note content.");

    patient.clinicalNotes.unshift({
      id: "NOTE" + (100 + patient.clinicalNotes.length + 1),
      date: `${todayStr} ${nowTime}`,
      author: patient.primaryConsultant,
      role: "Doctor",
      type: type,
      content: content
    });

    patient.timelineEvents = patient.timelineEvents || [];
    patient.timelineEvents.unshift({
      date: `${todayStr} ${nowTime}`,
      type: 'clinical',
      icon: '📝',
      title: 'Progress Note Added',
      desc: `Category: ${type}. Note: "${content.substring(0, 60)}${content.length > 60 ? '...' : ''}"`
    });

    descText = `Added clinical progress note (${type}): "${content.substring(0, 30)}..."`;
  }

  else if (actionKey === 'add-diag') {
    const code = document.getElementById('diag-code').value.trim();
    const name = document.getElementById('diag-name').value.trim();
    if (!code || !name) return alert("Please enter ICD code and description name.");

    patient.diagnosesList.push({
      code: code,
      name: name,
      status: "Active",
      date: todayStr,
      author: patient.primaryConsultant
    });

    patient.timelineEvents = patient.timelineEvents || [];
    patient.timelineEvents.unshift({
      date: `${todayStr} ${nowTime}`,
      type: 'clinical',
      icon: '🔍',
      title: 'Diagnosis Added',
      desc: `Diagnosis: ${code} - ${name}`
    });

    descText = `Added diagnosis: ${code} - ${name}`;
  }

  else if (actionKey === 'create-rx') {
    const drug = document.getElementById('rx-drug').value;
    const dose = document.getElementById('rx-dose').value.trim();
    const freq = document.getElementById('rx-freq').value;
    const dur = document.getElementById('rx-dur').value.trim();
    const inst = document.getElementById('rx-inst').value.trim();

    if (!dose || !dur) return alert("Please fill prescription fields.");

    patient.prescriptions.push({ drug, dose, freq, duration: dur, instruction: inst });

    patient.timelineEvents = patient.timelineEvents || [];
    patient.timelineEvents.unshift({
      date: `${todayStr} ${nowTime}`,
      type: 'clinical',
      icon: '💊',
      title: 'Medication Prescribed',
      desc: `Prescribed: ${drug} (${dose}) - ${freq} for ${dur}.`
    });

    descText = `Prescribed medication: ${drug} - ${dose} ${freq}`;
  }

  else if (actionKey === 'order-lab') {
    const checked = (window.tempSelectedLabTests && window.tempSelectedLabTests.length > 0)
      ? window.tempSelectedLabTests.map(t => t.name)
      : Array.from(document.querySelectorAll('.lab-check:checked')).map(cb => cb.value);
    
    const prioritySelect = document.getElementById('lab-priority') || document.getElementById('lab-order-prio');
    const priority = prioritySelect ? prioritySelect.value : 'Routine';

    if (checked.length === 0) return alert("Please select at least one laboratory test.");

    checked.forEach(test => {
      state.orders.push({
        id: "ORD" + (6000 + state.orders.length + 1),
        uhid: patient.uhid,
        patientName: patient.name,
        doctorName: patient.primaryConsultant,
        type: "Laboratory",
        name: test,
        date: todayStr,
        priority: priority,
        status: "Pending",
        result: ""
      });
    });

    patient.timelineEvents = patient.timelineEvents || [];
    patient.timelineEvents.unshift({
      date: `${todayStr} ${nowTime}`,
      type: 'clinical',
      icon: '🧪',
      title: 'Lab Test Ordered',
      desc: `Ordered: ${checked.join(', ')} (${priority})`
    });

    descText = `Placed Lab Orders for: ${checked.join(', ')} (Priority: ${priority})`;
  }

  else if (actionKey === 'order-rad') {
    // Handled by renderRadOrderingWorkflow finalizer
  }

  else if (actionKey === 'order-proc') {
    const name = document.getElementById('proc-name').value;
    const priority = document.getElementById('proc-priority').value;
    const diag = document.getElementById('proc-diag').value;
    const bookOt = document.getElementById('book-ot-checkbox')?.checked;
    const orderId = "ORD" + (6000 + state.orders.length + 1);

    state.orders.push({
      id: orderId,
      uhid: patient.uhid,
      patientName: patient.name,
      doctorName: patient.primaryConsultant,
      type: "Procedure",
      name: name,
      date: todayStr,
      priority: priority,
      status: "Pending",
      result: "",
      otCaseId: null
    });

    if (bookOt) {
      const otRoom = document.getElementById('ot-proc-room').value;
      const surgeon = document.getElementById('ot-proc-surgeon').value;
      const anaes = document.getElementById('ot-proc-anaesthetist').value;
      const slotDate = document.getElementById('ot-proc-date')?.value || todayStr;
      const slotTime = document.getElementById('ot-proc-time').value;
      const duration = document.getElementById('ot-proc-duration').value;
      const bloodReq = document.getElementById('ot-proc-blood').value;

      // Handle surgeon credentialing warning
      const doc = state.doctors?.find(d => d.name === surgeon);
      let isCredentialed = true;
      if (doc) {
        if (name.toLowerCase().includes("cholecystectomy") && doc.spec !== "General Surgery") {
          isCredentialed = false;
        } else if ((name.toLowerCase().includes("knee") || name.toLowerCase().includes("arthroplasty")) && doc.spec !== "Orthopedics") {
          isCredentialed = false;
        } else if (name.toLowerCase().includes("caesarean") && doc.spec !== "Gynecology & Obs") {
          isCredentialed = false;
        }
      }

      if (!isCredentialed) {
        const confirmOverride = confirm(`⚠️ CREDENTIALING PRIVILEGE ALERT:\n${surgeon} is not credentialed to perform ${name} (Specialty: ${doc ? doc.spec : 'Unknown'}).\n\nDo you want to request a HOD Clinical Privilege Override?`);
        if (!confirmOverride) {
          return;
        }
      }

      // Check theatre room speciality matching
      const selectedTheatre = state.ot?.theatres?.find(t => t.code === otRoom);
      let specialityMatches = true;
      if (selectedTheatre) {
        const tSpec = selectedTheatre.speciality.toLowerCase();
        const pName = name.toLowerCase();
        if (tSpec === "orthopaedics" && !(pName.includes("knee") || pName.includes("arthroplasty") || pName.includes("fracture"))) {
          specialityMatches = false;
        } else if (tSpec === "obg" && !pName.includes("caesarean") && !pName.includes("lscs") && !pName.includes("hysterectomy")) {
          specialityMatches = false;
        } else if (tSpec === "general surgery" && (pName.includes("caesarean") || pName.includes("knee"))) {
          specialityMatches = false;
        }
      }

      if (!specialityMatches && selectedTheatre) {
        const confirmRoomOverride = confirm(`⚠️ THEATRE SPECIALITY MISMATCH:\nYou are scheduling ${name} in ${selectedTheatre.name} (Speciality: ${selectedTheatre.speciality}).\n\nAre you sure you want to request this cross-theatre booking?`);
        if (!confirmRoomOverride) {
          return;
        }
      }

      const isEmerg = priority === "Emergency";
      const otCaseId = isEmerg ? ("OT-CRASH-" + Math.floor(Math.random() * 9000 + 1000)) : ("OT-CASE-" + Math.floor(Math.random() * 9000 + 1000));
      
      const orderObj = state.orders.find(o => o.id === orderId);
      if (orderObj) {
        orderObj.otCaseId = otCaseId;
      }

      const otCase = {
        id: otCaseId,
        patientUhid: patient.uhid,
        patientName: patient.name,
        age: patient.age,
        gender: patient.gender,
        ward: patient.bed ? "IPD Ward" : "Emergency ER",
        bed: patient.bed || "ER-TRAUMA-1",
        admissionNo: patient.admission?.id || ("ADM" + Math.floor(Math.random() * 90000 + 10000)),
        diagnosis: diag,
        procedure: name,
        surgeon: surgeon,
        anaesthetist: anaes,
        scrubNurse: "Sister Jessy",
        circulatingNurse: "Brother Jose",
        technician: "Ramesh Lal",
        theatre: otRoom,
        date: slotDate,
        time: slotTime,
        duration: duration,
        status: isEmerg ? "Intra-Op" : "Requested",
        priority: priority,
        bloodReq: bloodReq,
        bloodUnits: bloodReq === "Yes" ? "2 Units PRBC" : "N/A",
        bloodStatus: bloodReq === "Yes" ? "Standby" : "N/A",
        patientPosition: "Supine",
        positioningChecked: false,
        tourniquetLimb: "None",
        tourniquetPressure: 0,
        tourniquetInflated: false,
        tourniquetInflatedTime: "",
        tourniquetDeflatedTime: "",
        tourniquetTotalMinutes: 0,
        instrumentCount: { opening: 36, closing: 36, status: "Pending", needlesOpening: 10, needlesClosing: 10, spongesOpening: 20, spongesClosing: 20 },
        consentChecklist: { surgical: true, anaesthesia: true, blood: true, implant: false },
        preOpInvestigations: [
          { test: "Complete Blood Count (CBC)", value: "Hb: 12.8 g/dL", status: "Normal", reviewed: true },
          { test: "ECG", value: "Normal Sinus Rhythm", status: "Normal", reviewed: true }
        ],
        preOpChecklist: { wardComplete: true, holdingComplete: isEmerg, siteMarked: true, npoSolid: isEmerg ? "Emergency" : "NPO Solid", npoClear: isEmerg ? "Emergency" : "NPO Clear", asaStatus: "ASA II" },
        whoChecklist: { signIn: isEmerg, timeOut: isEmerg, signOut: false },
        anaesthesiaRecord: { type: isEmerg ? "General Anaesthesia" : "General/Spinal", inductionTime: isEmerg ? "Immediate" : "", extubationTime: "", agents: [], vitals: [] },
        implants: [],
        consumables: [
          { code: "CON-OT-01", name: "OT Disposables Pack - Standard", qty: 1, rate: 2500 }
        ],
        auditHistory: []
      };

      state.ot = state.ot || { scheduledCases: [], auditTrail: [] };
      state.ot.scheduledCases.push(otCase);
      state.ot.auditTrail.push({
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 23) + " IST",
        user: window.state.activeUser || "Dr. Primary",
        role: "IPD Doctor",
        action: "OT Booked via IPD Desk",
        target: otCase.id,
        remarks: `Booked procedure ${name} for ${patient.name} in room ${otRoom} at ${slotTime}. ${!isCredentialed ? '(HOD Override Signed)' : ''}`
      });
    }

    patient.timelineEvents = patient.timelineEvents || [];
    patient.timelineEvents.unshift({
      date: `${todayStr} ${nowTime}`,
      type: 'clinical',
      icon: '🪡',
      title: 'Procedure Requested',
      desc: `Requested: ${name} ${bookOt ? '(OT Booked)' : ''}`
    });

    descText = `Submitted Procedure Order & OT Room Schedule: ${name}`;
  }

  else if (actionKey === 'book-appt') {
    if (!window.apptConfirmPhase) {
      date = document.getElementById('appt-date').value;
      doc = document.getElementById('appt-doctor').value;
      timeSlot = document.getElementById('appt-time-slot').value;

      window.tempApptData = { date, doc, timeSlot };
      window.apptConfirmPhase = true;

      const body = document.getElementById('action-modal-body');
      const formattedDate = new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
      body.innerHTML = `
        <div style="text-align: center; padding: 2rem 1rem;">
          <div style="width: 64px; height: 64px; border-radius: 50%; background: #fffbeb; color: #d97706; display: flex; align-items: center; justify-content: center; font-size: 2.25rem; margin: 0 auto 1.25rem; font-weight: bold; border: 2px solid #fef3c7;">
            ?
          </div>
          <h3 style="font-size: 1.25rem; font-weight: 700; color: #0f172a; margin-bottom: 0.5rem;">Confirm Appointment</h3>
          <p style="font-size: 0.85rem; color: #64748b; margin-bottom: 1.5rem; line-height: 1.5;">
            Are you sure you want to book a follow-up consultation with <strong>${doc}</strong> on <strong>${formattedDate}</strong> at <strong>${timeSlot}</strong>?
          </p>
          
          <div style="display:flex; justify-content:center; gap:0.75rem; margin-top:1.5rem;">
            <button class="btn btn-secondary" style="flex: 1; height: 38px;" onclick="window.apptConfirmPhase = false; window.openActionModal('book-appt', '${patient.uhid}')">Cancel</button>
            <button class="btn btn-primary" style="flex: 1; height: 38px; background-color: #4a1228; border-color: #4a1228;" onclick="window.executePatientAction('book-appt', '${patient.uhid}')">Confirm Booking</button>
          </div>
        </div>
      `;
      return;
    }

    date = window.tempApptData.date;
    doc = window.tempApptData.doc;
    timeSlot = window.tempApptData.timeSlot;

    window.apptConfirmPhase = false;
    window.tempApptData = null;

    patient.primaryConsultant = doc;
    patient.type = "OPD";
    if (patient.status !== 'Checked In' && patient.status !== 'Admitted') {
      patient.status = 'Registered';
    }

    state.appointments.push({
      id: "APT" + (1000 + state.appointments.length + 1),
      uhid: patient.uhid,
      patientName: patient.name,
      doctorName: doc,
      date: date,
      time: timeSlot,
      status: "Confirmed",
      type: "OPD Consultation Visit"
    });

    patient.timelineEvents = patient.timelineEvents || [];
    patient.timelineEvents.unshift({
      date: `${todayStr} ${nowTime}`,
      type: 'clinical',
      icon: '📅',
      title: 'Appointment Booked',
      desc: `Follow-up appointment with ${doc} scheduled on ${date} at ${timeSlot}`
    });

    descText = `Booked follow-up appointment with ${doc} on ${date} at ${timeSlot}`;
  }

  else if (actionKey === 'admit') {
    const wKey = document.getElementById('admit-ward').value;
    const bedId = document.getElementById('admit-bed').value;

    if (!bedId) return alert("No available bed coordinates selected.");

    if (wKey === 'DAYCARE') {
      patient.status = 'Day Care';
      patient.type = 'Daycare';

      window.state.daycareAdmissions = window.state.daycareAdmissions || [];
      if (!window.state.daycareAdmissions.some(a => a.patient.uhid === patient.uhid)) {
        window.state.daycareAdmissions.unshift({
          patient: patient,
          bedId: bedId,
          ward: 'Daycare Ward',
          bedNo: bedId,
          consultantName: patient.primaryConsultant || 'Dr. Amit Verma',
          procedureName: patient.clinicalData?.treatmentPlan || 'Minor Procedure',
          admissionType: 'Daycare',
          admissionTimestamp: new Date().toISOString(),
          status: 'Registered',
          historyLogs: [{ timestamp: new Date().toISOString(), action: 'Daycare Bed Allocated & Registered (via Patients Registry)' }],
          tasks: [
            { id: 'vitals-1', name: 'Take Pre-Op Vitals (BP, pulse, SpO2, Temp)', completed: false },
            { id: 'meds-1', name: 'Verify Medication Dose and Frequency', completed: false },
            { id: 'postcheck-1', name: 'Post-procedure Site Assessment', completed: false }
          ]
        });
        if (typeof window.saveDaycareState === 'function') {
          window.saveDaycareState();
        } else {
          localStorage.setItem('saronil_daycare_admissions', JSON.stringify(window.state.daycareAdmissions));
        }
      }
    } else {
      patient.status = 'Admitted';
      patient.type = 'IPD';
    }

    state.bedsStatus[bedId] = {
      wardKey: wKey,
      status: 'Occupied',
      patientUhid: patient.uhid,
      notes: wKey === 'DAYCARE' ? `Daycare Procedure: ${patient.clinicalData?.treatmentPlan || 'Minor Procedure'}` : `Admitted for EMR rounds`
    };

    state.admissions.push({
      id: "ADM" + (5000 + state.admissions.length + 1),
      uhid: patient.uhid,
      patientName: patient.name,
      date: todayStr,
      ward: wKey,
      bed: bedId,
      doctorName: patient.primaryConsultant || 'Dr. Amit Verma',
      diagnosis: patient.clinicalData?.diagnosis || patient.clinicalData?.complaint || 'Minor Procedure',
      status: "Active"
    });

    patient.timelineEvents = patient.timelineEvents || [];
    patient.timelineEvents.unshift({
      date: `${todayStr} ${nowTime}`,
      type: 'clinical',
      icon: '🏥',
      title: 'Patient Admitted',
      desc: `Admitted to ${wKey === 'DAYCARE' ? 'Daycare Unit' : wKey + ' Ward'}, Bed: ${bedId}`
    });

    descText = `Admitted patient to ward: ${wKey}, bed: ${bedId}`;
  }

  else if (actionKey === 'rec-vitals') {
    const temp = document.getElementById('v-temp').value;
    const hr = document.getElementById('v-hr').value;
    const bp = document.getElementById('v-bp').value.trim();
    const rr = document.getElementById('v-rr').value;
    const spo2 = document.getElementById('v-spo2').value;
    const weight = document.getElementById('v-weight').value;
    const pain = document.getElementById('v-pain').value;
    const sugar = document.getElementById('v-sugar').value;
    const urine = document.getElementById('v-urine').value;
    const oxygen = document.getElementById('v-oxygen').value.trim();
    const notes = document.getElementById('v-notes').value.trim();

    patient.vitals = {
      temp: parseFloat(temp) || 98.6,
      hr: parseInt(hr) || 78,
      bp: bp || '120/80',
      rr: parseInt(rr) || 18,
      spo2: parseInt(spo2) || 98,
      weight: parseFloat(weight) || 70,
      pain: parseInt(pain) || 0,
      sugar: parseInt(sugar) || 110,
      urine: parseInt(urine) || 500,
      oxygen: oxygen || 'N/A',
      notes: notes || ''
    };

    patient.vitalsHistory.unshift({
      date: `${todayStr} ${nowTime}`,
      ...patient.vitals
    });

    patient.timelineEvents = patient.timelineEvents || [];
    patient.timelineEvents.unshift({
      date: `${todayStr} ${nowTime}`,
      type: 'clinical',
      icon: '🌡️',
      title: 'Vitals Recorded',
      desc: `BP: ${patient.vitals.bp} | HR: ${patient.vitals.hr} bpm | Temp: ${patient.vitals.temp} °F | SpO₂: ${patient.vitals.spo2}% | RR: ${patient.vitals.rr}/min`
    });

    descText = `Recorded vitals: Temp: ${temp} °F | Pulse: ${hr} bpm | BP: ${bp} | RR: ${rr}/min | SpO₂: ${spo2}% | Wt: ${weight} kg | Pain: ${pain}/10 | BS: ${sugar} mg/dL | Urine: ${urine} mL | O₂: ${oxygen}`;
  }

  else if (actionKey === 'upload-doc') {
    const title = document.getElementById('doc-title').value.trim();
    const cat = document.getElementById('doc-cat').value;

    if (!title) return alert("Please specify document title.");

    patient.documents.unshift({
      id: "DOC" + (patient.documents.length + 1),
      name: `${title}.pdf`,
      type: cat,
      size: "150 KB",
      date: todayStr,
      author: auditUser
    });

    patient.timelineEvents = patient.timelineEvents || [];
    patient.timelineEvents.unshift({
      date: `${todayStr} ${nowTime}`,
      type: 'clinical',
      icon: '📄',
      title: 'Document Uploaded',
      desc: `Uploaded: ${title}.pdf (${cat})`
    });

    descText = `Uploaded document: ${title}.pdf (${cat})`;
  }

  else if (actionKey === 'gen-bill') {
    const desc = document.getElementById('bill-desc').value.trim();
    const rate = document.getElementById('bill-rate').value;

    if (!desc) return alert("Please specify description charge.");

    const existingBill = state.billing.find(b => b.uhid === patient.uhid && b.status !== 'Settled');
    if (existingBill) {
      existingBill.amount += parseInt(rate);
      existingBill.items = existingBill.items || [];
      existingBill.items.push({ desc: desc, qty: 1, rate: parseInt(rate), total: parseInt(rate) });
    } else {
      state.billing.push({
        id: "INV" + (8000 + state.billing.length + 1),
        uhid: patient.uhid,
        patientName: patient.name,
        date: todayStr,
        amount: parseInt(rate),
        paid: 0,
        status: "Outstanding",
        items: [{ desc: desc, qty: 1, rate: parseInt(rate), total: parseInt(rate) }]
      });
    }

    patient.timelineEvents = patient.timelineEvents || [];
    patient.timelineEvents.unshift({
      date: `${todayStr} ${nowTime}`,
      type: 'clinical',
      icon: '💵',
      title: 'Billing Charge Generated',
      desc: `Charge: ${desc} (₹${rate})`
    });

    descText = `Generated billing item charge: "${desc}" rate ₹${rate}`;
  }

  else if (actionKey === 'collect-pay') {
    const collected = document.getElementById('pay-collected').value;

    const existingBill = state.billing.find(b => b.uhid === patient.uhid && b.status !== 'Settled');
    if (existingBill) {
      existingBill.paid += parseInt(collected);
      if (existingBill.paid >= existingBill.amount) {
        existingBill.status = 'Settled';
      }
    }

    patient.timelineEvents = patient.timelineEvents || [];
    patient.timelineEvents.unshift({
      date: `${todayStr} ${nowTime}`,
      type: 'clinical',
      icon: '💰',
      title: 'Payment Collected',
      desc: `Collected: ₹${collected}`
    });

    descText = `Collected payment: ₹${collected}`;
  }

  else if (actionKey === 'print-docs') {
    const item = document.getElementById('print-item-sel').value;
    alert(`Print command sent for ${item}.`);

    patient.timelineEvents = patient.timelineEvents || [];
    patient.timelineEvents.unshift({
      date: `${todayStr} ${nowTime}`,
      type: 'clinical',
      icon: '🖨️',
      title: 'Document Printed',
      desc: `Printed record: ${item}`
    });

    descText = `Printed document: ${item}`;
  }

  // Common completion handlers: Audit Log
  state.auditLogs.push({
    timestamp: new Date().toISOString(),
    user: auditUser,
    uhid: patient.uhid,
    patientName: patient.name,
    action: actionKey.toUpperCase(),
    details: descText
  });

  if (actionKey === 'book-appt') {
    const body = document.getElementById('action-modal-body');
    const formattedDate = new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    body.innerHTML = `
      <div style="text-align: center; padding: 2rem 1rem;">
        <div style="width: 64px; height: 64px; border-radius: 50%; background: #d1fae5; color: #10b981; display: flex; align-items: center; justify-content: center; font-size: 2.25rem; margin: 0 auto 1.25rem; font-weight: bold;">
          ✓
        </div>
        <h3 style="font-size: 1.25rem; font-weight: 700; color: #0f172a; margin-bottom: 0.5rem;">Appointment Booked Successfully!</h3>
        <p style="font-size: 0.85rem; color: #64748b; margin-bottom: 1.5rem;">The follow-up consultation slot has been reserved.</p>
        
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 1rem; margin-bottom: 1.5rem; text-align: left; font-size: 0.85rem; display: flex; flex-direction: column; gap: 0.5rem; border-left: 4px solid #10b981;">
          <div><strong>Patient Name:</strong> ${patient.name}</div>
          <div><strong>Specialist:</strong> ${doc}</div>
          <div><strong>Date:</strong> ${formattedDate}</div>
          <div><strong>Time Slot:</strong> ${timeSlot}</div>
          <div><strong>Status:</strong> <span class="badge b-gr" style="font-size:0.75rem;">Confirmed</span></div>
        </div>
        
        <button class="btn btn-primary" style="width: 100%; height: 38px; font-weight: 600; background-color: #10b981; border: none;" onclick="window.closeActionModal(); const container = document.getElementById('main-content'); const activeTab = document.querySelector('.ptab.on')?.innerText.toLowerCase().includes('timeline') ? 'overview' : (document.querySelector('.ptab.on')?.innerText.toLowerCase() || 'overview'); renderPatient360Profile(container, state.patients.find(p => p.uhid === '${patient.uhid}'), activeTab);">Done</button>
      </div>
    `;
    return;
  }

  window.closeActionModal();
  
  // Re-render active tab viewport
  const container = document.getElementById('main-content');
  const activeTab = document.querySelector('.tab-btn.btn-primary')?.dataset.tab || 'overview';
  renderPatient360Profile(container, patient, activeTab);
};

// --------------------------------------------------------------------------
// 5. PATIENT DATA EMR INITIALIZATION
// --------------------------------------------------------------------------
function ensurePatientEMRInitialized(patient) {
  patient.admission = state.admissions.find(a => a.uhid === patient.uhid && a.status === 'Active');
  if (!patient.vitals) {
    patient.vitals = {};
  }
  if (patient.vitals.temp === undefined) patient.vitals.temp = 98.6;
  if (patient.vitals.hr === undefined) patient.vitals.hr = 78;
  if (patient.vitals.bp === undefined) patient.vitals.bp = '120/80';
  if (patient.vitals.rr === undefined) patient.vitals.rr = 18;
  if (patient.vitals.spo2 === undefined) patient.vitals.spo2 = 98;
  if (patient.vitals.weight === undefined) patient.vitals.weight = 70;
  if (patient.vitals.pain === undefined) patient.vitals.pain = 0;
  if (patient.vitals.sugar === undefined) patient.vitals.sugar = 110;
  if (patient.vitals.urine === undefined) patient.vitals.urine = 500;
  if (patient.vitals.oxygen === undefined) patient.vitals.oxygen = 'N/A';
  if (patient.vitals.notes === undefined) patient.vitals.notes = '';
  if (!patient.prescriptions) {
    patient.prescriptions = [];
  }
  if (!patient.registrationDate) {
    patient.registrationDate = "2026-06-15";
  }
  if (!patient.clinicalNotes) {
    patient.clinicalNotes = [
      { id: "NOTE1", date: "2026-06-15 10:30 AM", author: "Dr. Abhishek Kumar", role: "Doctor", type: "Clinical SOAP Note", content: "S: Patient reports mild chest tightness on exertion.\nO: BP: 140/90, HR: 82. Lungs clear.\nA: Essential Hypertension.\nP: Prescribed Dolo 650, monitor BP weekly." }
    ];
  }
  if (!patient.diagnosesList) {
    patient.diagnosesList = [
      { code: "I10", name: "Essential Hypertension", status: "Active", date: "2026-06-15", author: patient.primaryConsultant }
    ];
  }
  if (!patient.pastPrescriptions) {
    patient.pastPrescriptions = [
      { drug: "Amoxicillin 500mg", dose: "1 tablet", freq: "Twice daily (BD)", duration: "7 Days", stopReason: "Course completed" }
    ];
  }
  if (!patient.documents) {
    patient.documents = [
      { id: "DOC1", name: "OPD_Prescription_Initial.pdf", type: "Prescription", size: "142 KB", date: "2026-06-15", author: "Dr. Abhishek Kumar" }
    ];
  }
  if (!patient.vitalsHistory) {
    patient.vitalsHistory = [
      { 
        date: "2026-06-17 08:30 AM", 
        temp: patient.vitals.temp, 
        hr: patient.vitals.hr, 
        bp: patient.vitals.bp, 
        rr: patient.vitals.rr, 
        spo2: patient.vitals.spo2, 
        weight: patient.vitals.weight, 
        pain: patient.vitals.pain, 
        sugar: patient.vitals.sugar, 
        urine: patient.vitals.urine, 
        oxygen: patient.vitals.oxygen, 
        notes: patient.vitals.notes 
      }
    ];
  }
  if (!patient.dischargeClearances) {
    patient.dischargeClearances = {
      clinical: false,
      billing: false,
      summaryReady: false
    };
  }
}

// --------------------------------------------------------------------------
// 6. COMPATIBLE ATD POPUPS FROM ORIGINAL SETUP
// --------------------------------------------------------------------------
window.closeProfileAtdModal = function() {
  const modal = document.getElementById('profile-atd-modal');
  if (modal) {
    modal.classList.remove('active');
  }
};

window.switchWorkspaceRole = function(newRole) {
  state.activeUserRole = newRole;
  const container = document.getElementById('main-content');
  const activeTab = document.querySelector('.tab-btn.btn-primary')?.dataset.tab || 'overview';
  const uhidInput = router.parseHash().params.uhid;
  const patient = state.patients.find(p => p.uhid === uhidInput);
  renderPatient360Profile(container, patient, activeTab);
};

window.executeWorkspaceSearch = function(uhid) {
  const q = document.getElementById('w-quick-search').value.toLowerCase().trim();
  const patient = state.patients.find(p => p.uhid === uhid);
  if (!patient || !q) return;

  const panel = document.getElementById('profile-tab-viewport');
  let resultsHTML = `<h4>Quick Search Results for "${q}"</h4><div style="display:flex; flex-direction:column; gap:1rem; margin-top:1rem;">`;

  // Search Notes
  const matchingNotes = patient.clinicalNotes.filter(n => n.content.toLowerCase().includes(q));
  matchingNotes.forEach(n => {
    resultsHTML += `
      <div class="card" style="border-left:4px solid var(--primary);">
        <div class="card-body">
          <strong>📝 Note (${n.type}) - ${n.date}</strong>
          <pre style="white-space:pre-wrap; font-family:inherit; font-size:0.8rem; margin-top:0.25rem;">${n.content}</pre>
        </div>
      </div>
    `;
  });

  // Search prescriptions
  const matchingMeds = patient.prescriptions.filter(p => p.drug.toLowerCase().includes(q));
  matchingMeds.forEach(p => {
    resultsHTML += `
      <div class="card" style="border-left:4px solid var(--secondary);">
        <div class="card-body">
          <strong>💊 Prescription: ${p.drug}</strong>
          <div>Dose: ${p.dose} | Freq: ${p.freq} | Duration: ${p.duration}</div>
        </div>
      </div>
    `;
  });

  // Search orders
  const matchingOrders = state.orders.filter(o => o.uhid === patient.uhid && o.name.toLowerCase().includes(q));
  matchingOrders.forEach(o => {
    resultsHTML += `
      <div class="card" style="border-left:4px solid var(--color-info);">
        <div class="card-body">
          <strong>🧪 Diagnostic Order: ${o.name}</strong>
          <div>Status: ${o.status} | Ordered by: ${o.doctorName}</div>
        </div>
      </div>
    `;
  });

  resultsHTML += `</div>`;
  if (matchingNotes.length === 0 && matchingMeds.length === 0 && matchingOrders.length === 0) {
    resultsHTML = `<div style="padding:4rem; text-align:center; color:var(--text-muted);">No matching clinical documents, notes, or prescriptions found.</div>`;
  }
  panel.innerHTML = resultsHTML;
};

window.initiatePatientTransfer = function(uhid) {
  const patient = state.patients.find(p => p.uhid === uhid);
  const admission = state.admissions.find(a => a.uhid === uhid && a.status === 'Active');
  if (!patient || !admission) {
    alert("No active admission record found for this patient.");
    return;
  }
  
  if (typeof window.closeProfileAtdModal === 'function') {
    window.closeProfileAtdModal();
  }
  window.openCompactTransferModal(uhid);
};

window.executePatientTransfer = function(uhid) {
  const destBedId = document.getElementById('transfer-dest-bed').value;
  const destWardKey = document.getElementById('transfer-dest-ward').value;
  const reason = document.getElementById('transfer-reason').value.trim();

  if (!destBedId) {
    alert('Please select a destination bed.');
    return;
  }
  if (!reason) {
    alert('Please enter a clinical reason for this transfer.');
    return;
  }

  const patient = state.patients.find(p => p.uhid === uhid);
  const admission = state.admissions.find(a => a.uhid === uhid && a.status === 'Active');
  if (!patient || !admission) return;

  const currentBedId = admission.bed;
  if (currentBedId === destBedId) {
    alert('Patient is already assigned to this bed.');
    return;
  }

  const isIsolation = document.getElementById('transfer-isolation-flag')?.checked || 
                      (state.bedsStatus[currentBedId] && (state.bedsStatus[currentBedId].wardKey === 'CCU' || state.bedsStatus[currentBedId].wardKey === 'ICCU'));

  const oldBedPrevStatus = state.bedsStatus[currentBedId] ? state.bedsStatus[currentBedId].status : 'Occupied';
  const newBedPrevStatus = state.bedsStatus[destBedId] ? state.bedsStatus[destBedId].status : 'Available';

  if (state.bedsStatus[currentBedId]) {
    const targetStatus = isIsolation ? 'Isolation Cleaning Required' : 'Vacated - Pending Housekeeping';
    state.bedsStatus[currentBedId] = {
      wardKey: state.bedsStatus[currentBedId].wardKey,
      status: targetStatus,
      patientUhid: null,
      transitionTimestamp: new Date().toISOString(),
      notes: `Awaiting cleaning after transfer of ${patient.name} to ${destBedId}`
    };

    // Auto-create housekeeping task
    const isHighPriority = currentBedId.startsWith('EMG') || currentBedId.startsWith('CCU') || currentBedId.startsWith('ICCU');
    state.housekeepingTasks = state.housekeepingTasks || [];
    state.housekeepingTasks.push({
      taskId: 'HK-' + String(1000 + state.housekeepingTasks.length + 1),
      bedId: currentBedId,
      wardKey: state.bedsStatus[currentBedId].wardKey,
      priority: isHighPriority ? 'High' : 'Normal',
      status: 'Pending',
      assignedStaff: null,
      createdAt: new Date().toISOString(),
      notes: `Transfer: ${patient.name} to ${destBedId}. Reason: ${reason}`
    });
  }

  if (state.bedsStatus[destBedId]) {
    state.bedsStatus[destBedId] = {
      wardKey: destWardKey,
      status: 'Occupied',
      patientUhid: uhid,
      notes: `Shifted from ${currentBedId}. Reason: ${reason}`
    };
  }

  // Log Bed Movements
  state.logBedMovement({
    patientId: uhid,
    encounterId: admission.id,
    bedId: currentBedId,
    wardKey: state.bedsStatus[currentBedId]?.wardKey,
    prevStatus: oldBedPrevStatus,
    newStatus: isIsolation ? 'Isolation Cleaning Required' : 'Vacated - Pending Housekeeping',
    action: 'Patient Transfer (Vacate)',
    remarks: `Transferred to ${destBedId}. Reason: ${reason}`
  });

  state.logBedMovement({
    patientId: uhid,
    encounterId: admission.id,
    bedId: destBedId,
    wardKey: destWardKey,
    prevStatus: newBedPrevStatus,
    newStatus: 'Occupied',
    action: 'Patient Transfer (Occupy)',
    remarks: `Transferred from ${currentBedId}. Reason: ${reason}`
  });

  admission.transferLogs = admission.transferLogs || [];
  const todayStr = new Date().toLocaleDateString('en-CA');
  admission.transferLogs.push({
    date: todayStr,
    source: currentBedId,
    dest: destBedId,
    reason: reason
  });

  admission.bed = destBedId;
  admission.ward = destWardKey;

  state.auditLogs.push({
    timestamp: new Date().toISOString(),
    user: "Dr. Clinician",
    uhid: uhid,
    patientName: patient.name,
    action: "ATD Bed Transfer",
    details: `Transferred from bed ${currentBedId} to bed ${destBedId}. Reason: "${reason}"`
  });

  window.closeProfileAtdModal();
  alert(`Ward shift successful. Patient ${patient.name} transferred to bed ${destBedId}.`);
  
  const container = document.getElementById('main-content');
  renderPatient360Profile(container, patient, 'admission');
};

window.initiatePatientDischarge = function(uhid) {
  const patient = state.patients.find(p => p.uhid === uhid);
  const admission = state.admissions.find(a => a.uhid === uhid && a.status === 'Active');
  if (!patient || !admission) {
    alert("No active admission record found for this patient.");
    return;
  }

  const title = document.getElementById('profile-atd-modal-title');
  const body = document.getElementById('profile-atd-modal-body');
  const modal = document.getElementById('profile-atd-modal');

  title.innerText = `🚪 Discharge Inpatient: ${patient.name}`;

  const activeBill = state.billing.find(b => b.uhid === uhid && b.status !== 'Settled');
  const outstandingBal = activeBill ? (activeBill.amount - activeBill.paid) : 0;

  let financialAlertHTML = '';
  if (outstandingBal > 0) {
    financialAlertHTML = `
      <div style="background-color: var(--color-warning-bg); color: #b45309; padding: 0.75rem; border-radius: 6px; border: 1px solid rgba(245, 158, 11, 0.2); font-size: 0.75rem; line-height: 1.4; margin-bottom: 1rem;">
        <strong>⚠️ Outstanding Billing Balance: ₹${outstandingBal.toLocaleString('en-IN')}</strong><br>
        Discharge summary can be completed, but financial clearance is mandatory at the Billing Counter.
      </div>
    `;
  } else {
    financialAlertHTML = `
      <div style="background-color: var(--color-success-bg); color: var(--color-success); padding: 0.75rem; border-radius: 6px; border: 1px solid rgba(16, 185, 129, 0.2); font-size: 0.75rem; line-height: 1.4; margin-bottom: 1rem;">
        <strong>🟢 Financial Cleared: No Outstanding Balance</strong><br>
        Billing account cleared. Ready for checkout.
      </div>
    `;
  }

  body.innerHTML = `
    ${financialAlertHTML}

    <div style="background-color: var(--bg-surface-elevated); padding: 0.75rem; border-radius: 6px; font-size: 0.8rem; border: 1px solid var(--border-color); margin-bottom: 1rem;">
      <p><strong>Admitted Bed:</strong> ${admission.bed} (${state.wards[admission.ward]?.name || admission.ward})</p>
      <p><strong>Admitting Diagnosis:</strong> ${admission.diagnosis}</p>
    </div>

    <div class="form-group">
      <label class="form-label" style="font-weight:700; font-size: 0.8rem;">Clinical Discharge Summary <span style="color:var(--color-danger);">*</span></label>
      <textarea id="dc-summary" class="form-control" rows="3" placeholder="Condition at discharge, follow-up plan..." required></textarea>
    </div>

    <div class="form-group" style="margin-bottom:0.75rem;">
      <label style="display:flex; align-items:center; gap:0.5rem; font-weight:600; cursor:pointer; font-size:0.8rem;">
        <input type="checkbox" id="dc-isolation-flag">
        ⚠️ Biohazard/Infectious Risk (Requires specialized Infection Control Cleaning)
      </label>
    </div>

    <div class="form-group" style="margin-bottom:1rem;">
      <label style="display:flex; align-items:center; gap:0.5rem; font-weight:600; cursor:pointer; font-size:0.8rem;">
        <input type="checkbox" id="dc-meds-dispensed" required checked>
        I verify that take-home medications have been reviewed.
      </label>
    </div>

    <div style="display: flex; gap: 0.5rem; justify-content: flex-end; border-top: 1px solid var(--border-color); padding-top: 1rem;">
      <button class="btn btn-secondary" onclick="window.closeProfileAtdModal()">Cancel</button>
      <button class="btn btn-danger" onclick="window.executePatientDischarge('${uhid}')">Finalize & Discharge</button>
    </div>
  `;

  modal.classList.add('active');
  modal.style.display = 'flex';
};

window.executePatientDischarge = function(uhid) {
  const summary = document.getElementById('dc-summary').value.trim();
  const medsChecked = document.getElementById('dc-meds-dispensed').checked;

  if (!summary) {
    alert('Please enter a clinical discharge summary.');
    return;
  }
  if (!medsChecked) {
    alert('Please confirm that discharge medications have been verified.');
    return;
  }

  const patient = state.patients.find(p => p.uhid === uhid);
  const admission = state.admissions.find(a => a.uhid === uhid && a.status === 'Active');
  if (!patient || !admission) return;

  const currentBedId = admission.bed;

  admission.status = 'Discharged';
  admission.dischargeDate = new Date().toLocaleDateString('en-CA');
  admission.dischargeSummary = summary;

  const isIsolation = document.getElementById('dc-isolation-flag')?.checked || 
                      (state.bedsStatus[currentBedId] && (state.bedsStatus[currentBedId].wardKey === 'CCU' || state.bedsStatus[currentBedId].wardKey === 'ICCU'));

  const prevStatus = state.bedsStatus[currentBedId] ? state.bedsStatus[currentBedId].status : 'Occupied';

  if (state.bedsStatus[currentBedId]) {
    const targetStatus = isIsolation ? 'Isolation Cleaning Required' : 'Vacated - Pending Housekeeping';
    state.bedsStatus[currentBedId] = {
      wardKey: state.bedsStatus[currentBedId].wardKey,
      status: targetStatus,
      patientUhid: null,
      transitionTimestamp: new Date().toISOString(),
      notes: `Awaiting cleaning after discharge of ${patient.name}`
    };

    // Auto-create housekeeping task
    const isHighPriority = currentBedId.startsWith('EMG') || currentBedId.startsWith('CCU') || currentBedId.startsWith('ICCU');
    state.housekeepingTasks = state.housekeepingTasks || [];
    state.housekeepingTasks.push({
      taskId: 'HK-' + String(1000 + state.housekeepingTasks.length + 1),
      bedId: currentBedId,
      wardKey: state.bedsStatus[currentBedId].boldKey,
      priority: isHighPriority ? 'High' : 'Normal',
      status: 'Pending',
      assignedStaff: null,
      createdAt: new Date().toISOString(),
      notes: `Discharge: ${patient.name}`
    });
  }

  // Log Bed Movement
  state.logBedMovement({
    patientId: uhid,
    encounterId: admission.id,
    bedId: currentBedId,
    wardKey: state.bedsStatus[currentBedId]?.wardKey,
    prevStatus: prevStatus,
    newStatus: isIsolation ? 'Isolation Cleaning Required' : 'Vacated - Pending Housekeeping',
    action: `Patient Discharge`,
    remarks: `Discharged. Summary: ${summary}`
  });

  patient.status = 'Registered';
  patient.dischargedToday = true;
  patient.dischargeClearances = {
    clinical: true,
    billing: true,
    summaryReady: true
  };

  const billingRecord = state.billing.find(b => b.uhid === uhid && b.status === 'Outstanding');
  if (billingRecord) {
    billingRecord.status = 'Ready for Settlement';
  }

  state.auditLogs.push({
    timestamp: new Date().toISOString(),
    user: "Dr. Clinician",
    uhid: uhid,
    patientName: patient.name,
    action: "ATD Patient Discharge",
    details: `Discharged from bed ${currentBedId}. Summary: "${summary}"`
  });

  window.closeProfileAtdModal();
  alert(`Discharge successful. Bed ${currentBedId} sent to House Keeping. Patient checked out.`);
  
  const container = document.getElementById('main-content');
  renderPatient360Profile(container, patient, 'overview');
};

// ==========================================================================
// 8. HIS/EMR LAB TEST ORDERING WORKFLOW
// ==========================================================================
const labCatalog = [
  // Panels
  { code: "PAN-CBC", name: "Complete Blood Count (CBC)", type: "Panel", category: "Hematology", dept: "Pathology", sample: "Whole Blood (EDTA)", tat: "4 Hours", tests: ["Hemoglobin", "RBC Count", "WBC Count", "Platelet Count", "Hematocrit", "MCV", "MCH"] },
  { code: "PAN-LFT", name: "Liver Function Test (LFT)", type: "Panel", category: "Biochemistry", dept: "Pathology", sample: "Serum", tat: "6 Hours", tests: ["Total Bilirubin", "Conjugated Bilirubin", "AST (SGOT)", "ALT (SGPT)", "ALP (Alkaline Phosphatase)", "Total Protein", "Albumin"] },
  { code: "PAN-RFT", name: "Renal Function Test (RFT)", type: "Panel", category: "Biochemistry", dept: "Pathology", sample: "Serum + Urine", tat: "6 Hours", tests: ["Urea", "Creatinine", "Uric Acid", "Electrolytes (Na/K/Cl)"] },
  { code: "PAN-LIPID", name: "Lipid Profile", type: "Panel", category: "Biochemistry", dept: "Pathology", sample: "Serum", tat: "8 Hours", tests: ["Total Cholesterol", "Triglycerides", "HDL Cholesterol", "LDL Cholesterol", "VLDL Cholesterol"] },
  { code: "PAN-THYROID", name: "Thyroid Profile", type: "Panel", category: "Endocrinology", dept: "Pathology", sample: "Serum", tat: "12 Hours", tests: ["TSH", "Free T3", "Free T4"] },
  { code: "PAN-DENGUE", name: "Dengue Panel", type: "Panel", category: "Serology", dept: "Microbiology", sample: "Serum", tat: "4 Hours", tests: ["Dengue NS1 Antigen", "Dengue IgM", "Dengue IgG"] },
  { code: "PAN-URINE", name: "Urine Routine", type: "Panel", category: "Urinalysis", dept: "Pathology", sample: "Urine", tat: "2 Hours", tests: ["Color", "pH", "Specific Gravity", "Protein", "Glucose", "Microscopic Exam"] },
  
  // Individual Tests
  { code: "TST-HB", name: "Hemoglobin", type: "Individual", category: "Hematology", dept: "Pathology", sample: "Whole Blood (EDTA)", tat: "2 Hours" },
  { code: "TST-CREAT", name: "Creatinine", type: "Individual", category: "Biochemistry", dept: "Pathology", sample: "Serum", tat: "3 Hours" },
  { code: "TST-TSH", name: "TSH (Thyroid Stimulating Hormone)", type: "Individual", category: "Endocrinology", dept: "Pathology", sample: "Serum", tat: "6 Hours" },
  { code: "TST-VITD", name: "Vitamin D (25-Hydroxy)", type: "Individual", category: "Vitamins", dept: "Pathology", sample: "Serum", tat: "24 Hours" },
  { code: "TST-CRP", name: "CRP (C-Reactive Protein)", type: "Individual", category: "Immunology", dept: "Pathology", sample: "Serum", tat: "4 Hours" },
  { code: "TST-HBA1C", name: "HbA1c", type: "Individual", category: "Biochemistry", dept: "Pathology", sample: "Whole Blood (EDTA)", tat: "4 Hours" },
  { code: "TST-CULTURE", name: "Blood Culture", type: "Individual", category: "Microbiology", dept: "Microbiology", sample: "Blood (Aerobic/Anaerobic)", tat: "48 Hours" },
  { code: "TST-FT3", name: "Free T3", type: "Individual", category: "Endocrinology", dept: "Pathology", sample: "Serum", tat: "6 Hours" },
  { code: "TST-FT4", name: "Free T4", type: "Individual", category: "Endocrinology", dept: "Pathology", sample: "Serum", tat: "6 Hours" },
  { code: "TST-UREA", name: "Blood Urea", type: "Individual", category: "Biochemistry", dept: "Pathology", sample: "Serum", tat: "3 Hours" }
];

window.renderLabOrderingWorkflow = function(container, patient) {
  const recentOrders = state.orders.filter(o => o.uhid === patient.uhid && o.type === 'Laboratory');
  
  container.innerHTML = `
    <style>
      .lab-order-container {
        display: grid;
        grid-template-columns: 1.2fr 0.8fr;
        gap: 1.25rem;
        color: var(--text-primary);
        font-family: inherit;
        text-align: left;
      }
      .lab-order-left, .lab-order-right {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }
      .lab-search-wrapper {
        position: relative;
      }
      .lab-search-results {
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        background: var(--bg-surface-elevated);
        border: 1px solid var(--border-color);
        border-radius: var(--radius-md);
        box-shadow: var(--shadow-lg);
        max-height: 250px;
        overflow-y: auto;
        z-index: 1000;
        display: none;
      }
      .lab-search-group-title {
        background: var(--bg-surface);
        padding: 0.35rem 0.75rem;
        font-weight: 700;
        font-size: 0.7rem;
        color: var(--text-muted);
        text-transform: uppercase;
        border-bottom: 1px solid var(--border-color);
        text-align: left;
      }
      .lab-search-item {
        padding: 0.5rem 0.75rem;
        cursor: pointer;
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 1px solid var(--border-color);
        font-size: 0.8rem;
        text-align: left;
      }
      .lab-search-item:hover {
        background: var(--primary-glow);
      }
      .lab-chip {
        display: inline-flex;
        align-items: center;
        background: var(--bg-surface-elevated);
        border: 1px solid var(--border-color);
        padding: 0.3rem 0.6rem;
        border-radius: 20px;
        font-size: 0.72rem;
        cursor: pointer;
        transition: all 0.2s ease;
      }
      .lab-chip:hover {
        background: var(--primary);
        color: #fff;
        border-color: var(--primary);
      }
      .selected-tests-table th, .selected-tests-table td {
        padding: 0.5rem 0.35rem;
        font-size: 0.75rem;
        text-align: left;
      }
      .recom-item {
        cursor: pointer;
        color: var(--primary);
        text-decoration: underline;
        font-size: 0.75rem;
        display: inline-block;
        margin-right: 0.5rem;
        font-weight: 600;
      }
      .recom-item:hover {
        color: var(--primary-hover);
      }
    </style>

    <div class="lab-order-container">
      <div class="lab-order-left">
        <div class="form-group" style="margin-bottom:0;">
          <label class="form-label" style="font-weight: 700; font-size:0.85rem; margin-bottom:0.25rem;">Search & Add Investigations</label>
          <div class="lab-search-wrapper">
            <input type="text" id="lab-search-input" class="form-control" placeholder="Search lab tests, panels, profiles, or test codes..." autocomplete="off" style="font-size:0.85rem; padding:0.4rem;">
            <div id="lab-search-results" class="lab-search-results"></div>
          </div>
        </div>

        <div class="form-group" style="margin-bottom: 0;">
          <label class="form-label" style="font-size: 0.75rem; font-weight: 700; color: var(--text-secondary); margin-bottom: 0.25rem; display: block;">Frequently Ordered</label>
          <div style="display: flex; flex-wrap: wrap; gap: 0.35rem;" id="quick-access-chips"></div>
        </div>

        <div class="card" style="border: 1px solid var(--border-color); box-shadow: none; margin-bottom: 0; border-radius: var(--radius-md);">
          <div class="card-header" style="padding: 0.5rem 0.75rem; display: flex; justify-content: space-between; align-items: center; background-color: var(--bg-surface-elevated); border-bottom: 1px solid var(--border-color);">
            <strong style="font-size: 0.8rem; color: var(--text-primary);">Selected Investigations (<span id="selected-count">0</span>)</strong>
            <button class="btn btn-secondary" style="padding: 0.2rem 0.5rem; font-size: 0.7rem; height:auto; line-height:1;" onclick="clearLabSelection()">Clear Selection</button>
          </div>
          <div class="card-body" style="padding: 0;">
            <table class="custom-table selected-tests-table" style="margin: 0; width: 100%;">
              <thead>
                <tr style="background-color: var(--bg-surface);">
                  <th style="width: 30px; padding-left: 0.5rem;"><input type="checkbox" id="select-all-selected" onclick="toggleSelectAllSelected(this.checked)"></th>
                  <th>Test Name</th>
                  <th>Type</th>
                  <th>Sample Type</th>
                  <th>Priority</th>
                  <th>Special Instructions</th>
                  <th style="text-align: right; padding-right: 0.5rem;">Action</th>
                </tr>
              </thead>
              <tbody id="selected-tests-body"></tbody>
            </table>
            <div id="no-tests-selected" style="padding: 2rem; text-align: center; color: var(--text-muted); font-size: 0.8rem;">
              No investigations selected. Search or click quick access chips to add.
            </div>
          </div>
          <div class="card-footer" style="padding: 0.4rem 0.5rem; display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--border-color); background-color: var(--bg-surface-elevated);">
            <button class="btn btn-secondary" style="padding: 0.2rem 0.5rem; font-size: 0.7rem; height:auto; line-height:1;" onclick="bulkRemoveSelected()">Bulk Remove</button>
          </div>
        </div>
      </div>

      <div class="lab-order-right">
        <div class="card" style="border: 1px solid var(--border-color); box-shadow: none; margin-bottom: 0; border-radius: var(--radius-md);">
          <div class="card-header" style="padding: 0.5rem 0.75rem; background-color: var(--bg-surface-elevated); border-bottom: 1px solid var(--border-color);">
            <strong style="font-size: 0.8rem;">Order Specifications</strong>
          </div>
          <div class="card-body" style="padding: 0.75rem; display: flex; flex-direction: column; gap: 0.6rem;">
            <div class="form-group" style="margin-bottom:0;">
              <label style="font-size: 0.72rem; font-weight: 700; margin-bottom:0.15rem; display:block;">Ordering Physician</label>
              <select id="lab-order-physician" class="form-select" style="font-size: 0.78rem; padding: 0.25rem;">
                ${state.doctors.map(d => `<option value="${d.name}" ${d.name === patient.primaryConsultant ? 'selected' : ''}>${d.name} (${d.spec})</option>`).join('')}
              </select>
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem;">
              <div class="form-group" style="margin-bottom:0;">
                <label style="font-size: 0.72rem; font-weight: 700; margin-bottom:0.15rem; display:block;">Priority (Order-wide)</label>
                <select id="lab-order-prio" class="form-select" style="font-size: 0.78rem; padding: 0.25rem;" onchange="updateAllPriorities(this.value)">
                  <option value="Routine">Routine</option>
                  <option value="Urgent">Urgent</option>
                  <option value="Stat">Stat</option>
                </select>
              </div>
              <div class="form-group" style="margin-bottom:0;">
                <label style="font-size: 0.72rem; font-weight: 700; margin-bottom:0.15rem; display:block;">Collection Location</label>
                <select id="lab-order-loc" class="form-select" style="font-size: 0.78rem; padding: 0.25rem;">
                  <option value="OPD" ${patient.status === 'Checked In' ? 'selected' : ''}>OPD Clinic</option>
                  <option value="IPD" ${patient.status === 'Admitted' ? 'selected' : ''}>IPD Ward</option>
                  <option value="ICU">ICU Ward</option>
                  <option value="Emergency">Emergency Room</option>
                </select>
              </div>
            </div>

            <div style="display: grid; grid-template-columns: 1.2fr 0.8fr; gap: 0.5rem;">
              <div class="form-group" style="margin-bottom:0;">
                <label style="font-size: 0.72rem; font-weight: 700; margin-bottom:0.15rem; display:block;">Collection Date & Time</label>
                <input type="datetime-local" id="lab-order-datetime" class="form-control" style="font-size: 0.78rem; padding: 0.25rem;">
              </div>
              <div class="form-group" style="margin-bottom:0;">
                <label style="font-size: 0.72rem; font-weight: 700; display: block; margin-bottom: 0.15rem;">Fasting Required?</label>
                <div style="display: flex; gap: 0.75rem; margin-top: 0.25rem;">
                  <label style="font-size: 0.75rem; cursor: pointer; display: flex; align-items: center; gap: 0.25rem; margin-bottom:0;">
                    <input type="radio" name="lab-fasting" value="Yes"> Yes
                  </label>
                  <label style="font-size: 0.75rem; cursor: pointer; display: flex; align-items: center; gap: 0.25rem; margin-bottom:0;">
                    <input type="radio" name="lab-fasting" value="No" checked> No
                  </label>
                </div>
              </div>
            </div>

            <div class="form-group" style="margin-bottom:0;">
              <label style="font-size: 0.72rem; font-weight: 700; margin-bottom:0.15rem; display:block;">Clinical Notes / Diagnosis</label>
              <textarea id="lab-order-notes" class="form-control" rows="2" style="font-size: 0.78rem; padding: 0.25rem;" placeholder="Provisional diagnosis...">${patient.clinicalData.diagnosis || ''}</textarea>
            </div>
          </div>
        </div>

        <div class="card" style="border: 1px solid var(--border-color); box-shadow: none; margin-bottom: 0; border-radius: var(--radius-md);">
          <div class="card-header" style="padding: 0.5rem 0.75rem; background-color: var(--bg-surface-elevated); border-bottom: 1px solid var(--border-color);">
            <strong style="font-size: 0.8rem;">Clinical Decision Support (CDSS)</strong>
          </div>
          <div class="card-body" style="padding: 0.6rem; display: flex; flex-direction: column; gap: 0.6rem;">
            <div id="duplicate-warning-banner" style="display: none; background-color: var(--color-danger-bg); border: 1px solid var(--color-danger); padding: 0.4rem; border-radius: 4px; color: var(--color-danger); font-size: 0.72rem; text-align: left;">
              <strong>⚠️ Duplicate Alert:</strong> <span id="duplicate-warning-text"></span>
            </div>
            
            <div>
              <span style="font-size: 0.72rem; font-weight: 700; color: var(--text-secondary); display: block; margin-bottom: 0.15rem;">Suggested Investigations</span>
              <div id="lab-recommendations-list">
                <span style="color: var(--text-muted); font-size: 0.72rem;">Select tests to see recommendations.</span>
              </div>
            </div>

            <div>
              <span style="font-size: 0.72rem; font-weight: 700; color: var(--text-secondary); display: block; margin-bottom: 0.15rem;">Latest Laboratory Values</span>
              <div style="display: flex; flex-direction: column; gap: 0.25rem; font-size: 0.72rem;" id="recent-results-list">
                ${recentOrders.slice(0, 3).map(o => `
                  <div style="background-color: var(--bg-surface-elevated); padding: 0.25rem 0.4rem; border-radius: 4px; display: flex; justify-content: space-between;">
                    <strong>${o.name}:</strong> <span>${o.result || 'Pending'} (${o.date})</span>
                  </div>
                `).join('') || '<span style="color: var(--text-muted);">No prior laboratory investigations found.</span>'}
              </div>
            </div>
          </div>
        </div>

        <div style="display: flex; flex-direction: column; gap: 0.4rem; margin-top: auto;">
          <button class="btn btn-primary" style="width: 100%; display: flex; align-items: center; justify-content: center; padding: 0.5rem;" onclick="submitPlaceLabOrder('${patient.uhid}')">
            <strong>Place Lab Order</strong>
          </button>
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.3rem;">
            <button class="btn btn-secondary" style="font-size: 0.7rem; padding: 0.35rem 0.2rem; height:auto;" onclick="saveLabOrderDraft()">Save Draft</button>
            <button class="btn btn-secondary" style="font-size: 0.7rem; padding: 0.35rem 0.2rem; height:auto;" onclick="printLabRequisition()">Print Req.</button>
            <button class="btn btn-secondary" style="font-size: 0.7rem; padding: 0.35rem 0.2rem; height:auto;" onclick="submitPlaceLabOrder('${patient.uhid}', 'Sent to Lab')">Send to Lab</button>
          </div>
        </div>
      </div>
    </div>
  `;

  // Set default datetime
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  document.getElementById('lab-order-datetime').value = now.toISOString().slice(0, 16);

  // Load chips
  const quickAccessList = ["PAN-CBC", "PAN-LFT", "PAN-RFT", "TST-HBA1C", "PAN-LIPID", "PAN-THYROID", "PAN-URINE", "TST-CULTURE", "PAN-DENGUE", "TST-VITD"];
  const chipsContainer = document.getElementById('quick-access-chips');
  chipsContainer.innerHTML = quickAccessList.map(code => {
    const item = labCatalog.find(c => c.code === code);
    if (item) {
      const shortName = item.name.replace(' (EDTA)', '').replace(' (25-Hydroxy)', '').split(' (')[0];
      return `<div class="lab-chip" onclick="addLabTestByCode('${item.code}')">${shortName}</div>`;
    }
    return '';
  }).join('');

  // Search logic
  const searchInput = document.getElementById('lab-search-input');
  const searchResults = document.getElementById('lab-search-results');

  searchInput.addEventListener('input', () => {
    const q = searchInput.value.toLowerCase().trim();
    if (!q) {
      searchResults.style.display = 'none';
      return;
    }

    const filtered = labCatalog.filter(c => 
      c.name.toLowerCase().includes(q) || 
      c.code.toLowerCase().includes(q) || 
      c.category.toLowerCase().includes(q) || 
      c.dept.toLowerCase().includes(q)
    );

    if (filtered.length === 0) {
      searchResults.innerHTML = `<div style="padding: 0.75rem; text-align: center; color: var(--text-muted); font-size: 0.8rem;">No matching investigations found.</div>`;
      searchResults.style.display = 'block';
      return;
    }

    const panels = filtered.filter(c => c.type === 'Panel');
    const individuals = filtered.filter(c => c.type === 'Individual');

    let html = '';
    if (panels.length > 0) {
      html += `<div class="lab-search-group-title">Panels</div>`;
      panels.forEach(p => {
        html += `
          <div class="lab-search-item" onclick="addLabTestByCode('${p.code}')">
            <div>
              <strong>${p.name}</strong> <span style="font-size:0.7rem; color:var(--text-muted); margin-left:0.25rem;">${p.category} | ${p.sample}</span>
            </div>
            <span style="font-size:0.7rem; color:var(--primary); font-weight:500;">TAT: ${p.tat}</span>
          </div>
        `;
      });
    }

    if (individuals.length > 0) {
      html += `<div class="lab-search-group-title">Individual Tests</div>`;
      individuals.forEach(p => {
        html += `
          <div class="lab-search-item" onclick="addLabTestByCode('${p.code}')">
            <div>
              <strong>${p.name}</strong> <span style="font-size:0.7rem; color:var(--text-muted); margin-left:0.25rem;">${p.category} | ${p.sample}</span>
            </div>
            <span style="font-size:0.7rem; color:var(--primary); font-weight:500;">TAT: ${p.tat}</span>
          </div>
        `;
      });
    }

    searchResults.innerHTML = html;
    searchResults.style.display = 'block';
  });

  // Hide search dropdown on click outside
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.lab-search-wrapper')) {
      searchResults.style.display = 'none';
    }
  });

  // Define actions globally for modal operations
  window.addLabTestByCode = function(code) {
    const item = labCatalog.find(c => c.code === code);
    if (!item) return;

    if (window.tempSelectedLabTests.find(t => t.code === code)) {
      alert(`${item.name} is already in the selected list.`);
      return;
    }

    window.tempSelectedLabTests.push({
      code: item.code,
      name: item.name,
      type: item.type,
      sample: item.sample,
      priority: document.getElementById('lab-order-prio').value || 'Routine',
      instructions: '',
      tests: item.tests || []
    });

    searchInput.value = '';
    searchResults.style.display = 'none';

    updateSelectedLabTestsTable(patient);
  };

  window.removeLabTestByCode = function(code) {
    window.tempSelectedLabTests = window.tempSelectedLabTests.filter(t => t.code !== code);
    updateSelectedLabTestsTable(patient);
  };

  window.toggleSelectAllSelected = function(checked) {
    document.querySelectorAll('.lab-cart-check').forEach(cb => cb.checked = checked);
  };

  window.bulkRemoveSelected = function() {
    const checkedCodes = Array.from(document.querySelectorAll('.lab-cart-check:checked')).map(cb => cb.value);
    if (checkedCodes.length === 0) return alert('Select at least one test to remove.');
    window.tempSelectedLabTests = window.tempSelectedLabTests.filter(t => !checkedCodes.includes(t.code));
    updateSelectedLabTestsTable(patient);
  };

  window.clearLabSelection = function() {
    window.tempSelectedLabTests = [];
    updateSelectedLabTestsTable(patient);
  };

  window.updateAllPriorities = function(val) {
    window.tempSelectedLabTests.forEach(t => t.priority = val);
    document.querySelectorAll('.lab-cart-prio').forEach(select => select.value = val);
  };

  window.updateItemPriority = function(code, val) {
    const item = window.tempSelectedLabTests.find(t => t.code === code);
    if (item) item.priority = val;
  };

  window.updateItemInstructions = function(code, val) {
    const item = window.tempSelectedLabTests.find(t => t.code === code);
    if (item) item.instructions = val;
  };

  window.togglePanelExpand = function(code) {
    const subrow = document.getElementById(`subrow-${code}`);
    if (subrow) {
      subrow.style.display = subrow.style.display === 'none' ? 'table-row' : 'none';
    }
  };

  window.saveLabOrderDraft = function() {
    alert('Laboratory order draft saved successfully.');
  };

  window.printLabRequisition = function() {
    if (window.tempSelectedLabTests.length === 0) return alert('Please add at least one test to print a requisition.');
    alert(`Requisition receipt generated for ${window.tempSelectedLabTests.length} investigations. Launching system print dialogue...`);
  };

  window.submitPlaceLabOrder = function(uhid, customStatus) {
    if (window.tempSelectedLabTests.length === 0) return alert('Please select at least one laboratory test to place an order.');

    const doc = document.getElementById('lab-order-physician').value;
    const loc = document.getElementById('lab-order-loc').value;
    const datetime = document.getElementById('lab-order-datetime').value;
    const fasting = document.querySelector('input[name="lab-fasting"]:checked')?.value || 'No';
    const notes = document.getElementById('lab-order-notes').value.trim();

    window.tempSelectedLabTests.forEach(test => {
      state.orders.push({
        id: "ORD" + String(6000 + state.orders.length + 1),
        uhid: patient.uhid,
        patientName: patient.name,
        doctorName: doc,
        type: "Laboratory",
        name: test.name,
        date: datetime ? datetime.split('T')[0] : new Date().toISOString().split('T')[0],
        priority: test.priority,
        status: customStatus || "Sample Collected",
        location: loc,
        fasting: fasting,
        instructions: test.instructions,
        clinicalNotes: notes,
        result: ""
      });
    });

    state.auditLogs.push({
      timestamp: new Date().toISOString(),
      user: doc,
      uhid: patient.uhid,
      patientName: patient.name,
      action: "PLACE LAB ORDER",
      details: `Placed Lab Orders for: ${window.tempSelectedLabTests.map(t => t.name).join(', ')}`
    });

    window.closeActionModal();
    alert('Laboratory investigations ordered successfully.');
    
    const container = document.getElementById('main-content');
    if (window.router && window.router.currentPage === 'emr') {
      window.views.emr(container, null, { uhid: patient.uhid });
    } else {
      const activeTab = document.querySelector('.tab-btn.btn-primary')?.dataset.tab || 'overview';
      renderPatient360Profile(container, patient, activeTab);
    }
  };

  function updateSelectedLabTestsTable(patient) {
    const tbody = document.getElementById('selected-tests-body');
    const noTests = document.getElementById('no-tests-selected');
    const countEl = document.getElementById('selected-count');

    countEl.innerText = window.tempSelectedLabTests.length;

    if (window.tempSelectedLabTests.length === 0) {
      tbody.innerHTML = '';
      noTests.style.display = 'block';
      document.getElementById('duplicate-warning-banner').style.display = 'none';
      document.getElementById('lab-recommendations-list').innerHTML = `<span style="color: var(--text-muted); font-size: 0.72rem;">Select tests to see recommendations.</span>`;
      return;
    }

    noTests.style.display = 'none';
    let tbodyHTML = '';

    window.tempSelectedLabTests.forEach(test => {
      const isPanel = test.type === 'Panel';
      tbodyHTML += `
        <tr>
          <td style="padding-left: 0.5rem;"><input type="checkbox" class="lab-cart-check" value="${test.code}"></td>
          <td>
            <div style="font-weight:600;">
              ${isPanel ? `<span style="cursor:pointer; color:var(--primary); margin-right:0.25rem;" onclick="togglePanelExpand('${test.code}')">▼</span>` : ''}
              ${test.name}
            </div>
          </td>
          <td><span class="badge ${isPanel ? 'bg-primary' : 'bg-secondary'}" style="color:#fff; padding:0.15rem 0.35rem; border-radius:3px; font-size:0.7rem;">${test.type}</span></td>
          <td><small>${test.sample}</small></td>
          <td>
            <select class="form-select lab-cart-prio" style="font-size:0.72rem; padding:0.1rem; height:auto; width:auto;" onchange="updateItemPriority('${test.code}', this.value)">
              <option value="Routine" ${test.priority === 'Routine' ? 'selected' : ''}>Routine</option>
              <option value="Urgent" ${test.priority === 'Urgent' ? 'selected' : ''}>Urgent</option>
              <option value="Stat" ${test.priority === 'Stat' ? 'selected' : ''}>Stat</option>
            </select>
          </td>
          <td>
            <input type="text" class="form-control" placeholder="Instructions..." style="font-size:0.72rem; padding:0.15rem 0.25rem; height:auto;" value="${test.instructions}" onchange="updateItemInstructions('${test.code}', this.value)">
          </td>
          <td style="text-align: right; padding-right: 0.5rem;">
            <button class="btn btn-danger" style="padding:0.15rem 0.35rem; font-size:0.7rem; height:auto; line-height:1;" onclick="removeLabTestByCode('${test.code}')">Remove</button>
          </td>
        </tr>
        <tr id="subrow-${test.code}" style="display: ${isPanel ? 'table-row' : 'none'}; background-color: var(--bg-surface-elevated);">
          <td></td>
          <td colspan="6" style="padding:0.35rem 0.5rem;">
            <div style="font-size:0.72rem; color:var(--text-secondary);">
              <strong>Included tests:</strong> ${test.tests.join(', ')}
            </div>
          </td>
        </tr>
      `;
    });

    tbody.innerHTML = tbodyHTML;

    // Smart Features - Duplicate detection
    const dupes = [];
    window.tempSelectedLabTests.forEach(test => {
      const match = recentOrders.find(o => o.name === test.name);
      if (match) {
        dupes.push(`${test.name} (ordered ${match.date})`);
      }
    });

    const dupBanner = document.getElementById('duplicate-warning-banner');
    const dupText = document.getElementById('duplicate-warning-text');
    if (dupes.length > 0) {
      dupText.innerText = `${dupes.join(', ')}.`;
      dupBanner.style.display = 'block';
    } else {
      dupBanner.style.display = 'none';
    }

    // Smart Features - Recommendations
    const recs = [];
    const hasTSH = window.tempSelectedLabTests.find(t => t.code === 'TST-TSH');
    const hasCreatinine = window.tempSelectedLabTests.find(t => t.code === 'TST-CREAT');

    if (hasTSH) {
      if (!window.tempSelectedLabTests.find(t => t.code === 'TST-FT3')) recs.push({ code: 'TST-FT3', name: 'Free T3' });
      if (!window.tempSelectedLabTests.find(t => t.code === 'TST-FT4')) recs.push({ code: 'TST-FT4', name: 'Free T4' });
      if (!window.tempSelectedLabTests.find(t => t.code === 'PAN-THYROID')) recs.push({ code: 'PAN-THYROID', name: 'Thyroid Profile' });
    }

    if (hasCreatinine) {
      if (!window.tempSelectedLabTests.find(t => t.code === 'PAN-RFT')) recs.push({ code: 'PAN-RFT', name: 'Renal Function Test' });
    }

    const recsContainer = document.getElementById('lab-recommendations-list');
    if (recs.length > 0) {
      recsContainer.innerHTML = recs.map(r => `
        <span class="recom-item" onclick="addLabTestByCode('${r.code}')">+ Add ${r.name}</span>
      `).join('');
    } else {
      recsContainer.innerHTML = `<span style="color: var(--text-muted); font-size: 0.72rem;">No recommendations for selected tests.</span>`;
    }
  }
};

// ==========================================================================
// 9. HIS/EMR RADIOLOGY ORDERING & BOOKING WORKFLOW
// ==========================================================================
const radCatalog = [
  { code: "RAD-XRAY-CHEST", name: "X-Ray Chest PA View", modality: "X-Ray" },
  { code: "RAD-CT-BRAIN", name: "CT Brain Plain", modality: "CT Scan" },
  { code: "RAD-MRI-SPINE", name: "MRI Spine Lumbar", modality: "MRI" },
  { code: "RAD-USG-ABD", name: "USG Abdomen & Pelvis", modality: "Ultrasound" },
  { code: "RAD-MAMMO", name: "Mammography Bilateral", modality: "Mammography" },
  { code: "RAD-ECHO", name: "Echocardiography (Echo)", modality: "Echocardiography" },
  { code: "RAD-DOPPLER", name: "USG Color Doppler Lower Limbs", modality: "Doppler" },
  { code: "RAD-XRAY-KNEE", name: "X-Ray Knee AP/Lateral", modality: "X-Ray" },
  { code: "RAD-CT-CHEST", name: "CT Chest HRCT", modality: "CT Scan" },
  { code: "RAD-MRI-BRAIN", name: "MRI Brain Axial T2", modality: "MRI" }
];

window.renderRadOrderingWorkflow = function(container, patient) {
  window.activeRadPatientUhid = patient.uhid;
  // Set default active tab
  window.activeRadTab = window.activeRadTab || 'new-order';
  window.activeRescheduleOrderId = null;
  window.activeViewOrderId = null;

  container.innerHTML = `
    <style>
      .rad-order-container {
        display: grid;
        grid-template-columns: 1.2fr 0.8fr;
        gap: 1.25rem;
        color: var(--text-primary);
        font-family: inherit;
        text-align: left;
      }
      .rad-order-left, .rad-order-right {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }
      .rad-search-wrapper {
        position: relative;
      }
      .rad-search-results {
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        background: var(--bg-surface-elevated);
        border: 1px solid var(--border-color);
        border-radius: var(--radius-md);
        box-shadow: var(--shadow-lg);
        max-height: 250px;
        overflow-y: auto;
        z-index: 1000;
        display: none;
      }
      .rad-search-group-title {
        background: var(--bg-surface);
        padding: 0.35rem 0.75rem;
        font-weight: 700;
        font-size: 0.7rem;
        color: var(--text-muted);
        text-transform: uppercase;
        border-bottom: 1px solid var(--border-color);
        text-align: left;
      }
      .rad-search-item {
        padding: 0.5rem 0.75rem;
        cursor: pointer;
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 1px solid var(--border-color);
        font-size: 0.8rem;
        text-align: left;
      }
      .rad-search-item:hover {
        background: var(--primary-glow);
      }
      .rad-chip {
        display: inline-flex;
        align-items: center;
        background: var(--bg-surface-elevated);
        border: 1px solid var(--border-color);
        padding: 0.3rem 0.6rem;
        border-radius: 20px;
        font-size: 0.72rem;
        cursor: pointer;
        transition: all 0.2s ease;
      }
      .rad-chip:hover {
        background: var(--primary);
        color: #fff;
        border-color: var(--primary);
      }
      .selected-rads-table th, .selected-rads-table td {
        padding: 0.5rem 0.35rem;
        font-size: 0.75rem;
        text-align: left;
      }
      .rad-tab-header {
        display: flex;
        border-bottom: 1px solid var(--border-color);
        margin-bottom: 0.5rem;
      }
      .rad-tab-btn {
        flex: 1;
        padding: 0.5rem;
        text-align: center;
        cursor: pointer;
        font-size: 0.78rem;
        font-weight: 600;
        color: var(--text-muted);
        border-bottom: 2px solid transparent;
        transition: all 0.2s;
        background: none;
        border-top: none;
        border-left: none;
        border-right: none;
      }
      .rad-tab-btn.active {
        color: var(--primary);
        border-bottom-color: var(--primary);
      }
      .rad-tab-content {
        display: none;
      }
      .rad-tab-content.active {
        display: flex;
        flex-direction: column;
        gap: 0.6rem;
      }
    </style>

    <div class="rad-order-container">
      <div class="rad-order-left">
        <div class="form-group" style="margin-bottom:0;">
          <label class="form-label" style="font-weight: 700; font-size:0.85rem; margin-bottom:0.25rem;">Search & Add Investigations</label>
          <div class="rad-search-wrapper">
            <input type="text" id="rad-search-input" class="form-control" placeholder="Search radiology investigations by name or modality..." autocomplete="off" style="font-size:0.85rem; padding:0.4rem;">
            <div id="rad-search-results" class="rad-search-results"></div>
          </div>
        </div>

        <div class="form-group" style="margin-bottom: 0;">
          <label class="form-label" style="font-size: 0.75rem; font-weight: 700; color: var(--text-secondary); margin-bottom: 0.25rem; display: block;">Frequently Ordered</label>
          <div style="display: flex; flex-wrap: wrap; gap: 0.35rem;" id="quick-access-rad-chips"></div>
        </div>

        <div class="card" style="border: 1px solid var(--border-color); box-shadow: none; margin-bottom: 0; border-radius: var(--radius-md);">
          <div class="card-header" style="padding: 0.5rem 0.75rem; display: flex; justify-content: space-between; align-items: center; background-color: var(--bg-surface-elevated); border-bottom: 1px solid var(--border-color);">
            <strong style="font-size: 0.8rem; color: var(--text-primary);">Selected Investigations (<span id="selected-rad-count">0</span>)</strong>
            <button class="btn btn-secondary" style="padding: 0.2rem 0.5rem; font-size: 0.7rem; height:auto; line-height:1;" onclick="clearRadSelection()">Clear Selection</button>
          </div>
          <div class="card-body" style="padding: 0;">
            <table class="custom-table selected-rads-table" style="margin: 0; width: 100%;">
              <thead>
                <tr style="background-color: var(--bg-surface);">
                  <th>Investigation Name</th>
                  <th>Modality</th>
                  <th>Priority</th>
                  <th style="text-align: right; padding-right: 0.5rem;">Action</th>
                </tr>
              </thead>
              <tbody id="selected-rads-body"></tbody>
            </table>
            <div id="no-rads-selected" style="padding: 2rem; text-align: center; color: var(--text-muted); font-size: 0.8rem;">
              No investigations selected. Search or click quick access chips to add.
            </div>
          </div>
        </div>
      </div>

      <div class="rad-order-right">
        <div class="card" style="border: 1px solid var(--border-color); box-shadow: none; margin-bottom: 0; border-radius: var(--radius-md); flex: 1;">
          <div class="rad-tab-header">
            <button class="rad-tab-btn" id="tab-btn-new" onclick="changeRadTab('new-order')">New Order & Booking</button>
            <button class="rad-tab-btn" id="tab-btn-active" onclick="changeRadTab('active-orders')">Active Orders (<span id="active-rad-count-tab">0</span>)</button>
          </div>
          
          <div class="card-body" style="padding: 0.75rem;">
            <!-- Tab 1: New Order & Booking -->
            <div class="rad-tab-content" id="tab-content-new">
              <div class="form-group" style="margin-bottom:0;">
                <label style="font-size: 0.72rem; font-weight: 700; margin-bottom:0.15rem; display:block;">Ordering Physician</label>
                <select id="rad-order-physician" class="form-select" style="font-size: 0.78rem; padding: 0.25rem;">
                  ${state.doctors.map(d => `<option value="${d.name}" ${d.name === patient.primaryConsultant ? 'selected' : ''}>${d.name} (${d.spec})</option>`).join('')}
                </select>
              </div>
              
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem;">
                <div class="form-group" style="margin-bottom:0;">
                  <label style="font-size: 0.72rem; font-weight: 700; margin-bottom:0.15rem; display:block;">Priority (Order-wide)</label>
                  <select id="rad-order-prio" class="form-select" style="font-size: 0.78rem; padding: 0.25rem;" onchange="updateAllRadPriorities(this.value)">
                    <option value="Routine">Routine</option>
                    <option value="Urgent">Urgent</option>
                    <option value="Stat">Stat</option>
                  </select>
                </div>
                <div class="form-group" style="margin-bottom:0;">
                  <label style="font-size: 0.72rem; font-weight: 700; margin-bottom:0.15rem; display:block;">Location</label>
                  <select id="rad-order-loc" class="form-select" style="font-size: 0.78rem; padding: 0.25rem;">
                    <option value="OPD" ${patient.status === 'Checked In' ? 'selected' : ''}>OPD Clinic</option>
                    <option value="IPD" ${patient.status === 'Admitted' ? 'selected' : ''}>IPD Ward</option>
                    <option value="ICU">ICU Ward</option>
                    <option value="Emergency">Emergency Room</option>
                  </select>
                </div>
              </div>

              <div style="display: grid; grid-template-columns: 1.15fr 0.85fr; gap: 0.5rem;">
                <div class="form-group" style="margin-bottom:0;">
                  <label style="font-size: 0.72rem; font-weight: 700; margin-bottom:0.15rem; display:block;">Schedule Date</label>
                  <input type="date" id="rad-order-date" class="form-control" style="font-size: 0.78rem; padding: 0.25rem;">
                </div>
                <div class="form-group" style="margin-bottom:0;">
                  <label style="font-size: 0.72rem; font-weight: 700; margin-bottom:0.15rem; display:block;">Time Slot</label>
                  <select id="rad-order-time" class="form-select" style="font-size: 0.78rem; padding: 0.25rem;">
                    <option value="09:00 AM - 10:00 AM">09:00 AM - 10:00 AM</option>
                    <option value="10:00 AM - 11:00 AM" selected>10:00 AM - 11:00 AM</option>
                    <option value="11:00 AM - 12:00 PM">11:00 AM - 12:00 PM</option>
                    <option value="12:00 PM - 01:00 PM">12:00 PM - 01:00 PM</option>
                    <option value="02:00 PM - 03:00 PM">02:00 PM - 03:00 PM</option>
                    <option value="03:00 PM - 04:00 PM">03:00 PM - 04:00 PM</option>
                    <option value="04:00 PM - 05:00 PM">04:00 PM - 05:00 PM</option>
                  </select>
                </div>
              </div>

              <div class="form-group" style="margin-bottom:0;">
                <label style="font-size: 0.72rem; font-weight: 700; margin-bottom:0.15rem; display:block;">Indication for Study</label>
                <input type="text" id="rad-order-indication" class="form-control" style="font-size: 0.78rem; padding: 0.25rem;" placeholder="e.g. Chest pain, query effusion...">
              </div>

              <div class="form-group" style="margin-bottom:0;">
                <label style="font-size: 0.72rem; font-weight: 700; margin-bottom:0.15rem; display:block;">Clinical Notes / Provisional Diagnosis</label>
                <textarea id="rad-order-notes" class="form-control" rows="2" style="font-size: 0.78rem; padding: 0.25rem;" placeholder="Provisional diagnosis details...">${patient.clinicalData.diagnosis || ''}</textarea>
              </div>

              <div style="display: flex; flex-direction: column; gap: 0.4rem; margin-top: auto; padding-top: 1rem;">
                <button class="btn btn-primary" style="width: 100%; display: flex; align-items: center; justify-content: center; padding: 0.5rem;" onclick="submitPlaceRadOrder('${patient.uhid}')">
                  <strong>Place Radiology Order & Book</strong>
                </button>
                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.35rem;">
                  <button class="btn btn-secondary" style="font-size: 0.7rem; padding: 0.35rem 0.2rem; height:auto;" onclick="saveRadOrderDraft()">Save Draft</button>
                  <button class="btn btn-secondary" style="font-size: 0.7rem; padding: 0.35rem 0.2rem; height:auto;" onclick="printRadRequisition()">Print Req.</button>
                  <button class="btn btn-secondary" style="font-size: 0.7rem; padding: 0.35rem 0.2rem; height:auto;" onclick="submitPlaceRadOrder('${patient.uhid}', 'Ordered')">Order Only</button>
                </div>
              </div>
            </div>

            <!-- Tab 2: Active Orders -->
            <div class="rad-tab-content" id="tab-content-active">
              <div id="active-rad-orders-list-container" style="max-height: 400px; overflow-y: auto;">
                <!-- Filled dynamically -->
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  // Set default date input value to today (YYYY-MM-DD)
  const todayStr = new Date().toLocaleDateString('en-CA');
  document.getElementById('rad-order-date').value = todayStr;

  // Render quick chips
  const quickAccessRadList = ["RAD-XRAY-CHEST", "RAD-CT-BRAIN", "RAD-MRI-SPINE", "RAD-USG-ABD", "RAD-MAMMO", "RAD-ECHO", "RAD-DOPPLER"];
  const chipsContainer = document.getElementById('quick-access-rad-chips');
  chipsContainer.innerHTML = quickAccessRadList.map(code => {
    const item = radCatalog.find(c => c.code === code);
    if (item) {
      return `<div class="rad-chip" onclick="addRadInvestigationByCode('${item.code}')">${item.name.split(' (')[0]}</div>`;
    }
    return '';
  }).join('');

  // Search logic
  const searchInput = document.getElementById('rad-search-input');
  const searchResults = document.getElementById('rad-search-results');

  searchInput.addEventListener('input', () => {
    const q = searchInput.value.toLowerCase().trim();
    if (!q) {
      searchResults.style.display = 'none';
      return;
    }

    const filtered = radCatalog.filter(c => 
      c.name.toLowerCase().includes(q) || 
      c.modality.toLowerCase().includes(q)
    );

    if (filtered.length === 0) {
      searchResults.innerHTML = `<div style="padding: 0.75rem; text-align: center; color: var(--text-muted); font-size: 0.8rem;">No matching investigations found.</div>`;
      searchResults.style.display = 'block';
      return;
    }

    let html = `<div class="rad-search-group-title">Investigations</div>`;
    filtered.forEach(p => {
      html += `
        <div class="rad-search-item" onclick="addRadInvestigationByCode('${p.code}')">
          <div><strong>${p.name}</strong></div>
          <span style="font-size:0.7rem; color:var(--primary); font-weight:600; text-transform:uppercase;">${p.modality}</span>
        </div>
      `;
    });

    searchResults.innerHTML = html;
    searchResults.style.display = 'block';
  });

  // Hide search dropdown on click outside
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.rad-search-wrapper')) {
      searchResults.style.display = 'none';
    }
  });

  // Initial runs
  window.changeRadTab(window.activeRadTab);
  updateSelectedRadInvestigationsTable(patient);
};

// Global Actions for Radiology Ordering & Booking Workflow
window.changeRadTab = function(tabName) {
  window.activeRadTab = tabName;
  document.querySelectorAll('.rad-tab-btn').forEach(btn => btn.classList.remove('active'));
  document.querySelectorAll('.rad-tab-content').forEach(content => content.classList.remove('active'));

  if (tabName === 'new-order') {
    document.getElementById('tab-btn-new').classList.add('active');
    document.getElementById('tab-content-new').classList.add('active');
  } else {
    document.getElementById('tab-btn-active').classList.add('active');
    document.getElementById('tab-content-active').classList.add('active');
    const patient = state.patients.find(p => p.uhid === window.activeRadPatientUhid);
    if (patient) updateActiveRadOrdersList(patient);
  }
};

window.addRadInvestigationByCode = function(code) {
  const item = radCatalog.find(c => c.code === code);
  if (!item) return;

  if (window.tempSelectedRadInvestigations.find(t => t.code === code)) {
    alert(`${item.name} is already selected.`);
    return;
  }

  window.tempSelectedRadInvestigations.push({
    code: item.code,
    name: item.name,
    modality: item.modality,
    priority: document.getElementById('rad-order-prio')?.value || 'Routine'
  });

  const searchInput = document.getElementById('rad-search-input');
  const searchResults = document.getElementById('rad-search-results');
  if (searchInput) searchInput.value = '';
  if (searchResults) searchResults.style.display = 'none';

  const patient = state.patients.find(p => p.uhid === window.activeRadPatientUhid);
  if (patient) updateSelectedRadInvestigationsTable(patient);
};

window.removeRadInvestigationByCode = function(code) {
  window.tempSelectedRadInvestigations = window.tempSelectedRadInvestigations.filter(t => t.code !== code);
  const patient = state.patients.find(p => p.uhid === window.activeRadPatientUhid);
  if (patient) updateSelectedRadInvestigationsTable(patient);
};

window.clearRadSelection = function() {
  window.tempSelectedRadInvestigations = [];
  const patient = state.patients.find(p => p.uhid === window.activeRadPatientUhid);
  if (patient) updateSelectedRadInvestigationsTable(patient);
};

window.updateAllRadPriorities = function(val) {
  window.tempSelectedRadInvestigations.forEach(t => t.priority = val);
  document.querySelectorAll('.rad-cart-prio').forEach(select => select.value = val);
};

window.updateRadItemPriority = function(code, val) {
  const item = window.tempSelectedRadInvestigations.find(t => t.code === code);
  if (item) item.priority = val;
};

window.saveRadOrderDraft = function() {
  alert('Radiology order draft saved successfully.');
};

window.printRadRequisition = function() {
  if (window.tempSelectedRadInvestigations.length === 0) return alert('Please add at least one investigation to print a requisition.');
  alert(`Radiology requisition slip generated for ${window.tempSelectedRadInvestigations.length} investigations. Launching print interface...`);
};

window.submitPlaceRadOrder = function(uhid, customStatus) {
  if (window.tempSelectedRadInvestigations.length === 0) {
    return alert('Please select at least one radiology investigation to place an order.');
  }

  const doc = document.getElementById('rad-order-physician').value;
  const priority = document.getElementById('rad-order-prio').value;
  const indication = document.getElementById('rad-order-indication').value.trim();
  const notes = document.getElementById('rad-order-notes').value.trim();
  const schedDate = document.getElementById('rad-order-date').value;
  const schedTime = document.getElementById('rad-order-time').value;

  const todayStr = new Date().toLocaleDateString('en-CA');
  const nowTime = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  const patient = state.patients.find(p => p.uhid === uhid);
  if (!patient) return;

  window.tempSelectedRadInvestigations.forEach(investigation => {
    const isScheduled = schedDate && schedTime && customStatus !== 'Ordered';
    const status = customStatus === 'Ordered' ? 'Ordered' : (isScheduled ? 'Scheduled' : 'Ordered');

    state.orders.push({
      id: "ORD" + String(6000 + state.orders.length + 1),
      uhid: patient.uhid,
      patientName: patient.name,
      doctorName: doc,
      type: "Radiology",
      name: investigation.name,
      modality: investigation.modality,
      date: todayStr,
      priority: investigation.priority,
      status: status,
      scheduledDate: status === 'Scheduled' ? schedDate : '',
      scheduledTime: status === 'Scheduled' ? schedTime : '',
      indication: indication,
      clinicalNotes: notes,
      result: ""
    });

    // Log to timeline events
    patient.timelineEvents = patient.timelineEvents || [];
    patient.timelineEvents.unshift({
      date: `${todayStr} ${nowTime}`,
      type: 'clinical',
      icon: '💀',
      title: status === 'Scheduled' ? 'Radiology Scheduled' : 'Radiology Ordered',
      desc: `${investigation.name} (${investigation.modality}) - ${status === 'Scheduled' ? `Scheduled on ${schedDate} at ${schedTime}` : 'Ordered'}`
    });
  });

  state.auditLogs.push({
    timestamp: new Date().toISOString(),
    user: doc,
    uhid: patient.uhid,
    patientName: patient.name,
    action: "PLACE RADIOLOGY ORDER",
    details: `Placed Radiology Orders for: ${window.tempSelectedRadInvestigations.map(t => t.name).join(', ')}`
  });

  window.closeActionModal();
  alert('Radiology investigations ordered successfully.');

  // Re-render
  const container = document.getElementById('main-content');
  if (window.router && window.router.currentPage === 'emr') {
    window.views.emr(container, null, { uhid: patient.uhid });
  } else {
    const activeTab = document.querySelector('.tab-btn.btn-primary')?.dataset.tab || 'overview';
    renderPatient360Profile(container, patient, activeTab);
  }
};

window.cancelRadReschedule = function() {
  window.activeRescheduleOrderId = null;
  const patient = state.patients.find(p => p.uhid === window.activeRadPatientUhid);
  if (patient) updateActiveRadOrdersList(patient);
};

window.saveRadReschedule = function(orderId) {
  const order = state.orders.find(o => o.id === orderId);
  if (order) {
    const date = document.getElementById(`resched-date-${orderId}`).value;
    const time = document.getElementById(`resched-time-${orderId}`).value;
    if (!date || !time) return alert("Please select date and time slot.");
    order.scheduledDate = date;
    order.scheduledTime = time;
    order.status = "Scheduled";

    const patient = state.patients.find(p => p.uhid === window.activeRadPatientUhid);
    if (patient) {
      // Log timeline event
      const todayStr = new Date().toLocaleDateString('en-CA');
      const nowTime = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
      patient.timelineEvents = patient.timelineEvents || [];
      patient.timelineEvents.unshift({
        date: `${todayStr} ${nowTime}`,
        type: 'clinical',
        icon: '🔄',
        title: 'Radiology Rescheduled',
        desc: `${order.name} rescheduled to ${date} at ${time}`
      });
    }

    alert("Radiology order rescheduled successfully.");
    window.activeRescheduleOrderId = null;
    if (patient) updateActiveRadOrdersList(patient);
  }
};

window.cancelRadOrder = function(orderId) {
  const order = state.orders.find(o => o.id === orderId);
  if (order) {
    if (confirm(`Are you sure you want to cancel the radiology order for ${order.name}?`)) {
      order.status = "Cancelled";

      const patient = state.patients.find(p => p.uhid === window.activeRadPatientUhid);
      if (patient) {
        // Log timeline event
        const todayStr = new Date().toLocaleDateString('en-CA');
        const nowTime = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        patient.timelineEvents = patient.timelineEvents || [];
        patient.timelineEvents.unshift({
          date: `${todayStr} ${nowTime}`,
          type: 'clinical',
          icon: '❌',
          title: 'Radiology Order Cancelled',
          desc: `Cancelled order for ${order.name}`
        });
      }

      alert("Radiology order cancelled successfully.");
      if (patient) updateActiveRadOrdersList(patient);
    }
  }
};

window.viewRadOrderDetails = function(orderId) {
  window.activeViewOrderId = orderId;
  const patient = state.patients.find(p => p.uhid === window.activeRadPatientUhid);
  if (patient) updateActiveRadOrdersList(patient);
};

window.closeRadOrderDetails = function() {
  window.activeViewOrderId = null;
  const patient = state.patients.find(p => p.uhid === window.activeRadPatientUhid);
  if (patient) updateActiveRadOrdersList(patient);
};

function updateSelectedRadInvestigationsTable(patient) {
  const tbody = document.getElementById('selected-rads-body');
  const noRads = document.getElementById('no-rads-selected');
  const countEl = document.getElementById('selected-rad-count');

  const count = window.tempSelectedRadInvestigations.length;
  countEl.innerText = count;

  // Update tabs active count
  const radOrders = state.orders.filter(o => o.uhid === patient.uhid && o.type === 'Radiology');
  document.getElementById('active-rad-count-tab').innerText = radOrders.length;

  if (count === 0) {
    tbody.innerHTML = '';
    noRads.style.display = 'block';
    return;
  }

  noRads.style.display = 'none';
  let html = '';

  window.tempSelectedRadInvestigations.forEach(item => {
    html += `
      <tr>
        <td><strong>${item.name}</strong></td>
        <td><span class="badge bg-secondary" style="color:#fff; padding:0.15rem 0.35rem; border-radius:3px; font-size:0.7rem; text-transform:uppercase;">${item.modality}</span></td>
        <td>
          <select class="form-select rad-cart-prio" style="font-size:0.72rem; padding:0.1rem; height:auto; width:auto;" onchange="updateRadItemPriority('${item.code}', this.value)">
            <option value="Routine" ${item.priority === 'Routine' ? 'selected' : ''}>Routine</option>
            <option value="Urgent" ${item.priority === 'Urgent' ? 'selected' : ''}>Urgent</option>
            <option value="Stat" ${item.priority === 'Stat' ? 'selected' : ''}>Stat</option>
          </select>
        </td>
        <td style="text-align: right; padding-right: 0.5rem;">
          <button class="btn btn-danger" style="padding:0.15rem 0.35rem; font-size:0.7rem; height:auto; line-height:1;" onclick="removeRadInvestigationByCode('${item.code}')">Remove</button>
        </td>
      </tr>
    `;
  });

  tbody.innerHTML = html;
}

function updateActiveRadOrdersList(patient) {
  const container = document.getElementById('active-rad-orders-list-container');
  if (!container) return;

  const radOrders = state.orders.filter(o => o.uhid === patient.uhid && o.type === 'Radiology');
  document.getElementById('active-rad-count-tab').innerText = radOrders.length;

  if (radOrders.length === 0) {
    container.innerHTML = `<div style="padding: 2rem; text-align: center; color: var(--text-muted); font-size: 0.8rem;">No radiology orders found.</div>`;
    return;
  }

  const todayStr = new Date().toLocaleDateString('en-CA');

  container.innerHTML = `
    <table class="custom-table" style="width: 100%; font-size: 0.8rem;">
      <thead>
        <tr>
          <th>Investigation</th>
          <th>Ordered On</th>
          <th>Scheduled Date & Time</th>
          <th>Status</th>
          <th style="text-align: right; padding-right: 0.5rem;">Actions</th>
        </tr>
      </thead>
      <tbody>
        ${radOrders.map(order => {
          // Normalize status
          let displayStatus = order.status;
          if (order.status === 'Approved' || order.status === 'Result Entered') {
            displayStatus = 'Completed';
          } else if (order.status === 'Pending') {
            displayStatus = order.scheduledDate ? 'Scheduled' : 'Ordered';
          }

          let badgeColor = 'var(--text-muted)';
          if (displayStatus === 'Completed') badgeColor = 'var(--color-success)';
          else if (displayStatus === 'Scheduled') badgeColor = 'var(--primary)';
          else if (displayStatus === 'Ordered') badgeColor = 'var(--color-warning)';
          else if (displayStatus === 'Cancelled') badgeColor = 'var(--color-danger)';

          const isRescheduling = window.activeRescheduleOrderId === order.id;
          const isViewing = window.activeViewOrderId === order.id;

          const scheduledText = (order.scheduledDate && order.scheduledTime)
            ? `${order.scheduledDate} (${order.scheduledTime})`
            : `<span style="color:var(--text-muted); font-style:italic;">Pending Booking</span>`;

          return `
            <tr>
              <td>
                <div style="font-weight: 700;">${order.name}</div>
                <div style="font-size: 0.7rem; color: var(--text-muted); text-transform: uppercase;">${order.modality || 'Radiology'}</div>
              </td>
              <td>${order.date}</td>
              <td>
                <div>${scheduledText}</div>
                ${isRescheduling ? `
                  <div style="background: var(--bg-surface-elevated); padding: 0.5rem; border-radius: 4px; border: 1px solid var(--border-color); margin-top: 0.5rem; text-align:left;">
                    <label style="font-size:0.7rem; font-weight:700; display:block; margin-bottom:0.15rem;">Select New Schedule Slot</label>
                    <div style="display: flex; gap: 0.35rem; flex-direction:column;">
                      <input type="date" id="resched-date-${order.id}" class="form-control" style="font-size: 0.75rem; padding: 0.2rem; height:auto;" value="${order.scheduledDate || todayStr}">
                      <select id="resched-time-${order.id}" class="form-select" style="font-size: 0.75rem; padding: 0.2rem; height:auto;">
                        <option value="09:00 AM - 10:00 AM" ${order.scheduledTime === '09:00 AM - 10:00 AM' ? 'selected' : ''}>09:00 AM - 10:00 AM</option>
                        <option value="10:00 AM - 11:00 AM" ${order.scheduledTime === '10:00 AM - 11:00 AM' ? 'selected' : '' || !order.scheduledTime ? 'selected' : ''}>10:00 AM - 11:00 AM</option>
                        <option value="11:00 AM - 12:00 PM" ${order.scheduledTime === '11:00 AM - 12:00 PM' ? 'selected' : ''}>11:00 AM - 12:00 PM</option>
                        <option value="12:00 PM - 01:00 PM" ${order.scheduledTime === '12:00 PM - 01:00 PM' ? 'selected' : ''}>12:00 PM - 01:00 PM</option>
                        <option value="02:00 PM - 03:00 PM" ${order.scheduledTime === '02:00 PM - 03:00 PM' ? 'selected' : ''}>02:00 PM - 03:00 PM</option>
                        <option value="03:00 PM - 04:00 PM" ${order.scheduledTime === '03:00 PM - 04:00 PM' ? 'selected' : ''}>03:00 PM - 04:00 PM</option>
                        <option value="04:00 PM - 05:00 PM" ${order.scheduledTime === '04:00 PM - 05:00 PM' ? 'selected' : ''}>04:00 PM - 05:00 PM</option>
                      </select>
                    </div>
                    <div style="display: flex; gap: 0.25rem; justify-content: flex-end; margin-top: 0.5rem;">
                      <button class="btn btn-secondary" style="font-size: 0.7rem; padding: 0.15rem 0.35rem; height: auto;" onclick="cancelRadReschedule()">Cancel</button>
                      <button class="btn btn-primary" style="font-size: 0.7rem; padding: 0.15rem 0.35rem; height: auto;" onclick="saveRadReschedule('${order.id}')">Save</button>
                    </div>
                  </div>
                ` : ''}
                ${isViewing ? `
                  <div style="background: var(--bg-surface-elevated); padding: 0.6rem; border-radius: 6px; border: 1px solid var(--border-color); margin-top: 0.5rem; text-align: left; font-size: 0.75rem; display: flex; flex-direction: column; gap: 0.35rem;">
                    <div><strong>Physician:</strong> ${order.doctorName}</div>
                    <div><strong>Indication:</strong> ${order.indication || 'N/A'}</div>
                    <div><strong>Clinical Notes:</strong> ${order.clinicalNotes || 'N/A'}</div>
                    ${order.result ? `<div><strong>Result/Findings:</strong> <pre style="white-space: pre-wrap; font-family:inherit; margin:0.2rem 0 0 0;">${order.result}</pre></div>` : ''}
                    <div style="display: flex; justify-content: flex-end; margin-top:0.25rem;">
                      <button class="btn btn-secondary" style="font-size: 0.7rem; padding: 0.15rem 0.35rem; height: auto;" onclick="closeRadOrderDetails()">Close</button>
                    </div>
                  </div>
                ` : ''}
              </td>
              <td>
                <strong style="color: ${badgeColor}; font-size: 0.75rem; text-transform: uppercase;">
                  ${displayStatus}
                </strong>
              </td>
              <td style="text-align: right; padding-right: 0.5rem;">
                <div style="display: flex; gap: 0.25rem; justify-content: flex-end;">
                  <button class="btn btn-secondary" style="padding: 0.15rem 0.35rem; font-size: 0.7rem; height: auto;" onclick="viewRadOrderDetails('${order.id}')">View</button>
                  ${displayStatus !== 'Completed' && displayStatus !== 'Cancelled' ? `
                    <button class="btn btn-secondary" style="padding: 0.15rem 0.35rem; font-size: 0.7rem; height: auto;" onclick="window.activeRescheduleOrderId = '${order.id}'; window.activeViewOrderId = null; updateActiveRadOrdersList(patient);">Reschedule</button>
                    <button class="btn btn-danger" style="padding: 0.15rem 0.35rem; font-size: 0.7rem; height: auto;" onclick="cancelRadOrder('${order.id}')">Cancel</button>
                  ` : ''}
                </div>
              </td>
            </tr>
          `;
        }).join('')}
      </tbody>
    </table>
  `;
}

window.openEditOTRequestModal = function(caseId) {
  const c = state.ot?.scheduledCases?.find(cs => cs.id === caseId);
  if (!c) return alert("OT case request not found.");

  let modal = document.getElementById('ot-edit-booking-modal-overlay');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'ot-edit-booking-modal-overlay';
    modal.className = "fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900 bg-opacity-50 backdrop-blur-sm p-4";
    document.body.appendChild(modal);
  }

  const doctors = state.doctors || [];
  const surgeonsList = doctors.filter(d => d.spec === "General Surgery" || d.spec === "Orthopedics" || d.spec === "Gynecology & Obs" || d.spec === "Cardiology") || [];
  const anaesthetistsList = doctors.filter(d => d.spec === "Emergency Medicine" || d.spec === "Neurology" || d.spec === "Cardiology") || [];
  const theatresList = state.ot?.theatres || [];

  modal.innerHTML = `
    <div class="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg p-6 font-sans antialiased text-slate-800 text-xs space-y-4 text-left">
      <div class="flex items-center justify-between border-b pb-2">
        <h3 class="text-sm font-bold text-slate-900">✏️ Edit Clinical OT Booking Request</h3>
        <button class="text-slate-400 font-bold hover:text-slate-600" onclick="window.closeEditOTRequestModal()">✕</button>
      </div>

      <form id="ot-edit-booking-form" class="space-y-4 text-xs" onsubmit="event.preventDefault(); window.saveEditedOTRequest('${caseId}');">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          <div class="md:col-span-2">
            <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Indications / Diagnosis</label>
            <input type="text" id="edit-ot-diag" class="w-full border rounded p-2 bg-white" value="${c.diagnosis || ''}" required>
          </div>

          <div>
            <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Select OT Theatre Room</label>
            <select id="edit-ot-room" class="w-full border rounded p-2 bg-white">
              ${theatresList.map(t => `<option value="${t.code}" ${t.code === c.theatre ? 'selected' : ''}>${t.name} (${t.speciality})</option>`).join('')}
            </select>
          </div>

          <div>
            <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Primary Surgeon</label>
            <select id="edit-ot-surgeon" class="w-full border rounded p-2 bg-white">
              ${surgeonsList.map(s => `<option value="${s.name}" ${s.name === c.surgeon ? 'selected' : ''}>${s.name} (${s.spec})</option>`).join('')}
            </select>
          </div>

          <div>
            <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Preferred Anaesthetist</label>
            <select id="edit-ot-anaesthetist" class="w-full border rounded p-2 bg-white">
              ${anaesthetistsList.map(a => `<option value="${a.name}" ${a.name === c.anaesthetist ? 'selected' : ''}>${a.name} (${a.spec})</option>`).join('')}
            </select>
          </div>

          <div>
            <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Preferred Slot Date</label>
            <input type="date" id="edit-ot-date" class="w-full border rounded p-2 bg-white font-mono" value="${c.date || ''}" required>
          </div>

          <div>
            <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Preferred Slot Time (HH:MM)</label>
            <input type="text" id="edit-ot-time" class="w-full border rounded p-2 bg-white font-mono" value="${c.time || ''}" required>
          </div>

          <div>
            <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Estimated Duration (Hrs)</label>
            <input type="text" id="edit-ot-duration" class="w-full border rounded p-2 bg-white font-mono" value="${c.duration || ''}" required>
          </div>

          <div>
            <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Priority</label>
            <select id="edit-ot-priority" class="w-full border rounded p-2 bg-white">
              <option value="Elective" ${c.priority === 'Elective' ? 'selected' : ''}>Elective</option>
              <option value="Urgent" ${c.priority === 'Urgent' ? 'selected' : ''}>Urgent</option>
              <option value="Emergency" ${c.priority === 'Emergency' ? 'selected' : ''}>Emergency</option>
            </select>
          </div>

          <div>
            <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Blood Units Standby Required?</label>
            <select id="edit-ot-blood" class="w-full border rounded p-2 bg-white">
              <option value="No" ${c.bloodReq === 'No' ? 'selected' : ''}>No</option>
              <option value="Yes" ${c.bloodReq === 'Yes' ? 'selected' : ''}>Yes (2 Units PRBC Standby)</option>
            </select>
          </div>

        </div>

        <div class="flex justify-end gap-2 border-t pt-3 mt-4">
          <button type="button" class="btn btn-secondary px-4 py-2" onclick="window.closeEditOTRequestModal()">Cancel</button>
          <button type="submit" class="btn btn-primary px-4 py-2 bg-[#1B3A5C] text-white hover:bg-slate-800">Save Request Edits</button>
        </div>
      </form>
    </div>
  `;
};

window.closeEditOTRequestModal = function() {
  const modal = document.getElementById('ot-edit-booking-modal-overlay');
  if (modal) modal.remove();
};

window.saveEditedOTRequest = function(caseId) {
  const c = state.ot?.scheduledCases?.find(cs => cs.id === caseId);
  if (!c) return alert("OT case request not found.");

  const diag = document.getElementById('edit-ot-diag').value;
  const otRoom = document.getElementById('edit-ot-room').value;
  const surgeon = document.getElementById('edit-ot-surgeon').value;
  const anaes = document.getElementById('edit-ot-anaesthetist').value;
  const slotDate = document.getElementById('edit-ot-date').value;
  const slotTime = document.getElementById('edit-ot-time').value;
  const duration = document.getElementById('edit-ot-duration').value;
  const priority = document.getElementById('edit-ot-priority').value;
  const bloodReq = document.getElementById('edit-ot-blood').value;

  // Credential check
  const doc = state.doctors?.find(d => d.name === surgeon);
  let isCredentialed = true;
  if (doc) {
    if (c.procedure.toLowerCase().includes("cholecystectomy") && doc.spec !== "General Surgery") {
      isCredentialed = false;
    } else if ((c.procedure.toLowerCase().includes("knee") || c.procedure.toLowerCase().includes("arthroplasty")) && doc.spec !== "Orthopedics") {
      isCredentialed = false;
    } else if (c.procedure.toLowerCase().includes("caesarean") && doc.spec !== "Gynecology & Obs") {
      isCredentialed = false;
    }
  }

  if (!isCredentialed) {
    const confirmOverride = confirm(`⚠️ CREDENTIALING PRIVILEGE ALERT:\n${surgeon} is not credentialed to perform ${c.procedure} (Specialty: ${doc ? doc.spec : 'Unknown'}).\n\nDo you want to request a HOD Clinical Privilege Override?`);
    if (!confirmOverride) return;
  }

  // Specialty check
  const selectedTheatre = state.ot?.theatres?.find(t => t.code === otRoom);
  let specialityMatches = true;
  if (selectedTheatre) {
    const tSpec = selectedTheatre.speciality.toLowerCase();
    const pName = c.procedure.toLowerCase();
    if (tSpec === "orthopaedics" && !(pName.includes("knee") || pName.includes("arthroplasty") || pName.includes("fracture"))) {
      specialityMatches = false;
    } else if (tSpec === "obg" && !pName.includes("caesarean") && !pName.includes("lscs") && !pName.includes("hysterectomy")) {
      specialityMatches = false;
    } else if (tSpec === "general surgery" && (pName.includes("caesarean") || pName.includes("knee"))) {
      specialityMatches = false;
    }
  }

  if (!specialityMatches && selectedTheatre) {
    const confirmRoomOverride = confirm(`⚠️ THEATRE SPECIALITY MISMATCH:\nYou are scheduling ${c.procedure} in ${selectedTheatre.name} (Speciality: ${selectedTheatre.speciality}).\n\nAre you sure you want to request this cross-theatre booking?`);
    if (!confirmRoomOverride) return;
  }

  // Update OT case
  c.diagnosis = diag;
  c.theatre = otRoom;
  c.surgeon = surgeon;
  c.anaesthetist = anaes;
  c.date = slotDate;
  c.time = slotTime;
  c.duration = duration;
  c.priority = priority;
  c.bloodReq = bloodReq;
  c.bloodUnits = bloodReq === "Yes" ? "2 Units PRBC" : "N/A";
  c.bloodStatus = bloodReq === "Yes" ? "Standby" : "N/A";

  // Check if priority changed to Emergency
  if (priority === "Emergency") {
    c.status = "Intra-Op";
  }

  // Find corresponding order and update it
  const orderObj = state.orders.find(o => o.otCaseId === caseId) || state.orders.find(o => o.uhid === c.patientUhid && o.name === c.procedure && o.type === "Procedure");
  if (orderObj) {
    orderObj.priority = priority;
  }

  // Add audit trail log
  state.ot.auditTrail = state.ot.auditTrail || [];
  state.ot.auditTrail.push({
    timestamp: new Date().toISOString().replace('T', ' ').substring(0, 23) + " IST",
    user: window.state.activeUser || "Dr. Primary",
    role: "IPD Doctor",
    action: "OT Request Edited",
    target: caseId,
    remarks: `Edited request for ${c.patientName}. New slot: ${slotDate} at ${slotTime} in ${otRoom}.`
  });

  // Re-generate timeline event or add a timeline event about the edit
  const patient = state.patients?.find(p => p.uhid === c.patientUhid);
  if (patient) {
    patient.timelineEvents = patient.timelineEvents || [];
    patient.timelineEvents.unshift({
      date: new Date().toISOString().replace('T', ' ').substring(0, 16).replace('-', '/').replace('-', '/'),
      type: 'clinical',
      icon: '📝',
      title: 'Procedure OT Booking Edited',
      desc: `Edited details: ${c.procedure} slot updated to ${slotDate} ${slotTime} in room ${otRoom} with surgeon ${surgeon}.`
    });

    // Re-render the patient profile
    const container = document.getElementById('main-content');
    const activeTabElement = document.querySelector('.ptab.on');
    let activeTab = 'overview';
    if (activeTabElement) {
      const tabText = activeTabElement.innerText.toLowerCase();
      if (tabText.includes('overview') || tabText.includes('timeline')) {
        activeTab = 'overview';
      } else if (tabText.includes('vitals')) {
        activeTab = 'vitals';
      } else if (tabText.includes('clinical')) {
        activeTab = 'clinical';
      } else if (tabText.includes('order')) {
        activeTab = 'orders';
      } else if (tabText.includes('report')) {
        activeTab = 'reports';
      } else if (tabText.includes('medication')) {
        activeTab = 'medications';
      } else if (tabText.includes('admission')) {
        activeTab = 'admission';
      } else if (tabText.includes('referral')) {
        activeTab = 'referrals';
      } else if (tabText.includes('billing')) {
        activeTab = 'billing';
      } else if (tabText.includes('document')) {
        activeTab = 'documents';
      }
    }
    renderPatient360Profile(container, patient, activeTab);
  }

  alert("OT booking request updated successfully!");
  window.closeEditOTRequestModal();
};

window.viewOTRequestDetails = function(caseId) {
  const c = state.ot?.scheduledCases?.find(cs => cs.id === caseId);
  if (!c) return alert("OT case request not found.");

  let modal = document.getElementById('ot-view-booking-modal-overlay');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'ot-view-booking-modal-overlay';
    modal.className = "fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900 bg-opacity-50 backdrop-blur-sm p-4";
    document.body.appendChild(modal);
  }

  const caseAudits = state.ot?.auditTrail?.filter(a => a.target === caseId) || [];

  modal.innerHTML = `
    <div class="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg p-6 font-sans antialiased text-slate-800 text-xs space-y-4 text-left">
      <div class="flex items-center justify-between border-b pb-2">
        <div>
          <h3 class="text-sm font-bold text-slate-900">👁️ Clinical OT Booking Details</h3>
          <span class="text-[10px] font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-600 mt-1 inline-block">${c.id}</span>
        </div>
        <button class="text-slate-400 font-bold hover:text-slate-600" onclick="window.closeViewOTRequestModal()">✕</button>
      </div>

      <div class="space-y-4">
        <!-- Status Banner -->
        <div class="p-3 rounded-lg flex items-center justify-between ${c.status === 'Requested' ? 'bg-amber-50 border border-amber-200 text-amber-800' : 'bg-emerald-50 border border-emerald-200 text-emerald-800'}">
          <span class="font-bold uppercase text-[10px]">Status: ${c.status}</span>
          <span class="font-bold text-[10px] uppercase bg-white px-2 py-0.5 rounded shadow-sm border">${c.priority} Priority</span>
        </div>

        <div class="grid grid-cols-2 gap-3 border-b pb-3">
          <div>
            <span class="block text-[10px] text-slate-400 uppercase font-bold">Planned Procedure</span>
            <span class="text-xs font-bold text-slate-800">${c.procedure}</span>
          </div>
          <div>
            <span class="block text-[10px] text-slate-400 uppercase font-bold">Indications / Diagnosis</span>
            <span class="text-xs text-slate-600">${c.diagnosis || 'N/A'}</span>
          </div>
        </div>

        <div class="grid grid-cols-2 md:grid-cols-3 gap-3 border-b pb-3">
          <div>
            <span class="block text-[10px] text-slate-400 uppercase font-bold">OT Theatre Room</span>
            <span class="text-xs font-semibold text-slate-800">${c.theatre}</span>
          </div>
          <div>
            <span class="block text-[10px] text-slate-400 uppercase font-bold">Date & Time</span>
            <span class="text-xs font-semibold text-slate-800 font-mono">${c.date} at ${c.time}</span>
          </div>
          <div>
            <span class="block text-[10px] text-slate-400 uppercase font-bold">Estimated Duration</span>
            <span class="text-xs font-semibold text-slate-800 font-mono">${c.duration} hrs</span>
          </div>
        </div>

        <div class="grid grid-cols-2 md:grid-cols-3 gap-3 border-b pb-3">
          <div>
            <span class="block text-[10px] text-slate-400 uppercase font-bold">Primary Surgeon</span>
            <span class="text-xs font-semibold text-slate-800">${c.surgeon}</span>
          </div>
          <div>
            <span class="block text-[10px] text-slate-400 uppercase font-bold">Preferred Anaesthetist</span>
            <span class="text-xs font-semibold text-slate-800">${c.anaesthetist}</span>
          </div>
          <div>
            <span class="block text-[10px] text-slate-400 uppercase font-bold">Blood Standby</span>
            <span class="text-xs font-semibold text-slate-800">${c.bloodReq === 'Yes' ? 'Yes (2 Units PRBC)' : 'No'}</span>
          </div>
        </div>

        <!-- Roster / Assigned Team (Rendered if Scheduled or later) -->
        ${c.status !== 'Requested' ? `
          <div class="bg-slate-50 p-3 rounded-lg border border-slate-200">
            <h4 class="font-bold text-slate-700 mb-2">🧑‍⚕️ Assigned Care & Scrub Team</h4>
            <div class="grid grid-cols-3 gap-2 text-[10px]">
              <div><strong>Scrub Nurse:</strong> <span class="text-slate-600">${c.scrubNurse || 'Sister Jessy'}</span></div>
              <div><strong>Circulating Nurse:</strong> <span class="text-slate-600">${c.circulatingNurse || 'Brother Jose'}</span></div>
              <div><strong>Technician:</strong> <span class="text-slate-600">${c.technician || 'Ramesh Lal'}</span></div>
            </div>
          </div>
        ` : ''}

        <!-- Audit Trail section -->
        <div>
          <h4 class="font-bold text-slate-700 mb-2">📋 Case Audit Log</h4>
          <div class="max-h-[100px] overflow-y-auto border rounded divide-y bg-slate-50 font-mono text-[9px] text-slate-600">
            ${caseAudits.length === 0 ? `
              <div class="p-2 text-slate-400 italic">No audit records for this case.</div>
            ` : caseAudits.map(a => `
              <div class="p-1.5 hover:bg-slate-100">
                <span class="text-slate-400">[${a.timestamp}]</span> <strong>${a.user} (${a.role})</strong>: ${a.action} - <span class="text-slate-700 font-sans">${a.remarks}</span>
              </div>
            `).join('')}
          </div>
        </div>

      </div>

      <div class="flex justify-end border-t pt-3 mt-4">
        <button type="button" class="btn btn-secondary px-4 py-2" onclick="window.closeViewOTRequestModal()">Close Details</button>
      </div>
    </div>
  `;
};

window.closeViewOTRequestModal = function() {
  const modal = document.getElementById('ot-view-booking-modal-overlay');
  if (modal) modal.remove();
};
