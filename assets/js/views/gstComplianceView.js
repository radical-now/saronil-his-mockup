/* ==========================================================================
   SARONIL HMS - GST COMPLIANCE MODULE (gstComplianceView.js)
   ========================================================================== */

window.views = window.views || {};

// Helpers
function formatINR(val) {
  return "₹" + Number(val).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// Local Toast Handler Fallback
function showGstToast(message, type = 'success') {
  if (typeof window.showToast === 'function') {
    window.showToast(message, type);
  } else {
    alert(`${type.toUpperCase()}: ${message}`);
  }
}

// Initial Mock Database Seeding
function seedGstComplianceState() {
  if (!window.state.gstinMaster) {
    window.state.gstinMaster = [
      { gstin: "29AAAAA0000A1Z5", name: "Saronil Super Specialty Hospital (KA)", location: "Bengaluru, Karnataka", threshold: 20000000 },
      { gstin: "29BBBBB1111B1Z6", name: "FertiCare IVF Center (KA)", location: "Bengaluru, Karnataka", threshold: 20000000 }
    ];
  }
  if (!window.state.nonBillingRevenue) {
    window.state.nonBillingRevenue = [
      { entry_id: "NBR-001", period: "2026-07", revenue_type: "Hospital Cafeteria Lease", amount: 150000, tax_classification: "Taxable (18% GST)", cgst: 13500, sgst: 13500, igst: 0, gstin: "29AAAAA0000A1Z5", date: "2026-07-01" },
      { entry_id: "NBR-002", period: "2026-07", revenue_type: "Visitor Parking Collection", amount: 85000, tax_classification: "Taxable (18% GST)", cgst: 7650, sgst: 7650, igst: 0, gstin: "29AAAAA0000A1Z5", date: "2026-07-03" },
      { entry_id: "NBR-003", period: "2026-07", revenue_type: "External Diagnostic Referrals", amount: 120000, tax_classification: "Exempt (0% GST)", cgst: 0, sgst: 0, igst: 0, gstin: "29AAAAA0000A1Z5", date: "2026-07-05" },
      { entry_id: "NBR-004", period: "2026-07", revenue_type: "Scrap & Waste Sale", amount: 35000, tax_classification: "Taxable (18% GST)", cgst: 3150, sgst: 3150, igst: 0, gstin: "29AAAAA0000A1Z5", date: "2026-07-10" },
      { entry_id: "NBR-005", period: "2026-07", revenue_type: "Staff Quarters Rent", amount: 90000, tax_classification: "Exempt (0% GST)", cgst: 0, sgst: 0, igst: 0, gstin: "29AAAAA0000A1Z5", date: "2026-07-12" },
      { entry_id: "NBR-006", period: "2026-07", revenue_type: "Surgical Equipment Rental", amount: 200000, tax_classification: "Taxable (12% GST)", cgst: 12000, sgst: 12000, igst: 0, gstin: "29BBBBB1111B1Z6", date: "2026-07-04" }
    ];
  }
  if (!window.state.vendorInvoices) {
    window.state.vendorInvoices = [
      { invoice_id: "VND-001", vendor_gstin: "29MNO1234A1Z0", vendor_name: "Apex Pharma Distributors", invoice_number: "INV-9921", invoice_date: "2026-07-02", taxable_value: 300000, tax_amount: 36000, hsn_sac: "3004", itc_eligibility_status: "Common Credit - Rule 42/43", rcm_applicable: false, match_status: "matched" },
      { invoice_id: "VND-002", vendor_gstin: "29XYZ5678B1Z1", vendor_name: "Star Health Insurance Ltd", invoice_number: "INS-00291", invoice_date: "2026-07-04", taxable_value: 120000, tax_amount: 21600, hsn_sac: "9971", itc_eligibility_status: "Ineligible - Sec 17(5) Blocked", rcm_applicable: false, match_status: "matched", notes: "Employee Health Insurance (Non-statutory)" },
      { invoice_id: "VND-003", vendor_gstin: "29AAA4455C1Z2", vendor_name: "Metropolis Logistics & GTA", invoice_number: "GTA-88219", invoice_date: "2026-07-05", taxable_value: 50000, tax_amount: 2500, hsn_sac: "9965", itc_eligibility_status: "Common Credit - Rule 42/43", rcm_applicable: true, match_status: "matched", notes: "Reverse Charge - Goods Transport Agency" },
      { invoice_id: "VND-004", vendor_gstin: "29BBB9900D1Z3", vendor_name: "MediClean Waste Sol.", invoice_number: "MCW-77218", invoice_date: "2026-07-08", taxable_value: 80000, tax_amount: 14400, hsn_sac: "9994", itc_eligibility_status: "Eligible", rcm_applicable: false, match_status: "matched" },
      { invoice_id: "VND-005", vendor_gstin: "29CCC8877E1Z4", vendor_name: "CaterCare Catering Services", invoice_number: "CAT-3341", invoice_date: "2026-07-10", taxable_value: 45000, tax_amount: 8100, hsn_sac: "9963", itc_eligibility_status: "Ineligible - Sec 17(5) Blocked", rcm_applicable: false, match_status: "matched", notes: "Visitor Cafe/Staff lunches - Blocked under Sec 17(5)(b)(i)" },
      { invoice_id: "VND-006", vendor_gstin: "29DDD6655F1Z5", vendor_name: "Astra Motors Ltd", invoice_number: "AST-2219", invoice_date: "2026-07-12", taxable_value: 1500000, tax_amount: 270000, hsn_sac: "8703", itc_eligibility_status: "Ineligible - Sec 17(5) Blocked", rcm_applicable: false, match_status: "matched", notes: "Director's luxury sedan - Blocked under Sec 17(5)(a)" },
      { invoice_id: "VND-007", vendor_gstin: "29DDD6655F1Z5", vendor_name: "Astra Motors Ltd", invoice_number: "AST-2220", invoice_date: "2026-07-13", taxable_value: 2800000, tax_amount: 336000, hsn_sac: "8702", itc_eligibility_status: "Eligible", rcm_applicable: false, match_status: "matched", notes: "ICU Patient Ambulance (Exempted from 17(5) block)" },
      { invoice_id: "VND-008", vendor_gstin: "29ERR1111A1Z9", vendor_name: "Error-prone Equipment Supplier", invoice_number: "ERR-0019", invoice_date: "2026-07-15", taxable_value: 100000, tax_amount: 18000, hsn_sac: "9018", itc_eligibility_status: "Eligible", rcm_applicable: false, match_status: "mismatched", discrepancy: "Invoice value matches but vendor has not filed GSTR-1 / missing in GSTR-2B" }
    ];
  }
  if (!window.state.gstNotices) {
    window.state.gstNotices = [
      { notice_id: "GST-2026-N01", notice_type: "ASMT-10 (Scrutiny of Returns)", received_date: "2026-06-18", response_deadline: "2026-07-18", assigned_to: "Kavita Iyer (Head of Accounts)", status: "Pending Response", description: "Discrepancy in GSTR-3B vs GSTR-2A input tax credit claims for FY 2025-26." },
      { notice_id: "GST-2026-N02", notice_type: "DRC-01 (Summary of Show Cause Notice)", received_date: "2026-05-10", response_deadline: "2026-06-10", assigned_to: "Kavita Iyer (Head of Accounts)", status: "Replied (Awaiting Order)", description: "Tax demand on canteen services credit apportionment under Rule 42. Written response filed on 2026-06-08." }
    ];
  }
  if (!window.state.returnFilings) {
    window.state.returnFilings = [
      { return_id: "RET-2026-06-1", return_type: "GSTR-1", period: "2026-06", gstin: "29AAAAA0000A1Z5", status: "filed", filed_by: "Kavita Iyer", filed_date: "2026-07-10", ARN: "AR29072600291A", signoff_log: "Approved & Signed off by Kavita Iyer (Head of Accounts) on 2026-07-10 10:45 AM" },
      { return_id: "RET-2026-06-2", return_type: "GSTR-3B", period: "2026-06", gstin: "29AAAAA0000A1Z5", status: "filed", filed_by: "Kavita Iyer", filed_date: "2026-07-12", ARN: "AR29072600350B", signoff_log: "Approved & Signed off by Kavita Iyer (Head of Accounts) on 2026-07-12 02:15 PM" },
      { return_id: "RET-2026-07-1", return_type: "GSTR-1", period: "2026-07", gstin: "29AAAAA0000A1Z5", status: "draft", filed_by: "", filed_date: "", ARN: "", signoff_log: "" },
      { return_id: "RET-2026-07-2", return_type: "GSTR-3B", period: "2026-07", gstin: "29AAAAA0000A1Z5", status: "draft", filed_by: "", filed_date: "", ARN: "", signoff_log: "" }
    ];
  }
  if (!window.state.complianceCalendar) {
    window.state.complianceCalendar = [
      { entry_id: "CAL-001", period: "2026-07", return_type: "GSTR-1", due_date: "2026-08-11", status: "Upcoming", details: "Outward supply invoice upload" },
      { entry_id: "CAL-002", period: "2026-07", return_type: "GSTR-3B", due_date: "2026-08-20", status: "Upcoming", details: "Monthly tax consolidation, input offsets, and cash payment challan" },
      { entry_id: "CAL-003", period: "FY 2025-26", return_type: "GSTR-9", due_date: "2026-12-31", status: "Upcoming", details: "Annual GST return consolidation" },
      { entry_id: "CAL-004", period: "FY 2025-26", return_type: "GSTR-9C", due_date: "2026-12-31", status: "Upcoming", details: "Annual Reconciliation Statement (Statutory audit certified)" }
    ];
  }
}

window.views.gstCompliance = function(container) {
  seedGstComplianceState();

  // Local storage checks
  const localRev = localStorage.getItem('saronil_nonBillingRevenue');
  if (localRev) window.state.nonBillingRevenue = JSON.parse(localRev);

  const localVnd = localStorage.getItem('saronil_vendorInvoices');
  if (localVnd) window.state.vendorInvoices = JSON.parse(localVnd);

  const localNot = localStorage.getItem('saronil_gstNotices');
  if (localNot) window.state.gstNotices = JSON.parse(localNot);

  const localRet = localStorage.getItem('saronil_returnFilings');
  if (localRet) window.state.returnFilings = JSON.parse(localRet);

  // Default filter active states
  if (!window.gstSelectedGstin) window.gstSelectedGstin = "29AAAAA0000A1Z5"; // Default Saronil
  if (!window.gstSelectedPeriod) window.gstSelectedPeriod = "2026-07"; // Default July 2026
  if (!window.gstActiveTab) window.gstActiveTab = "dashboard"; // Active sub-tab

  renderGstComplianceModule(container);
};

function renderGstComplianceModule(container) {
  const selectedGSTIN = window.gstSelectedGstin;
  const selectedPeriod = window.gstSelectedPeriod;
  const activeTab = window.gstActiveTab;

  // Role Gating
  const userRole = window.state.activeUserRole || '';
  const currentPersona = window.activeBillingRole === 'ACCOUNTS_MANAGER' || userRole === 'CFO' || userRole === 'ACCOUNTS_MANAGER' ? 'Head of Accounts' 
                       : (window.activeBillingRole === 'BILLING_SUPERVISOR' || userRole === 'BILLING_SUPERVISOR' ? 'Accounts Executive' 
                       : (window.activeBillingRole === 'BILLING_EXECUTIVE' || window.activeBillingRole === 'CASHIER' ? 'Billing Executive' 
                       : (window.activeBillingRole === 'Super Admin' || userRole === 'Super Admin' ? 'Super Admin' 
                       : (window.activeBillingRole === 'AUDITOR' ? 'Statutory Auditor' : 'Statutory Auditor'))));

  // Retrieve matching invoices & rollups
  // Calculate dynamic output tax from Module 3 (state.billing collection events)
  let patientBillingRevenueTaxable = 0;
  let patientBillingRevenueExempt = 0;
  let billingCgst = 0;
  let billingSgst = 0;

  const bills = window.state.billing || [];
  bills.forEach(b => {
    // Determine target GSTIN allocation
    const isSaronil = selectedGSTIN === "29AAAAA0000A1Z5";
    const isFertiCare = selectedGSTIN === "29BBBBB1111B1Z6";

    // OPD Quick invoices / normal bills distribution:
    const isPackage = b.visitType && b.visitType.toLowerCase().includes('package');
    if (isSaronil && isPackage) return;
    if (isFertiCare && !isPackage) return;

    let billTaxable = 0;
    let billExempt = 0;
    let billGstAmt = b.taxOverrideAmount !== undefined ? b.taxOverrideAmount : (b.gstAmount || 0);

    if (b.items && b.items.length > 0) {
      b.items.forEach(item => {
        const descLower = (item.desc || '').toLowerCase();
        let isTaxable = false;
        let rate = 0;

        if (descLower.includes('cosmetic') || descLower.includes('wellness') || descLower.includes('corporate')) {
          isTaxable = true;
          rate = 18;
        } else if (descLower.includes('room rent') || descLower.includes('bed charge') || descLower.includes('private room') || descLower.includes('semi-private')) {
          const isIcu = descLower.includes('icu') || descLower.includes('ccu') || descLower.includes('hdu');
          const dailyRate = item.rate || 0;
          if (!isIcu && dailyRate > 5000) {
            isTaxable = true;
            rate = 5;
          }
        } else if (descLower.includes('pharmacy') || descLower.includes('medicine') || descLower.includes('drug')) {
          isTaxable = true;
          rate = 12;
        } else if (descLower.includes('consumables') || descLower.includes('surgical kit')) {
          isTaxable = true;
          rate = 18;
        }

        const total = item.total || (item.rate * item.qty) || 0;
        if (isTaxable) {
          billTaxable += total;
          if (b.taxOverrideAmount === undefined && !b.gstAmount) {
            billGstAmt += total * (rate / 100);
          }
        } else {
          billExempt += total;
        }
      });
    } else {
      // Fallback
      if (billGstAmt > 0) {
        billTaxable = b.amount || 0;
      } else {
        billExempt = b.amount || 0;
      }
    }

    patientBillingRevenueTaxable += billTaxable;
    patientBillingRevenueExempt += billExempt;
    billingCgst += billGstAmt / 2;
    billingSgst += billGstAmt / 2;
  });

  // Calculate non-billing revenues
  let nonBillingTaxable = 0;
  let nonBillingExempt = 0;
  let nonBillingCgst = 0;
  let nonBillingSgst = 0;

  const nbrEntries = window.state.nonBillingRevenue.filter(e => e.period === selectedPeriod && (selectedGSTIN === 'all' || e.gstin === selectedGSTIN));
  nbrEntries.forEach(e => {
    if (e.tax_classification.includes("Taxable")) {
      nonBillingTaxable += e.amount;
      nonBillingCgst += e.cgst;
      nonBillingSgst += e.sgst;
    } else {
      nonBillingExempt += e.amount;
    }
  });

  const totalTaxableTurnover = patientBillingRevenueTaxable + nonBillingTaxable;
  const totalExemptTurnover = patientBillingRevenueExempt + nonBillingExempt;
  const totalHospitalTurnover = totalTaxableTurnover + totalExemptTurnover;

  // Output Tax totals
  const outputCgstTotal = billingCgst + nonBillingCgst;
  const outputSgstTotal = billingSgst + nonBillingSgst;
  const outputTaxTotalVal = outputCgstTotal + outputSgstTotal;

  // Input side calculations
  let eligibleCgst = 0;
  let eligibleSgst = 0;
  let blockedCgst = 0;
  let blockedSgst = 0;
  let commonCgst = 0;
  let commonSgst = 0;
  let rcmLiabilityCgst = 0;
  let rcmLiabilitySgst = 0;

  const purchaseInvoices = window.state.vendorInvoices.filter(i => {
    // Exclude mismatched from net available ITC check (for safety)
    if (i.match_status === 'mismatched') return false;
    return true;
  });

  purchaseInvoices.forEach(i => {
    const cgst = i.tax_amount / 2;
    const sgst = i.tax_amount / 2;

    if (i.rcm_applicable) {
      rcmLiabilityCgst += cgst;
      rcmLiabilitySgst += sgst;
    }

    if (i.itc_eligibility_status.includes("Blocked")) {
      blockedCgst += cgst;
      blockedSgst += sgst;
    } else if (i.itc_eligibility_status.includes("Common Credit")) {
      commonCgst += cgst;
      commonSgst += sgst;
    } else {
      eligibleCgst += cgst;
      eligibleSgst += sgst;
    }
  });

  // Rule 42/43 Apportionment calculations:
  // Reversal Ratio = Exempt turnover / Total turnover
  const exemptRatio = totalHospitalTurnover > 0 ? (totalExemptTurnover / totalHospitalTurnover) : 0;
  const commonCgstReversed = commonCgst * exemptRatio;
  const commonSgstReversed = commonSgst * exemptRatio;
  const totalReversedItcVal = commonCgstReversed + commonSgstReversed;

  const commonCgstEligible = commonCgst - commonCgstReversed;
  const commonSgstEligible = commonSgst - commonSgstReversed;

  // Net Available Credit (including RCM liability paid)
  const netCgstItc = eligibleCgst + commonCgstEligible + rcmLiabilityCgst;
  const netSgstItc = eligibleSgst + commonSgstEligible + rcmLiabilitySgst;
  const netAvailableItcVal = netCgstItc + netSgstItc;

  // Net cash liability calculation (Output Tax - Net ITC + RCM Payable)
  const netGstPayableCgst = Math.max(0, outputCgstTotal - netCgstItc);
  const netGstPayableSgst = Math.max(0, outputSgstTotal - netSgstItc);
  const totalRcmPayable = rcmLiabilityCgst + rcmLiabilitySgst;
  const netGstCashLiabilityVal = netGstPayableCgst + netGstPayableSgst + totalRcmPayable;

  // Render Layout HTML
  container.innerHTML = `
    <style>
      .gst-shell {
        font-family: var(--font-sans, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif);
        color: var(--text-main, #334155);
        padding: 1.5rem;
      }
      .gst-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1.5rem;
        background: var(--bg-surface, #ffffff);
        padding: 1.25rem;
        border-radius: var(--radius-md, 8px);
        border: 1px solid var(--border-color, #e2e8f0);
      }
      .gst-header-title h2 {
        font-weight: 700;
        margin: 0;
        font-size: 1.4rem;
        color: var(--text-primary, #0f172a);
      }
      .gst-header-title div {
        font-size: 0.85rem;
        color: var(--text-muted, #64748b);
        margin-top: 0.25rem;
      }
      .gst-filters {
        display: flex;
        gap: 0.75rem;
        align-items: center;
      }
      .gst-form-control {
        padding: 0.5rem 0.75rem;
        border-radius: var(--radius-sm, 4px);
        border: 1px solid var(--border-color, #e2e8f0);
        font-size: 0.85rem;
        background-color: var(--bg-base, #ffffff);
        color: var(--text-main, #0f172a);
      }
      .gst-kpi-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 1rem;
        margin-bottom: 1.5rem;
      }
      .gst-kpi-card {
        background: var(--bg-surface, #ffffff);
        padding: 1.25rem;
        border-radius: var(--radius-md, 8px);
        border: 1px solid var(--border-color, #e2e8f0);
        box-shadow: var(--shadow-sm, 0 1px 2px 0 rgba(0, 0, 0, 0.05));
      }
      .gst-kpi-card-title {
        font-size: 0.75rem;
        font-weight: 600;
        text-transform: uppercase;
        color: var(--text-muted, #64748b);
        letter-spacing: 0.05em;
      }
      .gst-kpi-val {
        font-size: 1.5rem;
        font-weight: 700;
        margin: 0.4rem 0;
        color: var(--text-primary, #0f172a);
        font-family: 'JetBrains Mono', monospace;
      }
      .gst-kpi-sub {
        font-size: 0.75rem;
        color: var(--text-muted, #64748b);
      }
      .gst-tabs {
        display: flex;
        border-bottom: 1px solid var(--border-color, #e2e8f0);
        gap: 0.25rem;
        margin-bottom: 1.5rem;
        overflow-x: auto;
      }
      .gst-tab-btn {
        background: none;
        border: none;
        padding: 0.75rem 1rem;
        font-size: 0.85rem;
        font-weight: 500;
        color: var(--text-muted, #64748b);
        cursor: pointer;
        border-bottom: 2px solid transparent;
        white-space: nowrap;
        transition: all 0.2s ease;
      }
      .gst-tab-btn:hover {
        color: var(--color-primary, #6366f1);
      }
      .gst-tab-btn.active {
        color: var(--color-primary, #6366f1);
        border-bottom-color: var(--color-primary, #6366f1);
        font-weight: 600;
      }
      .gst-grid-2col {
        display: grid;
        grid-template-columns: 2fr 1fr;
        gap: 1.25rem;
      }
      .gst-card {
        background: var(--bg-surface, #ffffff);
        padding: 1.25rem;
        border-radius: var(--radius-md, 8px);
        border: 1px solid var(--border-color, #e2e8f0);
        margin-bottom: 1.25rem;
      }
      .gst-card h4 {
        margin-top: 0;
        margin-bottom: 0.5rem;
        font-weight: 600;
        font-size: 1rem;
        color: var(--text-primary, #0f172a);
      }
      .gst-card p {
        font-size: 0.8rem;
        color: var(--text-muted, #64748b);
        margin-bottom: 1rem;
      }
      .gst-table-wrapper {
        overflow-x: auto;
      }
      .gst-table {
        width: 100%;
        border-collapse: collapse;
        font-size: 0.8rem;
        text-align: left;
      }
      .gst-table th {
        background: var(--bg-base, #f8fafc);
        padding: 0.75rem;
        font-weight: 600;
        color: var(--text-muted, #64748b);
        border-bottom: 1px solid var(--border-color, #e2e8f0);
      }
      .gst-table td {
        padding: 0.75rem;
        border-bottom: 1px solid var(--border-color, #e2e8f0);
        color: var(--text-main, #334155);
        vertical-align: middle;
      }
      .gst-table tfoot td {
        font-weight: 700;
        background: var(--bg-base, #f8fafc);
      }
      .gst-badge {
        display: inline-block;
        padding: 0.15rem 0.4rem;
        border-radius: var(--radius-xs, 2px);
        font-size: 0.7rem;
        font-weight: 600;
        text-transform: uppercase;
      }
      .gst-badge-success { background: #ecfdf5; color: #065f46; }
      .gst-badge-warning { background: #fffbeb; color: #92400e; }
      .gst-badge-danger { background: #fef2f2; color: #991b1b; }
      .gst-badge-info { background: #eff6ff; color: #1e40af; }
      .gst-form-label {
        display: block;
        font-size: 0.75rem;
        font-weight: 600;
        color: var(--text-main, #334155);
        margin-bottom: 0.25rem;
      }
      .gst-form-group {
        margin-bottom: 0.75rem;
      }
      .gst-alert-box {
        border-left: 4px solid var(--color-warning, #f59e0b);
        background: #fffbeb;
        padding: 0.75rem;
        border-radius: 4px;
        font-size: 0.8rem;
        margin-bottom: 1rem;
        color: #92400e;
      }
      .gst-alert-box-danger {
        border-left-color: var(--color-danger, #ef4444);
        background: #fef2f2;
        color: #991b1b;
      }
      .gst-trend-bar {
        display: flex;
        align-items: flex-end;
        gap: 2rem;
        height: 160px;
        padding: 1rem;
        border-bottom: 1px solid var(--border-color, #e2e8f0);
        margin-bottom: 1rem;
        justify-content: space-around;
      }
      .gst-trend-month {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.25rem;
      }
      .gst-trend-bars {
        display: flex;
        align-items: flex-end;
        gap: 0.25rem;
        height: 120px;
      }
      .gst-trend-label {
        font-size: 0.7rem;
        font-weight: 600;
        color: var(--text-muted, #64748b);
      }
    </style>

    <div class="gst-shell">
      <!-- Main Header Control Bar -->
      <div class="gst-header">
        <div class="gst-header-title">
          <h2>Hospital GST Compliance Workspace</h2>
          <div>Consolidated outputs, ITC matching, Rule 42 reversals, and filing gate registry.</div>
        </div>
        <div class="gst-filters">
          <div>
            <select id="gst-filter-gstin" class="gst-form-control" onchange="window.switchGstGstin(this.value)">
              ${window.state.gstinMaster.map(m => `
                <option value="${m.gstin}" ${selectedGSTIN === m.gstin ? 'selected' : ''}>${m.name} [${m.gstin}]</option>
              `).join('')}
            </select>
          </div>
          <div>
            <select id="gst-filter-period" class="gst-form-control" onchange="window.switchGstPeriod(this.value)">
              <option value="2026-06" ${selectedPeriod === '2026-06' ? 'selected' : ''}>June 2026</option>
              <option value="2026-07" ${selectedPeriod === '2026-07' ? 'selected' : ''}>July 2026</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Main KPI Metrics Panel -->
      <div class="gst-kpi-grid">
        <div class="gst-kpi-card">
          <div class="gst-kpi-card-title">Output Liability (GSTR-1)</div>
          <div class="gst-kpi-val">${formatINR(outputTaxTotalVal)}</div>
          <div class="gst-kpi-sub">CGST: ${formatINR(outputCgstTotal)} | SGST: ${formatINR(outputSgstTotal)}</div>
        </div>
        <div class="gst-kpi-card">
          <div class="gst-kpi-card-title">Net Available ITC (GSTR-3B)</div>
          <div class="gst-kpi-val">${formatINR(netAvailableItcVal)}</div>
          <div class="gst-kpi-sub">Common Reversed: -${formatINR(totalReversedItcVal)}</div>
        </div>
        <div class="gst-kpi-card">
          <div class="gst-kpi-card-title">Rule 42/43 Reversal Ratio</div>
          <div class="gst-kpi-val">${(exemptRatio * 100).toFixed(1)}%</div>
          <div class="gst-kpi-sub">Exempt supply eroding input credit</div>
        </div>
        <div class="gst-kpi-card">
          <div class="gst-kpi-card-title">Net Cash Liability (PMT-06)</div>
          <div class="gst-kpi-val">${formatINR(netGstCashLiabilityVal)}</div>
          <div class="gst-kpi-sub">Includes RCM cash discharge: ${formatINR(totalRcmPayable)}</div>
        </div>
      </div>

      <!-- Tab Buttons Navigation -->
      <div class="gst-tabs">
        <button class="gst-tab-btn ${activeTab === 'dashboard' ? 'active' : ''}" onclick="window.switchGstTab('dashboard')">📊 MIS Dashboard</button>
        <button class="gst-tab-btn ${activeTab === 'output' ? 'active' : ''}" onclick="window.switchGstTab('output')">📈 Output Consolidation</button>
        <button class="gst-tab-btn ${activeTab === 'itc' ? 'active' : ''}" onclick="window.switchGstTab('itc')">📥 Input Tax Credit (ITC)</button>
        <button class="gst-tab-btn ${activeTab === 'returns' ? 'active' : ''}" onclick="window.switchGstTab('returns')">📋 Returns Filing Workspace</button>
        <button class="gst-tab-btn ${activeTab === 'notices' ? 'active' : ''}" onclick="window.switchGstTab('notices')">⚠️ Reconciliations & Notices</button>
        <button class="gst-tab-btn ${activeTab === 'calendar' ? 'active' : ''}" onclick="window.switchGstTab('calendar')">📅 Due Dates Calendar</button>
      </div>

      <!-- Tab Content Area -->
      <div id="gst-tab-content">
        ${renderActiveTabContent(activeTab, selectedGSTIN, selectedPeriod, currentPersona, {
          patientBillingRevenueTaxable,
          patientBillingRevenueExempt,
          billingCgst,
          billingSgst,
          nonBillingTaxable,
          nonBillingExempt,
          nonBillingCgst,
          nonBillingSgst,
          totalTaxableTurnover,
          totalExemptTurnover,
          totalHospitalTurnover,
          outputCgstTotal,
          outputSgstTotal,
          outputTaxTotalVal,
          eligibleCgst,
          eligibleSgst,
          blockedCgst,
          blockedSgst,
          commonCgst,
          commonSgst,
          rcmLiabilityCgst,
          rcmLiabilitySgst,
          exemptRatio,
          commonCgstReversed,
          commonSgstReversed,
          totalReversedItcVal,
          netCgstItc,
          netSgstItc,
          netAvailableItcVal,
          netGstCashLiabilityVal,
          totalRcmPayable
        })}
      </div>
    </div>
  `;
}

/* Sub-Tab Switchers */
window.switchGstGstin = function(gstin) {
  window.gstSelectedGstin = gstin;
  renderGstComplianceModule(document.getElementById('main-content'));
};

window.switchGstPeriod = function(period) {
  window.gstSelectedPeriod = period;
  renderGstComplianceModule(document.getElementById('main-content'));
};

window.switchGstTab = function(tab) {
  window.gstActiveTab = tab;
  renderGstComplianceModule(document.getElementById('main-content'));
};

// Render Tab contents dynamically
function renderActiveTabContent(tab, gstin, period, persona, calc) {
  if (persona === 'Billing Executive') {
    return `
      <div class="gst-card" style="text-align: center; padding: 3rem;">
        <span style="font-size: 3rem;">🚫</span>
        <h4 style="margin-top: 1rem; color: var(--color-danger, #ef4444);">Access Restricted</h4>
        <p style="max-width: 500px; margin: 0.5rem auto 0 auto; line-height: 1.5;">
          As a Billing Counter Executive, your taxes are auto-calculated at patient billing. You do not have permissions to access the Head of Accounts return preparation console.
        </p>
      </div>
    `;
  }

  switch(tab) {
    case 'dashboard':
      return renderGstDashboard(gstin, period, calc);
    case 'output':
      return renderOutputConsolidation(gstin, period, persona, calc);
    case 'itc':
      return renderInputTaxCredit(gstin, period, persona, calc);
    case 'returns':
      return renderReturnsWorkspace(gstin, period, persona, calc);
    case 'notices':
      return renderNoticesReconciliation(gstin, period, persona, calc);
    case 'calendar':
      return renderComplianceCalendar(gstin, period, persona, calc);
    default:
      return '';
  }
}

// TAB 1: MIS Dashboard view
function renderGstDashboard(gstin, period, calc) {
  const complianceScore = 96; // GSTR-2B Match Score

  return `
    <div class="gst-grid-2col">
      <!-- Left side: Graphical progress bar widgets & details -->
      <div>
        <div class="gst-card">
          <h4>Output Tax vs Input Tax Credit Trend</h4>
          <p>Monthly tax liability balances and offsets for active registration ${gstin}.</p>
          
          <!-- Custom CSS Bars -->
          <div class="gst-trend-bar">
            <div class="gst-trend-month">
              <div class="gst-trend-bars">
                <div style="width: 18px; height: 75px; background: #818cf8; border-radius: 2px 2px 0 0;" title="Output: ₹1,55,000"></div>
                <div style="width: 18px; height: 50px; background: #34d399; border-radius: 2px 2px 0 0;" title="ITC: ₹1,12,000"></div>
              </div>
              <span class="gst-trend-label">May 26</span>
            </div>
            <div class="gst-trend-month">
              <div class="gst-trend-bars">
                <div style="width: 18px; height: 95px; background: #818cf8; border-radius: 2px 2px 0 0;" title="Output: ₹1,95,000"></div>
                <div style="width: 18px; height: 65px; background: #34d399; border-radius: 2px 2px 0 0;" title="ITC: ₹1,35,000"></div>
              </div>
              <span class="gst-trend-label">Jun 26</span>
            </div>
            <div class="gst-trend-month">
              <div class="gst-trend-bars">
                <!-- Dynamic for July based on calculation rollups -->
                <div style="width: 18px; height: ${Math.min(110, Math.round(calc.outputTaxTotalVal / 3000))}px; background: #6366f1; border-radius: 2px 2px 0 0;" title="Output: ${formatINR(calc.outputTaxTotalVal)}"></div>
                <div style="width: 18px; height: ${Math.min(110, Math.round(calc.netAvailableItcVal / 3000))}px; background: #10b981; border-radius: 2px 2px 0 0;" title="ITC: ${formatINR(calc.netAvailableItcVal)}"></div>
              </div>
              <span class="gst-trend-label">Jul 26 (Act)</span>
            </div>
          </div>

          <div style="display: flex; gap: 1.5rem; justify-content: center; font-size: 0.75rem;">
            <div style="display: flex; align-items: center; gap: 0.25rem;">
              <span style="display: inline-block; width: 10px; height: 10px; background: #6366f1; border-radius: 2px;"></span>
              <span>Consolidated Output Tax Liability</span>
            </div>
            <div style="display: flex; align-items: center; gap: 0.25rem;">
              <span style="display: inline-block; width: 10px; height: 10px; background: #10b981; border-radius: 2px;"></span>
              <span>Net Eligible ITC (After Apportionment)</span>
            </div>
          </div>
        </div>

        <div class="gst-card">
          <h4>Rule 42 Common Credit Reversal Audit</h4>
          <p>Common inputs are reversed based on the ratio of exempt healthcare supply vs taxable services.</p>
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.75rem; background: var(--bg-base, #f8fafc); padding: 0.75rem; border-radius: 6px; margin-bottom: 0.75rem;">
            <div>
              <span style="font-size: 0.65rem; color: var(--text-muted); text-transform: uppercase;">Taxable Turnover</span>
              <div style="font-size: 0.95rem; font-weight: 700; font-family: 'JetBrains Mono', monospace; margin-top: 2px;">${formatINR(calc.totalTaxableTurnover)}</div>
            </div>
            <div>
              <span style="font-size: 0.65rem; color: var(--text-muted); text-transform: uppercase;">Exempt Turnover</span>
              <div style="font-size: 0.95rem; font-weight: 700; font-family: 'JetBrains Mono', monospace; margin-top: 2px;">${formatINR(calc.totalExemptTurnover)}</div>
            </div>
            <div>
              <span style="font-size: 0.65rem; color: var(--text-muted); text-transform: uppercase;">Rule 42 Reversed</span>
              <div style="font-size: 0.95rem; font-weight: 700; font-family: 'JetBrains Mono', monospace; margin-top: 2px; color: #b91c1c;">-${formatINR(calc.totalReversedItcVal)}</div>
            </div>
          </div>
          <div style="font-size: 0.75rem; line-height: 1.4; color: #854d0e; background: #fef9c3; padding: 0.5rem; border-radius: 4px;">
            ⚠️ <strong>Reversal Ratio Alert:</strong> ${(calc.exemptRatio * 100).toFixed(1)}% of common credits are written off due to predominantly exempt operations.
          </div>
        </div>

        <div class="gst-card">
          <h4>Multi-GSTIN Consolidated Group Summary</h4>
          <p>Rollup comparison across operating registrations under the corporate group.</p>
          <div class="gst-table-wrapper">
            <table class="gst-table">
              <thead>
                <tr>
                  <th>GSTIN Reference</th>
                  <th>Location Name</th>
                  <th style="text-align: right;">Total Turnover</th>
                  <th style="text-align: right;">Taxable Revenue</th>
                  <th style="text-align: right;">Exempt Revenue</th>
                  <th style="text-align: right;">Output Liability</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>29AAAAA0000A1Z5</td>
                  <td>Saronil Hospital (KA)</td>
                  <td style="text-align: right;">${formatINR(calc.totalHospitalTurnover)}</td>
                  <td style="text-align: right;">${formatINR(calc.totalTaxableTurnover)}</td>
                  <td style="text-align: right;">${formatINR(calc.totalExemptTurnover)}</td>
                  <td style="text-align: right; font-weight: 600;">${formatINR(calc.outputTaxTotalVal)}</td>
                </tr>
                <tr>
                  <td>29BBBBB1111B1Z6</td>
                  <td>FertiCare IVF Center (KA)</td>
                  <td style="text-align: right;">₹2,00,000.00</td>
                  <td style="text-align: right;">₹2,00,000.00</td>
                  <td style="text-align: right;">₹0.00</td>
                  <td style="text-align: right; font-weight: 600;">₹24,000.00</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Right side: Vendor Score card & notices summary -->
      <div>
        <div class="gst-card">
          <h4>Vendor compliance score</h4>
          <p>Score reflects matching consistency in government portal GSTR-2B feed. Protect your input tax credit by tracking defaults.</p>
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem;">
            <div style="font-size: 1.75rem; font-weight: 800; color: #16a34a; font-family: 'JetBrains Mono', monospace;">
              ${complianceScore}%
            </div>
            <span class="gst-badge gst-badge-success">High Matching Ratio</span>
          </div>
          <div style="font-size: 0.75rem; display: flex; flex-direction: column; gap: 0.5rem;">
            <div style="display: flex; justify-content: space-between; border-bottom: 1px solid var(--border-color); padding-bottom: 0.25rem;">
              <span>1. Apex Pharma Distributors</span>
              <strong style="color: #16a34a;">100% (Matched)</strong>
            </div>
            <div style="display: flex; justify-content: space-between; border-bottom: 1px solid var(--border-color); padding-bottom: 0.25rem;">
              <span>2. Star Health Insurance</span>
              <strong style="color: #16a34a;">100% (Matched)</strong>
            </div>
            <div style="display: flex; justify-content: space-between; border-bottom: 1px solid var(--border-color); padding-bottom: 0.25rem;">
              <span>3. MediClean Waste Sol.</span>
              <strong style="color: #16a34a;">100% (Matched)</strong>
            </div>
            <div style="display: flex; justify-content: space-between; padding-bottom: 0.25rem;">
              <span>4. Error-prone Equipment</span>
              <strong style="color: #ef4444;">0% (Portal Default)</strong>
            </div>
          </div>
          <div style="margin-top: 1rem; font-size: 0.75rem; padding: 0.5rem; background: #fff1f2; border: 1px solid #fecdd3; border-radius: 4px; color: #9f1239;">
            🛑 <strong>Hold Alert:</strong> Vendor 4 is missing GSTR-1 filings. Do not approve pending vendor balance disbursements.
          </div>
        </div>

        <div class="gst-card">
          <h4>Active Audits & Notices</h4>
          <p>Response tracker updates</p>
          <div style="display: flex; flex-direction: column; gap: 0.75rem;">
            ${window.state.gstNotices.map(n => `
              <div style="background: var(--bg-base, #f8fafc); padding: 0.6rem; border-radius: 4px; font-size: 0.75rem; border-left: 3px solid #6366f1;">
                <div style="display: flex; justify-content: space-between; font-weight: 700; margin-bottom: 0.15rem;">
                  <span>${n.notice_id}</span>
                  <span class="gst-badge ${n.status.includes('Pending') ? 'gst-badge-warning' : 'gst-badge-success'}">${n.status}</span>
                </div>
                <div>${n.notice_type}</div>
                <div style="font-size: 0.7rem; color: var(--text-muted); margin-top: 0.15rem;">Deadline: ${n.response_deadline}</div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    </div>
  `;
}

// TAB 2: Output Tax Consolidation view
function renderOutputConsolidation(gstin, period, persona, calc) {
  const isReadOnly = persona === 'Statutory Auditor';

  return `
    <div class="gst-grid-2col">
      <!-- Left: Patient billing output registers -->
      <div>
        <div class="gst-card">
          <h4>Output Tax Register: Patient Bill Consolidations</h4>
          <p>Consolidated line-item records across all medical billing services (Module 3).</p>
          <div class="gst-table-wrapper">
            <table class="gst-table">
              <thead>
                <tr>
                  <th>Billing Stream / Category</th>
                  <th style="text-align: right;">Exempt Value</th>
                  <th style="text-align: right;">Taxable Value</th>
                  <th style="text-align: right;">CGST Amount</th>
                  <th style="text-align: right;">SGST Amount</th>
                  <th>Audit Status</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>OPD Consultations & Clinical Fees</td>
                  <td style="text-align: right;">${formatINR(calc.patientBillingRevenueExempt * 0.2)}</td>
                  <td style="text-align: right;">₹0.00</td>
                  <td style="text-align: right;">₹0.00</td>
                  <td style="text-align: right;">₹0.00</td>
                  <td><span class="gst-badge gst-badge-success">Fully Exempt</span></td>
                </tr>
                <tr>
                  <td>IPD Room Rent Bed Allocations</td>
                  <td style="text-align: right;">${formatINR(calc.patientBillingRevenueExempt * 0.5)}</td>
                  <td style="text-align: right;">${formatINR(calc.patientBillingRevenueTaxable * 0.3)}</td>
                  <td style="text-align: right;">${formatINR(calc.billingCgst * 0.3)}</td>
                  <td style="text-align: right;">${formatINR(calc.billingSgst * 0.3)}</td>
                  <td><span class="gst-badge gst-badge-info">5% Threshold checked</span></td>
                </tr>
                <tr>
                  <td>OPD Pharmacy Dispenses</td>
                  <td style="text-align: right;">₹0.00</td>
                  <td style="text-align: right;">${formatINR(calc.patientBillingRevenueTaxable * 0.4)}</td>
                  <td style="text-align: right;">${formatINR(calc.billingCgst * 0.4)}</td>
                  <td style="text-align: right;">${formatINR(calc.billingSgst * 0.4)}</td>
                  <td><span class="gst-badge gst-badge-warning">12% Taxable</span></td>
                </tr>
                <tr>
                  <td>OT Consumables & Surgery Kits</td>
                  <td style="text-align: right;">₹0.00</td>
                  <td style="text-align: right;">${formatINR(calc.patientBillingRevenueTaxable * 0.3)}</td>
                  <td style="text-align: right;">${formatINR(calc.billingCgst * 0.3)}</td>
                  <td style="text-align: right;">${formatINR(calc.billingSgst * 0.3)}</td>
                  <td><span class="gst-badge gst-badge-warning">18% Taxable</span></td>
                </tr>
              </tbody>
              <tfoot>
                <tr>
                  <td>Patient Billing Rollup Sub-Total:</td>
                  <td style="text-align: right;">${formatINR(calc.patientBillingRevenueExempt)}</td>
                  <td style="text-align: right;">${formatINR(calc.patientBillingRevenueTaxable)}</td>
                  <td style="text-align: right; color: var(--color-primary);">${formatINR(calc.billingCgst)}</td>
                  <td style="text-align: right; color: var(--color-primary);">${formatINR(calc.billingSgst)}</td>
                  <td><span class="gst-badge gst-badge-success">Matches Billing Engine</span></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        <div class="gst-card">
          <h4>Non-Patient Ancillary Revenue Entries</h4>
          <p>Includes canteen lease, parking collection, referrals, staff quarters rent, scrap sales.</p>
          <div class="gst-table-wrapper">
            <table class="gst-table">
              <thead>
                <tr>
                  <th>Entry ID</th>
                  <th>Revenue Category</th>
                  <th>Classification</th>
                  <th>Date</th>
                  <th style="text-align: right;">Turnover (₹)</th>
                  <th style="text-align: right;">CGST (₹)</th>
                  <th style="text-align: right;">SGST (₹)</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                ${window.state.nonBillingRevenue.filter(e => e.period === period && (gstin === 'all' || e.gstin === gstin)).map(e => `
                  <tr>
                    <td><code>${e.entry_id}</code></td>
                    <td><strong>${e.revenue_type}</strong></td>
                    <td><span class="gst-badge ${e.tax_classification.includes('Exempt') ? 'gst-badge-success' : 'gst-badge-warning'}">${e.tax_classification}</span></td>
                    <td>${e.date}</td>
                    <td style="text-align: right;">${formatINR(e.amount)}</td>
                    <td style="text-align: right;">${formatINR(e.cgst)}</td>
                    <td style="text-align: right;">${formatINR(e.sgst)}</td>
                    <td>
                      ${!isReadOnly ? `
                        <button class="btn btn-secondary btn-sm" onclick="window.deleteNonBillingEntry('${e.entry_id}')" style="padding: 0.15rem 0.4rem; font-size: 0.7rem;">✕ Delete</button>
                      ` : '—'}
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Right: Form to add non-billing entries -->
      <div>
        <div class="gst-card">
          <h4>Log Non-Billing Revenue</h4>
          <p>Book external diagnostic services, leasing, and scrap collections.</p>
          ${isReadOnly ? `
            <div class="gst-alert-box gst-alert-box-danger">
              🚫 Read-Only access restricts entry logging.
            </div>
          ` : `
            <form id="gst-nonbilling-form" onsubmit="window.saveNonBillingEntry(event)">
              <div class="gst-form-group">
                <label class="gst-form-label">Ancillary Category / Description</label>
                <input type="text" id="nbr-desc" class="gst-form-control" placeholder="e.g. Visitor Parking leases" required style="width:100%; box-sizing:border-box;">
              </div>
              <div class="gst-form-group">
                <label class="gst-form-label">Transaction Value (₹)</label>
                <input type="number" id="nbr-amount" class="gst-form-control" placeholder="e.g. 50000" required style="width:100%; box-sizing:border-box;">
              </div>
              <div class="gst-form-group">
                <label class="gst-form-label">Tax Rate Classification</label>
                <select id="nbr-classification" class="gst-form-control" style="width:100%;">
                  <option value="Taxable (18% GST)">Taxable (18% GST)</option>
                  <option value="Taxable (12% GST)">Taxable (12% GST)</option>
                  <option value="Exempt (0% GST)">Exempt (0% GST)</option>
                </select>
              </div>
              <div class="gst-form-group">
                <label class="gst-form-label">Date of Collection</label>
                <input type="date" id="nbr-date" class="gst-form-control" value="2026-07-11" required style="width:100%; box-sizing:border-box;">
              </div>
              <button type="submit" class="btn btn-primary" style="width: 100%; margin-top: 0.5rem;">Book Revenue Entry</button>
            </form>
          `}
        </div>
      </div>
    </div>
  `;
}

window.saveNonBillingEntry = function(event) {
  event.preventDefault();
  const desc = document.getElementById('nbr-desc').value;
  const amt = parseFloat(document.getElementById('nbr-amount').value);
  const taxClass = document.getElementById('nbr-classification').value;
  const date = document.getElementById('nbr-date').value;

  let cgst = 0;
  let sgst = 0;
  if (taxClass.includes("18%")) {
    cgst = amt * 0.09;
    sgst = amt * 0.09;
  } else if (taxClass.includes("12%")) {
    cgst = amt * 0.06;
    sgst = amt * 0.06;
  }

  const newId = "NBR-" + String(window.state.nonBillingRevenue.length + 1).padStart(3, '0');
  const entry = {
    entry_id: newId,
    period: window.gstSelectedPeriod,
    revenue_type: desc,
    amount: amt,
    tax_classification: taxClass,
    cgst: cgst,
    sgst: sgst,
    igst: 0,
    gstin: window.gstSelectedGstin,
    date: date
  };

  window.state.nonBillingRevenue.push(entry);
  localStorage.setItem('saronil_nonBillingRevenue', JSON.stringify(window.state.nonBillingRevenue));
  showGstToast("Ancillary non-billing revenue logged successfully.");
  renderGstComplianceModule(document.getElementById('main-content'));
};

window.deleteNonBillingEntry = function(id) {
  window.state.nonBillingRevenue = window.state.nonBillingRevenue.filter(e => e.entry_id !== id);
  localStorage.setItem('saronil_nonBillingRevenue', JSON.stringify(window.state.nonBillingRevenue));
  showGstToast("Ancillary revenue entry removed.");
  renderGstComplianceModule(document.getElementById('main-content'));
};

// TAB 3: Input Tax Credit (ITC)
function renderInputTaxCredit(gstin, period, persona, calc) {
  const isReadOnly = persona === 'Statutory Auditor';

  return `
    <div class="gst-grid-2col">
      <!-- Left: Purchase Invoices Log with GSTR-2B Match & Sec 17(5) Gates -->
      <div>
        <div class="gst-card">
          <h4>Input Tax Credit (ITC) Purchase Register</h4>
          <p>Vendor bills registered MTD. Matches status compares invoice credit against government drafts (GSTR-2B).</p>
          <div class="gst-table-wrapper">
            <table class="gst-table">
              <thead>
                <tr>
                  <th>Invoice Ref / Date</th>
                  <th>Supplier Information</th>
                  <th>Eligibility Gate</th>
                  <th style="text-align: right;">Taxable (₹)</th>
                  <th style="text-align: right;">Input Tax (₹)</th>
                  <th>GSTR-2B Reconciliation</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                ${window.state.vendorInvoices.map(i => {
                  let gateBadge = 'gst-badge-success';
                  if (i.itc_eligibility_status.includes('Blocked')) gateBadge = 'gst-badge-danger';
                  if (i.itc_eligibility_status.includes('Common')) gateBadge = 'gst-badge-warning';

                  let matchBadge = 'gst-badge-success';
                  if (i.match_status === 'mismatched') matchBadge = 'gst-badge-danger';

                  return `
                    <tr>
                      <td>
                        <strong>${i.invoice_number}</strong><br>
                        <span style="font-size: 0.7rem; color: var(--text-muted);">${i.invoice_date}</span>
                      </td>
                      <td>
                        <strong>${i.vendor_name}</strong><br>
                        <span style="font-size: 0.7rem; color: var(--text-muted);">GSTIN: ${i.vendor_gstin}</span>
                      </td>
                      <td>
                        <span class="gst-badge ${gateBadge}">${i.itc_eligibility_status}</span>
                        ${i.rcm_applicable ? `<br><span class="gst-badge gst-badge-info" style="margin-top:0.2rem;">RCM Applicable</span>` : ''}
                      </td>
                      <td style="text-align: right;">${formatINR(i.taxable_value)}</td>
                      <td style="text-align: right;">${formatINR(i.tax_amount)}</td>
                      <td>
                        <span class="gst-badge ${matchBadge}">${i.match_status.toUpperCase()}</span>
                        ${i.discrepancy ? `<br><span style="font-size:0.65rem; color:#b91c1c;">${i.discrepancy}</span>` : ''}
                      </td>
                      <td>
                        ${!isReadOnly ? `
                          <button class="btn btn-secondary btn-sm" onclick="window.deleteVendorInvoice('${i.invoice_id}')" style="padding: 0.15rem 0.4rem; font-size: 0.7rem;">✕ Remove</button>
                        ` : '—'}
                      </td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Right: Form to add vendor invoices and calculate apportionment -->
      <div>
        <div class="gst-card">
          <h4>Book Purchase Invoice</h4>
          <p>Log a vendor credit. Category tags trigger automated section blocking.</p>
          ${isReadOnly ? `
            <div class="gst-alert-box gst-alert-box-danger">
              🚫 Read-Only access. Booking purchases is disabled.
            </div>
          ` : `
            <form id="gst-purchase-form" onsubmit="window.savePurchaseInvoice(event)">
              <div class="gst-form-group">
                <label class="gst-form-label">Vendor GSTIN</label>
                <input type="text" id="v-gstin" class="gst-form-control" placeholder="e.g. 29ABCDE1234A1Z9" required style="width:100%; box-sizing:border-box;">
              </div>
              <div class="gst-form-group">
                <label class="gst-form-label">Vendor Name</label>
                <input type="text" id="v-name" class="gst-form-control" placeholder="e.g. Apex Diagnostics Ltd" required style="width:100%; box-sizing:border-box;">
              </div>
              <div class="gst-form-group" style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem;">
                <div>
                  <label class="gst-form-label">Invoice Number</label>
                  <input type="text" id="v-invno" class="gst-form-control" placeholder="INV-1002" required style="width:100%; box-sizing:border-box;">
                </div>
                <div>
                  <label class="gst-form-label">Invoice Date</label>
                  <input type="date" id="v-invdate" class="gst-form-control" value="2026-07-11" required style="width:100%; box-sizing:border-box;">
                </div>
              </div>
              <div class="gst-form-group" style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem;">
                <div>
                  <label class="gst-form-label">Taxable Value (₹)</label>
                  <input type="number" id="v-taxable" class="gst-form-control" placeholder="100000" oninput="window.calcPurchaseTaxAmt(this.value)" required style="width:100%; box-sizing:border-box;">
                </div>
                <div>
                  <label class="gst-form-label">GST Tax Amount (₹)</label>
                  <input type="number" id="v-taxamt" class="gst-form-control" placeholder="18000" required style="width:100%; box-sizing:border-box;">
                </div>
              </div>
              <div class="gst-form-group">
                <label class="gst-form-label">ITC Eligibility Type</label>
                <select id="v-eligibility" class="gst-form-control" onchange="window.onEligibilityChange(this.value)" style="width:100%;">
                  <option value="Common Credit - Rule 42/43">Common Credit (Rule 42/43 Apportionment)</option>
                  <option value="Eligible">Direct Eligible Credit (100% Offset)</option>
                  <option value="Ineligible - Sec 17(5) Blocked (Employee Insurance)">Blocked Credit - Employee Health Ins. [Sec 17(5)]</option>
                  <option value="Ineligible - Sec 17(5) Blocked (Luxury Vehicle)">Blocked Credit - Passenger Motor Vehicle [Sec 17(5)]</option>
                  <option value="Ineligible - Sec 17(5) Blocked (Catering)">Blocked Credit - Food/Catering Services [Sec 17(5)]</option>
                </select>
              </div>

              <!-- RCM Flagging -->
              <div class="gst-form-group" style="display:flex; align-items:center; gap:0.5rem; padding: 0.25rem 0;">
                <input type="checkbox" id="v-rcm" style="margin:0;">
                <label for="v-rcm" class="gst-form-label" style="margin:0; cursor:pointer;">Is Reverse Charge (RCM) applicable?</label>
              </div>

              <!-- Hard-gated Block Warning Box -->
              <div id="itc-block-warning" class="gst-alert-box gst-alert-box-danger" style="display: none;">
                ⚠️ <strong>Hard-gated Block:</strong> Section 17(5) prohibits claiming Input Tax Credit on this expense. Net eligible credit will remain ₹0.00 for this bill.
              </div>

              <button type="submit" class="btn btn-primary" style="width:100%; margin-top:0.5rem;">Book Purchase Bill</button>
            </form>
          `}
        </div>

        <div class="gst-card">
          <h4>Rule 42 Common-Credit Apportionment</h4>
          <p>Common purchases apportioned based MTD turnover ratio:</p>
          <table style="width: 100%; font-size: 0.8rem; border-collapse: collapse; line-height: 1.6;">
            <tr style="border-bottom: 1px solid var(--border-color);">
              <td style="padding: 0.4rem 0;">Common Input Tax (T):</td>
              <td style="text-align: right; font-weight: 600;">${formatINR(calc.commonCgst + calc.commonSgst)}</td>
            </tr>
            <tr style="border-bottom: 1px solid var(--border-color);">
              <td style="padding: 0.4rem 0;">Exempt Turnover Ratio:</td>
              <td style="text-align: right; font-weight: 600; color: #b91c1c;">${(calc.exemptRatio * 100).toFixed(1)}%</td>
            </tr>
            <tr style="border-bottom: 1px solid var(--border-color); font-weight: 700;">
              <td style="padding: 0.4rem 0; color: #b91c1c;">Ineligible common reversal (Rule 42):</td>
              <td style="text-align: right; color: #b91c1c;">-${formatINR(calc.totalReversedItcVal)}</td>
            </tr>
            <tr style="font-weight: 700; color: #16a34a;">
              <td style="padding: 0.4rem 0;">Net common credit allowed:</td>
              <td style="text-align: right;">${formatINR((calc.commonCgst + calc.commonSgst) - calc.totalReversedItcVal)}</td>
            </tr>
          </table>
        </div>
      </div>
    </div>
  `;
}

window.calcPurchaseTaxAmt = function(val) {
  const num = parseFloat(val) || 0;
  const taxField = document.getElementById('v-taxamt');
  if (taxField) {
    taxField.value = Math.round(num * 0.18);
  }
};

window.onEligibilityChange = function(val) {
  const box = document.getElementById('itc-block-warning');
  if (box) {
    if (val.includes("Blocked")) {
      box.style.display = "block";
    } else {
      box.style.display = "none";
    }
  }
};

window.savePurchaseInvoice = function(event) {
  event.preventDefault();
  const gstin = document.getElementById('v-gstin').value;
  const name = document.getElementById('v-name').value;
  const invNo = document.getElementById('v-invno').value;
  const date = document.getElementById('v-invdate').value;
  const taxable = parseFloat(document.getElementById('v-taxable').value);
  let taxAmt = parseFloat(document.getElementById('v-taxamt').value);
  let eligibility = document.getElementById('v-eligibility').value;
  const rcm = document.getElementById('v-rcm').checked;

  // Enforce Section 17(5) blocked credit rules:
  if (eligibility.includes("Blocked")) {
    eligibility = "Ineligible - Sec 17(5) Blocked";
  }

  const newId = "VND-" + String(window.state.vendorInvoices.length + 1).padStart(3, '0');
  const invoice = {
    invoice_id: newId,
    vendor_gstin: gstin,
    vendor_name: name,
    invoice_number: invNo,
    invoice_date: date,
    taxable_value: taxable,
    tax_amount: taxAmt,
    hsn_sac: "9900",
    itc_eligibility_status: eligibility,
    rcm_applicable: rcm,
    match_status: "matched"
  };

  window.state.vendorInvoices.push(invoice);
  localStorage.setItem('saronil_vendorInvoices', JSON.stringify(window.state.vendorInvoices));
  showGstToast("Purchase invoice recorded successfully.");
  renderGstComplianceModule(document.getElementById('main-content'));
};

window.deleteVendorInvoice = function(id) {
  window.state.vendorInvoices = window.state.vendorInvoices.filter(i => i.invoice_id !== id);
  localStorage.setItem('saronil_vendorInvoices', JSON.stringify(window.state.vendorInvoices));
  showGstToast("Purchase invoice record removed.");
  renderGstComplianceModule(document.getElementById('main-content'));
};

// TAB 4: Returns filing workspace
function renderReturnsWorkspace(gstin, period, persona, calc) {
  const filings = window.state.returnFilings.filter(f => f.period === period && f.gstin === gstin);
  const gstr1 = filings.find(f => f.return_type === 'GSTR-1') || { status: 'draft', signoff_log: '' };
  const gstr3b = filings.find(f => f.return_type === 'GSTR-3B') || { status: 'draft', signoff_log: '' };

  const isHOA = persona === 'Head of Accounts' || persona === 'Super Admin';
  const isReadOnly = persona === 'Statutory Auditor';

  return `
    <div class="gst-grid-2col">
      <!-- GSTR-1 & GSTR-3B filing card column -->
      <div>
        <div class="gst-card">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
            <h4>GSTR-1 Outward Supplies Draft Return</h4>
            <span class="gst-badge ${gstr1.status === 'filed' ? 'gst-badge-success' : 'gst-badge-warning'}">${gstr1.status.toUpperCase()}</span>
          </div>
          <p>Consolidates B2B, B2C Small, and Exempted patient/ancillary revenues for filing.</p>
          <div class="gst-table-wrapper" style="margin-bottom: 1rem;">
            <table class="gst-table">
              <thead>
                <tr>
                  <th>Filing Schedule Table</th>
                  <th style="text-align: right;">Taxable Amount</th>
                  <th style="text-align: right;">Tax Liability (CGST+SGST)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>B2C Small Supply (OPD & IPD Bills)</td>
                  <td style="text-align: right;">${formatINR(calc.patientBillingRevenueTaxable)}</td>
                  <td style="text-align: right;">${formatINR(calc.billingCgst + calc.billingSgst)}</td>
                </tr>
                <tr>
                  <td>B2B Registered Supplies (NBR)</td>
                  <td style="text-align: right;">${formatINR(calc.nonBillingTaxable)}</td>
                  <td style="text-align: right;">${formatINR(calc.nonBillingCgst + calc.nonBillingSgst)}</td>
                </tr>
                <tr>
                  <td>Exempt Supplies Schedule</td>
                  <td style="text-align: right;">${formatINR(calc.patientBillingRevenueExempt + calc.nonBillingExempt)}</td>
                  <td style="text-align: right;">₹0.00</td>
                </tr>
              </tbody>
            </table>
          </div>

          ${gstr1.status === 'filed' ? `
            <div style="font-size: 0.75rem; background: #f0fdf4; border: 1px solid #bbf7d0; padding: 0.75rem; border-radius: 4px; color: #166534;">
              <strong>✓ GSTR-1 Filed and Locked</strong><br>
              <strong>Filing Log:</strong> ${gstr1.signoff_log}<br>
              <strong>ARN Reference:</strong> <code>${gstr1.ARN || 'AR29072600291A'}</code>
            </div>
          ` : `
            <div>
              ${isHOA ? `
                <div class="gst-alert-box" style="margin-bottom: 0.75rem;">
                  🛡️ <strong>Head of Accounts Gate:</strong> Enter filing sign-off comments below to lock GSTR-1:
                </div>
                <div style="display: flex; gap: 0.5rem; margin-bottom: 0.5rem;">
                  <input type="text" id="gstr1-signoff-comment" class="gst-form-control" placeholder="e.g. Reviewed consolidated pharmacy and room rent GST. OK." style="flex-grow: 1;">
                  <button class="btn btn-primary" onclick="window.triggerFileReturn('GSTR-1')">File GSTR-1</button>
                </div>
              ` : `
                <div style="font-size: 0.75rem; background: #fffbeb; padding: 0.5rem; border-radius: 4px; color: #92400e;">
                  ⏳ Waiting for Head of Accounts or Admin sign-off approval to file GSTR-1.
                </div>
              `}
            </div>
          `}
        </div>

        <div class="gst-card">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
            <h4>GSTR-3B Self-Assessment Offset Summary</h4>
            <span class="gst-badge ${gstr3b.status === 'filed' ? 'gst-badge-success' : 'gst-badge-warning'}">${gstr3b.status.toUpperCase()}</span>
          </div>
          <p>Consolidates net payable liability by offsetting Output Liability with Net Available input credits.</p>
          <div class="gst-table-wrapper" style="margin-bottom: 1rem;">
            <table class="gst-table">
              <thead>
                <tr>
                  <th>Component description</th>
                  <th style="text-align: right;">CGST (₹)</th>
                  <th style="text-align: right;">SGST (₹)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Total Output Tax (GSTR-1 Liability)</td>
                  <td style="text-align: right;">${formatINR(calc.outputCgstTotal)}</td>
                  <td style="text-align: right;">${formatINR(calc.outputSgstTotal)}</td>
                </tr>
                <tr>
                  <td>(-) Net Input Credit Offset (ITC Register)</td>
                  <td style="text-align: right; color: #16a34a;">-${formatINR(calc.netCgstItc)}</td>
                  <td style="text-align: right; color: #16a34a;">-${formatINR(calc.netSgstItc)}</td>
                </tr>
                <tr>
                  <td>(+) Reverse Charge (RCM Liability)</td>
                  <td style="text-align: right; font-weight: 600;">${formatINR(calc.rcmLiabilityCgst)}</td>
                  <td style="text-align: right; font-weight: 600;">${formatINR(calc.rcmLiabilitySgst)}</td>
                </tr>
                <tr style="font-weight: 700; background: var(--bg-base);">
                  <td>Net Cash Ledger Payable (PMT-06 challan):</td>
                  <td style="text-align: right; color: var(--color-primary);">${formatINR(calc.netGstCashLiabilityVal)}</td>
                  <td style="text-align: right; color: var(--color-primary);">${formatINR(calc.netGstCashLiabilityVal)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div style="font-size: 0.75rem; background: var(--bg-base, #f8fafc); border: 1px solid var(--border-color); padding: 0.75rem; border-radius: 4px; margin-bottom: 1rem; line-height: 1.4;">
            💼 <strong>Strict Challan Payment Rules:</strong><br>
            • RCM Liability amount of <strong>${formatINR(calc.totalRcmPayable)}</strong> has been separated from Credit Offsets.<br>
            • System offset validation logic: <strong style="color: #16a34a;">Cash payment ledger enforced. RCM ledger offset blocked.</strong>
          </div>

          ${gstr3b.status === 'filed' ? `
            <div style="font-size: 0.75rem; background: #f0fdf4; border: 1px solid #bbf7d0; padding: 0.75rem; border-radius: 4px; color: #166534;">
              <strong>✓ GSTR-3B Filed and Locked</strong><br>
              <strong>Filing Log:</strong> ${gstr3b.signoff_log}<br>
              <strong>ARN Reference:</strong> <code>${gstr3b.ARN || 'AR29072600350B'}</code>
            </div>
          ` : `
            <div>
              ${gstr1.status !== 'filed' ? `
                <div style="font-size: 0.75rem; color: #b91c1c; background: #fef2f2; padding: 0.6rem; border-radius: 4px; display:flex; align-items:center; gap:0.4rem;">
                  🚫 <strong>Sequential filing lock:</strong> You must file GSTR-1 before GSTR-3B can be filed.
                </div>
                <button class="btn btn-secondary" disabled style="width:100%; margin-top:0.5rem;">File GSTR-3B (Locked)</button>
              ` : `
                ${isHOA ? `
                  <div class="gst-alert-box" style="margin-bottom: 0.75rem;">
                    Enter Head of Accounts sign-off description to authorize GSTR-3B filing:
                  </div>
                  <div style="display: flex; gap: 0.5rem; margin-bottom: 0.5rem;">
                    <input type="text" id="gstr3b-signoff-comment" class="gst-form-control" placeholder="e.g. Challan payment processed via SBI cash desk. Filed." style="flex-grow: 1;">
                    <button class="btn btn-primary" onclick="window.triggerFileReturn('GSTR-3B')">File GSTR-3B</button>
                  </div>
                ` : `
                  <div style="font-size: 0.75rem; background: #fffbeb; padding: 0.5rem; border-radius: 4px; color: #92400e;">
                    ⏳ Waiting for Head of Accounts sign-off approval to file GSTR-3B.
                  </div>
                `}
              `}
            </div>
          `}
        </div>
      </div>

      <!-- Right: GSTR-9 Annual consolidation desk -->
      <div>
        <div class="gst-card">
          <h4>GSTR-9 / 9C Annual Reconciliation Desk</h4>
          <p>Annual GST return consolidation workbench pulling full financial year datasets.</p>
          <div style="background: var(--bg-base, #f8fafc); border: 1px solid var(--border-color); padding: 0.75rem; border-radius: 6px; font-size: 0.75rem; line-height: 1.6;">
            <div style="font-weight: 700; margin-bottom: 0.5rem; text-transform: uppercase;">Consolidated FY 2025-26 Summary</div>
            <div style="display: flex; justify-content: space-between; border-bottom: 1px solid var(--border-color); padding: 0.2rem 0;">
              <span>Consolidated Taxable Turnover:</span>
              <strong>₹2,42,10,000.00</strong>
            </div>
            <div style="display: flex; justify-content: space-between; border-bottom: 1px solid var(--border-color); padding: 0.2rem 0;">
              <span>Consolidated Exempt Turnover:</span>
              <strong>₹18,52,40,000.00</strong>
            </div>
            <div style="display: flex; justify-content: space-between; border-bottom: 1px solid var(--border-color); padding: 0.2rem 0;">
              <span>Consolidated Output GST:</span>
              <strong>₹28,15,400.00</strong>
            </div>
            <div style="display: flex; justify-content: space-between; border-bottom: 1px solid var(--border-color); padding: 0.2rem 0;">
              <span>Consolidated Eligible ITC:</span>
              <strong>₹14,21,900.00</strong>
            </div>
            <div style="display: flex; justify-content: space-between; padding-top: 0.2rem;">
              <span>Reconciled Match:</span>
              <strong style="color: #16a34a;">✓ GSTR-9 vs GSTR-9C Matched</strong>
            </div>
          </div>
          <div style="margin-top: 1rem; font-size: 0.75rem; color: var(--text-muted);">
            Annual Filing is scheduled to open in December. The books vs filed GST audits show a zero-variance match.
          </div>
        </div>
      </div>
    </div>
  `;
}

window.triggerFileReturn = function(returnType) {
  const commentInputId = returnType === 'GSTR-1' ? 'gstr1-signoff-comment' : 'gstr3b-signoff-comment';
  const commentEl = document.getElementById(commentInputId);
  const comment = commentEl ? commentEl.value.trim() : '';

  if (!comment) {
    showGstToast("Filing sign-off comment is mandatory. Silent filings are blocked.", "error");
    return;
  }

  const filing = window.state.returnFilings.find(f => f.period === window.gstSelectedPeriod && f.return_type === returnType && f.gstin === window.gstSelectedGstin);
  if (filing) {
    filing.status = 'filed';
    filing.filed_by = 'Kavita Iyer (Head of Accounts)';
    filing.filed_date = new Date().toISOString().split('T')[0];
    filing.ARN = "AR2907" + String(Math.floor(100000 + Math.random() * 900000)) + "X";
    filing.signoff_log = `Approved & Signed off by Kavita Iyer on ${new Date().toLocaleString()} - Justification: "${comment}"`;

    localStorage.setItem('saronil_returnFilings', JSON.stringify(window.state.returnFilings));
    showGstToast(`${returnType} successfully marked as FILED and locked.`);
    renderGstComplianceModule(document.getElementById('main-content'));
  }
};

// TAB 5: Reconciliations & Notices
function renderNoticesReconciliation(gstin, period, persona, calc) {
  const isReadOnly = persona === 'Statutory Auditor';

  return `
    <div class="gst-grid-2col">
      <!-- GSTR-2B vs purchase register reconciliation -->
      <div>
        <div class="gst-card">
          <h4>GSTR-2B Inward Matching Ledger</h4>
          <p>Compares purchases entered into books against portal auto-drafted statement (GSTR-2B).</p>
          <div class="gst-table-wrapper">
            <table class="gst-table">
              <thead>
                <tr>
                  <th>Vendor Invoice</th>
                  <th>Supplier Info</th>
                  <th style="text-align: right;">Book Credit (₹)</th>
                  <th style="text-align: right;">GSTR-2B Credit (₹)</th>
                  <th>Match Status</th>
                  <th>Discrepancy Notes</th>
                </tr>
              </thead>
              <tbody>
                ${window.state.vendorInvoices.map(i => {
                  const mismatch = i.match_status === 'mismatched';
                  return `
                    <tr>
                      <td><strong>${i.invoice_number}</strong></td>
                      <td>${i.vendor_name}</td>
                      <td style="text-align: right;">${formatINR(i.tax_amount)}</td>
                      <td style="text-align: right;">${mismatch ? '₹0.00' : formatINR(i.tax_amount)}</td>
                      <td>
                        <span class="gst-badge ${mismatch ? 'gst-badge-danger' : 'gst-badge-success'}">${i.match_status.toUpperCase()}</span>
                      </td>
                      <td style="font-size: 0.75rem; color: ${mismatch ? '#ef4444' : 'var(--text-muted)'};">
                        ${mismatch ? i.discrepancy : 'Validated in government portal'}
                      </td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>

        <div class="gst-card">
          <h4>Departmental Notices Tracker</h4>
          <p>Track ASMT-10 or DRC-01 compliance notice reply deadlines.</p>
          <div class="gst-table-wrapper">
            <table class="gst-table">
              <thead>
                <tr>
                  <th>Notice ID</th>
                  <th>Type</th>
                  <th>Received</th>
                  <th>Deadline</th>
                  <th>Assigned to</th>
                  <th>Status</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                ${window.state.gstNotices.map(n => `
                  <tr>
                    <td><code>${n.notice_id}</code></td>
                    <td><strong>${n.notice_type}</strong></td>
                    <td>${n.received_date}</td>
                    <td style="font-weight:600; color:#b91c1c;">${n.response_deadline}</td>
                    <td>${n.assigned_to}</td>
                    <td><span class="gst-badge ${n.status.includes('Pending') ? 'gst-badge-warning' : 'gst-badge-success'}">${n.status}</span></td>
                    <td style="font-size: 0.75rem;">${n.description}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Right: Actions for Notices -->
      <div>
        <div class="gst-card">
          <h4>Log GST Notice</h4>
          <p>Log newly received ASMT-10 or DRC-01 notices from central/state tax authorities.</p>
          ${isReadOnly ? `
            <div class="gst-alert-box gst-alert-box-danger">
              🚫 Read-Only access. Notice logging disabled.
            </div>
          ` : `
            <form id="gst-notice-form" onsubmit="window.saveGstNotice(event)">
              <div class="gst-form-group">
                <label class="gst-form-label">Notice ID / Reference</label>
                <input type="text" id="nt-id" class="gst-form-control" placeholder="e.g. GST-2026-N03" required style="width:100%; box-sizing:border-box;">
              </div>
              <div class="gst-form-group">
                <label class="gst-form-label">Notice Type</label>
                <select id="nt-type" class="gst-form-control" style="width:100%;">
                  <option value="ASMT-10 (Scrutiny of Returns)">ASMT-10 (Scrutiny of Returns)</option>
                  <option value="DRC-01 (Show Cause Notice)">DRC-01 (Show Cause Notice)</option>
                  <option value="GST RFD-08 (Refund Disallowance)">GST RFD-08 (Refund Disallowance)</option>
                </select>
              </div>
              <div class="gst-form-group" style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem;">
                <div>
                  <label class="gst-form-label">Received Date</label>
                  <input type="date" id="nt-received" class="gst-form-control" value="2026-07-11" required style="width:100%; box-sizing:border-box;">
                </div>
                <div>
                  <label class="gst-form-label">Reply Deadline</label>
                  <input type="date" id="nt-deadline" class="gst-form-control" value="2026-08-11" required style="width:100%; box-sizing:border-box;">
                </div>
              </div>
              <div class="gst-form-group">
                <label class="gst-form-label">Brief Description of Dispute</label>
                <textarea id="nt-desc" class="gst-form-control" rows="3" placeholder="Discrepancy in GSTR-3B vs GSTR-2B input claims..." required style="width:100%; box-sizing:border-box; font-family:inherit; font-size:0.85rem;"></textarea>
              </div>
              <button type="submit" class="btn btn-primary" style="width:100%; margin-top:0.5rem;">Log Notice Entry</button>
            </form>
          `}
        </div>

        <div class="gst-card">
          <h4>Revenue Leakage Check</h4>
          <p>Compares hospital general ledgers vs GSTR-1 filed returns:</p>
          <div style="font-size: 0.75rem; line-height: 1.5;">
            • July billing ledger revenue: <strong>${formatINR(calc.patientBillingRevenueTaxable + calc.patientBillingRevenueExempt)}</strong><br>
            • GSTR-1 Consolidated schedule: <strong>${formatINR(calc.totalTaxableTurnover + calc.totalExemptTurnover)}</strong><br>
            • Variance: <strong style="color: #16a34a;">₹0.00 (Zero variance)</strong>
          </div>
        </div>
      </div>
    </div>
  `;
}

window.saveGstNotice = function(event) {
  event.preventDefault();
  const id = document.getElementById('nt-id').value;
  const type = document.getElementById('nt-type').value;
  const rec = document.getElementById('nt-received').value;
  const dead = document.getElementById('nt-deadline').value;
  const desc = document.getElementById('nt-desc').value;

  const notice = {
    notice_id: id,
    notice_type: type,
    received_date: rec,
    response_deadline: dead,
    assigned_to: "Kavita Iyer (Head of Accounts)",
    status: "Pending Response",
    description: desc
  };

  window.state.gstNotices.push(notice);
  localStorage.setItem('saronil_gstNotices', JSON.stringify(window.state.gstNotices));
  showGstToast("GST compliance notice logged.");
  renderGstComplianceModule(document.getElementById('main-content'));
};

// TAB 6: Compliance Calendar
function renderComplianceCalendar(gstin, period, persona, calc) {
  return `
    <div class="gst-grid-2col">
      <!-- Interactive Calendar Deadlines -->
      <div>
        <div class="gst-card">
          <h4>Compliance Due Dates Timeline</h4>
          <p>Calendar displays critical GST compliance dates. Reminders escalate based on deadline closeness.</p>
          <div style="display: flex; flex-direction: column; gap: 0.75rem;">
            ${window.state.complianceCalendar.map(c => {
              // Calculate remaining days relative to simulated date 2026-07-11
              const due = new Date(c.due_date);
              const now = new Date("2026-07-11");
              const timeDiff = due.getTime() - now.getTime();
              const daysRemaining = Math.ceil(timeDiff / (1000 * 3600 * 24));

              let alertStyle = "background:#ecfdf5; border-color:#a7f3d0; color:#065f46;";
              let badgeClass = "gst-badge-success";
              let daysText = `${daysRemaining} days remaining`;

              if (daysRemaining < 0) {
                alertStyle = "background:#fef2f2; border-color:#fca5a5; color:#991b1b;";
                badgeClass = "gst-badge-danger";
                daysText = `OVERDUE by ${Math.abs(daysRemaining)} days`;
              } else if (daysRemaining <= 3) {
                alertStyle = "background:#fef2f2; border-color:#fca5a5; color:#991b1b;";
                badgeClass = "gst-badge-danger";
              } else if (daysRemaining <= 9) {
                alertStyle = "background:#fffbeb; border-color:#fde68a; color:#92400e;";
                badgeClass = "gst-badge-warning";
              }

              return `
                <div style="border-left: 5px solid; padding: 0.75rem; border-radius: 4px; display: flex; justify-content: space-between; align-items: center; ${alertStyle}">
                  <div>
                    <h5 style="margin: 0; font-weight: 700; font-size: 0.85rem;">${c.return_type} [Period: ${c.period}]</h5>
                    <span style="font-size: 0.75rem; opacity: 0.95;">${c.details} | <strong>Due:</strong> ${c.due_date}</span>
                  </div>
                  <div>
                    <span class="gst-badge ${badgeClass}">${daysText}</span>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      </div>

      <!-- Right: Escalation logic info card -->
      <div>
        <div class="gst-card">
          <h4>Compliance Escalation System</h4>
          <p>Alert hierarchy config for return deadlines:</p>
          <div style="font-size: 0.75rem; line-height: 1.6;">
            • <strong>T-15 Days:</strong> Informational yellow status badge on calendars.<br>
            • <strong>T-7 Days:</strong> Head of Accounts notification warning banners.<br>
            • <strong>T-3 Days:</strong> Escalating alerts to CFO dashboard and email triggers.<br>
            • <strong>Overdue:</strong> Direct compliance hold on billing locks.
          </div>
        </div>
      </div>
    </div>
  `;
}
