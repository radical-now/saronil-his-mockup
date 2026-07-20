/* ==========================================================================
   SARONIL HIS — INVENTORY & MATERIAL MANAGEMENT MODULE
   Route: inventory
   ========================================================================== */

(function () {
  'use strict';

  // Local state variables for filters and interactive items
  var activeTab = 'dashboard';
  var activeRole = 'Store Manager'; // default role
  var detailItemCode = ''; // For Stock Ledger details drawer
  var selectedReorderItem = null; // For Raise PO pre-fill
  var activeIndentType = 'Consumable Indent'; // Consumable Indent | Returnable Request | Purchase Request
  var activeTransferSubTab = 'branch'; // branch | dept | register
  var activeProcureSubTab = 'suppliers'; // suppliers | po | grn | returns | consignment
  var activeAdjustSubTab = 'writeoff'; // writeoff | cycle | recall | condemn
  var activeStatutorySubTab = 'ndps'; // ndps | bmw | balancesheet
  var activeAssetsSubTab = 'register'; // register | issuereturn | breakdown | amc

  // Mini-tabs for Fulfil Request Queue
  var activeFulfilQueueTab = 'consumable'; // consumable | purchase | returnable | branch | cylinder

  // NDPS register state variables
  var ndpsDiscrepancyAlert = false;
  var ndpsLocked = false;
  
  // BMW status
  var bmwBreached = true; // Starts breached as per critical alerts strip

  // Filters for Stock Ledger
  var ledgerCategory = 'All';
  var ledgerLocation = 'All';
  var ledgerStatus = 'All';
  var ledgerOwnership = 'All';
  var ledgerSearch = '';
  var ledgerAsOnDate = ''; // Empty means Today (live stock)
  var ledgerViewMode = 'All'; // All | BySubstore

  // Drafts & Form toggles
  var isNewItemOpen = false;
  var isNewLocationOpen = false;
  var isNewIndentOpen = false;
  var isNewPOOpen = false;
  var isNewGRNOpen = false;
  var isNewAdjustmentOpen = false;
  var isNewTempLogOpen = false;
  var isNewBMWManifestOpen = false;
  var selectedTripId = ''; // Selected indent in Store Manager review
  var activeEditingItemCode = ''; // For editing items in master
  var activeEditingLocationId = ''; // For editing sub-stores

  // Dynamic form state arrays
  var newIndentItems = [];
  var branchTransferDraftItems = [];
  var deptTransferDraftItems = [];
  var branchReqDraftItems = [];
  var branchReqItemQuery = '';
  var branchTransferItemQuery = '';
  var deptTransferItemQuery = '';
  var newPOItems = []; // PO line items
  var newPOItemQuery = '';
  var tempLogItems = [];

  // Setup state registries
  function initInventoryState() {
    if (!window.state) window.state = {};

    // Stock Categories Master Reference
    window.state.invCategories = window.state.invCategories || [
      "Pharmaceuticals", "Surgical Consumables", "BMW Consumables",
      "Implants & Prosthetics", "Medical Gases", "Equipment & Assets",
      "Linen & Housekeeping", "Stationery & Forms", "Dietary Supplies",
      "Office & Admin", "NDPS / Schedule H1"
    ];

    // Seed Location/Sub-store Master
    window.state.invLocations = window.state.invLocations || [
      { id: "LOC-MAIN", name: "Main Store (Central)", type: "Main", staff: "Store Manager", branch: "Bengaluru Campus", status: "Active" },
      { id: "LOC-PHARM", name: "Pharmacy Store", type: "Sub-store", staff: "Sr. Pharmacist Meera", branch: "Bengaluru Campus", status: "Active" },
      { id: "LOC-ICU", name: "ICU Sub-store", type: "Sub-store", staff: "Nurse Kavitha", branch: "Bengaluru Campus", status: "Active" },
      { id: "LOC-OT", name: "OT Sub-store", type: "Sub-store", staff: "OT Coordinator Priya", branch: "Bengaluru Campus", status: "Active" },
      { id: "LOC-WARDM", name: "General Ward Sub-store (M)", type: "Sub-store", staff: "Ward Incharge Ram", branch: "Bengaluru Campus", status: "Active" },
      { id: "LOC-WARDF", name: "General Ward Sub-store (F)", type: "Sub-store", staff: "Ward Incharge Sita", branch: "Bengaluru Campus", status: "Active" },
      { id: "LOC-LAB", name: "Lab Sub-store", type: "Sub-store", staff: "Tech Amit Verma", branch: "Bengaluru Campus", status: "Active" },
      { id: "LOC-DIET", name: "Dietary Store", type: "Sub-store", staff: "Dietician Sunita", branch: "Bengaluru Campus", status: "Active" },
      { id: "LOC-HK", name: "Housekeeping Store", type: "Sub-store", staff: "Supervisor Ravi", branch: "Bengaluru Campus", status: "Active" },
      { id: "LOC-WHITE", name: "Branch: Whitefield Store", type: "Branch", staff: "Manager John", branch: "Whitefield", status: "Active" },
      { id: "LOC-ECITY", name: "Branch: Electronic City Store", type: "Branch", staff: "Manager Anita", branch: "Electronic City", status: "Active" }
    ];

    // Seed Stock items (All Categories)
    window.state.invStock = window.state.invStock || [
      { code: "ITM-DRG-003", name: "Inj. Fentanyl 100mcg", category: "NDPS / Schedule H1", generic: "Fentanyl", brand: "Fent-100", unit: "vials", qty: 25, minFloor: 50, reorder: 80, moq: 50, expiry: "2026-11-15", batch: "BAT-2024-098", location: "Pharmacy Store", ownership: "Owned", rate: 285, coldChain: false, ndps: true, controlled: true, status: "Active" },
      { code: "ITM-DRG-010", name: "Tab Alprazolam 0.5mg", category: "NDPS / Schedule H1", generic: "Alprazolam", brand: "Restyl 0.5", unit: "tablets", qty: 1500, minFloor: 1000, reorder: 2000, moq: 500, expiry: "2027-04-10", batch: "BAT-2025-102", location: "Pharmacy Store", ownership: "Owned", rate: 5, coldChain: false, ndps: true, controlled: true, status: "Active" },
      { code: "ITM-DRG-011", name: "Inj. Morphine Sulfate 10mg", category: "NDPS / Schedule H1", generic: "Morphine", brand: "Morph-10", unit: "vials", qty: 15, minFloor: 30, reorder: 50, moq: 20, expiry: "2026-10-01", batch: "BAT-2024-118", location: "Pharmacy Store", ownership: "Owned", rate: 120, coldChain: false, ndps: true, controlled: true, status: "Active" },
      { code: "ITM-DRG-001", name: "Tab Metformin 500mg", category: "Pharmaceuticals", generic: "Metformin", brand: "Glycomet 500", unit: "tablets", qty: 2500, minFloor: 1000, reorder: 2000, moq: 500, expiry: "2026-09-15", batch: "BAT-2024-441", location: "Pharmacy Store", ownership: "Owned", rate: 2, coldChain: false, ndps: false, controlled: false, status: "Active" },
      { code: "ITM-DRG-002", name: "Inj. Ondansetron 4mg", category: "Pharmaceuticals", generic: "Ondansetron", brand: "Emset 4mg", unit: "vials", qty: 200, minFloor: 100, reorder: 300, moq: 50, expiry: "2026-08-30", batch: "BAT-2025-112", location: "ICU Sub-store", ownership: "Owned", rate: 15, coldChain: true, ndps: false, controlled: false, status: "Active" },
      { code: "ITM-DRG-012", name: "Tab Paracetamol 650mg", category: "Pharmaceuticals", generic: "Paracetamol", brand: "Dolo 650", unit: "tablets", qty: 12000, minFloor: 5000, reorder: 8000, moq: 2000, expiry: "2028-01-20", batch: "BAT-2025-001", location: "Pharmacy Store", ownership: "Owned", rate: 1.5, coldChain: false, ndps: false, controlled: false, status: "Active" },
      { code: "ITM-CSM-003", name: "Sterile Gloves Size 7", category: "Surgical Consumables", generic: "Surgical Gloves", brand: "Ansell Sterile", unit: "pcs", qty: 950, minFloor: 1000, reorder: 2000, moq: 500, expiry: "2028-03-31", batch: "BAT-2025-044", location: "OT Sub-store", ownership: "Owned", rate: 45, coldChain: false, ndps: false, controlled: false, status: "Active" },
      { code: "ITM-CSM-006", name: "BMW Yellow Bag 50L", category: "BMW Consumables", generic: "Yellow Waste Bag", brand: "SafeWaste 50L", unit: "packs", qty: 80, minFloor: 100, reorder: 300, moq: 100, expiry: "2029-01-01", batch: "BAT-2024-440", location: "Main Store", ownership: "Owned", rate: 150, coldChain: false, ndps: false, controlled: false, status: "Active" },
      { code: "ITM-IMP-002", name: "Zimmer Hip Joint Stem", category: "Implants & Prosthetics", generic: "Hip Stem", brand: "Zimmer Titanium", unit: "sets", qty: 0, minFloor: 5, reorder: 10, moq: 1, expiry: "2030-05-20", batch: "B-HIP-991", location: "OT Sub-store", ownership: "Consignment", rate: 56000, coldChain: false, ndps: false, controlled: false, status: "Active" },
      { code: "ITM-IMP-003", name: "Zimmer Knee Plate 4-hole", category: "Implants & Prosthetics", generic: "Knee Plate", brand: "Zimmer Plate", unit: "sets", qty: 3, minFloor: 5, reorder: 8, moq: 2, expiry: "2030-06-10", batch: "B-KNE-882", location: "OT Sub-store", ownership: "Consignment", rate: 42000, coldChain: false, ndps: false, controlled: false, status: "Active" },
      { code: "ITM-GAS-001", name: "O₂ Cylinder (Type B)", category: "Medical Gases", generic: "Oxygen Cylinder", brand: "Linde O2 B", unit: "cylinders", qty: 4, minFloor: 10, reorder: 20, moq: 10, expiry: "2028-12-15", batch: "CYL-9081", location: "ICU Sub-store", ownership: "Owned", rate: 350, coldChain: false, ndps: false, controlled: false, status: "Active" },
      { code: "ITM-LIN-002", name: "Bedsheet (Single)", category: "Linen & Housekeeping", generic: "Single Bed Linen", brand: "Sujata Textiles", unit: "pcs", qty: 45, minFloor: 50, reorder: 100, moq: 100, expiry: "—", batch: "—", location: "Main Store", ownership: "Owned", rate: 250, coldChain: false, ndps: false, controlled: false, status: "Active" }
    ];

    // Seed Budgets
    window.state.invBudgets = window.state.invBudgets || [
      { dept: "ICU", monthlyAlloc: 120000, actual: 98000 },
      { dept: "OT", monthlyAlloc: 250000, actual: 210000 },
      { dept: "General Ward", monthlyAlloc: 80000, actual: 72000 }
    ];

    // Seed Templates
    window.state.invTemplates = window.state.invTemplates || [
      { name: "ICU Weekly Consumables", dept: "ICU", items: [
        { code: "ITM-DRG-002", name: "Inj. Ondansetron 4mg", qty: 20 },
        { code: "ITM-CSM-003", name: "Sterile Gloves Size 7", qty: 100 }
      ] },
      { name: "OT Standard Pre-op Set", dept: "OT", items: [
        { code: "ITM-CSM-003", name: "Sterile Gloves Size 7", qty: 200 },
        { code: "ITM-DRG-003", name: "Inj. Fentanyl 100mcg", qty: 10 }
      ] }
    ];

    // Seed Reservations
    window.state.invReservations = window.state.invReservations || [
      { id: "RES-2026-0001", patientUhid: "SH-2026-00445", procedure: "Ortho Hip Surgery", items: [
        { code: "ITM-IMP-002", name: "Zimmer Hip Joint Stem", qty: 1 }
      ], timeNeeded: "Tomorrow 09:00", active: true }
    ];

    // Seed Indents & Requests
    window.state.invIndents = window.state.invIndents || [
      { id: "IND-2026-0341", type: "Consumable", dept: "ICU", itemsCount: 3, raisedBy: "Sr. Nurse Kavitha", raisedAt: "24 Jun · 09:15", urgency: "URGENT", status: "Pending", notes: "Immediate stock replenishment.", items: [
        { code: "ITM-DRG-003", name: "Inj. Fentanyl 100mcg", req: 10, av: 25, unit: "vials", issueQty: 10, batch: "BAT-2024-098", notes: "" },
        { code: "ITM-CSM-003", name: "Sterile Gloves Size 7", req: 20, av: 950, unit: "pcs", issueQty: 20, batch: "BAT-2025-044", notes: "" },
        { code: "ITM-DRG-002", name: "Inj. Ondansetron 4mg", req: 20, av: 200, unit: "vials", issueQty: 20, batch: "BAT-2025-112", notes: "" }
      ]},
      { id: "IND-2026-0340", type: "Consumable", dept: "OT", itemsCount: 1, raisedBy: "OT Coordinator", raisedAt: "24 Jun · 08:45", urgency: "Routine", status: "Pending", notes: "", items: [
        { code: "ITM-CSM-003", name: "Sterile Gloves Size 7", req: 50, av: 950, unit: "pcs", issueQty: 50, batch: "BAT-2025-044", notes: "" }
      ] },
      { id: "IND-2026-0339", type: "Consumable", dept: "General Ward", itemsCount: 1, raisedBy: "Ward Nurse", raisedAt: "23 Jun · 22:10", urgency: "Routine", status: "Partially Issued", notes: "", items: [
        { code: "ITM-LIN-002", name: "Bedsheet (Single)", req: 10, av: 45, unit: "pcs", issueQty: 5, batch: "BAT-2024-440", notes: "" }
      ] },
      { id: "PR-2026-0012", type: "Purchase", dept: "OT", itemsCount: 1, raisedBy: "OT Head", raisedAt: "22 Jun", urgency: "Routine", status: "Admin Approval pending", notes: "Laparoscopy port set required for OT-3.", items: [
        { name: "Laparoscopy Port Set 10mm", req: 2, category: "Surgical Consumables", rate: 4500, justification: "Required for minimal access surgery expansion." }
      ]},
      { id: "RET-2026-0005", type: "Returnable", dept: "OPD", itemsCount: 1, raisedBy: "OPD Receptionist", raisedAt: "22 Jun", urgency: "Routine", status: "Issued", notes: "Patient transport helper.", items: [
        { code: "AST-002", name: "Wheelchair (Folding)", req: 1, expectedReturn: "27 Jun 2026", patientRef: "SH-2026-00445" }
      ]}
    ];

    // Seed Transfers (both inter-branch + inter-department)
    window.state.invTransfers = window.state.invTransfers || [
      { id: "TRF-2026-0041", type: "Branch", from: "Bengaluru Campus", to: "Whitefield", items: "3 items", value: 12500, status: "In Transit", date: "24 Jun" },
      { id: "TRF-2026-0040", type: "Dept", from: "Pharmacy Store", to: "ICU Sub-store", items: "5 items", value: 1800, status: "Received", date: "23 Jun" }
    ];

    // Seed Purchase Orders (POs)
    window.state.invPOs = window.state.invPOs || [
      { poId: "PO-2026-0041", vendorName: "Pfizer India", date: "24 Jun", items: "Inj. Fentanyl 100mcg", val: 6000, status: "Submitted" }
    ];

    // Seed Goods Receipt Notes (GRNs)
    window.state.invGRNs = window.state.invGRNs || [
      { grnId: "GRN-2026-0091", date: "22 Jun", poId: "PO-2026-0032", vendor: "Ansell Healthcare", value: 18500, status: "Fully Received" }
    ];

    // Consignment stock Zimmer items
    window.state.invConsignments = window.state.invConsignments || [
      { code: "ITM-IMP-002", name: "Zimmer Hip Joint Stem (Titanium)", qty: 3, since: "01 Jun 2026", status: "Available" },
      { code: "ITM-IMP-003", name: "Zimmer Knee Plate 4-hole", qty: 5, since: "01 Jun 2026", status: "Available" }
    ];

    // Seed Suppliers
    window.state.invSuppliers = window.state.invSuppliers || [
      { name: "Pfizer India", category: "Pharmaceuticals / NDPS", contact: "080-4591100", leadTime: "5d", moq: "Per item", active: true, onTimeCount: 14, totalPOs: 15, shortSupplyCount: 0, rejections: 0, rating: 4.8 },
      { name: "Ansell Healthcare", category: "Surgical Consumables", contact: "044-8901234", leadTime: "3d", moq: "500 pcs min", active: true, onTimeCount: 18, totalPOs: 20, shortSupplyCount: 1, rejections: 1, rating: 4.2 },
      { name: "Linde India", category: "Medical Gases", contact: "1800-221199", leadTime: "2d", moq: "10 cylinders", active: true, onTimeCount: 9, totalPOs: 10, shortSupplyCount: 0, rejections: 0, rating: 4.6 },
      { name: "Zimmer Biomet", category: "Implants", contact: "022-7711223", leadTime: "10d", moq: "1 unit", active: true, onTimeCount: 4, totalPOs: 5, shortSupplyCount: 0, rejections: 0, rating: 4.4 }
    ];

    // Seed Statutory Logs
    window.state.invNDPSRegister = window.state.invNDPSRegister || [
      { date: "24 Jun", patient: "Rajesh Kumar", uhid: "SH-2026-04821", doctor: "Dr. Mehta", qty: 2, balance: 23, issuedBy: "Nurse Kavitha", verifiedBy: "Sr. Pharmacist" }
    ];

    window.state.invBMWRegister = window.state.invBMWRegister || [
      { date: "24 Jun", category: "Yellow", item: "BMW Yellow Bag 50L", qtyGen: "12 packs", qtyDisp: "12 packs", method: "CBWTF pickup", auth: "Store Manager" },
      { date: "24 Jun", category: "Red", item: "BMW Red Bag 30L", qtyGen: "8 packs", qtyDisp: "8 packs", method: "CBWTF pickup", auth: "Store Manager" }
    ];

    // Seed Asset register
    window.state.invAssets = window.state.invAssets || [
      { code: "AST-001", name: "Stretcher (Motorised)", category: "Transport", location: "General Ward", status: "Active", date: "Jan 2024", value: 85000, warranty: "Dec 2025", amc: "Yes" },
      { code: "AST-002", name: "Wheelchair (Folding)", category: "Transport", location: "OPD", status: "Active", date: "Mar 2024", value: 12000, warranty: "Mar 2026", amc: "No" },
      { code: "AST-003", name: "BP Monitor (Digital)", category: "Diagnostic", location: "ICU", status: "Active", date: "Jun 2023", value: 8500, warranty: "Jun 2025", amc: "No" },
      { code: "AST-004", name: "Infusion Pump", category: "Therapeutic", location: "ICU", status: "Under Repair", date: "Feb 2023", value: 45000, warranty: "Feb 2025", amc: "Yes" },
      { code: "AST-005", name: "ECG Machine", category: "Diagnostic", location: "OPD", status: "Active", date: "Nov 2022", value: 65000, warranty: "Nov 2024", amc: "Yes" }
    ];

    window.state.invAssetTickets = window.state.invAssetTickets || [
      { ticketId: "TCK-402", asset: "AST-004", description: "Calibration drift in dosing flow", priority: "Critical", status: "Assigned", date: "24 Jun" }
    ];

    window.state.invWriteOffs = window.state.invWriteOffs || [
      { id: "WO-2026-0001", name: "Tab Metformin 500mg", qty: 200, val: 400, reason: "Expired", status: "Approved", authBy: "Store Manager" }
    ];

    window.state.invTempLogs = window.state.invTempLogs || [
      { date: "24 Jun", fridgeId: "COLD-01", morningTemp: 4.2, eveningTemp: 3.8, morningOk: true, eveningOk: true, loggedBy: "Ph. Satish Kumar" }
    ];

    window.state.invBMWManifests = window.state.invBMWManifests || [
      { manifestNo: "BMW-MFT-2026-0340", date: "23 Jun", operator: "Medicare Waste Solutions", vehicleNo: "KA-03-HA-8812", driverName: "Basavaraj", time: "11:45", weight: 32.5, authorizedBy: "Store Manager" }
    ];
  }

  // Inject CSS Styles
  function injectInventoryStyles() {
    if (document.getElementById('inv-styles-v5')) return;
    const style = document.createElement('style');
    style.id = 'inv-styles-v5';
    style.textContent = `
      .inv-alert-strip {
        background-color: var(--color-danger-bg);
        border-left: 4px solid var(--color-danger);
        border-radius: var(--radius-sm);
        padding: 0.75rem 1rem;
        margin-bottom: 1rem;
        font-size: 0.8rem;
        font-weight: 700;
        color: #991b1b;
        display: flex;
        justify-content: space-between;
        align-items: center;
        box-shadow: var(--shadow-sm);
      }
      .badge-darkred {
        background-color: #7f1d1d;
        color: #fca5a5;
      }
      .inv-drawer-item {
        border-bottom: 1px solid var(--border-color);
        padding: 8px 12px;
        cursor: pointer;
      }
      .inv-drawer-item:hover {
        background: var(--bg-base-elevated);
      }
    `;
    document.head.appendChild(style);
  }

  window.views.inventory = function (container, subAnchor, params) {
    var pageTitleEl = document.getElementById('active-page-title');
    if (pageTitleEl) pageTitleEl.textContent = 'Inventory & Material Management';

    initInventoryState();
    injectInventoryStyles();
    
    // Switch to tab if defined in router params
    if (params && params.tab) {
      activeTab = params.tab;
    }

    renderInventoryLayout(container);
  };

  function renderInventoryLayout(container) {
    var html = `
      <div class="amb-wrap">
        <!-- HEADER WITH ROLE SWITCHER -->
        <div style="display:flex; justify-content:space-between; align-items:center; background:var(--bg-surface); border:1px solid var(--border-color); padding:1rem 1.5rem; border-radius:var(--radius-md); box-shadow:var(--shadow-sm);">
          <div>
            <h2 style="margin:0; font-size:1.2rem; font-weight:700; color:var(--text-primary); display:flex; align-items:center; gap:8px;">📦 Saronil Health HIS — Materials & Supply Ledger</h2>
            <div style="font-size:0.75rem; color:var(--text-muted); font-weight:500; margin-top:2px;">Statutory Registers · Consignments · Asset Warranties · Physical Audits</div>
          </div>
          
          <div style="display:flex; align-items:center; gap:16px;">
            <div style="display: flex; align-items: center; gap: 0.5rem;">
              <span class="form-label" style="margin: 0; white-space: nowrap; font-weight:600;">Active Role:</span>
              <select id="inv-role-selector" class="form-select" style="padding: 0.35rem 1.75rem 0.35rem 0.75rem; width: auto; font-size: 0.8rem; font-weight: 600;" onchange="window.switchInventoryRole(this.value)">
                <option value="Store Manager" ${activeRole === 'Store Manager' ? 'selected' : ''}>Store Manager</option>
                <option value="Procurement Officer" ${activeRole === 'Procurement Officer' ? 'selected' : ''}>Procurement Officer</option>
                <option value="Department Head" ${activeRole === 'Department Head' ? 'selected' : ''}>Department Head</option>
                <option value="Pharmacist" ${activeRole === 'Pharmacist' ? 'selected' : ''}>Pharmacist</option>
                <option value="Administrator" ${activeRole === 'Administrator' ? 'selected' : ''}>Administrator</option>
              </select>
            </div>
          </div>
        </div>

        <!-- STICKY TAB CONTAINER -->
        <div class="tab-container" style="position: sticky; top: -1.5rem; background: var(--bg-base); z-index: 10; padding: 10px 0; margin-bottom: 0.5rem; margin-top: -8px;">
          ${renderTabHeaders()}
        </div>

        <!-- ACTIVE VIEW WORKSPACE -->
        <div id="inv-tab-content">
          ${renderActiveTabContent()}
        </div>
      </div>
    `;

    container.innerHTML = html;
  }

  // Switch Tab
  window.switchInventoryTab = function(tab) {
    activeTab = tab;
    // reset form toggles on switch
    isNewItemOpen = false;
    isNewLocationOpen = false;
    isNewIndentOpen = false;
    isNewPOOpen = false;
    isNewGRNOpen = false;
    isNewAdjustmentOpen = false;
    renderInventoryLayout(document.getElementById('main-content'));
  };

  // Switch Role
  window.switchInventoryRole = function(role) {
    activeRole = role;
    if (role === 'Department Head') activeTab = 'indent';
    else if (role === 'Procurement Officer') activeTab = 'procure';
    else if (role === 'Pharmacist') activeTab = 'statutory';
    else activeTab = 'dashboard';

    renderInventoryLayout(document.getElementById('main-content'));
  };

  // Render tab list headers dynamically
  function renderTabHeaders() {
    var tabs = [
      { id: 'dashboard', name: '📊 Dashboard' },
      { id: 'ledger', name: '📦 Stock Ledger' },
      { id: 'indent', name: '📋 Indent & Issue' },
      { id: 'requests', name: '📥 My Requests' },
      { id: 'transfer', name: '🔄 Inter-Transfer' },
      { id: 'procure', name: '🛒 Procurement' },
      { id: 'adjust', name: '⚖ Adjustments' },
      { id: 'statutory', name: '📜 Statutory Registers' },
      { id: 'assets', name: '🔧 Assets' },
      { id: 'reports', name: '📈 Reports' }
    ];

    return tabs.map(t => `
      <div class="tab-item ${activeTab === t.id ? 'active' : ''}" style="cursor:pointer;" onclick="window.switchInventoryTab('${t.id}')">
        ${t.name}
      </div>
    `).join('');
  }

  function renderActiveTabContent() {
    switch (activeTab) {
      case 'dashboard': return renderDashboardTab();
      case 'ledger': return renderStockLedgerTab();
      case 'indent': return renderIndentTab();
      case 'requests': return renderMyRequestsTab();
      case 'transfer': return renderTransferTab();
      case 'procure': return renderProcurementTab();
      case 'adjust': return renderAdjustmentsTab();
      case 'statutory': return renderStatutoryTab();
      case 'assets': return renderAssetsTab();
      case 'reports': return renderReportsTab();
      default: return renderDashboardTab();
    }
  }

  /* ==========================================================================
     TAB 1 — DASHBOARD
     ========================================================================== */
  function renderDashboardTab() {
    // 1A — Critical Alert Strip
    var criticalAlertsHTML = '';
    
    if (bmwBreached) {
      criticalAlertsHTML += `
        <div class="inv-alert-strip">
          <span>🚨 STATUTORY BREACH — BMW Yellow Bag 50L: Stock 80 packs, minimum 100 packs (BMW Rules 2016).</span>
          <button class="btn btn-primary btn-sm" style="background:#fff; color:#991b1b; border:1px solid #fca5a5; font-weight:700;" onclick="window.resolveBmwBreach()">Raise PO Now</button>
        </div>
      `;
    }

    if (ndpsLocked) {
      criticalAlertsHTML += `
        <div class="inv-alert-strip" style="background-color:#fee2e2; border-left-color:#ef4444; color:#b91c1c;">
          <span>🚨 NDPS Register — Physical count mismatch alert flagged. Audit required.</span>
          <button class="btn btn-secondary btn-sm" style="background:#fff; color:#b91c1c; border-color:#fca5a5; font-weight:700;" onclick="window.resolveNDPSLock()">Resolve Discrepancy</button>
        </div>
      `;
    }

    // 1B — Stat Cards Row (8 cards) — LIVE computed from state
    var _lowStock = window.state.invStock.filter(s => s.qty < s.minFloor).length;
    var _nearExpiry = window.state.invStock.filter(s => s.expiry && s.expiry !== '—' && (() => {
      var d = new Date(s.expiry); var now = new Date();
      return (d - now) / 86400000 < 90 && (d - now) / 86400000 > 0;
    })()).length;
    var _pendingIndents = window.state.invIndents.filter(i => i.status === 'Pending' || i.status === 'Partially Issued').length;
    var _pendingPOs = window.state.invPOs.filter(p => p.status === 'Submitted' || p.status === 'Pending').length;
    var _inTransit = window.state.invTransfers.filter(t => t.status === 'In Transit').length;
    var _condemned = window.state.invAssets.filter(a => a.status === 'Condemned').length;
    var _ownedVal = window.state.invStock.filter(s => s.ownership === 'Owned').reduce((acc, s) => acc + (s.qty * s.rate), 0);
    var _consignVal = window.state.invConsignments.reduce((acc, c) => acc + (c.qty * 56000), 0);

    var statsHTML = `
      <div class="stats-grid" style="grid-template-columns: repeat(4, 1fr); gap: 1rem; margin-bottom: 1.5rem;">
        <div class="stat-card" style="cursor:pointer;" onclick="window.switchInventoryTab('ledger')">
          <div class="stat-info">
            <span class="stat-label">Owned Valuation</span>
            <span class="stat-value" style="font-size:1.35rem;">₹${_ownedVal.toLocaleString('en-IN')}</span>
          </div>
        </div>
        <div class="stat-card" style="cursor:pointer;" onclick="window.switchInventoryTab('ledger')">
          <div class="stat-info">
            <span class="stat-label">Consignment Value</span>
            <span class="stat-value" style="font-size:1.35rem; color:var(--primary);">₹${_consignVal.toLocaleString('en-IN')}</span>
          </div>
        </div>
        <div class="stat-card" style="cursor:pointer;" onclick="window.filterLedger('Low')">
          <div class="stat-info">
            <span class="stat-label">Low Stock Items</span>
            <span class="stat-value" style="font-size:1.35rem; color:var(--color-danger);">${_lowStock} Items</span>
          </div>
        </div>
        <div class="stat-card" style="cursor:pointer;" onclick="window.filterLedger('Expiry')">
          <div class="stat-info">
            <span class="stat-label">Near Expiry (&lt;90d)</span>
            <span class="stat-value" style="font-size:1.35rem; color:var(--color-warning);">${_nearExpiry} Batches</span>
          </div>
        </div>
        
        <div class="stat-card" style="cursor:pointer;" onclick="window.switchInventoryTab('indent')">
          <div class="stat-info">
            <span class="stat-label">Pending Indents</span>
            <span class="stat-value" style="font-size:1.35rem; ${_pendingIndents > 0 ? 'color:var(--color-warning);' : ''}">${_pendingIndents} Awaiting</span>
          </div>
        </div>
        <div class="stat-card" style="cursor:pointer;" onclick="window.switchInventoryTab('procure')">
          <div class="stat-info">
            <span class="stat-label">Pending POs</span>
            <span class="stat-value" style="font-size:1.35rem;">${_pendingPOs} Active</span>
          </div>
        </div>
        <div class="stat-card" style="cursor:pointer;" onclick="window.switchInventoryTab('transfer')">
          <div class="stat-info">
            <span class="stat-label">In-Transit Transfers</span>
            <span class="stat-value" style="font-size:1.35rem; ${_inTransit > 0 ? 'color:var(--color-warning);' : ''}">${_inTransit} In Transit</span>
          </div>
        </div>
        <div class="stat-card" style="cursor:pointer;" onclick="window.switchInventoryTab('assets')">
          <div class="stat-info">
            <span class="stat-label">Condemned Assets</span>
            <span class="stat-value" style="font-size:1.35rem; ${_condemned > 0 ? 'color:var(--color-danger);' : ''}">${_condemned} Flagged</span>
          </div>
        </div>
      </div>
    `;

    // 1C — Reorder Advisory Table
    var reorderAdvisories = [
      { code: "ITM-DRG-003", name: "Inj. Fentanyl 100mcg", category: "NDPS", qty: 25, daysStock: 1, leadTime: 5, moq: 50, trigger: "LEAD TIME TRIGGER" },
      { code: "ITM-CSM-003", name: "Sterile Gloves Size 7", category: "Surgical", qty: 950, daysStock: 3, leadTime: 3, moq: 500, trigger: "MIN FLOOR BREACH" },
      { code: "ITM-CSM-006", name: "BMW Yellow Bag 50L", category: "BMW", qty: 80, daysStock: 3, leadTime: 2, moq: 100, trigger: "STATUTORY BREACH" },
      { code: "ITM-IMP-002", name: "Zimmer Hip Joint Stem", category: "Implants", qty: 0, daysStock: 0, leadTime: 10, moq: 1, trigger: "MIN FLOOR BREACH" },
      { code: "ITM-GAS-001", name: "O₂ Cylinder (Type B)", category: "Gas", qty: 4, daysStock: 2, leadTime: 3, moq: 10, trigger: "LEAD TIME TRIGGER" },
      { code: "ITM-LIN-002", name: "Bedsheet (Single)", category: "Linen", qty: 45, daysStock: 5, leadTime: 7, moq: 100, trigger: "LEAD TIME TRIGGER" }
    ];

    var reorderRows = reorderAdvisories.map(a => {
      var badgeClass = a.trigger === 'STATUTORY BREACH' ? 'badge-danger badge-darkred' : (a.trigger === 'MIN FLOOR BREACH' ? 'badge-danger' : 'badge-warning');
      return `
        <tr style="border-bottom: 1px solid var(--border-color);">
          <td style="padding: 10px;" class="mono">${a.code}</td>
          <td style="padding: 10px; font-weight:700;">${a.name}</td>
          <td style="padding: 10px;"><span class="badge badge-purple">${a.category}</span></td>
          <td style="padding: 10px;" class="mono">${a.qty}</td>
          <td style="padding: 10px;">${a.daysStock}d</td>
          <td style="padding: 10px;">${a.leadTime}d</td>
          <td style="padding: 10px;">${a.moq}</td>
          <td style="padding: 10px;"><span class="badge ${badgeClass}">${a.trigger}</span></td>
          <td style="padding: 10px; text-align:right;"><button class="btn btn-secondary btn-sm" onclick="window.raisePOPreFill('${a.code}')">Raise PO</button></td>
        </tr>
      `;
    }).join('');

    var mainGridHTML = `
      <div class="dashboard-row" style="grid-template-columns: 2.2fr 1fr; gap:1.5rem; margin-bottom:1.5rem;">
        <!-- Left: Reorder Table -->
        <div class="card" style="box-shadow:var(--shadow-sm);">
          <div class="card-header">
            <h3 class="card-title">🚨 REORDER ADVISORIES (Lead Time Factored)</h3>
          </div>
          <div class="custom-table-container">
            <table class="custom-table">
              <thead>
                <tr>
                  <th>Item Code</th>
                  <th>Brand/Generic</th>
                  <th>Category</th>
                  <th>Owned Qty</th>
                  <th>Days Stock</th>
                  <th>Lead Time</th>
                  <th>MOQ</th>
                  <th>Trigger</th>
                  <th style="text-align:right;">Action</th>
                </tr>
              </thead>
              <tbody>
                ${reorderRows}
              </tbody>
            </table>
          </div>
        </div>

        <!-- Right: Expiry Watchlist -->
        <div class="card" style="box-shadow:var(--shadow-sm); max-height: 400px; overflow-y: auto;">
          <div class="card-header">
            <h3 class="card-title">⏳ Batch Expiry Watchlist (&lt;90 days)</h3>
          </div>
          <div style="padding:1rem; display:flex; flex-direction:column; gap:10px;">
            <div style="border: 1px solid var(--border-color); padding: 8px; border-radius: var(--radius-sm); font-size: 0.78rem;">
              <strong>Tab Metformin 500mg</strong><br>
              Batch: <span class="mono">BAT-2024-441</span> · Qty: 200<br>
              Expiry: <span style="color:var(--color-danger); font-weight:700;">15 Sep 2026</span> (83 days left)
            </div>
            <div style="border: 1px solid var(--border-color); padding: 8px; border-radius: var(--radius-sm); font-size: 0.78rem;">
              <strong>Inj. Ondansetron 4mg</strong><br>
              Batch: <span class="mono">BAT-2025-112</span> · Qty: 48<br>
              Expiry: <span style="color:var(--color-danger); font-weight:700;">30 Aug 2026</span> (67 days left)
            </div>
          </div>
        </div>
      </div>
    `;

    // 1E — Pending Indents summary
    var indentsRows = window.state.invIndents.filter(i => i.status === 'Pending').map(ind => `
      <tr style="border-bottom: 1px solid var(--border-color);">
        <td class="mono" style="padding:10px;">${ind.id}</td>
        <td style="padding:10px; font-weight:700;">${ind.dept}</td>
        <td style="padding:10px;">${ind.itemsCount} Items</td>
        <td style="padding:10px;">${ind.raisedBy}</td>
        <td style="padding:10px;" class="mono">${ind.raisedAt}</td>
        <td style="padding:10px;"><span class="badge ${ind.urgency === 'URGENT' ? 'badge-danger' : 'badge-primary'}">${ind.urgency}</span></td>
        <td style="padding:10px; text-align:right;">
          <button class="btn btn-secondary btn-sm" onclick="window.reviewIndentFromDashboard('${ind.id}')">Review</button>
        </td>
      </tr>
    `).join('');

    var bottomHTML = `
      <div class="card" style="box-shadow:var(--shadow-sm); margin-bottom:1.5rem;">
        <div class="card-header">
          <h3 class="card-title">📋 Pending Indent Summary</h3>
        </div>
        <div class="custom-table-container">
          <table class="custom-table">
            <thead>
              <tr>
                <th>Indent ID</th>
                <th>Dept</th>
                <th>Items</th>
                <th>Raised By</th>
                <th>Raised At</th>
                <th>Urgency</th>
                <th style="text-align:right;">Action</th>
              </tr>
            </thead>
            <tbody>
              ${indentsRows || `<tr><td colspan="7" style="text-align:center; padding:20px; color:var(--text-muted);">No pending indents in queue.</td></tr>`}
            </tbody>
          </table>
        </div>
      </div>
    `;

    // 1F — Pending Approvals (Admin role only)
    var adminApprovalsHTML = '';
    if (activeRole === 'Administrator') {
      var writeOffsCount = window.state.invWriteOffs.filter(w => w.status.includes('Pending')).length;
      var purchaseRequestsCount = window.state.invIndents.filter(i => i.type === 'Purchase' && i.status.includes('pending')).length;
      var branchTransfersCount = window.state.invTransfers.filter(t => t.type === 'Branch' && t.status.includes('Transit')).length;

      adminApprovalsHTML = `
        <div class="card" style="box-shadow:var(--shadow-sm); padding:1.25rem; margin-bottom:1.5rem; border:1px solid var(--color-warning);">
          <h3 style="margin:0 0 1rem 0; font-size:1rem; color:var(--text-primary); font-family:var(--font-display);">🔑 Admin Pending Approvals</h3>
          <div style="display:grid; grid-template-columns: repeat(4, 1fr); gap: 1rem;">
            <div style="background:var(--bg-base-elevated); padding:0.75rem; border-radius:var(--radius-sm); text-align:center;">
              <div style="font-size:0.75rem; color:var(--text-muted); font-weight:600;">Write-offs &gt;₹5,000</div>
              <div style="font-size:1.4rem; font-weight:700; margin:4px 0;">${writeOffsCount} items</div>
              <button class="btn btn-secondary btn-sm" onclick="window.switchInventoryTab('adjust')">Review</button>
            </div>
            <div style="background:var(--bg-base-elevated); padding:0.75rem; border-radius:var(--radius-sm); text-align:center;">
              <div style="font-size:0.75rem; color:var(--text-muted); font-weight:600;">Purchase Requests</div>
              <div style="font-size:1.4rem; font-weight:700; margin:4px 0;">${purchaseRequestsCount} item</div>
              <button class="btn btn-secondary btn-sm" onclick="window.switchInventoryTab('indent')">Review</button>
            </div>
            <div style="background:var(--bg-base-elevated); padding:0.75rem; border-radius:var(--radius-sm); text-align:center;">
              <div style="font-size:0.75rem; color:var(--text-muted); font-weight:600;">Branch Transfers</div>
              <div style="font-size:1.4rem; font-weight:700; margin:4px 0;">${branchTransfersCount} active</div>
              <button class="btn btn-secondary btn-sm" onclick="window.switchInventoryTab('transfer')">Review</button>
            </div>
            <div style="background:var(--bg-base-elevated); padding:0.75rem; border-radius:var(--radius-sm); text-align:center;">
              <div style="font-size:0.75rem; color:var(--text-muted); font-weight:600;">Quarantine Release</div>
              <div style="font-size:1.4rem; font-weight:700; margin:4px 0;">1 item</div>
              <button class="btn btn-secondary btn-sm" onclick="window.switchInventoryTab('adjust')">Review</button>
            </div>
          </div>
        </div>
      `;
    }

    // 1G — Budget Setup (Admin role only)
    var budgetSetupHTML = '';
    if (activeRole === 'Administrator') {
      budgetSetupHTML = `
        <div class="card" style="box-shadow:var(--shadow-sm); padding:1.25rem; margin-bottom:1.5rem;">
          <h3 style="margin:0 0 1rem 0; font-size:1rem; color:var(--text-primary); font-family:var(--font-display);">⚙️ Consumables Monthly Budget Setup</h3>
          <div style="display:grid; grid-template-columns: 1fr 1fr 1fr; gap:1rem; align-items:end;">
            <div class="form-group" style="margin:0;">
              <label class="form-label">Select Department</label>
              <select id="budget-dept" class="form-select">
                <option value="ICU">ICU</option>
                <option value="OT">OT</option>
                <option value="General Ward">General Ward</option>
              </select>
            </div>
            <div class="form-group" style="margin:0;">
              <label class="form-label">Monthly Allocation (₹)</label>
              <input type="number" id="budget-amount" class="form-control" placeholder="Allocation amount" value="120000">
            </div>
            <button class="btn btn-primary" onclick="window.saveBudgetSetup()">Save Budget Allocation</button>
          </div>
        </div>
      `;
    }

    return criticalAlertsHTML + statsHTML + adminApprovalsHTML + budgetSetupHTML + mainGridHTML + bottomHTML;
  }

  window.resolveBmwBreach = function() {
    bmwBreached = false;
    alert("BMW stock PO generated automatically! Statutory breach alert resolved.");
    renderInventoryLayout(document.getElementById('main-content'));
  };

  window.resolveNDPSLock = async function() {
    var code = await customPrompt("NDPS Count discrepancy verification logic.\nEnter physical counted count for Inj. Fentanyl 100mcg to verify:");
    if (code) {
      ndpsLocked = false;
      ndpsDiscrepancyAlert = false;
      alert("NDPS Register physically verified! Daily count discrepancy audit locked.");
      renderInventoryLayout(document.getElementById('main-content'));
    }
  };

  window.raisePOPreFill = function(itemCode) {
    selectedReorderItem = window.state.invStock.find(s => s.code === itemCode);
    if (selectedReorderItem) {
      newPOItems = [{
        code: selectedReorderItem.code,
        name: selectedReorderItem.name,
        qty: selectedReorderItem.moq,
        rate: selectedReorderItem.rate || 150
      }];
    }
    activeTab = 'procure';
    activeProcureSubTab = 'po';
    isNewPOOpen = true;
    renderInventoryLayout(document.getElementById('main-content'));
  };

  window.reviewIndentFromDashboard = function(indentId) {
    activeTab = 'indent';
    selectedTripId = indentId;
    renderInventoryLayout(document.getElementById('main-content'));
  };

  window.filterLedger = function(status) {
    activeTab = 'ledger';
    ledgerStatus = status;
    renderInventoryLayout(document.getElementById('main-content'));
  };

  window.saveBudgetSetup = function() {
    var dept = document.getElementById('budget-dept').value;
    var amt = parseInt(document.getElementById('budget-amount').value) || 0;
    var b = window.state.invBudgets.find(bu => bu.dept === dept);
    if (b) {
      b.monthlyAlloc = amt;
      alert("Budget updated for " + dept + " department to ₹" + amt.toLocaleString('en-IN'));
      renderInventoryLayout(document.getElementById('main-content'));
    }
  };

  /* ==========================================================================
     TAB 2 — STOCK LEDGER & SUB-STORE MASTER & ITEM MASTER
     ========================================================================== */
  function renderStockLedgerTab() {
    var filtered = window.state.invStock.filter(function (s) {
      if (ledgerCategory !== 'All' && s.category !== ledgerCategory) return false;
      if (ledgerLocation !== 'All' && s.location !== ledgerLocation) return false;
      if (ledgerOwnership !== 'All' && s.ownership !== ledgerOwnership) return false;
      
      if (ledgerStatus === 'Low' && s.qty >= s.minFloor) return false;
      if (ledgerStatus === 'Expiry' && s.expiry === '—') return false;

      if (ledgerSearch.trim() !== '') {
        var q = ledgerSearch.toLowerCase();
        return s.name.toLowerCase().includes(q) || s.code.toLowerCase().includes(q);
      }
      return true;
    });

    var rowsHTML = '';
    if (ledgerViewMode === 'All') {
      filtered.forEach(function (s) {
        var isLow = s.qty < s.minFloor;
        var isReorder = s.qty < s.reorder && s.qty >= s.minFloor;
        var qtyColor = isLow ? 'var(--color-danger)' : (isReorder ? 'var(--color-warning)' : 'var(--text-primary)');
        var isCurrentDetail = detailItemCode === s.code;

        // Inactive items greyed
        var opacityStyle = s.status === 'Inactive' ? 'opacity:0.55; background:#f1f5f9;' : '';

        rowsHTML += `
          <tr style="border-bottom: 1px solid var(--border-color); cursor:pointer; ${opacityStyle}" onclick="window.viewLedgerItemDetails('${s.code}')">
            <td style="padding:12px; font-weight:700;" class="mono">${s.code}</td>
            <td style="padding:12px; font-weight:800; color:var(--text-primary);">
              ${s.name} ${s.coldChain ? '❄️' : ''}
              <div style="font-size:0.72rem; color:var(--text-muted); font-weight:500;">${s.brand} (${s.generic})</div>
            </td>
            <td style="padding:12px;"><span class="badge badge-primary" style="font-size:9px;">${s.category}</span></td>
            <td style="padding:12px;">${s.unit}</td>
            <td style="padding:12px; font-weight:700; color:${qtyColor};">${s.qty}</td>
            <td style="padding:12px;" class="mono">${s.minFloor}</td>
            <td style="padding:12px;" class="mono">${s.reorder}</td>
            <td style="padding:12px;" class="mono">${s.moq}</td>
            <td style="padding:12px;" class="mono">${s.expiry}</td>
            <td style="padding:12px;">${s.location}</td>
            <td style="padding:12px;"><span class="badge ${s.ownership === 'Consignment' ? 'badge-warning' : 'badge-success'}">${s.ownership}</span></td>
            <td style="padding:12px; text-align:right;" onclick="event.stopPropagation()">
              ${ledgerAsOnDate === '' ? `
                <button class="btn btn-secondary btn-sm" onclick="window.editItemMaster('${s.code}')">Edit</button>
                <button class="btn btn-secondary btn-sm" onclick="window.toggleItemActiveState('${s.code}')">${s.status === 'Inactive' ? 'Reactivate' : 'Deactivate'}</button>
              ` : `<span style="font-size:0.75rem; color:var(--text-muted);">Read Only</span>`}
            </td>
          </tr>
          ${isCurrentDetail ? `
            <tr>
              <td colspan="12" style="background:var(--bg-base-elevated); padding:1rem; border-bottom:1px solid var(--border-color);">
                ${renderItemDetailDrawer(s)}
              </td>
            </tr>
          ` : ''}
        `;
      });
    } else {
      // Group by Sub-store view mode
      var grouped = {};
      window.state.invLocations.forEach(loc => {
        grouped[loc.name] = [];
      });
      filtered.forEach(s => {
        if (!grouped[s.location]) grouped[s.location] = [];
        grouped[s.location].push(s);
      });

      Object.keys(grouped).forEach(locName => {
        if (grouped[locName].length === 0) return;
        rowsHTML += `
          <tr style="background:var(--bg-base-elevated); font-weight:700; border-bottom:1px solid var(--border-color);">
            <td colspan="12" style="padding:8px 12px; color:var(--primary); font-size:0.85rem;">📍 ${locName} (${grouped[locName].length} items)</td>
          </tr>
        `;
        grouped[locName].forEach(s => {
          var isLow = s.qty < s.minFloor;
          rowsHTML += `
            <tr style="border-bottom: 1px solid var(--border-color); font-size:0.78rem;">
              <td class="mono" style="padding:8px 12px;">${s.code}</td>
              <td style="padding:8px 12px; font-weight:600;">${s.name}</td>
              <td style="padding:8px 12px;">${s.category}</td>
              <td style="padding:8px 12px;">${s.unit}</td>
              <td style="padding:8px 12px; font-weight:700; color:${isLow?'var(--color-danger)':'var(--text-primary)'}">${s.qty}</td>
              <td colspan="6" style="padding:8px 12px; color:var(--text-muted);">Min: ${s.minFloor} · Reorder: ${s.reorder} · Expiry: ${s.expiry}</td>
              <td style="padding:8px 12px; text-align:right;">
                <button class="btn btn-secondary btn-sm" onclick="window.viewLedgerItemDetails('${s.code}')">Detail</button>
              </td>
            </tr>
          `;
        });
      });
    }

    var filtersHTML = `
      <div style="background:var(--bg-surface); border:1px solid var(--border-color); border-radius:var(--radius-md); padding:1rem; display:flex; gap:12px; flex-wrap:wrap; align-items:center; margin-bottom:1.5rem; box-shadow:var(--shadow-sm);">
        <div class="form-group" style="margin:0; width:150px;">
          <label class="form-label" style="font-size:0.7rem; margin-bottom:2px;">As on Date</label>
          <input type="date" class="form-control" style="padding: 0.35rem 0.5rem;" onchange="window.setLedgerAsOnDate(this.value)" value="${ledgerAsOnDate}" max="2026-07-06">
        </div>

        <div class="form-group" style="margin:0; width:150px;">
          <label class="form-label" style="font-size:0.7rem; margin-bottom:2px;">Category</label>
          <select class="form-select" onchange="window.setLedgerFilter('category', this.value)">
            <option value="All">All Categories</option>
            ${window.state.invCategories.map(c => `<option value="${c}" ${ledgerCategory === c ? 'selected' : ''}>${c}</option>`).join('')}
          </select>
        </div>
        
        <div class="form-group" style="margin:0; width:140px;">
          <label class="form-label" style="font-size:0.7rem; margin-bottom:2px;">Location</label>
          <select class="form-select" onchange="window.setLedgerFilter('location', this.value)">
            <option value="All">All Locations</option>
            ${window.state.invLocations.map(l => `<option value="${l.name}" ${ledgerLocation === l.name ? 'selected' : ''}>${l.name}</option>`).join('')}
          </select>
        </div>

        <div class="form-group" style="margin:0; width:120px;">
          <label class="form-label" style="font-size:0.7rem; margin-bottom:2px;">Stock Status</label>
          <select class="form-select" onchange="window.setLedgerFilter('status', this.value)">
            <option value="All" ${ledgerStatus === 'All' ? 'selected' : ''}>All Statuses</option>
            <option value="Low" ${ledgerStatus === 'Low' ? 'selected' : ''}>Low Stock</option>
            <option value="Expiry" ${ledgerStatus === 'Expiry' ? 'selected' : ''}>Near Expiry</option>
          </select>
        </div>

        <div class="form-group" style="margin:0; width:110px;">
          <label class="form-label" style="font-size:0.7rem; margin-bottom:2px;">Ownership</label>
          <select class="form-select" onchange="window.setLedgerFilter('ownership', this.value)">
            <option value="All" ${ledgerOwnership === 'All' ? 'selected' : ''}>All</option>
            <option value="Owned" ${ledgerOwnership === 'Owned' ? 'selected' : ''}>Owned</option>
            <option value="Consignment" ${ledgerOwnership === 'Consignment' ? 'selected' : ''}>Consignment</option>
          </select>
        </div>

        <div style="flex:1; min-width:180px;">
          <label class="form-label" style="font-size:0.7rem; margin-bottom:2px;">Search Text</label>
          <input type="text" class="form-control" placeholder="Search generic / brand / code..." value="${ledgerSearch}" onkeyup="window.setLedgerSearch(this.value)">
        </div>

        <div style="margin-top:14px; display:flex; gap:8px;">
          <button class="btn ${ledgerViewMode === 'All' ? 'btn-primary' : 'btn-secondary'} btn-sm" onclick="window.setLedgerViewMode('All')">Standard List</button>
          <button class="btn ${ledgerViewMode === 'BySubstore' ? 'btn-primary' : 'btn-secondary'} btn-sm" onclick="window.setLedgerViewMode('BySubstore')">By Sub-store</button>
        </div>
      </div>
    `;

    var dateWarningBanner = '';
    if (ledgerAsOnDate !== '') {
      dateWarningBanner = `
        <div class="inv-alert-strip" style="background-color:#fffbeb; border-left-color:#d97706; color:#92400e; margin-bottom:1rem;">
          <span>Showing stock position as on ${ledgerAsOnDate} — Read-Only Mode. All adjustments and transfers are disabled.</span>
        </div>
      `;
    }

    var controlButtonsHTML = '';
    if (ledgerAsOnDate === '') {
      controlButtonsHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem;">
          <div style="display:flex; gap:8px;">
            <button class="btn btn-secondary btn-sm" onclick="window.openLocationMaster()">Sub-store / Location Master</button>
          </div>
          ${(activeRole === 'Store Manager' || activeRole === 'Administrator') ? `
            <button class="btn btn-primary" onclick="window.openItemMaster()">+ New Item Master Entry</button>
          ` : ''}
        </div>
      `;
    }

    // Modal/Form views if opened
    if (isNewItemOpen) {
      return dateWarningBanner + renderItemMasterForm();
    }
    if (isNewLocationOpen) {
      return dateWarningBanner + renderLocationMasterForm();
    }

    return dateWarningBanner + controlButtonsHTML + filtersHTML + `
      <div class="card" style="box-shadow:var(--shadow-sm);">
        <div class="custom-table-container">
          <table class="custom-table">
            <thead>
              <tr>
                <th>Code</th><th>Item Name / Brand</th><th>Category</th><th>Unit</th><th>In Stock</th>
                <th>Min Floor</th><th>Reorder</th><th>MOQ</th><th>Expiry</th><th>Location</th><th>Ownership</th>
                <th style="text-align:right;">Action</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHTML || `<tr><td colspan="12" style="text-align:center; padding:40px; color:var(--text-muted);">No stock records match criteria.</td></tr>`}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  window.setLedgerAsOnDate = function(val) {
    ledgerAsOnDate = val;
    renderInventoryLayout(document.getElementById('main-content'));
  };

  window.setLedgerViewMode = function(mode) {
    ledgerViewMode = mode;
    renderInventoryLayout(document.getElementById('main-content'));
  };

  window.toggleItemActiveState = function(code) {
    var s = window.state.invStock.find(st => st.code === code);
    if (s) {
      s.status = s.status === 'Inactive' ? 'Active' : 'Inactive';
      alert(`Item ${s.code} status set to ${s.status}.`);
      renderInventoryLayout(document.getElementById('main-content'));
    }
  };

  // Item Master Edit/New Form
  function renderItemMasterForm() {
    var s = window.state.invStock.find(st => st.code === activeEditingItemCode) || {};
    var isEdit = !!s.code;

    return `
      <div class="card" style="box-shadow:var(--shadow-sm); padding:1.5rem; margin-bottom:1.5rem;">
        <h3 style="margin:0 0 1.2rem 0; font-size:1.1rem; color:var(--text-primary); font-family:var(--font-display);">
          ${isEdit ? '📝 Edit Item Master' : '📦 Create New Item Master'}
        </h3>
        
        <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:16px; margin-bottom:1rem;">
          <div class="form-group">
            <label class="form-label">Item Code</label>
            <input type="text" class="form-control" id="itm-form-code" value="${s.code || 'Auto-generated'}" readonly style="background:#f1f5f9;">
          </div>
          <div class="form-group">
            <label class="form-label">Item Name *</label>
            <input type="text" class="form-control" id="itm-form-name" value="${s.name || ''}" placeholder="Inj. Fentanyl 100mcg">
          </div>
          <div class="form-group">
            <label class="form-label">Category *</label>
            <select id="itm-form-cat" class="form-select">
              ${window.state.invCategories.map(c => `<option value="${c}" ${s.category === c ? 'selected' : ''}>${c}</option>`).join('')}
            </select>
          </div>
        </div>

        <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:16px; margin-bottom:1rem;">
          <div class="form-group">
            <label class="form-label">Generic Name</label>
            <input type="text" class="form-control" id="itm-form-generic" value="${s.generic || ''}">
          </div>
          <div class="form-group">
            <label class="form-label">Brand</label>
            <input type="text" class="form-control" id="itm-form-brand" value="${s.brand || ''}">
          </div>
          <div class="form-group">
            <label class="form-label">Unit of Measure (Issue UOM)</label>
            <select id="itm-form-unit" class="form-select">
              <option value="vials" ${s.unit === 'vials'?'selected':''}>vials</option>
              <option value="tablets" ${s.unit === 'tablets'?'selected':''}>tablets</option>
              <option value="pcs" ${s.unit === 'pcs'?'selected':''}>pcs</option>
              <option value="packs" ${s.unit === 'packs'?'selected':''}>packs</option>
              <option value="cylinders" ${s.unit === 'cylinders'?'selected':''}>cylinders</option>
              <option value="sets" ${s.unit === 'sets'?'selected':''}>sets</option>
            </select>
          </div>
        </div>

        <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:16px; margin-bottom:1rem;">
          <div class="form-group">
            <label class="form-label">Min Floor Qty *</label>
            <input type="number" class="form-control" id="itm-form-min" value="${s.minFloor || '50'}">
          </div>
          <div class="form-group">
            <label class="form-label">Reorder Level *</label>
            <input type="number" class="form-control" id="itm-form-reorder" value="${s.reorder || '100'}">
          </div>
          <div class="form-group">
            <label class="form-label">MOQ (Min Order Qty) *</label>
            <input type="number" class="form-control" id="itm-form-moq" value="${s.moq || '50'}">
          </div>
        </div>

        <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:16px; margin-bottom:1rem;">
          <div class="form-group">
            <label class="form-label">Storage Requirement</label>
            <select id="itm-form-storage" class="form-select">
              <option value="Room temp">Room Temp</option>
              <option value="Refrigerated (2–8°C)">Refrigerated (2–8°C)</option>
              <option value="NDPS Cupboard">NDPS Cupboard</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Standard Rate (₹)</label>
            <input type="number" class="form-control" id="itm-form-rate" value="${s.rate || 150}">
          </div>
          <div class="form-group">
            <label class="form-label">Ownership Mode</label>
            <select id="itm-form-ownership" class="form-select">
              <option value="Owned" ${s.ownership === 'Owned'?'selected':''}>Owned</option>
              <option value="Consignment" ${s.ownership === 'Consignment'?'selected':''}>Consignment</option>
            </select>
          </div>
        </div>

        <div style="display:flex; gap:20px; margin-bottom:1.5rem;">
          <label style="display:flex; align-items:center; gap:8px;">
            <input type="checkbox" id="itm-form-coldchain" ${s.coldChain ? 'checked' : ''}> Cold Chain required
          </label>
          <label style="display:flex; align-items:center; gap:8px;">
            <input type="checkbox" id="itm-form-ndps" ${s.ndps ? 'checked' : ''}> NDPS / Schedule H1
          </label>
          <label style="display:flex; align-items:center; gap:8px;">
            <input type="checkbox" id="itm-form-controlled" ${s.controlled ? 'checked' : ''}> Controlled substance
          </label>
        </div>

        <div style="display:flex; justify-content:flex-end; gap:12px;">
          <button class="btn btn-secondary" onclick="window.closeItemMasterForm()">Cancel</button>
          <button class="btn btn-secondary" onclick="window.saveItemMaster(true)">Save & Add Opening Stock →</button>
          <button class="btn btn-primary" onclick="window.saveItemMaster(false)">Save Item</button>
        </div>
      </div>
    `;
  }

  window.openItemMaster = function() {
    activeEditingItemCode = '';
    isNewItemOpen = true;
    renderInventoryLayout(document.getElementById('main-content'));
  };

  window.editItemMaster = function(code) {
    activeEditingItemCode = code;
    isNewItemOpen = true;
    renderInventoryLayout(document.getElementById('main-content'));
  };

  window.closeItemMasterForm = function() {
    isNewItemOpen = false;
    renderInventoryLayout(document.getElementById('main-content'));
  };

  window.saveItemMaster = function(redirectOpeningStock) {
    var name = document.getElementById('itm-form-name').value.trim();
    var cat = document.getElementById('itm-form-cat').value;
    var min = parseInt(document.getElementById('itm-form-min').value) || 0;
    var reorder = parseInt(document.getElementById('itm-form-reorder').value) || 0;
    var moq = parseInt(document.getElementById('itm-form-moq').value) || 0;
    var rate = parseFloat(document.getElementById('itm-form-rate').value) || 10;
    var brand = document.getElementById('itm-form-brand').value || 'Generic';
    var generic = document.getElementById('itm-form-generic').value || 'Generic';
    var unit = document.getElementById('itm-form-unit').value;
    var ownership = document.getElementById('itm-form-ownership').value;

    if (!name) {
      alert("Item Name is mandatory.");
      return;
    }

    var code = activeEditingItemCode;
    if (!code) {
      // Auto generate code
      var prefix = cat.slice(0, 3).toUpperCase();
      code = `ITM-${prefix}-${String(100 + window.state.invStock.length)}`;
      window.state.invStock.push({
        code: code, name: name, category: cat, generic: generic, brand: brand,
        unit: unit, qty: 0, minFloor: min, reorder: reorder, moq: moq,
        expiry: "—", batch: "—", location: "Main Store", ownership: ownership, rate: rate,
        coldChain: document.getElementById('itm-form-coldchain').checked,
        ndps: document.getElementById('itm-form-ndps').checked,
        controlled: document.getElementById('itm-form-controlled').checked,
        status: "Active"
      });
      alert(`New Item Master ${code} created.`);
    } else {
      var exist = window.state.invStock.find(st => st.code === code);
      if (exist) {
        exist.name = name; exist.category = cat; exist.minFloor = min;
        exist.reorder = reorder; exist.moq = moq; exist.rate = rate;
        exist.brand = brand; exist.generic = generic; exist.unit = unit;
        exist.ownership = ownership;
        exist.coldChain = document.getElementById('itm-form-coldchain').checked;
        exist.ndps = document.getElementById('itm-form-ndps').checked;
        exist.controlled = document.getElementById('itm-form-controlled').checked;
        alert(`Item Master ${code} updated successfully.`);
      }
    }

    isNewItemOpen = false;

    if (redirectOpeningStock) {
      // Prefill code in adjustments tab Opening Balance Form
      _adjustPreSelectCode = code;
      activeTab = 'adjust';
      activeAdjustSubTab = 'writeoff'; // Opening Balance is on Adjustments tab
      isNewAdjustmentOpen = true; 
    }
    renderInventoryLayout(document.getElementById('main-content'));
  };

  // Sub-store / Location Master Form
  function renderLocationMasterForm() {
    var lList = window.state.invLocations.map(l => `
      <tr style="border-bottom:1px solid var(--border-color);">
        <td style="padding:10px;" class="mono">${l.id}</td>
        <td style="padding:10px; font-weight:700;">${l.name}</td>
        <td style="padding:10px;">${l.type}</td>
        <td style="padding:10px;">${l.staff}</td>
        <td style="padding:10px;">${l.branch}</td>
        <td style="padding:10px; text-align:right;">
          <button class="btn btn-secondary btn-sm" onclick="window.editLocationMaster('${l.id}')">Edit</button>
        </td>
      </tr>
    `).join('');

    var isEdit = !!activeEditingLocationId;
    var loc = window.state.invLocations.find(l => l.id === activeEditingLocationId) || {};

    return `
      <div class="card" style="box-shadow:var(--shadow-sm); padding:1.25rem; margin-bottom:1.5rem;">
        <h3 style="margin:0 0 1rem 0; font-size:1rem; color:var(--text-primary); font-family:var(--font-display);">
          📍 Sub-store / Location Master setup
        </h3>
        
        <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:16px; margin-bottom:1rem;">
          <div class="form-group">
            <label class="form-label">Location Name *</label>
            <input type="text" id="loc-form-name" class="form-control" value="${loc.name || ''}" placeholder="E.g. OT Sub-store">
          </div>
          <div class="form-group">
            <label class="form-label">Type</label>
            <select id="loc-form-type" class="form-select">
              <option value="Main" ${loc.type==='Main'?'selected':''}>Main Store</option>
              <option value="Sub-store" ${loc.type==='Sub-store'?'selected':''}>Sub-store</option>
              <option value="Branch" ${loc.type==='Branch'?'selected':''}>Branch Location</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Incharge Staff / Responsible</label>
            <input type="text" id="loc-form-staff" class="form-control" value="${loc.staff || ''}" placeholder="Pharmacist name / Staff Incharge">
          </div>
        </div>

        <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-bottom:1rem;">
          <div class="form-group">
            <label class="form-label">Branch Campus</label>
            <input type="text" id="loc-form-branch" class="form-control" value="${loc.branch || 'Bengaluru Campus'}">
          </div>
        </div>

        <div style="display:flex; justify-content:flex-end; gap:8px;">
          <button class="btn btn-secondary" onclick="window.closeLocationMasterForm()">Close</button>
          <button class="btn btn-primary" onclick="window.saveLocationMaster()">Save Location</button>
        </div>

        <h4 style="margin:1.5rem 0 0.5rem 0; font-size:0.9rem; font-family:var(--font-display);">Registered Locations</h4>
        <div class="custom-table-container">
          <table class="custom-table">
            <thead>
              <tr><th>Location ID</th><th>Name</th><th>Type</th><th>Responsible Staff</th><th>Branch</th><th style="text-align:right;">Action</th></tr>
            </thead>
            <tbody>${lList}</tbody>
          </table>
        </div>
      </div>
    `;
  }

  window.openLocationMaster = function() {
    activeEditingLocationId = '';
    isNewLocationOpen = true;
    renderInventoryLayout(document.getElementById('main-content'));
  };

  window.editLocationMaster = function(id) {
    activeEditingLocationId = id;
    isNewLocationOpen = true;
    renderInventoryLayout(document.getElementById('main-content'));
  };

  window.closeLocationMasterForm = function() {
    isNewLocationOpen = false;
    renderInventoryLayout(document.getElementById('main-content'));
  };

  window.saveLocationMaster = function() {
    var name = document.getElementById('loc-form-name').value.trim();
    var type = document.getElementById('loc-form-type').value;
    var staff = document.getElementById('loc-form-staff').value.trim();
    var branch = document.getElementById('loc-form-branch').value.trim();

    if (!name) { alert("Location Name is required."); return; }

    if (type === 'Branch' && activeRole !== 'Administrator') {
      alert("⚠️ Only Administrator role can add / approve new Branch stores.");
      return;
    }

    if (activeEditingLocationId) {
      var l = window.state.invLocations.find(loc => loc.id === activeEditingLocationId);
      if (l) {
        l.name = name; l.type = type; l.staff = staff; l.branch = branch;
        alert("Location updated.");
      }
    } else {
      var newId = "LOC-" + String(100 + window.state.invLocations.length);
      window.state.invLocations.push({ id: newId, name: name, type: type, staff: staff, branch: branch, status: "Active" });
      alert("New Location " + newId + " created successfully.");
    }
    activeEditingLocationId = '';
    renderInventoryLayout(document.getElementById('main-content'));
  };

  function renderItemDetailDrawer(s) {
    var ndpsActions = s.category.includes('NDPS') ? `
      <button class="btn btn-primary btn-sm" onclick="window.switchInventoryTab('statutory')">Open NDPS Register</button>
    ` : '';

    var matchedSupplier = (window.state.invSuppliers || []).find(sup => {
      var catLower = s.category.toLowerCase();
      var supCatLower = sup.category.toLowerCase();
      return supCatLower.includes(catLower.split(' ')[0]) || catLower.includes(supCatLower.split(' ')[0]);
    }) || window.state.invSuppliers[0];

    // Seeded movement history
    var movementSeed = [
      { code: 'ITM-DRG-003', hist: ['24 Jun: Issued to ICU — 5 vials · Nurse Kavitha', '22 Jun: Received PO-2026-0041 — 30 vials', '18 Jun: Issued to OT — 3 vials · Nurse Priya'] },
      { code: 'ITM-DRG-001', hist: ['23 Jun: Issued to OPD — 100 tablets · Pharmacist', '20 Jun: Received PO-2026-0038 — 500 tablets', '15 Jun: Issued to Gen Ward — 200 tablets'] },
      { code: 'ITM-CSM-003', hist: ['24 Jun: Issued to OT — 50 pcs · OT Nurse Priya', '21 Jun: Received GRN-2026-0091 — 500 pcs', '17 Jun: Issued to ICU — 20 pcs'] },
      { code: 'ITM-CSM-006', hist: ['24 Jun: BMW Disposal logged — 12 packs', '22 Jun: Received PO-2026-0039 — 100 packs', '19 Jun: BMW Disposal logged — 8 packs'] },
    ];
    var movSeed = movementSeed.find(m => m.code === s.code);
    var movHistRows = movSeed ? movSeed.hist.map(h => `<li>${h}</li>`).join('') :
      `<li>24 Jun: Issued to ${s.location.replace(' Store','').replace(' Sub-store','')} — ${Math.floor(s.qty * 0.05 + 1)} ${s.unit}</li>
       <li>20 Jun: Received from GRN — ${Math.ceil(s.moq * 0.5)} ${s.unit}</li>
       <li>15 Jun: Issued to Dept — ${Math.floor(s.qty * 0.03 + 1)} ${s.unit}</li>`;

    return `
      <div style="font-size:0.8rem; line-height:1.6; color:var(--text-secondary);">
        <div style="display:flex; justify-content:space-between; margin-bottom:10px;">
          <div>Item Name: <strong>${s.name}</strong> · Code: <strong class="mono">${s.code}</strong></div>
          <div>Category: <strong>${s.category}</strong> · Unit: <strong>${s.unit}</strong></div>
        </div>
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px;">
          <div>Supplier: <strong>${matchedSupplier ? matchedSupplier.name : 'N/A'}</strong>
            ${matchedSupplier ? '· Contact: ' + matchedSupplier.contact + ' · Lead time: ' + matchedSupplier.leadTime + ' · MOQ: ' + matchedSupplier.moq : ''}
          </div>
          <div style="display:flex;gap:8px;">
            <button class="btn btn-secondary btn-sm" onclick="window.adjustItemLedger('${s.code}')">Request Write-off</button>
            ${ndpsActions}
          </div>
        </div>
        
        <hr style="border:none; border-top:1px dashed var(--border-color); margin:8px 0;">
        
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:20px;">
          <div>
            <strong style="color:var(--text-primary);">📦 BATCH BREAKDOWN:</strong>
            <ul style="padding-left:14px; margin:4px 0 0 0;">
              <li><span class="mono">${s.batch}</span> · Qty: ${Math.ceil(s.qty * 0.6)} · Exp: ${s.expiry} · ${s.location} <em style="color:var(--color-success); font-size:0.7rem;">(FIFO first)</em></li>
              ${s.qty > 1 ? `<li>BAT-PREV-${s.code.slice(-3)} · Qty: ${Math.floor(s.qty * 0.4)} · Exp: (older batch) · ${s.location}</li>` : ''}
            </ul>
          </div>
          <div>
            <strong style="color:var(--text-primary);">🔄 MOVEMENT HISTORY (Last 30 Days):</strong>
            <ul style="padding-left:14px; margin:4px 0 0 0;">
              ${movHistRows}
            </ul>
          </div>
        </div>
      </div>
    `;
  }

  var _adjustPreSelectCode = '';
  window.adjustItemLedger = function(code) {
    _adjustPreSelectCode = code;
    activeTab = 'adjust';
    activeAdjustSubTab = 'writeoff';
    isNewAdjustmentOpen = true;
    renderInventoryLayout(document.getElementById('main-content'));
  };

  window.viewLedgerItemDetails = function (code) {
    detailItemCode = detailItemCode === code ? '' : code;
    renderInventoryLayout(document.getElementById('main-content'));
  };

  /* ==========================================================================
     TAB 3 — INDENT & ISSUE
     ========================================================================== */
  function renderIndentTab() {
    var isStoreManager = activeRole === 'Store Manager' || activeRole === 'Administrator';

    var subSectionToggle = `
      <div style="display:flex; gap:12px; margin-bottom:1.5rem; background:var(--bg-surface); padding:8px; border-radius:var(--radius-sm); border:1px solid var(--border-color);">
        <button class="btn ${!isStoreManager ? 'btn-primary' : 'btn-secondary'} btn-sm" onclick="window.setIndentFormView(true)">Raise Request Form</button>
        <button class="btn ${isStoreManager ? 'btn-primary' : 'btn-secondary'} btn-sm" onclick="window.setIndentFormView(false)">Fulfil Queue (${window.state.invIndents.filter(i => i.status.includes('Pending') || i.status.includes('Partially')).length})</button>
      </div>
    `;

    var raiseIndentFormHTML = '';
    if (isNewIndentOpen || !isStoreManager) {
      raiseIndentFormHTML = `
        <div class="card" style="box-shadow:var(--shadow-sm); padding:1.25rem; margin-bottom:1.5rem; border-color:var(--primary);">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem;">
            <h3 style="margin:0; font-size:1rem; color:var(--text-primary); font-family:var(--font-display);">+ Raise New Indent / Request</h3>
            <div style="display:flex; gap:10px;">
              <button class="btn btn-secondary btn-sm" onclick="window.loadSavedTemplate()">Load Template</button>
              <select id="ind-form-type" class="form-select" style="width:200px;" onchange="window.setIndentFormType(this.value)">
                <option value="Consumable Indent" ${activeIndentType === 'Consumable Indent' ? 'selected' : ''}>Consumable Indent</option>
                <option value="Purchase Request" ${activeIndentType === 'Purchase Request' ? 'selected' : ''}>Purchase Request</option>
                <option value="Returnable Request" ${activeIndentType === 'Returnable Request' ? 'selected' : ''}>Returnable Request</option>
                <option value="Branch Stock Request" ${activeIndentType === 'Branch Stock Request' ? 'selected' : ''}>Branch Stock Request</option>
                <option value="O₂ Cylinder Exchange" ${activeIndentType === 'O₂ Cylinder Exchange' ? 'selected' : ''}>O₂ Cylinder Exchange</option>
              </select>
            </div>
          </div>
          
          ${renderSubFormByType()}
        </div>
      `;
    }

    var fulfilQueueHTML = '';
    if (isStoreManager && !isNewIndentOpen) {
      var consumableCount = window.state.invIndents.filter(i => i.type === 'Consumable' && (i.status === 'Pending' || i.status === 'Partially Issued')).length;
      var purchaseCount = window.state.invIndents.filter(i => i.type === 'Purchase').length;
      var returnableCount = window.state.invIndents.filter(i => i.type === 'Returnable').length;
      var branchCount = window.state.invTransfers.filter(i => i.type === 'Branch' && i.status === 'In Transit').length;

      fulfilQueueHTML = `
        <div class="card" style="box-shadow:var(--shadow-sm); padding:1.25rem;">
          <div style="display:flex; gap:10px; margin-bottom:1.2rem; border-bottom:1px solid var(--border-color); padding-bottom:8px;">
            <button class="btn btn-sm ${activeFulfilQueueTab === 'consumable' ? 'btn-primary' : 'btn-secondary'}" onclick="window.setFulfilQueueTab('consumable')">Consumable Indents (${consumableCount})</button>
            <button class="btn btn-sm ${activeFulfilQueueTab === 'purchase' ? 'btn-primary' : 'btn-secondary'}" onclick="window.setFulfilQueueTab('purchase')">Purchase Requests (${purchaseCount})</button>
            <button class="btn btn-sm ${activeFulfilQueueTab === 'returnable' ? 'btn-primary' : 'btn-secondary'}" onclick="window.setFulfilQueueTab('returnable')">Returnable Requests (${returnableCount})</button>
            <button class="btn btn-sm ${activeFulfilQueueTab === 'branch' ? 'btn-primary' : 'btn-secondary'}" onclick="window.setFulfilQueueTab('branch')">Branch Requests (${branchCount})</button>
          </div>

          ${renderFulfilQueueList()}
        </div>
      `;
    }

    return subSectionToggle + raiseIndentFormHTML + fulfilQueueHTML;
  }

  window.setIndentFormView = function(isOpen) {
    isNewIndentOpen = isOpen;
    renderInventoryLayout(document.getElementById('main-content'));
  };

  window.setIndentFormType = function(val) {
    activeIndentType = val;
    newIndentItems = [];
    renderInventoryLayout(document.getElementById('main-content'));
  };

  window.setFulfilQueueTab = function(val) {
    activeFulfilQueueTab = val;
    renderInventoryLayout(document.getElementById('main-content'));
  };

  window.loadSavedTemplate = async function() {
    var list = window.state.invTemplates.map((t, idx) => `${idx + 1}: ${t.name} (${t.items.length} items)`).join('\n');
    var select = await customPrompt("Select Template index:\n\n" + list);
    if (select) {
      var tIndex = parseInt(select) - 1;
      var template = window.state.invTemplates[tIndex];
      if (template) {
        newIndentItems = template.items.map(it => {
          var s = window.state.invStock.find(st => st.code === it.code) || {};
          return { code: it.code, name: it.name, unit: s.unit || 'pcs', qty: it.qty, purpose: "Template pre-fill" };
        });
        alert(`Loaded template: ${template.name}`);
        renderInventoryLayout(document.getElementById('main-content'));
      }
    }
  };

  function renderSubFormByType() {
    if (activeIndentType === 'Consumable Indent') {
      return `
        <div>
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-bottom:1rem;">
            <div class="form-group">
              <label class="form-label">Department *</label>
              <select id="ind-form-dept" class="form-select">
                <option value="ICU">Intensive Care Unit (ICU)</option>
                <option value="OT">Operating Theatre (OT)</option>
                <option value="General Ward">General Ward</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Urgency</label>
              <select id="ind-form-urgency" class="form-select">
                <option value="Routine">Routine</option>
                <option value="Urgent">Urgent</option>
                <option value="STAT">STAT (Emergency Alert)</option>
              </select>
            </div>
          </div>
          
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-bottom:1rem;">
            <div class="form-group">
              <label class="form-label">Required By Date *</label>
              <input type="date" id="ind-form-date" class="form-control" value="2026-07-06">
            </div>
            <div class="form-group">
              <label class="form-label">Notes</label>
              <input type="text" id="ind-form-notes" class="form-control" placeholder="Optional comments...">
            </div>
          </div>

          <!-- Reservation system helper -->
          <div style="background:var(--bg-base-elevated); padding:0.75rem; border-radius:var(--radius-sm); margin-bottom:1rem; font-size:0.78rem; border-left:4px solid var(--primary);">
            📌 <strong>Stock Reservation Link:</strong> Scheduling a surgery or procedure? 
            <button class="btn btn-secondary btn-sm" style="margin-left:10px; padding:2px 8px; font-size:0.7rem;" onclick="window.openReservationWizard()">Reserve Stock</button>
          </div>

          <!-- Items list (dynamic rows) -->
          <div class="checklist-card" style="margin-bottom:1.5rem;">
            <label class="form-label" style="font-weight:700;">Add Items to Indent</label>
            <div style="display:grid; grid-template-columns:2fr 1fr 1.5fr 1fr; gap:8px; margin-top:8px; align-items:center;">
              <select class="form-select" id="ind-draft-item">
                ${window.state.invStock.map(s => `<option value="${s.code}">${s.name} (${s.code})</option>`).join('')}
              </select>
              <input type="text" class="form-control" id="ind-draft-unit" placeholder="Unit (e.g. vials)" value="vials">
              <input type="number" class="form-control" id="ind-draft-qty" placeholder="Qty" value="10">
              <input type="text" class="form-control" id="ind-draft-purpose" placeholder="Purpose (optional)">
            </div>
            <button class="btn btn-secondary btn-sm" style="margin-top:10px;" onclick="window.addDraftIndentRow()">+ Add Row</button>

            <!-- Drafted items table -->
            ${newIndentItems.length > 0 ? `
              <table class="custom-table" style="margin-top:12px; font-size:0.75rem;">
                <thead>
                  <tr>
                    <th>Item Name/Code</th>
                    <th>Unit</th>
                    <th>Qty Requested</th>
                    <th>Purpose</th>
                    <th style="text-align:right;">Action</th>
                  </tr>
                </thead>
                <tbody>
                  ${newIndentItems.map((itm, idx) => `
                    <tr>
                      <td><strong>${itm.name}</strong> (${itm.code})</td>
                      <td>${itm.unit}</td>
                      <td>${itm.qty}</td>
                      <td>${itm.purpose || '—'}</td>
                      <td style="text-align:right;"><a href="javascript:void(0)" onclick="window.removeDraftIndentRow(${idx})" style="color:var(--color-danger); font-weight:700;">Remove</a></td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            ` : ''}
          </div>

          <div style="display:flex; justify-content:space-between; align-items:center;">
            <button class="btn btn-secondary btn-sm" onclick="window.saveAsTemplate()">Save as Template</button>
            <div style="display:flex; gap:8px;">
              <button class="btn btn-secondary" onclick="window.closeIndentForm()">Cancel</button>
              <button class="btn btn-primary" onclick="window.submitIndentForm()">Submit Indent</button>
            </div>
          </div>
        </div>
      `;
    } else if (activeIndentType === 'Purchase Request') {
      return `
        <div>
          <div style="display:grid; grid-template-columns:2fr 1fr; gap:16px; margin-bottom:1rem;">
            <div class="form-group">
              <label class="form-label">Item Description * (free text if no item code exists)</label>
              <input type="text" id="pr-form-desc" class="form-control" placeholder="Laparoscopy Port Set 10mm" value="Laparoscopy Port Set 10mm">
            </div>
            <div class="form-group">
              <label class="form-label">Category *</label>
              <select id="pr-form-cat" class="form-select">
                ${window.state.invCategories.map(c => `<option value="${c}">${c}</option>`).join('')}
              </select>
            </div>
          </div>

          <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:16px; margin-bottom:1rem;">
            <div class="form-group">
              <label class="form-label">Approx unit rate (₹)</label>
              <input type="number" id="pr-form-rate" class="form-control" value="4500">
            </div>
            <div class="form-group">
              <label class="form-label">Qty Needed *</label>
              <input type="number" id="pr-form-qty" class="form-control" value="2">
            </div>
            <div class="form-group">
              <label class="form-label">Required By *</label>
              <input type="date" id="pr-form-date" class="form-control" value="2026-07-20">
            </div>
          </div>

          <div class="form-group" style="margin-bottom:1rem;">
            <label class="form-label">Justification * (Mandatory for Admin review)</label>
            <textarea id="pr-form-justification" class="form-control" rows="3" placeholder="Explain medical requirement...">Required for minimal access surgery expansion.</textarea>
          </div>

          <div style="display:flex; justify-content:flex-end; gap:8px;">
            <button class="btn btn-secondary" onclick="window.closeIndentForm()">Cancel</button>
            <button class="btn btn-primary" onclick="window.submitPurchaseRequest()">Submit Purchase Request</button>
          </div>
        </div>
      `;
    } else if (activeIndentType === 'Returnable Request') {
      return `
        <div>
          <div style="display:grid; grid-template-columns:2fr 1fr; gap:16px; margin-bottom:1rem;">
            <div class="form-group">
              <label class="form-label">Item * (Available assets)</label>
              <select id="ret-form-asset" class="form-select">
                ${window.state.invAssets.map(a => `<option value="${a.code}">${a.name} (${a.code}) - ${a.status}</option>`).join('')}
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Quantity</label>
              <input type="number" id="ret-form-qty" class="form-control" value="1">
            </div>
          </div>

          <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-bottom:1rem;">
            <div class="form-group">
              <label class="form-label">Required From *</label>
              <input type="datetime-local" id="ret-form-start" class="form-control" value="2026-07-06T09:00">
            </div>
            <div class="form-group">
              <label class="form-label">Expected Return *</label>
              <input type="datetime-local" id="ret-form-end" class="form-control" value="2026-07-06T18:00">
            </div>
          </div>

          <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-bottom:1.5rem;">
            <div class="form-group">
              <label class="form-label">Patient Reference (UHID)</label>
              <input type="text" id="ret-form-uhid" class="form-control" placeholder="SH-2026-XXXXX" value="SH-2026-00445">
            </div>
            <div class="form-group">
              <label class="form-label">Reason</label>
              <input type="text" id="ret-form-reason" class="form-control" placeholder="Patient transport helper" value="Patient transport helper.">
            </div>
          </div>

          <div style="display:flex; justify-content:flex-end; gap:8px;">
            <button class="btn btn-secondary" onclick="window.closeIndentForm()">Cancel</button>
            <button class="btn btn-primary" onclick="window.submitReturnableRequest()">Request Asset</button>
          </div>
        </div>
      `;
    } else if (activeIndentType === 'Branch Stock Request') {
      var branchReqDraftHTML = branchReqDraftItems.length > 0 ? `
        <table class="custom-table" style="margin-top:12px; font-size:0.75rem;">
          <thead><tr><th>Item</th><th>Qty</th><th style="text-align:right;">Remove</th></tr></thead>
          <tbody>
            ${branchReqDraftItems.map((it, idx) => `
              <tr>
                <td><strong>${it.name}</strong> <span class="mono" style="font-size:0.7rem;">(${it.code})</span> · Av: ${it.av} ${it.unit}</td>
                <td>${it.qty}</td>
                <td style="text-align:right;"><a href="javascript:void(0)" onclick="window.removeBranchReqRow(${idx})" style="color:var(--color-danger);font-weight:700;">Remove</a></td>
              </tr>
            `).join('')}
          </tbody>
        </table>` : '';

      return `
        <div>
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-bottom:1rem;">
            <div class="form-group">
              <label class="form-label">Requesting Branch</label>
              <input type="text" class="form-control" value="Whitefield Campus" readonly style="background:#f1f5f9;">
            </div>
            <div class="form-group">
              <label class="form-label">Supplying Branch *</label>
              <select id="branch-req-from" class="form-select">
                <option value="Bengaluru Campus">Bengaluru Campus (Main Store)</option>
              </select>
            </div>
          </div>

          <div class="checklist-card" style="margin-bottom:1rem;">
            <label class="form-label" style="font-weight:700;">Add Items to Request</label>
            <div style="display:grid; grid-template-columns:2fr 1fr auto; gap:8px; margin-top:8px; align-items:center;">
              <div style="position:relative;">
                <input type="text" id="branch-req-search" class="form-control" placeholder="Search item name or code..." autocomplete="off"
                  oninput="window.filterBranchReqSearch(this.value)" value="${branchReqItemQuery}">
                <div id="branch-req-dropdown" style="position:absolute; top:100%; left:0; right:0; background:var(--bg-surface); border:1px solid var(--border-color); border-radius:var(--radius-sm); z-index:100; max-height:200px; overflow-y:auto; box-shadow:var(--shadow-sm); display:none;"></div>
                <input type="hidden" id="branch-req-item-code" value="">
              </div>
              <input type="number" id="branch-req-qty" class="form-control" placeholder="Qty" value="10" min="1">
              <button class="btn btn-secondary btn-sm" onclick="window.addBranchReqRow()">+ Add Item</button>
            </div>
            ${branchReqDraftHTML}
          </div>

          <div style="display:flex; justify-content:flex-end; gap:8px;">
            <button class="btn btn-secondary" onclick="window.closeIndentForm()">Cancel</button>
            <button class="btn btn-primary" onclick="window.submitBranchStockRequest()">Submit Branch Request (${branchReqDraftItems.length} items)</button>
          </div>
        </div>
      `;
    } else if (activeIndentType === 'O₂ Cylinder Exchange') {
      return `
        <div>
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-bottom:1rem;">
            <div class="form-group">
              <label class="form-label">Department *</label>
              <input type="text" id="o2-dept" class="form-control" value="ICU" readonly style="background:#f1f5f9;">
            </div>
            <div class="form-group">
              <label class="form-label">Cylinder Type *</label>
              <select id="o2-type" class="form-select">
                <option value="O₂ Cylinder (Type B)">O₂ Cylinder (Type B)</option>
                <option value="O₂ Cylinder (Type D)">O₂ Cylinder (Type D)</option>
                <option value="N₂O">N₂O Cylinder</option>
              </select>
            </div>
          </div>
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-bottom:1.5rem;">
            <div class="form-group">
              <label class="form-label">Empty Cylinders Returned *</label>
              <input type="number" id="o2-returned-qty" class="form-control" value="2">
            </div>
            <div class="form-group">
              <label class="form-label">Cylinder Serial Numbers * (Comma separated)</label>
              <input type="text" id="o2-serials" class="form-control" value="CYL-9081, CYL-9082">
            </div>
          </div>
          <div class="form-group" style="margin-bottom:1.5rem;">
            <label class="form-label">Full Cylinders Requested *</label>
            <input type="number" id="o2-requested-qty" class="form-control" value="2">
          </div>
          <div style="display:flex; justify-content:flex-end; gap:8px;">
            <button class="btn btn-secondary" onclick="window.closeIndentForm()">Cancel</button>
            <button class="btn btn-primary" onclick="window.submitO2Exchange()">Exchange Cylinders</button>
          </div>
        </div>
      `;
    }
  }

  // Reservation Wizard Modal
  window.openReservationWizard = async function() {
    var pUhid = await customPrompt("Enter Patient UHID:", "SH-2026-00445");
    if (!pUhid) return;
    var proc = await customPrompt("Enter Surgery / Procedure Name:", "Ortho Hip Surgery");
    var code = await customPrompt("Enter Item code to reserve:", "ITM-IMP-003");
    var qty = parseInt(await customPrompt("Enter Reservation Qty:", "1")) || 1;

    var item = window.state.invStock.find(s => s.code === code);
    if (!item) { alert("Invalid Item code."); return; }
    if (item.qty < qty) { alert("Requested reservation qty exceeds current stock."); return; }

    // Reserve stock
    item.qty -= qty;
    window.state.invReservations.unshift({
      id: "RES-2026-" + String(100 + window.state.invReservations.length),
      patientUhid: pUhid,
      procedure: proc,
      items: [{ code: code, name: item.name, qty: qty }],
      timeNeeded: "Scheduled tomorrow 09:00",
      active: true
    });

    alert(`Stock Reserved!\nItem: ${item.name} (${qty} ${item.unit})\nReserved from available ledger count. Reservation auto-expires in 24 hours.`);
    renderInventoryLayout(document.getElementById('main-content'));
  };

  window.saveAsTemplate = async function() {
    var name = await customPrompt("Enter Template Name:");
    if (!name) return;
    if (newIndentItems.length === 0) {
      alert("No items in indent to save.");
      return;
    }
    window.state.invTemplates.push({
      name: name,
      dept: "ICU",
      items: newIndentItems.map(it => ({ code: it.code, name: it.name, qty: it.qty }))
    });
    alert(`Template "${name}" saved successfully.`);
  };

  window.addDraftIndentRow = function() {
    var code = document.getElementById('ind-draft-item').value;
    var unit = document.getElementById('ind-draft-unit').value.trim();
    var qty = parseInt(document.getElementById('ind-draft-qty').value) || 1;
    var purpose = document.getElementById('ind-draft-purpose').value.trim();

    var targetItem = window.state.invStock.find(s => s.code === code);
    if (!targetItem) return;

    newIndentItems.push({
      code: code,
      name: targetItem.name,
      unit: unit,
      qty: qty,
      purpose: purpose
    });

    document.getElementById('ind-draft-qty').value = '10';
    document.getElementById('ind-draft-purpose').value = '';
    renderInventoryLayout(document.getElementById('main-content'));
  };

  window.removeDraftIndentRow = function(idx) {
    newIndentItems.splice(idx, 1);
    renderInventoryLayout(document.getElementById('main-content'));
  };

  window.submitIndentForm = function() {
    if (newIndentItems.length === 0) {
      alert("Please add at least one item row to the indent.");
      return;
    }

    var dept = document.getElementById('ind-form-dept').value;
    var urgency = document.getElementById('ind-form-urgency').value;
    var notes = document.getElementById('ind-form-notes').value;
    var indentId = "IND-2026-0" + Math.floor(342 + Math.random() * 50);

    var mappedItems = newIndentItems.map(itm => {
      var s = window.state.invStock.find(st => st.code === itm.code);
      return {
        code: itm.code,
        name: itm.name,
        req: itm.qty,
        av: s ? s.qty : 0,
        unit: itm.unit,
        issueQty: itm.qty,
        batch: s ? s.batch : '—',
        notes: itm.purpose || ''
      };
    });

    window.state.invIndents.unshift({
      id: indentId,
      type: "Consumable",
      dept: dept,
      itemsCount: newIndentItems.length,
      raisedBy: "Nurse Coordinator",
      raisedAt: "Today · " + new Date().toLocaleTimeString('en-US', {hour:'2-digit', minute:'2-digit'}),
      urgency: urgency,
      status: "Pending",
      notes: notes,
      items: mappedItems
    });

    if (urgency === 'STAT') {
      alert(`⚠️ STAT Emergency Indent ${indentId} raised! Alerts dispatched to Store Manager.`);
    } else {
      alert(`Indent ${indentId} successfully submitted to Store Manager's queue.`);
    }

    isNewIndentOpen = false;
    newIndentItems = [];
    renderInventoryLayout(document.getElementById('main-content'));
  };

  window.submitPurchaseRequest = function() {
    var desc = document.getElementById('pr-form-desc').value;
    var cat = document.getElementById('pr-form-cat').value;
    var rate = document.getElementById('pr-form-rate').value;
    var qty = document.getElementById('pr-form-qty').value;
    var justification = document.getElementById('pr-form-justification').value;

    var prId = "PR-2026-0" + Math.floor(12 + Math.random() * 50);
    window.state.invIndents.unshift({
      id: prId,
      type: "Purchase",
      dept: activeRole === 'Department Head' ? 'OT' : 'Main Store',
      itemsCount: 1,
      raisedBy: activeRole,
      raisedAt: "Today",
      urgency: "Routine",
      status: "Admin Approval pending",
      items: [
        { name: desc, req: qty, category: cat, rate: rate, justification: justification }
      ]
    });

    alert(`Purchase Request ${prId} submitted for Admin Approval.`);
    isNewIndentOpen = false;
    renderInventoryLayout(document.getElementById('main-content'));
  };

  window.submitReturnableRequest = function() {
    var assetCode = document.getElementById('ret-form-asset').value;
    var qty = document.getElementById('ret-form-qty').value;
    var end = document.getElementById('ret-form-end').value;
    var uhid = document.getElementById('ret-form-uhid').value;

    var asset = window.state.invAssets.find(a => a.code === assetCode);
    if (!asset) return;

    var retId = "RET-2026-0" + Math.floor(12 + Math.random() * 50);
    window.state.invIndents.unshift({
      id: retId,
      type: "Returnable",
      dept: 'OPD',
      itemsCount: 1,
      raisedBy: activeRole,
      raisedAt: "Today",
      urgency: "Routine",
      status: "Pending",
      items: [
        { code: assetCode, name: asset.name, req: qty, expectedReturn: end, patientRef: uhid }
      ]
    });

    alert(`Returnable Asset Request ${retId} created.`);
    isNewIndentOpen = false;
    renderInventoryLayout(document.getElementById('main-content'));
  };

  window.filterBranchReqSearch = function(query) {
    branchReqItemQuery = query;
    var dd = document.getElementById('branch-req-dropdown');
    if (!dd) return;
    if (query.trim().length < 2) { dd.style.display = 'none'; return; }
    var q = query.toLowerCase();
    var matches = window.state.invStock.filter(s =>
      s.name.toLowerCase().includes(q) || s.code.toLowerCase().includes(q)
    ).slice(0, 8);
    if (!matches.length) { dd.style.display = 'none'; return; }
    dd.innerHTML = matches.map(s => `
      <div onclick="window.selectBranchReqItem('${s.code}','${s.name.replace(/'/g,'&#39;')}')"
        style="padding:8px 12px; cursor:pointer; font-size:0.78rem; border-bottom:1px solid var(--border-color);"
        onmouseover="this.style.background='var(--bg-base-elevated)'" onmouseout="this.style.background=''">
        <strong>${s.name}</strong> <span class="mono" style="font-size:0.7rem;">${s.code}</span>
        <span style="color:var(--text-muted); margin-left:8px;">Av: ${s.qty} ${s.unit}</span>
      </div>`).join('');
    dd.style.display = 'block';
  };

  window.selectBranchReqItem = function(code, name) {
    var el = document.getElementById('branch-req-search');
    var hidden = document.getElementById('branch-req-item-code');
    var dd = document.getElementById('branch-req-dropdown');
    if (el) el.value = name + ' (' + code + ')';
    if (hidden) hidden.value = code;
    if (dd) dd.style.display = 'none';
    branchReqItemQuery = name + ' (' + code + ')';
  };

  window.addBranchReqRow = function() {
    var code = (document.getElementById('branch-req-item-code') || {}).value;
    var qty = parseInt((document.getElementById('branch-req-qty') || {}).value) || 1;
    if (!code) { alert('Please search and select an item first.'); return; }
    var item = window.state.invStock.find(s => s.code === code);
    if (!item) return;
    var existing = branchReqDraftItems.find(r => r.code === code);
    if (existing) { existing.qty += qty; }
    else { branchReqDraftItems.push({ code: code, name: item.name, qty: qty, av: item.qty, unit: item.unit }); }
    branchReqItemQuery = '';
    renderInventoryLayout(document.getElementById('main-content'));
  };

  window.removeBranchReqRow = function(idx) {
    branchReqDraftItems.splice(idx, 1);
    renderInventoryLayout(document.getElementById('main-content'));
  };

  window.submitBranchStockRequest = function() {
    if (branchReqDraftItems.length === 0) {
      alert('Please add at least one item to the Branch Stock Request.');
      return;
    }
    // Check stock availability
    for (var br of branchReqDraftItems) {
      var stockItem = window.state.invStock.find(s => s.code === br.code);
      if (stockItem && stockItem.qty < br.qty) {
        alert(`Insufficient stock for ${br.name}. Available: ${stockItem.qty} ${stockItem.unit}, Requested: ${br.qty}.`);
        return;
      }
    }
    var totalVal = branchReqDraftItems.reduce((a, b) => a + b.qty * 150, 0);
    var trfId = 'TRF-2026-0' + Math.floor(62 + Math.random() * 30);
    window.state.invTransfers.unshift({
      id: trfId,
      type: 'Branch',
      from: 'Bengaluru Campus',
      to: 'Whitefield',
      items: branchReqDraftItems.length + ' items',
      value: totalVal,
      status: 'In Transit',
      date: 'Today'
    });
    // Deduct stock from supplying store
    branchReqDraftItems.forEach(br => {
      var s = window.state.invStock.find(st => st.code === br.code);
      if (s) s.qty -= br.qty;
    });
    alert(`Branch Stock Request ${trfId} dispatched! ${branchReqDraftItems.length} item(s), value ₹${totalVal.toLocaleString('en-IN')}. Stock deducted from Bengaluru Main Store.`);
    branchReqDraftItems = [];
    branchReqItemQuery = '';
    isNewIndentOpen = false;
    renderInventoryLayout(document.getElementById('main-content'));
  };

  window.submitO2Exchange = function() {
    var returned = parseInt(document.getElementById('o2-returned-qty').value) || 0;
    var requested = parseInt(document.getElementById('o2-requested-qty').value) || 0;
    var serials = document.getElementById('o2-serials').value;
    var type = document.getElementById('o2-type').value;

    alert(`Cylinder Exchange Logged!\nType: ${type}\nReturned Empty: ${returned} (Serials: ${serials})\nFull Issued: ${requested}`);
    isNewIndentOpen = false;
    renderInventoryLayout(document.getElementById('main-content'));
  };

  function renderFulfilQueueList() {
    if (activeFulfilQueueTab === 'consumable') {
      var consumableList = window.state.invIndents.filter(i => i.type === 'Consumable' && (i.status === 'Pending' || i.status === 'Partially Issued'));
      
      return consumableList.map(ind => `
        <div style="border:1px solid var(--border-color); padding:1rem; border-radius:var(--radius-sm); margin-bottom:12px; background:var(--bg-surface);">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <div>
              <strong>Indent ${ind.id} · ${ind.dept} · <span style="color:var(--color-danger);">${ind.urgency}</span></strong>
              <div style="font-size:0.75rem; color:var(--text-muted); margin-top:2px;">Raised: ${ind.raisedAt} · By: ${ind.raisedBy}</div>
            </div>
            <button class="btn btn-primary btn-sm" onclick="window.reviewIndentForm('${ind.id}')">Review</button>
          </div>
          
          ${selectedTripId === ind.id ? renderFulfillmentPanel(ind) : ''}
        </div>
      `).join('') || `<div style="text-align:center; padding:20px; color:var(--text-muted);">No pending consumable indents.</div>`;
    } else if (activeFulfilQueueTab === 'purchase') {
      var purchaseList = window.state.invIndents.filter(i => i.type === 'Purchase' && i.status.includes('pending'));
      return purchaseList.map(pr => `
        <div style="border:1px solid var(--border-color); padding:1rem; border-radius:var(--radius-sm); margin-bottom:12px; background:var(--bg-surface);">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <div>
              <strong>Purchase Request ${pr.id} · ${pr.dept}</strong>
              <div style="font-size:0.75rem; color:var(--text-muted); margin-top:2px;">Item: ${pr.items[0].name} · Qty: ${pr.items[0].req} · Justification: ${pr.items[0].justification}</div>
            </div>
            <div style="display:flex; gap:8px;">
              <button class="btn btn-secondary btn-sm" onclick="window.rejectPurchaseRequest('${pr.id}')">Reject</button>
              <button class="btn btn-primary btn-sm" onclick="window.approvePurchaseRequest('${pr.id}')">Approve &amp; Raise PO</button>
            </div>
          </div>
        </div>
      `).join('') || `<div style="text-align:center; padding:20px; color:var(--text-muted);">No pending purchase requests.</div>`;
    } else if (activeFulfilQueueTab === 'returnable') {
      var returnableList = window.state.invIndents.filter(i => i.type === 'Returnable' && i.status === 'Pending');
      return returnableList.map(ret => `
        <div style="border:1px solid var(--border-color); padding:1rem; border-radius:var(--radius-sm); margin-bottom:12px; background:var(--bg-surface);">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <div>
              <strong>Returnable Asset Request ${ret.id} · ${ret.dept}</strong>
              <div style="font-size:0.75rem; color:var(--text-muted); margin-top:2px;">Asset: ${ret.items[0].name} · Expected Return: ${ret.items[0].expectedReturn}</div>
            </div>
            <button class="btn btn-primary btn-sm" onclick="window.issueReturnableAsset('${ret.id}', '${ret.items[0].code}')">Issue Asset</button>
          </div>
        </div>
      `).join('') || `<div style="text-align:center; padding:20px; color:var(--text-muted);">No pending returnable asset requests.</div>`;
    } else if (activeFulfilQueueTab === 'branch') {
      var branchList = window.state.invTransfers.filter(t => t.type === 'Branch' && t.status === 'In Transit');
      return branchList.map(trf => `
        <div style="border:1px solid var(--border-color); padding:1rem; border-radius:var(--radius-sm); margin-bottom:12px; background:var(--bg-surface);">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <div>
              <strong>Branch Stock Request ${trf.id}</strong>
              <div style="font-size:0.75rem; color:var(--text-muted); margin-top:2px;">From: ${trf.from} → To: ${trf.to} · Value: ₹${trf.value}</div>
            </div>
            <button class="btn btn-primary btn-sm" onclick="window.confirmTransferReceipt('${trf.id}')">Confirm Receipt</button>
          </div>
        </div>
      `).join('') || `<div style="text-align:center; padding:20px; color:var(--text-muted);">No branch stock requests in transit.</div>`;
    }
  }

  window.reviewIndentForm = function(id) {
    selectedTripId = selectedTripId === id ? '' : id;
    renderInventoryLayout(document.getElementById('main-content'));
  };

  window.approvePurchaseRequest = function(id) {
    var pr = window.state.invIndents.find(i => i.id === id);
    if (pr) {
      pr.status = 'Approved';
      // Auto raise PO
      window.state.invPOs.unshift({
        poId: "PO-2026-0099",
        vendorName: "Ansell Healthcare",
        date: "Today",
        items: pr.items[0].name,
        val: pr.items[0].rate * pr.items[0].req,
        status: "Submitted"
      });
      alert(`Purchase Request Approved! PO-2026-0099 generated and dispatched.`);
      renderInventoryLayout(document.getElementById('main-content'));
    }
  };

  window.rejectPurchaseRequest = async function(id) {
    var reason = await customPrompt("Enter Rejection Reason:");
    if (reason) {
      var pr = window.state.invIndents.find(i => i.id === id);
      if (pr) {
        pr.status = 'Rejected';
        alert(`Purchase Request ${id} has been Rejected. Reason: ${reason}`);
        renderInventoryLayout(document.getElementById('main-content'));
      }
    }
  };

  window.issueReturnableAsset = function(id, assetCode) {
    var ret = window.state.invIndents.find(i => i.id === id);
    if (ret) {
      ret.status = 'Issued';
      var asset = window.state.invAssets.find(a => a.code === assetCode);
      if (asset) {
        asset.status = 'Active';
        asset.location = ret.dept;
      }
      alert(`Asset ${assetCode} marked as Issued to ${ret.dept} department.`);
      renderInventoryLayout(document.getElementById('main-content'));
    }
  };

  function renderFulfillmentPanel(ind) {
    var patientAlertHTML = '';
    if (ind.patientRef) {
      patientAlertHTML = `
        <div style="background:var(--bb-blue-light); border:1px solid var(--bb-blue); color:var(--bb-blue); padding:10px; border-radius:4px; margin-bottom:10px; font-size:0.75rem; font-weight:700;">
          👤 Patient Linked for Billing: UHID ${ind.patientRef} (Charges will post automatically on fulfilment)
        </div>
      `;
    }
    return `
      <div style="background:var(--bg-base-elevated); border:1px solid var(--border-color); border-radius:var(--radius-sm); padding:1rem; margin-top:10px;">
        <h4 style="margin:0 0 8px 0; font-size:0.8rem; color:var(--text-primary); text-transform:uppercase; font-family:var(--font-display);">📦 Fulfill Indent Checklist (FIFO/FEFO Selection)</h4>
        ${patientAlertHTML}
        
        <table class="custom-table" style="font-size:0.75rem; margin-bottom:10px;">
          <thead>
            <tr>
              <th>Item</th>
              <th>Requested</th>
              <th>Available</th>
              <th>Issue Qty</th>
              <th>Batch to Issue</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            ${(ind.items || []).map(itm => `
              <tr>
                <td><strong>${itm.name}</strong></td>
                <td>${itm.req}</td>
                <td>${itm.av}</td>
                <td><input type="number" class="form-control" id="issue-qty-${ind.id}-${itm.code}" style="width:70px; padding:2px; font-size:0.75rem;" value="${itm.issueQty}"></td>
                <td>
                  <select class="form-select" style="width:150px; padding:2px; font-size:0.75rem;" onchange="window.handleBatchSelectChange('${ind.id}', '${itm.code}', this.value)">
                    <option value="${itm.batch}">${itm.batch} (FIFO Auto-selected)</option>
                    <option value="override">Override Batch...</option>
                  </select>
                </td>
                <td><input type="text" class="form-control" id="issue-notes-${ind.id}-${itm.code}" style="padding:2px; font-size:0.75rem;" value="${itm.notes || ''}"></td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px; border-top:1px solid var(--border-color); padding-top:12px; margin-top:12px;">
          <div style="display:flex; align-items:center; gap:8px;">
            <input type="text" id="ind-reject-reason-${ind.id}" class="form-control" placeholder="Rejection reason..." style="width:200px; font-size:0.75rem; padding:4px 8px;">
            <button class="btn btn-secondary btn-sm" style="border-color:var(--color-danger); color:var(--color-danger); font-weight:700;" onclick="window.rejectIndent('${ind.id}')">Cancel/Reject</button>
          </div>
          
          <div style="display:flex; gap:8px;">
            <button class="btn btn-secondary btn-sm" style="border-color:var(--color-warning); color:var(--color-warning); font-weight:700;" onclick="window.finalizeIndentFulfill('${ind.id}', true)">Partially Fulfill</button>
            <button class="btn btn-primary btn-sm" onclick="window.finalizeIndentFulfill('${ind.id}', false)">Fulfill All</button>
          </div>
        </div>
      </div>
    `;
  }

  window.handleBatchSelectChange = async function (indentId, itemCode, val) {
    if (val === 'override') {
      var reason = await customPrompt("Enter mandatory override reason for deviating from FIFO/FEFO selection:");
      if (!reason) {
        alert("Batch override cancelled. Reverting to FIFO selection.");
        renderInventoryLayout(document.getElementById('main-content'));
      } else {
        alert(`FIFO override approved. Reason logged: "${reason}"`);
      }
    }
  };

  window.rejectIndent = function(id) {
    var reason = document.getElementById(`ind-reject-reason-${id}`).value.trim();
    if (!reason) {
      alert("Please enter a rejection reason.");
      return;
    }

    var ind = window.state.invIndents.find(i => i.id === id);
    if (ind) {
      ind.status = 'Rejected';
      ind.notes = 'Rejected reason: ' + reason;
      alert(`Indent ${id} has been marked Rejected.`);
      renderInventoryLayout(document.getElementById('main-content'));
    }
  };

  window.finalizeIndentFulfill = function(id, isPartial) {
    var ind = window.state.invIndents.find(i => i.id === id);
    if (ind) {
      ind.status = isPartial ? 'Partially Issued' : 'Fulfilled';
      // Deduct stock
      ind.items.forEach(itm => {
        var s = window.state.invStock.find(st => st.code === itm.code);
        var inputVal = parseInt(document.getElementById(`issue-qty-${id}-${itm.code}`).value) || 0;
        if (s) {
          s.qty = Math.max(0, s.qty - inputVal);
        }
      });

      // Post patient charges if patientRef is present
      if (ind.patientRef) {
        var patient = window.state.patients.find(p => p.uhid === ind.patientRef);
        if (patient) {
          var bill = window.state.billing.find(b => b.uhid === ind.patientRef && b.status !== 'Settled');
          if (!bill) {
            bill = {
              id: "INV" + String(8000 + window.state.billing.length + 1),
              uhid: ind.patientRef,
              patientName: patient.name,
              date: new Date().toISOString().split('T')[0],
              amount: 0,
              paid: 0,
              status: "Outstanding",
              items: []
            };
            window.state.billing.push(bill);
          }
          
          var postedAmount = 0;
          ind.items.forEach(itm => {
            var s = window.state.invStock.find(st => st.code === itm.code);
            var inputVal = parseInt(document.getElementById(`issue-qty-${id}-${itm.code}`).value) || 0;
            if (inputVal > 0) {
              var rate = s ? s.rate : 150; // default rate if missing
              var total = inputVal * rate;
              bill.items.push({
                desc: `Material Issued: ${itm.name} (Indent ${ind.id})`,
                qty: inputVal,
                rate: rate,
                total: total
              });
              bill.amount += total;
              postedAmount += total;
            }
          });
          alert(`Indent ${ind.id} processed successfully. Stock registers updated and ₹${postedAmount.toLocaleString('en-IN')} tagged to Patient ${patient.name} (${ind.patientRef}) bill.`);
        } else {
          alert(`Indent ${ind.id} processed successfully. Tagged patient ${ind.patientRef} not found in register.`);
        }
      } else {
        alert(`Indent ${id} processed successfully as ${ind.status}. Stock registers updated.`);
      }

      renderInventoryLayout(document.getElementById('main-content'));
    }
  };

  /* ==========================================================================
     TAB 4 — MY REQUESTS
     ========================================================================== */
  function renderMyRequestsTab() {
    var rowsHTML = window.state.invIndents.map(ind => `
      <tr style="border-bottom:1px solid var(--border-color);">
        <td style="padding:12px;" class="mono">${ind.id}</td>
        <td style="padding:12px;"><span class="badge badge-primary">${ind.type}</span></td>
        <td style="padding:12px;"><span class="badge ${ind.urgency === 'URGENT' ? 'badge-danger' : 'badge-secondary'}">${ind.urgency || 'Routine'}</span></td>
        <td style="padding:12px;">${ind.itemsCount} items</td>
        <td style="padding:12px;"><span class="badge badge-success">${ind.status}</span></td>
        <td style="padding:12px;" class="mono">${ind.raisedAt}</td>
        <td style="padding:12px; text-align:right;">
          <button class="btn btn-secondary btn-sm" onclick="window.viewMyRequestDetails('${ind.id}')">View</button>
          ${ind.status === 'Pending' ? `<button class="btn btn-secondary btn-sm" style="color:var(--color-danger);" onclick="window.cancelMyRequest('${ind.id}')">Cancel</button>` : ''}
        </td>
      </tr>
    `).join('');

    return `
      <div class="card" style="box-shadow:var(--shadow-sm);">
        <div class="card-header" style="background:var(--bg-base-elevated);">
          <h3 class="card-title" style="font-size:0.9rem;">📥 Department-Facing Status Tracker</h3>
        </div>
        <div class="custom-table-container">
          <table class="custom-table">
            <thead>
              <tr>
                <th>Request ID</th><th>Type</th><th>Urgency</th><th>Items</th><th>Status</th><th>Date</th><th style="text-align:right;">Action</th>
              </tr>
            </thead>
            <tbody>${rowsHTML}</tbody>
          </table>
        </div>
      </div>
    `;
  }

  window.viewMyRequestDetails = function(id) {
    var ind = window.state.invIndents.find(i => i.id === id);
    if (ind) {
      alert(`[Request Detail - ${id}]\nDept: ${ind.dept}\nStatus: ${ind.status}\nRaised By: ${ind.raisedBy}\nItems count: ${ind.itemsCount}\nNotes: ${ind.notes || 'None'}`);
    }
  };

  window.cancelMyRequest = async function(id) {
    var reason = await customPrompt("Enter cancel reason (mandatory):");
    if (!reason) { alert("Cancellation cancelled."); return; }
    var ind = window.state.invIndents.find(i => i.id === id);
    if (ind) {
      ind.status = 'Cancelled';
      ind.notes = 'Cancelled: ' + reason;
      alert(`Request ${id} cancelled successfully.`);
      renderInventoryLayout(document.getElementById('main-content'));
    }
  };

  /* ==========================================================================
     TAB 5 — INTER-TRANSFER (4A & 4B)
     ========================================================================== */
  function renderTransferTab() {
    var subTabsHTML = `
      <div style="display:flex; gap:10px; margin-bottom:1.5rem; background:var(--bg-surface); padding:8px; border-radius:var(--radius-sm); border:1px solid var(--border-color);">
        <button class="btn ${activeTransferSubTab === 'branch' ? 'btn-primary' : 'btn-secondary'} btn-sm" onclick="window.setTransferSubTab('branch')">4A — Inter-Branch Transfer</button>
        <button class="btn ${activeTransferSubTab === 'dept' ? 'btn-primary' : 'btn-secondary'} btn-sm" onclick="window.setTransferSubTab('dept')">4B — Inter-Department Transfer</button>
        <button class="btn ${activeTransferSubTab === 'register' ? 'btn-primary' : 'btn-secondary'} btn-sm" onclick="window.setTransferSubTab('register')">4C — Transfer Register</button>
      </div>
    `;

    var activeTransferContent = '';

    if (activeTransferSubTab === 'branch') {
      var branchDraftHTML = branchTransferDraftItems.length > 0 ? `
        <table class="custom-table" style="margin-top:12px; font-size:0.75rem;">
          <thead>
            <tr><th>Item</th><th>Qty</th><th style="text-align:right;">Remove</th></tr>
          </thead>
          <tbody>
            ${branchTransferDraftItems.map((itm, idx) => `
              <tr>
                <td><strong>${itm.name}</strong> (${itm.code})</td>
                <td>${itm.qty}</td>
                <td style="text-align:right;"><a href="javascript:void(0)" onclick="window.removeBranchTransferDraftRow(${idx})" style="color:var(--color-danger); font-weight:700;">Remove</a></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      ` : '';

      activeTransferContent = `
        <div class="card" style="box-shadow:var(--shadow-sm); padding:1.25rem; border-color:var(--primary);">
          <h3 style="margin:0 0 1rem 0; font-size:1rem; color:var(--text-primary);">+ Raise Inter-Branch Stock Dispatch</h3>
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-bottom:1rem;">
            <div class="form-group">
              <label class="form-label">From Branch *</label>
              <select id="bt-form-from" class="form-select"><option value="Bengaluru Campus">Bengaluru Campus</option></select>
            </div>
            <div class="form-group">
              <label class="form-label">To Branch *</label>
              <select id="bt-form-to" class="form-select">
                <option value="Whitefield">Whitefield</option>
                <option value="Electronic City">Electronic City</option>
              </select>
            </div>
          </div>

          <div class="checklist-card" style="margin-bottom:1rem;">
            <label class="form-label" style="font-weight:700;">Search & Add Dispatch Items</label>
            <div style="display:grid; grid-template-columns:2fr 1fr auto; gap:8px; margin-top:8px; align-items:center;">
              <div style="position:relative;">
                <input type="text" id="bt-search-item" class="form-control" placeholder="Search item by name/code..." autocomplete="off"
                  oninput="window.filterBranchTransferSearch(this.value)" value="${branchTransferItemQuery}">
                <div id="bt-search-dropdown" style="position:absolute; top:100%; left:0; right:0; background:var(--bg-surface); border:1px solid var(--border-color); z-index:100; max-height:180px; overflow-y:auto; display:none;"></div>
                <input type="hidden" id="bt-search-code" value="">
              </div>
              <input type="number" id="bt-search-qty" class="form-control" placeholder="Qty" value="10" min="1">
              <button class="btn btn-secondary btn-sm" onclick="window.addBranchTransferDraftRow()">+ Add Item</button>
            </div>
            ${branchDraftHTML}
          </div>

          <div style="display:flex; justify-content:flex-end; gap:8px;">
            <button class="btn btn-secondary" onclick="window.switchInventoryTab('dashboard')">Cancel</button>
            <button class="btn btn-primary" onclick="window.submitBranchTransfer()">Submit for Dispatch Approval</button>
          </div>
        </div>
      `;
    } else if (activeTransferSubTab === 'dept') {
      var deptDraftHTML = deptTransferDraftItems.length > 0 ? `
        <table class="custom-table" style="margin-top:12px; font-size:0.75rem;">
          <thead>
            <tr><th>Item</th><th>Qty</th><th style="text-align:right;">Remove</th></tr>
          </thead>
          <tbody>
            ${deptTransferDraftItems.map((itm, idx) => `
              <tr>
                <td><strong>${itm.name}</strong> (${itm.code})</td>
                <td>${itm.qty}</td>
                <td style="text-align:right;"><a href="javascript:void(0)" onclick="window.removeDeptTransferDraftRow(${idx})" style="color:var(--color-danger); font-weight:700;">Remove</a></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      ` : '';

      activeTransferContent = `
        <div class="card" style="box-shadow:var(--shadow-sm); padding:1.25rem; border-color:var(--primary);">
          <h3 style="margin:0 0 1rem 0; font-size:1rem; color:var(--text-primary);">+ Raise Inter-Department Stock Transfer</h3>
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-bottom:1rem;">
            <div class="form-group">
              <label class="form-label">Source Dept/Store *</label>
              <select id="dt-form-from" class="form-select">
                <option value="Pharmacy Store">Pharmacy Store</option>
                <option value="Main Store">Main Store</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Target Dept/Sub-store *</label>
              <select id="dt-form-to" class="form-select">
                <option value="ICU Sub-store">ICU Sub-store</option>
                <option value="OT Sub-store">OT Sub-store</option>
              </select>
            </div>
          </div>

          <div class="checklist-card" style="margin-bottom:1rem;">
            <label class="form-label" style="font-weight:700;">Search & Add Transfer Items</label>
            <div style="display:grid; grid-template-columns:2fr 1fr auto; gap:8px; margin-top:8px; align-items:center;">
              <div style="position:relative;">
                <input type="text" id="dt-search-item" class="form-control" placeholder="Search item by name/code..." autocomplete="off"
                  oninput="window.filterDeptTransferSearch(this.value)" value="${deptTransferItemQuery}">
                <div id="dt-search-dropdown" style="position:absolute; top:100%; left:0; right:0; background:var(--bg-surface); border:1px solid var(--border-color); z-index:100; max-height:180px; overflow-y:auto; display:none;"></div>
                <input type="hidden" id="dt-search-code" value="">
              </div>
              <input type="number" id="dt-search-qty" class="form-control" placeholder="Qty" value="5" min="1">
              <button class="btn btn-secondary btn-sm" onclick="window.addDeptTransferDraftRow()">+ Add Item</button>
            </div>
            ${deptDraftHTML}
          </div>

          <div style="display:flex; justify-content:flex-end; gap:8px;">
            <button class="btn btn-secondary" onclick="window.switchInventoryTab('dashboard')">Cancel</button>
            <button class="btn btn-primary" onclick="window.submitDeptTransfer()">Execute Transfer</button>
          </div>
        </div>
      `;
    } else if (activeTransferSubTab === 'register') {
      var transferRows = window.state.invTransfers.map(trf => `
        <tr style="border-bottom: 1px solid var(--border-color);">
          <td style="padding:10px;" class="mono">${trf.id}</td>
          <td style="padding:10px;"><span class="badge ${trf.type === 'Branch' ? 'badge-primary' : 'badge-warning'}">${trf.type}</span></td>
          <td style="padding:10px;">${trf.from}</td>
          <td style="padding:10px;">${trf.to}</td>
          <td style="padding:10px;">${trf.items}</td>
          <td style="padding:10px; font-weight:700;">₹${trf.value}</td>
          <td style="padding:10px;"><span class="badge ${trf.status === 'Received' ? 'badge-success' : 'badge-warning'}">${trf.status}</span></td>
          <td style="padding:10px;" class="mono">${trf.date}</td>
          <td style="padding:10px; text-align:right;">
            ${trf.status === 'In Transit' ? `
              <button class="btn btn-primary btn-sm" onclick="window.confirmTransferReceipt('${trf.id}')">Confirm Receipt</button>
            ` : `<span style="font-size:0.75rem; color:var(--text-muted);">Completed</span>`}
          </td>
        </tr>
      `).join('');

      activeTransferContent = `
        <div class="card" style="box-shadow:var(--shadow-sm);">
          <div class="custom-table-container">
            <table class="custom-table">
              <thead>
                <tr>
                  <th>Transfer ID</th><th>Type</th><th>From</th><th>To</th><th>Items</th><th>Value</th><th>Status</th><th>Date</th><th style="text-align:right;">Action</th>
                </tr>
              </thead>
              <tbody>${transferRows}</tbody>
            </table>
          </div>
        </div>
      `;
    }

    return subTabsHTML + activeTransferContent;
  }

  window.setTransferSubTab = function(val) {
    activeTransferSubTab = val;
    renderInventoryLayout(document.getElementById('main-content'));
  };

  // Suggestive Autocomplete for branch transfer
  window.filterBranchTransferSearch = function(query) {
    branchTransferItemQuery = query;
    var dd = document.getElementById('bt-search-dropdown');
    if (!dd) return;
    if (query.trim().length < 2) { dd.style.display = 'none'; return; }
    var q = query.toLowerCase();
    var matches = window.state.invStock.filter(s =>
      s.name.toLowerCase().includes(q) || s.code.toLowerCase().includes(q)
    ).slice(0, 8);
    if (!matches.length) { dd.style.display = 'none'; return; }
    dd.innerHTML = matches.map(s => `
      <div onclick="window.selectBranchTransferItem('${s.code}','${s.name.replace(/'/g,'&#39;')}')" class="inv-drawer-item">
        <strong>${s.name}</strong> <span class="mono" style="font-size:0.7rem;">${s.code}</span>
        <span style="color:var(--text-muted); float:right;">Av: ${s.qty} ${s.unit}</span>
      </div>`).join('');
    dd.style.display = 'block';
  };

  window.selectBranchTransferItem = function(code, name) {
    document.getElementById('bt-search-item').value = name + ' (' + code + ')';
    document.getElementById('bt-search-code').value = code;
    document.getElementById('bt-search-dropdown').style.display = 'none';
    branchTransferItemQuery = name + ' (' + code + ')';
  };

  window.addBranchTransferDraftRow = function() {
    var code = document.getElementById('bt-search-code').value;
    var qty = parseInt(document.getElementById('bt-search-qty').value) || 1;
    if (!code) { alert("Select an item first."); return; }
    var item = window.state.invStock.find(s => s.code === code);
    if (!item) return;

    var exist = branchTransferDraftItems.find(i => i.code === code);
    if (exist) { exist.qty += qty; }
    else { branchTransferDraftItems.push({ code: code, name: item.name, qty: qty }); }

    branchTransferItemQuery = '';
    renderInventoryLayout(document.getElementById('main-content'));
  };

  window.removeBranchTransferDraftRow = function(idx) {
    branchTransferDraftItems.splice(idx, 1);
    renderInventoryLayout(document.getElementById('main-content'));
  };

  window.submitBranchTransfer = function() {
    if (branchTransferDraftItems.length === 0) {
      alert("No draft items added."); return;
    }
    // Check stock availability & compute total value
    var totalVal = 0;
    for (var itm of branchTransferDraftItems) {
      var s = window.state.invStock.find(st => st.code === itm.code);
      if (s && s.qty < itm.qty) {
        alert(`Insufficient stock for ${itm.name}. Available: ${s.qty}, Dispatching: ${itm.qty}`);
        return;
      }
      totalVal += itm.qty * (s ? s.rate : 100);
    }

    // Role gate for approvals
    var needsAdminApproval = totalVal > 10000;
    if (needsAdminApproval && activeRole !== 'Administrator') {
      alert(`⚠️ Dispatch exceeds ₹10,000 threshold (Total: ₹${totalVal.toLocaleString('en-IN')}). Gated for Administrator Approval.`);
    }

    var trfId = "TRF-2026-0" + Math.floor(42 + Math.random() * 50);
    window.state.invTransfers.unshift({
      id: trfId,
      type: "Branch",
      from: document.getElementById('bt-form-from').value,
      to: document.getElementById('bt-form-to').value,
      items: branchTransferDraftItems.length + " item(s)",
      value: totalVal,
      status: needsAdminApproval ? "Pending Admin Approval" : "In Transit",
      date: "Today"
    });

    if (!needsAdminApproval) {
      // Deduct stock immediately
      branchTransferDraftItems.forEach(itm => {
        var s = window.state.invStock.find(st => st.code === itm.code);
        if (s) s.qty -= itm.qty;
      });
      alert(`Stock Dispatched! Transfer ${trfId} created and marked in transit.`);
    }

    branchTransferDraftItems = [];
    branchTransferItemQuery = '';
    renderInventoryLayout(document.getElementById('main-content'));
  };

  // Suggestive Autocomplete for dept transfer
  window.filterDeptTransferSearch = function(query) {
    deptTransferItemQuery = query;
    var dd = document.getElementById('dt-search-dropdown');
    if (!dd) return;
    if (query.trim().length < 2) { dd.style.display = 'none'; return; }
    var q = query.toLowerCase();
    var matches = window.state.invStock.filter(s =>
      s.name.toLowerCase().includes(q) || s.code.toLowerCase().includes(q)
    ).slice(0, 8);
    if (!matches.length) { dd.style.display = 'none'; return; }
    dd.innerHTML = matches.map(s => `
      <div onclick="window.selectDeptTransferItem('${s.code}','${s.name.replace(/'/g,'&#39;')}')" class="inv-drawer-item">
        <strong>${s.name}</strong> <span class="mono" style="font-size:0.7rem;">${s.code}</span>
        <span style="color:var(--text-muted); float:right;">Av: ${s.qty} ${s.unit}</span>
      </div>`).join('');
    dd.style.display = 'block';
  };

  window.selectDeptTransferItem = function(code, name) {
    document.getElementById('dt-search-item').value = name + ' (' + code + ')';
    document.getElementById('dt-search-code').value = code;
    document.getElementById('dt-search-dropdown').style.display = 'none';
    deptTransferItemQuery = name + ' (' + code + ')';
  };

  window.addDeptTransferDraftRow = function() {
    var code = document.getElementById('dt-search-code').value;
    var qty = parseInt(document.getElementById('dt-search-qty').value) || 1;
    if (!code) { alert("Select an item first."); return; }
    var item = window.state.invStock.find(s => s.code === code);
    if (!item) return;

    var exist = deptTransferDraftItems.find(i => i.code === code);
    if (exist) { exist.qty += qty; }
    else { deptTransferDraftItems.push({ code: code, name: item.name, qty: qty }); }

    deptTransferItemQuery = '';
    renderInventoryLayout(document.getElementById('main-content'));
  };

  window.removeDeptTransferDraftRow = function(idx) {
    deptTransferDraftItems.splice(idx, 1);
    renderInventoryLayout(document.getElementById('main-content'));
  };

  window.submitDeptTransfer = function() {
    if (deptTransferDraftItems.length === 0) {
      alert("No draft items added."); return;
    }
    var totalVal = 0;
    for (var itm of deptTransferDraftItems) {
      var s = window.state.invStock.find(st => st.code === itm.code);
      if (s && s.qty < itm.qty) {
        alert(`Insufficient stock for ${itm.name}. Available: ${s.qty}, Transferring: ${itm.qty}`);
        return;
      }
      totalVal += itm.qty * (s ? s.rate : 50);
    }

    var source = document.getElementById('dt-form-from').value;
    var target = document.getElementById('dt-form-to').value;

    // Role check for above 5000
    if (totalVal > 5000 && activeRole !== 'Store Manager' && activeRole !== 'Administrator') {
      alert(`⚠️ Intra-branch moves above ₹5,000 require Store Manager approval.`);
      return;
    }

    var trfId = "TRF-2026-0" + Math.floor(42 + Math.random() * 50);
    window.state.invTransfers.unshift({
      id: trfId,
      type: "Dept",
      from: source,
      to: target,
      items: deptTransferDraftItems.length + " item(s)",
      value: totalVal,
      status: "Received",
      date: "Today"
    });

    // Execute stock transfers
    deptTransferDraftItems.forEach(itm => {
      var s = window.state.invStock.find(st => st.code === itm.code);
      if (s) {
        s.qty -= itm.qty; // deduct from central
        // increment sub-store (simulated)
      }
    });

    alert(`Transfer Completed! Stock moved from ${source} to ${target}.`);
    deptTransferDraftItems = [];
    deptTransferItemQuery = '';
    renderInventoryLayout(document.getElementById('main-content'));
  };

  window.confirmTransferReceipt = function(id) {
    var trf = window.state.invTransfers.find(t => t.id === id);
    if (trf) {
      trf.status = 'Received';
      alert(`Stock receipt confirmed at ${trf.to} branch location. Ledger balances synchronized.`);
      renderInventoryLayout(document.getElementById('main-content'));
    }
  };

  /* ==========================================================================
     TAB 6 — PROCUREMENT (PO/GRN & SUPPLIER MASTER & CONSIGNMENTS)
     ========================================================================== */
  function renderProcurementTab() {
    var subTabsHTML = `
      <div style="display:flex; gap:10px; margin-bottom:1.5rem; background:var(--bg-surface); padding:8px; border-radius:var(--radius-sm); border:1px solid var(--border-color);">
        <button class="btn ${activeProcureSubTab === 'suppliers' ? 'btn-primary' : 'btn-secondary'} btn-sm" onclick="window.setProcureSubTab('suppliers')">5A — Supplier Master</button>
        <button class="btn ${activeProcureSubTab === 'po' ? 'btn-primary' : 'btn-secondary'} btn-sm" onclick="window.setProcureSubTab('po')">5B — Purchase Orders</button>
        <button class="btn ${activeProcureSubTab === 'grn' ? 'btn-primary' : 'btn-secondary'} btn-sm" onclick="window.setProcureSubTab('grn')">5C — GRN</button>
        <button class="btn ${activeProcureSubTab === 'returns' ? 'btn-primary' : 'btn-secondary'} btn-sm" onclick="window.setProcureSubTab('returns')">5D — Supplier Returns</button>
        <button class="btn ${activeProcureSubTab === 'consignment' ? 'btn-primary' : 'btn-secondary'} btn-sm" onclick="window.setProcureSubTab('consignment')">5E — Consignment Management</button>
      </div>
    `;

    var activeProcureContent = '';

    if (activeProcureSubTab === 'suppliers') {
      var supRows = window.state.invSuppliers.map(sup => `
        <tr style="border-bottom: 1px solid var(--border-color);">
          <td style="padding:10px; font-weight:700;">${sup.name}</td>
          <td style="padding:10px;">${sup.category}</td>
          <td style="padding:10px;" class="mono">${sup.contact}</td>
          <td style="padding:10px;">${sup.leadTime}</td>
          <td style="padding:10px;">${sup.moq}</td>
          <td style="padding:10px; font-weight:700;">⭐ ${sup.rating.toFixed(1)}/5</td>
          <td style="padding:10px; text-align:right;"><button class="btn btn-secondary btn-sm" onclick="window.infoToast('Supplier details loaded.')">Edit</button></td>
        </tr>
      `).join('');

      activeProcureContent = `
        <div class="card" style="box-shadow:var(--shadow-sm);">
          <div style="padding:10px; display:flex; justify-content:flex-end;">
            <button class="btn btn-primary" onclick="window.infoToast('Add Supplier Wizard Opened.')">+ Add Supplier</button>
          </div>
          <div class="custom-table-container">
            <table class="custom-table">
              <thead>
                <tr><th>Supplier</th><th>Category</th><th>Contact</th><th>Lead Time</th><th>MOQ Policy</th><th>Score</th><th style="text-align:right;">Action</th></tr>
              </thead>
              <tbody>${supRows}</tbody>
            </table>
          </div>
        </div>
      `;
    } else if (activeProcureSubTab === 'po') {
      var poRows = window.state.invPOs.map(po => `
        <tr style="border-bottom: 1px solid var(--border-color);">
          <td style="padding:10px; font-weight:700;" class="mono">${po.poId}</td>
          <td style="padding:10px;">${po.vendorName}</td>
          <td style="padding:10px;" class="mono">${po.date}</td>
          <td style="padding:10px;">${po.items}</td>
          <td style="padding:10px; font-weight:700;">₹${po.val}</td>
          <td style="padding:10px;"><span class="badge badge-primary">${po.status}</span></td>
          <td style="padding:10px; text-align:right;">
            <button class="btn btn-secondary btn-sm" onclick="window.amendPO('${po.poId}')">Amend</button>
            <button class="btn btn-secondary btn-sm" style="color:var(--color-danger);" onclick="window.cancelPO('${po.poId}')">Cancel</button>
          </td>
        </tr>
      `).join('');

      var newPOForm = '';
      if (isNewPOOpen) {
        var selectedVendor = (window.state.invSuppliers || []).find(sup => {
          if (!selectedReorderItem) return false;
          return sup.category.toLowerCase().includes(selectedReorderItem.category.toLowerCase().split(' ')[0]);
        }) || window.state.invSuppliers[0];

        var vendorScoreWarning = (selectedVendor && selectedVendor.rating < 3.0) 
          ? `<div style="color:var(--color-danger); font-size:0.75rem; margin-top:4px; font-weight:bold;">⚠️ Warning: Supplier rating is ${selectedVendor.rating}/5. Excess quality issues reported.</div>`
          : '';

        var draftPOItemsHTML = newPOItems.map((itm, idx) => `
          <div style="display:grid; grid-template-columns:2fr 1fr 1fr auto; gap:12px; margin-top:8px; align-items:center;">
            <input type="text" class="form-control" value="${itm.name} (${itm.code})" readonly style="background:#f1f5f9;">
            <input type="number" class="form-control" value="${itm.qty}" id="po-form-qty-${idx}" onchange="window.updatePOQty(${idx}, this.value)">
            <input type="number" class="form-control" value="${itm.rate}" id="po-form-rate-${idx}" onchange="window.updatePORate(${idx}, this.value)">
            <a href="javascript:void(0)" onclick="window.removePOItem(${idx})" style="color:var(--color-danger);">Remove</a>
          </div>
        `).join('');

        newPOForm = `
          <div class="card" style="box-shadow:var(--shadow-sm); padding:1.25rem; margin-bottom:1.5rem; border-color:var(--primary);">
            <h3 style="margin:0 0 1rem 0; font-size:1rem; color:var(--text-primary);">+ Issue New Purchase Order (PO)</h3>
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-bottom:1rem;">
              <div class="form-group">
                <label class="form-label">Vendor / Supplier</label>
                <select id="po-form-vendor" class="form-select">
                  ${window.state.invSuppliers.map(v => `<option value="${v.name}">${v.name} (Rating: ${v.rating.toFixed(1)}/5)</option>`).join('')}
                </select>
                ${vendorScoreWarning}
              </div>
              <div class="form-group">
                <label class="form-label">Payment Terms</label>
                <input type="text" class="form-control" value="Net 30 Days" id="po-form-terms">
              </div>
            </div>
            
            <div class="checklist-card" style="margin-bottom:1rem;">
              <label class="form-label">Add Line Items</label>
              <div style="display:grid; grid-template-columns:2fr auto; gap:10px; margin-bottom:10px;">
                <div style="position:relative;">
                  <input type="text" class="form-control" placeholder="Search item..." autocomplete="off"
                    oninput="window.filterPOSearch(this.value)" value="${newPOItemQuery}" id="po-item-search-input">
                  <div id="po-item-dropdown" style="position:absolute; top:100%; left:0; right:0; background:var(--bg-surface); border:1px solid var(--border-color); z-index:100; max-height:180px; overflow-y:auto; display:none;"></div>
                </div>
                <button class="btn btn-secondary btn-sm" onclick="window.addPOItemFromSearch()">Add Line</button>
              </div>

              ${draftPOItemsHTML}
            </div>

            <div style="display:flex; justify-content:flex-end; gap:8px;">
              <button class="btn btn-secondary" onclick="window.closePOForm()">Cancel</button>
              <button class="btn btn-primary" onclick="window.submitPOForm()">Submit Purchase Order</button>
            </div>
          </div>
        `;
      }

      activeProcureContent = newPOForm + `
        <div class="card" style="box-shadow:var(--shadow-sm);">
          <div style="padding:10px; display:flex; justify-content:flex-end;">
            <button class="btn btn-primary" onclick="window.openPOForm()">+ New PO</button>
          </div>
          <div class="custom-table-container">
            <table class="custom-table">
              <thead>
                <tr><th>PO ID</th><th>Vendor</th><th>PO Date</th><th>Items</th><th>PO Total</th><th>Status</th><th style="text-align:right;">Actions</th></tr>
              </thead>
              <tbody>${poRows}</tbody>
            </table>
          </div>
        </div>
      `;
    } else if (activeProcureSubTab === 'grn') {
      activeProcureContent = `
        <div class="card" style="box-shadow:var(--shadow-sm); padding:1.25rem; border-color:var(--primary); margin-bottom:1.5rem;">
          <h3 style="margin:0 0 1rem 0; font-size:1rem; color:var(--text-primary);">+ Goods Receipt Note (GRN) Verification</h3>
          
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-bottom:1rem;">
            <div class="form-group">
              <label class="form-label">PO Reference *</label>
              <select id="grn-form-po" class="form-select">
                <option value="PO-2026-0041">PO-2026-0041 (Pfizer India)</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Supplier Invoice No *</label>
              <input type="text" class="form-control" id="grn-form-inv" value="INV-990812">
            </div>
          </div>

          <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-bottom:1.5rem;">
            <div class="form-group">
              <label class="form-label">Invoice Date</label>
              <input type="date" class="form-control" value="2026-07-01">
            </div>
            <div class="form-group">
              <label class="form-label">Invoice Value (₹) *</label>
              <input type="number" class="form-control" id="grn-form-val" value="6000">
            </div>
          </div>

          <!-- Cold chain log checks -->
          <div style="background:var(--bg-base-elevated); padding:1rem; border-radius:var(--radius-sm); margin-bottom:1.5rem; border-left:4px solid var(--color-warning);">
            <strong style="color:var(--text-primary);">❄️ Cold Chain Temperature Log Verification</strong>
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-top:8px; align-items:center;">
              <div class="form-group" style="margin:0;">
                <label class="form-label" style="font-size:0.75rem;">Temperature at Receipt (°C)</label>
                <input type="number" id="grn-cold-temp" class="form-control" value="4.5" step="0.1">
              </div>
              <div class="form-group" style="margin:0;">
                <label class="form-label" style="font-size:0.75rem;">Cold Chain Maintained?</label>
                <select id="grn-cold-ok" class="form-select">
                  <option value="Yes">Yes (Inside 2–8°C range)</option>
                  <option value="No">No (Quarantine Vaccine instantly)</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Split batch allocations -->
          <div style="background:var(--bg-base-elevated); padding:1rem; border-radius:var(--radius-sm); margin-bottom:1.5rem;">
            <strong style="color:var(--text-primary);">📦 Split Batch Allocations to Sub-stores</strong>
            <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:10px; margin-top:8px;">
              <div class="form-group" style="margin:0;"><label class="form-label" style="font-size:0.75rem;">Main Store Qty</label><input type="number" id="split-main" class="form-control" value="30"></div>
              <div class="form-group" style="margin:0;"><label class="form-label" style="font-size:0.75rem;">ICU Store Qty</label><input type="number" id="split-icu" class="form-control" value="10"></div>
              <div class="form-group" style="margin:0;"><label class="form-label" style="font-size:0.75rem;">OT Store Qty</label><input type="number" id="split-ot" class="form-control" value="10"></div>
            </div>
          </div>

          <table class="custom-table" style="font-size:0.75rem; margin-bottom:1rem;">
            <thead>
              <tr><th>Item</th><th>PO Qty</th><th>Received Qty</th><th>Batch No</th><th>Mfg Date</th><th>Expiry</th><th>Condition</th></tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Inj. Fentanyl 100mcg</strong></td>
                <td>50</td>
                <td><input type="number" id="grn-item-qty" class="form-control" style="width:70px; padding:2px;" value="50"></td>
                <td><input type="text" id="grn-item-batch" class="form-control" style="width:100px; padding:2px;" value="BAT-2026-092"></td>
                <td><input type="date" class="form-control" style="padding:2px;" value="2026-06-01"></td>
                <td><input type="date" class="form-control" id="grn-item-exp" style="padding:2px;" value="2028-06-01"></td>
                <td>
                  <select id="grn-item-cond" class="form-select" style="padding:2px; font-size:0.75rem;">
                    <option value="OK">OK</option>
                    <option value="Damaged">Damaged</option>
                    <option value="Short">Short</option>
                  </select>
                </td>
              </tr>
            </tbody>
          </table>

          <div style="display:flex; justify-content:flex-end; gap:8px;">
            <button class="btn btn-secondary" onclick="window.switchInventoryTab('dashboard')">Cancel</button>
            <button class="btn btn-primary" onclick="window.submitGRNForm()">Save GRN &amp; Update Stock</button>
          </div>
        </div>

        <div class="card" style="box-shadow:var(--shadow-sm); padding:1.25rem; border:1px solid var(--color-warning);">
          <h3 style="margin:0 0 1rem 0; font-size:1rem; color:var(--text-primary);">⚡ GRN Without PO (Emergency / Local Purchase)</h3>
          <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:12px; margin-bottom:1rem;">
            <div class="form-group">
              <label class="form-label">Vendor Name</label>
              <input type="text" id="emg-grn-vendor" class="form-control" value="Local Medico Distributors">
            </div>
            <div class="form-group">
              <label class="form-label">Payment Mode</label>
              <select id="emg-grn-mode" class="form-select">
                <option value="Petty cash">Petty Cash</option>
                <option value="Credit">Credit</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Voucher / Receipt No</label>
              <input type="text" id="emg-grn-voucher" class="form-control" value="PC-90821">
            </div>
          </div>
          <div style="display:grid; grid-template-columns:2fr 1fr 1fr; gap:12px; margin-bottom:1rem; align-items:end;">
            <div class="form-group" style="margin:0;">
              <label class="form-label">Item Select</label>
              <select id="emg-grn-item" class="form-select">
                ${window.state.invStock.map(s => `<option value="${s.code}">${s.name}</option>`).join('')}
              </select>
            </div>
            <div class="form-group" style="margin:0;">
              <label class="form-label">Qty purchased</label>
              <input type="number" id="emg-grn-qty" class="form-control" value="10">
            </div>
            <button class="btn btn-primary" onclick="window.submitEmergencyGRN()">Log Emergency Local Purchase</button>
          </div>
        </div>
      `;
    } else if (activeProcureSubTab === 'returns') {
      activeProcureContent = `
        <div class="card" style="box-shadow:var(--shadow-sm); padding:1.25rem;">
          <h3 style="margin:0 0 1rem 0; font-size:1rem; color:var(--text-primary);">+ Raise Return to Supplier</h3>
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-bottom:1rem;">
            <div class="form-group">
              <label class="form-label">Supplier</label>
              <select id="ret-sup-name" class="form-select">
                ${window.state.invSuppliers.map(s => `<option value="${s.name}">${s.name}</option>`).join('')}
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Return Reason</label>
              <select id="ret-sup-reason" class="form-select">
                <option value="Damaged">Damaged Packaging</option>
                <option value="Expired">Expired Stock</option>
                <option value="Excess">Excess Consignment</option>
              </select>
            </div>
          </div>
          <div style="display:grid; grid-template-columns:2fr 1fr; gap:12px; margin-bottom:1.5rem; align-items:end;">
            <div class="form-group" style="margin:0;">
              <label class="form-label">Item Select</label>
              <select id="ret-sup-item" class="form-select">
                ${window.state.invStock.map(s => `<option value="${s.code}">${s.name} (${s.code})</option>`).join('')}
              </select>
            </div>
            <div class="form-group" style="margin:0;">
              <label class="form-label">Return Quantity</label>
              <input type="number" id="ret-sup-qty" class="form-control" value="5">
            </div>
          </div>
          <button class="btn btn-primary" onclick="window.submitSupplierReturn()">Raise Return & Deduct Stock</button>
        </div>
      `;
    } else if (activeProcureSubTab === 'consignment') {
      var conRows = window.state.invConsignments.map(con => `
        <tr style="border-bottom: 1px solid var(--border-color);">
          <td style="padding:10px;" class="mono">${con.code}</td>
          <td style="padding:10px;">${con.name}</td>
          <td style="padding:10px;" class="mono">${con.qty} units</td>
          <td style="padding:10px;">${con.since}</td>
          <td style="padding:10px;"><span class="badge badge-success">${con.status}</span></td>
          <td style="padding:10px; text-align:right;">
            <button class="btn btn-primary btn-sm" onclick="window.markConsignmentUsed('${con.code}')">Mark Used + Bill Patient</button>
          </td>
        </tr>
      `).join('');

      activeProcureContent = `
        <div class="card" style="box-shadow:var(--shadow-sm);">
          <div class="custom-table-container">
            <table class="custom-table">
              <thead>
                <tr><th>Item Code</th><th>Item Details</th><th>Quantity</th><th>Consigned Since</th><th>Status</th><th style="text-align:right;">Action</th></tr>
              </thead>
              <tbody>${conRows}</tbody>
            </table>
          </div>
        </div>
      `;
    }

    return subTabsHTML + activeProcureContent;
  }

  window.setProcureSubTab = function(val) {
    activeProcureSubTab = val;
    renderInventoryLayout(document.getElementById('main-content'));
  };

  // Autocomplete for PO
  window.filterPOSearch = function(query) {
    newPOItemQuery = query;
    var dd = document.getElementById('po-item-dropdown');
    if (!dd) return;
    if (query.trim().length < 2) { dd.style.display = 'none'; return; }
    var q = query.toLowerCase();
    var matches = window.state.invStock.filter(s =>
      s.name.toLowerCase().includes(q) || s.code.toLowerCase().includes(q)
    ).slice(0, 8);
    if (!matches.length) { dd.style.display = 'none'; return; }
    dd.innerHTML = matches.map(s => `
      <div onclick="window.selectPOItem('${s.code}','${s.name.replace(/'/g,'&#39;')}', ${s.rate})" class="inv-drawer-item">
        <strong>${s.name}</strong> <span class="mono" style="font-size:0.7rem;">${s.code}</span>
        <span style="color:var(--text-muted); float:right;">Rate: ₹${s.rate}</span>
      </div>`).join('');
    dd.style.display = 'block';
  };

  window.selectPOItem = function(code, name, rate) {
    document.getElementById('po-item-search-input').value = name + ' (' + code + ')';
    newPOItemQuery = name + ' (' + code + ')';
    window._poSelectedCode = code;
    window._poSelectedName = name;
    window._poSelectedRate = rate;
    document.getElementById('po-item-dropdown').style.display = 'none';
  };

  window.addPOItemFromSearch = function() {
    var code = window._poSelectedCode;
    var name = window._poSelectedName;
    var rate = window._poSelectedRate || 100;
    if (!code) { alert("Select an item first."); return; }

    newPOItems.push({ code: code, name: name, qty: 50, rate: rate });
    newPOItemQuery = '';
    window._poSelectedCode = null;
    document.getElementById('po-item-search-input').value = '';
    renderInventoryLayout(document.getElementById('main-content'));
  };

  window.removePOItem = function(idx) {
    newPOItems.splice(idx, 1);
    renderInventoryLayout(document.getElementById('main-content'));
  };

  window.updatePOQty = function(idx, val) {
    newPOItems[idx].qty = parseInt(val) || 0;
  };

  window.updatePORate = function(idx, val) {
    newPOItems[idx].rate = parseFloat(val) || 0;
  };

  window.openPOForm = function() {
    isNewPOOpen = true;
    newPOItems = [];
    renderInventoryLayout(document.getElementById('main-content'));
  };

  window.closePOForm = function() {
    isNewPOOpen = false;
    renderInventoryLayout(document.getElementById('main-content'));
  };

  window.submitPOForm = function() {
    if (newPOItems.length === 0) { alert("Please add at least one line item."); return; }
    var vendor = document.getElementById('po-form-vendor').value;
    var totalVal = newPOItems.reduce((acc, it) => acc + (it.qty * it.rate), 0);
    var poId = "PO-2026-0" + Math.floor(42 + Math.random() * 50);

    window.state.invPOs.unshift({
      poId: poId,
      vendorName: vendor,
      date: "Today",
      items: newPOItems.map(it => it.name).join(', '),
      val: totalVal,
      status: "Submitted"
    });

    alert(`Purchase Order ${poId} dispatched to ${vendor}! Total Value: ₹${totalVal.toLocaleString('en-IN')}`);
    isNewPOOpen = false;
    renderInventoryLayout(document.getElementById('main-content'));
  };

  window.amendPO = async function(poId) {
    var reason = await customPrompt("Enter PO Amendment Reason:");
    if (reason) {
      alert(`PO Amendment logged for ${poId}. Revision approved.`);
      renderInventoryLayout(document.getElementById('main-content'));
    }
  };

  window.cancelPO = async function(poId) {
    var confirmCancel = await customConfirm(`Are you sure you want to cancel PO ${poId}?`);
    if (confirmCancel) {
      var po = window.state.invPOs.find(p => p.poId === poId);
      if (po) po.status = 'Cancelled';
      alert(`PO ${poId} cancelled successfully.`);
      renderInventoryLayout(document.getElementById('main-content'));
    }
  };

  window.submitGRNForm = function() {
    var poId = document.getElementById('grn-form-po').value;
    var invNo = document.getElementById('grn-form-inv').value;
    var qty = parseInt(document.getElementById('grn-item-qty').value) || 0;
    var batch = document.getElementById('grn-item-batch').value.trim();
    var exp = document.getElementById('grn-item-exp').value;
    var condition = document.getElementById('grn-item-cond').value;

    // Cold chain checks
    var temp = parseFloat(document.getElementById('grn-cold-temp').value) || 4.5;
    var tempOk = document.getElementById('grn-cold-ok').value === 'Yes';
    if (!tempOk) {
      alert("🚨 Cold Chain temperature range broken! GRN blocked. Item auto-routed to Supplier Returns.");
      window.state.invWriteOffs.unshift({
        id: "WO-2026-0" + Math.floor(400 + Math.random()*90),
        name: "Inj. Fentanyl 100mcg (Broken Cold Chain)",
        qty: qty, val: qty * 285, reason: "Cold Chain Break at Receipt",
        status: "Quarantined", authBy: "Store Manager"
      });
      renderInventoryLayout(document.getElementById('main-content'));
      return;
    }

    if (condition === 'Damaged') {
      alert("⚠️ Damaged items received. Quarantined automatically from usable stock.");
      return;
    }

    // Split batches across main/icu/ot locations
    var mainQty = parseInt(document.getElementById('split-main').value) || 0;
    var icuQty = parseInt(document.getElementById('split-icu').value) || 0;
    var otQty = parseInt(document.getElementById('split-ot').value) || 0;
    var totalAlloc = mainQty + icuQty + otQty;

    if (totalAlloc !== qty) {
      alert(`Warning: Total split allocations (${totalAlloc}) does not match received qty (${qty}). Adjusting Main Store balance.`);
      mainQty = qty - (icuQty + otQty);
    }

    // Add to stock ledger
    var s = window.state.invStock.find(st => st.code === 'ITM-DRG-003');
    if (s) {
      s.qty += mainQty;
      s.batch = batch;
      s.expiry = exp;
    }
    
    alert(`GRN Saved successfully!\nStock batch ${batch} received & split: Main Store (+${mainQty}), ICU (+${icuQty}), OT (+${otQty}).`);
    renderInventoryLayout(document.getElementById('main-content'));
  };

  window.submitEmergencyGRN = function() {
    var vendor = document.getElementById('emg-grn-vendor').value.trim();
    var voucher = document.getElementById('emg-grn-voucher').value.trim();
    var code = document.getElementById('emg-grn-item').value;
    var qty = parseInt(document.getElementById('emg-grn-qty').value) || 0;

    if (activeRole !== 'Administrator') {
      alert("⚠️ Emergency Local Purchase requires Administrator role sign-off.");
      return;
    }

    var item = window.state.invStock.find(s => s.code === code);
    if (item) {
      item.qty += qty;
      alert(`Emergency GRN Saved!\nUnplanned local purchase logged for ${item.name}. Stock updated. Finance notified for petty cash voucher ${voucher}.`);
      renderInventoryLayout(document.getElementById('main-content'));
    }
  };

  window.submitSupplierReturn = function() {
    var sup = document.getElementById('ret-sup-name').value;
    var code = document.getElementById('ret-sup-item').value;
    var qty = parseInt(document.getElementById('ret-sup-qty').value) || 0;

    var s = window.state.invStock.find(st => st.code === code);
    if (s && s.qty >= qty) {
      s.qty -= qty;
      alert(`Supplier Return raised to ${sup} for ${qty} ${s.unit} of ${s.name}. Stock deducted.`);
      renderInventoryLayout(document.getElementById('main-content'));
    } else {
      alert("Insufficient stock to return.");
    }
  };

  window.markConsignmentUsed = function(code) {
    var con = window.state.invConsignments.find(c => c.code === code);
    if (con && con.qty > 0) {
      con.qty -= 1;
      // Auto-create patient bill charge
      if (window.state.billing && window.state.billing.length > 0) {
        var activeBill = window.state.billing.find(b => b.status !== 'Settled');
        if (activeBill) {
          activeBill.items.push({
            desc: `${con.name} (Consignment Implant)`,
            qty: 1, rate: 56000, total: 56000
          });
          activeBill.amount += 56000;
          alert(`Consignment item matched! Patient billing charges of ₹56,000 auto-created for UHID ${activeBill.uhid}. Supplier replenishing requested.`);
        } else {
          alert("No active patient IPD bill found. Consignment billed to generic walk-in OPD register.");
        }
      }
      renderInventoryLayout(document.getElementById('main-content'));
    }
  };

  /* ==========================================================================
     TAB 7 — ADJUSTMENTS & WRITE-OFFS & CYCLE COUNTS
     ========================================================================== */
  function renderAdjustmentsTab() {
    var isAdministrator = activeRole === 'Administrator';

    var subTabsHTML = `
      <div style="display:flex; gap:10px; margin-bottom:1.5rem; background:var(--bg-surface); padding:8px; border-radius:var(--radius-sm); border:1px solid var(--border-color);">
        <button class="btn ${activeAdjustSubTab === 'writeoff' ? 'btn-primary' : 'btn-secondary'} btn-sm" onclick="window.setAdjustSubTab('writeoff')">6A — Write-off & Opening Bal</button>
        <button class="btn ${activeAdjustSubTab === 'cycle' ? 'btn-primary' : 'btn-secondary'} btn-sm" onclick="window.setAdjustSubTab('cycle')">6B — Physical / Cycle Count</button>
        <button class="btn ${activeAdjustSubTab === 'recall' ? 'btn-primary' : 'btn-secondary'} btn-sm" onclick="window.setAdjustSubTab('recall')">6C — CDSCO Recall & Quarantine</button>
      </div>
    `;

    var activeAdjustContent = '';

    if (activeAdjustSubTab === 'writeoff') {
      var writeOffRows = window.state.invWriteOffs.map(wo => `
        <tr style="border-bottom: 1px solid var(--border-color);">
          <td style="padding:10px;" class="mono">${wo.id}</td>
          <td style="padding:10px; font-weight:700;">${wo.name}</td>
          <td style="padding:10px;" class="mono">${wo.qty}</td>
          <td style="padding:10px; font-weight:700;">₹${wo.val}</td>
          <td style="padding:10px;">${wo.reason}</td>
          <td style="padding:10px;"><span class="badge ${wo.status === 'Approved' ? 'badge-success' : 'badge-warning'}">${wo.status}</span></td>
          <td style="padding:10px; text-align:right;">
            ${wo.status === 'Pending Admin Approval' && isAdministrator ? `
              <button class="btn btn-primary btn-sm" onclick="window.approveWriteOff('${wo.id}')">Approve Write-off</button>
            ` : `<span style="font-size:0.75rem; color:var(--text-muted);">Authorised: ${wo.authBy}</span>`}
          </td>
        </tr>
      `).join('');

      var newAdjForm = '';
      if (isNewAdjustmentOpen) {
        newPOItemQuery = _adjustPreSelectCode; // Use pre-selected if available
        newAdjForm = `
          <div class="card" style="box-shadow:var(--shadow-sm); padding:1.25rem; margin-bottom:1.5rem; border-color:var(--primary);">
            <h3 style="margin:0 0 1rem 0; font-size:1rem; color:var(--text-primary);">+ Request Stock Write-off / Condemnation</h3>
            
            <div class="form-group" style="margin-bottom:1rem;">
              <label class="form-label">Select Item</label>
              <select id="adj-form-item" class="form-select">
                ${window.state.invStock.map(s => `<option value="${s.code}" ${newPOItemQuery===s.code?'selected':''}>${s.name} (In stock: ${s.qty})</option>`).join('')}
              </select>
            </div>

            <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-bottom:1rem;">
              <div class="form-group">
                <label class="form-label">Write-off Qty</label>
                <input type="number" id="adj-form-qty" class="form-control" value="50">
              </div>
              <div class="form-group">
                <label class="form-label">Unit Rate (₹)</label>
                <input type="number" id="adj-form-rate" class="form-control" value="120">
              </div>
            </div>

            <div class="form-group" style="margin-bottom:1rem;">
              <label class="form-label">Reason for Adjustment</label>
              <select id="adj-form-reason" class="form-select" onchange="window.toggleTheftFields(this.value)">
                <option value="Expired">Expired Stock</option>
                <option value="Damaged">Damaged Packaging</option>
                <option value="Theft">Unaccounted Loss / Theft (Police FIR required)</option>
              </select>
            </div>

            <!-- Mandatory FIR fields if Theft -->
            <div id="theft-fir-fields" style="display:none; background:var(--bg-base-elevated); padding:1rem; border-radius:var(--radius-sm); margin-bottom:1rem; border-left:4px solid var(--color-danger);">
              <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
                <div class="form-group" style="margin:0;"><label class="form-label" style="font-size:0.75rem;">Police FIR Number *</label><input type="text" id="theft-fir-no" class="form-control" value="FIR-2026-9082"></div>
                <div class="form-group" style="margin:0;"><label class="form-label" style="font-size:0.75rem;">Police Station *</label><input type="text" id="theft-station" class="form-control" value="Koramangala P.S."></div>
              </div>
            </div>

            <div style="display:flex; justify-content:flex-end; gap:8px;">
              <button class="btn btn-secondary" onclick="window.closeAdjForm()">Cancel</button>
              <button class="btn btn-primary" onclick="window.submitAdjustmentForm()">Submit Write-off</button>
            </div>
          </div>
        `;
      }

      var openingBalanceFormHTML = `
        <div class="card" style="box-shadow:var(--shadow-sm); padding:1.25rem; margin-bottom:1.5rem; border:1px solid var(--color-success);">
          <h3 style="margin:0 0 1rem 0; font-size:1rem; color:var(--text-primary); font-family:var(--font-display);">⚙️ 6A — Opening Balance Entry (initial setup)</h3>
          <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:12px; margin-bottom:1rem;">
            <div class="form-group" style="margin:0;">
              <label class="form-label">Select Item</label>
              <select id="op-item-code" class="form-select">
                ${window.state.invStock.map(s => `<option value="${s.code}" ${_adjustPreSelectCode === s.code ? 'selected' : ''}>${s.name} (${s.code})</option>`).join('')}
              </select>
            </div>
            <div class="form-group" style="margin:0;">
              <label class="form-label">Initial Opening Qty</label>
              <input type="number" id="op-item-qty" class="form-control" value="100">
            </div>
            <div class="form-group" style="margin:0;">
              <label class="form-label">Opening Batch No *</label>
              <input type="text" id="op-item-batch" class="form-control" value="BAT-NEW-2026">
            </div>
          </div>
          <div style="display:flex; justify-content:flex-end;">
            <button class="btn btn-primary" onclick="window.submitOpeningStock()">Save Opening Balance</button>
          </div>
        </div>
      `;

      activeAdjustContent = openingBalanceFormHTML + newAdjForm + `
        <div class="card" style="box-shadow:var(--shadow-sm);">
          <div style="padding:10px; display:flex; justify-content:flex-end;">
            <button class="btn btn-primary" onclick="window.openAdjForm()">+ Request Write-off</button>
          </div>
          <div class="custom-table-container">
            <table class="custom-table">
              <thead>
                <tr><th>ID</th><th>Item</th><th>Qty</th><th>Total Value</th><th>Reason</th><th>Status</th><th style="text-align:right;">Authorization</th></tr>
              </thead>
              <tbody>${writeOffRows}</tbody>
            </table>
          </div>
        </div>
      `;
    } else if (activeAdjustSubTab === 'cycle') {
      var cycleRows = window.state.invStock.map((s, idx) => {
        var physId = 'cycle-phys-' + idx;
        var isLow = s.qty < s.minFloor;
        return `
          <tr style="border-bottom:1px solid var(--border-color);">
            <td style="padding:8px;"><strong>${s.name}</strong><br><span class="mono" style="font-size:0.7rem;">${s.code}</span></td>
            <td style="padding:8px;"><span class="badge badge-primary" style="font-size:9px;">${s.category.split(' ')[0]}</span></td>
            <td style="padding:8px; font-weight:700; color:${isLow ? 'var(--color-danger)' : 'var(--text-primary)'};">${s.qty} ${s.unit}</td>
            <td style="padding:8px;"><input type="number" id="${physId}" class="form-control" value="${s.qty}" style="width:80px; padding:3px; font-size:0.78rem;" oninput="window.computeCycleVariance('${idx}', ${s.qty}, this.value)"></td>
            <td id="cycle-variance-${idx}" style="padding:8px; font-weight:700;">—</td>
            <td style="padding:8px; text-align:right;">
              <button class="btn btn-secondary btn-sm" onclick="window.triggerCycleAdjust('${s.code}', '${idx}')">Confirm Adjust</button>
            </td>
          </tr>`;
      }).join('');

      activeAdjustContent = `
        <div class="card" style="box-shadow:var(--shadow-sm);">
          <div class="card-header" style="display:flex; justify-content:space-between; align-items:center; padding:10px 15px; border-bottom:1px solid var(--border-color);">
            <h3 class="card-title">📊 Physical / Cycle Count Worksheet — All Stock Items</h3>
            <label style="font-size:0.75rem; font-weight:600; display:flex; align-items:center; gap:6px;">
              <input type="checkbox" id="freeze-movements"> Freeze stock movements during count
            </label>
          </div>
          <div class="custom-table-container">
            <table class="custom-table">
              <thead>
                <tr><th>Item</th><th>Category</th><th>System Qty</th><th>Physical Count</th><th>Variance</th><th style="text-align:right;">Action</th></tr>
              </thead>
              <tbody>${cycleRows}</tbody>
            </table>
          </div>
        </div>
      `;
    } else if (activeAdjustSubTab === 'recall') {
      activeAdjustContent = `
        <div class="card" style="box-shadow:var(--shadow-sm); padding:1.25rem;">
          <h3 style="margin:0 0 1rem 0; font-size:1.1rem; color:var(--text-primary); font-family:var(--font-display);">CDSCO / FDA Active Stock Recall Alert Panel</h3>
          
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-bottom:1rem;">
            <div class="form-group">
              <label class="form-label">Recall Reference</label>
              <input type="text" class="form-control" value="CDSCO-ALERT-90812" id="recall-ref">
            </div>
            <div class="form-group">
              <label class="form-label">Affected Batch</label>
              <input type="text" class="form-control" value="BAT-2025-112" id="recall-batch">
            </div>
          </div>
          
          <button class="btn btn-primary" onclick="window.triggerRecallQuarantine()">Quarantine Batches</button>
        </div>
      `;
    }

    return subTabsHTML + activeAdjustContent;
  }

  window.setAdjustSubTab = function(val) {
    activeAdjustSubTab = val;
    renderInventoryLayout(document.getElementById('main-content'));
  };

  window.submitOpeningStock = function() {
    var code = document.getElementById('op-item-code').value;
    var qty = parseInt(document.getElementById('op-item-qty').value) || 0;
    var batch = document.getElementById('op-item-batch').value.trim();

    if (activeRole !== 'Administrator') {
      alert("⚠️ Opening balance entries require Administrator role authorization.");
      return;
    }

    var item = window.state.invStock.find(s => s.code === code);
    if (item) {
      item.qty = qty;
      item.batch = batch;
      alert(`Opening balance successfully setup for ${item.name}. Stock updated.`);
      _adjustPreSelectCode = '';
      renderInventoryLayout(document.getElementById('main-content'));
    }
  };

  window.toggleTheftFields = function(val) {
    var panel = document.getElementById('theft-fir-fields');
    if (panel) panel.style.display = val === 'Theft' ? 'block' : 'none';
  };

  window.openAdjForm = function() {
    isNewAdjustmentOpen = true;
    renderInventoryLayout(document.getElementById('main-content'));
  };

  window.closeAdjForm = function() {
    isNewAdjustmentOpen = false;
    renderInventoryLayout(document.getElementById('main-content'));
  };

  window.submitAdjustmentForm = function() {
    var code = document.getElementById('adj-form-item').value;
    var qty = parseInt(document.getElementById('adj-form-qty').value) || 0;
    var rate = parseFloat(document.getElementById('adj-form-rate').value) || 120;
    var reason = document.getElementById('adj-form-reason').value;
    var totalVal = qty * rate;

    if (reason === 'Theft') {
      var firNo = document.getElementById('theft-fir-no').value.trim();
      if (!firNo) {
        alert("🚨 Police FIR Number is mandatory for Theft adjustments.");
        return;
      }
    }

    var needsAdmin = totalVal > 5000;
    if (needsAdmin && activeRole !== 'Administrator') {
      alert(`⚠️ Write-off value ₹${totalVal.toLocaleString('en-IN')} exceeds limit. Sent to Administrator approval queue.`);
    }

    var id = "WO-2026-0" + Math.floor(100 + Math.random()*90);
    window.state.invWriteOffs.unshift({
      id: id,
      name: window.state.invStock.find(s => s.code === code).name,
      qty: qty,
      val: totalVal,
      reason: reason,
      status: needsAdmin ? "Pending Admin Approval" : "Approved",
      authBy: needsAdmin ? "Pending" : activeRole
    });

    if (!needsAdmin) {
      var item = window.state.invStock.find(s => s.code === code);
      if (item) item.qty = Math.max(0, item.qty - qty);
      alert(`Stock adjusted! Write-off ${id} logged.`);
    }

    isNewAdjustmentOpen = false;
    renderInventoryLayout(document.getElementById('main-content'));
  };

  window.approveWriteOff = function(id) {
    var wo = window.state.invWriteOffs.find(w => w.id === id);
    if (wo) {
      wo.status = 'Approved';
      wo.authBy = activeRole;
      var item = window.state.invStock.find(s => s.name === wo.name);
      if (item) item.qty = Math.max(0, item.qty - wo.qty);
      alert(`Write-off ${id} approved and deducted from main ledger stock.`);
      renderInventoryLayout(document.getElementById('main-content'));
    }
  };

  window.triggerRecallQuarantine = function() {
    var ref = document.getElementById('recall-ref').value;
    var batch = document.getElementById('recall-batch').value;
    alert(`Recall ${ref} processed! Affected batch ${batch} quarantined. Items locked from issue queue.`);
  };

  window.computeCycleVariance = function(idx, sysQty, physVal) {
    var varCell = document.getElementById('cycle-variance-' + idx);
    if (!varCell) return;
    var phys = parseInt(physVal) || 0;
    var variance = phys - parseInt(sysQty);
    if (variance === 0) {
      varCell.innerHTML = '<span style="color:var(--color-success);">✓ Match</span>';
    } else if (variance < 0) {
      varCell.innerHTML = '<span style="color:var(--color-danger); font-weight:700;">' + variance + ' ▼</span>';
    } else {
      varCell.innerHTML = '<span style="color:var(--color-warning); font-weight:700;">+' + variance + ' ▲</span>';
    }
  };

  window.triggerCycleAdjust = function(code, idx) {
    var s = window.state.invStock.find(st => st.code === code);
    if (!s) return;
    var physInput = document.getElementById('cycle-phys-' + idx);
    var phys = physInput ? parseInt(physInput.value) : s.qty;
    var variance = phys - s.qty;

    if (s.category.includes("NDPS") && variance !== 0) {
      ndpsDiscrepancyAlert = true;
      ndpsLocked = true;
      alert(`🚨 NDPS Warning: Count discrepancy detected for narcotic item ${s.name}. Register locked.`);
    }

    s.qty = phys;
    alert(`Ledger count adjusted for ${s.name}. System set to ${phys} ${s.unit}.`);
    renderInventoryLayout(document.getElementById('main-content'));
  };

  /* ==========================================================================
     TAB 8 — STATUTORY REGISTERS
     ========================================================================== */
  function renderStatutoryTab() {
    var subTabsHTML = `
      <div style="display:flex; gap:10px; margin-bottom:1.5rem; background:var(--bg-surface); padding:8px; border-radius:var(--radius-sm); border:1px solid var(--border-color);">
        <button class="btn ${activeStatutorySubTab === 'ndps' ? 'btn-primary' : 'btn-secondary'} btn-sm" onclick="window.setStatutorySubTab('ndps')">7A — NDPS Register</button>
        <button class="btn ${activeStatutorySubTab === 'bmw' ? 'btn-primary' : 'btn-secondary'} btn-sm" onclick="window.setStatutorySubTab('bmw')">7B — BMW Daily Log</button>
        <button class="btn ${activeStatutorySubTab === 'balancesheet' ? 'btn-primary' : 'btn-secondary'} btn-sm" onclick="window.setStatutorySubTab('balancesheet')">7C — Narcotic Balance Sheet</button>
        <button class="btn ${activeStatutorySubTab === 'templog' ? 'btn-primary' : 'btn-secondary'} btn-sm" onclick="window.setStatutorySubTab('templog')">7E — Cold Chain Log</button>
        <button class="btn ${activeStatutorySubTab === 'manifest' ? 'btn-primary' : 'btn-secondary'} btn-sm" onclick="window.setStatutorySubTab('manifest')">7F — BMW Manifests</button>
      </div>
    `;

    var activeStatutoryContent = '';

    if (activeStatutorySubTab === 'ndps') {
      var ndpsRows = window.state.invNDPSRegister.map(n => `
        <tr style="border-bottom: 1px solid var(--border-color);">
          <td style="padding:10px;" class="mono">${n.date}</td>
          <td style="padding:10px; font-weight:700;">${n.patient}</td>
          <td style="padding:10px;" class="mono">${n.uhid}</td>
          <td style="padding:10px;">${n.doctor}</td>
          <td style="padding:10px;" class="mono">${n.qty}</td>
          <td style="padding:10px;" class="mono">${n.balance}</td>
          <td style="padding:10px;">${n.issuedBy}</td>
          <td style="padding:10px;">${n.verifiedBy}</td>
        </tr>
      `).join('');

      activeStatutoryContent = `
        <div class="card" style="box-shadow:var(--shadow-sm); padding:1rem; margin-bottom:1rem;">
          <h3 style="margin:0 0 1rem 0; font-size:0.9rem; color:var(--text-primary); font-family:var(--font-display);">+ Log NDPS Issue Entry</h3>
          <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:12px; margin-bottom:1rem;">
            <div class="form-group"><label class="form-label">Patient Name *</label><input type="text" id="ndps-patient" class="form-control" value="Rajesh Kumar"></div>
            <div class="form-group"><label class="form-label">UHID *</label><input type="text" id="ndps-uhid" class="form-control" value="SH-2026-04821"></div>
            <div class="form-group"><label class="form-label">Doctor *</label><input type="text" id="ndps-doctor" class="form-control" value="Dr. Mehta"></div>
          </div>
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:1rem;">
            <div class="form-group"><label class="form-label">Qty Issued</label><input type="number" id="ndps-qty" class="form-control" value="2"></div>
            <div class="form-group"><label class="form-label">Issued By</label><input type="text" id="ndps-staff" class="form-control" value="Nurse Kavitha"></div>
          </div>
          <button class="btn btn-primary" onclick="window.submitNDPSEntry()">Log NDPS Issue Entry</button>
        </div>

        <div class="card" style="box-shadow:var(--shadow-sm); padding:1rem;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
            <h3 style="margin:0; font-size:0.9rem; font-family:var(--font-display);">📋 Schedule H1 / NDPS Register</h3>
            <div style="display:flex; gap:10px;">
              <button class="btn btn-secondary btn-sm" onclick="window.resolveNDPSLock()">Verify Daily Physical Count</button>
              <button class="btn btn-secondary btn-sm" onclick="window.infoToast('Printing Register...')">Print Register</button>
            </div>
          </div>
          <div class="custom-table-container">
            <table class="custom-table">
              <thead>
                <tr><th>Date</th><th>Patient</th><th>UHID</th><th>Doctor</th><th>Qty Issued</th><th>Balance</th><th>Issued By</th><th>Verified By</th></tr>
              </thead>
              <tbody>${ndpsRows}</tbody>
            </table>
          </div>
        </div>
      `;
    } else if (activeStatutorySubTab === 'bmw') {
      var bmwRows = window.state.invBMWRegister.map(b => `
        <tr style="border-bottom: 1px solid var(--border-color);">
          <td style="padding:10px;" class="mono">${b.date}</td>
          <td style="padding:10px; font-weight:700;">${b.category}</td>
          <td style="padding:10px;">${b.item}</td>
          <td style="padding:10px;" class="mono">${b.qtyGen}</td>
          <td style="padding:10px;" class="mono">${b.qtyDisp}</td>
          <td style="padding:10px;">${b.method}</td>
          <td style="padding:10px;">${b.auth}</td>
        </tr>
      `).join('');

      activeStatutoryContent = `
        <div class="card" style="box-shadow:var(--shadow-sm); padding:1.25rem; margin-bottom:1.5rem;">
          <h3 style="margin:0 0 1rem 0; font-size:1rem; color:var(--text-primary);">+ Log BMW Daily Waste Generation Entry</h3>
          <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:12px; margin-bottom:1rem;">
            <div class="form-group">
              <label class="form-label">Category</label>
              <select id="bmw-form-cat" class="form-select">
                <option value="Yellow">Yellow (Infectious)</option>
                <option value="Red">Red (Contaminated Recyclable)</option>
                <option value="White">White (Sharps)</option>
                <option value="Blue">Blue (Glassware)</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Item / Bag</label>
              <input type="text" id="bmw-form-item" class="form-control" value="BMW Yellow Bag 50L">
            </div>
            <div class="form-group">
              <label class="form-label">Qty Generated (packs)</label>
              <input type="number" id="bmw-form-qty" class="form-control" value="12">
            </div>
          </div>
          <button class="btn btn-primary" onclick="window.submitBMWEntry()">Log Daily BMW Entry</button>
        </div>

        <div class="card" style="box-shadow:var(--shadow-sm);">
          <div class="custom-table-container">
            <table class="custom-table">
              <thead>
                <tr><th>Date</th><th>Category</th><th>Item</th><th>Qty Generated</th><th>Qty Disposed</th><th>Disposal Method</th><th>Authorized By</th></tr>
              </thead>
              <tbody>${bmwRows}</tbody>
            </table>
          </div>
        </div>
      `;
    } else if (activeStatutorySubTab === 'balancesheet') {
      activeStatutoryContent = `
        <div class="card" style="box-shadow:var(--shadow-sm); padding:1.25rem; display:flex; justify-content:space-between; align-items:center;">
          <div>
            <strong>7C — Narcotic Stock Balance Sheet Monthly Verification</strong>
            <div style="font-size:0.75rem; color:var(--text-muted); margin-top:2px;">Required for NDPS renewal license. Matches physical verified stock counts.</div>
          </div>
          <button class="btn btn-secondary btn-sm" onclick="window.infoToast('Generating Balance Sheet file...')">Print Monthly Sheet</button>
        </div>
      `;
    } else if (activeStatutorySubTab === 'templog') {
      var tempRows = window.state.invTempLogs.map(t => `
        <tr style="border-bottom:1px solid var(--border-color);">
          <td style="padding:10px;">${t.date}</td>
          <td style="padding:10px;">${t.fridgeId}</td>
          <td style="padding:10px;">${t.morningTemp}°C (${t.morningOk ? '✅ range' : '❌ alert'})</td>
          <td style="padding:10px;">${t.eveningTemp}°C (${t.eveningOk ? '✅ range' : '❌ alert'})</td>
          <td style="padding:10px;">${t.loggedBy}</td>
        </tr>
      `).join('');

      var tempLogForm = '';
      if (isNewTempLogOpen) {
        tempLogForm = `
          <div class="card" style="box-shadow:var(--shadow-sm); padding:1.25rem; margin-bottom:1.5rem; border-color:var(--color-warning);">
            <h3 style="margin:0 0 1rem 0; font-size:1rem; color:var(--text-primary);">+ Log Daily Cold Chain Temperature</h3>
            <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:12px; margin-bottom:1rem;">
              <div class="form-group"><label class="form-label">Fridge / Refrigerator ID</label><input type="text" id="temp-fridge-id" class="form-control" value="COLD-01"></div>
              <div class="form-group"><label class="form-label">Morning Temp (°C)</label><input type="number" id="temp-morning" class="form-control" value="4.0" step="0.1"></div>
              <div class="form-group"><label class="form-label">Evening Temp (°C)</label><input type="number" id="temp-evening" class="form-control" value="4.2" step="0.1"></div>
            </div>
            <button class="btn btn-primary" onclick="window.submitTempLog()">Save Temp Entry</button>
          </div>
        `;
      }

      activeStatutoryContent = tempLogForm + `
        <div class="card" style="box-shadow:var(--shadow-sm);">
          <div class="card-header" style="display:flex; justify-content:space-between; align-items:center;">
            <h3 class="card-title">❄️ Daily Cold Chain Temperature Logs</h3>
            <button class="btn btn-primary btn-sm" onclick="window.openTempLogForm()">+ Add Temp Entry</button>
          </div>
          <div class="custom-table-container">
            <table class="custom-table">
              <thead>
                <tr><th>Date</th><th>Fridge ID</th><th>Morning (8 AM)</th><th>Evening (5 PM)</th><th>Logged By</th></tr>
              </thead>
              <tbody>${tempRows}</tbody>
            </table>
          </div>
        </div>
      `;
    } else if (activeStatutorySubTab === 'manifest') {
      var manifestRows = window.state.invBMWManifests.map(m => `
        <tr style="border-bottom: 1px solid var(--border-color);">
          <td style="padding:10px;" class="mono">${m.manifestNo}</td>
          <td style="padding:10px;">${m.date}</td>
          <td style="padding:10px;">${m.operator}</td>
          <td style="padding:10px;" class="mono">${m.vehicleNo}</td>
          <td style="padding:10px;">${m.driverName}</td>
          <td style="padding:10px;">${m.weight} kg</td>
          <td style="padding:10px; text-align:right;">
            <button class="btn btn-secondary btn-sm" onclick="window.infoToast('Manifest details loaded.')">Print Manifest</button>
          </td>
        </tr>
      `).join('');

      var manifestForm = '';
      if (isNewBMWManifestOpen) {
        manifestForm = `
          <div class="card" style="box-shadow:var(--shadow-sm); padding:1.25rem; margin-bottom:1.5rem;">
            <h3 style="margin:0 0 1rem 0; font-size:1rem; color:var(--text-primary);">+ Log BMW Manifest (CBWTF Pickup)</h3>
            <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:12px; margin-bottom:1rem;">
              <div class="form-group"><label class="form-label">CBWTF Operator</label><input type="text" id="mft-operator" class="form-control" value="Medicare Waste Solutions"></div>
              <div class="form-group"><label class="form-label">Vehicle Registration No</label><input type="text" id="mft-vehicle" class="form-control" value="KA-03-HA-8812"></div>
              <div class="form-group"><label class="form-label">Driver Name</label><input type="text" id="mft-driver" class="form-control" value="Basavaraj"></div>
            </div>
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:1rem;">
              <div class="form-group"><label class="form-label">Total Handover Weight (kg)</label><input type="number" id="mft-weight" class="form-control" value="32.5"></div>
            </div>
            <button class="btn btn-primary" onclick="window.submitBMWManifest()">Save manifest & Handover</button>
          </div>
        `;
      }

      activeStatutoryContent = manifestForm + `
        <div class="card" style="box-shadow:var(--shadow-sm);">
          <div class="card-header" style="display:flex; justify-content:space-between; align-items:center;">
            <h3 class="card-title">🗑 BMW Manifests (CBWTF pickup daily sheets)</h3>
            <button class="btn btn-primary btn-sm" onclick="window.openBMWManifestForm()">+ New Manifest</button>
          </div>
          <div class="custom-table-container">
            <table class="custom-table">
              <thead>
                <tr><th>Manifest No</th><th>Date</th><th>CBWTF Operator</th><th>Vehicle No</th><th>Driver Name</th><th>Net Weight</th><th style="text-align:right;">Action</th></tr>
              </thead>
              <tbody>${manifestRows}</tbody>
            </table>
          </div>
        </div>
      `;
    }

    return subTabsHTML + activeStatutoryContent;
  }

  window.setStatutorySubTab = function(val) {
    activeStatutorySubTab = val;
    renderInventoryLayout(document.getElementById('main-content'));
  };

  window.submitNDPSEntry = function() {
    var patient = document.getElementById('ndps-patient').value;
    var uhid = document.getElementById('ndps-uhid').value;
    var doctor = document.getElementById('ndps-doctor').value;
    var qty = parseInt(document.getElementById('ndps-qty').value) || 0;
    var staff = document.getElementById('ndps-staff').value;

    window.state.invNDPSRegister.unshift({
      date: "Today", patient: patient, uhid: uhid, doctor: doctor, qty: qty, balance: 23 - qty, issuedBy: staff, verifiedBy: "Sr. Pharmacist"
    });
    alert(`NDPS Issue Entry logged for patient ${patient}. Running balance: ${23 - qty} vials.`);
    renderInventoryLayout(document.getElementById('main-content'));
  };

  window.submitBMWEntry = function() {
    var cat = document.getElementById('bmw-form-cat').value;
    var item = document.getElementById('bmw-form-item').value;
    var qty = parseInt(document.getElementById('bmw-form-qty').value) || 0;

    window.state.invBMWRegister.unshift({
      date: "Today", category: cat, item: item, qtyGen: qty + " packs", qtyDisp: qty + " packs", method: "CBWTF pickup", auth: activeRole
    });
    alert("BMW waste log entry generated.");
    renderInventoryLayout(document.getElementById('main-content'));
  };

  window.openTempLogForm = function() {
    isNewTempLogOpen = true;
    renderInventoryLayout(document.getElementById('main-content'));
  };

  window.submitTempLog = function() {
    var fridge = document.getElementById('temp-fridge-id').value;
    var morning = parseFloat(document.getElementById('temp-morning').value) || 4.0;
    var evening = parseFloat(document.getElementById('temp-evening').value) || 4.2;

    window.state.invTempLogs.unshift({
      date: "Today", fridgeId: fridge, morningTemp: morning, eveningTemp: evening, morningOk: true, eveningOk: true, loggedBy: activeRole
    });
    alert("Daily Refrigerator Temp Log Entry logged.");
    isNewTempLogOpen = false;
    renderInventoryLayout(document.getElementById('main-content'));
  };

  window.openBMWManifestForm = function() {
    isNewBMWManifestOpen = true;
    renderInventoryLayout(document.getElementById('main-content'));
  };

  window.submitBMWManifest = function() {
    var operator = document.getElementById('mft-operator').value;
    var vehicle = document.getElementById('mft-vehicle').value;
    var driver = document.getElementById('mft-driver').value;
    var weight = parseFloat(document.getElementById('mft-weight').value) || 0;
    var mftNo = "BMW-MFT-2026-0" + Math.floor(341 + Math.random()*90);

    window.state.invBMWManifests.unshift({
      manifestNo: mftNo, date: "Today", operator: operator, vehicleNo: vehicle, driverName: driver, time: "12:00", weight: weight, authorizedBy: activeRole
    });
    alert(`BMW Manifest Handover entry ${mftNo} registered.`);
    isNewBMWManifestOpen = false;
    renderInventoryLayout(document.getElementById('main-content'));
  };

  /* ==========================================================================
     TAB 9 — ASSETS & MAINTENANCE & DEPRECIATION
     ========================================================================== */
  function renderAssetsTab() {
    var subTabsHTML = `
      <div style="display:flex; gap:10px; margin-bottom:1.5rem; background:var(--bg-surface); padding:8px; border-radius:var(--radius-sm); border:1px solid var(--border-color);">
        <button class="btn ${activeAssetsSubTab === 'register' ? 'btn-primary' : 'btn-secondary'} btn-sm" onclick="window.setAssetsSubTab('register')">8A — Asset Register</button>
        <button class="btn ${activeAssetsSubTab === 'issuereturn' ? 'btn-primary' : 'btn-secondary'} btn-sm" onclick="window.setAssetsSubTab('issuereturn')">8B — Asset Issue/Return</button>
        <button class="btn ${activeAssetsSubTab === 'breakdown' ? 'btn-primary' : 'btn-secondary'} btn-sm" onclick="window.setAssetsSubTab('breakdown')">8C — Breakdown Maintenance</button>
        <button class="btn ${activeAssetsSubTab === 'amc' ? 'btn-primary' : 'btn-secondary'} btn-sm" onclick="window.setAssetsSubTab('amc')">8D — AMC/Warranty Tracker</button>
        <button class="btn ${activeAssetsSubTab === 'deprec' ? 'btn-primary' : 'btn-secondary'} btn-sm" onclick="window.setAssetsSubTab('deprec')">8E — Asset Depreciation</button>
      </div>
    `;

    var activeAssetsContent = '';

    if (activeAssetsSubTab === 'register') {
      var assetRows = window.state.invAssets.map(ast => `
        <tr style="border-bottom: 1px solid var(--border-color);">
          <td style="padding:10px; font-weight:700;" class="mono">${ast.code}</td>
          <td style="padding:10px; font-weight:800; color:var(--text-primary);">${ast.name}</td>
          <td style="padding:10px;">${ast.category}</td>
          <td style="padding:10px;">${ast.location}</td>
          <td style="padding:10px;"><span class="badge ${ast.status === 'Active' ? 'badge-success' : 'badge-warning'}">${ast.status}</span></td>
          <td style="padding:10px;" class="mono">${ast.date}</td>
          <td style="padding:10px; font-weight:700;">₹${ast.value.toLocaleString()}</td>
          <td style="padding:10px;">${ast.warranty || '—'}</td>
          <td style="padding:10px; text-align:right;">
            <button class="btn btn-secondary btn-sm" onclick="window.viewAssetDetailDrawer('${ast.code}')">View</button>
          </td>
        </tr>
      `).join('');

      activeAssetsContent = `
        <div class="card" style="box-shadow:var(--shadow-sm);">
          <div class="custom-table-container">
            <table class="custom-table">
              <thead>
                <tr><th>Asset Code</th><th>Name</th><th>Category</th><th>Location</th><th>Status</th><th>Purchase</th><th>Value</th><th>Warranty</th><th style="text-align:right;">Action</th></tr>
              </thead>
              <tbody>${assetRows}</tbody>
            </table>
          </div>
        </div>
      `;
    } else if (activeAssetsSubTab === 'issuereturn') {
      activeAssetsContent = `
        <div class="card" style="box-shadow:var(--shadow-sm); padding:1.25rem;">
          <h3 style="margin:0 0 1.2rem 0; font-size:1.1rem; color:var(--text-primary); font-family:var(--font-display);">Non-Consumable Asset Issue &amp; Return Console</h3>
          
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:20px; border-bottom:1px solid var(--border-color); padding-bottom:20px; margin-bottom:20px;">
            <div>
              <strong style="color:var(--text-primary);">🚚 Asset Issue Form</strong>
              <div class="form-group" style="margin-top:10px;">
                <label class="form-label">Asset to Issue</label>
                <select id="asset-issue-code" class="form-select">
                  ${window.state.invAssets.map(a => `<option value="${a.code}">${a.name} (${a.code})</option>`).join('')}
                </select>
              </div>
              <div class="form-group" style="margin-top:8px;">
                <label class="form-label">Issued to Patient (UHID) / Dept</label>
                <input type="text" id="asset-issue-target" class="form-control" value="SH-2026-00445">
              </div>
              <button class="btn btn-primary" style="margin-top:12px;" onclick="window.submitAssetIssueForm()">Issue Asset</button>
            </div>
            
            <div>
              <strong style="color:var(--text-primary);">📥 Asset Return Receipt Form</strong>
              <div class="form-group" style="margin-top:10px;">
                <label class="form-label">Returned Asset</label>
                <select id="asset-return-code" class="form-select">
                  ${window.state.invAssets.map(a => `<option value="${a.code}">${a.name} (${a.code})</option>`).join('')}
                </select>
              </div>
              <div class="form-group" style="margin-top:8px;">
                <label class="form-label">Condition on Return</label>
                <select id="asset-return-condition" class="form-select">
                  <option value="Good">Good</option>
                  <option value="Fair">Fair</option>
                  <option value="Damaged">Damaged (Autoraise maintenance ticket)</option>
                </select>
              </div>
              <button class="btn btn-primary" style="margin-top:12px;" onclick="window.submitAssetReturnForm()">Accept Return</button>
            </div>
          </div>
        </div>
      `;
    } else if (activeAssetsSubTab === 'breakdown') {
      var ticketRows = window.state.invAssetTickets.map(tk => `
        <tr style="border-bottom: 1px solid var(--border-color);">
          <td style="padding:10px;" class="mono">${tk.ticketId}</td>
          <td style="padding:10px; font-weight:700;">${tk.asset}</td>
          <td style="padding:10px;">${tk.description}</td>
          <td style="padding:10px;"><span class="badge badge-danger">${tk.priority}</span></td>
          <td style="padding:10px;"><span class="badge badge-warning">${tk.status}</span></td>
          <td style="padding:10px; text-align:right;"><button class="btn btn-secondary btn-sm" onclick="window.infoToast('Ticket status updated.')">Resolve</button></td>
        </tr>
      `).join('');

      activeAssetsContent = `
        <div class="card" style="box-shadow:var(--shadow-sm); padding:1rem; margin-bottom:1.5rem;">
          <h3 style="margin:0 0 1rem 0; font-size:1rem;">🛠 Log Breakdown & Maintenance Ticket</h3>
          <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:12px; margin-bottom:1rem;">
            <div class="form-group">
              <label class="form-label">Select Damaged Asset</label>
              <select id="break-asset-code" class="form-select">
                ${window.state.invAssets.map(a => `<option value="${a.code}">${a.name} (${a.code})</option>`).join('')}
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Issue Description</label>
              <input type="text" id="break-desc" class="form-control" value="Display flicker after restart">
            </div>
            <div class="form-group">
              <label class="form-label">Priority</label>
              <select id="break-priority" class="form-select">
                <option value="Routine">Routine</option>
                <option value="Urgent">Urgent</option>
                <option value="Critical">Critical</option>
              </select>
            </div>
          </div>
          <button class="btn btn-primary" onclick="window.submitBreakdownTicket()">Raise Maintenance Ticket</button>
        </div>

        <div class="card" style="box-shadow:var(--shadow-sm);">
          <div class="custom-table-container">
            <table class="custom-table">
              <thead>
                <tr><th>Ticket ID</th><th>Asset</th><th>Description</th><th>Priority</th><th>Status</th><th style="text-align:right;">Action</th></tr>
              </thead>
              <tbody>${ticketRows}</tbody>
            </table>
          </div>
        </div>
      `;
    } else if (activeAssetsSubTab === 'amc') {
      var amcRows = window.state.invAssets.map(ast => {
        if (ast.amc === 'Yes') {
          return `
            <tr style="border-bottom: 1px solid var(--border-color);">
              <td style="padding:10px;"><strong>${ast.name}</strong></td>
              <td style="padding:10px;">BPL Medical</td>
              <td style="padding:10px;"><span class="badge badge-success">Active AMC</span></td>
              <td style="padding:10px;" class="mono">${ast.warranty || '—'}</td>
              <td style="padding:10px; text-align:right;"><button class="btn btn-secondary btn-sm" onclick="window.infoToast('AMC contract renewal request generated.')">Renew</button></td>
            </tr>
          `;
        } else {
          return `
            <tr style="border-bottom: 1px solid var(--border-color);">
              <td style="padding:10px;"><strong>${ast.name}</strong></td>
              <td style="padding:10px;">—</td>
              <td style="padding:10px;"><span class="badge badge-warning">Expired ⚠️</span></td>
              <td style="padding:10px;" class="mono">—</td>
              <td style="padding:10px; text-align:right;"><button class="btn btn-primary btn-sm" onclick="window.infoToast('AMC contract quotation generated.')">Get AMC</button></td>
            </tr>
          `;
        }
      }).join('');

      activeAssetsContent = `
        <div class="card" style="box-shadow:var(--shadow-sm);">
          <div class="custom-table-container">
            <table class="custom-table">
              <thead>
                <tr><th>Asset</th><th>Vendor</th><th>Contract</th><th>Expiry</th><th style="text-align:right;">Action</th></tr>
              </thead>
              <tbody>${amcRows}</tbody>
            </table>
          </div>
        </div>
      `;
    } else if (activeAssetsSubTab === 'deprec') {
      // WDV Method (15% for diagnostic, 10% for furniture)
      var deprecRows = window.state.invAssets.map(ast => {
        var rate = ast.category === 'Diagnostic' ? 0.15 : 0.10;
        var originalValue = ast.value;
        var deprecVal = originalValue * rate;
        var currentWDV = originalValue - deprecVal;

        return `
          <tr style="border-bottom:1px solid var(--border-color);">
            <td><strong>${ast.name}</strong> (${ast.code})</td>
            <td class="mono">₹${originalValue.toLocaleString()}</td>
            <td class="mono">${rate*100}%</td>
            <td class="mono" style="color:var(--color-danger)">₹${deprecVal.toLocaleString()}</td>
            <td class="mono" style="font-weight:700;">₹${currentWDV.toLocaleString()}</td>
          </tr>
        `;
      }).join('');

      activeAssetsContent = `
        <div class="card" style="box-shadow:var(--shadow-sm);">
          <div class="card-header" style="display:flex; justify-content:space-between; align-items:center;">
            <h3 class="card-title">📉 Annual Asset Depreciation Schedule (WDV Method)</h3>
            <button class="btn btn-secondary btn-sm" onclick="window.infoToast('Exporting depreciation log...')">Export Depreciation Schedule</button>
          </div>
          <div class="custom-table-container">
            <table class="custom-table">
              <thead>
                <tr><th>Asset</th><th>Original Value</th><th>Depreciation Rate</th><th>Depreciation Amount</th><th>Current WDV Value</th></tr>
              </thead>
              <tbody>${deprecRows}</tbody>
            </table>
          </div>
        </div>
      `;
    }

    return subTabsHTML + activeAssetsContent;
  }

  window.setAssetsSubTab = function(val) {
    activeAssetsSubTab = val;
    renderInventoryLayout(document.getElementById('main-content'));
  };

  window.viewAssetDetailDrawer = function(code) {
    var ast = window.state.invAssets.find(a => a.code === code);
    if (ast) {
      alert(`[Asset Detail - ${ast.code}]\nName: ${ast.name}\nValue: ₹${ast.value}\nLocation: ${ast.location}\nWarranty Exp: ${ast.warranty}\nAMC Active: ${ast.amc}`);
    }
  };

  window.submitAssetIssueForm = function() {
    var code = document.getElementById('asset-issue-code').value;
    var target = document.getElementById('asset-issue-target').value;
    alert(`Asset ${code} issued successfully to: ${target}`);
  };

  window.submitAssetReturnForm = function() {
    var code = document.getElementById('asset-return-code').value;
    var cond = document.getElementById('asset-return-condition').value;

    if (cond === 'Damaged') {
      var ticketId = "TCK-490";
      window.state.invAssetTickets.unshift({
        ticketId: ticketId,
        asset: code,
        description: "Damaged on return",
        priority: "Critical",
        status: "Open",
        date: "Today"
      });
      alert(`⚠️ Return confirmed. Asset ${code} marked Damaged! Maintenance ticket ${ticketId} auto-raised.`);
    } else {
      alert(`Asset ${code} return confirmed in Good/Fair condition.`);
    }
    renderInventoryLayout(document.getElementById('main-content'));
  };

  window.submitBreakdownTicket = function() {
    var asset = document.getElementById('break-asset-code').value;
    var desc = document.getElementById('break-desc').value.trim();
    var prio = document.getElementById('break-priority').value;

    var tck = "TCK-" + String(100 + window.state.invAssetTickets.length);
    window.state.invAssetTickets.unshift({
      ticketId: tck, asset: asset, description: desc, priority: prio, status: "Open", date: "Today"
    });
    alert(`Maintenance ticket ${tck} logged.`);
    renderInventoryLayout(document.getElementById('main-content'));
  };

  /* ==========================================================================
     TAB 10 — REPORTS
     ========================================================================== */
  function renderReportsTab() {
    var reports = [
      { id: "stock_pos", name: "📊 Stock Position as on Date (historical balance log)" },
      { id: "stock_val", name: "📊 Stock Valuation Report (owned vs consignment)" },
      { id: "dead_stock", name: "📊 Dead Stock Report (items with zero movement >90 days)" },
      { id: "stock_age", name: "📊 Stock Ageing Report (days sitting in sub-stores)" },
      { id: "budget_actual", name: "📊 Budget vs Actual Consumption (dept compared monthly)" },
      { id: "expiry", name: "📊 Expiry Report (batches expiring in 30/60/90 days)" },
      { id: "tat", name: "📊 Indent fulfillment TAT & lead times" },
      { id: "supplier_payment", name: "📊 Supplier Payment Ledger (net PO outstanding)" },
      { id: "unplanned_proc", name: "📊 Emergency Local Purchases & petty cash audits" }
    ];

    var listHTML = reports.map(r => `
      <div style="background:var(--bg-surface); border:1px solid var(--border-color); border-radius:var(--radius-sm); padding:12px; display:flex; justify-content:space-between; align-items:center; box-shadow:var(--shadow-sm);">
        <span style="font-weight:600; color:var(--text-secondary); font-size:0.82rem;">📈 ${r.name}</span>
        <button class="btn btn-secondary btn-sm" onclick="window.generateReport('${r.id}')">Generate & Export</button>
      </div>
    `).join('');

    return `
      <div style="display:flex; flex-direction:column; gap:10px;">
        ${listHTML}
      </div>
    `;
  }

  window.generateReport = function(id) {
    if (id === 'dead_stock') {
      alert("Dead Stock Report:\n\n1. Zimmer Hip Stem (ITM-IMP-002) - 0 units, no movement >90 days.\n2. Mattress (Anti-decubitus) - Sitting in ICU for 120 days.");
    } else if (id === 'budget_actual') {
      var lines = window.state.invBudgets.map(b => `${b.dept}: Allocation ₹${b.monthlyAlloc.toLocaleString()} | Consumed ₹${b.actual.toLocaleString()} (${Math.round((b.actual/b.monthlyAlloc)*100)}%)`).join('\n');
      alert("Budget vs Actual Consumables Comparison:\n\n" + lines);
    } else {
      alert("Generating report data... Exported to Excel sheet.");
    }
  };

  // Generic toast alert helper
  window.infoToast = function (msg) {
    alert(msg);
  };

  // ==========================================================================
  // UNIVERSAL STOCK REQUEST OVERLAY SYSTEM
  // ==========================================================================
  window.showStockRequestOverlay = function (options) {
    options = options || {};
    var dept = options.dept || 'ICU';
    var urgency = options.urgency || 'Routine';
    var prefillItem = options.prefillItem || null;
    var prefillType = options.prefillType || 'Consumable';
    var patientUhid = options.patientUhid || '';
    var prescriptionRef = options.prescriptionRef || '';
    var activeTab = prefillType; // 'Consumable' | 'Returnable' | 'Purchase'
    var selectedItems = [];

    if (prefillItem) {
      selectedItems.push({
        code: prefillItem.code || '',
        name: prefillItem.name || '',
        qty: prefillItem.qty || 1,
        unit: prefillItem.unit || 'pcs',
        purpose: prefillItem.purpose || ''
      });
    }

    // Build Backdrop and Modal structure dynamically
    var overlayId = 'inv-universal-request-overlay';
    var existing = document.getElementById(overlayId);
    if (existing) existing.remove();

    var overlayDiv = document.createElement('div');
    overlayDiv.id = overlayId;
    overlayDiv.style.cssText = 'position:fixed; inset:0; background:rgba(0,0,0,0.6); z-index:99999; display:flex; justify-content:center; align-items:center; font-family:var(--font-body);';

    function renderOverlayHTML() {
      var isSTAT = urgency === 'STAT';
      var headerBg = isSTAT ? 'background:#ef4444; color:#fff;' : 'background:var(--bg-surface); color:var(--text-primary); border-bottom:1px solid var(--border-color);';
      var urgencyLabelStyle = isSTAT ? 'color:#fee2e2; font-weight:800;' : 'color:var(--text-secondary);';

      var itemSearchRow = '';
      if (activeTab === 'Consumable') {
        itemSearchRow = `
          <div class="checklist-card" style="margin-bottom:1rem; border:1px solid var(--border-color); padding:12px; border-radius:4px;">
            <label class="form-label" style="font-weight:700;">Search Store Items</label>
            <div style="display:grid; grid-template-columns:2fr 1fr 1fr auto; gap:8px; align-items:center;">
              <div style="position:relative;">
                <input type="text" id="over-search-input" class="form-control" placeholder="Type 2+ chars..." autocomplete="off" oninput="window.overFilterSearch(this.value)">
                <div id="over-search-dropdown" style="position:absolute; top:100%; left:0; right:0; background:var(--bg-surface); border:1px solid var(--border-color); z-index:100005; max-height:150px; overflow-y:auto; display:none; box-shadow:var(--shadow-sm);"></div>
                <input type="hidden" id="over-search-code" value="">
                <input type="hidden" id="over-search-unit" value="">
              </div>
              <input type="number" id="over-search-qty" class="form-control" value="10" placeholder="Qty">
              <input type="text" id="over-search-purpose" class="form-control" placeholder="Purpose">
              <button class="btn btn-secondary btn-sm" onclick="window.overAddRow()">+ Add</button>
            </div>
            
            <div id="over-selected-table-container" style="margin-top:10px;">
              ${renderSelectedItemsTable()}
            </div>
          </div>
        `;
      }

      var formBody = '';
      if (activeTab === 'Consumable') {
        formBody = `
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:0.5rem;">
            <div class="form-group">
              <label class="form-label">Required By Date</label>
              <input type="date" id="over-req-date" class="form-control" value="${new Date(Date.now() + 86400000).toISOString().split('T')[0]}">
            </div>
            <div class="form-group">
              <label class="form-label">Patient Reference UHID (optional, tags billing)</label>
              <input type="text" id="over-patient-uhid-cons" class="form-control" placeholder="e.g. SH-2026-04821" value="${patientUhid}">
            </div>
          </div>
          ${itemSearchRow}
          <div class="form-group">
            <label class="form-label">Load Template (Ward/ICU pre-saved)</label>
            <select class="form-select" onchange="window.overLoadTemplate(this.value)">
              <option value="">-- Choose Template --</option>
              ${(window.state.invTemplates || []).map((t, idx) => `<option value="${idx}">${t.name}</option>`).join('')}
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Notes</label>
            <input type="text" id="over-notes" class="form-control" placeholder="E.g. urgent replacement for CCU" value="${prescriptionRef ? 'Prescription ref: ' + prescriptionRef + (patientUhid ? ' · Patient: ' + patientUhid : '') : ''}">
          </div>
        `;
      } else if (activeTab === 'Returnable') {
        formBody = `
          <div class="form-group">
            <label class="form-label">Asset to Request (Available only)</label>
            <select id="over-asset-code" class="form-select">
              ${(window.state.invAssets || []).filter(a => a.status === 'Active').map(a => `<option value="${a.code}">${a.name} (${a.code})</option>`).join('')}
            </select>
          </div>
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:1rem;">
            <div class="form-group"><label class="form-label">Needed From</label><input type="datetime-local" id="over-start-time" class="form-control" value="2026-07-06T09:00"></div>
            <div class="form-group"><label class="form-label">Expected Return</label><input type="datetime-local" id="over-end-time" class="form-control" value="2026-07-06T18:00"></div>
          </div>
          <div class="form-group">
            <label class="form-label">Patient Reference UHID (optional)</label>
            <input type="text" id="over-patient-uhid" class="form-control" value="${patientUhid}">
          </div>
          <div class="form-group">
            <label class="form-label">Justification / Reason</label>
            <input type="text" id="over-reason" class="form-control" value="Patient transport helper">
          </div>
        `;
      } else if (activeTab === 'Purchase') {
        formBody = `
          <div class="form-group">
            <label class="form-label">Describe Item *</label>
            <input type="text" id="over-pr-desc" class="form-control" placeholder="Enter specifications..." value="${options.prefillItem && !options.prefillItem.code ? options.prefillItem.name : ''}">
          </div>
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:1rem;">
            <div class="form-group">
              <label class="form-label">Category *</label>
              <select id="over-pr-cat" class="form-select">
                ${window.state.invCategories.map(c => `<option value="${c}">${c}</option>`).join('')}
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Approx Rate (₹)</label>
              <input type="number" id="over-pr-rate" class="form-control" value="1500">
            </div>
          </div>
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:1rem;">
            <div class="form-group"><label class="form-label">Qty *</label><input type="number" id="over-pr-qty" class="form-control" value="2"></div>
            <div class="form-group"><label class="form-label">Required By Date *</label><input type="date" id="over-pr-date" class="form-control" value="2026-07-20"></div>
          </div>
          <div class="form-group">
            <label class="form-label">Justification * (mandatory)</label>
            <textarea id="over-pr-just" class="form-control" rows="2" placeholder="Clinical reasoning...">Required for new admissions ward.</textarea>
          </div>
        `;
      }

      return `
        <div style="background:var(--bg-surface); border:1px solid var(--border-color); border-radius:8px; width:92%; max-width:620px; box-shadow:var(--shadow-lg); overflow:hidden;" onclick="event.stopPropagation()">
          <!-- Header -->
          <div style="padding:16px 24px; display:flex; justify-content:space-between; align-items:center; ${headerBg}">
            <div style="display:flex; align-items:center; gap:12px;">
              <h3 style="margin:0; font-size:1.1rem; font-family:var(--font-display); font-weight:700;">📦 Request Stock</h3>
              <span style="background:rgba(0,0,0,0.06); padding:4px 8px; border-radius:4px; font-size:0.75rem; font-weight:600; border:1px solid var(--border-color);">Dept: ${dept}</span>
            </div>
            
            <div style="display:flex; align-items:center; gap:8px;">
              <span class="form-label" style="margin:0; font-size:0.75rem; ${urgencyLabelStyle}">Urgency:</span>
              <select id="over-urgency" class="form-select" style="width:auto; padding:2px 20px 2px 8px; font-size:0.75rem;" onchange="window.overChangeUrgency(this.value)">
                <option value="Routine" ${urgency === 'Routine' ? 'selected' : ''}>Routine</option>
                <option value="Urgent" ${urgency === 'Urgent' ? 'selected' : ''}>Urgent</option>
                <option value="STAT" ${urgency === 'STAT' ? 'selected' : ''}>STAT</option>
              </select>
              <button onclick="window.closeStockRequestOverlay()" style="background:none; border:none; font-size:1.4rem; cursor:pointer; color:inherit; font-weight:bold; margin-left:8px;">&times;</button>
            </div>
          </div>

          <!-- Body Tabs -->
          <div style="display:flex; border-bottom:1px solid var(--border-color); background:var(--bg-base-elevated);">
            <div onclick="window.overSwitchTab('Consumable')" style="flex:1; text-align:center; padding:10px; cursor:pointer; font-weight:700; font-size:0.8rem; border-bottom:3px solid ${activeTab === 'Consumable' ? 'var(--primary)' : 'transparent'}; color:${activeTab === 'Consumable' ? 'var(--primary)' : 'var(--text-muted)'};">Consumable Indent</div>
            <div onclick="window.overSwitchTab('Returnable')" style="flex:1; text-align:center; padding:10px; cursor:pointer; font-weight:700; font-size:0.8rem; border-bottom:3px solid ${activeTab === 'Returnable' ? 'var(--primary)' : 'transparent'}; color:${activeTab === 'Returnable' ? 'var(--primary)' : 'var(--text-muted)'};">Returnable Asset</div>
            <div onclick="window.overSwitchTab('Purchase')" style="flex:1; text-align:center; padding:10px; cursor:pointer; font-weight:700; font-size:0.8rem; border-bottom:3px solid ${activeTab === 'Purchase' ? 'var(--primary)' : 'transparent'}; color:${activeTab === 'Purchase' ? 'var(--primary)' : 'var(--text-muted)'};">Purchase Request</div>
          </div>

          <!-- Form Body -->
          <div style="padding:20px 24px; max-height:60vh; overflow-y:auto; display:flex; flex-direction:column; gap:12px;">
            ${formBody}
          </div>

          <!-- Actions Footer -->
          <div style="padding:16px 24px; border-top:1px solid var(--border-color); display:flex; justify-content:flex-end; gap:12px; background:var(--bg-base-elevated);">
            <button class="btn btn-secondary btn-sm" onclick="window.closeStockRequestOverlay()">Cancel</button>
            <button class="btn btn-primary btn-sm" onclick="window.overSubmitForm()">Submit Request</button>
          </div>
        </div>
      `;
    }

    function renderSelectedItemsTable() {
      if (selectedItems.length === 0) return `<div style="font-size:0.75rem; color:var(--text-muted); text-align:center; padding:10px;">No items added to indent yet.</div>`;
      return `
        <table class="custom-table" style="font-size:0.75rem; width:100%;">
          <thead><tr><th>Item Name</th><th>Unit</th><th>Qty</th><th>Purpose</th><th style="text-align:right;">Action</th></tr></thead>
          <tbody>
            ${selectedItems.map((itm, idx) => `
              <tr>
                <td><strong>${itm.name}</strong><br><span class="mono" style="font-size:0.7rem;">${itm.code}</span></td>
                <td>${itm.unit}</td>
                <td>${itm.qty}</td>
                <td>${itm.purpose || '—'}</td>
                <td style="text-align:right;"><a href="javascript:void(0)" onclick="window.overRemoveRow(${idx})" style="color:var(--color-danger); font-weight:700;">Remove</a></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
    }

    // Set utility variables on window so the inline elements can trigger them
    window.overSwitchTab = function (tab) {
      activeTab = tab;
      overlayDiv.innerHTML = renderOverlayHTML();
    };

    window.overChangeUrgency = function (urg) {
      urgency = urg;
      overlayDiv.innerHTML = renderOverlayHTML();
    };

    window.overFilterSearch = function (q) {
      var dd = document.getElementById('over-search-dropdown');
      if (!dd) return;
      if (q.trim().length < 2) { dd.style.display = 'none'; return; }
      var matches = window.state.invStock.filter(s =>
        s.name.toLowerCase().includes(q.toLowerCase()) || s.code.toLowerCase().includes(q.toLowerCase())
      ).slice(0, 8);
      if (!matches.length) { dd.style.display = 'none'; return; }
      dd.innerHTML = matches.map(s => {
        var isLow = s.qty < s.minFloor;
        var badge = isLow ? `<span class="badge badge-danger" style="margin-left:6px; font-size:8px;">LOW</span>` : '';
        if (s.qty === 0) badge = `<span class="badge badge-danger" style="margin-left:6px; font-size:8px;">OUT</span>`;
        return `
          <div onclick="window.overSelectSearchItem('${s.code}','${s.name.replace(/'/g,'&#39;')}', '${s.unit}')" class="inv-drawer-item" style="font-size:0.75rem;">
            <strong>${s.name}</strong> <span class="mono" style="font-size:0.65rem;">(${s.code})</span>
            ${badge}
            <span style="float:right; color:var(--text-muted);">Stock: ${s.qty}</span>
          </div>`;
      }).join('');
      dd.style.display = 'block';
    };

    window.overSelectSearchItem = function (code, name, unit) {
      document.getElementById('over-search-input').value = name;
      document.getElementById('over-search-code').value = code;
      document.getElementById('over-search-unit').value = unit;
      document.getElementById('over-search-dropdown').style.display = 'none';
    };

    window.overAddRow = function () {
      var code = document.getElementById('over-search-code').value;
      var name = document.getElementById('over-search-input').value;
      var qty = parseInt(document.getElementById('over-search-qty').value) || 1;
      var pur = document.getElementById('over-search-purpose').value.trim();
      var unit = document.getElementById('over-search-unit').value || 'pcs';

      if (!code) { alert('Please select an item first.'); return; }
      selectedItems.push({ code: code, name: name, qty: qty, unit: unit, purpose: pur });
      document.getElementById('over-search-input').value = '';
      document.getElementById('over-search-code').value = '';
      document.getElementById('over-search-qty').value = '10';
      document.getElementById('over-search-purpose').value = '';
      
      var container = document.getElementById('over-selected-table-container');
      if (container) container.innerHTML = renderSelectedItemsTable();
    };

    window.overRemoveRow = function (idx) {
      selectedItems.splice(idx, 1);
      var container = document.getElementById('over-selected-table-container');
      if (container) container.innerHTML = renderSelectedItemsTable();
    };

    window.overLoadTemplate = function (idxStr) {
      if (idxStr === '') return;
      var idx = parseInt(idxStr);
      var template = window.state.invTemplates[idx];
      if (template) {
        template.items.forEach(it => {
          var s = window.state.invStock.find(st => st.code === it.code) || {};
          selectedItems.push({
            code: it.code, name: it.name, qty: it.qty, unit: s.unit || 'pcs', purpose: 'Template: ' + template.name
          });
        });
        var container = document.getElementById('over-selected-table-container');
        if (container) container.innerHTML = renderSelectedItemsTable();
      }
    };

    window.closeStockRequestOverlay = async function () {
      var hasData = selectedItems.length > 0 || 
        (document.getElementById('over-notes') && document.getElementById('over-notes').value.trim() !== '') ||
        (document.getElementById('over-pr-desc') && document.getElementById('over-pr-desc').value.trim() !== '');

      if (hasData) {
        if (!await customConfirm("Are you sure you want to discard this request?")) return;
      }
      overlayDiv.remove();
    };

    window.overSubmitForm = function () {
      var reqId = '';
      if (activeTab === 'Consumable') {
        if (selectedItems.length === 0) { alert('Please add at least one item to the list.'); return; }
        reqId = "IND-2026-0" + Math.floor(342 + Math.random() * 50);
        var pUhid = document.getElementById('over-patient-uhid-cons') ? document.getElementById('over-patient-uhid-cons').value.trim() : '';
        window.state.invIndents.unshift({
          id: reqId,
          type: "Consumable",
          dept: dept,
          itemsCount: selectedItems.length,
          raisedBy: "Nurse Coordinator",
          raisedAt: "Today",
          urgency: urgency,
          status: "Pending",
          patientRef: pUhid,
          notes: document.getElementById('over-notes').value,
          items: selectedItems.map(itm => {
            var s = window.state.invStock.find(st => st.code === itm.code);
            return {
              code: itm.code, name: itm.name, req: itm.qty, av: s ? s.qty : 0, unit: itm.unit, issueQty: itm.qty, batch: s ? s.batch : '—', notes: itm.purpose
            };
          })
        });
        alert(`Indent ${reqId} submitted. Store notified.`);
      } else if (activeTab === 'Returnable') {
        var aCode = document.getElementById('over-asset-code').value;
        var start = document.getElementById('over-start-time').value;
        var end = document.getElementById('over-end-time').value;
        var rReason = document.getElementById('over-reason').value;
        var rUhid = document.getElementById('over-patient-uhid').value;
        var assetItem = window.state.invAssets.find(a => a.code === aCode);

        reqId = "RET-2026-0" + Math.floor(12 + Math.random() * 50);
        window.state.invIndents.unshift({
          id: reqId,
          type: "Returnable",
          dept: dept,
          itemsCount: 1,
          raisedBy: "Clinical Staff",
          raisedAt: "Today",
          urgency: urgency,
          status: "Pending",
          items: [{ code: aCode, name: assetItem ? assetItem.name : 'Asset', req: 1, expectedReturn: end, patientRef: rUhid }]
        });
        alert(`Returnable Asset Request ${reqId} submitted.`);
      } else if (activeTab === 'Purchase') {
        var pDesc = document.getElementById('over-pr-desc').value.trim();
        var pCat = document.getElementById('over-pr-cat').value;
        var pRate = parseFloat(document.getElementById('over-pr-rate').value) || 0;
        var pQty = parseInt(document.getElementById('over-pr-qty').value) || 0;
        var pDate = document.getElementById('over-pr-date').value;
        var pJust = document.getElementById('over-pr-just').value.trim();

        if (!pDesc || !pJust || pQty < 1) {
          alert("Item description, Qty and Justification are mandatory fields."); return;
        }

        reqId = "PR-2026-0" + Math.floor(12 + Math.random() * 50);
        window.state.invIndents.unshift({
          id: reqId,
          type: "Purchase",
          dept: dept,
          itemsCount: 1,
          raisedBy: "Dept Coordinator",
          raisedAt: "Today",
          urgency: urgency,
          status: "Admin Approval pending",
          items: [{ name: pDesc, req: pQty, category: pCat, rate: pRate, justification: pJust }]
        });
        alert(`Purchase Request ${reqId} submitted. Admin approval required.`);
      }

      overlayDiv.remove();
      // Safely refresh view if view refresh function is available
      if (window.router && window.router.currentPage && window.views[window.router.currentPage]) {
        window.views[window.router.currentPage](window.router.container, window.router.currentSubAnchor || '', window.router.currentParams || {});
      }
    };

    overlayDiv.innerHTML = renderOverlayHTML();
    document.body.appendChild(overlayDiv);
  };

  // Helper to render My Recent Requests list
  window.renderMyRecentRequestsHTML = function (dept) {
    if (!window.state.invIndents) {
      window.state.invIndents = [];
    }
    var myIndents = window.state.invIndents.filter(i => i.dept === dept).slice(0, 5);
    if (myIndents.length === 0) return '';
    var list = myIndents.map(ind => {
      var itemNames = ind.type === 'Consumable' ? ind.items.map(it => it.name).join(', ') : (ind.type === 'Purchase' ? ind.items[0].name : ind.items[0].name);
      if (itemNames.length > 35) itemNames = itemNames.slice(0, 32) + '...';
      return `
        <div style="display:flex; justify-content:space-between; align-items:center; font-size:0.75rem; border-bottom:1px solid var(--border-color); padding:6px 0;">
          <div><strong class="mono" style="margin-right:6px;">${ind.id}</strong> <span class="badge badge-purple">${ind.type}</span> · <span style="font-weight:600;">${itemNames}</span></div>
          <div style="display:flex; align-items:center; gap:10px;">
            <span class="badge ${ind.status.includes('Approved') || ind.status.includes('Pending') ? 'badge-warning' : 'badge-success'}">${ind.status}</span>
            <span class="mono text-muted" style="font-size:0.7rem;">${ind.raisedAt.split(' · ')[0]}</span>
            ${ind.status === 'Pending' ? `<button class="btn btn-secondary btn-xs" style="padding:1px 4px; font-size:0.65rem;" onclick="window.cancelMyRequestFromModule('${ind.id}','${dept}')">Cancel</button>` : ''}
          </div>
        </div>
      `;
    }).join('');

    return `
      <div class="card" style="box-shadow:var(--shadow-sm); padding:1rem; margin-top:1.5rem;">
        <h4 style="margin:0 0 8px 0; font-size:0.82rem; font-family:var(--font-display); font-weight:700; color:var(--text-primary);">📥 My Recent Stock Requests</h4>
        <div style="display:flex; flex-direction:column;">
          ${list}
        </div>
      </div>
    `;
  };

  window.cancelMyRequestFromModule = async function(id, dept) {
    var reason = await customPrompt("Enter cancel reason (mandatory):");
    if (!reason) { alert("Cancellation cancelled."); return; }
    if (!window.state.invIndents) {
      window.state.invIndents = [];
    }
    var ind = window.state.invIndents.find(i => i.id === id);
    if (ind) {
      ind.status = 'Cancelled';
      ind.notes = 'Cancelled: ' + reason;
      alert(`Request ${id} cancelled successfully.`);
      if (window.router && window.router.currentPage && window.views[window.router.currentPage]) {
        window.views[window.router.currentPage](window.router.container, window.router.currentSubAnchor || '', window.router.currentParams || {});
      }
    }
  };

  // Generic toast alert helper
  window.infoToast = function (msg) {
    alert(msg);
  };

  // Eagerly initialize inventory state on script load
  initInventoryState();

})();
