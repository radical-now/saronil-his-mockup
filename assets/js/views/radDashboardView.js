// Radiology Information System (RIS) & Command Center Dashboard
// Saronil Health HIS
// Enhanced with Patient-Type Routing, Safety Gates, Radiologist Role Gate, Delivery Paths, and QA Compliance Logs
// Implements Complete Patient Journey from Arrival to Report Delivery, including Token Queue, Verbal Callbacks, Contrast Observation, and MLC Imaging

(function() {
  // Initialize mock data in state if not present
  function initRadState() {
    if (!window.state) window.state = {};
    
    // Active Tab tracking
    window.state.activeRisTab = window.state.activeRisTab || 'journey';

    // RIS Modality Master & Tariff List
    window.state.risTestMaster = window.state.risTestMaster || [
      { code: "XRAY_CHEST", name: "X-Ray Chest PA View", modality: "X-Ray", room: "ROOM-X1", price: 450, prep: "Remove metal objects/jewelry", sampleType: "None", icd10: "I25.1" },
      { code: "USG_ABD", name: "USG Whole Abdomen", modality: "Ultrasound", room: "ROOM-U1", price: 1200, prep: "6 hours fasting required", sampleType: "None", icd10: "K21.9" },
      { code: "CT_BRAIN_C", name: "CT Brain Contrast-Enhanced", modality: "CT Scan", room: "ROOM-CT1", price: 4500, prep: "4 hours fasting, Serum Creatinine check", sampleType: "None", icd10: "I25.1" },
      { code: "MRI_SPINE_LS", name: "MRI Lumbar Spine", modality: "MRI", room: "ROOM-MR1", price: 6500, prep: "MRI Safety metal screening check", sampleType: "None", icd10: "M54.5" },
      { code: "DOPPLER_LL", name: "Doppler Bilateral Lower Limbs", modality: "Ultrasound", room: "ROOM-U2", price: 2500, prep: "None", sampleType: "None", icd10: "I25.1" },
      { code: "MAMMO_BI", name: "Mammography Bilateral", modality: "Mammography", room: "ROOM-M1", price: 1500, prep: "Avoid deodorants/powders", sampleType: "None", icd10: "N92.0" }
    ];

    // Equipment Master with Calibration Override support
    window.state.risEquipments = window.state.risEquipments || [
      { id: "EQ-R1", name: "Siemens Magnetom 3T MRI", type: "MRI", status: "Calibrated", lastCalib: "01-Jul-2026", nextCalib: "01-Aug-2026", pmSchedule: "15-Jul-2026", override: null },
      { id: "EQ-R2", name: "GE Optima 128-Slice CT", type: "CT Scan", status: "Calibrated", lastCalib: "28-Jun-2026", nextCalib: "28-Jul-2026", pmSchedule: "12-Jul-2026", override: null },
      { id: "EQ-R3", name: "Philips Affiniti 70 USG", type: "Ultrasound", status: "Calibration Due", lastCalib: "12-Jun-2026", nextCalib: "26-Jun-2026", pmSchedule: "08-Jul-2026", override: null },
      { id: "EQ-R4", name: "Allengers 500mA Fixed X-Ray", type: "X-Ray", status: "Calibrated", lastCalib: "02-Jul-2026", nextCalib: "02-Aug-2026", pmSchedule: "20-Jul-2026", override: null }
    ];

    // Seeding Patient Journey Queue
    window.state.risQueue = window.state.risQueue || [
      { 
        visitId: "VIS-1001",
        studyId: "STUDY-1001", 
        tokenNumber: "RAD-001",
        name: "Aarav Mehta", 
        uhid: "SH-2026-04821", 
        patientType: "IPD", 
        modality: "MRI", 
        studyName: "MRI Lumbar Spine", 
        priority: "STAT", 
        stage: "Pre-Scan Prep",
        room: "ROOM-MR1", 
        time: "10:30 AM", 
        priorityFlag: "Wheelchair-bound",
        isolationStatus: "Normal",
        mlcFlag: false,
        safetyCheck: { 
          completed: true, 
          fasting: "N/A", 
          pregnancy: "N/A", 
          metalCleared: "Cleared", 
          consent: "Yes",
          renalChecked: "Yes",
          renalVal: "1.1 mg/dL",
          renalSource: "EMR",
          allergyHistory: "None",
          premedication: "No",
          mriQuestionnaire: { implants: "No", pacemaker: "No", clips: "No", fragments: "No", pregnancy: "No", claustrophobia: "No" },
          modalityCalibrationOverride: false,
          overrideOfficer: "",
          overrideReason: ""
        }, 
        technician: "Tech Vinay",
        clinicalIndication: "Severe lumbar pain radiating to lower limbs, suspect disc herniation",
        orderingPhysician: "Dr. Amit Verma",
        referringDoctor: "",
        referringHospital: "",
        billingStatus: "Cleared",
        transportRequirement: "Wheelchair",
        wardBed: "ICU-BED-02",
        modalityId: "EQ-R1",
        checkInTime: "10:15 AM",
        prepCompleted: false,
        ivCannulated: false,
        scanLog: null,
        contrastObs: null,
        postScanTransport: null,
        billingReconciled: false
      },
      { 
        visitId: "VIS-1002",
        studyId: "STUDY-1002", 
        tokenNumber: "RAD-002",
        name: "Sunita Sharma", 
        uhid: "SH-2026-04803", 
        patientType: "OPD", 
        modality: "CT Scan", 
        studyName: "CT Brain Contrast-Enhanced", 
        priority: "Urgent", 
        stage: "Scan Acquisition", 
        room: "ROOM-CT1", 
        time: "11:00 AM", 
        priorityFlag: "None",
        isolationStatus: "Normal",
        mlcFlag: false,
        safetyCheck: { 
          completed: true, 
          fasting: "Yes (6h)", 
          pregnancy: "Negative", 
          metalCleared: "N/A", 
          consent: "Yes",
          renalChecked: "Yes",
          renalVal: "0.9 mg/dL",
          renalSource: "Uploaded Report",
          allergyHistory: "None",
          premedication: "No",
          mriQuestionnaire: null,
          modalityCalibrationOverride: false,
          overrideOfficer: "",
          overrideReason: ""
        }, 
        technician: "Tech Preeti",
        clinicalIndication: "Persistent headaches, rule out vascular pathology",
        orderingPhysician: "Dr. Priya Nair",
        referringDoctor: "",
        referringHospital: "",
        billingStatus: "Cleared",
        transportRequirement: "Ambulatory",
        wardBed: "",
        modalityId: "EQ-R2",
        checkInTime: "10:30 AM",
        prepCompleted: true,
        ivCannulated: true,
        scanLog: null,
        contrastObs: null,
        postScanTransport: null,
        billingReconciled: false
      },
      { 
        visitId: "VIS-1003",
        studyId: "STUDY-1003", 
        tokenNumber: "RAD-003",
        name: "Vijay Singhal", 
        uhid: "EXT-2026-8801", 
        patientType: "Outside", 
        modality: "Ultrasound", 
        studyName: "USG Whole Abdomen", 
        priority: "Routine", 
        stage: "Check-In", 
        room: "ROOM-U1", 
        time: "11:30 AM", 
        priorityFlag: "Elderly",
        isolationStatus: "Normal",
        mlcFlag: true, // MLC case
        safetyCheck: { 
          completed: false, 
          fasting: "Pending", 
          pregnancy: "N/A", 
          metalCleared: "N/A", 
          consent: "N/A",
          renalChecked: "N/A",
          renalVal: "",
          renalSource: "Waiver",
          allergyHistory: "None",
          premedication: "No",
          mriQuestionnaire: null,
          modalityCalibrationOverride: false,
          overrideOfficer: "",
          overrideReason: ""
        }, 
        technician: "Tech Suresh",
        clinicalIndication: "Abdominal trauma from road accident, check for gallstones/internal bleed",
        orderingPhysician: "",
        referringDoctor: "Dr. R. K. Goel",
        referringHospital: "City Diagnostic Lab",
        billingStatus: "Cleared",
        transportRequirement: "Ambulatory",
        wardBed: "",
        modalityId: "EQ-R3", // Calibration Due USG
        checkInTime: "11:00 AM",
        prepCompleted: false,
        ivCannulated: false,
        scanLog: null,
        contrastObs: null,
        postScanTransport: null,
        billingReconciled: false
      },
      {
        visitId: "VIS-1004",
        studyId: "STUDY-1004",
        tokenNumber: "RAD-004",
        name: "Harpreet Singh",
        uhid: "SH-2026-04817",
        patientType: "IPD",
        modality: "CT Scan",
        studyName: "CT Chest Contrast-Enhanced",
        priority: "STAT",
        stage: "Contrast Observation",
        room: "ROOM-CT1",
        time: "09:45 AM",
        priorityFlag: "None",
        isolationStatus: "Contact Isolation (Infection Precaution)",
        mlcFlag: false,
        safetyCheck: { completed: true, fasting: "Yes (6h)", pregnancy: "N/A", metalCleared: "N/A", consent: "Yes", renalChecked: "Yes", renalVal: "1.2 mg/dL", renalSource: "EMR", allergyHistory: "None", premedication: "No" },
        technician: "Tech Preeti",
        clinicalIndication: "Sudden onset breathlessness post-op",
        orderingPhysician: "Dr. Amit Verma",
        referringDoctor: "",
        referringHospital: "",
        billingStatus: "Cleared",
        transportRequirement: "Stretcher",
        wardBed: "PVT-204",
        modalityId: "EQ-R2",
        checkInTime: "09:15 AM",
        prepCompleted: true,
        ivCannulated: true,
        scanLog: { technologistId: "Tech Preeti", imageQuality: "Adequate", radiationDose: "18.5 mGy", scanStartTime: Date.now() - 30 * 60 * 1000, scanEndTime: Date.now() - 20 * 60 * 1000 },
        contrastObs: { isContrastAdministered: true, durationMinutes: 20, obsStartTime: Date.now() - 15 * 60 * 1000, reactionLogged: false, reactionDetails: "", overriddenEarlyBy: null, overrideReason: null, discharged: false },
        postScanTransport: null,
        billingReconciled: false
      },
      {
        visitId: "VIS-1005",
        studyId: "STUDY-1005",
        tokenNumber: "RAD-005",
        name: "Meena Iyer",
        uhid: "SH-2026-04788",
        patientType: "IPD",
        modality: "X-Ray",
        studyName: "X-Ray Chest PA View",
        priority: "Routine",
        stage: "Post-Scan Handling",
        room: "ROOM-X1",
        time: "09:30 AM",
        priorityFlag: "None",
        isolationStatus: "Normal",
        mlcFlag: false,
        safetyCheck: { completed: true, fasting: "N/A", pregnancy: "N/A", metalCleared: "N/A", consent: "N/A" },
        technician: "Tech Vinay",
        clinicalIndication: "Routine post-op pulmonary check",
        orderingPhysician: "Dr. Amit Verma",
        referringDoctor: "",
        referringHospital: "",
        billingStatus: "Cleared",
        transportRequirement: "Wheelchair",
        wardBed: "PVT-102",
        modalityId: "EQ-R4",
        checkInTime: "09:00 AM",
        prepCompleted: true,
        ivCannulated: false,
        scanLog: { technologistId: "Tech Vinay", imageQuality: "Adequate", radiationDose: "0.2 mGy", scanStartTime: Date.now() - 40 * 60 * 1000, scanEndTime: Date.now() - 35 * 60 * 1000 },
        contrastObs: null,
        postScanTransport: { wardNotifiedAt: Date.now() - 10 * 60 * 1000, wardAcknowledgedAt: null },
        billingReconciled: false
      }
    ];

    // Reporting Worklist
    window.state.risReportingQueue = window.state.risReportingQueue || [
      { reportId: "REP-RAD-101", visitId: "VIS-1005", name: "Meena Iyer", uhid: "SH-2026-04788", studyName: "X-Ray Chest PA View", priority: "Routine", status: "Pending Reporting", technician: "Tech Vinay", imagesCount: 1, findings: "", flag: "Normal", patientType: "IPD", orderingPhysician: "Dr. Amit Verma", referringDoctor: "" },
      { reportId: "REP-RAD-102", visitId: "VIS-1004", name: "Harpreet Singh", uhid: "SH-2026-04817", studyName: "CT Chest Contrast-Enhanced", priority: "STAT", status: "Pending Verification", technician: "Tech Preeti", imagesCount: 48, findings: "CT Scan demonstrates wedge-shaped segmental consolidation left lower lobe. Features suggestive of pulmonary infarction secondary to thromboembolism.", flag: "CRITICAL", patientType: "IPD", orderingPhysician: "Dr. Amit Verma", referringDoctor: "" }
    ];

    // Critical Findings Phone Callback co-sign register
    window.state.risCriticalCallLogs = window.state.risCriticalCallLogs || [];

    // MLC Image retention register
    window.state.risMlcRecords = window.state.risMlcRecords || [
      { mlcId: "MLC-001", visitId: "VIS-1003", name: "Vijay Singhal", uhid: "EXT-2026-8801", flaggedBy: "Co-ordinator Kavya", flaggedAt: "13-Jul-2026 11:15 AM", chainOfCustody: [{ time: "11:15 AM", action: "MLC Flagged at check-in", user: "Kavya" }], externalRequests: [] }
    ];

    // Report Delivery log
    window.state.risDeliveryLogs = window.state.risDeliveryLogs || [
      { deliveryId: "DLV-201", reportId: "REP-RAD-101", name: "Meena Iyer", patientType: "IPD", deliveryMode: "EMR Release", status: "Released", timestamp: "12-Jul-2026 02:30 PM", recipient: "Treating Team" }
    ];

    // QA Compliance Log (repeat/reject rates and peer review second reads)
    window.state.risQaLogs = window.state.risQaLogs || [
      { qaId: "QA-401", reportId: "REP-RAD-101", reviewer: "Dr. Ramesh Verma", date: "12-Jul-2026", agreement: "Concordant (Agree)", notes: "Chest expansion normal, no findings missed." }
    ];

    // Outsource / Film / Contrast Inventory
    window.state.risInventory = window.state.risInventory || [
      { name: "Omnipaque Contrast (100ml)", stock: 15, unit: "Vials", reorder: 20, status: "Low Stock" },
      { name: "Laser Imaging Film 14x17", stock: 120, unit: "Sheets", reorder: 100, status: "Good" },
      { name: "Ultrasound Gel (5L)", stock: 8, unit: "Cans", reorder: 5, status: "Good" }
    ];

    // System level alarms
    window.state.risCriticalAlarms = window.state.risCriticalAlarms || [
      { id: "ALM-301", name: "Harpreet Singh", uhid: "SH-2026-04817", finding: "Pulmonary infarction secondary to embolism", doctor: "Dr. Amit Verma", time: "11:30 AM", status: "Pending", patientType: "IPD", escalated: false }
    ];

    // Audit logs
    window.state.risAuditLogs = window.state.risAuditLogs || [
      { timestamp: "13-Jul-2026 09:15 AM", user: "Front Desk Kavya", action: "Appointment Booked", details: "Harpreet Singh CT Chest booked" }
    ];
  }

  window.views = window.views || {};
  window.views.radDashboard = function(container) {
    window.activeRisContainer = container;
    initRadState();

    const activeRole = window.state.activeUserRole || 'Radiology Technician';
    const activeTab = window.state.activeRisTab;

    const styles = `
      <style>
        .ris-container { font-family: 'Segoe UI', system-ui, sans-serif; color: #1e293b; background: #f8fafc; padding: 1.5rem; display: flex; flex-direction: column; gap: 1.5rem; width: 100% !important; max-width: 100% !important; box-sizing: border-box; }
        .ris-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #e2e8f0; padding-bottom: 1rem; }
        .ris-tab-bar { display: flex; gap: 4px; border-bottom: 1px solid #cbd5e1; margin-bottom: 0.5rem; }
        .ris-tab-btn { padding: 8px 16px; border: none; background: transparent; font-size: 0.8rem; font-weight: 700; color: #64748b; cursor: pointer; border-bottom: 2px solid transparent; }
        .ris-tab-btn.active { color: #2563eb; border-bottom-color: #2563eb; }
        .ris-card { background: #fff; border-radius: 12px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); overflow: hidden; display: flex; flex-direction: column; }
        .ris-card-header { background: #f1f5f9; padding: 0.85rem 1.25rem; font-weight: 700; font-size: 0.9rem; color: #1e3a8a; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; }
        .ris-card-body { padding: 1.25rem; display: flex; flex-direction: column; gap: 1rem; }
        .ris-kpi-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 1rem; }
        .ris-kpi-card { background: #fff; padding: 1.25rem; border-radius: 10px; border: 1px solid #e2e8f0; box-shadow: 0 2px 4px rgba(0,0,0,0.02); display: flex; flex-direction: column; align-items: center; justify-content: center; }
        .ris-kpi-val { font-size: 1.6rem; font-weight: 800; color: #1e3a8a; }
        .ris-kpi-label { font-size: 0.72rem; font-weight: 700; color: #64748b; margin-top: 4px; text-transform: uppercase; }
        .ris-grid-layout { display: grid; grid-template-columns: 1.35fr 1fr; gap: 1.5rem; }
        .ris-table { width: 100%; border-collapse: collapse; text-align: left; font-size: 0.78rem; }
        .ris-table th { background: #f8fafc; padding: 10px 14px; font-weight: 700; color: #475569; border-bottom: 1px solid #e2e8f0; }
        .ris-table td { padding: 12px 14px; border-bottom: 1px solid #f1f5f9; vertical-align: middle; }
        .badge-ris { padding: 2px 8px; border-radius: 20px; font-size: 0.68rem; font-weight: 700; display: inline-block; }
        .badge-ris-stat { background: #fee2e2; color: #dc2626; border: 1px solid #fca5a5; }
        .badge-ris-urgent { background: #fffbeb; color: #d97706; border: 1px solid #fcd34d; }
        .badge-ris-routine { background: #eff6ff; color: #2563eb; border: 1px solid #93c5fd; }
        .origin-badge { font-weight: 800; font-size: 0.65rem; padding: 1px 6px; border-radius: 4px; }
        .origin-ipd { background: #f3e8ff; color: #6b21a8; border: 1px solid #d8b4fe; }
        .origin-opd { background: #ecfdf5; color: #065f46; border: 1px solid #a7f3d0; }
        .origin-outside { background: #fff7ed; color: #9a3412; border: 1px solid #ffedd5; }
        .stepper-stage { font-weight: 800; font-size: 0.7rem; color: #475569; background: #e2e8f0; padding: 2px 8px; border-radius: 20px; }
        .stepper-active { background: #3b82f6; color: #fff; }
        .btn-ris-sm { font-size: 0.7rem; padding: 4px 10px; font-weight: 700; border-radius: 6px; cursor: pointer; border: 1px solid transparent; transition: all 0.15s; }
        .btn-ris-primary { background: #2563eb; color: #fff; border-color: #1d4ed8; }
        .btn-ris-primary:hover { background: #1d4ed8; }
        .btn-ris-secondary { background: #fff; color: #475569; border-color: #cbd5e1; }
        .btn-ris-secondary:hover { background: #f8fafc; border-color: #94a3b8; }
        .btn-ris-danger { background: #ef4444; color: #fff; border-color: #dc2626; }
        .btn-ris-danger:hover { background: #dc2626; }
        .ris-modal { position: fixed; inset: 0; background: rgba(15,23,42,0.6); backdrop-filter: blur(4px); display: none; align-items: center; justify-content: center; z-index: 9999; }
        .ris-modal-content { background: #fff; border-radius: 14px; width: 620px; max-width: 95%; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04); overflow: hidden; display: flex; flex-direction: column; }
        .dicom-tool-btn { font-size: 0.72rem; padding: 2px 6px; background: #334155; color: #fff; border: none; border-radius: 4px; cursor: pointer; }
        .dicom-tool-btn:hover { background: #475569; }
      </style>
    `;

    // Calculate dynamic KPI counts
    const activeCount = window.state.risQueue.length;
    const pendingReporting = window.state.risReportingQueue.filter(r => r.status === 'Pending Reporting').length;
    const awaitingSignOff = window.state.risReportingQueue.filter(r => r.status === 'Pending Verification').length;
    const criticalCount = window.state.risCriticalAlarms.filter(a => a.status === 'Pending').length + 
                          window.state.risReportingQueue.filter(r => r.flag === 'CRITICAL' && !window.state.risCriticalCallLogs.some(c => c.reportId === r.reportId)).length;

    // Render structural container
    container.innerHTML = `
      ${styles}
      <div class="ris-container">
        <!-- HEADER -->
        <div class="ris-header">
          <div>
            <h1 style="font-size: 1.3rem; font-weight: 800; color: #1e3a8a; margin: 0;">Radiology & RIS Command Center</h1>
            <div style="font-size: 0.78rem; color: #64748b; margin-top: 2px;">Indian Hospital NABL/AERB Compliance Standard · Patient Journey Workflow</div>
          </div>
          <div style="display: flex; gap: 12px; align-items: center; flex-wrap: wrap;">
            <!-- ROLE SELECTOR Dropdown for gate testing -->
            <div style="display: flex; align-items: center; gap: 6px; background: #fff; border: 1px solid #cbd5e1; padding: 4px 10px; border-radius: 8px;">
              <span style="font-size: 0.72rem; font-weight: 800; color: #475569; text-transform: uppercase;">Active Role:</span>
              <select style="font-size: 0.72rem; height: 22px; font-weight: 800; border: none; color: #1e40af; background: transparent; cursor: pointer; outline: none;" onchange="window.risChangeTestingRole(this.value)">
                <option value="Radiologist" ${activeRole === 'Radiologist' ? 'selected' : ''}>Radiologist</option>
                <option value="RIS Technologist/Radiographer" ${activeRole === 'RIS Technologist/Radiographer' ? 'selected' : ''}>RIS Technologist/Radiographer</option>
                <option value="Ward Nurse" ${activeRole === 'Ward Nurse' ? 'selected' : ''}>Ward Nurse</option>
                <option value="OPD Front Desk" ${activeRole === 'OPD Front Desk' ? 'selected' : ''}>OPD Front Desk</option>
                <option value="Outside Patient Registration Desk" ${activeRole === 'Outside Patient Registration Desk' ? 'selected' : ''}>Outside Patient Registration Desk</option>
                <option value="Radiology Coordinator" ${activeRole === 'Radiology Coordinator' ? 'selected' : ''}>Radiology Coordinator</option>
                <option value="Biomedical/Equipment Officer" ${activeRole === 'Biomedical/Equipment Officer' ? 'selected' : ''}>Biomedical Officer</option>
                <option value="Histopathologist" ${activeRole === 'Histopathologist' ? 'selected' : ''}>Histopathologist</option>
                <option value="Pathology Lead" ${activeRole === 'Pathology Lead' ? 'selected' : ''}>Pathology Lead</option>
                <option value="Super Admin" ${activeRole === 'Super Admin' ? 'selected' : ''}>Super Admin</option>
              </select>
            </div>
            
            <div class="admin-mono" style="font-size: 0.72rem; background: #EFF6FF; border: 1px solid #BFDBFE; padding: 6px 12px; border-radius: 6px; font-weight: bold; color: #1E40AF;">
              Active Scans: <span id="ris-active-count">${activeCount}</span> | NABL co-signed: <span style="color:#16a34a;">100%</span>
            </div>
            <button class="btn-ris-sm btn-ris-primary" onclick="window.risOpenBookingModal()">+ Book New Scan</button>
          </div>
        </div>

        <!-- TABS BAR -->
        <div class="ris-tab-bar">
          <button class="ris-tab-btn ${activeTab==='journey'?'active':''}" onclick="window.risSetTab('journey')">🗺️ Patient Journey Control Center</button>
          <button class="ris-tab-btn ${activeTab==='reporting'?'active':''}" onclick="window.risSetTab('reporting')">🩻 PACS reporting worklist</button>
          <button class="ris-tab-btn ${activeTab==='mlc'?'active':''}" onclick="window.risSetTab('mlc')">⚖️ Medico-Legal Cases (MLC) Register</button>
          <button class="ris-tab-btn ${activeTab==='quality'?'active':''}" onclick="window.risSetTab('quality')">📈 QA & Compliance Logs (AERB)</button>
        </div>

        <!-- DYNAMIC TAB RENDER -->
        ${window.risRenderTabContent(activeTab, activeRole, criticalCount, pendingReporting, awaitingSignOff)}
      </div>

      <!-- SAFETY SCREENING MODAL -->
      <div class="ris-modal" id="ris-safety-modal">
        <div class="ris-modal-content">
          <div class="ris-card-header" style="background:#1e3a8a; color:#fff;">
            <span>🛡️ Front-Loaded Safety screening checklist (Arrival Gate)</span>
            <span style="cursor:pointer; font-weight:bold; font-size:1.1rem;" onclick="window.risCloseSafetyPrep()">&times;</span>
          </div>
          <div class="ris-card-body" style="gap:14px; max-height:480px; overflow-y:auto;">
            <div id="ris-safety-patient-details" style="font-size:0.8rem; background:#f8fafc; padding:8px 12px; border-radius:6px; border:1px solid #e2e8f0; line-height:1.5;">
              Loading patient details...
            </div>
            
            <div id="ris-safety-modal-body" style="display:flex; flex-direction:column; gap:12px;">
              <!-- Dynamically populated gates -->
            </div>

            <div style="display:flex; justify-content:flex-end; gap:8px; border-top:1px solid #e2e8f0; padding-top:12px; margin-top:8px;">
              <button class="btn-ris-sm btn-ris-secondary" onclick="window.risCloseSafetyPrep()">Cancel</button>
              <button class="btn-ris-sm btn-ris-primary" onclick="window.risSaveSafetyPrep()">Save Pre-Screening clearance</button>
            </div>
          </div>
        </div>
      </div>

      <!-- PRE-SCAN PREPARATION DETAILS MODAL -->
      <div class="ris-modal" id="ris-prep-modal">
        <div class="ris-modal-content" style="width:480px;">
          <div class="ris-card-header" style="background:#0284c7; color:#fff;">
            <span>🔬 Pre-Scan Prep & Cannulation Log</span>
            <span style="cursor:pointer; font-weight:bold; font-size:1.1rem;" onclick="document.getElementById('ris-prep-modal').style.display='none'">&times;</span>
          </div>
          <div class="ris-card-body" style="gap:12px;">
            <div id="ris-prep-patient-details" style="font-size:0.78rem; font-weight:bold;"></div>
            <div class="form-group">
              <label style="display:block; font-size:0.75rem; font-weight:700;"><input type="checkbox" id="ris-prep-gown"> Gown Change & Metal Objects Removed *</label>
            </div>
            <div class="form-group">
              <label style="display:block; font-size:0.75rem; font-weight:700;"><input type="checkbox" id="ris-prep-iv" onchange="document.getElementById('ris-prep-iv-details').style.display = this.checked ? 'block' : 'none'"> Contrast IV Cannulation Required?</label>
              <div id="ris-prep-iv-details" style="display:none; margin-top:6px; padding-left:15px;">
                <input type="text" id="ris-prep-cannula-size" placeholder="Cannula size (e.g. 20G Pink) *" class="form-control" style="font-size:0.75rem; width:100%; box-sizing:border-box; padding:4px;">
              </div>
            </div>
            <div style="display:flex; justify-content:flex-end; gap:8px; border-top:1px solid #e2e8f0; padding-top:12px;">
              <button class="btn-ris-sm btn-ris-secondary" onclick="document.getElementById('ris-prep-modal').style.display='none'">Cancel</button>
              <button class="btn-ris-sm btn-ris-primary" onclick="window.risSubmitPreScanPrep()">Release to scan queue</button>
            </div>
          </div>
        </div>
      </div>

      <!-- SCAN EXECUTION COMPLIANCE MODAL -->
      <div class="ris-modal" id="ris-scan-modal">
        <div class="ris-modal-content" style="width:480px;">
          <div class="ris-card-header" style="background:#4f46e5; color:#fff;">
            <span>🩻 Execute Scan & Radiation Compliance Log (AERB)</span>
            <span style="cursor:pointer; font-weight:bold; font-size:1.1rem;" onclick="document.getElementById('ris-scan-modal').style.display='none'">&times;</span>
          </div>
          <div class="ris-card-body" style="gap:12px;">
            <div id="ris-scan-patient-details" style="font-size:0.78rem; font-weight:bold;"></div>
            
            <div class="form-group">
              <label style="font-size:0.75rem; font-weight:700; color:#475569;">Ionizing Radiation Dose delivered (mGy) *</label>
              <input type="text" id="ris-scan-dose" class="form-control" style="font-size:0.78rem; width:100%; box-sizing:border-box; padding:6px;" placeholder="e.g. 12.4">
            </div>

            <div class="form-group">
              <label style="font-size:0.75rem; font-weight:700; color:#475569;">Modality Image Quality check *</label>
              <select id="ris-scan-quality" class="form-control" style="font-size:0.78rem; width:100%; padding:6px;" onchange="document.getElementById('ris-scan-repeat-sec').style.display = this.value === 'Repeat Required' ? 'block' : 'none'">
                <option value="Adequate">Adequate quality (Cleared for PACS release)</option>
                <option value="Repeat Required">Repeat Scan Required (Technical Failure)</option>
              </select>
            </div>

            <div class="form-group" id="ris-scan-repeat-sec" style="display:none;">
              <label style="font-size:0.75rem; font-weight:700; color:#dc2626;">Repeat Scan Reason *</label>
              <input type="text" id="ris-scan-repeat-reason" class="form-control" style="font-size:0.78rem; width:100%; box-sizing:border-box; padding:6px;" placeholder="e.g. Motion artifact blur">
            </div>

            <div style="display:flex; justify-content:flex-end; gap:8px; border-top:1px solid #e2e8f0; padding-top:12px;">
              <button class="btn-ris-sm btn-ris-secondary" onclick="document.getElementById('ris-scan-modal').style.display='none'">Cancel</button>
              <button class="btn-ris-sm btn-ris-primary" style="background:#4f46e5;" onclick="window.risSubmitScanExecution()">Transmit scan to PACS</button>
            </div>
          </div>
        </div>
      </div>

      <!-- CONTRAST MONITORING MODAL -->
      <div class="ris-modal" id="ris-obs-modal">
        <div class="ris-modal-content" style="width:480px;">
          <div class="ris-card-header" style="background:#b45309; color:#fff;">
            <span>🧪 Contrast Observation Post-Scan Monitoring</span>
            <span style="cursor:pointer; font-weight:bold; font-size:1.1rem;" onclick="document.getElementById('ris-obs-modal').style.display='none'">&times;</span>
          </div>
          <div class="ris-card-body" style="gap:12px;">
            <div id="ris-obs-patient-details" style="font-size:0.78rem; font-weight:bold;"></div>
            
            <div style="background:#fffbeb; border:1px solid #fcd34d; padding:10px; border-radius:6px; font-size:0.72rem; line-height:1.4;">
              <strong>Observation Window Status:</strong> <span id="ris-obs-time-elapsed" style="font-weight:bold; color:#b45309;">Calculating...</span>
            </div>

            <div class="form-group">
              <label style="font-size:0.75rem; font-weight:700; color:#475569;">Contrast Adverse reaction noted? *</label>
              <select id="ris-obs-reaction" class="form-control" style="font-size:0.78rem; width:100%; padding:6px;" onchange="document.getElementById('ris-obs-reaction-details-sec').style.display = this.value === 'Yes' ? 'block' : 'none'">
                <option value="No">No adverse reaction (Normal)</option>
                <option value="Yes">Yes (Adverse reaction event)</option>
              </select>
            </div>

            <div class="form-group" id="ris-obs-reaction-details-sec" style="display:none;">
              <label style="font-size:0.75rem; font-weight:700; color:#dc2626;">Reaction Details *</label>
              <textarea id="ris-obs-reaction-details" class="form-control" rows="2" style="font-size:0.78rem; width:100%; box-sizing:border-box;" placeholder="e.g. Mild urticaria rash, antihistamine administered."></textarea>
            </div>

            <div style="border-top:1px dashed #cbd5e1; padding-top:6px; margin-top:4px;">
              <div style="font-size:0.7rem; font-weight:bold; color:#475569; margin-bottom:4px;">Early Discharge Override (Clinician co-sign)</div>
              <div style="display:grid; grid-template-columns:1fr 1fr; gap:6px;">
                <input type="text" id="ris-obs-override-officer" placeholder="Override Physician" class="form-control" style="font-size:0.75rem; padding:4px;">
                <input type="text" id="ris-obs-override-reason" placeholder="Medical Reason" class="form-control" style="font-size:0.75rem; padding:4px;">
              </div>
            </div>

            <div style="display:flex; justify-content:flex-end; gap:8px; border-top:1px solid #e2e8f0; padding-top:12px; margin-top:8px;">
              <button class="btn-ris-sm btn-ris-secondary" onclick="document.getElementById('ris-obs-modal').style.display='none'">Cancel</button>
              <button class="btn-ris-sm btn-ris-primary" style="background:#b45309;" onclick="window.risSubmitContrastObservation()">Discharge Patient from radiology</button>
            </div>
          </div>
        </div>
      </div>

      <!-- OVERRIDE CALIBRATION MODAL -->
      <div class="ris-modal" id="ris-override-modal">
        <div class="ris-modal-content" style="width:480px;">
          <div class="ris-card-header" style="background:#dc2626; color:#fff;">
            <span>🔧 Log Biomedical Equipment Override Gate</span>
            <span style="cursor:pointer; font-weight:bold; font-size:1.1rem;" onclick="document.getElementById('ris-override-modal').style.display='none'">&times;</span>
          </div>
          <div class="ris-card-body" style="gap:10px;">
            <div id="ris-override-machine-details" style="font-size:0.78rem; font-weight:bold; color:#374151;"></div>
            <div class="form-group">
              <label style="font-size:0.75rem; font-weight:700; color:#475569;">Biomedical Engineer Officer Name *</label>
              <input type="text" id="ris-override-officer" class="form-control" style="font-size:0.78rem; width:100%; box-sizing:border-box; padding:6px;" placeholder="e.g. Officer Vinod Kumar">
            </div>
            <div class="form-group">
              <label style="font-size:0.75rem; font-weight:700; color:#475569;">Clinical Override Justification *</label>
              <textarea id="ris-override-reason" class="form-control" rows="3" style="font-size:0.78rem; width:100%; box-sizing:border-box; padding:6px;" placeholder="e.g. Modality manually validated for emergency usage; official cert calibration scheduled tomorrow."></textarea>
            </div>
            <div style="display:flex; justify-content:flex-end; gap:8px; border-top:1px solid #e2e8f0; padding-top:12px; margin-top:8px;">
              <button class="btn-ris-sm btn-ris-secondary" onclick="document.getElementById('ris-override-modal').style.display='none'">Cancel</button>
              <button class="btn-ris-sm btn-ris-primary" style="background:#dc2626; border-color:#b91c1c;" onclick="window.risSubmitCalibrationOverride()">Log Override Gate</button>
            </div>
          </div>
        </div>
      </div>
    `;

    // Local state variables for PACS filters
    window.risPacsFilters = { bright: 0.9, contrast: 1.2, zoom: 1.0, invert: false };
    window.risActiveSafetyId = null;
    window.risActiveReportId = null;
    window.risActiveOverrideId = null;
    window.risActivePrepId = null;
    window.risActiveScanId = null;
    window.risActiveObsId = null;
  };

  // RENDER TABS CONTENT
  window.risRenderTabContent = function(tab, activeRole, criticalCount, pendingReporting, awaitingSignOff) {
    if (tab === 'journey') {
      return `
        <!-- MAIN LAYOUT -->
        <div class="ris-grid-layout" style="grid-template-columns: 4fr 1fr;">
          <!-- LEFT COLUMN: SCAN JOURNEY TRACKER -->
          <div style="display: flex; flex-direction: column; gap: 1.5rem;">
            <div class="ris-card">
              <div class="ris-card-header">
                <span>Radiology Active Patient Journey Control Center (Arrival to Handoff)</span>
                <span style="font-size: 0.7rem; color: #475569;">Token flow tracker</span>
              </div>
              <div class="ris-card-body" style="padding:0; overflow-x:auto;">
                <table class="ris-table">
                  <thead>
                    <tr>
                      <th>Token & Origin</th>
                      <th>Patient & Clinical Info</th>
                      <th>Scheduled Modality</th>
                      <th>Safety screening</th>
                      <th>Current Journey Stage</th>
                      <th style="text-align:right;">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${window.state.risQueue.map(q => {
                      const prioClass = q.priority === 'STAT' ? 'badge-ris-stat' : (q.priority === 'Urgent' ? 'badge-ris-urgent' : 'badge-ris-routine');
                      const originClass = q.patientType === 'IPD' ? 'origin-ipd' : (q.patientType === 'OPD' ? 'origin-opd' : 'origin-outside');
                      
                      // Safety screening cleared status
                      let screenStatus = '<span class="safety-flag-green">Cleared</span>';
                      if (!q.safetyCheck || !q.safetyCheck.completed) {
                        screenStatus = `<span class="safety-flag-pending" onclick="window.risOpenSafetyPrep('${q.studyId}')">⚠️ Pre-Screening</span>`;
                      }

                      // Dynamic Stepper highlight
                      const stages = ["Check-In", "Waiting Room", "Pre-Scan Prep", "Scan Acquisition", "Contrast Observation", "Post-Scan Handling"];
                      const currentIdx = stages.indexOf(q.stage);

                      // Display MLC flag next to patient
                      const mlcHtml = q.mlcFlag ? `<span class="badge-ris" style="background:#fee2e2; color:#b91c1c; font-size:0.65rem; border:1px solid #fca5a5; margin-left:4px;">⚖️ MLC Case</span>` : '';

                      // Priority Flags
                      const prioFlagHtml = q.priorityFlag && q.priorityFlag !== 'None' ? `<span class="badge-ris" style="background:#eff6ff; color:#1e40af; font-size:0.65rem; border:1px solid #bfdbfe; margin-left:4px;">🧑‍🦽 ${q.priorityFlag}</span>` : '';

                      // Isolation flags
                      const isolationHtml = q.isolationStatus && q.isolationStatus !== 'Normal' ? `<span class="badge-ris badge-ris-stat" style="font-size:0.65rem; margin-left:4px;">🚨 ${q.isolationStatus}</span>` : '';

                      // Direct clinical referral links
                      let linkHtml = '';
                      if (q.patientType === 'IPD') {
                        linkHtml = `<br><a href="#patients?uhid=${q.uhid}&tab=Clinical" style="font-size: 0.65rem; color:#6366f1; text-decoration:none; font-weight:700;">🔗 Originating IPD Consultation</a>`;
                      }

                      return `
                        <tr>
                          <td>
                            <div style="font-weight:800; font-size:0.85rem; color:#1e3a8a;">${q.tokenNumber || 'RAD-NEW'}</div>
                            <span class="origin-badge ${originClass}">${q.patientType}</span>
                          </td>
                          <td>
                            <div style="font-weight:700;">${q.name}${mlcHtml}${prioFlagHtml}${isolationHtml}</div>
                            <div style="font-size:0.7rem; color:#64748b;">${q.uhid} ${linkHtml}</div>
                            <div style="font-size:0.68rem; color:#475569; margin-top:2px;"><b>Indication:</b> ${q.clinicalIndication || 'Routine'}</div>
                          </td>
                          <td>
                            <b>${q.modality}</b> (${q.studyName})
                            <div style="font-size:0.65rem; color:#64748b;">Room: ${q.room} | Machine: ${q.modalityId}</div>
                          </td>
                          <td>${screenStatus}</td>
                          <td>
                            <span class="badge-ris" style="background:#e2e8f0; color:#475569; font-weight:bold; font-size:0.72rem;">${q.stage}</span>
                          </td>
                          <td style="text-align:right;">
                            <div style="display:flex; flex-direction:column; gap:4px; align-items:flex-end;">
                              ${window.risRenderJourneyActions(q)}
                            </div>
                          </td>
                        </tr>
                      `;
                    }).join('') || '<tr><td colspan="6" style="text-align:center; padding:20px; color:#64748b;">No active patient journeys.</td></tr>'}
                  </tbody>
                </table>
              </div>
            </div>

            <!-- DYNAMIC ACTIVE MONITORING OR DETAILS -->
            <div id="ris-journey-step-instructions" style="background:#EFF6FF; border:1px solid #BFDBFE; padding:12px; border-radius:8px; font-size:0.72rem; line-height:1.4; color:#1E40AF;">
              <strong>💡 Indian Hospital Radiology SOP Protocol:</strong><br>
              1. <strong>Pre-Screening Gate:</strong> Must be logged immediately at arrival/check-in to prevent scheduling delays at scan machines.<br>
              2. <strong>Contrast Observation:</strong> 15-30 minutes timed observation log is mandatory for contrast studies to audit adverse events.<br>
              3. <strong>MLC Imaging:</strong> med-legal cases follow custody lock (MLC register). Coordinator verification required for police/external release.
            </div>
          </div>

          <!-- RIGHT COLUMN: QUICK PANIC CALL ALARMS & INVENTORY -->
          <div style="display:flex; flex-direction:column; gap:1.5rem;">
            <!-- VERBAL CRITICAL PHONE CALLBACK REGISTER -->
            <div class="ris-card" style="border: 1px solid #fee2e2; box-shadow: 0 4px 10px rgba(220, 38, 38, 0.05);">
              <div class="ris-card-header" style="background:#fee2e2; border-bottom:1px solid #fca5a5; color:#dc2626;">
                <span>🚨 Verbal Critical Callback logs (NABH Audit)</span>
                <span class="badge-ris badge-ris-stat">${criticalCount} Pending</span>
              </div>
              <div class="ris-card-body" style="gap:10px;">
                <div style="font-size:0.7rem; color:#7f1d1d; line-height:1.3; background:#fff5f5; padding:8px; border-radius:6px; border:1px solid #fee2e2;">
                  ⚠️ <strong>NABH/NABL Critical Value Alert Standard:</strong> Every critical scan classification must be called to the treating physician verbally within 15 minutes of sign-off, co-signed with read-back co-sign confirmation.
                </div>
                
                <!-- Pending List -->
                <div style="display:flex; flex-direction:column; gap:6px; max-height:160px; overflow-y:auto; margin-bottom:8px;">
                  ${window.risRenderPendingCallbacks()}
                </div>

                <!-- Callback Log Form -->
                <div style="border-top:1px dashed #fca5a5; padding-top:8px; display:flex; flex-direction:column; gap:6px;">
                  <div style="font-size:0.7rem; font-weight:700; color:#374151;">Log outbound verbal callback co-sign:</div>
                  <div style="display:grid; grid-template-columns:1fr 1fr; gap:6px;">
                    <select id="ris-call-report-id" style="font-size:0.72rem; padding:4px;" class="form-control">
                      <option value="">-- Select Report --</option>
                      ${window.state.risReportingQueue.filter(r => r.flag === 'CRITICAL' && !window.state.risCriticalCallLogs.some(c => c.reportId === r.reportId)).map(r => `
                        <option value="${r.reportId}">${r.reportId} · ${r.name}</option>
                      `).join('')}
                    </select>
                    <input type="text" id="ris-call-recipient" placeholder="Recipient Clinician Name *" style="font-size:0.72rem; padding:4px;" class="form-control">
                  </div>
                  <div style="display:grid; grid-template-columns:1fr 1.2fr; gap:6px; align-items:center;">
                    <label style="font-size:0.68rem; font-weight:700; display:flex; align-items:center;"><input type="checkbox" id="ris-call-readback" checked style="margin-right:3px;"> Read-back Confirmed</label>
                    <button class="btn-ris-sm btn-ris-primary" style="background:#dc2626; border-color:#b91c1c; font-size:9px;" onclick="window.risSubmitVerbalCallback()">
                      ✓ Sign-off verbal co-sign
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- OUTSOURCED MATERIAL INVENTORY -->
            <div class="ris-card">
              <div class="ris-card-header">
                <span>Film, Contrast & USG Gel Inventory Status</span>
              </div>
              <div class="ris-card-body" style="padding:0;">
                <table class="ris-table">
                  <thead>
                    <tr>
                      <th>Material Item</th>
                      <th>Current stock</th>
                      <th>Reorder</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${window.state.risInventory.map(i => {
                      const stockStyle = i.stock <= i.reorder ? 'color:#dc2626; font-weight:bold;' : 'color:#16a34a; font-weight:bold;';
                      return `
                        <tr>
                          <td><b>${i.name}</b></td>
                          <td><span style="${stockStyle}">${i.stock} ${i.unit}</span></td>
                          <td class="mono">${i.reorder}</td>
                          <td><span class="badge-ris" style="${i.stock<=i.reorder ? 'background:#fee2e2; color:#dc2626;' : 'background:#ecfdf5; color:#16a34a;'}">${i.status}</span></td>
                        </tr>
                      `;
                    }).join('')}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      `;
    } else if (tab === 'reporting') {
      return `
        <!-- PACS VIEWER & STRUCTURAL REPORTING -->
        <div class="ris-grid-layout" style="grid-template-columns: 3fr 7fr;">
          
          <!-- LEFT COLUMN (30%): WORKLIST & DELIVERY LOGS -->
          <div style="display:flex; flex-direction:column; gap:1.5rem;">
            
            <!-- RADIOLOGIST WORKLIST -->
            <div class="ris-card">
              <div class="ris-card-header">
                <span>Radiologist Verification Worklist (STAT first)</span>
              </div>
              <div class="ris-card-body" style="padding:0; overflow-x:auto;">
                <table class="ris-table">
                  <thead>
                    <tr>
                      <th>Patient Info</th>
                      <th>Study</th>
                      <th style="text-align:right;">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${window.state.risReportingQueue.map(r => {
                      const prioClass = r.priority === 'STAT' ? 'badge-ris-stat' : (r.priority === 'Urgent' ? 'badge-ris-urgent' : 'badge-ris-routine');
                      return `
                        <tr>
                          <td>
                            <div style="font-weight:700;">${r.name}</div>
                            <div style="font-size:0.7rem; color:#64748b;">${r.uhid} <span class="badge-ris ${prioClass}">${r.priority}</span></div>
                          </td>
                          <td><b>${r.studyName}</b></td>
                          <td style="text-align:right;">
                            <button class="btn-ris-sm btn-ris-primary" style="font-size:9px; padding:2px 6px;" onclick="window.risLoadReportData('${r.reportId}')">
                              Load PACS
                            </button>
                          </td>
                        </tr>
                      `;
                    }).join('') || '<tr><td colspan="3" style="text-align:center; padding:15px; color:#64748b;">No spooled radiology studies waiting for reports.</td></tr>'}
                  </tbody>
                </table>
              </div>
            </div>

            <!-- REPORT DELIVERY LOGS & DICOM PEN-DRIVE EXPORTS -->
            <div class="ris-card">
              <div class="ris-card-header">
                <span>Report Delivery Logs & DICOM pen-drive exports</span>
              </div>
              <div class="ris-card-body" style="padding:0; overflow-x:auto;">
                <table class="ris-table">
                  <thead>
                    <tr>
                      <th>Patient Name & Origin</th>
                      <th>Channel</th>
                      <th style="text-align:right;">DICOM / Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${window.state.risDeliveryLogs.map(l => {
                      const statusStyle = l.status.includes("Cleared") || l.status.includes("Released") || l.status.includes("Delivered") ? 'color:#16a34a; font-weight:bold;' : 'color:#d97706; font-weight:bold;';
                      return `
                        <tr>
                          <td>
                            <div style="font-weight:700;">${l.name}</div>
                            <span class="origin-badge ${l.patientType==='IPD'?'origin-ipd':l.patientType==='OPD'?'origin-opd':'origin-outside'}" style="font-size: 0.65rem; padding: 1px 4px;">${l.patientType}</span>
                          </td>
                          <td><b>${l.deliveryMode}</b></td>
                          <td style="text-align:right;">
                            ${l.patientType==='Outside' && l.status.includes("Pending") ? `
                              <button class="btn-ris-sm btn-ris-primary" style="font-size:9px; padding:2px 6px;" onclick="window.risProcessOutsideDelivery('${l.deliveryId}')">
                                💿 DICOM Export
                              </button>
                            ` : `<span style="font-size:0.75rem; color:#64748b;">${l.timestamp}</span>`}
                          </td>
                        </tr>
                      `;
                    }).join('') || '<tr><td colspan="3" style="text-align:center; padding:10px; color:#64748b;">No delivery logs.</td></tr>'}
                  </tbody>
                </table>
              </div>
            </div>

          </div>

          <!-- RIGHT COLUMN (70%): PATIENT NAME ON TOP, PACS, & EDITOR -->
          <div style="display:flex; flex-direction:column; gap:1.5rem;">
            
            <!-- ACTIVE PATIENT NAME ON THE TOP -->
            <div id="ris-active-reporting-patient-header" style="background: #eff6ff; border: 1px solid #bfdbfe; padding: 12px 16px; border-radius: 8px; font-size: 0.95rem; font-weight: 800; color: #1e40af; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 2px 4px rgba(0,0,0,0.02);">
              <span>👤 Active Reporting Patient: <span id="ris-rep-patient-name" style="color: #2563eb;">No patient selected</span></span>
              <span id="ris-rep-patient-uhid-badge" style="font-size:0.75rem; background:#dbeafe; padding:2px 8px; border-radius:20px; color:#1e40af;">No UHID</span>
            </div>

            <!-- PACS WINDOW -->
            <div class="ris-card" style="background: #090d16; border-color: #1e293b; color: #94a3b8;">
              <div class="ris-card-header" style="background: #0f172a; border-bottom-color: #1e293b; color: #cbd5e1;">
                <span>DICOM PACS Image Viewer</span>
                <span id="ris-pacs-patient" style="font-size: 0.72rem; color: #38bdf8; font-weight:bold;">No scan loaded</span>
              </div>
              <div class="ris-card-body" style="align-items: center; justify-content: center; min-height: 260px; position:relative; overflow:hidden;">
                <div style="position:absolute; top:8px; left:8px; font-size:9px; line-height:1.4; color:#38bdf8;" id="ris-dicom-hud-left">
                  KV: 120 | mA: 250<br>
                  TE: 14ms | TR: 450ms<br>
                  Slice: 14/32
                </div>
                <div style="position:absolute; top:8px; right:8px; font-size:9px; text-align:right; line-height:1.4; color:#38bdf8;">
                  SARONIL IMAGING PACS v3.2<br>
                  NABL ACCREDITED LAB MC-9021
                </div>
                <div style="position:absolute; bottom:8px; left:8px; font-size:9px; color:#38bdf8;" id="ris-dicom-hud-filters">
                  ZOOM: 1.0x | CONTRAST: 1.2 | BRIGHT: 0.9
                </div>

                <!-- SCAN SVG -->
                <div id="ris-pacs-svg-container" style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; transition: all 0.2s;">
                  <svg id="ris-pacs-svg" width="220" height="220" viewBox="0 0 300 380" style="filter: contrast(1.2) brightness(0.9);">
                    <rect width="300" height="380" fill="#000"/>
                    <text x="50" y="190" fill="#475569" font-size="11" font-weight="bold">Select scan below to review PACS DICOM study</text>
                  </svg>
                </div>
              </div>
              <div style="display:flex; justify-content:space-between; align-items:center; background:#0f172a; padding:6px 12px; border-top:1px solid #1e293b;">
                <div style="display:flex; gap:4px;">
                  <button class="dicom-tool-btn" onclick="window.risAdjustPacs('bright', 0.1)">☀️ +</button>
                  <button class="dicom-tool-btn" onclick="window.risAdjustPacs('bright', -0.1)">🌙 -</button>
                  <button class="dicom-tool-btn" onclick="window.risAdjustPacs('contrast', 0.1)">➕ Contrast</button>
                  <button class="dicom-tool-btn" onclick="window.risAdjustPacs('contrast', -0.1)">➖ Contrast</button>
                  <button class="dicom-tool-btn" onclick="window.risAdjustPacs('zoom', 0.1)">🔍 Zoom</button>
                  <button class="dicom-tool-btn" onclick="window.risAdjustPacs('invert')">🔄 Invert</button>
                </div>
                <button class="btn-ris-sm btn-ris-danger" style="padding:2px 6px;" onclick="window.risResetPacs()">Reset</button>
              </div>
            </div>

            <!-- STRUCTURED REPORT WRITING & DIGITAL SIGN-OFF -->
            <div class="ris-card">
              <div class="ris-card-header" style="background:#f1f5f9;">
                <span>Structured reporting template editor & NABL co-sign</span>
              </div>
              <div class="ris-card-body" style="gap:12px;">
                <div class="form-group">
                  <label style="font-size:0.7rem; font-weight:700; color:#64748b; display:block; margin-bottom:4px;">Structured reporting templates</label>
                  <div style="display:flex; gap:6px;">
                    <button class="btn-ris-sm btn-ris-secondary" style="font-size:9px; padding:2px 6px;" onclick="window.risApplyTemplate('normal-chest')">Normal Chest X-Ray</button>
                    <button class="btn-ris-sm btn-ris-secondary" style="font-size:9px; padding:2px 6px;" onclick="window.risApplyTemplate('normal-brain')">Normal Brain CT</button>
                    <button class="btn-ris-sm btn-ris-secondary" style="font-size:9px; padding:2px 6px;" onclick="window.risApplyTemplate('abnormal-brain')">Subdural Hematoma CT</button>
                  </div>
                </div>

                <div class="form-group">
                  <label style="font-size:0.75rem; font-weight:700; color:#475569;">Diagnostic Findings & Impression</label>
                  <textarea class="form-control" rows="8" style="font-size:0.8rem; line-height:1.5; font-family:monospace; width:100%; box-sizing:border-box; padding:6px;" id="ris-report-findings" placeholder="Select scan from worklist to load PACS findings template..."></textarea>
                </div>

                <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px;">
                  <div class="form-group">
                    <label style="font-size:0.75rem; font-weight:700; color:#475569;">Scan Classification</label>
                    <select class="form-control" style="font-size:0.8rem; height:32px; width:100%;" id="ris-report-flag">
                      <option value="Normal">✓ Normal findings</option>
                      <option value="Abnormal">H - Abnormal Scan</option>
                      <option value="CRITICAL">⚠️ Critical Value / Panic Scan</option>
                    </select>
                  </div>
                  <div class="form-group">
                    <label style="font-size:0.75rem; font-weight:700; color:#475569;">Digital Sign-off Mode</label>
                    <select class="form-control" style="font-size:0.8rem; height:32px; width:100%;" id="ris-report-signmode">
                      <option>In-Person local console sign-off</option>
                      <option>Remote 2-Factor verified sign-off</option>
                      <option>OTP Verification verified</option>
                    </select>
                  </div>
                </div>

                <div style="display:flex; justify-content:space-between; margin-top:8px; border-top:1px solid #e2e8f0; padding-top:12px;">
                  <button class="btn-ris-sm btn-ris-danger" onclick="window.risRejectScanReport()">Reject & Rescan</button>
                  <button class="btn-ris-sm btn-ris-primary" style="padding:6px 16px; font-size:0.8rem; background-color:#16a34a;" onclick="window.risDigitallySignReport()">Digitally Sign & Release</button>
                </div>
              </div>
            </div>

          </div>
        </div>
      `;
    } else if (tab === 'mlc') {
      return `
        <!-- MLC REGISTER PANEL -->
        <div class="ris-card">
          <div class="ris-card-header" style="background:#fee2e2; color:#b91c1c;">
            <span>⚖️ Medico-Legal Cases (MLC) Imaging Chain-of-Custody Register</span>
            <span style="font-size:0.7rem; color:#b91c1c; font-weight:bold;">Statutory Retention Standard: Active Custody Lock</span>
          </div>
          <div class="ris-card-body" style="padding:0;">
            <table class="ris-table">
              <thead>
                <tr>
                  <th>MLC Record ID</th>
                  <th>Patient Detail</th>
                  <th>UHID</th>
                  <th>Flagged By & Date</th>
                  <th>Chain of Custody Access Log</th>
                  <th style="text-align:right;">Requisition Actions</th>
                </tr>
              </thead>
              <tbody>
                ${window.state.risMlcRecords.map(m => `
                  <tr>
                    <td class="mono"><b>${m.mlcId}</b></td>
                    <td><b>${m.name}</b></td>
                    <td class="mono">${m.uhid}</td>
                    <td>
                      <div>${m.flaggedBy}</div>
                      <div style="font-size:9px; color:#64748b;">${m.flaggedAt}</div>
                    </td>
                    <td>
                      <div style="font-size:9px; line-height:1.4; max-height:80px; overflow-y:auto; border:1px solid #cbd5e1; padding:4px; border-radius:4px; background:#f8fafc;">
                        ${m.chainOfCustody.map(c => `[${c.time}] ${c.action} by ${c.user}`).join('<br>')}
                      </div>
                    </td>
                    <td style="text-align:right;">
                      <div style="display:flex; flex-direction:column; gap:4px; align-items:flex-end;">
                        <button class="btn-ris-sm btn-ris-secondary" style="font-size:9px;" onclick="window.risLogCustodyAccess('${m.mlcId}')">🔑 Log Access</button>
                        <button class="btn-ris-sm btn-ris-primary" style="font-size:9px; background:#b91c1c; border-color:#991b1b;" onclick="window.risOpenMlcRequisition('${m.mlcId}')">
                          👮 Police Requisition Handoff
                        </button>
                      </div>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>

        <!-- REQUISITION POPUP SIMULATION -->
        <div id="mlc-requisition-form-card" class="ris-card" style="display:none; margin-top:1.5rem; border-color:#b91c1c;">
          <div class="ris-card-header" style="background:#fee2e2; color:#b91c1c;">
            <span>👮 Log MLC External Police Requisition Handoff</span>
          </div>
          <div class="ris-card-body" style="gap:10px;">
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
              <div>
                <label style="font-size:0.75rem; font-weight:700;">Officer Name & Designation *</label>
                <input type="text" id="mlc-req-officer" placeholder="e.g. Sub-Inspector Kumar" class="form-control" style="font-size:0.75rem; padding:6px; width:100%; box-sizing:border-box;">
              </div>
              <div>
                <label style="font-size:0.75rem; font-weight:700;">Police Station / Case Reference ID *</label>
                <input type="text" id="mlc-req-ref" placeholder="e.g. FIR-9912 / PS-Indiranagar" class="form-control" style="font-size:0.75rem; padding:6px; width:100%; box-sizing:border-box;">
              </div>
            </div>
            <div class="form-group">
              <label style="font-size:0.75rem; font-weight:700;">MLC Coordinator Approval Co-Sign Name *</label>
              <input type="text" id="mlc-req-cosign" placeholder="MLC coordinator co-sign name" class="form-control" style="font-size:0.75rem; padding:6px; width:100%; box-sizing:border-box;">
            </div>
            <div style="display:flex; justify-content:flex-end; gap:8px;">
              <button class="btn-ris-sm btn-ris-secondary" onclick="document.getElementById('mlc-requisition-form-card').style.display='none'">Cancel</button>
              <button class="btn-ris-sm btn-ris-primary" style="background:#b91c1c; border-color:#991b1b;" onclick="window.risSubmitMlcRequisition()">
                Verify and Release Films
              </button>
            </div>
          </div>
        </div>
      `;
    } else {
      // quality compliance
      return `
        <div style="display:grid; grid-template-columns:1fr 1.2fr; gap:1.5rem;">
          <!-- NABL PEER REVIEW / SECOND READ LOG -->
          <div class="ris-card">
            <div class="ris-card-header">
              <span>NABL Radiodiagnosis standard - Peer Review & Second-Read Log</span>
            </div>
            <div class="ris-card-body" style="display:flex; flex-direction:column; gap:10px;">
              <table class="ris-table">
                <thead>
                  <tr>
                    <th>Report ID</th>
                    <th>Reviewing Radiologist</th>
                    <th>Date</th>
                    <th>Review Agreement Status</th>
                    <th>Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  ${window.state.risQaLogs.map(q => `
                    <tr>
                      <td class="mono"><b>${q.reportId}</b></td>
                      <td><b>${q.reviewer}</b></td>
                      <td class="mono">${q.date}</td>
                      <td><span style="color:#16a34a; font-weight:bold;">${q.agreement}</span></td>
                      <td style="color:#64748b;">${q.notes}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
              <div style="border-top:1px solid #e2e8f0; padding-top:8px; display:flex; gap:6px; align-items:center;">
                <input type="text" id="ris-qa-report" placeholder="Report ID (e.g. REP-RAD-101)" style="font-size:0.72rem; padding:4px 8px; width:150px; border:1px solid #cbd5e1; border-radius:4px;">
                <select id="ris-qa-agreement" style="font-size:0.72rem; padding:4px; border:1px solid #cbd5e1; border-radius:4px;">
                  <option>Concordant (Agree)</option>
                  <option>Minor Discrepancy (Agree with correction)</option>
                  <option>Major Discrepancy (Disagree)</option>
                </select>
                <input type="text" id="ris-qa-notes" placeholder="Notes..." style="font-size:0.72rem; padding:4px 8px; flex:1; border:1px solid #cbd5e1; border-radius:4px;">
                <button class="btn-ris-sm btn-ris-primary" style="padding:4px 10px;" onclick="window.risSubmitPeerReview()">Log QA</button>
              </div>
            </div>
          </div>

          <!-- Modality Repeat/Reject Log (MIS Charts) -->
          <div class="ris-card">
            <div class="ris-card-header">
              <span>Radiology QA repeat/reject rate tracking</span>
              <span style="font-size:0.7rem; color:#64748b;">Target limit: <2%</span>
            </div>
            <div class="ris-card-body" style="flex-direction:row; gap:1.5rem; align-items:center; justify-content:center;">
              <div style="text-align:center;">
                <div style="font-size:2rem; font-weight:900; color:#16a34a;">1.15%</div>
                <div style="font-size:0.7rem; font-weight:bold; color:#64748b; text-transform:uppercase;">Overall Reject Rate</div>
              </div>
              <div style="flex:1; font-size:0.72rem; display:flex; flex-direction:column; gap:6px;">
                <div style="display:flex; justify-content:space-between;"><span>Chest X-Ray Repeats:</span><b>1.4% (Positioning error)</b></div>
                <div style="display:flex; justify-content:space-between;"><span>CT Scan Repeats:</span><b>0.8% (Motion artifact)</b></div>
                <div style="display:flex; justify-content:space-between;"><span>Ultrasound Repeats:</span><b>0.2% (Gas interference)</b></div>
                <div style="display:flex; justify-content:space-between;"><span>MRI Repeats:</span><b>0.5% (Metal artifact repeat)</b></div>
                <div style="border-top:1px dashed #cbd5e1; margin-top:4px; padding-top:4px; color:#475569;">
                  💡 <i>Total of <b>432 scans</b> checked this month. Quality indicators are compliant with NABH Radiodiagnosis standard guidelines.</i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- EQUIPMENT CALIBRATION PM REGISTRY -->
        <div class="ris-card" style="margin-top:1.5rem;">
          <div class="ris-card-header">
            <span>Modality Machine & Calibration Status (AERB Compliance)</span>
          </div>
          <div class="ris-card-body" style="padding:0;">
            <table class="ris-table">
              <thead>
                <tr>
                  <th>Modality Machine</th>
                  <th>Room ID</th>
                  <th>Type</th>
                  <th>PM Schedule</th>
                  <th>Calibration Status</th>
                  <th style="text-align:right;">Actions</th>
                </tr>
              </thead>
              <tbody>
                ${window.state.risEquipments.map(e => {
                  const calibClass = e.status === 'Calibrated' ? 'background:#d1fae5; color:#065f46;' : 'background:#fee2e2; color:#b91c1c; font-weight:800; border:1px solid #fca5a5;';
                  return `
                    <tr>
                      <td><b>${e.name}</b></td>
                      <td class="mono">${e.id}</td>
                      <td>${e.type}</td>
                      <td class="mono">${e.pmSchedule}</td>
                      <td>
                        <span class="badge-ris" style="${calibClass}">${e.status}</span>
                        ${e.override ? `<div style="font-size:9px; color:#16a34a; font-weight:bold; margin-top:2px;">Override Active by ${e.override.officer}</div>` : ''}
                      </td>
                      <td style="text-align:right;">
                        ${e.status === 'Calibration Due' ? `
                          <button class="btn-ris-sm btn-ris-secondary" style="color:#b91c1c;" onclick="window.risOpenCalibrationOverride('${e.id}')">
                            🔧 Override Gate
                          </button>
                        ` : '<span style="color:#64748b; font-size:0.7rem;">Calibrated</span>'}
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
  };

  // SET ACTIVE TAB
  window.risSetTab = function(tab) {
    window.state.activeRisTab = tab;
    window.views.radDashboard(window.activeRisContainer);
  };

  // DYNAMIC JOURNEY STEP-ACTIONS GENERATION
  window.risRenderJourneyActions = function(q) {
    // Stage A / B: Check-in & Pre-screening
    if (q.stage === 'Check-In') {
      return `
        <button class="btn-ris-sm btn-ris-primary" style="font-size:9px;" onclick="window.risOpenSafetyPrep('${q.studyId}')">
          📋 Safety Screening
        </button>
      `;
    }

    // Stage C: Waiting room management
    if (q.stage === 'Waiting Room') {
      const screenCleared = q.safetyCheck && q.safetyCheck.completed;
      return `
        <button class="btn-ris-sm btn-ris-primary" style="font-size:9px;" onclick="window.risOpenPreScanPrep('${q.studyId}')"
                ${!screenCleared ? 'disabled style="opacity:0.4; cursor:not-allowed;" title="Front-loaded safety screening must be cleared first"' : ''}>
          🚶 Call for Prep
        </button>
      `;
    }

    // Stage D: Pre-scan preparation
    if (q.stage === 'Pre-Scan Prep') {
      return `
        <button class="btn-ris-sm btn-ris-primary" style="font-size:9px; background:#0284c7; border-color:#0369a1;" onclick="window.risOpenPreScanPrep('${q.studyId}')">
          🔬 Gown & IV Cannulate
        </button>
      `;
    }

    // Stage E: Scan Acquisition
    if (q.stage === 'Scan Acquisition') {
      return `
        <button class="btn-ris-sm btn-ris-primary" style="font-size:9px; background:#4f46e5; border-color:#4338ca;" onclick="window.risOpenScanExecution('${q.studyId}')">
          🩻 Execute Scan
        </button>
      `;
    }

    // Stage F: Contrast Observation
    if (q.stage === 'Contrast Observation') {
      return `
        <button class="btn-ris-sm btn-ris-primary" style="font-size:9px; background:#b45309; border-color:#92400e;" onclick="window.risOpenContrastObservation('${q.studyId}')">
          🧪 Monitor Reaction
        </button>
      `;
    }

    // Stage G: Post Scan transport co-signing and delivery routing
    if (q.stage === 'Post-Scan Handling') {
      if (q.patientType === 'IPD') {
        const trans = q.postScanTransport;
        if (!trans || !trans.wardNotifiedAt) {
          return `
            <button class="btn-ris-sm btn-ris-primary" style="font-size:9px;" onclick="window.risNotifyWardTransport('${q.studyId}')">
              🚗 Notify Ward Transport
            </button>
          `;
        } else if (!trans.wardAcknowledgedAt) {
          return `
            <div style="font-size:0.68rem; color:#d97706; font-weight:bold; margin-bottom:4px;">Notified: Ward A (Awaiting Ward nurse acknowledgment)</div>
            <button class="btn-ris-sm btn-ris-secondary" style="font-size:9px;" onclick="window.risAcknowledgeWardTransport('${q.studyId}')">
              ✓ Co-sign Ward Acknowledged
            </button>
          `;
        }
      }

      // Reconcile billing prior to final discharge
      return `
        <button class="btn-ris-sm btn-ris-primary" style="font-size:9px; background:#16a34a; border-color:#15803d;" onclick="window.risFinalizeJourneyReconciliation('${q.studyId}')">
          💵 Finalize Billing & Discharge
        </button>
      `;
    }

    return `<span style="font-size:0.7rem; color:#16a34a; font-weight:bold;">✓ Completed</span>`;
  };

  // ARRIVE / CHECK-IN PATIENT
  window.risArrivePatient = function(studyId) {
    const item = window.state.risQueue.find(q => q.studyId === studyId);
    if (item) {
      item.stage = "Waiting Room";
      window.state.risAuditLogs.unshift({
        timestamp: new Date().toLocaleTimeString('en-IN') + ' ' + new Date().toLocaleDateString('en-IN'),
        user: window.state.activeUserRole || "Receptionist",
        action: "Check-in completed",
        details: `${item.name} checked in and token issued.`
      });
      window.views.radDashboard(window.activeRisContainer);
    }
  };

  // OPEN DEDICATED BOOKING PAGE WITH BACK BUTTON
  window.risOpenBookingModal = function() {
    const container = window.activeRisContainer;
    
    container.innerHTML = `
      <div class="ris-container" style="width: 100% !important; max-width: 100% !important; box-sizing: border-box; padding: 1.5rem; background: transparent;">
        <!-- Heading and Back button in the same row, NO background color -->
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; padding-bottom: 1rem; border-bottom: 1px solid #cbd5e1;">
          <div>
            <h2 style="margin: 0; font-size: 1.35rem; font-weight: 800; color: #1e3a8a; display: flex; align-items: center; gap: 8px;">
              📅 Book New Radiology Scan & Intake Routing
            </h2>
            <p style="margin: 4px 0 0; font-size: 0.75rem; color: #475569;">Routing patient origins (IPD / OPD / Outside) with safety, prescription upload, and maternal ID validation gates.</p>
          </div>
          <button class="btn-ris-sm btn-ris-secondary" onclick="window.views.radDashboard(window.activeRisContainer)" style="display: inline-flex; align-items: center; gap: 6px; font-size: 0.8rem; padding: 8px 16px; border-radius: 8px; font-weight:700; border: 1px solid #cbd5e1; box-shadow: 0 1px 2px rgba(0,0,0,0.05);">
            ← Back to RIS Command Center
          </button>
        </div>

        <div class="ris-card" style="width: 100% !important; max-width: 100% !important; box-sizing: border-box; border: 1px solid #cbd5e1; box-shadow: 0 10px 30px rgba(0,0,0,0.06); border-radius:14px; background:#fff;">
          <div class="ris-card-body" style="padding: 1.5rem; display: flex; flex-direction: column; gap: 1.25rem;">
            
            <!-- MAIN FIELDS IN 3 COLUMNS -->
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.25rem; align-items: start;">
              
              <div class="form-group" style="grid-column: span 3;">
                <label style="font-size: 0.8rem; font-weight: 700; color: #374151; display: block; margin-bottom: 6px;">Patient Origin (Patient Type) *</label>
                <select id="ris-book-type" class="form-control" style="font-size: 0.8rem; width: 100%; padding: 8px; border: 1px solid #cbd5e1; border-radius: 8px; outline:none;" onchange="window.risOnBookingTypeChange(this.value)">
                  <option value="IPD">Inpatient (IPD) - Active Admitted Patients</option>
                  <option value="OPD">Outpatient (OPD) - Registered Clinic Patients</option>
                  <option value="Outside">Outside Referral (External Patient Registration)</option>
                </select>
              </div>

              <!-- Clinical Indication placed before dynamic sections and upload prescription fields -->
              <div class="form-group" style="grid-column: span 3;">
                <label style="font-size: 0.8rem; font-weight: 700; color: #374151; display: block; margin-bottom: 6px;">Clinical Indication * (Mandatory)</label>
                <input type="text" id="ris-book-indication" class="form-control" style="font-size: 0.8rem; width: 100%; box-sizing: border-box; padding: 8px 10px; border: 1px solid #cbd5e1; border-radius: 8px; outline:none;" placeholder="Describe symptoms/reason for radiology study...">
              </div>

              <!-- DYNAMIC SECTIONS BY PATIENT ORIGIN (IPD / OPD / Outside) -->
              <!-- IPD: 3 Columns Grid -->
              <div id="ris-book-ipd-sec" style="display: grid; grid-column: span 3; grid-template-columns: repeat(3, 1fr); gap: 1.25rem;">
                <div class="form-group" style="position: relative;">
                  <label style="font-size: 0.8rem; font-weight: 700; color: #374151; display: block; margin-bottom: 6px;">Select Admitted Patient *</label>
                  <input type="text" id="ris-book-ipd-patient-search" class="form-control" placeholder="Search admitted patient..." onfocus="window.risSearchPatients('IPD', this.value)" oninput="window.risSearchPatients('IPD', this.value)" onblur="setTimeout(() => { document.getElementById('ris-book-ipd-suggestions').style.display = 'none'; }, 200)" style="font-size: 0.8rem; width: 100%; padding: 8px; border: 1px solid #cbd5e1; border-radius: 8px; outline:none;" autocomplete="off">
                  <input type="hidden" id="ris-book-ipd-patient" value="">
                  <div id="ris-book-ipd-suggestions" style="position: absolute; top: 100%; left: 0; right: 0; background: white; border: 1px solid #cbd5e1; border-radius: 8px; max-height: 180px; overflow-y: auto; z-index: 999; display: none; box-shadow: 0 4px 6px rgba(0,0,0,0.1);"></div>
                </div>
                <div class="form-group">
                  <label style="font-size: 0.8rem; font-weight: 700; color: #374151; display: block; margin-bottom: 6px;">IPD Transport Requirement *</label>
                  <select id="ris-book-ipd-transport" class="form-control" style="font-size: 0.8rem; width: 100%; padding: 8px; border: 1px solid #cbd5e1; border-radius: 8px; outline:none;">
                    <option>Ambulatory</option>
                    <option>Wheelchair</option>
                    <option>Stretcher</option>
                    <option>Bed-bound with oxygen monitor</option>
                  </select>
                </div>
                <div class="form-group">
                  <label style="font-size: 0.8rem; font-weight: 700; color: #374151; display: block; margin-bottom: 6px;">Isolation / Infection Precaution *</label>
                  <select id="ris-book-ipd-isolation" class="form-control" style="font-size: 0.8rem; width: 100%; padding: 8px; border: 1px solid #cbd5e1; border-radius: 8px; outline:none;">
                    <option value="Normal">Normal Precaution</option>
                    <option value="Contact Isolation (Infection Precaution)">Contact Isolation</option>
                    <option value="Airborne Isolation (Infection Precaution)">Airborne Isolation</option>
                  </select>
                </div>
              </div>

              <!-- OPD: 3 Columns Grid -->
              <div id="ris-book-opd-sec" style="display: none; grid-column: span 3; grid-template-columns: repeat(3, 1fr); gap: 1.25rem;">
                <div class="form-group" style="position: relative;">
                  <label style="font-size: 0.8rem; font-weight: 700; color: #374151; display: block; margin-bottom: 6px;">Select OPD Patient *</label>
                  <input type="text" id="ris-book-opd-patient-search" class="form-control" placeholder="Search registered clinic patient by name or UHID..." onfocus="window.risSearchPatients('OPD', this.value)" oninput="window.risSearchPatients('OPD', this.value)" onblur="setTimeout(() => { document.getElementById('ris-book-opd-suggestions').style.display = 'none'; }, 200)" style="font-size: 0.8rem; width: 100%; padding: 8px; border: 1px solid #cbd5e1; border-radius: 8px; outline:none;" autocomplete="off">
                  <input type="hidden" id="ris-book-opd-patient" value="">
                  <div id="ris-book-opd-suggestions" style="position: absolute; top: 100%; left: 0; right: 0; background: white; border: 1px solid #cbd5e1; border-radius: 8px; max-height: 180px; overflow-y: auto; z-index: 999; display: none; box-shadow: 0 4px 6px rgba(0,0,0,0.1);"></div>
                </div>
                <div class="form-group">
                  <label style="font-size: 0.8rem; font-weight: 700; color: #374151; display: block; margin-bottom: 6px;">Payment / Billing Status * (Upfront Required)</label>
                  <select id="ris-book-opd-billing" class="form-control" style="font-size: 0.8rem; width: 100%; padding: 8px; border: 1px solid #cbd5e1; border-radius: 8px; outline:none;">
                    <option value="Cleared">Cleared / Paid at Front Desk</option>
                    <option value="TPA Pre-Auth">TPA Pre-Authorized</option>
                    <option value="Pending">Pending Payment (Blocks Booking)</option>
                  </select>
                </div>
                <div class="form-group">
                  <label style="font-size: 0.8rem; font-weight: 700; color: #374151; display: block; margin-bottom: 6px;">SMS / Call Prep Sent *</label>
                  <select id="ris-book-opd-sms" class="form-control" style="font-size: 0.8rem; width: 100%; padding: 8px; border: 1px solid #cbd5e1; border-radius: 8px; outline:none;">
                    <option>Yes (Confirmed compliance)</option>
                    <option>Sent (Pending reconfirmation)</option>
                  </select>
                </div>
                <div class="form-group" style="grid-column: span 3;">
                  <label style="font-size: 0.8rem; font-weight: 700; color: #374151; display: block; margin-bottom: 6px;">Upload Doctor's Prescription * (Mandatory for OPD)</label>
                  <input type="file" id="ris-book-opd-prescription" class="form-control" style="font-size:0.8rem; padding:6px; border:1px solid #cbd5e1; border-radius:8px; outline:none; background:#fff; width:100%; box-sizing:border-box;">
                </div>
              </div>

              <!-- Outside: 3 Columns Grid -->
              <div id="ris-book-outside-sec" style="display: none; grid-column: span 3; grid-template-columns: repeat(3, 1fr); gap: 1.25rem; background: #f8fafc; padding: 1.25rem; border-radius: 10px; border: 1px solid #cbd5e1;">
                <div style="font-size: 0.75rem; font-weight: 800; color: #1e40af; text-transform: uppercase; grid-column: span 3; margin-bottom: 4px;">Lightweight External Patient Record</div>
                <div class="form-group">
                  <label style="font-size: 0.75rem; font-weight:700; color:#475569; display:block; margin-bottom:4px;">Patient Name *</label>
                  <input type="text" id="ris-book-ext-name" placeholder="Enter Patient Name" style="font-size: 0.8rem; padding: 8px; border: 1px solid #cbd5e1; border-radius: 8px; width: 100%; box-sizing: border-box; outline:none;">
                </div>
                <div class="form-group">
                  <label style="font-size: 0.75rem; font-weight:700; color:#475569; display:block; margin-bottom:4px;">Contact Mobile *</label>
                  <input type="text" id="ris-book-ext-contact" placeholder="Enter Mobile Number" style="font-size: 0.8rem; padding: 8px; border: 1px solid #cbd5e1; border-radius: 8px; width: 100%; box-sizing: border-box; outline:none;">
                </div>
                <div class="form-group">
                  <label style="font-size: 0.75rem; font-weight:700; color:#475569; display:block; margin-bottom:4px;">Referring Doctor *</label>
                  <input type="text" id="ris-book-ext-doc" placeholder="Referring Physician" style="font-size: 0.8rem; padding: 8px; border: 1px solid #cbd5e1; border-radius: 8px; width: 100%; box-sizing: border-box; outline:none;">
                </div>
                <div class="form-group">
                  <label style="font-size: 0.75rem; font-weight:700; color:#475569; display:block; margin-bottom:4px;">Referring Hospital *</label>
                  <input type="text" id="ris-book-ext-hosp" placeholder="Referring Clinic/Hospital" style="font-size: 0.8rem; padding: 8px; border: 1px solid #cbd5e1; border-radius: 8px; width: 100%; box-sizing: border-box; outline:none;">
                </div>
                <div class="form-group">
                  <label style="font-size: 0.75rem; font-weight:700; color:#475569; display:block; margin-bottom:4px;">Referral Reference ID</label>
                  <input type="text" id="ris-book-ext-ref" placeholder="Referral ID" style="font-size: 0.8rem; padding: 8px; border: 1px solid #cbd5e1; border-radius: 8px; width: 100%; box-sizing: border-box; outline:none;">
                </div>
                <div class="form-group">
                  <label style="font-size: 0.75rem; font-weight:700; color:#475569; display:block; margin-bottom:4px;">Payment / Billing Status * (Upfront Required)</label>
                  <select id="ris-book-ext-billing" style="font-size: 0.8rem; padding: 8px; border: 1px solid #cbd5e1; border-radius: 8px; width: 100%; outline:none;">
                    <option value="Cleared">Upfront Counter Payment Collected (Exempt Diagnostic GST verified)</option>
                    <option value="Pending">Pending Payment (Blocks Booking)</option>
                  </select>
                </div>
                <div class="form-group" style="grid-column: span 3;">
                  <label style="font-size: 0.8rem; font-weight: 700; color: #374151; display: block; margin-bottom: 6px;">Upload Scan Prescription * (Mandatory for External)</label>
                  <input type="file" id="ris-book-ext-prescription" class="form-control" style="font-size:0.8rem; padding:6px; border:1px solid #cbd5e1; border-radius:8px; outline:none; background:#fff; width:100%; box-sizing:border-box;">
                </div>
              </div>

              <div style="border-top: 1px dashed #cbd5e1; grid-column: span 3; margin: 0.5rem 0;"></div>

              <!-- MANDATORY SCAN DETAILS: 3 Columns Grid -->
              <div class="form-group">
                <label style="font-size: 0.8rem; font-weight: 700; color: #374151; display: block; margin-bottom: 6px;">Modality Procedure *</label>
                <select id="ris-book-procedure" class="form-control" style="font-size: 0.8rem; width: 100%; padding: 8px; border: 1px solid #cbd5e1; border-radius: 8px; outline:none;" onchange="window.risOnBookingProcedureChange(this.value)">
                  ${window.state.risTestMaster.map(t => `
                    <option value="${t.code}">${t.modality} · ${t.name} (Rs. ${t.price})</option>
                  `).join('')}
                </select>
              </div>

              <div class="form-group">
                <label style="font-size: 0.8rem; font-weight: 700; color: #374151; display: block; margin-bottom: 6px;">Target Modality Machine *</label>
                <select id="ris-book-machine" class="form-control" style="font-size: 0.8rem; width: 100%; padding: 8px; border: 1px solid #cbd5e1; border-radius: 8px; outline:none;">
                  ${window.state.risEquipments.map(e => {
                    const statusText = e.status === 'Calibration Due' && !e.override ? ' ⚠️ Calibration Due (Block)' : '';
                    return `<option value="${e.id}">${e.name}${statusText}</option>`;
                  }).join('')}
                </select>
              </div>

              <div class="form-group">
                <label style="font-size: 0.8rem; font-weight: 700; color: #374151; display: block; margin-bottom: 6px;">Scheduled Time</label>
                <input type="text" id="ris-book-time" class="form-control" style="font-size: 0.8rem; width: 100%; box-sizing: border-box; padding: 8px 10px; border: 1px solid #cbd5e1; border-radius: 8px; outline:none;" value="12:00 PM">
              </div>

              <div class="form-group">
                <label style="font-size: 0.8rem; font-weight: 700; color: #374151; display: block; margin-bottom: 6px;">Priority</label>
                <select id="ris-book-priority" class="form-control" style="font-size: 0.8rem; width: 100%; padding: 8px; border: 1px solid #cbd5e1; border-radius: 8px; outline:none;">
                  <option>Routine</option>
                  <option>Urgent</option>
                  <option>STAT</option>
                </select>
              </div>

              <div class="form-group">
                <label style="font-size: 0.8rem; font-weight: 700; color: #374151; display: block; margin-bottom: 6px;">Technician Assigned</label>
                <input type="text" id="ris-book-tech" class="form-control" style="font-size: 0.8rem; width: 100%; box-sizing: border-box; padding: 8px 10px; border: 1px solid #cbd5e1; border-radius: 8px; outline:none;" value="Tech Suresh">
              </div>

              <div class="form-group">
                <label style="font-size: 0.8rem; font-weight:700; color:#374151; display:block; margin-bottom:6px;">Special Patient Priorities</label>
                <select id="ris-book-priority-flag" class="form-control" style="font-size: 0.8rem; width:100%; padding:8px; border: 1px solid #cbd5e1; border-radius: 8px;">
                  <option value="None">None</option>
                  <option value="Elderly">Elderly Patient</option>
                  <option value="Wheelchair-bound">Wheelchair bound</option>
                  <option value="Pediatric">Pediatric</option>
                </select>
              </div>

              <!-- MOTHER ULTRASOUND GOVERNMENT ID GATE (PCPNDT compliance check) -->
              <div class="form-group" style="background:#fffbeb; border:1px solid #fcd34d; padding:12px; border-radius:8px; display:flex; flex-direction:column; gap:8px; grid-column: span 3;">
                <label style="font-size:0.8rem; font-weight:700; color:#b45309; display:flex; align-items:center; margin:0; cursor:pointer;">
                  <input type="checkbox" id="ris-book-pndt-check" style="margin-right:6px;" onchange="document.getElementById('ris-book-pndt-sec').style.display = this.checked ? 'grid' : 'none'"> Is Antenatal / Mother Scan before delivery? (PCPNDT Act Compliance Check)
                </label>
                <div id="ris-book-pndt-sec" style="display:none; margin-top:4px; grid-template-columns: repeat(2, 1fr); gap: 1rem;">
                  <div>
                    <label style="font-size:0.8rem; font-weight:700; color:#374151; display:block; margin-bottom:4px;">Mother's Government ID Number * (Aadhaar / Voter Card / PAN for Form F)</label>
                    <input type="text" id="ris-book-gov-id" class="form-control" placeholder="Enter Government ID Number (Mandatory)" style="font-size: 0.8rem; padding: 8px 10px; border: 1px solid #cbd5e1; border-radius: 8px; outline:none; width:100%; box-sizing:border-box;">
                  </div>
                  <div>
                    <label style="font-size:0.8rem; font-weight:700; color:#374151; display:block; margin-bottom:4px;">Upload Government ID Copy * (Image / PDF)</label>
                    <input type="file" id="ris-book-gov-id-file" class="form-control" style="font-size: 0.8rem; padding: 6px; border: 1px solid #cbd5e1; border-radius: 8px; outline:none; width:100%; box-sizing:border-box; background:#fff;">
                  </div>
                </div>
              </div>

              <div class="form-group" style="display:flex; align-items:center; grid-column: span 3;">
                <label style="font-size:0.8rem; font-weight:700; color:#b91c1c; display:flex; align-items:center; cursor:pointer; margin:0;">
                  <input type="checkbox" id="ris-book-mlc" style="margin-right:5px;"> Flag Medico-Legal Case (MLC)
                </label>
              </div>

            </div>

            <div style="display: flex; justify-content: flex-end; gap: 10px; border-top: 1px solid #e2e8f0; padding-top: 1.25rem; margin-top: 0.5rem;">
              <button class="btn-ris-sm btn-ris-secondary" style="padding: 8px 18px; font-size: 0.8rem;" onclick="window.views.radDashboard(window.activeRisContainer)">Cancel</button>
              <button class="btn-ris-sm btn-ris-primary" style="padding: 8px 22px; font-size: 0.8rem;" onclick="window.risSubmitBooking()">Confirm Booking & Route</button>
            </div>
          </div>
        </div>
      </div>
    `;
  };

  window.risCloseBookingModal = function() {
    window.state.activeRisTab = 'journey';
    window.views.radDashboard(window.activeRisContainer);
  };

  window.risOnBookingTypeChange = function(type) {
    document.getElementById('ris-book-ipd-sec').style.display = type === 'IPD' ? 'grid' : 'none';
    document.getElementById('ris-book-opd-sec').style.display = type === 'OPD' ? 'grid' : 'none';
    document.getElementById('ris-book-outside-sec').style.display = type === 'Outside' ? 'grid' : 'none';
  };

  window.risOnBookingProcedureChange = function(code) {
    const test = window.state.risTestMaster.find(t => t.code === code);
    if (test) {
      // Auto select appropriate machine
      const equip = window.state.risEquipments.find(e => e.type === test.modality);
      if (equip) {
        document.getElementById('ris-book-machine').value = equip.id;
      }
    }
  };

  // SUGGESTIVE SEARCH FOR PATIENTS
  window.risSearchPatients = function(type, query) {
    const suggestionsDiv = document.getElementById(type === 'IPD' ? 'ris-book-ipd-suggestions' : 'ris-book-opd-suggestions');
    if (!suggestionsDiv) return;

    const cleanQuery = query ? query.trim() : '';
    const isDefaultList = !cleanQuery;
    
    const list = window.state.patients.filter(p => {
      const isCorrectType = type === 'IPD' ? p.type === 'IPD' : p.type !== 'IPD';
      if (isDefaultList) return isCorrectType;
      return isCorrectType && (p.name.toLowerCase().includes(cleanQuery.toLowerCase()) || p.uhid.toLowerCase().includes(cleanQuery.toLowerCase()));
    }).slice(0, 6);

    if (list.length === 0) {
      suggestionsDiv.style.display = 'block';
      suggestionsDiv.innerHTML = `<div style="padding: 8px; color: #64748b; font-size: 0.75rem;">No matching patients found</div>`;
      return;
    }

    suggestionsDiv.style.display = 'block';
    suggestionsDiv.innerHTML = list.map(p => {
      const extraLabel = type === 'IPD' ? ` - ${p.ward || 'General Ward'}` : '';
      return `
        <div style="padding: 8px 12px; cursor: pointer; font-size: 0.78rem; border-bottom: 1px solid #f1f5f9; display: flex; justify-content: space-between; align-items: center;"
             onclick="window.risSelectPatient('${type}', '${p.uhid}', '${p.name.replace(/'/g, "\\'")}')"
             onmouseover="this.style.background='#f1f5f9'"
             onmouseout="this.style.background='#fff'">
          <div>
            <strong>${p.name}</strong> (${p.uhid})
          </div>
          <div style="font-size: 0.7rem; color: #64748b;">${extraLabel}</div>
        </div>
      `;
    }).join('');
  };

  window.risSelectPatient = function(type, uhid, name) {
    const inputSearch = document.getElementById(type === 'IPD' ? 'ris-book-ipd-patient-search' : 'ris-book-opd-patient-search');
    const inputHidden = document.getElementById(type === 'IPD' ? 'ris-book-ipd-patient' : 'ris-book-opd-patient');
    const suggestionsDiv = document.getElementById(type === 'IPD' ? 'ris-book-ipd-suggestions' : 'ris-book-opd-suggestions');

    if (inputSearch && inputHidden && suggestionsDiv) {
      inputSearch.value = `${name} (${uhid})`;
      inputHidden.value = uhid;
      suggestionsDiv.style.display = 'none';
      suggestionsDiv.innerHTML = '';
    }
  };

  // SUBMIT SCAN BOOKING
  window.risSubmitBooking = function() {
    const origin = document.getElementById('ris-book-type').value;
    const procCode = document.getElementById('ris-book-procedure').value;
    const machineId = document.getElementById('ris-book-machine').value;
    const indication = document.getElementById('ris-book-indication').value.trim();
    const priority = document.getElementById('ris-book-priority').value;
    const schTime = document.getElementById('ris-book-time').value;
    const assignedTech = document.getElementById('ris-book-tech').value;
    const priorityFlag = document.getElementById('ris-book-priority-flag').value;
    const mlcFlag = document.getElementById('ris-book-mlc').checked;

    if (!indication) {
      alert("Clinical Indication is a mandatory field for all radiology scan bookings.");
      return;
    }

    const test = window.state.risTestMaster.find(t => t.code === procCode);
    const machine = window.state.risEquipments.find(e => e.id === machineId);

    // Enforce Modality Calibration Gate during scheduling
    if (machine && machine.status === 'Calibration Due' && !machine.override) {
      alert(`Cannot schedule: Target modality machine "${machine.name}" is currently flagged as "Calibration Due". Choose another machine or log a Biomedical Engineering override gate override first.`);
      return;
    }

    // PCPNDT Mother Scan Gov ID check
    const isPndt = document.getElementById('ris-book-pndt-check').checked;
    const govId = document.getElementById('ris-book-gov-id').value.trim();
    const govIdFile = document.getElementById('ris-book-gov-id-file').value;
    if (isPndt) {
      if (!govId) {
        alert("Government ID Number is mandatory for mother scans before delivery under PCPNDT regulations. Please enter the Govt ID number.");
        return;
      }
      if (!govIdFile) {
        alert("Uploading a Government ID copy is mandatory for mother scans before delivery under PCPNDT regulations. Please select an ID file.");
        return;
      }
    }

    let uhid = "";
    let name = "";
    let billingStatus = "Cleared";
    let transport = "";
    let isolation = "Normal";
    let wardBed = "";
    let refDoc = "";
    let refHosp = "";

    if (origin === 'IPD') {
      const selectedUhid = document.getElementById('ris-book-ipd-patient').value;
      const patient = window.state.patients.find(p => p.uhid === selectedUhid);
      if (!patient) {
        alert("Please search and select a patient from the suggestive search dropdown list.");
        return;
      }
      uhid = selectedUhid;
      name = patient.name;
      transport = document.getElementById('ris-book-ipd-transport').value;
      isolation = document.getElementById('ris-book-ipd-isolation').value;
      wardBed = patient.ward || "IPD Ward";
      billingStatus = "Cleared"; 
    } else if (origin === 'OPD') {
      // Prescription Upload Check
      const rxFile = document.getElementById('ris-book-opd-prescription').value;
      if (!rxFile) {
        alert("Prescription upload is mandatory for OPD patients. Please select a prescription file prior to booking.");
        return;
      }

      // Upfront payment check
      billingStatus = document.getElementById('ris-book-opd-billing').value;
      if (billingStatus === 'Pending') {
        alert("Booking Locked! OPD patients must make upfront payment in Billing or the OPD front desk before booking the scan.");
        return;
      }

      const selectedUhid = document.getElementById('ris-book-opd-patient').value;
      const patient = window.state.patients.find(p => p.uhid === selectedUhid);
      if (!patient) {
        alert("Please search and select a patient from the suggestive search dropdown list.");
        return;
      }
      uhid = selectedUhid;
      name = patient.name;
    } else {
      // Prescription Upload Check
      const rxFile = document.getElementById('ris-book-ext-prescription').value;
      if (!rxFile) {
        alert("Prescription upload is mandatory for External/Outside patients. Please select a prescription file prior to booking.");
        return;
      }

      // Upfront payment check
      billingStatus = document.getElementById('ris-book-ext-billing').value;
      if (billingStatus === 'Pending') {
        alert("Booking Locked! External patients must make upfront payment in Billing or the OPD front desk before booking the scan.");
        return;
      }

      const extName = document.getElementById('ris-book-ext-name').value.trim();
      const extMobile = document.getElementById('ris-book-ext-contact').value.trim();
      refDoc = document.getElementById('ris-book-ext-doc').value.trim();
      refHosp = document.getElementById('ris-book-ext-hosp').value.trim();
      const refId = document.getElementById('ris-book-ext-ref').value.trim() || 'REF-' + Math.floor(1000 + Math.random()*9000);

      if (!extName || !extMobile || !refDoc || !refHosp) {
        alert("For Outside Referrals, Name, Contact Mobile, Referring Doctor, and Referring Hospital are mandatory fields.");
        return;
      }

      uhid = 'EXT-' + Math.floor(8000 + Math.random()*1999);
      name = extName;

      // Save to external directory
      window.state.risExternalPatients.unshift({
        externalId: uhid,
        name: extName,
        contact: extMobile,
        referringDoctor: refDoc,
        referringHospital: refHosp,
        referralRef: refId,
        paymentStatus: billingStatus
      });
    }

    // Auto slot adjusting for isolation flagged patients
    let finalTime = schTime;
    if (isolation && isolation !== 'Normal') {
      finalTime = "08:00 PM (Final slot - Isolation protocol + Terminal Cleaning)";
      alert(`⚠️ Infection Precaution Alert: Because this patient is flagged with isolation precautions, they have been automatically scheduled for the last slot of the day (${finalTime}). Modality room terminal cleaning is scheduled immediately after.`);
    }

    const visitId = "VIS-" + Math.floor(9000 + Math.random()*999);
    const tokenNumber = "RAD-" + Math.floor(100 + Math.random()*899);

    const newStudy = {
      visitId: visitId,
      studyId: "STUDY-" + Math.floor(9000 + Math.random()*999),
      tokenNumber: tokenNumber,
      name: name,
      uhid: uhid,
      patientType: origin,
      modality: test.modality,
      studyName: test.name,
      priority: priority,
      stage: "Check-In", // Initial stage
      room: test.room,
      time: finalTime,
      priorityFlag: priorityFlag,
      isolationStatus: isolation,
      mlcFlag: mlcFlag,
      pndtCompliant: isPndt,
      pndtGovId: govId,
      safetyCheck: {
        completed: false,
        fasting: test.name.toLowerCase().includes("contrast") || test.name.toLowerCase().includes("abd") ? "Pending" : "N/A",
        pregnancy: "Pending", 
        metalCleared: test.modality === 'MRI' ? "Pending" : "N/A",
        consent: test.name.toLowerCase().includes("contrast") ? "Pending" : "N/A",
        renalChecked: test.name.toLowerCase().includes("contrast") ? "Pending" : "N/A",
        renalVal: "",
        renalSource: "EMR",
        allergyHistory: "None",
        premedication: "No"
      },
      technician: assignedTech,
      clinicalIndication: indication,
      orderingPhysician: origin === 'Outside' ? "" : (window.state.activeUser ? window.state.activeUser.name : "Dr. Amit Verma"),
      referringDoctor: refDoc,
      referringHospital: refHosp,
      billingStatus: billingStatus,
      transportRequirement: transport,
      wardBed: wardBed,
      modalityId: machineId,
      checkInTime: new Date().toLocaleTimeString('en-IN', {hour:'2-digit', minute:'2-digit'}),
      prepCompleted: false,
      ivCannulated: false,
      scanLog: null,
      contrastObs: null,
      postScanTransport: null,
      billingReconciled: false
    };

    window.state.risQueue.unshift(newStudy);

    // Save to MLC register if flagged
    if (mlcFlag) {
      window.state.risMlcRecords.unshift({
        mlcId: "MLC-" + Math.floor(100 + Math.random()*899),
        visitId: visitId,
        name: name,
        uhid: uhid,
        flaggedBy: "Coordinator " + (window.state.activeUserRole || "RIS Desk"),
        flaggedAt: new Date().toLocaleDateString('en-IN') + ' ' + new Date().toLocaleTimeString('en-IN'),
        chainOfCustody: [{ time: new Date().toLocaleTimeString('en-IN'), action: "MLC Flagged at check-in", user: window.state.activeUserRole || "Coordinator" }],
        externalRequests: []
      });
    }

    window.state.risAuditLogs.unshift({
      timestamp: new Date().toLocaleTimeString('en-IN') + ' ' + new Date().toLocaleDateString('en-IN'),
      user: window.state.activeUserRole || "Radiology Coordinator",
      action: "New Scan Scheduled",
      details: `Scheduled ${test.name} for ${name} (${uhid}) [${origin}].`
    });

    window.risCloseBookingModal();
  };

  // OPEN CALIBRATION OVERRIDE MODAL
  window.risOpenCalibrationOverride = function(equipId) {
    const equip = window.state.risEquipments.find(e => e.id === equipId);
    if (!equip) return;

    window.risActiveOverrideId = equipId;
    document.getElementById('ris-override-machine-details').innerHTML = `
      Modality Machine: ${equip.name} (${equip.id})<br>
      Modality Type: ${equip.type}<br>
      Current Calibration Status: <span style="color:#dc2626; font-weight:bold;">Calibration Due</span>
    `;

    document.getElementById('ris-override-officer').value = "";
    document.getElementById('ris-override-reason').value = "";
    document.getElementById('ris-override-modal').style.display = 'flex';
  };

  window.risSubmitCalibrationOverride = function() {
    const officer = document.getElementById('ris-override-officer').value.trim();
    const reason = document.getElementById('ris-override-reason').value.trim();
    const activeRole = window.state.activeUserRole || 'Radiology Technician';

    if (activeRole !== 'Biomedical/Equipment Officer' && activeRole !== 'Super Admin') {
      alert(`Access Denied! Your active role is "${activeRole}". Only the "Biomedical/Equipment Officer" or "Super Admin" can log a Biomedical calibration override.`);
      return;
    }

    if (!officer || !reason) {
      alert("Both Biomedical Officer Name and Override Justification are mandatory fields.");
      return;
    }

    const equip = window.state.risEquipments.find(e => e.id === window.risActiveOverrideId);
    if (equip) {
      equip.override = {
        officer: officer,
        reason: reason,
        date: new Date().toLocaleDateString('en-IN')
      };
      window.state.risAuditLogs.unshift({
        timestamp: new Date().toLocaleTimeString('en-IN') + ' ' + new Date().toLocaleDateString('en-IN'),
        user: officer,
        action: "Biomed Override Logged",
        details: `Calibration override logged for ${equip.name} (${equip.id}). Justification: ${reason}`
      });
    }

    document.getElementById('ris-override-modal').style.display = 'none';
    window.views.radDashboard(window.activeRisContainer);
    alert(`Biomedical Engineering override logged successfully. Machine calibration lock bypassed.`);
  };

  // OPEN SAFETY PREP & LOAD DYNAMIC GATES
  window.risOpenSafetyPrep = function(studyId) {
    const item = window.state.risQueue.find(q => q.studyId === studyId);
    if (!item) return;

    window.risActiveSafetyId = studyId;
    document.getElementById('ris-safety-patient-details').innerHTML = `
      <strong>Patient Name:</strong> ${item.name} [<b>${item.patientType} Origin</b>]<br>
      <strong>Token / UHID:</strong> ${item.tokenNumber} / ${item.uhid}<br>
      <strong>Ordered Procedure:</strong> ${item.studyName} (${item.modality})<br>
      <strong>Clinical Indication:</strong> ${item.clinicalIndication || 'N/A'}<br>
      <strong>Target Machine:</strong> ${item.modalityId}
    `;

    // Build safety checklists dynamically based on modality safety gates
    let checklistHtml = '';

    // Gate 1: Fasting check
    const isFastingNeeded = item.studyName.toLowerCase().includes("contrast") || item.studyName.toLowerCase().includes("abd");
    checklistHtml += `
      <div style="background:#f8fafc; padding:10px; border-radius:6px; border:1px solid #cbd5e1; margin-bottom:8px;">
        <div style="font-weight:700; font-size:0.75rem; color:#1e3a8a; margin-bottom:6px;">1. Modality Fasting Requirement</div>
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <span style="font-size:0.7rem; color:#475569;">${isFastingNeeded ? '⚠️ Fasting Required (6-8 hours)' : 'Fasting not required for this study (N/A)'}</span>
          <select class="form-control" style="width:180px; height:26px; font-size:0.7rem;" id="ris-safety-fasting">
            <option value="Yes" ${item.safetyCheck.fasting === 'Yes' || item.safetyCheck.fasting.startsWith('Yes') ? 'selected' : ''}>Confirmed Fasting Met</option>
            <option value="N/A" ${item.safetyCheck.fasting === 'N/A' ? 'selected' : ''}>Not Required (N/A)</option>
            <option value="Pending" ${item.safetyCheck.fasting === 'Pending' ? 'selected' : ''}>No (Pending)</option>
          </select>
        </div>
      </div>
    `;

    // Gate 2: MRI screening checklist
    if (item.modality === 'MRI') {
      checklistHtml += `
        <div style="background:#fef2f2; padding:10px; border-radius:6px; border:1px solid #fecaca; margin-bottom:8px;">
          <div style="font-weight:700; font-size:0.75rem; color:#dc2626; margin-bottom:6px;">🛡️ MRI SAFETY METAL SCREENING (HARD GATE)</div>
          <div style="font-size:0.68rem; color:#6b7280; line-height:1.4; margin-bottom:8px;">
            Structured questionnaire: Patient has pacemakers, metallic implants, aneurysm clips, metal fragments, or claustrophobia?
          </div>
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:6px; font-size:0.72rem; margin-bottom:8px;">
            <label><input type="checkbox" id="mri-q-pacemaker" checked> Pacemaker Absent</label>
            <label><input type="checkbox" id="mri-q-implants" checked> Metallic Implants Absent</label>
            <label><input type="checkbox" id="mri-q-clips" checked> Aneurysm Clips Absent</label>
            <label><input type="checkbox" id="mri-q-claustrophobia" checked> Claustrophobia Managed</label>
          </div>
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <span style="font-size:0.7rem; color:#b91c1c; font-weight:bold;">Implant screening clearance:</span>
            <select class="form-control" style="width:180px; height:26px; font-size:0.7rem;" id="ris-safety-metal">
              <option value="Cleared" ${item.safetyCheck.metalCleared === 'Cleared' ? 'selected' : ''}>Cleared (Verified Safe)</option>
              <option value="Pending" ${item.safetyCheck.metalCleared === 'Pending' ? 'selected' : ''}>Pending Checklist</option>
            </select>
          </div>
        </div>
      `;
    } else {
      checklistHtml += `<input type="hidden" id="ris-safety-metal" value="N/A">`;
    }

    // Gate 3: Contrast safety check
    const isContrastStudy = item.studyName.toLowerCase().includes("contrast") || item.studyName.toLowerCase().includes("c+");
    if (isContrastStudy) {
      checklistHtml += `
        <div style="background:#fffbeb; padding:10px; border-radius:6px; border:1px solid #fcd34d; margin-bottom:8px;">
          <div style="font-weight:700; font-size:0.75rem; color:#d97706; margin-bottom:6px;">🧪 CONTRAST SAFETY GATES</div>
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
            <span style="font-size:0.7rem; color:#475569;">Informed Consent Form:</span>
            <select class="form-control" style="width:180px; height:26px; font-size:0.7rem;" id="ris-safety-consent">
              <option value="Yes" ${item.safetyCheck.consent === 'Yes' ? 'selected' : ''}>Consent Captured & Signed</option>
              <option value="Pending" ${item.safetyCheck.consent === 'Pending' ? 'selected' : ''}>Pending Consent</option>
            </select>
          </div>
          <div style="display:grid; grid-template-columns:1.2fr 1fr; gap:6px; margin-bottom:6px; align-items:center;">
            <div>
              <span style="font-size:0.7rem; color:#475569; display:block;">Renal Function (eGFR / Serum Creatinine):</span>
              <input type="text" id="ris-safety-renal-val" class="form-control" style="height:22px; font-size:0.7rem; width:120px;" placeholder="e.g. 1.0 mg/dL" value="${item.safetyCheck.renalVal || ''}">
            </div>
            <div>
              <span style="font-size:0.7rem; color:#475569; display:block;">Lab Source:</span>
              <select id="ris-safety-renal-source" class="form-control" style="height:24px; font-size:0.7rem; width:100%;">
                <option value="EMR" ${item.safetyCheck.renalSource === 'EMR' ? 'selected' : ''}>EMR Lab Record (IPD)</option>
                <option value="Uploaded Report" ${item.safetyCheck.renalSource === 'Uploaded Report' ? 'selected' : ''}>Uploaded Patient Report</option>
                <option value="Waiver" ${item.safetyCheck.renalSource === 'Waiver' ? 'selected' : ''}>Signed Medical Waiver</option>
              </select>
            </div>
          </div>
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:6px; font-size:0.72rem; border-top:1px dashed #fcd34d; padding-top:6px; margin-top:4px;">
            <label><input type="checkbox" id="contrast-q-allergy" checked> No prior contrast allergy</label>
            <label><input type="checkbox" id="contrast-q-premed"> Prior reaction premedication logged</label>
          </div>
        </div>
      `;
    } else {
      checklistHtml += `
        <input type="hidden" id="ris-safety-consent" value="N/A">
        <input type="hidden" id="ris-safety-renal-val" value="N/A">
        <input type="hidden" id="ris-safety-renal-source" value="N/A">
      `;
    }

    // Gate 4: Pregnancy radiation safety check for childbearing age females (CT/X-Ray)
    const isIonizingRadiation = item.modality === 'CT Scan' || item.modality === 'X-Ray';
    const isChildbearingAgeFemale = true; 
    if (isIonizingRadiation && isChildbearingAgeFemale) {
      checklistHtml += `
        <div style="background:#f3e8ff; padding:10px; border-radius:6px; border:1px solid #d8b4fe; margin-bottom:8px;">
          <div style="font-weight:700; font-size:0.75rem; color:#7c3aed; margin-bottom:6px;">🤰 RADIATION PREGNANCY SAFETY CHECK (CT/X-RAY GATE)</div>
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <span style="font-size:0.7rem; color:#475569;">Pregnancy Status / Lead Shield Precaution:</span>
            <select class="form-control" style="width:180px; height:26px; font-size:0.7rem;" id="ris-safety-pregnancy">
              <option value="Negative" ${item.safetyCheck.pregnancy === 'Negative' ? 'selected' : ''}>Verified Negative / Non-Preg</option>
              <option value="N/A" ${item.safetyCheck.pregnancy === 'N/A' ? 'selected' : ''}>Not Applicable (Male/Age)</option>
              <option value="Waiver Signed" ${item.safetyCheck.pregnancy === 'Waiver Signed' ? 'selected' : ''}>Emergency Waiver Signed</option>
              <option value="Pending" ${item.safetyCheck.pregnancy === 'Pending' ? 'selected' : ''}>Pending Precaution check</option>
            </select>
          </div>
        </div>
      `;
    } else {
      checklistHtml += `<input type="hidden" id="ris-safety-pregnancy" value="N/A">`;
    }

    document.getElementById('ris-safety-modal-body').innerHTML = checklistHtml;
    document.getElementById('ris-safety-modal').style.display = 'flex';
  };

  window.risCloseSafetyPrep = function() {
    document.getElementById('ris-safety-modal').style.display = 'none';
  };

  // SAVE SAFETY PREP
  window.risSaveSafetyPrep = function() {
    const studyId = window.risActiveSafetyId;
    const item = window.state.risQueue.find(q => q.studyId === studyId);
    if (!item) return;

    // Read inputs
    const fasting = document.getElementById('ris-safety-fasting').value;
    const pregnancy = document.getElementById('ris-safety-pregnancy').value;
    const metalCleared = document.getElementById('ris-safety-metal').value;
    const consent = document.getElementById('ris-safety-consent').value;

    let renalVal = "N/A";
    let renalSource = "N/A";
    if (document.getElementById('ris-safety-renal-val')) {
      renalVal = document.getElementById('ris-safety-renal-val').value.trim();
      renalSource = document.getElementById('ris-safety-renal-source').value;
    }

    // Validation for Gates
    if (fasting === 'Pending') {
      alert("Fasting requirement must be met/checked before releasing patient for scan.");
      return;
    }
    if (metalCleared === 'Pending') {
      alert("MRI Screening checklist must be completed and marked 'Cleared' before scan.");
      return;
    }
    if (consent === 'Pending') {
      alert("Informed Consent for contrast studies is mandatory and must be signed.");
      return;
    }
    if (pregnancy === 'Pending') {
      alert("Radiation Safety pregnancy check must be verified before scan.");
      return;
    }

    // Save checklist
    item.safetyCheck.fasting = fasting;
    item.safetyCheck.pregnancy = pregnancy;
    item.safetyCheck.metalCleared = metalCleared;
    item.safetyCheck.consent = consent;
    item.safetyCheck.renalChecked = "Yes";
    item.safetyCheck.renalVal = renalVal;
    item.safetyCheck.renalSource = renalSource;
    item.safetyCheck.completed = true; // Clearance unlocked!

    // Shift stage to Waiting Room
    item.stage = "Waiting Room";

    window.state.risAuditLogs.unshift({
      timestamp: new Date().toLocaleTimeString('en-IN') + ' ' + new Date().toLocaleDateString('en-IN'),
      user: window.state.activeUserRole || "Radiology Tech",
      action: "Readiness Safety Checklist Confirmed",
      details: `Safety checks cleared for ${item.name} (${item.uhid}). Moved to Waiting Room.`
    });

    window.risCloseSafetyPrep();
    window.views.radDashboard(window.activeRisContainer);
    alert(`Radiology safety readiness validated for patient: ${item.name}. Releasing to Waiting Room.`);
  };

  // OPEN PRE SCAN PREP DIALOG
  window.risOpenPreScanPrep = function(studyId) {
    const item = window.state.risQueue.find(q => q.studyId === studyId);
    if (!item) return;

    window.risActivePrepId = studyId;
    document.getElementById('ris-prep-patient-details').innerHTML = `
      Patient Name: ${item.name} (${item.uhid})<br>
      Ordered Procedure: ${item.studyName}<br>
      Safety Screening Status: <span style="color:#16a34a; font-weight:bold;">Cleared</span>
    `;

    document.getElementById('ris-prep-gown').checked = false;
    document.getElementById('ris-prep-iv').checked = item.studyName.toLowerCase().includes("contrast");
    document.getElementById('ris-prep-iv-details').style.display = item.studyName.toLowerCase().includes("contrast") ? 'block' : 'none';
    document.getElementById('ris-prep-cannula-size').value = item.studyName.toLowerCase().includes("contrast") ? "20G Pink" : "";

    document.getElementById('ris-prep-modal').style.display = 'flex';
  };

  // SUBMIT PRE-SCAN PREP
  window.risSubmitPreScanPrep = function() {
    const studyId = window.risActivePrepId;
    const item = window.state.risQueue.find(q => q.studyId === studyId);
    if (!item) return;

    const gown = document.getElementById('ris-prep-gown').checked;
    const iv = document.getElementById('ris-prep-iv').checked;
    const size = document.getElementById('ris-prep-cannula-size').value.trim();

    if (!gown) {
      alert("You must confirm that gown change has been completed and all metal objects removed prior to scanning.");
      return;
    }

    if (iv && !size) {
      alert("Please log the IV Cannula size for this contrast study.");
      return;
    }

    item.prepCompleted = true;
    item.ivCannulated = iv;
    item.stage = "Scan Acquisition"; // Progress to scan stage!

    window.state.risAuditLogs.unshift({
      timestamp: new Date().toLocaleTimeString('en-IN') + ' ' + new Date().toLocaleDateString('en-IN'),
      user: window.state.activeUserRole || "Radiographer",
      action: "Pre-Scan Prep Completed",
      details: `${item.name} gown changed and IV cannulation logged (${size || 'N/A'}).`
    });

    document.getElementById('ris-prep-modal').style.display = 'none';
    window.views.radDashboard(window.activeRisContainer);
    alert(`Pre-scan prep logged successfully. Released patient ${item.name} to acquisition queue.`);
  };

  // OPEN SCAN EXECUTION DIALOG
  window.risOpenScanExecution = function(studyId) {
    const item = window.state.risQueue.find(q => q.studyId === studyId);
    if (!item) return;

    window.risActiveScanId = studyId;
    document.getElementById('ris-scan-patient-details').innerHTML = `
      Patient Name: ${item.name} (${item.uhid})<br>
      Study Procedure: ${item.studyName} (${item.modality})<br>
      Target Modality Machine: ${item.modalityId}
    `;

    document.getElementById('ris-scan-dose').value = item.modality === 'CT Scan' ? "14.5" : (item.modality === 'X-Ray' ? "0.2" : "N/A");
    document.getElementById('ris-scan-quality').value = "Adequate";
    document.getElementById('ris-scan-repeat-sec').style.display = 'none';
    document.getElementById('ris-scan-repeat-reason').value = "";

    document.getElementById('ris-scan-modal').style.display = 'flex';
  };

  // SUBMIT SCAN EXECUTION
  window.risSubmitScanExecution = function() {
    const studyId = window.risActiveScanId;
    const item = window.state.risQueue.find(q => q.studyId === studyId);
    if (!item) return;

    const dose = document.getElementById('ris-scan-dose').value.trim();
    const quality = document.getElementById('ris-scan-quality').value;
    const repeatReason = document.getElementById('ris-scan-repeat-reason').value.trim();

    if (!dose) {
      alert("Ionizing radiation dose log is mandatory for NABL / AERB cumulative compliance.");
      return;
    }

    if (quality === 'Repeat Required' && !repeatReason) {
      alert("Please provide the technical reason for the repeat scan.");
      return;
    }

    item.scanLog = {
      technologistId: window.state.activeUserRole || "Tech Suresh",
      imageQuality: quality,
      repeatReason: repeatReason || null,
      radiationDose: dose,
      scanStartTime: Date.now() - 10 * 60 * 1000,
      scanEndTime: Date.now()
    };

    if (quality === 'Repeat Required') {
      item.chargeAdjustment += 0.5 * (window.state.risTestMaster.find(t => t.name === item.studyName)?.price || 1000); // 50% repeat cost co-pay reconciliation
      alert(`⚠️ Technical Repeat logged. Re-scanning required due to: ${repeatReason}. A co-pay billing adjustment has been spooled for reconciliation.`);
      document.getElementById('ris-scan-modal').style.display = 'none';
      window.views.radDashboard(window.activeRisContainer);
      return;
    }

    // Determine contrast observation route
    const isContrastStudy = item.studyName.toLowerCase().includes("contrast") || item.studyName.toLowerCase().includes("c+");
    if (isContrastStudy) {
      item.stage = "Contrast Observation";
      item.contrastObs = {
        isContrastAdministered: true,
        durationMinutes: 20,
        obsStartTime: Date.now(),
        reactionLogged: false,
        reactionDetails: "",
        overriddenEarlyBy: null,
        overrideReason: null,
        discharged: false
      };
      
      window.state.risAuditLogs.unshift({
        timestamp: new Date().toLocaleTimeString('en-IN') + ' ' + new Date().toLocaleDateString('en-IN'),
        user: window.state.activeUserRole || "Technologist",
        action: "Scan Acquired - Contrast Route",
        details: `${item.name} scan acquired. Transmitted to PACS. Spooled to Contrast Observation.`
      });
      
      alert(`Scan acquired and pushed to PACS. Contrast study detected: Spooling patient ${item.name} to timed contrast observation.`);
    } else {
      item.stage = "Post-Scan Handling";
      
      window.state.risAuditLogs.unshift({
        timestamp: new Date().toLocaleTimeString('en-IN') + ' ' + new Date().toLocaleDateString('en-IN'),
        user: window.state.activeUserRole || "Technologist",
        action: "Scan Acquired & Spooled",
        details: `${item.name} scan acquired. Pushed to PACS and spooled to Radiologist worklist.`
      });
      
      // Spool study directly to Radiologist Reporting Queue
      const reportId = `REP-RAD-${item.studyId.replace("STUDY-", "")}`;
      if (!window.state.risReportingQueue.some(r => r.reportId === reportId)) {
        window.state.risReportingQueue.unshift({
          reportId: reportId,
          visitId: item.visitId,
          name: item.name,
          uhid: item.uhid,
          studyName: item.studyName,
          priority: item.priority,
          status: "Pending Reporting",
          technician: item.technician || "Tech Suresh",
          imagesCount: 24,
          findings: "",
          flag: "Normal",
          patientType: item.patientType,
          orderingPhysician: item.orderingPhysician,
          referringDoctor: item.referringDoctor,
          referringHospital: item.referringHospital,
          doseLog: dose
        });
      }

      alert(`Scan acquired and pushed to PACS. Patient ${item.name} spooled to Post-Scan Transport/Billing.`);
    }

    document.getElementById('ris-scan-modal').style.display = 'none';
    window.views.radDashboard(window.activeRisContainer);
  };

  // OPEN CONTRAST OBSERVATION MONITORING
  window.risOpenContrastObservation = function(studyId) {
    const item = window.state.risQueue.find(q => q.studyId === studyId);
    if (!item || !item.contrastObs) return;

    window.risActiveObsId = studyId;
    document.getElementById('ris-obs-patient-details').innerHTML = `
      Patient Name: ${item.name} (${item.uhid})<br>
      Study Procedure: ${item.studyName}<br>
      Observation Started: ${new Date(item.contrastObs.obsStartTime).toLocaleTimeString('en-IN')}
    `;

    // Calculate elapsed time
    const elapsedMs = Date.now() - item.contrastObs.obsStartTime;
    const elapsedMin = Math.floor(elapsedMs / 1000 / 60);
    const remaining = Math.max(0, item.contrastObs.durationMinutes - elapsedMin);

    if (remaining === 0) {
      document.getElementById('ris-obs-time-elapsed').innerHTML = `<span style="color:#16a34a; font-weight:800;">✓ Timer Completed (${elapsedMin} mins elapsed)</span>`;
    } else {
      document.getElementById('ris-obs-time-elapsed').innerHTML = `⏳ ${remaining} mins remaining of ${item.contrastObs.durationMinutes} min observation window`;
    }

    document.getElementById('ris-obs-reaction').value = "No";
    document.getElementById('ris-obs-reaction-details-sec').style.display = 'none';
    document.getElementById('ris-obs-reaction-details').value = "";
    document.getElementById('ris-obs-override-officer').value = "";
    document.getElementById('ris-obs-override-reason').value = "";

    document.getElementById('ris-obs-modal').style.display = 'flex';
  };

  // SUBMIT CONTRAST OBSERVATION MONITORING
  window.risSubmitContrastObservation = function() {
    const studyId = window.risActiveObsId;
    const item = window.state.risQueue.find(q => q.studyId === studyId);
    if (!item || !item.contrastObs) return;

    const reaction = document.getElementById('ris-obs-reaction').value;
    const details = document.getElementById('ris-obs-reaction-details').value.trim();
    const ovOfficer = document.getElementById('ris-obs-override-officer').value.trim();
    const ovReason = document.getElementById('ris-obs-override-reason').value.trim();

    // Check timer limit
    const elapsedMs = Date.now() - item.contrastObs.obsStartTime;
    const elapsedMin = Math.floor(elapsedMs / 1000 / 60);
    const timerCompleted = elapsedMin >= item.contrastObs.durationMinutes;

    if (!timerCompleted && !ovOfficer && !ovReason) {
      alert(`Start Scan Locked! Timed contrast observation window is still running. You must wait for the complete ${item.contrastObs.durationMinutes}-minute monitoring window to expire, or log a Clinical Override with justification.`);
      return;
    }

    item.contrastObs.reactionLogged = reaction === 'Yes';
    item.contrastObs.reactionDetails = details || null;
    item.contrastObs.overriddenEarlyBy = ovOfficer || null;
    item.contrastObs.overrideReason = ovReason || null;
    item.contrastObs.discharged = true;

    item.stage = "Post-Scan Handling"; // Progress to handoff stage!

    // If reaction logged, alert treating physician co-sign
    if (reaction === 'Yes') {
      window.state.risCriticalAlarms.unshift({
        id: "ALM-" + Math.floor(400 + Math.random()*99),
        name: item.name,
        uhid: item.uhid,
        finding: `Adverse Reaction: ${details}`,
        doctor: item.orderingPhysician || item.referringDoctor || "Escort Nurse",
        time: new Date().toLocaleTimeString('en-IN'),
        status: "Pending",
        patientType: item.patientType,
        escalated: false
      });
      alert(`⚠️ Allergy Precaution: Contrast adverse reaction logged! Spooled alert to clinical lead.`);
    }

    // Spool study to Radiologist reporting queue
    const reportId = `REP-RAD-${item.studyId.replace("STUDY-", "")}`;
    if (!window.state.risReportingQueue.some(r => r.reportId === reportId)) {
      window.state.risReportingQueue.unshift({
        reportId: reportId,
        visitId: item.visitId,
        name: item.name,
        uhid: item.uhid,
        studyName: item.studyName,
        priority: item.priority,
        status: "Pending Reporting",
        technician: item.technician || "Tech Preeti",
        imagesCount: 36,
        findings: "",
        flag: "Normal",
        patientType: item.patientType,
        orderingPhysician: item.orderingPhysician,
        referringDoctor: item.referringDoctor,
        referringHospital: item.referringHospital,
        doseLog: item.scanLog ? item.scanLog.radiationDose : "14.5"
      });
    }

    window.state.risAuditLogs.unshift({
      timestamp: new Date().toLocaleTimeString('en-IN') + ' ' + new Date().toLocaleDateString('en-IN'),
      user: window.state.activeUserRole || "Nursing staff",
      action: "Contrast Observation Discharged",
      details: `${item.name} discharged. Override early: ${ovOfficer ? 'Yes' : 'No'}. Reaction: ${reaction}`
    });

    document.getElementById('ris-obs-modal').style.display = 'none';
    window.views.radDashboard(window.activeRisContainer);
    alert(`Contrast observation monitoring complete. Patient released to transport/discharge.`);
  };

  // NOTIFY WARD TRANSPORT (IPD only)
  window.risNotifyWardTransport = function(studyId) {
    const item = window.state.risQueue.find(q => q.studyId === studyId);
    if (item && item.patientType === 'IPD') {
      item.postScanTransport = {
        wardNotifiedAt: new Date().toLocaleTimeString('en-IN'),
        wardAcknowledgedAt: null
      };
      
      window.state.risAuditLogs.unshift({
        timestamp: new Date().toLocaleTimeString('en-IN') + ' ' + new Date().toLocaleDateString('en-IN'),
        user: window.state.activeUserRole || "Ward Coordinator",
        action: "Ward notified for transport",
        details: `Ward notified to fetch inpatient ${item.name} (${item.uhid}) back to ${item.wardBed}.`
      });
      window.views.radDashboard(window.activeRisContainer);
      alert(`Ward nurse notified via Ward console. Awaiting ward acknowledgment co-sign.`);
    }
  };

  // ACKNOWLEDGE WARD TRANSPORT
  window.risAcknowledgeWardTransport = function(studyId) {
    const item = window.state.risQueue.find(q => q.studyId === studyId);
    if (item && item.postScanTransport) {
      item.postScanTransport.wardAcknowledgedAt = new Date().toLocaleTimeString('en-IN');
      
      window.state.risAuditLogs.unshift({
        timestamp: new Date().toLocaleTimeString('en-IN') + ' ' + new Date().toLocaleDateString('en-IN'),
        user: "Ward Nurse",
        action: "Transport Acknowledged",
        details: `Ward transport verified. Inpatient returning to ward.`
      });
      window.views.radDashboard(window.activeRisContainer);
      alert(`Ward transport co-sign registered. Ready for final billing ledger closing.`);
    }
  };

  // FINALIZE RECONCILIATION & DISCHARGE
  window.risFinalizeJourneyReconciliation = function(studyId) {
    const item = window.state.risQueue.find(q => q.studyId === studyId);
    if (!item) return;

    const basePrice = window.state.risTestMaster.find(t => t.name === item.studyName)?.price || 1000;
    const finalPrice = basePrice + (item.chargeAdjustment || 0);

    const check = confirm(`BILLING LEDGER RECONCILIATION:\nPatient: ${item.name}\nBase Tariff: Rs. ${basePrice}\nFailure/Upgrade Adjustments: Rs. ${item.chargeAdjustment || 0}\nTotal Finalized Charge: Rs. ${finalPrice}\n\nProceed to close out radiology encounter and archive files?`);
    
    if (check) {
      item.billingReconciled = true;
      item.stage = "Completed";

      // Remove from active queue after completion
      window.state.risQueue = window.state.risQueue.filter(q => q.studyId !== studyId);

      window.state.risAuditLogs.unshift({
        timestamp: new Date().toLocaleTimeString('en-IN') + ' ' + new Date().toLocaleDateString('en-IN'),
        user: window.state.activeUserRole || "Billing Desk",
        action: "Billing Reconciled & Visit Archived",
        details: `Visit finalized for ${item.name} (${item.uhid}). Total Charge: Rs. ${finalPrice} logged.`
      });

      window.views.radDashboard(window.activeRisContainer);
      alert(`Visit successfully archived. Imaging files locked under statutory retention periods.`);
    }
  };

  // LOAD PACS REPORT DATA
  window.risLoadReportData = function(reportId) {
    const item = window.state.risReportingQueue.find(r => r.reportId === reportId);
    if (!item) return;

    window.risActiveReportId = reportId;
    
    // Update active reporting patient header at the top
    const repName = document.getElementById('ris-rep-patient-name');
    const repUhid = document.getElementById('ris-rep-patient-uhid-badge');
    if (repName && repUhid) {
      repName.innerText = `${item.name} (${item.patientType} Origin)`;
      repUhid.innerText = item.uhid;
    }
    
    const pacsPat = document.getElementById('ris-pacs-patient');
    if (pacsPat) {
      pacsPat.innerText = `${item.name} · ${item.uhid} [${item.patientType} Origin]`;
    }
    
    // Update PACS DICOM image
    const svgContainer = document.getElementById('ris-pacs-svg-container');
    const isBrain = item.studyName.toLowerCase().includes("brain") || item.studyName.toLowerCase().includes("head");
    
    let svgContent = '';
    if (isBrain) {
      svgContent = `
        <svg id="ris-pacs-svg" width="220" height="220" viewBox="0 0 300 380" style="filter: contrast(1.2) brightness(0.9);">
          <rect width="300" height="380" fill="#000"/>
          <ellipse cx="150" cy="180" rx="90" ry="110" fill="#0f172a" stroke="#fff" stroke-width="4" opacity="0.95"/>
          <path d="M 150,70 Q 140,110 120,120 Q 150,150 140,190 T 150,290" fill="none" stroke="#64748b" stroke-width="2" opacity="0.6"/>
          <path d="M 150,70 Q 160,110 180,120 Q 150,150 160,190 T 150,290" fill="none" stroke="#64748b" stroke-width="2" opacity="0.6"/>
          <ellipse cx="130" cy="170" rx="15" ry="30" fill="#1e293b" stroke="#475569" stroke-width="1.5" opacity="0.7"/>
          <ellipse cx="170" cy="170" rx="15" ry="30" fill="#1e293b" stroke="#475569" stroke-width="1.5" opacity="0.7"/>
        </svg>
      `;
    } else {
      svgContent = `
        <svg id="ris-pacs-svg" width="220" height="220" viewBox="0 0 300 380" style="filter: contrast(1.2) brightness(0.9);">
          <rect width="300" height="380" fill="#000"/>
          <rect x="146" y="20" width="8" height="340" fill="#475569" opacity="0.6"/>
          <path d="M 140,20 L 160,20 M 140,50 L 160,50 M 140,80 L 160,80" stroke="#64748b" stroke-width="2" opacity="0.5"/>
          <path d="M 130,80 C 70,80 50,150 50,270 C 50,300 110,310 130,280 Z" fill="#0f172a" stroke="#475569" stroke-width="1.5" opacity="0.9"/>
          <path d="M 170,80 C 230,80 250,150 250,270 C 250,300 190,310 170,280 Z" fill="#0f172a" stroke="#475569" stroke-width="1.5" opacity="0.9"/>
        </svg>
      `;
    }
    svgContainer.innerHTML = svgContent;

    // Load templates
    document.getElementById('ris-report-findings').value = item.findings || `STUDY: ${item.studyName}\nFINDINGS:\n- Lungs / Brain parenchyma reveal normal architectural outline.\n- No focal consolidation, pneumothorax, midline shift, or mass effect is noted.\nIMPRESSION: Normal radiodiagnostic scan report.`;
    document.getElementById('ris-report-flag').value = item.flag;
  };

  // APPLY REPORT TEMPLATE
  window.risApplyTemplate = function(templateType) {
    const findingsInput = document.getElementById('ris-report-findings');
    if (!findingsInput) return;

    if (templateType === 'normal-chest') {
      findingsInput.value = "STUDY: X-Ray Chest PA View\n\nFINDINGS:\n- Trachea is central. Bony thorax is normal.\n- Both lung fields are clear. No pleural effusion or pneumothorax.\n- Cardio-diaphragmatic angles are normal.\n\nIMPRESSION: Normal chest radiograph study.";
      document.getElementById('ris-report-flag').value = "Normal";
    } else if (templateType === 'normal-brain') {
      findingsInput.value = "STUDY: CT Brain (Non-Contrast)\n\nFINDINGS:\n- No evidence of acute intracranial hemorrhage or territorial infarction.\n- Gray-white matter differentiation is normal.\n- Ventricles and sulci are within normal limits for age.\n\nIMPRESSION: Normal CT scan of the brain.";
      document.getElementById('ris-report-flag').value = "Normal";
    } else if (templateType === 'abnormal-brain') {
      findingsInput.value = "STUDY: CT Brain (Non-Contrast)\n\nFINDINGS:\n- Crescentic extra-axial hyperdense fluid collection seen in left frontoparietal region.\n- Maximum depth measures approximately 8mm.\n- Mass effect is noted with mild midline shift of 2.5mm to the right.\n\nIMPRESSION: Subacute subdural hematoma (SDH) left hemisphere with mass effect. Clinically urgent neurosurgery correlation advised.";
      document.getElementById('ris-report-flag').value = "CRITICAL";
    }
  };

  // ADJUST PACS FILTERS
  window.risAdjustPacs = function(filter, delta) {
    const img = document.getElementById('ris-pacs-svg');
    const container = document.getElementById('ris-pacs-svg-container');
    const hud = document.getElementById('ris-dicom-hud-filters');

    if (!img) return;

    if (filter === 'bright') {
      window.risPacsFilters.bright = Math.max(0.2, Math.min(2.0, window.risPacsFilters.bright + delta));
    } else if (filter === 'contrast') {
      window.risPacsFilters.contrast = Math.max(0.2, Math.min(3.0, window.risPacsFilters.contrast + delta));
    } else if (filter === 'zoom') {
      window.risPacsFilters.zoom = Math.max(0.5, Math.min(3.0, window.risPacsFilters.zoom + delta));
    } else if (filter === 'invert') {
      window.risPacsFilters.invert = !window.risPacsFilters.invert;
    }

    img.style.filter = `contrast(${window.risPacsFilters.contrast}) brightness(${window.risPacsFilters.bright}) ${window.risPacsFilters.invert ? 'invert(1)' : ''}`;
    container.style.transform = `scale(${window.risPacsFilters.zoom})`;

    hud.innerHTML = `ZOOM: ${window.risPacsFilters.zoom.toFixed(1)}x | CONTRAST: ${window.risPacsFilters.contrast.toFixed(1)} | BRIGHT: ${window.risPacsFilters.bright.toFixed(1)} | INVERTED: ${window.risPacsFilters.invert?'YES':'NO'}`;
  };

  window.risResetPacs = function() {
    window.risPacsFilters = { bright: 0.9, contrast: 1.2, zoom: 1.0, invert: false };
    window.risAdjustPacs('', 0);
  };

  // RADIOLOGIST ROLE GATE & REPORT SIGN-OFF
  window.risDigitallySignReport = function() {
    const activeRole = window.state.activeUserRole || 'Radiology Technician';
    if (activeRole !== 'Radiologist' && activeRole !== 'Super Admin') {
      alert(`Access Denied! Your active role is "${activeRole}". Only a user holding the "Radiologist" role has sign-off authority on the Verification & Structured Reporting panel. Histopathologists, Pathology Leads, or Technologists cannot sign or verify radiology reports.`);
      return;
    }

    const reportId = window.risActiveReportId;
    const item = window.state.risReportingQueue.find(r => r.reportId === reportId);
    if (!item) {
      alert("Please select a report to verify.");
      return;
    }

    const findings = document.getElementById('ris-report-findings').value;
    const flag = document.getElementById('ris-report-flag').value;
    const signMode = document.getElementById('ris-report-signmode').value;

    // Remove from Reporting queue
    window.state.risReportingQueue = window.state.risReportingQueue.filter(r => r.reportId !== reportId);

    // Sync findings to patients medicalReports EMR
    const patientRecord = window.state.patients.find(p => p.uhid === item.uhid);
    if (patientRecord) {
      patientRecord.medicalReports = patientRecord.medicalReports || [];
      patientRecord.medicalReports.unshift({
        testName: item.studyName,
        status: "Final",
        result: findings
      });
    }

    // Sync status and findings to state.orders
    let orderId = "";
    if (reportId.startsWith("REP-ORD-") || reportId.startsWith("REP-STUDY-ORD-")) {
      orderId = reportId.replace("REP-ORD-", "").replace("REP-STUDY-ORD-", "");
    }
    const matchingOrder = window.state.orders.find(o => 
      (orderId && o.id === orderId) ||
      (!orderId && o.uhid === item.uhid && o.name === item.studyName && o.status !== 'Approved')
    );
    if (matchingOrder) {
      matchingOrder.status = "Approved";
      matchingOrder.result = findings;
    }

    // Spool System Level Alert
    if (flag === 'CRITICAL') {
      const recipient = item.patientType === 'Outside' ? (item.referringDoctor || 'Referring Doctor') : (item.orderingPhysician || 'Ordering Physician');
      window.state.risCriticalAlarms.unshift({
        id: "ALM-" + Math.floor(100 + Math.random()*900),
        name: item.name,
        uhid: item.uhid,
        finding: findings.split('\n')[2] || findings.substring(0, 50),
        doctor: recipient,
        time: new Date().toLocaleTimeString('en-IN'),
        status: "Pending",
        patientType: item.patientType,
        escalated: false
      });
    }

    // Log delivery path
    let deliveryMode = "EMR Release";
    let recipient = "Treating Team";
    let deliveryStatus = "Delivered";

    if (item.patientType === 'OPD') {
      deliveryMode = "EMR & Portal SMS";
      recipient = "Patient Portal";
      deliveryStatus = "Notified (SMS Sent)";
    } else if (item.patientType === 'Outside') {
      deliveryMode = "Print & DICOM Export";
      recipient = `${item.referringDoctor || 'Referring Doctor'} & Patient`;
      deliveryStatus = "Pending Export (Counter Check)";
    }

    window.state.risDeliveryLogs.unshift({
      deliveryId: "DLV-" + Math.floor(200 + Math.random()*800),
      reportId: reportId,
      name: item.name,
      patientType: item.patientType,
      deliveryMode: deliveryMode,
      status: deliveryStatus,
      timestamp: new Date().toLocaleDateString('en-IN') + ' ' + new Date().toLocaleTimeString('en-IN', {hour:'2-digit', minute:'2-digit'}),
      recipient: recipient
    });

    window.state.risAuditLogs.unshift({
      timestamp: new Date().toLocaleTimeString('en-IN') + ' ' + new Date().toLocaleDateString('en-IN'),
      user: "Radiologist Dr. Verma",
      action: "Report Signed & Released",
      details: `${item.studyName} report ${reportId} digitally signed via ${signMode}. Deliver-mode: ${deliveryMode}`
    });

    // Automatically trigger patient EMR timeline logging if available
    if (window.logPatientTimeline && item.patientType !== 'Outside') {
      window.logPatientTimeline(item.uhid, {
        type: 'lab',
        icon: '🩻',
        title: `Radiology Report Signed: ${item.studyName}`,
        desc: `Scan report signed off by Radiologist. Status: ${flag}. findings: ${findings.substring(0, 100)}...`
      });
    }

    window.views.radDashboard(window.activeRisContainer);
    alert(`Report ${reportId} signed successfully. Delivery pathway routed to: ${deliveryMode}.`);
  };

  // REJECT SCAN REPORT
  window.risRejectScanReport = function() {
    const activeRole = window.state.activeUserRole || 'Radiology Technician';
    if (activeRole !== 'Radiologist' && activeRole !== 'Super Admin') {
      alert(`Access Denied! Your active role is "${activeRole}". Only a user holding the "Radiologist" role has authority to reject radiology scan reports.`);
      return;
    }

    const reportId = window.risActiveReportId;
    const item = window.state.risReportingQueue.find(r => r.reportId === reportId);
    if (!item) return;

    window.state.risReportingQueue = window.state.risReportingQueue.filter(r => r.reportId !== reportId);

    // Sync rejection back to state.orders
    let orderId = "";
    if (reportId.startsWith("REP-ORD-") || reportId.startsWith("REP-STUDY-ORD-")) {
      orderId = reportId.replace("REP-ORD-", "").replace("REP-STUDY-ORD-", "");
    }
    const matchingOrder = window.state.orders.find(o => 
      (orderId && o.id === orderId) ||
      (!orderId && o.uhid === item.uhid && o.name === item.studyName && o.status !== 'Approved')
    );
    if (matchingOrder) {
      matchingOrder.status = "Rejected";
    }

    window.state.risAuditLogs.unshift({
      timestamp: new Date().toLocaleTimeString('en-IN') + ' ' + new Date().toLocaleDateString('en-IN'),
      user: "Radiologist Dr. Verma",
      action: "Report Rejected for Rescan",
      details: `${item.studyName} report ${reportId} rejected. Recalled for rescan.`
    });

    window.views.radDashboard(window.activeRisContainer);
    alert(`Scan report rejected. Re-acquisition request spooled to technician console.`);
  };

  // RENDER PENDING CALLBACKS IN THE OUTBOUND LOG LIST
  window.risRenderPendingCallbacks = function() {
    const criticalReports = window.state.risReportingQueue.filter(r => r.flag === 'CRITICAL');
    
    return criticalReports.map(r => {
      const isLogged = window.state.risCriticalCallLogs.some(c => c.reportId === r.reportId);
      if (isLogged) {
        const log = window.state.risCriticalCallLogs.find(c => c.reportId === r.reportId);
        return `
          <div style="background:#f0fdf4; border:1px solid #bbf7d0; padding:6px; border-radius:6px; font-size:0.72rem; display:flex; justify-content:space-between; align-items:center;">
            <div>
              <span style="color:#16a34a; font-weight:bold;">✓ Called:</span> <strong>${r.name}</strong> (${r.reportId})<br>
              <span style="font-size:0.65rem; color:#64748b;">Recipient: ${log.calledTo} at ${log.callTime}</span>
            </div>
            <span style="font-size:0.65rem; color:#16a34a; font-weight:800; text-transform:uppercase;">NABL co-signed</span>
          </div>
        `;
      } else {
        return `
          <div style="background:#fff5f5; border:1px solid #fee2e2; padding:8px; border-radius:6px; font-size:0.72rem;">
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <div>
                <span style="color:#dc2626; font-weight:800;">⚠️ CALLBACK PENDING:</span> <strong>${r.name}</strong> (${r.reportId})
                <div style="font-size:0.65rem; color:#b91c1c;">Findings: Seg consolidation left lower lobe secondary to embolism.</div>
              </div>
              <span style="background:#fee2e2; color:#dc2626; padding:1px 6px; border-radius:4px; font-size:9px; font-weight:bold; text-transform:uppercase;">Compliance Gap</span>
            </div>
          </div>
        `;
      }
    }).join('') || '<div style="font-size:0.7rem; color:#64748b; text-align:center; padding:10px;">No critical scan findings pending co-sign call logs.</div>';
  };

  // SUBMIT VERBAL CALLBACK LOG
  window.risSubmitVerbalCallback = function() {
    const reportId = document.getElementById('ris-call-report-id').value;
    const recipient = document.getElementById('ris-call-recipient').value.trim();
    const readback = document.getElementById('ris-call-readback').checked;

    if (!reportId || !recipient) {
      alert("Both Select Report and Recipient Clinician are required fields.");
      return;
    }

    if (!readback) {
      alert("You must verify and check co-sign 'Read-back co-sign confirmed' for safety compliance.");
      return;
    }

    const callId = "CALL-" + Math.floor(1000 + Math.random()*9000);
    window.state.risCriticalCallLogs.unshift({
      callId: callId,
      reportId: reportId,
      calledBy: "Radiologist Dr. Verma",
      calledTo: recipient,
      callTime: new Date().toLocaleTimeString('en-IN', {hour:'2-digit', minute:'2-digit'}),
      readBackConfirmed: readback
    });

    // Close matching alert co-sign
    const matchingAlert = window.state.risCriticalAlarms.find(a => a.uhid === window.state.risReportingQueue.find(r => r.reportId === reportId)?.uhid);
    if (matchingAlert) {
      matchingAlert.status = "Acknowledged";
    }

    window.state.risAuditLogs.unshift({
      timestamp: new Date().toLocaleTimeString('en-IN') + ' ' + new Date().toLocaleDateString('en-IN'),
      user: "Radiologist Dr. Verma",
      action: "Verbal Callback Logged",
      details: `Verbal co-sign alert released for report ${reportId} to clinician ${recipient} with readback co-sign.`
    });

    window.views.radDashboard(window.activeRisContainer);
    alert(`Verbal callback co-sign logged successfully. Compliance gap cleared.`);
  };

  // OUTSIDE DICOM DELIVERY EXPORT
  window.risProcessOutsideDelivery = function(deliveryId) {
    const log = window.state.risDeliveryLogs.find(d => d.deliveryId === deliveryId);
    if (log) {
      log.status = "Cleared & Exported (DICOM CD + Print)";
      log.timestamp = new Date().toLocaleDateString('en-IN') + ' ' + new Date().toLocaleTimeString('en-IN', {hour:'2-digit', minute:'2-digit'});
      
      window.state.risAuditLogs.unshift({
        timestamp: new Date().toLocaleTimeString('en-IN') + ' ' + new Date().toLocaleDateString('en-IN'),
        user: "PACS Executive",
        action: "Outside DICOM CD Exported",
        details: `DICOM Pen Drive & Printed report hand-delivered to external patient ${log.name}.`
      });
      window.views.radDashboard(window.activeRisContainer);
      alert(`Success! Printed Report & DICOM media successfully burned to CD/USB for outside referral patient.`);
    }
  };

  // SUBMIT QA PEER REVIEW
  window.risSubmitPeerReview = function() {
    const repId = document.getElementById('ris-qa-report').value.trim();
    const agreement = document.getElementById('ris-qa-agreement').value;
    const notes = document.getElementById('ris-qa-notes').value.trim();

    if (!repId || !notes) {
      alert("Both Report ID and QA Peer Review Notes are required fields.");
      return;
    }

    window.state.risQaLogs.unshift({
      qaId: "QA-" + Math.floor(500 + Math.random()*499),
      reportId: repId,
      reviewer: window.state.currentUser ? window.state.currentUser.name : "Dr. Priya Nair",
      date: new Date().toLocaleDateString('en-IN'),
      agreement: agreement,
      notes: notes
    });

    document.getElementById('ris-qa-report').value = "";
    document.getElementById('ris-qa-notes').value = "";
    window.views.radDashboard(window.activeRisContainer);
    alert(`NABH radiodiagnosis peer-review verification logged successfully.`);
  };

  // MLC CHAIN OF CUSTODY LOGGING ACCESS
  window.risLogCustodyAccess = function(mlcId) {
    const m = window.state.risMlcRecords.find(r => r.mlcId === mlcId);
    if (m) {
      m.chainOfCustody.push({
        time: new Date().toLocaleTimeString('en-IN'),
        action: `MLC diagnostic films accessed`,
        user: window.state.activeUserRole || "Co-ordinator"
      });
      window.views.radDashboard(window.activeRisContainer);
      alert(`Access log registered under chain-of-custody protocols.`);
    }
  };

  // OPEN MLC REQUISITION FORM CARD
  window.risOpenMlcRequisition = function(mlcId) {
    window.risActiveMlcId = mlcId;
    document.getElementById('mlc-requisition-form-card').style.display = 'block';
    
    document.getElementById('mlc-req-officer').value = "";
    document.getElementById('mlc-req-ref').value = "";
    document.getElementById('mlc-req-cosign').value = "";
  };

  // SUBMIT MLC REQUISITION
  window.risSubmitMlcRequisition = function() {
    const mlcId = window.risActiveMlcId;
    const m = window.state.risMlcRecords.find(r => r.mlcId === mlcId);
    if (!m) return;

    const officer = document.getElementById('mlc-req-officer').value.trim();
    const ref = document.getElementById('mlc-req-ref').value.trim();
    const cosign = document.getElementById('mlc-req-cosign').value.trim();

    if (!officer || !ref || !cosign) {
      alert("All fields (Officer Name, Station/Case Ref, Coordinator Co-Sign) are mandatory to authorize MLC release.");
      return;
    }

    m.chainOfCustody.push({
      time: new Date().toLocaleTimeString('en-IN'),
      action: `Released film custody to Officer: ${officer} (Case: ${ref}) under Co-sign: ${cosign}`,
      user: window.state.activeUserRole || "MLC Coordinator"
    });

    document.getElementById('mlc-requisition-form-card').style.display = 'none';
    window.views.radDashboard(window.activeRisContainer);
    alert(`Success! MLC chain-of-custody release verified. Diagnostic films handed over to ${officer}.`);
  };
})();
