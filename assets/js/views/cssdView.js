/* ==========================================================================
   SARONIL HMS - CENTRAL STERILE SERVICES DEPARTMENT (CSSD) (cssdView.js)
   ========================================================================== */

window.views = window.views || {};

// Initialize state databases if not present
if (window.state) {
  window.state.cssdState = window.state.cssdState || {
    instrumentSets: [],
    implantCatalog: [],
    loanerSets: [],
    queues: {
      dirtyReceipt: [],
      cleaning: [],
      inspection: [],
      packing: [],
      sterilization: []
    },
    sterilizers: [],
    waterQualityLogs: [],
    implantIssues: [],
    auditLogs: []
  };
}

// Active view state
let activeCSSDTab = "dashboard";
let cssdActiveRole = "CSSD In-charge / Manager";

// Helper function to format date/time nicely
function formatCSSDDate(dateStr) {
  if (!dateStr) return "—";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' }) + ' ' + d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  } catch (e) {
    return dateStr;
  }
}

// Helper to log audit events
function logCSSDAudit(action, details) {
  if (!window.state || !window.state.cssdState) return;
  const timestamp = new Date().toISOString();
  window.state.cssdState.auditLogs.unshift({
    timestamp,
    user: cssdActiveRole,
    action,
    details
  });
}

// Helper to display WhatsApp / SMS simulation notifications
function triggerCSSDNotification(type, message, phone) {
  const toast = document.createElement('div');
  toast.style.cssText = 'position:fixed;bottom:1.5rem;left:1.5rem;width:350px;background:#075e54;color:#fff;padding:1rem;border-radius:12px;font-size:0.82rem;z-index:11000;box-shadow:0 12px 30px rgba(0,0,0,0.25);border-left:5px solid #25d366;font-family:sans-serif;animation: slideIn 0.3s ease-out;';
  toast.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.4rem;font-weight:700;">
      <span>💬 CSSD WHATSAPP ALERT [${type}]</span>
      <span style="font-size:0.7rem;color:#128c7e;">To: ${phone || '+91 98765 43210'}</span>
    </div>
    <div style="line-height:1.4;">${message}</div>
    <div style="margin-top:0.5rem;font-size:0.68rem;text-align:right;opacity:0.8;">Delivered via Saronil Gateway ✓✓</div>
  `;
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.style.animation = 'slideOut 0.3s ease-in';
    setTimeout(() => toast.remove(), 300);
  }, 5000);
}

// Main render function for CSSD
window.views.cssd = function(container, subAnchor, params) {
  const css = `
    <style>
      @keyframes slideIn {
        from { transform: translateX(-120%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
      @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(-120%); opacity: 0; }
      }
    </style>
  `;

  // Verify elements are present
  const cs = window.state.cssdState;
  
  // Set tab from parameter if provided
  if (params && params.tab) {
    activeCSSDTab = params.tab;
  }

  // Active role switching handler
  window.switchCSSDRole = function(role) {
    cssdActiveRole = role;
    logCSSDAudit("Role Switched", `User switched role to ${role}`);
    window.views.cssd(container);
  };

  // Active tab switching handler
  window.switchCSSDTab = function(tab) {
    activeCSSDTab = tab;
    window.views.cssd(container);
  };

  // Sub-actions and queue handlers
  window.cssdDirtyReceiptAction = function(setId, action) {
    const item = cs.instrumentSets.find(i => i.id === setId);
    if (!item) return;

    if (action === 'receive') {
      const missing = prompt("Enter missing instruments (comma separated, leave blank if none):") || "";
      const damaged = prompt("Enter damaged/corroded instruments (comma separated, leave blank if none):") || "";
      const missingList = missing ? missing.split(',').map(s => s.trim()) : [];
      const damagedList = damaged ? damaged.split(',').map(s => s.trim()) : [];

      item.status = "Awaiting Cleaning";
      item.location = "Wash Area Queue";
      
      // Remove from dirtyReceipt queue if exists, or update
      cs.queues.dirtyReceipt = cs.queues.dirtyReceipt.filter(q => q.setCode !== setId);
      
      // Add to cleaning queue
      cs.queues.cleaning.push({
        id: "CLN-" + Date.now().toString().slice(-4),
        setName: item.name,
        setCode: item.id,
        method: "Manual Pre-wash",
        status: "Awaiting Cleaning",
        startTime: null,
        technician: null
      });

      logCSSDAudit("Received Dirty Instrument Set", `Received ${item.name} with ${missingList.length} missing and ${damagedList.length} damaged items.`);

      // Notify OT/Ward Nurse if items are missing
      if (missingList.length > 0) {
        triggerCSSDNotification("MISSING INSTRUMENTS", `⚠️ ALERT: Set "${item.name}" returned from OT-02 with missing items: ${missingList.join(', ')}. Please trace or file audit report.`, '+91 98450 12055');
      }
    }
    window.views.cssd(container);
  };

  window.cssdStartCleaning = function(clnId, method) {
    const cln = cs.queues.cleaning.find(c => c.id === clnId);
    if (!cln) return;

    cln.status = "Cleaning";
    cln.method = method;
    cln.startTime = new Date().toISOString();
    cln.technician = "Technician Ashok";

    logCSSDAudit("Cleaning Cycle Started", `Started ${method} for set ${cln.setName}`);
    window.views.cssd(container);
  };

  window.cssdCompleteCleaning = function(clnId) {
    const cln = cs.queues.cleaning.find(c => c.id === clnId);
    if (!cln) return;

    // Move to inspection queue
    cs.queues.cleaning = cs.queues.cleaning.filter(c => c.id !== clnId);
    cs.queues.inspection.push({
      id: "INSP-" + Date.now().toString().slice(-4),
      setName: cln.setName,
      setCode: cln.setCode,
      status: "Awaiting Inspection",
      checklistStatus: "Pending",
      technician: null,
      result: null,
      condemnationRequired: false
    });

    const item = cs.instrumentSets.find(i => i.id === cln.setCode);
    if (item) {
      item.status = "Awaiting Inspection";
      item.location = "Inspection Desk";
    }

    logCSSDAudit("Cleaning Cycle Completed", `Cleaned set ${cln.setName} and sent to Inspection`);
    window.views.cssd(container);
  };

  window.cssdInspectAction = function(inspId, action) {
    const insp = cs.queues.inspection.find(i => i.id === inspId);
    if (!insp) return;

    if (action === 'condemn') {
      insp.condemnationRequired = true;
      insp.status = "Pending Condemnation Sign-off";
      logCSSDAudit("Instrument Condemnation Requested", `Requested condemnation for high-value instrument in set ${insp.setName}. Gated for Manager approval.`);
    } else if (action === 'approve_condemn') {
      // Manager approves condemnation
      insp.condemnationRequired = false;
      insp.status = "Condemnation Approved";
      insp.result = "Replace & Pass";
      logCSSDAudit("Condemnation Approved", `Manager approved condemnation and wrote off the damaged instrument from ${insp.setName}`);
    } else {
      insp.status = "Inspected & Passed";
      insp.checklistStatus = "Checked";
      insp.result = "Pass";
      insp.technician = "Technician Ashok";

      // Move to packing queue
      cs.queues.inspection = cs.queues.inspection.filter(i => i.id !== inspId);
      cs.queues.packing.push({
        id: "PCK-" + Date.now().toString().slice(-4),
        setName: insp.setName,
        setCode: insp.setCode,
        status: "Ready for Packing",
        packagingMaterial: "Double Wrap SMS Wrap",
        packedBy: null
      });

      const item = cs.instrumentSets.find(i => i.id === insp.setCode);
      if (item) {
        item.status = "Awaiting Packing";
        item.location = "Packing Workstation";
      }

      logCSSDAudit("Inspection Passed", `Set ${insp.setName} passed inspection checks`);
    }
    window.views.cssd(container);
  };

  window.cssdPackAction = function(pckId, material) {
    const pck = cs.queues.packing.find(p => p.id === pckId);
    if (!pck) return;

    pck.status = "Packed";
    pck.packagingMaterial = material;
    pck.packedBy = "Technician Ashok";

    // Move to sterilization queue
    cs.queues.packing = cs.queues.packing.filter(p => p.id !== pckId);
    
    const setItem = cs.instrumentSets.find(i => i.id === pck.setCode);
    const isSetImplant = setItem ? setItem.isImplant : false;

    cs.queues.sterilization.push({
      id: "STER-" + Date.now().toString().slice(-4),
      sterilizer: "ST-STEAM-01",
      cycleNo: "CYC-" + Math.floor(Math.random() * 9000 + 1000),
      loadNo: "LOAD-" + Math.floor(Math.random() * 9000 + 1000),
      temperature: "134°C",
      pressure: "2.1 bar",
      exposureTime: "4 minutes",
      status: "Awaiting Sterilization",
      technician: null,
      startTime: null,
      endTime: null,
      isImplant: isSetImplant,
      biStartedAt: null,
      biStatus: "Not Started",
      biResult: null,
      items: [pck.setCode],
      emergencyOverride: null
    });

    if (setItem) {
      setItem.status = "Packed & Awaiting Sterilization";
      setItem.location = "Autoclave Input Bay";
    }

    logCSSDAudit("Set Packed", `Packed ${pck.setName} using ${material} and sent to Sterilization Queue`);
    window.views.cssd(container);
  };

  window.cssdStartSterilization = function(sterId, method, isIUSS) {
    const ster = cs.queues.sterilization.find(s => s.id === sterId);
    if (!ster) return;

    ster.status = "Sterilization Started";
    ster.startTime = new Date().toISOString();
    ster.technician = "Technician Ashok";
    
    if (isIUSS) {
      ster.cycleNo = "IUSS-EMG-" + Math.floor(Math.random() * 900 + 100);
      ster.exposureTime = "3 minutes (Flash)";
      ster.isIUSS = true;
      logCSSDAudit("IUSS Autoclave Flash Started", `EMERGENCY IUSS cycle started for dropped instrument turnaround in load ${ster.loadNo}`);
    } else {
      logCSSDAudit("Sterilization Cycle Started", `Started cycle for load ${ster.loadNo} using ${method}`);
    }

    window.views.cssd(container);
  };

  window.cssdCompleteSterilization = function(sterId) {
    const ster = cs.queues.sterilization.find(s => s.id === sterId);
    if (!ster) return;

    ster.status = "Sterilization Completed";
    ster.endTime = new Date().toISOString();
    
    // Start Biological Indicator validation timer simulation (30 seconds for demonstration, normal 1-24 hours)
    ster.biStartedAt = new Date().toISOString();
    ster.biStatus = "Incubating";

    logCSSDAudit("Sterilization Cycle Completed", `Cycle load ${ster.loadNo} completed. Biological indicator incubation started.`);
    
    // Auto complete timer simulation to make testing quick
    setTimeout(() => {
      if (ster.biStatus === "Incubating") {
        ster.biStatus = "Completed";
        ster.biResult = "Negative"; // Sterility validated
        logCSSDAudit("BI Incubation Completed", `Load ${ster.loadNo} Biological Indicator verified Negative (Sterile).`);
        triggerCSSDNotification("STERILITY VALIDATED", `✅ Autoclave Load ${ster.loadNo} biological indicator incubation completed. Result: NEGATIVE (Sterile). Load released for issue.`, '+91 98450 12055');
      }
    }, 20000); // 20 seconds simulation

    window.views.cssd(container);
  };

  window.cssdIncubateOverride = function(sterId) {
    const ster = cs.queues.sterilization.find(s => s.id === sterId);
    if (!ster) return;

    const surgeon = prompt("Enter Treating Surgeon's Name for Emergency Release:") || "";
    const justification = prompt("Enter Clinical Justification (e.g. dropped instrument, active bleed, life-threatening emergency):") || "";

    if (!surgeon || !justification) {
      alert("Emergency override requires surgeon name and clinical justification.");
      return;
    }

    ster.emergencyOverride = {
      authorizedBy: cssdActiveRole,
      surgeon: surgeon,
      justification: justification,
      releasedAt: new Date().toISOString()
    };

    // Release sets under override
    ster.items.forEach(setCode => {
      const item = cs.instrumentSets.find(i => i.id === setCode);
      if (item) {
        item.status = "Available (Emergency Override Release)";
        item.location = "Sterile Storage Desk";
      }
    });

    logCSSDAudit("Emergency Load Release Authorized", `Released load ${ster.loadNo} under emergency override for Surgeon: ${surgeon}. Justification: ${justification}`);
    triggerCSSDNotification("EMERGENCY OVERRIDE", `⚠️ WARN: Load ${ster.loadNo} released under emergency override before BI incubation completion. Justification: ${justification}`, '+91 98450 12066');
    
    window.views.cssd(container);
  };

  window.cssdSubmitBIResult = function(sterId, result) {
    const ster = cs.queues.sterilization.find(s => s.id === sterId);
    if (!ster) return;

    ster.biStatus = "Completed";
    ster.biResult = result;

    if (result === 'Positive') {
      // Sterility failure! Recall and warn!
      logCSSDAudit("CRITICAL STERILITY FAILURE", `Biological indicator load ${ster.loadNo} returned POSITIVE. Recalling all packs from load.`);
      
      // Trigger WhatsApp/SMS alert
      triggerCSSDNotification("CRITICAL STERILITY FAILURE", `🚨 CRITICAL: Autoclave Load ${ster.loadNo} biological indicator is POSITIVE (Sterility Failed). Recall all packs from this load immediately!`, '+91 98450 12088');

      // If it was emergency released, we trigger patient lookback warn!
      if (ster.emergencyOverride) {
        triggerCSSDNotification("RECALL LOOKBACK ALERT", `🔴 DANGER: Load ${ster.loadNo} containing implants was emergency released to patient under Dr. ${ster.emergencyOverride.surgeon} but subsequently FAILED biological indicator validation. Patient infection audit required.`, '+91 98450 12088');
      }

      ster.items.forEach(setCode => {
        const item = cs.instrumentSets.find(i => i.id === setCode);
        if (item) {
          item.status = "Quarantined / Failed Sterilization";
          item.location = "Reprocessing Queue";
        }
      });
    } else {
      // Pass
      ster.items.forEach(setCode => {
        const item = cs.instrumentSets.find(i => i.id === setCode);
        if (item) {
          item.status = "Available";
          item.location = "Sterile Storage Desk";
        }
      });
      logCSSDAudit("BI Verification Passed", `Load ${ster.loadNo} validated negative and released to sterile stock.`);
    }

    window.views.cssd(container);
  };

  // Issue Sterile set
  window.cssdIssueSterileSet = function(setId) {
    const item = cs.instrumentSets.find(i => i.id === setId);
    if (!item) return;

    let patientUhid = "";
    let surgeon = "";
    let procedure = "";

    if (item.isImplant) {
      patientUhid = prompt("Enter Patient UHID (Mandatory for implant sets):") || "";
      if (!patientUhid) {
        alert("Patient UHID is mandatory for sets containing implants!");
        return;
      }
      surgeon = prompt("Enter Issuing Surgeon's Name:") || "";
      procedure = prompt("Enter Surgical Procedure:") || "";
    } else {
      patientUhid = prompt("Enter Patient UHID (Optional for general sets):") || "";
    }

    const dept = prompt("Enter Target Department (e.g. OT-01, ICU, Wards):") || "OT";

    item.status = "Issued";
    item.location = dept;
    item.issuedTo = dept;
    item.patientUhid = patientUhid;

    if (item.isImplant && item.implantDetails) {
      cs.implantIssues.unshift({
        id: "ISS-" + Date.now().toString().slice(-4),
        patientUhid,
        patientName: "Active Patient Case",
        surgeon: surgeon || "Dr. Srinivasan",
        procedure: procedure || "Ortho Surgery",
        implantCode: item.implantDetails.catalogItem,
        implantName: item.implantDetails.catalogItem,
        lotNumber: item.implantDetails.lotNumber,
        expiryDate: item.implantDetails.expiryDate,
        issuedDate: new Date().toISOString().split('T')[0]
      });
    }

    logCSSDAudit("Issued Sterile Set", `Issued ${item.name} to ${dept}. Patient UHID: ${patientUhid || 'N/A'}`);
    window.views.cssd(container);
  };

  // Water Quality log submission
  window.cssdSubmitWaterLog = function() {
    const feed = document.getElementById('water-feed-tds').value;
    const ro = document.getElementById('water-ro-tds').value;
    const ph = document.getElementById('water-ph').value;

    if (!feed || !ro || !ph) {
      alert("Please fill all water quality measurements.");
      return;
    }

    cs.waterQualityLogs.unshift({
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      feedWaterTds: feed + " ppm",
      roWaterTds: ro + " ppm",
      ph: ph,
      hardness: "Nil",
      loggedBy: cssdActiveRole
    });

    logCSSDAudit("Logged Water Quality Measurements", `RO water TDS recorded at ${ro} ppm (pH: ${ph})`);
    window.views.cssd(container);
  };

  // Build Layout HTML
  container.innerHTML = `
    ${css}
    <div style="display:flex; flex-direction:column; gap:1.5rem;">
      
      <!-- CSSD Sterilization Header -->
      <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid var(--border-color); padding-bottom:1rem;">
        <div>
          <div style="display:flex; align-items:center; gap:0.5rem;">
            <span style="font-size:1.5rem;">🧼</span>
            <h1 style="font-size:1.3rem; font-weight:800; color:#1e3a8a; margin:0;">
              CSSD Sterilization
            </h1>
          </div>
          <p style="font-size:0.78rem; color:#64748b; margin-top:2px;">
            Complete sterile set pipeline, loaner logistics, ETO/Steam autoclaves, and biological validation hold workflows.
          </p>
        </div>
        
        <!-- Role selector mapping -->
        <div style="display:flex; align-items:center; gap:0.5rem;">
          <button class="btn btn-primary btn-sm" style="background:#1d4ed8; color:#fff;" onclick="window.showStockRequestOverlay({dept:'CSSD', urgency:'Routine'})">📦 Request Stock</button>
          <label style="font-size:0.75rem; font-weight:600; color:#64748b;">Dashboard View Role:</label>
          <select class="form-select" style="width:200px; padding:0.35rem 0.5rem; font-size:0.8rem;" onchange="window.switchCSSDRole(this.value)">
            <option value="CSSD In-charge / Manager" ${cssdActiveRole === "CSSD In-charge / Manager" ? "selected" : ""}>CSSD In-charge / Manager</option>
            <option value="CSSD Supervisor" ${cssdActiveRole === "CSSD Supervisor" ? "selected" : ""}>CSSD Supervisor</option>
            <option value="CSSD Technician" ${cssdActiveRole === "CSSD Technician" ? "selected" : ""}>CSSD Technician</option>
            <option value="Infection Control Nurse" ${cssdActiveRole === "Infection Control Nurse" ? "selected" : ""}>Infection Control Nurse</option>
            <option value="OT Nurse" ${cssdActiveRole === "OT Nurse" ? "selected" : ""}>OT Nurse</option>
            <option value="Biomedical Engineer" ${cssdActiveRole === "Biomedical Engineer" ? "selected" : ""}>Biomedical Engineer</option>
          </select>
        </div>
      </div>

      <!-- Navigation Tabs -->
      <div class="tab-container" style="margin-bottom:0;">
        <div onclick="window.switchCSSDTab('dashboard')" class="tab-item ${activeCSSDTab === 'dashboard' ? 'active' : ''}">📊 Dashboard</div>
        <div onclick="window.switchCSSDTab('return')" class="tab-item ${activeCSSDTab === 'return' ? 'active' : ''}">📥 Dirty Return</div>
        <div onclick="window.switchCSSDTab('cleaning')" class="tab-item ${activeCSSDTab === 'cleaning' ? 'active' : ''}">🧼 Wash Area</div>
        <div onclick="window.switchCSSDTab('inspect')" class="tab-item ${activeCSSDTab === 'inspect' ? 'active' : ''}">🔍 Inspection & Pack</div>
        <div onclick="window.switchCSSDTab('sterilization')" class="tab-item ${activeCSSDTab === 'sterilization' ? 'active' : ''}">🔥 Sterilization & BI Hold</div>
        <div onclick="window.switchCSSDTab('storage')" class="tab-item ${activeCSSDTab === 'storage' ? 'active' : ''}">📦 Sterile Stock & Issue</div>
        <div onclick="window.switchCSSDTab('loaner')" class="tab-item ${activeCSSDTab === 'loaner' ? 'active' : ''}">🤝 Loaner Pipeline</div>
        <div onclick="window.switchCSSDTab('recall')" class="tab-item ${activeCSSDTab === 'recall' ? 'active' : ''}">🚨 Implant Recall Desk</div>
        <div onclick="window.switchCSSDTab('equipment')" class="tab-item ${activeCSSDTab === 'equipment' ? 'active' : ''}">⚙️ Water & Autoclaves</div>
        <div onclick="window.switchCSSDTab('audit')" class="tab-item ${activeCSSDTab === 'audit' ? 'active' : ''}">📋 Audit Logs</div>
      </div>

      <!-- Dynamic Content Panel -->
      <div id="cssd-content" class="card">
        <!-- Tab bodies will render here -->
      </div>
    </div>
  `;

  // Render sub tab bodies
  const subContainer = document.getElementById('cssd-content');
  if (!subContainer) return;

  if (activeCSSDTab === 'dashboard') {
    // Generate dashboard counts
    const totalSets = cs.instrumentSets.length;
    const availableSets = cs.instrumentSets.filter(s => s.status === 'Available').length;
    const dirtySets = cs.instrumentSets.filter(s => s.status === 'Returned Dirty').length;
    const issuedSets = cs.instrumentSets.filter(s => s.status === 'Issued').length;
    const biPending = cs.queues.sterilization.filter(s => s.biStatus === 'Incubating').length;
    const failedLoads = cs.queues.sterilization.filter(s => s.biResult === 'Positive').length;

    subContainer.innerHTML = `
      <div class="card-body" style="display:flex; flex-direction:column; gap:1.5rem;">
        <div>
          <h3 style="font-size:0.9rem; font-weight:700; color:#1e3a8a; margin-bottom:0.75rem;">CSSD Status Overview</h3>
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-info">
                <span class="stat-label">Total Sets</span>
                <span class="stat-value">${totalSets}</span>
              </div>
              <div class="stat-icon-wrapper" style="background:#e0f2fe; color:#0284c7;">📦</div>
            </div>
            <div class="stat-card">
              <div class="stat-info">
                <span class="stat-label">Available</span>
                <span class="stat-value">${availableSets}</span>
              </div>
              <div class="stat-icon-wrapper" style="background:#f0fdf4; color:#16a34a;">🟢</div>
            </div>
            <div class="stat-card">
              <div class="stat-info">
                <span class="stat-label">Dirty Queue</span>
                <span class="stat-value">${dirtySets}</span>
              </div>
              <div class="stat-icon-wrapper" style="background:#fef2f2; color:#dc2626;">🔴</div>
            </div>
            <div class="stat-card">
              <div class="stat-info">
                <span class="stat-label">Issued</span>
                <span class="stat-value">${issuedSets}</span>
              </div>
              <div class="stat-icon-wrapper" style="background:#fff7ed; color:#ea580c;">🔄</div>
            </div>
            <div class="stat-card">
              <div class="stat-info">
                <span class="stat-label">BI Pending</span>
                <span class="stat-value">${biPending}</span>
              </div>
              <div class="stat-icon-wrapper" style="background:#faf5ff; color:#9333ea;">⌛</div>
            </div>
            <div class="stat-card">
              <div class="stat-info">
                <span class="stat-label">Failed BI</span>
                <span class="stat-value" style="color:#be123c;">${failedLoads}</span>
              </div>
              <div class="stat-icon-wrapper" style="background:#fff1f2; color:#be123c;">⚠️</div>
            </div>
          </div>
        </div>

        <div style="display:grid; grid-template-columns:1fr 1fr; gap:1.5rem;">
          <!-- Active Autoclaves -->
          <div class="card">
            <div class="card-header">
              <span class="card-title">⚙️ Active Sterilizers &amp; Status</span>
            </div>
            <div class="card-body">
              <div style="display:flex; flex-direction:column; gap:0.75rem;">
                ${cs.sterilizers.map(st => `
                  <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #f1f5f9; padding-bottom:0.5rem;">
                    <div>
                      <strong style="font-size:0.85rem; color:#1e293b;">${st.name}</strong>
                      <div style="font-size:0.72rem; color:#64748b;">Last Calib: ${st.lastValidation} | PM Due: ${st.pmDueDate}</div>
                    </div>
                    <span class="badge badge-success">${st.status}</span>
                  </div>
                `).join('')}
              </div>
            </div>
          </div>

          <!-- Compliance RO/Water logs -->
          <div class="card">
            <div class="card-header">
              <span class="card-title">🧼 Feed/RO Water Compliance Audit</span>
            </div>
            <div class="card-body" style="font-size:0.8rem; color:#475569; line-height:1.6;">
              <p><strong>Current Active Standard:</strong> Feedwater TDS must remain below 100 ppm, and RO feed water below 10 ppm for autoclave sterilization cycles. Exceeding TDS limit scales sterilizer steam jacket coils.</p>
              <div style="background:#f8fafc; padding:0.75rem; border-radius:8px; margin-top:0.75rem; display:flex; justify-content:space-between; align-items:center; border:1px solid var(--border-color);">
                <div>
                  <div style="font-size:0.75rem; color:#64748b;">Latest RO Water reading:</div>
                  <strong style="font-size:0.9rem; color:#1e293b;">${cs.waterQualityLogs[0] ? cs.waterQualityLogs[0].roWaterTds : '—'}</strong>
                </div>
                <span class="badge badge-success">COMPLIANT</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Packaging Material Alert Card -->
        <div class="card" style="margin-top:1.5rem; text-align:left;">
          <div class="card-header">
            <span class="card-title">⚠️ Packaging Material Stock Alerts</span>
          </div>
          <div class="card-body">
            <div style="display:flex; flex-direction:column; gap:8px;">
              <div style="font-size:0.8rem; display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #f1f5f9; padding-bottom:0.5rem; color:var(--text-primary);">
                <span>Sterilisation Pouches (6×10cm): <strong>45 remaining</strong> <span class="badge badge-warning" style="font-size:8px;">LOW</span></span>
                <button class="btn btn-primary btn-xs" style="padding:2px 6px; font-size:8px;" onclick="window.showStockRequestOverlay({dept:'CSSD', urgency:'Routine', prefillItem:{code:'ITM-CSSD-POUCH', name:'Sterilisation Pouches (6×10cm)', qty:50, unit:'boxes'}, prefillType:'Consumable'})">Request →</button>
              </div>
              <div style="font-size:0.8rem; display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #f1f5f9; padding-bottom:0.5rem; color:var(--text-primary);">
                <span>Autoclave Tape: <strong>2 rolls remaining</strong> <span class="badge badge-danger" style="font-size:8px;">OUT</span></span>
                <button class="btn btn-primary btn-xs" style="padding:2px 6px; font-size:8px;" onclick="window.showStockRequestOverlay({dept:'CSSD', urgency:'Urgent', prefillItem:{code:'ITM-CSSD-TAPE', name:'Autoclave Tape', qty:10, unit:'rolls'}, prefillType:'Consumable'})">Request →</button>
              </div>
            </div>
          </div>
        </div>

        <!-- My Recent Requests -->
        ${window.renderMyRecentRequestsHTML ? window.renderMyRecentRequestsHTML('CSSD') : ''}
      </div>
    `;
  }

  else if (activeCSSDTab === 'return') {
    // Return queue management
    subContainer.innerHTML = `
      <div class="card-body">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem;">
          <h3 style="font-size:0.9rem; font-weight:700; color:#1e3a8a; margin:0;">OPD/IPD/OT Used Returns Queue</h3>
          <button class="btn btn-outline btn-sm" onclick="window.switchCSSDTab('return')">🔄 Refresh</button>
        </div>

        <div class="custom-table-container">
          <table class="custom-table">
            <thead>
              <tr>
                <th>Set ID</th>
                <th>Instrument Set Name</th>
                <th>Returned From</th>
                <th>Returned By</th>
                <th>Return Time</th>
                <th>Contamination</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              ${cs.instrumentSets.filter(s => s.status === 'Returned Dirty').map(item => `
                <tr>
                  <td><strong>${item.id}</strong></td>
                  <td>${item.name} <span class="badge ${item.isImplant ? 'badge-danger' : 'badge-primary'}">${item.isImplant ? 'Implant set' : 'Standard'}</span></td>
                  <td>OT Complex</td>
                  <td>Nurse Mary</td>
                  <td>${formatCSSDDate(new Date())}</td>
                  <td><span class="badge badge-danger">High (Dirty)</span></td>
                  <td>
                    <button class="btn btn-primary btn-sm" onclick="window.cssdDirtyReceiptAction('${item.id}', 'receive')">📥 Verify & Receive</button>
                  </td>
                </tr>
              `).join('')}
              ${cs.instrumentSets.filter(s => s.status === 'Returned Dirty').length === 0 ? `
                <tr>
                  <td colspan="7" style="text-align:center; color:#94a3b8; padding:2rem;">No used sets currently pending receipt in dirty queue.</td>
                </tr>
              ` : ''}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  else if (activeCSSDTab === 'cleaning') {
    // Cleaning area manual & washer cycles
    subContainer.innerHTML = `
      <div class="card-body">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem;">
          <h3 style="font-size:0.9rem; font-weight:700; color:#1e3a8a; margin:0;">Wash Room & Cleaning Cycles</h3>
        </div>

        <div class="custom-table-container">
          <table class="custom-table">
            <thead>
              <tr>
                <th>Queue ID</th>
                <th>Instrument Set</th>
                <th>Current Method</th>
                <th>Status</th>
                <th>Start Time</th>
                <th>Technician</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              ${cs.queues.cleaning.map(cln => `
                <tr>
                  <td><strong>${cln.id}</strong></td>
                  <td>${cln.setName} (${cln.setCode})</td>
                  <td>${cln.method}</td>
                  <td>
                    <span class="badge ${cln.status === 'Cleaning' ? 'badge-warning' : 'badge-primary'}">${cln.status}</span>
                  </td>
                  <td>${formatCSSDDate(cln.startTime)}</td>
                  <td>${cln.technician || '—'}</td>
                  <td>
                    ${cln.status === 'Awaiting Cleaning' ? `
                      <div style="display:flex; gap:0.4rem;">
                        <button class="btn btn-outline btn-sm" onclick="window.cssdStartCleaning('${cln.id}', 'Manual Pre-wash')">Manual</button>
                        <button class="btn btn-outline btn-sm" onclick="window.cssdStartCleaning('${cln.id}', 'Washer Disinfector')">Washer-Disinf</button>
                        <button class="btn btn-outline btn-sm" onclick="window.cssdStartCleaning('${cln.id}', 'Ultrasonic Cleaning')">Ultrasonic</button>
                      </div>
                    ` : `
                      <button class="btn btn-primary btn-sm" onclick="window.cssdCompleteCleaning('${cln.id}')">✅ Complete & Send</button>
                    `}
                  </td>
                </tr>
              `).join('')}
              ${cs.queues.cleaning.length === 0 ? `
                <tr>
                  <td colspan="7" style="text-align:center; color:#94a3b8; padding:2rem;">No items currently in wash or pre-clean queue.</td>
                </tr>
              ` : ''}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  else if (activeCSSDTab === 'inspect') {
    // Inspection and packaging
    subContainer.innerHTML = `
      <div class="card-body" style="display:flex; flex-direction:column; gap:1.5rem;">
        <div>
          <h3 style="font-size:0.9rem; font-weight:700; color:#1e3a8a; margin-bottom:0.25rem;">Technician Assembly, Inspection & Packing</h3>
          <p style="font-size:0.75rem; color:#64748b; margin:0;">
            Verify cleanliness, dry, lubricate hinge joints, assemble sets per checklist, and approve high-value item condemnation before double-wrap packing.
          </p>
        </div>

        <div>
          <h4 style="font-size:0.82rem; font-weight:700; color:#1e3a8a; margin-bottom:0.5rem;">1. Inspection & Assembly Queue</h4>
          <div class="custom-table-container">
            <table class="custom-table">
              <thead>
                <tr>
                  <th>Queue ID</th>
                  <th>Instrument Set</th>
                  <th>Status</th>
                  <th>Checklist Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                ${cs.queues.inspection.map(insp => `
                  <tr>
                    <td><strong>${insp.id}</strong></td>
                    <td>${insp.setName} (${insp.setCode})</td>
                    <td><span class="badge badge-danger">${insp.status}</span></td>
                    <td><span class="badge badge-info">${insp.checklistStatus}</span></td>
                    <td>
                      ${insp.status === 'Pending Condemnation Sign-off' ? `
                        ${cssdActiveRole === 'CSSD In-charge / Manager' || cssdActiveRole === 'CSSD Supervisor' ? `
                          <button class="btn btn-primary btn-sm" onclick="window.cssdInspectAction('${insp.id}', 'approve_condemn')">🛡️ Approve Condemn & Pass</button>
                        ` : `
                          <span style="font-size:11px; color:#be123c; font-weight:600;">Awaiting Manager Sign-off</span>
                        `}
                      ` : `
                        <div style="display:flex; gap:0.4rem;">
                          <button class="btn btn-primary btn-sm" onclick="window.cssdInspectAction('${insp.id}', 'pass')">✅ Pass Assembly</button>
                          <button class="btn btn-danger btn-sm" onclick="window.cssdInspectAction('${insp.id}', 'condemn')">⚠️ Condemn Instrument</button>
                        </div>
                      `}
                    </td>
                  </tr>
                `).join('')}
                ${cs.queues.inspection.length === 0 ? `
                  <tr>
                    <td colspan="5" style="text-align:center; color:#94a3b8; padding:1.5rem;">No items currently awaiting inspection checklist audit.</td>
                  </tr>
                ` : ''}
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <h4 style="font-size:0.82rem; font-weight:700; color:#1e3a8a; margin-bottom:0.5rem;">2. Packaging & Barcode Generation Queue</h4>
          <div class="custom-table-container">
            <table class="custom-table">
              <thead>
                <tr>
                  <th>Queue ID</th>
                  <th>Set Name</th>
                  <th>Packaging Wrap Selection</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                ${cs.queues.packing.map(pck => `
                  <tr>
                    <td><strong>${pck.id}</strong></td>
                    <td>${pck.setName} (${pck.setCode})</td>
                    <td>
                      <select id="wrap-${pck.id}" class="form-select" style="font-size:11px; padding:0.25rem 0.5rem; width:220px; display:inline-block;">
                        <option value="Double Wrap Non-Woven SMS">Double Wrap Non-Woven SMS</option>
                        <option value="Sterilization Pouch Paper-Plastic">Sterilization Pouch Paper-Plastic</option>
                        <option value="Rigid Sterilization Container">Rigid Sterilization Container</option>
                      </select>
                    </td>
                    <td>
                      <button class="btn btn-primary btn-sm" onclick="window.cssdPackAction('${pck.id}', document.getElementById('wrap-${pck.id}').value)">🏷️ Pack & Generate Barcode</button>
                    </td>
                  </tr>
                `).join('')}
                ${cs.queues.packing.length === 0 ? `
                  <tr>
                    <td colspan="4" style="text-align:center; color:#94a3b8; padding:1.5rem;">No items currently awaiting wrap packaging.</td>
                  </tr>
                ` : ''}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  }

  else if (activeCSSDTab === 'sterilization') {
    // Autoclave loader, cycle monitoring, and biological validation queues
    subContainer.innerHTML = `
      <div class="card-body" style="display:flex; flex-direction:column; gap:1.5rem;">
        <div>
          <h3 style="font-size:0.9rem; font-weight:700; color:#1e3a8a; margin-bottom:0.25rem;">Sterilization Load validation (Steam / ETO)</h3>
          <p style="font-size:0.75rem; color:#64748b; margin:0;">
            Model biological-indicator (BI) incubation time as a real delay. Non-implant loads are released based on chemical tests. Implant loads are held in Quarantine lock until negative BI validation, unless released under explicit Emergency Override.
          </p>
        </div>

        <!-- Sterilization active running loads -->
        <div>
          <h4 style="font-size:0.82rem; font-weight:700; color:#1e3a8a; margin-bottom:0.5rem;">1. Active/Pending Autoclave and ETO Loads</h4>
          <div class="custom-table-container">
            <table class="custom-table">
              <thead>
                <tr>
                  <th>Load No.</th>
                  <th>Sterilizer / Cycle</th>
                  <th>Implant?</th>
                  <th>Status</th>
                  <th>BI Incubation Status</th>
                  <th>Override details</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                ${cs.queues.sterilization.map(ster => {
                  let statusBadgeClass = 'badge-primary';
                  if (ster.status === 'Sterilization Started') { statusBadgeClass = 'badge-warning'; }
                  if (ster.status === 'Sterilization Completed') { statusBadgeClass = 'badge-success'; }

                  return `
                    <tr>
                      <td><strong>${ster.loadNo}</strong><br><span style="font-size:10px;color:#64748b;">Cycle: ${ster.cycleNo}</span></td>
                      <td>${ster.sterilizer}<br><span style="font-size:10px;color:#64748b;">${ster.temperature} / ${ster.pressure} / ${ster.exposureTime}</span></td>
                      <td>
                        <span class="badge ${ster.isImplant ? 'badge-danger' : 'badge-primary'}">
                          ${ster.isImplant ? '🔴 Yes (Implant)' : 'No'}
                        </span>
                      </td>
                      <td><span class="badge ${statusBadgeClass}">${ster.status}</span></td>
                      <td>
                        ${ster.biStatus === 'Incubating' ? `
                          <span class="badge badge-warning" style="animation: pulse 2s infinite;">⏳ Incubating (TDS Hold)</span>
                        ` : `
                          <span class="badge ${ster.biResult === 'Positive' ? 'badge-danger' : (ster.biResult === 'Negative' ? 'badge-success' : 'badge-primary')}">
                            ${ster.biResult ? `BI: ${ster.biResult}` : `Pending Start`}
                          </span>
                        `}
                      </td>
                      <td>
                        ${ster.emergencyOverride ? `
                          <div style="font-size:10px; color:#be123c; font-weight:600;">
                            ⚠️ Released Prematurely<br>Surgeon: ${ster.emergencyOverride.surgeon}
                          </div>
                        ` : 'None'}
                      </td>
                      <td>
                        ${ster.status === 'Awaiting Sterilization' ? `
                          <div style="display:flex; gap:0.4rem;">
                            <button class="btn btn-primary btn-sm" onclick="window.cssdStartSterilization('${ster.id}', 'Steam', false)">Start Steam</button>
                            <button class="btn btn-outline btn-sm" style="border-color:#ea580c; color:#ea580c;" onclick="window.cssdStartSterilization('${ster.id}', 'Steam', true)">🚨 IUSS Flash</button>
                          </div>
                        ` : ''}

                        ${ster.status === 'Sterilization Started' ? `
                          <button class="btn btn-primary btn-sm" onclick="window.cssdCompleteSterilization('${ster.id}')">🏁 Cycle Done (Start BI)</button>
                        ` : ''}

                        ${ster.status === 'Sterilization Completed' && ster.biStatus === 'Incubating' ? `
                          <div style="display:flex; flex-direction:column; gap:0.4rem;">
                            ${ster.isImplant && !ster.emergencyOverride ? `
                              <button class="btn btn-danger btn-sm" onclick="window.cssdIncubateOverride('${ster.id}')">⚠️ Emergency Release Override</button>
                            ` : ''}
                            <div style="display:flex; gap:0.3rem;">
                              <button class="btn btn-primary btn-sm" onclick="window.cssdSubmitBIResult('${ster.id}', 'Negative')">Confirm Neg (Pass)</button>
                              <button class="btn btn-danger btn-sm" onclick="window.cssdSubmitBIResult('${ster.id}', 'Positive')">Confirm Pos (Fail)</button>
                            </div>
                          </div>
                        ` : ''}
                      </td>
                    </tr>
                  `;
                }).join('')}
                ${cs.queues.sterilization.length === 0 ? `
                  <tr>
                    <td colspan="7" style="text-align:center; color:#94a3b8; padding:1.5rem;">No active loads in sterilizer or validation pipeline.</td>
                  </tr>
                ` : ''}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  }

  else if (activeCSSDTab === 'storage') {
    // Sterile storage register
    subContainer.innerHTML = `
      <div class="card-body">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem;">
          <h3 style="font-size:0.9rem; font-weight:700; color:#1e3a8a; margin:0;">Sterile Storage &amp; Checkout</h3>
        </div>

        <div class="custom-table-container">
          <table class="custom-table">
            <thead>
              <tr>
                <th>Barcode ID</th>
                <th>Set Name</th>
                <th>Category</th>
                <th>Location Rack</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              ${cs.instrumentSets.map(s => `
                <tr>
                  <td><strong class="mono">${s.barcode || s.id}</strong></td>
                  <td>${s.name} <span class="badge ${s.isImplant ? 'badge-danger' : 'badge-primary'}">${s.isImplant ? 'Implant set' : 'Standard'}</span></td>
                  <td>${s.category}</td>
                  <td>${s.location}</td>
                  <td>
                    <span class="badge ${s.status === 'Available' ? 'badge-success' : (s.status.includes('Override') ? 'badge-warning' : 'badge-primary')}">
                      ${s.status}
                    </span>
                  </td>
                  <td>
                    ${s.status.includes('Available') ? `
                      <button class="btn btn-primary btn-sm" onclick="window.cssdIssueSterileSet('${s.id}')">📤 Issue to OT / Dept</button>
                    ` : `
                      <span style="font-size:11px; color:#64748b;">Not available in storage</span>
                    `}
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  else if (activeCSSDTab === 'loaner') {
    // Loaner logistics and vendor dispute logs
    subContainer.innerHTML = `
      <div class="card-body" style="display:flex; flex-direction:column; gap:1.5rem;">
        <div>
          <h3 style="font-size:0.9rem; font-weight:700; color:#1e3a8a; margin-bottom:0.25rem;">Vendor Loaner / Consignment Sets Pipeline</h3>
          <p style="font-size:0.75rem; color:#64748b; margin:0;">
            Supplied temporarily for specialty joint replacements or spine fusions. Maintain clean/inspect sterilization pipeline and vendor return checkouts.
          </p>
        </div>

        <div class="custom-table-container">
          <table class="custom-table">
            <thead>
              <tr>
                <th>Loaner ID</th>
                <th>Set Description</th>
                <th>Vendor</th>
                <th>Patient UHID</th>
                <th>Arrival Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              ${cs.loanerSets.map(lnr => `
                <tr>
                  <td><strong>${lnr.id}</strong></td>
                  <td>${lnr.name}</td>
                  <td>${lnr.vendor}</td>
                  <td>${lnr.patientName}</td>
                  <td>${lnr.arrivalDate}</td>
                  <td>
                    <span class="badge ${lnr.status.includes('Returned') ? 'badge-success' : 'badge-danger'}">
                      ${lnr.status}
                    </span>
                  </td>
                  <td>
                    ${lnr.status !== 'Returned to Vendor' ? `
                      <button class="btn btn-danger btn-sm" onclick="window.cssdReturnLoanerToVendor('${lnr.id}')">🤝 Return to Vendor</button>
                    ` : `
                      <span class="badge badge-success">Dispatched &amp; Signed Off</span>
                    `}
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;

    window.cssdReturnLoanerToVendor = function(lnrId) {
      const lnr = cs.loanerSets.find(l => l.id === lnrId);
      if (!lnr) return;

      const dispute = prompt("Enter damage/dispute remarks if any (leave blank if returned complete & undamaged):") || "";
      
      lnr.status = "Returned to Vendor";
      lnr.returnStatus = dispute ? "Returned with Dispute" : "Returned (Clean)";
      lnr.disputeRemarks = dispute;

      logCSSDAudit("Returned Loaner Set to Vendor", `Returned set ${lnr.name} to ${lnr.vendor}. Dispute: ${dispute || 'None'}`);
      window.views.cssd(container);
    };
  }

  else if (activeCSSDTab === 'recall') {
    // Implant batch recall tracking
    subContainer.innerHTML = `
      <div class="card-body" style="display:flex; flex-direction:column; gap:1.5rem;">
        <div>
          <h3 style="font-size:0.9rem; font-weight:700; color:#1e3a8a; margin-bottom:0.25rem;">Implant batch tracking &amp; Patient Recall Desk</h3>
          <p style="font-size:0.75rem; color:#64748b; margin:0;">
            Safety-critical search utility. Look up a lot/batch number or patient UHID to immediately find patient linkages and execute audit reviews.
          </p>
        </div>

        <div style="background:#f8fafc; padding:1.25rem; border-radius:8px; display:flex; gap:1rem; align-items:flex-end; border:1px solid var(--border-color);">
          <div style="flex:1;">
            <label style="font-weight:700; font-size:11px; color:#475569; display:block; margin-bottom:4px;">Search Implant Lot/Batch Number:</label>
            <input type="text" id="recall-lot-query" class="form-control" placeholder="e.g. LOT-9921A" style="height:36px;">
          </div>
          <button class="btn btn-primary" style="height:36px;" onclick="window.cssdRunRecallQuery()">🔍 Search Traceability Registry</button>
        </div>

        <div id="recall-results-container" style="display:none; margin-top:1rem;">
          <h4 style="font-size:0.82rem; font-weight:700; color:#1e3a8a; margin-bottom:0.5rem;">Affected Patients &amp; Surgical Audits</h4>
          <div class="custom-table-container">
            <table class="custom-table" id="recall-results-table">
              <thead>
                <tr>
                  <th>Issue ID</th>
                  <th>Patient UHID</th>
                  <th>Procedure</th>
                  <th>Surgeon</th>
                  <th>Implant Details</th>
                  <th>Date Issued</th>
                </tr>
              </thead>
              <tbody id="recall-results-body"></tbody>
            </table>
          </div>
        </div>
      </div>
    `;

    window.cssdRunRecallQuery = function() {
      const q = document.getElementById('recall-lot-query').value.trim();
      if (!q) {
        alert("Please enter a lot/batch number.");
        return;
      }

      const results = cs.implantIssues.filter(iss => iss.lotNumber.toLowerCase() === q.toLowerCase());
      const body = document.getElementById('recall-results-body');
      const containerDiv = document.getElementById('recall-results-container');

      if (results.length === 0) {
        body.innerHTML = `<tr><td colspan="6" style="text-align:center;color:#94a3b8;">No matching patient issues found for implant batch: <strong>${q}</strong></td></tr>`;
      } else {
        body.innerHTML = results.map(r => `
          <tr>
            <td><strong>${r.id}</strong></td>
            <td>${r.patientName} (<strong>${r.patientUhid}</strong>)</td>
            <td>${r.procedure}</td>
            <td>${r.surgeon}</td>
            <td>${r.implantName} (Lot: <span class="mono" style="font-weight:700;">${r.lotNumber}</span>)</td>
            <td>${r.issuedDate}</td>
          </tr>
        `).join('');
      }

      containerDiv.style.display = 'block';
    };
  }

  else if (activeCSSDTab === 'equipment') {
    // Water quality feed-ro logs, autoclave validation records
    subContainer.innerHTML = `
      <div class="card-body">
        <div style="display:grid; grid-template-columns: 1fr 2fr; gap:1.5rem;">
          
          <!-- Left: Submit water measurement -->
          <div class="card" style="padding:1.25rem; height:fit-content; background:#f8fafc;">
            <h4 style="font-size:0.85rem; font-weight:700; color:#1e3a8a; margin-bottom:1rem;">💧 RO Water TDS Log Audit</h4>
            <div style="display:flex; flex-direction:column; gap:10px;">
              <div class="form-group">
                <label class="form-label">Feedwater TDS (Taps) *</label>
                <input type="number" id="water-feed-tds" class="form-control" placeholder="ppm" value="180">
              </div>
              <div class="form-group">
                <label class="form-label">RO Permeate TDS (Autoclave Feed) *</label>
                <input type="number" id="water-ro-tds" class="form-control" placeholder="ppm" value="4">
              </div>
              <div class="form-group">
                <label class="form-label">pH Value *</label>
                <input type="number" step="0.1" id="water-ph" class="form-control" placeholder="pH" value="6.9">
              </div>
              <button class="btn btn-primary" style="margin-top:0.5rem;" onclick="window.cssdSubmitWaterLog()">📝 Submit Daily Log</button>
            </div>
          </div>

          <!-- Right: water quality logs database list -->
          <div class="card" style="padding:1.25rem;">
            <h4 style="font-size:0.85rem; font-weight:700; color:#1e3a8a; margin-bottom:1rem;">Autoclave RO Quality Logs History</h4>
            <div class="custom-table-container">
              <table class="custom-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Feed TDS</th>
                    <th>RO TDS</th>
                    <th>pH</th>
                    <th>Logged By</th>
                  </tr>
                </thead>
                <tbody>
                  ${cs.waterQualityLogs.map(l => `
                    <tr>
                      <td>${l.date}</td>
                      <td>${l.time}</td>
                      <td>${l.feedWaterTds}</td>
                      <td><strong style="color:${parseInt(l.roWaterTds) > 10 ? '#ef4444' : '#16a34a'};">${l.roWaterTds}</strong></td>
                      <td>${l.ph}</td>
                      <td>${l.loggedBy}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    `;
  }

  else if (activeCSSDTab === 'audit') {
    // Immutable audit logs
    subContainer.innerHTML = `
      <div class="card-body">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem;">
          <h3 style="font-size:0.9rem; font-weight:700; color:#1e3a8a; margin:0;">Immutable CSSD Audit Registry</h3>
          <button class="btn btn-outline btn-sm" onclick="window.switchCSSDTab('audit')">🔄 Refresh Registry</button>
        </div>

        <div class="custom-table-container">
          <table class="custom-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Triggered By Role</th>
                <th>Action</th>
                <th>Details / Verification Payload</th>
              </tr>
            </thead>
            <tbody>
              ${cs.auditLogs.map(log => `
                <tr>
                  <td class="mono" style="font-size:10px; width:150px;">${formatCSSDDate(log.timestamp)}</td>
                  <td><span class="badge badge-primary">${log.user}</span></td>
                  <td><strong>${log.action}</strong></td>
                  <td style="font-size:11px; font-family:monospace; color:#3b82f6;">${log.details}</td>
                </tr>
              `).join('')}
              ${cs.auditLogs.length === 0 ? `
                <tr>
                  <td colspan="4" style="text-align:center; color:#94a3b8; padding:2rem;">No audit transactions recorded yet.</td>
                </tr>
              ` : ''}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }
};
