/* ==========================================================================
   SARONIL HMS - HOUSEKEEPING OPERATIONS & ENV DESK (housekeepingView.js)
   NABH-Compliant Environmental Services, Gated Checklists & Audit Logs
   ========================================================================== */

(function () {
  'use strict';

  var _activeOpsSubTab = 'dashboard'; // 'dashboard' | 'raise' | 'assign' | 'execute' | 'verify' | 'beds' | 'schedule' | 'inspect' | 'reports' | 'audit'
  var _taskFilter = 'All'; // 'All' | 'New' | 'Assigned' | 'In Progress' | 'Completed' | 'Verified' | 'Closed' | 'Cancelled'
  var _bedWardFilter = 'All';
  var _reportType = 'sla'; // 'sla' | 'staff' | 'daily' | 'room' | 'bedReadiness' | 'quality'
  var _reportFromDate = new Date().toISOString().slice(0, 10);
  var _reportToDate = new Date().toISOString().slice(0, 10);
  
  // Modals state
  var _activeModal = null; // 'assign' | 'checklist' | 'cancel' | 'icNurseSignOff' | 'reject'
  var _selectedTaskId = null;
  var _selectedBedId = null;
  var _activeTab = 'dashboard';

  // Quality Inspection State
  var _inspScores = { floor: 5, surface: 5, bin: 5, linen: 5, odour: 5, overall: 5 };
  
  // Staff filter for Execution screen
  var _selectedStaffExecutor = 'Ramu K.';

  // Audit log filter state variables
  var _auditRoleFilter = 'All';
  var _auditActionFilter = 'All';

  // Laundry module state variables
  var _activeLaundrySubTab = 'dashboard';
  var _laundrySearchQuery = '';
  var _laundryCategoryFilter = 'All';
  var _laundryStatusFilter = 'All';

  // CSSD module state variables
  var _activeCssdSubTab = 'dashboard';
  var _cssdSearchQuery = '';
  var _cssdMethodFilter = 'All';
  var _cssdStatusFilter = 'All';

  // BMW module state variables
  var _activeBmwSubTab = 'dashboard';
  var _bmwSearchQuery = '';
  var _bmwCategoryFilter = 'All';
  var _bmwStatusFilter = 'All';
  var _bmwTsaBreachAcknowledged = false;

  // ──────────────────────────────────────────────────────────────────────────
  // VIEW REGISTRATIONS (EXPOSED SPA ROUTE ENTRIES)
  // ──────────────────────────────────────────────────────────────────────────
  window.views.housekeepingDashboard = function (container) {
    renderBase(container, 'dashboard');
  };

  window.views.housekeepingOperations = function (container, subAnchor, params) {
    if (params && params.tab) {
      _activeOpsSubTab = params.tab;
    }
    renderBase(container, 'operations');
  };

  window.views.laundry = function (container, subAnchor, params) {
    if (params && params.tab) {
      _activeLaundrySubTab = params.tab;
    }
    renderBase(container, 'laundry');
  };

  window.views.cssd = function (container, subAnchor, params) {
    if (params && params.tab) {
      _activeCssdSubTab = params.tab;
    }
    renderBase(container, 'cssd');
  };

  window.views.bmw = function (container, subAnchor, params) {
    if (params && params.tab) {
      _activeBmwSubTab = params.tab;
    }
    renderBase(container, 'bmw');
  };

  window.views.housekeeping = function (container) {
    renderBase(container, 'dashboard');
  };

  // ──────────────────────────────────────────────────────────────────────────
  // DATE & TIME FORMATTERS
  // ──────────────────────────────────────────────────────────────────────────
  function formatDateTime(dateStr) {
    if (!dateStr) return '--';
    var date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    var dd = String(date.getDate()).padStart(2, '0');
    var mon = months[date.getMonth()];
    var yyyy = date.getFullYear();
    var hh = String(date.getHours()).padStart(2, '0');
    var mm = String(date.getMinutes()).padStart(2, '0');
    return `${dd} ${mon} ${yyyy} · ${hh}:${mm}`;
  }

  function formatElapsed(dateStr) {
    if (!dateStr) return '--';
    var elapsedMs = Date.now() - new Date(dateStr).getTime();
    var totalMin = Math.floor(elapsedMs / 60000);
    if (totalMin < 0) return '0 min';
    if (totalMin < 60) return `${totalMin} min`;
    var hrs = Math.floor(totalMin / 60);
    var mins = totalMin % 60;
    return `${hrs}h ${mins}m`;
  }

  function renderBase(container, activeTab) {
    _activeTab = activeTab;

    // Safety check state collections
    if (window.state) {
      if (!window.state.housekeepingTasks) window.state.housekeepingTasks = [];
      if (!window.state.laundryLinenStock) {
        window.state.laundryLinenStock = [
          { item: "Double Bed Sheets", available: 180, dirty: 45, minStock: 50 },
          { item: "Pillow Covers", available: 220, dirty: 60, minStock: 60 },
          { item: "OT Towels", available: 95, dirty: 15, minStock: 30 },
          { item: "Doctor Gowns", available: 54, dirty: 8, minStock: 20 }
        ];
      }
      if (!window.state.laundryBatches) window.state.laundryBatches = [];
      if (!window.state.cssdTrays) {
        window.state.cssdTrays = [
          { trayId: "TRY-ORTH-001", trayName: "Ortho Surgical Kit A", instruments: [{ name: "Bone Drill", count: 1 }, { name: "Ortho Forceps", count: 2 }, { name: "Bone Mallet", count: 1 }], department: "OT Complex", method: "Steam", lastSterilized: "2026-07-02 · 10:00", validUntil: "2026-07-09 · 10:00", cycleCount: 28, status: "Available", rackLocation: "Rack A - Shelf 2" },
          { trayId: "TRY-GENS-002", trayName: "General Surgery Pack", instruments: [{ name: "Scalpel Handle", count: 2 }, { name: "Artery Forceps", count: 6 }, { name: "Suture Scissors", count: 2 }], department: "IPD Wards", method: "Steam", lastSterilized: "2026-06-25 · 08:30", validUntil: "2026-07-02 · 08:30", cycleCount: 45, status: "Expired", rackLocation: "Rack B - Shelf 1" },
          { trayId: "TRY-CARD-003", trayName: "Cardio Surgical Tray B", instruments: [{ name: "Sternal Saw", count: 1 }, { name: "Rib Retractor", count: 1 }, { name: "Needle Holder", count: 4 }], department: "OT Complex", method: "Plasma", lastSterilized: "2026-07-04 · 14:00", validUntil: "2026-08-03 · 14:00", cycleCount: 12, status: "Issued", rackLocation: "Rack C - Shelf 3" },
          { trayId: "TRY-DENT-004", trayName: "Dental Extraction Set", instruments: [{ name: "Dental Elevators", count: 3 }, { name: "Extraction Forceps", count: 4 }], department: "OPD Clinics", method: "EO", lastSterilized: "2026-06-10 · 11:15", validUntil: "2026-07-10 · 11:15", cycleCount: 8, status: "Returned (Dirty)", rackLocation: "—" },
          { trayId: "TRY-PLAS-005", trayName: "Endoscopy Camera Set", instruments: [{ name: "Endoscope Camera", count: 1 }, { name: "Light Source Cable", count: 1 }], department: "OT Complex", method: "Plasma", lastSterilized: "—", validUntil: "—", cycleCount: 52, status: "Decontamination", rackLocation: "—" },
          { trayId: "TRY-QUAR-006", trayName: "Micro-Surgical Kit", instruments: [{ name: "Micro Scissors", count: 2 }, { name: "Micro Forceps", count: 3 }], department: "OT Complex", method: "Plasma", lastSterilized: "2026-07-03 · 17:00", validUntil: "2026-08-02 · 17:00", cycleCount: 19, status: "Quarantine", rackLocation: "Quarantine Area Rack Q" }
        ];
      }
      if (!window.state.cssdCollections) {
        window.state.cssdCollections = [
          { reqId: "REQ-CS-101", date: "2026-07-04 · 18:00", requestedBy: "Sister Mercy", department: "ICU Ward", trayName: "General Surgery Pack", qty: 1, urgency: "Routine", status: "Pending", remarks: "Required for dressing change." },
          { reqId: "REQ-CS-102", date: "2026-07-04 · 22:30", requestedBy: "OT Nurse Mini", department: "OT Complex", trayName: "Ortho Surgical Kit A", qty: 1, urgency: "Emergency", status: "Pending", remarks: "Emergency trauma case backup." },
          { reqId: "REQ-CS-100", date: "2026-07-04 · 14:00", requestedBy: "Sister Mini", department: "OT Complex", trayName: "Dental Extraction Set", qty: 1, urgency: "Routine", status: "Received", remarks: "Routine post-op return." }
        ];
      }
      if (!window.state.cssdDeconLogs) {
        window.state.cssdDeconLogs = [
          { trayId: "TRY-PLAS-005", receivedAt: "2026-07-04 · 19:00", receivedFrom: "OT Complex", receivedBy: "Technician Raj", solution: "Enzymatic Multi-Zyme 2%", duration: 20, grossSoil: "Yes", operator: "Technician Raj", isInfectious: false, remarks: "Routine post-op camera clean." }
        ];
      }
      if (!window.state.cssdCleaningLogs) {
        window.state.cssdCleaningLogs = [
          { trayId: "TRY-PLAS-005", method: "Both", machine: "Ultrasonic Washer 02", duration: 15, agent: "Neutral Detergent", operator: "Technician Raj", inspection: "Pass", missingPieces: 0, remarks: "All pieces accounted for and functional." }
        ];
      }
      if (!window.state.cssdPackingLogs) {
        window.state.cssdPackingLogs = [
          { trayId: "TRY-PLAS-005", packType: "Rigid Container", packedBy: "Technician Raj", packDate: "2026-07-04 · 21:00", chemicalIndicator: "Yes", labelDetails: "Endoscopy Camera Set - Pack Date: 2026-07-04" }
        ];
      }
      if (!window.state.cssdCycles) {
        window.state.cssdCycles = [
          { cycleId: "CYC-CS-801", machineId: "Steam Autoclave 01", method: "Steam", cycleNo: 1420, loadContents: "TRY-ORTH-001, TRY-GENS-002", startTime: "2026-07-04 · 16:00", endTime: "2026-07-04 · 17:30", temp: 134, pressure: 2.1, exposureTime: 30, biPlaced: "Yes", biResult: "Pass", ciResult: "Pass", bowieDick: "Pass", operator: "Technician Raj", releaseStatus: "Released", releasedBy: "Supervisor Satish" },
          { cycleId: "CYC-CS-802", machineId: "Plasma Sterilizer 02", method: "Plasma", cycleNo: 392, loadContents: "TRY-PLAS-005", startTime: "2026-07-04 · 22:00", endTime: "2026-07-04 · 23:15", temp: 50, pressure: 0, exposureTime: 45, biPlaced: "Yes", biResult: "Pending", ciResult: "Pass", bowieDick: "N/A", operator: "Technician Raj", releaseStatus: "Pending Release", releasedBy: "" }
        ];
      }
      if (!window.state.cssdIssues) {
        window.state.cssdIssues = [
          { issueId: "ISS-CS-901", date: "2026-07-04 · 15:00", department: "OT Complex", requestedBy: "Sister Mini", trayId: "TRY-CARD-003", batchRef: "CYC-CS-799", expiryDate: "2026-08-03", issuedBy: "Technician Raj", status: "Acknowledged" }
        ];
      }
      if (!window.state.cssdReturns) {
        window.state.cssdReturns = [
          { returnId: "RET-CS-501", date: "2026-07-04 · 13:30", returnedFrom: "OPD Clinics", returnedBy: "Sister Sandhya", trayId: "TRY-DENT-004", piecesReturned: 7, piecesMissing: 0, condition: "Good", status: "Processed" }
        ];
      }
      if (!window.state.cssdQuarantines) {
        window.state.cssdQuarantines = [
          { trayId: "TRY-QUAR-006", reason: "Biological Indicator Failure in Batch CYC-CS-800", quarantinedBy: "Supervisor Satish", date: "2026-07-04 · 12:00", notes: "Awaiting re-sterilization after biological test confirm.", owner: "Supervisor Satish", status: "Active" }
        ];
      }
      if (!window.state.cssdAuditLogs) {
        window.state.cssdAuditLogs = [
          { txId: "TX-CS-001", user: "System", role: "System", action: "AUTO_EXPIRE", code: "TRY-GENS-002", fromState: "Available", toState: "Expired", timestamp: "2026-07-02 · 08:30", remarks: "Sterility validity date passed. Item marked Expired and blocked." }
        ];
      }
      if (window.state.cssdOverdueReturnsAlert === undefined) {
        window.state.cssdOverdueReturnsAlert = "Alert: 2 Ortho kits overdue for return from Ward-3 since yesterday.";
      }
      if (window.state.bmwVendorOverdue === undefined) window.state.bmwVendorOverdue = true;
      if (!window.state.bmwBags) {
        window.state.bmwBags = [
          { bagId: "BAG-BMW-101", category: "Yellow", weight: 4.5, department: "OT Complex", collectedAt: "2026-07-04 · 12:00", status: "TSA", infectious: true, source: "OT", timeInTsa: new Date(Date.now() - 30 * 3600000).toISOString(), bagCount: 1, storageLocation: "Bin Y-1" },
          { bagId: "BAG-BMW-102", category: "Red", weight: 6.2, department: "ICU Ward", collectedAt: "2026-07-04 · 14:00", status: "TSA", infectious: false, source: "ICU", timeInTsa: new Date(Date.now() - 20 * 3600000).toISOString(), bagCount: 2, storageLocation: "Bin R-2" },
          { bagId: "BAG-BMW-103", category: "White", weight: 1.5, department: "OPD Clinics", collectedAt: "2026-07-04 · 18:30", status: "TSA", infectious: false, source: "OPD", timeInTsa: new Date(Date.now() - 4 * 3600000).toISOString(), bagCount: 1, storageLocation: "Puncture Proof Closet" },
          { bagId: "BAG-BMW-104", category: "Yellow", weight: 3.0, department: "Isolation Room", collectedAt: "2026-07-02 · 10:00", status: "TSA", infectious: true, source: "Isolation", timeInTsa: new Date(Date.now() - 50 * 3600000).toISOString(), bagCount: 1, storageLocation: "Refrigerated Room" }
        ];
      }
      if (!window.state.bmwLogs) {
        window.state.bmwLogs = [
          { logId: "LOG-BMW-001", date: "2026-07-04 · 21:00", department: "ICU Ward", generatedBy: "Sister Mercy", category: "Red", weight: 3.5, bagCount: 1, infectious: false, source: "ICU", status: "Logged" },
          { logId: "LOG-BMW-002", date: "2026-07-04 · 22:30", department: "OT Complex", generatedBy: "OT Nurse Mini", category: "Yellow", weight: 5.0, bagCount: 2, infectious: true, source: "OT", status: "Logged" }
        ];
      }
      if (!window.state.bmwManifests) {
        window.state.bmwManifests = [
          { manifestId: "BMW-MF-901", date: "2026-07-03 · 16:30", totalBags: 3, totalWeight: 14.5, transporter: "CBWTF Maruthi Waste Care", vehicle: "KA-04-A-1234", driver: "Ravi Kumar", authCert: "AUTH-BMW-2026-01", status: "Dispatched", categoryQuantities: "Yellow: 8.5kg, Red: 6kg" }
        ];
      }
      if (!window.state.bmwConfirmations) {
        window.state.bmwConfirmations = [
          { confirmationId: "CONF-BMW-801", manifestNo: "BMW-MF-900", certNo: "CERT-BMW-7761", method: "Incineration", disposalDate: "2026-07-02 · 15:00", confirmedBy: "Supervisor Ramesh", remarks: "All items disposed and autoclaved according to CPCB protocol." }
        ];
      }
      if (!window.state.bmwNonCompliances) {
        window.state.bmwNonCompliances = [
          { eventId: "ERR-BMW-501", type: "TSA Overdue (>48 hrs)", triggeredBy: "System", timestamp: "2026-07-04 · 10:00", department: "TSA Room", description: "Yellow bag BAG-BMW-104 exceeded 48-hour storage limit.", assignedTo: "Supervisor Ramesh", status: "Open" }
        ];
      }
      if (!window.state.bmwRefrigerators) {
        window.state.bmwRefrigerators = [
          { fridgeId: "REF-BMW-01", temp: 3.8, timestamp: "2026-07-04 · 22:00", status: "Normal" }
        ];
      }
      if (!window.state.bmwAuditLogs) {
        window.state.bmwAuditLogs = [
          { txId: "TX-BMW-001", user: "System", role: "System", action: "TSA_BREACH", category: "Yellow", department: "TSA Room", weight: 3.0, fromState: "TSA", toState: "TSA_BREACH", timestamp: "2026-07-04 · 10:00", remarks: "BAG-BMW-104 exceeded 48-hour temporary storage limit. Non-compliance alert sent." }
        ];
      }
      if (!window.state.hkSchedules) {
        window.state.hkSchedules = [
          { areaName: "OPD Waiting Area", frequency: "Daily", times: "07:00, 13:00, 19:00", zone: "OPD Zone", staff: "Ramu K.", nextDue: new Date(Date.now() + 7200000).toISOString(), lastCompleted: new Date(Date.now() - 14400000).toISOString(), status: "Active" },
          { areaName: "Corridors", frequency: "Daily", times: "06:00, 18:00", zone: "General Zone", staff: "Somu L.", nextDue: new Date(Date.now() - 900000).toISOString(), lastCompleted: new Date(Date.now() - 36000000).toISOString(), status: "Missed" },
          { areaName: "ICU", frequency: "Daily", times: "06:00, 14:00", zone: "ICU Zone", staff: "Ajay S.", nextDue: new Date(Date.now() + 3600000).toISOString(), lastCompleted: new Date(Date.now() - 28800000).toISOString(), status: "Active" }
        ];
      }
      if (!window.state.hkInspections) {
        window.state.hkInspections = [
          { id: "INSP-501", area: "IPD Wards", date: new Date().toISOString().slice(0, 10), shift: "Morning", inspector: "Manager Satish", score: 4.8, threshold: 3.5, remarks: "Excellent cleanliness maintained." },
          { id: "INSP-502", area: "OPD Waiting Area", date: new Date().toISOString().slice(0, 10), shift: "Morning", inspector: "Manager Satish", score: 2.8, threshold: 3.5, remarks: "Dust on chairs. Cleanliness scores breached threshold.", rootCause: "Lack of cleaning consumables in OPD closet." }
        ];
      }
      if (!window.state.linenItems) {
        window.state.linenItems = [
          { code: "LN-001", name: "Double Bed Sheet - Premium", category: "Bed Sheet", size: "Double", department: "ICU Ward", status: "Available", barcode: "BC-10029", vendor: "Kurl-On India", purchaseDate: "2025-05-12", maxWashCount: 100, currentWashCount: 92 },
          { code: "LN-002", name: "Pillow Cover - Cotton", category: "Pillow Cover", size: "Standard", department: "IPD Wards", status: "Issued", barcode: "BC-20091", vendor: "Bombay Dyeing", purchaseDate: "2025-06-20", maxWashCount: 80, currentWashCount: 20 },
          { code: "LN-003", name: "OT Towel - Surgical Green", category: "OT Towel", size: "Medium", department: "OT Complex", status: "Dirty", barcode: "BC-30042", vendor: "Trident Group", purchaseDate: "2025-04-10", maxWashCount: 150, currentWashCount: 150 },
          { code: "LN-004", name: "Doctor Gown - Sterile", category: "Doctor Gown", size: "Large", department: "OT Complex", status: "Processing", barcode: "BC-40018", vendor: "Trident Group", purchaseDate: "2025-07-01", maxWashCount: 120, currentWashCount: 10 },
          { code: "LN-005", name: "Single Bed Sheet - Standard", category: "Bed Sheet", size: "Single", department: "General Ward", status: "Ready", barcode: "BC-10087", vendor: "Bombay Dyeing", purchaseDate: "2025-01-15", maxWashCount: 90, currentWashCount: 90 },
          { code: "LN-006", name: "Patient Gown - Blue Striped", category: "Patient Gown", size: "Medium", department: "Pediatric Ward", status: "Damaged", barcode: "BC-50023", vendor: "LinenCraft India", purchaseDate: "2025-08-11", maxWashCount: 110, currentWashCount: 109 },
          { code: "LN-007", name: "OT Drape - Impervious", category: "OT Drape", size: "Large", department: "OT Complex", status: "Condemned", barcode: "BC-60099", vendor: "Kurl-On India", purchaseDate: "2025-03-05", maxWashCount: 100, currentWashCount: 100 },
          { code: "LN-008", name: "Bed Sheet - General", category: "Bed Sheet", size: "Single", department: "Emergency", status: "With Vendor", barcode: "BC-10045", vendor: "Bombay Dyeing", purchaseDate: "2025-09-01", maxWashCount: 80, currentWashCount: 45 }
        ];
      }
      if (!window.state.linenRequests) {
        window.state.linenRequests = [
          { reqNo: "REQ-LN-204", date: "2026-07-04 · 10:15", requestedBy: "Sister Mercy", department: "ICU Ward", category: "Bed Sheet", qty: 25, remarks: "Fresh set needed for post-op admissions.", status: "Pending Approval" },
          { reqNo: "REQ-LN-203", date: "2026-07-04 · 09:30", requestedBy: "OT Nurse Mini", department: "OT Complex", category: "OT Towel", qty: 15, remarks: "Immediate refill for morning surgeries.", status: "Approved" },
          { reqNo: "REQ-LN-202", date: "2026-07-04 · 08:45", requestedBy: "Sister Sandhya", department: "IPD Wards", category: "Pillow Cover", qty: 40, remarks: "Weekly linen exchange.", status: "Acknowledged" }
        ];
      }
      if (!window.state.dirtyCollections) {
        window.state.dirtyCollections = [
          { colId: "COL-DIR-401", dateTime: "2026-07-04 · 20:00", department: "IPD Wards", collectedBy: "Operator Somu", totalPieces: 45, infectedQty: 10, nonInfectedQty: 35, infectionType: "MRSA", remarks: "Separate plastic bags used for infected items.", status: "Collected" },
          { colId: "COL-DIR-402", dateTime: "2026-07-04 · 18:30", department: "OT Complex", collectedBy: "Operator Ramu", totalPieces: 30, infectedQty: 30, nonInfectedQty: 0, infectionType: "Hepatitis B", remarks: "All items marked highly infected.", status: "Processing" },
          { colId: "COL-DIR-403", dateTime: "2026-07-04 · 17:15", department: "Emergency", collectedBy: "Pending Collection", totalPieces: 15, infectedQty: 0, nonInfectedQty: 15, infectionType: "", remarks: "General cleaning collection overdue.", status: "Pending" }
        ];
      }
      if (!window.state.laundryMachines) {
        window.state.laundryMachines = [
          { name: "Autoclave Washer 01", type: "Industrial Washer", status: "Washing", load: 85, cycleCount: 420, threshold: 500, serviceDue: false },
          { name: "Steam Dryer 02", type: "Tumbler Dryer", status: "Idle", load: 0, cycleCount: 495, threshold: 500, serviceDue: true },
          { name: "Flatwork Ironer 03", type: "Ironer/Folder", status: "Active", load: 60, cycleCount: 150, threshold: 300, serviceDue: false }
        ];
      }
      if (!window.state.laundryDispatches) {
        window.state.laundryDispatches = [
          { dispatchId: "DSP-LND-901", fromBatch: "BAT-LND-303", dispatchTo: "ICU Ward", category: "Bed Sheet", qty: 20, receivedBy: "Sister Mercy", remarks: "Dispatched clean linens successfully.", dispatchTime: "2026-07-04 · 22:15", status: "Pending Acknowledgment" },
          { dispatchId: "DSP-LND-900", fromBatch: "BAT-LND-300", dispatchTo: "IPD Wards", category: "Pillow Cover", qty: 35, receivedBy: "Sister Sandhya", remarks: "Handover complete.", dispatchTime: "2026-07-04 · 18:00", status: "Acknowledged" }
        ];
      }
      if (!window.state.linenReturns) {
        window.state.linenReturns = [
          { returnId: "RET-LND-501", returnDate: "2026-07-04 · 21:00", returnedFrom: "Emergency", returnedBy: "Sister Mini", category: "Doctor Gown", qty: 5, condition: "Clean / Unused", inspectedBy: "Supervisor Satish", action: "Returned to Stock", remarks: "Excess gowns from day shift." },
          { returnId: "RET-LND-502", returnDate: "2026-07-04 · 19:30", returnedFrom: "ICU Ward", returnedBy: "Sister Mercy", category: "Bed Sheet", qty: 3, condition: "Damaged", inspectedBy: "Supervisor Satish", action: "Routed to Repair", remarks: "Tear noticed near seam." }
        ];
      }
      if (!window.state.linenRepairs) {
        window.state.linenRepairs = [
          { repairId: "REP-LND-601", linenCode: "LN-006", linenName: "Patient Gown - Blue Striped", damageType: "Tear / Rip", foundAtStage: "Ironing / Folding", loggedBy: "Operator Somu", desc: "Large tear on back seam.", status: "In Repair" },
          { repairId: "REP-LND-602", linenCode: "LN-003", linenName: "OT Towel - Surgical Green", damageType: "Stain Unremovable", foundAtStage: "Washing", loggedBy: "Operator Ramu", desc: "Chemical stain from antiseptic.", status: "Irreparable" }
        ];
      }
      if (!window.state.condemnations) {
        window.state.condemnations = [
          { condemnId: "CND-LND-701", linenCode: "LN-007", linenName: "OT Drape - Impervious", reason: "Manual flag — Infection risk", approver: "HK Manager Satish", dateApproved: "2026-07-03", status: "Approved" }
        ];
      }
      if (!window.state.vendorLaundry) {
        window.state.vendorLaundry = [
          { vReqId: "VEN-LND-801", vendorName: "QuickClean Commercial Laundry", category: "Bed Sheet", qtySent: 150, pickupDate: "2026-07-02", expectedReturnDate: "2026-07-04", remarks: "Bulk washing contract.", status: "Overdue" },
          { vReqId: "VEN-LND-802", vendorName: "MedLinen Services", category: "Doctor Gown", qtySent: 50, pickupDate: "2026-07-03", expectedReturnDate: "2026-07-05", remarks: "Special sterilization wash.", status: "Sent" }
        ];
      }
      if (!window.state.laundryAuditLogs) {
        window.state.laundryAuditLogs = [
          { txId: "TX-LND-001", user: "System", role: "System", action: "AUTO_FLAG", linenCode: "LN-003", fromState: "Dirty", toState: "Dirty", timestamp: "2026-07-04 · 21:00", remarks: "Max wash count reached. Flagged for condemnation." },
          { txId: "TX-LND-002", user: "Supervisor Satish", role: "Laundry Supervisor", action: "LINEN_ISSUE", linenCode: "LN-002", fromState: "Available", toState: "Issued", timestamp: "2026-07-04 · 10:30", remarks: "Approved request REQ-LN-203." }
        ];
      }
    }
    
    // Auto-refresh logic (every 60s)
    if (!window._hkRefreshInterval) {
      window._hkRefreshInterval = setInterval(function() {
        if (window.router && window.router.currentPage && (
            window.router.currentPage.toLowerCase().includes('housekeeping') || 
            window.router.currentPage === 'laundry' || 
            window.router.currentPage === 'cssd' || 
            window.router.currentPage === 'bmw')) {
          draw();
        }
      }, 60000);
    }

    draw();

    function draw() {
      container.innerHTML = `
        <div class="hk-workspace" style="font-family:'Inter',sans-serif; text-align:left; width:100%; box-sizing:border-box; display:flex; flex-direction:column; gap:20px; padding:0;">
          
          <!-- Alert Notification banner (Supervisor Warning) -->
          ${renderSupervisorAlerts()}

          <!-- Tab Viewports -->
          <div class="hk-tab-viewport">
            ${activeTab === 'dashboard' ? renderDashboard() : ''}
            ${activeTab === 'operations' ? renderOperationsWorkspace() : ''}
            ${activeTab === 'laundry' ? renderLaundryWorkspace() : ''}
            ${activeTab === 'cssd' ? renderCssdWorkspace() : ''}
            ${activeTab === 'bmw' ? renderBmwWorkspace() : ''}
          </div>
          
          <!-- Dialog overlays -->
          ${renderModalOverlay()}
        </div>
      `;
    }

    // ──────────────────────────────────────────────────────────────────────────
    // SUPERVISOR NOTIFICATION HELD ALERTS
    // ──────────────────────────────────────────────────────────────────────────
    function renderSupervisorAlerts() {
      var warnings = [];
      var tasks = window.state.housekeepingTasks || [];
      var slas = window.state.hkSlaSettings || {};

      // 1. Unassigned tasks older than 10 minutes
      var tenMinsAgo = Date.now() - 600000;
      var unassignedOld = tasks.filter(t => t.status === 'New' && new Date(t.createdTime).getTime() < tenMinsAgo);
      if (unassignedOld.length > 0) {
        warnings.push(`⚠️ ALERT: There are ${unassignedOld.length} unassigned cleaning requests pending for > 10 minutes (Supervisor Action Required).`);
      }

      // 2. Overdue tasks (>SLA limit)
      var overdueCount = 0;
      tasks.forEach(t => {
        if (t.status !== 'Verified' && t.status !== 'Closed' && t.status !== 'Cancelled') {
          var limitMin = slas[t.type] || 60;
          var elapsedMs = Date.now() - new Date(t.createdTime).getTime();
          if (elapsedMs > limitMin * 60000) {
            overdueCount++;
          }
        }
      });
      if (overdueCount > 0) {
        warnings.push(`🚨 CRITICAL: ${overdueCount} environmental tasks have breached SLA threshold constraints.`);
      }

      // 3. Isolation room tasks pending IC Nurse validation sign-off
      var pendingIcSignOff = tasks.filter(t => t.type === 'Isolation Room Cleaning' && t.status === 'Completed' && !t.icNurseSigned);
      if (pendingIcSignOff.length > 0) {
        warnings.push(`☣️ ISOLATION GATES: ${pendingIcSignOff.length} isolation cleaning tasks are awaiting IC Nurse credentials validation and countersignature.`);
      }

      if (warnings.length === 0) return '';

      return `
        <div class="hk-alert-banner" style="display:flex; flex-direction:column; gap:8px; background:#fef2f2; border:1.5px solid #fecaca; padding:12px 16px; border-radius:8px; text-align:left;">
          ${warnings.map(w => `<div style="font-size:12px; font-weight:700; color:#b91c1c; display:flex; align-items:center; gap:6px;">${w}</div>`).join('')}
        </div>
      `;
    }

    // ──────────────────────────────────────────────────────────────────────────
    // TAB 1: PARENT DASHBOARD
    // ──────────────────────────────────────────────────────────────────────────
    function renderDashboard() {
      var tasks = window.state.housekeepingTasks || [];
      var slas = window.state.hkSlaSettings || {};
      
      var overdueTasks = 0;
      tasks.forEach(t => {
        if (t.status !== 'Verified' && t.status !== 'Closed' && t.status !== 'Cancelled') {
          var limitMin = slas[t.type] || 60;
          var elapsedMs = Date.now() - new Date(t.createdTime).getTime();
          if (elapsedMs > limitMin * 60000) overdueTasks++;
        }
      });

      var laundryStock = window.state.laundryLinenStock || [];
      var cssdLoads = window.state.cssdActiveSterilizations || [];
      var bmwBags = window.state.bmwBags || [];

      var totalLinenClean = laundryStock.reduce((acc, s) => acc + s.available, 0);
      var totalLinenDirty = laundryStock.reduce((acc, s) => acc + s.dirty, 0);
      var cssdActiveCount = cssdLoads.filter(s => s.stage !== 'Ready').length;
      var cssdExpiredCount = cssdLoads.filter(s => s.expired).length;
      var bmwBagsCount = bmwBags.length;
      var bmwOverdueCount = bmwBags.filter(b => (Date.now() - new Date(b.collectedAt).getTime()) > 4 * 3600000).length;

      var beds = Object.keys(window.state.bedsStatus || {});
      var totalIpdBeds = beds.length;
      var readyBeds = beds.filter(b => window.state.bedsStatus[b].status === 'Available' || window.state.bedsStatus[b].status === 'Ready').length;

      return `
        <div style="display:grid; grid-template-columns: repeat(8, 1fr); gap: 10px; margin-bottom: 20px;">
          <div class="card" style="padding: 12px; text-align:left; border-top: 3.5px solid var(--primary);">
            <div style="font-size: 8.5px; font-weight:700; color:var(--text-secondary); text-transform:uppercase;">HK Active Tasks</div>
            <div style="font-size: 20px; font-weight:900; color:var(--primary); font-family:monospace; margin-top:2px;">${tasks.filter(t => t.status !== 'Verified' && t.status !== 'Closed' && t.status !== 'Cancelled').length}</div>
            <div style="font-size: 8.5px; color:var(--text-muted); margin-top:2px;">${tasks.filter(t => t.status === 'New').length} Pending</div>
          </div>
          <div class="card" style="padding: 12px; text-align:left; border-top: 3.5px solid #ef4444;">
            <div style="font-size: 8.5px; font-weight:700; color:var(--text-secondary); text-transform:uppercase;">SLA Breaches</div>
            <div style="font-size: 20px; font-weight:900; color:#ef4444; font-family:monospace; margin-top:2px;">${overdueTasks}</div>
            <div style="font-size: 8.5px; color:var(--text-muted); margin-top:2px;">Active Breached</div>
          </div>
          <div class="card" style="padding: 12px; text-align:left; border-top: 3.5px solid #10b981;">
            <div style="font-size: 8.5px; font-weight:700; color:var(--text-secondary); text-transform:uppercase;">Linen Available</div>
            <div style="font-size: 20px; font-weight:900; color:#10b981; font-family:monospace; margin-top:2px;">${totalLinenClean}</div>
            <div style="font-size: 8.5px; color:var(--text-muted); margin-top:2px;">In Sterile Store</div>
          </div>
          <div class="card" style="padding: 12px; text-align:left; border-top: 3.5px solid #f59e0b;">
            <div style="font-size: 8.5px; font-weight:700; color:var(--text-secondary); text-transform:uppercase;">Linen Processing</div>
            <div style="font-size: 20px; font-weight:900; color:#f59e0b; font-family:monospace; margin-top:2px;">${totalLinenDirty}</div>
            <div style="font-size: 8.5px; color:var(--text-muted); margin-top:2px;">Dirty Pending</div>
          </div>
          <div class="card" style="padding: 12px; text-align:left; border-top: 3.5px solid #3b82f6;">
            <div style="font-size: 8.5px; font-weight:700; color:var(--text-secondary); text-transform:uppercase;">CSSD Active</div>
            <div style="font-size: 20px; font-weight:900; color:#3b82f6; font-family:monospace; margin-top:2px;">${cssdActiveCount}</div>
            <div style="font-size: 8.5px; color:var(--text-muted); margin-top:2px;">In Sterilization</div>
          </div>
          <div class="card" style="padding: 12px; text-align:left; border-top: 3.5px solid #ef4444;">
            <div style="font-size: 8.5px; font-weight:700; color:var(--text-secondary); text-transform:uppercase;">Sterility Expired</div>
            <div style="font-size: 20px; font-weight:900; color:#ef4444; font-family:monospace; margin-top:2px;">${cssdExpiredCount}</div>
            <div style="font-size: 8.5px; color:var(--text-muted); margin-top:2px;">Action Required</div>
          </div>
          <div class="card" style="padding: 12px; text-align:left; border-top: 3.5px solid #8b5cf6;">
            <div style="font-size: 8.5px; font-weight:700; color:var(--text-secondary); text-transform:uppercase;">BMW Pending</div>
            <div style="font-size: 20px; font-weight:900; color:#8b5cf6; font-family:monospace; margin-top:2px;">${bmwBagsCount}</div>
            <div style="font-size: 8.5px; color:var(--text-muted); margin-top:2px;">Bags in Ledger</div>
          </div>
          <div class="card" style="padding: 12px; text-align:left; border-top: 3.5px solid #ef4444;">
            <div style="font-size: 8.5px; font-weight:700; color:var(--text-secondary); text-transform:uppercase;">BMW Overdue</div>
            <div style="font-size: 20px; font-weight:900; color:#ef4444; font-family:monospace; margin-top:2px;">${bmwOverdueCount}</div>
            <div style="font-size: 8.5px; color:var(--text-muted); margin-top:2px;">Breached > 4h</div>
          </div>
        </div>

        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:20px; text-align:left; margin-bottom:20px;">
          <!-- Panel 1: Housekeeping Operations -->
          <div class="card" style="display:flex; flex-direction:column;">
            <div class="card-header" style="background:#f8fafc; border-bottom:1px solid var(--border-color); padding: 10px 15px; display:flex; justify-content:space-between; align-items:center;">
              <h3 style="margin:0; font-size:13.5px; font-weight:800; color:var(--primary);">🧹 Housekeeping Operations Overview</h3>
              <span class="badge badge-success" style="font-family:monospace; font-size:11px;">Beds Ready: ${readyBeds} / ${totalIpdBeds}</span>
            </div>
            <div style="padding: 15px; display:flex; flex-direction:column; gap:12px; flex:1;">
              <div style="display:grid; grid-template-columns:repeat(4, 1fr); gap:8px; text-align:center;">
                <div style="background:#eff6ff; border:1px solid #bfdbfe; border-radius:6px; padding:6px;">
                  <div style="font-size:15px; font-weight:800; font-family:monospace; color:#1e40af;">${tasks.filter(t=>t.status==='New').length}</div>
                  <div style="font-size:8.5px; color:#2563eb; font-weight:700; text-transform:uppercase;">Pending</div>
                </div>
                <div style="background:#fffbeb; border:1px solid #fde68a; border-radius:6px; padding:6px;">
                  <div style="font-size:15px; font-weight:800; font-family:monospace; color:#92400e;">${tasks.filter(t=>t.status==='In Progress' || t.status==='Assigned').length}</div>
                  <div style="font-size:8.5px; color:#d97706; font-weight:700; text-transform:uppercase;">In Progress</div>
                </div>
                <div style="background:#f0fdf4; border:1px solid #bbf7d0; border-radius:6px; padding:6px;">
                  <div style="font-size:15px; font-weight:800; font-family:monospace; color:#166534;">${tasks.filter(t=>t.status==='Completed' || t.status==='Verified').length}</div>
                  <div style="font-size:8.5px; color:#16a34a; font-weight:700; text-transform:uppercase;">Completed</div>
                </div>
                <div style="background:#fef2f2; border:1px solid #fecaca; border-radius:6px; padding:6px;">
                  <div style="font-size:15px; font-weight:800; font-family:monospace; color:#991b1b;">${overdueTasks}</div>
                  <div style="font-size:8.5px; color:#dc2626; font-weight:700; text-transform:uppercase;">Overdue</div>
                </div>
              </div>

              <div class="custom-table-container" style="max-height: 250px; overflow-y: auto;">
                <table class="custom-table" style="font-size:11px;">
                  <thead>
                    <tr>
                      <th>Task Type</th>
                      <th>Location</th>
                      <th>Assigned To</th>
                      <th>Status</th>
                      <th>Raised At</th>
                      <th>Elapsed</th>
                      <th>SLA</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${tasks.slice(0, 5).map(t => {
                      var limitMin = slas[t.type] || 60;
                      var elapsedMs = Date.now() - new Date(t.createdTime).getTime();
                      var elapsedMin = Math.floor(elapsedMs / 60000);
                      var isOverdue = (t.status !== 'Verified' && t.status !== 'Closed' && t.status !== 'Cancelled') && (elapsedMin > limitMin);
                      var sourceLabel = t.source === 'System' || t.source === 'IPD' ? '<span class="badge badge-info" style="font-size:8px; padding:1px 3px;">Auto</span>' : '';
                      var lockIcon = (t.type === 'Isolation Room Cleaning' && !t.icNurseSigned) ? '🔒 ' : '';

                      return `
                        <tr style="background:${isOverdue ? '#fff5f5' : 'white'}; cursor:pointer;" onclick="window.router.navigate('housekeepingOperations')">
                          <td><strong>${lockIcon}${t.type}</strong> ${sourceLabel}</td>
                          <td style="font-family:monospace; font-weight:700;">${t.bedId}</td>
                          <td>${t.assignee || '<em>Unassigned</em>'}</td>
                          <td><span class="badge badge-secondary" style="font-size:9px;">${t.status}</span></td>
                          <td>${formatDateTime(t.createdTime)}</td>
                          <td style="color:${isOverdue ? '#b91c1c' : 'inherit'}; font-weight:${isOverdue ? '700' : 'normal'};">
                            ${isOverdue ? `Overdue (${formatElapsed(t.createdTime)})` : formatElapsed(t.createdTime)}
                          </td>
                          <td>
                            <span class="badge ${isOverdue ? 'badge-danger' : 'badge-success'}" style="font-size:8px;">
                              ${isOverdue ? 'Breached' : 'On Time'}
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

          <!-- Panel 2: Laundry & Linen -->
          <div class="card" style="display:flex; flex-direction:column;">
            <div class="card-header" style="background:#f8fafc; border-bottom:1px solid var(--border-color); padding: 10px 15px;">
              <h3 style="margin:0; font-size:13.5px; font-weight:800; color:var(--primary);">🧺 Laundry & Linen</h3>
            </div>
            <div style="padding: 15px; display:flex; flex-direction:column; gap:12px; flex:1;">
              ${window.state.laundryVendorOverdue ? `
                <div style="background:#fff3cd; border: 1px solid #ffeeba; padding:8px 12px; border-radius:6px; font-size:11px; color:#856404; font-weight:700; display:flex; justify-content:space-between; align-items:center;">
                  <span>⚠️ VENDOR NOTICE: Outgoing bulk laundry batch LND-B001 return is overdue from the external laundry supplier.</span>
                  <a href="#laundry" style="color:#856404; text-decoration:underline;">Inspect →</a>
                </div>
              ` : ''}

              <div style="display:grid; grid-template-columns:repeat(4, 1fr); gap:8px; text-align:center;">
                <div style="background:#f0fdf4; border:1px solid #bbf7d0; border-radius:6px; padding:6px;">
                  <div style="font-size:15px; font-weight:800; font-family:monospace; color:#166534;">${totalLinenClean}</div>
                  <div style="font-size:8.5px; color:#16a34a; font-weight:700; text-transform:uppercase;">Available</div>
                </div>
                <div style="background:#fef2f2; border:1px solid #fecaca; border-radius:6px; padding:6px;">
                  <div style="font-size:15px; font-weight:800; font-family:monospace; color:#991b1b;">${totalLinenDirty}</div>
                  <div style="font-size:8.5px; color:#dc2626; font-weight:700; text-transform:uppercase;">Dirty Pending</div>
                </div>
                <div style="background:#fffbeb; border:1px solid #fde68a; border-radius:6px; padding:6px;">
                  <div style="font-size:15px; font-weight:800; font-family:monospace; color:#92400e;">45</div>
                  <div style="font-size:8.5px; color:#d97706; font-weight:700; text-transform:uppercase;">In Processing</div>
                </div>
                <div style="background:#eff6ff; border:1px solid #bfdbfe; border-radius:6px; padding:6px;">
                  <div style="font-size:15px; font-weight:800; font-family:monospace; color:#1e40af;">95</div>
                  <div style="font-size:8.5px; color:#2563eb; font-weight:700; text-transform:uppercase;">Dispatch Ready</div>
                </div>
              </div>

              <div class="custom-table-container" style="max-height: 250px; overflow-y: auto;">
                <table class="custom-table" style="font-size:11px;">
                  <thead>
                    <tr>
                      <th>Department</th>
                      <th>Available</th>
                      <th>Status</th>
                      <th style="text-align:right;">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${window.state.laundryDeptStock.filter(s => s.status === 'Low' || s.status === 'Critical').map(s => `
                      <tr>
                        <td><strong>${s.dept}</strong></td>
                        <td style="font-family:monospace; font-weight:700;">${s.available} items <span style="font-size:9px; color:var(--text-muted);">/ ${s.minStock} min</span></td>
                        <td>
                          <span class="badge ${s.status === 'Critical' ? 'badge-danger' : 'badge-warning'}" style="font-size:8.5px;">
                            ${s.status}
                          </span>
                        </td>
                        <td style="text-align:right;">
                          <a href="#laundry" style="font-weight:700; color:var(--primary); font-size:10px;">Dispatch Linen →</a>
                        </td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:20px; text-align:left; margin-bottom:20px;">
          <!-- Panel 3: CSSD Sterilization -->
          <div class="card" style="display:flex; flex-direction:column;">
            <div class="card-header" style="background:#f8fafc; border-bottom:1px solid var(--border-color); padding: 10px 15px;">
              <h3 style="margin:0; font-size:13.5px; font-weight:800; color:var(--primary);">🧼 CSSD Sterilization</h3>
            </div>
            <div style="padding: 15px; display:flex; flex-direction:column; gap:12px; flex:1;">
              ${window.state.cssdOverdueReturnsAlert ? `
                <div style="background:#fef2f2; border: 1px solid #fecaca; padding:8px 12px; border-radius:6px; font-size:11px; color:#b91c1c; font-weight:700; display:flex; justify-content:space-between; align-items:center;">
                  <span>☣️ OVERDUE INSTRUMENTS: ${window.state.cssdOverdueReturnsAlert}</span>
                  <a href="#cssd" style="color:#b91c1c; text-decoration:underline;">Inspect →</a>
                </div>
              ` : ''}

              <div style="display:grid; grid-template-columns:repeat(4, 1fr); gap:8px; text-align:center;">
                <div style="background:#eff6ff; border:1px solid #bfdbfe; border-radius:6px; padding:6px;">
                  <div style="font-size:15px; font-weight:800; font-family:monospace; color:#1e40af;">2</div>
                  <div style="font-size:8.5px; color:#2563eb; font-weight:700; text-transform:uppercase;">Pending Collect</div>
                </div>
                <div style="background:#fffbeb; border:1px solid #fde68a; border-radius:6px; padding:6px;">
                  <div style="font-size:15px; font-weight:800; font-family:monospace; color:#92400e;">${cssdActiveCount}</div>
                  <div style="font-size:8.5px; color:#d97706; font-weight:700; text-transform:uppercase;">In Sterilization</div>
                </div>
                <div style="background:#f0fdf4; border:1px solid #bbf7d0; border-radius:6px; padding:6px;">
                  <div style="font-size:15px; font-weight:800; font-family:monospace; color:#166534;">18</div>
                  <div style="font-size:8.5px; color:#16a34a; font-weight:700; text-transform:uppercase;">Ready for Issue</div>
                </div>
                <div style="background:#fef2f2; border:1px solid #fecaca; border-radius:6px; padding:6px;">
                  <div style="font-size:15px; font-weight:800; font-family:monospace; color:#991b1b;">1</div>
                  <div style="font-size:8.5px; color:#dc2626; font-weight:700; text-transform:uppercase;">Overdue Return</div>
                </div>
              </div>

              <div class="custom-table-container" style="max-height: 250px; overflow-y: auto;">
                <table class="custom-table" style="font-size:11px;">
                  <thead>
                    <tr>
                      <th>Tray / Batch ID</th>
                      <th>Instrument Set</th>
                      <th>Stage</th>
                      <th>Requested By</th>
                      <th>Started At</th>
                      <th>ETA</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${cssdLoads.map(l => {
                      var isExpired = l.expired === true;
                      var nameText = isExpired ? `<span style="color:#b91c1c; font-weight:700;">[EXPIRED Sterile Validity] ${l.name}</span>` : l.name;
                      return `
                        <tr style="cursor:pointer;" onclick="window.router.navigate('cssd')">
                          <td style="font-family:monospace; font-weight:700; color:${isExpired ? '#b91c1c' : 'inherit'};">${l.id}</td>
                          <td>${nameText}</td>
                          <td><span class="badge badge-info" style="font-size:8.5px;">${l.stage}</span></td>
                          <td>${l.requestedBy}</td>
                          <td>${formatDateTime(l.startedAt)}</td>
                          <td>${formatDateTime(l.eta)}</td>
                          <td>
                            <span class="badge ${l.status === 'Delayed' || isExpired ? 'badge-danger' : 'badge-success'}" style="font-size:8.5px;">
                              ${isExpired ? 'EXPIRED' : l.status}
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

          <!-- Panel 4: Biomedical Waste -->
          <div class="card" style="display:flex; flex-direction:column;">
            <div class="card-header" style="background:#f8fafc; border-bottom:1px solid var(--border-color); padding: 10px 15px;">
              <h3 style="margin:0; font-size:13.5px; font-weight:800; color:var(--primary);">☣️ Biomedical Waste</h3>
            </div>
            <div style="padding: 15px; display:flex; flex-direction:column; gap:12px; flex:1;">
              <div style="display:flex; flex-direction:column; gap:6px;">
                ${window.state.bmwVendorOverdue ? `
                  <div style="background:#fef2f2; border: 1px solid #fecaca; padding:6px 12px; border-radius:6px; font-size:10.5px; color:#b91c1c; font-weight:700; display:flex; justify-content:space-between; align-items:center;">
                    <span>🚨 OVERDUE PICKUP: Authorized waste transporter pickup vehicle is overdue > 24h as per CPCB norms.</span>
                    <a href="#bmw" style="color:#b91c1c; text-decoration:underline;">Track Manifest →</a>
                  </div>
                ` : ''}
                ${Object.keys(window.state.bmwManifestSubmissions).some(k => window.state.bmwManifestSubmissions[k] === 'Missing') ? `
                  <div style="background:#fff3cd; border: 1px solid #ffeeba; padding:6px 12px; border-radius:6px; font-size:10.5px; color:#856404; font-weight:700; display:flex; justify-content:space-between; align-items:center;">
                    <span>⚠️ MANIFEST MISSING: Daily waste submission log missing from: <strong>${Object.keys(window.state.bmwManifestSubmissions).filter(k => window.state.bmwManifestSubmissions[k] === 'Missing').join(', ')}</strong>.</span>
                    <a href="#bmw" style="color:#856404; text-decoration:underline;">Re-query →</a>
                  </div>
                ` : ''}
              </div>

              <div style="display:grid; grid-template-columns:repeat(4, 1fr); gap:8px; text-align:center;">
                <div style="background:#eff6ff; border:1px solid #bfdbfe; border-radius:6px; padding:6px;">
                  <div style="font-size:15px; font-weight:800; font-family:monospace; color:#1e40af;">4</div>
                  <div style="font-size:8.5px; color:#2563eb; font-weight:700; text-transform:uppercase;">Pending Depts</div>
                </div>
                <div style="background:#f0fdf4; border:1px solid #bbf7d0; border-radius:6px; padding:6px;">
                  <div style="font-size:15px; font-weight:800; font-family:monospace; color:#166534;">35</div>
                  <div style="font-size:8.5px; color:#16a34a; font-weight:700; text-transform:uppercase;">Bags Picked Today</div>
                </div>
                <div style="background:#fffbeb; border:1px solid #fde68a; border-radius:6px; padding:6px;">
                  <div style="font-size:15px; font-weight:800; font-family:monospace; color:#92400e;">2</div>
                  <div style="font-size:8.5px; color:#d97706; font-weight:700; text-transform:uppercase;">Manifests Logged</div>
                </div>
                <div style="background:#fef2f2; border:1px solid #fecaca; border-radius:6px; padding:6px;">
                  <div style="font-size:15px; font-weight:800; font-family:monospace; color:#991b1b;">${bmwOverdueCount}</div>
                  <div style="font-size:8.5px; color:#dc2626; font-weight:700; text-transform:uppercase;">Overdue Bags</div>
                </div>
              </div>

              <div class="custom-table-container" style="max-height: 250px; overflow-y: auto;">
                <table class="custom-table" style="font-size:11px;">
                  <thead>
                    <tr>
                      <th>Department</th>
                      <th>Waste Category</th>
                      <th>Quantity (kg)</th>
                      <th>Marked At</th>
                      <th>Waiting</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${bmwBags.map(b => {
                      var elapsedMs = Date.now() - new Date(b.collectedAt).getTime();
                      var totalHrs = elapsedMs / 3600000;
                      var isOverdue = totalHrs > 4.0;
                      return `
                        <tr style="cursor:pointer;" onclick="window.router.navigate('bmw')">
                          <td><strong>${b.department}</strong></td>
                          <td>
                            <span style="font-weight:700; color:${b.category.includes('Red') ? '#b91c1c' : (b.category.includes('Yellow') ? '#d97706' : '#2563eb')};">
                              ${b.category}
                            </span>
                          </td>
                          <td style="font-family:monospace; font-weight:700;">${b.weight} kg</td>
                          <td>${formatDateTime(b.collectedAt)}</td>
                          <td style="color:${isOverdue ? '#b91c1c' : 'inherit'}; font-weight:${isOverdue ? '800' : 'normal'}; font-family:monospace;">
                            ${formatElapsed(b.collectedAt)}
                          </td>
                          <td>
                            <span class="badge ${isOverdue ? 'badge-danger' : 'badge-warning'}" style="font-size:8.5px;">
                              ${isOverdue ? 'CPCB Overdue > 4h' : 'Pending'}
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
        </div>

        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:20px; text-align:left;">
          <!-- Pending Actions Queue -->
          <div class="card" style="display:flex; flex-direction:column;">
            <div class="card-header" style="background:#f8fafc; border-bottom:1px solid var(--border-color); padding: 10px 15px;">
              <h3 style="margin:0; font-size:13.5px; font-weight:800; color:var(--primary);">⚠️ Pending Actions Queue (HK Manager Desk)</h3>
            </div>
            <div class="custom-table-container" style="flex:1;">
              <table class="custom-table" style="font-size:11.5px;">
                <thead>
                  <tr>
                    <th>Priority</th>
                    <th>Sub-module</th>
                    <th>Description</th>
                    <th>Since</th>
                    <th style="text-align:right;">Action</th>
                  </tr>
                </thead>
                <tbody>
                  ${compilePendingActions(tasks, slas, laundryStock, cssdLoads, bmwBags).map(act => `
                    <tr>
                      <td>
                        <span class="badge ${act.priority === 'Urgent' ? 'badge-danger' : (act.priority === 'High' ? 'badge-warning' : 'badge-secondary')}" style="font-size:8.5px;">
                          ${act.priority}
                        </span>
                      </td>
                      <td><strong>${act.subModule}</strong></td>
                      <td>${act.desc}</td>
                      <td style="font-family:monospace;">${act.since}</td>
                      <td style="text-align:right;">
                        <button class="btn btn-primary btn-xs" style="padding: 2px 6px; font-size:9.5px;" onclick="window.router.navigate('${act.route}')">Inspect</button>
                      </td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>

          <!-- Audit Trail -->
          <div class="card" style="display:flex; flex-direction:column;">
            <div class="card-header" style="background:#f8fafc; border-bottom:1px solid var(--border-color); padding: 10px 15px;">
              <h3 style="margin:0; font-size:13.5px; font-weight:800; color:var(--primary);">📋 Today's Environmental Audit Trail Ledger</h3>
            </div>
            <div class="custom-table-container" style="flex:1; max-height:350px; overflow-y:auto;">
              <table class="custom-table" style="font-size:11px;">
                <thead>
                  <tr>
                    <th>Time</th>
                    <th>Sub-module</th>
                    <th>User</th>
                    <th>Role</th>
                    <th>Action</th>
                    <th>Location/Item</th>
                  </tr>
                </thead>
                <tbody>
                  ${(window.state.hkAuditLogs || []).slice(0, 20).map(l => {
                    var userVal = l.user === 'System' ? 'System' : l.user;
                    var roleVal = l.user === 'System' ? 'System' : l.role;
                    return `
                      <tr>
                        <td style="font-family:monospace; color:var(--text-secondary);">${formatDateTime(l.timestamp)}</td>
                        <td><strong>${l.subModule || 'HK Ops'}</strong></td>
                        <td>${userVal}</td>
                        <td><span style="font-size:9.5px; color:var(--text-muted);">${roleVal}</span></td>
                        <td><span class="badge badge-info" style="font-size:8.5px;">${l.action}</span></td>
                        <td><span style="font-family:monospace; font-weight:700;">${l.locationItem || '--'}</span></td>
                      </tr>
                    `;
                  }).join('')}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      `;
    }

    // Helper compiler for Pending Actions Queue
    function compilePendingActions(tasks, slas, laundryStock, cssdLoads, bmwBags) {
      var list = [];
      tasks.forEach(t => {
        if (t.status === 'New') {
          list.push({ priority: 'High', subModule: 'HK Ops', desc: `Unassigned clean request pending at ${t.bedId}`, since: formatElapsed(t.createdTime), route: 'housekeepingOperations', time: new Date(t.createdTime).getTime() });
        }
      });
      tasks.forEach(t => {
        if (t.status !== 'Verified' && t.status !== 'Closed' && t.status !== 'Cancelled') {
          var limit = slas[t.type] || 60;
          var elapsedMs = Date.now() - new Date(t.createdTime).getTime();
          if (elapsedMs > limit * 60000) {
            list.push({ priority: 'Urgent', subModule: 'HK Ops', desc: `SLA breach alert: ${t.type} overdue at ${t.bedId}`, since: formatElapsed(t.createdTime), route: 'housekeepingOperations', time: new Date(t.createdTime).getTime() });
          }
        }
      });
      window.state.laundryDeptStock.forEach(s => {
        if (s.status === 'Critical') {
          list.push({ priority: 'Urgent', subModule: 'Laundry', desc: `CRITICAL STOCK ALERT: ${s.dept} clean linen is low (${s.available} items)`, since: '1h 24m', route: 'laundry', time: Date.now() - 5000000 });
        } else if (s.status === 'Low') {
          list.push({ priority: 'Normal', subModule: 'Laundry', desc: `Low stock notice: ${s.dept} available clean is ${s.available}`, since: '2h 10m', route: 'laundry', time: Date.now() - 7800000 });
        }
      });
      if (window.state.laundryVendorOverdue) {
        list.push({ priority: 'High', subModule: 'Laundry', desc: 'External vendor laundry bulk dispatch batch return overdue', since: '4h 15m', route: 'laundry', time: Date.now() - 15000000 });
      }
      cssdLoads.forEach(l => {
        if (l.expired) {
          list.push({ priority: 'Urgent', subModule: 'CSSD', desc: `Sterility expired: tray ${l.id} (${l.name}) needs re-sterilization`, since: '1d 4h', route: 'cssd', time: new Date(l.startedAt).getTime() });
        }
      });
      if (window.state.cssdOverdueReturnsAlert) {
        list.push({ priority: 'High', subModule: 'CSSD', desc: window.state.cssdOverdueReturnsAlert, since: '8h 22m', route: 'cssd', time: Date.now() - 30000000 });
      }
      bmwBags.forEach(b => {
        var elapsedMs = Date.now() - new Date(b.collectedAt).getTime();
        if (elapsedMs > 4 * 3600000) {
          list.push({ priority: 'Urgent', subModule: 'BMW', desc: `CPCB compliance warning: ${b.category} waiting in storage for > 4h`, since: formatElapsed(b.collectedAt), route: 'bmw', time: new Date(b.collectedAt).getTime() });
        }
      });
      if (window.state.bmwVendorOverdue) {
        list.push({ priority: 'Urgent', subModule: 'BMW', desc: 'Overdue bio-waste vendor transporter pickup vehicle (CPCB 24h compliance risk)', since: '5h 10m', route: 'bmw', time: Date.now() - 18000000 });
      }
      var departments = Object.keys(window.state.bmwManifestSubmissions);
      departments.forEach(dept => {
        if (window.state.bmwManifestSubmissions[dept] === 'Missing') {
          list.push({ priority: 'High', subModule: 'BMW', desc: `Daily bio-waste manifest submission missing from ${dept}`, since: 'Today', route: 'bmw', time: Date.now() - 25000000 });
        }
      });

      var pOrder = { 'Urgent': 3, 'High': 2, 'Normal': 1 };
      list.sort((a, b) => {
        var diffP = pOrder[b.priority] - pOrder[a.priority];
        if (diffP !== 0) return diffP;
        return a.time - b.time;
      });

      return list.slice(0, 10);
    }

    // ──────────────────────────────────────────────────────────────────────────
    // TAB 2: HOUSEKEEPING OPERATIONS (10 FULL SCREENS SUB-NAV)
    // ──────────────────────────────────────────────────────────────────────────
    function renderOperationsWorkspace() {
      var subTabs = [
        { id: 'dashboard', label: '📊 Task Dashboard' },
        { id: 'raise', label: '➕ Raise Request' },
        { id: 'assign', label: '📋 Task Assignment' },
        { id: 'execute', label: '⚡ Task Execution (Staff)' },
        { id: 'verify', label: '🔍 Verification Desk' },
        { id: 'beds', label: '🛏️ Bed Readiness Board' },
        { id: 'schedule', label: '📅 Scheduled Cleaning' },
        { id: 'inspect', label: '✏️ Quality Inspection' },
        { id: 'reports', label: '📈 Operations Reports' },
        { id: 'audit', label: '⚙️ Operations Audit Log' }
      ];

      return `
        <div style="display:flex; flex-direction:column; gap:20px;">
          <!-- 10 Screens Operations Sub-navigation bar -->
          <div style="display:flex; gap:6px; background:#f1f5f9; padding:6px; border-radius:8px; border:1px solid var(--border-color); overflow-x:auto; white-space:nowrap; width:100%; box-sizing:border-box;">
            ${subTabs.map(tab => `
              <button class="btn ${_activeOpsSubTab === tab.id ? 'btn-primary' : 'btn-secondary'}" style="padding:6px 14px; font-size:12px; font-weight:700;" onclick="window._hkSetOpsSubTab('${tab.id}')">${tab.label}</button>
            `).join('')}
          </div>

          <div class="ops-viewport">
            ${_activeOpsSubTab === 'dashboard' ? renderOpsDashboardScreen() : ''}
            ${_activeOpsSubTab === 'raise' ? renderOpsRaiseScreen() : ''}
            ${_activeOpsSubTab === 'assign' ? renderOpsAssignScreen() : ''}
            ${_activeOpsSubTab === 'execute' ? renderOpsExecuteScreen() : ''}
            ${_activeOpsSubTab === 'verify' ? renderOpsVerifyScreen() : ''}
            ${_activeOpsSubTab === 'beds' ? renderOpsBedsScreen() : ''}
            ${_activeOpsSubTab === 'schedule' ? renderOpsScheduleScreen() : ''}
            ${_activeOpsSubTab === 'inspect' ? renderOpsInspectScreen() : ''}
            ${_activeOpsSubTab === 'reports' ? renderOpsReportsScreen() : ''}
            ${_activeOpsSubTab === 'audit' ? renderOpsAuditScreen() : ''}
          </div>
        </div>
      `;
    }

    // ──────────────────────────────────────────────────────────────────────────
    // OPERATIONS SCREEN 1: TASK DASHBOARD
    // ──────────────────────────────────────────────────────────────────────────
    function renderOpsDashboardScreen() {
      var tasks = window.state.housekeepingTasks || [];
      var slas = window.state.hkSlaSettings || {};

      var filtered = tasks;
      if (_taskFilter !== 'All') {
        filtered = tasks.filter(t => t.status === _taskFilter);
      }

      var overdueCount = 0;
      tasks.forEach(t => {
        if (t.status !== 'Verified' && t.status !== 'Closed' && t.status !== 'Cancelled') {
          var limit = slas[t.type] || 60;
          var elapsedMs = Date.now() - new Date(t.createdTime).getTime();
          if (elapsedMs > limit * 60000) overdueCount++;
        }
      });

      return `
        <!-- KPI Cards -->
        <div style="display:grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-bottom: 20px;">
          <div class="card" style="padding: 15px; border-left: 5px solid var(--primary);">
            <div style="font-size: 11px; font-weight:700; color:var(--text-secondary); text-transform:uppercase;">Pending Tasks</div>
            <div style="font-size: 28px; font-weight:900; color:var(--primary); font-family:monospace; margin:6px 0;">${tasks.filter(t=>t.status==='New').length}</div>
            <div style="font-size: 11px; color:var(--text-muted);">Awaiting assignment</div>
          </div>
          <div class="card" style="padding: 15px; border-left: 5px solid #d97706;">
            <div style="font-size: 11px; font-weight:700; color:var(--text-secondary); text-transform:uppercase;">In Progress</div>
            <div style="font-size: 28px; font-weight:900; color:#d97706; font-family:monospace; margin:6px 0;">${tasks.filter(t=>t.status==='In Progress').length}</div>
            <div style="font-size: 11px; color:var(--text-muted);">Cleaning in execution</div>
          </div>
          <div class="card" style="padding: 15px; border-left: 5px solid #10b981;">
            <div style="font-size: 11px; font-weight:700; color:var(--text-secondary); text-transform:uppercase;">Completed Today</div>
            <div style="font-size: 28px; font-weight:900; color:#10b981; font-family:monospace; margin:6px 0;">${tasks.filter(t=>t.status==='Completed' || t.status==='Verified').length}</div>
            <div style="font-size: 11px; color:var(--text-muted);">inspected and complete</div>
          </div>
          <div class="card" style="padding: 15px; border-left: 5px solid #ef4444;">
            <div style="font-size: 11px; font-weight:700; color:var(--text-secondary); text-transform:uppercase;">Overdue (Breached)</div>
            <div style="font-size: 28px; font-weight:900; color:#ef4444; font-family:monospace; margin:6px 0;">${overdueCount}</div>
            <div style="font-size: 11px; color:var(--text-muted);">Exceeded SLA times</div>
          </div>
        </div>

        <div class="card">
          <div class="card-header" style="background:#f8fafc; border-bottom:1px solid var(--border-color); padding: 12px 15px; display:flex; justify-content:space-between; align-items:center;">
            <h3 style="margin:0; font-size:13.5px; font-weight:800; color:var(--primary);">📋 Room Cleaning & Housekeeping Queue</h3>
            <div style="display:inline-flex; border:1px solid var(--border-color); border-radius:6px; overflow:hidden;">
              ${['All', 'New', 'Assigned', 'In Progress', 'Completed', 'Verified'].map(st => `
                <button style="padding: 4px 10px; border:none; cursor:pointer; font-size:11px; font-weight:700; background:${_taskFilter === st ? 'var(--primary)' : 'white'}; color:${_taskFilter === st ? 'white' : 'var(--text-secondary)'};" onclick="window._hkSetTaskFilter('${st}')">${st}</button>
              `).join('')}
            </div>
          </div>
          <div class="custom-table-container">
            <table class="custom-table" style="font-size:12px;">
              <thead>
                <tr>
                  <th>Task ID</th>
                  <th>Task Type</th>
                  <th>Location</th>
                  <th>Source</th>
                  <th>Assigned To</th>
                  <th>Status</th>
                  <th>Raised At</th>
                  <th>Elapsed</th>
                  <th>SLA</th>
                  <th style="text-align:right;">Actions</th>
                </tr>
              </thead>
              <tbody>
                ${filtered.map(t => {
                  var limit = slas[t.type] || 60;
                  var elapsedMs = Date.now() - new Date(t.createdTime).getTime();
                  var elapsedMin = Math.floor(elapsedMs / 60000);
                  var isBreached = (t.status !== 'Verified' && t.status !== 'Closed' && t.status !== 'Cancelled') && (elapsedMin > limit);
                  var isUnassigned = t.status === 'New';
                  
                  var sourceLabel = t.source === 'IPD' || t.source === 'OT' || t.source === 'System' ? '<span class="badge badge-info" style="font-size:8px;">Auto</span>' : t.source;
                  var lockIcon = t.type === 'Isolation Room Cleaning' && !t.icNurseSigned ? '🔒 ' : '';

                  return `
                    <tr style="background:${isBreached ? '#fff5f5' : (isUnassigned ? '#fffdf5' : 'white')};">
                      <td><strong>${t.id}</strong></td>
                      <td><strong>${lockIcon}${t.type}</strong></td>
                      <td style="font-family:monospace; font-weight:700;">${t.bedId}</td>
                      <td>${sourceLabel}</td>
                      <td>${t.assignee || '<em>Unassigned</em>'}</td>
                      <td><span class="badge badge-secondary" style="font-size:9.5px;">${t.status}</span></td>
                      <td style="font-family:monospace;">${formatDateTime(t.createdTime)}</td>
                      <td style="color:${isBreached?'#b91c1c':'inherit'}; font-weight:${isBreached?'800':'normal'}; font-family:monospace;">
                        ${isBreached ? `Breached (${formatElapsed(t.createdTime)})` : formatElapsed(t.createdTime)}
                      </td>
                      <td>
                        <span class="badge ${isBreached?'badge-danger':'badge-success'}" style="font-size:8px;">
                          ${isBreached?'Breached':'On Time'}
                        </span>
                      </td>
                      <td style="text-align:right;">
                        ${t.status === 'New' ? `<button class="btn btn-primary btn-xs" onclick="window._hkSetOpsSubTab('assign')">Assign</button>` : '--'}
                      </td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `;
    }

    // ──────────────────────────────────────────────────────────────────────────
    // OPERATIONS SCREEN 2: RAISE REQUEST
    // ──────────────────────────────────────────────────────────────────────────
    function renderOpsRaiseScreen() {
      return `
        <div class="card" style="max-width: 500px; margin: 0 auto; text-align:left;">
          <div class="card-header" style="background:#f8fafc; border-bottom:1px solid var(--border-color); padding: 12px 15px;">
            <h3 style="margin:0; font-size:14px; font-weight:800; color:var(--primary);">➕ Raise Manual Housekeeping Request</h3>
          </div>
          <div class="card-body" style="padding: 20px;">
            <form onsubmit="event.preventDefault(); window._hkOperationsSubmitRequest();" style="display:flex; flex-direction:column; gap:15px;">
              <div class="form-group">
                <label style="font-size:11px; font-weight:700;">Task Type *</label>
                <select id="ops-raise-type" class="form-select" style="margin-top:4px;">
                  <option value="General Room Cleaning">General Room Cleaning</option>
                  <option value="Bathroom Cleaning">Bathroom Cleaning</option>
                  <option value="Spill Cleaning">Spill Cleaning</option>
                  <option value="Isolation Room Cleaning">Isolation Room Cleaning</option>
                  <option value="Bed Cleaning">Bed Cleaning</option>
                  <option value="ICU / HDU Cleaning">ICU / HDU Cleaning</option>
                </select>
              </div>

              <div class="form-group">
                <label style="font-size:11px; font-weight:700;">Location (Bed / Room ID) *</label>
                <input type="text" id="ops-raise-bed" class="form-control" style="margin-top:4px;" placeholder="e.g. PVT-202" required>
              </div>

              <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
                <div class="form-group">
                  <label style="font-size:11px; font-weight:700;">Ward / Section</label>
                  <select id="ops-raise-ward" class="form-select" style="margin-top:4px;">
                    <option value="IPD">IPD Ward</option>
                    <option value="OPD">OPD Clinic</option>
                    <option value="ICU">ICU Complex</option>
                    <option value="OT">OT Complex</option>
                    <option value="Emergency">Emergency Room</option>
                  </select>
                </div>
                <div class="form-group">
                  <label style="font-size:11px; font-weight:700;">Urgency *</label>
                  <select id="ops-raise-urgency" class="form-select" style="margin-top:4px;">
                    <option value="Routine">Routine</option>
                    <option value="Urgent">Urgent</option>
                    <option value="Emergency">Emergency</option>
                  </select>
                </div>
              </div>

              <div class="form-group">
                <label style="font-size:11px; font-weight:700;">Raised By</label>
                <input type="text" class="form-control" style="margin-top:4px;" value="${window.state.activeUserRole || 'Ward Nurse'}" disabled>
              </div>

              <div class="form-group">
                <label style="font-size:11px; font-weight:700;">Remarks / Description</label>
                <input type="text" id="ops-raise-remarks" class="form-control" style="margin-top:4px;" placeholder="Remarks for cleaning staff">
              </div>

              <button type="submit" class="btn btn-primary" style="width:100%; padding:10px; font-weight:bold;">Submit Request</button>
            </form>
          </div>
        </div>
      `;
    }

    // ──────────────────────────────────────────────────────────────────────────
    // OPERATIONS SCREEN 3: TASK ASSIGNMENT
    // ──────────────────────────────────────────────────────────────────────────
    function renderOpsAssignScreen() {
      var tasks = window.state.housekeepingTasks || [];
      var unassigned = tasks.filter(t => t.status === 'New' || t.status === 'Assigned');
      var staff = window.state.hkStaffList || [];

      return `
        <div class="card" style="text-align:left;">
          <div class="card-header" style="background:#f8fafc; border-bottom:1px solid var(--border-color); padding: 12px 15px;">
            <h3 style="margin:0; font-size:13.5px; font-weight:800; color:var(--primary);">📋 Task Assignment Desk</h3>
          </div>
          <div class="card-body" style="padding:15px; display:flex; flex-direction:column; gap:15px;">
            ${unassigned.length === 0 ? `
              <div style="padding:30px; text-align:center; color:var(--text-secondary);">No unassigned or pending tasks awaiting operator scheduling.</div>
            ` : unassigned.map(t => `
              <div style="border: 1px solid var(--border-color); border-radius:8px; padding:15px; display:flex; justify-content:space-between; align-items:center; background:#f8fafc; gap:15px; flex-wrap:wrap;">
                <div style="display:flex; flex-direction:column; gap:4px; max-width:400px;">
                  <div style="display:flex; align-items:center; gap:8px;">
                    <strong style="color:var(--primary); font-size:13.5px;">${t.id} — ${t.type}</strong>
                    <span class="badge badge-secondary" style="font-size:9px;">${t.status}</span>
                  </div>
                  <div style="font-size:12px; color:var(--text-secondary);">
                    Location: <strong>${t.bedId}</strong> (${t.source}) · Raised: <strong>${formatDateTime(t.createdTime)}</strong>
                  </div>
                  ${t.assignee ? `<div style="font-size:11px; color:#b91c1c;">Currently assigned to: <strong>${t.assignee}</strong></div>` : ''}
                </div>

                <div style="display:flex; align-items:center; gap:10px; flex-wrap:wrap;">
                  <div class="form-group" style="margin:0;">
                    <label style="font-size:10px; font-weight:700; color:var(--text-secondary);">Select Staff Member</label>
                    <select id="assign-staff-select-${t.id}" class="form-select" style="font-size:11px; padding:4px 8px; width:220px; margin-top:2px;">
                      ${staff.map(st => `
                        <option value="${st.name}">${st.name} (Shift: ${st.shift}) — ${st.activeTasks} active</option>
                      `).join('')}
                    </select>
                  </div>
                  
                  <div class="form-group" style="margin:0;">
                    <label style="font-size:10px; font-weight:700; color:var(--text-secondary);">Reassign Justification</label>
                    <input type="text" id="assign-reason-${t.id}" class="form-control" style="font-size:11px; padding:4px 8px; width:150px; margin-top:2px;" placeholder="Reason if reassigning">
                  </div>

                  <button class="btn btn-primary btn-sm" style="margin-top:14px;" onclick="window._hkOperationsPerformAssign('${t.id}')">
                    ${t.status === 'Assigned' ? 'Reassign Staff' : 'Assign Staff'}
                  </button>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }

    // ──────────────────────────────────────────────────────────────────────────
    // OPERATIONS SCREEN 4: TASK EXECUTION (STAFF VIEW)
    // ──────────────────────────────────────────────────────────────────────────
    function renderOpsExecuteScreen() {
      var staff = window.state.hkStaffList || [];
      var tasks = window.state.housekeepingTasks || [];
      
      // Filter tasks assigned to selected staff member
      var staffTasks = tasks.filter(t => t.assignee === _selectedStaffExecutor && (t.status === 'Assigned' || t.status === 'In Progress'));

      return `
        <div class="card" style="text-align:left;">
          <div class="card-header" style="background:#f8fafc; border-bottom:1px solid var(--border-color); padding: 12px 15px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">
            <h3 style="margin:0; font-size:13.5px; font-weight:800; color:var(--primary);">⚡ Environmental Staff Execution Hub (Mobile-Optimised targets)</h3>
            
            <div style="display:flex; align-items:center; gap:8px;">
              <span style="font-size:11.5px; font-weight:700;">Select Staff Actor:</span>
              <select class="form-select" style="font-size:12px; width:180px;" onchange="window._hkSetStaffExecutor(this.value)">
                ${staff.map(st => `
                  <option value="${st.name}" ${_selectedStaffExecutor === st.name ? 'selected' : ''}>${st.name}</option>
                `).join('')}
              </select>
            </div>
          </div>
          
          <div class="card-body" style="padding:15px; display:flex; flex-direction:column; gap:20px;">
            ${staffTasks.length === 0 ? `
              <div style="padding:40px; text-align:center; color:var(--text-secondary);">No active cleaning tasks assigned to <strong>${_selectedStaffExecutor}</strong>.</div>
            ` : staffTasks.map(t => {
              var checklistKeys = Object.keys(t.checklist);
              var allChecked = checklistKeys.every(k => t.checklist[k] === true);

              return `
                <div style="border: 2px solid var(--border-color); border-radius:12px; padding:20px; background:#fff;">
                  <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:15px; border-bottom: 1px solid var(--border-color); padding-bottom:10px;">
                    <div>
                      <span class="badge badge-info" style="font-size:10px;">${t.status}</span>
                      <h4 style="margin:4px 0; font-size:16px; font-weight:900; color:var(--primary);">${t.type}</h4>
                      <div style="font-size:12px; color:var(--text-secondary);">Location: <strong>${t.bedId}</strong> (${t.source})</div>
                    </div>
                    <div style="text-align:right;">
                      <div style="font-size:11px; color:var(--text-muted);">SLA Countdown</div>
                      <strong style="font-size:13.5px; color:#ef4444; font-family:monospace;">${formatElapsed(t.createdTime)}</strong>
                    </div>
                  </div>

                  <!-- Checklist Protocol Gates -->
                  <div style="margin-bottom:15px;">
                    <div style="font-size:11.5px; font-weight:700; text-transform:uppercase; color:var(--text-secondary); margin-bottom:8px;">Mandatory Cleaning Checklist Protocol</div>
                    <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
                      ${checklistKeys.map((key, i) => `
                        <label style="display:flex; align-items:center; gap:10px; font-size:13px; padding:10px; background:#f8fafc; border:1px solid var(--border-color); border-radius:8px; cursor:pointer;">
                          <input type="checkbox" style="height:18px; width:18px;" ${t.checklist[key] ? 'checked' : ''} onchange="window._hkOperationsToggleChecklist('${t.id}', '${key}', this.checked)">
                          <span>${key}</span>
                        </label>
                      `).join('')}
                    </div>
                  </div>

                  <!-- Consumables usage log -->
                  <div style="background:#f8fafc; border:1px solid var(--border-color); padding:15px; border-radius:8px; margin-bottom:15px; display:grid; grid-template-columns:1fr 1fr; gap:12px;">
                    <div class="form-group">
                      <label style="font-size:11px; font-weight:700;">Disinfectant type</label>
                      <select id="execute-disinf-${t.id}" class="form-select" style="margin-top:4px;">
                        <option value="Sodium Hypochlorite 1%">Sodium Hypochlorite 1%</option>
                        <option value="Isopropyl Alcohol 70%">Isopropyl Alcohol 70%</option>
                        <option value="Phenyl Solution">Phenyl Solution</option>
                        <option value="Quaternary Ammonium">Quaternary Ammonium</option>
                      </select>
                    </div>
                    <div class="form-group">
                      <label style="font-size:11px; font-weight:700;">Quantity Used (ml / tablets)</label>
                      <input type="number" id="execute-qty-${t.id}" class="form-control" style="margin-top:4px;" value="100">
                    </div>
                  </div>

                  <!-- Execution CTA buttons -->
                  <div style="display:flex; gap:10px; justify-content:flex-end;">
                    <button class="btn btn-success" style="background-color: #16a34a; border-color: #16a34a; color: #ffffff; padding:10px 20px; font-weight:bold; border-radius:6px; cursor:pointer;" ${allChecked ? '' : 'disabled'} onclick="window._hkOperationsCompleteTask('${t.id}')">Mark Done & Send to Supervisor</button>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      `;
    }

    // ──────────────────────────────────────────────────────────────────────────
    // OPERATIONS SCREEN 5: VERIFICATION DESK
    // ──────────────────────────────────────────────────────────────────────────
    function renderOpsVerifyScreen() {
      var tasks = window.state.housekeepingTasks || [];
      var completed = tasks.filter(t => t.status === 'Completed');

      return `
        <div class="card" style="text-align:left;">
          <div class="card-header" style="background:#f8fafc; border-bottom:1px solid var(--border-color); padding: 12px 15px;">
            <h3 style="margin:0; font-size:13.5px; font-weight:800; color:var(--primary);">🔍 Supervisor Verification Desk</h3>
          </div>
          <div class="card-body" style="padding:15px; display:flex; flex-direction:column; gap:15px;">
            ${completed.length === 0 ? `
              <div style="padding:30px; text-align:center; color:var(--text-secondary);">No completed tasks awaiting verification inspector rounds.</div>
            ` : completed.map(t => `
              <div style="border: 1px solid var(--border-color); border-radius:8px; padding:15px; display:flex; flex-direction:column; gap:12px; background:#f8fafc;">
                <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                  <div>
                    <strong style="font-size:14px; color:var(--primary);">${t.id} — ${t.type}</strong>
                    <div style="font-size:12px; color:var(--text-secondary);">Location: <strong>${t.bedId}</strong> · Cleaner: <strong>${t.assignee}</strong></div>
                  </div>
                  <span class="badge badge-purple" style="font-size:10px;">Awaiting verification</span>
                </div>

                <div style="font-size:11.5px; background:white; padding:10px; border-radius:6px; border:1px solid var(--border-color);">
                  <strong>Submitted Checklist Protocol:</strong>
                  <ul style="margin:6px 0 0 0; padding-left:18px;">
                    ${Object.keys(t.checklist).map(k => `
                      <li style="color:${t.checklist[k] ? '#16a34a' : '#b91c1c'};">✓ ${k}</li>
                    `).join('')}
                  </ul>
                </div>

                <div style="display:flex; justify-content:flex-end; gap:10px;">
                  <button class="btn btn-danger btn-sm" style="background-color:#dc2626; border-color:#dc2626; color:#fff; font-weight:bold; cursor:pointer;" onclick="window._hkOperationsOpenRejectModal('${t.id}')">Reject (Redo)</button>
                  
                  ${t.type === 'Isolation Room Cleaning' && !t.icNurseSigned ? `
                    <button class="btn btn-purple btn-sm" onclick="window._hkOperationsOpenICSignOff('${t.id}')">☣️ IC Nurse Sign-off</button>
                  ` : `
                    <button class="btn btn-success btn-sm" style="background-color:#16a34a; border-color:#16a34a; color:#fff; font-weight:bold; cursor:pointer;" onclick="window._hkOperationsVerify('${t.id}')">Mark Checked & Bed Ready</button>
                  `}
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }

    // ──────────────────────────────────────────────────────────────────────────
    // OPERATIONS SCREEN 6: BED READINESS BOARD
    // ──────────────────────────────────────────────────────────────────────────
    function renderOpsBedsScreen() {
      return renderBedsGrid(); // Re-use the high quality ward grid layout
    }

    // ──────────────────────────────────────────────────────────────────────────
    // OPERATIONS SCREEN 7: SCHEDULED CLEANING
    // ──────────────────────────────────────────────────────────────────────────
    function renderOpsScheduleScreen() {
      var schedules = window.state.hkSchedules || [];

      return `
        <div class="card" style="text-align:left; display:flex; flex-direction:column; gap:15px; padding:15px;">
          <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1.5px solid var(--border-color); padding-bottom:10px;">
            <h3 style="margin:0; font-size:13.5px; font-weight:800; color:var(--primary);">📅 Scheduled Cleaning Configurations</h3>
            <button class="btn btn-primary btn-sm" onclick="alert('Configuration restricted to Admin and HK Manager roles.')">+ Configure Schedule</button>
          </div>

          <div class="custom-table-container">
            <table class="custom-table" style="font-size:12px;">
              <thead>
                <tr>
                  <th>Area Name</th>
                  <th>Frequency</th>
                  <th>Times</th>
                  <th>Assigned Zone</th>
                  <th>Staff Assigned</th>
                  <th>Next Due</th>
                  <th>Last Completed</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                ${schedules.map(sch => {
                  var isMissed = sch.status === 'Missed';
                  return `
                    <tr style="background:${isMissed ? '#fef2f2' : 'white'};">
                      <td><strong>${sch.areaName}</strong></td>
                      <td>${sch.frequency}</td>
                      <td style="font-family:monospace;">${sch.times}</td>
                      <td>${sch.zone}</td>
                      <td>${sch.staff}</td>
                      <td style="font-family:monospace;">${formatDateTime(sch.nextDue)}</td>
                      <td style="font-family:monospace;">${formatDateTime(sch.lastCompleted)}</td>
                      <td>
                        <span class="badge ${isMissed ? 'badge-danger' : 'badge-success'}" style="font-size:8.5px;">
                          ${sch.status}
                        </span>
                      </td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `;
    }

    // ──────────────────────────────────────────────────────────────────────────
    // OPERATIONS SCREEN 8: QUALITY INSPECTION
    // ──────────────────────────────────────────────────────────────────────────
    function renderOpsInspectScreen() {
      var inspections = window.state.hkInspections || [];

      return `
        <div style="display:grid; grid-template-columns:1fr 1.5fr; gap:20px; text-align:left;">
          <!-- Inspection checklist logger -->
          <div class="card">
            <div class="card-header" style="background:#f8fafc; border-bottom:1px solid var(--border-color); padding: 12px 15px;">
              <h3 style="margin:0; font-size:13.5px; font-weight:800; color:var(--primary);">✏️ Log quality Inspection Round</h3>
            </div>
            <div class="card-body" style="padding:15px;">
              <form onsubmit="event.preventDefault(); window._hkOperationsSubmitInspection();" style="display:flex; flex-direction:column; gap:12px;">
                <div class="form-group">
                  <label style="font-size:11px; font-weight:700;">Select Inspection Area</label>
                  <select id="ops-insp-area" class="form-select" style="margin-top:4px;">
                    <option value="OPD Waiting Area">OPD Waiting Area</option>
                    <option value="IPD Wards">IPD Wards</option>
                    <option value="OT Complex">OT Complex</option>
                    <option value="ICU Complex">ICU Complex</option>
                    <option value="Corridors">Corridors</option>
                  </select>
                </div>

                <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
                  <div class="form-group">
                    <label style="font-size:11px; font-weight:700;">Date</label>
                    <input type="date" id="ops-insp-date" class="form-control" style="margin-top:4px;" value="${new Date().toISOString().slice(0, 10)}">
                  </div>
                  <div class="form-group">
                    <label style="font-size:11px; font-weight:700;">Shift</label>
                    <select id="ops-insp-shift" class="form-select" style="margin-top:4px;">
                      <option value="Morning">Morning</option>
                      <option value="Afternoon">Afternoon</option>
                      <option value="Night">Night</option>
                    </select>
                  </div>
                </div>

                <!-- Parameters score 1-5 -->
                <div style="border:1px solid var(--border-color); padding:10px; border-radius:6px; background:#f8fafc; display:flex; flex-direction:column; gap:8px;">
                  <div style="font-size:11px; font-weight:700; text-transform:uppercase; color:var(--text-secondary);">Parameter scores (1 to 5)</div>
                  ${Object.keys(_inspScores).map(k => `
                    <div style="display:flex; justify-content:space-between; align-items:center; font-size:12px;">
                      <span style="text-transform:capitalize;">${k} cleanliness:</span>
                      <input type="number" min="1" max="5" class="form-control" style="width:60px; font-size:11px; padding:2px 6px;" value="${_inspScores[k]}" onchange="window._hkOperationsSetInspScore('${k}', this.value)">
                    </div>
                  `).join('')}
                </div>

                <div class="form-group">
                  <label style="font-size:11px; font-weight:700;">remarks</label>
                  <input type="text" id="ops-insp-remarks" class="form-control" style="margin-top:4px;" placeholder="Optional inspection remarks">
                </div>

                <div class="form-group">
                  <label style="font-size:11px; font-weight:700;">Root Cause (Mandatory if score &lt; 3.5)</label>
                  <input type="text" id="ops-insp-rootcause" class="form-control" style="margin-top:4px;" placeholder="Root cause of cleanliness breach">
                </div>

                <button type="submit" class="btn btn-primary btn-sm" style="width:100%;">Submit Quality Audit</button>
              </form>
            </div>
          </div>

          <!-- Inspection history -->
          <div class="card">
            <div class="card-header" style="background:#f8fafc; border-bottom:1px solid var(--border-color); padding: 12px 15px;">
              <h3 style="margin:0; font-size:13.5px; font-weight:800; color:var(--primary);">📋 inspection history (NABH logs)</h3>
            </div>
            <div class="custom-table-container">
              <table class="custom-table" style="font-size:11.5px;">
                <thead>
                  <tr>
                    <th>Area</th>
                    <th>Date</th>
                    <th>Shift</th>
                    <th>Inspector</th>
                    <th>Score</th>
                    <th>Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  ${inspections.map(insp => {
                    var isBreached = insp.score < insp.threshold;
                    return `
                      <tr style="background:${isBreached ? '#fef2f2' : 'white'};">
                        <td><strong>${insp.area}</strong></td>
                        <td>${insp.date}</td>
                        <td>${insp.shift}</td>
                        <td>${insp.inspector}</td>
                        <td style="font-family:monospace; font-weight:700; color:${isBreached ? '#b91c1c' : '#166534'};">
                          ${insp.score} / 5.0
                        </td>
                        <td>
                          ${insp.remarks}
                          ${insp.rootCause ? `<div style="font-size:9.5px; color:#b91c1c; font-weight:700;">Root Cause: ${insp.rootCause}</div>` : ''}
                        </td>
                      </tr>
                    `;
                  }).join('')}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      `;
    }

    // ──────────────────────────────────────────────────────────────────────────
    // OPERATIONS SCREEN 9: STATUTORY REPORTS
    // ──────────────────────────────────────────────────────────────────────────
    function renderOpsReportsScreen() {
      return renderReportsView(); // Re-use quality reporting dashboard
    }

    // ──────────────────────────────────────────────────────────────────────────
    // OPERATIONS SCREEN 10: AUDIT LOG
    // ──────────────────────────────────────────────────────────────────────────
    function renderOpsAuditScreen() {
      return renderAuditTrailView(); // Re-use central audit trail ledger
    }

    // ──────────────────────────────────────────────────────────────────────────
    // OVERLAYS / DIALOGS MANAGER
    // ──────────────────────────────────────────────────────────────────────────
    function renderModalOverlay() {
      if (!_activeModal) return '';

      var modalContent = '';
      
      if (_activeModal === 'assign') {
        var staff = window.state.hkStaffList || [];
        modalContent = `
          <div class="card" style="width:400px; padding:20px; text-align:left; border-radius:12px;">
            <div style="font-size:16px; font-weight:800; color:var(--primary); border-bottom:1px solid var(--border-color); padding-bottom:8px; margin-bottom:15px;">Assign Environmental Staff</div>
            <div style="font-size:12px; margin-bottom:10px; color:var(--text-secondary);">Select staff for task <strong>${_selectedTaskId}</strong>:</div>
            
            <div class="form-group" style="margin-bottom:15px;">
              <label style="font-size:11px; font-weight:700;">HK Staff Member</label>
              <select id="assign-staff-select" class="form-select" style="margin-top:4px;">
                ${staff.map(st => `
                  <option value="${st.name}">${st.name} (Shift: ${st.shift}) — ${st.activeTasks} Active</option>
                `).join('')}
              </select>
            </div>
            
            <div class="form-group" style="margin-bottom:15px;">
              <label style="font-size:11px; font-weight:700;">Reassignment Reason (Optional)</label>
              <input type="text" id="assign-reason-input" class="form-control" style="margin-top:4px;" placeholder="Input reason if reassigning task">
            </div>

            <div style="display:flex; justify-content:flex-end; gap:8px;">
              <button class="btn btn-secondary btn-sm" onclick="window._hkCloseModal()">Cancel</button>
              <button class="btn btn-primary btn-sm" onclick="window._hkExecuteAssign()">Confirm Assignment</button>
            </div>
          </div>
        `;
      } else if (_activeModal === 'icNurseSignOff') {
        modalContent = `
          <div class="card" style="width:400px; padding:20px; text-align:left; border-radius:12px;">
            <div style="font-size:16px; font-weight:800; color:#7c3aed; border-bottom:1px solid var(--border-color); padding-bottom:8px; margin-bottom:15px;">☣️ IC Nurse Credential Validation Sign-off</div>
            <p style="font-size:11.5px; color:var(--text-secondary); margin-bottom:12px;">
              Release check: Isolation clean tasks require the credential pin of the <strong>Infection Control Nurse</strong> to close quarantine.
            </p>
            
            <div class="form-group" style="margin-bottom:12px;">
              <label style="font-size:11px; font-weight:700;">Nurse e-Signature Credential (PIN)</label>
              <input type="password" id="ic-nurse-pin-input" class="form-control" style="margin-top:4px;" placeholder="Enter 4-digit verification PIN">
            </div>
            
            <div class="form-group" style="margin-bottom:15px;">
              <label style="font-size:11px; font-weight:700;">Nurse Signatory Name</label>
              <input type="text" id="ic-nurse-name-input" class="form-control" style="margin-top:4px;" placeholder="e.g. Sister Anitha">
            </div>

            <div style="display:flex; justify-content:flex-end; gap:8px;">
              <button class="btn btn-secondary btn-sm" onclick="window._hkCloseModal()">Cancel</button>
              <button class="btn btn-primary btn-sm" style="background:#7c3aed; border-color:#7c3aed;" onclick="window._hkExecuteICSignOff()">Verify & Sign Release</button>
            </div>
          </div>
        `;
      } else if (_activeModal === 'reject') {
        modalContent = `
          <div class="card" style="width:400px; padding:20px; text-align:left; border-radius:12px;">
            <div style="font-size:16px; font-weight:800; color:#b91c1c; border-bottom:1px solid var(--border-color); padding-bottom:8px; margin-bottom:15px;">❌ Reject Cleaning Task (Request Redo)</div>
            
            <div class="form-group" style="margin-bottom:15px;">
              <label style="font-size:11px; font-weight:700; color:#b91c1c;">Mandatory Rejection Remarks *</label>
              <input type="text" id="reject-remarks-input" class="form-control" style="margin-top:4px;" placeholder="Remarks detailing redo criteria" required>
            </div>

            <div style="display:flex; justify-content:flex-end; gap:8px;">
              <button class="btn btn-secondary btn-sm" onclick="window._hkCloseModal()">Back</button>
              <button class="btn btn-danger btn-sm" onclick="window._hkExecuteReject()">Confirm Rejection</button>
            </div>
          </div>
        `;
      }

      return `
        <div class="modal-overlay" style="position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(15,23,42,0.4); display:flex; justify-content:center; align-items:center; z-index:999;">
          ${modalContent}
        </div>
      `;
    }

    function canCompleteTask(task) {
      var keys = Object.keys(task.checklist);
      return keys.every(k => task.checklist[k] === true);
    }
  }

  // ──────────────────────────────────────────────────────────────────────────
  // SYSTEM BINDINGS & MUTATORS (10 OPERATIONS SCREENS FLOWS)
  // ──────────────────────────────────────────────────────────────────────────
  window._hkSetOpsSubTab = function (subTabName) {
    window.router.navigate(`housekeepingOperations?tab=${subTabName}&t=${Date.now()}`);
  };

  window._hkSetTaskFilter = function (filterName) {
    _taskFilter = filterName;
    window.router.navigate(`housekeepingOperations?tab=${_activeOpsSubTab}&t=${Date.now()}`);
  };

  window._hkSetBedWardFilter = function (wardName) {
    _bedWardFilter = wardName;
    window.router.navigate(`housekeepingOperations?tab=${_activeOpsSubTab}&t=${Date.now()}`);
  };

  window._hkSetReportType = function(val) {
    _reportType = val;
    window.router.navigate(`housekeepingOperations?tab=${_activeOpsSubTab}&t=${Date.now()}`);
  };

  window._hkSetReportFromDate = function(val) {
    _reportFromDate = val;
  };

  window._hkSetReportToDate = function(val) {
    _reportToDate = val;
  };

  window._hkRefreshReport = function() {
    window.router.navigate(`housekeepingOperations?tab=${_activeOpsSubTab}&t=${Date.now()}`);
  };

  window._hkCloseModal = function() {
    _activeModal = null;
    _selectedTaskId = null;
    _selectedBedId = null;
    window.router.navigate(`housekeepingOperations?tab=${_activeOpsSubTab}&t=${Date.now()}`);
  };

  // Operations execution filters
  window._hkSetStaffExecutor = function(val) {
    _selectedStaffExecutor = val;
    window.router.navigate(`housekeepingOperations?tab=${_activeOpsSubTab}&t=${Date.now()}`);
  };

  window._hkOperationsToggleChecklist = function(taskId, key, isChecked) {
    var tasks = window.state.housekeepingTasks || [];
    var t = tasks.find(x => x.id === taskId);
    if (t) {
      t.checklist[key] = isChecked;
      localStorage.setItem('saronil_housekeeping_tasks', JSON.stringify(tasks));
      window.router.navigate(`housekeepingOperations?tab=${_activeOpsSubTab}&t=${Date.now()}`);
    }
  };

  window._hkOperationsStartTask = function(taskId) {
    var tasks = window.state.housekeepingTasks || [];
    var t = tasks.find(x => x.id === taskId);
    if (t) {
      t.status = 'In Progress';
      t.audit.push({ timestamp: new Date().toISOString(), user: t.assignee || 'HK Staff', role: 'HK Staff', action: 'START', remarks: 'Cleaning execution started.' });
      
      if (window.state.bedsStatus[t.bedId]) {
        window.state.bedsStatus[t.bedId].status = 'Cleaning';
      }

      window.state.hkAuditLogs.unshift({ timestamp: new Date().toISOString(), user: t.assignee || 'HK Staff', role: 'HK Staff', action: 'START', taskId: t.id, roomBed: t.bedId, remarks: 'Cleaning started.' });
      localStorage.setItem('saronil_housekeeping_tasks', JSON.stringify(tasks));
      localStorage.setItem('saronil_bedsStatus', JSON.stringify(window.state.bedsStatus));
      localStorage.setItem('saronil_hk_audit_logs', JSON.stringify(window.state.hkAuditLogs));
      window.router.navigate(`housekeepingOperations?tab=${_activeOpsSubTab}&t=${Date.now()}`);
    }
  };

  window._hkOperationsCompleteTask = function(taskId) {
    var disInp = document.getElementById(`execute-disinf-${taskId}`);
    var qtyInp = document.getElementById(`execute-qty-${taskId}`);

    var disinfectant = disInp ? disInp.value : 'Sodium Hypochlorite 1%';
    var qty = qtyInp ? parseInt(qtyInp.value) : 100;

    var tasks = window.state.housekeepingTasks || [];
    var t = tasks.find(x => x.id === taskId);
    if (t) {
      t.status = 'Completed';
      t.completedTime = new Date().toISOString();
      t.audit.push({ timestamp: new Date().toISOString(), user: t.assignee || 'HK Staff', role: 'HK Staff', action: 'COMPLETE', remarks: `Clean complete. Logged consumable: ${disinfectant} x${qty}ml.` });

      window.state.hkAuditLogs.unshift({
        timestamp: new Date().toISOString(),
        user: t.assignee || 'HK Staff',
        role: 'HK Staff',
        action: 'COMPLETE',
        taskId: t.id,
        roomBed: t.bedId,
        remarks: `Cleaning complete checklist verified. Disinfectant logged: ${disinfectant} x${qty}ml.`
      });

      // Cross-module: Push cleaning completion note to nursing notifications if available
      if (window.state && window.state.nursingNotifications) {
        window.state.nursingNotifications.unshift({
          id: 'NK-HK-' + Date.now(),
          type: 'HK_CLEAN_COMPLETE',
          bedId: t.bedId,
          message: `Cleaning complete for Bed ${t.bedId}. Awaiting supervisor verification before bed release.`,
          timestamp: new Date().toISOString(),
          read: false
        });
      }
      // Cross-module: Mark bed as Cleaning-Pending-Verify in shared state
      if (window.state.bedsStatus && window.state.bedsStatus[t.bedId]) {
        window.state.bedsStatus[t.bedId].status = 'Cleaning';
        window.state.bedsStatus[t.bedId].notes = 'Clean done, awaiting supervisor verification';
        localStorage.setItem('saronil_bedsStatus', JSON.stringify(window.state.bedsStatus));
      }

      localStorage.setItem('saronil_housekeeping_tasks', JSON.stringify(tasks));
      localStorage.setItem('saronil_hk_audit_logs', JSON.stringify(window.state.hkAuditLogs));
      window.router.navigate(`housekeepingOperations?tab=${_activeOpsSubTab}&t=${Date.now()}`);
    }
  };

  window._hkOperationsOpenRejectModal = function(taskId) {
    _selectedTaskId = taskId;
    _activeModal = 'reject';
    window.router.navigate(`housekeepingOperations?tab=${_activeOpsSubTab}&t=${Date.now()}`);
  };

  window._hkExecuteReject = function() {
    var remarksInp = document.getElementById('reject-remarks-input');
    if (!remarksInp || !remarksInp.value.trim()) {
      alert('Mandatory rejection remarks are required.');
      return;
    }

    var remarks = remarksInp.value.trim();
    var tasks = window.state.housekeepingTasks || [];
    var t = tasks.find(x => x.id === _selectedTaskId);
    if (t) {
      t.status = 'In Progress';
      t.completedTime = null;
      t.audit.push({
        timestamp: new Date().toISOString(),
        user: window.state.activeUserRole || 'HK Supervisor',
        role: window.state.activeUserRole || 'HK Supervisor',
        action: 'REJECT',
        remarks: `Cleaning rejected by supervisor. Mandatory redo remarks: ${remarks}`
      });

      window.state.hkAuditLogs.unshift({
        timestamp: new Date().toISOString(),
        user: window.state.activeUserRole || 'HK Supervisor',
        role: window.state.activeUserRole || 'HK Supervisor',
        action: 'REJECT',
        taskId: t.id,
        roomBed: t.bedId,
        remarks: `Task rejected. Remarks: ${remarks}`
      });

      localStorage.setItem('saronil_housekeeping_tasks', JSON.stringify(tasks));
      localStorage.setItem('saronil_hk_audit_logs', JSON.stringify(window.state.hkAuditLogs));
    }

    window._hkCloseModal();
  };

  window._hkOperationsOpenICSignOff = function(taskId) {
    _selectedTaskId = taskId;
    _activeModal = 'icNurseSignOff';
    window.router.navigate(`housekeepingOperations?tab=${_activeOpsSubTab}&t=${Date.now()}`);
  };

  window._hkOperationsVerify = function(taskId) {
    var tasks = window.state.housekeepingTasks || [];
    var t = tasks.find(x => x.id === taskId);
    if (t) {
      t.status = 'Verified';
      t.verifiedTime = new Date().toISOString();
      t.audit.push({ timestamp: new Date().toISOString(), user: window.state.activeUserRole || 'HK Supervisor', role: window.state.activeUserRole || 'HK Supervisor', action: 'VERIFY', remarks: 'Cleaning verified. released to ready.' });

      // Cross-module: Release bed to Available in shared IPD bed management state
      if (window.state.bedsStatus[t.bedId]) {
        window.state.bedsStatus[t.bedId].status = 'Available';
        window.state.bedsStatus[t.bedId].notes = 'Ready for reallocation';
        window.state.bedsStatus[t.bedId].lastCleanedBy = t.assignee || 'HK Staff';
        window.state.bedsStatus[t.bedId].lastCleanedAt = new Date().toISOString();
      }

      // Cross-module: If OT type task, push OT readiness event
      if (t.source === 'OT' && window.state.otTheatreStatus) {
        if (window.state.otTheatreStatus[t.bedId]) {
          window.state.otTheatreStatus[t.bedId] = 'Ready';
          localStorage.setItem('saronil_ot_theatre_status', JSON.stringify(window.state.otTheatreStatus));
        }
      }

      // Cross-module: Push availability notification to nursing module
      if (window.state.nursingNotifications) {
        window.state.nursingNotifications.unshift({
          id: 'NK-HK-' + Date.now(),
          type: 'BED_AVAILABLE',
          bedId: t.bedId,
          message: `Bed ${t.bedId} has been cleaned, verified, and is now available for admission.`,
          timestamp: new Date().toISOString(),
          read: false
        });
      }

      if (t.assignee) {
        var staffList = window.state.hkStaffList || [];
        var currStaff = staffList.find(s => s.name === t.assignee);
        if (currStaff && currStaff.activeTasks > 0) currStaff.activeTasks--;
      }

      window.state.hkAuditLogs.unshift({
        timestamp: new Date().toISOString(),
        user: window.state.activeUserRole || 'HK Supervisor',
        role: window.state.activeUserRole || 'HK Supervisor',
        action: 'VERIFY',
        taskId: t.id,
        roomBed: t.bedId,
        remarks: 'Verification complete. Released bed.'
      });

      localStorage.setItem('saronil_housekeeping_tasks', JSON.stringify(tasks));
      localStorage.setItem('saronil_bedsStatus', JSON.stringify(window.state.bedsStatus));
      localStorage.setItem('saronil_hk_staff', JSON.stringify(window.state.hkStaffList));
      localStorage.setItem('saronil_hk_audit_logs', JSON.stringify(window.state.hkAuditLogs));
      window.router.navigate(`housekeepingOperations?tab=${_activeOpsSubTab}&t=${Date.now()}`);
    }
  };

  window._hkOperationsPerformAssign = function(taskId) {
    var sel = document.getElementById(`assign-staff-select-${taskId}`);
    var rea = document.getElementById(`assign-reason-${taskId}`);
    if (!sel) return;

    var staffName = sel.value;
    var reason = rea ? rea.value.trim() : '';

    var tasks = window.state.housekeepingTasks || [];
    var t = tasks.find(x => x.id === taskId);
    if (t) {
      var prev = t.assignee;
      t.assignee = staffName;
      t.status = 'Assigned';
      t.assignedTime = new Date().toISOString();
      t.audit.push({
        timestamp: new Date().toISOString(),
        user: window.state.activeUserRole || 'HK Supervisor',
        role: window.state.activeUserRole || 'HK Supervisor',
        action: 'ASSIGN',
        remarks: `Assigned task to ${staffName}.` + (prev ? ` (Reassigned from ${prev}. Reason: ${reason})` : '')
      });

      var staffList = window.state.hkStaffList || [];
      var currStaff = staffList.find(s => s.name === staffName);
      if (currStaff) currStaff.activeTasks++;
      if (prev) {
        var oldStaff = staffList.find(s => s.name === prev);
        if (oldStaff && oldStaff.activeTasks > 0) oldStaff.activeTasks--;
      }

      window.state.hkAuditLogs.unshift({
        timestamp: new Date().toISOString(),
        user: window.state.activeUserRole || 'HK Supervisor',
        role: window.state.activeUserRole || 'HK Supervisor',
        action: 'ASSIGN',
        taskId: t.id,
        roomBed: t.bedId,
        remarks: `Assigned task to ${staffName}.` + (prev ? ` (Reassigned from ${prev}. Reason: ${reason})` : '')
      });

      localStorage.setItem('saronil_housekeeping_tasks', JSON.stringify(tasks));
      localStorage.setItem('saronil_hk_staff', JSON.stringify(staffList));
      localStorage.setItem('saronil_hk_audit_logs', JSON.stringify(window.state.hkAuditLogs));
      window.router.navigate(`housekeepingOperations?tab=${_activeOpsSubTab}&t=${Date.now()}`);
    }
  };

  window._hkOperationsSubmitRequest = function() {
    var typeSel = document.getElementById('ops-raise-type');
    var bedInp = document.getElementById('ops-raise-bed');
    var wardSel = document.getElementById('ops-raise-ward');
    var urgSel = document.getElementById('ops-raise-urgency');
    var remInp = document.getElementById('ops-raise-remarks');

    if (!bedInp || !bedInp.value.trim()) return;

    var type = typeSel.value;
    var bedId = bedInp.value.trim().toUpperCase();
    var ward = wardSel.value;
    var urgency = urgSel.value;
    var remarks = remInp ? remInp.value.trim() : '';

    var tasks = window.state.housekeepingTasks || [];
    
    // Check duplicates blocker
    var hasDuplicate = tasks.some(t => t.bedId === bedId && (t.status === 'New' || t.status === 'Assigned' || t.status === 'In Progress'));
    if (hasDuplicate) {
      alert(`Validation Blocker: An active cleaning request is already open for location ${bedId}.`);
      return;
    }

    if (urgency === 'Urgent' || urgency === 'Emergency') {
      alert(`[Notification Dispatch]: Supervisor alerted immediately for high priority cleaning request at ${bedId}.`);
    }

    var protocolChecklist = {
      'Discharge Cleaning': { "Floor mopped with disinfectant": false, "Surfaces wiped": false, "Bin emptied and relined": false, "Linen changed": false },
      'Isolation Room Cleaning': { "PPE donned": false, "Enhanced disinfectant used": false, "Post-clean fumigation done": false, "IC Nurse notified": false },
      'OT Cleaning': { "OT table and lights wiped": false, "All equipment surfaces wiped": false, "Floor mopped with phenyl": false, "BMW bag sealed and labelled": false }
    };

    var newT = {
      id: `HK-${1000 + tasks.length + 1}`,
      type: type,
      source: ward,
      bedId: bedId,
      status: 'New',
      createdTime: new Date().toISOString(),
      assignee: null,
      assignedTime: null,
      completedTime: null,
      verifiedTime: null,
      icNurseSigned: false,
      icNurseName: null,
      checklist: protocolChecklist[type] || { "Floor mopped with disinfectant": false, "Surfaces wiped": false, "Bin emptied and relined": false },
      audit: [
        { timestamp: new Date().toISOString(), user: window.state.activeUserRole || 'Nurse', role: 'Ward Nurse', action: 'CREATE', remarks: `Cleaning request raised manual. Remarks: ${remarks}` }
      ]
    };

    tasks.push(newT);

    window.state.hkAuditLogs.unshift({
      timestamp: new Date().toISOString(),
      user: window.state.activeUserRole || 'Nurse',
      role: 'Ward Nurse',
      action: 'CREATE',
      taskId: newT.id,
      roomBed: bedId,
      remarks: `Manual cleaning request raised. Urgency: ${urgency}.`
    });

    localStorage.setItem('saronil_housekeeping_tasks', JSON.stringify(tasks));
    localStorage.setItem('saronil_hk_audit_logs', JSON.stringify(window.state.hkAuditLogs));
    
    _activeOpsSubTab = 'dashboard';
    window.router.navigate(`housekeepingOperations?tab=dashboard&t=${Date.now()}`);
  };

  window._hkOperationsSetInspScore = function(key, val) {
    _inspScores[key] = parseFloat(val) || 5;
  };

  window._hkOperationsSubmitInspection = function() {
    var areaSel = document.getElementById('ops-insp-area');
    var dateInp = document.getElementById('ops-insp-date');
    var shiftSel = document.getElementById('ops-insp-shift');
    var remInp = document.getElementById('ops-insp-remarks');
    var rcInp = document.getElementById('ops-insp-rootcause');

    var area = areaSel.value;
    var date = dateInp.value;
    var shift = shiftSel.value;
    var remarks = remInp ? remInp.value.trim() : '';
    var rootCause = rcInp ? rcInp.value.trim() : '';

    var total = 0;
    var keys = Object.keys(_inspScores);
    keys.forEach(k => { total += _inspScores[k]; });
    var avg = Math.round((total / keys.length) * 10) / 10;

    if (avg < 3.5 && !rootCause) {
      alert('Mandatory root cause entry is required since quality score is below the 3.5 threshold.');
      return;
    }

    if (avg < 3.5) {
      alert(`[Quality Notification]: Cleanliness scores breached quality standards. Area ${area} flagged for immediate re-clean.`);
    }

    var inspections = window.state.hkInspections || [];
    var newInsp = {
      id: `INSP-${500 + inspections.length + 1}`,
      area: area,
      date: date,
      shift: shift,
      inspector: window.state.activeUserRole || 'Manager Satish',
      score: avg,
      threshold: 3.5,
      remarks: remarks,
      rootCause: rootCause
    };

    inspections.unshift(newInsp);
    localStorage.setItem('saronil_hk_inspections', JSON.stringify(inspections));

    // Reset scores
    _inspScores = { floor: 5, surface: 5, bin: 5, linen: 5, odour: 5, overall: 5 };
    window.router.navigate(`housekeepingOperations?tab=${_activeOpsSubTab}&t=${Date.now()}`);
  };

  // Re-map old actions for verification
  window._hkExecuteAssign = function() {
    var select = document.getElementById('assign-staff-select');
    var reasonInp = document.getElementById('assign-reason-input');
    if (!select) return;

    var staffName = select.value;
    var reason = reasonInp ? reasonInp.value.trim() : '';

    var tasks = window.state.housekeepingTasks || [];
    var t = tasks.find(x => x.id === _selectedTaskId);
    if (t) {
      var prev = t.assignee;
      t.assignee = staffName;
      t.status = 'Assigned';
      t.assignedTime = new Date().toISOString();
      t.audit.push({
        timestamp: new Date().toISOString(),
        user: window.state.activeUserRole || 'HK Supervisor',
        role: window.state.activeUserRole || 'HK Supervisor',
        action: 'ASSIGN',
        remarks: `Assigned task to ${staffName}.` + (prev ? ` (Reassigned from ${prev}. Reason: ${reason})` : '')
      });

      var staffList = window.state.hkStaffList || [];
      var currStaff = staffList.find(s => s.name === staffName);
      if (currStaff) currStaff.activeTasks++;
      if (prev) {
        var oldStaff = staffList.find(s => s.name === prev);
        if (oldStaff && oldStaff.activeTasks > 0) oldStaff.activeTasks--;
      }

      window.state.hkAuditLogs.unshift({
        timestamp: new Date().toISOString(),
        user: window.state.activeUserRole || 'HK Supervisor',
        role: window.state.activeUserRole || 'HK Supervisor',
        action: 'ASSIGN',
        taskId: t.id,
        roomBed: t.bedId,
        remarks: `Assigned task to ${staffName}.` + (prev ? ` (Reassigned from ${prev}. Reason: ${reason})` : '')
      });

      localStorage.setItem('saronil_housekeeping_tasks', JSON.stringify(tasks));
      localStorage.setItem('saronil_hk_staff', JSON.stringify(staffList));
      localStorage.setItem('saronil_hk_audit_logs', JSON.stringify(window.state.hkAuditLogs));
    }

    window._hkCloseModal();
  };

  window._hkExecuteICSignOff = function() {
    var pinInp = document.getElementById('ic-nurse-pin-input');
    var nameInp = document.getElementById('ic-nurse-name-input');
    if (!pinInp || !nameInp) return;

    var pin = pinInp.value;
    var nurseName = nameInp.value.trim();

    if (pin !== '1234') {
      alert('Invalid e-Signature Credentials PIN.');
      return;
    }
    if (!nurseName) {
      alert('Please enter signatory name.');
      return;
    }

    var tasks = window.state.housekeepingTasks || [];
    var t = tasks.find(x => x.id === _selectedTaskId);
    if (t) {
      t.icNurseSigned = true;
      t.icNurseName = nurseName;
      t.status = 'Verified';
      t.verifiedTime = new Date().toISOString();
      t.audit.push({
        timestamp: new Date().toISOString(),
        user: nurseName,
        role: 'Infection Control Nurse',
        action: 'IC_SIGN_OFF',
        remarks: 'Infection control release authorization signed.'
      });

      if (window.state.bedsStatus[t.bedId]) {
        window.state.bedsStatus[t.bedId].status = 'Available';
        window.state.bedsStatus[t.bedId].notes = 'Quarantine cleared';
        window.state.bedsStatus[t.bedId].lastCleanedBy = nurseName;
        window.state.bedsStatus[t.bedId].lastCleanedAt = new Date().toISOString();
      }

      if (t.assignee) {
        var staffList = window.state.hkStaffList || [];
        var currStaff = staffList.find(s => s.name === t.assignee);
        if (currStaff && currStaff.activeTasks > 0) currStaff.activeTasks--;
      }

      // Cross-module: Post IC clearance event to infection control log if the module state exists
      if (window.state.icEvents) {
        window.state.icEvents.unshift({
          id: 'IC-HK-' + Date.now(),
          type: 'HK_ISOLATION_CLEAR',
          bedId: t.bedId,
          signedBy: nurseName,
          timestamp: new Date().toISOString(),
          remarks: `Isolation room Bed ${t.bedId} cleared by IC Nurse after terminal clean.`
        });
        localStorage.setItem('saronil_ic_events', JSON.stringify(window.state.icEvents));
      }

      // Cross-module: Notify nursing module of bed clearance
      if (window.state.nursingNotifications) {
        window.state.nursingNotifications.unshift({
          id: 'NK-IC-' + Date.now(),
          type: 'BED_AVAILABLE',
          bedId: t.bedId,
          message: `Isolation Bed ${t.bedId} cleared by IC Nurse ${nurseName} and is now available.`,
          timestamp: new Date().toISOString(),
          read: false
        });
      }

      window.state.hkAuditLogs.unshift({
        timestamp: new Date().toISOString(),
        user: nurseName,
        role: 'Infection Control Nurse',
        action: 'IC_SIGN_OFF',
        taskId: t.id,
        roomBed: t.bedId,
        remarks: `Infection Control release cleared. Bed ${t.bedId} returned to pool.`
      });

      localStorage.setItem('saronil_housekeeping_tasks', JSON.stringify(tasks));
      localStorage.setItem('saronil_bedsStatus', JSON.stringify(window.state.bedsStatus));
      localStorage.setItem('saronil_hk_staff', JSON.stringify(window.state.hkStaffList));
      localStorage.setItem('saronil_hk_audit_logs', JSON.stringify(window.state.hkAuditLogs));
    }

    window._hkCloseModal();
  };

  // Click Bed interactions
  window._hkClickBed = function(bedId, status, wardKey) {
    if (status === 'Dirty') {
      var tasks = window.state.housekeepingTasks || [];
      var activeT = tasks.find(t => t.bedId === bedId && t.status !== 'Verified' && t.status !== 'Closed' && t.status !== 'Cancelled');
      if (activeT) {
        _selectedTaskId = activeT.id;
        _taskFilter = activeT.status;
        _activeOpsSubTab = 'dashboard';
        window.router.navigate(`housekeepingOperations?tab=dashboard&t=${Date.now()}`);
      } else {
        _selectedBedId = bedId;
        _activeOpsSubTab = 'raise';
        window.router.navigate(`housekeepingOperations?tab=raise&t=${Date.now()}`);
      }
    } else if (status === 'Available' || status === 'Ready') {
      var action = confirm(`Bed ${bedId} is vacant and ready. Mark as Out of Service (Blocked) for maintenance?`);
      if (action) {
        window.state.bedsStatus[bedId].status = 'Blocked';
        window.state.bedsStatus[bedId].notes = 'Blocked for maintenance';
        localStorage.setItem('saronil_bedsStatus', JSON.stringify(window.state.bedsStatus));
        window.router.navigate(`housekeepingOperations?tab=beds&t=${Date.now()}`);
      }
    } else if (status === 'Blocked') {
      var action = confirm(`Release block on bed ${bedId} and return to Available vacant pool?`);
      if (action) {
        window.state.bedsStatus[bedId].status = 'Available';
        window.state.bedsStatus[bedId].notes = 'Released from maintenance';
        localStorage.setItem('saronil_bedsStatus', JSON.stringify(window.state.bedsStatus));
        window.router.navigate(`housekeepingOperations?tab=beds&t=${Date.now()}`);
      }
    }
  };

  // LAUNDRY ACTION HANDLERS
  window._hkSetLaundrySubTab = function(subTabId) {
    _activeLaundrySubTab = subTabId;
    window.router.navigate(`laundry?tab=${subTabId}&t=${Date.now()}`);
  };

  window._hkLndSetSearchQuery = function(q) {
    _laundrySearchQuery = q;
    if (window._hkSearchDebounce) clearTimeout(window._hkSearchDebounce);
    window._hkSearchDebounce = setTimeout(function() {
      window.router.navigate(`laundry?tab=${_activeLaundrySubTab}&t=${Date.now()}`);
    }, 300);
  };

  window._hkLndSetCategoryFilter = function(cat) {
    _laundryCategoryFilter = cat;
    window.router.navigate(`laundry?tab=${_activeLaundrySubTab}&t=${Date.now()}`);
  };

  window._hkLndSetStatusFilter = function(status) {
    _laundryStatusFilter = status;
    window.router.navigate(`laundry?tab=${_activeLaundrySubTab}&t=${Date.now()}`);
  };

  window._hkLndAddNewLinen = function() {
    var code = document.getElementById('add-lnd-code').value;
    var name = document.getElementById('add-lnd-name').value;
    var cat = document.getElementById('add-lnd-category').value;
    var size = document.getElementById('add-lnd-size').value;
    var vendor = document.getElementById('add-lnd-vendor').value;
    var pDate = document.getElementById('add-lnd-date').value;
    var maxWash = parseInt(document.getElementById('add-lnd-max').value) || 100;
    var barcode = document.getElementById('add-lnd-barcode').value || '';

    var items = window.state.linenItems || [];
    if (items.some(x => x.code === code)) {
      alert(`Item with code ${code} already exists.`);
      return;
    }

    var newItem = {
      code: code,
      name: name,
      category: cat,
      size: size,
      department: '',
      status: 'Available',
      barcode: barcode,
      vendor: vendor,
      purchaseDate: pDate,
      maxWashCount: maxWash,
      currentWashCount: 0
    };
    items.unshift(newItem);

    window.state.laundryAuditLogs.unshift({
      txId: `TX-LND-${100 + window.state.laundryAuditLogs.length + 1}`,
      user: window.state.activeUserRole || 'HK Manager',
      role: window.state.activeUserRole || 'HK Manager',
      action: 'ADD_LINEN',
      linenCode: code,
      fromState: '—',
      toState: 'Available',
      timestamp: new Date().toLocaleDateString('en-IN') + ' · ' + new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      remarks: `Registered new linen item ${name} with max wash count ${maxWash}.`
    });

    localStorage.setItem('saronil_linen_items', JSON.stringify(items));
    localStorage.setItem('saronil_laundry_audit_logs', JSON.stringify(window.state.laundryAuditLogs));
    window.router.navigate(`laundry?tab=${_activeLaundrySubTab}&t=${Date.now()}`);
  };

  window._hkLndSubmitRequest = function() {
    var dept = document.getElementById('issue-req-dept').value;
    var cat = document.getElementById('issue-req-category').value;
    var qty = parseInt(document.getElementById('issue-req-qty').value) || 0;
    var remarks = document.getElementById('issue-req-remarks').value || '';

    var requests = window.state.linenRequests || [];
    var newReq = {
      reqNo: `REQ-LN-${200 + requests.length + 1}`,
      date: new Date().toLocaleDateString('en-IN') + ' · ' + new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      requestedBy: window.state.activeUserRole || 'Ward Nurse',
      department: dept,
      category: cat,
      qty: qty,
      remarks: remarks,
      status: 'Pending Approval'
    };
    requests.unshift(newReq);

    localStorage.setItem('saronil_linen_requests', JSON.stringify(requests));
    window.router.navigate(`laundry?tab=${_activeLaundrySubTab}&t=${Date.now()}`);
  };

  window._hkLndApproveRequest = function(reqNo) {
    var reqs = window.state.linenRequests || [];
    var r = reqs.find(x => x.reqNo === reqNo);
    if (r) {
      var items = window.state.linenItems || [];
      var available = items.filter(x => x.category === r.category && x.status === 'Available');
      if (available.length < r.qty) {
        alert(`Insufficient available stock of ${r.category}. Only ${available.length} items available.`);
        return;
      }

      var validItems = [];
      for (var i = 0; i < available.length; i++) {
        if (available[i].currentWashCount >= available[i].maxWashCount) {
          continue;
        }
        validItems.push(available[i]);
        if (validItems.length === r.qty) break;
      }

      if (validItems.length < r.qty) {
        alert(`Could not issue requested quantity. Some available items have reached their maximum wash count limit and are flagged for condemnation.`);
        return;
      }

      validItems.forEach(x => {
        x.status = 'Issued';
        x.department = r.department;
      });

      r.status = 'Approved';

      window.state.laundryAuditLogs.unshift({
        txId: `TX-LND-${100 + window.state.laundryAuditLogs.length + 1}`,
        user: 'Laundry Supervisor',
        role: 'Laundry Supervisor',
        action: 'ISSUE_APPROVE',
        linenCode: r.category,
        fromState: 'Available',
        toState: 'Issued',
        timestamp: new Date().toLocaleDateString('en-IN') + ' · ' + new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        remarks: `Approved issue request ${r.reqNo} for ${r.qty} pieces to ${r.department}.`
      });

      localStorage.setItem('saronil_linen_requests', JSON.stringify(reqs));
      localStorage.setItem('saronil_linen_items', JSON.stringify(items));
      localStorage.setItem('saronil_laundry_audit_logs', JSON.stringify(window.state.laundryAuditLogs));
      window.router.navigate(`laundry?tab=${_activeLaundrySubTab}&t=${Date.now()}`);
    }
  };

  window._hkLndRejectRequest = function(reqNo) {
    var reqs = window.state.linenRequests || [];
    var r = reqs.find(x => x.reqNo === reqNo);
    if (r) {
      r.status = 'Rejected';
      localStorage.setItem('saronil_linen_requests', JSON.stringify(reqs));
      window.router.navigate(`laundry?tab=${_activeLaundrySubTab}&t=${Date.now()}`);
    }
  };

  window._hkLndAckRequest = function(reqNo) {
    var reqs = window.state.linenRequests || [];
    var r = reqs.find(x => x.reqNo === reqNo);
    if (r) {
      r.status = 'Acknowledged';
      localStorage.setItem('saronil_linen_requests', JSON.stringify(reqs));
      window.router.navigate(`laundry?tab=${_activeLaundrySubTab}&t=${Date.now()}`);
    }
  };

  window._hkLndCollectDirty = function() {
    var dept = document.getElementById('dirty-col-dept').value;
    var inf = parseInt(document.getElementById('dirty-col-inf').value) || 0;
    var noninf = parseInt(document.getElementById('dirty-col-noninf').value) || 0;
    var infType = document.getElementById('dirty-col-inf-type').value || '';
    var remarks = document.getElementById('dirty-col-remarks').value || '';

    if (inf > 0 && noninf > 0 && !remarks) {
      alert('Remarks / Sorting Notes are mandatory when recording a mixed collection (infected + non-infected pieces).');
      return;
    }

    var total = inf + noninf;
    if (total <= 0) {
      alert('Quantity must be greater than 0.');
      return;
    }

    var items = window.state.linenItems || [];
    var deptIssued = items.filter(x => x.department === dept && x.status === 'Issued');
    
    var count = 0;
    for (var i = 0; i < deptIssued.length; i++) {
      deptIssued[i].status = 'Dirty';
      count++;
      if (count === total) break;
    }

    var collections = window.state.dirtyCollections || [];
    var newCol = {
      colId: `COL-DIR-${400 + collections.length + 1}`,
      dateTime: new Date().toLocaleDateString('en-IN') + ' · ' + new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      department: dept,
      collectedBy: 'Operator Ramu',
      totalPieces: total,
      infectedQty: inf,
      nonInfectedQty: noninf,
      infectionType: infType,
      remarks: remarks,
      status: 'Collected'
    };
    collections.unshift(newCol);

    var batches = window.state.laundryBatches || [];
    if (inf > 0) {
      batches.unshift({
        batchId: `BAT-LND-${300 + batches.length + 1}`,
        sourceDept: dept,
        pieces: inf,
        type: 'Infected',
        currentStage: 'Received',
        machine: 'None',
        operator: 'Operator Ramu',
        started: new Date().toLocaleDateString('en-IN') + ' · ' + new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        eta: 'Within 2h',
        damagedCount: 0
      });
      var dirtyInfs = items.filter(x => x.department === dept && x.status === 'Dirty');
      dirtyInfs.slice(0, inf).forEach(x => x.status = 'Processing');
    }

    if (noninf > 0) {
      batches.unshift({
        batchId: `BAT-LND-${300 + batches.length + 1}`,
        sourceDept: dept,
        pieces: noninf,
        type: 'Non-Infected',
        currentStage: 'Received',
        machine: 'None',
        operator: 'Operator Ramu',
        started: new Date().toLocaleDateString('en-IN') + ' · ' + new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        eta: 'Within 3h',
        damagedCount: 0
      });
      var dirtyNonInfs = items.filter(x => x.department === dept && x.status === 'Dirty');
      dirtyNonInfs.slice(0, noninf).forEach(x => x.status = 'Processing');
    }

    window.state.laundryAuditLogs.unshift({
      txId: `TX-LND-${100 + window.state.laundryAuditLogs.length + 1}`,
      user: 'Operator Ramu',
      role: 'Laundry Operator',
      action: 'DIRTY_COLLECT',
      linenCode: dept,
      fromState: 'Issued',
      toState: 'Dirty',
      timestamp: new Date().toLocaleDateString('en-IN') + ' · ' + new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      remarks: `Recorded collection ID ${newCol.colId} from ${dept} (Total: ${total}, Infected: ${inf}).`
    });

    localStorage.setItem('saronil_dirty_collections', JSON.stringify(collections));
    localStorage.setItem('saronil_laundry_batches', JSON.stringify(batches));
    localStorage.setItem('saronil_linen_items', JSON.stringify(items));
    localStorage.setItem('saronil_laundry_audit_logs', JSON.stringify(window.state.laundryAuditLogs));
    window.router.navigate(`laundry?tab=${_activeLaundrySubTab}&t=${Date.now()}`);
  };

  window._hkLndUpdateMachineCycle = function(mName) {
    var machs = window.state.laundryMachines || [];
    var m = machs.find(x => x.name === mName);
    if (m) {
      m.cycleCount += 5;
      if (m.cycleCount >= m.threshold) {
        m.serviceDue = true;
      }
      localStorage.setItem('saronil_laundry_machines', JSON.stringify(machs));
      window.router.navigate(`laundry?tab=${_activeLaundrySubTab}&t=${Date.now()}`);
    }
  };

  window._hkLndUpdateBatchStage = function(batchId, nextStage) {
    var batches = window.state.laundryBatches || [];
    var b = batches.find(x => x.batchId === batchId);
    if (b) {
      var oldStage = b.currentStage;
      b.currentStage = nextStage;

      if (nextStage === 'Washing') {
        b.machine = 'Autoclave Washer 01';
      } else if (nextStage === 'Drying') {
        b.machine = 'Steam Dryer 02';
      } else if (nextStage === 'Ironing / Folding') {
        b.machine = 'Flatwork Ironer 03';
      } else {
        b.machine = 'None';
      }

      if (nextStage === 'Ready for Distribution') {
        var items = window.state.linenItems || [];
        var deptProcessing = items.filter(x => x.department === b.sourceDept && x.status === 'Processing');
        var count = 0;
        for (var i = 0; i < deptProcessing.length; i++) {
          deptProcessing[i].currentWashCount = Math.min(deptProcessing[i].maxWashCount, deptProcessing[i].currentWashCount + 1);
          
          if (deptProcessing[i].currentWashCount === deptProcessing[i].maxWashCount) {
            deptProcessing[i].status = 'Dirty';
            window.state.laundryAuditLogs.unshift({
              txId: `TX-LND-${100 + window.state.laundryAuditLogs.length + 1}`,
              user: 'System',
              role: 'System',
              action: 'AUTO_FLAG',
              linenCode: deptProcessing[i].code,
              fromState: 'Processing',
              toState: 'Dirty',
              timestamp: new Date().toLocaleDateString('en-IN') + ' · ' + new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
              remarks: `Item ${deptProcessing[i].code} reached max wash count (${deptProcessing[i].maxWashCount}). Blocked from reissue.`
            });
          } else {
            deptProcessing[i].status = 'Ready';
          }
          count++;
          if (count === b.pieces) break;
        }
        localStorage.setItem('saronil_linen_items', JSON.stringify(items));
      }

      window.state.laundryAuditLogs.unshift({
        txId: `TX-LND-${100 + window.state.laundryAuditLogs.length + 1}`,
        user: 'Operator Ramu',
        role: 'Laundry Operator',
        action: 'BATCH_UPDATE',
        linenCode: batchId,
        fromState: oldStage,
        toState: nextStage,
        timestamp: new Date().toLocaleDateString('en-IN') + ' · ' + new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        remarks: `Moved batch ${batchId} to ${nextStage}.`
      });

      localStorage.setItem('saronil_laundry_batches', JSON.stringify(batches));
      localStorage.setItem('saronil_laundry_audit_logs', JSON.stringify(window.state.laundryAuditLogs));
      window.router.navigate(`laundry?tab=${_activeLaundrySubTab}&t=${Date.now()}`);
    }
  };

  window._hkLndLogDamage = function(batchId, countStr) {
    var count = parseInt(countStr) || 0;
    if (count <= 0) return;

    var batches = window.state.laundryBatches || [];
    var b = batches.find(x => x.batchId === batchId);
    if (b) {
      b.damagedCount += count;
      b.pieces = Math.max(0, b.pieces - count);

      var items = window.state.linenItems || [];
      var processingItems = items.filter(x => x.department === b.sourceDept && x.status === 'Processing');
      var updated = 0;
      for (var i = 0; i < processingItems.length; i++) {
        processingItems[i].status = 'Damaged';
        
        var repairs = window.state.linenRepairs || [];
        repairs.unshift({
          repairId: `REP-LND-${600 + repairs.length + 1}`,
          linenCode: processingItems[i].code,
          linenName: processingItems[i].name,
          damageType: 'Tear / Rip',
          foundAtStage: b.currentStage,
          loggedBy: 'Operator Somu',
          desc: `Discovered damaged pieces during laundry cycle stage ${b.currentStage}.`,
          status: 'In Repair'
        });
        localStorage.setItem('saronil_linen_repairs', JSON.stringify(repairs));

        updated++;
        if (updated === count) break;
      }

      localStorage.setItem('saronil_laundry_batches', JSON.stringify(batches));
      localStorage.setItem('saronil_linen_items', JSON.stringify(items));
      window.router.navigate(`laundry?tab=${_activeLaundrySubTab}&t=${Date.now()}`);
    }
  };

  window._hkLndDispatchClean = function() {
    var bId = document.getElementById('disp-batch').value;
    var dept = document.getElementById('disp-dept').value;
    var cat = document.getElementById('disp-category').value;
    var qty = parseInt(document.getElementById('disp-qty').value) || 0;
    var staff = document.getElementById('disp-staff').value;
    var remarks = document.getElementById('disp-remarks').value || '';

    if (qty <= 0) return;

    var dispatches = window.state.laundryDispatches || [];
    var newDsp = {
      dispatchId: `DSP-LND-${900 + dispatches.length + 1}`,
      fromBatch: bId,
      dispatchTo: dept,
      category: cat,
      qty: qty,
      receivedBy: staff,
      remarks: remarks,
      dispatchTime: new Date().toLocaleDateString('en-IN') + ' · ' + new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      status: 'Pending Acknowledgment'
    };
    dispatches.unshift(newDsp);

    var batches = window.state.laundryBatches || [];
    window.state.laundryBatches = batches.filter(x => x.batchId !== bId);

    localStorage.setItem('saronil_laundry_dispatches', JSON.stringify(dispatches));
    localStorage.setItem('saronil_laundry_batches', JSON.stringify(window.state.laundryBatches));
    window.router.navigate(`laundry?tab=${_activeLaundrySubTab}&t=${Date.now()}`);
  };

  window._hkLndAckDispatch = function(dspId) {
    var dispatches = window.state.laundryDispatches || [];
    var d = dispatches.find(x => x.dispatchId === dspId);
    if (d) {
      d.status = 'Acknowledged';

      var items = window.state.linenItems || [];
      var readyItems = items.filter(x => x.category === d.category && x.status === 'Ready');
      var count = 0;
      for (var i = 0; i < readyItems.length; i++) {
        readyItems[i].status = 'Available';
        readyItems[i].department = d.dispatchTo;
        count++;
        if (count === d.qty) break;
      }

      window.state.laundryAuditLogs.unshift({
        txId: `TX-LND-${100 + window.state.laundryAuditLogs.length + 1}`,
        user: d.receivedBy,
        role: 'Ward / OT Nurse',
        action: 'DISTRIBUTE_ACK',
        linenCode: d.category,
        fromState: 'Ready',
        toState: 'Available',
        timestamp: new Date().toLocaleDateString('en-IN') + ' · ' + new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        remarks: `Acknowledged clean linen handover for ${d.qty} pieces at ${d.dispatchTo}.`
      });

      localStorage.setItem('saronil_laundry_dispatches', JSON.stringify(dispatches));
      localStorage.setItem('saronil_linen_items', JSON.stringify(items));
      localStorage.setItem('saronil_laundry_audit_logs', JSON.stringify(window.state.laundryAuditLogs));
      window.router.navigate(`laundry?tab=${_activeLaundrySubTab}&t=${Date.now()}`);
    }
  };

  window._hkLndSubmitReturn = function() {
    var dept = document.getElementById('ret-dept').value;
    var cat = document.getElementById('ret-category').value;
    var qty = parseInt(document.getElementById('ret-qty').value) || 0;
    var cond = document.getElementById('ret-condition').value;
    var staff = document.getElementById('ret-staff').value;
    var remarks = document.getElementById('ret-remarks').value || '';

    if (qty <= 0) return;

    var returns = window.state.linenReturns || [];
    var newRet = {
      returnId: `RET-LND-${500 + returns.length + 1}`,
      returnDate: new Date().toLocaleDateString('en-IN') + ' · ' + new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      returnedFrom: dept,
      returnedBy: staff,
      category: cat,
      qty: qty,
      condition: cond,
      inspectedBy: 'Supervisor Satish',
      action: cond === 'Clean / Unused' ? 'Returned to Stock' : (cond === 'Dirty' ? 'Routed to Dirty Collection' : 'Routed to Repair'),
      remarks: remarks
    };
    returns.unshift(newRet);

    var items = window.state.linenItems || [];
    if (cond === 'Clean / Unused') {
      var issuedItems = items.filter(x => x.department === dept && x.status === 'Issued');
      var count = 0;
      for (var i = 0; i < issuedItems.length; i++) {
        issuedItems[i].status = 'Available';
        issuedItems[i].department = '';
        count++;
        if (count === qty) break;
      }
    } else if (cond === 'Dirty') {
      var issuedItems = items.filter(x => x.department === dept && x.status === 'Issued');
      var count = 0;
      for (var i = 0; i < issuedItems.length; i++) {
        issuedItems[i].status = 'Dirty';
        count++;
        if (count === qty) break;
      }
    } else if (cond === 'Damaged') {
      var issuedItems = items.filter(x => x.department === dept && x.status === 'Issued');
      var count = 0;
      for (var i = 0; i < issuedItems.length; i++) {
        issuedItems[i].status = 'Damaged';
        
        var repairs = window.state.linenRepairs || [];
        repairs.unshift({
          repairId: `REP-LND-${600 + repairs.length + 1}`,
          linenCode: issuedItems[i].code,
          linenName: issuedItems[i].name,
          damageType: 'Tear / Rip',
          foundAtStage: 'Return Inspection',
          loggedBy: 'Supervisor Satish',
          desc: remarks || 'Damaged noticed during return.',
          status: 'In Repair'
        });
        localStorage.setItem('saronil_linen_repairs', JSON.stringify(repairs));

        count++;
        if (count === qty) break;
      }
    }

    localStorage.setItem('saronil_linen_returns', JSON.stringify(returns));
    localStorage.setItem('saronil_linen_items', JSON.stringify(items));
    window.router.navigate(`laundry?tab=${_activeLaundrySubTab}&t=${Date.now()}`);
  };

  window._hkLndSubmitRepair = function() {
    var code = document.getElementById('rep-code').value;
    var dType = document.getElementById('rep-damage-type').value;
    var stage = document.getElementById('rep-stage').value;
    var desc = document.getElementById('rep-desc').value || '';

    var items = window.state.linenItems || [];
    var item = items.find(x => x.code === code);
    if (!item) {
      alert(`Linen item with code ${code} not found in master database.`);
      return;
    }

    item.status = 'Damaged';

    var repairs = window.state.linenRepairs || [];
    var newRep = {
      repairId: `REP-LND-${600 + repairs.length + 1}`,
      linenCode: code,
      linenName: item.name,
      damageType: dType,
      foundAtStage: stage,
      loggedBy: 'Supervisor Satish',
      desc: desc,
      status: 'In Repair'
    };
    repairs.unshift(newRep);

    localStorage.setItem('saronil_linen_repairs', JSON.stringify(repairs));
    localStorage.setItem('saronil_linen_items', JSON.stringify(items));
    window.router.navigate(`laundry?tab=${_activeLaundrySubTab}&t=${Date.now()}`);
  };

  window._hkLndRepairAction = function(repId, act) {
    var repairs = window.state.linenRepairs || [];
    var r = repairs.find(x => x.repairId === repId);
    if (r) {
      r.status = act;

      var items = window.state.linenItems || [];
      var item = items.find(x => x.code === r.linenCode);
      if (item) {
        if (act === 'Repaired') {
          item.status = 'Available';
          item.department = '';
        } else if (act === 'Irreparable') {
          item.status = 'Dirty';
        }
      }

      localStorage.setItem('saronil_linen_repairs', JSON.stringify(repairs));
      localStorage.setItem('saronil_linen_items', JSON.stringify(items));
      window.router.navigate(`laundry?tab=${_activeLaundrySubTab}&t=${Date.now()}`);
    }
  };

  window._hkLndRejectCondemn = function(code) {
    var items = window.state.linenItems || [];
    var item = items.find(x => x.code === code);
    if (item) {
      item.status = 'Damaged';
      var repairs = window.state.linenRepairs || [];
      var r = repairs.find(x => x.linenCode === code);
      if (r) {
        r.status = 'In Repair';
        r.desc += ' [Condemnation Rejected by HK Manager]';
      }
      localStorage.setItem('saronil_linen_items', JSON.stringify(items));
      localStorage.setItem('saronil_linen_repairs', JSON.stringify(repairs));
      window.router.navigate(`laundry?tab=${_activeLaundrySubTab}&t=${Date.now()}`);
    }
  };

  window._hkLndSubmitVendorRequest = function() {
    var vName = document.getElementById('vend-name').value;
    var cat = document.getElementById('vend-category').value;
    var qty = parseInt(document.getElementById('vend-qty').value) || 0;
    var pickup = document.getElementById('vend-pickup').value;
    var expected = document.getElementById('vend-expected').value;
    var remarks = document.getElementById('vend-instructions').value || '';

    if (qty <= 0) return;

    var items = window.state.linenItems || [];
    var available = items.filter(x => x.category === cat && x.status === 'Available');
    if (available.length < qty) {
      alert(`Insufficient available stock of ${cat}. Only ${available.length} items available.`);
      return;
    }

    var count = 0;
    for (var i = 0; i < available.length; i++) {
      available[i].status = 'With Vendor';
      count++;
      if (count === qty) break;
    }

    var vendors = window.state.vendorLaundry || [];
    vendors.unshift({
      vReqId: `VEN-LND-${800 + vendors.length + 1}`,
      vendorName: vName,
      category: cat,
      qtySent: qty,
      pickupDate: pickup,
      expectedReturnDate: expected,
      remarks: remarks,
      status: 'Sent'
    });

    localStorage.setItem('saronil_vendor_laundry', JSON.stringify(vendors));
    localStorage.setItem('saronil_linen_items', JSON.stringify(items));
    window.router.navigate(`laundry?tab=${_activeLaundrySubTab}&t=${Date.now()}`);
  };

  window._hkLndReceiveVendorReturn = function(vReqId, cStr, dStr, mStr) {
    var clean = parseInt(cStr) || 0;
    var damaged = parseInt(dStr) || 0;
    var missing = parseInt(mStr) || 0;

    var vendors = window.state.vendorLaundry || [];
    var v = vendors.find(x => x.vReqId === vReqId);
    if (v) {
      var totalRet = clean + damaged + missing;
      if (totalRet !== v.qtySent) {
        alert(`Discrepancy alert! Sent: ${v.qtySent}, Returned: ${totalRet}. Please check discrepancies notes.`);
      }

      v.status = 'Returned';

      var items = window.state.linenItems || [];
      var vendorItems = items.filter(x => x.category === v.category && x.status === 'With Vendor');
      
      var count = 0;
      for (var i = 0; i < Math.min(clean, vendorItems.length); i++) {
        vendorItems[count].status = 'Available';
        vendorItems[count].department = '';
        count++;
      }

      for (var i = 0; i < Math.min(damaged, vendorItems.length - count); i++) {
        vendorItems[count].status = 'Damaged';
        count++;
      }

      localStorage.setItem('saronil_vendor_laundry', JSON.stringify(vendors));
      localStorage.setItem('saronil_linen_items', JSON.stringify(items));
      window.router.navigate(`laundry?tab=${_activeLaundrySubTab}&t=${Date.now()}`);
    }
  };

  window._hkLndExportReport = function(rName) {
    var csvContent = "data:text/csv;charset=utf-8,Report: " + rName + "\\nTimestamp: " + new Date().toISOString() + "\\nMetric,Value\\nCleaned,90\\nInfected,40\\nDamaged,3\\nTAT,2.25h";
    var encodedUri = encodeURI(csvContent);
    var link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `laundry_${rName.toLowerCase().replace(/\\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // CSSD MODULE ACTIONS
  window._hkSetCssdSubTab = function(subTabId) {
    _activeCssdSubTab = subTabId;
    window.router.navigate(`cssd?tab=${subTabId}&t=${Date.now()}`);
  };

  window._hkCssdSetSearchQuery = function(q) {
    _cssdSearchQuery = q;
    if (window._hkSearchDebounce) clearTimeout(window._hkSearchDebounce);
    window._hkSearchDebounce = setTimeout(function() {
      window.router.navigate(`cssd?tab=${_activeCssdSubTab}&t=${Date.now()}`);
    }, 300);
  };

  window._hkCssdSetMethodFilter = function(method) {
    _cssdMethodFilter = method;
    window.router.navigate(`cssd?tab=${_activeCssdSubTab}&t=${Date.now()}`);
  };

  window._hkCssdSetStatusFilter = function(status) {
    _cssdStatusFilter = status;
    window.router.navigate(`cssd?tab=${_activeCssdSubTab}&t=${Date.now()}`);
  };

  window._hkCssdAddNewTray = function() {
    var id = document.getElementById('add-cs-id').value;
    var name = document.getElementById('add-cs-name').value;
    var dept = document.getElementById('add-cs-dept').value;
    var method = document.getElementById('add-cs-method').value;
    var instrStr = document.getElementById('add-cs-instr').value;

    var trays = window.state.cssdTrays || [];
    if (trays.some(x => x.trayId === id)) {
      alert(`Tray with ID ${id} already exists.`);
      return;
    }

    var instrumentsList = instrStr.split(',').map(s => {
      var parts = s.trim().split(' x');
      return { name: parts[0], count: parseInt(parts[1]) || 1 };
    });

    var newTray = {
      trayId: id,
      trayName: name,
      instruments: instrumentsList,
      department: dept,
      method: method,
      lastSterilized: '—',
      validUntil: '—',
      cycleCount: 0,
      status: 'Available',
      rackLocation: '—'
    };
    trays.unshift(newTray);

    window.state.cssdAuditLogs.unshift({
      txId: `TX-CS-${100 + window.state.cssdAuditLogs.length + 1}`,
      user: window.state.activeUserRole || 'HK Manager',
      role: window.state.activeUserRole || 'HK Manager',
      action: 'ADD_TRAY',
      code: id,
      fromState: '—',
      toState: 'Available',
      timestamp: new Date().toLocaleDateString('en-IN') + ' · ' + new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      remarks: `Registered new instrument tray ${name} under ${dept}.`
    });

    localStorage.setItem('saronil_cssd_trays', JSON.stringify(trays));
    localStorage.setItem('saronil_cssd_audit_logs', JSON.stringify(window.state.cssdAuditLogs));
    window.router.navigate(`cssd?tab=${_activeCssdSubTab}&t=${Date.now()}`);
  };

  window._hkCssdQuarantineTray = function(trayId) {
    var trays = window.state.cssdTrays || [];
    var t = trays.find(x => x.trayId === trayId);
    if (t) {
      t.status = 'Quarantine';

      var quarantines = window.state.cssdQuarantines || [];
      quarantines.unshift({
        trayId: trayId,
        reason: 'Manual quarantine trigger by supervisor',
        quarantinedBy: 'Supervisor Satish',
        date: new Date().toLocaleDateString('en-IN') + ' · ' + new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        notes: 'Awaiting inspection report.',
        owner: 'Supervisor Satish',
        status: 'Active'
      });

      window.state.cssdAuditLogs.unshift({
        txId: `TX-CS-${100 + window.state.cssdAuditLogs.length + 1}`,
        user: 'Supervisor Satish',
        role: 'CSSD Supervisor',
        action: 'QUARANTINE',
        code: trayId,
        fromState: 'Available',
        toState: 'Quarantine',
        timestamp: new Date().toLocaleDateString('en-IN') + ' · ' + new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        remarks: `Tray ${trayId} placed in quarantine.`
      });

      localStorage.setItem('saronil_cssd_trays', JSON.stringify(trays));
      localStorage.setItem('saronil_cssd_quarantines', JSON.stringify(quarantines));
      localStorage.setItem('saronil_cssd_audit_logs', JSON.stringify(window.state.cssdAuditLogs));
      window.router.navigate(`cssd?tab=${_activeCssdSubTab}&t=${Date.now()}`);
    }
  };

  window._hkCssdCondemnTray = function(trayId) {
    var trays = window.state.cssdTrays || [];
    var t = trays.find(x => x.trayId === trayId);
    if (t) {
      t.status = 'Condemned';

      window.state.cssdAuditLogs.unshift({
        txId: `TX-CS-${100 + window.state.cssdAuditLogs.length + 1}`,
        user: window.state.activeUserRole || 'HK Manager',
        role: window.state.activeUserRole || 'HK Manager',
        action: 'CONDEMN',
        code: trayId,
        fromState: 'Quarantine',
        toState: 'Condemned',
        timestamp: new Date().toLocaleDateString('en-IN') + ' · ' + new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        remarks: `Condemned and decommissioned tray ${trayId}. reason: Irreparable damage.`
      });

      localStorage.setItem('saronil_cssd_trays', JSON.stringify(trays));
      localStorage.setItem('saronil_cssd_audit_logs', JSON.stringify(window.state.cssdAuditLogs));
      window.router.navigate(`cssd?tab=${_activeCssdSubTab}&t=${Date.now()}`);
    }
  };

  window._hkCssdSubmitCollection = function() {
    var dept = document.getElementById('col-req-dept').value;
    var tName = document.getElementById('col-req-tray').value;
    var urgency = document.getElementById('col-req-urgency').value;
    var remarks = document.getElementById('col-req-remarks').value || '';

    var collections = window.state.cssdCollections || [];
    var newCol = {
      reqId: `REQ-CS-${100 + collections.length + 1}`,
      date: new Date().toLocaleDateString('en-IN') + ' · ' + new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      requestedBy: window.state.activeUserRole || 'OT Nurse',
      department: dept,
      trayName: tName,
      qty: 1,
      urgency: urgency,
      status: 'Pending',
      remarks: remarks
    };
    collections.unshift(newCol);

    if (urgency === 'Emergency') {
      alert(`🚨 IMMEDIATE ALERT RAISED FOR EMERGENCY COLLECTION REQUEST ${newCol.reqId} FROM ${dept}!`);
    }

    localStorage.setItem('saronil_cssd_collections', JSON.stringify(collections));
    window.router.navigate(`cssd?tab=${_activeCssdSubTab}&t=${Date.now()}`);
  };

  window._hkCssdAcknowledgeCollection = function(reqId) {
    var collections = window.state.cssdCollections || [];
    var c = collections.find(x => x.reqId === reqId);
    if (c) {
      c.status = 'Received';

      // Move matching tray status to Decontamination
      var trays = window.state.cssdTrays || [];
      var t = trays.find(x => x.trayName === c.trayName);
      if (t) {
        t.status = 'Decontamination';
      }

      window.state.cssdAuditLogs.unshift({
        txId: `TX-CS-${100 + window.state.cssdAuditLogs.length + 1}`,
        user: 'Supervisor Satish',
        role: 'CSSD Supervisor',
        action: 'COLLECT_ACK',
        code: reqId,
        fromState: 'Pending',
        toState: 'Decontamination',
        timestamp: new Date().toLocaleDateString('en-IN') + ' · ' + new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        remarks: `Acknowledged and transported collection request ${reqId} from ${c.department}.`
      });

      localStorage.setItem('saronil_cssd_collections', JSON.stringify(collections));
      localStorage.setItem('saronil_cssd_trays', JSON.stringify(trays));
      localStorage.setItem('saronil_cssd_audit_logs', JSON.stringify(window.state.cssdAuditLogs));
      window.router.navigate(`cssd?tab=${_activeCssdSubTab}&t=${Date.now()}`);
    }
  };

  window._hkCssdSubmitDecon = function() {
    var trayId = document.getElementById('decon-tray').value;
    var duration = parseInt(document.getElementById('decon-duration').value) || 20;
    var soil = document.getElementById('decon-soil').value;
    var inf = document.getElementById('decon-infectious').value;
    var solution = document.getElementById('decon-solution').value;

    var trays = window.state.cssdTrays || [];
    var t = trays.find(x => x.trayId === trayId);
    if (t) {
      t.status = 'Cleaning';

      var decons = window.state.cssdDeconLogs || [];
      decons.unshift({
        trayId: trayId,
        receivedAt: new Date().toLocaleDateString('en-IN') + ' · ' + new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        receivedFrom: t.department,
        receivedBy: 'Technician Raj',
        solution: solution,
        duration: duration,
        grossSoil: soil,
        operator: 'Technician Raj',
        isInfectious: inf === 'Yes',
        remarks: inf === 'Yes' ? 'ENHANCED PROTOCOL APPLIED' : ''
      });

      if (inf === 'Yes') {
        alert(`☣️ ENHANCED DECONTAMINATION PROTOCOL COMPLETED! Infection Control Nurse has been notified regarding infectious source tray ${trayId}.`);
      }

      window.state.cssdAuditLogs.unshift({
        txId: `TX-CS-${100 + window.state.cssdAuditLogs.length + 1}`,
        user: 'Technician Raj',
        role: 'CSSD Technician',
        action: 'DECONTAMINATE',
        code: trayId,
        fromState: 'Decontamination',
        toState: 'Cleaning',
        timestamp: new Date().toLocaleDateString('en-IN') + ' · ' + new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        remarks: `Decontamination pre-soak logged for ${trayId}. Infectious flag: ${inf}.`
      });

      localStorage.setItem('saronil_cssd_trays', JSON.stringify(trays));
      localStorage.setItem('saronil_cssd_decon_logs', JSON.stringify(decons));
      localStorage.setItem('saronil_cssd_audit_logs', JSON.stringify(window.state.cssdAuditLogs));
      window.router.navigate(`cssd?tab=${_activeCssdSubTab}&t=${Date.now()}`);
    }
  };

  window._hkCssdSubmitCleaning = function() {
    var trayId = document.getElementById('clean-tray').value;
    var method = document.getElementById('clean-method').value;
    var machine = document.getElementById('clean-machine').value;
    var func = document.getElementById('clean-func').value;
    var comp = document.getElementById('clean-comp').value;
    var details = document.getElementById('clean-fail-details').value || '';

    var trays = window.state.cssdTrays || [];
    var t = trays.find(x => x.trayId === trayId);
    if (t) {
      if (func === 'Fail') {
        t.status = 'Quarantine';
        var quarantines = window.state.cssdQuarantines || [];
        quarantines.unshift({
          trayId: trayId,
          reason: `Physical Inspection Failure: ${details || 'Damaged instruments'}`,
          quarantinedBy: 'Technician Raj',
          date: new Date().toLocaleDateString('en-IN') + ' · ' + new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
          notes: 'Requires replacement or maintenance.',
          owner: 'Technician Raj',
          status: 'Active'
        });
        localStorage.setItem('saronil_cssd_quarantines', JSON.stringify(quarantines));
      } else if (comp === 'Missing') {
        t.status = 'Cleaning'; // Hold
        alert(`⚠️ TRAY HELD: Tray ${trayId} cannot proceed to packing due to missing pieces against the manifest.`);
        return;
      } else {
        t.status = 'Packing';
      }

      var cleanings = window.state.cssdCleaningLogs || [];
      cleanings.unshift({
        trayId: trayId,
        method: method,
        machine: machine,
        duration: 15,
        agent: 'Neutral Detergent',
        operator: 'Technician Raj',
        inspection: func === 'Pass' ? 'Pass' : 'Fail',
        missingPieces: comp === 'Missing' ? 1 : 0,
        remarks: details
      });

      window.state.cssdAuditLogs.unshift({
        txId: `TX-CS-${100 + window.state.cssdAuditLogs.length + 1}`,
        user: 'Technician Raj',
        role: 'CSSD Technician',
        action: 'CLEAN_INSPECT',
        code: trayId,
        fromState: 'Cleaning',
        toState: t.status,
        timestamp: new Date().toLocaleDateString('en-IN') + ' · ' + new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        remarks: `Inspection complete. Functionality: ${func}, Completeness: ${comp}.`
      });

      localStorage.setItem('saronil_cssd_trays', JSON.stringify(trays));
      localStorage.setItem('saronil_cssd_cleaning_logs', JSON.stringify(cleanings));
      localStorage.setItem('saronil_cssd_audit_logs', JSON.stringify(window.state.cssdAuditLogs));
      window.router.navigate(`cssd?tab=${_activeCssdSubTab}&t=${Date.now()}`);
    }
  };

  window._hkCssdSubmitPacking = function() {
    var trayId = document.getElementById('pack-tray').value;
    var wrap = document.getElementById('pack-wrap').value;
    var ci = document.getElementById('pack-ci').value;
    var label = document.getElementById('pack-label').value;

    if (ci !== 'Yes') {
      alert('Chemical Indicator placed validation confirmation is mandatory before wrapping/sealing packs.');
      return;
    }

    var trays = window.state.cssdTrays || [];
    var t = trays.find(x => x.trayId === trayId);
    if (t) {
      t.status = 'Sterilization';

      var packings = window.state.cssdPackingLogs || [];
      packings.unshift({
        trayId: trayId,
        packType: wrap,
        packedBy: 'Technician Raj',
        packDate: new Date().toLocaleDateString('en-IN') + ' · ' + new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        chemicalIndicator: ci,
        labelDetails: label
      });

      window.state.cssdAuditLogs.unshift({
        txId: `TX-CS-${100 + window.state.cssdAuditLogs.length + 1}`,
        user: 'Technician Raj',
        role: 'CSSD Technician',
        action: 'PACK_TRAY',
        code: trayId,
        fromState: 'Packing',
        toState: 'Sterilization',
        timestamp: new Date().toLocaleDateString('en-IN') + ' · ' + new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        remarks: `Tray wrapped in ${wrap} with chemical indicator verified.`
      });

      localStorage.setItem('saronil_cssd_trays', JSON.stringify(trays));
      localStorage.setItem('saronil_cssd_packing_logs', JSON.stringify(packings));
      localStorage.setItem('saronil_cssd_audit_logs', JSON.stringify(window.state.cssdAuditLogs));
      window.router.navigate(`cssd?tab=${_activeCssdSubTab}&t=${Date.now()}`);
    }
  };

  window._hkCssdStartCycle = function() {
    var method = document.getElementById('cycle-method').value;
    var machine = document.getElementById('cycle-machine').value;
    var bd = document.getElementById('cycle-bd').value;
    var bi = document.getElementById('cycle-bi').value;
    
    var select = document.getElementById('cycle-load');
    var selectedTrays = [];
    for (var i = 0; i < select.options.length; i++) {
      if (select.options[i].selected) {
        selectedTrays.push(select.options[i].value);
      }
    }

    if (selectedTrays.length === 0) {
      alert('You must select at least one tray to load.');
      return;
    }

    var cycles = window.state.cssdCycles || [];
    var newCycle = {
      cycleId: `CYC-CS-${800 + cycles.length + 1}`,
      machineId: machine,
      method: method,
      cycleNo: 1400 + cycles.length + 1,
      loadContents: selectedTrays.join(', '),
      startTime: new Date().toLocaleDateString('en-IN') + ' · ' + new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      endTime: '—',
      temp: method === 'Steam' ? 134 : (method === 'EO' ? 55 : 50),
      pressure: method === 'Steam' ? 2.1 : 0,
      exposureTime: method === 'Steam' ? 30 : (method === 'EO' ? 600 : 45),
      biPlaced: bi,
      biResult: 'Pending',
      ciResult: 'Pass',
      bowieDick: method === 'Steam' ? bd : 'N/A',
      operator: 'Technician Raj',
      releaseStatus: 'Pending Release',
      releasedBy: ''
    };
    cycles.unshift(newCycle);

    // Update trays status to Sterilization (inside cycle run)
    var trays = window.state.cssdTrays || [];
    selectedTrays.forEach(id => {
      var t = trays.find(x => x.trayId === id);
      if (t) {
        t.status = 'Sterilization';
      }
    });

    window.state.cssdAuditLogs.unshift({
      txId: `TX-CS-${100 + window.state.cssdAuditLogs.length + 1}`,
      user: 'Technician Raj',
      role: 'CSSD Technician',
      action: 'CYCLE_START',
      code: newCycle.cycleId,
      fromState: 'Sterilization',
      toState: 'Sterilization',
      timestamp: new Date().toLocaleDateString('en-IN') + ' · ' + new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      remarks: `Started cycle ${newCycle.cycleNo} on ${machine} for loaded trays.`
    });

    localStorage.setItem('saronil_cssd_cycles', JSON.stringify(cycles));
    localStorage.setItem('saronil_cssd_trays', JSON.stringify(trays));
    localStorage.setItem('saronil_cssd_audit_logs', JSON.stringify(window.state.cssdAuditLogs));
    window.router.navigate(`cssd?tab=${_activeCssdSubTab}&t=${Date.now()}`);
  };

  window._hkCssdReleaseCycle = function(cycleId) {
    var ciVal = document.getElementById(`ci-res-${cycleId}`).value;
    var biVal = document.getElementById(`bi-res-${cycleId}`).value;

    if (biVal === 'Pending') {
      alert('Supervisor cannot release batch when Biological Indicator (BI) incubation result is Pending.');
      return;
    }

    var cycles = window.state.cssdCycles || [];
    var c = cycles.find(x => x.cycleId === cycleId);
    if (c) {
      var trays = window.state.cssdTrays || [];
      var loadedIds = c.loadContents.split(', ');

      if (biVal === 'Fail') {
        c.biResult = 'Fail';
        c.releaseStatus = 'Quarantined';

        // BI Failure recall workflow: quarantine all trays in cycle, return to decontamination
        loadedIds.forEach(id => {
          var t = trays.find(x => x.trayId === id);
          if (t) {
            t.status = 'Decontamination';
            
            var quarantines = window.state.cssdQuarantines || [];
            quarantines.unshift({
              trayId: id,
              reason: `Biological Indicator Failure in Batch ${cycleId}`,
              quarantinedBy: 'Supervisor Satish',
              date: new Date().toLocaleDateString('en-IN') + ' · ' + new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
              notes: 'Recalled cycle load. Return to decontamination pre-soak.',
              owner: 'Supervisor Satish',
              status: 'Active'
            });
            localStorage.setItem('saronil_cssd_quarantines', JSON.stringify(quarantines));
          }
        });

        alert(`🚨 BI BIOLOGICAL FAILURE ACTION COMPLETE! Full batch load ${cycleId} recalled. All trays returned to decontamination. Infection Control Nurse notified.`);
      } else {
        c.biResult = 'Pass';
        c.ciResult = ciVal;
        c.releaseStatus = 'Released';
        c.releasedBy = 'Supervisor Satish';
        c.endTime = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

        // BI Pass release: trays status to Sterile Storage
        loadedIds.forEach(id => {
          var t = trays.find(x => x.trayId === id);
          if (t) {
            t.status = 'Sterile Storage';
            t.lastSterilized = new Date().toLocaleDateString('en-IN') + ' · ' + new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
            
            // Calculate expiry: Steam - 7 days, EO - 30 days, Plasma - 30 days
            var expDays = t.method === 'Steam' ? 7 : 30;
            var expDate = new Date();
            expDate.setDate(expDate.getDate() + expDays);
            t.validUntil = expDate.toLocaleDateString('en-IN') + ' · ' + expDate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
            t.cycleCount++;
            t.rackLocation = 'Rack A - Shelf 1';
          }
        });
      }

      window.state.cssdAuditLogs.unshift({
        txId: `TX-CS-${100 + window.state.cssdAuditLogs.length + 1}`,
        user: 'Supervisor Satish',
        role: 'CSSD Supervisor',
        action: 'CYCLE_RELEASE',
        code: cycleId,
        fromState: 'Sterilization',
        toState: c.releaseStatus === 'Released' ? 'Sterile Storage' : 'Decontamination',
        timestamp: new Date().toLocaleDateString('en-IN') + ' · ' + new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        remarks: `Cycle ${cycleId} released status: ${c.releaseStatus}. BI result: ${biVal}.`
      });

      localStorage.setItem('saronil_cssd_cycles', JSON.stringify(cycles));
      localStorage.setItem('saronil_cssd_trays', JSON.stringify(trays));
      localStorage.setItem('saronil_cssd_audit_logs', JSON.stringify(window.state.cssdAuditLogs));
      window.router.navigate(`cssd?tab=${_activeCssdSubTab}&t=${Date.now()}`);
    }
  };

  window._hkCssdRecycleExpired = function(trayId) {
    var trays = window.state.cssdTrays || [];
    var t = trays.find(x => x.trayId === trayId);
    if (t) {
      t.status = 'Decontamination';
      t.lastSterilized = '—';
      t.validUntil = '—';

      window.state.cssdAuditLogs.unshift({
        txId: `TX-CS-${100 + window.state.cssdAuditLogs.length + 1}`,
        user: 'System',
        role: 'System',
        action: 'RECYCLE_EXPIRED',
        code: trayId,
        fromState: 'Expired',
        toState: 'Decontamination',
        timestamp: new Date().toLocaleDateString('en-IN') + ' · ' + new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        remarks: `Recycled expired sterility tray ${trayId} back to decontamination.`
      });

      localStorage.setItem('saronil_cssd_trays', JSON.stringify(trays));
      localStorage.setItem('saronil_cssd_audit_logs', JSON.stringify(window.state.cssdAuditLogs));
      window.router.navigate(`cssd?tab=${_activeCssdSubTab}&t=${Date.now()}`);
    }
  };

  window._hkCssdSubmitIssue = function() {
    var trayId = document.getElementById('issue-cs-tray').value;
    var dept = document.getElementById('issue-cs-dept').value;
    var staff = document.getElementById('issue-cs-staff').value;
    var remarks = document.getElementById('issue-cs-remarks').value || '';

    var trays = window.state.cssdTrays || [];
    var t = trays.find(x => x.trayId === trayId);
    if (t) {
      // Expiry block validation
      if (t.status === 'Expired') {
        alert('Sterility Expired! Expired instrument sets cannot be issued.');
        return;
      }

      // FIFO check: find other trays of same category that were sterilized older
      var olderTrays = trays.filter(x => x.trayName === t.trayName && (x.status === 'Available' || x.status === 'Sterile Storage') && x.trayId !== t.trayId);
      if (olderTrays.length > 0) {
        var oldest = olderTrays.reduce((a, b) => new Date(a.lastSterilized.replace(' · ', ' ')).getTime() < new Date(b.lastSterilized.replace(' · ', ' ')).getTime() ? a : b);
        if (new Date(oldest.lastSterilized.replace(' · ', ' ')).getTime() < new Date(t.lastSterilized.replace(' · ', ' ')).getTime()) {
          alert(`FIFO Warning: Oldest sterile stock ${oldest.trayId} should be issued first.`);
        }
      }

      var issues = window.state.cssdIssues || [];
      var newIssue = {
        issueId: `ISS-CS-${900 + issues.length + 1}`,
        date: new Date().toLocaleDateString('en-IN') + ' · ' + new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        department: dept,
        requestedBy: staff,
        trayId: trayId,
        batchRef: 'CYC-CS-801',
        expiryDate: t.validUntil.split(' · ')[0],
        issuedBy: 'Technician Raj',
        status: 'Pending Acknowledgment',
        remarks: remarks
      };
      issues.unshift(newIssue);

      localStorage.setItem('saronil_cssd_issues', JSON.stringify(issues));
      window.router.navigate(`cssd?tab=${_activeCssdSubTab}&t=${Date.now()}`);
    }
  };

  window._hkCssdAckIssue = function(issueId) {
    var issues = window.state.cssdIssues || [];
    var i = issues.find(x => x.issueId === issueId);
    if (i) {
      i.status = 'Acknowledged';

      var trays = window.state.cssdTrays || [];
      var t = trays.find(x => x.trayId === i.trayId);
      if (t) {
        t.status = 'Issued';
        t.department = i.department;
      }

      window.state.cssdAuditLogs.unshift({
        txId: `TX-CS-${100 + window.state.cssdAuditLogs.length + 1}`,
        user: i.requestedBy,
        role: 'OT Nurse',
        action: 'ISSUE_ACK',
        code: i.trayId,
        fromState: 'Sterile Storage',
        toState: 'Issued',
        timestamp: new Date().toLocaleDateString('en-IN') + ' · ' + new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        remarks: `Acknowledged receipt of sterile tray ${i.trayId} at ${i.department}.`
      });

      localStorage.setItem('saronil_cssd_issues', JSON.stringify(issues));
      localStorage.setItem('saronil_cssd_trays', JSON.stringify(trays));
      localStorage.setItem('saronil_cssd_audit_logs', JSON.stringify(window.state.cssdAuditLogs));
      window.router.navigate(`cssd?tab=${_activeCssdSubTab}&t=${Date.now()}`);
    }
  };

  window._hkCssdAcknowledgeBiFailure = function() {
    var cycles = window.state.cssdCycles || [];
    cycles.forEach(c => {
      if (c.biResult === 'Fail') {
        c.biResult = 'Pass'; // Reset or acknowledge
        c.releaseStatus = 'Recalled';
      }
    });
    localStorage.setItem('saronil_cssd_cycles', JSON.stringify(cycles));
    window.router.navigate(`cssd?tab=${_activeCssdSubTab}&t=${Date.now()}`);
  };

  window._hkCssdSubmitReturn = function() {
    var trayId = document.getElementById('ret-cs-tray').value;
    var dept = document.getElementById('ret-cs-dept').value;
    var pieces = parseInt(document.getElementById('ret-cs-pieces').value) || 10;
    var missing = parseInt(document.getElementById('ret-cs-missing').value) || 0;
    var cond = document.getElementById('ret-cs-condition').value;
    var staff = document.getElementById('ret-cs-staff').value;

    var trays = window.state.cssdTrays || [];
    var t = trays.find(x => x.trayId === trayId);
    if (t) {
      var returns = window.state.cssdReturns || [];
      var newRet = {
        returnId: `RET-CS-${500 + returns.length + 1}`,
        date: new Date().toLocaleDateString('en-IN') + ' · ' + new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        returnedFrom: dept,
        returnedBy: staff,
        trayId: trayId,
        piecesReturned: pieces,
        piecesMissing: missing,
        condition: cond,
        status: missing > 0 ? 'Held' : 'Processed'
      };
      returns.unshift(newRet);

      if (missing > 0) {
        t.status = 'Cleaning'; // hold state
        alert(`⚠️ RETURN ERROR: Tray ${trayId} flagged as Incomplete. Missing pieces must be accounted for before recycling.`);
      } else {
        t.status = 'Returned (Dirty)';
      }

      if (cond === 'Damaged') {
        t.status = 'Quarantine';
        var quarantines = window.state.cssdQuarantines || [];
        quarantines.unshift({
          trayId: trayId,
          reason: 'Physical damage reported on return',
          quarantinedBy: 'Supervisor Satish',
          date: new Date().toLocaleDateString('en-IN') + ' · ' + new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
          notes: 'Send for repair.',
          owner: 'Supervisor Satish',
          status: 'Active'
        });
        localStorage.setItem('saronil_cssd_quarantines', JSON.stringify(quarantines));
      }

      window.state.cssdAuditLogs.unshift({
        txId: `TX-CS-${100 + window.state.cssdAuditLogs.length + 1}`,
        user: 'Technician Raj',
        role: 'CSSD Technician',
        action: 'INSTRUMENT_RETURN',
        code: trayId,
        fromState: 'Issued',
        toState: t.status,
        timestamp: new Date().toLocaleDateString('en-IN') + ' · ' + new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        remarks: `Returned from ${dept}. Condition: ${cond}. Missing pieces: ${missing}.`
      });

      localStorage.setItem('saronil_cssd_returns', JSON.stringify(returns));
      localStorage.setItem('saronil_cssd_trays', JSON.stringify(trays));
      localStorage.setItem('saronil_cssd_audit_logs', JSON.stringify(window.state.cssdAuditLogs));
      window.router.navigate(`cssd?tab=${_activeCssdSubTab}&t=${Date.now()}`);
    }
  };

  window._hkCssdResolveQuarantine = function(trayId, action) {
    var quarantines = window.state.cssdQuarantines || [];
    var q = quarantines.find(x => x.trayId === trayId && x.status === 'Active');
    if (q) {
      q.status = 'Resolved';

      var trays = window.state.cssdTrays || [];
      var t = trays.find(x => x.trayId === trayId);
      if (t) {
        if (action === 'Return to Cycle') {
          t.status = 'Decontamination';
        } else if (action === 'Condemn') {
          t.status = 'Condemned';
        }
      }

      window.state.cssdAuditLogs.unshift({
        txId: `TX-CS-${100 + window.state.cssdAuditLogs.length + 1}`,
        user: 'Supervisor Satish',
        role: 'CSSD Supervisor',
        action: 'RESOLVE_QUARANTINE',
        code: trayId,
        fromState: 'Quarantine',
        toState: t.status,
        timestamp: new Date().toLocaleDateString('en-IN') + ' · ' + new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        remarks: `Quarantine resolved. Action taken: ${action}.`
      });

      localStorage.setItem('saronil_cssd_quarantines', JSON.stringify(quarantines));
      localStorage.setItem('saronil_cssd_trays', JSON.stringify(trays));
      localStorage.setItem('saronil_cssd_audit_logs', JSON.stringify(window.state.cssdAuditLogs));
      window.router.navigate(`cssd?tab=${_activeCssdSubTab}&t=${Date.now()}`);
    }
  };

  window._hkCssdExportReport = function(rName) {
    var csvContent = "data:text/csv;charset=utf-8,Report: " + rName + "\\nTimestamp: " + new Date().toISOString() + "\\nMetric,Value\\nSterilized,18\\nReleased,12\\nBI Failures,0";
    var encodedUri = encodeURI(csvContent);
    var link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `cssd_${rName.toLowerCase().replace(/\\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  window._hkCssdCycleMethodChange = function(val) {
    var machineSelect = document.getElementById('cycle-machine');
    if (!machineSelect) return;
    machineSelect.innerHTML = '';

    if (val === 'Steam') {
      machineSelect.innerHTML = `
        <option value="Steam Autoclave 01">Steam Autoclave 01</option>
        <option value="Steam Autoclave 02">Steam Autoclave 02</option>
      `;
    } else if (val === 'Plasma') {
      machineSelect.innerHTML = `
        <option value="Plasma Sterilizer 02">Plasma Sterilizer 02</option>
      `;
    } else if (val === 'EO') {
      machineSelect.innerHTML = `
        <option value="EO Chamber 03">EO Chamber 03</option>
      `;
    }
  };

  // BMW MODULE ACTIONS
  window._hkSetBmwSubTab = function(subTabId) {
    _activeBmwSubTab = subTabId;
    window.router.navigate(`bmw?tab=${subTabId}&t=${Date.now()}`);
  };

  window._hkBmwSetSearchQuery = function(q) {
    _bmwSearchQuery = q;
    if (window._hkBmwSearchDebounce) clearTimeout(window._hkBmwSearchDebounce);
    window._hkBmwSearchDebounce = setTimeout(function() {
      window.router.navigate(`bmw?tab=${_activeBmwSubTab}&t=${Date.now()}`);
    }, 300);
  };

  window._hkBmwSetCategoryFilter = function(cat) {
    _bmwCategoryFilter = cat;
    window.router.navigate(`bmw?tab=${_activeBmwSubTab}&t=${Date.now()}`);
  };

  window._hkBmwSetStatusFilter = function(status) {
    _bmwStatusFilter = status;
    window.router.navigate(`bmw?tab=${_activeBmwSubTab}&t=${Date.now()}`);
  };

  window._hkBmwSubmitGeneration = function() {
    var dept = document.getElementById('gen-bmw-dept').value;
    var cat = document.getElementById('gen-bmw-cat').value;
    var inf = document.getElementById('gen-bmw-infectious').value;
    var qty = parseFloat(document.getElementById('gen-bmw-qty').value) || 0;
    var bagsCount = parseInt(document.getElementById('gen-bmw-bags').value) || 1;
    var source = document.getElementById('gen-bmw-source').value;
    var remarks = document.getElementById('gen-bmw-remarks').value || '';

    if (qty <= 0) {
      alert('Waste quantity must be greater than zero.');
      return;
    }

    // Rule: Infectious override classification to Yellow
    if (inf === 'Yes') {
      cat = 'Yellow';
    }

    var logs = window.state.bmwLogs || [];
    var newGen = {
      logId: `LOG-BMW-${100 + logs.length + 1}`,
      date: new Date().toLocaleDateString('en-IN') + ' · ' + new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      department: dept,
      generatedBy: window.state.activeUserRole || 'Ward Nurse',
      category: cat,
      weight: qty,
      bagCount: bagsCount,
      infectious: inf === 'Yes',
      source: source,
      status: 'Logged',
      remarks: remarks
    };
    logs.unshift(newGen);

    window.state.bmwAuditLogs.unshift({
      txId: `TX-BMW-${100 + window.state.bmwAuditLogs.length + 1}`,
      user: window.state.activeUserRole || 'Ward Nurse',
      role: window.state.activeUserRole || 'Ward Nurse',
      action: 'WASTE_GENERATE',
      category: cat,
      department: dept,
      weight: qty,
      fromState: '—',
      toState: 'Logged',
      timestamp: new Date().toLocaleDateString('en-IN') + ' · ' + new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      remarks: `Logged ${qty} kg waste in ${cat} category at ${dept}.`
    });

    localStorage.setItem('saronil_bmw_logs', JSON.stringify(logs));
    localStorage.setItem('saronil_bmw_audit_logs', JSON.stringify(window.state.bmwAuditLogs));

    // Cross-module: Log BMW generation event into the central HK audit trail
    window.state.hkAuditLogs.unshift({
      timestamp: new Date().toISOString(),
      user: window.state.activeUserRole || 'Ward Nurse',
      role: 'Ward Nurse',
      action: 'BMW_COLLECT',
      taskId: newGen.logId,
      roomBed: dept,
      remarks: `BMW: ${qty}kg ${cat} waste logged at ${dept}.`
    });
    localStorage.setItem('saronil_hk_audit_logs', JSON.stringify(window.state.hkAuditLogs));

    // Cross-module: If infectious, post an IC alert event
    if (inf === 'Yes' && window.state.icEvents) {
      window.state.icEvents.unshift({
        id: 'IC-BMW-' + Date.now(),
        type: 'INFECTIOUS_WASTE_LOGGED',
        department: dept,
        category: cat,
        weight: qty,
        source: source,
        timestamp: new Date().toISOString(),
        remarks: `Infectious biomedical waste (${qty}kg, ${cat}) logged at ${dept}. Verify segregation and collection protocols.`
      });
      localStorage.setItem('saronil_ic_events', JSON.stringify(window.state.icEvents));
    }

    window.router.navigate(`bmw?tab=${_activeBmwSubTab}&t=${Date.now()}`);
  };

  window._hkBmwCollectionRefChange = function(val) {
    if (!val) return;
    var logs = window.state.bmwLogs || [];
    var l = logs.find(x => x.logId === val);
    if (l) {
      var bagsInp = document.getElementById('col-bmw-bags');
      var weightInp = document.getElementById('col-bmw-weight');
      if (bagsInp) bagsInp.value = l.bagCount;
      if (weightInp) weightInp.value = l.weight;
    }
  };

  window._hkBmwSubmitCollection = function() {
    var ref = document.getElementById('col-bmw-ref').value;
    var bagsCount = parseInt(document.getElementById('col-bmw-bags').value) || 1;
    var colWeight = parseFloat(document.getElementById('col-bmw-weight').value) || 0;
    var doubleBag = document.getElementById('col-bmw-double').value;
    var sharpsSealed = document.getElementById('col-bmw-sharps').value;
    var discReason = document.getElementById('col-bmw-discrepancy').value || '';

    if (!ref) {
      alert('Must select a generation log reference.');
      return;
    }

    var logs = window.state.bmwLogs || [];
    var l = logs.find(x => x.logId === ref);
    if (l) {
      if (colWeight <= 0) {
        alert('Weight at collection must be greater than zero.');
        return;
      }

      // Validation gates: Infectious double bag check
      if (l.infectious && doubleBag !== 'Yes') {
        alert('Infectious waste bags must be double-bagged and labelled before pickup.');
        return;
      }

      // Sharps White category check
      if (l.category === 'White' && sharpsSealed !== 'Yes') {
        alert('Sharps waste (White category) must be confirmed inside a sealed puncture-proof box.');
        return;
      }

      // Discrepancy checks (>10%)
      var pctDiff = Math.abs(colWeight - l.weight) / l.weight;
      var hasDiscrepancy = pctDiff > 0.10;
      if (hasDiscrepancy && !discReason.trim()) {
        alert('Weight discrepancy exceeds 10%! A discrepancy reason is mandatory to submit.');
        return;
      }

      l.status = 'Collected';

      var bags = window.state.bmwBags || [];
      var newBag = {
        bagId: `BAG-BMW-${100 + bags.length + 1}`,
        category: l.category,
        weight: colWeight,
        department: l.department,
        collectedAt: new Date().toLocaleDateString('en-IN') + ' · ' + new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        status: 'Collected',
        infectious: l.infectious,
        source: l.source,
        bagCount: bagsCount,
        storageLocation: '—'
      };
      bags.unshift(newBag);

      if (hasDiscrepancy) {
        // Trigger non-compliance auto log
        var ncList = window.state.bmwNonCompliances || [];
        ncList.unshift({
          eventId: `ERR-BMW-${500 + ncList.length + 1}`,
          type: 'Weight Discrepancy > 10%',
          triggeredBy: 'System',
          timestamp: new Date().toLocaleDateString('en-IN') + ' · ' + new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
          department: l.department,
          description: `Discrepancy in ${l.category} waste. Logged: ${l.weight}kg, Collected: ${colWeight}kg. Reason: ${discReason}`,
          assignedTo: 'Supervisor Satish',
          status: 'Open'
        });
        localStorage.setItem('saronil_bmw_non_compliances', JSON.stringify(ncList));
      }

      window.state.bmwAuditLogs.unshift({
        txId: `TX-BMW-${100 + window.state.bmwAuditLogs.length + 1}`,
        user: 'Technician Raj',
        role: 'BMW Staff',
        action: 'BMW_COLLECT',
        category: l.category,
        department: l.department,
        weight: colWeight,
        fromState: 'Logged',
        toState: 'Collected',
        timestamp: new Date().toLocaleDateString('en-IN') + ' · ' + new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        remarks: `Collected waste bag from ${l.department}. weight discrepancy logged: ${hasDiscrepancy}.`
      });

      localStorage.setItem('saronil_bmw_logs', JSON.stringify(logs));
      localStorage.setItem('saronil_bmw_bags', JSON.stringify(bags));
      localStorage.setItem('saronil_bmw_audit_logs', JSON.stringify(window.state.bmwAuditLogs));
      window.router.navigate(`bmw?tab=${_activeBmwSubTab}&t=${Date.now()}`);
    }
  };

  window._hkBmwSubmitTsaReceipt = function() {
    var bagId = document.getElementById('tsa-bmw-bag').value;
    var location = document.getElementById('tsa-bmw-location').value;

    if (!bagId) {
      alert('Must select a collected bag.');
      return;
    }

    var bags = window.state.bmwBags || [];
    var b = bags.find(x => x.bagId === bagId);
    if (b) {
      b.status = 'TSA';
      b.storageLocation = location;
      b.collectedAt = new Date().toLocaleDateString('en-IN') + ' · ' + new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }); // starts TSA clock

      window.state.bmwAuditLogs.unshift({
        txId: `TX-BMW-${100 + window.state.bmwAuditLogs.length + 1}`,
        user: 'Technician Raj',
        role: 'BMW Staff',
        action: 'TSA_RECEIVE',
        category: b.category,
        department: b.department,
        weight: b.weight,
        fromState: 'Collected',
        toState: 'TSA',
        timestamp: new Date().toLocaleDateString('en-IN') + ' · ' + new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        remarks: `Received bag ${bagId} at TSA in location: ${location}.`
      });

      localStorage.setItem('saronil_bmw_bags', JSON.stringify(bags));
      localStorage.setItem('saronil_bmw_audit_logs', JSON.stringify(window.state.bmwAuditLogs));
      window.router.navigate(`bmw?tab=${_activeBmwSubTab}&t=${Date.now()}`);
    }
  };

  window._hkBmwSubmitPickup = function() {
    var vendor = document.getElementById('pick-bmw-vendor').value;
    var driver = document.getElementById('pick-bmw-driver').value;
    var vehicle = document.getElementById('pick-bmw-vehicle').value;
    var auth = document.getElementById('pick-bmw-auth').value;
    var manifest = document.getElementById('pick-bmw-manifest').value;

    if (!manifest.trim()) {
      alert('Manifest (Form 3) Number is mandatory. Transporter pickup cannot be logged without a manifest.');
      return;
    }

    var bags = window.state.bmwBags || [];
    var tsaBags = bags.filter(b => b.status === 'TSA');
    if (tsaBags.length === 0) {
      alert('No waste bags present in TSA for pickup.');
      return;
    }

    var totalBagsCount = tsaBags.length;
    var totalWeight = tsaBags.reduce((a, b) => a + b.weight, 0);

    // Update status to Picked Up
    tsaBags.forEach(b => {
      b.status = 'Picked Up';
    });

    var manifests = window.state.bmwManifests || [];
    var newMan = {
      manifestId: manifest,
      date: new Date().toLocaleDateString('en-IN') + ' · ' + new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      totalBags: totalBagsCount,
      totalWeight: totalWeight,
      transporter: vendor,
      vehicle: vehicle,
      driver: driver,
      authCert: auth,
      status: 'Dispatched'
    };
    manifests.unshift(newMan);

    window.state.bmwAuditLogs.unshift({
      txId: `TX-BMW-${100 + window.state.bmwAuditLogs.length + 1}`,
      user: 'Supervisor Satish',
      role: 'BMW Supervisor',
      action: 'BMW_DISPATCH',
      category: 'Multiple',
      department: 'TSA Room',
      weight: totalWeight,
      fromState: 'TSA',
      toState: 'Picked Up',
      timestamp: new Date().toLocaleDateString('en-IN') + ' · ' + new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      remarks: `Handed over ${totalBagsCount} bags to ${vendor} under manifest ${manifest}.`
    });

    localStorage.setItem('saronil_bmw_bags', JSON.stringify(bags));
    localStorage.setItem('saronil_bmw_manifests', JSON.stringify(manifests));
    localStorage.setItem('saronil_bmw_audit_logs', JSON.stringify(window.state.bmwAuditLogs));
    window.router.navigate(`bmw?tab=${_activeBmwSubTab}&t=${Date.now()}`);
  };

  window._hkBmwSubmitDisposal = function() {
    var manifestNo = document.getElementById('disp-bmw-manifest').value;
    var cert = document.getElementById('disp-bmw-cert').value;
    var method = document.getElementById('disp-bmw-method').value;

    if (!manifestNo) {
      alert('Must select a manifest reference.');
      return;
    }

    var manifests = window.state.bmwManifests || [];
    var m = manifests.find(x => x.manifestId === manifestNo);
    if (m) {
      m.status = 'Closed';

      var confirmations = window.state.bmwConfirmations || [];
      var newConf = {
        confirmationId: `CONF-BMW-${800 + confirmations.length + 1}`,
        manifestNo: manifestNo,
        certNo: cert,
        method: method,
        disposalDate: new Date().toLocaleDateString('en-IN') + ' · ' + new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        confirmedBy: 'Supervisor Satish',
        remarks: 'CBWTF treatment receipt certificate verified and closed.'
      };
      confirmations.unshift(newConf);

      window.state.bmwAuditLogs.unshift({
        txId: `TX-BMW-${100 + window.state.bmwAuditLogs.length + 1}`,
        user: 'Supervisor Satish',
        role: 'BMW Supervisor',
        action: 'BMW_DISPOSE_CONFIRM',
        category: 'Multiple',
        department: 'CBWTF Plant',
        weight: m.totalWeight,
        fromState: 'Dispatched',
        toState: 'Closed',
        timestamp: new Date().toLocaleDateString('en-IN') + ' · ' + new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        remarks: `Disposal confirmed for manifest ${manifestNo} using method ${method}.`
      });

      localStorage.setItem('saronil_bmw_manifests', JSON.stringify(manifests));
      localStorage.setItem('saronil_bmw_confirmations', JSON.stringify(confirmations));
      localStorage.setItem('saronil_bmw_audit_logs', JSON.stringify(window.state.bmwAuditLogs));
      window.router.navigate(`bmw?tab=${_activeBmwSubTab}&t=${Date.now()}`);
    }
  };

  window._hkBmwResolveTSABreach = function() {
    // Set acknowledged flag so alert hides immediately on re-render
    _bmwTsaBreachAcknowledged = true;

    // Resolve matching open non-compliances
    var ncList = window.state.bmwNonCompliances || [];
    ncList.forEach(nc => {
      if (nc.type.includes('TSA Overdue')) {
        nc.status = 'Acknowledged';
      }
    });

    // Audit log
    window.state.bmwAuditLogs.unshift({
      txId: 'TX-BMW-ACK-' + Date.now(),
      user: window.state.activeUserRole || 'BMW Supervisor',
      role: 'BMW Supervisor',
      action: 'TSA_BREACH_ACK',
      category: '—',
      department: 'TSA Room',
      weight: 0,
      fromState: 'TSA_BREACH',
      toState: 'Acknowledged',
      timestamp: new Date().toLocaleDateString('en-IN') + ' · ' + new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      remarks: 'TSA 48-hour storage breach alert acknowledged by supervisor. Non-compliances marked acknowledged.'
    });

    localStorage.setItem('saronil_bmw_non_compliances', JSON.stringify(ncList));
    localStorage.setItem('saronil_bmw_audit_logs', JSON.stringify(window.state.bmwAuditLogs));
    window.router.navigate(`bmw?tab=${_activeBmwSubTab}&t=${Date.now()}`);
  };

  window._hkBmwRaiseManualNC = function() {
    var desc = prompt("Enter description of non-compliance incident:");
    if (!desc) return;
    var dept = prompt("Enter department name:");
    if (!dept) return;

    var ncList = window.state.bmwNonCompliances || [];
    ncList.unshift({
      eventId: `ERR-BMW-${500 + ncList.length + 1}`,
      type: 'Department Segregation Error',
      triggeredBy: 'Supervisor Satish',
      timestamp: new Date().toLocaleDateString('en-IN') + ' · ' + new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      department: dept,
      description: desc,
      assignedTo: 'Supervisor Satish',
      status: 'Open'
    });

    localStorage.setItem('saronil_bmw_non_compliances', JSON.stringify(ncList));
    window.router.navigate(`bmw?tab=${_activeBmwSubTab}&t=${Date.now()}`);
  };

  window._hkBmwResolveNC = function(eventId) {
    var ncList = window.state.bmwNonCompliances || [];
    var nc = ncList.find(x => x.eventId === eventId);
    if (nc) {
      nc.status = 'Resolved';
      localStorage.setItem('saronil_bmw_non_compliances', JSON.stringify(ncList));
      window.router.navigate(`bmw?tab=${_activeBmwSubTab}&t=${Date.now()}`);
    }
  };

  window._hkBmwExportReport = function(rName) {
    var csvContent = "data:text/csv;charset=utf-8,Report: " + rName + "\\nTimestamp: " + new Date().toISOString() + "\\nMetric,Value\\nYellow,13\\nRed,12.2\\nWhite,1.5";
    var encodedUri = encodeURI(csvContent);
    var link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `bmw_${rName.toLowerCase().replace(/\\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Integration helper registrations
  window._triggerHKDischargeClean = function(bedId, patientUhid) {
    var tasks = window.state.housekeepingTasks || [];
    var newT = {
      id: `HK-${1000 + tasks.length + 1}`,
      type: "Discharge Cleaning",
      source: "IPD",
      bedId: bedId,
      status: "New",
      createdTime: new Date().toISOString(),
      assignee: null,
      assignedTime: null,
      completedTime: null,
      verifiedTime: null,
      icNurseSigned: false,
      icNurseName: null,
      checklist: {
        "Floor mopped with disinfectant": false,
        "Surfaces wiped": false,
        "Bin emptied and relined": false,
        "Linen changed": false,
        "Bathroom cleaned": false,
        "Equipment wiped": false
      },
      audit: [
        { timestamp: new Date().toISOString(), user: "System", role: "System", action: "AUTO_CREATE", remarks: `Auto-created post patient physical discharge. Patient UHID: ${patientUhid}` }
      ]
    };

    tasks.push(newT);
    
    window.state.hkAuditLogs.unshift({
      timestamp: new Date().toISOString(),
      user: "System",
      role: "System",
      action: "AUTO_CREATE",
      taskId: newT.id,
      roomBed: bedId,
      remarks: `System auto-created Discharge Cleaning task for Bed ${bedId}.`
    });

    localStorage.setItem('saronil_housekeeping_tasks', JSON.stringify(tasks));
    localStorage.setItem('saronil_hk_audit_logs', JSON.stringify(window.state.hkAuditLogs));
  };

  window._triggerHKOTClean = function(theatreId, caseId) {
    var tasks = window.state.housekeepingTasks || [];
    var newT = {
      id: `HK-${1000 + tasks.length + 1}`,
      type: "OT Cleaning",
      source: "OT",
      bedId: theatreId,
      status: "New",
      createdTime: new Date().toISOString(),
      assignee: null,
      assignedTime: null,
      completedTime: null,
      verifiedTime: null,
      icNurseSigned: false,
      icNurseName: null,
      checklist: {
        "Terminal clean protocol": false,
        "Fumigation completed": false,
        "Surfaces wiped with high-level disinfectant": false,
        "Bin emptied and relined": false
      },
      audit: [
        { timestamp: new Date().toISOString(), user: "System", role: "System", action: "AUTO_CREATE", remarks: `Auto-created post OT case completion. Case ID: ${caseId}` }
      ]
    };

    tasks.push(newT);
    
    window.state.hkAuditLogs.unshift({
      timestamp: new Date().toISOString(),
      user: "System",
      role: "System",
      action: "AUTO_CREATE",
      taskId: newT.id,
      roomBed: theatreId,
      remarks: `System auto-created OT Cleaning task for Theatre ${theatreId}.`
    });

    localStorage.setItem('saronil_housekeeping_tasks', JSON.stringify(tasks));
    localStorage.setItem('saronil_hk_audit_logs', JSON.stringify(window.state.hkAuditLogs));
  };

  // ──────────────────────────────────────────────────────────────────────────
  // WORKSPACE RENDERING FUNCTIONS FOR LAUNDRY, CSSD, BMW, BEDS, REPORTS, AUDIT
  // ──────────────────────────────────────────────────────────────────────────
  
  function syncLegacyLaundryStock() {
    if (!window.state || !window.state.linenItems) return;
    var items = window.state.linenItems;
    var categories = ["Bed Sheet", "Pillow Cover", "OT Towel", "Doctor Gown"];
    window.state.laundryLinenStock = categories.map(cat => {
      var available = items.filter(x => x.category === cat && x.status === 'Available').length;
      var dirty = items.filter(x => x.category === cat && x.status === 'Dirty').length;
      var minStock = cat === 'Bed Sheet' ? 50 : (cat === 'Pillow Cover' ? 60 : 30);
      return { item: cat, available: available, dirty: dirty, minStock: minStock };
    });
    localStorage.setItem('saronil_laundry_linen_stock', JSON.stringify(window.state.laundryLinenStock));
  }

  function renderLaundryWorkspace() {
    syncLegacyLaundryStock();
    var items = window.state.linenItems || [];
    var requests = window.state.linenRequests || [];
    var collections = window.state.dirtyCollections || [];
    var machines = window.state.laundryMachines || [];
    var batches = window.state.laundryBatches || [];
    var dispatches = window.state.laundryDispatches || [];
    var returns = window.state.linenReturns || [];
    var repairs = window.state.linenRepairs || [];
    var condemnations = window.state.condemnations || [];
    var vendors = window.state.vendorLaundry || [];
    var auditLogs = window.state.laundryAuditLogs || [];

    var laundryTabs = [
      { id: 'dashboard', label: '📊 Dashboard' },
      { id: 'master', label: '📋 Master' },
      { id: 'issue', label: '📤 Issue' },
      { id: 'dirty', label: '🔴 Dirty' },
      { id: 'processing', label: '🧼 Processing' },
      { id: 'distribution', label: '🚚 Dist' },
      { id: 'return', label: '📥 Return' },
      { id: 'repair', label: '🛠️ Repair' },
      { id: 'condemnation', label: '⚠️ Condemn' },
      { id: 'vendor', label: '🏢 Vendor' },
      { id: 'reports', label: '📈 Reports' },
      { id: 'audit', label: '📝 Audit' }
    ];

    // Helper to format date/time
    function formatLndDateTime(dateStr) {
      if (!dateStr) return '--';
      try {
        var d = new Date(dateStr);
        if (isNaN(d.getTime())) return dateStr;
        return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) + ' · ' + d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
      } catch (e) {
        return dateStr;
      }
    }

    return `
      <div style="display:flex; flex-direction:column; gap:20px; text-align:left; font-family:'Inter',sans-serif; width:100%;">
        <div class="card-header" style="background:#f8fafc; border: 1px solid var(--border-color); border-radius:8px; padding: 12px 15px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">
          <h2 style="margin:0; font-size:16px; font-weight:900; color:var(--primary);">🧺 Laundry Management System</h2>
          <span style="font-size:11px; font-weight:700; color:var(--text-muted); background:white; padding:4px 10px; border-radius:6px; border:1px solid var(--border-color);">
            Role: <strong>Laundry Supervisor</strong>
          </span>
        </div>

        <!-- Scrollable secondary tab navigation -->
        <div style="display:flex; gap:6px; background:#f1f5f9; padding:6px; border-radius:8px; border:1px solid var(--border-color); overflow-x:auto; white-space:nowrap; width:100%; box-sizing:border-box;">
          ${laundryTabs.map(t => `
            <button class="btn ${_activeLaundrySubTab === t.id ? 'btn-primary' : 'btn-secondary'}" style="padding:6px 14px; font-size:11px; font-weight:700;" onclick="window._hkSetLaundrySubTab('${t.id}')">${t.label}</button>
          `).join('')}
        </div>

        <div class="laundry-viewport">
          ${_activeLaundrySubTab === 'dashboard' ? renderLndDashboard(items, requests, collections, batches, vendors, condemnations) : ''}
          ${_activeLaundrySubTab === 'master' ? renderLndMaster(items) : ''}
          ${_activeLaundrySubTab === 'issue' ? renderLndIssue(items, requests) : ''}
          ${_activeLaundrySubTab === 'dirty' ? renderLndDirty(collections) : ''}
          ${_activeLaundrySubTab === 'processing' ? renderLndProcessing(batches, machines) : ''}
          ${_activeLaundrySubTab === 'distribution' ? renderLndDistribution(batches, dispatches) : ''}
          ${_activeLaundrySubTab === 'return' ? renderLndReturn(returns) : ''}
          ${_activeLaundrySubTab === 'repair' ? renderLndRepair(repairs) : ''}
          ${_activeLaundrySubTab === 'condemnation' ? renderLndCondemnation(items, condemnations) : ''}
          ${_activeLaundrySubTab === 'vendor' ? renderLndVendor(vendors) : ''}
          ${_activeLaundrySubTab === 'reports' ? renderLndReports(items, batches, repairs, condemnations) : ''}
          ${_activeLaundrySubTab === 'audit' ? renderLndAudit(auditLogs) : ''}
        </div>
      </div>
    `;

    // ────────────────────────────────────────────────────────────────────────
    // SCREEN 1 - DASHBOARD
    // ────────────────────────────────────────────────────────────────────────
    function renderLndDashboard(items, requests, collections, batches, vendors, condemnations) {
      var available = items.filter(x => x.status === 'Available').length;
      var issued = items.filter(x => x.status === 'Issued').length;
      var dirty = items.filter(x => x.status === 'Dirty').length;
      var processing = items.filter(x => x.status === 'Processing').length;
      var ready = items.filter(x => x.status === 'Ready').length;
      var damaged = items.filter(x => x.status === 'Damaged').length;
      var condemned = items.filter(x => x.status === 'Condemned').length;
      var withVendor = items.filter(x => x.status === 'With Vendor').length;

      // Pending action alerts
      var alerts = [];
      
      // Dirty collection overdue > 2 hrs
      collections.forEach(c => {
        if (c.status === 'Pending') {
          var elapsedMs = Date.now() - new Date("2026-07-04T17:15:00Z").getTime(); // simulated today time basis
          var hrs = elapsedMs / 3600000;
          if (hrs > 2) {
            alerts.push({
              type: 'Danger',
              desc: `🚨 OVERDUE DIRTY COLLECTION: ${c.department} collection pending since ${c.dateTime}.`,
              actionTab: 'dirty',
              btnLabel: 'Collect Linen'
            });
          }
        }
      });

      // Unapproved requests
      var unapprovedReqs = requests.filter(r => r.status === 'Pending Approval');
      if (unapprovedReqs.length > 0) {
        alerts.push({
          type: 'Warning',
          desc: `📤 UNAPPROVED ISSUE REQUESTS: ${unapprovedReqs.length} linen issue requests awaiting approval.`,
          actionTab: 'issue',
          btnLabel: 'Go to Issues'
        });
      }

      // Vendor returns overdue
      vendors.forEach(v => {
        if (v.status === 'Overdue') {
          alerts.push({
            type: 'Danger',
            desc: `🏢 OVERDUE VENDOR RETURN: Request ${v.vReqId} sent to ${v.vendorName} is overdue.`,
            actionTab: 'vendor',
            btnLabel: 'Track Vendor'
          });
        }
      });

      // Condemnation awaiting approval
      var pendingCondemns = items.filter(x => x.currentWashCount === x.maxWashCount && x.status !== 'Condemned');
      if (pendingCondemns.length > 0) {
        alerts.push({
          type: 'Warning',
          desc: `⚠️ CONDEMNATION AWAITING APPROVAL: ${pendingCondemns.length} items flagged at maximum wash count limit.`,
          actionTab: 'condemnation',
          btnLabel: 'Review Condemns'
        });
      }

      // Department stock grid setup
      var departmentsList = ["ICU Ward", "OT Complex", "IPD Wards", "Emergency", "Pediatric Ward"];
      var categoryStock = {};
      departmentsList.forEach(dept => {
        categoryStock[dept] = {
          Available: items.filter(x => x.department === dept && x.status === 'Available').length,
          Issued: items.filter(x => x.department === dept && x.status === 'Issued').length,
          Dirty: items.filter(x => x.department === dept && x.status === 'Dirty').length,
          Processing: items.filter(x => x.department === dept && x.status === 'Processing').length,
          Ready: items.filter(x => x.department === dept && x.status === 'Ready').length,
          Damaged: items.filter(x => x.department === dept && x.status === 'Damaged').length,
          WithVendor: items.filter(x => x.department === dept && x.status === 'With Vendor').length
        };
      });

      return `
        <div style="display:flex; flex-direction:column; gap:20px;">
          <!-- 8 KPI STAT CARDS -->
          <div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(135px, 1fr)); gap:10px;">
            <div class="card" style="padding:10px; display:flex; flex-direction:column; gap:5px; border-left:4px solid #10b981;">
              <span style="font-size:10px; font-weight:700; color:var(--text-muted); text-transform:uppercase;">Available</span>
              <span style="font-size:20px; font-weight:900; font-family:monospace;">${available}</span>
            </div>
            <div class="card" style="padding:10px; display:flex; flex-direction:column; gap:5px; border-left:4px solid #3b82f6;">
              <span style="font-size:10px; font-weight:700; color:var(--text-muted); text-transform:uppercase;">Issued</span>
              <span style="font-size:20px; font-weight:900; font-family:monospace;">${issued}</span>
            </div>
            <div class="card" style="padding:10px; display:flex; flex-direction:column; gap:5px; border-left:4px solid #ef4444;">
              <span style="font-size:10px; font-weight:700; color:var(--text-muted); text-transform:uppercase;">Dirty</span>
              <span style="font-size:20px; font-weight:900; font-family:monospace;">${dirty}</span>
            </div>
            <div class="card" style="padding:10px; display:flex; flex-direction:column; gap:5px; border-left:4px solid #f59e0b;">
              <span style="font-size:10px; font-weight:700; color:var(--text-muted); text-transform:uppercase;">Processing</span>
              <span style="font-size:20px; font-weight:900; font-family:monospace;">${processing}</span>
            </div>
            <div class="card" style="padding:10px; display:flex; flex-direction:column; gap:5px; border-left:4px solid #10b981;">
              <span style="font-size:10px; font-weight:700; color:var(--text-muted); text-transform:uppercase;">Ready</span>
              <span style="font-size:20px; font-weight:900; font-family:monospace;">${ready}</span>
            </div>
            <div class="card" style="padding:10px; display:flex; flex-direction:column; gap:5px; border-left:4px solid #8b5cf6;">
              <span style="font-size:10px; font-weight:700; color:var(--text-muted); text-transform:uppercase;">Damaged</span>
              <span style="font-size:20px; font-weight:900; font-family:monospace;">${damaged}</span>
            </div>
            <div class="card" style="padding:10px; display:flex; flex-direction:column; gap:5px; border-left:4px solid #6b7280;">
              <span style="font-size:10px; font-weight:700; color:var(--text-muted); text-transform:uppercase;">Condemned</span>
              <span style="font-size:20px; font-weight:900; font-family:monospace;">${condemned}</span>
            </div>
            <div class="card" style="padding:10px; display:flex; flex-direction:column; gap:5px; border-left:4px solid #ec4899;">
              <span style="font-size:10px; font-weight:700; color:var(--text-muted); text-transform:uppercase;">With Vendor</span>
              <span style="font-size:20px; font-weight:900; font-family:monospace;">${withVendor}</span>
            </div>
          </div>

          <!-- PENDING ACTIONS QUEUE -->
          <div class="card" style="padding:15px; text-align:left;">
            <h3 style="margin:0 0 10px 0; font-size:12.5px; font-weight:800; color:var(--primary); border-bottom:1px solid var(--border-color); padding-bottom:6px;">
              ⚠️ Pending Actions Queue
            </h3>
            <div style="display:flex; flex-direction:column; gap:8px;">
              ${alerts.length === 0 ? `
                <div style="padding:10px; text-align:center; color:var(--text-muted); font-size:11px;">✓ All tasks up to date. No pending alerts.</div>
              ` : alerts.map(a => `
                <div style="display:flex; justify-content:space-between; align-items:center; background:${a.type === 'Danger' ? '#fff5f5' : '#fffbeb'}; border:1px solid ${a.type === 'Danger' ? '#fecaca' : '#fde68a'}; padding:8px 12px; border-radius:6px; font-size:11.5px;">
                  <span style="font-weight:600; color:${a.type === 'Danger' ? '#991b1b' : '#92400e'};">${a.desc}</span>
                  <button class="btn btn-primary btn-xs" onclick="window._hkSetLaundrySubTab('${a.actionTab}')">${a.btnLabel}</button>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- DEPARTMENT STOCK GRID -->
          <div class="card" style="padding:15px;">
            <h3 style="margin:0 0 10px 0; font-size:12.5px; font-weight:800; color:var(--primary); border-bottom:1px solid var(--border-color); padding-bottom:6px;">
              🏢 Department Stock Grid
            </h3>
            <table class="custom-table" style="font-size:11px;">
              <thead>
                <tr>
                  <th>Department</th>
                  <th>Available</th>
                  <th>Issued</th>
                  <th>Dirty</th>
                  <th>Processing</th>
                  <th>Ready</th>
                  <th>Damaged</th>
                  <th>With Vendor</th>
                  <th>Safety Status</th>
                </tr>
              </thead>
              <tbody>
                ${departmentsList.map(dept => {
                  var st = categoryStock[dept];
                  var totAvail = st.Available + st.Ready;
                  var limit = dept === 'ICU Ward' ? 25 : (dept === 'OT Complex' ? 20 : 50);
                  var isCritical = totAvail < (limit / 2);
                  var isLow = totAvail < limit;
                  var statusBadge = isCritical ? '<span class="badge badge-danger" style="font-size:8px;">CRITICAL</span>' : (isLow ? '<span class="badge badge-warning" style="font-size:8px;">LOW STOCK</span>' : '<span class="badge badge-success" style="font-size:8px;">OK</span>');
                  return `
                    <tr>
                      <td><strong>${dept}</strong></td>
                      <td style="font-family:monospace; font-weight:700;">${st.Available}</td>
                      <td style="font-family:monospace;">${st.Issued}</td>
                      <td style="font-family:monospace; color:#b91c1c;">${st.Dirty}</td>
                      <td style="font-family:monospace; color:#d97706;">${st.Processing}</td>
                      <td style="font-family:monospace; color:#065f46;">${st.Ready}</td>
                      <td style="font-family:monospace; color:#8b5cf6;">${st.Damaged}</td>
                      <td style="font-family:monospace; color:#ec4899;">${st.WithVendor}</td>
                      <td>${statusBadge}</td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>

          <!-- TODAY'S PROCESSING PIPELINE -->
          <div class="card" style="padding:15px;">
            <h3 style="margin:0 0 12px 0; font-size:12.5px; font-weight:800; color:var(--primary); border-bottom:1px solid var(--border-color); padding-bottom:6px;">
              🔄 Today's Processing Pipeline (6-Stage Tracker)
            </h3>
            <div style="display:grid; grid-template-columns: repeat(6, 1fr); gap:8px; text-align:center;">
              <div style="background:#f8fafc; border:1px solid var(--border-color); padding:8px; border-radius:6px;">
                <div style="font-size:9.5px; font-weight:700; color:var(--text-muted); text-transform:uppercase;">Received</div>
                <div style="font-size:16px; font-weight:900; font-family:monospace; margin:4px 0;">45</div>
                <div style="font-size:9.5px; color:var(--text-muted);">Avg TAT: 10m</div>
              </div>
              <div style="background:#f8fafc; border:1px solid var(--border-color); padding:8px; border-radius:6px;">
                <div style="font-size:9.5px; font-weight:700; color:var(--text-muted); text-transform:uppercase;">Sorting</div>
                <div style="font-size:16px; font-weight:900; font-family:monospace; margin:4px 0;">30</div>
                <div style="font-size:9.5px; color:var(--text-muted);">Avg TAT: 15m</div>
              </div>
              <div style="background:#f8fafc; border:1px solid var(--border-color); padding:8px; border-radius:6px;">
                <div style="font-size:9.5px; font-weight:700; color:var(--text-muted); text-transform:uppercase;">Washing</div>
                <div style="font-size:16px; font-weight:900; font-family:monospace; margin:4px 0;">30</div>
                <div style="font-size:9.5px; color:var(--text-muted);">Avg TAT: 45m</div>
              </div>
              <div style="background:#f8fafc; border:1px solid var(--border-color); padding:8px; border-radius:6px;">
                <div style="font-size:9.5px; font-weight:700; color:var(--text-muted); text-transform:uppercase;">Drying</div>
                <div style="font-size:16px; font-weight:900; font-family:monospace; margin:4px 0;">35</div>
                <div style="font-size:9.5px; color:var(--text-muted);">Avg TAT: 30m</div>
              </div>
              <div style="background:#f8fafc; border:1px solid var(--border-color); padding:8px; border-radius:6px;">
                <div style="font-size:9.5px; font-weight:700; color:var(--text-muted); text-transform:uppercase;">Iron/Fold</div>
                <div style="font-size:16px; font-weight:900; font-family:monospace; margin:4px 0;">37</div>
                <div style="font-size:9.5px; color:var(--text-muted);">Avg TAT: 20m</div>
              </div>
              <div style="background:#ecfdf5; border:1px solid #a7f3d0; padding:8px; border-radius:6px;">
                <div style="font-size:9.5px; font-weight:700; color:#065f46; text-transform:uppercase;">Ready</div>
                <div style="font-size:16px; font-weight:900; font-family:monospace; color:#065f46; margin:4px 0;">20</div>
                <div style="font-size:9.5px; color:#065f46;">Target: 2.5h</div>
              </div>
            </div>
          </div>
        </div>
      `;
    }

    // ────────────────────────────────────────────────────────────────────────
    // SCREEN 2 - LINEN MASTER
    // ────────────────────────────────────────────────────────────────────────
    function renderLndMaster(items) {
      // Apply filters
      var filtered = items.filter(x => {
        var matchSearch = x.name.toLowerCase().includes(_laundrySearchQuery.toLowerCase()) || x.code.toLowerCase().includes(_laundrySearchQuery.toLowerCase());
        var matchCategory = _laundryCategoryFilter === 'All' || x.category === _laundryCategoryFilter;
        var matchStatus = _laundryStatusFilter === 'All' || x.status === _laundryStatusFilter;
        return matchSearch && matchCategory && matchStatus;
      });

      var categories = ["Bed Sheet", "Pillow Cover", "OT Towel", "Doctor Gown", "Patient Gown", "OT Drape"];

      return `
        <div style="display:flex; flex-direction:column; gap:20px;">
          <!-- FILTERS & ADD BUTTON -->
          <div class="card" style="padding:15px; display:flex; flex-direction:column; gap:12px;">
            <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">
              <h3 style="margin:0; font-size:12.5px; font-weight:800; color:var(--primary);">🔍 Filter Linen Master</h3>
              <button class="btn btn-primary btn-sm" onclick="document.getElementById('add-linen-item-form').style.display='block'">+ Add New Linen</button>
            </div>
            
            <div style="display:grid; grid-template-columns: 2fr 1fr 1fr; gap:10px;">
              <input type="text" class="form-control" placeholder="Search by Linen Code or Name..." value="${_laundrySearchQuery}" oninput="window._hkLndSetSearchQuery(this.value)" style="font-size:12px;">
              <select class="form-select" onchange="window._hkLndSetCategoryFilter(this.value)" style="font-size:12px;">
                <option value="All" ${_laundryCategoryFilter === 'All' ? 'selected' : ''}>All Categories</option>
                ${categories.map(c => `<option value="${c}" ${_laundryCategoryFilter === c ? 'selected' : ''}>${c}</option>`).join('')}
              </select>
              <select class="form-select" onchange="window._hkLndSetStatusFilter(this.value)" style="font-size:12px;">
                <option value="All" ${_laundryStatusFilter === 'All' ? 'selected' : ''}>All Statuses</option>
                <option value="Available" ${_laundryStatusFilter === 'Available' ? 'selected' : ''}>Available</option>
                <option value="Issued" ${_laundryStatusFilter === 'Issued' ? 'selected' : ''}>Issued</option>
                <option value="Dirty" ${_laundryStatusFilter === 'Dirty' ? 'selected' : ''}>Dirty</option>
                <option value="Processing" ${_laundryStatusFilter === 'Processing' ? 'selected' : ''}>Processing</option>
                <option value="Ready" ${_laundryStatusFilter === 'Ready' ? 'selected' : ''}>Ready</option>
                <option value="Damaged" ${_laundryStatusFilter === 'Damaged' ? 'selected' : ''}>Damaged</option>
                <option value="With Vendor" ${_laundryStatusFilter === 'With Vendor' ? 'selected' : ''}>With Vendor</option>
                <option value="Condemned" ${_laundryStatusFilter === 'Condemned' ? 'selected' : ''}>Condemned</option>
              </select>
            </div>
          </div>

          <!-- ADD NEW LINEN FORM (HIDDEN BY DEFAULT) -->
          <div class="card" id="add-linen-item-form" style="padding:15px; display:none; border:1px solid var(--primary); text-align:left;">
            <h4 style="margin:0 0 10px 0; font-size:12.5px; font-weight:800; color:var(--primary); display:flex; justify-content:space-between; align-items:center;">
              ➕ Add New Linen Item
              <button class="btn btn-secondary btn-xs" style="padding:2px 6px;" onclick="document.getElementById('add-linen-item-form').style.display='none'">Close</button>
            </h4>
            <form onsubmit="event.preventDefault(); window._hkLndAddNewLinen();" style="display:grid; grid-template-columns: 1fr 1fr 1fr; gap:10px;">
              <div>
                <label style="font-size:10px; font-weight:700;">Linen Code *</label>
                <input type="text" id="add-lnd-code" class="form-control" style="font-size:11px;" placeholder="e.g. LN-009" required>
              </div>
              <div>
                <label style="font-size:10px; font-weight:700;">Linen Name *</label>
                <input type="text" id="add-lnd-name" class="form-control" style="font-size:11px;" placeholder="e.g. Single Bed Sheet" required>
              </div>
              <div>
                <label style="font-size:10px; font-weight:700;">Category *</label>
                <select id="add-lnd-category" class="form-select" style="font-size:11px;" required>
                  ${categories.map(c => `<option value="${c}">${c}</option>`).join('')}
                </select>
              </div>
              <div>
                <label style="font-size:10px; font-weight:700;">Size *</label>
                <input type="text" id="add-lnd-size" class="form-control" style="font-size:11px;" placeholder="Double / Medium / Standard" required>
              </div>
              <div>
                <label style="font-size:10px; font-weight:700;">Vendor *</label>
                <input type="text" id="add-lnd-vendor" class="form-control" style="font-size:11px;" placeholder="Bombay Dyeing" required>
              </div>
              <div>
                <label style="font-size:10px; font-weight:700;">Purchase Date *</label>
                <input type="date" id="add-lnd-date" class="form-control" style="font-size:11px;" required>
              </div>
              <div>
                <label style="font-size:10px; font-weight:700;">Max Wash Count *</label>
                <input type="number" id="add-lnd-max" class="form-control" style="font-size:11px;" min="1" value="100" required>
              </div>
              <div>
                <label style="font-size:10px; font-weight:700;">Barcode/QR Code (Optional)</label>
                <input type="text" id="add-lnd-barcode" class="form-control" style="font-size:11px;" placeholder="BC-xxxx">
              </div>
              <div style="display:flex; align-items:flex-end;">
                <button type="submit" class="btn btn-primary btn-sm" style="width:100%;">Save Item</button>
              </div>
            </form>
          </div>

          <!-- LINEN MASTER TABLE -->
          <div class="card" style="padding:15px;">
            <table class="custom-table" style="font-size:11px; text-align:left;">
              <thead>
                <tr>
                  <th>Linen Code</th>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Size</th>
                  <th>Department</th>
                  <th>Vendor</th>
                  <th>Washes</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                ${filtered.map(x => {
                  var ratio = x.currentWashCount / x.maxWashCount;
                  var isAtMax = x.currentWashCount === x.maxWashCount;
                  var isNearMax = ratio >= 0.9 && !isAtMax;
                  var isCondemned = x.status === 'Condemned';

                  var rowStyle = isCondemned ? 'background:#f1f5f9; color:#94a3b8; opacity:0.8;' : (isAtMax ? 'background:#fff5f5; border-left:3px solid #ef4444;' : (isNearMax ? 'background:#fffbeb;' : ''));
                  var condemnBtn = (isAtMax && !isCondemned) ? `<button class="btn btn-danger btn-xs" style="padding:2px 6px;" onclick="if(confirm('Are you sure you want to condemn item ${x.code}?')){window._hkLndApproveCondemn('${x.code}');}">Condemn</button>` : '';
                  var statusColor = x.status === 'Available' ? 'color:#10b981;' : (x.status === 'Dirty' ? 'color:#ef4444;' : (x.status === 'Condemned' ? 'color:#6b7280;' : ''));

                  return `
                    <tr style="${rowStyle}">
                      <td style="font-family:monospace; font-weight:700;">${x.code}</td>
                      <td><strong>${x.name}</strong></td>
                      <td>${x.category}</td>
                      <td>${x.size}</td>
                      <td>${x.department || '—'}</td>
                      <td>${x.vendor}</td>
                      <td style="font-family:monospace; font-weight:700;">
                        <span style="${isAtMax ? 'color:#b91c1c;' : (isNearMax ? 'color:#d97706;' : '')}">${x.currentWashCount}</span> / ${x.maxWashCount}
                      </td>
                      <td style="${statusColor} font-weight:700;">${x.status}</td>
                      <td>
                        ${isCondemned ? '<span style="font-size:10px; font-weight:700; color:var(--text-muted);">Read-Only</span>' : `
                          <div style="display:flex; gap:4px;">
                            <button class="btn btn-secondary btn-xs" style="padding:2px 6px;" onclick="alert('Linen details:\\nCode: ${x.code}\\nName: ${x.name}\\nStatus: ${x.status}\\nPurchase Date: ${x.purchaseDate}')">View</button>
                            ${condemnBtn}
                          </div>
                        `}
                      </td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `;
    }

    // ────────────────────────────────────────────────────────────────────────
    // SCREEN 3 - LINEN ISSUE
    // ────────────────────────────────────────────────────────────────────────
    function renderLndIssue(items, requests) {
      var categories = ["Bed Sheet", "Pillow Cover", "OT Towel", "Doctor Gown", "Patient Gown"];
      var depts = ["ICU Ward", "OT Complex", "IPD Wards", "Emergency", "Pediatric Ward"];

      var pending = requests.filter(r => r.status === 'Pending Approval');
      var issuedToday = requests.filter(r => r.status === 'Approved' || r.status === 'Acknowledged');

      return `
        <div style="display:grid; grid-template-columns: 1fr 2fr; gap:20px;">
          <!-- ISSUE REQUEST FORM -->
          <div class="card" style="padding:15px; display:flex; flex-direction:column; gap:12px; height:fit-content;">
            <h3 style="margin:0; font-size:12.5px; font-weight:800; color:var(--primary); border-bottom:1px solid var(--border-color); padding-bottom:6px;">
              📤 Raise Linen Issue Request
            </h3>
            <form onsubmit="event.preventDefault(); window._hkLndSubmitRequest();" style="display:flex; flex-direction:column; gap:10px; text-align:left;">
              <div>
                <label style="font-size:10px; font-weight:700;">Department *</label>
                <select id="issue-req-dept" class="form-select" style="font-size:11px;" required>
                  ${depts.map(d => `<option value="${d}">${d}</option>`).join('')}
                </select>
              </div>
              <div>
                <label style="font-size:10px; font-weight:700;">Linen Category *</label>
                <select id="issue-req-category" class="form-select" style="font-size:11px;" required>
                  ${categories.map(c => `<option value="${c}">${c}</option>`).join('')}
                </select>
              </div>
              <div>
                <label style="font-size:10px; font-weight:700;">Quantity *</label>
                <input type="number" id="issue-req-qty" class="form-control" style="font-size:11px;" min="1" max="100" value="10" required>
              </div>
              <div>
                <label style="font-size:10px; font-weight:700;">Remarks</label>
                <textarea id="issue-req-remarks" class="form-control" style="font-size:11px; height:60px;" placeholder="Add details..."></textarea>
              </div>
              <button type="submit" class="btn btn-primary btn-sm">Submit Request</button>
            </form>
          </div>

          <div style="display:flex; flex-direction:column; gap:20px;">
            <!-- PENDING REQUESTS TABLE -->
            <div class="card" style="padding:15px; text-align:left;">
              <h3 style="margin:0 0 10px 0; font-size:12.5px; font-weight:800; color:var(--primary); border-bottom:1px solid var(--border-color); padding-bottom:6px;">
                📋 Pending Issue Approvals
              </h3>
              <table class="custom-table" style="font-size:11px;">
                <thead>
                  <tr>
                    <th>Req No.</th>
                    <th>Date</th>
                    <th>Dept</th>
                    <th>Category</th>
                    <th>Qty</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  ${pending.length === 0 ? `
                    <tr><td colspan="7" style="text-align:center; padding:15px; color:var(--text-muted);">No pending issue requests.</td></tr>
                  ` : pending.map(r => `
                    <tr>
                      <td style="font-family:monospace; font-weight:700;">${r.reqNo}</td>
                      <td>${r.date}</td>
                      <td><strong>${r.department}</strong></td>
                      <td>${r.category}</td>
                      <td style="font-family:monospace; font-weight:700;">${r.qty}</td>
                      <td><span class="badge badge-warning" style="font-size:8.5px;">Pending Approval</span></td>
                      <td>
                        <div style="display:flex; gap:4px;">
                          <button class="btn btn-success btn-xs" style="padding:2px 6px;" onclick="window._hkLndApproveRequest('${r.reqNo}')">Approve</button>
                          <button class="btn btn-danger btn-xs" style="padding:2px 6px;" onclick="window._hkLndRejectRequest('${r.reqNo}')">Reject</button>
                        </div>
                      </td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>

            <!-- ISSUED TODAY TABLE -->
            <div class="card" style="padding:15px; text-align:left;">
              <h3 style="margin:0 0 10px 0; font-size:12.5px; font-weight:800; color:var(--primary); border-bottom:1px solid var(--border-color); padding-bottom:6px;">
                ✅ Issued Today & Handover Status
              </h3>
              <table class="custom-table" style="font-size:11px;">
                <thead>
                  <tr>
                    <th>Req No.</th>
                    <th>Dept</th>
                    <th>Category</th>
                    <th>Qty</th>
                    <th>Status</th>
                    <th>Acknowledge Gate</th>
                  </tr>
                </thead>
                <tbody>
                  ${issuedToday.length === 0 ? `
                    <tr><td colspan="6" style="text-align:center; padding:15px; color:var(--text-muted);">No dispatches logged today.</td></tr>
                  ` : issuedToday.map(r => {
                    var elapsedMs = Date.now() - new Date("2026-07-04T10:15:00Z").getTime(); // simulation elapsed
                    var showWarning = r.status === 'Approved' && (elapsedMs / 60000 > 30);
                    var warnText = showWarning ? '<span style="color:#b91c1c; font-weight:700;">⚠️ Handover Overdue (>30m)</span>' : '';
                    var ackBtn = r.status === 'Approved' ? `<button class="btn btn-primary btn-xs" onclick="window._hkLndAckRequest('${r.reqNo}')">Confirm Ack</button>` : '<span style="color:#065f46; font-weight:700;">Acknowledged ✓</span>';

                    return `
                      <tr style="${showWarning ? 'background:#fff5f5;' : ''}">
                        <td style="font-family:monospace; font-weight:700;">${r.reqNo}</td>
                        <td><strong>${r.department}</strong></td>
                        <td>${r.category}</td>
                        <td style="font-family:monospace; font-weight:700;">${r.qty}</td>
                        <td>
                          <span class="badge ${r.status === 'Acknowledged' ? 'badge-success' : 'badge-primary'}" style="font-size:8.5px;">${r.status}</span>
                        </td>
                        <td>
                          <div style="display:flex; justify-content:space-between; align-items:center; gap:8px;">
                            ${ackBtn}
                            ${warnText}
                          </div>
                        </td>
                      </tr>
                    `;
                  }).join('')}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      `;
    }

    // ────────────────────────────────────────────────────────────────────────
    // SCREEN 4 - DIRTY LINEN COLLECTION
    // ────────────────────────────────────────────────────────────────────────
    function renderLndDirty(collections) {
      var depts = ["ICU Ward", "OT Complex", "IPD Wards", "Emergency", "Pediatric Ward"];

      return `
        <div style="display:grid; grid-template-columns: 1fr 2fr; gap:20px;">
          <!-- DIRTY COLLECTION FORM -->
          <div class="card" style="padding:15px; display:flex; flex-direction:column; gap:12px; height:fit-content;">
            <h3 style="margin:0; font-size:12.5px; font-weight:800; color:var(--primary); border-bottom:1px solid var(--border-color); padding-bottom:6px;">
              🧼 Record Dirty Linen Collection
            </h3>
            <form onsubmit="event.preventDefault(); window._hkLndCollectDirty();" style="display:flex; flex-direction:column; gap:10px; text-align:left;">
              <div>
                <label style="font-size:10px; font-weight:700;">Collected From (Department) *</label>
                <select id="dirty-col-dept" class="form-select" style="font-size:11px;" required>
                  ${depts.map(d => `<option value="${d}">${d}</option>`).join('')}
                </select>
              </div>
              <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
                <div>
                  <label style="font-size:10px; font-weight:700;">Infected Qty *</label>
                  <input type="number" id="dirty-col-inf" class="form-control" style="font-size:11px;" min="0" value="0" required>
                </div>
                <div>
                  <label style="font-size:10px; font-weight:700;">Non-Infected Qty *</label>
                  <input type="number" id="dirty-col-noninf" class="form-control" style="font-size:11px;" min="0" value="10" required>
                </div>
              </div>
              <div>
                <label style="font-size:10px; font-weight:700;">Infection Type (e.g. MRSA, Hep B)</label>
                <input type="text" id="dirty-col-inf-type" class="form-control" style="font-size:11px;" placeholder="None / MRSA">
              </div>
              <div>
                <label style="font-size:10px; font-weight:700;">Remarks / Sorting Notes</label>
                <textarea id="dirty-col-remarks" class="form-control" style="font-size:11px; height:60px;" placeholder="Mandatory if mixed batch is collected."></textarea>
              </div>
              <button type="submit" class="btn btn-primary btn-sm">Record Collection</button>
            </form>
          </div>

          <!-- PENDING COLLECTION TABLE -->
          <div class="card" style="padding:15px; text-align:left;">
            <h3 style="margin:0 0 10px 0; font-size:12.5px; font-weight:800; color:var(--primary); border-bottom:1px solid var(--border-color); padding-bottom:6px;">
              ⏱️ Pending Dirty Collections Sorted by Wait Time
            </h3>
            <table class="custom-table" style="font-size:11px;">
              <thead>
                <tr>
                  <th>Collection ID</th>
                  <th>Dept</th>
                  <th>Collected By</th>
                  <th>Total Pieces</th>
                  <th>Infected</th>
                  <th>Infection Type</th>
                  <th>Wait / Time</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                ${collections.map(c => {
                  var isOverdue = c.status === 'Pending'; // Emergency collection overdue in seed
                  var rowStyle = isOverdue ? 'background:#fff5f5; color:#991b1b; font-weight:700;' : '';
                  var infBadge = c.infectedQty > 0 ? `<span class="badge badge-danger" style="font-size:8px;">${c.infectedQty} Infected</span>` : '0';

                  return `
                    <tr style="${rowStyle}">
                      <td style="font-family:monospace; font-weight:700;">${c.colId}</td>
                      <td><strong>${c.department}</strong></td>
                      <td>${c.collectedBy}</td>
                      <td style="font-family:monospace; font-weight:700;">${c.totalPieces}</td>
                      <td>${infBadge}</td>
                      <td>${c.infectionType || '—'}</td>
                      <td>
                        <span style="${isOverdue ? 'color:#b91c1c; font-weight:800;' : ''}">${c.dateTime}</span>
                      </td>
                      <td>
                        <span class="badge ${c.status === 'Collected' ? 'badge-success' : (c.status === 'Processing' ? 'badge-primary' : 'badge-danger')}" style="font-size:8.5px;">${c.status}</span>
                      </td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `;
    }

    // ────────────────────────────────────────────────────────────────────────
    // SCREEN 5 - LAUNDRY PROCESSING
    // ────────────────────────────────────────────────────────────────────────
    function renderLndProcessing(batches, machines) {
      return `
        <div style="display:flex; flex-direction:column; gap:20px;">
          <!-- MACHINE STATUS PANEL -->
          <div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap:15px; text-align:left;">
            ${machines.map(m => {
              var percent = m.cycleCount / m.threshold;
              var isDue = m.serviceDue || (percent >= 1.0);
              var badgeColor = isDue ? 'badge-danger' : 'badge-success';

              return `
                <div class="card" style="padding:12px; display:flex; flex-direction:column; gap:8px; border-top: 4px solid ${isDue ? '#ef4444' : '#10b981'};">
                  <div style="display:flex; justify-content:space-between; align-items:center;">
                    <strong style="font-size:12px;">${m.name}</strong>
                    <span class="badge ${badgeColor}" style="font-size:9px;">${isDue ? 'SERVICE DUE' : 'OPERATIONAL'}</span>
                  </div>
                  <div style="font-size:11px; color:var(--text-muted);">${m.type} · Status: <strong>${m.status}</strong></div>
                  
                  <div style="margin-top:4px;">
                    <div style="display:flex; justify-content:space-between; font-size:10px; font-weight:700; margin-bottom:2px;">
                      <span>Cycle Count: ${m.cycleCount} / ${m.threshold}</span>
                      <span>${Math.round(percent * 100)}%</span>
                    </div>
                    <div style="width:100%; height:6px; background:#e2e8f0; border-radius:3px; overflow:hidden;">
                      <div style="width:${Math.min(100, Math.round(percent * 100))}%; height:100%; background:${isDue ? '#ef4444' : '#10b981'};"></div>
                    </div>
                  </div>

                  <div style="display:flex; justify-content:space-between; align-items:center; margin-top:4px;">
                    <span style="font-size:10px; color:var(--text-muted);">Current Load: <strong>${m.load}%</strong></span>
                    <button class="btn btn-secondary btn-xs" style="padding:2px 6px; font-size:9.5px;" onclick="window._hkLndUpdateMachineCycle('${m.name}')">Record Cycle</button>
                  </div>
                </div>
              `;
            }).join('')}
          </div>

          <!-- ACTIVE BATCHES TABLE -->
          <div class="card" style="padding:15px; text-align:left;">
            <h3 style="margin:0 0 10px 0; font-size:12.5px; font-weight:800; color:var(--primary); border-bottom:1px solid var(--border-color); padding-bottom:6px;">
              🔄 Active Washing & Processing Batches
            </h3>
            <table class="custom-table" style="font-size:11px;">
              <thead>
                <tr>
                  <th>Batch ID</th>
                  <th>Source Dept</th>
                  <th>Pieces</th>
                  <th>Type</th>
                  <th>Current Stage</th>
                  <th>Machine</th>
                  <th>Operator</th>
                  <th>Started</th>
                  <th>ETA</th>
                  <th>Damaged Log</th>
                  <th>Update Action</th>
                </tr>
              </thead>
              <tbody>
                ${batches.map(b => {
                  var isInf = b.type === 'Infected';
                  var typeBadge = isInf ? '<span class="badge badge-danger" style="font-size:8px;">☣️ INFECTED</span>' : '<span class="badge badge-secondary" style="font-size:8px;">NON-INFECTED</span>';

                  var stages = ["Received", "Sorting", "Washing", "Drying", "Ironing / Folding", "Ready for Distribution"];
                  var currIdx = stages.indexOf(b.currentStage);
                  var nextStage = currIdx < stages.length - 1 ? stages[currIdx + 1] : null;

                  return `
                    <tr style="${isInf ? 'background:#fff5f5;' : ''}">
                      <td style="font-family:monospace; font-weight:700;">${b.batchId}</td>
                      <td><strong>${b.sourceDept}</strong></td>
                      <td style="font-family:monospace; font-weight:700;">${b.pieces}</td>
                      <td>${typeBadge}</td>
                      <td><strong>${b.currentStage}</strong></td>
                      <td>${b.machine || '—'}</td>
                      <td>${b.operator}</td>
                      <td>${b.started}</td>
                      <td>${b.eta}</td>
                      <td style="font-family:monospace; font-weight:700; color:${b.damagedCount > 0 ? '#b91c1c' : ''};">
                        <div style="display:flex; align-items:center; gap:6px;">
                          <span>${b.damagedCount}</span>
                          <button class="btn btn-secondary btn-xs" style="padding:1px 4px; font-size:8.5px;" onclick="var c=prompt('Enter damaged piece count discovered:'); if(c !== null){window._hkLndLogDamage('${b.batchId}', c);}">+</button>
                        </div>
                      </td>
                      <td>
                        ${nextStage ? `
                          <button class="btn btn-primary btn-xs" style="padding:2px 6px; font-size:9.5px;" onclick="window._hkLndUpdateBatchStage('${b.batchId}', '${nextStage}')">Move to ${nextStage.split(' ')[0]}</button>
                        ` : '<span style="color:#065f46; font-weight:700;">Ready ✓</span>'}
                      </td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `;
    }

    // ────────────────────────────────────────────────────────────────────────
    // SCREEN 6 - CLEAN LINEN DISTRIBUTION
    // ────────────────────────────────────────────────────────────────────────
    function renderLndDistribution(batches, dispatches) {
      var readyBatches = batches.filter(b => b.currentStage === 'Ready for Distribution');
      var depts = ["ICU Ward", "OT Complex", "IPD Wards", "Emergency", "Pediatric Ward"];

      return `
        <div style="display:grid; grid-template-columns: 1.2fr 2fr; gap:20px;">
          <!-- DISPATCH FORM -->
          <div class="card" style="padding:15px; display:flex; flex-direction:column; gap:12px; height:fit-content;">
            <h3 style="margin:0; font-size:12.5px; font-weight:800; color:var(--primary); border-bottom:1px solid var(--border-color); padding-bottom:6px;">
              🚚 Clean Linen Dispatch Form
            </h3>
            <form onsubmit="event.preventDefault(); window._hkLndDispatchClean();" style="display:flex; flex-direction:column; gap:10px; text-align:left;">
              <div>
                <label style="font-size:10px; font-weight:700;">From Batch *</label>
                <select id="disp-batch" class="form-select" style="font-size:11px;" required>
                  ${readyBatches.map(b => `<option value="${b.batchId}">${b.batchId} (${b.sourceDept} - ${b.pieces} pcs)</option>`).join('')}
                </select>
              </div>
              <div>
                <label style="font-size:10px; font-weight:700;">Dispatch To (Department) *</label>
                <select id="disp-dept" class="form-select" style="font-size:11px;" required>
                  ${depts.map(d => `<option value="${d}">${d}</option>`).join('')}
                </select>
              </div>
              <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px;">
                <div>
                  <label style="font-size:10px; font-weight:700;">Linen Category *</label>
                  <select id="disp-category" class="form-select" style="font-size:11px;" required>
                    <option value="Bed Sheet">Bed Sheet</option>
                    <option value="Pillow Cover">Pillow Cover</option>
                    <option value="OT Towel">OT Towel</option>
                    <option value="Doctor Gown">Doctor Gown</option>
                  </select>
                </div>
                <div>
                  <label style="font-size:10px; font-weight:700;">Quantity *</label>
                  <input type="number" id="disp-qty" class="form-control" style="font-size:11px;" min="1" value="20" required>
                </div>
              </div>
              <div>
                <label style="font-size:10px; font-weight:700;">Received / Handed over to Staff Name *</label>
                <input type="text" id="disp-staff" class="form-control" style="font-size:11px;" placeholder="Sister Mercy" required>
              </div>
              <div>
                <label style="font-size:10px; font-weight:700;">Remarks</label>
                <textarea id="disp-remarks" class="form-control" style="font-size:11px; height:50px;"></textarea>
              </div>
              <button type="submit" class="btn btn-primary btn-sm">Confirm Dispatch</button>
            </form>
          </div>

          <div style="display:flex; flex-direction:column; gap:20px;">
            <!-- DISPATCHED TODAY TABLE -->
            <div class="card" style="padding:15px; text-align:left;">
              <h3 style="margin:0 0 10px 0; font-size:12.5px; font-weight:800; color:var(--primary); border-bottom:1px solid var(--border-color); padding-bottom:6px;">
                🚚 Clean Dispatches Handover & Acknowledgement
              </h3>
              <table class="custom-table" style="font-size:11px;">
                <thead>
                  <tr>
                    <th>Dispatch ID</th>
                    <th>Batch</th>
                    <th>Dispatch To</th>
                    <th>Category</th>
                    <th>Qty</th>
                    <th>Handed To</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  ${dispatches.length === 0 ? `
                    <tr><td colspan="8" style="text-align:center; padding:15px; color:var(--text-muted);">No dispatches processed today.</td></tr>
                  ` : dispatches.map(d => {
                    var elapsedMs = Date.now() - new Date("2026-07-04T22:15:00Z").getTime();
                    var showWarning = d.status === 'Pending Acknowledgment' && (elapsedMs / 60000 > 30);
                    var warnText = showWarning ? '<br><span style="color:#b91c1c; font-weight:700; font-size:9px;">⚠️ Handover Overdue (>30m)</span>' : '';
                    var actionBtn = d.status === 'Pending Acknowledgment' ? `<button class="btn btn-success btn-xs" style="padding:2px 6px;" onclick="window._hkLndAckDispatch('${d.dispatchId}')">Acknowledge</button>` : '<span style="color:#065f46; font-weight:700;">Confirmed ✓</span>';

                    return `
                      <tr style="${showWarning ? 'background:#fff5f5;' : ''}">
                        <td style="font-family:monospace; font-weight:700;">${d.dispatchId}</td>
                        <td style="font-family:monospace;">${d.fromBatch}</td>
                        <td><strong>${d.dispatchTo}</strong></td>
                        <td>${d.category}</td>
                        <td style="font-family:monospace; font-weight:700;">${d.qty}</td>
                        <td>${d.receivedBy}</td>
                        <td>
                          <span class="badge ${d.status === 'Acknowledged' ? 'badge-success' : 'badge-primary'}" style="font-size:8.5px;">${d.status}</span>
                          ${warnText}
                        </td>
                        <td>${actionBtn}</td>
                      </tr>
                    `;
                  }).join('')}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      `;
    }

    // ────────────────────────────────────────────────────────────────────────
    // SCREEN 7 - LINEN RETURN
    // ────────────────────────────────────────────────────────────────────────
    function renderLndReturn(returns) {
      var depts = ["ICU Ward", "OT Complex", "IPD Wards", "Emergency", "Pediatric Ward"];

      return `
        <div style="display:grid; grid-template-columns: 1fr 2fr; gap:20px;">
          <!-- RETURN FORM -->
          <div class="card" style="padding:15px; display:flex; flex-direction:column; gap:12px; height:fit-content;">
            <h3 style="margin:0; font-size:12.5px; font-weight:800; color:var(--primary); border-bottom:1px solid var(--border-color); padding-bottom:6px;">
              📥 Record Linen Return / Exchange
            </h3>
            <form onsubmit="event.preventDefault(); window._hkLndSubmitReturn();" style="display:flex; flex-direction:column; gap:10px; text-align:left;">
              <div>
                <label style="font-size:10px; font-weight:700;">Returned From (Department) *</label>
                <select id="ret-dept" class="form-select" style="font-size:11px;" required>
                  ${depts.map(d => `<option value="${d}">${d}</option>`).join('')}
                </select>
              </div>
              <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px;">
                <div>
                  <label style="font-size:10px; font-weight:700;">Linen Category *</label>
                  <select id="ret-category" class="form-select" style="font-size:11px;" required>
                    <option value="Bed Sheet">Bed Sheet</option>
                    <option value="Pillow Cover">Pillow Cover</option>
                    <option value="OT Towel">OT Towel</option>
                    <option value="Doctor Gown">Doctor Gown</option>
                  </select>
                </div>
                <div>
                  <label style="font-size:10px; font-weight:700;">Quantity *</label>
                  <input type="number" id="ret-qty" class="form-control" style="font-size:11px;" min="1" value="5" required>
                </div>
              </div>
              <div>
                <label style="font-size:10px; font-weight:700;">Condition on Return (Safety Audit) *</label>
                <select id="ret-condition" class="form-select" style="font-size:11px;" required>
                  <option value="Clean / Unused">Clean / Unused (Return to Available Stock)</option>
                  <option value="Dirty">Dirty (Route to Dirty Wash Collection)</option>
                  <option value="Damaged">Damaged (Route to Linen Repair Desk)</option>
                </select>
              </div>
              <div>
                <label style="font-size:10px; font-weight:700;">Returned By Staff Name *</label>
                <input type="text" id="ret-staff" class="form-control" style="font-size:11px;" placeholder="Sister Mini" required>
              </div>
              <div>
                <label style="font-size:10px; font-weight:700;">Remarks / Discovery Notes</label>
                <textarea id="ret-remarks" class="form-control" style="font-size:11px; height:50px;"></textarea>
              </div>
              <button type="submit" class="btn btn-primary btn-sm">Process Return</button>
            </form>
          </div>

          <!-- RECENT RETURNS TABLE -->
          <div class="card" style="padding:15px; text-align:left;">
            <h3 style="margin:0 0 10px 0; font-size:12.5px; font-weight:800; color:var(--primary); border-bottom:1px solid var(--border-color); padding-bottom:6px;">
              📥 Recent Linen Returns & Routing Audits
            </h3>
            <table class="custom-table" style="font-size:11px;">
              <thead>
                <tr>
                  <th>Return ID</th>
                  <th>Date</th>
                  <th>Returned From</th>
                  <th>Category</th>
                  <th>Qty</th>
                  <th>Condition</th>
                  <th>Inspected By</th>
                  <th>Action Taken</th>
                </tr>
              </thead>
              <tbody>
                ${returns.map(r => {
                  var condStyle = r.condition === 'Damaged' ? 'color:#b91c1c; font-weight:700;' : (r.condition === 'Dirty' ? 'color:#d97706; font-weight:700;' : 'color:#065f46;');
                  return `
                    <tr>
                      <td style="font-family:monospace; font-weight:700;">${r.returnId}</td>
                      <td>${r.returnDate}</td>
                      <td><strong>${r.returnedFrom}</strong></td>
                      <td>${r.category}</td>
                      <td style="font-family:monospace; font-weight:700;">${r.qty}</td>
                      <td style="${condStyle}">${r.condition}</td>
                      <td>${r.inspectedBy}</td>
                      <td><strong>${r.action}</strong></td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `;
    }

    // ────────────────────────────────────────────────────────────────────────
    // SCREEN 8 - LINEN REPAIR
    // ────────────────────────────────────────────────────────────────────────
    function renderLndRepair(repairs) {
      return `
        <div style="display:grid; grid-template-columns: 1fr 2fr; gap:20px;">
          <!-- REPAIR FORM -->
          <div class="card" style="padding:15px; display:flex; flex-direction:column; gap:12px; height:fit-content;">
            <h3 style="margin:0; font-size:12.5px; font-weight:800; color:var(--primary); border-bottom:1px solid var(--border-color); padding-bottom:6px;">
              🛠️ Log Damaged Linen for Repair
            </h3>
            <form onsubmit="event.preventDefault(); window._hkLndSubmitRepair();" style="display:flex; flex-direction:column; gap:10px; text-align:left;">
              <div>
                <label style="font-size:10px; font-weight:700;">Linen Item Code *</label>
                <input type="text" id="rep-code" class="form-control" style="font-size:11px;" placeholder="e.g. LN-006" required>
              </div>
              <div>
                <label style="font-size:10px; font-weight:700;">Damage Type *</label>
                <select id="rep-damage-type" class="form-select" style="font-size:11px;" required>
                  <option value="Tear / Rip">Tear / Rip</option>
                  <option value="Seam Open">Seam Open</option>
                  <option value="Stain Unremovable">Stain Unremovable</option>
                  <option value="Button / Tie Missing">Button / Tie Missing</option>
                  <option value="Burn Mark">Burn Mark</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label style="font-size:10px; font-weight:700;">Discovery Stage *</label>
                <select id="rep-stage" class="form-select" style="font-size:11px;" required>
                  <option value="Sorting">Sorting</option>
                  <option value="Washing">Washing</option>
                  <option value="Drying">Drying</option>
                  <option value="Ironing / Folding">Ironing / Folding</option>
                  <option value="Distribution">Distribution</option>
                  <option value="Return Inspection">Return Inspection</option>
                </select>
              </div>
              <div>
                <label style="font-size:10px; font-weight:700;">Damage Description</label>
                <textarea id="rep-desc" class="form-control" style="font-size:11px; height:50px;"></textarea>
              </div>
              <button type="submit" class="btn btn-primary btn-sm">Log Repair Request</button>
            </form>
          </div>

          <!-- REPAIR QUEUE TABLE -->
          <div class="card" style="padding:15px; text-align:left;">
            <h3 style="margin:0 0 10px 0; font-size:12.5px; font-weight:800; color:var(--primary); border-bottom:1px solid var(--border-color); padding-bottom:6px;">
              🛠️ Linen Repair Queue & Resolution Actions
            </h3>
            <table class="custom-table" style="font-size:11px;">
              <thead>
                <tr>
                  <th>Repair ID</th>
                  <th>Linen Code</th>
                  <th>Linen Name</th>
                  <th>Damage Type</th>
                  <th>Logged By</th>
                  <th>Description</th>
                  <th>Status</th>
                  <th>Resolve Actions</th>
                </tr>
              </thead>
              <tbody>
                ${repairs.map(r => {
                  var statStyle = r.status === 'Repaired' ? 'color:#065f46; font-weight:700;' : (r.status === 'Irreparable' ? 'color:#b91c1c; font-weight:700;' : 'color:#d97706;');
                  var actionBtns = r.status === 'In Repair' ? `
                    <div style="display:flex; gap:4px;">
                      <button class="btn btn-success btn-xs" style="padding:2px 6px;" onclick="window._hkLndRepairAction('${r.repairId}', 'Repaired')">Return to Stock</button>
                      <button class="btn btn-danger btn-xs" style="padding:2px 6px;" onclick="window._hkLndRepairAction('${r.repairId}', 'Irreparable')">Condemn</button>
                    </div>
                  ` : `<span>Resolved</span>`;
                  return `
                    <tr>
                      <td style="font-family:monospace; font-weight:700;">${r.repairId}</td>
                      <td style="font-family:monospace;">${r.linenCode}</td>
                      <td><strong>${r.linenName}</strong></td>
                      <td>${r.damageType}</td>
                      <td>${r.loggedBy}</td>
                      <td>${r.desc || '—'}</td>
                      <td style="${statStyle}">${r.status}</td>
                      <td>${actionBtns}</td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `;
    }

    // ────────────────────────────────────────────────────────────────────────
    // SCREEN 9 - LINEN CONDEMNATION
    // ────────────────────────────────────────────────────────────────────────
    function renderLndCondemnation(items, condemnations) {
      // Items flagged at max wash count or flagged irreparable
      var pending = items.filter(x => (x.currentWashCount === x.maxWashCount || x.status === 'Irreparable') && x.status !== 'Condemned');

      return `
        <div style="display:flex; flex-direction:column; gap:20px;">
          <!-- PENDING CONDEMNATIONS TABLE -->
          <div class="card" style="padding:15px; text-align:left;">
            <h3 style="margin:0 0 10px 0; font-size:12.5px; font-weight:800; color:var(--primary); border-bottom:1px solid var(--border-color); padding-bottom:6px;">
              ⚠️ Awaiting Condemnation Approvals (HK Manager Gate)
            </h3>
            <table class="custom-table" style="font-size:11px;">
              <thead>
                <tr>
                  <th>Linen Code</th>
                  <th>Linen Name</th>
                  <th>Category</th>
                  <th>Department</th>
                  <th>Wash Cycles</th>
                  <th>Status</th>
                  <th>Reason for Condemnation</th>
                  <th>Approval Actions</th>
                </tr>
              </thead>
              <tbody>
                ${pending.length === 0 ? `
                  <tr><td colspan="8" style="text-align:center; padding:15px; color:var(--text-muted);">No items currently awaiting condemnation approval.</td></tr>
                ` : pending.map(x => `
                  <tr>
                    <td style="font-family:monospace; font-weight:700;">${x.code}</td>
                    <td><strong>${x.name}</strong></td>
                    <td>${x.category}</td>
                    <td>${x.department || '—'}</td>
                    <td style="font-family:monospace; font-weight:700;">${x.currentWashCount} / ${x.maxWashCount}</td>
                    <td><span class="badge badge-danger" style="font-size:8px;">Awaiting Condemn</span></td>
                    <td>
                      <span style="color:#b91c1c; font-weight:700;">
                        ${x.currentWashCount >= x.maxWashCount ? '⚠️ Max Wash Limit Reached' : '🛠️ Declared Irreparable in Repair'}
                      </span>
                    </td>
                    <td>
                      <div style="display:flex; gap:4px;">
                        <button class="btn btn-danger btn-xs" style="padding:2px 8px; font-weight:700;" onclick="if(confirm('Approve condemnation and permanently remove item ${x.code} from active inventory?')){window._hkLndApproveCondemn('${x.code}');}">Approve</button>
                        <button class="btn btn-secondary btn-xs" style="padding:2px 8px;" onclick="window._hkLndRejectCondemn('${x.code}')">Reject</button>
                      </div>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>

          <!-- CONDEMNED THIS MONTH TABLE -->
          <div class="card" style="padding:15px; text-align:left;">
            <h3 style="margin:0 0 10px 0; font-size:12.5px; font-weight:800; color:var(--primary); border-bottom:1px solid var(--border-color); padding-bottom:6px;">
              📋 Condemned Linen Record Log
            </h3>
            <table class="custom-table" style="font-size:11px;">
              <thead>
                <tr>
                  <th>Condemn ID</th>
                  <th>Linen Code</th>
                  <th>Linen Name</th>
                  <th>Reason</th>
                  <th>Approved By</th>
                  <th>Date Condemned</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                ${condemnations.map(c => `
                  <tr>
                    <td style="font-family:monospace; font-weight:700;">${c.condemnId}</td>
                    <td style="font-family:monospace;">${c.linenCode}</td>
                    <td><strong>${c.linenName}</strong></td>
                    <td>${c.reason}</td>
                    <td>${c.approver}</td>
                    <td>${c.dateApproved}</td>
                    <td><span class="badge badge-secondary" style="font-size:8.5px;">Removed from Stock</span></td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `;
    }

    // ────────────────────────────────────────────────────────────────────────
    // SCREEN 10 - VENDOR LAUNDRY
    // ────────────────────────────────────────────────────────────────────────
    function renderLndVendor(vendors) {
      return `
        <div style="display:grid; grid-template-columns: 1fr 2.2fr; gap:20px;">
          <!-- VENDOR DISPATCH FORM -->
          <div class="card" style="padding:15px; display:flex; flex-direction:column; gap:12px; height:fit-content;">
            <h3 style="margin:0; font-size:12.5px; font-weight:800; color:var(--primary); border-bottom:1px solid var(--border-color); padding-bottom:6px;">
              🏢 Send Linens to External Vendor
            </h3>
            <form onsubmit="event.preventDefault(); window._hkLndSubmitVendorRequest();" style="display:flex; flex-direction:column; gap:10px; text-align:left;">
              <div>
                <label style="font-size:10px; font-weight:700;">Vendor Name *</label>
                <select id="vend-name" class="form-select" style="font-size:11px;" required>
                  <option value="QuickClean Commercial Laundry">QuickClean Commercial Laundry</option>
                  <option value="MedLinen Services Ltd">MedLinen Services Ltd</option>
                  <option value="Standard Hospital Washers">Standard Hospital Washers</option>
                </select>
              </div>
              <div style="display:grid; grid-template-columns: 1.5fr 1fr; gap:10px;">
                <div>
                  <label style="font-size:10px; font-weight:700;">Linen Category *</label>
                  <select id="vend-category" class="form-select" style="font-size:11px;" required>
                    <option value="Bed Sheet">Bed Sheet</option>
                    <option value="Pillow Cover">Pillow Cover</option>
                    <option value="OT Towel">OT Towel</option>
                    <option value="Doctor Gown">Doctor Gown</option>
                  </select>
                </div>
                <div>
                  <label style="font-size:10px; font-weight:700;">Qty Sent *</label>
                  <input type="number" id="vend-qty" class="form-control" style="font-size:11px;" min="1" value="50" required>
                </div>
              </div>
              <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px;">
                <div>
                  <label style="font-size:10px; font-weight:700;">Pickup Date *</label>
                  <input type="date" id="vend-pickup" class="form-control" style="font-size:11px;" required>
                </div>
                <div>
                  <label style="font-size:10px; font-weight:700;">Expected Return *</label>
                  <input type="date" id="vend-expected" class="form-control" style="font-size:11px;" required>
                </div>
              </div>
              <div>
                <label style="font-size:10px; font-weight:700;">Special Instructions</label>
                <textarea id="vend-instructions" class="form-control" style="font-size:11px; height:40px;"></textarea>
              </div>
              <button type="submit" class="btn btn-primary btn-sm" onclick="return confirm('Confirm sending selected quantities to laundry vendor?');">Dispatch to Vendor</button>
            </form>
          </div>

          <div style="display:flex; flex-direction:column; gap:20px;">
            <!-- ACTIVE VENDOR CONTRACTS -->
            <div class="card" style="padding:15px; text-align:left;">
              <h3 style="margin:0 0 10px 0; font-size:12.5px; font-weight:800; color:var(--primary); border-bottom:1px solid var(--border-color); padding-bottom:6px;">
                🏢 Active External Vendor washing Ledger
              </h3>
              <table class="custom-table" style="font-size:11px;">
                <thead>
                  <tr>
                    <th>Request ID</th>
                    <th>Vendor</th>
                    <th>Linen Category</th>
                    <th>Qty Sent</th>
                    <th>Pickup Date</th>
                    <th>Expected Return</th>
                    <th>Status</th>
                    <th>Record Return</th>
                  </tr>
                </thead>
                <tbody>
                  ${vendors.map(v => {
                    var isOver = v.status === 'Overdue';
                    var rowStyle = isOver ? 'background:#fff5f5;' : '';
                    var statusBadge = isOver ? '<span class="badge badge-danger" style="font-size:8px;">⚠️ OVERDUE</span>' : '<span class="badge badge-primary" style="font-size:8px;">DISPATCHED</span>';

                    return `
                      <tr style="${rowStyle}">
                        <td style="font-family:monospace; font-weight:700;">${v.vReqId}</td>
                        <td><strong>${v.vendorName}</strong></td>
                        <td>${v.category}</td>
                        <td style="font-family:monospace; font-weight:700;">${v.qtySent}</td>
                        <td>${v.pickupDate}</td>
                        <td>${v.expectedReturnDate}</td>
                        <td>
                          ${statusBadge}
                          ${isOver ? '<br><span style="font-size:9px; color:#b91c1c; font-weight:700;">Alert raised</span>' : ''}
                        </td>
                        <td>
                          <button class="btn btn-success btn-xs" onclick="var c=prompt('Enter returned clean qty:'); var d=prompt('Enter damaged/stained qty:'); var m=prompt('Enter missing qty:'); if(c !== null){window._hkLndReceiveVendorReturn('${v.vReqId}', c, d, m);}">Log Return</button>
                        </td>
                      </tr>
                    `;
                  }).join('')}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      `;
    }

    // ────────────────────────────────────────────────────────────────────────
    // SCREEN 11 - REPORTS
    // ────────────────────────────────────────────────────────────────────────
    function renderLndReports(items, batches, repairs, condemnations) {
      return `
        <div style="display:flex; flex-direction:column; gap:20px;">
          <!-- DATE RANGE & ACTION -->
          <div class="card" style="padding:15px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px; text-align:left;">
            <div>
              <h3 style="margin:0 0 4px 0; font-size:12.5px; font-weight:800; color:var(--primary);">📈 Saronil Laundry Analytics Console</h3>
              <span style="font-size:10px; color:var(--text-muted);">NABH Statutory Hospital Auditing Reports</span>
            </div>
            
            <div style="display:flex; align-items:center; gap:8px;">
              <span style="font-size:11px; font-weight:700;">Range:</span>
              <input type="date" class="form-control" style="font-size:11px; width:130px;" value="${new Date().toISOString().slice(0, 10)}">
              <input type="date" class="form-control" style="font-size:11px; width:130px;" value="${new Date().toISOString().slice(0, 10)}">
              <button class="btn btn-secondary btn-sm" onclick="window._hkLndExportReport('Daily Laundry')">Export CSV</button>
            </div>
          </div>

          <!-- REPORTS GRID -->
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:20px; text-align:left;">
            <!-- REPORT 1: DAILY LAUNDRY REPORT -->
            <div class="card" style="padding:15px;">
              <h4 style="margin:0 0 10px 0; font-size:12px; font-weight:800; border-bottom:1px solid var(--border-color); padding-bottom:6px;">Daily Laundry Performance Report</h4>
              <table class="custom-table" style="font-size:11px;">
                <tbody>
                  <tr><td>Total Clean Pieces Collected</td><td style="font-family:monospace; font-weight:700; text-align:right;">90 pcs</td></tr>
                  <tr><td>Total Batches Processed Today</td><td style="font-family:monospace; font-weight:700; text-align:right;">3 batches</td></tr>
                  <tr><td>Infected Pieces Handled Safely</td><td style="font-family:monospace; font-weight:700; text-align:right; color:#b91c1c;">40 pcs</td></tr>
                  <tr><td>Damaged Pieces Discovered</td><td style="font-family:monospace; font-weight:700; text-align:right; color:#d97706;">3 pcs</td></tr>
                  <tr><td>Condemned / Decommissioned</td><td style="font-family:monospace; font-weight:700; text-align:right; color:#6b7280;">1 pcs</td></tr>
                  <tr><td>Average Cycle Turnaround Time (TAT)</td><td style="font-family:monospace; font-weight:700; text-align:right;">2h 15m</td></tr>
                </tbody>
              </table>
            </div>

            <!-- REPORT 2: MOVEMENT REPORT -->
            <div class="card" style="padding:15px;">
              <h4 style="margin:0 0 10px 0; font-size:12px; font-weight:800; border-bottom:1px solid var(--border-color); padding-bottom:6px;">Turnaround Time (TAT) Trend vs Target</h4>
              <table class="custom-table" style="font-size:11px;">
                <thead>
                  <tr>
                    <th>Department</th>
                    <th>Average TAT</th>
                    <th>SLA Target</th>
                    <th>SLA Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td><strong>OT Complex</strong></td><td style="font-family:monospace;">1h 45m</td><td style="font-family:monospace; color:var(--text-muted);">2h 00m</td><td><span class="badge badge-success" style="font-size:8px;">Met</span></td></tr>
                  <tr><td><strong>ICU Ward</strong></td><td style="font-family:monospace;">2h 10m</td><td style="font-family:monospace; color:var(--text-muted);">2h 30m</td><td><span class="badge badge-success" style="font-size:8px;">Met</span></td></tr>
                  <tr><td><strong>IPD Wards</strong></td><td style="font-family:monospace;">3h 15m</td><td style="font-family:monospace; color:var(--text-muted);">3h 00m</td><td><span class="badge badge-danger" style="font-size:8px;">Breached</span></td></tr>
                </tbody>
              </table>
            </div>

            <!-- REPORT 3: DAMAGED LINEN REPORT -->
            <div class="card" style="padding:15px;">
              <h4 style="margin:0 0 10px 0; font-size:12px; font-weight:800; border-bottom:1px solid var(--border-color); padding-bottom:6px;">Linen Damage Analysis by Category</h4>
              <table class="custom-table" style="font-size:11px;">
                <thead>
                  <tr>
                    <th>Category</th>
                    <th>Tear/Rip</th>
                    <th>Stain Unremovable</th>
                    <th>Burn Mark</th>
                    <th>Discovery Stage</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td><strong>Bed Sheet</strong></td><td style="font-family:monospace;">12</td><td style="font-family:monospace;">5</td><td style="font-family:monospace;">2</td><td>Ironing Complex</td></tr>
                  <tr><td><strong>OT Towel</strong></td><td style="font-family:monospace;">4</td><td style="font-family:monospace;">15</td><td style="font-family:monospace;">1</td><td>Washing Basin</td></tr>
                  <tr><td><strong>Doctor Gown</strong></td><td style="font-family:monospace;">2</td><td style="font-family:monospace;">4</td><td style="font-family:monospace;">0</td><td>Sorting Desk</td></tr>
                </tbody>
              </table>
            </div>

            <!-- REPORT 4: CONDEMNED REPORT -->
            <div class="card" style="padding:15px;">
              <h4 style="margin:0 0 10px 0; font-size:12px; font-weight:800; border-bottom:1px solid var(--border-color); padding-bottom:6px;">Linen Condemnation Approvals Ledger</h4>
              <table class="custom-table" style="font-size:11px;">
                <thead>
                  <tr>
                    <th>Code</th>
                    <th>Linen Name</th>
                    <th>Category</th>
                    <th>Approved By</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  ${condemnations.slice(0, 3).map(c => `
                    <tr>
                      <td style="font-family:monospace;">${c.linenCode}</td>
                      <td>${c.linenName}</td>
                      <td>${c.reason}</td>
                      <td>${c.approver}</td>
                      <td>${c.dateApproved}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      `;
    }

    // ────────────────────────────────────────────────────────────────────────
    // SCREEN 12 - AUDIT LOG
    // ────────────────────────────────────────────────────────────────────────
    function renderLndAudit(auditLogs) {
      return `
        <div class="card" style="padding:15px; text-align:left;">
          <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid var(--border-color); padding-bottom:6px; margin-bottom:12px; flex-wrap:wrap; gap:10px;">
            <h3 style="margin:0; font-size:12.5px; font-weight:800; color:var(--primary);">📝 Linen Lifecycle Audit Transactions Log</h3>
            <span style="font-size:10px; color:var(--text-muted);">Real-Time System Log (System Events Marked as 'System')</span>
          </div>

          <div style="max-height:500px; overflow-y:auto;">
            <table class="custom-table" style="font-size:11px;">
              <thead>
                <tr>
                  <th>Transaction ID</th>
                  <th>Timestamp</th>
                  <th>User / Operator</th>
                  <th>Role</th>
                  <th>Action</th>
                  <th>Linen/Category</th>
                  <th>Remarks</th>
                </tr>
              </thead>
              <tbody>
                ${auditLogs.map(a => `
                  <tr>
                    <td style="font-family:monospace; font-weight:700;">${a.txId}</td>
                    <td>${a.timestamp}</td>
                    <td><strong>${a.user}</strong></td>
                    <td>${a.role}</td>
                    <td>
                      <span class="badge ${a.user === 'System' ? 'badge-secondary' : 'badge-primary'}" style="font-size:8.5px;">${a.action}</span>
                    </td>
                    <td>${a.linenCode}</td>
                    <td>${a.remarks}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `;
    }
  }

  function syncLegacyCssdStock() {
    if (!window.state || !window.state.cssdTrays) return;
    var trays = window.state.cssdTrays;
    window.state.cssdInventory = trays.map(t => {
      var available = t.status === 'Available' ? 1 : 0;
      var dirty = t.status === 'Returned (Dirty)' ? 1 : 0;
      return { kitName: t.trayName, available: available, dirty: dirty, sterilizedAt: t.lastSterilized };
    });
    localStorage.setItem('saronil_cssd_inventory', JSON.stringify(window.state.cssdInventory));
  }

  function renderCssdWorkspace() {
    syncLegacyCssdStock();
    var trays = window.state.cssdTrays || [];
    var collections = window.state.cssdCollections || [];
    var deconLogs = window.state.cssdDeconLogs || [];
    var cleaningLogs = window.state.cssdCleaningLogs || [];
    var packingLogs = window.state.cssdPackingLogs || [];
    var cycles = window.state.cssdCycles || [];
    var issues = window.state.cssdIssues || [];
    var returns = window.state.cssdReturns || [];
    var quarantines = window.state.cssdQuarantines || [];
    var auditLogs = window.state.cssdAuditLogs || [];

    var cssdTabs = [
      { id: 'dashboard', label: '📊 Dashboard' },
      { id: 'master', label: '📋 Master' },
      { id: 'collection', label: '📥 Collect' },
      { id: 'decontamination', label: '🧪 Decon' },
      { id: 'cleaning', label: '🧼 Clean & Insp' },
      { id: 'packing', label: '📦 Pack' },
      { id: 'sterilization', label: '🔥 Sterilize' },
      { id: 'storage', label: '🏬 Storage' },
      { id: 'issue', label: '📤 Issue' },
      { id: 'return', label: '🔄 Return' },
      { id: 'quarantine', label: '⚠️ Quarantine' },
      { id: 'reports', label: '📈 Reports' },
      { id: 'audit', label: '📝 Audit' }
    ];

    // Check for BI Failure full-screen alert
    var hasBiFailure = cycles.some(c => c.biResult === 'Fail');

    return `
      <div style="display:flex; flex-direction:column; gap:20px; text-align:left; font-family:'Inter',sans-serif; width:100%;">
        <!-- BI FAILURE FULL SCREEN DANGER ALERT -->
        ${hasBiFailure ? `
          <div style="background:#dc2626; color:white; border: 4px solid #b91c1c; padding:20px; border-radius:12px; font-weight:bold; font-size:15px; display:flex; flex-direction:column; gap:10px; animation: pulse 2s infinite;">
            <div style="font-size:20px;">⚠️ CRITICAL BIOLOGICAL INDICATOR FAILURE DETECTED!</div>
            <div>A sterilization load has failed biological verification. The entire affected batch has been blocked. All trays in this load must be immediately recalled, returned to decontamination, and the Infection Control Nurse notified.</div>
            <div style="display:flex; gap:10px; margin-top:8px;">
              <button class="btn btn-secondary btn-sm" style="color:#b91c1c; background:white; border:none;" onclick="alert('Quarantine incident logged in audits.');">Recall Batch & Notify IC Nurse</button>
              <button class="btn btn-secondary btn-sm" style="color:white; background:transparent; border:1px solid white;" onclick="window._hkCssdAcknowledgeBiFailure();">Clear Alert (Acknowledge)</button>
            </div>
          </div>
        ` : ''}

        <div class="card-header" style="background:#f8fafc; border: 1px solid var(--border-color); border-radius:8px; padding: 12px 15px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">
          <h2 style="margin:0; font-size:16px; font-weight:900; color:var(--primary);">🧼 Central Sterile Services Department (CSSD)</h2>
          <span style="font-size:11px; font-weight:700; color:var(--text-muted); background:white; padding:4px 10px; border-radius:6px; border:1px solid var(--border-color);">
            Role: <strong>CSSD Supervisor</strong>
          </span>
        </div>

        <!-- Scrollable tab navigation -->
        <div style="display:flex; gap:6px; background:#f1f5f9; padding:6px; border-radius:8px; border:1px solid var(--border-color); overflow-x:auto; white-space:nowrap; width:100%; box-sizing:border-box;">
          ${cssdTabs.map(t => `
            <button class="btn ${_activeCssdSubTab === t.id ? 'btn-primary' : 'btn-secondary'}" style="padding:6px 14px; font-size:11px; font-weight:700;" onclick="window._hkSetCssdSubTab('${t.id}')">${t.label}</button>
          `).join('')}
        </div>

        <div class="cssd-viewport">
          ${_activeCssdSubTab === 'dashboard' ? renderCssdDashboard(trays, collections, cycles, quarantines) : ''}
          ${_activeCssdSubTab === 'master' ? renderCssdMaster(trays) : ''}
          ${_activeCssdSubTab === 'collection' ? renderCssdCollection(trays, collections) : ''}
          ${_activeCssdSubTab === 'decontamination' ? renderCssdDecontamination(trays, deconLogs) : ''}
          ${_activeCssdSubTab === 'cleaning' ? renderCssdCleaning(trays, cleaningLogs) : ''}
          ${_activeCssdSubTab === 'packing' ? renderCssdPacking(trays, packingLogs) : ''}
          ${_activeCssdSubTab === 'sterilization' ? renderCssdSterilization(trays, cycles) : ''}
          ${_activeCssdSubTab === 'storage' ? renderCssdStorage(trays) : ''}
          ${_activeCssdSubTab === 'issue' ? renderCssdIssue(trays, issues) : ''}
          ${_activeCssdSubTab === 'return' ? renderCssdReturn(trays, returns) : ''}
          ${_activeCssdSubTab === 'quarantine' ? renderCssdQuarantine(quarantines) : ''}
          ${_activeCssdSubTab === 'reports' ? renderCssdReports(trays, cycles, quarantines) : ''}
          ${_activeCssdSubTab === 'audit' ? renderCssdAudit(auditLogs) : ''}
        </div>
      </div>
    `;

    // ────────────────────────────────────────────────────────────────────────
    // SCREEN 1 - DASHBOARD
    // ────────────────────────────────────────────────────────────────────────
    function renderCssdDashboard(trays, collections, cycles, quarantines) {
      var available = trays.filter(x => x.status === 'Available').length;
      var processing = trays.filter(x => ['Decontamination', 'Cleaning', 'Inspection & Assembly', 'Packing', 'Sterilization'].indexOf(x.status) !== -1).length;
      var ready = trays.filter(x => x.status === 'Sterile Storage').length;
      var issued = trays.filter(x => x.status === 'Issued').length;
      var overdue = returns.filter(r => r.piecesMissing > 0).length; // or missing
      var expiring = trays.filter(x => {
        if (!x.validUntil || x.validUntil === '—') return false;
        var diff = new Date(x.validUntil.replace(' · ', ' ')).getTime() - Date.now();
        return diff > 0 && diff < 86400000;
      }).length;
      var expired = trays.filter(x => x.status === 'Expired').length;

      var alerts = [];
      // Unapproved collections
      var unacknowledged = collections.filter(c => c.status === 'Pending');
      if (unacknowledged.length > 0) {
        alerts.push({
          type: 'Warning',
          desc: `📥 UNAPPROVED COLLECTIONS: ${unacknowledged.length} instrument collection requests pending CSSD acknowledgement.`,
          actionTab: 'collection',
          btnLabel: 'Acknowledge'
        });
      }
      // BI Pending
      var biPending = cycles.filter(c => c.biResult === 'Pending');
      if (biPending.length > 0) {
        alerts.push({
          type: 'Warning',
          desc: `🔥 BI RESULTS PENDING: ${biPending.length} autoclave cycles awaiting Biological Indicator results validation.`,
          actionTab: 'sterilization',
          btnLabel: 'Verify BI'
        });
      }
      // Items expiring within 24 hours
      if (expiring > 0) {
        alerts.push({
          type: 'Warning',
          desc: `⏳ EXPIRING SOON: ${expiring} surgical trays expiring sterility validity within 24 hours.`,
          actionTab: 'storage',
          btnLabel: 'View Storage'
        });
      }
      // Quarantined items
      var activeQuarantines = quarantines.filter(q => q.status === 'Active');
      if (activeQuarantines.length > 0) {
        alerts.push({
          type: 'Danger',
          desc: `⚠️ ACTIVE QUARANTINES: ${activeQuarantines.length} instrument trays currently quarantined under IC investigation.`,
          actionTab: 'quarantine',
          btnLabel: 'Resolve'
        });
      }

      // Counts per stage
      var stages = {
        Decontamination: trays.filter(x => x.status === 'Decontamination').length,
        Cleaning: trays.filter(x => x.status === 'Cleaning').length,
        Inspection: trays.filter(x => x.status === 'Inspection & Assembly').length,
        Packing: trays.filter(x => x.status === 'Packing').length,
        Sterilization: trays.filter(x => x.status === 'Sterilization').length,
        'Sterile Storage': trays.filter(x => x.status === 'Sterile Storage').length
      };

      return `
        <div style="display:flex; flex-direction:column; gap:20px;">
          <!-- KPI STAT CARDS -->
          <div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)); gap:10px;">
            <div class="card" style="padding:10px; border-left:4px solid #10b981; text-align:left;">
              <span style="font-size:10px; font-weight:700; color:var(--text-muted); text-transform:uppercase;">Trays Sterile</span>
              <div style="font-size:20px; font-weight:900; font-family:monospace; margin-top:4px;">${available}</div>
            </div>
            <div class="card" style="padding:10px; border-left:4px solid #ef4444; text-align:left;">
              <span style="font-size:10px; font-weight:700; color:var(--text-muted); text-transform:uppercase;">In Processing</span>
              <div style="font-size:20px; font-weight:900; font-family:monospace; margin-top:4px;">${processing}</div>
            </div>
            <div class="card" style="padding:10px; border-left:4px solid #3b82f6; text-align:left;">
              <span style="font-size:10px; font-weight:700; color:var(--text-muted); text-transform:uppercase;">Ready For Issue</span>
              <div style="font-size:20px; font-weight:900; font-family:monospace; margin-top:4px;">${ready}</div>
            </div>
            <div class="card" style="padding:10px; border-left:4px solid #8b5cf6; text-align:left;">
              <span style="font-size:10px; font-weight:700; color:var(--text-muted); text-transform:uppercase;">Issued</span>
              <div style="font-size:20px; font-weight:900; font-family:monospace; margin-top:4px;">${issued}</div>
            </div>
            <div class="card" style="padding:10px; border-left:4px solid #ec4899; text-align:left;">
              <span style="font-size:10px; font-weight:700; color:var(--text-muted); text-transform:uppercase;">Overdue Returns</span>
              <div style="font-size:20px; font-weight:900; font-family:monospace; margin-top:4px;">${overdue}</div>
            </div>
            <div class="card" style="padding:10px; border-left:4px solid #f59e0b; text-align:left;">
              <span style="font-size:10px; font-weight:700; color:var(--text-muted); text-transform:uppercase;">Expiring Today</span>
              <div style="font-size:20px; font-weight:900; font-family:monospace; margin-top:4px;">${expiring}</div>
            </div>
            <div class="card" style="padding:10px; border-left:4px solid #6b7280; text-align:left;">
              <span style="font-size:10px; font-weight:700; color:var(--text-muted); text-transform:uppercase;">Expired</span>
              <div style="font-size:20px; font-weight:900; font-family:monospace; color:#dc2626; margin-top:4px;">${expired}</div>
            </div>
          </div>

          <!-- PENDING ACTIONS QUEUE -->
          <div class="card" style="padding:15px;">
            <h3 style="margin:0 0 10px 0; font-size:12.5px; font-weight:800; color:var(--primary); border-bottom:1px solid var(--border-color); padding-bottom:6px;">
              ⚠️ Pending Actions Queue
            </h3>
            <div style="display:flex; flex-direction:column; gap:8px;">
              ${alerts.length === 0 ? `
                <div style="padding:10px; text-align:center; color:var(--text-muted); font-size:11px;">✓ All sterilization tracks up to date.</div>
              ` : alerts.map(a => `
                <div style="display:flex; justify-content:space-between; align-items:center; background:${a.type === 'Danger' ? '#fff5f5' : '#fffbeb'}; border:1px solid ${a.type === 'Danger' ? '#fecaca' : '#fde68a'}; padding:8px 12px; border-radius:6px; font-size:11.5px;">
                  <span style="font-weight:600; color:${a.type === 'Danger' ? '#991b1b' : '#92400e'};">${a.desc}</span>
                  <button class="btn btn-primary btn-xs" onclick="window._hkSetCssdSubTab('${a.actionTab}')">${a.btnLabel}</button>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- ACTIVE PROCESSING PIPELINE -->
          <div class="card" style="padding:15px;">
            <h3 style="margin:0 0 12px 0; font-size:12.5px; font-weight:800; color:var(--primary); border-bottom:1px solid var(--border-color); padding-bottom:6px;">
              🔄 Active Processing Pipeline Track
            </h3>
            <div style="display:grid; grid-template-columns: repeat(6, 1fr); gap:8px; text-align:center;">
              <div style="background:#f8fafc; border:1px solid var(--border-color); padding:8px; border-radius:6px;">
                <div style="font-size:9px; font-weight:700; color:var(--text-muted); text-transform:uppercase;">Decon</div>
                <div style="font-size:16px; font-weight:900; font-family:monospace; margin:4px 0;">${stages.Decontamination}</div>
              </div>
              <div style="background:#f8fafc; border:1px solid var(--border-color); padding:8px; border-radius:6px;">
                <div style="font-size:9px; font-weight:700; color:var(--text-muted); text-transform:uppercase;">Cleaning</div>
                <div style="font-size:16px; font-weight:900; font-family:monospace; margin:4px 0;">${stages.Cleaning}</div>
              </div>
              <div style="background:#f8fafc; border:1px solid var(--border-color); padding:8px; border-radius:6px;">
                <div style="font-size:9px; font-weight:700; color:var(--text-muted); text-transform:uppercase;">Inspection</div>
                <div style="font-size:16px; font-weight:900; font-family:monospace; margin:4px 0;">${stages.Inspection}</div>
              </div>
              <div style="background:#f8fafc; border:1px solid var(--border-color); padding:8px; border-radius:6px;">
                <div style="font-size:9px; font-weight:700; color:var(--text-muted); text-transform:uppercase;">Packing</div>
                <div style="font-size:16px; font-weight:900; font-family:monospace; margin:4px 0;">${stages.Packing}</div>
              </div>
              <div style="background:#f8fafc; border:1px solid var(--border-color); padding:8px; border-radius:6px;">
                <div style="font-size:9px; font-weight:700; color:var(--text-muted); text-transform:uppercase;">Sterilization</div>
                <div style="font-size:16px; font-weight:900; font-family:monospace; margin:4px 0;">${stages.Sterilization}</div>
              </div>
              <div style="background:#ecfdf5; border:1px solid #a7f3d0; padding:8px; border-radius:6px;">
                <div style="font-size:9px; font-weight:700; color:#065f46; text-transform:uppercase;">Sterile Storage</div>
                <div style="font-size:16px; font-weight:900; font-family:monospace; color:#065f46; margin:4px 0;">${stages['Sterile Storage']}</div>
              </div>
            </div>
          </div>

          <!-- STERILIZATION CYCLE STATUS -->
          <div class="card" style="padding:15px;">
            <h3 style="margin:0 0 10px 0; font-size:12.5px; font-weight:800; color:var(--primary); border-bottom:1px solid var(--border-color); padding-bottom:6px;">
              🔥 Active Sterilization Cycles Running Now
            </h3>
            <table class="custom-table" style="font-size:11px;">
              <thead>
                <tr>
                  <th>Cycle ID</th>
                  <th>Machine ID</th>
                  <th>Method</th>
                  <th>Load contents</th>
                  <th>Start Time</th>
                  <th>BI Status</th>
                  <th>Release Status</th>
                </tr>
              </thead>
              <tbody>
                ${cycles.filter(c => c.releaseStatus === 'Pending Release').map(c => `
                  <tr>
                    <td style="font-family:monospace; font-weight:700;">${c.cycleId}</td>
                    <td>${c.machineId}</td>
                    <td><strong>${c.method}</strong></td>
                    <td>${c.loadContents}</td>
                    <td>${c.startTime}</td>
                    <td><span class="badge badge-warning" style="font-size:8.5px;">Pending BI</span></td>
                    <td>
                      <button class="btn btn-success btn-xs" onclick="window._hkSetCssdSubTab('sterilization')">Verify & Release</button>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `;
    }

    // ────────────────────────────────────────────────────────────────────────
    // SCREEN 2 - INSTRUMENT MASTER
    // ────────────────────────────────────────────────────────────────────────
    function renderCssdMaster(trays) {
      var filtered = trays.filter(x => {
        var matchSearch = x.trayName.toLowerCase().includes(_cssdSearchQuery.toLowerCase()) || x.trayId.toLowerCase().includes(_cssdSearchQuery.toLowerCase());
        var matchMethod = _cssdMethodFilter === 'All' || x.method === _cssdMethodFilter;
        var matchStatus = _cssdStatusFilter === 'All' || x.status === _cssdStatusFilter;
        return matchSearch && matchMethod && matchStatus;
      });

      var methods = ["Steam", "EO", "Plasma"];

      return `
        <div style="display:flex; flex-direction:column; gap:20px;">
          <!-- FILTERS & ADD BUTTON -->
          <div class="card" style="padding:15px; display:flex; flex-direction:column; gap:12px;">
            <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">
              <h3 style="margin:0; font-size:12.5px; font-weight:800; color:var(--primary);">🔍 Filter Instrument Master</h3>
              <button class="btn btn-primary btn-sm" onclick="document.getElementById('add-tray-item-form').style.display='block'">+ Add New Tray</button>
            </div>
            
            <div style="display:grid; grid-template-columns: 2fr 1fr 1fr; gap:10px;">
              <input type="text" class="form-control" placeholder="Search by Tray ID or Name..." value="${_cssdSearchQuery}" oninput="window._hkCssdSetSearchQuery(this.value)" style="font-size:12px;">
              <select class="form-select" onchange="window._hkCssdSetMethodFilter(this.value)" style="font-size:12px;">
                <option value="All" ${_cssdMethodFilter === 'All' ? 'selected' : ''}>All Sterilization Methods</option>
                ${methods.map(m => `<option value="${m}" ${_cssdMethodFilter === m ? 'selected' : ''}>${m}</option>`).join('')}
              </select>
              <select class="form-select" onchange="window._hkCssdSetStatusFilter(this.value)" style="font-size:12px;">
                <option value="All" ${_cssdStatusFilter === 'All' ? 'selected' : ''}>All Statuses</option>
                <option value="Available" ${_cssdStatusFilter === 'Available' ? 'selected' : ''}>Available (Sterile)</option>
                <option value="Issued" ${_cssdStatusFilter === 'Issued' ? 'selected' : ''}>Issued</option>
                <option value="Returned (Dirty)" ${_cssdStatusFilter === 'Returned (Dirty)' ? 'selected' : ''}>Returned (Dirty)</option>
                <option value="Decontamination" ${_cssdStatusFilter === 'Decontamination' ? 'selected' : ''}>Decontamination</option>
                <option value="Cleaning" ${_cssdStatusFilter === 'Cleaning' ? 'selected' : ''}>Cleaning</option>
                <option value="Inspection & Assembly" ${_cssdStatusFilter === 'Inspection & Assembly' ? 'selected' : ''}>Inspection</option>
                <option value="Packing" ${_cssdStatusFilter === 'Packing' ? 'selected' : ''}>Packing</option>
                <option value="Sterilization" ${_cssdStatusFilter === 'Sterilization' ? 'selected' : ''}>Sterilization</option>
                <option value="Sterile Storage" ${_cssdStatusFilter === 'Sterile Storage' ? 'selected' : ''}>Sterile Storage</option>
                <option value="Quarantine" ${_cssdStatusFilter === 'Quarantine' ? 'selected' : ''}>Quarantine</option>
                <option value="Expired" ${_cssdStatusFilter === 'Expired' ? 'selected' : ''}>Expired</option>
                <option value="Condemned" ${_cssdStatusFilter === 'Condemned' ? 'selected' : ''}>Condemned</option>
              </select>
            </div>
          </div>

          <!-- ADD NEW TRAY FORM -->
          <div class="card" id="add-tray-item-form" style="padding:15px; display:none; border:1px solid var(--primary); text-align:left;">
            <h4 style="margin:0 0 10px 0; font-size:12.5px; font-weight:800; color:var(--primary); display:flex; justify-content:space-between; align-items:center;">
              ➕ Add New Instrument Tray / Set
              <button class="btn btn-secondary btn-xs" style="padding:2px 6px;" onclick="document.getElementById('add-tray-item-form').style.display='none'">Close</button>
            </h4>
            <form onsubmit="event.preventDefault(); window._hkCssdAddNewTray();" style="display:grid; grid-template-columns: 1fr 1fr 1fr; gap:10px;">
              <div>
                <label style="font-size:10px; font-weight:700;">Tray ID *</label>
                <input type="text" id="add-cs-id" class="form-control" style="font-size:11px;" placeholder="e.g. TRY-ORTH-003" required>
              </div>
              <div>
                <label style="font-size:10px; font-weight:700;">Tray Name *</label>
                <input type="text" id="add-cs-name" class="form-control" style="font-size:11px;" placeholder="e.g. Ortho Trauma Set B" required>
              </div>
              <div>
                <label style="font-size:10px; font-weight:700;">Department Owner *</label>
                <input type="text" id="add-cs-dept" class="form-control" style="font-size:11px;" placeholder="e.g. OT Complex" required>
              </div>
              <div>
                <label style="font-size:10px; font-weight:700;">Sterilization Method *</label>
                <select id="add-cs-method" class="form-select" style="font-size:11px;" required>
                  <option value="Steam">Steam Autoclave</option>
                  <option value="EO">Ethylene Oxide (EO)</option>
                  <option value="Plasma">Hydrogen Peroxide Plasma</option>
                </select>
              </div>
              <div>
                <label style="font-size:10px; font-weight:700;">Instrument List Description *</label>
                <input type="text" id="add-cs-instr" class="form-control" style="font-size:11px;" placeholder="e.g. Bone Drill x1, Forceps x2" required>
              </div>
              <div style="display:flex; align-items:flex-end;">
                <button type="submit" class="btn btn-primary btn-sm" style="width:100%;">Register Tray</button>
              </div>
            </form>
          </div>

          <!-- TRAY MASTER TABLE -->
          <div class="card" style="padding:15px;">
            <table class="custom-table" style="font-size:11px; text-align:left;">
              <thead>
                <tr>
                  <th>Tray ID</th>
                  <th>Tray Name</th>
                  <th>Department</th>
                  <th>Method</th>
                  <th>Cycle Count</th>
                  <th>Last Sterilized</th>
                  <th>Sterility Expiry</th>
                  <th>Status</th>
                  <th>Action Actions</th>
                </tr>
              </thead>
              <tbody>
                ${filtered.map(x => {
                  var isExpired = x.status === 'Expired';
                  var isCondemned = x.status === 'Condemned';
                  var isQuarantine = x.status === 'Quarantine';

                  // Amber within 24 hours logic
                  var isAmber = false;
                  if (x.validUntil && x.validUntil !== '—') {
                    var diff = new Date(x.validUntil.replace(' · ', ' ')).getTime() - Date.now();
                    if (diff > 0 && diff < 86400000) isAmber = true;
                  }

                  var rowStyle = isCondemned ? 'background:#f1f5f9; color:#94a3b8; opacity:0.8;' : (isExpired ? 'background:#fff5f5; border-left:3px solid #ef4444;' : (isAmber ? 'background:#fffbeb;' : ''));
                  var statusBadge = isExpired ? '<span class="badge badge-danger" style="font-size:8.5px;">EXPIRED</span>' : (isQuarantine ? '<span class="badge badge-danger" style="font-size:8.5px;">QUARANTINED</span>' : `<span class="badge badge-success" style="font-size:8.5px;">${x.status}</span>`);

                  return `
                    <tr style="${rowStyle}">
                      <td style="font-family:monospace; font-weight:700;">${x.trayId}</td>
                      <td><strong>${x.trayName}</strong></td>
                      <td>${x.department}</td>
                      <td>${x.method}</td>
                      <td style="font-family:monospace; font-weight:700;">${x.cycleCount}</td>
                      <td>${x.lastSterilized}</td>
                      <td style="font-family:monospace; font-weight:700; color:${isExpired ? '#b91c1c' : ''};">${x.validUntil}</td>
                      <td>${statusBadge}</td>
                      <td>
                        ${isCondemned ? '<span style="font-size:10px; font-weight:700; color:var(--text-muted);">Decommissioned</span>' : `
                          <div style="display:flex; gap:4px;">
                            <button class="btn btn-secondary btn-xs" style="padding:2px 6px;" onclick="alert('Tray Manifest:\\n${x.instruments.map(i => i.name + ' x' + i.count).join('\\n')}')">Manifest</button>
                            ${!isQuarantine ? `<button class="btn btn-warning btn-xs" style="padding:2px 6px;" onclick="window._hkCssdQuarantineTray('${x.trayId}')">Quarantine</button>` : ''}
                            <button class="btn btn-danger btn-xs" style="padding:2px 6px;" onclick="if(confirm('Decommission and condemn this tray?')){window._hkCssdCondemnTray('${x.trayId}');}">Condemn</button>
                          </div>
                        `}
                      </td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `;
    }

    // ────────────────────────────────────────────────────────────────────────
    // SCREEN 3 - COLLECTION REQUEST
    // ────────────────────────────────────────────────────────────────────────
    function renderCssdCollection(trays, collections) {
      var pending = collections.filter(c => c.status === 'Pending');

      return `
        <div style="display:grid; grid-template-columns: 1fr 2fr; gap:20px;">
          <!-- COLLECTION FORM -->
          <div class="card" style="padding:15px; display:flex; flex-direction:column; gap:12px; height:fit-content;">
            <h3 style="margin:0; font-size:12.5px; font-weight:800; color:var(--primary); border-bottom:1px solid var(--border-color); padding-bottom:6px;">
              📥 Raise Instrument Collection Request
            </h3>
            <form onsubmit="event.preventDefault(); window._hkCssdSubmitCollection();" style="display:flex; flex-direction:column; gap:10px; text-align:left;">
              <div>
                <label style="font-size:10px; font-weight:700;">Department *</label>
                <select id="col-req-dept" class="form-select" style="font-size:11px;" required>
                  <option value="OT Complex">OT Complex</option>
                  <option value="ICU Ward">ICU Ward</option>
                  <option value="Maternity Ward">Maternity Ward</option>
                  <option value="Emergency">Emergency Complex</option>
                </select>
              </div>
              <div>
                <label style="font-size:10px; font-weight:700;">Instrument Set / Tray Name *</label>
                <select id="col-req-tray" class="form-select" style="font-size:11px;" required>
                  ${trays.map(t => `<option value="${t.trayName}">${t.trayName} (${t.trayId})</option>`).join('')}
                </select>
              </div>
              <div>
                <label style="font-size:10px; font-weight:700;">Urgency *</label>
                <select id="col-req-urgency" class="form-select" style="font-size:11px;" required>
                  <option value="Routine">Routine</option>
                  <option value="Urgent">Urgent</option>
                  <option value="Emergency">Emergency (Immediate collection alert)</option>
                </select>
              </div>
              <div>
                <label style="font-size:10px; font-weight:700;">Remarks</label>
                <textarea id="col-req-remarks" class="form-control" style="font-size:11px; height:50px;" placeholder="Details..."></textarea>
              </div>
              <button type="submit" class="btn btn-primary btn-sm">Raise Collection Request</button>
            </form>
          </div>

          <!-- PENDING COLLECTIONS TABLE -->
          <div class="card" style="padding:15px; text-align:left;">
            <h3 style="margin:0 0 10px 0; font-size:12.5px; font-weight:800; color:var(--primary); border-bottom:1px solid var(--border-color); padding-bottom:6px;">
              ⏱️ Pending Collections (CSSD Supervisor Transport Assignment Gate)
            </h3>
            <table class="custom-table" style="font-size:11px;">
              <thead>
                <tr>
                  <th>Request ID</th>
                  <th>Date & Time</th>
                  <th>Department</th>
                  <th>Set Name</th>
                  <th>Urgency</th>
                  <th>Remarks</th>
                  <th>Status</th>
                  <th>Supervisor Action</th>
                </tr>
              </thead>
              <tbody>
                ${collections.map(c => {
                  var isEmerg = c.urgency === 'Emergency';
                  var rowStyle = isEmerg ? 'background:#fff5f5; border-left:3px solid #dc2626; color:#991b1b; font-weight:700;' : '';

                  return `
                    <tr style="${rowStyle}">
                      <td style="font-family:monospace; font-weight:700;">${c.reqId}</td>
                      <td>${c.date}</td>
                      <td><strong>${c.department}</strong></td>
                      <td>${c.trayName}</td>
                      <td>
                        <span class="badge ${isEmerg ? 'badge-danger' : (c.urgency === 'Urgent' ? 'badge-warning' : 'badge-secondary')}" style="font-size:8px;">
                          ${c.urgency}
                        </span>
                      </td>
                      <td>${c.remarks || '—'}</td>
                      <td><span class="badge ${c.status === 'Received' ? 'badge-success' : 'badge-warning'}" style="font-size:8.5px;">${c.status}</span></td>
                      <td>
                        ${c.status === 'Pending' ? `
                          <button class="btn btn-success btn-xs" style="padding:2px 8px; font-weight:700;" onclick="window._hkCssdAckCollection('${c.reqId}')">Acknowledge & Transport</button>
                        ` : '<span style="color:#065f46; font-weight:700;">In Decon Cycle ✓</span>'}
                      </td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `;
    }

    // ────────────────────────────────────────────────────────────────────────
    // SCREEN 4 - DECONTAMINATION
    // ────────────────────────────────────────────────────────────────────────
    function renderCssdDecontamination(trays, deconLogs) {
      var decons = trays.filter(x => x.status === 'Decontamination');

      return `
        <div style="display:grid; grid-template-columns: 1fr 2fr; gap:20px;">
          <!-- DECONTAMINATION FORM -->
          <div class="card" style="padding:15px; display:flex; flex-direction:column; gap:12px; height:fit-content;">
            <h3 style="margin:0; font-size:12.5px; font-weight:800; color:var(--primary); border-bottom:1px solid var(--border-color); padding-bottom:6px;">
              🧪 Record enzymatic Pre-Soak log
            </h3>
            <form onsubmit="event.preventDefault(); window._hkCssdSubmitDecon();" style="display:flex; flex-direction:column; gap:10px; text-align:left;">
              <div>
                <label style="font-size:10px; font-weight:700;">Tray / Set ID *</label>
                <select id="decon-tray" class="form-select" style="font-size:11px;" required>
                  ${decons.map(t => `<option value="${t.trayId}">${t.trayName} (${t.trayId})</option>`).join('')}
                </select>
              </div>
              <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
                <div>
                  <label style="font-size:10px; font-weight:700;">Soak duration (min) *</label>
                  <input type="number" id="decon-duration" class="form-control" style="font-size:11px;" min="5" value="20" required>
                </div>
                <div>
                  <label style="font-size:10px; font-weight:700;">Gross soil present *</label>
                  <select id="decon-soil" class="form-select" style="font-size:11px;" required>
                    <option value="No">No</option>
                    <option value="Yes">Yes</option>
                  </select>
                </div>
              </div>
              <div>
                <label style="font-size:10px; font-weight:700;">Infectious / Isolation Room Source? *</label>
                <select id="decon-infectious" class="form-select" style="font-size:11px;" required>
                  <option value="No">No</option>
                  <option value="Yes">Yes (Apply Enhanced Protocol + IC Nurse Notification)</option>
                </select>
              </div>
              <div>
                <label style="font-size:10px; font-weight:700;">Soaking solution *</label>
                <input type="text" id="decon-solution" class="form-control" style="font-size:11px;" value="Enzymatic Multi-Zyme 2%" required>
              </div>
              <button type="submit" class="btn btn-primary btn-sm">Log Decontamination Complete</button>
            </form>
          </div>

          <!-- ACTIVE DECONTAMINATION QUEUE -->
          <div class="card" style="padding:15px; text-align:left;">
            <h3 style="margin:0 0 10px 0; font-size:12.5px; font-weight:800; color:var(--primary); border-bottom:1px solid var(--border-color); padding-bottom:6px;">
              🧪 Active Decontamination Queue (Washing Area)
            </h3>
            <table class="custom-table" style="font-size:11px;">
              <thead>
                <tr>
                  <th>Tray ID</th>
                  <th>Set Name</th>
                  <th>Department</th>
                  <th>Method</th>
                  <th>Cycles Completed</th>
                  <th>Infection Flag</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                ${decons.length === 0 ? `
                  <tr><td colspan="7" style="text-align:center; padding:15px; color:var(--text-muted);">No trays waiting in decontamination.</td></tr>
                ` : decons.map(t => {
                  var isInf = t.trayId === 'TRY-PLAS-005'; // simulated inf flag in queue border check
                  var rowStyle = isInf ? 'border: 2px solid #dc2626 !important; background:#fff5f5;' : '';

                  return `
                    <tr style="${rowStyle}">
                      <td style="font-family:monospace; font-weight:700;">${t.trayId}</td>
                      <td><strong>${t.trayName}</strong></td>
                      <td>${t.department}</td>
                      <td>${t.method}</td>
                      <td style="font-family:monospace;">${t.cycleCount}</td>
                      <td>
                        ${isInf ? '<span class="badge badge-danger" style="font-size:8px;">☣️ INFECTIOUS PROTOCOL</span>' : 'Routine'}
                      </td>
                      <td>
                        <button class="btn btn-primary btn-xs" onclick="document.getElementById('decon-tray').value='${t.trayId}'; alert('Selected tray ${t.trayId}. Complete pre-soak details form to push.');">Complete Decon</button>
                      </td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `;
    }

    // ────────────────────────────────────────────────────────────────────────
    // SCREEN 5 - CLEANING & INSPECTION
    // ────────────────────────────────────────────────────────────────────────
    function renderCssdCleaning(trays, cleaningLogs) {
      var cleanings = trays.filter(x => x.status === 'Cleaning');

      return `
        <div style="display:grid; grid-template-columns: 1fr 2fr; gap:20px;">
          <!-- CLEANING & INSPECTION FORM -->
          <div class="card" style="padding:15px; display:flex; flex-direction:column; gap:12px; height:fit-content;">
            <h3 style="margin:0; font-size:12.5px; font-weight:800; color:var(--primary); border-bottom:1px solid var(--border-color); padding-bottom:6px;">
              🧽 Log Mechanical Wash & Physical Inspection
            </h3>
            <form onsubmit="event.preventDefault(); window._hkCssdSubmitCleaning();" style="display:flex; flex-direction:column; gap:10px; text-align:left;">
              <div>
                <label style="font-size:10px; font-weight:700;">Select Tray *</label>
                <select id="clean-tray" class="form-select" style="font-size:11px;" required>
                  ${cleanings.map(t => `<option value="${t.trayId}">${t.trayName} (${t.trayId})</option>`).join('')}
                </select>
              </div>
              <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
                <div>
                  <label style="font-size:10px; font-weight:700;">Washing Method *</label>
                  <select id="clean-method" class="form-select" style="font-size:11px;" required>
                    <option value="Manual">Manual Scrubbing</option>
                    <option value="Ultrasonic">Ultrasonic Washer</option>
                    <option value="Both">Both Manual & Ultrasonic</option>
                  </select>
                </div>
                <div>
                  <label style="font-size:10px; font-weight:700;">Ultrasonic Machine</label>
                  <input type="text" id="clean-machine" class="form-control" style="font-size:11px;" value="Ultrasonic Washer 02">
                </div>
              </div>
              <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
                <div>
                  <label style="font-size:10px; font-weight:700;">Functionality Check *</label>
                  <select id="clean-func" class="form-select" style="font-size:11px;" required>
                    <option value="Pass">Pass (All joints/locks fluid)</option>
                    <option value="Fail">Fail (Corroded/Damaged tips)</option>
                  </select>
                </div>
                <div>
                  <label style="font-size:10px; font-weight:700;">Tray Completeness *</label>
                  <select id="clean-comp" class="form-select" style="font-size:11px;" required>
                    <option value="Complete">Complete (All pieces present)</option>
                    <option value="Missing">Incomplete (Pieces missing against manifest)</option>
                  </select>
                </div>
              </div>
              <div>
                <label style="font-size:10px; font-weight:700;">Missing Pieces Count / Inspection failure details</label>
                <input type="text" id="clean-fail-details" class="form-control" style="font-size:11px;" placeholder="Remarks...">
              </div>
              <button type="submit" class="btn btn-primary btn-sm">Record Cleaning & Inspection</button>
            </form>
          </div>

          <!-- CLEANING & INSPECTION QUEUE -->
          <div class="card" style="padding:15px; text-align:left;">
            <h3 style="margin:0 0 10px 0; font-size:12.5px; font-weight:800; color:var(--primary); border-bottom:1px solid var(--border-color); padding-bottom:6px;">
              🧽 Cleaning & Inspection Queue (Assembly Table)
            </h3>
            <table class="custom-table" style="font-size:11px;">
              <thead>
                <tr>
                  <th>Tray ID</th>
                  <th>Set Name</th>
                  <th>Instruments Count</th>
                  <th>Method</th>
                  <th>Cycles</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                ${cleanings.length === 0 ? `
                  <tr><td colspan="6" style="text-align:center; padding:15px; color:var(--text-muted);">No trays waiting for inspection.</td></tr>
                ` : cleanings.map(t => `
                  <tr>
                    <td style="font-family:monospace; font-weight:700;">${t.trayId}</td>
                    <td><strong>${t.trayName}</strong></td>
                    <td style="font-family:monospace; font-weight:700;">${t.instruments.reduce((a,c)=>a+c.count, 0)} pieces</td>
                    <td>${t.method}</td>
                    <td style="font-family:monospace;">${t.cycleCount}</td>
                    <td><span class="badge badge-warning" style="font-size:8.5px;">Awaiting Insp</span></td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `;
    }

    // ────────────────────────────────────────────────────────────────────────
    // SCREEN 6 - PACKING
    // ────────────────────────────────────────────────────────────────────────
    function renderCssdPacking(trays, packingLogs) {
      var packs = trays.filter(x => x.status === 'Packing');

      return `
        <div style="display:grid; grid-template-columns: 1fr 2fr; gap:20px;">
          <!-- PACKING FORM -->
          <div class="card" style="padding:15px; display:flex; flex-direction:column; gap:12px; height:fit-content;">
            <h3 style="margin:0; font-size:12.5px; font-weight:800; color:var(--primary); border-bottom:1px solid var(--border-color); padding-bottom:6px;">
              📦 Pack & Pouch Wrapping Details
            </h3>
            <form onsubmit="event.preventDefault(); window._hkCssdSubmitPacking();" style="display:flex; flex-direction:column; gap:10px; text-align:left;">
              <div>
                <label style="font-size:10px; font-weight:700;">Tray ID *</label>
                <select id="pack-tray" class="form-select" style="font-size:11px;" required>
                  ${packs.map(t => `<option value="${t.trayId}">${t.trayName} (${t.trayId})</option>`).join('')}
                </select>
              </div>
              <div>
                <label style="font-size:10px; font-weight:700;">Pack wrap Type *</label>
                <select id="pack-wrap" class="form-select" style="font-size:11px;" required>
                  <option value="Rigid Container">Rigid Sterilization Container</option>
                  <option value="Linen Wrap">Double Linen Wrap</option>
                  <option value="Crepe Paper">Crepe Sterilization Paper</option>
                  <option value="Pouch">Tyvek/Pastic Pouch Wrapper</option>
                </select>
              </div>
              <div>
                <label style="font-size:10px; font-weight:700; color:#dc2626;">Chemical Indicator placed inside pack? (MANDATORY GATE) *</label>
                <select id="pack-ci" class="form-select" style="font-size:11px; border:1px solid #dc2626;" required>
                  <option value="">-- Choose Confirmation --</option>
                  <option value="Yes">Yes, Chemical Indicator Placed ✓</option>
                  <option value="No">No (Will block packaging)</option>
                </select>
              </div>
              <div>
                <label style="font-size:10px; font-weight:700;">Label Details Placeholder</label>
                <input type="text" id="pack-label" class="form-control" style="font-size:11px;" value="Use-By Date: Auto-Calculated on Release">
              </div>
              <button type="submit" class="btn btn-primary btn-sm">Complete Packaging & Queue for Sterilization</button>
            </form>
          </div>

          <!-- PACKING QUEUE -->
          <div class="card" style="padding:15px; text-align:left;">
            <h3 style="margin:0 0 10px 0; font-size:12.5px; font-weight:800; color:var(--primary); border-bottom:1px solid var(--border-color); padding-bottom:6px;">
              📦 Packing Queue sorted by Urgency
            </h3>
            <table class="custom-table" style="font-size:11px;">
              <thead>
                <tr>
                  <th>Tray ID</th>
                  <th>Set Name</th>
                  <th>Department</th>
                  <th>Sterilization Method</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                ${packs.length === 0 ? `
                  <tr><td colspan="5" style="text-align:center; padding:15px; color:var(--text-muted);">No trays awaiting packaging wrap.</td></tr>
                ` : packs.map(t => `
                  <tr>
                    <td style="font-family:monospace; font-weight:700;">${t.trayId}</td>
                    <td><strong>${t.trayName}</strong></td>
                    <td>${t.department}</td>
                    <td><strong>${t.method}</strong></td>
                    <td><span class="badge badge-warning" style="font-size:8.5px;">Awaiting Wrap</span></td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `;
    }

    // ────────────────────────────────────────────────────────────────────────
    // SCREEN 7 - STERILIZATION
    // ────────────────────────────────────────────────────────────────────────
    function renderCssdSterilization(trays, cycles) {
      var waitingTrays = trays.filter(x => x.status === 'Sterilization');
      var pendingCycles = cycles.filter(c => c.releaseStatus === 'Pending Release');

      return `
        <div style="display:flex; flex-direction:column; gap:20px;">
          <div style="display:grid; grid-template-columns: 1.2fr 2fr; gap:20px;">
            <!-- LOAD NEW CYCLE FORM -->
            <div class="card" style="padding:15px; display:flex; flex-direction:column; gap:12px; height:fit-content; text-align:left;">
              <h3 style="margin:0; font-size:12.5px; font-weight:800; color:var(--primary); border-bottom:1px solid var(--border-color); padding-bottom:6px;">
                🔥 Load & Start Sterilizer Cycle
              </h3>
              <form onsubmit="event.preventDefault(); window._hkCssdStartCycle();" style="display:flex; flex-direction:column; gap:10px;">
                <div>
                  <label style="font-size:10px; font-weight:700;">Sterilization Method *</label>
                  <select id="cycle-method" class="form-select" style="font-size:11px;" required onchange="window._hkCssdCycleMethodChange(this.value)">
                    <option value="Steam">Steam Autoclave (45-90m, 134°C, 2.1 bar)</option>
                    <option value="EO">Ethylene Oxide (EO) (12-16 hrs, 55°C)</option>
                    <option value="Plasma">Hydrogen Peroxide Plasma (60-75m, 50°C)</option>
                  </select>
                </div>
                <div>
                  <label style="font-size:10px; font-weight:700;">Machine ID *</label>
                  <select id="cycle-machine" class="form-select" style="font-size:11px;" required>
                    <option value="Steam Autoclave 01">Steam Autoclave 01</option>
                    <option value="Plasma Sterilizer 02">Plasma Sterilizer 02</option>
                    <option value="EO Chamber 03">EO Chamber 03</option>
                  </select>
                </div>
                <div>
                  <label style="font-size:10px; font-weight:700;">Load Contents (Selected Trays) *</label>
                  <select id="cycle-load" class="form-select" style="font-size:11px;" multiple style="height:80px;" required>
                    ${waitingTrays.map(t => `<option value="${t.trayId}">${t.trayName} (${t.trayId} - ${t.method})</option>`).join('')}
                  </select>
                  <span style="font-size:9.5px; color:var(--text-muted);">Hold Ctrl/Cmd to select multiple trays.</span>
                </div>
                <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px;">
                  <div>
                    <label style="font-size:10px; font-weight:700;">Bowie-Dick Test (Steam Only)</label>
                    <select id="cycle-bd" class="form-select" style="font-size:11px;">
                      <option value="Pass">Pass</option>
                      <option value="Fail">Fail</option>
                      <option value="N/A">Not Steam Cycle</option>
                    </select>
                  </div>
                  <div>
                    <label style="font-size:10px; font-weight:700;">Biological Indicator (BI) Placed</label>
                    <select id="cycle-bi" class="form-select" style="font-size:11px;">
                      <option value="Yes">Yes, BI Placed ✓</option>
                      <option value="No">No</option>
                    </select>
                  </div>
                </div>
                <button type="submit" class="btn btn-primary btn-sm">Start Sterilization Cycle</button>
              </form>
            </div>

            <!-- CYCLE VERIFICATION & RELEASE PANELS -->
            <div class="card" style="padding:15px; text-align:left;">
              <h3 style="margin:0 0 12px 0; font-size:12.5px; font-weight:800; color:var(--primary); border-bottom:1px solid var(--border-color); padding-bottom:6px;">
                🔑 Active Cycle Release Gate (Supervisor Sign-off)
              </h3>
              <div style="display:flex; flex-direction:column; gap:12px;">
                ${pendingCycles.length === 0 ? `
                  <div style="padding:15px; text-align:center; color:var(--text-muted); font-size:11px;">No batches currently running or awaiting release validation.</div>
                ` : pendingCycles.map(c => `
                  <div style="border:1px solid var(--border-color); padding:12px; border-radius:8px; display:flex; flex-direction:column; gap:8px;">
                    <div style="display:flex; justify-content:space-between; align-items:center;">
                      <strong style="font-size:12px;">Cycle ID: ${c.cycleId} (${c.method})</strong>
                      <span class="badge badge-warning" style="font-size:8.5px;">Pending Biological/Chemical Indicators</span>
                    </div>
                    <div style="font-size:11px;">
                      Machine: <strong>${c.machineId}</strong> · Load: <strong>${c.loadContents}</strong>
                      <br>Start Time: ${c.startTime} · Exposure Time: <strong>${c.exposureTime} min</strong>
                    </div>

                    <div style="display:grid; grid-template-columns:1fr 1fr 1.2fr; gap:10px; border-top:1px dashed var(--border-color); padding-top:8px; margin-top:4px;">
                      <div>
                        <label style="font-size:9.5px; font-weight:700;">Chemical Indicator (CI)</label>
                        <select id="ci-res-${c.cycleId}" class="form-select font-select-xs" style="font-size:10.5px;">
                          <option value="Pass">Pass (CI turned black)</option>
                          <option value="Fail">Fail</option>
                        </select>
                      </div>
                      <div>
                        <label style="font-size:9.5px; font-weight:700; color:#dc2626;">Biological Indicator (BI) *</label>
                        <select id="bi-res-${c.cycleId}" class="form-select font-select-xs" style="font-size:10.5px; border:1px solid #dc2626;">
                          <option value="Pending">Pending Incubation</option>
                          <option value="Pass">Pass (No growth)</option>
                          <option value="Fail">Fail (Incubation growth - recall!)</option>
                        </select>
                      </div>
                      <div style="display:flex; align-items:flex-end;">
                        <button class="btn btn-success btn-xs" style="padding:4px 10px; font-weight:700;" onclick="window._hkCssdReleaseCycle('${c.cycleId}')">Supervisor Release</button>
                      </div>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
          </div>

          <!-- HISTORICAL CYCLE RECORDS (PRINTABLE FOR AUDITS) -->
          <div class="card" style="padding:15px; text-align:left;">
            <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid var(--border-color); padding-bottom:6px; margin-bottom:10px;">
              <h3 style="margin:0; font-size:12.5px; font-weight:800; color:var(--primary);">📋 Historical Cycle Records (Printable NABH Audit Trail)</h3>
              <button class="btn btn-secondary btn-sm" onclick="window.print();">Print Cycle Records</button>
            </div>
            <table class="custom-table" style="font-size:11px;">
              <thead>
                <tr>
                  <th>Cycle ID</th>
                  <th>Machine</th>
                  <th>Method</th>
                  <th>Trays Loaded</th>
                  <th>Times</th>
                  <th>Temp/Press</th>
                  <th>CI Result</th>
                  <th>BI Result</th>
                  <th>Bowie-Dick</th>
                  <th>Operator</th>
                  <th>Released By</th>
                </tr>
              </thead>
              <tbody>
                ${cycles.filter(c => c.releaseStatus === 'Released' || c.releaseStatus === 'Quarantined').map(c => {
                  var biColor = c.biResult === 'Pass' ? '#065f46' : '#b91c1c';
                  return `
                    <tr style="${c.releaseStatus === 'Quarantined' ? 'background:#fff5f5; border-left:3px solid #dc2626;' : ''}">
                      <td style="font-family:monospace; font-weight:700;">${c.cycleId}</td>
                      <td>${c.machineId}</td>
                      <td><strong>${c.method}</strong></td>
                      <td>${c.loadContents}</td>
                      <td>${c.startTime} - ${c.endTime}</td>
                      <td style="font-family:monospace;">${c.temp}°C / ${c.pressure} bar</td>
                      <td><span style="color:#065f46; font-weight:700;">${c.ciResult}</span></td>
                      <td><span style="color:${biColor}; font-weight:700;">${c.biResult}</span></td>
                      <td>${c.bowieDick}</td>
                      <td>${c.operator}</td>
                      <td><strong>${c.releasedBy || '—'}</strong></td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `;
    }

    // ────────────────────────────────────────────────────────────────────────
    // SCREEN 8 - STERILE STORAGE
    // ────────────────────────────────────────────────────────────────────────
    function renderCssdStorage(trays) {
      var storage = trays.filter(x => x.status === 'Sterile Storage' || x.status === 'Available');

      return `
        <div class="card" style="padding:15px; text-align:left;">
          <h3 style="margin:0 0 10px 0; font-size:12.5px; font-weight:800; color:var(--primary); border-bottom:1px solid var(--border-color); padding-bottom:6px;">
            🏬 Sterile Storage Inventory Racks (FIFO Sorted by Sterilized Date)
          </h3>
          <table class="custom-table" style="font-size:11px;">
            <thead>
              <tr>
                <th>Tray ID</th>
                <th>Set Name</th>
                <th>Method</th>
                <th>Last Sterilized</th>
                <th>Sterility Valid Until</th>
                <th>Rack Location</th>
                <th>FIFO Status</th>
                <th>Issue Gate</th>
              </tr>
            </thead>
            <tbody>
              ${storage.map((t, idx) => {
                var isExpired = t.status === 'Expired';
                
                // Expiry colors
                var expiryColor = '#166534'; // green (>48h)
                var expText = 'Sterile - Safe';
                
                if (t.validUntil && t.validUntil !== '—') {
                  var diff = new Date(t.validUntil.replace(' · ', ' ')).getTime() - Date.now();
                  if (diff <= 0) {
                    expiryColor = '#dc2626'; // red expired
                    expText = 'EXPIRED';
                  } else if (diff < 86400000) {
                    expiryColor = '#d97706'; // amber (<24h)
                    expText = 'Expiring Soon (<24h)';
                  }
                }

                var fifoLabel = idx === 0 ? '<span class="badge badge-success" style="font-size:8px;">FIFO NEXT IN LINE</span>' : '<span style="color:var(--text-muted);">Queue</span>';

                return `
                  <tr style="${isExpired ? 'background:#fff5f5;' : ''}">
                    <td style="font-family:monospace; font-weight:700;">${t.trayId}</td>
                    <td><strong>${t.trayName}</strong></td>
                    <td>${t.method}</td>
                    <td>${t.lastSterilized}</td>
                    <td style="font-family:monospace; font-weight:700; color:${expiryColor};">
                      ${t.validUntil} (${expText})
                    </td>
                    <td><strong>${t.rackLocation || 'Rack A - Shelf 1'}</strong></td>
                    <td>${fifoLabel}</td>
                    <td>
                      ${isExpired ? `
                        <button class="btn btn-danger btn-xs" onclick="window._hkCssdRecycleExpired('${t.trayId}')">Recycle (Decon)</button>
                      ` : `
                        <button class="btn btn-primary btn-xs" onclick="window._hkSetCssdSubTab('issue'); alert('Tray ${t.trayId} selected. Open issue form on that screen.');">Request Issue</button>
                      `}
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      `;
    }

    // ────────────────────────────────────────────────────────────────────────
    // SCREEN 9 - ISSUE TO DEPARTMENT
    // ────────────────────────────────────────────────────────────────────────
    function renderCssdIssue(trays, issues) {
      // FIFO sorted available sterile storage trays
      var availableTrays = trays.filter(x => x.status === 'Available' || x.status === 'Sterile Storage');
      var depts = ["OT Complex", "ICU Ward", "Maternity Ward", "Emergency"];

      return `
        <div style="display:grid; grid-template-columns: 1fr 2fr; gap:20px;">
          <!-- ISSUE FORM -->
          <div class="card" style="padding:15px; display:flex; flex-direction:column; gap:12px; height:fit-content; text-align:left;">
            <h3 style="margin:0; font-size:12.5px; font-weight:800; color:var(--primary); border-bottom:1px solid var(--border-color); padding-bottom:6px;">
              📤 Issue Sterile Items to Department (FIFO Enforced)
            </h3>
            <form onsubmit="event.preventDefault(); window._hkCssdSubmitIssue();" style="display:flex; flex-direction:column; gap:10px;">
              <div>
                <label style="font-size:10px; font-weight:700;">Select Sterile Tray *</label>
                <select id="issue-cs-tray" class="form-select" style="font-size:11px;" required>
                  ${availableTrays.map(t => `<option value="${t.trayId}">${t.trayName} (${t.trayId} - Expiry: ${t.validUntil})</option>`).join('')}
                </select>
                <span style="font-size:9.5px; color:#166534; font-weight:700;">✓ FIFO Enforced: Oldest sterile tray automatically loaded first.</span>
              </div>
              <div>
                <label style="font-size:10px; font-weight:700;">Issue To (Department) *</label>
                <select id="issue-cs-dept" class="form-select" style="font-size:11px;" required>
                  ${depts.map(d => `<option value="${d}">${d}</option>`).join('')}
                </select>
              </div>
              <div>
                <label style="font-size:10px; font-weight:700;">Requested By Staff Name *</label>
                <input type="text" id="issue-cs-staff" class="form-control" style="font-size:11px;" placeholder="Sister Mercy" required>
              </div>
              <div>
                <label style="font-size:10px; font-weight:700;">Remarks</label>
                <textarea id="issue-cs-remarks" class="form-control" style="font-size:11px; height:40px;"></textarea>
              </div>
              <button type="submit" class="btn btn-primary btn-sm">Confirm Issue</button>
            </form>
          </div>

          <!-- ISSUED TODAY -->
          <div class="card" style="padding:15px; text-align:left;">
            <h3 style="margin:0 0 10px 0; font-size:12.5px; font-weight:800; color:var(--primary); border-bottom:1px solid var(--border-color); padding-bottom:6px;">
              📤 Issued Trays & Handover Acknowledgment
            </h3>
            <table class="custom-table" style="font-size:11px;">
              <thead>
                <tr>
                  <th>Issue ID</th>
                  <th>Date & Time</th>
                  <th>Issued To</th>
                  <th>Tray Set ID</th>
                  <th>Batch Ref</th>
                  <th>Issued By</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                ${issues.map(i => {
                  var elapsedMs = Date.now() - new Date("2026-07-04T15:00:00Z").getTime();
                  var showWarning = i.status === 'Pending Acknowledgment' && (elapsedMs / 60000 > 30);
                  var warnText = showWarning ? '<br><span style="color:#b91c1c; font-weight:700; font-size:9px;">⚠️ Handover Overdue (>30m)</span>' : '';
                  var actionBtn = i.status === 'Pending Acknowledgment' ? `<button class="btn btn-success btn-xs" style="padding:2px 6px;" onclick="window._hkCssdAckIssue('${i.issueId}')">Confirm Handover</button>` : '<span style="color:#065f46; font-weight:700;">Acknowledged ✓</span>';

                  return `
                    <tr style="${showWarning ? 'background:#fff5f5;' : ''}">
                      <td style="font-family:monospace; font-weight:700;">${i.issueId}</td>
                      <td>${i.date}</td>
                      <td><strong>${i.department}</strong></td>
                      <td style="font-family:monospace;">${i.trayId}</td>
                      <td style="font-family:monospace;">${i.batchRef}</td>
                      <td>${i.issuedBy}</td>
                      <td>
                        <span class="badge ${i.status === 'Acknowledged' ? 'badge-success' : 'badge-primary'}" style="font-size:8.5px;">${i.status}</span>
                        ${warnText}
                      </td>
                      <td>${actionBtn}</td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `;
    }

    // ────────────────────────────────────────────────────────────────────────
    // SCREEN 10 - INSTRUMENT RETURN
    // ────────────────────────────────────────────────────────────────────────
    function renderCssdReturn(trays, returns) {
      var issuedTrays = trays.filter(x => x.status === 'Issued');
      var depts = ["OT Complex", "ICU Ward", "Maternity Ward", "Emergency"];

      return `
        <div style="display:grid; grid-template-columns: 1fr 2fr; gap:20px;">
          <!-- RETURN FORM -->
          <div class="card" style="padding:15px; display:flex; flex-direction:column; gap:12px; height:fit-content; text-align:left;">
            <h3 style="margin:0; font-size:12.5px; font-weight:800; color:var(--primary); border-bottom:1px solid var(--border-color); padding-bottom:6px;">
              🔄 Record Used Instruments Return
            </h3>
            <form onsubmit="event.preventDefault(); window._hkCssdSubmitReturn();" style="display:flex; flex-direction:column; gap:10px;">
              <div>
                <label style="font-size:10px; font-weight:700;">Select Returned Tray *</label>
                <select id="ret-cs-tray" class="form-select" style="font-size:11px;" required>
                  ${issuedTrays.map(t => `<option value="${t.trayId}">${t.trayName} (${t.trayId} - ${t.department})</option>`).join('')}
                </select>
              </div>
              <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px;">
                <div>
                  <label style="font-size:10px; font-weight:700;">Returned From *</label>
                  <select id="ret-cs-dept" class="form-select" style="font-size:11px;" required>
                    ${depts.map(d => `<option value="${d}">${d}</option>`).join('')}
                  </select>
                </div>
                <div>
                  <label style="font-size:10px; font-weight:700;">Pieces Returned *</label>
                  <input type="number" id="ret-cs-pieces" class="form-control" style="font-size:11px;" value="10" required>
                </div>
              </div>
              <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px;">
                <div>
                  <label style="font-size:10px; font-weight:700; color:#dc2626;">Pieces Missing? *</label>
                  <select id="ret-cs-missing" class="form-select" style="font-size:11px; border:1px solid #dc2626;" required>
                    <option value="0">No, all pieces present</option>
                    <option value="1">Yes, 1 piece missing</option>
                    <option value="2">Yes, 2 pieces missing</option>
                  </select>
                </div>
                <div>
                  <label style="font-size:10px; font-weight:700;">Condition *</label>
                  <select id="ret-cs-condition" class="form-select" style="font-size:11px;" required>
                    <option value="Good">Good / Standard</option>
                    <option value="Damaged">Damaged (Forces repair request)</option>
                  </select>
                </div>
              </div>
              <div>
                <label style="font-size:10px; font-weight:700;">Returned By Staff Name *</label>
                <input type="text" id="ret-cs-staff" class="form-control" style="font-size:11px;" placeholder="Sister Mini" required>
              </div>
              <button type="submit" class="btn btn-primary btn-sm">Record Return</button>
            </form>
          </div>

          <!-- OVERDUE RETURNS & RETURN LOGS -->
          <div class="card" style="padding:15px; text-align:left;">
            <h3 style="margin:0 0 10px 0; font-size:12.5px; font-weight:800; color:var(--primary); border-bottom:1px solid var(--border-color); padding-bottom:6px;">
              ⏱️ Overdue Department Returns & Logs
            </h3>
            <table class="custom-table" style="font-size:11px;">
              <thead>
                <tr>
                  <th>Return ID</th>
                  <th>Date & Time</th>
                  <th>Returned From</th>
                  <th>Tray Set ID</th>
                  <th>Pieces</th>
                  <th>Missing</th>
                  <th>Condition</th>
                  <th>Audit Result</th>
                </tr>
              </thead>
              <tbody>
                ${returns.map(r => {
                  var isInc = r.piecesMissing > 0;
                  var rowStyle = isInc ? 'background:#fff5f5; border-left:3px solid #dc2626; color:#991b1b; font-weight:700;' : '';

                  return `
                    <tr style="${rowStyle}">
                      <td style="font-family:monospace; font-weight:700;">${r.returnId}</td>
                      <td>${r.date}</td>
                      <td><strong>${r.returnedFrom}</strong></td>
                      <td style="font-family:monospace;">${r.trayId}</td>
                      <td style="font-family:monospace; font-weight:700;">${r.piecesReturned}</td>
                      <td style="font-family:monospace; font-weight:700;">${r.piecesMissing}</td>
                      <td>${r.condition}</td>
                      <td>
                        ${isInc ? '<span style="color:#dc2626; font-weight:800;">⚠️ INCOMPLETE - HELD</span>' : 'Processed ✓'}
                      </td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `;
    }

    // ────────────────────────────────────────────────────────────────────────
    // SCREEN 11 - QUARANTINE MANAGEMENT
    // ────────────────────────────────────────────────────────────────────────
    function renderCssdQuarantine(quarantines) {
      return `
        <div class="card" style="padding:15px; text-align:left;">
          <div style="border-bottom:1px solid var(--border-color); padding-bottom:6px; margin-bottom:12px;">
            <h3 style="margin:0; font-size:12.5px; font-weight:800; color:var(--primary);">⚠️ CSSD Active Quarantine Desk (Issue Hard Block Enforced)</h3>
            <span style="font-size:9.5px; color:#dc2626; font-weight:700;">⚠️ HARD BLOCK: Quarantined trays cannot be issued under any circumstance.</span>
          </div>

          <table class="custom-table" style="font-size:11px;">
            <thead>
              <tr>
                <th>Tray ID</th>
                <th>Quarantined Date</th>
                <th>Quarantined By</th>
                <th>Reason for Quarantine</th>
                <th>Investigation Notes</th>
                <th>Owner</th>
                <th>Supervisor Actions</th>
              </tr>
            </thead>
            <tbody>
              ${quarantines.filter(q => q.status === 'Active').map(q => `
                <tr style="background:#fff5f5; border-left:3px solid #dc2626;">
                  <td style="font-family:monospace; font-weight:700;">${q.trayId}</td>
                  <td>${q.date}</td>
                  <td><strong>${q.quarantinedBy}</strong></td>
                  <td style="color:#b91c1c; font-weight:700;">${q.reason}</td>
                  <td>${q.notes}</td>
                  <td>${q.owner}</td>
                  <td>
                    <div style="display:flex; gap:4px;">
                      <button class="btn btn-success btn-xs" onclick="window._hkCssdResolveQuarantine('${q.trayId}', 'Return to Cycle')">Return to Cycle</button>
                      <button class="btn btn-danger btn-xs" onclick="window._hkCssdResolveQuarantine('${q.trayId}', 'Condemn')">Condemn</button>
                    </div>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;
    }

    // ────────────────────────────────────────────────────────────────────────
    // SCREEN 12 - REPORTS
    // ────────────────────────────────────────────────────────────────────────
    function renderCssdReports(trays, cycles, quarantines) {
      return `
        <div style="display:flex; flex-direction:column; gap:20px;">
          <!-- FILTERS -->
          <div class="card" style="padding:15px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px; text-align:left;">
            <div>
              <h3 style="margin:0; font-size:12.5px; font-weight:800; color:var(--primary);">📈 Saronil CSSD Analytics Reports</h3>
              <span style="font-size:10px; color:var(--text-muted);">NABH & NABL Statutory Compliance Audits</span>
            </div>
            
            <div style="display:flex; align-items:center; gap:8px;">
              <span style="font-size:11px; font-weight:700;">Date Range:</span>
              <input type="date" class="form-control" style="font-size:11px; width:130px;" value="${new Date().toISOString().slice(0, 10)}">
              <input type="date" class="form-control" style="font-size:11px; width:130px;" value="${new Date().toISOString().slice(0, 10)}">
              <button class="btn btn-secondary btn-sm" onclick="window._hkCssdExportReport('NABH Audit')">Export CSV</button>
            </div>
          </div>

          <!-- REPORTS GRID -->
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:20px; text-align:left;">
            <!-- REPORT 1 -->
            <div class="card" style="padding:15px;">
              <h4 style="margin:0 0 10px 0; font-size:12px; font-weight:800; border-bottom:1px solid var(--border-color); padding-bottom:6px;">Daily CSSD Processing Report</h4>
              <table class="custom-table" style="font-size:11px;">
                <tbody>
                  <tr><td>Trays Received</td><td style="font-family:monospace; font-weight:700; text-align:right;">18 trays</td></tr>
                  <tr><td>Decontaminated Trays</td><td style="font-family:monospace; font-weight:700; text-align:right;">14 trays</td></tr>
                  <tr><td>Sterility Cycles Executed</td><td style="font-family:monospace; font-weight:700; text-align:right;">3 runs</td></tr>
                  <tr><td>Sterile Trays Issued</td><td style="font-family:monospace; font-weight:700; text-align:right;">12 trays</td></tr>
                  <tr><td>Quarantined Instruments</td><td style="font-family:monospace; font-weight:700; text-align:right; color:#b91c1c;">1 trays</td></tr>
                </tbody>
              </table>
            </div>

            <!-- REPORT 2 -->
            <div class="card" style="padding:15px;">
              <h4 style="margin:0 0 10px 0; font-size:12px; font-weight:800; border-bottom:1px solid var(--border-color); padding-bottom:6px;">Sterility Expiry Report (7 Days Window)</h4>
              <table class="custom-table" style="font-size:11px;">
                <thead>
                  <tr>
                    <th>Tray ID</th>
                    <th>Set Name</th>
                    <th>Expiry Time</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td>TRY-ORTH-001</td><td>Ortho Surgical Kit A</td><td style="font-family:monospace;">2026-07-09</td><td><span class="badge badge-success" style="font-size:8px;">Valid</span></td></tr>
                  <tr><td>TRY-GENS-002</td><td>General Surgery Pack</td><td style="font-family:monospace;">2026-07-02</td><td><span class="badge badge-danger" style="font-size:8px;">Expired</span></td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      `;
    }

    // ────────────────────────────────────────────────────────────────────────
    // SCREEN 13 - AUDIT LOG
    // ────────────────────────────────────────────────────────────────────────
    function renderCssdAudit(auditLogs) {
      return `
        <div class="card" style="padding:15px; text-align:left;">
          <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid var(--border-color); padding-bottom:6px; margin-bottom:12px;">
            <h3 style="margin:0; font-size:12.5px; font-weight:800; color:var(--primary);">📝 CSSD Sterilization Cycle Audit Log</h3>
            <span style="font-size:10px; color:var(--text-muted);">Audit Trail Logs (System Events Marked as 'System')</span>
          </div>

          <div style="max-height:500px; overflow-y:auto;">
            <table class="custom-table" style="font-size:11px;">
              <thead>
                <tr>
                  <th>Transaction ID</th>
                  <th>Timestamp</th>
                  <th>User / Operator</th>
                  <th>Role</th>
                  <th>Action</th>
                  <th>Tray / Instrument Code</th>
                  <th>Remarks</th>
                </tr>
              </thead>
              <tbody>
                ${auditLogs.map(a => `
                  <tr>
                    <td style="font-family:monospace; font-weight:700;">${a.txId}</td>
                    <td>${a.timestamp}</td>
                    <td><strong>${a.user}</strong></td>
                    <td>${a.role}</td>
                    <td>
                      <span class="badge ${a.user === 'System' ? 'badge-secondary' : 'badge-primary'}" style="font-size:8.5px;">${a.action}</span>
                    </td>
                    <td>${a.code}</td>
                    <td>${a.remarks}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `;
    }
  }

  function syncLegacyBmwStock() {
    if (!window.state || !window.state.bmwBags) return;
    localStorage.setItem('saronil_bmw_bags', JSON.stringify(window.state.bmwBags));
    localStorage.setItem('saronil_bmw_manifests', JSON.stringify(window.state.bmwManifests || []));
  }

  function getBmwCategoryBadge(category) {
    if (category === 'Yellow') {
      return `<span style="background:#fef08a; border:1px solid #eab308; color:#854d0e; padding:2px 6px; border-radius:4px; font-weight:bold; font-size:10px;">🟡 Yellow (Cat 1)</span>`;
    } else if (category === 'Red') {
      return `<span style="background:#fee2e2; border:1px solid #f87171; color:#991b1b; padding:2px 6px; border-radius:4px; font-weight:bold; font-size:10px;">🔴 Red (Cat 2)</span>`;
    } else if (category === 'White') {
      return `<span style="background:#f8fafc; border:1px solid #cbd5e1; color:#334155; padding:2px 6px; border-radius:4px; font-weight:bold; font-size:10px;">⚪ White (Cat 3)</span>`;
    } else if (category === 'Blue') {
      return `<span style="background:#dbeafe; border:1px solid #60a5fa; color:#1e40af; padding:2px 6px; border-radius:4px; font-weight:bold; font-size:10px;">🔵 Blue (Cat 4)</span>`;
    } else {
      return `<span style="background:#f1f5f9; border:1px solid #94a3b8; color:#1e293b; padding:2px 6px; border-radius:4px; font-weight:bold; font-size:10px;">⚫ Black (General)</span>`;
    }
  }

  function renderBmwWorkspace() {
    syncLegacyBmwStock();
    var bags = window.state.bmwBags || [];
    var logs = window.state.bmwLogs || [];
    var manifests = window.state.bmwManifests || [];
    var confirmations = window.state.bmwConfirmations || [];
    var nonCompliances = window.state.bmwNonCompliances || [];
    var refrigerators = window.state.bmwRefrigerators || [];
    var auditLogs = window.state.bmwAuditLogs || [];

    var bmwTabs = [
      { id: 'dashboard', label: '📊 Dashboard' },
      { id: 'generation', label: '➕ Log Waste' },
      { id: 'collection', label: '📥 Collect' },
      { id: 'tsa', label: '🏬 TSA Area' },
      { id: 'vendor', label: '🚚 Vendor Pickup' },
      { id: 'disposal', label: '🔒 Disposal' },
      { id: 'register', label: '📋 Register' },
      { id: 'noncompliance', label: '⚠️ Alert Desk' },
      { id: 'reports', label: '📈 Reports' },
      { id: 'audit', label: '📝 Audit' }
    ];

    // Check for TSA 48-hour limit breach (cleared when user acknowledges)
    var _tsaRawBreach = bags.some(b => b.status === 'TSA' && (Date.now() - new Date(b.collectedAt.replace(' · ', ' ')).getTime()) > 48 * 3600000);
    var hasTsaBreach = _tsaRawBreach && !_bmwTsaBreachAcknowledged;

    return `
      <div style="display:flex; flex-direction:column; gap:20px; text-align:left; font-family:'Inter',sans-serif; width:100%;">
        <!-- TSA 48-HOUR CRITICAL REGULATORY BREACH FULL-SCREEN ALERT -->
        ${hasTsaBreach ? `
          <div style="background:#dc2626; color:white; border: 4px solid #b91c1c; padding:20px; border-radius:12px; font-weight:bold; font-size:15px; display:flex; flex-direction:column; gap:10px; animation: pulse 2s infinite;">
            <div style="font-size:20px;">🚨 CRITICAL STATUTORY BREACH: TSA STORAGE EXCEEDED 48 HOURS!</div>
            <div>One or more biomedical waste containers have been stored at the TSA for more than 48 hours. This is a direct violation of the CPCB Biomedical Waste Management Rules 2016. A non-compliance event has been auto-logged, and the Hospital Infection Control Nurse and Housekeeping Manager have been notified.</div>
            <div style="display:flex; gap:10px; margin-top:8px;">
              <button class="btn btn-secondary btn-sm" style="color:#b91c1c; background:white; border:none;" onclick="window._hkBmwResolveTSABreach();">Acknowledge & Clear Alert</button>
            </div>
          </div>
        ` : ''}

        <div class="card-header" style="background:#f8fafc; border: 1px solid var(--border-color); border-radius:8px; padding: 12px 15px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">
          <h2 style="margin:0; font-size:16px; font-weight:900; color:var(--primary);">☣️ Biomedical Waste Management Control</h2>
          <div style="display:flex; align-items:center; gap:8px;">
            <button class="btn btn-secondary btn-sm" style="background:#1d4ed8; color:#fff; padding:4px 10px; font-size:11px; font-weight:700; border:none; border-radius:4px;" onclick="window.showStockRequestOverlay({dept:'Housekeeping', urgency:'Routine'})">📦 Request Stock</button>
            <span style="font-size:11px; font-weight:700; color:var(--text-muted); background:white; padding:4px 10px; border-radius:6px; border:1px solid var(--border-color);">
              Role: <strong>BMW Supervisor</strong>
            </span>
          </div>
        </div>

        <!-- Scrollable tab navigation -->
        <div style="display:flex; gap:6px; background:#f1f5f9; padding:6px; border-radius:8px; border:1px solid var(--border-color); overflow-x:auto; white-space:nowrap; width:100%; box-sizing:border-box;">
          ${bmwTabs.map(t => `
            <button class="btn ${_activeBmwSubTab === t.id ? 'btn-primary' : 'btn-secondary'}" style="padding:6px 14px; font-size:11px; font-weight:700;" onclick="window._hkSetBmwSubTab('${t.id}')">${t.label}</button>
          `).join('')}
        </div>

        <div class="bmw-viewport">
          ${_activeBmwSubTab === 'dashboard' ? renderBmwDashboard(bags, logs, manifests, nonCompliances) : ''}
          ${_activeBmwSubTab === 'generation' ? renderBmwGeneration(logs) : ''}
          ${_activeBmwSubTab === 'collection' ? renderBmwCollection(bags, logs) : ''}
          ${_activeBmwSubTab === 'tsa' ? renderBmwTsa(bags, refrigerators) : ''}
          ${_activeBmwSubTab === 'vendor' ? renderBmwVendor(bags, manifests) : ''}
          ${_activeBmwSubTab === 'disposal' ? renderBmwDisposal(manifests, confirmations) : ''}
          ${_activeBmwSubTab === 'register' ? renderBmwRegister(bags, manifests) : ''}
          ${_activeBmwSubTab === 'noncompliance' ? renderBmwNonCompliance(nonCompliances) : ''}
          ${_activeBmwSubTab === 'reports' ? renderBmwReports(bags, manifests, nonCompliances) : ''}
          ${_activeBmwSubTab === 'audit' ? renderBmwAudit(auditLogs) : ''}
        </div>
      </div>
    `;

    // ────────────────────────────────────────────────────────────────────────
    // SCREEN 1 - DASHBOARD
    // ────────────────────────────────────────────────────────────────────────
    function renderBmwDashboard(bags, logs, manifests, nonCompliances) {
      var pendingColl = logs.filter(l => l.status === 'Logged').length;
      var atTsa = bags.filter(b => b.status === 'TSA').length;
      var pickups = manifests.filter(m => m.date.includes('2026-07-04') || m.date.includes('today')).length;
      var manifestsRecorded = manifests.length;
      var overdueTsa = bags.filter(b => b.status === 'TSA' && (Date.now() - new Date(b.collectedAt.replace(' · ', ' ')).getTime()) > 48 * 3600000).length;
      var ncFlags = nonCompliances.filter(n => n.status === 'Open').length;

      // Pending collection map
      var pendingQueue = logs.filter(l => l.status === 'Logged').map(l => {
        var elapsedMin = Math.round((Date.now() - new Date(l.date.replace(' · ', ' ')).getTime()) / 60000);
        return {
          dept: l.department,
          category: l.category,
          weight: l.weight,
          markedAt: l.date,
          waitMin: elapsedMin,
          infectious: l.infectious
        };
      });

      // TSA Contents by category
      var tsaBags = bags.filter(b => b.status === 'TSA');
      var cats = ['Yellow', 'Red', 'White', 'Blue', 'Black'];
      var tsaSummary = cats.map(c => {
        var items = tsaBags.filter(b => b.category === c);
        var totalWeight = items.reduce((a, b) => a + b.weight, 0);
        
        var hoursRemaining = 48;
        if (items.length > 0) {
          var oldest = items.reduce((a, b) => new Date(a.collectedAt.replace(' · ', ' ')).getTime() < new Date(b.collectedAt.replace(' · ', ' ')).getTime() ? a : b);
          var elapsedHr = (Date.now() - new Date(oldest.collectedAt.replace(' · ', ' ')).getTime()) / 3600000;
          hoursRemaining = Math.max(0, Math.round(48 - elapsedHr));
        }

        return {
          cat: c,
          weight: totalWeight,
          bags: items.length,
          hoursLeft: hoursRemaining
        };
      });

      return `
        <div style="display:flex; flex-direction:column; gap:20px;">
          <!-- KPI CARDS -->
          <div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)); gap:10px;">
            <div class="card" style="padding:10px; border-left:4px solid #ef4444;">
              <span style="font-size:10px; font-weight:700; color:var(--text-muted); text-transform:uppercase;">Pending Collection</span>
              <div style="font-size:20px; font-weight:900; font-family:monospace; margin-top:4px;">${pendingColl}</div>
            </div>
            <div class="card" style="padding:10px; border-left:4px solid #3b82f6;">
              <span style="font-size:10px; font-weight:700; color:var(--text-muted); text-transform:uppercase;">At TSA Now</span>
              <div style="font-size:20px; font-weight:900; font-family:monospace; margin-top:4px;">${atTsa}</div>
            </div>
            <div class="card" style="padding:10px; border-left:4px solid #10b981;">
              <span style="font-size:10px; font-weight:700; color:var(--text-muted); text-transform:uppercase;">Pickups Today</span>
              <div style="font-size:20px; font-weight:900; font-family:monospace; margin-top:4px;">${pickups}</div>
            </div>
            <div class="card" style="padding:10px; border-left:4px solid #8b5cf6;">
              <span style="font-size:10px; font-weight:700; color:var(--text-muted); text-transform:uppercase;">Manifests Sealed</span>
              <div style="font-size:20px; font-weight:900; font-family:monospace; margin-top:4px;">${manifestsRecorded}</div>
            </div>
            <div class="card" style="padding:10px; border-left:4px solid #ef4444; background:#fef2f2;">
              <span style="font-size:10px; font-weight:700; color:#b91c1c; text-transform:uppercase;">Overdue TSA (>48h)</span>
              <div style="font-size:20px; font-weight:900; font-family:monospace; color:#dc2626; margin-top:4px;">${overdueTsa}</div>
            </div>
            <div class="card" style="padding:10px; border-left:4px solid #f59e0b;">
              <span style="font-size:10px; font-weight:700; color:var(--text-muted); text-transform:uppercase;">Open NC Flags</span>
              <div style="font-size:20px; font-weight:900; font-family:monospace; color:#d97706; margin-top:4px;">${ncFlags}</div>
            </div>
          </div>

          <!-- PENDING COLLECTION MAP -->
          <div class="card" style="padding:15px; text-align:left;">
            <h3 style="margin:0 0 10px 0; font-size:12.5px; font-weight:800; color:var(--primary); border-bottom:1px solid var(--border-color); padding-bottom:6px;">
              ⏳ Pending Department Collections Queue
            </h3>
            <table class="custom-table" style="font-size:11.5px;">
              <thead>
                <tr>
                  <th>Department</th>
                  <th>Category Pending</th>
                  <th>Total Weight</th>
                  <th>Marked At</th>
                  <th>Waiting Time</th>
                  <th>Infectious Flag</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                ${pendingQueue.length === 0 ? `
                  <tr><td colspan="7" style="text-align:center; padding:15px; color:var(--text-muted);">✓ No department collection requests pending.</td></tr>
                ` : pendingQueue.map(q => {
                  var elapsedMin = q.waitMin;
                  var showRed = elapsedMin >= 240; // >4 hours
                  var showAmber = elapsedMin >= 120 && elapsedMin < 240; // >2 hours
                  var waitStyle = showRed ? 'color:#dc2626; font-weight:bold; background:#fee2e2; padding:2px 6px; border-radius:4px;' : (showAmber ? 'color:#d97706; font-weight:bold; background:#fef3c7; padding:2px 6px; border-radius:4px;' : '');

                  return `
                    <tr style="${q.infectious ? 'border:2px solid #dc2626 !important; background:#fff5f5;' : ''}">
                      <td><strong>${q.dept}</strong></td>
                      <td>${getBmwCategoryBadge(q.category)}</td>
                      <td style="font-family:monospace; font-weight:700;">${q.weight} kg</td>
                      <td>${q.markedAt}</td>
                      <td><span style="${waitStyle}">${elapsedMin} mins</span></td>
                      <td>${q.infectious ? '<span class="badge badge-danger" style="font-size:8px;">☣️ INFECTIOUS</span>' : 'Routine'}</td>
                      <td>
                        <button class="btn btn-primary btn-xs" onclick="window._hkSetBmwSubTab('collection')">Collect</button>
                      </td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>

          <div style="display:grid; grid-template-columns: 1.2fr 1fr; gap:20px; text-align:left;">
            <!-- TSA STATUS PANEL -->
            <div class="card" style="padding:15px;">
              <h3 style="margin:0 0 10px 0; font-size:12.5px; font-weight:800; color:var(--primary); border-bottom:1px solid var(--border-color); padding-bottom:6px;">
                🏬 Temporary Storage Area (TSA) Current Contents
              </h3>
              <table class="custom-table" style="font-size:11px;">
                <thead>
                  <tr>
                    <th>Waste Category</th>
                    <th>Current Weight</th>
                    <th>Bag Count</th>
                    <th>Hours Left before 48h Breach</th>
                  </tr>
                </thead>
                <tbody>
                  ${tsaSummary.map(s => {
                    var hoursColor = s.hoursLeft <= 12 ? '#dc2626' : (s.hoursLeft <= 24 ? '#d97706' : '#166534');
                    return `
                      <tr>
                        <td>${getBmwCategoryBadge(s.cat)}</td>
                        <td style="font-family:monospace; font-weight:700;">${s.weight.toFixed(1)} kg</td>
                        <td style="font-family:monospace;">${s.bags} bags</td>
                        <td style="font-family:monospace; font-weight:700; color:${hoursColor};">${s.hoursLeft} hours</td>
                      </tr>
                    `;
                  }).join('')}
                </tbody>
              </table>
            </div>

            <!-- VENDOR PICKUP STATUS -->
            <div class="card" style="padding:15px;">
              <h3 style="margin:0 0 10px 0; font-size:12.5px; font-weight:800; color:var(--primary); border-bottom:1px solid var(--border-color); padding-bottom:6px;">
                🚚 CBWTF Vendor Pickups Today
              </h3>
              <table class="custom-table" style="font-size:11px;">
                <thead>
                  <tr>
                    <th>Vendor Name</th>
                    <th>Vehicle</th>
                    <th>Driver</th>
                    <th>Manifest</th>
                  </tr>
                </thead>
                <tbody>
                  ${manifests.map(m => `
                    <tr>
                      <td><strong>${m.transporter}</strong></td>
                      <td style="font-family:monospace;">${m.vehicle}</td>
                      <td>${m.driver}</td>
                      <td><span class="badge badge-success" style="font-size:9px;">${m.manifestId}</span></td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>

          <!-- BMW Bag Depleted Alert & Requests -->
          <div class="card" style="padding:15px; margin-top:16px; text-align:left; color:var(--text-primary);">
            <h3 style="margin:0 0 10px 0; font-size:12.5px; font-weight:800; color:var(--primary); border-bottom:1px solid var(--border-color); padding-bottom:6px;">
              ⚠️ BMW Bag Depletion Warnings
            </h3>
            <div style="display:flex; flex-direction:column; gap:8px;">
              <div style="font-size:0.75rem; display:flex; justify-content:space-between; align-items:center;">
                <span>Ward GW(M) — BMW Yellow Bag 50L: <strong>3 remaining</strong> <span class="badge badge-warning" style="font-size:8px;">LOW</span></span>
                <button class="btn btn-primary btn-xs" style="padding:2px 6px; font-size:8px;" onclick="window.showStockRequestOverlay({dept:'Housekeeping', urgency:'Urgent', prefillItem:{code:'ITM-HK-BMW-Y', name:'BMW Yellow Bag 50L', qty:50, unit:'bags'}, prefillType:'Consumable'})">Request →</button>
              </div>
              <div style="font-size:0.75rem; display:flex; justify-content:space-between; align-items:center;">
                <span>Ward ICU — Sharps Container 5L: <strong>1 remaining</strong> <span class="badge badge-danger" style="font-size:8px;">LOW</span></span>
                <button class="btn btn-primary btn-xs" style="padding:2px 6px; font-size:8px;" onclick="window.showStockRequestOverlay({dept:'Housekeeping', urgency:'Urgent', prefillItem:{code:'ITM-HK-SHARPS', name:'Sharps Container 5L', qty:10, unit:'containers'}, prefillType:'Consumable'})">Request →</button>
              </div>
            </div>
          </div>

          <!-- My Recent Requests -->
          ${window.renderMyRecentRequestsHTML ? window.renderMyRecentRequestsHTML('Housekeeping') : ''}
        </div>
      `;
    }

    // ────────────────────────────────────────────────────────────────────────
    // SCREEN 2 - WASTE GENERATION LOG
    // ────────────────────────────────────────────────────────────────────────
    function renderBmwGeneration(logs) {
      var depts = ["OT Complex", "ICU Ward", "Maternity Ward", "Emergency Complex", "IPD Wards", "OPD Clinics", "Lab"];
      var categories = ["Yellow", "Red", "White", "Blue", "Black"];

      return `
        <div style="display:grid; grid-template-columns: 1fr 2fr; gap:20px; text-align:left;">
          <!-- GENERATION LOG FORM -->
          <div class="card" style="padding:15px; display:flex; flex-direction:column; gap:12px; height:fit-content;">
            <h3 style="margin:0; font-size:12.5px; font-weight:800; color:var(--primary); border-bottom:1px solid var(--border-color); padding-bottom:6px;">
              ☣️ Log Waste Generation at Department
            </h3>
            <form onsubmit="event.preventDefault(); window._hkBmwSubmitGeneration();" style="display:flex; flex-direction:column; gap:10px;">
              <div>
                <label style="font-size:10px; font-weight:700;">Generating Department *</label>
                <select id="gen-bmw-dept" class="form-select" style="font-size:11px;" required>
                  ${depts.map(d => `<option value="${d}">${d}</option>`).join('')}
                </select>
              </div>
              
              <div style="display:grid; grid-template-columns:1.2fr 1fr; gap:10px;">
                <div>
                  <label style="font-size:10px; font-weight:700;">Waste Category *</label>
                  <select id="gen-bmw-cat" class="form-select" style="font-size:11px;" required>
                    ${categories.map(c => `<option value="${c}">${c}</option>`).join('')}
                  </select>
                </div>
                <div>
                  <label style="font-size:10px; font-weight:700;">Infectious Source? *</label>
                  <select id="gen-bmw-infectious" class="form-select" style="font-size:11px;" required>
                    <option value="No">No</option>
                    <option value="Yes">Yes (Auto Yellow Override)</option>
                  </select>
                </div>
              </div>

              <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
                <div>
                  <label style="font-size:10px; font-weight:700;">Quantity (kg) *</label>
                  <input type="number" step="0.1" id="gen-bmw-qty" class="form-control" style="font-size:11px;" required placeholder="3.5">
                </div>
                <div>
                  <label style="font-size:10px; font-weight:700;">Bag / Container Count *</label>
                  <input type="number" id="gen-bmw-bags" class="form-control" style="font-size:11px;" value="1" required min="1">
                </div>
              </div>

              <div>
                <label style="font-size:10px; font-weight:700;">Source Type *</label>
                <select id="gen-bmw-source" class="form-select" style="font-size:11px;" required>
                  <option value="General Ward">General Ward</option>
                  <option value="OT">OT Room</option>
                  <option value="ICU">ICU complex</option>
                  <option value="Isolation">Isolation Ward</option>
                  <option value="Lab">Lab Area</option>
                </select>
              </div>

              <div>
                <label style="font-size:10px; font-weight:700;">Remarks</label>
                <textarea id="gen-bmw-remarks" class="form-control" style="font-size:11px; height:40px;"></textarea>
              </div>

              <button type="submit" class="btn btn-primary btn-sm">Log Generation & Alert Staff</button>
            </form>
          </div>

          <!-- LOGGED TODAY TABLE -->
          <div class="card" style="padding:15px;">
            <h3 style="margin:0 0 10px 0; font-size:12.5px; font-weight:800; color:var(--primary); border-bottom:1px solid var(--border-color); padding-bottom:6px;">
              📋 Department-wise Waste Generation Logs Today
            </h3>
            <table class="custom-table" style="font-size:11px;">
              <thead>
                <tr>
                  <th>Log ID</th>
                  <th>Date & Time</th>
                  <th>Department</th>
                  <th>Category</th>
                  <th>Weight (kg)</th>
                  <th>Bags</th>
                  <th>Infectious</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                ${logs.map(l => `
                  <tr style="${l.infectious ? 'border:2px solid #dc2626 !important; background:#fff5f5;' : ''}">
                    <td style="font-family:monospace; font-weight:700;">${l.logId}</td>
                    <td>${l.date}</td>
                    <td><strong>${l.department}</strong></td>
                    <td>${getBmwCategoryBadge(l.category)}</td>
                    <td style="font-family:monospace; font-weight:700;">${l.weight} kg</td>
                    <td style="font-family:monospace;">${l.bagCount} bags</td>
                    <td>${l.infectious ? '<span style="color:#dc2626; font-weight:bold;">Yes ☣️</span>' : 'No'}</td>
                    <td><span class="badge ${l.status === 'Logged' ? 'badge-warning' : 'badge-success'}" style="font-size:8px;">${l.status}</span></td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `;
    }

    // ────────────────────────────────────────────────────────────────────────
    // SCREEN 3 - DEPARTMENT COLLECTION
    // ────────────────────────────────────────────────────────────────────────
    function renderBmwCollection(bags, logs) {
      var pendingLogs = logs.filter(l => l.status === 'Logged');

      return `
        <div style="display:grid; grid-template-columns: 1fr 2fr; gap:20px; text-align:left;">
          <!-- COLLECTION FORM -->
          <div class="card" style="padding:15px; display:flex; flex-direction:column; gap:12px; height:fit-content;">
            <h3 style="margin:0; font-size:12.5px; font-weight:800; color:var(--primary); border-bottom:1px solid var(--border-color); padding-bottom:6px;">
              📥 Record Department Waste Pickup Collection
            </h3>
            <form onsubmit="event.preventDefault(); window._hkBmwSubmitCollection();" style="display:flex; flex-direction:column; gap:10px;">
              <div>
                <label style="font-size:10px; font-weight:700;">Select Generation Log Reference *</label>
                <select id="col-bmw-ref" class="form-select" style="font-size:11px;" required onchange="window._hkBmwCollectionRefChange(this.value)">
                  <option value="">-- Choose Log Entry --</option>
                  ${pendingLogs.map(l => `<option value="${l.logId}">${l.logId} - ${l.department} (${l.category} - ${l.weight}kg)</option>`).join('')}
                </select>
              </div>

              <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
                <div>
                  <label style="font-size:10px; font-weight:700;">Bags Collected *</label>
                  <input type="number" id="col-bmw-bags" class="form-control" style="font-size:11px;" value="1" required min="1">
                </div>
                <div>
                  <label style="font-size:10px; font-weight:700;">Weight at Collection (kg) *</label>
                  <input type="number" step="0.1" id="col-bmw-weight" class="form-control" style="font-size:11px;" required>
                </div>
              </div>

              <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
                <div>
                  <label style="font-size:10px; font-weight:700; color:#dc2626;">Double-Bagged Confirmation *</label>
                  <select id="col-bmw-double" class="form-select" style="font-size:11px; border:1px solid #dc2626;" required>
                    <option value="">-- Confirm --</option>
                    <option value="Yes">Yes, Double-Bagged & Labeled ✓</option>
                    <option value="No">No</option>
                  </select>
                </div>
                <div>
                  <label style="font-size:10px; font-weight:700;">Sharps Closet Box Sealed?</label>
                  <select id="col-bmw-sharps" class="form-select" style="font-size:11px;">
                    <option value="N/A">Not Sharps Waste</option>
                    <option value="Yes">Yes, Sealed Puncture-Proof Box ✓</option>
                  </select>
                </div>
              </div>

              <div>
                <label style="font-size:10px; font-weight:700;">Discrepancy Reason (Mandatory if weight diff > 10%)</label>
                <input type="text" id="col-bmw-discrepancy" class="form-control" style="font-size:11px;" placeholder="e.g. wet waste leakage, scaling correction">
              </div>

              <button type="submit" class="btn btn-primary btn-sm">Confirm Collection & Route to TSA</button>
            </form>
          </div>

          <!-- PENDING COLLECTIONS QUEUE -->
          <div class="card" style="padding:15px;">
            <h3 style="margin:0 0 10px 0; font-size:12.5px; font-weight:800; color:var(--primary); border-bottom:1px solid var(--border-color); padding-bottom:6px;">
              ⏳ Pending Department Collections sorted by Wait Time
            </h3>
            <table class="custom-table" style="font-size:11px;">
              <thead>
                <tr>
                  <th>Log Ref</th>
                  <th>Dept</th>
                  <th>Category</th>
                  <th>Logged Weight</th>
                  <th>Bags</th>
                  <th>Elapsed Time</th>
                  <th>Infectious</th>
                </tr>
              </thead>
              <tbody>
                ${pendingLogs.length === 0 ? `
                  <tr><td colspan="7" style="text-align:center; padding:15px; color:var(--text-muted);">No entries awaiting pickup.</td></tr>
                ` : pendingLogs.map(l => {
                  var elapsedMin = Math.round((Date.now() - new Date(l.date.replace(' · ', ' ')).getTime()) / 60000);
                  var isOverdue = elapsedMin > 240; // 4 hours CPCB overdue
                  return `
                    <tr style="${l.infectious ? 'border:2px solid #dc2626 !important; background:#fff5f5;' : ''}">
                      <td style="font-family:monospace; font-weight:700;">${l.logId}</td>
                      <td><strong>${l.department}</strong></td>
                      <td>${getBmwCategoryBadge(l.category)}</td>
                      <td style="font-family:monospace; font-weight:700;">${l.weight} kg</td>
                      <td style="font-family:monospace;">${l.bagCount} bags</td>
                      <td style="color:${isOverdue ? '#dc2626' : 'inherit'}; font-weight:${isOverdue ? 'bold' : 'normal'};">
                        ${elapsedMin} mins ${isOverdue ? '⚠️ OVERDUE' : ''}
                      </td>
                      <td>${l.infectious ? '<span class="badge badge-danger" style="font-size:8px;">Yes ☣️</span>' : 'No'}</td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `;
    }

    // ────────────────────────────────────────────────────────────────────────
    // SCREEN 4 - TSA MANAGEMENT
    // ────────────────────────────────────────────────────────────────────────
    function renderBmwTsa(bags, refrigerators) {
      var tsaBags = bags.filter(b => b.status === 'TSA');
      var collectedBags = bags.filter(b => b.status === 'Collected');

      return `
        <div style="display:flex; flex-direction:column; gap:20px; text-align:left;">
          <div style="display:grid; grid-template-columns: 1fr 2fr; gap:20px;">
            <!-- TSA RECEIPT FORM -->
            <div class="card" style="padding:15px; display:flex; flex-direction:column; gap:12px; height:fit-content;">
              <h3 style="margin:0; font-size:12.5px; font-weight:800; color:var(--primary); border-bottom:1px solid var(--border-color); padding-bottom:6px;">
                🏬 Record Waste Receipt at TSA storage
              </h3>
              <form onsubmit="event.preventDefault(); window._hkBmwSubmitTsaReceipt();" style="display:flex; flex-direction:column; gap:10px;">
                <div>
                  <label style="font-size:10px; font-weight:700;">Select Collected Bag ID *</label>
                  <select id="tsa-bmw-bag" class="form-select" style="font-size:11px;" required>
                    <option value="">-- Choose Collected Bag --</option>
                    ${collectedBags.map(b => `<option value="${b.bagId}">${b.bagId} - ${b.department} (${b.category} - ${b.weight}kg)</option>`).join('')}
                  </select>
                </div>

                <div>
                  <label style="font-size:10px; font-weight:700;">TSA Storage Shelf Location *</label>
                  <select id="tsa-bmw-location" class="form-select" style="font-size:11px;" required>
                    <option value="Bin Y-1">Yellow Storage Bin Y-1</option>
                    <option value="Bin R-2">Red Storage Bin R-2</option>
                    <option value="Puncture Proof Closet">Puncture Closet W-1</option>
                    <option value="Refrigerated Room">Refrigerated Storage</option>
                  </select>
                </div>

                <button type="submit" class="btn btn-primary btn-sm">Confirm TSA Intake & Start 48-Hour Clock</button>
              </form>
            </div>

            <!-- TSA INVENTORY VIEW -->
            <div class="card" style="padding:15px;">
              <h3 style="margin:0 0 10px 0; font-size:12.5px; font-weight:800; color:var(--primary); border-bottom:1px solid var(--border-color); padding-bottom:6px;">
                🏬 TSA Storage Inventory & Expiry Ledger (48-Hour Limit Enforced)
              </h3>
              <table class="custom-table" style="font-size:11px;">
                <thead>
                  <tr>
                    <th>Bag ID</th>
                    <th>Category</th>
                    <th>Weight</th>
                    <th>Shelf Location</th>
                    <th>Received At</th>
                    <th>Hours in TSA</th>
                    <th>Regulatory Status</th>
                  </tr>
                </thead>
                <tbody>
                  ${tsaBags.length === 0 ? `
                    <tr><td colspan="7" style="text-align:center; padding:15px; color:var(--text-muted);">TSA storage empty.</td></tr>
                  ` : tsaBags.map(b => {
                    var elapsedHr = Math.round((Date.now() - new Date(b.collectedAt.replace(' · ', ' ')).getTime()) / 3600000);
                    var isBreached = elapsedHr > 48;
                    var isAmber = elapsedHr >= 36 && elapsedHr <= 48;
                    
                    var statusBadge = isBreached ? '<span class="badge badge-danger" style="font-size:8px;">⚠️ BREACHED (>48h)</span>' : (isAmber ? '<span class="badge badge-warning" style="font-size:8px;">APPROACHING LIMIT</span>' : '<span class="badge badge-success" style="font-size:8px;">Within Limit</span>');
                    var rowStyle = isBreached ? 'background:#fff5f5; border-left:3px solid #dc2626;' : (isAmber ? 'background:#fffbeb;' : '');

                    return `
                      <tr style="${rowStyle} ${b.infectious ? 'border:2px solid #dc2626 !important; background:#fff5f5;' : ''}">
                        <td style="font-family:monospace; font-weight:700;">${b.bagId}</td>
                        <td>${getBmwCategoryBadge(b.category)}</td>
                        <td style="font-family:monospace; font-weight:700;">${b.weight} kg</td>
                        <td><strong>${b.storageLocation}</strong></td>
                        <td>${b.collectedAt}</td>
                        <td style="font-family:monospace; font-weight:700;">${elapsedHr} hrs</td>
                        <td>${statusBadge}</td>
                      </tr>
                    `;
                  }).join('')}
                </tbody>
              </table>
            </div>
          </div>

          <!-- REFRIGERATOR TEMPERATURE LOGS -->
          <div class="card" style="padding:15px;">
            <h3 style="margin:0 0 10px 0; font-size:12.5px; font-weight:800; color:var(--primary); border-bottom:1px solid var(--border-color); padding-bottom:6px;">
              ❄️ Refrigeration Unit Logs (Required for Yellow Anatomical Storage)
            </h3>
            <table class="custom-table" style="font-size:11px;">
              <thead>
                <tr>
                  <th>Fridge ID</th>
                  <th>Logged Temperature</th>
                  <th>Timestamp</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                ${refrigerators.map(r => `
                  <tr>
                    <td><strong>${r.fridgeId}</strong></td>
                    <td style="font-family:monospace; font-weight:700;">${r.temp} °C</td>
                    <td>${r.timestamp}</td>
                    <td><span class="badge badge-success" style="font-size:8.5px;">${r.status}</span></td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `;
    }

    // ────────────────────────────────────────────────────────────────────────
    // SCREEN 5 - VENDOR PICKUP
    // ────────────────────────────────────────────────────────────────────────
    function renderBmwVendor(bags, manifests) {
      var tsaBags = bags.filter(b => b.status === 'TSA');
      var totalTsaWeight = tsaBags.reduce((a, b) => a + b.weight, 0);

      return `
        <div style="display:grid; grid-template-columns: 1fr 2fr; gap:20px; text-align:left;">
          <!-- VENDOR PICKUP HANDOVER FORM -->
          <div class="card" style="padding:15px; display:flex; flex-direction:column; gap:12px; height:fit-content;">
            <h3 style="margin:0; font-size:12.5px; font-weight:800; color:var(--primary); border-bottom:1px solid var(--border-color); padding-bottom:6px;">
              🚚 Record CBWTF Transporter Handover Pickup
            </h3>
            <form onsubmit="event.preventDefault(); window._hkBmwSubmitPickup();" style="display:flex; flex-direction:column; gap:10px;">
              <div>
                <label style="font-size:10px; font-weight:700;">CBWTF Vendor Partner *</label>
                <select id="pick-bmw-vendor" class="form-select" style="font-size:11px;" required>
                  <option value="CBWTF Maruthi Waste Care">CBWTF Maruthi Waste Care</option>
                  <option value="Pollution Control CBWTF Co.">Pollution Control CBWTF Co.</option>
                </select>
              </div>

              <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
                <div>
                  <label style="font-size:10px; font-weight:700;">Driver Name *</label>
                  <input type="text" id="pick-bmw-driver" class="form-control" style="font-size:11px;" placeholder="Ravi Kumar" required>
                </div>
                <div>
                  <label style="font-size:10px; font-weight:700;">Vehicle Registration No. *</label>
                  <input type="text" id="pick-bmw-vehicle" class="form-control" style="font-size:11px;" placeholder="KA-04-A-1234" required>
                </div>
              </div>

              <div>
                <label style="font-size:10px; font-weight:700;">CBWTF Authorization Certificate No. *</label>
                <input type="text" id="pick-bmw-auth" class="form-control" style="font-size:11px;" value="AUTH-BMW-2026-01" required>
              </div>

              <div style="display:grid; grid-template-columns:1.2fr 1fr; gap:10px;">
                <div>
                  <label style="font-size:10px; font-weight:700; color:#dc2626;">Manifest (Form 3) Number * (MANDATORY)</label>
                  <input type="text" id="pick-bmw-manifest" class="form-control" style="font-size:11px; border:1px solid #dc2626;" placeholder="e.g. BMW-MF-902" required>
                </div>
                <div>
                  <label style="font-size:10px; font-weight:700;">Total Handed Over (kg) *</label>
                  <input type="number" step="0.1" id="pick-bmw-weight" class="form-control" style="font-size:11px;" value="${totalTsaWeight.toFixed(1)}" required readonly>
                  <span style="font-size:9.5px; color:#166534; font-weight:700;">Matches TSA Inventory weight.</span>
                </div>
              </div>

              <button type="submit" class="btn btn-success btn-sm" style="font-weight:700;">Confirm Handover & Seal Manifest</button>
            </form>
          </div>

          <!-- SHEDULED PICKUPS & HISTORY -->
          <div class="card" style="padding:15px;">
            <h3 style="margin:0 0 10px 0; font-size:12.5px; font-weight:800; color:var(--primary); border-bottom:1px solid var(--border-color); padding-bottom:6px;">
              🚚 Sealed Dispatched Manifests History
            </h3>
            <table class="custom-table" style="font-size:11px;">
              <thead>
                <tr>
                  <th>Manifest ID</th>
                  <th>Date & Time</th>
                  <th>Total Bags</th>
                  <th>Total Weight</th>
                  <th>Transporter Partner</th>
                  <th>Vehicle Number</th>
                  <th>Authorization Code</th>
                  <th>Disposal Status</th>
                </tr>
              </thead>
              <tbody>
                ${manifests.map(m => `
                  <tr>
                    <td style="font-family:monospace; font-weight:700;">${m.manifestId}</td>
                    <td>${m.date}</td>
                    <td style="font-family:monospace;">${m.totalBags} bags</td>
                    <td style="font-family:monospace; font-weight:700;">${m.totalWeight} kg</td>
                    <td>${m.transporter}</td>
                    <td style="font-family:monospace;">${m.vehicle}</td>
                    <td style="font-family:monospace;">${m.authCert}</td>
                    <td><span class="badge badge-success" style="font-size:8px;">${m.status}</span></td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `;
    }

    // ────────────────────────────────────────────────────────────────────────
    // SCREEN 6 - DISPOSAL CONFIRMATION
    // ────────────────────────────────────────────────────────────────────────
    function renderBmwDisposal(manifests, confirmations) {
      var dispatched = manifests.filter(m => m.status === 'Dispatched');

      return `
        <div style="display:grid; grid-template-columns: 1fr 2fr; gap:20px; text-align:left;">
          <!-- DISPOSAL FORM -->
          <div class="card" style="padding:15px; display:flex; flex-direction:column; gap:12px; height:fit-content;">
            <h3 style="margin:0; font-size:12.5px; font-weight:800; color:var(--primary); border-bottom:1px solid var(--border-color); padding-bottom:6px;">
              🔒 Log CBWTF Treatment Certificate
            </h3>
            <form onsubmit="event.preventDefault(); window._hkBmwSubmitDisposal();" style="display:flex; flex-direction:column; gap:10px;">
              <div>
                <label style="font-size:10px; font-weight:700;">Select Manifest ID *</label>
                <select id="disp-bmw-manifest" class="form-select" style="font-size:11px;" required>
                  <option value="">-- Choose Manifest --</option>
                  ${dispatched.map(m => `<option value="${m.manifestId}">${m.manifestId} (${m.transporter} - ${m.totalWeight}kg)</option>`).join('')}
                </select>
              </div>

              <div>
                <label style="font-size:10px; font-weight:700;">Treatment Certificate Number *</label>
                <input type="text" id="disp-bmw-cert" class="form-control" style="font-size:11px;" placeholder="e.g. CERT-BMW-8891" required>
              </div>

              <div>
                <label style="font-size:10px; font-weight:700;">Treatment Method Used *</label>
                <select id="disp-bmw-method" class="form-select" style="font-size:11px;" required>
                  <option value="Incineration">Incineration</option>
                  <option value="Autoclave">Autoclaving & Shredding</option>
                  <option value="Disinfection">Disinfection & Shredding</option>
                  <option value="Encapsulation">Encapsulation</option>
                  <option value="Deep Burial">Deep Burial</option>
                </select>
              </div>

              <button type="submit" class="btn btn-primary btn-sm">Log Disposal Confirmation & Close Record</button>
            </form>
          </div>

          <!-- CONFIRMATIONS HISTORY -->
          <div class="card" style="padding:15px;">
            <h3 style="margin:0 0 10px 0; font-size:12.5px; font-weight:800; color:var(--primary); border-bottom:1px solid var(--border-color); padding-bottom:6px;">
              🔒 Closed Waste Disposals Register (Treatment Confirmed)
            </h3>
            <table class="custom-table" style="font-size:11px;">
              <thead>
                <tr>
                  <th>Disposal ID</th>
                  <th>Manifest No</th>
                  <th>Treatment Cert</th>
                  <th>Method Used</th>
                  <th>Disposal Date</th>
                  <th>Confirmed By</th>
                  <th>Remarks</th>
                </tr>
              </thead>
              <tbody>
                ${confirmations.map(c => `
                  <tr>
                    <td style="font-family:monospace; font-weight:700;">${c.confirmationId}</td>
                    <td style="font-family:monospace;">${c.manifestNo}</td>
                    <td style="font-family:monospace;">${c.certNo}</td>
                    <td><strong>${c.method}</strong></td>
                    <td>${c.disposalDate}</td>
                    <td>${c.confirmedBy}</td>
                    <td>${c.remarks}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `;
    }

    // ────────────────────────────────────────────────────────────────────────
    // SCREEN 7 - DAILY WASTE REGISTER
    // ────────────────────────────────────────────────────────────────────────
    function renderBmwRegister(bags, manifests) {
      // Mock register values for Saronil HIS
      var registerData = [
        { date: "2026-07-04", dept: "OT Complex", yellow: 4.5, red: 0, white: 0, blue: 0, black: 1.2, total: 5.7, status: "Collected", manifest: "Pending" },
        { date: "2026-07-04", dept: "ICU Ward", yellow: 0, red: 6.2, white: 0, blue: 0, black: 0.8, total: 7.0, status: "Collected", manifest: "Pending" },
        { date: "2026-07-03", dept: "OT Complex", yellow: 8.5, red: 0, white: 0, blue: 0, black: 2.0, total: 10.5, status: "Yes", manifest: "BMW-MF-901" },
        { date: "2026-07-03", dept: "ICU Ward", yellow: 0, red: 6.0, white: 0, blue: 0, black: 0, total: 6.0, status: "Yes", manifest: "BMW-MF-901" }
      ];

      return `
        <div class="card" style="padding:15px; text-align:left;">
          <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid var(--border-color); padding-bottom:6px; margin-bottom:12px;">
            <div>
              <h3 style="margin:0; font-size:12.5px; font-weight:800; color:var(--primary);">📋 Daily Biomedical Waste Register (Form 4 Statutory Compliance)</h3>
              <span style="font-size:9.5px; color:var(--text-muted);">Maintained department-wise as per BMW Rules 2016</span>
            </div>
            <div>
              <button class="btn btn-secondary btn-sm" onclick="window.print();">Print Register</button>
              <button class="btn btn-secondary btn-sm" onclick="window._hkBmwExportReport('Daily Register')">Export CSV</button>
            </div>
          </div>

          <table class="custom-table" style="font-size:11.5px;">
            <thead>
              <tr>
                <th>Date</th>
                <th>Department</th>
                <th>Yellow (kg)</th>
                <th>Red (kg)</th>
                <th>White (kg)</th>
                <th>Blue (kg)</th>
                <th>Black (kg)</th>
                <th>Total (kg)</th>
                <th>Collected</th>
                <th>Vendor Pickup</th>
              </tr>
            </thead>
            <tbody>
              ${registerData.map(r => `
                <tr>
                  <td style="font-family:monospace;">${r.date}</td>
                  <td><strong>${r.dept}</strong></td>
                  <td style="font-family:monospace; font-weight:bold; color:#854d0e;">${r.yellow > 0 ? r.yellow.toFixed(1) + ' kg' : '—'}</td>
                  <td style="font-family:monospace; font-weight:bold; color:#991b1b;">${r.red > 0 ? r.red.toFixed(1) + ' kg' : '—'}</td>
                  <td style="font-family:monospace; font-weight:bold; color:#334155;">${r.white > 0 ? r.white.toFixed(1) + ' kg' : '—'}</td>
                  <td style="font-family:monospace; font-weight:bold; color:#1e40af;">${r.blue > 0 ? r.blue.toFixed(1) + ' kg' : '—'}</td>
                  <td style="font-family:monospace; font-weight:bold; color:#1e293b;">${r.black > 0 ? r.black.toFixed(1) + ' kg' : '—'}</td>
                  <td style="font-family:monospace; font-weight:800;">${r.total.toFixed(1)} kg</td>
                  <td><span class="badge badge-success" style="font-size:8px;">${r.status}</span></td>
                  <td><span class="badge ${r.manifest.includes('BMW') ? 'badge-success' : 'badge-warning'}" style="font-size:8.5px;">${r.manifest}</span></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;
    }

    // ────────────────────────────────────────────────────────────────────────
    // SCREEN 8 - NON-COMPLIANCE MANAGEMENT
    // ────────────────────────────────────────────────────────────────────────
    function renderBmwNonCompliance(nonCompliances) {
      return `
        <div class="card" style="padding:15px; text-align:left;">
          <div style="border-bottom:1px solid var(--border-color); padding-bottom:6px; margin-bottom:12px; display:flex; justify-content:space-between; align-items:center;">
            <div>
              <h3 style="margin:0; font-size:12.5px; font-weight:800; color:var(--primary);">⚠️ Biomedical Waste Non-Compliance Alert Desk</h3>
              <span style="font-size:9.5px; color:#dc2626; font-weight:700;">⚠️ Escalation Gate: Unresolved events older than 24 hours automatically escalate to HK Manager and IC Nurse.</span>
            </div>
            <button class="btn btn-warning btn-sm" onclick="window._hkBmwRaiseManualNC();">+ Raise Manual Compliance Alert</button>
          </div>

          <table class="custom-table" style="font-size:11px;">
            <thead>
              <tr>
                <th>Event ID</th>
                <th>Alert Type</th>
                <th>Triggered By</th>
                <th>Timestamp</th>
                <th>Department Owner</th>
                <th>Incident Description</th>
                <th>Assigned To</th>
                <th>Resolution Status</th>
                <th>Supervisor Actions</th>
              </tr>
            </thead>
            <tbody>
              ${nonCompliances.map(n => `
                <tr style="background:#fff5f5; border-left:3px solid #dc2626;">
                  <td style="font-family:monospace; font-weight:700;">${n.eventId}</td>
                  <td><span class="badge badge-danger" style="font-size:8.5px;">${n.type}</span></td>
                  <td><strong>${n.triggeredBy}</strong></td>
                  <td>${n.timestamp}</td>
                  <td><strong>${n.department}</strong></td>
                  <td>${n.description}</td>
                  <td>${n.assignedTo || 'Unassigned'}</td>
                  <td><span class="badge ${n.status === 'Resolved' ? 'badge-success' : 'badge-warning'}" style="font-size:8px;">${n.status}</span></td>
                  <td>
                    ${n.status === 'Open' ? `
                      <button class="btn btn-success btn-xs" style="padding:2px 8px; font-weight:700;" onclick="window._hkBmwResolveNC('${n.eventId}')">Resolve Event</button>
                    ` : '<span style="color:#065f46; font-weight:700;">Resolved ✓</span>'}
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;
    }

    // ────────────────────────────────────────────────────────────────────────
    // SCREEN 9 - REPORTS
    // ────────────────────────────────────────────────────────────────────────
    function renderBmwReports(bags, manifests, nonCompliances) {
      return `
        <div style="display:flex; flex-direction:column; gap:20px; text-align:left;">
          <!-- FILTERS -->
          <div class="card" style="padding:15px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">
            <div>
              <h3 style="margin:0; font-size:12.5px; font-weight:800; color:var(--primary);">📈 Saronil BMW Analytics Reports</h3>
              <span style="font-size:10px; color:var(--text-muted);">CPCB & SPCB Statutory Compliance Reports</span>
            </div>
            
            <div style="display:flex; align-items:center; gap:8px;">
              <span style="font-size:11px; font-weight:700;">Date Range:</span>
              <input type="date" class="form-control" style="font-size:11px; width:130px;" value="${new Date().toISOString().slice(0, 10)}">
              <input type="date" class="form-control" style="font-size:11px; width:130px;" value="${new Date().toISOString().slice(0, 10)}">
              <button class="btn btn-secondary btn-sm" onclick="window._hkBmwExportReport('Annual SPCB Return')">SPCB Return Data</button>
            </div>
          </div>

          <!-- REPORTS GRID -->
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:20px;">
            <!-- REPORT 1 -->
            <div class="card" style="padding:15px;">
              <h4 style="margin:0 0 10px 0; font-size:12px; font-weight:800; border-bottom:1px solid var(--border-color); padding-bottom:6px;">Annual return Data (Consolidated Category-wise Weight)</h4>
              <table class="custom-table" style="font-size:11px;">
                <tbody>
                  <tr><td>🟡 Yellow Waste</td><td style="font-family:monospace; font-weight:700; text-align:right;">13.0 kg</td></tr>
                  <tr><td>🔴 Red Waste</td><td style="font-family:monospace; font-weight:700; text-align:right;">12.2 kg</td></tr>
                  <tr><td>⚪ White (Sharps)</td><td style="font-family:monospace; font-weight:700; text-align:right;">1.5 kg</td></tr>
                  <tr><td>🔵 Blue (Glass)</td><td style="font-family:monospace; font-weight:700; text-align:right;">0 kg</td></tr>
                  <tr><td>⚫ General waste</td><td style="font-family:monospace; font-weight:700; text-align:right;">4.0 kg</td></tr>
                </tbody>
              </table>
            </div>

            <!-- REPORT 2 -->
            <div class="card" style="padding:15px;">
              <h4 style="margin:0 0 10px 0; font-size:12px; font-weight:800; border-bottom:1px solid var(--border-color); padding-bottom:6px;">Regulatory TSA Storage Metrics</h4>
              <table class="custom-table" style="font-size:11px;">
                <tbody>
                  <tr><td>Average Holding Time (TSA)</td><td style="font-family:monospace; font-weight:700; text-align:right;">24.5 hrs</td></tr>
                  <tr><td>TSA 48-Hour breaches logged</td><td style="font-family:monospace; font-weight:700; text-align:right; color:#dc2626;">1 event</td></tr>
                  <tr><td>Refrigeration temp average</td><td style="font-family:monospace; font-weight:700; text-align:right; color:#166534;">3.8 °C</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      `;
    }

    // ────────────────────────────────────────────────────────────────────────
    // SCREEN 10 - AUDIT LOG
    // ────────────────────────────────────────────────────────────────────────
    function renderBmwAudit(auditLogs) {
      return `
        <div class="card" style="padding:15px; text-align:left;">
          <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid var(--border-color); padding-bottom:6px; margin-bottom:12px;">
            <h3 style="margin:0; font-size:12.5px; font-weight:800; color:var(--primary);">📝 BMW Transaction Audit Ledger</h3>
            <span style="font-size:10px; color:var(--text-muted);">Real-time statutory logging under BMW Rules 2016</span>
          </div>

          <div style="max-height:500px; overflow-y:auto;">
            <table class="custom-table" style="font-size:11px;">
              <thead>
                <tr>
                  <th>Transaction ID</th>
                  <th>Timestamp</th>
                  <th>User / Actor</th>
                  <th>Role</th>
                  <th>Action</th>
                  <th>Category</th>
                  <th>Dept</th>
                  <th>Weight (kg)</th>
                  <th>Remarks</th>
                </tr>
              </thead>
              <tbody>
                ${auditLogs.map(a => `
                  <tr>
                    <td style="font-family:monospace; font-weight:700;">${a.txId}</td>
                    <td>${a.timestamp}</td>
                    <td><strong>${a.user}</strong></td>
                    <td>${a.role}</td>
                    <td>
                      <span class="badge ${a.user === 'System' ? 'badge-secondary' : 'badge-primary'}" style="font-size:8.5px;">${a.action}</span>
                    </td>
                    <td>${a.category}</td>
                    <td><strong>${a.department}</strong></td>
                    <td style="font-family:monospace; font-weight:700;">${a.weight} kg</td>
                    <td>${a.remarks}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `;
    }
  }

  function renderBedsGrid() {
    var beds = window.state.bedsStatus || {};
    var wards = [...new Set(Object.keys(beds).map(k => beds[k].wardKey))];
    
    var filteredBeds = Object.keys(beds);
    if (_bedWardFilter !== 'All') {
      filteredBeds = Object.keys(beds).filter(b => beds[b].wardKey === _bedWardFilter);
    }

    var statusColors = {
      'Occupied':  { bg: 'linear-gradient(135deg,#dbeafe 0%,#eff6ff 100%)', border: '#3b82f6', text: '#1e3a8a', badge: '#2563eb', badgeBg: 'rgba(37,99,235,0.12)', icon: '🔵' },
      'Dirty':     { bg: 'linear-gradient(135deg,#fee2e2 0%,#fff1f1 100%)', border: '#ef4444', text: '#991b1b', badge: '#dc2626', badgeBg: 'rgba(220,38,38,0.12)', icon: '🔴' },
      'Cleaning':  { bg: 'linear-gradient(135deg,#fef9c3 0%,#fffbeb 100%)', border: '#f59e0b', text: '#92400e', badge: '#d97706', badgeBg: 'rgba(217,119,6,0.12)',  icon: '🟡' },
      'Available': { bg: 'linear-gradient(135deg,#dcfce7 0%,#f0fdf4 100%)', border: '#22c55e', text: '#14532d', badge: '#16a34a', badgeBg: 'rgba(22,163,74,0.12)',  icon: '🟢' },
      'Ready':     { bg: 'linear-gradient(135deg,#dcfce7 0%,#f0fdf4 100%)', border: '#22c55e', text: '#14532d', badge: '#16a34a', badgeBg: 'rgba(22,163,74,0.12)',  icon: '🟢' },
      'Blocked':   { bg: 'linear-gradient(135deg,#f1f5f9 0%,#f8fafc 100%)', border: '#94a3b8', text: '#475569', badge: '#64748b', badgeBg: 'rgba(100,116,139,0.12)', icon: '⚫' }
    };

    // Group filtered beds by wardKey
    var bedsByWard = {};
    filteredBeds.forEach(b => {
      var wKey = beds[b].wardKey || 'Unknown Ward';
      if (!bedsByWard[wKey]) bedsByWard[wKey] = [];
      bedsByWard[wKey].push(b);
    });

    var wardSectionsHtml = Object.keys(bedsByWard).map(wKey => {
      var wardBeds = bedsByWard[wKey];
      return `
        <div class="ward-group" style="margin-bottom:20px; background:white; padding:16px; border-radius:12px; border:1px solid var(--border-color); box-shadow:0 2px 8px rgba(0,0,0,0.04);">
          <div style="display:flex; justify-content:space-between; align-items:center; border-bottom: 2px solid #f1f5f9; padding-bottom:10px; margin-bottom:14px; flex-wrap:wrap; gap:6px;">
            <h4 style="margin:0; font-size:13px; font-weight:800; color:var(--text-primary); display:flex; align-items:center; gap:6px;">
              🏢 ${wKey}
              <span style="font-size:10px; font-weight:700; background:rgba(9, 79, 164, 0.1); color:var(--primary); padding:2px 8px; border-radius:12px;">
                ${wardBeds.length} ${wardBeds.length === 1 ? 'Bed' : 'Beds'}
              </span>
            </h4>
            <div style="font-size:11px; font-weight:700; display:flex; gap:12px; flex-wrap:wrap;">
              <span style="color:#16a34a; display:flex; align-items:center; gap:4px;">🟢 <span>Available: ${wardBeds.filter(b => beds[b].status === 'Available' || beds[b].status === 'Ready').length}</span></span>
              <span style="color:#dc2626; display:flex; align-items:center; gap:4px;">🔴 <span>Dirty: ${wardBeds.filter(b => beds[b].status === 'Dirty').length}</span></span>
              <span style="color:#d97706; display:flex; align-items:center; gap:4px;">🟡 <span>Cleaning: ${wardBeds.filter(b => beds[b].status === 'Cleaning').length}</span></span>
              <span style="color:#2563eb; display:flex; align-items:center; gap:4px;">🔵 <span>Occupied: ${wardBeds.filter(b => beds[b].status === 'Occupied').length}</span></span>
              <span style="color:#64748b; display:flex; align-items:center; gap:4px;">⚫ <span>Blocked: ${wardBeds.filter(b => beds[b].status === 'Blocked').length}</span></span>
            </div>
          </div>
          <div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap:12px;">
            ${wardBeds.map(b => {
              var details = beds[b];
              var c = statusColors[details.status] || { bg:'white', border:'#cbd5e1', text:'#334155', badge:'#64748b', badgeBg:'#f1f5f9', icon:'⬜' };
              return `
                <div onclick="window._hkClickBed('${b}', '${details.status}', '${details.wardKey}')"
                  style="background:${c.bg}; border:2px solid ${c.border}; border-radius:12px; padding:12px 11px; cursor:pointer; min-height:90px; display:flex; flex-direction:column; justify-content:space-between; transition:transform 0.15s ease, box-shadow 0.15s ease; box-shadow:0 2px 6px rgba(0,0,0,0.05);"
                  onmouseover="this.style.transform='translateY(-3px)'; this.style.boxShadow='0 8px 20px rgba(0,0,0,0.12)';"
                  onmouseout="this.style.transform='none'; this.style.boxShadow='0 2px 6px rgba(0,0,0,0.05)';">
                  <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:6px;">
                    <span style="font-size:19px; line-height:1;">${c.icon}</span>
                    <span style="font-size:9px; font-weight:800; text-transform:uppercase; letter-spacing:0.5px; background:${c.badgeBg}; color:${c.badge}; padding:2px 6px; border-radius:6px;">${details.status}</span>
                  </div>
                  <div style="font-size:18px; font-weight:900; font-family:'JetBrains Mono',monospace; color:${c.text}; letter-spacing:-0.5px; margin-bottom:4px;">${b}</div>
                  <div style="font-size:10px; font-weight:600; color:${c.text}; opacity:0.7; display:flex; justify-content:space-between; align-items:center;">
                    <span>${details.wardKey || ''}</span>
                    <span style="font-size:9px; opacity:0.6;">${details.patientUhid ? '👤 ' + details.patientUhid : 'Vacant'}</span>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      `;
    }).join('');

    return `
      <div class="card" style="text-align:left; padding:15px; display:flex; flex-direction:column; gap:15px;">
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">
          <h3 style="margin:0; font-size:13.5px; font-weight:800; color:var(--primary);">🛏️ Real-Time Bed Readiness Board</h3>
          
          <div style="display:flex; align-items:center; gap:8px;">
            <span style="font-size:11px; font-weight:700;">Filter Ward:</span>
            <select class="form-select" style="font-size:12px; width:180px;" onchange="window._hkSetBedWardFilter(this.value)">
              <option value="All" ${_bedWardFilter === 'All' ? 'selected' : ''}>All Wards</option>
              ${wards.map(w => `<option value="${w}" ${_bedWardFilter === w ? 'selected' : ''}>${w}</option>`).join('')}
            </select>
          </div>
        </div>

        <div style="display:flex; flex-direction:column; gap:10px;">
          ${wardSectionsHtml || `<div style="padding:20px; text-align:center; color:var(--text-muted); font-size:12px;">No beds found for the selected ward filter.</div>`}
        </div>

        <div style="font-size:11px; color:var(--text-secondary); display:flex; gap:15px; border-top:1px solid var(--border-color); padding-top:10px; flex-wrap:wrap;">
          <span>💡 <strong>Click Action Rules:</strong></span>
          <span>🔴 <strong>Dirty:</strong> Inspects/creates cleaning task</span>
          <span>🟢 <strong>Available:</strong> Toggles to Out of Service Blocked</span>
          <span>⚫ <strong>Blocked:</strong> Releases bed back to Available pool</span>
        </div>
      </div>
    `;
  }

  function renderReportsView() {
    var tasks = window.state.housekeepingTasks || [];
    var inspections = window.state.hkInspections || [];
    var staff = window.state.hkStaffList || [];

    return `
      <div class="card" style="text-align:left; padding:15px; display:flex; flex-direction:column; gap:15px;">
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px; border-bottom:1.5px solid var(--border-color); padding-bottom:10px;">
          <div style="display:flex; align-items:center; gap:12px; flex-wrap:wrap;">
            <h3 style="margin:0; font-size:14px; font-weight:900; color:var(--primary);">📈 Operations Reporting Desk</h3>
            <select class="form-select" style="font-size:12px; width:220px;" onchange="window._hkSetReportType(this.value)">
              <option value="sla" ${_reportType === 'sla' ? 'selected' : ''}>SLA Compliance Report</option>
              <option value="staff" ${_reportType === 'staff' ? 'selected' : ''}>Staff Productivity Report</option>
              <option value="daily" ${_reportType === 'daily' ? 'selected' : ''}>Daily Housekeeping Report</option>
              <option value="room" ${_reportType === 'room' ? 'selected' : ''}>Room Cleaning Log</option>
              <option value="bedReadiness" ${_reportType === 'bedReadiness' ? 'selected' : ''}>Bed Readiness Report</option>
              <option value="quality" ${_reportType === 'quality' ? 'selected' : ''}>Quality Inspection Report</option>
            </select>
          </div>
          
          <div style="display:flex; align-items:center; gap:8px;">
            <input type="date" class="form-control" style="font-size:11px; width:120px;" value="${_reportFromDate}" onchange="window._hkSetReportFromDate(this.value)">
            <span style="font-size:11px;">to</span>
            <input type="date" class="form-control" style="font-size:11px; width:120px;" value="${_reportToDate}" onchange="window._hkSetReportToDate(this.value)">
            <button class="btn btn-secondary btn-sm" onclick="window._hkRefreshReport()">Query</button>
            <button class="btn btn-success btn-sm" onclick="alert('Statutory CSV report generated successfully.')">Export CSV</button>
          </div>
        </div>

        <div class="report-content">
          ${_reportType === 'sla' ? renderSlaReportContent(tasks) : ''}
          ${_reportType === 'staff' ? renderStaffReportContent(tasks, staff) : ''}
          ${_reportType === 'daily' ? renderDailyReportContent(tasks) : ''}
          ${_reportType === 'room' ? renderRoomReportContent(tasks) : ''}
          ${_reportType === 'bedReadiness' ? renderBedReportContent() : ''}
          ${_reportType === 'quality' ? renderQualityReportContent(inspections) : ''}
        </div>
      </div>
    `;
  }

  function renderSlaReportContent(tasks) {
    var slas = window.state.hkSlaSettings || {};
    var types = ['Discharge Cleaning', 'Isolation Room Cleaning', 'OT Cleaning', 'General Room Cleaning', 'Bathroom Cleaning', 'Spill Cleaning'];
    
    return `
      <table class="custom-table" style="font-size:12px;">
        <thead>
          <tr>
            <th>Task Type</th>
            <th>Total Tasks</th>
            <th>On-Time</th>
            <th>Breached</th>
            <th>SLA Target</th>
            <th>Avg Completion Time</th>
            <th>Compliance Score</th>
          </tr>
        </thead>
        <tbody>
          ${types.map(t => {
            var match = tasks.filter(x => x.type.includes(t) || (t === 'Discharge Cleaning' && x.type === 'Discharge Cleaning'));
            var tot = match.length;
            var limit = slas[t] || 60;
            var onTime = 0;
            var breached = 0;
            var totalElapsedMin = 0;

            match.forEach(x => {
              var elapsedMs = Date.now() - new Date(x.createdTime).getTime();
              var elapsedMin = Math.floor(elapsedMs / 60000);
              if (x.status === 'Verified' || x.status === 'Closed') {
                var compMs = new Date(x.verifiedTime || x.completedTime).getTime() - new Date(x.createdTime).getTime();
                elapsedMin = Math.floor(compMs / 60000);
              }
              totalElapsedMin += elapsedMin;
              if (elapsedMin > limit) breached++;
              else onTime++;
            });

            var avgTime = tot > 0 ? Math.round(totalElapsedMin / tot) : 0;
            var score = tot > 0 ? Math.round((onTime / tot) * 100) : 100;

            return `
              <tr>
                <td><strong>${t}</strong></td>
                <td style="font-family:monospace;">${tot}</td>
                <td style="font-family:monospace; color:#166534; font-weight:700;">${onTime}</td>
                <td style="font-family:monospace; color:#b91c1c; font-weight:700;">${breached}</td>
                <td style="font-family:monospace;">${limit} min</td>
                <td style="font-family:monospace;">${avgTime} min</td>
                <td>
                  <span class="badge ${score < 90 ? 'badge-danger' : 'badge-success'}" style="font-size:9.5px;">
                    ${score}% Compliance
                  </span>
                </td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    `;
  }

  function renderStaffReportContent(tasks, staff) {
    return `
      <table class="custom-table" style="font-size:12px;">
        <thead>
          <tr>
            <th>Staff Name</th>
            <th>Shift</th>
            <th>Tasks Assigned</th>
            <th>Completed Tasks</th>
            <th>Active Backlog</th>
            <th>Compliance Rating</th>
          </tr>
        </thead>
        <tbody>
          ${staff.map(st => {
            var assigned = tasks.filter(t => t.assignee === st.name).length;
            var completed = tasks.filter(t => t.assignee === st.name && (t.status === 'Verified' || t.status === 'Completed')).length;
            return `
              <tr>
                <td><strong>${st.name}</strong></td>
                <td>${st.shift}</td>
                <td style="font-family:monospace;">${assigned}</td>
                <td style="font-family:monospace; color:#166534; font-weight:700;">${completed}</td>
                <td style="font-family:monospace; color:#d97706;">${st.activeTasks}</td>
                <td><span class="badge badge-success" style="font-size:9.5px;">100% Rating</span></td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    `;
  }

  function renderDailyReportContent(tasks) {
    return `
      <table class="custom-table" style="font-size:12px;">
        <thead>
          <tr>
            <th>Task ID</th>
            <th>Task Type</th>
            <th>Location</th>
            <th>Cleaner</th>
            <th>Completed At</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          ${tasks.filter(t => t.status === 'Verified' || t.status === 'Completed').map(t => `
            <tr>
              <td style="font-family:monospace; font-weight:700;">${t.id}</td>
              <td><strong>${t.type}</strong></td>
              <td style="font-family:monospace; font-weight:700;">${t.bedId}</td>
              <td>${t.assignee || 'System'}</td>
              <td style="font-family:monospace;">${formatDateTime(t.completedTime || t.verifiedTime)}</td>
              <td><span class="badge badge-success" style="font-size:9px;">${t.status}</span></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  }

  function renderRoomReportContent(tasks) {
    return renderDailyReportContent(tasks);
  }

  function renderBedReportContent() {
    var beds = Object.keys(window.state.bedsStatus || {});
    var ready = beds.filter(b => window.state.bedsStatus[b].status === 'Available' || window.state.bedsStatus[b].status === 'Ready').length;
    var dirty = beds.filter(b => window.state.bedsStatus[b].status === 'Dirty').length;
    var cleaning = beds.filter(b => window.state.bedsStatus[b].status === 'Cleaning').length;

    return `
      <div style="display:grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin-bottom: 20px; text-align:center;">
        <div style="background:#d1fae5; border: 1px solid #a7f3d0; padding:15px; border-radius:8px;">
          <div style="font-size:18px; font-weight:900; font-family:monospace; color:#065f46;">${ready}</div>
          <div style="font-size:10px; font-weight:700; text-transform:uppercase; color:#047857;">Ready / Vacant Beds</div>
        </div>
        <div style="background:#fee2e2; border: 1px solid #fecaca; padding:15px; border-radius:8px;">
          <div style="font-size:18px; font-weight:900; font-family:monospace; color:#991b1b;">${dirty}</div>
          <div style="font-size:10px; font-weight:700; text-transform:uppercase; color:#b91c1c;">Dirty Pending Beds</div>
        </div>
        <div style="background:#fef3c7; border: 1px solid #fde68a; padding:15px; border-radius:8px;">
          <div style="font-size:18px; font-weight:900; font-family:monospace; color:#92400e;">${cleaning}</div>
          <div style="font-size:10px; font-weight:700; text-transform:uppercase; color:#d97706;">Beds in Cleaning</div>
        </div>
      </div>
    `;
  }

  function renderQualityReportContent(inspections) {
    return `
      <table class="custom-table" style="font-size:12px;">
        <thead>
          <tr>
            <th>Inspection ID</th>
            <th>Area Checked</th>
            <th>Date</th>
            <th>Inspector</th>
            <th>Cleanliness Score</th>
            <th>Remarks</th>
          </tr>
        </thead>
        <tbody>
          ${inspections.map(insp => `
            <tr style="background:${insp.score < 3.5 ? '#fef2f2' : 'white'};">
              <td style="font-family:monospace; font-weight:700;">${insp.id}</td>
              <td><strong>${insp.area}</strong></td>
              <td>${insp.date}</td>
              <td>${insp.inspector}</td>
              <td style="font-family:monospace; font-weight:800; color:${insp.score < 3.5 ? '#b91c1c' : '#166534'};">${insp.score} / 5.0</td>
              <td>${insp.remarks} ${insp.rootCause ? `<div style="font-size:9.5px; color:#b91c1c;">Root Cause: ${insp.rootCause}</div>` : ''}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  }

  function renderAuditTrailView() {
    var logs = window.state.hkAuditLogs || [];

    var filtered = logs.filter(l => {
      if (_auditRoleFilter !== 'All') {
        if (l.role !== _auditRoleFilter) return false;
      }
      if (_auditActionFilter !== 'All') {
        if (l.action !== _auditActionFilter) return false;
      }
      return true;
    });

    var roles = ['All', 'System', 'HK Supervisor', 'HK Staff', 'Infection Control Nurse', 'Ward Nurse'];
    var actions = ['All', 'CREATE', 'ASSIGN', 'START', 'COMPLETE', 'VERIFY', 'IC_SIGN_OFF', 'LAUNDRY_DISPATCH', 'LAUNDRY_RECEIVE', 'CSSD_LOAD', 'CSSD_COMPLETE', 'BMW_COLLECT', 'BMW_DISPATCH'];

    return `
      <div class="card" style="text-align:left; padding:15px; display:flex; flex-direction:column; gap:15px;">
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px; border-bottom:1.5px solid var(--border-color); padding-bottom:10px;">
          <h3 style="margin:0; font-size:14px; font-weight:900; color:var(--primary);">📋 Central Environmental Audit Trail Ledger</h3>
          
          <div style="display:flex; gap:10px; flex-wrap:wrap;">
            <div class="form-group" style="margin:0;">
              <label style="font-size:10px; font-weight:700;">Role Filter</label>
              <select class="form-select" style="font-size:11px; padding:2px 6px;" onchange="window._hkSetAuditRoleFilter(this.value)">
                ${roles.map(r => `<option value="${r}" ${_auditRoleFilter === r ? 'selected' : ''}>${r}</option>`).join('')}
              </select>
            </div>
            <div class="form-group" style="margin:0;">
              <label style="font-size:10px; font-weight:700;">Action Filter</label>
              <select class="form-select" style="font-size:11px; padding:2px 6px;" onchange="window._hkSetAuditActionFilter(this.value)">
                ${actions.map(a => `<option value="${a}" ${_auditActionFilter === a ? 'selected' : ''}>${a}</option>`).join('')}
              </select>
            </div>
          </div>
        </div>

        <div class="custom-table-container">
          <table class="custom-table" style="font-size:11.5px;">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Sub-module</th>
                <th>User Actor</th>
                <th>Role</th>
                <th>Action</th>
                <th>Location / Item</th>
                <th>Action Log Description</th>
              </tr>
            </thead>
            <tbody>
              ${filtered.map(l => `
                <tr>
                  <td style="font-family:monospace; color:var(--text-secondary);">${formatDateTime(l.timestamp)}</td>
                  <td><strong>${l.subModule || 'HK Ops'}</strong></td>
                  <td>${l.user}</td>
                  <td><span style="font-size:10px; color:var(--text-muted);">${l.role}</span></td>
                  <td><span class="badge badge-info" style="font-size:8.5px;">${l.action}</span></td>
                  <td><span style="font-family:monospace; font-weight:700;">${l.locationItem || l.roomBed || '--'}</span></td>
                  <td>${l.remarks || ''}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  // ──────────────────────────────────────────────────────────────────────────
  // AUDIT LOG FILTER SETTERS
  // ──────────────────────────────────────────────────────────────────────────
  window._hkSetAuditRoleFilter = function (val) {
    _auditRoleFilter = val;
    window.router.navigate(`housekeepingOperations?tab=${_activeOpsSubTab}&t=${Date.now()}`);
  };

  window._hkSetAuditActionFilter = function (val) {
    _auditActionFilter = val;
    window.router.navigate(`housekeepingOperations?tab=${_activeOpsSubTab}&t=${Date.now()}`);
  };
})();
