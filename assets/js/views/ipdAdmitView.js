/**
 * SARONIL HIS — IPD ADMIT VIEW (ipdAdmitView.js)
 * 4-Step Wizard for already-registered patient IPD admission.
 *
 * Step 1 — Patient ID & Demographics (lookup + read-only card)
 * Step 2 — Clinical Details & Admission Order (source, consultant, diagnosis, flags, consent — NO vitals)
 * Step 3 — Payer / Insurance & Deposit
 * Step 4 — Bed Assignment & Confirm (bed grid + wristband barcode generation + print — hard gate)
 *
 * Vitals are captured at the bedside by the Ward Nurse, not at the admission desk.
 */

(function () {
  'use strict';

  /* ─────────────────────────────────────────────────────────────
     LOCAL STATE
  ───────────────────────────────────────────────────────────── */
  let _step = 1; // 1 | 2 | 3 | 4
  let _selectedPatient = null;

  // Step 2 — Clinical
  let _sourceOrder = 'OPD Consultation';
  let _admissionType = 'Elective';
  let _treatingConsultant = '';
  let _department = 'General Medicine';
  let _provisionalDiagnosis = '';
  let _nokName = '';
  let _nokRelation = 'Spouse';
  let _nokMobile = '';
  let _nokAddress = '';

  // Clinical flags
  let _allergyReconfirmed = false;
  let _fallRisk = false;
  let _dnrFlag = false;
  let _isolationFlag = false;
  let _limbPrecaution = false;
  let _mlcFlag = false;
  let _mlcCategory = 'RTA (Road Traffic Accident)';
  let _mlcPoliceStation = '';
  let _mlcDiaryNo = '';

  // Consent
  let _consentCaptured = false;
  let _emergencyImpliedConsent = false;
  let _emergencyImpliedConsentDoctor = 'Dr. Amit Verma';
  let _consentLanguage = 'English';

  // Step 3 — Financial
  let _payerType = 'Self-Pay';
  let _tpaPolicyNo = '';
  let _govSchemeBeneficiaryId = '';
  let _schemeVerified = false;
  let _depositAmount = 5000;
  let _depositStatus = 'Pending';

  // Step 4 — Bed
  let _selectedWardCategory = 'GENERAL-WARD-M';
  let _selectedBedId = null;
  let _wristbandPrinted = false;
  let _admitId = null;

  /* ─────────────────────────────────────────────────────────────
     WARD / BED CONFIG
  ───────────────────────────────────────────────────────────── */
  const WARD_INFO = {
    'GENERAL-WARD-M': { name: 'General Ward (Male)',            rate: 1500,  type: 'General',   gender: 'Male' },
    'GENERAL-WARD-F': { name: 'General Ward (Female)',          rate: 1500,  type: 'General',   gender: 'Female' },
    'SEMI-PRIVATE':   { name: 'Semi-Private Ward',              rate: 3000,  type: 'Semi-Private', gender: 'Mixed' },
    'PRIVATE':        { name: 'Private Room',                   rate: 5000,  type: 'Private',   gender: 'Mixed' },
    'DELUXE':         { name: 'Deluxe Suite',                   rate: 8500,  type: 'Deluxe',    gender: 'Mixed' },
    'CCU':            { name: 'Critical Care Unit',             rate: 10000, type: 'ICU',       gender: 'Mixed' },
    'ICCU':           { name: 'Intensive Cardiac Care Unit',    rate: 12000, type: 'ICU',       gender: 'Mixed' },
    'EMERGENCY':      { name: 'Emergency Ward',                 rate: 2500,  type: 'Emergency', gender: 'Mixed' },
    'DAYCARE':        { name: 'Daycare Unit',                   rate: 2000,  type: 'Daycare',   gender: 'Mixed' },
  };

  /* ─────────────────────────────────────────────────────────────
     CSS INJECTION
  ───────────────────────────────────────────────────────────── */
  function injectStyles() {
    if (document.getElementById('ipd-admit-v2-styles')) return;
    const s = document.createElement('style');
    s.id = 'ipd-admit-v2-styles';
    s.innerHTML = `
      /* ── Wizard wrapper ── */
      .av2-wrap {
        max-width: 1160px;
        margin: 0 auto;
        padding: 24px 20px;
        font-family: 'Inter', system-ui, -apple-system, sans-serif;
        color: #1e293b;
      }

      /* ── Page header ── */
      .av2-header {
        background: linear-gradient(135deg, #1e3a8a 0%, #0f172a 100%);
        color: #fff;
        padding: 20px 28px;
        border-radius: 14px;
        margin-bottom: 28px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        box-shadow: 0 6px 18px -3px rgba(0,0,0,0.22);
      }
      .av2-header h2 { margin: 0; font-size: 20px; font-weight: 800; }
      .av2-header p  { margin: 4px 0 0; font-size: 12px; opacity: 0.78; }

      /* ── Stepper ── */
      .av2-stepper {
        display: flex;
        gap: 0;
        margin-bottom: 18px;
        border-radius: 8px;
        overflow: hidden;
        border: 1px solid #e2e8f0;
        background: #f8fafc;
      }
      .av2-step {
        flex: 1;
        padding: 8px 12px;
        font-size: 11px;
        font-weight: 600;
        color: #94a3b8;
        border-right: 1px solid #e2e8f0;
        display: flex;
        align-items: center;
        gap: 8px;
        cursor: default;
        transition: background 0.2s;
      }
      .av2-step:last-child { border-right: none; }
      .av2-step.completed {
        color: #16a34a;
        background: #f0fdf4;
      }
      .av2-step.active {
        background: #2563eb;
        color: #ffffff;
        font-weight: 700;
      }
      .av2-step-circle {
        width: 20px; height: 20px;
        border-radius: 50%;
        display: flex; align-items: center; justify-content: center;
        font-size: 10px;
        font-weight: 800;
        flex-shrink: 0;
        background: rgba(255,255,255,0.18);
      }
      .av2-step.completed .av2-step-circle { background: #dcfce7; color: #166534; }
      .av2-step.active   .av2-step-circle { background: rgba(255,255,255,0.25); color: #fff; }
      .av2-step.pending  .av2-step-circle { background: #e2e8f0; color: #94a3b8; }


      /* ── Cards ── */
      .av2-card {
        background: #ffffff;
        border: 1px solid #e2e8f0;
        border-radius: 12px;
        padding: 24px;
        margin-bottom: 20px;
        box-shadow: 0 1px 3px rgba(0,0,0,0.05);
      }
      .av2-card-title {
        font-size: 13px;
        font-weight: 700;
        color: #0f172a;
        text-transform: uppercase;
        letter-spacing: 0.04em;
        margin-bottom: 18px;
        padding-bottom: 10px;
        border-bottom: 1.5px solid #f1f5f9;
        display: flex;
        align-items: center;
        gap: 8px;
      }

      /* ── Grid helpers ── */
      .av2-g2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
      .av2-g3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; }
      .av2-g4 { display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 14px; }

      /* ── Form elements ── */
      .av2-label {
        font-size: 11px;
        font-weight: 600;
        color: #475569;
        display: block;
        margin-bottom: 5px;
        text-transform: uppercase;
        letter-spacing: 0.03em;
      }
      .av2-input {
        width: 100%;
        padding: 8px 12px;
        border: 1px solid #cbd5e1;
        border-radius: 7px;
        font-size: 13px;
        box-sizing: border-box;
        background: #fff;
        color: #1e293b;
        transition: border-color 0.15s;
      }
      .av2-input:focus   { border-color: #3b82f6; outline: none; box-shadow: 0 0 0 3px rgba(59,130,246,0.12); }
      .av2-input[disabled] { background: #f8fafc; color: #64748b; cursor: not-allowed; }
      .av2-input.override-active { border-color: #dc2626 !important; box-shadow: 0 0 0 2px rgba(220,38,38,0.18); }

      /* ── Buttons ── */
      .av2-btn {
        padding: 9px 18px;
        font-size: 13px;
        font-weight: 600;
        border-radius: 8px;
        border: none;
        cursor: pointer;
        transition: all 0.18s;
        display: inline-flex;
        align-items: center;
        gap: 6px;
      }
      .av2-btn-primary  { background: #2563eb; color: #fff; }
      .av2-btn-primary:hover  { background: #1d4ed8; }
      .av2-btn-success  { background: #16a34a; color: #fff; }
      .av2-btn-success:hover  { background: #15803d; }
      .av2-btn-secondary{ background: #64748b; color: #fff; }
      .av2-btn-secondary:hover{ background: #475569; }
      .av2-btn-danger   { background: #dc2626; color: #fff; }
      .av2-btn-danger:hover   { background: #b91c1c; }
      .av2-btn-outline  { background: transparent; color: #2563eb; border: 1.5px solid #2563eb; }
      .av2-btn-outline:hover  { background: #eff6ff; }
      .av2-btn-sm { padding: 5px 12px; font-size: 12px; }

      /* ── Footer nav ── */
      .av2-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-top: 28px;
        padding-top: 20px;
        border-top: 1px solid #e2e8f0;
      }

      /* ── Bed grid ── */
      .av2-bed-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(90px, 1fr));
        gap: 10px;
        margin-top: 12px;
        max-height: 260px;
        overflow-y: auto;
        padding: 4px;
      }
      .av2-bed-cell {
        border: 1.5px solid #e2e8f0;
        border-radius: 8px;
        padding: 10px 6px;
        text-align: center;
        cursor: pointer;
        transition: all 0.2s;
        font-size: 12px;
        font-weight: 700;
      }
      .av2-bed-cell.av2-available { background: #f0fdf4; border-color: #86efac; color: #166534; }
      .av2-bed-cell.av2-available:hover { background: #dcfce7; transform: translateY(-2px); box-shadow: 0 4px 8px -2px rgba(22,163,74,0.18); }
      .av2-bed-cell.av2-selected  { background: #2563eb !important; border-color: #1d4ed8 !important; color: #fff !important; box-shadow: 0 4px 12px -2px rgba(37,99,235,0.4); }
      .av2-bed-cell.av2-occupied  { background: #fee2e2; border-color: #fca5a5; color: #991b1b; cursor: not-allowed; }

      /* ── Wristband ── */
      .av2-wristband {
        border: 2px dashed #cbd5e1;
        border-radius: 12px;
        padding: 20px;
        background: #f8fafc;
      }
      .av2-wristband-inner {
        background: #ffffff;
        border: 1px solid #e2e8f0;
        border-radius: 10px;
        padding: 16px 20px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 20px;
        margin-bottom: 14px;
      }
      .av2-wristband-data {
        font-size: 12px;
        line-height: 1.8;
      }
      .av2-barcode-box {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 4px;
      }
      .av2-ipd-number {
        font-family: monospace;
        font-size: 16px;
        font-weight: 800;
        color: #2563eb;
        letter-spacing: 0.08em;
        padding: 6px 14px;
        background: #eff6ff;
        border: 1px solid #bfdbfe;
        border-radius: 6px;
        margin-bottom: 4px;
      }
      .av2-barcode-label {
        font-size: 9px;
        color: #94a3b8;
        text-transform: uppercase;
        letter-spacing: 0.06em;
      }

      /* ── Precaution badges ── */
      .av2-badge {
        font-size: 11px;
        font-weight: 700;
        padding: 4px 10px;
        border-radius: 20px;
        display: inline-flex;
        align-items: center;
        gap: 4px;
      }
      .av2-badge-allergy   { background: #fee2e2; color: #b91c1c; border: 1px solid #fca5a5; }
      .av2-badge-fall      { background: #fef9c3; color: #713f12; border: 1px solid #fde68a; }
      .av2-badge-dnr       { background: #f3e8ff; color: #6b21a8; border: 1px solid #e9d5ff; }
      .av2-badge-isolation { background: #ffedd5; color: #9a3412; border: 1px solid #fed7aa; }
      .av2-badge-limb      { background: #fce7f3; color: #9d174d; border: 1px solid #fbcfe8; }

      /* ── Print gate banner ── */
      .av2-print-gate {
        background: linear-gradient(135deg, #1e3a8a, #2563eb);
        border-radius: 12px;
        padding: 22px 24px;
        color: #fff;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
        margin-bottom: 20px;
      }
      .av2-print-gate-text h4 { margin: 0 0 4px; font-size: 15px; font-weight: 800; }
      .av2-print-gate-text p  { margin: 0; font-size: 12px; opacity: 0.82; }

      /* ── Checklist ── */
      .av2-checklist {
        display: flex;
        flex-direction: column;
        gap: 10px;
        margin-top: 8px;
      }
      .av2-check-row {
        display: flex;
        align-items: center;
        gap: 10px;
        font-size: 13px;
        padding: 8px 12px;
        border-radius: 7px;
        border: 1px solid #e2e8f0;
        cursor: pointer;
        transition: background 0.15s;
      }
      .av2-check-row:hover { background: #f8fafc; }
      .av2-check-row input[type="checkbox"] {
        width: 16px; height: 16px; cursor: pointer; accent-color: #2563eb;
      }

      /* ── Alert boxes ── */
      .av2-alert-success { background:#f0fdf4; border:1px solid #bbf7d0; color:#166534; padding:10px 14px; border-radius:8px; font-size:12px; font-weight:600; }
      .av2-alert-warn    { background:#fff7ed; border:1px solid #fed7aa; color:#c2410c; padding:10px 14px; border-radius:8px; font-size:12px; font-weight:600; }
      .av2-alert-info    { background:#eff6ff; border:1px solid #bfdbfe; color:#1e40af; padding:10px 14px; border-radius:8px; font-size:12px; }
      .av2-alert-danger  { background:#fef2f2; border:1px solid #fca5a5; color:#b91c1c; padding:10px 14px; border-radius:8px; font-size:12px; font-weight:600; }

      /* ── Section sub-header ── */
      .av2-section-label {
        font-size: 11px;
        font-weight: 800;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: #1e40af;
        border-left: 3px solid #2563eb;
        padding-left: 8px;
        margin: 18px 0 12px;
      }

      /* ── Success screen ── */
      .av2-success-wrap {
        max-width: 640px;
        margin: 40px auto;
        text-align: center;
      }
      .av2-success-card {
        background: #fff;
        border: 1px solid #e2e8f0;
        border-radius: 18px;
        padding: 40px 36px;
        box-shadow: 0 12px 32px -6px rgba(0,0,0,0.10);
      }

      @media (max-width: 768px) {
        .av2-g2, .av2-g3, .av2-g4 { grid-template-columns: 1fr; }
        .av2-stepper { flex-direction: column; }
        .av2-step { border-right: none; border-bottom: 1px solid #e2e8f0; }
      }
    `;
    document.head.appendChild(s);
  }

  /* ─────────────────────────────────────────────────────────────
     HELPERS
  ───────────────────────────────────────────────────────────── */
  function generateAdmitId() {
    const n = Math.floor(1000 + Math.random() * 9000);
    return `IPD-2026-${n}`;
  }

  function getContainer() {
    return document.getElementById('main-content');
  }

  function rerender() {
    const c = getContainer();
    if (c) renderWizard(c);
  }

  /* ─────────────────────────────────────────────────────────────
     ENTRY POINT
  ───────────────────────────────────────────────────────────── */
  window.views.ipdAdmit = function (container, _subAnchor, params) {
    injectStyles();
    _step = 1;
    _wristbandPrinted = false;
    _admitId = null;
    _selectedBedId = null;
    _selectedPatient = null;

    if (params && params.uhid) {
      const p = window.state.patients.find(x => x.uhid === params.uhid);
      if (p) {
        _selectedPatient = p;
        const req = (window.state.admissionRequests || []).find(r => r.uhid === p.uhid);
        if (req) {
          _sourceOrder         = req.source         || 'OPD Consultation';
          _treatingConsultant  = req.refDoc          || p.primaryConsultant || '';
          _provisionalDiagnosis= req.diagnosis       || (p.clinicalData ? p.clinicalData.diagnosis : '');
          _selectedWardCategory= req.ward            || 'GENERAL-WARD-M';
          _admissionType       = _sourceOrder.toLowerCase().includes('emergency') ? 'Emergency' : 'Elective';
          _depositStatus       = req.advancePaid ? 'Paid' : 'Pending';
        } else {
          _sourceOrder          = 'OPD Consultation';
          _treatingConsultant   = p.primaryConsultant || '';
          _provisionalDiagnosis = p.clinicalData ? p.clinicalData.diagnosis : '';
          _admissionType        = 'Elective';
          _depositStatus        = 'Pending';
        }
        _nokName              = p.name + ' (Attendant)';
        _nokRelation          = 'Spouse';
        _nokMobile            = p.mobile || '';
        _nokAddress           = 'Same as patient address';
        _allergyReconfirmed   = !!(p.allergies && p.allergies !== 'None');
        // Auto-advance to step 2 when patient is pre-loaded
        _step = 2;
      }
    }

    renderWizard(container);
  };

  /* ─────────────────────────────────────────────────────────────
     MAIN RENDER
  ───────────────────────────────────────────────────────────── */
  function renderWizard(container) {
    container.innerHTML = `
      <div class="av2-wrap">
        <!-- Header -->
        <div class="av2-header">
          <div>
            <h2>🏥 Patient Admission</h2>
            <p>IPD Admission — Already-Registered Patient (UHID-based lookup)</p>
          </div>
          <button class="av2-btn av2-btn-secondary av2-btn-sm" onclick="window.router.navigate('ipdAdmission?tab=dashboard')">
            ← Back to Admission Board
          </button>
        </div>

        ${_selectedPatient ? `
          <!-- Patient Details Banner -->
          <div style="background: linear-gradient(135deg, #eff6ff 0%, #f0fdf4 100%); border: 1.5px solid #bfdbfe; border-radius: 12px; padding: 14px 20px; display: flex; align-items: center; justify-content: space-between; gap: 16px; margin-bottom: 20px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); text-align: left; margin-top: 15px;">
            <div style="display: flex; align-items: center; gap: 16px;">
              <div style="width: 42px; height: 42px; border-radius: 50%; background: #1b3a5c; color: white; display: flex; align-items: center; justify-content: center; font-size: 18px; font-weight: 800; box-shadow: 0 4px 10px rgba(27,58,92,0.2);">
                ${_selectedPatient.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
                  <span style="font-size: 15px; font-weight: 800; color: #1b3a5c;">${_selectedPatient.name}</span>
                  <span style="background: #1b3a5c; color: white; font-family: 'Outfit', monospace; font-size: 11px; font-weight: 800; padding: 2px 6px; border-radius: 4px; letter-spacing: 0.5px;">
                    ${_selectedPatient.uhid}
                  </span>
                </div>
                <div style="font-size: 12px; color: #475569; font-weight: 600; margin-top: 2px; display: flex; align-items: center; gap: 12px; flex-wrap: wrap;">
                  <span>📱 ${_selectedPatient.mobile}</span>
                  <span style="color: #cbd5e1;">|</span>
                  <span>👤 ${_selectedPatient.gender || 'Not Specified'}</span>
                  ${_selectedPatient.age ? `
                    <span style="color: #cbd5e1;">|</span>
                    <span>🎂 ${_selectedPatient.age} Years</span>
                  ` : ''}
                </div>
              </div>
            </div>
            
            ${_step > 1 ? `
              <div>
                <span style="font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; padding: 4px 10px; border-radius: 6px; background: #e0f2fe; color: #0369a1;">
                  Active Admitting Session
                </span>
              </div>
            ` : ''}
          </div>
        ` : ''}

        <!-- Stepper -->
        ${renderStepper()}

        <!-- Step Content -->
        ${_step === 1 ? renderStep1() : ''}
        ${_step === 2 ? renderStep2() : ''}
        ${_step === 3 ? renderStep3() : ''}
        ${_step === 4 ? renderStep4() : ''}

        <!-- Footer nav -->
        <div class="av2-footer">
          <button class="av2-btn av2-btn-secondary" onclick="window._admitGoBack()" ${_step === 1 ? 'disabled style="opacity:0.4;cursor:not-allowed;"' : ''}>
            ← Back
          </button>
          <div style="display:flex;gap:10px;align-items:center;">
            <span style="font-size:12px;color:#94a3b8;">Step ${_step} of 4</span>
            ${_step < 4
              ? `<button class="av2-btn av2-btn-primary" onclick="window._admitGoNext()">Continue →</button>`
              : `<button class="av2-btn av2-btn-success" onclick="window.submitIPDAdmission()" id="btn-confirm-admission" style="padding:10px 28px;font-size:14px;letter-spacing:0.02em;">
                   ✅ Confirm Admission
                 </button>`
            }
          </div>
        </div>
      </div>
    `;

    // Post-render setup
    if (_step === 4 && _selectedPatient) {
      if (!_admitId) _admitId = generateAdmitId();
      document.getElementById('av2-wristband-admit-id') && (document.getElementById('av2-wristband-admit-id').textContent = _admitId);
      renderBedGrid();
      updateWristbandBed();
      updateConfirmButton();
    }
    if (_step === 2) {
      updateMlcCard();
    }
  }

  /* ─────────────────────────────────────────────────────────────
     STEPPER
  ───────────────────────────────────────────────────────────── */
  function renderStepper() {
    const steps = [
      { n: 1, label: 'Patient ID & Demographics' },
      { n: 2, label: 'Clinical Details & Admission Order' },
      { n: 3, label: 'Payer / Insurance & Deposit' },
      { n: 4, label: 'Bed Assignment & Confirm' },
    ];
    return `
      <div class="av2-stepper">
        ${steps.map(s => {
          const cls = s.n < _step ? 'completed' : s.n === _step ? 'active' : 'pending';
          const icon = s.n < _step ? '✓' : s.n;
          return `
            <div class="av2-step ${cls}">
              <div class="av2-step-circle">${icon}</div>
              <span>${s.label}</span>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  /* ─────────────────────────────────────────────────────────────
     STEP 1 — PATIENT IDENTIFICATION
  ───────────────────────────────────────────────────────────── */
  function renderStep1() {
    return `
      <div class="av2-card">
        <div class="av2-card-title">🔍 Patient Lookup</div>

        <div class="av2-alert-info" style="margin-bottom:18px;">
          Search by <strong>UHID, Aadhaar, Mobile Number, or Full Name</strong>. 
          Only registered patients are eligible for this IPD admission flow.
        </div>

        <div style="display:flex;gap:10px;margin-bottom:20px;">
          <input type="text" id="av2-search-input" class="av2-input" placeholder="Type UHID / Name / Mobile / Aadhaar..." style="flex:1;">
          <button class="av2-btn av2-btn-primary" onclick="window._admitSearch()">Search</button>
        </div>
        <div id="av2-search-results"></div>

        ${_selectedPatient ? renderDemographicsCard() : ''}
      </div>
    `;
  }

  function renderDemographicsCard() {
    const p = _selectedPatient;
    return `
      <div style="margin-top:20px;">
        <div style="display:flex;justify-content:space-between;align-items:center;background:#f0fdf4;border:1px solid #bbf7d0;padding:12px 16px;border-radius:8px;margin-bottom:16px;">
          <div>
            <div style="font-size:11px;font-weight:800;color:#166534;text-transform:uppercase;letter-spacing:0.04em;">✅ Patient Loaded</div>
            <div style="font-size:16px;font-weight:800;color:#0f172a;margin-top:2px;">${p.name}</div>
            <div style="font-size:12px;color:#475569;margin-top:2px;">${p.uhid} · Age ${p.age} · ${p.gender}</div>
          </div>
          <button class="av2-btn av2-btn-danger av2-btn-sm" onclick="window._admitClearPatient()">Change</button>
        </div>

        <div class="av2-card" style="margin-bottom:0;">
          <div class="av2-card-title">📋 Demographic Profile (Read-Only · MRD Verified)</div>
          <div style="display:flex;justify-content:flex-end;margin-bottom:12px;">
            <button class="av2-btn av2-btn-secondary av2-btn-sm" onclick="window._admitSupervisorOverride()">✏️ Supervisor Override</button>
          </div>
          <div class="av2-g3" style="margin-bottom:14px;">
            <div>
              <label class="av2-label">UHID</label>
              <input class="av2-input" value="${p.uhid}" disabled>
            </div>
            <div>
              <label class="av2-label">Full Name *</label>
              <input class="av2-input" id="av2-core-name" value="${p.name}" disabled>
            </div>
            <div>
              <label class="av2-label">Date of Birth / Age *</label>
              <input class="av2-input" id="av2-core-age" value="${p.dob || p.age + ' yrs'}" disabled>
            </div>
          </div>
          <div class="av2-g3" style="margin-bottom:14px;">
            <div>
              <label class="av2-label">Gender *</label>
              <select class="av2-input" id="av2-core-gender" disabled>
                <option value="Male" ${p.gender === 'Male' ? 'selected' : ''}>Male</option>
                <option value="Female" ${p.gender === 'Female' ? 'selected' : ''}>Female</option>
                <option value="Other" ${p.gender === 'Other' ? 'selected' : ''}>Other</option>
              </select>
            </div>
            <div>
              <label class="av2-label">Mobile Number</label>
              <input class="av2-input" value="${p.mobile || '—'}" disabled>
            </div>
            <div>
              <label class="av2-label">Blood Group</label>
              <input class="av2-input" value="${p.bloodGroup || 'Not Checked'}" disabled>
            </div>
          </div>
          <div class="av2-g3">
            <div>
              <label class="av2-label">Aadhaar (UIDAI)</label>
              <input class="av2-input" value="${p.aadhaar || '—'}" disabled>
            </div>
            <div>
              <label class="av2-label">ABHA ID</label>
              <input class="av2-input" value="${p.abhaId || '—'}" disabled>
            </div>
            <div>
              <label class="av2-label">Known Allergies</label>
              <input class="av2-input" style="color:${p.allergies && p.allergies !== 'None' ? '#b91c1c' : '#166534'};font-weight:bold;" value="${p.allergies || 'None'}" disabled>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  /* ─────────────────────────────────────────────────────────────
     STEP 2 — CLINICAL DETAILS (NO VITALS)
     Vitals are a bedside nursing task, not an admission desk task.
  ───────────────────────────────────────────────────────────── */
  function renderStep2() {
    return `
      <div class="av2-card">
        <div class="av2-card-title">🩺 Diagnosis & Admission Reason</div>
        <div class="av2-g2" style="margin-bottom:16px;">
          <div>
            <label class="av2-label">Provisional Diagnosis *</label>
            <input type="text" id="av2-diagnosis" class="av2-input" value="${_provisionalDiagnosis}"
              placeholder="e.g. Acute Appendicitis / Dengue with Thrombocytopenia"
              oninput="window._admitSetField('_provisionalDiagnosis', this.value)">
          </div>
          <div>
            <label class="av2-label">Admitting Specialty / Department *</label>
            <input type="text" id="av2-dept" class="av2-input" value="${_department}"
              placeholder="e.g. General Medicine / Cardiology"
              oninput="window._admitSetField('_department', this.value)">
          </div>
        </div>
      </div>

      <div class="av2-card">
        <div class="av2-card-title">👨‍⚕️ Attending & Admission Order</div>
        <div class="av2-g3" style="margin-bottom:16px;">
          <div>
            <label class="av2-label">Admission Source *</label>
            <select id="av2-source" class="av2-input" onchange="window._admitUpdateSource(this.value)">
              <option value="OPD Consultation"   ${_sourceOrder === 'OPD Consultation'   ? 'selected':''}>OPD Consultation</option>
              <option value="Emergency/Casualty"  ${_sourceOrder === 'Emergency/Casualty' ? 'selected':''}>Emergency / Casualty</option>
              <option value="Direct/Elective"     ${_sourceOrder === 'Direct/Elective'    ? 'selected':''}>Direct / Elective</option>
              <option value="Transfer-in"         ${_sourceOrder === 'Transfer-in'        ? 'selected':''}>Transfer-in</option>
            </select>
          </div>
          <div>
            <label class="av2-label">Admission Type *</label>
            <select id="av2-admit-type" class="av2-input" onchange="window._admitSetField('_admissionType', this.value)">
              <option value="Elective"   ${_admissionType === 'Elective'   ? 'selected':''}>Elective (Pre-scheduled)</option>
              <option value="Emergency"  ${_admissionType === 'Emergency'  ? 'selected':''}>Emergency</option>
              <option value="Transfer-in"${_admissionType === 'Transfer-in'? 'selected':''}>Statutory Transfer-in</option>
            </select>
          </div>
          <div>
            <label class="av2-label">Admitting Consultant *</label>
            <select id="av2-consultant" class="av2-input" onchange="window._admitSetField('_treatingConsultant', this.value)">
              <option value="" disabled ${!_treatingConsultant ? 'selected' : ''}>— Select Consultant —</option>
              <option value="Dr. Amit Verma"    ${_treatingConsultant === 'Dr. Amit Verma'    ? 'selected':''}>Dr. Amit Verma (Gen Medicine)</option>
              <option value="Dr. Srinivasan"    ${_treatingConsultant === 'Dr. Srinivasan'    ? 'selected':''}>Dr. Srinivasan (Gen Medicine)</option>
              <option value="Dr. Ramesh Iyer"   ${_treatingConsultant === 'Dr. Ramesh Iyer'   ? 'selected':''}>Dr. Ramesh Iyer (Pediatrics)</option>
              <option value="Dr. Priya Nair"    ${_treatingConsultant === 'Dr. Priya Nair'    ? 'selected':''}>Dr. Priya Nair (Gynecology)</option>
              <option value="Dr. Fatima Sheikh" ${_treatingConsultant === 'Dr. Fatima Sheikh' ? 'selected':''}>Dr. Fatima Sheikh (Emergency)</option>
              <option value="Dr. Anand"         ${_treatingConsultant === 'Dr. Anand'         ? 'selected':''}>Dr. Anand (Cardiology)</option>
              <option value="Dr. Mehta"         ${_treatingConsultant === 'Dr. Mehta'         ? 'selected':''}>Dr. Mehta (General Surgery)</option>
            </select>
          </div>
        </div>

        <div class="av2-alert-info" style="font-size:12px;">
          ℹ️ <strong>Vitals (BP, Pulse, SpO₂, Temperature, GCS, etc.) are captured bedside by the Ward Nurse</strong> 
          after patient transfer to the allocated bed — not at the admission desk.
        </div>
      </div>

      <div class="av2-card">
        <div class="av2-card-title">👨‍👩‍👦 Next-of-Kin / Attendant Details</div>
        <div class="av2-g3" style="margin-bottom:14px;">
          <div>
            <label class="av2-label">NOK Full Name *</label>
            <input type="text" id="av2-nok-name" class="av2-input" value="${_nokName}"
              oninput="window._admitSetField('_nokName', this.value)">
          </div>
          <div>
            <label class="av2-label">Relationship to Patient *</label>
            <select id="av2-nok-rel" class="av2-input" onchange="window._admitSetField('_nokRelation', this.value)">
              <option value="Spouse"   ${_nokRelation === 'Spouse'   ? 'selected':''}>Spouse</option>
              <option value="Parent"   ${_nokRelation === 'Parent'   ? 'selected':''}>Parent</option>
              <option value="Sibling"  ${_nokRelation === 'Sibling'  ? 'selected':''}>Sibling</option>
              <option value="Child"    ${_nokRelation === 'Child'    ? 'selected':''}>Child</option>
              <option value="Guardian" ${_nokRelation === 'Guardian' ? 'selected':''}>Legal Guardian</option>
            </select>
          </div>
          <div>
            <label class="av2-label">NOK Mobile *</label>
            <input type="text" id="av2-nok-mobile" class="av2-input" value="${_nokMobile}"
              oninput="window._admitSetField('_nokMobile', this.value)">
          </div>
        </div>
        <div>
          <label class="av2-label">NOK Address (DPDPA Restricted)</label>
          <input type="text" id="av2-nok-address" class="av2-input" value="${_nokAddress}"
            oninput="window._admitSetField('_nokAddress', this.value)">
        </div>
      </div>

      <div class="av2-card">
        <div class="av2-card-title">🚨 Clinical Safety Flags & Precautions</div>
        <div class="av2-g3" style="margin-bottom:12px;">
          <label class="av2-check-row">
            <input type="checkbox" ${_allergyReconfirmed ? 'checked' : ''} onchange="window._admitToggle('_allergyReconfirmed', this.checked)">
            <span>🔴 <strong>Allergy Checked / Confirmed</strong></span>
          </label>
          <label class="av2-check-row">
            <input type="checkbox" ${_fallRisk ? 'checked' : ''} onchange="window._admitToggle('_fallRisk', this.checked)">
            <span>🟡 <strong style="color:#b45309;">Fall Risk Flag</strong></span>
          </label>
          <label class="av2-check-row">
            <input type="checkbox" ${_dnrFlag ? 'checked' : ''} onchange="window._admitToggle('_dnrFlag', this.checked)">
            <span>🟣 <strong style="color:#6b21a8;">DNR / Limitation of Care</strong></span>
          </label>
          <label class="av2-check-row">
            <input type="checkbox" ${_isolationFlag ? 'checked' : ''} onchange="window._admitToggle('_isolationFlag', this.checked)">
            <span>☣️ <strong style="color:#c2410c;">Isolation Precautions</strong></span>
          </label>
          <label class="av2-check-row">
            <input type="checkbox" ${_limbPrecaution ? 'checked' : ''} onchange="window._admitToggle('_limbPrecaution', this.checked)">
            <span>🌸 <strong style="color:#be185d;">Pink Precaution Wristband</strong></span>
          </label>
          <label class="av2-check-row">
            <input type="checkbox" ${_mlcFlag ? 'checked' : ''} onchange="window._admitToggleMlc(this.checked)">
            <span>⚖️ <strong style="color:#dc2626;">MLC Flag (Medico-Legal)</strong></span>
          </label>
        </div>

        <!-- MLC Detail Block -->
        <div id="av2-mlc-card" style="display:${_mlcFlag ? 'block' : 'none'}; background:#fef2f2; border:1px solid #fca5a5; border-radius:8px; padding:16px; margin-top:8px;">
          <div style="font-size:11px;font-weight:800;color:#b91c1c;text-transform:uppercase;margin-bottom:10px;">⚠️ Statutory Police Intimation Registration</div>
          <div class="av2-g3">
            <div>
              <label class="av2-label">MLC Category *</label>
              <select class="av2-input" onchange="window._admitSetField('_mlcCategory', this.value)">
                <option value="RTA (Road Traffic Accident)"  ${_mlcCategory === 'RTA (Road Traffic Accident)'  ? 'selected':''}>RTA</option>
                <option value="Assault Case"                 ${_mlcCategory === 'Assault Case'                 ? 'selected':''}>Assault Case</option>
                <option value="Poisoning / Toxins"           ${_mlcCategory === 'Poisoning / Toxins'           ? 'selected':''}>Poisoning / Toxins</option>
                <option value="Burns (>10%)"                 ${_mlcCategory === 'Burns (>10%)'                 ? 'selected':''}>Burns (&gt;10%)</option>
                <option value="Suicide / Self Harm Attempt"  ${_mlcCategory === 'Suicide / Self Harm Attempt'  ? 'selected':''}>Self Harm Attempt</option>
              </select>
            </div>
            <div>
              <label class="av2-label">Assigned Police Station *</label>
              <input type="text" class="av2-input" value="${_mlcPoliceStation}" placeholder="e.g. HAL Police Station"
                oninput="window._admitSetField('_mlcPoliceStation', this.value)">
            </div>
            <div>
              <label class="av2-label">GD / FIR Ref No.</label>
              <input type="text" class="av2-input" value="${_mlcDiaryNo}" placeholder="GD Diary No."
                oninput="window._admitSetField('_mlcDiaryNo', this.value)">
            </div>
          </div>
        </div>
      </div>

      <div class="av2-card">
        <div class="av2-card-title">✍️ Treatment & Admission Consent</div>
        <div class="av2-checklist">
          <label class="av2-check-row">
            <input type="checkbox" ${_consentCaptured ? 'checked' : ''} onchange="window._admitConsentCheck(this.checked)">
            <div>
              <strong>General Treatment & Admission Consent signed</strong>
              <div style="font-size:11px;color:#64748b;margin-top:2px;">Patient / attendant signature captured on consent form.</div>
            </div>
          </label>
        </div>
        <div style="margin-top:10px;display:flex;align-items:center;gap:10px;">
          <select class="av2-input" style="width:160px;" onchange="window._admitSetField('_consentLanguage', this.value)">
            <option value="English"  ${_consentLanguage === 'English'  ? 'selected':''}>English</option>
            <option value="Hindi"    ${_consentLanguage === 'Hindi'    ? 'selected':''}>Hindi</option>
            <option value="Kannada"  ${_consentLanguage === 'Kannada'  ? 'selected':''}>Kannada</option>
            <option value="Telugu"   ${_consentLanguage === 'Telugu'   ? 'selected':''}>Telugu</option>
            <option value="Tamil"    ${_consentLanguage === 'Tamil'    ? 'selected':''}>Tamil</option>
          </select>
          <span style="font-size:11px;color:#64748b;">Consent form language</span>
        </div>
        <div class="av2-check-row" style="margin-top:10px;background:#fffbeb;border-color:#fde68a;">
          <input type="checkbox" ${_emergencyImpliedConsent ? 'checked' : ''} onchange="window._admitEmergencyConsent(this.checked)">
          <span style="color:#b45309;font-weight:700;">🚨 Emergency Implied Consent (Incapacitated Patient — Admitting Doctor)</span>
        </div>
        <div id="av2-emergency-doc-wrap" style="display:${_emergencyImpliedConsent ? 'flex' : 'none'};align-items:center;gap:8px;margin-top:8px;">
          <label class="av2-label" style="margin:0;white-space:nowrap;">Doctor:</label>
          <input type="text" class="av2-input" value="${_emergencyImpliedConsentDoctor}" style="max-width:240px;"
            oninput="window._admitSetField('_emergencyImpliedConsentDoctor', this.value)">
        </div>
      </div>
    `;
  }

  /* ─────────────────────────────────────────────────────────────
     STEP 3 — PAYER / INSURANCE & DEPOSIT
  ───────────────────────────────────────────────────────────── */
  function renderStep3() {
    const wardRate = WARD_INFO[_selectedWardCategory] ? WARD_INFO[_selectedWardCategory].rate : 5000;
    return `
      <div class="av2-card">
        <div class="av2-card-title">🛡️ Payer Category & Sponsor Details</div>
        <div class="av2-g2" style="margin-bottom:16px;">
          <div>
            <label class="av2-label">Payer Type *</label>
            <select id="av2-payer-type" class="av2-input" onchange="window._admitUpdatePayer(this.value)">
              <option value="Self-Pay"          ${_payerType === 'Self-Pay'          ? 'selected':''}>Self Pay / Cash</option>
              <option value="TPA-Insurance"     ${_payerType === 'TPA-Insurance'     ? 'selected':''}>TPA / Private Insurance</option>
              <option value="Corporate"         ${_payerType === 'Corporate'         ? 'selected':''}>Corporate Panel</option>
              <option value="Government Scheme" ${_payerType === 'Government Scheme' ? 'selected':''}>Ayushman Bharat / PM-JAY / CGHS / ECHS</option>
            </select>
          </div>
          <div id="av2-tpa-wrap">
            <label class="av2-label">TPA / Policy Reference Number</label>
            <input type="text" id="av2-tpa-policy" class="av2-input" value="${_tpaPolicyNo}"
              placeholder="Policy ID / TPA Card Ref"
              ${_payerType !== 'TPA-Insurance' ? 'disabled' : ''}
              oninput="window._admitSetField('_tpaPolicyNo', this.value)">
          </div>
        </div>

        <!-- Government Scheme Block -->
        <div id="av2-gov-scheme-block" style="display:${_payerType === 'Government Scheme' ? 'block' : 'none'};margin-bottom:16px;">
          <label class="av2-label">Govt Scheme Beneficiary ID</label>
          <div style="display:flex;gap:8px;">
            <input type="text" id="av2-gov-scheme-id" class="av2-input" value="${_govSchemeBeneficiaryId}"
              placeholder="PMJAY-xxxx-xxxx / CGHS-xxxx-A"
              oninput="window._admitSetField('_govSchemeBeneficiaryId', this.value)">
            <button class="av2-btn av2-btn-outline av2-btn-sm" onclick="window._admitVerifyScheme()">Verify</button>
          </div>
          <div id="av2-scheme-alert" style="margin-top:8px;"></div>
        </div>

        <!-- Insurance Corporate Block -->
        <div id="av2-ins-block" style="display:${_payerType === 'TPA-Insurance' || _payerType === 'Corporate' ? 'block' : 'none'};margin-bottom:16px;">
          <div class="av2-g2">
            <div>
              <label class="av2-label">Policy / Claim Number</label>
              <input type="text" class="av2-input" value="${_tpaPolicyNo}" placeholder="Policy reference"
                oninput="window._admitSetField('_tpaPolicyNo', this.value)">
            </div>
            <div>
              <label class="av2-label">TPA Provider</label>
              <select class="av2-input">
                <option>— Select TPA —</option>
                <option>Star Health Insurance</option>
                <option>Medi Assist TPA</option>
                <option>Vidal Health Insurance TPA</option>
                <option>Paramount Health Services TPA</option>
                <option>Raksha Health Insurance TPA</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div class="av2-card">
        <div class="av2-card-title">💳 IPD Advance Deposit Ledger</div>

        <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:16px;margin-bottom:16px;">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
            <span style="font-size:13px;color:#64748b;">Selected Ward Rate:</span>
            <span style="font-size:16px;font-weight:800;color:#2563eb;font-family:monospace;">
              ₹${wardRate.toLocaleString()} / day
            </span>
          </div>
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
            <span style="font-size:13px;color:#64748b;">Minimum Deposit Required:</span>
            <span style="font-size:16px;font-weight:800;font-family:monospace;" id="av2-deposit-req">₹${_depositAmount.toLocaleString()}</span>
          </div>
          <div style="display:flex;justify-content:space-between;align-items:center;">
            <span style="font-size:13px;color:#64748b;">Deposit Status:</span>
            <select id="av2-deposit-status" class="av2-input" style="width:150px;" onchange="window._admitUpdateDeposit(this.value)">
              <option value="Pending" ${_depositStatus === 'Pending' ? 'selected':''}>❌ Pending</option>
              <option value="Paid"    ${_depositStatus === 'Paid'    ? 'selected':''}>✅ Paid</option>
              <option value="Waived"  ${_depositStatus === 'Waived'  ? 'selected':''}>⚠️ Waived</option>
            </select>
          </div>
        </div>

        <div style="margin-bottom:12px;">
          <div class="av2-g2" style="margin-bottom:10px;">
            <div>
              <label class="av2-label">Amount Collected (₹)</label>
              <input type="number" class="av2-input" value="${_depositAmount}" style="font-family:monospace;"
                onchange="window._admitSetField('_depositAmount', parseInt(this.value)||0)">
            </div>
            <div>
              <label class="av2-label">Payment Mode</label>
              <select class="av2-input">
                <option>UPI / GPay / PhonePe</option>
                <option>Cash</option>
                <option>Credit / Debit Card</option>
                <option>Bank Draft / Cheque</option>
                <option>NEFT / RTGS</option>
              </select>
            </div>
          </div>
          <label class="av2-check-row">
            <input type="checkbox" onchange="window._admitWaiverToggle(this.checked)">
            <span>Waive Deposit (BPL / Govt Scheme / Charity)</span>
          </label>
          <div id="av2-waiver-reason" style="display:none;margin-top:8px;">
            <input type="text" class="av2-input" placeholder="Waiver reason / authorization details *">
          </div>
        </div>

        <div id="av2-deposit-gate-box"></div>
        ${_admissionType === 'Emergency' ? `
          <div class="av2-alert-success" style="margin-top:10px;">
            ✅ <strong>Emergency Bypass Active:</strong> Advance deposit checks bypassed for emergency admission.
          </div>
        ` : ''}
      </div>
    `;
  }

  /* ─────────────────────────────────────────────────────────────
     STEP 4 — BED ASSIGNMENT & CONFIRM
     Includes: ward select, bed grid, wristband barcode generation
     with print button (hard gate), and pre-admission checklist.
  ───────────────────────────────────────────────────────────── */
  function renderStep4() {
    const p = _selectedPatient;
    const wardInfo = WARD_INFO[_selectedWardCategory] || WARD_INFO['GENERAL-WARD-M'];

    return `
      <div style="display:grid;grid-template-columns:1fr 380px;gap:20px;">
        <!-- LEFT: Bed selection -->
        <div>
          <div class="av2-card">
            <div class="av2-card-title">🛏️ Bed Assignment</div>

            <div class="av2-g2" style="margin-bottom:14px;">
              <div>
                <label class="av2-label">Ward Category</label>
                <select id="av2-ward-cat" class="av2-input" onchange="window._admitChangeWard(this.value)">
                  ${Object.entries(WARD_INFO).map(([k,v]) => `
                    <option value="${k}" ${_selectedWardCategory === k ? 'selected' : ''}>${v.name} — ₹${v.rate.toLocaleString()}/day</option>
                  `).join('')}
                </select>
              </div>
              <div>
                <label class="av2-label">Selected Bed</label>
                <input class="av2-input" id="av2-selected-bed-display"
                  value="${_selectedBedId || 'None selected'}"
                  style="font-family:monospace;font-weight:700;color:${_selectedBedId ? '#2563eb' : '#94a3b8'};" readonly>
              </div>
            </div>

            <div id="av2-isolation-warn"></div>

            <div>
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
                <label class="av2-label" style="margin:0;">Available Beds</label>
                <span id="av2-bed-count" style="font-size:11px;color:#64748b;"></span>
              </div>
              <div class="av2-bed-grid" id="av2-bed-grid-area"></div>
            </div>
          </div>

          <!-- Pre-Admission Checklist -->
          <div class="av2-card">
            <div class="av2-card-title">📋 Pre-Admission Checklist</div>
            <div class="av2-checklist">
              <label class="av2-check-row">
                <input type="checkbox" checked disabled>
                <span>Patient demographics verified (UHID match confirmed)</span>
              </label>
              <label class="av2-check-row">
                <input type="checkbox" ${_treatingConsultant ? 'checked' : ''} disabled>
                <span>Admitting doctor order received</span>
              </label>
              <label class="av2-check-row">
                <input type="checkbox" ${_payerType !== 'Self-Pay' ? 'checked' : ''} disabled>
                <span>Insurance / scheme pre-auth confirmed</span>
              </label>
              <label class="av2-check-row" id="av2-chk-consent-row">
                <input type="checkbox" ${_consentCaptured || _emergencyImpliedConsent ? 'checked' : ''} disabled>
                <span>Patient consent form signed</span>
              </label>
              <label class="av2-check-row">
                <input type="checkbox" ${_depositStatus === 'Paid' || _depositStatus === 'Waived' ? 'checked' : ''} disabled>
                <span>Security deposit collected / waived</span>
              </label>
              <label class="av2-check-row" id="av2-chk-wristband-row">
                <input type="checkbox" ${_wristbandPrinted ? 'checked' : ''} disabled>
                <span>Wristband barcode printed & linked</span>
              </label>
              <label class="av2-check-row">
                <input type="checkbox" ${_allergyReconfirmed ? 'checked' : ''} disabled>
                <span>Allergy status documented</span>
              </label>
            </div>
          </div>
        </div>

        <!-- RIGHT: Wristband + IPD Number -->
        <div>
          <div class="av2-card" style="margin-bottom:20px;">
            <div class="av2-card-title">🏷️ IPD Number & Wristband Barcode</div>

            <!-- IPD Number auto-generated -->
            <div style="text-align:center;margin-bottom:20px;">
              <div style="font-size:11px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:0.04em;margin-bottom:6px;">
                IPD Number (Auto-Generated)
              </div>
              <div class="av2-ipd-number" id="av2-wristband-admit-id">${_admitId || '—'}</div>
              <div style="font-size:10px;color:#94a3b8;margin-top:4px;">Permanent two-identifier credential</div>
            </div>

            <!-- Wristband preview -->
            <div class="av2-wristband" style="margin-bottom:16px;">
              <div style="font-size:10px;font-weight:800;color:#64748b;text-transform:uppercase;letter-spacing:0.04em;margin-bottom:10px;">
                📋 Inpatient Wristband Preview
              </div>
              <div class="av2-wristband-inner">
                <div class="av2-wristband-data">
                  <div><strong>UHID:</strong> ${p ? p.uhid : '—'}</div>
                  <div><strong>IPD No:</strong> <span style="font-family:monospace;font-weight:800;" id="av2-wb-ipd">${_admitId || '—'}</span></div>
                  <div><strong>Name:</strong> ${p ? p.name : '—'}</div>
                  <div><strong>Sex/Age:</strong> ${p ? `${p.gender} / ${p.age} yrs` : '—'}</div>
                  <div><strong>Bed:</strong> <span id="av2-wb-bed" style="font-family:monospace;font-weight:800;color:#2563eb;">${_selectedBedId || '—'}</span></div>
                  <div><strong>Consultant:</strong> ${_treatingConsultant || '—'}</div>
                </div>
                <div class="av2-barcode-box">
                  <img src="https://barcode.tec-it.com/barcode.ashx?data=${p ? p.uhid : 'UHID'}&code=Code128&translate-esc=on"
                    style="height:52px;max-width:110px;" alt="Wristband Barcode" id="av2-barcode-img">
                  <div class="av2-barcode-label">Scan to verify identity</div>
                </div>
              </div>

              <!-- NABH Precaution color badges -->
              <div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:10px;" id="av2-precaution-badges">
                <span class="av2-badge av2-badge-allergy"   style="display:${_allergyReconfirmed ? 'inline-flex' : 'none'};">🔴 Allergy</span>
                <span class="av2-badge av2-badge-fall"      style="display:${_fallRisk          ? 'inline-flex' : 'none'};">🟡 Fall Risk</span>
                <span class="av2-badge av2-badge-dnr"       style="display:${_dnrFlag            ? 'inline-flex' : 'none'};">🟣 DNR</span>
                <span class="av2-badge av2-badge-isolation" style="display:${_isolationFlag      ? 'inline-flex' : 'none'};">🟠 Isolation</span>
                <span class="av2-badge av2-badge-limb"      style="display:${_limbPrecaution     ? 'inline-flex' : 'none'};">🌸 Precaution</span>
                ${_mlcFlag ? `<span class="av2-badge" style="background:#fee2e2;color:#b91c1c;border:1px solid #fca5a5;">⚖️ MLC</span>` : ''}
              </div>
            </div>

            <!-- PRINT BUTTON — prominent, hard gate -->
            <div id="av2-print-gate-wrap">
              ${_wristbandPrinted
                ? `<div class="av2-alert-success" style="text-align:center;">
                     ✅ Wristband printed & barcode linked successfully.<br>
                     <span style="font-size:11px;font-family:monospace;">${_admitId}</span>
                   </div>`
                : `<button class="av2-btn av2-btn-primary" id="btn-print-wristband"
                     style="width:100%;padding:14px;font-size:15px;font-weight:800;justify-content:center;letter-spacing:0.02em;border-radius:10px;"
                     onclick="window._admitPrintWristband()">
                     🖨️ Print Wristband Barcode
                   </button>
                   <div style="font-size:11px;color:#94a3b8;text-align:center;margin-top:6px;">
                     Required before confirming admission (NABH Gate)
                   </div>`
              }
            </div>
          </div>

          <!-- Admit details summary -->
          <div class="av2-card" style="font-size:12px;">
            <div class="av2-card-title">📊 Admission Summary</div>
            <div style="display:flex;flex-direction:column;gap:8px;color:#475569;">
              <div style="display:flex;justify-content:space-between;">
                <span>Patient</span>
                <strong style="color:#0f172a;">${p ? p.name : '—'}</strong>
              </div>
              <div style="display:flex;justify-content:space-between;">
                <span>Ward</span>
                <strong>${wardInfo.name}</strong>
              </div>
              <div style="display:flex;justify-content:space-between;">
                <span>Daily Rate</span>
                <strong style="font-family:monospace;">₹${wardInfo.rate.toLocaleString()}</strong>
              </div>
              <div style="display:flex;justify-content:space-between;">
                <span>Consultant</span>
                <strong>${_treatingConsultant || '—'}</strong>
              </div>
              <div style="display:flex;justify-content:space-between;">
                <span>Admission Type</span>
                <strong>${_admissionType}</strong>
              </div>
              <div style="display:flex;justify-content:space-between;">
                <span>Payer</span>
                <strong>${_payerType}</strong>
              </div>
              <div style="display:flex;justify-content:space-between;">
                <span>Deposit Status</span>
                <strong style="color:${_depositStatus === 'Paid' ? '#16a34a' : _depositStatus === 'Waived' ? '#b45309' : '#dc2626'};">
                  ${_depositStatus}
                </strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  /* ─────────────────────────────────────────────────────────────
     BED GRID RENDER (Step 4)
  ───────────────────────────────────────────────────────────── */
  function renderBedGrid() {
    const gridArea = document.getElementById('av2-bed-grid-area');
    if (!gridArea) return;

    const bedsDict   = window.state.bedsStatus || {};
    const wardKey    = _selectedWardCategory;
    const wardConfig = window.state.wards ? window.state.wards[wardKey] : null;
    const bedsList   = wardConfig ? wardConfig.beds : [];

    const countEl = document.getElementById('av2-bed-count');

    if (bedsList.length === 0) {
      gridArea.innerHTML = `<div style="font-size:12px;color:#64748b;font-style:italic;grid-column:1/-1;">No beds configured in this ward category.</div>`;
      if (countEl) countEl.textContent = '';
      return;
    }

    let availCount = 0;
    gridArea.innerHTML = bedsList.map(bedNo => {
      const statusObj = bedsDict[bedNo] || { status: 'Available' };
      const isOccupied = statusObj.status !== 'Available';
      if (!isOccupied) availCount++;

      const isIsolationViolated = _isolationFlag && ['GENERAL-WARD-M','GENERAL-WARD-F','SEMI-PRIVATE'].includes(wardKey);
      const blocked = isOccupied || isIsolationViolated;
      const cellClass = _selectedBedId === bedNo ? 'av2-selected' : blocked ? 'av2-occupied' : 'av2-available';

      return `
        <div class="av2-bed-cell ${cellClass}" onclick="window._admitSelectBed('${bedNo}', ${blocked})">
          ${bedNo}<br>
          <span style="font-size:9px;font-weight:400;">${isOccupied ? '🔴 Occupied' : isIsolationViolated ? '🚫 Locked' : '🟢 Free'}</span>
        </div>
      `;
    }).join('');

    if (countEl) countEl.textContent = `${availCount} available`;
    validateIsolationWarning();
  }

  function updateWristbandBed() {
    const wb = document.getElementById('av2-wb-bed');
    const sd = document.getElementById('av2-selected-bed-display');
    if (wb) wb.textContent = _selectedBedId || '—';
    if (sd) { sd.value = _selectedBedId || 'None selected'; sd.style.color = _selectedBedId ? '#2563eb' : '#94a3b8'; }
  }

  function validateIsolationWarning() {
    const box = document.getElementById('av2-isolation-warn');
    if (!box) return;
    if (_isolationFlag && ['GENERAL-WARD-M','GENERAL-WARD-F','SEMI-PRIVATE'].includes(_selectedWardCategory)) {
      box.innerHTML = `<div class="av2-alert-warn" style="margin-bottom:10px;">⚠️ <strong>Isolation Protocol:</strong> Patient flagged for infectious isolation. General / Semi-Private wards are locked. Please redirect to Private, Deluxe, or CCU isolation beds.</div>`;
    } else {
      box.innerHTML = '';
    }
  }

  function updateConfirmButton() {
    const btn = document.getElementById('btn-confirm-admission');
    if (!btn) return;
    const ready = _selectedBedId && _wristbandPrinted && (_consentCaptured || _emergencyImpliedConsent);
    btn.disabled = !ready;
    btn.style.opacity = ready ? '1' : '0.45';
    btn.style.cursor  = ready ? 'pointer' : 'not-allowed';
  }

  /* ─────────────────────────────────────────────────────────────
     NAVIGATION HANDLERS
  ───────────────────────────────────────────────────────────── */
  window._admitGoNext = function () {
    if (_step === 1) {
      if (!_selectedPatient) {
        alert('⛔ Please search and select a registered patient first.');
        return;
      }
    }
    if (_step === 2) {
      if (!_treatingConsultant) {
        alert('⛔ Please select the Admitting Consultant.');
        return;
      }
      if (!_provisionalDiagnosis.trim()) {
        alert('⛔ Provisional Diagnosis is required.');
        return;
      }
      if (!_consentCaptured && !_emergencyImpliedConsent) {
        alert('⛔ Consent must be captured (standard or emergency implied) before proceeding.');
        return;
      }
    }
    if (_step < 4) {
      _step++;
      rerender();
    }
  };

  window._admitGoBack = function () {
    if (_step > 1) { _step--; rerender(); }
  };

  /* ─────────────────────────────────────────────────────────────
     PATIENT LOOKUP
  ───────────────────────────────────────────────────────────── */
  window._admitSearch = function () {
    const q = (document.getElementById('av2-search-input').value || '').trim().toLowerCase();
    const results = document.getElementById('av2-search-results');
    if (q.length < 3) {
      results.innerHTML = `<div class="av2-alert-warn">Please enter at least 3 characters.</div>`;
      return;
    }
    const matches = (window.state.patients || []).filter(p =>
      p.uhid.toLowerCase().includes(q) ||
      p.name.toLowerCase().includes(q) ||
      (p.mobile && p.mobile.includes(q)) ||
      (p.aadhaar && p.aadhaar.includes(q)) ||
      (p.abhaId && p.abhaId.includes(q))
    );
    if (!matches.length) {
      results.innerHTML = `<div class="av2-alert-warn">No registered patient found matching "<strong>${q}</strong>".</div>`;
      return;
    }
    results.innerHTML = `
      <div style="background:#fff;border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;max-height:220px;overflow-y:auto;">
        ${matches.map(p => `
          <div style="padding:10px 14px;border-bottom:1px solid #f1f5f9;display:flex;justify-content:space-between;align-items:center;cursor:pointer;"
            onmouseover="this.style.background='#f8fafc'" onmouseout="this.style.background=''"
            onclick="window._admitSelectPatient('${p.uhid}')">
            <div>
              <strong style="color:#1e3a8a;font-size:13px;">${p.name}</strong>
              <span style="font-size:11px;color:#64748b;font-family:monospace;margin-left:8px;">${p.uhid}</span>
              <div style="font-size:11px;color:#475569;margin-top:2px;">Age ${p.age} · ${p.gender} · ${p.mobile || '—'}</div>
            </div>
            <button class="av2-btn av2-btn-primary av2-btn-sm">Select →</button>
          </div>
        `).join('')}
      </div>
    `;
  };

  window._admitSelectPatient = function (uhid) {
    window.router.navigate(`ipdAdmit?uhid=${uhid}`);
  };

  window._admitClearPatient = function () {
    _selectedPatient = null;
    _step = 1;
    window.router.navigate('ipdAdmit');
  };

  window._admitSupervisorOverride = function () {
    const code = prompt('🔒 SUPERVISOR OVERRIDE\nEnter authorization code to modify core identity fields:');
    if (code === 'SUPER123') {
      ['av2-core-name','av2-core-age','av2-core-gender'].forEach(id => {
        const el = document.getElementById(id);
        if (el) { el.removeAttribute('disabled'); el.classList.add('override-active'); }
      });
      alert('🔒 Core demographics unlocked. All changes will be logged in MRD audit trails.');
    } else {
      alert('❌ Authorization Failed. Demographics remain read-only.');
    }
  };

  /* ─────────────────────────────────────────────────────────────
     FIELD SETTERS (generic)
  ───────────────────────────────────────────────────────────── */
  window._admitSetField = function (field, value) {
    if (field === '_provisionalDiagnosis') _provisionalDiagnosis = value;
    else if (field === '_department')      _department = value;
    else if (field === '_treatingConsultant') _treatingConsultant = value;
    else if (field === '_admissionType')   _admissionType = value;
    else if (field === '_nokName')         _nokName = value;
    else if (field === '_nokRelation')     _nokRelation = value;
    else if (field === '_nokMobile')       _nokMobile = value;
    else if (field === '_nokAddress')      _nokAddress = value;
    else if (field === '_mlcCategory')     _mlcCategory = value;
    else if (field === '_mlcPoliceStation')_mlcPoliceStation = value;
    else if (field === '_mlcDiaryNo')      _mlcDiaryNo = value;
    else if (field === '_tpaPolicyNo')     _tpaPolicyNo = value;
    else if (field === '_govSchemeBeneficiaryId') _govSchemeBeneficiaryId = value;
    else if (field === '_depositAmount')   _depositAmount = value;
    else if (field === '_consentLanguage') _consentLanguage = value;
    else if (field === '_emergencyImpliedConsentDoctor') _emergencyImpliedConsentDoctor = value;
  };

  /* ─────────────────────────────────────────────────────────────
     STEP 2 HANDLERS
  ───────────────────────────────────────────────────────────── */
  window._admitUpdateSource = function (val) {
    _sourceOrder = val;
    if (val.includes('Emergency')) {
      _admissionType = 'Emergency';
      const at = document.getElementById('av2-admit-type');
      if (at) at.value = 'Emergency';
    }
  };

  window._admitToggle = function (field, checked) {
    if (field === '_allergyReconfirmed') _allergyReconfirmed = checked;
    else if (field === '_fallRisk')      _fallRisk = checked;
    else if (field === '_dnrFlag')       _dnrFlag = checked;
    else if (field === '_isolationFlag') _isolationFlag = checked;
    else if (field === '_limbPrecaution')_limbPrecaution = checked;
  };

  window._admitToggleMlc = function (checked) {
    _mlcFlag = checked;
    updateMlcCard();
  };

  function updateMlcCard() {
    const card = document.getElementById('av2-mlc-card');
    if (card) card.style.display = _mlcFlag ? 'block' : 'none';
  }

  window._admitConsentCheck = function (checked) {
    _consentCaptured = checked;
    if (checked) {
      _emergencyImpliedConsent = false;
      const ec = document.querySelector('[onchange*="emergencyConsent"]');
      if (ec) ec.checked = false;
      const ew = document.getElementById('av2-emergency-doc-wrap');
      if (ew) ew.style.display = 'none';
    }
  };

  window._admitEmergencyConsent = function (checked) {
    _emergencyImpliedConsent = checked;
    if (checked) {
      _consentCaptured = false;
      const cc = document.querySelector('[onchange*="consentCheck"]');
      if (cc) cc.checked = false;
    }
    const ew = document.getElementById('av2-emergency-doc-wrap');
    if (ew) ew.style.display = checked ? 'flex' : 'none';
  };

  /* ─────────────────────────────────────────────────────────────
     STEP 3 HANDLERS
  ───────────────────────────────────────────────────────────── */
  window._admitUpdatePayer = function (val) {
    _payerType = val;
    _schemeVerified = false;

    if (val === 'TPA-Insurance' || val === 'Corporate') {
      _depositStatus = 'Waived';
      _depositAmount = 0;
    } else if (val === 'Government Scheme') {
      _depositStatus = 'Waived';
      _depositAmount = 0;
    } else {
      _depositAmount = ['CCU','ICCU'].includes(_selectedWardCategory) ? 15000 : 5000;
      _depositStatus = 'Pending';
    }

    const govBlock = document.getElementById('av2-gov-scheme-block');
    const insBlock = document.getElementById('av2-ins-block');
    const tpaInput = document.getElementById('av2-tpa-policy');

    if (govBlock) govBlock.style.display = val === 'Government Scheme' ? 'block' : 'none';
    if (insBlock) insBlock.style.display = (val === 'TPA-Insurance' || val === 'Corporate') ? 'block' : 'none';
    if (tpaInput) val === 'TPA-Insurance' ? tpaInput.removeAttribute('disabled') : tpaInput.setAttribute('disabled','true');

    const req = document.getElementById('av2-deposit-req');
    if (req) req.textContent = `₹${_depositAmount.toLocaleString()}`;
    const ds  = document.getElementById('av2-deposit-status');
    if (ds) ds.value = _depositStatus;
  };

  window._admitUpdateDeposit = function (val) {
    _depositStatus = val;
    validateDepositGate();
  };

  window._admitWaiverToggle = function (checked) {
    const box = document.getElementById('av2-waiver-reason');
    if (box) box.style.display = checked ? 'block' : 'none';
    if (checked) { _depositStatus = 'Waived'; }
    const ds = document.getElementById('av2-deposit-status');
    if (ds) ds.value = _depositStatus;
    validateDepositGate();
  };

  window._admitVerifyScheme = function () {
    const id = document.getElementById('av2-gov-scheme-id');
    const box = document.getElementById('av2-scheme-alert');
    if (!id || !id.value.trim()) {
      if (box) box.innerHTML = `<div class="av2-alert-warn">Enter Beneficiary ID first.</div>`;
      return;
    }
    if (box) box.innerHTML = `<div class="av2-alert-info">🔍 Verifying scheme eligibility...</div>`;
    setTimeout(() => {
      _schemeVerified = true;
      _depositStatus = 'Waived';
      const ds = document.getElementById('av2-deposit-status');
      if (ds) ds.value = 'Waived';
      if (box) box.innerHTML = `<div class="av2-alert-success">✅ Beneficiary ACTIVE under CGHS/PM-JAY. Deposit fully waived.</div>`;
      validateDepositGate();
    }, 900);
  };

  function validateDepositGate() {
    const box = document.getElementById('av2-deposit-gate-box');
    if (!box) return;
    if (_admissionType === 'Emergency') {
      box.innerHTML = `<div class="av2-alert-success">✅ Emergency bypass — deposit checks skipped.</div>`;
    } else if (_depositStatus === 'Pending' && _payerType === 'Self-Pay') {
      box.innerHTML = `<div class="av2-alert-warn">⚠️ Deposit is PENDING. Bed allocation will be blocked on finalization for Elective admissions.</div>`;
    } else {
      box.innerHTML = `<div class="av2-alert-success">✅ Deposit clearance gate passed.</div>`;
    }
  }

  /* ─────────────────────────────────────────────────────────────
     STEP 4 HANDLERS
  ───────────────────────────────────────────────────────────── */
  window._admitChangeWard = function (val) {
    _selectedWardCategory = val;
    _selectedBedId = null;
    if (_payerType === 'Self-Pay') {
      _depositAmount = ['CCU','ICCU'].includes(val) ? 15000 : 5000;
    }
    renderBedGrid();
    updateWristbandBed();
    validateIsolationWarning();
    updateConfirmButton();
  };

  window._admitSelectBed = function (bedNo, blocked) {
    if (blocked) {
      alert('⛔ Bed is occupied or locked under isolation protocol. Please select a free bed.');
      return;
    }
    // Gender check gate
    const wardMeta = WARD_INFO[_selectedWardCategory];
    if (wardMeta && wardMeta.type === 'General') {
      const patGender = _selectedPatient ? _selectedPatient.gender : '';
      if (patGender && patGender !== wardMeta.gender) {
        alert(`⛔ Gender-Bed Mismatch: Cannot assign ${patGender} patient to ${wardMeta.gender} ward. This is a hard gate.`);
        return;
      }
    }
    _selectedBedId = bedNo;
    renderBedGrid();
    updateWristbandBed();
    updateConfirmButton();
  };

  /* ─────────────────────────────────────────────────────────────
     PRINT WRISTBAND (hard gate before Confirm)
  ───────────────────────────────────────────────────────────── */
  window._admitPrintWristband = function () {
    if (!_selectedPatient) {
      alert('⛔ No patient selected.');
      return;
    }
    _wristbandPrinted = true;

    // Update the gate UI without full re-render
    const wrap = document.getElementById('av2-print-gate-wrap');
    if (wrap) {
      wrap.innerHTML = `
        <div class="av2-alert-success" style="text-align:center;">
          ✅ Wristband printed & barcode linked successfully.<br>
          <span style="font-size:11px;font-family:monospace;">${_admitId}</span>
        </div>
      `;
    }

    // Tick checklist
    const chkWristband = document.querySelector('#av2-chk-wristband-row input');
    if (chkWristband) chkWristband.checked = true;

    // Enable confirm button
    updateConfirmButton();

    // Log print event
    window.state.wristbandRecords = window.state.wristbandRecords || [];
    const flags = [];
    if (_allergyReconfirmed) flags.push('allergy');
    if (_fallRisk)           flags.push('fall_risk');
    if (_dnrFlag)            flags.push('dnr');
    if (_limbPrecaution)     flags.push('limb_precaution');
    if (_isolationFlag)      flags.push('isolation');

    window.state.wristbandRecords.push({
      wristband_id: 'WB-' + Date.now(),
      admission_id: _admitId,
      barcode_value: _admitId,
      color_flags: flags,
      printed_at: new Date().toISOString(),
      printed_by: localStorage.getItem('saronil_active_ipd_role') || 'ATD Coordinator'
    });
    localStorage.setItem('saronil_wristbandRecords', JSON.stringify(window.state.wristbandRecords));

    // Trigger browser print dialog
    const printWin = window.open('', '_blank', 'width=400,height=340');
    if (printWin) {
      printWin.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Wristband — ${_admitId}</title>
          <style>
            body { font-family: monospace; padding: 20px; font-size: 13px; }
            .band { border: 2px solid #000; border-radius: 8px; padding: 16px; max-width: 340px; }
            h3 { margin: 0 0 10px; font-size: 15px; }
            .row { display: flex; justify-content: space-between; margin-bottom: 5px; }
            .badges { margin-top: 10px; display: flex; flex-wrap: wrap; gap: 4px; }
            .badge { font-size: 10px; padding: 2px 6px; border: 1px solid #000; border-radius: 4px; }
            img { display: block; margin-top: 10px; height: 50px; }
            @media print { button { display: none; } }
          </style>
        </head>
        <body>
          <div class="band">
            <h3>🏥 SARONIL HOSPITAL — IPD WRISTBAND</h3>
            <div class="row"><span>UHID:</span><strong>${_selectedPatient.uhid}</strong></div>
            <div class="row"><span>IPD No:</span><strong>${_admitId}</strong></div>
            <div class="row"><span>Name:</span><strong>${_selectedPatient.name}</strong></div>
            <div class="row"><span>Sex/Age:</span><strong>${_selectedPatient.gender} / ${_selectedPatient.age} yrs</strong></div>
            <div class="row"><span>Bed:</span><strong>${_selectedBedId || '—'}</strong></div>
            <div class="row"><span>Consultant:</span><strong>${_treatingConsultant || '—'}</strong></div>
            <div class="row"><span>Admit Date:</span><strong>${new Date().toLocaleDateString('en-IN')}</strong></div>
            <img src="https://barcode.tec-it.com/barcode.ashx?data=${_selectedPatient.uhid}&code=Code128&translate-esc=on" alt="barcode">
            ${flags.length ? `<div class="badges">${flags.map(f => `<span class="badge">${f.replace('_',' ').toUpperCase()}</span>`).join('')}</div>` : ''}
          </div>
          <br>
          <button onclick="window.print()">🖨️ Print</button>
          <script>setTimeout(() => window.print(), 400);<\/script>
        </body>
        </html>
      `);
      printWin.document.close();
    }
  };

  /* ─────────────────────────────────────────────────────────────
     FINAL SUBMISSION
  ───────────────────────────────────────────────────────────── */
  window.submitIPDAdmission = function () {
    if (!_selectedPatient) { alert('⛔ No patient selected.'); return; }
    if (!_treatingConsultant) { alert('⛔ Admitting consultant not set.'); return; }
    if (!_selectedBedId) { alert('⛔ No bed selected.'); return; }
    if (!_consentCaptured && !_emergencyImpliedConsent) {
      alert('⛔ Consent form verification is mandatory.'); return;
    }
    if (!_wristbandPrinted) {
      alert('⛔ NABH Hard Gate: Wristband barcode must be printed before confirming admission.'); return;
    }
    if (_admissionType === 'Elective' && _depositStatus === 'Pending' && _payerType === 'Self-Pay') {
      alert('⛔ Advance deposit is PENDING. Collect deposit or apply waiver before confirming.'); return;
    }

    // Link IPD number to patient record
    _selectedPatient.ipNumber = _admitId;
    _selectedPatient.barcode  = _admitId;

    // 1. Occupy bed
    window.state.bedsStatus[_selectedBedId] = {
      wardKey: _selectedWardCategory,
      status: 'Occupied',
      patientUhid: _selectedPatient.uhid,
      notes: `Admitted under ${_treatingConsultant}`
    };

    // 2. Active admissions
    window.state.admissions.push({
      id: _admitId,
      uhid: _selectedPatient.uhid,
      patientName: _selectedPatient.name,
      doctorName: _treatingConsultant,
      ward: _selectedWardCategory,
      bed: _selectedBedId,
      diagnosis: _provisionalDiagnosis,
      date: new Date().toISOString().slice(0, 10),
      status: 'Active',
      payer: _payerType,
      mlc: _mlcFlag
    });

    // 3. Remove from pending requests
    window.state.admissionRequests = (window.state.admissionRequests || []).filter(r => r.uhid !== _selectedPatient.uhid);

    // 4. Billing
    window.state.billing = window.state.billing || [];
    window.state.billing.push({
      id: 'INV-' + _admitId,
      uhid: _selectedPatient.uhid,
      patientName: _selectedPatient.name,
      amount: _depositAmount,
      paid: _depositStatus === 'Paid' ? _depositAmount : 0,
      status: _depositStatus === 'Paid' ? 'Paid' : 'Pending',
      date: new Date().toISOString().slice(0, 10),
      items: [{ desc: `IPD Deposit — ${WARD_INFO[_selectedWardCategory].name}`, qty: 1, rate: _depositAmount, total: _depositAmount }]
    });

    // 5. Nursing task (vitals captured at bedside)
    window.state.nursingTasks = window.state.nursingTasks || [];
    window.state.nursingTasks.push({
      id: 'NURSE-TASK-' + Date.now(),
      uhid: _selectedPatient.uhid,
      bedNo: _selectedBedId,
      task: 'Initial Nursing Assessment & Vitals capture at bedside',
      assignedTo: 'Ward Nurse',
      status: 'Pending',
      timestamp: new Date().toISOString()
    });

    // 6. Diet order
    window.state.dietOrders = window.state.dietOrders || [];
    window.state.dietOrders.push({
      id: 'DIET-' + Date.now(),
      uhid: _selectedPatient.uhid,
      patientName: _selectedPatient.name,
      bedNo: _selectedBedId,
      dietType: 'Default Normal (Regular)',
      specialInstructions: _isolationFlag ? 'Serve in isolation room' : 'None',
      orderedAt: new Date().toISOString(),
      status: 'Pending Review'
    });

    // 7. MLC record
    if (_mlcFlag) {
      window.state.mlcAdmissionRecords = window.state.mlcAdmissionRecords || [];
      window.state.mlcAdmissionRecords.push({
        mlcId: 'MLC-' + Date.now(),
        admissionId: _admitId,
        uhid: _selectedPatient.uhid,
        category: _mlcCategory,
        policeStation: _mlcPoliceStation,
        diaryNo: _mlcDiaryNo,
        status: 'Reported & Pending Intimation'
      });
      alert('⚖️ MLC Intimation registered and filed.');
    }

    // 8. Persist
    localStorage.setItem('saronil_patients',          JSON.stringify(window.state.patients));
    localStorage.setItem('saronil_admissions',        JSON.stringify(window.state.admissions));
    localStorage.setItem('saronil_bedsStatus',        JSON.stringify(window.state.bedsStatus));
    localStorage.setItem('saronil_admissionRequests', JSON.stringify(window.state.admissionRequests));
    localStorage.setItem('saronil_billing',           JSON.stringify(window.state.billing));

    // 9. Audit log
    window.state.auditLogs = window.state.auditLogs || [];
    window.state.auditLogs.push({
      timestamp: new Date().toISOString(),
      action: 'IPD_ADMISSION_COMPLETE',
      uhid: _selectedPatient.uhid,
      details: `Patient admitted. Bed: ${_selectedBedId} | Ward: ${_selectedWardCategory} | Consultant: ${_treatingConsultant} | IPD: ${_admitId}`
    });

    renderSuccessScreen();
  };

  /* ─────────────────────────────────────────────────────────────
     SUCCESS SCREEN
  ───────────────────────────────────────────────────────────── */
  function renderSuccessScreen() {
    const c = getContainer();
    if (!c) return;
    const p = _selectedPatient;
    const ward = WARD_INFO[_selectedWardCategory] || {};

    c.innerHTML = `
      <div class="av2-wrap av2-success-wrap" style="max-width:660px;">
        <div class="av2-success-card">
          <div style="font-size:56px;margin-bottom:16px;">✅</div>
          <h2 style="margin:0 0 8px;color:#0f172a;font-size:24px;font-weight:800;">Admission Confirmed!</h2>
          <p style="font-size:13px;color:#64748b;margin-bottom:28px;line-height:1.6;">
            <strong>${p.name}</strong> has been successfully admitted to bed
            <strong>${_selectedBedId}</strong> in <strong>${ward.name}</strong>.
          </p>

          <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:20px;text-align:left;margin-bottom:24px;display:flex;flex-direction:column;gap:10px;font-size:13px;">
            <div style="display:flex;justify-content:space-between;">
              <span style="color:#64748b;">IPD Number</span>
              <strong style="font-family:monospace;font-size:15px;color:#2563eb;">${_admitId}</strong>
            </div>
            <div style="display:flex;justify-content:space-between;">
              <span style="color:#64748b;">UHID</span>
              <strong style="font-family:monospace;">${p.uhid}</strong>
            </div>
            <div style="display:flex;justify-content:space-between;">
              <span style="color:#64748b;">Ward / Bed</span>
              <strong>${ward.name} — ${_selectedBedId}</strong>
            </div>
            <div style="display:flex;justify-content:space-between;">
              <span style="color:#64748b;">Consultant</span>
              <strong>${_treatingConsultant}</strong>
            </div>
            <div style="display:flex;justify-content:space-between;">
              <span style="color:#64748b;">Admission Date</span>
              <strong>${new Date().toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' })}</strong>
            </div>
          </div>

          <div class="av2-alert-info" style="margin-bottom:24px;text-align:left;">
            <strong>Downstream triggers activated automatically:</strong><br>
            ✅ Bed occupied &nbsp;·&nbsp; ✅ Billing account opened &nbsp;·&nbsp;
            ✅ Nursing assessment task queued &nbsp;·&nbsp; ✅ Diet order raised
            ${_mlcFlag ? '<br>⚖️ MLC police intimation filed' : ''}
          </div>

          <div style="display:flex;flex-direction:column;gap:10px;">
            <button class="av2-btn av2-btn-primary" style="justify-content:center;padding:12px;"
              onclick="window.router.navigate('ipdAdmission?tab=dashboard')">
              ← Back to Admission Board
            </button>
            <button class="av2-btn av2-btn-outline" style="justify-content:center;padding:12px;"
              onclick="window.router.navigate('patients?uhid=${p.uhid}')">
              View Patient EMR →
            </button>
          </div>
        </div>
      </div>
    `;
  }

})();
