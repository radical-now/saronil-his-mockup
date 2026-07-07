// Radiology Information System (RIS) & Command Center Dashboard
// Saronil Health HIS

(function() {
  // Initialize mock data in state if not present
  function initRadState() {
    if (!window.state) window.state = {};
    
    // RIS Modality Master & Tariff List
    window.state.risTestMaster = window.state.risTestMaster || [
      { code: "XRAY_CHEST", name: "X-Ray Chest PA View", modality: "X-Ray", room: "ROOM-X1", price: 450, prep: "Remove metal objects/jewelry", sampleType: "None" },
      { code: "USG_ABD", name: "USG Whole Abdomen", modality: "Ultrasound", room: "ROOM-U1", price: 1200, prep: "6 hours fasting required", sampleType: "None" },
      { code: "CT_BRAIN_C", name: "CT Brain Contrast-Enhanced", modality: "CT Scan", room: "ROOM-CT1", price: 4500, prep: "4 hours fasting, Serum Creatinine report <1.2 mg/dL", sampleType: "None" },
      { code: "MRI_SPINE_LS", name: "MRI Lumbar Spine", modality: "MRI", room: "ROOM-MR1", price: 6500, prep: "MRI Safety metal screening check", sampleType: "None" },
      { code: "DOPPLER_LL", name: "Doppler Bilateral Lower Limbs", modality: "Ultrasound", room: "ROOM-U2", price: 2500, prep: "None", sampleType: "None" },
      { code: "MAMMO_BI", name: "Mammography Bilateral", modality: "Mammography", room: "ROOM-M1", price: 1500, prep: "Avoid deodorants/powders", sampleType: "None" }
    ];

    // Equipment Master
    window.state.risEquipments = window.state.risEquipments || [
      { id: "EQ-R1", name: "Siemens Magnetom 3T MRI", type: "MRI", status: "Calibrated", lastCalib: "01-Jul-2026", nextCalib: "01-Aug-2026", pmSchedule: "15-Jul-2026" },
      { id: "EQ-R2", name: "GE Optima 128-Slice CT", type: "CT Scan", status: "Calibrated", lastCalib: "28-Jun-2026", nextCalib: "28-Jul-2026", pmSchedule: "12-Jul-2026" },
      { id: "EQ-R3", name: "Philips Affiniti 70 USG", type: "Ultrasound", status: "Calibration Due", lastCalib: "12-Jun-2026", nextCalib: "26-Jun-2026", pmSchedule: "08-Jul-2026" },
      { id: "EQ-R4", name: "Allengers 500mA Fixed X-Ray", type: "X-Ray", status: "Calibrated", lastCalib: "02-Jul-2026", nextCalib: "02-Aug-2026", pmSchedule: "20-Jul-2026" }
    ];

    // Initial Scheduler Scan Queue
    window.state.risQueue = window.state.risQueue || [
      { studyId: "STUDY-1001", name: "Aarav Mehta", uhid: "SH-2026-04821", modality: "MRI", studyName: "MRI Lumbar Spine", priority: "STAT", status: "Scheduled", room: "ROOM-MR1", time: "10:30 AM", safetyCheck: { fasting: "N/A", pregnancy: "N/A", metalCleared: "Pending", consent: "Yes" }, technician: "Tech Vinay" },
      { studyId: "STUDY-1002", name: "Sunita Devi", uhid: "SH-2026-04803", modality: "CT Scan", studyName: "CT Brain Contrast-Enhanced", priority: "Urgent", status: "Arrived", room: "ROOM-CT1", time: "11:00 AM", safetyCheck: { fasting: "Yes (6h)", pregnancy: "Negative", metalCleared: "N/A", consent: "Pending" }, technician: "Tech Preeti" },
      { studyId: "STUDY-1003", name: "Gopal Banerjee", uhid: "SH-2026-04799", modality: "Ultrasound", studyName: "USG Whole Abdomen", priority: "Routine", status: "Waiting", room: "ROOM-U1", time: "11:30 AM", safetyCheck: { fasting: "Yes (8h)", pregnancy: "N/A", metalCleared: "N/A", consent: "Yes" }, technician: "Tech Suresh" },
      { studyId: "STUDY-1004", name: "Harpreet Singh", uhid: "SH-2026-04817", modality: "X-Ray", studyName: "X-Ray Chest PA View", priority: "STAT", status: "Called", room: "ROOM-X1", time: "11:45 AM", safetyCheck: { fasting: "N/A", pregnancy: "N/A", metalCleared: "N/A", consent: "N/A" }, technician: "Tech Vinay" }
    ];

    // Reporting Worklist
    window.state.risReportingQueue = window.state.risReportingQueue || [
      { reportId: "REP-RAD-101", name: "Meena Iyer", uhid: "SH-2026-04788", studyName: "X-Ray Chest PA View", priority: "STAT", status: "Pending Reporting", technician: "Tech Vinay", imagesCount: 1, findings: "", flag: "Normal" },
      { reportId: "REP-RAD-102", name: "Shyam Lal", uhid: "SH-2026-04821", studyName: "CT Brain Contrast-Enhanced", priority: "Urgent", status: "Pending Verification", technician: "Tech Preeti", imagesCount: 48, findings: "Subacute subdural hematoma seen in left frontoparietal region measuring 8mm in max depth. Mild midline shift of 2mm to right.", flag: "Abnormal" }
    ];

    // Outsource / Film / Contrast Inventory
    window.state.risInventory = window.state.risInventory || [
      { name: "Omnipaque Contrast (100ml)", stock: 15, unit: "Vials", reorder: 20, status: "Low Stock" },
      { name: "Laser Imaging Film 14x17", stock: 120, unit: "Sheets", reorder: 100, status: "Good" },
      { name: "Ultrasound Gel (5L)", stock: 8, unit: "Cans", reorder: 5, status: "Good" }
    ];

    // Critical Findings Alerts spooled to EMR
    window.state.risCriticalAlarms = window.state.risCriticalAlarms || [
      { id: "ALM-301", name: "Shyam Lal", uhid: "SH-2026-04821", finding: "Subdural Hematoma 8mm Left hemisphere", doctor: "Dr. Srinivasan", time: "11:30 AM", status: "Pending" }
    ];

    // Audit logs
    window.state.risAuditLogs = window.state.risAuditLogs || [
      { timestamp: "02-Jul-2026 09:00 AM", user: "Front Desk Kavya", action: "Appointment Booked", details: "Aarav Mehta MRI Spine booked" },
      { timestamp: "02-Jul-2026 09:45 AM", user: "Billing Executive Sonia", action: "Billing Verified", details: "CT Brain Contrast billed for Sunita Devi" },
      { timestamp: "02-Jul-2026 10:15 AM", user: "Tech Vinay", action: "Safety Prep Checklist Complete", details: "Aarav Mehta metal screening completed & cleared." }
    ];

    // EMR orders synchronization loop
    if (window.state.orders) {
      window.state.orders.forEach(order => {
        if (order.type === 'Radiology') {
          const studyId = `STUDY-ORD-${order.id}`;
          const inQueue = window.state.risQueue.some(q => q.studyId === studyId);
          const inReporting = window.state.risReportingQueue.some(r => r.reportId === `REP-ORD-${order.id}`);
          const isApproved = order.status === 'Approved';

          if (!inQueue && !inReporting && !isApproved) {
            // Retrieve patient info
            const pat = window.state.patients.find(p => p.uhid === order.uhid);
            let ageStr = "Adult";
            let gender = "M";
            if (pat) {
              ageStr = pat.age + " Yrs";
              gender = pat.gender;
            }

            // Map Modality
            let modality = "X-Ray";
            let room = "ROOM-X1";
            const nameLower = order.name.toLowerCase();
            if (nameLower.includes("ct") || nameLower.includes("computed")) {
              modality = "CT Scan";
              room = "ROOM-CT1";
            } else if (nameLower.includes("mri") || nameLower.includes("magnetic")) {
              modality = "MRI";
              room = "ROOM-MR1";
            } else if (nameLower.includes("usg") || nameLower.includes("ultrasound") || nameLower.includes("doppler")) {
              modality = "Ultrasound";
              room = "ROOM-U1";
            } else if (nameLower.includes("mammo")) {
              modality = "Mammography";
              room = "ROOM-M1";
            }

            window.state.risQueue.push({
              studyId: studyId,
              name: order.patientName,
              uhid: order.uhid,
              modality: modality,
              studyName: order.name,
              priority: order.priority || "Routine",
              status: "Scheduled",
              room: room,
              time: "Just ordered",
              safetyCheck: {
                fasting: nameLower.includes("contrast") || nameLower.includes("abd") ? "Pending" : "N/A",
                pregnancy: gender === 'Female' ? "Pending" : "N/A",
                metalCleared: modality === 'MRI' ? "Pending" : "N/A",
                consent: nameLower.includes("contrast") ? "Pending" : "N/A"
              },
              technician: "Unassigned"
            });
          }
        }
      });
    }

    // Map initial LIS queues to real patients from HIS patient directory
    const realPats = window.state.patients || [];
    if (realPats.length >= 10) {
      if (window.state.risQueue) {
        window.state.risQueue.forEach((q, idx) => {
          const pat = realPats[idx % realPats.length];
          if (pat && !q.studyId.startsWith("STUDY-ORD-")) {
            q.name = pat.name;
            q.uhid = pat.uhid;
          }
        });
      }
      if (window.state.risReportingQueue) {
        window.state.risReportingQueue.forEach((r, idx) => {
          const pat = realPats[(idx + 4) % realPats.length];
          if (pat && !r.reportId.startsWith("REP-ORD-")) {
            r.name = pat.name;
            r.uhid = pat.uhid;
          }
        });
      }
      if (window.state.risCriticalAlarms) {
        window.state.risCriticalAlarms.forEach((a, idx) => {
          const pat = realPats[(idx + 8) % realPats.length];
          if (pat) {
            a.name = pat.name;
            a.uhid = pat.uhid;
          }
        });
      }
    }
  }

  window.views = window.views || {};
  window.views.radDashboard = function(container) {
    window.activeRisContainer = container;
    initRadState();

    // Get active role
    const activeRole = window.state.activeUserRole || 'Radiology Technician';

    const styles = `
      <style>
        .ris-container { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: #1e293b; background-color: #f8fafc; padding: 1.5rem; display: flex; flex-direction: column; gap: 1.5rem; }
        .ris-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #e2e8f0; padding-bottom: 12px; }
        .ris-kpi-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 12px; }
        .ris-kpi-card { background: #ffffff; padding: 12px; border: 1px solid #e2e8f0; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
        .ris-kpi-val { font-size: 1.4rem; font-weight: 700; color: #1e3a8a; }
        .ris-kpi-label { font-size: 0.72rem; color: #64748b; font-weight: 600; text-transform: uppercase; margin-top: 2px; }
        .ris-grid-layout { display: grid; grid-template-columns: 1.2fr 1fr; gap: 1.5rem; }
        @media(max-width: 1024px) { .ris-grid-layout { grid-template-columns: 1fr; } }
        .ris-card { background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; display: flex; flex-direction: column; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
        .ris-card-header { padding: 12px 16px; border-bottom: 1px solid #e2e8f0; font-weight: 700; font-size: 0.88rem; text-transform: uppercase; letter-spacing: 0.5px; background-color: #f1f5f9; display: flex; justify-content: space-between; align-items: center; border-top-left-radius: 8px; border-top-right-radius: 8px; }
        .ris-card-body { padding: 16px; display: flex; flex-direction: column; gap: 12px; }
        .ris-table { width: 100%; border-collapse: collapse; font-size: 0.8rem; }
        .ris-table th { text-align: left; padding: 8px 10px; background-color: #f8fafc; border-bottom: 1px solid #e2e8f0; color: #475569; font-weight: 700; }
        .ris-table td { padding: 8px 10px; border-bottom: 1px dashed #e2e8f0; vertical-align: middle; }
        .btn-ris-sm { font-size: 0.72rem; font-weight: 700; padding: 4px 8px; border-radius: 4px; border: none; cursor: pointer; }
        .btn-ris-primary { background-color: #2563eb; color: #ffffff; }
        .btn-ris-secondary { background-color: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; }
        .btn-ris-danger { background-color: #dc2626; color: #ffffff; }
        .badge-ris { font-size: 0.68rem; font-weight: 700; padding: 2px 6px; border-radius: 4px; display: inline-block; text-transform: uppercase; }
        .badge-ris-stat { background-color: #fee2e2; color: #dc2626; }
        .badge-ris-urgent { background-color: #ffedd5; color: #ea580c; }
        .badge-ris-routine { background-color: #f0fdf4; color: #16a34a; }
        .safety-flag-green { color: #16a34a; font-weight: bold; }
        .safety-flag-pending { color: #d97706; font-weight: bold; cursor: pointer; text-decoration: underline; }
        .ris-modal { display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); justify-content: center; align-items: center; z-index: 10000; }
        .ris-modal-content { background: #ffffff; border-radius: 8px; width: 550px; max-width: 90%; box-shadow: 0 4px 12px rgba(0,0,0,0.15); display: flex; flex-direction: column; overflow: hidden; }
        .dicom-tool-btn { font-size: 0.7rem; font-weight: 600; padding: 3px 6px; border-radius: 4px; background: #334155; color: #fff; border: none; cursor: pointer; }
      </style>
    `;

    // Render structural container
    container.innerHTML = `
      ${styles}
      <div class="ris-container">
        <!-- HEADER -->
        <div class="ris-header">
          <div>
            <h1 style="font-size: 1.3rem; font-weight: 800; color: #1e3a8a; margin: 0;">Radiology & RIS Command Center</h1>
            <div style="font-size: 0.78rem; color: #64748b; margin-top: 2px;">Image Acquisition Bench · structured reporting template · PACS integration</div>
          </div>
          <div style="display: flex; gap: 8px; align-items: center;">
            <div class="admin-mono" style="font-size: 0.72rem; background: #EFF6FF; border: 1px solid #BFDBFE; padding: 4px 10px; border-radius: 4px; font-weight: bold; color: #1E40AF;">
              Active Scans: <span id="ris-active-count">${window.state.risQueue.length}</span> | TAT: <span style="color:#16a34a;">96.2%</span>
            </div>
            <div class="admin-mono" style="font-size: 0.72rem; background: #FFF; border: 1px solid #e2e8f0; padding: 4px 10px; border-radius: 4px; font-weight: bold;">
              NABH Radiodiagnosis standard
            </div>
          </div>
        </div>

        <!-- KPI GRID -->
        <div class="ris-kpi-grid">
          <div class="ris-kpi-card">
            <div class="ris-kpi-val">${window.state.risQueue.filter(q => q.status==='Scheduled').length}</div>
            <div class="ris-kpi-label">Scheduled</div>
          </div>
          <div class="ris-kpi-card">
            <div class="ris-kpi-val">${window.state.risQueue.filter(q => q.status==='Waiting' || q.status==='Arrived').length}</div>
            <div class="ris-kpi-label">Waiting Room</div>
          </div>
          <div class="ris-kpi-card">
            <div class="ris-kpi-val">${window.state.risReportingQueue.filter(r => r.status==='Pending Reporting').length}</div>
            <div class="ris-kpi-label">Pending Reporting</div>
          </div>
          <div class="ris-kpi-card">
            <div class="ris-kpi-val">${window.state.risReportingQueue.filter(r => r.status==='Pending Verification').length}</div>
            <div class="ris-kpi-label">Awaiting Sign-off</div>
          </div>
          <div class="ris-kpi-card">
            <div class="ris-kpi-val" style="color: #dc2626;">${window.state.risCriticalAlarms.filter(a => a.status==='Pending').length}</div>
            <div class="ris-kpi-label">Critical Alerts</div>
          </div>
        </div>

        <!-- MAIN LAYOUT -->
        <div class="ris-grid-layout">
          <!-- LEFT COLUMN: SCAN SCHEDULER & PATIENT PREP -->
          <div style="display: flex; flex-direction: column; gap: 1.5rem;">
            <div class="ris-card">
              <div class="ris-card-header">
                <span>RIS Modality Scheduler & Scan Queue</span>
                <span style="font-size: 0.7rem; color: #475569;">Modality view</span>
              </div>
              <div class="ris-card-body" style="padding:0; overflow-x:auto;">
                <table class="ris-table">
                  <thead>
                    <tr>
                      <th>Time</th>
                      <th>Patient</th>
                      <th>Modality</th>
                      <th>Procedure</th>
                      <th>Priority</th>
                      <th>Safety Prep</th>
                      <th>Status</th>
                      <th style="text-align:right;">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${window.state.risQueue.map(q => {
                      const prioClass = q.priority === 'STAT' ? 'badge-ris-stat' : (q.priority === 'Urgent' ? 'badge-ris-urgent' : 'badge-ris-routine');
                      
                      // Check safety checklist completeness
                      let prepStatus = '<span class="safety-flag-green">✓ Ready</span>';
                      const pValues = Object.values(q.safetyCheck);
                      if (pValues.includes("Pending")) {
                        prepStatus = `<span class="safety-flag-pending" onclick="window.risOpenSafetyPrep('${q.studyId}')">⚠️ Complete Prep</span>`;
                      }

                      return `
                        <tr>
                          <td class="mono"><b>${q.time}</b></td>
                          <td>
                            <div style="font-weight:700;">${q.name}</div>
                            <div style="font-size:0.7rem; color:#64748b;">${q.uhid}</div>
                          </td>
                          <td><b>${q.modality}</b></td>
                          <td>${q.studyName}</td>
                          <td><span class="badge-ris ${prioClass}">${q.priority}</span></td>
                          <td>${prepStatus}</td>
                          <td><span style="font-weight:bold; color:#1e3a8a;">${q.status}</span></td>
                          <td style="text-align:right; display:flex; gap:4px; justify-content:flex-end;">
                            ${q.status === 'Scheduled' ? `<button class="btn-ris-sm btn-ris-secondary" onclick="window.risArrivePatient('${q.studyId}')">Arrived</button>` : ''}
                            ${q.status === 'Arrived' ? `<button class="btn-ris-sm btn-ris-secondary" onclick="window.risCallPatient('${q.studyId}')">Call Scan</button>` : ''}
                            ${(q.status === 'Waiting' || q.status === 'Called') ? `<button class="btn-ris-sm btn-ris-primary" onclick="window.risStartScan('${q.studyId}')" ${pValues.includes("Pending") ? 'disabled style="opacity:0.5; cursor:not-allowed;" title="Safety prep not complete"' : ''}>Start Scan</button>` : ''}
                          </td>
                        </tr>
                      `;
                    }).join('') || '<tr><td colspan="8" style="text-align:center; color:#64748b;">No scheduled investigations.</td></tr>'}
                  </tbody>
                </table>
              </div>
            </div>

            <!-- EQUIPMENT & CALIBRATION PM REGISTRY -->
            <div class="ris-card">
              <div class="ris-card-header">
                <span>Modality Machine & Calibration Status</span>
              </div>
              <div class="ris-card-body" style="padding:0;">
                <table class="ris-table">
                  <thead>
                    <tr>
                      <th>Equipment Code</th>
                      <th>Room / Location</th>
                      <th>Modality Type</th>
                      <th>PM Schedule</th>
                      <th>Calibration Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${window.state.risEquipments.map(e => `
                      <tr>
                        <td><b>${e.name}</b></td>
                        <td class="mono">${e.id}</td>
                        <td>${e.type}</td>
                        <td class="mono">${e.pmSchedule}</td>
                        <td><span class="badge-ris" style="background:#d1fae5; color:#065f46;">${e.status}</span></td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <!-- RIGHT COLUMN: DICOM PACS VIEWER & STRUCTURAL REPORTING -->
          <div style="display: flex; flex-direction: column; gap: 1.5rem;">
            <!-- MOCK DICOM PACS INTERACTIVE WINDOW -->
            <div class="ris-card" style="background: #090d16; border-color: #1e293b; color: #94a3b8;">
              <div class="ris-card-header" style="background: #0f172a; border-bottom-color: #1e293b; color: #cbd5e1;">
                <span>DICOM PACS Image Viewer</span>
                <span id="ris-pacs-patient" style="font-size: 0.72rem; color: #38bdf8; font-weight:bold;">No scan loaded</span>
              </div>
              <div class="ris-card-body" style="align-items: center; justify-content: center; min-height: 260px; position:relative; overflow:hidden;">
                <!-- DICOM HUD OVERLAYS -->
                <div style="position:absolute; top:8px; left:8px; font-size:9px; line-height:1.4; color:#38bdf8;" id="ris-dicom-hud-left">
                  KV: 120 | mA: 250<br>
                  TE: 14ms | TR: 450ms<br>
                  Slice: 14/32
                </div>
                <div style="position:absolute; top:8px; right:8px; font-size:9px; text-align:right; line-height:1.4; color:#38bdf8;">
                  SARONIL IMAGING PACS v3.2<br>
                  NABL ACCREDITED LAB MC-9021<br>
                  Series: 1
                </div>
                <div style="position:absolute; bottom:8px; left:8px; font-size:9px; color:#38bdf8;" id="ris-dicom-hud-filters">
                  ZOOM: 1.0x | CONTRAST: 1.2 | BRIGHT: 0.9
                </div>

                <!-- SCAN SVG -->
                <div id="ris-pacs-svg-container" style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; transition: all 0.2s;">
                  <svg id="ris-pacs-svg" width="220" height="220" viewBox="0 0 300 380" style="filter: contrast(1.2) brightness(0.9);">
                    <rect width="300" height="380" fill="#000"/>
                    <text x="50" y="190" fill="#475569" font-size="12" font-weight="bold">DICOM PACs study viewer offline</text>
                  </svg>
                </div>
              </div>
              <!-- PACS controls toolbar -->
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

            <!-- RADIOLOGIST WORKLIST & STRUCTURED REPORTING -->
            <div class="ris-card">
              <div class="ris-card-header">
                <span>Radiologist Verification & structured Reporting</span>
              </div>
              <div class="ris-card-body" style="gap:12px;">
                <div class="form-group">
                  <label style="font-size:0.75rem; font-weight:700; color:#475569;">Active Verification Report</label>
                  <select class="form-control" style="font-size:0.8rem; height:32px; padding:0 8px;" id="ris-active-report-select" onchange="window.risLoadReportData(this.value)">
                    <option value="">-- Select Report to verify --</option>
                    ${window.state.risReportingQueue.map(r => `
                      <option value="${r.reportId}">${r.reportId} · ${r.name} (${r.studyName})</option>
                    `).join('')}
                  </select>
                </div>

                <!-- Structured Templates Quick Selector -->
                <div class="form-group">
                  <label style="font-size:0.7rem; font-weight:700; color:var(--text-muted); display:block; margin-bottom:4px;">Structured reporting templates</label>
                  <div style="display:flex; gap:6px;">
                    <button class="btn-ris-sm btn-ris-secondary" style="font-size:9px; padding:2px 6px;" onclick="window.risApplyTemplate('normal-chest')">Normal Chest X-Ray</button>
                    <button class="btn-ris-sm btn-ris-secondary" style="font-size:9px; padding:2px 6px;" onclick="window.risApplyTemplate('normal-brain')">Normal Brain CT</button>
                    <button class="btn-ris-sm btn-ris-secondary" style="font-size:9px; padding:2px 6px;" onclick="window.risApplyTemplate('abnormal-brain')">Subdural Hematoma CT</button>
                  </div>
                </div>

                <div class="form-group">
                  <label style="font-size:0.75rem; font-weight:700; color:#475569;">Diagnostic Findings & Impression</label>
                  <textarea class="form-control" rows="6" style="font-size:0.8rem; line-height:1.5; font-family:monospace;" id="ris-report-findings" placeholder="Select scan above to load PACS findings template..."></textarea>
                </div>

                <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px;">
                  <div class="form-group">
                    <label style="font-size:0.75rem; font-weight:700; color:#475569;">Scan Classification</label>
                    <select class="form-control" style="font-size:0.8rem; height:32px;" id="ris-report-flag">
                      <option value="Normal">✓ Normal findings</option>
                      <option value="Abnormal">H - Abnormal Scan</option>
                      <option value="CRITICAL">⚠️ Critical Value / Panic Scan</option>
                    </select>
                  </div>
                  <div class="form-group">
                    <label style="font-size:0.75rem; font-weight:700; color:#475569;">Digital Sign-off Mode</label>
                    <select class="form-control" style="font-size:0.8rem; height:32px;" id="ris-report-signmode">
                      <option>In-Person local console sign-off</option>
                      <option>Remote 2-Factor verified sign-off</option>
                      <option>OTP Verification verified</option>
                    </select>
                  </div>
                </div>

                <div style="display:flex; justify-content:space-between; margin-top:8px;">
                  <button class="btn-ris-sm btn-ris-danger" onclick="window.risRejectScanReport()">Reject & Rescan</button>
                  <button class="btn-ris-sm btn-ris-primary" style="padding:6px 16px; font-size:0.8rem; background-color:#16a34a;" onclick="window.risDigitallySignReport()">Digitally Sign & Release to EMR</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- SAFETY PREP MODAL -->
      <div class="ris-modal" id="ris-safety-modal">
        <div class="ris-modal-content">
          <div class="ris-card-header" style="background:#1e3a8a; color:#fff;">
            <span>NABH Radiology Patient Safety check list</span>
            <span style="cursor:pointer; font-weight:bold; font-size:1.1rem;" onclick="window.risCloseSafetyPrep()">&times;</span>
          </div>
          <div class="ris-card-body" style="gap:14px;">
            <div id="ris-safety-patient-details" style="font-size:0.8rem; background:#f8fafc; padding:8px 12px; border-radius:6px; border:1px solid #e2e8f0; line-height:1.5;">
              Loading patient safety records...
            </div>
            
            <form id="ris-safety-form" style="display:flex; flex-direction:column; gap:10px; font-size:0.8rem;">
              <div style="display:flex; justify-content:space-between; align-items:center;">
                <label><b>1. Fasting Requirement Verified? (Modality Specific)</b></label>
                <select class="form-control" style="width:140px; height:28px; font-size:0.75rem;" id="ris-safety-fasting">
                  <option value="Yes">Yes (Fasting Met)</option>
                  <option value="N/A">Not Required (N/A)</option>
                  <option value="Pending">No (Pending)</option>
                </select>
              </div>

              <div style="display:flex; justify-content:space-between; align-items:center;">
                <label><b>2. Pregnancy Status Verified / Negative? (Radiation Check)</b></label>
                <select class="form-control" style="width:140px; height:28px; font-size:0.75rem;" id="ris-safety-pregnancy">
                  <option value="Negative">Negative / Confirmed</option>
                  <option value="N/A">Not Applicable (M)</option>
                  <option value="Pending">Pending Check</option>
                </select>
              </div>

              <div style="display:flex; justify-content:space-between; align-items:center;">
                <label><b>3. MRI Safety metal screening cleared? (No Pacemakers/Implants)</b></label>
                <select class="form-control" style="width:140px; height:28px; font-size:0.75rem;" id="ris-safety-metal">
                  <option value="Cleared">Cleared (Safe)</option>
                  <option value="N/A">Not Applicable (N/A)</option>
                  <option value="Pending">Pending Screening</option>
                </select>
              </div>

              <div style="display:flex; justify-content:space-between; align-items:center;">
                <label><b>4. Contrast Consent Signed & Serum Creatinine Checked?</b></label>
                <select class="form-control" style="width:140px; height:28px; font-size:0.75rem;" id="ris-safety-consent">
                  <option value="Yes">Signed & Billed</option>
                  <option value="N/A">Not Required (N/A)</option>
                  <option value="Pending">Pending Consent</option>
                </select>
              </div>
            </form>

            <div style="display:flex; justify-content:flex-end; gap:8px; border-top:1px solid #e2e8f0; padding-top:12px; margin-top:8px;">
              <button class="btn-ris-sm btn-ris-secondary" onclick="window.risCloseSafetyPrep()">Cancel</button>
              <button class="btn-ris-sm btn-ris-primary" onclick="window.risSaveSafetyPrep()">Confirm Readiness & Release to machine</button>
            </div>
          </div>
        </div>
      </div>
    `;

    // Local state variables for PACS filters
    window.risPacsFilters = { bright: 0.9, contrast: 1.2, zoom: 1.0, invert: false };
    window.risActiveSafetyId = null;
    window.risActiveReportId = null;
  };

  // ARRIVE PATIENT
  window.risArrivePatient = function(studyId) {
    const item = window.state.risQueue.find(q => q.studyId === studyId);
    if (item) {
      item.status = "Arrived";
      window.state.risAuditLogs.unshift({
        timestamp: new Date().toLocaleTimeString('en-IN') + ' ' + new Date().toLocaleDateString('en-IN'),
        user: "RIS Desk Executive",
        action: "Patient Arrived",
        details: `${item.name} (${item.uhid}) marked arrived at radiology center.`
      });
      window.views.radDashboard(window.activeRisContainer);
    }
  };

  // CALL PATIENT
  window.risCallPatient = function(studyId) {
    const item = window.state.risQueue.find(q => q.studyId === studyId);
    if (item) {
      item.status = "Called";
      window.state.risAuditLogs.unshift({
        timestamp: new Date().toLocaleTimeString('en-IN') + ' ' + new Date().toLocaleDateString('en-IN'),
        user: "Tech Suresh",
        action: "Called for Scan",
        details: `${item.name} called to Room ${item.room}`
      });
      window.views.radDashboard(window.activeRisContainer);
    }
  };

  // OPEN SAFETY PREP
  window.risOpenSafetyPrep = function(studyId) {
    const item = window.state.risQueue.find(q => q.studyId === studyId);
    if (!item) return;

    window.risActiveSafetyId = studyId;
    document.getElementById('ris-safety-patient-details').innerHTML = `
      <strong>Patient Name:</strong> ${item.name}<br>
      <strong>UHID / Visit ID:</strong> ${item.uhid}<br>
      <strong>Ordered Procedure:</strong> ${item.studyName} (${item.modality})<br>
      <strong>Modality Room:</strong> ${item.room}
    `;

    // Pre-populate dropdown fields
    document.getElementById('ris-safety-fasting').value = item.safetyCheck.fasting;
    document.getElementById('ris-safety-pregnancy').value = item.safetyCheck.pregnancy;
    document.getElementById('ris-safety-metal').value = item.safetyCheck.metalCleared;
    document.getElementById('ris-safety-consent').value = item.safetyCheck.consent;

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

    item.safetyCheck.fasting = document.getElementById('ris-safety-fasting').value;
    item.safetyCheck.pregnancy = document.getElementById('ris-safety-pregnancy').value;
    item.safetyCheck.metalCleared = document.getElementById('ris-safety-metal').value;
    item.safetyCheck.consent = document.getElementById('ris-safety-consent').value;

    window.state.risAuditLogs.unshift({
      timestamp: new Date().toLocaleTimeString('en-IN') + ' ' + new Date().toLocaleDateString('en-IN'),
      user: "Radiology Tech",
      action: "Readiness Safety Checklist Confirmed",
      details: `Readiness checklist approved for ${item.name} (${item.uhid}) before scan execution.`
    });

    window.risCloseSafetyPrep();
    window.views.radDashboard(window.activeRisContainer);
    alert(`Radiology safety readiness validated for patient: ${item.name}. Scan can now proceed.`);
  };

  // START SCAN
  window.risStartScan = function(studyId) {
    const item = window.state.risQueue.find(q => q.studyId === studyId);
    if (!item) return;

    // Remove from queue and add to reporting worklist (simulating direct DICOM acquisition completed)
    window.state.risQueue = window.state.risQueue.filter(q => q.studyId !== studyId);

    const reportId = `REP-ORD-${studyId.replace("STUDY-ORD-", "").replace("STUDY-", "")}`;
    window.state.risReportingQueue.unshift({
      reportId: reportId,
      name: item.name,
      uhid: item.uhid,
      studyName: item.studyName,
      priority: item.priority,
      status: "Pending Reporting",
      technician: item.technician || "Tech Suresh",
      imagesCount: item.modality === 'X-Ray' ? 1 : 24,
      findings: "",
      flag: "Normal"
    });

    window.state.risAuditLogs.unshift({
      timestamp: new Date().toLocaleTimeString('en-IN') + ' ' + new Date().toLocaleDateString('en-IN'),
      user: item.technician || "Tech Suresh",
      action: "Scan Acquired & Completed",
      details: `${item.studyName} acquired. Images transmitted to reporting PACS queue under ID ${reportId}`
    });

    window.views.radDashboard(window.activeRisContainer);
    alert(`Scan completed successfully. Images spooled to Radiologist Worklist under Report ID: ${reportId}`);
  };

  // LOAD REPORT DATA (DICOM SVG LOAD MAPPING)
  window.risLoadReportData = function(reportId) {
    const item = window.state.risReportingQueue.find(r => r.reportId === reportId);
    if (!item) return;

    window.risActiveReportId = reportId;
    document.getElementById('ris-pacs-patient').innerText = `${item.name} · ${item.uhid}`;
    
    // Update SVG DICOM image based on procedure name
    const svgContainer = document.getElementById('ris-pacs-svg-container');
    const isBrain = item.studyName.toLowerCase().includes("brain") || item.studyName.toLowerCase().includes("head") || item.studyName.toLowerCase().includes("ct");
    
    let svgContent = '';
    if (isBrain) {
      svgContent = `
        <svg id="ris-pacs-svg" width="220" height="220" viewBox="0 0 300 380" style="filter: contrast(1.2) brightness(0.9);">
          <rect width="300" height="380" fill="#000"/>
          <!-- Outer skull -->
          <ellipse cx="150" cy="180" rx="90" ry="110" fill="#0f172a" stroke="#fff" stroke-width="4" opacity="0.95"/>
          <!-- Inner brain folds -->
          <path d="M 150,70 Q 140,110 120,120 Q 150,150 140,190 T 150,290" fill="none" stroke="#64748b" stroke-width="2" opacity="0.6"/>
          <path d="M 150,70 Q 160,110 180,120 Q 150,150 160,190 T 150,290" fill="none" stroke="#64748b" stroke-width="2" opacity="0.6"/>
          <!-- Ventricles -->
          <ellipse cx="130" cy="170" rx="15" ry="30" fill="#1e293b" stroke="#475569" stroke-width="1.5" opacity="0.7"/>
          <ellipse cx="170" cy="170" rx="15" ry="30" fill="#1e293b" stroke="#475569" stroke-width="1.5" opacity="0.7"/>
        </svg>
      `;
    } else {
      // Chest X-Ray
      svgContent = `
        <svg id="ris-pacs-svg" width="220" height="220" viewBox="0 0 300 380" style="filter: contrast(1.2) brightness(0.9);">
          <rect width="300" height="380" fill="#000"/>
          <rect x="146" y="20" width="8" height="340" fill="#475569" opacity="0.6"/>
          <path d="M 140,20 L 160,20 M 140,50 L 160,50 M 140,80 L 160,80 M 140,110 L 160,110 M 140,140 L 160,140 M 140,170 L 160,170 M 140,200 L 160,200" stroke="#64748b" stroke-width="2" opacity="0.5"/>
          <path d="M 130,80 C 70,80 50,150 50,270 C 50,300 110,310 130,280 C 135,250 135,120 130,80 Z" fill="#0f172a" stroke="#475569" stroke-width="1.5" opacity="0.9"/>
          <path d="M 170,80 C 230,80 250,150 250,270 C 250,300 190,310 170,280 C 165,250 165,120 170,80 Z" fill="#0f172a" stroke="#475569" stroke-width="1.5" opacity="0.9"/>
          <path d="M 135,180 C 135,180 115,220 115,250 C 115,280 145,290 155,290 C 165,290 185,270 185,240 Z" fill="#334155" opacity="0.65" stroke="#475569" stroke-width="1.5"/>
        </svg>
      `;
    }
    svgContainer.innerHTML = svgContent;

    // Load template text
    document.getElementById('ris-report-findings').value = item.findings || `STUDY: ${item.studyName}\nFINDINGS:\n- Lungs / Brain parenchyma reveal normal architectural outline.\n- No focal consolidation, pneumothorax, midline shift, or mass effect is noted.\n- Normal vascular structures.\nIMPRESSION: Normal radiodiagnostic scan report.`;
    document.getElementById('ris-report-flag').value = item.flag;
  };

  // APPLY REPORT TEMPLATE
  window.risApplyTemplate = function(templateType) {
    const findingsInput = document.getElementById('ris-report-findings');
    if (!findingsInput) return;

    if (templateType === 'normal-chest') {
      findingsInput.value = "STUDY: X-Ray Chest PA View\n\nFINDINGS:\n- Trachea is central. Bony thorax is normal.\n- Both lung fields are clear. No pleural effusion or pneumothorax.\n- Cardio-diaphragmatic angles are normal.\n- Heart shadow size is within physiological limits.\n\nIMPRESSION:\nNormal chest radiograph study.";
      document.getElementById('ris-report-flag').value = "Normal";
    } else if (templateType === 'normal-brain') {
      findingsInput.value = "STUDY: CT Brain (Non-Contrast)\n\nFINDINGS:\n- No evidence of acute intracranial hemorrhage or territorial infarction.\n- Gray-white matter differentiation is normal.\n- Ventricles and sulci are within normal limits for age.\n- No midline shift or mass effect is seen.\n\nIMPRESSION:\nNormal CT scan of the brain.";
      document.getElementById('ris-report-flag').value = "Normal";
    } else if (templateType === 'abnormal-brain') {
      findingsInput.value = "STUDY: CT Brain (Non-Contrast)\n\nFINDINGS:\n- Crescentic extra-axial hyperdense fluid collection seen in left frontoparietal region.\n- Maximum depth measures approximately 8mm.\n- Significant compression of adjacent cerebral sulci.\n- Mass effect is noted with mild midline shift of 2.5mm to the right.\n\nIMPRESSION:\nSubacute subdural hematoma (SDH) left hemisphere with mass effect. Advised neurosurgery correlation.";
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

  // DIGITALLY SIGN & RELEASE REPORT TO EMR
  window.risDigitallySignReport = function() {
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

    // Handle Critical findings alert
    if (flag === 'CRITICAL') {
      window.state.risCriticalAlarms.unshift({
        id: "ALM-" + Math.floor(100 + Math.random()*900),
        name: item.name,
        uhid: item.uhid,
        finding: findings.split('\n')[2] || findings.substring(0, 50),
        doctor: "Dr. Priya Nair",
        time: new Date().toLocaleTimeString('en-IN'),
        status: "Pending"
      });
      alert(`CRITICAL SCAN PANIC ALARM SENT. treating clinician notified immediately via SMS/Ward console.`);
    }

    window.state.risAuditLogs.unshift({
      timestamp: new Date().toLocaleTimeString('en-IN') + ' ' + new Date().toLocaleDateString('en-IN'),
      user: "Radiologist Dr. Verma",
      action: "Report Signed & Released",
      details: `${item.studyName} report ${reportId} digitally signed via ${signMode}`
    });

    window.views.radDashboard(window.activeRisContainer);
    alert(`Report ${reportId} signed successfully and published to Patient EMR.`);
  };

  // REJECT SCAN REPORT
  window.risRejectScanReport = function() {
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
})();
