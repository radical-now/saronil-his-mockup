/* ==========================================================================
   SARONIL HMS - ADMIN CONTROLS & OPERATIONS REPORTING (adminViews.js)
   ========================================================================== */

window.views.admin = function(container, subAnchor, params) {
  renderAdminWorkspace(container, subAnchor || 'employees');
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
        <button class="btn btn-primary" onclick="addNewStaffMember()">+ Register Staff</button>
      </div>
      <div class="card-body">
        <table class="custom-table" style="font-size: 0.85rem;">
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
              <tr>
                <td><strong>${doc.id}</strong></td>
                <td><strong>${doc.name}</strong></td>
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

window.addNewStaffMember = function() {
  const name = prompt("Enter Staff Name (e.g. Dr. Ramesh Patel):");
  if (!name) return;
  const spec = prompt("Enter Specialization / Department (e.g. Cardiology):") || "General Medicine";
  const room = prompt("Enter Room Allotment (e.g. 104):") || "101";
  const phone = prompt("Enter Contact Number:") || "+91 99999 99999";

  state.doctors.push({
    id: "DOC" + String(state.doctors.length + 1).padStart(2, '0'),
    name,
    spec,
    room,
    phone,
    status: "Active"
  });

  alert(`Staff member ${name} registered successfully in the system.`);
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
        <table class="custom-table" style="font-size: 0.85rem; text-align: center;">
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
              <tr>
                <td style="text-align: left;"><strong>${r.role}</strong></td>
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
// ANALYTICS & REPORTS
// --------------------------------------------------------------------------
function renderReportsTab(container) {
  // Calculate reports data
  const totalOnboarded = state.patients.length;
  const ipdAdmissions = state.admissions.length;
  const activeIpd = state.admissions.filter(a => a.status === 'Active').length;
  const opdAppointments = state.appointments.length;
  const diagnosticsOrders = state.orders.length;
  
  let revenueTotal = 0;
  let outstandingTotal = 0;
  
  state.billing.forEach(b => {
    revenueTotal += b.paid;
    outstandingTotal += (b.amount - b.paid);
  });

  container.innerHTML = `
    <div style="display: grid; grid-template-columns: 1fr 1.5fr; gap: 1.5rem;">
      <!-- Report Specs -->
      <div class="card">
        <div class="card-header"><h3 class="card-title">Generate Management Reports</h3></div>
        <div class="card-body" style="font-size: 0.85rem; display: flex; flex-direction: column; gap: 1rem;">
          <div class="form-group">
            <label>Report Type</label>
            <select id="report-type" class="form-select">
              <option value="operational">Operational Occupancy & Footfall Report</option>
              <option value="financial">Financial Revenue & Collections Report</option>
              <option value="diagnostics">LIS/RIS Diagnostics Audit Sheet</option>
            </select>
          </div>
          
          <div class="form-group">
            <label>Reporting Range</label>
            <select class="form-select">
              <option>Today (Current Date)</option>
              <option>Yesterday</option>
              <option>Current Fiscal Week</option>
              <option>Current Calendar Month</option>
            </select>
          </div>

          <button class="btn btn-primary" onclick="printAnalyticsReport()">Print Performance Report</button>
        </div>
      </div>

      <!-- Report Preview Sheet -->
      <div class="card" id="analytics-report-preview">
        <div class="card-header" style="display: flex; justify-content: space-between; align-items: center;">
          <h3 class="card-title">Report Preview Sheet</h3>
          <span style="font-size: 0.75rem; color: var(--text-muted);">Format: PDF/Print ready</span>
        </div>
        <div class="card-body" style="font-size: 0.85rem; display: flex; flex-direction: column; gap: 1rem; border-top: 1px solid var(--border-color); padding-top: 1.5rem;">
          <div style="text-align: center; border-bottom: 2px solid var(--primary); padding-bottom: 0.5rem;">
            <strong style="font-size: 1.05rem; color: var(--text-primary);">SARONIL SUPER SPECIALTY HOSPITAL</strong>
            <p style="font-size: 0.75rem; color: var(--text-muted); margin: 0.15rem 0 0 0;">Bengaluru Campus | Executive Operations Summary</p>
          </div>

          <div>
            <p><strong>Reporting Date:</strong> 2026-06-17 | <strong>Generated By:</strong> System Admin</p>
          </div>

          <table style="width:100%; border-collapse: collapse; margin-top: 0.5rem; font-size: 0.8rem;">
            <thead>
              <tr style="border-bottom: 1.5px solid var(--border-color); text-align: left; font-weight: bold; color: var(--text-primary);">
                <th style="padding: 0.4rem 0;">Metric Indicator</th>
                <th style="padding: 0.4rem 0; text-align: right;">Audited Value</th>
              </tr>
            </thead>
            <tbody>
              <tr style="border-bottom: 1px dashed var(--border-color);">
                <td style="padding: 0.4rem 0;">Total Patients Onboarded</td>
                <td style="padding: 0.4rem 0; text-align: right;">${totalOnboarded} Patients</td>
              </tr>
              <tr style="border-bottom: 1px dashed var(--border-color);">
                <td style="padding: 0.4rem 0;">Daily OPD Consultations Scheduled</td>
                <td style="padding: 0.4rem 0; text-align: right;">${opdAppointments} Consults</td>
              </tr>
              <tr style="border-bottom: 1px dashed var(--border-color);">
                <td style="padding: 0.4rem 0;">Total Inpatient Admissions (IPD)</td>
                <td style="padding: 0.4rem 0; text-align: right;">${ipdAdmissions} Cases</td>
              </tr>
              <tr style="border-bottom: 1px dashed var(--border-color);">
                <td style="padding: 0.4rem 0;">Active IPD Bed Occupants</td>
                <td style="padding: 0.4rem 0; text-align: right;">${activeIpd} Inpatients</td>
              </tr>
              <tr style="border-bottom: 1px dashed var(--border-color);">
                <td style="padding: 0.4rem 0;">Laboratory & Radiology Investigations Logged</td>
                <td style="padding: 0.4rem 0; text-align: right;">${diagnosticsOrders} Diagnostic Orders</td>
              </tr>
              <tr style="border-bottom: 1px dashed var(--border-color);">
                <td style="padding: 0.4rem 0;">Total Cash/UPI Payments Settled</td>
                <td style="padding: 0.4rem 0; text-align: right;">₹${revenueTotal.toLocaleString('en-IN')}</td>
              </tr>
              <tr style="border-bottom: 1px dashed var(--border-color);">
                <td style="padding: 0.4rem 0; color: var(--color-danger); font-weight: 600;">Total Outstanding Billing Balances</td>
                <td style="padding: 0.4rem 0; text-align: right; color: var(--color-danger); font-weight: 600;">
                  ₹${outstandingTotal.toLocaleString('en-IN')}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}

window.printAnalyticsReport = function() {
  const type = document.getElementById('report-type').value;
  const w = window.open('', '_blank', 'width=800,height=600');
  
  let reportTitle = 'Operational & Occupancy Performance Audit';
  let reportBody = '';

  const totalOnboarded = state.patients.length;
  const ipdAdmissions = state.admissions.length;
  const activeIpd = state.admissions.filter(a => a.status === 'Active').length;
  const opdAppointments = state.appointments.length;
  const diagnosticsOrders = state.orders.length;
  
  let revenueTotal = 0;
  let outstandingTotal = 0;
  state.billing.forEach(b => {
    revenueTotal += b.paid;
    outstandingTotal += (b.amount - b.paid);
  });

  if (type === 'financial') {
    reportTitle = 'Financial Collections & TPA Outstanding Ledger';
    reportBody = `
      <tr><td>Total Invoiced Billing</td><td style="text-align: right;">₹${(revenueTotal + outstandingTotal).toLocaleString('en-IN')}</td></tr>
      <tr><td>Settled & Cleared Income</td><td style="text-align: right;">₹${revenueTotal.toLocaleString('en-IN')}</td></tr>
      <tr><td>Unpaid Balances / Credit Ledger</td><td style="text-align: right;">₹${outstandingTotal.toLocaleString('en-IN')}</td></tr>
      <tr><td>Star Health Coverage</td><td style="text-align: right;">₹${(revenueTotal * 0.4).toLocaleString('en-IN')}</td></tr>
      <tr><td>Niva Bupa Coverage</td><td style="text-align: right;">₹${(revenueTotal * 0.3).toLocaleString('en-IN')}</td></tr>
      <tr><td>Direct Cash Payments</td><td style="text-align: right;">₹${(revenueTotal * 0.3).toLocaleString('en-IN')}</td></tr>
    `;
  } else if (type === 'diagnostics') {
    reportTitle = 'LIS/RIS Laboratory & Imaging Investigations Log';
    reportBody = `
      <tr><td>Total Lab Tests Processed</td><td style="text-align: right;">${state.orders.filter(o => o.type === 'Laboratory').length} Tests</td></tr>
      <tr><td>Total Radiology Scans Completed</td><td style="text-align: right;">${state.orders.filter(o => o.type === 'Radiology').length} Scans</td></tr>
      <tr><td>Pending Validation Cases</td><td style="text-align: right;">${state.orders.filter(o => o.status === 'Result Entered').length} Orders</td></tr>
      <tr><td>Urgent (Stat) priority audits</td><td style="text-align: right;">${state.orders.filter(o => o.priority === 'Urgent').length} Orders</td></tr>
    `;
  } else {
    reportBody = `
      <tr><td>Total Registered Records</td><td style="text-align: right;">${totalOnboarded} Patients</td></tr>
      <tr><td>OPD Roster Size</td><td style="text-align: right;">${opdAppointments} Slots</td></tr>
      <tr><td>IPD Admissions</td><td style="text-align: right;">${ipdAdmissions} Admissions</td></tr>
      <tr><td>Active Ward Inpatients</td><td style="text-align: right;">${activeIpd} Occupants</td></tr>
      <tr><td>Diagnostics Scheduled</td><td style="text-align: right;">${diagnosticsOrders} Scans/Labs</td></tr>
    `;
  }

  w.document.write(`
    <html>
      <head>
        <title>Saronil HMS Management Report</title>
        <style>
          body { font-family: sans-serif; padding: 30px; line-height: 1.5; color: #333; }
          .header { text-align: center; border-bottom: 3px solid #2563eb; padding-bottom: 12px; margin-bottom: 30px; }
          .footer { text-align: center; border-top: 1px solid #ddd; margin-top: 40px; padding-top: 10px; font-size: 0.8rem; color: #777; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { padding: 10px; border-bottom: 1px solid #ddd; }
          th { background: #f8fafc; font-weight: bold; text-align: left; }
        </style>
      </head>
      <body>
        <div class="header">
          <h2>SARONIL SUPER SPECIALTY HOSPITAL</h2>
          <p>HSR Layout Sector-1, Bengaluru, Karnataka 560102</p>
          <h3>EXECUTIVE PERFORMANCE AUDIT SHEET</h3>
        </div>
        <div>
          <p><strong>Report:</strong> ${reportTitle}</p>
          <p><strong>Scope Period:</strong> 2026-06-17 (Daily Summary)</p>
          <p><strong>Approved Signatory:</strong> Board of Directors, Saronil Healthcare</p>
        </div>
        <table>
          <thead>
            <tr><th>Performance Indicator</th><th style="text-align: right;">Value</th></tr>
          </thead>
          <tbody>
            ${reportBody}
          </tbody>
        </table>
        <div class="footer">
          <p>This report is verified by the central Bio-Medical & Financial Audit team. Internal use only.</p>
        </div>
      </body>
    </html>
  `);
  w.document.close();
  w.print();
};
