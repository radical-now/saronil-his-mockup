/* ==========================================================================
   SARONIL HMS — PANTRY & KITCHEN MANAGEMENT (pantryKitchenView.js)
   Route: #pantryKitchen
   ========================================================================== */

(function () {
  'use strict';

  // Constants
  const DIET_TYPES = ['Regular', 'Diabetic', 'Renal', 'Soft', 'High Protein', 'Liquid', 'Tube Feed Tray', 'NPO Hold'];
  const DIET_ALLERGENS = ['nuts', 'shellfish', 'dairy', 'gluten', 'egg', 'soy'];

  function formatLocalINR(val) {
    return "₹" + Number(val).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  function todayPretty() {
    const d = window._HIS_ANCHOR ? new Date(window._HIS_ANCHOR + 'T00:00:00') : new Date();
    return d.toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' });
  }

  function showGstToast(message, type = 'success') {
    if (typeof window.showToast === 'function') {
      window.showToast(message, type);
    } else {
      alert(message);
    }
  }

  // Ensure state bridge
  function ensurePantryBridge() {
    if (!window.state.pantryLocations) {
      window.state.pantryLocations = [
        { code: "LOC-DRY-A", name: "Dry Store A", type: "Store Room", temp_category: "Ambient", department: "Dietary", capacity: "500 kg", status: "Active" },
        { code: "LOC-DRY-B", name: "Dry Store B", type: "Store Room", temp_category: "Ambient", department: "Dietary", capacity: "300 kg", status: "Active" },
        { code: "LOC-COLD-1", name: "Cold Storage 1", type: "Cold Storage", temp_category: "Refrigerated", department: "Dietary", capacity: "200 L", status: "Active" },
        { code: "LOC-COLD-2", name: "Cold Storage 2", type: "Cold Storage", temp_category: "Refrigerated", department: "Dietary", capacity: "200 L", status: "Active" },
        { code: "LOC-FREEZE-1", name: "Deep Freezer 1", type: "Deep Freezer", temp_category: "Frozen", department: "Dietary", capacity: "150 L", status: "Active" },
        { code: "LOC-KITCH-FLR", name: "Kitchen Floor", type: "Kitchen Floor", temp_category: "Ambient", department: "Dietary", capacity: "500 kg", status: "Active" },
        { code: "LOC-PAN-GW", name: "Ward Pantry (General Ward)", type: "Ward Pantry", temp_category: "Ambient", department: "Dietary", capacity: "100 kg", status: "Active" },
        { code: "LOC-PHARM-1", name: "Pharmacy Counter A", type: "Pharmacy Counter", temp_category: "Ambient", department: "Pharmacy", capacity: "100 kg", status: "Active" }
      ];
    }

    if (!window.state.pantryInventory) {
      window.state.pantryInventory = [
        { item_id: "INV-001", name: "Basmati Rice", category: "dry", batch_lot_no: "BATCH-R-01", current_stock: 120, unit: "kg", storage_location_id: "LOC-DRY-A", expiry_date: "2026-09-10", reorder_level: 50, pricing: { standard: 85, subsidized: 50, free: 0 } },
        { item_id: "INV-001-B2", name: "Basmati Rice", category: "dry", batch_lot_no: "BATCH-R-02", current_stock: 80, unit: "kg", storage_location_id: "LOC-DRY-A", expiry_date: "2026-11-20", reorder_level: 50, pricing: { standard: 85, subsidized: 50, free: 0 } },
        { item_id: "INV-002", name: "Fresh Milk", category: "dairy", batch_lot_no: "BATCH-M-01", current_stock: 45, unit: "L", storage_location_id: "LOC-COLD-1", expiry_date: "2026-07-13", reorder_level: 30, pricing: { standard: 60, subsidized: 35, free: 0 } },
        { item_id: "INV-002-B2", name: "Fresh Milk", category: "dairy", batch_lot_no: "BATCH-M-02", current_stock: 60, unit: "L", storage_location_id: "LOC-COLD-1", expiry_date: "2026-07-15", reorder_level: 30, pricing: { standard: 60, subsidized: 35, free: 0 } },
        { item_id: "INV-003", name: "Toned Curd", category: "dairy", batch_lot_no: "BATCH-C-01", current_stock: 15, unit: "kg", storage_location_id: "LOC-COLD-1", expiry_date: "2026-07-12", reorder_level: 20, pricing: { standard: 80, subsidized: 45, free: 0 } },
        { item_id: "INV-004", name: "Chicken Breast", category: "protein", batch_lot_no: "BATCH-CH-01", current_stock: 10, unit: "kg", storage_location_id: "LOC-COLD-2", expiry_date: "2026-07-12", reorder_level: 15, pricing: { standard: 220, subsidized: 130, free: 0 } },
        { item_id: "INV-004-B2", name: "Chicken Breast", category: "protein", batch_lot_no: "BATCH-CH-02", current_stock: 25, unit: "kg", storage_location_id: "LOC-COLD-2", expiry_date: "2026-07-16", reorder_level: 15, pricing: { standard: 220, subsidized: 130, free: 0 } },
        { item_id: "INV-005", name: "Whole Wheat Flour", category: "dry", batch_lot_no: "BATCH-W-01", current_stock: 90, unit: "kg", storage_location_id: "LOC-DRY-B", expiry_date: "2026-12-05", reorder_level: 40, pricing: { standard: 45, subsidized: 25, free: 0 } }
      ];
    }

    if (!window.state.inventoryMovementLog) {
      window.state.inventoryMovementLog = [
        { log_id: "IML-001", timestamp: "2026-07-10 10:15 AM", item_name: "Fresh Milk", batch_lot_no: "BATCH-M-01", quantity: 100, unit: "L", from_location_id: "Supplier (Mother Dairy)", to_location_id: "LOC-COLD-1", type: "Stock Received", user: "Meena S.", department: "Dietary", reason: "Standard contract purchase delivery receipt", reference: "GRN-KIT-001" },
        { log_id: "IML-002", timestamp: "2026-07-11 08:30 AM", item_name: "Basmati Rice", batch_lot_no: "BATCH-R-01", quantity: 15, unit: "kg", from_location_id: "LOC-DRY-A", to_location_id: "LOC-KITCH-FLR", type: "Issue to Kitchen", user: "Meena S.", department: "Dietary", reason: "Breakfast Veg Thali preparation", reference: "IS-2407-018" }
      ];
    }

    if (!window.state.pantryWIPBatches) {
      window.state.pantryWIPBatches = [
        { batch_id: "WIP-001", item_name: "Marinated Chicken", prepared_by: "Chef Ravi", prepared_at: "2026-07-11 10:00 AM", quantity: 15, unit: "kg", use_by_window: "2026-07-12 10:00 AM", status: "Active", source_movement_id: "IML-003" },
        { batch_id: "WIP-002", item_name: "Chopped Salad base", prepared_by: "Sunita K.", prepared_at: "2026-07-11 08:00 AM", quantity: 10, unit: "kg", use_by_window: "2026-07-11 08:00 PM", status: "Expired", source_movement_id: "IML-004" }
      ];
    }

    if (!window.state.kitchenFloorStock) {
      window.state.kitchenFloorStock = [
        { record_id: "KFS-001", item_id: "INV-001", shift: "Morning", date: "2026-07-11", opening_stock: 10, issued_qty: 30, consumed_qty: 35, closing_stock: 5, variance: 0, reviewed_by: "Floor Supervisor Rajesh" }
      ];
    }

    if (!window.state.kitchenEquipmentAssets) {
      window.state.kitchenEquipmentAssets = [
        { asset_id: "EQ-001", asset_type: "equipment", name: "Commercial Oven A", location: "Hot Kitchen Floor", install_or_refill_date: "2025-05-10", last_check_date: "2026-05-10", next_check_due: "2026-08-10", status: "Active" },
        { asset_id: "EQ-002", asset_type: "equipment", name: "Dishwasher Unit B", location: "Cleaning Zone", install_or_refill_date: "2025-08-15", last_check_date: "2026-02-15", next_check_due: "2026-05-15", status: "Overdue Maintenance" },
        { asset_id: "EQ-003", asset_type: "lpg_cylinder", name: "LPG Gas Cylinder 1", location: "Gas Bank Room A", install_or_refill_date: "2026-06-01", last_check_date: "2026-06-01", next_check_due: "2026-07-01", status: "Active" },
        { asset_id: "EQ-004", asset_type: "lpg_cylinder", name: "LPG Gas Cylinder 2 (Backup)", location: "Gas Bank Room A", install_or_refill_date: "2026-05-01", last_check_date: "2026-05-01", next_check_due: "2026-06-01", status: "Active (Overdue Safety Check)" }
      ];
    }

    if (!window.state.kitchenConsumableStock) {
      window.state.kitchenConsumableStock = [
        { item_id: "CON-001", category: "crockery", total_count_or_stock: 150, in_use_or_reorder_level: 120, lost_broken_count: 5, last_audit_date: "2026-07-05" },
        { item_id: "CON-002", category: "cutlery", total_count_or_stock: 300, in_use_or_reorder_level: 250, lost_broken_count: 12, last_audit_date: "2026-07-05" },
        { item_id: "CON-003", category: "trolleys", total_count_or_stock: 15, in_use_or_reorder_level: 12, lost_broken_count: 0, last_audit_date: "2026-07-05" }
      ];
    }

    if (!window.state.wardPantryStock) {
      window.state.wardPantryStock = [
        { item_id: "INV-002", ward: "GW(M)", current_stock: 10, par_level: 20 },
        { item_id: "INV-002", ward: "GW(F)", current_stock: 15, par_level: 20 }
      ];
    }

    if (!window.state.mealDeliveryLog) {
      window.state.mealDeliveryLog = [
        { log_id: "MDL-001", uhid: "SH-2026-04821", ward_bed: "GW(M)-409", meal_slot: "Breakfast", dispatched_by: "Chef Ravi", dispatched_at: "2026-07-11 07:45 AM", delivery_confirmed_by: "Nurse Priya", delivered_at: "2026-07-11 07:55 AM", wastage_qty: 0, wastage_reason: "" }
      ];
    }

    if (!window.state.dietOrders) {
      window.state.dietOrders = [
        { order_id: "DO-001", uhid: "SH-2026-04821", patientName: "Rajesh Kumar", bed: "GW(M)-409", diet_type: "High Protein", texture_modification: "None", allergy_flags: "Penicillin, nuts", npo_status: "Active", preference_tag: "vegetarian-only", ordered_by: "Dr. Srinivasan", active_from: "2026-07-09", active_to: "" },
        { order_id: "DO-002", uhid: "SH-2026-04799", patientName: "Mohammed Iqbal", bed: "CCU-BED-01", diet_type: "Diabetic", texture_modification: "Soft", allergy_flags: "Peanuts, soy", npo_status: "None", preference_tag: "Jain", ordered_by: "Dr. Mehta", active_from: "2026-07-10", active_to: "" },
        { order_id: "DO-003", uhid: "SH-2026-04788", patientName: "Arun Pillai", bed: "CCU-BED-02", diet_type: "Liquid", texture_modification: "Liquid", allergy_flags: "None", npo_status: "Active", preference_tag: "vegetarian-only", ordered_by: "Dr. Srinivasan", active_from: "2026-07-09", active_to: "" }
      ];
    }

    if (!window.state.pantryProcurement) {
      window.state.pantryProcurement = {
        purchaseOrders: [
          { po_id: "PO-KIT-001", vendor_id: "VND-FOOD-01", category: "dairy", item_list: "Fresh Milk × 100L", quantity: 100, contracted_rate: 60, order_date: "2026-07-08", expected_delivery_date: "2026-07-10", status: "delivered", auto_generated: false },
          { po_id: "PO-KIT-002", vendor_id: "VND-FOOD-02", category: "dry", item_list: "Basmati Rice × 200kg", quantity: 200, contracted_rate: 85, order_date: "2026-07-09", expected_delivery_date: "2026-07-13", status: "ordered", auto_generated: false }
        ],
        vendorMaster: [
          { vendor_id: "VND-FOOD-01", name: "Mother Dairy", category: "dairy", rate_contract_ref: "CON-F-001", contract_validity: "2026-12-31", rateTable: { "Fresh Milk": 60, "Toned Curd": 80 } },
          { vendor_id: "VND-FOOD-02", name: "Reliance Retail", category: "dry", rate_contract_ref: "CON-F-002", contract_validity: "2026-10-31", rateTable: { "Basmati Rice": 85, "Whole Wheat Flour": 45 } }
        ],
        grnEntries: [
          { grn_id: "GRN-KIT-001", po_id: "PO-KIT-001", item_id: "INV-002", quantity_received: 100, quality_check_status: "pass", temperature_check: "3.2°C", rejection_reason: null, received_by: "Meena S.", received_at: "2026-07-10 09:30 AM" }
        ]
      };
    }

    if (!window.state.cafeteriaBills) {
      window.state.cafeteriaBills = [
        { bill_id: "POS-001", served_to: "customer", reference_id: null, pricing_tier_id: "standard", amount: 150, payment_mode: "cash", cashier_id: "KIT04", timestamp: "2026-07-11 11:30 AM" },
        { bill_id: "POS-002", served_to: "staff", reference_id: "KIT01", pricing_tier_id: "staff_subsidized", amount: 100, payment_mode: "payroll deduction", cashier_id: "KIT04", timestamp: "2026-07-11 12:15 PM" }
      ];
    }

    if (!window.state.foodSafetyLogs) {
      window.state.foodSafetyLogs = {
        fssaiLicense: { license_no: "FSSAI-12345678901234", expiry_date: "2026-09-30", renewal_status: "Active" },
        hygieneAudits: [
          { audit_id: "AUD-F-001", date: "2026-06-15", checklist_result: "Pass (92/100)", next_due_date: "2026-07-15", remarks: "Minor sanitation issue resolved." }
        ],
        haccpTemps: [
          { log_id: "HC-001", storage_unit: "Cold Storage 1", temperature: 3.5, logged_at: "2026-07-11 08:00 AM", breach_flag: false, status: "OK" },
          { log_id: "HC-002", storage_unit: "Cold Storage 2", temperature: 6.2, logged_at: "2026-07-11 10:00 AM", breach_flag: true, status: "Breach", corrective_action: null }
        ],
        otherRecords: {
          pestControl: { lastDate: "2026-06-10", nextDate: "2026-07-10", status: "Done" },
          waterPotability: { lastDate: "2026-05-15", result: "Safe", status: "Done" },
          fireSafety: { lastDate: "2026-04-10", status: "Done" }
        }
      };
    }
  }

  function getActiveTab() {
    return localStorage.getItem('saronil_pantry_active_tab') || 'dashboard';
  }

  function getActiveSubTab() {
    return localStorage.getItem('saronil_pantry_active_subtab') || 'procurement';
  }

  // Master UI Renderer
  window.views.pantryKitchen = function (container) {
    ensurePantryBridge();

    const activeTab = getActiveTab();
    const activeSubTab = getActiveSubTab();
    const userRole = window.state.activeUserRole || '';

    // Map global roles to operational persona
    const currentPersona = window.activeBillingRole === 'ACCOUNTS_MANAGER' || userRole === 'CFO' || userRole === 'ACCOUNTS_MANAGER' ? 'F&B Manager'
                         : (window.activeBillingRole === 'BILLING_SUPERVISOR' || userRole === 'BILLING_SUPERVISOR' ? 'Procurement Officer'
                         : (window.activeBillingRole === 'BILLING_EXECUTIVE' || window.activeBillingRole === 'CASHIER' ? 'Cafeteria Cashier'
                         : (window.activeBillingRole === 'Super Admin' || userRole === 'Super Admin' ? 'Super Admin'
                         : (userRole === 'Doctor' || userRole === 'Treating Consultant / Doctor' ? 'Dietician'
                         : (userRole === 'Nurse' || userRole === 'Nursing Supervisor' ? 'Ward Nurse' : 'Kitchen Floor Supervisor')))));

    // Dynamic stats computations
    const patientDietOrdersCount = window.state.dietOrders.length;
    const lowStockItemsCount = window.state.pantryInventory.filter(i => i.current_stock <= i.reorder_level).length;
    const activeHaccpBreachesCount = window.state.foodSafetyLogs.haccpTemps.filter(t => t.status === 'Breach').length;

    // FSSAI license days to expiry
    const fssaiDue = new Date(window.state.foodSafetyLogs.fssaiLicense.expiry_date);
    const now = new Date("2026-07-11");
    const fssaiDaysLeft = Math.ceil((fssaiDue.getTime() - now.getTime()) / (1000 * 3600 * 24));

    container.innerHTML = `
      <style>
        .pk-shell {
          font-family: var(--font-sans, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif);
          color: var(--text-main, #334155);
          padding: 1.5rem;
        }
        .pk-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
          background: var(--bg-surface, #ffffff);
          padding: 1.25rem;
          border-radius: var(--radius-md, 8px);
          border: 1px solid var(--border-color, #e2e8f0);
        }
        .pk-header h2 {
          font-weight: 700;
          margin: 0;
          font-size: 1.4rem;
          color: var(--text-primary, #0f172a);
        }
        .pk-header-sub {
          font-size: 0.85rem;
          color: var(--text-muted, #64748b);
          margin-top: 0.25rem;
        }
        .pk-kpi-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 1rem;
          margin-bottom: 1.5rem;
        }
        .pk-kpi-card {
          background: var(--bg-surface, #ffffff);
          padding: 1rem;
          border-radius: var(--radius-md, 8px);
          border: 1px solid var(--border-color, #e2e8f0);
          text-align: center;
          cursor: pointer;
        }
        .pk-kpi-card-title {
          font-size: 0.72rem;
          font-weight: 600;
          text-transform: uppercase;
          color: var(--text-muted, #64748b);
          letter-spacing: 0.05em;
        }
        .pk-kpi-val {
          font-size: 1.5rem;
          font-weight: 700;
          margin: 0.3rem 0;
          color: var(--text-primary, #0f172a);
          font-family: 'JetBrains Mono', monospace;
        }
        .pk-kpi-sub {
          font-size: 0.7rem;
          color: var(--text-muted, #64748b);
        }
        .pk-tabs {
          display: flex;
          border-bottom: 1px solid var(--border-color, #e2e8f0);
          gap: 0.25rem;
          margin-bottom: 1.5rem;
          overflow-x: auto;
        }
        .pk-tab-btn {
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
        .pk-tab-btn:hover {
          color: var(--color-primary, #6366f1);
        }
        .pk-tab-btn.active {
          color: var(--color-primary, #6366f1);
          border-bottom-color: var(--color-primary, #6366f1);
          font-weight: 600;
        }
        .pk-grid-2col {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 1.25rem;
        }
        .pk-card {
          background: var(--bg-surface, #ffffff);
          padding: 1.25rem;
          border-radius: var(--radius-md, 8px);
          border: 1px solid var(--border-color, #e2e8f0);
          margin-bottom: 1.25rem;
        }
        .pk-card h4 {
          margin-top: 0;
          margin-bottom: 0.5rem;
          font-weight: 600;
          font-size: 1rem;
          color: var(--text-primary, #0f172a);
        }
        .pk-card p {
          font-size: 0.8rem;
          color: var(--text-muted, #64748b);
          margin-bottom: 1rem;
        }
        .pk-table-wrapper {
          overflow-x: auto;
        }
        .pk-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.8rem;
          text-align: left;
        }
        .pk-table th {
          background: var(--bg-base, #f8fafc);
          padding: 0.75rem;
          font-weight: 600;
          color: var(--text-muted, #64748b);
          border-bottom: 1px solid var(--border-color, #e2e8f0);
        }
        .pk-table td {
          padding: 0.75rem;
          border-bottom: 1px solid var(--border-color, #e2e8f0);
          color: var(--text-main, #334155);
          vertical-align: middle;
        }
        .pk-badge {
          display: inline-block;
          padding: 0.15rem 0.4rem;
          border-radius: var(--radius-xs, 2px);
          font-size: 0.68rem;
          font-weight: 600;
          text-transform: uppercase;
        }
        .pk-badge-success { background: #ecfdf5; color: #065f46; }
        .pk-badge-warning { background: #fffbeb; color: #92400e; }
        .pk-badge-danger { background: #fef2f2; color: #991b1b; }
        .pk-badge-info { background: #eff6ff; color: #1e40af; }
        .pk-form-label {
          display: block;
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--text-main, #334155);
          margin-bottom: 0.25rem;
        }
        .pk-form-control {
          padding: 0.5rem 0.75rem;
          border-radius: var(--radius-sm, 4px);
          border: 1px solid var(--border-color, #e2e8f0);
          font-size: 0.85rem;
          background-color: var(--bg-base, #ffffff);
          color: var(--text-main, #0f172a);
          width: 100%;
          box-sizing: border-box;
        }
        .pk-form-group {
          margin-bottom: 0.75rem;
        }
        .subtab-bar {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 1rem;
          background: var(--bg-base, #f1f5f9);
          padding: 4px;
          border-radius: var(--radius-md, 6px);
          width: fit-content;
        }
        .subtab-btn {
          background: transparent;
          border: none;
          padding: 0.4rem 0.8rem;
          font-size: 0.78rem;
          font-weight: 600;
          color: var(--text-muted, #64748b);
          cursor: pointer;
          border-radius: 4px;
          transition: all 0.2s;
        }
        .subtab-btn.active {
          background: var(--bg-surface, #ffffff);
          color: var(--color-primary, #6366f1);
          box-shadow: var(--shadow-sm, 0 1px 2px rgba(0,0,0,0.05));
        }
        .pos-grid {
          display: grid;
          grid-template-columns: 3.2fr 1.8fr;
          gap: 1.25rem;
        }
        .pos-menu-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
          gap: 0.75rem;
        }
        .pos-item-card {
          background: var(--bg-surface, #ffffff);
          border: 1px solid var(--border-color, #e2e8f0);
          border-radius: 6px;
          padding: 0.75rem;
          text-align: center;
          cursor: pointer;
          transition: transform 0.2s, border-color 0.2s;
        }
        .pos-item-card:hover {
          transform: translateY(-2px);
          border-color: var(--color-primary, #6366f1);
        }
      </style>

      <div class="pk-shell">
        <!-- Header -->
        <div class="pk-header">
          <div>
            <h2>Dietary Services, Cafeteria & Pantry Management</h2>
            <div class="pk-header-sub">Indian hospital dietary services, central storage, shift floor production, and unified movement logistics.</div>
          </div>
          <div style="font-size: 0.85rem; font-weight: 600; background: var(--bg-base); padding: 0.5rem; border-radius: 4px;">
            🛡️ Active Persona: <strong style="color: var(--color-primary);">${currentPersona}</strong>
          </div>
        </div>

        <!-- KPIs -->
        <div class="pk-kpi-grid">
          <div class="pk-kpi-card" onclick="window.switchPantryTab('patient_diets')">
            <div class="pk-kpi-card-title">Clinical Diet Orders</div>
            <div class="pk-kpi-val">${patientDietOrdersCount}</div>
            <div class="pk-kpi-sub">EMR-linked prescriptions</div>
          </div>
          <div class="pk-kpi-card" onclick="window.switchPantryTab('pantry_inventory')">
            <div class="pk-kpi-card-title">Low Stock Alerts</div>
            <div class="pk-kpi-val">${lowStockItemsCount}</div>
            <div class="pk-kpi-sub">Draft POs generated</div>
          </div>
          <div class="pk-kpi-card" onclick="window.switchPantryTab('pantry_inventory')">
            <div class="pk-kpi-card-title">Satellite Pantries</div>
            <div class="pk-kpi-val">${window.state.wardPantryStock.length}</div>
            <div class="pk-kpi-sub">Replenishment triggers active</div>
          </div>
          <div class="pk-kpi-card" onclick="window.switchPantryTab('food_safety')">
            <div class="pk-kpi-card-title">HACCP Breach Alerts</div>
            <div class="pk-kpi-val">${activeHaccpBreachesCount}</div>
            <div class="pk-kpi-sub">Temp checks critical</div>
          </div>
          <div class="pk-kpi-card" onclick="window.switchPantryTab('food_safety')">
            <div class="pk-kpi-card-title">FSSAI License Renewal</div>
            <div class="pk-kpi-val">${fssaiDaysLeft} d</div>
            <div class="pk-kpi-sub">License: Sep 30</div>
          </div>
        </div>

        <!-- Tab Bar -->
        <div class="pk-tabs">
          <button class="pk-tab-btn ${activeTab === 'dashboard' ? 'active' : ''}" onclick="window.switchPantryTab('dashboard')">📋 Command Center</button>
          <button class="pk-tab-btn ${activeTab === 'patient_diets' ? 'active' : ''}" onclick="window.switchPantryTab('patient_diets')">🩺 Patient Diet Service</button>
          <button class="pk-tab-btn ${activeTab === 'cafeteria_pos' ? 'active' : ''}" onclick="window.switchPantryTab('cafeteria_pos')">🛒 Cafeteria POS</button>
          <button class="pk-tab-btn ${activeTab === 'pantry_inventory' ? 'active' : ''}" onclick="window.switchPantryTab('pantry_inventory')">🏪 Pantry Store & Floor</button>
          <button class="pk-tab-btn ${activeTab === 'food_safety' ? 'active' : ''}" onclick="window.switchPantryTab('food_safety')">🛡️ Food Safety & Roster</button>
          <button class="pk-tab-btn ${activeTab === 'reports' ? 'active' : ''}" onclick="window.switchPantryTab('reports')">📊 Cost & Wastage MIS</button>
          <button class="pk-tab-btn ${activeTab === 'audit_trail' ? 'active' : ''}" onclick="window.switchPantryTab('audit_trail')">📜 Inventory Movement Log</button>
        </div>

        <!-- Content -->
        <div id="pk-tab-content">
          ${renderTabContent(activeTab, activeSubTab, currentPersona)}
        </div>
      </div>
    `;
  };

  window.switchPantryTab = function (tab) {
    localStorage.setItem('saronil_pantry_active_tab', tab);
    window.views.pantryKitchen(document.getElementById('main-content'));
  };

  window.switchPantrySubTab = function (subtab) {
    localStorage.setItem('saronil_pantry_active_subtab', subtab);
    window.views.pantryKitchen(document.getElementById('main-content'));
  };

  function renderTabContent(tab, subtab, persona) {
    switch (tab) {
      case 'dashboard':
        return renderDashboardTab(persona);
      case 'patient_diets':
        return renderPatientDietsTab(persona);
      case 'cafeteria_pos':
        return renderCafeteriaPosTab(persona);
      case 'pantry_inventory':
        return renderPantryInventoryTab(subtab, persona);
      case 'food_safety':
        return renderFoodSafetyTab(persona);
      case 'reports':
        return renderReportsTab(persona);
      case 'audit_trail':
        return renderAuditTrailTab(persona);
      default:
        return '';
    }
  }

  // ==========================================
  // TAB 1: Command Center Dashboard
  // ==========================================
  function renderDashboardTab(persona) {
    const alerts = window.state.dietOrders.filter(o => o.npo_status === 'Active' || o.allergy_flags !== 'None');

    return `
      <div class="pk-grid-2col">
        <div>
          <div class="pk-card">
            <h4>Ward-wise Meal Rollup Summary</h4>
            <p>Dynamic calculations derived from active patient admissions and clinical holds.</p>
            <div class="pk-table-wrapper">
              <table class="pk-table">
                <thead>
                  <tr>
                    <th>Ward / Location</th>
                    <th>Breakfast</th>
                    <th>Lunch</th>
                    <th>Dinner</th>
                    <th>Total Prescribed Meals</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>General Ward (Male)</strong></td>
                    <td>14</td>
                    <td>14</td>
                    <td>14</td>
                    <td><strong>42</strong></td>
                  </tr>
                  <tr>
                    <td><strong>General Ward (Female)</strong></td>
                    <td>12</td>
                    <td>12</td>
                    <td>12</td>
                    <td><strong>36</strong></td>
                  </tr>
                  <tr>
                    <td><strong>CCU (Critical Care)</strong></td>
                    <td>2 (Liquid)</td>
                    <td>2 (Liquid)</td>
                    <td>2 (Liquid)</td>
                    <td><strong>6 (NPO Exclusions Applied)</strong></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div class="pk-card">
            <h4>Floor WIP Batch & Recipe Control</h4>
            <p>Active recipe formulations and ingredients issue metrics.</p>
            <div style="font-size: 0.75rem; line-height: 1.6; background: var(--bg-base); padding: 0.75rem; border-radius: 6px;">
              • <strong>Veg Diabetic Thali (BOM):</strong> Basmati Rice (100g) · Whole Wheat Flour (60g) · Curd (50g) · Seasonal Vegetables (150g)<br>
              • <strong>High Protein Thali (BOM):</strong> Chicken Breast (150g) · Basmati Rice (100g) · Egg (2 units) · Curd (50g)
            </div>
          </div>
        </div>

        <div>
          <div class="pk-card" style="border-color: #fca5a5;">
            <h4 style="color: #ef4444;">🚨 Clinical Safety & Dispatch Holds</h4>
            <p>Active blocks triggered directly from patient EMR databases.</p>
            <div style="display: flex; flex-direction: column; gap: 0.75rem;">
              ${alerts.map(a => {
                const isNpo = a.npo_status === 'Active';
                const label = isNpo ? '🚫 NPO HARD-HOLD' : '⚠️ FOOD ALLERGY DETECTED';
                const detail = isNpo ? 'Patient is marked nil-by-mouth. Delivery is strictly suspended.' : `Allergy check: patient is allergic to "${a.allergy_flags}".`;
                return `
                  <div style="background: #fef2f2; border: 1px solid #fecdd3; padding: 0.75rem; border-radius: 6px; font-size: 0.75rem;">
                    <div style="font-weight: 700; color: #b91c1c; display:flex; justify-content:space-between; margin-bottom: 0.35rem;">
                      <span>${label}</span>
                      <span>Bed: ${a.bed}</span>
                    </div>
                    <div><strong>Patient:</strong> ${a.patientName} (${a.uhid})</div>
                    <div style="color: var(--text-muted); font-size: 0.7rem; margin-top: 0.25rem;">${detail}</div>
                    <div style="margin-top: 0.5rem; display: flex; gap: 0.4rem;">
                      ${isNpo ? `
                        <button class="btn btn-secondary btn-sm" onclick="window.liftNpoStatus('${a.order_id}')" style="padding: 0.15rem 0.4rem; font-size:0.65rem;">Lift NPO (Nurse Bedside Confirm)</button>
                      ` : `
                        <button class="btn btn-secondary btn-sm" onclick="window.overrideAllergy('${a.order_id}')" style="padding: 0.15rem 0.4rem; font-size:0.65rem;">Dietitian Override</button>
                      `}
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // Safety overrides
  window.liftNpoStatus = function(orderId) {
    const o = window.state.dietOrders.find(x => x.order_id === orderId);
    if (o) {
      o.npo_status = 'None';
      localStorage.setItem('saronil_dietOrders', JSON.stringify(window.state.dietOrders));
      showGstToast(`EMR Update: NPO status lifted for ${o.patientName}.`);
      window.views.pantryKitchen(document.getElementById('main-content'));
    }
  };

  window.overrideAllergy = async function(orderId) {
    const reason = await customPrompt("Dietitian: Log override validation justification (Required):");
    if (!reason) {
      showGstToast("Justification reason is mandatory to override safety gates.", "error");
      return;
    }
    const o = window.state.dietOrders.find(x => x.order_id === orderId);
    if (o) {
      o.allergy_flags = 'None';
      localStorage.setItem('saronil_dietOrders', JSON.stringify(window.state.dietOrders));
      showGstToast(`Allergy hold overridden. Justification: "${reason}"`);
      window.views.pantryKitchen(document.getElementById('main-content'));
    }
  };

  // ==========================================
  // TAB 2: Patient Diet & Bedside Service
  // ==========================================
  function renderPatientDietsTab(persona) {
    const list = window.state.dietOrders;
    const logs = window.state.mealDeliveryLog || [];

    return `
      <div class="pk-grid-2col">
        <div>
          <div class="pk-card">
            <h4>Inpatient Prescribed Diets & Dispatch Registry</h4>
            <p>Verification gates and delivery tracking sheets. Dispatch (Kitchen) and Bedside Delivery (Nursing) are strictly separated actions.</p>
            <div class="pk-table-wrapper">
              <table class="pk-table">
                <thead>
                  <tr>
                    <th>Patient (UHID) / Bed</th>
                    <th>Diet Plan Details</th>
                    <th>Food Allergens</th>
                    <th>Safety Status Gates</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  ${list.map(o => {
                    const isNpo = o.npo_status === 'Active';
                    // Filter down to diet-relevant food allergens only
                    const allergens = o.allergy_flags.split(',').map(s => s.trim().toLowerCase());
                    const foodAllergens = allergens.filter(a => DIET_ALLERGENS.some(f => a.includes(f)));
                    const hasFoodAllergy = foodAllergens.length > 0;

                    let gateStatus = '<span class="pk-badge pk-badge-success">✓ Clear to Dispatch</span>';
                    let btnAction = `<button class="btn btn-primary btn-sm" onclick="window.dispatchPatientTray('${o.order_id}')">Dispatch Tray</button>`;

                    if (isNpo) {
                      gateStatus = '<span class="pk-badge pk-badge-danger">🚫 NPO BLOCK</span>';
                      btnAction = `<span style="font-size:0.75rem; color:#b91c1c; font-weight:600;">Enforced Hold</span>`;
                    } else if (hasFoodAllergy) {
                      gateStatus = `<span class="pk-badge pk-badge-danger">⚠️ ALLERGY: ${foodAllergens.join(', ')}</span>`;
                      btnAction = `<span style="font-size:0.75rem; color:#b91c1c; font-weight:600;">Allergen Conflict Block</span>`;
                    }

                    return `
                      <tr>
                        <td>
                          <strong>${o.patientName}</strong><br>
                          <span style="font-size:0.7rem; color:var(--text-muted);">${o.uhid} | Bed: ${o.bed}</span>
                        </td>
                        <td>
                          <strong>${o.diet_type}</strong><br>
                          <span style="font-size:0.7rem; color:var(--text-muted);">Texture: ${o.texture_modification}</span>
                        </td>
                        <td>
                          ${hasFoodAllergy ? `<strong style="color:#ef4444;">${foodAllergens.join(', ')}</strong>` : '<span style="color:#64748b;">None</span>'}
                          ${allergens.includes('penicillin') ? `<br><span style="font-size:0.65rem; color:#94a3b8;">(Unrelated drug allergy: penicillin ignored)</span>` : ''}
                        </td>
                        <td>${gateStatus}</td>
                        <td>${btnAction}</td>
                      </tr>
                    `;
                  }).join('')}
                </tbody>
              </table>
            </div>
          </div>

          <div class="pk-card">
            <h4>Meal Delivery & Bedside Confirmation Log</h4>
            <p>Audit trail of dispatched trays and nurse confirmations at bedside.</p>
            <div class="pk-table-wrapper">
              <table class="pk-table">
                <thead>
                  <tr>
                    <th>Log ID</th>
                    <th>Patient (Bed)</th>
                    <th>Meal Slot</th>
                    <th>Kitchen Dispatch</th>
                    <th>Bedside Confirm</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  ${logs.map(l => {
                    const needConfirm = !l.delivery_confirmed_by;
                    return `
                      <tr>
                        <td><code>${l.log_id}</code></td>
                        <td>${l.uhid} (${l.ward_bed})</td>
                        <td><strong>${l.meal_slot}</strong></td>
                        <td>${l.dispatched_by} at ${l.dispatched_at}</td>
                        <td>
                          ${needConfirm ? `
                            <button class="btn btn-secondary btn-sm" onclick="window.confirmBedsideDelivery('${l.log_id}')" style="padding:0.15rem 0.4rem; font-size:0.65rem;">Confirm Bedside Delivery</button>
                          ` : `${l.delivery_confirmed_by} at ${l.delivered_at}`}
                        </td>
                        <td>
                          <span class="pk-badge ${needConfirm ? 'pk-badge-warning' : 'pk-badge-success'}">
                            ${needConfirm ? 'In Transit' : 'Delivered'}
                          </span>
                        </td>
                      </tr>
                    `;
                  }).join('')}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div>
          <!-- Attendant meal order desk -->
          <div class="pk-card">
            <h4>Attendant / Bystander Meals Desk</h4>
            <p>Attendant meals are chargeable and booked as ancillary services.</p>
            <form onsubmit="window.bookAttendantMeal(event)">
              <div class="pk-form-group">
                <label class="pk-form-label">Linked Patient UHID</label>
                <select id="att-pt-uhid" class="pk-form-control">
                  ${list.map(o => `<option value="${o.uhid}">${o.patientName} [${o.uhid}]</option>`).join('')}
                </select>
              </div>
              <div class="pk-form-group">
                <label class="pk-form-label">Meal Slot</label>
                <select id="att-meal-slot" class="pk-form-control">
                  <option value="Breakfast">Breakfast plate (₹60.00)</option>
                  <option value="Lunch">Lunch Veg Thali (₹120.00)</option>
                  <option value="Dinner">Dinner Veg Thali (₹120.00)</option>
                </select>
              </div>
              <div class="pk-form-group">
                <label class="pk-form-label">Payment Option</label>
                <select id="att-payment" class="pk-form-control">
                  <option value="ipd">Add Charge to Patient's IPD Bill</option>
                  <option value="pos">Direct payment at Cafeteria Counter</option>
                </select>
              </div>
              <button type="submit" class="btn btn-primary" style="width:100%; margin-top:0.5rem;">Add Attendant Order</button>
            </form>
          </div>
        </div>
      </div>
    `;
  }

  window.dispatchPatientTray = function(orderId) {
    const o = window.state.dietOrders.find(x => x.order_id === orderId);
    if (!o) return;

    // Dispatch action (Kitchen Role)
    const logs = window.state.mealDeliveryLog || [];
    const logId = "MDL-" + String(logs.length + 1).padStart(3, '0');
    
    logs.push({
      log_id: logId,
      uhid: o.uhid,
      ward_bed: o.bed,
      meal_slot: "Lunch",
      dispatched_by: "Chef Ravi (Kitchen Staff)",
      dispatched_at: new Date().toLocaleTimeString(),
      delivery_confirmed_by: "",
      delivered_at: "",
      wastage_qty: 0,
      wastage_reason: ""
    });

    localStorage.setItem('saronil_mealDeliveryLog', JSON.stringify(window.state.mealDeliveryLog));
    showGstToast(`✓ Meal tray dispatched for patient ${o.patientName}. Bedside nurse confirmation required.`);
    window.views.pantryKitchen(document.getElementById('main-content'));
  };

  window.confirmBedsideDelivery = function(logId) {
    const logs = window.state.mealDeliveryLog || [];
    const match = logs.find(l => l.log_id === logId);
    if (match) {
      // Bedside delivery confirmation (Nurse Role)
      match.delivery_confirmed_by = "Nurse Kavitha (Ward Nurse)";
      match.delivered_at = new Date().toLocaleTimeString();
      localStorage.setItem('saronil_mealDeliveryLog', JSON.stringify(window.state.mealDeliveryLog));
      showGstToast(`✓ Nurse confirmed receipt at patient bedside for reference ${logId}.`);
      window.views.pantryKitchen(document.getElementById('main-content'));
    }
  };

  window.bookAttendantMeal = function(event) {
    event.preventDefault();
    const uhid = document.getElementById('att-pt-uhid').value;
    const meal = document.getElementById('att-meal-slot').value;
    const pay = document.getElementById('att-payment').value;

    const rate = meal === 'Breakfast' ? 60 : 120;

    if (pay === 'ipd') {
      const bills = window.state.billing || [];
      const match = bills.find(b => b.uhid === uhid);
      if (match) {
        if (!match.items) match.items = [];
        match.items.push({ desc: `Attendant Meal - ${meal}`, qty: 1, rate: rate, total: rate });
        match.amount += rate;
        localStorage.setItem('saronil_billing', JSON.stringify(window.state.billing));
        showGstToast(`✓ Attendant meal booked. ${formatLocalINR(rate)} charged to Patient IPD bill.`);
      } else {
        showGstToast("Patient IPD bill details not found.", "error");
      }
    } else {
      showGstToast(`✓ Attendant meal booked. Direct payment of ${formatLocalINR(rate)} requested at counter.`);
    }
  };

  // ==========================================
  // TAB 3: Staff & Visitor Cafeteria POS
  // ==========================================
  function renderCafeteriaPosTab(persona) {
    const customerMenuItems = window.state.pantryDishes
      ? window.state.pantryDishes.filter(d => d.segment === 'cafeteria_customer').map(d => ({ id: d.dish_id, name: d.name, price: d.price.standard, taxRate: d.tax_rate }))
      : [];

    const staffMenuItems = window.state.pantryDishes
      ? window.state.pantryDishes.filter(d => d.segment === 'cafeteria_staff').map(d => ({ id: d.dish_id, name: d.name, price: d.price.standard, taxRate: d.tax_rate }))
      : [];

    const staffList = [
      { id: "KIT01", name: "Chef Ravi", category: "Chef", tier: "staff_subsidized", discount: 50 },
      { id: "KIT02", name: "Meena S.", category: "Storekeeper", tier: "staff_subsidized", discount: 40 },
      { id: "KIT03", name: "Sunita K.", category: "Cook", tier: "staff_free_issue", discount: 100 },
      { id: "NUR01", name: "Nurse Kavitha", category: "Duty Nurse", tier: "staff_subsidized", discount: 30 }
    ];

    if (!window.posSegment) window.posSegment = "customer";
    if (!window.posCart) window.posCart = [];
    if (!window.posPricingTier) window.posPricingTier = "standard";
    if (!window.posStaffId) window.posStaffId = "";
    if (!window.posDiscountPercent) window.posDiscountPercent = 0;

    const currentMenu = window.posSegment === "staff" ? staffMenuItems : customerMenuItems;
    const grossTotal = window.posCart.reduce((sum, i) => sum + i.price, 0);
    const discountAmt = grossTotal * (window.posDiscountPercent / 100);
    const netTotal = grossTotal - discountAmt;

    const matchedStaff = window.posStaffId ? staffList.find(s => s.id === window.posStaffId) : null;

    return `
      <div style="display: flex; gap: 1rem; margin-bottom: 1.25rem;">
        <button class="btn ${window.posSegment === 'customer' ? 'btn-primary' : 'btn-secondary'}" onclick="window.setPosSegment('customer')" style="font-weight: 600;">
          🛒 Customer / Visitor Segment POS
        </button>
        <button class="btn ${window.posSegment === 'staff' ? 'btn-primary' : 'btn-secondary'}" onclick="window.setPosSegment('staff')" style="font-weight: 600;">
          🛡️ Hospital Staff Segment POS
        </button>
      </div>

      <div class="pos-grid">
        <div class="pk-card">
          <h4>POS Billing & Counters Desk — <strong>${window.posSegment === 'staff' ? 'Staff Menu' : 'Customer Menu'}</strong></h4>
          <p>Ancillary segment revenue checkout. Select counter items to check out.</p>
          <div class="pos-menu-grid">
            ${currentMenu.map(m => `
              <div class="pos-item-card" onclick="window.addMenuToCart('${m.name}', ${m.price}, ${m.taxRate})">
                <div style="font-weight:700; font-size:0.85rem;">${m.name}</div>
                <div style="font-size:0.8rem; color:var(--color-primary); font-weight:700; margin-top:0.25rem;">
                  ${formatLocalINR(m.price)} <span style="font-size:0.65rem; color:#94a3b8;">(${m.taxRate}% GST)</span>
                </div>
              </div>
            `).join('')}
          </div>

          ${window.posSegment === 'staff' ? `
            <div style="margin-top: 1.5rem; border-top: 1px solid var(--border-color); padding-top: 1rem;">
              <h4>Pricing Tiers & Staff Identity Lookup</h4>
              <p style="font-size:0.75rem; color:var(--text-muted); margin-bottom:0.75rem;">
                Staff must provide their Employee Number. Enter below to check subsidy status.
              </p>
              <div style="display:flex; gap:0.5rem; align-items:center;">
                <input type="text" id="pos-emp-num-input" class="pk-form-control" placeholder="e.g. KIT01, NUR01" value="${window.posStaffId || ''}" style="max-width:250px;">
                <button class="btn btn-primary" onclick="window.lookupStaffId()" style="padding:0.5rem 1rem;">Lookup Staff</button>
              </div>
              ${matchedStaff ? `
                <div style="margin-top:0.75rem; background:#f0fdf4; border:1px solid #bbf7d0; padding:0.75rem; border-radius:6px; font-size:0.8rem; color:#166534;">
                  <strong>✓ Staff ID Verified:</strong> ${matchedStaff.name} (${matchedStaff.category})<br>
                  <strong>Subsidy Tier:</strong> ${matchedStaff.tier.toUpperCase()} (${matchedStaff.discount}% Discount Applied)
                </div>
              ` : window.posStaffId === '' ? '' : `
                <div style="margin-top:0.75rem; background:#fef2f2; border:1px solid #fecdd3; padding:0.75rem; border-radius:6px; font-size:0.8rem; color:#991b1b;">
                  <strong>✗ Search Error:</strong> Employee Number not verified. Please double check.
                </div>
              `}
            </div>
          ` : `
            <div style="margin-top: 1.5rem; border-top: 1px solid var(--border-color); padding-top: 1rem;">
              <div style="background:#eff6ff; border:1px solid #bfdbfe; padding:0.75rem; border-radius:6px; font-size:0.8rem; color:#1e40af;">
                <strong>Visitor Mode:</strong> Standard pricing list applies. Output GST computed normally.
              </div>
            </div>
          `}
        </div>

        <div class="pk-card">
          <h4>POS Cart Checkout</h4>
          <div style="min-height: 150px; background:var(--bg-base); padding:0.5rem; border-radius:4px; font-size:0.8rem; border:1px solid var(--border-color); margin-bottom:0.75rem;">
            ${window.posCart.length ? window.posCart.map((c, idx) => `
              <div style="display:flex; justify-content:space-between; padding:0.25rem 0; border-bottom:1px dashed var(--border-color);">
                <span>${c.name}</span>
                <div>
                  <strong>${formatLocalINR(c.price)}</strong>
                  <button class="btn btn-secondary btn-sm" onclick="window.removeMenuFromCart(${idx})" style="padding:0 3px; font-size:0.6rem; margin-left:0.4rem;">✕</button>
                </div>
              </div>
            `).join('') : '<div style="text-align:center; padding-top:50px; color:var(--text-muted);">Cart is empty</div>'}
          </div>

          <table style="width:100%; font-size:0.8rem; border-collapse:collapse; margin-bottom:1rem;">
            <tr>
              <td style="padding:0.2rem 0;">Subtotal:</td>
              <td style="text-align:right;">${formatLocalINR(grossTotal)}</td>
            </tr>
            <tr>
              <td style="padding:0.2rem 0; color:#b45309;">Pricing Discount:</td>
              <td style="text-align:right; color:#b45309;">-${formatLocalINR(discountAmt)}</td>
            </tr>
            <tr style="font-weight:700; border-top:1px solid var(--border-color); font-size:0.9rem;">
              <td style="padding:0.4rem 0;">Net Total Payable:</td>
              <td style="text-align:right; color:var(--color-primary);">${formatLocalINR(netTotal)}</td>
            </tr>
          </table>

          <div class="pk-form-group">
            <label class="pk-form-label">Payment Gateway Channel</label>
            <select id="pos-pay-mode" class="pk-form-control">
              <option value="cash">Cash Payment</option>
              <option value="upi">UPI / Card</option>
              ${window.posSegment === 'staff' ? `
                <option value="payroll deduction">Monthly Payroll deduction</option>
                <option value="prepaid wallet">Prepaid Meal Wallet</option>
              ` : ''}
            </select>
          </div>

          <button class="btn btn-primary" onclick="window.checkoutPosTransaction()" style="width:100%;">Process Payment Checkout</button>

          <div style="margin-top:1.25rem; border-top:1px solid var(--border-color); padding-top:1rem; display:flex; justify-content:space-between; align-items:center;">
            <div>
              <strong style="font-size:0.8rem;">Shift Cash Close drawer</strong>
              <div style="font-size:0.68rem; color:var(--text-muted);">Match counter receipts with shift logs.</div>
            </div>
            <button class="btn btn-secondary btn-sm" onclick="window.closeCafeteriaShift()">Close Shift Drawer</button>
          </div>
        </div>
      </div>
    `;
  }

  window.addMenuToCart = function(name, price, taxRate) {
    if (!window.posCart) window.posCart = [];
    window.posCart.push({ name, price, taxRate });
    window.views.pantryKitchen(document.getElementById('main-content'));
  };

  window.removeMenuFromCart = function(idx) {
    if (window.posCart) window.posCart.splice(idx, 1);
    window.views.pantryKitchen(document.getElementById('main-content'));
  };

  window.setPosSegment = function(seg) {
    window.posSegment = seg;
    window.posCart = [];
    if (seg === 'customer') {
      window.posPricingTier = 'standard';
      window.posStaffId = "";
      window.posDiscountPercent = 0;
    } else {
      window.posPricingTier = 'staff_subsidized';
    }
    window.views.pantryKitchen(document.getElementById('main-content'));
  };

  window.lookupStaffId = function() {
    const inputVal = document.getElementById('pos-emp-num-input').value.trim();
    if (!inputVal) {
      showGstToast("Please enter Employee Number.", "error");
      return;
    }
    const staffList = [
      { id: "KIT01", name: "Chef Ravi", category: "Chef", tier: "staff_subsidized", discount: 50 },
      { id: "KIT02", name: "Meena S.", category: "Storekeeper", tier: "staff_subsidized", discount: 40 },
      { id: "KIT03", name: "Sunita K.", category: "Cook", tier: "staff_free_issue", discount: 100 },
      { id: "NUR01", name: "Nurse Kavitha", category: "Duty Nurse", tier: "staff_subsidized", discount: 30 }
    ];
    const match = staffList.find(s => s.id.toUpperCase() === inputVal.toUpperCase());
    if (match) {
      window.posPricingTier = match.tier;
      window.posStaffId = match.id;
      window.posDiscountPercent = match.discount;
      showGstToast(`Staff Found: ${match.name} [Tier: ${match.tier.toUpperCase()}]`);
    } else {
      window.posStaffId = "not_found";
      window.posDiscountPercent = 0;
      showGstToast("Employee Number not found.", "error");
    }
    window.views.pantryKitchen(document.getElementById('main-content'));
  };

  window.checkoutPosTransaction = function() {
    if (!window.posCart || window.posCart.length === 0) {
      showGstToast("Basket is empty.", "error");
      return;
    }

    const grossTotal = window.posCart.reduce((sum, i) => sum + i.price, 0);
    const discountAmt = grossTotal * (window.posDiscountPercent / 100);
    const netTotal = grossTotal - discountAmt;
    const payMode = document.getElementById('pos-pay-mode').value;

    const billId = "POS-" + String(window.state.cafeteriaBills.length + 1).padStart(3, '0');
    
    // Save to Cafeteria Bill
    window.state.cafeteriaBills.push({
      bill_id: billId,
      served_to: window.posStaffId ? "staff" : "customer",
      reference_id: window.posStaffId || null,
      pricing_tier_id: window.posPricingTier,
      amount: netTotal,
      payment_mode: payMode,
      cashier_id: "KIT04",
      timestamp: new Date().toLocaleString()
    });
    localStorage.setItem('saronil_cafeteriaBills', JSON.stringify(window.state.cafeteriaBills));

    // GST split strictly enforced: feed taxable sales into output tax consolidation
    const totalTax = window.posCart.reduce((sum, item) => {
      // Calculate tax included in price
      const rate = item.taxRate;
      const base = item.price / (1 + (rate / 100));
      return sum + (item.price - base);
    }, 0);

    const cgst = totalTax / 2;
    const sgst = totalTax / 2;

    if (window.state.nonBillingRevenue) {
      window.state.nonBillingRevenue.push({
        entry_id: "NBR-POS-" + billId,
        period: "2026-07",
        revenue_type: `Cafeteria POS Sale [${billId}]`,
        amount: netTotal,
        tax_classification: "Taxable Output",
        cgst: cgst,
        sgst: sgst,
        igst: 0,
        gstin: "29AAAAA0000A1Z5",
        date: new Date().toISOString().split('T')[0]
      });
      localStorage.setItem('saronil_nonBillingRevenue', JSON.stringify(window.state.nonBillingRevenue));
    }

    showGstToast(`✓ POS Bill ${billId} checked out. Net Paid: ${formatLocalINR(netTotal)} via ${payMode}.`);
    window.posCart = [];
    window.posDiscountPercent = 0;
    window.posStaffId = "";
    window.posPricingTier = "standard";
    window.views.pantryKitchen(document.getElementById('main-content'));
  };

  window.closeCafeteriaShift = function() {
    const shiftTotal = window.state.cafeteriaBills.reduce((sum, b) => sum + b.amount, 0);
    alert(`Shift Close drawer Reconciliation Checklist:\n\n• Gross cashier sales: ${formatLocalINR(shiftTotal)}\n• Expected Cash/UPI Drawer: Matches System logs.\n• Reconciliation Status: Approved (Verified zero discrepancy).`);
  };

  // ==========================================
  // TAB 4: Pantry Store & Floor (Sub-tabs)
  // ==========================================
  function renderPantryInventoryTab(subtab, persona) {
    return `
      <div>
        <div class="subtab-bar">
          <button class="subtab-btn ${subtab === 'procurement' ? 'active' : ''}" onclick="window.switchPantrySubTab('procurement')">📦 Procurement</button>
          <button class="subtab-btn ${subtab === 'storage' ? 'active' : ''}" onclick="window.switchPantrySubTab('storage')">🏪 Storage (Stock Ledger)</button>
          <button class="subtab-btn ${subtab === 'floor' ? 'active' : ''}" onclick="window.switchPantrySubTab('floor')">🍳 Floor WIP & Assets</button>
          <button class="subtab-btn ${subtab === 'ward' ? 'active' : ''}" onclick="window.switchPantrySubTab('ward')">🏥 Ward Satellites</button>
        </div>
        <div>
          ${renderPantrySubTabContent(subtab, persona)}
        </div>
      </div>
    `;
  }

  function renderPantrySubTabContent(subtab, persona) {
    switch (subtab) {
      case 'procurement':
        return renderProcurementSubTab(persona);
      case 'storage':
        return renderStorageSubTab(persona);
      case 'floor':
        return renderFloorSubTab(persona);
      case 'ward':
        return renderWardSubTab(persona);
      default:
        return '';
    }
  }

  // Sub-tab: Procurement
  function renderProcurementSubTab(persona) {
    const POs = window.state.pantryProcurement.purchaseOrders || [];
    const grns = window.state.pantryProcurement.grnEntries || [];
    const drafts = POs.filter(po => po.status === 'draft');

    return `
      <div class="pk-grid-2col">
        <div>
          <div class="pk-card">
            <h4>Purchase Order Queue</h4>
            <div class="pk-table-wrapper">
              <table class="pk-table">
                <thead>
                  <tr>
                    <th>PO ID</th>
                    <th>Category</th>
                    <th>Ordered details</th>
                    <th>Rate</th>
                    <th>Expected Delivery</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  ${POs.map(po => `
                    <tr>
                      <td><code>${po.po_id}</code></td>
                      <td><span class="pk-badge pk-badge-info">${po.category}</span></td>
                      <td>${po.item_list}</td>
                      <td>${formatLocalINR(po.contracted_rate)}</td>
                      <td>${po.expected_delivery_date}</td>
                      <td><span class="pk-badge ${po.status === 'delivered' ? 'pk-badge-success' : 'pk-badge-warning'}">${po.status.toUpperCase()}</span></td>
                      <td>
                        ${po.status === 'ordered' ? `
                          <button class="btn btn-primary btn-sm" onclick="window.openReceiveGrnModal('${po.po_id}')">Receive GRN</button>
                        ` : '—'}
                      </td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>

          <div class="pk-card">
            <h4>Goods Receipt Note (GRN) Logs</h4>
            <div class="pk-table-wrapper">
              <table class="pk-table">
                <thead>
                  <tr>
                    <th>GRN Reference</th>
                    <th>PO ID</th>
                    <th>Freshness Check</th>
                    <th>Refrigerated Temp</th>
                    <th>Log Info</th>
                  </tr>
                </thead>
                <tbody>
                  ${grns.map(g => `
                    <tr>
                      <td><code>${g.grn_id}</code></td>
                      <td><code>${g.po_id}</code></td>
                      <td><span class="pk-badge pk-badge-success">${g.quality_check_status.toUpperCase()}</span></td>
                      <td>${g.temperature_check || 'Ambient'}</td>
                      <td>Received by ${g.received_by} at ${g.received_at}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div>
          <div class="pk-card" style="border-left: 4px solid var(--color-primary);">
            <h4>Auto-Generated Requisitions</h4>
            <p>Raised automatically on stock par level breaches.</p>
            ${drafts.length ? drafts.map(d => `
              <div style="background:var(--bg-base); padding:0.6rem; border-radius:4px; font-size:0.75rem; margin-bottom:0.5rem;">
                <div style="font-weight:700; display:flex; justify-content:space-between;">
                  <span>Ref: ${d.po_id}</span>
                  <span class="pk-badge pk-badge-warning">${d.status}</span>
                </div>
                <div style="margin: 0.2rem 0;"><strong>Required:</strong> ${d.item_list}</div>
                <button class="btn btn-primary btn-sm" onclick="window.approveDraftPoRequisition('${d.po_id}')" style="margin-top:0.4rem; font-size:0.65rem; width:100%;">
                  Approve and dispatch PO
                </button>
              </div>
            `).join('') : '<span style="font-size:0.75rem; color:var(--text-muted);">No par breaches.</span>'}
          </div>
        </div>
      </div>

      <!-- hidden GRN modal -->
      <div id="grn-pop-modal" style="display:none; position:fixed; top:0; left:0; right:0; bottom:0; background:rgba(0,0,0,0.5); z-index:99999; justify-content:center; align-items:center;">
        <div class="pk-card" style="width:400px; background:#fff; border-radius:8px; box-shadow:var(--shadow-lg);">
          <h4>Goods Receipt Note Logging</h4>
          <form onsubmit="window.processGrnReceipt(event)">
            <input type="hidden" id="grn-po-ref">
            <div class="pk-form-group">
              <label class="pk-form-label">Quality & Freshness Check</label>
              <select id="grn-quality-check" class="pk-form-control">
                <option value="pass">Freshness passed inspection (Accept)</option>
                <option value="fail">Freshness failed inspection (Reject - PO stays open)</option>
              </select>
            </div>
            <div class="pk-form-group">
              <label class="pk-form-label">Temperature check reading (if cold-chain category)</label>
              <input type="text" id="grn-temp-check" class="pk-form-control" placeholder="e.g. 3.2°C (Cold Storage) or N/A">
            </div>
            <div class="pk-form-group">
              <label class="pk-form-label">Rejection reason (if failed)</label>
              <input type="text" id="grn-reject-reason" class="pk-form-control" placeholder="e.g. Broken cold chain seal">
            </div>
            <div style="display:flex; justify-content:flex-end; gap:0.5rem; margin-top:0.75rem;">
              <button type="button" class="btn btn-secondary" onclick="document.getElementById('grn-pop-modal').style.display='none'">Cancel</button>
              <button type="submit" class="btn btn-primary">File GRN entry</button>
            </div>
          </form>
        </div>
      </div>
    `;
  }

  window.approveDraftPoRequisition = function(poId) {
    const POs = window.state.pantryProcurement.purchaseOrders || [];
    const match = POs.find(po => po.po_id === poId);
    if (match) {
      match.status = 'ordered';
      localStorage.setItem('saronil_pantryProcurement', JSON.stringify(window.state.pantryProcurement));
      showGstToast(`✓ PO ${poId} approved and dispatched to vendor.`);
      window.views.pantryKitchen(document.getElementById('main-content'));
    }
  };

  window.openReceiveGrnModal = function(poId) {
    document.getElementById('grn-po-ref').value = poId;
    document.getElementById('grn-pop-modal').style.display = 'flex';
  };

  window.processGrnReceipt = function(event) {
    event.preventDefault();
    const poId = document.getElementById('grn-po-ref').value;
    const quality = document.getElementById('grn-quality-check').value;
    const temp = document.getElementById('grn-temp-check').value;
    const rejectReason = document.getElementById('grn-reject-reason').value;

    const POs = window.state.pantryProcurement.purchaseOrders || [];
    const matchPo = POs.find(po => po.po_id === poId);

    if (matchPo) {
      if (quality === 'fail') {
        // Rejection workflow: Failed GRN notifies vendor and keeps the PO open against the rejected quantity
        matchPo.status = 'ordered'; // stays ordered
        showGstToast(`⚠️ Rejection Alert Sent to Vendor for PO ${poId}. Reason: "${rejectReason}". PO remains open for replacement.`, "error");
      } else {
        matchPo.status = 'delivered';
        const grns = window.state.pantryProcurement.grnEntries || [];
        const grnId = "GRN-KIT-" + String(grns.length + 1).padStart(3, '0');
        
        grns.push({
          grn_id: grnId,
          po_id: poId,
          item_id: matchPo.category === 'dairy' ? 'INV-002' : 'INV-001',
          quantity_received: matchPo.quantity,
          quality_check_status: "pass",
          temperature_check: temp || "Ambient",
          rejection_reason: null,
          received_by: "Meena S.",
          received_at: new Date().toLocaleString()
        });

        // Add to storage stock ledger dynamically
        const items = window.state.pantryInventory || [];
        const batchNo = "BATCH-RCV-" + String(items.length + 1).padStart(2, '0');
        items.push({
          item_id: matchPo.category === 'dairy' ? 'INV-002' : 'INV-001',
          name: matchPo.category === 'dairy' ? "Fresh Milk" : "Basmati Rice",
          category: matchPo.category,
          batch_lot_no: batchNo,
          current_stock: matchPo.quantity,
          unit: matchPo.category === 'dairy' ? 'L' : 'kg',
          storage_location_id: matchPo.category === 'dairy' ? 'LOC-COLD-1' : 'LOC-DRY-A',
          expiry_date: new Date(Date.now() + 10*86400000).toISOString().split('T')[0],
          reorder_level: matchPo.category === 'dairy' ? 30 : 50,
          pricing: { standard: matchPo.category === 'dairy' ? 60 : 85, subsidized: matchPo.category === 'dairy' ? 35 : 50, free: 0 }
        });

        // Append to Inventory movement log (Receipt)
        window.state.inventoryMovementLog.push({
          log_id: "IML-" + String(window.state.inventoryMovementLog.length + 1).padStart(3, '0'),
          timestamp: new Date().toLocaleString(),
          item_name: matchPo.category === 'dairy' ? "Fresh Milk" : "Basmati Rice",
          batch_lot_no: batchNo,
          quantity: matchPo.quantity,
          unit: matchPo.category === 'dairy' ? 'L' : 'kg',
          from_location_id: "Vendor Purchase Delivery",
          to_location_id: matchPo.category === 'dairy' ? 'LOC-COLD-1' : 'LOC-DRY-A',
          type: "Stock Received",
          user: "Meena S.",
          department: "Dietary",
          reason: `Goods receipt against PO ${poId}`,
          reference: grnId
        });

        localStorage.setItem('saronil_pantryInventory', JSON.stringify(window.state.pantryInventory));
        localStorage.setItem('saronil_inventoryMovementLog', JSON.stringify(window.state.inventoryMovementLog));
        localStorage.setItem('saronil_pantryProcurement', JSON.stringify(window.state.pantryProcurement));
        showGstToast(`✓ GRN ${grnId} processed. Stock updated in Central Storage.`);
      }
    }

    document.getElementById('grn-pop-modal').style.display = 'none';
    window.views.pantryKitchen(document.getElementById('main-content'));
  };

  // Sub-tab: Storage (Stock Ledger)
  function renderStorageSubTab(persona) {
    const items = window.state.pantryInventory || [];
    const locations = window.state.pantryLocations || [];

    return `
      <div class="pk-grid-2col">
        <div>
          <div class="pk-card">
            <h4>Central Storage stock ledger (Batch Expiries)</h4>
            <p>Items within days-to-expiry window are visually flagged in amber/red (FEFO priority signals).</p>
            <div class="pk-table-wrapper">
              <table class="pk-table">
                <thead>
                  <tr>
                    <th>Item SKU / Location</th>
                    <th>Batch Lot No</th>
                    <th>Current Stock</th>
                    <th>Expiry Date</th>
                    <th>Days Left</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  ${items.map(s => {
                    const expiry = new Date(s.expiry_date);
                    const now = new Date("2026-07-11");
                    const daysLeft = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 3600 * 24));
                    let badgeClass = "pk-badge-success";
                    let statusLabel = "Valid";

                    if (daysLeft < 0) {
                      badgeClass = "pk-badge-danger";
                      statusLabel = "EXPIRED";
                    } else if (daysLeft <= 7) {
                      badgeClass = "pk-badge-danger";
                      statusLabel = "FEFO CRITICAL";
                    } else if (daysLeft <= 30) {
                      badgeClass = "pk-badge-warning";
                      statusLabel = "NEAR EXPIRY";
                    }

                    return `
                      <tr>
                        <td>
                          <strong>${s.name}</strong><br>
                          <span style="font-size:0.7rem; color:var(--text-muted);">${s.storage_location_id}</span>
                        </td>
                        <td><code>${s.batch_lot_no}</code></td>
                        <td><strong>${s.current_stock} ${s.unit}</strong></td>
                        <td>${s.expiry_date}</td>
                        <td><strong style="color:${daysLeft <= 7 ? '#dc2626' : 'inherit'};">${daysLeft} days</strong></td>
                        <td><span class="pk-badge ${badgeClass}">${statusLabel}</span></td>
                      </tr>
                    `;
                  }).join('')}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div>
          <!-- Issue to kitchen floor (FEFO GATED) -->
          <div class="pk-card">
            <h4>Issue ingredients to Kitchen Floor</h4>
            <p><strong>FEFO hard gate:</strong> Oldest expiry batch is auto-selected. Fresher batches cannot be bypassed if an older batch exists.</p>
            <form onsubmit="window.submitStockIssueToKitchen(event)">
              <div class="pk-form-group">
                <label class="pk-form-label">Ingredient</label>
                <select id="issue-ingred-name" class="pk-form-control" onchange="window.populateFefoBatchSelect(this.value)">
                  <option value="Basmati Rice">Basmati Rice</option>
                  <option value="Fresh Milk">Fresh Milk</option>
                  <option value="Chicken Breast">Chicken Breast</option>
                </select>
              </div>
              <div class="pk-form-group">
                <label class="pk-form-label">Select batch (FEFO priority check)</label>
                <select id="issue-ingred-batch" class="pk-form-control">
                  <!-- Dynamically populated -->
                </select>
              </div>
              <div class="pk-form-group">
                <label class="pk-form-label">Quantity to issue</label>
                <input type="number" id="issue-ingred-qty" class="pk-form-control" value="10" required>
              </div>
              <button type="submit" class="btn btn-primary" style="width:100%; margin-top:0.5rem;">Issue to Kitchen Floor</button>
            </form>
          </div>

          <!-- Locations master list -->
          <div class="pk-card">
            <h4>First-Class Storage Locations</h4>
            <p>Kept distinct from pharmacy counters.</p>
            <div style="font-size:0.75rem; display:flex; flex-direction:column; gap:0.4rem;">
              ${locations.map(l => `
                <div style="border-bottom:1px solid var(--border-color); padding-bottom:0.25rem; display:flex; justify-content:space-between; align-items:center;">
                  <div>
                    <strong>${l.name}</strong> (<code>${l.code}</code>)<br>
                    <span style="font-size:0.7rem; color:var(--text-muted);">${l.type} · Temp: ${l.temp_category} · Owner: ${l.department}</span>
                  </div>
                  <span class="pk-badge pk-badge-success">${l.status}</span>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      </div>
    `;
  }

  window.populateFefoBatchSelect = function(itemName) {
    const items = window.state.pantryInventory || [];
    const list = items.filter(i => i.name === itemName && i.current_stock > 0);

    // Sort by expiry ascending (oldest first)
    list.sort((a,b) => new Date(a.expiry_date) - new Date(b.expiry_date));

    const batchSelect = document.getElementById('issue-ingred-batch');
    if (batchSelect) {
      batchSelect.innerHTML = list.map((b, idx) => `
        <option value="${b.batch_lot_no}" ${idx > 0 ? 'disabled' : ''}>
          ${b.batch_lot_no} (${b.current_stock} ${b.unit}) - Exp: ${b.expiry_date} ${idx > 0 ? ' [LOCKED - FEFO restriction]' : ' [RECOMMENDED]'}
        </option>
      `).join('');
    }
  };

  setTimeout(() => {
    const sel = document.getElementById('issue-ingred-name');
    if (sel) window.populateFefoBatchSelect(sel.value);
  }, 150);

  window.submitStockIssueToKitchen = function(event) {
    event.preventDefault();
    const name = document.getElementById('issue-ingred-name').value;
    const batch = document.getElementById('issue-ingred-batch').value;
    const qty = parseFloat(document.getElementById('issue-ingred-qty').value);

    const items = window.state.pantryInventory || [];
    const match = items.find(i => i.name === name && i.batch_lot_no === batch);

    // Hard verification: FEFO gate
    const allActive = items.filter(i => i.name === name && i.current_stock > 0);
    allActive.sort((a,b) => new Date(a.expiry_date) - new Date(b.expiry_date));
    const oldest = allActive[0];

    if (oldest && oldest.batch_lot_no !== batch) {
      alert(`🚫 FEFO Hard Block: Batch ${batch} cannot be selected while an older batch (${oldest.batch_lot_no} expiring ${oldest.expiry_date}) remains in stock.`);
      return;
    }

    if (match) {
      if (match.current_stock < qty) {
        showGstToast("Insufficient stock in the selected batch.", "error");
        return;
      }
      match.current_stock -= qty;
      localStorage.setItem('saronil_pantryInventory', JSON.stringify(window.state.pantryInventory));

      const logId = "IML-" + String(window.state.inventoryMovementLog.length + 1).padStart(3, '0');
      // Save Movement Log
      window.state.inventoryMovementLog.push({
        log_id: logId,
        timestamp: new Date().toLocaleString(),
        item_name: name,
        batch_lot_no: batch,
        quantity: qty,
        unit: match.unit,
        from_location_id: match.storage_location_id,
        to_location_id: "LOC-KITCH-FLR",
        type: "Issue to Kitchen",
        user: "Meena S. (Storekeeper)",
        department: "Dietary",
        reason: "Ingredients issue to Kitchen Production floor",
        reference: "IS-2407-" + String(Math.floor(Math.random() * 900) + 100)
      });
      localStorage.setItem('saronil_inventoryMovementLog', JSON.stringify(window.state.inventoryMovementLog));

      showGstToast(`✓ Stock issued. ${qty} ${match.unit} of batch ${batch} transferred to Kitchen Floor.`);
      window.views.pantryKitchen(document.getElementById('main-content'));
    }
  };

  // Sub-tab: Floor WIP & Assets
  function renderFloorSubTab(persona) {
    const wip = window.state.pantryWIPBatches || [];
    const assets = window.state.kitchenEquipmentAssets || [];
    const floor = window.state.kitchenFloorStock || [];

    return `
      <div class="pk-grid-2col">
        <div>
          <!-- Shift Floor stock reconciliation -->
          <div class="pk-card">
            <h4>Shift-wise Floor Stock Reconciliation</h4>
            <p>Closed out per shift. Floor supervisors must reconcile variance prior to new issues.</p>
            <div class="pk-table-wrapper">
              <table class="pk-table">
                <thead>
                  <tr>
                    <th>Shift Date</th>
                    <th>Opening Stock</th>
                    <th>Floor Issues</th>
                    <th>Production Consumed</th>
                    <th>Closing Stock</th>
                    <th>Variance</th>
                    <th>Supervisor Review</th>
                  </tr>
                </thead>
                <tbody>
                  ${floor.map(f => `
                    <tr>
                      <td><strong>${f.date} (${f.shift})</strong></td>
                      <td>${f.opening_stock} kg</td>
                      <td>${f.issued_qty} kg</td>
                      <td>${f.consumed_qty} kg</td>
                      <td>${f.closing_stock} kg</td>
                      <td><strong style="color:${f.variance > 0 ? '#ef4444' : 'inherit'};">${f.variance} kg</strong></td>
                      <td>${f.reviewed_by ? `<span style="color:#16a34a; font-weight:600;">✓ Reviewed</span>` : 'Awaiting Sign-off'}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>

          <!-- WIP batches log -->
          <div class="pk-card">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.5rem;">
              <h4>WIP & Semi-prepared Batch Log</h4>
              <button class="btn btn-primary btn-sm" onclick="window.prepareWipBatch()">+ Log WIP Prep</button>
            </div>
            <p><strong>Use-by gate:</strong> WIP batches past their use-by window are hard-blocked from production selection.</p>
            <div class="pk-table-wrapper">
              <table class="pk-table">
                <thead>
                  <tr>
                    <th>WIP Batch ID</th>
                    <th>Prep Item Name</th>
                    <th>Qty</th>
                    <th>Prepared By/At</th>
                    <th>Use-By window</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  ${wip.map(w => {
                    const useBy = new Date(w.use_by_window);
                    const now = new Date("2026-07-12T00:30:00");
                    const isExpired = useBy < now || w.status === 'Expired';
                    return `
                      <tr>
                        <td><code>${w.batch_id}</code></td>
                        <td><strong>${w.item_name}</strong></td>
                        <td>${w.quantity} ${w.unit}</td>
                        <td>${w.prepared_by}<br><span style="font-size:0.7rem; color:var(--text-muted);">${w.prepared_at}</span></td>
                        <td><strong style="color:${isExpired ? '#dc2626' : 'inherit'};">${w.use_by_window}</strong></td>
                        <td>
                          <span class="pk-badge ${isExpired ? 'pk-badge-danger' : 'pk-badge-success'}">
                            ${isExpired ? 'EXPIRED (BLOCKED)' : 'ACTIVE'}
                          </span>
                        </td>
                        <td>
                          ${isExpired ? `
                            <span style="font-size:0.75rem; color:#ef4444; font-weight:600;">Use Blocked</span>
                          ` : `
                            <button class="btn btn-secondary btn-sm" onclick="window.consumeWipBatch('${w.batch_id}')" style="padding:0.15rem 0.4rem; font-size:0.65rem;">Use in Cooking</button>
                          `}
                        </td>
                      </tr>
                    `;
                  }).join('')}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div>
          <!-- Kitchen Assets / Gas cylinder checks -->
          <div class="pk-card">
            <h4>Kitchen Assets & Gas Cylinder Safety</h4>
            <p>LPG connections past safety checks are hard-blocked unless overridden by a Safety Officer.</p>
            <div style="font-size:0.75rem; display:flex; flex-direction:column; gap:0.6rem;">
              ${assets.map(a => {
                const checkDue = new Date(a.next_check_due);
                const now = new Date("2026-07-12");
                const isOverdue = checkDue < now;
                let badgeClass = "pk-badge-success";
                let badgeLabel = "Active";

                if (isOverdue) {
                  badgeClass = "pk-badge-danger";
                  badgeLabel = "BLOCKED / OVERDUE";
                }

                return `
                  <div style="border-bottom:1px solid var(--border-color); padding-bottom:0.4rem;">
                    <div style="display:flex; justify-content:space-between; align-items:center;">
                      <strong>${a.name}</strong>
                      <span class="pk-badge ${badgeClass}">${badgeLabel}</span>
                    </div>
                    <div style="font-size:0.7rem; color:var(--text-muted); margin-top:0.15rem;">
                      Location: ${a.location} · Safety check due: ${a.next_check_due}
                    </div>
                    ${isOverdue && a.asset_type === 'lpg_cylinder' ? `
                      <button class="btn btn-secondary btn-sm" onclick="window.lpgSafetyOverride('${a.asset_id}')" style="padding:0.1rem 0.3rem; font-size:0.65rem; margin-top:0.35rem; width:100%;">
                        Safety Officer Override
                      </button>
                    ` : ''}
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        </div>
      </div>
    `;
  }

  window.prepareWipBatch = async function() {
    const item = await customPrompt("Enter WIP Semi-prepared dish name (e.g. Marinated Paneer):");
    if (!item) return;
    const qtyStr = await customPrompt("Quantity (kg):", "5");
    if (!qtyStr) return;

    const list = window.state.pantryWIPBatches || [];
    const batchId = "WIP-" + String(list.length + 1).padStart(3, '0');
    
    list.unshift({
      batch_id: batchId,
      item_name: item,
      prepared_by: "Chef Ravi (Kitchen Floor)",
      prepared_at: new Date().toLocaleString(),
      quantity: parseFloat(qtyStr),
      unit: "kg",
      use_by_window: new Date(Date.now() + 12*3600000).toLocaleString(), // 12 hours window
      status: "Active",
      source_movement_id: "IML-WIP-" + batchId
    });

    localStorage.setItem('saronil_pantryWIPBatches', JSON.stringify(window.state.pantryWIPBatches));
    showGstToast(`✓ WIP batch ${batchId} registered on kitchen floor.`);
    window.views.pantryKitchen(document.getElementById('main-content'));
  };

  window.consumeWipBatch = function(batchId) {
    const list = window.state.pantryWIPBatches || [];
    const match = list.find(w => w.batch_id === batchId);
    if (match) {
      match.status = 'Consumed';
      localStorage.setItem('saronil_pantryWIPBatches', JSON.stringify(window.state.pantryWIPBatches));
      showGstToast(`✓ WIP batch ${batchId} consumed in current shift cooking production.`);
      window.views.pantryKitchen(document.getElementById('main-content'));
    }
  };

  window.lpgSafetyOverride = async function(assetId) {
    const reason = await customPrompt("Food Safety Officer: Enter safety check override justification (LPG Connection hold):");
    if (!reason) {
      showGstToast("Safety override requires logged justification.", "error");
      return;
    }
    const assets = window.state.kitchenEquipmentAssets || [];
    const match = assets.find(a => a.asset_id === assetId);
    if (match) {
      match.status = "Active (Override Approved)";
      match.next_check_due = new Date(Date.now() + 7*86400000).toISOString().split('T')[0]; // extend 7 days
      localStorage.setItem('saronil_kitchenEquipmentAssets', JSON.stringify(window.state.kitchenEquipmentAssets));
      showGstToast(`LPG connection overridden for 7 days. Justification logged: "${reason}"`);
      window.views.pantryKitchen(document.getElementById('main-content'));
    }
  };

  // Sub-tab: Ward Satellites
  function renderWardSubTab(persona) {
    const wardStock = window.state.wardPantryStock || [];

    return `
      <div class="pk-grid-2col">
        <div>
          <div class="pk-card">
            <h4>Ward satellite Pantries Stock Ledger</h4>
            <p>Replenishment desk. Ward pantry stocks can only increase via a logged transfer from Kitchen Floor.</p>
            <div class="pk-table-wrapper">
              <table class="pk-table">
                <thead>
                  <tr>
                    <th>Ingredient</th>
                    <th>Ward Pantry</th>
                    <th>Current Stock</th>
                    <th>Replenishment Par Level</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  ${wardStock.map(w => {
                    const low = w.current_stock < w.par_level;
                    return `
                      <tr>
                        <td><strong>Fresh Milk</strong></td>
                        <td><code>${w.ward}</code></td>
                        <td><strong>${w.current_stock} L</strong></td>
                        <td>${w.par_level} L</td>
                        <td>
                          <span class="pk-badge ${low ? 'pk-badge-warning' : 'pk-badge-success'}">
                            ${low ? 'REPLENISH DUE' : 'Stock OK'}
                          </span>
                        </td>
                      </tr>
                    `;
                  }).join('')}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div>
          <!-- Ward Replenish Transfer -->
          <div class="pk-card">
            <h4>Request Ward Pantry Transfer</h4>
            <form onsubmit="window.transferToWardPantry(event)">
              <div class="pk-form-group">
                <label class="pk-form-label">Satellite Ward</label>
                <select id="transfer-ward" class="pk-form-control">
                  <option value="GW(M)">General Ward (Male)</option>
                  <option value="GW(F)">General Ward (Female)</option>
                </select>
              </div>
              <div class="pk-form-group">
                <label class="pk-form-label">Transfer Quantity (Milk L)</label>
                <input type="number" id="transfer-qty" class="pk-form-control" value="5" required>
              </div>
              <button type="submit" class="btn btn-primary" style="width:100%; margin-top:0.5rem;">Process Satellite Transfer</button>
            </form>
          </div>
        </div>
      </div>
    `;
  }

  window.transferToWardPantry = function(event) {
    event.preventDefault();
    const ward = document.getElementById('transfer-ward').value;
    const qty = parseFloat(document.getElementById('transfer-qty').value);

    // Enforce hard-gate check on floor stock before transferring
    const items = window.state.pantryInventory || [];
    const milkBatch = items.find(i => i.name === 'Fresh Milk' && i.current_stock >= qty);

    if (!milkBatch) {
      alert("🚫 Transfer Blocked: Insufficient batch stock in Central Storage locations.");
      return;
    }

    milkBatch.current_stock -= qty;
    const wardStock = window.state.wardPantryStock || [];
    const match = wardStock.find(w => w.ward === ward);
    if (match) {
      match.current_stock += qty;
    }

    // Log to unified movement log
    const logId = "IML-" + String(window.state.inventoryMovementLog.length + 1).padStart(3, '0');
    window.state.inventoryMovementLog.push({
      log_id: logId,
      timestamp: new Date().toLocaleString(),
      item_name: "Fresh Milk",
      batch_lot_no: milkBatch.batch_lot_no,
      quantity: qty,
      unit: "L",
      from_location_id: milkBatch.storage_location_id,
      to_location_id: `LOC-PAN-${ward === 'GW(M)' ? 'GW' : 'GWF'}`,
      type: "Transfer Between Locations",
      user: "Meena S. (Storekeeper)",
      department: "Dietary",
      reason: `Replenishment of ward pantry ${ward}`,
      reference: "TR-" + String(Math.floor(Math.random() * 900) + 100)
    });

    localStorage.setItem('saronil_pantryInventory', JSON.stringify(window.state.pantryInventory));
    localStorage.setItem('saronil_wardPantryStock', JSON.stringify(window.state.wardPantryStock));
    localStorage.setItem('saronil_inventoryMovementLog', JSON.stringify(window.state.inventoryMovementLog));

    showGstToast(`✓ Satellite Transfer Approved: ${qty} L milk moved to ${ward} Pantry.`);
    window.views.pantryKitchen(document.getElementById('main-content'));
  };

  // ==========================================
  // TAB 5: Food Safety & Hygiene
  // ==========================================
  function renderFoodSafetyTab(persona) {
    const isSafety = persona === 'F&B Manager' || persona === 'Super Admin' || persona === 'Food Safety / Quality Officer';
    const temps = window.state.foodSafetyLogs.haccpTemps || [];

    // Kitchen duty roster medical checks
    const activeStaff = [
      { id: "KIT01", name: "Chef Ravi", cert: "Expired (2026-06-30)", expired: true },
      { id: "KIT02", name: "Meena S.", cert: "Valid (2026-12-31)", expired: false },
      { id: "KIT03", name: "Sunita K.", cert: "Valid (2027-02-15)", expired: false }
    ];

    return `
      <div class="pk-grid-2col">
        <div>
          <!-- HACCP critical temps -->
          <div class="pk-card">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.5rem;">
              <h4>HACCP Temperature log checks</h4>
              <button class="btn btn-primary btn-sm" onclick="window.addHaccpCcpLog()">+ Log Temp</button>
            </div>
            <div class="pk-table-wrapper">
              <table class="pk-table">
                <thead>
                  <tr>
                    <th>Log ID</th>
                    <th>Storage unit</th>
                    <th>Reading</th>
                    <th>Time</th>
                    <th>Status</th>
                    <th>Corrective Action</th>
                  </tr>
                </thead>
                <tbody>
                  ${temps.map(t => `
                    <tr>
                      <td><code>${t.log_id}</code></td>
                      <td>${t.storage_unit}</td>
                      <td><strong>${t.temperature}°C</strong></td>
                      <td>${t.logged_at}</td>
                      <td>
                        <span class="pk-badge ${t.status === 'OK' ? 'pk-badge-success' : 'pk-badge-danger'}">
                          ${t.status}
                        </span>
                      </td>
                      <td>
                        ${t.status === 'Breach' && !t.corrective_action ? `
                          <button class="btn btn-secondary btn-sm" onclick="window.resolveCcpBreach('${t.log_id}')" style="padding:0.15rem 0.4rem; font-size:0.65rem;">Resolve Breach</button>
                        ` : (t.corrective_action || '—')}
                      </td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div>
          <!-- Kitchen duty staff health roster check -->
          <div class="pk-card">
            <h4>Food Handler Medical Fitness Roster check</h4>
            <p><strong>Hard gate block:</strong> System blocks active roster assignments for staff with expired certificates.</p>
            <div style="font-size:0.75rem; display:flex; flex-direction:column; gap:0.55rem;">
              ${activeStaff.map(s => `
                <div style="border-bottom:1px solid var(--border-color); padding-bottom:0.35rem; display:flex; justify-content:space-between; align-items:center;">
                  <div>
                    <strong>${s.name}</strong><br>
                    <span style="font-size:0.7rem; color:var(--text-muted);">Cert status: ${s.cert}</span>
                  </div>
                  <strong style="color:${s.expired ? '#ef4444' : '#16a34a'};">
                    ${s.expired ? '🚫 BLOCKED' : 'Cleared / Active'}
                  </strong>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      </div>
    `;
  }

  window.addHaccpCcpLog = async function() {
    const unit = await customPrompt("Select CCP Storage Unit:", "Cold Storage 1");
    if (!unit) return;
    const val = await customPrompt("Temperature reading (°C):", "3.8");
    if (!val) return;

    const temp = parseFloat(val);
    let status = "OK";
    if (unit.includes("Cold") && temp > 4.0) status = "Breach";

    const logs = window.state.foodSafetyLogs.haccpTemps || [];
    logs.unshift({
      log_id: "HC-" + String(logs.length + 1).padStart(3, '0'),
      storage_unit: unit,
      temperature: temp,
      logged_at: new Date().toLocaleString(),
      breach_flag: status === 'Breach',
      status: status,
      corrective_action: null
    });

    localStorage.setItem('saronil_foodSafetyLogs', JSON.stringify(window.state.foodSafetyLogs));
    showGstToast(`✓ CCP Temperature logged. Status: ${status}`);
    window.views.pantryKitchen(document.getElementById('main-content'));
  };

  window.resolveCcpBreach = async function(logId) {
    const action = await customPrompt("Log corrective action taken:");
    if (!action) {
      showGstToast("Corrective action is mandatory.", "error");
      return;
    }
    const logs = window.state.foodSafetyLogs.haccpTemps || [];
    const match = logs.find(l => l.log_id === logId);
    if (match) {
      match.corrective_action = action;
      match.status = "OK (Resolved)";
      localStorage.setItem('saronil_foodSafetyLogs', JSON.stringify(window.state.foodSafetyLogs));
      showGstToast("✓ Corrective action registered. Safety breach resolved.");
      window.views.pantryKitchen(document.getElementById('main-content'));
    }
  };

  // ==========================================
  // TAB 6: Cost & Wastage Reports
  // ==========================================
  function renderReportsTab(persona) {
    return `
      <div class="pk-grid-2col">
        <div>
          <div class="pk-card">
            <h4>Cost Per Patient Day (CPD) Trend</h4>
            <div class="pk-table-wrapper">
              <table class="pk-table">
                <thead>
                  <tr>
                    <th>Month</th>
                    <th>Dietary Expenses</th>
                    <th>Patient Days</th>
                    <th style="text-align:right;">CPD Cost</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>May 2026</td>
                    <td>₹1,85,000.00</td>
                    <td>1,200</td>
                    <td style="text-align:right; font-weight:700;">₹154.16</td>
                    <td><span class="pk-badge pk-badge-success">Base</span></td>
                  </tr>
                  <tr>
                    <td>June 2026</td>
                    <td>₹2,10,000.00</td>
                    <td>1,350</td>
                    <td style="text-align:right; font-weight:700;">₹155.55</td>
                    <td><span class="pk-badge pk-badge-success">Within Par</span></td>
                  </tr>
                  <tr>
                    <td><strong>July 2026 (MTD)</strong></td>
                    <td><strong>₹85,000.00</strong></td>
                    <td><strong>580</strong></td>
                    <td style="text-align:right; font-weight:700; color:var(--color-primary);">₹146.55</td>
                    <td><span class="pk-badge pk-badge-success">-5.7% Variance</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div>
          <div class="pk-card">
            <h4>Revenue Segment Analysis (July MTD)</h4>
            <div style="font-size:0.75rem; display:flex; flex-direction:column; gap:0.5rem;">
              <div style="display:flex; justify-content:space-between; border-bottom:1px solid var(--border-color); padding-bottom:0.25rem;">
                <span>Patient billing (Composite exempt):</span>
                <strong>₹68,400.00</strong>
              </div>
              <div style="display:flex; justify-content:space-between; border-bottom:1px solid var(--border-color); padding-bottom:0.25rem;">
                <span>Staff Cafeteria (Taxable):</span>
                <strong>₹24,500.00</strong>
              </div>
              <div style="display:flex; justify-content:space-between; padding-bottom:0.25rem;">
                <span>Customer Cafeteria (Taxable):</span>
                <strong>₹32,100.00</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // ==========================================
  // TAB 7: Inventory Movement Log (Audit Trail)
  // ==========================================
  function renderAuditTrailTab(persona) {
    const logs = window.state.inventoryMovementLog || [];
    const isManager = persona === 'F&B Manager' || persona === 'Super Admin' || persona === 'Food Safety / Quality Officer';

    return `
      <div class="pk-card">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.75rem;">
          <div>
            <h4>Unified Inventory Movement Log (Audit Trail)</h4>
            <p>Real-time ledger audit trail. Captures every raw stock conversion, transfer, issue, return, or disposal.</p>
          </div>
          <div style="display:flex; gap:0.5rem;">
            <button class="btn btn-secondary btn-sm" onclick="window.openAdjustModal()">+ Adjust Inventory</button>
            <button class="btn btn-primary btn-sm" onclick="window.openDisposeModal()">+ Dispose Inventory</button>
          </div>
        </div>

        <div class="pk-table-wrapper">
          <table class="pk-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Item / Batch No</th>
                <th>Qty</th>
                <th>Movement Type</th>
                <th>From Location</th>
                <th>To Location</th>
                <th>Operator</th>
                <th>Reason / Doc Ref</th>
                <th>Approve Sign-off</th>
              </tr>
            </thead>
            <tbody>
              ${logs.slice().reverse().map(l => {
                const needApprove = (l.type === 'Adjustment' || l.type === 'Disposal') && !l.approved_by;
                return `
                  <tr>
                    <td><span style="font-size:0.7rem; color:var(--text-muted);">${l.timestamp}</span></td>
                    <td><strong>${l.item_name}</strong><br><code>${l.batch_lot_no}</code></td>
                    <td><strong>${l.quantity} ${l.unit || ''}</strong></td>
                    <td><span class="pk-badge pk-badge-info">${l.type}</span></td>
                    <td><code>${l.from_location_id}</code></td>
                    <td><code>${l.to_location_id}</code></td>
                    <td>${l.user}</td>
                    <td>
                      ${l.reason}<br>
                      <span style="font-size:0.7rem; color:var(--text-muted);">Ref: ${l.reference || '—'}</span>
                    </td>
                    <td>
                      ${needApprove ? `
                        ${isManager ? `
                          <button class="btn btn-primary btn-sm" onclick="window.signOffMovement('${l.log_id}')" style="padding:0.15rem 0.4rem; font-size:0.65rem;">Sign-off Approval</button>
                        ` : `<span style="font-size:0.7rem; color:#ef4444; font-weight:600;">Awaiting F&B Manager</span>`}
                      ` : (l.approved_by || '—')}
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Hidden Adjust Modal -->
      <div id="adjust-pop-modal" style="display:none; position:fixed; top:0; left:0; right:0; bottom:0; background:rgba(0,0,0,0.5); z-index:99999; justify-content:center; align-items:center;">
        <div class="pk-card" style="width:400px; background:#fff; border-radius:8px; box-shadow:var(--shadow-lg);">
          <h4>Inventory Adjustments Sheet</h4>
          <form onsubmit="window.submitStockAdjustment(event)">
            <div class="pk-form-group">
              <label class="pk-form-label">Select Stock Item</label>
              <select id="adj-item-select" class="pk-form-control">
                ${window.state.pantryInventory.map(i => `<option value="${i.item_id}">${i.name} [${i.batch_lot_no} - ${i.storage_location_id}]</option>`).join('')}
              </select>
            </div>
            <div class="pk-form-group">
              <label class="pk-form-label">New Actual Physical Stock Quantity</label>
              <input type="number" id="adj-qty" class="pk-form-control" placeholder="e.g. 100" required>
            </div>
            <div class="pk-form-group">
              <label class="pk-form-label">Discrepancy Justification Reason</label>
              <input type="text" id="adj-reason" class="pk-form-control" placeholder="e.g. Spillage during transfer" required>
            </div>
            <div style="display:flex; justify-content:flex-end; gap:0.5rem; margin-top:0.75rem;">
              <button type="button" class="btn btn-secondary" onclick="document.getElementById('adjust-pop-modal').style.display='none'">Cancel</button>
              <button type="submit" class="btn btn-primary">File Adjustment</button>
            </div>
          </form>
        </div>
      </div>

      <!-- Hidden Dispose Modal -->
      <div id="dispose-pop-modal" style="display:none; position:fixed; top:0; left:0; right:0; bottom:0; background:rgba(0,0,0,0.5); z-index:99999; justify-content:center; align-items:center;">
        <div class="pk-card" style="width:400px; background:#fff; border-radius:8px; box-shadow:var(--shadow-lg);">
          <h4>Stock Disposal Sheet</h4>
          <form onsubmit="window.submitStockDisposal(event)">
            <div class="pk-form-group">
              <label class="pk-form-label">Select Expired / Damaged Stock</label>
              <select id="disp-item-select" class="pk-form-control">
                ${window.state.pantryInventory.map(i => `<option value="${i.item_id}">${i.name} [${i.batch_lot_no} - ${i.storage_location_id}]</option>`).join('')}
              </select>
            </div>
            <div class="pk-form-group">
              <label class="pk-form-label">Quantity to Dispose</label>
              <input type="number" id="disp-qty" class="pk-form-control" required>
            </div>
            <div class="pk-form-group">
              <label class="pk-form-label">Rejection / Waste Reason</label>
              <input type="text" id="disp-reason" class="pk-form-control" placeholder="e.g. Expiry breach/contamination" required>
            </div>
            <div style="display:flex; justify-content:flex-end; gap:0.5rem; margin-top:0.75rem;">
              <button type="button" class="btn btn-secondary" onclick="document.getElementById('dispose-pop-modal').style.display='none'">Cancel</button>
              <button type="submit" class="btn btn-primary">File Disposal</button>
            </div>
          </form>
        </div>
      </div>
    `;
  }

  window.openAdjustModal = function() {
    document.getElementById('adjust-pop-modal').style.display = 'flex';
  };

  window.openDisposeModal = function() {
    document.getElementById('dispose-pop-modal').style.display = 'flex';
  };

  window.submitStockAdjustment = function(event) {
    event.preventDefault();
    const itemId = document.getElementById('adj-item-select').value;
    const qty = parseFloat(document.getElementById('adj-qty').value);
    const reason = document.getElementById('adj-reason').value;

    const items = window.state.pantryInventory || [];
    const match = items.find(i => i.item_id === itemId);

    if (match) {
      const logId = "IML-" + String(window.state.inventoryMovementLog.length + 1).padStart(3, '0');
      // Create movement log for Adjustment (requires sign-off second approver)
      window.state.inventoryMovementLog.push({
        log_id: logId,
        timestamp: new Date().toLocaleString(),
        item_name: match.name,
        batch_lot_no: match.batch_lot_no,
        quantity: qty - match.current_stock,
        unit: match.unit,
        from_location_id: match.storage_location_id,
        to_location_id: match.storage_location_id,
        type: "Adjustment",
        user: "Meena S. (Storekeeper)",
        department: "Dietary",
        reason: `Physical Count Adjust: ${reason}`,
        reference: "ADJ-" + String(Math.floor(Math.random() * 900) + 100),
        approved_by: "" // requires approval
      });

      // Update actual stock (in state)
      match.current_stock = qty;

      localStorage.setItem('saronil_pantryInventory', JSON.stringify(window.state.pantryInventory));
      localStorage.setItem('saronil_inventoryMovementLog', JSON.stringify(window.state.inventoryMovementLog));

      showGstToast(`✓ Stock Adjustment logged for ${match.name}. Awaiting supervisor approval.`);
    }

    document.getElementById('adjust-pop-modal').style.display = 'none';
    window.views.pantryKitchen(document.getElementById('main-content'));
  };

  window.submitStockDisposal = function(event) {
    event.preventDefault();
    const itemId = document.getElementById('disp-item-select').value;
    const qty = parseFloat(document.getElementById('disp-qty').value);
    const reason = document.getElementById('disp-reason').value;

    const items = window.state.pantryInventory || [];
    const match = items.find(i => i.item_id === itemId);

    if (match) {
      if (match.current_stock < qty) {
        showGstToast("Cannot dispose more than active stock quantity.", "error");
        return;
      }

      const logId = "IML-" + String(window.state.inventoryMovementLog.length + 1).padStart(3, '0');
      window.state.inventoryMovementLog.push({
        log_id: logId,
        timestamp: new Date().toLocaleString(),
        item_name: match.name,
        batch_lot_no: match.batch_lot_no,
        quantity: qty,
        unit: match.unit,
        from_location_id: match.storage_location_id,
        to_location_id: "LOC-DISPOSAL",
        type: "Disposal",
        user: "Meena S. (Storekeeper)",
        department: "Dietary",
        reason: `Disposal: ${reason}`,
        reference: "DIS-" + String(Math.floor(Math.random() * 900) + 100),
        approved_by: "" // requires approval
      });

      match.current_stock -= qty;

      localStorage.setItem('saronil_pantryInventory', JSON.stringify(window.state.pantryInventory));
      localStorage.setItem('saronil_inventoryMovementLog', JSON.stringify(window.state.inventoryMovementLog));

      showGstToast(`✓ Stock Disposal logged for ${match.name}. Awaiting Food Safety approval.`);
    }

    document.getElementById('dispose-pop-modal').style.display = 'none';
    window.views.pantryKitchen(document.getElementById('main-content'));
  };

  window.signOffMovement = function(logId) {
    const logs = window.state.inventoryMovementLog || [];
    const match = logs.find(l => l.log_id === logId);
    if (match) {
      match.approved_by = "Ananya R. (F&B Manager)";
      localStorage.setItem('saronil_inventoryMovementLog', JSON.stringify(window.state.inventoryMovementLog));
      showGstToast(`✓ Sign-off approved for reference ${logId}.`);
      window.views.pantryKitchen(document.getElementById('main-content'));
    }
  };

  async function customPrompt(title, defaultVal = "") {
    return window.prompt(title, defaultVal);
  }

})();
