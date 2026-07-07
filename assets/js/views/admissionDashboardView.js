// Front Desk / Admission & Bed Command Center Dashboard
// Saronil Health HIS

(function() {
  // Initialize mock data in state if not present
  function initAdmissionState() {
    if (!window.state) window.state = {};
    
    // Make sure bedsStatus exists
    window.state.bedsStatus = window.state.bedsStatus || {};
    
    // Only initialise beds if bedsStatus is completely empty (state.js hasn't seeded yet)
    // This guards against overwriting state.js seedState() canonical bed assignments
    if (Object.keys(window.state.bedsStatus).length === 0) {
      const wardsConfig = {
        "GENERAL-WARD-M": { name: "General Ward (Male)", beds: ["GW(M)-409", "GW(M)-410", "GW(M)-411", "GW(M)-412", "GW(M)-413"], price: 1500 },
        "GENERAL-WARD-F": { name: "General Ward (Female)", beds: ["GW(F)-414", "GW(F)-415", "GW(F)-416", "GW(F)-417", "GW(F)-418"], price: 1500 },
        "SEMI-PRIVATE": { name: "Semi-Private Ward", beds: ["SP-301", "SP-302", "SP-303", "SP-304", "SP-305"], price: 3000 },
        "PRIVATE": { name: "Private Room", beds: ["PVT-201", "PVT-202", "PVT-203", "PVT-204", "PVT-205"], price: 6000 },
        "DELUXE": { name: "Deluxe Suite", beds: ["DELUXE-401", "DELUXE-402", "DELUXE-403", "DELUXE-404"], price: 12000 },
        "CCU": { name: "Critical Care Unit", beds: ["CCU-BED-01", "CCU-BED-02", "CCU-BED-03", "CCU-BED-04", "CCU-BED-05"], price: 10000 },
        "ICCU": { name: "Intensive Cardiac Care Unit", beds: ["ICCU-BED-01", "ICCU-BED-02", "ICCU-BED-03", "ICCU-BED-04"], price: 12000 },
        "EMERGENCY": { name: "Emergency Ward", beds: ["EMG-01", "EMG-02", "EMG-03", "EMG-04", "EMG-05"], price: 2500 },
        "DAYCARE": { name: "Daycare Unit", beds: ["DC-B1", "DC-B2", "DC-B3", "DC-B4", "DC-B5", "DC-B6", "DC-B7", "DC-B8", "DC-B9", "DC-B10"], price: 1500 }
      };
      for (const [wardKey, info] of Object.entries(wardsConfig)) {
        info.beds.forEach(bed => {
          window.state.bedsStatus[bed] = {
            wardKey: wardKey,
            status: "Available",
            patientUhid: null,
            patientName: null
          };
        });
      }
    }

    // Enrich any occupied beds that lack patient details (fill from state.patients)
    // Only fills beds where patientUhid exists but patientName is missing
    const pats = window.state.patients || [];
    Object.keys(window.state.bedsStatus).forEach(bed => {
      const bs = window.state.bedsStatus[bed];
      if (bs.status === 'Occupied' && bs.patientUhid && !bs.patientName) {
        const pat = pats.find(p => p.uhid === bs.patientUhid);
        if (pat) {
          bs.patientName = pat.name;
          bs.doctorName  = pat.primaryConsultant || bs.doctorName;
          bs.diagnosis   = (pat.clinicalData && pat.clinicalData.diagnosis) || bs.diagnosis;
        }
      }
    });

    // Mark one available bed as Reserved and one as Blocked for demonstration
    // (only if no Reserved/Blocked beds already exist)
    const hasReserved = Object.values(window.state.bedsStatus).some(b => b.status === 'Reserved');
    const hasBlocked  = Object.values(window.state.bedsStatus).some(b => b.status === 'Blocked');
    if (!hasReserved || !hasBlocked) {
      const availableKeys = Object.keys(window.state.bedsStatus).filter(k =>
        window.state.bedsStatus[k].status === 'Available'
      );
      if (!hasReserved && availableKeys.length >= 1) {
        window.state.bedsStatus[availableKeys[0]] = {
          wardKey: window.state.bedsStatus[availableKeys[0]].wardKey,
          status: "Reserved",
          patientUhid: "SH-2026-04826",
          patientName: "Meera Iyer",
          expectedTime: "18:00"
        };
      }
      if (!hasBlocked && availableKeys.length >= 2) {
        window.state.bedsStatus[availableKeys[1]] = {
          wardKey: window.state.bedsStatus[availableKeys[1]].wardKey,
          status: "Blocked",
          reason: "Maintenance / Terminal Cleaning"
        };
      }
    }

    // OPD Token Queue — uses real patients from state.appointments if available
    if (!window.state.opdTokens) {
      const todayAppts = (window.state.appointments || []).filter(a =>
        a.status === 'Checked-in' || a.status === 'Checked In' || a.status === 'Arrived'
      ).slice(0, 5);
      if (todayAppts.length >= 3) {
        window.state.opdTokens = todayAppts.map((a, i) => ({
          token: 'T-10' + (i + 1),
          name: a.patientName,
          uhid: a.uhid,
          type: 'Appointment',
          doctor: a.doctorName,
          priority: 'Regular',
          priorityClass: 'priority-regular',
          waitTime: (a.waitTime || (10 + i * 5)) + 'm',
          status: i === 1 ? 'Called' : 'Waiting'
        }));
      } else {
        window.state.opdTokens = [
          { token: "T-101", name: "Sunita Sharma",  uhid: "SH-2026-04817", type: "Appointment", doctor: "Dr. Priya Nair",    priority: "Pregnant",       priorityClass: "priority-pregnant",  waitTime: "12m", status: "Waiting" },
          { token: "T-102", name: "Meera Iyer",     uhid: "SH-2026-04826", type: "Appointment", doctor: "Dr. Ramesh Iyer",  priority: "Paediatric",    priorityClass: "priority-senior",   waitTime: "8m",  status: "Called" },
          { token: "T-103", name: "Anjali Bose",    uhid: "SH-2026-04845", type: "Appointment", doctor: "Dr. Priya Nair",  priority: "Regular",       priorityClass: "priority-regular",  waitTime: "24m", status: "Waiting" },
          { token: "T-104", name: "Rajan Pillai",   uhid: "SH-2026-04840", type: "Appointment", doctor: "Dr. Srinivasan", priority: "Senior (>60)",   priorityClass: "priority-senior",   waitTime: "30m", status: "Waiting" },
          { token: "T-105", name: "Deepak Verma",   uhid: "SH-2026-04755", type: "Walk-in",    doctor: "Dr. Fatima Sheikh", priority: "Emergency",    priorityClass: "priority-emergency", waitTime: "2m",  status: "In-Consultation" }
        ];
      }
    }

    // Recent Registrations — use real patients from state.patients
    if (!window.state.recentRegistrations) {
      const recentIPD = (window.state.patients || []).filter(p => p.type === 'IPD' && p.status !== 'Discharged').slice(0, 4);
      if (recentIPD.length >= 2) {
        window.state.recentRegistrations = recentIPD.map((p, i) => ({
          uhid: p.uhid,
          name: p.name,
          age: String(p.age || ''),
          gender: p.gender === 'Male' ? 'M' : 'F',
          type: 'IPD',
          doctor: p.primaryConsultant || '',
          wardType: p.ward || 'General',
          deposit: i % 2 === 0 ? 'Paid ₹15,000' : 'Pending',
          depositClass: i % 2 === 0 ? 'text-emerald-600 font-semibold' : 'text-red-600 font-semibold',
          flags: p.flags && p.flags.length ? p.flags : ['TPA Case'],
          status: 'Admitted'
        }));
      } else {
        window.state.recentRegistrations = [
          { uhid: "SH-2026-04821", name: "Rajesh Kumar",   age: "45", gender: "M", type: "IPD", doctor: "Dr. Srinivasan",  wardType: "General Ward (Male)", deposit: "Paid ₹15,000", depositClass: "text-emerald-600 font-semibold", flags: ["TPA Case", "Consent Pending"], status: "Admitted" },
          { uhid: "SH-2026-04803", name: "Priya Menon",    age: "38", gender: "F", type: "IPD", doctor: "Dr. Krishnamurthy",wardType: "Private Room",        deposit: "Pending",       depositClass: "text-red-600 font-semibold",     flags: ["Self Pay"],             status: "Admitted" },
          { uhid: "SH-2026-04755", name: "Deepak Verma",   age: "41", gender: "M", type: "Emergency", doctor: "Dr. Fatima Sheikh", wardType: "Emergency", deposit: "Waived-Charity",  depositClass: "text-blue-600 font-semibold",   flags: ["Critical", "MLC"],      status: "In Triage" },
          { uhid: "SH-2026-04817", name: "Sunita Sharma",  age: "29", gender: "F", type: "OPD", doctor: "Dr. Priya Nair",  wardType: "-",                  deposit: "-",             depositClass: "text-slate-500",               flags: [],                       status: "In Consultation" }
        ];
      }
    }

    // Waiting for Bed Allotment — use real admission requests
    if (!window.state.waitingBedAllotment) {
      const reqs = window.state.admissionRequests || [];
      if (reqs.length >= 2) {
        window.state.waitingBedAllotment = reqs.map((r, i) => ({
          name: r.name,
          uhid: r.uhid,
          wardType: r.ward || 'General',
          doctor: r.refDoc || '',
          waitingSince: r.waitingHrs + 'h',
          waitingMins: (r.waitingHrs || 1) * 60,
          deposit: r.advancePaid ? 'Paid ₹5,000' : 'Pending'
        }));
      } else {
        window.state.waitingBedAllotment = [
          { name: "Sunita Sharma",  uhid: "SH-2026-04817", wardType: "Semi-Private",    doctor: "Dr. Srinivasan", waitingSince: "1.5h", waitingMins: 90,  deposit: "Paid ₹5,000" },
          { name: "Deepak Verma",   uhid: "SH-2026-04755", wardType: "CCU",             doctor: "Dr. Fatima Sheikh", waitingSince: "3.2h", waitingMins: 192, deposit: "Pending" },
          { name: "Pramod Rao",     uhid: "SH-2026-04851", wardType: "General",         doctor: "Dr. Anand",      waitingSince: "4.5h", waitingMins: 270, deposit: "Paid ₹2,000" }
        ];
      }
    }

    // Pending Documentation checklist
    if (!window.state.pendingDocuments) {
      window.state.pendingDocuments = [
        { id: 1, name: "Sunita Sharma",  item: "ABHA ID not verified",       type: "ABHA",     assigned: "Front Desk 1" },
        { id: 2, name: "Deepak Verma",   item: "General consent unsigned",    type: "Consent",  assigned: "Ward Nurse CCU" },
        { id: 3, name: "Rajesh Kumar",   item: "Pre-auth not initiated",      type: "Insurance", assigned: "TPA Desk" },
        { id: 4, name: "Fatima Begum",   item: "MLC police intimation pending",type: "MLC",      assigned: "Front Desk Admin" }
      ];
    }

    // MLC & Emergency logs — use real MLC patients from state
    if (!window.state.mlcLog) {
      window.state.mlcLog = [
        { name: "Deepak Verma", uhid: "SH-2026-04755", nature: "Road Traffic Accident", time: "10:45 AM", station: "Saket PS", status: "Sent" },
        { name: "Unknown Male", uhid: "UNK-001",        nature: "Assault / Head Injury", time: "02:15 PM", station: "Malviya Nagar PS", status: "Pending" }
      ];
    }

    if (!window.state.broughtDeadLog) {
      window.state.broughtDeadLog = [
        { name: "Suresh K.", time: "08:45 AM", police: "Intimated", status: "Registered" }
      ];
    }

    // Transfer Queue — use real transfer requests
    if (!window.state.transferQueue) {
      const trfs = window.state.transferRequests || [];
      if (trfs.length) {
        window.state.transferQueue = trfs.map(t => ({
          name: t.name,
          uhid: t.uhid,
          from: t.currentBed || t.currentWard,
          to: t.targetWard,
          requestedBy: t.requestedBy,
          time: '20m ago'
        }));
      } else {
        window.state.transferQueue = [
          { name: "Suresh Babu", uhid: "SH-2026-04768", from: "SP-302", to: "CCU", requestedBy: "Dr. Srinivasan", time: "20m ago" }
        ];
      }
    }

    // Birth & Death Draft Registry
    if (!window.state.birthRegistry) window.state.birthRegistry = [];
    if (!window.state.deathRegistry) window.state.deathRegistry = [];
  }

  // Define global view function
  window.views = window.views || {};
  window.views.admissionDashboard = function(container) {
    initAdmissionState();
    
    // Calculate stats
    const totalBedsCount = Object.keys(window.state.bedsStatus).length;
    const occupiedBedsCount = Object.values(window.state.bedsStatus).filter(b => b.status === "Occupied").length;
    const vacantBedsCount = Object.values(window.state.bedsStatus).filter(b => b.status === "Available" || b.status === "Vacant").length;
    
    const generalBeds = Object.entries(window.state.bedsStatus).filter(([k, b]) => b.wardKey.includes('GENERAL')).length;
    const semiPvtBeds = Object.entries(window.state.bedsStatus).filter(([k, b]) => b.wardKey.includes('SEMI')).length;
    const privateBeds = Object.entries(window.state.bedsStatus).filter(([k, b]) => b.wardKey.includes('PRIVATE')).length;
    const icuBeds = Object.entries(window.state.bedsStatus).filter(([k, b]) => b.wardKey.includes('CCU') || b.wardKey.includes('ICCU')).length;

    const opdAdmissionsCount = window.state.recentRegistrations.filter(r => r.type === 'OPD').length;
    const ipdAdmissionsCount = window.state.recentRegistrations.filter(r => r.type === 'IPD').length;
    const emergencyAdmissionsCount = window.state.recentRegistrations.filter(r => r.type === 'Emergency').length;
    
    // Dynamic discharge counts
    const compDis = (window.state.patients || []).filter(p => p.dischargeStatus === 'Completed').length;
    const pendDis = (window.state.patients || []).filter(p => p.dischargeStatus === 'In Progress — Clearances Pending').length;
    const totalDisToday = compDis + pendDis;
    
    const activeOpdTokens = window.state.opdTokens.filter(t => t.status !== 'Done' && t.status !== 'No-Show');
    const calledTokenObj = window.state.opdTokens.find(t => t.status === 'Called') || window.state.opdTokens[0];
    const currentTokenStr = calledTokenObj ? calledTokenObj.token : "None";

    // Set base view structure with global styles injected
    const styles = `
      <style>
        .priority-emergency { background-color: #FEE2E2; color: #991B1B; border: 1px solid #FCA5A5; }
        .priority-senior { background-color: #FEF3C7; color: #92400E; border: 1px solid #FDE68A; }
        .priority-pregnant { background-color: #FCE7F3; color: #9D174D; border: 1px solid #FBCFE8; }
        .priority-disability { background-color: #ECFDF5; color: #065F46; border: 1px solid #A7F3D0; }
        .priority-regular { background-color: #F1F5F9; color: #334155; border: 1px solid #E2E8F0; }
        
        .bed-cell {
          border: 1px solid var(--border-color);
          background-color: var(--bg-surface);
          border-radius: 6px;
          padding: 8px;
          transition: all 0.2s ease-in-out;
          font-size: 0.72rem;
          min-height: 94px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          position: relative;
        }
        .bed-cell:hover {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
          transform: translateY(-2px);
        }
        .bed-status-vacant { border-left: 4px solid #10B981; }
        .bed-status-occupied { border-left: 4px solid #3B82F6; }
        .bed-status-critical { border-left: 4px solid #EF4444; }
        .bed-status-reserved { border-left: 4px solid #F59E0B; }
        .bed-status-blocked { border-left: 4px solid #6B7280; }
        .bed-status-isolation { border-left: 4px solid #8B5CF6; }
        
        .alert-row {
          padding: 10px;
          border-radius: 6px;
          border-left: 4px solid transparent;
          font-size: 0.75rem;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .alert-red { background-color: #FEF2F2; border-left-color: #EF4444; color: #991B1B; border: 1px solid #FEE2E2; }
        .alert-amber { background-color: #FFFBEB; border-left-color: #F59E0B; color: #92400E; border: 1px solid #FEF3C7; }
        .alert-blue { background-color: #EFF6FF; border-left-color: #3B82F6; color: #1E40AF; border: 1px solid #DBEAFE; }
        .alert-orange { background-color: #FFFAF0; border-left-color: #ED8936; color: #C05621; border: 1px solid #FEEBC8; }

        .wizard-step {
          display: none;
        }
        .wizard-step.active {
          display: block;
        }
        .step-indicator {
          flex: 1;
          text-align: center;
          padding: 8px;
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--text-muted);
          border-bottom: 2px solid var(--border-color);
          transition: all 0.2s;
        }
        .step-indicator.active {
          color: var(--primary);
          border-bottom-color: var(--primary);
        }
        .step-indicator.completed {
          color: #10B981;
          border-bottom-color: #10B981;
        }
      </style>
    `;

    container.innerHTML = styles + `
      <div style="padding: 12px 0;">
        <!-- SECTION 1 — PAGE HEADER -->
        <div style="margin-top: 4px; margin-bottom: 16px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
          <div>
            <h1 style="font-size: 1.35rem; font-weight: 700; color: var(--text-primary); margin: 0; font-family: var(--font-display);">Admission & Bed Command Center</h1>
            <div style="font-size: 0.78rem; color: var(--text-muted); margin-top: 2px;">Real-time bed board status · Patient admissions · OPD queue · Internal transfers</div>
          </div>
          <div style="display: flex; gap: 8px; align-items: center;">
            <div class="admin-mono" style="font-size: 0.72rem; background-color: var(--primary-glow); color: var(--primary); padding: 4px 12px; border-radius: 4px; font-weight: 600; border: 1px solid var(--border-color);">
              Admission Coordinator
            </div>
            <div id="live-shift-status" class="admin-mono" style="font-size: 0.72rem; background: var(--bg-surface-elevated); padding: 4px 12px; border-radius: 4px; border: 1px solid var(--border-color); font-weight: 500;">
              Loading shift...
            </div>
            <div id="live-time-badge" class="admin-mono" style="font-size: 0.72rem; background: #FFF; border: 1px solid var(--border-color); padding: 4px 12px; border-radius: 4px; font-weight: bold; color: var(--text-primary);">
              00:00:00 AM
            </div>
          </div>
        </div>

        <!-- SECTION 2 — KPI STAT CARDS -->
        <div class="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-8 gap-4 mb-6">
          <!-- Card 1: Today's Admissions -->
          <div class="bg-white rounded-lg border border-slate-200 p-4 flex flex-col justify-between" style="min-height: 105px;">
            <div>
              <div class="text-xs text-slate-500 font-medium">Today's Admissions</div>
              <div class="text-xl font-bold tracking-tight text-slate-900 mt-1">${ipdAdmissionsCount + emergencyAdmissionsCount + opdAdmissionsCount}</div>
            </div>
            <div class="text-[10px] text-slate-400 font-mono mt-1">IPD ${ipdAdmissionsCount} | Day ${opdAdmissionsCount} | ER ${emergencyAdmissionsCount}</div>
          </div>

          <!-- Card 2: Pending Admissions -->
          <div class="bg-white rounded-lg border border-slate-200 p-4 flex flex-col justify-between" style="min-height: 105px;">
            <div>
              <div class="text-xs text-slate-500 font-medium">Pending Admissions</div>
              <div class="text-xl font-bold tracking-tight text-amber-600 mt-1">${window.state.waitingBedAllotment.length}</div>
            </div>
            <div class="text-[10px] text-slate-400 font-medium mt-1">Advised in OPD/EMR</div>
          </div>

          <!-- Card 3: Available Beds -->
          <div class="bg-white rounded-lg border border-slate-200 p-4 flex flex-col justify-between" style="min-height: 105px;">
            <div>
              <div class="text-xs text-slate-500 font-medium">Available Beds</div>
              <div class="text-xl font-bold tracking-tight text-emerald-600 mt-1">${vacantBedsCount} / ${totalBedsCount}</div>
            </div>
            <div class="text-[10px] text-slate-400 font-mono mt-1">G:${generalBeds} | S:${semiPvtBeds} | P:${privateBeds} | I:${icuBeds}</div>
          </div>

          <!-- Card 4: Discharges Today -->
          <div class="bg-white rounded-lg border border-slate-200 p-4 flex flex-col justify-between" style="min-height: 105px;">
            <div>
              <div class="text-xs text-slate-500 font-medium">Discharges Today</div>
              <div class="text-xl font-bold tracking-tight text-slate-900 mt-1">${totalDisToday}</div>
            </div>
            <div class="text-[10px] text-slate-400 font-mono mt-1">Comp ${compDis} | Pending Clear ${pendDis}</div>
          </div>

          <!-- Card 5: Emergency/Casualty -->
          <div class="bg-white rounded-lg border border-slate-200 p-4 flex flex-col justify-between" style="min-height: 105px;">
            <div>
              <div class="text-xs text-slate-500 font-medium">Casualty Arrivals</div>
              <div class="text-xl font-bold tracking-tight text-red-600 mt-1">3</div>
            </div>
            <div class="text-[10px] text-slate-400 font-mono mt-1">MLC 2 | Non-MLC 1</div>
          </div>

          <!-- Card 6: OPD Patients Today -->
          <div class="bg-white rounded-lg border border-slate-200 p-4 flex flex-col justify-between" style="min-height: 105px;">
            <div>
              <div class="text-xs text-slate-500 font-medium">OPD Patients Today</div>
              <div class="text-xl font-bold tracking-tight text-slate-900 mt-1">128</div>
            </div>
            <div class="text-[10px] text-slate-400 font-mono mt-1">Appt 80 | Walk-ins 48</div>
          </div>

          <!-- Card 7: Avg Admission Time -->
          <div class="bg-white rounded-lg border border-slate-200 p-4 flex flex-col justify-between" style="min-height: 105px;">
            <div>
              <div class="text-xs text-slate-500 font-medium">Avg Admission Time</div>
              <div class="text-xl font-bold tracking-tight text-slate-900 mt-1">22m</div>
            </div>
            <div class="text-[10px] text-slate-400 font-medium mt-1">Reg to bed allotment</div>
          </div>

          <!-- Card 8: Pending Documentation -->
          <div class="bg-white rounded-lg border border-slate-200 p-4 flex flex-col justify-between" style="min-height: 105px;">
            <div>
              <div class="text-xs text-slate-500 font-medium">Pending Docs</div>
              <div class="text-xl font-bold tracking-tight text-amber-500 mt-1">${window.state.pendingDocuments.length}</div>
            </div>
            <div class="text-[10px] text-slate-400 font-medium mt-1">ABHA/Consent/Deposit</div>
          </div>
        </div>

        <!-- SECTION 3 — QUICK ACTION BAR -->
        <div style="background-color: var(--bg-surface); padding: 10px 16px; border: 1px solid var(--border-color); border-radius: 6px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; margin-bottom: 16px;">
          <div style="display: flex; gap: 8px; flex-wrap: wrap;">
            <button class="btn btn-primary btn-sm" onclick="window.showRegistrationWizard('new')" style="display: flex; align-items: center; gap: 4px; font-weight: 600;">
              ➕ New Registration
            </button>
            <button class="btn btn-primary btn-sm" onclick="window.showRegistrationWizard('admit')" style="background-color: #2563EB; display: flex; align-items: center; gap: 4px; font-weight: 600;">
              🛌 Admit Patient
            </button>
            <button class="btn btn-secondary btn-sm" onclick="window.showTransferModal()" style="display: flex; align-items: center; gap: 4px;">
              🔄 Transfer Patient
            </button>
            <button class="btn btn-secondary btn-sm" onclick="window.showEmergencyAdmission()" style="display: flex; align-items: center; gap: 4px; border-color: #EF4444; color: #EF4444;">
              🚨 Emergency Admission
            </button>
            <button class="btn btn-secondary btn-sm" onclick="window.printAdmissionBlank()" style="display: flex; align-items: center; gap: 4px;">
              🖨️ Print Forms
            </button>
            <button class="btn btn-secondary btn-sm" onclick="window.showAttenderPassModal()">
              🎫 Attender Pass
            </button>
            <button class="btn btn-secondary btn-sm" onclick="window.showInsuranceVerifyModal()">
              🛡️ Insurance Verification
            </button>
            <button class="btn btn-secondary btn-sm" onclick="window.showAbhaVerifyModal()">
              🏥 ABHA Verification
            </button>
            <button class="btn btn-secondary btn-sm" onclick="window.showBirthModal()" style="color: #059669; border-color: #059669;">
              👶 Register Birth
            </button>
            <button class="btn btn-secondary btn-sm" onclick="window.showDeathModal()" style="color: #E11D48; border-color: #E11D48;">
              🪦 Register Death
            </button>
          </div>
          <div style="width: 280px; position: relative;">
            <input type="text" id="frontdesk-global-search" placeholder="UHID / Name / Mobile / Token..." onkeyup="window.filterFrontdeskDashboard(this.value)" style="width: 100%; border: 1px solid var(--border-color); border-radius: 4px; padding: 6px 12px; font-size: 0.8rem; background-color: #F8FAFC;">
          </div>
        </div>

        <!-- SECTION 4 — THREE-COLUMN MAIN AREA -->
        <div style="display: grid; grid-template-columns: 38% 32% 30%; gap: 16px; min-width: 1200px;">
          
          <!-- LEFT COLUMN (38%) -->
          <div style="display: flex; flex-direction: column; gap: 16px;">
            
            <!-- a) OPD TOKEN QUEUE -->
            <div class="card">
              <div class="card-header" style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-color); padding: 12px 16px;">
                <div>
                  <h2 style="font-size: 0.95rem; font-weight: 700; color: var(--text-primary); margin:0;">OPD Queue — Today</h2>
                  <div style="font-size: 0.72rem; color: var(--text-muted); margin-top: 2px;">
                    Current Active Token: <span class="admin-mono font-bold text-blue-600 text-sm" id="token-active-display">${currentTokenStr}</span>
                  </div>
                </div>
                <button class="btn btn-primary btn-sm" onclick="window.issueNextToken()" style="padding: 4px 8px; font-size: 0.72rem;">
                  🎟️ Issue Next Token
                </button>
              </div>
              <div class="card-body" style="padding: 12px;">
                <div style="display: flex; gap: 6px; margin-bottom: 10px;">
                  <button class="btn btn-sm text-[10px] btn-primary" id="btn-token-all" onclick="window.filterTokens('all')" style="padding: 2px 6px;">All</button>
                  <button class="btn btn-sm text-[10px] btn-secondary" id="btn-token-appt" onclick="window.filterTokens('Appointment')" style="padding: 2px 6px;">Appointments</button>
                  <button class="btn btn-sm text-[10px] btn-secondary" id="btn-token-walk" onclick="window.filterTokens('Walk-in')" style="padding: 2px 6px;">Walk-ins</button>
                  <button class="btn btn-sm text-[10px] btn-secondary" id="btn-token-priority" onclick="window.filterTokens('Priority')" style="padding: 2px 6px;">Priority Only</button>
                </div>
                
                <table style="width: 100%; border-collapse: collapse; font-size: 0.72rem;">
                  <thead>
                    <tr style="border-bottom: 1px solid var(--border-color); text-align: left; background-color: #F8FAFC;">
                      <th style="padding: 6px;">Token No</th>
                      <th style="padding: 6px;">Patient</th>
                      <th style="padding: 6px;">Type</th>
                      <th style="padding: 6px;">Doctor</th>
                      <th style="padding: 6px;">Priority</th>
                      <th style="padding: 6px;">Wait</th>
                      <th style="padding: 6px;">Status</th>
                      <th style="padding: 6px; text-align: right;">Action</th>
                    </tr>
                  </thead>
                  <tbody id="opd-token-table-body">
                    <!-- Dynamic Rows -->
                  </tbody>
                </table>
              </div>
            </div>

            <!-- b) RECENT REGISTRATIONS -->
            <div class="card">
              <div class="card-header" style="border-bottom: 1px solid var(--border-color); padding: 12px 16px;">
                <h2 style="font-size: 0.95rem; font-weight: 700; color: var(--text-primary); margin:0;">Recent Registrations</h2>
                <div style="display: flex; gap: 6px; margin-top: 8px;">
                  <button class="btn btn-sm text-[10px] btn-primary" id="btn-reg-all" onclick="window.filterRegistrations('all')" style="padding: 2px 6px;">All</button>
                  <button class="btn btn-sm text-[10px] btn-secondary" id="btn-reg-opd" onclick="window.filterRegistrations('OPD')" style="padding: 2px 6px;">OPD</button>
                  <button class="btn btn-sm text-[10px] btn-secondary" id="btn-reg-ipd" onclick="window.filterRegistrations('IPD')" style="padding: 2px 6px;">IPD</button>
                  <button class="btn btn-sm text-[10px] btn-secondary" id="btn-reg-emg" onclick="window.filterRegistrations('Emergency')" style="padding: 2px 6px;">Emergency</button>
                  <button class="btn btn-sm text-[10px] btn-secondary" id="btn-reg-day" onclick="window.filterRegistrations('Daycare')" style="padding: 2px 6px;">Daycare</button>
                </div>
              </div>
              <div class="card-body" style="padding: 12px; overflow-x: auto;">
                <table style="width: 100%; border-collapse: collapse; font-size: 0.72rem; min-width: 500px;">
                  <thead>
                    <tr style="border-bottom: 1px solid var(--border-color); text-align: left; background-color: #F8FAFC;">
                      <th style="padding: 6px;">UHID</th>
                      <th style="padding: 6px;">Name</th>
                      <th style="padding: 6px;">Age/Sex</th>
                      <th style="padding: 6px;">Type</th>
                      <th style="padding: 6px;">Doctor</th>
                      <th style="padding: 6px;">Deposit</th>
                      <th style="padding: 6px;">Flags</th>
                      <th style="padding: 6px;">Status</th>
                      <th style="padding: 6px; text-align: right;">Action</th>
                    </tr>
                  </thead>
                  <tbody id="recent-registrations-body">
                    <!-- Dynamic Rows -->
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <!-- CENTRE COLUMN (32%) -->
          <div style="display: flex; flex-direction: column; gap: 16px;">
            
            <!-- LIVE BED BOARD -->
            <div class="card">
              <div class="card-header" style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-color); padding: 12px 16px;">
                <h2 style="font-size: 0.95rem; font-weight: 700; color: var(--text-primary); margin:0;">Live Bed Board</h2>
                <button class="btn btn-secondary btn-sm" onclick="window.toggleFullScreenBedBoard()" style="font-size: 0.65rem; padding: 2px 6px;">
                  🖥️ Full Screen View
                </button>
              </div>
              <div class="card-body" style="padding: 12px;">
                <!-- Ward Filter Pills -->
                <div style="display: flex; flex-wrap: wrap; gap: 4px; margin-bottom: 12px;">
                  <button class="btn btn-sm text-[10px] btn-primary" id="btn-bed-all" onclick="window.filterBedBoard('all')" style="padding: 2px 6px;">All</button>
                  <button class="btn btn-sm text-[10px] btn-secondary" id="btn-bed-gen" onclick="window.filterBedBoard('GENERAL')" style="padding: 2px 6px;">General</button>
                  <button class="btn btn-sm text-[10px] btn-secondary" id="btn-bed-semi" onclick="window.filterBedBoard('SEMI')" style="padding: 2px 6px;">Semi-Pvt</button>
                  <button class="btn btn-sm text-[10px] btn-secondary" id="btn-bed-pvt" onclick="window.filterBedBoard('PRIVATE')" style="padding: 2px 6px;">Private</button>
                  <button class="btn btn-sm text-[10px] btn-secondary" id="btn-bed-dlx" onclick="window.filterBedBoard('DELUXE')" style="padding: 2px 6px;">Deluxe</button>
                  <button class="btn btn-sm text-[10px] btn-secondary" id="btn-bed-icu" onclick="window.filterBedBoard('ICU')" style="padding: 2px 6px;">ICU / CCU</button>
                  <button class="btn btn-sm text-[10px] btn-secondary" id="btn-bed-emg" onclick="window.filterBedBoard('EMERGENCY')" style="padding: 2px 6px;">ER</button>
                </div>

                <!-- Bed Board Grid Container -->
                <div id="bed-board-grid-container" style="max-height: 480px; overflow-y: auto; display: flex; flex-direction: column; gap: 12px; padding-right: 4px;">
                  <!-- Wards will render here dynamically -->
                </div>

                <!-- Legend -->
                <div style="display: flex; flex-wrap: wrap; gap: 8px; justify-content: center; margin-top: 12px; padding-top: 10px; border-top: 1px solid var(--border-color); font-size: 0.65rem;">
                  <span style="display: flex; align-items: center; gap: 4px;"><span style="display:inline-block; width:8px; height:8px; background:#10B981; border-radius:2px;"></span> Vacant</span>
                  <span style="display: flex; align-items: center; gap: 4px;"><span style="display:inline-block; width:8px; height:8px; background:#3B82F6; border-radius:2px;"></span> Occupied</span>
                  <span style="display: flex; align-items: center; gap: 4px;"><span style="display:inline-block; width:8px; height:8px; background:#EF4444; border-radius:2px;"></span> Critical</span>
                  <span style="display: flex; align-items: center; gap: 4px;"><span style="display:inline-block; width:8px; height:8px; background:#F59E0B; border-radius:2px;"></span> Reserved</span>
                  <span style="display: flex; align-items: center; gap: 4px;"><span style="display:inline-block; width:8px; height:8px; background:#6B7280; border-radius:2px;"></span> Blocked</span>
                  <span style="display: flex; align-items: center; gap: 4px;"><span style="display:inline-block; width:8px; height:8px; background:#8B5CF6; border-radius:2px;"></span> Isolation</span>
                </div>
              </div>
            </div>

            <!-- TRANSFER QUEUE -->
            <div class="card">
              <div class="card-header" style="border-bottom: 1px solid var(--border-color); padding: 8px 12px;">
                <h3 style="font-size: 0.85rem; font-weight: 700; color: var(--text-primary); margin:0;">Internal Transfer Queue</h3>
              </div>
              <div class="card-body" style="padding: 10px; overflow-x: auto;">
                <table style="width: 100%; border-collapse: collapse; font-size: 0.7rem;">
                  <thead>
                    <tr style="border-bottom: 1px solid var(--border-color); text-align: left; background-color: #F8FAFC;">
                      <th style="padding: 4px;">Patient</th>
                      <th style="padding: 4px;">From Bed</th>
                      <th style="padding: 4px;">To Ward</th>
                      <th style="padding: 4px;">Requested By</th>
                      <th style="padding: 4px;">Time</th>
                      <th style="padding: 4px; text-align: right;">Action</th>
                    </tr>
                  </thead>
                  <tbody id="transfer-queue-body">
                    <!-- Dynamic Rows -->
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <!-- RIGHT COLUMN (30%) -->
          <div style="display: flex; flex-direction: column; gap: 16px;">
            
            <!-- a) ADMISSION QUEUES -->
            <div class="card">
              <div class="card-header" style="border-bottom: 1px solid var(--border-color); padding: 12px 16px;">
                <h2 style="font-size: 0.95rem; font-weight: 700; color: var(--text-primary); margin:0;">Action Queues</h2>
              </div>
              <div class="card-body" style="padding: 12px; display: flex; flex-direction: column; gap: 14px;">
                
                <!-- Waiting for Bed Allotment -->
                <div>
                  <h4 style="font-size: 0.78rem; font-weight: bold; color: var(--text-secondary); margin-bottom: 6px;">Waiting for Bed Allotment</h4>
                  <div style="display: flex; flex-direction: column; gap: 6px;" id="waiting-bed-queue">
                    <!-- Dynamic list -->
                  </div>
                </div>

                <!-- Pending Documentation -->
                <div>
                  <h4 style="font-size: 0.78rem; font-weight: bold; color: var(--text-secondary); margin-bottom: 6px;">Pending Documentation</h4>
                  <div style="display: flex; flex-direction: column; gap: 6px;" id="pending-docs-queue">
                    <!-- Dynamic list -->
                  </div>
                </div>
              </div>
            </div>

            <!-- b) MLC & EMERGENCY LOG -->
            <div class="card">
              <div class="card-header" style="border-bottom: 1px solid var(--border-color); padding: 8px 12px;">
                <h3 style="font-size: 0.85rem; font-weight: 700; color: var(--text-primary); margin:0;">MLC & Emergency Log</h3>
              </div>
              <div class="card-body" style="padding: 10px;">
                <!-- MLC cases -->
                <div style="margin-bottom: 8px;">
                  <span style="font-size: 0.72rem; font-weight: bold; color: var(--text-secondary);">Today's MLC Cases</span>
                  <table style="width: 100%; border-collapse: collapse; font-size: 0.68rem; margin-top: 4px;">
                    <thead>
                      <tr style="border-bottom: 1px solid var(--border-color); text-align: left; background-color: #F8FAFC;">
                        <th style="padding: 3px;">Patient / UHID</th>
                        <th style="padding: 3px;">Nature</th>
                        <th style="padding: 3px;">Police Station</th>
                        <th style="padding: 3px;">Intimation</th>
                        <th style="padding: 3px; text-align: right;">Action</th>
                      </tr>
                    </thead>
                    <tbody id="mlc-log-body">
                      <!-- Dynamic rows -->
                    </tbody>
                  </table>
                </div>

                <!-- Brought Dead & Emergency triage -->
                <div style="border-top: 1px solid var(--border-color); padding-top: 6px; display: flex; justify-content: space-between; font-size: 0.7rem; gap: 8px;">
                  <div style="flex: 1;">
                    <div style="font-weight: bold; color: var(--text-secondary); margin-bottom: 4px;">Brought Dead (BD)</div>
                    <div id="bd-log-container" style="background-color: var(--bg-surface-elevated); padding: 4px; border-radius: 4px;">
                      <!-- BD status -->
                    </div>
                  </div>
                  <div style="flex: 1;">
                    <div style="font-weight: bold; color: var(--text-secondary); margin-bottom: 4px;">ER Waiting Triage</div>
                    <div style="background-color: #FEF2F2; color:#991B1B; padding: 4px; border-radius:4px; font-weight: 500;">
                      • Aaradhya Sen (Ambulance) <button class="btn btn-xs btn-secondary" onclick="window.sendToCasualty('Aaradhya')" style="font-size: 0.55rem; padding:1px 3px; margin-left: 2px;">Triage</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- c) ALERTS & NOTIFICATIONS -->
            <div class="card">
              <div class="card-header" style="border-bottom: 1px solid var(--border-color); padding: 8px 12px;">
                <h3 style="font-size: 0.85rem; font-weight: 700; color: var(--text-primary); margin:0;">Alerts & Critical Flags</h3>
              </div>
              <div class="card-body" style="padding: 10px; max-height: 250px; overflow-y: auto; display: flex; flex-direction: column; gap: 8px;" id="alerts-container">
                <!-- Alerts dynamic list -->
              </div>
            </div>
          </div>
        </div>

        <!-- SECTION 5 — WARD-WISE BED AVAILABILITY SUMMARY -->
        <div class="card" style="margin-top: 16px;">
          <div class="card-header" style="border-bottom: 1px solid var(--border-color); padding: 10px 16px;">
            <h3 style="font-size: 0.9rem; font-weight: 700; color: var(--text-primary); margin:0;">Ward-wise Bed Availability Summary</h3>
          </div>
          <div class="card-body" style="padding: 12px; overflow-x: auto;">
            <table style="width: 100%; border-collapse: collapse; font-size: 0.72rem; min-width: 900px;">
              <thead>
                <tr style="border-bottom: 1px solid var(--border-color); text-align: left; background-color: #F8FAFC;">
                  <th style="padding: 6px;">Ward Name</th>
                  <th style="padding: 6px; text-align: center;">Total Beds</th>
                  <th style="padding: 6px; text-align: center;">Occupied</th>
                  <th style="padding: 6px; text-align: center;">Available</th>
                  <th style="padding: 6px; text-align: center;">Reserved</th>
                  <th style="padding: 6px; text-align: center;">Blocked</th>
                  <th style="padding: 6px; width: 25%;">Occupancy Rate</th>
                  <th style="padding: 6px; text-align: right;">Action</th>
                </tr>
              </thead>
              <tbody id="ward-wise-summary-body">
                <!-- Dynamic Rows -->
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- WIZARD WORKSPACE MODAL OVERLAY (Section 6) -->
      <div id="registration-wizard-overlay" style="display: none; position: fixed; inset: 0; background: rgba(15, 23, 42, 0.6); backdrop-filter: blur(4px); z-index: 9999; align-items: center; justify-content: center; padding: 20px;">
        <div style="background: white; border-radius: 8px; width: 100%; max-width: 950px; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1); display: flex; flex-direction: column; max-height: 90vh;">
          
          <!-- Stepper Header -->
          <div style="border-bottom: 1px solid var(--border-color); padding: 16px 24px; display: flex; align-items: center; justify-content: space-between; background-color: #F8FAFC;">
            <div>
              <h2 id="wizard-title" style="font-size: 1.1rem; font-weight: 700; color: var(--text-primary); margin: 0;">Patient Registration & Admission Wizard</h2>
              <p style="font-size: 0.75rem; color: var(--text-muted); margin: 2px 0 0 0;">Fill in identification, visit details, insurance billing, bed selection, and consent forms.</p>
            </div>
            <button onclick="window.closeRegistrationWizard()" style="font-size: 1.3rem; font-weight: 600; color: var(--text-muted); border: none; background: transparent; cursor: pointer;">&times;</button>
          </div>

          <!-- Wizard Stepper bar -->
          <div style="display: flex; border-bottom: 1px solid var(--border-color);">
            <div class="step-indicator active" id="indicator-step-1">1. Identification</div>
            <div class="step-indicator" id="indicator-step-2">2. Visit / Admission</div>
            <div class="step-indicator" id="indicator-step-3">3. Insurance & Deposit</div>
            <div class="step-indicator" id="indicator-step-4">4. Bed Allotment</div>
            <div class="step-indicator" id="indicator-step-5">5. Consents & Print</div>
          </div>

          <!-- Wizard Body -->
          <div id="wizard-steps-container" style="flex: 1; overflow-y: auto; padding: 24px;">
            
            <!-- STEP 1: PATIENT IDENTIFICATION -->
            <div class="wizard-step active" id="wizard-step-1">
              <div style="background-color: #EFF6FF; border: 1px solid #BFDBFE; border-radius: 6px; padding: 12px; margin-bottom: 16px; display: flex; align-items: center; justify-content: space-between; gap: 12px;">
                <div style="font-size: 0.78rem; color: #1E40AF;">
                  <strong>Existing Patient Lookup:</strong> Search by Aadhaar, Mobile, UHID, or Name to auto-populate the master records.
                </div>
                <div style="display: flex; gap: 8px;">
                  <input type="text" id="wizard-search-input" placeholder="UHID / Aadhaar / Mobile..." style="font-size: 0.72rem; padding: 4px 8px; border: 1px solid var(--border-color); border-radius: 4px; width: 180px;">
                  <button class="btn btn-secondary btn-sm" onclick="window.triggerWizardSearch()" style="padding: 4px 8px; font-size: 0.72rem;">Search</button>
                </div>
              </div>

              <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 20px;">
                <!-- Main fields -->
                <div>
                  <h3 style="font-size: 0.85rem; font-weight: bold; margin-bottom: 12px; color: var(--text-primary); border-bottom: 1px solid var(--border-color); padding-bottom: 4px;">Demographics</h3>
                  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px;">
                    <div>
                      <label style="display: block; font-size: 0.7rem; color: var(--text-secondary); margin-bottom: 4px; font-weight: 500;">Full Name *</label>
                      <input type="text" id="w-pat-name" placeholder="First & Last Name" style="width: 100%; font-size: 0.75rem; padding: 6px; border: 1px solid var(--border-color); border-radius: 4px;">
                    </div>
                    <div>
                      <label style="display: block; font-size: 0.7rem; color: var(--text-secondary); margin-bottom: 4px; font-weight: 500;">Mobile (Primary) *</label>
                      <input type="text" id="w-pat-mobile" placeholder="10-digit mobile" style="width: 100%; font-size: 0.75rem; padding: 6px; border: 1px solid var(--border-color); border-radius: 4px;">
                    </div>
                  </div>
                  
                  <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; margin-bottom: 12px;">
                    <div>
                      <label style="display: block; font-size: 0.7rem; color: var(--text-secondary); margin-bottom: 4px; font-weight: 500;">Date of Birth</label>
                      <input type="date" id="w-pat-dob" onchange="window.calcAgeFromDob(this.value)" style="width: 100%; font-size: 0.75rem; padding: 5px; border: 1px solid var(--border-color); border-radius: 4px;">
                    </div>
                    <div>
                      <label style="display: block; font-size: 0.7rem; color: var(--text-secondary); margin-bottom: 4px; font-weight: 500;">Age *</label>
                      <input type="number" id="w-pat-age" placeholder="Age" style="width: 100%; font-size: 0.75rem; padding: 6px; border: 1px solid var(--border-color); border-radius: 4px;">
                    </div>
                    <div>
                      <label style="display: block; font-size: 0.7rem; color: var(--text-secondary); margin-bottom: 4px; font-weight: 500;">Gender *</label>
                      <select id="w-pat-gender" style="width: 100%; font-size: 0.75rem; padding: 6px; border: 1px solid var(--border-color); border-radius: 4px;">
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>

                  <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; margin-bottom: 12px;">
                    <div>
                      <label style="display: block; font-size: 0.7rem; color: var(--text-secondary); margin-bottom: 4px; font-weight: 500;">Aadhaar Number</label>
                      <div style="display: flex; gap: 4px;">
                        <input type="text" id="w-pat-aadhaar" placeholder="12-digit UID" style="flex: 1; font-size: 0.75rem; padding: 6px; border: 1px solid var(--border-color); border-radius: 4px;">
                        <button class="btn btn-secondary" onclick="window.mockAadhaarScan()" style="padding: 4px 6px; font-size: 0.65rem;">📷 Scan</button>
                      </div>
                    </div>
                    <div>
                      <label style="display: block; font-size: 0.7rem; color: var(--text-secondary); margin-bottom: 4px; font-weight: 500;">ABHA ID</label>
                      <div style="display: flex; gap: 4px;">
                        <input type="text" id="w-pat-abha" placeholder="14-digit ABHA Number" style="flex: 1; font-size: 0.75rem; padding: 6px; border: 1px solid var(--border-color); border-radius: 4px;">
                        <button class="btn btn-secondary" onclick="window.triggerABHAVerify()" style="padding: 4px 6px; font-size: 0.65rem;">Verify</button>
                      </div>
                    </div>
                    <div>
                      <label style="display: block; font-size: 0.7rem; color: var(--text-secondary); margin-bottom: 4px; font-weight: 500;">Blood Group</label>
                      <select id="w-pat-blood" style="width: 100%; font-size: 0.75rem; padding: 6px; border: 1px solid var(--border-color); border-radius: 4px;">
                        <option value="">Select</option>
                        <option value="A+">A+</option>
                        <option value="A-">A-</option>
                        <option value="B+">B+</option>
                        <option value="B-">B-</option>
                        <option value="O+">O+</option>
                        <option value="O-">O-</option>
                        <option value="AB+">AB+</option>
                        <option value="AB-">AB-</option>
                      </select>
                    </div>
                  </div>

                  <h3 style="font-size: 0.85rem; font-weight: bold; margin-top: 16px; margin-bottom: 12px; color: var(--text-primary); border-bottom: 1px solid var(--border-color); padding-bottom: 4px;">Address</h3>
                  <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 12px; margin-bottom: 12px;">
                    <div>
                      <label style="display: block; font-size: 0.7rem; color: var(--text-secondary); margin-bottom: 4px; font-weight: 500;">Street Address</label>
                      <input type="text" id="w-pat-address" placeholder="Flat No, Apartment, Road" style="width: 100%; font-size: 0.75rem; padding: 6px; border: 1px solid var(--border-color); border-radius: 4px;">
                    </div>
                    <div>
                      <label style="display: block; font-size: 0.7rem; color: var(--text-secondary); margin-bottom: 4px; font-weight: 500;">City</label>
                      <input type="text" id="w-pat-city" value="New Delhi" style="width: 100%; font-size: 0.75rem; padding: 6px; border: 1px solid var(--border-color); border-radius: 4px;">
                    </div>
                  </div>

                  <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; margin-bottom: 12px;">
                    <div>
                      <label style="display: block; font-size: 0.7rem; color: var(--text-secondary); margin-bottom: 4px; font-weight: 500;">State</label>
                      <input type="text" id="w-pat-state" value="Delhi" style="width: 100%; font-size: 0.75rem; padding: 6px; border: 1px solid var(--border-color); border-radius: 4px;">
                    </div>
                    <div>
                      <label style="display: block; font-size: 0.7rem; color: var(--text-secondary); margin-bottom: 4px; font-weight: 500;">PIN Code</label>
                      <input type="text" id="w-pat-pin" placeholder="110001" style="width: 100%; font-size: 0.75rem; padding: 6px; border: 1px solid var(--border-color); border-radius: 4px;">
                    </div>
                    <div>
                      <label style="display: block; font-size: 0.7rem; color: var(--text-secondary); margin-bottom: 4px; font-weight: 500;">Nationality</label>
                      <input type="text" id="w-pat-nationality" value="Indian" onchange="window.toggleForeignFields(this.value)" style="width: 100%; font-size: 0.75rem; padding: 6px; border: 1px solid var(--border-color); border-radius: 4px;">
                    </div>
                  </div>
                </div>

                <!-- Flags and Image side bar -->
                <div style="background-color: var(--bg-surface-elevated); padding: 12px; border-radius: 6px; border: 1px solid var(--border-color);">
                  <h3 style="font-size: 0.8rem; font-weight: bold; margin-bottom: 8px; color: var(--text-primary); text-transform: uppercase;">Flags & Attributes</h3>
                  
                  <div style="display: flex; flex-direction: column; gap: 8px; font-size: 0.75rem;">
                    <label style="display: flex; align-items: center; gap: 6px;">
                      <input type="checkbox" id="w-flag-senior"> 👴 Senior Citizen (>60)
                    </label>
                    <label style="display: flex; align-items: center; gap: 6px;">
                      <input type="checkbox" id="w-flag-disabled"> ♿ Differently Abled
                    </label>
                    <label style="display: flex; align-items: center; gap: 6px;">
                      <input type="checkbox" id="w-flag-pregnant"> 🤰 Pregnant
                    </label>
                    <label style="display: flex; align-items: center; gap: 6px;">
                      <input type="checkbox" id="w-flag-vip"> 👑 VIP / VVIP
                    </label>
                    <label style="display: flex; align-items: center; gap: 6px;">
                      <input type="checkbox" id="w-flag-foreign" onchange="window.toggleForeignCheckbox(this.checked)"> ✈️ Foreign National
                    </label>
                    <label style="display: flex; align-items: center; gap: 6px;">
                      <input type="checkbox" id="w-flag-bpl"> 🏷️ BPL (Below Poverty Line)
                    </label>
                    <label style="display: flex; align-items: center; gap: 6px;">
                      <input type="checkbox" id="w-flag-gov"> 🏛️ CGHS / ECHS Beneficiary
                    </label>
                  </div>

                  <!-- Foreign national passport fields (hidden by default) -->
                  <div id="foreign-national-fields" style="display: none; border-top: 1px dashed var(--border-color); padding-top: 8px; margin-top: 8px;">
                    <h4 style="font-size: 0.72rem; font-weight: bold; color: var(--text-secondary); margin-bottom: 6px;">Foreign National Details</h4>
                    <div style="display: flex; flex-direction: column; gap: 6px; font-size: 0.7rem;">
                      <div>
                        <label style="display: block; margin-bottom: 2px;">Passport Number *</label>
                        <input type="text" id="w-foreign-passport" style="width:100%; padding: 4px; font-size: 0.7rem; border: 1px solid var(--border-color); border-radius: 4px;">
                      </div>
                      <div>
                        <label style="display: block; margin-bottom: 2px;">Visa Expiry Date *</label>
                        <input type="date" id="w-foreign-visa" style="width:100%; padding: 4px; font-size: 0.7rem; border: 1px solid var(--border-color); border-radius: 4px;">
                      </div>
                      <label style="display: flex; align-items: center; gap: 6px; font-size: 0.65rem; margin-top: 4px;">
                        <input type="checkbox" id="w-foreign-frro" checked> FRRO Intimation Required
                      </label>
                    </div>
                  </div>

                  <div style="border-top: 1px solid var(--border-color); padding-top: 12px; margin-top: 12px; display: flex; flex-direction: column; align-items: center;">
                    <div style="width: 100px; height: 100px; border: 1px dashed var(--border-color); display: flex; align-items: center; justify-content: center; background-color: white; border-radius: 4px; overflow: hidden; margin-bottom: 8px;">
                      <span style="font-size: 1.5rem;" id="w-pat-photo-preview">👤</span>
                    </div>
                    <div style="display: flex; gap: 4px;">
                      <button class="btn btn-secondary text-[10px]" onclick="window.mockPhotoCapture()" style="padding: 2px 6px;">📸 Capture</button>
                      <button class="btn btn-secondary text-[10px]" onclick="window.mockPhotoUpload()" style="padding: 2px 6px;">📂 Upload</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- STEP 2: VISIT / ADMISSION DETAILS -->
            <div class="wizard-step" id="wizard-step-2">
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                
                <!-- Left panel: General & Visit selector -->
                <div>
                  <h3 style="font-size: 0.85rem; font-weight: bold; margin-bottom: 12px; color: var(--text-primary); border-bottom: 1px solid var(--border-color); padding-bottom: 4px;">Visit Selection</h3>
                  
                  <div style="margin-bottom: 12px;">
                    <label style="display: block; font-size: 0.7rem; color: var(--text-secondary); margin-bottom: 4px; font-weight: 500;">Visit Type *</label>
                    <select id="w-visit-type" onchange="window.toggleVisitType(this.value)" style="width: 100%; font-size: 0.75rem; padding: 6px; border: 1px solid var(--border-color); border-radius: 4px;">
                      <option value="OPD">OPD Consultation</option>
                      <option value="IPD" selected>IPD Admission (Inpatient)</option>
                      <option value="Emergency">Emergency / Casualty Arrival</option>
                      <option value="Daycare">Daycare Procedure</option>
                      <option value="Referral-In">Referral-In</option>
                    </select>
                  </div>

                  <!-- OPD Specific Fields -->
                  <div id="w-opd-fields" style="display: none; background: #F8FAFC; border: 1px solid var(--border-color); padding: 12px; border-radius: 6px; margin-bottom: 12px;">
                    <h4 style="font-size: 0.75rem; font-weight: bold; color: var(--primary); margin-bottom: 8px;">OPD Details</h4>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 8px;">
                      <div>
                        <label style="font-size: 0.65rem;">Consulting Doctor</label>
                        <select id="w-opd-doctor" style="width:100%; font-size:0.7rem; padding:4px; border:1px solid var(--border-color); border-radius:4px;">
                          <option value="Dr. Sharma">Dr. Amit Sharma (Cardiology)</option>
                          <option value="Dr. Verma">Dr. Sunita Verma (OBG)</option>
                          <option value="Dr. Iyer">Dr. Ramesh Iyer (Medicine)</option>
                        </select>
                      </div>
                      <div>
                        <label style="font-size: 0.65rem;">OPD Fee</label>
                        <input type="text" id="w-opd-fee" value="₹500.00" class="admin-mono" style="width:100%; font-size:0.7rem; padding:4px; border:1px solid var(--border-color); border-radius:4px; background-color:#E2E8F0;" readonly>
                      </div>
                    </div>
                  </div>

                  <!-- IPD Specific Fields -->
                  <div id="w-ipd-fields" style="background: #F8FAFC; border: 1px solid var(--border-color); padding: 12px; border-radius: 6px; margin-bottom: 12px;">
                    <h4 style="font-size: 0.75rem; font-weight: bold; color: var(--primary); margin-bottom: 8px;">IPD Details</h4>
                    
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 8px;">
                      <div>
                        <label style="font-size: 0.65rem;">Admitting Doctor *</label>
                        <select id="w-ipd-doctor" style="width:100%; font-size:0.7rem; padding:4px; border:1px solid var(--border-color); border-radius:4px;">
                          <option value="Dr. Sharma">Dr. Amit Sharma (Cardiology)</option>
                          <option value="Dr. Verma">Dr. Sunita Verma (OBG)</option>
                          <option value="Dr. Iyer">Dr. Ramesh Iyer (Medicine)</option>
                          <option value="Dr. Mehta">Dr. A. K. Mehta (Nephrology)</option>
                          <option value="Dr. Sen">Dr. Joy Sen (Pulmonology)</option>
                        </select>
                      </div>
                      <div>
                        <label style="font-size: 0.65rem;">Ward Type Preferred *</label>
                        <select id="w-ipd-ward-pref" style="width:100%; font-size:0.7rem; padding:4px; border:1px solid var(--border-color); border-radius:4px;">
                          <option value="GENERAL-WARD-M">General Ward Male</option>
                          <option value="GENERAL-WARD-F">General Ward Female</option>
                          <option value="SEMI-PRIVATE">Semi-Private Ward</option>
                          <option value="PRIVATE">Private Room</option>
                          <option value="DELUXE">Deluxe Suite</option>
                          <option value="CCU">ICU / CCU</option>
                        </select>
                      </div>
                    </div>

                    <div style="margin-bottom: 8px;">
                      <label style="font-size: 0.65rem; display: block; margin-bottom: 2px;">Admission Diagnosis (Provisional) *</label>
                      <input type="text" id="w-ipd-diagnosis" placeholder="E.g., Dengue with severe Thrombocytopenia" style="width:100%; font-size:0.7rem; padding:5px; border:1px solid var(--border-color); border-radius:4px;">
                    </div>
                  </div>

                  <!-- Referral fields -->
                  <div id="w-referral-fields" style="display: none; background: #F8FAFC; border: 1px solid var(--border-color); padding: 12px; border-radius: 6px; margin-bottom: 12px;">
                    <h4 style="font-size: 0.75rem; font-weight: bold; color: var(--primary); margin-bottom: 8px;">Referral details</h4>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                      <div>
                        <label style="font-size: 0.65rem;">Referring Hospital</label>
                        <input type="text" id="w-ref-hosp" placeholder="E.g., Fortis Delhi" style="width:100%; font-size:0.7rem; padding:4px; border:1px solid var(--border-color); border-radius:4px;">
                      </div>
                      <div>
                        <label style="font-size: 0.65rem;">Referral Letter</label>
                        <input type="file" style="font-size:0.65rem;">
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Right panel: Special clinical admissions flags (MLC, LAMA, Brought Dead) -->
                <div style="background-color: var(--bg-surface-elevated); padding: 12px; border-radius: 6px; border: 1px solid var(--border-color);">
                  <h3 style="font-size: 0.8rem; font-weight: bold; margin-bottom: 8px; color: var(--text-primary); text-transform: uppercase;">Special Class Admission Flags</h3>
                  
                  <div style="display: flex; flex-direction: column; gap: 12px; font-size: 0.75rem;">
                    
                    <!-- MLC checkbox -->
                    <div style="border: 1px solid var(--border-color); padding: 8px; border-radius: 4px; background: white;">
                      <label style="display: flex; align-items: center; gap: 6px; font-weight: bold; color: #EF4444;">
                        <input type="checkbox" id="w-visit-mlc" onchange="window.toggleWizardMLC(this.checked)"> 🔴 Medico-Legal Case (MLC)
                      </label>
                      <div id="wizard-mlc-subfields" style="display: none; margin-top: 8px; font-size: 0.65rem; border-top: 1px dashed var(--border-color); padding-top: 6px; display: flex; flex-direction: column; gap: 6px;">
                        <div>
                          <label style="display:block; margin-bottom:2px;">Nature of Injury *</label>
                          <input type="text" id="w-mlc-nature" placeholder="E.g., Gunshot, RTA, Poisoning" style="width:100%; padding:4px; font-size:0.65rem; border:1px solid var(--border-color); border-radius:4px;">
                        </div>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px;">
                          <div>
                            <label style="display:block; margin-bottom:2px;">Police Station *</label>
                            <input type="text" id="w-mlc-ps" value="Saket PS" style="width:100%; padding:4px; font-size:0.65rem; border:1px solid var(--border-color); border-radius:4px;">
                          </div>
                          <div>
                            <label style="display:block; margin-bottom:2px;">Intimation status *</label>
                            <select id="w-mlc-intimation" style="width:100%; padding:4px; font-size:0.65rem; border:1px solid var(--border-color); border-radius:4px;">
                              <option value="Pending">Pending Send</option>
                              <option value="Sent">Sent to Police Station</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>

                    <!-- LAMA Risk checkbox -->
                    <div style="border: 1px solid var(--border-color); padding: 8px; border-radius: 4px; background: white;">
                      <label style="display: flex; align-items: center; gap: 6px; font-weight: bold; color: #F59E0B;">
                        <input type="checkbox" id="w-visit-lama"> 🟠 LAMA Risk (Leave Against Medical Advice)
                      </label>
                      <div style="font-size: 0.62rem; color: var(--text-muted); margin-top: 2px;">
                        Pre-flags patient in EMR & logs to ward nurse station instantly upon entry.
                      </div>
                    </div>

                    <!-- Brought Dead checkbox -->
                    <div style="border: 1px solid var(--border-color); padding: 8px; border-radius: 4px; background: white;">
                      <label style="display: flex; align-items: center; gap: 6px; font-weight: bold; color: #374151;">
                        <input type="checkbox" id="w-visit-bd" onchange="window.toggleWizardBD(this.checked)"> 💀 Brought Dead (BD)
                      </label>
                      <div style="font-size: 0.62rem; color: var(--text-muted); margin-top: 2px;">
                        Mandates immediate registration, police intimation, and bypassing clinical pathways.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- STEP 3: INSURANCE & PAYMENT -->
            <div class="wizard-step" id="wizard-step-3">
              <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 20px;">
                
                <!-- Billing config -->
                <div>
                  <h3 style="font-size: 0.85rem; font-weight: bold; margin-bottom: 12px; color: var(--text-primary); border-bottom: 1px solid var(--border-color); padding-bottom: 4px;">Payer Category & Sponsor Details</h3>
                  
                  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px;">
                    <div>
                      <label style="display: block; font-size: 0.7rem; color: var(--text-secondary); margin-bottom: 4px; font-weight: 500;">Payer Type *</label>
                      <select id="w-payer-type" onchange="window.togglePayerFields(this.value)" style="width: 100%; font-size: 0.75rem; padding: 6px; border: 1px solid var(--border-color); border-radius: 4px;">
                        <option value="Self Pay">Self Pay / Cash</option>
                        <option value="Insurance">Insurance / TPA Case</option>
                        <option value="CGHS">Government Scheme: CGHS</option>
                        <option value="ECHS">Government Scheme: ECHS</option>
                        <option value="PMJAY">Government Scheme: Ayushman Bharat (PMJAY)</option>
                        <option value="Charity">Charity / Waiver (BPL)</option>
                      </select>
                    </div>
                    <div>
                      <label style="display: block; font-size: 0.7rem; color: var(--text-secondary); margin-bottom: 4px; font-weight: 500;">TPA / Scheme Provider</label>
                      <select id="w-tpa-dropdown" style="width: 100%; font-size: 0.75rem; padding: 6px; border: 1px solid var(--border-color); border-radius: 4px;" disabled>
                        <option value="">Select Indian TPA</option>
                        <option value="Star Health">Star Health Insurance</option>
                        <option value="Paramount">Paramount Health Services TPA</option>
                        <option value="Vidal Health">Vidal Health Insurance TPA</option>
                        <option value="Medi Assist">Medi Assist TPA</option>
                        <option value="Raksha">Raksha Health Insurance TPA</option>
                      </select>
                    </div>
                  </div>

                  <!-- Insurance details fields (shown if Insurance selected) -->
                  <div id="w-ins-fields" style="display: none; background: #F8FAFC; border: 1px solid var(--border-color); padding: 12px; border-radius: 6px; margin-bottom: 12px;">
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 8px;">
                      <div>
                        <label style="font-size: 0.65rem;">Policy Number</label>
                        <input type="text" id="w-ins-policy" placeholder="POL-8821-29" style="width:100%; font-size:0.7rem; padding:4px; border:1px solid var(--border-color); border-radius:4px;">
                      </div>
                      <div>
                        <label style="font-size: 0.65rem;">Member ID</label>
                        <input type="text" id="w-ins-member" placeholder="MEM-90182-01" style="width:100%; font-size:0.7rem; padding:4px; border:1px solid var(--border-color); border-radius:4px;">
                      </div>
                    </div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                      <div>
                        <label style="font-size: 0.65rem;">Sum Insured</label>
                        <input type="text" id="w-ins-sum" placeholder="₹5,00,000.00" class="admin-mono" style="width:100%; font-size:0.7rem; padding:4px; border:1px solid var(--border-color); border-radius:4px;">
                      </div>
                      <div style="display: flex; align-items: flex-end; gap: 6px;">
                        <button class="btn btn-secondary btn-sm" onclick="window.mockVerifyCoverage()" style="width:100%; padding: 4px; font-size:0.65rem;">🛡️ Verify TPA Coverage</button>
                      </div>
                    </div>
                  </div>

                  <!-- CGHS / ECHS details -->
                  <div id="w-cghs-fields" style="display: none; background: #F8FAFC; border: 1px solid var(--border-color); padding: 12px; border-radius: 6px; margin-bottom: 12px;">
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                      <div>
                        <label style="font-size: 0.65rem;">CGHS Card / Beneficiary ID</label>
                        <input type="text" id="w-cghs-id" placeholder="CGHS-9921-A" style="width:100%; font-size:0.7rem; padding:4px; border:1px solid var(--border-color); border-radius:4px;">
                      </div>
                      <div>
                        <label style="font-size: 0.65rem;">Ward Entitlement</label>
                        <select id="w-cghs-entitlement" style="width:100%; font-size:0.7rem; padding:4px; border:1px solid var(--border-color); border-radius:4px;">
                          <option value="General">General Ward</option>
                          <option value="Semi-Private">Semi-Private</option>
                          <option value="Private">Private Ward</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <!-- PMJAY details -->
                  <div id="w-pmjay-fields" style="display: none; background: #FFF5F5; border: 1px solid #FEB2B2; padding: 12px; border-radius: 6px; margin-bottom: 12px;">
                    <h4 style="font-size: 0.75rem; font-weight: bold; color: #C53030; margin-bottom: 6px;">Ayushman Bharat (PMJAY) Verification</h4>
                    <div style="display: flex; gap: 8px;">
                      <input type="text" id="w-pmjay-id" placeholder="Enter Golden Card Beneficiary ID" style="flex:1; font-size:0.7rem; padding:4px; border:1px solid var(--border-color); border-radius:4px;">
                      <button class="btn btn-primary btn-sm" onclick="window.verifyGoldenCard()" style="background-color: #C53030; border-color: #C53030; font-size: 0.65rem; padding:4px 8px;">Verify golden card</button>
                    </div>
                    <div style="font-size: 0.62rem; color: #9B2C2C; margin-top: 4px;">
                      ⚠️ Note: PMJAY admissions mandate verified ABHA ID linking. Skippable only with clinical emergency waivers.
                    </div>
                  </div>
                </div>

                <!-- Deposit panel -->
                <div style="background-color: var(--bg-surface-elevated); padding: 12px; border-radius: 6px; border: 1px solid var(--border-color);">
                  <h3 style="font-size: 0.8rem; font-weight: bold; margin-bottom: 8px; color: var(--text-primary); text-transform: uppercase;">IPD Advance Deposit</h3>
                  
                  <div style="display: flex; flex-direction: column; gap: 8px; font-size: 0.72rem;">
                    <div>
                      <span style="display:block; color:var(--text-secondary); margin-bottom: 2px;">Min Deposit Required</span>
                      <input type="text" id="w-deposit-required" value="₹5,000.00" class="admin-mono" style="width:100%; padding:5px; background:var(--bg-surface); border:1px solid var(--border-color); border-radius:4px;" readonly>
                    </div>
                    <div>
                      <span style="display:block; color:var(--text-secondary); margin-bottom: 2px;">Amount Collected *</span>
                      <input type="number" id="w-deposit-collected" value="5000" class="admin-mono" style="width:100%; padding:5px; border:1px solid var(--border-color); border-radius:4px;">
                    </div>
                    <div>
                      <span style="display:block; color:var(--text-secondary); margin-bottom: 2px;">Payment Mode</span>
                      <select id="w-deposit-mode" style="width:100%; padding:5px; border:1px solid var(--border-color); border-radius:4px;">
                        <option value="UPI">UPI / GPay / PhonePe</option>
                        <option value="Cash">Cash</option>
                        <option value="Card">Credit/Debit Card</option>
                        <option value="Cheque">Bank Draft / Cheque</option>
                      </select>
                    </div>

                    <!-- Deposit Waiver checklist -->
                    <div style="border-top: 1px dashed var(--border-color); padding-top: 6px; margin-top: 4px;">
                      <label style="display: flex; align-items: center; gap: 6px;">
                        <input type="checkbox" id="w-deposit-waived" onchange="window.toggleWaiverField(this.checked)"> Waive Deposit (BPL/Scheme/Charity)
                      </label>
                      <div id="w-waiver-reason-container" style="display: none; margin-top: 6px;">
                        <label style="font-size:0.62rem; display:block; margin-bottom:2px;">Waiver Reason / Auth Details *</label>
                        <input type="text" id="w-deposit-waiver-reason" placeholder="E.g., BPL approved by Director" style="width:100%; padding:4px; font-size:0.65rem; border:1px solid var(--border-color); border-radius:4px;">
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- STEP 4: BED ALLOTMENT -->
            <div class="wizard-step" id="wizard-step-4">
              <div style="margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center;">
                <h3 style="font-size: 0.85rem; font-weight: bold; color: var(--text-primary); margin:0;">Bed Board Allotment Selector</h3>
                <div style="font-size: 0.72rem; color: var(--text-muted);" id="allotment-filter-notice">
                  Showing vacant beds matching ward preference
                </div>
              </div>

              <!-- Available Bed Grid inside wizard -->
              <div id="wizard-bed-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 10px; max-height: 320px; overflow-y: auto; border: 1px solid var(--border-color); padding: 12px; border-radius: 6px; background-color: #F8FAFC;">
                <!-- Filled dynamically -->
              </div>

              <div style="margin-top: 14px; background-color: #EFF6FF; border: 1px solid #BFDBFE; padding: 10px 16px; border-radius: 6px; font-size: 0.75rem; color: #1E40AF; display: flex; justify-content: space-between; align-items: center;">
                <div>
                  Selected Allotment: <strong id="selected-bed-label" class="admin-mono">None Selected</strong>
                </div>
                <div>
                  Daily Ward Rate: <strong id="selected-bed-rate" class="admin-mono">₹0.00</strong>
                </div>
              </div>
            </div>

            <!-- STEP 5: DOCUMENTS & CONSENT -->
            <div class="wizard-step" id="wizard-step-5">
              <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 20px;">
                
                <!-- Left checklist -->
                <div>
                  <h3 style="font-size: 0.85rem; font-weight: bold; margin-bottom: 12px; color: var(--text-primary); border-bottom: 1px solid var(--border-color); padding-bottom: 4px;">Required Document Verification Check</h3>
                  
                  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; font-size: 0.75rem;">
                    <div style="display: flex; flex-direction: column; gap: 8px;">
                      <label style="display: flex; align-items: center; gap: 6px;">
                        <input type="checkbox" id="chk-doc-general" checked> General Consent Form (Digitally Signed)
                      </label>
                      <label style="display: flex; align-items: center; gap: 6px;">
                        <input type="checkbox" id="chk-doc-admit" checked> Admission Summary Signed
                      </label>
                      <label style="display: flex; align-items: center; gap: 6px;">
                        <input type="checkbox" id="chk-doc-id" checked> Aadhaar Card Copy verified
                      </label>
                      <label style="display: flex; align-items: center; gap: 6px;">
                        <input type="checkbox" id="chk-doc-ins"> Insurance Card Front/Back uploaded
                      </label>
                    </div>
                    <div style="display: flex; flex-direction: column; gap: 8px;">
                      <label style="display: flex; align-items: center; gap: 6px;">
                        <input type="checkbox" id="chk-doc-mlc"> MLC police intimation copy logged
                      </label>
                      <label style="display: flex; align-items: center; gap: 6px;">
                        <input type="checkbox" id="chk-doc-lama"> LAMA Indemnity Bond signed
                      </label>
                      <label style="display: flex; align-items: center; gap: 6px;">
                        <input type="checkbox" id="chk-doc-frro"> Foreign FRRO submission copy
                      </label>
                      <label style="display: flex; align-items: center; gap: 6px;">
                        <input type="checkbox" id="chk-doc-preauth"> TPA Pre-Auth authorization printout
                      </label>
                    </div>
                  </div>

                  <!-- Wet sign / signature pad simulation -->
                  <div style="border: 1px solid var(--border-color); border-radius: 6px; padding: 12px; margin-top: 14px; background: #F8FAFC;">
                    <span style="font-size:0.7rem; font-weight:bold; color:var(--text-secondary);">Patient / Attendant Signature Pad (Digital Wet Sign)</span>
                    <div style="border: 1px dashed var(--border-color); border-radius: 4px; height: 75px; background: white; margin-top: 6px; display: flex; align-items: center; justify-content: center; color: var(--text-muted); font-size: 0.7rem; position: relative;">
                      <span id="wizard-sign-status">Draw sign on external pad or click to mock sign</span>
                      <button class="btn btn-secondary btn-xs" onclick="window.mockDrawSign()" style="position: absolute; bottom: 4px; right: 4px; font-size:0.55rem; padding: 1px 3px;">Sign Mock</button>
                    </div>
                  </div>
                </div>

                <!-- Right attender details -->
                <div style="background-color: var(--bg-surface-elevated); padding: 12px; border-radius: 6px; border: 1px solid var(--border-color);">
                  <h3 style="font-size: 0.8rem; font-weight: bold; margin-bottom: 8px; color: var(--text-primary); text-transform: uppercase;">Attender Details & Pass</h3>
                  
                  <div style="display: flex; flex-direction: column; gap: 8px; font-size: 0.7rem;">
                    <div>
                      <label style="display:block; margin-bottom: 2px;">Attender Full Name *</label>
                      <input type="text" id="w-attender-name" placeholder="Primary Attender" style="width:100%; padding:5px; border:1px solid var(--border-color); border-radius:4px;">
                    </div>
                    <div>
                      <label style="display:block; margin-bottom: 2px;">Relation to Patient *</label>
                      <input type="text" id="w-attender-relation" placeholder="Spouse / Father / Friend" style="width:100%; padding:5px; border:1px solid var(--border-color); border-radius:4px;">
                    </div>
                    <div>
                      <label style="display:block; margin-bottom: 2px;">Mobile No *</label>
                      <input type="text" id="w-attender-mobile" placeholder="10-digit number" style="width:100%; padding:5px; border:1px solid var(--border-color); border-radius:4px;">
                    </div>
                    <div style="border-top:1px dashed var(--border-color); padding-top: 8px; margin-top: 4px;">
                      <button class="btn btn-secondary btn-sm" onclick="window.issueAttenderPassWizard()" style="width:100%; padding:5px; font-size: 0.65rem;">🎫 Generate Attender Pass</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Wizard Footer Controls -->
          <div style="border-top: 1px solid var(--border-color); padding: 16px 24px; display: flex; justify-content: space-between; background-color: #F8FAFC;">
            <button class="btn btn-secondary btn-sm" id="wizard-btn-prev" onclick="window.prevWizardStep()" style="font-weight: 600;" disabled>
              ⬅️ Back
            </button>
            <div style="display: flex; gap: 8px;">
              <button class="btn btn-secondary btn-sm" onclick="window.closeRegistrationWizard()">Cancel</button>
              <button class="btn btn-primary btn-sm" id="wizard-btn-next" onclick="window.nextWizardStep()" style="font-weight: 600;">
                Next ➡️
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- BIRTH REGISTRATION MODAL (Section 7) -->
      <div id="birth-modal-overlay" style="display: none; position: fixed; inset: 0; background: rgba(15, 23, 42, 0.6); backdrop-filter: blur(4px); z-index: 9999; align-items: center; justify-content: center; padding: 20px;">
        <div style="background: white; border-radius: 8px; width: 100%; max-width: 500px; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1); display: flex; flex-direction: column;">
          <div style="border-bottom: 1px solid var(--border-color); padding: 12px 16px; display: flex; justify-content: space-between; align-items: center; background-color: #ECFDF5;">
            <h3 style="margin: 0; font-size: 0.95rem; font-weight: 700; color: #065F46;">👶 Municipal Birth Registration Draft</h3>
            <button onclick="window.closeBirthModal()" style="font-size: 1.2rem; font-weight: bold; background: transparent; border: none; cursor: pointer; color: #065F46;">&times;</button>
          </div>
          <div style="padding: 16px; font-size: 0.72rem; display: flex; flex-direction: column; gap: 10px;">
            <div>
              <label style="display:block; font-weight: 500; margin-bottom: 2px;">Mother UHID / Visit ID *</label>
              <input type="text" id="birth-mother-uhid" placeholder="MH-2026-9081" style="width:100%; padding:5px; border:1px solid var(--border-color); border-radius:4px;">
            </div>
            <div>
              <label style="display:block; font-weight: 500; margin-bottom: 2px;">Baby Name (Optional)</label>
              <input type="text" id="birth-baby-name" placeholder="Baby of Priya Sharma" style="width:100%; padding:5px; border:1px solid var(--border-color); border-radius:4px;">
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
              <div>
                <label style="display:block; font-weight: 500; margin-bottom: 2px;">Date of Birth *</label>
                <input type="date" id="birth-date" style="width:100%; padding:5px; border:1px solid var(--border-color); border-radius:4px;">
              </div>
              <div>
                <label style="display:block; font-weight: 500; margin-bottom: 2px;">Time of Birth *</label>
                <input type="time" id="birth-time" style="width:100%; padding:5px; border:1px solid var(--border-color); border-radius:4px;">
              </div>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
              <div>
                <label style="display:block; font-weight: 500; margin-bottom: 2px;">Gender *</label>
                <select id="birth-gender" style="width:100%; padding:5px; border:1px solid var(--border-color); border-radius:4px;">
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Undetermined">Undetermined</option>
                </select>
              </div>
              <div>
                <label style="display:block; font-weight: 500; margin-bottom: 2px;">Birth Weight (kg) *</label>
                <input type="number" id="birth-weight" step="0.01" value="2.85" style="width:100%; padding:5px; border:1px solid var(--border-color); border-radius:4px;">
              </div>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
              <div>
                <label style="display:block; font-weight: 500; margin-bottom: 2px;">Delivery Type *</label>
                <select id="birth-delivery-type" style="width:100%; padding:5px; border:1px solid var(--border-color); border-radius:4px;">
                  <option value="Normal">Normal Vaginal Delivery</option>
                  <option value="LSCS">LSCS (C-Section)</option>
                  <option value="Forceps">Instrumental / Forceps</option>
                </select>
              </div>
              <div>
                <label style="display:block; font-weight: 500; margin-bottom: 2px;">Attending Doctor *</label>
                <select id="birth-doc" style="width:100%; padding:5px; border:1px solid var(--border-color); border-radius:4px;">
                  <option value="Dr. Verma">Dr. Sunita Verma</option>
                  <option value="Dr. Iyer">Dr. Ramesh Iyer</option>
                </select>
              </div>
            </div>
            <div style="border-top:1px solid var(--border-color); padding-top:10px; display:flex; justify-content:flex-end; gap:8px;">
              <button class="btn btn-secondary btn-sm" onclick="window.closeBirthModal()">Cancel</button>
              <button class="btn btn-primary btn-sm" onclick="window.submitBirthRegistration()" style="background-color: #059669; border-color: #059669;">
                Generate municipal draft
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- DEATH REGISTRATION MODAL (Section 7) -->
      <div id="death-modal-overlay" style="display: none; position: fixed; inset: 0; background: rgba(15, 23, 42, 0.6); backdrop-filter: blur(4px); z-index: 9999; align-items: center; justify-content: center; padding: 20px;">
        <div style="background: white; border-radius: 8px; width: 100%; max-width: 500px; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1); display: flex; flex-direction: column;">
          <div style="border-bottom: 1px solid var(--border-color); padding: 12px 16px; display: flex; justify-content: space-between; align-items: center; background-color: #FFF1F2;">
            <h3 style="margin: 0; font-size: 0.95rem; font-weight: 700; color: #9F1239;">🪦 Municipal Death Registration Draft</h3>
            <button onclick="window.closeDeathModal()" style="font-size: 1.2rem; font-weight: bold; background: transparent; border: none; cursor: pointer; color: #9F1239;">&times;</button>
          </div>
          <div style="padding: 16px; font-size: 0.72rem; display: flex; flex-direction: column; gap: 10px;">
            <div>
              <label style="display:block; font-weight: 500; margin-bottom: 2px;">Patient UHID / IP Number *</label>
              <input type="text" id="death-uhid" placeholder="MH-2026-1120" style="width:100%; padding:5px; border:1px solid var(--border-color); border-radius:4px;">
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
              <div>
                <label style="display:block; font-weight: 500; margin-bottom: 2px;">Date of Death *</label>
                <input type="date" id="death-date" style="width:100%; padding:5px; border:1px solid var(--border-color); border-radius:4px;">
              </div>
              <div>
                <label style="display:block; font-weight: 500; margin-bottom: 2px;">Time of Death *</label>
                <input type="time" id="death-time" style="width:100%; padding:5px; border:1px solid var(--border-color); border-radius:4px;">
              </div>
            </div>
            <div>
              <label style="display:block; font-weight: 500; margin-bottom: 2px;">Cause of Death *</label>
              <input type="text" id="death-cause" placeholder="Cardio-respiratory arrest secondary to..." style="width:100%; padding:5px; border:1px solid var(--border-color); border-radius:4px;">
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
              <div>
                <label style="display:block; font-weight: 500; margin-bottom: 2px;">Attending Doctor *</label>
                <select id="death-doc" style="width:100%; padding:5px; border:1px solid var(--border-color); border-radius:4px;">
                  <option value="Dr. Iyer">Dr. Ramesh Iyer</option>
                  <option value="Dr. Sen">Dr. Joy Sen</option>
                </select>
              </div>
              <div>
                <label style="display:block; font-weight: 500; margin-bottom: 2px;">Death Type *</label>
                <select id="death-type" onchange="window.toggleDeathMLC(this.value)" style="width:100%; padding:5px; border:1px solid var(--border-color); border-radius:4px;">
                  <option value="Natural">Natural Causes</option>
                  <option value="Accidental">Accidental (Triggers Police)</option>
                  <option value="Suicidal">Suicidal (Triggers Police)</option>
                  <option value="Unknown">Unknown / Suspicious (Triggers Police)</option>
                </select>
              </div>
            </div>
            
            <div style="border: 1px solid #FECDD3; border-radius: 4px; padding: 8px; background: #FFF5F5;" id="death-mlc-notice">
              <label style="display:flex; align-items:center; gap:6px; font-weight:bold; color: #E11D48;">
                <input type="checkbox" id="death-notify-police" checked disabled> 👮 Auto-notify police station (MLC Case)
              </label>
            </div>

            <div style="border-top:1px dashed var(--border-color); padding-top: 8px; margin-top: 4px;">
              <h4 style="font-weight: bold; color: var(--text-secondary); margin-bottom: 4px;">Body Release details</h4>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px;">
                <input type="text" id="death-rel-name" placeholder="Claimant Attender Name" style="width:100%; padding:4px; font-size:0.65rem; border:1px solid var(--border-color); border-radius:4px;">
                <input type="text" id="death-rel-relation" placeholder="Relation (spouse/son)" style="width:100%; padding:4px; font-size:0.65rem; border:1px solid var(--border-color); border-radius:4px;">
              </div>
            </div>

            <div style="border-top:1px solid var(--border-color); padding-top:10px; display:flex; justify-content:flex-end; gap:8px;">
              <button class="btn btn-secondary btn-sm" onclick="window.closeDeathModal()">Cancel</button>
              <button class="btn btn-primary btn-sm" onclick="window.submitDeathRegistration()" style="background-color: #E11D48; border-color: #E11D48;">
                Generate municipal draft
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    // Initialize all components & event listeners
    window.renderOpdTokens();
    window.renderRecentRegistrations();
    window.renderBedGrid();
    window.renderTransferQueue();
    window.renderActionQueues();
    window.renderMlcAndEmergencyLog();
    window.renderAlerts();
    window.renderWardWiseSummary();

    // Start Clock
    if (window.liveClockTimer) clearInterval(window.liveClockTimer);
    window.startAdmissionClock();
  };

  // Clock runner
  window.startAdmissionClock = function() {
    function updateClock() {
      const now = new Date();
      const timeStr = now.toLocaleTimeString('en-US', { hour12: true });
      const timeBadge = document.getElementById('live-time-badge');
      if (timeBadge) timeBadge.innerText = timeStr;

      // Update shift label
      const hours = now.getHours();
      let shiftText = "Night Shift 🌙";
      if (hours >= 6 && hours < 14) shiftText = "Morning Shift ☀️";
      else if (hours >= 14 && hours < 22) shiftText = "Evening Shift 🌆";
      
      const shiftBadge = document.getElementById('live-shift-status');
      if (shiftBadge) shiftBadge.innerText = shiftText;
    }
    updateClock();
    window.liveClockTimer = setInterval(updateClock, 1000);
  };

  // RENDER: OPD Tokens Queue
  window.renderOpdTokens = function(filterVal = 'all') {
    const tbody = document.getElementById('opd-token-table-body');
    if (!tbody) return;

    let list = window.state.opdTokens;
    if (filterVal === 'Appointment' || filterVal === 'Walk-in') {
      list = list.filter(t => t.type === filterVal);
    } else if (filterVal === 'Priority') {
      list = list.filter(t => t.priority !== 'Regular');
    }

    tbody.innerHTML = list.map(t => {
      let badgeClass = "priority-regular";
      if (t.priority.includes("Emergency")) badgeClass = "priority-emergency";
      else if (t.priority.includes("Senior")) badgeClass = "priority-senior";
      else if (t.priority.includes("Pregnant")) badgeClass = "priority-pregnant";
      else if (t.priority.includes("Disability")) badgeClass = "priority-disability";

      let statusColor = "text-slate-500";
      if (t.status === 'Called') statusColor = "text-blue-600 font-bold";
      else if (t.status === 'In-Consultation') statusColor = "text-purple-600 font-medium";
      else if (t.status === 'Done') statusColor = "text-emerald-600 font-medium";

      return `
        <tr style="border-bottom: 1px solid var(--border-color);">
          <td style="padding: 6px;" class="admin-mono font-semibold">${t.token}</td>
          <td style="padding: 6px;">
            <div style="font-weight: 500;">${t.name}</div>
            <div class="admin-mono text-[9px] text-slate-400">${t.uhid}</div>
          </td>
          <td style="padding: 6px;">${t.type}</td>
          <td style="padding: 6px;">${t.doctor}</td>
          <td style="padding: 6px;"><span class="${badgeClass}" style="padding: 2px 6px; border-radius: 12px; font-size: 9px; display: inline-block;">${t.priority}</span></td>
          <td style="padding: 6px;" class="admin-mono">${t.waitTime}</td>
          <td style="padding: 6px;"><span class="${statusColor}">${t.status}</span></td>
          <td style="padding: 6px; text-align: right; display: flex; gap: 2px; justify-content: flex-end;">
            ${t.status === 'Waiting' ? `<button class="btn btn-primary text-[10px]" onclick="window.callOpdToken('${t.token}')" style="padding: 2px 4px;">Call</button>` : ''}
            ${t.status === 'Called' ? `<button class="btn btn-secondary text-[10px]" onclick="window.completeOpdToken('${t.token}')" style="padding: 2px 4px; border-color: #10B981; color: #10B981;">Done</button>` : ''}
            ${t.status !== 'Done' && t.status !== 'No-Show' ? `<button class="btn btn-secondary text-[10px]" onclick="window.noShowOpdToken('${t.token}')" style="padding: 2px 4px; border-color: #EF4444; color: #EF4444;">No-Show</button>` : ''}
          </td>
        </tr>
      `;
    }).join('');
  };

  window.filterTokens = function(type) {
    const buttons = ['all', 'appt', 'walk', 'priority'];
    buttons.forEach(b => {
      const el = document.getElementById('btn-token-' + b);
      if (el) {
        el.classList.remove('btn-primary');
        el.classList.add('btn-secondary');
      }
    });
    
    let activeId = 'btn-token-all';
    if (type === 'Appointment') activeId = 'btn-token-appt';
    else if (type === 'Walk-in') activeId = 'btn-token-walk';
    else if (type === 'Priority') activeId = 'btn-token-priority';
    
    const activeEl = document.getElementById(activeId);
    if (activeEl) {
      activeEl.classList.remove('btn-secondary');
      activeEl.classList.add('btn-primary');
    }
    
    window.renderOpdTokens(type);
  };

  window.callOpdToken = function(tokenNo) {
    window.state.opdTokens.forEach(t => {
      if (t.status === 'Called') t.status = 'Waiting';
      if (t.token === tokenNo) t.status = 'Called';
    });
    const activeDisp = document.getElementById('token-active-display');
    if (activeDisp) activeDisp.innerText = tokenNo;
    window.renderOpdTokens();
    alert(`Calling Token ${tokenNo}. Announcement triggered.`);
  };

  window.completeOpdToken = function(tokenNo) {
    window.state.opdTokens.forEach(t => {
      if (t.token === tokenNo) t.status = 'Done';
    });
    window.renderOpdTokens();
  };

  window.noShowOpdToken = function(tokenNo) {
    window.state.opdTokens.forEach(t => {
      if (t.token === tokenNo) t.status = 'No-Show';
    });
    window.renderOpdTokens();
  };

  window.issueNextToken = function() {
    const nextNum = window.state.opdTokens.length + 101;
    const newToken = {
      token: "T-" + nextNum,
      name: "Walk-in Patient " + (window.state.opdTokens.length + 1),
      uhid: "MH-2026-" + Math.floor(1000 + Math.random() * 9000),
      type: "Walk-in",
      doctor: "Dr. Iyer",
      priority: "Regular",
      priorityClass: "priority-regular",
      waitTime: "0m",
      status: "Waiting"
    };
    window.state.opdTokens.push(newToken);
    window.renderOpdTokens();
    alert(`New Token ${newToken.token} issued for walk-in consultation.`);
  };

  // RENDER: Recent Registrations
  window.renderRecentRegistrations = function(filterVal = 'all') {
    const tbody = document.getElementById('recent-registrations-body');
    if (!tbody) return;

    let list = window.state.recentRegistrations;
    if (filterVal !== 'all') {
      list = list.filter(r => r.type === filterVal);
    }

    tbody.innerHTML = list.map(r => {
      const flagsHTML = r.flags.map(f => {
        let flagColor = "background-color: #E2E8F0; color: #1E293B;";
        if (f.includes('MLC')) flagColor = "background-color: #FEE2E2; color: #991B1B; border: 1px solid #FCA5A5;";
        else if (f.includes('BPL') || f.includes('PMJAY')) flagColor = "background-color: #ECFDF5; color: #065F46; border: 1px solid #A7F3D0;";
        else if (f.includes('Senior')) flagColor = "background-color: #FEF3C7; color: #92400E; border: 1px solid #FDE68A;";
        else if (f.includes('TPA')) flagColor = "background-color: #EFF6FF; color: #1E40AF; border: 1px solid #BFDBFE;";
        return `<span style="padding: 1px 4px; border-radius: 4px; font-size: 8px; margin-right: 2px; display:inline-block; ${flagColor}">${f}</span>`;
      }).join('');

      let statusColor = "text-slate-500";
      if (r.status === 'Admitted') statusColor = "text-blue-600 font-bold";
      else if (r.status === 'Registered') statusColor = "text-emerald-600 font-medium";

      const patObj = window.state.patients && window.state.patients.find(p => p.uhid === r.uhid);
      const isDischarged = patObj && (patObj.status === 'Discharged' || patObj.dischargeStatus === 'Completed');
      const isOpdCompleted = r.type === 'OPD' && (!patObj || !['Checked In', 'Registered', 'In Consultation', 'Waiting', 'Called'].includes(patObj.status));
      const hideTypeBadge = isDischarged || isOpdCompleted;

      return `
        <tr style="border-bottom: 1px solid var(--border-color);">
          <td style="padding: 6px;" class="admin-mono font-semibold">${r.uhid}</td>
          <td style="padding: 6px; font-weight: 500;">${r.name}</td>
          <td style="padding: 6px;">${r.age}/${r.gender}</td>
          <td style="padding: 6px;">${hideTypeBadge ? '' : `<span class="badge" style="font-size: 9px; padding: 2px 4px;">${r.type}</span>`}</td>
          <td style="padding: 6px;">${r.doctor}</td>
          <td style="padding: 6px;" class="${r.depositClass}">${r.deposit}</td>
          <td style="padding: 6px;">${flagsHTML}</td>
          <td style="padding: 6px;"><span class="${statusColor}">${r.status}</span></td>
          <td style="padding: 6px; text-align: right; display:flex; gap: 2px; justify-content: flex-end;">
            <button class="btn btn-secondary text-[10px]" onclick="window.showRegisterDetails('${r.uhid}')" style="padding:2px 4px;">Open</button>
            ${r.status === 'Registered' && r.type === 'IPD' ? `<button class="btn btn-primary text-[10px]" onclick="window.admitFromRecent('${r.uhid}')" style="padding:2px 4px; background-color:#2563EB;">Admit</button>` : ''}
            <button class="btn btn-secondary text-[10px]" onclick="window.printRegForms('${r.uhid}')" style="padding:2px 4px;">Print</button>
          </td>
        </tr>
      `;
    }).join('');
  };

  window.filterRegistrations = function(type) {
    const buttons = ['all', 'opd', 'ipd', 'emg', 'day'];
    buttons.forEach(b => {
      const el = document.getElementById('btn-reg-' + b);
      if (el) {
        el.classList.remove('btn-primary');
        el.classList.add('btn-secondary');
      }
    });

    let activeId = 'btn-reg-all';
    if (type === 'OPD') activeId = 'btn-reg-opd';
    else if (type === 'IPD') activeId = 'btn-reg-ipd';
    else if (type === 'Emergency') activeId = 'btn-reg-emg';
    else if (type === 'Daycare') activeId = 'btn-reg-day';

    const activeEl = document.getElementById(activeId);
    if (activeEl) {
      activeEl.classList.remove('btn-secondary');
      activeEl.classList.add('btn-primary');
    }

    window.renderRecentRegistrations(type);
  };

  window.showRegisterDetails = function(uhid) {
    const patient = window.state.recentRegistrations.find(r => r.uhid === uhid);
    if (patient) {
      alert(`Patient File Record:\nName: ${patient.name}\nAge/Sex: ${patient.age}/${patient.gender}\nPayer status: ${patient.deposit}\nActive Flags: ${patient.flags.join(', ')}`);
    }
  };

  window.admitFromRecent = function(uhid) {
    window.showRegistrationWizard('admit', uhid);
  };

  window.printRegForms = function(uhid) {
    alert(`Form layout compiled for UHID: ${uhid}. Spooling PDF printer...`);
  };

  // RENDER: Bed Board Grid
  window.renderBedGrid = function(filterVal = 'all') {
    const container = document.getElementById('bed-board-grid-container');
    if (!container) return;

    // Group beds by ward
    const wardsConfig = {
      "GENERAL-WARD-M": "General Ward (Male)",
      "GENERAL-WARD-F": "General Ward (Female)",
      "SEMI-PRIVATE": "Semi-Private Ward",
      "PRIVATE": "Private Room",
      "DELUXE": "Deluxe Suite",
      "CCU": "Critical Care Unit (CCU)",
      "ICCU": "Intensive Cardiac Care Unit (ICCU)",
      "EMERGENCY": "Emergency / Triage Ward",
      "DAYCARE": "Daycare Unit"
    };

    let html = '';
    
    for (const [wardKey, wardName] of Object.entries(wardsConfig)) {
      // Check filtering
      if (filterVal !== 'all' && !wardKey.includes(filterVal)) {
        continue;
      }

      const wardBeds = Object.entries(window.state.bedsStatus).filter(([id, b]) => b.wardKey === wardKey);
      const occupied = wardBeds.filter(([id, b]) => b.status === 'Occupied').length;
      const total = wardBeds.length;
      const available = total - occupied;

      html += `
        <div style="border: 1px solid var(--border-color); border-radius: 6px; padding: 10px; background-color: white;">
          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-color); padding-bottom: 6px; margin-bottom: 10px; cursor: pointer;" onclick="window.toggleWardCollapse('${wardKey}')">
            <span style="font-weight: 700; font-size: 0.8rem; color: var(--text-primary);">${wardName}</span>
            <span style="font-size: 0.7rem; color: var(--text-muted);" class="admin-mono">
              Occ: ${occupied} / Tot: ${total} | Avail: <span class="text-emerald-600 font-bold">${available}</span>
            </span>
          </div>
          
          <div id="ward-grid-${wardKey}" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)); gap: 8px;">
            ${wardBeds.map(([bedId, info]) => {
              let statusClass = "bed-status-vacant";
              let statusLabel = `<span style="background-color:#E1F5FE; color:#0288D1; font-weight:bold; font-size:9px; padding:1px 4px; border-radius:3px;">VACANT</span>`;
              let patientHTML = '<div style="color:var(--text-muted); font-style:italic;">No patient</div>';
              let actionsHTML = `<button class="btn btn-secondary btn-xs" onclick="window.assignBedDirect('${bedId}')" style="width:100%; font-size:0.6rem; padding:1px 3px;">Assign Bed</button>`;

              if (info.status === 'Occupied') {
                statusClass = "bed-status-occupied";
                statusLabel = `<span style="background-color:#E3F2FD; color:#1E88E5; font-weight:bold; font-size:9px; padding:1px 4px; border-radius:3px;">OCCUPIED</span>`;
                patientHTML = `
                  <div style="font-weight:700; color:var(--text-primary); text-overflow:ellipsis; overflow:hidden; white-space:nowrap; text-decoration:underline; cursor:pointer;" onclick="router.navigate('patients?uhid=${info.patientUhid || ""}')">${info.patientName || "Anonymous"}</div>
                  <div class="admin-mono" style="font-size:8px; color:var(--text-muted);">${info.patientUhid || "MH-XXXX-XXXX"}</div>
                  <div style="font-size:8px; color:var(--text-secondary); margin-top:2px;">${info.doctorName || "Dr. Staff"} · ${info.los || "1d"}</div>
                `;
                actionsHTML = `<button class="btn btn-secondary btn-xs" onclick="window.dischargePatientDirect('${bedId}')" style="width:100%; font-size:0.6rem; padding:1px 3px; border-color:#EF4444; color:#EF4444;">D/C Clearance</button>`;
              } else if (info.status === 'Reserved') {
                statusClass = "bed-status-reserved";
                statusLabel = `<span style="background-color:#FFF3E0; color:#FB8C00; font-weight:bold; font-size:9px; padding:1px 4px; border-radius:3px;">RESERVED</span>`;
                patientHTML = `
                  <div style="font-weight:700; color:#D97706; text-overflow:ellipsis; overflow:hidden; white-space:nowrap; text-decoration:underline; cursor:pointer;" onclick="const patUhid = (window.state.patients || []).find(p => p.name === '${info.patientName.replace(/'/g, "\\'")}')?.uhid || ''; if (patUhid) router.navigate('patients?uhid=' + patUhid);">${info.patientName}</div>
                  <div style="font-size:8px; color:var(--text-muted);">ETA: ${info.expectedTime || "1h"}</div>
                `;
                actionsHTML = `<button class="btn btn-primary btn-xs" onclick="window.confirmReservedAdmit('${bedId}')" style="width:100%; font-size:0.6rem; padding:1px 3px; background-color:#F59E0B; border-color:#F59E0B;">Confirm Admit</button>`;
              } else if (info.status === 'Blocked') {
                statusClass = "bed-status-blocked";
                statusLabel = `<span style="background-color:#ECEFF1; color:#546E7A; font-weight:bold; font-size:9px; padding:1px 4px; border-radius:3px;">BLOCKED</span>`;
                patientHTML = `
                  <div style="font-size:8px; color:#546E7A; font-style:italic;">${info.reason || "Housekeeping"}</div>
                `;
                actionsHTML = `<button class="btn btn-secondary btn-xs" onclick="window.releaseBlockedBed('${bedId}')" style="width:100%; font-size:0.6rem; padding:1px 3px;">Release Bed</button>`;
              }

              return `
                <div class="bed-cell ${statusClass}">
                  <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 4px;">
                    <span class="admin-mono font-bold" style="font-size:9px;">${bedId}</span>
                    ${statusLabel}
                  </div>
                  <div style="flex:1; display:flex; flex-direction:column; justify-content:center; padding-bottom:4px;">
                    ${patientHTML}
                  </div>
                  <div>
                    ${actionsHTML}
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      `;
    }

    container.innerHTML = html;
  };

  window.toggleWardCollapse = function(wardKey) {
    const grid = document.getElementById(`ward-grid-${wardKey}`);
    if (grid) {
      grid.style.display = grid.style.display === 'none' ? 'grid' : 'none';
    }
  };

  window.filterBedBoard = function(type) {
    const buttons = ['all', 'gen', 'semi', 'pvt', 'dlx', 'icu', 'emg'];
    buttons.forEach(b => {
      const el = document.getElementById('btn-bed-' + b);
      if (el) {
        el.classList.remove('btn-primary');
        el.classList.add('btn-secondary');
      }
    });

    let activeId = 'btn-bed-all';
    if (type === 'GENERAL') activeId = 'btn-bed-gen';
    else if (type === 'SEMI') activeId = 'btn-bed-semi';
    else if (type === 'PRIVATE') activeId = 'btn-bed-pvt';
    else if (type === 'DELUXE') activeId = 'btn-bed-dlx';
    else if (type === 'ICU') activeId = 'btn-bed-icu';
    else if (type === 'EMERGENCY') activeId = 'btn-bed-emg';

    const activeEl = document.getElementById(activeId);
    if (activeEl) {
      activeEl.classList.remove('btn-secondary');
      activeEl.classList.add('btn-primary');
    }

    window.renderBedGrid(type);
  };

  window.assignBedDirect = function(bedId) {
    window.showRegistrationWizard('admit');
    // Pre-fill selected bed in step 4
    window.selectedBedId = bedId;
    const rateText = document.getElementById('selected-bed-rate');
    const labelText = document.getElementById('selected-bed-label');
    if (labelText) labelText.innerText = bedId;
    if (rateText) {
      const price = bedId.includes('DELUXE') ? 12000 : bedId.includes('PVT') ? 6000 : bedId.includes('SP') ? 3000 : 1500;
      rateText.innerText = `₹${price.toFixed(2)}`;
    }
  };

  window.dischargePatientDirect = function(bedId) {
    const confirm = window.confirm(`Proceed with billing & clearance discharge check for bed ${bedId}?`);
    if (confirm) {
      // release bed
      window.state.bedsStatus[bedId] = {
        wardKey: window.state.bedsStatus[bedId].wardKey,
        status: "Available",
        patientUhid: null,
        patientName: null
      };
      window.renderBedGrid();
      window.renderWardWiseSummary();
      alert(`Bed ${bedId} released successfully after patient discharge clearance.`);
    }
  };

  window.confirmReservedAdmit = function(bedId) {
    const details = window.state.bedsStatus[bedId];
    details.status = "Occupied";
    details.doctorName = "Dr. Sharma";
    details.diagnosis = "Planned Admission";
    details.los = "1d";
    
    // Add to recent registrations
    window.state.recentRegistrations.push({
      uhid: details.patientUhid,
      name: details.patientName,
      age: "45",
      gender: "M",
      type: "IPD",
      doctor: "Dr. Sharma",
      wardType: details.wardKey,
      deposit: "Paid ₹5,000",
      depositClass: "text-emerald-600 font-semibold",
      flags: [],
      status: "Admitted"
    });

    window.renderBedGrid();
    window.renderRecentRegistrations();
    window.renderWardWiseSummary();
    alert(`Admission confirmed. Bed status for ${bedId} updated to OCCUPIED.`);
  };

  window.releaseBlockedBed = function(bedId) {
    window.state.bedsStatus[bedId].status = "Available";
    window.renderBedGrid();
    window.renderWardWiseSummary();
    alert(`Bed ${bedId} is now VACANT and available for admission.`);
  };

  // RENDER: Transfer Queue
  window.renderTransferQueue = function() {
    const tbody = document.getElementById('transfer-queue-body');
    if (!tbody) return;

    tbody.innerHTML = window.state.transferQueue.map((t, idx) => `
      <tr style="border-bottom: 1px solid var(--border-color);">
        <td style="padding: 4px;">
          <div style="font-weight: 600;">${t.name}</div>
          <div class="admin-mono text-[8px] text-slate-400">${t.uhid}</div>
        </td>
        <td style="padding: 4px;" class="admin-mono">${t.from}</td>
        <td style="padding: 4px;">${t.to}</td>
        <td style="padding: 4px;">${t.requestedBy}</td>
        <td style="padding: 4px;">${t.time}</td>
        <td style="padding: 4px; text-align: right;">
          <button class="btn btn-primary text-[10px]" onclick="window.confirmTransfer(${idx})" style="padding: 2px 4px;">Confirm</button>
        </td>
      </tr>
    `).join('');
  };

  window.confirmTransfer = function(idx) {
    const item = window.state.transferQueue[idx];
    
    // Find a vacant bed in requested ward
    const targetWardBeds = Object.entries(window.state.bedsStatus).filter(([id, b]) => b.wardKey.includes(item.to.toUpperCase()) && b.status === 'Available');
    if (targetWardBeds.length === 0) {
      alert(`No vacant beds available in ${item.to} Ward to complete transfer.`);
      return;
    }
    
    const targetBedId = targetWardBeds[0][0];

    // Release old bed
    if (window.state.bedsStatus[item.from]) {
      window.state.bedsStatus[item.from] = {
        wardKey: window.state.bedsStatus[item.from].wardKey,
        status: "Available",
        patientUhid: null,
        patientName: null
      };
    }

    // Occupy new bed
    window.state.bedsStatus[targetBedId] = {
      wardKey: window.state.bedsStatus[targetBedId].wardKey,
      status: "Occupied",
      patientUhid: item.uhid,
      patientName: item.name,
      doctorName: item.requestedBy,
      diagnosis: "Post-Transfer",
      los: "1d"
    };

    // Remove from transfer queue
    window.state.transferQueue.splice(idx, 1);
    
    window.renderBedGrid();
    window.renderTransferQueue();
    window.renderWardWiseSummary();
    alert(`Transfer completed! Patient ${item.name} moved to bed ${targetBedId}.`);
  };

  // RENDER: Action Queues (Waiting beds + Pending docs)
  window.renderActionQueues = function() {
    const waitList = document.getElementById('waiting-bed-queue');
    const docsList = document.getElementById('pending-docs-queue');
    
    if (waitList) {
      waitList.innerHTML = window.state.waitingBedAllotment.map(w => {
        let textClass = "border-left: 3px solid #1E293B; background-color: var(--bg-surface);";
        if (w.waitingMins > 240) textClass = "border-left: 3px solid #EF4444; background-color: #FEF2F2; color: #991B1B;";
        else if (w.waitingMins > 120) textClass = "border-left: 3px solid #F59E0B; background-color: #FFFBEB; color: #92400E;";

        return `
          <div style="padding: 6px 10px; border-radius: 4px; display: flex; justify-content: space-between; align-items: center; font-size: 0.72rem; ${textClass} border: 1px solid var(--border-color); border-left-width: 4px;">
            <div>
              <div style="font-weight:600;">${w.name} <span class="admin-mono text-[9px] text-slate-400">(${w.uhid})</span></div>
              <div style="font-size:9px; opacity:0.8;">Advised: ${w.wardType} Ward · ${w.doctor}</div>
              <div style="font-size:8px; opacity:0.7;" class="admin-mono mt-1">Wait Time: ${w.waitingSince} | Dep: ${w.deposit}</div>
            </div>
            <button class="btn btn-primary text-[10px]" onclick="window.allotBedQueue('${w.uhid}', '${w.wardType}')" style="padding:2px 6px;">Allot Bed</button>
          </div>
        `;
      }).join('');
    }

    if (docsList) {
      docsList.innerHTML = window.state.pendingDocuments.map(d => {
        let actionBtn = '';
        if (d.type === 'ABHA') actionBtn = `<button class="btn btn-secondary text-[10px]" onclick="window.triggerABHAVerify()" style="padding:2px 4px;">Verify ABHA</button>`;
        else if (d.type === 'Consent') actionBtn = `<button class="btn btn-secondary text-[10px]" onclick="window.mockConsentSign(${d.id})" style="padding:2px 4px;">Get Sign</button>`;
        else if (d.type === 'Insurance') actionBtn = `<button class="btn btn-secondary text-[10px]" onclick="window.mockPreAuthInit(${d.id})" style="padding:2px 4px;">Init Pre-auth</button>`;
        else if (d.type === 'MLC') actionBtn = `<button class="btn btn-secondary text-[10px]" onclick="window.mockMLCIntimate(${d.id})" style="padding:2px 4px;">Log Intimation</button>`;

        return `
          <div style="padding: 6px 8px; border: 1px solid var(--border-color); border-radius: 4px; display: flex; justify-content: space-between; align-items: center; font-size: 0.7rem; background-color: var(--bg-surface);">
            <div>
              <div style="font-weight:600;">${d.name}</div>
              <div style="color:#D97706; font-weight:500; font-size:9px;">Missing: ${d.item}</div>
            </div>
            ${actionBtn}
          </div>
        `;
      }).join('');
    }
  };

  window.allotBedQueue = function(uhid, wardType) {
    window.showRegistrationWizard('admit', uhid);
  };

  window.mockConsentSign = function(id) {
    window.state.pendingDocuments = window.state.pendingDocuments.filter(d => d.id !== id);
    window.renderActionQueues();
    alert('General consent signed successfully.');
  };

  window.mockPreAuthInit = function(id) {
    window.state.pendingDocuments = window.state.pendingDocuments.filter(d => d.id !== id);
    window.renderActionQueues();
    alert('TPA Pre-Auth request initiated on sponsor portal.');
  };

  window.mockMLCIntimate = function(id) {
    window.state.pendingDocuments = window.state.pendingDocuments.filter(d => d.id !== id);
    window.renderActionQueues();
    alert('MLC Police intimation logged with station head receipt.');
  };

  // RENDER: MLC & Emergency Log
  window.renderMlcAndEmergencyLog = function() {
    const mlcBody = document.getElementById('mlc-log-body');
    const bdContainer = document.getElementById('bd-log-container');

    if (mlcBody) {
      mlcBody.innerHTML = window.state.mlcLog.map(m => `
        <tr style="border-bottom:1px solid var(--border-color);">
          <td style="padding: 4px;">
            <div style="font-weight:600;">${m.name}</div>
            <div class="admin-mono text-[8px] text-slate-400">${m.uhid}</div>
          </td>
          <td style="padding: 4px;">${m.nature}</td>
          <td style="padding: 4px;">${m.station}</td>
          <td style="padding: 4px;">${m.status === 'Sent' ? '<span class="text-emerald-600 font-bold">Sent ✅</span>' : '<span class="text-red-500 font-bold">Pending ⚠️</span>'}</td>
          <td style="padding: 4px; text-align: right;">
            <button class="btn btn-secondary text-[9px]" onclick="window.updateMlcStatus('${m.uhid}')" style="padding:1px 3px;">Update</button>
          </td>
        </tr>
      `).join('');
    }

    if (bdContainer) {
      if (window.state.broughtDeadLog.length > 0) {
        bdContainer.innerHTML = window.state.broughtDeadLog.map(b => `
          <div style="font-size:0.7rem; color: #1E293B;">
            • <strong>${b.name}</strong> (${b.time})<br>
            Police: <span class="text-emerald-600 font-semibold">${b.police}</span>
          </div>
        `).join('');
      } else {
        bdContainer.innerHTML = '<div style="color:var(--text-muted); font-style:italic;">No cases today</div>';
      }
    }
  };

  window.updateMlcStatus = function(uhid) {
    window.state.mlcLog.forEach(m => {
      if (m.uhid === uhid) m.status = 'Sent';
    });
    window.renderMlcAndEmergencyLog();
    alert(`Medico-Legal Police Copy generated and marked SENT to Station Master.`);
  };

  window.sendToCasualty = function(name) {
    alert(`Patient ${name} triaged and shifted to Casualty emergency bed EMG-04.`);
  };

  // RENDER: Alerts & Notifications
  window.renderAlerts = function() {
    const list = document.getElementById('alerts-container');
    if (!list) return;

    // Hardcode some alerts matching specs
    const alerts = [
      { type: 'red', text: 'Critical Bed Shortage: ICU occupancy is at 95%. Only 1 bed remaining.', time: '10m ago', action: 'D/C Check' },
      { type: 'red', text: 'No semi-private beds available. 2 patients waiting in lobby.', time: '15m ago', action: 'Upgrade Pref' },
      { type: 'amber', text: 'Admission pending >4 hours: Patient Amit Patel wait time is 4.5 hours.', time: '30m ago', action: 'Allot Now' },
      { type: 'red', text: 'Billing Alert: Patient Sunita Devi in Private PVT-204 has deposit balance below threshold (₹2,000).', time: '1h ago', action: 'Collect' },
      { type: 'red', text: 'Missing Consent: Operation planned for Harpreet Singh (PVT-201) tomorrow, general consent missing.', time: '2h ago', action: 'Get Sign' },
      { type: 'amber', text: 'ABHA verification pending for PMJAY beneficiary Sh. Ram Sewak.', time: '2h ago', action: 'Verify Golden' },
      { type: 'amber', text: 'TPA Alert: Pre-auth not initiated for Star Health patient admitted in CCU-BED-02.', time: '3h ago', action: 'Initiate' },
      { type: 'orange', text: 'LAMA Warning: Patient Gopal Banerjee expressed intent to leave against advice. Discharge in progress.', time: '4h ago', action: 'Notify Doc' },
      { type: 'blue', text: 'Ambulance Expected: RTA casualty case arriving in 8 minutes from Mehrauli.', time: 'Live', action: 'Prepare Triage' }
    ];

    list.innerHTML = alerts.map(a => `
      <div class="alert-row alert-${a.type}">
        <div style="display:flex; justify-content:space-between; align-items:flex-start; gap: 8px;">
          <span style="font-weight: 500;">${a.text}</span>
          <button class="btn btn-secondary text-[8px]" onclick="window.dismissAlert('${a.text}')" style="padding:1px 3px; font-weight:600; white-space:nowrap;">${a.action}</button>
        </div>
        <span style="font-size: 8px; opacity: 0.8; text-align: right;" class="admin-mono">${a.time}</span>
      </div>
    `).join('');
  };

  window.dismissAlert = function(text) {
    alert(`Action executed for alert: ${text}`);
  };

  // RENDER: Ward-wise Availability Summary (Section 5)
  window.renderWardWiseSummary = function() {
    const tbody = document.getElementById('ward-wise-summary-body');
    if (!tbody) return;

    const wardsConfig = {
      "GENERAL-WARD-M": "General Ward (Male)",
      "GENERAL-WARD-F": "General Ward (Female)",
      "SEMI-PRIVATE": "Semi-Private Ward",
      "PRIVATE": "Private Room",
      "DELUXE": "Deluxe Suite",
      "CCU": "Critical Care Unit",
      "ICCU": "Intensive Cardiac Care Unit",
      "EMERGENCY": "Emergency Ward",
      "DAYCARE": "Daycare Unit"
    };

    tbody.innerHTML = Object.entries(wardsConfig).map(([key, name]) => {
      const wardBeds = Object.entries(window.state.bedsStatus).filter(([id, b]) => b.wardKey === key);
      const total = wardBeds.length;
      const occupied = wardBeds.filter(([id, b]) => b.status === 'Occupied').length;
      const available = wardBeds.filter(([id, b]) => b.status === 'Available' || b.status === 'Vacant').length;
      const reserved = wardBeds.filter(([id, b]) => b.status === 'Reserved').length;
      const blocked = wardBeds.filter(([id, b]) => b.status === 'Blocked').length;

      const rate = total > 0 ? (occupied / total) * 100 : 0;
      let barColor = "bg-emerald-600";
      if (rate >= 90) barColor = "bg-red-600";
      else if (rate >= 70) barColor = "bg-amber-500";

      return `
        <tr style="border-bottom: 1px solid var(--border-color);">
          <td style="padding: 6px; font-weight: 600;">${name}</td>
          <td style="padding: 6px; text-align: center;" class="admin-mono">${total}</td>
          <td style="padding: 6px; text-align: center;" class="admin-mono font-medium">${occupied}</td>
          <td style="padding: 6px; text-align: center;" class="admin-mono font-semibold text-emerald-600">${available}</td>
          <td style="padding: 6px; text-align: center;" class="admin-mono font-medium text-amber-500">${reserved}</td>
          <td style="padding: 6px; text-align: center;" class="admin-mono text-slate-400">${blocked}</td>
          <td style="padding: 6px;">
            <div style="display:flex; align-items:center; gap:8px;">
              <div class="w-full bg-slate-100 rounded-full h-2" style="background-color:#E2E8F0;">
                <div class="h-2 rounded-full ${barColor}" style="width: ${rate}%;"></div>
              </div>
              <span class="admin-mono text-[9px] font-bold" style="min-width: 30px;">${rate.toFixed(0)}%</span>
            </div>
          </td>
          <td style="padding: 6px; text-align: right;">
            <button class="btn btn-secondary btn-xs" onclick="window.scrollToWard('${key}')" style="padding:2px 4px; font-size:9px;">View Ward</button>
          </td>
        </tr>
      `;
    }).join('');
  };

  window.scrollToWard = function(wardKey) {
    const el = document.getElementById(`ward-grid-${wardKey}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // FULL SCREEN VIEW BED BOARD
  window.toggleFullScreenBedBoard = function() {
    alert("Displaying full screen high-resolution ward dashboard...");
  };

  // QUICK ACTIONS MOCKS
  window.showTransferModal = function() {
    alert("Open patient transfer form. Drag patient cell or select destination room.");
  };

  window.showEmergencyAdmission = function() {
    window.showRegistrationWizard('admit');
    document.getElementById('w-visit-type').value = 'Emergency';
    window.toggleVisitType('Emergency');
  };

  window.printAdmissionBlank = function() {
    alert("Printing blank Admission Consent forms, MLC slips, and Ward Handover checklists.");
  };

  window.showAttenderPassModal = function() {
    alert("Attender pass generator:\nSearch patient, issue biometric attender ID card.");
  };

  window.showInsuranceVerifyModal = function() {
    alert("Opening Insurance / TPA verification portal. Checking LOA documents...");
  };

  window.showAbhaVerifyModal = function() {
    alert("Linking ABHA health locker. Check PMJAY eligibility via NHA portal...");
  };

  // WIZARD CONTROLS (Section 6)
  window.currentWizardStep = 1;
  window.wizardMode = 'new';
  window.selectedBedId = null;

  window.showRegistrationWizard = function(mode, prefillUhid = '') {
    window.currentWizardStep = 1;
    window.wizardMode = mode;
    window.selectedBedId = null;
    
    // Clear forms
    document.getElementById('w-pat-name').value = '';
    document.getElementById('w-pat-mobile').value = '';
    document.getElementById('w-pat-dob').value = '';
    document.getElementById('w-pat-age').value = '';
    document.getElementById('w-pat-aadhaar').value = '';
    document.getElementById('w-pat-abha').value = '';
    document.getElementById('w-ipd-diagnosis').value = '';
    document.getElementById('w-deposit-collected').value = '5000';
    document.getElementById('w-deposit-waived').checked = false;
    document.getElementById('w-deposit-waiver-reason').value = '';
    document.getElementById('w-waiver-reason-container').style.display = 'none';
    document.getElementById('selected-bed-label').innerText = 'None Selected';
    document.getElementById('selected-bed-rate').innerText = '₹0.00';
    
    // Default visibility of step 1
    window.updateWizardStepDisplay();
    
    document.getElementById('registration-wizard-overlay').style.display = 'flex';

    if (prefillUhid) {
      document.getElementById('wizard-search-input').value = prefillUhid;
      window.triggerWizardSearch();
    }
  };

  window.closeRegistrationWizard = function() {
    document.getElementById('registration-wizard-overlay').style.display = 'none';
  };

  window.updateWizardStepDisplay = function() {
    // Hide all steps
    for (let i = 1; i <= 5; i++) {
      const step = document.getElementById(`wizard-step-${i}`);
      const ind = document.getElementById(`indicator-step-${i}`);
      if (step) step.classList.remove('active');
      if (ind) {
        ind.classList.remove('active', 'completed');
        if (i < window.currentWizardStep) ind.classList.add('completed');
        if (i === window.currentWizardStep) ind.classList.add('active');
      }
    }

    const currentStepDiv = document.getElementById(`wizard-step-${window.currentWizardStep}`);
    if (currentStepDiv) currentStepDiv.classList.add('active');

    // Button states
    document.getElementById('wizard-btn-prev').disabled = (window.currentWizardStep === 1);
    
    const nextBtn = document.getElementById('wizard-btn-next');
    if (window.currentWizardStep === 5) {
      nextBtn.innerHTML = 'Complete Admission 🛌';
      nextBtn.style.backgroundColor = '#10B981';
      nextBtn.style.borderColor = '#10B981';
    } else {
      nextBtn.innerHTML = 'Next ➡️';
      nextBtn.style.backgroundColor = '';
      nextBtn.style.borderColor = '';
    }

    // Special layout triggers when entering steps
    if (window.currentWizardStep === 4) {
      window.renderWizardBedSelection();
    }
  };

  window.nextWizardStep = function() {
    if (window.currentWizardStep === 5) {
      window.submitWizardAdmission();
      return;
    }

    // Validation checks
    if (window.currentWizardStep === 1) {
      const name = document.getElementById('w-pat-name').value.trim();
      const mobile = document.getElementById('w-pat-mobile').value.trim();
      if (!name || !mobile) {
        alert('Please fill in required fields: Patient Name and Mobile Number.');
        return;
      }
      
      // Ayushman Bharat PMJAY check: ABHA ID mandatory
      const payer = document.getElementById('w-payer-type').value;
      const abha = document.getElementById('w-pat-abha').value.trim();
      if (payer === 'PMJAY' && !abha) {
        alert('CRITICAL WARNING:\nAyushman Bharat PMJAY patients MUST have a verified ABHA ID linked. Hard block active.');
        return;
      }
    }

    if (window.currentWizardStep === 2) {
      const type = document.getElementById('w-visit-type').value;
      if (type === 'IPD') {
        const diag = document.getElementById('w-ipd-diagnosis').value.trim();
        if (!diag) {
          alert('Provisional IPD Admission Diagnosis is required.');
          return;
        }
        
        // MLC Case check: Police Intimation required fields
        const isMlc = document.getElementById('w-visit-mlc').checked;
        const mlcNature = document.getElementById('w-mlc-nature').value.trim();
        if (isMlc && !mlcNature) {
          alert('Medico-Legal (MLC) cases require Nature of Injury and Police Station details to proceed.');
          return;
        }
      }
    }

    if (window.currentWizardStep === 3) {
      const payer = document.getElementById('w-payer-type').value;
      const collected = parseFloat(document.getElementById('w-deposit-collected').value) || 0;
      const isWaived = document.getElementById('w-deposit-waived').checked;
      const reason = document.getElementById('w-deposit-waiver-reason').value.trim();
      
      if (!isWaived && collected <= 0 && payer === 'Self Pay') {
        alert('Please collect deposit or check the "Waive Deposit" flag with supervisor approval.');
        return;
      }
      if (isWaived && !reason) {
        alert('Deposit Waiver requires supervisor auth comment/reason.');
        return;
      }
    }

    if (window.currentWizardStep === 4) {
      const visitType = document.getElementById('w-visit-type').value;
      if (visitType === 'IPD' && !window.selectedBedId) {
        alert('Please select a bed in the grid to continue IPD admission.');
        return;
      }
    }

    window.currentWizardStep++;
    window.updateWizardStepDisplay();
  };

  window.prevWizardStep = function() {
    if (window.currentWizardStep > 1) {
      window.currentWizardStep--;
      window.updateWizardStepDisplay();
    }
  };

  window.calcAgeFromDob = function(dobVal) {
    if (!dobVal) return;
    const birth = new Date(dobVal);
    const now = new Date();
    let age = now.getFullYear() - birth.getFullYear();
    const m = now.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) {
      age--;
    }
    document.getElementById('w-pat-age').value = age;
    if (age >= 60) {
      document.getElementById('w-flag-senior').checked = true;
    }
  };

  window.triggerWizardSearch = function() {
    const term = document.getElementById('wizard-search-input').value.trim();
    if (!term) return;

    // mock lookup in registry
    if (term.includes('4802') || term.toLowerCase().includes('rajesh')) {
      document.getElementById('w-pat-name').value = 'Rajesh Kumar';
      document.getElementById('w-pat-mobile').value = '9876543210';
      document.getElementById('w-pat-dob').value = '1982-04-12';
      document.getElementById('w-pat-age').value = '44';
      document.getElementById('w-pat-gender').value = 'Male';
      document.getElementById('w-pat-aadhaar').value = '3829-1092-3847';
      document.getElementById('w-pat-abha').value = '90-1829-3829-12';
      alert('Patient file found! Loaded Demographics.');
    } else {
      alert('No record matching query. Proceeding with New Patient registration.');
    }
  };

  window.mockAadhaarScan = function() {
    document.getElementById('w-pat-aadhaar').value = '9012-' + Math.floor(1000 + Math.random()*9000) + '-' + Math.floor(1000 + Math.random()*9000);
    alert('Aadhaar biometric scanner synced. Photo & DOB populated.');
  };

  window.triggerABHAVerify = function() {
    const abhaVal = document.getElementById('w-pat-abha').value;
    if (!abhaVal) {
      document.getElementById('w-pat-abha').value = Math.floor(10 + Math.random()*89) + '-' + Math.floor(1000 + Math.random()*8999) + '-' + Math.floor(1000 + Math.random()*8999) + '-' + Math.floor(10 + Math.random()*89);
    }
    alert('ABHA ID verified on National Health Authority (NHA) database.');
  };

  window.toggleForeignFields = function(val) {
    const div = document.getElementById('foreign-national-fields');
    if (div) {
      div.style.display = (val.toLowerCase() !== 'indian') ? 'block' : 'none';
      document.getElementById('w-flag-foreign').checked = (val.toLowerCase() !== 'indian');
    }
  };

  window.toggleForeignCheckbox = function(checked) {
    const div = document.getElementById('foreign-national-fields');
    if (div) {
      div.style.display = checked ? 'block' : 'none';
    }
    document.getElementById('w-pat-nationality').value = checked ? 'American' : 'Indian';
  };

  window.mockPhotoCapture = function() {
    document.getElementById('w-pat-photo-preview').innerText = '📸';
    alert('Camera snapshot saved in patient profile attachments.');
  };

  window.mockPhotoUpload = function() {
    document.getElementById('w-pat-photo-preview').innerText = '🖼️';
    alert('Local file uploaded successfully.');
  };

  // STEP 2 VISITS
  window.toggleVisitType = function(val) {
    const opdDiv = document.getElementById('w-opd-fields');
    const ipdDiv = document.getElementById('w-ipd-fields');
    const refDiv = document.getElementById('w-referral-fields');
    
    if (opdDiv) opdDiv.style.display = (val === 'OPD') ? 'block' : 'none';
    if (ipdDiv) ipdDiv.style.display = (val === 'IPD' || val === 'Emergency' || val === 'Daycare') ? 'block' : 'none';
    if (refDiv) refDiv.style.display = (val === 'Referral-In') ? 'block' : 'none';

    // update deposit config text
    const depReq = document.getElementById('w-deposit-required');
    if (depReq) {
      if (val === 'OPD') depReq.value = '₹0.00';
      else if (val === 'Daycare') depReq.value = '₹2,500.00';
      else depReq.value = '₹5,000.00';
    }
  };

  window.toggleWizardMLC = function(checked) {
    const div = document.getElementById('wizard-mlc-subfields');
    if (div) {
      div.style.display = checked ? 'flex' : 'none';
    }
  };

  window.toggleWizardBD = function(checked) {
    if (checked) {
      alert("WARNING: Brought Dead (BD) cases mandate police notifications. Form elements simplified.");
      document.getElementById('w-ipd-diagnosis').value = 'Brought Dead / BD';
      document.getElementById('w-payer-type').value = 'Charity';
      window.togglePayerFields('Charity');
    }
  };

  // STEP 3 PAYERS
  window.togglePayerFields = function(val) {
    const tpa = document.getElementById('w-tpa-dropdown');
    const ins = document.getElementById('w-ins-fields');
    const cghs = document.getElementById('w-cghs-fields');
    const pmjay = document.getElementById('w-pmjay-fields');
    
    if (tpa) tpa.disabled = (val !== 'Insurance');
    if (ins) ins.style.display = (val === 'Insurance') ? 'block' : 'none';
    if (cghs) cghs.style.display = (val === 'CGHS' || val === 'ECHS') ? 'block' : 'none';
    if (pmjay) pmjay.style.display = (val === 'PMJAY') ? 'block' : 'none';

    const depReq = document.getElementById('w-deposit-required');
    const depCol = document.getElementById('w-deposit-collected');
    
    if (depReq && depCol) {
      if (val === 'PMJAY' || val === 'Charity') {
        depReq.value = '₹0.00';
        depCol.value = '0';
        document.getElementById('w-deposit-waived').checked = true;
        window.toggleWaiverField(true);
        document.getElementById('w-deposit-waiver-reason').value = 'Govt Scheme / BPL Charity Beneficiary';
      } else {
        const visitType = document.getElementById('w-visit-type').value;
        const valAmt = (visitType === 'Daycare') ? 2500 : 5000;
        depReq.value = `₹${valAmt.toFixed(2)}`;
        depCol.value = valAmt.toString();
        document.getElementById('w-deposit-waived').checked = false;
        window.toggleWaiverField(false);
      }
    }
  };

  window.toggleWaiverField = function(checked) {
    const container = document.getElementById('w-waiver-reason-container');
    if (container) {
      container.style.display = checked ? 'block' : 'none';
    }
  };

  window.mockVerifyCoverage = function() {
    alert("TPA Portal API sync successful. STAR Health coverage details confirmed. Room Rent limit: ₹5,000/day.");
  };

  window.verifyGoldenCard = function() {
    const cardId = document.getElementById('w-pmjay-id').value;
    if (!cardId) {
      alert("Golden card ID is required to query state PMJAY portal.");
      return;
    }
    alert(`Ayushman Bharat portal: Beneficiary validated.\nPackage balance: ₹1,50,000 available.`);
  };

  // STEP 4 BED SELECTION
  window.renderWizardBedSelection = function() {
    const grid = document.getElementById('wizard-bed-grid');
    if (!grid) return;

    // Filter beds based on Preferred ward type selected in step 2
    const prefWard = document.getElementById('w-ipd-ward-pref').value;
    const wardBeds = Object.entries(window.state.bedsStatus).filter(([id, b]) => b.wardKey === prefWard);
    
    if (wardBeds.length === 0) {
      grid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; color: #EF4444; padding: 20px;">No beds configured or available in preferred ward category. Please choose a different ward in Step 2.</div>';
      return;
    }

    grid.innerHTML = wardBeds.map(([bedId, info]) => {
      let isAvailable = (info.status === 'Available' || info.status === 'Vacant');
      let style = 'cursor: pointer; padding: 8px; border: 1px solid var(--border-color); border-radius: 4px; text-align: center; background: white;';
      let titleText = 'Available';
      
      if (!isAvailable) {
        style = 'opacity: 0.5; cursor: not-allowed; padding: 8px; border: 1px solid #E2E8F0; border-radius: 4px; text-align: center; background: #F1F5F9;';
        titleText = info.status;
      }
      
      const price = prefWard.includes('DELUXE') ? 12000 : prefWard.includes('PVT') ? 6000 : prefWard.includes('SP') ? 3000 : 1500;

      return `
        <div style="${style}" onclick="${isAvailable ? `window.selectWizardBed('${bedId}', ${price})` : ''}">
          <div style="font-weight: bold; font-size: 0.75rem;" class="admin-mono">${bedId}</div>
          <div style="font-size: 0.65rem; color: var(--text-muted); margin-top: 4px;">${titleText}</div>
          <div style="font-size: 0.65rem; font-weight: bold; color: var(--primary); margin-top: 2px;" class="admin-mono">₹${price}/day</div>
        </div>
      `;
    }).join('');
  };

  window.selectWizardBed = function(bedId, rate) {
    window.selectedBedId = bedId;
    document.getElementById('selected-bed-label').innerText = bedId;
    document.getElementById('selected-bed-rate').innerText = `₹${rate.toFixed(2)}`;
    
    // Add border highlight to the clicked bed cell in grid if needed, or simply notify
    alert(`Bed ${bedId} selected for allotment.`);
  };

  // STEP 5 DOCUMENTS
  window.mockDrawSign = function() {
    document.getElementById('wizard-sign-status').innerHTML = '<span style="color:#059669; font-weight:bold;">✅ Signature Captured Digitally</span>';
    alert('Wet signature registered in transaction payload.');
  };

  window.issueAttenderPassWizard = function() {
    const patName = document.getElementById('w-pat-name').value;
    const attName = document.getElementById('w-attender-name').value;
    const relation = document.getElementById('w-attender-relation').value;
    
    if (!patName || !attName || !relation) {
      alert("Patient Name, Attender Name, and Relation are required to issue a pass.");
      return;
    }
    
    alert(`🎫 PRINT PASS:\nPatient: ${patName}\nAttender: ${attName} (${relation})\nValidity: 7 days\nWard access granted.`);
  };

  // SUBMIT WIZARD ADMISSION
  window.submitWizardAdmission = function() {
    const name = document.getElementById('w-pat-name').value;
    const mobile = document.getElementById('w-pat-mobile').value;
    const age = document.getElementById('w-pat-age').value;
    const gender = document.getElementById('w-pat-gender').value;
    const visitType = document.getElementById('w-visit-type').value;
    const doc = (visitType === 'OPD') ? document.getElementById('w-opd-doctor').value : document.getElementById('w-ipd-doctor').value;
    const isMlc = document.getElementById('w-visit-mlc').checked;
    
    const newUhid = "MH-2026-" + Math.floor(1000 + Math.random() * 9000);
    const depVal = parseFloat(document.getElementById('w-deposit-collected').value) || 0;
    const isWaived = document.getElementById('w-deposit-waived').checked;

    // Save to global registrations
    const newReg = {
      uhid: newUhid,
      name: name,
      age: age,
      gender: gender,
      type: visitType,
      doctor: doc,
      wardType: (visitType === 'IPD' || visitType === 'Emergency') ? document.getElementById('w-ipd-ward-pref').value : '-',
      deposit: isWaived ? 'Waived-Charity' : `Paid ₹${depVal.toLocaleString('en-IN')}`,
      depositClass: isWaived ? 'text-blue-600 font-semibold' : 'text-emerald-600 font-semibold',
      flags: [],
      status: (visitType === 'OPD') ? 'Registered' : 'Admitted'
    };

    if (isMlc) newReg.flags.push('MLC');
    if (document.getElementById('w-flag-senior').checked) newReg.flags.push('Senior Citizen (>60)');
    if (document.getElementById('w-flag-gov').checked) newReg.flags.push('CGHS');

    window.state.recentRegistrations.unshift(newReg);

    // If IPD, occupy the selected bed
    if ((visitType === 'IPD' || visitType === 'Emergency') && window.selectedBedId) {
      window.state.bedsStatus[window.selectedBedId] = {
        wardKey: window.state.bedsStatus[window.selectedBedId].wardKey,
        status: "Occupied",
        patientUhid: newUhid,
        patientName: name,
        doctorName: doc,
        diagnosis: document.getElementById('w-ipd-diagnosis').value,
        los: "0d"
      };
      
      // Add to global admissions
      window.state.admissions.push({
        id: "ADM" + (5000 + window.state.admissions.length),
        uhid: newUhid,
        patientName: name,
        date: new Date().toISOString().split('T')[0],
        ward: window.state.bedsStatus[window.selectedBedId].wardKey,
        bed: window.selectedBedId,
        doctorName: doc,
        diagnosis: document.getElementById('w-ipd-diagnosis').value,
        status: "Active"
      });
      
      // Remove from waiting queue if existed
      window.state.waitingBedAllotment = window.state.waitingBedAllotment.filter(w => w.name !== name);
    }

    // If OPD, issue token
    if (visitType === 'OPD') {
      const nextTokenNum = window.state.opdTokens.length + 101;
      window.state.opdTokens.push({
        token: "T-" + nextTokenNum,
        name: name,
        uhid: newUhid,
        type: "Walk-in",
        doctor: doc,
        priority: "Regular",
        priorityClass: "priority-regular",
        waitTime: "0m",
        status: "Waiting"
      });
    }

    // Refresh display
    window.renderRecentRegistrations();
    window.renderOpdTokens();
    window.renderBedGrid();
    window.renderActionQueues();
    window.renderWardWiseSummary();
    window.closeRegistrationWizard();

    // Success prompt & notifications
    alert(`Success!\nUHID generated: ${newUhid}\nIP Number / Token allocated.\nWristband layout spooled.\nSMS sent to attender.`);
  };

  // BIRTH & DEATH (Section 7)
  window.showBirthModal = function() {
    document.getElementById('birth-date').value = new Date().toISOString().split('T')[0];
    document.getElementById('birth-time').value = new Date().toTimeString().split(' ')[0].slice(0, 5);
    document.getElementById('birth-modal-overlay').style.display = 'flex';
  };

  window.closeBirthModal = function() {
    document.getElementById('birth-modal-overlay').style.display = 'none';
  };

  window.submitBirthRegistration = function() {
    const mother = document.getElementById('birth-mother-uhid').value.trim();
    const baby = document.getElementById('birth-baby-name').value.trim();
    if (!mother || !baby) {
      alert("Mother UHID and Baby details are required.");
      return;
    }

    window.state.birthRegistry.push({
      motherUhid: mother,
      babyName: baby,
      date: document.getElementById('birth-date').value,
      time: document.getElementById('birth-time').value,
      gender: document.getElementById('birth-gender').value,
      weight: document.getElementById('birth-weight').value,
      attending: document.getElementById('birth-doc').value
    });

    window.closeBirthModal();
    alert(`Birth registration draft saved for Municipal Board submission.`);
  };

  window.showDeathModal = function() {
    document.getElementById('death-date').value = new Date().toISOString().split('T')[0];
    document.getElementById('death-time').value = new Date().toTimeString().split(' ')[0].slice(0, 5);
    document.getElementById('death-modal-overlay').style.display = 'flex';
  };

  window.closeDeathModal = function() {
    document.getElementById('death-modal-overlay').style.display = 'none';
  };

  window.toggleDeathMLC = function(val) {
    const chk = document.getElementById('death-notify-police');
    if (chk) {
      chk.checked = (val !== 'Natural');
    }
  };

  window.submitDeathRegistration = function() {
    const uhid = document.getElementById('death-uhid').value.trim();
    const cause = document.getElementById('death-cause').value.trim();
    if (!uhid || !cause) {
      alert("Patient UHID and Cause of Death are required.");
      return;
    }

    window.state.deathRegistry.push({
      uhid: uhid,
      date: document.getElementById('death-date').value,
      time: document.getElementById('death-time').value,
      cause: cause,
      type: document.getElementById('death-type').value,
      claimant: document.getElementById('death-rel-name').value
    });

    // If MLC / Suspicious, mock report police station
    const type = document.getElementById('death-type').value;
    if (type !== 'Natural') {
      alert(`POLICE NOTICE SENT:\nSuspicious death registration under investigation.\nBody locked under custody pending Post-Mortem clearance.`);
      window.state.broughtDeadLog.push({
        name: "UHID " + uhid,
        time: document.getElementById('death-time').value,
        police: "Notified (MLC)",
        status: "Post-Mortem Pending"
      });
      window.renderMlcAndEmergencyLog();
    }

    window.closeDeathModal();
    alert(`Death registration draft generated. Municipal Board notification filed.`);
  };

  // GLOBAL SEARCH FILTER
  window.filterFrontdeskDashboard = function(val) {
    const query = val.toLowerCase().trim();
    // filter tokens
    const tokenRows = document.querySelectorAll('#opd-token-table-body tr');
    tokenRows.forEach(row => {
      const text = row.innerText.toLowerCase();
      row.style.display = text.includes(query) ? '' : 'none';
    });

    // filter recent registrations
    const regRows = document.querySelectorAll('#recent-registrations-body tr');
    regRows.forEach(row => {
      const text = row.innerText.toLowerCase();
      row.style.display = text.includes(query) ? '' : 'none';
    });
  };

})();
