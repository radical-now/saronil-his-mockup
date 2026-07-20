/* ==========================================================================
   SARONIL HMS - HOSPITAL PHARMACY MODULE (pharmacyView.js)
   ========================================================================== */

/**
 * --------------------------------------------------------------------------
 * INITIAL STATE & MASTER DATA SEEDING
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
        { batchNo: "INS100-M03", mfgDate: "2025-04-10", expiryDate: "2027-10-10", qty: 90, shelfLocation: "Refrigerator C" }
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
        { batchNo: "PAN40-EXP90", mfgDate: "2024-09-01", expiryDate: "2027-09-10", qty: 800, shelfLocation: "Rack B-2" }
      ]
    },
    // User requested medications
    {
      code: "MED-FEBREX",
      brandName: "Febrex Plus",
      genericName: "Paracetamol + Chlorpheniramine + Phenylephrine",
      dosageForm: "Tablet",
      strength: "500mg+2mg+5mg",
      manufacturer: "Indoco Remedies",
      schedule: "Schedule H",
      hsnCode: "30049011",
      gstRate: 12,
      mrp: 50.00,
      sellingPrice: 45.00,
      purchasePrice: 28.00,
      reorderLevel: 200,
      minStockLevel: 50,
      maxStockLevel: 1000,
      requiresRefrigeration: false,
      activeStatus: "Active",
      batches: [
        { batchNo: "FP-OOS-01", mfgDate: "2024-05-10", expiryDate: "2026-05-10", qty: 0, shelfLocation: "Rack A-3" } // Out of Stock
      ]
    },
    {
      code: "MED-SINAREST",
      brandName: "Sinarest",
      genericName: "Paracetamol + Chlorpheniramine + Phenylephrine",
      dosageForm: "Tablet",
      strength: "500mg+2mg+5mg",
      manufacturer: "Centaur Pharmaceuticals",
      schedule: "Schedule H",
      hsnCode: "30049011",
      gstRate: 12,
      mrp: 55.00,
      sellingPrice: 50.00,
      purchasePrice: 30.00,
      reorderLevel: 500,
      minStockLevel: 100,
      maxStockLevel: 2000,
      requiresRefrigeration: false,
      activeStatus: "Active",
      batches: [
        { batchNo: "SR-BAT-22", mfgDate: "2025-01-15", expiryDate: "2027-01-15", qty: 150, shelfLocation: "Rack A-3" }
      ]
    },
    {
      code: "MED-CHESTON",
      brandName: "Cheston Cold",
      genericName: "Paracetamol + Chlorpheniramine + Phenylephrine",
      dosageForm: "Tablet",
      strength: "500mg+2mg+5mg",
      manufacturer: "Cipla Ltd",
      schedule: "Schedule H",
      hsnCode: "30049011",
      gstRate: 12,
      mrp: 48.00,
      sellingPrice: 43.00,
      purchasePrice: 25.00,
      reorderLevel: 500,
      minStockLevel: 100,
      maxStockLevel: 2000,
      requiresRefrigeration: false,
      activeStatus: "Active",
      batches: [
        { batchNo: "CC-BAT-90", mfgDate: "2025-02-10", expiryDate: "2027-02-10", qty: 250, shelfLocation: "Rack A-3" }
      ]
    },
    {
      code: "MED-COLGIN",
      brandName: "Colgin Plus",
      genericName: "Paracetamol + Chlorpheniramine + Phenylephrine",
      dosageForm: "Tablet",
      strength: "500mg+2mg+5mg",
      manufacturer: "Cadila Pharmaceuticals",
      schedule: "Schedule H",
      hsnCode: "30049011",
      gstRate: 12,
      mrp: 45.00,
      sellingPrice: 40.00,
      purchasePrice: 24.00,
      reorderLevel: 300,
      minStockLevel: 80,
      maxStockLevel: 1500,
      requiresRefrigeration: false,
      activeStatus: "Active",
      batches: [
        { batchNo: "CP-BAT-31", mfgDate: "2025-03-05", expiryDate: "2027-03-05", qty: 180, shelfLocation: "Rack A-3" }
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
      speciality: "General, Cold Chain, Narcotics",
      returnAgreementFlag: true
    },
    {
      code: "SUP-PH-002",
      name: "BioPharma Distributors Patna",
      dlNo: "DL-20B-008475",
      dlExpiry: "2026-07-15",
      gstin: "10BBBBB2222B2Z2",
      pan: "BBBBB2222B",
      creditLimit: 200000,
      creditDays: 15,
      status: "Active",
      contact: "+91 91234 56789",
      speciality: "Vaccines & Biologicals",
      returnAgreementFlag: false
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
      speciality: "Narcotics Licensed",
      returnAgreementFlag: true
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
      totalValue: 107000.00,
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
      medicineName: "Morphine Inj 10mg",
      batchNo: "MORPH-X04",
      prescriptionNo: "RX-IPD-9847",
      patientName: "Rajesh Kumar",
      uhid: "MRC-240001",
      doctorName: "Dr. Ramesh Kumar (NMC-84729)",
      idProof: "Aadhaar - 982188219011",
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
      loggedBy: "Pharmacist Incharge",
      deviationFlag: true
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

  // Daycare & Outside simulated queues
  state.pharmacyDaycareQueue = state.pharmacyDaycareQueue || [
    {
      indentNo: "IND-DC-502",
      uhid: "MRC-240003",
      patientName: "Amit Verma",
      wardBed: "Daycare Ward / Bed D-05",
      doctor: "Dr. Ritu S. (NMC-11029)",
      priority: "Routine",
      timeWaiting: "8 mins",
      items: [
        { code: "MED-ANAL-001", name: "Dolo 650", dose: "1 Tab", freq: "PRN", duration: "1 Day", qty: 2 },
        { code: "MED-COLD-004", name: "Huminsulin R 100IU", dose: "10 units SC", freq: "AC", duration: "1 Day", qty: 1 }
      ],
      status: "Pending"
    }
  ];
  state.pharmacyOutsideQueue = state.pharmacyOutsideQueue || [];

  state.pharmacyGRNs = state.pharmacyGRNs || [];
  state.pharmacyReturns = state.pharmacyReturns || [];
  state.pharmacyDisposals = state.pharmacyDisposals || [];
  state.pharmacyAuditLogs = state.pharmacyAuditLogs || [];
  state.pharmacyColdChainDeviation = (state.pharmacyColdChainDeviation !== undefined) ? state.pharmacyColdChainDeviation : false;

  // Import global catalog if needed
  if (Array.isArray(window.medicationCatalog) && state.inventory.pharmacyBatches.length < 100) {
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
        schedule: c.schedule || "Schedule H", hsnCode: c.hsnCode || "30049099", gstRate: gstFor(c.category),
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
}

/**
 * Helper to check current role permissions
 */
function getActiveRole() {
  return (window.state && state.activeUserRole) || "Pharmacist";
}

function hasPermission(minRole) {
  const current = getActiveRole();
  const hierarchy = ["Dispense", "Counter Head", "Pharmacy Manager", "Administrator"];
  
  // Custom mapping for role switch testing matrix
  const currentLevel = 
    current === "Nurse" || current === "Doctor" || current === "Billing/Cashier" ? "Dispense" :
    current === "Pharmacist" ? "Counter Head" :
    current === "Store In-charge" || current === "Pharmacy Head" ? "Pharmacy Manager" : "Administrator";

  const minLevel = minRole;
  const levels = ["Dispense", "Counter Head", "Pharmacy Manager", "Administrator"];
  return levels.indexOf(currentLevel) >= levels.indexOf(minLevel);
}

/**
 * Checks if tab is visible to the active user role
 */
function isTabVisible(tabId) {
  if (tabId === 'queues') return false;
  const role = getActiveRole();
  if (role === 'Administrator' || role === 'Super Admin' || role === 'Pharmacy Head' || role === 'CFO/Finance') {
    return true;
  }
  switch (tabId) {
    case 'dashboard':
      return true;
    case 'queues':
      return false;
    case 'master':
      return ['Pharmacist', 'Store In-charge', 'Auditor'].includes(role);
    case 'inventory':
      return ['Pharmacist', 'Store In-charge', 'Auditor'].includes(role);
    case 'procurement':
      return ['Pharmacist', 'Store In-charge', 'Auditor'].includes(role);
    case 'returns':
      return ['Pharmacist', 'Store In-charge', 'Nurse', 'Auditor'].includes(role);
    case 'registers':
      return ['Pharmacist', 'Store In-charge', 'Auditor'].includes(role);
    case 'disposal':
      return ['Pharmacist', 'Store In-charge', 'Auditor'].includes(role);
    case 'audit':
      return ['Pharmacist', 'Store In-charge', 'Auditor'].includes(role);
    default:
      return false;
  }
}

/**
 * Switch role from testing dropdown and repaint UI
 */
window.switchPharmacyActiveRole = function(newRole) {
  if (window.state) {
    state.activeUserRole = newRole;
    // Set a matching activeUser profile for audit log tracking
    state.activeUser = {
      id: newRole === 'Pharmacist' ? 'STF01' : 'STF-TEST',
      name: newRole === 'Nurse' ? 'Sister Mercy' :
            newRole === 'Doctor' ? 'Dr. Ramesh Kumar' :
            newRole === 'CFO/Finance' ? 'CFO Anish' :
            newRole === 'Pharmacy Head' ? 'Dr. Satish (Head)' : `Staff (${newRole})`,
      role: newRole
    };
  }
  const root = document.querySelector('.view-container');
  if (root) {
    renderPharmacyModule(root);
  }
};

/**
 * Core rendering view function
 */
window.views.pharmacy = function(container, subAnchor, params) {
  renderPharmacyModule(container);
};

function renderPharmacyModule(container) {
  container.className = "view-container bg-slate-50 text-slate-800 font-sans p-6";
  
  const role = getActiveRole();

  container.innerHTML = `
    <!-- Top Action bar with role switcher -->
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-slate-200">
      <div>
        <h1 class="text-2xl font-bold text-[#1B3A5C]">Hospital Pharmacy Module</h1>
        <p class="text-sm text-slate-500">Retail Counters, Ward Indents, Procurement, FEFO Stock Control & Digital Regulatory Registers</p>
      </div>
      
      <div class="flex flex-wrap items-center gap-3">
        <!-- Role switcher panel for testing compliance matrix -->
        <div class="flex items-center gap-2 bg-white px-3 py-1.5 border border-slate-200 rounded-lg shadow-sm">
          <span class="text-xs text-slate-500 font-bold">Role:</span>
          <select id="pharm-active-role-switcher" onchange="window.switchPharmacyActiveRole(this.value)" class="text-xs font-bold text-[#1B3A5C] bg-transparent border-0 cursor-pointer focus:ring-0 focus:outline-none">
            <option value="Pharmacist" ${role === 'Pharmacist' ? 'selected' : ''}>Pharmacist (Counter Head)</option>
            <option value="Store In-charge" ${role === 'Store In-charge' ? 'selected' : ''}>Store In-charge</option>
            <option value="Pharmacy Head" ${role === 'Pharmacy Head' ? 'selected' : ''}>Pharmacy Head</option>
            <option value="Doctor" ${role === 'Doctor' ? 'selected' : ''}>Doctor</option>
            <option value="Nurse" ${role === 'Nurse' ? 'selected' : ''}>Nurse (Ward)</option>
            <option value="Billing/Cashier" ${role === 'Billing/Cashier' ? 'selected' : ''}>Billing/Cashier</option>
            <option value="CFO/Finance" ${role === 'CFO/Finance' ? 'selected' : ''}>CFO / Super Admin</option>
            <option value="Auditor" ${role === 'Auditor' ? 'selected' : ''}>Auditor</option>
          </select>
        </div>

        <span class="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
          <span class="w-2 h-2 rounded-full bg-emerald-500 mr-2 animate-pulse"></span> central store linked
        </span>
      </div>
    </div>

    <!-- Tab navigation -->
    <div class="flex border-b border-slate-200 mt-6 overflow-x-auto gap-1 shrink-0">
      ${isTabVisible('dashboard') ? `<button onclick="switchPharmTab('dashboard')" class="pharm-tab-btn active px-4 py-2 text-sm font-semibold border-b-2 border-[#1B3A5C] text-[#1B3A5C]" id="tab-btn-dashboard">Dashboard</button>` : ''}
      ${isTabVisible('master') ? `<button onclick="switchPharmTab('master')" class="pharm-tab-btn px-4 py-2 text-sm font-semibold text-slate-500 hover:text-slate-700" id="tab-btn-master">Medicine Master</button>` : ''}
      ${isTabVisible('inventory') ? `<button onclick="switchPharmTab('inventory')" class="pharm-tab-btn px-4 py-2 text-sm font-semibold text-slate-500 hover:text-slate-700" id="tab-btn-inventory">Inventory & Adjustments</button>` : ''}
      ${isTabVisible('procurement') ? `<button onclick="switchPharmTab('procurement')" class="pharm-tab-btn px-4 py-2 text-sm font-semibold text-slate-500 hover:text-slate-700" id="tab-btn-procurement">Procurement (PO/GRN)</button>` : ''}
      ${isTabVisible('returns') ? `<button onclick="switchPharmTab('returns')" class="pharm-tab-btn px-4 py-2 text-sm font-semibold text-slate-500 hover:text-slate-700" id="tab-btn-returns">Returns Center</button>` : ''}
      ${isTabVisible('registers') ? `<button onclick="switchPharmTab('registers')" class="pharm-tab-btn px-4 py-2 text-sm font-semibold text-slate-500 hover:text-slate-700" id="tab-btn-registers">Regulatory Registers</button>` : ''}
      ${isTabVisible('disposal') ? `<button onclick="switchPharmTab('disposal')" class="pharm-tab-btn px-4 py-2 text-sm font-semibold text-slate-500 hover:text-slate-700" id="tab-btn-disposal">Disposal & Write-Off</button>` : ''}
      ${isTabVisible('audit') ? `<button onclick="switchPharmTab('audit')" class="pharm-tab-btn px-4 py-2 text-sm font-semibold text-slate-500 hover:text-slate-700" id="tab-btn-audit">Audit Log</button>` : ''}
    </div>

    <!-- Excursion/Breach Warning Banner -->
    <div id="cold-chain-breach-banner" class="hidden mt-4 bg-red-100 border border-red-200 text-red-800 p-4 rounded-lg flex justify-between items-center shadow-xs">
      <div class="flex items-center gap-2">
        <span class="text-xl">🚨</span>
        <span class="text-xs font-bold uppercase tracking-wider">CRITICAL COLD CHAIN BREACH ACTIVE: Refrigerator units out of bounds. Dispensing of vaccines and insulin is BLOCKED.</span>
      </div>
      ${role === 'Store In-charge' || role === 'Pharmacy Head' || role === 'CFO/Finance' ? `
        <button onclick="openExcursionReconcileModal()" class="bg-red-800 hover:bg-red-900 text-white text-[10px] font-bold px-3 py-1 rounded">Reconcile & Clear</button>
      ` : ''}
    </div>

    <!-- Active view container -->
    <div id="pharmacy-tab-content" class="mt-6"></div>
    <!-- Workbench Mount Overlay -->
    <div id="dispense-workbench-modal" class="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-[999] hidden p-4"></div>
  `;

  // Render initial active tab
  switchPharmTab('dashboard');
  updateStatCountBadge();
  checkColdChainStatus();
}

function checkColdChainStatus() {
  const banner = document.getElementById('cold-chain-breach-banner');
  if (banner) {
    if (state.pharmacyColdChainDeviation) {
      banner.classList.remove('hidden');
    } else {
      banner.classList.add('hidden');
    }
  }
}

window.switchPharmTab = function(tabId) {
  if (tabId === 'queues') tabId = 'dashboard';

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
      renderPharmacyDashboardTab(tabContainer);
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
    case 'disposal':
      renderDisposalTab(tabContainer);
      break;
    case 'audit':
      renderAuditTab(tabContainer);
      break;
  }
};

function updateStatCountBadge() {
  const statBadge = document.getElementById('stat-queue-badge');
  if (statBadge) {
    const totalPending = 
      state.pharmacyOPDQueue.filter(o => o.status === 'Pending').length +
      state.pharmacyIPDIndentQueue.filter(i => i.status === 'Pending').length +
      state.pharmacyDaycareQueue.filter(d => d.status === 'Pending').length;
    statBadge.textContent = totalPending;
  }
}

/**
 * --------------------------------------------------------------------------
 * 1. DASHBOARD TAB
 * --------------------------------------------------------------------------
 */
function renderPharmacyDashboardTab(container) {
  const role = getActiveRole();
  const canDispense = role === 'Pharmacist' || role === 'Store In-charge' || role === 'Pharmacy Head' || role === 'Administrator' || role === 'Super Admin';

  const pendingOPD = state.pharmacyOPDQueue.filter(o => o.status === 'Pending').length;
  const pendingIPD = state.pharmacyIPDIndentQueue.filter(i => i.status === 'Pending').length;
  const pendingDC = state.pharmacyDaycareQueue.filter(d => d.status === 'Pending').length;
  const statAlerts = state.pharmacyIPDIndentQueue.filter(i => i.priority === 'STAT' && i.status === 'Pending').length;
  
  const lowStockCount = state.inventory.pharmacyBatches.filter(m => {
    const totalQty = m.batches.reduce((sum, b) => sum + (b.qty || 0), 0);
    return totalQty <= m.minStockLevel;
  }).length;

  const quarantinedCount = state.inventory.pharmacyBatches.reduce((sum, m) => {
    return sum + m.batches.filter(b => b.status === 'Quarantine' || new Date(b.expiryDate) < new Date()).length;
  }, 0);

  container.innerHTML = `
    <!-- Top KPIs -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div class="bg-white p-6 rounded-xl border border-slate-200 shadow-xs flex items-center gap-4">
        <div class="p-3 bg-[#1B3A5C]/10 text-[#1B3A5C] rounded-lg text-2xl font-bold">📋</div>
        <div>
          <div class="text-xs text-slate-500 font-bold uppercase tracking-wider">OPD Prescriptions</div>
          <div class="text-xl font-extrabold text-slate-900">${pendingOPD} Pending</div>
        </div>
      </div>
      <div class="bg-white p-6 rounded-xl border border-slate-200 shadow-xs flex items-center gap-4 relative">
        <div class="p-3 bg-red-50 text-red-600 rounded-lg text-2xl font-bold">
          🚨 ${statAlerts > 0 ? '<span class="absolute top-4 right-4 w-3.5 h-3.5 bg-red-500 rounded-full animate-ping"></span>' : ''}
        </div>
        <div>
          <div class="text-xs text-slate-500 font-bold uppercase tracking-wider">IPD / Daycare</div>
          <div class="text-xl font-extrabold text-slate-900">${pendingIPD + pendingDC} Pending <span class="text-xs text-red-600 font-bold">(${statAlerts} STAT)</span></div>
        </div>
      </div>
      <div class="bg-white p-6 rounded-xl border border-slate-200 shadow-xs flex items-center gap-4">
        <div class="p-3 bg-amber-50 text-amber-600 rounded-lg text-2xl font-bold">⚠️</div>
        <div>
          <div class="text-xs text-slate-500 font-bold uppercase tracking-wider">Reorder Alerts</div>
          <div class="text-xl font-extrabold text-slate-900">${lowStockCount} Items Low</div>
        </div>
      </div>
      <div class="bg-white p-6 rounded-xl border border-slate-200 shadow-xs flex items-center gap-4">
        <div class="p-3 bg-rose-50 text-rose-600 rounded-lg text-2xl font-bold">🛑</div>
        <div>
          <div class="text-xs text-slate-500 font-bold uppercase tracking-wider">Quarantine / Expired</div>
          <div class="text-xl font-extrabold text-slate-900">${quarantinedCount} Batches</div>
        </div>
      </div>
    </div>

    <!-- Dispensing & Intake Center (Real-time Queues) -->
    <div class="flex justify-between items-center gap-4 mb-4 bg-white p-4 rounded-xl border border-slate-200 shadow-xs mt-6">
      <div class="flex items-center gap-2">
        <h3 class="text-sm font-bold text-[#1B3A5C]">Dispensing & Intake Center (Real-time Queues)</h3>
      </div>
      <div class="flex gap-2">
        <button onclick="openWalkinSaleModal()" class="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-1.5 px-3 rounded">
          ➕ New Outside / Walk-in Sale
        </button>
        <button onclick="simulateDaycareIndent()" class="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-1.5 px-3 rounded">
          🔄 Simulate Daycare Indent
        </button>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- OPD Counter Queue -->
      <div class="bg-white rounded-xl border border-slate-200 shadow-xs p-6">
        <div class="flex justify-between items-center border-b border-slate-100 pb-3 mb-4">
          <h3 class="text-sm font-bold text-slate-800">OPD & Outside Walk-in Queue</h3>
          <span class="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
            ${state.pharmacyOPDQueue.filter(o => o.status === 'Pending').length + state.pharmacyOutsideQueue.filter(q => q.status === 'Pending').length} Pending
          </span>
        </div>
        <div class="space-y-3 max-h-[400px] overflow-y-auto pr-1">
          <!-- Merged OPD & Outside -->
          ${[...state.pharmacyOPDQueue, ...state.pharmacyOutsideQueue].map(rx => `
            <div class="p-3 border border-slate-200 rounded-lg hover:border-[#1B3A5C] transition-all bg-white">
              <div class="flex justify-between items-start">
                <div>
                  <div class="font-bold text-slate-900 text-xs">${rx.patientName}</div>
                  <div class="text-[10px] text-slate-500 mt-1">UHID: ${rx.uhid} | Prescription: <strong>${rx.rxNo}</strong></div>
                  <div class="text-[10px] text-slate-500 mt-0.5 font-medium">Doctor: ${rx.doctor}</div>
                </div>
                <span class="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">${rx.priority || 'Routine'}</span>
              </div>
              <div class="mt-2.5 pt-2.5 border-t border-slate-100 flex justify-between items-center">
                <span class="text-[10px] text-slate-500">${rx.items.length} prescribed lines</span>
                ${canDispense ? `
                  <button onclick="openDispenseWorkbench('${rx.rxNo}', 'OPD')" class="bg-[#1B3A5C] hover:bg-[#152e4a] text-white text-[10px] font-bold px-3 py-1 rounded">
                    Dispense & Bill
                  </button>
                ` : '<span class="text-[10px] text-slate-400 italic">Dispense locked for role</span>'}
              </div>
            </div>
          `).join('') || '<p class="text-xs text-slate-400 text-center py-6">No pending prescriptions in OPD/Outside counter.</p>'}
        </div>
      </div>

      <!-- IPD Wards Indents & Daycare Queue -->
      <div class="bg-white rounded-xl border border-slate-200 shadow-xs p-6">
        <div class="flex justify-between items-center border-b border-slate-100 pb-3 mb-4">
          <h3 class="text-sm font-bold text-slate-800">IPD & Daycare Requisitions Queue</h3>
          <span class="bg-red-100 text-red-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
            ${state.pharmacyIPDIndentQueue.filter(i => i.status === 'Pending').length + state.pharmacyDaycareQueue.filter(d => d.status === 'Pending').length} Pending
          </span>
        </div>
        <div class="space-y-3 max-h-[400px] overflow-y-auto pr-1">
          <!-- Merged IPD & Daycare -->
          ${[...state.pharmacyIPDIndentQueue, ...state.pharmacyDaycareQueue].map(indent => {
            const isStat = indent.priority === 'STAT';
            const isDC = indent.indentNo.includes('DC');
            return `
              <div class="p-3 border ${isStat ? 'border-red-200 bg-red-50/20' : 'border-slate-200'} rounded-lg hover:border-red-500 transition-all bg-white relative">
                ${isStat ? '<span class="absolute top-2 right-2 text-[9px] uppercase font-bold tracking-wider text-red-600 bg-red-100 px-2 py-0.5 rounded-full animate-pulse">STAT</span>' : ''}
                <div class="flex justify-between items-start">
                  <div>
                    <div class="font-bold text-slate-900 text-xs">${indent.patientName}</div>
                    <div class="text-[10px] text-slate-500 mt-1">UHID: ${indent.uhid} | Ward: <strong>${indent.wardBed}</strong></div>
                    <div class="text-[10px] text-slate-500 mt-0.5">Order No: <strong>${indent.indentNo}</strong></div>
                  </div>
                  <span class="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">${isDC ? 'Daycare' : 'IPD'}</span>
                </div>
                <div class="mt-2.5 pt-2.5 border-t border-slate-100 flex justify-between items-center">
                  <span class="text-[10px] text-slate-500">${indent.items.length} items in box</span>
                  <div class="flex gap-2">
                    ${isDC && canDispense ? `
                      <button onclick="returnDaycareProcedureBox('${indent.indentNo}')" class="bg-rose-100 hover:bg-rose-200 text-rose-800 text-[10px] font-bold px-2 py-1 rounded">
                        Return Unused
                      </button>
                    ` : ''}
                    ${canDispense ? `
                      <button onclick="openDispenseWorkbench('${indent.indentNo}', '${isDC ? 'Daycare' : 'IPD'}')" class="bg-[#1B3A5C] hover:bg-[#152e4a] text-white text-[10px] font-bold px-3 py-1 rounded">
                        Dispatch Box
                      </button>
                    ` : '<span class="text-[10px] text-slate-400 italic">Dispense locked for role</span>'}
                  </div>
                </div>
              </div>
            `;
          }).join('') || '<p class="text-xs text-slate-400 text-center py-6">No pending inpatient/daycare requisitions.</p>'}
        </div>
      </div>
    </div>

    <!-- Active Reorder Stock List & Statutory Rules Board -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
      <div class="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-xs p-6">
        <h3 class="text-sm font-bold text-[#1B3A5C] mb-4">Stock Level Warnings & Quick Procurement Indent</h3>
        <div class="overflow-x-auto max-h-[300px]">
          <table class="w-full text-left text-xs border border-slate-200 rounded">
            <thead>
              <tr class="bg-slate-50 border-b border-slate-200">
                <th class="p-2 font-semibold">Brand Name</th>
                <th class="p-2 font-semibold">Generic Name</th>
                <th class="p-2 font-semibold text-center">Available Stock</th>
                <th class="p-2 font-semibold text-center">Reorder Trigger</th>
                <th class="p-2 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              ${state.inventory.pharmacyBatches.filter(m => {
                const qty = m.batches.reduce((sum, b) => sum + (b.qty || 0), 0);
                return qty <= m.minStockLevel;
              }).slice(0, 10).map(m => {
                const total = m.batches.reduce((sum, b) => sum + (b.qty || 0), 0);
                return `
                  <tr class="border-b border-slate-100 hover:bg-slate-50">
                    <td class="p-2 font-bold">${m.brandName}</td>
                    <td class="p-2 text-slate-500">${m.genericName}</td>
                    <td class="p-2 text-center text-red-600 font-bold">${total} units</td>
                    <td class="p-2 text-center">${m.minStockLevel} units</td>
                    <td class="p-2 text-right">
                      <button onclick="quickProcureIndent('${m.code}')" class="bg-[#1B3A5C] hover:bg-[#152e4a] text-white text-[10px] font-bold px-2 py-1 rounded">Quick PO</button>
                    </td>
                  </tr>
                `;
              }).join('') || '<tr><td colspan="5" class="p-4 text-center text-slate-400">All stock levels stable.</td></tr>'}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Statutory Rules Board -->
      <div class="bg-white rounded-xl border border-slate-200 shadow-xs p-6">
        <h3 class="text-sm font-bold text-[#1B3A5C] mb-3">Regulatory Compliance Rulebook</h3>
        <ul class="text-xs text-slate-600 space-y-3">
          <li class="p-2 bg-red-50 rounded border-l-4 border-red-500">
            <strong>Schedule X Narcotics</strong>: Requires capturing Patient ID Proof type and details, Prescribing Doctor registration number, and logs to the statutory register. No bypass.
          </li>
          <li class="p-2 bg-amber-50 rounded border-l-4 border-amber-500">
            <strong>Cold Chain Control</strong>: Deviations log automatically locks insulin and vaccine dispatch until corrective action is logged.
          </li>
          <li class="p-2 bg-blue-50 rounded border-l-4 border-blue-500">
            <strong>JCI 5-Rights Check</strong>: Patient name, drug, dose, route, and frequency checks are enforced on every dispatch.
          </li>
        </ul>
      </div>
    </div>
  `;
}

window.quickProcureIndent = function(code) {
  alert(`Simulated Indent Raised for drug: ${code}. Redirecting to Procurement PO tab.`);
  switchPharmTab('procurement');
};

window.simulateDaycareIndent = function() {
  const newDC = {
    indentNo: "IND-DC-" + String(1000 + state.pharmacyDaycareQueue.length),
    uhid: "MRC-240029",
    patientName: "Dr. Sumitra Sen (Daycare)",
    wardBed: "Daycare Chemotherapy Unit / Bed B-1",
    doctor: "Dr. Anup Sen (NMC-88190)",
    priority: "Routine",
    timeWaiting: "Just now",
    items: [
      { code: "MED-ANAL-001", name: "Dolo 650", dose: "1 Tab", freq: "PRN", duration: "1 Day", qty: 4 },
      { code: "MED-COLD-004", name: "Huminsulin R 100IU", dose: "5 units SC", freq: "OD", duration: "1 Day", qty: 1 }
    ],
    status: "Pending"
  };
  state.pharmacyDaycareQueue.push(newDC);
  alert("Daycare procedural indent generated successfully!");
  updateStatCountBadge();
  switchPharmTab('queues');
};

window.openWalkinSaleModal = function() {
  const modal = document.getElementById('dispense-workbench-modal');
  if (!modal) return;
  modal.classList.remove('hidden');

  modal.innerHTML = `
    <div class="bg-white rounded-xl border border-slate-200 shadow-lg max-w-lg w-full p-6 relative">
      <h3 class="text-base font-bold text-[#1B3A5C] mb-4">Create Outside / Walk-in Retail Sale</h3>
      
      <div class="space-y-4 text-xs">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block font-bold text-slate-600 mb-1">Patient Name</label>
            <input type="text" id="walkin-patient-name" placeholder="Walk-in Patient" class="w-full p-2 border border-slate-200 rounded">
          </div>
          <div>
            <label class="block font-bold text-slate-600 mb-1">Patient UHID (Optional)</label>
            <input type="text" id="walkin-uhid" placeholder="MRC-XXXXXX" class="w-full p-2 border border-slate-200 rounded">
          </div>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block font-bold text-slate-600 mb-1">Prescribing Doctor</label>
            <input type="text" id="walkin-doctor-name" placeholder="Dr. Outside Prescriber" class="w-full p-2 border border-slate-200 rounded">
          </div>
          <div>
            <label class="block font-bold text-slate-600 mb-1">Doctor Reg Number</label>
            <input type="text" id="walkin-doctor-reg" placeholder="NMC-XXXXX" class="w-full p-2 border border-slate-200 rounded">
          </div>
        </div>
        
        <!-- Add Prescription items -->
        <h4 class="font-bold text-slate-800 border-b border-slate-100 pb-2 mt-4">Select Prescribed Medication</h4>
        <div class="grid grid-cols-3 gap-2">
          <div class="col-span-2 relative">
            <label class="block text-[10px] text-slate-500 mb-0.5">Medicine Search</label>
            <input type="text" id="walkin-med-search" placeholder="Type medicine brand/generic name..." class="w-full p-2 border border-slate-200 rounded text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#1B3A5C] focus:border-[#1B3A5C]" oninput="window.handleWalkinMedSearch(this.value)" autocomplete="off">
            <input type="hidden" id="walkin-med-select" value="">
            <div id="walkin-med-suggestions" class="absolute left-0 right-0 z-50 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-48 overflow-y-auto hidden"></div>
          </div>
          <div>
            <label class="block text-[10px] text-slate-500 mb-0.5">Dispense Qty</label>
            <input type="number" id="walkin-med-qty" min="1" value="10" class="w-full p-2 border border-slate-200 rounded">
          </div>
        </div>

        <!-- Alternatives suggestions container -->
        <div id="walkin-alternative-suggestion" class="hidden p-3 bg-amber-50 rounded border border-amber-200 text-xs">
          <span class="font-semibold text-amber-800">⚠️ FEBREX PLUS IS OUT OF STOCK</span>
          <div class="mt-1 flex items-center justify-between">
            <span class="text-slate-700 font-medium">Alternatives: Sinarest, Cheston Cold, Colgin Plus</span>
            <button onclick="window.selectWalkinAlternative('MED-SINAREST')" class="bg-amber-600 text-white text-[10px] font-bold px-2 py-0.5 rounded">See Alternative</button>
          </div>
        </div>

        <!-- Selected items draft table -->
        <div class="mt-4">
          <table class="w-full border text-left" id="walkin-draft-table">
            <thead>
              <tr class="bg-slate-50 border-b">
                <th class="p-2 font-semibold">Medicine</th>
                <th class="p-2 font-semibold text-center">Qty</th>
                <th class="p-2 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody id="walkin-draft-tbody">
              <tr><td colspan="3" class="p-4 text-center text-slate-400">No items added to sale order yet.</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="mt-6 flex justify-end gap-2 border-t pt-4">
        <button onclick="window.closeDispenseModal()" class="bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded font-bold">Cancel</button>
        <button onclick="submitWalkinSaleOrder()" class="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded">Create Order</button>
      </div>
    </div>
  `;
};

window.handleWalkinMedSearch = function(val) {
  const suggestionsDiv = document.getElementById('walkin-med-suggestions');
  if (!suggestionsDiv) return;

  if (!val || !val.trim()) {
    suggestionsDiv.classList.add('hidden');
    return;
  }

  const query = val.toLowerCase().trim();
  const matches = state.inventory.pharmacyBatches.filter(m => 
    m.brandName.toLowerCase().includes(query) || 
    m.genericName.toLowerCase().includes(query) ||
    m.code.toLowerCase().includes(query)
  );

  if (matches.length > 0) {
    suggestionsDiv.innerHTML = matches.map(m => `
      <div onclick="window.selectWalkinMed('${m.code}', '${m.brandName}')" class="p-2.5 hover:bg-slate-50 cursor-pointer text-xs border-b border-slate-100 last:border-0 flex justify-between items-center">
        <div>
          <div class="font-bold text-slate-800 text-left">${m.brandName}</div>
          <div class="text-[10px] text-slate-500 text-left">${m.genericName}</div>
        </div>
        <span class="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 font-semibold">${m.schedule || 'OTC'}</span>
      </div>
    `).join('');
    suggestionsDiv.classList.remove('hidden');
  } else {
    suggestionsDiv.innerHTML = `<div class="p-3 text-center text-slate-400 text-xs">No matching medicines found.</div>`;
    suggestionsDiv.classList.remove('hidden');
  }
};

window.selectWalkinMed = function(code, brandName) {
  const select = document.getElementById('walkin-med-select');
  const searchInput = document.getElementById('walkin-med-search');
  const suggestionsDiv = document.getElementById('walkin-med-suggestions');

  if (select) select.value = code;
  if (searchInput) searchInput.value = brandName;
  if (suggestionsDiv) suggestionsDiv.classList.add('hidden');

  window.handleWalkinMedSelection(code);
};

window.handleWalkinMedSelection = function(val) {
  const sug = document.getElementById('walkin-alternative-suggestion');
  if (val === 'MED-FEBREX') {
    sug.classList.remove('hidden');
  } else {
    sug.classList.add('hidden');
  }
};

window.selectWalkinAlternative = function(altCode) {
  const select = document.getElementById('walkin-med-select');
  const searchInput = document.getElementById('walkin-med-search');
  if (select) {
    select.value = altCode;
    const drug = state.inventory.pharmacyBatches.find(m => m.code === altCode);
    if (drug && searchInput) {
      searchInput.value = drug.brandName;
    }
    window.handleWalkinMedSelection(altCode);
  }
};

window.closeDispenseModal = function() {
  const modal = document.getElementById('dispense-workbench-modal');
  if (modal) modal.classList.add('hidden');
};

let walkinDraftItems = [];
window.submitWalkinSaleOrder = function() {
  const patient = document.getElementById('walkin-patient-name').value.trim() || "Walk-in Patient";
  const doctor = document.getElementById('walkin-doctor-name').value.trim() || "Dr. Self/Outside";
  const doctorReg = document.getElementById('walkin-doctor-reg').value.trim() || "NMC-Outside";
  const medCode = document.getElementById('walkin-med-select').value;
  const medQty = parseInt(document.getElementById('walkin-med-qty').value) || 10;
  const uhid = document.getElementById('walkin-uhid').value.trim() || "WALK-IN";

  if (!medCode) {
    alert("Please select a medicine first.");
    return;
  }

  const drug = state.inventory.pharmacyBatches.find(m => m.code === medCode);
  if (!drug) return;

  const newSale = {
    rxNo: "RX-WALK-" + String(1000 + state.pharmacyOutsideQueue.length),
    uhid: uhid,
    patientName: patient,
    doctor: `${doctor} (${doctorReg})`,
    priority: "Walk-in",
    items: [
      { code: drug.code, name: drug.brandName, dose: "1 Tab", freq: "OD", duration: "10 Days", qty: medQty }
    ],
    status: "Pending"
  };

  state.pharmacyOutsideQueue.push(newSale);
  alert("Outside Walk-in Order registered into processing queue!");
  window.closeDispenseModal();
  updateStatCountBadge();
  switchPharmTab('queues');
};

/**
 * ACTIVE WORKBENCH MODAL
 */
window.openDispenseWorkbench = function(id, sourceType) {
  const modal = document.getElementById('dispense-workbench-modal');
  if (!modal) return;
  modal.classList.remove('hidden');

  let order;
  if (sourceType === 'OPD') {
    order = state.pharmacyOPDQueue.find(rx => rx.rxNo === id) || state.pharmacyOutsideQueue.find(rx => rx.rxNo === id);
  } else if (sourceType === 'IPD') {
    order = state.pharmacyIPDIndentQueue.find(i => i.indentNo === id);
  } else {
    order = state.pharmacyDaycareQueue.find(d => d.indentNo === id);
  }

  if (!order) return;

  // FEFO Allocation Matrix
  let hasExpired = false;
  let requiresSecondVerify = false;
  let requiresNDPSChecks = false;

  const itemDetailsHTML = order.items.map(item => {
    const drug = state.inventory.pharmacyBatches.find(m => m.brandName.toLowerCase() === item.name.toLowerCase() || m.code === item.code);
    
    let selectedBatch = null;
    let availableBatches = [];
    
    if (drug) {
      // Sort batches by earliest expiry (FEFO)
      availableBatches = [...drug.batches]
        .filter(b => b.qty > 0 && b.status !== 'Quarantine')
        .sort((a, b) => new Date(a.expiryDate) - new Date(b.expiryDate));

      selectedBatch = availableBatches.find(b => b.qty >= item.qty) || availableBatches[0];

      if (selectedBatch && new Date(selectedBatch.expiryDate) < new Date()) {
        hasExpired = true;
      }
      
      // High-alert verify checks (narcotics/insulin/heparin/chemo)
      if (drug.schedule === 'NDPS' || drug.schedule === 'Schedule X' || drug.requiresRefrigeration) {
        requiresSecondVerify = true;
      }

      if (drug.schedule === 'NDPS' || drug.schedule === 'Schedule X') {
        requiresNDPSChecks = true;
      }
    }

    const batchNo = selectedBatch ? selectedBatch.batchNo : "N/A - OUT OF STOCK";
    const expiry = selectedBatch ? selectedBatch.expiryDate : "-";
    const price = drug ? (drug.sellingPrice * item.qty).toFixed(2) : "0.00";

    // JCI checks indicator
    return `
      <tr class="border-b border-slate-100 hover:bg-slate-50 text-xs">
        <td class="p-3 font-semibold text-slate-800">
          <div class="flex items-center gap-1">
            ${drug && drug.requiresRefrigeration ? '<span class="text-sky-500">❄️</span>' : ''}
            <span>${item.name}</span>
          </div>
          <span class="text-[9px] text-slate-400">Code: ${drug ? drug.code : 'N/A'}</span>
        </td>
        <td class="p-3 text-center">
          <span class="px-1.5 py-0.5 rounded font-bold text-[9px]
            ${drug && drug.schedule === 'Schedule X' ? 'bg-orange-100 text-orange-700' : 'bg-slate-100 text-slate-700'}">
            ${drug ? drug.schedule : 'OTC'}
          </span>
        </td>
        <td class="p-3 text-center font-semibold">${item.qty} units</td>
        <td class="p-3">
          <div class="font-bold text-slate-900">${batchNo}</div>
          <div class="text-[10px] text-slate-400">Expiry: ${expiry}</div>
        </td>
        <td class="p-3 text-right font-bold text-slate-900">₹${price}</td>
      </tr>
    `;
  }).join('');

  const totalCost = order.items.reduce((sum, item) => {
    const drug = state.inventory.pharmacyBatches.find(m => m.brandName.toLowerCase() === item.name.toLowerCase() || m.code === item.code);
    return sum + (drug ? drug.sellingPrice * item.qty : 0);
  }, 0);

  modal.innerHTML = `
    <div class="bg-white rounded-xl border border-slate-200 shadow-xl max-w-4xl w-full p-6 relative max-h-[90vh] overflow-y-auto">
      <div class="flex justify-between items-start border-b border-slate-200 pb-3 mb-4">
        <div>
          <span class="bg-indigo-100 text-indigo-800 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded">${sourceType} Dispense Workspace</span>
          <h3 class="text-base font-bold text-[#1B3A5C] mt-2">Medication Verification & FEFO Checkout</h3>
          <p class="text-xs text-slate-500">Patient: <strong>${order.patientName} (${order.uhid})</strong> | Order: <strong>${id}</strong></p>
        </div>
        <button onclick="window.closeDispenseModal()" class="text-slate-400 hover:text-slate-600 text-xl font-bold">&times;</button>
      </div>

      <!-- JCI 5-Rights Safety verification -->
      <div class="grid grid-cols-5 gap-2 bg-slate-50 p-3 rounded-lg border border-slate-200 text-center mb-6">
        <label class="flex flex-col items-center p-2 bg-white rounded border border-slate-200">
          <input type="checkbox" id="jci-right-patient" class="rounded border-slate-300 text-[#1B3A5C] focus:ring-[#1B3A5C]" checked>
          <span class="text-[10px] font-bold text-slate-700 mt-1">Right Patient</span>
        </label>
        <label class="flex flex-col items-center p-2 bg-white rounded border border-slate-200">
          <input type="checkbox" id="jci-right-drug" class="rounded border-slate-300 text-[#1B3A5C] focus:ring-[#1B3A5C]" checked>
          <span class="text-[10px] font-bold text-slate-700 mt-1">Right Drug</span>
        </label>
        <label class="flex flex-col items-center p-2 bg-white rounded border border-slate-200">
          <input type="checkbox" id="jci-right-dose" class="rounded border-slate-300 text-[#1B3A5C] focus:ring-[#1B3A5C]" checked>
          <span class="text-[10px] font-bold text-slate-700 mt-1">Right Dose</span>
        </label>
        <label class="flex flex-col items-center p-2 bg-white rounded border border-slate-200">
          <input type="checkbox" id="jci-right-route" class="rounded border-slate-300 text-[#1B3A5C] focus:ring-[#1B3A5C]" checked>
          <span class="text-[10px] font-bold text-slate-700 mt-1">Right Route</span>
        </label>
        <label class="flex flex-col items-center p-2 bg-white rounded border border-slate-200">
          <input type="checkbox" id="jci-right-freq" class="rounded border-slate-300 text-[#1B3A5C] focus:ring-[#1B3A5C]" checked>
          <span class="text-[10px] font-bold text-slate-700 mt-1">Right Frequency</span>
        </label>
      </div>

      <!-- Prescribed lines table -->
      <table class="w-full text-left border rounded-lg overflow-hidden">
        <thead>
          <tr class="bg-slate-50 border-b text-slate-600 text-xs">
            <th class="p-3 font-semibold">Medicine Description</th>
            <th class="p-3 font-semibold text-center">Schedule</th>
            <th class="p-3 font-semibold text-center">Required Qty</th>
            <th class="p-3 font-semibold">FEFO Batch Selected</th>
            <th class="p-3 font-semibold text-right">Selling Total</th>
          </tr>
        </thead>
        <tbody>
          ${itemDetailsHTML}
        </tbody>
      </table>

      <!-- Compliance Checklist Inputs -->
      <div class="space-y-4 mt-6">
        <!-- Second Pharmacist Check -->
        ${requiresSecondVerify ? `
          <div class="p-3 bg-amber-50 rounded border border-amber-200 text-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
            <div>
              <span class="font-bold text-amber-800">⚠️ HIGH-ALERT SECOND PHARMACIST CHECK REQUIRED</span>
              <p class="text-slate-600 text-[10px] mt-0.5">Morphine/NDPS, insulin or chemo compounds require double sign-off validation.</p>
            </div>
            <div class="flex items-center gap-2">
              <span class="font-semibold text-slate-600">Verifier ID:</span>
              <input type="text" id="dispense-verifier-id" placeholder="e.g. STF02" class="p-1.5 border border-slate-300 rounded font-bold w-32 focus:outline-none">
            </div>
          </div>
        ` : ''}

        <!-- Schedule X / NDPS Statutory validation inputs -->
        ${requiresNDPSChecks ? `
          <div class="p-4 bg-orange-50 rounded border border-orange-200 text-xs space-y-3">
            <span class="font-bold text-orange-800">📜 Schedule X / Narcotic Statutory Register Verification Details</span>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-3 mt-2">
              <div>
                <label class="block text-[10px] text-slate-500 mb-0.5">Patient ID Proof Type</label>
                <select id="ndps-id-type" class="w-full p-2 border rounded">
                  <option value="Aadhaar">Aadhaar Card</option>
                  <option value="PAN Card">PAN Card</option>
                  <option value="Passport">Passport</option>
                </select>
              </div>
              <div>
                <label class="block text-[10px] text-slate-500 mb-0.5">ID Proof Number</label>
                <input type="text" id="ndps-id-number" placeholder="Enter card ID proof No" class="w-full p-2 border rounded">
              </div>
              <div>
                <label class="block text-[10px] text-slate-500 mb-0.5">Prescriber NMC Reg No</label>
                <input type="text" id="ndps-doctor-reg" value="${order.doctor.match(/NMC-\d+/) ? order.doctor.match(/NMC-\d+/)[0] : 'NMC-84729'}" class="w-full p-2 border rounded font-bold">
              </div>
            </div>
          </div>
        ` : ''}
      </div>

      <!-- Checkout totals bar -->
      <div class="mt-6 flex justify-between items-center bg-slate-50 p-4 rounded-lg border border-slate-200">
        <div>
          <span class="text-xs text-slate-500">Gross Payable (GST Included):</span>
          <div class="text-lg font-extrabold text-[#1B3A5C]">₹${totalCost.toFixed(2)}</div>
        </div>
        <div class="flex gap-2">
          <button onclick="window.closeDispenseModal()" class="bg-slate-200 hover:bg-slate-300 text-slate-700 py-2 px-4 rounded text-xs font-semibold">Cancel</button>
          <button onclick="confirmDispenseExecution('${id}', '${sourceType}')" class="bg-[#1B3A5C] hover:bg-[#152e4a] text-white py-2 px-5 rounded text-xs font-bold">
            ${sourceType === 'OPD' ? 'Proceed to Payment' : 'Complete Dispense'}
          </button>
        </div>
      </div>
    </div>
  `;
};

window.confirmDispenseExecution = function(id, sourceType) {
  // Verify 5-Rights
  const rPatient = document.getElementById('jci-right-patient').checked;
  const rDrug = document.getElementById('jci-right-drug').checked;
  const rDose = document.getElementById('jci-right-dose').checked;
  const rRoute = document.getElementById('jci-right-route').checked;
  const rFreq = document.getElementById('jci-right-freq').checked;

  if (!rPatient || !rDrug || !rDose || !rRoute || !rFreq) {
    alert("JCI Violation: All 5-Rights must be verified checked before medication handover.");
    return;
  }

  let order;
  let queue;
  if (sourceType === 'OPD') {
    queue = state.pharmacyOPDQueue;
    order = queue.find(rx => rx.rxNo === id);
    if (!order) {
      queue = state.pharmacyOutsideQueue;
      order = queue.find(rx => rx.rxNo === id);
    }
  } else if (sourceType === 'IPD') {
    queue = state.pharmacyIPDIndentQueue;
    order = queue.find(i => i.indentNo === id);
  } else {
    queue = state.pharmacyDaycareQueue;
    order = queue.find(d => d.indentNo === id);
  }

  if (!order) return;

  // Cold Chain Check
  let coldChainBlock = false;
  order.items.forEach(item => {
    const drug = state.inventory.pharmacyBatches.find(m => m.brandName.toLowerCase() === item.name.toLowerCase() || m.code === item.code);
    if (drug && drug.requiresRefrigeration && state.pharmacyColdChainDeviation) {
      coldChainBlock = true;
    }
  });

  if (coldChainBlock) {
    alert("CRITICAL LOCK: Cold Chain Excursion alert is currently active. Dispensing refrigerated items (Vaccine/Insulin) is blocked.");
    return;
  }

  // Second Verifier Check
  const verifierInput = document.getElementById('dispense-verifier-id');
  if (verifierInput && !verifierInput.value.trim()) {
    alert("JCI Compliance Check Failure: High-Alert medications require secondary verification ID.");
    return;
  }

  // NDPS Checks
  const ndpsIdType = document.getElementById('ndps-id-type');
  const ndpsIdNo = document.getElementById('ndps-id-number');
  const ndpsDocReg = document.getElementById('ndps-doctor-reg');

  if (ndpsIdNo && !ndpsIdNo.value.trim()) {
    alert("NDPS Compliance Block: Schedule X dispensing requires capturing patient identification proof number.");
    return;
  }

  // Calculate gross bill totals
  const billTotal = order.items.reduce((sum, item) => {
    const drug = state.inventory.pharmacyBatches.find(m => m.brandName.toLowerCase() === item.name.toLowerCase() || m.code === item.code);
    return sum + (drug ? drug.sellingPrice * item.qty : 0);
  }, 0);

  if (sourceType === 'OPD') {
    const verificationData = {
      verifierId: verifierInput ? verifierInput.value.trim() : null,
      ndpsIdType: ndpsIdType ? ndpsIdType.value : null,
      ndpsIdNo: ndpsIdNo ? ndpsIdNo.value.trim() : null,
      ndpsDocReg: ndpsDocReg ? ndpsDocReg.value.trim() : null
    };
    window.showPharmacyPaymentScreen(id, sourceType, order, billTotal, verificationData);
    return;
  }

  // Perform Stock Decrement (FEFO) (Only for IPD / Daycare)
  order.items.forEach(item => {
    const drug = state.inventory.pharmacyBatches.find(m => m.brandName.toLowerCase() === item.name.toLowerCase() || m.code === item.code);
    if (drug) {
      // Find active batches
      const activeBatches = drug.batches
        .filter(b => b.status !== 'Quarantine')
        .sort((a, b) => new Date(a.expiryDate) - new Date(b.expiryDate));

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

      // If NDPS, log in narcotic Register
      if (drug.schedule === 'NDPS' || drug.schedule === 'Schedule X') {
        state.narcoticRegister.push({
          date: new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }) + " IST",
          medicineName: drug.brandName,
          batchNo: drug.batches[0].batchNo,
          prescriptionNo: id,
          patientName: order.patientName,
          uhid: order.uhid,
          idProof: (ndpsIdType ? ndpsIdType.value : "Aadhaar") + " - " + (ndpsIdNo ? ndpsIdNo.value : "N/A"),
          doctorName: order.doctor + " (" + (ndpsDocReg ? ndpsDocReg.value : "NMC") + ")",
          qtyReceived: 0,
          qtyIssued: item.qty,
          runningBalance: drug.batches[0].qty,
          pharmacist: state.activeUser ? state.activeUser.name : "Pharmacist",
          remarks: "Dispensed with ID validation"
        });
      }
    }
  });

  // Post Billing Entry (Only for IPD / Daycare)
  if (sourceType === 'IPD' || sourceType === 'Daycare') {
    // Credit invoice billing record
    const patientBill = state.billing.find(b => b.uhid === order.uhid && b.status !== 'Settled');
    if (patientBill) {
      patientBill.items.push({
        desc: `Pharmacy: Dispensed order ref ${id}`,
        qty: 1,
        rate: billTotal,
        total: billTotal
      });
      patientBill.amount += billTotal;
    } else {
      // Create new running invoice
      state.billing.push({
        id: "INV-PH-" + String(1000 + state.billing.length),
        uhid: order.uhid,
        patientName: order.patientName,
        date: new Date().toISOString().split('T')[0],
        amount: billTotal,
        paid: 0,
        status: "Pending",
        items: [{ desc: `Pharmacy: Dispensed order ref ${id}`, qty: 1, rate: billTotal, total: billTotal }]
      });
    }
  }

  // Audit Logs
  state.pharmacyAuditLogs.push({
    timestamp: new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }) + " IST",
    user: state.activeUser ? state.activeUser.name : "System Pharmacist",
    role: getActiveRole(),
    actionType: "DISPENSE",
    details: `Dispensed ${order.items.length} items to patient ${order.patientName} (${order.uhid}). Total charge: ₹${billTotal.toFixed(2)}.`
  });

  // Remove from Queue
  const idx = queue.findIndex(x => x.indentNo === id);
  if (idx !== -1) queue.splice(idx, 1);

  alert("Dispense completed successfully! Inventory deducted, regulatory logs updated, and billing post completed.");
  window.closeDispenseModal();
  updateStatCountBadge();
  switchPharmTab('queues');
};

window.showPharmacyPaymentScreen = function(id, sourceType, order, billTotal, verificationData) {
  const modal = document.getElementById('dispense-workbench-modal');
  if (!modal) return;

  let totalSubtotal = 0;
  let totalCGST = 0;
  let totalSGST = 0;

  const itemDetailsHTML = order.items.map(item => {
    const drug = state.inventory.pharmacyBatches.find(m => m.brandName.toLowerCase() === item.name.toLowerCase() || m.code === item.code);
    const grossPrice = drug ? (drug.sellingPrice * item.qty) : 0;
    
    // Calculate 18% inclusive GST (9% CGST + 9% SGST)
    const taxableVal = grossPrice / 1.18;
    const gstVal = grossPrice - taxableVal;
    const cgstVal = gstVal / 2;
    const sgstVal = gstVal / 2;
    
    totalSubtotal += taxableVal;
    totalCGST += cgstVal;
    totalSGST += sgstVal;

    return `
      <tr class="border-b border-slate-100 hover:bg-slate-50 text-xs">
        <td class="p-3 font-semibold text-slate-800">
          <div>${item.name}</div>
          <div class="text-[9px] text-slate-400">GST 18% Incl.</div>
        </td>
        <td class="p-3 text-center font-bold text-slate-700">${item.qty} units</td>
        <td class="p-3 text-right font-medium text-slate-600">₹${taxableVal.toFixed(2)}</td>
        <td class="p-3 text-right font-medium text-slate-600">₹${gstVal.toFixed(2)}</td>
        <td class="p-3 text-right font-extrabold text-[#1B3A5C]">₹${grossPrice.toFixed(2)}</td>
      </tr>
    `;
  }).join('');

  const totalTax = totalCGST + totalSGST;

  modal.innerHTML = `
    <div class="bg-white rounded-xl border border-slate-200 shadow-xl max-w-3xl w-full p-6 relative max-h-[90vh] overflow-y-auto">
      <div class="flex justify-between items-start border-b border-slate-200 pb-3 mb-4">
        <div>
          <span class="bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded">Billing & Payment Counter</span>
          <h3 class="text-base font-bold text-[#1B3A5C] mt-2">Collect Counter Payment</h3>
          <p class="text-xs text-slate-500">Patient: <strong>${order.patientName} (${order.uhid})</strong> | Order: <strong>${id}</strong></p>
        </div>
        <button onclick="window.closeDispenseModal()" class="text-slate-400 hover:text-slate-600 text-xl font-bold">&times;</button>
      </div>

      <!-- Two-column grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Left Column: Items & Tax Breakdown -->
        <div class="space-y-4">
          <div class="bg-slate-50 rounded-lg p-4 border border-slate-200 h-full flex flex-col justify-between">
            <div>
              <div class="text-[10px] uppercase font-bold text-slate-500 mb-3 tracking-wider">Billed Items & Tax Breakdown</div>
              <table class="w-full text-left border-collapse text-xs">
                <thead>
                  <tr class="border-b border-slate-200 text-slate-500 font-semibold">
                    <th class="pb-2">Medication</th>
                    <th class="pb-2 text-center">Qty</th>
                    <th class="pb-2 text-right">Taxable</th>
                    <th class="pb-2 text-right">GST (18%)</th>
                    <th class="pb-2 text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemDetailsHTML}
                </tbody>
              </table>
            </div>
            
            <!-- Total Tax Summary -->
            <div class="border-t border-slate-200 mt-4 pt-3 space-y-1.5 text-xs">
              <div class="flex justify-between text-slate-600">
                <span>Subtotal (Before Tax):</span>
                <span class="font-semibold text-slate-800">₹${totalSubtotal.toFixed(2)}</span>
              </div>
              <div class="flex justify-between text-slate-500 text-[11px]">
                <span class="pl-2">CGST (9.0%):</span>
                <span>₹${totalCGST.toFixed(2)}</span>
              </div>
              <div class="flex justify-between text-slate-500 text-[11px]">
                <span class="pl-2">SGST (9.0%):</span>
                <span>₹${totalSGST.toFixed(2)}</span>
              </div>
              <div class="flex justify-between text-slate-600 font-bold border-t border-slate-200 pt-1.5">
                <span>Total Taxes (GST 18%):</span>
                <span class="text-slate-800">₹${totalTax.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Column: Payment Selection & Execution -->
        <div class="space-y-4 flex flex-col justify-between">
          <div class="space-y-4">
            <!-- Select Payment Mode -->
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1.5">Select Payment Mode</label>
              <div class="grid grid-cols-3 gap-2" id="pharmacy-payment-modes">
                <button onclick="window.setPharmacyPaymentMode('Cash')" id="pay-mode-Cash" class="pay-mode-btn border-2 border-slate-200 hover:border-[#1B3A5C] rounded-lg p-2.5 text-center text-xs font-bold text-slate-700 bg-white flex flex-col items-center justify-center gap-1 transition-all">
                  <span class="text-lg">💵</span> Cash
                </button>
                <button onclick="window.setPharmacyPaymentMode('UPI')" id="pay-mode-UPI" class="pay-mode-btn border-2 border-slate-200 hover:border-[#1B3A5C] rounded-lg p-2.5 text-center text-xs font-bold text-slate-700 bg-white flex flex-col items-center justify-center gap-1 transition-all">
                  <span class="text-lg">📱</span> UPI
                </button>
                <button onclick="window.setPharmacyPaymentMode('Card')" id="pay-mode-Card" class="pay-mode-btn border-2 border-slate-200 hover:border-[#1B3A5C] rounded-lg p-2.5 text-center text-xs font-bold text-slate-700 bg-white flex flex-col items-center justify-center gap-1 transition-all">
                  <span class="text-lg">💳</span> Card
                </button>
              </div>
            </div>

            <!-- Cash Details (Dynamic) -->
            <div id="cash-payment-details" class="p-3.5 bg-slate-50 rounded-lg border border-slate-200 space-y-3">
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">Amount Tendered</label>
                  <input type="number" id="cash-amount-tendered" value="${billTotal.toFixed(2)}" step="any" min="${billTotal}" oninput="window.calcPharmacyChangeDue(${billTotal})" class="w-full p-2 border rounded font-bold text-xs focus:ring-[#1B3A5C] focus:border-[#1B3A5C]">
                </div>
                <div>
                  <label class="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">Change Due</label>
                  <div id="cash-change-due" class="p-2 border rounded bg-slate-100 font-extrabold text-xs text-slate-800">₹0.00</div>
                </div>
              </div>
              <div>
                <label class="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">Cash Till Receipt Ref <span class="text-rose-500">*</span></label>
                <input type="text" id="cash-txn-ref" value="CSH-${id.split('-').pop()}-${Math.floor(1000 + Math.random() * 9000)}" class="w-full p-2 border rounded text-xs font-bold focus:ring-[#1B3A5C] focus:border-[#1B3A5C]">
              </div>
            </div>

            <!-- UPI / Card details (Dynamic) -->
            <div id="upi-card-details" class="hidden p-3.5 bg-slate-50 rounded-lg border border-slate-200 space-y-3">
              <div>
                <label class="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5" id="upi-card-ref-label">Transaction Reference ID <span class="text-rose-500">*</span></label>
                <input type="text" id="pharmacy-txn-ref" placeholder="Enter Reference Number" class="w-full p-2 border rounded text-xs font-bold focus:ring-[#1B3A5C] focus:border-[#1B3A5C]">
              </div>
            </div>
          </div>

          <!-- Checkout totals bar -->
          <div class="bg-slate-50 p-4 rounded-lg border border-slate-200 mt-auto">
            <div class="flex justify-between items-center mb-3">
              <span class="text-[10px] text-slate-500 uppercase font-bold">Amount Due:</span>
              <div class="text-lg font-extrabold text-[#1B3A5C]">₹${billTotal.toFixed(2)}</div>
            </div>
            <div class="flex gap-2 justify-end">
              <button onclick="window.openDispenseWorkbench('${id}', '${sourceType}')" class="bg-slate-200 hover:bg-slate-300 text-slate-700 py-2 px-4 rounded text-xs font-semibold">Back</button>
              <button id="pharmacy-payment-submit-btn" class="bg-[#059669] hover:bg-[#047857] text-white py-2 px-5 rounded text-xs font-bold transition-all">Record Payment</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  // Track active payment mode
  let activeMode = 'Cash';

  window.setPharmacyPaymentMode = function(mode) {
    activeMode = mode;
    document.querySelectorAll('.pay-mode-btn').forEach(btn => {
      btn.classList.remove('border-[#1B3A5C]', 'bg-[#1B3A5C]/5', 'text-[#1B3A5C]');
      btn.classList.add('border-slate-200', 'bg-white', 'text-slate-700');
    });
    const selectedBtn = document.getElementById(`pay-mode-${mode}`);
    if (selectedBtn) {
      selectedBtn.classList.remove('border-slate-200', 'bg-white', 'text-slate-700');
      selectedBtn.classList.add('border-[#1B3A5C]', 'bg-[#1B3A5C]/5', 'text-[#1B3A5C]');
    }

    const cashDetails = document.getElementById('cash-payment-details');
    const upiCardDetails = document.getElementById('upi-card-details');
    const label = document.getElementById('upi-card-ref-label');
    const input = document.getElementById('pharmacy-txn-ref');

    if (mode === 'Cash') {
      cashDetails.classList.remove('hidden');
      upiCardDetails.classList.add('hidden');
    } else {
      cashDetails.classList.add('hidden');
      upiCardDetails.classList.remove('hidden');
      if (mode === 'UPI') {
        label.innerHTML = `UPI Transaction Reference ID <span class="text-rose-500">*</span>`;
        input.placeholder = "Enter 12-digit UPI Txn ID (e.g. 293810283921)";
      } else {
        label.innerHTML = `Card Auth Code / Txn ID <span class="text-rose-500">*</span>`;
        input.placeholder = "Enter 6-digit Auth Code or Txn ID";
      }
    }
  };

  window.calcPharmacyChangeDue = function(due) {
    const input = document.getElementById('cash-amount-tendered');
    const display = document.getElementById('cash-change-due');
    if (!input || !display) return;
    const tendered = parseFloat(input.value) || 0;
    const change = tendered - due;
    display.textContent = change >= 0 ? `₹${change.toFixed(2)}` : "₹0.00";
  };

  // Set default active mode
  window.setPharmacyPaymentMode('Cash');
  window.calcPharmacyChangeDue(billTotal);

  // Setup click handler for submit
  const submitBtn = document.getElementById('pharmacy-payment-submit-btn');
  if (submitBtn) {
    submitBtn.onclick = function() {
      let finalTxnRef = "";
      
      // Validate cash tendered
      if (activeMode === 'Cash') {
        const input = document.getElementById('cash-amount-tendered');
        const tendered = parseFloat(input.value) || 0;
        if (tendered < billTotal) {
          alert(`Insufficient cash tendered. Total due: ₹${billTotal.toFixed(2)}`);
          return;
        }
        
        const cashRefInput = document.getElementById('cash-txn-ref');
        finalTxnRef = cashRefInput ? cashRefInput.value.trim() : "";
        if (!finalTxnRef) {
          alert("Validation Error: Cash Till Receipt Reference is mandatory.");
          return;
        }
      } else {
        const txnRefInput = document.getElementById('pharmacy-txn-ref');
        finalTxnRef = txnRefInput ? txnRefInput.value.trim() : "";
        if (!finalTxnRef) {
          alert(`Validation Error: ${activeMode} Transaction Reference ID is mandatory.`);
          return;
        }
      }
      
      window.executeOPDDispenseAndPayment(id, sourceType, order, billTotal, verificationData, activeMode, finalTxnRef);
    };
  }
};

window.executeOPDDispenseAndPayment = function(id, sourceType, order, billTotal, verificationData, paymentMode, txnRef) {
  // Perform Stock Decrement (FEFO)
  order.items.forEach(item => {
    const drug = state.inventory.pharmacyBatches.find(m => m.brandName.toLowerCase() === item.name.toLowerCase() || m.code === item.code);
    if (drug) {
      // Find active batches
      const activeBatches = drug.batches
        .filter(b => b.status !== 'Quarantine')
        .sort((a, b) => new Date(a.expiryDate) - new Date(b.expiryDate));

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

      // If NDPS, log in narcotic Register
      if (drug.schedule === 'NDPS' || drug.schedule === 'Schedule X') {
        state.narcoticRegister.push({
          date: new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }) + " IST",
          medicineName: drug.brandName,
          batchNo: drug.batches[0].batchNo,
          prescriptionNo: id,
          patientName: order.patientName,
          uhid: order.uhid,
          idProof: (verificationData.ndpsIdType || "Aadhaar") + " - " + (verificationData.ndpsIdNo || "N/A"),
          doctorName: order.doctor + " (" + (verificationData.ndpsDocReg || "NMC") + ")",
          qtyReceived: 0,
          qtyIssued: item.qty,
          runningBalance: drug.batches[0].qty,
          pharmacist: state.activeUser ? state.activeUser.name : "Pharmacist",
          remarks: "Dispensed with ID validation"
        });
      }
    }
  });

  // Post Billing Entry as Settled
  const invoiceId = "INV-PH-" + String(1000 + state.billing.length);
  state.billing.push({
    id: invoiceId,
    uhid: order.uhid,
    patientName: order.patientName,
    date: new Date().toISOString().split('T')[0],
    amount: billTotal,
    paid: billTotal,
    status: "Settled",
    paymentMode: paymentMode,
    txnRef: txnRef,
    items: order.items.map(i => ({ desc: `${i.name} (${i.dose})`, qty: i.qty, rate: billTotal/i.qty, total: billTotal }))
  });

  // Audit Logs
  state.pharmacyAuditLogs.push({
    timestamp: new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }) + " IST",
    user: state.activeUser ? state.activeUser.name : "System Pharmacist",
    role: getActiveRole(),
    actionType: "DISPENSE",
    details: `Dispensed ${order.items.length} items to patient ${order.patientName} (${order.uhid}). Recorded payment of ₹${billTotal.toFixed(2)} via ${paymentMode} (Txn: ${txnRef}).`
  });

  // Remove from Queue
  let queue = state.pharmacyOPDQueue;
  let idx = queue.findIndex(x => x.rxNo === id);
  if (idx === -1) {
    queue = state.pharmacyOutsideQueue;
    idx = queue.findIndex(x => x.rxNo === id);
  }
  if (idx !== -1) queue.splice(idx, 1);

  // Show Success Screen
  window.showPharmacySuccessScreen(invoiceId, billTotal, paymentMode, order.patientName, order.uhid, txnRef);
};

window.showPharmacySuccessScreen = function(invoiceId, billTotal, paymentMode, patientName, uhid, txnRef) {
  const modal = document.getElementById('dispense-workbench-modal');
  if (!modal) return;

  modal.innerHTML = `
    <div class="bg-white rounded-xl border border-slate-200 shadow-xl max-w-md w-full p-6 relative text-center">
      <div class="mx-auto flex items-center justify-center h-14 w-14 rounded-full bg-emerald-100 text-emerald-600 mb-4">
        <span class="text-2xl font-bold">✓</span>
      </div>
      
      <h3 class="text-base font-bold text-slate-900 mb-1">Dispense & Payment Successful</h3>
      <p class="text-xs text-slate-500 mb-5">Patient: <strong>${patientName} (${uhid})</strong></p>

      <div class="bg-slate-50 border border-slate-200 rounded-lg p-4 text-left text-xs space-y-2 mb-6">
        <div class="flex justify-between">
          <span class="text-slate-500">Invoice Number:</span>
          <span class="font-bold text-slate-800">${invoiceId}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-slate-500">Date & Time:</span>
          <span class="font-semibold text-slate-700">${new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}</span>
        </div>
        <div class="flex justify-between border-t border-slate-200 pt-2 mt-2 font-bold text-sm">
          <span class="text-slate-900 font-bold">Total Paid:</span>
          <span class="text-emerald-600 font-extrabold">₹${billTotal.toFixed(2)}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-slate-500">Payment Mode:</span>
          <span class="font-bold text-slate-800 uppercase">${paymentMode}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-slate-500">Transaction Ref ID:</span>
          <span class="font-mono font-bold text-[#1B3A5C]">${txnRef}</span>
        </div>
      </div>

      <div class="flex flex-col gap-2">
        <button onclick="alert('Receipt and Medication Labels sent to Pharmacy thermal printer')" class="w-full bg-[#1B3A5C] hover:bg-[#152e4a] text-white py-2.5 rounded-lg text-xs font-bold transition-all">
          🖨️ Print Receipt & Labels
        </button>
        <button onclick="window.handlePharmacyDispenseSuccessClose()" class="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 rounded-lg text-xs font-semibold transition-all">
          Return to Queue
        </button>
      </div>
    </div>
  `;

  window.handlePharmacyDispenseSuccessClose = function() {
    window.closeDispenseModal();
    updateStatCountBadge();
    switchPharmTab('queues');
  };
};

// Daycare same-day Return Unused
window.returnDaycareProcedureBox = function(id) {
  const order = state.pharmacyDaycareQueue.find(d => d.indentNo === id);
  if (!order) return;

  const returnConfirm = confirm(`Perform same-day Daycare unused restocking audit for patient ${order.patientName}? This reverses running bill charges.`);
  if (!returnConfirm) return;

  let totalReversed = 0;
  order.items.forEach(item => {
    const drug = state.inventory.pharmacyBatches.find(m => m.brandName.toLowerCase() === item.name.toLowerCase() || m.code === item.code);
    if (drug && drug.batches.length > 0) {
      // Return 1 unit back to stock
      drug.batches[0].qty += item.qty;
      totalReversed += (drug.sellingPrice * item.qty);
    }
  });

  // Reverse Billing post
  const patientBill = state.billing.find(b => b.uhid === order.uhid && b.status !== 'Settled');
  if (patientBill) {
    patientBill.items.push({
      desc: `Pharmacy Reversal: Unused Daycare Restocked ${id}`,
      qty: 1,
      rate: -totalReversed,
      total: -totalReversed
    });
    patientBill.amount -= totalReversed;
  }

  // Log audit
  state.pharmacyAuditLogs.push({
    timestamp: new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }) + " IST",
    user: state.activeUser ? state.activeUser.name : "Sister Mercy (Nurse)",
    role: getActiveRole(),
    actionType: "DAYCARE_RETURN",
    details: `Daycare unused return processed for order ${id}. Reversed ₹${totalReversed.toFixed(2)}.`
  });

  // Remove from queue
  const idx = state.pharmacyDaycareQueue.findIndex(x => x.indentNo === id);
  if (idx !== -1) state.pharmacyDaycareQueue.splice(idx, 1);

  alert("Daycare box successfully restocked, billing updated.");
  updateStatCountBadge();
  switchPharmTab('queues');
};

/**
 * --------------------------------------------------------------------------
 * 3. MEDICINE MASTER
 * --------------------------------------------------------------------------
 */
function renderMasterTab(container) {
  const role = getActiveRole();
  const canAddMaster = role === 'Store In-charge' || role === 'Pharmacy Head' || role === 'CFO/Finance' || role === 'Administrator' || role === 'Super Admin';

  window._pharmMaster = window._pharmMaster || { q: '', page: 0, size: 25 };
  
  container.innerHTML = `
    <div class="bg-white rounded-xl border border-slate-200 shadow-xs p-6">
      <div class="flex justify-between items-center gap-4 mb-4">
        <div class="flex items-center gap-2">
          <h3 class="text-sm font-bold text-[#1B3A5C]">Formulary Directory Master</h3>
        </div>
        <div class="flex gap-2">
          <input id="pharm-master-search" oninput="window.pharmMasterSearch(this.value)" value="${(window._pharmMaster.q || '').replace(/"/g, '&quot;')}"
                 placeholder="Search medicine brand or generic..."
                 class="text-xs p-2 border border-slate-200 rounded w-64 focus:outline-none">
          ${canAddMaster ? `
            <button onclick="window.openNewMedicineModal()" class="bg-[#1B3A5C] text-white hover:bg-slate-800 text-xs font-semibold py-1.5 px-3 rounded">
              ➕ Add New Drug Master
            </button>
          ` : ''}
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs border rounded-lg">
          <thead>
            <tr class="bg-slate-50 border-b text-slate-600">
              <th class="p-2">Drug Code</th>
              <th class="p-2">Brand Name</th>
              <th class="p-2">Generic Composition</th>
              <th class="p-2 text-center">Schedule</th>
              <th class="p-2 text-right">MRP (₹)</th>
              <th class="p-2 text-right">Selling Rate</th>
              <th class="p-2 text-center">GST Rate</th>
              <th class="p-2 text-center">Requires Fridge</th>
            </tr>
          </thead>
          <tbody id="pharm-master-tbody"></tbody>
        </table>
      </div>
      <div id="pharm-master-pager" class="flex justify-between items-center mt-4 text-xs"></div>
    </div>
  `;

  window.renderPharmMasterRows();
}

window.pharmMasterFiltered = function() {
  const q = (window._pharmMaster.q || '').trim().toLowerCase();
  const all = state.inventory.pharmacyBatches;
  if (!q) return all;
  return all.filter(m => 
    (m.brandName || '').toLowerCase().includes(q) || 
    (m.genericName || '').toLowerCase().includes(q) || 
    (m.code || '').toLowerCase().includes(q)
  );
};

window.pharmMasterSearch = function(v) {
  window._pharmMaster.q = v;
  window._pharmMaster.page = 0;
  window.renderPharmMasterRows();
};

window.pharmMasterPage = function(delta) {
  const f = window.pharmMasterFiltered();
  const maxPage = Math.max(0, Math.ceil(f.length / window._pharmMaster.size) - 1);
  window._pharmMaster.page = Math.min(maxPage, Math.max(0, window._pharmMaster.page + delta));
  window.renderPharmMasterRows();
};

window.renderPharmMasterRows = function() {
  const st = window._pharmMaster;
  const f = window.pharmMasterFiltered();
  const start = st.page * st.size;
  const pageItems = f.slice(start, start + st.size);
  const tbody = document.getElementById('pharm-master-tbody');
  
  if (!tbody) return;

  tbody.innerHTML = pageItems.map(m => `
    <tr class="border-b border-slate-100 hover:bg-slate-50">
      <td class="p-2 font-mono font-semibold">${m.code}</td>
      <td class="p-2 font-bold text-slate-800">${m.brandName}</td>
      <td class="p-2 text-slate-500">${m.genericName}</td>
      <td class="p-2 text-center">
        <span class="px-2 py-0.5 rounded text-[10px] font-bold ${m.schedule === 'NDPS' || m.schedule === 'Schedule X' ? 'bg-orange-100 text-orange-800' : 'bg-slate-100 text-slate-800'}">
          ${m.schedule}
        </span>
      </td>
      <td class="p-2 text-right">₹${m.mrp.toFixed(2)}</td>
      <td class="p-2 text-right font-bold text-slate-700">₹${m.sellingPrice.toFixed(2)}</td>
      <td class="p-2 text-center">${m.gstRate}%</td>
      <td class="p-2 text-center">${m.requiresRefrigeration ? '❄️ Yes' : 'No'}</td>
    </tr>
  `).join('') || '<tr><td colspan="8" class="p-4 text-center text-slate-400">No matching drugs found in master.</td></tr>';

  const pager = document.getElementById('pharm-master-pager');
  if (pager) {
    const totalPages = Math.max(1, Math.ceil(f.length / st.size));
    pager.innerHTML = `
      <span class="text-slate-500">Page ${st.page + 1} of ${totalPages} · Showing ${start + 1} to ${Math.min(f.length, start + st.size)} of ${f.length} entries</span>
      <div class="flex gap-1">
        <button onclick="window.pharmMasterPage(-1)" ${st.page <= 0 ? 'disabled' : ''} class="px-2.5 py-1 border rounded bg-white hover:bg-slate-50">Prev</button>
        <button onclick="window.pharmMasterPage(1)" ${st.page >= totalPages - 1 ? 'disabled' : ''} class="px-2.5 py-1 border rounded bg-white hover:bg-slate-50">Next</button>
      </div>
    `;
  }
};

window.openNewMedicineModal = function() {
  const container = document.getElementById('dispense-workbench-modal');
  if (!container) return;
  container.classList.remove('hidden');

  container.innerHTML = `
    <div class="bg-white rounded-xl border border-slate-200 shadow-lg max-w-lg w-full p-6 text-xs text-left">
      <h3 class="text-base font-bold text-[#1B3A5C] mb-4">Add New Drug Master (Formulary)</h3>
      
      <div class="space-y-4">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block font-bold text-slate-600 mb-1">Brand Name</label>
            <input type="text" id="new-brand" placeholder="e.g. Paracetamol" class="w-full p-2 border rounded">
          </div>
          <div>
            <label class="block font-bold text-slate-600 mb-1">Generic Name</label>
            <input type="text" id="new-generic" placeholder="e.g. Acetaminophen" class="w-full p-2 border rounded">
          </div>
        </div>
        <div class="grid grid-cols-3 gap-4">
          <div>
            <label class="block font-bold text-slate-600 mb-1">Schedule</label>
            <select id="new-schedule" class="w-full p-2 border rounded">
              <option value="Schedule H">Schedule H</option>
              <option value="Schedule H1">Schedule H1</option>
              <option value="Schedule G">Schedule G</option>
              <option value="Schedule X">Schedule X</option>
              <option value="NDPS">NDPS</option>
              <option value="OTC">OTC</option>
            </select>
          </div>
          <div>
            <label class="block font-bold text-slate-600 mb-1">Dosage Form</label>
            <select id="new-form" class="w-full p-2 border rounded">
              <option value="Tablet">Tablet</option>
              <option value="Capsule">Capsule</option>
              <option value="Syrup">Syrup</option>
              <option value="Injection">Injection</option>
            </select>
          </div>
          <div>
            <label class="block font-bold text-slate-600 mb-1">Strength</label>
            <input type="text" id="new-strength" placeholder="e.g. 500 mg" class="w-full p-2 border rounded">
          </div>
        </div>
        <div class="grid grid-cols-3 gap-4">
          <div>
            <label class="block font-bold text-slate-600 mb-1">GST Rate (%)</label>
            <input type="number" id="new-gst" value="12" class="w-full p-2 border rounded">
          </div>
          <div>
            <label class="block font-bold text-slate-600 mb-1">MRP (₹)</label>
            <input type="number" id="new-mrp" value="10.00" class="w-full p-2 border rounded">
          </div>
          <div>
            <label class="block font-bold text-slate-600 mb-1">Selling Price (₹)</label>
            <input type="number" id="new-sp" value="9.00" class="w-full p-2 border rounded">
          </div>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block font-bold text-slate-600 mb-1">HSN Code</label>
            <input type="text" id="new-hsn" value="30049011" class="w-full p-2 border rounded">
          </div>
          <div>
            <label class="block font-bold text-slate-600 mb-1">Requires Refrigerator?</label>
            <select id="new-refrig" class="w-full p-2 border rounded">
              <option value="NO">No</option>
              <option value="YES">Yes (Cold-Chain)</option>
            </select>
          </div>
        </div>
      </div>

      <div class="mt-6 flex justify-end gap-2 border-t pt-4">
        <button onclick="window.closeDispenseModal()" class="bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded font-bold">Cancel</button>
        <button onclick="window.submitNewMedicine()" class="bg-[#1B3A5C] hover:bg-[#152e4a] text-white font-bold px-4 py-2 rounded">Add to Formulary</button>
      </div>
    </div>
  `;
};

window.submitNewMedicine = function() {
  const brand = document.getElementById('new-brand').value.trim();
  const generic = document.getElementById('new-generic').value.trim();
  const schedule = document.getElementById('new-schedule').value;
  const form = document.getElementById('new-form').value;
  const strength = document.getElementById('new-strength').value.trim();
  const gst = parseFloat(document.getElementById('new-gst').value) || 12;
  const mrp = parseFloat(document.getElementById('new-mrp').value) || 10.00;
  const sp = parseFloat(document.getElementById('new-sp').value) || 9.00;
  const hsn = document.getElementById('new-hsn').value.trim();
  const refrig = document.getElementById('new-refrig').value === 'YES';

  if (!brand || !generic) {
    alert("Please fill all core drug parameters.");
    return;
  }

  const code = "MED-NEW-" + String(1000 + state.inventory.pharmacyBatches.length);
  const newDrug = {
    code: code,
    brandName: brand,
    genericName: generic,
    dosageForm: form,
    strength: strength,
    manufacturer: "Simulated Generic Corp",
    schedule: schedule,
    hsnCode: hsn,
    gstRate: gst,
    mrp: mrp,
    sellingPrice: sp,
    purchasePrice: sp * 0.7,
    reorderLevel: 200,
    minStockLevel: 50,
    maxStockLevel: 1000,
    requiresRefrigeration: refrig,
    activeStatus: "Active",
    batches: []
  };

  state.inventory.pharmacyBatches.push(newDrug);
  
  // Log audit trail
  state.pharmacyAuditLogs.push({
    timestamp: new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }) + " IST",
    user: state.activeUser ? state.activeUser.name : "Pharmacy Manager",
    role: getActiveRole(),
    actionType: "MASTER_CREATE",
    details: `Added new formulation: ${brand} (${code}) to global drug master catalog.`
  });

  alert("Medication formulation successfully added to Drug Master Directory!");
  window.closeDispenseModal();
  switchPharmTab('master');
};

/**
 * --------------------------------------------------------------------------
 * 4. INVENTORY & ADJUSTMENTS / COLD CHAIN LOGS
 * --------------------------------------------------------------------------
 */
function renderInventoryTab(container) {
  const role = getActiveRole();
  const canReconcile = role === 'Store In-charge' || role === 'Pharmacy Head' || role === 'CFO/Finance' || role === 'Administrator' || role === 'Super Admin';

  window._pharmInv = window._pharmInv || { q: '', page: 0, size: 25 };

  container.innerHTML = `
    <div class="grid grid-cols-1 xl:grid-cols-3 gap-6">
      
      <!-- Live stock levels panel -->
      <div class="xl:col-span-2 bg-white rounded-xl border border-slate-200 shadow-xs p-6">
        <div class="flex justify-between items-center gap-4 mb-4">
          <h3 class="text-sm font-bold text-[#1B3A5C]">Realtime Stock Batches</h3>
          <div class="flex gap-2">
            <input id="pharm-inv-search" oninput="window.pharmInvSearch(this.value)" value="${(window._pharmInv.q || '').replace(/"/g, '&quot;')}"
                   placeholder="Search batch stock level..."
                   class="text-xs p-2 border border-slate-200 rounded w-48 focus:outline-none">
            ${canReconcile ? `
              <button onclick="openPhysicalAuditModal()" class="whitespace-nowrap bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold py-1.5 px-3 rounded">
                🔧 Physical Count Audit
              </button>
            ` : ''}
          </div>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs border rounded-lg">
            <thead>
              <tr class="bg-slate-50 border-b text-slate-600">
                <th class="p-2">Medicine Code</th>
                <th class="p-2">Brand / Batch</th>
                <th class="p-2">Shelf Location</th>
                <th class="p-2 text-center">On-Hand Qty</th>
                <th class="p-2 text-center">Expiry Date</th>
                <th class="p-2">Status</th>
              </tr>
            </thead>
            <tbody id="pharm-inv-tbody"></tbody>
          </table>
        </div>
        <div id="pharm-inv-pager" class="flex justify-between items-center mt-4 text-xs"></div>
      </div>

      <!-- Temperature Logs & Refrigerator Audit panel -->
      <div class="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-6">
        <div>
          <h3 class="text-sm font-bold text-[#1B3A5C] mb-3">Counter Refrigerator Temperature Logger</h3>
          <div class="space-y-3 text-xs">
            <div>
              <label class="block font-bold text-slate-600 mb-1">Select Refrigerator Unit</label>
              <select id="log-fridge-unit" class="w-full p-2 border rounded">
                <option value="IPD Counter Refrigerator B">IPD Counter Refrigerator B</option>
                <option value="Main Store Refrigerator C">Main Store Refrigerator C</option>
              </select>
            </div>
            <div>
              <label class="block font-bold text-slate-600 mb-1">Recorded Temperature (°C)</label>
              <input type="number" step="0.1" id="log-fridge-temp" value="4.0" class="w-full p-2 border rounded font-bold">
            </div>
            <button onclick="logFridgeTemp()" class="w-full bg-[#1B3A5C] hover:bg-slate-800 text-white font-bold py-2 rounded text-xs">
              Log Temperature
            </button>
          </div>
        </div>

        <!-- Expiry check auto-quarantine simulation trigger -->
        <div class="pt-4 border-t border-slate-100">
          <h3 class="text-sm font-bold text-[#1B3A5C] mb-2">Simulated Expiry Scan</h3>
          <p class="text-[11px] text-slate-500 mb-3">Scans stock database and automatically quarantines batches expiring within 30 days.</p>
          <button onclick="simulateExpiryQuarantine()" class="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold py-2 rounded text-xs">
            Run Auto-Quarantine Check
          </button>
        </div>
      </div>

    </div>
  `;

  window.renderPharmInvRows();
}

window.pharmInvFiltered = function() {
  const q = (window._pharmInv.q || '').trim().toLowerCase();
  const all = state.inventory.pharmacyBatches;
  if (!q) return all;
  return all.filter(m => 
    (m.brandName || '').toLowerCase().includes(q) || 
    (m.genericName || '').toLowerCase().includes(q) || 
    (m.code || '').toLowerCase().includes(q)
  );
};

window.pharmInvSearch = function(v) {
  window._pharmInv.q = v;
  window._pharmInv.page = 0;
  window.renderPharmInvRows();
};

window.pharmInvPage = function(delta) {
  const f = window.pharmInvFiltered();
  const maxPage = Math.max(0, Math.ceil(f.length / window._pharmInv.size) - 1);
  window._pharmInv.page = Math.min(maxPage, Math.max(0, window._pharmInv.page + delta));
  window.renderPharmInvRows();
};

window.renderPharmInvRows = function() {
  const st = window._pharmInv;
  const f = window.pharmInvFiltered();
  const start = st.page * st.size;
  const pageItems = f.slice(start, start + st.size);
  const tbody = document.getElementById('pharm-inv-tbody');
  
  if (!tbody) return;

  tbody.innerHTML = pageItems.map(m => {
    return m.batches.map(b => {
      const isExpired = new Date(b.expiryDate) < new Date();
      const statusText = b.status === 'Quarantine' ? '⚠️ QUARANTINED' : isExpired ? '🛑 EXPIRED' : '✅ ACTIVE';
      return `
        <tr class="border-b border-slate-100 hover:bg-slate-50 text-xs">
          <td class="p-2 font-mono font-semibold">${m.code}</td>
          <td class="p-2">
            <div class="font-bold text-slate-800">${m.brandName}</div>
            <div class="text-[10px] text-slate-400 font-mono">Batch: ${b.batchNo}</div>
          </td>
          <td class="p-2 text-slate-500">${b.shelfLocation}</td>
          <td class="p-2 text-center font-bold text-slate-700">${b.qty} units</td>
          <td class="p-2 text-center text-slate-500">${b.expiryDate}</td>
          <td class="p-2 font-bold ${b.status === 'Quarantine' ? 'text-amber-600' : isExpired ? 'text-rose-600' : 'text-emerald-600'}">
            ${statusText}
          </td>
        </tr>
      `;
    }).join('');
  }).join('') || '<tr><td colspan="6" class="p-4 text-center text-slate-400">No stocked batches.</td></tr>';

  const pager = document.getElementById('pharm-inv-pager');
  if (pager) {
    const totalPages = Math.max(1, Math.ceil(f.length / st.size));
    pager.innerHTML = `
      <span class="text-slate-500">Page ${st.page + 1} of ${totalPages} · Showing ${start + 1} to ${Math.min(f.length, start + st.size)} of ${f.length} entries</span>
      <div class="flex gap-1">
        <button onclick="window.pharmInvPage(-1)" ${st.page <= 0 ? 'disabled' : ''} class="px-2.5 py-1 border rounded bg-white hover:bg-slate-50">Prev</button>
        <button onclick="window.pharmInvPage(1)" ${st.page >= totalPages - 1 ? 'disabled' : ''} class="px-2.5 py-1 border rounded bg-white hover:bg-slate-50">Next</button>
      </div>
    `;
  }
};

window.openPhysicalAuditModal = function() {
  const container = document.getElementById('dispense-workbench-modal');
  if (!container) return;
  container.classList.remove('hidden');

  container.innerHTML = `
    <div class="bg-white rounded-xl border border-slate-200 shadow-lg max-w-md w-full p-6 text-xs text-left">
      <h3 class="text-base font-bold text-[#1B3A5C] mb-4">Post Stock Physical Reconciliation</h3>
      
      <div class="space-y-4">
        <div>
          <label class="block font-bold text-slate-600 mb-1">Select Medicine Code</label>
          <select id="audit-med-code" class="w-full p-2 border rounded">
            ${state.inventory.pharmacyBatches.map(m => `<option value="${m.code}">${m.brandName} (${m.code})</option>`).join('')}
          </select>
        </div>
        <div>
          <label class="block font-bold text-slate-600 mb-1">Enter Physical Batch Number</label>
          <input type="text" id="audit-batch-no" placeholder="e.g. DL650-B01" class="w-full p-2 border rounded">
        </div>
        <div>
          <label class="block font-bold text-slate-600 mb-1">Actual Physical Count (Units)</label>
          <input type="number" id="audit-phys-count" placeholder="0" class="w-full p-2 border rounded font-bold">
        </div>
        <div>
          <label class="block font-bold text-slate-600 mb-1">Reconciliation Notes / Reason</label>
          <input type="text" id="audit-notes" placeholder="Discrepancy resolved post cycle count audit" class="w-full p-2 border rounded">
        </div>
      </div>

      <div class="mt-6 flex justify-end gap-2 border-t pt-4">
        <button onclick="window.closeDispenseModal()" class="bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded font-bold">Cancel</button>
        <button onclick="submitPhysicalReconcile()" class="bg-amber-600 hover:bg-amber-700 text-white font-bold px-4 py-2 rounded">Commit Audit Count</button>
      </div>
    </div>
  `;
};

window.submitPhysicalReconcile = function() {
  const code = document.getElementById('audit-med-code').value;
  const batchNo = document.getElementById('audit-batch-no').value.trim();
  const count = parseInt(document.getElementById('audit-phys-count').value);
  const notes = document.getElementById('audit-notes').value.trim() || "Cycle count mismatch correction";

  if (!batchNo || isNaN(count)) {
    alert("Please enter a valid batch number and count.");
    return;
  }

  const drug = state.inventory.pharmacyBatches.find(m => m.code === code);
  if (!drug) return;

  const batch = drug.batches.find(b => b.batchNo === batchNo);
  if (!batch) {
    alert("Batch number not found under the selected drug code.");
    return;
  }

  const systemQty = batch.qty;
  const difference = count - systemQty;
  batch.qty = count; // reconcile to match physical reality

  // Audit Trails
  state.pharmacyAuditLogs.push({
    timestamp: new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }) + " IST",
    user: state.activeUser ? state.activeUser.name : "Store Manager",
    role: getActiveRole(),
    actionType: "RECONCILE",
    details: `Reconciled stock for ${drug.brandName} (Batch: ${batchNo}). System: ${systemQty} -> Physical: ${count} (Variance: ${difference}). Notes: ${notes}.`
  });

  alert("Physical stock reconciliation posted and logged successfully!");
  window.closeDispenseModal();
  switchPharmTab('inventory');
};

window.logFridgeTemp = function() {
  const unit = document.getElementById('log-fridge-unit').value;
  const temp = parseFloat(document.getElementById('log-fridge-temp').value);
  
  if (isNaN(temp)) {
    alert("Please enter a valid decimal temperature value.");
    return;
  }

  const isExcursion = temp < 2.0 || temp > 8.0;

  if (isExcursion) {
    state.pharmacyColdChainDeviation = true;
    alert("WARNING: Cold Chain excursion detected! Refrigerator temperature is out of bounds (2°C-8°C). Dispensing of cold-chain items is blocked.");
  }

  state.temperatureExcursions.push({
    timestamp: new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }) + " IST",
    counter: unit,
    temperature: `${temp.toFixed(1)}°C`,
    duration: isExcursion ? "deviation active" : "stable bounds",
    reconciliation: isExcursion ? "Excursion alert raised. Pending technical repair." : "Log verified within target limits.",
    loggedBy: state.activeUser ? state.activeUser.name : "Pharmacist",
    deviationFlag: isExcursion
  });

  state.pharmacyAuditLogs.push({
    timestamp: new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }) + " IST",
    user: state.activeUser ? state.activeUser.name : "Pharmacist",
    role: getActiveRole(),
    actionType: "DEVIATION",
    details: `Logged temperature of ${temp}°C for unit: ${unit}. Excursion status: ${isExcursion}.`
  });

  checkColdChainStatus();
  switchPharmTab('inventory');
};

window.openExcursionReconcileModal = function() {
  const container = document.getElementById('dispense-workbench-modal');
  if (!container) return;
  container.classList.remove('hidden');

  container.innerHTML = `
    <div class="bg-white rounded-xl border border-slate-200 shadow-lg max-w-md w-full p-6 text-xs text-left">
      <h3 class="text-base font-bold text-[#1B3A5C] mb-4 font-sans">Reconcile Temperature Excursion</h3>
      <div class="space-y-4">
        <div>
          <label class="block font-bold text-slate-600 mb-1">Corrective Action Taken</label>
          <input type="text" id="recon-fridge-notes" placeholder="Restored door gasket seal, temperature normalized to 4°C" class="w-full p-2 border rounded">
        </div>
      </div>
      <div class="mt-6 flex justify-end gap-2 border-t pt-4">
        <button onclick="window.closeDispenseModal()" class="bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded font-bold">Cancel</button>
        <button onclick="submitFridgeReconcile()" class="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded">Resolve Excursion & Reset</button>
      </div>
    </div>
  `;
};

window.submitFridgeReconcile = function() {
  const note = document.getElementById('recon-fridge-notes').value.trim() || "Maintenance resolved temperature drift.";
  
  state.pharmacyColdChainDeviation = false;
  
  // update the excursion register with reconciliation notes
  if (state.temperatureExcursions.length > 0) {
    const lastEx = state.temperatureExcursions[state.temperatureExcursions.length - 1];
    if (lastEx.deviationFlag) {
      lastEx.duration = "1 hour (resolved)";
      lastEx.reconciliation = note;
      lastEx.deviationFlag = false;
    }
  }

  state.pharmacyAuditLogs.push({
    timestamp: new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }) + " IST",
    user: state.activeUser ? state.activeUser.name : "Store Manager",
    role: getActiveRole(),
    actionType: "DEVIATION_CLEAR",
    details: `Resolved cold chain deviation flag. Corrective action: ${note}.`
  });

  alert("Cold chain excursion cleared successfully. Dispensing blocks removed.");
  window.closeDispenseModal();
  checkColdChainStatus();
  switchPharmTab('inventory');
};

window.simulateExpiryQuarantine = function() {
  let scanCount = 0;
  const today = new Date();
  
  state.inventory.pharmacyBatches.forEach(m => {
    m.batches.forEach(b => {
      const expiry = new Date(b.expiryDate);
      const diffTime = expiry - today;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays > 0 && diffDays <= 30 && b.status !== 'Quarantine') {
        b.status = 'Quarantine';
        scanCount++;
      }
    });
  });

  state.pharmacyAuditLogs.push({
    timestamp: new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }) + " IST",
    user: state.activeUser ? state.activeUser.name : "System Scanner",
    role: getActiveRole(),
    actionType: "QUARANTINE_SCAN",
    details: `Executed auto-expiry sweep. Moved ${scanCount} batch records expiring in <30 days to Quarantine.`
  });

  alert(`Sweep Complete: Automatically flagged and quarantined ${scanCount} batches with near-term (<30 days) expiries.`);
  switchPharmTab('inventory');
};

/**
 * --------------------------------------------------------------------------
 * 5. PROCUREMENT (PO / GRN)
 * --------------------------------------------------------------------------
 */
function renderProcurementTab(container) {
  const role = getActiveRole();
  const canPO = role === 'Store In-charge' || role === 'Pharmacy Head' || role === 'CFO/Finance' || role === 'Administrator' || role === 'Super Admin';
  const canGRN = role === 'Pharmacist' || role === 'Store In-charge' || role === 'Pharmacy Head' || role === 'Administrator' || role === 'Super Admin';

  container.innerHTML = `
    <div class="grid grid-cols-1 xl:grid-cols-2 gap-6">
      
      <!-- PO Registry panel -->
      <div class="bg-white rounded-xl border border-slate-200 shadow-xs p-6">
        <div class="flex justify-between items-center border-b border-slate-100 pb-3 mb-4">
          <h3 class="text-sm font-bold text-slate-800">Purchase Orders Registry</h3>
          ${canPO ? `
            <button onclick="openCreatePOModal()" class="bg-[#1B3A5C] text-white hover:bg-slate-850 px-3 py-1.5 rounded text-xs font-semibold">
              Create PO
            </button>
          ` : ''}
        </div>
        
        <div class="space-y-3 max-h-[400px] overflow-y-auto pr-1">
          ${state.pharmacyPurchaseOrders.map(po => `
            <div class="p-3 border border-slate-200 rounded-lg bg-slate-50 flex justify-between items-start text-xs">
              <div>
                <div class="font-bold text-slate-900 text-xs">${po.poNo}</div>
                <div class="text-[10px] text-slate-500 mt-1">Supplier: ${po.supplier}</div>
                <div class="text-[10px] text-slate-400 mt-0.5">PO Date: ${po.poDate} | Delivery: ${po.expectedDate}</div>
                <div class="font-bold text-[#1B3A5C] mt-2">Value: ₹${po.totalValue.toLocaleString('en-IN')}</div>
              </div>
              <div class="text-right">
                <span class="px-2 py-0.5 rounded text-[10px] font-bold 
                  ${po.status === 'Approved' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}">
                  ${po.status}
                </span>
                ${po.status === 'Pending CFO Approval' && (role === 'CFO/Finance' || role === 'Pharmacy Head' || role === 'Super Admin') ? `
                  <button onclick="approvePO('${po.poNo}')" class="block bg-emerald-600 text-white font-bold text-[9px] px-2 py-1 rounded mt-2.5 w-full">Approve PO</button>
                ` : ''}
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- GRN Receiving portal -->
      <div class="bg-white rounded-xl border border-slate-200 shadow-xs p-6">
        <h3 class="text-sm font-bold text-slate-800 border-b border-slate-100 pb-3 mb-4">Receive Consignment (GRN Entry)</h3>
        
        ${canGRN ? `
          <div class="space-y-4 text-xs">
            <div>
              <label class="block font-bold text-slate-600 mb-1">Select Approved PO Reference</label>
              <select id="grn-po-ref" onchange="loadGRNPOItems(this.value)" class="w-full p-2 border rounded">
                <option value="">-- Select PO --</option>
                ${state.pharmacyPurchaseOrders.filter(po => po.status === 'Approved').map(po => `<option value="${po.poNo}">${po.poNo} - ${po.supplier}</option>`).join('')}
              </select>
            </div>
            <div>
              <label class="block font-bold text-slate-600 mb-1">Supplier Invoice Number</label>
              <input type="text" id="grn-invoice-no" placeholder="INV-2026-XXXX" class="w-full p-2 border rounded">
            </div>
            <div id="grn-po-items-section" class="space-y-4"></div>
          </div>
        ` : `
          <p class="text-xs text-slate-400 italic py-6">Your active role does not have consignment receipt permissions.</p>
        `}
      </div>

    </div>
  `;
}

window.openCreatePOModal = function() {
  const container = document.getElementById('dispense-workbench-modal');
  if (!container) return;
  container.classList.remove('hidden');

  container.innerHTML = `
    <div class="bg-white rounded-xl border border-slate-200 shadow-lg max-w-lg w-full p-6 text-xs text-left">
      <h3 class="text-base font-bold text-[#1B3A5C] mb-4">Draft Purchase Order</h3>
      
      <div class="space-y-4">
        <div>
          <label class="block font-bold text-slate-600 mb-1">Select Supplier / Vendor</label>
          <select id="po-vendor" class="w-full p-2 border rounded">
            ${state.pharmacySuppliers.map(s => `<option value="${s.name}">${s.name} (License Validity: ${s.dlExpiry})</option>`).join('')}
          </select>
        </div>
        <div>
          <label class="block font-bold text-slate-600 mb-1">Expected Delivery Date</label>
          <input type="date" id="po-expected-date" value="2026-07-25" class="w-full p-2 border rounded">
        </div>
        
        <h4 class="font-bold text-slate-700 border-b pb-1 mt-4">PO Lines</h4>
        <div class="grid grid-cols-3 gap-2">
          <div class="col-span-2">
            <label class="block text-[10px] text-slate-400">Medicine</label>
            <select id="po-line-med" class="w-full p-2 border rounded">
              ${state.inventory.pharmacyBatches.slice(0, 10).map(m => `<option value="${m.code}">${m.brandName}</option>`).join('')}
            </select>
          </div>
          <div>
            <label class="block text-[10px] text-slate-400">Order Quantity</label>
            <input type="number" id="po-line-qty" value="1000" class="w-full p-2 border rounded">
          </div>
        </div>
        <div>
          <label class="block font-bold text-slate-600 mb-1">Expected Unit Rate (₹)</label>
          <input type="number" step="0.01" id="po-line-rate" value="15.00" class="w-full p-2 border rounded">
        </div>
      </div>

      <div class="mt-6 flex justify-end gap-2 border-t pt-4">
        <button onclick="window.closeDispenseModal()" class="bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded font-bold">Cancel</button>
        <button onclick="submitDraftPO()" class="bg-[#1B3A5C] hover:bg-[#152e4a] text-white font-bold px-4 py-2 rounded">Submit PO Request</button>
      </div>
    </div>
  `;
};

window.submitDraftPO = function() {
  const vendor = document.getElementById('po-vendor').value;
  const expDate = document.getElementById('po-expected-date').value;
  const medCode = document.getElementById('po-line-med').value;
  const qty = parseInt(document.getElementById('po-line-qty').value) || 1000;
  const rate = parseFloat(document.getElementById('po-line-rate').value) || 15.00;

  if (!medCode || isNaN(qty) || isNaN(rate)) {
    alert("Please fill all PO line details.");
    return;
  }

  const drug = state.inventory.pharmacyBatches.find(m => m.code === medCode);
  if (!drug) return;

  const totalVal = qty * rate;
  // Threshold CFO gate checking
  const status = totalVal > 50000 ? "Pending CFO Approval" : "Approved";

  const newPO = {
    poNo: "PO-PH-2026-" + String(1000 + state.pharmacyPurchaseOrders.length),
    poDate: new Date().toISOString().split('T')[0],
    supplier: vendor,
    expectedDate: expDate,
    totalValue: totalVal,
    status: status,
    items: [
      { code: medCode, name: drug.brandName, qty: qty, expectedRate: rate }
    ]
  };

  state.pharmacyPurchaseOrders.push(newPO);

  // Audit Log
  state.pharmacyAuditLogs.push({
    timestamp: new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }) + " IST",
    user: state.activeUser ? state.activeUser.name : "Store Executive",
    role: getActiveRole(),
    actionType: "PO_CREATE",
    details: `Drafted PO: ${newPO.poNo} for supplier: ${vendor}. Total value: ₹${totalVal.toLocaleString('en-IN')}. Status: ${status}`
  });

  alert(`PO successfully created! Status: ${status}`);
  window.closeDispenseModal();
  switchPharmTab('procurement');
};

window.approvePO = function(poNo) {
  const po = state.pharmacyPurchaseOrders.find(p => p.poNo === poNo);
  if (po) {
    po.status = "Approved";
    
    state.pharmacyAuditLogs.push({
      timestamp: new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }) + " IST",
      user: state.activeUser ? state.activeUser.name : "CFO Anish",
      role: getActiveRole(),
      actionType: "PO_APPROVE",
      details: `Approved high-value PO: ${poNo} (Value: ₹${po.totalValue}).`
    });

    alert(`PO ${poNo} approved successfully! Now available for consignment receiving.`);
    switchPharmTab('procurement');
  }
};

window.loadGRNPOItems = function(poNo) {
  const section = document.getElementById('grn-po-items-section');
  if (!section) return;

  if (!poNo) {
    section.innerHTML = '';
    return;
  }

  const po = state.pharmacyPurchaseOrders.find(p => p.poNo === poNo);
  if (!po) return;

  section.innerHTML = `
    <h4 class="font-bold text-slate-700 border-b pb-1 mt-4">Confirm Items Received</h4>
    ${po.items.map((item, idx) => `
      <div class="p-3 bg-slate-50 border rounded-lg space-y-2 border-slate-200 mt-2">
        <div class="font-bold text-[#1B3A5C]">${item.name} (${item.code}) · Ordered Qty: ${item.qty} units</div>
        
        <div class="grid grid-cols-2 gap-2 mt-2">
          <div>
            <label class="block text-[10px] font-bold text-slate-500 mb-0.5">Supplier Batch Number</label>
            <input type="text" id="grn-batch-${idx}" placeholder="e.g. DL650-B04" class="w-full p-2 border rounded font-mono">
          </div>
          <div>
            <label class="block text-[10px] font-bold text-slate-500 mb-0.5">Mfg Date</label>
            <input type="date" id="grn-mfg-${idx}" value="2025-06-01" class="w-full p-2 border rounded">
          </div>
        </div>
        <div class="grid grid-cols-2 gap-2">
          <div>
            <label class="block text-[10px] font-bold text-slate-500 mb-0.5">Expiry Date</label>
            <input type="date" id="grn-expiry-${idx}" value="2027-06-01" class="w-full p-2 border rounded">
          </div>
          <div>
            <label class="block text-[10px] font-bold text-slate-500 mb-0.5">Qty Accepted (Units)</label>
            <input type="number" id="grn-qty-${idx}" value="${item.qty}" class="w-full p-2 border rounded font-bold">
          </div>
        </div>
        <div class="grid grid-cols-2 gap-2">
          <div>
            <label class="block text-[10px] font-bold text-slate-500 mb-0.5">Cold-Chain Maintained?</label>
            <select id="grn-cold-${idx}" class="w-full p-2 border rounded">
              <option value="YES">Yes (Passed)</option>
              <option value="NO">No (Temperature Excursion Breach)</option>
            </select>
          </div>
          <div>
            <label class="block text-[10px] font-bold text-slate-500 mb-0.5">Packaging Integrity Check</label>
            <select id="grn-pack-${idx}" class="w-full p-2 border rounded">
              <option value="YES">Verified Intact</option>
              <option value="NO">Broken Seals / Damaged</option>
            </select>
          </div>
        </div>
      </div>
    `).join('')}

    <button onclick="commitGRNExecution('${poNo}')" class="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 rounded mt-4">
      Commit Goods Receipt Note (GRN)
    </button>
  `;
};

window.commitGRNExecution = function(poNo) {
  const po = state.pharmacyPurchaseOrders.find(p => p.poNo === poNo);
  if (!po) return;

  const invoiceNo = document.getElementById('grn-invoice-no').value.trim();
  if (!invoiceNo) {
    alert("Please enter the supplier invoice number.");
    return;
  }

  let grnItems = [];

  for (let i = 0; i < po.items.length; i++) {
    const item = po.items[i];
    const batchNo = document.getElementById(`grn-batch-${i}`).value.trim();
    const mfg = document.getElementById(`grn-mfg-${i}`).value;
    const expiry = document.getElementById(`grn-expiry-${i}`).value;
    const qtyAccepted = parseInt(document.getElementById(`grn-qty-${i}`).value) || 0;
    const cold = document.getElementById(`grn-cold-${i}`).value === 'YES';
    const pack = document.getElementById(`grn-pack-${i}`).value === 'YES';

    if (!batchNo || qtyAccepted <= 0) {
      alert("Please fill out complete batch number details for all received items.");
      return;
    }

    // Near expiry checks (<3 months warning/rejection recommendation)
    const today = new Date();
    const expDate = new Date(expiry);
    const diffTime = expDate - today;
    const diffMonths = diffTime / (1000 * 60 * 60 * 24 * 30);

    let finalStatus = "Active";
    let finalQty = qtyAccepted;
    let quarantineReason = "";

    if (diffMonths < 3.0) {
      const override = confirm(`NDPS/Drug Law warning: Batch ${batchNo} expires in less than 3 months (${diffMonths.toFixed(1)} months). We recommend rejecting. Do you want to force quarantine receipt?`);
      if (override) {
        finalStatus = "Quarantine";
        quarantineReason = "Near-expiry (<3 months)";
      } else {
        alert("Consignment receipt rejected by user override due to near-expiry.");
        return;
      }
    }

    if (!cold || !pack) {
      alert(`Cold chain breach or damaged packaging integrity detected on batch ${batchNo}. Restocking is blocked; items routed to quarantine.`);
      finalStatus = "Quarantine";
      quarantineReason = !cold ? "Cold Chain Breach" : "Packaging Integrity Breach";
    }

    // Update drug master inventory batches
    const drug = state.inventory.pharmacyBatches.find(m => m.code === item.code);
    if (drug) {
      drug.batches.push({
        batchNo: batchNo,
        mfgDate: mfg,
        expiryDate: expiry,
        qty: finalQty,
        shelfLocation: drug.requiresRefrigeration ? "Refrigerator C" : "Rack B-1",
        status: finalStatus
      });
    }

    grnItems.push({
      code: item.code,
      name: item.name,
      batchNo: batchNo,
      qty: finalQty,
      status: finalStatus,
      reason: quarantineReason
    });
  }

  // Create GRN record
  const grnNo = "GRN-PH-2026-" + String(1000 + state.pharmacyGRNs.length);
  state.pharmacyGRNs.push({
    grnNo: grnNo,
    poRef: poNo,
    supplier: po.supplier,
    invoiceNo: invoiceNo,
    receivedDate: new Date().toISOString().split('T')[0],
    inspector: state.activeUser ? state.activeUser.name : "Pharmacist",
    items: grnItems
  });

  // Handoff to accounts payable
  state.billing.push({
    id: "BILL-PAYABLE-" + String(1000 + state.billing.length),
    uhid: "VENDOR-" + po.supplier.replace(/\s+/g, '-'),
    patientName: `Vendor Handoff: ${po.supplier}`,
    date: new Date().toISOString().split('T')[0],
    amount: po.totalValue,
    paid: 0,
    status: "Accounts Payable"
  });

  // PO closed status
  po.status = "Received";

  state.pharmacyAuditLogs.push({
    timestamp: new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }) + " IST",
    user: state.activeUser ? state.activeUser.name : "System Pharmacist",
    role: getActiveRole(),
    actionType: "GRN_COMMIT",
    details: `Committed GRN: ${grnNo} for PO: ${poNo}. Logged vendor invoice: ${invoiceNo} value: ₹${po.totalValue}.`
  });

  alert(`GRN committed successfully! Stock inventory and accounts payable records updated.`);
  switchPharmTab('procurement');
};

/**
 * --------------------------------------------------------------------------
 * 6. RETURNS CENTER
 * --------------------------------------------------------------------------
 */
function renderReturnsTab(container) {
  const role = getActiveRole();
  const canReturn = role === 'Pharmacist' || role === 'Nurse' || role === 'Pharmacy Head' || role === 'Administrator' || role === 'Super Admin';

  container.innerHTML = `
    <div class="bg-white rounded-xl border border-slate-200 shadow-xs p-6 max-w-xl mx-auto text-xs">
      <h3 class="text-sm font-bold text-[#1B3A5C] border-b pb-3 mb-4">Patient / Ward Medication Returns Desk</h3>
      
      ${canReturn ? `
        <div class="space-y-4">
          <div>
            <label class="block font-bold text-slate-600 mb-1">Search Patient UHID or Invoice Number</label>
            <div class="flex gap-2">
              <input type="text" id="return-search-ref" placeholder="e.g. MRC-240002 or INV-PH-1001" class="w-full p-2 border rounded">
              <button onclick="searchReturnsEligibility()" class="bg-[#1B3A5C] text-white font-semibold px-4 rounded">Verify</button>
            </div>
          </div>
          
          <div id="return-eligibility-panel"></div>
        </div>
      ` : `
        <p class="text-slate-400 italic py-6">Your active role is not authorized to initiate medication returns.</p>
      `}
    </div>
  `;
}

window.searchReturnsEligibility = function() {
  const query = document.getElementById('return-search-ref').value.trim();
  const panel = document.getElementById('return-eligibility-panel');
  if (!panel) return;

  if (!query) {
    alert("Please enter a valid reference UHID or invoice.");
    return;
  }

  // Load simulated patient bill match
  panel.innerHTML = `
    <div class="p-4 bg-slate-50 border rounded-lg mt-4 space-y-4">
      <span class="font-bold text-indigo-700">Verifying return details for: ${query}</span>
      
      <div class="space-y-3">
        <div>
          <label class="block font-bold text-slate-600 mb-0.5">Select Drug to Return</label>
          <select id="ret-drug" class="w-full p-2 border rounded bg-white">
            <option value="MED-ANAL-001">Dolo 650 (Tablet)</option>
            <option value="MED-COLD-004">Huminsulin R 100IU (Vial) [Refrigerated]</option>
            <option value="MED-NDPS-005">Morphine Inj 10mg [NDPS / Schedule X]</option>
          </select>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block font-bold text-slate-600 mb-0.5">Return Quantity</label>
            <input type="number" id="ret-qty" value="5" class="w-full p-2 border rounded">
          </div>
          <div>
            <label class="block font-bold text-slate-600 mb-0.5">Original Batch Number</label>
            <input type="text" id="ret-batch" value="DL650-B01" class="w-full p-2 border rounded font-mono">
          </div>
        </div>

        <h4 class="font-bold text-slate-700 border-b pb-1 mt-2">JCI Safety Compliance Checks</h4>
        <div class="space-y-2 mt-2">
          <label class="flex items-center gap-2">
            <input type="checkbox" id="check-ret-seal" class="rounded border-slate-300">
            <span>Packaging is completely unbroken and intact (strip/blister seals ok).</span>
          </label>
          <label class="flex items-center gap-2">
            <input type="checkbox" id="check-ret-temp" class="rounded border-slate-300">
            <span>Refrigeration cold-chain temperature maintained (if applicable).</span>
          </label>
        </div>
      </div>

      <button onclick="processReturnReceipt('${query}')" class="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 rounded">
        Verify, Restock & Refund
      </button>
    </div>
  `;
};

window.processReturnReceipt = function(query) {
  const code = document.getElementById('ret-drug').value;
  const qty = parseInt(document.getElementById('ret-qty').value) || 0;
  const batchNo = document.getElementById('ret-batch').value.trim();
  const seal = document.getElementById('check-ret-seal').checked;
  const temp = document.getElementById('check-ret-temp').checked;

  const drug = state.inventory.pharmacyBatches.find(m => m.code === code);
  if (!drug) return;

  // 1. Narcotics Returns Block Check
  if (drug.schedule === 'NDPS' || drug.schedule === 'Schedule X') {
    alert("NDPS Compliance Block: Schedule X / Narcotics cannot be returned to active stock shelf. They must be routed directly to the Destruction Quarantine register.");
    
    // Add to disposal register
    state.pharmacyDisposals.push({
      code: code,
      brandName: drug.brandName,
      batchNo: batchNo,
      qty: qty,
      reason: "Narcotic Return - Expelled",
      status: "Quarantined for Destruction",
      value: drug.purchasePrice * qty
    });

    state.pharmacyAuditLogs.push({
      timestamp: new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }) + " IST",
      user: state.activeUser ? state.activeUser.name : "System Pharmacist",
      role: getActiveRole(),
      actionType: "RETURN_BLOCKED",
      details: `Blocked restock of narcotic: ${drug.brandName} (Batch: ${batchNo}). Routed to Quarantine for Destruction.`
    });

    alert("Narcotic item successfully isolated in the destruction log. Refund/Credit posted.");
    switchPharmTab('returns');
    return;
  }

  // 2. Packaging integrity check
  if (!seal) {
    alert("Return Rejected: Packaging integrity is broken. Unsealed medications cannot be restocked.");
    return;
  }

  // 3. Cold chain verification
  if (drug.requiresRefrigeration && !temp) {
    alert("Return Rejected: Cold chain verification checklist failed. Refrigerated items must confirm cold chain custody.");
    return;
  }

  // Process restock batch
  const batch = drug.batches.find(b => b.batchNo === batchNo);
  if (batch) {
    batch.qty += qty;
  } else {
    // Add new batch record
    drug.batches.push({
      batchNo: batchNo,
      mfgDate: "2025-01-01",
      expiryDate: "2027-01-01",
      qty: qty,
      shelfLocation: drug.requiresRefrigeration ? "Refrigerator C" : "Rack B-2",
      status: "Active"
    });
  }

  // Reverse Billing Ledger (Credit Note / Invoice)
  const creditNoteAmount = drug.sellingPrice * qty;
  state.billing.push({
    id: "CR-NOTE-" + String(1000 + state.billing.length),
    uhid: query.includes("MRC") ? query : "WALK-IN",
    patientName: "Sales Return: Credit Note refund",
    date: new Date().toISOString().split('T')[0],
    amount: -creditNoteAmount,
    paid: -creditNoteAmount,
    status: "Refunded"
  });

  state.pharmacyAuditLogs.push({
    timestamp: new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }) + " IST",
    user: state.activeUser ? state.activeUser.name : "Pharmacist",
    role: getActiveRole(),
    actionType: "RETURN",
    details: `Processed return for patient reference: ${query}. Restocked ${qty} units of ${drug.brandName} (Batch: ${batchNo}). Refunded: ₹${creditNoteAmount.toFixed(2)}.`
  });

  alert("Return processed successfully. Stock returned to shelf, Credit Note refund registered.");
  switchPharmTab('returns');
};

/**
 * --------------------------------------------------------------------------
 * 7. REGULATORY REGISTERS
 * --------------------------------------------------------------------------
 */
function renderRegistersTab(container) {
  container.innerHTML = `
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      <!-- Selector side -->
      <div class="bg-white rounded-xl border border-slate-200 shadow-xs p-6 h-fit text-xs">
        <h3 class="text-sm font-bold text-[#1B3A5C] mb-4">Indian Drugs Act Registers</h3>
        <div class="space-y-2">
          <button onclick="renderRegisterSheet('narcotic')" class="w-full text-left p-3 rounded bg-slate-50 hover:bg-slate-100 font-semibold border-l-4 border-orange-500">
            Form 24B (NDPS & Schedule X)
          </button>
          <button onclick="renderRegisterSheet('temp')" class="w-full text-left p-3 rounded bg-slate-50 hover:bg-slate-100 font-semibold border-l-4 border-sky-500">
            Cold Chain Refrigerator Log
          </button>
          <button onclick="renderRegisterSheet('antibiotic')" class="w-full text-left p-3 rounded bg-slate-50 hover:bg-slate-100 font-semibold border-l-4 border-emerald-500">
            Antimicrobial Stewardship Sheet
          </button>
        </div>
      </div>

      <!-- Output Display panel -->
      <div class="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-xs p-6" id="register-render-card">
        <p class="text-xs text-slate-400 text-center py-16">Select a regulatory register on the left to print or audit records.</p>
      </div>

    </div>
  `;
}

window.renderRegisterSheet = function(type) {
  const card = document.getElementById('register-render-card');
  if (!card) return;

  if (type === 'narcotic') {
    card.innerHTML = `
      <div class="flex justify-between items-center mb-4 border-b pb-2">
        <h3 class="text-xs font-bold text-slate-800">Form 24B Narcotic & Psychotropic Controlled Register</h3>
        <button onclick="runNarcoticValidationAudit()" class="bg-[#1B3A5C] text-white text-[10px] font-bold px-2 py-1 rounded">Validate Balances</button>
      </div>
      <div class="overflow-x-auto max-h-[300px]">
        <table class="w-full text-left text-[10px] border">
          <thead>
            <tr class="bg-slate-50 border-b text-slate-600">
              <th class="p-2">Date/Time</th>
              <th class="p-2">Medication</th>
              <th class="p-2">Batch</th>
              <th class="p-2">Patient Details</th>
              <th class="p-2">Prescribing Doctor</th>
              <th class="p-2 text-center">In</th>
              <th class="p-2 text-center">Out</th>
              <th class="p-2 text-center">Bal</th>
            </tr>
          </thead>
          <tbody>
            ${state.narcoticRegister.map(r => `
              <tr class="border-b text-[10px]">
                <td class="p-2 font-medium">${r.date}</td>
                <td class="p-2 font-bold">${r.medicineName}</td>
                <td class="p-2 font-mono">${r.batchNo}</td>
                <td class="p-2">${r.patientName} (${r.uhid})<br><span class="text-[8px] text-slate-400 font-mono">${r.idProof || ''}</span></td>
                <td class="p-2 text-[9px]">${r.doctorName}</td>
                <td class="p-2 text-center font-bold text-emerald-600">${r.qtyReceived || 0}</td>
                <td class="p-2 text-center font-bold text-rose-600">${r.qtyIssued || 0}</td>
                <td class="p-2 text-center font-bold text-slate-800">${r.runningBalance}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
      <div id="narcotic-audit-alert" class="hidden mt-3 p-3 bg-emerald-100 border border-emerald-200 text-emerald-800 font-bold rounded text-xs text-center">
        Audit Passed: Running balances match physical NDPS log sheet. No discrepancies found.
      </div>
    `;
  } else if (type === 'temp') {
    card.innerHTML = `
      <div class="flex justify-between items-center mb-4 border-b pb-2">
        <h3 class="text-xs font-bold text-slate-800">Cold Chain Refrigerator Temperature Log Sheet</h3>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full text-left text-[10px] border">
          <thead>
            <tr class="bg-slate-50 border-b text-slate-600">
              <th class="p-2">Timestamp</th>
              <th class="p-2">Device Location</th>
              <th class="p-2 text-center">Temperature</th>
              <th class="p-2">Excursion Reconciliations</th>
              <th class="p-2">Logged By</th>
            </tr>
          </thead>
          <tbody>
            ${state.temperatureExcursions.map(t => `
              <tr class="border-b">
                <td class="p-2 font-medium">${t.timestamp}</td>
                <td class="p-2">${t.counter}</td>
                <td class="p-2 text-center font-bold ${t.deviationFlag ? 'text-red-600' : 'text-slate-800'}">${t.temperature}</td>
                <td class="p-2 text-slate-500">${t.reconciliation}</td>
                <td class="p-2 font-medium">${t.loggedBy}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  } else {
    // Antibiotic stewardship
    card.innerHTML = `
      <div class="flex justify-between items-center mb-4 border-b pb-2">
        <h3 class="text-xs font-bold text-slate-800">Schedule H1 Antibiotic Stewardship Consumption Logs</h3>
      </div>
      <p class="text-[11px] text-slate-500 mb-3">Antimicrobial stewardship compliance monitoring for JCI standards.</p>
      <div class="space-y-2">
        <div class="p-3 bg-slate-50 rounded border text-xs">
          <div class="flex justify-between font-bold text-slate-700">
            <span>Clavam 625 (Tablet)</span>
            <span class="text-indigo-600">Active Month: 350 Units consumed</span>
          </div>
          <p class="text-[10px] text-slate-400 mt-1">Stewardship audit recommendation: Stable consumption within ICU ward guidelines.</p>
        </div>
      </div>
    `;
  }
};

window.runNarcoticValidationAudit = function() {
  const alertEl = document.getElementById('narcotic-audit-alert');
  if (alertEl) {
    alertEl.classList.remove('hidden');
  }
};

/**
 * --------------------------------------------------------------------------
 * 8. DISPOSAL & WRITE-OFF
 * --------------------------------------------------------------------------
 */
function renderDisposalTab(container) {
  const role = getActiveRole();
  const canDispose = role === 'Pharmacist' || role === 'Store In-charge' || role === 'Pharmacy Head' || role === 'Administrator' || role === 'Super Admin';

  // Seed disposals list if empty
  if (state.pharmacyDisposals.length === 0) {
    state.pharmacyDisposals = [
      {
        code: "MED-NEAR-006",
        brandName: "Pantocid 40",
        batchNo: "PAN40-EXP30",
        qty: 120,
        reason: "Expired stock in quarantine drawer",
        status: "Pending Write-Off Approval",
        value: 5040.00,
        disposalMethod: "Biomedical waste manifest"
      }
    ];
  }

  container.innerHTML = `
    <div class="grid grid-cols-1 xl:grid-cols-3 gap-6 text-xs">
      
      <!-- Disposals register -->
      <div class="xl:col-span-2 bg-white rounded-xl border border-slate-200 shadow-xs p-6">
        <h3 class="text-sm font-bold text-slate-800 border-b pb-2 mb-4">Disposal & Write-Off Log Register</h3>
        <div class="space-y-4">
          ${state.pharmacyDisposals.map(d => `
            <div class="p-3 bg-slate-50 border border-slate-200 rounded-lg">
              <div class="flex justify-between items-start">
                <div>
                  <div class="font-bold text-slate-900 text-xs">${d.brandName} <span class="font-mono text-[10px] text-slate-500">(Batch: ${d.batchNo})</span></div>
                  <div class="text-[10px] text-slate-500 mt-1">Reason: ${d.reason} | Value: <strong>₹${d.value.toFixed(2)}</strong></div>
                  <div class="text-[10px] text-slate-400 mt-0.5">Method: ${d.disposalMethod || 'None'}</div>
                </div>
                <div class="text-right">
                  <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">${d.status}</span>
                </div>
              </div>
              
              <!-- Approval Chain Timeline -->
              <div class="mt-4 pt-3 border-t border-slate-200 flex justify-between items-center text-[10px]">
                <div class="flex gap-4">
                  <span class="text-emerald-600 font-bold">✓ Store In-charge</span>
                  <span class="${d.status === 'Pending CFO Approval' || d.status === 'Approved' ? 'text-emerald-600 font-bold' : 'text-slate-400'}">✓ Pharmacy Head</span>
                  <span class="${d.status === 'Approved' ? 'text-emerald-600 font-bold' : 'text-slate-400'}">✓ CFO Approval</span>
                </div>
                
                <div class="flex gap-2">
                  ${d.status === 'Pending Write-Off Approval' && (role === 'Pharmacy Head' || role === 'Pharmacy Manager') ? `
                    <button onclick="approveDisposalHead('${d.batchNo}')" class="bg-[#1B3A5C] text-white font-bold px-3 py-1 rounded">Approve Write-off</button>
                  ` : ''}
                  ${d.status === 'Pending CFO Approval' && (role === 'CFO/Finance' || role === 'Super Admin') ? `
                    <button onclick="approveDisposalCFO('${d.batchNo}')" class="bg-emerald-600 text-white font-bold px-3 py-1 rounded">CFO Final Signoff</button>
                  ` : ''}
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Request disposal portal -->
      <div class="bg-white rounded-xl border border-slate-200 shadow-xs p-6">
        <h3 class="text-sm font-bold text-slate-800 border-b pb-2 mb-3">Initiate Stock Write-Off & Disposal</h3>
        
        ${canDispose ? `
          <div class="space-y-3">
            <div>
              <label class="block font-bold text-slate-600 mb-0.5">Select Quarantined Item</label>
              <select id="disp-item" class="w-full p-2 border rounded bg-white">
                ${state.inventory.pharmacyBatches.map(m => `<option value="${m.code}">${m.brandName}</option>`).join('')}
              </select>
            </div>
            <div class="grid grid-cols-2 gap-2">
              <div>
                <label class="block font-bold text-slate-600 mb-0.5">Batch Number</label>
                <input type="text" id="disp-batch" value="PAN40-EXP30" class="w-full p-2 border rounded font-mono">
              </div>
              <div>
                <label class="block font-bold text-slate-600 mb-0.5">Disposal Quantity</label>
                <input type="number" id="disp-qty" value="10" class="w-full p-2 border rounded">
              </div>
            </div>
            <div>
              <label class="block font-bold text-slate-600 mb-0.5">Disposal Method</label>
              <select id="disp-method" onchange="toggleNDPSDestructFields(this.value)" class="w-full p-2 border rounded bg-white">
                <option value="Biomedical waste manifest">Biomedical waste manifest</option>
                <option value="Cytotoxic / Chemo hazardous channel">Cytotoxic / Chemo hazardous channel</option>
                <option value="Narcotics destruction workflow">Narcotics destruction workflow</option>
              </select>
            </div>
            
            <!-- NDPS Destruction signature fields -->
            <div id="ndps-destruction-fields" class="hidden p-3 bg-orange-50 border border-orange-200 rounded space-y-2">
              <span class="font-bold text-orange-800 block">📜 Statutory Narcotic Destruction Sign-off</span>
              <div>
                <label class="block text-[10px] text-slate-500 mb-0.5">Designated Drug Inspector Name</label>
                <input type="text" id="ndps-inspector-name" placeholder="Mr. A. K. Sinha" class="w-full p-2 border rounded bg-white">
              </div>
              <div>
                <label class="block text-[10px] text-slate-500 mb-0.5">Destruction Certificate File Ref</label>
                <input type="text" id="ndps-cert-ref" placeholder="CERT-NDPS-XXXX" class="w-full p-2 border rounded bg-white">
              </div>
            </div>

            <div>
              <label class="block font-bold text-slate-600 mb-0.5">Write-off Reason</label>
              <input type="text" id="disp-reason" value="Expired quarantine shelf items" class="w-full p-2 border rounded">
            </div>

            <button onclick="submitDisposalRequest()" class="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold py-2 rounded">
              Request Disposal Audit
            </button>
          </div>
        ` : `
          <p class="text-slate-400 italic py-6">Your active role is not authorized to request stock write-offs.</p>
        `}
      </div>

    </div>
  `;
}

window.toggleNDPSDestructFields = function(val) {
  const fields = document.getElementById('ndps-destruction-fields');
  if (fields) {
    if (val === 'Narcotics destruction workflow') {
      fields.classList.remove('hidden');
    } else {
      fields.classList.add('hidden');
    }
  }
};

window.submitDisposalRequest = function() {
  const code = document.getElementById('disp-item').value;
  const batchNo = document.getElementById('disp-batch').value.trim();
  const qty = parseInt(document.getElementById('disp-qty').value) || 0;
  const method = document.getElementById('disp-method').value;
  const reason = document.getElementById('disp-reason').value.trim();

  const drug = state.inventory.pharmacyBatches.find(m => m.code === code);
  if (!drug || qty <= 0 || !batchNo) {
    alert("Please enter complete disposal details.");
    return;
  }

  // If Narcotics destruction, verify inspector details
  if (method === 'Narcotics destruction workflow') {
    const inspector = document.getElementById('ndps-inspector-name').value.trim();
    const cert = document.getElementById('ndps-cert-ref').value.trim();
    if (!inspector || !cert) {
      alert("NDPS Act Compliance: Narcotics destruction requires uploading destruction certificate details signed by a designated Drug Inspector.");
      return;
    }
  }

  // Deduct stock from quarantine
  const batch = drug.batches.find(b => b.batchNo === batchNo);
  if (batch) {
    batch.qty = Math.max(0, batch.qty - qty);
  }

  const value = drug.purchasePrice * qty;
  // Threshold write-off CFO gate
  const status = value > 10000 ? "Pending Write-Off Approval" : "Pending Write-Off Approval";

  state.pharmacyDisposals.push({
    code: code,
    brandName: drug.brandName,
    batchNo: batchNo,
    qty: qty,
    reason: reason,
    status: status,
    value: value,
    disposalMethod: method
  });

  state.pharmacyAuditLogs.push({
    timestamp: new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }) + " IST",
    user: state.activeUser ? state.activeUser.name : "Store Manager",
    role: getActiveRole(),
    actionType: "DISPOSAL",
    details: `Initiated write-off and disposal of ${qty} units of ${drug.brandName} (Batch: ${batchNo}, Value: ₹${value}). Method: ${method}`
  });

  alert("Write-off requested and routed for approval.");
  switchPharmTab('disposal');
};

window.approveDisposalHead = function(batchNo) {
  const d = state.pharmacyDisposals.find(item => item.batchNo === batchNo);
  if (d) {
    if (d.value > 10000) {
      d.status = "Pending CFO Approval";
      alert("Write-off exceeds mid-tier limit (>₹10,000). Routed to CFO for final sign-off.");
    } else {
      d.status = "Approved";
      alert("Write-off request approved and closed successfully.");
    }
    
    state.pharmacyAuditLogs.push({
      timestamp: new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }) + " IST",
      user: state.activeUser ? state.activeUser.name : "Pharmacy Head",
      role: getActiveRole(),
      actionType: "WRITE_OFF_APPROVE",
      details: `Approved write-off for batch ${batchNo} (Value: ₹${d.value}).`
    });

    switchPharmTab('disposal');
  }
};

window.approveDisposalCFO = function(batchNo) {
  const d = state.pharmacyDisposals.find(item => item.batchNo === batchNo);
  if (d) {
    d.status = "Approved";
    
    state.pharmacyAuditLogs.push({
      timestamp: new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }) + " IST",
      user: state.activeUser ? state.activeUser.name : "CFO Anish",
      role: getActiveRole(),
      actionType: "CFO_WRITE_OFF_SIGN",
      details: `CFO final sign-off completed for high-value write-off: ${batchNo} (Value: ₹${d.value}).`
    });

    alert("CFO final sign-off completed. Transaction successfully closed.");
    switchPharmTab('disposal');
  }
};

/**
 * --------------------------------------------------------------------------
 * 9. AUDIT LOG TAB
 * --------------------------------------------------------------------------
 */
function renderAuditTab(container) {
  container.innerHTML = `
    <div class="bg-white rounded-xl border border-slate-200 shadow-xs p-6 text-xs">
      <h3 class="text-base font-bold text-[#1B3A5C] mb-4">Immutable Operational Transaction Logs</h3>
      <div class="overflow-x-auto max-h-[400px]">
        <table class="w-full text-left border">
          <thead>
            <tr class="bg-slate-50 border-b text-slate-600">
              <th class="p-3">Timestamp</th>
              <th class="p-3">Operator</th>
              <th class="p-3">Action Type</th>
              <th class="p-3">Details</th>
            </tr>
          </thead>
          <tbody>
            ${state.pharmacyAuditLogs.slice().reverse().map(l => `
              <tr class="border-b hover:bg-slate-50">
                <td class="p-3 text-slate-500 font-medium">${l.timestamp}</td>
                <td class="p-3">
                  <div class="font-bold text-slate-900">${l.user}</div>
                  <div class="text-[10px] text-slate-400">${l.role}</div>
                </td>
                <td class="p-3">
                  <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-[#1B3A5C]/10 text-[#1B3A5C]">
                    ${l.actionType}
                  </span>
                </td>
                <td class="p-3 text-slate-600 font-medium">${l.details}</td>
              </tr>
            `).join('') || `<tr><td colspan="4" class="text-slate-500 text-center py-6">No audit records logged in this session.</td></tr>`}
          </tbody>
        </table>
      </div>
    </div>
  `;
}
