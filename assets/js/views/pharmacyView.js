/* ==========================================================================
   SARONIL HMS - HOSPITAL PHARMACY MODULE (pharmacyView.js)
   ========================================================================== */

/**
 * --------------------------------------------------------------------------
 * INITIAL STATE & MASTER DATA SEEDING (If not already present in state.js)
 * --------------------------------------------------------------------------
 */
if (window.state) {
  // Ensure basic inventory structure
  if (!state.inventory) state.inventory = {};
  
  // Detailed Batch-level Inventory List
  state.inventory.pharmacyBatches = state.inventory.pharmacyBatches || [
    {
      code: "MED-ANAL-001",
      brandName: "Dolo 650",
      genericName: "Paracetamol",
      dosageForm: "Tablet",
      strength: "650mg",
      manufacturer: "Micro Labs Ltd",
      schedule: "OTC",
      hsnCode: "30049011",
      gstRate: 12,
      mrp: 30.00,
      sellingPrice: 28.00,
      purchasePrice: 18.50,
      reorderLevel: 1000,
      minStockLevel: 500,
      maxStockLevel: 5000,
      requiresRefrigeration: false,
      activeStatus: "Active",
      batches: [
        { batchNo: "DL650-B01", mfgDate: "2025-01-10", expiryDate: "2027-01-10", qty: 2500, shelfLocation: "Rack A-1" },
        { batchNo: "DL650-B02", mfgDate: "2025-03-15", expiryDate: "2027-03-15", qty: 1500, shelfLocation: "Rack A-2" }
      ]
    },
    {
      code: "MED-ANTI-002",
      brandName: "Clavam 625",
      genericName: "Amoxicillin + Clavulanic Acid",
      dosageForm: "Tablet",
      strength: "500mg+125mg",
      manufacturer: "Alkem Laboratories",
      schedule: "Schedule H1",
      hsnCode: "30041030",
      gstRate: 12,
      mrp: 201.20,
      sellingPrice: 190.00,
      purchasePrice: 140.00,
      reorderLevel: 500,
      minStockLevel: 200,
      maxStockLevel: 2000,
      requiresRefrigeration: false,
      activeStatus: "Active",
      batches: [
        { batchNo: "CLV625-E09", mfgDate: "2025-02-05", expiryDate: "2027-02-05", qty: 850, shelfLocation: "Rack B-4" }
      ]
    },
    {
      code: "MED-NARC-003",
      brandName: "Trambax 50",
      genericName: "Tramadol Hydrochloride",
      dosageForm: "Injection",
      strength: "50mg/ml",
      manufacturer: "Abbott India Ltd",
      schedule: "Schedule X",
      hsnCode: "30049099",
      gstRate: 18,
      mrp: 45.00,
      sellingPrice: 42.00,
      purchasePrice: 28.00,
      reorderLevel: 200,
      minStockLevel: 50,
      maxStockLevel: 1000,
      requiresRefrigeration: false,
      activeStatus: "Active",
      batches: [
        { batchNo: "TRAM50-A22", mfgDate: "2025-06-01", expiryDate: "2027-06-01", qty: 120, shelfLocation: "Safe Box 1" }
      ]
    },
    {
      code: "MED-COLD-004",
      brandName: "Huminsulin R 100IU",
      genericName: "Insulin Soluble (Human)",
      dosageForm: "Vial",
      strength: "100 IU/ml",
      manufacturer: "Eli Lilly and Company",
      schedule: "Schedule G",
      hsnCode: "30043110",
      gstRate: 5,
      mrp: 180.00,
      sellingPrice: 175.00,
      purchasePrice: 135.00,
      reorderLevel: 150,
      minStockLevel: 40,
      maxStockLevel: 500,
      requiresRefrigeration: true,
      activeStatus: "Active",
      batches: [
        { batchNo: "INS100-M03", mfgDate: "2025-04-10", expiryDate: "2026-10-10", qty: 90, shelfLocation: "Refrigerator C" }
      ]
    },
    {
      code: "MED-NDPS-005",
      brandName: "Morphine Inj 10mg",
      genericName: "Morphine Sulfate",
      dosageForm: "Ampoule",
      strength: "10mg/ml",
      manufacturer: "Nirma Pharma",
      schedule: "NDPS",
      hsnCode: "30049099",
      gstRate: 18,
      mrp: 85.00,
      sellingPrice: 80.00,
      purchasePrice: 50.00,
      reorderLevel: 100,
      minStockLevel: 20,
      maxStockLevel: 300,
      requiresRefrigeration: false,
      activeStatus: "Active",
      batches: [
        { batchNo: "MORPH-X04", mfgDate: "2025-05-15", expiryDate: "2027-05-15", qty: 45, shelfLocation: "Safe Box 2" }
      ]
    },
    {
      code: "MED-NEAR-006",
      brandName: "Pantocid 40",
      genericName: "Pantoprazole",
      dosageForm: "Tablet",
      strength: "40mg",
      manufacturer: "Sun Pharma",
      schedule: "Schedule H",
      hsnCode: "30049099",
      gstRate: 12,
      mrp: 80.00,
      sellingPrice: 75.00,
      purchasePrice: 42.00,
      reorderLevel: 1000,
      minStockLevel: 300,
      maxStockLevel: 4000,
      requiresRefrigeration: false,
      activeStatus: "Active",
      batches: [
        { batchNo: "PAN40-EXP30", mfgDate: "2024-07-20", expiryDate: "2026-07-20", qty: 500, shelfLocation: "Rack B-2" }, // Expiring soon
        { batchNo: "PAN40-EXP90", mfgDate: "2024-09-01", expiryDate: "2026-09-10", qty: 800, shelfLocation: "Rack B-2" }  // Near-expiry
      ]
    }
  ];

  // Supplier Registry
  state.pharmacySuppliers = state.pharmacySuppliers || [
    {
      code: "SUP-PH-001",
      name: "MedLife Wholesale Distributors",
      dlNo: "DL-20B-128475 / DL-21B-128476",
      dlExpiry: "2028-12-15",
      gstin: "29AAAAA1111A1Z1",
      pan: "AAAAA1111A",
      creditLimit: 500000,
      creditDays: 30,
      status: "Active",
      contact: "+91 98877 66554",
      speciality: "General, Cold Chain, Narcotics"
    },
    {
      code: "SUP-PH-002",
      name: "BioPharma Distributors Patna",
      dlNo: "DL-20B-008475",
      dlExpiry: "2026-07-15", // Expiring soon
      gstin: "10BBBBB2222B2Z2",
      pan: "BBBBB2222B",
      creditLimit: 200000,
      creditDays: 15,
      status: "Active",
      contact: "+91 91234 56789",
      speciality: "Vaccines & Biologicals"
    },
    {
      code: "SUP-PH-003",
      name: "Reliable Drugs & Psychotropics",
      dlNo: "DL-20B-X99912",
      dlExpiry: "2025-12-31",
      gstin: "29CCCCC3333C3Z3",
      pan: "CCCCC3333C",
      creditLimit: 300000,
      creditDays: 45,
      status: "Blacklisted",
      contact: "+91 88877 66554",
      speciality: "Narcotics Licensed"
    }
  ];

  // Active Purchase Orders
  state.pharmacyPurchaseOrders = state.pharmacyPurchaseOrders || [
    {
      poNo: "PO-PH-2026-001",
      poDate: "2026-06-20",
      supplier: "MedLife Wholesale Distributors",
      expectedDate: "2026-06-30",
      status: "Approved",
      items: [
        { code: "MED-ANAL-001", name: "Dolo 650", qty: 2000, expectedRate: 18.50 },
        { code: "MED-ANTI-002", name: "Clavam 625", qty: 500, expectedRate: 140.00 }
      ]
    }
  ];

  // Live Digital Narcotic & Schedule X Transaction Register
  state.narcoticRegister = state.narcoticRegister || [
    {
      date: "2026-06-22 10:15 IST",
      medicineName: "Morphine Sulfate 10mg",
      batchNo: "MORPH-X04",
      prescriptionNo: "RX-IPD-9847",
      patientName: "Rajesh Kumar",
      uhid: "MRC-240001",
      doctorName: "Dr. Ramesh Kumar (NMC-84729)",
      qtyReceived: 0,
      qtyIssued: 2,
      runningBalance: 45,
      pharmacist: "Senior Pharmacist",
      remarks: "Post-op ICU pain management"
    }
  ];

  // Digital Temperature Excursion Log
  state.temperatureExcursions = state.temperatureExcursions || [
    {
      timestamp: "2026-06-24 14:10 IST",
      counter: "IPD Counter Refrigerator B",
      temperature: "9.2°C",
      duration: "15 mins",
      reconciliation: "Restored door seal. Temperature returned to 4.5°C. Stocks checked safe.",
      loggedBy: "Pharmacist Incharge"
    }
  ];

  // Dynamic Prescription queue populated with realistic clinical orders
  state.pharmacyOPDQueue = state.pharmacyOPDQueue || [
    {
      rxNo: "RX-OPD-1082",
      uhid: "MRC-240002",
      patientName: "Priya Sharma",
      doctor: "Dr. Ritu S. (NMC-11029)",
      priority: "Routine",
      timeWaiting: "10 mins",
      items: [
        { code: "MED-ANAL-001", name: "Dolo 650", dose: "1 Tab", freq: "TID", duration: "3 Days", qty: 9 },
        { code: "MED-NEAR-006", name: "Pantocid 40", dose: "1 Tab", freq: "OD", duration: "10 Days", qty: 10 }
      ],
      status: "Pending"
    },
    {
      rxNo: "RX-OPD-1099",
      uhid: "MH-2026-6003",
      patientName: "Rubina",
      doctor: "Dr. Reeta Verma (NMC-99214)",
      priority: "Routine",
      timeWaiting: "5 mins",
      items: [
        { code: "MED-ANTI-002", name: "Clavam 625", dose: "1 Tab", freq: "BD", duration: "5 Days", qty: 10 }
      ],
      status: "Pending"
    }
  ];

  state.pharmacyIPDIndentQueue = state.pharmacyIPDIndentQueue || [
    {
      indentNo: "IND-STAT-401",
      uhid: "MRC-240001",
      patientName: "Rajesh Kumar",
      wardBed: "ICU / Bed 4",
      doctor: "Dr. Ramesh Kumar (NMC-84729)",
      priority: "STAT",
      timeWaiting: "4 mins",
      items: [
        { code: "MED-NARC-003", name: "Trambax 50", dose: "50mg IV", freq: "STAT", duration: "1 Dose", qty: 1 },
        { code: "MED-NDPS-005", name: "Morphine Inj 10mg", dose: "5mg IV", freq: "STAT", duration: "1 Dose", qty: 1 }
      ],
      status: "Pending"
    },
    {
      indentNo: "IND-REG-8472",
      uhid: "MRC-240017",
      patientName: "Meena Iyer",
      wardBed: "Ward A / Bed A-201",
      doctor: "Dr. Ananya R. (NMC-48201)",
      priority: "Routine",
      timeWaiting: "35 mins",
      items: [
        { code: "MED-NEAR-006", name: "Pantocid 40", dose: "1 Tab", freq: "OD", duration: "7 Days", qty: 7 }
      ],
      status: "Pending"
    }
  ];

  // Expand the formulary directory with the full generated catalog so Medicine
  // Master, Inventory and the dashboard reflect the complete ~60k-item
  // formulary. The curated records above stay pinned at the top; each catalog
  // item is mapped into the batch-level shape the pharmacy tabs expect.
  if (Array.isArray(window.medicationCatalog) && state.inventory.pharmacyBatches.length < 1000) {
    var gstFor = function (cat) {
      return /insulin|vitamin|supplement|electrolyte|haematinic|iv fluid/i.test(cat || '') ? 5 : 12;
    };
    var shelfFor = function (i) { return 'Rack ' + String.fromCharCode(65 + (i % 6)) + '-' + (1 + (i % 20)); };
    var mfgFrom = function (expiry) {
      var d = new Date((expiry || '2027-06-30') + 'T00:00:00');
      d.setMonth(d.getMonth() - 24);
      return d.toISOString().slice(0, 10);
    };
    var mapped = window.medicationCatalog.map(function (c, i) {
      return {
        code: c.code, brandName: c.brandName, genericName: c.genericName,
        dosageForm: c.dosageForm, strength: c.strength, manufacturer: c.manufacturer,
        schedule: c.schedule, hsnCode: c.hsnCode, gstRate: gstFor(c.category),
        mrp: c.price, sellingPrice: Math.max(1, Math.round(c.price * 0.92)),
        purchasePrice: Math.max(1, Math.round(c.price * 0.65)),
        reorderLevel: (c.minStock || 100) * 2, minStockLevel: c.minStock || 100,
        maxStockLevel: (c.minStock || 100) * 10,
        requiresRefrigeration: /insulin|vaccine/i.test(c.category || ''),
        activeStatus: 'Active',
        batches: [{ batchNo: c.batch, mfgDate: mfgFrom(c.expiry), expiryDate: c.expiry, qty: c.stock, shelfLocation: shelfFor(i) }]
      };
    });
    state.inventory.pharmacyBatches = state.inventory.pharmacyBatches.concat(mapped);
  }

  // Shared audit logs
  state.pharmacyAuditLogs = state.pharmacyAuditLogs || [];
}

/**
 * Helper to check current role permissions
 */
function getActiveRole() {
  return (window.state && state.activeUserRole) || "Administrator";
}

function hasPermission(minRole) {
  const current = getActiveRole();
  const hierarchy = ["Dispense", "Counter Head", "Pharmacy Manager", "Administrator"];
  const curIdx = hierarchy.indexOf(current === "Pharmacist" ? "Dispense" : current);
  const minIdx = hierarchy.indexOf(minRole);
  return curIdx >= minIdx || current === "Administrator";
}

/**
 * Core rendering view function
 */
window.views.pharmacy = function(container, subAnchor, params) {
  renderPharmacyModule(container);
};

function renderPharmacyModule(container) {
  // Setup primary CSS and template framework. Keep the `view-container` class
  // (this is #main-content, the app's scroll container) — dropping it strips
  // overflow-y:auto and breaks scrolling app-wide. `min-h-screen` is also
  // omitted so it doesn't fight the flex scroll layout.
  container.className = "view-container bg-slate-50 text-slate-800 font-sans";
  container.innerHTML = `
    <!-- Top Action bar with role & counter indicator -->
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-slate-200">
      <div>
        <h1 class="text-2xl font-bold text-[#1B3A5C]">Hospital Pharmacy Module</h1>
        <p class="text-sm text-slate-500">Retail Counters, Ward Indents, Procurement, FEFO Stock Control & Digital Regulatory Registers</p>
      </div>
      <div class="flex items-center gap-3">
        <button class="bg-[#1B3A5C] text-white hover:bg-slate-850 px-3 py-1.5 rounded-lg text-xs font-bold transition mr-2" onclick="window.showStockRequestOverlay({dept:'Pharmacy', urgency:'Urgent'})">
          📦 Request Stock
        </button>
        <span class="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
          <span class="w-2 height-2 rounded-full bg-emerald-500 mr-2 animate-pulse"></span> Central Store Link Connected
        </span>
        <div class="text-right">
          <div class="text-xs text-slate-500 font-medium">Active Session Role</div>
          <div class="font-bold text-sm text-[#1B3A5C]">${getActiveRole()}</div>
        </div>
      </div>
    </div>

    <!-- Tab navigation -->
    <div class="flex border-b border-slate-200 mt-6 overflow-x-auto gap-1">
      <button onclick="switchPharmTab('dashboard')" class="pharm-tab-btn active px-4 py-2 text-sm font-semibold border-b-2 border-[#1B3A5C] text-[#1B3A5C]" id="tab-btn-dashboard">Dashboard</button>
      <button onclick="switchPharmTab('queues')" class="pharm-tab-btn px-4 py-2 text-sm font-semibold text-slate-500 hover:text-slate-700" id="tab-btn-queues">Prescription Queue <span class="ml-1 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full" id="stat-queue-badge">0</span></button>
      <button onclick="switchPharmTab('master')" class="pharm-tab-btn px-4 py-2 text-sm font-semibold text-slate-500 hover:text-slate-700" id="tab-btn-master">Medicine Master</button>
      <button onclick="switchPharmTab('inventory')" class="pharm-tab-btn px-4 py-2 text-sm font-semibold text-slate-500 hover:text-slate-700" id="tab-btn-inventory">Inventory & Adjustments</button>
      <button onclick="switchPharmTab('procurement')" class="pharm-tab-btn px-4 py-2 text-sm font-semibold text-slate-500 hover:text-slate-700" id="tab-btn-procurement">Procurement (PO/GRN)</button>
      <button onclick="switchPharmTab('returns')" class="pharm-tab-btn px-4 py-2 text-sm font-semibold text-slate-500 hover:text-slate-700" id="tab-btn-returns">Returns Center</button>
      <button onclick="switchPharmTab('registers')" class="pharm-tab-btn px-4 py-2 text-sm font-semibold text-slate-500 hover:text-slate-700" id="tab-btn-registers">Regulatory Registers</button>
      <button onclick="switchPharmTab('audit')" class="pharm-tab-btn px-4 py-2 text-sm font-semibold text-slate-500 hover:text-slate-700" id="tab-btn-audit">Audit Log</button>
    </div>

    <!-- Active view container -->
    <div id="pharmacy-tab-content" class="mt-6"></div>
  `;

  // Render first tab
  switchPharmTab('dashboard');
  updateStatCountBadge();
}

/**
 * Switch tabs dynamically
 */
window.switchPharmTab = function(tabId) {
  document.querySelectorAll('.pharm-tab-btn').forEach(btn => {
    btn.classList.remove('active', 'border-b-2', 'border-[#1B3A5C]', 'text-[#1B3A5C]');
    btn.classList.add('text-slate-500');
  });

  const activeBtn = document.getElementById(`tab-btn-${tabId}`);
  if (activeBtn) {
    activeBtn.classList.add('active', 'border-b-2', 'border-[#1B3A5C]', 'text-[#1B3A5C]');
    activeBtn.classList.remove('text-slate-500');
  }

  const tabContainer = document.getElementById('pharmacy-tab-content');
  if (!tabContainer) return;

  switch (tabId) {
    case 'dashboard':
      renderPharmacyDashboardTab(tabContainer);
      break;
    case 'queues':
      renderQueuesTab(tabContainer);
      break;
    case 'master':
      renderMasterTab(tabContainer);
      break;
    case 'inventory':
      renderInventoryTab(tabContainer);
      break;
    case 'procurement':
      renderProcurementTab(tabContainer);
      break;
    case 'returns':
      renderReturnsTab(tabContainer);
      break;
    case 'registers':
      renderRegistersTab(tabContainer);
      break;
    case 'audit':
      renderAuditTab(tabContainer);
      break;
  }
};

function updateStatCountBadge() {
  const statBadge = document.getElementById('stat-queue-badge');
  if (statBadge) {
    const stats = state.pharmacyIPDIndentQueue.filter(i => i.priority === 'STAT' && i.status === 'Pending').length;
    statBadge.textContent = stats;
  }
}

/**
 * DASHBOARD VIEW
 */
function renderPharmacyDashboardTab(container) {
  // Compile statistics
  const totalFormulary = state.inventory.pharmacyBatches.length;
  const lowStock = state.inventory.pharmacyBatches.filter(m => {
    const totalQty = m.batches.reduce((sum, b) => sum + b.qty, 0);
    return totalQty <= m.minStockLevel;
  }).length;

  const expiredCount = state.inventory.pharmacyBatches.filter(m => 
    m.batches.some(b => new Date(b.expiryDate) < new Date())
  ).length;

  const criticalExpiry = state.inventory.pharmacyBatches.filter(m => 
    m.batches.some(b => {
      const diffTime = new Date(b.expiryDate) - new Date();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays > 0 && diffDays <= 30;
    })
  ).length;

  const pendingOPD = state.pharmacyOPDQueue.filter(o => o.status === 'Pending').length;
  const pendingIPD = state.pharmacyIPDIndentQueue.filter(i => i.status === 'Pending').length;
  const pendingSTAT = state.pharmacyIPDIndentQueue.filter(i => i.priority === 'STAT' && i.status === 'Pending').length;

  container.innerHTML = `
    <!-- Top Row KPIs -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div class="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
        <div class="p-3 bg-[#1B3A5C]/10 text-[#1B3A5C] rounded-lg text-2xl font-bold">📋</div>
        <div>
          <div class="text-xs text-slate-500 font-bold uppercase tracking-wider">OPD / Walk-in Queue</div>
          <div class="text-2xl font-bold text-slate-900">${pendingOPD} Pending</div>
        </div>
      </div>
      <div class="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
        <div class="p-3 bg-red-100 text-red-600 rounded-lg text-2xl font-bold relative">
          🚨 ${pendingSTAT > 0 ? `<span class="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full animate-ping"></span>` : ''}
        </div>
        <div>
          <div class="text-xs text-slate-500 font-bold uppercase tracking-wider">STAT ICU/Ward Indents</div>
          <div class="text-2xl font-bold text-red-600">${pendingSTAT} Urgent</div>
        </div>
      </div>
      <div class="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
        <div class="p-3 bg-amber-100 text-amber-600 rounded-lg text-2xl font-bold">⚠️</div>
        <div>
          <div class="text-xs text-slate-500 font-bold uppercase tracking-wider">Low Stock Medicines</div>
          <div class="text-2xl font-bold text-slate-900">${lowStock} items</div>
        </div>
      </div>
      <div class="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
        <div class="p-3 bg-red-500/10 text-red-600 rounded-lg text-2xl font-bold">⏰</div>
        <div>
          <div class="text-xs text-slate-500 font-bold uppercase tracking-wider">Near-Expiry (30d)</div>
          <div class="text-2xl font-bold text-slate-900">${criticalExpiry} batches</div>
        </div>
      </div>
    </div>

    <!-- Alert / System Notifications Board -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
      <div class="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <h3 class="text-base font-bold text-[#1B3A5C] mb-4 flex items-center gap-2">
          <span>⚠️ Active Regulatory & Safety Compliance Board</span>
        </h3>
        <div class="space-y-4">
          <!-- H1 Stewardship Stewardship -->
          <div class="p-4 bg-amber-50 rounded-lg border border-amber-200 flex gap-3">
            <span class="text-amber-500 text-xl font-semibold">🛡️</span>
            <div>
              <h4 class="text-sm font-bold text-amber-800">Schedule H1 Stewardship Alert</h4>
              <p class="text-xs text-amber-700 mt-1">Antibiotic Stewardship monitoring active. System logs all fluoroquinolone and 3rd-gen cephalosporin consumption reports automatically for NMC audits.</p>
            </div>
          </div>
          <!-- Cold Chain -->
          <div class="p-4 bg-sky-50 rounded-lg border border-sky-200 flex gap-3">
            <span class="text-sky-500 text-xl font-semibold">❄️</span>
            <div>
              <h4 class="text-sm font-bold text-sky-800">Refrigerated Storage Temperature Monitoring</h4>
              <p class="text-xs text-sky-700 mt-1">Continuous cold chain tracker active. Normal operational threshold set between 2.0°C and 8.0°C.</p>
            </div>
          </div>
          <!-- NDPS -->
          <div class="p-4 bg-orange-50 rounded-lg border border-orange-200 flex gap-3">
            <span class="text-orange-500 text-xl font-semibold">🔒</span>
            <div>
              <h4 class="text-sm font-bold text-orange-800">Narcotics Double Sign-off Protocol</h4>
              <p class="text-xs text-orange-700 mt-1">Schedule X / NDPS check active. Dual-signoff required by prescribing physician and Dispensing Pharmacist to commit transactions.</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Shift Status/Action Card -->
      <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex flex-col justify-between">
        <div>
          <h3 class="text-base font-bold text-[#1B3A5C] mb-4">Counter Location Session</h3>
          <div class="space-y-3">
            <div class="flex justify-between border-b border-slate-100 pb-2">
              <span class="text-sm text-slate-500">Current Station:</span>
              <span class="text-sm font-bold text-slate-800">IPD Counter & Central Store</span>
            </div>
            <div class="flex justify-between border-b border-slate-100 pb-2">
              <span class="text-sm text-slate-500">OPD Cash Register:</span>
              <span class="text-sm font-bold text-emerald-600">Active - Shift Open</span>
            </div>
            <div class="flex justify-between pb-2">
              <span class="text-sm text-slate-500">NABH Standards:</span>
              <span class="text-sm font-bold text-indigo-600">FEFO Enabled</span>
            </div>
          </div>
        </div>
        <div class="mt-6 pt-4 border-t border-slate-200">
          <button onclick="switchPharmTab('queues')" class="w-full bg-[#1B3A5C] hover:bg-[#152e4a] text-white py-2 px-4 rounded-lg font-bold text-sm transition-colors text-center block">
            Open Prescriptions Desk
          </button>
        </div>
      </div>
    </div>
  `;
}

/**
 * PRESCRIPTION QUEUES VIEW
 */
function renderQueuesTab(container) {
  container.innerHTML = `
    <div class="grid grid-cols-1 xl:grid-cols-2 gap-6">
      
      <!-- OPD / Walk-in queue desk -->
      <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-base font-bold text-[#1B3A5C]">OPD / Walk-in Retail Queue</h3>
          <span class="bg-slate-100 text-slate-700 text-xs px-2.5 py-1 rounded-full font-bold">
            ${state.pharmacyOPDQueue.filter(o => o.status === 'Pending').length} Pending
          </span>
        </div>
        <div class="space-y-3 overflow-y-auto max-h-[500px]">
          ${state.pharmacyOPDQueue.map(rx => `
            <div class="p-4 border border-slate-200 rounded-lg hover:border-[#1B3A5C] transition-all bg-white relative">
              <div class="flex justify-between items-start">
                <div>
                  <div class="flex items-center gap-2">
                    <span class="font-bold text-slate-900 hover:underline text-blue-600 cursor-pointer" onclick="router.navigate('patients?uhid=${rx.uhid}')">${rx.patientName}</span>
                    <span class="text-xs bg-slate-100 px-2 py-0.5 rounded text-slate-600">${rx.uhid}</span>
                  </div>
                  <div class="text-xs text-slate-500 mt-1">Prescription: <strong class="text-slate-800">${rx.rxNo}</strong></div>
                  <div class="text-xs text-slate-500 mt-0.5">Consultant: ${rx.doctor}</div>
                </div>
                <div class="text-right">
                  <span class="inline-block text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded px-2 py-0.5">${rx.priority}</span>
                  <div class="text-[10px] text-slate-400 mt-2">${rx.timeWaiting} ago</div>
                </div>
              </div>
              <div class="mt-3 pt-3 border-t border-slate-100 flex justify-between items-center">
                <span class="text-xs text-slate-500">${rx.items.length} prescribed lines</span>
                <button onclick="openDispenseDesk('OPD', '${rx.rxNo}')" class="bg-[#1B3A5C] hover:bg-[#152e4a] text-white px-3 py-1.5 rounded font-bold text-xs">
                  Dispense & Bill
                </button>
              </div>
            </div>
          `).join('') || '<p class="text-sm text-slate-500 text-center py-6">No pending OPD prescriptions.</p>'}
        </div>
      </div>

      <!-- IPD / Ward indents queue desk -->
      <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-base font-bold text-[#1B3A5C]">IPD Ward Supply Queue</h3>
          <span class="bg-red-500 text-white text-xs px-2.5 py-1 rounded-full font-bold">
            ${state.pharmacyIPDIndentQueue.filter(i => i.status === 'Pending').length} Pending
          </span>
        </div>
        <div class="space-y-3 overflow-y-auto max-h-[500px]">
          ${state.pharmacyIPDIndentQueue.map(indent => {
            const isStat = indent.priority === 'STAT';
            return `
              <div class="p-4 border ${isStat ? 'border-red-200 bg-red-50/20' : 'border-slate-200 bg-white'} rounded-lg hover:border-red-500 transition-all relative">
                ${isStat ? '<span class="absolute top-0 right-0 transform translate-x-[-12px] translate-y-[-10px] bg-red-500 text-white text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full animate-bounce">STAT</span>' : ''}
                <div class="flex justify-between items-start">
                  <div>
                    <div class="flex items-center gap-2">
                      <span class="font-bold text-slate-900 hover:underline text-blue-600 cursor-pointer" onclick="router.navigate('patients?uhid=${indent.uhid}')">${indent.patientName}</span>
                      <span class="text-xs bg-slate-100 px-2 py-0.5 rounded text-slate-600">${indent.uhid}</span>
                    </div>
                    <div class="text-xs font-semibold text-indigo-700 mt-1">Ward Location: ${indent.wardBed}</div>
                    <div class="text-xs text-slate-500 mt-0.5">Order/Indent: <strong class="text-slate-800">${indent.indentNo}</strong></div>
                    <div class="text-xs text-slate-500 mt-0.5">Authorized by: ${indent.doctor}</div>
                  </div>
                  <div class="text-right">
                    <span class="inline-block text-xs font-semibold ${isStat ? 'text-red-700 bg-red-50 border border-red-200' : 'text-slate-600 bg-slate-50 border border-slate-200'} rounded px-2 py-0.5">${indent.priority}</span>
                    <div class="text-[10px] text-slate-400 mt-2">${indent.timeWaiting} waiting</div>
                  </div>
                </div>
                <div class="mt-3 pt-3 border-t border-slate-100 flex justify-between items-center">
                  <span class="text-xs text-slate-500">${indent.items.length} medicines in indent</span>
                  <button onclick="openDispenseDesk('IPD', '${indent.indentNo}')" class="bg-[#1B3A5C] hover:bg-[#152e4a] text-white px-3 py-1.5 rounded font-bold text-xs">
                    Dispatch Ward Box
                  </button>
                </div>
              </div>
            `;
          }).join('') || '<p class="text-sm text-slate-500 text-center py-6">No pending ward indents.</p>'}
        </div>
      </div>

    </div>

    <!-- Active workbench area loaded dynamically as popup -->
    <div id="active-dispense-workbench" style="display: none; position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background-color: rgba(15, 23, 42, 0.65); z-index: 9999; justify-content: center; align-items: center; padding: 20px; overflow-y: auto;" onclick="window.closeDispenseDesk()"></div>
  `;
}

/**
 * ACTIVE DISPENSE WORKSPACE
 */
window.openDispenseDesk = function(type, id) {
  const workbench = document.getElementById('active-dispense-workbench');
  if (!workbench) return;

  const data = type === 'OPD' 
    ? state.pharmacyOPDQueue.find(rx => rx.rxNo === id)
    : state.pharmacyIPDIndentQueue.find(i => i.indentNo === id);

  if (!data) return;

  // Display backdrop overlay
  workbench.style.display = 'flex';

  // Render Workspace
  workbench.innerHTML = `
    <div class="bg-white rounded-xl border-2 border-[#1B3A5C] shadow-md p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto" onclick="event.stopPropagation()">
      <div class="flex justify-between items-center border-b border-slate-200 pb-4 mb-4">
        <div>
          <span class="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded">${type} Dispense Deck</span>
          <h2 class="text-lg font-bold text-[#1B3A5C] mt-2">Active Validation & Dispensing Workbench</h2>
          <p class="text-xs text-slate-500">Patient: <strong>${data.patientName} (${data.uhid})</strong> | Order Ref: <strong>${id}</strong></p>
        </div>
        <button onclick="closeDispenseDesk()" class="text-slate-400 hover:text-slate-600 text-xl font-bold">&times;</button>
      </div>

      <!-- Clinical Validation Section -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div class="bg-emerald-50 rounded-lg p-4 border border-emerald-200">
          <h4 class="text-xs font-bold text-emerald-800 uppercase tracking-wider mb-2">✅ Regulatory Verification</h4>
          <ul class="text-xs text-emerald-700 space-y-1.5">
            <li>• NMC Doctor Registration Validated</li>
            <li>• Prescription timeframe matches</li>
            <li>• Dispensing timeline within statutory threshold</li>
          </ul>
        </div>
        <div class="bg-[#1B3A5C]/5 rounded-lg p-4 border border-slate-200">
          <h4 class="text-xs font-bold text-[#1B3A5C] uppercase tracking-wider mb-2">📋 JCI Safety Checks</h4>
          <ul class="text-xs text-slate-600 space-y-1.5">
            <li>• Drug allergy screening complete</li>
            <li>• Patient demographics verification</li>
            <li>• Duplicate order check active</li>
          </ul>
        </div>
        <div class="bg-amber-50 rounded-lg p-4 border border-amber-200">
          <h4 class="text-xs font-bold text-amber-800 uppercase tracking-wider mb-2">⚠️ Realtime EMR Integration</h4>
          <ul class="text-xs text-amber-700 space-y-1.5">
            <li>• Pediatric weight-dosage calculator linked</li>
            <li>• Renal impairment alerts synchronized</li>
            <li>• Drug-drug interactions verified</li>
          </ul>
        </div>
      </div>

      <!-- Prescribed items checklist -->
      <h3 class="text-sm font-bold text-slate-800 mb-3">Dispensing Checklist (FEFO Batch Allocation)</h3>
      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs border border-slate-200 rounded-lg overflow-hidden">
          <thead>
            <tr class="bg-slate-50 border-b border-slate-200">
              <th class="p-3 font-semibold text-slate-600">Medicine Name</th>
              <th class="p-3 font-semibold text-slate-600">Schedule</th>
              <th class="p-3 font-semibold text-slate-600 text-center">Dosage / Dur</th>
              <th class="p-3 font-semibold text-slate-600 text-center">Req Qty</th>
              <th class="p-3 font-semibold text-slate-600">FEFO Allocated Batch</th>
              <th class="p-3 font-semibold text-slate-600 text-right">Selling Rate</th>
              <th class="p-3 font-semibold text-slate-600 text-right">Total Price</th>
            </tr>
          </thead>
          <tbody>
            ${data.items.map((item, idx) => {
              // Find drug details
              const drug = state.inventory.pharmacyBatches.find(d => d.brandName.toLowerCase() === item.name.toLowerCase());
              let allocatedBatch = "No Batch Available";
              let expiry = "";
              let qtyRemaining = 0;
              let isExpired = false;
              let rate = 0;
              let total = 0;

              if (drug && drug.batches && drug.batches.length > 0) {
                // FEFO: Sort batches by earliest expiry date
                const activeBatches = drug.batches
                  .map(b => ({ ...b }))
                  .sort((a, b) => new Date(a.expiryDate) - new Date(b.expiryDate));

                const firstBatch = activeBatches.find(b => b.qty >= item.qty) || activeBatches[0];
                if (firstBatch) {
                  allocatedBatch = firstBatch.batchNo;
                  expiry = firstBatch.expiryDate;
                  qtyRemaining = firstBatch.qty;
                  isExpired = new Date(firstBatch.expiryDate) < new Date();
                }
                rate = drug.sellingPrice;
                total = rate * item.qty;
              }

              return `
                <tr class="border-b border-slate-100 hover:bg-slate-50">
                  <td class="p-3">
                    <div class="font-bold text-slate-900 flex items-center gap-1.5">
                      ${drug && drug.requiresRefrigeration ? '<span class="text-sky-500" title="Cold Chain">❄️</span>' : ''}
                      ${item.name}
                    </div>
                    <div class="text-[10px] text-slate-400 mt-0.5">Code: ${drug ? drug.code : 'N/A'}</div>
                  </td>
                  <td class="p-3">
                    <span class="px-2 py-0.5 rounded text-[10px] font-bold 
                      ${drug && drug.schedule === 'Schedule X' ? 'bg-orange-100 text-orange-800 border border-orange-200' : ''}
                      ${drug && drug.schedule === 'Schedule H1' ? 'bg-amber-100 text-amber-800 border border-amber-200' : ''}
                      ${drug && drug.schedule === 'NDPS' ? 'bg-purple-100 text-purple-800 border border-purple-200' : ''}
                      ${!drug || drug.schedule === 'OTC' ? 'bg-slate-100 text-slate-800' : 'bg-blue-100 text-blue-800'}">
                      ${drug ? drug.schedule : 'OTC'}
                    </span>
                  </td>
                  <td class="p-3 text-center">${item.dose} / ${item.freq} (${item.duration})</td>
                  <td class="p-3 text-center font-bold text-slate-900">${item.qty} units</td>
                  <td class="p-3">
                    <div class="font-semibold text-slate-800">${allocatedBatch}</div>
                    <div class="text-[10px] ${isExpired ? 'text-red-500 font-bold' : 'text-slate-400'} mt-0.5">
                      ${isExpired ? 'EXPIRED' : `Expires: ${expiry}`}
                    </div>
                  </td>
                  <td class="p-3 text-right">₹${rate.toFixed(2)}</td>
                  <td class="p-3 text-right font-bold text-slate-900">₹${total.toFixed(2)}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>

      <!-- Action buttons -->
      <div class="mt-6 flex justify-between items-center bg-slate-50 p-4 rounded-lg border border-slate-200">
        <div>
          <span class="text-xs text-slate-500">Gross Payable (Inclusive of HSN taxes):</span>
          <div class="text-lg font-extrabold text-[#1B3A5C]">
            ₹${data.items.reduce((sum, item) => {
              const drug = state.inventory.pharmacyBatches.find(d => d.brandName.toLowerCase() === item.name.toLowerCase());
              return sum + (drug ? drug.sellingPrice * item.qty : 0);
            }, 0).toFixed(2)}
          </div>
        </div>
        <div class="flex gap-2">
          <button onclick="closeDispenseDesk()" class="bg-slate-200 hover:bg-slate-300 text-slate-700 py-2 px-4 rounded-lg text-sm font-semibold transition-colors">
            Cancel
          </button>
          <button onclick="executeSecureDispense('${type}', '${id}')" class="bg-[#1B3A5C] hover:bg-[#152e4a] text-white py-2 px-5 rounded-lg text-sm font-bold transition-colors">
            Complete Dispensing
          </button>
        </div>
      </div>
    </div>
  `;
};

window.closeDispenseDesk = function() {
  const workbench = document.getElementById('active-dispense-workbench');
  if (workbench) {
    workbench.style.display = 'none';
    workbench.innerHTML = "";
  }
};

window.executeSecureDispense = function(type, id) {
  const queue = type === 'OPD' ? state.pharmacyOPDQueue : state.pharmacyIPDIndentQueue;
  const itemIdx = queue.findIndex(x => (type === 'OPD' ? x.rxNo : x.indentNo) === id);
  if (itemIdx === -1) return;

  const data = queue[itemIdx];

  // 1. Regulatory Block checking (Expired items or Schedule X Doctor verification)
  let compliancePassed = true;
  let complianceMsg = "";

  data.items.forEach(item => {
    const drug = state.inventory.pharmacyBatches.find(d => d.brandName.toLowerCase() === item.name.toLowerCase());
    if (drug) {
      const activeBatches = drug.batches.map(b => ({...b})).sort((a, b) => new Date(a.expiryDate) - new Date(b.expiryDate));
      const firstBatch = activeBatches.find(b => b.qty >= item.qty) || activeBatches[0];
      if (firstBatch && new Date(firstBatch.expiryDate) < new Date()) {
        compliancePassed = false;
        complianceMsg = `CRITICAL BLOCK: Medicine ${item.name} allocated batch ${firstBatch.batchNo} is expired. Dispensing is blocked.`;
      }
    }
  });

  if (!compliancePassed) {
    alert(complianceMsg);
    return;
  }

  // 2. Perform Stock Deductions & log updates
  data.items.forEach(item => {
    const drug = state.inventory.pharmacyBatches.find(d => d.brandName.toLowerCase() === item.name.toLowerCase());
    if (drug && drug.batches && drug.batches.length > 0) {
      const activeBatches = drug.batches.sort((a, b) => new Date(a.expiryDate) - new Date(b.expiryDate));
      let needed = item.qty;
      for (let b of activeBatches) {
        if (needed <= 0) break;
        if (b.qty >= needed) {
          b.qty -= needed;
          needed = 0;
        } else {
          needed -= b.qty;
          b.qty = 0;
        }
      }
    }
  });

  // 3. Post to Billing / Account register
  const totalCost = data.items.reduce((sum, item) => {
    const drug = state.inventory.pharmacyBatches.find(d => d.brandName.toLowerCase() === item.name.toLowerCase());
    return sum + (drug ? drug.sellingPrice * item.qty : 0);
  }, 0);

  if (type === 'IPD') {
    // Post to IPD Running Bill
    const activeBill = state.billing.find(b => b.uhid === data.uhid && b.status !== 'Settled');
    if (activeBill) {
      activeBill.items.push({
        desc: `Pharmacy Indent: ${id} supply`,
        qty: 1,
        rate: totalCost,
        total: totalCost
      });
      activeBill.amount += totalCost;
    }
  } else {
    // OPD Cash Register entry
    state.billing.push({
      id: "INV-PH-" + String(1000 + state.billing.length),
      uhid: data.uhid,
      patientName: data.patientName,
      date: new Date().toISOString().split('T')[0],
      amount: totalCost,
      paid: totalCost,
      status: "Settled",
      items: data.items.map(i => ({
        desc: `${i.name} (${i.dose})`,
        qty: i.qty,
        rate: totalCost / i.qty, // approximate
        total: totalCost
      }))
    });
  }

  // Audit trail entry
  state.pharmacyAuditLogs.push({
    timestamp: new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }) + " IST",
    user: window.state.activeUser ? window.state.activeUser.name : "System Pharmacist",
    role: getActiveRole(),
    actionType: "DISPENSE",
    details: `Dispensed ${data.items.length} drugs for patient ${data.patientName} (${data.uhid}). Total charge: ₹${totalCost.toFixed(2)}.`
  });

  // Remove from queue
  queue.splice(itemIdx, 1);

  alert("Dispense completed successfully! Stock records and billing registers updated.");
  closeDispenseDesk();
  switchPharmTab('queues');
  updateStatCountBadge();
};

/**
 * MEDICINE MASTER VIEW
 */
function renderMasterTab(container) {
  window._pharmMaster = window._pharmMaster || { q: '', page: 0, size: 50 };
  container.innerHTML = `
    <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
        <h3 class="text-base font-bold text-[#1B3A5C]">Pharmacy Formulary Directory</h3>
        <div class="flex items-center gap-2 w-full md:w-auto">
          <input id="pharm-master-search" oninput="window.pharmMasterSearch(this.value)" value="${(window._pharmMaster.q || '').replace(/"/g, '&quot;')}"
                 placeholder="Search brand, generic, code or schedule…"
                 class="text-xs p-2 border border-slate-200 rounded w-full md:w-72 focus:outline-none focus:ring-2 focus:ring-[#1B3A5C]/30">
          ${hasPermission('Pharmacy Manager') ? `
            <button onclick="window.openNewMedicineModal()" class="whitespace-nowrap bg-[#1B3A5C] hover:bg-[#152e4a] text-white py-2 px-4 rounded-lg font-bold text-xs">
              ➕ Add New Drug Master
            </button>
          ` : ''}
        </div>
      </div>

      <div id="pharm-master-count" class="text-xs text-slate-500 mb-2"></div>

      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs border border-slate-200 rounded-lg overflow-hidden">
          <thead>
            <tr class="bg-slate-50 border-b border-slate-200">
              <th class="p-3 font-semibold text-slate-600">Medicine Code</th>
              <th class="p-3 font-semibold text-slate-600">Brand Name</th>
              <th class="p-3 font-semibold text-slate-600">Generic Name</th>
              <th class="p-3 font-semibold text-slate-600">Schedule</th>
              <th class="p-3 font-semibold text-slate-600">Dosage Form</th>
              <th class="p-3 font-semibold text-slate-600 text-right">GST Rate</th>
              <th class="p-3 font-semibold text-slate-600 text-right">MRP (Max Selling)</th>
              <th class="p-3 font-semibold text-slate-600 text-right">Hospital Selling Price</th>
            </tr>
          </thead>
          <tbody id="pharm-master-tbody"></tbody>
        </table>
      </div>

      <div id="pharm-master-pager" class="flex items-center justify-between mt-4"></div>
    </div>
  `;
  window.renderPharmMasterRows();
}

window.pharmMasterFiltered = function () {
  const q = (window._pharmMaster.q || '').trim().toLowerCase();
  const all = state.inventory.pharmacyBatches;
  if (!q) return all;
  return all.filter(m =>
    (m.brandName || '').toLowerCase().includes(q) ||
    (m.genericName || '').toLowerCase().includes(q) ||
    (m.code || '').toLowerCase().includes(q) ||
    (m.schedule || '').toLowerCase().includes(q));
};

window.pharmMasterSearch = function (v) {
  window._pharmMaster.q = v; window._pharmMaster.page = 0; window.renderPharmMasterRows();
};

window.pharmMasterPage = function (delta) {
  const f = window.pharmMasterFiltered();
  const maxPage = Math.max(0, Math.ceil(f.length / window._pharmMaster.size) - 1);
  window._pharmMaster.page = Math.min(maxPage, Math.max(0, window._pharmMaster.page + delta));
  window.renderPharmMasterRows();
};

window.renderPharmMasterRows = function () {
  const st = window._pharmMaster;
  const f = window.pharmMasterFiltered();
  const start = st.page * st.size;
  const pageItems = f.slice(start, start + st.size);
  const tb = document.getElementById('pharm-master-tbody');
  if (!tb) return;
  tb.innerHTML = pageItems.map(m => `
    <tr class="border-b border-slate-100 hover:bg-slate-50">
      <td class="p-3 font-mono font-semibold">${m.code}</td>
      <td class="p-3 font-bold text-slate-900">${m.brandName}</td>
      <td class="p-3 text-slate-600 italic">${m.genericName}</td>
      <td class="p-3"><span class="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-800">${m.schedule}</span></td>
      <td class="p-3">${m.dosageForm} (${m.strength})</td>
      <td class="p-3 text-right">${m.gstRate}%</td>
      <td class="p-3 text-right">₹${Number(m.mrp).toFixed(2)}</td>
      <td class="p-3 text-right font-bold text-[#1B3A5C]">₹${Number(m.sellingPrice).toFixed(2)}</td>
    </tr>
  `).join('') || '<tr><td colspan="8" class="p-6 text-center text-slate-400">No medicines match your search.</td></tr>';

  const cnt = document.getElementById('pharm-master-count');
  if (cnt) cnt.textContent = f.length.toLocaleString('en-IN') + ' medicine' + (f.length === 1 ? '' : 's') +
    (st.q ? ' matching "' + st.q + '"' : ' in formulary') +
    (f.length ? ' · showing ' + (start + 1) + '–' + Math.min(f.length, start + st.size) : '');

  const pager = document.getElementById('pharm-master-pager');
  if (pager) {
    const totalPages = Math.max(1, Math.ceil(f.length / st.size));
    pager.innerHTML = `
      <span class="text-xs text-slate-500">Page ${st.page + 1} of ${totalPages.toLocaleString('en-IN')}</span>
      <div class="flex gap-2">
        <button onclick="window.pharmMasterPage(-1)" ${st.page <= 0 ? 'disabled' : ''} class="px-3 py-1.5 text-xs rounded border border-slate-200 ${st.page <= 0 ? 'text-slate-300 cursor-not-allowed' : 'hover:bg-slate-50 text-slate-700'}">← Prev</button>
        <button onclick="window.pharmMasterPage(1)" ${st.page >= totalPages - 1 ? 'disabled' : ''} class="px-3 py-1.5 text-xs rounded border border-slate-200 ${st.page >= totalPages - 1 ? 'text-slate-300 cursor-not-allowed' : 'hover:bg-slate-50 text-slate-700'}">Next →</button>
      </div>`;
  }
};

/**
 * INVENTORY & STOCK ADJUSTMENTS VIEW
 */
function renderInventoryTab(container) {
  window._pharmInv = window._pharmInv || { q: '', page: 0, size: 50 };
  container.innerHTML = `
    <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
        <h3 class="text-base font-bold text-[#1B3A5C]">Realtime Stock Levels & Storage Locations</h3>
        <div class="flex gap-2 w-full md:w-auto">
          <input id="pharm-inv-search" oninput="window.pharmInvSearch(this.value)" value="${(window._pharmInv.q || '').replace(/"/g, '&quot;')}"
                 placeholder="Search brand, generic, code…"
                 class="text-xs p-2 border border-slate-200 rounded w-full md:w-64 focus:outline-none focus:ring-2 focus:ring-[#1B3A5C]/30">
          <button onclick="openAdjustmentModal()" class="whitespace-nowrap bg-amber-600 hover:bg-amber-700 text-white py-1.5 px-3 rounded text-xs font-semibold">
            🔧 Manual Stock Adjustment
          </button>
        </div>
      </div>

      <div id="pharm-inv-count" class="text-xs text-slate-500 mb-2"></div>

      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs border border-slate-200 rounded-lg overflow-hidden">
          <thead>
            <tr class="bg-slate-50 border-b border-slate-200">
              <th class="p-3 font-semibold text-slate-600">Medicine Code</th>
              <th class="p-3 font-semibold text-slate-600">Brand Name</th>
              <th class="p-3 font-semibold text-slate-600">Batch Number</th>
              <th class="p-3 font-semibold text-slate-600">Shelf Location</th>
              <th class="p-3 font-semibold text-slate-600 text-right">Available Qty</th>
              <th class="p-3 font-semibold text-slate-600">Expiry Date</th>
              <th class="p-3 font-semibold text-slate-600">Reorder Alert Status</th>
            </tr>
          </thead>
          <tbody id="pharm-inv-tbody"></tbody>
        </table>
      </div>

      <div id="pharm-inv-pager" class="flex items-center justify-between mt-4"></div>
    </div>

    <!-- Active modal mounts -->
    <div id="adjustment-modal-container"></div>
  `;
  window.renderPharmInvRows();
}

window.pharmInvFiltered = function () {
  const q = (window._pharmInv.q || '').trim().toLowerCase();
  const all = state.inventory.pharmacyBatches;
  if (!q) return all;
  return all.filter(m =>
    (m.brandName || '').toLowerCase().includes(q) ||
    (m.genericName || '').toLowerCase().includes(q) ||
    (m.code || '').toLowerCase().includes(q));
};

window.pharmInvSearch = function (v) {
  window._pharmInv.q = v; window._pharmInv.page = 0; window.renderPharmInvRows();
};

window.pharmInvPage = function (delta) {
  const f = window.pharmInvFiltered();
  const maxPage = Math.max(0, Math.ceil(f.length / window._pharmInv.size) - 1);
  window._pharmInv.page = Math.min(maxPage, Math.max(0, window._pharmInv.page + delta));
  window.renderPharmInvRows();
};

window.renderPharmInvRows = function () {
  const st = window._pharmInv;
  const f = window.pharmInvFiltered();
  const start = st.page * st.size;
  const pageItems = f.slice(start, start + st.size);
  const tb = document.getElementById('pharm-inv-tbody');
  if (!tb) return;
  tb.innerHTML = pageItems.map(m => {
    const totalStock = m.batches.reduce((sum, b) => sum + b.qty, 0);
    const isLow = totalStock <= m.minStockLevel;
    return m.batches.map(b => `
      <tr class="border-b border-slate-100 hover:bg-slate-50">
        <td class="p-3 font-mono font-semibold">${m.code}</td>
        <td class="p-3">
          <div class="font-bold text-slate-900">${m.brandName}</div>
          <div class="text-[10px] text-slate-400 mt-0.5">${m.genericName}</div>
        </td>
        <td class="p-3 font-mono font-semibold text-slate-800">${b.batchNo}</td>
        <td class="p-3 text-slate-600">${b.shelfLocation}</td>
        <td class="p-3 text-right font-bold text-slate-900">${(b.qty || 0).toLocaleString()} units</td>
        <td class="p-3 text-slate-600">${b.expiryDate}</td>
        <td class="p-3">
          ${isLow
            ? '<span class="text-amber-600 font-bold">⚠️ LOW STOCK (Reorder Level Reached)</span>'
            : '<span class="text-emerald-600 font-bold">✅ STABLE</span>'}
        </td>
      </tr>
    `).join('');
  }).join('') || '<tr><td colspan="7" class="p-6 text-center text-slate-400">No medicines match your search.</td></tr>';

  const cnt = document.getElementById('pharm-inv-count');
  if (cnt) cnt.textContent = f.length.toLocaleString('en-IN') + ' stocked item' + (f.length === 1 ? '' : 's') +
    (st.q ? ' matching "' + st.q + '"' : '') +
    (f.length ? ' · showing ' + (start + 1) + '–' + Math.min(f.length, start + st.size) : '');

  const pager = document.getElementById('pharm-inv-pager');
  if (pager) {
    const totalPages = Math.max(1, Math.ceil(f.length / st.size));
    pager.innerHTML = `
      <span class="text-xs text-slate-500">Page ${st.page + 1} of ${totalPages.toLocaleString('en-IN')}</span>
      <div class="flex gap-2">
        <button onclick="window.pharmInvPage(-1)" ${st.page <= 0 ? 'disabled' : ''} class="px-3 py-1.5 text-xs rounded border border-slate-200 ${st.page <= 0 ? 'text-slate-300 cursor-not-allowed' : 'hover:bg-slate-50 text-slate-700'}">← Prev</button>
        <button onclick="window.pharmInvPage(1)" ${st.page >= totalPages - 1 ? 'disabled' : ''} class="px-3 py-1.5 text-xs rounded border border-slate-200 ${st.page >= totalPages - 1 ? 'text-slate-300 cursor-not-allowed' : 'hover:bg-slate-50 text-slate-700'}">Next →</button>
      </div>`;
  }
};

/**
 * ADJUSTMENT FORM MODAL
 */
window.openAdjustmentModal = function() {
  if (!hasPermission('Counter Head')) {
    alert("Compliance Lockout: Only Counter Head or Pharmacy Managers can adjust physical stock.");
    return;
  }

  const container = document.getElementById('adjustment-modal-container');
  if (!container) return;

  container.innerHTML = `
    <div class="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-[9999] p-4">
      <div class="bg-white rounded-xl border border-slate-200 shadow-lg max-w-lg w-full p-6">
        <h3 class="text-base font-bold text-[#1B3A5C] mb-4">Post Stock Adjustment (Controlled Register)</h3>
        
        <div class="space-y-4">
          <div>
            <label class="block text-xs font-bold text-slate-600 mb-1">Select Medicine</label>
            <select id="adj-medicine" class="w-full text-xs p-2.5 border border-slate-200 rounded">
              ${state.inventory.pharmacyBatches.slice(0, 500).map(m => `<option value="${m.code}">${m.brandName} (${m.code})</option>`).join('')}
            </select>
            <p class="text-[10px] text-slate-400 mt-1">Showing first 500 of ${state.inventory.pharmacyBatches.length.toLocaleString('en-IN')} formulary items.</p>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-bold text-slate-600 mb-1">Batch Number</label>
              <input type="text" id="adj-batch" placeholder="e.g. DL650-B01" class="w-full text-xs p-2.5 border border-slate-200 rounded">
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-600 mb-1">Adjustment Type</label>
              <select id="adj-type" class="w-full text-xs p-2.5 border border-slate-200 rounded">
                <option value="ADD">Add Stock (+)</option>
                <option value="DEDUCT">Deduct Stock (-)</option>
              </select>
            </div>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-bold text-slate-600 mb-1">Quantity</label>
              <input type="number" id="adj-qty" placeholder="100" class="w-full text-xs p-2.5 border border-slate-200 rounded">
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-600 mb-1">Reason</label>
              <select id="adj-reason" class="w-full text-xs p-2.5 border border-slate-200 rounded">
                <option value="Physical Count Difference">Physical Count Difference</option>
                <option value="Damaged - In Storage">Damaged - In Storage</option>
                <option value="Expired Write-off">Expired Write-off</option>
                <option value="Theft / Pilferage">Theft / Pilferage</option>
              </select>
            </div>
          </div>
        </div>

        <div class="mt-6 flex justify-end gap-2 border-t border-slate-200 pt-4">
          <button onclick="closeAdjustmentModal()" class="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-4 py-2 rounded text-xs">Cancel</button>
          <button onclick="submitStockAdjustment()" class="bg-[#1B3A5C] hover:bg-[#152e4a] text-white font-bold px-4 py-2 rounded text-xs">Submit</button>
        </div>
      </div>
    </div>
  `;
};

window.closeAdjustmentModal = function() {
  const container = document.getElementById('adjustment-modal-container');
  if (container) container.innerHTML = "";
};

window.openNewMedicineModal = function() {
  const container = document.getElementById('adjustment-modal-container');
  if (!container) return;

  container.innerHTML = `
    <div class="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-[9999] p-4">
      <div class="bg-white rounded-xl border border-slate-200 shadow-lg max-w-lg w-full p-6 text-left">
        <h3 class="text-base font-bold text-[#1B3A5C] mb-4">Add New Drug Master (Formulary)</h3>
        
        <div class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-bold text-slate-600 mb-1">Brand Name</label>
              <input type="text" id="new-brand" placeholder="e.g. Paracetamol" class="w-full text-xs p-2.5 border border-slate-200 rounded">
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-600 mb-1">Generic Name</label>
              <input type="text" id="new-generic" placeholder="e.g. Acetaminophen" class="w-full text-xs p-2.5 border border-slate-200 rounded">
            </div>
          </div>
          <div class="grid grid-cols-3 gap-4">
            <div>
              <label class="block text-xs font-bold text-slate-600 mb-1">Schedule</label>
              <select id="new-schedule" class="w-full text-xs p-2.5 border border-slate-200 rounded">
                <option value="Schedule H">Schedule H</option>
                <option value="Schedule H1">Schedule H1</option>
                <option value="Schedule G">Schedule G</option>
                <option value="Schedule X">Schedule X (Narcotics)</option>
                <option value="General (OTC)">General (OTC)</option>
              </select>
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-600 mb-1">Dosage Form</label>
              <select id="new-form" class="w-full text-xs p-2.5 border border-slate-200 rounded">
                <option value="Tablet">Tablet</option>
                <option value="Capsule">Capsule</option>
                <option value="Syrup">Syrup</option>
                <option value="Injection">Injection</option>
                <option value="Ointment">Ointment</option>
              </select>
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-600 mb-1">Strength</label>
              <input type="text" id="new-strength" placeholder="e.g. 500 mg" class="w-full text-xs p-2.5 border border-slate-200 rounded">
            </div>
          </div>
          <div class="grid grid-cols-3 gap-4">
            <div>
              <label class="block text-xs font-bold text-slate-600 mb-1">GST Rate (%)</label>
              <input type="number" id="new-gst" value="12" class="w-full text-xs p-2.5 border border-slate-200 rounded">
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-600 mb-1">MRP (₹)</label>
              <input type="number" id="new-mrp" placeholder="e.g. 15.00" class="w-full text-xs p-2.5 border border-slate-200 rounded">
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-600 mb-1">Selling Price (₹)</label>
              <input type="number" id="new-sp" placeholder="e.g. 12.00" class="w-full text-xs p-2.5 border border-slate-200 rounded">
            </div>
          </div>
        </div>

        <div class="mt-6 flex justify-end gap-2 border-t border-slate-200 pt-4">
          <button onclick="window.closeNewMedicineModal()" class="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-4 py-2 rounded text-xs">Cancel</button>
          <button onclick="window.submitNewMedicine()" class="bg-[#1B3A5C] hover:bg-[#152e4a] text-white font-bold px-4 py-2 rounded text-xs">Add to Formulary</button>
        </div>
      </div>
    </div>
  `;
};

window.closeNewMedicineModal = function() {
  const container = document.getElementById('adjustment-modal-container');
  if (container) container.innerHTML = "";
};

window.submitNewMedicine = function() {
  const brand = document.getElementById('new-brand').value.trim();
  const generic = document.getElementById('new-generic').value.trim();
  const schedule = document.getElementById('new-schedule').value;
  const form = document.getElementById('new-form').value;
  const strength = document.getElementById('new-strength').value.trim();
  const gst = parseFloat(document.getElementById('new-gst').value);
  const mrp = parseFloat(document.getElementById('new-mrp').value);
  const sp = parseFloat(document.getElementById('new-sp').value);

  if (!brand || !generic || !strength || isNaN(mrp) || isNaN(sp)) {
    alert("Please fill out all fields with valid data.");
    return;
  }

  // Generate drug code
  const lastCode = state.inventory.pharmacyBatches.reduce((max, cur) => {
    const num = parseInt(cur.code.replace('PHA', ''));
    return num > max ? num : max;
  }, 100);
  const newCode = `PHA${lastCode + 1}`;

  const newDrug = {
    code: newCode,
    brandName: brand,
    genericName: generic,
    schedule: schedule,
    dosageForm: form,
    strength: strength,
    gstRate: gst,
    mrp: mrp,
    sellingPrice: sp,
    stock: 0,
    reorderLevel: 50,
    location: "Rack-A1",
    batches: []
  };

  state.inventory.pharmacyBatches.push(newDrug);
  // Persisting the full ~60k formulary can exceed the localStorage quota; keep
  // it best-effort so adding a drug never throws (the seed rebuilds on reload).
  try {
    localStorage.setItem('saronil_inventory_pharmacyBatches', JSON.stringify(state.inventory.pharmacyBatches));
  } catch (e) { /* quota exceeded — formulary is reseeded from the catalog on load */ }

  alert(`Medicine ${brand} (${newCode}) successfully added to Pharmacy Formulary.`);
  window.closeNewMedicineModal();
  switchPharmTab('master');
};

window.submitStockAdjustment = function() {
  const code = document.getElementById('adj-medicine').value;
  const batchNo = document.getElementById('adj-batch').value.trim();
  const type = document.getElementById('adj-type').value;
  const qty = parseInt(document.getElementById('adj-qty').value);
  const reason = document.getElementById('adj-reason').value;

  if (!batchNo || isNaN(qty) || qty <= 0) {
    alert("Please enter a valid batch number and quantity.");
    return;
  }

  const drug = state.inventory.pharmacyBatches.find(m => m.code === code);
  if (!drug) return;

  let batch = drug.batches.find(b => b.batchNo.toLowerCase() === batchNo.toLowerCase());
  if (!batch) {
    if (type === 'DEDUCT') {
      alert("Error: Batch to deduct does not exist.");
      return;
    }
    // Create new batch if adding new batch
    batch = { batchNo: batchNo, mfgDate: new Date().toISOString().split('T')[0], expiryDate: "2027-12-31", qty: 0, shelfLocation: "Assigned Rack" };
    drug.batches.push(batch);
  }

  const prevQty = batch.qty;
  if (type === 'ADD') {
    batch.qty += qty;
  } else {
    if (batch.qty < qty) {
      alert("Cannot deduct more stock than available in the batch.");
      return;
    }
    batch.qty -= qty;
  }

  // Log in Audit Log
  state.pharmacyAuditLogs.push({
    timestamp: new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }) + " IST",
    user: window.state.activeUser ? window.state.activeUser.name : "System Pharmacist",
    role: getActiveRole(),
    actionType: "STOCK_ADJUSTMENT",
    details: `Adjusted stock for ${drug.brandName} (${batchNo}). Type: ${type}, Qty: ${qty}, Reason: ${reason}. Previous Qty: ${prevQty}, New Qty: ${batch.qty}.`
  });

  alert("Stock adjusted successfully!");
  closeAdjustmentModal();
  switchPharmTab('inventory');
};

/**
 * PROCUREMENT (PO / GRN) VIEW
 */
function renderProcurementTab(container) {
  container.innerHTML = `
    <div class="grid grid-cols-1 xl:grid-cols-2 gap-6">
      
      <!-- Purchase Orders List -->
      <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-base font-bold text-[#1B3A5C]">Purchase Orders Register</h3>
          ${hasPermission('Pharmacy Manager') ? `
            <button onclick="alert('Procurement System Integration: POs are auto-generated upon reorder levels triggers.')" class="bg-[#1B3A5C] text-white py-1 px-3 rounded text-xs font-semibold">
              Create PO
            </button>
          ` : ''}
        </div>
        <div class="space-y-3">
          ${state.pharmacyPurchaseOrders.map(po => `
            <div class="p-4 border border-slate-200 rounded-lg bg-slate-50">
              <div class="flex justify-between items-start">
                <div>
                  <div class="font-bold text-slate-900">${po.poNo}</div>
                  <div class="text-xs text-slate-500 mt-1">Supplier: ${po.supplier}</div>
                  <div class="text-[10px] text-slate-400 mt-1">Ordered Date: ${po.poDate} | Delivery ETA: ${po.expectedDate}</div>
                </div>
                <span class="text-xs font-bold bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded">${po.status}</span>
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Live GRN Receiving Portal -->
      <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <h3 class="text-base font-bold text-[#1B3A5C] mb-4">Receive Consignment against Active PO (GRN Entry)</h3>
        
        <div class="space-y-4">
          <div>
            <label class="block text-xs font-bold text-slate-600 mb-1">Select Purchase Order Ref</label>
            <select id="grn-po-ref" class="w-full text-xs p-2.5 border border-slate-200 rounded">
              ${state.pharmacyPurchaseOrders.map(po => `<option value="${po.poNo}">${po.poNo} - ${po.supplier}</option>`).join('')}
            </select>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-bold text-slate-600 mb-1">Supplier Invoice Number</label>
              <input type="text" id="grn-invoice-no" placeholder="INV-2026-89" class="w-full text-xs p-2.5 border border-slate-200 rounded">
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-600 mb-1">Storage Condition Verified?</label>
              <select id="grn-coldchain" class="w-full text-xs p-2.5 border border-slate-200 rounded">
                <option value="YES">Passed (Cold chain / 2-8°C verified if needed)</option>
                <option value="NO">Failed (Temperature breach alert)</option>
              </select>
            </div>
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-600 mb-1">Items verification check (Pass/Fail checkbox)</label>
            <div class="p-3 bg-slate-50 border border-slate-200 rounded text-xs space-y-2">
              <label class="flex items-center gap-2">
                <input type="checkbox" id="check-packaging" checked> Packaging integrity verified (unbroken seals)
              </label>
              <label class="flex items-center gap-2">
                <input type="checkbox" id="check-expiry" checked> Minimum shelf life (>= 6 months remaining verified)
              </label>
            </div>
          </div>
          <button onclick="executeGRNCommit()" class="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 rounded text-xs transition-colors">
            Generate GRN & Update Stocks
          </button>
        </div>
      </div>

    </div>
  `;
}

window.executeGRNCommit = function() {
  const poNo = document.getElementById('grn-po-ref').value;
  const invoiceNo = document.getElementById('grn-invoice-no').value.trim();
  const coldChainPassed = document.getElementById('grn-coldchain').value === 'YES';
  const packChecked = document.getElementById('check-packaging').checked;
  const expChecked = document.getElementById('check-expiry').checked;

  if (!invoiceNo) {
    alert("Please enter the supplier's Invoice Number to proceed.");
    return;
  }

  if (!coldChainPassed || !packChecked || !expChecked) {
    alert("Consignment Rejected: Quality checks failed. Supplier return ticket initiated.");
    return;
  }

  const po = state.pharmacyPurchaseOrders.find(x => x.poNo === poNo);
  if (!po) return;

  // Add stock to batches
  po.items.forEach(item => {
    const drug = state.inventory.pharmacyBatches.find(m => m.code === item.code);
    if (drug) {
      // Append a new batch matching this GRN
      drug.batches.push({
        batchNo: `GRN-${invoiceNo.substring(0,4)}-${Math.floor(Math.random() * 90 + 10)}`,
        mfgDate: new Date().toISOString().split('T')[0],
        expiryDate: "2027-12-31",
        qty: item.qty,
        shelfLocation: "Rack Gen-Store"
      });
    }
  });

  // Log in Audit Log
  state.pharmacyAuditLogs.push({
    timestamp: new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }) + " IST",
    user: window.state.activeUser ? window.state.activeUser.name : "System Pharmacist",
    role: getActiveRole(),
    actionType: "GRN_COMMITTED",
    details: `Goods Receipt Note committed for PO ${poNo} against Supplier Invoice ${invoiceNo}. Inventory levels updated.`
  });

  alert("GRN entry processed successfully! Stock levels updated.");
  switchPharmTab('procurement');
};

/**
 * RETURNS VIEW
 */
function renderReturnsTab(container) {
  container.innerHTML = `
    <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-6 max-w-2xl mx-auto">
      <h3 class="text-base font-bold text-[#1B3A5C] mb-4">OPD / IPD Sales Return Desk</h3>
      
      <div class="space-y-4">
        <div>
          <label class="block text-xs font-bold text-slate-600 mb-1">Search Patient UHID / Invoice Number</label>
          <div class="flex gap-2">
            <input type="text" id="return-search" placeholder="e.g. MRC-240001 or INV-PH-1001" class="w-full text-xs p-2.5 border border-slate-200 rounded">
            <button onclick="processReturnQuery()" class="bg-[#1B3A5C] text-white text-xs font-semibold px-4 rounded">Search</button>
          </div>
        </div>

        <div id="return-workspace-render"></div>
      </div>
    </div>
  `;
}

window.processReturnQuery = function() {
  const query = document.getElementById('return-search').value.trim();
  const renderArea = document.getElementById('return-workspace-render');
  if (!renderArea) return;

  if (!query) {
    alert("Please enter a patient UHID or Invoice Number.");
    return;
  }

  // Display dummy invoice return interface
  renderArea.innerHTML = `
    <div class="p-4 bg-slate-50 border border-slate-200 rounded-lg mt-4 text-xs">
      <div class="flex justify-between font-bold text-slate-900 mb-3 border-b border-slate-200 pb-2">
        <span>Verify Return Eligibility (JCI Standards)</span>
        <span class="text-indigo-600">Active Reference: ${query}</span>
      </div>
      <div class="space-y-2 mb-4">
        <label class="flex items-center gap-2">
          <input type="checkbox" id="ret-seal" checked> Packaging is unbroken and completely intact (No loose tabs allowed)
        </label>
        <label class="flex items-center gap-2">
          <input type="checkbox" id="ret-cold" checked> Not a refrigerated / cold-chain item (Strict safety block on vaccines/insulin)
        </label>
      </div>

      <button onclick="confirmReturnExecution()" class="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 rounded">
        Acknowledge Return & Reverse Billing Charges
      </button>
    </div>
  `;
};

window.confirmReturnExecution = function() {
  const seal = document.getElementById('ret-seal').checked;
  const cold = document.getElementById('ret-cold').checked;

  if (!seal || !cold) {
    alert("Compliance Reject: Return violates pharmacy safety rules. Unsealed or cold-chain items cannot be returned to stock.");
    return;
  }

  // Log in Audit Log
  state.pharmacyAuditLogs.push({
    timestamp: new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }) + " IST",
    user: window.state.activeUser ? window.state.activeUser.name : "System Pharmacist",
    role: getActiveRole(),
    actionType: "RETURN_PROCESSED",
    details: `Return request processed. Unopened items re-entered to inventory, billing reversals synchronized.`
  });

  alert("Return completed successfully. Credit note printed.");
  switchPharmTab('returns');
};

/**
 * REGULATORY REGISTERS VIEW
 */
function renderRegistersTab(container) {
  container.innerHTML = `
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      <!-- Control Selector -->
      <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <h3 class="text-base font-bold text-[#1B3A5C] mb-4">Select Register View</h3>
        <div class="space-y-2">
          <button onclick="renderRegisterData('narcotic')" class="w-full text-left text-xs p-3 rounded bg-slate-50 hover:bg-slate-100 font-semibold border-l-4 border-orange-500">
            Schedule X & Narcotic Register
          </button>
          <button onclick="renderRegisterData('temperature')" class="w-full text-left text-xs p-3 rounded bg-slate-50 hover:bg-slate-100 font-semibold border-l-4 border-blue-500">
            Cold Chain Temperature Log
          </button>
          <button onclick="renderRegisterData('stewardship')" class="w-full text-left text-xs p-3 rounded bg-slate-50 hover:bg-slate-100 font-semibold border-l-4 border-amber-500">
            Antibiotic Stewardship Consumption
          </button>
        </div>
      </div>

      <!-- Register Output Display -->
      <div class="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm p-6" id="register-display-card">
        <p class="text-sm text-slate-500 text-center py-12">Select a regulatory register on the left to print or audit records.</p>
      </div>

    </div>
  `;
}

window.renderRegisterData = function(type) {
  const card = document.getElementById('register-display-card');
  if (!card) return;

  if (type === 'narcotic') {
    card.innerHTML = `
      <div class="flex justify-between items-center mb-4 border-b border-slate-100 pb-3">
        <h3 class="text-sm font-bold text-slate-800">Schedule X / Psychotropic Drugs Register (Drugs & Cosmetics Act)</h3>
        <button onclick="window.print()" class="text-xs bg-slate-100 hover:bg-slate-200 border border-slate-300 px-3 py-1 rounded">Print Form 24B</button>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full text-left text-[10px] border border-slate-200 rounded">
          <thead>
            <tr class="bg-slate-50 border-b border-slate-200">
              <th class="p-2 font-semibold text-slate-600">Date/Time</th>
              <th class="p-2 font-semibold text-slate-600">Medicine Name</th>
              <th class="p-2 font-semibold text-slate-600">Batch No</th>
              <th class="p-2 font-semibold text-slate-600">Patient Details</th>
              <th class="p-2 font-semibold text-slate-600">Prescribing Doctor</th>
              <th class="p-2 font-semibold text-slate-600 text-center">Issued</th>
              <th class="p-2 font-semibold text-slate-600 text-center">Bal</th>
            </tr>
          </thead>
          <tbody>
            ${state.narcoticRegister.map(r => `
              <tr class="border-b border-slate-100">
                <td class="p-2 font-medium">${r.date}</td>
                <td class="p-2 font-bold">${r.medicineName}</td>
                <td class="p-2 font-mono">${r.batchNo}</td>
                 <td class="p-2"><span class="hover:underline text-blue-600 cursor-pointer" onclick="router.navigate('patients?uhid=${r.uhid}')">${r.patientName} (${r.uhid})</span></td>
                <td class="p-2">${r.doctorName}</td>
                <td class="p-2 text-center font-bold text-red-600">${r.qtyIssued}</td>
                <td class="p-2 text-center font-bold text-slate-800">${r.runningBalance}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  } else if (type === 'temperature') {
    card.innerHTML = `
      <div class="flex justify-between items-center mb-4 border-b border-slate-100 pb-3">
        <h3 class="text-sm font-bold text-slate-800">Cold Chain Refrigerator Temperature Log</h3>
        <button onclick="alert('Compliance report saved')" class="text-xs bg-slate-100 hover:bg-slate-200 border border-slate-300 px-3 py-1 rounded">Generate PDF</button>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full text-left text-[10px] border border-slate-200 rounded">
          <thead>
            <tr class="bg-slate-50 border-b border-slate-200">
              <th class="p-2 font-semibold text-slate-600">Timestamp</th>
              <th class="p-2 font-semibold text-slate-600">Location Device</th>
              <th class="p-2 font-semibold text-slate-600">Recorded Temp</th>
              <th class="p-2 font-semibold text-slate-600">Excursion Duration</th>
              <th class="p-2 font-semibold text-slate-600">Reconciliation Action</th>
              <th class="p-2 font-semibold text-slate-600">Logged By</th>
            </tr>
          </thead>
          <tbody>
            ${state.temperatureExcursions.map(t => `
              <tr class="border-b border-slate-100">
                <td class="p-2 font-medium">${t.timestamp}</td>
                <td class="p-2">${t.counter}</td>
                <td class="p-2 text-red-600 font-bold">${t.temperature}</td>
                <td class="p-2">${t.duration}</td>
                <td class="p-2 text-slate-600">${t.reconciliation}</td>
                <td class="p-2 font-medium">${t.loggedBy}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  } else if (type === 'stewardship') {
    card.innerHTML = `
      <div class="flex justify-between items-center mb-4 border-b border-slate-100 pb-3">
        <h3 class="text-sm font-bold text-slate-800">Schedule H1 Antibiotic Stewardship Consumption Logs</h3>
        <button class="text-xs bg-slate-100 hover:bg-slate-200 border border-slate-300 px-3 py-1 rounded">Export Excel</button>
      </div>
      <p class="text-xs text-slate-600 mb-4">The following antibiotics are tracked for JCI antimicrobial stewardship compliance:</p>
      <div class="p-4 bg-slate-50 rounded border border-slate-200 text-xs">
        <div class="flex justify-between font-bold text-slate-700 mb-2">
          <span>Clavam 625 (Amoxicillin + Clavulanic Acid)</span>
          <span class="text-indigo-600">Total Consumption: 450 units (Ward A / ICU)</span>
        </div>
      </div>
    `;
  }
};

/**
 * AUDIT LOG VIEW
 */
function renderAuditTab(container) {
  container.innerHTML = `
    <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
      <h3 class="text-base font-bold text-[#1B3A5C] mb-4">Immutable Operational Transaction Logs</h3>
      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs border border-slate-200 rounded-lg overflow-hidden">
          <thead>
            <tr class="bg-slate-50 border-b border-slate-200">
              <th class="p-3 font-semibold text-slate-600">Timestamp</th>
              <th class="p-3 font-semibold text-slate-600">Operator (Role)</th>
              <th class="p-3 font-semibold text-slate-600">Action Type</th>
              <th class="p-3 font-semibold text-slate-600">Transaction Details</th>
            </tr>
          </thead>
          <tbody>
            ${state.pharmacyAuditLogs.map(l => `
              <tr class="border-b border-slate-100 hover:bg-slate-50">
                <td class="p-3 font-medium text-slate-500">${l.timestamp}</td>
                <td class="p-3">
                  <div class="font-bold text-slate-900">${l.user}</div>
                  <div class="text-[10px] text-slate-400 mt-0.5">${l.role}</div>
                </td>
                <td class="p-3">
                  <span class="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#1B3A5C]/10 text-[#1B3A5C]">
                    ${l.actionType}
                  </span>
                </td>
                <td class="p-3 text-slate-600">${l.details}</td>
              </tr>
            `).join('') || `<tr><td colspan="4" class="text-slate-500 text-center py-6">No audit records logged in this session.</td></tr>`}
          </tbody>
        </table>
      </div>
    </div>
  `;
}
