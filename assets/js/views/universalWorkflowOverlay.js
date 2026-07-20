/* ==========================================================================
   SARONIL HMS — UNIVERSAL DISCHARGE & TRANSFER WORKFLOW OVERLAYS
   ========================================================================== */

(function () {
  'use strict';

  var WARD_RATES = window.WARD_RATES || {
    'GENERAL-WARD-M': { name: 'General Ward (Male)',             rate: 1200,  nursingRate: 500,  minDeposit: 10000, category: 'General'   },
    'GENERAL-WARD-F': { name: 'General Ward (Female)',           rate: 1200,  nursingRate: 500,  minDeposit: 10000, category: 'General'   },
    'SEMI-PRIVATE':   { name: 'Semi-Private Ward',               rate: 2800,  nursingRate: 600,  minDeposit: 20000, category: 'Semi-Private' },
    'PRIVATE':        { name: 'Private Room',                    rate: 5500,  nursingRate: 800,  minDeposit: 35000, category: 'Private'   },
    'DELUXE':         { name: 'Deluxe Suite',                    rate: 11000, nursingRate: 1000, minDeposit: 60000, category: 'Deluxe'    },
    'HDU':            { name: 'High Dependency Unit (HDU)',       rate: 6500,  nursingRate: 2000, minDeposit: 40000, category: 'HDU'       },
    'ICU':            { name: 'ICU / Critical Care Unit',        rate: 10000, nursingRate: 3500, minDeposit: 75000, category: 'ICU'       },
    'ICCU':           { name: 'Intensive Cardiac Care Unit',     rate: 12000, nursingRate: 3500, minDeposit: 90000, category: 'ICU'       },
    'CCU':            { name: 'Cardiac Care Unit (CCU)',         rate: 11000, nursingRate: 3500, minDeposit: 80000, category: 'ICU'       },
    'EMERGENCY':      { name: 'Emergency Ward',                  rate: 3500,  nursingRate: 1500, minDeposit: 15000, category: 'Emergency' },
    'DAYCARE':        { name: 'Daycare Unit',                    rate: 1800,  nursingRate: 600,  minDeposit: 8000,  category: 'Daycare'   }
  };

  // Fallback local currency formatter
  function fmtMoney(amt) {
    return '₹' + Number(amt || 0).toLocaleString('en-IN');
  }

  // Helper to refresh current active SPA view safely
  function refreshActiveSPAView() {
    if (window.router && window.router.currentPage && window.views[window.router.currentPage]) {
      try {
        window.views[window.router.currentPage](window.router.container, window.router.currentSubAnchor || '', window.router.currentParams ? { ...window.router.currentParams } : {});
      } catch (e) {
        console.error("SPA view refresh error:", e);
      }
    } else {
      var c = document.getElementById('main-content');
      if (c && window.renderWorkspace) {
        window.renderWorkspace(c);
      }
    }
  }
  // Also expose on window so external window.* functions can call it
  window.refreshActiveSPAView = refreshActiveSPAView;

  // --- STAGE 2 DYNAMIC ROOM & BED HELPER FOR TRANSFER ---
  function getRoomsForWard(wardKey) {
    if (wardKey === 'GENERAL-WARD-M') return ['Room 401 (Male)', 'Room 402 (Male)'];
    if (wardKey === 'GENERAL-WARD-F') return ['Room 403 (Female)', 'Room 404 (Female)'];
    if (wardKey === 'SEMI-PRIVATE') return ['Room 301', 'Room 302'];
    if (wardKey === 'PRIVATE') return ['Room 201', 'Room 202', 'Room 203'];
    if (wardKey === 'DELUXE') return ['Suite 501', 'Suite 502'];
    if (wardKey === 'CCU') return ['CCU Room A', 'CCU Room B'];
    if (wardKey === 'ICCU') return ['ICCU Room A'];
    if (wardKey === 'EMERGENCY') return ['ER Bay 1', 'ER Bay 2'];
    if (wardKey === 'DAYCARE') return ['Daycare Ward A', 'Daycare Ward B'];
    return ['General Room'];
  }

  function getBedsForRoom(wardKey, roomName) {
    var beds = window.state.wards[wardKey]?.beds || [];
    if (!roomName) return beds;
    if (roomName.includes('Room 401') || roomName.includes('Room 403') || roomName.includes('Room 301') || roomName.includes('Room 201') || roomName.includes('Suite 501') || roomName.includes('CCU Room A') || roomName.includes('ER Bay 1') || roomName.includes('Daycare Ward A')) {
      return beds.slice(0, Math.ceil(beds.length / 2));
    }
    return beds.slice(Math.ceil(beds.length / 2));
  }

  // ==========================================================================
  // WORKFLOW A: PATIENT DISCHARGE OVERLAY
  // ==========================================================================

  window.showUniversalDischargeWorkflow = function (patientUhid) {
    var pat = window.state.patients.find(p => p.uhid === patientUhid);
    if (!pat) {
      alert("Error: Patient record not found.");
      return;
    }

    // Ensure state variables exist on patient
    pat.dischargeStatus = pat.dischargeStatus || 'Not Initiated';
    pat.dischargeClearances = pat.dischargeClearances || null;

    // Create container element if not exists
    var overlayId = 'universal-discharge-overlay';
    var container = document.getElementById(overlayId);
    if (!container) {
      container = document.createElement('div');
      container.id = overlayId;
      container.className = 'fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4 animate-fade-in';
      document.body.appendChild(container);
    }

    // Active sub-sections inside the overlay
    var activeSubForm = ''; // 'nursing' | 'billing' | 'pharmacy' | 'tpa' | 'lab'

    function renderDischargeContent() {
      var currentRole = (window.state && window.state.activeUserRole) || window._ipdActiveRole || 'ATD Coordinator';

      // 1. DISCHARGED STATE (READ-ONLY DISCHARGE SUMMARY)
      if (pat.status === 'Discharged') {
        var summary = pat.dischargeOrder || {};
        container.innerHTML = `
          <div class="bg-white rounded-2xl w-[600px] max-w-[95vw] max-h-[90vh] shadow-2xl overflow-hidden flex flex-col">
            <div class="bg-slate-900 border-b border-slate-200 px-6 py-4 flex justify-between items-center text-white">
              <h3 class="margin-0 text-white font-bold text-base flex items-center gap-2">🏁 Patient Discharge Summary (Read-Only)</h3>
              <button class="text-white hover:text-slate-200 text-xl font-bold cursor-pointer" onclick="window.closeDischargeOverlay()">✕</button>
            </div>
            <div class="p-6 overflow-y-auto flex-1 flex flex-col gap-4 text-left text-xs text-slate-700">
              <div class="bg-emerald-50 border border-emerald-100 rounded-xl p-3.5 flex justify-between items-center text-emerald-800">
                <div>
                  <div class="font-bold text-sm">Discharge Complete</div>
                  <div class="text-[10px]">All clinical orders executed and clearances verified.</div>
                </div>
                <div class="text-xl font-bold">✓</div>
              </div>

              <div class="grid grid-cols-2 gap-4 border border-slate-100 rounded-xl p-4 bg-slate-50">
                <div><span class="text-slate-400 font-medium">Patient:</span> <strong class="text-slate-800">${pat.name}</strong></div>
                <div><span class="text-slate-400 font-medium">UHID:</span> <strong class="text-slate-800">${pat.uhid}</strong></div>
                <div><span class="text-slate-400 font-medium">Discharge Type:</span> <strong class="text-slate-800">${summary.type || 'Regular'}</strong></div>
                <div><span class="text-slate-400 font-medium">Condition at Discharge:</span> <strong class="text-slate-800">${summary.condition || 'Stable'}</strong></div>
                <div class="col-span-2"><span class="text-slate-400 font-medium">Final Diagnosis:</span> <strong class="text-slate-800">${summary.finalDiagnosis || 'Not specified'}</strong></div>
                <div class="col-span-2"><span class="text-slate-400 font-medium">Follow-Up:</span> <strong class="text-slate-800">${summary.followUpDate || 'Not scheduled'} with ${summary.followUpDoctor || 'N/A'}</strong></div>
              </div>

              <div>
                <span class="block font-bold text-slate-800 mb-1">Discharge Instructions:</span>
                <div class="border border-slate-200 rounded-lg p-3 bg-white text-slate-600">${summary.summary || 'None provided.'}</div>
              </div>
            </div>
            <div class="bg-slate-50 px-6 py-3 border-t border-slate-200 flex justify-end">
              <button class="py-2 px-5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold" onclick="window.closeDischargeOverlay()">Close Summary</button>
            </div>
          </div>
        `;
        return;
      }

      // 2. DISCHARGE NOT INITIATED (DOCTOR GATED)
      if (pat.dischargeStatus === 'Not Initiated') {
        var isDoctor = currentRole === 'Treating Consultant / Doctor' || currentRole === 'Doctor';

        if (!isDoctor) {
          container.innerHTML = `
            <div class="bg-white rounded-2xl w-[480px] max-w-[95vw] shadow-2xl p-6 text-center flex flex-col gap-4 animate-scale-in">
              <div class="text-slate-400 text-5xl">🔒</div>
              <h3 class="text-slate-800 font-bold text-lg">Awaiting Discharge Order</h3>
              <p class="text-xs text-slate-500 max-w-[360px] mx-auto">
                Only the patient's **Treating Consultant / Doctor** can issue the initial discharge order. 
              </p>
              
              <!-- Quick switch for reviewer testing -->
              <div class="bg-blue-50 border border-blue-100 rounded-xl p-3.5 text-xs text-blue-800 flex flex-col gap-2 max-w-[400px] mx-auto">
                <span class="font-bold">Prototype Review Panel:</span>
                <span>Switch to the treating Doctor persona below to initiate the discharge order.</span>
                <button class="py-1.5 px-4 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 cursor-pointer text-[10px]" onclick="window.switchRoleAndRerenderDischarge('Treating Consultant / Doctor')">
                  Switch Role to Doctor 🥼
                </button>
              </div>

              <div class="flex justify-end gap-3 mt-4 border-t border-slate-100 pt-4">
                <button class="py-2 px-5 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer" onclick="window.closeDischargeOverlay()">Close</button>
              </div>
            </div>
          `;
          return;
        }

        // doctor can initiate order form
        renderDoctorOrderForm();
        return;
      }

      // 3. IN PROGRESS - CLEARANCES PENDING
      if (pat.dischargeStatus === 'In Progress — Clearances Pending') {
        renderClearancesChecklistPanel();
        return;
      }
    }

    // STAGE 1 — RENDER DOCTOR DISCHARGE ORDER FORM
    function renderDoctorOrderForm() {
      // Form States
      var type = 'Regular';
      var cond = 'Improved';
      var primaryDiag = '';
      var secondaryDiags = []; // list of strings
      var dischargeSummary = 'Patient admitted with acute clinical course. Vital signs monitored and stabilized. Diagnostic profiles evaluated. Medication course administered and completed. Patient fit for discharge.';
      var activityRestrictions = '';
      var followUpDate = '';
      var followUpDoctor = '';
      var dietAdvice = 'Normal diet';
      var dietCustom = '';
      var meds = [
        { name: 'Tab. Amlodipine 5mg', dose: '5mg', route: 'Oral', freq: '1-0-0', dur: '10 Days' },
        { name: 'Tab. Metformin 500mg', dose: '500mg', route: 'Oral', freq: '1-0-1', dur: '30 Days' }
      ];

      // Conditional sections local variables
      // LAMA
      var lamaRisksExplained = 'No';
      var lamaReason = '';
      var lamaAttender = '';
      var lamaRelation = '';
      var lamaMobile = '';
      var lamaSigObtained = false;

      // Referred
      var refHospital = '';
      var refDoctor = '';
      var refReason = '';
      var refSummary = '';
      var refSummaryEdited = false;
      var refAmbulance = 'No';
      var refAmbulanceType = 'Hospital';
      var refContact = '';

      // Death
      var deathDate = '';
      var deathTime = '';
      var deathCausePrimary = '';
      var deathCauseSecondary = '';
      var deathPlace = 'Ward';
      var deathPostMortem = 'No';
      var deathHandoverName = '';
      var deathHandoverRelation = '';
      var deathMlcStation = '';
      var deathMlcInformedTime = '';
      var deathMlcConstable = '';
      var deathMlcAck = 'No';

      // Absconded
      var absLastSeen = '';
      var absLastSeenBy = '';
      var absSecurity = 'No';
      var absPolice = 'No';
      var absPoliceStation = '';
      var absPoliceInformedTime = '';
      var absNotes = '';

      // Verification e-Signature State
      var enteredPin = '';
      var pinAttempts = 3;
      var pinLocked = false;
      var pinErrorMsg = '';

      // Cancel modal dialog active state
      var showCancelWarning = false;

      // Typeahead items
      var ICD_10_LIST = [
        { code: 'I10', desc: 'Essential (primary) hypertension' },
        { code: 'E11.9', desc: 'Type 2 diabetes mellitus without complications' },
        { code: 'K35.8', desc: 'Acute appendicitis, other and unspecified' },
        { code: 'J18.9', desc: 'Pneumonia, unspecified organism' },
        { code: 'A09', desc: 'Infectious gastroenteritis and colitis, unspecified' },
        { code: 'N18.9', desc: 'Chronic kidney disease, unspecified' },
        { code: 'I25.1', desc: 'Atherosclerotic heart disease of native coronary artery' },
        { code: 'K57.9', desc: 'Diverticular disease of intestine, part unspecified' },
        { code: 'M17.9', desc: 'Osteoarthritis of knee, unspecified' }
      ];

      var MEDICINE_LIST = [
        { name: "Tab Pantocid 40mg", generic: "Pantoprazole", dose: "40mg", freq: "Once daily (Before breakfast)", route: "Oral", dur: "10 Days", stock: 100 },
        { name: "Tab Paracetamol 650mg", generic: "Paracetamol", dose: "650mg", freq: "As needed (SOS)", route: "Oral", dur: "5 Days", stock: 100 },
        { name: "Tab Cardace 5mg", generic: "Ramipril", dose: "5mg", freq: "Once daily (Morning)", route: "Oral", dur: "30 Days", stock: 100 },
        { name: "Tab Olimelt 5mg", generic: "Olanzapine", dose: "5mg", freq: "Once daily (Bedtime)", route: "Oral", dur: "30 Days", stock: 100 },
        { name: "Inj Tramadol 50mg", generic: "Tramadol", dose: "50mg", freq: "SOS", route: "IV", dur: "3 Days", stock: 100 },
        { name: "Tab Metformin 500mg", generic: "Metformin", dose: "500mg", freq: "Twice daily (With meals)", route: "Oral", dur: "30 Days", stock: 100 },
        { name: "Tab Amoxicillin 500mg", generic: "Amoxicillin", dose: "500mg", freq: "Three times daily", route: "Oral", dur: "7 Days", stock: 100 },
        { name: "Tab Atorvastatin 10mg", generic: "Atorvastatin", dose: "10mg", freq: "Once daily (Night)", route: "Oral", dur: "30 Days", stock: 100 },
        { name: "Syp Cremaffin 15ml", generic: "Liquid Paraffin", dose: "15ml", freq: "Once daily (Bedtime)", route: "Oral", dur: "7 Days", stock: 100 },
        { name: "Tab Febrex Plus", generic: "Paracetamol + Chlorpheniramine + Phenylephrine", dose: "Combination", freq: "Once daily", route: "Oral", dur: "5 Days", stock: 0 },
        { name: "Tab Sinarest", generic: "Paracetamol + Chlorpheniramine + Phenylephrine", dose: "Combination", freq: "Once daily", route: "Oral", dur: "5 Days", stock: 120 },
        { name: "Tab Cheston Cold", generic: "Paracetamol + Cetirizine + Phenylephrine", dose: "Combination", freq: "Once daily", route: "Oral", dur: "5 Days", stock: 150 },
        { name: "Tab Colgin Plus", generic: "Paracetamol + Chlorpheniramine + Phenylephrine", dose: "Combination", freq: "Once daily", route: "Oral", dur: "5 Days", stock: 80 }
      ];

      // Computes Day N of admission
      var admDate = new Date(pat.admitted || pat.admissionDate || '2026-06-24');
      var today = new Date();
      var diffTime = Math.abs(today - admDate);
      var diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;

      // Add medication manual form active state
      var showAddMedForm = false;
      var newMedName = '';
      var newMedDose = '';
      var newMedRoute = 'Oral';
      var newMedFreq = '1-0-1';
      var newMedDur = '5 Days';

      // Typeahead dropdown indices
      var activeTypeaheadId = null; // 'primary' | index of secondary
      var searchFilterQuery = '';

      function drawForm() {
        // Adjust overlay style to full page layout
        container.className = 'fixed inset-0 bg-slate-50 flex flex-col z-[9999] p-0 overflow-y-auto animate-fade-in';

        if (showCancelWarning) {
          container.innerHTML = `
            <div class="w-full min-h-screen bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
              <div class="w-[480px] max-w-full bg-white shadow-2xl rounded-2xl flex flex-col items-center justify-center p-8 text-center text-slate-700 animate-scale-in">
                <div class="text-amber-500 text-6xl mb-4">⚠️</div>
                <h3 class="text-slate-800 font-extrabold text-lg mb-2">Discard Discharge Order?</h3>
                <p class="text-xs text-slate-500 max-w-[360px] mb-6">
                  This discharge clinical order form has not been saved. All entries and modifications will be permanently lost.
                </p>
                <div class="flex gap-4">
                  <button class="py-2.5 px-6 border border-slate-300 hover:bg-slate-50 rounded-lg text-xs font-bold cursor-pointer" onclick="window.cancelDiscardDischarge()">
                    Keep Editing
                  </button>
                  <button class="py-2.5 px-6 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold cursor-pointer" onclick="window.executeDiscardDischarge()">
                    Discard Order
                  </button>
                </div>
              </div>
            </div>
          `;
          return;
        }

        container.innerHTML = `
          <div class="w-full min-h-screen bg-slate-50 flex flex-col text-left" id="doctor-discharge-panel">
            <!-- TOP BAR HEADER -->
            <div class="bg-white border-b border-slate-200 px-8 py-4 flex flex-row justify-between items-center sticky top-0 z-20 shadow-sm">
              <div class="flex items-center gap-3">
                <button class="flex items-center gap-1.5 py-1.5 px-3 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-bold cursor-pointer transition-colors" onclick="window.triggerCloseOrCancel()">
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                  Back
                </button>
                <span class="text-slate-300 font-light">|</span>
                <span class="text-[10px] font-extrabold text-slate-400 tracking-wider uppercase">STAGE 1: CLINICAL DISCHARGE ORDER</span>
              </div>
              
              <div class="flex items-center gap-4 text-xs font-medium text-slate-500">
                <span>Treating Doctor: <strong class="text-slate-700">Dr. Priya Nair, MD</strong></span>
              </div>
            </div>

            <!-- SCROLLABLE CONTENT BODY -->
            <div class="flex-1 bg-slate-50 p-8 flex justify-center">
              <div class="max-w-4xl w-full flex flex-col gap-6">
                
                <!-- Patient Chip Card -->
                <div class="bg-white border border-slate-200 shadow-sm rounded-2xl p-6 flex flex-row justify-between items-center">
                  <div>
                    <span class="text-[9px] text-slate-400 block font-bold tracking-wider uppercase">INPATIENT DETAILS</span>
                    <h2 class="text-slate-800 text-xl font-black mt-0.5">${pat.name}</h2>
                    <div class="flex gap-4 text-xs text-slate-500 font-semibold mt-1">
                      <span>UHID: <strong class="text-slate-700">${pat.uhid}</strong></span>
                      <span>·</span>
                      <span>Bed: <strong class="text-slate-700">${pat.bed || 'Unassigned'}</strong></span>
                      <span>·</span>
                      <span>Ward: <strong class="text-slate-700">${pat.ward || 'General'}</strong></span>
                      <span>·</span>
                      <span>Admitted: <strong class="text-slate-700">${pat.admitted || pat.admissionDate || '24 Jun 2026'}</strong></span>
                      <span>·</span>
                      <span>Day <strong class="text-slate-700">${diffDays}</strong></span>
                    </div>
                  </div>
                  <div class="flex gap-2">
                    ${pat.flags && pat.flags.includes('MLC') ? '<span class="bg-red-600 text-white text-[9px] font-extrabold px-3 py-1 rounded-full tracking-wider uppercase">MLC Case</span>' : ''}
                    ${pat.payerType === 'TPA' || pat.insuranceProvider ? `<span class="bg-blue-600 text-white text-[9px] font-extrabold px-3 py-1 rounded-full tracking-wider uppercase">${pat.insuranceProvider || 'TPA Covered'}</span>` : ''}
                  </div>
                </div>

                <!-- Main Form Card -->
                <div class="bg-white border border-slate-200 shadow-sm rounded-2xl p-8 flex flex-col gap-6">
                  
                  <!-- SECTION 1 — DISCHARGE TYPE -->
                  <div>
                    <span class="block font-extrabold text-slate-800 tracking-wider mb-3 text-[10px] uppercase">SECTION 1 — DISCHARGE TYPE</span>
                    <div class="grid grid-cols-2 gap-4">
                      <div>
                        <label class="block font-bold text-slate-600 mb-1">Discharge Type *</label>
                        <select class="w-full p-2 border border-slate-200 rounded-lg text-xs font-semibold bg-white" id="sec1-type">
                          <option value="Regular" ${type==='Regular'?'selected':''}>Regular Discharge</option>
                          <option value="LAMA" ${type==='LAMA'?'selected':''}>LAMA — Leave Against Medical Advice</option>
                          <option value="Referred" ${type==='Referred'?'selected':''}>Referred to Another Facility</option>
                          <option value="Death" ${type==='Death'?'selected':''}>Death</option>
                          <option value="Absconded" ${type==='Absconded'?'selected':''}>Absconded</option>
                        </select>
                      </div>
                      <div>
                        <label class="block font-bold text-slate-600 mb-1">Condition at Discharge *</label>
                        <select class="w-full p-2 border border-slate-200 rounded-lg text-xs font-semibold bg-white" id="sec1-cond" ${type==='Death'?'disabled':''}>
                          <option value="Stable" ${cond==='Stable'?'selected':''}>Stable</option>
                          <option value="Improved" ${cond==='Improved'?'selected':''}>Improved</option>
                          <option value="Recovered" ${cond==='Recovered'?'selected':''}>Recovered</option>
                          <option value="Referred" ${cond==='Referred'?'selected':''}>Referred</option>
                          <option value="Deceased" ${cond==='Deceased'?'selected':''}>Deceased</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <!-- CONDITIONAL SECTIONS -->
                  <div id="conditional-details-block">
                    ${getConditionalSectionHTML()}
                  </div>

                  <hr class="border-slate-100 my-1">

                  <!-- SECTION 2 — CLINICAL SUMMARY -->
                  <div class="flex flex-col gap-4">
                    <span class="block font-extrabold text-slate-800 tracking-wider text-[10px] uppercase">SECTION 2 — CLINICAL SUMMARY</span>
                    
                    <!-- Primary ICD-10 Search -->
                    <div class="relative">
                      <label class="block font-bold text-slate-600 mb-1">Final Diagnosis (ICD-10) *</label>
                      <input type="text" class="w-full p-2 border border-slate-200 rounded-lg text-xs" id="sec2-primary-diag" placeholder="Search by name or code — e.g. Essential Hypertension (I10)" value="${primaryDiag}" autocomplete="off">
                      ${renderTypeaheadDropdown('primary', primaryDiag)}
                    </div>

                    <!-- Secondary ICD-10 Search List -->
                    ${secondaryDiags.map((val, idx) => `
                      <div class="relative flex items-center gap-2">
                        <div class="flex-1 relative">
                          <label class="block font-bold text-[10px] text-slate-500 mb-0.5">Secondary Diagnosis #${idx+1}</label>
                          <input type="text" class="w-full p-2 border border-slate-200 rounded-lg text-xs sec2-secondary-input" data-index="${idx}" placeholder="Search secondary diagnosis code..." value="${val}" autocomplete="off">
                          ${renderTypeaheadDropdown(idx, val)}
                        </div>
                        <button type="button" class="mt-4 text-red-500 hover:text-red-700 text-lg font-bold p-1 cursor-pointer" onclick="window.removeSecondaryDiag(${idx})">✕</button>
                      </div>
                    `).join('')}

                    <div>
                      <button type="button" class="text-blue-600 hover:text-blue-800 font-bold text-xs cursor-pointer" onclick="window.addSecondaryDiag()">
                        ➕ Add secondary diagnosis
                      </button>
                    </div>

                    <div>
                      <label class="block font-bold text-slate-600 mb-0.5">Discharge Summary & Clinical Course *</label>
                      <span class="block text-[10px] text-slate-400 mb-1.5">Auto-populated from EMR notes. Review and edit before signing.</span>
                      <textarea class="w-full p-2 border border-slate-200 rounded-lg text-xs" id="sec2-summary" rows="4" placeholder="Summarise presenting complaints, clinical course, investigations, treatment given, and response.">${dischargeSummary}</textarea>
                    </div>

                    <div>
                      <label class="block font-bold text-slate-600 mb-1">Activity Restrictions</label>
                      <input type="text" class="w-full p-2 border border-slate-200 rounded-lg text-xs" id="sec2-restrictions" placeholder="e.g. Avoid heavy lifting for 4 weeks, bed rest for 3 days" value="${activityRestrictions}">
                    </div>
                  </div>

                  <hr class="border-slate-100 my-1">

                  <!-- SECTION 3 — FOLLOW-UP & INSTRUCTIONS -->
                  <div class="flex flex-col gap-4">
                    <span class="block font-extrabold text-slate-800 tracking-wider text-[10px] uppercase">SECTION 3 — FOLLOW-UP & INSTRUCTIONS</span>
                    
                    <div class="grid grid-cols-2 gap-4">
                      <div>
                        <label class="block font-bold text-slate-600 mb-1">Follow-up Date</label>
                        <input type="date" class="w-full p-2 border border-slate-200 rounded-lg text-xs bg-white" id="sec3-followup-date" value="${followUpDate}">
                      </div>
                      <div id="sec3-doc-group" class="${followUpDate ? '' : 'hidden'}">
                        <label class="block font-bold text-slate-600 mb-1">Follow-up With *</label>
                        <select class="w-full p-2 border border-slate-200 rounded-lg text-xs bg-white" id="sec3-followup-doc">
                          <option value="">-- Select Doctor --</option>
                          <option value="Dr. Priya Nair" ${followUpDoctor==='Dr. Priya Nair'?'selected':''}>Dr. Priya Nair (Cardiology)</option>
                          <option value="Dr. Ramesh Kumar" ${followUpDoctor==='Dr. Ramesh Kumar'?'selected':''}>Dr. Ramesh Kumar (Medicine)</option>
                          <option value="Dr. Srinivasan" ${followUpDoctor==='Dr. Srinivasan'?'selected':''}>Dr. Srinivasan (Surgery)</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label class="block font-bold text-slate-600 mb-1">Diet Advice *</label>
                      <select class="w-full p-2 border border-slate-200 rounded-lg text-xs bg-white" id="sec3-diet">
                        <option value="Normal diet" ${dietAdvice==='Normal diet'?'selected':''}>Normal diet</option>
                        <option value="Soft diet" ${dietAdvice==='Soft diet'?'selected':''}>Soft diet</option>
                        <option value="Liquid diet" ${dietAdvice==='Liquid diet'?'selected':''}>Liquid diet</option>
                        <option value="Diabetic diet" ${dietAdvice==='Diabetic diet'?'selected':''}>Diabetic diet</option>
                        <option value="Low-sodium diet" ${dietAdvice==='Low-sodium diet'?'selected':''}>Low-sodium diet</option>
                        <option value="Low-fat diet" ${dietAdvice==='Low-fat diet'?'selected':''}>Low-fat diet</option>
                        <option value="High-protein diet" ${dietAdvice==='High-protein diet'?'selected':''}>High-protein diet</option>
                        <option value="Custom" ${dietAdvice==='Custom'?'selected':''}>Custom (Provide text instruction)</option>
                      </select>
                      ${dietAdvice === 'Custom' ? `
                        <input type="text" class="w-full p-2 border border-slate-200 rounded-lg text-xs mt-2" id="sec3-diet-custom" placeholder="Enter custom diet instructions..." value="${dietCustom}">
                      ` : ''}
                    </div>

                    <!-- Medications list -->
                    <div>
                      <label class="block font-bold text-slate-700 mb-0.5">Medications on Discharge *</label>
                      <span class="block text-[10px] text-slate-400 mb-2">Pulled from active prescriptions. Confirm or remove each item.</span>
                      
                      <div class="border border-slate-200 rounded-xl p-1.5 bg-slate-50 flex flex-col gap-2 max-h-[220px] overflow-y-auto">
                        ${meds.map((m, idx) => `
                          <div class="bg-white border border-slate-100 rounded-lg p-2.5 flex justify-between items-center text-[11px] hover:shadow-sm transition-all">
                            <div>
                              <strong class="text-slate-800 block">${m.name}</strong>
                              <span class="text-[10px] text-slate-500 font-semibold">${m.dose} &bull; ${m.route} &bull; ${m.freq} &bull; ${m.dur}</span>
                            </div>
                            <button type="button" class="text-red-500 hover:text-red-700 font-bold p-1 text-sm cursor-pointer" onclick="window.removeDischargeMed(${idx})">✕</button>
                          </div>
                        `).join('')}

                        ${meds.length === 0 ? `
                          <div class="p-4 text-center text-slate-400 font-semibold italic text-xs">
                            ⚠️ No active prescriptions found. Add discharge medications manually.
                          </div>
                        ` : ''}
                      </div>

                      <!-- Add Med Form -->
                      ${showAddMedForm ? `
                        <div class="border border-blue-100 rounded-xl p-4 bg-blue-50/30 mt-3 flex flex-col gap-3">
                          <div class="font-bold text-blue-700">Add Medication Manually</div>
                          <div class="grid grid-cols-2 gap-3">
                            <div class="relative">
                              <label class="block text-[10px] font-bold text-slate-600 mb-0.5">Drug Name *</label>
                              <input type="text" class="w-full p-1.5 border border-slate-200 rounded text-xs" id="new-med-name" placeholder="e.g. Tab. Paracetamol 650" value="${newMedName}" autocomplete="off">
                              ${renderMedicationTypeaheadDropdown(newMedName)}
                            </div>
                            <div>
                              <label class="block text-[10px] font-bold text-slate-600 mb-0.5">Dose *</label>
                              <input type="text" class="w-full p-1.5 border border-slate-200 rounded text-xs" id="new-med-dose" placeholder="e.g. 650mg" value="${newMedDose}">
                            </div>
                          </div>
                          <div class="grid grid-cols-3 gap-3">
                            <div>
                              <label class="block text-[10px] font-bold text-slate-600 mb-0.5">Route</label>
                              <input type="text" class="w-full p-1.5 border border-slate-200 rounded text-xs" id="new-med-route" value="${newMedRoute}">
                            </div>
                            <div>
                              <label class="block text-[10px] font-bold text-slate-600 mb-0.5">Frequency</label>
                              <input type="text" class="w-full p-1.5 border border-slate-200 rounded text-xs" id="new-med-freq" value="${newMedFreq}">
                            </div>
                            <div>
                              <label class="block text-[10px] font-bold text-slate-600 mb-0.5">Duration</label>
                              <input type="text" class="w-full p-1.5 border border-slate-200 rounded text-xs" id="new-med-dur" value="${newMedDur}">
                            </div>
                          </div>
                          <div class="flex justify-end gap-2 mt-2">
                            <button type="button" class="py-1 px-3 border border-slate-300 rounded text-[10px] font-bold text-slate-600 bg-white hover:bg-slate-50 cursor-pointer" onclick="window.toggleAddMedForm(false)">Cancel</button>
                            <button type="button" class="py-1 px-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-[10px] font-bold cursor-pointer" onclick="window.saveManualMed()">Save Medication</button>
                          </div>
                        </div>
                      ` : `
                        <button type="button" class="text-blue-600 hover:text-blue-800 font-bold text-xs mt-2.5 cursor-pointer" onclick="window.toggleAddMedForm(true)">
                          ➕ Add medication manually
                        </button>
                      `}
                    </div>
                  </div>

                  <hr class="border-slate-100 my-1">

                  <!-- SECTION 4 — VERIFICATION -->
                  <div>
                    <span class="block font-extrabold text-slate-800 tracking-wider mb-2 text-[10px] uppercase">SECTION 4 — VERIFICATION</span>
                    
                    <div class="bg-red-50/70 border border-red-100 rounded-xl p-4 flex flex-col gap-2">
                      <div class="font-bold text-red-955 text-xs">Doctor e-Signature Verification</div>
                      <p class="text-[10px] text-slate-600 font-medium">
                        Enter your 4-digit clinical PIN to sign and issue this discharge order. This action is permanently recorded.
                      </p>

                      <!-- 4-digit code input field -->
                      <div class="flex flex-col gap-2 my-2 items-center">
                        <input type="password" 
                               id="signature-pin-input" 
                               maxlength="4" 
                               placeholder="••••" 
                               value="${enteredPin}"
                               style="letter-spacing: 0.5rem; text-align: center; font-size: 1.25rem; font-weight: 700; width: 140px; padding: 8px 12px; border: 2px solid #ef4444; border-radius: 8px; outline: none; background-color: white; color: #1e293b;"
                               oninput="window.updateEnteredPin(this.value)">
                      </div>

                      ${pinErrorMsg ? `<div class="text-center font-extrabold text-[10px] text-red-600 animate-shake mt-1">${pinErrorMsg}</div>` : ''}
                    </div>
                  </div>

                </div>

                <!-- Footer panel inside scroll flow -->
                <div class="bg-white border border-slate-200 shadow-sm rounded-2xl p-6 flex justify-between items-center mb-8">
                  <span class="text-[9px] text-slate-400 font-semibold tracking-wider uppercase">NABH Admission-Discharge Standard v4</span>
                  <div class="flex gap-3">
                    <button class="py-2 px-5 border border-slate-300 rounded-lg text-xs font-bold text-slate-600 bg-white hover:bg-slate-100 cursor-pointer" onclick="window.triggerCloseOrCancel()">Cancel</button>
                    <button class="py-2.5 px-6 rounded-lg text-xs font-extrabold shadow transition-all text-white ${isFormValid() ? 'bg-slate-900 hover:bg-slate-800 cursor-pointer' : 'bg-slate-300 text-slate-500 cursor-not-allowed'}" ${isFormValid() ? '' : 'disabled'} id="btn-finalize-order" onclick="window.submitDischargeOrderForm()">
                      Sign & Save Order ✍️
                    </button>
                  </div>
                </div>

              </div>
            </div>

          </div>
        `;

        // Bind input event listeners
        attachFormListeners();
      }

      function getConditionalSectionHTML() {
        if (type === 'Regular') return '';

        if (type === 'LAMA') {
          return `
            <div class="bg-amber-50 border border-amber-100 rounded-xl p-4 flex flex-col gap-3 animate-scale-in text-left">
              <div class="font-bold text-amber-800 text-xs flex items-center gap-1">⚠️ LAMA — Leave Against Medical Advice</div>
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-[10px] font-bold text-slate-600 mb-0.5">Risks explained to patient / attender? *</label>
                  <select class="w-full p-1.5 border rounded bg-white text-xs" id="cond-lama-risks">
                    <option value="Yes" ${lamaRisksExplained==='Yes'?'selected':''}>Yes</option>
                    <option value="No" ${lamaRisksExplained==='No'?'selected':''}>No</option>
                  </select>
                </div>
                <div>
                  <label class="block text-[10px] font-bold text-slate-600 mb-0.5">Patient / attender refusal reason *</label>
                  <input type="text" class="w-full p-1.5 border rounded text-xs bg-white" id="cond-lama-reason" placeholder="e.g. Financial/Alternate options" value="${lamaReason}">
                </div>
              </div>
              <div class="grid grid-cols-3 gap-3">
                <div>
                  <label class="block text-[10px] font-bold text-slate-600 mb-0.5">Attender Name *</label>
                  <input type="text" class="w-full p-1.5 border rounded text-xs bg-white" id="cond-lama-attender" placeholder="Relative name" value="${lamaAttender}">
                </div>
                <div>
                  <label class="block text-[10px] font-bold text-slate-600 mb-0.5">Relation *</label>
                  <input type="text" class="w-full p-1.5 border rounded text-xs bg-white" id="cond-lama-relation" placeholder="e.g. Spouse/Son" value="${lamaRelation}">
                </div>
                <div>
                  <label class="block text-[10px] font-bold text-slate-600 mb-0.5">Attender Mobile *</label>
                  <input type="text" class="w-full p-1.5 border rounded text-xs bg-white" id="cond-lama-mobile" placeholder="10-digit number" maxlength="10" value="${lamaMobile}">
                </div>
              </div>
              <label class="flex items-start gap-2 text-[10px] text-slate-600 font-bold cursor-pointer mt-1 select-none">
                <input type="checkbox" id="cond-lama-sig" class="mt-0.5" ${lamaSigObtained?'checked':''}>
                <span>I confirm the patient/attender has been informed of risks and has signed the LAMA form. *</span>
              </label>
            </div>
          `;
        }

        if (type === 'Referred') {
          return `
            <div class="bg-blue-50 border border-blue-100 rounded-xl p-4 flex flex-col gap-3 animate-scale-in text-left">
              <div class="font-bold text-blue-800 text-xs flex items-center gap-1">🔁 Referral Details</div>
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-[10px] font-bold text-slate-600 mb-0.5">Receiving Hospital Name *</label>
                  <input type="text" class="w-full p-1.5 border rounded text-xs bg-white" id="cond-ref-hospital" placeholder="Target hospital" value="${refHospital}">
                </div>
                <div>
                  <label class="block text-[10px] font-bold text-slate-600 mb-0.5">Receiving Doctor / Department</label>
                  <input type="text" class="w-full p-1.5 border rounded text-xs bg-white" id="cond-ref-doctor" placeholder="e.g. cardiology ward" value="${refDoctor}">
                </div>
              </div>
              <div>
                <label class="block text-[10px] font-bold text-slate-600 mb-0.5">Reason for Referral *</label>
                <input type="text" class="w-full p-1.5 border rounded text-xs bg-white" id="cond-ref-reason" placeholder="Clinical justification" value="${refReason}">
              </div>
              <div>
                <label class="block text-[10px] font-bold text-slate-600 mb-0.5">Referral Summary *</label>
                <textarea class="w-full p-1.5 border rounded text-xs bg-white" id="cond-ref-summary" rows="2" placeholder="Summary notes...">${refSummary || dischargeSummary}</textarea>
              </div>
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-[10px] font-bold text-slate-600 mb-0.5">Ambulance Required?</label>
                  <select class="w-full p-1.5 border rounded bg-white text-xs" id="cond-ref-ambulance">
                    <option value="Yes" ${refAmbulance==='Yes'?'selected':''}>Yes</option>
                    <option value="No" ${refAmbulance==='No'?'selected':''}>No</option>
                  </select>
                </div>
                ${refAmbulance === 'Yes' ? `
                  <div>
                    <label class="block text-[10px] font-bold text-slate-600 mb-0.5">Ambulance Type *</label>
                    <select class="w-full p-1.5 border rounded bg-white text-xs" id="cond-ref-ambulance-type">
                      <option value="Hospital" ${refAmbulanceType==='Hospital'?'selected':''}>Hospital Unit</option>
                      <option value="108" ${refAmbulanceType==='108'?'selected':''}>Government 108</option>
                      <option value="Private" ${refAmbulanceType==='Private'?'selected':''}>Private BLS/ALS</option>
                    </select>
                  </div>
                ` : `
                  <div>
                    <label class="block text-[10px] font-bold text-slate-600 mb-0.5">Receiving Hospital Contact</label>
                    <input type="text" class="w-full p-1.5 border rounded text-xs bg-white" id="cond-ref-contact" placeholder="Phone or email" value="${refContact}">
                  </div>
                `}
              </div>
            </div>
          `;
        }

        if (type === 'Death') {
          var isMlc = pat.flags && pat.flags.includes('MLC');
          return `
            <div class="bg-red-50 border border-red-100 rounded-xl p-4 flex flex-col gap-3 animate-scale-in text-left">
              <div class="font-bold text-red-800 text-xs flex items-center gap-1">⚫ Death Record</div>
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-[10px] font-bold text-slate-600 mb-0.5">Date of Death *</label>
                  <input type="date" class="w-full p-1.5 border rounded text-xs bg-white" id="cond-death-date" value="${deathDate}">
                </div>
                <div>
                  <label class="block text-[10px] font-bold text-slate-600 mb-0.5">Time of Death *</label>
                  <input type="time" class="w-full p-1.5 border rounded text-xs bg-white" id="cond-death-time" value="${deathTime}">
                </div>
              </div>
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-[10px] font-bold text-slate-600 mb-0.5">Primary Cause of Death *</label>
                  <input type="text" class="w-full p-1.5 border rounded text-xs bg-white" id="cond-death-cause-p" placeholder="e.g. Cardio-respiratory arrest" value="${deathCausePrimary}">
                </div>
                <div>
                  <label class="block text-[10px] font-bold text-slate-600 mb-0.5">Secondary Cause of Death</label>
                  <input type="text" class="w-full p-1.5 border rounded text-xs bg-white" id="cond-death-cause-s" placeholder="e.g. Multi-organ failure" value="${deathCauseSecondary}">
                </div>
              </div>
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-[10px] font-bold text-slate-600 mb-0.5">Place of Death</label>
                  <select class="w-full p-1.5 border rounded bg-white text-xs" id="cond-death-place">
                    <option value="Ward" ${deathPlace==='Ward'?'selected':''}>Ward Space</option>
                    <option value="ICU" ${deathPlace==='ICU'?'selected':''}>ICU Suite</option>
                    <option value="Emergency" ${deathPlace==='Emergency'?'selected':''}>Emergency ER</option>
                    <option value="OT" ${deathPlace==='OT'?'selected':''}>Operation Theatre</option>
                    <option value="En route" ${deathPlace==='En route'?'selected':''}>En route/Ambulance</option>
                  </select>
                </div>
                <div>
                  <label class="block text-[10px] font-bold text-slate-600 mb-0.5">Post-Mortem Required?</label>
                  <select class="w-full p-1.5 border rounded bg-white text-xs" id="cond-death-post">
                    <option value="No" ${deathPostMortem==='No'?'selected':''}>No</option>
                    <option value="Yes" ${deathPostMortem==='Yes'?'selected':''}>Yes</option>
                    <option value="Awaited" ${deathPostMortem==='Awaited'?'selected':''}>Awaited</option>
                  </select>
                </div>
              </div>
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-[10px] font-bold text-slate-600 mb-0.5">Body Handed Over To *</label>
                  <input type="text" class="w-full p-1.5 border rounded text-xs bg-white" id="cond-death-handover-name" placeholder="Attender name" value="${deathHandoverName}">
                </div>
                <div>
                  <label class="block text-[10px] font-bold text-slate-600 mb-0.5">Relation to Deceased *</label>
                  <input type="text" class="w-full p-1.5 border rounded text-xs bg-white" id="cond-death-handover-rel" placeholder="e.g. Spouse/Brother" value="${deathHandoverRelation}">
                </div>
              </div>

              ${isMlc ? `
                <div class="bg-red-50/70 border-l-4 border-red-500 rounded-r-xl p-3 flex flex-col gap-2 mt-2">
                  <div class="font-bold text-red-900 text-[10px] uppercase">🚨 Medico-Legal Case Police Intimation Block</div>
                  <div class="grid grid-cols-2 gap-3">
                    <div>
                      <label class="block text-[9px] font-bold text-slate-600 mb-0.5">Police Station *</label>
                      <input type="text" class="w-full p-1 border rounded text-[10px] bg-white" id="death-mlc-station" placeholder="HAL station" value="${deathMlcStation}">
                    </div>
                    <div>
                      <label class="block text-[9px] font-bold text-slate-600 mb-0.5">Informed Date + Time *</label>
                      <input type="datetime-local" class="w-full p-1 border rounded text-[10px] bg-white" id="death-mlc-informed" value="${deathMlcInformedTime}">
                    </div>
                  </div>
                  <div class="grid grid-cols-2 gap-3">
                    <div>
                      <label class="block text-[9px] font-bold text-slate-600 mb-0.5">Constable Name / Badge</label>
                      <input type="text" class="w-full p-1 border rounded text-[10px] bg-white" id="death-mlc-constable" placeholder="Badge number" value="${deathMlcConstable}">
                    </div>
                    <div>
                      <label class="block text-[9px] font-bold text-slate-600 mb-0.5">Police NOC Received? *</label>
                      <select class="w-full p-1 border rounded bg-white text-[10px] font-bold" id="death-mlc-ack">
                        <option value="No" ${deathMlcAck==='No'?'selected':''}>No (Discharge blocked)</option>
                        <option value="Yes" ${deathMlcAck==='Yes'?'selected':''}>Yes (Clear to sign)</option>
                      </select>
                    </div>
                  </div>
                </div>
              ` : ''}
            </div>
          `;
        }

        if (type === 'Absconded') {
          return `
            <div class="bg-amber-50 border border-amber-100 rounded-xl p-4 flex flex-col gap-3 animate-scale-in text-left">
              <div class="font-bold text-amber-800 text-xs flex items-center gap-1">⚠️ Absconded Record</div>
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-[10px] font-bold text-slate-600 mb-0.5">Time Patient Last Seen *</label>
                  <input type="datetime-local" class="w-full p-1.5 border rounded text-xs bg-white" id="cond-abs-seen" value="${absLastSeen}">
                </div>
                <div>
                  <label class="block text-[10px] font-bold text-slate-600 mb-0.5">Last Seen By Staff *</label>
                  <input type="text" class="w-full p-1.5 border rounded text-xs bg-white" id="cond-abs-seen-by" placeholder="Nurse name" value="${absLastSeenBy}">
                </div>
              </div>
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-[10px] font-bold text-slate-600 mb-0.5">Security Desk Notified?</label>
                  <select class="w-full p-1.5 border rounded bg-white text-xs" id="cond-abs-security">
                    <option value="Yes" ${absSecurity==='Yes'?'selected':''}>Yes</option>
                    <option value="No" ${absSecurity==='No'?'selected':''}>No</option>
                  </select>
                </div>
                <div>
                  <label class="block text-[10px] font-bold text-slate-600 mb-0.5">Police Informed?</label>
                  <select class="w-full p-1.5 border rounded bg-white text-xs" id="cond-abs-police">
                    <option value="Yes" ${absPolice==='Yes'?'selected':''}>Yes</option>
                    <option value="No" ${absPolice==='No'?'selected':''}>No</option>
                  </select>
                </div>
              </div>
              ${absPolice === 'Yes' ? `
                <div class="grid grid-cols-2 gap-3 animate-scale-in">
                  <div>
                    <label class="block text-[9px] font-bold text-slate-600 mb-0.5">Police Station Name *</label>
                    <input type="text" class="w-full p-1 border rounded text-[10px] bg-white" id="cond-abs-station" placeholder="HAL Station" value="${absPoliceStation}">
                  </div>
                  <div>
                    <label class="block text-[9px] font-bold text-slate-600 mb-0.5">Police Informed At *</label>
                    <input type="datetime-local" class="w-full p-1 border rounded text-[10px] bg-white" id="cond-abs-police-time" value="${absPoliceInformedTime}">
                  </div>
                </div>
              ` : ''}
              <div>
                <label class="block text-[10px] font-bold text-slate-600 mb-0.5">Absconding Incident Notes</label>
                <textarea class="w-full p-1.5 border rounded text-xs bg-white" id="cond-abs-notes" rows="2" placeholder="Describe context...">${absNotes}</textarea>
              </div>
            </div>
          `;
        }
        return '';
      }

      function renderTypeaheadDropdown(id, queryVal) {
        if (activeTypeaheadId !== id) return '';

        var matches = ICD_10_LIST;
        if (queryVal) {
          matches = ICD_10_LIST.filter(item => 
            item.code.toLowerCase().includes(queryVal.toLowerCase()) || 
            item.desc.toLowerCase().includes(queryVal.toLowerCase())
          );
        }

        if (matches.length === 0) return '';

        return `
          <div class="absolute left-0 right-0 bg-white border border-slate-200 rounded-lg shadow-lg mt-1 z-30 max-h-[160px] overflow-y-auto">
            ${matches.map(item => `
              <button type="button" class="w-full text-left p-2 hover:bg-slate-50 border-b border-slate-100 text-xs cursor-pointer select-none font-medium flex justify-between" onclick="window.selectDiagnosisCode('${id}', '${item.desc} (${item.code})')">
                <span class="text-slate-800">${item.desc}</span>
                <strong class="text-slate-400 font-bold">${item.code}</strong>
              </button>
            `).join('')}
          </div>
        `;
      }

      function renderMedicationTypeaheadDropdown(queryVal) {
        if (activeTypeaheadId !== 'medicine') return '';

        var matches = MEDICINE_LIST;
        if (window.dischargeShowAlternativesFor === "Tab Febrex Plus") {
          matches = MEDICINE_LIST.filter(item => 
            ["Tab Sinarest", "Tab Cheston Cold", "Tab Colgin Plus"].includes(item.name)
          );
        } else if (queryVal) {
          matches = MEDICINE_LIST.filter(item => 
            item.name.toLowerCase().includes(queryVal.toLowerCase()) || 
            item.generic.toLowerCase().includes(queryVal.toLowerCase())
          );
        }

        if (matches.length === 0) return '';

        return `
          <div class="absolute left-0 right-0 bg-white border border-slate-200 rounded-lg shadow-lg mt-1 z-30 max-h-[140px] overflow-y-auto">
            ${window.dischargeShowAlternativesFor ? `
              <div class="p-1.5 bg-sky-50 text-sky-800 text-[10px] font-bold border-b border-slate-100 flex justify-between items-center">
                <span>Alternatives for ${window.dischargeShowAlternativesFor}:</span>
                <button type="button" class="text-sky-600 hover:text-sky-800" onclick="window.dischargeShowAlternativesFor = null; drawForm();">✕</button>
              </div>
            ` : ''}
            ${matches.map(item => {
              const isOOS = item.stock === 0;
              if (isOOS) {
                return `
                  <div class="w-full text-left p-2 border-b border-slate-100 text-xs font-medium flex justify-between items-center bg-slate-50 opacity-95">
                    <div class="flex flex-col text-left">
                      <span class="text-slate-500 font-semibold">${item.name}</span>
                      <span class="text-[10px] text-slate-400 font-medium">${item.generic}</span>
                    </div>
                    <div class="text-right flex flex-col items-end gap-1">
                      <span class="text-red-500 font-bold text-[9px]">Out of Stock</span>
                      <button type="button" class="px-2 py-0.5 bg-sky-100 hover:bg-sky-200 text-sky-700 rounded text-[9px] font-bold cursor-pointer" onclick="event.stopPropagation(); window.overlayShowAlternativesFor('${item.name.replace(/'/g, "\\'")}')">See Alternative</button>
                    </div>
                  </div>
                `;
              }
              return `
                <button type="button" class="w-full text-left p-2 hover:bg-slate-50 border-b border-slate-100 text-xs cursor-pointer select-none font-medium flex justify-between" onclick="window.selectMedicine('${item.name.replace(/'/g, "\\'")}', '${item.dose}', '${item.route}', '${item.freq}', '${item.dur}')">
                  <div class="flex flex-col text-left">
                    <span class="text-slate-800 font-semibold">${item.name}</span>
                    <span class="text-[10px] text-slate-400 font-medium">${item.generic}</span>
                  </div>
                  <div class="text-right text-[10px] text-slate-500 font-semibold self-center">
                    ${item.dose} &bull; ${item.route}
                  </div>
                </button>
              `;
            }).join('')}
          </div>
        `;
      }

      window.overlayShowAlternativesFor = function(medName) {
        window.dischargeShowAlternativesFor = medName;
        drawForm();
      };

      window.selectMedicine = function (name, dose, route, freq, dur) {
        newMedName = name;
        newMedDose = dose;
        newMedRoute = route;
        newMedFreq = freq;
        newMedDur = dur;
        activeTypeaheadId = null;
        window.dischargeShowAlternativesFor = null;
        drawForm();
      };

      function isFormValid() {
        if (pinLocked) return false;
        if (enteredPin.length < 4) return false;

        // Diagnostic validation (must not be blank)
        if (!primaryDiag) return false;

        // Discharge summary length
        if (!dischargeSummary || dischargeSummary.length < 30) return false;

        // Follow-up Doctor conditional requirement
        if (followUpDate && !followUpDoctor) return false;

        // LAMA clearances validation
        if (type === 'LAMA') {
          if (!lamaReason || !lamaAttender || !lamaRelation || !lamaMobile || !lamaSigObtained) return false;
        }

        // Referred validation
        if (type === 'Referred') {
          if (!refHospital || !refReason) return false;
        }

        // Death checks
        if (type === 'Death') {
          if (!deathDate || !deathTime || !deathCausePrimary || !deathHandoverName || !deathHandoverRelation) return false;
          var isMlc = pat.flags && pat.flags.includes('MLC');
          if (isMlc && (!deathMlcStation || !deathMlcInformedTime || deathMlcAck !== 'Yes')) return false;
        }

        // Absconded checks
        if (type === 'Absconded') {
          if (!absLastSeen || !absLastSeenBy) return false;
          if (absPolice === 'Yes' && (!absPoliceStation || !absPoliceInformedTime)) return false;
        }

        return true;
      }

      function attachFormListeners() {
        // Section 1
        var tSel = document.getElementById('sec1-type');
        if (tSel) {
          tSel.addEventListener('change', function () {
            type = tSel.value;
            if (type === 'Death') {
              cond = 'Deceased';
            } else if (type === 'Referred') {
              cond = 'Referred';
            } else {
              cond = 'Improved';
            }
            drawForm();
          });
        }

        var cSel = document.getElementById('sec1-cond');
        if (cSel) {
          cSel.addEventListener('change', function () {
            cond = cSel.value;
          });
        }

        // Section 2 Primary Search Typeahead
        var pInput = document.getElementById('sec2-primary-diag');
        if (pInput) {
          pInput.addEventListener('focus', function () {
            activeTypeaheadId = 'primary';
            drawForm();
          });
          pInput.addEventListener('input', function () {
            primaryDiag = pInput.value;
            activeTypeaheadId = 'primary';
            drawForm();
          });
        }

        // Secondary search inputs
        document.querySelectorAll('.sec2-secondary-input').forEach(input => {
          input.addEventListener('focus', function () {
            activeTypeaheadId = Number(input.getAttribute('data-index'));
            drawForm();
          });
          input.addEventListener('input', function () {
            var idx = Number(input.getAttribute('data-index'));
            secondaryDiags[idx] = input.value;
            activeTypeaheadId = idx;
            drawForm();
          });
        });

        // Clicks outside to hide autocomplete typeahead lists
        document.addEventListener('click', function(e) {
          if (activeTypeaheadId !== null && !e.target.closest('#doctor-discharge-panel')) {
            activeTypeaheadId = null;
            drawForm();
          }
        }, { once: true });

        // Discharge summary course
        var sumText = document.getElementById('sec2-summary');
        if (sumText) {
          sumText.addEventListener('input', function () {
            dischargeSummary = sumText.value;
            // Sync with referral summary if not edited
            if (type === 'Referred' && !refSummaryEdited) {
              refSummary = dischargeSummary;
              var rSum = document.getElementById('cond-ref-summary');
              if (rSum) rSum.value = refSummary;
            }
          });
        }

        // Restrictions
        var rest = document.getElementById('sec2-restrictions');
        if (rest) {
          rest.addEventListener('input', function () {
            activityRestrictions = rest.value;
          });
        }

        // Section 3
        var fDate = document.getElementById('sec3-followup-date');
        if (fDate) {
          fDate.addEventListener('change', function () {
            followUpDate = fDate.value;
            drawForm();
          });
        }

        var fDoc = document.getElementById('sec3-followup-doc');
        if (fDoc) {
          fDoc.addEventListener('change', function () {
            followUpDoctor = fDoc.value;
            drawForm();
          });
        }

        var dAdv = document.getElementById('sec3-diet');
        if (dAdv) {
          dAdv.addEventListener('change', function () {
            dietAdvice = dAdv.value;
            drawForm();
          });
        }

        var dCustom = document.getElementById('sec3-diet-custom');
        if (dCustom) {
          dCustom.addEventListener('input', function () {
            dietCustom = dCustom.value;
          });
        }

        // Conditional elements listeners
        if (type === 'LAMA') {
          var lamaRisks = document.getElementById('cond-lama-risks');
          if (lamaRisks) lamaRisks.addEventListener('change', () => { lamaRisksExplained = lamaRisks.value; drawForm(); });

          var lamaReas = document.getElementById('cond-lama-reason');
          if (lamaReas) lamaReas.addEventListener('input', () => { lamaReason = lamaReas.value; });

          var lamaAtt = document.getElementById('cond-lama-attender');
          if (lamaAtt) lamaAtt.addEventListener('input', () => { lamaAttender = lamaAtt.value; });

          var lamaRel = document.getElementById('cond-lama-relation');
          if (lamaRel) lamaRel.addEventListener('input', () => { lamaRelation = lamaRel.value; });

          var lamaMob = document.getElementById('cond-lama-mobile');
          if (lamaMob) lamaMob.addEventListener('input', () => { lamaMobile = lamaMob.value; });

          var lamaSig = document.getElementById('cond-lama-sig');
          if (lamaSig) lamaSig.addEventListener('change', () => { lamaSigObtained = lamaSig.checked; drawForm(); });
        }

        if (type === 'Referred') {
          var refHosp = document.getElementById('cond-ref-hospital');
          if (refHosp) refHosp.addEventListener('input', () => { refHospital = refHosp.value; });

          var refDocInput = document.getElementById('cond-ref-doctor');
          if (refDocInput) refDocInput.addEventListener('input', () => { refDoctor = refDocInput.value; });

          var refReas = document.getElementById('cond-ref-reason');
          if (refReas) refReas.addEventListener('input', () => { refReason = refReas.value; });

          var refSumInput = document.getElementById('cond-ref-summary');
          if (refSumInput) refSumInput.addEventListener('input', () => { refSummary = refSumInput.value; refSummaryEdited = true; });

          var refAmb = document.getElementById('cond-ref-ambulance');
          if (refAmb) refAmb.addEventListener('change', () => { refAmbulance = refAmb.value; drawForm(); });

          var refAmbType = document.getElementById('cond-ref-ambulance-type');
          if (refAmbType) refAmbType.addEventListener('change', () => { refAmbulanceType = refAmbType.value; });

          var refCt = document.getElementById('cond-ref-contact');
          if (refCt) refCt.addEventListener('input', () => { refContact = refCt.value; });
        }

        if (type === 'Death') {
          var dDate = document.getElementById('cond-death-date');
          if (dDate) dDate.addEventListener('change', () => { deathDate = dDate.value; });

          var dTime = document.getElementById('cond-death-time');
          if (dTime) dTime.addEventListener('change', () => { deathTime = dTime.value; });

          var dP = document.getElementById('cond-death-cause-p');
          if (dP) dP.addEventListener('input', () => { deathCausePrimary = dP.value; });

          var dS = document.getElementById('cond-death-cause-s');
          if (dS) dS.addEventListener('input', () => { deathCauseSecondary = dS.value; });

          var dPl = document.getElementById('cond-death-place');
          if (dPl) dPl.addEventListener('change', () => { deathPlace = dPl.value; });

          var dPost = document.getElementById('cond-death-post');
          if (dPost) dPost.addEventListener('change', () => { deathPostMortem = dPost.value; });

          var dName = document.getElementById('cond-death-handover-name');
          if (dName) dName.addEventListener('input', () => { deathHandoverName = dName.value; });

          var dRel = document.getElementById('cond-death-handover-rel');
          if (dRel) dRel.addEventListener('input', () => { deathHandoverRelation = dRel.value; });

          // MLC police inputs
          var mSt = document.getElementById('death-mlc-station');
          if (mSt) mSt.addEventListener('input', () => { deathMlcStation = mSt.value; });

          var mTime = document.getElementById('death-mlc-informed');
          if (mTime) mTime.addEventListener('change', () => { deathMlcInformedTime = mTime.value; });

          var mCon = document.getElementById('death-mlc-constable');
          if (mCon) mCon.addEventListener('input', () => { deathMlcConstable = mCon.value; });

          var mAck = document.getElementById('death-mlc-ack');
          if (mAck) mAck.addEventListener('change', () => { deathMlcAck = mAck.value; drawForm(); });
        }

        if (type === 'Absconded') {
          var aSeen = document.getElementById('cond-abs-seen');
          if (aSeen) aSeen.addEventListener('change', () => { absLastSeen = aSeen.value; });

          var aBy = document.getElementById('cond-abs-seen-by');
          if (aBy) aBy.addEventListener('input', () => { absLastSeenBy = aBy.value; });

          var aSec = document.getElementById('cond-abs-security');
          if (aSec) aSec.addEventListener('change', () => { absSecurity = aSec.value; });

          var aPol = document.getElementById('cond-abs-police');
          if (aPol) aPol.addEventListener('change', () => { absPolice = aPol.value; drawForm(); });

          var aSt = document.getElementById('cond-abs-station');
          if (aSt) aSt.addEventListener('input', () => { absPoliceStation = aSt.value; });

          var aTime = document.getElementById('cond-abs-police-time');
          if (aTime) aTime.addEventListener('change', () => { absPoliceInformedTime = aTime.value; });

          var aNts = document.getElementById('cond-abs-notes');
          if (aNts) aNts.addEventListener('input', () => { absNotes = aNts.value; });
        }

        // New medication search and field inputs listeners
        var nMedName = document.getElementById('new-med-name');
        if (nMedName) {
          nMedName.addEventListener('focus', function () {
            activeTypeaheadId = 'medicine';
            drawForm();
          });
          nMedName.addEventListener('input', function () {
            newMedName = nMedName.value;
            activeTypeaheadId = 'medicine';
            window.dischargeShowAlternativesFor = null;
            drawForm();
          });
        }
        var nMedDose = document.getElementById('new-med-dose');
        if (nMedDose) nMedDose.addEventListener('input', () => { newMedDose = nMedDose.value; });
        var nMedRoute = document.getElementById('new-med-route');
        if (nMedRoute) nMedRoute.addEventListener('input', () => { newMedRoute = nMedRoute.value; });
        var nMedFreq = document.getElementById('new-med-freq');
        if (nMedFreq) nMedFreq.addEventListener('input', () => { newMedFreq = nMedFreq.value; });
        var nMedDur = document.getElementById('new-med-dur');
        if (nMedDur) nMedDur.addEventListener('input', () => { newMedDur = nMedDur.value; });
      }

      // Diagnose Autocomplete Selection Handler
      window.selectDiagnosisCode = function (id, fullStr) {
        if (id === 'primary') {
          primaryDiag = fullStr;
        } else {
          secondaryDiags[Number(id)] = fullStr;
        }
        activeTypeaheadId = null;
        drawForm();
      };

      window.addSecondaryDiag = function () {
        secondaryDiags.push('');
        activeTypeaheadId = secondaryDiags.length - 1;
        drawForm();
      };

      window.removeSecondaryDiag = function (idx) {
        secondaryDiags.splice(idx, 1);
        activeTypeaheadId = null;
        drawForm();
      };

      window.removeDischargeMed = function (idx) {
        meds.splice(idx, 1);
        drawForm();
      };

      window.toggleAddMedForm = function (show) {
        showAddMedForm = show;
        drawForm();
      };

      window.saveManualMed = function () {
        var mName = document.getElementById('new-med-name')?.value?.trim();
        var mDose = document.getElementById('new-med-dose')?.value?.trim();
        var mRoute = document.getElementById('new-med-route')?.value || 'Oral';
        var mFreq = document.getElementById('new-med-freq')?.value || '1-0-1';
        var mDur = document.getElementById('new-med-dur')?.value || '5 Days';

        if (!mName || !mDose) {
          alert('Error: Medication name and dosage are required.');
          return;
        }

        meds.push({ name: mName, dose: mDose, route: mRoute, freq: mFreq, dur: mDur });
        showAddMedForm = false;
        // reset manual inputs
        newMedName = '';
        newMedDose = '';
        drawForm();
      };

       // PIN PAD ACTIONS
      window.updateEnteredPin = function (val) {
        if (pinLocked) return;
        enteredPin = val.replace(/\D/g, '').substring(0, 4);
        pinErrorMsg = '';
        drawForm();

        // Auto focus back on input and place cursor at the end
        setTimeout(function() {
          const input = document.getElementById('signature-pin-input');
          if (input) {
            input.focus();
            const len = input.value.length;
            input.setSelectionRange(len, len);
          }
        }, 10);
      };

      // CANCEL / DISCARD HANDLERS
      window.triggerCloseOrCancel = function () {
        showCancelWarning = true;
        drawForm();
      };

      window.cancelDiscardDischarge = function () {
        showCancelWarning = false;
        drawForm();
      };

      window.executeDiscardDischarge = function () {
        closeDischargeOverlay();
      };

      // SIGN & SAVE SUBMISSION
      window.submitDischargeOrderForm = function () {
        // Active doctor credentials check
        const activeDocId = localStorage.getItem('saronil_active_doctor_id') || 'DOC_AMIT';
        const list = window.state.staffList || [];
        const matchedDoc = list.find(s => s.id === activeDocId);
        if (matchedDoc) {
          if (matchedDoc.credentialStatus === 'Expired' || matchedDoc.status === 'Suspended') {
            alert(`🚫 Sign-off Blocked: Your council registration status is currently Expired or Suspended. Please contact the Credentialing Officer.`);
            return;
          }
        }

        if (!isFormValid()) return;

        // Verify PIN Code
        if (enteredPin !== '1234') {
          pinAttempts--;
          enteredPin = '';
          if (pinAttempts <= 0) {
            pinLocked = true;
            pinErrorMsg = '🚫 e-Signature PIN locked. Administrator unlock required.';
          } else {
            pinErrorMsg = `Incorrect PIN. ${pinAttempts} attempts remaining.`;
          }
          drawForm();
          return;
        }

        // Success PIN check -> Build and submit discharge order record
        pat.dischargeOrder = {
          type: type,
          condition: cond,
          finalDiagnosis: primaryDiag,
          secondaryDiagnoses: secondaryDiags,
          summary: dischargeSummary,
          activityRestrictions: activityRestrictions,
          followUpDate: followUpDate,
          followUpDoctor: followUpDoctor,
          diet: dietAdvice === 'Custom' ? dietCustom : dietAdvice,
          medications: meds,
          timestamp: new Date().toISOString(),
          doctorPIN: enteredPin,
          // conditional parameters
          lamaRisksExplained, lamaReason, lamaAttender, lamaRelation, lamaMobile,
          refHospital, refDoctor, refReason, refSummary: refSummary || dischargeSummary, refAmbulance, refAmbulanceType, refContact,
          deathDate, deathTime, deathCausePrimary, deathCauseSecondary, deathPlace, deathPostMortem, deathHandoverName, deathHandoverRelation,
          deathMlcStation, deathMlcInformedTime, deathMlcConstable, deathMlcAck,
          absLastSeen, absLastSeenBy, absSecurity, absPolice, absPoliceStation, absPoliceInformedTime, absNotes
        };

        pat.dischargeStatus = 'In Progress — Clearances Pending';

        // Initialize clearances checklist based on payer type & EMR flags
        pat.dischargeClearances = {
          nursing: { cleared: false, clearedBy: null, clearedAt: null, notes: '' },
          billing: { cleared: false, clearedBy: null, clearedAt: null, outstanding: 2500, receipt: '', notes: '' },
          pharmacy: { cleared: false, clearedBy: null, clearedAt: null, notes: '' }
        };

        // Cashless / TPA clearance activation
        var isTpa = pat.payerType === 'TPA' || pat.insuranceProvider || (pat.flags && pat.flags.includes('TPA'));
        if (isTpa) {
          pat.dischargeClearances.tpa = { cleared: false, clearedBy: null, clearedAt: null, refNo: '', notes: '' };
        }
        
        // Lab clearance check
        if (pat.pendingLabResults || (pat.flags && pat.flags.includes('Lab'))) {
          pat.dischargeClearances.lab = { cleared: false, clearedBy: null, clearedAt: null, notes: '' };
        }

        // Radiology clearance check
        var hasRad = pat.pendingRadResults || (pat.flags && pat.flags.includes('Radiology')) || (pat.flags && pat.flags.includes('Imaging'));
        if (hasRad) {
          pat.dischargeClearances.radiology = { cleared: false, clearedBy: null, clearedAt: null, notes: '' };
        }

        // OT / Procedure clearance check
        var hasOt = pat.pendingOtResults || (pat.flags && pat.flags.includes('OT')) || (pat.flags && pat.flags.includes('Procedure'));
        if (hasOt) {
          pat.dischargeClearances.ot = { cleared: false, clearedBy: null, clearedAt: null, notes: '' };
        }

        // Add timeline event
        pat.timelineEvents = pat.timelineEvents || [];
        pat.timelineEvents.unshift({
          date: new Date().toLocaleDateString('en-CA') + ' ' + new Date().toLocaleTimeString('en-US', {hour:'2-digit', minute:'2-digit'}),
          type: 'clinical',
          icon: '✍️',
          title: 'Discharge Order Issued',
          desc: `Discharge order issued by Dr. Priya Nair. clearance workflows initiated.`
        });

        localStorage.setItem('saronil_patients', JSON.stringify(window.state.patients));

        closeDischargeOverlay();

        // Trigger Success Toast banner
        var tpaNotice = isTpa ? ' + TPA clearance' : '';
        window.showToastNotification(`Discharge order issued. Clearances sent to Nursing, Billing, Pharmacy${tpaNotice}.`);

        refreshActiveSPAView();
      };

      drawForm();
    }

    // STAGE 2 — RENDER CLEARANCES CHECKLIST & OVERRIDES PANEL
    function renderClearancesChecklistPanel() {
      var currentRole = (window.state && window.state.activeUserRole) || window._ipdActiveRole || 'ATD Coordinator';

      // Check if sub form is active
      if (activeSubForm) {
        renderClearanceSubForm(activeSubForm);
        return;
      }

      var list = pat.dischargeClearances || {};
      var allClear = true;
      Object.entries(list).forEach(([k, v]) => {
        if (!v.cleared) allClear = false;
      });

      var isCoordinator = currentRole === 'ATD Coordinator' || currentRole === 'Administrator / Medical Superintendent' || currentRole === 'ATD Officer' || currentRole === 'Administrator' || currentRole === 'Super Admin' || currentRole === 'CEO';
      var isAdmin = currentRole === 'Administrator / Medical Superintendent' || currentRole === 'Administrator' || currentRole === 'Super Admin' || currentRole === 'CEO';

      container.innerHTML = `
        <div class="bg-white rounded-2xl w-[520px] max-w-[95vw] shadow-2xl overflow-hidden flex flex-col animate-scale-in">
          <!-- Header -->
          <div class="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center">
            <div>
              <h3 class="margin-0 text-slate-800 font-bold text-base">DISCHARGE IN PROGRESS</h3>
              <div class="text-[10px] text-slate-500 mt-0.5">Patient: ${pat.name} (${pat.uhid}) · Ward: ${pat.ward} Bed: ${pat.bed}</div>
            </div>
            <button class="text-slate-400 hover:text-slate-600 text-xl font-bold cursor-pointer" onclick="window.closeDischargeOverlay()">✕</button>
          </div>

          <!-- Body -->
          <div class="p-6 overflow-y-auto flex-1 flex flex-col gap-4 text-left">
            <div class="bg-emerald-50 border border-emerald-100 rounded-xl p-3 text-xs text-emerald-800 flex justify-between items-center">
              <span>✓ Discharge Order Issued by <strong>${pat.dischargeOrder?.followUpDoctor || 'Consultant'}</strong></span>
              <span class="text-[10px] text-slate-400">${new Date(pat.dischargeOrder?.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
            </div>

            <div class="text-xs font-bold text-slate-800 border-b border-slate-100 pb-1.5 mt-2">DEPARTMENTAL CLEARANCES</div>

            <!-- Clearances Checklist rows -->
            <div class="flex flex-col gap-3">
              ${Object.entries(list).map(([deptKey, clrObj]) => {
                var deptLabelMap = { nursing: '🩺 Nursing', billing: '💳 Billing & Finance', pharmacy: '💊 Pharmacy', tpa: '🏥 TPA / Insurance', lab: '🧪 Laboratory', radiology: '📡 Radiology & Imaging', ot: '🔬 OT / Procedure' };
                var deptLabel = deptLabelMap[deptKey] || deptKey.toUpperCase();
                var actionBtn = '';

                // Gating permissions
                var canClear = false;
                if (deptKey === 'nursing' && (currentRole === 'Ward Nurse' || currentRole === 'Nursing Supervisor' || currentRole === 'Nurse')) canClear = true;
                if (deptKey === 'billing' && (currentRole === 'Billing Executive' || currentRole === 'Billing Counter Executive' || currentRole === 'Billing' || currentRole === 'CFO' || currentRole === 'Finance Manager' || currentRole === 'Billing Officer' || currentRole === 'CASHIER' || currentRole === 'BILLING_EXECUTIVE' || currentRole === 'BILLING_SUPERVISOR' || currentRole === 'ACCOUNTS_MANAGER')) canClear = true;
                if (deptKey === 'pharmacy' && (currentRole === 'Pharmacist' || currentRole === 'Nursing Supervisor' || currentRole === 'Pharmacy')) canClear = true;
                if (deptKey === 'tpa' && (currentRole === 'TPA / Insurance Coordinator' || currentRole === 'Billing Counter Executive' || currentRole === 'Billing' || currentRole === 'TPA' || currentRole === 'TPA Officer' || currentRole === 'Billing Counter Exec' || currentRole === 'BILLING_EXECUTIVE' || currentRole === 'BILLING_SUPERVISOR')) canClear = true;
                if (deptKey === 'lab' && (currentRole === 'Lab Supervisor' || currentRole === 'Nursing Supervisor' || currentRole === 'Lab' || currentRole === 'Lab Staff' || currentRole === 'Pathologist' || currentRole === 'Lab Technician' || currentRole === 'Lab Manager')) canClear = true;
                if (deptKey === 'radiology' && (currentRole === 'Radiologist' || currentRole === 'Radiology Supervisor' || currentRole === 'Radiology Technician' || currentRole === 'Radiology' || currentRole === 'Imaging Technician')) canClear = true;
                if (deptKey === 'ot' && (currentRole === 'OT Supervisor' || currentRole === 'Surgeon' || currentRole === 'Treating Consultant / Doctor' || currentRole === 'OT Staff' || currentRole === 'OT In-Charge' || currentRole === 'Anaesthesiologist')) canClear = true;
                
                // Admin override permission (also declared at outer scope for footer buttons)
                var isAdminLocal = currentRole === 'Administrator / Medical Superintendent' || currentRole === 'Administrator' || currentRole === 'Super Admin' || currentRole === 'CEO';

                if (clrObj.cleared) {
                  actionBtn = `
                    <div class="flex flex-col items-end">
                      <span class="text-emerald-600 font-bold text-xs">✓ Cleared</span>
                      <span class="text-[9px] text-slate-400">By ${clrObj.clearedBy}</span>
                    </div>
                  `;
                } else if (canClear) {
                  actionBtn = `
                    <button class="py-1.5 px-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs cursor-pointer transition-colors shadow-sm" onclick="window.triggerClearanceSubForm('${deptKey}')">
                      Clear Department
                    </button>
                  `;
                } else if (isAdminLocal) {
                  actionBtn = `
                    <button class="py-1 px-2.5 border border-red-300 text-red-600 hover:bg-red-50 font-bold rounded text-[10px] cursor-pointer" onclick="window.triggerAdminOverrideClearance('${deptKey}')">
                      Force Override ⚙️
                    </button>
                  `;
                } else {
                  actionBtn = `<span class="text-slate-400 italic text-[11px]">Pending clearance</span>`;
                }

                return `
                  <div class="flex justify-between items-center bg-slate-50 border border-slate-100 rounded-xl p-3">
                    <span class="font-bold text-slate-700 text-xs tracking-wide">${deptLabel}</span>
                    <div>${actionBtn}</div>
                  </div>
                `;
              }).join('')}
            </div>

          </div>

          <!-- Footer Buttons -->
          <div class="bg-slate-50 px-6 py-4 border-t border-slate-200 flex justify-end items-center">
            <button class="py-2.5 px-6 border border-slate-300 rounded-lg text-xs font-bold text-slate-600 bg-white hover:bg-slate-100 cursor-pointer" onclick="window.closeDischargeOverlay()">Close</button>
          </div>
        </div>
      `;
    }

    // STAGE 2 SUB-FORMS RENDERING
    function renderClearanceSubForm(deptKey) {
      container.innerHTML = `
        <div class="bg-white rounded-2xl w-[480px] max-w-[95vw] shadow-2xl overflow-hidden flex flex-col animate-scale-in">
          <div class="bg-slate-50 border-b border-slate-200 px-6 py-4 flex justify-between items-center">
            <h3 class="margin-0 text-slate-800 font-bold text-sm tracking-wide">CONFIRM ${deptKey.toUpperCase()} CLEARANCE</h3>
            <button class="text-slate-400 hover:text-slate-600 text-xl font-bold cursor-pointer" onclick="window.cancelClearanceSubForm()">✕</button>
          </div>
          
          <div class="p-6 overflow-y-auto flex-1 text-left" id="clearance-subform-body">
            ${getClearanceSubFormHTML(deptKey)}
          </div>
        </div>
      `;

      // Attach sub-form submit handlers
      var subformBtn = document.getElementById('btn-confirm-clearance');
      if (subformBtn) {
        subformBtn.addEventListener('click', function () {
          executeClearanceConfirmation(deptKey);
        });
      }
    }

    function getClearanceSubFormHTML(deptKey) {
      if (deptKey === 'nursing') {
        return `
          <p class="text-xs text-slate-500 mb-4">Complete all clinical checks to authorize nursing release order.</p>
          <div class="flex flex-col gap-3 text-xs text-slate-700">
            <label class="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" id="chk-nurse-edu">
              <span>Patient education and meds summary given</span>
            </label>
            <label class="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" id="chk-nurse-belongings">
              <span>Patient valuables and belongings returned</span>
            </label>
            <label class="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" id="chk-nurse-iv">
              <span>All IV Cannulas and lines removed</span>
            </label>
            <label class="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" id="chk-nurse-notes">
              <span>Nursing chart notes signed off complete</span>
            </label>
            
            <div class="mt-2">
              <label class="block font-bold text-slate-600 mb-1">Handover Comments</label>
              <textarea class="w-full p-2 border rounded" id="nurse-notes" rows="2" placeholder="e.g. Wound dressing completed..."></textarea>
            </div>
            
            <button class="py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs mt-4 cursor-pointer" id="btn-confirm-clearance">
              Confirm Nursing Clearance
            </button>
          </div>
        `;
      } else if (deptKey === 'billing') {
        var outstandingAmt = pat.billing?.balance || 2500;
        return `
          <p class="text-xs text-slate-500 mb-3">Reconcile final bills before discharge release approval.</p>
          <div class="flex flex-col gap-3 text-xs text-slate-700">
            <div class="bg-amber-50 border border-amber-100 rounded-lg p-3 flex justify-between items-center text-amber-800 mb-2">
              <span>Outstanding Amount:</span>
              <span class="font-extrabold text-sm">${fmtMoney(outstandingAmt)}</span>
            </div>

            <label class="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" id="chk-bill-final">
              <span>Final Bill has been generated</span>
            </label>
            
            <div>
              <label class="block font-bold text-slate-600 mb-1">Settlement Status</label>
              <select class="w-full p-2 border rounded" id="bill-settlement">
                <option value="Fully Paid">Fully Paid</option>
                <option value="Deposit Forfeited">Deposit Forfeited / Adjusted</option>
                <option value="TPA Approved">TPA Approved — Awaiting Corporate Settlement</option>
                <option value="Written Off">Written Off (Supervisor authorized)</option>
              </select>
            </div>

            <div>
              <label class="block font-bold text-slate-600 mb-1">Settlement Receipt Number</label>
              <input type="text" class="w-full p-2 border rounded" id="bill-receipt" placeholder="e.g. REC-50209">
            </div>

            <button class="py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs mt-4 cursor-pointer" id="btn-confirm-clearance">
              Confirm Billing Clearance
            </button>
          </div>
        `;
      } else if (deptKey === 'pharmacy') {
        return `
          <p class="text-xs text-slate-500 mb-4">Verify pharmacy discharge medication package checklist.</p>
          <div class="flex flex-col gap-3 text-xs text-slate-700">
            <label class="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" id="chk-pharma-dispensed">
              <span>Medications dispensed as per consultant summary</span>
            </label>
            <label class="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" id="chk-pharma-returns">
              <span>All unused ward returns credited to final bill</span>
            </label>

            <button class="py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs mt-4 cursor-pointer" id="btn-confirm-clearance">
              Confirm Pharmacy Clearance
            </button>
          </div>
        `;
      } else if (deptKey === 'tpa') {
        return `
          <p class="text-xs text-slate-500 mb-4">Validate insurance pre-authorization claims packet.</p>
          <div class="flex flex-col gap-3 text-xs text-slate-700">
            <label class="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" id="chk-tpa-preauth">
              <span>Pre-auth closed with target insurance desk</span>
            </label>
            <label class="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" id="chk-tpa-received">
              <span>Final approval amount letter received from TPA</span>
            </label>
            <label class="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" id="chk-tpa-docs">
              <span>NABH checklist claim documents signed</span>
            </label>

            <div>
              <label class="block font-bold text-slate-600 mb-1">TPA Approval Reference Number</label>
              <input type="text" class="w-full p-2 border rounded" id="tpa-ref" placeholder="Reference ID">
            </div>

            <button class="py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs mt-4 cursor-pointer" id="btn-confirm-clearance">
              Confirm TPA Clearance
            </button>
          </div>
        `;
      } else if (deptKey === 'lab') {
        return `
          <p class="text-xs text-slate-500 mb-4">Confirm all diagnostic lab reports and results release status.</p>
          <div class="flex flex-col gap-3 text-xs text-slate-700">
            <label class="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" id="chk-lab-released">
              <span>All pending lab reports released to EMR portal</span>
            </label>
            <label class="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" id="chk-lab-summary">
              <span>Abnormal findings noted in discharge order</span>
            </label>

            <button class="py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs mt-4 cursor-pointer" id="btn-confirm-clearance">
              Confirm Lab Clearance
            </button>
          </div>
        `;
      } else if (deptKey === 'radiology') {
        return `
          <p class="text-xs text-slate-500 mb-4">Confirm all pending radiology imaging reports have been released and findings documented.</p>
          <div class="flex flex-col gap-3 text-xs text-slate-700">
            <label class="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" id="chk-rad-reports">
              <span>All imaging reports (X-Ray, CT, MRI, USG) released to EMR</span>
            </label>
            <label class="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" id="chk-rad-critical">
              <span>Critical radiology findings communicated to treating physician</span>
            </label>
            <label class="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" id="chk-rad-cd">
              <span>CD/digital copy handed to patient or attender (if applicable)</span>
            </label>

            <div class="mt-2">
              <label class="block font-bold text-slate-600 mb-1">Radiologist Clearance Notes</label>
              <textarea class="w-full p-2 border rounded" id="rad-notes" rows="2" placeholder="e.g. All reports finalised..."></textarea>
            </div>

            <button class="py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs mt-4 cursor-pointer" id="btn-confirm-clearance">
              Confirm Radiology Clearance
            </button>
          </div>
        `;
      } else if (deptKey === 'ot') {
        return `
          <p class="text-xs text-slate-500 mb-4">Confirm all OT / procedure-related sign-offs and implant records are complete.</p>
          <div class="flex flex-col gap-3 text-xs text-slate-700">
            <label class="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" id="chk-ot-notes">
              <span>Operation notes / procedure report finalised and uploaded</span>
            </label>
            <label class="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" id="chk-ot-implants">
              <span>Implant log / sticker records filed in patient chart</span>
            </label>
            <label class="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" id="chk-ot-specimen">
              <span>Histopathology specimen dispatched (if applicable)</span>
            </label>

            <div class="mt-2">
              <label class="block font-bold text-slate-600 mb-1">OT Clearance Notes</label>
              <textarea class="w-full p-2 border rounded" id="ot-notes" rows="2" placeholder="e.g. Wound inspection done, staples removed..."></textarea>
            </div>

            <button class="py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs mt-4 cursor-pointer" id="btn-confirm-clearance">
              Confirm OT / Procedure Clearance
            </button>
          </div>
        `;
      }
      return '';
    }

    function executeClearanceConfirmation(deptKey) {
      var currentRole = (window.state && window.state.activeUserRole) || window._ipdActiveRole || 'ATD Coordinator';

      // Check fields
      if (deptKey === 'nursing') {
        var edu = document.getElementById('chk-nurse-edu')?.checked;
        var bel = document.getElementById('chk-nurse-belongings')?.checked;
        var iv = document.getElementById('chk-nurse-iv')?.checked;
        var nts = document.getElementById('chk-nurse-notes')?.checked;
        if (!edu || !bel || !iv || !nts) {
          alert('Error: All check items must be verified Yes to clear Nursing.');
          return;
        }
      } else if (deptKey === 'billing') {
        var fbill = document.getElementById('chk-bill-final')?.checked;
        var settlement = document.getElementById('bill-settlement')?.value;
        var receipt = document.getElementById('bill-receipt')?.value?.trim();

        if (!fbill) {
          alert('Error: Final Bill verification checkbox is required.');
          return;
        }
        if (settlement === 'Fully Paid' && !receipt) {
          alert('Error: Receipt number is required for fully paid settlements.');
          return;
        }
      } else if (deptKey === 'pharmacy') {
        var disp = document.getElementById('chk-pharma-dispensed')?.checked;
        var ret = document.getElementById('chk-pharma-returns')?.checked;
        if (!disp || !ret) {
          alert('Error: Verify all pharmacy checks to submit.');
          return;
        }
      } else if (deptKey === 'tpa') {
        var pre = document.getElementById('chk-tpa-preauth')?.checked;
        var rec = document.getElementById('chk-tpa-received')?.checked;
        var docs = document.getElementById('chk-tpa-docs')?.checked;
        var ref = document.getElementById('tpa-ref')?.value?.trim();

        if (!pre || !rec || !docs) {
          alert('Error: Complete TPA checklist check boxes.');
          return;
        }
        if (!ref) {
          alert('Error: TPA Reference Number is required.');
          return;
        }
      } else if (deptKey === 'lab') {
        var rel = document.getElementById('chk-lab-released')?.checked;
        var sum = document.getElementById('chk-lab-summary')?.checked;
        if (!rel || !sum) {
          alert('Error: Lab diagnostics checklist must be completed.');
          return;
        }
      } else if (deptKey === 'radiology') {
        var radRep = document.getElementById('chk-rad-reports')?.checked;
        var radCrit = document.getElementById('chk-rad-critical')?.checked;
        if (!radRep || !radCrit) {
          alert('Error: Radiology report release and critical findings communication checkboxes must be verified.');
          return;
        }
        var radNotesVal = document.getElementById('rad-notes')?.value?.trim() || '';
        pat.dischargeClearances[deptKey].notes = radNotesVal;
      } else if (deptKey === 'ot') {
        var otNotes = document.getElementById('chk-ot-notes')?.checked;
        var otImpl = document.getElementById('chk-ot-implants')?.checked;
        if (!otNotes || !otImpl) {
          alert('Error: OT notes and implant log verification are mandatory.');
          return;
        }
        var otNotesVal = document.getElementById('ot-notes')?.value?.trim() || '';
        pat.dischargeClearances[deptKey].notes = otNotesVal;
      }

      // Mark cleared
      pat.dischargeClearances[deptKey].cleared = true;
      pat.dischargeClearances[deptKey].clearedBy = currentRole;
      pat.dischargeClearances[deptKey].clearedAt = new Date().toISOString();

      localStorage.setItem('saronil_patients', JSON.stringify(window.state.patients));

      activeSubForm = '';
      renderDischargeContent();
    }

    // ADMIN OVERRIDE HANDLER
    window.triggerAdminOverrideClearance = async function (deptKey) {
      var reason = await customPrompt(`Enter Administrator reason to override ${deptKey.toUpperCase()} clearance checklist:`);
      if (reason) {
        pat.dischargeClearances[deptKey].cleared = true;
        pat.dischargeClearances[deptKey].clearedBy = 'Admin Override: ' + window._ipdActiveRole;
        pat.dischargeClearances[deptKey].clearedAt = new Date().toISOString();
        pat.dischargeClearances[deptKey].notes = reason;

        localStorage.setItem('saronil_patients', JSON.stringify(window.state.patients));
        renderDischargeContent();
      }
    };

    window.triggerClearanceSubForm = function (deptKey) {
      activeSubForm = deptKey;
      renderDischargeContent();
    };

    window.cancelClearanceSubForm = function () {
      activeSubForm = '';
      renderDischargeContent();
    };

    // STAGE 3 — FINAL DISCHARGE COMPLETION (ATD Coordinator / Admin)
    window.triggerFinalizeDischarge = function () {
      var summary = pat.dischargeOrder || {};

      container.innerHTML = `
        <div class="bg-white rounded-2xl w-[480px] max-w-[95vw] shadow-2xl overflow-hidden flex flex-col animate-scale-in text-left">
          <div class="bg-slate-900 text-white px-6 py-4 font-bold text-base flex justify-between items-center">
            <span>🏁 Confirm Final Inpatient Discharge</span>
            <button class="text-white hover:text-slate-200 text-xl font-bold cursor-pointer" onclick="window.cancelFinalizeDischarge()">✕</button>
          </div>
          
          <div class="p-6 flex flex-col gap-4 text-xs text-slate-700">
            <p class="font-bold text-red-600">All department clearances verified. This action is irreversible.</p>

            <div class="bg-slate-50 border border-slate-100 rounded-xl p-4 flex flex-col gap-2">
              <div>Patient: <strong>${pat.name}</strong> (${pat.uhid})</div>
              <div>Ward: <strong>${pat.ward}</strong> · Bed: <strong>${pat.bed}</strong></div>
              <div>Discharge Mode: <strong>${summary.type || 'Regular'}</strong></div>
              <div>Final Diagnosis: <strong>${summary.finalDiagnosis}</strong></div>
            </div>
          </div>

          <div class="bg-slate-50 px-6 py-3 border-t border-slate-200 flex justify-end gap-3">
            <button class="py-2 px-5 border border-slate-300 rounded-lg text-xs font-bold text-slate-600 bg-white hover:bg-slate-100" onclick="window.cancelFinalizeDischarge()">Cancel</button>
            <button class="py-2 px-5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold cursor-pointer" onclick="window.executeFinalizeDischarge()">Complete Discharge</button>
          </div>
        </div>
      `;
    };

    window.cancelFinalizeDischarge = function () {
      renderDischargeContent();
    };

    window.executeFinalizeDischarge = function () {
      // 1. Vacate bed (Under cleaning/housekeeping) or release Daycare bed
      var currentBedId = pat.bed;
      var isDaycare = false;
      if (window.state.daycareAdmissions) {
        var dcAdm = window.state.daycareAdmissions.find(a => a.patient && a.patient.uhid === pat.uhid && a.status !== 'Cleared & Discharged');
        if (dcAdm) {
          isDaycare = true;
          currentBedId = dcAdm.bedId;
          dcAdm.status = 'Cleared & Discharged';
          dcAdm.billingInfo = {
            paymentMode: 'UPI',
            receiptNo: `REC-${Math.floor(100000 + Math.random() * 900000)}`,
            dischargeTimestamp: new Date().toISOString(),
            totalStayMinutes: 120
          };
          dcAdm.historyLogs.push({ timestamp: new Date().toISOString(), action: `Payment verified via Universal Workflow. Bed released.` });
          localStorage.setItem('saronil_daycare_admissions', JSON.stringify(window.state.daycareAdmissions));
        }
      }

      if (currentBedId && window.state.bedsStatus[currentBedId]) {
        var prevStatus = window.state.bedsStatus[currentBedId].status;
        if (isDaycare) {
          window.state.bedsStatus[currentBedId] = {
            wardKey: 'DAYCARE',
            status: 'Available',
            patientUhid: null,
            notes: ''
          };
          window.state.logBedMovement({
            patientId: pat.uhid,
            bedId: currentBedId,
            wardKey: 'DAYCARE',
            prevStatus: prevStatus,
            newStatus: 'Available',
            action: 'Discharge',
            user: window._ipdActiveRole || 'ATD Coordinator',
            role: window._ipdActiveRole || 'ATD Coordinator',
            remarks: `Daycare bed vacated post discharge of ${pat.name}`
          });
        } else {
          var wardKey = window.state.bedsStatus[currentBedId].wardKey || 'GENERAL-WARD-M';
          window.state.bedsStatus[currentBedId].status = 'Cleaning';
          window.state.bedsStatus[currentBedId].patientUhid = null;
          window.state.bedsStatus[currentBedId].notes = `Sanitizing bed space after discharge of ${pat.name}`;
          window.state.triggerHousekeepingRequest(currentBedId, wardKey, `Sanitizing bed space after discharge of ${pat.name}`);
          window.state.logBedMovement({
            patientId: pat.uhid,
            bedId: currentBedId,
            wardKey: wardKey,
            prevStatus: prevStatus,
            newStatus: 'Cleaning',
            action: 'Discharge',
            user: window._ipdActiveRole || 'ATD Coordinator',
            role: window._ipdActiveRole || 'ATD Coordinator',
            remarks: `Bed released post discharge of ${pat.name}. Triggered discharge cleaning.`
          });
        }
      }

      // 2. Mark patient discharged
      pat.status = 'Discharged';
      pat.dischargeStatus = 'Completed';
      pat.dischargeDate = new Date().toLocaleDateString('en-CA') + ' ' + new Date().toLocaleTimeString('en-US', {hour:'2-digit', minute:'2-digit'});
      pat.bed = '';

      // Update corresponding admission in window.state.admissions
      if (window.state.admissions) {
        var activeAdm = window.state.admissions.find(a => a.uhid === pat.uhid && a.status === 'Active');
        if (activeAdm) {
          activeAdm.status = 'Discharged';
          activeAdm.dischargeDate = pat.dischargeDate;
          activeAdm.bed = '';
        }
        localStorage.setItem('saronil_admissions', JSON.stringify(window.state.admissions));
      }

      // 3. EMR timeline event logs
      pat.timelineEvents = pat.timelineEvents || [];
      pat.timelineEvents.unshift({
        date: pat.dischargeDate,
        type: 'clinical',
        icon: '🏁',
        title: 'Patient Discharged',
        desc: `${isDaycare ? 'Daycare' : 'Inpatient'} episode successfully closed on ${pat.dischargeDate}. Bed ${currentBedId || 'N/A'} released.`,
        hasDischargeSummary: true
      });

      // 4. Auto-book follow-up appointment if doctor and date provided
      if (pat.dischargeOrder?.followUpDate && pat.dischargeOrder?.followUpDoctor) {
        window.state.appointments = window.state.appointments || [];
        var apptExists = window.state.appointments.some(a =>
          a.patientId === pat.uhid && a.date === pat.dischargeOrder.followUpDate && a.doctorName === pat.dischargeOrder.followUpDoctor
        );
        if (!apptExists) {
          var apptSeq = window.state.appointments.length + 1;
          window.state.appointments.push({
            id: 'APT-DC-' + String(apptSeq).padStart(4, '0'),
            patientId: pat.uhid,
            patientName: pat.name,
            doctorName: pat.dischargeOrder.followUpDoctor,
            date: pat.dischargeOrder.followUpDate,
            time: '10:00 AM',
            type: 'Follow-up',
            status: 'Scheduled',
            notes: 'Post-discharge follow-up booked automatically on discharge'
          });
          localStorage.setItem('saronil_appointments', JSON.stringify(window.state.appointments));
        }
      }

      // 5. SMS Simulation Toast
      var fupMsg = pat.dischargeOrder?.followUpDate ? ` Follow-up scheduled on ${pat.dischargeOrder.followUpDate}.` : '';
      var smsText = `SMS Sent: [Saronil IHS]: ${isDaycare ? 'Daycare' : 'Inpatient'} discharge complete for ${pat.name}.${fupMsg}`;

      localStorage.setItem('saronil_patients', JSON.stringify(window.state.patients));
      localStorage.setItem('saronil_bedsStatus', JSON.stringify(window.state.bedsStatus));

      closeDischargeOverlay();
      
      // Notify Toast & Refresh EMR/Bed Board portal
      window.showToastNotification('Patient Discharged successfully.');
      setTimeout(function () {
        alert(smsText);
      }, 500);

      refreshActiveSPAView();
    };

    // Helper functions for prototype testing
    window.switchRoleAndRerenderDischarge = function (role) {
      window._ipdActiveRole = role;
      renderDischargeContent();
    };

    window.closeDischargeOverlay = function () {
      var wrapper = document.getElementById(overlayId);
      if (wrapper) wrapper.remove();
      refreshActiveSPAView();
    };

    // CANCEL DISCHARGE ORDER — resets clearances and status
    window.triggerCancelDischargeOrder = async function () {
      var reason = await customConfirm('Are you sure you want to cancel the discharge order for ' + pat.name + '? All clearances will be reset.');
      if (!reason) return;
      pat.dischargeStatus = 'Not Initiated';
      pat.dischargeOrder = null;
      pat.dischargeClearances = null;
      pat.timelineEvents = pat.timelineEvents || [];
      pat.timelineEvents.unshift({
        date: new Date().toLocaleDateString('en-CA') + ' ' + new Date().toLocaleTimeString('en-US', {hour:'2-digit', minute:'2-digit'}),
        type: 'admin',
        icon: '✕',
        title: 'Discharge Order Cancelled',
        desc: 'Discharge process cancelled by ' + ((window.state && window.state.activeUserRole) || window._ipdActiveRole || 'Staff') + '. Patient remains admitted.'
      });
      localStorage.setItem('saronil_patients', JSON.stringify(window.state.patients));
      var wrapper = document.getElementById(overlayId);
      if (wrapper) wrapper.remove();
      window.showToastNotification && window.showToastNotification('Discharge cancelled. Patient remains admitted.');
      refreshActiveSPAView();
    };

    // Start rendering
    renderDischargeContent();
  };


  // ==========================================================================
  // WORKFLOW B: PATIENT TRANSFER / RELOCATION OVERLAY
  // ==========================================================================

  window.showUniversalTransferWorkflow = function (patientUhid, bedId) {
    var pat = window.state.patients.find(p => p.uhid === patientUhid);
    if (!pat) {
      alert("Error: Patient record not found.");
      return;
    }

    var fromBed = bedId || pat.bed;

    // Create container overlay
    var overlayId = 'universal-transfer-overlay';
    var container = document.getElementById(overlayId);
    if (!container) {
      container = document.createElement('div');
      container.id = overlayId;
      container.className = 'fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4 animate-fade-in';
      document.body.appendChild(container);
    }

    // Active sub-step local variables
    var activeRequestIndex = (window.state.transferRequests || []).findIndex(r => r.uhid === patientUhid && (r.status.includes('Pending') || r.status.includes('Approved')));

    function renderTransferContent() {
      var currentRole = window._ipdActiveRole || 'ATD Coordinator';

      // CASE 1: Patient has an active transfer request already raised
      if (activeRequestIndex !== -1) {
        var req = window.state.transferRequests[activeRequestIndex];

        // 1.1 Approval Mode (Pending Nursing Supervisor)
        if (req.status === 'Pending Nursing Supervisor Approval') {
          var isSupervisor = currentRole === 'Nursing Supervisor' || currentRole === 'Administrator / Medical Superintendent';

          if (isSupervisor) {
            renderApprovalPanel(req);
          } else {
            renderReadOnlyRequestPanel(req, "Awaiting Nursing Supervisor approval.");
          }
        } 
        // 1.2 Execution Mode (Approved - Pending Coordinator Execution)
        else if (req.status === 'Approved - Pending ATD Execution' || req.status === 'Approved — Pending Execution') {
          var isCoordinator = currentRole === 'ATD Coordinator' || currentRole === 'Administrator / Medical Superintendent';

          if (isCoordinator) {
            renderExecutionPanel(req);
          } else {
            renderReadOnlyRequestPanel(req, "Request Approved. Awaiting ATD bed allocation.");
          }
        }
        return;
      }

      // CASE 2: No active request. Load Stage 1 Request Intake form
      renderTransferRequestForm();
    }

    // STAGE 1 — TRANSFER REQUEST INTAKE FORM
    function renderTransferRequestForm() {
      var type = 'Internal';
      var reason = 'Clinical deterioration';
      var notes = '';
      var urgency = 'Routine';
      
      // Target ward selection parameters
      var targetWard = pat.gender === 'Female' ? 'GENERAL-WARD-F' : 'GENERAL-WARD-M';
      var rooms = getRoomsForWard(targetWard);
      var targetRoom = rooms[0] || 'Room 401';
      var targetBed = getBedsForRoom(targetWard, targetRoom).find(b => (window.state.bedsStatus[b] || {}).status === 'Available') || '';

      // Inter-branch fields
      var targetBranch = 'Whitefield';
      var receivingDoctor = '';
      var ambulanceRequired = 'No';

      // External fields
      var extHospital = '';
      var extDept = '';

      function drawTransferForm() {
        var roomBeds = getBedsForRoom(targetWard, targetRoom);
        var availableBeds = roomBeds.filter(b => (window.state.bedsStatus[b] || {}).status === 'Available');

        container.innerHTML = `
          <div class="bg-white rounded-2xl w-[640px] max-w-[95vw] max-h-[90vh] shadow-2xl overflow-hidden flex flex-col">
            <div class="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center">
              <h3 class="margin-0 text-blue-600 font-bold text-lg flex items-center gap-2">🔄 Initiate Relocation Order</h3>
              <button class="text-slate-400 hover:text-slate-600 text-xl font-bold cursor-pointer" onclick="window.closeTransferOverlay()">✕</button>
            </div>

            <div class="p-6 overflow-y-auto flex-1 flex flex-col gap-4 text-left">
              <div class="bg-slate-50 border border-slate-100 rounded-xl p-4.5 grid grid-cols-2 gap-y-2 text-xs">
                <div>Patient: <strong class="text-slate-800">${pat.name}</strong></div>
                <div>UHID: <strong class="text-slate-800">${pat.uhid}</strong></div>
                <div>Current Location: <strong class="text-purple-600">${fromBed}</strong></div>
                <div>Condition: <strong class="text-slate-800">${pat.condition || 'Stable'}</strong></div>
              </div>

              <!-- General Transfer details -->
              <div class="grid grid-cols-3 gap-4">
                <div>
                  <label class="block text-xs font-bold text-slate-700 mb-1">Transfer Type</label>
                  <select class="w-full p-2 border rounded-lg text-xs font-semibold" id="trf-type">
                    <option value="Internal" ${type==='Internal'?'selected':''}>Internal ward-to-ward</option>
                    <option value="ICU escalation" ${type==='ICU escalation'?'selected':''}>ICU Escalation</option>
                    <option value="ICU step-down" ${type==='ICU step-down'?'selected':''}>ICU Step-down</option>
                    <option value="Inter-branch" ${type==='Inter-branch'?'selected':''}>Inter-branch Transfer</option>
                    <option value="External referral" ${type==='External referral'?'selected':''}>External referral (Out)</option>
                  </select>
                </div>
                <div>
                  <label class="block text-xs font-bold text-slate-700 mb-1">Urgency Level</label>
                  <select class="w-full p-2 border rounded-lg text-xs font-semibold" id="trf-urgency">
                    <option value="Routine" ${urgency==='Routine'?'selected':''}>🟢 Routine</option>
                    <option value="Urgent" ${urgency==='Urgent'?'selected':''}>🟡 Urgent</option>
                    <option value="Emergency" ${urgency==='Emergency'?'selected':''}>🔴 Emergency (Bypass approvals)</option>
                  </select>
                </div>
                <div>
                  <label class="block text-xs font-bold text-slate-700 mb-1">Reason for Relocation</label>
                  <select class="w-full p-2 border rounded-lg text-xs font-semibold" id="trf-reason">
                    <option value="Clinical deterioration" ${reason==='Clinical deterioration'?'selected':''}>Clinical deterioration</option>
                    <option value="Bed upgrade request" ${reason==='Bed upgrade request'?'selected':''}>Bed request by family</option>
                    <option value="ICU step-down" ${reason==='ICU step-down'?'selected':''}>Step-down from ICU</option>
                    <option value="Speciality change" ${reason==='Speciality change'?'selected':''}>Speciality change</option>
                  </select>
                </div>
              </div>

              <!-- TARGET LOCATION CARD -->
              <div id="transfer-target-card" class="border border-blue-100 rounded-xl p-4 bg-slate-50/50">
                <div class="text-blue-600 font-bold text-xs mb-3">📍 Destination Location (Transfer To)</div>
                
                ${type === 'Internal' || type === 'ICU escalation' || type === 'ICU step-down' ? `
                  <div class="grid grid-cols-2 gap-3 mb-3">
                    <div>
                      <label class="block text-[10px] font-bold text-slate-600 mb-0.5">Destination Ward *</label>
                      <select class="w-full p-2 border rounded bg-white text-xs font-semibold" id="trf-target-ward">
                        ${Object.entries(WARD_RATES).map(([k, v]) => `<option value="${k}" ${k === targetWard ? 'selected' : ''}>${v.name} - ${fmtMoney(v.rate)}/day</option>`).join('')}
                      </select>
                    </div>
                    <div>
                      <label class="block text-[10px] font-bold text-slate-600 mb-0.5">Destination Room *</label>
                      <select class="w-full p-2 border rounded bg-white text-xs font-semibold" id="trf-target-room">
                        ${getRoomsForWard(targetWard).map(r => `<option value="${r}" ${r === targetRoom ? 'selected' : ''}>${r}</option>`).join('')}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label class="block text-[10px] font-bold text-slate-600 mb-1">Assign Bed Chip *</label>
                    <div class="flex flex-wrap gap-2 mt-1">
                      ${availableBeds.map(b => {
                        var active = (b === targetBed) ? 'bg-blue-600 text-white border-blue-600 shadow-md scale-105' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50';
                        return `
                          <button type="button" class="py-1.5 px-3 border rounded-lg text-xs font-bold cursor-pointer transition-all ${active}" onclick="window.setLocalTargetBed('${b}')">
                            🛏️ ${b}
                          </button>
                        `;
                      }).join('') || '<span class="text-xs text-red-500 font-semibold">⚠️ No available beds in this room</span>'}
                    </div>
                  </div>
                ` : type === 'Inter-branch' ? `
                  <div class="grid grid-cols-2 gap-3 mb-2">
                    <div>
                      <label class="block text-[10px] font-bold text-slate-600 mb-0.5">Target Branch *</label>
                      <select class="w-full p-2 border rounded bg-white text-xs font-semibold" id="trf-target-branch">
                        <option value="Whitefield">Whitefield Branch</option>
                        <option value="Electronic City">Electronic City Branch</option>
                        <option value="Indiranagar">Indiranagar Desk</option>
                      </select>
                    </div>
                    <div>
                      <label class="block text-[10px] font-bold text-slate-600 mb-0.5">Receiving Doctor Contact</label>
                      <input type="text" class="w-full p-2 border rounded text-xs bg-white" id="trf-receiving-doctor" placeholder="e.g. Dr. Patil" value="${receivingDoctor}">
                    </div>
                  </div>
                  <div class="grid grid-cols-2 gap-3">
                    <div>
                      <label class="block text-[10px] font-bold text-slate-600 mb-0.5">Ambulance Desk required?</label>
                      <select class="w-full p-2 border rounded bg-white text-xs" id="trf-ambulance">
                        <option value="Yes">Yes (BLS Unit)</option>
                        <option value="No" selected>No</option>
                      </select>
                    </div>
                  </div>
                ` : `
                  <div class="grid grid-cols-2 gap-3">
                    <div>
                      <label class="block text-[10px] font-bold text-slate-600 mb-0.5">Referral Hospital Name *</label>
                      <input type="text" class="w-full p-2 border rounded text-xs bg-white" id="trf-ext-hospital" placeholder="e.g. NIMHANS" value="${extHospital}">
                    </div>
                    <div>
                      <label class="block text-[10px] font-bold text-slate-600 mb-0.5">Department / Contact Doctor</label>
                      <input type="text" class="w-full p-2 border rounded text-xs bg-white" id="trf-ext-dept" placeholder="Contact number" value="${extDept}">
                    </div>
                  </div>
                `}
              </div>

              <!-- Handoff notes -->
              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">Transfer Handoff Notes</label>
                <textarea class="w-full p-2 border rounded-lg text-xs" id="trf-notes" rows="2" placeholder="e.g. Transport precautions, oxygen parameters...">${notes}</textarea>
              </div>

            </div>

            <!-- Footer -->
            <div class="bg-slate-50 px-6 py-3 border-t border-slate-200 flex justify-end gap-3">
              <button class="py-2 px-5 border border-slate-300 rounded-lg text-xs font-bold text-slate-600 bg-white hover:bg-slate-100" onclick="window.closeTransferOverlay()">Cancel</button>
              <button class="py-2 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold cursor-pointer" id="btn-submit-transfer-req">Review Request ➡️</button>
            </div>
          </div>
        `;

        // Listeners for selectors
        var typeSel = document.getElementById('trf-type');
        if (typeSel) {
          typeSel.addEventListener('change', function () {
            type = typeSel.value;
            drawTransferForm();
          });
        }

        var wardSel = document.getElementById('trf-target-ward');
        if (wardSel) {
          wardSel.addEventListener('change', function () {
            targetWard = wardSel.value;
            rooms = getRoomsForWard(targetWard);
            targetRoom = rooms[0];
            targetBed = getBedsForRoom(targetWard, targetRoom).find(b => (window.state.bedsStatus[b] || {}).status === 'Available') || '';
            drawTransferForm();
          });
        }

        var roomSel = document.getElementById('trf-target-room');
        if (roomSel) {
          roomSel.addEventListener('change', function () {
            targetRoom = roomSel.value;
            targetBed = getBedsForRoom(targetWard, targetRoom).find(b => (window.state.bedsStatus[b] || {}).status === 'Available') || '';
            drawTransferForm();
          });
        }

        var submitBtn = document.getElementById('btn-submit-transfer-req');
        if (submitBtn) {
          submitBtn.addEventListener('click', executeSubmitTransferForm);
        }
      }

      window.setLocalTargetBed = function (bedVal) {
        targetBed = bedVal;
        drawTransferForm();
      };

      function executeSubmitTransferForm() {
        var notesVal = document.getElementById('trf-notes')?.value?.trim();
        var reasonVal = document.getElementById('trf-reason')?.value;
        var urgencyVal = document.getElementById('trf-urgency')?.value;

        // Validation target bed
        if ((type==='Internal' || type==='ICU escalation' || type==='ICU step-down') && !targetBed) {
          alert('Error: Please select a valid target bed chip.');
          return;
        }

        // Inter-branch reading
        if (type === 'Inter-branch') {
          targetBranch = document.getElementById('trf-target-branch')?.value;
          receivingDoctor = document.getElementById('trf-receiving-doctor')?.value?.trim();
          ambulanceRequired = document.getElementById('trf-ambulance')?.value;
        }

        // External referral reading
        if (type === 'External referral') {
          extHospital = document.getElementById('trf-ext-hospital')?.value?.trim();
          extDept = document.getElementById('trf-ext-dept')?.value?.trim();
          if (!extHospital) {
            alert('Error: Referral hospital name is required.');
            return;
          }
        }

        // Show review overlay first
        renderReviewTransferConfirmation({
          type, reason: reasonVal, notes: notesVal, urgency: urgencyVal,
          targetWard, targetRoom, targetBed,
          targetBranch, receivingDoctor, ambulanceRequired,
          extHospital, extDept
        });
      }

      drawTransferForm();
    }

    // STAGE 1.5 — RENDER TRANSFER CONFIRMATION / SUMMARY SCREEN
    function renderReviewTransferConfirmation(formObj) {
      container.innerHTML = `
        <div class="bg-white rounded-2xl w-[560px] max-w-[95vw] shadow-2xl overflow-hidden flex flex-col text-left">
          <div class="bg-slate-900 text-white px-6 py-4 font-bold text-base flex justify-between items-center">
            <span>📋 Confirm Patient Relocation Request</span>
            <button class="text-white hover:text-slate-200 text-xl font-bold cursor-pointer" onclick="window.closeTransferOverlay()">✕</button>
          </div>
          
          <div class="p-6 overflow-y-auto flex-1 flex flex-col gap-4 text-xs">
            <p class="text-slate-500">Please verify transfer parameters. Medico-legal logs will record this request.</p>

            <div class="bg-slate-50 border border-slate-100 rounded-xl p-4 grid grid-cols-2 gap-3">
              <div>Patient: <strong class="text-slate-800">${pat.name}</strong></div>
              <div>UHID: <strong class="text-slate-800">${pat.uhid}</strong></div>
              <div>Urgency: <strong class="text-red-600 font-extrabold uppercase">${formObj.urgency}</strong></div>
              <div>Reason: <strong class="text-slate-800">${formObj.reason}</strong></div>
            </div>

            <!-- COMPARATIVE READOUT -->
            <div class="flex items-center justify-between gap-4 bg-slate-50 p-4 border border-slate-200 rounded-xl text-center">
              <div class="flex-1">
                <span class="text-[9px] text-slate-400 block font-bold tracking-wider">ORIGIN LOCATION</span>
                <strong class="text-purple-600 text-sm font-extrabold">${fromBed}</strong>
                <span class="text-[9px] text-slate-500 block">${pat.ward}</span>
              </div>
              <div class="text-xl text-slate-400 font-bold">➡️</div>
              <div class="flex-1">
                <span class="text-[9px] text-slate-400 block font-bold tracking-wider">DESTINATION</span>
                ${formObj.type === 'Internal' || formObj.type === 'ICU escalation' || formObj.type === 'ICU step-down' ? `
                  <strong class="text-emerald-600 text-sm font-extrabold">${formObj.targetBed}</strong>
                  <span class="text-[9px] text-slate-500 block">${WARD_RATES[formObj.targetWard]?.name}</span>
                ` : formObj.type === 'Inter-branch' ? `
                  <strong class="text-blue-600 text-sm font-extrabold">${formObj.targetBranch} Branch</strong>
                  <span class="text-[9px] text-slate-500 block">Ambulance: ${formObj.ambulanceRequired}</span>
                ` : `
                  <strong class="text-slate-800 text-sm font-extrabold">${formObj.extHospital}</strong>
                  <span class="text-[9px] text-slate-500 block">External Referral</span>
                `}
              </div>
            </div>
          </div>

          <div class="bg-slate-50 px-6 py-3 border-t border-slate-200 flex justify-end gap-3">
            <button class="py-2 px-5 border border-slate-300 rounded-lg text-xs font-bold text-slate-600 bg-white hover:bg-slate-100" onclick="window.backToTransferFormInput()">⬅️ Back</button>
            <button class="py-2 px-5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold cursor-pointer" id="btn-confirm-reloc">Confirm & Submit Request</button>
          </div>
        </div>
      `;

      var confirmBtn = document.getElementById('btn-confirm-reloc');
      if (confirmBtn) {
        confirmBtn.addEventListener('click', function () {
          executeFinalSubmitTransfer(formObj);
        });
      }

      window.backToTransferFormInput = function () {
        renderTransferRequestForm();
      };
    }

    function executeFinalSubmitTransfer(formObj) {
      // 1. EMERGENCY BYPASS LOGIC:
      // "If urgency = Emergency: approval step auto-bypassed; ATD Coordinator can execute immediately"
      // Let's create the request directly. If urgency is emergency, set status to Approved - Pending Execution
      var reqStatus = formObj.urgency === 'Emergency' ? 'Approved - Pending ATD Execution' : 'Pending Nursing Supervisor Approval';

      window.state.transferRequests = window.state.transferRequests || [];
      var newReq = {
        id: 'TRF' + String(100 + window.state.transferRequests.length + 1),
        name: pat.name,
        uhid: pat.uhid,
        currentBed: fromBed,
        currentWard: pat.wardKey || 'GENERAL-WARD-M',
        targetWard: formObj.targetWard || 'GENERAL-WARD-M',
        targetBed: formObj.targetBed || '',
        targetRoom: formObj.targetRoom || '',
        type: formObj.type,
        reason: formObj.reason,
        urgency: formObj.urgency,
        notes: formObj.notes,
        requestedBy: window._ipdActiveRole || 'Ward Doctor',
        requestedAt: new Date().toISOString(),
        status: reqStatus,
        branch: 'Bengaluru',
        // conditional inter-branch/ext referral data
        targetBranch: formObj.targetBranch,
        receivingDoctor: formObj.receivingDoctor,
        ambulanceRequired: formObj.ambulanceRequired,
        extHospital: formObj.extHospital,
        extDept: formObj.extDept
      };

      window.state.transferRequests.push(newReq);

      // Log timeline event
      pat.timelineEvents = pat.timelineEvents || [];
      pat.timelineEvents.unshift({
        date: new Date().toLocaleDateString('en-CA') + ' ' + new Date().toLocaleTimeString('en-US', {hour:'2-digit', minute:'2-digit'}),
        type: 'clinical',
        icon: '🔄',
        title: 'Relocation Request raised',
        desc: `Transfer request TRF-${newReq.id} (${formObj.urgency}) raised for Bed ${formObj.targetBed || 'External'}`
      });

      localStorage.setItem('saronil_patients', JSON.stringify(window.state.patients));
      localStorage.setItem('saronil_transferRequests', JSON.stringify(window.state.transferRequests));

      closeTransferOverlay();

      // Toast feedback
      var toastMsg = formObj.urgency === 'Emergency' ? 'Emergency Transfer auto-approved!' : 'Transfer Request raised successfully.';
      window.showToastNotification(toastMsg);

      refreshActiveSPAView();
    }

    // STAGE 2 — RENDER TRANSFER APPROVAL CARD (Nursing Supervisor / Admin)
    function renderApprovalPanel(req) {
      container.innerHTML = `
        <div class="bg-white rounded-2xl w-[480px] max-w-[95vw] shadow-2xl overflow-hidden flex flex-col text-left">
          <div class="bg-slate-900 text-white px-6 py-4 font-bold text-sm tracking-wide flex justify-between items-center">
            <span>🔄 REVIEW PATIENT TRANSFER REQUEST</span>
            <button class="text-white hover:text-slate-200 text-xl font-bold cursor-pointer" onclick="window.closeTransferOverlay()">✕</button>
          </div>

          <div class="p-6 flex flex-col gap-4 text-xs text-slate-700">
            <div class="bg-slate-50 border rounded-xl p-4 flex flex-col gap-2">
              <div>Patient Name: <strong>${req.name}</strong></div>
              <div>UHID: <strong>${req.uhid}</strong></div>
              <div>Requested by: <strong>${req.requestedBy}</strong> at ${new Date(req.requestedAt).toLocaleTimeString()}</div>
              <div>Urgency: <span class="px-2 py-0.5 bg-red-100 text-red-800 rounded font-bold uppercase text-[9px]">${req.urgency}</span></div>
              <div>Reason: <strong>${req.reason}</strong></div>
              <div class="mt-2 pt-2 border-t border-slate-100 font-bold text-slate-500">Destination Location:</div>
              <div>Target Bed: <strong>${req.targetBed || 'External'}</strong> in <strong>${WARD_RATES[req.targetWard]?.name || req.targetWard}</strong></div>
            </div>

            <div class="bg-blue-50 border border-blue-100 rounded-xl p-3 text-[10px] text-blue-800 flex flex-col gap-1.5">
              <span class="font-bold">Supervisor Simulation Actions:</span>
              <span>Click Approve to route this request directly to the ATD coordinator dashboard for bed assignment.</span>
            </div>
          </div>

          <!-- Buttons -->
          <div class="bg-slate-50 px-6 py-3.5 border-t border-slate-200 flex justify-end gap-3">
            <button class="py-2 px-5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-xs font-bold cursor-pointer" onclick="window.rejectTransferRequest()">Reject</button>
            <button class="py-2 px-5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold cursor-pointer" onclick="window.approveTransferRequest()">Approve Relocation</button>
          </div>
        </div>
      `;

      window.approveTransferRequest = function () {
        req.status = 'Approved - Pending ATD Execution';
        
        // Log timeline event
        pat.timelineEvents = pat.timelineEvents || [];
        pat.timelineEvents.unshift({
          date: new Date().toLocaleDateString('en-CA') + ' ' + new Date().toLocaleTimeString('en-US', {hour:'2-digit', minute:'2-digit'}),
          type: 'clinical',
          icon: '✓',
          title: 'Transfer Request Approved',
          desc: `Relocation request TRF-${req.id} approved by Nursing Supervisor.`
        });

        localStorage.setItem('saronil_patients', JSON.stringify(window.state.patients));
        localStorage.setItem('saronil_transferRequests', JSON.stringify(window.state.transferRequests));

        closeTransferOverlay();
        window.showToastNotification('✓ Relocation approved successfully.');
        refreshActiveSPAView();
      };

      window.rejectTransferRequest = async function () {
        var reason = await customPrompt('Please enter reason for transfer rejection:');
        if (reason) {
          req.status = 'Rejected';
          req.rejectionReason = reason;

          pat.timelineEvents = pat.timelineEvents || [];
          pat.timelineEvents.unshift({
            date: new Date().toLocaleDateString('en-CA') + ' ' + new Date().toLocaleTimeString('en-US', {hour:'2-digit', minute:'2-digit'}),
            type: 'clinical',
            icon: '✕',
            title: 'Transfer Request Rejected',
            desc: `Relocation request TRF-${req.id} rejected. Reason: ${reason}`
          });

          // Remove or filter out request
          window.state.transferRequests = window.state.transferRequests.filter(r => r.id !== req.id);

          localStorage.setItem('saronil_patients', JSON.stringify(window.state.patients));
          localStorage.setItem('saronil_transferRequests', JSON.stringify(window.state.transferRequests));

          closeTransferOverlay();
          window.showToastNotification('Transfer Request rejected.');
          refreshActiveSPAView();
        }
      };
    }

    // STAGE 3 — RENDER TRANSFER EXECUTION SCREEN (ATD Coordinator)
    function renderExecutionPanel(req) {
      var targetBedPick = req.targetBed;
      var targetRoomPick = req.targetRoom || getRoomsForWard(req.targetWard)[0];

      function drawExecution() {
        var roomBeds = getBedsForRoom(req.targetWard, targetRoomPick);
        var availableBeds = roomBeds.filter(b => (window.state.bedsStatus[b] || {}).status === 'Available');

        container.innerHTML = `
          <div class="bg-white rounded-2xl w-[520px] max-w-[95vw] shadow-2xl overflow-hidden flex flex-col text-left">
            <div class="bg-slate-900 text-white px-6 py-4 font-bold text-sm tracking-wide flex justify-between items-center">
              <span>🔄 EXECUTE PATIENT RELOCATION ORDER</span>
              <button class="text-white hover:text-slate-200 text-xl font-bold cursor-pointer" onclick="window.closeTransferOverlay()">✕</button>
            </div>

            <div class="p-6 flex flex-col gap-4 text-xs text-slate-700">
              <div class="grid grid-cols-2 gap-4 border border-slate-100 rounded-xl p-4 bg-slate-50/50">
                <div>Patient: <strong>${req.name}</strong></div>
                <div>UHID: <strong>${req.uhid}</strong></div>
                <div>FROM Location: <strong class="text-red-600 font-bold">${req.currentBed}</strong></div>
                <div>TO Ward: <strong>${WARD_RATES[req.targetWard]?.name}</strong></div>
              </div>

              <!-- Bed assigner interface if internal -->
              ${req.type === 'Internal' || req.type === 'ICU escalation' || req.type === 'ICU step-down' ? `
                <div>
                  <div class="text-slate-800 font-bold text-xs mb-2">Assign Bed Chip:</div>
                  <div class="grid grid-cols-2 gap-3 mb-3">
                    <div>
                      <label class="block text-[10px] font-bold text-slate-500 mb-0.5">Select Room</label>
                      <select class="w-full p-2 border rounded bg-white text-xs font-semibold" id="exec-room">
                        ${getRoomsForWard(req.targetWard).map(r => `<option value="${r}" ${r === targetRoomPick ? 'selected' : ''}>${r}</option>`).join('')}
                      </select>
                    </div>
                  </div>
                  <div class="flex flex-wrap gap-2 mt-2">
                    ${availableBeds.map(b => {
                      var active = (b === targetBedPick) ? 'bg-blue-600 text-white border-blue-600 shadow-md scale-105' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50';
                      return `
                        <button type="button" class="py-1.5 px-3 border rounded-lg text-xs font-bold cursor-pointer transition-all ${active}" onclick="window.setExecutionTargetBed('${b}')">
                          🛏️ ${b}
                        </button>
                      `;
                    }).join('') || '<span class="text-xs text-red-500 font-semibold">⚠️ No available beds in this room</span>'}
                  </div>
                </div>
              ` : ''}

              <!-- Handover Parameters -->
              <div>
                <label class="block font-bold text-slate-600 mb-1">Handover to Nurse Name (Optional)</label>
                <input type="text" class="w-full p-2 border rounded" id="exec-nurse" placeholder="Search nurse name">
              </div>
            </div>

            <div class="bg-slate-50 px-6 py-3 border-t border-slate-200 flex justify-end gap-3">
              <button class="py-2 px-5 border border-slate-300 rounded-lg text-xs font-bold text-slate-600 bg-white hover:bg-slate-100" onclick="window.closeTransferOverlay()">Cancel</button>
              <button class="py-2 px-5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold cursor-pointer" id="btn-exec-confirm">Confirm Relocation Now</button>
            </div>
          </div>
        `;

        var rmSel = document.getElementById('exec-room');
        if (rmSel) {
          rmSel.addEventListener('change', function () {
            targetRoomPick = rmSel.value;
            targetBedPick = getBedsForRoom(req.targetWard, targetRoomPick).find(b => (window.state.bedsStatus[b] || {}).status === 'Available') || '';
            drawExecution();
          });
        }

        var execBtn = document.getElementById('btn-exec-confirm');
        if (execBtn) {
          execBtn.addEventListener('click', finalizeExecution);
        }
      }

      window.setExecutionTargetBed = function (bedVal) {
        targetBedPick = bedVal;
        drawExecution();
      };

      function finalizeExecution() {
        if ((req.type==='Internal' || req.type==='ICU escalation' || req.type==='ICU step-down') && !targetBedPick) {
          alert('Error: Please select a target bed space to execute relocation.');
          return;
        }

        // 1. Vacate old bed (Infection control cleaning status)
        var currentWardKey = window.state.bedsStatus[req.currentBed]?.wardKey || 'GENERAL-WARD-M';
        var prevStatusOld = window.state.bedsStatus[req.currentBed]?.status || 'Occupied';
        window.state.bedsStatus[req.currentBed] = {
          wardKey: currentWardKey,
          status: 'Cleaning',
          patientUhid: null,
          notes: `Awaiting cleaning after relocation of ${pat.name} to ${targetBedPick || 'External'}`
        };
        window.state.triggerHousekeepingRequest(req.currentBed, currentWardKey, `Awaiting cleaning after relocation of ${pat.name} to ${targetBedPick || 'External'}`);
        window.state.logBedMovement({
          patientId: pat.uhid,
          bedId: req.currentBed,
          wardKey: currentWardKey,
          prevStatus: prevStatusOld,
          newStatus: 'Cleaning',
          action: 'Transfer Out',
          user: window._ipdActiveRole || 'ATD Coordinator',
          role: window._ipdActiveRole || 'ATD Coordinator',
          remarks: `Vacated bed. Relocated to ${targetBedPick || 'External'}.`
        });

        // 2. Occupy new bed if internal
        if (req.type === 'Internal' || req.type === 'ICU escalation' || req.type === 'ICU step-down') {
          var prevStatusNew = window.state.bedsStatus[targetBedPick]?.status || 'Available';
          window.state.bedsStatus[targetBedPick] = {
            wardKey: req.targetWard,
            status: 'Occupied',
            patientUhid: pat.uhid,
            notes: `Patient relocated from ${req.currentBed}`
          };
          window.state.logBedMovement({
            patientId: pat.uhid,
            bedId: targetBedPick,
            wardKey: req.targetWard,
            prevStatus: prevStatusNew,
            newStatus: 'Occupied',
            action: 'Transfer In',
            user: window._ipdActiveRole || 'ATD Coordinator',
            role: window._ipdActiveRole || 'ATD Coordinator',
            remarks: `Patient relocated from ${req.currentBed}`
          });

          pat.ward = WARD_RATES[req.targetWard].name;
          pat.bed = targetBedPick;
        } else {
          // External/Interbranch relocation ends the current active episode
          pat.status = 'Referred';
          pat.bed = '';
        }

        // 3. Update EMR transfer logs
        pat.transferLogs = pat.transferLogs || [];
        pat.transferLogs.push({
          date: new Date().toLocaleDateString('en-CA'),
          type: req.type,
          from: req.currentBed,
          to: targetBedPick || 'External',
          reason: req.reason,
          requestedBy: req.requestedBy,
          approvedBy: 'Nursing Supervisor',
          executedBy: window._ipdActiveRole
        });

        // 4. Log timeline event
        pat.timelineEvents = pat.timelineEvents || [];
        pat.timelineEvents.unshift({
          date: new Date().toLocaleDateString('en-CA') + ' ' + new Date().toLocaleTimeString('en-US', {hour:'2-digit', minute:'2-digit'}),
          type: 'clinical',
          icon: '🔄',
          title: 'Patient Relocated successfully',
          desc: `Relocated from Bed ${req.currentBed} to Bed ${targetBedPick || 'External'}`
        });

        // 5. Remove request from list
        window.state.transferRequests = window.state.transferRequests.filter(r => r.id !== req.id);

        localStorage.setItem('saronil_patients', JSON.stringify(window.state.patients));
        localStorage.setItem('saronil_bedsStatus', JSON.stringify(window.state.bedsStatus));
        localStorage.setItem('saronil_transferRequests', JSON.stringify(window.state.transferRequests));

        closeTransferOverlay();
        window.showToastNotification('✓ Relocation execution completed.');
        refreshActiveSPAView();
      }

      drawExecution();
    }

    // Read only alert wrapper
    function renderReadOnlyRequestPanel(req, msgText) {
      container.innerHTML = `
        <div class="bg-white rounded-2xl w-[480px] max-w-[95vw] shadow-2xl p-6 text-center flex flex-col gap-4 animate-scale-in">
          <div class="text-blue-500 text-5xl">🔄</div>
          <h3 class="text-slate-800 font-bold text-base">Relocation Request: TRF-${req.id}</h3>
          <p class="text-xs text-slate-500 max-w-[340px] mx-auto">${msgText}</p>
          
          <div class="bg-slate-50 border rounded-xl p-4 text-xs text-left flex flex-col gap-2">
            <div>Patient: <strong>${req.name}</strong></div>
            <div>FROM: <strong>${req.currentBed}</strong> ➜ TO: <strong>${req.targetBed || 'External'}</strong></div>
            <div>Urgency: <strong>${req.urgency}</strong></div>
            <div>Current Status: <span class="px-2 py-0.5 bg-blue-100 text-blue-800 font-bold rounded text-[9px]">${req.status}</span></div>
          </div>

          <!-- Quick switcher selector to simulate review desk roles -->
          <div class="bg-blue-50 border border-blue-100 rounded-xl p-3.5 text-xs text-blue-800 flex flex-col gap-2 text-left">
            <span class="font-bold">Supervisor / Coordinator Simulation Desk:</span>
            <span>Switch active role to test the approval and execution screens:</span>
            <select class="w-full p-2 border rounded bg-white text-xs font-semibold text-slate-700 mt-1" onchange="window.switchRoleAndRerenderTransfer(this.value)">
              <option value="">-- Switch Role --</option>
              <option value="Nursing Supervisor" ${window._ipdActiveRole==='Nursing Supervisor'?'selected':''}>Nursing Supervisor (Approve)</option>
              <option value="ATD Coordinator" ${window._ipdActiveRole==='ATD Coordinator'?'selected':''}>ATD Coordinator (Execute)</option>
              <option value="Administrator / Medical Superintendent" ${window._ipdActiveRole==='Administrator / Medical Superintendent'?'selected':''}>Administrator</option>
            </select>
          </div>

          <div class="flex justify-end gap-3 mt-4 border-t pt-4">
            <button class="py-2 px-5 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer" onclick="window.closeTransferOverlay()">Close</button>
          </div>
        </div>
      `;
    }

    window.switchRoleAndRerenderTransfer = function (role) {
      window._ipdActiveRole = role;
      renderTransferContent();
    };

    window.closeTransferOverlay = function () {
      var wrapper = document.getElementById(overlayId);
      if (wrapper) wrapper.remove();
    };

    renderTransferContent();
  };

  // ==========================================================================
  // ALLOCATE BED WORKFLOW OVERLAY & LOGIC
  // ==========================================================================
  window.triggerAllocateBedWorkflow = function (uhid) {
    // 1. Initialize thresholds if not present
    if (!window.state.advanceThresholds) {
      window.state.advanceThresholds = {
        Standard: 5000,
        ICU: 15000,
        Daycare: 2000
      };
    }

    const patient = window.state.patients.find(p => p.uhid === uhid);
    if (!patient) {
      console.warn("Patient not found by UHID in triggerAllocateBedWorkflow:", uhid);
      // Case-insensitive name search fallback to correct mismatched UHIDs from previous sessions
      const adm = (window.state.admissions || []).find(a => a.uhid === uhid) || 
                  (window.state.admissionRequests || []).find(r => r.uhid === uhid);
      if (adm) {
        const fallbackPatient = window.state.patients.find(p => p.name.toLowerCase() === adm.name.toLowerCase());
        if (fallbackPatient) {
          console.log("Auto-correcting UHID for patient:", fallbackPatient.name, "from", adm.uhid, "to", fallbackPatient.uhid);
          adm.uhid = fallbackPatient.uhid;
          localStorage.setItem('saronil_admissionRequests', JSON.stringify(window.state.admissionRequests));
          window.triggerAllocateBedWorkflow(fallbackPatient.uhid);
          return;
        }
      }
      alert("Error: Patient record not found in system registry for UHID " + uhid);
      return;
    }

    // 2. Fetch admission request info to determine ward requested
    const adm = (window.state.admissions || []).find(a => a.uhid === uhid) || 
                (window.state.admissionRequests || []).find(r => r.uhid === uhid);

    // 3. Payer Cashless check
    const isCashless = patient.payerType === 'TPA' || 
                       patient.insuranceProvider || 
                       (patient.flags && patient.flags.includes('TPA')) || 
                       (adm && adm.payer && adm.payer !== 'Self Pay');

    // 4. Resolve threshold required deposit
    let required = window.state.advanceThresholds.Standard;
    const wardType = (adm && adm.ward) ? adm.ward : (patient.ward || 'Standard');
    if (wardType.includes('ICU') || wardType.includes('CCU') || wardType.includes('CCU-BED')) {
      required = window.state.advanceThresholds.ICU;
    } else if (wardType.includes('DAYCARE') || wardType.includes('Daycare')) {
      required = window.state.advanceThresholds.Daycare;
    }

    // Suggested 25% of estimated package cost if package is selected
    const pkg = (window.state.billingPackages || []).find(p => p.name === patient.name);
    if (pkg && pkg.pkgAmt) {
      required = Math.round(pkg.pkgAmt * 0.25);
    }

    // If cashless, no advance deposit is required
    if (isCashless) {
      required = 0;
    }

    // 5. Pull deposited amount from billingAdvances or fallback to patient.advancePaid
    const ledger = (window.state.billingAdvances || []).find(b => b.uhid === uhid);
    const deposited = ledger ? ledger.deposited : (patient.advancePaid ? 5000 : 0);

    const shortfall = required - deposited;

    // 6. IF shortfall > 0, show Pending popup
    if (shortfall > 0) {
      var currentRole = window.state?.activeUserRole || window._ipdActiveRole || 'ATD Coordinator';
      const canOverride = ['Billing Counter Executive', 'Billing Executive', 'Administrator', 'CEO', 'Medical Superintendent', 'Administrator / Medical Superintendent'].includes(currentRole);

      var overlayId = 'advance-pending-overlay';
      var wrapper = document.getElementById(overlayId);
      if (wrapper) wrapper.remove();

      wrapper = document.createElement('div');
      wrapper.id = overlayId;
      wrapper.className = 'fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[1100] p-4';
      
      wrapper.innerHTML = `
        <div class="bg-white rounded-2xl w-[480px] max-w-[95vw] shadow-2xl overflow-hidden flex flex-col animate-scale-in text-left">
          <!-- Header -->
          <div class="bg-red-50 border-b border-red-100 px-6 py-4 flex justify-between items-center">
            <h3 class="margin-0 text-red-700 font-bold text-base flex items-center gap-2">
              ⚠️ Advance Payment Pending
            </h3>
            <button class="text-slate-400 hover:text-slate-600 text-xl font-bold cursor-pointer" onclick="window.closeAllocateBedWorkflow()">✕</button>
          </div>
          
          <!-- Body -->
          <div class="p-6 flex flex-col gap-4 text-xs text-slate-700">
            <p class="font-medium text-slate-600">The patient's advance deposit does not meet the required threshold for bed allocation. Please collect the shortfall amount or verify coverage.</p>
            
            <div class="bg-slate-50 border border-slate-100 rounded-xl p-4 flex flex-col gap-2.5">
              <div class="flex justify-between">
                <span class="text-slate-500">Patient Name:</span>
                <strong class="text-slate-800">${patient.name}</strong>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-500">UHID:</span>
                <strong class="text-slate-800 mono">${patient.uhid}</strong>
              </div>
              <div class="flex justify-between border-t border-slate-200/60 pt-2">
                <span class="text-slate-500">Required Deposit:</span>
                <strong class="text-slate-800">₹${required.toLocaleString('en-IN')}</strong>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-500">Amount Paid So Far:</span>
                <strong class="text-emerald-700">₹${deposited.toLocaleString('en-IN')}</strong>
              </div>
              <div class="flex justify-between border-t border-slate-200/60 pt-2 font-bold text-red-600">
                <span>Shortfall:</span>
                <span>₹${shortfall.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>
          
          <!-- Footer -->
          <div class="bg-slate-50 px-6 py-3.5 border-t border-slate-200 flex justify-between items-center gap-3">
            <div>
              ${canOverride ? `
                <button class="py-2 px-4 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold cursor-pointer" onclick="window.overrideAndAllocateBed('${patient.uhid}')">
                  Allocate Anyway (Override)
                </button>
              ` : ''}
            </div>
            <div class="flex gap-2">
              <button class="py-2 px-5 border border-slate-300 rounded-lg text-xs font-bold text-slate-600 bg-white hover:bg-slate-100 cursor-pointer" onclick="window.closeAllocateBedWorkflow()">Cancel</button>
              <button class="py-2 px-5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold cursor-pointer" onclick="window.goToBillingScreen('${patient.uhid}')">
                Go to Billing 💰
              </button>
            </div>
          </div>
        </div>
      `;
      document.body.appendChild(wrapper);
    } else {
      // Advance is met or covered under TPA cashless
      window.openBedAllocationPopupDirect(uhid);
    }
  };

  window.closeAllocateBedWorkflow = function () {
    const el = document.getElementById('advance-pending-overlay');
    if (el) el.remove();
  };

  window.overrideAndAllocateBed = function (uhid) {
    window.closeAllocateBedWorkflow();
    window.showToastNotification('✓ Emergency override applied by Administrator.');
    window.openBedAllocationPopupDirect(uhid);
  };

  window.goToBillingScreen = function (uhid) {
    window.closeAllocateBedWorkflow();
    window.router.navigate(`billing?tab=advance_ledger&uhid=${uhid}`);
  };

  let selectedAllocBed = null;

  window.updateAllocBedGrid = function() {
    const wardKey = document.getElementById('alloc-ward').value;
    const wardInfo = window.state.wards[wardKey];
    const grid = document.getElementById('alloc-bed-grid');
    if (!wardInfo || !grid) return;

    const beds = wardInfo.beds || [];
    grid.innerHTML = beds.map(bedId => {
      const statusObj = window.state.bedsStatus[bedId] || { status: 'Available' };
      const status = statusObj.status;
      
      let borderStyle = 'border: 1px solid #cbd5e1; background: #fff; padding: 10px; border-radius: 8px; text-align: center; font-size: 11px;';
      let cursor = 'cursor: pointer;';
      let onClickAction = `onclick="window.selectAllocBed('${bedId}')"`;
      
      if (status === 'Occupied') {
        borderStyle += ' border-style: dashed; border-color: #fca5a5; background-color: #fef2f2; color: #ef4444; opacity: 0.7;';
        cursor = 'cursor: not-allowed;';
        onClickAction = `onclick="alert('Bed ${bedId} is occupied by another patient')"`;
      } else if (status === 'Cleaning') {
        borderStyle += ' border-style: dashed; border-color: #fde68a; background-color: #fffbeb; color: #d97706; opacity: 0.7;';
        cursor = 'cursor: not-allowed;';
        onClickAction = `onclick="alert('Bed ${bedId} is currently being sanitized')"`;
      } else if (status === 'Reserved') {
        borderStyle += ' border-style: dashed; border-color: #ddd6fe; background-color: #f5f3ff; color: #7c3aed; opacity: 0.7;';
        cursor = 'cursor: not-allowed;';
        onClickAction = `onclick="alert('Bed ${bedId} is reserved')"`;
      } else if (bedId === selectedAllocBed) {
        borderStyle += ' border: 2px solid #6366f1; background-color: #e0e7ff; font-weight: bold;';
      }

      return `
        <div style="${borderStyle} ${cursor}" ${onClickAction}>
          <div class="font-bold">${bedId}</div>
          <div style="font-size: 9px; margin-top: 2px; color: inherit;">${status}</div>
        </div>
      `;
    }).join('') || '<div class="col-span-4 p-4 text-center text-slate-400">No beds configured.</div>';

    // Disable confirm button if no bed is selected
    const btn = document.getElementById('btn-alloc-confirm');
    const badge = document.getElementById('selected-bed-badge');
    if (selectedAllocBed && beds.includes(selectedAllocBed)) {
      btn.disabled = false;
      btn.classList.remove('opacity-50');
      badge.textContent = `Selected: ${selectedAllocBed}`;
    } else {
      selectedAllocBed = null;
      btn.disabled = true;
      btn.classList.add('opacity-50');
      badge.textContent = 'None Selected';
    }
  };

  window.selectAllocBed = function(bedId) {
    selectedAllocBed = bedId;
    window.updateAllocBedGrid();
  };

  window.openBedAllocationPopupDirect = function (uhid) {
    const patient = window.state.patients.find(p => p.uhid === uhid);
    if (!patient) {
      alert("Error: Patient record not found in system registry for UHID " + uhid);
      return;
    }

    window.activeAllocPatientUhid = uhid;
    selectedAllocBed = null;

    // Fetch admission request info to prefill ward, doctor, diagnosis
    const adm = (window.state.admissions || []).find(a => a.uhid === uhid) || 
                (window.state.admissionRequests || []).find(r => r.uhid === uhid);
    
    const defaultWardKey = adm && adm.ward ? adm.ward : 'GENERAL-WARD-M';
    const defaultDoctor = adm && (adm.refDoc || adm.doctorName) ? (adm.refDoc || adm.doctorName) : 'Dr. Amit Verma';
    const defaultDiagnosis = adm && adm.diagnosis ? adm.diagnosis : 'Under Evaluation';

    var overlayId = 'bed-allocation-popup-overlay';
    var wrapper = document.getElementById(overlayId);
    if (wrapper) wrapper.remove();

    wrapper = document.createElement('div');
    wrapper.id = overlayId;
    wrapper.className = 'fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[1100] p-4';
    
    wrapper.innerHTML = `
      <div class="bg-white rounded-2xl w-[640px] max-w-[95vw] shadow-2xl overflow-hidden flex flex-col animate-scale-in text-left">
        <!-- Header -->
        <div class="bg-indigo-900 text-white px-6 py-4 flex justify-between items-center">
          <h3 class="margin-0 font-bold text-base flex items-center gap-2" style="margin: 0; color: white;">
            🛏️ Bed Space Allocation & Admission
          </h3>
          <button class="text-indigo-200 hover:text-white text-xl font-bold cursor-pointer bg-transparent border-0" onclick="window.closeBedAllocationPopup()">✕</button>
        </div>
        
        <!-- Content -->
        <div class="p-6 flex flex-col gap-4 overflow-y-auto max-h-[70vh] text-xs text-slate-700">
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; font-size: 12px;">
            👤 <strong>Patient:</strong> ${patient.name} (${patient.uhid}) &nbsp;·&nbsp; Type: <strong>IPD</strong>
          </div>

          <!-- Two-column settings: Ward + Doctor -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-slate-500 font-bold mb-1">Target Ward / Care Area</label>
              <select id="alloc-ward" class="w-full p-2 border rounded bg-white text-xs font-semibold text-slate-700" onchange="window.updateAllocBedGrid()">
                ${Object.entries(window.state.wards).map(([k, v]) => `
                  <option value="${k}" ${k === defaultWardKey ? 'selected' : ''}>${v.name}</option>
                `).join('')}
              </select>
            </div>
            <div>
              <label class="block text-slate-500 font-bold mb-1">Treating Consultant / Doctor</label>
              <select id="alloc-doctor" class="w-full p-2 border rounded bg-white text-xs font-semibold text-slate-700">
                ${(window.state.doctors || []).map(d => `
                  <option value="${d.name}" ${d.name === defaultDoctor ? 'selected' : ''}>${d.name} (${d.spec})</option>
                `).join('')}
              </select>
            </div>
          </div>

          <div>
            <label class="block text-slate-500 font-bold mb-1">Provisional Diagnosis</label>
            <input type="text" id="alloc-diagnosis" class="w-full p-2 border rounded bg-white text-xs font-semibold text-slate-700" value="${defaultDiagnosis}">
          </div>

          <!-- Bed Grid Section -->
          <div class="border-t pt-4">
            <div class="font-bold text-slate-600 mb-2 flex justify-between items-center" style="display: flex; justify-content: space-between; align-items: center;">
              <span>Select Bed Space:</span>
              <span id="selected-bed-badge" class="text-indigo-600 font-bold text-sm">None Selected</span>
            </div>
            <div id="alloc-bed-legend" class="flex gap-3 font-medium text-[10px] text-slate-500 mb-2" style="display: flex; gap: 12px; margin-bottom: 8px;">
              <div><span style="color:#10b981;">●</span> Available</div>
              <div><span style="color:#ef4444;">●</span> Occupied</div>
              <div><span style="color:#f59e0b;">●</span> Cleaning</div>
              <div><span style="color:#8b5cf6;">●</span> Reserved</div>
            </div>
            <div id="alloc-bed-grid" class="grid grid-cols-4 gap-2 max-h-[200px] overflow-y-auto p-2 bg-slate-50 border rounded-xl" style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; max-height: 200px; overflow-y: auto;">
              <!-- Bed items rendered dynamically here -->
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="bg-slate-50 px-6 py-4 border-t border-slate-200 flex justify-end gap-3" style="display: flex; justify-content: flex-end; gap: 12px;">
          <button class="py-2 px-5 border border-slate-300 rounded-lg text-xs font-bold text-slate-600 bg-white hover:bg-slate-100 cursor-pointer" onclick="window.closeBedAllocationPopup()">Cancel</button>
          <button class="py-2 px-6 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold cursor-pointer opacity-50" id="btn-alloc-confirm" disabled onclick="window.finalizeAllocBedPopup()">Confirm Admission</button>
        </div>
      </div>
    `;
    document.body.appendChild(wrapper);
    window.updateAllocBedGrid();
  };

  window.closeBedAllocationPopup = function () {
    const el = document.getElementById('bed-allocation-popup-overlay');
    if (el) el.remove();
  };

  window.finalizeAllocBedPopup = function() {
    if (!selectedAllocBed) return;

    const patient = window.state.patients.find(p => p.uhid === window.activeAllocPatientUhid);
    if (!patient) return;

    const wardKey = document.getElementById('alloc-ward').value;
    const doctor = document.getElementById('alloc-doctor').value;
    const diagnosis = document.getElementById('alloc-diagnosis').value;

    const seq = String(5000 + (window.state.admissions || []).length + 1);
    const admissionNo = 'ADM-2026-0' + seq;

    const admissionObj = {
      id: 'ADM' + seq,
      uhid: patient.uhid,
      patientName: patient.name,
      date: new Date().toLocaleDateString('en-CA'),
      ward: wardKey,
      bed: selectedAllocBed,
      doctorName: doctor,
      diagnosis: diagnosis,
      status: 'Active'
    };

    window.state.admissions = window.state.admissions || [];
    window.state.admissions.push(admissionObj);

    window.state.bedsStatus[selectedAllocBed] = {
      wardKey: wardKey,
      status: 'Occupied',
      patientUhid: patient.uhid,
      notes: `Admitted: IPD under ${doctor} (${diagnosis})`
    };

    patient.type = 'IPD';
    patient.status = 'Admitted';
    const wardInfo = window.state.wards[wardKey];
    patient.ward = wardInfo ? wardInfo.name : (WARD_RATES[wardKey] ? WARD_RATES[wardKey].name : wardKey);
    patient.bed = selectedAllocBed;
    patient.ipNumber = 'IP-2400' + seq;
    patient.primaryConsultant = doctor;
    patient.department = (window.state.doctors.find(d => d.name === doctor) || { spec: 'General Medicine' }).spec;
    patient.dischargeStatus = 'Not Initiated';
    patient.dischargeOrder = null;
    patient.dischargeClearances = null;

    window.state.logBedMovement({
      patientId: patient.uhid,
      bedId: selectedAllocBed,
      wardKey: wardKey,
      prevStatus: 'Available',
      newStatus: 'Occupied',
      action: 'Admitted',
      remarks: `Initial admission to ${patient.ward}`
    });

    // Remove from pending admission requests
    window.state.admissionRequests = (window.state.admissionRequests || []).filter(r => r.uhid !== patient.uhid);
    localStorage.setItem('saronil_admissionRequests', JSON.stringify(window.state.admissionRequests));

    // Save states to local storage
    localStorage.setItem('saronil_patients', JSON.stringify(window.state.patients));
    localStorage.setItem('saronil_bedsStatus', JSON.stringify(window.state.bedsStatus));
    localStorage.setItem('saronil_admissions', JSON.stringify(window.state.admissions));

    window.closeBedAllocationPopup();
    window.showToastNotification('✓ Patient admitted and bed allocated successfully.');
    
    // Refresh current SPA view to reflect new status!
    window.refreshActiveSPAView();
  };

  // ==========================================================================
  // DISCHARGE SUMMARY PRINT
  // ==========================================================================

  window.prPrintDischargeSummary = function (uhid) {
    var pat = window.state.patients.find(p => p.uhid === uhid);
    if (!pat || !pat.dischargeOrder) {
      alert('Discharge summary not available for this patient.');
      return;
    }
    var d = pat.dischargeOrder;
    var clearances = pat.dischargeClearances || {};
    var deptLabelMap = { nursing: 'Nursing', billing: 'Billing & Finance', pharmacy: 'Pharmacy', tpa: 'TPA / Insurance', lab: 'Laboratory', radiology: 'Radiology & Imaging', ot: 'OT / Procedure' };

    var clearanceRows = Object.entries(clearances).map(function ([key, c]) {
      var lbl = deptLabelMap[key] || key.toUpperCase();
      var badge = c.cleared
        ? '<span style="color:#16a34a;font-weight:bold">✓ Cleared</span>'
        : '<span style="color:#dc2626;font-weight:bold">✗ Pending</span>';
      var by = c.clearedBy ? ' by ' + c.clearedBy : '';
      var at = c.clearedAt ? ' at ' + new Date(c.clearedAt).toLocaleString() : '';
      return '<tr><td style="padding:4px 8px;border:1px solid #e2e8f0">' + lbl + '</td><td style="padding:4px 8px;border:1px solid #e2e8f0">' + badge + '</td><td style="padding:4px 8px;border:1px solid #e2e8f0;color:#64748b">' + by + at + '</td></tr>';
    }).join('');

    var html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Discharge Summary — ${pat.name}</title>
  <style>
    body { font-family: 'Segoe UI', Arial, sans-serif; font-size: 12px; color: #1e293b; margin: 0; padding: 24px; }
    .header { text-align: center; border-bottom: 2px solid #2563eb; padding-bottom: 12px; margin-bottom: 16px; }
    .header h1 { font-size: 18px; color: #2563eb; margin: 0 0 4px; }
    .header p { margin: 2px 0; color: #64748b; }
    .section-title { font-weight: bold; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: #2563eb; margin: 16px 0 6px; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 6px 24px; margin-bottom: 8px; }
    .field label { color: #64748b; font-size: 10px; text-transform: uppercase; }
    .field span { font-weight: 600; display: block; }
    table { width: 100%; border-collapse: collapse; margin-top: 6px; }
    th { background: #f1f5f9; font-size: 10px; text-transform: uppercase; letter-spacing: 0.04em; padding: 6px 8px; border: 1px solid #e2e8f0; text-align: left; }
    .footer { margin-top: 32px; display: flex; justify-content: space-between; border-top: 1px solid #e2e8f0; padding-top: 12px; color: #94a3b8; font-size: 10px; }
    @media print { body { padding: 0; } }
  </style>
</head>
<body>
  <div class="header">
    <h1>Saronil IHS — Discharge Summary</h1>
    <p>Generated: ${new Date().toLocaleString()} &nbsp;|&nbsp; Printed by System</p>
  </div>

  <div class="section-title">Patient Information</div>
  <div class="grid">
    <div class="field"><label>Patient Name</label><span>${pat.name || '—'}</span></div>
    <div class="field"><label>UHID</label><span>${pat.uhid || '—'}</span></div>
    <div class="field"><label>IP Number</label><span>${pat.ipNumber || '—'}</span></div>
    <div class="field"><label>Age / Gender</label><span>${pat.age || '—'} / ${pat.gender || '—'}</span></div>
    <div class="field"><label>Admission Date</label><span>${pat.admitted || pat.admissionDate || '—'}</span></div>
    <div class="field"><label>Discharge Date</label><span>${pat.dischargeDate || '—'}</span></div>
    <div class="field"><label>Ward / Bed</label><span>${pat.ward || '—'}</span></div>
    <div class="field"><label>Treating Consultant</label><span>${pat.primaryConsultant || '—'}</span></div>
  </div>

  <div class="section-title">Discharge Order Details</div>
  <div class="grid">
    <div class="field"><label>Discharge Type</label><span>${d.dischargeType || '—'}</span></div>
    <div class="field"><label>Condition at Discharge</label><span>${d.conditionAtDischarge || '—'}</span></div>
    <div class="field"><label>Provisional Diagnosis</label><span>${d.provisionalDiagnosis || pat.provisionalDiagnosis || '—'}</span></div>
    <div class="field"><label>Final Diagnosis</label><span>${d.finalDiagnosis || '—'}</span></div>
    <div class="field"><label>Follow-up Doctor</label><span>${d.followUpDoctor || '—'}</span></div>
    <div class="field"><label>Follow-up Date</label><span>${d.followUpDate || '—'}</span></div>
  </div>

  ${d.dischargeNotes ? `<div class="section-title">Discharge Notes</div><p style="margin:4px 0">${d.dischargeNotes}</p>` : ''}
  ${d.medicationsOnDischarge ? `<div class="section-title">Medications at Discharge</div><p style="margin:4px 0;white-space:pre-wrap">${d.medicationsOnDischarge}</p>` : ''}
  ${d.specialInstructions ? `<div class="section-title">Special Instructions / Advice</div><p style="margin:4px 0">${d.specialInstructions}</p>` : ''}

  <div class="section-title">Departmental Clearances</div>
  <table>
    <thead><tr><th>Department</th><th>Status</th><th>Cleared By / At</th></tr></thead>
    <tbody>${clearanceRows || '<tr><td colspan="3" style="padding:6px 8px;border:1px solid #e2e8f0;color:#94a3b8">No clearances recorded</td></tr>'}</tbody>
  </table>

  <div class="footer">
    <span>Saronil Integrated Hospital Information System</span>
    <span>Document ID: DS-${pat.uhid}-${Date.now()}</span>
  </div>
  <script>window.print();<\/script>
</body>
</html>`;

    var win = window.open('', '_blank', 'width=800,height=700');
    if (win) {
      win.document.write(html);
      win.document.close();
    } else {
      alert('Pop-up blocked. Please allow pop-ups to print the discharge summary.');
    }
  };

})();
