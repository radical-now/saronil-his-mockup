/* ==========================================================================
   SARONIL HMS - ADVANCED REVENUE CYCLE MANAGEMENT & BILLING MODULE (billingView.js)
   ========================================================================== */

// Configure Role Access Permissions
const BILLING_ROLES = {
  CASHIER: { name: "Cashier", permissions: ["collect_payment", "print_receipt", "collect_advance", "view_shift"] },
  BILLING_EXECUTIVE: { name: "Billing Executive", permissions: ["create_bill", "add_charge", "cancel_charge", "apply_discount_pre", "interim_bill", "final_bill", "process_refund"] },
  BILLING_SUPERVISOR: { name: "Billing Supervisor", permissions: ["create_bill", "add_charge", "cancel_charge", "apply_discount_pre", "interim_bill", "final_bill", "process_refund", "approve_discount", "approve_refund", "override_charges", "unlock_bill"] },
  ACCOUNTS_MANAGER: { name: "Accounts Manager", permissions: ["create_bill", "add_charge", "cancel_charge", "apply_discount_pre", "interim_bill", "final_bill", "process_refund", "approve_discount", "approve_refund", "override_charges", "unlock_bill", "day_close", "cashier_reconcile", "credit_note", "corporate_statement", "reports"] },
  MRD_COORDINATOR: { name: "MRD / Discharge Coordinator", permissions: ["view_bill", "discharge_clearance"] },
  DOCTOR: { name: "Doctor / Clinical Staff", permissions: ["view_bill"] }
};

// Initial Active Session Details
let activeBillingRole = "ACCOUNTS_MANAGER"; // Default starting role for full sandbox controls
let activeBillingInvoiceId = null;

// Cashier Shift State
let cashierShift = {
  status: "Open", // Open, Closed
  openingBalance: 5000,
  declaredCash: 0,
  actualCollection: { Cash: 0, UPI: 0, Card: 0, NEFT: 0, Cheque: 0 },
  logs: []
};

// Central Service Catalogue (Service Master)
const SERVICE_CATALOGUE = [
  { code: "SRV-CONS-01", name: "OPD Consultation - General", dept: "General Medicine", category: "Consultation", sac: "999311", price: 500, gstRate: 0 },
  { code: "SRV-CONS-02", name: "OPD Consultation - Specialist", dept: "Cardiology", category: "Consultation", sac: "999311", price: 800, gstRate: 0 },
  { code: "SRV-WARD-GW", name: "General Ward Bed Charges", dept: "Ward Management", category: "Room", sac: "999312", price: 1500, gstRate: 0 },
  { code: "SRV-WARD-PVT", name: "Private Room Bed Charges", dept: "Ward Management", category: "Room", sac: "999312", price: 6000, gstRate: 0 },
  { code: "SRV-WARD-ICU", name: "ICU Bed Charges", dept: "Ward Management", category: "Room", sac: "999312", price: 10000, gstRate: 0 },
  { code: "SRV-LAB-CBC", name: "Complete Blood Count (CBC)", dept: "Laboratory", category: "Lab", sac: "999316", price: 350, gstRate: 5 },
  { code: "SRV-LAB-LFT", name: "Liver Function Test (LFT)", dept: "Laboratory", category: "Lab", sac: "999316", price: 750, gstRate: 5 },
  { code: "SRV-RAD-XRAY", name: "Chest X-Ray Digital", dept: "Radiology", category: "Radiology", sac: "999316", price: 650, gstRate: 12 },
  { code: "SRV-RAD-MRI", name: "MRI Brain (Contrast)", dept: "Radiology", category: "Radiology", sac: "999316", price: 8500, gstRate: 12 },
  { code: "SRV-SURG-APP", name: "Laparoscopic Appendectomy OT Charges", dept: "General Surgery", category: "OT", sac: "999315", price: 25000, gstRate: 0 },
  { code: "SRV-CON-KIT", name: "IPD Admission Kit", dept: "Nursing", category: "Consumable", sac: "990001", price: 1200, gstRate: 18 }
];

// Package Master
const PACKAGE_MASTER = [
  { code: "PKG-APP-01", name: "Appendectomy Standard Package", basePrice: 45000, inclusions: ["Laparoscopic Appendectomy OT Charges", "General Ward Bed Charges", "Complete Blood Count (CBC)"], active: true },
  { code: "PKG-MNT-01", name: "Maternity Private Room Package", basePrice: 65000, inclusions: ["Private Room Bed Charges", "Nursing Administration Charges"], active: true }
];

window.views.billing = function(container, subAnchor, params) {
  // Normalize existing billing records
  normalizeBillingRecords();
  
  if (subAnchor === 'workspace' && params && params.id) {
    activeBillingInvoiceId = params.id;
    renderInvoiceWorkspace(container, params.id);
  } else {
    renderBillingDashboard(container);
  }
};

// --------------------------------------------------------------------------
// STATE NORMALIZATION (Compatibility layer)
// --------------------------------------------------------------------------
function normalizeBillingRecords() {
  state.billing.forEach(b => {
    if (!b.visitType) b.visitType = b.uhid === "UHID20000001" ? "OPD" : "IPD";
    if (!b.admissionNo) b.admissionNo = b.visitType === "IPD" ? "ADM" + b.id.replace("INV", "") : "";
    if (!b.doctorName) b.doctorName = "Dr. Rajesh Singh";
    if (!b.department) b.department = "General Medicine";
    if (!b.paymentCategory) b.paymentCategory = b.uhid === "UHID20000003" ? "Insurance" : "Self Pay";
    if (b.paymentCategory === "Insurance" && !b.insuranceDetails) {
      b.insuranceDetails = { provider: "STAR HEALTH", preauthNo: "PA-99231", approvedAmt: 150000, status: "Approved" };
    }
    if (!b.advancePaid) b.advancePaid = b.paid > 5000 ? 5000 : 0;
    if (!b.discountAmount) b.discountAmount = 0;
    if (!b.gstAmount) b.gstAmount = 0;
    if (!b.auditLogs) b.auditLogs = [{ timestamp: new Date().toISOString(), user: "admin", action: "Seeded Bill Created" }];
    
    // Add HSN/SAC fields to items
    b.items.forEach(item => {
      if (!item.sac) item.sac = "999312";
      if (item.gstRate === undefined) item.gstRate = 0;
      if (item.gstAmount === undefined) item.gstAmount = 0;
      if (item.status === undefined) item.status = "Active"; // Active, Cancelled
    });
  });
}

// Check if user role has specific permission
function hasPermission(permission) {
  const roleConfig = BILLING_ROLES[activeBillingRole];
  return roleConfig && roleConfig.permissions.includes(permission);
}

// Helper to format currency in Indian style
function formatINR(val) {
  return "₹" + Number(val).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// Helper to push to audit log
function logBillingAudit(invoiceId, action, details = "") {
  const bill = state.billing.find(b => b.id === invoiceId);
  if (bill) {
    const entry = {
      timestamp: new Date().toISOString(),
      user: activeBillingRole,
      action: action,
      details: details
    };
    bill.auditLogs.push(entry);
    // Push to global audit log too
    state.auditLogs.push({
      timestamp: entry.timestamp,
      module: "Billing",
      event: action,
      details: `Invoice ${invoiceId} - ${details} (${activeBillingRole})`
    });
  }
}

// --------------------------------------------------------------------------
// DASHBOARD VIEW
// --------------------------------------------------------------------------
function renderBillingDashboard(container) {
  // Calculations for KPI Cards
  let totalCollection = 0;
  let cashCollection = 0, upiCollection = 0, cardCollection = 0, bankCollection = 0, chequeCollection = 0;
  let outstandingAmt = 0;
  let pendingCount = 0;
  let dischargePendingCount = 0;
  let insurancePendingAmt = 0;
  let insurancePendingCount = 0;
  let totalAdvanceHeld = 0;

  state.billing.forEach(b => {
    totalCollection += b.paid;
    // Mock payment mode breakdowns
    const idx = parseInt(b.id.replace("INV", "")) || 0;
    if (idx % 3 === 0) cashCollection += b.paid;
    else if (idx % 3 === 1) upiCollection += b.paid;
    else cardCollection += b.paid;

    const balance = b.amount - b.paid;
    if (balance > 0) {
      outstandingAmt += balance;
      pendingCount++;
    }

    if (b.status === 'Ready for Settlement') {
      dischargePendingCount++;
    }

    if (b.paymentCategory === 'Insurance') {
      insurancePendingCount++;
      insurancePendingAmt += balance;
    }

    totalAdvanceHeld += b.advancePaid;
  });

  container.innerHTML = `
    <!-- Top Configuration Bar (Sandbox Role Switcher) -->
    <div style="background-color: #eff6ff; border: 1px solid #bfdbfe; padding: 0.75rem 1rem; border-radius: 8px; margin-bottom: 1.5rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
      <div style="display:flex; align-items:center; gap:0.5rem;">
        <span style="font-weight:700; color:#1e40af; font-size:0.85rem;">🛡️ RCM Access Control:</span>
        <select id="role-selector" class="form-select" style="font-size:0.8rem; width:220px; height:34px; padding:0 0.5rem;" onchange="window.switchBillingRole(this.value)">
          ${Object.entries(BILLING_ROLES).map(([key, val]) => `
            <option value="${key}" ${activeBillingRole === key ? 'selected' : ''}>${val.name}</option>
          `).join('')}
        </select>
      </div>
      
      <div style="display: flex; gap: 0.5rem;">
        <button class="btn btn-secondary" style="font-size: 0.8rem; padding: 0.4rem 0.8rem;" onclick="window.showShiftClosureModal()">🛒 Cashier Shift: ${cashierShift.status}</button>
        <button class="btn btn-primary" style="font-size: 0.8rem; padding: 0.4rem 0.8rem;" onclick="window.showNewBillModal()">➕ Create Bill</button>
      </div>
    </div>

    <!-- KPI GRID -->
    <div class="grid-4" style="gap: 1rem; margin-bottom: 1.5rem;">
      <div class="kpi-card status-normal">
        <div class="kpi-header">
          <span class="kpi-title">Today's Collection</span>
          <span class="kpi-icon" style="background-color: #ecfdf5; color: #10b981;">💳</span>
        </div>
        <div class="kpi-body">
          <span class="kpi-value">${formatINR(totalCollection)}</span>
          <span class="kpi-subtext" style="font-size:0.68rem;">Cash: ${formatINR(cashCollection)} | UPI: ${formatINR(upiCollection)}</span>
        </div>
      </div>

      <div class="kpi-card status-warning">
        <div class="kpi-header">
          <span class="kpi-title">Discharge Bills Pending</span>
          <span class="kpi-icon" style="background-color: #fffbeb; color: #d97706;">🚪</span>
        </div>
        <div class="kpi-body">
          <span class="kpi-value">${dischargePendingCount} Patients</span>
          <span class="kpi-subtext">Awaiting final reconciliation</span>
        </div>
      </div>

      <div class="kpi-card status-critical">
        <div class="kpi-header">
          <span class="kpi-title">Outstanding Amount</span>
          <span class="kpi-icon" style="background-color: #fef2f2; color: #ef4444;">🚨</span>
        </div>
        <div class="kpi-body">
          <span class="kpi-value">${formatINR(outstandingAmt)}</span>
          <span class="kpi-subtext">${pendingCount} unpaid/partial accounts</span>
        </div>
      </div>

      <div class="kpi-card status-normal">
        <div class="kpi-header">
          <span class="kpi-title font-bold">Advance Held</span>
          <span class="kpi-icon" style="background-color: #e0f2fe; color: #0284c7;">📥</span>
        </div>
        <div class="kpi-body">
          <span class="kpi-value">${formatINR(totalAdvanceHeld)}</span>
          <span class="kpi-subtext">Unadjusted deposits</span>
        </div>
      </div>
    </div>

    <!-- Alert and Flags Row -->
    <div style="display:grid; grid-template-columns: 1.2fr 2fr; gap:1.5rem; margin-bottom: 1.5rem;">
      <div class="card" style="border-left: 4px solid var(--color-danger);">
        <div class="card-header"><h4 style="font-size: 0.88rem; font-weight:700; color:var(--color-danger);">⚠️ Critical Operational Flags</h4></div>
        <div class="card-body" style="padding: 0.75rem; font-size: 0.8rem; display:flex; flex-direction:column; gap:0.5rem;">
          <div style="padding: 0.5rem; background:#fff5f5; border-radius:4px; display:flex; justify-content:space-between;">
            <span>Expired pre-authorisations</span>
            <strong style="color:var(--color-danger);">2 Claims</strong>
          </div>
          <div style="padding: 0.5rem; background:#fffbeb; border-radius:4px; display:flex; justify-content:space-between;">
            <span>IPD Patients with no interim bill >3 days</span>
            <strong style="color:var(--color-warning);">4 Cases</strong>
          </div>
          <div style="padding: 0.5rem; background:#eff6ff; border-radius:4px; display:flex; justify-content:space-between;">
            <span>Pending discount approvals</span>
            <strong style="color:var(--primary);">1 Request</strong>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-header"><h4 style="font-size: 0.88rem; font-weight:700;">Patient Billing Registry Queue</h4></div>
        <div class="card-body" style="padding:0.75rem;">
          <div style="display: flex; gap: 0.5rem; margin-bottom: 0.75rem; flex-wrap: wrap;">
            <input type="text" id="dbill-search" class="form-control" placeholder="Search by UHID, Name, Bill No..." style="flex:1; font-size:0.8rem; height:34px;">
            <select id="dbill-type" class="form-select" style="width: auto; font-size:0.8rem; height:34px;">
              <option value="">All Types</option>
              <option value="OPD">OPD</option>
              <option value="IPD">IPD</option>
              <option value="Emergency">Emergency</option>
              <option value="Day Care">Day Care</option>
            </select>
            <select id="dbill-payer" class="form-select" style="width: auto; font-size:0.8rem; height:34px;">
              <option value="">All Payers</option>
              <option value="Self Pay">Self Pay</option>
              <option value="Insurance">Insurance</option>
            </select>
          </div>

          <div class="custom-table-container" style="max-height: 250px; overflow-y: auto;">
            <table class="custom-table" style="font-size: 0.8rem;">
              <thead>
                <tr>
                  <th>Bill No</th>
                  <th>UHID</th>
                  <th>Patient Name</th>
                  <th>Type</th>
                  <th>Payer</th>
                  <th>Total (₹)</th>
                  <th>Status</th>
                  <th style="text-align: right;">Action</th>
                </tr>
              </thead>
              <tbody id="dbill-table-body">
                <!-- Seeding table -->
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  `;

  // Bind Dashboard Registry Hooks
  const sInput = document.getElementById('dbill-search');
  const sType = document.getElementById('dbill-type');
  const sPayer = document.getElementById('dbill-payer');

  const refreshRoster = () => {
    const q = sInput.value.toLowerCase().trim();
    const typeVal = sType.value;
    const payerVal = sPayer.value;

    const filtered = state.billing.filter(b => {
      const matchQ = !q || b.id.toLowerCase().includes(q) || b.uhid.toLowerCase().includes(q) || b.patientName.toLowerCase().includes(q);
      const matchT = !typeVal || b.visitType === typeVal;
      const matchP = !payerVal || b.paymentCategory === payerVal;
      return matchQ && matchT && matchP;
    });

    const tbody = document.getElementById('dbill-table-body');
    tbody.innerHTML = filtered.map(b => `
      <tr>
        <td><strong>${b.id}</strong></td>
        <td><code>${b.uhid}</code></td>
        <td>${b.patientName}</td>
        <td><span class="badge bg-secondary">${b.visitType}</span></td>
        <td>${b.paymentCategory}</td>
        <td>${formatINR(b.amount)}</td>
        <td>
          <span class="badge" style="background:${b.status==='Settled'?'#d1fae5':'#fef3c7'}; color:${b.status==='Settled'?'#065f46':'#92400e'}">
            ${b.status}
          </span>
        </td>
        <td style="text-align: right;">
          <button class="btn btn-secondary" style="padding:0.25rem 0.5rem; font-size:0.75rem;" onclick="router.navigate('billing-workspace?id=${b.id}')">Workspace</button>
        </td>
      </tr>
    `).join('') || '<tr><td colspan="8" style="text-align:center;">No matching billing records.</td></tr>';
  };

  sInput.addEventListener('input', refreshRoster);
  sType.addEventListener('change', refreshRoster);
  sPayer.addEventListener('change', refreshRoster);
  refreshRoster();
}

window.switchBillingRole = function(role) {
  activeBillingRole = role;
  alert(`Role switched to: ${BILLING_ROLES[role].name}. Permissions reloaded.`);
  router.navigate('billing');
};

// --------------------------------------------------------------------------
// THREE-PANEL INVOICE WORKSPACE VIEW
// --------------------------------------------------------------------------
function renderInvoiceWorkspace(container, invoiceId) {
  const bill = state.billing.find(b => b.id === invoiceId);
  if (!bill) {
    alert("Billing Record not found.");
    router.navigate('billing');
    return;
  }

  // Calculate Running totals & dynamic tax breakdown
  let grossAmount = 0;
  let totalGst = 0;
  bill.items.forEach(item => {
    if (item.status === 'Active') {
      grossAmount += item.total;
      const itemGst = item.total * (item.gstRate / 100);
      totalGst += itemGst;
      item.gstAmount = itemGst;
    }
  });

  const netPayable = grossAmount - bill.discountAmount + totalGst;
  const balanceDue = netPayable - bill.paid - bill.advancePaid;

  container.innerHTML = `
    <!-- Top Navigation Header -->
    <div style="margin-bottom: 1rem; display:flex; justify-content:space-between; align-items:center;">
      <button class="btn btn-secondary" onclick="router.navigate('billing')">← Back to Dashboard</button>
      <h3 style="margin:0; font-size:1.15rem; font-weight:800; color:var(--primary);">🧾 Revenue Cycle Workspace: ${bill.id}</h3>
    </div>

    <!-- 1. Patient Header Bar -->
    <div style="background-color: var(--bg-surface); border: 1px solid var(--border-color); border-radius: 8px; padding: 1rem; margin-bottom: 1.5rem; display: grid; grid-template-columns: repeat(6, 1fr); gap: 1rem; font-size: 0.8rem;">
      <div>
        <div style="color:var(--text-muted);">Patient Name (UHID)</div>
        <strong style="font-size:0.88rem; color:var(--primary);">${bill.patientName}</strong> <br>
        <code>${bill.uhid}</code>
      </div>
      <div>
        <div style="color:var(--text-muted);">Visit Type / ID</div>
        <strong>${bill.visitType}</strong> <br>
        <span>${bill.admissionNo || "OPD Client"}</span>
      </div>
      <div>
        <div style="color:var(--text-muted);">Treating Consultant</div>
        <strong>${bill.doctorName}</strong> <br>
        <span style="font-size:0.75rem; color:var(--text-muted);">${bill.department}</span>
      </div>
      <div>
        <div style="color:var(--text-muted);">Payer / Category</div>
        <strong>${bill.paymentCategory}</strong> <br>
        <span style="font-size:0.75rem; color:var(--text-muted);">${bill.insuranceDetails ? bill.insuranceDetails.provider : "Cash Tariff"}</span>
      </div>
      <div>
        <div style="color:var(--text-muted);">Advance Deposit Balance</div>
        <strong style="color:var(--color-success); font-size:0.9rem;">${formatINR(bill.advancePaid)}</strong>
      </div>
      <div>
        <div style="color:var(--text-muted);">Bill Status</div>
        <span class="badge" style="background:#fef3c7; color:#92400e; font-weight:700;">${bill.status}</span>
      </div>
    </div>

    <!-- 2. Three Panel Work Area -->
    <div style="display: grid; grid-template-columns: 1fr 2fr 1fr; gap: 1.5rem; align-items: start;">
      
      <!-- Left Panel: Bill Summary -->
      <div class="card" style="position: sticky; top: 1rem;">
        <div class="card-header"><h4 style="font-size: 0.85rem; font-weight:700;">1. Financial Summary</h4></div>
        <div class="card-body" style="padding: 1rem; font-size: 0.82rem; display:flex; flex-direction:column; gap:0.75rem;">
          <div style="display:flex; justify-content:space-between;">
            <span>Gross Charges:</span>
            <strong>${formatINR(grossAmount)}</strong>
          </div>
          <div style="display:flex; justify-content:space-between; color:var(--color-danger);">
            <span>Discounts Applied:</span>
            <strong>-${formatINR(bill.discountAmount)}</strong>
          </div>
          <div style="display:flex; justify-content:space-between; border-bottom: 1px dashed var(--border-color); padding-bottom:0.5rem;">
            <span>GST Output Tax:</span>
            <strong>+${formatINR(totalGst)}</strong>
          </div>
          <div style="display:flex; justify-content:space-between; font-size:0.95rem; font-weight:800; color:var(--primary); padding:0.25rem 0;">
            <span>Net Bill Amount:</span>
            <span>${formatINR(netPayable)}</span>
          </div>
          <div style="display:flex; justify-content:space-between; color:var(--text-muted);">
            <span>Advance Adjusted:</span>
            <strong>-${formatINR(bill.advancePaid)}</strong>
          </div>
          <div style="display:flex; justify-content:space-between; color:var(--color-success);">
            <span>Payments Settled:</span>
            <strong>-${formatINR(bill.paid)}</strong>
          </div>
          <div style="display:flex; justify-content:space-between; font-size:1rem; font-weight:800; border-top:1px solid var(--border-color); padding-top:0.75rem; color:var(--color-danger);">
            <span>Balance Due:</span>
            <span>${formatINR(balanceDue > 0 ? balanceDue : 0)}</span>
          </div>
        </div>
      </div>

      <!-- Middle Panel: Itemised Charge Capture & Operations -->
      <div class="card">
        <div class="card-header" style="display:flex; justify-content:space-between; align-items:center;">
          <h4 style="font-size: 0.85rem; font-weight:700;">2. Service Charge Captured Roster</h4>
          <button class="btn btn-secondary" style="padding: 0.25rem 0.5rem; font-size: 0.75rem;" onclick="window.showPackageAssignModal('${bill.id}')">📦 Link Package</button>
        </div>
        <div class="card-body" style="padding: 1rem;">
          <!-- Custom Charge Entry Row -->
          ${hasPermission("add_charge") ? `
            <div style="background:#f8fafc; border: 1px solid var(--border-color); padding: 0.75rem; border-radius:6px; margin-bottom: 1rem;">
              <h5 style="margin:0 0 0.5rem 0; font-size:0.75rem; font-weight:700;">Add Investigation, Room, or Consumable Charge</h5>
              <div style="display:grid; grid-template-columns: 2fr 1fr 1fr; gap:0.5rem; margin-bottom:0.5rem;">
                <select id="quick-srv-select" class="form-select" style="font-size:0.75rem; height:32px;" onchange="window.populateSrvDetails(this.value)">
                  <option value="">-- Autocomplete from Service Master --</option>
                  ${SERVICE_CATALOGUE.map(s => `<option value="${s.code}">${s.name} (${s.code}) - ₹${s.price}</option>`).join('')}
                </select>
                <input type="number" id="quick-srv-qty" class="form-control" value="1" placeholder="Qty" style="font-size:0.75rem; height:32px;">
                <input type="number" id="quick-srv-rate" class="form-control" placeholder="Rate (₹)" style="font-size:0.75rem; height:32px;">
              </div>
              <button class="btn btn-primary" style="font-size: 0.75rem; padding: 0.35rem; width:100%;" onclick="window.submitManualCharge('${bill.id}')">Confirm and Post Charge</button>
            </div>
          ` : ''}

          <!-- Charge List -->
          <table class="custom-table" style="font-size: 0.78rem;">
            <thead>
              <tr style="background:#f8fafc;">
                <th>Service Name / Code</th>
                <th>Qty</th>
                <th style="text-align:right;">Rate (₹)</th>
                <th>GST %</th>
                <th style="text-align:right;">Total (₹)</th>
                <th style="text-align:right;">Action</th>
              </tr>
            </thead>
            <tbody>
              ${bill.items.map((item, index) => `
                <tr style="${item.status === 'Cancelled' ? 'text-decoration: line-through; opacity: 0.5;' : ''}">
                  <td>
                    <strong>${item.desc}</strong> <br>
                    <span style="font-size:0.68rem; color:var(--text-muted);">SAC: ${item.sac || '999312'}</span>
                  </td>
                  <td>${item.qty}</td>
                  <td style="text-align:right;">${formatINR(item.rate)}</td>
                  <td>${item.gstRate}%</td>
                  <td style="text-align:right;"><strong>${formatINR(item.total)}</strong></td>
                  <td style="text-align:right;">
                    ${item.status === 'Active' && hasPermission("cancel_charge") ? `
                      <button class="btn btn-secondary" style="padding:0.15rem 0.3rem; font-size:0.7rem; color:var(--color-danger);" onclick="window.cancelItemizedCharge('${bill.id}', ${index})">Reverse</button>
                    ` : ''}
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Right Panel: Advance & Payments Panel -->
      <div class="card">
        <div class="card-header"><h4 style="font-size: 0.85rem; font-weight:700;">3. Payment Operations</h4></div>
        <div class="card-body" style="padding: 1rem; display:flex; flex-direction:column; gap:0.75rem;">
          
          <!-- Advance adjustment button -->
          ${hasPermission("collect_advance") ? `
            <button class="btn btn-secondary" style="font-size:0.8rem; padding:0.45rem; width:100%;" onclick="window.showAdvanceModal('${bill.id}')">📥 Collect Advance Deposit</button>
          ` : ''}

          <!-- Discount Management -->
          ${hasPermission("apply_discount_pre") ? `
            <button class="btn btn-secondary" style="font-size:0.8rem; padding:0.45rem; width:100%;" onclick="window.showDiscountModal('${bill.id}')">🏷️ Apply Discount (RCM)</button>
          ` : ''}

          <!-- Settle Collection Box -->
          ${bill.status !== 'Settled' && hasPermission("collect_payment") ? `
            <div style="border: 1px solid var(--border-color); padding: 0.75rem; border-radius:6px; margin-top:0.5rem;">
              <h5 style="margin:0 0 0.5rem 0; font-size:0.78rem; font-weight:700; color:var(--primary);">Collect Split Payment</h5>
              <div class="form-group" style="margin-bottom:0.5rem;">
                <label style="font-size:0.7rem;">Payment Mode</label>
                <select id="collect-mode" class="form-select" style="font-size:0.75rem;">
                  <option value="UPI">BHIM / UPI App</option>
                  <option value="Cash">Cash Drawer</option>
                  <option value="Card">POS Credit/Debit Card</option>
                  <option value="NEFT">Bank Transfer / NEFT</option>
                </select>
              </div>
              <div class="form-group" style="margin-bottom:0.75rem;">
                <label style="font-size:0.7rem;">Reference / Txn ID</label>
                <input type="text" id="collect-ref" class="form-control" placeholder="UPI Txn / UTR No" style="font-size:0.75rem; height:30px;">
              </div>
              <div class="form-group" style="margin-bottom:0.75rem;">
                <label style="font-size:0.7rem;">Collect Amount (₹)</label>
                <input type="number" id="collect-amt" class="form-control" value="${balanceDue > 0 ? balanceDue : 0}" style="font-size:0.75rem; height:30px;">
              </div>
              <button class="btn btn-primary" style="width:100%; font-size:0.78rem; padding:0.4rem;" onclick="window.settleWorkspacePayment('${bill.id}')">Post Payment Settlement</button>
            </div>
          ` : ''}

          <!-- Discharge Pre-Validation Checklist Trigger -->
          ${bill.visitType === 'IPD' && bill.status !== 'Settled' ? `
            <button class="btn btn-primary" style="font-size:0.8rem; padding:0.45rem; background: var(--color-warning); border-color: var(--color-warning); color:#000;" onclick="window.showPreValidationChecklist('${bill.id}')">🚪 Discharge Pre-Validation</button>
          ` : ''}

          <!-- Action logs, Audit button -->
          <button class="btn btn-secondary" style="font-size:0.8rem; padding:0.45rem; width:100%;" onclick="window.showAuditLogsModal('${bill.id}')">📜 View Audit Trail</button>
        </div>
      </div>

    </div>

    <!-- Modal viewport container -->
    <div id="billing-modal" class="modal-overlay" style="display:none;"></div>
  `;
}

// --------------------------------------------------------------------------
// CHARGE CAPTURE & AUTOCOMPLETE ACTIONS
// --------------------------------------------------------------------------
window.populateSrvDetails = function(code) {
  const srv = SERVICE_CATALOGUE.find(s => s.code === code);
  if (srv) {
    document.getElementById('quick-srv-rate').value = srv.price;
  }
};

window.submitManualCharge = function(invoiceId) {
  const code = document.getElementById('quick-srv-select').value;
  const qty = parseInt(document.getElementById('quick-srv-qty').value) || 1;
  const rate = parseFloat(document.getElementById('quick-srv-rate').value);

  const srv = SERVICE_CATALOGUE.find(s => s.code === code);
  if (!srv || isNaN(rate)) {
    alert("Please select a valid service code and price.");
    return;
  }

  const bill = state.billing.find(b => b.id === invoiceId);
  if (bill) {
    const total = qty * rate;
    const newItem = {
      desc: srv.name,
      qty,
      rate,
      total,
      sac: srv.sac,
      gstRate: srv.gstRate,
      gstAmount: total * (srv.gstRate / 100),
      status: 'Active'
    };
    bill.items.push(newItem);
    logBillingAudit(invoiceId, "Charge Added", `${srv.name} (Qty: ${qty}, Rate: ${rate})`);
    
    // Recalculate totals
    let tempSum = 0;
    bill.items.forEach(item => { if (item.status === 'Active') tempSum += item.total; });
    bill.amount = tempSum;

    renderInvoiceWorkspace(document.getElementById('main-content'), invoiceId);
  }
};

window.cancelItemizedCharge = function(invoiceId, index) {
  const bill = state.billing.find(b => b.id === invoiceId);
  if (bill && bill.items[index]) {
    const item = bill.items[index];
    item.status = 'Cancelled';
    logBillingAudit(invoiceId, "Charge Cancelled", `${item.desc} (Reversed)`);
    
    // Recalculate totals
    let tempSum = 0;
    bill.items.forEach(item => { if (item.status === 'Active') tempSum += item.total; });
    bill.amount = tempSum;

    renderInvoiceWorkspace(document.getElementById('main-content'), invoiceId);
  }
};

// --------------------------------------------------------------------------
// PACKAGE ASSIGNMENT
// --------------------------------------------------------------------------
window.showPackageAssignModal = function(invoiceId) {
  const modal = document.getElementById('billing-modal');
  modal.style.display = 'flex';
  modal.innerHTML = `
    <div class="modal-box" style="max-width:550px; padding:1.5rem;">
      <h4 style="margin:0 0 1rem 0; font-weight:700;">📦 Assign Pre-Defined Surgery/Procedure Package</h4>
      <div class="form-group" style="margin-bottom:1rem;">
        <label>Select Package</label>
        <select id="package-selector" class="form-select" style="font-size:0.85rem;">
          ${PACKAGE_MASTER.map(p => `<option value="${p.code}">${p.name} - ${formatINR(p.basePrice)}</option>`).join('')}
        </select>
      </div>
      <div style="font-size:0.75rem; color:var(--text-muted); margin-bottom:1rem; padding:0.5rem; background:#f8fafc; border-radius:4px;">
        💡 Assigned package will override individual inclusion charges with the base package rate. Excluded services are billed itemised separately.
      </div>
      <div style="display:flex; gap:0.5rem;">
        <button class="btn btn-secondary" style="flex:1;" onclick="window.closeBillingModal()">Cancel</button>
        <button class="btn btn-primary" style="flex:1;" onclick="window.confirmPackageAssignment('${invoiceId}')">Apply Package</button>
      </div>
    </div>
  `;
};

window.confirmPackageAssignment = function(invoiceId) {
  const code = document.getElementById('package-selector').value;
  const pkg = PACKAGE_MASTER.find(p => p.code === code);
  const bill = state.billing.find(b => b.id === invoiceId);

  if (pkg && bill) {
    // Clear and override with package rate
    bill.items = [{
      desc: `Overridden package: ${pkg.name}`,
      qty: 1,
      rate: pkg.basePrice,
      total: pkg.basePrice,
      sac: "999312",
      gstRate: 0,
      gstAmount: 0,
      status: 'Active'
    }];
    bill.amount = pkg.basePrice;
    logBillingAudit(invoiceId, "Package Linked", pkg.name);
    window.closeBillingModal();
    renderInvoiceWorkspace(document.getElementById('main-content'), invoiceId);
  }
};

// --------------------------------------------------------------------------
// ADVANCE MANAGEMENT
// --------------------------------------------------------------------------
window.showAdvanceModal = function(invoiceId) {
  const modal = document.getElementById('billing-modal');
  modal.style.display = 'flex';
  modal.innerHTML = `
    <div class="modal-box" style="max-width:500px; padding:1.5rem;">
      <h4 style="margin:0 0 1rem 0; font-weight:700;">📥 Record Advance Deposit Token</h4>
      <div class="form-group" style="margin-bottom:1rem;">
        <label>Deposit Amount (₹)</label>
        <input type="number" id="adv-amt" class="form-control" value="5000">
      </div>
      <div class="form-group" style="margin-bottom:1rem;">
        <label>Payment Mode</label>
        <select id="adv-mode" class="form-select">
          <option value="UPI">UPI / GPay</option>
          <option value="Cash">Cash</option>
          <option value="Card">Credit / Debit Card</option>
          <option value="NEFT">Bank Transfer / NEFT</option>
        </select>
      </div>
      <div style="display:flex; gap:0.5rem;">
        <button class="btn btn-secondary" style="flex:1;" onclick="window.closeBillingModal()">Cancel</button>
        <button class="btn btn-primary" style="flex:1;" onclick="window.submitAdvance('${invoiceId}')">Register Advance</button>
      </div>
    </div>
  `;
};

window.submitAdvance = function(invoiceId) {
  const amt = parseFloat(document.getElementById('adv-amt').value);
  const mode = document.getElementById('adv-mode').value;
  const bill = state.billing.find(b => b.id === invoiceId);

  if (bill && !isNaN(amt) && amt > 0) {
    bill.advancePaid += amt;
    logBillingAudit(invoiceId, "Advance Collected", `${formatINR(amt)} via ${mode}`);
    window.closeBillingModal();
    renderInvoiceWorkspace(document.getElementById('main-content'), invoiceId);
  }
};

// --------------------------------------------------------------------------
// DISCOUNT MANAGEMENT
// --------------------------------------------------------------------------
window.showDiscountModal = function(invoiceId) {
  const modal = document.getElementById('billing-modal');
  modal.style.display = 'flex';
  modal.innerHTML = `
    <div class="modal-box" style="max-width:500px; padding:1.5rem;">
      <h4 style="margin:0 0 1rem 0; font-weight:700;">🏷️ Apply Bill-Level RCM Discount</h4>
      <div class="form-group" style="margin-bottom:1rem;">
        <label>Discount Value (₹)</label>
        <input type="number" id="disc-val" class="form-control" value="500">
      </div>
      <div class="form-group" style="margin-bottom:1rem;">
        <label>Discount Authorization Reason</label>
        <select id="disc-reason" class="form-select">
          <option value="Clinical Compassionate Grounds">Clinical Compassionate Grounds</option>
          <option value="Empaneled Corporate Rate Correction">Empaneled Corporate Rate Correction</option>
          <option value="VIP / Executive Service Discount">VIP / Executive Service Discount</option>
        </select>
      </div>
      <div style="display:flex; gap:0.5rem;">
        <button class="btn btn-secondary" style="flex:1;" onclick="window.closeBillingModal()">Cancel</button>
        <button class="btn btn-primary" style="flex:1;" onclick="window.submitDiscount('${invoiceId}')">Apply Discount</button>
      </div>
    </div>
  `;
};

window.submitDiscount = function(invoiceId) {
  const val = parseFloat(document.getElementById('disc-val').value);
  const reason = document.getElementById('disc-reason').value;
  const bill = state.billing.find(b => b.id === invoiceId);

  if (bill && !isNaN(val) && val >= 0) {
    // Check permission thresholds
    let autoApprove = false;
    if (val <= 500 && hasPermission("apply_discount_pre")) {
      autoApprove = true;
    } else if (val <= 5000 && hasPermission("approve_discount")) {
      autoApprove = true;
    } else if (hasPermission("approve_discount") && activeBillingRole === 'ACCOUNTS_MANAGER') {
      autoApprove = true;
    }

    if (autoApprove) {
      bill.discountAmount = val;
      logBillingAudit(invoiceId, "Discount Applied & Approved", `${formatINR(val)} - Reason: ${reason}`);
      window.closeBillingModal();
      renderInvoiceWorkspace(document.getElementById('main-content'), invoiceId);
    } else {
      alert(`⚠️ Action Required: Discount of ${formatINR(val)} exceeds your role thresholds. Escalated to Billing Supervisor/Accounts Manager approval.`);
      window.closeBillingModal();
    }
  }
};

// --------------------------------------------------------------------------
// DISCHARGE PRE-VALIDATION CHECKLIST
// --------------------------------------------------------------------------
window.showPreValidationChecklist = function(invoiceId) {
  const modal = document.getElementById('billing-modal');
  modal.style.display = 'flex';
  modal.innerHTML = `
    <div class="modal-box" style="max-width:550px; padding:1.5rem;">
      <h4 style="margin:0 0 1rem 0; font-weight:700; color:var(--color-warning);">🚪 IPD Final Bill Pre-Validation Checklist</h4>
      <div style="display:flex; flex-direction:column; gap:0.5rem; margin-bottom:1.5rem; text-align:left; font-size:0.85rem;">
        <label><input type="checkbox" checked disabled> [✓] All Laboratory orders resulting complete / verified</label>
        <label><input type="checkbox" checked disabled> [✓] Radiology images reported & signed off</label>
        <label><input type="checkbox" checked disabled> [✓] Pharmacy returns credited and closed</label>
        <label><input type="checkbox" checked disabled> [✓] Room/Bed allocation days reconciled to discharge date</label>
        <label><input type="checkbox" id="check-disc"> [ ] Treating Consultant discharge order raised in EMR</label>
      </div>
      <div style="display:flex; gap:0.5rem;">
        <button class="btn btn-secondary" style="flex:1;" onclick="window.closeBillingModal()">Cancel</button>
        <button class="btn btn-primary" style="flex:1; background:var(--color-success); border-color:var(--color-success);" onclick="window.confirmPreValidation('${invoiceId}')">Generate Final Bill</button>
      </div>
    </div>
  `;
};

window.confirmPreValidation = function(invoiceId) {
  const checklistChecked = document.getElementById('check-disc').checked;
  if (!checklistChecked) {
    alert("⚠️ Mandatory Check Failed: treating doctor must sign the discharge summary in EMR before billing can generate the final invoice.");
    return;
  }

  const bill = state.billing.find(b => b.id === invoiceId);
  if (bill) {
    bill.status = 'Ready for Settlement';
    logBillingAudit(invoiceId, "Discharge Pre-Validation Passed", "Final Bill Generation ready.");
    window.closeBillingModal();
    renderInvoiceWorkspace(document.getElementById('main-content'), invoiceId);
  }
};

// --------------------------------------------------------------------------
// SPLIT PAYMENT COLLECTION
// --------------------------------------------------------------------------
window.settleWorkspacePayment = function(invoiceId) {
  const collectAmt = parseFloat(document.getElementById('collect-amt').value);
  const mode = document.getElementById('collect-mode').value;
  const ref = document.getElementById('collect-ref').value;
  const bill = state.billing.find(b => b.id === invoiceId);

  if (bill && !isNaN(collectAmt) && collectAmt > 0) {
    bill.paid += collectAmt;
    
    // Check if fully paid
    let grossAmount = 0;
    let totalGst = 0;
    bill.items.forEach(item => {
      if (item.status === 'Active') {
        grossAmount += item.total;
        totalGst += item.total * (item.gstRate / 100);
      }
    });
    const netPayable = grossAmount - bill.discountAmount + totalGst;

    if (bill.paid + bill.advancePaid >= netPayable) {
      bill.status = 'Settled';
    } else {
      bill.status = 'Outstanding';
    }

    logBillingAudit(invoiceId, "Payment Collected", `${formatINR(collectAmt)} via ${mode} (Ref: ${ref})`);
    
    // Trigger Print Receipt dialog
    alert(`Payment of ${formatINR(collectAmt)} logged successfully! Printing transaction receipt...`);
    window.mockPrintInvoice(invoiceId);
    
    renderInvoiceWorkspace(document.getElementById('main-content'), invoiceId);
  }
};

// --------------------------------------------------------------------------
// AUDIT LOG DIALOG
// --------------------------------------------------------------------------
window.showAuditLogsModal = function(invoiceId) {
  const bill = state.billing.find(b => b.id === invoiceId);
  const modal = document.getElementById('billing-modal');
  modal.style.display = 'flex';
  modal.innerHTML = `
    <div class="modal-box" style="max-width:650px; padding:1.5rem; text-align:left;">
      <h4 style="margin:0 0 1rem 0; font-weight:700;">📜 Append-Only RCM Transaction Log Audit Trail</h4>
      <div style="max-height:300px; overflow-y:auto; display:flex; flex-direction:column; gap:0.5rem; font-size:0.75rem; border: 1px solid var(--border-color); padding:0.5rem; border-radius:4px; background:#fafafa;">
        ${bill.auditLogs.map(log => `
          <div style="border-bottom:1px solid #eee; padding-bottom:0.35rem;">
            <div style="color:var(--text-muted); font-size:0.7rem;">${new Date(log.timestamp).toLocaleString('en-IN')}</div>
            <strong>${log.action}</strong> by <code>${log.user}</code> <br>
            <span style="color:#2563eb;">${log.details || ''}</span>
          </div>
        `).join('')}
      </div>
      <button class="btn btn-secondary" style="width:100%; margin-top:1rem;" onclick="window.closeBillingModal()">Close Audit Log</button>
    </div>
  `;
};

// --------------------------------------------------------------------------
// SHIFT RECONCILIATION MODAL
// --------------------------------------------------------------------------
window.showShiftClosureModal = function() {
  const modal = document.getElementById('billing-modal');
  modal.style.display = 'flex';
  modal.innerHTML = `
    <div class="modal-box" style="max-width:500px; padding:1.5rem;">
      <h4 style="margin:0 0 1rem 0; font-weight:700;">🛒 Cashier Shift Reconciliation Handover</h4>
      <div style="font-size:0.8rem; text-align:left; display:flex; flex-direction:column; gap:0.5rem; margin-bottom:1rem;">
        <div><strong>Expected collection:</strong> ${formatINR(24500)}</div>
        <div class="form-group">
          <label>Declared Cash Drawer Balance (₹)</label>
          <input type="number" id="shift-declared" class="form-control" value="24500">
        </div>
      </div>
      <div style="display:flex; gap:0.5rem;">
        <button class="btn btn-secondary" style="flex:1;" onclick="window.closeBillingModal()">Cancel</button>
        <button class="btn btn-primary" style="flex:1;" onclick="window.closeHandoverShift()">Close Shift</button>
      </div>
    </div>
  `;
};

window.closeHandoverShift = function() {
  alert("Shift closed successfully. Reconciliation report dispatched to Accounts Manager.");
  window.closeBillingModal();
};

// --------------------------------------------------------------------------
// NEW BILL INITIATOR
// --------------------------------------------------------------------------
window.showNewBillModal = function() {
  const modal = document.getElementById('billing-modal');
  modal.style.display = 'flex';
  modal.innerHTML = `
    <div class="modal-box" style="max-width:500px; padding:1.5rem;">
      <h4 style="margin:0 0 1rem 0; font-weight:700;">➕ Create New Patient Billing Session</h4>
      <div class="form-group" style="margin-bottom:1rem;">
        <label>Select Patient</label>
        <select id="newbill-patient" class="form-select">
          ${state.patients.map(p => `<option value="${p.uhid}">${p.name} (${p.uhid})</option>`).join('')}
        </select>
      </div>
      <div class="form-group" style="margin-bottom:1rem;">
        <label>Visit Type</label>
        <select id="newbill-type" class="form-select">
          <option value="OPD">OPD Consultation</option>
          <option value="IPD">IPD Admission</option>
          <option value="Emergency">Emergency Room</option>
          <option value="Day Care">Day Care Unit</option>
        </select>
      </div>
      <div style="display:flex; gap:0.5rem;">
        <button class="btn btn-secondary" style="flex:1;" onclick="window.closeBillingModal()">Cancel</button>
        <button class="btn btn-primary" style="flex:1;" onclick="window.confirmNewBill()">Initialize Bill</button>
      </div>
    </div>
  `;
};

window.confirmNewBill = function() {
  const uhid = document.getElementById('newbill-patient').value;
  const visitType = document.getElementById('newbill-type').value;
  const patient = state.patients.find(p => p.uhid === uhid);

  if (patient) {
    const newId = "INV" + String(8000 + state.billing.length + 1);
    state.billing.push({
      id: newId,
      uhid: patient.uhid,
      patientName: patient.name,
      date: new Date().toISOString().split('T')[0],
      amount: 0,
      paid: 0,
      status: "Outstanding",
      visitType,
      admissionNo: visitType === 'IPD' ? "ADM" + String(5000 + state.billing.length) : "",
      doctorName: patient.primaryConsultant || "Dr. Rajesh Singh",
      department: patient.department || "General Medicine",
      paymentCategory: patient.payerType || "Self Pay",
      advancePaid: 0,
      discountAmount: 0,
      gstAmount: 0,
      items: [],
      auditLogs: [{ timestamp: new Date().toISOString(), user: activeBillingRole, action: "Invoice Initialized" }]
    });

    window.closeBillingModal();
    router.navigate(`billing-workspace?id=${newId}`);
  }
};

window.closeBillingModal = function() {
  const modal = document.getElementById('billing-modal');
  if (modal) modal.style.display = 'none';
};

// --------------------------------------------------------------------------
// MOCK INVOICE PRINT (GST compliant layout)
// --------------------------------------------------------------------------
window.mockPrintInvoice = function(invoiceId) {
  const bill = state.billing.find(b => b.id === invoiceId);
  if (!bill) return;

  // Recalculate totals
  let grossAmount = 0;
  let totalGst = 0;
  bill.items.forEach(item => {
    if (item.status === 'Active') {
      grossAmount += item.total;
      totalGst += item.total * (item.gstRate / 100);
    }
  });
  const netPayable = grossAmount - bill.discountAmount + totalGst;

  const w = window.open('', '_blank', 'width=800,height=800');
  
  let billItemsHTML = bill.items.map(item => `
    <tr style="border-bottom: 1px dashed #ddd; font-size: 0.82rem;">
      <td style="padding: 6px 0;">
        <strong>${item.desc}</strong><br>
        <span style="font-size: 0.72rem; color: #666;">SAC: ${item.sac || '999312'}</span>
      </td>
      <td style="padding: 6px 0; text-align: center;">${item.qty}</td>
      <td style="padding: 6px 0; text-align: right;">${formatINR(item.rate)}</td>
      <td style="padding: 6px 0; text-align: center;">${item.gstRate}%</td>
      <td style="padding: 6px 0; text-align: right;">${formatINR(item.total)}</td>
    </tr>
  `).join('');

  w.document.write(`
    <html>
      <head>
        <title>GST Tax Invoice - ${bill.id}</title>
        <style>
          body { font-family: 'Inter', sans-serif; padding: 30px; line-height: 1.5; color: #334155; background: #fff; }
          .invoice-box { max-width: 800px; margin: auto; }
          .header { display: flex; justify-content: space-between; border-bottom: 2px solid #1e3a8a; padding-bottom: 15px; margin-bottom: 20px; }
          .hospital-title { font-size: 1.3rem; font-weight: 800; color: #1e3a8a; margin: 0; }
          .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; font-size: 0.85rem; }
          .bill-table { width: 100%; border-collapse: collapse; margin-top: 15px; margin-bottom: 25px; }
          .bill-table th { background: #f8fafc; border-bottom: 2px solid #cbd5e1; padding: 8px 0; font-weight: 700; text-transform: uppercase; font-size: 0.75rem; text-align: left; }
          .summary-table { margin-left: auto; width: 320px; font-size: 0.85rem; line-height: 1.8; }
          .summary-table tr td:last-child { text-align: right; font-weight: 700; }
          .footer { text-align: center; border-top: 1px solid #e2e8f0; margin-top: 40px; padding-top: 15px; font-size: 0.78rem; color: #64748b; }
        </style>
      </head>
      <body>
        <div class="invoice-box">
          <div class="header">
            <div>
              <div class="hospital-title">SARONIL SUPER SPECIALTY HOSPITAL</div>
              <div style="font-size: 0.8rem; color: #64748b;">HSR Layout Sector-1, Bengaluru, KA 560102</div>
              <div style="font-size: 0.8rem; color: #64748b;"><strong>GSTIN:</strong> 29AAAAA0000A1Z5</div>
            </div>
            <div style="text-align: right;">
              <h2 style="margin: 0; color: #1e3a8a; font-size: 1.4rem;">TAX INVOICE</h2>
              <div style="font-size: 0.85rem; font-weight: 700; color: #475569;">Invoice ID: ${bill.id}</div>
              <div style="font-size: 0.8rem; color: #64748b;">Date: ${bill.date}</div>
            </div>
          </div>

          <div class="meta-grid">
            <div>
              <h4 style="margin: 0 0 5px 0; color: #1e3a8a; font-size: 0.9rem;">Patient Information</h4>
              <strong>Name:</strong> ${bill.patientName}<br>
              <strong>UHID:</strong> ${bill.uhid} | <strong>Gender/Age:</strong> ${bill.visitType}<br>
              <strong>Primary Consultant:</strong> ${bill.doctorName}
            </div>
            <div>
              <h4 style="margin: 0 0 5px 0; color: #1e3a8a; font-size: 0.9rem;">Sponsor / Insurance Details</h4>
              <strong>Payer Category:</strong> ${bill.paymentCategory}<br>
              <strong>TPA Company:</strong> ${bill.insuranceDetails ? bill.insuranceDetails.provider : 'Self Pay / Cash Tariff'}<br>
              <strong>Pre-Auth Approved Limit:</strong> ${bill.insuranceDetails ? formatINR(bill.insuranceDetails.approvedAmt) : 'N/A'}
            </div>
          </div>

          <table class="bill-table">
            <thead>
              <tr>
                <th style="width: 50%;">Service Description / HSN Code</th>
                <th style="width: 10%; text-align: center;">Qty</th>
                <th style="width: 15%; text-align: right;">Rate</th>
                <th style="width: 10%; text-align: center;">GST</th>
                <th style="width: 15%; text-align: right;">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${billItemsHTML}
            </tbody>
          </table>

          <div style="display: flex; justify-content: space-between;">
            <div style="font-size: 0.78rem; max-width: 400px; color: #64748b;">
              <strong>Declaration:</strong> We declare that this invoice shows the actual price of the services described and that all particulars are true and correct.
            </div>
            <table class="summary-table">
              <tr>
                <td>Gross Total:</td>
                <td>${formatINR(grossAmount)}</td>
              </tr>
              <tr>
                <td style="color:#ef4444;">Discount Allowed:</td>
                <td style="color:#ef4444;">-${formatINR(bill.discountAmount)}</td>
              </tr>
              <tr>
                <td>CGST + SGST Output Tax:</td>
                <td>+${formatINR(totalGst)}</td>
              </tr>
              <tr style="border-top: 1px solid #cbd5e1; font-size: 1rem; color: #1e3a8a;">
                <td>Net Invoice Amount:</td>
                <td>${formatINR(netPayable)}</td>
              </tr>
              <tr style="color: #64748b;">
                <td>Advance Adjusted:</td>
                <td>-${formatINR(bill.advancePaid)}</td>
              </tr>
              <tr style="color: #059669;">
                <td>Amount Paid:</td>
                <td>-${formatINR(bill.paid)}</td>
              </tr>
              <tr style="border-top: 2px solid #1e3a8a; font-size: 1rem; color: #b91c1c;">
                <td>Balance Outstanding:</td>
                <td>${formatINR(netPayable - bill.paid - bill.advancePaid > 0 ? netPayable - bill.paid - bill.advancePaid : 0)}</td>
              </tr>
            </table>
          </div>

          <div class="footer">
            <p>Thank you for choosing Saronil Super Specialty Hospital. This is a computer-generated GST tax invoice.</p>
          </div>
        </div>
      </body>
    </html>
  `);
  w.document.close();
  w.print();
};

