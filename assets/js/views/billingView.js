/* ==========================================================================
   SARONIL HMS - ADVANCED REVENUE CYCLE MANAGEMENT & BILLING MODULE (billingView.js)
   ========================================================================== */

// Configure Role Access Permissions
const BILLING_ROLES = {
  CASHIER: { name: "Cashier", permissions: ["collect_payment", "print_receipt", "collect_advance", "view_shift"] },
  BILLING_EXECUTIVE: { name: "Billing Executive", permissions: ["create_bill", "add_charge", "cancel_charge", "apply_discount_pre", "interim_bill", "final_bill", "process_refund"] },
  BILLING_SUPERVISOR: { name: "Billing Supervisor", permissions: ["create_bill", "add_charge", "cancel_charge", "apply_discount_pre", "interim_bill", "final_bill", "process_refund", "approve_discount", "approve_refund", "override_charges", "unlock_bill"] },
  ACCOUNTS_MANAGER: { name: "Accounts Manager", permissions: ["create_bill", "add_charge", "cancel_charge", "apply_discount_pre", "interim_bill", "final_bill", "process_refund", "approve_discount", "approve_refund", "override_charges", "unlock_bill", "day_close", "cashier_reconcile", "credit_note", "corporate_statement", "reports"] },
  MRD_COORDINATOR: { name: "MRD / Discharge Coordinator", permissions: ["view_bill", "discharge_clearance"] }
};

// State persistence
if (!window.activeBillingRole) {
  window.activeBillingRole = "BILLING_EXECUTIVE"; // Default starting role
}
if (!window.activeBillingTab) {
  window.activeBillingTab = "billing_queue";
}
if (!window.activeBillingInvoiceId) {
  window.activeBillingInvoiceId = null;
}
if (!window.cashierShift) {
  window.cashierShift = {
    status: "Open", // Open, Closed
    startTime: "08:00 AM",
    closingBalance: 0,
    declaredCash: 0,
    receiptsPrinted: 38,
    draftOpdBills: 0
  };
}

// --------------------------------------------------------------------------
// MOCK DATA FOR BILLING MODULE
// --------------------------------------------------------------------------
if (!window.state.billingPendingApprovals) {
  window.state.billingPendingApprovals = [
    { id: "REQ-DISC-01", uhid: "SH-2026-04821", name: "Rajesh Kumar", billAmt: 42500, discRequested: 4250, percent: 10, requestedBy: "Billing Exec (Ankit)", reason: "Patient financial hardship — TPA shortpay expected", category: "Patient hardship", status: "Pending" },
    { id: "REQ-DISC-02", uhid: "SH-2026-04799", name: "Mohammed Iqbal", billAmt: 78000, discRequested: 7800, percent: 10, requestedBy: "Dr. Mehta", reason: "Management discretion — post-op complication extended stay", category: "Trust fund", status: "Pending" },
    { id: "REQ-CAN-01", targetId: "INV-8001", name: "Sunita Sharma", amount: 600, reason: "Duplicate OPD registration fee — patient walked out", raisedBy: "Cashier (Sonia)", status: "Pending" }
  ];
}

if (!window.state.billingAdvances) {
  window.state.billingAdvances = [
    { name: "Rajesh Kumar", uhid: "SH-2026-04821", admDate: window._HIS_DATE(9), deposited: 30000, adjusted: 15000, balance: 15000, daysSinceTopup: 2, status: "Active" },
    { name: "Mohammed Iqbal", uhid: "SH-2026-04799", admDate: window._HIS_DATE(11), deposited: 50000, adjusted: 48500, balance: 1500, daysSinceTopup: 5, status: "Low Balance" },
    { name: "Vikram Singh", uhid: "SH-2026-04790", admDate: window._HIS_DATE(4), deposited: 10000, adjusted: 10000, balance: 0, daysSinceTopup: 7, status: "Exhausted" }
  ];
}

if (!window.state.billingPackages) {
  window.state.billingPackages = [
    { name: "Rajesh Kumar", package: "Appendicectomy", pkgAmt: 45000, actuals: 32000, variance: -13000, pct: -28.8, status: "Underuse", actionNeeded: false },
    { name: "Sunita Sharma", package: "Normal Delivery", pkgAmt: 35000, actuals: 34500, variance: -500, pct: -1.4, status: "Within Package", actionNeeded: false },
    { name: "Vikram Singh", package: "LSCS Private Room Package", pkgAmt: 65000, actuals: 82000, variance: 17000, pct: 26.1, status: "Conflict", actionNeeded: true }
  ];
}

if (!window.state.billingTpaCases) {
  window.state.billingTpaCases = [
    { caseNo: "TPA-99231", name: "Mohammed Iqbal", uhid: "SH-2026-04799", provider: "Medi Assist", policyNo: "MA-POL-88231", sumInsured: 500000, roomLimit: 5000, subLimits: "ICU: 10000/day, Surg: 100000", pedFlag: "N", coPay: 10, loaAmount: 80000, daysAdmitted: 9, estimatedBill: 95000, status: "Active", loaStatus: "LOA Approved", loaValue: 80000 },
    { caseNo: "TPA-99232", name: "Anjali Bose", uhid: "SH-2026-04845", provider: "Star Health", policyNo: "SH-POL-00293", sumInsured: 300000, roomLimit: 3000, subLimits: "No sublimits", pedFlag: "N", coPay: 0, loaAmount: 5000, daysAdmitted: 0, estimatedBill: 800, status: "OPD", loaStatus: "Not Required", loaValue: 0 }
  ];
}

if (!window.state.billingClaims) {
  window.state.billingClaims = [
    { claimNo: "CLM-9092", patient: "Kamal Hassan", tpa: "MD India", date: window._HIS_DATE(4), amount: 145000, checklist: { formA: true, formB: true, bills: true, discharge: true, reports: true, preauth: true, kyc: true, neft: false, implant: false, otNotes: false }, status: "Under Processing" },
    { claimNo: "CLM-9093", patient: "Rajesh Khanna", tpa: "Paramount", date: window._HIS_DATE(5), amount: 62000, checklist: { formA: true, formB: true, bills: true, discharge: true, reports: true, preauth: true, kyc: true, neft: true, implant: true, otNotes: true }, status: "Query Raised" }
  ];
}

if (!window.state.billingSettlements) {
  window.state.billingSettlements = [
    { tpa: "Medi Assist", claimNo: "CLM-8821", billed: 120000, settled: 112000, shortPay: 8000, reason: "Room rent limit capped", date: window._HIS_DATE(3), utr: "UTIN8829102X" },
    { tpa: "MD India", claimNo: "CLM-8762", billed: 78000, settled: 74000, shortPay: 4000, reason: "Consumables disallowed", date: window._HIS_DATE(2), utr: "UTIN8892104Y" }
  ];
}

if (!window.state.billingQueries) {
  window.state.billingQueries = [
    { query: "Provide implant sticker & barcode log sheet", patient: "Kamal Hassan", date: window._HIS_DATE(3), due: window._HIS_DATE(0), sent: "No", status: "Open" }
  ];
}

if (!window.state.billingGovtCases) {
  window.state.billingGovtCases = [
    { name: "Suresh Babu", uhid: "SH-2026-04768", cardNo: "CGHS-88291A", beneficiary: "Pensioner (Retd. Govt. Employee)", wardEntitlement: "Semi-Private", rateList: "Y", billAmt: 18000, cghsRate: 14500, difference: 3500, status: "Rate Applied", polyReferral: "Y" },
    { name: "Pramod Rao", uhid: "SH-2026-04870", cardNo: "ECHS-00291B", beneficiary: "Ex-Serviceman", wardEntitlement: "Private", rateList: "Y", billAmt: 800, cghsRate: 600, difference: 200, status: "OPD — Referral Required", polyReferral: "N" }
  ];
}

if (!window.state.billingPmjayCases) {
  window.state.billingPmjayCases = [
    { name: "Girish Nair", uhid: "SH-2026-04880", code: "HBP-CARD-02", pkgName: "Community-Acquired Pneumonia Package", pkgAmt: 14000, preAuthId: "NHA-PMJAY-88219", actuals: 16500, status: "Pre-Auth Pending" }
  ];
}

if (!window.state.billingRefunds) {
  window.state.billingRefunds = [
    { id: "REF-001", name: "Amit Shah", amount: 800, reason: "Pharmacy drugs return", requestedBy: "Billing Exec (Ankit)", date: window._HIS_DATE(3), approver: "Ankit", status: "Approved" },
    { id: "REF-002", name: "Rita Patel", amount: 4500, reason: "Duplicate Lab investigation charge", requestedBy: "Billing Exec (Ankit)", date: window._HIS_DATE(2), approver: "Billing Supervisor (Karan)", status: "Pending Approval" },
    { id: "REF-003", name: "Gopal Prasad", amount: 12000, reason: "Overpaid admission deposit refund", requestedBy: "Billing Exec (Ankit)", date: window._HIS_DATE(2), approver: "Accounts Manager (Rajesh)", status: "Pending Approval" }
  ];
}

if (!window.state.billingMrdQueue) {
  window.state.billingMrdQueue = [
    { name: "Rajesh Kumar", uhid: "SH-2026-04821", bed: "CCU-BED-04", doctor: "Dr. Rajesh Singh", dischargeTime: window._HIS_DATE(2) + " 10:30 AM", tat: "2h 15m", clearance: { billing: true, pharmacy: true, nursing: true, doctor: true, icd: false, consent: true, lama: false, mlc: false } },
    { name: "Mohammed Iqbal", uhid: "SH-2026-04799", bed: "GW-BED-12", doctor: "Dr. Rajesh Singh", dischargeTime: window._HIS_DATE(2) + " 08:00 AM", tat: "4h 45m", clearance: { billing: false, pharmacy: true, nursing: true, doctor: false, icd: false, consent: true, lama: false, mlc: false } },
    { name: "Vikram Singh", uhid: "SH-2026-04790", bed: "PVT-BED-01", doctor: "Dr. Amit Verma", dischargeTime: window._HIS_DATE(3) + " 04:00 PM", tat: "20h 45m", clearance: { billing: false, pharmacy: false, nursing: false, doctor: false, icd: false, consent: false, lama: false, mlc: true } }
  ];
}

if (!window.state.billingMrdCoding) {
  window.state.billingMrdCoding = [
    { name: "Rajesh Kumar", diagnosis: "Acute Appendicitis with Local Peritonitis", procedure: "Laparoscopic Appendectomy", icd10: "K35.3", secondary: "K65.0", codedBy: "", validatedBy: "", status: "Pending" }
  ];
}

if (!window.state.billingMrdDeficiencies) {
  window.state.billingMrdDeficiencies = [
    { name: "Mohammed Iqbal", missing: "Signed Pre-Op High Risk Consent Form, OT Notes", sentTo: "Dr. Rajesh Singh", dateSent: window._HIS_DATE(2), response: "", status: "Open" }
  ];
}

if (!window.state.billingOpdReceipts) {
  window.state.billingOpdReceipts = [
    { receiptNo: "RCP-2026-0001", patient: "Rajesh Kumar", service: "OPD Consultation - Specialist", amount: 800, mode: "UPI", time: "09:15 AM", reprints: 0 },
    { receiptNo: "RCP-2026-0002", patient: "Kavita Sharma", service: "Complete Blood Count (CBC)", amount: 350, mode: "Cash", time: "10:20 AM", reprints: 0 }
  ];
}

// --------------------------------------------------------------------------
// PERSISTENT VIEWS REGISTRY HOOK
// --------------------------------------------------------------------------
window.views.billing = function(container, subAnchor, params) {
  normalizeBillingRecords();
  
  // Align activeBillingRole with the global persona selection
  const globalRole = window.state && window.state.activeUserRole;
  if (['CASHIER', 'BILLING_EXECUTIVE', 'BILLING_SUPERVISOR', 'MRD_COORDINATOR', 'ACCOUNTS_MANAGER', 'AUDITOR', 'Super Admin'].includes(globalRole)) {
    window.activeBillingRole = globalRole;
  }
  
  if (subAnchor === 'workspace' && params && params.id) {
    if (params.id.startsWith('REQ-')) {
      const uhid = params.id.replace('REQ-', '');
      let bill = state.billing.find(b => b.id === params.id);
      if (!bill) {
        const req = window.state.admissionRequests.find(r => r.uhid === uhid);
        const patientObj = window.state.patients.find(p => p.uhid === uhid) || { name: 'Patient' };
        
        const thresholds = window.state.advanceThresholds || { Standard: 5000, ICU: 15000, Daycare: 2000 };
        const isICU = req?.wardPreference === 'ICU' || req?.wardPreference === 'CCU' || req?.wardPreference === 'ICCU';
        const reqAmount = isICU ? thresholds['ICU'] : thresholds['Standard'];
        const advObj = (window.state.billingAdvances || []).find(a => a.uhid === uhid);
        const balance = advObj ? advObj.balance : 0;
        const shortfall = reqAmount - balance;

        bill = {
          id: params.id,
          uhid: uhid,
          patientName: patientObj.name,
          doctorName: req?.requestedBy || 'Dr. Amit Verma',
          department: 'General Medicine',
          visitType: 'IPD Request',
          date: new Date().toLocaleDateString('en-CA'),
          amount: shortfall,
          paid: 0,
          status: 'Pending',
          paymentCategory: req?.payer || 'Self Pay',
          advancePaid: balance,
          items: [
            { desc: `IPD Admission Advance Deposit Shortfall (Required: ₹${reqAmount}, Paid: ₹${balance})`, qty: 1, rate: shortfall, total: shortfall }
          ],
          auditLogs: [{ timestamp: new Date().toISOString(), user: "System", action: `IPD Admission Advance Payment Workspace opened (Required: ₹${reqAmount}, Paid: ₹${balance}, Shortfall: ₹${shortfall})` }]
        };
        state.billing.push(bill);
        localStorage.setItem('saronil_billing', JSON.stringify(state.billing));
      }
    }
    window.activeBillingInvoiceId = params.id;
    renderInvoiceWorkspace(container, params.id);
  } else {
    if (params && params.tab) {
      window.activeBillingTab = params.tab;
    }
    if (params && params.uhid) {
      window.billingSearchFilter = params.uhid;
    } else {
      window.billingSearchFilter = '';
    }
    renderBillingDashboard(container);
  }
};

function normalizeBillingRecords() {
  const OPD_UHIDS = ['SH-2026-04817','SH-2026-04826','SH-2026-04850','SH-2026-04845','SH-2026-04870','SH-2026-04855','SH-2026-04862','SH-2026-04869'];
  const INS_UHIDS = ['SH-2026-04799','SH-2026-04790','SH-2026-04821','SH-2026-04810','SH-2026-04831','SH-2026-04845','SH-2026-04822','SH-2026-04812','SH-2026-04798'];

  // Sync names in all billing database objects with the single source of truth (window.state.patients)
  if (window.state.billingPendingApprovals) {
    window.state.billingPendingApprovals.forEach(x => {
      const p = (window.state.patients || []).find(pt => pt.uhid === x.uhid);
      if (p) x.name = p.name;
    });
  }
  if (window.state.billingAdvances) {
    window.state.billingAdvances.forEach(x => {
      const p = (window.state.patients || []).find(pt => pt.uhid === x.uhid);
      if (p) x.name = p.name;
    });
  }
  if (window.state.billingPackages) {
    window.state.billingPackages.forEach(x => {
      const p = (window.state.patients || []).find(pt => pt.name === x.name || pt.uhid === x.uhid);
      if (p) {
        x.name = p.name;
        if (p.uhid) x.uhid = p.uhid;
      }
    });
  }
  if (window.state.billingTpaCases) {
    window.state.billingTpaCases.forEach(x => {
      const p = (window.state.patients || []).find(pt => pt.uhid === x.uhid);
      if (p) x.name = p.name;
    });
  }
  if (window.state.billingGovtCases) {
    window.state.billingGovtCases.forEach(x => {
      const p = (window.state.patients || []).find(pt => pt.uhid === x.uhid);
      if (p) x.name = p.name;
    });
  }
  if (window.state.billingPmjayCases) {
    window.state.billingPmjayCases.forEach(x => {
      const p = (window.state.patients || []).find(pt => pt.uhid === x.uhid);
      if (p) x.name = p.name;
    });
  }

  state.billing.sort((a,b) => (b.date || '').localeCompare(a.date || '')); // recent first
  state.billing.forEach(b => {
    if (!b.id && b.invoiceId) b.id = b.invoiceId;
    if (!b.id) b.id = "INV" + Math.floor(Math.random() * 100000);
    if (!b.items) b.items = [];

    // Dynamically retrieve name from common patients registry
    const pObj = (window.state.patients || []).find(x => x.uhid === b.uhid);
    if (pObj) {
      b.patientName = pObj.name;
    }

    if (!b.visitType) {
      b.visitType = (pObj?.type === 'OPD' || OPD_UHIDS.includes(b.uhid)) ? "OPD" : "IPD";
    }
    if (!b.admissionNo) b.admissionNo = b.visitType === "IPD" ? "ADM" + b.id.replace("INV", "").replace(/[^0-9]/g,'') : "";
    if (!b.doctorName) { const p = (window.state.patients||[]).find(x=>x.uhid===b.uhid); b.doctorName = p?.primaryConsultant || "Dr. Srinivasan"; }
    if (!b.department) { const p = (window.state.patients||[]).find(x=>x.uhid===b.uhid); b.department = p?.department || "General Medicine"; }
    if (!b.paymentCategory) b.paymentCategory = INS_UHIDS.includes(b.uhid) ? "Insurance" : "Self Pay";
    if (b.paymentCategory === "Insurance" && !b.insuranceDetails) {
      b.insuranceDetails = { provider: "Star Health", preauthNo: "PA-99231", approvedAmt: 80000, status: "Approved" };
    }

    // Dynamic items and amount calculation to prevent mismatch between listing & workspace
    const patForBill = (window.state.patients || []).find(p => p.uhid === b.uhid);
    const wardKey = patForBill?.wardKey || (b.paymentCategory === 'Insurance' ? 'SEMI-PRIVATE' : 'GENERAL-WARD-M');
    const wardRateEntry = (window.WARD_RATES || {})[wardKey];
    const bedRate = wardRateEntry ? wardRateEntry.rate : 1200;
    const nursingRate = wardRateEntry ? (wardRateEntry.nursingRate || 0) : 500;
    const bedDays = 6;

    const itemsInfo = getPatientBillingItems(b, patForBill, bedRate, nursingRate, bedDays);
    const grossTotal = itemsInfo.roomCharges + itemsInfo.visitingFees + itemsInfo.nurseCharges + itemsInfo.otCharges + itemsInfo.labTotal + itemsInfo.radTotal + itemsInfo.pharmacyCharges + itemsInfo.consumables;

    b.amount = grossTotal;

    if (b.paid === undefined) {
      b.paid = b.status === 'Paid' ? b.amount : 0;
    } else if (b.status === 'Paid') {
      b.paid = b.amount;
    }

    if (!b.advancePaid) b.advancePaid = b.paid > 5000 ? 5000 : 0;
    if (!b.discountAmount) b.discountAmount = 0;
    if (!b.gstAmount) b.gstAmount = 0;
    if (!b.auditLogs) b.auditLogs = [{ timestamp: new Date().toISOString(), user: "admin", action: "Seeded Bill Created" }];
    
    b.items.forEach(item => {
      if (!item.sac) item.sac = "999312";
      if (item.gstRate === undefined) item.gstRate = 0;
      if (item.gstAmount === undefined) item.gstAmount = 0;
      if (item.status === undefined) item.status = "Active";
    });
  });
}

function formatINR(val) {
  return "₹" + Number(val).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// Global actions
window.switchBillingRole = function(role) {
  window.activeBillingRole = role;
  const defaultTabs = {
    CASHIER: "opd_counter",
    BILLING_EXECUTIVE: "billing_queue",
    BILLING_SUPERVISOR: "approval_queue",
    MRD_COORDINATOR: "mrd_discharge",
    ACCOUNTS_MANAGER: "shift_reconcile"
  };
  window.activeBillingTab = defaultTabs[role] || "billing_queue";
  
  // Sync global header selector
  const selector = document.getElementById('global-persona-selector');
  if (selector) {
    selector.value = role;
  }
  if (window.state) {
    window.state.activeUserRole = role;
  }
  localStorage.setItem('saronil_active_persona', 'billing');
  
  const container = document.getElementById('main-content');
  if (container) {
    window.views.billing(container);
  } else {
    window.router.navigate('billing');
  }
};

window.switchBillingTab = function(tab) {
  window.activeBillingTab = tab;
  const container = document.getElementById('main-content');
  if (container) {
    window.views.billing(container);
  } else {
    window.router.navigate('billing');
  }
};

if (typeof window.criticalFlagsExpanded === 'undefined') {
  window.criticalFlagsExpanded = false;
}

window.toggleCriticalFlags = function() {
  window.criticalFlagsExpanded = !window.criticalFlagsExpanded;
  const container = document.getElementById('main-content');
  if (container) {
    const role = window.activeBillingRole;
    const totalOutstanding = state.billing.reduce((acc, curr) => acc + (curr.amount - curr.paid), 0);
    const totalAdvances = window.state.billingAdvances.reduce((acc, curr) => acc + curr.balance, 0);
    window.views.billing(container);
  }
};

window.toggleCashierShift = function() {
  if (window.cashierShift.status === "Open") {
    window.cashierShift.status = "Closed";
    alert("Cashier shift has been set to Closed. Please proceed with shift reconciliation.");
  } else {
    window.cashierShift.status = "Open";
    window.cashierShift.startTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    alert("New shift opened at " + window.cashierShift.startTime);
  }
  const container = document.getElementById('main-content');
  if (container) {
    window.views.billing(container);
  } else {
    window.router.navigate('billing');
  }
};

// --------------------------------------------------------------------------
// MAIN BILLING DASHBOARD RENDERER
// --------------------------------------------------------------------------
function renderBillingDashboard(container) {
  const role = window.activeBillingRole;
  
  // Calculate running counts & sums
  const totalOutstanding = state.billing.reduce((acc, curr) => acc + (curr.amount - curr.paid), 0);
  const totalAdvances = window.state.billingAdvances.reduce((acc, curr) => acc + curr.balance, 0);
  
  // RENDER MAIN SCREEN STRUCTURE
  container.innerHTML = `
    <style>
      .billing-shell {
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        color: #0f172a;
      }
      .billing-mono {
        font-family: 'JetBrains Mono', monospace !important;
      }

      .billing-card {
        background-color: #ffffff;
        border: 1px solid #cbd5e1;
        border-radius: 6px;
        padding: 16px;
        box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
        margin-bottom: 16px;
      }
      .kpi-row {
        display: grid;
        grid-template-columns: repeat(10, 1fr);
        gap: 8px;
        margin-bottom: 16px;
      }
      .kpi-card {
        background-color: #ffffff;
        border: 1px solid #cbd5e1;
        border-radius: 6px;
        padding: 8px 4px;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        min-height: 90px;
        text-align: center;
        border-top: 4px solid #cbd5e1;
        box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
      }
      .kpi-card.normal { border-top-color: #10b981; }
      .kpi-card.warning { border-top-color: #f59e0b; }
      .kpi-card.critical { border-top-color: #ef4444; }
      .kpi-card.purple { border-top-color: #a855f7; }
      .kpi-card.rose { border-top-color: #f43f5e; }
      .kpi-card.orange { border-top-color: #fb923c; }
      .kpi-card.slate { border-top-color: #94a3b8; }
      .kpi-card.darkred { border-top-color: #b91c1c; }
      
      .kpi-label { font-size: 0.58rem; text-transform: uppercase; font-weight: 700; color: #475569; }
      .kpi-value { font-size: 1.05rem; font-weight: 800; margin-top: 4px; color: #0f172a; }
      .kpi-sub { font-size: 0.60rem; color: #64748b; margin-top: 2px; }

      .dashboard-body-grid {
        display: grid;
        grid-template-columns: 1fr;
        gap: 16px;
      }
      .flag-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 8px 10px;
        margin-bottom: 6px;
        cursor: pointer;
        transition: opacity 0.2s;
        border-radius: 4px;
        border: 1px solid transparent;
      }
      .flag-row:hover {
        opacity: 0.85;
      }
      .payer-strip {
        display: flex;
        align-items: center;
        gap: 8px;
        flex-wrap: wrap;
        background-color: #f1f5f9;
        border: 1px solid #cbd5e1;
        padding: 8px 12px;
        border-radius: 6px;
        margin-bottom: 16px;
        font-size: 0.72rem;
        font-weight: 600;
        color: #475569;
      }
      .payer-pill {
        background-color: #ffffff;
        border: 1px solid #cbd5e1;
        padding: 4px 10px;
        border-radius: 8px;
        display: inline-flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        text-align: center;
        min-width: 90px;
        line-height: 1.2;
      }
      .payer-pill-label {
        font-size: 0.65rem;
        color: #64748b;
        font-weight: 500;
      }
      .payer-pill-val {
        font-size: 0.75rem;
        color: #1e293b;
        font-weight: 700;
        margin-top: 2px;
      }
      .billing-tab-menu {
        display: flex;
        gap: 4px;
        border-bottom: 1px solid #cbd5e1;
        margin-bottom: 12px;
        overflow-x: auto;
      }
      .billing-tab-btn {
        padding: 8px 14px;
        font-size: 0.78rem;
        font-weight: 700;
        background: transparent;
        border: 1px solid transparent;
        border-bottom: none;
        color: #475569;
        cursor: pointer;
        white-space: nowrap;
        border-radius: 4px 4px 0 0;
      }
      .billing-tab-btn.active {
        background-color: #ffffff;
        border-color: #cbd5e1;
        color: #2563eb;
        margin-bottom: -1px;
      }
      .custom-table {
        width: 100%;
        border-collapse: collapse;
        font-size: 0.76rem;
      }
      .custom-table th {
        background-color: #f8fafc;
        border-bottom: 1px solid #cbd5e1;
        padding: 8px;
        text-align: left;
        color: #475569;
        font-weight: bold;
      }
      .custom-table td {
        padding: 8px;
        border-bottom: 1px solid #e2e8f0;
        vertical-align: middle;
      }
      .badge-payer {
        font-size: 0.65rem;
        padding: 1px 6px;
        border-radius: 4px;
        font-weight: 700;
      }
      .badge-status {
        font-size: 0.65rem;
        padding: 1px 6px;
        border-radius: 4px;
        font-weight: 700;
      }
      .badge-flag {
        font-size: 0.65rem;
        padding: 1px 6px;
        border-radius: 4px;
        font-weight: 700;
        background-color: #f1f5f9;
        border: 1px solid #cbd5e1;
      }
      .interactive-row {
        cursor: pointer;
        transition: background-color 0.2s;
      }
      .interactive-row:hover {
        background-color: #f8fafc;
      }
      @media (max-width: 1400px) {
        .kpi-row { grid-template-columns: repeat(5, 1fr); }
      }
      @media (max-width: 800px) {
        .kpi-row { grid-template-columns: repeat(2, 1fr); }
      }
      @media (max-width: 1200px) {
        .dashboard-body-grid { grid-template-columns: 1fr; }
      }
    </style>

    <div class="billing-shell">
      <!-- PAGE HEADING -->
      <div style="margin-top: 4px; margin-bottom: 16px; display: flex; justify-content: space-between; align-items: center;">
        <div>
          <h1 style="font-size: 1.3rem; font-weight: 700; color: var(--text-primary); margin: 0; font-family: var(--font-display);">Revenue Cycle & Billing Workdesk</h1>
          <div style="font-size: 0.78rem; color: var(--text-muted); margin-top: 2px;">Indian super specialty hospital pricing list, empanelments settlements, and cash counter checks.</div>
        </div>
        <div style="display: flex; gap: 8px;">
          ${renderRoleCtas(role)}
        </div>
      </div>

      <!-- SECTION 2: KPI CARDS ROW (6 role-specific cards) -->
      <div class="kpi-row">
        ${renderRoleKpis(role, totalOutstanding, totalAdvances)}
      </div>

      <!-- PAYER TYPE QUICK STATS STRIP (Exec, Supervisor, Accounts Mgr, Super Admin) -->
      ${(role === 'BILLING_EXECUTIVE' || role === 'BILLING_SUPERVISOR' || role === 'ACCOUNTS_MANAGER' || role === 'Super Admin') ? renderPayerQuickStats() : ''}

      <!-- SECTION: HORIZONTAL CRITICAL OPERATIONAL FLAGS ROW -->
      <div style="margin-bottom: 16px;">
        <div onclick="window.toggleCriticalFlags()" style="border: 2px solid #ef4444; border-radius: 6px; padding: 10px 16px; background-color: #fef2f2; color: #b91c1c; display: flex; justify-content: space-between; align-items: center; cursor: pointer; font-weight: 700; font-size: 0.84rem; box-shadow: 0 1px 2px rgba(0,0,0,0.05); transition: background-color 0.2s;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span>⚠️</span>
            <span>CRITICAL OPERATIONAL FLAGS</span>
            <span style="background-color: #ef4444; color: white; padding: 2px 8px; font-size: 0.72rem; border-radius: 12px; font-weight: 800;">${getRoleFlags(role).length} Flags</span>
          </div>
          <div style="font-size: 0.76rem; font-weight: 600; color: #b91c1c;">
            ${window.criticalFlagsExpanded ? 'Collapse Panel ▴' : 'Expand Panel ▾'}
          </div>
        </div>

        ${window.criticalFlagsExpanded ? `
          <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 8px; margin-top: 8px; background: #ffffff; padding: 12px; border: 1px solid #fca5a5; border-radius: 6px; box-shadow: var(--shadow-sm);">
            ${renderRoleFlags(role)}
          </div>
        ` : ''}
      </div>

      <!-- SECTION 3 & 5: TWO PANEL WORKDESK -->
      <div class="dashboard-body-grid">
        <!-- LEFT PANEL (100%): MAIN TAB WORKSPACE -->
        <div style="display: flex; flex-direction: column; gap: 16px; min-width: 0;">
          <div class="billing-card" style="margin-bottom: 0;">
            <!-- Tabs Menu -->
            <div class="billing-tab-menu">
              ${renderTabButtons(role)}
            </div>

            <!-- Tab Content Viewport -->
            <div id="billing-tab-viewport" style="min-height: 380px;">
              ${renderTabContent(window.activeBillingTab)}
            </div>
          </div>
        </div>
      </div>

      <!-- SECTION 7: BOTTOM ANALYTICS (Accounts Mgr & Supervisor only) -->
      ${(role === 'ACCOUNTS_MANAGER' || role === 'BILLING_SUPERVISOR') ? `
        <div style="margin-top: 16px;">
          ${renderBottomAnalytics()}
        </div>
      ` : ''}

    </div>
  `;

  // Autocomplete bindings for OPD Quick Bill
  initOpdQuickBillSearch();
  if (window.initBillingQueueFilters) window.initBillingQueueFilters();
}

// --------------------------------------------------------------------------
// CTAS & KPIS BY ROLE
// --------------------------------------------------------------------------
function renderRoleCtas(role) {
  if (role === 'CASHIER') {
    return `
      <button class="btn btn-primary" onclick="window.switchBillingTab('opd_counter')" style="font-size: 0.78rem; font-weight: 700; height: 32px; background-color: #0f2942; border-color: #0f2942;">New OPD Bill</button>
      <button class="btn btn-secondary" onclick="window.switchBillingTab('billing_queue')" style="font-size: 0.78rem; height: 32px;">Collect Payment</button>
      <button class="btn btn-secondary" onclick="window.switchBillingTab('advance_ledger')" style="font-size: 0.78rem; height: 32px;">New Advance</button>
      <button class="btn btn-secondary" onclick="window.toggleCashierShift()" style="font-size: 0.78rem; height: 32px; background-color:#fee2e2; color:#ef4444; border-color:#fca5a5;">Close Shift</button>
    `;
  } else if (role === 'BILLING_EXECUTIVE' || role === 'Super Admin' || role === 'BILLING_SUPERVISOR' || role === 'ACCOUNTS_MANAGER') {
    return `
      <button class="btn btn-primary" onclick="window.switchBillingTab('opd_counter')" style="font-size: 0.78rem; font-weight: 700; height: 32px; background-color: #0f2942; border-color: #0f2942; color: white;">+ Create OPD Bill</button>
      <button class="btn btn-primary" onclick="window.showNewBillModal()" style="font-size: 0.78rem; font-weight: 700; height: 32px; background-color: #0f2942; border-color: #0f2942; color: white;">+ Create IPD Bill</button>
      <button class="btn btn-secondary" onclick="window.showApplyPackageModal()" style="font-size: 0.78rem; height: 32px; background-color: #f1f5f9; color: #334155; border-color: #cbd5e1; font-weight: 600;">Apply Package</button>
      <button class="btn btn-secondary" onclick="window.showInterimBillModal()" style="font-size: 0.78rem; height: 32px; background-color: #f1f5f9; color: #334155; border-color: #cbd5e1; font-weight: 600;">Interim Bill</button>
    `;
  } else if (role === 'MRD_COORDINATOR') {
    return `
      <button class="btn btn-primary" onclick="window.switchBillingTab('mrd_discharge')" style="font-size: 0.78rem; font-weight: 700; height: 32px; background-color: #0f2942; border-color: #0f2942;">Discharge Queue</button>
      <button class="btn btn-secondary" onclick="window.switchBillingTab('mrd_discharge')" style="font-size: 0.78rem; height: 32px;">Coding Worklist</button>
    `;
  }
  return '';
}

function renderRoleKpis() {
  const oBills = window.state.outstandingBills || [];
  const totalOutstanding = oBills.filter(o => o.status !== 'Closed' && o.status !== 'Approved Write-Off').reduce((sum, o) => sum + o.balance_due, 0);
  const aged60Outstanding = oBills.filter(o => o.status !== 'Closed' && o.status !== 'Approved Write-Off' && o.aging_days > 60).reduce((sum, o) => sum + o.balance_due, 0);
  
  const suspense = window.state.suspenseReceipts || [];
  const unmatchedCount = suspense.filter(r => r.match_status !== 'matched' && r.match_status !== 'unclaimed').length;
  const unmatchedSum = suspense.filter(r => r.match_status !== 'matched' && r.match_status !== 'unclaimed').reduce((sum, r) => sum + r.amount, 0);
  
  // Calculate if any unmatched item is older than 7 days
  const hasAgedSuspense = suspense.some(r => {
    if (r.match_status === 'matched' || r.match_status === 'unclaimed') return false;
    const rDate = new Date(r.receipt_date);
    const today = new Date();
    return (today - rDate) > 7 * 86400000;
  });

  const totalAdvances = (window.state.billingAdvances || []).reduce((sum, a) => sum + a.balance, 0);
  const exhaustedDeposits = (window.state.billingAdvances || []).filter(a => a.status === 'Exhausted' || a.balance <= 0).length;

  const tpaPreAuthCount = (window.state.billingTpaCases || []).filter(c => c.status === 'Active' && c.loaStatus !== 'LOA Approved').length +
                          (window.state.billingPmjayCases || []).filter(c => c.status === 'Pre-Auth Pending').length;

  const dischargesTodayCount = (window.state.admissions || []).filter(a => a.status === 'Discharged').length + 8;

  const billingBlockedCount = (window.state.billingMrdQueue || []).filter(q => q.clearance.billing === false).length;

  const opdCollectionToday = (window.state.billingOpdReceipts || []).reduce((sum, r) => sum + r.amount, 0);
  const todayAdvanceCollection = 85000; 
  const todayCollectionTotal = opdCollectionToday + todayAdvanceCollection;

  const pendingRefunds = window.state.billingRefunds || [];
  const pendingRefundsCount = pendingRefunds.filter(r => r.status === 'Pending Approval').length;
  const pendingRefundsSum = pendingRefunds.filter(r => r.status === 'Pending Approval').reduce((sum, r) => sum + r.amount, 0);

  const tpaShortSettlementsSum = (window.state.billingSettlements || []).reduce((sum, s) => sum + (s.shortPay || 0), 0);

  const packagesExceeding = (window.state.billingPackages || []).filter(p => p.variance > 0).length;

  return `
    <!-- Card 1: Outstanding Amount -->
    <div class="kpi-card critical clickable" onclick="window.switchBillingTab('outstanding_recovery')" style="cursor: pointer; border-top-color: #f87171;">
      <span class="kpi-label">Outstanding Amount</span>
      <span class="kpi-value billing-mono" style="font-size: 1.15rem; font-weight: 800;">${formatINR(totalOutstanding)}</span>
      <span class="kpi-sub">Aged >60d: ${formatINR(aged60Outstanding)} <span style="color: #ef4444; font-weight: bold;">↑ 4.2%</span></span>
    </div>
    
    <!-- Card 2: Unmatched Suspense -->
    <div class="kpi-card warning clickable" onclick="window.switchBillingTab('unidentified_receipts')" style="cursor: pointer; border-top-color: #fbbf24;">
      <span class="kpi-label">Unmatched Suspense</span>
      <span class="kpi-value billing-mono" style="font-size: 1.15rem; font-weight: 800;">${unmatchedCount} Receipts</span>
      <span class="kpi-sub">Total: ${formatINR(unmatchedSum)} <span style="color: #10b981; font-weight: bold;">↓ 2.1%</span></span>
    </div>

    <!-- Card 3: Deposit Exhausted Alerts -->
    <div class="kpi-card rose clickable" onclick="window.switchBillingTab('advance_ledger')" style="cursor: pointer; border-top-color: #f43f5e;">
      <span class="kpi-label">Deposit Exhausted</span>
      <span class="kpi-value billing-mono" style="font-size: 1.15rem; font-weight: 800;">${exhaustedDeposits} Patients</span>
      <span class="kpi-sub">Total advances: ${formatINR(totalAdvances)} <span style="color: #ef4444; font-weight: bold;">↑ 12%</span></span>
    </div>

    <!-- Card 4: TPA Pre-Auth Pending -->
    <div class="kpi-card purple clickable" onclick="window.switchBillingTab('insurance_tpa')" style="cursor: pointer; border-top-color: #c084fc;">
      <span class="kpi-label">Pre-Auth / Cashless</span>
      <span class="kpi-value billing-mono" style="font-size: 1.15rem; font-weight: 800;">${tpaPreAuthCount} Cases</span>
      <span class="kpi-sub">Awaiting insurer approval <span style="color: #8b5cf6;">→ stable</span></span>
    </div>

    <!-- Card 5: Discharge Blocked by Billing -->
    <div class="kpi-card darkred clickable" onclick="window.switchBillingTab('mrd_discharge')" style="cursor: pointer; border-top-color: #b91c1c;">
      <span class="kpi-label">D/C Blocked by Billing</span>
      <span class="kpi-value billing-mono" style="font-size: 1.15rem; font-weight: 800;">${billingBlockedCount} Patients</span>
      <span class="kpi-sub">Clinically cleared, unpaid <span style="color: #10b981; font-weight: bold;">↓ 1 case</span></span>
    </div>

    <!-- Card 6: Today's Collection -->
    <div class="kpi-card normal clickable" onclick="window.switchBillingTab('shift_reconcile')" style="cursor: pointer; border-top-color: #34d399;">
      <span class="kpi-label">Today's Collection</span>
      <span class="kpi-value billing-mono" style="font-size: 1.15rem; font-weight: 800;">${formatINR(todayCollectionTotal)}</span>
      <span class="kpi-sub">Cash counter shift tally <span style="color: #10b981; font-weight: bold;">↑ 8.5%</span></span>
    </div>

    <!-- Card 7: Pending Refunds -->
    <div class="kpi-card warning clickable" onclick="window.switchBillingTab('refunds')" style="cursor: pointer; border-top-color: #fbbf24;">
      <span class="kpi-label">Pending Refunds</span>
      <span class="kpi-value billing-mono" style="font-size: 1.15rem; font-weight: 800;">${pendingRefundsCount} Requests</span>
      <span class="kpi-sub">Value: ${formatINR(pendingRefundsSum)} <span style="color: #64748b;">→ stable</span></span>
    </div>

    <!-- Card 8: TPA Rejections (MTD) -->
    <div class="kpi-card critical clickable" onclick="window.switchBillingTab('insurance_tpa')" style="cursor: pointer; border-top-color: #f87171;">
      <span class="kpi-label">TPA Rejections (MTD)</span>
      <span class="kpi-value billing-mono" style="font-size: 1.15rem; font-weight: 800;">${formatINR(tpaShortSettlementsSum)}</span>
      <span class="kpi-sub">Short-settled claims <span style="color: #ef4444; font-weight: bold;">↑ 3.2%</span></span>
    </div>

    <!-- Card 9: Cost Overrun Risk -->
    <div class="kpi-card orange clickable" onclick="window.switchBillingTab('package_billing')" style="cursor: pointer; border-top-color: #fb923c;">
      <span class="kpi-label">Package Overrun Risk</span>
      <span class="kpi-value billing-mono" style="font-size: 1.15rem; font-weight: 800;">${packagesExceeding} Packages</span>
      <span class="kpi-sub">Exceeded cost ceiling <span style="color: #ef4444; font-weight: bold;">↑ 1 case</span></span>
    </div>

    <!-- Card 10: Discharges Today -->
    <div class="kpi-card slate clickable" onclick="window.switchBillingTab('mrd_discharge')" style="cursor: pointer; border-top-color: #94a3b8;">
      <span class="kpi-label">Discharges Today</span>
      <span class="kpi-value billing-mono" style="font-size: 1.15rem; font-weight: 800;">${dischargesTodayCount} Patients</span>
      <span class="kpi-sub">Completed discharges <span style="color: #10b981; font-weight: bold;">ready for archive</span></span>
    </div>
  `;
}

// --------------------------------------------------------------------------
// SECTION 3: OPERATIONAL FLAGS (role-filtered)
// --------------------------------------------------------------------------
function getRoleFlags(role) {
  if (role === 'MRD_COORDINATOR') {
    return [
      { text: "Discharge clearance pending >6 hours", severity: "red", count: "1 Patient", tab: "mrd_discharge" },
      { text: "D/C summary not submitted >24h post discharge", severity: "red", count: "1 Case", tab: "mrd_discharge" },
      { text: "ICD coding pending >48 hours", severity: "amber", count: "1 Chart", tab: "mrd_discharge" },
      { text: "Deficiency notices unacknowledged", severity: "amber", count: "1 Notice", tab: "mrd_discharge" },
      { text: "MLC record pending closure", severity: "purple", count: "1 Case", tab: "mrd_discharge" },
      { text: "LAMA indemnity bond not filed", severity: "red", count: "1 Case", tab: "mrd_discharge" }
    ];
  }
  return [
    { text: "Expired pre-authorisations (TPA LOA lapsed)", severity: "red", count: "1 Claim", tab: "insurance_tpa" },
    { text: "IPD patients no interim bill >3 days", severity: "amber", count: "4 Cases", tab: "billing_queue" },
    { text: "Deposit exhausted - patient advance below ₹500", severity: "red", count: "2 Patients", tab: "advance_ledger" },
    { text: "Advances unadjusted >7 days", severity: "amber", count: "3 Accounts", tab: "advance_ledger" },
    { text: "Package vs actuals conflict (Actuals exceed pkg)", severity: "purple", count: "1 Case", tab: "package_billing" },
    { text: "Pending discount approvals", severity: "blue", count: "2 Requests", tab: "approval_queue" },
    { text: "Pending bill cancellation requests", severity: "orange", count: "1 Request", tab: "approval_queue" },
    { text: "Duplicate UHID / duplicate bill detected", severity: "red", count: "1 Alert", tab: "approval_queue" },
    { text: "LAMA/AOR cases without indemnity bond billing", severity: "red", count: "1 Patient", tab: "billing_queue" },
    { text: "MLC cases pending billing clearance", severity: "purple", count: "1 Case", tab: "billing_queue" },
    { text: "CGHS/ECHS cases without rate list applied", severity: "orange", count: "1 Card", tab: "govt_schemes" },
    { text: "Charity/BPL/EWS concession not approved yet", severity: "amber", count: "1 Case", tab: "approval_queue" }
  ];
}

function renderRoleFlags(role) {
  const flags = getRoleFlags(role);
  const sevColors = {
    red: { bg: "#fef2f2", col: "#b91c1c", border: "#ef4444" },
    amber: { bg: "#fffbeb", col: "#b45309", border: "#f59e0b" },
    purple: { bg: "#faf5ff", col: "#6b21a8", border: "#a855f7" },
    blue: { bg: "#eff6ff", col: "#1d4ed8", border: "#3b82f6" },
    orange: { bg: "#fff7ed", col: "#c2410c", border: "#f97316" }
  };

  return flags.map(f => {
    const s = sevColors[f.severity] || sevColors.amber;
    return `
      <div class="flag-row" onclick="window.switchBillingTab('${f.tab}')" style="background-color: ${s.bg}; border: 1.2px solid ${s.border}33; border-left: 4.5px solid ${s.border}; color: ${s.col}; font-size: 0.73rem; margin-bottom: 0;">
        <span style="font-weight: 600;">${f.text}</span>
        <span class="badge" style="background-color: ${s.col}; color: white; padding: 2px 6px; font-size: 0.65rem; border-radius: 4px; font-weight: bold; min-width: 65px; text-align: center;">${f.count}</span>
      </div>
    `;
  }).join('');
}

// --------------------------------------------------------------------------
// SECTION 4: PAYER TYPE QUICK STATS BAR
// --------------------------------------------------------------------------
function renderPayerQuickStats() {
  return `
    <div class="payer-strip">
      <span style="color:#0f172a; font-weight:bold; margin-right:4px;">Revenue Split:</span>
      <span class="payer-pill">
        <span class="payer-pill-label">Self Pay</span>
        <strong class="billing-mono payer-pill-val">₹1,45,200.00</strong>
      </span>
      <span class="payer-pill">
        <span class="payer-pill-label">TPA/Insurance</span>
        <strong class="billing-mono payer-pill-val">₹1,20,000.00</strong>
      </span>
      <span class="payer-pill">
        <span class="payer-pill-label">CGHS</span>
        <strong class="billing-mono payer-pill-val">₹32,000.00</strong>
      </span>
      <span class="payer-pill">
        <span class="payer-pill-label">ECHS</span>
        <strong class="billing-mono payer-pill-val">₹12,000.00</strong>
      </span>
      <span class="payer-pill">
        <span class="payer-pill-label">PMJAY/Govt Scheme</span>
        <strong class="billing-mono payer-pill-val">₹18,000.00</strong>
      </span>
      <span class="payer-pill">
        <span class="payer-pill-label">ESI</span>
        <strong class="billing-mono payer-pill-val">₹18,200.00</strong>
      </span>
      <span class="payer-pill">
        <span class="payer-pill-label">Company/PSU</span>
        <strong class="billing-mono payer-pill-val">₹0.00</strong>
      </span>
      <span class="payer-pill">
        <span class="payer-pill-label">Railway</span>
        <strong class="billing-mono payer-pill-val">₹0.00</strong>
      </span>
      <span class="payer-pill" style="color:var(--color-success); border-color: rgba(34, 197, 94, 0.4);">
        <span class="payer-pill-label" style="color:var(--color-success);">Charity/BPL</span>
        <strong class="billing-mono payer-pill-val" style="color:var(--color-success);">₹0.00 (Waived)</strong>
      </span>
    </div>
  `;
}

// --------------------------------------------------------------------------
// SECTION 5: MAIN TABS MENU
// --------------------------------------------------------------------------
function renderTabButtons(role) {
  const allTabs = {
    billing_queue: { title: "Billing Queue", roles: ["CASHIER", "BILLING_EXECUTIVE", "BILLING_SUPERVISOR", "MRD_COORDINATOR", "ACCOUNTS_MANAGER", "AUDITOR", "Super Admin"] },
    opd_counter: { title: "OPD Cash Counter", roles: ["CASHIER", "Super Admin"] },
    advance_ledger: { title: "Advance & Deposit Ledger", roles: ["CASHIER", "BILLING_EXECUTIVE", "BILLING_SUPERVISOR", "MRD_COORDINATOR", "ACCOUNTS_MANAGER", "AUDITOR", "Super Admin"] },
    package_billing: { title: "Package Billing", roles: ["CASHIER", "BILLING_EXECUTIVE", "BILLING_SUPERVISOR", "MRD_COORDINATOR", "ACCOUNTS_MANAGER", "AUDITOR", "Super Admin"] },
    insurance_tpa: { title: "Insurance / TPA", roles: ["CASHIER", "BILLING_EXECUTIVE", "BILLING_SUPERVISOR", "MRD_COORDINATOR", "ACCOUNTS_MANAGER", "AUDITOR", "Super Admin"] },
    govt_schemes: { title: "Govt Schemes", roles: ["CASHIER", "BILLING_EXECUTIVE", "BILLING_SUPERVISOR", "MRD_COORDINATOR", "ACCOUNTS_MANAGER", "AUDITOR", "Super Admin"] },
    refunds: { title: "Refunds & Adjustments", roles: ["CASHIER", "BILLING_EXECUTIVE", "BILLING_SUPERVISOR", "MRD_COORDINATOR", "ACCOUNTS_MANAGER", "AUDITOR", "Super Admin"] },
    approval_queue: { title: "Approval Queue", roles: ["BILLING_SUPERVISOR", "ACCOUNTS_MANAGER", "Super Admin"] },
    shift_reconcile: { title: "Shift Reconciliation", roles: ["CASHIER", "ACCOUNTS_MANAGER", "Super Admin"] },
    mrd_discharge: { title: "MRD & Discharge", roles: ["MRD_COORDINATOR", "Super Admin"] },
    outstanding_recovery: { title: "Outstanding & Recovery", roles: ["BILLING_EXECUTIVE", "BILLING_SUPERVISOR", "ACCOUNTS_MANAGER", "AUDITOR", "Super Admin"] },
    unidentified_receipts: { title: "Suspense Ledger (Unmatched)", roles: ["CASHIER", "BILLING_EXECUTIVE", "BILLING_SUPERVISOR", "ACCOUNTS_MANAGER", "Super Admin"] },
    gst_tax_engine: { title: "GST Configuration", roles: ["BILLING_SUPERVISOR", "ACCOUNTS_MANAGER", "AUDITOR", "Super Admin"] }
  };

  return Object.entries(allTabs).map(([key, val]) => {
    if (!val.roles.includes(role)) return '';
    const activeClass = window.activeBillingTab === key ? 'active' : '';
    return `<button class="billing-tab-btn ${activeClass}" onclick="window.switchBillingTab('${key}')">${val.title}</button>`;
  }).join('');
}

// --------------------------------------------------------------------------
// TABS CONTENT SWITCHBOARD
// --------------------------------------------------------------------------
function renderTabContent(tab) {
  if (tab === 'billing_queue') return renderBillingQueueTab();
  if (tab === 'opd_counter') return renderOpdCounterTab();
  if (tab === 'advance_ledger') return renderAdvanceLedgerTab();
  if (tab === 'package_billing') return renderPackageBillingTab();
  if (tab === 'insurance_tpa') return renderInsuranceTpaTab();
  if (tab === 'govt_schemes') return renderGovtSchemesTab();
  if (tab === 'refunds') return renderRefundsTab();
  if (tab === 'approval_queue') return renderApprovalQueueTab();
  if (tab === 'shift_reconcile') return renderShiftReconcileTab();
  if (tab === 'mrd_discharge') return renderMrdDischargeTab();
  if (tab === 'outstanding_recovery') return renderOutstandingRecoveryTab();
  if (tab === 'unidentified_receipts') return renderUnidentifiedReceiptsTab();
  if (tab === 'gst_tax_engine') return renderGstTaxEngineTab();
  return '<div style="color:var(--text-secondary); font-size:0.8rem; padding:16px;">Tab content not configured.</div>';
}

// --------------------------------------------------------------------------
// 1. BILLING QUEUE TAB
// --------------------------------------------------------------------------
function renderBillingQueueTab() {
  const pBadges = {
    "Self Pay": "background:#e0f2fe; color:#0369a1;",
    "Insurance": "background:#faf5ff; color:#6b21a8;",
    "CGHS": "background:#fffbeb; color:#b45309;",
    "ECHS": "background:#f0fdf4; color:#15803d;"
  };

  const statusColors = {
    Draft: 'background:#f1f5f9; color:#475569;',
    Generated: 'background:#eff6ff; color:#1d4ed8;',
    'Partial Paid': 'background:#fffbeb; color:#d97706; font-weight: 700;',
    Outstanding: 'background:#fef2f2; color:#ef4444; font-weight: 700;',
    Paid: 'background:#ecfdf5; color:#10b981;',
    Cancelled: 'background:#f1f5f9; color:#94a3b8; text-decoration: line-through;',
    'Advance Pending': 'background:#fffbeb; color:#d97706; font-weight: 700;'
  };

  // Compute pending IPD admission requests with advance shortfall (Admission Request Advance Billing)
  const pendingIpdAdvanceRequests = [];
  const reqs = window.state.admissionRequests || [];
  const thresholds = window.state.advanceThresholds || { Standard: 5000, ICU: 15000, Daycare: 2000 };
  
  reqs.forEach(r => {
    const isCashless = r.payer && (r.payer.toLowerCase().includes('cashless') || r.payer.toLowerCase().includes('tpa') || r.payer.toLowerCase().includes('insur'));
    if (isCashless) return;

    const isICU = r.wardPreference === 'ICU' || r.wardPreference === 'CCU' || r.wardPreference === 'ICCU';
    const reqAmount = isICU ? thresholds['ICU'] : thresholds['Standard'];

    const advObj = (window.state.billingAdvances || []).find(a => a.uhid === r.uhid);
    const balance = advObj ? advObj.balance : 0;
    const shortfall = reqAmount - balance;

    if (shortfall > 0) {
      pendingIpdAdvanceRequests.push({
        id: `REQ-${r.uhid}`,
        uhid: r.uhid,
        patientName: r.name,
        doctorName: r.requestedBy || 'Dr. Amit Verma',
        department: 'General Medicine',
        visitType: 'IPD Request',
        bed: r.wardPreference || 'GENERAL-WARD-M',
        daysAdmitted: '—',
        advancePaid: balance,
        amount: reqAmount,
        shortfall: shortfall,
        paymentCategory: r.payer || 'Self Pay',
        status: 'Advance Pending',
        isAdmissionRequest: true
      });
    }
  });

  // Main billing queue table contains IPD, Daycare, Emergency, and pending OPD bills
  const activeBills = state.billing.filter(b => b.visitType !== 'OPD' || b.status === 'Pending');

  // Merge them together!
  const mergedQueue = [...pendingIpdAdvanceRequests, ...activeBills];

  return `
    <div style="text-align: left; margin-bottom: 10px;">
      <h3 style="font-size: 0.88rem; font-weight: 700; margin: 0; color: var(--text-primary);">Billing Queue (IPD / OPD / Daycare / Emergency)</h3>
    </div>

    <div style="display: flex; gap: 8px; margin-bottom: 12px; flex-wrap: wrap;">
      <input type="text" id="bill-q-search" class="form-control" placeholder="Search by UHID / Name / Bill No..." style="flex:1; font-size:0.8rem; height:34px;">
      <select id="bill-q-type" class="form-select" style="width: auto; font-size:0.8rem; height:34px;">
        <option value="">All Visit Types</option>
        <option value="IPD Request">IPD Request</option>
        <option value="IPD">IPD</option>
        <option value="OPD">OPD</option>
        <option value="Emergency">Emergency</option>
        <option value="Day Care">Day Care</option>
      </select>
      <select id="bill-q-payer" class="form-select" style="width: auto; font-size:0.8rem; height:34px;">
        <option value="">All Payers</option>
        <option value="Self Pay">Self Pay</option>
        <option value="Insurance">Insurance</option>
        <option value="CGHS">CGHS</option>
        <option value="ECHS">ECHS</option>
      </select>
      <select id="bill-q-status" class="form-select" style="width: auto; font-size:0.8rem; height:34px;">
        <option value="">All Statuses</option>
        <option value="Pending">Pending</option>
        <option value="Paid">Paid</option>
      </select>
    </div>

    <div style="overflow-x: auto;">
      <table class="custom-table">
        <thead>
          <tr>
            <th>Bill Info</th>
            <th>Patient Info</th>
            <th>Payment Type</th>
            <th style="text-align: right;">Deposit Bal (₹)</th>
            <th style="text-align: right;">Total (₹)</th>
            <th>Payer</th>
            <th>Status</th>
            <th style="text-align: right;">Action</th>
          </tr>
        </thead>
        <tbody id="billing-q-table-body">
          ${mergedQueue.map(b => {
            const payerBadgeStyle = pBadges[b.paymentCategory] || "background:#f1f5f9; color:#475569;";
            const statStyle = statusColors[b.status] || "background:#f1f5f9; color:#475569;";
            
            const payTypeBadges = {
              "Advance": "background:#fffbeb; color:#b45309; border: 1px solid #fde68a; padding: 2px 6px; font-size: 0.65rem; border-radius: 4px;",
              "Consultation": "background:#e0f2fe; color:#0369a1; border: 1px solid #bae6fd; padding: 2px 6px; font-size: 0.65rem; border-radius: 4px;",
              "Discharge": "background:#ecfdf5; color:#047857; border: 1px solid #a7f3d0; padding: 2px 6px; font-size: 0.65rem; border-radius: 4px;",
              "Procedure": "background:#f5f3ff; color:#6d28d9; border: 1px solid #ddd6fe; padding: 2px 6px; font-size: 0.65rem; border-radius: 4px;"
            };

            let paymentType = b.paymentType || '';
            if (!paymentType) {
              if (b.isAdmissionRequest || b.visitType === 'IPD Request' || b.id.startsWith('REQ-') || (b.items && b.items.some(it => it.desc && it.desc.toLowerCase().includes('advance')))) {
                paymentType = 'Advance';
              } else if (b.visitType === 'OPD') {
                paymentType = 'Consultation';
              } else if (b.visitType === 'IPD') {
                paymentType = 'Discharge';
              } else {
                paymentType = 'Procedure';
              }
            }
            const payTypeBadgeStyle = payTypeBadges[paymentType] || "background:#f1f5f9; color:#475569; padding: 2px 6px; font-size: 0.65rem; border-radius: 4px;";

            let payerDetail = b.paymentCategory;
            if (b.paymentCategory === 'Insurance' && b.insuranceDetails) {
              payerDetail = `${b.insuranceDetails.provider} (PA: ${b.insuranceDetails.preauthNo})`;
            }

            const daysAdmitted = b.visitType === 'IPD' ? '6 days' : '—';
            const depositBalVal = b.advancePaid;

            return `
              <tr class="interactive-row" onclick="router.navigate('billing-workspace?id=${b.id}')">
                <td class="billing-mono">
                  <div style="font-weight: 600; color: var(--text-primary); font-size: 0.82rem;">${b.id}</div>
                  <div style="font-size: 0.7rem; color: var(--text-muted); margin-top: 4px; display: flex; align-items: center; gap: 6px; flex-wrap: wrap;">
                    <span class="badge" style="background: #f1f5f9; color: #475569; font-size: 0.65rem; padding: 1px 4px; border-radius: 3px;">${b.visitType}</span>
                    ${b.visitType.includes('IPD') ? `
                      <span style="display: inline-flex; align-items: center; gap: 3px;">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color: #94a3b8;"><path d="M3 20v-8a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v8M5 10V6a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v4M3 18h18"/></svg>
                        ${b.visitType === 'IPD' ? (b.bed || 'IPD Bed') : (b.visitType === 'IPD Request' ? (window.state.wards[b.bed]?.name || b.bed) : '—')}
                      </span>
                    ` : ''}
                    ${b.visitType === 'IPD' ? `
                      <span style="color: #cbd5e1; font-size: 0.65rem;">|</span>
                      <span>${daysAdmitted}</span>
                    ` : ''}
                  </div>
                </td>
                <td>
                  <div style="font-weight:600; color: var(--primary); text-decoration: underline; cursor: pointer;" onclick="event.stopPropagation(); router.navigate('patients?uhid=${b.uhid}')">${b.patientName}</div>
                  <div class="billing-mono" style="font-size: 0.72rem; color: #64748b; margin-top: 1px;">UHID: ${b.uhid}</div>
                  ${b.uhid === 'SH-2026-04790' ? `<span class="badge" style="background:#faf5ff; color:#6b21a8; font-size:0.6rem; padding:1px 4px; margin-top: 2px; display: inline-block;">MLC</span>` : ''}
                </td>
                <td><span style="${payTypeBadgeStyle}">${paymentType}</span></td>
                <td class="billing-mono" style="text-align: right; color:${depositBalVal < 2000 && b.visitType === 'IPD' ? 'var(--color-danger)' : 'inherit'}; font-weight:600;">${formatINR(depositBalVal)}</td>
                <td class="billing-mono" style="text-align: right; font-weight:bold;">${formatINR(b.amount)}</td>
                <td><span class="badge-payer" style="${payerBadgeStyle}">${payerDetail}</span></td>
                <td><span class="badge-status" style="${statStyle}">${b.status}</span></td>
                <td style="text-align: right;" onclick="event.stopPropagation();">
                  <div style="display:flex; justify-content:flex-end; gap:4px;">
                    ${b.isAdmissionRequest ? `
                      <button class="btn btn-primary" onclick="router.navigate('billing-workspace?id=${b.id}')" style="padding:2px 6px; font-size:0.7rem; height:22px; font-weight:700; background-color: #d97706; border-color: #d97706; cursor: pointer;">Collect Advance</button>
                    ` : `
                      ${window.activeBillingRole === 'CASHIER' ? `
                        <button class="btn btn-primary" onclick="router.navigate('billing-workspace?id=${b.id}')" style="padding:2px 6px; font-size:0.7rem; height:22px; font-weight:700;">Collect</button>
                      ` : `
                        <button class="btn btn-secondary" onclick="router.navigate('billing-workspace?id=${b.id}')" style="padding:2px 6px; font-size:0.7rem; height:22px; font-weight:600;">See Details</button>
                      `}
                    `}
                  </div>
                </td>
              </tr>
            `;
          }).join('') || `<tr><td colspan="8" style="text-align:center; padding:20px; color:var(--text-muted);">No records found.</td></tr>`}
        </tbody>
      </table>
    </div>
  `;
}

function renderOpdAdvanceTab() {
  const pendingOpdBills = (window.state.billing || []).filter(b => b.visitType === 'OPD' && b.status === 'Pending');

  return `
    <div style="text-align: left; margin-bottom: 12px;">
      <h3 style="font-size: 0.95rem; font-weight: 700; margin: 0; color: var(--text-primary);">OPD Advance Billing</h3>
      <p style="font-size: 0.75rem; color: var(--text-muted); margin: 2px 0 12px 0;">Collect advance consultation & registration fees for scheduled outpatient clinic appointments.</p>
    </div>

    <div style="overflow-x: auto;">
      <table class="custom-table">
        <thead>
          <tr>
            <th>Bill No</th>
            <th>Patient Info</th>
            <th>Consultant & Dept</th>
            <th>Bill Date</th>
            <th style="text-align: right;">Amount Due (₹)</th>
            <th style="text-align: right;">Action</th>
          </tr>
        </thead>
        <tbody>
          ${pendingOpdBills.map(b => `
            <tr>
              <td class="billing-mono" style="font-weight: 600;">${b.id}</td>
              <td>
                <div style="font-weight:600; color: var(--primary); text-decoration: underline; cursor: pointer;" onclick="router.navigate('patients?uhid=${b.uhid}')">${b.patientName}</div>
                <div class="billing-mono" style="font-size: 0.72rem; color: #64748b; margin-top: 1px;">UHID: ${b.uhid}</div>
              </td>
              <td>
                <strong>${b.doctorName}</strong>
                <div style="font-size: 0.72rem; color: #64748b; margin-top: 1px;">${b.department}</div>
              </td>
              <td class="billing-mono">${b.date || 'Today'}</td>
              <td class="billing-mono" style="text-align: right; font-weight:bold;">${formatINR(b.amount)}</td>
              <td style="text-align: right;">
                <button class="btn btn-primary" onclick="window.triggerCollectOpdAdvanceFee('${b.id}')" style="padding:4px 8px; font-size:0.75rem; font-weight:700; height:26px; cursor: pointer;">💳 Collect OPD Fee</button>
              </td>
            </tr>
          `).join('') || `<tr><td colspan="6" style="text-align:center; padding:30px; color:var(--text-muted); font-size: 0.8rem;">All OPD Advance Payments have been cleared!</td></tr>`}
        </tbody>
      </table>
    </div>
  `;
}

// --------------------------------------------------------------------------
// 2. OPD CASH COUNTER TAB (Cashier Only)
// --------------------------------------------------------------------------
function renderOpdCounterTab() {
  const collectionTotal = window.state.billingOpdReceipts.reduce((acc, curr) => acc + curr.amount, 0);

  return `
    <div style="display: grid; grid-template-columns: 1fr 1.2fr; gap: 16px;">
      
      <!-- Quick OPD Billing Form -->
      <div style="border-right: 1px solid #cbd5e1; padding-right: 16px;">
        <h4 style="margin:0 0 12px 0; font-size:0.85rem; font-weight:700; text-transform:uppercase; color:var(--text-secondary);">Quick Cash Receipt</h4>
        
        <div style="position: relative; margin-bottom: 8px;">
          <label style="font-size:0.7rem; font-weight:bold; color:#475569;">Global Patient Lookup</label>
          <input type="text" id="opd-search-input" class="form-control" placeholder="Type UHID, Name, or Mobile..." style="font-size:0.8rem; height:34px; width:100%; border-radius:4px;" autocomplete="off">
          <div id="opd-autocomplete-results" style="display:none; position:absolute; top:100%; left:0; right:0; z-index:200; background:white; border:1px solid #cbd5e1; box-shadow:0 4px 6px rgba(0,0,0,0.1); max-height:180px; overflow-y:auto; border-radius:4px;"></div>
        </div>

        <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-bottom:8px;">
          <div>
            <label style="font-size:0.7rem; font-weight:bold; color:#475569;">UHID</label>
            <input type="text" id="opd-uhid-field" class="form-control billing-mono" readonly style="font-size:0.8rem; height:32px; background:#f8fafc;">
          </div>
          <div>
            <label style="font-size:0.7rem; font-weight:bold; color:#475569;">Patient Name</label>
            <input type="text" id="opd-name-field" class="form-control" readonly style="font-size:0.8rem; height:32px; background:#f8fafc;">
          </div>
        </div>

        <div class="form-group" style="margin-bottom:8px;">
          <label style="font-size:0.7rem; font-weight:bold; color:#475569;">Service Selector</label>
          <select id="opd-service-select" class="form-select" style="font-size:0.8rem; height:32px;" onchange="window.updateOpdServiceAmount(this.value)">
            <option value="">Select Service / Investigation...</option>
            <option value="SRV-CONS-01">OPD Consultation - General (₹500.00)</option>
            <option value="SRV-CONS-02">OPD Consultation - Specialist (₹800.00)</option>
            <option value="SRV-LAB-CBC">Complete Blood Count (CBC) (₹350.00)</option>
            <option value="SRV-LAB-LFT">Liver Function Test (LFT) (₹750.00)</option>
            <option value="SRV-RAD-XRAY">Chest X-Ray Digital (₹650.00)</option>
          </select>
        </div>

        <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-bottom:12px;">
          <div>
            <label style="font-size:0.7rem; font-weight:bold; color:#475569;">Amount (₹)</label>
            <input type="number" id="opd-amount-field" class="form-control billing-mono" style="font-size:0.8rem; height:32px; font-weight:bold;">
          </div>
          <div>
            <label style="font-size:0.7rem; font-weight:bold; color:#475569;">Payment Mode</label>
            <select id="opd-mode-select" class="form-select" style="font-size:0.8rem; height:32px;">
              <option value="UPI">UPI (GPay / PhonePe)</option>
              <option value="Cash">Cash</option>
              <option value="Card">Card</option>
            </select>
          </div>
        </div>

        <button class="btn btn-primary" onclick="window.generateOpdQuickBill()" style="width:100%; height:36px; font-weight:700; font-size:0.8rem;">Generate Bill & Receipt (Single Click)</button>
      </div>

      <!-- Counter Collection Log -->
      <div>
        <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #cbd5e1; padding-bottom:6px; margin-bottom:8px;">
          <h4 style="margin:0; font-size:0.85rem; font-weight:700; text-transform:uppercase; color:var(--text-secondary);">Today's Receipts List</h4>
          <span style="font-size:0.76rem; color:#475569; font-weight:bold;">Total: <strong class="billing-mono" style="color:var(--color-success);">${formatINR(collectionTotal)}</strong></span>
        </div>

        <div style="max-height: 280px; overflow-y: auto;">
          <table class="custom-table">
            <thead>
              <tr>
                <th>Receipt No</th>
                <th>Patient</th>
                <th>Service</th>
                <th style="text-align: right;">Amount (₹)</th>
                <th>Mode</th>
                <th style="text-align: right;">Action</th>
              </tr>
            </thead>
            <tbody>
              ${window.state.billingOpdReceipts.map(rec => `
                <tr>
                  <td class="billing-mono" style="font-weight: 600;">${rec.receiptNo}</td>
                  <td>${rec.patient}</td>
                  <td>${rec.service}</td>
                  <td class="billing-mono" style="text-align: right; font-weight:bold;">${formatINR(rec.amount)}</td>
                  <td>${rec.mode}</td>
                  <td style="text-align: right;">
                    <button class="btn btn-secondary" onclick="window.triggerReceiptReprint('${rec.receiptNo}')" style="padding:2px 6px; font-size:0.68rem; height:20px; font-weight:600;">Reprint</button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  `;
}

// Handler functions for OPD cash counter
window.updateOpdServiceAmount = function(srvCode) {
  const prices = {
    "SRV-CONS-01": 500,
    "SRV-CONS-02": 800,
    "SRV-LAB-CBC": 350,
    "SRV-LAB-LFT": 750,
    "SRV-RAD-XRAY": 650
  };
  const val = prices[srvCode] || 0;
  document.getElementById('opd-amount-field').value = val;
};

function initOpdQuickBillSearch() {
  const input = document.getElementById('opd-search-input');
  const results = document.getElementById('opd-autocomplete-results');
  if (!input || !results) return;

  input.addEventListener('input', () => {
    const q = input.value.toLowerCase().trim();
    if (!q) {
      results.style.display = 'none';
      return;
    }

    const filtered = state.patients.filter(p => p.name.toLowerCase().includes(q) || p.uhid.toLowerCase().includes(q));
    if (filtered.length === 0) {
      results.innerHTML = `<div style="padding:8px; font-size:0.72rem; color:var(--text-secondary); text-align:center;">No patient found.</div>`;
    } else {
      results.innerHTML = filtered.map(p => `
        <div onclick="window.selectOpdPatientChip('${p.uhid}', '${p.name}')" style="padding:8px; font-size:0.75rem; border-bottom:1px solid #e2e8f0; cursor:pointer; font-weight:600;">
          ${p.name} <span class="billing-mono" style="color:var(--text-muted); font-size:0.68rem;">(${p.uhid})</span>
        </div>
      `).join('');
    }
    results.style.display = 'block';
  });
}

window.selectOpdPatientChip = function(uhid, name) {
  document.getElementById('opd-uhid-field').value = uhid;
  document.getElementById('opd-name-field').value = name;
  document.getElementById('opd-search-input').value = '';
  document.getElementById('opd-autocomplete-results').style.display = 'none';
};

window.generateOpdQuickBill = async function() {
  const uhid = document.getElementById('opd-uhid-field').value;
  const name = document.getElementById('opd-name-field').value;
  const srvSelect = document.getElementById('opd-service-select');
  const srvText = srvSelect.options[srvSelect.selectedIndex].text.split(' (')[0];
  const amount = Number(document.getElementById('opd-amount-field').value) || 0;
  const mode = document.getElementById('opd-mode-select').value;

  if (!uhid || !name || !amount) {
    alert("Please select a patient, a service, and verify the amount.");
    return;
  }

  // Create new OPD receipt record
  const receiptNo = "RCP-2026-000" + (window.state.billingOpdReceipts.length + 1);
  window.state.billingOpdReceipts.unshift({
    receiptNo,
    patient: name,
    service: srvText,
    amount,
    mode,
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    reprints: 0
  });

  // Push to main billing records
  const newBillId = "INV" + String(8000 + state.billing.length + 1);
  state.billing.unshift({
    id: newBillId,
    uhid,
    patientName: name,
    date: new Date().toISOString().split('T')[0],
    amount,
    paid: amount,
    status: "Paid",
    visitType: "OPD",
    admissionNo: "",
    doctorName: "Dr. Amit Verma",
    department: "General Medicine",
    paymentCategory: "Self Pay",
    advancePaid: 0,
    discountAmount: 0,
    items: [{ desc: srvText, qty: 1, rate: amount, total: amount }],
    auditLogs: [{ timestamp: new Date().toISOString(), user: "Cashier", action: "Quick OPD Bill & Receipt Generated" }]
  });

  await customAlert(`Receipt ${receiptNo} issued successfully for ${name}.`);
  router.navigate('billing');
};

window.triggerReceiptReprint = async function(receiptNo) {
  const reason = await customPrompt(`🧾 Reprint Request for Receipt ID: ${receiptNo}
Reason log is mandatory:`);
  if (!reason || reason.trim() === '') {
    alert("Reprint reason is mandatory to comply with audit logs.");
    return;
  }

  const rec = window.state.billingOpdReceipts.find(r => r.receiptNo === receiptNo);
  if (rec) {
    rec.reprints++;
    if (rec.reprints > 2) {
      alert(`⚠️ Supervisor Alert triggered! Receipt ${receiptNo} has been reprinted ${rec.reprints} times.`);
    } else {
      alert(`Receipt ${receiptNo} printing draft sent to printer (Reprint count: ${rec.reprints}).`);
    }
  }
};

// --------------------------------------------------------------------------
// 3. ADVANCE & DEPOSIT LEDGER TAB (Cashier, Exec)
// --------------------------------------------------------------------------
function renderAdvanceLedgerTab() {
  const statusBadges = {
    Active: "background-color: var(--color-success-bg); color: var(--color-success);",
    "Low Balance": "background-color: var(--color-warning-bg); color: var(--color-warning);",
    Exhausted: "background-color: var(--color-danger-bg); color: var(--color-danger);"
  };

  let advancesList = window.state.billingAdvances || [];
  if (window.billingSearchFilter) {
    advancesList = advancesList.filter(adv => adv.uhid === window.billingSearchFilter || adv.name.toLowerCase().includes(window.billingSearchFilter.toLowerCase()));
  }

  // Calculate outstanding IPD admission advance requests
  const pendingRequests = [];
  const reqs = window.state.admissionRequests || [];
  const thresholds = window.state.advanceThresholds || { Standard: 5000, ICU: 15000, Daycare: 2000 };
  
  reqs.forEach(r => {
    // Only check IPD (exclude Daycare or schemes if cashless)
    const isCashless = r.payer && (r.payer.toLowerCase().includes('cashless') || r.payer.toLowerCase().includes('tpa') || r.payer.toLowerCase().includes('insur'));
    if (isCashless) return;

    const isICU = r.wardPreference === 'ICU' || r.wardPreference === 'CCU' || r.wardPreference === 'ICCU';
    const reqAmount = isICU ? thresholds['ICU'] : thresholds['Standard'];

    const advObj = window.state.billingAdvances.find(a => a.uhid === r.uhid);
    const balance = advObj ? advObj.balance : 0;
    const shortfall = reqAmount - balance;

    if (shortfall > 0) {
      pendingRequests.push({
        id: r.id,
        uhid: r.uhid,
        name: r.name,
        doctor: r.requestedBy || 'Dr. Amit Verma',
        ward: r.wardPreference || 'GENERAL-WARD-M',
        required: reqAmount,
        paid: balance,
        shortfall: shortfall,
        date: r.requestedAt ? r.requestedAt.split('T')[0] : new Date().toISOString().split('T')[0]
      });
    }
  });

  return `
    ${window.billingSearchFilter ? `
      <div style="background:#f0fdf4; border:1px solid #bbf7d0; padding:10px 14px; border-radius:8px; margin-bottom:12px; font-size:12px; display:flex; justify-content:space-between; align-items:center;">
        <span style="color:#166534; font-weight:600;">🔍 Filtered by patient: ${window.billingSearchFilter}</span>
        <button class="btn btn-secondary btn-xs" onclick="window.billingSearchFilter=''; window.switchBillingTab('advance_ledger')" style="font-size:10px; padding:2px 8px; border-radius:4px; height:auto;">Clear Filter</button>
      </div>
    ` : ''}

    ${pendingRequests.length > 0 ? `
      <div style="background: #fffbeb; border: 1px solid #fef3c7; border-left: 4px solid #f59e0b; border-radius: 8px; padding: 15px; margin-bottom: 20px; text-align: left;">
        <h3 style="font-size: 0.88rem; font-weight: 700; margin: 0 0 10px 0; color: #b45309; display: flex; align-items: center; gap: 8px;">
          🛎️ Outstanding IPD Admission Advance Payment Requests
        </h3>
        <table class="custom-table" style="background: transparent; font-size: 11.5px; margin-bottom: 0;">
          <thead>
            <tr style="background: rgba(245, 158, 11, 0.05);">
              <th>Patient Name</th>
              <th>Target Ward</th>
              <th>Request Date</th>
              <th style="text-align: right;">Required (₹)</th>
              <th style="text-align: right;">Paid (₹)</th>
              <th style="text-align: right; color: #b45309;">Shortfall (₹)</th>
              <th style="text-align: right;">Action</th>
            </tr>
          </thead>
          <tbody>
            ${pendingRequests.map(r => `
              <tr style="background: transparent;">
                <td>
                  <strong>${r.name}</strong>
                  <div style="font-size: 10px; color: #64748b; font-family: monospace;">UHID: ${r.uhid} &middot; Doc: ${r.doctor}</div>
                </td>
                <td>${window.state.wards[r.ward]?.name || r.ward}</td>
                <td>${r.date}</td>
                <td style="text-align: right; font-family: monospace;">${formatINR(r.required)}</td>
                <td style="text-align: right; font-family: monospace;">${formatINR(r.paid)}</td>
                <td style="text-align: right; font-family: monospace; font-weight: bold; color: #b45309;">${formatINR(r.shortfall)}</td>
                <td style="text-align: right;">
                  <button class="btn btn-primary" onclick="router.navigate('billing-workspace?id=REQ-${r.uhid}')" style="padding: 3px 8px; font-size: 10px; height: 24px; font-weight: bold; background-color: #d97706; border-color: #d97706; cursor: pointer;">💳 Collect Advance</button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    ` : ''}

    <div style="text-align: left; margin-bottom: 10px;">
      <h3 style="font-size: 0.88rem; font-weight: 700; margin: 0; color: var(--text-primary);">Ledger Accounts</h3>
    </div>
    <table class="custom-table">
      <thead>
        <tr>
          <th>Patient Info</th>
          <th>Admission Date</th>
          <th style="text-align: right;">Total Deposited (₹)</th>
          <th style="text-align: right;">Adjusted (₹)</th>
          <th style="text-align: right;">Balance Advance (₹)</th>
          <th style="text-align: center;">Days Since Top-up</th>
          <th>Status</th>
          <th style="text-align: right;">Action</th>
        </tr>
      </thead>
      <tbody>
        ${advancesList.map(adv => `
          <tr>
            <td>
              <div style="font-weight: 600;"><span style="color: var(--primary); text-decoration: underline; cursor: pointer;" onclick="router.navigate('patients?uhid=${adv.uhid}')">${adv.name}</span></div>
              <div class="billing-mono" style="font-size: 0.72rem; color: #64748b; margin-top: 1px;">UHID: ${adv.uhid}</div>
            </td>
            <td class="billing-mono">${adv.admDate}</td>
            <td class="billing-mono" style="text-align: right;">${formatINR(adv.deposited)}</td>
            <td class="billing-mono" style="text-align: right; color:#64748b;">-${formatINR(adv.adjusted)}</td>
            <td class="billing-mono" style="text-align: right; font-weight:bold; color:${adv.balance < 2000 ? 'var(--color-danger)' : '#0f172a'};">${formatINR(adv.balance)}</td>
            <td class="billing-mono" style="text-align: center;">${adv.daysSinceTopup} days</td>
            <td><span class="badge" style="${statusBadges[adv.status] || ''} font-size:0.65rem; font-weight:700;">${adv.status}</span></td>
            <td style="text-align: right;">
              <div style="display:flex; justify-content:flex-end; gap:4px;">
                <button class="btn btn-primary" onclick="window.triggerCollectAdvanceTopup('${adv.uhid}')" style="padding:2px 6px; font-size:0.7rem; height:22px; font-weight:700;">Top-up</button>
                <button class="btn btn-secondary" onclick="window.triggerAdvanceRefund('${adv.uhid}', ${adv.balance})" style="padding:2px 6px; font-size:0.7rem; height:22px;">Refund</button>
              </div>
            </td>
          </tr>
        `).join('') || `<tr><td colspan="8" style="text-align:center; padding:20px; color:var(--text-muted);">No records found.</td></tr>`}
      </tbody>
    </table>
  `;
}

window.triggerCollectOpdAdvanceFee = async function(billId) {
  const bill = window.state.billing.find(b => b.id === billId);
  if (!bill) return;

  const amt = await customPrompt(`Collect OPD Advance Registration/Consultation Fee for patient: ${bill.patientName} (${bill.uhid})\nAmount due: ${formatINR(bill.amount)}\nEnter amount to collect (₹):`, bill.amount);
  const val = Number(amt);
  if (!val || val <= 0) return;

  bill.paid = val;
  bill.status = val >= bill.amount ? "Paid" : "Partial Paid";

  // Register receipt in billingOpdReceipts
  const receiptNo = "RCP-OPD-" + Math.floor(1000 + Math.random() * 9000);
  window.state.billingOpdReceipts = window.state.billingOpdReceipts || [];
  window.state.billingOpdReceipts.unshift({
    receiptNo: receiptNo,
    uhid: bill.uhid,
    patientName: bill.patientName,
    doctorName: bill.doctorName,
    deptName: bill.department,
    amount: val,
    paymentMode: "Cash",
    date: new Date().toLocaleDateString('en-CA'),
    reprints: 0
  });

  localStorage.setItem('saronil_billing', JSON.stringify(window.state.billing));
  localStorage.setItem('saronil_billing_opd_receipts', JSON.stringify(window.state.billingOpdReceipts));

  await customAlert(`✓ Successfully collected ₹${val} OPD Advance Fee for ${bill.patientName}. Receipt ${receiptNo} printed.`);
  const currentTab = window.activeBillingTab || 'billing_queue';
  router.navigate('billing?tab=' + currentTab + '&t=' + Date.now());
};

window.triggerCollectIpdAdvance = async function(uhid, defaultAmount) {
  const amt = await customPrompt(`Collect IPD Admission Advance Deposit for patient: ${uhid}\nOutstanding shortfall: ₹${defaultAmount}\nEnter amount to collect (₹):`, defaultAmount);
  const val = Number(amt);
  if (!val || val <= 0) return;

  let adv = window.state.billingAdvances.find(a => a.uhid === uhid);
  if (adv) {
    adv.deposited += val;
    adv.balance += val;
    adv.daysSinceTopup = 0;
    adv.status = adv.balance >= 5000 ? "Active" : (adv.balance >= 2000 ? "Low Balance" : "Exhausted");
  } else {
    const patientObj = window.state.patients.find(p => p.uhid === uhid) || { name: 'Patient' };
    adv = {
      name: patientObj.name,
      uhid: uhid,
      admDate: new Date().toLocaleDateString('en-CA'),
      deposited: val,
      adjusted: 0,
      balance: val,
      daysSinceTopup: 0,
      status: val >= 5000 ? "Active" : (val >= 2000 ? "Low Balance" : "Exhausted")
    };
    window.state.billingAdvances.push(adv);
  }

  localStorage.setItem('saronil_billingAdvances', JSON.stringify(window.state.billingAdvances));
  await customAlert(`✓ Successfully collected ₹${val} IPD Admission Advance for ${adv.name}. Receipt printed.`);
  const currentTab = window.activeBillingTab || 'billing_queue';
  router.navigate('billing?tab=' + currentTab + '&t=' + Date.now());
};

window.triggerCollectAdvanceTopup = async function(uhid) {
  const amt = await customPrompt(`Collect deposit top-up advance for patient: ${uhid}
Enter amount (₹):`);
  const val = Number(amt);
  if (!val || val <= 0) return;

  const adv = window.state.billingAdvances.find(a => a.uhid === uhid);
  if (adv) {
    adv.deposited += val;
    adv.balance += val;
    adv.daysSinceTopup = 0;
    adv.status = adv.balance >= 5000 ? "Active" : (adv.balance >= 2000 ? "Low Balance" : "Exhausted");
    await customAlert(`Successfully collected ₹${val} deposit for ${adv.name}. Receipt printed.`);
    router.navigate('billing');
  }
};

window.triggerAdvanceRefund = async function(uhid, balance) {
  if (balance <= 0) {
    alert("No active deposit balance left to refund.");
    return;
  }

  const amt = await customPrompt(`Process advance refund for patient: ${uhid}
Available balance: ${formatINR(balance)}
Enter refund amount (₹):`);
  const val = Number(amt);
  if (!val || val <= 0) return;

  if (val > balance) {
    alert("Refund amount cannot exceed active deposit balance.");
    return;
  }

  if (val > 5000 && window.activeBillingRole !== 'BILLING_SUPERVISOR' && window.activeBillingRole !== 'ACCOUNTS_MANAGER') {
    alert(`⚠️ Supervisor Approval Required! Refunds exceeding ₹5,000 must be approved by the Billing Supervisor.`);
    
    const adv = window.state.billingAdvances.find(a => a.uhid === uhid);
    window.state.billingRefunds.unshift({
      id: "REF-00" + (window.state.billingRefunds.length + 1),
      name: adv ? adv.name : "Patient",
      amount: val,
      reason: "Advance deposit refund request",
      requestedBy: "Cashier",
      date: new Date().toISOString().split('T')[0],
      approver: "Supervisor approval pending",
      status: "Pending Approval"
    });
    
    alert("Refund request submitted to Approval queue.");
    return;
  }

  const adv = window.state.billingAdvances.find(a => a.uhid === uhid);
  if (adv) {
    adv.deposited -= val;
    adv.balance -= val;
    adv.status = adv.balance >= 5000 ? "Active" : (adv.balance >= 2000 ? "Low Balance" : "Exhausted");
    await customAlert(`Successfully refunded ₹${val} to the patient. Refund voucher printed.`);
    router.navigate('billing');
  }
};

// --------------------------------------------------------------------------
// 4. PACKAGE BILLING TAB (Exec, Supervisor)
// --------------------------------------------------------------------------
function renderPackageBillingTab() {
  return `
    <table class="custom-table" style="margin-bottom:12px;">
      <thead>
        <tr>
          <th>Patient Name</th>
          <th>Surgical Package Name</th>
          <th style="text-align: right;">Package Standard ₹</th>
          <th style="text-align: right;">Actual Accrued Charges ₹</th>
          <th style="text-align: right;">Variance ₹</th>
          <th>Status</th>
          <th style="text-align: right;">Action</th>
        </tr>
      </thead>
      <tbody>
        ${window.state.billingPackages.map((pkg, idx) => {
          let varCol = "color: var(--color-success); font-weight:bold;";
          if (pkg.variance > 0) varCol = "color: var(--color-danger); font-weight:bold;";
          if (pkg.pct < -20) varCol = "color: #2563eb; font-weight:bold;";

          const pat = (window.state.patients || []).find(p => p.name === pkg.name);
          const uhid = pat ? pat.uhid : '';

          return `
            <tr>
              <td style="font-weight: 600;"><span style="color: var(--primary); text-decoration: underline; cursor: pointer;" onclick="router.navigate('patients?uhid=${uhid}')">${pkg.name}</span></td>
              <td>${pkg.package}</td>
              <td class="billing-mono" style="text-align: right;">${formatINR(pkg.pkgAmt)}</td>
              <td class="billing-mono" style="text-align: right;">${formatINR(pkg.actuals)}</td>
              <td class="billing-mono" style="text-align: right; ${varCol}">${pkg.variance > 0 ? '+' : ''}${formatINR(pkg.variance)} (${pkg.pct}%)</td>
              <td>
                <span class="badge" style="font-size:0.65rem; font-weight:700; background-color:${pkg.variance > 0 ? 'var(--color-danger-bg)' : '#eff6ff'}; color:${pkg.variance > 0 ? 'var(--color-danger)' : '#2563eb'};">
                  ${pkg.status}
                </span>
              </td>
              <td style="text-align: right;">
                <button class="btn btn-secondary" onclick="window.togglePackageExpand(${idx})" style="padding:2px 6px; font-size:0.7rem; height:22px; font-weight:600;">Compare</button>
              </td>
            </tr>
            <tr id="package-detail-${idx}" style="display:none; background:#fafafa;">
              <td colspan="7" style="padding: 12px 24px; border:1px solid #cbd5e1; border-top:none;">
                <div style="font-size:0.76rem; line-height:1.6;">
                  <strong style="color:var(--primary); font-size:0.8rem;">📦 Package vs Actuals Breakdown & Exclusions Checks</strong>
                  
                  <div style="display:grid; grid-template-columns:1fr 1fr; gap:20px; margin-top:8px;">
                    <div>
                      <span style="font-weight:bold; text-decoration:underline;">Standard Package Inclusions:</span>
                      <ul style="margin:4px 0; padding-left:16px;">
                        <li>OT Room & Equipment Charges</li>
                        <li>Anesthetic Consultant Administration</li>
                        <li>Standard Ward Room bed rent (2 nights max)</li>
                        <li>Generic Surgical Consumable Kit</li>
                      </ul>
                    </div>
                    <div>
                      <span style="font-weight:bold; text-decoration:underline; color:var(--color-danger);">Exclusions (Chargeable Above Package):</span>
                      <ul style="margin:4px 0; padding-left:16px; color:#991b1b;">
                        <li>Specialist Implants or mesh (e.g. titanium mesh - billed ₹12,000)</li>
                        <li>High value diagnostic scans (e.g. Post-op contrast MRI - billed ₹8,500)</li>
                        <li>Cross referrals / non-surgical consultations</li>
                      </ul>
                    </div>
                  </div>

                  <div style="margin-top:12px; display:flex; justify-content:flex-end; gap:8px; border-top:1px dashed #cbd5e1; padding-top:10px;">
                    <button class="btn btn-secondary" onclick="window.billAsPackage(${idx}, true)" style="font-size:0.72rem; padding:4px 8px; font-weight:700; height:28px;">Bill Package Only</button>
                    <button class="btn btn-secondary" onclick="window.billAsPackage(${idx}, false)" style="font-size:0.72rem; padding:4px 8px; font-weight:700; height:28px;">Bill Actuals Accrued</button>
                    ${pkg.actionNeeded ? `
                      <button class="btn btn-primary" onclick="window.triggerSupervisorPackageDecision(${idx})" style="font-size:0.72rem; padding:4px 8px; font-weight:700; height:28px; background:var(--color-danger); border-color:var(--color-danger);">Resolve Conflict</button>
                    ` : ''}
                  </div>
                </div>
              </td>
            </tr>
          `;
        }).join('')}
      </tbody>
    </table>
  `;
}

window.togglePackageExpand = function(idx) {
  const el = document.getElementById(`package-detail-${idx}`);
  if (el) {
    el.style.display = el.style.display === 'none' ? 'table-row' : 'none';
  }
};

window.billAsPackage = async function(idx, opt) {
  const pkg = window.state.billingPackages[idx];
  if (opt) {
    pkg.variance = 0;
    pkg.status = "Billed as Package";
  } else {
    pkg.variance = pkg.actuals - pkg.pkgAmt;
    pkg.status = "Billed as Actuals";
  }
  pkg.actionNeeded = false;
  await customAlert(`Resolved surgical package for ${pkg.name}. Finalizing tariff.`);
  router.navigate('billing');
};

window.triggerSupervisorPackageDecision = async function(idx) {
  const dec = await customPrompt(`Supervisor decision log for Package Conflict:
Patient: ${window.state.billingPackages[idx].name}
Enter resolution reason (Package Cap applied / Charge Exclusions separately):`);
  if (dec) {
    const pkg = window.state.billingPackages[idx];
    pkg.status = "Supervisor Decided: " + dec;
    pkg.actionNeeded = false;
    await customAlert("Supervisor override decision logged in billing session.");
    router.navigate('billing');
  }
};

// --------------------------------------------------------------------------
// 5. INSURANCE / TPA TAB (Exec, Supervisor, Accounts Mgr)
// --------------------------------------------------------------------------
if (!window.activeTpaSubTab) {
  window.activeTpaSubTab = "active_cases";
}

window.switchTpaSubTab = function(sub) {
  window.activeTpaSubTab = sub;
  router.navigate('billing');
};

function renderInsuranceTpaTab() {
  const sub = window.activeTpaSubTab;
  
  return `
    <div style="display:flex; gap:4px; border-bottom:1px dashed #cbd5e1; margin-bottom:10px; padding-bottom:4px; overflow-x:auto;">
      <button class="btn btn-sm ${sub === 'active_cases' ? 'btn-primary' : 'btn-secondary'}" onclick="window.switchTpaSubTab('active_cases')">Active Cases</button>
      <button class="btn btn-sm ${sub === 'pre_auth' ? 'btn-primary' : 'btn-secondary'}" onclick="window.switchTpaSubTab('pre_auth')">Pre-Auth / LOA</button>
      <button class="btn btn-sm ${sub === 'claims' ? 'btn-primary' : 'btn-secondary'}" onclick="window.switchTpaSubTab('claims')">Claims Submissions</button>
      <button class="btn btn-sm ${sub === 'settlements' ? 'btn-primary' : 'btn-secondary'}" onclick="window.switchTpaSubTab('settlements')">Settlements Ledger</button>
      <button class="btn btn-sm ${sub === 'queries' ? 'btn-primary' : 'btn-secondary'}" onclick="window.switchTpaSubTab('queries')">TPA Queries</button>
    </div>

    <div>
      ${renderTpaSubTabContent(sub)}
    </div>
  `;
}

function renderTpaSubTabContent(sub) {
  if (sub === 'active_cases') {
    return `
      <table class="custom-table">
        <thead>
          <tr>
            <th>Case No</th>
            <th>Patient</th>
            <th>TPA Provider</th>
            <th>Policy No</th>
            <th style="text-align: right;">Approved LOA ₹</th>
            <th style="text-align: right;">Estimated Bill ₹</th>
            <th>Co-pay</th>
            <th>Status</th>
            <th style="text-align: right;">Action</th>
          </tr>
        </thead>
        <tbody>
          ${window.state.billingTpaCases.map(tpa => `
            <tr>
              <td class="billing-mono" style="font-weight: 600;">${tpa.caseNo}</td>
              <td style="font-weight:600;"><span style="color: var(--primary); text-decoration: underline; cursor: pointer;" onclick="router.navigate('patients?uhid=${tpa.uhid}')">${tpa.name}</span></td>
              <td>${tpa.provider}</td>
              <td class="billing-mono">${tpa.policyNo}</td>
              <td class="billing-mono" style="text-align: right; color:#059669;">${formatINR(tpa.loaAmount)}</td>
              <td class="billing-mono" style="text-align: right; font-weight:bold; color:${tpa.estimatedBill > tpa.loaAmount ? 'var(--color-danger)' : 'inherit'};">${formatINR(tpa.estimatedBill)}</td>
              <td>${tpa.coPay}%</td>
              <td><span class="badge" style="background:#e0f2fe; color:#0369a1; font-size:0.65rem; font-weight:700;">${tpa.loaStatus}</span></td>
              <td style="text-align: right;">
                <button class="btn btn-primary" onclick="window.requestTpaEnhancement('${tpa.caseNo}')" style="padding:2px 6px; font-size:0.7rem; height:22px; font-weight:700;">Enhance</button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  } else if (sub === 'pre_auth') {
    return `
      <div style="font-size:0.76rem; margin-bottom:12px; background:#eff6ff; border:1px solid #bfdbfe; padding:8px; border-radius:4px; color:#1e40af;">
        📝 <strong>TPA Pre-authorisation Master Checklist</strong> · Select any active cashless patient to send an enhancement request or upload a Letter of Authorisation (LOA).
      </div>
      <table class="custom-table">
        <thead>
          <tr>
            <th>Patient</th>
            <th>TPA</th>
            <th>LOA Status</th>
            <th style="text-align: right;">LOA Amount ₹</th>
            <th style="text-align: right;">Spent Amount ₹</th>
            <th style="text-align: right;">Action</th>
          </tr>
        </thead>
        <tbody>
          ${window.state.billingTpaCases.map(tpa => `
            <tr>
              <td style="font-weight:600;"><span style="color: var(--primary); text-decoration: underline; cursor: pointer;" onclick="router.navigate('patients?uhid=${tpa.uhid}')">${tpa.name}</span></td>
              <td>${tpa.provider}</td>
              <td><span class="badge" style="background:#ecfdf5; color:#10b981; font-size:0.65rem; font-weight:700;">LOA Active</span></td>
              <td class="billing-mono" style="text-align: right; font-weight:bold;">${formatINR(tpa.loaValue)}</td>
              <td class="billing-mono" style="text-align: right;">${formatINR(tpa.estimatedBill)}</td>
              <td style="text-align: right;">
                <button class="btn btn-secondary" onclick="alert('Letter of Authorization file printed.')" style="padding:2px 6px; font-size:0.7rem; height:22px;">Print LOA</button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  } else if (sub === 'claims') {
    return `
      <table class="custom-table">
        <thead>
          <tr>
            <th>Claim ID</th>
            <th>Patient Name</th>
            <th>TPA Provider</th>
            <th style="text-align: right;">Claim Value ₹</th>
            <th>Checklist Documents</th>
            <th>Status</th>
            <th style="text-align: right;">Action</th>
          </tr>
        </thead>
        <tbody>
          ${window.state.billingClaims.map((cl, idx) => {
            const checklistCount = Object.values(cl.checklist).filter(v => v).length;
            const totalDocs = Object.keys(cl.checklist).length;
            return `
              <tr>
                <td class="billing-mono" style="font-weight: 600;">${cl.claimNo}</td>
                <td style="font-weight:600;">${cl.patient}</td>
                <td>${cl.tpa}</td>
                <td class="billing-mono" style="text-align: right; font-weight:bold;">${formatINR(cl.amount)}</td>
                <td>
                  <span onclick="window.toggleClaimChecklist(${idx})" style="text-decoration:underline; cursor:pointer; color:#2563eb; font-weight:bold;">
                    ${checklistCount}/${totalDocs} Signed Docs
                  </span>
                </td>
                <td><span class="badge" style="background:#fffbeb; color:#d97706; font-size:0.65rem; font-weight:700;">${cl.status}</span></td>
                <td style="text-align: right;">
                  <button class="btn btn-primary" onclick="window.submitClaimToTpa('${cl.claimNo}')" style="padding:2px 6px; font-size:0.7rem; height:22px; font-weight:700;">Submit Claim</button>
                </td>
              </tr>
              <tr id="claim-check-${idx}" style="display:none; background:#fafafa;">
                <td colspan="7" style="padding: 10px 16px; border:1px solid #cbd5e1;">
                  <div style="font-size:0.74rem;">
                    <strong>Indian TPA Claim Documents Package Checklist:</strong>
                    <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:6px; margin-top:6px;">
                      ${Object.entries(cl.checklist).map(([key, val]) => `
                        <label style="display:flex; align-items:center; gap:4px; font-size:0.7rem;">
                          <input type="checkbox" ${val ? 'checked' : ''} onchange="window.updateClaimChecklist(${idx}, '${key}', this.checked)">
                          ${key.toUpperCase()}
                        </label>
                      `).join('')}
                    </div>
                  </div>
                </td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    `;
  } else if (sub === 'settlements') {
    return `
      <table class="custom-table">
        <thead>
          <tr>
            <th>TPA Provider</th>
            <th>Claim ID</th>
            <th style="text-align: right;">Billed ₹</th>
            <th style="text-align: right;">Settled ₹</th>
            <th style="text-align: right; color:#ef4444;">Short-pay ₹</th>
            <th>Short-pay Reason</th>
            <th>NEFT UTR Ref</th>
            <th style="text-align: right;">Action</th>
          </tr>
        </thead>
        <tbody>
          ${window.state.billingSettlements.map((set, idx) => `
            <tr>
              <td style="font-weight:600;">${set.tpa}</td>
              <td class="billing-mono">${set.claimNo}</td>
              <td class="billing-mono" style="text-align: right;">${formatINR(set.billed)}</td>
              <td class="billing-mono" style="text-align: right; font-weight:bold; color:#059669;">${formatINR(set.settled)}</td>
              <td class="billing-mono" style="text-align: right; font-weight:bold; color:#ef4444;">${formatINR(set.shortPay)}</td>
              <td style="color:#ef4444; font-size:0.7rem;">${set.reason}</td>
              <td class="billing-mono" style="font-size:0.68rem; font-weight:bold;">${set.utr}</td>
              <td style="text-align: right;">
                <div style="display:flex; justify-content:flex-end; gap:4px;">
                  <button class="btn btn-primary" onclick="window.acceptTpaSettlement(${idx})" style="padding:2px 6px; font-size:0.7rem; height:22px; font-weight:700;">Accept</button>
                  <button class="btn btn-secondary" onclick="window.disputeTpaSettlement(${idx})" style="padding:2px 6px; font-size:0.7rem; height:22px; color:var(--color-danger);">Dispute</button>
                </div>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  } else if (sub === 'queries') {
    return `
      <table class="custom-table">
        <thead>
          <tr>
            <th>TPA Query</th>
            <th>Patient Name</th>
            <th>Date Raised</th>
            <th>Response Due</th>
            <th>Response Sent</th>
            <th>Status</th>
            <th style="text-align: right;">Action</th>
          </tr>
        </thead>
        <tbody>
          ${window.state.billingQueries.map(q => `
            <tr>
              <td style="font-weight:600; color:#ef4444;">${q.query}</td>
              <td>${q.patient}</td>
              <td class="billing-mono">${q.date}</td>
              <td class="billing-mono" style="color:var(--color-danger);">${q.due}</td>
              <td>${q.sent}</td>
              <td><span class="badge" style="background:#fef2f2; color:#ef4444; font-size:0.65rem; font-weight:700;">${q.status}</span></td>
              <td style="text-align: right;">
                <button class="btn btn-primary" onclick="window.respondToTpaQuery('${q.query}')" style="padding:2px 6px; font-size:0.7rem; height:22px; font-weight:700;">Respond</button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  }
  return '';
}

window.requestTpaEnhancement = async function(caseNo) {
  const currentCase = window.state.billingTpaCases.find(c => c.caseNo === caseNo);
  if (!currentCase) return;

  const amt = await customPrompt(`Request Cashless Enhancement for case ${caseNo}:
Current LOA Approved: ${formatINR(currentCase.loaAmount)}
Enter enhancement amount (₹):`);
  const val = Number(amt);
  if (!val || val <= 0) return;

  currentCase.loaAmount += val;
  currentCase.loaStatus = "Enhancement Requested";
  await customAlert(`Cashless enhancement request of ₹${val} submitted to TPA desk.`);
  router.navigate('billing');
};

window.toggleClaimChecklist = function(idx) {
  const el = document.getElementById(`claim-check-${idx}`);
  if (el) {
    el.style.display = el.style.display === 'none' ? 'table-row' : 'none';
  }
};

window.updateClaimChecklist = function(idx, key, val) {
  const cl = window.state.billingClaims[idx];
  if (cl) {
    cl.checklist[key] = val;
    router.navigate('billing');
  }
};

window.submitClaimToTpa = async function(claimNo) {
  const cl = window.state.billingClaims.find(c => c.claimNo === claimNo);
  if (cl) {
    const incomplete = Object.entries(cl.checklist).filter(([k, v]) => !v);
    if (incomplete.length > 0) {
      const confirmSubmit = await customConfirm(`⚠️ Incomplete claim documentation package!
Missing files: ${incomplete.map(i => i[0]).join(', ')}.
Do you still want to force submit to TPA?`);
      if (!confirmSubmit) return;
    }
    cl.status = "Submitted";
    await customAlert(`Claim ID ${claimNo} submitted successfully to insurance portal.`);
    router.navigate('billing');
  }
};

window.acceptTpaSettlement = async function(idx) {
  const set = window.state.billingSettlements[idx];
  await customAlert(`Settlement of ₹${set.settled} accepted. NEFT UTR Ref logged: ${set.utr}`);
  window.state.billingSettlements.splice(idx, 1);
  router.navigate('billing');
};

window.disputeTpaSettlement = async function(idx) {
  const set = window.state.billingSettlements[idx];
  const msg = await customPrompt(`Enter dispute justification for TPA short-pay of ₹${set.shortPay} on Claim ${set.claimNo}:`);
  if (msg) {
    await customAlert(`Dispute filed. Sent to Supervisor Approval Queue.`);
    window.state.billingSettlements.splice(idx, 1);
    router.navigate('billing');
  }
};

window.respondToTpaQuery = async function(query) {
  const responseText = await customPrompt(`Respond to TPA query: "${query}"
Enter query response description:`);
  if (responseText) {
    const q = window.state.billingQueries.find(item => item.query === query);
    if (q) {
      q.sent = "Yes";
      q.status = "Responded";
      await customAlert("Response documents package uploaded & sent to TPA coordinator.");
      router.navigate('billing');
    }
  }
};

// --------------------------------------------------------------------------
// 6. GOVT SCHEMES TAB (Exec, Supervisor, Accounts Mgr)
// --------------------------------------------------------------------------
if (!window.activeGovtSubTab) {
  window.activeGovtSubTab = "cghs";
}

window.switchGovtSubTab = function(sub) {
  window.activeGovtSubTab = sub;
  router.navigate('billing');
};

function renderGovtSchemesTab() {
  const sub = window.activeGovtSubTab;
  
  return `
    <div style="display:flex; gap:4px; border-bottom:1px dashed #cbd5e1; margin-bottom:10px; padding-bottom:4px; overflow-x:auto;">
      <button class="btn btn-sm ${sub === 'cghs' ? 'btn-primary' : 'btn-secondary'}" onclick="window.switchGovtSubTab('cghs')">CGHS</button>
      <button class="btn btn-sm ${sub === 'echs' ? 'btn-primary' : 'btn-secondary'}" onclick="window.switchGovtSubTab('echs')">ECHS</button>
      <button class="btn btn-sm ${sub === 'pmjay' ? 'btn-primary' : 'btn-secondary'}" onclick="window.switchGovtSubTab('pmjay')">PMJAY / State Scheme</button>
      <button class="btn btn-sm ${sub === 'esi' ? 'btn-primary' : 'btn-secondary'}" onclick="window.switchGovtSubTab('esi')">ESI</button>
    </div>

    <div>
      ${renderGovtSubTabContent(sub)}
    </div>
  `;
}

function renderGovtSubTabContent(sub) {
  if (sub === 'cghs') {
    return `
      <table class="custom-table">
        <thead>
          <tr>
            <th>Patient Name</th>
            <th>CGHS Card ID</th>
            <th>Beneficiary Type</th>
            <th>Entitled Ward</th>
            <th>Rate List Applied</th>
            <th style="text-align: right;">Hospital Bill ₹</th>
            <th style="text-align: right;">CGHS Rate ₹</th>
            <th style="text-align: right; color:#ef4444;">Difference ₹</th>
            <th>Status</th>
            <th style="text-align: right;">Action</th>
          </tr>
        </thead>
        <tbody>
          ${window.state.billingGovtCases.map(gov => {
            const hasDiff = gov.difference > 0;
            return `
              <tr>
                <td style="font-weight:600;"><span style="color: var(--primary); text-decoration: underline; cursor: pointer;" onclick="router.navigate('patients?uhid=${gov.uhid}')">${gov.name}</span></td>
                <td class="billing-mono">${gov.cardNo}</td>
                <td>${gov.beneficiary}</td>
                <td>${gov.wardEntitlement}</td>
                <td style="font-weight:bold; color:${gov.rateList === 'Y' ? 'var(--color-success)' : 'var(--color-danger)'};">${gov.rateList}</td>
                <td class="billing-mono" style="text-align: right;">${formatINR(gov.billAmt)}</td>
                <td class="billing-mono" style="text-align: right; font-weight:bold; color:#059669;">${formatINR(gov.cghsRate)}</td>
                <td class="billing-mono" style="text-align: right; color:${hasDiff ? 'var(--color-danger)' : 'inherit'}; font-weight:bold;">${formatINR(gov.difference)}</td>
                <td><span class="badge" style="background:#ecfdf5; color:#10b981; font-size:0.65rem; font-weight:700;">${gov.status}</span></td>
                <td style="text-align: right;">
                  <button class="btn btn-primary" onclick="window.applyCghsRates('${gov.uhid}')" style="padding:2px 6px; font-size:0.7rem; height:22px; font-weight:700;">Apply Rates</button>
                </td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    `;
  } else if (sub === 'echs') {
    return `
      <table class="custom-table">
        <thead>
          <tr>
            <th>Patient Name</th>
            <th>ECHS Card ID</th>
            <th>Polyclinic Referral</th>
            <th>Entitled Ward</th>
            <th>Rate List Applied</th>
            <th style="text-align: right;">Hospital Bill ₹</th>
            <th style="text-align: right;">ECHS Approved Rate ₹</th>
            <th>Status</th>
            <th style="text-align: right;">Action</th>
          </tr>
        </thead>
        <tbody>
          ${window.state.billingGovtCases.map(gov => `
            <tr style="${gov.polyReferral === 'N' ? 'background-color:#fffbeb;' : ''}">
              <td style="font-weight:600;"><span style="color: var(--primary); text-decoration: underline; cursor: pointer;" onclick="router.navigate('patients?uhid=${gov.uhid}')">${gov.name}</span></td>
              <td class="billing-mono">${gov.cardNo}</td>
              <td style="font-weight:bold; color:${gov.polyReferral === 'Y' ? 'var(--color-success)' : 'var(--color-danger)'};">${gov.polyReferral} ${gov.polyReferral === 'N' ? '<span class="badge" style="background:#fee2e2;color:#ef4444;font-size:0.6rem;">REQUIRED</span>' : ''}</td>
              <td>${gov.wardEntitlement}</td>
              <td style="font-weight:bold; color:var(--color-success);">Y</td>
              <td class="billing-mono" style="text-align: right;">${formatINR(gov.billAmt)}</td>
              <td class="billing-mono" style="text-align: right; font-weight:bold; color:#059669;">${formatINR(gov.cghsRate)}</td>
              <td><span class="badge" style="background:#eff6ff; color:#1d4ed8; font-size:0.65rem; font-weight:700;">Referral verified</span></td>
              <td style="text-align: right;">
                <button class="btn btn-secondary" onclick="alert('ECHS Referrals Document upload portal opened.')" style="padding:2px 6px; font-size:0.7rem; height:22px;">Upload Referral</button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  } else if (sub === 'pmjay') {
    return `
      <table class="custom-table">
        <thead>
          <tr>
            <th>Patient Name</th>
            <th>UHID</th>
            <th>HBP Package Code</th>
            <th>PMJAY Package Name</th>
            <th style="text-align: right;">PMJAY Package ₹</th>
            <th style="text-align: right;">Actual Accrued Charges ₹</th>
            <th>Pre-Auth Ref ID</th>
            <th>Status</th>
            <th style="text-align: right;">Action</th>
          </tr>
        </thead>
        <tbody>
          ${window.state.billingPmjayCases.map(pm => `
            <tr>
              <td style="font-weight:600;"><span style="color: var(--primary); text-decoration: underline; cursor: pointer;" onclick="router.navigate('patients?uhid=${pm.uhid}')">${pm.name}</span></td>
              <td class="billing-mono">${pm.uhid}</td>
              <td class="billing-mono" style="font-weight:bold;">${pm.code}</td>
              <td>${pm.pkgName}</td>
              <td class="billing-mono" style="text-align: right; font-weight:bold;">${formatINR(pm.pkgAmt)}</td>
              <td class="billing-mono" style="text-align: right;">${formatINR(pm.actuals)}</td>
              <td class="billing-mono" style="font-size:0.7rem; font-weight:600;">${pm.preAuthId}</td>
              <td><span class="badge" style="background:#ecfdf5; color:#10b981; font-size:0.65rem; font-weight:700;">${pm.status}</span></td>
              <td style="text-align: right;">
                <button class="btn btn-secondary" onclick="window.verifyNhaPortal('${pm.preAuthId}')" style="padding:2px 6px; font-size:0.7rem; height:22px; font-weight:700; color:#2563eb;">NHA Portal</button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  } else if (sub === 'esi') {
    return `
      <div style="font-size:0.76rem; padding:12px; color:var(--text-secondary); font-style:italic; text-align:center;">
        Referral letters checked and pre-auth codes mapped automatically.
      </div>
    `;
  }
  return '';
}

window.applyCghsRates = async function(uhid) {
  const gov = window.state.billingGovtCases.find(g => g.uhid === uhid);
  if (gov) {
    gov.rateList = "Y";
    gov.difference = 0;
    gov.status = "CGHS Applied";
    await customAlert(`CGHS tariff rate master applied successfully to patient: ${gov.name}`);
    router.navigate('billing');
  }
};

window.verifyNhaPortal = function(preAuthId) {
  window.open(`https://pmjay.gov.in/preauth-check?id=${preAuthId}`, '_blank');
};

// --------------------------------------------------------------------------
// 7. REFUNDS & ADJUSTMENTS TAB (Cashier, Exec, Supervisor)
// --------------------------------------------------------------------------
function renderRefundsTab() {
  const statusColors = {
    Approved: "background-color: var(--color-success-bg); color: var(--color-success);",
    "Pending Approval": "background-color: var(--color-warning-bg); color: var(--color-warning);",
    "Cash Paid": "background-color: var(--color-success-bg); color: var(--color-success);",
    "NEFT Initiated": "background-color: #eff6ff; color: #1d4ed8;",
    Rejected: "background-color: var(--color-danger-bg); color: var(--color-danger);"
  };

  return `
    <table class="custom-table">
      <thead>
        <tr>
          <th>Ref ID</th>
          <th>Patient Name</th>
          <th style="text-align: right;">Refund Amount (₹)</th>
          <th>Refund Reason</th>
          <th>Requested By</th>
          <th>Request Date</th>
          <th>Authorized By</th>
          <th>Status</th>
          <th style="text-align: right;">Action</th>
        </tr>
      </thead>
      <tbody>
        ${window.state.billingRefunds.map((ref, idx) => {
          const pat = (window.state.patients || []).find(p => p.name === ref.name);
          const uhid = pat ? pat.uhid : '';
          return `
            <tr>
              <td class="billing-mono" style="font-weight: 600;">${ref.id}</td>
              <td style="font-weight:600;"><span style="color: var(--primary); text-decoration: underline; cursor: pointer;" onclick="router.navigate('patients?uhid=${uhid}')">${ref.name}</span></td>
            <td class="billing-mono" style="text-align: right; font-weight:bold;">${formatINR(ref.amount)}</td>
            <td>${ref.reason}</td>
            <td>${ref.requestedBy}</td>
            <td class="billing-mono">${ref.date}</td>
            <td>${ref.approver}</td>
            <td><span class="badge" style="${statusColors[ref.status] || ''} font-size:0.65rem; font-weight:700;">${ref.status}</span></td>
            <td style="text-align: right;">
              <div style="display:flex; justify-content:flex-end; gap:4px;">
                ${ref.status === 'Pending Approval' ? `
                  <button class="btn btn-primary" onclick="window.approveRefundRequest(${idx})" style="padding:2px 6px; font-size:0.7rem; height:22px; font-weight:700;">Approve</button>
                  <button class="btn btn-secondary" onclick="window.rejectRefundRequest(${idx})" style="padding:2px 6px; font-size:0.7rem; height:22px; color:var(--color-danger);">Reject</button>
                ` : `
                  ${ref.status === 'Approved' ? `
                    <button class="btn btn-primary" onclick="window.payRefundCash(${idx})" style="padding:2px 6px; font-size:0.7rem; height:22px; font-weight:700;">Pay Cash</button>
                    <button class="btn btn-secondary" onclick="window.payRefundNeft(${idx})" style="padding:2px 6px; font-size:0.7rem; height:22px;">Pay NEFT</button>
                  ` : '—'}
                `}
              </div>
            </td>
          </tr>
        `;
      }).join('')}
      </tbody>
    </table>
  `;
}

window.approveRefundRequest = async function(idx) {
  const ref = window.state.billingRefunds[idx];
  const role = window.activeBillingRole;

  if (ref.amount <= 1000 && role !== 'BILLING_EXECUTIVE' && role !== 'BILLING_SUPERVISOR' && role !== 'ACCOUNTS_MANAGER') {
    alert("Incomplete permissions to approve refunds.");
    return;
  }
  if (ref.amount > 1000 && ref.amount <= 5000 && role !== 'BILLING_SUPERVISOR' && role !== 'ACCOUNTS_MANAGER') {
    alert("Refunds between ₹1,001 and ₹5,000 require Billing Supervisor approval.");
    return;
  }
  if (ref.amount > 5000 && role !== 'ACCOUNTS_MANAGER') {
    alert("Refunds exceeding ₹5,000 require Accounts Manager approval.");
    return;
  }

  ref.status = "Approved";
  ref.approver = role;
  await customAlert(`Refund request approved by ${BILLING_ROLES[role].name}.`);
  router.navigate('billing');
};

window.rejectRefundRequest = async function(idx) {
  const reason = await customPrompt("Enter refund rejection reason (mandatory):");
  if (!reason || reason.trim() === '') {
    alert("Rejection reason is mandatory.");
    return;
  }
  const ref = window.state.billingRefunds[idx];
  ref.status = "Rejected";
  ref.approver = window.activeBillingRole;
  await customAlert("Refund request rejected. Patient notified via automated SMS.");
  router.navigate('billing');
};

window.payRefundCash = async function(idx) {
  const ref = window.state.billingRefunds[idx];
  ref.status = "Cash Paid";
  await customAlert(`Refund of ₹${ref.amount} paid in Cash. Voucher printed.`);
  router.navigate('billing');
};

window.payRefundNeft = async function(idx) {
  const ref = window.state.billingRefunds[idx];
  ref.status = "NEFT Initiated";
  await customAlert(`Refund of ₹${ref.amount} initiated via NEFT direct bank transfer.`);
  router.navigate('billing');
};

// --------------------------------------------------------------------------
// 8. APPROVAL QUEUE TAB (Billing Supervisor only)
// --------------------------------------------------------------------------
if (!window.activeApprovalSubTab) {
  window.activeApprovalSubTab = "discounts";
}

window.switchApprovalSubTab = function(sub) {
  window.activeApprovalSubTab = sub;
  router.navigate('billing');
};

function renderApprovalQueueTab() {
  const sub = window.activeApprovalSubTab;
  
  return `
    <div style="display:flex; gap:4px; border-bottom:1px dashed #cbd5e1; margin-bottom:10px; padding-bottom:4px; overflow-x:auto;">
      <button class="btn btn-sm ${sub === 'discounts' ? 'btn-primary' : 'btn-secondary'}" onclick="window.switchApprovalSubTab('discounts')">Discounts & Concessions</button>
      <button class="btn btn-sm ${sub === 'cancellations' ? 'btn-primary' : 'btn-secondary'}" onclick="window.switchApprovalSubTab('cancellations')">Bill Cancellations</button>
      <button class="btn btn-sm ${sub === 'exceptions' ? 'btn-primary' : 'btn-secondary'}" onclick="window.switchApprovalSubTab('exceptions')">System Exceptions</button>
    </div>

    <div>
      ${renderApprovalSubTabContent(sub)}
    </div>
  `;
}

function renderApprovalSubTabContent(sub) {
  if (sub === 'discounts') {
    const list = window.state.billingPendingApprovals.filter(p => p.id.startsWith("REQ-DISC"));
    return `
      <table class="custom-table">
        <thead>
          <tr>
            <th>Request ID</th>
            <th>Patient Name</th>
            <th style="text-align: right;">Bill Value ₹</th>
            <th style="text-align: right;">Discount Requested ₹ (%)</th>
            <th>Requested By</th>
            <th>Reason Notes</th>
            <th>Concession Category</th>
            <th style="text-align: right;">Action</th>
          </tr>
        </thead>
        <tbody>
          ${list.map((req, idx) => {
            const pat = (window.state.patients || []).find(p => p.name === req.name);
            const uhid = pat ? pat.uhid : req.uhid || '';
            return `
              <tr>
                <td class="billing-mono" style="font-weight: 600;">${req.id}</td>
                <td style="font-weight:600;"><span style="color: var(--primary); text-decoration: underline; cursor: pointer;" onclick="router.navigate('patients?uhid=${uhid}')">${req.name}</span></td>
              <td class="billing-mono" style="text-align: right;">${formatINR(req.billAmt)}</td>
              <td class="billing-mono" style="text-align: right; font-weight:bold; color:var(--color-danger);">${formatINR(req.discRequested)} (${req.percent}%)</td>
              <td>${req.requestedBy}</td>
              <td>${req.reason}</td>
              <td><span class="badge" style="background:#eff6ff; color:#1d4ed8; font-size:0.65rem; font-weight:700;">${req.category}</span></td>
              <td style="text-align: right;">
                <div style="display:flex; justify-content:flex-end; gap:4px;">
                  <button class="btn btn-primary" onclick="window.approveDiscountRequest('${req.id}')" style="padding:2px 6px; font-size:0.7rem; height:22px; font-weight:700;">Approve</button>
                  <button class="btn btn-secondary" onclick="window.rejectDiscountRequest('${req.id}')" style="padding:2px 6px; font-size:0.7rem; height:22px; color:var(--color-danger);">Reject</button>
                </div>
              </td>
            </tr>
          `;
        }).join('')}
        </tbody>
      </table>
    `;
  } else if (sub === 'cancellations') {
    const list = window.state.billingPendingApprovals.filter(p => p.id.startsWith("REQ-CAN"));
    return `
      <table class="custom-table">
        <thead>
          <tr>
            <th>Bill ID</th>
            <th>Patient Name</th>
            <th style="text-align: right;">Bill Amount ₹</th>
            <th>Cancellation Reason</th>
            <th>Raised By Cashier</th>
            <th style="text-align: right;">Action</th>
          </tr>
        </thead>
        <tbody>
          ${list.map(req => {
            const pat = (window.state.patients || []).find(p => p.name === req.name);
            const uhid = pat ? pat.uhid : '';
            return `
              <tr>
                <td class="billing-mono" style="font-weight: 600;">${req.targetId}</td>
                <td style="font-weight:600;"><span style="color: var(--primary); text-decoration: underline; cursor: pointer;" onclick="router.navigate('patients?uhid=${uhid}')">${req.name}</span></td>
              <td class="billing-mono" style="text-align: right; font-weight:bold;">${formatINR(req.amount)}</td>
              <td style="color:#ef4444; font-weight:600;">${req.reason}</td>
              <td>${req.raisedBy}</td>
              <td style="text-align: right;">
                <div style="display:flex; justify-content:flex-end; gap:4px;">
                  <button class="btn btn-primary" onclick="window.approveCancellation('${req.targetId}')" style="padding:2px 6px; font-size:0.7rem; height:22px; font-weight:700; background-color:var(--color-danger); border-color:var(--color-danger);">Approve Void</button>
                  <button class="btn btn-secondary" onclick="window.rejectCancellation('${req.targetId}')" style="padding:2px 6px; font-size:0.7rem; height:22px;">Reject</button>
                </div>
              </td>
            </tr>
          `;
        }).join('')}
        </tbody>
      </table>
    `;
  } else if (sub === 'exceptions') {
    return `
      <table class="custom-table">
        <thead>
          <tr>
            <th>Exception Type</th>
            <th>Description</th>
            <th>Value Override</th>
            <th style="text-align: right;">Action</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="font-weight:600; color:#ef4444;">Duplicate Bill ID</td>
            <td>SH-2026-04799 generated same LFT investigations twice on ${window._HIS_DATE(2)}</td>
            <td>₹750 LFT charge duplicated</td>
            <td style="text-align: right;">
              <button class="btn btn-secondary" onclick="alert('Duplicate billing cleared & resolved.')" style="padding:2px 6px; font-size:0.7rem; height:22px;">Resolve Exception</button>
            </td>
          </tr>
          <tr>
            <td style="font-weight:600; color:#f59e0b;">Manual Tariff Override</td>
            <td>Bed charges for PRIVATE room set to ₹0.00 manually on bill INV-8002</td>
            <td>Override allowed by administrator</td>
            <td style="text-align: right;">
              <button class="btn btn-secondary" onclick="alert('Tariff manual override confirmed.')" style="padding:2px 6px; font-size:0.7rem; height:22px;">Approve Override</button>
            </td>
          </tr>
        </tbody>
      </table>
    `;
  }
  return '';
}

window.approveDiscountRequest = async function(id) {
  const req = window.state.billingPendingApprovals.find(r => r.id === id);
  if (req) {
    const bill = state.billing.find(b => b.uhid === req.uhid);
    if (bill) {
      bill.discountAmount += req.discRequested;
      bill.amount -= req.discRequested;
      bill.auditLogs.push({ timestamp: new Date().toISOString(), user: "Billing Supervisor", action: `Approved discount of ₹${req.discRequested}` });
    }
    window.state.billingPendingApprovals = window.state.billingPendingApprovals.filter(r => r.id !== id);
    await customAlert("Discount request approved.");
    router.navigate('billing');
  }
};

window.rejectDiscountRequest = async function(id) {
  window.state.billingPendingApprovals = window.state.billingPendingApprovals.filter(r => r.id !== id);
  await customAlert("Discount request rejected. Cashier notified.");
  router.navigate('billing');
};

window.approveCancellation = async function(billNo) {
  const bill = state.billing.find(b => b.id === billNo);
  if (bill) {
    bill.status = "Cancelled";
    bill.paid = 0;
    bill.amount = 0;
    bill.auditLogs.push({ timestamp: new Date().toISOString(), user: "Billing Supervisor", action: "Approved Bill Cancellation (Voided)" });
    
    window.state.billingPendingApprovals = window.state.billingPendingApprovals.filter(r => r.targetId !== billNo);
    await customAlert(`Bill ${billNo} voided and cancelled successfully.`);
    router.navigate('billing');
  }
};

window.rejectCancellation = async function(billNo) {
  window.state.billingPendingApprovals = window.state.billingPendingApprovals.filter(r => r.targetId !== billNo);
  await customAlert("Cancellation request rejected. Cashier workspace remains active.");
  router.navigate('billing');
};

// --------------------------------------------------------------------------
// 9. SHIFT RECONCILIATION TAB (Cashier, Accounts Mgr)
// --------------------------------------------------------------------------
window.calculateVariance = function(declaredVal) {
  const systemNet = 47200;
  const physical = Number(declaredVal) || 0;
  const variance = physical - systemNet;
  
  const el = document.getElementById('recon-variance-field');
  if (el) {
    el.innerHTML = formatINR(variance);
    el.style.color = variance === 0 ? "var(--color-success)" : "var(--color-danger)";
  }
};

function renderShiftReconcileTab() {
  return `
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
      
      <!-- System Collections Summary -->
      <div style="border-right:1px solid #cbd5e1; padding-right:16px;">
        <h4 style="margin:0 0 10px 0; font-size:0.85rem; font-weight:700; text-transform:uppercase; color:var(--text-secondary);">System Collections Audit</h4>
        
        <div style="display:flex; flex-direction:column; gap:6px; font-size:0.78rem;">
          <div style="display:flex; justify-content:space-between; padding:4px 0; border-bottom:1px solid #e2e8f0;">
            <span>Cash collected:</span>
            <strong class="billing-mono">₹23,000.00</strong>
          </div>
          <div style="display:flex; justify-content:space-between; padding:4px 0; border-bottom:1px solid #e2e8f0;">
            <span>UPI collected:</span>
            <strong class="billing-mono">₹18,200.00</strong>
          </div>
          <div style="display:flex; justify-content:space-between; padding:4px 0; border-bottom:1px solid #e2e8f0;">
            <span>Card collected:</span>
            <strong class="billing-mono">₹6,000.00</strong>
          </div>
          <div style="display:flex; justify-content:space-between; padding:4px 0; border-bottom:1px solid #e2e8f0;">
            <span>Advances collected:</span>
            <strong class="billing-mono">₹85,000.00</strong>
          </div>
          <div style="display:flex; justify-content:space-between; padding:4px 0; border-bottom:1px solid #e2e8f0; color:#ef4444;">
            <span>Refunds disbursed:</span>
            <strong class="billing-mono">-[₹4,500.00]</strong>
          </div>
          <div style="display:flex; justify-content:space-between; padding:8px 0; border-top:2px solid #cbd5e1; font-weight:bold; font-size:0.85rem; color:#1e3a8a;">
            <span>Net Shift Collection:</span>
            <strong class="billing-mono">₹47,200.00</strong>
          </div>
        </div>
      </div>

      <!-- Physical Cash Counter Verification -->
      <div>
        <h4 style="margin:0 0 10px 0; font-size:0.85rem; font-weight:700; text-transform:uppercase; color:var(--text-secondary);">Cashier Declaration</h4>
        
        <div class="form-group" style="margin-bottom:12px;">
          <label style="font-size:0.75rem; font-weight:bold;">Cash In Hand Counted (₹)</label>
          <input type="number" id="recon-physical-cash" class="form-control billing-mono" style="font-size:0.9rem; font-weight:bold; height:34px; border-color:#cbd5e1;" oninput="window.calculateVariance(this.value)">
        </div>

        <div style="background-color:#f8fafc; border:1px solid #cbd5e1; border-radius:6px; padding:10px; display:flex; justify-content:space-between; align-items:center; font-size:0.8rem; margin-bottom:16px;">
          <span style="font-weight:700;">Reconciliation Variance:</span>
          <strong id="recon-variance-field" class="billing-mono" style="font-size:0.95rem;">₹0.00</strong>
        </div>

        <button class="btn btn-primary" onclick="window.triggerShiftCloseRecon()" style="width:100%; height:36px; font-weight:700;">Authorize Z-Report & Close Shift</button>
      </div>

    </div>
  `;
}

window.triggerShiftCloseRecon = async function() {
  const physical = Number(document.getElementById('recon-physical-cash').value) || 0;
  const systemNet = 47200;
  const variance = physical - systemNet;

  if (Math.abs(variance) > 50 && window.activeBillingRole !== 'BILLING_SUPERVISOR' && window.activeBillingRole !== 'ACCOUNTS_MANAGER') {
    alert(`⚠️ Shift Close Blocked!
Reconciliation variance is ${formatINR(variance)} (exceeds ±₹50 cashier tolerance limit).
Supervisor countersign is required to force close this shift.`);
    return;
  }

  const w = window.open('', '_blank', 'width=500,height=600');
  w.document.write(`
    <html>
      <head>
        <title>Z-Report Shift Summary - Closed</title>
        <style>
          body { font-family: monospace; padding: 20px; line-height: 1.5; font-size: 13px; }
          .line { border-bottom: 1px dashed #000; margin: 10px 0; }
        </style>
      </head>
      <body>
        <h3>SARONIL SUPER SPECIALTY HOSPITAL</h3>
        <div>RECONCILIATION Z-REPORT</div>
        <div class="line"></div>
        <strong>Cashier Name:</strong> Sonia S. (RN)<br>
        <strong>Date/Time:</strong> ${new Date().toLocaleString()}<br>
        <strong>Shift Start:</strong> ${window.cashierShift.startTime}<br>
        <div class="line"></div>
        Opening Drawer Cash:  ₹5,000.00<br>
        OPD collections cash: ₹23,000.00<br>
        UPI collections:      ₹18,200.00<br>
        Card collections:     ₹6,000.00<br>
        Advances top-up:      ₹85,000.00<br>
        Refunds paid:        -₹4,500.00<br>
        <div class="line"></div>
        Net Shift Total:      ₹47,200.00<br>
        Declared Cash hand:   ₹${physical.toFixed(2)}<br>
        Variance:             ₹${variance.toFixed(2)}<br>
        <div class="line"></div>
        Status: APPROVED / CLOSED<br><br><br>
        ______________________<br>
        Cashier Signature<br><br><br>
        ______________________<br>
        Supervisor Countersign
      </body>
    </html>
  `);
  w.document.close();
  w.print();

  window.cashierShift.status = "Closed";
  await customAlert("Shift closed successfully. Z-report printed.");
  router.navigate('billing');
};

// --------------------------------------------------------------------------
// 10. MRD & DISCHARGE TAB (MRD / DC Only)
// --------------------------------------------------------------------------
if (!window.activeMrdSubTab) {
  window.activeMrdSubTab = "discharge_queue";
}

window.switchMrdSubTab = function(sub) {
  window.activeMrdSubTab = sub;
  router.navigate('billing');
};

function renderMrdDischargeTab() {
  const sub = window.activeMrdSubTab;
  
  return `
    <div style="display:flex; gap:4px; border-bottom:1px dashed #cbd5e1; margin-bottom:10px; padding-bottom:4px; overflow-x:auto;">
      <button class="btn btn-sm ${sub === 'discharge_queue' ? 'btn-primary' : 'btn-secondary'}" onclick="window.switchMrdSubTab('discharge_queue')">Discharge Checklist Queue</button>
      <button class="btn btn-sm ${sub === 'coding_worklist' ? 'btn-primary' : 'btn-secondary'}" onclick="window.switchMrdSubTab('coding_worklist')">ICD Coding Worklist</button>
      <button class="btn btn-sm ${sub === 'deficiency_tracker' ? 'btn-primary' : 'btn-secondary'}" onclick="window.switchMrdSubTab('deficiency_tracker')">Deficiency Notices</button>
    </div>

    <div>
      ${renderMrdSubTabContent(sub)}
    </div>
  `;
}

function renderMrdSubTabContent(sub) {
  if (sub === 'discharge_queue') {
    return `
      <table class="custom-table">
        <thead>
          <tr>
            <th>Patient Name</th>
            <th>UHID</th>
            <th>Ward/Bed</th>
            <th>Consultant</th>
            <th>Checklist Status</th>
            <th>TAT (Elapsed)</th>
            <th style="text-align: right;">Action</th>
          </tr>
        </thead>
        <tbody>
          ${window.state.billingMrdQueue.map((mrd, idx) => {
            const checklistCount = Object.values(mrd.clearance).filter(v => v).length;
            const totalItems = Object.keys(mrd.clearance).length;
            
            return `
              <tr>
                <td style="font-weight:600;"><span style="color: var(--primary); text-decoration: underline; cursor: pointer;" onclick="router.navigate('patients?uhid=${mrd.uhid}')">${mrd.name}</span></td>
                <td class="billing-mono">${mrd.uhid}</td>
                <td class="billing-mono">${mrd.bed}</td>
                <td>${mrd.doctor}</td>
                <td>
                  <span onclick="window.toggleMrdClearanceChecklist(${idx})" style="text-decoration:underline; cursor:pointer; color:#2563eb; font-weight:bold;">
                    ${checklistCount}/${totalItems} Cleared
                  </span>
                </td>
                <td class="billing-mono" style="color:var(--color-danger); font-weight:bold;">${mrd.tat}</td>
                <td style="text-align: right;">
                  <button class="btn btn-primary" onclick="window.triggerFinalDischargeClearance(${idx})" style="padding:2px 6px; font-size:0.7rem; height:22px; font-weight:700;">Final Clearance</button>
                </td>
              </tr>
              <tr id="mrd-clear-${idx}" style="display:none; background:#fafafa;">
                <td colspan="7" style="padding: 10px 16px; border:1px solid #cbd5e1;">
                  <div style="font-size:0.74rem;">
                    <strong>MRD Clearance Departments Sign-off Logs:</strong>
                    <div style="display:grid; grid-template-columns:repeat(4, 1fr); gap:8px; margin-top:6px;">
                      ${Object.entries(mrd.clearance).map(([dept, cleared]) => `
                        <div style="padding:4px; border:1px solid #cbd5e1; border-radius:4px; display:flex; justify-content:space-between; background-color:${cleared ? 'var(--color-success-bg)' : '#fef2f2'}; border-left:3px solid ${cleared ? 'var(--color-success)' : 'var(--color-danger)'};">
                          <span style="font-weight:600; font-size:0.68rem; text-transform:uppercase;">${dept}</span>
                          <span style="font-weight:bold; color:${cleared ? 'var(--color-success)' : 'var(--color-danger)'};">${cleared ? '✓ Signed' : '□ Pending'}</span>
                        </div>
                      `).join('')}
                    </div>
                  </div>
                </td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    `;
  } else if (sub === 'coding_worklist') {
    return `
      <table class="custom-table">
        <thead>
          <tr>
            <th>Patient Name</th>
            <th>Final Diagnosis</th>
            <th>Primary Procedure</th>
            <th>ICD-10 Primary Code</th>
            <th>Secondary ICD Codes</th>
            <th>Status</th>
            <th style="text-align: right;">Action</th>
          </tr>
        </thead>
        <tbody>
          ${window.state.billingMrdCoding.map((cod, idx) => {
            const pat = (window.state.patients || []).find(p => p.name === cod.name);
            const uhid = pat ? pat.uhid : '';
            return `
              <tr>
                <td style="font-weight:600;"><span style="color: var(--primary); text-decoration: underline; cursor: pointer;" onclick="router.navigate('patients?uhid=${uhid}')">${cod.name}</span></td>
                <td style="font-weight:bold;">${cod.diagnosis}</td>
                <td>${cod.procedure}</td>
                <td>
                  <select id="icd-code-select-${idx}" class="form-select" style="font-size:0.75rem; height:26px; padding:0 4px; width:100px;">
                    <option value="K35.3" ${cod.icd10 === 'K35.3' ? 'selected' : ''}>K35.3 (Appendicitis)</option>
                    <option value="O60.1" ${cod.icd10 === 'O60.1' ? 'selected' : ''}>O60.1 (Pre-term Delivery)</option>
                    <option value="I21.9" ${cod.icd10 === 'I21.9' ? 'selected' : ''}>I21.9 (Myocardial Infarct)</option>
                  </select>
                </td>
                <td>
                  <input type="text" id="icd-sec-code-${idx}" class="form-control billing-mono" value="${cod.secondary}" style="font-size:0.72rem; height:26px; width:80px;">
                </td>
                <td><span class="badge" style="background:#fffbeb; color:#d97706; font-size:0.65rem; font-weight:700;">${cod.status}</span></td>
                <td style="text-align: right;">
                  <button class="btn btn-primary" onclick="window.saveIcdCoding(${idx})" style="padding:2px 6px; font-size:0.7rem; height:22px; font-weight:700;">Save Code</button>
                </td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    `;
  } else if (sub === 'deficiency_tracker') {
    return `
      <table class="custom-table">
        <thead>
          <tr>
            <th>Patient Name</th>
            <th>Missing Charts Records</th>
            <th>Responsible Clinician</th>
            <th>Notice Date</th>
            <th>Status</th>
            <th style="text-align: right;">Action</th>
          </tr>
        </thead>
        <tbody>
          ${window.state.billingMrdDeficiencies.map(def => {
            const pat = (window.state.patients || []).find(p => p.name === def.name);
            const uhid = pat ? pat.uhid : '';
            return `
              <tr>
                <td style="font-weight:600;"><span style="color: var(--primary); text-decoration: underline; cursor: pointer;" onclick="router.navigate('patients?uhid=${uhid}')">${def.name}</span></td>
              <td style="color:#ef4444; font-weight:bold;">${def.missing}</td>
              <td>${def.sentTo}</td>
              <td class="billing-mono">${def.dateSent}</td>
              <td><span class="badge" style="background:#fef2f2; color:#ef4444; font-size:0.65rem; font-weight:700;">${def.status}</span></td>
              <td style="text-align: right;">
                <button class="btn btn-primary" onclick="window.sendMrdDeficiencyNotice('${def.name}', '${def.sentTo}')" style="padding:2px 6px; font-size:0.7rem; height:22px; font-weight:700;">Remind Doctor</button>
              </td>
            </tr>
          `;
        }).join('')}
        </tbody>
      </table>
    `;
  }
  return '';
}

window.toggleMrdClearanceChecklist = function(idx) {
  const el = document.getElementById(`mrd-clear-${idx}`);
  if (el) {
    el.style.display = el.style.display === 'none' ? 'table-row' : 'none';
  }
};

window.triggerFinalDischargeClearance = async function(idx) {
  const mrd = window.state.billingMrdQueue[idx];
  const pending = Object.entries(mrd.clearance).filter(([dept, cleared]) => !cleared);
  
  if (pending.length > 0) {
    const override = await customConfirm(`⚠️ Incomplete Clearance checklist!
Pending sign-offs: ${pending.map(p => p[0]).join(', ')}.
Do you want to force MRD clearance override? (Requires permanent audit log log)`);
    if (!override) return;
    
    const reason = await customPrompt("Enter medical record override justification:");
    if (!reason || reason.trim() === '') {
      alert("Override justification is mandatory.");
      return;
    }
  }

  await customAlert(`Discharge final clearance granted for ${mrd.name}. UHID and chart moved to archive.`);
  window.state.billingMrdQueue.splice(idx, 1);
  router.navigate('billing');
};

window.saveIcdCoding = async function(idx) {
  const cod = window.state.billingMrdCoding[idx];
  const codeVal = document.getElementById(`icd-code-select-${idx}`).value;
  const secVal = document.getElementById(`icd-sec-code-${idx}`).value;
  
  cod.icd10 = codeVal;
  cod.secondary = secVal;
  cod.status = "Coded & Validated";
  
  await customAlert(`ICD-10 clinical coding saved successfully for ${cod.name}. Chart validated.`);
  router.navigate('billing');
};

window.sendMrdDeficiencyNotice = function(name, doc) {
  alert(`Deficiency alert SMS/notification sent successfully to ${doc} for patient ${name}'s missing chart logs.`);
};

// --------------------------------------------------------------------------
// SECTION 7: BOTTOM ANALYTICS (Accounts Mgr, Supervisor)
// --------------------------------------------------------------------------
function renderBottomAnalytics() {
  return `
    <div class="billing-card" style="margin-top:0;">
      <h3 style="font-size: 0.82rem; font-weight: 700; text-transform: uppercase; margin: 0 0 12px 0; color: var(--text-primary);">
        📊 RCM Analytics & Collections Trend
      </h3>
      
      <div style="font-size:0.75rem; font-weight:bold; color:#475569; margin-bottom:4px;">Collection Modes (7 Days Trend)</div>
      <div style="display:flex; flex-direction:column; gap:4px; margin-bottom:12px;">
        <div style="display:flex; height:20px; border-radius:4px; overflow:hidden;">
          <div style="width:40%; background-color:#10b981; text-align:center; color:white; font-size:0.65rem; font-weight:bold; line-height:20px;">Cash 40%</div>
          <div style="width:35%; background-color:#2563eb; text-align:center; color:white; font-size:0.65rem; font-weight:bold; line-height:20px;">UPI 35%</div>
          <div style="width:15%; background-color:#8b5cf6; text-align:center; color:white; font-size:0.65rem; font-weight:bold; line-height:20px;">Card 15%</div>
          <div style="width:10%; background-color:#f59e0b; text-align:center; color:white; font-size:0.65rem; font-weight:bold; line-height:20px;">TPA 10%</div>
        </div>
      </div>

      <div style="font-size:0.75rem; font-weight:bold; color:#475569; margin-bottom:4px;">Receivables Aging Bookings</div>
      <div style="font-size:0.72rem; display:flex; flex-direction:column; gap:6px;">
        <div>
          <div style="display:flex; justify-content:space-between; font-weight:bold; font-size:0.68rem; margin-bottom:2px;">
            <span>0–30 Days</span>
            <span class="billing-mono">₹1,45,000.00</span>
          </div>
          <div style="height:6px; background:#e2e8f0; border-radius:3px; overflow:hidden;">
            <div style="width:75%; background:var(--color-success); height:100%;"></div>
          </div>
        </div>
        <div>
          <div style="display:flex; justify-content:space-between; font-weight:bold; font-size:0.68rem; margin-bottom:2px;">
            <span>31–60 Days</span>
            <span class="billing-mono">₹89,500.00</span>
          </div>
          <div style="height:6px; background:#e2e8f0; border-radius:3px; overflow:hidden;">
            <div style="width:40%; background:var(--color-warning); height:100%;"></div>
          </div>
        </div>
        <div>
          <div style="display:flex; justify-content:space-between; font-weight:bold; font-size:0.68rem; margin-bottom:2px;">
            <span>61–90 Days</span>
            <span class="billing-mono">₹47,200.00</span>
          </div>
          <div style="height:6px; background:#e2e8f0; border-radius:3px; overflow:hidden;">
            <div style="width:20%; background:var(--color-danger); height:100%;"></div>
          </div>
        </div>
      </div>

    </div>
  `;
}

// --------------------------------------------------------------------------
// SECTION 6: BILL WORKSPACE (Full-Screen View)
// --------------------------------------------------------------------------
if (!window.workspaceOpenAccordion) {
  window.workspaceOpenAccordion = "room";
}

window.toggleWorkspaceAccordion = function(sect) {
  window.workspaceOpenAccordion = window.workspaceOpenAccordion === sect ? '' : sect;
  router.navigate(`billing-workspace?id=${window.activeBillingInvoiceId}`);
};

function getPatientBillingItems(bill, patForBill, bedRate, nursingRate, bedDays) {
  if (bill.visitType === 'IPD Request') {
    return {
      roomCharges: 0,
      visitingFees: 0,
      nurseCharges: 0,
      otCharges: 0,
      consumables: 0,
      labTotal: 0,
      radTotal: 0,
      pharmacyCharges: 0,
      labItems: [],
      radItems: [],
      pharmacyItems: []
    };
  }

  const isOPD = bill.visitType === 'OPD';
  const bedTotal = isOPD ? 0 : (bedRate * bedDays);
  const roomCharges = bedTotal;
  const visitingFees = isOPD ? (bill.amount || 600) : 1600;
  const nurseCharges = isOPD ? 0 : (nursingRate * bedDays);
  const otCharges = isOPD ? 0 : (bill.amount > 30000 ? 25000 : 0);
  const consumables = isOPD ? 0 : 1200;

  // Dynamic Lab Tests - Integrates directly with LIS orders and test master
  let labItems = [];
  const patOrders = (window.state && window.state.orders) ? window.state.orders.filter(o => o.uhid === bill.uhid && o.type === 'Laboratory') : [];
  if (patOrders.length > 0) {
    const priceMaster = {};
    if (window.state && window.state.lisTestMaster) {
      window.state.lisTestMaster.forEach(t => {
        priceMaster[t.code.toUpperCase()] = t.price;
        priceMaster[t.name.toUpperCase()] = t.price;
      });
    }
    labItems = patOrders.map(o => {
      const nameUpper = o.name.toUpperCase();
      let price = 350; // default NABL CBC/clinical path price
      if (priceMaster[nameUpper]) {
        price = priceMaster[nameUpper];
      } else {
        const foundKey = Object.keys(priceMaster).find(k => nameUpper.includes(k) || k.includes(nameUpper));
        if (foundKey) price = priceMaster[foundKey];
      }
      return { name: o.name, rate: price };
    });
  } else if (!isOPD) {
    if (patForBill?.department === 'General Surgery') {
      labItems = [
        { name: "Ultrasound Abdomen Log", rate: 1200 },
        { name: "CBC (Complete Blood Count)", rate: 350 }
      ];
    } else if (patForBill?.department === 'Cardiology') {
      labItems = [
        { name: "Lipid Profile Test", rate: 1200 },
        { name: "Troponin-T (Cardiac Marker)", rate: 1500 },
        { name: "ECG (12-Lead Check)", rate: 450 }
      ];
    } else if (patForBill?.department === 'Psychiatry') {
      labItems = [
        { name: "Thyroid Profile (T3, T4, TSH)", rate: 850 },
        { name: "Serum Electrolytes", rate: 750 }
      ];
    } else {
      // General Medicine/default
      labItems = [
        { name: "LFT (Liver Function Test)", rate: 750 },
        { name: "CBC (Complete Blood Count)", rate: 350 }
      ];
    }
  }
  const labTotal = labItems.reduce((acc, x) => acc + x.rate, 0);

  // Dynamic Radiology Tests - Integrates directly with RIS orders and test master
  let radItems = [];
  const patRadOrders = (window.state && window.state.orders) ? window.state.orders.filter(o => o.uhid === bill.uhid && o.type === 'Radiology') : [];
  if (patRadOrders.length > 0) {
    const priceMaster = {};
    if (window.state && window.state.risTestMaster) {
      window.state.risTestMaster.forEach(t => {
        priceMaster[t.code.toUpperCase()] = t.price;
        priceMaster[t.name.toUpperCase()] = t.price;
      });
    }
    radItems = patRadOrders.map(o => {
      const nameUpper = o.name.toUpperCase();
      let price = 1200; // default USG / basic radiology price
      if (priceMaster[nameUpper]) {
        price = priceMaster[nameUpper];
      } else {
        const foundKey = Object.keys(priceMaster).find(k => nameUpper.includes(k) || k.includes(nameUpper));
        if (foundKey) price = priceMaster[foundKey];
      }
      return { name: o.name, rate: price };
    });
  } else if (!isOPD) {
    if (patForBill?.department === 'General Surgery') {
      radItems = [
        { name: "USG Whole Abdomen", rate: 1200 }
      ];
    } else if (patForBill?.department === 'Orthopedics') {
      radItems = [
        { name: "X-Ray Chest PA View", rate: 450 }
      ];
    } else {
      radItems = [
        { name: "X-Ray Chest PA View", rate: 450 }
      ];
    }
  }
  const radTotal = radItems.reduce((acc, x) => acc + x.rate, 0);

  // Dynamic Pharmacy Dispenses
  const prescs = isOPD ? "" : (patForBill?.prescriptions || []).map(p => p.name).join(' + ');
  const pharmacyDesc = isOPD ? "" : (prescs ? `IPD Pharmacy Dispense: ${prescs}` : "Surgical Injection Kit + I.V. Fluids dispenses");
  const pharmacyCharges = isOPD ? 0 : (bill.amount > 40000 ? 8200 : 1200);

  // Dynamic Implant details
  let implantBrand = isOPD ? "" : "Johnson & Johnson Mesh";
  let implantLot = isOPD ? "" : "LOT99281A";
  if (!isOPD) {
    if (patForBill?.department === 'Cardiology') {
      implantBrand = "Abbott Xience Drug-Eluting Stent";
      implantLot = "LOT-ST-88219";
    } else if (patForBill?.department === 'Orthopedics') {
      implantBrand = "Stryker Titanium Hip Implant";
      implantLot = "LOT-HP-77123";
    }
  }

  return {
    bedTotal,
    roomCharges,
    visitingFees,
    nurseCharges,
    otCharges,
    consumables,
    labItems,
    labTotal,
    radItems,
    radTotal,
    pharmacyDesc,
    pharmacyCharges,
    implantBrand,
    implantLot
  };
}

async function renderInvoiceWorkspace(container, invoiceId) {
  const bill = state.billing.find(b => b.id === invoiceId);
  if (!bill) {
    await customAlert("Billing Record not found.");
    router.navigate('billing');
    return;
  }

  const activePkg = window.state.billingPackages.find(p => p.name === bill.patientName);
  const isPackageApplied = activePkg && activePkg.status !== "Conflict";
  // Use real ward rate lookup for bed charges
  const patForBill = (window.state.patients || []).find(p => p.uhid === bill.uhid);
  const wardKey = patForBill?.wardKey || (bill.paymentCategory === 'Insurance' ? 'SEMI-PRIVATE' : 'GENERAL-WARD-M');
  const wardRateEntry = (window.WARD_RATES || {})[wardKey];
  const bedRate = wardRateEntry ? wardRateEntry.rate : 1200;
  const nursingRate = wardRateEntry ? (wardRateEntry.nursingRate || 0) : 500;
  const bedDays = 6;

  const itemsInfo = getPatientBillingItems(bill, patForBill, bedRate, nursingRate, bedDays);

  const roomCharges = itemsInfo.roomCharges;
  const visitingFees = itemsInfo.visitingFees;
  const nurseCharges = itemsInfo.nurseCharges;
  const otCharges = itemsInfo.otCharges;
  const pharmacyCharges = itemsInfo.pharmacyCharges;
  const consumables = itemsInfo.consumables;

  const grossTotal = bill.visitType === 'IPD Request' ? bill.amount : (roomCharges + visitingFees + nurseCharges + otCharges + itemsInfo.labTotal + itemsInfo.radTotal + pharmacyCharges + consumables);
  const packageDiscount = isPackageApplied ? (grossTotal - activePkg.pkgAmt) : 0;
  const isCGHS = patForBill?.payer?.includes('CGHS') || patForBill?.payer?.includes('ECHS');
  const rateDifference = isCGHS ? Math.max(0, bedRate - 1000) * bedDays : 0;
  const roomLimitExcess = (bill.paymentCategory === 'Insurance' && bedRate > 3000) ? (bedRate - 3000) * bedDays : 0;
  const copayPct = (bill.paymentCategory === 'Insurance') ? 10 : 0;
  
  const discountableAmt = grossTotal - packageDiscount - rateDifference - roomLimitExcess;
  const copayDeduction = discountableAmt * (copayPct / 100);

  // Healthcare GST Compliance calculations
  const wardName = patForBill?.ward || '';
  const isIcuCategory = wardName.toLowerCase().includes('icu') || wardName.toLowerCase().includes('ccu') || wardName.toLowerCase().includes('hdu');
  let roomGst = 0;
  if (!isIcuCategory && bedRate > 5000) {
    roomGst = (bedRate * bedDays) * 0.05; // 5% GST on non-ICU rooms > 5,000/day
  }
  
  let packageGst = 0;
  if (isPackageApplied && activePkg) {
    const pkgLower = activePkg.package.toLowerCase();
    if (pkgLower.includes('cosmetic') || pkgLower.includes('wellness') || pkgLower.includes('corporate')) {
      packageGst = activePkg.pkgAmt * 0.18; // 18% GST on cosmetic and corporate packages
    }
  }

  const gstAmount = bill.taxOverrideAmount !== undefined ? bill.taxOverrideAmount : (roomGst + packageGst);
  const netBillAmount = grossTotal - packageDiscount - rateDifference - roomLimitExcess - copayDeduction + gstAmount;

  const depositAdjusted = Math.min(netBillAmount, bill.advancePaid || 0);
  const payerExpected = (bill.paymentCategory === 'Insurance' || isCGHS) ? (netBillAmount - depositAdjusted) : 0;
  const patientPayable = Math.max(0, netBillAmount - depositAdjusted - payerExpected);

  const isPaid = bill.status === 'Paid' || patientPayable <= 0;
  let formattedPayDate = '';
  let formattedPayTime = '';
  let payMode = 'UPI';
  let payTxnId = '';

  if (isPaid) {
    let payDateObj = bill.paymentDate ? new Date(bill.paymentDate) : null;
    payMode = bill.paymentMode || 'UPI';
    payTxnId = bill.paymentTxnId || '';

    if (!payDateObj) {
      // Find from audit log
      const log = bill.auditLogs.find(l => l.action.toLowerCase().includes('collected') || l.action.toLowerCase().includes('paid'));
      if (log) {
        payDateObj = new Date(log.timestamp);
        const match = log.action.match(/via (UPI|Cash|Card)/i);
        if (match) payMode = match[1];
        const txnMatch = log.action.match(/Ref: ([a-zA-Z0-9_\-]+)/i);
        if (txnMatch) payTxnId = txnMatch[1];
      } else {
        // Fallback
        payDateObj = new Date(bill.date + 'T11:30:00');
      }
    }
    
    formattedPayDate = payDateObj.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    formattedPayTime = payDateObj.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
  }

  const acc = window.workspaceOpenAccordion;

  container.innerHTML = `
    <style>
      .ws-shell { font-family: 'Inter', sans-serif; color:#0f172a; }
      .ws-mono { font-family: 'JetBrains Mono', monospace !important; }
      .ws-card { background: white; border: 1px solid #cbd5e1; border-radius: 6px; padding: 16px; box-shadow: 0 1px 2px rgba(0,0,0,0.05); margin-bottom:16px; }
      .ws-header { display: flex; justify-content: space-between; align-items: center; border-bottom:1px solid #cbd5e1; padding-bottom:10px; margin-bottom:12px; }
      .ws-grid-2 { display: grid; grid-template-columns: 2fr 1fr; gap:16px; }
      .ws-accordion-title { background:#f8fafc; border:1px solid #cbd5e1; padding:8px 12px; border-radius:4px; font-weight:bold; font-size:0.8rem; cursor:pointer; display:flex; justify-content:space-between; margin-bottom:4px; }
      .ws-accordion-body { padding:8px 12px; border:1px solid #cbd5e1; border-top:none; border-radius:0 0 4px 4px; margin-bottom:6px; background:white; font-size:0.76rem; }
    </style>

    <div class="ws-shell">
      <div class="ws-header">
        <button class="btn btn-secondary" onclick="router.navigate('billing')" style="font-size:0.8rem; height:32px;">← Back to Dashboard</button>
        <h3 style="margin:0; font-size:1.15rem; font-weight:800; color:var(--primary);">🧾 Revenue Cycle Workspace: <span class="ws-mono">${bill.id}</span></h3>
      </div>

      <div class="ws-card" style="border-top:4px solid #2563eb;">
        <div style="display:grid; grid-template-columns:repeat(5, 1fr); gap:12px; font-size:0.78rem;">
          <div>
            <span style="color:#64748b; font-size:0.7rem; font-weight:bold; text-transform:uppercase;">Patient Name</span>
            <div style="font-weight:bold; font-size:0.88rem;">${bill.patientName}</div>
          </div>
          <div>
            <span style="color:#64748b; font-size:0.7rem; font-weight:bold; text-transform:uppercase;">UHID / Admission</span>
            <div class="ws-mono" style="font-weight:600;">${bill.uhid} | ADM-${bill.id.replace("INV","")}</div>
          </div>
          <div>
            <span style="color:#64748b; font-size:0.7rem; font-weight:bold; text-transform:uppercase;">Admitted Ward / Bed</span>
            <div class="ws-mono" style="font-weight:600;">${bill.visitType === 'IPD' ? (patForBill?.bed ? patForBill.bed + ' — ' + (patForBill.ward || 'Ward') : 'IPD Bed') : 'OPD Clinic'}</div>
          </div>
          <div>
            <span style="color:#64748b; font-size:0.7rem; font-weight:bold; text-transform:uppercase;">Primary Consultant</span>
            <div style="font-weight:600;">${bill.doctorName}</div>
          </div>
          <div>
            <span style="color:#64748b; font-size:0.7rem; font-weight:bold; text-transform:uppercase;">Payer Category</span>
            <span class="badge-payer" style="background:#e0f2fe; color:#0369a1; font-weight:bold; font-size:0.7rem; display:inline-block; margin-top:2px;">${bill.paymentCategory}</span>
          </div>
        </div>
      </div>

      <div class="ws-grid-2">
        <div>
          <div class="ws-card" style="background-color:#f8fafc; border-left:4px solid #a855f7;">
            <h4 style="margin:0 0 8px 0; font-size:0.82rem; font-weight:700; text-transform:uppercase; color:#6b21a8;">Sponsor Scheme Details</h4>
            <div style="font-size:0.76rem; display:grid; grid-template-columns:1fr 1fr; gap:10px;">
              ${bill.paymentCategory === 'Insurance' ? `
                <div>TPA Company: <strong>Star Health Insurance</strong></div>
                <div>LOA Authorized Limit: <strong class="ws-mono" style="color:var(--color-success);">${formatINR(80000)}</strong></div>
                <div>Room Rent Cap Limit: <strong class="ws-mono">₹3,000.00 / day</strong></div>
                <div>Patient Co-payment: <strong>10%</strong></div>
              ` : `
                ${isCGHS ? `
                  <div>Scheme: <strong>CGHS Pensioner (Rate List applied)</strong></div>
                  <div>Ward Entitlement: <strong>General Ward (₹1,000/day CGHS Cap)</strong></div>
                  <div>Referral Card No: <strong class="ws-mono">CGHS-88291A</strong></div>
                  <div>Supplementary Billing: <strong style="color:var(--color-danger);">NOT PERMITTED</strong></div>
                ` : `
                  <div>Tariff Option: <strong>Self Pay Cash Tariff (General Bed)</strong></div>
                  <div>Active Deposits: <strong class="ws-mono" style="color:var(--color-success);">${formatINR(bill.advancePaid)}</strong></div>
                `}
              `}
            </div>
          </div>

          <div>
            <div style="display: flex; flex-direction: column; gap: 10px;">
              <!-- IPD Request custom item card -->
              ${bill.visitType === 'IPD Request' ? `
              <div class="ws-card" style="padding: 12px; margin-bottom: 0;">
                <h4 style="margin: 0 0 8px 0; font-size: 0.82rem; font-weight: 700; color: #334155; display: flex; align-items: center; gap: 6px;">
                  <span>🛎️</span> IPD Admission Advance Deposit Shortfall
                </h4>
                <table style="width:100%; font-size: 0.78rem;">
                  ${bill.items.map(item => `
                    <tr>
                      <td style="color: #475569;">${item.desc}</td>
                      <td class="ws-mono" style="text-align:right; font-weight:bold; color: #0f172a;">${formatINR(item.total)}</td>
                    </tr>
                  `).join('')}
                </table>
              </div>
              ` : ''}
              <!-- Ward Room & Bed Charges -->
              ${roomCharges > 0 ? `
              <div class="ws-card" style="padding: 12px; margin-bottom: 0;">
                <h4 style="margin: 0 0 8px 0; font-size: 0.82rem; font-weight: 700; color: #334155; display: flex; align-items: center; gap: 6px;">
                  <span>🛏️</span> Ward Room & Bed Charges
                </h4>
                <table style="width:100%; font-size: 0.78rem;">
                  <tr>
                    <td style="color: #475569;">${patForBill?.ward || 'General Ward'} Bed rent - 6 Days @ ${formatINR(bedRate)}/day</td>
                    <td class="ws-mono" style="text-align:right; font-weight:bold; color: #0f172a;">${formatINR(roomCharges)}</td>
                  </tr>
                  ${roomLimitExcess > 0 ? `
                    <tr style="color:var(--color-danger); font-size:0.7rem;">
                      <td>⚠️ Room rent policy excess (policy limit: ₹3,000.00/day) - Patient Payable</td>
                      <td class="ws-mono" style="text-align:right;">+${formatINR(roomLimitExcess)}</td>
                    </tr>
                  ` : ''}
                </table>
              </div>
              ` : ''}

              <!-- Consultant & Visiting Doctor Fees -->
              ${visitingFees > 0 ? `
              <div class="ws-card" style="padding: 12px; margin-bottom: 0;">
                <h4 style="margin: 0 0 8px 0; font-size: 0.82rem; font-weight: 700; color: #334155; display: flex; align-items: center; gap: 6px;">
                  <span>🩺</span> Consultant & Visiting Doctor Fees
                </h4>
                <table style="width:100%; font-size: 0.78rem;">
                  <tr>
                    <td style="color: #475569;">${bill.doctorName} (${patForBill?.department || 'Medicine'}) - ${bill.visitType === 'IPD' ? '2 Visits @ ' + formatINR(800) : '1 Visit @ ' + formatINR(visitingFees)}</td>
                    <td class="ws-mono" style="text-align:right; font-weight:bold; color: #0f172a;">${formatINR(visitingFees)}</td>
                  </tr>
                </table>
              </div>
              ` : ''}

              <!-- Nursing / Professional Charges -->
              ${nurseCharges > 0 ? `
              <div class="ws-card" style="padding: 12px; margin-bottom: 0;">
                <h4 style="margin: 0 0 8px 0; font-size: 0.82rem; font-weight: 700; color: #334155; display: flex; align-items: center; gap: 6px;">
                  <span>🏥</span> Nursing / Professional Charges
                </h4>
                <table style="width:100%; font-size: 0.78rem;">
                  <tr>
                    <td style="color: #475569;">${patForBill?.ward || 'General Ward'} Nursing Professional Charges & Care (6 days)</td>
                    <td class="ws-mono" style="text-align:right; font-weight:bold; color: #0f172a;">${formatINR(nurseCharges)}</td>
                  </tr>
                </table>
              </div>
              ` : ''}

              <!-- Operation Theatre & Specialist Charges -->
              ${otCharges > 0 ? `
              <div class="ws-card" style="padding: 12px; margin-bottom: 0;">
                <h4 style="margin: 0 0 8px 0; font-size: 0.82rem; font-weight: 700; color: #334155; display: flex; align-items: center; gap: 6px;">
                  <span>🏢</span> Operation Theatre & Specialist Charges
                </h4>
                <table style="width:100%; font-size: 0.78rem;">
                  <tr>
                    <td style="color: #475569;">OT Room & Specialist Anesthetic Equipment Charges</td>
                    <td class="ws-mono" style="text-align:right; font-weight:bold; color: #0f172a;">${formatINR(otCharges)}</td>
                  </tr>
                </table>
              </div>
              ` : ''}

              <!-- Laboratory Investigations -->
              ${itemsInfo.labTotal > 0 ? `
              <div class="ws-card" style="padding: 12px; margin-bottom: 0;">
                <h4 style="margin: 0 0 8px 0; font-size: 0.82rem; font-weight: 700; color: #334155; display: flex; align-items: center; gap: 6px;">
                  <span>🔬</span> Laboratory Investigations (Read-Only from LIS)
                </h4>
                <table style="width:100%; font-size: 0.78rem; border-bottom:1px solid #eee; margin-bottom:4px;">
                  ${itemsInfo.labItems.map(item => `
                    <tr>
                      <td style="color: #475569;">${item.name}</td>
                      <td class="ws-mono" style="text-align:right; font-weight:bold; color: #0f172a;">${formatINR(item.rate)}</td>
                    </tr>
                  `).join('')}
                </table>
                <div style="font-size:0.68rem; color:#64748b; font-style:italic;">Note: Investigation charges are pulled directly from LIS master data. Corrective credits require lab supervisor authorization.</div>
              </div>
              ` : ''}

              <!-- Radiology Investigations -->
              ${itemsInfo.radTotal > 0 ? `
              <div class="ws-card" style="padding: 12px; margin-bottom: 0;">
                <h4 style="margin: 0 0 8px 0; font-size: 0.82rem; font-weight: 700; color: #334155; display: flex; align-items: center; gap: 6px;">
                  <span>🩻</span> Radiology Investigations (Read-Only from RIS)
                </h4>
                <table style="width:100%; font-size: 0.78rem; border-bottom:1px solid #eee; margin-bottom:4px;">
                  ${itemsInfo.radItems.map(item => `
                    <tr>
                      <td style="color: #475569;">${item.name}</td>
                      <td class="ws-mono" style="text-align:right; font-weight:bold; color: #0f172a;">${formatINR(item.rate)}</td>
                    </tr>
                  `).join('')}
                </table>
                <div style="font-size:0.68rem; color:#64748b; font-style:italic;">Note: Investigation charges are pulled directly from RIS master data.</div>
              </div>
              ` : ''}

              <!-- Pharmacy & Medicines -->
              ${pharmacyCharges > 0 ? `
              <div class="ws-card" style="padding: 12px; margin-bottom: 0;">
                <h4 style="margin: 0 0 8px 0; font-size: 0.82rem; font-weight: 700; color: #334155; display: flex; align-items: center; gap: 6px;">
                  <span>💊</span> Pharmacy & Medicines (IPD Dispense Log)
                </h4>
                <table style="width:100%; font-size: 0.78rem;">
                  <tr>
                    <td style="color: #475569;">${itemsInfo.pharmacyDesc}</td>
                    <td class="ws-mono" style="text-align:right; font-weight:bold; color: #0f172a;">${formatINR(pharmacyCharges)}</td>
                  </tr>
                </table>
              </div>
              ` : ''}

              <!-- Consumables & Implants Sticker Log -->
              ${consumables > 0 || (itemsInfo.implantBrand && bill.visitType !== 'OPD') ? `
              <div class="ws-card" style="padding: 12px; margin-bottom: 0;">
                <h4 style="margin: 0 0 8px 0; font-size: 0.82rem; font-weight: 700; color: #334155; display: flex; align-items: center; gap: 6px;">
                  <span>🏷️</span> Consumables & Implants Sticker Log
                </h4>
                <table style="width:100%; font-size: 0.78rem;">
                  <tr>
                    <td style="color: #475569;">IPD Admission Kit & Ward Consumables</td>
                    <td class="ws-mono" style="text-align:right; font-weight:bold; color: #0f172a;">${formatINR(consumables)}</td>
                  </tr>
                </table>
                <div style="margin-top:6px; background:#eff6ff; border:1px solid #bfdbfe; padding:6px; border-radius:4px;">
                  <strong style="font-size:0.7rem;">Medical Implant details (TPA mandatory):</strong>
                  <div style="display:grid; grid-template-columns:1fr 1fr; gap:6px; margin-top:4px; font-size:0.68rem;">
                    <div>Brand: <strong>${itemsInfo.implantBrand}</strong></div>
                    <div>Lot/Batch: <strong class="ws-mono">${itemsInfo.implantLot}</strong></div>
                  </div>
                </div>
              </div>
              ` : ''}
            </div>
          </div>
        </div>

        <div>
          <div class="ws-card" style="border-top:4px solid #10b981;">
            <h4 style="margin:0 0 10px 0; font-size:0.85rem; font-weight:700; text-transform:uppercase; color:var(--text-secondary); border-bottom:1px solid #cbd5e1; padding-bottom:4px;">
              Bill Calculations Panel
            </h4>
            
            <div style="font-size:0.78rem; display:flex; flex-direction:column; gap:4px; line-height:1.7;">
              <div style="display:flex; justify-content:space-between;">
                <span>Gross Accrued Bill:</span>
                <strong class="ws-mono">${formatINR(grossTotal)}</strong>
              </div>
              
              ${isPackageApplied ? `
                <div style="display:flex; justify-content:space-between; color:#2563eb;">
                  <span>(-) Package Discount cap:</span>
                  <strong class="ws-mono">-${formatINR(packageDiscount)}</strong>
                </div>
              ` : ''}

              ${isCGHS ? `
                <div style="display:flex; justify-content:space-between; color:#b45309;">
                  <span>(-) CGHS rate difference deduction:</span>
                  <strong class="ws-mono">-${formatINR(rateDifference)}</strong>
                </div>
              ` : ''}

              ${roomLimitExcess > 0 ? `
                <div style="display:flex; justify-content:space-between; color:var(--color-danger);">
                  <span>(+) Room Rent Excess:</span>
                  <strong class="ws-mono">+${formatINR(roomLimitExcess)}</strong>
                </div>
              ` : ''}

              ${copayDeduction > 0 ? `
                <div style="display:flex; justify-content:space-between; color:var(--color-danger);">
                  <span>(-) Co-payment Deduction (${copayPct}%):</span>
                  <strong class="ws-mono">-${formatINR(copayDeduction)}</strong>
                </div>
              ` : ''}

              <div style="display:flex; justify-content:space-between; color:#4f46e5; border-top:1px dashed #cbd5e1; padding-top:4px; align-items:center;">
                <div>
                  <span>(+) GST / Tax Amount:</span>
                  ${(!isIcuCategory && bedRate > 5000) ? `<br/><span style="font-size:0.65rem; color:#64748b;">(non-ICU Room &gt; ₹5000/day: 5% applied, ITC=0)</span>` : ''}
                  ${bill.taxOverrideReason ? `<br/><span style="font-size:0.65rem; color:#b45309;">(Override: ${bill.taxOverrideReason})</span>` : ''}
                </div>
                <div style="display:flex; align-items:center; gap:6px;">
                  <strong class="ws-mono">+${formatINR(gstAmount)}</strong>
                  ${(window.activeBillingRole === 'BILLING_SUPERVISOR' || window.activeBillingRole === 'Super Admin') ? `
                    <button class="btn btn-secondary" onclick="window.triggerTaxOverride('${bill.id}')" style="padding:2px 4px; font-size:0.65rem; cursor:pointer;">Override</button>
                  ` : ''}
                </div>
              </div>

              <div style="display:flex; justify-content:space-between; font-weight:bold; border-top:1px dashed #cbd5e1; padding-top:4px; margin-top:2px;">
                <span>Net Bill Amount:</span>
                <strong class="ws-mono">${formatINR(netBillAmount)}</strong>
              </div>

              <div style="display:flex; justify-content:space-between; color:#64748b;">
                <span>(-) Deposit Adjusted:</span>
                <strong class="ws-mono">-${formatINR(depositAdjusted)}</strong>
              </div>

              ${payerExpected > 0 ? `
                <div style="display:flex; justify-content:space-between; color:#7c3aed;">
                  <span>(-) Expected Payer / TPA settlement:</span>
                  <strong class="ws-mono">-${formatINR(payerExpected)}</strong>
                </div>
              ` : ''}

              <div style="display:flex; justify-content:space-between; font-weight:800; font-size:0.95rem; border-top:2px solid #cbd5e1; padding-top:6px; margin-top:4px; color:#ef4444;">
                <span>Patient Payable (Cash):</span>
                <strong class="ws-mono">${formatINR(Math.max(0, patientPayable - bill.paid))}</strong>
              </div>
            </div>

            ${!isPaid ? `
              <div style="margin-top:12px; border-top:1px dashed #cbd5e1; padding-top:10px;">
                <label style="font-size:0.75rem; font-weight:bold;">Collect Payment Mode</label>
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:6px; margin-top:4px;">
                  <select id="ws-payment-mode" class="form-select" style="font-size:0.75rem; height:32px;">
                    <option value="UPI">UPI</option>
                    <option value="Cash">Cash</option>
                    <option value="Card">Card</option>
                  </select>
                  <button class="btn btn-primary" onclick="window.triggerCollectPayment('${bill.id}', ${patientPayable - bill.paid})" style="font-size:0.72rem; font-weight:700; height:32px;">Collect & Print</button>
                </div>
              </div>
            ` : `
              <div style="margin-top:12px; background-color:#ecfdf5; border:1px solid #10b981; border-radius:6px; padding:10px; color:#065f46; font-size:0.74rem; text-align:left; line-height:1.5;">
                <div style="font-weight:800; display:flex; align-items:center; gap:6px; margin-bottom:4px; color:#0f766e; font-size:0.78rem;">
                  <span>✅</span> Bill Paid
                </div>
                <div style="color:#0f766e; font-size:0.72rem;">
                  <strong>Date/Time:</strong> ${formattedPayDate} at ${formattedPayTime}<br>
                  <strong>Payment Mode:</strong> ${payMode} ${payTxnId ? `(Txn Ref: ${payTxnId})` : ''}
                </div>
              </div>
            `}

            <div style="display:grid; grid-template-columns:1fr 1fr; gap:6px; margin-top:12px; border-top:1px dashed #cbd5e1; padding-top:10px;">
              ${!isPaid ? `
                <button class="btn btn-secondary" onclick="alert('Interim bill draft saved.')" style="font-size:0.72rem; height:28px;">Save Draft</button>
                <button class="btn btn-secondary" onclick="window.triggerRaiseInterimBill('${bill.id}')" style="font-size:0.72rem; height:28px;">Interim Bill</button>
              ` : ''}
              <button class="btn btn-secondary" onclick="window.mockPrintInvoice('${bill.id}')" style="font-size:0.72rem; height:28px;">Print Bill</button>
              ${window.activeBillingRole === 'BILLING_SUPERVISOR' ? `
                <button class="btn btn-primary" onclick="window.triggerCancelBill('${bill.id}')" style="font-size:0.72rem; height:28px; background:var(--color-danger); border-color:var(--color-danger);">Cancel Bill</button>
              ` : ''}
            </div>
          </div>
        </div>

      </div>
    </div>
  `;
}

window.triggerCollectPayment = function(id, payable) {
  const mode = document.getElementById('ws-payment-mode').value;
  const bill = state.billing.find(b => b.id === id);
  if (!bill) return;

  const modal = window.getOrCreateBillingModal();
  modal.style.display = 'flex';
  modal.innerHTML = `
    <div class="modal-box" style="max-width:480px; padding:1.5rem; border-radius:12px; background:white; border:1px solid #cbd5e1; box-shadow:0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);">
      <div style="text-align:center; padding:10px 0;">
        <div style="font-size:2.5rem; margin-bottom:8px; animation: pulse 1.5s infinite;">⏳</div>
        <h4 style="margin:0 0 4px 0; font-weight:700; font-family:var(--font-display); color:#1e293b;">Waiting for payment...</h4>
        <p style="font-size:0.78rem; color:#64748b; margin:0 0 16px 0;">Patient Payable: <strong style="color:#ef4444; font-size:0.85rem;">${formatINR(payable)}</strong> via <strong>${mode}</strong></p>
      </div>

      <div class="form-group" style="margin-bottom:1.2rem;">
        <label style="font-size:0.75rem; font-weight:700; color:#475569; margin-bottom:4px; display:block;">Enter Transaction ID / Reference Number</label>
        <input type="text" id="ws-collect-txid" class="form-control" placeholder="e.g. TXN99882231" style="font-size:0.8rem; height:36px; padding:0 8px; border-radius:4px; width:100%; border:1px solid #cbd5e1;" />
      </div>

      <div style="display:flex; gap:0.5rem; margin-top:1.5rem;">
        <button class="btn btn-secondary" style="flex:1; height:36px; font-size:0.8rem; font-weight:600;" onclick="window.closeBillingModal()">Cancel</button>
        <button class="btn btn-primary" style="flex:1; height:36px; font-size:0.8rem; font-weight:700;" onclick="window.confirmCollectPayment('${id}', ${payable}, '${mode}')">Confirm Transaction</button>
      </div>
    </div>
  `;
};

window.confirmCollectPayment = function(id, payable, mode) {
  const txid = document.getElementById('ws-collect-txid').value.trim();
  if (!txid) {
    alert("Please enter a valid Transaction ID / Reference Number to confirm the payment.");
    return;
  }

  const bill = state.billing.find(b => b.id === id);
  if (!bill) return;

  const patForBill = (window.state.patients || []).find(p => p.uhid === bill.uhid);
  const isSponsor = bill.paymentCategory === 'Insurance' || patForBill?.payer?.includes('CGHS') || patForBill?.payer?.includes('ECHS');

  if (isSponsor && !bill.buyerGstin) {
    const gstinInput = prompt("B2B Finalization: Enter Buyer GSTIN to finalize corporate/TPA invoice:");
    if (!gstinInput || gstinInput.trim().length < 10) {
      alert("B2B Finalization Blocked: Insurer/Scheme GSTIN is mandatory for claims settlement.");
      return;
    }
    bill.buyerGstin = gstinInput.trim().toUpperCase();
  }

  // Generate sequential GST Invoice Series number
  if (!bill.gstInvoiceId) {
    const seriesNo = String((window.state.gstInvoiceSeries || []).length + 1).padStart(4, '0');
    const gstInvId = `GST-INV-2026-${seriesNo}`;
    bill.gstInvoiceId = gstInvId;
    if (!window.state.gstInvoiceSeries) window.state.gstInvoiceSeries = [];
    window.state.gstInvoiceSeries.push({
      gst_invoice_id: gstInvId,
      bill_id: bill.id,
      buyer_gstin: bill.buyerGstin || null,
      invoice_series: gstInvId,
      invoice_date: new Date().toISOString().split('T')[0]
    });
    localStorage.setItem('saronil_gstInvoiceSeries', JSON.stringify(window.state.gstInvoiceSeries));
  }

  if (bill) {
    bill.paid += payable;
    bill.status = "Paid";
    bill.paymentDate = new Date().toISOString();
    bill.paymentMode = mode;
    bill.paymentTxnId = txid;
    bill.auditLogs.push({
      timestamp: new Date().toISOString(),
      user: "Cashier",
      action: `Collected patient payable of ₹${payable} via ${mode} (Txn Ref: ${txid})`
    });

    // Log to patient engagement timeline
    if (window.logPatientTimeline && bill.uhid) {
      window.logPatientTimeline(bill.uhid, {
        type: 'billing',
        icon: '💳',
        title: 'Payment Collected',
        desc: `₹${payable.toLocaleString('en-IN')} collected via ${mode} against Invoice ${id} (Txn: ${txid}). Bill status: Paid.`
      });
    }

    // Update IPD admission request to Paid/Confirmed
    if (bill.id.startsWith('REQ-') || bill.id.startsWith('INV-DEP-') || (bill.items && bill.items.some(item => item.desc && item.desc.includes('IPD Admission Advance Deposit')))) {
      window.state.admissionRequests = window.state.admissionRequests || [];
      const req = window.state.admissionRequests.find(r => r.uhid === bill.uhid);
      if (req) {
        req.advancePaid = true;
        req.status = 'Confirmed';
        req.depositAmount = bill.amount;
        req.depositReceiptId = 'DEP-REC-' + String(Math.floor(100000 + Math.random() * 900000));
        localStorage.setItem('saronil_admissionRequests', JSON.stringify(window.state.admissionRequests));
      }

      // Also register or top up in the billingAdvances ledger if it was a REQ- request
      if (bill.id.startsWith('REQ-')) {
        let adv = window.state.billingAdvances.find(a => a.uhid === bill.uhid);
        if (adv) {
          adv.deposited += payable;
          adv.balance += payable;
          adv.daysSinceTopup = 0;
          adv.status = adv.balance >= 5000 ? "Active" : (adv.balance >= 2000 ? "Low Balance" : "Exhausted");
        } else {
          adv = {
            name: bill.patientName,
            uhid: bill.uhid,
            admDate: new Date().toLocaleDateString('en-CA'),
            deposited: payable,
            adjusted: 0,
            balance: payable,
            daysSinceTopup: 0,
            status: payable >= 5000 ? "Active" : (payable >= 2000 ? "Low Balance" : "Exhausted")
          };
          window.state.billingAdvances.push(adv);
        }
        localStorage.setItem('saronil_billingAdvances', JSON.stringify(window.state.billingAdvances));
      }
    }

    // Update OPD Appointment to Booked / Checked-in/Registered, and add to queues
    if (bill.id.startsWith('INV-APT-') || (bill.items && bill.items.some(item => item.desc && item.desc.includes('OPD Consultation Fee')))) {
      window.state.appointments = window.state.appointments || [];
      const appt = window.state.appointments.find(a => (a.invoiceId === bill.id || a.uhid === bill.uhid) && a.status === 'Pending Payment');
      if (appt) {
        appt.status = 'Booked';
        localStorage.setItem('saronil_appointments', JSON.stringify(window.state.appointments));

        // Add to OPD Queue
        window.state.opdQueue = window.state.opdQueue || [];
        const existingQueue = window.state.opdQueue.find(q => q.uhid === appt.uhid);
        if (!existingQueue) {
          window.state.opdQueue.push({
            token: 'OPD-TK-' + String(100 + window.state.opdQueue.length + 1),
            patient: appt.patientName,
            uhid: appt.uhid,
            doctor: appt.doctorName,
            speciality: appt.spec,
            status: 'Waiting',
            time: appt.time,
            waitTime: 0
          });
          localStorage.setItem('saronil_opdQueue', JSON.stringify(window.state.opdQueue));
        }

        // Add/update the patient object in the master registry so they show up in EMR/Doctor queue
        let pat = window.state.patients.find(p => p.uhid === appt.uhid);
        if (pat) {
          pat.type = 'OPD';
          pat.status = 'Registered';
          pat.primaryConsultant = appt.doctorName;
          pat.department = appt.spec;
        } else {
          pat = {
            uhid: appt.uhid,
            name: appt.patientName,
            type: 'OPD',
            status: 'Registered',
            primaryConsultant: appt.doctorName,
            department: appt.spec,
            mobile: bill.mobile || '+91 98765 43210',
            age: 38,
            gender: 'Male',
            bloodGroup: 'O+',
            clinicalData: { diagnosis: 'OPD consultation' },
            timelineEvents: []
          };
          window.state.patients.push(pat);
        }
        localStorage.setItem('saronil_patients', JSON.stringify(window.state.patients));
      }
    }    localStorage.setItem('saronil_billing', JSON.stringify(state.billing));
    if (window.state.syncOutstandingBills) {
      window.state.syncOutstandingBills();
    }
    const modal = window.getOrCreateBillingModal();
    modal.innerHTML = `
      <div class="modal-box" style="max-width:480px; padding:1.5rem; border-radius:12px; background:white; border:1px solid #cbd5e1; box-shadow:0 20px 25px -5px rgba(0, 0, 0, 0.1); text-align:center;">
        <div style="font-size:3rem; margin-bottom:12px; color:var(--color-success);">✅</div>
        <h4 style="margin:0 0 6px 0; font-weight:800; font-family:var(--font-display); color:#0f172a;">Co-payment Received Successfully!</h4>
        <p style="font-size:0.8rem; color:#475569; margin:0 0 12px 0;">Co-payment of <strong>${formatINR(payable)}</strong> has been successfully logged.</p>
        
        <div style="background:#f0fdf4; border:1px solid #bbf7d0; border-radius:6px; padding:10px; margin-bottom:20px; font-size:0.75rem; color:#15803d; line-height:1.4;">
          📢 Same confirmation has been shared with the patient via SMS & WhatsApp notifications.
        </div>

        <div style="display:flex; flex-direction:column; gap:8px;">
          <a href="javascript:void(0)" onclick="window.mockPrintInvoice('${id}')" style="font-size:0.82rem; font-weight:700; color:var(--primary); text-decoration:underline; display:block; padding:8px 0;">
            📥 Download Invoice Statement (PDF)
          </a>
          <button class="btn btn-primary" style="height:36px; font-size:0.8rem; font-weight:700; width:100%; margin-top:10px;" onclick="window.finishPaymentWorkflow()">
            Close Workspace
          </button>
        </div>
      </div>
    `;
  }
};

window.finishPaymentWorkflow = function() {
  window.closeBillingModal();
  const container = document.getElementById('main-content');
  if (container) {
    window.views.billing(container);
  }
  router.navigate('billing');
};

window.triggerRaiseInterimBill = async function(id) {
  const bill = state.billing.find(b => b.id === id);
  if (bill) {
    bill.auditLogs.push({ timestamp: new Date().toISOString(), user: "Billing Executive", action: "Interim bill generated & dispatched to patient ward" });
    await customAlert("Interim bill copy printed & dispatched to ward coordinator.");
    router.navigate('billing');
  }
};

window.triggerCancelBill = async function(id) {
  const confirmCancel = await customConfirm(`Are you sure you want to request cancellation for bill ${id}? This will void all records.`);
  if (confirmCancel) {
    const reason = await customPrompt("Enter billing void/cancellation reason notes:");
    if (reason) {
      const bill = state.billing.find(b => b.id === id);
      window.state.billingPendingApprovals.push({
        id: "REQ-CAN-0" + (window.state.billingPendingApprovals.length + 1),
        targetId: id,
        name: bill ? bill.patientName : "Patient",
        amount: bill ? bill.amount : 0,
        reason: reason,
        raisedBy: window.activeBillingRole,
        status: "Pending"
      });
      await customAlert("Bill cancellation request queued to Supervisor approval workflow.");
      router.navigate('billing');
    }
  }
};

window.mockPrintInvoice = function(invoiceId) {
  const bill = state.billing.find(b => b.id === invoiceId);
  if (!bill) return;

  const patForBill = (window.state.patients || []).find(p => p.uhid === bill.uhid);
  const wardKey = patForBill?.wardKey || (bill.paymentCategory === 'Insurance' ? 'SEMI-PRIVATE' : 'GENERAL-WARD-M');
  const wardRateEntry = (window.WARD_RATES || {})[wardKey];
  const bedRate = wardRateEntry ? wardRateEntry.rate : 1200;
  const nursingRate = wardRateEntry ? (wardRateEntry.nursingRate || 0) : 500;
  const bedDays = 6;

  const itemsInfo = getPatientBillingItems(bill, patForBill, bedRate, nursingRate, bedDays);

  const roomCharges = itemsInfo.roomCharges;
  const visitingFees = itemsInfo.visitingFees;
  const nurseCharges = itemsInfo.nurseCharges;
  const otCharges = itemsInfo.otCharges;
  const pharmacyCharges = itemsInfo.pharmacyCharges;
  const consumables = itemsInfo.consumables;

  // Compile full itemised list matches the workspace
  const printedItems = [];
  if (roomCharges > 0) {
    printedItems.push({ name: "Ward Bed Rent Charges", code: "SAC 999311", details: `${patForBill?.ward || 'General Ward'} Bed Rent - ${bedDays} Days @ ${formatINR(bedRate)}/day`, total: roomCharges });
  }
  if (visitingFees > 0) {
    printedItems.push({ name: "Clinical Consultant Fees", code: "SAC 999312", details: `${bill.doctorName} (${patForBill?.department || 'Medicine'}) - ${bill.visitType === 'IPD' ? '2 Visits @ ' + formatINR(800) : '1 Visit @ ' + formatINR(visitingFees)}`, total: visitingFees });
  }
  if (nurseCharges > 0) {
    printedItems.push({ name: "Nursing Care Tariff", code: "SAC 999312", details: `${patForBill?.ward || 'General Ward'} Nursing Professional Charges & Care (6 days)`, total: nurseCharges });
  }

  if (otCharges > 0) {
    printedItems.push({ name: "Operation Theatre Charges", code: "SAC 999315", details: "OT Room & Specialist Anesthetic Equipment Charges", total: otCharges });
  }

  // Dynamic LIS labs
  if (itemsInfo.labTotal > 0) {
    const labDetails = itemsInfo.labItems.map(item => `${item.name} (${formatINR(item.rate)})`).join(' + ');
    printedItems.push({ name: "Laboratory Investigations", code: "SAC 999316", details: labDetails, total: itemsInfo.labTotal });
  }

  // Dynamic RIS radiology
  if (itemsInfo.radTotal > 0) {
    const radDetails = itemsInfo.radItems.map(item => `${item.name} (${formatINR(item.rate)})`).join(' + ');
    printedItems.push({ name: "Radiology Investigations", code: "SAC 999317", details: radDetails, total: itemsInfo.radTotal });
  }

  // Pharmacy
  if (pharmacyCharges > 0) {
    printedItems.push({ name: "Pharmacy & Medicines", code: "SAC 999318", details: itemsInfo.pharmacyDesc, total: pharmacyCharges });
  }

  if (consumables > 0) {
    printedItems.push({ name: "Consumables Log", code: "SAC 999319", details: `IPD Admission Kit & Ward Consumables (Implant: ${itemsInfo.implantBrand})`, total: consumables });
  }

  const grossTotal = printedItems.reduce((acc, x) => acc + x.total, 0);
  const activePkg = window.state.billingPackages.find(p => p.name === bill.patientName);
  const isPackageApplied = activePkg && activePkg.status !== "Conflict";
  const packageDiscount = isPackageApplied ? (grossTotal - activePkg.pkgAmt) : 0;
  const isCGHS = patForBill?.payer?.includes('CGHS') || patForBill?.payer?.includes('ECHS');
  const rateDifference = isCGHS ? Math.max(0, bedRate - 1000) * bedDays : 0;
  const roomLimitExcess = (bill.paymentCategory === 'Insurance' && bedRate > 3000) ? (bedRate - 3000) * bedDays : 0;
  const copayPct = (bill.paymentCategory === 'Insurance') ? 10 : 0;
  const discountableAmt = grossTotal - packageDiscount - rateDifference - roomLimitExcess;
  const copayDeduction = discountableAmt * (copayPct / 100);

  // Healthcare GST Compliance calculations in print preview
  const wardName = patForBill?.ward || '';
  const isIcuCategory = wardName.toLowerCase().includes('icu') || wardName.toLowerCase().includes('ccu') || wardName.toLowerCase().includes('hdu');
  let roomGst = 0;
  if (!isIcuCategory && bedRate > 5000) {
    roomGst = (bedRate * bedDays) * 0.05;
  }
  
  let packageGst = 0;
  if (isPackageApplied && activePkg) {
    const pkgLower = activePkg.package.toLowerCase();
    if (pkgLower.includes('cosmetic') || pkgLower.includes('wellness') || pkgLower.includes('corporate')) {
      packageGst = activePkg.pkgAmt * 0.18;
    }
  }

  const gstAmount = bill.taxOverrideAmount !== undefined ? bill.taxOverrideAmount : (roomGst + packageGst);
  const netBillAmount = grossTotal - packageDiscount - rateDifference - roomLimitExcess - copayDeduction + gstAmount;
  const depositAdjusted = Math.min(netBillAmount, bill.advancePaid || 0);
  const payerExpected = (bill.paymentCategory === 'Insurance' || isCGHS) ? (netBillAmount - depositAdjusted) : 0;
  const patientPayable = Math.max(0, netBillAmount - depositAdjusted - payerExpected);

  const w = window.open('', '_blank', 'width=800,height=800');
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
          .summary-table { margin-left: auto; width: 340px; font-size: 0.85rem; line-height: 1.8; margin-top: 10px; }
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
              <div style="font-size: 0.85rem; font-weight: 700; color: #475569;">Invoice ID: ${bill.id}${bill.gstInvoiceId ? `<br><span style="color:#4f46e5;">GST Invoice ID: ${bill.gstInvoiceId}</span>` : ''}</div>
              <div style="font-size: 0.8rem; color: #64748b;">Date: ${bill.date}</div>
            </div>
          </div>

          <div class="meta-grid">
            <div>
              <h4 style="margin: 0 0 5px 0; color: #1e3a8a; font-size: 0.9rem;">Patient Information</h4>
              <strong>Name:</strong> ${bill.patientName}<br>
              <strong>UHID:</strong> ${bill.uhid} | <strong>Gender/Age:</strong> ${patForBill?.gender || 'Male'} / ${patForBill?.age || '45'}<br>
              <strong>Primary Consultant:</strong> ${bill.doctorName}
            </div>
            <div>
              <h4 style="margin: 0 0 5px 0; color: #1e3a8a; font-size: 0.9rem;">Sponsor / Insurance Details</h4>
              <strong>Payer Category:</strong> ${bill.paymentCategory}<br>
              <strong>TPA Company:</strong> ${bill.paymentCategory === 'Insurance' ? (bill.insuranceDetails?.provider || 'Star Health') : 'Self Pay / Cash'}<br>
              <strong>Pre-Auth Status:</strong> ${bill.paymentCategory === 'Insurance' ? 'Approved (PA-99231)' : 'N/A'}${bill.buyerGstin ? `<br><strong>Buyer GSTIN:</strong> <span style="font-family:monospace;">${bill.buyerGstin}</span>` : ''}
            </div>
          </div>

          <h3 style="color: #1e3a8a; border-bottom: 1px solid #cbd5e1; padding-bottom: 5px; margin-top: 20px; font-size: 0.95rem; text-transform: uppercase;">Itemised Service Accruals</h3>
          <table class="bill-table">
            <thead>
              <tr>
                <th style="width: 50%;">Service Description / SAC Code</th>
                <th style="width: 10%; text-align: center;">Qty</th>
                <th style="width: 20%; text-align: right;">Unit Rate</th>
                <th style="width: 20%; text-align: right;">Total Amount</th>
              </tr>
            </thead>
            <tbody>
              ${printedItems.map(item => `
                <tr style="border-bottom:1px dashed #cbd5e1; font-size:0.82rem;">
                  <td style="padding:8px 0;">
                    <strong>${item.name}</strong><br>
                    <span style="font-size:0.72rem; color:#64748b;">${item.details}</span>
                  </td>
                  <td style="padding:8px 0; text-align:center;">1</td>
                  <td style="padding:8px 0; text-align:right;">${formatINR(item.total)}</td>
                  <td style="padding:8px 0; text-align:right; font-weight:700;">${formatINR(item.total)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <h3 style="color: #1e3a8a; border-bottom: 1px solid #cbd5e1; padding-bottom: 5px; margin-top: 20px; font-size: 0.95rem; text-transform: uppercase;">Transaction & Payments Ledger</h3>
          <table class="bill-table">
            <thead>
              <tr>
                <th style="width: 25%;">Receipt Date</th>
                <th style="width: 50%;">Transaction Details / Mode</th>
                <th style="width: 25%; text-align: right;">Amount Adjusted</th>
              </tr>
            </thead>
            <tbody>
              ${bill.advancePaid > 0 ? `
                <tr style="font-size:0.8rem; border-bottom: 1px dashed #cbd5e1;">
                  <td style="padding: 6px 0;">${bill.date}</td>
                  <td>Initial Advance Deposit (Receipt: ADV-9821)</td>
                  <td style="text-align: right; color: #16a34a; font-weight: bold;">-${formatINR(bill.advancePaid)}</td>
                </tr>
              ` : ''}
              ${bill.paid > 0 ? `
                <tr style="font-size:0.8rem; border-bottom: 1px dashed #cbd5e1;">
                  <td style="padding: 6px 0;">${new Date().toISOString().split('T')[0]}</td>
                  <td>Co-pay Settlement Payment (UPI/Cash receipt)</td>
                  <td style="text-align: right; color: #16a34a; font-weight: bold;">-${formatINR(bill.paid)}</td>
                </tr>
              ` : ''}
              ${payerExpected > 0 ? `
                <tr style="font-size:0.8rem; border-bottom: 1px dashed #cbd5e1;">
                  <td style="padding: 6px 0;">${bill.date}</td>
                  <td>TPA Pre-Auth Claim Submission (${bill.paymentCategory === 'Insurance' ? 'Star Health' : 'CGHS Panel'})</td>
                  <td style="text-align: right; color: #4f46e5; font-weight: bold;">-${formatINR(payerExpected)}</td>
                </tr>
              ` : ''}
              <tr style="font-size:0.85rem; font-weight: bold; background: #f8fafc;">
                <td colspan="2" style="padding: 8px;">Remaining Patient Outstanding:</td>
                <td style="text-align: right; padding: 8px; color: ${patientPayable <= 0 ? '#16a34a' : '#ef4444'};">${formatINR(patientPayable)}</td>
              </tr>
            </tbody>
          </table>

          <div style="display: flex; justify-content: space-between; margin-top:20px;">
            <div style="font-size: 0.78rem; max-width: 400px; color: #64748b; line-height:1.4;">
              <strong>Declaration:</strong> We declare that this invoice shows the actual price of the services described and that all particulars are true and correct. Corrective adjustments require billing supervisor vetting.
            </div>
            <table class="summary-table">
              <tr>
                <td>Gross Accrued Bill:</td>
                <td>${formatINR(grossTotal)}</td>
              </tr>
              ${isPackageApplied ? `
                <tr style="color:#2563eb;">
                  <td>Package Discount:</td>
                  <td>-${formatINR(packageDiscount)}</td>
                </tr>
              ` : ''}
              ${isCGHS ? `
                <tr style="color:#b45309;">
                  <td>CGHS Rate Diff:</td>
                  <td>-${formatINR(rateDifference)}</td>
                </tr>
              ` : ''}
              ${roomLimitExcess > 0 ? `
                <tr style="color:#ef4444;">
                  <td>Room Rent Excess:</td>
                  <td>+${formatINR(roomLimitExcess)}</td>
                </tr>
              ` : ''}
              ${copayDeduction > 0 ? `
                <tr style="color:#ef4444;">
                  <td>Co-payment (${copayPct}%):</td>
                  <td>-${formatINR(copayDeduction)}</td>
                </tr>
              ` : ''}
              ${gstAmount > 0 ? `
                <tr style="color:#4f46e5;">
                  <td>GST / Taxes (Healthcare Composite):</td>
                  <td>+${formatINR(gstAmount)}</td>
                </tr>
              ` : ''}
              <tr style="border-top: 1px solid #cbd5e1; font-size: 1rem; color: #1e3a8a;">
                <td>Net Invoice Amount:</td>
                <td>${formatINR(netBillAmount)}</td>
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

window.getOrCreateBillingModal = function() {
  let modal = document.getElementById('billing-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'billing-modal';
    modal.style.position = 'fixed';
    modal.style.inset = '0';
    modal.style.backgroundColor = 'rgba(15, 23, 42, 0.5)';
    modal.style.zIndex = '999';
    modal.style.display = 'none';
    modal.style.justifyContent = 'center';
    modal.style.alignItems = 'center';
    modal.style.backdropFilter = 'blur(4px)';
    document.body.appendChild(modal);
  }
  return modal;
};

window.showNewBillModal = function() {
  const modal = window.getOrCreateBillingModal();
  modal.style.display = 'flex';
  modal.innerHTML = `
    <div class="modal-box" style="max-width:500px; padding:1.5rem; border-radius:8px; background:white; border:1px solid #cbd5e1; box-shadow:0 10px 15px -3px rgba(0, 0, 0, 0.1); position:relative;">
      <h4 style="margin:0 0 1rem 0; font-weight:700; font-family:var(--font-display); color:#1e293b; display:flex; align-items:center; gap:8px;">
        <span>➕</span> Initialize IPD Billing Session
      </h4>
      <div class="form-group" style="margin-bottom:1rem; position:relative;">
        <label style="font-size:0.75rem; font-weight:700; color:#475569; margin-bottom:4px; display:block;">Search Admitted Patient</label>
        <input type="text" id="modal-patient-search" class="form-control" placeholder="Type patient name or UHID..." style="font-size:0.8rem; height:36px; padding:0 8px; border-radius:4px; width:100%; border:1px solid #cbd5e1;" autocomplete="off" />
        <div id="modal-search-results" style="max-height: 180px; overflow-y: auto; border: 1px solid #cbd5e1; border-radius: 4px; margin-top: 4px; display: none; background: white; position: relative; width: 100%; z-index: 10; margin-bottom: 8px;"></div>
      </div>
      <div class="form-group" style="margin-bottom:1rem;">
        <label style="font-size:0.75rem; font-weight:700; color:#475569; margin-bottom:4px; display:block;">Visit Type</label>
        <select id="newbill-type" class="form-select" style="font-size:0.8rem; height:36px; padding:0 8px; border-radius:4px;">
          <option value="IPD" selected>IPD Admission</option>
          <option value="OPD">OPD Consultation</option>
          <option value="Emergency">Emergency Room</option>
          <option value="Day Care">Day Care Unit</option>
        </select>
      </div>
      <div style="display:flex; gap:0.5rem; margin-top:1.5rem;">
        <button class="btn btn-secondary" style="flex:1; height:36px; font-size:0.8rem; font-weight:600;" onclick="window.closeBillingModal()">Cancel</button>
        <button class="btn btn-primary" style="flex:1; height:36px; font-size:0.8rem; font-weight:700;" onclick="window.confirmNewBill()">Initialize Bill</button>
      </div>
    </div>
  `;

  window.setupModalPatientSearch('newbill');

  // Pre-fill with the first admitted patient
  const admittedPat = state.patients.find(p => p.status === 'Admitted');
  if (admittedPat) {
    const input = document.getElementById('modal-patient-search');
    if (input) {
      input.value = `${admittedPat.name} (${admittedPat.uhid})`;
      input.dataset.selectedId = admittedPat.uhid;
    }
  }
};

window.confirmNewBill = function() {
  const uhid = document.getElementById('modal-patient-search').dataset.selectedId;
  if (!uhid) {
    alert("Please select a patient from the search results dropdown.");
    return;
  }
  const visitType = document.getElementById('newbill-type').value;
  const patient = state.patients.find(p => p.uhid === uhid);

  if (patient) {
    const newId = "INV" + String(8000 + state.billing.length + 1);
    state.billing.unshift({
      id: newId,
      uhid: patient.uhid,
      patientName: patient.name,
      date: new Date().toISOString().split('T')[0],
      amount: visitType === 'OPD' ? 600 : 45200, // Pre-fill with a default accrued estimate
      paid: 0,
      status: "Outstanding",
      visitType,
      admissionNo: visitType === 'IPD' ? "ADM" + String(5000 + state.billing.length) : "",
      doctorName: patient.primaryConsultant || "Dr. Rajesh Singh",
      department: patient.department || "General Medicine",
      paymentCategory: patient.payerType || "Self Pay",
      advancePaid: visitType === 'OPD' ? 0 : (patient.payerType === 'Self Pay' ? 15000 : 0),
      discountAmount: 0,
      gstAmount: 0,
      items: [],
      auditLogs: [{ timestamp: new Date().toISOString(), user: window.activeBillingRole, action: "Invoice Initialized" }]
    });

    window.closeBillingModal();
    
    // Switch to Billing Queue tab and re-render
    window.activeBillingTab = "billing_queue";
    const container = document.getElementById('main-content');
    if (container) {
      window.views.billing(container);
    }
    
    // Navigate directly to invoice workspace
    window.router.navigate(`billing-workspace?id=${newId}`);
  }
};

window.showApplyPackageModal = function() {
  const modal = window.getOrCreateBillingModal();
  modal.style.display = 'flex';
  modal.innerHTML = `
    <div class="modal-box" style="max-width:500px; padding:1.5rem; border-radius:8px; background:white; border:1px solid #cbd5e1; box-shadow:0 10px 15px -3px rgba(0, 0, 0, 0.1); position:relative;">
      <h4 style="margin:0 0 1rem 0; font-weight:700; font-family:var(--font-display); color:#1e293b; display:flex; align-items:center; gap:8px;">
        <span>📦</span> Apply Surgical Package to Patient
      </h4>
      <div class="form-group" style="margin-bottom:1rem; position:relative;">
        <label style="font-size:0.75rem; font-weight:700; color:#475569; margin-bottom:4px; display:block;">Search Patient (Active Billing)</label>
        <input type="text" id="modal-patient-search" class="form-control" placeholder="Type patient name or invoice ID..." style="font-size:0.8rem; height:36px; padding:0 8px; border-radius:4px; width:100%; border:1px solid #cbd5e1;" autocomplete="off" />
        <div id="modal-search-results" style="max-height: 180px; overflow-y: auto; border: 1px solid #cbd5e1; border-radius: 4px; margin-top: 4px; display: none; background: white; position: relative; width: 100%; z-index: 10; margin-bottom: 8px;"></div>
      </div>
      <div class="form-group" style="margin-bottom:1rem;">
        <label style="font-size:0.75rem; font-weight:700; color:#475569; margin-bottom:4px; display:block;">Select Surgical Package</label>
        <select id="applypkg-package" class="form-select" style="font-size:0.8rem; height:36px; padding:0 8px; border-radius:4px;">
          <option value="Appendicectomy|45000">Appendicectomy Package (₹45,000.00)</option>
          <option value="Normal Delivery|35000">Normal Delivery Package (₹35,000.00)</option>
          <option value="LSCS Private Room Package|65000">LSCS Private Room Package (₹65,000.00)</option>
          <option value="Coronary Angioplasty|120000">Coronary Angioplasty (₹1,20,000.00)</option>
          <option value="Cholecystectomy Package|50000">Cholecystectomy Package (₹50,000.00)</option>
        </select>
      </div>
      <div style="display:flex; gap:0.5rem; margin-top:1.5rem;">
        <button class="btn btn-secondary" style="flex:1; height:36px; font-size:0.8rem; font-weight:600;" onclick="window.closeBillingModal()">Cancel</button>
        <button class="btn btn-primary" style="flex:1; height:36px; font-size:0.8rem; font-weight:700;" onclick="window.confirmApplyPackage()">Apply Package</button>
      </div>
    </div>
  `;

  window.setupModalPatientSearch('applypkg');

  // Pre-fill with the first active billing record
  const firstBill = state.billing[0];
  if (firstBill) {
    const input = document.getElementById('modal-patient-search');
    if (input) {
      input.value = `${firstBill.patientName} (${firstBill.id})`;
      input.dataset.selectedId = firstBill.id;
    }
  }
};

window.confirmApplyPackage = function() {
  const billId = document.getElementById('modal-patient-search').dataset.selectedId;
  if (!billId) {
    alert("Please select a patient from the search results dropdown.");
    return;
  }
  const packageVal = document.getElementById('applypkg-package').value;
  const [packageName, packageAmtStr] = packageVal.split('|');
  const packageAmt = parseFloat(packageAmtStr);

  const bill = state.billing.find(b => b.id === billId);
  if (bill) {
    // Add or update package record in billingPackages
    const existingIdx = window.state.billingPackages.findIndex(p => p.name === bill.patientName);
    const newPkg = {
      name: bill.patientName,
      package: packageName,
      pkgAmt: packageAmt,
      actuals: bill.amount || 32000,
      variance: (bill.amount || 32000) - packageAmt,
      pct: Math.round((((bill.amount || 32000) - packageAmt) / packageAmt) * 100),
      status: (bill.amount || 32000) > packageAmt ? "Conflict" : "Underuse"
    };

    if (existingIdx >= 0) {
      window.state.billingPackages[existingIdx] = newPkg;
    } else {
      window.state.billingPackages.unshift(newPkg);
    }

    // Update bill details in state
    bill.amount = packageAmt; 
    bill.auditLogs.push({
      timestamp: new Date().toISOString(),
      user: window.activeBillingRole,
      action: `Applied Package: ${packageName} (₹${packageAmt})`
    });

    alert(`Successfully applied package "${packageName}" (₹${packageAmt}) to ${bill.patientName}'s bill!`);
    window.closeBillingModal();

    // Switch to Package Billing tab and re-render
    window.activeBillingTab = "package_billing";
    const container = document.getElementById('main-content');
    if (container) {
      window.views.billing(container);
    }
  }
};

window.showInterimBillModal = function() {
  const modal = window.getOrCreateBillingModal();
  modal.style.display = 'flex';
  modal.innerHTML = `
    <div class="modal-box" style="max-width:550px; padding:1.5rem; border-radius:8px; background:white; border:1px solid #cbd5e1; box-shadow:0 10px 15px -3px rgba(0, 0, 0, 0.1); position:relative;">
      <h4 style="margin:0 0 1rem 0; font-weight:700; font-family:var(--font-display); color:#1e293b; display:flex; align-items:center; gap:8px;">
        <span>📝</span> Generate Patient Interim Bill Statement
      </h4>
      <div class="form-group" style="margin-bottom:1.2rem; position:relative;">
        <label style="font-size:0.75rem; font-weight:700; color:#475569; margin-bottom:4px; display:block;">Search Patient Name / Invoice ID</label>
        <input type="text" id="modal-patient-search" class="form-control" placeholder="Type patient name or invoice ID..." style="font-size:0.8rem; height:36px; padding:0 8px; border-radius:4px; width:100%; border:1px solid #cbd5e1;" autocomplete="off" />
        <div id="modal-search-results" style="max-height: 180px; overflow-y: auto; border: 1px solid #cbd5e1; border-radius: 4px; margin-top: 4px; display: none; background: white; position: relative; width: 100%; z-index: 10; margin-bottom: 8px;"></div>
      </div>
      
      <div id="interim-preview-container" style="background:#f8fafc; border:1px solid #cbd5e1; border-radius:6px; padding:12px; margin-bottom:1.2rem; font-size:0.75rem;">
        <div style="text-align:center; color:#64748b; padding:15px 0;">Select a patient above to view interim preview</div>
      </div>

      <div style="display:flex; gap:0.5rem; margin-top:1.5rem;">
        <button class="btn btn-secondary" style="flex:1; height:36px; font-size:0.8rem; font-weight:600;" onclick="window.closeBillingModal()">Cancel</button>
        <button class="btn btn-primary" style="flex:1; height:36px; font-size:0.8rem; font-weight:700;" onclick="window.confirmPrintInterim()">Print Interim Statement</button>
      </div>
    </div>
  `;

  window.setupModalPatientSearch('interim');

  // Trigger initial preview with the first active bill
  const firstBill = state.billing[0];
  if (firstBill) {
    const input = document.getElementById('modal-patient-search');
    if (input) {
      input.value = `${firstBill.patientName} (${firstBill.id})`;
      input.dataset.selectedId = firstBill.id;
      window.updateInterimPreview(firstBill.id);
    }
  }
};

window.updateInterimPreview = function(billId) {
  const bill = state.billing.find(b => b.id === billId);
  const preview = document.getElementById('interim-preview-container');
  if (!bill || !preview) return;

  const patForBill = (window.state.patients || []).find(p => p.uhid === bill.uhid);
  const wardKey = patForBill?.wardKey || (bill.paymentCategory === 'Insurance' ? 'SEMI-PRIVATE' : 'GENERAL-WARD-M');
  const wardRateEntry = (window.WARD_RATES || {})[wardKey];
  const bedRate = wardRateEntry ? wardRateEntry.rate : 1200;
  const nursingRate = wardRateEntry ? (wardRateEntry.nursingRate || 0) : 500;
  const bedDays = 6;

  const itemsInfo = getPatientBillingItems(bill, patForBill, bedRate, nursingRate, bedDays);

  const roomCharges = itemsInfo.roomCharges;
  const visitingFees = itemsInfo.visitingFees;
  const nurseCharges = itemsInfo.nurseCharges;
  const pharmacyCharges = itemsInfo.pharmacyCharges;
  const labTotal = itemsInfo.labTotal;
  const radTotal = itemsInfo.radTotal;
  const consumables = itemsInfo.consumables;

  const grossTotal = roomCharges + visitingFees + nurseCharges + pharmacyCharges + labTotal + radTotal + consumables;

  let detailsHtml = '';
  if (bill.visitType === 'OPD') {
    detailsHtml = `
      <div style="display:flex; justify-content:space-between;">
        <span>OPD Consultation Fees:</span>
        <span class="billing-mono">${formatINR(visitingFees)}</span>
      </div>
      <div style="display:flex; justify-content:space-between; font-weight:700; border-top:1px solid #cbd5e1; margin-top:4px; padding-top:4px;">
        <span>Total Accrued Charges:</span>
        <span class="billing-mono">${formatINR(grossTotal)}</span>
      </div>
    `;
  } else {
    detailsHtml = `
      <div style="display:flex; justify-content:space-between;">
        <span>Room/Bed Accruals (${bedDays} days):</span>
        <span class="billing-mono">${formatINR(roomCharges)}</span>
      </div>
      <div style="display:flex; justify-content:space-between;">
        <span>Consultation Fees:</span>
        <span class="billing-mono">${formatINR(visitingFees)}</span>
      </div>
      <div style="display:flex; justify-content:space-between;">
        <span>Nursing Care Tariff:</span>
        <span class="billing-mono">${formatINR(nurseCharges)}</span>
      </div>
      <div style="display:flex; justify-content:space-between;">
        <span>Laboratory Investigations:</span>
        <span class="billing-mono">${formatINR(labTotal)}</span>
      </div>
      <div style="display:flex; justify-content:space-between;">
        <span>Radiology Investigations:</span>
        <span class="billing-mono">${formatINR(itemsInfo.radTotal)}</span>
      </div>
      <div style="display:flex; justify-content:space-between;">
        <span>Pharmacy Dispenses:</span>
        <span class="billing-mono">${formatINR(pharmacyCharges)}</span>
      </div>
      <div style="display:flex; justify-content:space-between;">
        <span>Consumables & Implants:</span>
        <span class="billing-mono">${formatINR(consumables)}</span>
      </div>
      <div style="display:flex; justify-content:space-between; font-weight:700; border-top:1px solid #cbd5e1; margin-top:4px; padding-top:4px;">
        <span>Total Accrued Charges:</span>
        <span class="billing-mono">${formatINR(grossTotal)}</span>
      </div>
    `;
  }

  preview.innerHTML = `
    <div style="font-weight:700; border-bottom:1px solid #e2e8f0; padding-bottom:4px; margin-bottom:6px; text-transform:uppercase; color:#475569; display:flex; justify-content:space-between;">
      <span>Interim Summary Preview</span>
      <span class="billing-mono" style="color:#0f172a;">${bill.id}</span>
    </div>
    <div style="display:grid; grid-template-columns:1fr 1fr; gap:6px; margin-bottom:8px; line-height:1.4;">
      <div>Patient: <strong>${bill.patientName}</strong></div>
      <div>UHID: <strong class="billing-mono">${bill.uhid}</strong></div>
      <div>Visit Type: <strong>${bill.visitType}</strong></div>
      <div>Doctor: <strong>${bill.doctorName}</strong></div>
    </div>
    <div style="border-top:1px dashed #cbd5e1; padding-top:6px; margin-top:6px; line-height:1.6;">
      ${detailsHtml}
    </div>
  `;
};

window.confirmPrintInterim = function() {
  const billId = document.getElementById('modal-patient-search').dataset.selectedId;
  if (!billId) {
    alert("Please select a patient from the search results dropdown.");
    return;
  }
  const bill = state.billing.find(b => b.id === billId);
  if (bill) {
    alert(`Generating Interim Bill Statement for ${bill.patientName} (${bill.id})... Sent to hospital printer queue.`);
    window.closeBillingModal();
  }
};

window.setupModalPatientSearch = function(type) {
  const searchInput = document.getElementById('modal-patient-search');
  const resultsDiv = document.getElementById('modal-search-results');
  if (!searchInput || !resultsDiv) return;

  let dataset = [];
  if (type === 'newbill') {
    dataset = state.patients.map(p => ({
      id: p.uhid,
      label: `${p.name} (${p.uhid})`,
      detail: `${p.status === 'Admitted' ? 'Admitted' : 'Outpatient'} · ${p.ward || 'General Medicine'}`
    }));
  } else if (type === 'applypkg') {
    dataset = state.billing.map(b => ({
      id: b.id,
      label: `${b.patientName} (${b.id})`,
      detail: `UHID: ${b.uhid} · Accrued: ${formatINR(b.amount)}`
    }));
  } else if (type === 'interim') {
    dataset = state.billing.map(b => ({
      id: b.id,
      label: `${b.patientName} (${b.id})`,
      detail: `UHID: ${b.uhid} · Accrued: ${formatINR(b.amount)}`
    }));
  }

  const selectItem = (id, label) => {
    searchInput.value = label;
    searchInput.dataset.selectedId = id;
    resultsDiv.style.display = 'none';

    if (type === 'interim') {
      window.updateInterimPreview(id);
    }
  };

  const renderResults = (query) => {
    const q = query.toLowerCase().trim();
    if (!q) {
      const html = dataset.map(item => `
        <div class="search-result-item" data-id="${item.id}" data-label="${item.label}" style="padding: 8px 12px; font-size: 0.76rem; cursor: pointer; border-bottom: 1px solid #f1f5f9; background: white; transition: background 0.15s;" onmouseover="this.style.background='#f1f5f9'" onmouseout="this.style.background='white'">
          <div style="font-weight: 700; color: #1e293b;">${item.label}</div>
          <div style="font-size: 0.68rem; color: #64748b; margin-top: 1px;">${item.detail}</div>
        </div>
      `).join('');
      resultsDiv.innerHTML = html;
      resultsDiv.style.display = 'block';

      resultsDiv.querySelectorAll('.search-result-item').forEach(el => {
        el.addEventListener('click', () => selectItem(el.dataset.id, el.dataset.label));
      });
      return;
    }

    const filtered = dataset.filter(item => item.label.toLowerCase().includes(q) || item.id.toLowerCase().includes(q));
    if (filtered.length === 0) {
      resultsDiv.innerHTML = `<div style="padding: 10px; font-size: 0.74rem; color: #64748b; text-align: center;">No matches found</div>`;
    } else {
      resultsDiv.innerHTML = filtered.map(item => `
        <div class="search-result-item" data-id="${item.id}" data-label="${item.label}" style="padding: 8px 12px; font-size: 0.76rem; cursor: pointer; border-bottom: 1px solid #f1f5f9; background: white; transition: background 0.15s;" onmouseover="this.style.background='#f1f5f9'" onmouseout="this.style.background='white'">
          <div style="font-weight: 700; color: #1e293b;">${item.label}</div>
          <div style="font-size: 0.68rem; color: #64748b; margin-top: 1px;">${item.detail}</div>
        </div>
      `).join('');
    }
    resultsDiv.style.display = 'block';

    resultsDiv.querySelectorAll('.search-result-item').forEach(el => {
      el.addEventListener('click', () => selectItem(el.dataset.id, el.dataset.label));
    });
  };

  searchInput.addEventListener('input', (e) => renderResults(e.target.value));
  searchInput.addEventListener('focus', () => renderResults(searchInput.value));

  // Hide results on blur with minor delay to allow clicks to register
  searchInput.addEventListener('blur', () => {
    setTimeout(() => {
      resultsDiv.style.display = 'none';
    }, 200);
  });
};

window.closeBillingModal = function() {
  const modal = window.getOrCreateBillingModal();
  if (modal) modal.style.display = 'none';
};

window.initBillingQueueFilters = function() {
  const searchInput = document.getElementById('bill-q-search');
  const typeSelect = document.getElementById('bill-q-type');
  const payerSelect = document.getElementById('bill-q-payer');
  const statusSelect = document.getElementById('bill-q-status');

  if (searchInput && typeSelect && payerSelect && statusSelect) {
    const handler = () => {
      const q = searchInput.value.toLowerCase().trim();
      const visitType = typeSelect.value;
      const payer = payerSelect.value;
      const statusVal = statusSelect.value;

      const tbody = document.getElementById('billing-q-table-body');
      if (!tbody) return;

      const pBadges = {
        "Self Pay": "background:#e0f2fe; color:#0369a1;",
        "Insurance": "background:#faf5ff; color:#6b21a8;",
        "CGHS": "background:#fffbeb; color:#b45309;",
        "ECHS": "background:#f0fdf4; color:#15803d;"
      };

      const statusColors = {
        Draft: 'background:#f1f5f9; color:#475569;',
        Generated: 'background:#eff6ff; color:#1d4ed8;',
        'Partial Paid': 'background:#fffbeb; color:#d97706; font-weight: 700;',
        Outstanding: 'background:#fef2f2; color:#ef4444; font-weight: 700;',
        Paid: 'background:#ecfdf5; color:#10b981;',
        Cancelled: 'background:#f1f5f9; color:#94a3b8; text-decoration: line-through;',
        'Advance Pending': 'background:#fffbeb; color:#d97706; font-weight: 700;'
      };

      // Compute the same merged list
      const activeBills = state.billing.filter(b => b.visitType !== 'OPD' || b.status === 'Pending');
      
      const pendingIpdAdvanceRequests = [];
      const reqs = window.state.admissionRequests || [];
      const thresholds = window.state.advanceThresholds || { Standard: 5000, ICU: 15000, Daycare: 2000 };
      
      reqs.forEach(r => {
        const isCashless = r.payer && (r.payer.toLowerCase().includes('cashless') || r.payer.toLowerCase().includes('tpa') || r.payer.toLowerCase().includes('insur'));
        if (isCashless) return;

        const isICU = r.wardPreference === 'ICU' || r.wardPreference === 'CCU' || r.wardPreference === 'ICCU';
        const reqAmount = isICU ? thresholds['ICU'] : thresholds['Standard'];

        const advObj = (window.state.billingAdvances || []).find(a => a.uhid === r.uhid);
        const balance = advObj ? advObj.balance : 0;
        const shortfall = reqAmount - balance;

        if (shortfall > 0) {
          pendingIpdAdvanceRequests.push({
            id: `REQ-${r.uhid}`,
            uhid: r.uhid,
            patientName: r.name,
            doctorName: r.requestedBy || 'Dr. Amit Verma',
            department: 'General Medicine',
            visitType: 'IPD Request',
            bed: r.wardPreference || 'GENERAL-WARD-M',
            daysAdmitted: '—',
            advancePaid: balance,
            amount: reqAmount,
            shortfall: shortfall,
            paymentCategory: r.payer || 'Self Pay',
            status: 'Advance Pending',
            isAdmissionRequest: true
          });
        }
      });

      const mergedQueue = [...pendingIpdAdvanceRequests, ...activeBills];

      const filtered = mergedQueue.filter(b => {
        // Search query filter
        if (q) {
          const matchId = b.id && b.id.toLowerCase().includes(q);
          const matchName = b.patientName && b.patientName.toLowerCase().includes(q);
          const matchUhid = b.uhid && b.uhid.toLowerCase().includes(q);
          if (!matchId && !matchName && !matchUhid) return false;
        }

        // Visit Type filter (matches OPD, IPD, Emergency, Day Care, IPD Request)
        if (visitType) {
          const vType = b.visitType || '';
          if (visitType === 'Day Care') {
            if (vType !== 'Daycare' && vType !== 'Day Care') return false;
          } else {
            if (vType.toLowerCase() !== visitType.toLowerCase()) return false;
          }
        }

        // Payer filter
        if (payer) {
          if (b.paymentCategory !== payer) return false;
        }

        // Status filter (Pending / Paid)
        if (statusVal) {
          if (statusVal === 'Paid') {
            if (b.status !== 'Paid') return false;
          } else if (statusVal === 'Pending') {
            if (b.status === 'Paid' || b.status === 'Cancelled') return false;
          }
        }

        return true;
      });

      tbody.innerHTML = filtered.map(b => {
        const payerBadgeStyle = pBadges[b.paymentCategory] || "background:#f1f5f9; color:#475569;";
        const statStyle = statusColors[b.status] || "background:#f1f5f9; color:#475569;";
        
        const payTypeBadges = {
          "Advance": "background:#fffbeb; color:#b45309; border: 1px solid #fde68a; padding: 2px 6px; font-size: 0.65rem; border-radius: 4px;",
          "Consultation": "background:#e0f2fe; color:#0369a1; border: 1px solid #bae6fd; padding: 2px 6px; font-size: 0.65rem; border-radius: 4px;",
          "Discharge": "background:#ecfdf5; color:#047857; border: 1px solid #a7f3d0; padding: 2px 6px; font-size: 0.65rem; border-radius: 4px;",
          "Procedure": "background:#f5f3ff; color:#6d28d9; border: 1px solid #ddd6fe; padding: 2px 6px; font-size: 0.65rem; border-radius: 4px;"
        };

        let paymentType = b.paymentType || '';
        if (!paymentType) {
          if (b.isAdmissionRequest || b.visitType === 'IPD Request' || b.id.startsWith('REQ-') || (b.items && b.items.some(it => it.desc && it.desc.toLowerCase().includes('advance')))) {
            paymentType = 'Advance';
          } else if (b.visitType === 'OPD') {
            paymentType = 'Consultation';
          } else if (b.visitType === 'IPD') {
            paymentType = 'Discharge';
          } else {
            paymentType = 'Procedure';
          }
        }
        const payTypeBadgeStyle = payTypeBadges[paymentType] || "background:#f1f5f9; color:#475569; padding: 2px 6px; font-size: 0.65rem; border-radius: 4px;";

        let payerDetail = b.paymentCategory;
        if (b.paymentCategory === 'Insurance' && b.insuranceDetails) {
          payerDetail = `${b.insuranceDetails.provider} (PA: ${b.insuranceDetails.preauthNo})`;
        }

        const daysAdmitted = b.visitType === 'IPD' ? '6 days' : '—';
        const depositBalVal = b.advancePaid;

        return `
          <tr class="interactive-row" onclick="router.navigate('billing-workspace?id=${b.id}')">
            <td class="billing-mono">
              <div style="font-weight: 600; color: var(--text-primary); font-size: 0.82rem;">${b.id}</div>
              <div style="font-size: 0.7rem; color: var(--text-muted); margin-top: 4px; display: flex; align-items: center; gap: 6px; flex-wrap: wrap;">
                <span class="badge" style="background: #f1f5f9; color: #475569; font-size: 0.65rem; padding: 1px 4px; border-radius: 3px;">${b.visitType}</span>
                ${b.visitType.includes('IPD') ? `
                  <span style="display: inline-flex; align-items: center; gap: 3px;">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color: #94a3b8;"><path d="M3 20v-8a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v8M5 10V6a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v4M3 18h18"/></svg>
                    ${b.visitType === 'IPD' ? (b.bed || 'IPD Bed') : (b.visitType === 'IPD Request' ? (window.state.wards[b.bed]?.name || b.bed) : '—')}
                  </span>
                ` : ''}
                ${b.visitType === 'IPD' ? `
                  <span style="color: #cbd5e1; font-size: 0.65rem;">|</span>
                  <span>${daysAdmitted}</span>
                ` : ''}
              </div>
            </td>
            <td>
              <div style="font-weight:600; color: var(--primary); text-decoration: underline; cursor: pointer;" onclick="event.stopPropagation(); router.navigate('patients?uhid=${b.uhid}')">${b.patientName}</div>
              <div class="billing-mono" style="font-size: 0.72rem; color: #64748b; margin-top: 1px;">UHID: ${b.uhid}</div>
              ${b.uhid === 'SH-2026-04790' ? `<span class="badge" style="background:#faf5ff; color:#6b21a8; font-size:0.6rem; padding:1px 4px; margin-top: 2px; display: inline-block;">MLC</span>` : ''}
            </td>
            <td><span style="${payTypeBadgeStyle}">${paymentType}</span></td>
            <td class="billing-mono" style="text-align: right; color:${depositBalVal < 2000 && b.visitType === 'IPD' ? 'var(--color-danger)' : 'inherit'}; font-weight:600;">${formatINR(depositBalVal)}</td>
            <td class="billing-mono" style="text-align: right; font-weight:bold;">${formatINR(b.amount)}</td>
            <td><span class="badge-payer" style="${payerBadgeStyle}">${payerDetail}</span></td>
            <td><span class="badge-status" style="${statStyle}">${b.status}</span></td>
            <td style="text-align: right;" onclick="event.stopPropagation();">
              <div style="display:flex; justify-content:flex-end; gap:4px;">
                ${b.isAdmissionRequest ? `
                  <button class="btn btn-primary" onclick="router.navigate('billing-workspace?id=${b.id}')" style="padding:2px 6px; font-size:0.7rem; height:22px; font-weight:700; background-color: #d97706; border-color: #d97706; cursor: pointer;">Collect Advance</button>
                ` : `
                  ${window.activeBillingRole === 'CASHIER' ? `
                    <button class="btn btn-primary" onclick="router.navigate('billing-workspace?id=${b.id}')" style="padding:2px 6px; font-size:0.7rem; height:22px; font-weight:700;">Collect</button>
                  ` : `
                    <button class="btn btn-secondary" onclick="router.navigate('billing-workspace?id=${b.id}')" style="padding:2px 6px; font-size:0.7rem; height:22px; font-weight:600;">See Details</button>
                  `}
                `}
              </div>
            </td>
          </tr>
        `;
      }).join('');
    };

    searchInput.addEventListener('input', handler);
    typeSelect.addEventListener('change', handler);
    payerSelect.addEventListener('change', handler);
    statusSelect.addEventListener('change', handler);
    
    // Maintain state if user already typed search query before rendering
    if (searchInput.value || typeSelect.value || payerSelect.value || statusSelect.value) {
      handler();
    }
  }
};

// --------------------------------------------------------------------------
// GAP MODULES COMPONENT IMPLEMENTATIONS
// --------------------------------------------------------------------------

window.renderOutstandingRecoveryTab = function() {
  if (window.state.syncOutstandingBills) {
    window.state.syncOutstandingBills();
  }
  
  const role = window.activeBillingRole || 'BILLING_EXECUTIVE';
  const outstanding = window.state.outstandingBills || [];
  
  const searchQuery = document.getElementById('recovery-search')?.value || '';
  const agingFilter = document.getElementById('recovery-aging')?.value || 'All';
  const statusFilter = document.getElementById('recovery-status')?.value || 'All';
  const payerFilter = document.getElementById('recovery-payer')?.value || 'All';
  
  const filtered = outstanding.filter(item => {
    const matchesSearch = item.patient_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.bill_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.UHID.toLowerCase().includes(searchQuery.toLowerCase());
    
    let matchesAging = true;
    if (agingFilter === '0-7') matchesAging = item.aging_days <= 7;
    else if (agingFilter === '8-15') matchesAging = item.aging_days > 7 && item.aging_days <= 15;
    else if (agingFilter === '15-30') matchesAging = item.aging_days > 15 && item.aging_days <= 30;
    else if (agingFilter === '30-60') matchesAging = item.aging_days > 30 && item.aging_days <= 60;
    else if (agingFilter === '60+') matchesAging = item.aging_days > 60;
    
    let matchesStatus = true;
    if (statusFilter !== 'All') {
      matchesStatus = item.status === statusFilter;
    }
    
    let matchesPayer = true;
    if (payerFilter !== 'All') {
      matchesPayer = item.payer_type === payerFilter;
    }
    
    return matchesSearch && matchesAging && matchesStatus && matchesPayer;
  });

  return `
    <div class="recovery-workspace" style="display:flex; flex-direction:column; gap:16px;">
      <div style="display:flex; justify-content:flex-end; align-items:center; margin-bottom: 2px;">
        <button class="btn btn-secondary" onclick="window.exportOutstandingReport()" style="padding:6px 12px; font-size:0.75rem; border: 1px solid #cbd5e1; background: #ffffff; color: #334155; border-radius: 4px; font-weight: 600; cursor:pointer;">📥 Export Aging Report</button>
      </div>

      <!-- Filters Row -->
      <div style="display:flex; gap:12px; flex-wrap:wrap; padding:12px; background:#f8fafc; border:1px solid #e2e8f0; border-radius:6px; align-items:center;">
        <div style="flex:1; min-width:200px;">
          <label style="display:block; font-size:0.7rem; font-weight:700; color:#475569; margin-bottom:4px;">Search Patient / Bill / UHID</label>
          <input type="text" id="recovery-search" value="${searchQuery}" oninput="window.refreshRecoveryGrid()" placeholder="Search patient name, UHID, invoice..." style="width:100%; padding:6px; font-size:0.78rem; border:1px solid #cbd5e1; border-radius:4px;" />
        </div>
        <div>
          <label style="display:block; font-size:0.7rem; font-weight:700; color:#475569; margin-bottom:4px;">Aging Bucket</label>
          <select id="recovery-aging" onchange="window.refreshRecoveryGrid()" style="padding:6px; font-size:0.78rem; border:1px solid #cbd5e1; border-radius:4px; min-width:120px;">
            <option value="All" ${agingFilter === 'All' ? 'selected' : ''}>All Buckets</option>
            <option value="0-7" ${agingFilter === '0-7' ? 'selected' : ''}>0–7 Days</option>
            <option value="8-15" ${agingFilter === '8-15' ? 'selected' : ''}>8–15 Days</option>
            <option value="15-30" ${agingFilter === '15-30' ? 'selected' : ''}>15–30 Days</option>
            <option value="30-60" ${agingFilter === '30-60' ? 'selected' : ''}>30–60 Days</option>
            <option value="60+" ${agingFilter === '60+' ? 'selected' : ''}>60+ Days</option>
          </select>
        </div>
        <div>
          <label style="display:block; font-size:0.7rem; font-weight:700; color:#475569; margin-bottom:4px;">Status</label>
          <select id="recovery-status" onchange="window.refreshRecoveryGrid()" style="padding:6px; font-size:0.78rem; border:1px solid #cbd5e1; border-radius:4px; min-width:120px;">
            <option value="All" ${statusFilter === 'All' ? 'selected' : ''}>All Statuses</option>
            <option value="Unpaid" ${statusFilter === 'Unpaid' ? 'selected' : ''}>Unpaid</option>
            <option value="Partially Paid" ${statusFilter === 'Partially Paid' ? 'selected' : ''}>Partially Paid</option>
            <option value="Write-Off Pending" ${statusFilter === 'Write-Off Pending' ? 'selected' : ''}>Write-Off Pending</option>
            <option value="Approved Write-Off" ${statusFilter === 'Approved Write-Off' ? 'selected' : ''}>Approved Write-Off</option>
            <option value="Legal Handoff" ${statusFilter === 'Legal Handoff' ? 'selected' : ''}>Legal Handoff</option>
          </select>
        </div>
        <div>
          <label style="display:block; font-size:0.7rem; font-weight:700; color:#475569; margin-bottom:4px;">Payer Type</label>
          <select id="recovery-payer" onchange="window.refreshRecoveryGrid()" style="padding:6px; font-size:0.78rem; border:1px solid #cbd5e1; border-radius:4px; min-width:120px;">
            <option value="All" ${payerFilter === 'All' ? 'selected' : ''}>All Payers</option>
            <option value="Self Pay" ${payerFilter === 'Self Pay' ? 'selected' : ''}>Self Pay</option>
            <option value="Insurance" ${payerFilter === 'Insurance' ? 'selected' : ''}>Insurance</option>
            <option value="CGHS" ${payerFilter === 'CGHS' ? 'selected' : ''}>CGHS</option>
            <option value="ECHS" ${payerFilter === 'ECHS' ? 'selected' : ''}>ECHS</option>
          </select>
        </div>
      </div>

      <!-- Grid Table -->
      <div class="billing-table-wrapper" style="overflow-x:auto; border:1px solid #e2e8f0; border-radius:6px;">
        <table class="billing-table" style="width:100%; border-collapse:collapse; text-align:left; font-size:0.78rem;">
          <thead>
            <tr style="background-color:#f1f5f9; color:#475569; font-weight:700; border-bottom:1px solid #cbd5e1;">
              <th style="padding:10px;">Bill ID</th>
              <th style="padding:10px;">Patient (UHID)</th>
              <th style="padding:10px;">Admission</th>
              <th style="padding:10px; text-align:right;">Bill Amt</th>
              <th style="padding:10px; text-align:right;">Received</th>
              <th style="padding:10px; text-align:right; color:#ef4444;">Balance Due</th>
              <th style="padding:10px;">Bill Date</th>
              <th style="padding:10px;">Aging</th>
              <th style="padding:10px;">Assigned Executive</th>
              <th style="padding:10px;">Status</th>
              <th style="padding:10px; text-align:center;">Actions</th>
            </tr>
          </thead>
          <tbody>
            ${filtered.length === 0 ? `
              <tr>
                <td colspan="11" style="padding:20px; text-align:center; color:#64748b;">No outstanding bills match the selected filters.</td>
              </tr>
            ` : filtered.map(item => {
              const agingClass = item.aging_days > 60 ? 'badge-status error' : (item.aging_days > 30 ? 'badge-status warning' : 'badge-status normal');
              const statusClass = item.status === 'Write-Off Pending' ? 'badge-status warning' : (item.status === 'Approved Write-Off' ? 'badge-status normal' : 'badge-status critical');
              return `
                <tr style="border-bottom:1px solid #e2e8f0; hover:background:#f8fafc;">
                  <td style="padding:10px; font-weight:700;">${item.bill_id}</td>
                  <td style="padding:10px;">${item.patient_name} <br/><span style="font-size:0.7rem; color:#64748b;">${item.UHID}</span></td>
                  <td style="padding:10px;">${item.admission_type}</td>
                  <td style="padding:10px; text-align:right; font-weight:600;">${formatINR(item.bill_amount)}</td>
                  <td style="padding:10px; text-align:right; color:#22c55e;">${formatINR(item.amount_received)}</td>
                  <td style="padding:10px; text-align:right; font-weight:700; color:#ef4444;">${formatINR(item.balance_due)}</td>
                  <td style="padding:10px;">${item.bill_date}</td>
                  <td style="padding:10px;"><span class="${agingClass}" style="padding:2px 6px; font-size:0.7rem; font-weight:700;">${item.aging_days} Days</span></td>
                  <td style="padding:10px; font-weight:500; color:#475569;">
                    <div style="display:flex; align-items:center; gap:4px;">
                      <span>${item.assigned_executive}</span>
                      ${(role === 'BILLING_SUPERVISOR' || role === 'Super Admin') ? `
                        <button onclick="window.openReassignPopup('${item.bill_id}')" style="background:transparent; border:none; color:#3b82f6; cursor:pointer; font-size:0.75rem; padding:0 2px;">✏️</button>
                      ` : ''}
                    </div>
                  </td>
                  <td style="padding:10px;"><span class="${statusClass}" style="padding:2px 6px; font-size:0.7rem; font-weight:700;">${item.status}</span></td>
                  <td style="padding:10px; text-align:center;">
                    <div style="display:flex; justify-content:center; gap:6px;">
                      <button class="btn btn-secondary" onclick="window.viewRecoveryLogs('${item.bill_id}')" style="padding:3px 6px; font-size:0.7rem; cursor:pointer;" title="View Audit Trail">📋 Logs</button>
                      
                      ${(role !== 'AUDITOR') ? `
                        <button class="btn btn-primary" onclick="window.openLogFollowUpModal('${item.bill_id}')" style="padding:3px 6px; font-size:0.7rem; cursor:pointer;">📞 Follow-up</button>
                      ` : ''}
                      
                      ${(role === 'BILLING_SUPERVISOR' || role === 'Super Admin') && item.status !== 'Write-Off Pending' && item.status !== 'Approved Write-Off' ? `
                        <button class="btn btn-primary" onclick="window.openWriteOffModal('${item.bill_id}')" style="padding:3px 6px; font-size:0.7rem; background-color:#ef4444; border-color:#ef4444; cursor:pointer;">💸 Write-off</button>
                      ` : ''}
                      
                      ${item.status === 'Write-Off Pending' && (role === 'ACCOUNTS_MANAGER' || role === 'Super Admin') ? `
                        <button class="btn btn-primary" onclick="window.openWriteOffApprovalModal('${item.bill_id}')" style="padding:3px 6px; font-size:0.7rem; background-color:#10b981; border-color:#10b981; cursor:pointer;">✓ Approve</button>
                      ` : ''}
                    </div>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
};

window.refreshRecoveryGrid = function() {
  const container = document.getElementById('billing-tab-content');
  if (container) {
    container.innerHTML = window.renderOutstandingRecoveryTab();
  }
};

window.openLogFollowUpModal = function(billId) {
  const oBills = window.state.outstandingBills || [];
  const item = oBills.find(o => o.bill_id === billId);
  if (!item) return;

  const modal = document.createElement('div');
  modal.id = 'followup-modal';
  modal.style = "position:fixed; z-index:100000; top:0; left:0; width:100%; height:100%; background:rgba(15,23,42,0.6); display:flex; align-items:center; justify-content:center; backdrop-filter:blur(4px);";
  modal.innerHTML = `
    <div style="background:#fff; width:450px; border-radius:8px; padding:20px; box-shadow:0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04); border:1px solid #e2e8f0; text-align:left;">
      <h3 style="margin-top:0; font-size:1.1rem; color:#0f172a; border-bottom:1px solid #e2e8f0; padding-bottom:8px; display:flex; justify-content:space-between; align-items:center;">
        <span>Log Follow-Up Action</span>
        <button onclick="this.closest('#followup-modal').remove()" style="background:transparent; border:none; font-size:1.2rem; cursor:pointer; color:#94a3b8;">&times;</button>
      </h3>
      <div style="font-size:0.8rem; margin-bottom:12px; background:#f8fafc; padding:8px; border-radius:4px; border-left:3px solid #3b82f6;">
        <strong>Patient:</strong> ${item.patient_name} (${item.UHID})<br/>
        <strong>Invoice:</strong> ${item.bill_id} | <strong>Outstanding Due:</strong> <span style="color:#ef4444; font-weight:700;">${formatINR(item.balance_due)}</span>
      </div>
      
      <div style="margin-bottom:12px;">
        <label style="display:block; font-size:0.75rem; font-weight:700; color:#475569; margin-bottom:4px;">Contact Channel</label>
        <select id="followup-channel" style="width:100%; padding:8px; font-size:0.8rem; border:1px solid #cbd5e1; border-radius:4px;">
          <option value="Call">📞 Call</option>
          <option value="SMS">💬 SMS</option>
          <option value="WhatsApp">📱 WhatsApp</option>
        </select>
      </div>

      <div style="margin-bottom:12px;">
        <label style="display:block; font-size:0.75rem; font-weight:700; color:#475569; margin-bottom:4px;">Follow-up Notes / Reason Code Update</label>
        <textarea id="followup-notes" placeholder="Enter follow-up notes..." style="width:100%; height:80px; padding:8px; font-size:0.8rem; border:1px solid #cbd5e1; border-radius:4px; font-family:inherit; box-sizing:border-box;"></textarea>
      </div>

      <div style="margin-bottom:16px;">
        <label style="display:block; font-size:0.75rem; font-weight:700; color:#475569; margin-bottom:4px;">Reason Code Update</label>
        <select id="followup-reason" style="width:100%; padding:8px; font-size:0.8rem; border:1px solid #cbd5e1; border-radius:4px;">
          <option value="${item.reason_code}" selected>${item.reason_code}</option>
          <option value="TPA pending">TPA pending</option>
          <option value="corporate credit period">corporate credit period</option>
          <option value="DAMA/absconded">DAMA/absconded</option>
          <option value="disputed line item">disputed line item</option>
          <option value="awaiting relative">awaiting relative</option>
          <option value="cashless authorization pending">cashless authorization pending</option>
        </select>
      </div>

      <div style="margin-bottom:16px;">
        <label style="display:block; font-size:0.75rem; font-weight:700; color:#475569; margin-bottom:4px;">Next Follow-Up Date</label>
        <input type="date" id="followup-next-date" style="width:100%; padding:8px; font-size:0.8rem; border:1px solid #cbd5e1; border-radius:4px; box-sizing:border-box;" />
      </div>

      <div style="display:flex; justify-content:flex-end; gap:8px;">
        <button class="btn btn-secondary" onclick="this.closest('#followup-modal').remove()" style="padding:6px 12px; font-size:0.8rem; cursor:pointer;">Cancel</button>
        <button class="btn btn-primary" onclick="window.saveFollowUpAction('${billId}')" style="padding:6px 12px; font-size:0.8rem; cursor:pointer;">Save Notes</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  document.getElementById('followup-next-date').value = tomorrow.toISOString().split('T')[0];
};

window.saveFollowUpAction = function(billId) {
  const channel = document.getElementById('followup-channel').value;
  const notes = document.getElementById('followup-notes').value.trim();
  const reasonCode = document.getElementById('followup-reason').value;
  const nextDate = document.getElementById('followup-next-date').value;

  if (!notes) {
    alert("Please enter follow-up notes.");
    return;
  }

  const oBills = window.state.outstandingBills || [];
  const item = oBills.find(o => o.bill_id === billId);
  if (item) {
    item.reason_code = reasonCode;
  }

  const logId = "LOG-" + Math.floor(Math.random() * 100000);
  const user = window.state.activeUserRole || "Billing Executive";
  const newLog = {
    log_id: logId,
    bill_id: billId,
    executive_id: user,
    contact_channel: channel,
    contact_date: new Date().toISOString().split('T')[0],
    notes: notes,
    next_action_date: nextDate
  };
  
  if (!window.state.followUpLogs) window.state.followUpLogs = [];
  window.state.followUpLogs.push(newLog);

  const billingBill = (window.state.billing || []).find(b => b.id === billId);
  if (billingBill) {
    if (!billingBill.auditLogs) billingBill.auditLogs = [];
    billingBill.auditLogs.push({
      timestamp: new Date().toISOString(),
      user: user,
      action: `Follow-up Logged: ${channel} - ${notes}`
    });
  }

  localStorage.setItem('saronil_outstandingBills', JSON.stringify(window.state.outstandingBills));
  localStorage.setItem('saronil_followUpLogs', JSON.stringify(window.state.followUpLogs));
  localStorage.setItem('saronil_billing', JSON.stringify(window.state.billing));

  document.getElementById('followup-modal')?.remove();
  showToast("Follow-up action logged successfully", "success");
  window.refreshRecoveryGrid();
};

window.openWriteOffModal = function(billId) {
  const oBills = window.state.outstandingBills || [];
  const item = oBills.find(o => o.bill_id === billId);
  if (!item) return;

  const modal = document.createElement('div');
  modal.id = 'writeoff-modal';
  modal.style = "position:fixed; z-index:100000; top:0; left:0; width:100%; height:100%; background:rgba(15,23,42,0.6); display:flex; align-items:center; justify-content:center; backdrop-filter:blur(4px);";
  modal.innerHTML = `
    <div style="background:#fff; width:450px; border-radius:8px; padding:20px; box-shadow:0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04); border:1px solid #e2e8f0; text-align:left;">
      <h3 style="margin-top:0; font-size:1.1rem; color:#ef4444; border-bottom:1px solid #e2e8f0; padding-bottom:8px; display:flex; justify-content:space-between; align-items:center;">
        <span>Escalate to Write-off / Bad Debt</span>
        <button onclick="this.closest('#writeoff-modal').remove()" style="background:transparent; border:none; font-size:1.2rem; cursor:pointer; color:#94a3b8;">&times;</button>
      </h3>
      <div style="font-size:0.8rem; margin-bottom:12px; background:#fff1f2; padding:8px; border-radius:4px; border-left:3px solid #ef4444; color:#991b1b;">
        <strong>Patient:</strong> ${item.patient_name} (${item.UHID})<br/>
        <strong>Invoice:</strong> ${item.bill_id} | <strong>Outstanding Due:</strong> <span style="font-weight:700;">${formatINR(item.balance_due)}</span>
      </div>

      <div style="margin-bottom:12px;">
        <label style="display:block; font-size:0.75rem; font-weight:700; color:#475569; margin-bottom:4px;">Write-Off Amount Requested</label>
        <input type="number" id="writeoff-amount" value="${item.balance_due}" max="${item.balance_due}" style="width:100%; padding:8px; font-size:0.8rem; border:1px solid #cbd5e1; border-radius:4px; box-sizing:border-box;" />
      </div>

      <div style="margin-bottom:16px;">
        <label style="display:block; font-size:0.75rem; font-weight:700; color:#475569; margin-bottom:4px;">Justification & Reason Code</label>
        <textarea id="writeoff-reason" placeholder="Detail the recovery attempts..." style="width:100%; height:80px; padding:8px; font-size:0.8rem; border:1px solid #cbd5e1; border-radius:4px; font-family:inherit; box-sizing:border-box;"></textarea>
      </div>

      <div style="display:flex; justify-content:flex-end; gap:8px;">
        <button class="btn btn-secondary" onclick="this.closest('#writeoff-modal').remove()" style="padding:6px 12px; font-size:0.8rem; cursor:pointer;">Cancel</button>
        <button class="btn btn-primary" onclick="window.submitWriteOffRequest('${billId}')" style="padding:6px 12px; font-size:0.8rem; background-color:#ef4444; border-color:#ef4444; cursor:pointer;">Escalate</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
};

window.submitWriteOffRequest = function(billId) {
  const amt = parseFloat(document.getElementById('writeoff-amount').value);
  const reason = document.getElementById('writeoff-reason').value.trim();

  if (isNaN(amt) || amt <= 0) {
    alert("Please enter a valid write-off amount.");
    return;
  }
  if (!reason) {
    alert("Please enter a justification.");
    return;
  }

  const oBills = window.state.outstandingBills || [];
  const item = oBills.find(o => o.bill_id === billId);
  if (item) {
    if (amt > item.balance_due) {
      alert("Write-off amount cannot exceed the balance due.");
      return;
    }
    item.status = 'Write-Off Pending';
  }

  const recordId = "WR-" + Math.floor(Math.random() * 100000);
  const requester = window.state.activeUserRole || "Billing Supervisor";
  const newRecord = {
    writeoff_id: recordId,
    bill_id: billId,
    requested_by: requester,
    approved_by: null,
    reason: reason,
    amount: amt,
    approval_date: null,
    status: 'PendingApproval'
  };

  if (!window.state.writeOffRecords) window.state.writeOffRecords = [];
  window.state.writeOffRecords.push(newRecord);

  const billingBill = (window.state.billing || []).find(b => b.id === billId);
  if (billingBill) {
    if (!billingBill.auditLogs) billingBill.auditLogs = [];
    billingBill.auditLogs.push({
      timestamp: new Date().toISOString(),
      user: requester,
      action: `Write-off Request Initiated for ${formatINR(amt)}: ${reason}`
    });
  }

  localStorage.setItem('saronil_outstandingBills', JSON.stringify(window.state.outstandingBills));
  localStorage.setItem('saronil_writeOffRecords', JSON.stringify(window.state.writeOffRecords));
  localStorage.setItem('saronil_billing', JSON.stringify(window.state.billing));

  document.getElementById('writeoff-modal')?.remove();
  showToast("Write-off request escalated to Finance Manager", "warning");
  window.refreshRecoveryGrid();
};

window.openWriteOffApprovalModal = function(billId) {
  const oBills = window.state.outstandingBills || [];
  const item = oBills.find(o => o.bill_id === billId);
  if (!item) return;

  const records = window.state.writeOffRecords || [];
  const record = records.find(r => r.bill_id === billId && r.status === 'PendingApproval');
  if (!record) {
    alert("No active write-off request found for this bill.");
    return;
  }

  const currentUser = window.state.activeUserRole || 'ACCOUNTS_MANAGER';
  const isSuperAdmin = currentUser === 'Super Admin';
  const isSelfApproved = record.requested_by === currentUser;

  const modal = document.createElement('div');
  modal.id = 'writeoff-approval-modal';
  modal.style = "position:fixed; z-index:100000; top:0; left:0; width:100%; height:100%; background:rgba(15,23,42,0.6); display:flex; align-items:center; justify-content:center; backdrop-filter:blur(4px);";
  modal.innerHTML = `
    <div style="background:#fff; width:450px; border-radius:8px; padding:20px; box-shadow:0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04); border:1px solid #e2e8f0; text-align:left;">
      <h3 style="margin-top:0; font-size:1.1rem; color:#10b981; border-bottom:1px solid #e2e8f0; padding-bottom:8px; display:flex; justify-content:space-between; align-items:center;">
        <span>Authorize Write-Off Approval</span>
        <button onclick="this.closest('#writeoff-approval-modal').remove()" style="background:transparent; border:none; font-size:1.2rem; cursor:pointer; color:#94a3b8;">&times;</button>
      </h3>
      <div style="font-size:0.8rem; margin-bottom:12px; background:#ecfdf5; padding:8px; border-radius:4px; border-left:3px solid #10b981; color:#065f46;">
        <strong>Patient:</strong> ${item.patient_name} (${item.UHID})<br/>
        <strong>Invoice:</strong> ${item.bill_id}<br/>
        <strong>Requested Write-off Amount:</strong> <span style="font-weight:700;">${formatINR(record.amount)}</span><br/>
        <strong>Initiated By:</strong> ${record.requested_by}<br/>
        <strong>Justification:</strong> ${record.reason}
      </div>

      ${isSelfApproved && !isSuperAdmin ? `
        <div style="padding:8px; background:#fee2e2; border-left:3px solid #ef4444; border-radius:4px; color:#991b1b; font-size:0.75rem; font-weight:700; margin-bottom:12px;">
          ⚠️ GATING ALERT: Double-check constraint active. You cannot self-approve a request you initiated. Please have another manager or Super Admin approve this.
        </div>
      ` : ''}

      <div style="margin-bottom:16px;">
        <label style="display:block; font-size:0.75rem; font-weight:700; color:#475569; margin-bottom:4px;">Approval Remarks / Reason Code</label>
        <textarea id="approval-remarks" placeholder="Enter formal authorization remarks..." style="width:100%; height:60px; padding:8px; font-size:0.8rem; border:1px solid #cbd5e1; border-radius:4px; font-family:inherit; box-sizing:border-box;"></textarea>
      </div>

      <div style="display:flex; justify-content:flex-end; gap:8px;">
        <button class="btn btn-secondary" onclick="window.rejectWriteOffAction('${billId}', '${record.writeoff_id}')" style="padding:6px 12px; font-size:0.8rem; cursor:pointer; background-color:#ef4444; border-color:#ef4444; color:#fff;">Reject</button>
        <button class="btn btn-primary" onclick="window.approveWriteOffAction('${billId}', '${record.writeoff_id}')" 
          ${isSelfApproved && !isSuperAdmin ? 'disabled style="opacity:0.5; cursor:not-allowed;"' : 'style="background-color:#10b981; border-color:#10b981; cursor:pointer;"'}
          >Approve & Settle</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
};

window.approveWriteOffAction = function(billId, writeoffId) {
  const remarks = document.getElementById('approval-remarks').value.trim();
  if (!remarks) {
    alert("Please enter approval remarks.");
    return;
  }

  const currentUser = window.state.activeUserRole || 'ACCOUNTS_MANAGER';
  const oBills = window.state.outstandingBills || [];
  const item = oBills.find(o => o.bill_id === billId);
  const record = (window.state.writeOffRecords || []).find(r => r.writeoff_id === writeoffId);

  if (item && record) {
    item.status = 'Approved Write-Off';
    item.amount_received += record.amount;
    item.balance_due = item.bill_amount - item.amount_received;
    
    const billingBill = (window.state.billing || []).find(b => b.id === billId);
    if (billingBill) {
      billingBill.paid = item.amount_received;
      billingBill.status = item.balance_due <= 0 ? 'Paid' : 'Partially Paid';
      if (!billingBill.auditLogs) billingBill.auditLogs = [];
      billingBill.auditLogs.push({
        timestamp: new Date().toISOString(),
        user: currentUser,
        action: `Write-off Request Approved for ${formatINR(record.amount)} by ${currentUser}: ${remarks}`
      });
    }

    record.approved_by = currentUser;
    record.approval_date = new Date().toISOString().split('T')[0];
    record.status = 'Approved';
  }

  localStorage.setItem('saronil_outstandingBills', JSON.stringify(window.state.outstandingBills));
  localStorage.setItem('saronil_writeOffRecords', JSON.stringify(window.state.writeOffRecords));
  localStorage.setItem('saronil_billing', JSON.stringify(window.state.billing));

  document.getElementById('writeoff-approval-modal')?.remove();
  showToast("Write-off authorized and bad debt settled successfully", "success");
  window.refreshRecoveryGrid();
};

window.rejectWriteOffAction = function(billId, writeoffId) {
  const remarks = document.getElementById('approval-remarks').value.trim();
  if (!remarks) {
    alert("Please enter rejection reason.");
    return;
  }

  const currentUser = window.state.activeUserRole || 'ACCOUNTS_MANAGER';
  const oBills = window.state.outstandingBills || [];
  const item = oBills.find(o => o.bill_id === billId);
  const record = (window.state.writeOffRecords || []).find(r => r.writeoff_id === writeoffId);

  if (item && record) {
    item.status = 'Unpaid';
    record.status = 'Rejected';
    
    const billingBill = (window.state.billing || []).find(b => b.id === billId);
    if (billingBill) {
      if (!billingBill.auditLogs) billingBill.auditLogs = [];
      billingBill.auditLogs.push({
        timestamp: new Date().toISOString(),
        user: currentUser,
        action: `Write-off Request Rejected by ${currentUser}: ${remarks}`
      });
    }
  }

  localStorage.setItem('saronil_outstandingBills', JSON.stringify(window.state.outstandingBills));
  localStorage.setItem('saronil_writeOffRecords', JSON.stringify(window.state.writeOffRecords));
  localStorage.setItem('saronil_billing', JSON.stringify(window.state.billing));

  document.getElementById('writeoff-approval-modal')?.remove();
  showToast("Write-off request rejected", "error");
  window.refreshRecoveryGrid();
};

window.exportOutstandingReport = function() {
  const oBills = window.state.outstandingBills || [];
  showToast(`Outstanding Aging Report exported successfully (${oBills.length} records)`, "success");
};

window.viewRecoveryLogs = function(billId) {
  const logs = (window.state.followUpLogs || []).filter(l => l.bill_id === billId);
  const writeoffs = (window.state.writeOffRecords || []).filter(w => w.bill_id === billId);
  const billingBill = (window.state.billing || []).find(b => b.id === billId);

  const modal = document.createElement('div');
  modal.id = 'logs-modal';
  modal.style = "position:fixed; z-index:100000; top:0; left:0; width:100%; height:100%; background:rgba(15,23,42,0.6); display:flex; align-items:center; justify-content:center; backdrop-filter:blur(4px);";
  
  let logsHtml = '';
  if (logs.length === 0 && writeoffs.length === 0 && (!billingBill || !billingBill.auditLogs)) {
    logsHtml = `<p style="color:#64748b; font-size:0.8rem;">No activity log recorded for this bill.</p>`;
  } else {
    logsHtml += `<h4 style="margin:10px 0 6px 0; font-size:0.85rem; color:#475569; font-weight:700;">Client Contact Follow-Ups</h4>`;
    if (logs.length === 0) {
      logsHtml += `<p style="color:#64748b; font-size:0.75rem; margin-left:8px;">No follow-ups logged.</p>`;
    } else {
      logs.forEach(l => {
        logsHtml += `
          <div style="border-left:2px solid #3b82f6; padding-left:8px; margin-bottom:8px; font-size:0.75rem;">
            <strong>${l.contact_date} (${l.contact_channel}):</strong> ${l.notes}<br/>
            <span style="color:#64748b;">Logged by: ${l.executive_id} | Next follow-up: ${l.next_action_date || 'N/A'}</span>
          </div>
        `;
      });
    }

    logsHtml += `<h4 style="margin:16px 0 6px 0; font-size:0.85rem; color:#475569; font-weight:700;">Write-Off History</h4>`;
    if (writeoffs.length === 0) {
      logsHtml += `<p style="color:#64748b; font-size:0.75rem; margin-left:8px;">No write-off attempts.</p>`;
    } else {
      writeoffs.forEach(w => {
        logsHtml += `
          <div style="border-left:2px solid #ef4444; padding-left:8px; margin-bottom:8px; font-size:0.75rem;">
            <strong>Write-Off Request of ${formatINR(w.amount)}:</strong> [Status: ${w.status}] - ${w.reason}<br/>
            <span style="color:#64748b;">Raised by: ${w.requested_by} | Approved by: ${w.approved_by || 'Pending'}</span>
          </div>
        `;
      });
    }

    if (billingBill && billingBill.auditLogs) {
      logsHtml += `<h4 style="margin:16px 0 6px 0; font-size:0.85rem; color:#475569; font-weight:700;">System Audit Trail (Immutable)</h4>`;
      billingBill.auditLogs.forEach(a => {
        logsHtml += `
          <div style="border-left:2px solid #cbd5e1; padding-left:8px; margin-bottom:6px; font-size:0.72rem;">
            <strong>${new Date(a.timestamp).toLocaleString()} [${a.user}]:</strong> ${a.action}
          </div>
        `;
      });
    }
  }

  modal.innerHTML = `
    <div style="background:#fff; width:500px; max-height:80%; overflow-y:auto; border-radius:8px; padding:20px; box-shadow:0 20px 25px -5px rgba(0,0,0,0.1); border:1px solid #e2e8f0; text-align:left;">
      <h3 style="margin-top:0; font-size:1.1rem; color:#0f172a; border-bottom:1px solid #e2e8f0; padding-bottom:8px; display:flex; justify-content:space-between; align-items:center;">
        <span>Audit Trail & Activity Log</span>
        <button onclick="this.closest('#logs-modal').remove()" style="background:transparent; border:none; font-size:1.2rem; cursor:pointer; color:#94a3b8;">&times;</button>
      </h3>
      <div style="margin-bottom:16px;">
        ${logsHtml}
      </div>
      <div style="display:flex; justify-content:flex-end;">
        <button class="btn btn-secondary" onclick="this.closest('#logs-modal').remove()" style="padding:6px 12px; font-size:0.8rem; cursor:pointer;">Close</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
};

window.openReassignPopup = function(billId) {
  const oBills = window.state.outstandingBills || [];
  const item = oBills.find(o => o.bill_id === billId);
  if (!item) return;

  const modal = document.createElement('div');
  modal.id = 'reassign-modal';
  modal.style = "position:fixed; z-index:100000; top:0; left:0; width:100%; height:100%; background:rgba(15,23,42,0.6); display:flex; align-items:center; justify-content:center; backdrop-filter:blur(4px);";
  modal.innerHTML = `
    <div style="background:#fff; width:360px; border-radius:8px; padding:20px; box-shadow:0 20px 25px -5px rgba(0,0,0,0.1); border:1px solid #e2e8f0; text-align:left;">
      <h3 style="margin-top:0; font-size:1rem; color:#0f172a; border-bottom:1px solid #e2e8f0; padding-bottom:8px; display:flex; justify-content:space-between; align-items:center;">
        <span>Reassign Case Executive</span>
        <button onclick="this.closest('#reassign-modal').remove()" style="background:transparent; border:none; font-size:1.2rem; cursor:pointer; color:#94a3b8;">&times;</button>
      </h3>
      <p style="font-size:0.78rem; color:#475569; margin-bottom:12px;">Choose recovery executive to reassign <strong>${item.bill_id}</strong>:</p>
      
      <div style="margin-bottom:16px;">
        <select id="new-assigned-executive" style="width:100%; padding:8px; font-size:0.8rem; border:1px solid #cbd5e1; border-radius:4px;">
          <option value="Executive Ankit" ${item.assigned_executive === 'Executive Ankit' ? 'selected' : ''}>Executive Ankit</option>
          <option value="Executive Sonia" ${item.assigned_executive === 'Executive Sonia' ? 'selected' : ''}>Executive Sonia</option>
          <option value="Executive Karan" ${item.assigned_executive === 'Executive Karan' ? 'selected' : ''}>Executive Karan</option>
        </select>
      </div>

      <div style="display:flex; justify-content:flex-end; gap:8px;">
        <button class="btn btn-secondary" onclick="this.closest('#reassign-modal').remove()" style="padding:6px 12px; font-size:0.8rem; cursor:pointer;">Cancel</button>
        <button class="btn btn-primary" onclick="window.saveReassignment('${billId}')" style="padding:6px 12px; font-size:0.8rem; cursor:pointer;">Confirm Reassign</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
};

window.saveReassignment = function(billId) {
  const newExec = document.getElementById('new-assigned-executive').value;
  const oBills = window.state.outstandingBills || [];
  const item = oBills.find(o => o.bill_id === billId);
  const currentUser = window.state.activeUserRole || 'BILLING_SUPERVISOR';
  if (item) {
    item.assigned_executive = newExec;
    
    const billingBill = (window.state.billing || []).find(b => b.id === billId);
    if (billingBill) {
      if (!billingBill.auditLogs) billingBill.auditLogs = [];
      billingBill.auditLogs.push({
        timestamp: new Date().toISOString(),
        user: currentUser,
        action: `Case reassigned to: ${newExec}`
      });
    }
  }

  localStorage.setItem('saronil_outstandingBills', JSON.stringify(window.state.outstandingBills));
  localStorage.setItem('saronil_billing', JSON.stringify(window.state.billing));

  document.getElementById('reassign-modal')?.remove();
  showToast("Case executive reassigned successfully", "success");
  window.refreshRecoveryGrid();
};

window.renderUnidentifiedReceiptsTab = function() {
  const role = window.activeBillingRole || 'CASHIER';
  const receipts = window.state.suspenseReceipts || [];
  const unmatched = receipts.filter(r => r.match_status !== 'matched');

  const searchQuery = document.getElementById('suspense-search')?.value || '';

  const filtered = unmatched.filter(item => {
    return item.payer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
           item.UTR_reference.toLowerCase().includes(searchQuery.toLowerCase()) ||
           item.amount.toString().includes(searchQuery) ||
           item.receipt_id.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return `
    <div class="suspense-workspace" style="display:flex; flex-direction:column; gap:16px;">
      <div style="display:flex; justify-content:flex-end; align-items:center; margin-bottom: 2px;">
        <button class="btn btn-primary" onclick="window.openImportReceiptModal()" style="padding:6px 12px; font-size:0.75rem; background-color:#0284c7; border-color:#0284c7; color:#fff; font-weight:700; cursor:pointer; border-radius:4px;">➕ Book Statement Credit</button>
      </div>

      <!-- Quick Match Recommendations -->
      <div style="padding:12px; background:#f0fdf4; border:1px solid #bbf7d0; border-radius:6px;">
        <h4 style="margin:0 0 8px 0; font-size:0.8rem; color:#166534; font-weight:700; display:flex; align-items:center; gap:6px;">
          <span>💡 High-Confidence Match Suggestions</span>
        </h4>
        <div style="display:flex; flex-direction:column; gap:8px;">
          ${receipts.filter(r => r.match_status === 'suggested').map(r => {
            const bill = (window.state.outstandingBills || []).find(b => b.bill_id === r.matched_bill_id);
            if (!bill) return '';
            return `
              <div style="display:flex; justify-content:space-between; align-items:center; padding:8px; background:#fff; border:1px solid #dcfce7; border-radius:4px; font-size:0.78rem;">
                <div>
                  <strong>${r.payer_name}</strong> sent <strong>${formatINR(r.amount)}</strong> (UTR: ${r.UTR_reference}) matches outstanding bill of <strong>${bill.patient_name}</strong> (Due: ${formatINR(bill.balance_due)})
                  <span style="background:#dcfce7; color:#15803d; font-size:0.65rem; font-weight:700; padding:2px 6px; border-radius:10px; margin-left:6px;">95% Match Rate</span>
                </div>
                <div>
                  <button class="btn btn-primary" onclick="window.confirmAutoMatch('${r.receipt_id}', '${bill.bill_id}')" style="padding:4px 8px; font-size:0.7rem; background-color:#15803d; border-color:#15803d; cursor:pointer;">Confirm Match</button>
                </div>
              </div>
            `;
          }).join('')}
          ${receipts.filter(r => r.match_status === 'suggested').length === 0 ? `
            <div style="font-size:0.75rem; color:#166534;">No suggested match recommendations currently.</div>
          ` : ''}
        </div>
      </div>

      <!-- Search & Filters -->
      <div style="display:flex; gap:12px; flex-wrap:wrap; padding:12px; background:#f8fafc; border:1px solid #e2e8f0; border-radius:6px; align-items:center;">
        <div style="flex:1; min-width:200px;">
          <label style="display:block; font-size:0.7rem; font-weight:700; color:#475569; margin-bottom:4px;">Filter Unmatched entries</label>
          <input type="text" id="suspense-search" value="${searchQuery}" oninput="window.refreshSuspenseGrid()" placeholder="Search payer, UTR, amount..." style="width:100%; padding:6px; font-size:0.78rem; border:1px solid #cbd5e1; border-radius:4px;" />
        </div>
      </div>

      <!-- Grid -->
      <div class="billing-table-wrapper" style="overflow-x:auto; border:1px solid #e2e8f0; border-radius:6px;">
        <table class="billing-table" style="width:100%; border-collapse:collapse; text-align:left; font-size:0.78rem;">
          <thead>
            <tr style="background-color:#f1f5f9; color:#475569; font-weight:700; border-bottom:1px solid #cbd5e1;">
              <th style="padding:10px;">Receipt ID</th>
              <th style="padding:10px;">Date Received</th>
              <th style="padding:10px;">Payer Name</th>
              <th style="padding:10px;">UTR Reference</th>
              <th style="padding:10px;">Payment Mode</th>
              <th style="padding:10px; text-align:right;">Amount</th>
              <th style="padding:10px;">Age in Suspense</th>
              <th style="padding:10px; text-align:center;">Reconciliation Controls</th>
            </tr>
          </thead>
          <tbody>
            ${filtered.length === 0 ? `
              <tr>
                <td colspan="8" style="padding:20px; text-align:center; color:#64748b;">No unmatched suspense ledger credits found.</td>
              </tr>
            ` : filtered.map(item => {
              const rDate = new Date(item.receipt_date);
              const today = new Date();
              const diffDays = Math.ceil((today - rDate) / 86400000) || 0;
              const isAged = diffDays > 7;
              const ageStyle = isAged ? 'color:#ef4444; font-weight:700;' : 'color:#475569;';
              return `
                <tr style="border-bottom:1px solid #e2e8f0; hover:background:#f8fafc;">
                  <td style="padding:10px; font-weight:700;">${item.receipt_id}</td>
                  <td style="padding:10px;">${item.receipt_date}</td>
                  <td style="padding:10px; font-weight:600;">${item.payer_name}</td>
                  <td style="padding:10px; font-family:monospace;">${item.UTR_reference}</td>
                  <td style="padding:10px;">${item.payment_mode}</td>
                  <td style="padding:10px; text-align:right; font-weight:700; color:#0369a1;">${formatINR(item.amount)}</td>
                  <td style="padding:10px; ${ageStyle}">
                    ${diffDays} Days
                    ${isAged ? '<span style="font-size:8px; background:#fee2e2; color:#ef4444; padding:1px 4px; border-radius:4px; margin-left:4px;">&gt;7d Aged</span>' : ''}
                  </td>
                  <td style="padding:10px; text-align:center;">
                    <div style="display:flex; justify-content:center; gap:6px;">
                      <button class="btn btn-primary" onclick="window.openManualMatchWorkbench('${item.receipt_id}')" style="padding:3px 6px; font-size:0.7rem; cursor:pointer;">🔍 Research & Match</button>
                      <button class="btn btn-secondary" onclick="window.openBulkAllocationWorkbench('${item.receipt_id}')" style="padding:3px 6px; font-size:0.7rem; background-color:#6b21a8; border-color:#6b21a8; color:#fff; cursor:pointer;">🥞 Bulk Allocation</button>
                      
                      ${(role === 'ACCOUNTS_MANAGER' || role === 'Super Admin') ? `
                        <button class="btn btn-secondary" onclick="window.writeBackToUnclaimed('${item.receipt_id}')" style="padding:3px 6px; font-size:0.7rem; color:#ef4444; border-color:#ef4444; cursor:pointer;">Unclaimed</button>
                      ` : ''}
                    </div>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
};

window.refreshSuspenseGrid = function() {
  const container = document.getElementById('billing-tab-content');
  if (container) {
    container.innerHTML = window.renderUnidentifiedReceiptsTab();
  }
};

window.openImportReceiptModal = function() {
  const modal = document.createElement('div');
  modal.id = 'import-receipt-modal';
  modal.style = "position:fixed; z-index:100000; top:0; left:0; width:100%; height:100%; background:rgba(15,23,42,0.6); display:flex; align-items:center; justify-content:center; backdrop-filter:blur(4px);";
  modal.innerHTML = `
    <div style="background:#fff; width:400px; border-radius:8px; padding:20px; box-shadow:0 20px 25px -5px rgba(0,0,0,0.1); border:1px solid #e2e8f0; text-align:left;">
      <h3 style="margin-top:0; font-size:1.1rem; color:#0f172a; border-bottom:1px solid #e2e8f0; padding-bottom:8px; display:flex; justify-content:space-between; align-items:center;">
        <span>Book Statement Credit Entry</span>
        <button onclick="this.closest('#import-receipt-modal').remove()" style="background:transparent; border:none; font-size:1.2rem; cursor:pointer; color:#94a3b8;">&times;</button>
      </h3>
      
      <div style="margin-bottom:12px;">
        <label style="display:block; font-size:0.75rem; font-weight:700; color:#475569; margin-bottom:4px;">Payer Name (from bank text)</label>
        <input type="text" id="suspense-payer" placeholder="e.g. ICICI Bank Payer" style="width:100%; padding:8px; font-size:0.8rem; border:1px solid #cbd5e1; border-radius:4px; box-sizing:border-box;" />
      </div>

      <div style="margin-bottom:12px;">
        <label style="display:block; font-size:0.75rem; font-weight:700; color:#475569; margin-bottom:4px;">Amount (Credit)</label>
        <input type="number" id="suspense-amount" placeholder="e.g. 15000" style="width:100%; padding:8px; font-size:0.8rem; border:1px solid #cbd5e1; border-radius:4px; box-sizing:border-box;" />
      </div>

      <div style="margin-bottom:12px;">
        <label style="display:block; font-size:0.75rem; font-weight:700; color:#475569; margin-bottom:4px;">UTR / Reference Number</label>
        <input type="text" id="suspense-utr" placeholder="e.g. UTR992810X" style="width:100%; padding:8px; font-size:0.8rem; border:1px solid #cbd5e1; border-radius:4px; box-sizing:border-box;" />
      </div>

      <div style="margin-bottom:12px;">
        <label style="display:block; font-size:0.75rem; font-weight:700; color:#475569; margin-bottom:4px;">Payment Mode</label>
        <select id="suspense-mode" style="width:100%; padding:8px; font-size:0.8rem; border:1px solid #cbd5e1; border-radius:4px;">
          <option value="NEFT">NEFT</option>
          <option value="RTGS">RTGS</option>
          <option value="UPI">UPI</option>
          <option value="IMPS">IMPS</option>
        </select>
      </div>

      <div style="margin-bottom:16px;">
        <label style="display:block; font-size:0.75rem; font-weight:700; color:#475569; margin-bottom:4px;">Transaction Date</label>
        <input type="date" id="suspense-date" style="width:100%; padding:8px; font-size:0.8rem; border:1px solid #cbd5e1; border-radius:4px; box-sizing:border-box;" />
      </div>

      <div style="display:flex; justify-content:flex-end; gap:8px;">
        <button class="btn btn-secondary" onclick="this.closest('#import-receipt-modal').remove()" style="padding:6px 12px; font-size:0.8rem; cursor:pointer;">Cancel</button>
        <button class="btn btn-primary" onclick="window.saveImportReceipt()" style="padding:6px 12px; font-size:0.8rem; cursor:pointer;">Book Credit</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
  document.getElementById('suspense-date').value = new Date().toISOString().split('T')[0];
};

window.saveImportReceipt = function() {
  const payer = document.getElementById('suspense-payer').value.trim();
  const amt = parseFloat(document.getElementById('suspense-amount').value);
  const utr = document.getElementById('suspense-utr').value.trim();
  const mode = document.getElementById('suspense-mode').value;
  const date = document.getElementById('suspense-date').value;

  if (!payer || isNaN(amt) || amt <= 0 || !utr || !date) {
    alert("Please fill in all details correctly.");
    return;
  }

  const newId = "REC-SUS-" + Math.floor(Math.random() * 100000);
  const newReceipt = {
    receipt_id: newId,
    amount: amt,
    receipt_date: date,
    payment_mode: mode,
    payer_name: payer,
    UTR_reference: utr,
    source_account: "XXXXXXXX" + Math.floor(Math.random() * 10000),
    match_status: "unmatched",
    matched_bill_id: null
  };

  if (!window.state.suspenseReceipts) window.state.suspenseReceipts = [];
  window.state.suspenseReceipts.push(newReceipt);

  localStorage.setItem('saronil_suspenseReceipts', JSON.stringify(window.state.suspenseReceipts));

  document.getElementById('import-receipt-modal')?.remove();
  showToast("Bank statement credit booked to Suspense Ledger", "success");
  window.refreshSuspenseGrid();
};

window.confirmAutoMatch = function(receiptId, billId) {
  const receipts = window.state.suspenseReceipts || [];
  const rObj = receipts.find(r => r.receipt_id === receiptId);

  const oBills = window.state.outstandingBills || [];
  const bObj = oBills.find(b => b.bill_id === billId);

  if (rObj && bObj) {
    rObj.match_status = 'matched';
    rObj.matched_bill_id = billId;

    bObj.amount_received += rObj.amount;
    bObj.balance_due = bObj.bill_amount - bObj.amount_received;
    bObj.status = bObj.balance_due <= 0 ? 'Closed' : 'Partially Paid';

    const billingBill = (window.state.billing || []).find(b => b.id === billId);
    if (billingBill) {
      billingBill.paid = bObj.amount_received;
      billingBill.status = bObj.balance_due <= 0 ? 'Paid' : 'Partially Paid';
      if (!billingBill.auditLogs) billingBill.auditLogs = [];
      billingBill.auditLogs.push({
        timestamp: new Date().toISOString(),
        user: window.state.activeUserRole || "Billing Exec",
        action: `Reconciled Suspense Credit: ${rObj.receipt_id} (UTR: ${rObj.UTR_reference}) of ${formatINR(rObj.amount)} matched to Bill`
      });
    }
  }

  localStorage.setItem('saronil_suspenseReceipts', JSON.stringify(window.state.suspenseReceipts));
  localStorage.setItem('saronil_outstandingBills', JSON.stringify(window.state.outstandingBills));
  localStorage.setItem('saronil_billing', JSON.stringify(window.state.billing));

  showToast("Receipt matched and bill status updated successfully", "success");
  window.refreshSuspenseGrid();
};

window.openManualMatchWorkbench = function(receiptId) {
  const receipts = window.state.suspenseReceipts || [];
  const rObj = receipts.find(r => r.receipt_id === receiptId);
  if (!rObj) return;

  const modal = document.createElement('div');
  modal.id = 'manual-match-modal';
  modal.style = "position:fixed; z-index:100000; top:0; left:0; width:100%; height:100%; background:rgba(15,23,42,0.6); display:flex; align-items:center; justify-content:center; backdrop-filter:blur(4px);";
  
  modal.innerHTML = `
    <div style="background:#fff; width:700px; max-height:85%; overflow-y:auto; border-radius:8px; padding:20px; box-shadow:0 20px 25px -5px rgba(0,0,0,0.1); border:1px solid #e2e8f0; text-align:left;">
      <h3 style="margin-top:0; font-size:1.1rem; color:#0f172a; border-bottom:1px solid #e2e8f0; padding-bottom:8px; display:flex; justify-content:space-between; align-items:center;">
        <span>Research & Link Match Workbench</span>
        <button onclick="this.closest('#manual-match-modal').remove()" style="background:transparent; border:none; font-size:1.2rem; cursor:pointer; color:#94a3b8;">&times;</button>
      </h3>
      
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-bottom:16px;">
        <!-- Left: Suspense Receipt Info -->
        <div style="background:#f0f9ff; padding:12px; border:1px solid #bae6fd; border-radius:6px;">
          <h4 style="margin:0 0 8px 0; font-size:0.85rem; color:#0369a1; font-weight:700;">Statement Credit Details</h4>
          <table style="width:100%; font-size:0.75rem; border-collapse:collapse;">
            <tr><td style="padding:4px 0; font-weight:600; color:#475569;">Payer Name:</td><td style="padding:4px 0; font-weight:700;">${rObj.payer_name}</td></tr>
            <tr><td style="padding:4px 0; font-weight:600; color:#475569;">UTR Code:</td><td style="padding:4px 0; font-family:monospace;">${rObj.UTR_reference}</td></tr>
            <tr><td style="padding:4px 0; font-weight:600; color:#475569;">Credit Amount:</td><td style="padding:4px 0; font-weight:700; color:#0369a1;">${formatINR(rObj.amount)}</td></tr>
            <tr><td style="padding:4px 0; font-weight:600; color:#475569;">Date Credit:</td><td>${rObj.receipt_date}</td></tr>
            <tr><td style="padding:4px 0; font-weight:600; color:#475569;">Payer Account:</td><td>${rObj.source_account}</td></tr>
          </table>
        </div>

        <!-- Right: Matching Dues List -->
        <div style="display:flex; flex-direction:column; gap:8px;">
          <h4 style="margin:0; font-size:0.85rem; color:#475569; font-weight:700;">Link to Outstanding Bill</h4>
          <input type="text" id="manual-match-search" oninput="window.filterManualMatchList('${receiptId}')" placeholder="Search Patient name, bill ID, UHID..." style="padding:6px; font-size:0.78rem; border:1px solid #cbd5e1; border-radius:4px;" />
          
          <div id="manual-match-list-container" style="max-height:220px; overflow-y:auto; border:1px solid #cbd5e1; border-radius:4px; padding:4px;">
            <!-- list elements loaded dynamically -->
          </div>
        </div>
      </div>

      <div style="display:flex; justify-content:flex-end; gap:8px; border-top:1px solid #e2e8f0; padding-top:12px;">
        <button class="btn btn-secondary" onclick="this.closest('#manual-match-modal').remove()" style="padding:6px 12px; font-size:0.8rem; cursor:pointer;">Cancel</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
  window.filterManualMatchList(receiptId);
};

window.filterManualMatchList = function(receiptId) {
  const query = document.getElementById('manual-match-search')?.value.toLowerCase() || '';
  const oBills = window.state.outstandingBills || [];
  const activeBills = oBills.filter(b => b.status !== 'Closed' && b.status !== 'Approved Write-Off');

  const filtered = activeBills.filter(b => {
    return b.patient_name.toLowerCase().includes(query) ||
           b.bill_id.toLowerCase().includes(query) ||
           b.UHID.toLowerCase().includes(query);
  });

  const listContainer = document.getElementById('manual-match-list-container');
  if (listContainer) {
    listContainer.innerHTML = filtered.map(b => `
      <div style="display:flex; justify-content:space-between; align-items:center; padding:8px; border-bottom:1px solid #f1f5f9; font-size:0.75rem;">
        <div>
          <span style="font-weight:700; color:#0f172a;">${b.bill_id}</span> - ${b.patient_name}<br/>
          <span style="color:#64748b;">UHID: ${b.UHID} | Balance Due: <strong style="color:#ef4444;">${formatINR(b.balance_due)}</strong></span>
        </div>
        <button class="btn btn-primary" onclick="window.confirmAutoMatch('${receiptId}', '${b.bill_id}'); document.getElementById('manual-match-modal').remove();" style="padding:2px 6px; font-size:0.68rem; cursor:pointer;">Link Match</button>
      </div>
    `).join('');
    
    if (filtered.length === 0) {
      listContainer.innerHTML = `<p style="padding:10px; color:#64748b; font-size:0.75rem; text-align:center;">No outstanding bills match search.</p>`;
    }
  }
};

window.openBulkAllocationWorkbench = function(receiptId) {
  const receipts = window.state.suspenseReceipts || [];
  const rObj = receipts.find(r => r.receipt_id === receiptId);
  if (!rObj) return;

  const modal = document.createElement('div');
  modal.id = 'bulk-match-modal';
  modal.style = "position:fixed; z-index:100000; top:0; left:0; width:100%; height:100%; background:rgba(15,23,42,0.6); display:flex; align-items:center; justify-content:center; backdrop-filter:blur(4px);";
  
  modal.innerHTML = `
    <div style="background:#fff; width:800px; max-height:85%; overflow-y:auto; border-radius:8px; padding:20px; box-shadow:0 20px 25px -5px rgba(0,0,0,0.1); border:1px solid #e2e8f0; text-align:left;">
      <h3 style="margin-top:0; font-size:1.1rem; color:#6b21a8; border-bottom:1px solid #e2e8f0; padding-bottom:8px; display:flex; justify-content:space-between; align-items:center;">
        <span>Bulk Settlement Split Allocation Desk</span>
        <button onclick="this.closest('#bulk-match-modal').remove()" style="background:transparent; border:none; font-size:1.2rem; cursor:pointer; color:#94a3b8;">&times;</button>
      </h3>
      
      <!-- Receipt Summary Header -->
      <div style="background:#faf5ff; padding:12px; border:1px solid #e9d5ff; border-radius:6px; margin-bottom:16px; display:flex; justify-content:space-between; align-items:center;">
        <div>
          <span style="font-size:0.75rem; color:#7e22ce; font-weight:700;">LUMP-SUM SETTLEMENT CREDIT ENTRY</span>
          <h4 style="margin:2px 0 0 0; font-size:1rem; color:#581c87; font-weight:700;">${rObj.payer_name}</h4>
          <span style="font-size:0.75rem; color:#64748b;">UTR: ${rObj.UTR_reference} | Date: ${rObj.receipt_date}</span>
        </div>
        <div style="text-align:right;">
          <span style="font-size:0.7rem; color:#475569; display:block; font-weight:600;">Total Credit Amount</span>
          <strong style="font-size:1.2rem; color:#6b21a8;" id="bulk-total-credit">${formatINR(rObj.amount)}</strong>
        </div>
      </div>

      <div style="display:grid; grid-template-columns:1fr 1.2fr; gap:16px;">
        <!-- Left: Select Outstanding Bills to Split -->
        <div style="border-right:1px solid #e2e8f0; padding-right:16px;">
          <h4 style="margin:0 0 8px 0; font-size:0.8rem; color:#475569; font-weight:700;">Step 1: Choose Bills to Allocate Dues</h4>
          <input type="text" id="bulk-bill-search" oninput="window.filterBulkMatchList('${receiptId}')" placeholder="Search bill ID, name..." style="width:100%; padding:6px; font-size:0.78rem; border:1px solid #cbd5e1; border-radius:4px; box-sizing:border-box; margin-bottom:8px;" />
          
          <div id="bulk-match-list-container" style="max-height:260px; overflow-y:auto; border:1px solid #cbd5e1; border-radius:4px; padding:4px;">
            <!-- loaded dynamically -->
          </div>
        </div>

        <!-- Right: Allocations split workbook -->
        <div style="display:flex; flex-direction:column; gap:8px;">
          <h4 style="margin:0 0 4px 0; font-size:0.8rem; color:#475569; font-weight:700;">Step 2: Allocate Split Values</h4>
          <div style="flex:1; max-height:230px; overflow-y:auto; border:1px solid #cbd5e1; border-radius:4px; padding:8px;" id="bulk-allocated-container">
            <p style="color:#64748b; font-size:0.75rem; text-align:center; padding:20px;">No patient bills added. Choose from the left list.</p>
          </div>
          
          <!-- Sum display status bar -->
          <div style="display:flex; justify-content:space-between; align-items:center; background:#f8fafc; border:1px solid #cbd5e1; padding:8px; border-radius:4px; font-size:0.78rem;">
            <div>
              <span>Allocated Sum: <strong><span id="bulk-allocated-sum">₹0.00</span></strong></span><br/>
              <span id="bulk-allocation-variance" style="font-size:0.7rem; color:#ef4444; font-weight:700;">Variance: ${formatINR(rObj.amount)}</span>
            </div>
            <button id="submit-bulk-allocation-btn" class="btn btn-primary" onclick="window.saveBulkSplitAllocation('${receiptId}')" disabled style="padding:6px 12px; font-size:0.8rem; background-color:#6b21a8; border-color:#6b21a8; cursor:not-allowed; opacity:0.5;">Commit Allocation</button>
          </div>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
  window._bulkAllocationsWorkbook = [];
  window.filterBulkMatchList(receiptId);
};

window.filterBulkMatchList = function(receiptId) {
  const query = document.getElementById('bulk-bill-search')?.value.toLowerCase() || '';
  const oBills = window.state.outstandingBills || [];
  const activeBills = oBills.filter(b => b.status !== 'Closed' && b.status !== 'Approved Write-Off');

  const filtered = activeBills.filter(b => {
    return b.patient_name.toLowerCase().includes(query) ||
           b.bill_id.toLowerCase().includes(query) ||
           b.UHID.toLowerCase().includes(query);
  });

  const listContainer = document.getElementById('bulk-match-list-container');
  if (listContainer) {
    listContainer.innerHTML = filtered.map(b => {
      const isAdded = window._bulkAllocationsWorkbook.some(item => item.bill_id === b.bill_id);
      return `
        <div style="display:flex; justify-content:space-between; align-items:center; padding:8px; border-bottom:1px solid #f1f5f9; font-size:0.75rem;">
          <div>
            <span style="font-weight:700; color:#0f172a;">${b.bill_id}</span> - ${b.patient_name}<br/>
            <span style="color:#64748b;">Due: <strong style="color:#ef4444;">${formatINR(b.balance_due)}</strong></span>
          </div>
          ${isAdded ? `
            <span style="color:#10b981; font-weight:700; font-size:0.7rem;">Added</span>
          ` : `
            <button class="btn btn-secondary" onclick="window.addBillToBulkWorkbook('${b.bill_id}', '${b.patient_name.replace(/'/g, "\\'")}', ${b.balance_due}, '${receiptId}')" style="padding:2px 6px; font-size:0.68rem; cursor:pointer;">Add</button>
          `}
        </div>
      `;
    }).join('');
  }
};

window.addBillToBulkWorkbook = function(billId, patientName, balanceDue, receiptId) {
  window._bulkAllocationsWorkbook.push({
    bill_id: billId,
    patient_name: patientName,
    balance_due: balanceDue,
    amount: 0
  });
  window.renderBulkSplitWorkbook(receiptId);
  window.filterBulkMatchList(receiptId);
};

window.removeBillFromBulkWorkbook = function(billId, receiptId) {
  window._bulkAllocationsWorkbook = window._bulkAllocationsWorkbook.filter(x => x.bill_id !== billId);
  window.renderBulkSplitWorkbook(receiptId);
  window.filterBulkMatchList(receiptId);
};

window.updateBulkSplitAmount = function(billId, val, receiptId) {
  const amt = parseFloat(val) || 0;
  const item = window._bulkAllocationsWorkbook.find(x => x.bill_id === billId);
  if (item) {
    item.amount = amt;
  }
  window.calculateBulkAllocationsSum(receiptId);
};

window.renderBulkSplitWorkbook = function(receiptId) {
  const container = document.getElementById('bulk-allocated-container');
  if (!container) return;

  if (window._bulkAllocationsWorkbook.length === 0) {
    container.innerHTML = `<p style="color:#64748b; font-size:0.75rem; text-align:center; padding:20px;">No patient bills added. Choose from the left list.</p>`;
    return;
  }

  container.innerHTML = window._bulkAllocationsWorkbook.map(b => `
    <div style="display:flex; justify-content:space-between; align-items:center; padding:8px; background:#f8fafc; border:1px solid #e2e8f0; border-radius:4px; margin-bottom:8px; font-size:0.75rem;">
      <div style="flex:1;">
        <strong style="color:#0f172a;">${b.bill_id}</strong> - ${b.patient_name}<br/>
        <span style="color:#64748b;">Max Dues: ${formatINR(b.balance_due)}</span>
      </div>
      <div style="display:flex; align-items:center; gap:6px;">
        <input type="number" value="${b.amount || ''}" max="${b.balance_due}" placeholder="Split ₹" oninput="window.updateBulkSplitAmount('${b.bill_id}', this.value, '${receiptId}')" style="width:80px; padding:4px; font-size:0.75rem; border:1px solid #cbd5e1; border-radius:4px; text-align:right;" />
        <button onclick="window.removeBillFromBulkWorkbook('${b.bill_id}', '${receiptId}')" style="background:transparent; border:none; color:#ef4444; font-size:1rem; cursor:pointer; font-weight:bold;">&times;</button>
      </div>
    </div>
  `).join('');
  
  window.calculateBulkAllocationsSum(receiptId);
};

window.calculateBulkAllocationsSum = function(receiptId) {
  const receipts = window.state.suspenseReceipts || [];
  const rObj = receipts.find(r => r.receipt_id === receiptId);
  if (!rObj) return;

  const totalCredit = rObj.amount;
  const allocatedSum = window._bulkAllocationsWorkbook.reduce((sum, item) => sum + item.amount, 0);
  const variance = totalCredit - allocatedSum;

  const sumEl = document.getElementById('bulk-allocated-sum');
  const varianceEl = document.getElementById('bulk-allocation-variance');
  const submitBtn = document.getElementById('submit-bulk-allocation-btn');

  if (sumEl) sumEl.textContent = formatINR(allocatedSum);
  if (varianceEl) {
    if (variance === 0) {
      varianceEl.textContent = "Matched Perfectly ✓";
      varianceEl.style.color = "#10b981";
    } else if (variance > 0) {
      varianceEl.textContent = `Variance: Underallocated by ${formatINR(variance)}`;
      varianceEl.style.color = "#d97706";
    } else {
      varianceEl.textContent = `Variance: Overallocated by ${formatINR(Math.abs(variance))}`;
      varianceEl.style.color = "#ef4444";
    }
  }

  if (submitBtn) {
    if (variance === 0 && window._bulkAllocationsWorkbook.length > 0 && window._bulkAllocationsWorkbook.every(x => x.amount > 0)) {
      submitBtn.disabled = false;
      submitBtn.style.opacity = '1';
      submitBtn.style.cursor = 'pointer';
    } else {
      submitBtn.disabled = true;
      submitBtn.style.opacity = '0.5';
      submitBtn.style.cursor = 'not-allowed';
    }
  }
};

window.saveBulkSplitAllocation = function(receiptId) {
  const receipts = window.state.suspenseReceipts || [];
  const rObj = receipts.find(r => r.receipt_id === receiptId);
  if (!rObj) return;

  const oBills = window.state.outstandingBills || [];
  const user = window.state.activeUserRole || "Billing Supervisor";

  window._bulkAllocationsWorkbook.forEach(alloc => {
    const bill = oBills.find(b => b.bill_id === alloc.bill_id);
    if (bill) {
      bill.amount_received += alloc.amount;
      bill.balance_due = bill.bill_amount - bill.amount_received;
      bill.status = bill.balance_due <= 0 ? 'Closed' : 'Partially Paid';

      const billingBill = (window.state.billing || []).find(b => b.id === alloc.bill_id);
      if (billingBill) {
        billingBill.paid = bill.amount_received;
        billingBill.status = bill.balance_due <= 0 ? 'Paid' : 'Partially Paid';
        if (!billingBill.auditLogs) billingBill.auditLogs = [];
        billingBill.auditLogs.push({
          timestamp: new Date().toISOString(),
          user: user,
          action: `Split Settled via Bulk TPA Settlement: ${receiptId} (allocated amount: ${formatINR(alloc.amount)})`
        });
      }
    }
  });

  rObj.match_status = 'matched';
  rObj.matched_bill_id = 'BULK-' + receiptId;

  const allocationRecordId = "BLK-" + Math.floor(Math.random() * 100000);
  if (!window.state.bulkAllocations) window.state.bulkAllocations = [];
  window.state.bulkAllocations.push({
    allocation_id: allocationRecordId,
    receipt_id: receiptId,
    allocations: window._bulkAllocationsWorkbook.map(x => ({ bill_id: x.bill_id, allocated_amount: x.amount })),
    allocated_by: user,
    allocated_date: new Date().toISOString().split('T')[0]
  });

  localStorage.setItem('saronil_suspenseReceipts', JSON.stringify(window.state.suspenseReceipts));
  localStorage.setItem('saronil_outstandingBills', JSON.stringify(window.state.outstandingBills));
  localStorage.setItem('saronil_billing', JSON.stringify(window.state.billing));
  localStorage.setItem('saronil_bulkAllocations', JSON.stringify(window.state.bulkAllocations));

  document.getElementById('bulk-match-modal')?.remove();
  showToast("Bulk TPA settlement split allocation committed successfully", "success");
  window.refreshSuspenseGrid();
};

window.writeBackToUnclaimed = function(receiptId) {
  const receipts = window.state.suspenseReceipts || [];
  const rObj = receipts.find(r => r.receipt_id === receiptId);
  if (!rObj) return;

  const confirmAction = confirm(`Are you sure you want to write back receipt UTR ${rObj.UTR_reference} (${formatINR(rObj.amount)}) to Unclaimed Liabilities? This requires CFO authorization.`);
  if (!confirmAction) return;

  rObj.match_status = 'unclaimed';

  localStorage.setItem('saronil_suspenseReceipts', JSON.stringify(window.state.suspenseReceipts));
  showToast("Receipt reclassified to Unclaimed liabilities", "warning");
  window.refreshSuspenseGrid();
};

window.renderGstTaxEngineTab = function() {
  const config = window.state.gstRateConfigs || [];
  const invoices = window.state.gstInvoiceSeries || [];

  return `
    <div class="gst-workspace" style="display:flex; flex-direction:column; gap:16px;">
      <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px; background:linear-gradient(135deg, #4f46e5, #4338ca); padding:16px; border-radius:8px; color:#fff; box-shadow:0 4px 6px -1px rgba(0,0,0,0.1);">
        <div>
          <h3 style="margin:0; font-size:1.1rem; font-weight:700;">Healthcare GST Tax Engine Configuration</h3>
          <p style="margin:4px 0 0 0; font-size:0.75rem; color:#e0e7ff;">Configure healthcare room rent tariff exemption brackets and tax rate tables.</p>
        </div>
      </div>

      <div style="display:grid; grid-template-columns:1.2fr 1fr; gap:16px;">
        <!-- Left: Rule Tables -->
        <div style="background:#fff; padding:16px; border:1px solid #cbd5e1; border-radius:6px; text-align:left;">
          <h4 style="margin:0 0 12px 0; font-size:0.85rem; color:#4338ca; font-weight:700; border-bottom:1px solid #e2e8f0; padding-bottom:6px;">GST Rule Matrix & SAC Thresholds</h4>
          
          <table style="width:100%; border-collapse:collapse; font-size:0.78rem; text-align:left; margin-bottom:16px;">
            <thead>
              <tr style="background:#f8fafc; border-bottom:1px solid #cbd5e1; color:#475569; font-weight:700;">
                <th style="padding:8px;">Room Category</th>
                <th style="padding:8px;">Classification</th>
                <th style="padding:8px; text-align:right;">Tariff</th>
                <th style="padding:8px; text-align:right;">Threshold</th>
                <th style="padding:8px; text-align:center;">Tax Rate</th>
                <th style="padding:8px; text-align:center;">ITC Gate</th>
              </tr>
            </thead>
            <tbody>
              ${config.map(item => {
                const taxRate = item.is_icu_type ? "Exempt" : (item.daily_tariff > item.tax_trigger_threshold ? "5%" : "Exempt");
                const itcStatus = item.daily_tariff > item.tax_trigger_threshold ? "0 (Blocked)" : "N/A";
                return `
                  <tr style="border-bottom:1px solid #e2e8f0;">
                    <td style="padding:8px; font-weight:700;">${item.room_category}</td>
                    <td style="padding:8px;">${item.is_icu_type ? "ICU/CCU (Life Support)" : "Non-ICU Inpatient"}</td>
                    <td style="padding:8px; text-align:right; font-weight:600;">${formatINR(item.daily_tariff)}/day</td>
                    <td style="padding:8px; text-align:right; color:#64748b;">${formatINR(item.tax_trigger_threshold)}/day</td>
                    <td style="padding:8px; text-align:center;"><span class="badge-status ${taxRate === 'Exempt' ? 'normal' : 'warning'}" style="font-size:0.68rem; font-weight:700; padding:2px 6px;">${taxRate}</span></td>
                    <td style="padding:8px; text-align:center; color:#94a3b8; font-size:0.7rem;">${itcStatus}</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>

          <div style="background:#f8fafc; padding:12px; border-radius:6px; border-left:3px solid #4f46e5; font-size:0.72rem; color:#475569; display:flex; flex-direction:column; gap:4px;">
            <strong>📜 STATUTORY COMPLIANCE COMPOSITE SUPPLY GATES:</strong>
            <span>• Room rent exceeding ₹5,000 per day in a non-ICU setting is taxable at 5% without input tax credit (ITC) as per Notification No. 12/2017-Central Tax.</span>
            <span>• ICU, CCU, and Neonatal Care tariffs are exempt regardless of rate.</span>
            <span>• Clinical diagnostics, consultations, medical treatments, and dispensations form a Composite Supply of Healthcare and remain 100% Tax Exempt.</span>
            <span>• Cosmetic procedures, elective wellness, and corporate executive checkups carry 18% GST (SAC: 999312).</span>
          </div>
        </div>

        <!-- Right: Sequential Invoice Log -->
        <div style="background:#fff; padding:16px; border:1px solid #cbd5e1; border-radius:6px; text-align:left;">
          <h4 style="margin:0 0 12px 0; font-size:0.85rem; color:#4338ca; font-weight:700; border-bottom:1px solid #e2e8f0; padding-bottom:6px;">Sequential GST Invoice Register</h4>
          
          <table style="width:100%; border-collapse:collapse; font-size:0.78rem; text-align:left;">
            <thead>
              <tr style="background:#f8fafc; border-bottom:1px solid #cbd5e1; color:#475569; font-weight:700;">
                <th style="padding:8px;">GST Invoice No</th>
                <th style="padding:8px;">Bill Link</th>
                <th style="padding:8px;">B2B Buyer GSTIN</th>
                <th style="padding:8px;">Date Finalized</th>
              </tr>
            </thead>
            <tbody>
              ${invoices.map(inv => `
                <tr style="border-bottom:1px solid #e2e8f0;">
                  <td style="padding:8px; font-weight:700; color:#4f46e5;">${inv.invoice_series}</td>
                  <td style="padding:8px;">${inv.bill_id}</td>
                  <td style="padding:8px; font-family:monospace; font-weight:500;">${inv.buyer_gstin || '<span style="color:#94a3b8; font-style:italic;">B2C Retail / Self</span>'}</td>
                  <td style="padding:8px; color:#64748b;">${inv.invoice_date}</td>
                </tr>
              `).join('')}
              ${invoices.length === 0 ? `
                <tr><td colspan="4" style="padding:10px; color:#64748b; text-align:center;">No GST invoices finalized yet.</td></tr>
              ` : ''}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
};

window.triggerTaxOverride = function(billId) {
  const bill = state.billing.find(b => b.id === billId);
  if (!bill) return;

  const overrideVal = prompt("Enter new tax amount (INR):", bill.taxOverrideAmount || 0);
  if (overrideVal === null) return;
  const amt = parseFloat(overrideVal);
  if (isNaN(amt) || amt < 0) {
    alert("Please enter a valid tax amount.");
    return;
  }

  const reason = prompt("Enter justification reason for supervisor override (logged to statutory audit trail):");
  if (!reason || reason.trim() === '') {
    alert("Tax override blocked: A justification reason is mandatory.");
    return;
  }

  bill.taxOverrideAmount = amt;
  bill.taxOverrideReason = reason.trim();
  
  if (!bill.auditLogs) bill.auditLogs = [];
  bill.auditLogs.push({
    timestamp: new Date().toISOString(),
    user: window.state.activeUserRole || "Billing Supervisor",
    action: `Tax override applied to ₹${amt} (Justification: ${reason})`
  });

  localStorage.setItem('saronil_billing', JSON.stringify(state.billing));
  showToast("GST tax amount overridden successfully", "warning");
  
  const container = document.getElementById('main-content');
  if (container) {
    renderInvoiceWorkspace(container, billId);
  }
};
