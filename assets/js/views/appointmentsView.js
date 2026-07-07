/* ==========================================================================
   SARONIL HMS - OPD APPOINTMENTS & SCHEDULING (appointmentsView.js)
   ========================================================================== */

window.views.appointments = function(container, subAnchor, params) {
  const systemToday = window._HIS_TODAY || new Date().toISOString().slice(0, 10); // Dynamic real-world date
  
  // Seed more variety in appointments if only basic ones exist
  if (state.appointments.length > 0 && !state.appointments.some(a => a.status === 'Completed')) {
    const statuses = ['Completed', 'Cancelled', 'No Show', 'Waiting', 'In Consultation', 'Rescheduled', 'Arrived'];
    const types = ['Consultation', 'Procedure', 'Follow-up Consultation', 'Teleconsultation'];
    
    state.patients.slice(0, 15).forEach((p, idx) => {
      const doc = state.doctors[idx % state.doctors.length];
      const status = statuses[idx % statuses.length];
      const type = types[idx % types.length];
      const id = "APT" + String(1200 + idx);
      
      // Ensure we don't duplicate
      if (!state.appointments.some(a => a.uhid === p.uhid && a.date === systemToday)) {
        state.appointments.push({
          id: id,
          uhid: p.uhid,
          patientName: p.name,
          doctorName: doc.name,
          spec: doc.spec,
          date: systemToday,
          time: `10:${String(15 + idx * 4).padStart(2, '0')} AM`,
          status: status,
          type: type,
          createdBy: "Sarah Jones"
        });
      }
    });
  }

  // Ensure all existing appointments have a status compatible with our workflow
  state.appointments.forEach(appt => {
    if (appt.status === 'Confirmed') appt.status = 'Booked';
    if (appt.status === 'Checked In') appt.status = 'Arrived';
    if (!appt.createdBy) appt.createdBy = "Sarah Jones";
  });

  // State of Active Filters
  const activeFilters = {
    dateMode: 'today', // today, tomorrow, week, custom, range
    startDate: systemToday,
    endDate: systemToday,
    doctor: 'All',
    department: 'All',
    type: 'All',
    status: 'All',
    patientUhid: params.uhid || ''
  };

  // Set initial pagination state
  window.apptCurrentPage = 1;

  // If a patient UHID was passed, load their details in the search filter
  let patientSearchText = '';
  if (activeFilters.patientUhid) {
    const patientObj = state.patients.find(p => p.uhid === activeFilters.patientUhid);
    if (patientObj) {
      patientSearchText = `${patientObj.name} (${patientObj.uhid})`;
    }
  }

    // Main UI Shell - Matched EXACTLY to Patient Registration landing page design system
  container.innerHTML = `
    <style>
      .reg-container {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }
      .stats-grid {
        display: grid;
        grid-template-columns: repeat(7, 1fr);
        gap: 0.75rem;
      }
      @media (max-width: 1400px) {
        .stats-grid { grid-template-columns: repeat(4, 1fr); }
      }
      @media (max-width: 900px) {
        .stats-grid { grid-template-columns: repeat(3, 1fr); }
      }
      @media (max-width: 600px) {
        .stats-grid { grid-template-columns: repeat(2, 1fr); }
      }
      @media (max-width: 400px) {
        .stats-grid { grid-template-columns: repeat(1, 1fr); }
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
        min-height: 140px;
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

      /* Card styling */
      .card {
        background: #fff;
        border: 1px solid #e2e8f0;
        border-radius: 12px;
        overflow: hidden;
        margin-bottom: 1rem;
        box-shadow: var(--shadow-sm);
      }
      .card-hdr {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 1.25rem 1.5rem;
        border-bottom: 1px solid #f1f5f9;
        background: #ffffff;
      }
      .card-title {
        font-size: 1.1rem;
        font-weight: 600;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        color: var(--text-primary);
      }
      .card-subtitle {
        font-size: 0.8rem;
        color: var(--text-muted);
        margin-top: 0.15rem;
      }

      /* Custom Table classes matching Registration landing page */
      .custom-table-container {
        overflow-x: auto;
        border-radius: var(--radius-sm);
        border: 1px solid var(--border-color);
      }
      .custom-table {
        width: 100%;
        border-collapse: collapse;
        text-align: left;
      }
      .custom-table th {
        padding: 0.85rem 1rem;
        font-size: 0.75rem;
        font-weight: 700;
        color: var(--text-secondary);
        background-color: var(--bg-surface-elevated);
        border-bottom: 1px solid var(--border-color);
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }
      .custom-table td {
        padding: 1rem;
        border-bottom: 1px solid var(--border-color);
        font-size: 0.85rem;
        color: var(--text-primary);
      }
      .custom-table tbody tr:hover td {
        background: rgba(248, 250, 252, 0.7);
      }
      .mono {
        font-family: 'JetBrains Mono', monospace;
      }

      /* Badges matching global style */
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
    </style>

    <div class="reg-container">
      
      <!-- TOP: HEADER CARD (Matched EXACTLY to Patient Registration Header) -->
      <div style="display: flex; justify-content: space-between; align-items: center; background: var(--bg-surface); padding: 1.25rem 1.5rem; border-radius: var(--radius-md); border: 1px solid var(--border-color); flex-wrap: wrap; gap: 1rem;">
        <div>
          <h3 style="margin: 0; font-size: 1.4rem; font-weight: 800; color: var(--text-primary); display: flex; align-items: center; gap: 0.5rem;">
            <span>📅</span> OPD Appointment Management
          </h3>
          <p style="margin: 0.25rem 0 0 0; font-size: 0.8rem; color: var(--text-muted);">
            High-Volume OPD Scheduling & Reception Queue Console
          </p>
        </div>
        
        <div>
          <button id="btn-book-appointment" class="btn btn-primary" style="font-weight: 700; padding: 0.6rem 1.25rem; font-size: 0.9rem; display: flex; align-items: center; gap: 0.5rem; box-shadow: var(--shadow-sm);">
            <span>➕</span> Book New Appointment
          </button>
        </div>
      </div>

      <!-- MIDDLE: WORKSPACE KPI CARDS (Matched EXACTLY to Patient Registration KPI cards) -->
      <div class="stats-grid" id="reg-kpi-cards">
        
        <!-- Card 1: Total Booked -->
        <div class="kpi-card status-normal" onclick="window.filterAppointmentsByCard('All')">
          <div class="kpi-header">
            <span class="kpi-title">Total Booked</span>
            <span class="kpi-icon" style="background-color: var(--primary-glow); color: var(--primary);">📅</span>
          </div>
          <div class="kpi-body">
            <span class="kpi-value" id="kpi-total">0</span>
            <span class="kpi-subtext">Active filtered appts</span>
          </div>
        </div>

        <!-- Card 2: Today's Appts -->
        <div class="kpi-card status-normal" onclick="window.filterAppointmentsByCard('AllToday')">
          <div class="kpi-header">
            <span class="kpi-title">Today's Appts</span>
            <span class="kpi-icon" style="background-color: #f3e8ff; color: #a855f7;">🕒</span>
          </div>
          <div class="kpi-body">
            <span class="kpi-value" id="kpi-today">0</span>
            <span class="kpi-subtext">On system today</span>
          </div>
        </div>

        <!-- Card 3: Checked-In -->
        <div class="kpi-card status-normal" onclick="window.filterAppointmentsByCard('Arrived')">
          <div class="kpi-header">
            <span class="kpi-title">Checked-In</span>
            <span class="kpi-icon" style="background-color: #e6fffa; color: #14b8a6;">🎯</span>
          </div>
          <div class="kpi-body">
            <span class="kpi-value" id="kpi-checked-in">0</span>
            <span class="kpi-subtext">Arrived patients</span>
          </div>
        </div>

        <!-- Card 4: Waiting -->
        <div class="kpi-card status-warning" onclick="window.filterAppointmentsByCard('Waiting')">
          <div class="kpi-header">
            <span class="kpi-title">Waiting</span>
            <span class="kpi-icon" style="background-color: #fffbeb; color: #d97706;">⏳</span>
          </div>
          <div class="kpi-body">
            <span class="kpi-value" id="kpi-waiting">0</span>
            <span class="kpi-subtext">Awaiting consult</span>
          </div>
        </div>

        <!-- Card 5: Completed -->
        <div class="kpi-card status-normal" onclick="window.filterAppointmentsByCard('Completed')">
          <div class="kpi-header">
            <span class="kpi-title">Completed</span>
            <span class="kpi-icon" style="background-color: #ecfdf5; color: #10b981;">✅</span>
          </div>
          <div class="kpi-body">
            <span class="kpi-value" id="kpi-completed">0</span>
            <span class="kpi-subtext">Consultations done</span>
          </div>
        </div>

        <!-- Card 6: Cancelled -->
        <div class="kpi-card status-critical" onclick="window.filterAppointmentsByCard('Cancelled')">
          <div class="kpi-header">
            <span class="kpi-title">Cancelled</span>
            <span class="kpi-icon" style="background-color: #fef2f2; color: #ef4444;">🚫</span>
          </div>
          <div class="kpi-body">
            <span class="kpi-value" id="kpi-cancelled">0</span>
            <span class="kpi-subtext">Cancelled bookings</span>
          </div>
        </div>

        <!-- Card 7: No Shows -->
        <div class="kpi-card status-critical" onclick="window.filterAppointmentsByCard('No Show')">
          <div class="kpi-header">
            <span class="kpi-title">No Shows</span>
            <span class="kpi-icon" style="background-color: #f5f5f4; color: #78716c;">👤</span>
          </div>
          <div class="kpi-body">
            <span class="kpi-value" id="kpi-no-shows">0</span>
            <span class="kpi-subtext">Absent records</span>
          </div>
        </div>

      </div>

      <!-- BOTTOM: APPOINTMENT REGISTRY CARD -->
      <div class="card">
        <div class="card-hdr">
          <div>
            <h3 class="card-title">OPD Appointment Registry</h3>
            <p class="card-subtitle">Search, filter, and review active hospital appointment schedules</p>
          </div>
          <div style="font-size: 0.8rem; color: var(--text-muted);">
            <span id="appt-results-count" style="font-weight: 500;">0 results</span>
          </div>
        </div>
        
        <div class="card-body" style="padding: 1.5rem;">
          
          <!-- Search & Filter Controls (Horizontal Layout) -->
          <div style="display: flex; gap: 0.75rem; margin-bottom: 1.5rem; flex-wrap: wrap; align-items: center; width: 100%;">
            <!-- Global Patient Search -->
            <div style="position: relative; flex-grow: 1; min-width: 250px;">
              <span style="position: absolute; left: 12px; top: 50%; transform: translateY(-50%); font-size: 0.82rem; color: var(--text-muted);">🔍</span>
              <input type="text" id="global-patient-search" class="form-control" 
                placeholder="Search appointments by Patient Name, UHID, or Mobile Number..." 
                style="padding-left: 2.2rem; font-size: 0.82rem; height: 38px; border-radius: 6px;"
                value="${patientSearchText}" autocomplete="off">
              <button id="clear-search-btn" class="absolute right-3.5 top-2.5 text-slate-400 hover:text-slate-600 text-lg focus:outline-none ${patientSearchText ? '' : 'hidden'}">&times;</button>
              <!-- Autosuggest Dropdown -->
              <div id="global-search-autocomplete" 
                class="absolute z-50 left-0 right-0 mt-1 bg-white border border-slate-200 rounded-md shadow-lg max-h-60 overflow-y-auto hidden"></div>
            </div>

            <!-- Date Filter mode -->
            <select id="filter-date-mode" class="form-select" style="width: auto; height: 38px; font-size: 0.82rem; min-width: 110px; border-radius: 6px; cursor: pointer;">
              <option value="today">Today</option>
              <option value="tomorrow">Tomorrow</option>
              <option value="week">This Week</option>
              <option value="custom">Custom Date</option>
              <option value="range">Date Range</option>
            </select>
            <input type="date" id="filter-start-date" class="form-control hidden" style="width: auto; height: 38px; font-size: 0.82rem; border-radius: 6px;" value="${systemToday}">
            <span id="filter-date-separator" class="text-xs text-slate-400 hidden">to</span>
            <input type="date" id="filter-end-date" class="form-control hidden" style="width: auto; height: 38px; font-size: 0.82rem; border-radius: 6px;" value="${systemToday}">

            <!-- Department / Specialty -->
            <select id="filter-department" class="form-select" style="width: auto; height: 38px; font-size: 0.82rem; min-width: 140px; border-radius: 6px; cursor: pointer;">
              <option value="All">All Departments</option>
              <option value="General Medicine">General Medicine</option>
              <option value="Pediatrics">Pediatrics</option>
              <option value="Orthopedics">Orthopedics</option>
              <option value="Gynecology & Obs">Gynecology</option>
              <option value="Cardiology">Cardiology</option>
            </select>

            <!-- Doctor Selector -->
            <select id="filter-doctor" class="form-select" style="width: auto; height: 38px; font-size: 0.82rem; min-width: 140px; border-radius: 6px; cursor: pointer;">
              <option value="All">All Doctors</option>
            </select>

            <!-- Visit Type Selector -->
            <select id="filter-type" class="form-select" style="width: auto; height: 38px; font-size: 0.82rem; min-width: 110px; border-radius: 6px; cursor: pointer;">
              <option value="All">All Types</option>
              <option value="Consultation">Consultation</option>
              <option value="Procedure">Procedure</option>
              <option value="Follow-up Consultation">Follow-up</option>
              <option value="Teleconsultation">Teleconsultation</option>
            </select>

            <!-- Status Selector (now visible dropdown filter, matching Registration landing filter dropdowns) -->
            <select id="filter-status" class="form-select" style="width: auto; height: 38px; font-size: 0.82rem; min-width: 120px; border-radius: 6px; cursor: pointer;">
              <option value="All">All Statuses</option>
              <option value="Booked">Booked</option>
              <option value="Arrived">Arrived</option>
              <option value="Waiting">Waiting</option>
              <option value="In Consultation">In Consultation</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
              <option value="No Show">No Show</option>
              <option value="Rescheduled">Rescheduled</option>
            </select>

            <button id="btn-clear-filters" class="btn btn-secondary" style="height: 38px; font-size: 0.82rem; padding: 0 1rem; border-radius: 6px; font-weight: 600; display: flex; align-items: center; gap: 0.25rem;">
              🔄 Reset
            </button>
          </div>

          <!-- Master Data Table -->
          <div class="custom-table-container">
            <table class="custom-table" id="appointments-table">
              <thead>
                <tr>
                  <th style="padding: 0.85rem 1rem;">Patient Info</th>
                  <th style="padding: 0.85rem 1rem;">Date & Time</th>
                  <th style="padding: 0.85rem 1rem;">Doctor</th>
                  <th style="padding: 0.85rem 1rem;">Department</th>
                  <th style="padding: 0.85rem 1rem;">Type</th>
                  <th style="padding: 0.85rem 1rem;">Status</th>
                  <th style="padding: 0.85rem 1rem; text-align: right;">Actions</th>
                </tr>
              </thead>
              <tbody id="table-body">
                <!-- Dynamic Rows -->
              </tbody>
            </table>
            
            <!-- Empty State Container -->
            <div id="table-empty-state" class="hidden py-16 px-4 flex flex-col items-center justify-center text-center">
              <span class="text-4xl mb-3">📅</span>
              <h4 class="text-sm font-semibold text-slate-800" id="empty-state-title">No appointments found</h4>
              <p class="text-xs text-slate-500 mt-1 max-w-sm">No scheduled slots match the active search query or selected filter criteria.</p>
              <div class="flex items-center gap-3 mt-6">
                <button id="btn-empty-clear" class="btn btn-secondary">Clear Filters</button>
                <button id="btn-empty-book" class="btn btn-primary">Book New Appointment</button>
              </div>
            </div>
          </div>

          <!-- Pagination Footer Controls -->
          <div id="appt-pagination" style="display: flex; justify-content: space-between; align-items: center; margin-top: 1rem; padding-top: 1rem; border-top: 1px solid var(--border-color); flex-wrap: wrap; gap: 0.5rem;">
            <!-- Rendered dynamically -->
          </div>
        </div>
      </div>

    </div>

    <!-- MODAL OVERLAY WRAPPER -->
    <div id="appt-modal-container" class="fixed inset-0 z-50 flex items-center justify-center hidden">
      <div class="fixed inset-0 bg-slate-900 bg-opacity-40 backdrop-blur-xs transition-opacity" id="appt-modal-backdrop"></div>
      <div class="bg-white rounded-xl shadow-2xl overflow-hidden max-w-lg w-full z-50 transform scale-95 transition-all duration-200 flex flex-col max-h-[90vh]" id="appt-modal-content">
        <!-- Rendered dynamically -->
      </div>
    </div>
  `;

  // Bind DOM elements
  const kpiTotalEl = document.getElementById('kpi-total');
  const kpiTodayEl = document.getElementById('kpi-today');
  const kpiCheckedInEl = document.getElementById('kpi-checked-in');
  const kpiWaitingEl = document.getElementById('kpi-waiting');
  const kpiCompletedEl = document.getElementById('kpi-completed');
  const kpiCancelledEl = document.getElementById('kpi-cancelled');
  const kpiNoShowsEl = document.getElementById('kpi-no-shows');

  const globalSearchInput = document.getElementById('global-patient-search');
  const clearSearchBtn = document.getElementById('clear-search-btn');
  const globalAutocomplete = document.getElementById('global-search-autocomplete');

  const filterDateMode = document.getElementById('filter-date-mode');
  const filterStartDate = document.getElementById('filter-start-date');
  const filterEndDate = document.getElementById('filter-end-date');
  const filterDateSeparator = document.getElementById('filter-date-separator');

  const filterDepartment = document.getElementById('filter-department');
  const filterDoctor = document.getElementById('filter-doctor');
  const filterType = document.getElementById('filter-type');
  const filterStatus = document.getElementById('filter-status');

  const btnClearFilters = document.getElementById('btn-clear-filters');
  const btnBookAppointment = document.getElementById('btn-book-appointment');

  const tableBody = document.getElementById('table-body');
  const tableEmptyState = document.getElementById('table-empty-state');
  const appointmentsTable = document.getElementById('appointments-table');
  const btnEmptyClear = document.getElementById('btn-empty-clear');
  const btnEmptyBook = document.getElementById('btn-empty-book');

  const modalContainer = document.getElementById('appt-modal-container');
  const modalBackdrop = document.getElementById('appt-modal-backdrop');
  const modalContent = document.getElementById('appt-modal-content');

  // Populate dynamic doctor filter list based on department selection
  const populateDoctorFilter = () => {
    const selectedDept = filterDepartment.value;
    let filteredDocs = state.doctors;
    if (selectedDept !== 'All') {
      filteredDocs = state.doctors.filter(d => d.spec === selectedDept);
    }
    
    filterDoctor.innerHTML = '<option value="All">All Doctors</option>' + 
      filteredDocs.map(d => `<option value="${d.name}">${d.name}</option>`).join('');
    
    // Maintain filter consistency
    if (activeFilters.doctor !== 'All' && !filteredDocs.some(d => d.name === activeFilters.doctor)) {
      activeFilters.doctor = 'All';
    }
    filterDoctor.value = activeFilters.doctor;
  };

  // Helper: compute dates relative to systemToday (current date)
  const getRelativeDateString = (daysOffset) => {
    const baseDate = new Date(systemToday);
    baseDate.setDate(baseDate.getDate() + daysOffset);
    
    const year = baseDate.getFullYear();
    const month = String(baseDate.getMonth() + 1).padStart(2, '0');
    const day = String(baseDate.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Helper: check if a date is within the systemToday week (Monday-Sunday)
  const isDateInCurrentWeek = (dateStr) => {
    const d = new Date(dateStr);
    const todayDate = new Date(systemToday);
    
    // Find monday of the current week
    const day = todayDate.getDay();
    const diff = todayDate.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
    const monday = new Date(todayDate.setDate(diff));
    monday.setHours(0,0,0,0);
    
    const sunday = new Date(monday);
    sunday.setDate(sunday.getDate() + 6);
    sunday.setHours(23,59,59,999);
    
    return d >= monday && d <= sunday;
  };

  // Render pagination controls under the appointment list table matching Patient 360 styling
  const renderApptPaginationControls = (totalItems, startIndex, endIndex, totalPages) => {
    const pagContainer = document.getElementById('appt-pagination');
    if (!pagContainer) return;
    
    if (totalItems === 0) {
      pagContainer.innerHTML = '';
      return;
    }

    const currentPage = window.apptCurrentPage || 1;
    let pageButtonsHTML = '';

    // Prev button
    const prevDisabled = currentPage === 1 ? 'disabled' : '';
    const prevStyle = currentPage === 1 ? 'cursor: not-allowed; opacity: 0.5;' : 'cursor: pointer;';
    pageButtonsHTML += `
      <button class="btn-g" style="padding: 0.25rem 0.6rem; font-size: 0.75rem; border-radius: 6px; ${prevStyle}" ${prevDisabled} onclick="window.setApptPage(${currentPage - 1})">
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
        <button class="btn-g" style="padding: 0.25rem 0.6rem; font-size: 0.75rem; border-radius: 6px;" onclick="window.setApptPage(1)">1</button>
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
        <button class="btn-g" style="padding: 0.25rem 0.6rem; font-size: 0.75rem; border-radius: 6px; ${activeStyle}" ${isActive ? 'disabled' : ''} onclick="window.setApptPage(${p})">${p}</button>
      `;
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pageButtonsHTML += `<span style="color: var(--text-muted); font-size: 0.8rem; padding: 0 0.25rem;">...</span>`;
      }
      pageButtonsHTML += `
        <button class="btn-g" style="padding: 0.25rem 0.6rem; font-size: 0.75rem; border-radius: 6px;" onclick="window.setApptPage(${totalPages})">${totalPages}</button>
      `;
    }

    // Next button
    const nextDisabled = currentPage === totalPages ? 'disabled' : '';
    const nextStyle = currentPage === totalPages ? 'cursor: not-allowed; opacity: 0.5;' : 'cursor: pointer;';
    pageButtonsHTML += `
      <button class="btn-g" style="padding: 0.25rem 0.6rem; font-size: 0.75rem; border-radius: 6px; ${nextStyle}" ${nextDisabled} onclick="window.setApptPage(${currentPage + 1})">
        Next &rarr;
      </button>
    `;

    pagContainer.innerHTML = `
      <div style="font-size: 0.8rem; color: var(--text-muted);">Showing <span class="font-semibold text-slate-800">${startIndex + 1}</span> to <span class="font-semibold text-slate-800">${endIndex}</span> of <span class="font-semibold text-slate-800">${totalItems}</span> appointments</div>
      <div style="display: flex; gap: 0.25rem; align-items: center;">${pageButtonsHTML}</div>
    `;
  };

  // Handle page switching helper
  window.setApptPage = (pageNo) => {
    window.apptCurrentPage = pageNo;
    renderViewData();
  };

  // Main compute and render function
  const renderViewData = () => {
    // 1. Compute filters
    const query = globalSearchInput.value.toLowerCase().trim();
    
    // Filter appointments
    let appointmentsList = state.appointments;

    // Filter by date range
    if (activeFilters.dateMode === 'today') {
      appointmentsList = appointmentsList.filter(a => a.date === systemToday);
    } else if (activeFilters.dateMode === 'tomorrow') {
      const tomorrowStr = getRelativeDateString(1);
      appointmentsList = appointmentsList.filter(a => a.date === tomorrowStr);
    } else if (activeFilters.dateMode === 'week') {
      appointmentsList = appointmentsList.filter(a => isDateInCurrentWeek(a.date));
    } else if (activeFilters.dateMode === 'custom') {
      appointmentsList = appointmentsList.filter(a => a.date === activeFilters.startDate);
    } else if (activeFilters.dateMode === 'range') {
      const start = new Date(activeFilters.startDate);
      const end = new Date(activeFilters.endDate);
      appointmentsList = appointmentsList.filter(a => {
        const ad = new Date(a.date);
        return ad >= start && ad <= end;
      });
    }

    // Filter by department
    if (activeFilters.department !== 'All') {
      appointmentsList = appointmentsList.filter(a => a.spec === activeFilters.department);
    }

    // Filter by doctor
    if (activeFilters.doctor !== 'All') {
      appointmentsList = appointmentsList.filter(a => a.doctorName === activeFilters.doctor);
    }

    // Filter by type
    if (activeFilters.type !== 'All') {
      // Map follow-up / Procedure names
      appointmentsList = appointmentsList.filter(a => {
        if (activeFilters.type === 'Follow-up Consultation') {
          return a.type.toLowerCase().includes('follow');
        }
        return a.type === activeFilters.type;
      });
    }

    // Filter by status
    if (activeFilters.status !== 'All') {
      appointmentsList = appointmentsList.filter(a => a.status === activeFilters.status);
    }

    // Filter by Global Patient Search (Name, Mobile, or UHID)
    if (activeFilters.patientUhid) {
      appointmentsList = appointmentsList.filter(a => a.uhid === activeFilters.patientUhid);
    } else if (query) {
      appointmentsList = appointmentsList.filter(a => {
        const patientMobile = state.patients.find(p => p.uhid === a.uhid)?.mobile || '';
        return a.patientName.toLowerCase().includes(query) ||
               a.uhid.toLowerCase().includes(query) ||
               patientMobile.includes(query);
      });
    }

    // 2. Calculate dynamic KPI counters for the selected date context
    // KPIs are calculated based on the *selected date range* (independent of status, doctor, type filters)
    let kpiAppts = state.appointments;
    if (activeFilters.dateMode === 'today') {
      kpiAppts = kpiAppts.filter(a => a.date === systemToday);
    } else if (activeFilters.dateMode === 'tomorrow') {
      kpiAppts = kpiAppts.filter(a => a.date === getRelativeDateString(1));
    } else if (activeFilters.dateMode === 'week') {
      kpiAppts = kpiAppts.filter(a => isDateInCurrentWeek(a.date));
    } else if (activeFilters.dateMode === 'custom') {
      kpiAppts = kpiAppts.filter(a => a.date === activeFilters.startDate);
    } else if (activeFilters.dateMode === 'range') {
      const start = new Date(activeFilters.startDate);
      const end = new Date(activeFilters.endDate);
      kpiAppts = kpiAppts.filter(a => {
        const ad = new Date(a.date);
        return ad >= start && ad <= end;
      });
    }

    const todayCount = state.appointments.filter(a => a.date === systemToday).length;
    kpiTotalEl.textContent = kpiAppts.length;
    kpiTodayEl.textContent = todayCount;
    kpiCheckedInEl.textContent = kpiAppts.filter(a => a.status === 'Arrived' || a.status === 'Checked In').length;
    kpiWaitingEl.textContent = kpiAppts.filter(a => a.status === 'Waiting').length;
    kpiCompletedEl.textContent = kpiAppts.filter(a => a.status === 'Completed').length;
    kpiCancelledEl.textContent = kpiAppts.filter(a => a.status === 'Cancelled').length;
    kpiNoShowsEl.textContent = kpiAppts.filter(a => a.status === 'No Show').length;

    // 3. Paginate data to 15 appointments per page
    const totalItems = appointmentsList.length;
    const rowsPerPage = 15;
    const totalPages = Math.ceil(totalItems / rowsPerPage) || 1;

    if (window.apptCurrentPage > totalPages) {
      window.apptCurrentPage = totalPages;
    }
    if (window.apptCurrentPage < 1) {
      window.apptCurrentPage = 1;
    }

    const startIndex = (window.apptCurrentPage - 1) * rowsPerPage;
    const endIndex = Math.min(startIndex + rowsPerPage, totalItems);

    // Update results label in card header
    const resultsCountEl = document.getElementById('appt-results-count');
    if (resultsCountEl) {
      resultsCountEl.textContent = `${totalItems} results`;
    }

    // 4. Render Table
    if (appointmentsList.length === 0) {
      tableBody.innerHTML = '';
      appointmentsTable.classList.add('hidden');
      tableEmptyState.classList.remove('hidden');
      renderApptPaginationControls(0, 0, 0, 1);
    } else {
      tableEmptyState.classList.add('hidden');
      appointmentsTable.classList.remove('hidden');

      // Sort appointments: time slot order
      const parseTime = (t) => {
        const [time, modifier] = t.split(' ');
        let [hours, minutes] = time.split(':');
        hours = parseInt(hours, 10);
        minutes = parseInt(minutes, 10);
        if (modifier === 'PM' && hours < 12) hours += 12;
        if (modifier === 'AM' && hours === 12) hours = 0;
        return hours * 60 + minutes;
      };

      // Sort: most recent date first, then latest time within same day (recent-first)
      appointmentsList.sort((a, b) => {
        if (a.date !== b.date) {
          return new Date(b.date) - new Date(a.date); // newest date first
        }
        return parseTime(b.time) - parseTime(a.time); // latest time first within same day
      });

      // Slice the list for the current page
      const pageData = appointmentsList.slice(startIndex, endIndex);

      tableBody.innerHTML = pageData.map(appt => {
        const patientMobile = state.patients.find(p => p.uhid === appt.uhid)?.mobile || appt.mobile || 'N/A';
        
        // Match status badges to Patient 360 page colors
        let badgeClass = 'b-sl';
        if (appt.status === 'Booked') {
          badgeClass = 'b-bl'; // Blue
        } else if (appt.status === 'Arrived') {
          badgeClass = 'b-gr'; // Green
        } else if (appt.status === 'Waiting') {
          badgeClass = 'b-am'; // Amber
        } else if (appt.status === 'In Consultation') {
          badgeClass = 'b-pu'; // Purple
        } else if (appt.status === 'Completed') {
          badgeClass = 'b-sl'; // Slate
        } else if (appt.status === 'Cancelled') {
          badgeClass = 'b-re'; // Red
        } else if (appt.status === 'No Show') {
          badgeClass = 'b-sl'; // Slate / Gray
        } else if (appt.status === 'Rescheduled') {
          badgeClass = 'b-cy'; // Cyan
        }

        // Format dates
        const dateFormatted = new Date(appt.date).toLocaleDateString('en-IN', {
          day: '2-digit', month: 'short', year: 'numeric'
        });

        // Determine actions allowed for status
        const isClosed = ['Completed', 'Cancelled', 'No Show'].includes(appt.status);
        const canArrive = !isClosed && appt.status !== 'Arrived' && appt.status !== 'Waiting' && appt.status !== 'In Consultation';

        return `
          <tr class="hover:bg-slate-50 transition">
            <td class="py-2.5 px-3">
              <div class="font-bold text-slate-900"><a href="#patients?uhid=${appt.uhid}" class="hover:underline text-blue-600">${appt.patientName}</a></div>
              <div class="text-[10px] text-slate-500 flex flex-col gap-0.5" style="margin-top: 2px;">
                <span class="mono">UHID: ${appt.uhid}</span>
                <span class="mono">Mob: ${patientMobile}</span>
              </div>
            </td>
            <td class="py-2.5 px-3 font-medium text-slate-800">
              <div style="font-weight: 600;">${dateFormatted}</div>
              <div style="font-size: 11px; color: var(--text-secondary, #64748b);" class="mono">${appt.time}</div>
            </td>
            <td class="py-2.5 px-3 font-medium text-slate-800">${appt.doctorName}</td>
            <td class="py-2.5 px-3 text-xs text-slate-600">${appt.spec}</td>
            <td class="py-2.5 px-3 text-xs text-slate-700 font-medium">
              ${appt.type}
            </td>
            <td class="py-2.5 px-3">
              <span class="badge ${badgeClass}">${appt.status}</span>
            </td>
            <td class="py-2.5 px-3 text-right">
              <div class="relative inline-block text-left">
                <button class="text-slate-500 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 font-medium text-[11px] px-2.5 py-1.5 rounded transition inline-flex items-center gap-1"
                  onclick="window.toggleRowActionDropdown(event, '${appt.id}')">
                  Actions ▾
                </button>
                <div id="dropdown-${appt.id}" class="row-dropdown absolute right-0 mt-1 w-44 bg-white border border-slate-200 rounded-md shadow-lg z-50 hidden py-1 text-left">
                  <button class="w-full text-left px-4 py-2 text-xs hover:bg-slate-50 text-slate-700 flex items-center gap-2" onclick="window.viewApptDetails('${appt.id}')">
                    <span>👁️</span> View Details
                  </button>
                  ${!isClosed ? `
                    <button class="w-full text-left px-4 py-2 text-xs hover:bg-slate-50 text-slate-700 flex items-center gap-2" onclick="window.openRescheduleModal('${appt.id}')">
                      <span>📅</span> Reschedule / Edit
                    </button>
                  ` : ''}
                  ${canArrive ? `
                    <button class="w-full text-left px-4 py-2 text-xs hover:bg-slate-50 text-slate-700 flex items-center gap-2" onclick="window.markPatientArrived('${appt.id}')">
                      <span>🎯</span> Mark Arrived
                    </button>
                  ` : ''}
                  ${appt.status !== 'Cancelled' ? `
                    <button class="w-full text-left px-4 py-2 text-xs hover:bg-slate-50 text-slate-700 flex items-center gap-2" onclick="window.printAppointmentSlip('${appt.id}')">
                      <span>📄</span> Print Slip
                    </button>
                  ` : ''}
                  ${!isClosed ? `
                    <div class="border-t border-slate-100 my-1"></div>
                    <button class="w-full text-left px-4 py-2 text-xs hover:bg-rose-50 text-rose-600 flex items-center gap-2 font-medium" onclick="window.openCancelModal('${appt.id}')">
                      <span>🚫</span> Cancel Booking
                    </button>
                  ` : ''}
                </div>
              </div>
            </td>
          </tr>
        `;
      }).join('');

      renderApptPaginationControls(totalItems, startIndex, endIndex, totalPages);
    }
  };

  // Toggle Dropdown logic for Row Actions
  window.toggleRowActionDropdown = (event, apptId) => {
    event.stopPropagation();
    
    // Close other open dropdowns
    document.querySelectorAll('.row-dropdown').forEach(el => {
      if (el.id !== `dropdown-${apptId}`) el.classList.add('hidden');
    });

    const el = document.getElementById(`dropdown-${apptId}`);
    if (el) el.classList.toggle('hidden');
  };

  // Close dropdowns on body click
  document.body.addEventListener('click', () => {
    document.querySelectorAll('.row-dropdown').forEach(el => el.classList.add('hidden'));
  });

  // Autocomplete patient search mapping
  const setupGlobalPatientSearch = () => {
    globalSearchInput.addEventListener('input', () => {
      const val = globalSearchInput.value.trim().toLowerCase();
      if (!val) {
        globalAutocomplete.classList.add('hidden');
        clearSearchBtn.classList.add('hidden');
        activeFilters.patientUhid = '';
        window.apptCurrentPage = 1; // Reset to page 1
        renderViewData();
        return;
      }
      
      clearSearchBtn.classList.remove('hidden');

      const matches = state.patients.filter(p => 
        p.name.toLowerCase().includes(val) || 
        p.uhid.toLowerCase().includes(val) || 
        p.mobile.includes(val)
      );

      if (matches.length === 0) {
        globalAutocomplete.innerHTML = `<div class="px-4 py-3 text-xs text-slate-400 italic">No matching patients found</div>`;
        globalAutocomplete.classList.remove('hidden');
        return;
      }

      globalAutocomplete.innerHTML = `
        <div class="px-3 py-1.5 text-[10px] font-bold text-slate-400 bg-slate-50 uppercase tracking-wider border-b border-slate-100">Suggested Patients (${matches.length})</div>
        <div class="divide-y divide-slate-100">
          ${matches.map(p => `
            <div class="px-4 py-2 hover:bg-slate-50 cursor-pointer transition text-xs flex flex-col gap-0.5" onclick="window.selectGlobalSearchPatient('${p.uhid}', '${p.name}')">
              <div class="flex items-center justify-between font-semibold text-slate-800">
                <span>${p.name}</span>
                <span class="text-[10px] text-blue-600 bg-blue-50 border border-blue-100 px-1.5 py-0.2 rounded font-mono">${p.uhid}</span>
              </div>
              <div class="text-[10px] text-slate-500 font-mono">📱 ${p.mobile} | Age: ${p.age} | ${p.gender}</div>
            </div>
          `).join('')}
        </div>
      `;
      globalAutocomplete.classList.remove('hidden');
    });

    window.selectGlobalSearchPatient = (uhid, name) => {
      globalSearchInput.value = `${name} (${uhid})`;
      activeFilters.patientUhid = uhid;
      window.apptCurrentPage = 1; // Reset page
      globalAutocomplete.classList.add('hidden');
      renderViewData();
    };

    clearSearchBtn.addEventListener('click', () => {
      globalSearchInput.value = '';
      clearSearchBtn.classList.add('hidden');
      globalAutocomplete.classList.add('hidden');
      activeFilters.patientUhid = '';
      window.apptCurrentPage = 1; // Reset page
      renderViewData();
    });
  };

  // Bind core layouts and trigger filters on change
  const bindFilters = () => {
    // 1. Date Mode Selector toggles custom inputs
    filterDateMode.addEventListener('change', () => {
      const mode = filterDateMode.value;
      activeFilters.dateMode = mode;
      window.apptCurrentPage = 1; // Reset page
      
      if (mode === 'custom') {
        filterStartDate.classList.remove('hidden');
        filterEndDate.classList.add('hidden');
        filterDateSeparator.classList.add('hidden');
        activeFilters.startDate = filterStartDate.value;
      } else if (mode === 'range') {
        filterStartDate.classList.remove('hidden');
        filterEndDate.classList.remove('hidden');
        filterDateSeparator.classList.remove('hidden');
        activeFilters.startDate = filterStartDate.value;
        activeFilters.endDate = filterEndDate.value;
      } else {
        filterStartDate.classList.add('hidden');
        filterEndDate.classList.add('hidden');
        filterDateSeparator.classList.add('hidden');
      }
      renderViewData();
    });

    filterStartDate.addEventListener('change', () => {
      activeFilters.startDate = filterStartDate.value;
      window.apptCurrentPage = 1; // Reset page
      renderViewData();
    });

    filterEndDate.addEventListener('change', () => {
      activeFilters.endDate = filterEndDate.value;
      window.apptCurrentPage = 1; // Reset page
      renderViewData();
    });

    // 2. Specialty Cascade
    filterDepartment.addEventListener('change', () => {
      activeFilters.department = filterDepartment.value;
      window.apptCurrentPage = 1; // Reset page
      populateDoctorFilter();
      renderViewData();
    });

    // 3. Doctor Selector
    filterDoctor.addEventListener('change', () => {
      activeFilters.doctor = filterDoctor.value;
      window.apptCurrentPage = 1; // Reset page
      renderViewData();
    });

    // 4. Appointment Type Selector
    filterType.addEventListener('change', () => {
      activeFilters.type = filterType.value;
      window.apptCurrentPage = 1; // Reset page
      renderViewData();
    });

    // 5. Status Selector
    filterStatus.addEventListener('change', () => {
      activeFilters.status = filterStatus.value;
      window.apptCurrentPage = 1; // Reset page
      renderViewData();
    });

    // 6. Reset Filters Button
    const resetAllFilters = () => {
      filterDateMode.value = 'today';
      activeFilters.dateMode = 'today';
      activeFilters.startDate = systemToday;
      activeFilters.endDate = systemToday;
      filterStartDate.value = systemToday;
      filterEndDate.value = systemToday;

      filterStartDate.classList.add('hidden');
      filterEndDate.classList.add('hidden');
      filterDateSeparator.classList.add('hidden');

      filterDepartment.value = 'All';
      activeFilters.department = 'All';
      
      populateDoctorFilter();
      
      filterDoctor.value = 'All';
      activeFilters.doctor = 'All';

      filterType.value = 'All';
      activeFilters.type = 'All';

      filterStatus.value = 'All';
      activeFilters.status = 'All';



      globalSearchInput.value = '';
      clearSearchBtn.classList.add('hidden');
      globalAutocomplete.classList.add('hidden');
      activeFilters.patientUhid = '';
      
      window.apptCurrentPage = 1; // Reset page

      renderViewData();
    };

    btnClearFilters.addEventListener('click', resetAllFilters);
    btnEmptyClear.addEventListener('click', resetAllFilters);
  };

  // Modals management helpers
  const showModal = (contentHTML) => {
    modalContent.innerHTML = contentHTML;
    modalContainer.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    modalContainer.classList.add('hidden');
    document.body.style.overflow = '';
    renderViewData(); // Refresh the table automatically
  };
  window.closeModal = closeModal;

  modalBackdrop.addEventListener('click', closeModal);

  // Dynamic booking cascading in modal form
  window.onModalDeptChange = (deptVal) => {
    const docSelect = document.getElementById('modal-doctor');
    if (!docSelect) return;
    
    const docs = state.doctors.filter(d => d.spec === deptVal);
    docSelect.innerHTML = docs.map(d => `<option value="${d.name}">${d.name}</option>`).join('');
  };

  // Conflict checkers helper
  const checkAppointmentConflict = (doctorName, dateVal, timeVal, apptIdToIgnore = '') => {
    return state.appointments.some(a => 
      a.doctorName === doctorName && 
      a.date === dateVal && 
      a.time === timeVal &&
      a.status !== 'Cancelled' &&
      a.id !== apptIdToIgnore
    );
  };

  // Autocomplete bindings for patient lookups inside booking modal
  window.setupModalPatientAutocomplete = () => {
    const input = document.getElementById('modal-pat-search');
    const list = document.getElementById('modal-pat-autocomplete');
    const selectUhid = document.getElementById('modal-pat-uhid');
    const profileCard = document.getElementById('modal-pat-profile-card');
    
    if (!input || !list || !selectUhid || !profileCard) return;

    input.addEventListener('input', () => {
      const val = input.value.trim().toLowerCase();
      if (!val) {
        list.classList.add('hidden');
        selectUhid.value = '';
        profileCard.classList.add('hidden');
        return;
      }

      const matches = state.patients.filter(p => 
        p.name.toLowerCase().includes(val) || 
        p.uhid.toLowerCase().includes(val) || 
        p.mobile.includes(val)
      );

      if (matches.length === 0) {
        list.innerHTML = `<div class="px-4 py-2.5 text-xs text-slate-400 italic">No patients found. Fill details below for quick registration.</div>`;
        list.classList.remove('hidden');
        selectUhid.value = '';
        profileCard.classList.add('hidden');
        return;
      }

      list.innerHTML = matches.map(p => `
        <div class="px-4 py-2 hover:bg-slate-50 cursor-pointer text-xs transition flex flex-col gap-0.5 border-b border-slate-50"
          onclick="window.selectModalPatient('${p.uhid}', '${p.name}', '${p.mobile}', '${p.age}', '${p.gender}')">
          <div class="flex items-center justify-between font-semibold text-slate-800">
            <span>${p.name}</span>
            <span class="text-[10px] text-blue-600 bg-blue-50 border border-blue-100 px-1 rounded font-mono">${p.uhid}</span>
          </div>
          <div class="text-[10px] text-slate-500">📱 ${p.mobile} | Age: ${p.age} | ${p.gender}</div>
        </div>
      `).join('');
      list.classList.remove('hidden');
    });

    window.selectModalPatient = (uhid, name, mobile, age, gender) => {
      input.value = `${name} (${uhid})`;
      selectUhid.value = uhid;
      list.classList.add('hidden');

      // Populate Quick Profile Preview Card
      document.getElementById('m-preview-name').textContent = name;
      document.getElementById('m-preview-uhid').textContent = uhid;
      document.getElementById('m-preview-details').textContent = `📱 ${mobile} | ${age} yrs | ${gender}`;
      profileCard.classList.remove('hidden');

      // Hide custom quick registration form if open
      const regSection = document.getElementById('quick-registration-section');
      if (regSection) regSection.classList.add('hidden');
    };
  };

  // Toggle quick patient registration section in modal
  window.toggleQuickRegForm = () => {
    const section = document.getElementById('quick-registration-section');
    const selectUhid = document.getElementById('modal-pat-uhid');
    const profileCard = document.getElementById('modal-pat-profile-card');
    const input = document.getElementById('modal-pat-search');

    if (!section) return;

    if (section.classList.contains('hidden')) {
      section.classList.remove('hidden');
      selectUhid.value = 'NEW';
      profileCard.classList.add('hidden');
      input.value = 'Creating New Patient record...';
      input.disabled = true;
    } else {
      section.classList.add('hidden');
      selectUhid.value = '';
      input.value = '';
      input.disabled = false;
    }
  };

  // ACTION 1: BOOK NEW APPOINTMENT MODAL
  const openBookingModal = () => {
    // If a patient search is active, prefill details of that patient
    let initialSearchUhid = activeFilters.patientUhid || '';
    let prefillHTML = '';
    let prefillSearchVal = '';
    
    if (initialSearchUhid) {
      const patient = state.patients.find(p => p.uhid === initialSearchUhid);
      if (patient) {
        prefillSearchVal = `${patient.name} (${patient.uhid})`;
        prefillHTML = `
          <div id="modal-pat-profile-card" class="bg-blue-50 border border-blue-100 rounded-lg p-3 text-xs mb-3">
            <div class="flex justify-between items-center font-bold text-slate-800">
              <span id="m-preview-name">${patient.name}</span>
              <span id="m-preview-uhid" class="font-mono text-blue-600 bg-blue-100 px-1.5 py-0.2 rounded">${patient.uhid}</span>
            </div>
            <p id="m-preview-details" class="text-slate-600 mt-1">📱 ${patient.mobile} | ${patient.age} yrs | ${patient.gender}</p>
          </div>
        `;
      }
    }

    const modalHTML = `
      <!-- Modal Header -->
      <div class="px-5 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
        <h3 class="text-base font-bold text-slate-800">OPD Appointment Booking</h3>
        <button onclick="closeModal()" class="text-slate-400 hover:text-slate-600 text-xl font-bold">&times;</button>
      </div>

      <!-- Modal Body -->
      <div class="px-5 py-4 overflow-y-auto flex-1 text-sm space-y-4">
        <!-- Patient Selector -->
        <div>
          <div class="flex items-center justify-between mb-1">
            <label class="card-title-mono mb-1">Patient Search</label>
            <button onclick="window.toggleQuickRegForm()" class="text-xs text-blue-600 hover:text-blue-800 font-semibold focus:outline-none">
              🆕 Quick Register Patient
            </button>
          </div>
          <div class="relative">
            <input type="text" id="modal-pat-search" class="w-full px-3 py-2 border border-slate-300 rounded-md text-xs" 
              placeholder="Search existing patient by Name, Mobile, or UHID..." value="${prefillSearchVal}" ${initialSearchUhid ? 'disabled' : ''}>
            <input type="hidden" id="modal-pat-uhid" value="${initialSearchUhid || ''}">
            <div id="modal-pat-autocomplete" class="absolute z-50 left-0 right-0 bg-white border border-slate-200 rounded-md shadow-lg max-h-48 overflow-y-auto hidden"></div>
          </div>
        </div>

        <!-- Dynamic Profile Preview Card -->
        <div id="modal-pat-profile-card" class="bg-blue-50 border border-blue-100 rounded-lg p-3 text-xs mb-3 ${initialSearchUhid ? '' : 'hidden'}">
          ${prefillHTML || `
            <div class="flex justify-between items-center font-bold text-slate-800">
              <span id="m-preview-name"></span>
              <span id="m-preview-uhid" class="font-mono text-blue-600 bg-blue-100 px-1.5 py-0.2 rounded"></span>
            </div>
            <p id="m-preview-details" class="text-slate-600 mt-1"></p>
          `}
        </div>

        <!-- Quick Registration Form (Hidden by default) -->
        <div id="quick-registration-section" class="hidden bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-3">
          <div class="flex items-center justify-between border-b border-slate-200 pb-1">
            <h5 class="text-xs font-bold text-slate-700">Quick Registration</h5>
            <button onclick="window.toggleQuickRegForm()" class="text-xs text-rose-600 font-semibold">&times; Cancel</button>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-[10px] font-bold text-slate-500 uppercase">Patient Name *</label>
              <input type="text" id="reg-name" class="w-full px-2 py-1 border border-slate-300 rounded text-xs">
            </div>
            <div>
              <label class="block text-[10px] font-bold text-slate-500 uppercase">Mobile Number *</label>
              <input type="text" id="reg-mobile" class="w-full px-2 py-1 border border-slate-300 rounded text-xs" placeholder="e.g. 9845011022">
            </div>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-[10px] font-bold text-slate-500 uppercase">Age (Years) *</label>
              <input type="number" id="reg-age" class="w-full px-2 py-1 border border-slate-300 rounded text-xs">
            </div>
            <div>
              <label class="block text-[10px] font-bold text-slate-500 uppercase">Gender *</label>
              <select id="reg-gender" class="w-full px-2 py-1 border border-slate-300 rounded text-xs bg-white">
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Department / Specialty & Doctor -->
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block card-title-mono mb-1">Specialty/Dept</label>
            <select id="modal-dept" class="w-full px-3 py-2 border border-slate-300 rounded-md text-xs bg-white" onchange="window.onModalDeptChange(this.value)">
              <option value="General Medicine">General Medicine</option>
              <option value="Pediatrics">Pediatrics</option>
              <option value="Orthopedics">Orthopedics</option>
              <option value="Gynecology & Obs">Gynecology</option>
              <option value="Cardiology">Cardiology</option>
            </select>
          </div>
          <div>
            <label class="block card-title-mono mb-1">Practitioner/Doctor</label>
            <select id="modal-doctor" class="w-full px-3 py-2 border border-slate-300 rounded-md text-xs bg-white">
              <!-- Populated dynamically -->
            </select>
          </div>
        </div>

        <!-- Date & Time Slot Selector -->
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block card-title-mono mb-1">Appointment Date</label>
            <input type="date" id="modal-date" class="w-full px-3 py-2 border border-slate-300 rounded-md text-xs" value="${systemToday}">
          </div>
          <div>
            <label class="block card-title-mono mb-1">OPD Time Slot</label>
            <select id="modal-time" class="w-full px-3 py-2 border border-slate-300 rounded-md text-xs bg-white">
              <option value="09:00 AM">09:00 AM</option>
              <option value="09:30 AM">09:30 AM</option>
              <option value="10:00 AM">10:00 AM</option>
              <option value="10:30 AM">10:30 AM</option>
              <option value="11:00 AM">11:00 AM</option>
              <option value="11:30 AM">11:30 AM</option>
              <option value="12:00 PM">12:00 PM</option>
              <option value="02:00 PM">02:00 PM</option>
              <option value="02:30 PM">02:30 PM</option>
              <option value="03:00 PM">03:00 PM</option>
              <option value="03:30 PM">03:30 PM</option>
              <option value="04:00 PM">04:00 PM</option>
            </select>
          </div>
        </div>

        <!-- Visit Type & Notes -->
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block card-title-mono mb-1">Appointment Type</label>
            <select id="modal-type" class="w-full px-3 py-2 border border-slate-300 rounded-md text-xs bg-white">
              <option value="Consultation">OPD Consultation</option>
              <option value="Procedure">Procedure</option>
              <option value="Follow-up Consultation">Clinical Follow-up</option>
              <option value="Teleconsultation">Teleconsultation</option>
            </select>
          </div>
          <div>
            <label class="block card-title-mono mb-1">Created By</label>
            <input type="text" id="modal-created-by" class="w-full px-3 py-2 border border-slate-300 rounded-md text-xs bg-slate-50 text-slate-500" value="Sarah Jones" disabled>
          </div>
        </div>
        
        <div>
          <label class="block card-title-mono mb-1">Clinical Remarks / Notes</label>
          <textarea id="modal-remarks" class="w-full px-3 py-2 border border-slate-300 rounded-md text-xs h-16 resize-none" placeholder="Enter clinical reason or scheduling notes..."></textarea>
        </div>

        <!-- Conflict warning banner -->
        <div id="modal-conflict-banner" class="hidden bg-rose-50 border border-rose-200 text-rose-700 px-3 py-2.5 rounded-lg text-xs font-medium">
          ⚠️ Schedule Conflict: Selected Doctor already has a booking at this time. Double check slot grid.
        </div>
      </div>

      <!-- Modal Footer -->
      <div class="px-5 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3">
        <button onclick="closeModal()" class="btn-g" style="padding: 5px 12px; font-size: 11px;">Cancel</button>
        <button id="modal-submit-btn" class="btn-p">Confirm Booking</button>
      </div>
    `;

    showModal(modalHTML);
    window.onModalDeptChange(document.getElementById('modal-dept').value);
    window.setupModalPatientAutocomplete();

    // Trigger conflict checking dynamically on slot change
    const checkConflicts = () => {
      const docVal = document.getElementById('modal-doctor').value;
      const dateVal = document.getElementById('modal-date').value;
      const timeVal = document.getElementById('modal-time').value;
      const banner = document.getElementById('modal-conflict-banner');
      
      if (checkAppointmentConflict(docVal, dateVal, timeVal)) {
        banner.classList.remove('hidden');
      } else {
        banner.classList.add('hidden');
      }
    };

    document.getElementById('modal-doctor').addEventListener('change', checkConflicts);
    document.getElementById('modal-date').addEventListener('change', checkConflicts);
    document.getElementById('modal-time').addEventListener('change', checkConflicts);

    // Bind form submit
    document.getElementById('modal-submit-btn').addEventListener('click', () => {
      const targetUhidVal = document.getElementById('modal-pat-uhid').value;
      const deptVal = document.getElementById('modal-dept').value;
      const docVal = document.getElementById('modal-doctor').value;
      const dateVal = document.getElementById('modal-date').value;
      const timeVal = document.getElementById('modal-time').value;
      const typeVal = document.getElementById('modal-type').value;
      const remarks = document.getElementById('modal-remarks').value;

      let finalPatient = null;

      // Handle Quick Registration or existing selection
      if (targetUhidVal === 'NEW') {
        const name = document.getElementById('reg-name').value.trim();
        const mobile = document.getElementById('reg-mobile').value.trim();
        const age = document.getElementById('reg-age').value.trim();
        const gender = document.getElementById('reg-gender').value;

        if (!name || !mobile || !age) {
          alert("All quick registration fields marked with * are required.");
          return;
        }

        // Generate UHID
        const newUhid = "UHID" + String(20000000 + state.patients.length + 1);
        finalPatient = {
          uhid: newUhid,
          name: name,
          mobile: mobile,
          age: parseInt(age, 10),
          gender: gender,
          status: "Registered"
        };
        state.patients.push(finalPatient);
      } else {
        finalPatient = state.patients.find(p => p.uhid === targetUhidVal);
      }

      if (!finalPatient) {
        alert("Please search and select a patient, or use the quick register form.");
        return;
      }

      // Final Conflict block check
      if (checkAppointmentConflict(docVal, dateVal, timeVal)) {
        alert(`Conflict: ${docVal} already has an appointment booked on ${dateVal} at ${timeVal}. Please choose another time.`);
        return;
      }

      // Add appointment in Pending Payment status
      const invId = 'INV-APT-' + String(4000 + state.billing.length);
      const newAppt = {
        id: "APT" + String(1000 + state.appointments.length + 1),
        uhid: finalPatient.uhid,
        patientName: finalPatient.name,
        doctorName: docVal,
        spec: deptVal,
        date: dateVal,
        time: timeVal,
        status: "Pending Payment",
        type: typeVal,
        createdBy: "Sarah Jones",
        remarks: remarks,
        invoiceId: invId
      };
      state.appointments.push(newAppt);

      // Create a pending bill of ₹500 in state.billing
      state.billing = state.billing || [];
      state.billing.push({
        id: invId,
        uhid: finalPatient.uhid,
        patientName: finalPatient.name,
        amount: 500,
        paid: 0,
        status: 'Pending',
        visitType: 'OPD',
        date: dateVal,
        paymentCategory: 'Self Pay',
        items: [
          { desc: `OPD Consultation Fee - ${docVal}`, qty: 1, rate: 500, total: 500 }
        ],
        auditLogs: [{ timestamp: new Date().toISOString(), user: "Front Desk", action: `Generated pending appointment invoice ${invId}` }]
      });
      localStorage.setItem('saronil_billing', JSON.stringify(state.billing));

      // Log to patient engagement timeline
      if (window.logPatientTimeline) {
        window.logPatientTimeline(finalPatient.uhid, {
          type: 'appointment',
          icon: '📅',
          title: 'OPD Appointment Created (Pending Payment)',
          desc: `Appointment ${newAppt.id} with ${docVal} (${deptVal}) on ${dateVal} at ${timeVal} is pending payment. Invoice: ${invId}.`
        });
      }

      alert(`✓ OPD appointment ${newAppt.id} successfully created!\n\nPending payment invoice ${invId} of ₹500 generated. Patient must make payment at the billing counter to confirm booking and join the queue.`);

      closeModal();

    });
  };

  btnBookAppointment.addEventListener('click', openBookingModal);
  btnEmptyBook.addEventListener('click', openBookingModal);

  // ACTION 2: VIEW APPOINTMENT DETAILS
  window.viewApptDetails = (apptId) => {
    const appt = state.appointments.find(a => a.id === apptId);
    if (!appt) return;

    const patient = state.patients.find(p => p.uhid === appt.uhid) || {};
    const patientAgeGen = patient.age ? `${patient.age} yrs / ${patient.gender}` : 'N/A';
    const patientMobile = patient.mobile || appt.mobile || 'N/A';

    const modalHTML = `
      <div class="px-5 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
        <h3 class="text-base font-bold text-slate-800">OPD Ticket - ${appt.id}</h3>
        <button onclick="closeModal()" class="text-slate-400 hover:text-slate-600 text-xl font-bold">&times;</button>
      </div>

      <div class="px-5 py-5 overflow-y-auto flex-1 space-y-4">
        <!-- Patient block -->
        <div class="border border-slate-200 rounded-lg p-3.5 bg-slate-50 space-y-2">
          <h5 class="card-title-mono">Patient Information</h5>
          <div class="grid grid-cols-2 gap-2 text-xs">
            <p><strong class="text-slate-600">Full Name:</strong> <span class="text-slate-900 font-semibold">${appt.patientName}</span></p>
            <p><strong class="text-slate-600">UHID / MRN:</strong> <span class="text-blue-600 font-semibold font-mono">${appt.uhid}</span></p>
            <p><strong class="text-slate-600">Age & Gender:</strong> <span class="text-slate-900">${patientAgeGen}</span></p>
            <p><strong class="text-slate-600">Contact:</strong> <span class="text-slate-900 font-mono">${patientMobile}</span></p>
          </div>
        </div>

        <!-- Appointment block -->
        <div class="grid grid-cols-2 gap-4 text-xs">
          <div class="border border-slate-200 rounded-lg p-3 space-y-1">
            <h5 class="card-title-mono mb-2">Visit Schedule</h5>
            <p><strong class="text-slate-600">Date:</strong> <span class="text-slate-900 font-semibold">${appt.date}</span></p>
            <p><strong class="text-slate-600">Time:</strong> <span class="text-slate-900 font-mono font-semibold">${appt.time}</span></p>
            <p><strong class="text-slate-600">Type:</strong> <span class="text-slate-900">${appt.type}</span></p>
          </div>
          <div class="border border-slate-200 rounded-lg p-3 space-y-1">
            <h5 class="card-title-mono mb-2">Clinician Info</h5>
            <p><strong class="text-slate-600">Doctor:</strong> <span class="text-slate-900 font-semibold">${appt.doctorName}</span></p>
            <p><strong class="text-slate-600">Department:</strong> <span class="text-slate-900">${appt.spec}</span></p>
            <p><strong class="text-slate-600">OPD Clinic Room:</strong> <span class="text-slate-900 font-semibold">Room 105</span></p>
          </div>
        </div>

        <!-- Booking details -->
        <div class="border border-slate-200 rounded-lg p-3 space-y-1 text-xs">
          <h5 class="card-title-mono mb-2">Audit Logs</h5>
          <p><strong class="text-slate-600">Status:</strong> <span class="text-slate-900 font-bold uppercase">${appt.status}</span></p>
          <p><strong class="text-slate-600">Created By:</strong> <span class="text-slate-900">${appt.createdBy || 'Sarah Jones'}</span></p>
          <p><strong class="text-slate-600">Remarks:</strong> <span class="text-slate-700 italic">${appt.remarks || 'No notes logged.'}</span></p>
        </div>
      </div>

      <div class="px-5 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3">
        ${appt.status !== 'Cancelled' ? `<button onclick="closeModal(); window.printAppointmentSlip('${appt.id}')" class="btn-g"><span>📄</span> Print Slip</button>` : ''}
        <button onclick="closeModal()" class="btn-p">Close</button>
      </div>
    `;

    showModal(modalHTML);
  };

  // ACTION 3: RESCHEDULE / EDIT MODAL
  window.openRescheduleModal = (apptId) => {
    const appt = state.appointments.find(a => a.id === apptId);
    if (!appt) return;

    const modalHTML = `
      <div class="px-5 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
        <h3 class="text-base font-bold text-slate-800">Reschedule Ticket - ${appt.id}</h3>
        <button onclick="closeModal()" class="text-slate-400 hover:text-slate-600 text-xl font-bold">&times;</button>
      </div>

      <div class="px-5 py-4 overflow-y-auto flex-1 text-sm space-y-4">
        <!-- Patient preview block -->
        <div class="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs flex justify-between items-center">
          <div>
            <p class="font-bold text-slate-800">${appt.patientName}</p>
            <p class="text-slate-500 font-mono">${appt.uhid}</p>
          </div>
          <span class="badge b-sl">${appt.type}</span>
        </div>

        <!-- Department / Specialty & Doctor -->
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block card-title-mono mb-1">Specialty/Dept</label>
            <select id="modal-dept" class="w-full px-3 py-2 border border-slate-300 rounded-md text-xs bg-white" onchange="window.onModalDeptChange(this.value)">
              <option value="General Medicine" ${appt.spec === 'General Medicine' ? 'selected' : ''}>General Medicine</option>
              <option value="Pediatrics" ${appt.spec === 'Pediatrics' ? 'selected' : ''}>Pediatrics</option>
              <option value="Orthopedics" ${appt.spec === 'Orthopedics' ? 'selected' : ''}>Orthopedics</option>
              <option value="Gynecology & Obs" ${appt.spec === 'Gynecology & Obs' ? 'selected' : ''}>Gynecology</option>
              <option value="Cardiology" ${appt.spec === 'Cardiology' ? 'selected' : ''}>Cardiology</option>
            </select>
          </div>
          <div>
            <label class="block card-title-mono mb-1">Practitioner/Doctor</label>
            <select id="modal-doctor" class="w-full px-3 py-2 border border-slate-300 rounded-md text-xs bg-white">
              <!-- Populated dynamically -->
            </select>
          </div>
        </div>

        <!-- Date & Time Slot Selector -->
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block card-title-mono mb-1">Reschedule Date</label>
            <input type="date" id="modal-date" class="w-full px-3 py-2 border border-slate-300 rounded-md text-xs" value="${appt.date}">
          </div>
          <div>
            <label class="block card-title-mono mb-1">OPD Time Slot</label>
            <select id="modal-time" class="w-full px-3 py-2 border border-slate-300 rounded-md text-xs bg-white">
              <option value="09:00 AM" ${appt.time === '09:00 AM' ? 'selected' : ''}>09:00 AM</option>
              <option value="09:30 AM" ${appt.time === '09:30 AM' ? 'selected' : ''}>09:30 AM</option>
              <option value="10:00 AM" ${appt.time === '10:00 AM' ? 'selected' : ''}>10:00 AM</option>
              <option value="10:30 AM" ${appt.time === '10:30 AM' ? 'selected' : ''}>10:30 AM</option>
              <option value="11:00 AM" ${appt.time === '11:00 AM' ? 'selected' : ''}>11:00 AM</option>
              <option value="11:30 AM" ${appt.time === '11:30 AM' ? 'selected' : ''}>11:30 AM</option>
              <option value="12:00 PM" ${appt.time === '12:00 PM' ? 'selected' : ''}>12:00 PM</option>
              <option value="02:00 PM" ${appt.time === '02:00 PM' ? 'selected' : ''}>02:00 PM</option>
              <option value="02:30 PM" ${appt.time === '02:30 PM' ? 'selected' : ''}>02:30 PM</option>
              <option value="03:00 PM" ${appt.time === '03:00 PM' ? 'selected' : ''}>03:00 PM</option>
              <option value="03:30 PM" ${appt.time === '03:30 PM' ? 'selected' : ''}>03:30 PM</option>
              <option value="04:00 PM" ${appt.time === '04:00 PM' ? 'selected' : ''}>04:00 PM</option>
            </select>
          </div>
        </div>

        <!-- Appointment Type & Status -->
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block card-title-mono mb-1">Appointment Type</label>
            <select id="modal-type" class="w-full px-3 py-2 border border-slate-300 rounded-md text-xs bg-white">
              <option value="Consultation" ${appt.type === 'Consultation' ? 'selected' : ''}>OPD Consultation</option>
              <option value="Procedure" ${appt.type === 'Procedure' ? 'selected' : ''}>Procedure</option>
              <option value="Follow-up Consultation" ${appt.type === 'Follow-up Consultation' ? 'selected' : ''}>Clinical Follow-up</option>
              <option value="Teleconsultation" ${appt.type === 'Teleconsultation' ? 'selected' : ''}>Teleconsultation</option>
            </select>
          </div>
          <div>
            <label class="block card-title-mono mb-1">Status</label>
            <select id="modal-status" class="w-full px-3 py-2 border border-slate-300 rounded-md text-xs bg-white">
              <option value="Booked" ${appt.status === 'Booked' ? 'selected' : ''}>Booked</option>
              <option value="Arrived" ${appt.status === 'Arrived' ? 'selected' : ''}>Arrived</option>
              <option value="Waiting" ${appt.status === 'Waiting' ? 'selected' : ''}>Waiting</option>
              <option value="In Consultation" ${appt.status === 'In Consultation' ? 'selected' : ''}>In Consultation</option>
              <option value="Completed" ${appt.status === 'Completed' ? 'selected' : ''}>Completed</option>
              <option value="No Show" ${appt.status === 'No Show' ? 'selected' : ''}>No Show</option>
              <option value="Rescheduled" ${appt.status === 'Rescheduled' ? 'selected' : ''}>Rescheduled</option>
            </select>
          </div>
        </div>

        <div>
          <label class="block card-title-mono mb-1">Reason for Rescheduling / Remarks</label>
          <textarea id="modal-remarks" class="w-full px-3 py-2 border border-slate-300 rounded-md text-xs h-16 resize-none" placeholder="Reason for rescheduling...">${appt.remarks || ''}</textarea>
        </div>

        <!-- Conflict warning banner -->
        <div id="modal-conflict-banner" class="hidden bg-rose-50 border border-rose-200 text-rose-700 px-3 py-2.5 rounded-lg text-xs font-medium">
          ⚠️ Schedule Conflict: Selected Doctor already has a booking at this time. Double check slot grid.
        </div>
      </div>

      <div class="px-5 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3">
        <button onclick="closeModal()" class="btn-g" style="padding: 5px 12px; font-size: 11px;">Cancel</button>
        <button id="modal-submit-btn" class="btn-p">Save Schedule</button>
      </div>
    `;

    showModal(modalHTML);
    window.onModalDeptChange(document.getElementById('modal-dept').value);
    
    // Select the active doctor
    const docSelect = document.getElementById('modal-doctor');
    docSelect.value = appt.doctorName;

    // Trigger conflict checking dynamically on slot change
    const checkConflicts = () => {
      const docVal = document.getElementById('modal-doctor').value;
      const dateVal = document.getElementById('modal-date').value;
      const timeVal = document.getElementById('modal-time').value;
      const banner = document.getElementById('modal-conflict-banner');
      
      if (checkAppointmentConflict(docVal, dateVal, timeVal, appt.id)) {
        banner.classList.remove('hidden');
      } else {
        banner.classList.add('hidden');
      }
    };

    document.getElementById('modal-doctor').addEventListener('change', checkConflicts);
    document.getElementById('modal-date').addEventListener('change', checkConflicts);
    document.getElementById('modal-time').addEventListener('change', checkConflicts);

    // Bind save submit
    document.getElementById('modal-submit-btn').addEventListener('click', () => {
      const deptVal = document.getElementById('modal-dept').value;
      const docVal = document.getElementById('modal-doctor').value;
      const dateVal = document.getElementById('modal-date').value;
      const timeVal = document.getElementById('modal-time').value;
      const typeVal = document.getElementById('modal-type').value;
      const statusVal = document.getElementById('modal-status').value;
      const remarks = document.getElementById('modal-remarks').value;

      // Final Conflict block check
      if (checkAppointmentConflict(docVal, dateVal, timeVal, appt.id)) {
        alert(`Conflict: ${docVal} already has an appointment booked on ${dateVal} at ${timeVal}. Choose another time.`);
        return;
      }

      // Update fields
      const dateChanged = appt.date !== dateVal || appt.time !== timeVal;
      appt.spec = deptVal;
      appt.doctorName = docVal;
      appt.date = dateVal;
      appt.time = timeVal;
      appt.type = typeVal;
      appt.remarks = remarks;
      
      if (dateChanged && statusVal === 'Booked') {
        appt.status = 'Rescheduled';
      } else {
        appt.status = statusVal;
      }

      // Auto update patient state
      const patient = state.patients.find(p => p.uhid === appt.uhid);
      if (patient && dateVal === systemToday) {
        if (appt.status === 'Arrived') patient.status = 'Checked In';
      }

      alert(`Appointment ${appt.id} successfully updated.`);
      closeModal();
    });
  };

  // ACTION 4: CANCEL BOOKING MODAL
  window.openCancelModal = (apptId) => {
    const appt = state.appointments.find(a => a.id === apptId);
    if (!appt) return;

    const modalHTML = `
      <div class="px-5 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
        <h3 class="text-base font-bold text-slate-800">Cancel OPD Appointment - ${appt.id}</h3>
        <button onclick="closeModal()" class="text-slate-400 hover:text-slate-600 text-xl font-bold">&times;</button>
      </div>

      <div class="px-5 py-5 overflow-y-auto flex-1 text-sm space-y-4">
        <div class="bg-rose-50 border border-rose-100 rounded-lg p-3 text-xs text-rose-700">
          ⚠️ You are about to cancel the scheduled appointment for <strong>${appt.patientName}</strong> (${appt.uhid}) with ${appt.doctorName}.
        </div>

        <div>
          <label class="block card-title-mono mb-1">Reason for Cancellation *</label>
          <select id="cancel-reason" class="w-full px-3 py-2 border border-slate-300 rounded-md text-xs bg-white">
            <option value="Patient Request">Patient Request</option>
            <option value="Doctor Unavailable">Doctor Unavailable / Duty Leave</option>
            <option value="Incorrect Entry">Double Entry / Incorrect Registration</option>
            <option value="Billing Unpaid">OPD Registration Unpaid</option>
            <option value="Other">Other Reasons</option>
          </select>
        </div>

        <div>
          <label class="block card-title-mono mb-1">Additional Notes</label>
          <textarea id="cancel-remarks" class="w-full px-3 py-2 border border-slate-300 rounded-md text-xs h-20 resize-none" placeholder="Provide extra cancellation reason details..."></textarea>
        </div>
      </div>

      <div class="px-5 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3">
        <button onclick="closeModal()" class="btn-g" style="padding: 5px 12px; font-size: 11px;">No, Keep Booking</button>
        <button id="modal-cancel-confirm-btn" class="btn-p" style="background: #e11d48;">Confirm Cancellation</button>
      </div>
    `;

    showModal(modalHTML);

    document.getElementById('modal-cancel-confirm-btn').addEventListener('click', () => {
      const reason = document.getElementById('cancel-reason').value;
      const remarks = document.getElementById('cancel-remarks').value;

      appt.status = 'Cancelled';
      appt.remarks = `Cancel Reason: ${reason}. Notes: ${remarks}`;

      const patient = state.patients.find(p => p.uhid === appt.uhid);
      if (patient && appt.date === systemToday) {
        patient.status = 'Registered';
      }

      alert(`OPD Appointment ${appt.id} has been cancelled.`);
      closeModal();
    });
  };

  // ACTION 5: MARK ARRIVED DIRECT ACTION
  window.markPatientArrived = (apptId) => {
    const appt = state.appointments.find(a => a.id === apptId);
    if (appt) {
      appt.status = 'Arrived';
      const patient = state.patients.find(p => p.uhid === appt.uhid);
      if (patient) {
        patient.status = 'Checked In';
      }
      alert(`Patient ${appt.patientName} marked as Arrived. Token status updated.`);
      renderViewData();
    }
  };

  // ACTION 6: PRINT APPOINTMENT SLIP (Simulated Print slip modal)
  window.printAppointmentSlip = (apptId) => {
    const appt = state.appointments.find(a => a.id === apptId);
    if (!appt) return;

    const patient = state.patients.find(p => p.uhid === appt.uhid) || {};
    const patientAgeGen = patient.age ? `${patient.age} yrs / ${patient.gender}` : 'N/A';
    const patientMobile = patient.mobile || appt.mobile || 'N/A';
    const doctorObj = state.doctors.find(d => d.name === appt.doctorName) || {};
    const roomNum = doctorObj.room || '101';

    const modalHTML = `
      <div class="px-5 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
        <h3 class="text-base font-bold text-slate-800">Print OPD Token Slip</h3>
        <button onclick="closeModal()" class="text-slate-400 hover:text-slate-600 text-xl font-bold">&times;</button>
      </div>

      <div class="px-5 py-6 overflow-y-auto flex-1 bg-slate-100 flex flex-col justify-center items-center">
        <!-- Print layout container -->
        <div id="print-slip-thermal" class="border border-dashed border-slate-300 p-5 w-80 bg-white font-mono text-xs text-slate-800 shadow-sm rounded-sm space-y-2">
          <div class="text-center font-bold border-b border-dashed border-slate-300 pb-2 mb-2 text-sm text-slate-900 flex flex-col">
            <span>🧬 SARONIL HOSPITALS</span>
            <span class="text-[9px] font-normal text-slate-500">Bengaluru Campus, HSR Layout</span>
          </div>
          
          <div class="text-center font-bold text-slate-900 border border-slate-800 py-1 text-sm bg-slate-50">
            OPD TOKEN SLIP
          </div>

          <div class="space-y-1 pt-2 border-b border-dashed border-slate-200 pb-2">
            <p><strong>Appt ID:</strong> ${appt.id}</p>
            <p><strong>Token No:</strong> OPD-${appt.id.replace('APT', '')}</p>
            <p><strong>UHID:</strong> ${appt.uhid}</p>
            <p><strong>Patient:</strong> ${appt.patientName}</p>
            <p><strong>Age/Gen:</strong> ${patientAgeGen}</p>
            <p><strong>Contact:</strong> ${patientMobile}</p>
          </div>

          <div class="space-y-1 border-b border-dashed border-slate-200 pb-2">
            <p><strong>Consultant:</strong> ${appt.doctorName}</p>
            <p><strong>Specialty:</strong> ${appt.spec}</p>
            <p><strong>Clinic Room:</strong> Room ${roomNum}</p>
            <p><strong>Date & Time:</strong> ${appt.date} | ${appt.time}</p>
            <p><strong>Visit Type:</strong> ${appt.type}</p>
          </div>

          <!-- Dummy Barcode -->
          <div class="flex flex-col items-center justify-center pt-2">
            <div class="h-8 bg-slate-900 w-11/12 flex items-center justify-around text-white text-[6px]">
              ||||||| | ||||| | |||| ||| ||| |
            </div>
            <span class="text-[8px] text-slate-400 mt-1">${appt.id}</span>
          </div>

          <div class="text-center text-[9px] text-slate-400 pt-2 italic">
            Please report 10 minutes prior to your time.
            <br>Thank you for visiting Saronil.
          </div>
        </div>
      </div>

      <div class="px-5 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3">
        <button onclick="closeModal()" class="btn-g" style="padding: 5px 12px; font-size: 11px;">Close</button>
        <button id="modal-print-trigger-btn" class="btn-p">
          <span>🖨️</span> Send to Printer
        </button>
      </div>
    `;

    showModal(modalHTML);

    document.getElementById('modal-print-trigger-btn').addEventListener('click', () => {
      // Simulate real browser print window opening
      const printWindow = window.open('', '_blank', 'width=350,height=550');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Saronil Token Print - ${appt.id}</title>
              <style>
                body { font-family: monospace; padding: 20px; font-size: 12px; line-height: 1.4; color: #000; }
                .text-center { text-align: center; }
                .font-bold { font-weight: bold; }
                .border-b { border-bottom: 1px dashed #000; }
                .border-box { border: 1px solid #000; padding: 5px; margin: 10px 0; }
                .pb-2 { padding-bottom: 8px; }
                .mb-2 { margin-bottom: 8px; }
                .space-y-1 p { margin: 4px 0; }
                .barcode { background: #000; height: 35px; width: 85%; margin: 10px auto; color: #fff; text-align: center; font-size: 7px; display: flex; align-items: center; justify-content: center; letter-spacing: 2px; }
              </style>
            </head>
            <body>
              <div class="text-center font-bold border-b pb-2 mb-2">
                🧬 SARONIL HOSPITALS
                <br><span style="font-size: 9px; font-weight: normal;">Bengaluru Campus</span>
              </div>
              <div class="text-center font-bold border-box">
                OPD TOKEN SLIP
              </div>
              <div class="space-y-1 border-b pb-2 mb-2">
                <p><strong>Appt ID:</strong> ${appt.id}</p>
                <p><strong>Token No:</strong> OPD-${appt.id.replace('APT', '')}</p>
                <p><strong>UHID:</strong> ${appt.uhid}</p>
                <p><strong>Patient:</strong> ${appt.patientName}</p>
                <p><strong>Age/Gen:</strong> ${patientAgeGen}</p>
                <p><strong>Contact:</strong> ${patientMobile}</p>
              </div>
              <div class="space-y-1 border-b pb-2 mb-2">
                <p><strong>Consultant:</strong> ${appt.doctorName}</p>
                <p><strong>Specialty:</strong> ${appt.spec}</p>
                <p><strong>Room:</strong> Room ${roomNum}</p>
                <p><strong>Date & Time:</strong> ${appt.date} | ${appt.time}</p>
                <p><strong>Visit Type:</strong> ${appt.type}</p>
              </div>
              <div class="barcode font-bold">||||||||||||||||||||||||||||</div>
              <div class="text-center" style="font-size: 9px; margin-top: 10px;">
                Please report 10 mins prior.
                <br>Thank you for visiting.
              </div>
              <script>
                window.onload = function() {
                  window.print();
                  window.close();
                };
              </script>
            </body>
          </html>
        `);
        printWindow.document.close();
        closeModal();
      } else {
        alert("Pop-up blocker prevented printing receipt. Please enable pop-ups.");
      }
    });
  };

  // KPI Card click-to-filter drilldown helper
  window.filterAppointmentsByCard = (statusVal) => {
    const filterStatus = document.getElementById('filter-status');
    const filterDateMode = document.getElementById('filter-date-mode');
    
    if (statusVal === 'AllToday') {
      if (filterDateMode) {
        filterDateMode.value = 'today';
        filterDateMode.dispatchEvent(new Event('change'));
      }
      if (filterStatus) {
        filterStatus.value = 'All';
        filterStatus.dispatchEvent(new Event('change'));
      }
    } else {
      if (filterStatus) {
        filterStatus.value = statusVal;
        filterStatus.dispatchEvent(new Event('change'));
      }
    }
  };

  // Bind Autocomplete patient lookup & filters triggers on load
  setupGlobalPatientSearch();
  populateDoctorFilter();
  bindFilters();
  renderViewData();

  // If uhid parameter was passed, immediately open the Book Appointment modal pre-filled
  if (params.uhid) {
    // Clear url query params so modal won't re-trigger on subsequent rendering cycles
    window.location.hash = 'appointments';
    openBookingModal();
  }
};
