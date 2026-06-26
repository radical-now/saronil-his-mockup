/* ==========================================================================
   SARONIL HMS - INSURANCE, TPA & GOVERNMENT PAYER MODULE (insuranceView.js)
   ========================================================================== */

// Global state trackers for the module if not already set up
if (!state.insuranceMasters) {
  state.insuranceMasters = {
    payermaster: [
      { code: "PAY-001", name: "Star Health Insurance", type: "Insurance — Cashless", contact: "Rajesh Kumar", phone: "+91 98765 43210", email: "cashless@starhealth.in", portal: "https://portal.starhealth.in", submission: "Portal", format: "Standard", tatPreauth: 4, tatQuery: 7, tatSettlement: 30, status: "Empanelled", validity: "2028-12-31" },
      { code: "PAY-002", name: "Niva Bupa Health", type: "Insurance — Cashless", contact: "Anjali Sharma", phone: "+91 98111 22233", email: "preauth@nivabupa.com", portal: "https://partner.nivabupa.com", submission: "API", format: "Standard", tatPreauth: 2, tatQuery: 5, tatSettlement: 15, status: "Empanelled", validity: "2027-06-30" },
      { code: "PAY-003", name: "Medi Assist TPA (Care Health)", type: "Insurance — TPA Cashless", contact: "Sanjay Gupta", phone: "+91 80 4012 3456", email: "info@mediassist.in", portal: "https://mediassisttpa.in", submission: "Portal", format: "MediAssist Template", tatPreauth: 3, tatQuery: 7, tatSettlement: 20, status: "Empanelled", validity: "2029-01-15" },
      { code: "PAY-004", name: "CGHS Delhi / NCR", type: "CGHS — Cashless", contact: "Dr. R. K. Prasad (AD)", phone: "+91 11 2306 1234", email: "cghs-delhi@gov.in", portal: "https://cghs.nic.in", submission: "Portal", format: "CGHS Claim Format", tatPreauth: 24, tatQuery: 15, tatSettlement: 90, status: "Empanelled", validity: "2026-12-31" },
      { code: "PAY-005", name: "ECHS Head Office", type: "ECHS", contact: "Col. V. S. Malik", phone: "+91 11 2568 2345", email: "echs-hq@nic.in", portal: "https://echs.gov.in", submission: "Portal", format: "ECHS Claim Format", tatPreauth: 24, tatQuery: 15, tatSettlement: 90, status: "Empanelled", validity: "2027-10-31" },
      { code: "PAY-006", name: "Ayushman Bharat / PMJAY", type: "PMJAY / Ayushman Bharat", contact: "SHA Nodal Officer", phone: "14555", email: "cghs-pmjay@nha.gov.in", portal: "https://pmjay.gov.in", submission: "Portal", format: "NHA Portal Format", tatPreauth: 12, tatQuery: 5, tatSettlement: 45, status: "Empanelled", validity: "2030-01-01" },
      { code: "PAY-007", name: "Star Health Reimbursement", type: "Insurance — Reimbursement", contact: "Rajesh Kumar", phone: "+91 98765 43210", email: "reimburse@starhealth.in", portal: "N/A", submission: "Physical", format: "Standard", tatPreauth: 0, tatQuery: 10, tatSettlement: 30, status: "Empanelled", validity: "2028-12-31" }
    ],
    ratemaster: [
      { code: "SRV-001", name: "ICU Charges (Per Day)", standardMRP: 12000, rates: { "PAY-001": 10500, "PAY-002": 10000, "PAY-003": 9500, "PAY-004": 6500, "PAY-005": 6500, "PAY-006": 4000 } },
      { code: "SRV-002", name: "Private Room Charges (Per Day)", standardMRP: 7500, rates: { "PAY-001": 6800, "PAY-002": 6500, "PAY-003": 6200, "PAY-004": 4500, "PAY-005": 4500, "PAY-006": 2000 } },
      { code: "SRV-003", name: "Semi-Private Room Charges (Per Day)", standardMRP: 4500, rates: { "PAY-001": 4000, "PAY-002": 3900, "PAY-003": 3800, "PAY-004": 3000, "PAY-005": 3000, "PAY-006": 1200 } },
      { code: "SRV-004", name: "General Ward Charges (Per Day)", standardMRP: 2500, rates: { "PAY-001": 2200, "PAY-002": 2100, "PAY-003": 2000, "PAY-004": 1500, "PAY-005": 1500, "PAY-006": 600 } },
      { code: "SRV-005", name: "Laparoscopic Cholecystectomy Package", standardMRP: 85000, rates: { "PAY-001": 78000, "PAY-002": 75000, "PAY-003": 74000, "PAY-004": 32500, "PAY-005": 32500, "PAY-006": 22000 } },
      { code: "SRV-006", name: "Cardiac Angioplasty (Single Stent)", standardMRP: 160000, rates: { "PAY-001": 145000, "PAY-002": 140000, "PAY-003": 138000, "PAY-004": 82000, "PAY-005": 82000, "PAY-006": 65000 } },
      { code: "SRV-007", name: "CT Brain with Contrast", standardMRP: 6500, rates: { "PAY-001": 5800, "PAY-002": 5500, "PAY-003": 5400, "PAY-004": 3500, "PAY-005": 3500, "PAY-006": 2500 } }
    ],
    nonpayables: [
      { code: "NP-001", name: "Attendant Bed/Charges", reason: "Standard IRDA Non-Admissible Service", autoFlag: true, informAtAdmission: true },
      { code: "NP-002", name: "Admission / Registration Fee", reason: "IRDA Excluded Administrative Cost", autoFlag: true, informAtAdmission: true },
      { code: "NP-003", name: "Toiletries Kit / Personal Care Kit", reason: "Payer-specific Exclusion Rules", autoFlag: true, informAtAdmission: true },
      { code: "NP-004", name: "Patient Diet Extra Food / Beverage", reason: "IRDA Excluded Expense", autoFlag: true, informAtAdmission: false },
      { code: "NP-005", name: "Telephone & TV Service Charges", reason: "Patient Comfort Exclusion", autoFlag: true, informAtAdmission: true },
      { code: "NP-006", name: "Cosmetics / Creams / Moisturisers", reason: "Medical Consumables Guidelines", autoFlag: true, informAtAdmission: false }
    ],
    documentchecklist: {
      "Preauth": [
        { name: "Insurance Card / Govt Health Card", mandatory: true, format: "PDF / Original Scan" },
        { name: "Treating Doctor's Admission Advice Letter", mandatory: true, format: "PDF" },
        { name: "Photo Identity Proof (Aadhaar / Voter ID)", mandatory: true, format: "PDF / Original Scan" },
        { name: "Clinical Referral Letter (Dispensary / CGHS)", mandatory: false, format: "Attested Copy" }
      ],
      "Enhancement": [
        { name: "Detailed Interim Treatment Cost Summary", mandatory: true, format: "PDF" },
        { name: "Updated Treating Doctor Justification Letter", mandatory: true, format: "Signed PDF" },
        { name: "Latest Clinical Investigation & Lab Reports", mandatory: true, format: "PDF" }
      ],
      "Final Claim": [
        { name: "Final Itemised Sticker Bill (Payer Format)", mandatory: true, format: "Original Scan" },
        { name: "Signed Discharge Summary (Doctor & Patient)", mandatory: true, format: "Original PDF" },
        { name: "Operation Theatre Notes / Anaesthesia Sheet", mandatory: false, format: "Signed Scan" },
        { name: "Implant Invoice & Barcode Sticker Sheet", mandatory: false, format: "Original Sticker Scan" },
        { name: "Patient Handover Acknowledgement Form", mandatory: true, format: "PDF" }
      ]
    },
    wardentitlements: [
      { category: "CGHS Pensioner - General", payLevel: "Level 1 to 5", entitlement: "General Ward" },
      { category: "CGHS Pensioner - Semi-Private", payLevel: "Level 6 to 10", entitlement: "Semi-Private Room" },
      { category: "CGHS Pensioner - Private", payLevel: "Level 11 & above", entitlement: "Private Room" },
      { category: "Corporate Silver", payLevel: "Grade M1 - M3", entitlement: "Semi-Private Room" },
      { category: "Corporate Gold / Platinum", payLevel: "Grade M4 & above", entitlement: "Private Room" }
    ]
  };
}

// Default states
state.claims.forEach(c => {
  if (!c.auditHistory) c.auditHistory = [];
  if (!c.queries) c.queries = [];
  if (!c.enhancements) c.enhancements = [];
  if (!c.stage) c.stage = "Payer Declaration";
  if (!c.payerCategory) c.payerCategory = "Insurance — Cashless";
  if (!c.nonPayableAmt) c.nonPayableAmt = 0;
  if (!c.roomDiffAmt) c.roomDiffAmt = 0;
  if (!c.advanceAmt) c.advanceAmt = 0;
  if (!c.coPayAmt) c.coPayAmt = 0;
  if (!c.totalBillAmt) c.totalBillAmt = c.estimatedAmt || 45000;
  if (!c.eligibilityChecks) {
    c.eligibilityChecks = [
      { id: 1, name: "Policy / Card valid and not expired", status: "Pass", notes: "" },
      { id: 2, name: "Patient listed as beneficiary on policy", status: "Pass", notes: "" },
      { id: 3, name: "Hospital empanelment is active", status: "Pass", notes: "" },
      { id: 4, name: "Waiting periods check passed", status: "Pass", notes: "" },
      { id: 5, name: "Referral / Admitting documents present", status: "Pass", notes: "" }
    ];
  }
});

// Seed mock claim if empty
if (state.claims.length === 0 && state.patients.length > 0) {
  const p = state.patients.find(pt => pt.status === 'Admitted') || state.patients[0];
  state.claims.push({
    id: "CLM9001",
    uhid: p.uhid,
    patientName: p.name,
    insurer: "Star Health Insurance",
    payerCategory: "Insurance — Cashless",
    estimatedAmt: 65000,
    approvedAmt: 45000,
    status: "Query Raised",
    preAuthNo: "AUTH70023",
    stage: "Query Management",
    totalBillAmt: 68500,
    nonPayableAmt: 3500,
    roomDiffAmt: 1500,
    advanceAmt: 5000,
    coPayAmt: 4500,
    queries: [
      {
        id: "Q-101",
        stage: "Preauth",
        type: "Clinical",
        text: "Please provide last 3 years of clinical history regarding diabetes treatment.",
        receivedDate: "2026-06-25T10:30:00Z",
        deadlineDate: "2026-07-02T10:30:00Z",
        status: "Open",
        assignedTo: "TPA Executive",
        responses: []
      }
    ],
    enhancements: [],
    eligibilityChecks: [
      { id: 1, name: "Policy / Card valid and not expired", status: "Pass", notes: "" },
      { id: 2, name: "Patient listed as beneficiary on policy", status: "Pass", notes: "" },
      { id: 3, name: "Hospital empanelment is active", status: "Pass", notes: "" },
      { id: 4, name: "Waiting periods check passed", status: "Pass", notes: "" },
      { id: 5, name: "Referral / Admitting documents present", status: "Pass", notes: "" }
    ],
    documents: [
      { name: "Insurance Card / Govt Health Card", status: "Verified" },
      { name: "Treating Doctor's Admission Advice Letter", status: "Verified" },
      { name: "Photo Identity Proof (Aadhaar / Voter ID)", status: "Verified" }
    ],
    intimation: { refNo: "INT998877", dateTime: "2026-06-25T11:00", sentBy: "TPA Exec Ramesh", mode: "Portal" },
    auditHistory: [
      { timestamp: "2026-06-25 11:05:22.000", user: "Ramesh Sharma", role: "TPA Executive", action: "Declaration Created", remarks: "Patient declared Star Cashless policy" },
      { timestamp: "2026-06-25 11:15:10.000", user: "Ramesh Sharma", role: "TPA Executive", action: "Eligibility Verified", remarks: "All checks passed successfully" }
    ]
  });
}

// Current variables
let currentInsuranceRole = localStorage.getItem("insuranceActiveRole") || "TPA_EXECUTIVE";
let activeInsuranceTab = "dashboard";
let selectedClaimId = null;

function formatINR(val) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(val || 0);
}

const INSURANCE_ROLES = {
  TPA_EXECUTIVE: { name: "TPA Executive", desc: "Front Desk & Claim Logging" },
  TPA_SUPERVISOR: { name: "TPA Supervisor", desc: "Approvals & Conversion Overrides" },
  BILLING_EXECUTIVE: { name: "Billing Executive", desc: "View preauth & compile billing" },
  BILLING_SUPERVISOR: { name: "Billing Supervisor", desc: "Approve settlement differences" },
  ACCOUNTS_MANAGER: { name: "Accounts Manager", desc: "Post credit settlements & aging" },
  CASHIER: { name: "Cashier", desc: "Collect co-pays & gatepass clearance" },
  MEDICAL_RECORDS: { name: "Medical Records (MRD)", desc: "Upload summaries & reports" },
  DOCTOR: { name: "Treating Doctor", desc: "Clinical validation" }
};

window.views.insurance = function(container, subAnchor, params) {
  if (params && params.claimId) {
    selectedClaimId = params.claimId;
    activeInsuranceTab = "workflow";
  }
  renderInsuranceView(container);
};

function renderInsuranceView(container) {
  container.innerHTML = `
    <!-- Main Outer Shell with Tailwind Light Theme styling -->
    <div class="space-y-6 font-sans antialiased text-slate-800 bg-[#F8FAFC] min-h-screen p-1">
      
      <!-- Premium Module Header Bar -->
      <div class="flex flex-col md:flex-row md:items-center md:justify-between pb-6 border-b border-slate-200">
        <div>
          <div class="flex items-center gap-2">
            <span class="text-2xl">🛡️</span>
            <h1 class="text-2xl font-bold tracking-tight text-slate-900" style="font-family: 'Outfit', sans-serif;">
              Insurance, TPA & Govt Payer Hub
            </h1>
          </div>
          <p class="text-sm text-slate-500 mt-1">
            Real-time RCM manager: cashless eligibility verification, query desk, and credit settlement logs
          </p>
        </div>

        <div class="mt-4 md:mt-0 flex items-center gap-3 bg-white p-2 rounded-xl border border-slate-200 shadow-sm">
          <label class="text-xs font-semibold text-slate-500 uppercase tracking-wider pl-1">Desk View:</label>
          <select id="ins-role-switcher" class="block w-52 rounded-lg border-slate-200 bg-slate-50 px-2 py-1.5 text-xs font-medium text-slate-700 outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400" onchange="window.switchInsuranceRole(this.value)">
            ${Object.entries(INSURANCE_ROLES).map(([key, val]) => `
              <option value="${key}" ${currentInsuranceRole === key ? 'selected' : ''}>${val.name}</option>
            `).join('')}
          </select>
        </div>
      </div>

      <!-- Navigation Tabs (Tailwind styling) -->
      <div class="flex border-b border-slate-200 bg-white rounded-xl shadow-sm p-1 gap-1">
        <button class="flex-1 md:flex-none px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${activeInsuranceTab === 'dashboard' ? 'bg-[#1B3A5C] text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'}" onclick="window.switchInsTab('dashboard')">
          🏠 Dashboard
        </button>
        <button class="flex-1 md:flex-none px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${activeInsuranceTab === 'queue' ? 'bg-[#1B3A5C] text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'}" onclick="window.switchInsTab('queue')">
          📋 Queue
        </button>
        <button class="flex-1 md:flex-none px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${activeInsuranceTab === 'workflow' ? 'bg-[#1B3A5C] text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'}" onclick="window.switchInsTab('workflow')">
          🔄 Workflow Engine
        </button>
        <button class="flex-1 md:flex-none px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${activeInsuranceTab === 'masters' ? 'bg-[#1B3A5C] text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'}" onclick="window.switchInsTab('masters')">
          ⚙️ Masters Config
        </button>
        <button class="flex-1 md:flex-none px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${activeInsuranceTab === 'reports' ? 'bg-[#1B3A5C] text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'}" onclick="window.switchInsTab('reports')">
          📈 RCM Reports
        </button>
      </div>

      <!-- Main Workspace Container -->
      <div id="ins-workspace">
        <!-- Loaded dynamically -->
      </div>
    </div>
  `;

  renderActiveTab();
}

window.switchInsuranceRole = function(role) {
  currentInsuranceRole = role;
  localStorage.setItem("insuranceActiveRole", role);
  renderActiveTab();
};

window.switchInsTab = function(tabName) {
  activeInsuranceTab = tabName;
  const container = document.getElementById('main-content');
  renderInsuranceView(container);
};

function renderActiveTab() {
  const space = document.getElementById('ins-workspace');
  if (!space) return;

  if (activeInsuranceTab === "dashboard") {
    renderDashboardTab(space);
  } else if (activeInsuranceTab === "queue") {
    renderQueueTab(space);
  } else if (activeInsuranceTab === "workflow") {
    renderWorkflowTab(space);
  } else if (activeInsuranceTab === "masters") {
    renderMastersTab(space);
  } else if (activeInsuranceTab === "reports") {
    renderReportsTab(space);
  }
}

// ----------------------------------------------------
// TAB 1: EXECUTIVE DASHBOARD
// ----------------------------------------------------
function renderDashboardTab(space) {
  const pendingEligibility = state.claims.filter(c => c.stage === 'Payer Declaration' || !c.eligibilityStatus).length;
  const pendingPreauth = state.claims.filter(c => c.stage === 'Pre-Authorisation' && c.status === 'Pending').length;
  const overdueQueries = state.claims.filter(c => c.queries && c.queries.some(q => q.status === 'Open')).length;
  const totalOutstandingAmt = state.claims.reduce((acc, c) => acc + (c.status === 'Approved' ? (c.totalBillAmt - c.approvedAmt) : 0), 0);

  space.innerHTML = `
    <!-- Tailwind Metrics Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-5 mb-6">
      <div class="bg-white border border-slate-200 rounded-xl p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
        <div class="w-12 h-12 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center text-xl">📋</div>
        <div>
          <div class="text-2xl font-bold text-slate-900">${pendingEligibility}</div>
          <span class="text-xs font-medium text-slate-500 uppercase tracking-wider">Pending Eligibility</span>
        </div>
      </div>
      
      <div class="bg-white border border-slate-200 rounded-xl p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
        <div class="w-12 h-12 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center text-xl">⏳</div>
        <div>
          <div class="text-2xl font-bold text-slate-900">${pendingPreauth}</div>
          <span class="text-xs font-medium text-slate-500 uppercase tracking-wider">Pending Preauths</span>
        </div>
      </div>

      <div class="bg-white border border-slate-200 rounded-xl p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
        <div class="w-12 h-12 rounded-lg bg-red-50 text-red-600 flex items-center justify-center text-xl">⚠️</div>
        <div>
          <div class="text-2xl font-bold text-slate-900">${overdueQueries}</div>
          <span class="text-xs font-medium text-slate-500 uppercase tracking-wider">Open TPA Queries</span>
        </div>
      </div>

      <div class="bg-white border border-slate-200 rounded-xl p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
        <div class="w-12 h-12 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl">💵</div>
        <div>
          <div class="text-2xl font-bold text-slate-900">${formatINR(totalOutstandingAmt)}</div>
          <span class="text-xs font-medium text-slate-500 uppercase tracking-wider">Awaiting Payer Pay</span>
        </div>
      </div>
    </div>

    <!-- Alert Panel -->
    <div class="bg-amber-50 border-l-4 border-amber-500 rounded-r-xl p-4 mb-6 shadow-sm">
      <div class="flex items-center gap-2 mb-2">
        <span class="text-lg">⚠️</span>
        <h3 class="text-sm font-bold text-amber-800 uppercase tracking-wide">Urgent Priority Alerts Desk</h3>
      </div>
      <ul class="text-xs text-amber-900 space-y-1.5 list-disc pl-4">
        <li><strong>TAT Breach Warning:</strong> Star Health Preauth reference CLM9001 query response deadline expires in less than 24 hours!</li>
        <li><strong>Preauth Limit Alert:</strong> Claim for Patient Anita Roy has exceeded 90% of current preauth limit. Prepare Cost Enhancement.</li>
      </ul>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Quick Action Cards -->
      <div class="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
        <h2 class="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">⚙️ Quick Access Actions</h2>
        <div class="space-y-3">
          <button class="w-full text-left p-4 rounded-xl border border-slate-100 hover:border-slate-300 hover:bg-slate-50 transition-all" onclick="window.initiateNewClaimForm()">
            <div class="font-semibold text-slate-800 text-sm">➕ Log New Payer Declaration Card</div>
            <p class="text-xs text-slate-500 mt-1">Capture insurance, corporate, or CGHS category card details on patient admission.</p>
          </button>
          <button class="w-full text-left p-4 rounded-xl border border-slate-100 hover:border-slate-300 hover:bg-slate-50 transition-all" onclick="window.switchInsTab('masters')">
            <div class="font-semibold text-slate-800 text-sm">🛡️ View Non-Admissible Items Exclusions</div>
            <p class="text-xs text-slate-500 mt-1">Search standard IRDA excluded consumables, registration charges, and telephone fees.</p>
          </button>
        </div>
      </div>

      <!-- Active Cases Table -->
      <div class="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
        <h2 class="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">🗓️ Today's Active Insurance Cases</h2>
        <div class="overflow-x-auto mt-2">
          <table class="min-w-full divide-y divide-slate-100 text-xs">
            <thead>
              <tr class="text-left text-slate-500 uppercase tracking-wider">
                <th class="py-2.5 font-semibold">Case ID</th>
                <th class="py-2.5 font-semibold">Patient Details</th>
                <th class="py-2.5 font-semibold">Sponsor</th>
                <th class="py-2.5 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 text-slate-700">
              ${state.claims.slice(0, 5).map(c => `
                <tr class="hover:bg-slate-50 cursor-pointer transition-colors" onclick="window.openWorkflowFor('${c.id}')">
                  <td class="py-3 font-semibold text-indigo-600">${c.id}</td>
                  <td class="py-3">
                    <div class="font-medium text-slate-900">${c.patientName}</div>
                    <div class="text-slate-400 text-[10px]">${c.uhid}</div>
                  </td>
                  <td class="py-3">${c.insurer}</td>
                  <td class="py-3"><span class="${getBadgeColorClass(c.status)}">${c.status}</span></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}

function getBadgeColorClass(status) {
  switch (status) {
    case 'Pending': return 'bg-slate-100 text-slate-700 text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase';
    case 'In Progress': return 'bg-blue-100 text-blue-800 text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase';
    case 'Submitted': return 'bg-indigo-100 text-indigo-800 text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase';
    case 'Acknowledged': return 'bg-sky-100 text-sky-800 text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase';
    case 'Query Raised': return 'bg-amber-100 text-amber-800 text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase';
    case 'Approved': return 'bg-emerald-100 text-emerald-800 text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase';
    case 'Partially Approved': return 'bg-teal-100 text-teal-800 text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase';
    case 'Rejected': return 'bg-red-100 text-red-800 text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase';
    case 'Lapsed': return 'bg-orange-100 text-orange-800 text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase';
    case 'Appealed': return 'bg-purple-100 text-purple-800 text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase';
    case 'Settled': return 'bg-emerald-100 text-emerald-800 text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase';
    default: return 'bg-slate-100 text-slate-700 text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase';
  }
}

// ----------------------------------------------------
// TAB 2: CLAIMS QUEUE
// ----------------------------------------------------
function renderQueueTab(space) {
  space.innerHTML = `
    <div class="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
      <!-- Queue Filters -->
      <div class="bg-slate-50 p-4 border-b border-slate-200 flex flex-col md:flex-row gap-3">
        <div class="flex-1">
          <input type="text" id="queue-search" class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400" placeholder="Search by Patient name, UHID, or ID..." oninput="window.filterQueueList()">
        </div>
        <div class="w-full md:w-56">
          <select id="queue-stage-filter" class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-700 outline-none focus:border-slate-400" onchange="window.filterQueueList()">
            <option value="">-- All Stages --</option>
            <option value="Payer Declaration">Payer Declaration</option>
            <option value="Eligibility Verification">Eligibility Verification</option>
            <option value="Pre-Authorisation">Pre-Authorisation</option>
            <option value="Query Management">Query Management</option>
            <option value="Enhancement Request">Enhancement Request</option>
            <option value="Treatment & Charge Capture">Treatment & Charge Capture</option>
            <option value="Final Bill & Claim Docket">Final Bill & Claim Docket</option>
            <option value="Final Claim Submission">Final Claim Submission</option>
            <option value="Rejection & Appeal">Rejection & Appeal</option>
            <option value="Settlement">Settlement</option>
            <option value="Discharge Clearance">Discharge Clearance</option>
          </select>
        </div>
        <div class="w-full md:w-56">
          <select id="queue-status-filter" class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-700 outline-none focus:border-slate-400" onchange="window.filterQueueList()">
            <option value="">-- All Statuses --</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Query Raised">Query Raised</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
      </div>

      <!-- Queue Table -->
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-slate-200 text-xs text-slate-700">
          <thead class="bg-slate-50 text-slate-500 uppercase tracking-wider text-left">
            <tr>
              <th class="px-6 py-3 font-semibold">UHID / Claim ID</th>
              <th class="px-6 py-3 font-semibold">Patient</th>
              <th class="px-6 py-3 font-semibold">Sponsor Name & Category</th>
              <th class="px-6 py-3 font-semibold">Active Node Stage</th>
              <th class="px-6 py-3 font-semibold text-right">Current Bill</th>
              <th class="px-6 py-3 font-semibold text-right">Approved Amt</th>
              <th class="px-6 py-3 font-semibold text-right">Patient Payable</th>
              <th class="px-6 py-3 font-semibold">Verdict</th>
              <th class="px-6 py-3 font-semibold text-center">Action</th>
            </tr>
          </thead>
          <tbody id="queue-tbody" class="divide-y divide-slate-200 bg-white">
            ${renderQueueRows(state.claims)}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

// ----------------------------------------------------
// TAB 3: WORKFLOW ENGINE
// ----------------------------------------------------
function renderWorkflowTab(space) {
  const activeClaim = state.claims.find(c => c.id === selectedClaimId);

  if (!activeClaim) {
    space.innerHTML = `
      <div class="flex items-center justify-center min-h-[400px]">
        <div class="bg-white border border-slate-200 rounded-xl p-8 shadow-sm text-center max-w-md w-full space-y-4">
          <span class="text-4xl">🛡️</span>
          <h2 class="text-lg font-bold text-slate-900">Initiate Workflow Coordinator</h2>
          <p class="text-xs text-slate-500">
            Search active admitted inpatients to log a new payer policy, or choose an existing case from the worklist queue.
          </p>
          <div class="relative w-full">
            <input type="text" id="ins-patient-search" class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 outline-none focus:border-slate-400" placeholder="Search admitted patient name or UHID...">
            <input type="hidden" id="ins-patient-select">
            <div id="ins-patient-autocomplete" class="absolute w-full bg-white border border-slate-200 rounded-lg shadow-lg z-50 text-left mt-1 max-h-56 overflow-y-auto hidden"></div>
          </div>
          <div class="text-xs text-slate-400">OR</div>
          <button class="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 py-2 rounded-lg text-xs font-semibold transition" onclick="window.switchInsTab('queue')">
            📋 Search from Active Claims Queue
          </button>
        </div>
      </div>
    `;

    setTimeout(() => {
      window.setupPatientAutocomplete({
        searchInputId: 'ins-patient-search',
        hiddenInputId: 'ins-patient-select',
        autocompleteListId: 'ins-patient-autocomplete',
        filterFn: p => p.status === 'Admitted',
        onSelect: (uhid) => {
          const existing = state.claims.find(c => c.uhid === uhid);
          if (existing) {
            window.openWorkflowFor(existing.id);
          } else {
            const p = state.patients.find(pt => pt.uhid === uhid);
            const tempId = "CLM" + String(9000 + state.claims.length + 1);
            const newClaim = {
              id: tempId,
              uhid: p.uhid,
              patientName: p.name,
              insurer: "",
              payerCategory: "Insurance — Cashless",
              estimatedAmt: 45000,
              approvedAmt: 0,
              status: "Pending",
              preAuthNo: "",
              stage: "Payer Declaration",
              totalBillAmt: 45000,
              nonPayableAmt: 0,
              roomDiffAmt: 0,
              advanceAmt: 0,
              coPayAmt: 0,
              queries: [],
              enhancements: [],
              eligibilityChecks: [
                { id: 1, name: "Policy / Card valid and not expired", status: "Pending", notes: "" },
                { id: 2, name: "Patient listed as beneficiary on policy", status: "Pending", notes: "" },
                { id: 3, name: "Hospital empanelment is active", status: "Pending", notes: "" },
                { id: 4, name: "Waiting periods check passed", status: "Pending", notes: "" },
                { id: 5, name: "Referral / Admitting documents present", status: "Pending", notes: "" }
              ],
              documents: [],
              auditHistory: [{ timestamp: new Date().toISOString(), user: currentInsuranceRole, role: currentInsuranceRole, action: "Declaration Initialized", remarks: "Started payer admission capture" }]
            };
            state.claims.push(newClaim);
            window.openWorkflowFor(tempId);
          }
        }
      });
    }, 100);
    return;
  }

  const currentIndex = WORKFLOW_STAGES.indexOf(activeClaim.stage);

  space.innerHTML = `
    <!-- Patient Case Header Summary -->
    <div class="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <span class="inline-block bg-indigo-50 text-indigo-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">Case: ${activeClaim.id}</span>
        <h2 class="text-lg font-bold text-slate-900 mt-1">${activeClaim.patientName} (${activeClaim.uhid})</h2>
        <p class="text-xs text-slate-500 mt-0.5">Category: <strong class="text-slate-800">${activeClaim.payerCategory}</strong> | Insurer: <strong class="text-slate-800">${activeClaim.insurer || 'Unassigned'}</strong></p>
      </div>

      <div class="flex items-center gap-6 border-t md:border-t-0 md:border-l border-slate-100 pt-3 md:pt-0 md:pl-6">
        <div>
          <span class="text-xs text-slate-400 font-medium">Running Bill</span>
          <div class="text-sm font-bold text-slate-900 font-monospace text-right">${formatINR(activeClaim.totalBillAmt)}</div>
        </div>
        <div>
          <span class="text-xs text-slate-400 font-medium">Preauth Approved</span>
          <div class="text-sm font-bold text-emerald-600 font-monospace text-right">${formatINR(activeClaim.approvedAmt)}</div>
        </div>
        <div>
          <span class="text-xs text-slate-400 font-medium block mb-0.5 text-right">Stage Verdict</span>
          <span class="${getBadgeColorClass(activeClaim.status)}">${activeClaim.status}</span>
        </div>
      </div>
    </div>

    <!-- 11-Stage Progress Tracker -->
    <div class="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
      <div class="flex items-center justify-between gap-2 overflow-x-auto pb-2">
        ${WORKFLOW_STAGES.map((stg, index) => {
          let stepCircleColor = "border-slate-200 text-slate-400 bg-white";
          let stepLabelColor = "text-slate-400";
          if (stg === activeClaim.stage) {
            stepCircleColor = "border-[#1B3A5C] bg-[#1B3A5C] text-white ring-4 ring-indigo-50";
            stepLabelColor = "text-[#1B3A5C] font-semibold";
          } else if (index < currentIndex) {
            stepCircleColor = "border-emerald-500 bg-emerald-500 text-white";
            stepLabelColor = "text-emerald-700 font-medium";
          }

          return `
            <div class="flex flex-col items-center flex-1 min-w-[90px] cursor-pointer group" onclick="window.changeStageDirectly('${activeClaim.id}', '${stg}')">
              <div class="w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-all ${stepCircleColor}">
                ${index + 1}
              </div>
              <span class="text-[10px] text-center mt-2 tracking-tight ${stepLabelColor}">${stg}</span>
            </div>
          `;
        }).join('')}
      </div>
    </div>

    <!-- Active Area Splits -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Work area (Stage details) -->
      <div class="lg:col-span-2 space-y-6">
        <div class="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div class="bg-slate-50 border-b border-slate-200 px-5 py-4 flex items-center justify-between">
            <h3 class="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <span>⚙️</span> Node Task: ${activeClaim.stage}
            </h3>
            <span class="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full font-semibold">STAGE ${currentIndex + 1}/11</span>
          </div>
          <div class="p-5">
            ${renderStageContent(activeClaim)}
          </div>
        </div>

        <!-- Audit Trail Pane -->
        <div class="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div class="bg-slate-50 border-b border-slate-200 px-5 py-3 flex items-center justify-between">
            <h3 class="text-xs font-bold text-slate-700 uppercase tracking-wider">📋 Immutable Case Log & Audit Ledger</h3>
            <span class="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full font-semibold uppercase">System Ledger</span>
          </div>
          <div class="overflow-y-auto max-h-56">
            <table class="min-w-full divide-y divide-slate-100 text-xs font-monospace">
              <thead class="bg-slate-50 text-slate-500 text-left">
                <tr>
                  <th class="px-4 py-2 font-semibold">Timestamp</th>
                  <th class="px-4 py-2 font-semibold">User Role</th>
                  <th class="px-4 py-2 font-semibold">Action</th>
                  <th class="px-4 py-2 font-semibold">Remarks</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 text-slate-700">
                ${activeClaim.auditHistory.map(log => `
                  <tr>
                    <td class="px-4 py-2.5 text-slate-400 text-[10px]">${log.timestamp}</td>
                    <td class="px-4 py-2.5 font-semibold text-slate-900">${log.user} (${log.role})</td>
                    <td class="px-4 py-2.5 text-indigo-600">${log.action}</td>
                    <td class="px-4 py-2.5 text-slate-500">${log.remarks}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Financial Panel right side -->
      <div class="space-y-6">
        <!-- Live Financial panel -->
        <div class="bg-white border border-slate-200 rounded-xl shadow-sm p-5 space-y-4">
          <h3 class="text-sm font-bold text-slate-800 border-b border-slate-100 pb-3 flex items-center gap-1.5">
            <span>💵</span> Live Financial Tracker
          </h3>
          
          <div class="space-y-2.5 text-xs text-slate-600">
            <!-- Progress Limit -->
            <div>
              <div class="flex justify-content-between text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                <span>Preauth Utilisation Limit</span>
                <span>${activeClaim.approvedAmt > 0 ? Math.round((activeClaim.totalBillAmt / activeClaim.approvedAmt) * 100) : 0}%</span>
              </div>
              <div class="w-full bg-slate-100 rounded-full h-2">
                <div class="rounded-full h-2 ${activeClaim.totalBillAmt >= activeClaim.approvedAmt * 0.9 ? 'bg-red-500' : activeClaim.totalBillAmt >= activeClaim.approvedAmt * 0.75 ? 'bg-amber-500' : 'bg-emerald-500'}" style="width: ${Math.min(100, activeClaim.approvedAmt > 0 ? (activeClaim.totalBillAmt / activeClaim.approvedAmt) * 100 : 0)}%;"></div>
              </div>
            </div>

            <div class="flex justify-between border-b border-slate-100 py-1.5 mt-4">
              <span>Gross Running Bill</span>
              <strong class="font-monospace text-slate-900 text-right">${formatINR(activeClaim.totalBillAmt)}</strong>
            </div>
            <div class="flex justify-between border-b border-slate-100 py-1.5">
              <span>Sponsor Limit Approved</span>
              <strong class="font-monospace text-emerald-600 text-right">${formatINR(activeClaim.approvedAmt)}</strong>
            </div>
            <div class="flex justify-between border-b border-slate-100 py-1.5">
              <span>IRDA Exclusions (Non-Payables)</span>
              <strong class="font-monospace text-red-500 text-right">${formatINR(claim.nonPayableAmt)}</strong>
            </div>
            <div class="flex justify-between border-b border-slate-100 py-1.5">
              <span>Room Category Upgrade Differential</span>
              <strong class="font-monospace text-red-500 text-right">${formatINR(claim.roomDiffAmt)}</strong>
            </div>
            <div class="flex justify-between border-b border-slate-100 py-1.5">
              <span>Co-pay / Deductibles</span>
              <strong class="font-monospace text-red-500 text-right">${formatINR(claim.coPayAmt)}</strong>
            </div>
            <div class="flex justify-between border-b border-slate-100 py-1.5">
              <span>Advance Collected</span>
              <strong class="font-monospace text-sky-600 text-right">${formatINR(claim.advanceAmt)}</strong>
            </div>
            <div class="flex justify-between bg-slate-900 text-white rounded-lg p-3 mt-4">
              <span class="font-bold">Total Patient Share Due</span>
              <strong class="font-monospace text-right">${formatINR((activeClaim.totalBillAmt - activeClaim.approvedAmt + activeClaim.nonPayableAmt + activeClaim.roomDiffAmt + activeClaim.coPayAmt - activeClaim.advanceAmt) > 0 ? (activeClaim.totalBillAmt - activeClaim.approvedAmt + activeClaim.nonPayableAmt + activeClaim.roomDiffAmt + activeClaim.coPayAmt - activeClaim.advanceAmt) : 0)}</strong>
            </div>
          </div>
        </div>

        <!-- 3-Column splits -->
        <div class="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div class="bg-slate-50 border-b border-slate-200 px-5 py-3.5">
            <h3 class="text-xs font-bold text-slate-700 uppercase tracking-wider">📊 Multi-Column Charge Capture Splits</h3>
          </div>
          <table class="min-w-full divide-y divide-slate-100 text-[10px] text-slate-600">
            <thead class="bg-slate-50 text-slate-400 text-left">
              <tr>
                <th class="px-4 py-2 font-semibold">Service Description</th>
                <th class="px-4 py-2 font-semibold text-right">Admissible</th>
                <th class="px-4 py-2 font-semibold text-right">Exclusion</th>
                <th class="px-4 py-2 font-semibold text-right">Room Diff</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 text-slate-700 font-monospace">
              <tr>
                <td class="px-4 py-2 font-sans font-medium text-slate-800">Room Rent / ICU</td>
                <td class="px-4 py-2 text-right text-emerald-600">${formatINR(activeClaim.approvedAmt * 0.4)}</td>
                <td class="px-4 py-2 text-right text-slate-400">₹0.00</td>
                <td class="px-4 py-2 text-right text-red-500">${formatINR(activeClaim.roomDiffAmt)}</td>
              </tr>
              <tr>
                <td class="px-4 py-2 font-sans font-medium text-slate-800">Doctor Consultation</td>
                <td class="px-4 py-2 text-right text-emerald-600">${formatINR(activeClaim.approvedAmt * 0.2)}</td>
                <td class="px-4 py-2 text-right text-slate-400">₹0.00</td>
                <td class="px-4 py-2 text-right text-slate-400">₹0.00</td>
              </tr>
              <tr>
                <td class="px-4 py-2 font-sans font-medium text-slate-800">Admission Fee</td>
                <td class="px-4 py-2 text-right text-slate-400">₹0.00</td>
                <td class="px-4 py-2 text-right text-red-500">${formatINR(activeClaim.nonPayableAmt)}</td>
                <td class="px-4 py-2 text-right text-slate-400">₹0.00</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}

// ----------------------------------------------------
// TAB 4: MASTERS
// ----------------------------------------------------
function renderMastersTab(space) {
  space.innerHTML = `
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      
      <!-- Payer Master Card -->
      <div class="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div class="bg-slate-50 border-b border-slate-200 px-5 py-4">
          <h2 class="text-sm font-bold text-slate-800 uppercase tracking-wider">📋 Payer Registry Directory</h2>
        </div>
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-slate-100 text-xs text-slate-700">
            <thead class="bg-slate-50 text-slate-400 uppercase tracking-wider text-left">
              <tr>
                <th class="px-5 py-3 font-semibold">Payer Code</th>
                <th class="px-5 py-3 font-semibold">Payer / Category</th>
                <th class="px-5 py-3 font-semibold">Submission Route</th>
                <th class="px-5 py-3 font-semibold">Preauth TAT Limit</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 bg-white">
              ${state.insuranceMasters.payermaster.map(p => `
                <tr>
                  <td class="px-5 py-3.5 font-semibold text-slate-900"><code>${p.code}</code></td>
                  <td class="px-5 py-3.5">
                    <div class="font-bold text-slate-800">${p.name}</div>
                    <div class="text-[10px] text-slate-400">${p.type}</div>
                  </td>
                  <td class="px-5 py-3.5"><span class="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[10px] font-semibold">${p.submission}</span></td>
                  <td class="px-5 py-3.5 font-medium text-slate-600">${p.tatPreauth} Hours</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Rate Master -->
      <div class="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div class="bg-slate-50 border-b border-slate-200 px-5 py-4">
          <h2 class="text-sm font-bold text-slate-800 uppercase tracking-wider">📊 Empanelled Rate Master Schedules</h2>
        </div>
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-slate-100 text-xs text-slate-700">
            <thead class="bg-slate-50 text-slate-400 uppercase tracking-wider text-left">
              <tr>
                <th class="px-5 py-3 font-semibold">Service Description</th>
                <th class="px-5 py-3 font-semibold text-right">Standard MRP</th>
                <th class="px-5 py-3 font-semibold text-right">Star Negotiated</th>
                <th class="px-5 py-3 font-semibold text-right">CGHS Package</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 bg-white">
              ${state.insuranceMasters.ratemaster.map(r => `
                <tr>
                  <td class="px-5 py-3.5 font-bold text-slate-800">${r.name}</td>
                  <td class="px-5 py-3.5 text-right font-monospace">${formatINR(r.standardMRP)}</td>
                  <td class="px-5 py-3.5 text-right text-emerald-600 font-monospace">${formatINR(r.rates["PAY-001"] || 0)}</td>
                  <td class="px-5 py-3.5 text-right text-indigo-600 font-monospace">${formatINR(r.rates["PAY-004"] || 0)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  `;
}

// ----------------------------------------------------
// TAB 5: REPORTS & MIS
// ----------------------------------------------------
function renderReportsTab(space) {
  space.innerHTML = `
    <!-- Top metrics -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-5 mb-6">
      <div class="bg-white border border-slate-200 rounded-xl p-5 text-center shadow-sm">
        <span class="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">Overall Claims Recovery</span>
        <h4 class="text-2xl font-bold text-emerald-600">94.8%</h4>
      </div>
      <div class="bg-white border border-slate-200 rounded-xl p-5 text-center shadow-sm">
        <span class="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">Average Payout Cycle</span>
        <h4 class="text-2xl font-bold text-amber-600">18.2 Days</h4>
      </div>
      <div class="bg-white border border-slate-200 rounded-xl p-5 text-center shadow-sm">
        <span class="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">Pre-Auth Acceptance Rate</span>
        <h4 class="text-2xl font-bold text-emerald-600">98.1%</h4>
      </div>
      <div class="bg-white border border-slate-200 rounded-xl p-5 text-center shadow-sm">
        <span class="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">Total Outstanding Credit</span>
        <h4 class="text-2xl font-bold text-red-500">${formatINR(3450000)}</h4>
      </div>
    </div>

    <!-- Receivables Ageing -->
    <div class="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
      <div class="bg-slate-50 border-b border-slate-200 px-5 py-4">
        <h2 class="text-sm font-bold text-slate-800 uppercase tracking-wider">🏦 Cashless Credit Receivables Ageing Ledger</h2>
      </div>
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-slate-100 text-xs text-slate-700 text-center">
          <thead class="bg-slate-50 text-slate-400 uppercase tracking-wider">
            <tr>
              <th class="px-6 py-3 text-left font-semibold">Empanelled Payer Entity</th>
              <th class="px-6 py-3 font-semibold">0 to 30 Days</th>
              <th class="px-6 py-3 font-semibold">31 to 60 Days</th>
              <th class="px-6 py-3 font-semibold">61 to 90 Days</th>
              <th class="px-6 py-3 font-semibold">Over 90 Days</th>
              <th class="px-6 py-3 font-semibold text-right">Gross Outstanding</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 bg-white font-monospace">
            <tr>
              <td class="px-6 py-3.5 text-left font-sans font-bold text-slate-850">Star Health Insurance</td>
              <td class="px-6 py-3.5">${formatINR(1200000)}</td>
              <td class="px-6 py-3.5">${formatINR(450000)}</td>
              <td class="px-6 py-3.5">${formatINR(120000)}</td>
              <td class="px-6 py-3.5 text-slate-400">₹0.00</td>
              <td class="px-6 py-3.5 text-right font-bold text-slate-900">${formatINR(1770000)}</td>
            </tr>
            <tr>
              <td class="px-6 py-3.5 text-left font-sans font-bold text-slate-850">Niva Bupa Health</td>
              <td class="px-6 py-3.5">${formatINR(650000)}</td>
              <td class="px-6 py-3.5">${formatINR(230000)}</td>
              <td class="px-6 py-3.5 text-slate-400">₹0.00</td>
              <td class="px-6 py-3.5 text-slate-400">₹0.00</td>
              <td class="px-6 py-3.5 text-right font-bold text-slate-900">${formatINR(880000)}</td>
            </tr>
            <tr>
              <td class="px-6 py-3.5 text-left font-sans font-bold text-slate-850">CGHS Delhi / NCR</td>
              <td class="px-6 py-3.5">${formatINR(400000)}</td>
              <td class="px-6 py-3.5">${formatINR(300000)}</td>
              <td class="px-6 py-3.5">${formatINR(250000)}</td>
              <td class="px-6 py-3.5 text-red-500">${formatINR(180000)}</td>
              <td class="px-6 py-3.5 text-right font-bold text-slate-900">${formatINR(1130000)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function renderQueueRows(list) {
  if (list.length === 0) {
    return `<tr><td colspan="9" class="px-6 py-8 text-center text-slate-400 text-xs font-semibold uppercase">No Cashless Claims Registered.</td></tr>`;
  }
  return list.map(c => `
    <tr class="hover:bg-slate-50 transition-colors">
      <td class="px-6 py-3.5">
        <div class="font-bold text-slate-900">${c.uhid}</div>
        <div class="text-[10px] text-slate-400 font-mono">${c.id}</div>
      </td>
      <td class="px-6 py-3.5 font-medium text-slate-850">${c.patientName}</td>
      <td class="px-6 py-3.5">
        <div class="font-bold text-slate-800">${c.insurer || 'Self Pay'}</div>
        <span class="text-[10px] bg-slate-100 text-slate-700 font-semibold px-2 py-0.5 rounded">${c.payerCategory}</span>
      </td>
      <td class="px-6 py-3.5 font-medium text-slate-600">⚙️ ${c.stage}</td>
      <td class="px-6 py-3.5 text-right font-bold font-monospace">${formatINR(c.totalBillAmt)}</td>
      <td class="px-6 py-3.5 text-right text-emerald-600 font-bold font-monospace">${formatINR(c.approvedAmt)}</td>
      <td class="px-6 py-3.5 text-right text-red-500 font-bold font-monospace">${formatINR((c.totalBillAmt - c.approvedAmt - c.advanceAmt) > 0 ? (c.totalBillAmt - c.approvedAmt - c.advanceAmt) : 0)}</td>
      <td class="px-6 py-3.5"><span class="${getBadgeColorClass(c.status)}">${c.status}</span></td>
      <td class="px-6 py-3.5 text-center">
        <button class="bg-[#1B3A5C] text-white hover:bg-slate-800 px-3 py-1.5 rounded-lg text-[10px] font-semibold transition" onclick="window.openWorkflowFor('${c.id}')">
          Process Desk
        </button>
      </td>
    </tr>
  `).join('');
}

window.filterQueueList = function() {
  const query = document.getElementById('queue-search').value.toLowerCase();
  const stage = document.getElementById('queue-stage-filter').value;
  const status = document.getElementById('queue-status-filter').value;

  const filtered = state.claims.filter(c => {
    const matchesQuery = c.patientName.toLowerCase().includes(query) || c.uhid.toLowerCase().includes(query) || c.id.toLowerCase().includes(query) || (c.policyNo && c.policyNo.toLowerCase().includes(query));
    const matchesStage = stage === "" || c.stage === stage;
    const matchesStatus = status === "" || c.status === status;
    return matchesQuery && matchesStage && matchesStatus;
  });

  document.getElementById('queue-tbody').innerHTML = renderQueueRows(filtered);
};

// 1. Payer Declaration
function renderPayerDeclarationForm(claim) {
  const payers = state.insuranceMasters.payermaster;
  return `
    <form id="decl-form" class="space-y-6" onsubmit="event.preventDefault(); window.saveDeclaration('${claim.id}');">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div>
          <label class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Payer Category</label>
          <select id="decl-payerCategory" class="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 outline-none focus:border-slate-400" onchange="window.adjustDeclFields(this.value)">
            <option value="Insurance — Cashless">Insurance — Cashless</option>
            <option value="Insurance — TPA Cashless">Insurance — TPA Cashless</option>
            <option value="CGHS — Cashless">CGHS — Cashless</option>
            <option value="ECHS">ECHS</option>
            <option value="PMJAY / Ayushman Bharat">PMJAY / Ayushman Bharat</option>
            <option value="Self Pay (fallback)">Self Pay (fallback)</option>
          </select>
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Payer Name</label>
          <select id="decl-payerName" class="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 outline-none focus:border-slate-400">
            ${payers.map(p => `<option value="${p.name}" ${claim.insurer === p.name ? 'selected' : ''}>${p.name}</option>`).join('')}
          </select>
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Policy / Member Card ID</label>
          <input type="text" id="decl-policyNo" class="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 outline-none focus:border-slate-400" value="${claim.policyNo || 'POL9002213'}" required>
        </div>
      </div>

      <!-- Govt Details (cghs / echs) -->
      <div id="gov-details-section" class="grid grid-cols-1 md:grid-cols-3 gap-5 pt-2" style="display: none;">
        <div>
          <label class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">14-Digit CGHS Beneficiary ID</label>
          <input type="text" id="decl-cghsId" class="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 outline-none focus:border-slate-400" value="CGHS8877665544">
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Treating CGHS Dispensary Code</label>
          <input type="text" id="decl-dispensary" class="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 outline-none focus:border-slate-400" value="DISP-99A">
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Government Referral Ref No.</label>
          <input type="text" id="decl-referral" class="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 outline-none focus:border-slate-400" value="REF-2026-X11">
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Sum Insured Limit (₹)</label>
          <input type="number" id="decl-sumInsured" class="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 text-right outline-none focus:border-slate-400" value="${claim.sumInsured || 500000}">
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Policy Room Type Entitlement</label>
          <select id="decl-roomEnt" class="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 outline-none focus:border-slate-400">
            <option value="Private Room">Private Room</option>
            <option value="Semi-Private Room">Semi-Private Room</option>
            <option value="General Ward">General Ward</option>
            <option value="ICU">ICU</option>
          </select>
        </div>
      </div>

      <!-- Checklist -->
      <div class="space-y-3">
        <h4 class="text-xs font-bold text-slate-800 uppercase tracking-wider">📋 Pre-Auth Stage Required Checklist</h4>
        <div class="overflow-x-auto border border-slate-200 rounded-lg">
          <table class="min-w-full divide-y divide-slate-200 text-xs">
            <thead class="bg-slate-50 text-slate-400 text-left">
              <tr>
                <th class="px-4 py-2 font-semibold">Document Name</th>
                <th class="px-4 py-2 font-semibold">Requirement</th>
                <th class="px-4 py-2 font-semibold">Status</th>
                <th class="px-4 py-2 font-semibold">File Upload</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-200 bg-white">
              ${state.insuranceMasters.documentchecklist.Preauth.map(doc => `
                <tr>
                  <td class="px-4 py-3 font-medium">${doc.name} ${doc.mandatory ? '<span class="text-red-500">*</span>' : ''}</td>
                  <td class="px-4 py-3"><span class="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[10px] font-semibold">${doc.format}</span></td>
                  <td class="px-4 py-3"><span class="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded text-[10px] font-bold">VERIFIED</span></td>
                  <td class="px-4 py-3"><input type="file" class="text-slate-500 text-[10px] outline-none"></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Intimation logs -->
      <div class="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-4">
        <h4 class="text-xs font-bold text-indigo-700 uppercase tracking-wider">📬 Payer Admission Intimation Log</h4>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div>
            <label class="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Intimation Ref Number</label>
            <input type="text" id="decl-intimation-ref" class="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 outline-none focus:border-slate-400" value="${claim.intimation?.refNo || 'INT-123456'}">
          </div>
          <div>
            <label class="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Sent By Coordinator</label>
            <input type="text" id="decl-intimation-by" class="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 outline-none focus:border-slate-400" value="${claim.intimation?.sentBy || 'Ramesh Sharma'}">
          </div>
          <div>
            <label class="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Intimation Channel</label>
            <select id="decl-intimation-mode" class="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 outline-none focus:border-slate-400">
              <option value="Portal" ${claim.intimation?.mode === 'Portal' ? 'selected' : ''}>Portal Integration</option>
              <option value="Email" ${claim.intimation?.mode === 'Email' ? 'selected' : ''}>Email Dispatch</option>
              <option value="Phone" ${claim.intimation?.mode === 'Phone' ? 'selected' : ''}>Phone Helpline</option>
            </select>
          </div>
        </div>
      </div>

      <div class="flex justify-end pt-4">
        <button type="submit" class="bg-[#1B3A5C] text-white hover:bg-slate-800 px-5 py-2 rounded-lg text-xs font-semibold shadow-sm transition">
          Save Declaration & Verify Eligibility
        </button>
      </div>
    </form>
  `;
}

// 2. Eligibility Verification
function renderEligibilityChecklist(claim) {
  return `
    <div class="space-y-6">
      <div>
        <h4 class="text-base font-bold text-slate-900">📋 Cashless Eligibility Check</h4>
        <p class="text-xs text-slate-500 mt-1">Cross-check insurance policy criteria prior to file dispatch.</p>
      </div>

      <form class="space-y-6" onsubmit="event.preventDefault(); window.submitEligibility('${claim.id}');">
        <div class="overflow-x-auto border border-slate-200 rounded-lg">
          <table class="min-w-full divide-y divide-slate-200 text-xs">
            <thead class="bg-slate-50 text-slate-500 uppercase tracking-wider text-left">
              <tr>
                <th class="px-4 py-2 font-semibold">Verification Parameter Check</th>
                <th class="px-4 py-2 font-semibold">Verification Verdict</th>
                <th class="px-4 py-2 font-semibold">Executive Notes</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-200 bg-white">
              ${claim.eligibilityChecks.map(chk => `
                <tr>
                  <td class="px-4 py-3.5 font-medium text-slate-800">${chk.name}</td>
                  <td class="px-4 py-3.5">
                    <select class="rounded border border-slate-300 px-2 py-1 text-xs text-slate-700 outline-none" id="eligcheck-status-${chk.id}">
                      <option value="Pass" ${chk.status === 'Pass' ? 'selected' : ''}>Pass</option>
                      <option value="Fail" ${chk.status === 'Fail' ? 'selected' : ''}>Fail</option>
                      <option value="Unable to Verify" ${chk.status === 'Unable to Verify' ? 'selected' : ''}>Unable to Verify</option>
                    </select>
                  </td>
                  <td class="px-4 py-3.5">
                    <input type="text" class="w-full rounded border border-slate-300 px-2 py-1 text-xs outline-none focus:border-slate-400" id="eligcheck-notes-${chk.id}" value="${chk.notes || ''}">
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <div class="flex justify-between items-center pt-4 border-t border-slate-100">
          <button type="button" class="border border-red-200 hover:bg-red-50 text-red-600 px-4 py-2 rounded-lg text-xs font-semibold transition" onclick="window.triggerSelfPayModal('${claim.id}')">
            ⚠️ Force Self Pay Conversion
          </button>
          <button type="submit" class="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-lg text-xs font-semibold shadow-sm transition">
            Proceed to Pre-Auth request
          </button>
        </div>
      </form>
    </div>
  `;
}

// 3. Pre-Authorisation
function renderPreauthForm(claim) {
  return `
    <form class="space-y-6" onsubmit="event.preventDefault(); window.savePreauthRequest('${claim.id}');">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Primary Diagnosis (ICD-10 Code & Title)</label>
          <input type="text" id="pre-icd" class="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 outline-none focus:border-slate-400" value="K80.2 - Gallbladder Calculus" required>
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Planned Service Code / Procedure Package</label>
          <input type="text" id="pre-proc" class="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 outline-none focus:border-slate-400" value="SRV-005 - Laparoscopic Cholecystectomy Package" required>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div>
          <label class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Estimated Treatment cost (₹)</label>
          <input type="number" id="pre-estCost" class="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 text-right outline-none focus:border-slate-400" value="${claim.totalBillAmt}" required>
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Expected Length of Stay (Days)</label>
          <input type="number" id="pre-los" class="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 text-center outline-none focus:border-slate-400" value="3" required>
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Treating Admitting Doctor</label>
          <input type="text" id="pre-doc" class="block w-full rounded-lg border border-slate-300 bg-slate-100 px-3 py-2 text-xs text-slate-500 outline-none" value="Dr. Vinay K. Goel (Surgical Gastro)" readonly>
        </div>
      </div>

      <!-- Payer approval values -->
      <div class="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-4">
        <h4 class="text-xs font-bold text-[#1B3A5C] uppercase tracking-wider">🔑 Payer Response (Preauth Approval)</h4>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div>
            <label class="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Preauth Status Decision</label>
            <select id="pre-decision" class="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 outline-none focus:border-slate-400" onchange="window.adjustPreauthFields(this.value)">
              <option value="Approved">Approved</option>
              <option value="Query Raised">Query Raised</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
          <div>
            <label class="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Approval Reference Code</label>
            <input type="text" id="pre-ref" class="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 outline-none focus:border-slate-400" value="AUTH70023">
          </div>
          <div>
            <label class="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Approved Limit Amount (₹)</label>
            <input type="number" id="pre-appAmt" class="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 text-right outline-none focus:border-slate-400" value="45000">
          </div>
        </div>
      </div>

      <div class="flex justify-end pt-4 border-t border-slate-100">
        <button type="submit" class="bg-[#1B3A5C] text-white hover:bg-slate-800 px-5 py-2 rounded-lg text-xs font-semibold shadow-sm transition">
          Process Pre-Auth Verdict
        </button>
      </div>
    </form>
  `;
}

// 4. Query Management
function renderQueryTabContent(claim) {
  const openQ = claim.queries.find(q => q.status === "Open") || claim.queries[0];

  if (!openQ) {
    return `
      <div class="text-center py-8 space-y-4">
        <span class="text-4xl">✅</span>
        <h4 class="text-sm font-bold text-slate-900">All Payer Queries Resolved</h4>
        <p class="text-xs text-slate-500">Case files are currently clear. You may resume treatment capture tracking.</p>
        <button class="bg-[#1B3A5C] text-white hover:bg-slate-800 px-4 py-2 rounded-lg text-xs font-semibold transition" onclick="window.changeStageDirectly('${claim.id}', 'Treatment & Charge Capture')">
          Resume Charge Tracking Node
        </button>
      </div>
    `;
  }

  const remainingDays = Math.ceil((new Date(openQ.deadlineDate) - new Date()) / (1000 * 60 * 60 * 24));
  let badgeColor = "bg-emerald-50 text-emerald-800 border border-emerald-100";
  if (remainingDays <= 2) badgeColor = "bg-red-50 text-red-800 border border-red-100";
  else if (remainingDays <= 4) badgeColor = "bg-amber-50 text-amber-800 border border-amber-100";

  return `
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      <!-- Query List Left side -->
      <div class="lg:col-span-1 border-r border-slate-100 pr-4 space-y-3">
        <h4 class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">📂 Query Log list</h4>
        <div class="space-y-2">
          ${claim.queries.map(q => `
            <div class="p-3 rounded-lg border border-slate-200 bg-white hover:border-slate-350 transition cursor-pointer active">
              <div class="flex justify-between items-center mb-1.5">
                <span class="font-bold text-slate-800 text-[10px] font-mono">${q.id}</span>
                <span class="text-[9px] font-bold px-1.5 py-0.5 rounded-full ${badgeColor}">${remainingDays}d left</span>
              </div>
              <p class="text-xs text-slate-500 line-clamp-2">${q.text}</p>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Query details right side -->
      <div class="lg:col-span-2 space-y-5">
        <h4 class="text-xs font-bold text-slate-500 uppercase tracking-wider">📝 Query Details & Response Desk</h4>
        <div class="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2 text-xs">
          <div class="flex justify-between items-center border-b border-slate-250 pb-2">
            <span class="text-slate-500">Query Category: <strong class="text-slate-800">${openQ.type}</strong></span>
            <span class="text-slate-500">Assigned Desk: <strong class="text-slate-800">${openQ.assignedTo}</strong></span>
          </div>
          <p class="text-slate-800 font-medium">${openQ.text}</p>
        </div>

        <form class="space-y-4" onsubmit="event.preventDefault(); window.submitQueryResponse('${claim.id}', '${openQ.id}');">
          <div>
            <label class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Draft Clinical Response</label>
            <textarea id="query-resp-text" class="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 outline-none focus:border-slate-400" rows="4" placeholder="Detail clinical responses..." required></textarea>
          </div>
          <div>
            <label class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Attach Re-uploaded files</label>
            <input type="file" class="block w-full border border-slate-300 rounded-lg p-2 text-xs">
          </div>
          <div class="flex justify-end">
            <button type="submit" class="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg text-xs font-semibold shadow-sm transition">
              Submit Query Response Portal
            </button>
          </div>
        </form>
      </div>

    </div>
  `;
}

// 5. Enhancement Request
function renderEnhancementPanel(claim) {
  return `
    <div class="space-y-6">
      <div class="bg-slate-50 rounded-xl p-4 border border-slate-200 flex items-center justify-between text-xs">
        <div>
          <span class="text-slate-450 uppercase text-[10px] font-bold">Approved limit</span>
          <div class="text-sm font-bold text-slate-800 font-monospace">${formatINR(claim.approvedAmt)}</div>
        </div>
        <div class="text-right">
          <span class="text-slate-450 uppercase text-[10px] font-bold">Hospital Bill Running</span>
          <div class="text-sm font-bold text-red-500 font-monospace">${formatINR(claim.totalBillAmt)}</div>
        </div>
      </div>

      <form class="space-y-5" onsubmit="event.preventDefault(); window.submitEnhancement('${claim.id}');">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Additional Amount Requested (₹)</label>
            <input type="number" id="enh-amt" class="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 text-right outline-none focus:border-slate-400" value="25000" required>
          </div>
          <div>
            <label class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Clinical justification narrative</label>
            <textarea id="enh-reason" class="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 outline-none focus:border-slate-400" rows="1" required>Complication: post-operative critical care monitoring extended.</textarea>
          </div>
        </div>

        <div class="flex justify-end pt-4 border-t border-slate-100">
          <button type="submit" class="bg-amber-600 hover:bg-amber-700 text-white px-5 py-2 rounded-lg text-xs font-semibold shadow-sm transition">
            Dispatch Enhancement request
          </button>
        </div>
      </form>
    </div>
  `;
}

// 6. Treatment & Charge Capture
function renderChargeCapturePanel(claim) {
  return `
    <div class="space-y-6">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div class="border border-slate-200 rounded-xl p-4 bg-white shadow-sm">
          <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Bed / Room Location</span>
          <div class="font-bold text-slate-800 text-sm mt-1">ICU Bed 10B</div>
        </div>
        <div class="border border-slate-200 rounded-xl p-4 bg-white shadow-sm">
          <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Entitled Ward scale</span>
          <div class="font-bold text-emerald-600 text-sm mt-1">ICU private</div>
        </div>
        <div class="border border-slate-200 rounded-xl p-4 bg-white shadow-sm">
          <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider text-red-500">Differential Overdue</span>
          <div class="font-bold text-red-500 text-sm mt-1">₹0.00 / Day</div>
        </div>
      </div>

      <div class="flex justify-between items-center pt-4 border-t border-slate-100">
        <button class="border border-amber-200 hover:bg-amber-50 text-amber-600 px-4 py-2 rounded-lg text-xs font-semibold transition" onclick="window.triggerEnhancementStageDirectly('${claim.id}')">
          ⚠️ Submit cost limit extension
        </button>
        <button class="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg text-xs font-semibold shadow-sm transition" onclick="window.dischargePlanned('${claim.id}')">
          🏁 Trigger final discharge clearance
        </button>
      </div>
    </div>
  `;
}

// 7. Final Bill & Claim Docket
function renderClaimDocketForm(claim) {
  return `
    <div class="space-y-6">
      <div>
        <h4 class="text-base font-bold text-slate-900">📦 Claim Docket Compiler & Sticker Bill</h4>
        <p class="text-xs text-slate-500 mt-1">Compile required claim papers in chronological sponsor template order.</p>
      </div>

      <div class="overflow-x-auto border border-slate-200 rounded-lg">
        <table class="min-w-full divide-y divide-slate-200 text-xs">
          <thead class="bg-slate-50 text-slate-550 uppercase tracking-wider text-left">
            <tr>
              <th class="px-4 py-2 font-semibold">Document Description</th>
              <th class="px-4 py-2 font-semibold">Verification Stage</th>
              <th class="px-4 py-2 font-semibold">Status</th>
              <th class="px-4 py-2 font-semibold text-center">Action</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200 bg-white">
            ${state.insuranceMasters.documentchecklist.FinalClaim.map(doc => `
              <tr>
                <td class="px-4 py-3 font-semibold text-slate-800">${doc.name}</td>
                <td class="px-4 py-3 text-slate-500">Final claim docket</td>
                <td class="px-4 py-3"><span class="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded text-[10px] font-bold">ATTACHED & OK</span></td>
                <td class="px-4 py-3 text-center">
                  <button type="button" class="border border-slate-200 hover:bg-slate-50 text-slate-700 px-2.5 py-1 rounded text-[10px] font-semibold" onclick="alert('Viewing pdf preview...')">Preview PDF</button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      <!-- Shadow Sticker preview -->
      <div class="bg-slate-50 border border-slate-200 rounded-xl p-5 font-mono text-xs text-slate-700 space-y-2">
        <h4 class="font-sans font-bold text-slate-800 border-b border-slate-200 pb-2 flex items-center justify-between">
          <span>🧾 Shadow Sticker Bill Preview</span>
          <span class="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded">TPA Star Format</span>
        </h4>
        <div class="flex justify-between">
          <span>Star preauth reference:</span>
          <strong>AUTH70023</strong>
        </div>
        <div class="flex justify-between">
          <span>Claimable services invoice:</span>
          <strong>${formatINR(claim.approvedAmt)}</strong>
        </div>
        <div class="flex justify-between text-red-500 border-t border-slate-200 pt-2">
          <span>Non-Admissible exclusions:</span>
          <strong>${formatINR(claim.nonPayableAmt)}</strong>
        </div>
      </div>

      <div class="flex justify-end pt-4 border-t border-slate-100">
        <button class="bg-[#1B3A5C] text-white hover:bg-slate-800 px-5 py-2 rounded-lg text-xs font-semibold shadow-sm transition" onclick="window.submitFinalClaimDesk('${claim.id}')">
          🚀 Upload Docket to TPA Portal API
        </button>
      </div>
    </div>
  `;
}

// 8. Final Claim Submission
function renderFinalClaimForm(claim) {
  return `
    <div class="space-y-6">
      <div class="bg-slate-50 border border-slate-200 rounded-xl p-5 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        <div>
          <span class="text-slate-450 uppercase text-[10px] font-bold">Submission channel</span>
          <div class="font-bold text-slate-800 mt-1">Portal API (Verified Verification Code)</div>
        </div>
        <div>
          <span class="text-slate-450 uppercase text-[10px] font-bold">Expected TAT Settlement</span>
          <div class="font-bold text-amber-600 mt-1">15 working days agreement</div>
        </div>
      </div>

      <form class="space-y-5" onsubmit="event.preventDefault(); window.verdictRecordedClaim('${claim.id}');">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Payer Verdict Status</label>
            <select id="final-verdict" class="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 outline-none focus:border-slate-400" onchange="window.adjustFinalVerdictFields(this.value)">
              <option value="Approved">Approved (In Full)</option>
              <option value="Partially Approved">Partially Approved (Shortfall)</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
          <div>
            <label class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Final Approved Amount (₹)</label>
            <input type="number" id="final-appAmt" class="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 text-right outline-none focus:border-slate-400" value="${claim.totalBillAmt - claim.nonPayableAmt}" required>
          </div>
        </div>

        <div class="flex justify-end pt-4 border-t border-slate-100">
          <button type="submit" class="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-lg text-xs font-semibold shadow-sm transition">
            Save Payer Verdict
          </button>
        </div>
      </form>
    </div>
  `;
}

// 9. Rejection & Appeal
function renderRejectionAppealPanel(claim) {
  return `
    <div class="space-y-6">
      <div class="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-xl text-xs text-red-900">
        <div class="font-bold text-red-800 uppercase tracking-wide mb-1">Rejection Category</div>
        <p class="font-medium">Pre-existing exclusions policy limits clause. Cashless disabled by sponsor desk.</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-5 pt-3">
        <button class="text-left p-5 border border-slate-200 hover:border-slate-300 hover:bg-slate-50 rounded-xl transition" onclick="window.postAppeal('${claim.id}', 'Insurance Regulator Office')">
          <div class="text-sm font-bold text-slate-800 flex items-center gap-1"><span>⚖️</span> File Appeal with Regulator / Ombudsman</div>
          <p class="text-xs text-slate-500 mt-1">Upload treating doctor clinical logs requesting arbitration review.</p>
        </button>

        <button class="text-left p-5 border border-red-150 hover:border-red-300 hover:bg-red-50 rounded-xl transition" onclick="window.postWriteOff('${claim.id}')">
          <div class="text-sm font-bold text-red-700 flex items-center gap-1"><span>💸</span> Record Bad Debt Write-Off</div>
          <p class="text-xs text-slate-500 mt-1">Request Supervisor authority validation to post claim differences to write-off ledgers.</p>
        </button>
      </div>
    </div>
  `;
}

// 10. Settlement
function renderSettlementReconciliation(claim) {
  const patientShare = (claim.totalBillAmt - claim.approvedAmt + claim.nonPayableAmt + claim.roomDiffAmt + claim.coPayAmt - claim.advanceAmt);
  const finalPatientShare = patientShare > 0 ? patientShare : 0;

  return `
    <div class="space-y-6">
      <div class="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <table class="min-w-full divide-y divide-slate-250 text-xs text-slate-700">
          <thead class="bg-slate-50 text-slate-500 text-left font-semibold uppercase tracking-wider">
            <tr>
              <th class="px-5 py-3">RCM Settlement Parameters</th>
              <th class="px-5 py-3 text-right">Calculation (INR)</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 bg-white font-monospace">
            <tr>
              <td class="px-5 py-3 font-sans">Gross Hospital Bill charges</td>
              <td class="px-5 py-3 text-right text-slate-800">${formatINR(claim.totalBillAmt)}</td>
            </tr>
            <tr>
              <td class="px-5 py-3 font-sans">Exclusions (Non-Payable items)</td>
              <td class="px-5 py-3 text-right text-red-500">+ ${formatINR(claim.nonPayableAmt)}</td>
            </tr>
            <tr>
              <td class="px-5 py-3 font-sans">Room differential category adjustments</td>
              <td class="px-5 py-3 text-right text-red-500">+ ${formatINR(claim.roomDiffAmt)}</td>
            </tr>
            <tr>
              <td class="px-5 py-3 font-sans">Sponsor verified code payout</td>
              <td class="px-5 py-3 text-right text-emerald-600">- ${formatINR(claim.approvedAmt)}</td>
            </tr>
            <tr>
              <td class="px-5 py-3 font-sans">Co-pay deduction percentage rules</td>
              <td class="px-5 py-3 text-right text-red-500">+ ${formatINR(claim.coPayAmt)}</td>
            </tr>
            <tr>
              <td class="px-5 py-3 font-sans">Patient advance deposit adjustment</td>
              <td class="px-5 py-3 text-right text-sky-600">- ${formatINR(claim.advanceAmt)}</td>
            </tr>
            <tr class="bg-slate-900 text-white font-bold">
              <td class="px-5 py-3 font-sans font-bold">Net patient share collectable at cashier</td>
              <td class="px-5 py-3 text-right">${formatINR(finalPatientShare)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="flex flex-wrap gap-3 justify-between items-center border-t border-slate-100 pt-5">
        <div class="flex gap-2">
          <button class="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-lg text-xs font-semibold shadow-sm transition" onclick="window.collectPatientShare('${claim.id}', ${finalPatientShare})">
            💵 Collect Patient Share (Receipt)
          </button>
          <button class="border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2.5 rounded-lg text-xs font-semibold transition" onclick="window.postPayerCredit('${claim.id}', ${claim.approvedAmt})">
            🏦 Post Sponsor NEFT credit
          </button>
        </div>
        <button class="bg-[#1B3A5C] text-white hover:bg-slate-800 px-5 py-2.5 rounded-lg text-xs font-semibold shadow-sm transition" onclick="window.issueDischargeClearance('${claim.id}')">
          🏁 Issue gatepass discharge clearance
        </button>
      </div>
    </div>
  `;
}

// 11. Discharge Clearance
function renderDischargeClearancePane(claim) {
  return `
    <div class="text-center py-10 space-y-6">
      <div class="inline-flex w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 text-3xl items-center justify-center">🟢</div>
      <div class="space-y-1">
        <h3 class="text-lg font-bold text-slate-900">Insurance & TPA Clearance Active</h3>
        <p class="text-xs text-slate-500">Gateway gatepass codes initialized. Copay balances settled successfully.</p>
      </div>

      <div class="max-w-md mx-auto bg-slate-50 border border-slate-200 rounded-xl p-5 text-left text-xs space-y-3 font-sans">
        <h4 class="font-bold text-slate-800 border-b border-slate-200 pb-2">📦 Claims Docket Release Log</h4>
        <ul class="space-y-1 text-slate-650">
          <li class="flex justify-between"><span>Final Sticker Bill Copy:</span> <strong class="text-emerald-700">VERIFIED OK</strong></li>
          <li class="flex justify-between"><span>Signed Discharge Summary:</span> <strong class="text-emerald-700">VERIFIED OK</strong></li>
          <li class="flex justify-between"><span>Central Gatepass validation:</span> <strong class="text-emerald-700">ACTIVE</strong></li>
        </ul>
      </div>

      <div class="pt-4 flex justify-center gap-2">
        <button class="border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg text-xs font-semibold transition" onclick="alert('Printing release docket...')">🖨️ Print Release Receipt</button>
        <button class="bg-[#1B3A5C] text-white hover:bg-slate-800 px-4 py-2 rounded-lg text-xs font-semibold shadow-sm transition" onclick="window.switchInsTab('queue')">Return to claims worklist</button>
      </div>
    </div>
  `;
}
