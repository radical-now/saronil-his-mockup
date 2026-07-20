/* ==========================================================================
   SARONIL HMS — IPD DASHBOARD, LIVE CENSUS & BED BOARD (Unified Workspace)
   ========================================================================== */

(function () {
  'use strict';

  // Global role state inside this module
  window._ipdActiveRole = window._ipdActiveRole || 'ATD Coordinator';

  // Navigation state: 'dashboard' | 'bedboard' | 'admission_wizard' | 'bed_mgmt'
  var _activeTab = 'dashboard'; 
  
  // Selected branch filter
  var _selectedBranch = 'All';

  // Admission Wizard local states (preserved from previous implementation)
  var _searchQuery = '';
  var _selectedPatient = null;
  var _admissionStep = 'lookup'; // 'lookup' | 'referral' | 'billing' | 'form' | 'bed' | 'success'
  var _admType = 'IPD';
  var _admSource = 'Same hospital OPD';
  var _referringDoctor = '';
  var _externalHospital = '';
  var _provisionalDiagnosis = '';
  var _referralSummary = '';
  var _treatingConsultant = '';
  var _wardPreference = 'GENERAL-WARD-M';
  var _paymentRequestGenerated = false;
  var _advancePaidAmount = 0;
  var _paymentMode = 'UPI';
  var _tpaApproved = false;
  var _nokName = '';
  var _nokRelation = '';
  var _nokMobile = '';
  var _insuranceProvider = '';
  var _policyNumber = '';
  var _tpaName = '';
  var _preAuthStatus = 'Pending';
  var _schemeFlag = 'None';
  var _beneficiaryId = '';
  var _mlcFlag = 'No';
  var _procedureName = '';
  var _estProcedureTime = '';
  var _preOpInstructions = 'No';
  var _fastingStatus = 'No';
  var _hoursFasted = '0';
  var _allottedBed = null;
  var _generatedAdmNo = '';

  // Safety Precaution and Pre-Admission Checklist state variables
  var _wizAllergyFlag = false;
  var _wizFallRiskFlag = false;
  var _wizDnrFlag = false;
  var _wizLimbPrecautionFlag = false;
  var _wizWristbandPrinted = false;
  var _wizConsentSigned = false;
  var _wizEmergencyImpliedConsent = false;
  var _wizEmergencyImpliedConsentDoctor = 'Dr. Amit Verma';
  var _wizDietOrderIssued = false;
  var _wizValuablesRecorded = false;

  // Daycare specific variables
  var PROCEDURES = [
    'Cataract Surgery (Phacoemulsification)',
    'Upper GI Endoscopy & Biopsy',
    'Diagnostic Colonoscopy',
    'Laparoscopic Appendectomy',
    'Chemotherapy Infusion Cycle',
    'Hemodialysis Session',
    'Hysteroscopy & Curettage',
    'AV Fistula Creation'
  ];

  // Bed Grid filter states
  var _gridWardFilter = 'All';
  var _gridStatusFilter = 'All';
  var _gridSearchFilter = '';

  // Right Drawer state
  var _drawerOpen = false;
  var _drawerPatientUhid = '';
  var _drawerBedId = '';

  // Quick Assign panel state
  var _quickAssignOpen = false;
  var _quickAssignBedId = '';

  // Transfer Form state
  var _transferModalOpen = false;
  var _transferPatientUhid = '';
  var _transferFromBed = '';
  var _transferType = 'Internal ward-to-ward';
  var _transferToWard = 'GENERAL-WARD-M';
  var _transferToRoom = 'Room 401 (Male)';
  var _transferToBed = '';
  var _transferReviewMode = false;
  var _transferReason = 'Clinical deterioration';
  var _transferPatientCondition = 'Stable';
  var _transferDateTime = '';
  var _transferConsultantConfirm = false;
  var _transferNotes = '';
  var _transferExtBranch = 'Whitefield';
  var _transferExtDoctor = '';
  var _transferExtAmbulance = 'No';
  var _transferExtConfirmed = 'No';

  // Discharge Form state
  var _dischargeModalOpen = false;
  var _dischargePatientUhid = '';
  var _dischargeType = 'Regular';
  var _dischargeDiagnosis = '';
  var _dischargeSummary = '';
  var _dischargeFollowup = '';
  var _dischargeMeds = 'Paracetamol 650mg TDS';
  var _dischargeDiet = 'Normal';
  var _dischargeMlcNotify = false;

  var _billingModalOpen = false;
  var _billingTargetReqId = '';
  var _billingCollectedAmount = 0;
  var _billingCollectedMode = 'UPI';

  var _emergencyOverrideModalOpen = false;
  var _emergencyTargetReqId = '';
  var _emergencyJustification = '';
  var _emergencyDeferral = 'Within 24 Hours';

  var WARD_RATES = {
    // ── General Wards ────────────────────────────────────────────────────────
    'GENERAL-WARD-M': {
      name: 'General Ward (Male)', category: 'General',
      rate: 1200,          // ₹/day bed charge
      nursingRate: 500,    // ₹/day nursing charge (billed separately)
      minDeposit: 10000,
      note: 'Shared 6-bed bay. Meals included.'
    },
    'GENERAL-WARD-F': {
      name: 'General Ward (Female)', category: 'General',
      rate: 1200, nursingRate: 500, minDeposit: 10000,
      note: 'Shared 6-bed bay. Meals included.'
    },
    // ── Semi-Private ─────────────────────────────────────────────────────────
    'SEMI-PRIVATE': {
      name: 'Semi-Private Ward', category: 'Semi-Private',
      rate: 2800, nursingRate: 600, minDeposit: 20000,
      note: '2-sharing room. Attached bathroom. Meals included.'
    },
    // ── Private ──────────────────────────────────────────────────────────────
    'PRIVATE': {
      name: 'Private Room', category: 'Private',
      rate: 5500, nursingRate: 800, minDeposit: 35000,
      note: 'Single occupancy. AC. Meals + 1 attendant pass included.'
    },
    // ── Deluxe / Suite ───────────────────────────────────────────────────────
    'DELUXE': {
      name: 'Deluxe Suite', category: 'Deluxe',
      rate: 11000, nursingRate: 1000, minDeposit: 60000,
      note: 'Executive suite. AC. Kitchenette. 2 attendant passes. Premium meals.'
    },
    // ── High Dependency Unit ─────────────────────────────────────────────────
    'HDU': {
      name: 'High Dependency Unit (HDU)', category: 'HDU',
      rate: 6500, nursingRate: 2000, minDeposit: 40000,
      note: 'Step-down monitoring. 24h nursing. Ventilator-capable.'
    },
    // ── ICU ──────────────────────────────────────────────────────────────────
    'ICU': {
      name: 'ICU / Critical Care Unit', category: 'ICU',
      rate: 10000, nursingRate: 3500, minDeposit: 75000,
      note: '1:1 nursing. Continuous vitals. Ventilator. Central line monitoring.'
    },
    // ── ICCU ─────────────────────────────────────────────────────────────────
    'ICCU': {
      name: 'Intensive Cardiac Care Unit (ICCU)', category: 'ICU',
      rate: 12000, nursingRate: 3500, minDeposit: 90000,
      note: 'Cardiac telemetry. Defibrillator on standby. IABP-ready.'
    },
    // ── CCU ──────────────────────────────────────────────────────────────────
    'CCU': {
      name: 'Cardiac Care Unit (CCU)', category: 'ICU',
      rate: 11000, nursingRate: 3500, minDeposit: 80000,
      note: '24h cardiac monitoring. Post-intervention care.'
    },
    // ── Emergency ────────────────────────────────────────────────────────────
    'EMERGENCY': {
      name: 'Emergency Ward', category: 'Emergency',
      rate: 3500, nursingRate: 1500, minDeposit: 15000,
      note: 'Emergency observation beds. Resuscitation bays. Triage managed.'
    },
    // ── Daycare ──────────────────────────────────────────────────────────────
    'DAYCARE': {
      name: 'Daycare Unit', category: 'Daycare',
      rate: 1800, nursingRate: 600, minDeposit: 8000,
      note: 'Same-day procedure recovery. Max 12h stay. OT link available.'
    }
  };
  window.WARD_RATES = WARD_RATES;


  // Seeding pending requests and logs on startup
  function ensurePendingDataSeeded() {
    var localAdms = localStorage.getItem('saronil_admissionRequests');
    if (localAdms) {
      var parsed = JSON.parse(localAdms);
      // Map to correct UHIDs if they were seeded incorrectly in the past
      var corrected = false;
      parsed.forEach(function(r) {
        if (r.name === 'Rajan Pillai' && r.uhid === 'SH-2026-04840') { r.uhid = 'SH-2026-04850'; corrected = true; }
        if (r.name === 'Pramod Rao' && r.uhid === 'SH-2026-04851') { r.uhid = 'SH-2026-04870'; corrected = true; }
      });
      if (corrected) {
        localStorage.setItem('saronil_admissionRequests', JSON.stringify(parsed));
      }
      // Discard any cached data that still has legacy fake UHIDs (003xx prefix)
      var hasFakeUhids = parsed.some(function(r) { return r.uhid && r.uhid.startsWith('SH-2026-003'); });
      if (!hasFakeUhids) {
        window.state.admissionRequests = parsed;
      } else {
        window.state.admissionRequests = [
          { id: 'REQ001', name: 'Sunita Sharma',   uhid: 'SH-2026-04817', source: 'OPD Referral',       refDoc: 'Dr. Srinivasan',    diagnosis: 'Acute Cholecystitis — Surgical Review',   ward: 'GENERAL-WARD-M', advancePaid: true,  waitingHrs: 2, branch: 'Bengaluru' },
          { id: 'REQ002', name: 'Deepak Verma',    uhid: 'SH-2026-04755', source: 'Emergency Transfer',  refDoc: 'Dr. Fatima Sheikh', diagnosis: 'Polytrauma — stabilised in Emergency',  ward: 'GENERAL-WARD-F', advancePaid: false, waitingHrs: 1, branch: 'Bengaluru' },
          { id: 'REQ003', name: 'Rajan Pillai',    uhid: 'SH-2026-04850', source: 'External Referral',   refDoc: 'Dr. K. Prasad',     diagnosis: 'Severe Community-Acquired Pneumonia',    ward: 'CCU',            advancePaid: true,  waitingHrs: 8, branch: 'Whitefield' },
          { id: 'REQ004', name: 'Pramod Rao',      uhid: 'SH-2026-04870', source: 'OPD Referral',        refDoc: 'Dr. Priya Nair',    diagnosis: 'Pre-eclampsia — Obstetric Assessment',  ward: 'GENERAL-WARD-F', advancePaid: false, waitingHrs: 7, branch: 'Electronic City' }
        ];
      }
    } else {
      window.state.admissionRequests = [
        { id: 'REQ001', name: 'Sunita Sharma',   uhid: 'SH-2026-04817', source: 'OPD Referral',       refDoc: 'Dr. Srinivasan',    diagnosis: 'Acute Cholecystitis — Surgical Review',   ward: 'GENERAL-WARD-M', advancePaid: true,  waitingHrs: 2, branch: 'Bengaluru' },
        { id: 'REQ002', name: 'Deepak Verma',    uhid: 'SH-2026-04755', source: 'Emergency Transfer',  refDoc: 'Dr. Fatima Sheikh', diagnosis: 'Polytrauma — stabilised in Emergency',  ward: 'GENERAL-WARD-F', advancePaid: false, waitingHrs: 1, branch: 'Bengaluru' },
        { id: 'REQ003', name: 'Rajan Pillai',    uhid: 'SH-2026-04850', source: 'External Referral',   refDoc: 'Dr. K. Prasad',     diagnosis: 'Severe Community-Acquired Pneumonia',    ward: 'CCU',            advancePaid: true,  waitingHrs: 8, branch: 'Whitefield' },
        { id: 'REQ004', name: 'Pramod Rao',      uhid: 'SH-2026-04870', source: 'OPD Referral',        refDoc: 'Dr. Priya Nair',    diagnosis: 'Pre-eclampsia — Obstetric Assessment',  ward: 'GENERAL-WARD-F', advancePaid: false, waitingHrs: 7, branch: 'Electronic City' }
      ];
    }

    var localTrfs = localStorage.getItem('saronil_transferRequests');
    if (localTrfs) {
      window.state.transferRequests = JSON.parse(localTrfs);
    } else {
      window.state.transferRequests = [
        { id: 'TRF001', name: 'Suresh Babu', uhid: 'SH-2026-04768', currentBed: 'SP-302', currentWard: 'SEMI-PRIVATE', targetWard: 'CCU', requestedBy: 'Dr. Srinivasan', reason: 'Clinical deterioration — CCU upgrade', requestedAt: new Date().toISOString(), status: 'Pending Nursing Supervisor Approval', branch: 'Bengaluru' }
      ];
    }

    // Dynamically retrieve names from common patients registry to ensure single source of truth
    if (window.state.admissionRequests) {
      window.state.admissionRequests.forEach(function(r) {
        var pat = window.state.patients.find(p => p.uhid === r.uhid);
        if (pat) {
          r.name = pat.name;
        }
      });
    }
    if (window.state.transferRequests) {
      window.state.transferRequests.forEach(function(t) {
        var pat = window.state.patients.find(p => p.uhid === t.uhid);
        if (pat) {
          t.name = pat.name;
        }
      });
    }

    if (!window.state.dischargeOrders) {
      window.state.dischargeOrders = [];
    }

    // Seed some demo discharge requests
    var admitted = window.state.patients.filter(p => p.status === 'Admitted');
    if (admitted.length > 1) {
      // Seed first patient if not already in discharge progress
      if (!admitted[0].dischargeStatus || admitted[0].dischargeStatus === 'Not Initiated') {
        admitted[0].dischargeStatus = 'In Progress — Clearances Pending';
        admitted[0].dischargeOrder = {
          type: 'Regular',
          condition: 'Improved',
          finalDiagnosis: 'Acute Appendicitis (K35.8)',
          summary: 'Clinical course resolved with surgery. Vitals stable.',
          timestamp: '2026-06-29T09:30:00Z',
          followUpDoctor: admitted[0].primaryConsultant || 'Dr. Ramesh Kumar'
        };
        admitted[0].dischargeClearances = {
          nursing: { cleared: true, clearedBy: 'Ward Nurse', clearedAt: '2026-06-29T09:45:00Z' },
          billing: { cleared: false, clearedBy: null, clearedAt: null },
          pharmacy: { cleared: true, clearedBy: 'Pharmacist', clearedAt: '2026-06-29T09:50:00Z' },
          tpa: { cleared: false, clearedBy: null, clearedAt: null }
        };
      }

      // Seed second patient (delayed >6h) if not already in discharge progress
      if (!admitted[1].dischargeStatus || admitted[1].dischargeStatus === 'Not Initiated') {
        admitted[1].dischargeStatus = 'In Progress — Clearances Pending';
        admitted[1].dischargeOrder = {
          type: 'Regular',
          condition: 'Improved',
          finalDiagnosis: 'Severe Pneumonia (J18.9)',
          summary: 'Clinical course resolved with IV antibiotics. Vitals stable.',
          timestamp: '2026-06-29T03:00:00Z',
          followUpDoctor: admitted[1].primaryConsultant || 'Dr. Priya Nair'
        };
        admitted[1].dischargeClearances = {
          nursing: { cleared: false, clearedBy: null, clearedAt: null },
          billing: { cleared: false, clearedBy: null, clearedAt: null },
          pharmacy: { cleared: false, clearedBy: null, clearedAt: null }
        };
      }
    }
  }

  function getTodayStr() {
    return new Date().toISOString().slice(0, 10);
  }

  function getFormattedTime() {
    return new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
  }

  function fmtMoney(amt) {
    return '₹' + Number(amt).toLocaleString('en-IN');
  }

  function injectIPDStyles() {
    if (document.getElementById('ipd-dashboard-css')) return;
    var style = document.createElement('style');
    style.id = 'ipd-dashboard-css';
    style.textContent = `
      .ipd-wrapper {
        font-family: 'Inter', 'Outfit', sans-serif;
        color: var(--text-primary);
        margin: -1.5rem !important;
        padding: 1.5rem !important;
        padding-bottom: 3rem !important;
        max-width: none !important;
        width: auto !important;
        box-sizing: border-box;
      }
      
      /* Top Switcher Bar */
      .ipd-control-bar { display: flex; align-items: center; justify-content: space-between; background: white; border: 1px solid var(--border-color); padding: 12px 24px; border-radius: 12px; margin-bottom: 20px; box-shadow: 0 4px 12px rgba(0,0,0,0.02); }
      .ipd-tab-btn { padding: 8px 16px; border-radius: 8px; border: 1.5px solid transparent; font-weight: 700; font-size: 13px; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; background: transparent; color: var(--text-secondary); transition: all 0.2s; }
      .ipd-tab-btn.active { background: #7c3aed; color: white; }
      .ipd-tab-btn:hover:not(.active) { background: #f1f5f9; color: var(--text-primary); }
      
      /* KPI Strip (Matched to Main Dashboard) */
      .admin-mono {
        font-family: 'JetBrains Mono', 'Courier New', Courier, monospace !important;
      }
      .admin-card {
        background-color: #ffffff;
        border: 1px solid var(--border-color);
        border-radius: var(--radius-md);
        padding: 16px !important;
        box-shadow: var(--shadow-sm);
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
      .admin-kpi-scroll-row {
        display: flex;
        gap: 12px;
        overflow-x: auto;
        padding-bottom: 8px;
        margin-bottom: 16px;
        scrollbar-width: thin;
      }
      .admin-kpi-scroll-row::-webkit-scrollbar {
        height: 6px;
      }
      .admin-kpi-scroll-row::-webkit-scrollbar-thumb {
        background-color: var(--border-color);
        border-radius: 3px;
      }
      .admin-kpi-card {
        flex: 0 0 calc(12.5% - 11px);
        min-width: 140px;
        background-color: #ffffff;
        border: 1px solid var(--border-color);
        border-radius: var(--radius-md);
        padding: 10px 12px;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        box-shadow: var(--shadow-sm);
        cursor: pointer;
        transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
        border-left: 4px solid var(--border-color);
      }
      .admin-kpi-card.status-normal {
        border-left-color: var(--color-success, #10b981);
      }
      .admin-kpi-card.status-warning {
        border-left-color: var(--color-warning, #f59e0b);
      }
      .admin-kpi-card.status-critical {
        border-left-color: var(--color-danger, #ef4444);
      }
      .admin-kpi-card:hover {
        transform: translateY(-2px);
        box-shadow: var(--shadow-md);
        border-color: var(--primary);
      }
      
      /* Bed Cards Layout */
      .ipd-bed-grid-container { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)) !important; gap: 10px; margin-top: 10px; }
      .ipd-bed-card {
        background: white;
        border-radius: 12px;
        padding: 14px 13px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.05);
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        position: relative;
        border: 1.5px solid var(--border-color);
        border-left: 4px solid #cbd5e1;
        transition: all 0.2s ease;
        min-height: 100px;
      }
      /* Occupied — blue accent */
      .ipd-bed-card.Occupied {
        background: linear-gradient(135deg, #dbeafe 0%, #eff6ff 100%);
        border-color: #93c5fd;
        border-left-color: #3b82f6;
      }
      /* Available — green accent */
      .ipd-bed-card.Available {
        background: linear-gradient(135deg, #dcfce7 0%, #f0fdf4 100%);
        border-color: #86efac;
        border-left-color: #22c55e;
      }
      .ipd-bed-card.Available:hover {
        background: linear-gradient(135deg, #bbf7d0 0%, #dcfce7 100%);
        transform: translateY(-3px);
        box-shadow: 0 10px 24px rgba(34,197,94,0.18);
      }
      /* Housekeeping (Dirty/Cleaning) — amber accent */
      .ipd-bed-card.Housekeeping {
        background: linear-gradient(135deg, #fef9c3 0%, #fffbeb 100%);
        border-color: #fde68a;
        border-left-color: #f59e0b;
      }
      /* Reserved — purple accent */
      .ipd-bed-card.Reserved {
        background: linear-gradient(135deg, #ede9fe 0%, #f5f3ff 100%);
        border-color: #c4b5fd;
        border-left-color: #a855f7;
      }
      /* Blocked / Out of Service — slate accent */
      .ipd-bed-card.Blocked {
        background: linear-gradient(135deg, #f1f5f9 0%, #f8fafc 100%);
        border-color: #cbd5e1;
        border-left-color: #94a3b8;
        opacity: 0.8;
      }
      .ipd-bed-card:hover:not(.Available) {
        transform: translateY(-3px);
        box-shadow: 0 8px 20px rgba(0,0,0,0.1);
      }
      
      .ipd-bed-hdr { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
      .ipd-bed-no { font-family: monospace; font-size: 14px; font-weight: 800; color: #1e293b; }
      .ipd-bed-ward-badge { font-size: 9px; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; background: #e2e8f0; padding: 2px 6px; border-radius: 4px; }
      
      .ipd-bed-pat-name { font-size: 13px; font-weight: 700; color: #1e3a8a; margin-bottom: 2px; }
      .ipd-bed-pat-meta { font-size: 11px; color: var(--text-secondary); line-height: 1.4; margin-bottom: 8px; }
      
      .ipd-badge { font-size: 9px; font-weight: 800; border-radius: 4px; padding: 1px 5px; text-transform: uppercase; display: inline-block; margin-right: 4px; margin-top: 4px; }
      .ipd-badge-mlc { background: #fee2e2; color: #991b1b; border: 1px solid #fca5a5; }
      .ipd-badge-ins { background: #e0f2fe; color: #0369a1; border: 1px solid #bae6fd; }
      
      .ipd-bed-actions { display: flex; gap: 6px; border-top: 1px solid var(--border-color); padding-top: 8px; margin-top: 8px; justify-content: flex-end; }
      .ipd-bed-btn { padding: 4px 8px; font-size: 10px; font-weight: 700; border-radius: 6px; border: 1px solid #cbd5e1; cursor: pointer; background: white; color: var(--text-primary); transition: all 0.15s; }
      .ipd-bed-btn:hover { background: #f8fafc; border-color: #94a3b8; }
      .ipd-bed-btn-primary { background: #7c3aed; color: white; border-color: #6d28d9; }
      .ipd-bed-btn-primary:hover { background: #6d28d9; }
      .ipd-bed-btn-danger { background: #fee2e2; color: #b91c1c; border-color: #fca5a5; }
      .ipd-bed-btn-danger:hover { background: #fca5a5; }

      /* Patient Details Modal Popup (Adopted standard system popups) */
      .ipd-details-overlay { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(15, 23, 42, 0.65); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 1100; opacity: 0; pointer-events: none; transition: opacity 0.2s ease; }
      .ipd-details-overlay.open { opacity: 1; pointer-events: auto; }
      .ipd-details-modal { background: white; border-radius: 16px; width: 480px; max-width: 90vw; max-height: 85vh; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); overflow: hidden; display: flex; flex-direction: column; transform: scale(0.95); transition: transform 0.2s ease; }
      .ipd-details-overlay.open .ipd-details-modal { transform: scale(1); }
      .ipd-drawer-hdr { background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%); color: white; padding: 18px 24px; display: flex; justify-content: space-between; align-items: center; }
      .ipd-drawer-close { background: none; border: none; color: white; font-size: 20px; cursor: pointer; opacity: 0.8; }
      .ipd-drawer-close:hover { opacity: 1; }
      .ipd-drawer-body { padding: 24px; overflow-y: auto; flex: 1; display: flex; flex-direction: column; gap: 14px; box-sizing: border-box; }
      .ipd-drawer-sect-title { font-size: 11px; font-weight: 800; text-transform: uppercase; color: var(--text-secondary); letter-spacing: 0.5px; border-bottom: 1px solid var(--border-color); padding-bottom: 4px; margin-bottom: 8px; }
      .ipd-drawer-row { display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 6px; }
      .ipd-drawer-label { color: var(--text-secondary); }
      .ipd-drawer-val { font-weight: 600; color: var(--text-primary); text-align: right; }
      
      /* Modals */
      .ipd-modal-overlay { position: fixed; top:0; left:0; width:100vw; height:100vh; background: rgba(15, 23, 42, 0.65); backdrop-filter: blur(4px); display:flex; align-items:center; justify-content:center; z-index: 1200; }
      .ipd-modal { background:white; border-radius:16px; width:500px; max-width:90%; max-height:90%; overflow-y:auto; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); border:1px solid #cbd5e1; }
      .ipd-modal-hdr { background:white; padding:18px 24px; border-bottom:1px solid #cbd5e1; display:flex; justify-content:space-between; align-items:center; }
      .ipd-modal-title { font-weight:800; font-size:14px; color:#1e3a8a; margin:0; text-transform:uppercase; }
      .ipd-modal-body { padding:20px; }
      .ipd-modal-field { display:flex; flex-direction:column; gap:5px; margin-bottom:12px; }
      .ipd-modal-input, .ipd-modal-select, .ipd-modal-textarea { padding:8px 12px; border:1.5px solid #e2e8f0; border-radius:6px; font-size:13px; width:100%; box-sizing:border-box; }
      .ipd-modal-input:focus, .ipd-modal-select:focus, .ipd-modal-textarea:focus { border-color:#7c3aed; outline:none; }
      
      /* Red Highlight Row for Delayed items */
      .tr-delayed { background: #fef2f2 !important; border-left: 3px solid #ef4444 !important; }
      .tr-delayed td { color: #b91c1c !important; font-weight: 600; }

      .atd-card { background: var(--bg-surface, #fff); border: none !important; border-radius: 0 !important; box-shadow: none !important; overflow: hidden; margin-top: 0 !important; }
      .atd-body { padding: 24px 0 !important; }
      .atd-header { background: transparent !important; background-color: transparent !important; border: none !important; border-bottom: none !important; padding: 12px 0 !important; margin-bottom: 12px; }
    `;
    document.head.appendChild(style);
  }

  window.views.ipdAdmission = function (container, subAnchor, params) {
    injectIPDStyles();
    ensurePendingDataSeeded();

    var pageTitleEl = document.getElementById('active-page-title');
    if (pageTitleEl) pageTitleEl.textContent = 'IPD / ATD Coordinator Workspace';

    // Set active tab based on query param
    if (params && params.tab) {
      if (params.tab === 'dashboard' || params.tab === 'atd') {
        _activeTab = 'dashboard';
      }
    }

    // Intercept target params for deep linking (previous 5-step wizard routing)
    if (params && params.uhid) {
      var pat = (window.state.patients || []).find(p => p.uhid === params.uhid);
      if (pat) {
        _selectedPatient = pat;
        _admissionStep = 'referral';
        _provisionalDiagnosis = pat.clinicalData ? pat.clinicalData.diagnosis : '';
        _referringDoctor = pat.primaryConsultant || '';
        _activeTab = 'admission_wizard';

        if (params.bed) {
          _allottedBed = params.bed;
          var bedStatusObj = window.state.bedsStatus[params.bed];
          if (bedStatusObj && bedStatusObj.wardKey) {
            _wardPreference = bedStatusObj.wardKey;
          }
        }

        if (params.from_er === 'true' || params.from_er === true) {
          _admSource = 'Same hospital Emergency';
          _referringDoctor = 'Dr. Fatima Sheikh';
          _provisionalDiagnosis = pat.clinicalData ? pat.clinicalData.complaint : 'Trauma admission';
          _referralSummary = pat.clinicalData ? pat.clinicalData.hpi : 'Transferred from ER stable';
          _mlcFlag = (pat.flags && pat.flags.includes('MLC')) ? 'Yes' : 'No';
        }

        if (params.type === 'daycare') {
          _admType = 'Daycare';
          _wardPreference = 'DAYCARE';
        } else {
          _admType = 'IPD';
          _wardPreference = pat.gender === 'Female' ? 'GENERAL-WARD-F' : 'GENERAL-WARD-M';
        }
      }
    }

    renderWorkspace(container);
  };

  function renderWorkspace(container) {
    var contentHTML = '';

    // Switch screens based on active tab
    if (_activeTab === 'dashboard') {
      contentHTML = renderDashboardScreen();
    } else if (_activeTab === 'admission_wizard') {
      contentHTML = renderAdmissionWizardWrapper();
    } else if (_activeTab === 'bed_mgmt') {
      contentHTML = renderBedManagementScreen();
    }

    var roleSelectorHTML = `
      <!-- Statutory Role Switcher & Slabs Panel -->
      <div class="role-simulator-panel shadow-sm" style="background:#fff; border:1px solid var(--border-color); border-radius:12px; padding:16px 20px; margin-bottom:15px; display:flex; flex-direction:column; gap:12px; font-family:'Inter',sans-serif;">
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px;">
          <div style="display:flex; align-items:center; gap:10px;">
            <span style="font-size:18px;">🔐</span>
            <div>
              <div style="font-size:10px; font-weight:800; color:var(--text-secondary); text-transform:uppercase; letter-spacing:0.5px;">Statutory Persona Selector</div>
              <div style="font-size:14px; font-weight:700; color:var(--text-primary);">Active Role: <span style="color:#1b3a5c;">${window._ipdActiveRole}</span></div>
            </div>
          </div>
          <div style="display:flex; gap:8px; align-items:center;">
            <button class="btn btn-secondary" style="background:#1d4ed8; color:#fff; font-size:11px; padding:6px 12px; font-weight:700; border:none; border-radius:4px; height:32px; display:flex; align-items:center;" onclick="window.showStockRequestOverlay({dept:'IPD Admission', urgency:'Routine'})">📦 Request Stock</button>
          </div>
        </div>
        <div style="border-top:1px solid var(--border-color); padding-top:10px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px; font-size:11px;">
          <div style="color:var(--text-secondary);">💼 Configured Room Advance Deposit Slabs:</div>
          <div style="display:flex; gap:8px; flex-wrap:wrap;">
            <span class="reg-badge" style="background:#f1f5f9; color:#475569;">General Ward: ₹10,000</span>
            <span class="reg-badge" style="background:#f1f5f9; color:#475569;">Semi-Private: ₹20,000</span>
            <span class="reg-badge" style="background:#f1f5f9; color:#475569;">Private Room: ₹35,000</span>
            <span class="reg-badge" style="background:#f1f5f9; color:#475569;">Deluxe: ₹50,000</span>
            <span class="reg-badge" style="background:#f8fafc; border:1px solid #fee2e2; color:#b91c1c;">ICU / CCU: ₹50,000</span>
          </div>
        </div>
      </div>
    `;

    window.ipdSafeRender(container, `
      <div class="ipd-wrapper">
        ${roleSelectorHTML}
        <!-- Workspace Body Content -->
        <div class="ipd-body-content" style="margin-top: 10px;">
          ${contentHTML}
        </div>
        <!-- Patient Details Central Modal Popup -->
        <div class="ipd-details-overlay ${(_drawerOpen && _activeTab === 'dashboard') ? 'open' : ''}" id="ipd-drawer-container" onclick="if(event.target===this) window._drawerClose()">
          <div class="ipd-details-modal">
            ${renderRightDrawerHTML()}
          </div>
        </div>
        <!-- Modal Overlays -->
        ${renderModalOverlays()}
      </div>
    `);
  }

  window._ipdSwitchRole = function(role) {
    window._ipdActiveRole = role;
    // Auto-adjust default active tab if role changes and tab is restricted
    if (_activeTab === 'bed_mgmt' && role !== 'Administrator / Medical Superintendent' && role !== 'Nursing Supervisor') {
      _activeTab = 'dashboard';
    }
    if (_activeTab === 'admission_wizard' && role !== 'ATD Coordinator' && role !== 'Admission Clerk') {
      _activeTab = 'dashboard';
    }
    var c = document.getElementById('main-content');
    if (c) renderWorkspace(c);
  };

  window._ipdSwitchTab = function(tab) {
    _activeTab = tab;
    // Clear drawer or modals when tab switches
    _drawerOpen = false;
    _quickAssignOpen = false;
    _transferModalOpen = false;
    _dischargeModalOpen = false;
    
    var c = document.getElementById('main-content');
    if (c) renderWorkspace(c);
  };

  window._ipdChangeBranchFilter = function(val) {
    _selectedBranch = val;
    var c = document.getElementById('main-content');
    if (c) renderWorkspace(c);
  };

  // Helper functions for Dynamic Ward/Room/Bed mapping
  function getRoomsForWard(wardKey) {
    if (wardKey === 'GENERAL-WARD-M') {
      return ['Room 401 (Male)', 'Room 402 (Male)'];
    } else if (wardKey === 'GENERAL-WARD-F') {
      return ['Room 403 (Female)', 'Room 404 (Female)'];
    } else if (wardKey === 'SEMI-PRIVATE') {
      return ['Room 301', 'Room 302'];
    } else if (wardKey === 'PRIVATE') {
      return ['Room 201', 'Room 202', 'Room 203'];
    } else if (wardKey === 'DELUXE') {
      return ['Suite 501', 'Suite 502'];
    } else if (wardKey === 'CCU') {
      return ['CCU Room A', 'CCU Room B'];
    } else if (wardKey === 'ICCU') {
      return ['ICCU Room A'];
    } else if (wardKey === 'EMERGENCY') {
      return ['ER Bay 1', 'ER Bay 2'];
    } else if (wardKey === 'DAYCARE') {
      return ['Daycare Ward A', 'Daycare Ward B'];
    }
    return ['General Room'];
  }

  function getBedsForRoom(wardKey, roomName) {
    var beds = window.state.wards[wardKey]?.beds || [];
    if (!roomName) return beds;
    
    // Split beds roughly between the room lists
    if (roomName.includes('Room 401') || roomName.includes('Room 403') || roomName.includes('Room 301') || roomName.includes('Room 201') || roomName.includes('Suite 501') || roomName.includes('CCU Room A') || roomName.includes('ER Bay 1') || roomName.includes('Daycare Ward A')) {
      return beds.slice(0, Math.ceil(beds.length / 2));
    } else {
      return beds.slice(Math.ceil(beds.length / 2));
    }
  }

  window.showToastNotification = function(msg) {
    var toast = document.createElement('div');
    toast.style.position = 'fixed';
    toast.style.top = '24px';
    toast.style.left = '50%';
    toast.style.transform = 'translateX(-50%)';
    toast.style.background = '#1e293b';
    toast.style.color = '#ffffff';
    toast.style.padding = '12px 24px';
    toast.style.borderRadius = '12px';
    toast.style.boxShadow = '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)';
    toast.style.zIndex = '9999';
    toast.style.fontSize = '12px';
    toast.style.fontWeight = '700';
    toast.style.display = 'flex';
    toast.style.alignItems = 'center';
    toast.style.gap = '8px';
    toast.innerHTML = `<span>✓</span> <span>${msg}</span>`;
    document.body.appendChild(toast);
    setTimeout(function() {
      toast.remove();
    }, 3000);
  };

  /* ── SCREEN 1: IPD DASHBOARD ────────────────────────────────── */
  function renderDashboardScreen() {
    var adminOverridesLogHTML = '';
    if (window._ipdActiveRole === 'Administrator / Medical Superintendent') {
      adminOverridesLogHTML = renderAdminOverridesAuditPanel();
    }

    return `
      <!-- KPI Strip -->
      ${renderKPICards()}

      <!-- 2-Column Command Center Layout: 30% Queues Left + 70% Bed Board Right -->
      <div style="display: grid; grid-template-columns: 3fr 7fr; gap: 20px; align-items: start; margin-top: 15px;">
        <!-- Left Column: 30% Pending Action Queues -->
        <div style="display: flex; flex-direction: column; gap: 20px;">
          ${renderPendingQueues()}
        </div>

        <!-- Right Column: 70% Real-Time Facility Bed Board -->
        <div style="display: flex; flex-direction: column; gap: 20px;">
          ${renderDashboardBedBoard()}
        </div>
      </div>

      <!-- Administrator Retrospective Audit Panel -->
      ${adminOverridesLogHTML}
    `;
  }

  window._showBedLogsPopup = function() {
    var existing = document.getElementById('bed-logs-popup-overlay');
    if (existing) existing.remove();

    var wrapper = document.createElement('div');
    wrapper.id = 'bed-logs-popup-overlay';
    wrapper.style.position = 'fixed';
    wrapper.style.top = '0';
    wrapper.style.left = '0';
    wrapper.style.width = '100vw';
    wrapper.style.height = '100vh';
    wrapper.style.backgroundColor = 'rgba(15, 23, 42, 0.6)';
    wrapper.style.backdropFilter = 'blur(4px)';
    wrapper.style.display = 'flex';
    wrapper.style.justifyContent = 'center';
    wrapper.style.alignItems = 'center';
    wrapper.style.zIndex = '999999';

    var logs = window.state.bedAuditLogs || [];
    var sortedLogs = [...logs].reverse();
    
    var logRowsHTML = sortedLogs.map(log => {
      var dateStr = '';
      try {
        dateStr = new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' ' + new Date(log.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' });
      } catch (e) {
        dateStr = log.timestamp || '—';
      }
      
      var patientInfo = '—';
      if (log.patientId) {
        var pat = window.state.patients.find(p => p.uhid === log.patientId);
        var name = pat ? pat.name : 'Patient';
        patientInfo = `<strong style="color:#1b3a5c;">${name}</strong> <span style="font-family:monospace; font-size:10px; color:#64748b;">(${log.patientId})</span>`;
      }
      
      var badgeColor = '#f1f5f9';
      var badgeTextColor = '#475569';
      var actionLabel = log.action || log.newStatus || 'Status Update';
      
      if (actionLabel === 'Admission' || actionLabel === 'Allocation' || log.newStatus === 'Occupied') {
        badgeColor = '#dcfce7';
        badgeTextColor = '#15803d';
      } else if (actionLabel === 'Transfer' || actionLabel === 'Relocation' || actionLabel === 'Transfer In' || actionLabel === 'Transfer Out') {
        badgeColor = '#f3e8ff';
        badgeTextColor = '#6b21a8';
      } else if (actionLabel === 'Release' || actionLabel === 'Discharge' || actionLabel === 'Discharge Checkout' || log.newStatus === 'Dirty' || log.newStatus === 'Cleaning') {
        badgeColor = '#fee2e2';
        badgeTextColor = '#b91c1c';
      } else if (log.newStatus === 'Blocked' || log.newStatus === 'Maintenance Required') {
        badgeColor = '#fef3c7';
        badgeTextColor = '#d97706';
      }
      
      var wardName = (window.state.wards && window.state.wards[log.wardKey]?.name) || log.wardKey || '—';
      var opName = log.user || 'System';
      if (log.role) {
        opName += ` (${log.role})`;
      }

      return `
        <tr style="border-bottom: 1px solid #e2e8f0; font-size: 11px;">
          <td style="padding: 10px 12px; color: #64748b; white-space: nowrap;">${dateStr}</td>
          <td style="padding: 10px 12px;"><span class="reg-badge" style="background:#e0f2fe; color:#0369a1; font-weight:700; font-family:monospace;">${log.bedId}</span></td>
          <td style="padding: 10px 12px; color: #475569;">${wardName}</td>
          <td style="padding: 10px 12px;"><span class="reg-badge" style="background:${badgeColor}; color:${badgeTextColor}; font-weight:700;">${actionLabel}</span></td>
          <td style="padding: 10px 12px; color: #475569;">${patientInfo}</td>
          <td style="padding: 10px 12px; color: #475569;">${log.remarks || log.reason || 'Status updated'}</td>
          <td style="padding: 10px 12px; color: #64748b;">${opName}</td>
        </tr>
      `;
    }).join('') || `<tr><td colspan="7" style="text-align:center; padding:20px; color:#64748b;">No bed activity logged</td></tr>`;

    wrapper.innerHTML = `
      <div style="background: white; width: 85%; max-width: 1000px; max-height: 80%; border-radius: 12px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04); display: flex; flex-direction: column; overflow: hidden; animation: modalFadeIn 0.25s ease-out;">
        <style>
          @keyframes modalFadeIn {
            from { opacity: 0; transform: scale(0.95) translateY(10px); }
            to { opacity: 1; transform: scale(1) translateY(0); }
          }
        </style>
        
        <!-- Modal Header -->
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 16px 20px; border-bottom: 1px solid #e2e8f0; background: #f8fafc;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="font-size: 18px;">📋</span>
            <div>
              <h3 style="margin: 0; font-size: 13px; font-weight: 800; color: #1b3a5c;">Bed Activity & Transaction Logs</h3>
              <div style="font-size: 10px; color: #64748b; margin-top: 1px;">Audit trail of all ward allocations, transfers, releases, and status changes.</div>
            </div>
          </div>
          <button onclick="window.closeBedLogsPopup()" style="background: none; border: none; font-size: 20px; color: #94a3b8; cursor: pointer; font-weight: bold; padding: 4px;">&times;</button>
        </div>

        <!-- Modal Body (Logs Table) -->
        <div style="padding: 20px; overflow-y: auto; flex-grow: 1;">
          <table style="width: 100%; border-collapse: collapse; text-align: left; font-family: sans-serif;">
            <thead>
              <tr style="background: #f1f5f9; border-bottom: 2px solid #cbd5e1; font-size: 11px; color: #475569; font-weight: 700;">
                <th style="padding: 10px 12px; width: 15%;">Timestamp</th>
                <th style="padding: 10px 12px; width: 10%;">Bed</th>
                <th style="padding: 10px 12px; width: 15%;">Ward</th>
                <th style="padding: 10px 12px; width: 12%;">Activity</th>
                <th style="padding: 10px 12px; width: 22%;">Patient Details</th>
                <th style="padding: 10px 12px; width: 21%;">Remarks / Reason</th>
                <th style="padding: 10px 12px; width: 15%;">Operator</th>
              </tr>
            </thead>
            <tbody>
              ${logRowsHTML}
            </tbody>
          </table>
        </div>

        <!-- Modal Footer -->
        <div style="display: flex; justify-content: flex-end; padding: 12px 20px; border-top: 1px solid #e2e8f0; background: #f8fafc; gap: 8px;">
          <button onclick="window.closeBedLogsPopup()" class="btn btn-secondary" style="padding: 6px 16px; font-size: 11px; font-weight: 700; cursor: pointer;">Close</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(wrapper);
  };

  window.closeBedLogsPopup = function() {
    var el = document.getElementById('bed-logs-popup-overlay');
    if (el) el.remove();
  };

  function renderAdminOverridesAuditPanel() {
    var overrides = window.state.emergencyOverridesHistory || [];
    
    return `
      <div class="admin-card shadow-sm" style="margin-top:20px; border-color:#fca5a5; background:#fff8f8; text-align:left; border-radius:12px; padding:16px 20px; font-family:'Inter',sans-serif;">
        <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1.5px solid #fee2e2; padding-bottom:8px; margin-bottom:12px;">
          <h3 style="margin:0; font-size:13px; font-weight:800; color:#b91c1c; display:flex; align-items:center; gap:6px;">
            <span>🚨</span> <span>Retrospective Audit Log: emergency admission overrides</span>
          </h3>
          <span class="reg-badge" style="background:#fee2e2; color:#ef4444; font-weight:800;">Retrospective Review Required</span>
        </div>
        <p style="font-size:11px; color:#7f1d1d; margin:0 0 12px 0; line-height:1.4;">
          DPDPA 2023 & statutory health regulations mandate retrospective administrative sign-offs for all emergency advance deposit deferral events. Verify justification and follow up on deposit collection status within the deferral window.
        </p>
        
        <table class="custom-table" style="width:100%; border-collapse:collapse; font-size:12px; background:white; border-radius:8px; border:1px solid #fee2e2;">
          <thead>
            <tr style="background:#fff1f1; border-bottom:1px solid #fee2e2; text-align:left; color:#991b1b; font-weight:800;">
              <th style="padding:10px;">ID</th>
              <th style="padding:10px;">Patient name</th>
              <th style="padding:10px;">UHID</th>
              <th style="padding:10px;">Authorized By</th>
              <th style="padding:10px;">Clinical Justification</th>
              <th style="padding:10px;">Deferred Until</th>
              <th style="padding:10px;">Timestamp</th>
              <th style="padding:10px; text-align:right;">Sign-off Action</th>
            </tr>
          </thead>
          <tbody>
            ${overrides.map((ov, index) => {
              var btnCol = ov.reviewed 
                ? `<span class="reg-badge" style="background:#ecfdf5; color:#047857; font-weight:700;">✓ Signed Off (${ov.reviewedBy})</span>` 
                : `<button class="btn btn-primary" style="padding:3px 8px; font-size:10px; background:#b91c1c; border-color:#b91c1c; font-weight:800; color:white; border-radius:4px; cursor:pointer;" onclick="window._adminSignOffOverride(${index})">Sign Off Waiver</button>`;
                
              return `
                <tr style="border-bottom:1px solid #ffe4e4;">
                  <td style="padding:10px;">${ov.admissionId}</td>
                  <td style="padding:10px;"><strong>${ov.patientName}</strong></td>
                  <td style="padding:10px;" class="mono">${ov.uhid}</td>
                  <td style="padding:10px;">${ov.triggeredBy}</td>
                  <td style="padding:10px; font-style:italic;">"${ov.justification}"</td>
                  <td style="padding:10px; font-weight:700; color:#b91c1c;">${ov.depositDeferredUntil}</td>
                  <td style="padding:10px;">${new Date(ov.timestamp).toLocaleString('en-IN', { hour12:true, month:'short', day:'numeric', hour:'2-digit', minute:'2-digit' })}</td>
                  <td style="padding:10px; text-align:right;">${btnCol}</td>
                </tr>
              `;
            }).join('') || '<tr><td colspan="8" style="text-align:center; padding:20px; color:#991b1b; font-style:italic;">No emergency overrides recorded in the log.</td></tr>'}
          </tbody>
        </table>
      </div>
    `;
  }

  window._adminSignOffOverride = function(index) {
    var overrides = window.state.emergencyOverridesHistory || [];
    var ov = overrides[index];
    if (ov) {
      ov.reviewed = true;
      ov.reviewedBy = 'MS (Admin)';
      ov.reviewedAt = new Date().toISOString();
      
      // Save Audit Log
      window.state.auditLogs = window.state.auditLogs || [];
      window.state.auditLogs.push({
        timestamp: new Date().toISOString(),
        action: 'ADMIN_RETROSPECTIVE_SIGNOFF',
        user: 'Administrator',
        details: 'Admin retrospective sign-off approved for ' + ov.patientName + ' (' + ov.uhid + ') emergency override.'
      });

      localStorage.setItem('saronil_emergencyOverridesHistory', JSON.stringify(window.state.emergencyOverridesHistory));
      alert(`Retrospective Admin Sign-off complete for emergency admission request ${ov.admissionId}. Log sealed.`);
      
      var c = document.getElementById('main-content');
      if (c) renderWorkspace(c);
    }
  };

  function renderKPICards() {
    // Computes dynamic KPIs based on branch filter
    var patients = window.state.patients || [];
    var admissions = window.state.admissions || [];

    // Filter admissions by branch if needed
    var branchAdms = admissions.filter(a => {
      if (_selectedBranch === 'All') return true;
      var p = patients.find(pt => pt.uhid === a.uhid);
      return p && p.uhid.includes(_selectedBranch === 'Whitefield' ? 'WT' : (_selectedBranch === 'Electronic City' ? 'EC' : 'BLR'));
    });

    var activeCount = branchAdms.filter(a => a.status === 'Active').length;
    
    // Count total beds
    var totalBeds = 0;
    var occupiedBeds = 0;
    var icuTotal = 0;
    var icuOccupied = 0;

    Object.entries(window.state.wards).forEach(function([key, val]) {
      var beds = val.beds || [];
      totalBeds += beds.length;
      if (key === 'ICU') icuTotal += beds.length;

      beds.forEach(b => {
        var s = window.state.bedsStatus[b] || { status: 'Available' };
        if (s.status === 'Occupied') {
          occupiedBeds++;
          if (key === 'ICU') icuOccupied++;
        }
      });
    });

    var availableBeds = totalBeds - occupiedBeds;
    var icuPct = icuTotal > 0 ? Math.round((icuOccupied / icuTotal) * 100) : 0;
    var capacityPct = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;

    // Filters pending request tables
    var pendingAdmissions = (window.state.admissionRequests || []).filter(r => _selectedBranch === 'All' || r.branch === _selectedBranch);
    var pendingTransfers = (window.state.transferRequests || []).filter(t => _selectedBranch === 'All' || t.branch === _selectedBranch);
    var pendingDischarges = window.state.patients.filter(p => p.dischargeStatus === 'In Progress — Clearances Pending').map(p => {
      var diffMs = new Date() - new Date(p.dischargeOrder?.timestamp || new Date());
      var diffHrs = Math.floor(diffMs / 3600000);
      return {
        uhid: p.uhid,
        patientName: p.name,
        ward: p.ward || 'GENERAL-WARD-M',
        bed: p.bed || 'GW(M)-410',
        doctorName: p.dischargeOrder?.followUpDoctor || p.primaryConsultant || 'Doctor',
        clearances: p.dischargeClearances || {},
        waitingHrs: diffHrs || 1
      };
    });
    
    var delayedCount = pendingAdmissions.filter(a => a.waitingHrs > 6).length + pendingDischarges.filter(d => d.waitingHrs > 6).length;

    // Status classes based on rules
    var kpi1Class = capacityPct > 90 ? 'status-critical' : (capacityPct >= 80 ? 'status-warning' : 'status-normal');
    var kpi2Class = (availableBeds / totalBeds) < 0.1 ? 'status-critical' : 'status-normal';
    var kpi3Class = pendingAdmissions.length > 0 ? 'status-warning' : 'status-normal';
    var kpi4Class = pendingAdmissions.filter(a => a.source === 'Emergency transfer').length > 0 ? 'status-critical' : 'status-normal';
    var kpi5Class = pendingDischarges.length > 0 ? 'status-warning' : 'status-normal';
    var kpi6Class = delayedCount > 0 ? 'status-critical' : 'status-normal';
    var kpi8Class = icuPct > 85 ? 'status-critical' : (icuPct > 70 ? 'status-warning' : 'status-normal');

    return `
      <div class="admin-kpi-scroll-row">
        <div class="admin-kpi-card ${kpi1Class}" onclick="window.router.navigate('dashboard?kpi=admissions_today')" style="cursor: pointer; transition: transform 0.2s ease, box-shadow 0.2s ease;">
          <div style="font-size: 0.72rem; color: var(--text-secondary); font-weight: 600; text-transform: uppercase;">Active IPD Patients</div>
          <span class="admin-mono" style="font-size: 1.45rem; font-weight: 700; color: var(--text-primary); letter-spacing: -0.02em;">${activeCount}</span>
          <div style="font-size: 0.68rem; color: var(--text-muted); margin-top: 4px;">${capacityPct}% Hospital Occupied</div>
        </div>
        <div class="admin-kpi-card ${kpi2Class}" onclick="window.router.navigate('dashboard?kpi=beds_available')" style="cursor: pointer; transition: transform 0.2s ease, box-shadow 0.2s ease;">
          <div style="font-size: 0.72rem; color: var(--text-secondary); font-weight: 600; text-transform: uppercase;">Available Beds</div>
          <span class="admin-mono" style="font-size: 1.45rem; font-weight: 700; color: var(--text-primary); letter-spacing: -0.02em;">${availableBeds} / ${totalBeds}</span>
          <div style="font-size: 0.68rem; color: var(--text-muted); margin-top: 4px;">${Math.round((availableBeds/totalBeds)*100)}% Free Space</div>
        </div>
        <div class="admin-kpi-card ${kpi3Class}" onclick="window.router.navigate('dashboard?kpi=admissions_pending')" style="cursor: pointer; transition: transform 0.2s ease, box-shadow 0.2s ease;">
          <div style="font-size: 0.72rem; color: var(--text-secondary); font-weight: 600; text-transform: uppercase;">OPD Referrals</div>
          <span class="admin-mono" style="font-size: 1.45rem; font-weight: 700; color: var(--text-primary); letter-spacing: -0.02em;">${pendingAdmissions.filter(a => a.source === 'OPD referral').length}</span>
          <div style="font-size: 0.68rem; color: var(--text-muted); margin-top: 4px;">Awaiting Admission</div>
        </div>
        <div class="admin-kpi-card ${kpi4Class}" onclick="window.router.navigate('dashboard?kpi=admissions_pending')" style="cursor: pointer; transition: transform 0.2s ease, box-shadow 0.2s ease;">
          <div style="font-size: 0.72rem; color: var(--text-secondary); font-weight: 600; text-transform: uppercase;">Emergency Transfers</div>
          <span class="admin-mono" style="font-size: 1.45rem; font-weight: 700; color: var(--text-primary); letter-spacing: -0.02em;">${pendingAdmissions.filter(a => a.source === 'Emergency transfer').length}</span>
          <div style="font-size: 0.68rem; color: var(--text-muted); margin-top: 4px;">Trauma Intake Alerts</div>
        </div>
        <div class="admin-kpi-card ${kpi5Class}" onclick="window.router.navigate('dashboard?kpi=discharges_today')" style="cursor: pointer; transition: transform 0.2s ease, box-shadow 0.2s ease;">
          <div style="font-size: 0.72rem; color: var(--text-secondary); font-weight: 600; text-transform: uppercase;">Discharges Pending</div>
          <span class="admin-mono" style="font-size: 1.45rem; font-weight: 700; color: var(--text-primary); letter-spacing: -0.02em;">${pendingDischarges.length}</span>
          <div style="font-size: 0.68rem; color: var(--text-muted); margin-top: 4px;">In-progress Clearances</div>
        </div>
        <div class="admin-kpi-card ${kpi6Class}" onclick="window.router.navigate('dashboard?kpi=admissions_pending')" style="cursor: pointer; transition: transform 0.2s ease, box-shadow 0.2s ease;">
          <div style="font-size: 0.72rem; color: var(--text-secondary); font-weight: 600; text-transform: uppercase;">Delayed (>6h)</div>
          <span class="admin-mono" style="font-size: 1.45rem; font-weight: 700; color: var(--text-primary); letter-spacing: -0.02em;">${pendingDischarges.filter(d => d.waitingHrs > 6).length}</span>
          <div style="font-size: 0.68rem; color: var(--text-muted); margin-top: 4px;">Escalations Pending</div>
        </div>
        <div class="admin-kpi-card status-normal" onclick="window.router.navigate('dashboard?kpi=admissions_today')" style="cursor: pointer; transition: transform 0.2s ease, box-shadow 0.2s ease;">
          <div style="font-size: 0.72rem; color: var(--text-secondary); font-weight: 600; text-transform: uppercase;">Expected Today</div>
          <span class="admin-mono" style="font-size: 1.45rem; font-weight: 700; color: var(--text-primary); letter-spacing: -0.02em;">${pendingAdmissions.length + 2}</span>
          <div style="font-size: 0.68rem; color: var(--text-muted); margin-top: 4px;">Projected ATD Flow</div>
        </div>
        <div class="admin-kpi-card ${kpi8Class}" onclick="window.router.navigate('dashboard?kpi=beds_available')" style="cursor: pointer; transition: transform 0.2s ease, box-shadow 0.2s ease;">
          <div style="font-size: 0.72rem; color: var(--text-secondary); font-weight: 600; text-transform: uppercase;">ICU Occupancy</div>
          <span class="admin-mono" style="font-size: 1.45rem; font-weight: 700; color: var(--text-primary); letter-spacing: -0.02em;">${icuPct}%</span>
          <div style="font-size: 0.68rem; color: var(--text-muted); margin-top: 4px;">${icuOccupied} / ${icuTotal} ICU Beds</div>
        </div>
      </div>
    `;
  }

  // Local state for dashboard sub-tabs
  window._dashboardSubTab = window._dashboardSubTab || 'admissions';

  function renderPendingQueues() {
    var tab = window._dashboardSubTab;
    
    var pendingAdmissions = (window.state.admissionRequests || []).filter(r => _selectedBranch === 'All' || r.branch === _selectedBranch);
    var pendingTransfers = (window.state.transferRequests || []).filter(t => _selectedBranch === 'All' || t.branch === _selectedBranch);
    var pendingDischarges = window.state.patients.filter(p => p.dischargeStatus === 'In Progress — Clearances Pending').map(p => {
      var diffMs = new Date() - new Date(p.dischargeOrder?.timestamp || new Date());
      var diffHrs = Math.floor(diffMs / 3600000);
      return {
        uhid: p.uhid,
        patientName: p.name,
        ward: p.ward || 'GENERAL-WARD-M',
        bed: p.bed || 'GW(M)-410',
        doctorName: p.dischargeOrder?.followUpDoctor || p.primaryConsultant || 'Doctor',
        clearances: p.dischargeClearances || {},
        waitingHrs: diffHrs || 1
      };
    });
    var delayedItems = [
      ...pendingAdmissions.filter(a => a.waitingHrs > 6).map(a => Object.assign({ type: 'Admission' }, a)),
      ...pendingDischarges.filter(d => d.waitingHrs > 6).map(d => Object.assign({ type: 'Discharge' }, d))
    ];

    var badgeAdms = pendingAdmissions.length;
    var badgeTrfs = pendingTransfers.length;
    var badgeDis = pendingDischarges.length;
    var badgeDly = delayedItems.length;

    var cardsHTML = '';

    if (tab === 'admissions') {
      cardsHTML = pendingAdmissions.map((adm, i) => {
        var isOverride = adm.emergencyOverride ? true : false;
        var isPaid = adm.advancePaid || adm.status === 'Confirmed' || isOverride;
        var actionCol = '';
        
        if (adm.admType !== 'Daycare') {
          actionCol = `<button class="btn btn-primary" style="padding:4px 10px; font-size:11px; background:#1b3a5c; border-color:#1b3a5c; font-weight:700; width:100%; cursor:pointer;" onclick="window.router.navigate('ipdAdmit?uhid=${adm.uhid}')">Admit Patient</button>`;
        } else {
          if (isPaid) {
            if (window._ipdActiveRole === 'ATD Coordinator' || window._ipdActiveRole === 'Nursing Supervisor' || window._ipdActiveRole === 'Administrator / Medical Superintendent') {
              actionCol = `<button class="btn btn-primary" style="padding:4px 10px; font-size:11px; background:#1b3a5c; width:100%;" onclick="window.router.navigate('ipdAdmit?uhid=${adm.uhid}')">Admit Patient</button>`;
            } else {
              actionCol = `<span class="reg-badge" style="background:#dcfce7; color:#15803d; text-align:center; width:100%; display:block; box-sizing:border-box;">Confirmed (Awaiting Nursing)</span>`;
            }
          } else {
            if (window._ipdActiveRole === 'Billing Counter Executive') {
              actionCol = `<button class="btn btn-primary" style="padding:4px 10px; font-size:11px; background:#16a34a; border-color:#16a34a; width:100%;" onclick="window._billingOpen('${adm.id}')">💳 Collect Deposit</button>`;
            } else if (window._ipdActiveRole === 'Treating Consultant / Doctor') {
              actionCol = `<button class="btn btn-primary" style="padding:4px 10px; font-size:11px; background:#dc2626; border-color:#dc2626; width:100%;" onclick="window._emergencyOverrideOpen('${adm.id}')">🚨 ER Override</button>`;
            } else {
              actionCol = `<span class="reg-badge" style="background:#fee2e2; color:#b91c1c; text-align:center; width:100%; display:block; box-sizing:border-box;">Pending Deposit (Billing Handoff)</span>`;
            }
          }
        }

        var statusBadgeHTML = '';
        if (isOverride) {
          statusBadgeHTML = `<span class="reg-badge" style="background:#fee2e2; color:#ef4444; font-weight:800;" title="Justification: ${adm.emergencyOverride.justification}">ER Override</span>`;
        } else {
          statusBadgeHTML = `
            <span class="reg-badge" style="background:${isPaid ? '#ecfdf5' : '#fee2e2'}; color:${isPaid ? '#047857' : '#b91c1c'}; font-weight: 700;">
              ${isPaid ? 'Deposit Paid' : 'Pending Deposit'}
            </span>
          `;
        }

        return `
          <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:12px; display:flex; flex-direction:column; gap:6px;">
            <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:8px;">
              <div>
                <strong style="color: #1b3a5c; text-decoration: underline; cursor: pointer; font-size:12px;" onclick="window.router.navigate('patients?uhid=${adm.uhid}&name=${encodeURIComponent(adm.name)}')">${adm.name}</strong>
                <div style="font-family: monospace; font-size:10px; color:#64748b;">${adm.uhid}</div>
              </div>
              ${statusBadgeHTML}
            </div>
            <div style="font-size:11px; color:#475569; display:grid; grid-template-columns:1fr; gap:3px; line-height:1.3;">
              <div><strong>Req Ward:</strong> ${WARD_RATES[adm.ward]?.name || adm.ward}</div>
              <div><strong>Diagnosis:</strong> ${adm.diagnosis}</div>
              <div><strong>Ref Doc:</strong> ${adm.refDoc}</div>
              <div><strong>Waiting:</strong> ${adm.waitingHrs}h</div>
            </div>
            <div style="margin-top:4px;">
              ${actionCol}
            </div>
          </div>
        `;
      }).join('') || '<div style="text-align:center; padding:30px; color:var(--text-muted); font-size:12px;">No pending admission requests</div>';
    } else if (tab === 'transfers') {
      cardsHTML = pendingTransfers.map((trf, i) => {
        var isApproved = trf.status.includes('Approved');
        var actionCol = '';

        if (window._ipdActiveRole === 'Nursing Supervisor' && !isApproved) {
          actionCol = `
            <button class="btn btn-primary cursor-pointer" style="padding:4px 8px; font-size:10px; background:#10b981; width:100%;" onclick="window.showUniversalTransferWorkflow('${trf.uhid}')">Review & Approve</button>
          `;
        } else if (window._ipdActiveRole === 'ATD Coordinator' && isApproved) {
          actionCol = `<button class="btn btn-primary cursor-pointer" style="padding:4px 8px; font-size:10px; background:#7c3aed; width:100%;" onclick="window.showUniversalTransferWorkflow('${trf.uhid}')">Execute Relocation</button>`;
        } else {
          actionCol = `<button class="btn btn-secondary cursor-pointer" style="padding:4px 8px; font-size:10px; width:100%;" onclick="window.showUniversalTransferWorkflow('${trf.uhid}')">View Status</button>`;
        }

        return `
          <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:12px; display:flex; flex-direction:column; gap:6px;">
            <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:8px;">
              <div>
                <strong style="color: var(--primary); text-decoration: underline; cursor: pointer; font-size:12px;" onclick="window.router.navigate('patients?uhid=${trf.uhid}&name=${encodeURIComponent(trf.name)}')">${trf.name}</strong>
                <div style="font-family: monospace; font-size:10px; color:#64748b;">${trf.uhid}</div>
              </div>
              <span class="reg-badge" style="background:#eff6ff; color:#1e40af; font-size:9px;">${trf.status}</span>
            </div>
            <div style="font-size:11px; color:#475569; display:grid; grid-template-columns:1fr; gap:3px; line-height:1.3;">
              <div><strong>Current Bed:</strong> ${trf.currentBed} (${WARD_RATES[trf.currentWard]?.name || trf.currentWard})</div>
              <div><strong>Target Ward:</strong> ${WARD_RATES[trf.targetWard]?.name || trf.targetWard}</div>
              <div><strong>Requested By:</strong> ${trf.requestedBy}</div>
              <div><strong>Reason:</strong> ${trf.reason}</div>
            </div>
            <div style="margin-top:4px;">
              ${actionCol}
            </div>
          </div>
        `;
      }).join('') || '<div style="text-align:center; padding:30px; color:var(--text-muted); font-size:12px;">No pending transfers</div>';
    } else if (tab === 'discharges') {
      cardsHTML = pendingDischarges.map((dis, i) => {
        var isNursing = dis.clearances.nursing?.cleared;
        var isBilling = dis.clearances.billing?.cleared;
        var isPharmacy = dis.clearances.pharmacy?.cleared;
        var isTpa = dis.clearances.tpa ? dis.clearances.tpa.cleared : true;

        var allCleared = isNursing && isBilling && isPharmacy && isTpa;
        var actionCol = '';

        if (window._ipdActiveRole === 'ATD Coordinator' || window._ipdActiveRole === 'Administrator / Medical Superintendent') {
          actionCol = `<button class="btn btn-primary cursor-pointer" style="padding:4px 10px; font-size:11px; background:#10b981; width:100%;" onclick="window.showUniversalDischargeWorkflow('${dis.uhid}')">Complete Discharge</button>`;
        } else {
          actionCol = `<button class="btn btn-secondary cursor-pointer" style="padding:4px 10px; font-size:11px; width:100%;" onclick="window.showUniversalDischargeWorkflow('${dis.uhid}')">Review & Clear</button>`;
        }

        var clearanceChecklistHTML = `
          <div style="display:flex; gap:6px; flex-wrap:wrap; margin-top:2px;">
            <span class="reg-badge" style="background:${isNursing ? '#ecfdf5; color:#047857;' : '#fee2e2; color:#b91c1c;'} font-size:9px;">🩺 Nurse</span>
            <span class="reg-badge" style="background:${isPharmacy ? '#ecfdf5; color:#047857;' : '#fee2e2; color:#b91c1c;'} font-size:9px;">💊 Pharma</span>
            <span class="reg-badge" style="background:${isBilling ? '#ecfdf5; color:#047857;' : '#fee2e2; color:#b91c1c;'} font-size:9px;">💳 Bill</span>
            ${dis.clearances.tpa ? `<span class="reg-badge" style="background:${isTpa ? '#ecfdf5; color:#047857;' : '#fee2e2; color:#b91c1c;'} font-size:9px;">🏥 TPA</span>` : ''}
          </div>
        `;

        return `
          <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:12px; display:flex; flex-direction:column; gap:6px;">
            <div>
              <strong style="color: var(--primary); text-decoration: underline; cursor: pointer; font-size:12px;" onclick="window.router.navigate('patients?uhid=${dis.uhid}&name=${encodeURIComponent(dis.patientName)}')">${dis.patientName}</strong>
              <div style="font-family: monospace; font-size:10px; color:#64748b;">${dis.uhid}</div>
            </div>
            <div style="font-size:11px; color:#475569; display:grid; grid-template-columns:1fr; gap:3px; line-height:1.3;">
              <div><strong>Bed:</strong> ${dis.bed} (${WARD_RATES[dis.ward]?.name || dis.ward})</div>
              <div><strong>Ordered By:</strong> ${dis.doctorName}</div>
              <div><strong>Waiting:</strong> ${dis.waitingHrs}h</div>
            </div>
            <div>
              <strong>Clearance Status:</strong>
              ${clearanceChecklistHTML}
            </div>
            <div style="margin-top:4px;">
              ${actionCol}
            </div>
          </div>
        `;
      }).join('') || '<div style="text-align:center; padding:30px; color:var(--text-muted); font-size:12px;">No pending discharges</div>';
    } else if (tab === 'delayed') {
      cardsHTML = delayedItems.map((itm, i) => {
        var name = itm.name || itm.patientName;
        var isAdm = itm.type === 'Admission';
        var actionCol = '';

        if (window._ipdActiveRole === 'Administrator / Medical Superintendent' || window._ipdActiveRole === 'Nursing Supervisor') {
          actionCol = `<button class="btn btn-primary" style="padding:4px 8px; font-size:10px; background:#ef4444; border-color:#b91c1c; width:100%;" onclick="window._dashboardEscalate('${name}', '${itm.type}')">Escalate alert</button>`;
        } else {
          actionCol = `<span style="color:#b91c1c; font-weight:700; font-size:10px; text-align:center; width:100%; display:block;">Urgent Handoff Required</span>`;
        }

        return `
          <div style="background:#fff5f5; border:1px solid #fecaca; border-radius:8px; padding:12px; display:flex; flex-direction:column; gap:6px;">
            <div>
              <strong style="color:#b91c1c; font-size:12px;">⚠️ ${itm.type} Delayed</strong>
              <div style="font-weight:700; color:#111827; font-size:11px; margin-top:2px;">${name} (${itm.uhid})</div>
            </div>
            <div style="font-size:11px; color:#b91c1c; display:grid; grid-template-columns:1fr; gap:3px; line-height:1.3;">
              <div><strong>Ward/Source:</strong> ${isAdm ? itm.source : (WARD_RATES[itm.ward]?.name || itm.ward)}</div>
              <div><strong>Consultant:</strong> ${isAdm ? itm.refDoc : itm.doctorName}</div>
              <div><strong>Delayed by:</strong> ${itm.waitingHrs}h</div>
            </div>
            <div style="margin-top:4px;">
              ${actionCol}
            </div>
          </div>
        `;
      }).join('') || '<div style="text-align:center; padding:30px; color:var(--text-muted); font-size:12px;">No delayed items</div>';
    }

    return `
      <div class="admin-card" style="padding: 16px !important; display: flex; flex-direction: column; gap: 12px; box-sizing: border-box; text-align: left; height: 100%; margin-top: 0;">
        <div style="display: flex; flex-direction: column; gap: 4px; border-bottom: 1px solid var(--border-color); padding-bottom: 8px;">
          <h3 style="color:#1b3a5c; margin: 0; font-size: 14px; font-weight: 800; display: flex; align-items: center; gap: 6px;">
            <span>⚡</span> <span>Urgent Pending Action Queues</span>
          </h3>
          <span style="font-size: 11px; color: var(--text-muted);">Process pending admissions, transfers, and clearances.</span>
        </div>

        <!-- Horizontal Navigation Tabs -->
        <div style="display: flex; gap: 2px; border-bottom: 2px solid var(--border-color); padding-bottom: 0px; margin-bottom: 8px; overflow-x: auto; scrollbar-width: none; -ms-overflow-style: none;">
          <div onclick="window._dashboardSetSubTab('admissions')" style="cursor: pointer; padding: 8px 10px; font-size: 12px; font-weight: 700; border-bottom: 3px solid ${tab === 'admissions' ? '#7c3aed' : 'transparent'}; color: ${tab === 'admissions' ? '#7c3aed' : 'var(--text-secondary)'}; display: flex; align-items: center; gap: 5px; white-space: nowrap; transition: all 0.2s;">
            Admit <span style="background: ${tab === 'admissions' ? '#7c3aed' : '#e2e8f0'}; color: ${tab === 'admissions' ? 'white' : 'var(--text-secondary)'}; border-radius: 10px; padding: 1px 6px; font-size: 10px; font-weight: 800;">${badgeAdms}</span>
          </div>
          <div onclick="window._dashboardSetSubTab('transfers')" style="cursor: pointer; padding: 8px 10px; font-size: 12px; font-weight: 700; border-bottom: 3px solid ${tab === 'transfers' ? '#7c3aed' : 'transparent'}; color: ${tab === 'transfers' ? '#7c3aed' : 'var(--text-secondary)'}; display: flex; align-items: center; gap: 5px; white-space: nowrap; transition: all 0.2s;">
            Transfer <span style="background: ${tab === 'transfers' ? '#7c3aed' : '#e2e8f0'}; color: ${tab === 'transfers' ? 'white' : 'var(--text-secondary)'}; border-radius: 10px; padding: 1px 6px; font-size: 10px; font-weight: 800;">${badgeTrfs}</span>
          </div>
          <div onclick="window._dashboardSetSubTab('discharges')" style="cursor: pointer; padding: 8px 10px; font-size: 12px; font-weight: 700; border-bottom: 3px solid ${tab === 'discharges' ? '#7c3aed' : 'transparent'}; color: ${tab === 'discharges' ? '#7c3aed' : 'var(--text-secondary)'}; display: flex; align-items: center; gap: 5px; white-space: nowrap; transition: all 0.2s;">
            Clearance <span style="background: ${tab === 'discharges' ? '#7c3aed' : '#e2e8f0'}; color: ${tab === 'discharges' ? 'white' : 'var(--text-secondary)'}; border-radius: 10px; padding: 1px 6px; font-size: 10px; font-weight: 800;">${badgeDis}</span>
          </div>
          <div onclick="window._dashboardSetSubTab('delayed')" style="cursor: pointer; padding: 8px 10px; font-size: 12px; font-weight: 700; border-bottom: 3px solid ${tab === 'delayed' ? '#ef4444' : 'transparent'}; color: ${tab === 'delayed' ? '#ef4444' : 'var(--text-secondary)'}; display: flex; align-items: center; gap: 5px; white-space: nowrap; transition: all 0.2s;">
            Delayed <span style="background: ${badgeDly > 0 ? '#ef4444' : '#e2e8f0'}; color: ${badgeDly > 0 ? 'white' : 'var(--text-secondary)'}; border-radius: 10px; padding: 1px 6px; font-size: 10px; font-weight: 800;">${badgeDly}</span>
          </div>
        </div>

        <!-- Action Card List Container -->
        <div style="display: flex; flex-direction: column; gap: 8px; max-height: 580px; overflow-y: auto; padding-right: 4px; margin-top: 4px;">
          ${cardsHTML}
        </div>
      </div>
    `;
  }

  window._dashboardSetSubTab = function(tab) {
    window._dashboardSubTab = tab;
    var c = document.getElementById('main-content');
    if (c) renderWorkspace(c);
  };

  window._dashboardAssignBed = function(uhid) {
    var pat = window.state.patients.find(p => p.uhid === uhid);
    if (!pat) {
      var req = window.state.admissionRequests.find(r => r.uhid === uhid);
      if (req) {
        var fallbackPat = window.state.patients.find(p => p.name.toLowerCase() === req.name.toLowerCase());
        if (fallbackPat) {
          req.uhid = fallbackPat.uhid;
          localStorage.setItem('saronil_admissionRequests', JSON.stringify(window.state.admissionRequests));
          pat = fallbackPat;
        }
      }
    }
    if (pat) {
      _selectedPatient = pat;
      _admissionStep = 'bed';
      _activeTab = 'admission_wizard';
      
      var req = window.state.admissionRequests.find(r => r.uhid === pat.uhid);
      if (req) {
        _wardPreference = req.ward;
        _provisionalDiagnosis = req.diagnosis;
        _treatingConsultant = req.refDoc;
      }
      
      var c = document.getElementById('main-content');
      if (c) renderWorkspace(c);
    }
  };

  window._dashboardSendReminder = function(name) {
    alert(`📢 Advance Deposit reminder alert sent to Patient/Attender: ${name} via SMS successfully.`);
  };

  window._dashboardApproveTransfer = async function(index, approve) {
    var req = window.state.transferRequests[index];
    if (req) {
      if (approve) {
        req.status = 'Approved - Pending ATD Execution';
        alert(`✓ Transfer approved for ${req.name}.\nATD coordinator may now execute ward allocation.`);
      } else {
        var reason = await customPrompt('Please enter reason for transfer rejection:');
        if (reason) {
          req.status = 'Rejected - ' + reason;
          alert(`Transfer request rejected.`);
        }
      }
      var c = document.getElementById('main-content');
      if (c) renderWorkspace(c);
    }
  };

  window._dashboardExecuteTransfer = function(index) {
    var req = window.state.transferRequests[index];
    if (req) {
      // Find selected bed or fallback to first empty bed in target ward
      var freeBed = req.targetBed;
      if (!freeBed || (window.state.bedsStatus[freeBed] && window.state.bedsStatus[freeBed].status !== 'Available')) {
        var targetBeds = window.state.wards[req.targetWard].beds || [];
        freeBed = targetBeds.find(b => window.state.bedsStatus[b].status === 'Available');
      }
      
      if (!freeBed) {
        alert(`❌ Error: No available beds in target ward: ${WARD_RATES[req.targetWard].name}.`);
        return;
      }

      // Vacate old bed
      window.state.bedsStatus[req.currentBed] = {
        wardKey: req.currentWard,
        status: 'Cleaning',
        patientUhid: null,
        notes: 'Awaiting housekeeping prepare after ward transfer'
      };

      // Occupy new bed
      window.state.bedsStatus[freeBed] = {
        wardKey: req.targetWard,
        status: 'Occupied',
        patientUhid: req.uhid,
        notes: `Transferred from ${req.currentBed}`
      };

      // Update patient profile status keys
      var p = window.state.patients.find(pt => pt.uhid === req.uhid);
      if (p) {
        p.ward = WARD_RATES[req.targetWard].name;
        p.bed = freeBed;
        p.timelineEvents = p.timelineEvents || [];
        p.timelineEvents.unshift({
          date: new Date().toLocaleDateString('en-CA') + ' ' + new Date().toLocaleTimeString('en-US', {hour:'2-digit', minute:'2-digit'}),
          type: 'clinical',
          icon: '🔄',
          title: 'Bed Relocation Completed',
          desc: `Transferred from Bed ${req.currentBed} to Bed ${freeBed} (${p.condition || 'Stable'})`
        });
      }

      // Log movement
      window.state.logBedMovement({
        patientId: req.uhid,
        bedId: freeBed,
        wardKey: req.targetWard,
        prevStatus: 'Available',
        newStatus: 'Occupied',
        action: 'Transferred',
        remarks: `Transferred from ${req.currentBed}`
      });

      // Remove from request queue
      window.state.transferRequests.splice(index, 1);
      
      localStorage.setItem('saronil_patients', JSON.stringify(window.state.patients));
      localStorage.setItem('saronil_bedsStatus', JSON.stringify(window.state.bedsStatus));
      localStorage.setItem('saronil_transferRequests', JSON.stringify(window.state.transferRequests));
      
      alert(`✓ Bed Transfer executed successfully!\nPatient moved to ${freeBed} in ${WARD_RATES[req.targetWard].name}.`);
      
      var c = document.getElementById('main-content');
      if (c) renderWorkspace(c);
    }
  };

  window._dashboardToggleClearance = function(uhid, dept) {
    var dis = window.state.dischargeOrders.find(d => d.uhid === uhid);
    if (dis) {
      dis.clearances[dept] = !dis.clearances[dept];
      var c = document.getElementById('main-content');
      if (c) renderWorkspace(c);
    }
  };

  window._dashboardFinalizeDischarge = async function(uhid, bedId) {
    if (await customConfirm(`Confirm physical discharge for patient? (Bed ${bedId} will be released to cleaning status)`)) {
      
      // Update Bed Status to Dirty and trigger Housekeeping discharge clean
      var prevStatus = window.state.bedsStatus[bedId]?.status || 'Occupied';
      var wardKey = window.state.bedsStatus[bedId]?.wardKey || 'GENERAL-WARD-M';
      window.state.bedsStatus[bedId] = {
        wardKey: wardKey,
        status: 'Dirty',
        patientUhid: null,
        notes: 'Awaiting discharge housekeeping clean'
      };

      if (typeof window._triggerHKDischargeClean === 'function') {
        window._triggerHKDischargeClean(bedId, uhid);
      }

      window.state.logBedMovement({
        patientId: uhid,
        bedId: bedId,
        wardKey: wardKey,
        prevStatus: prevStatus,
        newStatus: 'Dirty',
        action: 'Discharge Checkout',
        user: window._ipdActiveRole || 'ATD Coordinator',
        role: window._ipdActiveRole || 'ATD Coordinator',
        remarks: `Discharge checkout finalized. Bed vacated.`
      });

      // Set Patient Discharged — stamp discharge date
      var p = window.state.patients.find(pt => pt.uhid === uhid);
      if (p) {
        p.status = 'Discharged';
        p.dischargeStatus = 'Completed';
        var now = new Date();
        p.dischargeDate = now.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
                        + ' • ' + now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

        // Add discharge timeline event with summary button marker
        p.timelineEvents = p.timelineEvents || [];
        p.timelineEvents.unshift({
          date: p.dischargeDate,
          type: 'clinical',
          icon: '🏥',
          title: 'Patient Discharged',
          desc: `Discharge finalised. Bed ${bedId} released. ${p.dischargeOrder ? 'Diagnosis: ' + (p.dischargeOrder.finalDiagnosis || 'See summary.') : ''}`,
          hasDischargeSummary: true
        });
      }

      // Complete Active Admission
      var adm = window.state.admissions && window.state.admissions.find(a => a.uhid === uhid && a.status === 'Active');
      if (adm) {
        adm.status = 'Discharged';
        adm.dischargeDate = p ? p.dischargeDate : '';
      }

      // Delete from discharge queue
      var idx = window.state.dischargeOrders.findIndex(d => d.uhid === uhid);
      if (idx !== -1) {
        window.state.dischargeOrders.splice(idx, 1);
      }

      localStorage.setItem('saronil_patients', JSON.stringify(window.state.patients));
      localStorage.setItem('saronil_admissions', JSON.stringify(window.state.admissions));
      localStorage.setItem('saronil_bedsStatus', JSON.stringify(window.state.bedsStatus));

      alert('Discharge finalized! Patient file archived successfully.');
      
      var c = document.getElementById('main-content');
      if (c) renderWorkspace(c);
    }
  };

  window.approveAllPendingDischarges = async function() {
    var targets = window.state.patients.filter(p => p.dischargeStatus === 'In Progress — Clearances Pending');
    if (targets.length === 0) {
      alert("No discharges in progress to approve.");
      return;
    }

    if (await customConfirm(`Are you sure you want to auto-approve clearances and complete physical checkout for all ${targets.length} pending discharges?`)) {
      targets.forEach(p => {
        var bedId = p.bed;
        var uhid = p.uhid;

        // Clear clearances
        p.dischargeClearances = {
          nursing: { cleared: true, clearedBy: 'System Auto-Approval', clearedAt: new Date().toISOString() },
          billing: { cleared: true, clearedBy: 'System Auto-Approval', clearedAt: new Date().toISOString() },
          pharmacy: { cleared: true, clearedBy: 'System Auto-Approval', clearedAt: new Date().toISOString() },
          tpa: { cleared: true, clearedBy: 'System Auto-Approval', clearedAt: new Date().toISOString() }
        };

        // Update Bed Status to Dirty and trigger Housekeeping discharge clean
        if (bedId && bedId !== '—') {
          var prevStatus = window.state.bedsStatus[bedId]?.status || 'Occupied';
          var wardKey = window.state.bedsStatus[bedId]?.wardKey || 'GENERAL-WARD-M';
          window.state.bedsStatus[bedId] = {
            wardKey: wardKey,
            status: 'Dirty',
            patientUhid: null,
            notes: 'Awaiting discharge housekeeping clean'
          };
          if (typeof window._triggerHKDischargeClean === 'function') {
            window._triggerHKDischargeClean(bedId, uhid);
          }
          window.state.logBedMovement({
            patientId: uhid,
            bedId: bedId,
            wardKey: wardKey,
            prevStatus: prevStatus,
            newStatus: 'Dirty',
            action: 'Discharge Checkout',
            user: window._ipdActiveRole || 'ATD Coordinator',
            role: window._ipdActiveRole || 'ATD Coordinator',
            remarks: `Auto-approved discharge clearances. Bed vacated.`
          });
        }

        // Set Patient Discharged
        p.status = 'Discharged';
        p.dischargeStatus = 'Completed';
        var now = new Date();
        p.dischargeDate = now.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
                        + ' • ' + now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

        // Add timeline event
        p.timelineEvents = p.timelineEvents || [];
        p.timelineEvents.unshift({
          date: p.dischargeDate,
          type: 'clinical',
          icon: '🏥',
          title: 'Patient Discharged (Auto)',
          desc: `Discharge finalised via system auto-approval. Bed ${bedId} released.`,
          hasDischargeSummary: true
        });

        // Complete Active Admission
        var adm = window.state.admissions && window.state.admissions.find(a => a.uhid === uhid && a.status === 'Active');
        if (adm) {
          adm.status = 'Discharged';
          adm.dischargeDate = p.dischargeDate;
        }

        // Delete from discharge queue
        if (window.state.dischargeOrders) {
          var idx = window.state.dischargeOrders.findIndex(d => d.uhid === uhid);
          if (idx !== -1) {
            window.state.dischargeOrders.splice(idx, 1);
          }
        }
      });

      localStorage.setItem('saronil_patients', JSON.stringify(window.state.patients));
      localStorage.setItem('saronil_admissions', JSON.stringify(window.state.admissions));
      localStorage.setItem('saronil_bedsStatus', JSON.stringify(window.state.bedsStatus));

      alert(`Successfully finalized discharge and released beds for ${targets.length} patients!`);

      var c = document.getElementById('main-content');
      if (c) renderWorkspace(c);
    }
  };


  window._dashboardEscalate = function(name, type) {
    alert(`🚨 Escalation ALERT raised to Clinical Director for delayed ${type} of patient: ${name}.`);
  };

  function renderDashboardBedBoard() {
    var wards = window.state.wards || {};
    var isNurse = window._ipdActiveRole === 'Ward Nurse';

    var bedBoardGridHTML = Object.entries(wards).map(function([key, val]) {
      // Restricted scope checks
      if (isNurse && key !== 'GENERAL-WARD-M') return '';
      if (_gridWardFilter !== 'All' && key !== _gridWardFilter) return '';

      var beds = val.beds || [];
      
      // Filter cards by status & search
      var displayBeds = beds.filter(b => {
        var s = window.state.bedsStatus[b] || { status: 'Available' };
        
        // Status filter
        if (_gridStatusFilter !== 'All' && s.status !== _gridStatusFilter) return false;
        
        // Search filter
        if (_gridSearchFilter.trim() !== '') {
          var q = _gridSearchFilter.toLowerCase();
          if (s.status === 'Occupied' && s.patientUhid) {
            var p = window.state.patients.find(pt => pt.uhid === s.patientUhid);
            if (p) {
              var nameMatch = p.name.toLowerCase().includes(q);
              var uhidMatch = p.uhid.toLowerCase().includes(q);
              return nameMatch || uhidMatch;
            }
          } else if (s.status === 'Reserved' && s.notes) {
            return s.notes.toLowerCase().includes(q);
          }
          return b.toLowerCase().includes(q);
        }

        return true;
      });

      if (displayBeds.length === 0 && (_gridStatusFilter !== 'All' || _gridSearchFilter.trim() !== '')) {
        return ''; // Hide ward section if filters yield empty
      }

      return `
        <div style="margin-bottom: 24px; border-bottom: 1px solid var(--border-color); padding-bottom: 20px;">
          <div style="font-size: 14px; font-weight: 700; color: #1e293b; margin-bottom: 12px; margin-top: 8px;">
            ${val.name} <span style="font-weight: 500; color: #64748b; font-size: 12px; margin-left: 4px;">(${fmtMoney(WARD_RATES[key]?.rate || 1500)}/day)</span>
          </div>
          
          <div class="ipd-bed-grid-container" style="display: grid; grid-template-columns: repeat(6, minmax(0, 1fr)); gap: 8px; margin-top: 10px;">
            ${displayBeds.map(b => renderBedCardHTML(b, key)).join('')}
          </div>
        </div>
      `;
    }).join('');

    return `
      <div class="admin-card" style="margin-top: 0;">
        <div class="er-card-hdr" style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-color); padding-bottom: 12px; margin-bottom: 16px;">
          <h3 style="color:#1e3a8a; margin: 0; display: flex; align-items: center; gap: 8px;">
            <span>🛏️</span> <span>Real-Time Facility Bed Board</span>
          </h3>
          <div style="display: flex; align-items: center; gap: 15px;">
            <span style="font-size: 11px; color: var(--text-muted);">Click vacant beds to admit, occupied beds to view EMR details.</span>
            <button onclick="window._showBedLogsPopup()" class="btn btn-primary" style="padding: 6px 12px; font-size: 11px; background: #7c3aed; border-color: #7c3aed; font-weight: 700; height: auto; border-radius: 6px; cursor: pointer; display: flex; align-items: center; gap: 6px; box-shadow: 0 2px 4px rgba(124, 58, 237, 0.15);">
              <span>📋</span> <span>View Log</span>
            </button>
          </div>
        </div>
        
        <!-- Filter Bar -->
        <div style="background:#f8fafc; border: 1px solid var(--border-color); padding: 12px 18px; border-radius: 8px; margin-bottom: 20px; display:flex; gap:12px; align-items:center; flex-wrap:wrap;">
          <div class="er-field" style="margin:0;">
            <select class="er-select" style="padding: 6px 12px; font-size:12px;" onchange="window._gridSetWard(this.value)">
              <option value="All" ${_gridWardFilter === 'All' ? 'selected' : ''}>All Wards</option>
              ${Object.entries(wards).map(function([key, val]) {
                if (isNurse && key !== 'GENERAL-WARD-M') return '';
                return `<option value="${key}" ${key === _gridWardFilter ? 'selected' : ''}>${val.name}</option>`;
              }).join('')}
            </select>
          </div>
          <div class="er-field" style="margin:0;">
            <select class="er-select" style="padding: 6px 12px; font-size:12px;" onchange="window._gridSetStatus(this.value)">
              <option value="All" ${_gridStatusFilter === 'All' ? 'selected' : ''}>All Statuses</option>
              <option value="Occupied" ${_gridStatusFilter === 'Occupied' ? 'selected' : ''}>Occupied</option>
              <option value="Available" ${_gridStatusFilter === 'Available' ? 'selected' : ''}>Available</option>
              <option value="Cleaning" ${_gridStatusFilter === 'Cleaning' ? 'selected' : ''}>Under Housekeeping</option>
              <option value="Reserved" ${_gridStatusFilter === 'Reserved' ? 'selected' : ''}>Reserved</option>
            </select>
          </div>
          <div class="er-field" style="margin:0; flex:1; min-width:200px;">
            <input type="text" id="ipd-grid-search" class="er-input" style="padding: 6px 12px; font-size:12px;" placeholder="Search Patient name or UHID..." value="${_gridSearchFilter}" oninput="window._gridSetSearch(this.value)">
          </div>
        </div>

        <div style="background: white; border: 1px solid var(--border-color); border-radius: 8px; padding: 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.02);">
          ${bedBoardGridHTML || '<div style="text-align:center; padding:50px; color:#64748b;">No beds matching filter constraints.</div>'}
        </div>
      </div>
    `;
  }

  window._dashboardRouteWard = function(wardKey) {
    _gridWardFilter = wardKey;
    _activeTab = 'dashboard';
    var c = document.getElementById('main-content');
    if (c) renderWorkspace(c);
  };

  window._gridSetWard = function(val) {
    _gridWardFilter = val;
    var c = document.getElementById('main-content');
    if (c) renderWorkspace(c);
  };

  window._gridSetStatus = function(val) {
    _gridStatusFilter = val;
    var c = document.getElementById('main-content');
    if (c) renderWorkspace(c);
  };

  window._gridSetSearch = function(val) {
    _gridSearchFilter = val;
    var c = document.getElementById('main-content');
    if (c) renderWorkspace(c);
  };

  function renderBedCardHTML(bedId, wardKey) {
    var s = window.state.bedsStatus[bedId] || { status: 'Available' };
    var status = s.status;
    var role = window._ipdActiveRole;

    var formattedBedId = bedId;
    if (bedId.startsWith('GW(M)-')) {
      formattedBedId = 'GW(Male) - ' + bedId.substring(6);
    } else if (bedId.startsWith('GW(F)-')) {
      formattedBedId = 'GW(Female) - ' + bedId.substring(6);
    } else {
      var parts = bedId.split('-');
      if (parts.length === 2) {
        formattedBedId = parts[0] + ' - ' + parts[1];
      }
    }

    var borderStyle = '';
    var badgeBg = '';
    var statusText = '';
    var patientNameHTML = '';
    var onClickAction = '';

    if (status === 'Occupied') {
      var p = window.state.patients.find(pt => pt.uhid === s.patientUhid) || { name: 'Trauma Patient', uhid: s.patientUhid || 'SH-2026-00000' };
      if (p.dischargeStatus === 'In Progress — Clearances Pending') {
        borderStyle = 'border: 2px solid #f97316;';
        badgeBg = '#f97316';
        statusText = 'Discharge in process';
      } else {
        borderStyle = 'border: 2px solid #334155;';
        badgeBg = '#334155';
        statusText = 'Occupied';
      }
      patientNameHTML = `
        <div style="font-size: 13px; font-weight: 800; color: #000; margin-top: 6px; font-family: sans-serif; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${p.name}">${p.name}</div>
        <div style="font-size: 11px; color: #4b5563; margin-top: 1px; font-family: sans-serif;">${p.uhid}</div>
      `;
      onClickAction = `onclick="window.openBedModal('${bedId}')"`;
    } else if (status === 'Available') {
      borderStyle = 'border: 2px solid #10b981;';
      badgeBg = '#10b981';
      statusText = 'Available';
      patientNameHTML = `
        <div style="font-size: 13px; font-weight: 800; color: #94a3b8; margin-top: 6px; font-family: sans-serif;">No Patient</div>
        <div style="font-size: 11px; color: #94a3b8; margin-top: 1px; font-family: sans-serif;">Vacant</div>
      `;
      onClickAction = `onclick="window._bedOpenQuickAssign('${bedId}')"`;
    } else if (status === 'Cleaning') {
      borderStyle = 'border: 2px solid #f59e0b;';
      badgeBg = '#f59e0b';
      statusText = 'Cleaning';
      patientNameHTML = `
        <div style="font-size: 13px; font-weight: 800; color: #d97706; margin-top: 6px; font-family: sans-serif;">Sanitizing</div>
        <div style="font-size: 11px; color: #d97706; margin-top: 1px; font-family: sans-serif;">Housekeeping</div>
      `;
      onClickAction = `onclick="window._bedMarkReady('${bedId}', '${wardKey}')"`;
    } else if (status === 'Reserved') {
      borderStyle = 'border: 2px solid #8b5cf6;';
      badgeBg = '#8b5cf6';
      statusText = 'Reserved';
      patientNameHTML = `
        <div style="font-size: 13px; font-weight: 800; color: #7c3aed; margin-top: 6px; font-family: sans-serif; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">Reserved</div>
        <div style="font-size: 11px; color: #7c3aed; margin-top: 1px; font-family: sans-serif; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${s.notes || 'Pending Admit'}">${s.notes || 'Pending Admit'}</div>
      `;
      onClickAction = `onclick="window._bedReleaseReservation('${bedId}', '${wardKey}')"`;
    } else if (status === 'Dirty') {
      borderStyle = 'border: 2px dashed #ef4444;';
      badgeBg = '#ef4444';
      statusText = 'Dirty';
      patientNameHTML = `
        <div style="font-size: 13px; font-weight: 800; color: #ef4444; margin-top: 6px; font-family: sans-serif;">Dirty</div>
        <div style="font-size: 11px; color: #ef4444; margin-top: 1px; font-family: sans-serif;">Awaiting Clean</div>
      `;
      onClickAction = `onclick="window._handleDirtyBedClick('${bedId}', '${wardKey}')"`;
    } else if (status === 'Blocked') {
      borderStyle = 'border: 2px solid #64748b;';
      badgeBg = '#64748b';
      statusText = 'Blocked';
      patientNameHTML = `
        <div style="font-size: 13px; font-weight: 800; color: #64748b; margin-top: 6px; font-family: sans-serif;">Blocked</div>
        <div style="font-size: 11px; color: #64748b; margin-top: 1px; font-family: sans-serif;">Out of Service</div>
      `;
      onClickAction = `onclick="alert('Bed ${bedId} is blocked for maintenance.')"`;
    }

    return `
      <div ${onClickAction} style="background: white; border-radius: 12px; padding: 10px 12px; min-height: 85px; display: flex; flex-direction: column; cursor: pointer; transition: all 0.2s; box-shadow: none; box-sizing: border-box; ${borderStyle}">
        <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
          <span style="font-size: 13px; font-weight: 800; color: #000; font-family: sans-serif;">${formattedBedId}</span>
          <span style="font-size: 15px;">🛏️</span>
        </div>
        <div style="text-align: left; margin-top: 4px; margin-bottom: 2px;">
          <span style="background: ${badgeBg}; color: white; padding: 2px 8px; border-radius: 20px; font-size: 9px; font-weight: 700; display: inline-block; font-family: sans-serif;">${statusText}</span>
        </div>
        <div style="text-align: left;">
          ${patientNameHTML}
        </div>
      </div>
    `;
  }

  /* ── SCREEN 2 SLIDE-IN: DETAIL DRAWER ───────────────────────── */
  function renderRightDrawerHTML() {
    if (!_drawerOpen || !_drawerPatientUhid) {
      return '<div class="p-6 text-center text-slate-400">Awaiting selection...</div>';
    }

    var p = window.state.patients.find(pt => pt.uhid === _drawerPatientUhid) || { name: 'Trauma Patient', uhid: _drawerPatientUhid, admitted: getTodayStr(), primaryConsultant: 'Dr. Ramesh Kumar', clinicalData: { diagnosis: 'None' } };
    var role = window._ipdActiveRole;
    var dis = window.state.dischargeOrders.find(d => d.uhid === p.uhid);

    var bedId = p.bed || _drawerBedId;
    var s = window.state.bedsStatus[bedId] || { status: 'Occupied', wardKey: 'GENERAL-WARD-M' };
    var wardKey = s.wardKey || 'GENERAL-WARD-M';
    var wardName = WARD_RATES[wardKey]?.name || 'General Ward (Male)';
    var tariffStr = fmtMoney(WARD_RATES[wardKey]?.rate || 1500) + '/day';

    var formattedBedId = bedId;
    if (bedId.startsWith('GW(M)-')) {
      formattedBedId = 'GW(M)-' + bedId.substring(6);
    } else if (bedId.startsWith('GW(F)-')) {
      formattedBedId = 'GW(F)-' + bedId.substring(6);
    }

    // Query active diet
    var activeDiet = 'Regular Diet';
    if (window.state.dietData && window.state.dietData.patients) {
      var dp = window.state.dietData.patients.find(pt => pt.uhid === p.uhid);
      if (dp) {
        activeDiet = dp.dietRx;
      }
    }

    // Dynamic Action Buttons
    var actionButtonsHTML = '';
    
    // Button 1: Transfer Bed
    actionButtonsHTML += `<button class="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition-all duration-150 mb-2 flex items-center justify-center gap-2 cursor-pointer" onclick="window._bedOpenTransfer('${p.uhid}', '${bedId}')">Transfer Bed</button>`;

    // Button 2: Approve Discharge & Initiate Billing
    if (role === 'Treating Consultant / Doctor' && !dis) {
      actionButtonsHTML += `<button class="w-full py-2.5 px-4 bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 hover:text-red-700 rounded-xl text-sm font-bold shadow-sm transition-all duration-150 mb-2 flex items-center justify-center gap-2 cursor-pointer" onclick="window._bedIssueDischarge('${p.uhid}')">Approve Discharge & Initiate Billing</button>`;
    } else if (role === 'ATD Coordinator' && dis) {
      var allCleared = dis.clearances.nursing && dis.clearances.billing && dis.clearances.pharmacy && dis.clearances.tpa;
      actionButtonsHTML += `
        <button class="w-full py-2.5 px-4 bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 hover:text-red-700 rounded-xl text-sm font-bold shadow-sm transition-all duration-150 mb-2 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed" ${allCleared ? '' : 'disabled'} onclick="window._dashboardFinalizeDischarge('${p.uhid}', '${bedId}')">
          Approve Discharge & Initiate Billing
        </button>
      `;
    } else {
      actionButtonsHTML += `<button class="w-full py-2.5 px-4 bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 hover:text-red-700 rounded-xl text-sm font-bold shadow-sm transition-all duration-150 mb-2 flex items-center justify-center gap-2 cursor-pointer" onclick="window._bedIssueDischarge('${p.uhid}')">Approve Discharge & Initiate Billing</button>`;
    }

    // Button 3: Send to House Keeping
    actionButtonsHTML += `<button class="w-full py-2.5 px-4 bg-white hover:bg-slate-50 border border-slate-200 text-slate-500 hover:text-slate-700 rounded-xl text-sm font-bold shadow-sm transition-colors duration-150 flex items-center justify-center gap-2 cursor-pointer" onclick="window._bedSendToHousekeeping('${bedId}', '${wardKey}')">Send to House Keeping</button>`;

    // Format admitted date
    var admittedDateStr = '2026-06-20';
    if (p.admitted && !isNaN(new Date(p.admitted).getTime())) {
      var dObj = new Date(p.admitted);
      var y = dObj.getFullYear();
      var m = String(dObj.getMonth() + 1).padStart(2, '0');
      var d = String(dObj.getDate()).padStart(2, '0');
      admittedDateStr = `${y}-${m}-${d}`;
    }

    return `
      <!-- Header -->
      <div class="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center">
        <h3 class="margin-0 text-slate-800 text-[17px] font-bold">Bed Action: ${formattedBedId}</h3>
        <button class="ipd-drawer-close text-slate-400 hover:text-slate-600 text-xl font-bold cursor-pointer transition-colors duration-150" onclick="window._drawerClose()">✕</button>
      </div>

      <!-- Body -->
      <div class="p-6 overflow-y-auto flex-1 flex flex-col gap-4 box-sizing-border-box text-left">
        
        <!-- Bed Info -->
        <div class="flex flex-col gap-1 text-sm">
          <div>
            <span class="font-bold text-slate-700">Ward Room:</span>
            <span class="font-medium text-slate-600">${wardName}</span>
          </div>
          <div>
            <span class="font-bold text-slate-700">Daily Tariff:</span>
            <span class="font-medium text-slate-600">${tariffStr}</span>
          </div>
          <div>
            <span class="font-bold text-slate-700">Current Status:</span>
            <span class="font-medium text-slate-600">${s.status}</span>
          </div>
        </div>

        <!-- Patient Info Card -->
        <div class="bg-blue-50/30 rounded-xl p-4.5 border border-blue-100/50 flex flex-col gap-1 text-sm">
          <div class="text-blue-600 font-bold text-base mb-1.5">Patient Information</div>
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <div>
              <span class="font-bold text-slate-700">Name:</span>
              <span class="font-bold text-blue-600">${p.name}</span>
            </div>
            <button class="btn btn-xs btn-primary" onclick="event.stopPropagation(); window.router.navigate('patients?uhid=${p.uhid}');" style="padding: 2px 8px; font-size: 10px; font-weight: 700; background: var(--primary); border: none; border-radius: 6px; color: white; cursor: pointer;">
              View Details ➔
            </button>
          </div>
          <div>
            <span class="font-bold text-slate-700">UHID:</span>
            <span class="font-medium text-slate-600">${p.uhid}</span>
          </div>
          <div>
            <span class="font-bold text-slate-700">Admitted Date:</span>
            <span class="font-medium text-slate-600">${admittedDateStr}</span>
          </div>
          <div>
            <span class="font-bold text-slate-700">Doctor In-charge:</span>
            <span class="font-medium text-slate-600">${p.primaryConsultant || 'Dr. Ramesh Kumar'}</span>
          </div>
          <div>
            <span class="font-bold text-slate-700">Diagnosis:</span>
            <span class="font-medium text-slate-600">${p.clinicalData?.diagnosis || 'None'}</span>
          </div>
        </div>



        <!-- Buttons Section -->
        <div class="mt-2 flex flex-col gap-2">
          ${actionButtonsHTML}
        </div>

      </div>
    `;
  }

  window._drawerOpenDetails = function(uhid, bedId) {
    _drawerOpen = true;
    _drawerPatientUhid = uhid;
    _drawerBedId = bedId;
    var c = document.getElementById('main-content');
    if (c) renderWorkspace(c);
  };

  window.openBedModal = function(bedId) {
    var s = window.state.bedsStatus[bedId];
    if (s && s.patientUhid) {
      window._drawerOpenDetails(s.patientUhid, bedId);
    } else {
      window._bedOpenQuickAssign(bedId);
    }
  };

  window._drawerClose = function() {
    _drawerOpen = false;
    var c = document.getElementById('main-content');
    if (c) renderWorkspace(c);
  };

  window._updatePatientDietFromDrawer = function(uhid, newDiet) {
    var p = window.state.patients.find(pt => pt.uhid === uhid);
    if (p) {
      if (!p.clinicalData) p.clinicalData = {};
      p.clinicalData.carePlan = `Follow ${newDiet}. Daily walking for 30 minutes. Monitor blood pressure charts.`;
    }

    if (!window.state.dietData) {
      window.state.dietData = { patients: [], screeningQueue: [], counsellingQueue: [], kitchenDispatches: [], activeNPOAlerts: [], dietOrdersCount: 42 };
    }
    
    var dp = window.state.dietData.patients.find(pt => pt.uhid === uhid);
    if (dp) {
      dp.dietRx = newDiet;
      dp.status = newDiet.includes('NPO') ? 'NPO Lock' : 'Active';
    } else {
      window.state.dietData.patients.push({
        name: p ? p.name : "Patient",
        uhid: uhid,
        bed: p ? p.bed : "Ward",
        diagnosis: (p && p.clinicalData) ? p.clinicalData.diagnosis : "IPD Admitted",
        dietRx: newDiet,
        lastReview: "Today",
        status: newDiet.includes('NPO') ? 'NPO Lock' : 'Active',
        energy: 1800, protein: 70, fluid: 1500, route: "Oral",
        prepBy: "Doctor IPD Drawer",
        preferences: "Veg",
        allergies: "None",
        mealStats: { breakfast: "—", lunch: "—", dinner: "—" }
      });
    }

    window.state.dietData.dietOrdersCount = window.state.dietData.patients.length + 35;

    if (newDiet.includes('NPO')) {
      var npoAlertExists = window.state.dietData.activeNPOAlerts.some(n => n.uhid === uhid);
      if (!npoAlertExists) {
        window.state.dietData.activeNPOAlerts.unshift({
          name: p ? p.name : "Patient",
          uhid: uhid,
          bed: p ? p.bed : "Ward Room",
          duration: `8 hrs`,
          ivFluids: "No",
          status: "Warning Alert"
        });
      }
    } else {
      window.state.dietData.activeNPOAlerts = window.state.dietData.activeNPOAlerts.filter(n => n.uhid !== uhid);
    }

    alert(`Diet order updated to ${newDiet} for patient ${p ? p.name : uhid}. Same will reflect in Diet & Nutrition module.`);
    
    var c = document.getElementById('main-content');
    if (c) renderWorkspace(c);
  };

  window._drawerNavigatePatient360 = function(uhid) {
    const pat = (window.state.patients || []).find(p => p.uhid === uhid);
    const nameParam = pat ? '&name=' + encodeURIComponent(pat.name) : '';
    window.router.navigate('patients?uhid=' + uhid + nameParam);
  };

  window._drawerAddNursingNote = async function(uhid) {
    var txt = await customPrompt('Enter nursing observation note:');
    if (txt) {
      alert('Nursing Note added to patient chart timeline.');
    }
  };

  /* ── SCREEN 5: BED MANAGEMENT ───────────────────────────────── */
  function renderBedManagementScreen() {
    var wards = window.state.wards || {};
    var isNurse = window._ipdActiveRole === 'Ward Nurse';

    return `
      <div class="admin-card" style="margin-bottom:20px;">
        <div class="er-card-hdr">
          <h3 style="color:#1e3a8a;">⚙️ Bed Master Grid & Maintenance Operations</h3>
        </div>
        <div class="er-card-body" style="padding:16px;">
          <p style="font-size:12px; color:var(--text-secondary); margin:0 0 16px 0;">
            Administrators and Nursing Supervisors can add new beds, de-activate beds, or block rooms for sanitization/routine maintenance below.
          </p>

          <!-- Add Bed Master Form (Admin role) -->
          ${window._ipdActiveRole === 'Administrator / Medical Superintendent' ? `
            <div style="background:#f8fafc; border:1px solid #cbd5e1; border-radius:8px; padding:16px; margin-bottom:20px;">
              <h5 style="margin:0 0 12px 0; font-size:12px; color:#1e3a8a; font-weight:800;">➕ ADD NEW BED TO MASTER REGISTRY</h5>
              <div style="display:grid; grid-template-columns: repeat(4, 1fr); gap:12px; align-items:flex-end;">
                <div class="er-field" style="margin:0;">
                  <div class="er-label">Select Ward</div>
                  <select class="er-select" id="new-bed-ward">
                    ${Object.entries(wards).map(([k, v]) => `<option value="${k}">${v.name}</option>`).join('')}
                  </select>
                </div>
                <div class="er-field" style="margin:0;">
                  <div class="er-label">Bed Number</div>
                  <input type="text" class="er-input" id="new-bed-no" placeholder="e.g. GW(M)-425">
                </div>
                <div class="er-field" style="margin:0;">
                  <div class="er-label">Category Rate / day</div>
                  <input type="number" class="er-input" id="new-bed-rate" placeholder="₹ Rate">
                </div>
                <button class="btn btn-primary" style="background:#7c3aed; height:34px; padding:0 12px;" onclick="window._bedMgmtAddBed()">Save Bed</button>
              </div>
            </div>
          ` : ''}

          <!-- Live Bed Audit / Deactivation lists -->
          <table class="custom-table" style="width:100%; border-collapse:collapse; font-size:12px;">
            <thead>
              <tr style="background:#f8fafc; border-bottom:1px solid #e2e8f0; text-align:left;">
                <th style="padding:10px;">Bed Number</th>
                <th style="padding:10px;">Ward category</th>
                <th style="padding:10px;">Current status</th>
                <th style="padding:10px;">Audit remarks</th>
                <th style="padding:10px; text-align:right;">Operations</th>
              </tr>
            </thead>
            <tbody>
              ${Object.entries(wards).map(function([wk, wv]) {
                return (wv.beds || []).map(b => {
                  var s = window.state.bedsStatus[b] || { status: 'Available' };
                  var status = s.status;
                  
                  var actionBtn = '';
                  if (status === 'Available') {
                    actionBtn = `
                      <button class="ipd-bed-btn" onclick="window._bedMgmtBlock('${b}', true)">Block Maintenance</button>
                      <button class="ipd-bed-btn ipd-bed-btn-primary" onclick="window._bedMgmtReserve('${b}')">Reserve Bed</button>
                    `;
                  } else if (status === 'Cleaning') {
                    actionBtn = `<button class="ipd-bed-btn ipd-bed-btn-primary" onclick="window._bedMarkReady('${b}', '${wk}')">Mark Ready</button>`;
                  } else if (status === 'Reserved') {
                    actionBtn = `<button class="ipd-bed-btn ipd-bed-btn-danger" onclick="window._bedReleaseReservation('${b}', '${wk}')">Release Reservation</button>`;
                  } else {
                    actionBtn = `<span style="color:var(--text-muted); font-size:11px;">Occupied by EMR</span>`;
                  }

                  return `
                    <tr style="border-bottom:1px solid #f1f5f9;">
                      <td style="padding:8px 10px;"><strong>${b}</strong></td>
                      <td style="padding:8px 10px;">${wv.name}</td>
                      <td style="padding:8px 10px;">
                        <span class="reg-badge" style="background:${status === 'Available' ? '#ecfdf5' : (status === 'Occupied' ? '#eff6ff' : '#fffbeb')}; color:${status === 'Available' ? '#047857' : (status === 'Occupied' ? '#1e40af' : '#d97706')};">
                          ${status}
                        </span>
                      </td>
                      <td style="padding:8px 10px; color:var(--text-secondary); max-width:200px; text-overflow:ellipsis; overflow:hidden; white-space:nowrap;">
                        ${s.notes || 'Routine Clinical Operations'}
                      </td>
                      <td style="padding:8px 10px; text-align:right; display:flex; gap:4px; justify-content:flex-end;">
                        ${actionBtn}
                      </td>
                    </tr>
                  `;
                }).join('');
              }).join('')}
            </tbody>
          </table>

        </div>
      </div>
    `;
  }

  window._bedMgmtAddBed = function() {
    var ward = document.getElementById('new-bed-ward').value;
    var no = document.getElementById('new-bed-no').value.trim();
    var rate = document.getElementById('new-bed-rate').value.trim();

    if (!no) { alert('Please enter bed identifier number.'); return; }
    if (!rate) { alert('Please enter daily rent rate.'); return; }

    window.state.wards[ward].beds.push(no);
    window.state.bedsStatus[no] = {
      wardKey: ward,
      status: 'Available',
      patientUhid: null,
      notes: 'Initial master registry allocation'
    };

    localStorage.setItem('saronil_bedsStatus', JSON.stringify(window.state.bedsStatus));
    
    alert(`✓ Bed ${no} registered in category ${ward} successfully!`);
    
    var c = document.getElementById('main-content');
    if (c) renderWorkspace(c);
  };

  window._bedMgmtBlock = async function(bedId, block) {
    if (block) {
      var reason = await customPrompt('Please enter maintenance block reason:');
      if (reason) {
        window.state.bedsStatus[bedId] = {
          wardKey: window.state.bedsStatus[bedId].wardKey,
          status: 'Cleaning',
          patientUhid: null,
          notes: 'Maintenance: ' + reason
        };
        alert(`Bed ${bedId} blocked for maintenance.`);
      }
    }
    localStorage.setItem('saronil_bedsStatus', JSON.stringify(window.state.bedsStatus));
    var c = document.getElementById('main-content');
    if (c) renderWorkspace(c);
  };

  window._bedMgmtReserve = async function(bedId) {
    var name = await customPrompt('Reserve bed for patient (Full Name):');
    if (name) {
      window.state.bedsStatus[bedId] = {
        wardKey: window.state.bedsStatus[bedId].wardKey,
        status: 'Reserved',
        patientUhid: null,
        notes: 'Reserved for: ' + name
      };
      localStorage.setItem('saronil_bedsStatus', JSON.stringify(window.state.bedsStatus));
      alert(`Bed ${bedId} reserved for ${name}.`);
      var c = document.getElementById('main-content');
      if (c) renderWorkspace(c);
    }
  };

  /* ── VISUAL BED grid operations ────────────────────────────── */
  window._bedMarkReady = function(bedId, wardKey) {
    var prevStatus = window.state.bedsStatus[bedId]?.status || 'Dirty';
    window.state.bedsStatus[bedId] = {
      wardKey: wardKey,
      status: 'Available',
      patientUhid: null,
      notes: ''
    };
    localStorage.setItem('saronil_bedsStatus', JSON.stringify(window.state.bedsStatus));
    window.state.logBedMovement({
      patientId: null,
      bedId: bedId,
      wardKey: wardKey,
      prevStatus: prevStatus,
      newStatus: 'Available',
      action: 'Clean Verified',
      user: window._ipdActiveRole || 'ATD Coordinator',
      role: window._ipdActiveRole || 'ATD Coordinator',
      remarks: 'Bed clean verified. Returned to service.'
    });
    if (typeof window.state.completeHousekeepingTasks === 'function') {
      window.state.completeHousekeepingTasks(bedId);
    }
    alert(`Bed ${bedId} cleared and returned to Available.`);
    var c = document.getElementById('main-content');
    if (c) renderWorkspace(c);
  };

  window._bedReleaseReservation = function(bedId, wardKey) {
    var prevStatus = window.state.bedsStatus[bedId]?.status || 'Reserved';
    window.state.bedsStatus[bedId] = {
      wardKey: wardKey,
      status: 'Available',
      patientUhid: null,
      notes: ''
    };
    localStorage.setItem('saronil_bedsStatus', JSON.stringify(window.state.bedsStatus));
    window.state.logBedMovement({
      patientId: null,
      bedId: bedId,
      wardKey: wardKey,
      prevStatus: prevStatus,
      newStatus: 'Available',
      action: 'Release Reservation',
      user: window._ipdActiveRole || 'ATD Coordinator',
      role: window._ipdActiveRole || 'ATD Coordinator',
      remarks: 'Reservation released manually.'
    });
    alert(`Reservation released on bed ${bedId}.`);
    var c = document.getElementById('main-content');
    if (c) renderWorkspace(c);
  };

  window._bedSendToHousekeeping = async function(bedId, wardKey) {
    if (await customConfirm(`Are you sure you want to manually vacate Bed ${bedId} and send it to Housekeeping?`)) {
      var prevStatus = window.state.bedsStatus[bedId]?.status || 'Available';
      window.state.bedsStatus[bedId] = {
        wardKey: wardKey,
        status: 'Cleaning',
        patientUhid: null,
        notes: 'Routine cleaning post override request'
      };
      localStorage.setItem('saronil_bedsStatus', JSON.stringify(window.state.bedsStatus));
      window.state.triggerHousekeepingRequest(bedId, wardKey, 'Routine cleaning post override request');
      window.state.logBedMovement({
        patientId: null,
        bedId: bedId,
        wardKey: wardKey,
        prevStatus: prevStatus,
        newStatus: 'Cleaning',
        action: 'Housekeeping',
        user: window._ipdActiveRole || 'ATD Coordinator',
        role: window._ipdActiveRole || 'ATD Coordinator',
        remarks: 'Sent to Housekeeping manually.'
      });
      _drawerOpen = false;
      alert(`Bed ${bedId} has been sent to Housekeeping.`);
      var c = document.getElementById('main-content');
      if (c) renderWorkspace(c);
    }
  };

  window._handleDirtyBedClick = function(bedId, wardKey) {
    const overlay = document.createElement('div');
    overlay.className = 'custom-dialog-overlay';
    overlay.id = 'dirty-bed-modal-overlay';
    overlay.style.cssText = 'position:fixed; inset:0; background:rgba(15,23,42,0.6); backdrop-filter:blur(4px); z-index:9999; display:flex; align-items:center; justify-content:center;';
    
    overlay.innerHTML = `
      <div class="custom-dialog-box" style="background:#fff; border-radius:12px; box-shadow:0 20px 25px -5px rgba(0,0,0,0.1); width:420px; max-width:90vw; display:flex; flex-direction:column; overflow:hidden; border:1px solid #e2e8f0; font-family:sans-serif;">
        <div class="custom-dialog-header" style="padding:20px 24px 12px; display:flex; align-items:center; gap:12px;">
          <span style="font-size:24px;">ℹ️</span>
          <h4 style="margin:0; font-size:16px; font-weight:700; color:#1e293b;">Information</h4>
        </div>
        <div class="custom-dialog-body" style="padding:8px 24px 24px; font-size:14px; color:#475569; line-height:1.5; text-align:left;">
          Bed ${bedId} is dirty. Please assign a cleaning task in the Housekeeping module.
        </div>
        <div class="custom-dialog-footer" style="padding:16px 24px; border-top:1px solid #f1f5f9; display:flex; justify-content:flex-end; gap:8px; background:#f8fafc;">
          <button class="custom-dialog-btn" style="background:#2563eb; color:#fff; font-weight:600; padding:8px 16px; border-radius:6px; border:none; cursor:pointer; font-size:13px;" onclick="window._dirtyBedAssignHousekeeping('${bedId}', '${wardKey}')">Assign to Housekeeping</button>
          <button class="custom-dialog-btn" style="background:#ef4444; color:#fff; font-weight:600; padding:8px 16px; border-radius:6px; border:none; cursor:pointer; font-size:13px;" onclick="window._dirtyBedAssignMaintenance('${bedId}', '${wardKey}')">Assign for Maintenance</button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);
  };

  window._dirtyBedAssignHousekeeping = function(bedId, wardKey) {
    const overlay = document.getElementById('dirty-bed-modal-overlay');
    if (overlay) overlay.remove();
    
    var prevStatus = window.state.bedsStatus[bedId]?.status || 'Dirty';
    window.state.bedsStatus[bedId] = {
      wardKey: wardKey,
      status: 'Cleaning',
      patientUhid: null,
      notes: 'Routine cleaning assigned post checkout'
    };
    localStorage.setItem('saronil_bedsStatus', JSON.stringify(window.state.bedsStatus));
    
    if (typeof window.state.triggerHousekeepingRequest === 'function') {
      window.state.triggerHousekeepingRequest(bedId, wardKey, 'Routine cleaning assigned post checkout');
    }
    
    window.state.logBedMovement({
      patientId: null,
      bedId: bedId,
      wardKey: wardKey,
      prevStatus: prevStatus,
      newStatus: 'Cleaning',
      action: 'Housekeeping',
      user: window._ipdActiveRole || 'ATD Coordinator',
      role: window._ipdActiveRole || 'ATD Coordinator',
      remarks: 'Sent to Housekeeping manually.'
    });
    
    alert(`Bed ${bedId} has been sent to Housekeeping.`);
    var c = document.getElementById('main-content');
    if (c) renderWorkspace(c);
  };

  window._dirtyBedAssignMaintenance = function(bedId, wardKey) {
    const overlay = document.getElementById('dirty-bed-modal-overlay');
    if (overlay) overlay.remove();
    
    var prevStatus = window.state.bedsStatus[bedId]?.status || 'Dirty';
    window.state.bedsStatus[bedId] = {
      wardKey: wardKey,
      status: 'Blocked',
      patientUhid: null,
      notes: 'Blocked for maintenance'
    };
    localStorage.setItem('saronil_bedsStatus', JSON.stringify(window.state.bedsStatus));
    
    window.state.logBedMovement({
      patientId: null,
      bedId: bedId,
      wardKey: wardKey,
      prevStatus: prevStatus,
      newStatus: 'Blocked',
      action: 'Maintenance Block',
      user: window._ipdActiveRole || 'ATD Coordinator',
      role: window._ipdActiveRole || 'ATD Coordinator',
      remarks: 'Blocked for maintenance.'
    });
    
    alert(`Bed ${bedId} is now blocked for maintenance.`);
    var c = document.getElementById('main-content');
    if (c) renderWorkspace(c);
  };

  /* ── SCREEN 3: TRANSFER MODAL TRIGGER ───────────────────────── */
  window._bedOpenTransfer = function(uhid, bedId) {
    _drawerOpen = false;
    window.showUniversalTransferWorkflow(uhid, bedId);
  };

  window._transferModalClose = function() {
    _transferModalOpen = false;
    _transferReviewMode = false;
    var c = document.getElementById('main-content');
    if (c) renderWorkspace(c);
  };

  window.backToTransferEdit = function() {
    _transferReviewMode = false;
    var c = document.getElementById('main-content');
    if (c) renderWorkspace(c);
  };

  window.proceedToTransferReview = function() {
    var notesEl = document.getElementById('trf-notes');
    if (notesEl) _transferNotes = notesEl.value;

    var reasonEl = document.getElementById('trf-reason');
    if (reasonEl) _transferReason = reasonEl.value;

    var dateEl = document.getElementById('transfer-datetime');
    if (dateEl) _transferDateTime = dateEl.value;

    var condEl = document.getElementById('trf-condition');
    if (condEl) _transferPatientCondition = condEl.value;

    if (!_transferToBed) {
      alert('Please select an available destination bed before reviewing.');
      return;
    }

    _transferReviewMode = true;
    var c = document.getElementById('main-content');
    if (c) renderWorkspace(c);
  };

  window._transferSetWard = function(val) {
    _transferToWard = val;
    var rooms = getRoomsForWard(val);
    _transferToRoom = rooms[0] || 'Room 401';
    var targetBeds = getBedsForRoom(val, _transferToRoom);
    _transferToBed = targetBeds.find(b => (window.state.bedsStatus[b] || {}).status === 'Available') || '';
    
    var c = document.getElementById('main-content');
    if (c) renderWorkspace(c);
  };

  window._transferSetRoom = function(val) {
    _transferToRoom = val;
    var targetBeds = getBedsForRoom(_transferToWard, val);
    _transferToBed = targetBeds.find(b => (window.state.bedsStatus[b] || {}).status === 'Available') || '';
    
    var c = document.getElementById('main-content');
    if (c) renderWorkspace(c);
  };

  window._transferSetBed = function(val) {
    _transferToBed = val;
    var c = document.getElementById('main-content');
    if (c) renderWorkspace(c);
  };

  window._transferConfirmSubmit = function() {
    var pat = window.state.patients.find(pt => pt.uhid === _transferPatientUhid);
    if (!pat) return;

    if (!_transferToBed) {
      alert('Please choose a valid destination Bed.');
      return;
    }

    // Push Request into Admission Dashboard queue (transferRequests)
    window.state.transferRequests = window.state.transferRequests || [];
    window.state.transferRequests.push({
      id: 'TRF' + String(100 + window.state.transferRequests.length + 1),
      name: pat.name,
      uhid: pat.uhid,
      currentBed: _transferFromBed,
      currentWard: pat.ward || 'General Ward (Male)',
      targetWard: _transferToWard,
      targetBed: _transferToBed,
      targetRoom: _transferToRoom,
      condition: _transferPatientCondition,
      requestedBy: pat.primaryConsultant || 'Dr. Ramesh Kumar',
      reason: _transferReason,
      requestedAt: _transferDateTime,
      status: 'Pending Nursing Supervisor Approval',
      branch: 'Bengaluru'
    });

    // Update patient profile local condition flag
    pat.condition = _transferPatientCondition;

    // Log timeline event for audit trail
    pat.timelineEvents = pat.timelineEvents || [];
    pat.timelineEvents.unshift({
      date: new Date().toLocaleDateString('en-CA') + ' ' + new Date().toLocaleTimeString('en-US', {hour:'2-digit', minute:'2-digit'}),
      type: 'clinical',
      icon: '🔄',
      title: 'Relocation Request raised',
      desc: `Transfer request TRF-${100+window.state.transferRequests.length} raised for Bed ${_transferToBed} (${_transferPatientCondition})`
    });

    localStorage.setItem('saronil_patients', JSON.stringify(window.state.patients));
    localStorage.setItem('saronil_transferRequests', JSON.stringify(window.state.transferRequests));

    _transferModalOpen = false;
    _transferReviewMode = false;
    
    // Trigger Success Toast
    window.showToastNotification('Transfer Request sent successfully.');

    var c = document.getElementById('main-content');
    if (c) renderWorkspace(c);
  };

  /* ── SCREEN 4: DISCHARGE MODAL TRIGGER ──────────────────────── */
  window._bedIssueDischarge = function(uhid) {
    _drawerOpen = false;
    window.showUniversalDischargeWorkflow(uhid);
  };

  window._dischargeModalClose = function() {
    _dischargeModalOpen = false;
    var c = document.getElementById('main-content');
    if (c) renderWorkspace(c);
  };

  window._dischargeSetType = function(val) {
    _dischargeType = val;
    var c = document.getElementById('main-content');
    if (c) renderWorkspace(c);
  };

  window._dischargeConfirmSubmit = function() {
    var diag = document.getElementById('dis-diag').value.trim();
    var summary = document.getElementById('dis-summary').value.trim();
    var pin = document.getElementById('dis-pin').checked;

    if (!diag) { alert('Final Discharge Diagnosis is required.'); return; }
    if (!summary) { alert('Clinical discharge summary Course details are required.'); return; }
    if (!pin) { alert('Doctor electronic e-signature checklist authorization is required.'); return; }

    var pat = window.state.patients.find(pt => pt.uhid === _dischargePatientUhid);
    if (!pat) return;

    // Check MLC Alert
    var isMlc = pat.flags && pat.flags.includes('MLC');
    if (isMlc && _dischargeType !== 'Death') {
      alert('MLC Alert: Medico-Legal Case requires police station verification cleared before checkout.');
    }

    // Append to discharge active queue
    window.state.dischargeOrders = window.state.dischargeOrders || [];
    window.state.dischargeOrders.push({
      uhid: pat.uhid,
      patientName: pat.name,
      ward: pat.ward || 'GENERAL-WARD-M',
      bed: pat.bed || 'GW(M)-410',
      doctorName: pat.primaryConsultant || 'Dr. Srinivasan',
      orderTime: new Date().toISOString(),
      clearances: { nursing: false, billing: false, pharmacy: false, tpa: (pat.payerType === 'TPA' ? false : true), lab: true },
      waitingHrs: 1
    });

    _dischargeModalOpen = false;
    alert(`✓ Discharge Order issued successfully for ${pat.name}.\nChecklist clearance workflows initiated.`);

    var c = document.getElementById('main-content');
    if (c) renderWorkspace(c);
  };

  /* ── SCREEN 2: AVAILABLE QUICK ASSIGN PANEL ─────────────────── */
  window._bedOpenQuickAssign = function(bedId) {
    _quickAssignOpen = true;
    _quickAssignBedId = bedId;
    var c = document.getElementById('main-content');
    if (c) renderWorkspace(c);
  };

  window._quickAssignClose = function() {
    _quickAssignOpen = false;
    var c = document.getElementById('main-content');
    if (c) renderWorkspace(c);
  };

  window._bedQuickAssignSelect = function(uhid) {
    var req = window.state.admissionRequests.find(r => r.uhid === uhid);
    if (!req) return;

    _quickAssignOpen = false;
    window.router.navigate(`ipdAdmission?tab=admission_wizard&uhid=${uhid}&bed=${_quickAssignBedId}`);
  };

  window._quickAssignToHousekeeping = function(bedId) {
    const statusObj = window.state.bedsStatus[bedId];
    if (!statusObj) return;
    const wardKey = statusObj.wardKey;
    
    _quickAssignOpen = false;
    
    var prevStatus = statusObj.status || 'Available';
    window.state.bedsStatus[bedId] = {
      wardKey: wardKey,
      status: 'Cleaning',
      patientUhid: null,
      notes: 'Routine cleaning post quick assign request'
    };
    localStorage.setItem('saronil_bedsStatus', JSON.stringify(window.state.bedsStatus));
    
    if (typeof window.state.triggerHousekeepingRequest === 'function') {
      window.state.triggerHousekeepingRequest(bedId, wardKey, 'Routine cleaning post quick assign request');
    }
    
    window.state.logBedMovement({
      patientId: null,
      bedId: bedId,
      wardKey: wardKey,
      prevStatus: prevStatus,
      newStatus: 'Cleaning',
      action: 'Housekeeping',
      user: window._ipdActiveRole || 'ATD Coordinator',
      role: window._ipdActiveRole || 'ATD Coordinator',
      remarks: 'Sent to Housekeeping from Quick Assign.'
    });
    
    alert(`Bed ${bedId} has been sent to Housekeeping.`);
    var c = document.getElementById('main-content');
    if (c) renderWorkspace(c);
  };

  window._quickAssignToMaintenance = function(bedId) {
    const statusObj = window.state.bedsStatus[bedId];
    if (!statusObj) return;
    const wardKey = statusObj.wardKey;
    
    _quickAssignOpen = false;
    
    var prevStatus = statusObj.status || 'Available';
    window.state.bedsStatus[bedId] = {
      wardKey: wardKey,
      status: 'Blocked',
      patientUhid: null,
      notes: 'Blocked for maintenance'
    };
    localStorage.setItem('saronil_bedsStatus', JSON.stringify(window.state.bedsStatus));
    
    window.state.logBedMovement({
      patientId: null,
      bedId: bedId,
      wardKey: wardKey,
      prevStatus: prevStatus,
      newStatus: 'Blocked',
      action: 'Maintenance Block',
      user: window._ipdActiveRole || 'ATD Coordinator',
      role: window._ipdActiveRole || 'ATD Coordinator',
      remarks: 'Blocked for maintenance.'
    });
    
    alert(`Bed ${bedId} is now blocked for maintenance.`);
    var c = document.getElementById('main-content');
    if (c) renderWorkspace(c);
  };

  window._quickAssignTentativeBlock = function(bedId) {
    const statusObj = window.state.bedsStatus[bedId];
    if (!statusObj) return;
    const wardKey = statusObj.wardKey;
    
    _quickAssignOpen = false;
    
    var prevStatus = statusObj.status || 'Available';
    window.state.bedsStatus[bedId] = {
      wardKey: wardKey,
      status: 'Reserved',
      patientUhid: null,
      notes: 'Tentatively Blocked'
    };
    localStorage.setItem('saronil_bedsStatus', JSON.stringify(window.state.bedsStatus));
    
    window.state.logBedMovement({
      patientId: null,
      bedId: bedId,
      wardKey: wardKey,
      prevStatus: prevStatus,
      newStatus: 'Reserved',
      action: 'Tentative Reservation',
      user: window._ipdActiveRole || 'ATD Coordinator',
      role: window._ipdActiveRole || 'ATD Coordinator',
      remarks: 'Reserved / Tentatively Blocked.'
    });
    
    alert(`Bed ${bedId} has been tentatively blocked (Reserved).`);
    var c = document.getElementById('main-content');
    if (c) renderWorkspace(c);
  };


  /* ── MODALS AND RENDER OVERLAYS ────────────────────────────── */
  function renderModalOverlays() {
    var overlaysHTML = '';

    // 1. Quick Assign Panel
    if (_quickAssignOpen && _quickAssignBedId) {
      var requests = window.state.admissionRequests || [];
      
      overlaysHTML += `
        <div class="ipd-modal-overlay">
          <div class="ipd-modal" style="width: 600px; max-width: 90vw;">
            <div class="ipd-modal-hdr" style="background: white; border-bottom: 1px solid #cbd5e1; padding: 18px 24px; display: flex; justify-content: space-between; align-items: center; border-radius: 16px 16px 0 0;">
              <h4 class="ipd-modal-title" style="margin: 0; font-size: 15px; font-weight: 800; color: #1e3a8a; font-family: sans-serif; display: flex; align-items: center; gap: 8px;">
                <span>🛌</span> <span>QUICK ASSIGN BED ${_quickAssignBedId}</span>
              </h4>
              <button class="ipd-drawer-close" style="background: none; border: none; font-size: 24px; font-weight: bold; color: #1e293b; cursor: pointer; padding: 0; display: flex; align-items: center; justify-content: center; line-height: 1;" onclick="window._quickAssignClose()">✕</button>
            </div>
            <div class="ipd-modal-body" style="padding: 24px; text-align: left;">
              <p style="font-size: 13px; color: #475569; margin: 0 0 16px 0; font-family: sans-serif; line-height: 1.5;">
                Select a patient from the pending admission requests queue to assign to this bed space.
              </p>
              
              <div style="border: 1px solid #cbd5e1; border-radius: 12px; padding: 30px; text-align: center; display: flex; align-items: center; justify-content: center; background: white; min-height: 100px; margin-bottom: 20px; box-sizing: border-box;">
                ${requests.length > 0 ? `
                  <div style="max-height: 220px; overflow-y: auto; width: 100%;">
                    ${requests.map(r => `
                      <div style="padding:10px; border-bottom:1px solid #f1f5f9; display:flex; justify-content:space-between; align-items:center; font-size:12px; width: 100%; text-align: left;">
                        <div>
                          <strong style="color: var(--primary); text-decoration: underline; cursor: pointer;" onclick="window.router.navigate('patients?uhid=${r.uhid}&name=${encodeURIComponent(r.name)}')">${r.name}</strong> (${r.uhid})<br>
                          <span style="color:var(--text-muted); font-size:10px;">${r.diagnosis}</span>
                        </div>
                        <button class="ipd-bed-btn ipd-bed-btn-primary" style="background: #2563eb; color: white; border: none; padding: 6px 12px; border-radius: 6px; font-weight: 600; cursor: pointer;" onclick="window._bedQuickAssignSelect('${r.uhid}')">Admit Patient</button>
                      </div>
                    `).join('')}
                  </div>
                ` : '<span style="color: #94a3b8; font-size: 14px; font-weight: 500; font-family: sans-serif;">No pending admission requests.</span>'}
              </div>

              <div style="margin-top: 20px; padding-top: 16px; border-top: 1px solid #e2e8f0; text-align: left;">
                <label style="display: block; font-size: 11px; font-weight: 700; color: #64748b; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.05em; font-family: sans-serif;">Other Bed Actions</label>
                <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                  <button class="ipd-bed-btn" style="background-color: #2563eb; color: white; border: none; padding: 10px 16px; font-size: 12px; font-weight: 700; cursor: pointer; border-radius: 6px; font-family: sans-serif;" onclick="window._quickAssignToHousekeeping('${_quickAssignBedId}')">Assign to Housekeeping</button>
                  <button class="ipd-bed-btn" style="background-color: #ef4444; color: white; border: none; padding: 10px 16px; font-size: 12px; font-weight: 700; cursor: pointer; border-radius: 6px; font-family: sans-serif;" onclick="window._quickAssignToMaintenance('${_quickAssignBedId}')">Assign for Maintenance</button>
                  <button class="ipd-bed-btn" style="background-color: #7c3aed; color: white; border: none; padding: 10px 16px; font-size: 12px; font-weight: 700; cursor: pointer; border-radius: 6px; font-family: sans-serif;" onclick="window._quickAssignTentativeBlock('${_quickAssignBedId}')">Tentative Block</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      `;
    }

    // 2. Transfer Request Modal (Fully dynamic relocation journey)
    if (_transferModalOpen && _transferPatientUhid) {
      var pat = window.state.patients.find(pt => pt.uhid === _transferPatientUhid);
      var currentWardName = WARD_RATES[pat?.ward] ? WARD_RATES[pat.ward].name : pat?.ward || 'General Ward (Male)';

      if (_transferReviewMode) {
        var destWardName = WARD_RATES[_transferToWard]?.name || _transferToWard;

        overlaysHTML += `
          <div class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[1100] p-4 animate-fade-in">
            <div class="bg-white rounded-2xl w-[600px] max-w-[95vw] shadow-2xl overflow-hidden flex flex-col transform transition-all duration-200">
              
              <!-- Header -->
              <div class="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center">
                <h3 class="margin-0 text-blue-600 font-bold text-lg flex items-center gap-2">📋 Confirm Relocation Request</h3>
                <button class="text-slate-400 hover:text-slate-600 text-xl font-bold cursor-pointer transition-colors duration-150" onclick="window._transferModalClose()">✕</button>
              </div>

              <!-- Body -->
              <div class="p-6 overflow-y-auto flex-1 flex flex-col gap-4 text-left">
                
                <p class="margin-0 text-xs text-slate-500">
                  Please verify the following shift details before submitting the patient relocation order.
                </p>

                <!-- Patient & Log details -->
                <div class="bg-slate-50 border border-slate-100 rounded-xl p-4.5 grid grid-cols-2 gap-x-6 gap-y-2 text-xs">
                  <div class="col-span-2 border-b border-slate-200 pb-1.5 font-bold text-blue-600">Patient Information:</div>
                  <div>
                    <span class="text-slate-500 font-medium">Patient Name:</span>
                    <span class="text-slate-800 font-bold ml-1">${pat?.name}</span>
                  </div>
                  <div>
                    <span class="text-slate-500 font-medium">UHID / MRN:</span>
                    <span class="text-slate-800 font-bold ml-1">${pat?.uhid}</span>
                  </div>
                  <div>
                    <span class="text-slate-500 font-medium">Current Condition:</span>
                    <span class="px-2 py-0.5 bg-red-50 text-red-700 font-bold rounded text-[10px] ml-1">${_transferPatientCondition}</span>
                  </div>
                  <div>
                    <span class="text-slate-500 font-medium">Treating Doctor:</span>
                    <span class="text-slate-800 font-bold ml-1">${pat?.primaryConsultant || 'Dr. Ramesh Kumar'}</span>
                  </div>

                  <div class="col-span-2 border-b border-slate-200 pt-2 pb-1.5 font-bold text-blue-600">Transfer Log Details:</div>
                  <div>
                    <span class="text-slate-500 font-medium">Transfer Reason:</span>
                    <span class="px-2 py-0.5 bg-emerald-50 text-emerald-700 font-bold rounded text-[10px] ml-1">${_transferReason}</span>
                  </div>
                  <div>
                    <span class="text-slate-500 font-medium">Effective Time:</span>
                    <span class="text-slate-800 font-bold ml-1">${new Date(_transferDateTime).toLocaleString('en-IN')}</span>
                  </div>
                </div>

                <!-- Comparative Origin vs Destination Readout -->
                <div class="flex items-center justify-between gap-4 bg-slate-50 p-4 border border-slate-200 rounded-xl text-center">
                  <div class="flex-1">
                    <span class="text-[10px] text-slate-400 block font-bold tracking-wider uppercase">ORIGIN BED</span>
                    <strong class="text-purple-600 text-base font-extrabold">${_transferFromBed}</strong>
                    <span class="text-[10px] text-slate-500 block">${currentWardName}</span>
                  </div>
                  <div class="text-xl text-slate-400 font-bold">➡️</div>
                  <div class="flex-1">
                    <span class="text-[10px] text-slate-400 block font-bold tracking-wider uppercase">DESTINATION BED</span>
                    <strong class="text-emerald-600 text-base font-extrabold">${_transferToBed}</strong>
                    <span class="text-[10px] text-slate-500 block">${destWardName} · ${_transferToRoom}</span>
                  </div>
                </div>

                <div class="text-xs text-slate-600 bg-slate-50 p-3 border border-slate-200 rounded-lg">
                  <strong>Transfer Notes / Special instructions:</strong><br>
                  <p class="margin-0 mt-1 italic">${_transferNotes || 'No special handoff notes provided.'}</p>
                </div>

              </div>

              <!-- Footer Buttons -->
              <div class="bg-slate-50 px-6 py-3 border-t border-slate-200 flex justify-end gap-3">
                <button class="py-2 px-5 border border-slate-300 rounded-lg text-xs font-bold text-slate-600 bg-white hover:bg-slate-100" onclick="window.backToTransferEdit()">⬅️ Back to Edit</button>
                <button class="py-2 px-5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5" onclick="window._transferConfirmSubmit()">Confirm & Raise Request ➡️</button>
              </div>

            </div>
          </div>
        `;
      } else {
        var roomBeds = getBedsForRoom(_transferToWard, _transferToRoom);
        var availableBeds = roomBeds.filter(b => (window.state.bedsStatus[b] || {}).status === 'Available');

        overlaysHTML += `
          <div class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[1100] p-4 animate-fade-in">
            <div class="bg-white rounded-2xl w-[640px] max-w-[95vw] max-h-[90vh] shadow-2xl overflow-hidden flex flex-col transform transition-all duration-200">
              
              <!-- Header -->
              <div class="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center">
                <h3 class="margin-0 text-blue-600 font-bold text-lg flex items-center gap-2">🔄 Transfer Patient: ${pat?.name}</h3>
                <button class="text-slate-400 hover:text-slate-600 text-xl font-bold cursor-pointer transition-colors duration-150" onclick="window._transferModalClose()">✕</button>
              </div>

              <!-- Body -->
              <div class="p-6 overflow-y-auto flex-1 flex flex-col gap-4 text-left">
                
                <!-- Patient Info Capsule Card -->
                <div class="bg-slate-50 border border-slate-100 rounded-xl p-4.5 grid grid-cols-2 gap-x-6 gap-y-2 text-xs">
                  <div>
                    <span class="text-slate-500 font-medium">Patient:</span>
                    <span class="text-slate-800 font-bold ml-1">${pat?.name} (${pat?.age || 45} / ${pat?.gender})</span>
                  </div>
                  <div>
                    <span class="text-slate-500 font-medium">UHID / MRN:</span>
                    <span class="text-slate-800 font-bold ml-1">${pat?.uhid}</span>
                  </div>
                  <div>
                    <span class="text-slate-500 font-medium">Admission ID:</span>
                    <span class="text-slate-800 font-bold ml-1">ADM5001</span>
                  </div>
                  <div>
                    <span class="text-slate-500 font-medium">Admitted Date:</span>
                    <span class="text-slate-800 font-bold ml-1">2026-06-20 10:00 AM</span>
                  </div>
                  <div>
                    <span class="text-slate-500 font-medium">Current Location:</span>
                    <span class="text-purple-600 font-bold ml-1">${_transferFromBed} (${currentWardName})</span>
                  </div>
                  <div>
                    <span class="text-slate-500 font-medium">Patient Condition:</span>
                    <span class="font-bold ml-1 ${pat?.condition === 'Critical' ? 'text-red-600' : pat?.condition === 'Serious' ? 'text-amber-500' : 'text-emerald-600'}">${pat?.condition || 'Stable'}</span>
                  </div>
                </div>

                <!-- Destination Location Fieldset Box -->
                <div class="border border-blue-100 rounded-xl p-4">
                  <div class="text-blue-600 font-bold text-sm mb-3 flex items-center gap-1.5">📍 Destination Location (Transfer To)</div>
                  <div class="grid grid-cols-2 gap-3 mb-3">
                    <div>
                      <label class="block text-xs font-bold text-slate-700 mb-1">New Ward *</label>
                      <select class="w-full p-2 border border-slate-200 rounded-lg text-xs font-semibold" onchange="window._transferSetWard(this.value)">
                        ${Object.entries(WARD_RATES).map(([k, v]) => `<option value="${k}" ${k === _transferToWard ? 'selected' : ''}>${v.name} - ${fmtMoney(v.rate)}/day</option>`).join('')}
                      </select>
                    </div>
                    <div>
                      <label class="block text-xs font-bold text-slate-700 mb-1">New Room *</label>
                      <select class="w-full p-2 border border-slate-200 rounded-lg text-xs font-semibold" onchange="window._transferSetRoom(this.value)">
                        ${getRoomsForWard(_transferToWard).map(r => `<option value="${r}" ${r === _transferToRoom ? 'selected' : ''}>${r}</option>`).join('')}
                      </select>
                    </div>
                  </div>
                  
                  <!-- Selectable Bed Boxes (Clickable Cards) -->
                  <div>
                    <label class="block text-xs font-bold text-slate-700 mb-1">Select Bed *</label>
                    <div class="flex flex-wrap gap-2 mt-2">
                      ${availableBeds.map(b => {
                        var isSelected = (b === _transferToBed);
                        var activeClass = isSelected ? 'bg-blue-600 text-white border-blue-600 shadow-md scale-105' : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200';
                        return `
                          <button type="button" class="py-1.5 px-3 border rounded-lg text-xs font-bold transition-all cursor-pointer ${activeClass}" onclick="window._transferSetBed('${b}')">
                            🛏️ ${b}
                          </button>
                        `;
                      }).join('') || '<span class="text-xs text-red-500 font-semibold">⚠️ No available beds in this room</span>'}
                    </div>
                  </div>
                </div>

                <!-- Extra form parameters -->
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="block text-xs font-bold text-slate-700 mb-1">Reason for Transfer *</label>
                    <select class="w-full p-2 border border-slate-200 rounded-lg text-xs font-semibold" id="trf-reason" onchange="_transferReason = this.value">
                      <option value="Clinical deterioration" ${_transferReason === 'Clinical deterioration' ? 'selected' : ''}>Clinical deterioration</option>
                      <option value="ICU upgrade" ${_transferReason === 'ICU upgrade' ? 'selected' : ''}>ICU Clinical Upgrade</option>
                      <option value="ICU step-down" ${_transferReason === 'ICU step-down' ? 'selected' : ''}>Stable clinical Step-down</option>
                      <option value="Bed request by family" ${_transferReason === 'Bed request by family' ? 'selected' : ''}>Bed category upgrade request</option>
                    </select>
                  </div>
                  <div>
                    <label class="block text-xs font-bold text-slate-700 mb-1">Effective Date & Time *</label>
                    <input type="datetime-local" class="w-full p-2 border border-slate-200 rounded-lg text-xs font-semibold" id="transfer-datetime" value="${_transferDateTime}">
                  </div>
                  <div>
                    <label class="block text-xs font-bold text-slate-700 mb-1">Requested By *</label>
                    <select class="w-full p-2 border border-slate-200 rounded-lg text-xs font-semibold" id="transfer-requested-by">
                      <option value="Dr. Ramesh Kumar">${pat?.primaryConsultant || 'Dr. Ramesh Kumar'} (General Medicine)</option>
                    </select>
                  </div>
                  <div>
                    <label class="block text-xs font-bold text-slate-700 mb-1">Patient Condition *</label>
                    <select class="w-full p-2 border border-slate-200 rounded-lg text-xs font-semibold" id="trf-condition" onchange="_transferPatientCondition = this.value">
                      <option value="Stable" ${_transferPatientCondition === 'Stable' ? 'selected' : ''}>🟢 Stable</option>
                      <option value="Serious" ${_transferPatientCondition === 'Serious' ? 'selected' : ''}>🟡 Serious</option>
                      <option value="Critical" ${_transferPatientCondition === 'Critical' ? 'selected' : ''}>🔴 Critical</option>
                    </select>
                  </div>
                </div>

                <!-- Handoff notes -->
                <div class="mt-2">
                  <label class="block text-xs font-bold text-slate-700 mb-1">Transfer / Handoff Notes</label>
                  <textarea class="w-full p-2 border border-slate-200 rounded-lg text-xs font-semibold" id="trf-notes" rows="2" placeholder="Transport precautions, oxygen requirement, clinic status..."></textarea>
                </div>

              </div>

              <!-- Footer Buttons -->
              <div class="bg-slate-50 px-6 py-3 border-t border-slate-200 flex justify-end gap-3">
                <button class="py-2 px-5 border border-slate-300 rounded-lg text-xs font-bold text-slate-600 bg-white hover:bg-slate-100" onclick="window._transferModalClose()">Cancel</button>
                <button class="py-2 px-5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5" onclick="window.proceedToTransferReview()">Review Transfer ➡️</button>
              </div>

            </div>
          </div>
        `;
      }
    }

    // 3. Discharge Form Modal (Redesigned with Tailwind CSS)
    if (_dischargeModalOpen && _dischargePatientUhid) {
      var pat = window.state.patients.find(pt => pt.uhid === _dischargePatientUhid);

      overlaysHTML += `
        <div class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[1100] p-4 animate-fade-in">
          <div class="bg-white rounded-2xl w-[480px] max-w-[95vw] max-h-[90vh] shadow-2xl overflow-hidden flex flex-col transform transition-all duration-200">
            
            <!-- Header -->
            <div class="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center">
              <h3 class="margin-0 text-red-600 font-bold text-lg flex items-center gap-2">✍️ Issue Discharge Order</h3>
              <button class="text-slate-400 hover:text-slate-600 text-xl font-bold cursor-pointer transition-colors duration-150" onclick="window._dischargeModalClose()">✕</button>
            </div>

            <!-- Body -->
            <div class="p-6 overflow-y-auto flex-1 flex flex-col gap-4 text-left">
              
              <div class="bg-slate-50 border border-slate-100 rounded-xl p-3.5 text-xs text-slate-600">
                Patient: <span class="font-bold text-slate-800">${pat?.name}</span> (${pat?.uhid}) · Bed: <span class="font-bold text-slate-800">${pat?.bed || _drawerBedId}</span>
              </div>

              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">Discharge Type</label>
                <select class="w-full p-2 border border-slate-200 rounded-lg text-xs font-semibold" onchange="window._dischargeSetType(this.value)">
                  <option value="Regular" ${_dischargeType === 'Regular' ? 'selected' : ''}>Regular medical discharge</option>
                  <option value="LAMA" ${_dischargeType === 'LAMA' ? 'selected' : ''}>LAMA (Against advice)</option>
                  <option value="Referred" ${_dischargeType === 'Referred' ? 'selected' : ''}>Referred to external facility</option>
                  <option value="Death" ${_dischargeType === 'Death' ? 'selected' : ''}>Death case file</option>
                </select>
              </div>

              ${_dischargeType === 'LAMA' ? `
                <div>
                  <label class="block text-xs font-bold text-red-600 mb-1">LAMA Attender Refusal Reason *</label>
                  <input type="text" class="w-full p-2 border border-slate-200 rounded-lg text-xs font-semibold" id="dis-lama-reason" placeholder="e.g. Financial constraints or alternative opinion">
                </div>
              ` : ''}

              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">Final Diagnosis *</label>
                <input type="text" class="w-full p-2 border border-slate-200 rounded-lg text-xs font-semibold" id="dis-diag" value="${_dischargeDiagnosis}">
              </div>

              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">Course Summary in Hospital *</label>
                <textarea class="w-full p-2 border border-slate-200 rounded-lg text-xs font-semibold" id="dis-summary" rows="2" placeholder="Course details, labs summaries, treatments given...">${_dischargeSummary}</textarea>
              </div>

              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">Follow-up Advice & Medications</label>
                <textarea class="w-full p-2 border border-slate-200 rounded-lg text-xs font-semibold" id="dis-followup" rows="2" placeholder="Medications, dosage timings, warning symptoms, follow-up date...">${_dischargeFollowup}</textarea>
              </div>

              <div class="mt-2">
                <label class="flex items-center gap-2 text-xs font-bold text-blue-600 cursor-pointer">
                  <input type="checkbox" id="dis-pin" class="rounded border-slate-300"> Authorize with Doctor Electronic Signature (e-Sign PIN)
                </label>
              </div>

            </div>

            <!-- Footer Buttons -->
            <div class="bg-slate-50 px-6 py-3 border-t border-slate-200 flex justify-end gap-3">
              <button class="py-2 px-5 border border-slate-300 rounded-lg text-xs font-bold text-slate-600 bg-white hover:bg-slate-100" onclick="window._dischargeModalClose()">Cancel</button>
              <button class="py-2 px-5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold" onclick="window._dischargeConfirmSubmit()">Sign & Save Order</button>
            </div>

          </div>
        </div>
      `;
    }

    // 3. Billing Advance Deposit Modal
    if (_billingModalOpen && _billingTargetReqId) {
      var req = window.state.admissionRequests.find(r => r.id === _billingTargetReqId);
      var wardMeta = WARD_RATES[req?.ward];
      var isWaiver = req && ['CGHS', 'PMJAY', 'ECHS', 'ESI'].includes(req.payerType);
      
      overlaysHTML += `
        <div class="ipd-modal-overlay" style="z-index: 1200;">
          <div class="ipd-modal" style="width:480px;">
            <div class="ipd-modal-hdr" style="background:#16a34a; color:white; border:none;">
              <h4 class="ipd-modal-title" style="color:white; margin:0;">💳 Collect IPD Advance Deposit</h4>
              <button class="ipd-drawer-close" style="color:white; background:none; border:none; font-size:16px; cursor:pointer;" onclick="window._billingClose()">✕</button>
            </div>
            <div class="ipd-modal-body" style="padding:20px; font-family:'Inter',sans-serif;">
              <div style="background:#f8fafc; padding:12px; border-radius:8px; border:1px solid #e2e8f0; font-size:12px; margin-bottom:15px; display:flex; flex-direction:column; gap:4px; text-align:left;">
                <div><strong>Patient Name:</strong> ${req.name}</div>
                <div><strong>UHID:</strong> ${req.uhid}</div>
                <div><strong>Requested Ward:</strong> ${wardMeta?.name || req.ward}</div>
                <div><strong>Payer Type:</strong> <span class="reg-badge" style="background:#eff6ff; color:#1e40af;">${req.payerType}</span></div>
              </div>
              
              <div class="ipd-modal-field" style="text-align:left;">
                <label class="reg-label" style="margin-bottom:4px; font-weight:700;">Advance Deposit Amount (₹) <span>*</span></label>
                <input type="number" class="reg-input" id="billing-input-amt" value="${_billingCollectedAmount}">
                ${isWaiver ? `
                  <div style="font-size:11px; color:#15803d; font-weight:700; margin-top:4px;">
                    🏛️ Waiver Active: Patient belongs to CGHS/PMJAY/ECHS/ESI scheme. Slabs waived (₹0).
                  </div>
                ` : `
                  <div style="font-size:11px; color:#b45309; font-weight:600; margin-top:4px;">
                    Slab Rate Required: ₹${wardMeta?.minDeposit} for this room category.
                  </div>
                `}
              </div>
              
              <div class="ipd-modal-field" style="margin-top:12px; text-align:left;">
                <label class="reg-label" style="margin-bottom:4px; font-weight:700;">Payment Counter Method</label>
                <select class="reg-select" id="billing-input-mode">
                  <option value="UPI">UPI Digital Payment</option>
                  <option value="Cash">Cash Desk</option>
                  <option value="Card">Credit/Debit Card</option>
                </select>
              </div>

              <div class="btn-row" style="margin-top:20px; border-top:1px solid #e2e8f0; padding-top:12px; display:flex; justify-content:flex-end; gap:8px;">
                <button class="btn btn-secondary" onclick="window._billingClose()">Cancel</button>
                <button class="btn btn-primary" style="background:#16a34a; border-color:#16a34a; color:white; padding:8px 16px; border-radius:6px; font-weight:700; cursor:pointer;" onclick="window._billingSave()">Confirm Deposit & Approve Admission</button>
              </div>
            </div>
          </div>
        </div>
      `;
    }

    // 4. Emergency Override Modal
    if (_emergencyOverrideModalOpen && _emergencyTargetReqId) {
      var req = window.state.admissionRequests.find(r => r.id === _emergencyTargetReqId);
      
      overlaysHTML += `
        <div class="ipd-modal-overlay" style="z-index: 1200;">
          <div class="ipd-modal" style="width:480px;">
            <div class="ipd-modal-hdr" style="background:#dc2626; color:white; border:none;">
              <h4 class="ipd-modal-title" style="color:white; margin:0;">🚨 Emergency Admission Override</h4>
              <button class="ipd-drawer-close" style="color:white; background:none; border:none; font-size:16px; cursor:pointer;" onclick="window._emergencyOverrideClose()">✕</button>
            </div>
            <div class="ipd-modal-body" style="padding:20px; font-family:'Inter',sans-serif;">
              <div style="background:#fef2f2; border:1px solid #fca5a5; padding:12px; border-radius:8px; font-size:12px; color:#991b1b; line-height:1.4; margin-bottom:15px; text-align:left;">
                ⚠️ <strong>Clinical Override Bypass Protocol:</strong> This action bypasses advance deposit collection due to acute critical clinical status (trauma, cardiac, obstetric triage). Detail justification below.
              </div>
              
              <div class="ipd-modal-field" style="text-align:left;">
                <label class="reg-label" style="margin-bottom:4px; font-weight:700;">Patient Name</label>
                <input type="text" class="reg-input" readonly value="${req.name} (${req.uhid})">
              </div>
              
              <div class="ipd-modal-field" style="margin-top:10px; text-align:left;">
                <label class="reg-label" style="margin-bottom:4px; font-weight:700;">ER Clinical Justification <span>*</span></label>
                <textarea class="reg-input" id="er-justification-input" rows="2" style="resize:none;" placeholder="Detail active cardiac, trauma, or maternal distress override reason..."></textarea>
              </div>
              
              <div class="ipd-modal-field" style="margin-top:10px; text-align:left;">
                <label class="reg-label" style="margin-bottom:4px; font-weight:700;">Defer Advance Deposit Collection Slabs Until</label>
                <select class="reg-select" id="er-deferral-select">
                  <option value="Within 24 Hours">Within 24 Hours</option>
                  <option value="Before Patient Discharge">Before Patient Discharge</option>
                  <option value="Exempted retrospectively by Admin">Exempted retrospectively by Admin</option>
                </select>
              </div>

              <div class="btn-row" style="margin-top:20px; border-top:1px solid #e2e8f0; padding-top:12px; display:flex; justify-content:flex-end; gap:8px;">
                <button class="btn btn-secondary" onclick="window._emergencyOverrideClose()">Cancel</button>
                <button class="btn btn-primary" style="background:#dc2626; border-color:#dc2626; color:white; padding:8px 16px; border-radius:6px; font-weight:700; cursor:pointer;" onclick="window._emergencyOverrideSave()">Authorize Override & Admission</button>
              </div>
            </div>
          </div>
        </div>
      `;
    }

    return overlaysHTML;
  }

  /* ── 5-STEP ADMISSION WIZARD WORKFLOW (PRESERVED) ───────────── */
  function renderAdmissionWizardWrapper() {
    var stepsHTML = `
      <div class="atd-steps">
        <div class="atd-step-item ${_admissionStep === 'lookup' ? 'active' : (_admissionStep !== 'lookup' ? 'completed' : '')}">1. Identification</div>
        <div class="atd-step-item ${_admissionStep === 'referral' ? 'active' : (_admissionStep !== 'lookup' && _admissionStep !== 'referral' ? 'completed' : '')}">2. Referral Slip</div>
        <div class="atd-step-item ${_admissionStep === 'billing' ? 'active' : (_admissionStep === 'form' || _admissionStep === 'bed' || _admissionStep === 'success' ? 'completed' : '')}">3. Billing Deposit</div>
        <div class="atd-step-item ${_admissionStep === 'form' ? 'active' : (_admissionStep === 'bed' || _admissionStep === 'success' ? 'completed' : '')}">4. Intake Form</div>
        <div class="atd-step-item ${_admissionStep === 'bed' ? 'active' : (_admissionStep === 'success' ? 'completed' : '')}">5. Bed Grid</div>
      </div>
    `;

    var content = '';
    if (_admissionStep === 'lookup') {
      content = renderLookupStep();
    } else if (_admissionStep === 'referral') {
      content = renderReferralStep();
    } else if (_admissionStep === 'billing') {
      content = renderBillingStep();
    } else if (_admissionStep === 'form') {
      content = renderAdmissionFormStep();
    } else if (_admissionStep === 'bed') {
      content = renderBedAssignmentStep();
    } else if (_admissionStep === 'success') {
      content = renderSuccessConfirmation();
    }

    return `
      <div class="atd-card" style="margin-top:0;">
        <div class="atd-header">
          <h2>ATD Coordinator Desk — Patient Admission</h2>
          <p>Admit registered patients to General Wards, Private Rooms, Day Care, or ICUs</p>
        </div>
        <div class="atd-body">
          ${_admissionStep !== 'success' ? stepsHTML : ''}
          ${content}
        </div>
      </div>
    `;
  }

  /* ── STEP 1: PATIENT IDENTIFICATION ────────────────────────── */
  function renderLookupStep() {
    return `
      <div class="gate-searchbox" style="border-color: #7c3aed; background: rgba(124,58,237,0.03);">
        <h3 style="color: #4c1d95;">🔍 Patient EMR Database Lookup</h3>
        <p>Verify registration status. Enter Mobile Number or Patient UHID below to identify patient.</p>
        <div class="gate-input-wrapper">
          <input type="text" class="gate-input" id="atd-lookup-input" placeholder="e.g. 9845012345 or BLR-00421" value="${_searchQuery}">
          <button class="gate-btn" style="background:#7c3aed;" onclick="window._atdPerformLookup()">Query Patient</button>
        </div>
      </div>
      <div style="text-align: center; margin-top: 1rem;">
        <span style="font-size: 12px; color: var(--text-secondary);">
          ❌ Not registered? <strong onclick="window._atdRedirectReg()" style="color:#7c3aed; cursor:pointer;">Proceed to Registration Counter</strong>
        </span>
      </div>
    `;
  }

  window._atdRedirectReg = function() {
    window.router.navigate('registration?action=new');
  };

  window._atdPerformLookup = async function() {
    var input = document.getElementById('atd-lookup-input');
    if (!input) return;
    var query = input.value.trim();
    if (!query) {
      alert('Please enter Mobile or UHID to query.');
      return;
    }
    _searchQuery = query;

    var cleanQ = query.toLowerCase();
    var match = (window.state.patients || []).find(p => p.uhid.toLowerCase() === cleanQ || (p.mobile && p.mobile.includes(query)));
    
    if (match) {
      _selectedPatient = match;
      _admissionStep = 'referral';
      _provisionalDiagnosis = match.clinicalData ? match.clinicalData.diagnosis : '';
      _referringDoctor = match.primaryConsultant || '';
      _wardPreference = match.gender === 'Female' ? 'GENERAL-WARD-F' : 'GENERAL-WARD-M';
      
      // Reset safety precaution and checklist states
      _wizAllergyFlag = match.allergies && match.allergies !== 'None' ? true : false;
      _wizFallRiskFlag = false;
      _wizDnrFlag = false;
      _wizLimbPrecautionFlag = false;
      _wizWristbandPrinted = false;
      _wizConsentSigned = false;
      _wizEmergencyImpliedConsent = false;
      _wizEmergencyImpliedConsentDoctor = match.primaryConsultant || 'Dr. Amit Verma';
      _wizDietOrderIssued = false;
      _wizValuablesRecorded = false;
    } else {
      await customAlert('No registered patient profile found. Please register the patient first.');
      window.router.navigate('registration?action=new');
      return;
    }

    var c = document.getElementById('main-content');
    if (c) renderWorkspace(c);
  };

  /* ── STEP 2: REFERRAL / ADVICE CAPTURE ──────────────────────── */
  function renderReferralStep() {
    var docs = window.state.doctors || [];
    var p = _selectedPatient;

    return `
      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px 16px; margin-bottom: 1.5rem; font-size: 13px;">
        👤 <strong>Patient:</strong> ${p.name} (${p.uhid}) · ${p.age}y / ${p.gender} · Mobile: ${p.mobile || '—'}
      </div>

      <div class="atd-section-title">Referral Admission parameters</div>
      
      <div class="atd-grid">
        <div class="atd-field">
          <div class="atd-label">Admission Pathway <span>*</span></div>
          <select class="atd-select" id="atd-type" onchange="window._atdSetType(this.value)">
            <option value="IPD" ${_admType === 'IPD' ? 'selected' : ''}>IPD Admission (Standard Inpatient)</option>
            <option value="Daycare" ${_admType === 'Daycare' ? 'selected' : ''}>Daycare Admission (Same-Day Procedure)</option>
          </select>
        </div>
        <div class="atd-field">
          <div class="atd-label">Admission Source <span>*</span></div>
          <select class="atd-select" id="atd-source" onchange="window._atdSetSource(this.value)">
            <option value="Same hospital OPD" ${_admSource === 'Same hospital OPD' ? 'selected' : ''}>Same hospital OPD</option>
            <option value="Same hospital Emergency" ${_admSource === 'Same hospital Emergency' ? 'selected' : ''}>Same hospital Emergency</option>
            <option value="External referral" ${_admSource === 'External referral' ? 'selected' : ''}>External Referral Letter</option>
            <option value="Direct walk-in" ${_admSource === 'Direct walk-in' ? 'selected' : ''}>Direct Walk-In</option>
          </select>
        </div>
      </div>

      <div class="atd-grid">
        <div class="atd-field">
          <div class="atd-label">Referring Clinician / Doctor <span>*</span></div>
          ${_admSource.includes('Same hospital') ? `
            <select class="atd-select" id="atd-ref-doc">
              <option value="">-- Select Hospital Doctor --</option>
              ${docs.map(d => `<option value="${d.name}" ${d.name === _referringDoctor ? 'selected' : ''}>${d.name} (${d.spec})</option>`).join('')}
            </select>
          ` : `
            <input type="text" class="atd-input" id="atd-ref-doc-text" placeholder="Referring Doctor's Full Name" value="${_referringDoctor}">
          `}
        </div>

        <div class="atd-field" id="ext-hospital-field" style="display: ${_admSource === 'External referral' ? 'flex' : 'none'};">
          <div class="atd-label">External Sending Facility Name <span>*</span></div>
          <input type="text" class="atd-input" id="atd-ext-hospital" placeholder="e.g. Fortis Hospital, Delhi" value="${_externalHospital}">
        </div>
      </div>

      <div class="atd-grid">
        <div class="atd-field">
          <div class="atd-label">Treating consultant (Hospital Primary) <span>*</span></div>
          <select class="atd-select" id="atd-treating-doc">
            <option value="">-- Choose Treating Consultant --</option>
            ${docs.map(d => `<option value="${d.name}" ${d.name === _treatingConsultant ? 'selected' : ''}>${d.name} (${d.spec})</option>`).join('')}
          </select>
        </div>
        <div class="atd-field">
          <div class="atd-label">Provisional Diagnosis <span>*</span></div>
          <input type="text" class="atd-input" id="atd-prov-diag" placeholder="Provisional Clinical Diagnosis" value="${_provisionalDiagnosis}">
        </div>
      </div>

      <div class="atd-grid">
        <div class="atd-field" style="grid-column: span 2;">
          <div class="atd-label">Admission Advice / Referral Summary <span>*</span></div>
          <textarea class="atd-textarea" id="atd-summary" rows="3" placeholder="Summary of medical advice, medications ordered, and admission triggers...">${_referralSummary}</textarea>
        </div>
        <div class="atd-field">
          <div class="atd-label">Select Ward Category Preference <span>*</span></div>
          <select class="atd-select" id="atd-ward-pref" onchange="window._atdUpdateWardPref(this.value)">
            ${Object.entries(WARD_RATES).map(function([key, val]) {
              if (_admType === 'Daycare' && key !== 'DAYCARE') return '';
              if (_admType === 'IPD' && key === 'DAYCARE') return '';
              return `<option value="${key}" ${key === _wardPreference ? 'selected' : ''}>${val.name} (Rent: ₹${val.rate}/day)</option>`;
            }).join('')}
          </select>
        </div>
      </div>

      <div class="atd-field" style="margin-bottom: 20px;">
        <div class="atd-label">Attach Scanned Referral / Admission advice Slip (Mock Upload)</div>
        <input type="file" class="atd-input" style="padding:6px;">
      </div>

      <div class="btn-row">
        <button class="btn btn-secondary" onclick="window._atdStepBack('lookup')">Cancel</button>
        <button class="btn btn-primary" onclick="window._atdSaveReferralAdvice()">Save Advice & Generate Billing Request</button>
      </div>
    `;
  }

  window._atdSetType = function(val) {
    _admType = val;
    if (val === 'Daycare') {
      _wardPreference = 'DAYCARE';
    } else {
      _wardPreference = _selectedPatient.gender === 'Female' ? 'GENERAL-WARD-F' : 'GENERAL-WARD-M';
    }
    var c = document.getElementById('main-content');
    if (c) renderWorkspace(c);
  };

  window._atdSetSource = function(val) {
    _admSource = val;
    var c = document.getElementById('main-content');
    if (c) renderWorkspace(c);
  };

  window._atdUpdateWardPref = function(val) {
    _wardPreference = val;
  };

  window._atdStepBack = function(step) {
    _admissionStep = step;
    var c = document.getElementById('main-content');
    if (c) renderWorkspace(c);
  };

  window._atdSaveReferralAdvice = function() {
    var docSel = document.getElementById('atd-ref-doc');
    var docTxt = document.getElementById('atd-ref-doc-text');
    var provDiag = document.getElementById('atd-prov-diag');
    var treatingDoc = document.getElementById('atd-treating-doc');
    var summary = document.getElementById('atd-summary');

    _referringDoctor = docSel ? docSel.value : (docTxt ? docTxt.value : '');
    _provisionalDiagnosis = provDiag ? provDiag.value.trim() : '';
    _treatingConsultant = treatingDoc ? treatingDoc.value : '';
    _referralSummary = summary ? summary.value.trim() : '';

    if (_admSource === 'External referral') {
      var extHosp = document.getElementById('atd-ext-hospital');
      _externalHospital = extHosp ? extHosp.value.trim() : '';
      if (!_externalHospital) { alert('External Sending Facility Name is required.'); return; }
    }

    if (!_referringDoctor.trim()) { alert('Referring clinician is required.'); return; }
    if (!_treatingConsultant) { alert('Treating consultant doctor is required.'); return; }
    if (!_provisionalDiagnosis) { alert('Provisional Diagnosis is required.'); return; }
    if (!_referralSummary) { alert('Admission advice summary details are required.'); return; }

    _paymentRequestGenerated = true;
    _admissionStep = 'billing';
    
    var c = document.getElementById('main-content');
    if (c) renderWorkspace(c);
  };

  /* ── STEP 3: BILLING ADVANCE DEPOSIT SIMULATOR ───────────────── */
  function renderBillingStep() {
    var branchRate = WARD_RATES[_wardPreference];
    var minDeposit = branchRate.minDeposit;
    var p = _selectedPatient;

    var statusMessageHTML = '';
    var proceedBtnHTML = '';

    if (_advancePaidAmount >= minDeposit || _tpaApproved) {
      statusMessageHTML = `
        <div style="background: #d1fae5; border: 1.5px solid #34d399; color: #065f46; border-radius: 8px; padding: 16px; margin-bottom: 20px; font-weight: 700;">
          🎉 Gating Checked: Advance payment confirmed in patient account! (Received: ₹${_advancePaidAmount} ${_tpaApproved ? 'via TPA Approved Policy' : ''}). Bed Assignment enabled.
        </div>
      `;
      proceedBtnHTML = `<button class="btn btn-primary" style="background:#10b981;" onclick="window._atdProceedToIntakeForm()">Proceed to Intake Admission Form</button>`;
    } else {
      statusMessageHTML = `
        <div style="background: #fef2f2; border: 1.5px solid #fca5a5; color: #991b1b; border-radius: 8px; padding: 16px; margin-bottom: 20px; font-weight: 700; line-height: 1.4;">
          ⚠️ Gating Block: Minimum deposit of ${fmtMoney(minDeposit)} is required to allot bed space in Category: ${branchRate.name}. Please direct attender to the Billing Desk.
        </div>
      `;
      proceedBtnHTML = `<button class="btn btn-primary" style="opacity: 0.65; cursor: not-allowed;" disabled>Proceed to Intake Admission Form (Blocked)</button>`;
    }

    return `
      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px 16px; margin-bottom: 1.5rem; font-size: 13px;">
        👤 <strong>Patient:</strong> ${p.name} (${p.uhid}) · Preference: <strong>${branchRate.name}</strong> · Rate: <strong>${fmtMoney(branchRate.rate)}/day</strong>
      </div>

      ${statusMessageHTML}

      <div class="billing-desk-card">
        <div class="billing-desk-header">
          <span>🏦</span> <span>Hospital Billing Counter Simulator</span>
        </div>
        <p style="font-size: 12px; margin: 0 0 16px 0; color: var(--text-secondary); line-height:1.4;">
          This panel simulates the Cashier's ledger. Front desk staff can view the real-time status of payment request slips posted to the Billing desk ledger here.
        </p>

        <div style="display:grid; grid-template-columns: 1fr 1.25fr; gap: 20px; align-items: flex-end;">
          <div class="atd-field">
            <div class="atd-label">Simulation Deposit Amount <span>*</span></div>
            <input type="number" class="atd-input" id="sim-deposit-amount" placeholder="e.g. 5000" value="${minDeposit}">
          </div>
          <div>
            <div class="atd-label" style="margin-bottom: 6px;">Payment Method / TPA Route</div>
            <div style="display:flex; gap: 8px;">
              <select class="atd-select" id="sim-payment-mode" style="width: 140px;" onchange="window._atdUpdateSimMode(this.value)">
                <option value="UPI">UPI Payment</option>
                <option value="Cash">Cash Counter</option>
                <option value="Card">Credit Card</option>
                <option value="TPA Letter">TPA/Insurance Letter</option>
              </select>
              <button class="billing-desk-btn" onclick="window._atdSimulateDepositReceipt()">Simulate Counter Deposit</button>
            </div>
          </div>
        </div>
      </div>

      <div class="btn-row">
        <button class="btn btn-secondary" onclick="window._atdStepBack('referral')">← Back to Advice</button>
        ${proceedBtnHTML}
      </div>
    `;
  }

  window._atdUpdateSimMode = function(val) {
    _paymentMode = val;
  };

  window._atdSimulateDepositReceipt = function() {
    var amtInput = document.getElementById('sim-deposit-amount');
    if (!amtInput) return;
    var amt = parseInt(amtInput.value);

    if (isNaN(amt) || amt <= 0) {
      alert('Please enter a valid deposit amount.');
      return;
    }

    if (_paymentMode === 'TPA Letter') {
      _tpaApproved = true;
      _advancePaidAmount = 0;
      alert('📝 Insurance Pre-Auth Authorization Letter scanned successfully!\n\nCashless workflow activated, payment gate bypassed.');
    } else {
      _tpaApproved = false;
      _advancePaidAmount = amt;
      
      window.state.billing = window.state.billing || [];
      window.state.billing.push({
        invoiceId: 'DEP-INV-' + String(1000 + window.state.billing.length),
        uhid: _selectedPatient.uhid,
        patientName: _selectedPatient.name,
        amount: amt,
        status: 'Paid',
        date: getTodayStr(),
        details: 'IPD Admission Advance Deposit (' + WARD_RATES[_wardPreference].name + ')'
      });
      localStorage.setItem('saronil_billing', JSON.stringify(window.state.billing));
      alert(`🏦 Deposit Confirmed!\n\nReceipt printed: ₹${amt} via ${_paymentMode}\nPosted to Patient UHID ledger successfully.`);
    }

    var c = document.getElementById('main-content');
    if (c) renderWorkspace(c);
  };

  window._atdProceedToIntakeForm = function() {
    _admissionStep = 'form';
    var c = document.getElementById('main-content');
    if (c) renderWorkspace(c);
  };

  /* ── STEP 4: ADMISSION FORM ─────────────────────────────────── */
  function renderAdmissionFormStep() {
    var p = _selectedPatient;

    return `
      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px 16px; margin-bottom: 1.5rem; font-size: 13px;">
        👤 <strong>Patient:</strong> ${p.name} (${p.uhid}) · Treating under: <strong>${_treatingConsultant}</strong> · Diagnosis: <strong>${_provisionalDiagnosis}</strong>
      </div>

      <div class="atd-section-title">1. Residential Address confirmation</div>
      <div class="atd-field" style="margin-bottom: 1.25rem;">
        <div class="atd-label">Permanent Address (Mandatory for inpatient files) <span>*</span></div>
        <input type="text" class="atd-input" id="atd-address" placeholder="Verify or fill residential address" value="${p.address || ''}">
      </div>

      <div class="atd-section-title">2. Next of Kin (NOK) emergency details</div>
      <div class="nok-card">
        <div class="atd-grid">
          <div class="atd-field">
            <div class="atd-label">NOK Name <span>*</span></div>
            <input type="text" class="atd-input" id="nok-name" placeholder="Full name of emergency contact" value="${_nokName}">
          </div>
          <div class="atd-field">
            <div class="atd-label">NOK Relation <span>*</span></div>
            <select class="atd-select" id="nok-relation">
              <option value="Spouse" ${_nokRelation === 'Spouse' ? 'selected' : ''}>Spouse</option>
              <option value="Parent" ${_nokRelation === 'Parent' ? 'selected' : ''}>Parent</option>
              <option value="Sibling" ${_nokRelation === 'Sibling' ? 'selected' : ''}>Sibling</option>
              <option value="Child" ${_nokRelation === 'Child' ? 'selected' : ''}>Child</option>
              <option value="Other" ${_nokRelation === 'Other' ? 'selected' : ''}>Other Relative</option>
            </select>
          </div>
          <div class="atd-field">
            <div class="atd-label">NOK Mobile Number <span>*</span></div>
            <input type="tel" class="atd-input" id="nok-mobile" placeholder="10-digit mobile" maxlength="10" value="${_nokMobile}">
          </div>
        </div>
      </div>

      <div class="atd-section-title">3. TPA / Insurance / Schemes</div>
      <div class="atd-grid">
        <div class="atd-field">
          <div class="atd-label">CGHS / ECHS / PMJAY / ESI Schemes</div>
          <select class="atd-select" id="atd-scheme" onchange="window._atdUpdateScheme(this.value)">
            <option value="None" ${_schemeFlag === 'None' ? 'selected' : ''}>Private (No Scheme)</option>
            <option value="CGHS" ${_schemeFlag === 'CGHS' ? 'selected' : ''}>CGHS (Central Govt)</option>
            <option value="ECHS" ${_schemeFlag === 'ECHS' ? 'selected' : ''}>ECHS (Ex-Servicemen)</option>
            <option value="PMJAY" ${_schemeFlag === 'PMJAY' ? 'selected' : ''}>PMJAY (Ayushman Bharat)</option>
            <option value="ESI" ${_schemeFlag === 'ESI' ? 'selected' : ''}>ESI (Employees State Insurance)</option>
          </select>
        </div>
        <div class="atd-field" id="beneficiary-id-wrap" style="display: ${_schemeFlag !== 'None' ? 'flex' : 'none'};">
          <div class="atd-label">Beneficiary Card / Scheme ID <span>*</span></div>
          <input type="text" class="atd-input" id="atd-ben-id" placeholder="ID Number" value="${_beneficiaryId}">
        </div>
        <div class="atd-field">
          <div class="atd-label">Cashless Insurance Toggle</div>
          <select class="atd-select" id="tpa-toggle" onchange="window._atdTpaToggle(this.value)">
            <option value="No" ${!_tpaApproved && !_policyNumber ? 'selected' : ''}>No (Self/Scheme)</option>
            <option value="Yes" ${_tpaApproved || _policyNumber ? 'selected' : ''}>Yes (Private Cashless)</option>
          </select>
        </div>
      </div>

      <div class="atd-grid" id="tpa-details-wrap" style="display: ${(_tpaApproved || _policyNumber) ? 'grid' : 'none'};">
        <div class="atd-field">
          <div class="atd-label">Insurance Provider</div>
          <input type="text" class="atd-input" id="ins-provider" placeholder="e.g. Star Health Insurance" value="${_insuranceProvider}">
        </div>
        <div class="atd-field">
          <div class="atd-label">Policy / Card Number</div>
          <input type="text" class="atd-input" id="ins-policy" placeholder="e.g. Star-54821" value="${_policyNumber}">
        </div>
        <div class="atd-field">
          <div class="atd-label">TPA Administrator</div>
          <input type="text" class="atd-input" id="ins-tpa" placeholder="e.g. Medi Assist TPA" value="${_tpaName}">
        </div>
        <div class="atd-field">
          <div class="atd-label">Pre-Auth Approval status</div>
          <select class="atd-select" id="ins-status">
            <option value="Approved - LOA received" ${_preAuthStatus === 'Approved - LOA received' ? 'selected' : ''}>Approved - LOA received</option>
            <option value="Pending" ${_preAuthStatus === 'Pending' ? 'selected' : ''}>Pending Verification</option>
            <option value="Rejected" ${_preAuthStatus === 'Rejected' ? 'selected' : ''}>Rejected</option>
          </select>
        </div>
      </div>

      <div class="atd-grid">
        <div class="atd-field">
          <div class="atd-label">Is Medico-Legal Case (MLC)? <span>*</span></div>
          <select class="atd-select" id="atd-mlc">
            <option value="No" ${_mlcFlag === 'No' ? 'selected' : ''}>No</option>
            <option value="Yes" ${_mlcFlag === 'Yes' ? 'selected' : ''}>Yes (Enforces MLC tagging)</option>
          </select>
        </div>
        <div class="atd-field">
          <div class="atd-label">Admission Log Timestamp</div>
          <input type="text" class="atd-input" readonly value="${getTodayStr()} · ${getFormattedTime()}">
        </div>
      </div>

      ${_admType === 'Daycare' ? `
        <div class="atd-section-title">4. Daycare Procedure Details (Mandatory)</div>
        <div class="atd-grid">
          <div class="atd-field">
            <div class="atd-label">Select Planned Procedure <span>*</span></div>
            <select class="atd-select" id="dc-proc-name">
              <option value="">-- Choose Procedure --</option>
              ${PROCEDURES.map(pr => `<option value="${pr}" ${pr === _procedureName ? 'selected' : ''}>${pr}</option>`).join('')}
            </select>
          </div>
          <div class="atd-field">
            <div class="atd-label">Est. Procedure Time (hours) <span>*</span></div>
            <input type="number" class="atd-input" id="dc-proc-time" placeholder="e.g. 3" min="1" max="12" value="${_estProcedureTime}">
          </div>
          <div class="atd-field">
            <div class="atd-label">Pre-Op Instructions Verified? <span>*</span></div>
            <select class="atd-select" id="dc-preop">
              <option value="Yes" ${_preOpInstructions === 'Yes' ? 'selected' : ''}>Yes, completely followed</option>
              <option value="No" ${_preOpInstructions === 'No' ? 'selected' : ''}>No instructions given / Pending</option>
            </select>
          </div>
        </div>
        <div class="atd-grid">
          <div class="atd-field">
            <div class="atd-label">Fasting Status at Arrival <span>*</span></div>
            <select class="atd-select" id="dc-fasting" onchange="window._atdUpdateFasting(this.value)">
              <option value="Yes" ${_fastingStatus === 'Yes' ? 'selected' : ''}>Yes, Nil Per Os (NBM)</option>
              <option value="No" ${_fastingStatus === 'No' ? 'selected' : ''}>No, food/fluids consumed</option>
            </select>
          </div>
          <div class="atd-field" id="fasting-hrs-wrap" style="display: ${_fastingStatus === 'Yes' ? 'flex' : 'none'};">
            <div class="atd-label">Hours Fasted <span>*</span></div>
            <input type="number" class="atd-input" id="dc-fasting-hrs" placeholder="e.g. 8" value="${_hoursFasted}">
          </div>
        </div>
      ` : ''}

      <div class="atd-section-title">Clinical Safety Precaution Flags (Safety Alert Strip)</div>
      <div class="atd-grid" style="grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 15px; padding: 12px; background: #fff; border: 1px solid #e2e8f0; border-radius: 6px;">
        <label style="display:flex; align-items:center; gap:6px; font-size:11px; cursor:pointer;">
          <input type="checkbox" id="wiz-allergy-flag" ${_wizAllergyFlag ? 'checked' : ''}>
          <span style="color:#dc2626; font-weight:700;">🔴 Allergy Alert</span>
        </label>
        <label style="display:flex; align-items:center; gap:6px; font-size:11px; cursor:pointer;">
          <input type="checkbox" id="wiz-fall-risk" ${_wizFallRiskFlag ? 'checked' : ''}>
          <span style="color:#d97706; font-weight:700;">⚠️ Fall Risk</span>
        </label>
        <label style="display:flex; align-items:center; gap:6px; font-size:11px; cursor:pointer;">
          <input type="checkbox" id="wiz-dnr-flag" ${_wizDnrFlag ? 'checked' : ''}>
          <span style="color:#7c3aed; font-weight:700;">🟣 Purple DNR</span>
        </label>
        <label style="display:flex; align-items:center; gap:6px; font-size:11px; cursor:pointer;">
          <input type="checkbox" id="wiz-limb-flag" ${_wizLimbPrecautionFlag ? 'checked' : ''}>
          <span style="color:#db2777; font-weight:700;">🌸 Precaution</span>
        </label>
      </div>

      <div class="btn-row">
        <button class="btn btn-secondary" onclick="window._atdStepBack('billing')">← Back to Payment</button>
        <button class="btn btn-primary" onclick="window._atdSaveAdmissionForm()">Save & Choose Bed space</button>
      </div>
    `;
  }

  window._atdUpdateScheme = function(val) {
    _schemeFlag = val;
    var el = document.getElementById('beneficiary-id-wrap');
    if (el) el.style.display = (val !== 'None') ? 'flex' : 'none';
  };

  window._atdTpaToggle = function(val) {
    var el = document.getElementById('tpa-details-wrap');
    if (el) el.style.display = (val === 'Yes') ? 'grid' : 'none';
  };

  window._atdUpdateFasting = function(val) {
    _fastingStatus = val;
    var el = document.getElementById('fasting-hrs-wrap');
    if (el) el.style.display = (val === 'Yes') ? 'flex' : 'none';
  };

  window._atdSaveAdmissionForm = function() {
    var addrEl = document.getElementById('atd-address');
    var nokNmEl = document.getElementById('nok-name');
    var nokRelEl = document.getElementById('nok-relation');
    var nokMobEl = document.getElementById('nok-mobile');
    var schemeEl = document.getElementById('atd-scheme');
    var benIdEl = document.getElementById('atd-ben-id');
    var tpaTgl = document.getElementById('tpa-toggle');
    var mlcEl = document.getElementById('atd-mlc');

    var address = addrEl ? addrEl.value.trim() : '';
    _nokName = nokNmEl ? nokNmEl.value.trim() : '';
    _nokRelation = nokRelEl ? nokRelEl.value : 'Spouse';
    _nokMobile = nokMobEl ? nokMobEl.value.trim() : '';
    _schemeFlag = schemeEl ? schemeEl.value : 'None';
    _beneficiaryId = benIdEl ? benIdEl.value.trim() : '';
    _mlcFlag = mlcEl ? mlcEl.value : 'No';

    // Parse precaution flags from step 4
    _wizAllergyFlag = document.getElementById('wiz-allergy-flag')?.checked || false;
    _wizFallRiskFlag = document.getElementById('wiz-fall-risk')?.checked || false;
    _wizDnrFlag = document.getElementById('wiz-dnr-flag')?.checked || false;
    _wizLimbPrecautionFlag = document.getElementById('wiz-limb-flag')?.checked || false;

    if (!address) { alert('Residential address confirmation is mandatory for inpatient files.'); return; }
    if (!_nokName) { alert('Emergency Next-of-Kin (NOK) contact name is required.'); return; }
    if (!_nokMobile || _nokMobile.length !== 10) { alert('Emergency NOK 10-digit mobile number is required.'); return; }
    if (_schemeFlag !== 'None' && !_beneficiaryId) { alert('Scheme Beneficiary Card / ID is required.'); return; }

    if (tpaTgl && tpaTgl.value === 'Yes') {
      var insProv = document.getElementById('ins-provider');
      var insPol = document.getElementById('ins-policy');
      var insTpa = document.getElementById('ins-tpa');
      var insStat = document.getElementById('ins-status');

      _insuranceProvider = insProv ? insProv.value.trim() : '';
      _policyNumber = insPol ? insPol.value.trim() : '';
      _tpaName = insTpa ? insTpa.value.trim() : '';
      _preAuthStatus = insStat ? insStat.value : 'Pending';

      if (!_insuranceProvider || !_policyNumber) {
        alert('Insurance Provider and Policy Card Number are required for Cashless routes.');
        return;
      }
    }

    if (_admType === 'Daycare') {
      var procNm = document.getElementById('dc-proc-name');
      var procTm = document.getElementById('dc-proc-time');
      var preop = document.getElementById('dc-preop');
      var fasting = document.getElementById('dc-fasting');

      _procedureName = procNm ? procNm.value : '';
      _estProcedureTime = procTm ? procTm.value.trim() : '';
      _preOpInstructions = preop ? preop.value : 'No';
      _fastingStatus = fasting ? fasting.value : 'No';

      if (!_procedureName) { alert('Planned Daycare Procedure is required.'); return; }
      if (!_estProcedureTime) { alert('Estimated procedure duration is required.'); return; }
      
      if (_fastingStatus === 'Yes') {
        var fHrs = document.getElementById('dc-fasting-hrs');
        _hoursFasted = fHrs ? fHrs.value.trim() : '0';
        if (!_hoursFasted || isNaN(parseInt(_hoursFasted))) {
          alert('Fasting hours count is required.');
          return;
        }
      }
    }

    _selectedPatient.address = address;
    _selectedPatient.emergencyContact = {
      name: _nokName,
      relation: _nokRelation,
      phone: _nokMobile
    };
    if (_mlcFlag === 'Yes') {
      if (!_selectedPatient.alerts.includes('MLC Case')) {
        _selectedPatient.alerts.push('MLC Case');
      }
      if (!_selectedPatient.flags.includes('MLC')) {
        _selectedPatient.flags.push('MLC');
      }
    }

    _admissionStep = 'bed';
    var c = document.getElementById('main-content');
    if (c) renderWorkspace(c);
  };

  /* ── STEP 5: BED ASSIGNMENT ─────────────────────────────────── */
  function renderBedAssignmentStep() {
    var wardInfo = window.state.wards[_wardPreference];
    if (!wardInfo) return '<p>Ward configuration not found.</p>';

    var p = _selectedPatient;
    var beds = wardInfo.beds || [];

    // Calculate overall IPD bed occupancy to enforce 30% free rule
    var totalIpdBeds = 0;
    var occupiedIpdBeds = 0;
    Object.keys(window.state.wards || {}).forEach(wk => {
      if (wk !== 'EMERGENCY' && wk !== 'DAYCARE') {
        var wBeds = window.state.wards[wk].beds || [];
        totalIpdBeds += wBeds.length;
        wBeds.forEach(bId => {
          var bObj = window.state.bedsStatus[bId];
          if (bObj && (bObj.status === 'Occupied' || bObj.status === 'Reserved')) {
            occupiedIpdBeds++;
          }
        });
      }
    });

    var freeIpdBeds = totalIpdBeds - occupiedIpdBeds;
    var freeIpdPct = totalIpdBeds > 0 ? (freeIpdBeds / totalIpdBeds) * 100 : 100;
    
    var isIpdWard = (_wardPreference !== 'EMERGENCY' && _wardPreference !== 'DAYCARE');
    var wouldViolateReserve = false;
    var nextFreePct = freeIpdPct;

    if (isIpdWard && _allottedBed) {
      // If we are allocating a bed, check if it pushes free percentage below 30%
      var nextOccupied = occupiedIpdBeds;
      var currentBedStatusObj = window.state.bedsStatus[_allottedBed];
      if (!currentBedStatusObj || currentBedStatusObj.status === 'Available') {
        nextOccupied++;
      }
      nextFreePct = ((totalIpdBeds - nextOccupied) / totalIpdBeds) * 100;
      if (nextFreePct < 30) {
        wouldViolateReserve = true;
      }
    }

    var bannerHTML = '';
    if (isIpdWard) {
      var statusColor = freeIpdPct < 30 ? '#ef4444' : (freeIpdPct < 40 ? '#f59e0b' : '#10b981');
      var statusBg = freeIpdPct < 30 ? '#fee2e2' : (freeIpdPct < 40 ? '#fef3c7' : '#f0fdf4');
      var statusBorder = freeIpdPct < 30 ? '#fca5a5' : (freeIpdPct < 40 ? '#fde047' : '#bbf7d0');
      
      bannerHTML = `
        <div style="background:${statusBg}; border:1px solid ${statusBorder}; border-radius:12px; padding:14px 18px; margin-bottom:20px; display:flex; justify-content:space-between; align-items:center; font-family:'Inter', sans-serif;">
          <div>
            <div style="font-size:12px; font-weight:800; color:${statusColor}; display:flex; align-items:center; gap:6px;">
              <span>🚨</span> IPD Emergency Reserve Status (30% Vacancy Requirement)
            </div>
            <div style="font-size:11.5px; color:#4b5563; margin-top:3px;">
              Total IPD Beds: <strong>${totalIpdBeds}</strong> &bull; Occupied/Reserved: <strong>${occupiedIpdBeds}</strong> &bull; Vacant: <strong>${freeIpdBeds}</strong> (<strong>${freeIpdPct.toFixed(1)}%</strong> free)
            </div>
          </div>
          <div style="background:#fff; border:1.5px solid ${statusColor}; color:${statusColor}; padding:4px 10px; border-radius:6px; font-size:11px; font-weight:800; text-transform:uppercase; letter-spacing:0.5px;">
            ${freeIpdPct < 30 ? 'Overcapacity Warning' : (freeIpdPct < 40 ? 'Warning: Low Reserve' : 'Reserve Maintained')}
          </div>
        </div>
      `;

      if (wouldViolateReserve) {
        bannerHTML += `
          <div style="background:#fee2e2; border:1px solid #fca5a5; border-radius:12px; padding:14px 18px; margin-bottom:20px; display:flex; align-items:center; gap:12px; font-family:'Inter', sans-serif;">
            <span style="font-size:20px;">🛑</span>
            <div>
              <div style="font-size:12px; font-weight:800; color:#b91c1c;">Admission Blocked: Safety Reserve Reserve Threshold Exceeded</div>
              <div style="font-size:11.5px; color:#991b1b; margin-top:2px;">
                Admitting this patient reduces IPD vacancy to <strong>${nextFreePct.toFixed(1)}%</strong> (Limit: 30.0%). Admissions are restricted to preserve critical trauma & emergency capacity.
              </div>
            </div>
          </div>
        `;
      }
    }

    var consentPassed = _wizConsentSigned || _wizEmergencyImpliedConsent;
    var wristbandPassed = _wizWristbandPrinted;
    var bedSelected = _allottedBed ? true : false;
    var isEnabled = bedSelected && !wouldViolateReserve && consentPassed && wristbandPassed;
    
    var btnBg = wouldViolateReserve ? '#dc2626' : '#7c3aed';
    var btnText = 'Confirm Bed Assignment & Allot space';
    if (!isEnabled) {
      if (wouldViolateReserve) {
        btnText = 'Blocked by Emergency Cap';
      } else {
        var reasons = [];
        if (!bedSelected) reasons.push('Choose Bed');
        if (!consentPassed) reasons.push('Consent');
        if (!wristbandPassed) reasons.push('Wristband');
        btnText = `Awaiting: ${reasons.join(', ')}`;
      }
    }

    return `
      ${bannerHTML}
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 1.5rem;">
        <!-- Left Side: Patient details -->
        <div style="background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; padding: 16px; font-size: 12.5px; line-height: 1.5; display:flex; flex-direction:column; justify-content:center;">
          <div>👤 <strong>Patient:</strong> <span style="font-size:14px; font-weight:700;">${p.name}</span> (${p.uhid})</div>
          <div>🩺 <strong>Admitting Consultant:</strong> ${_treatingConsultant || 'Not Assigned'}</div>
          <div>📋 <strong>Provisional Diagnosis:</strong> ${_provisionalDiagnosis || 'Not Documented'}</div>
          <div>🛏️ <strong>Ward Preference:</strong> ${wardInfo.name}</div>
          <div style="margin-top: 8px; font-size: 11.5px; color:#475569;">
            <em>IPD Episode ADM ID will be generated upon final confirmation.</em>
          </div>
        </div>

        <!-- Right Side: Wristband Preview Card -->
        <div style="background: #ffffff; border: 1px solid #cbd5e1; border-radius: 8px; padding: 16px; display: flex; flex-direction: column; justify-content: space-between;">
          <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1.5px solid #f1f5f9; padding-bottom:6px; margin-bottom:10px;">
            <strong style="font-size:12px; color:#1e3a8a; text-transform:uppercase;">🏷️ Wearable Wristband Preview</strong>
            <button class="btn btn-secondary btn-xs" style="font-size:10px; padding:3px 6px;" onclick="window._wizPrintWristbandManual()">🖨️ Print Wristband</button>
          </div>
          
          <!-- Band layout -->
          <div style="border: 2px dashed #cbd5e1; border-radius: 8px; padding: 12px; background: #faf5ff; display:flex; justify-content:space-between; align-items:center;">
            <div style="font-size:10px; font-family:monospace; line-height:1.4;">
              <strong>UHID:</strong> ${p.uhid}<br>
              <strong>IPD NO:</strong> IP-2400${String(5000 + (window.state.admissions || []).length + 1)}<br>
              <strong>NAME:</strong> ${p.name.toUpperCase()}<br>
              <strong>SEX/AGE:</strong> ${p.gender.toUpperCase()} / ${p.age}Y<br>
              <strong>BED:</strong> <span style="color:#7c3aed; font-weight:bold;">${_allottedBed || 'Awaiting Selection'}</span><br>
              <strong>DOC:</strong> ${_treatingConsultant.toUpperCase()}
            </div>
            <div style="display:flex; flex-direction:column; align-items:center; gap:4px;">
              <img src="https://barcode.tec-it.com/barcode.ashx?data=${p.uhid}&code=Code128&translate-esc=on" style="height:32px; max-width:85px;" alt="Wristband Barcode">
              <span style="font-size:8px; font-family:monospace; color:#64748b;">${p.uhid}</span>
            </div>
          </div>

          <!-- Color Flags Strip -->
          <div style="display: flex; gap: 6px; flex-wrap: wrap; margin-top: 8px;">
            ${_wizAllergyFlag ? `<span class="reg-badge" style="background:#fee2e2; color:#b91c1c; border:1px solid #fca5a5; font-size:9.5px; font-weight:800;">🔴 Allergy Alert</span>` : ''}
            ${_wizFallRiskFlag ? `<span class="reg-badge" style="background:#fef9c3; color:#713f12; border:1px solid #fde68a; font-size:9.5px; font-weight:800;">⚠️ Fall Risk</span>` : ''}
            ${_wizDnrFlag ? `<span class="reg-badge" style="background:#f3e8ff; color:#6b21a8; border:1px solid #e9d5ff; font-size:9.5px; font-weight:800;">🟣 Purple DNR</span>` : ''}
            ${_wizLimbPrecautionFlag ? `<span class="reg-badge" style="background:#fce7f3; color:#9d174d; border:1px solid #fbcfe8; font-size:9.5px; font-weight:800;">🌸 Precaution</span>` : ''}
            ${(!_wizAllergyFlag && !_wizFallRiskFlag && !_wizDnrFlag && !_wizLimbPrecautionFlag) ? `<span style="font-size:9.5px; color:#64748b; font-style:italic;">No active safety precaution flags.</span>` : ''}
          </div>
        </div>
      </div>

      <div class="bed-availability-title">Live Grid Space Map (${wardInfo.name})</div>
      
      <div class="ipd2-bed-legend" style="display:flex; gap:12px; font-size:11px; margin-bottom:12px;">
        <div class="ipd2-bed-legend-item"><span style="color:#10b981;">●</span> Available</div>
        <div class="ipd2-bed-legend-item"><span style="color:#ef4444;">●</span> Occupied</div>
        <div class="ipd2-bed-legend-item"><span style="color:#3b82f6;">●</span> Reserved</div>
        <div class="ipd2-bed-legend-item"><span style="color:#f59e0b;">●</span> Cleaning</div>
      </div>

      <div class="bed-grid" style="display:grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap:10px;">
        ${beds.map(function (bedId) {
          var statusObj = window.state.bedsStatus[bedId] || { status: 'Available' };
          var status = statusObj.status;
          var activeCls = (bedId === _allottedBed) ? 'selected' : '';

          var borderStyle = 'border: 1px solid #cbd5e1;';
          var badgeBg = '#64748b';
          var patientHTML = '';
          var cursor = 'cursor: pointer;';
          var onClickAction = `onclick="window._atdSelectBed('${bedId}', '${status}')"`;

          if (status === 'Occupied') {
            var p = window.state.patients.find(pt => pt.uhid === statusObj.patientUhid) || { name: 'Occupied', uhid: statusObj.patientUhid || 'SH-2026-0000' };
            borderStyle = 'border: 1.5px solid #3b82f6; background-color: #eff6ff;';
            badgeBg = '#2563eb';
            patientHTML = `
              <div style="font-size: 11px; font-weight: 800; color: #1e3a8a; margin-top: 4px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${p.name}</div>
              <div style="font-size: 9.5px; color: #4b5563; font-family: monospace;">${p.uhid}</div>
            `;
            cursor = 'cursor: not-allowed;';
            onClickAction = `onclick="alert('Bed ${bedId} is already occupied by ${p.name}. Please select an available bed.')"`;
          } else if (status === 'Available') {
            if (bedId === _allottedBed) {
              borderStyle = 'border: 2px solid #7c3aed; background-color: #f3e8ff;';
              badgeBg = '#7c3aed';
            } else {
              borderStyle = 'border: 1.5px solid #10b981; background-color: #f0fdf4;';
              badgeBg = '#10b981';
            }
            patientHTML = `
              <div style="font-size: 11px; font-weight: 700; color: #047857; margin-top: 4px;">Available</div>
              <div style="font-size: 9.5px; color: #047857;">Vacant</div>
            `;
          } else if (status === 'Cleaning') {
            borderStyle = 'border: 1.5px solid #f59e0b; background-color: #fef3c7;';
            badgeBg = '#d97706';
            patientHTML = `
              <div style="font-size: 11px; font-weight: 700; color: #b45309; margin-top: 4px;">Sanitizing</div>
              <div style="font-size: 9.5px; color: #b45309;">Housekeeping</div>
            `;
            cursor = 'cursor: not-allowed;';
            onClickAction = `onclick="alert('Bed ${bedId} is currently under cleaning/sanitization. Please select an available bed.')"`;
          } else if (status === 'Reserved') {
            borderStyle = 'border: 1.5px solid #8b5cf6; background-color: #f5f3ff;';
            badgeBg = '#7c3aed';
            patientHTML = `
              <div style="font-size: 11px; font-weight: 700; color: #5b21b6; margin-top: 4px;">Reserved</div>
              <div style="font-size: 9.5px; color: #5b21b6;">Awaiting Admit</div>
            `;
            cursor = 'cursor: not-allowed;';
            onClickAction = `onclick="alert('Bed ${bedId} is reserved for another patient. Please select an available bed.')"`;
          }

          return `
            <div class="bed-item ${status} ${activeCls}" style="padding: 10px; border-radius: 8px; text-align: left; display: flex; flex-direction: column; justify-content: space-between; min-height: 80px; transition: all 0.2s; box-shadow: 0 1px 2px rgba(0,0,0,0.02); ${borderStyle} ${cursor}" ${onClickAction}>
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="font-weight: 800; font-size: 11px; color: #334155;">${bedId}</span>
                <span style="font-size: 13px;">🛏️</span>
              </div>
              <div style="margin-top: 4px;">
                <span style="background: ${badgeBg}; color: white; padding: 1px 6px; border-radius: 12px; font-size: 8px; font-weight: 700; display: inline-block;">${status}</span>
              </div>
              ${patientHTML}
            </div>
          `;
        }).join('')}
      </div>

      <!-- Pre-Admission Safety & Documentation Checklist -->
      <div style="background:#f8fafc; border:1px solid #cbd5e1; border-radius:8px; padding:16px; margin: 20px 0; text-align: left;">
        <h4 style="margin:0 0 12px 0; font-size:12px; color:#1e3a8a; font-weight:800; border-bottom:1.5px solid #e2e8f0; padding-bottom:6px; display:flex; align-items:center; gap:6px;">
          📋 Pre-Admission Safety &amp; Documentation Checklist
        </h4>
        
        <div style="display: grid; grid-template-columns: 1.2fr 1fr; gap: 20px;">
          <!-- Consent Gate -->
          <div>
            <div style="display:flex; flex-direction:column; gap:8px;">
              <label style="display:flex; align-items:center; gap:8px; font-size:11.5px; cursor:pointer; font-weight:700;">
                <input type="checkbox" id="wiz-chk-consent-signed" ${_wizConsentSigned ? 'checked' : ''} onchange="window.updateWizConsentCheck(this.checked)">
                General Treatment &amp; Admission Consent Signed <span style="color:#dc2626;">*</span>
              </label>

              <!-- Emergency Implied Consent Path -->
              <div style="border-left: 3px solid #f59e0b; padding-left: 8px; margin-left: 12px; background: #fffbeb; padding: 6px 10px; border-radius: 4px;">
                <label style="display:flex; align-items:center; gap:6px; font-size:11px; cursor:pointer; color:#b45309; font-weight:700;">
                  <input type="checkbox" id="wiz-chk-emergency-consent" ${_wizEmergencyImpliedConsent ? 'checked' : ''} onchange="window.updateWizEmergencyConsent(this.checked)">
                  🚨 Emergency Implied Consent (By Admitting Doctor)
                </label>
                <div style="margin-top: 4px; display: ${_wizEmergencyImpliedConsent ? 'block' : 'none'};" id="wiz-emergency-doc-wrap">
                  <label style="font-size:10px; color:#475569; font-weight:600;">Admitting Doctor: </label>
                  <input type="text" id="wiz-emergency-doc-name" value="${_wizEmergencyImpliedConsentDoctor}" style="font-size:10px; padding:2px 4px; border:1px solid #cbd5e1; border-radius:3px; width:150px;" oninput="window.updateWizEmergencyDoc(this.value)">
                </div>
              </div>
            </div>
          </div>

          <!-- Wristband & Soft Checks Gate -->
          <div>
            <div style="display:flex; flex-direction:column; gap:8px;">
              <label style="display:flex; align-items:center; gap:8px; font-size:11.5px; cursor:pointer; font-weight:700; opacity: 0.95;">
                <input type="checkbox" id="wiz-chk-wristband-printed" ${_wizWristbandPrinted ? 'checked' : ''} disabled>
                Barcode Wristband Printed &amp; Verified <span style="color:#dc2626;">*</span>
              </label>
              <div id="wristband-status-alert" style="font-size:10px; margin-left:20px; margin-top:-4px; margin-bottom:4px;">
                ${_wizWristbandPrinted ? `<span style="color:#166534; font-weight:700;">✓ Barcode Wristband generated & printed successfully.</span>` : `<span style="color:#b91c1c; font-weight:700;">✗ Awaiting Print (Click "Print Wristband" above)...</span>`}
              </div>

              <div style="display:flex; gap:16px; margin-top:4px; border-top:1px dashed #cbd5e1; padding-top:8px;">
                <label style="display:flex; align-items:center; gap:6px; font-size:11px; cursor:pointer;">
                  <input type="checkbox" id="wiz-chk-diet" ${_wizDietOrderIssued ? 'checked' : ''} onchange="window.updateWizDietCheck(this.checked)">
                  🍏 Diet Order Issued
                </label>
                <label style="display:flex; align-items:center; gap:6px; font-size:11px; cursor:pointer;">
                  <input type="checkbox" id="wiz-chk-valuables" ${_wizValuablesRecorded ? 'checked' : ''} onchange="window.updateWizValuablesCheck(this.checked)">
                  💍 Valuables Recorded
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="btn-row" style="margin-top:20px;">
        <button class="btn btn-secondary" onclick="window._atdStepBack('form')">← Back to Form</button>
        <button class="btn btn-primary" id="confirm-allotment-btn" style="background: ${btnBg}; opacity: ${isEnabled ? '1' : '0.5'};" ${!isEnabled ? 'disabled' : ''} onclick="window._atdFinalizeAdmission()">
          ${btnText}
        </button>
      </div>
    `;
  }

  window._atdSelectBed = function(bedId, status) {
    if (status !== 'Available') {
      alert(`Bed ${bedId} is currently ${status} and cannot be assigned.`);
      return;
    }
    _allottedBed = bedId;
    var c = document.getElementById('main-content');
    if (c) renderWorkspace(c);
  };

  // Pre-Admission Checklist Checkbox State Handlers
  window.updateWizConsentCheck = function(checked) {
    _wizConsentSigned = checked;
    if (checked) {
      _wizEmergencyImpliedConsent = false;
    }
    var c = document.getElementById('main-content');
    if (c) renderWorkspace(c);
  };

  window.updateWizEmergencyConsent = function(checked) {
    _wizEmergencyImpliedConsent = checked;
    if (checked) {
      _wizConsentSigned = false;
    }
    var c = document.getElementById('main-content');
    if (c) renderWorkspace(c);
  };

  window.updateWizEmergencyDoc = function(val) {
    _wizEmergencyImpliedConsentDoctor = val;
  };

  window.updateWizDietCheck = function(checked) {
    _wizDietOrderIssued = checked;
  };

  window.updateWizValuablesCheck = function(checked) {
    _wizValuablesRecorded = checked;
  };

  window._wizPrintWristbandManual = function() {
    _wizWristbandPrinted = true;
    alert("🖨️ Spooling wristband job: Barcode Wristband printed successfully (Logged event).");
    var c = document.getElementById('main-content');
    if (c) renderWorkspace(c);
  };

  window._atdFinalizeAdmission = function() {
    if (!_allottedBed) return;

    // Checklist Hard Gates Check
    var consentPassed = _wizConsentSigned || _wizEmergencyImpliedConsent;
    var wristbandPassed = _wizWristbandPrinted;
    if (!consentPassed || !wristbandPassed) {
      alert("❌ Admission Blocked: Hard gates not satisfied. Ensure Treatment Consent is checked (or Doctor Emergency Implied Consent is logged) and Barcode Wristband is printed.");
      return;
    }

    // Strict 30% IPD reserve check
    var isIpdWard = (_wardPreference !== 'EMERGENCY' && _wardPreference !== 'DAYCARE');
    if (isIpdWard) {
      var totalIpdBeds = 0;
      var occupiedIpdBeds = 0;
      Object.keys(window.state.wards || {}).forEach(wk => {
        if (wk !== 'EMERGENCY' && wk !== 'DAYCARE') {
          var wBeds = window.state.wards[wk].beds || [];
          totalIpdBeds += wBeds.length;
          wBeds.forEach(bId => {
            var bObj = window.state.bedsStatus[bId];
            if (bObj && (bObj.status === 'Occupied' || bObj.status === 'Reserved')) {
              occupiedIpdBeds++;
            }
          });
        }
      });

      var currentBedStatusObj = window.state.bedsStatus[_allottedBed];
      var nextOccupied = occupiedIpdBeds;
      if (!currentBedStatusObj || currentBedStatusObj.status === 'Available') {
        nextOccupied++;
      }
      var nextFreePct = ((totalIpdBeds - nextOccupied) / totalIpdBeds) * 100;
      if (nextFreePct < 30) {
        alert("❌ Admission Blocked: Saronil hospital emergency reserve policy restricts further admissions. At least 30% of IPD beds must remain vacant for trauma/triage cases.");
        return;
      }
    }

    var p = _selectedPatient;
    var seq = String(5000 + (window.state.admissions || []).length + 1);
    _generatedAdmNo = 'ADM-2026-0' + seq;

    var admissionObj = {
      id: 'ADM' + seq,
      uhid: p.uhid,
      patientName: p.name,
      date: getTodayStr(),
      ward: _wardPreference,
      bed: _allottedBed,
      doctorName: _treatingConsultant,
      diagnosis: _provisionalDiagnosis,
      status: 'Active'
    };

    window.state.admissions = window.state.admissions || [];
    window.state.admissions.push(admissionObj);

    if (_admType === 'Daycare') {
      window.state.daycareAdmissions = window.state.daycareAdmissions || [];
      window.state.daycareAdmissions.push({
        patient: p,
        bedId: _allottedBed,
        ward: WARD_RATES[_wardPreference].name,
        bedNo: _allottedBed,
        consultantName: _treatingConsultant,
        procedureName: _procedureName,
        admissionType: 'Daycare',
        admissionTimestamp: getTodayStr() + 'T' + new Date().toISOString().slice(11,19),
        status: 'Registered',
        dischargeClearances: { clinical: false, billing: false, summaryReady: false },
        historyLogs: [{ timestamp: new Date().toISOString(), action: 'Daycare Bed Allocated & Registered' }]
      });
    }

    window.state.bedsStatus[_allottedBed] = {
      wardKey: _wardPreference,
      status: 'Occupied',
      patientUhid: p.uhid,
      notes: `Admitted: ${_admType} under ${_treatingConsultant} (${_provisionalDiagnosis})`
    };

    var ipdNo = 'IP-2400' + seq;
    p.type = _admType;
    p.status = 'Admitted';
    p.ward = WARD_RATES[_wardPreference].name;
    p.bed = _allottedBed;
    p.ipNumber = ipdNo;
    p.barcode = ipdNo; // permanent two-identifier credential
    admissionObj.barcode = ipdNo; // link admission record
    p.primaryConsultant = _treatingConsultant;
    p.department = (window.state.doctors.find(d => d.name === _treatingConsultant) || { spec: 'General Medicine' }).spec;
    p.dischargeStatus = 'Not Initiated';
    p.dischargeOrder = null;
    p.dischargeClearances = null;

    // Log the print event in WristbandRecord
    window.state.wristbandRecords = window.state.wristbandRecords || [];
    var flags = [];
    if (_wizAllergyFlag) flags.push('allergy');
    if (_wizFallRiskFlag) flags.push('fall_risk');
    if (_wizDnrFlag) flags.push('dnr');
    if (_wizLimbPrecautionFlag) flags.push('limb_precaution');

    window.state.wristbandRecords.push({
      wristband_id: 'WB-' + Date.now(),
      admission_id: _generatedAdmNo,
      barcode_value: ipdNo,
      color_flags: flags,
      printed_at: new Date().toISOString(),
      printed_by: window._ipdActiveRole || 'ATD Coordinator'
    });
    localStorage.setItem('saronil_wristbandRecords', JSON.stringify(window.state.wristbandRecords));

    // Create audit log for wristband print event
    window.state.auditLogs = window.state.auditLogs || [];
    window.state.auditLogs.push({
      timestamp: new Date().toISOString(),
      action: 'WRISTBAND_PRINT',
      user: window._ipdActiveRole || 'ATD Coordinator',
      details: `Wristband printed for ${p.name} (${p.uhid}). Barcode: ${ipdNo}. Flags: ${flags.join(',') || 'None'}`
    });

    window.state.logBedMovement({
      patientId: p.uhid,
      bedId: _allottedBed,
      wardKey: _wardPreference,
      prevStatus: 'Available',
      newStatus: 'Occupied',
      action: 'Admitted',
      remarks: `Initial admission to ${p.ward}`
    });

    // Remove from pending admission requests
    window.state.admissionRequests = (window.state.admissionRequests || []).filter(r => r.uhid !== p.uhid);
    localStorage.setItem('saronil_admissionRequests', JSON.stringify(window.state.admissionRequests));

    localStorage.setItem('saronil_patients', JSON.stringify(window.state.patients));
    localStorage.setItem('saronil_admissions', JSON.stringify(window.state.admissions));
    localStorage.setItem('saronil_bedsStatus', JSON.stringify(window.state.bedsStatus));
    if (window.state.daycareAdmissions) {
      localStorage.setItem('saronil_daycare_admissions', JSON.stringify(window.state.daycareAdmissions));
    }

    _admissionStep = 'success';
    var c = document.getElementById('main-content');
    if (c) renderWorkspace(c);

    // Automatically trigger barcode sticker generation after bed assignment is saved
    setTimeout(function() {
      if (window._generatePatientBarcodeStickers) {
        window._generatePatientBarcodeStickers(p.uhid);
      }
    }, 200);
  };


  /* ── BILLING COUNTER OPERATOR ACTIONS ─────────────────────── */
  window._billingOpen = function(reqId) {
    var req = window.state.admissionRequests.find(r => r.id === reqId);
    if (!req) return;
    var wardMeta = WARD_RATES[req.ward];
    _billingTargetReqId = reqId;
    _billingCollectedAmount = (req.payerType && ['CGHS', 'PMJAY', 'ECHS', 'ESI'].includes(req.payerType)) ? 0 : (wardMeta ? wardMeta.minDeposit : 10000);
    _billingCollectedMode = 'UPI';
    _billingModalOpen = true;
    var c = document.getElementById('main-content');
    if (c) renderWorkspace(c);
  };

  window._billingClose = function() {
    _billingModalOpen = false;
    _billingTargetReqId = '';
    var c = document.getElementById('main-content');
    if (c) renderWorkspace(c);
  };

  window._billingSave = function() {
    var req = window.state.admissionRequests.find(r => r.id === _billingTargetReqId);
    if (!req) return;

    var amtInput = document.getElementById('billing-input-amt');
    var amt = amtInput ? parseInt(amtInput.value) : _billingCollectedAmount;
    if (isNaN(amt) || amt < 0) {
      alert('Please enter a valid deposit amount.');
      return;
    }

    req.advancePaid = true;
    req.status = 'Confirmed';
    req.depositAmount = amt;
    req.depositReceiptId = 'DEP-REC-' + String(Math.floor(100000 + Math.random() * 900000));

    // Save Billing Ledger Entry
    window.state.billing = window.state.billing || [];
    window.state.billing.push({
      id: 'IPD-DEP-' + String(3000 + window.state.billing.length),
      uhid: req.uhid,
      patientName: req.name,
      amount: amt,
      paid: amt,
      status: 'Paid',
      date: new Date().toISOString().slice(0, 10),
      items: [
        { desc: 'IPD Advance Deposit (' + WARD_RATES[req.ward].name + ')', qty: 1, rate: amt, total: amt }
      ]
    });

    // Save Audit Log
    window.state.auditLogs = window.state.auditLogs || [];
    window.state.auditLogs.push({
      timestamp: new Date().toISOString(),
      action: 'IPD_ADMISSION_CONFIRM',
      user: 'Billing Counter Exec',
      details: 'Collected advance deposit ₹' + amt + ' for ' + req.name + ' (' + req.uhid + '). Status: Confirmed.'
    });

    localStorage.setItem('saronil_admissionRequests', JSON.stringify(window.state.admissionRequests));
    localStorage.setItem('saronil_billing', JSON.stringify(window.state.billing));

    alert(`Deposit Confirmed!\n\nPatient: ${req.name}\nReceipt: ${req.depositReceiptId}\nAmount: ₹${amt}\n\nStatus set to Confirmed. Notification triggered for nursing staff.`);
    
    _billingModalOpen = false;
    _billingTargetReqId = '';
    var c = document.getElementById('main-content');
    if (c) renderWorkspace(c);
  };

  /* ── EMERGENCY ADMISSION OVERRIDE ACTIONS ───────────────── */
  window._emergencyOverrideOpen = function(reqId) {
    _emergencyTargetReqId = reqId;
    _emergencyJustification = '';
    _emergencyDeferral = 'Within 24 Hours';
    _emergencyOverrideModalOpen = true;
    var c = document.getElementById('main-content');
    if (c) renderWorkspace(c);
  };

  window._emergencyOverrideClose = function() {
    _emergencyOverrideModalOpen = false;
    _emergencyTargetReqId = '';
    var c = document.getElementById('main-content');
    if (c) renderWorkspace(c);
  };

  window._emergencyOverrideSave = function() {
    var req = window.state.admissionRequests.find(r => r.id === _emergencyTargetReqId);
    if (!req) return;

    var justInput = document.getElementById('er-justification-input');
    var deferSelect = document.getElementById('er-deferral-select');
    
    var justification = justInput ? justInput.value.trim() : '';
    var deferral = deferSelect ? deferSelect.value : _emergencyDeferral;

    if (!justification) {
      alert('Please enter a clinical justification for the emergency override.');
      return;
    }

    req.emergencyOverride = {
      triggeredBy: window._ipdActiveRole,
      justification: justification,
      depositDeferredUntil: deferral,
      timestamp: new Date().toISOString()
    };
    req.status = 'Emergency Confirmed';
    req.advancePaid = false; // Deferred payment

    // Save to historical overrides log for Retrospective Admin Review
    window.state.emergencyOverridesHistory = window.state.emergencyOverridesHistory || [];
    window.state.emergencyOverridesHistory.push({
      admissionId: req.id,
      uhid: req.uhid,
      patientName: req.name,
      triggeredBy: window._ipdActiveRole,
      justification: justification,
      depositDeferredUntil: deferral,
      timestamp: new Date().toISOString(),
      status: 'Admitted',
      reviewed: false,
      reviewedBy: null,
      reviewedAt: null
    });
    localStorage.setItem('saronil_emergencyOverridesHistory', JSON.stringify(window.state.emergencyOverridesHistory));

    // Save Audit Log
    window.state.auditLogs = window.state.auditLogs || [];
    window.state.auditLogs.push({
      timestamp: new Date().toISOString(),
      action: 'EMERGENCY_ADMISSION_OVERRIDE',
      user: window._ipdActiveRole,
      details: 'ER Override for ' + req.name + ' (' + req.uhid + '). Justification: ' + justification
    });

    localStorage.setItem('saronil_admissionRequests', JSON.stringify(window.state.admissionRequests));

    alert(`Emergency Override Authorized!\n\nPatient: ${req.name}\nBypass: Active\n\nBed allocation is enabled. Deposit deferred: ${deferral}.`);

    // Simulated Hospital Administrator SMS Alert Notification
    console.log(`[ADMIN ALERT SENT] Critical Emergency Override triggered by ${window._ipdActiveRole} for ${req.name} (${req.uhid}). Justification: ${justification}`);

    _emergencyOverrideModalOpen = false;
    _emergencyTargetReqId = '';
    var c = document.getElementById('main-content');
    if (c) renderWorkspace(c);
  };

  /* ── SUCCESS PRINT VIEW ─────────────────────────────────────── */
  function renderSuccessConfirmation() {
    var p = _selectedPatient;
    var wardName = WARD_RATES[_wardPreference].name;

    return `
      <div class="ipd2-success">
        <div class="ipd2-success-icon">✨</div>
        <h2>Patient Admitted Successfully!</h2>
        <div style="font-size: 13px; color: var(--text-secondary); margin-top: 4px;">Bed spaces successfully updated in live census map</div>
        
        <div class="ipd2-success-adm-no">${_generatedAdmNo}</div>

        <div class="ipd2-wristband" style="max-width:320px; border:1px solid #000; padding:12px; margin: 15px auto; text-align:left; font-family:monospace; font-size:11px;">
          <div style="text-align:center; font-weight:800; font-size:12px; margin-bottom:8px; border-bottom:1px solid #333; padding-bottom:4px;">🏥 SARONIL CLINICAL WRISTBAND</div>
          <div>PATIENT: <strong>${p.name}</strong></div>
          <div>UHID: <strong>${p.uhid}</strong></div>
          <div>IPD NO: <strong>${p.ipNumber}</strong></div>
          <div>AGE/SEX: ${p.age}y / ${p.gender}</div>
          <div>WARD/BED: ${wardName} / ${p.bed}</div>
          <div>CONSULTANT: ${p.primaryConsultant}</div>
          <div style="text-align:center; margin-top:8px; border-top:1px dashed #333; padding-top:4px; font-size:10px;">|||| | || ||||| | |||| BARCODE</div>
        </div>

        <div style="background:#f0fdf4; border:1px solid #bbf7d0; border-radius:8px; padding:12px; max-width:480px; margin: 15px auto; text-align:left; color:var(--text-primary);">
          <div style="font-weight:bold; font-size:12.5px; color:#15803d; margin-bottom:6px; display:flex; align-items:center; gap:4px;">📦 Dispatch Admission Kit to Room ${p.bed || 'Ward'}</div>
          <div style="font-size:11px; color:#166534; margin-bottom:10px;">Select an admission kit type below to automatically raise a stock request and dispatch it to the ward:</div>
          <div style="display:flex; gap:8px; justify-content:start; flex-wrap:wrap;">
            <button class="btn btn-primary btn-xs" style="background:#16a34a; font-size:9.5px; padding:3px 8px; border:none;" onclick="window.showStockRequestOverlay({dept:'IPD Admission', urgency:'Routine', prefillItem:{code:'ITM-KIT-GW', name:'General Ward Kit', qty:1, unit:'kit', purpose:'General Ward Kit (towel, gown, slippers, basic toiletries)'}, prefillType:'Consumable'})">GW Kit</button>
            <button class="btn btn-primary btn-xs" style="background:#16a34a; font-size:9.5px; padding:3px 8px; border:none;" onclick="window.showStockRequestOverlay({dept:'IPD Admission', urgency:'Urgent', prefillItem:{code:'ITM-KIT-ICU', name:'ICU Kit', qty:1, unit:'kit', purpose:'ICU Kit (gown, sterile slippers, antiseptic wipes)'}, prefillType:'Consumable'})">ICU Kit</button>
            <button class="btn btn-primary btn-xs" style="background:#16a34a; font-size:9.5px; padding:3px 8px; border:none;" onclick="window.showStockRequestOverlay({dept:'IPD Admission', urgency:'Routine', prefillItem:{code:'ITM-KIT-PVT', name:'Private Ward Kit', qty:1, unit:'kit', purpose:'Private Ward Kit (premium toiletries, gown, bath towel, slippers)'}, prefillType:'Consumable'})">Private Kit</button>
          </div>
        </div>

        <div style="display:flex; gap:10px; justify-content:center; flex-wrap:wrap; margin-top: 24px;">
          <button class="btn btn-primary" onclick="window._ipdSwitchTab('dashboard')">📊 View Dashboard Queues</button>
          <button class="btn btn-secondary" onclick="window.router.navigate('patients?uhid=${p.uhid}&name=${encodeURIComponent(p.name)}')">📋 Open Patient Profile</button>
          <button class="btn btn-secondary" onclick="window._generatePatientBarcodeStickers('${p.uhid}')">🏷️ Print Barcode Stickers</button>
          <button class="btn btn-secondary" onclick="window._atdPrintWristband()">🖨️ Print Band & Exit</button>
        </div>
      </div>
    `;
  }


  window._atdPrintWristband = function() {
    alert('🖨️ Wristband printed to ZEBRA Thermal Wristband Printer A.');
    _admissionStep = 'lookup';
    _selectedPatient = null;
    _allottedBed = null;
    _advancePaidAmount = 0;
    _tpaApproved = false;
    _activeTab = 'dashboard';
    
    var c = document.getElementById('main-content');
    if (c) renderWorkspace(c);
  };

  window._generatePatientBarcodeStickers = function(uhid) {
    var pat = window.state.patients.find(p => p.uhid === uhid);
    if (!pat) return;

    var existingOverlay = document.getElementById('barcode-stickers-overlay');
    if (existingOverlay) existingOverlay.remove();

    var overlay = document.createElement('div');
    overlay.id = 'barcode-stickers-overlay';
    overlay.style.cssText = 'position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(15,23,42,0.6); backdrop-filter:blur(4px); display:flex; align-items:center; justify-content:center; z-index:20000; font-family:"Outfit", sans-serif;';

    // Generate 4 barcode stickers
    var stickersHtml = '';
    for (var i = 0; i < 4; i++) {
      stickersHtml += `
        <div style="border: 2px dashed #94a3b8; border-radius: 8px; padding: 12px; background: #fff; display: flex; flex-direction: column; gap: 4px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); width: 220px; font-size: 11px; font-family: monospace; color: #000; text-align: left;">
          <div style="text-align: center; font-weight: 800; font-size: 11px; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; text-transform: uppercase; color: #1e3a8a;">Saronil Hospital</div>
          <div style="margin-top: 4px;"><strong>NAME:</strong> ${pat.name}</div>
          <div><strong>UHID:</strong> ${pat.uhid}</div>
          <div><strong>IPD NO:</strong> ${pat.ipNumber || '—'}</div>
          <div><strong>WARD/BED:</strong> ${pat.bed ? (pat.ward + ' / ' + pat.bed) : 'Awaiting Assignment'}</div>
          <div><strong>DOC:</strong> ${pat.primaryConsultant || 'Dr. Priya Nair'}</div>
          <div style="margin-top: 6px; text-align: center; font-size: 9px; letter-spacing: 1px; line-height: 1;">
            ||||| ||| |||| || ||| ||||<br>
            <span style="font-size: 8px;">*${pat.uhid}*</span>
          </div>
        </div>
      `;
    }

    overlay.innerHTML = `
      <div style="background:#fff; width:520px; border-radius:16px; box-shadow:0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04); overflow:hidden; border: 1px solid #cbd5e1; text-align: left;">
        <div style="display:flex; justify-content:space-between; align-items:center; background:#f8fafc; border-bottom:1px solid #e2e8f0; padding:16px 20px;">
          <span style="font-weight:800; color:#1e3a8a; font-size:14px; display:flex; align-items:center; gap:6px;">🏷️ Generated Patient Barcode Stickers</span>
          <button onclick="document.getElementById('barcode-stickers-overlay').remove()" style="border:none; background:none; font-size:1.2rem; cursor:pointer; color:#64748b;">✕</button>
        </div>
        <div style="padding:20px; max-height:70vh; overflow-y:auto; background:#f1f5f9; display:grid; grid-template-columns:1fr 1fr; gap:16px; justify-items:center;">
          ${stickersHtml}
        </div>
        <div style="padding:16px 20px; border-top:1px solid #e2e8f0; display:flex; justify-content:flex-end; gap:10px; background:#f8fafc;">
          <button class="btn btn-secondary" onclick="alert('Printing spooled to Zebra Label Printer.'); document.getElementById('barcode-stickers-overlay').remove()" style="font-weight:700; padding:8px 16px; font-size:12px; height: auto;">🖨️ Print Label Stickers</button>
          <button class="btn btn-primary" onclick="document.getElementById('barcode-stickers-overlay').remove()" style="font-weight:700; padding:8px 16px; font-size:12px; background:#1b3a5c; height: auto; color: white; border: none; border-radius: 4px;">Close</button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);
  };

})();

