/* ==========================================================================
   SARONIL HMS — PATIENT REGISTRATION & OPD VISIT MODULE
   High-Fidelity, Gated Duplicate Check, Branch-Configured Registration Fees,
   DPDPA 2023 Compliance, and Billing Queue Handoff Workflows.
   ========================================================================== */

(function () {
  'use strict';

  var _icd10Db = [
    { code: 'A09.9', desc: 'Gastroenteritis and colitis of unspecified infectious origin' },
    { code: 'I10', desc: 'Essential (primary) hypertension' },
    { code: 'E11.9', desc: 'Type 2 diabetes mellitus without complications' },
    { code: 'J45.909', desc: 'Unspecified asthma, uncomplicated' },
    { code: 'K35.80', desc: 'Unspecified acute appendicitis' },
    { code: 'U07.1', desc: 'COVID-19' },
    { code: 'M54.5', desc: 'Low back pain' },
    { code: 'N39.0', desc: 'Urinary tract infection, site not specified' },
    { code: 'J18.9', desc: 'Pneumonia, unspecified organism' },
    { code: 'I21.9', desc: 'Acute myocardial infarction, unspecified' },
    { code: 'G43.909', desc: 'Migraine, unspecified, not intractable, without status migrainosus' },
    { code: 'K21.9', desc: 'Gastro-esophageal reflux disease without esophagitis' },
    { code: 'F32.9', desc: 'Major depressive disorder, single episode, unspecified' },
    { code: 'H26.9', desc: 'Unspecified cataract' },
    { code: 'L24.9', desc: 'Irritant contact dermatitis, unspecified cause' }
  ];

  var _view = 'dupCheck'; // 'dupCheck' | 'matched' | 'form' | 'payment' | 'success' | 'existingVisit'
  var _checkQuery = '';
  var _matchedPatient = null;
  var _matchedPatientsList = [];
  var _fuzzyMatchedPatient = null;
  var _dpdpaConsent = false;
  var _abhaNumber = '';
  var _duplicateChoice = ''; // 'merge' | 'split'
  var _isNewRegistrationFlow = false;

  var _selectedBranch = 'BLR';
  var _branches = {
    'BLR': { name: 'Bengaluru HSR (Main)', prefix: 'BLR', fee: 100 },
    'DEL': { name: 'Delhi NCR Saket', prefix: 'DEL', fee: 150 },
    'MUM': { name: 'Mumbai Andheri', prefix: 'MUM', fee: 200 },
    'HYD': { name: 'Hyderabad Gachibowli', prefix: 'HYD', fee: 100 }
  };

  // Configurable Fee Slabs
  var _feePolicy = {
    standardAmount: 100,
    chargeFrequency: 'lifetime', // 'lifetime' | 'visit'
    exemptPayers: ['CGHS', 'PMJAY', 'ECHS', 'ESI']
  };

  // Form Fields State
  var _formFields = {
    firstName: '',
    lastName: '',
    mobile: '',
    email: '',
    dob: '',
    age: '',
    gender: 'Male',
    address: ''
  };

  // Visit details state (for routing)
  var _visitType = 'OPD';
  var _payer = 'Self Pay';
  var _feeMode = 'UPI';
  var _txnRef = '';
  var _collectPayment = true;
  var _referredBy = '';
  var _selectedDoctor = '';
  var _selectedDept = '';
  var _preferredSlot = '';
  var _selectedDatePill = '';
  var _selectedTimePill = '';
  window._selectedProcedureName = 'Cataract Surgery';
  window._chiefComplaint = '';
  
  var _lastReg = null;

  function getTodayDateStr() {
    return window._HIS_TODAY || new Date().toISOString().slice(0, 10);
  }

  function getFormattedTime() {
    return new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
  }

  function computeAgeFromDob(dob) {
    if (!dob) return '';
    var birth = new Date(dob);
    var today = new Date();
    var age = today.getFullYear() - birth.getFullYear();
    var m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age >= 0 ? age : 0;
  }

  function computeDobFromAge(age) {
    if (isNaN(age) || age < 0) return '';
    var birthYear = new Date().getFullYear() - age;
    return birthYear + '-01-01'; // Default to Jan 1st of birth year
  }

  function fuzzyNameSearch(firstName, lastName) {
    var queryName = ((firstName || '') + ' ' + (lastName || '')).toLowerCase().trim().replace(/[^a-z0-9]/g, '');
    if (queryName.length < 3) return null;

    var patients = window.state.patients || [];
    for (var i = 0; i < patients.length; i++) {
      var dbName = (patients[i].name || '').toLowerCase().trim().replace(/[^a-z0-9]/g, '');
      if (dbName.includes(queryName) || queryName.includes(dbName)) {
        return patients[i];
      }
    }
    return null;
  }

  function getPatientTypeBadge(patient) {
    var type = patient.type || 'OPD';
    if (patient.status === 'Discharged') return '<span class="reg-badge reg-badge-ret">Discharged</span>';
    if (type === 'IPD') return '<span class="reg-badge reg-badge-ipd">Active IPD</span>';
    if (type === 'Emergency') return '<span class="reg-badge reg-badge-emerg">Active Emergency</span>';
    if (type === 'Daycare') return '<span class="reg-badge reg-badge-dc">Active Daycare</span>';
    return '<span class="reg-badge reg-badge-opd">OPD</span>';
  }

  function injectRegistrationCSS() {
    if (document.getElementById('reg-new-css')) return;
    var style = document.createElement('style');
    style.id = 'reg-new-css';
    style.textContent = `
      .reg-container { font-family: 'Inter', 'Outfit', sans-serif; color: var(--text-primary); max-width: 100%; margin: 0; padding-bottom: 3rem; }
      .reg-card { background: var(--bg-surface, #fff); border: none; border-radius: 0; box-shadow: none; overflow: hidden; margin-top: 0; }
      .reg-header { background: linear-gradient(135deg, var(--primary, #1b3a5c) 0%, #11253c 100%); color: white; padding: 24px 32px; position: relative; }
      .reg-header h2 { font-size: 20px; font-weight: 800; margin: 0 0 6px 0; }
      .reg-header p { font-size: 13px; margin: 0; opacity: 0.85; }
      .reg-branch-picker { position: absolute; right: 32px; top: 50%; transform: translateY(-50%); background: rgba(255,255,255,0.15); border: 1px solid rgba(255,255,255,0.25); border-radius: 8px; color: white; padding: 6px 12px; font-size: 12px; font-weight: 700; outline: none; }
      .reg-branch-picker option { color: #333; }
      
      .reg-body { padding: 0; }
      .reg-section-title { font-size: 12px; font-weight: 800; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.8px; margin: 1.5rem 0 0.75rem 0; padding-bottom: 6px; border-bottom: 1px solid var(--border-color); }
      .reg-section-title:first-child { margin-top: 0; }
      
      .gate-searchbox { background: transparent; padding: 0; text-align: left; border: none; margin-bottom: 1.5rem; }
      .gate-searchbox h3 { margin: 0 0 10px 0; color: #1b3a5c; font-size: 16px; font-weight: 800; }
      .gate-searchbox p { font-size: 12px; color: var(--text-secondary); margin: 0 0 16px 0; }
      .gate-input-wrapper { display: flex; gap: 12px; max-width: 480px; margin: 0; }
      .gate-input { flex: 1; padding: 12px 16px; border: 2px solid #cbd5e1; border-radius: 8px; outline: none; font-size: 14px; text-align: left; font-weight: 600; }
      .gate-input:focus { border-color: #1b3a5c; box-shadow: 0 0 0 4px rgba(27,58,92,0.1); }
      .gate-btn { background: #1b3a5c; color: white; border: none; border-radius: 8px; padding: 0 24px; font-weight: 700; font-size: 13px; cursor: pointer; transition: background 0.15s; }
      .gate-btn:hover { background: #11253c; }

      .match-card { background: #fffbeb; border: 2px solid #fde68a; border-radius: 12px; padding: 20px; text-align: left; max-width: 580px; margin: 1.5rem auto 0 auto; box-shadow: var(--shadow-md); }
      .match-title { display: flex; align-items: center; gap: 8px; font-size: 15px; font-weight: 800; color: #b45309; margin-bottom: 12px; }
      .match-details { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size: 13px; color: #1e293b; background: white; padding: 14px; border-radius: 8px; border: 1px solid #fef3c7; margin-bottom: 12px; }
      .match-actions { display: flex; gap: 10px; justify-content: flex-end; }
      
      .reg-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 16px; margin-bottom: 1.25rem; }
      .reg-field { display: flex; flex-direction: column; gap: 6px; }
      .reg-label { font-size: 11px; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.5px; }
      .reg-label span { color: #ef4444; }
      .reg-input, .reg-select { padding: 10px 14px; border: 1.5px solid #e2e8f0; border-radius: 8px; font-size: 13px; outline: none; background: white; color: var(--text-primary); transition: border-color 0.2s; box-sizing: border-box; width: 100%; }
      .reg-input:focus, .reg-select:focus { border-color: #1b3a5c; }
      .reg-input[readonly] { background: #f8fafc; color: #64748b; }
      
      .reg-badge { padding: 3px 9px; border-radius: 12px; font-size: 10px; font-weight: 700; display: inline-block; text-transform: uppercase; }
      .reg-badge-opd   { background: #dbeafe; color: #1e40af; }
      .reg-badge-ipd   { background: #ede9fe; color: #5b21b6; }
      .reg-badge-emerg { background: #fee2e2; color: #991b1b; }
      .reg-badge-dc    { background: #d1fae5; color: #065f46; }
      .reg-badge-ret   { background: #f1f5f9; color: #475569; }

      .fee-panel { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 10px; padding: 16px; display: flex; align-items: center; justify-content: space-between; gap: 14px; margin-top: 1rem; }
      .fee-amount { font-size: 26px; font-weight: 800; color: #15803d; font-family: 'Outfit', sans-serif; }
      .fee-mode-selector { display: flex; gap: 6px; }
      .fee-mode-btn { background: white; border: 1.5px solid #bbf7d0; border-radius: 6px; color: #15803d; padding: 6px 12px; font-size: 11px; font-weight: 700; cursor: pointer; transition: all 0.15s; }
      .fee-mode-btn.active { background: #15803d; color: white; border-color: #15803d; }
      
      .pay-overlay { background: rgba(0,0,0,0.5); position: fixed; top: 0; left: 0; right: 0; bottom: 0; display: flex; align-items: center; justify-content: center; z-index: 1000; }
      .pay-modal { background: white; border-radius: 16px; width: 440px; box-shadow: 0 12px 40px rgba(0,0,0,0.15); overflow: hidden; }
      .pay-modal-hdr { background: #15803d; color: white; padding: 16px 20px; font-weight: 800; font-size: 15px; }
      .pay-modal-body { padding: 20px; }
      
      .btn-row { display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px; padding-top: 16px; border-top: 1px solid var(--border-color); }
      .btn-primary { background: #1b3a5c; color: white; border: none; border-radius: 8px; padding: 11px 24px; font-weight: 700; font-size: 13px; cursor: pointer; transition: all 0.15s; }
      .btn-primary:hover { background: #11253c; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(27,58,92,0.15); }
      .btn-secondary { background: #f1f5f9; color: #475569; border: none; border-radius: 8px; padding: 11px 18px; font-weight: 600; font-size: 13px; cursor: pointer; }
      .btn-secondary:hover { background: #e2e8f0; }

      .success-box { text-align: center; padding: 20px 0; }
      .success-icon { font-size: 56px; color: #10b981; margin-bottom: 12px; }
      .success-uhid { font-size: 32px; font-weight: 900; color: #1b3a5c; background: #eff6ff; display: inline-block; padding: 8px 24px; border-radius: 12px; border: 2.5px solid #1b3a5c; letter-spacing: 1.5px; font-family: 'Outfit', monospace; margin: 10px 0; }
      .receipt-paper { background: #fafafa; border: 1.5px dashed #cbd5e1; border-radius: 12px; padding: 16px 20px; text-align: left; font-size: 12px; margin: 18px 0; }
      .receipt-line { display: flex; justify-content: space-between; padding: 4px 0; color: #334155; }
      .receipt-total { border-top: 1px solid #e2e8f0; padding-top: 6px; margin-top: 6px; font-weight: 800; font-size: 13px; color: #1b3a5c; }

      .route-box { display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 10px; margin-top: 20px; }
      .route-card-btn { display: flex; flex-direction: column; align-items: center; gap: 8px; padding: 14px; border: 1.5px solid #e2e8f0; border-radius: 10px; cursor: pointer; background: #fff; transition: all 0.15s; font-size: 12px; font-weight: 700; color: var(--text-primary); }
      .route-card-btn:hover { border-color: #1b3a5c; background: rgba(27,58,92,0.04); transform: translateY(-2px); }
      .route-card-btn .route-icon { font-size: 24px; }
      
      .dup-warning-banner { background: #fffbeb; border: 1px solid #fde68a; border-radius: 8px; padding: 12px 16px; font-size: 13px; color: #92400e; margin-bottom: 1rem; display: flex; align-items: center; justify-content: space-between; }
      .switch { position: relative; display: inline-block; width: 44px; height: 22px; }
      .switch input { opacity: 0; width: 0; height: 0; }
      .slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #cbd5e1; transition: .2s; border-radius: 22px; }
      .slider:before { position: absolute; content: ""; height: 16px; width: 16px; left: 3px; bottom: 3px; background-color: white; transition: .2s; border-radius: 50%; }
      input:checked + .slider { background-color: #10b981; }
      input:checked + .slider:before { transform: translateX(22px); }
      .icd10-item:hover { background: #eff6ff; }
    `;
    document.head.appendChild(style);
  }

  function generateNewUhid(branchPrefix) {
    var prefix = 'BLR';
    if (typeof branchPrefix === 'number' && window._branches && window._branches[branchPrefix]) {
      prefix = window._branches[branchPrefix].code || window._branches[branchPrefix].name.slice(0, 3).toUpperCase();
    } else if (typeof branchPrefix === 'string') {
      prefix = branchPrefix.toUpperCase();
    }

    window.state._branchUhidSeq = window.state._branchUhidSeq || {};
    window.state._branchUhidSeq[prefix] = window.state._branchUhidSeq[prefix] || 420;

    var newUhid = '';
    var isDuplicate = true;

    while (isDuplicate) {
      window.state._branchUhidSeq[prefix]++;
      var seq = String(window.state._branchUhidSeq[prefix]).padStart(5, '0');
      newUhid = prefix + '-' + seq;

      // Ensure this UHID is completely unique
      var exists = (window.state.patients || []).some(function(p) {
        return p.uhid === newUhid;
      });
      if (!exists) {
        isDuplicate = false;
      }
    }
    return newUhid;
  }


  function performDuplicateCheck(query) {
    if (!query || query.trim().length < 2) return null;
    var cleanQ = query.trim().toLowerCase();
    
    // Check mobile primarily
    var found = (window.state.patients || []).find(function (p) {
      var mobileMatch = p.mobile && p.mobile.replace(/[^0-9]/g, '') === cleanQ;
      var uhidMatch = p.uhid && p.uhid.toLowerCase() === cleanQ;
      return mobileMatch || uhidMatch;
    });
    return found || null;
  }

  function performDuplicateCheckAll(query) {
    if (!query || query.trim().length < 2) return [];
    var cleanQ = query.trim().toLowerCase();
    
    return (window.state.patients || []).filter(function (p) {
      var mobileMatch = p.mobile && p.mobile.replace(/[^0-9]/g, '') === cleanQ;
      var uhidMatch = p.uhid && p.uhid.toLowerCase() === cleanQ;
      return mobileMatch || uhidMatch;
    });
  }

  /* ── MAIN ROUTER VIEW ───────────────────────────────────────── */
  window.views.registration = function (container, subAnchor, params) {
    injectRegistrationCSS();
    
    if (window.state && window.state.activeBranch) {
      _selectedBranch = window.state.activeBranch;
    }

    var pageTitleEl = document.getElementById('active-page-title');
    if (pageTitleEl) pageTitleEl.textContent = 'Patient Desk & Registration (India)';

    if (params && params.action === 'new') {
      _view = 'dupCheck';
      _checkQuery = '';
      _matchedPatient = null;
      _fuzzyMatchedPatient = null;
      resetFormFields();
    } else if (params && params.action === 'dup') {
      _view = 'dupCheck';
      _checkQuery = '';
      _matchedPatient = null;
      _fuzzyMatchedPatient = null;
      _isNewRegistrationFlow = false;
    } else if (params && params.uhid) {
      var patient = (window.state.patients || []).find(p => p.uhid === params.uhid);
      if (patient) {
        _matchedPatient = patient;
        _view = 'existingVisit';
        _isNewRegistrationFlow = false;
      }
    } else {
      _view = 'dupCheck';
      _checkQuery = '';
      _matchedPatient = null;
      _fuzzyMatchedPatient = null;
      _isNewRegistrationFlow = false;
    }

    renderCurrentState(container);
  };

  function resetFormFields() {
    _formFields = { firstName: '', lastName: '', mobile: '', email: '', dob: '', age: '', gender: 'Male', address: '' };
    _visitType = 'OPD';
    _payer = 'Self Pay';
    _feeMode = 'UPI';
    _txnRef = '';
    _collectPayment = true;
    _selectedDoctor = '';
    _selectedDept = '';
    _preferredSlot = '';
    window._chiefComplaint = '';
    _dpdpaConsent = false;
    _abhaNumber = '';
    _duplicateChoice = '';
    _isNewRegistrationFlow = true;
  }

  function renderCurrentState(container) {
    var backBtn = document.getElementById('global-back-btn');
    if (backBtn) {
      if (_view === 'dupCheck') {
        backBtn.style.display = 'none';
        backBtn.onclick = function() { window.history.back(); };
      } else {
        backBtn.style.display = 'inline-flex';
        backBtn.onclick = function() { window._regGoBackToCheck(); };
      }
    }

    var lookupGateHTML = renderDuplicateCheckGate();
    var sectionBelowHTML = '';

    if (_view === 'matched') {
      sectionBelowHTML = renderMatchedCard();
    } else if (_view === 'form') {
      sectionBelowHTML = renderRegistrationForm();
    } else if (_view === 'payment') {
      sectionBelowHTML = renderPaymentStep();
    } else if (_view === 'success') {
      sectionBelowHTML = renderSuccessReceipt();
    } else if (_view === 'existingVisit' && _matchedPatient) {
      sectionBelowHTML = renderExistingPatientVisitForm();
    }

    var showLookup = (_view === 'dupCheck' || _view === 'matched' || _view === 'form');

    window.ipdSafeRender(container, `
      <div class="reg-container" style="font-family:'Inter',sans-serif; width:100%; box-sizing:border-box; display:flex; flex-direction:column; gap:20px; padding:0;">
        ${showLookup ? `
          <div class="reg-body" style="padding:0;">
            ${lookupGateHTML}
          </div>
        ` : ''}
        ${sectionBelowHTML ? `
          <div style="${showLookup ? 'border-top:1.5px solid var(--border-color); padding-top:20px;' : ''} animation: fadeIn 0.2s ease-in-out;">
            ${sectionBelowHTML}
          </div>
        ` : ''}
      </div>
    `);

    var gateInput = document.getElementById('gate-search-input');
    if (gateInput && (!document.activeElement || (document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA'))) {
      gateInput.focus();
      gateInput.addEventListener('keyup', function(e) {
        if (e.key === 'Enter') {
          window._regSubmitGateCheck();
        }
      });
    }
  }

  /* ── STEP 1: DUPLICATE CHECK GATE ────────────────────────────── */
  function renderDuplicateCheckGate() {
    return `
      <div class="gate-searchbox" style="text-align:left;">
        <div style="margin-bottom:12px; border-bottom:1.5px solid var(--border-color); padding-bottom:10px;">
          <h3 style="margin:0; font-size:14px; font-weight:800; color:#1b3a5c;">🔍 Centralized Registry Lookup</h3>
        </div>
        <p style="margin:0 0 12px 0; font-size:12px; color:var(--text-secondary); line-height:1.4;">Gating Action: Search by Patient Mobile Number (or unique UHID) to check for duplicate profiles before creating a new record.</p>
        <div class="gate-input-wrapper" style="display:flex; gap:10px; max-width:600px;">
          <input type="tel" class="gate-input" id="gate-search-input" placeholder="Enter 10-digit mobile number or UHID" value="${_checkQuery}" maxlength="10" style="flex:1; padding:8px 12px; font-size:13px; border:1.5px solid #cbd5e1; border-radius:6px;">
          <button class="gate-btn" style="background:#1b3a5c; color:white; border:none; padding:8px 18px; border-radius:6px; font-weight:700; cursor:pointer;" onclick="window._regSubmitGateCheck()">Check Registry</button>
        </div>
      </div>
      <div style="margin-top: 10px; text-align:left;">
        <span style="font-size: 11px; color: var(--text-secondary); display:flex; align-items:center; gap:4px;">
          🛡️ <strong>Gating Rule:</strong> A mobile-number match never silently merges patients. System will prompt for verbal identity confirmation.
        </span>
      </div>
    `;
  }

  window._regSubmitGateCheck = function() {
    var input = document.getElementById('gate-search-input');
    if (!input) return;
    var query = input.value.trim().replace(/[^0-9a-zA-Z]/g, '');
    if (!query) {
      alert('Please enter a mobile number or UHID.');
      return;
    }
    _checkQuery = query;

    var matchedList = performDuplicateCheckAll(query);
    if (matchedList && matchedList.length > 0) {
      _matchedPatientsList = matchedList;
      _matchedPatient = matchedList[0];
      _view = 'matched';
    } else {
      _view = 'form';
      resetFormFields();
      if (/^\d{10}$/.test(query)) {
        _formFields.mobile = query;
      }
    }
    var c = document.getElementById('main-content');
    if (c) renderCurrentState(c);
  };

  /* ── MOBILE DUPLICATE CHECK DYNAMIC GATE ────────────────────── */
  window._regUpdateMobileCheck = function(val) {
    _formFields.mobile = val;
    var clean = val.replace(/[^0-9]/g, '');
    if (clean.length === 10 && _duplicateChoice !== 'split') {
      var matches = performDuplicateCheckAll(clean);
      if (matches && matches.length > 0) {
        _matchedPatientsList = matches;
        _matchedPatient = matches[0];
        _view = 'matched';
        var c = document.getElementById('main-content');
        if (c) renderCurrentState(c);
      }
    }
  };

  /* ── DUPLICATE MATCHED CARD (Verbal identity check) ─────────── */
  function renderMatchedCard() {
    return `
      <div class="match-card" style="text-align:left;">
        <div class="match-title" style="display:flex; align-items:center; gap:6px; color:#b45309; font-weight:800; font-size:14px; margin-bottom:8px;">
          <span>⚠️</span> <span>Existing Registry Match Found!</span>
        </div>
        <p style="font-size: 12px; color:#92400e; margin-bottom: 15px; font-weight:700; line-height:1.4;">
          👉 VERBAL CONFIRMATION REQUIRED: Please verify the identity of the person at the desk. Multiple profiles may share this number.
        </p>
        
        <div style="display:flex; flex-direction:column; gap:10px; margin-bottom:20px;">
          ${_matchedPatientsList.map(function(p) {
            return `
              <div style="background:#fffbeb; border:1px solid #fde68a; border-radius:8px; padding:12px 16px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">
                <div style="font-size:12px;">
                  <div style="font-weight:800; color:#1b3a5c; font-size:13px;">${p.name}</div>
                  <div style="color:var(--text-secondary); margin-top:2px;">UHID: <span class="mono" style="font-weight:700;">${p.uhid}</span> | Age/Sex: ${p.age ? p.age + 'y' : 'N/A'} / ${p.gender}</div>
                  <div style="color:var(--text-muted); font-size:10px; margin-top:2px;">Last Department: ${p.department || 'N/A'} | Status: ${p.status || 'Active'}</div>
                </div>
                <button class="btn-primary" style="background:#15803d; color:white; padding:6px 12px; border-radius:6px; font-size:11px; font-weight:700; cursor:pointer;" onclick="window._regConfirmSamePerson('${p.uhid}')">Yes, Same Patient (Use UHID)</button>
              </div>
            `;
          }).join('')}
        </div>
        
        <div style="border-top:1px solid #cbd5e1; padding-top:12px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">
          ${_matchedPatientsList.length >= 10 ? `
            <span style="font-size:11px; color:#ef4444; font-weight:700;">⚠️ Maximum limit of 10 patients per mobile number reached.</span>
            <button class="btn-secondary" style="background:#f1f5f9; border:1.5px solid #cbd5e1; color:#94a3b8; padding:6px 12px; border-radius:6px; font-size:11px; font-weight:700; cursor:not-allowed;" disabled>👤 Add Another Patient</button>
          ` : `
            <span style="font-size:11px; color:var(--text-secondary);">None of the above matches? Register a new family member under this contact.</span>
            <button class="btn-secondary" style="background:#f1f5f9; border:1.5px solid #cbd5e1; color:#334155; padding:6px 12px; border-radius:6px; font-size:11px; font-weight:700; cursor:pointer;" onclick="window._regConfirmDifferentPerson()">👤 Add Another Patient</button>
          `}
        </div>
      </div>
    `;
  }

  window._regConfirmSamePerson = function(uhid) {
    var p = (_matchedPatientsList || []).find(pt => pt.uhid === uhid);
    if (!p) return;
    _matchedPatient = p;
    _duplicateChoice = 'merge';
    _isNewRegistrationFlow = false;
    
    // Log choice
    window.state.auditLogs = window.state.auditLogs || [];
    window.state.auditLogs.push({
      timestamp: new Date().toISOString(),
      action: 'PATIENT_RESOLVED_SAME',
      user: 'Front Desk Exec',
      details: 'Identified matching patient for UHID: ' + p.uhid + ' based on mobile lookup.'
    });
    _view = 'existingVisit';
    var c = document.getElementById('main-content');
    if (c) renderCurrentState(c);
  };

  window._regConfirmDifferentPerson = function() {
    _duplicateChoice = 'split';
    _matchedPatient = null;
    _matchedPatientsList = [];
    window.state.auditLogs = window.state.auditLogs || [];
    window.state.auditLogs.push({
      timestamp: new Date().toISOString(),
      action: 'PATIENT_RESOLVED_DIFFERENT',
      user: 'Front Desk Exec',
      details: 'Created new patient record with shared family mobile ' + _checkQuery + ' after verbal check failed.'
    });
    
    // Proceed to form to create a new profile with the same phone number
    _view = 'form';
    resetFormFields();
    _formFields.mobile = _checkQuery;
    var c = document.getElementById('main-content');
    if (c) renderCurrentState(c);
  };

  /* ── REGISTRATION FORM ──────────────────────────────────────── */
  function renderRegistrationForm() {
    var warningHTML = '';
    if (_fuzzyMatchedPatient) {
      warningHTML = `
        <div class="dup-warning-banner" style="text-align:left;">
          <div>
            <strong>⚠️ Potential Duplicate:</strong> Name matches existing patient <strong>${_fuzzyMatchedPatient.name}</strong> (UHID: ${_fuzzyMatchedPatient.uhid}).
            Please verbally check address/DOB to verify.
          </div>
          <div style="margin-top:6px; display:flex; gap:8px;">
            <button class="btn-secondary" style="padding:4px 8px; font-size:11px;" onclick="window._regAcceptFuzzyMerge()">Merge into Existing</button>
            <button class="btn-primary" style="padding:4px 8px; font-size:11px; background:#b45309; border-color:#b45309;" onclick="window._regIgnoreFuzzyWarning()">Keep as New</button>
          </div>
        </div>
      `;
    }

    var selDay = '';
    var selMonth = '';
    var selYear = '';
    if (_formFields.dob) {
      var dobParts = _formFields.dob.split('-');
      if (dobParts.length === 3) {
        selYear = dobParts[0];
        selMonth = dobParts[1];
        selDay = dobParts[2];
      }
    }

    var stepperHTML = renderStepper(1);

    return `
      ${stepperHTML}
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 1rem; text-align:left;">
        <span style="font-size: 13px; font-weight: 700; color: #1b3a5c;">✓ Profile Onboarding Inputs</span>
        <button class="btn-secondary" style="padding: 6px 12px; font-size: 11px; cursor:pointer;" onclick="window._regGoBackToCheck()">← Clear &amp; Reset</button>
      </div>

      ${warningHTML}

      <div style="text-align:left;">
        <div style="font-size: 12px; font-weight: 800; color: #475569; margin-top: 15px; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px;">
          1. PATIENT PROFILE (MINIMAL MANDATORY CORE)
        </div>
        <div class="reg-grid" style="grid-template-columns: repeat(3, 1fr); gap: 15px; margin-bottom: 15px;">
          <div class="reg-field">
            <div class="reg-label" style="font-size:12px; font-weight:700; margin-bottom:4px;">Mobile Number <span style="color:#ef4444;">*</span></div>
            <input type="tel" class="reg-input" id="form-mobile" placeholder="10-digit mobile" maxlength="10" value="${_formFields.mobile}" disabled style="padding:8px 12px; border:1.5px solid #cbd5e1; border-radius:6px; font-size:13px; background:#f1f5f9; color:#64748b; cursor:not-allowed; width:100%; box-sizing:border-box;">
          </div>
          <div class="reg-field">
            <div class="reg-label" style="font-size:12px; font-weight:700; margin-bottom:4px;">First Name <span style="color:#ef4444;">*</span></div>
            <input type="text" class="reg-input" id="form-firstname" placeholder="First Name" value="${_formFields.firstName}" oninput="window._regUpdateNameField('firstName', this.value)" style="padding:8px 12px; border:1.5px solid #cbd5e1; border-radius:6px; font-size:13px; width:100%; box-sizing:border-box;">
          </div>
          <div class="reg-field">
            <div class="reg-label" style="font-size:12px; font-weight:700; margin-bottom:4px;">Last Name <span style="color:#ef4444;">*</span></div>
            <input type="text" class="reg-input" id="form-lastname" placeholder="Last Name" value="${_formFields.lastName}" oninput="window._regUpdateNameField('lastName', this.value)" style="padding:8px 12px; border:1.5px solid #cbd5e1; border-radius:6px; font-size:13px; width:100%; box-sizing:border-box;">
          </div>
        </div>

        <div style="font-size: 12px; font-weight: 800; color: #475569; margin-top: 20px; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px;">
          2. OPTIONAL DEMOGRAPHICS (CAPTURE NOW OR LATER)
        </div>
        <div class="reg-grid" style="grid-template-columns: repeat(3, 1fr); gap: 15px; margin-bottom: 15px;">
          <div class="reg-field">
            <div class="reg-label" style="font-size:12px; font-weight:700; margin-bottom:4px;">Date of Birth</div>
            <div style="display:flex; gap:8px; width:100%;">
              <select class="reg-select" id="form-dob-day" onchange="window._regUpdateDobParts()" style="flex:1; padding:8px 12px; border:1.5px solid #cbd5e1; border-radius:6px; font-size:13px; box-sizing:border-box;">
                <option value="">DD</option>
                ${Array.from({length: 31}, (_, i) => String(i + 1).padStart(2, '0')).map(d => `
                  <option value="${d}" ${selDay === d ? 'selected' : ''}>${d}</option>
                `).join('')}
              </select>
              
              <select class="reg-select" id="form-dob-month" onchange="window._regUpdateDobParts()" style="flex:1.2; padding:8px 12px; border:1.5px solid #cbd5e1; border-radius:6px; font-size:13px; box-sizing:border-box;">
                <option value="">MM</option>
                ${['01','02','03','04','05','06','07','08','09','10','11','12'].map((m, idx) => {
                  const names = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
                  return `<option value="${m}" ${selMonth === m ? 'selected' : ''}>${names[idx]} (${m})</option>`;
                }).join('')}
              </select>
              
              <select class="reg-select" id="form-dob-year" onchange="window._regUpdateDobParts()" style="flex:1.5; padding:8px 12px; border:1.5px solid #cbd5e1; border-radius:6px; font-size:13px; box-sizing:border-box;">
                <option value="">YYYY</option>
                ${Array.from({length: 121}, (_, i) => String(new Date().getFullYear() - i)).map(y => `
                  <option value="${y}" ${selYear === y ? 'selected' : ''}>${y}</option>
                `).join('')}
              </select>
            </div>
          </div>
          <div class="reg-field">
            <div class="reg-label" style="font-size:12px; font-weight:700; margin-bottom:4px;">Age (years)</div>
            <input type="number" class="reg-input" id="form-age" placeholder="Age" min="0" max="120" value="${_formFields.age}" oninput="window._regUpdateAge(this.value)" style="padding:8px 12px; border:1.5px solid #cbd5e1; border-radius:6px; font-size:13px; width:100%; box-sizing:border-box;">
          </div>
          <div class="reg-field">
            <div class="reg-label" style="font-size:12px; font-weight:700; margin-bottom:4px;">Sex</div>
            <select class="reg-select" id="form-gender" onchange="window._regUpdateField('gender', this.value)" style="padding:8px 12px; border:1.5px solid #cbd5e1; border-radius:6px; font-size:13px; width:100%; box-sizing:border-box;">
              <option value="Male" ${_formFields.gender === 'Male' ? 'selected' : ''}>Male</option>
              <option value="Female" ${_formFields.gender === 'Female' ? 'selected' : ''}>Female</option>
              <option value="Other" ${_formFields.gender === 'Other' ? 'selected' : ''}>Other</option>
            </select>
          </div>
        </div>
        
        <div class="reg-grid" style="grid-template-columns: 2fr 1fr; gap: 15px; margin-bottom: 20px;">
          <div class="reg-field">
            <div class="reg-label" style="font-size:12px; font-weight:700; margin-bottom:4px;">Permanent Address</div>
            <input type="text" class="reg-input" id="form-address" placeholder="Address Details" value="${_formFields.address}" oninput="window._regUpdateField('address', this.value)" style="padding:8px 12px; border:1.5px solid #cbd5e1; border-radius:6px; font-size:13px; width:100%; box-sizing:border-box;">
          </div>
          <div class="reg-field">
            <div class="reg-label" style="font-size:12px; font-weight:700; margin-bottom:4px;">Email Address</div>
            <input type="email" class="reg-input" id="form-email" placeholder="Email (Optional)" value="${_formFields.email}" oninput="window._regUpdateField('email', this.value)" style="padding:8px 12px; border:1.5px solid #cbd5e1; border-radius:6px; font-size:13px; width:100%; box-sizing:border-box;">
          </div>
        </div>

        <div style="font-size: 12px; font-weight: 800; color: #475569; margin-top: 20px; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px;">
          3. Compliance Linkages & Consent
        </div>
        <div class="reg-grid" style="grid-template-columns: 1fr 2fr; gap: 15px; margin-bottom: 20px; align-items:center;">
          <div class="reg-field">
            <div class="reg-label" style="font-size:12px; font-weight:700; margin-bottom:4px;">ABDM / ABHA Number (Optional)</div>
            <input type="text" class="reg-input" id="form-abha" placeholder="e.g. 14-digit ABHA Number" value="${_abhaNumber}" oninput="window._regUpdateAbha(this.value)" style="padding:8px 12px; border:1.5px solid #cbd5e1; border-radius:6px; font-size:13px; width:100%; box-sizing:border-box;">
          </div>
          <div style="display: flex; align-items: flex-start; gap: 8px; margin-top: 15px;">
            <input type="checkbox" id="dpdpa-consent-checkbox" ${_dpdpaConsent ? 'checked' : ''} onchange="window._regSetConsent(this.checked)" style="width:18px; height:18px; cursor:pointer; margin-top:2px;">
            <label for="dpdpa-consent-checkbox" style="font-size:12px; color:var(--text-primary); cursor:pointer; line-height:1.4;">
              <strong>DPDPA 2023 Consent:</strong> Patient consents to Saronil Hospital collecting and processing basic health demographics for clinical routing. <span style="color:#ef4444;">*</span>
            </label>
          </div>
        </div>
      </div>

      <div class="reg-section-title">4. Registration Onboarding Slabs</div>
      ${buildFeeDisplay()}

      <div class="btn-row">
        <button class="btn-secondary" onclick="window._regGoBackToCheck()">Cancel</button>
        <button class="btn-primary" onclick="window._regTriggerSaveFlow()">Continue</button>
      </div>
    `;
  }

  window._regUpdateNameField = function(field, val) {
    _formFields[field] = val;
    _fuzzyMatchedPatient = null;
  };

  window._regAcceptFuzzyMerge = function() {
    _matchedPatient = _fuzzyMatchedPatient;
    _duplicateChoice = 'merge';
    _view = 'existingVisit';
    var c = document.getElementById('main-content');
    if (c) renderCurrentState(c);
  };

  window._regIgnoreFuzzyWarning = function() {
    _fuzzyMatchedPatient = null;
    var c = document.getElementById('main-content');
    if (c) renderCurrentState(c);
  };

  window._regGoBackToCheck = function() {
    _view = 'dupCheck';
    _checkQuery = '';
    _matchedPatient = null;
    _fuzzyMatchedPatient = null;
    _isNewRegistrationFlow = false;
    var c = document.getElementById('main-content');
    if (c) renderCurrentState(c);
  };

  window._regUpdateField = function(field, value) {
    _formFields[field] = value;
  };

  window._regUpdateAbha = function(val) {
    _abhaNumber = val;
  };

  window._regSetConsent = function(chk) {
    _dpdpaConsent = chk;
  };

  window._regToggleCollectPayment = function(checked) {
    _collectPayment = checked;
    var label = document.getElementById('reg-toggle-label');
    if (label) {
      label.textContent = checked ? 'ON' : 'OFF';
      label.style.color = checked ? '#15803d' : '#64748b';
    }
    var sub = document.getElementById('fee-panel-subtitle');
    if (sub) {
      sub.textContent = checked ? '💡 Payment selection will be completed in the next step.' : '⚠️ Skipping payment collection step. Fee will be waived.';
      sub.style.color = checked ? '#64748b' : '#b45309';
    }
  };

  window._regUpdateDobParts = function() {
    var day = document.getElementById('form-dob-day')?.value || '';
    var month = document.getElementById('form-dob-month')?.value || '';
    var year = document.getElementById('form-dob-year')?.value || '';
    
    if (day && month && year) {
      var dobVal = year + '-' + month + '-' + day;
      _formFields.dob = dobVal;
      _formFields.age = computeAgeFromDob(dobVal);
      
      var ageInp = document.getElementById('form-age');
      if (ageInp) ageInp.value = _formFields.age;
    } else {
      _formFields.dob = '';
      _formFields.age = '';
      var ageInp = document.getElementById('form-age');
      if (ageInp) ageInp.value = '';
    }
  };

  window._regUpdateAge = function(ageVal) {
    var age = parseInt(ageVal);
    _formFields.age = ageVal;
    if (!isNaN(age) && age >= 0) {
      var birthYear = String(new Date().getFullYear() - age);
      _formFields.dob = birthYear + '-01-01';
      
      var daySelect = document.getElementById('form-dob-day');
      var monthSelect = document.getElementById('form-dob-month');
      var yearSelect = document.getElementById('form-dob-year');
      if (daySelect) daySelect.value = '01';
      if (monthSelect) monthSelect.value = '01';
      if (yearSelect) yearSelect.value = birthYear;
    } else {
      _formFields.dob = '';
      _formFields.age = '';
      var daySelect = document.getElementById('form-dob-day');
      var monthSelect = document.getElementById('form-dob-month');
      var yearSelect = document.getElementById('form-dob-year');
      if (daySelect) daySelect.value = '';
      if (monthSelect) monthSelect.value = '';
      if (yearSelect) yearSelect.value = '';
    }
  };

  window._regSetBranch = function(branchKey) {
    _selectedBranch = branchKey;
    var c = document.getElementById('main-content');
    if (c) renderCurrentState(c);
  };

  window._regSetVisitType = function(val) {
    _visitType = val;
    var c = document.getElementById('main-content');
    if (c) renderCurrentState(c);
  };

  window._regSetPayer = function(val) {
    _payer = val;
    var c = document.getElementById('main-content');
    if (c) renderCurrentState(c);
  };

  window._regSetFeeMode = function(val) {
    _feeMode = val;
    var c = document.getElementById('main-content');
    if (c) renderCurrentState(c);
  };

  function buildFeeDisplay() {
    var branchMeta = _branches[_selectedBranch];
    var isExempt = _feePolicy.exemptPayers.indexOf(_payer) !== -1;
    var fee = isExempt ? 0 : branchMeta.fee;

    if (fee === 0) {
      return `
        <div class="fee-panel" style="background: #fffbeb; border-color: #fde68a;">
          <div style="color: #92400e; font-weight: 700; font-size: 13px;">
            🏛️ Scheme Registration Waiver (₹0 Fee) — ${ _payer } Active.
          </div>
        </div>
      `;
    }

    return `
      <div class="fee-panel" style="display: flex; align-items: center; justify-content: space-between; gap: 14px;">
        <div>
          <div class="fee-amount">₹${fee}</div>
          <div style="font-size:12px; color:#15803d; font-weight:600;">Lifetime UHID Card Registration Fee (${branchMeta.name})</div>
          <div id="fee-panel-subtitle" style="font-size: 11px; color: ${_collectPayment ? '#64748b' : '#b45309'}; font-weight: 600; margin-top: 4px;">
            ${_collectPayment ? '💡 Payment selection will be completed in the next step.' : '⚠️ Skipping payment collection step. Fee will be waived.'}
          </div>
        </div>
        
        <div style="display: flex; align-items: center; gap: 12px; background: white; padding: 6px 12px; border-radius: 8px; border: 1.5px solid #cbd5e1; box-shadow: 0 1px 2px rgba(0,0,0,0.05); text-align: left;">
          <span style="font-size: 12px; font-weight: 700; color: #475569;">Collect Payment:</span>
          <label class="switch" style="position: relative; display: inline-block; width: 44px; height: 22px; margin: 0;">
            <input type="checkbox" id="reg-collect-payment-toggle" ${_collectPayment ? 'checked' : ''} onchange="window._regToggleCollectPayment(this.checked)" style="opacity: 0; width: 0; height: 0;">
            <span class="slider" style="position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #cbd5e1; transition: .2s; border-radius: 22px;"></span>
          </label>
          <span id="reg-toggle-label" style="font-size: 12px; font-weight: 800; color: ${_collectPayment ? '#15803d' : '#64748b'}; width: 35px; text-align: left; display: inline-block; margin-left: 4px;">
            ${_collectPayment ? 'ON' : 'OFF'}
          </span>
        </div>
      </div>
    `;
  }

  /* ── SAVE patient logic ──────────────────────────────────────── */
  window._regTriggerSaveFlow = function() {
    if (!_formFields.firstName.trim()) { alert('First Name is required.'); return; }
    if (!_formFields.lastName.trim()) { alert('Last Name is required.'); return; }
    if (!_formFields.mobile.trim() || _formFields.mobile.length !== 10) { alert('A valid 10-digit mobile number is required.'); return; }
    
    var cleanMob = _formFields.mobile.trim().replace(/[^0-9]/g, '');
    var matches = performDuplicateCheckAll(cleanMob);
    if (matches && matches.length >= 10) {
      alert('⚠️ Maximum limit of 10 patients per mobile number reached. Cannot register another patient under this mobile number.');
      return;
    }
    
    if (!_dpdpaConsent) { alert('DPDPA 2023 health data consent is required to register.'); return; }

    var branchMeta = _branches[_selectedBranch];
    var isExempt = _feePolicy.exemptPayers.indexOf(_payer) !== -1;
    var fee = isExempt ? 0 : branchMeta.fee;

    if (fee > 0 && _collectPayment) {
      _view = 'payment';
    } else {
      savePatientRecord(0, 'Skipped/Exempt');
    }

    var c = document.getElementById('main-content');
    if (c) renderCurrentState(c);
  };

  /* ── STEP 2: PAYMENT & FEE SELECTION ────────────────────────── */
  function renderPaymentStep() {
    var branchMeta = _branches[_selectedBranch];
    var isExempt = _feePolicy.exemptPayers.indexOf(_payer) !== -1;
    var fee = isExempt ? 0 : branchMeta.fee;

    var stepperHTML = renderStepper(2);

    return `
      ${stepperHTML}

      <div style="background: white; border: 1.5px solid #cbd5e1; border-radius: 12px; padding: 24px; text-align: left; max-width: 600px; margin: 0 auto; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
        <h3 style="font-size: 16px; font-weight: 800; color: #1b3a5c; margin: 0 0 16px 0; border-bottom: 1.5px solid #cbd5e1; padding-bottom: 8px;">
          💳 Registration Payment &amp; Confirmation
        </h3>

        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px; margin-bottom: 20px; font-size: 13px;">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
            <div>Patient Name: <strong>${_formFields.firstName} ${_formFields.lastName}</strong></div>
            <div>Mobile Number: <strong>${_formFields.mobile}</strong></div>
            <div>Payer Category: <strong>${_payer}</strong></div>
            <div>Selected Branch: <strong>${branchMeta.name}</strong></div>
          </div>
        </div>

        <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 20px; text-align: center; margin-bottom: 20px;">
          <div style="font-size: 11px; font-weight: 700; color: #166534; text-transform: uppercase; letter-spacing: 0.5px;">Onboarding Lifetime Fee</div>
          <div style="font-size: 36px; font-weight: 900; color: #15803d; font-family: 'Outfit', sans-serif; margin: 4px 0;">
            ₹${fee}
          </div>
          <div style="font-size: 12px; color: #166534; font-weight: 600;">
            ${isExempt ? 'Fee Waived under Scheme Policy' : 'One-time registration fee for lifetime UHID access'}
          </div>
        </div>

        ${fee > 0 ? `
          <div style="margin-bottom: 20px;">
            <div class="reg-label" style="margin-bottom: 6px; color: #475569;">Payment Method <span style="color:#ef4444;">*</span></div>
            <div class="fee-mode-selector" style="display: flex; gap: 8px;">
              ${['UPI', 'Cash', 'Card'].map(function(mode) {
                return `
                  <button class="fee-mode-btn ${mode === _feeMode ? 'active' : ''}" style="flex: 1; padding: 10px; border-radius: 6px; font-weight: 700; font-size: 13px;" onclick="window._regSetFeeMode('${mode}')">
                    ${mode === 'UPI' ? '📱 UPI' : (mode === 'Card' ? '💳 Card' : '💵 Cash')}
                  </button>
                `;
              }).join('')}
            </div>
          </div>

          <div style="margin-bottom: 20px;">
            <div class="reg-label" style="margin-bottom: 6px; color: #475569;">Reference / Transaction ID</div>
            <input type="text" id="reg-txn-ref" class="reg-input" placeholder="e.g. UPI Ref, Card Txn ID, or comments" value="${_txnRef}" style="padding: 10px 14px; border: 1.5px solid #cbd5e1; border-radius: 8px; font-size: 13px; font-weight: 600;" onchange="window._regUpdateTxnRef(this.value)">
          </div>
        ` : ''}

        <div style="display: flex; gap: 12px; justify-content: flex-end; margin-top: 24px; border-top: 1.5px solid #e2e8f0; padding-top: 16px;">
          <button class="btn-secondary" style="padding: 10px 20px; font-size: 13px;" onclick="window._regCancelPayment()">Back to Profile</button>
          <button class="btn-primary" style="padding: 10px 24px; font-size: 13px; background: #15803d; border-color: #15803d;" onclick="window._regCompletePayment()">
            Confirm &amp; Generate UHID
          </button>
        </div>
      </div>
    `;
  }

  function renderStepper(step) {
    return ``;
  }

  window._regUpdateTxnRef = function(val) {
    _txnRef = val;
  };

  window._regCancelPayment = function() {
    _view = 'form';
    var c = document.getElementById('main-content');
    if (c) renderCurrentState(c);
  };

  window._regCompletePayment = function() {
    var branchMeta = _branches[_selectedBranch];
    var isExempt = _feePolicy.exemptPayers.indexOf(_payer) !== -1;
    var fee = isExempt ? 0 : branchMeta.fee;
    savePatientRecord(fee, isExempt ? 'Exempt' : _feeMode);
  };

  function savePatientRecord(feeCollected, mode) {
    var newUhid = generateNewUhid(_selectedBranch);
    var dateToday = getTodayDateStr();
    var fullName = (_formFields.firstName.trim() + ' ' + _formFields.lastName.trim());

    var patientObj = {
      uhid: newUhid,
      name: fullName,
      age: _formFields.age ? parseInt(_formFields.age) : null,
      gender: _formFields.gender,
      mobile: _formFields.mobile.trim(),
      email: _formFields.email.trim() || null,
      address: _formFields.address.trim() || 'Not Provided',
      registeredAt: dateToday,
      possibleDuplicateOf: _fuzzyMatchedPatient ? _fuzzyMatchedPatient.uhid : null,
      registrationFeeStatus: feeCollected > 0 ? 'Paid' : 'Waived',
      abhaNumber: _abhaNumber || null,
      consentDPDPA: true,
      txnRef: feeCollected > 0 ? (_txnRef || null) : null
    };

    // Save globally
    window.state.patients = window.state.patients || [];
    window.state.patients.push(patientObj);

    // Save Billing line if fee collected
    if (feeCollected > 0) {
      window.state.billing = window.state.billing || [];
      window.state.billing.push({
        id: 'REG-INV-' + String(1000 + window.state.billing.length),
        uhid: newUhid,
        patientName: patientObj.name,
        amount: feeCollected,
        paid: feeCollected,
        status: 'Paid',
        date: dateToday,
        items: [
          { desc: 'Registration Fee (' + _branches[_selectedBranch].name + ')', qty: 1, rate: feeCollected, total: feeCollected }
        ]
      });
    }

    // Log Action
    window.state.auditLogs = window.state.auditLogs || [];
    window.state.auditLogs.push({
      timestamp: new Date().toISOString(),
      action: 'PATIENT_REGISTRATION',
      user: 'Front Desk Exec',
      details: 'Registered new patient ' + fullName + ' with UHID ' + newUhid + '. Fee: ' + feeCollected + ' (' + mode + ')' + (feeCollected > 0 && _txnRef ? ' [Txn: ' + _txnRef + ']' : '')
    });

    // Log to patient engagement timeline
    if (window.logPatientTimeline) {
      window.logPatientTimeline(newUhid, {
        type: 'registration',
        icon: '📋',
        title: 'Patient Registered',
        desc: fullName + ' registered at ' + (_branches[_selectedBranch] ? _branches[_selectedBranch].name : 'Saronil Health') + '. Registration fee ₹' + feeCollected + ' collected via ' + mode + '.' + (feeCollected > 0 && _txnRef ? ' (Txn Ref: ' + _txnRef + ')' : '')
      });
    }

    _lastReg = {
      uhid: newUhid,
      name: patientObj.name,
      age: patientObj.age,
      gender: patientObj.gender,
      mobile: patientObj.mobile,
      visitType: _visitType,
      fee: feeCollected,
      feeMode: mode,
      txnRef: feeCollected > 0 ? _txnRef : '',
      date: dateToday,
      time: getFormattedTime()
    };

    localStorage.setItem('saronil_patients', JSON.stringify(window.state.patients));
    if (window.state.billing) {
      localStorage.setItem('saronil_billing', JSON.stringify(window.state.billing));
    }

    _view = 'success';
    _matchedPatient = patientObj;
    var c = document.getElementById('main-content');
    if (c) renderCurrentState(c);
  }

  /* ── SUCCESS RECEIPT & ROUTING WORKSPACE ────────────────────── */
  function renderSuccessReceipt() {
    var p = _lastReg;
    var stepperHTML = renderStepper(3);
    return `
      ${stepperHTML}
      <div class="success-box" style="max-width: 600px; margin: 0 auto;">
        <div class="success-icon">✨</div>
        <h2 style="color: #065f46; font-size: 20px; font-weight: 800;">UHID Onboarded Successfully!</h2>
        <div style="font-size: 13px; color: var(--text-secondary); margin-top: 4px;">Branch: ${_branches[_selectedBranch].name}</div>
        
        <div class="success-uhid">${p.uhid}</div>

        <div class="receipt-paper">
          <div style="text-align:center; font-weight:800; font-size:13px; color:#1b3a5c; margin-bottom:10px;">🧾 REGISTRATION SLIP</div>
          <div class="receipt-line"><span>Name</span><strong>${p.name}</strong></div>
          <div class="receipt-line"><span>UHID</span><strong class="mono">${p.uhid}</strong></div>
          <div class="receipt-line"><span>Mobile</span><span>${p.mobile}</span></div>
          <div class="receipt-line"><span>DPDPA Consent</span><span style="color:#166534; font-weight:700;">Active Consent</span></div>
          <div class="receipt-line receipt-total"><span>Fee Amount</span><span>${p.fee === 0 ? 'Waived / Exempt' : '₹' + p.fee + ' (' + p.feeMode + ')'}</span></div>
          ${p.txnRef ? `<div class="receipt-line"><span>Txn Reference</span><span class="mono" style="font-weight:700;">${p.txnRef}</span></div>` : ''}
        </div>

        <div style="font-size: 13px; font-weight: 800; color: var(--text-secondary); text-transform: uppercase; margin-top: 24px;">
          Select Visit Pathway
        </div>
        <div class="route-box">
          <div class="route-card-btn" onclick="window._regRouteOPDQueue()">
            <span class="route-icon">📋</span>
            <span>Book OPD Appointment</span>
          </div>
          <div class="route-card-btn" onclick="window._regRouteIPDAdmission()">
            <span class="route-icon">🏥</span>
            <span>Book IPD Admission</span>
          </div>
          <div class="route-card-btn" onclick="window._regRouteProcedureAppointment()">
            <span class="route-icon">🎫</span>
            <span>Book Daycare Procedure</span>
          </div>
        </div>
      </div>
    `;
  }

  /* ── EXISTING PATIENT ROUTING FORM ────────────────────────── */
  function renderExistingPatientVisitForm() {
    var p = _matchedPatient;
    var docs = window.state.doctors || [];

    return `
      <div style="background: linear-gradient(135deg, #eff6ff 0%, #f0fdf4 100%); border: 1.5px solid #bfdbfe; border-radius: 12px; padding: 16px 20px; display: flex; align-items: center; justify-content: space-between; gap: 16px; margin-bottom: 24px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); text-align: left;">
        <div style="display: flex; align-items: center; gap: 16px;">
          <div style="width: 48px; height: 48px; border-radius: 50%; background: #1b3a5c; color: white; display: flex; align-items: center; justify-content: center; font-size: 20px; font-weight: 800; box-shadow: 0 4px 10px rgba(27,58,92,0.2);">
            ${p.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
              <span style="font-size: 16px; font-weight: 800; color: #1b3a5c;">${p.name}</span>
              <span style="background: #1b3a5c; color: white; font-family: 'Outfit', monospace; font-size: 11px; font-weight: 800; padding: 3px 8px; border-radius: 6px; letter-spacing: 0.5px;">
                ${p.uhid}
              </span>
            </div>
            <div style="font-size: 12px; color: #475569; font-weight: 600; margin-top: 4px; display: flex; align-items: center; gap: 12px; flex-wrap: wrap;">
              <span>📱 ${p.mobile}</span>
              <span style="color: #cbd5e1;">|</span>
              <span>👤 ${p.gender || 'Not Specified'}</span>
              ${p.age ? `
                <span style="color: #cbd5e1;">|</span>
                <span>🎂 ${p.age} Years</span>
              ` : ''}
            </div>
          </div>
        </div>
        <div>
          <button class="btn-secondary" style="padding: 8px 16px; font-size: 12px; font-weight: 700; border-radius: 8px; height: auto;" onclick="window._regGoBackToCheck()">
            ← Change Patient
          </button>
        </div>
      </div>

      <!-- Patient Search & Selection Widget -->
      ${!_isNewRegistrationFlow ? `
      <div style="background: #ffffff; border: 1.5px solid var(--border-color); border-radius: 8px; padding: 12px 16px; margin-bottom: 20px; display: flex; flex-direction: column; gap: 8px; text-align: left;">
        <div style="font-size: 11px; font-weight: 700; color: #475569; text-transform: uppercase;">🔍 Quick Registry Search (Search & Select Patient)</div>
        <div style="display: flex; gap: 10px; position: relative; width: 100%; max-width: 500px;">
          <input type="text" id="intake-pat-search" placeholder="Search by Mobile Number or UHID..." style="flex: 1; padding: 6px 12px; font-size: 12px; border: 1.5px solid #cbd5e1; border-radius: 6px; width: 100%; box-sizing: border-box;" oninput="window._regUpdateIntakeSearch(this.value)">
          <button type="button" class="btn btn-secondary" style="padding: 6px 16px; font-size: 12px; height: auto;" onclick="window._regSearchIntakePatient()">Search</button>
          
          <div id="intake-search-dropdown" class="pr-search-dropdown" style="display:none; position:absolute; top:35px; left:0; right:0; z-index:100; max-height:220px; overflow-y:auto; background:white; border:1px solid #cbd5e1; box-shadow:0 10px 15px -3px rgba(0,0,0,0.1); border-radius:6px;"></div>
        </div>
      </div>
      ` : ''}

      <div class="reg-section-title">Select Visit Pathway</div>
      <div class="reg-grid">
        <div class="reg-field">
          <div class="reg-label">Select Intake Route <span>*</span></div>
          <select class="reg-select" id="ext-visit-type" onchange="window._regUpdateExtVisit(this.value)">
            <option value="OPD" ${_visitType === 'OPD' ? 'selected' : ''}>OPD Appointment Booking</option>
            <option value="Procedure" ${_visitType === 'Procedure' ? 'selected' : ''}>Procedure Appointment Booking</option>
            <option value="IPD" ${_visitType === 'IPD' ? 'selected' : ''}>IPD Admission Request (Billing Queue)</option>
          </select>
        </div>
        <div class="reg-field">
          <div class="reg-label">Payer Category <span>*</span></div>
          <select class="reg-select" id="ext-payer" onchange="window._regUpdateExtPayer(this.value)">
            <option value="Self Pay" ${_payer === 'Self Pay' ? 'selected' : ''}>Self Pay</option>
            <option value="Insurance / TPA" ${_payer === 'Insurance / TPA' ? 'selected' : ''}>Insurance / TPA</option>
            <option value="CGHS" ${_payer === 'CGHS' ? 'selected' : ''}>CGHS</option>
            <option value="ECHS" ${_payer === 'ECHS' ? 'selected' : ''}>ECHS</option>
            <option value="PMJAY" ${_payer === 'PMJAY' ? 'selected' : ''}>PMJAY (Ayushman)</option>
            <option value="ESI" ${_payer === 'ESI' ? 'selected' : ''}>ESI</option>
          </select>
        </div>
      </div>

      ${_visitType === 'OPD' ? renderOPDFormFields() : (_visitType === 'Procedure' ? renderProcedureFormFields() : renderIPDFormFields())}

      <div class="btn-row">
        <button class="btn-secondary" onclick="window._regGoBackToCheck()">Cancel</button>
        <button class="btn-primary" onclick="window._regSaveExistingRoute()">Confirm & Issue Token</button>
      </div>
    `;
  }

  window._regUpdateExtProcedureName = function(val) {
    window._selectedProcedureName = val;
  };

  function renderProcedureFormFields() {
    var docs = window.state.doctors || [];
    return `
      <div class="reg-section-title">Daycare Advice & Procedure Details</div>
      <div class="reg-grid" style="grid-template-columns: repeat(3, 1fr); gap: 16px;">
        <div class="reg-field">
          <div class="reg-label">Select Consultant / Specialist <span>*</span></div>
          <select class="reg-select" id="ext-doctor" onchange="window._regUpdateExtDoc(this.value)">
            <option value="">-- Choose Specialist --</option>
            ${docs.map(function(d) {
              return `<option value="${d.id}" ${d.id === _selectedDoctor ? 'selected' : ''}>${d.name} (${d.spec})</option>`;
            }).join('')}
          </select>
        </div>
        <div class="reg-field">
          <div class="reg-label">Or External Referring Doctor Name & Reg No</div>
          <input type="text" class="reg-input" id="ext-ref-doc-name" placeholder="Dr. Name (External)" value="${_ipdRequestState.refDocName}" oninput="window._regUpdateExtRefDoc(this.value)">
        </div>
        <div class="reg-field">
          <div class="reg-label">External Doctor Registration Number</div>
          <input type="text" class="reg-input" id="ext-ref-doc-reg" placeholder="e.g. MCI-12345" value="${_ipdRequestState.refDocReg}" oninput="window._regUpdateExtRefReg(this.value)">
        </div>
      </div>
      
      <div class="reg-grid" style="grid-template-columns: repeat(3, 1fr); gap: 16px;">
        <div class="reg-field" style="grid-column: span 2; position: relative;">
          <div class="reg-label">Provisional Diagnosis / Reason for Daycare (ICD-10 Suggestive Search) <span>*</span></div>
          <input type="text" class="reg-input" id="ext-reason" placeholder="Type to search ICD-10 or enter diagnosis..." value="${_ipdRequestState.reason}" oninput="window._regUpdateIPDReasonSearch(this.value)" autocomplete="off">
          <div id="icd10-dropdown" class="pr-search-dropdown" style="display:none; position:absolute; top:58px; left:0; right:0; z-index:100; max-height:180px; overflow-y:auto; background:white; border:1.5px solid #cbd5e1; box-shadow:0 10px 15px -3px rgba(0,0,0,0.1); border-radius:6px;"></div>
        </div>
        <div class="reg-field">
          <div class="reg-label">Target Daycare Procedure <span>*</span></div>
          <select class="reg-select" id="ext-procedure-name" onchange="window._regUpdateExtProcedureName(this.value)">
            <option value="Cataract Surgery" ${window._selectedProcedureName === 'Cataract Surgery' ? 'selected' : ''}>Cataract Surgery (Expected: 3h)</option>
            <option value="Chemotherapy Infusion" ${window._selectedProcedureName === 'Chemotherapy Infusion' ? 'selected' : ''}>Chemotherapy Infusion (Expected: 4h)</option>
            <option value="Biopsy Sample Collection" ${window._selectedProcedureName === 'Biopsy Sample Collection' ? 'selected' : ''}>Biopsy Sample Collection (Expected: 2h)</option>
            <option value="Endoscopy Scope Evaluation" ${window._selectedProcedureName === 'Endoscopy Scope Evaluation' ? 'selected' : ''}>Endoscopy Scope Evaluation (Expected: 2h)</option>
            <option value="Dialysis Treatment" ${window._selectedProcedureName === 'Dialysis Treatment' ? 'selected' : ''}>Dialysis Treatment (Expected: 5h)</option>
            <option value="Laparoscopic Cholecystectomy" ${window._selectedProcedureName === 'Laparoscopic Cholecystectomy' ? 'selected' : ''}>Laparoscopic Cholecystectomy (Expected: 10h)</option>
          </select>
        </div>
      </div>
      
      <div class="reg-grid" style="grid-template-columns: repeat(3, 1fr); gap: 15px; margin-bottom: 20px;">
        <div class="reg-field">
          <div class="reg-label">Attendant Name <span>*</span></div>
          <input type="text" class="reg-input" id="ext-attendant-name" placeholder="Attendant Name" value="${_ipdRequestState.attendantName}" oninput="window._regUpdateIPDAttendantName(this.value)">
        </div>
        <div class="reg-field">
          <div class="reg-label">Attendant Contact Mobile <span>*</span></div>
          <input type="tel" class="reg-input" id="ext-attendant-phone" placeholder="Attendant Phone" maxlength="10" value="${_ipdRequestState.attendantPhone}" oninput="window._regUpdateIPDAttendantPhone(this.value)">
        </div>
        <div class="reg-field">
          <div class="reg-label">Upload Doctor Prescription (PDF/Image)</div>
          <div style="display: flex; align-items: center; gap: 8px;">
            <input type="file" id="ext-prescription-file" style="display: none;" onchange="window._regHandlePrescriptionUpload(this)">
            <button type="button" class="btn btn-secondary" onclick="document.getElementById('ext-prescription-file').click()" style="padding: 8px 12px; font-size: 12px; display: flex; align-items: center; gap: 6px; background: white; border: 1.5px solid #cbd5e1; border-radius: 6px; font-weight: 700; height: 38px; cursor: pointer; width: 100%; justify-content: center; box-sizing: border-box;">
              <span>📁</span> Choose File
            </button>
            <span id="prescription-filename" style="font-size: 12px; color: ${_ipdRequestState.prescriptionFileName ? '#15803d' : '#64748b'}; font-weight: ${_ipdRequestState.prescriptionFileName ? 'bold' : '600'}; max-width: 150px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
              ${_ipdRequestState.prescriptionFileName || 'No file chosen'}
            </span>
          </div>
        </div>
      </div>
      
      ${_selectedDoctor ? `
      <div style="margin-top: 12px; text-align:left;">
        <div class="reg-label" style="font-size:12px; font-weight:700; margin-bottom:4px;">Scheduled Date & Time Slot (Doctor's Live Availability) <span style="color:#ef4444;">*</span></div>
        ${renderPillSelector()}
      </div>
      ` : ''}
    `;
  }

  function renderOPDFormFields() {
    var docs = window.state.doctors || [];
    return `
      <div class="reg-section-title">OPD Consultant & Fee Collection</div>
      <div class="reg-grid">
        <div class="reg-field">
          <div class="reg-label">Select Consultant <span>*</span></div>
          <select class="reg-select" id="ext-doctor" onchange="window._regUpdateExtDoc(this.value)">
            <option value="">-- Choose Doctor --</option>
            ${docs.map(function(d) {
              return `<option value="${d.id}" ${d.id === _selectedDoctor ? 'selected' : ''}>${d.name} (${d.spec})</option>`;
            }).join('')}
          </select>
        </div>
        <div class="reg-field">
          <div class="reg-label">Clinic Specialty</div>
          <input type="text" class="reg-input" id="ext-dept" readonly placeholder="Specialty" value="${_selectedDept}">
        </div>
        <div class="reg-field">
          <div class="reg-label">Consultation Fee</div>
          <input type="text" class="reg-input" readonly value="₹300">
        </div>
      </div>
      ${_selectedDoctor ? `
      <div style="margin-top: 15px; text-align:left;">
        <div class="reg-label" style="font-size:12px; font-weight:700; margin-bottom:4px;">Preferred Date & Time Slot (Doctor's Live Availability) <span style="color:#ef4444;">*</span></div>
        ${renderPillSelector()}
      </div>
      ` : ''}
      <div class="reg-grid" style="grid-template-columns: 1fr 1fr; gap: 15px; margin-top: 15px;">
        <div class="reg-field">
          <div class="reg-label">Referred By (Optional)</div>
          <input type="text" class="reg-input" id="ext-referred-by" placeholder="Referred Doctor Name" value="${_referredBy}" oninput="window._regUpdateReferredBy(this.value)">
        </div>
        <div class="reg-field">
          <div class="reg-label">Chief Complaint <span>*</span></div>
          <input type="text" class="reg-input" id="ext-chief-complaint" placeholder="e.g. Fever, Cough, Body ache" value="${window._chiefComplaint || ''}" oninput="window._regUpdateChiefComplaint(this.value)">
        </div>
      </div>
    `;
  }

  window._regUpdateChiefComplaint = function(val) {
    window._chiefComplaint = val;
  };

  function renderIPDFormFields() {
    var docs = window.state.doctors || [];
    return `
      <div class="reg-section-title">IPD Admission Advice Details</div>
      <div class="reg-grid" style="grid-template-columns: repeat(3, 1fr); gap: 16px;">
        <div class="reg-field">
          <div class="reg-label">Admitting/Treating Consultant <span>*</span></div>
          <select class="reg-select" id="ext-doctor" onchange="window._regUpdateExtDoc(this.value)">
            <option value="">-- Select Internal Doctor --</option>
            ${docs.map(function(d) {
              return `<option value="${d.id}" ${d.id === _selectedDoctor ? 'selected' : ''}>${d.name} (${d.spec})</option>`;
            }).join('')}
          </select>
        </div>
        <div class="reg-field">
          <div class="reg-label">Or External Referring Doctor Name & Reg No</div>
          <input type="text" class="reg-input" id="ext-ref-doc-name" placeholder="Dr. Name (External)" oninput="window._regUpdateExtRefDoc(this.value)">
        </div>
        <div class="reg-field">
          <div class="reg-label">External Doctor Registration Number</div>
          <input type="text" class="reg-input" id="ext-ref-doc-reg" placeholder="e.g. MCI-12345" oninput="window._regUpdateExtRefReg(this.value)">
        </div>
      </div>
      <div class="reg-grid" style="grid-template-columns: repeat(3, 1fr); gap: 16px;">
        <div class="reg-field" style="grid-column: span 2; position: relative;">
          <div class="reg-label">Provisional Diagnosis / Reason for Admission (ICD-10 Suggestive Search) <span>*</span></div>
          <input type="text" class="reg-input" id="ext-reason" placeholder="Type to search ICD-10 or enter diagnosis..." value="${_ipdRequestState.reason}" oninput="window._regUpdateIPDReasonSearch(this.value)" autocomplete="off">
          
          <div id="icd10-dropdown" class="pr-search-dropdown" style="display:none; position:absolute; top:58px; left:0; right:0; z-index:100; max-height:180px; overflow-y:auto; background:white; border:1.5px solid #cbd5e1; box-shadow:0 10px 15px -3px rgba(0,0,0,0.1); border-radius:6px;">
          </div>
        </div>
        <div class="reg-field">
          <div class="reg-label">Requested Ward Room Category <span>*</span></div>
          <select class="reg-select" id="ext-ward" onchange="window._regUpdateIPDWard(this.value)">
            <option value="GENERAL-WARD-M">General Ward (Male)</option>
            <option value="GENERAL-WARD-F">General Ward (Female)</option>
            <option value="SEMI-PRIVATE">Semi-Private Ward</option>
            <option value="PRIVATE">Private Room</option>
            <option value="DELUXE">Deluxe Suite</option>
            <option value="CCU">CCU (Critical Care)</option>
          </select>
        </div>
      </div>
      <div class="reg-grid" style="grid-template-columns: repeat(3, 1fr); gap: 15px; margin-bottom: 20px;">
        <div class="reg-field">
          <div class="reg-label">Attendant Name <span>*</span></div>
          <input type="text" class="reg-input" id="ext-attendant-name" placeholder="Attendant Name" value="${_ipdRequestState.attendantName}" oninput="window._regUpdateIPDAttendantName(this.value)">
        </div>
        <div class="reg-field">
          <div class="reg-label">Attendant Contact Mobile <span>*</span></div>
          <input type="tel" class="reg-input" id="ext-attendant-phone" placeholder="Attendant Phone" maxlength="10" value="${_ipdRequestState.attendantPhone}" oninput="window._regUpdateIPDAttendantPhone(this.value)">
        </div>
        <div class="reg-field">
          <div class="reg-label">Upload Doctor Prescription (PDF/Image)</div>
          <div style="display: flex; align-items: center; gap: 8px;">
            <input type="file" id="ext-prescription-file" style="display: none;" onchange="window._regHandlePrescriptionUpload(this)">
            <button type="button" class="btn btn-secondary" onclick="document.getElementById('ext-prescription-file').click()" style="padding: 8px 12px; font-size: 12px; display: flex; align-items: center; gap: 6px; background: white; border: 1.5px solid #cbd5e1; border-radius: 6px; font-weight: 700; height: 38px; cursor: pointer; width: 100%; justify-content: center; box-sizing: border-box;">
              <span>📁</span> Choose File
            </button>
            <span id="prescription-filename" style="font-size: 12px; color: ${_ipdRequestState.prescriptionFileName ? '#15803d' : '#64748b'}; font-weight: ${_ipdRequestState.prescriptionFileName ? 'bold' : '600'}; max-width: 150px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
              ${_ipdRequestState.prescriptionFileName || 'No file chosen'}
            </span>
          </div>
        </div>
      </div>
    `;
  }

  // Bind forms variables
  var _ipdRequestState = {
    refDocName: '',
    refDocReg: '',
    reason: '',
    ward: 'GENERAL-WARD-M',
    attendantName: '',
    attendantPhone: '',
    prescriptionFileName: ''
  };

  window._regUpdateExtRefDoc = function(val) { _ipdRequestState.refDocName = val; };
  window._regUpdateExtRefReg = function(val) { _ipdRequestState.refDocReg = val; };
  window._regUpdateIPDReason = function(val) { _ipdRequestState.reason = val; };
  window._regUpdateIPDWard = function(val) { _ipdRequestState.ward = val; };
  window._regUpdateIPDAttendantName = function(val) { _ipdRequestState.attendantName = val; };
  window._regUpdateIPDAttendantPhone = function(val) { _ipdRequestState.attendantPhone = val; };

  window._regHandlePrescriptionUpload = function(input) {
    if (input.files && input.files[0]) {
      var fileName = input.files[0].name;
      _ipdRequestState.prescriptionFileName = fileName;
      var span = document.getElementById('prescription-filename');
      if (span) {
        span.textContent = fileName;
        span.style.color = '#15803d';
        span.style.fontWeight = 'bold';
      }
    }
  };

  window._regUpdateIPDReasonSearch = function(val) {
    _ipdRequestState.reason = val; // Sync state
    
    var dropdown = document.getElementById('icd10-dropdown');
    if (!dropdown) return;
    
    if (!val || val.trim().length < 2) {
      dropdown.style.display = 'none';
      return;
    }
    
    var cleanQ = val.trim().toLowerCase();
    var matches = _icd10Db.filter(function(item) {
      return item.code.toLowerCase().includes(cleanQ) || item.desc.toLowerCase().includes(cleanQ);
    });
    
    if (matches.length === 0) {
      dropdown.style.display = 'none';
      return;
    }
    
    dropdown.innerHTML = matches.map(function(item) {
      return `
        <div class="icd10-item" onclick="window._regSelectIcd10('${item.code}', '${item.desc.replace(/'/g, "\\'")}')" style="padding:8px 12px; cursor:pointer; font-size:12px; border-bottom:1px solid #f1f5f9; text-align:left; transition:background 0.15s;">
          <strong style="color:#1b3a5c;">${item.code}</strong> — <span style="color:#475569;">${item.desc}</span>
        </div>
      `;
    }).join('');
    dropdown.style.display = 'block';
  };

  window._regSelectIcd10 = function(code, desc) {
    var val = code + ' - ' + desc;
    _ipdRequestState.reason = val;
    var input = document.getElementById('ext-reason');
    if (input) {
      input.value = val;
    }
    var dropdown = document.getElementById('icd10-dropdown');
    if (dropdown) {
      dropdown.style.display = 'none';
    }
  };

  document.addEventListener('click', function(e) {
    var dropdown = document.getElementById('icd10-dropdown');
    if (dropdown && e.target.id !== 'ext-reason') {
      dropdown.style.display = 'none';
    }
  });

  window._regUpdateExtVisit = function(val) {
    _visitType = val;
    var c = document.getElementById('main-content');
    if (c) renderCurrentState(c);
  };

  window._regUpdateExtPayer = function(val) {
    _payer = val;
  };

  window._regUpdateExtDoc = function(docId) {
    _selectedDoctor = docId;
    var doc = (window.state.doctors || []).find(d => d.id === docId);
    _selectedDept = doc ? doc.spec : '';
    
    var deptInp = document.getElementById('ext-dept');
    if (deptInp) deptInp.value = _selectedDept;
    
    var c = document.getElementById('main-content');
    if (c) renderCurrentState(c);
  };

  window._regSelectDatePill = function(dateIso) {
    _selectedDatePill = dateIso;
    updateSlotValue();
    var c = document.getElementById('main-content');
    if (c) renderCurrentState(c);
  };

  window._regSelectTimePill = function(timeStr) {
    _selectedTimePill = timeStr;
    updateSlotValue();
    var c = document.getElementById('main-content');
    if (c) renderCurrentState(c);
  };

  function updateSlotValue() {
    if (_selectedDatePill && _selectedTimePill) {
      _preferredSlot = _selectedDatePill + 'T' + convertTimeTo24h(_selectedTimePill);
    } else {
      _preferredSlot = '';
    }
  }

  function convertTimeTo24h(timeStr) {
    const parts = timeStr.split(' ');
    const hm = parts[0].split(':');
    let h = parseInt(hm[0]);
    const m = hm[1];
    const ampm = parts[1];

    if (ampm === 'PM' && h < 12) {
      h += 12;
    } else if (ampm === 'AM' && h === 12) {
      h = 0;
    }
    const hStr = h.toString().padStart(2, '0');
    return `${hStr}:${m}`;
  }

  function renderPillSelector() {
    const dates = [];
    const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    for (let i = 0; i < 5; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      dates.push({
        isoString: d.toISOString().split('T')[0],
        pretty: `${weekdays[d.getDay()]}, ${d.getDate()} ${months[d.getMonth()]}`
      });
    }

    if (!_selectedDatePill && dates.length > 0) {
      _selectedDatePill = dates[0].isoString;
    }

    const timeSlots = ['08:00 AM', '08:30 AM', '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM', '12:00 PM', '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM', '05:00 PM'];

    return `
      <div style="background:#f8fafc; border:1.5px solid #cbd5e1; border-radius:8px; padding:12px; margin-top:6px; text-align:left;">
        <div style="font-size:11px; font-weight:700; color:#475569; text-transform:uppercase; margin-bottom:8px;">1. Select Date</div>
        <div style="display:flex; gap:8px; overflow-x:auto; padding-bottom:6px; margin-bottom:12px; scrollbar-width:thin;">
          ${dates.map(d => {
            const isSel = _selectedDatePill === d.isoString;
            const bg = isSel ? 'var(--primary, #1b3a5c)' : '#ffffff';
            const color = isSel ? '#ffffff' : '#334155';
            const border = isSel ? '1.5px solid var(--primary, #1b3a5c)' : '1.5px solid #cbd5e1';
            const fw = isSel ? '800' : '500';
            return `
              <button type="button" onclick="window._regSelectDatePill('${d.isoString}')" style="background:${bg}; color:${color}; border:${border}; font-weight:${fw}; padding:6px 12px; border-radius:30px; font-size:11px; cursor:pointer; white-space:nowrap; transition:all 0.15s ease-in-out;">
                ${d.pretty}
              </button>
            `;
          }).join('')}
        </div>

        <div style="font-size:11px; font-weight:700; color:#475569; text-transform:uppercase; margin-bottom:8px;">2. Select Available Slot</div>
        <div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(75px, 1fr)); gap:6px;">
          ${timeSlots.map(t => {
            const isSel = _selectedTimePill === t;
            const bg = isSel ? '#10b981' : '#ffffff';
            const color = isSel ? '#ffffff' : '#047857';
            const border = isSel ? '1.5px solid #10b981' : '1.5px solid #a7f3d0';
            const fw = isSel ? '800' : '600';
            return `
              <button type="button" onclick="window._regSelectTimePill('${t}')" style="background:${bg}; color:${color}; border:${border}; font-weight:${fw}; padding:6px 4px; border-radius:8px; font-size:11px; cursor:pointer; text-align:center; transition:all 0.15s ease-in-out;">
                ${t}
              </button>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }

  window._regUpdateSlot = function(val) { _preferredSlot = val; };
  window._regUpdateReferredBy = function(val) { _referredBy = val; };

  /* ── VISIT ROUTING SAVE ─────────────────────────────────────── */
  window._regSaveExistingRoute = function() {
    var p = _matchedPatient || _lastReg;
    if (!p) {
      alert('No patient context selected.');
      return;
    }

    if (_visitType === 'OPD') {
      if (!_selectedDoctor) { alert('Please select a Consultant Doctor for this OPD visit.'); return; }
      if (!_preferredSlot) { alert('Please select a Preferred Slot.'); return; }
      if (!window._chiefComplaint || !window._chiefComplaint.trim()) { alert('Please enter Chief Complaint.'); return; }
      
      var doc = (window.state.doctors || []).find(d => d.id === _selectedDoctor);
      var fee = 300; // Standard OPD charge
      
      window.state.appointments = window.state.appointments || [];
      var newApt = {
        appointmentId: `APT${6000 + window.state.appointments.length}`,
        uhid: p.uhid,
        patientName: p.name,
        doctorName: doc.name,
        deptName: doc.spec,
        dateTime: _preferredSlot,
        visitType: 'OPD Regular',
        referredBy: _referredBy || null,
        chiefComplaint: window._chiefComplaint.trim(),
        consultationFeeStatus: 'Paid',
        tokenNumber: `TKN-${100 + window.state.appointments.length}`,
        mobile: p.mobile
      };
      
      window.state.appointments.push(newApt);
      localStorage.setItem('saronil_appointments', JSON.stringify(window.state.appointments));
      
      // Save billing line
      window.state.billing = window.state.billing || [];
      window.state.billing.push({
        id: 'OPD-INV-' + String(2000 + window.state.billing.length),
        uhid: p.uhid,
        patientName: p.name,
        amount: fee,
        paid: fee,
        status: 'Paid',
        date: getTodayDateStr(),
        items: [
          { desc: 'OPD Consultation Fee (' + doc.name + ')', qty: 1, rate: fee, total: fee }
        ]
      });

      // Audit Log
      window.state.auditLogs = window.state.auditLogs || [];
      window.state.auditLogs.push({
        timestamp: new Date().toISOString(),
        action: 'OPD_APPOINTMENT_BOOKING',
        user: 'Front Desk Exec',
        details: 'Booked OPD appointment for ' + p.name + ' (' + p.uhid + ') with ' + doc.name + '. Consultation fee ₹' + fee + ' paid.'
      });

      alert(`OPD Visit Token Queued!\n\nPatient: ${p.name}\nDoctor: ${doc.name}\nToken: ${newApt.tokenNumber}\nReceipt Generated: OPD-INV-${2000 + window.state.billing.length - 1}`);
      
      // Print notification mock log
      console.log(`[SMS/WhatsApp Notification Sent] To: ${p.mobile} | Msg: Your OPD visit with ${doc.name} at Saronil Health is confirmed for ${_preferredSlot}. Token: ${newApt.tokenNumber}`);

      // Log to patient engagement timeline
      if (window.logPatientTimeline) {
        window.logPatientTimeline(p.uhid, {
          type: 'appointment',
          icon: '📅',
          title: 'OPD Visit Scheduled',
          desc: 'OPD consultation booked with ' + doc.name + ' (' + doc.spec + ') for ' + _preferredSlot + '. Token: ' + newApt.tokenNumber + '. Consultation fee ₹' + fee + ' paid.'
        });
      }
      
      window._regRouteToLog();
    } else if (_visitType === 'Procedure') {
      var doctorId = _selectedDoctor;
      var docName = '';
      var docReg = '';
      var docType = 'internal';

      if (doctorId) {
        var doc = (window.state.doctors || []).find(d => d.id === doctorId);
        docName = doc.name;
        docReg = doc.regNo || 'KMC-00000';
      } else {
        docName = _ipdRequestState.refDocName.trim();
        docReg = _ipdRequestState.refDocReg.trim();
        docType = 'external';
      }

      if (!docName) {
        alert('Please assign an Admitting Doctor (Internal selection or External Doctor Name is mandatory).');
        return;
      }
      if (!docReg) {
        alert('Admitting doctor registration number is mandatory.');
        return;
      }
      if (!_ipdRequestState.reason.trim()) {
        alert('Provisional Diagnosis is mandatory.');
        return;
      }
      if (!_ipdRequestState.attendantName.trim()) {
        alert('Attendant Name is mandatory.');
        return;
      }
      if (!_ipdRequestState.attendantPhone.trim() || _ipdRequestState.attendantPhone.length !== 10) {
        alert('Valid 10-digit Attendant Contact is mandatory.');
        return;
      }
      if (!_preferredSlot) {
        alert('Please select a Scheduled Slot.');
        return;
      }
      
      var procedureName = window._selectedProcedureName || 'Cataract Surgery';
      var fee = 500; // Standard Procedure Consultation/Access Fee
      
      window.state.appointments = window.state.appointments || [];
      var newApt = {
        appointmentId: `APT${6000 + window.state.appointments.length}`,
        uhid: p.uhid,
        patientName: p.name,
        doctorName: docName,
        doctorReg: docReg,
        doctorType: docType,
        deptName: doctorId ? doc.spec : 'External Daycare',
        dateTime: _preferredSlot,
        visitType: 'Procedure Appointment',
        procedureName: procedureName,
        referredBy: _referredBy || null,
        diagnosis: _ipdRequestState.reason.trim(),
        attendantName: _ipdRequestState.attendantName.trim(),
        attendantContact: _ipdRequestState.attendantPhone.trim(),
        prescriptionFile: _ipdRequestState.prescriptionFileName || null,
        consultationFeeStatus: 'Paid',
        tokenNumber: `TKN-${100 + window.state.appointments.length}`,
        mobile: p.mobile
      };
      
      window.state.appointments.push(newApt);
      localStorage.setItem('saronil_appointments', JSON.stringify(window.state.appointments));
      
      // Save billing line
      window.state.billing = window.state.billing || [];
      window.state.billing.push({
        id: 'PRO-INV-' + String(2000 + window.state.billing.length),
        uhid: p.uhid,
        patientName: p.name,
        amount: fee,
        paid: fee,
        status: 'Paid',
        date: getTodayDateStr(),
        items: [
          { desc: 'Procedure Access Fee (' + procedureName + ' - ' + docName + ')', qty: 1, rate: fee, total: fee }
        ]
      });

      // Audit Log
      window.state.auditLogs = window.state.auditLogs || [];
      window.state.auditLogs.push({
        timestamp: new Date().toISOString(),
        action: 'PROCEDURE_APPOINTMENT_BOOKING',
        user: 'Front Desk Exec',
        details: 'Booked Daycare Procedure (' + procedureName + ') for ' + p.name + ' (' + p.uhid + ') treating doctor: ' + docName + (_ipdRequestState.prescriptionFileName ? ' [Prescription: ' + _ipdRequestState.prescriptionFileName + ']' : '')
      });

      alert(`Procedure Appointment Booked!\n\nPatient: ${p.name}\nProcedure: ${procedureName}\nDoctor: ${docName}\nToken: ${newApt.tokenNumber}\nReceipt Generated: PRO-INV-${2000 + window.state.billing.length - 1}`);
      
      console.log(`[SMS/WhatsApp Notification Sent] To: ${p.mobile} | Msg: Your Daycare Procedure (${procedureName}) with ${docName} at Saronil Health is confirmed for ${_preferredSlot}. Token: ${newApt.tokenNumber}`);

      // Log to patient engagement timeline
      if (window.logPatientTimeline) {
        window.logPatientTimeline(p.uhid, {
          type: 'appointment',
          icon: '🏥',
          title: 'Procedure Appointment Scheduled',
          desc: procedureName + ' booked with ' + docName + ' for ' + _preferredSlot + '. Token: ' + newApt.tokenNumber + '. Access fee ₹' + fee + ' paid.'
        });
      }
      
      window._regRouteToLog();
    } else {
      // IPD Admission Request Booking
      var doctorId = _selectedDoctor;
      var docName = '';
      var docReg = '';
      var docType = 'internal';

      if (doctorId) {
        var doc = (window.state.doctors || []).find(d => d.id === doctorId);
        docName = doc.name;
        docReg = doc.regNo || 'KMC-00000';
      } else {
        docName = _ipdRequestState.refDocName.trim();
        docReg = _ipdRequestState.refDocReg.trim();
        docType = 'external';
      }

      if (!docName) {
        alert('Please assign an Admitting Doctor (Internal selection or External Doctor Name is mandatory).');
        return;
      }
      if (!docReg) {
        alert('Admitting doctor registration number is mandatory.');
        return;
      }
      if (!_ipdRequestState.reason.trim()) {
        alert('Provisional Diagnosis is mandatory.');
        return;
      }
      if (!_ipdRequestState.attendantName.trim()) {
        alert('Attendant Name is mandatory.');
        return;
      }
      if (!_ipdRequestState.attendantPhone.trim() || _ipdRequestState.attendantPhone.length !== 10) {
        alert('Valid 10-digit Attendant Contact is mandatory.');
        return;
      }

      window.state.admissionRequests = window.state.admissionRequests || [];
      var newReq = {
        id: `REQ-${100 + window.state.admissionRequests.length}`,
        uhid: p.uhid,
        name: p.name,
        mobile: p.mobile,
        source: docType === 'internal' ? 'OPD referral' : 'External referral',
        refDoc: docName,
        refDocReg: docReg,
        refDocType: docType,
        diagnosis: _ipdRequestState.reason.trim(),
        ward: _ipdRequestState.ward,
        attendantName: _ipdRequestState.attendantName.trim(),
        attendantContact: _ipdRequestState.attendantPhone.trim(),
        prescriptionFile: _ipdRequestState.prescriptionFileName || null,
        advancePaid: false,
        status: 'Requested', // Requested -> Deposit Pending -> Confirmed -> Bed Allocated
        waitingHrs: 0,
        branch: _branches[_selectedBranch].name,
        depositAmount: null,
        depositReceiptId: null,
        emergencyOverride: null,
        requestedAt: new Date().toISOString()
      };

      window.state.admissionRequests.push(newReq);
      localStorage.setItem('saronil_admissionRequests', JSON.stringify(window.state.admissionRequests));

      // Send IPD Advance Deposit to Billing
      window.state.billing = window.state.billing || [];
      window.state.billing.push({
        id: 'INV-DEP-' + String(3000 + window.state.billing.length),
        uhid: p.uhid,
        patientName: p.name,
        amount: 10000,
        paid: 0,
        status: 'Pending',
        visitType: 'IPD',
        date: new Date().toISOString().slice(0, 10),
        items: [
          { desc: 'IPD Admission Advance Deposit', qty: 1, rate: 10000, total: 10000 }
        ]
      });
      localStorage.setItem('saronil_billing', JSON.stringify(window.state.billing));


      // Audit Log
      window.state.auditLogs = window.state.auditLogs || [];
      window.state.auditLogs.push({
        timestamp: new Date().toISOString(),
        action: 'IPD_ADMISSION_REQUEST',
        user: 'Front Desk Exec',
        details: 'Logged IPD Admission Request ' + newReq.admissionId + ' for patient ' + p.name + ' (' + p.uhid + ') treating doctor: ' + docName
      });

      alert(`IPD Admission Slip Generated!\n\nPatient: ${p.name}\nRequest ID: ${newReq.admissionId}\nStatus: Deposit Pending\n\nRouting attendant to the Billing Counter for Advance Deposit verification.`);
      window._regRouteToLog();
    }
  };

  /* ── SUCCESS ROUTING BUTTONS ────────────────────────────────── */
  window._regRouteOPDQueue = function() {
    const pat = _matchedPatient || _lastReg || {};
    if (pat.uhid) {
      router.navigate('bookAppointment?uhid=' + pat.uhid);
    } else {
      router.navigate('bookAppointment');
    }
  };

  window._regRouteIPDAdmission = function() {
    _visitType = 'IPD';
    if (!_matchedPatient && _lastReg) {
      _matchedPatient = window.state.patients.find(p => p.uhid === _lastReg.uhid) || _lastReg;
    }
    _view = 'existingVisit';
    var c = document.getElementById('main-content');
    if (c) renderCurrentState(c);
  };

  window._regRouteProcedureAppointment = function() {
    const pat = _matchedPatient || _lastReg || {};
    if (pat.uhid) {
      router.navigate('bookAppointment?uhid=' + pat.uhid);
    } else {
      router.navigate('bookAppointment');
    }
  };

  window._regRouteToLog = function() {
    _view = 'dupCheck';
    _checkQuery = '';
    _matchedPatient = null;
    _fuzzyMatchedPatient = null;
    _isNewRegistrationFlow = false;
    var c = document.getElementById('main-content');
    if (c) renderCurrentState(c);
  };

  window._regUpdateIntakeSearch = function(val) {
    const dropdown = document.getElementById('intake-search-dropdown');
    if (!dropdown) return;

    const q = val.toLowerCase().trim();
    if (q.length < 2) {
      dropdown.style.display = 'none';
      dropdown.innerHTML = '';
      return;
    }

    const matches = (window.state.patients || []).filter(p => 
      p.name.toLowerCase().includes(q) ||
      p.uhid.toLowerCase().includes(q) ||
      (p.mobile && p.mobile.includes(q))
    ).slice(0, 5);

    if (matches.length > 0) {
      dropdown.style.display = 'block';
      dropdown.innerHTML = matches.map(m => {
        return `
          <div style="padding:8px 12px; cursor:pointer; font-size:12px; border-bottom:1px solid #f1f5f9; text-align:left; background:#ffffff;" onclick="window._regSelectIntakePatient('${m.uhid}')" onmouseover="this.style.background='#f1f5f9'" onmouseout="this.style.background='#ffffff'">
            <div style="display:flex; justify-content:space-between; font-weight:600; color:#1e293b;">
              <span>${m.name}</span>
              <span class="mono" style="color:#0284c7; font-size:11px;">${m.uhid}</span>
            </div>
            <div style="font-size:10px; color:#64748b; margin-top:2px;">📱 ${m.mobile} | ${m.age || '—'} yrs | ${m.gender}</div>
          </div>
        `;
      }).join('');
    } else {
      dropdown.style.display = 'block';
      dropdown.innerHTML = `<div style="padding:12px; text-align:center; color:#64748b; font-size:11px; background:#ffffff;">No patients found</div>`;
    }
  };

  window._regSelectIntakePatient = function(uhid) {
    const patient = (window.state.patients || []).find(p => p.uhid === uhid);
    if (patient) {
      _matchedPatient = patient;
      const dropdown = document.getElementById('intake-search-dropdown');
      if (dropdown) {
        dropdown.style.display = 'none';
        dropdown.innerHTML = '';
      }
      var c = document.getElementById('main-content');
      if (c) renderCurrentState(c);
    }
  };

  window._regSearchIntakePatient = function() {
    const input = document.getElementById('intake-pat-search');
    if (!input) return;
    const val = input.value.trim();
    if (!val) return;
    const patient = (window.state.patients || []).find(p => p.uhid === val || p.mobile === val);
    if (patient) {
      window._regSelectIntakePatient(patient.uhid);
    } else {
      window._regUpdateIntakeSearch(val);
    }
  };

})();
