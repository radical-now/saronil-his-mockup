/* ==========================================================================
   SARONIL HMS - CENTRAL PACKAGE BUILDER MODULE (packageBuilderView.js)
   ========================================================================== */

window.state = window.state || {};
if (!window.state.packages) {
  window.state.packages = [
    {
      code: "PKG-OBG-001",
      name: "Normal Delivery Package",
      alias: "Normal Delivery (Gen Ward)",
      type: "Delivery Package",
      department: "Gynecology & Obs",
      icd10: "O80.9 (Single spontaneous delivery)",
      procedureCode: "73.59 (Manually assisted delivery)",
      pmjayCode: "IP-OBG-ND01",
      cghsCode: "CGHS-OBG-201",
      los: 3,
      visitTypes: ["IPD"],
      status: "Active",
      effectiveFrom: "2025-04-01",
      effectiveTo: "",
      createdBy: "Dr. Amit Verma",
      version: 1,
      description: "Standard maternity package for vaginal delivery including room, nursing, routine tests, and labor room charges.",
      inclusions: [
        { code: "ROM001", name: "General Ward Male/Female Bed", category: "Room", qty: 3, uom: "Per Day", costingRate: 1500, lineCost: 4500, capQty: 3, overCapRule: "Billed at Standard Rate" },
        { code: "NRS001", name: "Nursing Charges - Ward", category: "Nursing", qty: 3, uom: "Per Shift", costingRate: 400, lineCost: 1200, capQty: 3, overCapRule: "Billed at Standard Rate" },
        { code: "CON009", name: "Obstetrics & Gynecology Consultation", category: "Consultation", qty: 3, uom: "Per Visit", costingRate: 800, lineCost: 2400, capQty: 3, overCapRule: "Billed at Payer Rate" },
        { code: "LAB001", name: "Complete Blood Count (CBC)", category: "Laboratory", qty: 2, uom: "Per Test", costingRate: 350, lineCost: 700, capQty: 2, overCapRule: "Not Billed" }
      ],
      exclusions: [
        { type: "Category", details: "Blood and blood products", reason: "Billed at actuals to patient based on transfusion needs", billedTo: "Patient", consentNeeded: true, estAmount: 5000 },
        { type: "Condition", details: "NICU Admission for Newborn", reason: "Complications or premature birth care excluded", billedTo: "Payer", consentNeeded: true, estAmount: 15000 },
        { type: "Item", details: "High-cost antibiotics (e.g. Meropenem)", reason: "Billed at MRP as additional pharmacy items", billedTo: "Patient", consentNeeded: false, estAmount: 0 }
      ],
      payerRates: {
        Standard: 25000,
        CGHS: 18000,
        ECHS: 19000,
        ESI: 17500,
        PMJAY: 16000,
        TPA: 23000,
        Corporate: 24000
      },
      rules: {
        discountAllowed: false,
        maxDiscount: 0,
        advanceRequired: true,
        advancePercent: 20,
        insurancePreauth: true,
        partialRule: "Lower of Actuals vs Package",
        roomUpgrade: true,
        roomUpgradeDiff: 1000
      },
      auditHistory: [
        { timestamp: "2026-06-25 09:00:00.000", user: "Dr. Amit Verma", role: "Charge Master Admin", action: "Package Created", fieldChanged: "All", prevVal: "N/A", newVal: "Initial Release", reason: "Standard pricing setup" }
      ]
    },
    {
      code: "PKG-SUR-001",
      name: "Laparoscopic Cholecystectomy Package",
      alias: "Lap Chole Package",
      type: "Surgical Package",
      department: "General Surgery",
      icd10: "K80.20 (Calculus of gallbladder)",
      procedureCode: "51.23 (Laparoscopic cholecystectomy)",
      pmjayCode: "IP-SUR-LC01",
      cghsCode: "CGHS-SUR-305",
      los: 2,
      visitTypes: ["IPD", "Day Care"],
      status: "Active",
      effectiveFrom: "2025-04-01",
      effectiveTo: "",
      createdBy: "Dr. Amit Verma",
      version: 1,
      description: "Bundled package for surgical removal of gallbladder with laparoscopic intervention.",
      inclusions: [
        { code: "ROM002", name: "Semi-Private Ward Bed", category: "Room", qty: 2, uom: "Per Day", costingRate: 3000, lineCost: 6000, capQty: 2, overCapRule: "Billed at Standard Rate" },
        { code: "NRS002", name: "Nursing Charges - Semi-Private", category: "Nursing", qty: 2, uom: "Per Shift", costingRate: 500, lineCost: 1000, capQty: 2, overCapRule: "Billed at Standard Rate" },
        { code: "CON015", name: "General Surgery Consultation", category: "Consultation", qty: 2, uom: "Per Visit", costingRate: 800, lineCost: 1600, capQty: 2, overCapRule: "Billed at Standard Rate" }
      ],
      exclusions: [
        { type: "Category", details: "Unexpected ICU Stay", reason: "Intensive care due to systemic complication is billed separately", billedTo: "Payer", consentNeeded: true, estAmount: 20000 }
      ],
      payerRates: {
        Standard: 55000,
        CGHS: 42000,
        ECHS: 44000,
        ESI: 41000,
        PMJAY: 38000,
        TPA: 50000,
        Corporate: 52000
      },
      rules: {
        discountAllowed: false,
        maxDiscount: 0,
        advanceRequired: true,
        advancePercent: 25,
        insurancePreauth: true,
        partialRule: "Lower of Actuals vs Package",
        roomUpgrade: true,
        roomUpgradeDiff: 1500
      },
      auditHistory: [
        { timestamp: "2026-06-25 09:10:00.000", user: "Dr. Amit Verma", role: "Charge Master Admin", action: "Package Created", fieldChanged: "All", prevVal: "N/A", newVal: "Initial Release", reason: "Operational standard" }
      ]
    },
    {
      code: "PKG-OPH-001",
      name: "Cataract PHACO Day Care",
      alias: "Cataract PHACO Bundle",
      type: "Day Care Package",
      department: "Ophthalmology",
      icd10: "H25.9 (Senile cataract)",
      procedureCode: "13.11 (Extracapsular extraction)",
      pmjayCode: "IP-OPH-CAT01",
      cghsCode: "CGHS-OPH-501",
      los: 1,
      visitTypes: ["Day Care"],
      status: "Active",
      effectiveFrom: "2025-04-01",
      effectiveTo: "",
      createdBy: "Dr. Amit Verma",
      version: 1,
      description: "Day care surgery for cataract extraction via Phacoemulsification with standard foldable intraocular lens (IOL).",
      inclusions: [
        { code: "ROM005", name: "Daycare Ward Bed", category: "Room", qty: 1, uom: "Per Day", costingRate: 1500, lineCost: 1500, capQty: 1, overCapRule: "Billed at Standard Rate" },
        { code: "CON010", name: "Ophthalmology Consultation", category: "Consultation", qty: 1, uom: "Per Visit", costingRate: 800, lineCost: 800, capQty: 1, overCapRule: "Billed at Standard Rate" }
      ],
      exclusions: [
        { type: "Item", details: "Premium Multifocal IOL Upgrade", reason: "Premium lens upgrades requested by patient billed separately", billedTo: "Patient", consentNeeded: true, estAmount: 25000 }
      ],
      payerRates: {
        Standard: 28000,
        CGHS: 19000,
        ECHS: 20000,
        ESI: 18500,
        PMJAY: 17000,
        TPA: 25000,
        Corporate: 26500
      },
      rules: {
        discountAllowed: true,
        maxDiscount: 5,
        advanceRequired: false,
        advancePercent: 0,
        insurancePreauth: true,
        partialRule: "Fixed percentage deduction",
        roomUpgrade: false,
        roomUpgradeDiff: 0
      },
      auditHistory: [
        { timestamp: "2026-06-25 09:20:00.000", user: "Dr. Amit Verma", role: "Charge Master Admin", action: "Package Created", fieldChanged: "All", prevVal: "N/A", newVal: "Initial Release", reason: "Standard cataracts package" }
      ]
    }
  ];
}

if (!window.state.packageAssignments) {
  window.state.packageAssignments = [
    {
      id: "ASG-2026-001",
      patientUhid: "UHID20000003",
      patientName: "Rahul Sharma",
      packageCode: "PKG-SUR-001",
      packageName: "Laparoscopic Cholecystectomy Package",
      admissionNo: "ADM00231",
      dateAssigned: "2026-06-24 10:00 IST",
      assignedBy: "Sanjay Kumar",
      status: "Active", // Active, Closed, Partially Billed, Cancelled
      payer: "TPA",
      lockedPrice: 50000,
      consentStatus: "Signed",
      consentWitness: "Meena Patel (Staff)",
      consentFile: "consent_rahul_sharma_signed.pdf",
      actualDays: 2,
      postedCharges: [
        { code: "ROM002", name: "Semi-Private Ward Bed", qty: 2, cost: 6000, flag: "Inclusion-Absorbed" },
        { code: "NRS002", name: "Nursing Charges - Semi-Private", qty: 2, cost: 1000, flag: "Inclusion-Absorbed" },
        { code: "CON015", name: "General Surgery Consultation", qty: 2, cost: 1600, flag: "Inclusion-Absorbed" },
        { code: "LAB001", name: "Complete Blood Count (CBC)", qty: 1, cost: 350, flag: "Exclusion-Billed", reason: "Not in package inclusions" }
      ],
      manualExclusions: []
    }
  ];
}

// Module Session Variables
let activePkgTab = "dashboard"; // "dashboard", "registry", "editor", "assignment", "tracking", "closure", "reports"
let selectedPkgCode = null;
let selectedAssignmentId = null;
let currentPackageRole = "BILLING_MANAGER";
let pkgSearchQuery = "";
let pkgDeptFilter = "";
let pkgTypeFilter = "";
let pkgStatusFilter = "";

function formatINR(val) {
  return "₹" + Number(val).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

window.views.packageBuilder = function(container, subAnchor, params) {
  window.activeModuleTab = 'packages';
  if (typeof renderUnifiedModule === 'function') {
    renderUnifiedModule(container);
  } else if (window.views.chargeMaster) {
    window.views.chargeMaster(container, subAnchor, params);
  }
};

function renderPackageBuilderView(container) {
  if (typeof renderUnifiedModule === 'function') {
    renderUnifiedModule(container);
  } else {
    container.innerHTML = `<div class="p-6 text-slate-500 font-semibold font-sans">Loading Package Builder Workspace...</div>`;
  }
}

window.switchPackageRole = function(role) {
  currentPackageRole = role;
  if (typeof renderUnifiedTabContent === 'function') {
    renderUnifiedTabContent();
  } else {
    renderPkgTabContent();
  }
};

window.switchPkgTab = function(tab) {
  activePkgTab = tab;
  if (tab !== "editor") selectedPkgCode = null;
  const container = document.getElementById('main-content');
  if (typeof renderUnifiedModule === 'function') {
    renderUnifiedModule(container);
  } else {
    renderPackageBuilderView(container);
  }
};

function renderPkgTabContent() {
  const workspace = document.getElementById('pkg-view-workspace') || document.getElementById('pkg-sub-workspace');
  if (!workspace) return;

  try {
    switch(activePkgTab) {
      case "dashboard":
        renderPkgDashboard(workspace);
        break;
      case "registry":
        renderPkgRegistry(workspace);
        break;
      case "editor":
        renderPkgEditor(workspace);
        break;
      case "assignment":
        renderPkgAssignment(workspace);
        break;
      case "tracking":
        renderPkgTracking(workspace);
        break;
      case "closure":
        renderPkgClosure(workspace);
        break;
      case "reports":
        renderPkgReports(workspace);
        break;
    }
  } catch (err) {
    console.error("Error in renderPkgTabContent:", err);
    workspace.innerHTML = `
      <div class="p-5 border border-red-200 bg-red-55 text-red-800 rounded-xl space-y-3">
        <h4 class="font-bold text-sm">❌ Error Loading Package Workspace</h4>
        <p class="text-xs">A runtime exception occurred while attempting to build the packages tab:</p>
        <pre class="bg-white border rounded p-3 text-[10px] font-mono overflow-x-auto">${err.stack}</pre>
      </div>
    `;
  }
}

// ----------------------------------------------------
// TAB 1: OVERVIEW DASHBOARD
// ----------------------------------------------------
function renderPkgDashboard(space) {
  const totalActive = state.packages.filter(p => p.status === "Active").length;
  const activeAssigned = state.packageAssignments.filter(a => a.status === "Active").length;
  const pendingClosure = state.packageAssignments.filter(a => a.status === "Active" && a.actualDays >= 2).length; // Simulated condition
  const compliance = activeAssigned > 0 ? Math.round((state.packageAssignments.filter(a => a.consentStatus === "Signed").length / state.packageAssignments.length) * 100) : 100;

  space.innerHTML = `
    <!-- Top Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-5 mb-6">
      <div class="bg-white border border-slate-200 rounded-xl p-5 flex items-center gap-4 shadow-sm">
        <div class="w-12 h-12 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl">📁</div>
        <div>
          <div class="text-2xl font-bold text-slate-900">${totalActive}</div>
          <span class="text-xs font-medium text-slate-500 uppercase tracking-wider">Active Templates</span>
        </div>
      </div>

      <div class="bg-white border border-slate-200 rounded-xl p-5 flex items-center gap-4 shadow-sm">
        <div class="w-12 h-12 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center text-xl">👤</div>
        <div>
          <div class="text-2xl font-bold text-slate-900">${activeAssigned}</div>
          <span class="text-xs font-medium text-slate-500 uppercase tracking-wider">Active Patient Stays</span>
        </div>
      </div>

      <div class="bg-white border border-slate-200 rounded-xl p-5 flex items-center gap-4 shadow-sm">
        <div class="w-12 h-12 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center text-xl">⏳</div>
        <div>
          <div class="text-2xl font-bold text-slate-900">${pendingClosure}</div>
          <span class="text-xs font-medium text-slate-500 uppercase tracking-wider">Pending Closures</span>
        </div>
      </div>

      <div class="bg-white border border-slate-200 rounded-xl p-5 flex items-center gap-4 shadow-sm">
        <div class="w-12 h-12 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl">📜</div>
        <div>
          <div class="text-2xl font-bold text-slate-900">${compliance}%</div>
          <span class="text-xs font-medium text-slate-500 uppercase tracking-wider">Consent Compliance</span>
        </div>
      </div>
    </div>

    <!-- Active Assignments & Alert Feed -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Active Patients on Packages -->
      <div class="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
        <h3 class="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
          <span>🩺</span> Patients Assigned to Active Packages
        </h3>
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-slate-200 text-xs text-left">
            <thead>
              <tr class="text-slate-500 uppercase tracking-wider font-semibold">
                <th class="py-2">Patient Details</th>
                <th class="py-2">Assigned Package</th>
                <th class="py-2">Payer / Locked Price</th>
                <th class="py-2">Status</th>
                <th class="py-2 text-center font-bold">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-200 text-slate-700">
              ${state.packageAssignments.map(asg => `
                <tr class="hover:bg-slate-50">
                  <td class="py-3">
                    <div class="font-bold text-slate-900">${asg.patientName}</div>
                    <div class="text-[10px] text-slate-400 font-mono">${asg.patientUhid} | Adm: ${asg.admissionNo}</div>
                  </td>
                  <td class="py-3">
                    <div class="font-semibold text-slate-800">${asg.packageName}</div>
                    <div class="text-[10px] text-indigo-600 font-bold">${asg.packageCode}</div>
                  </td>
                  <td class="py-3">
                    <div class="font-semibold">${asg.payer}</div>
                    <div class="text-[10px] text-slate-500 font-mono">${formatINR(asg.lockedPrice)}</div>
                  </td>
                  <td class="py-3">
                    <span class="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${asg.status === 'Active' ? 'bg-emerald-50 text-emerald-800 border border-emerald-100' : 'bg-slate-100 text-slate-700'}">
                      ${asg.status}
                    </span>
                  </td>
                  <td class="py-3 text-center">
                    <button class="bg-[#1B3A5C] text-white px-2.5 py-1 rounded text-[10px] font-semibold hover:bg-slate-850" onclick="window.viewSpecificAssignment('${asg.id}')">
                      Track & Reconcile
                    </button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Pricing & Margin Audits -->
      <div class="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
        <h3 class="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">⚠️ Alerts & Pricing Revisions</h3>
        <div class="space-y-3.5 text-xs">
          <div class="flex items-start gap-2.5 p-3 rounded-lg bg-amber-50 text-amber-900 border border-amber-200">
            <span class="text-lg">📢</span>
            <div>
              <div class="font-semibold">Consent Pending: PKG-SUR-001</div>
              <p class="text-[10px] text-amber-700 mt-0.5">Patient admission list includes 1 surgical package awaiting signed physical/digital consent document upload.</p>
            </div>
          </div>

          <div class="flex items-start gap-2.5 p-3 rounded-lg bg-red-50 text-red-900 border border-red-200">
            <span class="text-lg">🚨</span>
            <div>
              <div class="font-semibold">Negative Margin Warning</div>
              <p class="text-[10px] text-red-700 mt-0.5">Average actual clinical cost exceeds flat package rate for Normal Delivery (PKG-OBG-001) for 2 consecutive months.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

window.viewSpecificAssignment = function(asgId) {
  selectedAssignmentId = asgId;
  window.switchPkgTab('tracking');
};

// ----------------------------------------------------
// TAB 2: PACKAGES REGISTRY LIST
// ----------------------------------------------------
function renderPkgRegistry(space) {
  let filtered = state.packages;

  if (pkgSearchQuery) {
    filtered = filtered.filter(p => p.name.toLowerCase().includes(pkgSearchQuery) || p.code.toLowerCase().includes(pkgSearchQuery));
  }
  if (pkgDeptFilter) {
    filtered = filtered.filter(p => p.department === pkgDeptFilter);
  }
  if (pkgTypeFilter) {
    filtered = filtered.filter(p => p.type === pkgTypeFilter);
  }
  if (pkgStatusFilter) {
    filtered = filtered.filter(p => p.status === pkgStatusFilter);
  }

  const departments = [...new Set(state.packages.map(p => p.department))];
  const types = [...new Set(state.packages.map(p => p.type))];

  space.innerHTML = `
    <div class="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
      <!-- Search Filters -->
      <div class="bg-slate-50 border-b border-slate-200 p-4 flex flex-col md:flex-row gap-3">
        <div class="flex-1">
          <input type="text" class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs outline-none focus:border-slate-400" placeholder="Search by Package code, name, ICD-10 mapping..." value="${pkgSearchQuery}" oninput="window.updatePkgSearch(this.value)">
        </div>
        <div class="w-full md:w-44">
          <select class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs outline-none focus:border-slate-400" onchange="window.updatePkgDeptFilter(this.value)">
            <option value="">-- All Departments --</option>
            ${departments.map(d => `<option value="${d}" ${pkgDeptFilter === d ? 'selected' : ''}>${d}</option>`).join('')}
          </select>
        </div>
        <div class="w-full md:w-44">
          <select class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs outline-none focus:border-slate-400" onchange="window.updatePkgTypeFilter(this.value)">
            <option value="">-- All Types --</option>
            ${types.map(t => `<option value="${t}" ${pkgTypeFilter === t ? 'selected' : ''}>${t}</option>`).join('')}
          </select>
        </div>
        <div class="w-full md:w-40">
          <select class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs outline-none focus:border-slate-400" onchange="window.updatePkgStatusFilter(this.value)">
            <option value="">-- Status --</option>
            <option value="Active" ${pkgStatusFilter === 'Active' ? 'selected' : ''}>Active</option>
            <option value="Draft" ${pkgStatusFilter === 'Draft' ? 'selected' : ''}>Draft</option>
            <option value="Suspended" ${pkgStatusFilter === 'Suspended' ? 'selected' : ''}>Suspended</option>
          </select>
        </div>
      </div>

      <!-- Packages Grid/Table -->
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-slate-200 text-xs text-left">
          <thead class="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold">
            <tr>
              <th class="px-6 py-3">Code / Type</th>
              <th class="px-6 py-3">Package Title</th>
              <th class="px-6 py-3">Dept / Specialty</th>
              <th class="px-6 py-3">ICD Mappings</th>
              <th class="px-6 py-3 text-right">Standard Rate (MRP)</th>
              <th class="px-6 py-3">Status</th>
              <th class="px-6 py-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200 bg-white text-slate-700">
            ${filtered.map(pkg => `
              <tr class="hover:bg-slate-50">
                <td class="px-6 py-4">
                  <div class="font-bold text-slate-900 font-mono">${pkg.code}</div>
                  <span class="text-[9px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-bold uppercase">${pkg.type}</span>
                </td>
                <td class="px-6 py-4">
                  <div class="font-bold text-slate-800 text-sm">${pkg.name}</div>
                  <div class="text-[10px] text-slate-400">Exp. Stay: ${pkg.los} Days</div>
                </td>
                <td class="px-6 py-4 text-slate-600">${pkg.department}</td>
                <td class="px-6 py-4">
                  <div class="font-mono text-slate-500">${pkg.icd10.split(' ')[0]}</div>
                  <div class="text-[9px] text-slate-400 truncate max-w-[150px]">${pkg.icd10}</div>
                </td>
                <td class="px-6 py-4 text-right font-bold text-slate-900 font-mono">${formatINR(pkg.payerRates.Standard)}</td>
                <td class="px-6 py-4">
                  <span class="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${pkg.status === 'Active' ? 'bg-emerald-50 text-emerald-800 border border-emerald-100' : 'bg-slate-100 text-slate-600'}">
                    ${pkg.status}
                  </span>
                </td>
                <td class="px-6 py-4 text-center">
                  <div class="inline-flex gap-1.5">
                    <button class="bg-[#1B3A5C] text-white hover:bg-slate-850 px-2 py-1 rounded text-[10px] font-semibold" onclick="window.editPkgItem('${pkg.code}')">Edit</button>
                    <button class="border border-slate-200 hover:bg-slate-50 text-slate-700 px-2 py-1 rounded text-[10px] font-semibold" onclick="window.freezePkgItem('${pkg.code}')">Freeze</button>
                  </div>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

window.updatePkgSearch = function(val) { pkgSearchQuery = val.toLowerCase(); renderPkgTabContent(); };
window.updatePkgDeptFilter = function(val) { pkgDeptFilter = val; renderPkgTabContent(); };
window.updatePkgTypeFilter = function(val) { pkgTypeFilter = val; renderPkgTabContent(); };
window.updatePkgStatusFilter = function(val) { pkgStatusFilter = val; renderPkgTabContent(); };

window.editPkgItem = function(code) {
  selectedPkgCode = code;
  activePkgTab = "editor";
  renderPackageBuilderView(document.getElementById('main-content'));
};

window.freezePkgItem = function(code) {
  if (currentPackageRole !== "CHARGE_MASTER_ADMIN") {
    alert("❌ Access Denied: Only a Charge Master Admin can freeze package templates.");
    return;
  }
  const reason = prompt("Enter justification to freeze/suspend this package template:");
  if (!reason) return;
  const pkg = state.packages.find(p => p.code === code);
  if (pkg) {
    pkg.status = "Suspended";
    pkg.auditHistory.push({
      timestamp: new Date().toLocaleString(),
      user: "System",
      role: currentPackageRole,
      action: "Package Suspended",
      fieldChanged: "Status",
      prevVal: "Active",
      newVal: "Suspended",
      reason: reason
    });
    alert(`Package ${code} has been suspended.`);
    renderPkgTabContent();
  }
};

// ----------------------------------------------------
// TAB 3: PACKAGE BUILDER FORM (CREATOR/EDITOR)
// ----------------------------------------------------
let editorActiveSection = "identity"; // identity, inclusions, exclusions, pricing, rules

function renderPkgEditor(space) {
  const pkg = state.packages.find(p => p.code === selectedPkgCode) || {
    code: "", name: "", alias: "", type: "Surgical Package", department: "General Surgery",
    icd10: "", procedureCode: "", pmjayCode: "", cghsCode: "", los: 2, visitTypes: ["IPD"],
    status: "Draft", effectiveFrom: "", effectiveTo: "", description: "", inclusions: [], exclusions: [],
    payerRates: { Standard: 0, CGHS: 0, ECHS: 0, ESI: 0, PMJAY: 0, TPA: 0, Corporate: 0 },
    rules: { discountAllowed: false, maxDiscount: 0, advanceRequired: false, advancePercent: 0, insurancePreauth: true, partialRule: "Lower of Actuals vs Package", roomUpgrade: true, roomUpgradeDiff: 0 }
  };

  space.innerHTML = `
    <div class="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col md:flex-row min-h-[500px]">
      
      <!-- Left sidebar steps -->
      <div class="w-full md:w-60 bg-slate-50 border-r border-slate-200 p-4 space-y-1">
        <h4 class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 px-2">Setup Sections</h4>
        <button class="w-full text-left px-3 py-2 rounded-lg text-xs font-semibold flex items-center justify-between ${editorActiveSection === 'identity' ? 'bg-[#1B3A5C] text-white' : 'text-slate-600 hover:bg-slate-100'}" onclick="window.switchEditorSection('identity')">
          <span>Identity Config</span>
          <span>1️⃣</span>
        </button>
        <button class="w-full text-left px-3 py-2 rounded-lg text-xs font-semibold flex items-center justify-between ${editorActiveSection === 'inclusions' ? 'bg-[#1B3A5C] text-white' : 'text-slate-600 hover:bg-slate-100'}" onclick="window.switchEditorSection('inclusions')">
          <span>Define Inclusions</span>
          <span>2️⃣</span>
        </button>
        <button class="w-full text-left px-3 py-2 rounded-lg text-xs font-semibold flex items-center justify-between ${editorActiveSection === 'exclusions' ? 'bg-[#1B3A5C] text-white' : 'text-slate-600 hover:bg-slate-100'}" onclick="window.switchEditorSection('exclusions')">
          <span>Define Exclusions</span>
          <span>3️⃣</span>
        </button>
        <button class="w-full text-left px-3 py-2 rounded-lg text-xs font-semibold flex items-center justify-between ${editorActiveSection === 'pricing' ? 'bg-[#1B3A5C] text-white' : 'text-slate-600 hover:bg-slate-100'}" onclick="window.switchEditorSection('pricing')">
          <span>Payer Pricing</span>
          <span>4️⃣</span>
        </button>
        <button class="w-full text-left px-3 py-2 rounded-lg text-xs font-semibold flex items-center justify-between ${editorActiveSection === 'rules' ? 'bg-[#1B3A5C] text-white' : 'text-slate-600 hover:bg-slate-100'}" onclick="window.switchEditorSection('rules')">
          <span>Billing Rules</span>
          <span>5️⃣</span>
        </button>
      </div>

      <!-- Right Form Content Area -->
      <form id="package-template-form" class="flex-1 p-6 space-y-6 flex flex-col justify-between" onsubmit="event.preventDefault(); window.savePackageTemplate();">
        
        <div id="editor-section-content">
          <!-- Dynamically filled -->
        </div>

        <!-- Footer Control Buttons -->
        <div class="flex justify-between pt-6 border-t border-slate-100 mt-6">
          <button type="button" class="border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg text-xs font-semibold" onclick="window.switchPkgTab('registry')">
            Cancel
          </button>
          <button type="submit" class="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-lg text-xs font-semibold shadow-sm">
            Save Package Template
          </button>
        </div>

      </form>
    </div>
  `;
  renderEditorSection(pkg);
}

window.switchEditorSection = function(section) {
  editorActiveSection = section;
  renderPkgTabContent();
};

function renderEditorSection(pkg) {
  const content = document.getElementById('editor-section-content');
  if (!content) return;

  if (editorActiveSection === "identity") {
    content.innerHTML = `
      <div class="space-y-4">
        <h3 class="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">SECTION 1: PACKAGE IDENTITY & CLINICAL TARGETS</h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label class="block text-xs font-semibold text-slate-500 uppercase mb-1.5">Package Code</label>
            <input type="text" id="ed-code" class="block w-full rounded-lg border border-slate-300 px-3 py-2 text-xs" placeholder="PKG-SUR-001" value="${pkg.code}" ${pkg.code ? 'readonly' : ''} required>
          </div>
          <div>
            <label class="block text-xs font-semibold text-slate-500 uppercase mb-1.5">Package Name</label>
            <input type="text" id="ed-name" class="block w-full rounded-lg border border-slate-300 px-3 py-2 text-xs" placeholder="e.g. LSCS General Ward Package" value="${pkg.name}" required>
          </div>
          <div>
            <label class="block text-xs font-semibold text-slate-500 uppercase mb-1.5">Short Alias</label>
            <input type="text" id="ed-alias" class="block w-full rounded-lg border border-slate-300 px-3 py-2 text-xs" placeholder="e.g. LSCS (Gen)" value="${pkg.alias || ''}">
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label class="block text-xs font-semibold text-slate-500 uppercase mb-1.5">Package Type</label>
            <select id="ed-type" class="block w-full rounded-lg border border-slate-300 px-3 py-2 text-xs">
              <option value="Surgical Package" ${pkg.type === 'Surgical Package' ? 'selected' : ''}>Surgical Package</option>
              <option value="Delivery Package" ${pkg.type === 'Delivery Package' ? 'selected' : ''}>Delivery Package</option>
              <option value="Procedure Package" ${pkg.type === 'Procedure Package' ? 'selected' : ''}>Procedure Package</option>
              <option value="Implant Package" ${pkg.type === 'Implant Package' ? 'selected' : ''}>Implant Package</option>
              <option value="Investigation Bundle" ${pkg.type === 'Investigation Bundle' ? 'selected' : ''}>Investigation Bundle</option>
              <option value="Day Care Package" ${pkg.type === 'Day Care Package' ? 'selected' : ''}>Day Care Package</option>
            </select>
          </div>
          <div>
            <label class="block text-xs font-semibold text-slate-500 uppercase mb-1.5">Department</label>
            <select id="ed-department" class="block w-full rounded-lg border border-slate-300 px-3 py-2 text-xs">
              <option value="General Surgery" ${pkg.department === 'General Surgery' ? 'selected' : ''}>General Surgery</option>
              <option value="Gynecology & Obs" ${pkg.department === 'Gynecology & Obs' ? 'selected' : ''}>Gynecology & Obs</option>
              <option value="Ophthalmology" ${pkg.department === 'Ophthalmology' ? 'selected' : ''}>Ophthalmology</option>
              <option value="Cardiology" ${pkg.department === 'Cardiology' ? 'selected' : ''}>Cardiology</option>
              <option value="Orthopedics" ${pkg.department === 'Orthopedics' ? 'selected' : ''}>Orthopedics</option>
            </select>
          </div>
          <div>
            <label class="block text-xs font-semibold text-slate-500 uppercase mb-1.5">Expected Length of Stay (Days)</label>
            <input type="number" id="ed-los" class="block w-full rounded-lg border border-slate-300 px-3 py-2 text-xs" value="${pkg.los}" required>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label class="block text-xs font-semibold text-slate-500 uppercase mb-1.5">ICD-10 Mapped Diagnosis</label>
            <input type="text" id="ed-icd10" class="block w-full rounded-lg border border-slate-300 px-3 py-2 text-xs" placeholder="e.g. O80.9" value="${pkg.icd10}">
          </div>
          <div>
            <label class="block text-xs font-semibold text-slate-500 uppercase mb-1.5">PMJAY Package Mapping Code</label>
            <input type="text" id="ed-pmjay-code" class="block w-full rounded-lg border border-slate-300 px-3 py-2 text-xs" placeholder="e.g. IP-OBG-ND01" value="${pkg.pmjayCode || ''}">
          </div>
          <div>
            <label class="block text-xs font-semibold text-slate-500 uppercase mb-1.5">CGHS Schedule Code</label>
            <input type="text" id="ed-cghs-code" class="block w-full rounded-lg border border-slate-300 px-3 py-2 text-xs" placeholder="e.g. CGHS-OBG-201" value="${pkg.cghsCode || ''}">
          </div>
        </div>

        <div>
          <label class="block text-xs font-semibold text-slate-500 uppercase mb-1.5">Internal Notes & Description</label>
          <textarea id="ed-desc" class="block w-full rounded-lg border border-slate-300 px-3 py-2 text-xs" rows="3">${pkg.description}</textarea>
        </div>
      </div>
    `;
  } else if (editorActiveSection === "inclusions") {
    content.innerHTML = `
      <div class="space-y-4">
        <h3 class="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">SECTION 2: DEFINE CLINICAL INCLUSIONS</h3>
        
        <div class="p-3 bg-emerald-50 rounded-lg text-emerald-800 text-[11px] font-semibold border border-emerald-200">
          💡 Map items directly from the central Charge Master. All matched line items posted during the patient's stay will automatically be absorbed within the final flat rate.
        </div>

        <div class="border border-slate-200 rounded-lg overflow-hidden">
          <table class="min-w-full divide-y divide-slate-200 text-xs">
            <thead class="bg-slate-50 text-slate-500 uppercase font-semibold text-left">
              <tr>
                <th class="px-4 py-2">Item Code</th>
                <th class="px-4 py-2">Title</th>
                <th class="px-4 py-2">Included Qty</th>
                <th class="px-4 py-2">Costing Rate</th>
                <th class="px-4 py-2 text-right">Line Total</th>
                <th class="px-4 py-2 text-center">Action</th>
              </tr>
            </thead>
            <tbody id="editor-inclusions-list" class="divide-y divide-slate-200">
              <!-- Preset values if editing -->
              ${pkg.inclusions.map((inc, index) => `
                <tr id="inc-row-${inc.code}" data-code="${inc.code}" data-name="${inc.name}" data-category="${inc.category || 'Procedures'}" data-uom="${inc.uom || 'Per Visit'}" data-rate="${inc.costingRate}">
                  <td class="px-4 py-2.5 font-mono font-bold text-indigo-600">${inc.code}</td>
                  <td class="px-4 py-2.5 font-semibold text-slate-800">${inc.name}</td>
                  <td class="px-4 py-2.5"><input type="number" class="w-16 border rounded px-1.5 py-0.5 text-center font-bold inc-qty-input" value="${inc.qty}" min="1" oninput="window.updateInclusionRowTotal('${inc.code}', ${inc.costingRate}, this.value)"></td>
                  <td class="px-4 py-2.5 font-mono">${formatINR(inc.costingRate)}</td>
                  <td id="inc-total-${inc.code}" class="px-4 py-2.5 text-right font-bold font-mono inc-line-cost" data-val="${inc.lineCost}">${formatINR(inc.lineCost)}</td>
                  <td class="px-4 py-2.5 text-center">
                    <button type="button" class="text-red-500 hover:text-red-700 text-xs" onclick="document.getElementById('inc-row-${inc.code}').remove(); window.recalcInclusionsTotals();">✕ Remove</button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <!-- Running totals calculator widget -->
        <div class="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col md:flex-row justify-between items-center text-xs">
          <div>
            <span class="text-slate-500 font-semibold uppercase">Total Inclusions Count:</span>
            <span id="run-tot-count" class="font-bold text-slate-800 ml-1">0 items</span>
          </div>
          <div>
            <span class="text-slate-500 font-semibold uppercase">Total Inclusions Cost:</span>
            <span id="run-tot-cost" class="font-mono font-bold text-slate-900 ml-1">₹0.00</span>
          </div>
          <div>
            <span class="text-slate-500 font-semibold uppercase">Gross Margin (Self-Pay):</span>
            <span id="run-tot-margin" class="font-bold text-emerald-600 ml-1">₹0.00 (0%)</span>
          </div>
        </div>

        <div class="relative flex gap-2">
          <input type="text" id="inc-search-charge" class="flex-1 rounded-lg border border-slate-300 px-3 py-1.5 text-xs" placeholder="Search service/procedure to append...">
        </div>
      </div>
    `;
    setTimeout(() => { 
      window.initInclusionsAutocomplete(); 
      window.recalcInclusionsTotals();
    }, 50);
  } else if (editorActiveSection === "exclusions") {
    content.innerHTML = `
      <div class="space-y-4">
        <h3 class="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">SECTION 3: DEFINE FIXED EXCLUSIONS</h3>
        
        <div class="p-3 bg-amber-50 rounded-lg text-amber-800 text-[11px] font-semibold border border-amber-200">
          ⚠️ Excluded services will be billed itemised to the patient or payer separate from the package flat rate.
        </div>

        <div class="border border-slate-200 rounded-lg overflow-hidden">
          <table class="min-w-full divide-y divide-slate-200 text-xs">
            <thead class="bg-slate-50 text-slate-500 uppercase font-semibold text-left">
              <tr>
                <th class="px-4 py-2">Exclusion Type</th>
                <th class="px-4 py-2">Excluded Description / Scope</th>
                <th class="px-4 py-2">Justification / Reason</th>
                <th class="px-4 py-2">Billed To</th>
                <th class="px-4 py-2 text-center">Consent Req.</th>
                <th class="px-4 py-2 text-center">Action</th>
              </tr>
            </thead>
            <tbody id="editor-exclusions-list" class="divide-y divide-slate-200">
              ${pkg.exclusions.map((exc, index) => `
                <tr id="exc-row-${index}">
                  <td class="px-4 py-2.5 font-bold">${exc.type}</td>
                  <td class="px-4 py-2.5 text-slate-800 font-semibold">${exc.details}</td>
                  <td class="px-4 py-2.5 text-slate-500">${exc.reason}</td>
                  <td class="px-4 py-2.5">${exc.billedTo}</td>
                  <td class="px-4 py-2.5 text-center font-bold text-amber-600">${exc.consentNeeded ? 'YES' : 'NO'}</td>
                  <td class="px-4 py-2.5 text-center">
                    <button type="button" class="text-red-500 hover:text-red-700 text-xs" onclick="document.getElementById('exc-row-${index}').remove()">✕ Remove</button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <div class="mb-4">
          <label class="block text-[10px] font-bold text-slate-500 uppercase mb-2">Preset Exclusion Groups (One-Click Add)</label>
          <div class="flex flex-wrap gap-2">
            <button type="button" class="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-200" onclick="window.addExclusionGroup('blood')">
              🩸 + Add Blood Products Group
            </button>
            <button type="button" class="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-200" onclick="window.addExclusionGroup('complication')">
              ⚠️ + Add Complication Group
            </button>
            <button type="button" class="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-200" onclick="window.addExclusionGroup('implant')">
              ⚙️ + Add Implant Upgrade Group
            </button>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
          <div>
            <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Exclusion Type</label>
            <select id="exc-new-type" class="w-full rounded border px-2 py-1 text-xs bg-white">
              <option value="Category">Category</option>
              <option value="Item">Item</option>
              <option value="Condition">Condition</option>
            </select>
          </div>
          <div class="md:col-span-2">
            <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Details / Specific Item</label>
            <input type="text" id="exc-new-details" class="w-full rounded border px-2 py-1 text-xs" placeholder="e.g. ICU unexpected stays">
          </div>
          <div>
            <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Billed To</label>
            <select id="exc-new-billto" class="w-full rounded border px-2 py-1 text-xs bg-white">
              <option value="Patient">Patient Only</option>
              <option value="Payer">Payer (Claims)</option>
            </select>
          </div>
          <div class="md:col-span-4 flex justify-end">
            <button type="button" class="bg-[#1B3A5C] text-white px-4 py-1.5 rounded-lg text-xs font-semibold hover:bg-slate-800" onclick="window.addMockExclusionLine()">+ Add Custom Exclusion</button>
          </div>
        </div>
      </div>
    `;
  } else if (editorActiveSection === "pricing") {
    content.innerHTML = `
      <div class="space-y-4">
        <h3 class="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">SECTION 4: MULTI-PAYER PRICING MATRIX</h3>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="space-y-4">
            <div>
              <label class="block text-xs font-semibold text-slate-500 uppercase mb-1.5">Standard Self-Pay Price (₹)</label>
              <input type="number" id="pr-standard" class="block w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-bold text-slate-900 font-mono" value="${pkg.payerRates.Standard}" required>
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-500 uppercase mb-1.5">CGHS Rate Approved (₹)</label>
              <input type="number" id="pr-cghs" class="block w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-bold text-slate-900 font-mono" value="${pkg.payerRates.CGHS}">
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-500 uppercase mb-1.5">ECHS Rate Approved (₹)</label>
              <input type="number" id="pr-echs" class="block w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-bold text-slate-900 font-mono" value="${pkg.payerRates.ECHS}">
            </div>
          </div>

          <div class="space-y-4">
            <div>
              <label class="block text-xs font-semibold text-slate-500 uppercase mb-1.5">PMJAY mandated rate ceiling (₹)</label>
              <input type="number" id="pr-pmjay" class="block w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-bold text-slate-900 font-mono" value="${pkg.payerRates.PMJAY}">
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-500 uppercase mb-1.5">TPA negotiated rate (₹)</label>
              <input type="number" id="pr-tpa" class="block w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-bold text-slate-900 font-mono" value="${pkg.payerRates.TPA}">
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-500 uppercase mb-1.5">Corporate Rate (₹)</label>
              <input type="number" id="pr-corporate" class="block w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-bold text-slate-900 font-mono" value="${pkg.payerRates.Corporate}">
            </div>
          </div>
        </div>
      </div>
    `;
  } else if (editorActiveSection === "rules") {
    content.innerHTML = `
      <div class="space-y-4">
        <h3 class="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">SECTION 5: BILLING CONSTRAINTS & RULES</h3>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="space-y-4">
            <div class="flex items-center justify-between p-3 rounded-lg border bg-slate-50">
              <div>
                <div class="font-bold text-slate-800 text-xs">Allow Extra Discounts</div>
                <div class="text-[10px] text-slate-400">Can Billing Executive apply further discounts?</div>
              </div>
              <input type="checkbox" id="rl-discount" class="h-4 w-4" ${pkg.rules.discountAllowed ? 'checked' : ''}>
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-500 uppercase mb-1.5">Maximum Approved Discount (%)</label>
              <input type="number" id="rl-discount-max" class="block w-full rounded-lg border border-slate-300 px-3 py-2 text-xs" value="${pkg.rules.maxDiscount}">
            </div>

            <div class="flex items-center justify-between p-3 rounded-lg border bg-slate-50">
              <div>
                <div class="font-bold text-slate-800 text-xs">Advance Payments Required</div>
                <div class="text-[10px] text-slate-400">Mandate deposit at assignment?</div>
              </div>
              <input type="checkbox" id="rl-advance" class="h-4 w-4" ${pkg.rules.advanceRequired ? 'checked' : ''}>
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-500 uppercase mb-1.5">Minimum Advance Deposit (%)</label>
              <input type="number" id="rl-advance-pct" class="block w-full rounded-lg border border-slate-300 px-3 py-2 text-xs" value="${pkg.rules.advancePercent}">
            </div>
          </div>

          <div class="space-y-4">
            <div>
              <label class="block text-xs font-semibold text-slate-500 uppercase mb-1.5">Pro-rating Rule for Cancelled/Early stays</label>
              <select id="rl-partial" class="block w-full rounded-lg border border-slate-300 px-3 py-2 text-xs">
                <option value="Lower of Actuals vs Package" ${pkg.rules.partialRule === 'Lower of Actuals vs Package' ? 'selected' : ''}>Lower of Actuals vs Package</option>
                <option value="Fixed percentage deduction" ${pkg.rules.partialRule === 'Fixed percentage deduction' ? 'selected' : ''}>Fixed percentage deduction</option>
                <option value="Supervisor Manual Determination" ${pkg.rules.partialRule === 'Supervisor Manual Determination' ? 'selected' : ''}>Supervisor Manual Determination</option>
              </select>
            </div>

            <div class="flex items-center justify-between p-3 rounded-lg border bg-slate-50">
              <div>
                <div class="font-bold text-slate-800 text-xs">Allow Ward Upgrade Entitlement</div>
                <div class="text-[10px] text-slate-400">Can patient pay room upgrade differential?</div>
              </div>
              <input type="checkbox" id="rl-upgrade" class="h-4 w-4" ${pkg.rules.roomUpgrade ? 'checked' : ''}>
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-500 uppercase mb-1.5">Ward Upgrade Room Differential (₹/day)</label>
              <input type="number" id="rl-upgrade-diff" class="block w-full rounded-lg border border-slate-300 px-3 py-2 text-xs" value="${pkg.rules.roomUpgradeDiff}">
            </div>
          </div>
        </div>
      </div>
    `;
  }
}

window.initInclusionsAutocomplete = function() {
  const input = document.getElementById('inc-search-charge');
  if (!input) return;

  let dropdown = document.getElementById('inc-search-dropdown');
  if (!dropdown) {
    dropdown = document.createElement('div');
    dropdown.id = 'inc-search-dropdown';
    dropdown.className = 'absolute left-0 right-0 bg-white border border-slate-200 rounded-lg shadow-lg z-[9999] max-h-60 overflow-y-auto mt-1 text-xs divide-y divide-slate-100';
    input.parentNode.appendChild(dropdown);
  }

  input.addEventListener('input', function() {
    const q = input.value.trim().toLowerCase();
    if (!q) {
      dropdown.innerHTML = '';
      return;
    }

    const matches = state.chargeMaster.items.filter(item => {
      const isEligible = item.status === 'Active' && item.packageEligible !== false;
      const matchText = (item.code + ' ' + item.name + ' ' + (item.category || '')).toLowerCase();
      return isEligible && matchText.includes(q);
    }).slice(0, 10);

    if (matches.length === 0) {
      dropdown.innerHTML = '<div class="p-3 text-slate-400 text-center bg-white">No eligible items found</div>';
      return;
    }

    dropdown.innerHTML = matches.map(item => {
      const rate = item.payerRates.Standard?.amount || 0;
      return `
        <div class="p-2.5 hover:bg-slate-50 cursor-pointer flex justify-between items-center bg-white" onclick="window.addInclusionFromCM('${item.code}')">
          <div class="text-left">
            <span class="font-bold text-slate-700 font-mono mr-1.5">${item.code}</span>
            <span class="font-semibold text-slate-800">${item.name}</span>
            <span class="ml-1 text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-bold uppercase">${item.category}</span>
          </div>
          <span class="font-bold text-emerald-600 font-mono">${formatINR(rate)}</span>
        </div>
      `;
    }).join('');
  });

  document.addEventListener('click', function(e) {
    if (e.target !== input && e.target !== dropdown && !dropdown.contains(e.target)) {
      dropdown.innerHTML = '';
    }
  });
};

window.addInclusionFromCM = function(itemCode) {
  const item = state.chargeMaster.items.find(i => i.code === itemCode);
  if (!item) return;

  const table = document.getElementById('editor-inclusions-list');
  if (!table) return;

  const existingRow = document.getElementById(`inc-row-${itemCode}`);
  if (existingRow) {
    alert("This item is already added to inclusions.");
    return;
  }

  const tr = document.createElement('tr');
  tr.id = `inc-row-${itemCode}`;
  tr.setAttribute('data-code', item.code);
  tr.setAttribute('data-name', item.name);
  tr.setAttribute('data-category', item.category || 'Procedures');
  tr.setAttribute('data-uom', item.uom || 'Per Visit');
  tr.setAttribute('data-rate', item.payerRates.Standard?.amount || 0);

  const rate = item.payerRates.Standard?.amount || 0;
  
  tr.innerHTML = `
    <td class="px-4 py-2.5 font-mono font-bold text-indigo-600">${item.code}</td>
    <td class="px-4 py-2.5 font-semibold text-slate-800">${item.name}</td>
    <td class="px-4 py-2.5">
      <input type="number" class="w-16 border rounded px-1.5 py-0.5 text-center font-bold inc-qty-input" value="1" min="1" oninput="window.updateInclusionRowTotal('${itemCode}', ${rate}, this.value)">
    </td>
    <td class="px-4 py-2.5 font-mono">${formatINR(rate)}</td>
    <td id="inc-total-${itemCode}" class="px-4 py-2.5 text-right font-bold font-mono inc-line-cost" data-val="${rate}">${formatINR(rate)}</td>
    <td class="px-4 py-2.5 text-center">
      <button type="button" class="text-red-500 hover:text-red-700 text-xs" onclick="document.getElementById('inc-row-${itemCode}').remove(); window.recalcInclusionsTotals();">✕ Remove</button>
    </td>
  `;
  table.appendChild(tr);

  const searchInput = document.getElementById('inc-search-charge');
  if (searchInput) searchInput.value = '';
  const dropdown = document.getElementById('inc-search-dropdown');
  if (dropdown) dropdown.innerHTML = '';

  window.recalcInclusionsTotals();
};

window.updateInclusionRowTotal = function(itemCode, rate, qty) {
  const lineVal = (parseFloat(qty) || 0) * parseFloat(rate);
  const cell = document.getElementById(`inc-total-${itemCode}`);
  if (cell) {
    cell.setAttribute('data-val', lineVal);
    cell.textContent = formatINR(lineVal);
  }
  window.recalcInclusionsTotals();
};

window.recalcInclusionsTotals = function() {
  const rows = document.querySelectorAll('#editor-inclusions-list tr');
  let count = rows.length;
  let totalCost = 0;

  rows.forEach(row => {
    const qtyInput = row.querySelector('.inc-qty-input');
    const qty = qtyInput ? parseFloat(qtyInput.value) || 0 : 0;
    const rate = parseFloat(row.getAttribute('data-rate')) || 0;
    totalCost += qty * rate;
  });

  const countEl = document.getElementById('run-tot-count');
  const costEl = document.getElementById('run-tot-cost');
  const marginEl = document.getElementById('run-tot-margin');

  if (countEl) countEl.textContent = `${count} item${count !== 1 ? 's' : ''}`;
  if (costEl) costEl.textContent = formatINR(totalCost);

  // Read current standard self pay price if on screen
  const stdPriceInput = document.getElementById('pr-standard');
  const stdPrice = stdPriceInput ? parseFloat(stdPriceInput.value) || 0 : 0;

  if (marginEl && stdPrice > 0) {
    const marginAmt = stdPrice - totalCost;
    const marginPct = ((marginAmt / stdPrice) * 100).toFixed(1);
    if (marginAmt < 0) {
      marginEl.className = 'font-bold text-red-600 ml-1';
      marginEl.innerHTML = `⚠️ -${formatINR(Math.abs(marginAmt))} (${marginPct}%) <span class="text-[10px] uppercase font-bold block md:inline mt-1 md:mt-0 ml-1 bg-red-100 px-1 py-0.5 rounded text-red-800">Negative Margin Warning</span>`;
    } else {
      marginEl.className = 'font-bold text-emerald-600 ml-1';
      marginEl.textContent = `${formatINR(marginAmt)} (${marginPct}%)`;
    }
  } else if (marginEl) {
    marginEl.textContent = '₹0.00 (0%)';
  }
};

window.addMockExclusionLine = function() {
  const typeEl = document.getElementById('exc-new-type');
  const detailsEl = document.getElementById('exc-new-details');
  const billtoEl = document.getElementById('exc-new-billto');
  
  if (!detailsEl || !detailsEl.value.trim()) {
    alert("Please enter exclusion details.");
    return;
  }
  
  const type = typeEl ? typeEl.value : "Category";
  const details = detailsEl.value.trim();
  const billedTo = billtoEl ? billtoEl.value : "Patient";
  const consentNeeded = true;
  const estAmount = 0;
  const reason = "Billed separately at actuals";

  const table = document.getElementById('editor-exclusions-list');
  if (!table) return;

  const tr = document.createElement('tr');
  const index = table.children.length;
  tr.id = `exc-row-${index}`;
  tr.setAttribute('data-type', type);
  tr.setAttribute('data-details', details);
  tr.setAttribute('data-billedto', billedTo);
  tr.setAttribute('data-consent', consentNeeded);
  tr.setAttribute('data-estamount', estAmount);
  tr.setAttribute('data-reason', reason);

  tr.innerHTML = `
    <td class="px-4 py-2.5 font-bold">${type}</td>
    <td class="px-4 py-2.5 text-slate-800 font-semibold">${details}</td>
    <td class="px-4 py-2.5 text-slate-500">${reason}</td>
    <td class="px-4 py-2.5">${billedTo}</td>
    <td class="px-4 py-2.5 text-center font-bold text-amber-600">YES</td>
    <td class="px-4 py-2.5 text-center">
      <button type="button" class="text-red-500 hover:text-red-700 text-xs" onclick="document.getElementById('exc-row-${index}').remove()">✕ Remove</button>
    </td>
  `;
  table.appendChild(tr);
  detailsEl.value = '';
};

window.addExclusionGroup = function(groupType) {
  const table = document.getElementById('editor-exclusions-list');
  if (!table) return;

  let exclusions = [];
  if (groupType === 'blood') {
    exclusions = [
      { type: "Category", details: "Whole Blood", reason: "Blood billed at actuals", billedTo: "Patient", consentNeeded: true, estAmount: 2000 },
      { type: "Category", details: "PRBC", reason: "Blood billed at actuals", billedTo: "Patient", consentNeeded: true, estAmount: 2500 },
      { type: "Category", details: "FFP", reason: "Blood billed at actuals", billedTo: "Patient", consentNeeded: true, estAmount: 1500 },
      { type: "Category", details: "Platelets", reason: "Blood billed at actuals", billedTo: "Patient", consentNeeded: true, estAmount: 2000 },
      { type: "Category", details: "Cryoprecipitate", reason: "Blood billed at actuals", billedTo: "Patient", consentNeeded: true, estAmount: 3000 }
    ];
  } else if (groupType === 'complication') {
    exclusions = [
      { type: "Condition", details: "ICU/HDU Stay", reason: "Complication - not in package scope", billedTo: "Patient", consentNeeded: true, estAmount: 8000 },
      { type: "Condition", details: "Additional Surgery", reason: "Complication - not in package scope", billedTo: "Patient", consentNeeded: true, estAmount: 15000 },
      { type: "Condition", details: "Extended LOS beyond expected", reason: "Room charge billed per additional day", billedTo: "Patient", consentNeeded: true, estAmount: 4000 }
    ];
  } else if (groupType === 'implant') {
    exclusions = [
      { type: "Item", details: "Premium IOL Upgrade", reason: "Implant Upgrade", billedTo: "Patient", consentNeeded: true, estAmount: 25000 },
      { type: "Item", details: "Premium Stent Upgrade", reason: "Implant Upgrade", billedTo: "Patient", consentNeeded: true, estAmount: 45000 },
      { type: "Item", details: "Premium Prosthesis Upgrade", reason: "Implant Upgrade", billedTo: "Patient", consentNeeded: true, estAmount: 60000 }
    ];
  }

  exclusions.forEach(exc => {
    const index = table.children.length;
    const tr = document.createElement('tr');
    tr.id = `exc-row-${index}`;
    tr.setAttribute('data-type', exc.type);
    tr.setAttribute('data-details', exc.details);
    tr.setAttribute('data-billedto', exc.billedTo);
    tr.setAttribute('data-consent', exc.consentNeeded);
    tr.setAttribute('data-estamount', exc.estAmount);
    tr.setAttribute('data-reason', exc.reason);

    tr.innerHTML = `
      <td class="px-4 py-2.5 font-bold">${exc.type}</td>
      <td class="px-4 py-2.5 text-slate-800 font-semibold">${exc.details}</td>
      <td class="px-4 py-2.5 text-slate-500">${exc.reason}</td>
      <td class="px-4 py-2.5">${exc.billedTo}</td>
      <td class="px-4 py-2.5 text-center font-bold text-amber-600">${exc.consentNeeded ? 'YES' : 'NO'}</td>
      <td class="px-4 py-2.5 text-center">
        <button type="button" class="text-red-500 hover:text-red-700 text-xs" onclick="document.getElementById('exc-row-${index}').remove()">✕ Remove</button>
      </td>
    `;
    table.appendChild(tr);
  });
};

window.savePackageTemplate = function() {
  if (currentPackageRole !== "CHARGE_MASTER_ADMIN") {
    alert("❌ Access Denied: Only Charge Master Admin can create/modify package templates.");
    return;
  }

  const code = document.getElementById('ed-code')?.value;
  const name = document.getElementById('ed-name')?.value;
  if (!code || !name) {
    alert("Please fill section 1 (Identity Config) before saving.");
    return;
  }

  // Scrape inclusions
  const inclusions = [];
  const inclusionRows = document.querySelectorAll('#editor-inclusions-list tr');
  inclusionRows.forEach(row => {
    const code = row.getAttribute('data-code') || row.querySelector('td:nth-child(1)')?.textContent?.trim();
    const name = row.getAttribute('data-name') || row.querySelector('td:nth-child(2)')?.textContent?.trim();
    const category = row.getAttribute('data-category') || "Procedures";
    const uom = row.getAttribute('data-uom') || "Per Visit";
    const costingRate = parseFloat(row.getAttribute('data-rate') || "0");
    const qtyInput = row.querySelector('.inc-qty-input');
    const qty = qtyInput ? parseFloat(qtyInput.value) || 0 : 1;
    const lineCost = qty * costingRate;
    
    if (code && name) {
      inclusions.push({
        code, name, category, uom, qty, costingRate, lineCost, capQty: qty, overCapRule: "Billed at Standard Rate"
      });
    }
  });

  // Validation: Minimum items required is 3
  if (inclusions.length < 3) {
    alert("❌ Validation Error: Minimum 3 inclusions are required before the form can be submitted for review.");
    return;
  }

  // Scrape exclusions
  const exclusions = [];
  const exclusionRows = document.querySelectorAll('#editor-exclusions-list tr');
  exclusionRows.forEach(row => {
    const type = row.getAttribute('data-type') || row.querySelector('td:nth-child(1)')?.textContent?.trim();
    const details = row.getAttribute('data-details') || row.querySelector('td:nth-child(2)')?.textContent?.trim();
    const reason = row.getAttribute('data-reason') || row.querySelector('td:nth-child(3)')?.textContent?.trim();
    const billedTo = row.getAttribute('data-billedto') || row.querySelector('td:nth-child(4)')?.textContent?.trim();
    const consentNeeded = row.getAttribute('data-consent') === 'true' || row.querySelector('td:nth-child(5)')?.textContent?.trim() === 'YES';
    const estAmount = parseFloat(row.getAttribute('data-estamount') || "0");
    
    if (type && details) {
      exclusions.push({
        type, details, reason, billedTo, consentNeeded, estAmount
      });
    }
  });

  // Validation: At least 1 exclusion or confirmation
  if (exclusions.length === 0) {
    const confirmNoEx = confirm("You have configured 0 exclusions. Are you sure this package has no exclusions?");
    if (!confirmNoEx) return;
  }

  const existingIdx = state.packages.findIndex(p => p.code === code);
  const payload = {
    code: code,
    name: name,
    alias: document.getElementById('ed-alias')?.value || name,
    type: document.getElementById('ed-type')?.value || "Surgical Package",
    department: document.getElementById('ed-department')?.value || "General Surgery",
    icd10: document.getElementById('ed-icd10')?.value || "N/A",
    procedureCode: "",
    pmjayCode: document.getElementById('ed-pmjay-code')?.value || "",
    cghsCode: document.getElementById('ed-cghs-code')?.value || "",
    los: parseInt(document.getElementById('ed-los')?.value || "2"),
    visitTypes: ["IPD"],
    status: "Active",
    effectiveFrom: new Date().toISOString().split('T')[0],
    effectiveTo: "",
    createdBy: "Dr. Amit Verma",
    version: existingIdx >= 0 ? state.packages[existingIdx].version + 1 : 1,
    inclusions: inclusions,
    exclusions: exclusions,
    payerRates: {
      Standard: parseFloat(document.getElementById('pr-standard')?.value || "0"),
      CGHS: parseFloat(document.getElementById('pr-cghs')?.value || "0"),
      ECHS: parseFloat(document.getElementById('pr-echs')?.value || "0"),
      ESI: 0,
      PMJAY: parseFloat(document.getElementById('pr-pmjay')?.value || "0"),
      TPA: parseFloat(document.getElementById('pr-tpa')?.value || "0"),
      Corporate: parseFloat(document.getElementById('pr-corporate')?.value || "0")
    },
    rules: {
      discountAllowed: document.getElementById('rl-discount')?.checked || false,
      maxDiscount: parseFloat(document.getElementById('rl-discount-max')?.value || "0"),
      advanceRequired: document.getElementById('rl-advance')?.checked || false,
      advancePercent: parseFloat(document.getElementById('rl-advance-pct')?.value || "0"),
      insurancePreauth: true,
      partialRule: document.getElementById('rl-partial')?.value || "Lower of Actuals vs Package",
      roomUpgrade: document.getElementById('rl-upgrade')?.checked || false,
      roomUpgradeDiff: parseFloat(document.getElementById('rl-upgrade-diff')?.value || "0")
    },
    auditHistory: []
  };

  if (existingIdx >= 0) {
    state.packages[existingIdx] = payload;
    alert(`Package ${code} updated successfully.`);
  } else {
    state.packages.push(payload);
    alert(`New Package ${code} created successfully.`);
  }

  window.switchPkgTab('registry');
};

// ----------------------------------------------------
// TAB 4: ADMISSION DESK (ASSIGNMENT)
// ----------------------------------------------------
let selectAssignPatientUhid = "MRC-240001";

function renderPkgAssignment(space) {
  const activePatients = state.patients || [];
  const selectedPatient = activePatients.find(p => p.uhid === selectAssignPatientUhid) || { name: "Sample Patient", uhid: "MRC-240001" };
  const avPackages = state.packages.filter(p => p.status === "Active");

  space.innerHTML = `
    <div class="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-6">
      <div>
        <h3 class="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">📦 ADMISSION PACKAGE DESK</h3>
        <p class="text-xs text-slate-500 mt-1">Assign flat-rate surgical/procedure package codes to patient records at admission.</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <!-- Patient Search -->
        <div class="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
          <h4 class="text-xs font-bold text-slate-700">1. Select Patient</h4>
          <div>
            <label class="block text-[10px] text-slate-500 uppercase font-semibold mb-1">Search Admitted Patient</label>
            <select class="block w-full rounded border border-slate-350 p-2 text-xs font-medium" onchange="window.changeAssignPatient(this.value)">
              ${(state.patients || []).map(p => `
                <option value="${p.uhid}" ${p.uhid === selectAssignPatientUhid ? 'selected' : ''}>${p.name} (${p.uhid})</option>
              `).join('')}
            </select>
          </div>
          <div class="text-xs space-y-1.5 p-3 bg-white rounded border border-slate-200">
            <div><strong>Name:</strong> ${selectedPatient.name}</div>
            <div><strong>UHID:</strong> ${selectedPatient.uhid}</div>
            <div><strong>Billing Category:</strong> Self Pay (Standard)</div>
          </div>
        </div>

        <!-- Package List Selection -->
        <div class="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3 md:col-span-2">
          <h4 class="text-xs font-bold text-slate-700">2. Select Package Template</h4>
          <div class="grid grid-cols-1 gap-2.5">
            ${avPackages.map(pkg => `
              <div class="bg-white border border-slate-200 p-4 rounded-lg flex justify-between items-center hover:border-slate-400 transition cursor-pointer" onclick="window.confirmAssignmentAction('${pkg.code}')">
                <div>
                  <div class="font-bold text-slate-800 text-xs">${pkg.name}</div>
                  <div class="text-[10px] font-mono text-slate-450 font-bold">${pkg.code} | Max Days: ${pkg.los}</div>
                </div>
                <div class="text-right">
                  <div class="font-bold text-slate-900 text-xs">${formatINR(pkg.payerRates.Standard)}</div>
                  <span class="text-[9px] bg-slate-100 text-slate-655 px-2 py-0.5 rounded font-bold">Assign</span>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    </div>
  `;
}

window.changeAssignPatient = function(val) {
  selectAssignPatientUhid = val;
  renderPkgTabContent();
};

window.confirmAssignmentAction = function(pkgCode) {
  const pkg = state.packages.find(p => p.code === pkgCode);
  const patient = state.patients.find(p => p.uhid === selectAssignPatientUhid) || { name: "Sample Patient", uhid: selectAssignPatientUhid };
  
  if (currentPackageRole === "READ_ONLY") {
    alert("❌ Access Denied: Only Billing and Admin personnel can assign package models.");
    return;
  }

  const confirmAssign = confirm(`Assign ${pkg.name} to patient ${patient.name} at flat price of ${formatINR(pkg.payerRates.Standard)}?`);
  if (confirmAssign) {
    const asgId = "ASG-2026-" + Math.floor(100 + Math.random() * 900);
    state.packageAssignments.push({
      id: asgId,
      patientUhid: patient.uhid,
      patientName: patient.name,
      packageCode: pkg.code,
      packageName: pkg.name,
      admissionNo: "ADM00" + Math.floor(100 + Math.random() * 900),
      dateAssigned: new Date().toLocaleString(),
      assignedBy: "Meena Staff",
      status: "Active",
      payer: "Standard",
      lockedPrice: pkg.payerRates.Standard,
      consentStatus: "Signed",
      consentWitness: "Meena Patel (Staff)",
      consentFile: "consent_signed.pdf",
      actualDays: 1,
      postedCharges: [
        { code: "ROM001", name: "General Ward Bed", qty: 1, cost: 1500, flag: "Inclusion-Absorbed" }
      ],
      manualExclusions: []
    });

    alert(`Package assigned successfully. Consent form linked.`);
    selectedAssignmentId = asgId;
    window.switchPkgTab('tracking');
  }
};

// ----------------------------------------------------
// TAB 5: LIVE CONSUMPTION TRACKER PANEL
// ----------------------------------------------------
function renderPkgTracking(space) {
  const asg = state.packageAssignments.find(a => a.id === selectedAssignmentId) || state.packageAssignments[0];
  if (!asg) {
    space.innerHTML = `<div class="p-6 text-center text-slate-550 font-semibold">No active package assignments currently found. Please assign one from the Desk.</div>`;
    return;
  }

  const pkgDef = state.packages.find(p => p.code === asg.packageCode);
  const totalInclusionsCost = pkgDef.inclusions.reduce((sum, item) => sum + item.lineCost, 0);

  space.innerHTML = `
    <!-- Top tracking summary panel -->
    <div class="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center border-b pb-4">
        <div>
          <span class="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded font-bold font-mono">ASSIGNMENT ID: ${asg.id}</span>
          <h3 class="text-base font-bold text-slate-900 mt-1">
            📦 Package Stay: ${asg.packageName} (${asg.packageCode})
          </h3>
          <div class="text-xs text-slate-550 mt-1">
            Assigned: <strong>${asg.dateAssigned}</strong> | Payer: <strong>${asg.payer}</strong> | Locked Rate: <strong class="text-slate-900 font-mono">${formatINR(asg.lockedPrice)}</strong>
          </div>
        </div>
        <div class="mt-4 md:mt-0 flex gap-2">
          <button class="bg-[#1B3A5C] text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold hover:bg-slate-850" onclick="window.postAddictionExclusionCharge('${asg.id}')">
            + Add Exclusion Charge
          </button>
          <button class="border border-red-200 hover:bg-red-50 text-red-600 px-3.5 py-1.5 rounded-lg text-xs font-semibold" onclick="window.initiatePartialPackage('${asg.id}')">
            ✂️ Pro-rate Stay
          </button>
        </div>
      </div>

      <!-- Live Columns -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        <!-- INCLUSIONS -->
        <div class="bg-emerald-50 bg-opacity-30 border border-emerald-100 rounded-xl p-5 space-y-3">
          <div class="flex justify-between items-center border-b border-emerald-100 pb-2">
            <h4 class="text-xs font-bold text-emerald-800">✓ Inclusions (Absorbed Flat Price)</h4>
            <span class="text-xs font-bold text-emerald-700">Cost Value: ${formatINR(totalInclusionsCost)}</span>
          </div>
          <div class="space-y-2">
            ${pkgDef.inclusions.map(inc => `
              <div class="flex justify-between items-center text-xs p-2.5 bg-white border border-emerald-100 rounded">
                <div>
                  <span class="font-bold text-[10px] font-mono text-indigo-600">${inc.code}</span>
                  <div class="font-semibold text-slate-850">${inc.name}</div>
                </div>
                <div class="text-right">
                  <div class="font-bold">Cap Qty: ${inc.capQty}</div>
                  <div class="text-[10px] text-slate-500 font-mono">Used: 1</div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- EXCLUSIONS -->
        <div class="bg-amber-50 bg-opacity-30 border border-amber-100 rounded-xl p-5 space-y-3">
          <div class="flex justify-between items-center border-b border-amber-100 pb-2">
            <h4 class="text-xs font-bold text-amber-800">🚫 Excluded Charges (Billed Separately)</h4>
            <span class="text-xs font-bold text-amber-700">Total Billed: ${formatINR(asg.postedCharges.filter(c => c.flag === 'Exclusion-Billed').reduce((sum, item) => sum + item.cost, 0))}</span>
          </div>
          <div class="space-y-2">
            ${asg.postedCharges.filter(c => c.flag === 'Exclusion-Billed').map(exc => `
              <div class="flex justify-between items-center text-xs p-2.5 bg-white border border-amber-100 rounded">
                <div>
                  <span class="font-bold text-[10px] font-mono text-amber-600">${exc.code}</span>
                  <div class="font-semibold text-slate-850">${exc.name}</div>
                  <div class="text-[9px] text-slate-400 mt-0.5">${exc.reason || 'Billed at actuals'}</div>
                </div>
                <div class="text-right">
                  <div class="font-bold font-mono">${formatINR(exc.cost)}</div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

      </div>
    </div>
  `;
}

window.postAddictionExclusionCharge = function(asgId) {
  const asg = state.packageAssignments.find(a => a.id === asgId);
  const code = prompt("Enter Charge Master service code to post as exclusion (e.g. LAB002):", "LAB002");
  if (!code) return;
  const cost = parseFloat(prompt("Enter amount to charge (₹):", "750"));
  if (isNaN(cost)) return;

  asg.postedCharges.push({
    code: code,
    name: "Custom Lab Test - Mapped",
    qty: 1,
    cost: cost,
    flag: "Exclusion-Billed",
    reason: "Documented Specialist request"
  });

  alert("Exclusion charge posted successfully.");
  renderPkgTabContent();
};

window.initiatePartialPackage = function(asgId) {
  if (!["BILLING_MANAGER", "BILLING_SUPERVISOR", "CHARGE_MASTER_ADMIN"].includes(currentPackageRole)) {
    alert("❌ Access Denied: Requires Supervisor or Manager desk override.");
    return;
  }

  const reason = prompt("Enter cancellation/early pro-rating reason (e.g. Procedure Cancelled):");
  if (!reason) return;

  const asg = state.packageAssignments.find(a => a.id === asgId);
  if (asg) {
    asg.status = "Partially Billed";
    asg.lockedPrice = asg.lockedPrice * 0.5; // Simulate pro-rating to 50%
    alert("Package has been pro-rated to 50% of the flat price.");
    renderPkgTabContent();
  }
};

// ----------------------------------------------------
// TAB 6: DISCHARGE CLOSURE CHECKLIST
// ----------------------------------------------------
function renderPkgClosure(space) {
  const asg = state.packageAssignments.find(a => a.status === "Active") || state.packageAssignments[0];
  if (!asg) {
    space.innerHTML = `<div class="p-6 text-center text-slate-550 font-semibold">No active package stays awaiting discharge closure.</div>`;
    return;
  }

  const excTotal = asg.postedCharges.filter(c => c.flag === 'Exclusion-Billed').reduce((sum, item) => sum + item.cost, 0);

  space.innerHTML = `
    <div class="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-6">
      <div>
        <h3 class="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">📋 DISCHARGE RECONCILIATION CHECKLIST</h3>
        <p class="text-xs text-slate-500 mt-1">Verify consent documents, implants, and billable exclusions prior to final invoice print.</p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        <!-- Checklist Form -->
        <div class="space-y-4">
          <h4 class="text-xs font-bold text-slate-700 uppercase">1. Verification Checklist</h4>
          <div class="space-y-2.5">
            <label class="flex items-start gap-3 p-3 rounded-lg border bg-slate-50 hover:bg-slate-100 cursor-pointer">
              <input type="checkbox" class="h-4 w-4 mt-0.5" id="chk-proc" checked>
              <div>
                <span class="font-bold text-slate-800 text-xs">Clinical Procedure Confirmed</span>
                <p class="text-[10px] text-slate-400">Verify surgical notes or OT records match assigned package template.</p>
              </div>
            </label>

            <label class="flex items-start gap-3 p-3 rounded-lg border bg-slate-50 hover:bg-slate-100 cursor-pointer">
              <input type="checkbox" class="h-4 w-4 mt-0.5" id="chk-consent" checked>
              <div>
                <span class="font-bold text-slate-800 text-xs">Patient Written Consent Obtained</span>
                <p class="text-[10px] text-slate-400">Confirm physical signed consent for package scope is scanned and archived.</p>
              </div>
            </label>

            <label class="flex items-start gap-3 p-3 rounded-lg border bg-slate-50 hover:bg-slate-100 cursor-pointer">
              <input type="checkbox" class="h-4 w-4 mt-0.5" id="chk-implant">
              <div>
                <span class="font-bold text-slate-800 text-xs">Implant Sticker / Invoices Uploaded</span>
                <p class="text-[10px] text-slate-400">Required if package contains orthopedic or ophthalmic implants.</p>
              </div>
            </label>

            <label class="flex items-start gap-3 p-3 rounded-lg border bg-slate-50 hover:bg-slate-100 cursor-pointer">
              <input type="checkbox" class="h-4 w-4 mt-0.5" id="chk-exclusion" checked>
              <div>
                <span class="font-bold text-slate-800 text-xs">Exclusions Authorized</span>
                <p class="text-[10px] text-slate-400">Confirm all billed exclusions are documented and approved by supervisor.</p>
              </div>
            </label>
          </div>

          <button class="w-full bg-emerald-600 text-white py-2 rounded-lg text-xs font-bold shadow-sm" onclick="window.finalizePackageBill('${asg.id}')">
            Approve & Finalise Discharge Bill
          </button>
        </div>

        <!-- Sample Invoice Preview -->
        <div class="bg-slate-50 border rounded-xl p-5 space-y-4">
          <h4 class="text-xs font-bold text-slate-700 uppercase">2. Patient Invoice Preview</h4>
          <div class="bg-white border p-4 rounded-lg text-xs space-y-3 font-mono">
            <div class="text-center font-bold pb-2 border-b">SARONIL HEALTH INVOICE</div>
            <div><strong>Patient:</strong> ${asg.patientName}</div>
            <div><strong>Admission:</strong> ${asg.admissionNo}</div>
            
            <div class="border-t border-b py-2 space-y-1">
              <div class="flex justify-between font-bold">
                <span>${asg.packageName}</span>
                <span>${formatINR(asg.lockedPrice)}</span>
              </div>
              <div class="text-[10px] text-slate-400 pl-2">Includes: Wards, Consultations, Nursing, Lab.</div>
            </div>

            <div class="space-y-1 text-[10px] text-slate-600">
              <div class="font-bold text-slate-700 uppercase">Billed Exclusions:</div>
              ${asg.postedCharges.filter(c => c.flag === 'Exclusion-Billed').map(c => `
                <div class="flex justify-between">
                  <span>- ${c.name}</span>
                  <span>${formatINR(c.cost)}</span>
                </div>
              `).join('')}
            </div>

            <div class="border-t pt-2 flex justify-between font-bold text-slate-900">
              <span>Gross Bill Total:</span>
              <span>${formatINR(asg.lockedPrice + excTotal)}</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  `;
}

window.finalizePackageBill = function(asgId) {
  if (currentPackageRole === "READ_ONLY") {
    alert("❌ Access Denied: Only Billing Supervisors or Admins can finalize billing files.");
    return;
  }

  const chkImplant = document.getElementById('chk-implant')?.checked;
  if (!chkImplant) {
    const override = confirm("⚠️ Warning: Implant verification checkbox is unchecked. Would you like to request supervisor override to continue?");
    if (!override) return;
  }

  const asg = state.packageAssignments.find(a => a.id === asgId);
  if (asg) {
    asg.status = "Closed";
    alert(`Discharge file finalized. Bill is ready for settlement and clearance.`);
    window.switchPkgTab('dashboard');
  }
};

// ----------------------------------------------------
// TAB 7: REPORTS (RECONCILIATION & VARIANCE)
// ----------------------------------------------------
function renderPkgReports(space) {
  space.innerHTML = `
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      <!-- Variance analysis -->
      <div class="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
        <h3 class="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">📦 Package vs Actuals Financial Variance Report</h3>
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-slate-200 text-xs text-left">
            <thead>
              <tr class="text-slate-500 font-semibold uppercase">
                <th class="py-2">Package Name</th>
                <th class="py-2 text-right">Fixed Price</th>
                <th class="py-2 text-right">Actual Cost</th>
                <th class="py-2 text-right">Financial Variance</th>
                <th class="py-2 text-center">Margin Status</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-200 text-slate-700">
              <tr>
                <td class="py-3 font-semibold">Laparoscopic Cholecystectomy Package</td>
                <td class="py-3 text-right font-mono">₹50,000.00</td>
                <td class="py-3 text-right font-mono text-emerald-600">₹42,500.00</td>
                <td class="py-3 text-right font-mono text-emerald-700">+₹7,500.00</td>
                <td class="py-3 text-center"><span class="bg-emerald-50 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded">High Margin</span></td>
              </tr>
              <tr>
                <td class="py-3 font-semibold">Normal Delivery Package</td>
                <td class="py-3 text-right font-mono">₹25,000.00</td>
                <td class="py-3 text-right font-mono text-red-600">₹27,800.00</td>
                <td class="py-3 text-right font-mono text-red-700">-₹2,800.00</td>
                <td class="py-3 text-center"><span class="bg-red-50 text-red-800 text-[10px] font-bold px-2 py-0.5 rounded">Negative Margin</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Quick stats -->
      <div class="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
        <h3 class="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">⚙️ Cost Optimization Rules</h3>
        <p class="text-xs text-slate-500">
          The revenue cycle engine flags any packages exceeding standard cost limits or returning negative margin for consecutive billing cycles.
        </p>
        <div class="space-y-2 text-xs">
          <div class="p-3 bg-slate-50 rounded border border-slate-200 font-semibold text-slate-600 flex justify-between">
            <span>Average Package Margin:</span>
            <span class="text-[#1B3A5C] font-bold">14.6%</span>
          </div>
          <button class="w-full border border-slate-200 hover:bg-slate-50 py-2 rounded text-xs font-semibold" onclick="alert('Exporting PDF audit log...')">
            📥 Export Reconciliation Summary (PDF)
          </button>
        </div>
      </div>

    </div>
  `;
}

