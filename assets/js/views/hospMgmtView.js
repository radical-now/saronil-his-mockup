/* ==========================================================================
   SARONIL HMS - HOSPITAL MANAGEMENT EXECUTIVE COMMAND CENTER
   NABH-Accredited Quality, Safety, HR & Facilities Administration Workspace
   ========================================================================== */

window.views = window.views || {};

(function() {
  function getActiveRole() {
    if (window.activeHospMgmtRole) return window.activeHospMgmtRole;
    if (window.state && window.state.activeUserRole) {
      const globalRole = window.state.activeUserRole;
      if (globalRole === 'Medical Superintendent') return 'Medical Superintendent';
      if (globalRole === 'Administrator') return 'Hospital Administrator';
      if (globalRole === 'Doctor') return 'Department Head';
      if (globalRole === 'Nurse') return 'Nursing Supervisor';
      if (globalRole === 'HR Manager') return 'HR Manager';
      if (globalRole === 'Quality Manager') return 'Quality Manager';
      if (globalRole === 'Facility Manager') return 'Facility Manager';
    }
    return 'Medical Superintendent';
  }

  // Clinical Staff register states
  var _staffSearchQuery = "";
  var _staffFilterBranch = "All";
  var _staffFilterDept = "All";
  var _staffFilterDesignation = "All";
  var _staffFilterEmpType = "All";
  var _staffFilterStatus = "All";
  var _staffFilterCredStatus = "All";
  var _staffActiveCategory = "All"; // 'All' | 'Doctor' | 'Nurse'

  // Roster states
  if (!window.activeRosterStartDate) {
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(today.setDate(diff));
    window.activeRosterStartDate = monday.toISOString().slice(0, 10);
  }
  window.rosterFilterBranch = window.rosterFilterBranch || 'All';
  window.rosterFilterDept = window.rosterFilterDept || 'All';
  window.rosterFilterStaffType = window.rosterFilterStaffType || 'Both';
  window.activeRosterViewMode = window.activeRosterViewMode || 'Weekly';

  // Initialize Global Management State
  function initHospMgmtState() {
    if (!window.state) window.state = {};
    
    // Default active states
    window.activeHospMgmtTab = window.activeHospMgmtTab || 'dashboard';
    window.activeHospMgmtRole = window.activeHospMgmtRole || null;
    
    // 1. Bed Allocations
    window.state.mgmtBeds = window.state.mgmtBeds || {
      total: 120,
      occupied: 86,
      wards: [
        { name: "General Ward Male", occupied: 22, total: 30, color: "#10b981" },
        { name: "General Ward Female", occupied: 26, total: 30, color: "#10b981" },
        { name: "ICU", occupied: 14, total: 15, color: "#ef4444" },
        { name: "HDU", occupied: 8, total: 10, color: "#f59e0b" },
        { name: "Maternity Ward", occupied: 10, total: 15, color: "#10b981" },
        { name: "Pediatric Ward", occupied: 6, total: 20, color: "#10b981" }
      ]
    };

    // 2. Daily Census Status
    window.state.mgmtCensus = window.state.mgmtCensus || {
      date: "27-Jun-2026",
      status: "Draft",
      certifiedBy: "",
      certifiedTime: "",
      inpatient: { opening: 82, admissions: 12, discharges: 6, deaths: 2, transfersIn: 4, transfersOut: 4, closing: 86 },
      opd: { total: 142, newReg: 95, followUp: 47, depts: [
        { dept: "Cardiology", count: 32 },
        { dept: "General Medicine", count: 48 },
        { dept: "Pediatrics", count: 24 },
        { dept: "Orthopedics", count: 20 },
        { dept: "Gynecology", count: 18 }
      ]},
      emergency: { total: 18, admitted: 6, discharged: 10, mlc: 2, deaths: 0, bd: 0 },
      daycare: { total: 8 },
      surgeries: { elective: 5, emergency: 2, total: 7 }
    };

    // 3. HR Absentees, Leaves, Credentials
    window.state.mgmtAbsentees = window.state.mgmtAbsentees || [
      { name: "Staff Nurse Priya", dept: "ICU", designation: "Critical Care Nurse", type: "Absent" },
      { name: "Dr. Sandeep Shah", dept: "Orthopedics", designation: "Sr. Consultant", type: "On Leave" },
      { name: "Raman Kumar", dept: "Pharmacy", designation: "Technician", type: "Absent" }
    ];

    window.state.mgmtLeaves = window.state.mgmtLeaves || [
      { name: "Karan Singh", dept: "Billing", dates: "29-Jun-2026 to 02-Jul-2026", days: 4, type: "Casual", reason: "Family function" },
      { name: "Sunita Devi", dept: "ICU", dates: "30-Jun-2026 to 05-Jul-2026", days: 6, type: "Earned", reason: "Medical recovery" }
    ];

    window.state.mgmtCredentials = window.state.mgmtCredentials || [
      { id: "EMP-00481", name: "Dr. Ramesh Kumar", designation: "Cardiologist", type: "MCI/NMC Registration", regNo: "NMC-884021", expiry: "12-Jul-2026", days: 14, status: "Expiring soon (14 days)" },
      { id: "EMP-00921", name: "Staff Nurse Priya", designation: "Critical Care Nurse", type: "INC Registration", regNo: "INC-990214", expiry: "28-Jun-2026", days: 0, status: "Expired" },
      { id: "EMP-01024", name: "Pharmacist Rajesh", designation: "Store Incharge", type: "Pharmacy Council Lic", regNo: "PCI-112028", expiry: "22-Jul-2026", days: 24, status: "Expiring soon (24 days)" }
    ];

    // 4. Quality & Safety: Incidents, Complaints, Indicators
    window.state.mgmtIncidents = window.state.mgmtIncidents || [
      { id: "INC-2026-0082", date: "26-Jun-2026 09:30 AM", type: "Medication error", dept: "ICU", patient: "Rajesh Kumar (UH-2026-000001)", severity: "Minor", reporter: "Nurse Priya", status: "Under Review", rootCause: "", actionTaken: "Dose corrected immediately. Vitals stable.", correctiveAction: "", closedBy: "", closedDate: "" },
      { id: "INC-2026-0083", date: "27-Jun-2026 11:15 AM", type: "Needle stick (staff)", dept: "Emergency", patient: "—", severity: "Minor", reporter: "Dr. Amit Verma", status: "Open", rootCause: "", actionTaken: "First aid administered. PEP started.", correctiveAction: "", closedBy: "", closedDate: "" },
      { id: "INC-2026-0084", date: "27-Jun-2026 02:45 PM", type: "Equipment failure causing harm", dept: "OT", patient: "Sanjay Sen (UH-2026-000012)", severity: "Sentinel", reporter: "Dr. Alok Sen", status: "Open", rootCause: "", actionTaken: "Surgical backup oxygen switched on.", correctiveAction: "", closedBy: "", closedDate: "" }
    ];

    window.state.mgmtComplaints = window.state.mgmtComplaints || [
      { id: "CMP-2026-0021", date: "26-Jun-2026", complainant: "Aalok Kumar (Visitor)", mob: "+91 99201 48210", dept: "Billing", nature: "Billing dispute", priority: "Medium", assignedTo: "Aditi Roy (Billing Head)", status: "Open", slaDue: "28-Jun-2026", description: "Discrepancy in TPA co-pay calculation.", actions: [] },
      { id: "CMP-2026-0022", date: "25-Jun-2026", complainant: "Madan Devi (Relative)", mob: "+91 98877 12104", dept: "Facilities", nature: "Cleanliness", priority: "Low", assignedTo: "Ramesh Lal (Sanitation Super)", status: "Resolved", slaDue: "02-Jul-2026", description: "Water dripping from ICU corridor roof.", actions: ["Roof sealing completed on 26-Jun"] },
      { id: "CMP-2026-0023", date: "27-Jun-2026", complainant: "Sunita Devi (Patient)", mob: "+91 90812 00192", dept: "OPD Reception", nature: "Staff behaviour", priority: "High", assignedTo: "Medical Superintendent", status: "Open", slaDue: "28-Jun-2026", description: "Escalated: Front desk staff refused registration assistance.", actions: [] }
    ];

    window.state.mgmtIndicators = window.state.mgmtIndicators || [
      { code: "QI-CLN-01", name: "Hospital Infection Rate (per 1000 patient days)", val: "1.2", target: "< 1.5", status: "Met", trend: [1.4, 1.3, 1.2] },
      { code: "QI-CLN-02", name: "Patient Fall Rate (per 1000 patient days)", val: "0.2", target: "< 0.1", status: "Below target", trend: [0.1, 0.1, 0.2] },
      { code: "QI-CLN-03", name: "Medication Error Rate (per 1000 days)", val: "0.4", target: "< 0.5", status: "Met", trend: [0.3, 0.5, 0.4] },
      { code: "QI-OPR-01", name: "Average Length of Stay (LOS - days)", val: "4.8", target: "< 5.0", status: "Met", trend: [5.2, 5.0, 4.8] },
      { code: "QI-OPR-02", name: "Critical Value Communication inside 30 mins %", val: "94%", target: "> 95%", status: "Near threshold", trend: [96, 95, 94] },
      { code: "QI-OPR-03", name: "Complaint Resolution within SLA %", val: "88%", target: "> 90%", status: "Near threshold", trend: [90, 89, 88] }
    ];

    // 5. Facility breakdown tickets, PM schedules, Utilities, BMW
    window.state.mgmtTickets = window.state.mgmtTickets || [
      { id: "TKT-2026-0042", equipment: "OT AC Chiller unit", dept: "OT", priority: "Critical", reported: "27-Jun-2026 09:30 AM", assignedTo: "Suresh (BME)", status: "Open", ageHours: 14 },
      { id: "TKT-2026-0043", equipment: "ICU Ventilator-3", dept: "ICU", priority: "Critical", reported: "27-Jun-2026 10:15 AM", assignedTo: "Unassigned", status: "Open", ageHours: 13 },
      { id: "TKT-2026-0044", equipment: "Ward B Corridor Light", dept: "Ward B", priority: "Routine", reported: "26-Jun-2026 04:00 PM", assignedTo: "Ramesh (Electrical)", status: "Resolved", ageHours: 26 }
    ];

    window.state.mgmtPmSchedules = window.state.mgmtPmSchedules || [
      { equipment: "OT Autoclave Ch-1", dept: "OT", freq: "Monthly", lastDone: "28-May-2026", nextDue: "28-Jun-2026", status: "Due today" },
      { equipment: "Defibrillator-ICU-1", dept: "ICU", freq: "Weekly", lastDone: "20-Jun-2026", nextDue: "27-Jun-2026", status: "Overdue" },
      { equipment: "Central O2 Pipeline", dept: "Facilities", freq: "Monthly", lastDone: "10-Jun-2026", nextDue: "10-Jul-2026", status: "Done" }
    ];

    window.state.mgmtUtilities = window.state.mgmtUtilities || {
      generator: "On Mains",
      o2Supply: "Adequate",
      cylinderStock: { full: 45, empty: 15 },
      waterLevel: "Full",
      lastUpdated: "27-Jun-2026 06:00 PM"
    };

    window.state.mgmtBmwLogs = window.state.mgmtBmwLogs || [
      { date: "27-Jun-2026", yellow: 12.5, red: 18.0, blue: 4.2, black: 25.0, total: 59.7, collected: "Yes", collector: "Maridi Waste Inc" },
      { date: "26-Jun-2026", yellow: 14.2, red: 16.5, blue: 5.0, black: 22.0, total: 57.7, collected: "Yes", collector: "Maridi Waste Inc" }
    ];

    if (!window.state.staffList || window.state.staffList.length === 0) {
      const storedStaff = localStorage.getItem('saronil_staffList');
      if (storedStaff) {
        window.state.staffList = JSON.parse(storedStaff);
      } else {
        window.state.staffList = [];
        const depts = [
        "Cardiology", "Orthopedics", "General Medicine", "Pediatrics", "General Surgery",
        "Gynecology & Obs", "Emergency Medicine", "Neurology", "Oncology", "Dermatology", "Daycare"
      ];
      
      // Seed Doctors
      (window.state.doctors || []).forEach((d, idx) => {
        const branchOptions = ['Bengaluru HSR (Main)', 'Whitefield Clinic', 'Electronic City Hub'];
        const branches = idx % 3 === 0 ? [branchOptions[0], branchOptions[1]] : [branchOptions[idx % 3]];
        const opdDays = idx % 2 === 0 ? ['Mon', 'Wed', 'Fri'] : ['Tue', 'Thu', 'Sat'];
        const statusToday = idx % 5 === 0 ? 'On Leave' : (idx % 3 === 0 ? 'OPD' : (idx % 4 === 0 ? 'Off Duty' : 'On Duty'));
        const credStatus = idx === 3 ? 'Expired' : (idx === 7 ? 'Expiring soon' : 'Valid');
        const regExpiry = idx === 3 ? window._HIS_DATE(-2) : (idx === 7 ? window._HIS_DATE(15) : window._HIS_DATE(365));
        
        window.state.staffList.push({
          id: d.id || `DOC${idx + 1}`,
          name: d.name,
          type: 'Doctor',
          designation: idx % 4 === 0 ? 'Senior Consultant' : (idx % 3 === 0 ? 'Senior Resident' : 'Consultant'),
          department: d.spec || depts[idx % depts.length],
          registrationNo: `SMC-${10000 + idx}`,
          regValidTill: regExpiry,
          specialisation: d.spec || depts[idx % depts.length],
          branches: branches,
          statusToday: statusToday,
          status: statusToday === 'On Leave' ? 'On Leave' : 'Active',
          credentialStatus: credStatus,
          phone: d.phone || `+91 98450 ${11000 + idx}`,
          email: `${d.name.toLowerCase().replace(/[^a-z]/g, '')}@saronil.com`,
          dob: '1980-05-15',
          sex: idx % 2 === 0 ? 'Male' : 'Female',
          address: 'HSR Layout, Bengaluru',
          emergencyName: 'Emergency Contact',
          emergencyPhone: '+91 99000 12345',
          bloodGroup: 'B+',
          opdDays: opdDays,
          opdTiming: '09:00 AM - 01:00 PM',
          otPrivileges: idx % 3 === 0,
          joiningDate: '2022-01-10',
          reportingTo: 'Medical Superintendent',
          credentials: [
            { name: 'Medical Council Registration', uploaded: true, expiryDate: regExpiry, status: credStatus },
            { name: 'ACLS Certification', uploaded: true, expiryDate: window._HIS_DATE(180), status: 'Valid' },
            { name: 'Health Fitness Certificate', uploaded: true, expiryDate: window._HIS_DATE(200), status: 'Valid' }
          ]
        });
      });

      // Seed Nurses
      (window.state.nurses || []).forEach((n, idx) => {
        const credStatus = idx === 1 ? 'Expired' : (idx === 5 ? 'Expiring soon' : 'Valid');
        const regExpiry = idx === 1 ? window._HIS_DATE(-5) : (idx === 5 ? window._HIS_DATE(20) : window._HIS_DATE(500));
        const statusToday = idx === 2 ? 'On Leave' : (idx % 2 === 0 ? 'Morning' : 'Night');
        
        window.state.staffList.push({
          id: n.id || `NUR${idx + 1}`,
          name: n.name,
          type: 'Nurse',
          designation: idx % 5 === 0 ? 'Nursing Supervisor' : (idx % 3 === 0 ? 'Senior Nurse' : 'Staff Nurse'),
          department: n.dept || 'General Wards',
          ward: n.dept || 'General Ward (Male)',
          registrationNo: `INC-${20000 + idx}`,
          regValidTill: regExpiry,
          branch: 'Bengaluru HSR (Main)',
          statusToday: statusToday,
          status: statusToday === 'On Leave' ? 'On Leave' : 'Active',
          credentialStatus: credStatus,
          phone: n.phone || `+91 98450 ${22000 + idx}`,
          email: `${n.name.toLowerCase().replace(/[^a-z]/g, '')}@saronil.com`,
          dob: '1992-08-20',
          sex: 'Female',
          address: 'Electronic City, Bengaluru',
          emergencyName: 'Emergency Contact',
          emergencyPhone: '+91 99000 54321',
          bloodGroup: 'O+',
          joiningDate: '2023-04-15',
          reportingTo: 'Nursing Supervisor Mary',
          credentials: [
            { name: 'Nursing Council Registration', uploaded: true, expiryDate: regExpiry, status: credStatus },
            { name: 'BLS Certification', uploaded: true, expiryDate: window._HIS_DATE(100), status: 'Valid' },
            { name: 'Health Fitness Certificate', uploaded: true, expiryDate: window._HIS_DATE(120), status: 'Valid' }
          ]
        });
      });
      localStorage.setItem('saronil_staffList', JSON.stringify(window.state.staffList));
      }
    }
  }

  window.views.hospMgmt = function(container, subAnchor, params) {
    initHospMgmtState();
    
    if (params && params.tab) {
      window.activeHospMgmtTab = params.tab;
    } else if (subAnchor) {
      window.activeHospMgmtTab = subAnchor;
    }
    
    const activeTab = window.activeHospMgmtTab || 'dashboard';
    const activeRole = getActiveRole();

    container.innerHTML = `
      <style>
        .mgmt-wrapper {
          display: flex;
          flex-direction: column;
          flex: 1;
          min-height: 0;
          overflow: hidden;
          background: #f8fafc;
        }
        
        .mgmt-main-viewport {
          display: flex;
          flex-direction: column;
          overflow-y: auto;
          flex: 1;
          min-height: 0;
          width: 100%;
        }
        .mgmt-topbar {
          height: 48px;
          background: #ffffff;
          border-bottom: 1px solid #cbd5e1;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 1rem;
          flex-shrink: 0;
        }
        
        .mgmt-workspace-container {
          padding: 1.1rem;
          flex-grow: 1;
        }
        
        .mgmt-kpi-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 0.75rem;
          margin-bottom: 1.1rem;
        }
        @media(max-width: 768px) {
          .mgmt-kpi-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        .mgmt-kpi-card {
          background: #ffffff;
          border: 1px solid #cbd5e1;
          border-radius: 8px;
          padding: 0.75rem 1rem;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          min-height: 80px;
        }
        .mgmt-kpi-val {
          font-family: 'JetBrains Mono', monospace;
          font-size: 1.45rem;
          font-weight: 800;
          color: #0f172a;
          margin-top: 4px;
        }
        
        .mgmt-action-card {
          border-left: 4px solid #ef4444 !important;
          background: #fffafb;
          border: 1px solid #cbd5e1;
          border-radius: 8px;
          padding: 0.85rem;
          margin-bottom: 1rem;
        }
        
        .custom-tbl th {
          font-family: 'Inter', sans-serif;
          font-weight: 700;
          text-transform: uppercase;
          font-size: 0.65rem;
          letter-spacing: 0.05em;
          color: #64748b;
          background: #f8fafc;
          border-bottom: 1px solid #cbd5e1;
          padding: 8px;
          text-align: left;
        }
        .custom-tbl td {
          padding: 8px;
          border-bottom: 1px solid #f1f5f9;
          font-size: 0.78rem;
          vertical-align: middle;
        }
      </style>

      <div class="mgmt-wrapper">
        <!-- Main Viewport Area (Full Width) -->
        <div class="mgmt-main-viewport">

          <!-- Workspace container -->
          <div class="mgmt-workspace-container" id="mgmt-workspace-panel">
          </div>
        </div>
      </div>
    `;

    // Render active tab workspace
    const panel = document.getElementById('mgmt-workspace-panel');
    renderSubTabContent(panel, activeTab, activeRole);
  };

  window.renderHospMgmtSubTab = function(tabName) {
    window.activeHospMgmtTab = tabName;
    const titleEl = document.getElementById('mgmt-active-tab-title-el');
    if (titleEl) {
      titleEl.textContent = tabName.charAt(0).toUpperCase() + tabName.slice(1).replace('_', ' ');
    }
    
    // Update sub-sidebar active class
    document.querySelectorAll('.mgmt-sidebar-item').forEach(item => {
      const match = item.innerText.toLowerCase().includes(tabName.toLowerCase().replace('_', ' ').substring(0, 5));
      if (match) item.classList.add('active');
      else item.classList.remove('active');
    });

    const panel = document.getElementById('mgmt-workspace-panel');
    if (panel) {
      renderSubTabContent(panel, tabName, getActiveRole());
    }
  };

  window.switchHospMgmtRole = function(roleName) {
    window.activeHospMgmtRole = roleName;
    const currentTab = window.activeHospMgmtTab || 'dashboard';
    window.renderHospMgmtSubTab(currentTab);
  };

  function renderSubTabContent(panel, tabName, roleName) {
    panel.innerHTML = '';
    
    if (tabName === 'dashboard') {
      if (roleName === 'HR Manager') renderHRDashboard(panel);
      else if (roleName === 'Quality Manager') renderQualityDashboard(panel);
      else if (roleName === 'Facility Manager') renderFacilityDashboard(panel);
      else renderMSDashboard(panel);
    } 
    else if (tabName === 'staff') renderClinicalStaffTab(panel);
    else if (tabName === 'census') renderDailyCensusTab(panel);
    else if (tabName === 'attendance') renderAttendanceTab(panel);
    else if (tabName === 'roster') renderDutyRosterTab(panel);
    else if (tabName === 'credentials') renderCredentialTrackerTab(panel);
    else if (tabName === 'incidents') renderIncidentsTab(panel);
    else if (tabName === 'complaints') renderComplaintsTab(panel);
    else if (tabName === 'indicators') renderIndicatorsTab(panel);
    else if (tabName === 'tickets') renderTicketsTab(panel);
    else if (tabName === 'pm') renderPMTab(panel);
    else if (tabName === 'utilities') renderUtilitiesTab(panel);
  }

  // ========================================================================
  // PERSONA 1: MEDICAL SUPERINTENDENT DASHBOARD
  // ========================================================================
  function renderMSDashboard(panel) {
    const state = window.state || {};
    const census = state.mgmtCensus || {};
    const beds = state.mgmtBeds || { total: 120, occupied: 86, wards: [] };
    const complaints = state.mgmtComplaints || [];
    const incidents = state.mgmtIncidents || [];
    const credentials = state.mgmtCredentials || [];
    const tickets = state.mgmtTickets || [];

    if (window.mgmtAlertsExpanded === undefined) {
      window.mgmtAlertsExpanded = false;
    }
    window.mgmtToggleAlerts = function() {
      window.mgmtAlertsExpanded = !window.mgmtAlertsExpanded;
      const content = document.getElementById('mgmt-alerts-content');
      const chevron = document.getElementById('mgmt-alerts-chevron');
      if (content && chevron) {
        if (window.mgmtAlertsExpanded) {
          content.style.display = 'block';
          chevron.textContent = '▲';
        } else {
          content.style.display = 'none';
          chevron.textContent = '▼';
        }
      }
    };

    const occPct = Math.round((beds.occupied / beds.total) * 100);
    const occColor = occPct > 90 ? '#ef4444' : (occPct >= 75 ? '#f59e0b' : '#10b981');

    // Build Items Needing MS Action list
    const actionItems = [];
    
    // 1. Sentinel events
    incidents.filter(i => i.severity === 'Sentinel' && i.status === 'Open').forEach(i => {
      actionItems.push({ desc: `Sentinel event — RCA pending (${i.type})`, dept: i.dept, since: "1 day ago", priority: "🔴" });
    });
    // 2. Unexpected deaths (admissions list check)
    actionItems.push({ desc: "Unexpected death — case review pending (Bed A-104)", dept: "Medicine", since: "Today", priority: "🔴" });
    // 3. Complaint escalated to MS
    complaints.filter(c => c.assignedTo === 'Medical Superintendent' && c.status === 'Open').forEach(c => {
      actionItems.push({ desc: "Complaint escalated to MS", dept: c.dept, since: "Today", priority: "🔴" });
    });
    // 4. Critical equipment down >8h
    tickets.filter(t => t.priority === 'Critical' && t.status === 'Open' && t.ageHours > 8).forEach(t => {
      actionItems.push({ desc: `Critical equipment down >8h: ${t.equipment}`, dept: t.dept, since: `${t.ageHours}h ago`, priority: "🟠" });
    });
    // 5. Doctor credential expired
    credentials.filter(cr => cr.days <= 0 && cr.designation.includes('Consultant')).forEach(cr => {
      actionItems.push({ desc: `Doctor credential expired: ${cr.name}`, dept: cr.designation, since: "Expired", priority: "🟠" });
    });
    // 6. Daily census uncertified
    if (census.status === 'Draft') {
      actionItems.push({ desc: "Daily census not certified (previous day)", dept: "Admin", since: "Due 10:00 AM", priority: "🟡" });
    }

    panel.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem;">
        <div>
          <h2 style="font-size:1.2rem; font-weight:800; color:#0f172a; margin:0;">MS Executive Dashboard</h2>
          <span style="font-size:0.75rem; color:#64748b;">Daily operational review &amp; Quality indicators</span>
        </div>
        <div>
          <button class="btn btn-primary btn-sm" onclick="window.renderHospMgmtSubTab('census')" style="background:#2563eb; color:#fff; border:none; padding:6px 12px; border-radius:6px; font-weight:600; cursor:pointer;">
            \${census.status === "Certified" ? "✓ Census Certified" : "✏️ Sign Today's Census"}
          </button>
        </div>
      </div>

      <!-- MS KPI CARDS -->
      <div class="mgmt-kpi-grid">
        <div class="mgmt-kpi-card" style="border-top: 4px solid ${occColor};">
          <span style="font-size:0.7rem; font-weight:700; color:#64748b; text-transform:uppercase;">Bed Occupancy %</span>
          <span class="mgmt-kpi-val">${occPct}%</span>
          <span style="font-size:0.65rem; color:#64748b;">${beds.occupied} / ${beds.total} Beds occupied</span>
        </div>
        <div class="mgmt-kpi-card">
          <span style="font-size:0.7rem; font-weight:700; color:#64748b; text-transform:uppercase;">IPD Active</span>
          <span class="mgmt-kpi-val">${census.inpatient.closing}</span>
          <span style="font-size:0.65rem; color:#64748b;">Current census active</span>
        </div>
        <div class="mgmt-kpi-card">
          <span style="font-size:0.7rem; font-weight:700; color:#64748b; text-transform:uppercase;">OPD Yesterday</span>
          <span class="mgmt-kpi-val">${census.opd.total}</span>
          <span style="font-size:0.65rem; color:#64748b;">New: ${census.opd.newReg} · Follow-up: ${census.opd.followUp}</span>
        </div>
        <div class="mgmt-kpi-card">
          <span style="font-size:0.7rem; font-weight:700; color:#64748b; text-transform:uppercase;">Deaths Yesterday</span>
          <span class="mgmt-kpi-val" style="color:#ef4444;">${census.inpatient.deaths}</span>
          <span style="font-size:0.65rem; color:#ef4444;">Expected: 1 · Unexpected: 1</span>
        </div>
        <div class="mgmt-kpi-card">
          <span style="font-size:0.7rem; font-weight:700; color:#64748b; text-transform:uppercase;">Complaints Open</span>
          <span class="mgmt-kpi-val">${complaints.filter(c=>c.status==='Open').length}</span>
          <span style="font-size:0.65rem; color:#ef4444;">Overdue SLA: ${complaints.filter(c=>c.status==='Open' && c.priority==='High').length}</span>
        </div>
        <div class="mgmt-kpi-card">
          <span style="font-size:0.7rem; font-weight:700; color:#64748b; text-transform:uppercase;">Incidents (Week)</span>
          <span class="mgmt-kpi-val">${incidents.length}</span>
          <span style="font-size:0.65rem; color:#ef4444;">Sentinel: ${incidents.filter(i=>i.severity==='Sentinel').length}</span>
        </div>
      </div>

      <!-- ITEMS NEEDING MS ACTION -->
      ${actionItems.length > 0 ? `
        <div class="mgmt-action-card" style="padding:0; overflow:hidden;">
          <div style="padding:0.85rem; border-bottom:1px solid #fecaca; display:flex; justify-content:space-between; align-items:center; cursor:pointer;" onclick="window.mgmtToggleAlerts()">
            <h4 style="margin:0; font-size:0.8rem; font-weight:800; color:#991b1b; text-transform:uppercase; letter-spacing:0.5px; display:flex; align-items:center; gap:6px;">
              🔴 Attention Required: Items needing MS Sign-off
              <span style="font-size:0.72rem; background:#fee2e2; color:#ef4444; padding:1px 6px; border-radius:10px; font-family:monospace;" class="mono">${actionItems.length}</span>
              <span id="mgmt-alerts-chevron" style="font-size:0.7rem; color:#94a3b8;">${window.mgmtAlertsExpanded ? '▲' : '▼'}</span>
            </h4>
          </div>
          <div id="mgmt-alerts-content" style="padding:0.85rem; ${window.mgmtAlertsExpanded ? '' : 'display:none;'}">
            <div style="display:flex; flex-direction:column; gap:6px;">
              ${actionItems.map(item => `
                <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #fecaca; padding:6px 0; font-size:0.78rem;">
                  <div style="display:flex; align-items:center; gap:8px;">
                    <span>${item.priority}</span>
                    <span style="font-weight:700; color:#1e293b;">${item.desc}</span>
                    <span style="font-size:0.7rem; background:#fee2e2; color:#991b1b; padding:1px 6px; border-radius:4px; font-weight:600;">${item.dept}</span>
                  </div>
                  <div style="display:flex; align-items:center; gap:10px;">
                    <span style="font-size:0.72rem; color:#64748b;">${item.since}</span>
                    <button class="btn btn-secondary btn-sm" onclick="alert('Viewing action item audit trail...')" style="padding:2px 8px; font-size:0.72rem; border-radius:4px;">Review</button>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      ` : ''}

      <!-- TWO COLUMN LOWER -->
      <div style="display:grid; grid-template-columns: 55% 45%; gap:1rem;">
        <!-- Left: Ward occupancy -->
        <div class="card" style="padding:12px; border:1px solid #cbd5e1; border-radius:8px;">
          <h4 style="font-size:0.75rem; font-weight:800; color:#475569; margin:0 0 10px 0; text-transform:uppercase; border-bottom:1px solid #e2e8f0; padding-bottom:4px;">Ward-wise Occupancy Roster</h4>
          <div style="display:flex; flex-direction:column; gap:8px;">
            ${beds.wards.map(w => {
              const pct = Math.round((w.occupied / w.total) * 100);
              return `
                <div style="font-size:0.76rem;">
                  <div style="display:flex; justify-content:space-between; margin-bottom:2px;">
                    <span style="font-weight:700; color:#334155;">${w.name}</span>
                    <span style="font-family:'JetBrains Mono',monospace; font-weight:700;">${w.occupied} / ${w.total} Beds (${pct}%)</span>
                  </div>
                  <div style="width:100%; height:8px; background:#f1f5f9; border-radius:4px; overflow:hidden;">
                    <div style="width:${pct}%; height:100%; background:${w.color}; border-radius:4px;"></div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <!-- Right: Census Numbers Summary -->
        <div class="card" style="padding:12px; border:1px solid #cbd5e1; border-radius:8px; display:flex; flex-direction:column; justify-content:space-between;">
          <div>
            <h4 style="font-size:0.75rem; font-weight:800; color:#475569; margin:0 0 10px 0; text-transform:uppercase; border-bottom:1px solid #e2e8f0; padding-bottom:4px;">Yesterday's Census Metrics</h4>
            <div style="display:flex; flex-direction:column; gap:6px; font-size:0.78rem;">
              <div style="display:flex; justify-content:space-between;"><span>New Admissions:</span> <b style="font-family:'JetBrains Mono',monospace;">${census.inpatient.admissions}</b></div>
              <div style="display:flex; justify-content:space-between;"><span>Clinical Discharges:</span> <b style="font-family:'JetBrains Mono',monospace;">${census.inpatient.discharges}</b></div>
              <div style="display:flex; justify-content:space-between;"><span>Mortalities:</span> <b style="font-family:'JetBrains Mono',monospace; color:#ef4444;">${census.inpatient.deaths}</b></div>
              <div style="display:flex; justify-content:space-between;"><span>Emergency Registrations:</span> <b style="font-family:'JetBrains Mono',monospace;">${census.emergency.total}</b></div>
              <div style="display:flex; justify-content:space-between;"><span>Active MLC Inquests:</span> <b style="font-family:'JetBrains Mono',monospace; color:#9333ea;">${census.emergency.mlc}</b></div>
              <div style="display:flex; justify-content:space-between;"><span>Brought Dead (BD):</span> <b style="font-family:'JetBrains Mono',monospace;">${census.emergency.bd}</b></div>
              <div style="display:flex; justify-content:space-between;"><span>Completed OT Procedures:</span> <b style="font-family:'JetBrains Mono',monospace;">${census.surgeries.total}</b></div>
            </div>
          </div>
          <button class="btn btn-secondary btn-sm" onclick="window.renderHospMgmtSubTab('census')" style="width:100%; border:1px solid #cbd5e1; background:#ffffff; font-weight:600; cursor:pointer; margin-top:8px;">View Full daily Census</button>
        </div>
      </div>
    `;
  }
  window.renderMSDashboard = renderMSDashboard;

  // ========================================================================
  // PERSONA 2: HR MANAGER DASHBOARD
  // ========================================================================
  function renderHRDashboard(panel) {
    const state = window.state || {};
    const absentees = state.mgmtAbsentees || [];
    const leaves = state.mgmtLeaves || [];
    const credentials = state.mgmtCredentials || [];

    panel.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem;">
        <div>
          <h2 style="font-size:1.2rem; font-weight:800; color:#0f172a; margin:0;">HR Manager Workspace</h2>
          <span style="font-size:0.75rem; color:#64748b;">Daily attendance, rosters &amp; staff credential logs</span>
        </div>
      </div>

      <!-- KPI CARDS -->
      <div class="mgmt-kpi-grid">
        <div class="mgmt-kpi-card">
          <span style="font-size:0.7rem; font-weight:700; color:#64748b; text-transform:uppercase;">Present Today</span>
          <span class="mgmt-kpi-val">112 / 120</span>
          <span style="font-size:0.65rem; color:#64748b;">Registered shift staff</span>
        </div>
        <div class="mgmt-kpi-card" style="border-top: 4px solid #ef4444;">
          <span style="font-size:0.7rem; font-weight:700; color:#64748b; text-transform:uppercase;">Absent Unplanned</span>
          <span class="mgmt-kpi-val" style="color:#ef4444;">${absentees.filter(a=>a.type==='Absent').length}</span>
          <span style="font-size:0.65rem; color:#ef4444;">Requires floor cover</span>
        </div>
        <div class="mgmt-kpi-card">
          <span style="font-size:0.7rem; font-weight:700; color:#64748b; text-transform:uppercase;">Leave Requests</span>
          <span class="mgmt-kpi-val">${leaves.length}</span>
          <span style="font-size:0.65rem; color:#64748b;">Pending HR review</span>
        </div>
        <div class="mgmt-kpi-card" style="border-top: 4px solid #f59e0b;">
          <span style="font-size:0.7rem; font-weight:700; color:#64748b; text-transform:uppercase;">Credentials Expiring</span>
          <span class="mgmt-kpi-val" style="color:#f59e0b;">${credentials.filter(c=>c.days<=30).length}</span>
          <span style="font-size:0.65rem; color:#f59e0b;">Renewal due &le;30 days</span>
        </div>
      </div>

      <!-- LOWER GRID -->
      <div style="display:grid; grid-template-columns: 1fr 1fr; gap:1rem; margin-bottom:1rem;">
        
        <!-- Left: Today's absentees -->
        <div class="card" style="padding:12px; border:1px solid #cbd5e1; border-radius:8px;">
          <h4 style="font-size:0.75rem; font-weight:800; color:#475569; margin:0 0 8px 0; text-transform:uppercase; border-bottom:1px solid #e2e8f0; padding-bottom:4px;">Today's Floor Absentees</h4>
          <table class="custom-tbl" style="width:100%; border-collapse:collapse;">
            <thead>
              <tr>
                <th>Staff Name</th>
                <th>Dept</th>
                <th>Type</th>
                <th style="text-align:right;">Action</th>
              </tr>
            </thead>
            <tbody>
              ${absentees.map(a => `
                <tr>
                  <td style="font-weight:700;">${a.name}</td>
                  <td>${a.dept}</td>
                  <td>
                    <span class="badge ${a.type==='Absent'?'b-re':'b-sl'}" style="font-size:0.65rem; padding:1px 6px;">${a.type}</span>
                  </td>
                  <td style="text-align:right;">
                    <button class="btn btn-secondary btn-sm" onclick="window.triggerHrCover('${a.name}')" style="padding:2px 6px; font-size:0.7rem; border-radius:4px; border:1px solid #cbd5e1;">Arrange Cover</button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <!-- Right: Pending Leave requests -->
        <div class="card" style="padding:12px; border:1px solid #cbd5e1; border-radius:8px;">
          <h4 style="font-size:0.75rem; font-weight:800; color:#475569; margin:0 0 8px 0; text-transform:uppercase; border-bottom:1px solid #e2e8f0; padding-bottom:4px;">Pending Leaves</h4>
          <table class="custom-tbl" style="width:100%; border-collapse:collapse;">
            <thead>
              <tr>
                <th>Staff</th>
                <th>Dates</th>
                <th>Type</th>
                <th style="text-align:right;">Action</th>
              </tr>
            </thead>
            <tbody>
              ${leaves.map(l => `
                <tr>
                  <td style="font-weight:700;">${l.name}</td>
                  <td style="font-size:0.72rem; font-family:'JetBrains Mono',monospace;">${l.dates}</td>
                  <td><span class="badge b-sl" style="font-size:0.65rem; padding:1px 6px;">${l.type}</span></td>
                  <td style="text-align:right; white-space:nowrap;">
                    <button class="btn btn-primary btn-sm" onclick="window.approveLeaveRequest('${l.name}')" style="padding:2px 6px; font-size:0.7rem; background:#10b981; color:#fff; border:none; border-radius:4px; cursor:pointer;">Approve</button>
                    <button class="btn btn-secondary btn-sm" onclick="window.rejectLeaveRequest('${l.name}')" style="padding:2px 6px; font-size:0.7rem; border-radius:4px; border:1px solid #cbd5e1; cursor:pointer;">Reject</button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Bottom: Credential Alerts -->
      <div class="card" style="padding:12px; border:1px solid #cbd5e1; border-radius:8px;">
        <h4 style="font-size:0.75rem; font-weight:800; color:#475569; margin:0 0 8px 0; text-transform:uppercase; border-bottom:1px solid #e2e8f0; padding-bottom:4px;">Credential Alerts (&le;30 Days Expiry)</h4>
        <table class="custom-tbl" style="width:100%; border-collapse:collapse;">
          <thead>
            <tr>
              <th>Emp ID</th>
              <th>Name</th>
              <th>Designation</th>
              <th>Credential Type</th>
              <th>Expiry</th>
              <th style="text-align:right;">Action</th>
            </tr>
          </thead>
          <tbody>
            ${credentials.map(c => `
              <tr style="${c.days <= 0 ? 'background:#fff5f5;' : ''}">
                <td style="font-family:'JetBrains Mono',monospace;">${c.id}</td>
                <td style="font-weight:700;">${c.name}</td>
                <td>${c.designation}</td>
                <td>${c.type}</td>
                <td style="font-family:'JetBrains Mono',monospace; color:${c.days<=0?'#ef4444':'#f59e0b'}; font-weight:700;">${c.expiry}</td>
                <td style="text-align:right;">
                  <button class="btn btn-secondary btn-sm" onclick="alert('Notification sent to ${c.name}')" style="padding:2px 6px; font-size:0.7rem; border-radius:4px; border:1px solid #cbd5e1;">Send Reminder</button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;

    window.triggerHrCover = function(name) {
      const cover = prompt(`Enter free text cover arrangement note for ${name}:`);
      if (cover) {
        alert(`Roster cover arrangement logged: "${cover}". SMS notification dispatched.`);
      }
    };

    window.approveLeaveRequest = function(name) {
      const state = window.state || {};
      state.mgmtLeaves = state.mgmtLeaves.filter(l => l.name !== name);
      alert(`Leave approved. Roster updated.`);
      window.switchHospMgmtRole('HR Manager');
    };

    window.rejectLeaveRequest = function(name) {
      const reason = prompt("Enter mandatory rejection reason:");
      if (!reason) {
        alert("Rejection reason is mandatory.");
        return;
      }
      const state = window.state || {};
      state.mgmtLeaves = state.mgmtLeaves.filter(l => l.name !== name);
      alert(`Leave request rejected. Reason logged.`);
      window.switchHospMgmtRole('HR Manager');
    };
  }
  window.renderHRDashboard = renderHRDashboard;

  // ========================================================================
  // PERSONA 3: QUALITY MANAGER DASHBOARD
  // ========================================================================
  function renderQualityDashboard(panel) {
    const state = window.state || {};
    const incidents = state.mgmtIncidents || [];
    const complaints = state.mgmtComplaints || [];
    const indicators = state.mgmtIndicators || [];

    panel.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem;">
        <div>
          <h2 style="font-size:1.2rem; font-weight:800; color:#0f172a; margin:0;">Quality &amp; NABH Management</h2>
          <span style="font-size:0.75rem; color:#64748b;">Incident oversight, patient grievances &amp; KPI thresholds</span>
        </div>
      </div>

      <!-- KPI CARDS -->
      <div class="mgmt-kpi-grid">
        <div class="mgmt-kpi-card">
          <span style="font-size:0.7rem; font-weight:700; color:#64748b; text-transform:uppercase;">Open Incidents</span>
          <span class="mgmt-kpi-val">${incidents.filter(i=>i.status==='Open').length}</span>
          <span style="font-size:0.65rem; color:#64748b;">Under clinical investigation</span>
        </div>
        <div class="mgmt-kpi-card">
          <span style="font-size:0.7rem; font-weight:700; color:#64748b; text-transform:uppercase;">Complaints Open</span>
          <span class="mgmt-kpi-val">${complaints.filter(c=>c.status==='Open').length}</span>
          <span style="font-size:0.65rem; color:#ef4444;">SLA Breached: ${complaints.filter(c=>c.status==='Open' && c.priority==='High').length}</span>
        </div>
        <div class="mgmt-kpi-card" style="border-top: 4px solid #ef4444;">
          <span style="font-size:0.7rem; font-weight:700; color:#64748b; text-transform:uppercase;">Below Target KPIs</span>
          <span class="mgmt-kpi-val" style="color:#ef4444;">${indicators.filter(ind=>ind.status==='Below target').length}</span>
          <span style="font-size:0.65rem; color:#ef4444;">Fails threshold</span>
        </div>
        <div class="mgmt-kpi-card">
          <span style="font-size:0.7rem; font-weight:700; color:#64748b; text-transform:uppercase;">NABH Action Items</span>
          <span class="mgmt-kpi-val">2</span>
          <span style="font-size:0.65rem; color:#64748b;">Due this month</span>
        </div>
      </div>

      <!-- ACTION LIST -->
      <div class="card" style="padding:12px; border:1px solid #cbd5e1; border-radius:8px;">
        <h4 style="font-size:0.75rem; font-weight:800; color:#475569; margin:0 0 10px 0; text-transform:uppercase; border-bottom:1px solid #e2e8f0; padding-bottom:4px;">Pending Action Items</h4>
        <div style="display:flex; flex-direction:column; gap:6px; font-size:0.78rem;">
          <div style="display:flex; justify-content:space-between; align-items:center; padding:8px 0; border-bottom:1px solid #f1f5f9;">
            <div>
              <span style="font-weight:700; color:#0f172a;">New Incidents requiring Quality investigation:</span>
              <span style="color:#64748b;">${incidents.filter(i=>i.status==='Open').length} open reports</span>
            </div>
            <button class="btn btn-primary btn-sm" onclick="window.renderHospMgmtSubTab('incidents')" style="padding:4px 8px; font-size:0.72rem; border-radius:4px;">Review</button>
          </div>
          <div style="display:flex; justify-content:space-between; align-items:center; padding:8px 0; border-bottom:1px solid #f1f5f9;">
            <div>
              <span style="font-weight:700; color:#ef4444;">Patient complaints breached SLA thresholds:</span>
              <span style="color:#64748b;">Auto-escalated to Medical Superintendent</span>
            </div>
            <button class="btn btn-secondary btn-sm" onclick="window.renderHospMgmtSubTab('complaints')" style="padding:4px 8px; font-size:0.72rem; border-radius:4px; border:1px solid #cbd5e1;">Escalate</button>
          </div>
          <div style="display:flex; justify-content:space-between; align-items:center; padding:8px 0;">
            <div>
              <span style="font-weight:700; color:#0f172a;">NABH indicators due for monthly data entry:</span>
              <span style="color:#64748b;">June 2026 logs pending</span>
            </div>
            <button class="btn btn-secondary btn-sm" onclick="window.renderHospMgmtSubTab('indicators')" style="padding:4px 8px; font-size:0.72rem; border-radius:4px; border:1px solid #cbd5e1;">Enter Data</button>
          </div>
        </div>
      </div>
    `;
  }
  window.renderQualityDashboard = renderQualityDashboard;

  // ========================================================================
  // PERSONA 4: FACILITY MANAGER DASHBOARD
  // ========================================================================
  function renderFacilityDashboard(panel) {
    const state = window.state || {};
    const tickets = state.mgmtTickets || [];
    const pm = state.mgmtPmSchedules || [];
    const utils = state.mgmtUtilities || { generator: "On Mains", o2Supply: "Adequate" };

    panel.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem;">
        <div>
          <h2 style="font-size:1.2rem; font-weight:800; color:#0f172a; margin:0;">Facility &amp; Biomedical Support</h2>
          <span style="font-size:0.75rem; color:#64748b;">Breakdown tickets, PM logs, Utilities &amp; BMW logs</span>
        </div>
      </div>

      <!-- KPI CARDS -->
      <div class="mgmt-kpi-grid">
        <div class="mgmt-kpi-card" style="border-top: 4px solid #ef4444;">
          <span style="font-size:0.7rem; font-weight:700; color:#64748b; text-transform:uppercase;">Open Tickets</span>
          <span class="mgmt-kpi-val" style="color:#ef4444;">${tickets.filter(t=>t.status==='Open').length}</span>
          <span style="font-size:0.65rem; color:#ef4444;">Critical breakdown: ${tickets.filter(t=>t.priority==='Critical').length}</span>
        </div>
        <div class="mgmt-kpi-card" style="border-top: 4px solid #f59e0b;">
          <span style="font-size:0.7rem; font-weight:700; color:#64748b; text-transform:uppercase;">PM Due Today</span>
          <span class="mgmt-kpi-val" style="color:#f59e0b;">${pm.filter(p=>p.status==='Due today').length}</span>
          <span style="font-size:0.65rem; color:#f59e0b;">Overdue PMs: ${pm.filter(p=>p.status==='Overdue').length}</span>
        </div>
        <div class="mgmt-kpi-card">
          <span style="font-size:0.7rem; font-weight:700; color:#64748b; text-transform:uppercase;">Generator Status</span>
          <span class="mgmt-kpi-val" style="font-size:1.15rem; color:#10b981;">✓ ${utils.generator}</span>
          <span style="font-size:0.65rem; color:#64748b;">Biweekly load test complete</span>
        </div>
        <div class="mgmt-kpi-card">
          <span style="font-size:0.7rem; font-weight:700; color:#64748b; text-transform:uppercase;">O2 Pipeline Supply</span>
          <span class="mgmt-kpi-val" style="font-size:1.15rem; color:#10b981;">✓ ${utils.o2Supply}</span>
          <span style="font-size:0.65rem; color:#64748b;">Pressure parameters normal</span>
        </div>
      </div>

      <!-- LOWER AREA -->
      <div style="display:grid; grid-template-columns: 60% 40%; gap:1rem;">
        
        <!-- Left: Critical breakdowns -->
        <div class="card" style="padding:12px; border:1px solid #cbd5e1; border-radius:8px;">
          <h4 style="font-size:0.75rem; font-weight:800; color:#475569; margin:0 0 8px 0; text-transform:uppercase; border-bottom:1px solid #e2e8f0; padding-bottom:4px;">🚨 Critical breakdowns (OT / ICU)</h4>
          <table class="custom-tbl" style="width:100%; border-collapse:collapse;">
            <thead>
              <tr>
                <th>Equipment</th>
                <th>Location</th>
                <th>Assigned To</th>
                <th style="text-align:right;">Action</th>
              </tr>
            </thead>
            <tbody>
              ${tickets.filter(t => t.priority === 'Critical').map(t => `
                <tr style="${t.status === 'Open' ? 'background:#fff5f5;' : ''}">
                  <td style="font-weight:700;">${t.equipment}</td>
                  <td>${t.dept}</td>
                  <td>
                    <span style="font-family:'JetBrains Mono',monospace; font-weight:600; color:${t.assignedTo==='Unassigned'?'#ef4444':'#334155'};">
                      ${t.assignedTo}
                    </span>
                  </td>
                  <td style="text-align:right;">
                    <button class="btn btn-secondary btn-sm" onclick="window.renderHospMgmtSubTab('tickets')" style="padding:2px 6px; font-size:0.7rem; border-radius:4px; border:1px solid #cbd5e1;">View Ticket</button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <!-- Right: PM due today -->
        <div class="card" style="padding:12px; border:1px solid #cbd5e1; border-radius:8px;">
          <h4 style="font-size:0.75rem; font-weight:800; color:#475569; margin:0 0 8px 0; text-transform:uppercase; border-bottom:1px solid #e2e8f0; padding-bottom:4px;">PM Due Today</h4>
          <div style="display:flex; flex-direction:column; gap:6px; font-size:0.78rem;">
            ${pm.filter(p=>p.status==='Due today' || p.status==='Overdue').map(p=>`
              <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #f1f5f9; padding-bottom:4px;">
                <div>
                  <span style="font-weight:700; color:#334155;">${p.equipment}</span>
                  <div style="font-size:0.68rem; color:#64748b;">Dept: ${p.dept} · Status: <span style="font-weight:700; color:#ef4444;">${p.status}</span></div>
                </div>
                <button class="btn btn-secondary btn-sm" onclick="window.markPmDone('${p.equipment}')" style="padding:2px 8px; font-size:0.72rem; border-radius:4px; border:1px solid #cbd5e1;">Mark Done</button>
              </div>
            `).join('')}
          </div>
        </div>

      </div>
    `;

    window.markPmDone = function(name) {
      const obs = prompt("Enter PM observations:");
      if (obs !== null) {
        const state = window.state || {};
        const pItem = state.mgmtPmSchedules.find(p=>p.equipment === name);
        pItem.status = "Done";
        pItem.lastDone = "27-Jun-2026";
        alert("Preventive maintenance marked complete.");
        window.switchHospMgmtRole('Facility Manager');
      }
    };
  }
  window.renderFacilityDashboard = renderFacilityDashboard;

  // ========================================================================
  // SUB-TAB 2: DAILY CENSUS (Standard Indian Format)
  // ========================================================================
  function renderDailyCensusTab(panel) {
    const state = window.state || {};
    const census = state.mgmtCensus || {};
    const activeRole = window.activeHospMgmtRole || 'Medical Superintendent';

    panel.innerHTML = `
      <div class="card" style="padding:1.5rem; border:1px solid #cbd5e1; border-radius:12px; background:#ffffff; box-shadow:0 4px 6px -1px rgba(0,0,0,0.05);">
        <div style="display:flex; justify-content:space-between; align-items:center; border-bottom: 2px solid #cbd5e1; padding-bottom:10px; margin-bottom:1rem;">
          <div>
            <h3 style="font-size:1.15rem; font-weight:800; color:#0f172a; margin:0;">Saronil Hospital Daily Census</h3>
            <span style="font-size:0.75rem; color:#64748b; font-family:'JetBrains Mono',monospace;">Date: ${census.date} | Status: <b style="color:${census.status==='Certified'?'#10b981':'#f59e0b'};">${census.status}</b></span>
          </div>
          <div style="display:flex; gap:0.5rem;">
            <button class="btn btn-secondary btn-sm" onclick="window.printCensusReport()" style="border:1px solid #cbd5e1; background:#ffffff; font-weight:600; cursor:pointer; height:34px; padding:0 12px; border-radius:6px;">Print A4 Layout</button>
            ${activeRole === 'Medical Superintendent' && census.status === 'Draft' ? `
              <button class="btn btn-primary btn-sm" onclick="window.certifyCensusReport()" style="background:#10b981; color:#fff; border:none; font-weight:600; cursor:pointer; height:34px; padding:0 12px; border-radius:6px;">Certify Census</button>
            ` : ''}
          </div>
        </div>

        <div style="font-size:0.8rem; display:flex; flex-direction:column; gap:1.25rem;">
          <!-- A. INPATIENT METRICS -->
          <div>
            <h5 style="font-weight:800; color:#1e293b; border-bottom:1px solid #e2e8f0; padding-bottom:2px; margin:0 0 6px 0; text-transform:uppercase;">I. Inpatient Admission / Discharge Statistics</h5>
            <div style="display:grid; grid-template-columns: repeat(4, 1fr); gap:12px; text-align:center;">
              <div style="border:1px solid #e2e8f0; padding:6px; border-radius:6px;">
                <div style="font-size:0.7rem; color:#64748b;">Opening Census</div>
                <div style="font-family:'JetBrains Mono',monospace; font-size:1.2rem; font-weight:700;">${census.inpatient.opening}</div>
              </div>
              <div style="border:1px solid #e2e8f0; padding:6px; border-radius:6px;">
                <div style="font-size:0.7rem; color:#64748b;">New Admissions</div>
                <div style="font-family:'JetBrains Mono',monospace; font-size:1.2rem; font-weight:700; color:#2563eb;">+${census.inpatient.admissions}</div>
              </div>
              <div style="border:1px solid #e2e8f0; padding:6px; border-radius:6px;">
                <div style="font-size:0.7rem; color:#64748b;">Discharges</div>
                <div style="font-family:'JetBrains Mono',monospace; font-size:1.2rem; font-weight:700; color:#10b981;">-${census.inpatient.discharges}</div>
              </div>
              <div style="border:1px solid #e2e8f0; padding:6px; border-radius:6px;">
                <div style="font-size:0.7rem; color:#64748b;">Closing Census</div>
                <div style="font-family:'JetBrains Mono',monospace; font-size:1.2rem; font-weight:700; color:#0f172a;">${census.inpatient.closing}</div>
              </div>
            </div>
          </div>

          <!-- B. WARD OCCUPANCY TABLE -->
          <div>
            <h5 style="font-weight:800; color:#1e293b; border-bottom:1px solid #e2e8f0; padding-bottom:2px; margin:0 0 6px 0; text-transform:uppercase;">II. Ward Occupancy Matrix</h5>
            <table style="width:100%; border-collapse:collapse; text-align:left;">
              <thead>
                <tr style="border-bottom:2px solid #cbd5e1; color:#64748b; font-size:0.7rem; text-transform:uppercase;">
                  <th style="padding:4px;">Ward Name</th>
                  <th style="padding:4px;">Opening</th>
                  <th style="padding:4px;">Admitted</th>
                  <th style="padding:4px;">Discharged</th>
                  <th style="padding:4px;">Deaths</th>
                  <th style="padding:4px;">Closing</th>
                  <th style="padding:4px;">Total Capacity</th>
                  <th style="padding:4px; text-align:right;">Occupancy %</th>
                </tr>
              </thead>
              <tbody>
                <tr style="border-bottom:1px solid #f1f5f9;">
                  <td style="padding:6px 4px; font-weight:700;">General Ward Male</td>
                  <td>20</td>
                  <td>4</td>
                  <td>2</td>
                  <td>0</td>
                  <td style="font-weight:700;">22</td>
                  <td>30</td>
                  <td style="text-align:right; font-family:'JetBrains Mono',monospace;">73%</td>
                </tr>
                <tr style="border-bottom:1px solid #f1f5f9;">
                  <td style="padding:6px 4px; font-weight:700;">General Ward Female</td>
                  <td>25</td>
                  <td>3</td>
                  <td>2</td>
                  <td>0</td>
                  <td style="font-weight:700;">26</td>
                  <td>30</td>
                  <td style="text-align:right; font-family:'JetBrains Mono',monospace;">86%</td>
                </tr>
                <tr style="border-bottom:1px solid #f1f5f9;">
                  <td style="padding:6px 4px; font-weight:700;">ICU</td>
                  <td>13</td>
                  <td>3</td>
                  <td>1</td>
                  <td>1</td>
                  <td style="font-weight:700;">14</td>
                  <td>15</td>
                  <td style="text-align:right; font-family:'JetBrains Mono',monospace; color:#ef4444; font-weight:700;">93%</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- C. OPD / EMERGENCY OUTPATIENT LOGS -->
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:1.25rem;">
            <div>
              <h5 style="font-weight:800; color:#1e293b; border-bottom:1px solid #e2e8f0; padding-bottom:2px; margin:0 0 6px 0; text-transform:uppercase;">III. OPD Consultations</h5>
              <div style="display:flex; justify-content:space-between; font-size:0.78rem; margin-bottom:4px;">
                <span>Total OPD Consults:</span>
                <b style="font-family:'JetBrains Mono',monospace;">${census.opd.total}</b>
              </div>
              <div style="display:flex; justify-content:space-between; font-size:0.78rem; margin-bottom:4px;">
                <span>New Registrations:</span>
                <b style="font-family:'JetBrains Mono',monospace;">${census.opd.newReg}</b>
              </div>
              <div style="display:flex; justify-content:space-between; font-size:0.78rem;">
                <span>Follow-ups:</span>
                <b style="font-family:'JetBrains Mono',monospace;">${census.opd.followUp}</b>
              </div>
            </div>

            <div>
              <h5 style="font-weight:800; color:#1e293b; border-bottom:1px solid #e2e8f0; padding-bottom:2px; margin:0 0 6px 0; text-transform:uppercase;">IV. Emergency Casualty Log</h5>
              <div style="display:flex; justify-content:space-between; font-size:0.78rem; margin-bottom:4px;">
                <span>Casualty Admissions:</span>
                <b style="font-family:'JetBrains Mono',monospace;">${census.emergency.total}</b>
              </div>
              <div style="display:flex; justify-content:space-between; font-size:0.78rem; margin-bottom:4px;">
                <span>Medico-Legal Cases (MLC):</span>
                <b style="font-family:'JetBrains Mono',monospace; color:#9333ea;">${census.emergency.mlc}</b>
              </div>
              <div style="display:flex; justify-content:space-between; font-size:0.78rem;">
                <span>Brought Dead (BD):</span>
                <b style="font-family:'JetBrains Mono',monospace;">${census.emergency.bd}</b>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    window.printCensusReport = function() {
      window.print();
    };

    window.certifyCensusReport = function() {
      const state = window.state || {};
      state.mgmtCensus.status = "Certified";
      state.mgmtCensus.certifiedBy = "Dr. Amit Verma";
      state.mgmtCensus.certifiedTime = "10:30 AM";
      alert(`Daily census certified and locked for NABL record audit.`);
      window.renderHospMgmtSubTab('census');
    };
  }

  // ========================================================================
  // SUB-TAB 3: ATTENDANCE & LEAVE
  // ========================================================================
  function renderAttendanceTab(panel) {
    const state = window.state || {};
    const leaves = state.mgmtLeaves || [];

    panel.innerHTML = `
      <div style="margin-bottom:10px; display:flex; justify-content:space-between; align-items:center;">
        <h4 style="font-size:0.8rem; font-weight:700; text-transform:uppercase; color:#64748b; margin:0;">Staff Attendance Directory</h4>
        <button class="btn btn-secondary btn-sm" onclick="alert('Exported roster attendance Excel logs')" style="padding:4px 8px; border:1px solid #cbd5e1; background:#ffffff;">Export to Excel</button>
      </div>

      <div class="card" style="padding:10px; border:1px solid #cbd5e1; border-radius:8px;">
        <table class="custom-tbl" style="width:100%;">
          <thead>
            <tr>
              <th>Emp ID</th>
              <th>Name</th>
              <th>Dept</th>
              <th>Shift</th>
              <th>Status</th>
              <th style="text-align:right;">Remarks</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="font-family:'JetBrains Mono',monospace;">EMP-00481</td>
              <td style="font-weight:700;">Dr. Ramesh Kumar</td>
              <td>Cardiology</td>
              <td>Morning Shift</td>
              <td><span class="badge b-gr" style="font-size:0.65rem; padding:1px 6px;">Present</span></td>
              <td style="text-align:right;">Biometric logged 08:52 AM</td>
            </tr>
            <tr>
              <td style="font-family:'JetBrains Mono',monospace;">EMP-00921</td>
              <td style="font-weight:700;">Staff Nurse Priya</td>
              <td>ICU</td>
              <td>Morning Shift</td>
              <td><span class="badge b-re" style="font-size:0.65rem; padding:1px 6px;">Absent</span></td>
              <td style="text-align:right; color:#ef4444; font-weight:700;">Unplanned absence</td>
            </tr>
          </tbody>
        </table>
      </div>
    `;
  }

  // ========================================================================
  // SUB-TAB 4: DUTY ROSTER Mon-Sun Grid
  // ========================================================================
  function renderDutyRosterTab(panel) {
    const role = window.activeHospMgmtRole || 'Medical Superintendent';
    
    // Access control variables
    const canBuild = (role === 'Hospital Administrator' || role === 'Medical Superintendent' || role === 'HR Manager' || role === 'Nursing Supervisor');
    const isDeptHead = (role === 'Department Head');
    const isNursingSupervisor = (role === 'Nursing Supervisor');
    const isClinicalStaff = (role === 'Clinical Staff');
    
    // Set filters based on role restrictions
    let filterDept = window.rosterFilterDept || 'All';
    let filterStaffType = window.rosterFilterStaffType || 'Both';
    
    if (isDeptHead) {
      filterDept = 'Cardiology'; // Own department only
    } else if (isNursingSupervisor) {
      filterStaffType = 'Nurses'; // Nursing staff only
    }
    
    // Date Calculations
    const mondayStr = window.activeRosterStartDate;
    const mondayDate = new Date(mondayStr);
    const weekDates = [];
    const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    
    for (let i = 0; i < 7; i++) {
      const d = new Date(mondayDate);
      d.setDate(mondayDate.getDate() + i);
      weekDates.push(d.toISOString().slice(0, 10));
    }
    
    // Get list of staff to display
    let staff = window.state.staffList || [];
    
    if (isClinicalStaff) {
      // Individual Doctor is default for demonstration
      staff = staff.filter(s => s.id === 'DOC01');
    } else {
      if (filterStaffType === 'Doctors') staff = staff.filter(s => s.type === 'Doctor');
      else if (filterStaffType === 'Nurses') staff = staff.filter(s => s.type === 'Nurse');
      
      if (filterDept !== 'All') staff = staff.filter(s => s.department === filterDept);
    }
    
    // If there is an active staff filter from the listing click
    if (window.activeRosterStaffFilter) {
      staff = staff.filter(s => s.id === window.activeRosterStaffFilter);
    }
    
    // Initialize rosterShifts if missing
    if (!window.state.rosterShifts) {
      window.state.rosterShifts = [];
      const staffListForSeeding = window.state.staffList || [];
      const seedMonday = new Date(mondayDate);
      staffListForSeeding.forEach((s, sIdx) => {
        for (let i = 0; i < 14; i++) {
          const d = new Date(seedMonday);
          d.setDate(seedMonday.getDate() + i);
          const dateStr = d.toISOString().slice(0, 10);
          
          let shift = 'Morning';
          if (i % 7 === 6) shift = 'Off';
          else if (sIdx % 3 === 1) shift = (i % 3 === 0 ? 'Evening' : (i % 3 === 1 ? 'Night' : 'Morning'));
          else if (sIdx % 3 === 2) shift = (i % 2 === 0 ? 'Morning' : 'Evening');
          
          if (s.statusToday === 'On Leave' && dateStr === window._HIS_DATE(0)) {
            shift = 'Leave';
          }
          
          window.state.rosterShifts.push({
            staffId: s.id,
            date: dateStr,
            shift,
            location: s.type === 'Doctor' ? s.department : s.ward,
            notes: ''
          });
        }
      });
    }

    // Build calendar header columns
    const headerCols = weekDates.map((dateStr, i) => {
      const dateObj = new Date(dateStr);
      const dayNum = dateObj.getDate();
      const monthStr = dateObj.toLocaleString('en-US', { month: 'short' });
      const isToday = dateStr === window._HIS_DATE(0) ? 'background:#dbeafe; color:#1e40af; border-radius:4px; padding:2px 4px;' : '';
      return `<th style="text-align:center; min-width:90px;">
        <span style="font-size:0.65rem; color:#64748b; font-weight:700;">${weekdays[i]}</span><br>
        <span style="font-size:0.85rem; font-weight:800; ${isToday}">${dayNum} ${monthStr}</span>
      </th>`;
    }).join('');

    // Compute coverage gaps for this week
    const gaps = [];
    const checkGaps = ['ICU', 'General Ward (Male)', 'General Ward (Female)', 'Cardiology', 'Pediatrics'];
    const shiftsToCheck = ['Morning', 'Evening', 'Night'];
    
    weekDates.forEach(dateStr => {
      checkGaps.forEach(loc => {
        shiftsToCheck.forEach(sh => {
          const assigned = (window.state.rosterShifts || []).filter(r => r.date === dateStr && r.shift === sh && r.location === loc);
          const nurseCount = assigned.filter(a => {
            const s = (window.state.staffList || []).find(st => st.id === a.staffId);
            return s && s.type === 'Nurse';
          }).length;
          const docCount = assigned.filter(a => {
            const s = (window.state.staffList || []).find(st => st.id === a.staffId);
            return s && s.type === 'Doctor';
          }).length;
          
          if (loc === 'ICU') {
            if (nurseCount < 2) gaps.push({ date: dateStr, location: loc, shift: sh, msg: `${2 - nurseCount} nurse short`, type: 'Nurse' });
            if (docCount < 1) gaps.push({ date: dateStr, location: loc, shift: sh, msg: `Dr. unavailable — no backup`, type: 'Doctor' });
          } else {
            if (nurseCount < 1) gaps.push({ date: dateStr, location: loc, shift: sh, msg: `1 nurse short`, type: 'Nurse' });
            if (docCount < 1 && (loc === 'Cardiology' || loc === 'Pediatrics')) {
              gaps.push({ date: dateStr, location: loc, shift: sh, msg: `Dr. unavailable — no backup`, type: 'Doctor' });
            }
          }
        });
      });
    });

    panel.innerHTML = `
      <style>
        .roster-grid-layout { display: grid; grid-template-columns: 1fr 280px; gap: 14px; min-width: 1000px; }
        .roster-header-bar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
        .roster-nav { display: flex; align-items: center; gap: 8px; font-weight: 700; font-size: 0.82rem; }
        .roster-btn { border: 1px solid #cbd5e1; background: #ffffff; padding: 4px 10px; border-radius: 4px; font-weight: 600; cursor: pointer; font-size: 0.76rem; }
        .roster-btn:hover { background: #f8fafc; }
        .roster-filter-row { background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 8px 12px; display: flex; gap: 10px; align-items: center; margin-bottom: 12px; }
        .shift-block { padding: 4px 6px; border-radius: 4px; font-size: 0.72rem; font-weight: 700; text-align: center; color: #ffffff; cursor: pointer; min-height: 38px; display: flex; flex-direction: column; justify-content: center; position: relative; }
        .shift-block:hover { transform: scale(1.02); transition: transform 0.1s; }
        .shift-m { background: #2563eb; border: 1px solid #1d4ed8; } /* Morning */
        .shift-e { background: #f59e0b; border: 1px solid #d97706; } /* Evening */
        .shift-n { background: #7c3aed; border: 1px solid #6d28d9; } /* Night */
        .shift-fd { background: #10b981; border: 1px solid #059669; } /* Full day */
        .shift-off { background: #f1f5f9; border: 1px dashed #cbd5e1; color: #64748b; }
        .shift-leave { background: repeating-linear-gradient(45deg, #fee2e2, #fee2e2 10px, #fca5a5 10px, #fca5a5 20px); border: 1px solid #ef4444; color: #991b1b; }
        .shift-oncall { background: #14b8a6; border: 1px solid #0d9488; }
        .shift-lock { position: absolute; top: 2px; right: 2px; font-size: 0.65rem; }
        .gap-sidebar { background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; display: flex; flex-direction: column; overflow-y: auto; max-height: calc(100vh - 160px); }
        .gap-card { background: #fff5f5; border: 1px solid #fee2e2; border-left: 4px solid #ef4444; padding: 8px; border-radius: 4px; margin-bottom: 8px; font-size: 0.74rem; text-align: left; }
        .gap-card strong { color: #991b1b; display: block; margin-bottom: 2px; }
        .popover-form { background: #ffffff; border: 1px solid #cbd5e1; border-radius: 6px; padding: 10px; width: 220px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); position: absolute; z-index: 9999; }
      </style>
      
      <div class="roster-header-bar">
        <div style="display:flex; align-items:center; gap:12px;">
          <h4 style="font-size:0.85rem; font-weight:800; color:#475569; margin:0; text-transform:uppercase;">Roster Planning Command</h4>
          <div style="display:flex; border:1px solid #cbd5e1; border-radius:4px; overflow:hidden;">
            <button class="roster-btn" style="border:none; border-radius:0; ${window.activeRosterViewMode === 'Weekly' ? 'background:#e2e8f0; font-weight:700;' : ''}" onclick="window.switchRosterViewMode('Weekly')">Weekly Calendar</button>
            <button class="roster-btn" style="border:none; border-radius:0; ${window.activeRosterViewMode === 'List' ? 'background:#e2e8f0; font-weight:700;' : ''}" onclick="window.switchRosterViewMode('List')">List View</button>
          </div>
        </div>
        <div>
          ${canBuild ? `<button class="btn btn-secondary btn-sm" onclick="window.openTemplateModal()" style="border:1px solid #cbd5e1; background:#ffffff; font-weight:600; cursor:pointer; margin-right:6px;">📋 Apply Template</button>` : ''}
          <button class="btn btn-secondary btn-sm" onclick="window.exportRosterPDF()" style="border:1px solid #cbd5e1; background:#ffffff; font-weight:600; cursor:pointer; margin-right:6px;">🖨️ Export PDF</button>
          ${canBuild ? `<button class="btn btn-primary btn-sm" onclick="window.publishRoster()" style="background:#2563eb; color:#fff; border:none; padding:6px 12px; border-radius:6px; font-weight:700; cursor:pointer;">Publish Roster</button>` : ''}
        </div>
      </div>
      
      <div class="roster-filter-row">
        <div class="roster-nav">
          <button class="roster-btn" onclick="window.navigateRosterWeek(-7)">◀</button>
          <span>Week of ${new Date(mondayStr).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}</span>
          <button class="roster-btn" onclick="window.navigateRosterWeek(7)">▶</button>
        </div>
        
        <div style="flex-grow:1; display:flex; gap:10px; justify-content:flex-end;">
          <select class="filter-input" onchange="window.onRosterFilterChange('branch', this.value)" style="padding:4px; font-size:0.75rem;">
            <option value="All" ${window.rosterFilterBranch === 'All' ? 'selected' : ''}>All Branches</option>
            <option value="Bengaluru HSR (Main)" ${window.rosterFilterBranch === 'Bengaluru HSR (Main)' ? 'selected' : ''}>Bengaluru HSR (Main)</option>
            <option value="Whitefield Clinic" ${window.rosterFilterBranch === 'Whitefield Clinic' ? 'selected' : ''}>Whitefield Clinic</option>
          </select>
          
          <select class="filter-input" onchange="window.onRosterFilterChange('dept', this.value)" style="padding:4px; font-size:0.75rem;" ${isDeptHead ? 'disabled' : ''}>
            <option value="All" ${filterDept === 'All' ? 'selected' : ''}>All Depts / Wards</option>
            <option value="Cardiology" ${filterDept === 'Cardiology' ? 'selected' : ''}>Cardiology</option>
            <option value="Orthopedics" ${filterDept === 'Orthopedics' ? 'selected' : ''}>Orthopedics</option>
            <option value="General Medicine" ${filterDept === 'General Medicine' ? 'selected' : ''}>General Medicine</option>
            <option value="Pediatrics" ${filterDept === 'Pediatrics' ? 'selected' : ''}>Pediatrics</option>
            <option value="General Ward (Male)" ${filterDept === 'General Ward (Male)' ? 'selected' : ''}>General Ward (Male)</option>
            <option value="General Ward (Female)" ${filterDept === 'General Ward (Female)' ? 'selected' : ''}>General Ward (Female)</option>
            <option value="ICU" ${filterDept === 'ICU' ? 'selected' : ''}>ICU</option>
          </select>
          
          <select class="filter-input" onchange="window.onRosterFilterChange('staffType', this.value)" style="padding:4px; font-size:0.75rem;" ${isNursingSupervisor ? 'disabled' : ''}>
            <option value="Both" ${filterStaffType === 'Both' ? 'selected' : ''}>Doctors & Nurses</option>
            <option value="Doctors" ${filterStaffType === 'Doctors' ? 'selected' : ''}>Doctors Only</option>
            <option value="Nurses" ${filterStaffType === 'Nurses' ? 'selected' : ''}>Nurses Only</option>
          </select>
          
          ${window.activeRosterStaffFilter ? `
            <button class="roster-btn" onclick="window.clearStaffRosterFilter()" style="color:#ef4444; border-color:#fca5a5; font-weight:700;">✕ Clear Staff Filter</button>
          ` : ''}
        </div>
      </div>
      
      <div class="roster-grid-layout">
        <!-- Main Calendar Area -->
        <div style="background:#ffffff; border:1px solid #e2e8f0; border-radius:8px; overflow-x:auto; padding:10px;">
          ${window.activeRosterViewMode === 'Weekly' ? `
            <table style="width:100%; border-collapse:collapse; text-align:left; font-size:0.78rem;">
              <thead>
                <tr style="border-bottom:2px solid #cbd5e1; background:#f8fafc;">
                  <th style="padding:10px; min-width:180px;">Clinical Staff</th>
                  ${headerCols}
                </tr>
              </thead>
              <tbody>
                ${staff.map(s => {
                  return `
                    <tr style="border-bottom:1px solid #e2e8f0;">
                      <td style="padding:10px; display:flex; align-items:center; gap:8px;">
                        <div class="avatar-thumb" style="width:26px; height:26px; font-size:0.7rem; background:#f1f5f9; border:1px solid #cbd5e1;">${s.name.replace('Dr. ', '').replace('Staff Nurse ', '').replace('Nurse ', '').trim().charAt(0)}</div>
                        <div>
                          <strong>${s.name}</strong><br>
                          <small style="color:#64748b;">${s.designation}</small>
                        </div>
                      </td>
                      ${weekDates.map((dateStr, i) => {
                        const dayShifts = (window.state.rosterShifts || []).filter(r => r.staffId === s.id && r.date === dateStr);
                        const isOnLeaveToday = s.statusToday === 'On Leave' && dateStr === window._HIS_DATE(0);
                        
                        let lockIcon = '';
                        if (s.type === 'Doctor') {
                          const dayName = weekdays[new Date(dateStr).getDay() === 0 ? 6 : new Date(dateStr).getDay() - 1];
                          if (s.opdDays && s.opdDays.includes(dayName)) {
                            lockIcon = '<span class="shift-lock" style="position: absolute; top: 2px; right: 2px; font-size: 0.65rem; z-index: 10;">🩺</span>';
                          }
                          if ((s.otPrivileges || (s.privileges && s.privileges.includes('Major OT'))) && i % 3 === 0) {
                            lockIcon = '<span class="shift-lock" style="position: absolute; top: 2px; right: 2px; font-size: 0.65rem; z-index: 10;">⚕</span>';
                          }
                        }

                        let cellContentHTML = '';
                        if (isOnLeaveToday) {
                          cellContentHTML = `
                            <div class="shift-block shift-leave" style="padding: 4px 6px; border-radius: 4px; font-size: 0.72rem; font-weight: 700; text-align: center; min-height: 38px; display: flex; flex-direction: column; justify-content: center; position: relative;">
                              LEAVE
                            </div>
                          `;
                        } else if (dayShifts.length === 0) {
                          cellContentHTML = `
                            <div class="shift-block shift-off" style="padding: 4px 6px; border-radius: 4px; font-size: 0.72rem; font-weight: 700; text-align: center; min-height: 38px; display: flex; flex-direction: column; justify-content: center; position: relative;">
                              OFF
                            </div>
                          `;
                        } else {
                          cellContentHTML = dayShifts.map(sh => {
                            let blockClass = 'shift-off';
                            let blockLabel = 'OFF';
                            const branchShort = sh.branch ? (sh.branch.includes('HSR') ? 'HSR' : (sh.branch.includes('Whitefield') ? 'WFD' : 'EC')) : '';
                            const locLabel = sh.location || 'Hosp';
                            const fullLoc = branchShort ? `${locLabel} (${branchShort})` : locLabel;
                            const timeStr = sh.startTime && sh.endTime ? `<br><small>${sh.startTime} - ${sh.endTime}</small>` : '';

                            if (sh.shift === 'Morning') { blockClass = 'shift-m'; blockLabel = `MORNING<br><small>${fullLoc}</small>${timeStr}`; }
                            else if (sh.shift === 'Evening') { blockClass = 'shift-e'; blockLabel = `EVENING<br><small>${fullLoc}</small>${timeStr}`; }
                            else if (sh.shift === 'Night') { blockClass = 'shift-n'; blockLabel = `NIGHT<br><small>${fullLoc}</small>${timeStr}`; }
                            else if (sh.shift === 'Full Day') { blockClass = 'shift-fd'; blockLabel = `FULL DAY<br><small>${fullLoc}</small>${timeStr}`; }
                            else if (sh.shift === 'On Call') { blockClass = 'shift-oncall'; blockLabel = `ON CALL<br><small>${fullLoc}</small>${timeStr}`; }
                            else if (sh.shift === 'Leave') { blockClass = 'shift-leave'; blockLabel = 'LEAVE'; }

                            return `
                              <div class="shift-block ${blockClass}" style="padding: 2px 4px; border-radius: 4px; font-size: 0.65rem; font-weight: 700; text-align: center; min-height: 28px; display: flex; flex-direction: column; justify-content: center; position: relative;">
                                ${blockLabel}
                              </div>
                            `;
                          }).join('');
                        }

                        return `
                          <td style="padding:4px; text-align:center; vertical-align:middle; min-width:95px; cursor:pointer;" onclick="window.onRosterCellClick(this, '${s.id}', '${dateStr}')">
                            <div style="display:flex; flex-direction:column; gap:4px; justify-content:center; position:relative; border: 1px dashed #e2e8f0; border-radius: 6px; padding: 4px 2px; min-height: 46px; background: #ffffff;">
                              ${cellContentHTML}
                              ${lockIcon}
                            </div>
                          </td>
                        `;
                      }).join('')}
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          ` : `
            <!-- LIST VIEW -->
            <table style="width:100%; border-collapse:collapse; text-align:left; font-size:0.78rem;">
              <thead>
                <tr style="border-bottom:2px solid #cbd5e1; background:#f8fafc;">
                  <th style="padding:10px;">Date</th>
                  <th style="padding:10px;">Staff Name</th>
                  <th style="padding:10px;">Department</th>
                  <th style="padding:10px;">Shift</th>
                  <th style="padding:10px;">Ward/Location</th>
                  <th style="padding:10px; text-align:right;">Status</th>
                </tr>
              </thead>
              <tbody>
                ${staff.flatMap(s => weekDates.map(dateStr => {
                  const r = (window.state.rosterShifts || []).find(sh => sh.staffId === s.id && sh.date === dateStr) || { shift: 'Off', location: s.type === 'Doctor' ? s.department : s.ward };
                  return `
                    <tr style="border-bottom:1px solid #f1f5f9;">
                      <td style="padding:10px;"><strong>${dateStr}</strong></td>
                      <td style="padding:10px;">${s.name}</td>
                      <td style="padding:10px;">${s.department}</td>
                      <td style="padding:10px;"><span class="badge" style="background:#f1f5f9; color:#475569;">${r.shift}</span></td>
                      <td style="padding:10px;">${r.location}</td>
                      <td style="padding:10px; text-align:right;"><span style="color:#10b981; font-weight:700;">Confirmed</span></td>
                    </tr>
                  `;
                })).join('')}
              </tbody>
            </table>
          `}
        </div>
        
        <!-- Coverage Gaps Right Panel -->
        <div class="gap-sidebar">
          <h4 style="margin:0 0 10px 0; font-size:0.75rem; font-weight:800; color:#475569; border-bottom:1px solid #e2e8f0; padding-bottom:6px; text-transform:uppercase;">🚨 Coverage Gaps</h4>
          ${gaps.map(g => `
            <div class="gap-card">
              <strong>${g.location}</strong>
              <small>${g.date} · ${g.shift} Shift</small><br>
              <div style="display:flex; justify-content:space-between; align-items:center; margin-top:4px;">
                <span style="color:#dc2626; font-weight:600; font-size:0.7rem;">⚠️ ${g.msg}</span>
                ${canBuild ? `<button onclick="window.assignGapStaff('${g.location}', '${g.date}', '${g.shift}', '${g.type}')" style="background:#2563eb; color:#fff; border:none; border-radius:4px; font-size:0.65rem; padding:2px 6px; font-weight:700; cursor:pointer;">Assign</button>` : ''}
              </div>
            </div>
          `).join('')}
          ${gaps.length === 0 ? `
            <div style="text-align:center; padding:20px; color:#64748b; font-size:0.72rem;">✅ No coverage gaps detected this week. Minimum safety ratios met.</div>
          ` : ''}
        </div>
      </div>
      
      <!-- Mount points for Roster Modal -->
      <div id="roster-modal-mount"></div>
    `;
  }

  // ========================================================================
  // SUB-TAB 5: CREDENTIAL TRACKER
  // ========================================================================
  function renderCredentialTrackerTab(panel) {
    const state = window.state || {};
    const credentials = state.mgmtCredentials || [];

    panel.innerHTML = `
      <div style="margin-bottom:10px; display:flex; justify-content:space-between; align-items:center;">
        <h4 style="font-size:0.8rem; font-weight:700; text-transform:uppercase; color:#64748b; margin:0;">Staff Credentials Tracker</h4>
      </div>

      <div class="card" style="padding:10px; border:1px solid #cbd5e1; border-radius:8px;">
        <table class="custom-tbl" style="width:100%;">
          <thead>
            <tr>
              <th>Emp ID</th>
              <th>Staff Name</th>
              <th>Designation</th>
              <th>License/Credential Type</th>
              <th>Reg No</th>
              <th>Expiry Date</th>
              <th style="text-align:right;">Status</th>
            </tr>
          </thead>
          <tbody>
            ${credentials.map(c => `
              <tr style="${c.days <= 0 ? 'background:#fff5f5;' : ''}">
                <td style="font-family:'JetBrains Mono',monospace;">${c.id}</td>
                <td style="font-weight:700;">${c.name}</td>
                <td>${c.designation}</td>
                <td>${c.type}</td>
                <td style="font-family:'JetBrains Mono',monospace;">${c.regNo}</td>
                <td style="font-family:'JetBrains Mono',monospace; color:${c.days<=0?'#ef4444':'#f59e0b'}; font-weight:700;">${c.expiry}</td>
                <td style="text-align:right;">
                  <span class="badge ${c.days<=0?'b-re':(c.days<=30?'b-am':'b-gr')}" style="font-size:0.65rem; padding:1px 6px;">
                    ${c.status}
                  </span>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  // ========================================================================
  // SUB-TAB 6: INCIDENT REPORTS
  // ========================================================================
  function renderIncidentsTab(panel) {
    const state = window.state || {};
    const incidents = state.mgmtIncidents || [];

    panel.innerHTML = `
      <style>
        .severity-sentinel { background: #fee2e2; color: #991b1b; border: 1px solid #fca5a5; font-weight:700; }
        .severity-serious { background: #ffedd5; color: #9a3412; border: 1px solid #fed7aa; }
        .severity-minor { background: #eff6ff; color: #1e40af; border: 1px solid #bfdbfe; }
      </style>

      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
        <h4 style="font-size:0.8rem; font-weight:700; text-transform:uppercase; color:#64748b; margin:0;">Clinical Incidents Workspace</h4>
        <button class="btn btn-primary btn-sm" onclick="window.mgmtOpenNewIncidentForm()" style="background:#2563eb; color:#fff; border:none; padding:6px 12px; border-radius:6px; font-weight:600; cursor:pointer;">
          + File Incident Report
        </button>
      </div>

      <div class="card" style="padding:10px; border:1px solid #cbd5e1; border-radius:8px;">
        <table class="custom-tbl" style="width:100%;">
          <thead>
            <tr>
              <th>Inc No</th>
              <th>Reported Date</th>
              <th>Type</th>
              <th>Dept</th>
              <th>Severity</th>
              <th>Reported By</th>
              <th style="text-align:right;">Status</th>
            </tr>
          </thead>
          <tbody>
            ${incidents.map(i => `
              <tr style="cursor:pointer;" onclick="window.mgmtOpenIncidentDetail('${i.id}')" title="Click to view details">
                <td style="font-family:'JetBrains Mono',monospace; font-weight:700;">${i.id}</td>
                <td style="font-family:'JetBrains Mono',monospace;">${i.date}</td>
                <td style="font-weight:700;">${i.type}</td>
                <td>${i.dept}</td>
                <td>
                  <span class="badge ${i.severity==='Sentinel'?'severity-sentinel':(i.severity==='Serious'?'severity-serious':'severity-minor')}" style="font-size:0.65rem; padding:1px 6px;">
                    ${i.severity}
                  </span>
                </td>
                <td>${i.reporter}</td>
                <td style="text-align:right;">
                  <span class="badge ${i.status==='Resolved'||i.status==='Closed'?'b-gr':'b-sl'}" style="font-size:0.65rem; padding:1px 6px;">${i.status}</span>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  // ========================================================================
  // SUB-TAB 7: PATIENT COMPLAINTS (SLA Tracker)
  // ========================================================================
  function renderComplaintsTab(panel) {
    const state = window.state || {};
    const complaints = state.mgmtComplaints || [];

    panel.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
        <h4 style="font-size:0.8rem; font-weight:700; text-transform:uppercase; color:#64748b; margin:0;">Patient Grievances Ledger</h4>
        <button class="btn btn-primary btn-sm" onclick="window.mgmtOpenNewComplaintForm()" style="padding:4px 10px; font-size:0.72rem; border-radius:4px;">+ Log New Complaint</button>
      </div>

      <div class="card" style="padding:10px; border:1px solid #cbd5e1; border-radius:8px;">
        <div style="font-size:0.7rem; color:#64748b; margin-bottom:6px;">
          <b>SLA Threshold Rules:</b> High Priority - 24h | Medium Priority - 48h | Low - 7 days. <span style="color:#ef4444; font-weight:700;">Red rows denote ticket SLA breaches.</span>
        </div>
        <table class="custom-tbl" style="width:100%;">
          <thead>
            <tr>
              <th>Cmp No</th>
              <th>Logged Date</th>
              <th>Complainant</th>
              <th>Concerned Dept</th>
              <th>Nature</th>
              <th>Priority</th>
              <th>SLA Due</th>
              <th style="text-align:right;">Status</th>
            </tr>
          </thead>
          <tbody>
            ${complaints.map(c => {
              const isBreached = c.status === 'Open' && c.priority === 'High';
              return `
                <tr style="cursor:pointer; ${isBreached ? 'background:#fff5f5; border-left:3px solid #ef4444;' : ''}" onclick="window.mgmtOpenComplaintDetail('${c.id}')" title="Click to view details">
                  <td style="font-family:'JetBrains Mono',monospace; font-weight:700; color:${isBreached?'#ef4444':'#0f172a'};">${c.id}</td>
                  <td style="font-family:'JetBrains Mono',monospace;">${c.date}</td>
                  <td style="font-weight:700;">${c.complainant}</td>
                  <td>${c.dept}</td>
                  <td>${c.nature}</td>
                  <td>
                    <span class="badge ${c.priority==='High'?'b-re':(c.priority==='Medium'?'b-am':'b-sl')}" style="font-size:0.65rem; padding:1px 6px;">
                      ${c.priority}
                    </span>
                  </td>
                  <td style="font-family:'JetBrains Mono',monospace; font-weight:700; color:${isBreached?'#ef4444':'#475569'};">${c.slaDue}</td>
                  <td style="text-align:right;">
                    <span class="badge ${c.status==='Resolved'?'b-gr':'b-sl'}" style="font-size:0.65rem; padding:1px 6px;">${c.status}</span>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  // ========================================================================
  // SUB-TAB 8: QUALITY INDICATORS (NABH Entries)
  // ========================================================================
  function renderIndicatorsTab(panel) {
    const state = window.state || {};
    const indicators = state.mgmtIndicators || [];

    panel.innerHTML = `
      <div style="margin-bottom:10px; display:flex; justify-content:space-between; align-items:center;">
        <h4 style="font-size:0.8rem; font-weight:700; text-transform:uppercase; color:#64748b; margin:0;">Monthly Quality Indicators</h4>
      </div>

      <div class="card" style="padding:10px; border:1px solid #cbd5e1; border-radius:8px;">
        <table class="custom-tbl" style="width:100%;">
          <thead>
            <tr>
              <th>Code</th>
              <th>Indicator Name</th>
              <th>This Month Value</th>
              <th>NABH Target</th>
              <th>Status</th>
              <th style="text-align:right;">Trend (Last 3 Months)</th>
            </tr>
          </thead>
          <tbody>
            ${indicators.map(ind => `
              <tr>
                <td style="font-family:'JetBrains Mono',monospace;">${ind.code}</td>
                <td style="font-weight:700;">${ind.name}</td>
                <td style="font-family:'JetBrains Mono',monospace; font-weight:700;">${ind.val}</td>
                <td>${ind.target}</td>
                <td>
                  <span class="badge ${ind.status==='Met'?'b-gr':(ind.status==='Near threshold'?'b-am':'b-re')}" style="font-size:0.65rem; padding:1px 6px;">
                    ${ind.status}
                  </span>
                </td>
                <td style="text-align:right; font-family:'JetBrains Mono',monospace; font-size:0.75rem; color:#64748b;">
                  ${ind.trend.join(' &rarr; ')}
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  // ========================================================================
  // SUB-TAB 9: MAINTENANCE TICKETS (Breakdowns)
  // ========================================================================
  function renderTicketsTab(panel) {
    const state = window.state || {};
    const tickets = state.mgmtTickets || [];

    panel.innerHTML = `
      <div style="margin-bottom:10px; display:flex; justify-content:space-between; align-items:center;">
        <h4 style="font-size:0.8rem; font-weight:700; text-transform:uppercase; color:#64748b; margin:0;">Breakdown Tickets</h4>
      </div>

      <div class="card" style="padding:10px; border:1px solid #cbd5e1; border-radius:8px;">
        <table class="custom-tbl" style="width:100%;">
          <thead>
            <tr>
              <th>Ticket No</th>
              <th>Equipment</th>
              <th>Concerned Dept</th>
              <th>Reported Time</th>
              <th>Priority</th>
              <th>Assigned Specialist</th>
              <th style="text-align:right;">Status</th>
            </tr>
          </thead>
          <tbody>
            ${tickets.map(t => `
              <tr style="${t.status==='Open'&&t.priority==='Critical'?'background:#fff5f5; border-left:3px solid #ef4444;':''}">
                <td style="font-family:'JetBrains Mono',monospace; font-weight:700;">${t.id}</td>
                <td style="font-weight:700;">${t.equipment}</td>
                <td>${t.dept}</td>
                <td style="font-family:'JetBrains Mono',monospace;">${t.reported}</td>
                <td>
                  <span class="badge ${t.priority==='Critical'?'b-re':'b-sl'}" style="font-size:0.65rem; padding:1px 6px;">
                    ${t.priority}
                  </span>
                </td>
                <td>
                  <span style="font-family:'JetBrains Mono',monospace; font-weight:600; color:${t.assignedTo==='Unassigned'?'#ef4444':'#334155'};">
                    ${t.assignedTo}
                  </span>
                </td>
                <td style="text-align:right;">
                  <span class="badge b-sl" style="font-size:0.65rem; padding:1px 6px;">${t.status}</span>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  // ========================================================================
  // SUB-TAB 10: PREVENTIVE MAINTENANCE (PM)
  // ========================================================================
  function renderPMTab(panel) {
    const state = window.state || {};
    const pm = state.mgmtPmSchedules || [];

    panel.innerHTML = `
      <div style="margin-bottom:10px; display:flex; justify-content:space-between; align-items:center;">
        <h4 style="font-size:0.8rem; font-weight:700; text-transform:uppercase; color:#64748b; margin:0;">Preventive Maintenance Schedules</h4>
      </div>

      <div class="card" style="padding:10px; border:1px solid #cbd5e1; border-radius:8px;">
        <table class="custom-tbl" style="width:100%;">
          <thead>
            <tr>
              <th>Equipment</th>
              <th>Dept</th>
              <th>Frequency</th>
              <th>Last Done Date</th>
              <th>Next Due Date</th>
              <th style="text-align:right;">PM Status</th>
            </tr>
          </thead>
          <tbody>
            ${pm.map(p => `
              <tr style="${p.status==='Overdue'?'background:#fff5f5;':''}">
                <td style="font-weight:700;">${p.equipment}</td>
                <td>${p.dept}</td>
                <td>${p.freq}</td>
                <td style="font-family:'JetBrains Mono',monospace;">${p.lastDone}</td>
                <td style="font-family:'JetBrains Mono',monospace; font-weight:700;">${p.nextDue}</td>
                <td style="text-align:right;">
                  <span class="badge ${p.status==='Done'?'b-gr':(p.status==='Due today'?'b-am':'b-re')}" style="font-size:0.65rem; padding:1px 6px;">
                    ${p.status}
                  </span>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  // ========================================================================
  // SUB-TAB 11: UTILITIES & BMW (Biomedical Waste Form)
  // ========================================================================
  function renderUtilitiesTab(panel) {
    const state = window.state || {};
    const utils = state.mgmtUtilities || { generator: "On Mains", o2Supply: "Adequate" };
    const bmwLogs = state.mgmtBmwLogs || [];

    panel.innerHTML = `
      <style>
        .util-grid { display:grid; grid-template-columns:repeat(3, 1fr); gap:1rem; margin-bottom:1rem; }
        .util-card { padding:10px; border:1px solid #cbd5e1; border-radius:8px; text-align:center; background:#ffffff; }
      </style>

      <div>
        <h4 style="font-size:0.8rem; font-weight:700; text-transform:uppercase; color:#64748b; margin-bottom:10px;">Utilities Status Dashboard</h4>
        
        <div class="util-grid" style="font-size:0.8rem;">
          <div class="util-card">
            <div style="font-weight:700; color:#64748b; font-size:0.7rem; text-transform:uppercase;">Generator Status</div>
            <div style="font-size:1.25rem; font-weight:800; color:#10b981; margin:6px 0;">✓ ${utils.generator}</div>
            <span style="font-size:0.65rem; color:#64748b;">Mains active</span>
          </div>
          <div class="util-card">
            <div style="font-weight:700; color:#64748b; font-size:0.7rem; text-transform:uppercase;">Central O2 Pipeline</div>
            <div style="font-size:1.25rem; font-weight:800; color:#10b981; margin:6px 0;">✓ ${utils.o2Supply}</div>
            <span style="font-size:0.65rem; color:#64748b;">Cylinders: 45 Full / 15 Empty</span>
          </div>
          <div class="util-card">
            <div style="font-weight:700; color:#64748b; font-size:0.7rem; text-transform:uppercase;">Water Supply Levels</div>
            <div style="font-size:1.25rem; font-weight:800; color:#10b981; margin:6px 0;">✓ ${utils.waterLevel}</div>
            <span style="font-size:0.65rem; color:#64748b;">Ground reservoirs full</span>
          </div>
        </div>

        <h4 style="font-size:0.8rem; font-weight:700; text-transform:uppercase; color:#64748b; margin:15px 0 10px 0;">Biomedical Waste Daily Entry (BMW Rules 2016)</h4>
        
        <!-- BMW Daily Form -->
        <div class="card" style="padding:12px; border:1px solid #cbd5e1; border-radius:8px; font-size:0.8rem; margin-bottom:12px;">
          <div style="display:grid; grid-template-columns:repeat(4, 1fr); gap:8px; margin-bottom:10px;">
            <div>
              <label style="display:block; font-weight:600; color:#64748b; font-size:0.72rem;">Yellow bag (Pathological - kg): <span style="color:red;">*</span></label>
              <input type="number" id="bmw-yellow" class="form-control" value="12.0" style="width:100%; padding:4px; border:1px solid #cbd5e1; border-radius:4px;">
            </div>
            <div>
              <label style="display:block; font-weight:600; color:#64748b; font-size:0.72rem;">Red bag (Plastic - kg): <span style="color:red;">*</span></label>
              <input type="number" id="bmw-red" class="form-control" value="15.5" style="width:100%; padding:4px; border:1px solid #cbd5e1; border-radius:4px;">
            </div>
            <div>
              <label style="display:block; font-weight:600; color:#64748b; font-size:0.72rem;">Blue/White (Glass/Sharps - kg): <span style="color:red;">*</span></label>
              <input type="number" id="bmw-blue" class="form-control" value="4.0" style="width:100%; padding:4px; border:1px solid #cbd5e1; border-radius:4px;">
            </div>
            <div>
              <label style="display:block; font-weight:600; color:#64748b; font-size:0.72rem;">Black bag (General - kg): <span style="color:red;">*</span></label>
              <input type="number" id="bmw-black" class="form-control" value="22.5" style="width:100%; padding:4px; border:1px solid #cbd5e1; border-radius:4px;">
            </div>
          </div>
          <button class="btn btn-primary" onclick="window.saveBmwLogEntry()" style="background:#2563eb; color:#fff; border:none; padding:6px 12px; border-radius:6px; font-weight:600; cursor:pointer;">Save Daily Entry</button>
        </div>

        <!-- BMW Historical Log -->
        <div class="card" style="padding:10px; border:1px solid #cbd5e1; border-radius:8px;">
          <table class="custom-tbl" style="width:100%;">
            <thead>
              <tr>
                <th>Date</th>
                <th>Yellow (kg)</th>
                <th>Red (kg)</th>
                <th>Blue/White (kg)</th>
                <th>Black (kg)</th>
                <th>Total (kg)</th>
                <th>Collector Contractor</th>
              </tr>
            </thead>
            <tbody>
              ${bmwLogs.map(l => `
                <tr>
                  <td style="font-family:'JetBrains Mono',monospace; font-weight:700;">${l.date}</td>
                  <td>${l.yellow}</td>
                  <td>${l.red}</td>
                  <td>${l.blue}</td>
                  <td>${l.black}</td>
                  <td style="font-family:'JetBrains Mono',monospace; font-weight:700;">${l.total} kg</td>
                  <td>${l.collector} (Collected ✓)</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;

    window.saveBmwLogEntry = function() {
      const yellow = parseFloat(document.getElementById('bmw-yellow').value) || 0;
      const red = parseFloat(document.getElementById('bmw-red').value) || 0;
      const blue = parseFloat(document.getElementById('bmw-blue').value) || 0;
      const black = parseFloat(document.getElementById('bmw-black').value) || 0;
      const total = yellow + red + blue + black;

      const state = window.state || {};
      state.mgmtBmwLogs.unshift({
        date: "28-Jun-2026",
        yellow,
        red,
        blue,
        black,
        total,
        collected: "Yes",
        collector: "Maridi Waste Inc"
      });

      alert(`Biomedical Waste daily entry logged successfully under CPCB mandate.`);
      window.renderHospMgmtSubTab('utilities');
    };
  }

  // ========================================================================
  // SUB-TAB: CLINICAL STAFF MASTER REGISTER
  // ========================================================================
  function renderClinicalStaffTab(panel) {
    const role = window.activeHospMgmtRole || 'Medical Superintendent';
    
    const canEdit = (role === 'Hospital Administrator' || role === 'Medical Superintendent' || role === 'HR Manager');
    const isDeptHead = (role === 'Department Head');
    const isNursingSupervisor = (role === 'Nursing Supervisor');
    const isClinicalStaff = (role === 'Clinical Staff');
    
    let filteredList = window.state.staffList || [];
    
    if (isDeptHead) {
      filteredList = filteredList.filter(s => s.department === 'Cardiology');
    } else if (isNursingSupervisor) {
      filteredList = filteredList.filter(s => s.type === 'Nurse');
    } else if (isClinicalStaff) {
      filteredList = filteredList.filter(s => s.id === 'DOC01');
    }
    
    if (_staffActiveCategory !== 'All') {
      filteredList = filteredList.filter(s => s.type === _staffActiveCategory);
    }
    
    if (_staffSearchQuery.trim() !== '') {
      const q = _staffSearchQuery.toLowerCase();
      filteredList = filteredList.filter(s => 
        s.name.toLowerCase().includes(q) || 
        s.id.toLowerCase().includes(q) || 
        s.phone.includes(q) || 
        (s.registrationNo && s.registrationNo.toLowerCase().includes(q))
      );
    }
    
    if (_staffFilterBranch !== 'All') {
      filteredList = filteredList.filter(s => {
        if (s.type === 'Doctor') {
          return s.branches && s.branches.includes(_staffFilterBranch);
        } else {
          return s.branch === _staffFilterBranch || (s.branches && s.branches.includes(_staffFilterBranch));
        }
      });
    }
    
    if (_staffFilterDept !== 'All') {
      filteredList = filteredList.filter(s => s.department === _staffFilterDept);
    }
    
    if (_staffFilterStatus !== 'All') {
      filteredList = filteredList.filter(s => s.status === _staffFilterStatus);
    }
    
    if (_staffFilterCredStatus !== 'All') {
      filteredList = filteredList.filter(s => s.credentialStatus === _staffFilterCredStatus);
    }
    
    const totalCount = (window.state.staffList || []).length;
    const docCount = (window.state.staffList || []).filter(s => s.type === 'Doctor').length;
    const nurseCount = (window.state.staffList || []).filter(s => s.type === 'Nurse').length;
    
    panel.innerHTML = `
      <style>
        .staff-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
        .staff-title { font-size: 0.95rem; font-weight: 700; color: #1e293b; text-transform: uppercase; margin: 0; }
        .tab-strip { display: flex; gap: 8px; border-bottom: 2px solid #e2e8f0; margin-bottom: 12px; padding-bottom: 1px; }
        .tab-item { padding: 6px 12px; font-size: 0.8rem; font-weight: 600; color: #64748b; cursor: pointer; border-bottom: 2px solid transparent; margin-bottom: -2px; display: flex; align-items: center; gap: 6px; }
        .tab-item.active { color: #2563eb; border-bottom-color: #2563eb; }
        .tab-badge { background: #f1f5f9; color: #475569; font-size: 0.68rem; font-weight: 700; padding: 2px 6px; border-radius: 10px; }
        .tab-item.active .tab-badge { background: #dbeafe; color: #1e40af; }
        .filter-bar { background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; display: grid; grid-template-columns: 2fr 1fr 1fr 1fr 1fr; gap: 10px; margin-bottom: 12px; }
        .filter-group { display: flex; flex-direction: column; }
        .filter-label { font-size: 0.65rem; font-weight: 700; color: #64748b; margin-bottom: 4px; text-transform: uppercase; }
        .filter-input { font-size: 0.78rem; padding: 6px; border: 1px solid #cbd5e1; border-radius: 4px; outline: none; background: #ffffff; }
        .form-input { font-size: 0.78rem; padding: 8px 10px; border: 1px solid #cbd5e1; border-radius: 6px; outline: none; background: #ffffff; color: #1e293b; font-family: 'Inter', sans-serif; transition: all 0.2s ease; box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.05); }
        .form-input:focus { border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15), inset 0 1px 2px rgba(0, 0, 0, 0.05); }
        .form-input:disabled { background: #f8fafc; color: #475569; border-color: #e2e8f0; box-shadow: none; cursor: not-allowed; }
        .staff-table { width: 100%; border-collapse: collapse; text-align: left; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
        .staff-table th { padding: 10px; background: #f8fafc; font-size: 0.68rem; font-weight: 700; color: #475569; text-transform: uppercase; border-bottom: 2px solid #e2e8f0; }
        .staff-table td { padding: 10px; border-bottom: 1px solid #f1f5f9; font-size: 0.78rem; color: #334155; vertical-align: middle; }
        .staff-table tr:hover { background: #f8fafc; cursor: pointer; }
        .status-dot { width: 8px; height: 8px; border-radius: 50%; display: inline-block; margin-right: 6px; }
        .avatar-thumb { width: 32px; height: 32px; border-radius: 50%; background: #f1f5f9; border: 1px solid #cbd5e1; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 0.85rem; color: #475569; text-transform: uppercase; }
        .badge-cred { font-size: 0.68rem; font-weight: 700; padding: 2px 6px; border-radius: 4px; display: inline-block; }
        .cred-valid { background: #d1fae5; color: #065f46; }
        .cred-expiring { background: #fef3c7; color: #92400e; }
        .cred-expired { background: #fee2e2; color: #991b1b; }
      </style>
      
      <div class="staff-header">
        <h3 class="staff-title">Clinical Staff Master Register</h3>
        ${canEdit ? `<button class="btn btn-primary btn-sm" onclick="window.openStaffWizard()" style="background:#2563eb; color:#fff; border:none; padding:6px 12px; border-radius:6px; font-weight:600; cursor:pointer;">➕ Add New Staff</button>` : ''}
      </div>
      
      <div class="tab-strip">
        <div class="tab-item ${_staffActiveCategory === 'All' ? 'active' : ''}" onclick="window.switchStaffCategory('All')">
          All Clinical Staff <span class="tab-badge">${totalCount}</span>
        </div>
        <div class="tab-item ${_staffActiveCategory === 'Doctor' ? 'active' : ''}" onclick="window.switchStaffCategory('Doctor')">
          Doctors <span class="tab-badge">${docCount}</span>
        </div>
        <div class="tab-item ${_staffActiveCategory === 'Nurse' ? 'active' : ''}" onclick="window.switchStaffCategory('Nurse')">
          Nurses <span class="tab-badge">${nurseCount}</span>
        </div>
      </div>
      
      <div class="filter-bar">
        <div class="filter-group">
          <span class="filter-label">Search</span>
          <input type="text" class="filter-input" placeholder="Name / Emp ID / SMC No..." value="${_staffSearchQuery}" onkeyup="window.onStaffSearch(this.value)">
        </div>
        <div class="filter-group">
          <span class="filter-label">Branch</span>
          <select class="filter-input" onchange="window.onStaffFilterChange('branch', this.value)">
            <option value="All" ${_staffFilterBranch === 'All' ? 'selected' : ''}>All Branches</option>
            <option value="Bengaluru HSR (Main)" ${_staffFilterBranch === 'Bengaluru HSR (Main)' ? 'selected' : ''}>Bengaluru HSR (Main)</option>
            <option value="Whitefield Clinic" ${_staffFilterBranch === 'Whitefield Clinic' ? 'selected' : ''}>Whitefield Clinic</option>
            <option value="Electronic City Hub" ${_staffFilterBranch === 'Electronic City Hub' ? 'selected' : ''}>Electronic City Hub</option>
          </select>
        </div>
        <div class="filter-group">
          <span class="filter-label">Department</span>
          <select class="filter-input" onchange="window.onStaffFilterChange('dept', this.value)">
            <option value="All" ${_staffFilterDept === 'All' ? 'selected' : ''}>All Departments</option>
            ${[...new Set((window.state.staffList || []).map(s => s.department))].map(d => `
              <option value="${d}" ${_staffFilterDept === d ? 'selected' : ''}>${d}</option>
            `).join('')}
          </select>
        </div>
        <div class="filter-group">
          <span class="filter-label">Status</span>
          <select class="filter-input" onchange="window.onStaffFilterChange('status', this.value)">
            <option value="All" ${_staffFilterStatus === 'All' ? 'selected' : ''}>All Statuses</option>
            <option value="Active" ${_staffFilterStatus === 'Active' ? 'selected' : ''}>Active</option>
            <option value="On Leave" ${_staffFilterStatus === 'On Leave' ? 'selected' : ''}>On Leave</option>
            <option value="Suspended" ${_staffFilterStatus === 'Suspended' ? 'selected' : ''}>Suspended</option>
          </select>
        </div>
        <div class="filter-group">
          <span class="filter-label">Credentials</span>
          <select class="filter-input" onchange="window.onStaffFilterChange('cred', this.value)">
            <option value="All" ${_staffFilterCredStatus === 'All' ? 'selected' : ''}>All Credentials</option>
            <option value="Valid" ${_staffFilterCredStatus === 'Valid' ? 'selected' : ''}>Valid</option>
            <option value="Expiring soon" ${_staffFilterCredStatus === 'Expiring soon' ? 'selected' : ''}>Expiring in 30 days</option>
            <option value="Expired" ${_staffFilterCredStatus === 'Expired' ? 'selected' : ''}>Expired</option>
          </select>
        </div>
      </div>
      
      <div style="overflow-x:auto;">
        <table class="staff-table">
          <thead>
            <tr>
              <th style="width: 48px;">Photo</th>
              <th>Name & Designation</th>
              <th>Employee ID</th>
              <th>Dept / Ward</th>
              <th>Registration No.</th>
              <th>Branch(es)</th>
              <th>Today's Status</th>
              <th>Credentials</th>
              <th style="text-align: right; width: 140px;">Actions</th>
            </tr>
          </thead>
          <tbody>
            ${filteredList.map(s => {
              const avatarLetter = s.name.replace('Dr. ', '').replace('Staff Nurse ', '').replace('Nurse ', '').trim().charAt(0);
              
              let dotColor = '#10b981';
              if (s.statusToday === 'On Leave') dotColor = '#ef4444';
              else if (s.statusToday === 'Off Duty') dotColor = '#64748b';
              else if (s.statusToday === 'OPD') dotColor = '#2563eb';
              else if (s.statusToday === 'Morning' || s.statusToday === 'Night') dotColor = '#10b981';
              
              let credBadgeClass = 'cred-valid';
              if (s.credentialStatus === 'Expired') credBadgeClass = 'cred-expired';
              else if (s.credentialStatus === 'Expiring soon') credBadgeClass = 'cred-expiring';
              
              const branchText = s.type === 'Doctor' ? (s.branches ? s.branches.join(', ') : 'Bengaluru HSR (Main)') : (s.branch || 'Bengaluru HSR (Main)');
              
              return `
                <tr onclick="window.viewStaffProfile('${s.id}')">
                  <td onclick="event.stopPropagation(); window.viewStaffProfile('${s.id}')">
                    <div class="avatar-thumb">${avatarLetter}</div>
                  </td>
                  <td>
                    <strong>${s.name}</strong><br>
                    <small style="color:#64748b;">${s.designation}</small>
                  </td>
                  <td style="font-family:monospace; font-weight:700;">${s.id}</td>
                  <td><span class="badge bg-secondary" style="background:#f1f5f9; color:#475569; border:1px solid #cbd5e1;">${s.type === 'Doctor' ? s.department : s.ward}</span></td>
                  <td><code>${s.registrationNo}</code></td>
                  <td><small>${branchText}</small></td>
                  <td>
                    <span class="status-dot" style="background:${dotColor};"></span>
                    <span style="font-size:0.75rem; font-weight:600;">${s.statusToday}</span>
                  </td>
                  <td>
                    <span class="badge-cred ${credBadgeClass}">${s.credentialStatus}</span>
                  </td>
                  <td style="text-align: right;" onclick="event.stopPropagation();">
                    <button class="btn btn-secondary btn-sm" onclick="window.viewStaffProfile('${s.id}')" style="padding:2px 6px; font-size:0.72rem; border:1px solid #cbd5e1; background:#ffffff; cursor:pointer;">View</button>
                    ${canEdit ? `<button class="btn btn-secondary btn-sm" onclick="window.editStaffProfile('${s.id}')" style="padding:2px 6px; font-size:0.72rem; border:1px solid #cbd5e1; background:#ffffff; cursor:pointer; color:#2563eb;">Edit</button>` : ''}
                    <button class="btn btn-secondary btn-sm" onclick="window.showRosterForStaff('${s.id}')" style="padding:2px 6px; font-size:0.72rem; border:1px solid #cbd5e1; background:#ffffff; cursor:pointer; color:#7c3aed;">Roster</button>
                  </td>
                </tr>
              `;
            }).join('')}
            ${filteredList.length === 0 ? `
              <tr>
                <td colspan="9" style="text-align:center; padding: 20px; color:#64748b;">No clinical staff records found matching the active filters.</td>
              </tr>
            ` : ''}
          </tbody>
        </table>
      </div>
      
      <div id="staff-drawer-container"></div>
    `;
  }

  // ========================================================================
  // DRAWER & WIZARD RENDERING
  // ========================================================================
  function renderStaffDrawer(staff, mode) {
    const container = document.getElementById('mgmt-workspace-panel') || document.getElementById('staff-drawer-container');
    if (!container) return;

    const role = window.activeHospMgmtRole || 'Medical Superintendent';
    const canEdit = (role === 'Hospital Administrator' || role === 'Medical Superintendent' || role === 'HR Manager');

    const isEdit = (mode === 'Edit' || mode === 'Add');
    const isAdd = (mode === 'Add');
    
    const data = staff || {
      id: '',
      name: '',
      type: 'Doctor',
      designation: 'Consultant',
      department: 'General Medicine',
      ward: 'General Ward (Male)',
      registrationNo: '',
      regValidTill: window._HIS_DATE(365),
      branches: ['Bengaluru HSR (Main)'],
      branch: 'Bengaluru HSR (Main)',
      statusToday: 'On Duty',
      status: 'Active',
      credentialStatus: 'Valid',
      phone: '',
      email: '',
      dob: '1985-05-15',
      sex: 'Male',
      address: 'HSR Layout, Bengaluru',
      emergencyName: 'Emergency Contact',
      emergencyPhone: '',
      bloodGroup: 'B+',
      opdTiming: '09:00 AM - 01:00 PM',
      otPrivileges: false,
      reportingTo: 'Medical Superintendent',
      credentials: [
        { name: 'Medical/Nursing Registration certificate', uploaded: true, expiryDate: window._HIS_DATE(365), status: 'Valid' },
        { name: 'Degree certificates', uploaded: true, expiryDate: '', status: 'Valid' },
        { name: 'Identity proof (Aadhaar/PAN)', uploaded: true, expiryDate: '', status: 'Valid' },
        { name: 'BLS/ACLS certification', uploaded: true, expiryDate: window._HIS_DATE(180), status: 'Valid' },
        { name: 'Police verification certificate', uploaded: true, expiryDate: window._HIS_DATE(180), status: 'Valid' },
        { name: 'Health check-up / fitness certificate', uploaded: true, expiryDate: window._HIS_DATE(365), status: 'Valid' }
      ]
    };

    container.innerHTML = `
      <div style="background:#ffffff; border:1px solid #cbd5e1; border-radius:12px; padding:20px; font-family:'Inter', sans-serif; font-size:0.8rem; line-height:1.5; box-shadow:0 4px 12px rgba(0,0,0,0.05); text-align:left;">
        <!-- Header Section with Back Button -->
        <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:2px solid #e2e8f0; padding-bottom:14px; margin-bottom:22px;">
          <div>
            <h3 style="margin:0; font-size:1.15rem; font-weight:800; color:#0f172a; display:flex; align-items:center; gap:8px;">
              ${isAdd ? '➕ Add New Clinical Staff' : (isEdit ? '📝 Edit Staff Profile' : '👤 Clinical Staff Profile')}
            </h3>
            <small style="color:#64748b; font-size:0.75rem; font-weight:500;">
              ${isAdd ? 'Configure professional credentials and system access permissions' : `Employee ID: ${data.id}`}
            </small>
          </div>
          <div style="display:flex; gap:10px;">
            ${(!isEdit && canEdit) ? `
              <button onclick="window.editStaffProfile('${data.id}')" class="btn btn-primary" style="padding:6px 14px; font-size:0.78rem; background:#2563eb; color:#fff; border:none; border-radius:6px; font-weight:700; cursor:pointer; display:flex; align-items:center; gap:6px;">
                📝 Edit Profile
              </button>
            ` : ''}
            <button onclick="window.closeStaffDrawer()" class="btn btn-secondary" style="padding:6px 14px; font-size:0.78rem; border:1.5px solid #cbd5e1; background:#ffffff; border-radius:6px; font-weight:700; cursor:pointer; display:flex; align-items:center; gap:6px; color:#334155;">
              ← Back to Staff Directory
            </button>
          </div>
        </div>

        ${isAdd ? `
          <div style="margin-bottom:18px; background:#f8fafc; padding:12px; border-radius:8px; border:1px solid #cbd5e1; max-width:400px;">
            <label style="display:block; font-weight:700; font-size:0.7rem; color:#475569; text-transform:uppercase; margin-bottom:6px;">Staff Category Type</label>
            <div style="display:flex; gap:16px;">
              <label style="cursor:pointer; display:flex; align-items:center; gap:4px; font-weight:600;"><input type="radio" name="wiz-type" value="Doctor" checked onclick="window.onWizardTypeChange('Doctor')"> 🩺 Doctor (SMC Registered)</label>
              <label style="cursor:pointer; display:flex; align-items:center; gap:4px; font-weight:600;"><input type="radio" name="wiz-type" value="Nurse" onclick="window.onWizardTypeChange('Nurse')"> 🏥 Nurse (INC Registered)</label>
            </div>
          </div>
        ` : ''}

        <!-- 2-Column Layout -->
        <div style="display:grid; grid-template-columns:1.1fr 1fr; gap:24px; align-items:start;">
          
          <!-- LEFT COLUMN: Personal Details & System Access -->
          <div style="display:flex; flex-direction:column; gap:20px;">
            
            <!-- Section A — Personal Details -->
            <div style="background:#ffffff; border:1px solid #e2e8f0; border-radius:8px; padding:16px; box-shadow:0 1px 3px rgba(0,0,0,0.02);">
              <h5 style="border-bottom:1.5px solid #cbd5e1; padding-bottom:6px; font-weight:800; color:#1e293b; margin:0 0 14px 0; font-size:0.82rem; text-transform:uppercase; letter-spacing:0.04em;">Section A — Personal Details</h5>
              
              <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:12px;">
                <div>
                  <label class="filter-label">Full Name *</label>
                  <input type="text" id="wiz-name" class="form-input" style="width:100%; box-sizing:border-box;" value="${data.name.replace('Dr. ', '').replace('Staff Nurse ', '').replace('Nurse ', '')}" ${!isEdit ? 'disabled' : ''}>
                </div>
                <div>
                  <label class="filter-label">Date of Birth *</label>
                  <input type="date" id="wiz-dob" class="form-input" style="width:100%; box-sizing:border-box;" value="${data.dob || '1990-01-01'}" ${!isEdit ? 'disabled' : ''}>
                </div>
              </div>

              <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:12px;">
                <div>
                  <label class="filter-label">Sex *</label>
                  <select id="wiz-sex" class="form-input" style="width:100%; box-sizing:border-box;" ${!isEdit ? 'disabled' : ''}>
                    <option value="Male" ${data.sex === 'Male' ? 'selected' : ''}>Male</option>
                    <option value="Female" ${data.sex === 'Female' ? 'selected' : ''}>Female</option>
                    <option value="Other" ${data.sex === 'Other' ? 'selected' : ''}>Other</option>
                  </select>
                </div>
                <div>
                  <label class="filter-label">Mobile Number (10 digits) *</label>
                  <input type="text" id="wiz-phone" class="form-input" style="width:100%; box-sizing:border-box;" value="${data.phone.replace('+91 ', '')}" ${!isEdit ? 'disabled' : ''}>
                </div>
              </div>

              <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:12px;">
                <div>
                  <label class="filter-label">Personal Email</label>
                  <input type="email" id="wiz-email" class="form-input" style="width:100%; box-sizing:border-box;" value="${data.email}" ${!isEdit ? 'disabled' : ''}>
                </div>
                <div>
                  <label class="filter-label">Blood Group</label>
                  <select id="wiz-blood" class="form-input" style="width:100%; box-sizing:border-box;" ${!isEdit ? 'disabled' : ''}>
                    <option value="A+" ${data.bloodGroup === 'A+' ? 'selected' : ''}>A+</option>
                    <option value="A-" ${data.bloodGroup === 'A-' ? 'selected' : ''}>A-</option>
                    <option value="B+" ${data.bloodGroup === 'B+' ? 'selected' : ''}>B+</option>
                    <option value="O+" ${data.bloodGroup === 'O+' ? 'selected' : ''}>O+</option>
                    <option value="AB+" ${data.bloodGroup === 'AB+' ? 'selected' : ''}>AB+</option>
                  </select>
                </div>
              </div>

              <div style="margin-bottom:12px;">
                <label class="filter-label">Residential Address *</label>
                <textarea id="wiz-address" class="form-input" style="width:100%; height:54px; box-sizing:border-box;" ${!isEdit ? 'disabled' : ''}>${data.address}</textarea>
              </div>

              <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
                <div>
                  <label class="filter-label">Emergency Contact Name *</label>
                  <input type="text" id="wiz-emergency-name" class="form-input" style="width:100%; box-sizing:border-box;" value="${data.emergencyName}" ${!isEdit ? 'disabled' : ''}>
                </div>
                <div>
                  <label class="filter-label">Emergency Contact Number *</label>
                  <input type="text" id="wiz-emergency-phone" class="form-input" style="width:100%; box-sizing:border-box;" value="${data.emergencyPhone}" ${!isEdit ? 'disabled' : ''}>
                </div>
              </div>
            </div>

            <!-- Section D — System Access -->
            <div style="background:#ffffff; border:1px solid #e2e8f0; border-radius:8px; padding:16px; box-shadow:0 1px 3px rgba(0,0,0,0.02);">
              <h5 style="border-bottom:1.5px solid #cbd5e1; padding-bottom:6px; font-weight:800; color:#1e293b; margin:0 0 14px 0; font-size:0.82rem; text-transform:uppercase; letter-spacing:0.04em;">Section D — System Access</h5>
              <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:12px;">
                <div>
                  <label class="filter-label">Login Username</label>
                  <input type="text" id="wiz-username" class="form-input" style="width:100%; font-family:monospace; box-sizing:border-box;" value="${data.email.split('@')[0] || 'staff_login'}" ${!isEdit ? 'disabled' : ''}>
                </div>
                <div>
                  <label class="filter-label">Access Level Role</label>
                  <select id="wiz-role" class="form-input" style="width:100%; box-sizing:border-box;" ${!isEdit ? 'disabled' : ''}>
                    <option value="Doctor" ${data.type === 'Doctor' ? 'selected' : ''}>Doctor</option>
                    <option value="Nursing Supervisor" ${data.designation === 'Nursing Supervisor' ? 'selected' : ''}>Nursing Supervisor</option>
                    <option value="Ward Nurse" ${data.type === 'Nurse' && data.designation !== 'Nursing Supervisor' ? 'selected' : ''}>Ward Nurse</option>
                    <option value="HR Administrator" ${data.reportingTo === 'Medical Superintendent' && data.type === 'Doctor' ? 'selected' : ''}>HR Administrator</option>
                  </select>
                </div>
              </div>
              <div style="display:flex; justify-content:space-between; align-items:center; background:#f8fafc; padding:10px 12px; border-radius:6px; border:1px solid #cbd5e1;">
                <div>
                  <strong style="color:#334155; font-size:0.8rem;">Access Active</strong><br>
                  <small style="color:#64748b; font-size:0.7rem;">Allow staff to log into Saronil HMS with current role privileges</small>
                </div>
                <div>
                  <input type="checkbox" id="wiz-login-enabled" checked ${!isEdit ? 'disabled' : ''} style="width:18px; height:18px; cursor:pointer;">
                </div>
              </div>
            </div>

            <!-- Section F — Digital Signature -->
            <div style="background:#ffffff; border:1px solid #e2e8f0; border-radius:8px; padding:16px; box-shadow:0 1px 3px rgba(0,0,0,0.02);">
              <h5 style="border-bottom:1.5px solid #cbd5e1; padding-bottom:6px; font-weight:800; color:#1e293b; margin:0 0 14px 0; font-size:0.82rem; text-transform:uppercase; letter-spacing:0.04em;">Section F — Digital Signature</h5>
              <div style="display:flex; flex-direction:column; gap:10px;">
                ${isEdit ? `
                  <label class="filter-label" style="font-weight:700; color:#475569;">Upload Digital Signature File (PNG/JPG)</label>
                  <input type="file" id="wiz-signature-file" accept="image/*" onchange="window.onSignatureFileChange(this)" style="font-size:0.75rem; width:100%; border:1px solid #cbd5e1; padding:6px; border-radius:6px;">
                  <input type="hidden" id="wiz-signature-dataurl" value="${data.signatureUrl || ''}">
                  <input type="hidden" id="wiz-signature-name" value="${data.signatureName || ''}">
                  <div id="wiz-sig-preview-container" style="margin-top:8px;">
                    ${data.signatureUrl ? `
                      <img src="${data.signatureUrl}" id="wiz-sig-preview-img" alt="Signature Preview" style="max-height:55px; border:1px dashed #cbd5e1; border-radius:4px; padding:4px; background:#fff;">
                      <p style="margin:4px 0 0; font-size:10px; color:#64748b;">Current signature file: <b>${data.signatureName || 'signature.png'}</b></p>
                    ` : `
                      <p style="font-size:11px; font-style:italic; color:#64748b; margin:0;">No signature file uploaded yet.</p>
                    `}
                  </div>
                ` : `
                  <label class="filter-label" style="font-weight:700; color:#475569;">Registered Digital Signature</label>
                  <div style="margin-top:4px;">
                    ${data.signatureUrl ? `
                      <img src="${data.signatureUrl}" alt="Signature" style="max-height:55px; border:1px solid #cbd5e1; border-radius:6px; padding:4px; background:#fff;">
                      <p style="margin:4px 0 0; font-size:10px; color:#64748b;">Verified file: <b>${data.signatureName}</b></p>
                    ` : `
                      <span style="font-size:11px; font-style:italic; color:#ef4444; font-weight:600; display:flex; align-items:center; gap:4px;">🖋 No digital signature uploaded.</span>
                    `}
                  </div>
                `}
              </div>
            </div>

          </div>

          <!-- RIGHT COLUMN: Professional Details, Credentials & Status -->
          <div style="display:flex; flex-direction:column; gap:20px;">
            
            <!-- Section B — Professional Details -->
            <div style="background:#ffffff; border:1px solid #e2e8f0; border-radius:8px; padding:16px; box-shadow:0 1px 3px rgba(0,0,0,0.02);">
              <h5 style="border-bottom:1.5px solid #cbd5e1; padding-bottom:6px; font-weight:800; color:#1e293b; margin:0 0 14px 0; font-size:0.82rem; text-transform:uppercase; letter-spacing:0.04em;">Section B — Professional Details</h5>
              <div id="wiz-professional-fields">
                ${renderProfessionalSubFields(data, isEdit)}
              </div>
            </div>

            <!-- Section C — Credentials & Compliance -->
            <div style="background:#ffffff; border:1px solid #e2e8f0; border-radius:8px; padding:16px; box-shadow:0 1px 3px rgba(0,0,0,0.02);">
              <h5 style="border-bottom:1.5px solid #cbd5e1; padding-bottom:6px; font-weight:800; color:#1e293b; margin:0 0 14px 0; font-size:0.82rem; text-transform:uppercase; letter-spacing:0.04em;">Section C — Credentials &amp; Compliance</h5>
              <div style="overflow-x:auto;">
                <table style="width:100%; font-size:0.75rem; border-collapse:collapse;">
                  <thead>
                    <tr style="background:#f8fafc; border-bottom:1px solid #cbd5e1;">
                      <th style="padding:8px 6px; text-align:left;">Required Document</th>
                      <th style="padding:8px 6px; text-align:center;">Upload</th>
                      <th style="padding:8px 6px; text-align:center;">Expiry Date</th>
                      <th style="padding:8px 6px; text-align:right;">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${data.credentials.map((c, idx) => {
                      let badgeColor = 'cred-valid';
                      if (c.status === 'Expired') badgeColor = 'cred-expired';
                      else if (c.status === 'Expiring soon') badgeColor = 'cred-expiring';
                      
                      return `
                        <tr style="border-bottom:1px solid #f1f5f9;">
                          <td style="padding:8px 6px; font-weight:600; color:#334155;">${c.name}</td>
                          <td style="padding:8px 6px; text-align:center; color:#64748b; font-weight:500;">
                            📄 Attached
                          </td>
                          <td style="padding:8px 6px; text-align:center;">
                            ${isEdit && c.expiryDate !== '' ? `
                              <input type="date" id="cred-exp-${idx}" value="${c.expiryDate}" class="form-input" style="font-size:0.7rem; padding:2px 4px; width:110px;">
                            ` : `
                              <small>${c.expiryDate || '—'}</small>
                            `}
                          </td>
                          <td style="padding:8px 6px; text-align:right;">
                            <span class="badge-cred ${badgeColor}">${c.status}</span>
                          </td>
                        </tr>
                      `;
                    }).join('')}
                  </tbody>
                </table>
              </div>
            </div>

            <!-- Section E — Employment Status -->
            <div style="background:#ffffff; border:1px solid #e2e8f0; border-radius:8px; padding:16px; box-shadow:0 1px 3px rgba(0,0,0,0.02);">
              <h5 style="border-bottom:1.5px solid #cbd5e1; padding-bottom:6px; font-weight:800; color:#1e293b; margin:0 0 14px 0; font-size:0.82rem; text-transform:uppercase; letter-spacing:0.04em;">Section E — Employment Status</h5>
              <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:12px;">
                <div>
                  <label class="filter-label">Employment Status</label>
                  <select id="wiz-status" class="form-input" style="width:100%; font-weight:700; box-sizing:border-box;" onchange="window.onWizardStatusChange(this.value)" ${!isEdit ? 'disabled' : ''}>
                    <option value="Active" ${data.status === 'Active' ? 'selected' : ''}>Active</option>
                    <option value="On Leave" ${data.status === 'On Leave' ? 'selected' : ''}>On Leave</option>
                    <option value="Suspended" ${data.status === 'Suspended' ? 'selected' : ''}>Suspended</option>
                    <option value="Resigned" ${data.status === 'Resigned' ? 'selected' : ''}>Resigned</option>
                    <option value="Terminated" ${data.status === 'Terminated' ? 'selected' : ''}>Terminated</option>
                  </select>
                </div>
                <div>
                  <label class="filter-label">Effective Date</label>
                  <input type="date" id="wiz-status-date" class="form-input" style="width:100%; box-sizing:border-box;" value="${data.statusEffectiveDate || window._HIS_DATE(0)}" ${!isEdit ? 'disabled' : ''}>
                </div>
              </div>
              <div id="wiz-exit-clearance-panel" style="display:${data.status === 'Resigned' || data.status === 'Terminated' ? 'block' : 'none'}; background:#fee2e2; padding:12px; border:1px solid #fca5a5; border-radius:6px; margin-top:10px;">
                <strong style="color:#991b1b; font-size:0.75rem; display:block; margin-bottom:6px; text-transform:uppercase;">HR Exit Clearance Checklist</strong>
                <div style="display:flex; flex-direction:column; gap:6px; font-size:0.75rem; color:#7f1d1d;">
                  <label style="display:flex; align-items:center; gap:6px; cursor:pointer;"><input type="checkbox" id="chk-it-access" ${data.exitClearance?.itRevoked ? 'checked' : ''} ${!isEdit ? 'disabled' : ''}> Revoke IT Access (Active Directory, HMS, Email)</label>
                  <label style="display:flex; align-items:center; gap:6px; cursor:pointer;"><input type="checkbox" id="chk-id-card" ${data.exitClearance?.propertyReturned ? 'checked' : ''} ${!isEdit ? 'disabled' : ''}> Return ID Card, Keys, and Hospital Property</label>
                  <label style="display:flex; align-items:center; gap:6px; cursor:pointer;"><input type="checkbox" id="chk-dues" ${data.exitClearance?.duesCleared ? 'checked' : ''} ${!isEdit ? 'disabled' : ''}> Financial Dues Cleared (Accounts Signoff)</label>
                  <label style="display:flex; align-items:center; gap:6px; cursor:pointer;"><input type="checkbox" id="chk-handover" ${data.exitClearance?.handoverComplete ? 'checked' : ''} ${!isEdit ? 'disabled' : ''}> Clinical Handover Complete (Reporting Head Signoff)</label>
                </div>
              </div>
            </div>

          </div>

        </div>

        <!-- Footer Action Buttons -->
        <div style="background:#f1f5f9; padding:12px 16px; margin-top:24px; border-radius:8px; display:flex; justify-content:flex-end; gap:10px; border:1px solid #cbd5e1;">
          <button onclick="window.closeStaffDrawer()" class="btn btn-secondary" style="border:1.5px solid #cbd5e1; background:#ffffff; font-weight:700; border-radius:6px; padding:8px 20px; cursor:pointer; color:#475569;">Cancel</button>
          ${isEdit ? `
            <button onclick="window.saveStaffWizard('${data.id || 'NEW'}')" class="btn btn-primary" style="background:#10b981; color:#fff; border:none; padding:8px 24px; border-radius:6px; font-weight:800; cursor:pointer; display:flex; align-items:center; gap:6px;">💾 Save Record</button>
          ` : (canEdit ? `
            <button onclick="window.editStaffProfile('${data.id}')" class="btn btn-primary" style="background:#2563eb; color:#fff; border:none; padding:8px 24px; border-radius:6px; font-weight:800; cursor:pointer; display:flex; align-items:center; gap:6px;">📝 Edit Profile</button>
          ` : '')}
        </div>

      </div>
    `;
  }

  function renderProfessionalSubFields(data, isEdit) {
    const isDoctor = (data.type === 'Doctor');
    if (isDoctor) {
      // Resolve dynamic milestone stage based on verification details
      let stage = 1;
      if (data.psvStatus === 'Verified') stage = 2;
      if (data.committeeVetting && data.committeeVetting.startsWith('Approved')) stage = 3;
      if (data.ehrTrainingCompleted) stage = 4;
      if (data.status === 'Active' && stage === 4) stage = 5;

      const steps = [
        { num: 1, name: 'Apply' },
        { num: 2, name: 'PSV' },
        { num: 3, name: 'Vetted' },
        { num: 4, name: 'EHR' },
        { num: 5, name: 'Active' }
      ];

      const milestonesHTML = `
        <div style="margin-bottom:16px; padding:12px; background:#f8fafc; border:1px solid #cbd5e1; border-radius:8px;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
            <span style="font-weight:700; font-size:0.65rem; color:#475569; text-transform:uppercase; letter-spacing:0.05em;">Clinical Onboarding Pipeline</span>
            <span class="badge" style="background:#dbeafe; color:#1e40af; font-size:9px; font-weight:700;">Stage ${stage}: ${steps[stage-1].name}</span>
          </div>
          <div style="display:flex; align-items:center; justify-content:space-between; position:relative; padding:0 4px; margin-top:8px; margin-bottom:4px;">
            <!-- Connecting Line -->
            <div style="position:absolute; top:10px; left:15px; right:15px; height:3px; background:#cbd5e1; z-index:1;"></div>
            <div style="position:absolute; top:10px; left:15px; width:calc(${(stage-1)/4 * 100}% - 10px); height:3px; background:#10b981; z-index:2; transition: width 0.3s ease;"></div>
            
            ${steps.map(s => {
              const isDone = s.num <= stage;
              const bg = isDone ? '#10b981' : '#ffffff';
              const color = isDone ? '#ffffff' : '#64748b';
              const border = isDone ? 'none' : '2px solid #cbd5e1';
              return `
                <div style="display:flex; flex-direction:column; align-items:center; z-index:3; position:relative;">
                  <div style="width:22px; height:22px; border-radius:50%; background:${bg}; color:${color}; border:${border}; display:flex; align-items:center; justify-content:center; font-size:9px; font-weight:800; font-family:monospace;">
                    ${s.num}
                  </div>
                  <span style="font-size:9px; font-weight:700; color:${isDone ? '#0f172a' : '#64748b'}; margin-top:4px;">${s.name}</span>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      `;

      return `
        ${milestonesHTML}

        <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:10px;">
          <div>
            <label class="filter-label">Designation *</label>
            <select id="wiz-designation" class="form-input" style="width:100%;" ${!isEdit ? 'disabled' : ''}>
              <option value="Consultant" ${data.designation === 'Consultant' ? 'selected' : ''}>Consultant</option>
              <option value="Senior Consultant" ${data.designation === 'Senior Consultant' ? 'selected' : ''}>Senior Consultant</option>
              <option value="Senior Resident" ${data.designation === 'Senior Resident' ? 'selected' : ''}>Senior Resident</option>
              <option value="Junior Resident" ${data.designation === 'Junior Resident' ? 'selected' : ''}>Junior Resident</option>
              <option value="Visiting Consultant" ${data.designation === 'Visiting Consultant' ? 'selected' : ''}>Visiting Consultant</option>
              <option value="DNB Trainee" ${data.designation === 'DNB Trainee' ? 'selected' : ''}>DNB Trainee</option>
            </select>
          </div>
          <div>
            <label class="filter-label">Department *</label>
            <select id="wiz-department" class="form-input" style="width:100%;" ${!isEdit ? 'disabled' : ''}>
              <option value="Cardiology" ${data.department === 'Cardiology' ? 'selected' : ''}>Cardiology</option>
              <option value="Orthopedics" ${data.department === 'Orthopedics' ? 'selected' : ''}>Orthopedics</option>
              <option value="General Medicine" ${data.department === 'General Medicine' ? 'selected' : ''}>General Medicine</option>
              <option value="Pediatrics" ${data.department === 'Pediatrics' ? 'selected' : ''}>Pediatrics</option>
              <option value="General Surgery" ${data.department === 'General Surgery' ? 'selected' : ''}>General Surgery</option>
              <option value="Gynecology & Obs" ${data.department === 'Gynecology & Obs' ? 'selected' : ''}>Gynecology & Obs</option>
              <option value="Emergency Medicine" ${data.department === 'Emergency Medicine' ? 'selected' : ''}>Emergency Medicine</option>
              <option value="Neurology" ${data.department === 'Neurology' ? 'selected' : ''}>Neurology</option>
            </select>
          </div>
        </div>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:10px;">
          <div>
            <label class="filter-label">Specialisation *</label>
            <input type="text" id="wiz-specialisation" class="form-input" style="width:100%;" placeholder="e.g. Interventional Cardiology" value="${data.specialisation || ''}" ${!isEdit ? 'disabled' : ''}>
          </div>
          <div>
            <label class="filter-label">Medical Council Reg No *</label>
            <input type="text" id="wiz-reg-no" class="form-input" style="width:100%;" value="${data.registrationNo || ''}" ${!isEdit ? 'disabled' : ''}>
          </div>
        </div>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:10px;">
          <div>
            <label class="filter-label">Registration Valid Till *</label>
            <input type="date" id="wiz-reg-expiry" class="form-input" style="width:100%;" value="${data.regValidTill || ''}" ${!isEdit ? 'disabled' : ''}>
          </div>
          <div>
            <label class="filter-label">Years of Experience *</label>
            <input type="number" id="wiz-experience" class="form-input" style="width:100%;" value="${data.experience || 5}" ${!isEdit ? 'disabled' : ''}>
          </div>
        </div>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:10px;">
          <div>
            <label class="filter-label">Employment Type *</label>
            <select id="wiz-employment-type" class="form-input" style="width:100%;" ${!isEdit ? 'disabled' : ''}>
              <option value="Full-time" ${data.employmentType === 'Full-time' ? 'selected' : ''}>Full-time</option>
              <option value="Part-time" ${data.employmentType === 'Part-time' ? 'selected' : ''}>Part-time</option>
              <option value="Visiting" ${data.employmentType === 'Visiting' ? 'selected' : ''}>Visiting</option>
              <option value="Contractual" ${data.employmentType === 'Contractual' ? 'selected' : ''}>Contractual</option>
            </select>
          </div>
          <div>
            <label class="filter-label">OPD Default Timings</label>
            <input type="text" id="wiz-opd-timing" class="form-input" style="width:100%;" value="${data.opdTiming || '09:00 AM - 01:00 PM'}" ${!isEdit ? 'disabled' : ''}>
          </div>
        </div>

        <!-- Real-world Credentialing & Vetting Board Details -->
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:10px; background:#f1f5f9; padding:8px; border-radius:6px; border:1px solid #cbd5e1;">
          <div>
            <label class="filter-label" style="font-weight:700; color:#1e293b;">Primary Source Verification (PSV)</label>
            <select id="wiz-psv-status" class="form-input" style="width:100%; height:26px; font-size:11px; padding:2px 4px;" ${!isEdit ? 'disabled' : ''}>
              <option value="Not Initiated" ${data.psvStatus === 'Not Initiated' ? 'selected' : ''}>Not Initiated</option>
              <option value="In Progress" ${data.psvStatus === 'In Progress' ? 'selected' : ''}>In Progress</option>
              <option value="Verified" ${data.psvStatus === 'Verified' ? 'selected' : ''}>Verified (Cleared)</option>
              <option value="Discrepancy Found" ${data.psvStatus === 'Discrepancy Found' ? 'selected' : ''}>Discrepancy Found</option>
            </select>
          </div>
          <div>
            <label class="filter-label" style="font-weight:700; color:#1e293b;">PSV Ref No / SMC Verification</label>
            <input type="text" id="wiz-psv-ref" class="form-input" style="width:100%; height:26px; font-size:11px; padding:2px 4px;" placeholder="Verification Reg ID" value="${data.psvRef || ''}" ${!isEdit ? 'disabled' : ''}>
          </div>
        </div>

        <div style="margin-bottom:10px; background:#f1f5f9; padding:8px; border-radius:6px; border:1px solid #cbd5e1;">
          <label class="filter-label" style="font-weight:700; color:#1e293b;">Vetting Committee Sign-Off</label>
          <select id="wiz-committee-vetting" class="form-input" style="width:100%; height:26px; font-size:11px; padding:2px 4px;" ${!isEdit ? 'disabled' : ''}>
            <option value="Pending Board Review" ${data.committeeVetting === 'Pending Board Review' ? 'selected' : ''}>Pending Board Review</option>
            <option value="Approved - Full Privileges" ${data.committeeVetting === 'Approved - Full Privileges' ? 'selected' : ''}>Approved - Full Privileges</option>
            <option value="Approved - Conditional Privileges" ${data.committeeVetting === 'Approved - Conditional Privileges' ? 'selected' : ''}>Approved - Conditional Privileges</option>
            <option value="Declined" ${data.committeeVetting === 'Declined' ? 'selected' : ''}>Declined / Denied</option>
          </select>
        </div>

        <div style="margin-bottom:10px;">
          <label class="filter-label">Consulting Branches (Multi-select)</label>
          <div style="display:flex; gap:16px;">
            <label><input type="checkbox" class="chk-branch" value="Bengaluru HSR (Main)" ${data.branches && data.branches.includes('Bengaluru HSR (Main)') ? 'checked' : ''} ${!isEdit ? 'disabled' : ''}> Bengaluru</label>
            <label><input type="checkbox" class="chk-branch" value="Whitefield Clinic" ${data.branches && data.branches.includes('Whitefield Clinic') ? 'checked' : ''} ${!isEdit ? 'disabled' : ''}> Whitefield</label>
            <label><input type="checkbox" class="chk-branch" value="Electronic City Hub" ${data.branches && data.branches.includes('Electronic City Hub') ? 'checked' : ''} ${!isEdit ? 'disabled' : ''}> Electronic City</label>
          </div>
        </div>
        <div style="margin-bottom:10px;">
          <label class="filter-label">OPD Consulting Days (Checkboxes)</label>
          <div style="display:flex; gap:10px; flex-wrap:wrap;">
            ${['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => `
              <label style="font-size:0.75rem;"><input type="checkbox" class="chk-opd-day" value="${day}" ${data.opdDays && data.opdDays.includes(day) ? 'checked' : ''} ${!isEdit ? 'disabled' : ''}> ${day}</label>
            `).join('')}
          </div>
        </div>

        <!-- Advanced Clinical Privileges Checklist -->
        <div style="margin-bottom:12px; background:#f8fafc; padding:8px; border-radius:6px; border:1px solid #cbd5e1;">
          <label class="filter-label" style="font-weight:700; color:#0f172a; text-transform:uppercase; font-size:10px; margin-bottom:6px; display:block;">Clinical Privileges Mapping (NABH Standard)</label>
          <div style="display:flex; flex-direction:column; gap:6px;">
            <label style="font-size:0.75rem;"><input type="checkbox" class="chk-privilege" value="Admitting" ${!data.privileges || data.privileges.includes('Admitting') ? 'checked' : ''} ${!isEdit ? 'disabled' : ''}> Admitting Privileges (IPD Wards)</label>
            <label style="font-size:0.75rem;"><input type="checkbox" class="chk-privilege" value="Emergency" ${data.privileges && data.privileges.includes('Emergency') ? 'checked' : ''} ${!isEdit ? 'disabled' : ''}> Emergency casualty & Resuscitation Care</label>
            <label style="font-size:0.75rem;"><input type="checkbox" class="chk-privilege" value="Major OT" ${data.privileges && data.privileges.includes('Major OT') || data.otPrivileges ? 'checked' : ''} ${!isEdit ? 'disabled' : ''}> Major OT & Surgical Interventions</label>
            <label style="font-size:0.75rem;"><input type="checkbox" class="chk-privilege" value="Cath Lab" ${data.privileges && data.privileges.includes('Cath Lab') ? 'checked' : ''} ${!isEdit ? 'disabled' : ''}> Cath Lab & Coronary Angioplasty Access</label>
            <label style="font-size:0.75rem;"><input type="checkbox" class="chk-privilege" value="Narcotics" ${data.privileges && data.privileges.includes('Narcotics') ? 'checked' : ''} ${!isEdit ? 'disabled' : ''}> Controlled Substances & Narcotics Prescribing</label>
          </div>
        </div>

        <!-- System access sign-offs -->
        <div style="margin-bottom:12px; background:#f8fafc; padding:8px; border-radius:6px; border:1px solid #cbd5e1;">
          <label class="filter-label" style="font-weight:700; color:#0f172a; text-transform:uppercase; font-size:10px; margin-bottom:6px; display:block;">System Access Sign-offs</label>
          <div style="display:flex; flex-direction:column; gap:6px;">
            <label style="font-size:0.75rem;"><input type="checkbox" id="wiz-ehr-trained" ${data.ehrTrainingCompleted ? 'checked' : ''} ${!isEdit ? 'disabled' : ''}> EHR Clinical Module Training Completed</label>
            <label style="font-size:0.75rem;"><input type="checkbox" id="wiz-biometric-setup" ${data.biometricSetupCompleted ? 'checked' : ''} ${!isEdit ? 'disabled' : ''}> Biometric Punch-In Setup Registered</label>
          </div>
        </div>
      `;
    } else {
      return `
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:10px;">
          <div>
            <label class="filter-label">Designation *</label>
            <select id="wiz-designation" class="form-input" style="width:100%;" ${!isEdit ? 'disabled' : ''}>
              <option value="Staff Nurse" ${data.designation === 'Staff Nurse' ? 'selected' : ''}>Staff Nurse</option>
              <option value="Senior Nurse" ${data.designation === 'Senior Nurse' ? 'selected' : ''}>Senior Nurse</option>
              <option value="Nursing Supervisor" ${data.designation === 'Nursing Supervisor' ? 'selected' : ''}>Nursing Supervisor</option>
              <option value="ICU Nurse" ${data.designation === 'ICU Nurse' ? 'selected' : ''}>ICU Nurse</option>
              <option value="OT Nurse" ${data.designation === 'OT Nurse' ? 'selected' : ''}>OT Nurse</option>
              <option value="NICU Nurse" ${data.designation === 'NICU Nurse' ? 'selected' : ''}>NICU Nurse</option>
            </select>
          </div>
          <div>
            <label class="filter-label">Ward Assigned *</label>
            <select id="wiz-department" class="form-input" style="width:100%;" ${!isEdit ? 'disabled' : ''}>
              <option value="General Ward (Male)" ${data.ward === 'General Ward (Male)' ? 'selected' : ''}>General Ward (Male)</option>
              <option value="General Ward (Female)" ${data.ward === 'General Ward (Female)' ? 'selected' : ''}>General Ward (Female)</option>
              <option value="ICU" ${data.ward === 'ICU' ? 'selected' : ''}>ICU</option>
              <option value="Semi-Private Ward" ${data.ward === 'Semi-Private Ward' ? 'selected' : ''}>Semi-Private Ward</option>
              <option value="Private Room" ${data.ward === 'Private Room' ? 'selected' : ''}>Private Room</option>
            </select>
          </div>
        </div>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:10px;">
          <div>
            <label class="filter-label">Nursing Council Reg No *</label>
            <input type="text" id="wiz-reg-no" class="form-input" style="width:100%;" value="${data.registrationNo || ''}" ${!isEdit ? 'disabled' : ''}>
          </div>
          <div>
            <label class="filter-label">Registration Valid Till *</label>
            <input type="date" id="wiz-reg-expiry" class="form-input" style="width:100%;" value="${data.regValidTill || ''}" ${!isEdit ? 'disabled' : ''}>
          </div>
        </div>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:10px;">
          <div>
            <label class="filter-label">GNM / B.Sc Nursing qualification *</label>
            <input type="text" id="wiz-qualification" class="form-input" style="width:100%;" placeholder="e.g. B.Sc Nursing" value="${data.specialisation || 'B.Sc Nursing'}" ${!isEdit ? 'disabled' : ''}>
          </div>
          <div>
            <label class="filter-label">Years of Experience *</label>
            <input type="number" id="wiz-experience" class="form-input" style="width:100%;" value="${data.experience || 3}" ${!isEdit ? 'disabled' : ''}>
          </div>
        </div>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:10px;">
          <div>
            <label class="filter-label">Employment Type *</label>
            <select id="wiz-employment-type" class="form-input" style="width:100%;" ${!isEdit ? 'disabled' : ''}>
              <option value="Full-time" ${data.employmentType === 'Full-time' ? 'selected' : ''}>Full-time</option>
              <option value="Part-time" ${data.employmentType === 'Part-time' ? 'selected' : ''}>Part-time</option>
              <option value="Contractual" ${data.employmentType === 'Contractual' ? 'selected' : ''}>Contractual</option>
            </select>
          </div>
          <div>
            <label class="filter-label">Reporting To *</label>
            <input type="text" id="wiz-reporting-to" class="form-input" style="width:100%;" value="${data.reportingTo || 'Nursing Supervisor Mary'}" ${!isEdit ? 'disabled' : ''}>
          </div>
        </div>
      `;
    }
  }

  // ========================================================================
  // STAFF TAB HANDLERS
  // ========================================================================
  window.switchStaffCategory = function(cat) {
    _staffActiveCategory = cat;
    const panel = document.getElementById('mgmt-workspace-panel');
    if (panel) renderClinicalStaffTab(panel);
  };

  window.onStaffSearch = function(val) {
    _staffSearchQuery = val;
    const panel = document.getElementById('mgmt-workspace-panel');
    if (panel) renderClinicalStaffTab(panel);
  };

  window.onStaffFilterChange = function(key, val) {
    if (key === 'branch') _staffFilterBranch = val;
    else if (key === 'dept') _staffFilterDept = val;
    else if (key === 'status') _staffFilterStatus = val;
    else if (key === 'cred') _staffFilterCredStatus = val;
    
    const panel = document.getElementById('mgmt-workspace-panel');
    if (panel) renderClinicalStaffTab(panel);
  };

  window.showRosterForStaff = function(staffId) {
    window.activeRosterStaffFilter = staffId;
    window.renderHospMgmtSubTab('roster');
  };

  window.viewStaffProfile = function(staffId) {
    const staff = (window.state.staffList || []).find(s => s.id === staffId);
    if (!staff) return;
    renderStaffDrawer(staff, 'View');
  };

  window.editStaffProfile = function(staffId) {
    const staff = (window.state.staffList || []).find(s => s.id === staffId);
    if (!staff) return;
    renderStaffDrawer(staff, 'Edit');
  };

  window.openStaffWizard = function() {
    renderStaffDrawer(null, 'Add');
  };

  window.closeStaffDrawer = function() {
    const panel = document.getElementById('mgmt-workspace-panel');
    if (panel) renderClinicalStaffTab(panel);
  };

  window.onWizardTypeChange = function(type) {
    const fieldsContainer = document.getElementById('wiz-professional-fields');
    if (fieldsContainer) {
      const data = { type: type, branches: ['Bengaluru HSR (Main)'], opdDays: ['Mon', 'Wed', 'Fri'] };
      fieldsContainer.innerHTML = renderProfessionalSubFields(data, true);
    }
  };

  window.onWizardStatusChange = function(status) {
    const exitPanel = document.getElementById('wiz-exit-clearance-panel');
    if (exitPanel) {
      exitPanel.style.display = (status === 'Resigned' || status === 'Terminated') ? 'block' : 'none';
    }
  };

  window.onSignatureFileChange = function(input) {
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = function(e) {
        const dataUrl = e.target.result;
        const duEl = document.getElementById('wiz-signature-dataurl');
        const nameEl = document.getElementById('wiz-signature-name');
        if (duEl) duEl.value = dataUrl;
        if (nameEl) nameEl.value = file.name;
        
        const previewContainer = document.getElementById('wiz-sig-preview-container');
        if (previewContainer) {
          previewContainer.innerHTML = `
            <img src="${dataUrl}" id="wiz-sig-preview-img" alt="Signature Preview" style="max-height:55px; border:1px dashed #cbd5e1; border-radius:4px; padding:4px; background:#fff;">
            <p style="margin:4px 0 0; font-size:10px; color:#64748b;">Preview: <b>${file.name}</b> (Ready to save)</p>
          `;
        }
      };
      reader.readAsDataURL(file);
    }
  };

  window.saveStaffWizard = function(staffId) {
    const name = document.getElementById('wiz-name').value.trim();
    const dob = document.getElementById('wiz-dob').value;
    const sex = document.getElementById('wiz-sex').value;
    const phone = document.getElementById('wiz-phone').value.trim();
    const email = document.getElementById('wiz-email').value.trim();
    const bloodGroup = document.getElementById('wiz-blood').value;
    const address = document.getElementById('wiz-address').value.trim();
    const emergencyName = document.getElementById('wiz-emergency-name').value.trim();
    const emergencyPhone = document.getElementById('wiz-emergency-phone').value.trim();
    const signatureUrl = document.getElementById('wiz-signature-dataurl') ? document.getElementById('wiz-signature-dataurl').value : '';
    const signatureName = document.getElementById('wiz-signature-name') ? document.getElementById('wiz-signature-name').value : '';
    
    if (!name || !dob || !phone || !address || !emergencyName || !emergencyPhone) {
      alert("Validation Error: Please fill out all required personal fields marked with *.");
      return;
    }
    
    if (!/^\d{10}$/.test(phone)) {
      alert("Validation Error: Mobile number must be exactly 10 digits.");
      return;
    }
    
    const isNew = (staffId === 'NEW');
    let type = 'Doctor';
    if (isNew) {
      const typeRadio = document.querySelector('input[name="wiz-type"]:checked');
      if (typeRadio) type = typeRadio.value;
    } else {
      const existing = window.state.staffList.find(s => s.id === staffId);
      if (existing) type = existing.type;
    }
    
    const designation = document.getElementById('wiz-designation').value;
    const department = document.getElementById('wiz-department').value;
    const regNo = document.getElementById('wiz-reg-no').value.trim();
    const regExpiry = document.getElementById('wiz-reg-expiry').value;
    const exp = parseInt(document.getElementById('wiz-experience').value) || 0;
    const empType = document.getElementById('wiz-employment-type').value;
    
    if (!regNo || !regExpiry) {
      alert(`Validation Error: ${type} Registration Number and Expiry Date are mandatory.`);
      return;
    }
    
    const duplicateReg = (window.state.staffList || []).find(s => s.registrationNo === regNo && s.id !== staffId);
    if (duplicateReg) {
      alert(`Validation Error: Registration Number ${regNo} is already registered to ${duplicateReg.name}.`);
      return;
    }

    const duplicatePhone = (window.state.staffList || []).find(s => s.phone === phone && s.id !== staffId);
    if (duplicatePhone) {
      alert(`Validation Error: Mobile Number ${phone} is already registered to ${duplicatePhone.name}.`);
      return;
    }
    
    let psvStatus = 'Not Initiated';
    let psvRef = '';
    let committeeVetting = 'Pending Board Review';
    let privileges = ['Admitting'];
    let ehrTrainingCompleted = false;
    let biometricSetupCompleted = false;

    let branches = ['Bengaluru HSR (Main)'];
    let opdDays = ['Mon', 'Wed', 'Fri'];
    let opdTiming = '09:00 AM - 01:00 PM';
    let otPrivileges = false;
    let ward = 'General Ward (Male)';
    let spec = 'General Medicine';
    let reportingTo = 'Medical Superintendent';
    
    if (type === 'Doctor') {
      spec = document.getElementById('wiz-specialisation').value.trim() || department;
      opdTiming = document.getElementById('wiz-opd-timing').value.trim();
      reportingTo = 'Medical Superintendent';
      
      const branchChecks = document.querySelectorAll('.chk-branch:checked');
      if (branchChecks.length > 0) {
        branches = Array.from(branchChecks).map(c => c.value);
      }
      
      const opdChecks = document.querySelectorAll('.chk-opd-day:checked');
      if (opdChecks.length > 0) {
        opdDays = Array.from(opdChecks).map(c => c.value);
      }

      psvStatus = document.getElementById('wiz-psv-status').value;
      psvRef = document.getElementById('wiz-psv-ref').value.trim();
      committeeVetting = document.getElementById('wiz-committee-vetting').value;
      
      const privilegeChecks = document.querySelectorAll('.chk-privilege:checked');
      if (privilegeChecks.length > 0) {
        privileges = Array.from(privilegeChecks).map(c => c.value);
      }
      
      ehrTrainingCompleted = document.getElementById('wiz-ehr-trained').checked;
      biometricSetupCompleted = document.getElementById('wiz-biometric-setup').checked;
      
      otPrivileges = privileges.includes('Major OT');
    } else {
      ward = department;
      spec = document.getElementById('wiz-qualification').value.trim() || 'B.Sc Nursing';
      reportingTo = document.getElementById('wiz-reporting-to').value.trim() || 'Nursing Supervisor Mary';
    }
    
    const status = document.getElementById('wiz-status').value;
    const statusDate = document.getElementById('wiz-status-date').value;
    
    let exitClearance = null;
    if (status === 'Resigned' || status === 'Terminated') {
      exitClearance = {
        itRevoked: document.getElementById('chk-it-access').checked,
        propertyReturned: document.getElementById('chk-id-card').checked,
        duesCleared: document.getElementById('chk-dues').checked,
        handoverComplete: document.getElementById('chk-handover').checked
      };
    }
    
    const credStatus = new Date(regExpiry) < new Date() ? 'Expired' : (new Date(regExpiry) < new Date(window._HIS_DATE(30)) ? 'Expiring soon' : 'Valid');
    
    if (isNew) {
      const prefix = 'BLR';
      const code = type === 'Doctor' ? 'DOC' : 'NUR';
      const seq = 100 + (window.state.staffList.filter(s => s.type === type).length + 1);
      const newId = `${prefix}${code}${seq}`;
      
      const newStaff = {
        id: newId,
        name: type === 'Doctor' ? `Dr. ${name}` : (designation === 'Nursing Supervisor' ? `Nursing Supervisor ${name}` : `Nurse ${name}`),
        type,
        designation,
        department,
        ward,
        registrationNo: regNo,
        regValidTill: regExpiry,
        specialisation: spec,
        branches,
        branch: branches[0],
        statusToday: 'On Duty',
        status,
        statusEffectiveDate: statusDate,
        credentialStatus: credStatus,
        phone: `+91 ${phone}`,
        email,
        dob,
        sex,
        address,
        emergencyName,
        emergencyPhone,
        bloodGroup,
        opdDays,
        opdTiming,
        otPrivileges,
        signatureUrl,
        signatureName,
        joiningDate: new Date().toISOString().slice(0, 10),
        reportingTo,
        exitClearance,
        psvStatus,
        psvRef,
        committeeVetting,
        privileges,
        ehrTrainingCompleted,
        biometricSetupCompleted,
        credentials: [
          { name: 'Medical/Nursing Registration certificate', uploaded: true, expiryDate: regExpiry, status: credStatus },
          { name: 'BLS/ACLS certification', uploaded: true, expiryDate: window._HIS_DATE(180), status: 'Valid' },
          { name: 'Health Fitness Certificate', uploaded: true, expiryDate: window._HIS_DATE(365), status: 'Valid' }
        ]
      };
      
      window.state.staffList.push(newStaff);
      
      if (type === 'Doctor') {
        window.state.doctors = window.state.doctors || [];
        window.state.doctors.push({ id: newId, name: newStaff.name, spec: department, room: "150", phone, status: "Active" });
      } else {
        window.state.nurses = window.state.nurses || [];
        window.state.nurses.push({ id: newId, name: newStaff.name, dept: department, shift: "Morning", phone, status: "Active" });
      }
      
      alert(`Success: Clinical staff record created successfully.\nEmployee ID assigned: ${newId}`);
    } else {
      const staffIdx = window.state.staffList.findIndex(s => s.id === staffId);
      if (staffIdx > -1) {
        const item = window.state.staffList[staffIdx];
        item.name = name.startsWith('Dr. ') || name.startsWith('Nurse ') ? name : (type === 'Doctor' ? `Dr. ${name}` : `Nurse ${name}`);
        item.designation = designation;
        item.department = department;
        item.ward = ward;
        item.registrationNo = regNo;
        item.regValidTill = regExpiry;
        item.specialisation = spec;
        item.branches = branches;
        item.branch = branches[0];
        item.phone = phone.startsWith('+91 ') ? phone : `+91 ${phone}`;
        item.email = email;
        item.dob = dob;
        item.sex = sex;
        item.address = address;
        item.emergencyName = emergencyName;
        item.emergencyPhone = emergencyPhone;
        item.bloodGroup = bloodGroup;
        item.opdDays = opdDays;
        item.opdTiming = opdTiming;
        item.otPrivileges = otPrivileges;
        item.reportingTo = reportingTo;
        item.status = status;
        item.statusEffectiveDate = statusDate;
        item.exitClearance = exitClearance;
        item.credentialStatus = credStatus;
        item.psvStatus = psvStatus;
        item.psvRef = psvRef;
        item.committeeVetting = committeeVetting;
        item.privileges = privileges;
        item.ehrTrainingCompleted = ehrTrainingCompleted;
        item.biometricSetupCompleted = biometricSetupCompleted;
        item.signatureUrl = signatureUrl;
        item.signatureName = signatureName;
        
        if (type === 'Doctor') {
          const dIndex = window.state.doctors.findIndex(d => d.id === staffId);
          if (dIndex > -1) window.state.doctors[dIndex].name = item.name;
        } else {
          const nIndex = window.state.nurses.findIndex(n => n.id === staffId);
          if (nIndex > -1) window.state.nurses[nIndex].name = item.name;
        }
      }
      alert(`Success: Clinical staff record ${staffId} updated successfully.`);
    }
    
    localStorage.setItem('saronil_staffList', JSON.stringify(window.state.staffList));
    localStorage.setItem('saronil_doctors', JSON.stringify(window.state.doctors));
    localStorage.setItem('saronil_nurses', JSON.stringify(window.state.nurses));
    
    window.closeStaffDrawer();
    const panel = document.getElementById('mgmt-workspace-panel');
    if (panel) renderClinicalStaffTab(panel);
  };

  // ========================================================================
  // ROSTER TAB INTERACTIVE HANDLERS
  // ========================================================================
  window.switchRosterViewMode = function(mode) {
    window.activeRosterViewMode = mode;
    const panel = document.getElementById('mgmt-workspace-panel');
    if (panel) renderDutyRosterTab(panel);
  };

  window.navigateRosterWeek = function(days) {
    const d = new Date(window.activeRosterStartDate);
    d.setDate(d.getDate() + days);
    window.activeRosterStartDate = d.toISOString().slice(0, 10);
    const panel = document.getElementById('mgmt-workspace-panel');
    if (panel) renderDutyRosterTab(panel);
  };

  window.onRosterFilterChange = function(key, val) {
    if (key === 'branch') window.rosterFilterBranch = val;
    else if (key === 'dept') window.rosterFilterDept = val;
    else if (key === 'staffType') window.rosterFilterStaffType = val;
    
    const panel = document.getElementById('mgmt-workspace-panel');
    if (panel) renderDutyRosterTab(panel);
  };

  window.clearStaffRosterFilter = function() {
    window.activeRosterStaffFilter = null;
    const panel = document.getElementById('mgmt-workspace-panel');
    if (panel) renderDutyRosterTab(panel);
  };

  window.onRosterCellClick = function(elem, staffId, dateStr) {
    const role = getActiveRole();
    const canBuild = (role === 'Hospital Administrator' || role === 'Medical Superintendent' || role === 'HR Manager' || role === 'Nursing Supervisor');
    if (!canBuild) {
      alert("Lockout: You do not have permissions to edit rosters.");
      return;
    }
    
    const staff = (window.state.staffList || []).find(s => s.id === staffId);
    if (!staff) return;
    
    const dayShifts = (window.state.rosterShifts || []).filter(r => r.staffId === staffId && r.date === dateStr);
    
    const mount = document.getElementById('roster-modal-mount');
    if (!mount) return;
    
    mount.innerHTML = `
      <div class="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-[9999] p-4">
        <div class="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-4xl w-full p-6 text-left flex flex-col max-h-[85vh]">
          <!-- Header -->
          <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #cbd5e1; padding-bottom:12px; margin-bottom:16px;">
            <div>
              <h3 style="margin:0; font-size:1.1rem; font-weight:800; color:#0f172a; display:flex; align-items:center; gap:8px;">
                <span>📅</span> Modify Daily Shift & Clinical Locations
              </h3>
              <p style="margin:4px 0 0 0; font-size:0.75rem; color:#64748b; font-weight:600; display:flex; align-items:center; gap:8px;">
                <span>Assign multiple shifts for <b>${staff.name}</b> on</span>
                <input type="date" id="roster-modal-date" value="${dateStr}" onchange="window.onRosterCellClick(null, '${staffId}', this.value)" style="font-size:0.75rem; font-weight:700; border:1px solid #cbd5e1; border-radius:6px; padding:2px 8px; cursor:pointer; color:#1e293b; background:#f8fafc; height:26px;">
              </p>
            </div>
            <button onclick="document.getElementById('roster-modal-mount').innerHTML=''" style="background:none; border:none; font-size:1.5rem; color:#64748b; cursor:pointer;">&times;</button>
          </div>

          <!-- Scrollable container of Shift Cards -->
          <div id="roster-shift-cards-container" style="flex-grow:1; overflow-y:auto; padding-right:6px; display:flex; flex-direction:column; gap:16px;">
            <!-- Shift cards will render here -->
          </div>

          <div style="margin-top:12px;">
            <button onclick="window.addRosterShiftRow('Morning', '${staff.type === 'Doctor' ? staff.department : staff.ward}', '', '', '', '${staff.branch || 'Bengaluru HSR (Main)'}')" class="roster-btn" style="width:100%; border-style:dashed; color:#2563eb; font-weight:700; padding:10px; font-size:12px; border-radius:8px;">+ Add Shift Assignment</button>
          </div>

          <!-- Actions Footer -->
          <div style="margin-top:20px; padding-top:16px; border-top:1px solid #e2e8f0; display:flex; justify-content:space-between; align-items:center; gap:12px;">
            <button onclick="window.clearAllDailyShifts('${staffId}', '${dateStr}')" style="background:#fee2e2; color:#ef4444; border:1px solid #fca5a5; padding:8px 16px; border-radius:6px; font-size:0.8rem; font-weight:700; cursor:pointer; transition:all 0.1s;">Clear All Daily Shifts</button>
            <div style="display:flex; gap:10px;">
              <button onclick="document.getElementById('roster-modal-mount').innerHTML=''" class="btn btn-secondary" style="border:1px solid #cbd5e1; background:#ffffff; font-weight:700; padding:8px 16px; border-radius:6px; font-size:0.8rem; cursor:pointer;">Cancel</button>
              <button onclick="window.saveAllDailyShifts('${staffId}', '${dateStr}')" class="btn btn-primary" style="background:#2563eb; color:#ffffff; border:none; padding:8px 20px; border-radius:6px; font-weight:800; cursor:pointer; box-shadow:0 4px 6px -1px rgba(37,99,235,0.2);">Save Roster Changes</button>
            </div>
          </div>
        </div>
      </div>
    `;

    // Populate existing shifts
    if (dayShifts.length > 0) {
      dayShifts.forEach(sh => {
        window.addRosterShiftRow(sh.shift, sh.location, sh.notes, sh.startTime, sh.endTime, sh.branch);
      });
    } else {
      // Default to single blank row
      window.addRosterShiftRow('Morning', staff.type === 'Doctor' ? staff.department : staff.ward, '', '', '', staff.branch || 'Bengaluru HSR (Main)');
    }
  };

  window.addRosterShiftRow = function(shiftVal = 'Morning', locVal = '', notesVal = '', startTimeVal = '', endTimeVal = '', branchVal = '') {
    const container = document.getElementById('roster-shift-cards-container');
    if (!container) return;

    if (!startTimeVal || !endTimeVal) {
      if (shiftVal === 'Morning') { startTimeVal = '07:00'; endTimeVal = '15:00'; }
      else if (shiftVal === 'Evening') { startTimeVal = '15:00'; endTimeVal = '23:00'; }
      else if (shiftVal === 'Night') { startTimeVal = '23:00'; endTimeVal = '07:00'; }
      else if (shiftVal === 'Full Day') { startTimeVal = '09:00'; endTimeVal = '18:00'; }
      else if (shiftVal === 'On Call') { startTimeVal = '09:00'; endTimeVal = '09:00'; }
    }

    if (!branchVal) {
      branchVal = 'Bengaluru HSR (Main)';
    }
    
    const cardDiv = document.createElement('div');
    cardDiv.className = 'roster-shift-row bg-slate-50 border border-slate-200 rounded-xl p-4 relative';
    cardDiv.style = 'display:flex; flex-direction:column; gap:12px;';
    
    cardDiv.innerHTML = `
      <button onclick="this.parentElement.remove()" style="position:absolute; top:12px; right:12px; background:#fee2e2; border:1px solid #fca5a5; color:#ef4444; border-radius:50%; width:22px; height:22px; display:flex; align-items:center; justify-content:center; cursor:pointer; font-size:11px; font-weight:700;" title="Remove shift">✕</button>

      <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:14px;">
        <div>
          <label style="display:block; font-size:0.7rem; font-weight:800; color:#475569; text-transform:uppercase; margin-bottom:4px;">Shift Name</label>
          <select class="pop-row-shift filter-input" onchange="window.updateShiftTimes(this)" style="width:100%; font-size:12px; padding:6px; border-radius:6px; border:1px solid #cbd5e1; background:#ffffff; height:34px;">
            <option value="Morning" ${shiftVal === 'Morning' ? 'selected' : ''}>Morning Shift (7am - 3pm)</option>
            <option value="Evening" ${shiftVal === 'Evening' ? 'selected' : ''}>Evening Shift (3pm - 11pm)</option>
            <option value="Night" ${shiftVal === 'Night' ? 'selected' : ''}>Night Shift (11pm - 7am)</option>
            <option value="Full Day" ${shiftVal === 'Full Day' ? 'selected' : ''}>Full Day Shift (9am - 6pm)</option>
            <option value="On Call" ${shiftVal === 'On Call' ? 'selected' : ''}>On Call Duty</option>
            <option value="Off" ${shiftVal === 'Off' ? 'selected' : ''}>OFF / Weekly Off</option>
            <option value="Leave" ${shiftVal === 'Leave' ? 'selected' : ''}>Leave</option>
          </select>
        </div>
        <div>
          <label style="display:block; font-size:0.7rem; font-weight:800; color:#475569; text-transform:uppercase; margin-bottom:4px;">Assigned Branch</label>
          <select class="pop-row-branch filter-input" style="width:100%; font-size:12px; padding:6px; border-radius:6px; border:1px solid #cbd5e1; background:#ffffff; height:34px;">
            <option value="Bengaluru HSR (Main)" ${branchVal === 'Bengaluru HSR (Main)' ? 'selected' : ''}>Bengaluru HSR (Main)</option>
            <option value="Whitefield Clinic" ${branchVal === 'Whitefield Clinic' ? 'selected' : ''}>Whitefield Clinic</option>
            <option value="Electronic City Hub" ${branchVal === 'Electronic City Hub' ? 'selected' : ''}>Electronic City Hub</option>
          </select>
        </div>
        <div>
          <label style="display:block; font-size:0.7rem; font-weight:800; color:#475569; text-transform:uppercase; margin-bottom:4px;">Clinical Location (Ward/OPD)</label>
          <select class="pop-row-location filter-input" style="width:100%; font-size:12px; padding:6px; border-radius:6px; border:1px solid #cbd5e1; background:#ffffff; height:34px;">
            <optgroup label="🏥 Inpatient Wards">
              <option value="ICU" ${locVal === 'ICU' ? 'selected' : ''}>Intensive Care Unit (ICU)</option>
              <option value="General Ward (Male)" ${locVal === 'General Ward (Male)' ? 'selected' : ''}>General Ward Male</option>
              <option value="General Ward (Female)" ${locVal === 'General Ward (Female)' ? 'selected' : ''}>General Ward Female</option>
              <option value="Semi-Private Ward" ${locVal === 'Semi-Private Ward' ? 'selected' : ''}>Semi-Private Ward</option>
              <option value="Private Room" ${locVal === 'Private Room' ? 'selected' : ''}>Private Room</option>
            </optgroup>
            <optgroup label="🩺 Outpatient Clinics (OPD)">
              <option value="Cardiology" ${locVal === 'Cardiology' ? 'selected' : ''}>Cardiology Clinic</option>
              <option value="Orthopedics" ${locVal === 'Orthopedics' ? 'selected' : ''}>Orthopedics Clinic</option>
              <option value="Pediatrics" ${locVal === 'Pediatrics' ? 'selected' : ''}>Pediatrics Clinic</option>
              <option value="General Medicine" ${locVal === 'General Medicine' ? 'selected' : ''}>General Medicine OPD</option>
              <option value="Emergency Medicine" ${locVal === 'Emergency Medicine' ? 'selected' : ''}>Emergency Casualty</option>
            </optgroup>
            <optgroup label="⚕️ Specialty & Surgical">
              <option value="Cath Lab" ${locVal === 'Cath Lab' ? 'selected' : ''}>Cath Lab Suite</option>
              <option value="OT Suite 1" ${locVal === 'OT Suite 1' ? 'selected' : ''}>Operating Theatre 1</option>
              <option value="Radiology" ${locVal === 'Radiology' ? 'selected' : ''}>Radiology Department</option>
            </optgroup>
          </select>
        </div>
      </div>

      <div style="display:grid; grid-template-columns:1fr 1fr 2fr; gap:14px;">
        <div>
          <label style="display:block; font-size:0.7rem; font-weight:800; color:#475569; text-transform:uppercase; margin-bottom:4px;">Start Time</label>
          <input type="time" class="pop-row-start filter-input" style="width:100%; font-size:12px; padding:6px; border-radius:6px; border:1px solid #cbd5e1; height:34px;" value="${startTimeVal}">
        </div>
        <div>
          <label style="display:block; font-size:0.7rem; font-weight:800; color:#475569; text-transform:uppercase; margin-bottom:4px;">End Time</label>
          <input type="time" class="pop-row-end filter-input" style="width:100%; font-size:12px; padding:6px; border-radius:6px; border:1px solid #cbd5e1; height:34px;" value="${endTimeVal}">
        </div>
        <div>
          <label style="display:block; font-size:0.7rem; font-weight:800; color:#475569; text-transform:uppercase; margin-bottom:4px;">Coverage / Handover Notes</label>
          <input type="text" class="pop-row-notes filter-input" style="width:100%; font-size:12px; padding:6px; border-radius:6px; border:1px solid #cbd5e1; height:34px;" value="${notesVal}" placeholder="e.g. Rounding support cover">
        </div>
      </div>
    `;
    container.appendChild(cardDiv);
  };

  window.updateShiftTimes = function(selectEl) {
    const card = selectEl.closest('.roster-shift-row');
    if (!card) return;
    const startInput = card.querySelector('.pop-row-start');
    const endInput = card.querySelector('.pop-row-end');
    if (!startInput || !endInput) return;
    
    const val = selectEl.value;
    if (val === 'Morning') { startInput.value = '07:00'; endInput.value = '15:00'; }
    else if (val === 'Evening') { startInput.value = '15:00'; endInput.value = '23:00'; }
    else if (val === 'Night') { startInput.value = '23:00'; endInput.value = '07:00'; }
    else if (val === 'Full Day') { startInput.value = '09:00'; endInput.value = '18:00'; }
    else if (val === 'On Call') { startInput.value = '09:00'; endInput.value = '09:00'; }
    else { startInput.value = ''; endInput.value = ''; }
  };

  window.saveAllDailyShifts = function(staffId, dateStr) {
    const activeDateInput = document.getElementById('roster-modal-date');
    const targetDate = activeDateInput ? activeDateInput.value : dateStr;
    
    const rows = document.querySelectorAll('.roster-shift-row');
    const newShifts = [];
    
    let hasActiveShift = false;
    
    rows.forEach(r => {
      const shift = r.querySelector('.pop-row-shift').value;
      const branch = r.querySelector('.pop-row-branch').value;
      const location = r.querySelector('.pop-row-location').value;
      const notes = r.querySelector('.pop-row-notes').value.trim();
      const startTime = r.querySelector('.pop-row-start').value;
      const endTime = r.querySelector('.pop-row-end').value;
      
      newShifts.push({ staffId, date: targetDate, shift, branch, location, notes, startTime, endTime });
      if (shift !== 'Off' && shift !== 'Leave') {
        hasActiveShift = true;
      }
    });

    const staff = (window.state.staffList || []).find(s => s.id === staffId);
    if (staff && staff.statusToday === 'On Leave' && targetDate === window._HIS_DATE(0) && hasActiveShift) {
      const override = confirm("Leave Conflict Detected: Staff is currently on approved leave. Overwrite this approved leave request and force assign shift?");
      if (!override) return;
    }

    // Filter out existing shifts for this staff and date
    window.state.rosterShifts = (window.state.rosterShifts || []).filter(r => !(r.staffId === staffId && r.date === targetDate));

    // Append the new daily shifts
    newShifts.forEach(sh => {
      window.state.rosterShifts.push(sh);
    });

    localStorage.setItem('saronil_rosterShifts', JSON.stringify(window.state.rosterShifts));
    document.getElementById('roster-modal-mount').innerHTML = '';
    const panel = document.getElementById('mgmt-workspace-panel');
    if (panel) renderDutyRosterTab(panel);
  };

  window.clearAllDailyShifts = function(staffId, dateStr) {
    const activeDateInput = document.getElementById('roster-modal-date');
    const targetDate = activeDateInput ? activeDateInput.value : dateStr;
    
    window.state.rosterShifts = (window.state.rosterShifts || []).filter(r => !(r.staffId === staffId && r.date === targetDate));
    localStorage.setItem('saronil_rosterShifts', JSON.stringify(window.state.rosterShifts));
    document.getElementById('roster-modal-mount').innerHTML = '';
    const panel = document.getElementById('mgmt-workspace-panel');
    if (panel) renderDutyRosterTab(panel);
  };

  window.saveRosterCell = function(staffId, dateStr) {
    window.saveAllDailyShifts(staffId, dateStr);
  };

  window.clearRosterCell = function(staffId, dateStr) {
    window.clearAllDailyShifts(staffId, dateStr);
  };

  window.assignGapStaff = function(location, dateStr, shiftVal, staffType) {
    const mount = document.getElementById('roster-modal-mount');
    if (!mount) return;
    
    let candidates = (window.state.staffList || []).filter(s => s.type === staffType);
    candidates = candidates.filter(s => s.status !== 'On Leave' && s.statusToday !== 'On Leave');
    candidates = candidates.filter(s => {
      const dayShift = (window.state.rosterShifts || []).find(r => r.staffId === s.id && r.date === dateStr);
      return !dayShift || dayShift.shift === 'Off';
    });
    
    const mondayStr = window.activeRosterStartDate;
    const mondayDate = new Date(mondayStr);
    const weekDates = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(mondayDate);
      d.setDate(mondayDate.getDate() + i);
      weekDates.push(d.toISOString().slice(0, 10));
    }
    
    candidates.forEach(c => {
      c.weekShiftCount = (window.state.rosterShifts || []).filter(r => r.staffId === c.id && weekDates.includes(r.date) && r.shift !== 'Off').length;
    });
    
    candidates.sort((a, b) => a.weekShiftCount - b.weekShiftCount);
    
    mount.innerHTML = `
      <div class="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-[9999] p-4">
        <div class="bg-white rounded-xl border border-slate-200 shadow-lg max-w-md w-full p-5 text-left flex flex-col max-h-[85vh]">
          <h4 style="margin:0 0 4px 0; font-size:0.85rem; font-weight:800; color:#1e293b; text-transform:uppercase;">Resolve Coverage Gap</h4>
          <span style="font-size:0.74rem; color:#dc2626; font-weight:700;">Location: ${location} · ${dateStr} (${shiftVal} Shift)</span>
          
          <div style="margin-top:14px; overflow-y:auto; flex-grow:1; max-height:300px; border:1px solid #cbd5e1; border-radius:6px; padding:6px;">
            <table style="width:100%; border-collapse:collapse; font-size:0.75rem;">
              <thead>
                <tr style="background:#f8fafc; border-bottom:1px solid #cbd5e1;">
                  <th style="padding:6px; text-align:left;">Staff Candidate</th>
                  <th style="padding:6px; text-align:center;">Shifts This Week</th>
                  <th style="padding:6px; text-align:right;">Action</th>
                </tr>
              </thead>
              <tbody>
                ${candidates.map(c => `
                  <tr style="border-bottom:1px solid #f1f5f9;">
                    <td style="padding:6px;">
                      <strong>${c.name}</strong><br>
                      <small style="color:#64748b;">${c.designation} (${c.department})</small>
                    </td>
                    <td style="padding:6px; text-align:center; font-weight:700;">${c.weekShiftCount} working</td>
                    <td style="padding:6px; text-align:right;">
                      <button onclick="window.confirmGapAssignment('${c.id}', '${dateStr}', '${shiftVal}', '${location}')" style="background:#10b981; color:#fff; border:none; border-radius:4px; font-size:0.65rem; padding:4px 8px; font-weight:700; cursor:pointer;">Assign</button>
                    </td>
                  </tr>
                `).join('')}
                ${candidates.length === 0 ? `
                  <tr>
                    <td colspan="3" style="text-align:center; padding:20px; color:#64748b;">No available matching staff found.</td>
                  </tr>
                ` : ''}
              </tbody>
            </table>
          </div>
          
          <div style="margin-top:16px; display:flex; justify-content:flex-end; border-top:1px solid #e2e8f0; padding-top:10px;">
            <button onclick="document.getElementById('roster-modal-mount').innerHTML=''" class="btn btn-secondary btn-sm" style="border:1px solid #cbd5e1; background:#ffffff; font-weight:600; cursor:pointer;">Cancel</button>
          </div>
        </div>
      </div>
    `;
  };

  window.confirmGapAssignment = function(staffId, dateStr, shiftVal, location) {
    let idx = (window.state.rosterShifts || []).findIndex(r => r.staffId === staffId && r.date === dateStr);
    if (idx > -1) {
      window.state.rosterShifts[idx].shift = shiftVal;
      window.state.rosterShifts[idx].location = location;
    } else {
      window.state.rosterShifts.push({ staffId, date: dateStr, shift: shiftVal, location, notes: 'Resolved coverage gap' });
    }
    
    localStorage.setItem('saronil_rosterShifts', JSON.stringify(window.state.rosterShifts));
    document.getElementById('roster-modal-mount').innerHTML = '';
    const panel = document.getElementById('mgmt-workspace-panel');
    if (panel) renderDutyRosterTab(panel);
  };

  window.openTemplateModal = function() {
    const mount = document.getElementById('roster-modal-mount');
    if (!mount) return;
    
    mount.innerHTML = `
      <div class="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-[9999] p-4">
        <div class="bg-white rounded-xl border border-slate-200 shadow-lg max-w-sm w-full p-5 text-left">
          <h4 style="margin:0 0 6px 0; font-size:0.85rem; font-weight:800; color:#1e293b; text-transform:uppercase;">Shift Patterns & Templates</h4>
          <span style="font-size:0.72rem; color:#64748b;">Select a template to auto-populate the active week roster.</span>
          
          <div style="margin-top:14px; display:flex; flex-direction:column; gap:10px;">
            <div style="background:#f8fafc; border:1px solid #cbd5e1; border-radius:6px; padding:10px; cursor:pointer;" onclick="window.applyRosterTemplate('Rotating')">
              <strong>Nursing — 3 Shift Rotating Template</strong><br>
              <small style="color:#64748b;">Mon-Sat: Morning/Evening/Night rotation pattern, Sundays OFF.</small>
            </div>
            <div style="background:#f8fafc; border:1px solid #cbd5e1; border-radius:6px; padding:10px; cursor:pointer;" onclick="window.applyRosterTemplate('12Hour')">
              <strong>ICU — 12-Hour Critical Care Template</strong><br>
              <small style="color:#64748b;">Mon-Sat: Alternating Day 7am-7pm / Night 7pm-7am patterns.</small>
            </div>
            <div style="background:#f8fafc; border:1px solid #cbd5e1; border-radius:6px; padding:10px; cursor:pointer;" onclick="window.applyRosterTemplate('OPDFixed')">
              <strong>Doctor — OPD Consultation Fixed Template</strong><br>
              <small style="color:#64748b;">Mon/Wed/Fri: OPD consultations locked, Tue/Thu: Ward rounds.</small>
            </div>
          </div>
          
          <div style="margin-top:16px; display:flex; justify-content:flex-end; border-top:1px solid #e2e8f0; padding-top:10px;">
            <button onclick="document.getElementById('roster-modal-mount').innerHTML=''" class="btn btn-secondary btn-sm" style="border:1px solid #cbd5e1; background:#ffffff; font-weight:600; cursor:pointer;">Cancel</button>
          </div>
        </div>
      </div>
    `;
  };

  window.applyRosterTemplate = function(type) {
    const mondayStr = window.activeRosterStartDate;
    const mondayDate = new Date(mondayStr);
    const weekDates = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(mondayDate);
      d.setDate(mondayDate.getDate() + i);
      weekDates.push(d.toISOString().slice(0, 10));
    }
    
    const staff = window.state.staffList || [];
    
    staff.forEach((s, sIdx) => {
      weekDates.forEach((dateStr, i) => {
        let shift = 'Morning';
        
        if (type === 'Rotating') {
          if (i === 6) shift = 'Off';
          else if (sIdx % 3 === 0) shift = (i % 3 === 0 ? 'Morning' : (i % 3 === 1 ? 'Evening' : 'Night'));
          else if (sIdx % 3 === 1) shift = (i % 3 === 0 ? 'Evening' : (i % 3 === 1 ? 'Night' : 'Morning'));
          else shift = (i % 3 === 0 ? 'Night' : (i % 3 === 1 ? 'Morning' : 'Evening'));
        } 
        else if (type === '12Hour') {
          if (i === 6) shift = 'Off';
          else shift = i % 2 === 0 ? 'Morning' : 'Night';
        }
        else if (type === 'OPDFixed') {
          if (s.type === 'Doctor') {
            shift = (i === 0 || i === 2 || i === 4) ? 'Morning' : 'Off';
          } else {
            shift = i % 2 === 0 ? 'Morning' : 'Evening';
          }
        }
        
        let idx = (window.state.rosterShifts || []).findIndex(r => r.staffId === s.id && r.date === dateStr);
        if (idx > -1) {
          window.state.rosterShifts[idx].shift = shift;
        } else {
          window.state.rosterShifts.push({ staffId: s.id, date: dateStr, shift, location: s.type === 'Doctor' ? s.department : s.ward, notes: 'Template assignment' });
        }
      });
    });
    
    localStorage.setItem('saronil_rosterShifts', JSON.stringify(window.state.rosterShifts));
    alert(`Roster template applied successfully for active week context.`);
    document.getElementById('roster-modal-mount').innerHTML = '';
    const panel = document.getElementById('mgmt-workspace-panel');
    if (panel) renderDutyRosterTab(panel);
  };

  window.exportRosterPDF = function() {
    alert("Printing... Roster sheet sent to printer queue 'HR-ROSTER-PRINTER' (NABL/NABH compliance log printed).");
  };

  window.publishRoster = function() {
    alert("Success: Duty roster finalized, signed, and published for the selected week. Automated notifications dispatched to clinical staff via SMS and WhatsApp.");
  };

  /* ══════════════════════════════════════════════════════════════════════════
     HOSPITAL MANAGEMENT — GRIEVANCES / COMPLAINTS LOGGING & RESOLUTION
     ══════════════════════════════════════════════════════════════════════════ */

  /* ── NEW COMPLAINT FORM ─────────────────────────────────────────────────── */
  window.mgmtOpenNewComplaintForm = function() {
    if (document.getElementById('mgmt-complaint-new-overlay')) return;

    var overlay = document.createElement('div');
    overlay.id = 'mgmt-complaint-new-overlay';
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(15,23,42,0.55);backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center;z-index:9999;padding:16px;';

    overlay.innerHTML = `
      <div style="background:#fff;border-radius:16px;width:520px;max-width:100%;box-shadow:0 24px 60px rgba(0,0,0,0.18);overflow:hidden;font-family:inherit;">
        <div style="background:linear-gradient(135deg,#1e3a5f 0%,#1d4ed8 100%);padding:18px 22px;display:flex;justify-content:space-between;align-items:center;">
          <div>
            <h3 style="margin:0;color:#fff;font-size:15px;font-weight:800;">🚩 File New Patient Complaint</h3>
            <p style="margin:3px 0 0;color:#bfdbfe;font-size:11px;">Register patient grievances directly into Quality &amp; Safety Ledger.</p>
          </div>
          <button onclick="document.getElementById('mgmt-complaint-new-overlay').remove()" style="background:rgba(255,255,255,0.15);border:none;color:#fff;width:28px;height:28px;border-radius:50%;font-size:14px;cursor:pointer;">✕</button>
        </div>
        <div style="padding:20px 22px;display:flex;flex-direction:column;gap:14px;">
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;">
            <div>
              <label style="font-size:11px;font-weight:700;color:#374151;display:block;margin-bottom:5px;">Concerned Department *</label>
              <select id="m-cmp-dept" style="width:100%;padding:8px 10px;border:1px solid #d1d5db;border-radius:8px;font-size:12px;color:#1f2937;background:#fff;">
                <option value="">— Select Department —</option>
                <option>Billing</option>
                <option>OPD Reception</option>
                <option>General Medicine</option>
                <option>Facilities &amp; Sanitation</option>
                <option>Emergency</option>
                <option>OT Room</option>
                <option>Nursing</option>
                <option>Dietary</option>
              </select>
            </div>
            <div>
              <label style="font-size:11px;font-weight:700;color:#374151;display:block;margin-bottom:5px;">Priority *</label>
              <select id="m-cmp-priority" style="width:100%;padding:8px 10px;border:1px solid #d1d5db;border-radius:8px;font-size:12px;color:#1f2937;background:#fff;">
                <option value="High">🔴 High — Breach alert</option>
                <option value="Medium" selected>🟡 Medium</option>
                <option value="Low">🔵 Low</option>
              </select>
            </div>
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;">
            <div>
              <label style="font-size:11px;font-weight:700;color:#374151;display:block;margin-bottom:5px;">Complainant Name *</label>
              <input type="text" id="m-cmp-complainant" placeholder="e.g. Aalok Kumar..." style="width:100%;padding:8px 10px;border:1px solid #d1d5db;border-radius:8px;font-size:12px;color:#1f2937;box-sizing:border-box;">
            </div>
            <div>
              <label style="font-size:11px;font-weight:700;color:#374151;display:block;margin-bottom:5px;">Contact Mobile *</label>
              <input type="text" id="m-cmp-mobile" placeholder="+91 99000 00000" style="width:100%;padding:8px 10px;border:1px solid #d1d5db;border-radius:8px;font-size:12px;color:#1f2937;box-sizing:border-box;">
            </div>
          </div>
          <div>
            <label style="font-size:11px;font-weight:700;color:#374151;display:block;margin-bottom:5px;">Nature / Short Concern *</label>
            <input type="text" id="m-cmp-nature" placeholder="e.g. Overcharging, Long Wait, Rude Behavior..." style="width:100%;padding:8px 10px;border:1px solid #d1d5db;border-radius:8px;font-size:12px;color:#1f2937;box-sizing:border-box;">
          </div>
          <div>
            <label style="font-size:11px;font-weight:700;color:#374151;display:block;margin-bottom:5px;">Detailed Description *</label>
            <textarea id="m-cmp-description" rows="4" placeholder="Detail the complaint..." style="width:100%;padding:8px 10px;border:1px solid #d1d5db;border-radius:8px;font-size:12px;color:#1f2937;resize:vertical;box-sizing:border-box;font-family:inherit;"></textarea>
          </div>
        </div>
        <div style="padding:14px 22px;border-top:1px solid #f1f5f9;display:flex;justify-content:flex-end;gap:10px;">
          <button onclick="document.getElementById('mgmt-complaint-new-overlay').remove()" style="padding:8px 18px;border:1px solid #d1d5db;background:#fff;border-radius:8px;font-size:12px;font-weight:700;color:#374151;cursor:pointer;">Cancel</button>
          <button onclick="window.mgmtSubmitNewComplaint()" style="padding:8px 20px;background:#1d4ed8;border:none;border-radius:8px;font-size:12px;font-weight:700;color:#fff;cursor:pointer;">Submit Complaint →</button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);
    overlay.addEventListener('click', function(e) { if (e.target === overlay) overlay.remove(); });
  };

  window.mgmtSubmitNewComplaint = function() {
    var dept = (document.getElementById('m-cmp-dept') || {}).value || '';
    var priority = (document.getElementById('m-cmp-priority') || {}).value || '';
    var complainant = ((document.getElementById('m-cmp-complainant') || {}).value || '').trim();
    var mobile = ((document.getElementById('m-cmp-mobile') || {}).value || '').trim();
    var nature = ((document.getElementById('m-cmp-nature') || {}).value || '').trim();
    var description = ((document.getElementById('m-cmp-description') || {}).value || '').trim();

    if (!dept) { alert('Please select a department.'); return; }
    if (!priority) { alert('Please select priority.'); return; }
    if (!complainant) { alert('Please enter complainant name.'); return; }
    if (!mobile) { alert('Please enter contact mobile.'); return; }
    if (!nature) { alert('Please enter nature of complaint.'); return; }
    if (description.length < 10) { alert('Please enter description (at least 10 characters).'); return; }

    var now = new Date();
    var dateStr = now.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/ /g, '-');
    
    var slaDate = new Date();
    if (priority === 'High') {
      slaDate.setHours(slaDate.getHours() + 24);
    } else if (priority === 'Medium') {
      slaDate.setHours(slaDate.getHours() + 48);
    } else {
      slaDate.setDate(slaDate.getDate() + 7);
    }
    var slaDueStr = slaDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/ /g, '-');

    window.state.mgmtComplaints = window.state.mgmtComplaints || [];
    var serial = String(window.state.mgmtComplaints.length + 21).padStart(4, '0');
    var cmpId = 'CMP-2026-' + serial;

    window.state.mgmtComplaints.unshift({
      id: cmpId,
      date: dateStr,
      complainant: complainant,
      mob: mobile,
      dept: dept,
      nature: nature,
      priority: priority,
      assignedTo: 'Patient Relations Officer',
      status: 'Open',
      slaDue: slaDueStr,
      description: description,
      actions: []
    });

    localStorage.setItem('saronil_mgmtComplaints', JSON.stringify(window.state.mgmtComplaints));

    document.getElementById('mgmt-complaint-new-overlay').remove();
    alert('Grievance ' + cmpId + ' registered successfully under Quality Assurance.');

    var panel = document.getElementById('mgmt-workspace-panel');
    if (panel) renderComplaintsTab(panel);
  };

  /* ── COMPLAINT DETAIL POPUP ─────────────────────────────────────────────── */
  window.mgmtOpenComplaintDetail = function(id) {
    var list = window.state.mgmtComplaints || [];
    var c = list.find(item => item.id === id);
    if (!c) return;

    var existing = document.getElementById('mgmt-complaint-detail-overlay');
    if (existing) existing.remove();

    var isOpen = c.status === 'Open';

    var overlay = document.createElement('div');
    overlay.id = 'mgmt-complaint-detail-overlay';
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(15,23,42,0.55);backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center;z-index:9999;padding:16px;';

    overlay.innerHTML = `
      <div style="background:#fff;border-radius:16px;width:560px;max-width:100%;box-shadow:0 24px 60px rgba(0,0,0,0.2);overflow:hidden;font-family:inherit;">
        <div style="background:${isOpen ? 'linear-gradient(135deg,#7f1d1d,#dc2626)' : 'linear-gradient(135deg,#14532d,#16a34a)'};padding:18px 22px;display:flex;justify-content:space-between;align-items:flex-start;">
          <div>
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;flex-wrap:wrap;">
              <span style="font-family:monospace;font-size:13px;font-weight:800;color:#fff;">${c.id}</span>
              <span style="font-size:10px;background:rgba(255,255,255,0.2);color:#fff;padding:2px 8px;border-radius:20px;font-weight:700;">${c.priority} Priority</span>
              <span style="font-size:10px;background:rgba(255,255,255,0.2);color:#fff;padding:2px 8px;border-radius:20px;font-weight:700;">${c.status}</span>
            </div>
            <h3 style="margin:0;color:#fff;font-size:14px;font-weight:700;">${c.nature}</h3>
            <p style="margin:3px 0 0;color:rgba(255,255,255,0.75);font-size:11px;">Complainant: ${c.complainant} &bull; Mob: ${c.mob} &bull; Dept: ${c.dept}</p>
          </div>
          <button onclick="document.getElementById('mgmt-complaint-detail-overlay').remove()" style="background:rgba(255,255,255,0.2);border:none;color:#fff;width:28px;height:28px;border-radius:50%;font-size:14px;cursor:pointer;flex-shrink:0;">✕</button>
        </div>

        <div style="padding:20px 22px;display:flex;flex-direction:column;gap:16px;">
          <div>
            <p style="margin:0 0 6px;font-size:10px;font-weight:700;color:#6b7280;letter-spacing:0.06em;text-transform:uppercase;">Grievance Details</p>
            <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:12px 14px;font-size:12px;color:#374151;line-height:1.6;">${c.description}</div>
          </div>

          ${!isOpen && c.actions && c.actions.length > 0 ? `
            <div>
              <p style="margin:0 0 6px;font-size:10px;font-weight:700;color:#15803d;letter-spacing:0.06em;text-transform:uppercase;">✅ Resolution Log</p>
              <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:12px 14px;font-size:12px;color:#166534;line-height:1.6;">
                ${c.actions.join('<br>')}
              </div>
            </div>
          ` : ''}

          ${isOpen ? `
            <div style="border-top:1px solid #f1f5f9;padding-top:16px;">
              <p style="margin:0 0 8px;font-size:11px;font-weight:700;color:#1d4ed8;">📝 Provide Resolution</p>
              <textarea id="m-cmp-resolution-text" rows="4" placeholder="Describe resolution action taken..." style="width:100%;padding:10px 12px;border:1.5px solid #93c5fd;border-radius:8px;font-size:12px;color:#1f2937;resize:vertical;box-sizing:border-box;font-family:inherit;outline:none;" onfocus="this.style.borderColor='#2563eb'" onblur="this.style.borderColor='#93c5fd'"></textarea>
              <p style="margin:5px 0 0;font-size:10px;color:#6b7280;">Minimum 15 characters required.</p>
            </div>
          ` : ''}
        </div>

        <div style="padding:14px 22px;border-top:1px solid #f1f5f9;display:flex;justify-content:flex-end;gap:10px;">
          <button onclick="document.getElementById('mgmt-complaint-detail-overlay').remove()" style="padding:8px 18px;border:1px solid #d1d5db;background:#fff;border-radius:8px;font-size:12px;font-weight:700;color:#374151;cursor:pointer;">${isOpen ? 'Cancel' : 'Close'}</button>
          ${isOpen ? `<button onclick="window.mgmtComplaintResolve('${c.id}')" style="padding:8px 22px;background:linear-gradient(135deg,#16a34a,#059669);border:none;border-radius:8px;font-size:12px;font-weight:700;color:#fff;cursor:pointer;">✅ Mark as Resolved</button>` : ''}
        </div>
      </div>
    `;
    document.body.appendChild(overlay);
    overlay.addEventListener('click', function(e) { if (e.target === overlay) overlay.remove(); });
  };

  /* ── RESOLVE COMPLAINT ──────────────────────────────────────────────────── */
  window.mgmtComplaintResolve = function(id) {
    var resText = ((document.getElementById('m-cmp-resolution-text') || {}).value || '').trim();
    if (resText.length < 15) {
      alert('Please enter a resolution (minimum 15 characters) before marking as resolved.');
      return;
    }

    var list = window.state.mgmtComplaints || [];
    var c = list.find(item => item.id === id);
    if (!c) return;

    var now = new Date();
    var dateStr = now.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/ /g, '-');

    c.status = 'Resolved';
    c.actions = c.actions || [];
    c.actions.push('Resolved on ' + dateStr + ': ' + resText);

    localStorage.setItem('saronil_mgmtComplaints', JSON.stringify(window.state.mgmtComplaints));

    var overlay = document.getElementById('mgmt-complaint-detail-overlay');
    if (!overlay) return;

    overlay.querySelector('div').innerHTML = `
      <div style="border-radius:16px;overflow:hidden;text-align:center;">
        <div style="background:linear-gradient(135deg,#14532d,#16a34a);padding:36px 28px 28px;">
          <div style="width:68px;height:68px;background:rgba(255,255,255,0.2);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:34px;margin:0 auto 14px;">✅</div>
          <h3 style="margin:0;color:#fff;font-size:18px;font-weight:800;">Grievance Resolved!</h3>
          <p style="margin:6px 0 0;color:rgba(255,255,255,0.8);font-size:12px;">${c.id} has been successfully closed.</p>
        </div>
        <div style="padding:22px 26px;display:flex;flex-direction:column;gap:14px;background:#fff;">
          <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;padding:14px;text-align:left;">
            <p style="margin:0 0 6px;font-size:10px;font-weight:700;color:#15803d;text-transform:uppercase;letter-spacing:0.06em;">Resolution Summary</p>
            <p style="margin:0;font-size:12px;color:#166534;line-height:1.55;">${resText}</p>
          </div>
        </div>
        <div style="padding:14px 26px 20px;background:#fff;">
          <button id="m-cmp-success-close-btn" style="width:100%;padding:11px;background:linear-gradient(135deg,#14532d,#16a34a);border:none;border-radius:10px;font-size:13px;font-weight:800;color:#fff;cursor:pointer;">Close</button>
        </div>
      </div>
    `;

    document.getElementById('m-cmp-success-close-btn').addEventListener('click', function() {
      overlay.remove();
      var panel = document.getElementById('mgmt-workspace-panel');
      if (panel) renderComplaintsTab(panel);
    });
  };

  /* ══════════════════════════════════════════════════════════════════════════
     CLINICAL INCIDENTS — LOGGING & RESOLUTION WORKFLOWS
     ══════════════════════════════════════════════════════════════════════════ */

  /* ── NEW INCIDENT FORM OVERLAY ─────────────────────────────────────────── */
  window.mgmtOpenNewIncidentForm = function() {
    if (document.getElementById('mgmt-incident-new-overlay')) return;

    var overlay = document.createElement('div');
    overlay.id = 'mgmt-incident-new-overlay';
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(15,23,42,0.55);backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center;z-index:9999;padding:16px;';

    overlay.innerHTML = `
      <div style="background:#fff;border-radius:16px;width:520px;max-width:100%;box-shadow:0 24px 60px rgba(0,0,0,0.18);overflow:hidden;font-family:inherit;">
        <div style="background:linear-gradient(135deg,#1e3a5f 0%,#1d4ed8 100%);padding:18px 22px;display:flex;justify-content:space-between;align-items:center;">
          <div>
            <h3 style="margin:0;color:#fff;font-size:15px;font-weight:800;">🚩 File Clinical Incident Report</h3>
            <p style="margin:3px 0 0;color:#bfdbfe;font-size:11px;">Report clinical incidents for QA, Sentinel review &amp; Root Cause Analysis.</p>
          </div>
          <button onclick="document.getElementById('mgmt-incident-new-overlay').remove()" style="background:rgba(255,255,255,0.15);border:none;color:#fff;width:28px;height:28px;border-radius:50%;font-size:14px;cursor:pointer;">✕</button>
        </div>
        <div style="padding:20px 22px;display:flex;flex-direction:column;gap:14px;">
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;">
            <div>
              <label style="font-size:11px;font-weight:700;color:#374151;display:block;margin-bottom:5px;">Incident Type *</label>
              <select id="m-inc-type" style="width:100%;padding:8px 10px;border:1px solid #d1d5db;border-radius:8px;font-size:12px;color:#1f2937;background:#fff;">
                <option value="Medication error">Medication error</option>
                <option value="Patient fall">Patient fall</option>
                <option value="Needle stick (staff)">Needle stick (staff)</option>
                <option value="Equipment failure causing harm">Equipment failure causing harm</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label style="font-size:11px;font-weight:700;color:#374151;display:block;margin-bottom:5px;">Severity *</label>
              <select id="m-inc-severity" style="width:100%;padding:8px 10px;border:1px solid #d1d5db;border-radius:8px;font-size:12px;color:#1f2937;background:#fff;">
                <option value="Minor">Minor</option>
                <option value="Serious">Serious</option>
                <option value="Sentinel">Sentinel — death/permanent harm</option>
              </select>
            </div>
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;">
            <div>
              <label style="font-size:11px;font-weight:700;color:#374151;display:block;margin-bottom:5px;">Concerned Department *</label>
              <input type="text" id="m-inc-dept" placeholder="e.g. ICU, Emergency, OT..." style="width:100%;padding:8px 10px;border:1px solid #d1d5db;border-radius:8px;font-size:12px;color:#1f2937;box-sizing:border-box;">
            </div>
            <div>
              <label style="font-size:11px;font-weight:700;color:#374151;display:block;margin-bottom:5px;">Patient involved (Optional / UHID)</label>
              <input type="text" id="m-inc-patient" placeholder="e.g. Rajesh Kumar (UH-2026-000001) or —" style="width:100%;padding:8px 10px;border:1px solid #d1d5db;border-radius:8px;font-size:12px;color:#1f2937;box-sizing:border-box;">
            </div>
          </div>
          <div>
            <label style="font-size:11px;font-weight:700;color:#374151;display:block;margin-bottom:5px;">Brief description of what happened *</label>
            <textarea id="m-inc-description" rows="3" placeholder="Describe details of the incident..." style="width:100%;padding:8px 10px;border:1px solid #d1d5db;border-radius:8px;font-size:12px;color:#1f2937;resize:vertical;box-sizing:border-box;font-family:inherit;"></textarea>
          </div>
          <div>
            <label style="font-size:11px;font-weight:700;color:#374151;display:block;margin-bottom:5px;">Immediate Action Taken *</label>
            <input type="text" id="m-inc-action-taken" placeholder="e.g. Vitals checked, first-aid administered..." style="width:100%;padding:8px 10px;border:1px solid #d1d5db;border-radius:8px;font-size:12px;color:#1f2937;box-sizing:border-box;">
          </div>
        </div>
        <div style="padding:14px 22px;border-top:1px solid #f1f5f9;display:flex;justify-content:flex-end;gap:10px;">
          <button onclick="document.getElementById('mgmt-incident-new-overlay').remove()" style="padding:8px 18px;border:1px solid #d1d5db;background:#fff;border-radius:8px;font-size:12px;font-weight:700;color:#374151;cursor:pointer;">Cancel</button>
          <button onclick="window.mgmtSubmitNewIncident()" style="padding:8px 20px;background:#1d4ed8;border:none;border-radius:8px;font-size:12px;font-weight:700;color:#fff;cursor:pointer;">Submit Report →</button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);
    overlay.addEventListener('click', function(e) { if (e.target === overlay) overlay.remove(); });
  };

  window.mgmtSubmitNewIncident = function() {
    var type = (document.getElementById('m-inc-type') || {}).value || '';
    var severity = (document.getElementById('m-inc-severity') || {}).value || '';
    var dept = ((document.getElementById('m-inc-dept') || {}).value || '').trim();
    var patient = ((document.getElementById('m-inc-patient') || {}).value || '').trim() || '—';
    var description = ((document.getElementById('m-inc-description') || {}).value || '').trim();
    var actionTaken = ((document.getElementById('m-inc-action-taken') || {}).value || '').trim();

    if (!dept) { alert('Please enter concerned department.'); return; }
    if (description.length < 10) { alert('Please enter description (at least 10 characters).'); return; }
    if (!actionTaken) { alert('Please enter immediate action taken.'); return; }

    var now = new Date();
    var dateStr = now.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/ /g, '-') + ' ' + now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    window.state.mgmtIncidents = window.state.mgmtIncidents || [];
    var serial = String(window.state.mgmtIncidents.length + 85).padStart(4, '0');
    var incId = 'INC-2026-' + serial;

    window.state.mgmtIncidents.unshift({
      id: incId,
      date: dateStr,
      type: type,
      dept: dept,
      patient: patient,
      severity: severity,
      reporter: "Quality Manager",
      status: "Open",
      rootCause: "",
      actionTaken: actionTaken,
      correctiveAction: "",
      closedBy: "",
      closedDate: ""
    });

    localStorage.setItem('saronil_mgmtIncidents', JSON.stringify(window.state.mgmtIncidents));

    document.getElementById('mgmt-incident-new-overlay').remove();
    alert('Incident report ' + incId + ' registered successfully under Quality Assurance.');

    var panel = document.getElementById('mgmt-workspace-panel');
    if (panel) renderIncidentsTab(panel);
  };

  /* ── COMPLAINT DETAIL POPUP & RESOLUTION ───────────────────────────────── */
  window.mgmtOpenIncidentDetail = function(id) {
    var list = window.state.mgmtIncidents || [];
    var inc = list.find(item => item.id === id);
    if (!inc) return;

    var existing = document.getElementById('mgmt-incident-detail-overlay');
    if (existing) existing.remove();

    var isOpen = inc.status === 'Open' || inc.status === 'Under Review';
    var sevBg = { Sentinel: '#fee2e2', Serious: '#ffedd5', Minor: '#eff6ff' };
    var sevColors = { Sentinel: '#991b1b', Serious: '#9a3412', Minor: '#1e40af' };

    var overlay = document.createElement('div');
    overlay.id = 'mgmt-incident-detail-overlay';
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(15,23,42,0.55);backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center;z-index:9999;padding:16px;';

    overlay.innerHTML = `
      <div style="background:#fff;border-radius:16px;width:560px;max-width:100%;box-shadow:0 24px 60px rgba(0,0,0,0.2);overflow:hidden;font-family:inherit;">
        <div style="background:${isOpen ? 'linear-gradient(135deg,#1e3a5f,#2563eb)' : 'linear-gradient(135deg,#14532d,#16a34a)'};padding:18px 22px;display:flex;justify-content:space-between;align-items:flex-start;">
          <div>
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;flex-wrap:wrap;">
              <span style="font-family:monospace;font-size:13px;font-weight:800;color:#fff;">${inc.id}</span>
              <span style="font-size:10px;background:${sevBg[inc.severity] || '#fff'};color:${sevColors[inc.severity] || '#000'};padding:2px 8px;border-radius:20px;font-weight:700;">${inc.severity} Severity</span>
              <span style="font-size:10px;background:rgba(255,255,255,0.2);color:#fff;padding:2px 8px;border-radius:20px;font-weight:700;">${inc.status}</span>
            </div>
            <h3 style="margin:0;color:#fff;font-size:14px;font-weight:700;">${inc.type}</h3>
            <p style="margin:3px 0 0;color:rgba(255,255,255,0.75);font-size:11px;">Dept: ${inc.dept} &bull; Patient: ${inc.patient} &bull; Reporter: ${inc.reporter}</p>
          </div>
          <button onclick="document.getElementById('mgmt-incident-detail-overlay').remove()" style="background:rgba(255,255,255,0.2);border:none;color:#fff;width:28px;height:28px;border-radius:50%;font-size:14px;cursor:pointer;flex-shrink:0;">✕</button>
        </div>

        <div style="padding:20px 22px;display:flex;flex-direction:column;gap:16px;">
          <div>
            <p style="margin:0 0 6px;font-size:10px;font-weight:700;color:#6b7280;letter-spacing:0.06em;text-transform:uppercase;">Incident Details &amp; Immediate Action</p>
            <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:12px 14px;font-size:12px;color:#374151;line-height:1.6;margin-bottom:8px;">
              <b>Description:</b> ${inc.description || 'No description provided.'}
            </div>
            <div style="background:#f0f9ff;border:1px solid #bae6fd;border-radius:8px;padding:10px 12px;font-size:11px;color:#0369a1;">
              💡 <b>Immediate Action Taken:</b> ${inc.actionTaken || 'None recorded'}
            </div>
          </div>

          ${!isOpen && inc.correctiveAction ? `
            <div>
              <p style="margin:0 0 6px;font-size:10px;font-weight:700;color:#15803d;letter-spacing:0.06em;text-transform:uppercase;">✅ Corrective &amp; Preventive Action (CAPA)</p>
              <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:12px 14px;font-size:12px;color:#166534;line-height:1.6;">
                <b>Root Cause:</b> ${inc.rootCause || 'Not specified'}<br>
                <b>Corrective Action:</b> ${inc.correctiveAction}
              </div>
              <p style="margin:6px 0 0;font-size:10px;color:#6b7280;">Closed on: ${inc.closedDate || 'N/A'} by <b>${inc.closedBy || 'Quality Assurance'}</b></p>
            </div>
          ` : ''}

          ${isOpen ? `
            <div style="border-top:1px solid #f1f5f9;padding-top:16px;display:flex;flex-direction:column;gap:10px;">
              <div>
                <p style="margin:0 0 4px;font-size:11px;font-weight:700;color:#1d4ed8;">🔍 Root Cause Analysis (RCA)</p>
                <input type="text" id="m-inc-rootcause" placeholder="Identify the root cause of the incident..." style="width:100%;padding:8px 10px;border:1.5px solid #bae6fd;border-radius:8px;font-size:12px;color:#1f2937;box-sizing:border-box;">
              </div>
              <div>
                <p style="margin:0 0 4px;font-size:11px;font-weight:700;color:#1d4ed8;">📝 Corrective &amp; Preventive Action (CAPA) *</p>
                <textarea id="m-inc-capa" rows="3" placeholder="Describe the corrective and preventive actions to avoid recurrence..." style="width:100%;padding:10px 12px;border:1.5px solid #bae6fd;border-radius:8px;font-size:12px;color:#1f2937;resize:vertical;box-sizing:border-box;font-family:inherit;outline:none;" onfocus="this.style.borderColor='#2563eb'" onblur="this.style.borderColor='#93c5fd'"></textarea>
                <p style="margin:5px 0 0;font-size:10px;color:#6b7280;">Minimum 15 characters required.</p>
              </div>
            </div>
          ` : ''}
        </div>

        <div style="padding:14px 22px;border-top:1px solid #f1f5f9;display:flex;justify-content:flex-end;gap:10px;">
          <button onclick="document.getElementById('mgmt-incident-detail-overlay').remove()" style="padding:8px 18px;border:1px solid #d1d5db;background:#fff;border-radius:8px;font-size:12px;font-weight:700;color:#374151;cursor:pointer;">${isOpen ? 'Cancel' : 'Close'}</button>
          ${isOpen ? `<button onclick="window.mgmtIncidentResolve('${inc.id}')" style="padding:8px 22px;background:linear-gradient(135deg,#16a34a,#059669);border:none;border-radius:8px;font-size:12px;font-weight:700;color:#fff;cursor:pointer;">✅ Mark as Resolved</button>` : ''}
        </div>
      </div>
    `;
    document.body.appendChild(overlay);
    overlay.addEventListener('click', function(e) { if (e.target === overlay) overlay.remove(); });
  };

  /* ── RESOLVE INCIDENT ───────────────────────────────────────────────────── */
  window.mgmtIncidentResolve = function(id) {
    var rootCause = ((document.getElementById('m-inc-rootcause') || {}).value || '').trim() || 'Process/Human factor';
    var capa = ((document.getElementById('m-inc-capa') || {}).value || '').trim();
    if (capa.length < 15) {
      alert('Please enter corrective action details (minimum 15 characters) before marking as resolved.');
      return;
    }

    var list = window.state.mgmtIncidents || [];
    var inc = list.find(item => item.id === id);
    if (!inc) return;

    var now = new Date();
    var dateStr = now.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/ /g, '-');

    inc.status = 'Resolved';
    inc.rootCause = rootCause;
    inc.correctiveAction = capa;
    inc.closedBy = 'Quality Assurance Inspector';
    inc.closedDate = dateStr;

    localStorage.setItem('saronil_mgmtIncidents', JSON.stringify(window.state.mgmtIncidents));

    var overlay = document.getElementById('mgmt-incident-detail-overlay');
    if (!overlay) return;

    overlay.querySelector('div').innerHTML = `
      <div style="border-radius:16px;overflow:hidden;text-align:center;">
        <div style="background:linear-gradient(135deg,#14532d,#16a34a);padding:36px 28px 28px;">
          <div style="width:68px;height:68px;background:rgba(255,255,255,0.2);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:34px;margin:0 auto 14px;">✅</div>
          <h3 style="margin:0;color:#fff;font-size:18px;font-weight:800;">Incident Resolved!</h3>
          <p style="margin:6px 0 0;color:rgba(255,255,255,0.8);font-size:12px;">${inc.id} status updated to Resolved.</p>
        </div>
        <div style="padding:22px 26px;display:flex;flex-direction:column;gap:14px;background:#fff;">
          <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;padding:14px;text-align:left;">
            <p style="margin:0 0 6px;font-size:10px;font-weight:700;color:#15803d;text-transform:uppercase;letter-spacing:0.06em;">CAPA Action Summary</p>
            <p style="margin:0;font-size:12px;color:#166534;line-height:1.55;"><b>Corrective Action:</b> ${capa}</p>
          </div>
        </div>
        <div style="padding:14px 26px 20px;background:#fff;">
          <button id="m-inc-success-close-btn" style="width:100%;padding:11px;background:linear-gradient(135deg,#14532d,#16a34a);border:none;border-radius:10px;font-size:13px;font-weight:800;color:#fff;cursor:pointer;">Close</button>
        </div>
      </div>
    `;

    document.getElementById('m-inc-success-close-btn').addEventListener('click', function() {
      overlay.remove();
      var panel = document.getElementById('mgmt-workspace-panel');
      if (panel) renderIncidentsTab(panel);
    });
  };

})();
