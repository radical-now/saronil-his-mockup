// Pharmacy Command Center Dashboard
// Saronil Health HIS

(function() {
  // Initialize mock data in state if not present
  function initPharmacyState() {
    if (!window.state) window.state = {};
    
    // Ensure pharmacy state variables exist
    window.state.narcoticDiscrepancies = window.state.narcoticDiscrepancies || [
      { id: 1, name: "Morphine Injection 10mg", schedule: "Schedule X (Narcotic)", ledgerCount: 45, physicalCount: 42, variance: -3, status: "Pending" }
    ];

    window.state.batchRecalls = window.state.batchRecalls || [
      { id: 1, name: "Paracetamol 650mg (Saronil-Para)", batchNo: "B-PH-202602-092", manufacturer: "Cipla Ltd", reason: "Active pharmaceutical ingredient impurities detected by Central Drug Laboratory", stockQty: 480, status: "Active" }
    ];

    window.state.narcoticRegister = window.state.narcoticRegister || [
      { date: "27-Jun-2026", patient: "Ramesh Kumar", uhid: "MH-2026-4802", ipop: "IP-2026-4802", doctor: "Dr. Amit Sharma (MCI-4801)", drug: "Fentanyl 50mcg Injection", dose: "50mcg", qty: 2, batch: "B-PH-202601-081", balance: 18, pharmacist: "R. K. Joshi (Reg-9210)", signature: "Yes" },
      { date: "27-Jun-2026", patient: "Priya Devi", uhid: "MH-2026-9081", ipop: "IP-2026-9081", doctor: "Dr. Sunita Verma (MCI-2901)", drug: "Morphine 10mg Injection", dose: "10mg", qty: 1, batch: "B-PH-202602-102", balance: 14, pharmacist: "R. K. Joshi (Reg-9210)", signature: "Yes" }
    ];

    window.state.disposalRegister = window.state.disposalRegister || [];
    window.state.counsellingLog = window.state.counsellingLog || [];

    // Prescriptions Queue
    if (!window.state.prescriptionsQueue) {
      window.state.prescriptionsQueue = [
        { rxNo: "RX-20260627-0401", name: "Ramesh Kumar", uhid: "MH-2026-4802", source: "ICU-BED-02", doctor: "Dr. Amit Sharma", time: "10m ago", itemsCount: 4, schedule: "Schedule X", status: "Pending" },
        { rxNo: "RX-20260627-0402", name: "Sunita Devi", uhid: "MH-2026-1120", source: "PVT-204", doctor: "Dr. Joy Sen", time: "15m ago", itemsCount: 3, schedule: "Schedule H1", status: "Pending" },
        { rxNo: "RX-20260627-0403", name: "Gopal Banerjee", uhid: "MH-2026-3092", source: "SP-301", doctor: "Dr. Joy Sen", time: "25m ago", itemsCount: 5, schedule: "Schedule H", status: "Partially Dispensed" },
        { rxNo: "RX-20260627-0404", name: "Harpreet Singh", uhid: "MH-2026-8812", source: "PVT-201", doctor: "Dr. Amit Sharma", time: "30m ago", itemsCount: 2, schedule: "High Alert (Insulin)", status: "Pending" },
        { rxNo: "RX-20260627-0405", name: "Elena Gilbert", uhid: "MH-2026-4402", source: "OPD Retail Counter", doctor: "Dr. A. K. Mehta", time: "35m ago", itemsCount: 2, schedule: "OTC", status: "Pending" }
      ];
    }

    // Ward Indents
    if (!window.state.wardIndents) {
      window.state.wardIndents = [
        { indentNo: "IND-20260627-001", ward: "ICU", raisedBy: "Sister Mercy", itemsCount: 12, time: "15m ago", status: "Raised" },
        { indentNo: "IND-20260627-002", ward: "GENERAL-WARD-M", raisedBy: "Nurse Anil", itemsCount: 8, time: "35m ago", status: "Under Review" }
      ];
    }

    // IV Admixture/TPN list
    if (!window.state.ivAdmixtures) {
      window.state.ivAdmixtures = [
        { id: 1, patient: "Baby of Pinky", uhid: "MH-2026-0812", ward: "NICU-BED-04", type: "Neonatal TPN", orderedBy: "Dr. Verma", time: "20m ago", pharmacist: "Tech Amit", status: "Preparing" }
      ];
    }

    // Refrigerator temperature log
    if (!window.state.refrigeratorTemp) {
      window.state.refrigeratorTemp = { temp: 4.2, lastChecked: "05:15 PM" };
    }

    // Purchase Orders list
    if (!window.state.purchaseOrders) {
      window.state.purchaseOrders = [
        { poNo: "PO-20260627-001", supplier: "Cipla Ltd", items: "Paracetamol, Azithromycin", date: "27-Jun-2026", expected: "29-Jun-2026", total: 45000.00, status: "Raised" },
        { poNo: "PO-20260627-002", supplier: "Sun Pharma", items: "Pantocid, Volini Gel", date: "26-Jun-2026", expected: "28-Jun-2026", total: 28500.00, status: "Acknowledged" }
      ];
    }

    // GRN List
    if (!window.state.grnList) {
      window.state.grnList = [
        { grnNo: "GRN-20260627-101", supplier: "Cipla Ltd", invoiceNo: "INV-99018", invoiceDate: "25-Jun-2026", poRef: "PO-20260627-001", total: 45000.00, status: "Completed" }
      ];
    }
  }

  // Define global view function
  window.views = window.views || {};
  window.views.pharmacyDashboard = function(container) {
    initPharmacyState();
    
    const activeRole = localStorage.getItem('saronil_active_pharmacy_role') || 'Pharmacist (In-charge)';
    const activeCounter = localStorage.getItem('saronil_active_pharmacy_counter') || 'IPD Pharmacy';

    const styles = `
      <style>
        .pharmacy-alert-banner {
          font-size: 0.75rem;
          padding: 8px 16px;
          border-left: 4px solid;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 8px;
        }
        .pharmacy-alert-red { background-color: #FEF2F2; border-left-color: #EF4444; color: #991B1B; border: 1px solid #FEE2E2; }
        .pharmacy-alert-orange { background-color: #FFFAF0; border-left-color: #F59E0B; color: #92400E; border: 1px solid #FEF3C7; }
        .pharmacy-alert-amber { background-color: #FFFBEB; border-left-color: #D97706; color: #92400E; border: 1px solid #FEF3C7; }
        
        .pharmacy-tab-btn {
          font-size: 0.75rem;
          padding: 6px 12px;
          border-bottom: 2px solid transparent;
          color: var(--text-muted);
          cursor: pointer;
        }
        .pharmacy-tab-btn.active {
          border-bottom-color: var(--primary);
          color: var(--primary);
          font-weight: 700;
        }
      </style>
    `;

    container.innerHTML = styles + `
      <div style="padding: 12px 0;">
        
        <!-- SECTION 1 — CRITICAL ALERT BANNERS -->
        <div id="pharmacy-critical-banners-container" style="margin-bottom: 16px;">
          <!-- Dynamically filled alerts -->
        </div>

        <!-- SECTION 2 — ROLE + COUNTER BAR -->
        <div style="margin-top: 4px; margin-bottom: 16px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
          <div>
            <h1 style="font-size: 1.35rem; font-weight: 700; color: var(--text-primary); margin: 0; font-family: var(--font-display);">Pharmacy Command Center</h1>
            <div style="font-size: 0.78rem; color: var(--text-muted); margin-top: 2px;">CDSCO Drug Schedule Enforcement · NDPS Act Compliance · FEFO Stock Dispatch</div>
          </div>

          <div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap;">
            <div>
              <select id="ph-role-select" onchange="window.switchPharmacyRole(this.value)" style="font-size: 0.72rem; font-weight: 600; padding: 4px 10px; border-radius: 4px; border: 1px solid var(--border-color); background: var(--bg-surface-elevated);">
                <option value="Pharmacy Technician" ${activeRole === 'Pharmacy Technician' ? 'selected' : ''}>Pharmacy Technician</option>
                <option value="Pharmacist (In-charge)" ${activeRole === 'Pharmacist (In-charge)' ? 'selected' : ''}>Pharmacist (In-charge)</option>
                <option value="Pharmacy Manager" ${activeRole === 'Pharmacy Manager' ? 'selected' : ''}>Pharmacy Manager / Store Incharge</option>
              </select>
            </div>
            <div>
              <select id="ph-counter-select" onchange="window.switchPharmacyCounter(this.value)" style="font-size: 0.72rem; font-weight: 600; padding: 4px 10px; border-radius: 4px; border: 1px solid var(--border-color); background: var(--bg-surface-elevated);">
                <option value="IPD Pharmacy" ${activeCounter === 'IPD Pharmacy' ? 'selected' : ''}>IPD Pharmacy Counter</option>
                <option value="OPD/Retail Counter" ${activeCounter === 'OPD/Retail Counter' ? 'selected' : ''}>OPD / Retail Counter</option>
                <option value="Central Store" ${activeCounter === 'Central Store' ? 'selected' : ''}>Store / Central Pharmacy</option>
              </select>
            </div>
            <div class="admin-mono" style="font-size: 0.72rem; background: var(--bg-surface-elevated); padding: 4px 10px; border-radius: 4px; border: 1px solid var(--border-color); font-weight: 500;">
              🌅 Morning Shift
            </div>
            <div id="ph-counter-collection-badge" class="admin-mono" style="font-size: 0.72rem; background: #FFF; border: 1px solid var(--border-color); padding: 4px 10px; border-radius: 4px; font-weight: bold; color: var(--text-primary); display: ${activeCounter === 'OPD/Retail Counter' ? 'block' : 'none'};">
              Collection: ₹42,500.00
            </div>
          </div>
        </div>

        <!-- SECTION 3 — KPI STAT CARDS -->
        <div class="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-8 gap-4 mb-6" id="pharmacy-kpi-grid">
          <!-- Filtered dynamically by role and counter context -->
        </div>

        <!-- SECTION 4 — QUICK ACTION BAR -->
        <div style="background-color: var(--bg-surface); padding: 10px 16px; border: 1px solid var(--border-color); border-radius: 6px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; margin-bottom: 16px;">
          <div style="display: flex; gap: 8px; flex-wrap: wrap;" id="pharmacy-actions-container">
            <!-- Filtered dynamically -->
          </div>
          <div style="width: 280px; position: relative;">
            <input type="text" id="pharmacy-global-search" placeholder="Drug / Batch / UHID / Presc No..." onkeyup="window.filterPharmacyDashboard(this.value)" style="width: 100%; border: 1px solid var(--border-color); border-radius: 4px; padding: 6px 12px; font-size: 0.8rem; background-color: #F8FAFC;">
          </div>
        </div>

        <!-- SECTION 5 — THREE-COLUMN MAIN AREA -->
        <div style="display: grid; grid-template-columns: 35% 35% 30%; gap: 12px; min-width: 1200px; align-items: start;">
          
          <!-- LEFT COLUMN (35%) -->
          <div style="display: flex; flex-direction: column; gap: 12px;">
            <!-- 1. Prescription Queue -->
            <div class="card" style="margin-bottom: 0;">
              <div class="card-header" style="border-bottom: 1px solid var(--border-color); padding: 10px 12px;">
                <h3 style="font-size: 0.85rem; font-weight: 700; color: var(--text-primary); margin:0;">1. Prescription Queue</h3>
                <div style="display:flex; gap:3px; margin-top:6px;">
                  <button class="btn btn-xs btn-primary text-[9px]" id="rx-filter-all" onclick="window.filterRxQueue('all')" style="padding:1px 3px;">All</button>
                  <button class="btn btn-xs btn-secondary text-[9px]" id="rx-filter-pending" onclick="window.filterRxQueue('Pending')" style="padding:1px 3px;">Pending</button>
                  <button class="btn btn-xs btn-secondary text-[9px]" id="rx-filter-narc" onclick="window.filterRxQueue('X')" style="padding:1px 3px;">Narcotics</button>
                </div>
              </div>
              <div class="card-body" style="padding: 10px; display: flex; flex-direction: column; gap: 8px;" id="prescriptions-queue-container">
                <!-- Dynamic Rx list -->
              </div>
            </div>

            <!-- Drug Safety Alerts -->
            <div class="card" style="margin-bottom: 0;">
              <div class="card-header" style="border-bottom: 1px solid var(--border-color); padding: 8px 10px;">
                <h4 style="font-size: 0.8rem; font-weight: 700; color: var(--text-primary); margin:0;">💊 Patient Drug Safety Monitor</h4>
              </div>
              <div class="card-body" style="padding: 8px; display:flex; flex-direction:column; gap:6px;" id="drug-safety-alerts-container">
                <!-- LASA, interactions, allergies -->
              </div>
            </div>

            <!-- Dispense Category stats -->
            <div class="card" style="margin-bottom: 0;">
              <div class="card-header" style="border-bottom: 1px solid var(--border-color); padding: 8px 10px;">
                <h4 style="font-size: 0.8rem; font-weight: 700; color: var(--text-primary); margin:0;">Dispense statistics (Today)</h4>
              </div>
              <div class="card-body" style="padding: 8px;">
                <div style="font-size:0.68rem; line-height:1.5; color:var(--text-secondary);">
                  • Antibiotics: <strong>48 dispenses</strong><br>
                  • Analgesics / Anti-inflam: <strong>64 dispenses</strong><br>
                  • Cold chain Vaccines/Insulins: <strong>14 dispenses</strong><br>
                  • Narcotic Schedule X: <span style="background-color:#F3E5F5; color:#6A1B9A; font-weight:bold; padding:1px 3px; border-radius:2px;">2 logs</span>
                </div>
              </div>
            </div>
          </div>

          <!-- CENTRE COLUMN (35%) -->
          <div style="display: flex; flex-direction: column; gap: 12px;">
            <!-- 2. Workdesk & Indents -->
            <div class="card" style="margin-bottom: 0;">
              <div class="card-header" style="border-bottom: 1px solid var(--border-color); padding: 10px 12px;">
                <h3 style="font-size: 0.85rem; font-weight: 700; color: var(--text-primary); margin:0;">2. Workdesk & Indents</h3>
                <div style="display:flex; gap:3px; margin-top:6px;">
                  <button class="btn btn-xs btn-primary text-[9px]" id="work-filter-ipd" onclick="window.filterWorkdeskTab('ipd')" style="padding:1px 3px;">IPD Wards</button>
                  <button class="btn btn-xs btn-secondary text-[9px]" id="work-filter-ind" onclick="window.filterWorkdeskTab('indents')" style="padding:1px 3px;">Indents</button>
                  <button class="btn btn-xs btn-secondary text-[9px]" id="work-filter-iv" onclick="window.filterWorkdeskTab('iv')" style="padding:1px 3px;">IV / TPN</button>
                  <button class="btn btn-xs btn-secondary text-[9px]" id="work-filter-opd" onclick="window.filterWorkdeskTab('opd')" style="padding:1px 3px;">OPD Counter</button>
                </div>
              </div>
              <div class="card-body" style="padding: 10px; display: flex; flex-direction: column; gap: 8px;" id="dispensing-worklist-container">
                <!-- Dynamic indents or IV tasks -->
              </div>
            </div>
          </div>

          <!-- RIGHT COLUMN (30%) -->
          <div style="display: flex; flex-direction: column; gap: 12px;">
            <!-- 3. Inventory & CDSCO Logs -->
            <div class="card" style="margin-bottom: 0;">
              <div class="card-header" style="border-bottom: 1px solid var(--border-color); padding: 10px 12px;">
                <h3 style="font-size: 0.85rem; font-weight: 700; color: var(--text-primary); margin:0;">3. Inventory & CDSCO Logs</h3>
                <div style="display:flex; gap:3px; margin-top:6px;">
                  <button class="btn btn-xs btn-primary text-[9px]" id="stock-filter-reg" onclick="window.filterStockTab('register')" style="padding:1px 3px;">Stock Reg</button>
                  <button class="btn btn-xs btn-secondary text-[9px]" id="stock-filter-narc" onclick="window.filterStockTab('narcotic')" style="padding:1px 3px;">Narcotic Reg</button>
                </div>
              </div>
              <div class="card-body" style="padding: 10px; display: flex; flex-direction: column; gap: 8px;" id="stock-management-container">
                <!-- Stock list or narcotic ledgers -->
              </div>
            </div>

            <!-- Low stock auto-flag strip -->
            <div class="card" style="margin-top: 12px; margin-bottom: 0;">
              <div class="card-header" style="border-bottom: 1px solid var(--border-color); padding: 10px 12px; display: flex; justify-content: space-between; align-items: center;">
                <h3 style="font-size: 0.85rem; font-weight: 700; color: var(--text-primary); margin:0;">⚠️ Pharmacy Low Stock</h3>
              </div>
              <div class="card-body" style="padding: 10px; display: flex; flex-direction: column; gap: 8px;">
                <div style="font-size:0.75rem; display:flex; justify-content:space-between; align-items:center; color:var(--text-primary);">
                  <span>Tab Metformin 500mg: <strong>0 strips</strong> <span class="badge badge-danger" style="font-size:8px;">OUT</span></span>
                  <button class="btn btn-primary btn-xs" style="padding:1px 4px; font-size:8px;" onclick="window.showStockRequestOverlay({dept:'Pharmacy', urgency:'Urgent', prefillItem:{code:'ITM-CON-PHARM', name:'Tab Metformin 500mg', qty:50, unit:'strips'}})">Request</button>
                </div>
                <div style="font-size:0.75rem; display:flex; justify-content:space-between; align-items:center; color:var(--text-primary);">
                  <span>Tab Paracetamol 650mg: <strong>5 strips</strong> <span class="badge badge-warning" style="font-size:8px;">LOW</span></span>
                  <button class="btn btn-primary btn-xs" style="padding:1px 4px; font-size:8px;" onclick="window.showStockRequestOverlay({dept:'Pharmacy', urgency:'Routine', prefillItem:{code:'ITM-CON-PHARM2', name:'Tab Paracetamol 650mg', qty:100, unit:'strips'}})">Request</button>
                </div>
              </div>
            </div>

            <!-- My Recent Requests -->
            ${window.renderMyRecentRequestsHTML ? window.renderMyRecentRequestsHTML('Pharmacy') : ''}
          </div>
        </div>

        <!-- SECTION 6 — STOCK MANAGEMENT TABS (PO, GRN, SUPPLIER, FORMULARY) -->
        <div class="card" style="margin-top: 16px;">
          <div class="card-header" style="border-bottom: 1px solid var(--border-color); padding: 10px 16px; display:flex; justify-content:space-between; align-items:center;">
            <h3 style="font-size: 0.9rem; font-weight: 700; color: var(--text-primary); margin:0;">Procurement & Formulary Registers</h3>
            <div style="display:flex; gap:4px;" id="pharmacy-tabs-bar">
              <span class="pharmacy-tab-btn active" onclick="window.switchProcTab('PurchaseOrders')">Purchase Orders (PO)</span>
              <span class="pharmacy-tab-btn" onclick="window.switchProcTab('GRN')">Goods Receipt Notes (GRN)</span>
              <span class="pharmacy-tab-btn" onclick="window.switchProcTab('Suppliers')">Sponsors / Suppliers</span>
              <span class="pharmacy-tab-btn" onclick="window.switchProcTab('Formulary')">Hospital Formulary</span>
            </div>
          </div>
          <div class="card-body" style="padding: 12px; overflow-x: auto;" id="proc-tab-content-container">
            <!-- Dynamic tabular view -->
          </div>
        </div>

        <!-- SECTION 9 — SHIFT SUMMARY (Pharmacy Manager only) -->
        <div class="card" id="pharmacy-shift-summary-card" style="margin-top: 16px; display: none;">
          <div class="card-header" style="border-bottom: 1px solid var(--border-color); padding: 10px 16px;">
            <h3 style="font-size: 0.9rem; font-weight: 700; color: var(--text-primary); margin:0;">Shift Performance indicator & Sign-off</h3>
          </div>
          <div class="card-body" style="padding: 16px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px;">
            <div style="background-color: var(--bg-surface-elevated); padding: 12px; border-radius: 6px; border: 1px solid var(--border-color);">
              <h4 style="font-weight:bold; font-size:0.78rem; margin-bottom:8px; color:var(--primary);">A. Dispensing Summary</h4>
              <div style="font-size: 0.72rem; line-height: 1.5; color: var(--text-secondary);">
                • IPD Rxs filled: 92 cases | Pending: 3<br>
                • OPD bills raised: 114 receipts | Counter total: ₹42,500.00<br>
                • Ward Indents filled: 20 dispatches | Overdue: 0
              </div>
            </div>
            <div style="background-color: var(--bg-surface-elevated); padding: 12px; border-radius: 6px; border: 1px solid var(--border-color);">
              <h4 style="font-weight:bold; font-size:0.78rem; margin-bottom:8px; color:var(--primary);">B. Narcotic NDPS Reconciliation</h4>
              <div style="font-size: 0.72rem; line-height: 1.5; color: var(--text-secondary);">
                • Schedule X opening balance: 32 vials<br>
                • Dispensed this shift: 3 vials | Returns: 0<br>
                • Physical audit variance: <strong class="text-emerald-600">0 (Zero Variance)</strong>
              </div>
            </div>
            <div style="background-color: var(--bg-surface-elevated); padding: 12px; border-radius: 6px; border: 1px solid var(--border-color); display:flex; flex-direction:column; justify-content:space-between;">
              <div>
                <h4 style="font-weight:bold; font-size:0.78rem; margin-bottom:8px; color:var(--primary);">C. Reagents & Expiries</h4>
                <div style="font-size: 0.72rem; line-height: 1.5; color: var(--text-secondary);">
                  • Expired drugs quarantined: 12 units<br>
                  • Cold chain temperature limits: Kept in range (2.0–8.0°C)
                </div>
              </div>
              <button class="btn btn-primary btn-sm" onclick="window.signOffPharmacyShift()" style="width:100%; padding:4px; font-size:0.7rem; margin-top:8px;">Daily Reconciliation Sign-off</button>
            </div>
          </div>
        </div>
      </div>

      <!-- DISPENSING WIZARD MODAL (Prescription verification flow) -->
      <div id="dispense-wizard-overlay" style="display: none; position: fixed; inset: 0; background: rgba(15, 23, 42, 0.6); backdrop-filter: blur(4px); z-index: 9999; align-items: center; justify-content: center; padding: 20px;">
        <div style="background: white; border-radius: 8px; width: 100%; max-width: 780px; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1); display: flex; flex-direction: column; max-height: 90vh;">
          
          <!-- Stepper Header -->
          <div style="border-bottom: 1px solid var(--border-color); padding: 16px 24px; display: flex; align-items: center; justify-content: space-between; background-color: #F8FAFC;">
            <div>
              <h2 id="disp-wizard-title" style="font-size: 1.1rem; font-weight: 700; color: var(--text-primary); margin: 0;">Prescription Dispensing & Verification</h2>
              <p style="font-size: 0.75rem; color: var(--text-muted); margin: 2px 0 0 0;">Verify Drug Schedules (H/H1/X), check allergies, auto-suggest batch (FEFO), and sign-off.</p>
            </div>
            <button onclick="window.closeDispenseWizard()" style="font-size: 1.3rem; font-weight: 600; color: var(--text-muted); border: none; background: transparent; cursor: pointer;">&times;</button>
          </div>

          <!-- Wizard Body -->
          <div id="disp-wizard-body" style="flex: 1; overflow-y: auto; padding: 24px; font-size: 0.72rem;">
            <!-- Step Content -->
            <div id="dispense-wizard-content">
              <!-- Dynamically populated steps -->
            </div>
          </div>

          <!-- Wizard Footer Controls -->
          <div style="border-top: 1px solid var(--border-color); padding: 16px 24px; display: flex; justify-content: flex-end; gap: 8px; background-color: #F8FAFC;">
            <button class="btn btn-secondary btn-sm" onclick="window.closeDispenseWizard()">Cancel</button>
            <button class="btn btn-primary btn-sm" id="dispense-wizard-submit-btn" onclick="window.submitDispenseWizard()">
              Confirm Dispense & Post Auto-billing
            </button>
          </div>
        </div>
      </div>

      <!-- COUNSELLING LOG REGISTER MODAL (Section 8) -->
      <div id="counselling-log-modal" style="display: none; position: fixed; inset: 0; background: rgba(15, 23, 42, 0.6); backdrop-filter: blur(4px); z-index: 9999; align-items: center; justify-content: center; padding: 20px;">
        <div style="background: white; border-radius: 8px; width: 100%; max-width: 500px; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1); display: flex; flex-direction: column;">
          <div style="border-bottom: 1px solid var(--border-color); padding: 12px 16px; background-color: #EFF6FF; color: #1E40AF; display:flex; justify-content:space-between; align-items:center;">
            <h3 style="margin: 0; font-size: 0.95rem; font-weight: 700;">🗣️ NABH Patient Medication Counselling Register</h3>
            <button onclick="window.closeCounsellingModal()" style="font-size: 1.2rem; font-weight: bold; background: transparent; border: none; cursor: pointer; color: #1E40AF;">&times;</button>
          </div>
          <div style="padding: 16px; font-size: 0.72rem; display: flex; flex-direction: column; gap: 10px;">
            <div>
              <label style="display:block; font-weight: 500; margin-bottom: 2px;">Patient UHID / Visit ID *</label>
              <input type="text" id="cns-uhid" placeholder="MH-2026-4802" style="width:100%; padding:5px; border:1px solid var(--border-color); border-radius:4px;">
            </div>
            <div>
              <label style="display:block; font-weight: 500; margin-bottom: 2px;">Counselling Language *</label>
              <select id="cns-language" style="width:100%; padding:5px; border:1px solid var(--border-color); border-radius:4px;">
                <option value="Hindi">Hindi / regional</option>
                <option value="English">English</option>
              </select>
            </div>
            
            <div style="border: 1px solid #BFDBFE; border-radius: 4px; padding: 8px; background: #EFF6FF;">
              <div style="font-weight:bold; color: #1E40AF; margin-bottom:4px;">NABH Counselling Checklist:</div>
              <label style="display:flex; align-items:center; gap:6px;"><input type="checkbox" id="chk-cns-name" checked> Drug name & clinical purpose explained</label>
              <label style="display:flex; align-items:center; gap:6px;"><input type="checkbox" id="chk-cns-dose" checked> Dose strength & administration timing</label>
              <label style="display:flex; align-items:center; gap:6px;"><input type="checkbox" id="chk-cns-store" checked> Refrigerator cold chain guidelines explained</label>
              <label style="display:flex; align-items:center; gap:6px;"><input type="checkbox" id="chk-cns-side" checked> Side effects & food-drug restrictions noted</label>
            </div>

            <div style="border-top:1px solid var(--border-color); padding-top:10px; display:flex; justify-content:flex-end; gap:8px;">
              <button class="btn btn-secondary btn-sm" onclick="window.closeCounsellingModal()">Cancel</button>
              <button class="btn btn-primary btn-sm" onclick="window.saveCounsellingLog()">
                Save Counselling Record
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    // Load initial layout elements
    window.renderPharmacyAlerts();
    window.renderPharmacyKpis();
    window.renderPharmacyActions();
    window.renderPharmacyPrescriptions();
    window.renderPharmacyWorkdesk();
    window.renderPharmacyStock();
    window.renderDrugSafetyAlerts();
    window.switchProcTab('PurchaseOrders');
    
    // Auto-toggle manager elements if manager is selected
    if (activeRole === 'Pharmacy Manager') {
      const mgrBlock = document.getElementById('pharmacy-shift-summary-card');
      if (mgrBlock) mgrBlock.style.display = 'block';
    }
  };

  // SWITCH PHARMACY ROLE
  window.switchPharmacyRole = function(role) {
    localStorage.setItem('saronil_active_pharmacy_role', role);
    const mgrBlock = document.getElementById('pharmacy-shift-summary-card');
    if (mgrBlock) {
      mgrBlock.style.display = (role === 'Pharmacy Manager') ? 'block' : 'none';
    }
    window.renderPharmacyKpis();
    window.renderPharmacyActions();
  };

  // SWITCH PHARMACY COUNTER
  window.switchPharmacyCounter = function(counter) {
    localStorage.setItem('saronil_active_pharmacy_counter', counter);
    
    const collectionBadge = document.getElementById('ph-counter-collection-badge');
    if (collectionBadge) {
      collectionBadge.style.display = (counter === 'OPD/Retail Counter') ? 'block' : 'none';
    }
    
    window.renderPharmacyKpis();
    window.renderPharmacyPrescriptions();
    window.renderPharmacyWorkdesk();
  };

  // RENDER: SECTION 1 — CRITICAL ALERT BANNERS
  window.renderPharmacyAlerts = function() {
    const container = document.getElementById('pharmacy-critical-banners-container');
    if (!container) return;

    let html = '';

    // Narcotic discrepancies
    window.state.narcoticDiscrepancies.forEach(d => {
      if (d.status === 'Pending') {
        html += `
          <div class="pharmacy-alert-banner pharmacy-alert-red">
            <div>
              <strong>🚨 NDPS DISCREPANCY LIMIT EXCEEDED:</strong> ${d.name} (${d.schedule}) · 
              Ledger count: <span class="admin-mono font-bold">${d.ledgerCount}</span> vs Physical count: <span class="admin-mono font-bold">${d.physicalCount}</span> · 
              Variance: <span class="admin-mono font-bold text-red-600">${d.variance} units</span>.
            </div>
            <div>
              <button class="btn btn-sm btn-primary" onclick="window.resolveNarcoticDiscrepancy(${d.id})" style="padding:2px 6px; font-size:9px; background-color:#EF4444; border-color:#EF4444;">Resolve Discrepancy</button>
            </div>
          </div>
        `;
      }
    });

    // Batch Recalls
    window.state.batchRecalls.forEach(r => {
      if (r.status === 'Active') {
        html += `
          <div class="pharmacy-alert-banner pharmacy-alert-red">
            <div>
              <strong>🚨 BATCH RECALL NOTICE:</strong> ${r.name} · Batch: <span class="admin-mono">${r.batchNo}</span> · 
              Mfr: ${r.manufacturer} · Reason: <span style="font-weight:600;">${r.reason}</span> · Stock: <span class="admin-mono font-bold">${r.stockQty} tabs</span>.
            </div>
            <div>
              <button class="btn btn-sm btn-primary" onclick="window.quarantineBatch(${r.id})" style="padding:2px 6px; font-size:9px; background-color:#EF4444; border-color:#EF4444;">Quarantine Batch</button>
            </div>
          </div>
        `;
      }
    });

    // Low stock reorder list
    html += `
      <div class="pharmacy-alert-banner pharmacy-alert-amber">
        <div>
          <strong>📦 LOW STOCK WARNING:</strong> Pantocid 40mg (20 tabs remaining, level 100) · Insulin Glargine (2 pens remaining, level 10).
        </div>
        <button class="btn btn-secondary btn-xs" onclick="window.raiseReorderIndent()" style="font-size:9px; padding:2px 6px;">Raise Indent</button>
      </div>
    `;

    container.innerHTML = html;
  };

  window.resolveNarcoticDiscrepancy = function(id) {
    const reason = window.prompt("NDPS ACT 1985 REQUIREMENT: Enter explanation/justification signed by Pharmacist-In-Charge for discrepancy:", "");
    if (reason) {
      window.state.narcoticDiscrepancies.forEach(d => {
        if (d.id === id) d.status = 'Resolved';
      });
      window.renderPharmacyAlerts();
      alert("Discrepancy sign-off saved in state NDPS log. Drug unlocked.");
    }
  };

  window.quarantineBatch = function(id) {
    window.state.batchRecalls.forEach(r => {
      if (r.id === id) r.status = 'Quarantined';
    });
    window.renderPharmacyAlerts();
    alert("Batch QUARANTINED. Dispense blocked from all counter registers. Ward nurses auto-notified.");
  };

  window.raiseReorderIndent = function() {
    alert("Reorder indents created and dispatched to Central Store Pharmacy.");
  };

  // RENDER: SECTION 3 — KPI STAT CARDS
  window.renderPharmacyKpis = function() {
    const grid = document.getElementById('pharmacy-kpi-grid');
    if (!grid) return;

    const role = localStorage.getItem('saronil_active_pharmacy_role') || 'Pharmacist (In-charge)';
    const counter = localStorage.getItem('saronil_active_pharmacy_counter') || 'IPD Pharmacy';
    
    let html = '';

    if (role === 'Pharmacy Manager') {
      const stats = [
        { label: "Total Inventory Value", val: "₹18.4 Lakhs", sub: "FIFO/FEFO valuation" },
        { label: "Low Stock Items", val: "14 items", sub: "Reorder required" },
        { label: "Expiring ≤30 days", val: "8 batches", sub: "Quarantine and clear" },
        { label: "Expiring 31–90 days", val: "22 batches", sub: "Supplier returns" },
        { label: "PO Pending", val: `${window.state.purchaseOrders.filter(p => p.status === 'Raised').length}`, sub: "Awaiting delivery" },
        { label: "GRN Pending", val: "3 invoices", sub: "Central store ledger" },
        { label: "Ward Indents Pending", val: `${window.state.wardIndents.length}`, sub: "Fill queues" },
        { label: "Disposal Pending", val: "4 batches", sub: "CPCB BMW Form IX" }
      ];
      html = stats.map(s => `
        <div class="bg-white rounded-lg border border-slate-200 p-4 flex flex-col justify-between" style="min-height: 105px;">
          <div>
            <div class="text-xs text-slate-500 font-medium">${s.label}</div>
            <div class="text-xl font-bold tracking-tight text-slate-900 mt-1">${s.val}</div>
          </div>
          <div class="text-[10px] text-slate-400 font-medium mt-1">${s.sub}</div>
        </div>
      `).join('');
    } else if (counter === 'OPD/Retail Counter') {
      const stats = [
        { label: "Bills Generated Today", val: "114 bills", sub: "Outpatient retail" },
        { label: "Collection (Today)", val: "₹42,500.00", sub: "Cash/UPI splits" },
        { label: "Items Dispensed", val: "380 packs", sub: "OPD retail" },
        { label: "Unverified Doctor UHID", val: "0 cases", sub: "CDSCO restriction" },
        { label: "Schedule H / H1 Logs", val: "48 logs", sub: "Antibiotics register" },
        { label: "Returns / Refunds", val: "2 bills (₹850)", sub: "Seal intact checked" },
        { label: "Low Stock Counter", val: "4 items", sub: "Central store refill" },
        { label: "Home Delivery Queue", val: "2 orders", sub: "Assigned dispatch" }
      ];
      html = stats.map(s => `
        <div class="bg-white rounded-lg border border-slate-200 p-4 flex flex-col justify-between" style="min-height: 105px;">
          <div>
            <div class="text-xs text-slate-500 font-medium">${s.label}</div>
            <div class="text-xl font-bold tracking-tight text-slate-900 mt-1">${s.val}</div>
          </div>
          <div class="text-[10px] text-slate-400 font-medium mt-1">${s.sub}</div>
        </div>
      `).join('');
    } else {
      // IPD counter
      const stats = [
        { label: "Rx Received Today", val: `${window.state.prescriptionsQueue.length}`, sub: "Ward admissions orders" },
        { label: "Pending Dispense", val: `${window.state.prescriptionsQueue.filter(p => p.status === 'Pending').length}`, sub: "Amber if >5" },
        { label: "Medicines Dispensed", val: "248 items", sub: "Ward indents filled" },
        { label: "Returns Received", val: "6 orders (₹3,200)", sub: "IPD account credit" },
        { label: "Low Stock Wards", val: "8 items", sub: "Emergency stock" },
        { label: "Near Expiry ≤90 days", val: "12 batches", sub: "Supplier returns" },
        { label: "Schedule X Dispenses", val: "2 cases", sub: "NDPS reconciliation" },
        { label: "Ward Indents Pending", val: `${window.state.wardIndents.length}`, sub: "Fill queues" }
      ];
      html = stats.map(s => `
        <div class="bg-white rounded-lg border border-slate-200 p-4 flex flex-col justify-between" style="min-height: 105px;">
          <div>
            <div class="text-xs text-slate-500 font-medium">${s.label}</div>
            <div class="text-xl font-bold tracking-tight text-slate-900 mt-1">${s.val}</div>
          </div>
          <div class="text-[10px] text-slate-400 font-medium mt-1">${s.sub}</div>
        </div>
      `).join('');
    }

    grid.innerHTML = html;
  };

  // RENDER: SECTION 4 — QUICK ACTIONS
  window.renderPharmacyActions = function() {
    const container = document.getElementById('pharmacy-actions-container');
    if (!container) return;

    const role = localStorage.getItem('saronil_active_pharmacy_role') || 'Pharmacist (In-charge)';
    const counter = localStorage.getItem('saronil_active_pharmacy_counter') || 'IPD Pharmacy';

    let html = '';

    if (role === 'Pharmacy Manager') {
      html = `
        <button class="btn btn-primary btn-sm" onclick="window.mockCreatePO()">📦 Create PO</button>
        <button class="btn btn-secondary btn-sm" onclick="window.mockReceiveGRN()">📄 Receive GRN</button>
        <button class="btn btn-secondary btn-sm" onclick="window.mockDisposalRequest()">🔥 Raise Disposal Request</button>
        <button class="btn btn-secondary btn-sm" onclick="window.mockFormularyMgt()">📋 Hospital Formulary</button>
      `;
    } else if (counter === 'OPD/Retail Counter') {
      html = `
        <button class="btn btn-primary btn-sm" onclick="window.mockNewOpdBill()">💳 New OPD Bill</button>
        <button class="btn btn-secondary btn-sm" onclick="window.mockCollectOPDPayment()">💰 Collect Payment</button>
        <button class="btn btn-secondary btn-sm" onclick="window.mockReturnRefund()">❌ Return / Refund</button>
      `;
    } else {
      // IPD
      html = `
        <button class="btn btn-primary btn-sm" onclick="window.mockDispenseRx()">💊 Dispense Medicine</button>
        <button class="btn btn-secondary btn-sm" onclick="window.mockVerifyRx()">Verify Prescription</button>
        <button class="btn btn-secondary btn-sm" onclick="window.mockFillIndent()">📋 Fill Ward Indent</button>
        <button class="btn btn-secondary btn-sm" onclick="window.openCounsellingModal()">🗣️ Counselling Log</button>
      `;
    }
    
    html += `
      <button class="btn btn-secondary btn-sm" style="background:#1d4ed8; color:#fff;" onclick="window.showStockRequestOverlay({dept:'Pharmacy', urgency:'Urgent'})">📦 Request Stock</button>
    `;

    container.innerHTML = html;
  };

  // RENDER: Column 1 - Prescription Queue
  window.renderPharmacyPrescriptions = function(filterVal = 'all') {
    const container = document.getElementById('prescriptions-queue-container');
    if (!container) return;

    let list = window.state.prescriptionsQueue;
    if (filterVal === 'Pending') {
      list = list.filter(p => p.status === 'Pending');
    } else if (filterVal === 'X') {
      list = list.filter(p => p.schedule === 'Schedule X');
    }

    container.innerHTML = list.map(p => {
      let badgeClass = "badge-priority-routine";
      if (p.schedule === 'Schedule X' || p.schedule.includes('High')) badgeClass = "badge-priority-stat";
      else if (p.schedule === 'Schedule H1') badgeClass = "badge-priority-urgent";

      let statusColor = "text-slate-500";
      if (p.status === 'Pending') statusColor = "text-red-500 font-bold";
      else if (p.status === 'Dispensed') statusColor = "text-emerald-600 font-medium";

      return `
        <div style="border: 1px solid var(--border-color); border-radius: 6px; padding: 10px; background-color: white; font-size: 0.72rem; display:flex; flex-direction:column; gap:4px;">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <span class="admin-mono font-bold" style="font-size:0.7rem;">${p.rxNo}</span>
            <span class="badge ${badgeClass}" style="font-size:8px; padding:1px 4px;">${p.schedule}</span>
          </div>
          <div>
            <div style="font-weight:600; color:var(--text-primary);">${p.name} (${p.uhid})</div>
            <div style="color:var(--text-secondary); font-size:0.68rem;">Source: ${p.source} · Doctor: ${p.doctor}</div>
          </div>
          <div style="border-top:1px dashed var(--border-color); padding-top:4px; margin-top:2px; display:flex; justify-content:space-between; align-items:center;">
            <span>Items: <strong>${p.itemsCount}</strong> · <span class="${statusColor}">${p.status}</span></span>
            <div style="display:flex; gap:2px;">
              ${p.status === 'Pending' ? `<button class="btn btn-primary text-[9px]" onclick="window.openDispenseWizard('${p.rxNo}')" style="padding:2px 4px; background-color:#2563EB;">Dispense</button>` : ''}
              <button class="btn btn-secondary text-[9px]" onclick="window.mockViewRx('${p.rxNo}')" style="padding:2px 4px; border:none; background:transparent;">👁️ View</button>
            </div>
          </div>
        </div>
      `;
    }).join('');
  };

  window.filterRxQueue = function(type) {
    const buttons = ['all', 'pending', 'narc'];
    buttons.forEach(b => {
      const el = document.getElementById('rx-filter-' + b);
      if (el) {
        el.classList.remove('btn-primary');
        el.classList.add('btn-secondary');
      }
    });

    const activeEl = document.getElementById('rx-filter-' + (type === 'all' ? 'all' : type === 'Pending' ? 'pending' : 'narc'));
    if (activeEl) {
      activeEl.classList.remove('btn-secondary');
      activeEl.classList.add('btn-primary');
    }

    window.renderPharmacyPrescriptions(type);
  };

  // DISPENSING WIZARD (Prescription flow)
  window.openDispenseWizard = function(rxNo) {
    const rx = window.state.prescriptionsQueue.find(p => p.rxNo === rxNo);
    if (!rx) return;

    window.activeRxNo = rxNo;
    const content = document.getElementById('dispense-wizard-content');
    
    // Step 1: CDSCO Schedule compliance check & drug info
    content.innerHTML = `
      <div style="background-color: #EFF6FF; border: 1px solid #BFDBFE; border-radius: 6px; padding: 12px; margin-bottom: 16px;">
        <h4 style="font-weight:bold; color:#1E40AF; margin-bottom:4px;">Prescription Verification & CDSCO Compliance</h4>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
          <div>
            • Prescriber: <strong>${rx.doctor} (Reg-8821)</strong><br>
            • Patient UHID: <span class="admin-mono font-semibold">${rx.uhid}</span><br>
            • Source location: ${rx.source}
          </div>
          <div>
            • Prescribed date: 27-Jun-2026<br>
            • Schedule verification: <span style="background-color:#FDE68A; color:#92400E; font-weight:bold; padding:1px 3px; border-radius:2px;">${rx.schedule} Verified</span>
          </div>
        </div>
      </div>

      ${(rx.items && rx.items.some(it => it.drug.toLowerCase().includes("insulin"))) || rxNo.includes("0404") || rxNo.includes("0401") ? `
        <div style="border: 1px solid var(--border-color); border-radius: 6px; padding: 12px; margin-bottom: 16px; background-color: #FFFBEB;" id="lasa-warning-wizard">
          <strong>⚠️ LASA DRUG WARNING (Look-Alike Sound-Alike):</strong><br>
          Insulin Glargine ≈ Insulin Aspart. Verify prescription carefully.
        </div>
      ` : ''}

      <table style="width:100%; border-collapse:collapse; font-size:0.7rem; margin-bottom:12px;">
        <thead>
          <tr style="border-bottom: 1px solid var(--border-color); background-color: #F8FAFC; text-align:left;">
            <th style="padding:6px;">Drug Name</th>
            <th style="padding:6px;">Dose/Route</th>
            <th style="padding:6px;">Frequency</th>
            <th style="padding:6px;">Batch (FEFO Suggest)</th>
            <th style="padding:6px;">Expiry</th>
            <th style="padding:6px; text-align:right;">Dispense Qty</th>
          </tr>
        </thead>
        <tbody>
          ${(rx.items && rx.items.length > 0) ? rx.items.map(it => `
            <tr style="border-bottom: 1px solid var(--border-color);">
              <td style="padding:6px; font-weight:bold;">${it.drug}</td>
              <td style="padding:6px;">${it.dose}</td>
              <td style="padding:6px;">${it.freq}</td>
              <td style="padding:6px;" class="admin-mono">${it.batch}</td>
              <td style="padding:6px;" class="admin-mono">${it.expiry}</td>
              <td style="padding:6px; text-align:right;" class="admin-mono">${it.qty}</td>
            </tr>
          `).join('') : `
            <tr style="border-bottom: 1px solid var(--border-color);">
              <td style="padding:6px; font-weight:bold;">Insulin Glargine 100 IU/mL</td>
              <td style="padding:6px;">10 units SC</td>
              <td style="padding:6px;">Once daily</td>
              <td style="padding:6px;" class="admin-mono">B-PH-202606-102</td>
              <td style="padding:6px;" class="admin-mono">31-Jul-2026</td>
              <td style="padding:6px; text-align:right;" class="admin-mono">1 pen</td>
            </tr>
            <tr style="border-bottom: 1px solid var(--border-color);">
              <td style="padding:6px; font-weight:bold;">Metformin 500mg (Glyciphage)</td>
              <td style="padding:6px;">500mg Oral</td>
              <td style="padding:6px;">Twice daily</td>
              <td style="padding:6px;" class="admin-mono">B-PH-202604-091</td>
              <td style="padding:6px;" class="admin-mono">30-Nov-2027</td>
              <td style="padding:6px; text-align:right;" class="admin-mono">20 tabs</td>
            </tr>
          `}
        </tbody>
      </table>

      <div style="background:#fef3c7; color:#d97706; padding:8px 12px; border-radius:6px; border:1px solid #fde68a; line-height:1.4; margin-top:12px; font-size:0.75rem;">
        <strong>⚠ Tab Metformin 500mg out of stock at pharmacy.</strong><br>
        Main store has: 450 strips. &middot; <a href="javascript:void(0)" onclick="window.closeDispenseWizard(); window.showStockRequestOverlay({dept:'Pharmacy', urgency:'Urgent', prefillItem:{name:'Tab Metformin 500mg', qty:30}, prescriptionRef:'${rx.rxNo}', patientUhid:'${rx.uhid}'})" style="color:#2563eb; font-weight:700; text-decoration:underline;">[Request from Store]</a>
      </div>

      <div style="border-top:1px dashed var(--border-color); padding-top:12px; margin-top:12px;">
        <label style="display:flex; align-items:center; gap:6px; font-weight:bold; color:#1E40AF;">
          <input type="checkbox" id="chk-double-check" checked> 🤝 High-Alert drug double check verified by second pharmacist
        </label>
        <div style="font-size:0.62rem; color:var(--text-muted); margin-top:2px; margin-left:18px;">
          Mandatory log: Verified by duty pharmacist R. K. Joshi (EMP-921).
        </div>
      </div>
    `;

    document.getElementById('dispense-wizard-overlay').style.display = 'flex';
  };

  window.closeDispenseWizard = function() {
    document.getElementById('dispense-wizard-overlay').style.display = 'none';
  };

  window.submitDispenseWizard = function() {
    const rxNo = window.activeRxNo;
    const rx = window.state.prescriptionsQueue.find(p => p.rxNo === rxNo);
    if (!rx) return;

    // Check if double-check is ticked for high-alert drugs
    const chk = document.getElementById('chk-double-check');
    if (rx.schedule.includes('High') && (!chk || !chk.checked)) {
      alert("ERROR: High-Alert drugs require double check confirmation signature to dispense.");
      return;
    }

    rx.status = "Dispensed";

    // ── CROSS-MODULE SYNC: push pharmacy charge to Billing ledger ────────────
    if (window.state && window.state.billing) {
      const existingBill = window.state.billing.find(b => b.uhid === rx.uhid);
      const drugCharge = rx.itemsCount ? rx.itemsCount * 250 : 500; // approx per item
      const chargeItem = {
        desc: `Pharmacy Dispensing — ${rx.rxNo} (${rx.itemsCount || 1} item${(rx.itemsCount || 1) > 1 ? 's' : ''})`,
        qty: 1, rate: drugCharge, total: drugCharge
      };
      if (existingBill) {
        existingBill.items = existingBill.items || [];
        existingBill.items.push(chargeItem);
        existingBill.amount = (existingBill.amount || 0) + drugCharge;
        existingBill.status = existingBill.status === 'Paid' ? 'Paid' : 'Pending';
      } else {
        window.state.billing.push({
          id: 'INV-PH-' + rx.rxNo,
          uhid: rx.uhid,
          patientName: rx.name,
          amount: drugCharge,
          paid: 0,
          status: 'Pending',
          date: window._HIS_DATE ? window._HIS_DATE(0) : new Date().toISOString().slice(0, 10),
          items: [chargeItem]
        });
      }
    }
    // ── also update patient timeline if EMR is loaded ───────────────────────
    if (window.state && window.state.patients) {
      const pat = window.state.patients.find(p => p.uhid === rx.uhid);
      if (pat) {
        pat.timelineEvents = pat.timelineEvents || [];
        pat.timelineEvents.unshift({
          date: window._HIS_PRETTY ? window._HIS_PRETTY(0, new Date().toLocaleTimeString('en-IN', {hour:'2-digit', minute:'2-digit'})) : new Date().toISOString(),
          type: 'pharmacy',
          icon: '💊',
          title: 'Prescription Dispensed',
          desc: `${rx.itemsCount || 1} item(s) dispensed by Pharmacy (${rx.rxNo}). Charges posted to billing.`
        });
      }
    }

    window.renderPharmacyPrescriptions();
    window.closeDispenseWizard();
    window.renderPharmacyKpis();
    alert(`Success!\nPrescription ${rxNo} dispensed.\nAuto-posted charges to IPD billing ledger.\nLabel stickers printed.`);

  };

  // RENDER: Column 2 - Dispensing Worklist / Indents / IV TPN
  window.currentWorkTab = 'ipd';
  window.renderPharmacyWorkdesk = function() {
    const container = document.getElementById('dispensing-worklist-container');
    if (!container) return;

    if (window.currentWorkTab === 'ipd') {
      const wardsData = [
        {
          name: "ICU (Intensive Care Unit)",
          count: 2,
          patients: [
            { name: "Ramesh Kumar", uhid: "MH-2026-4802", bed: "ICU-BED-02", pendingRx: 1, ageSex: "45 Y / Male", diagnosis: "Post-op CABG" },
            { name: "Sunita Devi", uhid: "MH-2026-1120", bed: "ICU-BED-05", pendingRx: 1, ageSex: "52 Y / Female", diagnosis: "DKA Protocol" }
          ]
        },
        {
          name: "General Ward - Male",
          count: 2,
          patients: [
            { name: "Ramesh Chandra", uhid: "MH-2026-9081", bed: "GW-M-15", pendingRx: 0, ageSex: "62 Y / Male", diagnosis: "Chronic Kidney Disease" },
            { name: "Gopal Banerjee", uhid: "MH-2026-3092", bed: "GW-M-12", pendingRx: 1, ageSex: "55 Y / Male", diagnosis: "Severe Pneumonia" }
          ]
        },
        {
          name: "General Ward - Female",
          count: 1,
          patients: [
            { name: "Priya Devi", uhid: "MH-2026-2901", bed: "GW-F-04", pendingRx: 0, ageSex: "35 Y / Female", diagnosis: "Antepartum Care" }
          ]
        },
        {
          name: "NICU (Neonatal ICU)",
          count: 1,
          patients: [
            { name: "Baby of Pinky", uhid: "MH-2026-0812", bed: "NICU-BED-04", pendingRx: 1, ageSex: "3 Days / Male", diagnosis: "Respiratory Distress" }
          ]
        }
      ];

      let html = `
        <div style="font-size: 0.65rem; color: var(--text-muted); margin-bottom: 6px;">Patients currently admitted in wards:</div>
        <div style="display:flex; flex-direction:column; gap:6px;">
      `;

      wardsData.forEach((w, idx) => {
        html += `
          <div style="border: 1px solid var(--border-color); border-radius: 4px; background: #F8FAFC; overflow:hidden;">
            <div onclick="document.getElementById('ward-pat-list-${idx}').style.display = document.getElementById('ward-pat-list-${idx}').style.display === 'none' ? 'block' : 'none'" style="cursor:pointer; padding: 6px 10px; font-weight:bold; font-size:0.72rem; color:var(--text-primary); display:flex; justify-content:space-between; align-items:center; background-color:#EFF6FF; border-bottom:1px solid var(--border-color);">
              <span>🏢 ${w.name}</span>
              <span class="badge" style="background:#3B82F6; color:white; font-size:8px;">${w.count} Admitted</span>
            </div>
            <div id="ward-pat-list-${idx}" style="display: block; padding: 6px; background: white;">
        `;

        w.patients.forEach(p => {
          let rxBadge = p.pendingRx > 0 ? `<span class="badge badge-priority-urgent" style="font-size:8px; padding:1px 3px;">${p.pendingRx} Pending Rx</span>` : `<span class="badge badge-priority-routine" style="font-size:8px; padding:1px 3px; background:#E2E8F0; color:#475569;">0 Pending</span>`;
          
          html += `
            <div style="border:1px solid #F1F5F9; border-radius:4px; padding:6px; margin-bottom:4px; background:#FAFAFA; display:flex; flex-direction:column; gap:2px; font-size:0.68rem;">
              <div style="display:flex; justify-content:space-between; align-items:center; font-weight:600;">
                <span style="color:#1E3A8A;">${p.name} (${p.bed})</span>
                ${rxBadge}
              </div>
              <div style="color:var(--text-secondary); font-size:0.62rem;">UHID: <span class="admin-mono font-semibold">${p.uhid}</span> · ${p.ageSex} · ${p.diagnosis}</div>
          `;

          if (p.pendingRx > 0) {
            html += `
              <div style="display:flex; justify-content:flex-end; gap:4px; margin-top:4px;">
                <button class="btn btn-primary text-[9px]" onclick="window.openDispenseWizard('RX-20260627-0401')" style="padding:1px 4px; background-color:#2563EB;">Dispense Rx</button>
              </div>
            `;
          }

          html += `</div>`;
        });

        html += `
            </div>
          </div>
        `;
      });

      html += `
        </div>
      `;
      container.innerHTML = html;
    } else if (window.currentWorkTab === 'indents') {
      container.innerHTML = window.state.wardIndents.map(i => `
        <div style="border: 1px solid var(--border-color); border-radius: 6px; padding: 10px; background-color: white; font-size: 0.72rem; display:flex; flex-direction:column; gap:4px;">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <span class="admin-mono font-bold" style="font-size:0.7rem;">${i.indentNo}</span>
            <span class="badge" style="font-size:8px; padding:1px 4px;">${i.status}</span>
          </div>
          <div>
            <div style="font-weight:600; color:var(--text-primary);">Ward: ${i.ward}</div>
            <div style="color:var(--text-secondary); font-size:0.68rem;">Raised by: ${i.raisedBy} · Time: ${i.time}</div>
          </div>
          <div style="border-top:1px dashed var(--border-color); padding-top:4px; margin-top:2px; display:flex; justify-content:space-between; align-items:center;">
            <span>Items: <strong>${i.itemsCount}</strong></span>
            <button class="btn btn-primary text-[9px]" onclick="window.fillWardIndent('${i.indentNo}')" style="padding:2px 6px; background-color:#2563EB;">Fill Indent</button>
          </div>
        </div>
      `).join('');
    } else if (window.currentWorkTab === 'iv') {
      // IV / TPN prep
      container.innerHTML = window.state.ivAdmixtures.map(iv => `
        <div style="border: 1px solid var(--border-color); border-radius: 6px; padding: 10px; background-color: white; font-size: 0.72rem; display:flex; flex-direction:column; gap:4px;">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <span class="admin-mono font-bold" style="font-size:0.7rem;">TPN-${iv.id}</span>
            <span class="badge" style="background-color:#E0F2FE; color:#0369A1; font-size:8px; padding:1px 4px;">${iv.status}</span>
          </div>
          <div>
            <div style="font-weight:600; color:var(--text-primary);">${iv.patient} (${iv.uhid})</div>
            <div style="color:var(--text-secondary); font-size:0.68rem;">Type: <strong>${iv.type}</strong> · Bed: ${iv.ward}</div>
          </div>
          <div style="border-top:1px dashed var(--border-color); padding-top:4px; margin-top:2px; display:flex; justify-content:space-between; align-items:center;">
            <span>By: ${iv.pharmacist}</span>
            <button class="btn btn-secondary text-[9px]" onclick="window.completeIvAdmixture(${iv.id})" style="padding:2px 6px; border-color:#059669; color:#059669;">Complete & Label</button>
          </div>
        </div>
      `).join('');
    } else {
      // OPD counter queue
      const opdQueue = [
        { billNo: "OPD-20260627-901", patient: "Walk-in Patient", items: 4, amt: 450.00, status: "Awaiting Payment" },
        { billNo: "OPD-20260627-902", patient: "Ramesh Verma", items: 2, amt: 1200.00, status: "Paid" }
      ];
      
      let html = '';
      opdQueue.forEach(o => {
        let badgeColor = o.status === 'Paid' ? '#E1F5FE' : '#FFF9C4';
        let badgeTextColor = o.status === 'Paid' ? '#01579B' : '#F57F17';
        
        html += `
          <div style="border: 1px solid var(--border-color); border-radius: 6px; padding: 10px; background-color: white; font-size: 0.72rem; display:flex; flex-direction:column; gap:4px;">
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <span class="admin-mono font-bold" style="font-size:0.7rem;">${o.billNo}</span>
              <span class="badge" style="background-color:${badgeColor}; color:${badgeTextColor}; font-size:8px; padding:1px 4px;">${o.status}</span>
            </div>
            <div>
              <div style="font-weight:600; color:var(--text-primary);">${o.patient}</div>
              <div style="color:var(--text-secondary); font-size:0.68rem;">Items: <strong>${o.items}</strong> · Amount: <span class="admin-mono">₹${o.amt.toFixed(2)}</span></div>
            </div>
            <div style="border-top:1px dashed var(--border-color); padding-top:4px; margin-top:2px; display:flex; justify-content:flex-end;">
        `;
        
        if (o.status === 'Awaiting Payment') {
          html += `
            <button class="btn btn-primary text-[9px]" onclick="window.mockCollectOPDPayment()" style="padding:2px 6px; background-color:#2563EB;">Collect Payment</button>
          `;
        } else {
          html += `
            <button class="btn btn-secondary text-[9px]" onclick="alert('Sticker label & Receipt invoice printed.')" style="padding:2px 6px;">Print Sticker</button>
          `;
        }
        
        html += `
            </div>
          </div>
        `;
      });
      container.innerHTML = html;
    }
  };

  window.filterWorkdeskTab = function(tabName) {
    const tabs = ['ipd', 'ind', 'iv', 'opd'];
    tabs.forEach(t => {
      const el = document.getElementById('work-filter-' + t);
      if (el) {
        el.classList.remove('btn-primary');
        el.classList.add('btn-secondary');
      }
    });

    const activeEl = document.getElementById('work-filter-' + tabName);
    if (activeEl) {
      activeEl.classList.remove('btn-secondary');
      activeEl.classList.add('btn-primary');
    }

    window.currentWorkTab = tabName;
    window.renderPharmacyWorkdesk();
  };

  window.fillWardIndent = function(indentNo) {
    alert(`Fill Indent picking sheet printed. Stock auto-deducted for 12 items.\nDispatched to ward messenger.`);
    window.state.wardIndents = window.state.wardIndents.filter(i => i.indentNo !== indentNo);
    window.renderPharmacyWorkdesk();
    window.renderPharmacyKpis();
  };

  window.completeIvAdmixture = function(id) {
    alert(`TPN Neonatal Admixture checklist double-signed. Concentration rates verified.\nSticker label printed for incubator attachment.`);
    window.state.ivAdmixtures = window.state.ivAdmixtures.filter(iv => iv.id !== id);
    window.renderPharmacyWorkdesk();
  };

  // RENDER: Column 3 - Stock Management & registers
  window.currentStockTab = 'register';
  window.renderPharmacyStock = function() {
    const container = document.getElementById('stock-management-container');
    if (!container) return;

    if (window.currentStockTab === 'register') {
      // render stock list
      const stock = [
        { name: "Pantocid 40mg (Pantoprazole)", batch: "B-PH-202602-019", qty: 220, exp: "30-Sep-2027", category: "Tablet" },
        { name: "Saronil-Para 650mg", batch: "B-PH-202602-092", qty: 480, exp: "31-Jul-2028", category: "Tablet" },
        { name: "Fentanyl 50mcg Injection", batch: "B-PH-202601-081", qty: 18, exp: "30-Apr-2027", category: "Injection" },
        { name: "Insulin Glargine 100 IU", batch: "B-PH-202606-102", qty: 4, exp: "31-Jul-2026", category: "Cold Chain 🧊" }
      ];

      container.innerHTML = stock.map(s => `
        <div style="border: 1px solid var(--border-color); border-radius: 4px; padding: 6px 10px; background-color: white; font-size: 0.7rem; display:flex; flex-direction:column; gap:2px;">
          <div style="display:flex; justify-content:space-between; font-weight:bold;">
            <span>${s.name}</span>
            <span style="color:#546E7A; font-size:8px;">${s.category}</span>
          </div>
          <div style="display:flex; justify-content:space-between; color:var(--text-secondary); font-size:0.65rem;">
            <span>Batch: <span class="admin-mono font-semibold">${s.batch}</span></span>
            <span class="admin-mono font-bold text-emerald-600">${s.qty} units</span>
          </div>
          <div style="font-size:8px; color:var(--text-muted);">Expiry: <span class="admin-mono">${s.exp}</span></div>
        </div>
      `).join('');
    } else {
      // NDPS narcotic register reconciliation
      container.innerHTML = `
        <div style="font-size:0.7rem; background:#F8FAFC; padding:8px; border:1px solid var(--border-color); border-radius:4px; display:flex; flex-direction:column; gap:4px; margin-bottom:8px;">
          <strong>NDPS Daily Reconciliation Balance:</strong>
          <div style="display:flex; justify-content:space-between; font-size:0.65rem;">
            <span>Morphine 10mg:</span>
            <span class="admin-mono font-bold">14 ampoules</span>
          </div>
          <div style="display:flex; justify-content:space-between; font-size:0.65rem;">
            <span>Fentanyl 50mcg:</span>
            <span class="admin-mono font-bold">18 ampoules</span>
          </div>
          <div style="border-top:1px dashed var(--border-color); padding-top:4px; margin-top:2px;">
            Physical Variance: <strong style="color:#059669;">0 (Zero Variance)</strong>
          </div>
        </div>
        
        <table style="width:100%; border-collapse:collapse; font-size:0.62rem;">
          <thead>
            <tr style="border-bottom: 1px solid var(--border-color); background-color:#F8FAFC; text-align:left;">
              <th style="padding:4px;">Patient</th>
              <th style="padding:4px;">Drug / Qty</th>
              <th style="padding:4px; text-align:right;">Sign</th>
            </tr>
          </thead>
          <tbody>
            ${window.state.narcoticRegister.map(r => `
              <tr style="border-bottom: 1px solid var(--border-color);">
                <td style="padding:4px;"><strong>${r.patient}</strong><br><span style="font-size:8px; color:var(--text-muted);">${r.uhid}</span></td>
                <td style="padding:4px;">${r.drug}<br><span class="admin-mono font-bold">${r.qty} units</span></td>
                <td style="padding:4px; text-align:right;" class="text-emerald-600 font-bold">${r.signature}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
    }
  };

  window.filterStockTab = function(tabName) {
    const tabs = ['reg', 'narc'];
    tabs.forEach(t => {
      const el = document.getElementById('stock-filter-' + t);
      if (el) {
        el.classList.remove('btn-primary');
        el.classList.add('btn-secondary');
      }
    });

    const activeEl = document.getElementById('stock-filter-' + (tabName === 'register' ? 'reg' : 'narc'));
    if (activeEl) {
      activeEl.classList.remove('btn-secondary');
      activeEl.classList.add('btn-primary');
    }

    window.currentStockTab = tabName;
    window.window.renderPharmacyStock();
  };

  // RENDER: Column 4 - Drug Safety Alerts
  window.renderDrugSafetyAlerts = function() {
    const container = document.getElementById('drug-safety-alerts-container');
    if (!container) return;

    const alerts = [
      { type: 'red', text: 'LASA Drug Pair Warning: metFORMIN 500mg ≈ methoTREXATE 5mg. Verify diagnosis.' },
      { type: 'red', text: 'HIGH-ALERT DRUG: Concentrated KCl dilution requires double check.' },
      { type: 'orange', text: 'Drug-Drug Interaction: Aspirin + Warfarin (Severe risk of hemorrhage).' },
      { type: 'orange', text: 'Patient Allergy: Elena Gilbert (Amoxicillin allergy flagged).' },
      { type: 'amber', text: 'Schedule H1 Log: Azithromycin 500mg dispense requires entry validation.' }
    ];

    container.innerHTML = alerts.map(a => {
      let statusColor = "background-color: #FEF2F2; color: #991B1B; border: 1px solid #FCA5A5; border-left: 3px solid #EF4444;";
      if (a.type === 'orange') statusColor = "background-color: #FFFAF0; color: #C05621; border: 1px solid #FEEBC8; border-left: 3px solid #ED8936;";
      else if (a.type === 'amber') statusColor = "background-color: #FFFBEB; color: #92400E; border: 1px solid #FDE68A; border-left: 3px solid #F59E0B;";

      return `
        <div style="padding: 6px 10px; border-radius: 4px; font-size: 0.68rem; ${statusColor} display:flex; justify-content:space-between; align-items:center;">
          <span>${a.text}</span>
          <button class="btn btn-secondary btn-xs" onclick="window.overrideSafetyAlert('${a.text}')" style="font-size:7px; padding:0 3px;">Override</button>
        </div>
      `;
    }).join('');
  };

  window.overrideSafetyAlert = function(text) {
    const comment = window.prompt(`Override comment required for alert:\n"${text}"\nEnter clinician authorization / pharmacist justification:`);
    if (comment) {
      alert("Safety override logged in Quality Control register.");
    }
  };

  // RENDER: SECTION 6 — Stock Management Tabbed Register (PO, GRN, Suppliers)
  window.switchProcTab = function(tabName) {
    const tabs = document.querySelectorAll('#pharmacy-tabs-bar span');
    tabs.forEach(t => {
      if (t.innerText.includes(tabName) || (tabName === 'PurchaseOrders' && t.innerText.includes('Purchase'))) {
        t.classList.add('active');
      } else {
        t.classList.remove('active');
      }
    });

    const container = document.getElementById('proc-tab-content-container');
    if (!container) return;

    if (tabName === 'PurchaseOrders') {
      container.innerHTML = `
        <table style="width: 100%; border-collapse: collapse; font-size: 0.72rem;">
          <thead>
            <tr style="border-bottom: 1px solid var(--border-color); text-align: left; background-color: #F8FAFC;">
              <th style="padding: 6px;">PO Number</th>
              <th style="padding: 6px;">Supplier</th>
              <th style="padding: 6px;">Items</th>
              <th style="padding: 6px;">PO Date</th>
              <th style="padding: 6px;">Expected</th>
              <th style="padding: 6px;">Total</th>
              <th style="padding: 6px;">Status</th>
            </tr>
          </thead>
          <tbody>
            ${window.state.purchaseOrders.map(p => `
              <tr style="border-bottom: 1px solid var(--border-color);">
                <td style="padding: 6px;" class="admin-mono font-semibold">${p.poNo}</td>
                <td style="padding: 6px;">${p.supplier}</td>
                <td style="padding: 6px;">${p.items}</td>
                <td style="padding: 6px;" class="admin-mono">${p.date}</td>
                <td style="padding: 6px;" class="admin-mono">${p.expected}</td>
                <td style="padding: 6px;" class="admin-mono">₹${p.total.toFixed(2)}</td>
                <td style="padding: 6px;"><span class="text-blue-600 font-semibold">${p.status}</span></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
    } else if (tabName === 'GRN') {
      container.innerHTML = `
        <table style="width: 100%; border-collapse: collapse; font-size: 0.72rem;">
          <thead>
            <tr style="border-bottom: 1px solid var(--border-color); text-align: left; background-color: #F8FAFC;">
              <th style="padding: 6px;">GRN Number</th>
              <th style="padding: 6px;">Supplier</th>
              <th style="padding: 6px;">Invoice No</th>
              <th style="padding: 6px;">Invoice Date</th>
              <th style="padding: 6px;">PO Ref</th>
              <th style="padding: 6px;">Total</th>
              <th style="padding: 6px;">Status</th>
            </tr>
          </thead>
          <tbody>
            ${window.state.grnList.map(g => `
              <tr style="border-bottom: 1px solid var(--border-color);">
                <td style="padding: 6px;" class="admin-mono font-semibold">${g.grnNo}</td>
                <td style="padding: 6px;">${g.supplier}</td>
                <td style="padding: 6px;" class="admin-mono">${g.invoiceNo}</td>
                <td style="padding: 6px;" class="admin-mono">${g.invoiceDate}</td>
                <td style="padding: 6px;" class="admin-mono">${g.poRef}</td>
                <td style="padding: 6px;" class="admin-mono">₹${g.total.toFixed(2)}</td>
                <td style="padding: 6px;" class="text-emerald-600 font-bold">${g.status}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
    } else if (tabName === 'Suppliers') {
      container.innerHTML = `
        <table style="width: 100%; border-collapse: collapse; font-size: 0.72rem;">
          <thead>
            <tr style="border-bottom: 1px solid var(--border-color); text-align: left; background-color: #F8FAFC;">
              <th style="padding: 6px;">Supplier Name</th>
              <th style="padding: 6px;">Type</th>
              <th style="padding: 6px;">GSTIN</th>
              <th style="padding: 6px;">Drug Licence No</th>
              <th style="padding: 6px; text-align: right;">On-time Delivery %</th>
            </tr>
          </thead>
          <tbody>
            <tr style="border-bottom: 1px solid var(--border-color);">
              <td style="padding: 6px; font-weight:bold;">Cipla Ltd Distributors</td>
              <td style="padding: 6px;">Distributor</td>
              <td style="padding: 6px;" class="admin-mono">07AAAAA1111A1Z1</td>
              <td style="padding: 6px;" class="admin-mono">DL-20-40192</td>
              <td style="padding: 6px; text-align: right;" class="admin-mono font-bold text-emerald-600">96.8%</td>
            </tr>
            <tr style="border-bottom: 1px solid var(--border-color);">
              <td style="padding: 6px; font-weight:bold;">Sun Pharma Distributors</td>
              <td style="padding: 6px;">Distributor</td>
              <td style="padding: 6px;" class="admin-mono">07BBBBB2222B2Z2</td>
              <td style="padding: 6px;" class="admin-mono">DL-20-80129</td>
              <td style="padding: 6px; text-align: right;" class="admin-mono font-bold text-emerald-600">94.2%</td>
            </tr>
          </tbody>
        </table>
      `;
    } else {
      // Formulary
      container.innerHTML = `
        <table style="width: 100%; border-collapse: collapse; font-size: 0.72rem;">
          <thead>
            <tr style="border-bottom: 1px solid var(--border-color); text-align: left; background-color: #F8FAFC;">
              <th style="padding: 6px;">Generic Name</th>
              <th style="padding: 6px;">Therapeutic class</th>
              <th style="padding: 6px;">Schedule</th>
              <th style="padding: 6px; text-align: right;">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr style="border-bottom: 1px solid var(--border-color);">
              <td style="padding: 6px; font-weight:bold;">Paracetamol 650mg</td>
              <td style="padding: 6px;">Antipyretic / Analgesic</td>
              <td style="padding: 6px;">OTC</td>
              <td style="padding: 6px; text-align: right;" class="text-emerald-600 font-bold">Active Formulary</td>
            </tr>
            <tr style="border-bottom: 1px solid var(--border-color);">
              <td style="padding: 6px; font-weight:bold;">Pantoprazole 40mg</td>
              <td style="padding: 6px;">Proton Pump Inhibitor</td>
              <td style="padding: 6px;">Schedule H</td>
              <td style="padding: 6px; text-align: right;" class="text-emerald-600 font-bold">Active Formulary</td>
            </tr>
            <tr style="border-bottom: 1px solid var(--border-color);">
              <td style="padding: 6px; font-weight:bold;">Fentanyl 50mcg</td>
              <td style="padding: 6px;">Opioid Analgesic</td>
              <td style="padding: 6px;">Schedule X (NDPS)</td>
              <td style="padding: 6px; text-align: right;" class="text-purple-600 font-bold">Restricted</td>
            </tr>
          </tbody>
        </table>
      `;
    }
  };

  // COUNSELLING REGISTER DIALOG
  window.openCounsellingModal = function() {
    document.getElementById('cns-uhid').value = "MH-2026-4802";
    document.getElementById('counselling-log-modal').style.display = 'flex';
  };

  window.closeCounsellingModal = function() {
    document.getElementById('counselling-log-modal').style.display = 'none';
  };

  window.saveCounsellingLog = function() {
    const uhid = document.getElementById('cns-uhid').value.trim();
    if (!uhid) {
      alert("Patient UHID is required to log medication counselling.");
      return;
    }

    const log = {
      uhid: uhid,
      language: document.getElementById('cns-language').value,
      medicines: "Insulin Glargine, Metformin",
      time: new Date().toLocaleTimeString('en-IN'),
      pharmacist: "R. K. Joshi (Reg-9210)"
    };

    window.state.counsellingLog.push(log);
    window.closeCounsellingModal();
    alert("🗣️ NABH Counselling Checklist successfully saved in patient EMR log register.");
  };

  // SHIFT SIGN-OFF MOCK
  window.signOffPharmacyShift = function() {
    alert("Reconciliation sign-off submitted.\nSchedule X register closed.\nForm IX disposal certificate generated.");
  };

  // MOCK QUICK ACTIONS
  window.mockCreatePO = function() {
    alert("PO Workspace opened. Loading drug formulary indent recommendations...");
  };

  window.mockReceiveGRN = function() {
    alert("GRN entry screen loaded. Match against PO reference number.");
  };

  window.mockDisposalRequest = function() {
    alert("Form IX expired drugs disposal log created. Scheduled for BMW incineration.");
  };

  window.mockFormularyMgt = function() {
    alert("Formulary additions log spooled.");
  };

  window.mockNewOpdBill = function() {
    alert("OPD Retail billing drawer loaded. Scanning barcode...");
  };

  window.mockCollectOPDPayment = function() {
    alert("Opening cash drawer / displaying UPI static QR code...");
  };

  window.mockReturnRefund = function() {
    alert("Original retail bill receipt lookup drawer loaded.");
  };

  window.mockDispenseRx = function() {
    alert("Dispense prescription by selecting from prescription queue.");
  };

  window.mockVerifyRx = function() {
    alert("Verify Prescription: select pending order in prescription queue.");
  };

  window.mockFillIndent = function() {
    alert("Select pending ward indent from Column 2 list to fill.");
  };

  window.mockViewRx = function(rxNo) {
    const item = window.state.prescriptionsQueue.find(p => p.rxNo === rxNo);
    if (item) {
      alert(`Rx Detail: ${rxNo}\nPatient: ${item.name} (${item.uhid})\nSchedule: ${item.schedule}\nItems Count: ${item.itemsCount}`);
    }
  };

  // GLOBAL SEARCH FILTER
  window.filterPharmacyDashboard = function(val) {
    const query = val.toLowerCase().trim();
    
    // filter prescriptions queue
    const rxItems = document.querySelectorAll('#prescriptions-queue-container > div');
    rxItems.forEach(item => {
      const text = item.innerText.toLowerCase();
      item.style.display = text.includes(query) ? '' : 'none';
    });
  };

})();
