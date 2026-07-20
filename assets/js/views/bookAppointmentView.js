/* ==========================================================================
   SARONIL HMS - DEDICATED APPOINTMENT BOOKING VIEW (bookAppointmentView.js)
   ========================================================================== */

(function () {
  'use strict';
  window.prShowToast = window.prShowToast || window.showToast || alert;

  // Local state variables for page state
  let _selectedPatient = null;
  let _selectedDoctor = '';
  let _selectedDept = '';
  let _selectedDate = '';
  let _selectedSlot = '';
  let _appointmentType = 'New'; // 'New' | 'Follow-up'
  let _visitType = 'OPD'; // 'OPD' | 'Video Consultation'
  let _priority = 'Normal'; // 'Normal' | 'Urgent'
  let _referredBy = '';
  let _reason = '';
  let _notes = '';
  let _advancePaymentRequired = false;

  // Search query
  let _searchQuery = '';

  // Payment Page State
  let _isPaymentScreen = false;
  let _paymentMethod = 'UPI'; // 'UPI' | 'Card' | 'Netbanking'
  let _paymentProcessing = false;

  // Success Confirmation State
  let _successDetails = null; // Contains appointment and receipt summary
  let _showSuccessPopup = false;

  // Dynamic slot generation for a given doctor & date
  function getDoctorSlots(doctorName, dateStr) {
    const slots = [
      { time: '09:00 AM', status: 'Available' },
      { time: '09:30 AM', status: 'Available' },
      { time: '10:00 AM', status: 'Booked' }, // Seeded booked slot
      { time: '10:30 AM', status: 'Available' },
      { time: '11:00 AM', status: 'Blocked' }, // Seeded blocked slot
      { time: '11:30 AM', status: 'Available' },
      { time: '12:00 PM', status: 'Available' },
      { time: '02:00 PM', status: 'Available' },
      { time: '02:30 PM', status: 'Available' },
      { time: '03:00 PM', status: 'Booked' }, // Seeded booked slot
      { time: '03:30 PM', status: 'Available' },
      { time: '04:00 PM', status: 'Available' },
      { time: '04:30 PM', status: 'Available' },
      { time: '05:00 PM', status: 'Available' }
    ];

    // Introduce variety based on doctor name length
    const hash = (doctorName || '').length + (dateStr || '').charCodeAt(0 || 0);
    slots.forEach((s, idx) => {
      if (s.status === 'Available') {
        if ((idx + hash) % 5 === 0) s.status = 'Booked';
        else if ((idx + hash) % 7 === 0) s.status = 'Blocked';
      }
    });

    return slots;
  }

  // CSS variables match the rest of the application
  function injectStyles() {
    if (document.getElementById('book-appt-styles')) return;
    const style = document.createElement('style');
    style.id = 'book-appt-styles';
    style.textContent = `
      .ba-card {
        background: #ffffff;
        border: 1px solid var(--border-color, #cbd5e1);
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);
        padding: 14px 18px;
        margin-bottom: 0px;
        text-align: left;
        box-sizing: border-box;
      }
      .ba-section-title {
        font-size: 11px;
        font-weight: 800;
        color: #1e293b;
        text-transform: uppercase;
        border-bottom: 1px solid var(--border-color, #e2e8f0);
        padding-bottom: 4px;
        margin-bottom: 10px;
        display: flex;
        align-items: center;
        gap: 6px;
      }
      .ba-input, .ba-select {
        width: 100%;
        padding: 6px 10px;
        font-size: 12px;
        border: 1.5px solid #cbd5e1;
        border-radius: 4px;
        background: #ffffff;
        box-sizing: border-box;
        height: 32px;
      }
      .ba-input:focus, .ba-select:focus {
        border-color: var(--primary, #1b3a5c);
        outline: none;
      }
      .ba-pill-group {
        display: flex;
        gap: 6px;
        flex-wrap: wrap;
      }
      .ba-pill-btn {
        padding: 4px 10px;
        border-radius: 20px;
        font-size: 11px;
        font-weight: 700;
        cursor: pointer;
        border: 1.5px solid #cbd5e1;
        background: #ffffff;
        color: #475569;
        transition: all 0.15s ease-in-out;
      }
      .ba-pill-btn.active {
        background: var(--primary, #1b3a5c);
        color: #ffffff;
        border-color: var(--primary, #1b3a5c);
      }
      .slot-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
        gap: 6px;
        margin-top: 6px;
      }
      .slot-pill {
        padding: 6px 2px;
        border-radius: 6px;
        font-size: 11px;
        font-weight: 800;
        text-align: center;
        cursor: pointer;
        transition: all 0.15s ease-in-out;
        border: 1.5px solid #cbd5e1;
      }
      .slot-pill.available {
        background: #f0fdf4;
        color: #166534;
        border-color: #bbf7d0;
      }
      .slot-pill.available:hover {
        background: #dcfce7;
      }
      .slot-pill.booked {
        background: #fef2f2;
        color: #991b1b;
        border-color: #fecaca;
        cursor: not-allowed;
        opacity: 0.65;
        text-decoration: line-through;
      }
      .slot-pill.blocked {
        background: #fffbeb;
        color: #92400e;
        border-color: #fef3c7;
        cursor: not-allowed;
        opacity: 0.65;
      }
      .slot-pill.selected {
        background: var(--primary, #1b3a5c) !important;
        color: #ffffff !important;
        border-color: var(--primary, #1b3a5c) !important;
      }
      .switch-container {
        display: flex;
        align-items: center;
        justify-content: space-between;
        background: #f8fafc;
        border: 1px dashed #cbd5e1;
        padding: 8px 12px;
        border-radius: 6px;
        margin-top: 0px;
      }
      .ios-switch {
        position: relative;
        display: inline-block;
        width: 36px;
        height: 20px;
      }
      .ios-switch input {
        opacity: 0;
        width: 0;
        height: 0;
      }
      .ios-slider {
        position: absolute;
        cursor: pointer;
        top: 0; left: 0; right: 0; bottom: 0;
        background-color: #cbd5e1;
        transition: .3s;
        border-radius: 20px;
      }
      .ios-slider:before {
        position: absolute;
        content: "";
        height: 14px;
        width: 14px;
        left: 3px;
        bottom: 3px;
        background-color: white;
        transition: .3s;
        border-radius: 50%;
      }
      input:checked + .ios-slider {
        background-color: #10b981;
      }
      input:checked + .ios-slider:before {
        transform: translateX(16px);
      }
      
      /* Modal Animations */
      @keyframes modalFadeIn {
        from { transform: scale(0.95); opacity: 0; }
        to { transform: scale(1); opacity: 1; }
      }
      .ba-modal-overlay {
        position: fixed;
        top: 0; left: 0; right: 0; bottom: 0;
        background: rgba(15, 23, 42, 0.6);
        z-index: 2000;
        display: flex;
        justify-content: center;
        align-items: center;
        backdrop-filter: blur(4px);
        box-sizing: border-box;
      }
      .ba-modal-card {
        background: #ffffff;
        border-radius: 12px;
        max-width: 500px;
        width: 90%;
        padding: 24px;
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
        border-top: 6px solid #10b981;
        animation: modalFadeIn 0.2s ease-out;
        box-sizing: border-box;
        text-align: left;
      }
    `;
    document.head.appendChild(style);
  }

  // Reset module state
  function resetBookingState() {
    _selectedPatient = null;
    _selectedDoctor = '';
    _selectedDept = '';
    _selectedDate = window._HIS_TODAY || new Date().toISOString().slice(0, 10);
    _selectedSlot = '';
    _appointmentType = 'New';
    _visitType = 'OPD';
    _priority = 'Normal';
    _referredBy = '';
    _reason = '';
    _notes = '';
    _advancePaymentRequired = false;
    _searchQuery = '';
    _isPaymentScreen = false;
    _paymentMethod = 'UPI';
    _paymentProcessing = false;
    _successDetails = null;
    _showSuccessPopup = false;
  }

  // Rendering entry point
  window.views.bookAppointment = function (container, subAnchor, params) {
    injectStyles();

    // If query contains params.uhid, seed state
    if (params && params.uhid && (!_selectedPatient || _selectedPatient.uhid !== params.uhid)) {
      resetBookingState();
      const patient = (window.state.patients || []).find(p => p.uhid === params.uhid);
      if (patient) {
        _selectedPatient = patient;
      }
    } else if (!params || !params.uhid) {
      if (!_selectedPatient && !_successDetails && !_isPaymentScreen) {
        resetBookingState();
      }
    }

    renderCurrentState(container);
  };

  /* ──────────────────────────────────────────────────────────────────────────
     SCREEN 1: THE BOOKING FORM LAYOUT
     ────────────────────────────────────────────────────────────────────────── */
  function renderBookingForm(container) {
    const minDate = window._HIS_TODAY || new Date().toISOString().slice(0, 10);

    // Filter doctors list based on department selection
    const deptDoctors = (window.state.doctors || []).filter(d => !_selectedDept || d.spec === _selectedDept);

    container.innerHTML = `
      <div class="reg-container" style="font-family:'Inter', sans-serif; display: flex; flex-direction: column; gap: 10px; max-height: 90vh;">
        <!-- Header -->
        <div style="display:flex; justify-content:space-between; align-items:center; padding:10px 0; margin-bottom:12px; height: 42px; box-sizing: border-box; border-bottom: 1.5px solid #cbd5e1;">
          <div>
            <h3 style="margin:0; font-size:15px; font-weight:800; color:#1e293b; display:flex; align-items:center; gap:6px;">
              <span>📅</span> Patient Appointment Booking Desk
            </h3>
          </div>
          <button class="btn btn-secondary" style="padding:4px 10px; font-size:11px; font-weight:700; cursor:pointer;" onclick="window.baCancelBooking()">✕ Close</button>
        </div>

        <!-- Columns Grid -->
        <div style="display:grid; grid-template-columns: 1.15fr 0.85fr; gap:16px; align-items: stretch;">
          
          <!-- Left Column: Patient Search & Form Details -->
          <div style="display: flex; flex-direction: column; gap: 10px;">
            <!-- Patient Search Card -->
            <div class="ba-card" style="padding:12px 16px; margin-bottom:0;">
              <div class="ba-section-title" style="margin-bottom:8px; padding-bottom:4px;">🔍 1. Patient Lookup & Identification</div>
              ${_selectedPatient ? `
                <div style="background:#f0fdf4; border:1px solid #bbf7d0; border-radius:6px; padding:8px 12px; display:flex; justify-content:space-between; align-items:center;">
                  <div>
                    <div style="font-size:13px; font-weight:800; color:#166534; display:flex; align-items:center; gap:6px;">
                      <span>👤</span> ${_selectedPatient.name} 
                      <span class="mono" style="background:#dcfce7; color:#15803d; font-size:10px; padding:1px 4px; border-radius:3px;">${_selectedPatient.uhid}</span>
                    </div>
                    <div style="font-size:11px; color:#15803d; margin-top:2px;">
                      ${_selectedPatient.age || '—'} yrs / ${_selectedPatient.gender} | Mobile: ${_selectedPatient.mobile || 'N/A'}
                    </div>
                  </div>
                  <button class="btn-qa-secondary" style="border-color:#bbf7d0; color:#166534; font-size:10px; padding:2px 8px; cursor:pointer;" onclick="window.baClearSelectedPatient()">Switch</button>
                </div>
              ` : `
                <div style="display:flex; gap:8px;">
                  <div style="flex:1; position:relative;">
                    <input type="text" id="ba-pat-search" class="ba-input" style="height:32px; font-size:12px;" placeholder="Search patient by Mobile Number or UHID..." value="${_searchQuery}" oninput="window.baUpdatePatientSearch(this.value)">
                    <div id="ba-pat-autocomplete" class="pr-search-dropdown" style="display:none; position:absolute; top:35px; left:0; right:0; z-index:100; max-height:180px; overflow-y:auto; background:white; border:1px solid #cbd5e1; box-shadow:0 10px 15px -3px rgba(0,0,0,0.1); border-radius:6px;"></div>
                  </div>
                  <button class="btn btn-secondary" style="padding:4px 12px; font-size:11px; height:32px;" onclick="window.router.navigate('registration?action=new')">🆕 New Patient</button>
                </div>
              `}
            </div>

            <!-- Form Card -->
            <div class="ba-card" style="padding:12px 16px; margin-bottom:0; ${_selectedPatient ? '' : 'opacity:0.5; pointer-events:none; user-select:none;'}">
              <div class="ba-section-title" style="margin-bottom:8px; padding-bottom:4px;">📝 2. Appointment Details</div>
              <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px;">
                <div>
                  <label style="font-size:11px; font-weight:700; color:#475569; display:block; margin-bottom:3px;">Department *</label>
                  <select class="ba-select" style="height:32px; padding:4px 8px; font-size:12px;" id="ba-dept" onchange="window.baUpdateDept(this.value)">
                    <option value="">-- Select Department --</option>
                    <option value="General Medicine" ${_selectedDept === 'General Medicine' ? 'selected' : ''}>General Medicine</option>
                    <option value="Pediatrics" ${_selectedDept === 'Pediatrics' ? 'selected' : ''}>Pediatrics</option>
                    <option value="Orthopedics" ${_selectedDept === 'Orthopedics' ? 'selected' : ''}>Orthopedics</option>
                    <option value="Gynecology & Obs" ${_selectedDept === 'Gynecology & Obs' ? 'selected' : ''}>Gynecology & Obs</option>
                    <option value="Cardiology" ${_selectedDept === 'Cardiology' ? 'selected' : ''}>Cardiology</option>
                  </select>
                </div>
                <div>
                  <label style="font-size:11px; font-weight:700; color:#475569; display:block; margin-bottom:3px;">Consultant Doctor *</label>
                  <select class="ba-select" style="height:32px; padding:4px 8px; font-size:12px;" id="ba-doctor" onchange="window.baUpdateDoctor(this.value)">
                    <option value="">-- Choose Doctor --</option>
                    ${deptDoctors.map(d => `<option value="${d.id}" ${_selectedDoctor === d.id ? 'selected' : ''}>${d.name} (${d.spec})</option>`).join('')}
                  </select>
                </div>
                <div>
                  <label style="font-size:11px; font-weight:700; color:#475569; display:block; margin-bottom:3px;">Date *</label>
                  <input type="date" class="ba-input" style="height:32px; font-size:12px;" id="ba-date" min="${minDate}" value="${_selectedDate}" onchange="window.baUpdateDate(this.value)">
                </div>
                <div>
                  <label style="font-size:11px; font-weight:700; color:#475569; display:block; margin-bottom:3px;">Appointment Type</label>
                  <select class="ba-select" style="height:32px; padding:4px 8px; font-size:12px;" onchange="window.baUpdateApptType(this.value)">
                    <option value="New" ${_appointmentType === 'New' ? 'selected' : ''}>New Consultation</option>
                    <option value="Follow-up" ${_appointmentType === 'Follow-up' ? 'selected' : ''}>Follow-up</option>
                  </select>
                </div>
                <div>
                  <label style="font-size:11px; font-weight:700; color:#475569; display:block; margin-bottom:3px;">Visit Type</label>
                  <select class="ba-select" style="height:32px; padding:4px 8px; font-size:12px;" onchange="window.baUpdateVisitType(this.value)">
                    <option value="OPD" ${_visitType === 'OPD' ? 'selected' : ''}>Physical OPD</option>
                    <option value="Video Consultation" ${_visitType === 'Video Consultation' ? 'selected' : ''}>Video Consultation</option>
                  </select>
                </div>
                <div>
                  <label style="font-size:11px; font-weight:700; color:#475569; display:block; margin-bottom:3px;">Priority</label>
                  <select class="ba-select" style="height:32px; padding:4px 8px; font-size:12px;" onchange="window.baUpdatePriority(this.value)">
                    <option value="Normal" ${_priority === 'Normal' ? 'selected' : ''}>Normal</option>
                    <option value="Urgent" ${_priority === 'Urgent' ? 'selected' : ''}>Urgent</option>
                  </select>
                </div>
                <div>
                  <label style="font-size:11px; font-weight:700; color:#475569; display:block; margin-bottom:3px;">Referral Doctor (Optional)</label>
                  <input type="text" class="ba-input" style="height:32px; font-size:12px;" placeholder="Dr. Name" value="${_referredBy}" oninput="window.baUpdateReferredBy(this.value)">
                </div>
                <div>
                  <label style="font-size:11px; font-weight:700; color:#475569; display:block; margin-bottom:3px;">Reason for Visit (Optional)</label>
                  <input type="text" class="ba-input" style="height:32px; font-size:12px;" placeholder="e.g. Chest pain" value="${_reason}" oninput="window.baUpdateReason(this.value)">
                </div>
              </div>
              <div style="margin-top:10px;">
                <label style="font-size:11px; font-weight:700; color:#475569; display:block; margin-bottom:3px;">Internal Notes (Optional)</label>
                <input type="text" class="ba-input" style="height:32px; font-size:12px;" placeholder="Any additional info..." value="${_notes}" oninput="window.baUpdateNotes(this.value)">
              </div>
            </div>
          </div>

          <!-- Right Column: Slots Grid & Payment Panel -->
          <div style="display: flex; flex-direction: column; gap: 10px;">
            <!-- Slots Card -->
            <div class="ba-card" style="padding:12px 16px; margin-bottom:0; flex: 1; display: flex; flex-direction: column; min-height: 220px; justify-content: flex-start; ${_selectedPatient ? '' : 'opacity:0.5; pointer-events:none; user-select:none;'}">
              <div class="ba-section-title" style="margin-bottom:8px; padding-bottom:4px;">📅 3. Doctor Slot Availability</div>
              ${_selectedDoctor ? `
                <div style="font-size:11px; color:#64748b; margin-bottom:6px; display:flex; justify-content:space-between; align-items:center;">
                  <span>Selected Date: ${window.formatDateToDDMMYYYY(_selectedDate)}</span>
                  <span style="font-size:10px; display:flex; gap:6px;">
                    <span style="display:flex; align-items:center; gap:2px;"><span style="width:6px; height:6px; background:#22c55e; border-radius:50%;"></span> Avail</span>
                    <span style="display:flex; align-items:center; gap:2px;"><span style="width:6px; height:6px; background:#ef4444; border-radius:50%;"></span> Booked</span>
                  </span>
                </div>
                <div style="flex: 1; overflow-y: auto; max-height: 180px;">
                  <div style="display:grid; grid-template-columns: repeat(3, 1fr); gap:6px;">
                    ${(function() {
                      const activeDoc = (window.state.doctors || []).find(d => d.id === _selectedDoctor);
                      const slots = getDoctorSlots(activeDoc ? activeDoc.name : '', _selectedDate);
                      return slots.map(s => {
                        const isSelected = _selectedSlot === s.time;
                        const isAvailable = s.status === 'Available';
                        const classStr = isSelected ? 'slot-pill selected' : `slot-pill ${s.status.toLowerCase()}`;
                        const onclickStr = isAvailable ? `onclick="window.baSelectSlot('${s.time}')"` : '';
                        return `<div class="${classStr}" style="padding:6px 2px; font-size:11px; border-radius:6px;" ${onclickStr}>${s.time}</div>`;
                      }).join('');
                    })()}
                  </div>
                </div>
              ` : `
                <div style="flex:1; display:flex; justify-content:center; align-items:center; border:2px dashed #cbd5e1; border-radius:6px; color:#64748b; font-size:12px; background:#f8fafc; padding:20px 10px; text-align:center;">
                  Select a Consultant Doctor & Date to view live time slot availability
                </div>
              `}
            </div>

            <!-- Advance Payment Card & Submit -->
            <div class="ba-card" style="padding:12px 16px; margin-bottom:0; ${_selectedPatient ? '' : 'opacity:0.5; pointer-events:none; user-select:none;'}">
              <div class="ba-section-title" style="margin-bottom:8px; padding-bottom:4px;">💳 4. Payment & Checkout</div>
              
              <div class="switch-container" style="padding:6px 10px; margin-top:0; margin-bottom:8px; border-radius:6px;">
                <div>
                  <div style="font-size:12px; font-weight:800; color:#1e293b;">Advance Payment Required</div>
                </div>
                <label class="ios-switch" style="width:36px; height:20px;">
                  <input type="checkbox" id="ba-pay-toggle" ${_advancePaymentRequired ? 'checked' : ''} onchange="window.baUpdatePayToggle(this.checked)">
                  <span class="ios-slider" style="border-radius:20px;"></span>
                </label>
              </div>

              <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:6px; padding:8px 12px; display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
                <div style="font-size:11px; font-weight:700; color:#64748b;">Consultation + Cess:</div>
                <div style="font-size:15px; font-weight:900; color:#15803d;">₹350.00</div>
              </div>

              <!-- Submit Buttons -->
              <div style="display:grid; grid-template-columns: 1fr 2fr; gap:10px;">
                <button class="btn btn-secondary" style="padding:6px 10px; font-size:12px; height:36px;" onclick="window.baCancelBooking()">Cancel</button>
                <button class="btn btn-primary" id="ba-submit-btn" style="background:#15803d; border-color:#15803d; padding:6px 14px; font-weight:bold; font-size:12px; height:36px;" onclick="window.baSubmitForm()">
                  ${_advancePaymentRequired ? 'Proceed to Payment' : 'Confirm & Book Slot'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  /* ──────────────────────────────────────────────────────────────────────────
     SCREEN 2: FULL-PAGE PAYMENT SCREEN (Flow B)
     ────────────────────────────────────────────────────────────────────────── */
  function renderPaymentScreen(container) {
    const activeDoc = (window.state.doctors || []).find(d => d.id === _selectedDoctor);
    const docName = activeDoc ? activeDoc.name : '';

    container.innerHTML = `
      <div class="reg-container" style="font-family:'Inter', sans-serif;">
        <!-- Header -->
        <div style="display:flex; justify-content:space-between; align-items:center; padding:10px 0; margin-bottom:16px; border-bottom: 1.5px solid #cbd5e1;">
          <div>
            <h3 style="margin:0; font-size:15px; font-weight:800; color:#1e293b; display:flex; align-items:center; gap:6px;">
              <span>🧾</span> Billing Counter & Payment Gateway
            </h3>
            <span style="font-size:10px; color:#64748b; margin-top:2px; display:block;">Transaction ID: TXN-${Math.floor(100000 + Math.random() * 900000)}</span>
          </div>
          <button class="btn btn-secondary" style="padding:4px 10px; font-size:11px; font-weight:700; cursor:pointer;" onclick="window.baBackToForm()">✕ Close</button>
        </div>

        <div style="display:grid; grid-template-columns: 1fr 1.25fr; gap:20px; text-align:left; margin-bottom:40px;">
          <!-- Left: Summary Details Card -->
          <div class="ba-card" style="margin-bottom:0;">
            <div class="ba-section-title">📊 Booking Summary Details</div>
            
            <div style="display:flex; flex-direction:column; gap:12px; font-size:13px; line-height:1.5;">
              <div>
                <strong style="color:#64748b; font-size:10px; text-transform:uppercase; display:block;">Patient Info</strong>
                <strong>${_selectedPatient.name}</strong> (${_selectedPatient.uhid})<br>
                Mobile: ${_selectedPatient.mobile || 'N/A'}
              </div>
              
              <div>
                <strong style="color:#64748b; font-size:10px; text-transform:uppercase; display:block;">Consultation Advice</strong>
                ${docName} (${_selectedDept})<br>
                Date: ${window.formatDateToDDMMYYYY(_selectedDate)} | Time Slot: ${_selectedSlot}
              </div>

              <div style="background:#f8fafc; border-radius:8px; padding:12px; border:1px solid #e2e8f0; margin-top:10px;">
                <strong style="color:#64748b; font-size:10px; text-transform:uppercase; display:block; margin-bottom:6px;">Billing Breakdown</strong>
                <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
                  <span>Consultation Fee</span>
                  <span>₹300.00</span>
                </div>
                <div style="display:flex; justify-content:space-between; margin-bottom:8px;">
                  <span>HIS Service Cess</span>
                  <span>₹50.00</span>
                </div>
                <div style="display:flex; justify-content:space-between; font-weight:800; border-top:1.5px solid #cbd5e1; padding-top:6px; color:#15803d; font-size:15px;">
                  <span>Amount Due</span>
                  <span>₹350.00</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Right: Interactive Payment Portal Card -->
          <div class="ba-card" style="margin-bottom:0;">
            <div class="ba-section-title">💳 Choose Mode & Complete Transaction</div>

            <!-- Tab Menu -->
            <div class="ba-pill-group" style="margin-bottom:20px;">
              <button class="ba-pill-btn ${_paymentMethod === 'UPI' ? 'active' : ''}" onclick="window.baSelectPaymentMethod('UPI')">📱 UPI / QR Code</button>
              <button class="ba-pill-btn ${_paymentMethod === 'Card' ? 'active' : ''}" onclick="window.baSelectPaymentMethod('Card')">💳 Credit / Debit Card</button>
              <button class="ba-pill-btn ${_paymentMethod === 'Netbanking' ? 'active' : ''}" onclick="window.baSelectPaymentMethod('Netbanking')">🌐 Netbanking</button>
            </div>

            <!-- Mode Details -->
            ${_paymentMethod === 'UPI' ? `
              <div style="text-align:center; background:#fafafa; border:1.5px dashed #cbd5e1; border-radius:8px; padding:24px;">
                <div style="font-weight:700; color:#1b3a5c; margin-bottom:6px; font-size:14px;">Instant UPI Quick Scan</div>
                <p style="font-size:11px; color:#64748b; margin:0 0 15px 0;">Scan this mock QR code using any UPI app (GPay, PhonePe, Paytm, BHIM)</p>
                <div style="background:#ffffff; display:inline-block; padding:12px; border-radius:12px; box-shadow:0 4px 6px rgba(0,0,0,0.05); border:1px solid #e2e8f0; margin-bottom:12px;">
                  <!-- Mock QR code mockup -->
                  <div style="width:140px; height:140px; background:#e2e8f0; display:flex; flex-direction:column; justify-content:center; align-items:center; border:2px solid #1b3a5c; border-radius:6px; box-sizing:border-box;">
                    <span style="font-size:42px;">📱</span>
                    <span style="font-weight:800; font-size:10px; color:#1b3a5c; margin-top:6px;">₹350 UPI MOCK</span>
                  </div>
                </div>
                <div style="font-size:12px; color:#15803d; font-weight:700; display:flex; justify-content:center; align-items:center; gap:6px;">
                  <span class="pulse-dot" style="width:8px; height:8px; background:#10b981; border-radius:50%; display:inline-block;"></span> Waiting for scan confirmation...
                </div>
              </div>
            ` : ''}

            ${_paymentMethod === 'Card' ? `
              <div style="display:flex; flex-direction:column; gap:12px;">
                <div>
                  <label style="font-size:11px; font-weight:700; color:#64748b; display:block; margin-bottom:4px;">16-Digit Card Number *</label>
                  <input type="text" class="ba-input" placeholder="4321 0987 6543 2109" maxlength="19">
                </div>
                <div style="display:grid; grid-template-columns: 1fr 1fr; gap:12px;">
                  <div>
                    <label style="font-size:11px; font-weight:700; color:#64748b; display:block; margin-bottom:4px;">Expiry Date *</label>
                    <input type="text" class="ba-input" placeholder="MM/YY" maxlength="5">
                  </div>
                  <div>
                    <label style="font-size:11px; font-weight:700; color:#64748b; display:block; margin-bottom:4px;">CVV *</label>
                    <input type="password" class="ba-input" placeholder="***" maxlength="3">
                  </div>
                </div>
                <div>
                  <label style="font-size:11px; font-weight:700; color:#64748b; display:block; margin-bottom:4px;">Cardholder Name *</label>
                  <input type="text" class="ba-input" placeholder="e.g. RAJESH KUMAR">
                </div>
              </div>
            ` : ''}

            ${_paymentMethod === 'Netbanking' ? `
              <div>
                <label style="font-size:11px; font-weight:700; color:#64748b; display:block; margin-bottom:4px;">Select Popular Bank *</label>
                <select class="ba-select">
                  <option value="SBI">State Bank of India</option>
                  <option value="HDFC">HDFC Bank</option>
                  <option value="ICICI">ICICI Bank</option>
                  <option value="AXIS">Axis Bank</option>
                  <option value="KOTAK">Kotak Mahindra Bank</option>
                </select>
              </div>
            ` : ''}

            <!-- Complete Payment Action Button -->
            <button class="btn btn-primary" id="ba-pay-btn" style="background:#15803d; border-color:#15803d; font-weight:bold; width:100%; height:42px; margin-top:20px; font-size:14px; cursor:pointer;" onclick="window.baProcessPayment()" ${_paymentProcessing ? 'disabled' : ''}>
              ${_paymentProcessing ? 'Processing Transaction... Please Wait' : 'Confirm & Complete Payment (₹350.00)'}
            </button>
          </div>
        </div>
      </div>
    `;
  }

  /* ──────────────────────────────────────────────────────────────────────────
     SUCCESS POPUP MODAL HTML BUILDER
     ────────────────────────────────────────────────────────────────────────── */
  function getSuccessPopupHTML() {
    const s = _successDetails;
    return `
      <div class="ba-modal-overlay">
        <div class="ba-modal-card">
          <div style="text-align:center;">
            <div style="width:48px; height:48px; background:#dcfce7; color:#10b981; font-size:24px; line-height:48px; border-radius:50%; display:inline-block; margin-bottom:10px; font-weight:bold; text-align:center;">✓</div>
            <h2 style="font-size:18px; font-weight:900; color:#065f46; margin:0 0 4px 0;">OPD Appointment Confirmed!</h2>
            <p style="font-size:11px; color:#64748b; margin:0 0 15px 0;">The appointment slot has been successfully scheduled in the HIS registry.</p>
          </div>

          <!-- Ticket Summary Details -->
          <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:6px; padding:12px 14px; font-size:12px; display:grid; grid-template-columns: 1fr 1fr; gap:10px; line-height:1.4;">
            <div>
              <span style="color:#64748b; font-size:9px; font-weight:700; text-transform:uppercase; display:block;">Appointment ID</span>
              <strong style="color:#1b3a5c;">${s.appointmentId}</strong>
            </div>
            <div>
              <span style="color:#64748b; font-size:9px; font-weight:700; text-transform:uppercase; display:block;">OPD Queue Token</span>
              <strong style="color:#1b3a5c;">${s.tokenNumber}</strong>
            </div>
            
            ${s.receiptId ? `
              <div>
                <span style="color:#64748b; font-size:9px; font-weight:700; text-transform:uppercase; display:block;">Receipt Number</span>
                <strong style="color:#1b3a5c;">${s.receiptId}</strong>
              </div>
              <div>
                <span style="color:#64748b; font-size:9px; font-weight:700; text-transform:uppercase; display:block;">Advance Payment status</span>
                <strong style="color:#166534;">Paid (₹350.00)</strong>
              </div>
            ` : `
              <div>
                <span style="color:#64748b; font-size:9px; font-weight:700; text-transform:uppercase; display:block;">Billing Mode</span>
                <strong style="color:#1e293b;">Pay-at-Counter</strong>
              </div>
              <div>
                <span style="color:#64748b; font-size:9px; font-weight:700; text-transform:uppercase; display:block;">OPD Status</span>
                <strong style="color:#92400e;">Booked</strong>
              </div>
            `}

            <div style="grid-column: span 2; border-top: 1px dashed #cbd5e1; padding-top:8px; margin-top:2px;">
              <span style="color:#64748b; font-size:9px; font-weight:700; text-transform:uppercase; display:block;">Patient Details</span>
              <strong>${s.patientName}</strong> (${s.uhid})
            </div>

            <div style="grid-column: span 2;">
              <span style="color:#64748b; font-size:9px; font-weight:700; text-transform:uppercase; display:block;">Consultation Scheduled</span>
              <strong>${s.doctorName}</strong> | ${s.deptName} Dept<br>
              Date: ${s.date} at ${s.time}
            </div>
          </div>

          <!-- Actions Grid -->
          <div style="display:flex; justify-content:center; gap:8px; flex-wrap:wrap; margin-top:15px;">
            <button class="btn btn-secondary" style="padding:4px 8px; font-size:11px;" onclick="window.print()">📄 Print Slip</button>
            ${s.receiptId ? `<button class="btn btn-secondary" style="padding:4px 8px; font-size:11px;" onclick="window.print()">🧾 Print Receipt</button>` : ''}
            <button class="btn btn-secondary" style="padding:4px 8px; font-size:11px;" onclick="window.baMockAction('PDF Download initiated')">💾 Download PDF</button>
            <button class="btn btn-secondary" style="padding:4px 8px; font-size:11px;" onclick="window.baMockAction('SMS alert sent')">📱 Send SMS</button>
            <button class="btn btn-secondary" style="padding:4px 8px; font-size:11px;" onclick="window.baMockAction('WhatsApp alert sent')">💬 Send WhatsApp</button>
          </div>

          <!-- Close Action button -->
          <button style="width: 100%; padding: 8px 12px; background: #1e293b; color: white; border: none; font-weight: bold; border-radius: 6px; cursor: pointer; margin-top: 15px; font-size:12px;" onclick="window.baCloseSuccessPopup()">
            OK / Close & Book Another
          </button>
        </div>
      </div>
    `;
  }

  /* ──────────────────────────────────────────────────────────────────────────
     GLOBAL TRIGGER FUNCTIONS & EVENT HANDLERS
     ────────────────────────────────────────────────────────────────────────── */
  window.baUpdatePatientSearch = function(val) {
    _searchQuery = val;
    const dropdown = document.getElementById('ba-pat-autocomplete');
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

    const isIPDActive = window.isActiveIPD || ((id) => {
      const p = window.state && window.state.patients && window.state.patients.find(x => x.uhid === id);
      return p && p.type === 'IPD' && (p.status === 'Admitted' || p.status === 'Critical' || p.status === 'Under Observation' || p.status === 'Pre-Op' || p.status === 'Post-Op');
    });

    if (matches.length > 0) {
      dropdown.style.display = 'block';
      dropdown.innerHTML = matches.map(m => {
        const isIPD = isIPDActive(m.uhid);
        const ipdBadge = isIPD
          ? `<span style="display:inline-flex;align-items:center;gap:3px;background:#fef2f2;color:#dc2626;border:1px solid #fecaca;border-radius:4px;padding:1px 6px;font-size:10px;font-weight:700;margin-left:6px;vertical-align:middle;">🏥 IPD Active</span>`
          : '';
        const itemStyle = isIPD
          ? 'padding:8px 12px; cursor:not-allowed; font-size:12px; border-bottom:1px solid #f1f5f9; text-align:left; background:#fff8f8; opacity:0.85;'
          : 'padding:8px 12px; cursor:pointer; font-size:12px; border-bottom:1px solid #f1f5f9; text-align:left; background:#ffffff;';
        const hoverHandlers = isIPD
          ? ''
          : `onmouseover="this.style.background='#f1f5f9'" onmouseout="this.style.background='#ffffff'"`;

        return `
          <div style="${itemStyle}" onclick="window.baSelectPatient('${m.uhid}')" ${hoverHandlers}>
            <div style="display:flex; justify-content:space-between; align-items:center; font-weight:600; color:#1e293b;">
              <span style="display:flex;align-items:center;">${m.name}${ipdBadge}</span>
              <span class="mono" style="color:#0284c7; font-size:11px;">${m.uhid}</span>
            </div>
            <div style="font-size:10px; color:#64748b; margin-top:2px;">📱 ${m.mobile} | ${m.age || '—'} yrs | ${m.gender}</div>
          </div>
        `;
      }).join('');
    } else {
      dropdown.style.display = 'block';
      dropdown.innerHTML = `<div style="padding:12px; text-align:center; color:#64748b; font-size:11px; background:#ffffff;">No matching patients found</div>`;
    }
  };

  window.baSelectPatient = function(uhid) {
    const patient = (window.state.patients || []).find(p => p.uhid === uhid);
    if (patient) {
      const isIPDActive = window.isActiveIPD || ((id) => {
        const p = window.state && window.state.patients && window.state.patients.find(x => x.uhid === id);
        return p && p.type === 'IPD' && (p.status === 'Admitted' || p.status === 'Critical' || p.status === 'Under Observation');
      });

      if (isIPDActive(uhid)) {
        if (typeof window.prShowToast === 'function') {
          window.prShowToast('❌ Cannot book OPD appointment: This patient is currently admitted as an active IPD patient.');
        } else {
          alert('❌ Cannot book OPD appointment: This patient is currently admitted as an active IPD patient.');
        }
        return;
      }

      _selectedPatient = patient;
      _searchQuery = '';
      const c = document.getElementById('main-content');
      if (c) renderCurrentState(c);
    }
  };

  window.baClearSelectedPatient = function() {
    _selectedPatient = null;
    const c = document.getElementById('main-content');
    if (c) renderCurrentState(c);
  };

  window.baUpdateDept = function(val) {
    _selectedDept = val;
    _selectedDoctor = ''; // Reset doctor
    _selectedSlot = ''; // Reset slot
    const c = document.getElementById('main-content');
    if (c) renderCurrentState(c);
  };

  window.baUpdateDoctor = function(val) {
    _selectedDoctor = val;
    _selectedSlot = ''; // Reset slot
    const activeDoc = (window.state.doctors || []).find(d => d.id === val);
    if (activeDoc) {
      _selectedDept = activeDoc.spec;
    }
    const c = document.getElementById('main-content');
    if (c) renderCurrentState(c);
  };

  window.baUpdateDate = function(val) {
    _selectedDate = val;
    _selectedSlot = ''; // Reset slot
    const c = document.getElementById('main-content');
    if (c) renderCurrentState(c);
  };

  window.baSelectSlot = function(slotTime) {
    _selectedSlot = slotTime;
    const c = document.getElementById('main-content');
    if (c) renderCurrentState(c);
  };

  window.baUpdateApptType = function(val) {
    _appointmentType = val;
    const c = document.getElementById('main-content');
    if (c) renderCurrentState(c);
  };

  window.baUpdateVisitType = function(val) {
    _visitType = val;
    const c = document.getElementById('main-content');
    if (c) renderCurrentState(c);
  };

  window.baUpdatePriority = function(val) {
    _priority = val;
    const c = document.getElementById('main-content');
    if (c) renderCurrentState(c);
  };

  window.baUpdateReferredBy = function(val) { _referredBy = val; };
  window.baUpdateReason = function(val) { _reason = val; };
  window.baUpdateNotes = function(val) { _notes = val; };

  window.baUpdatePayToggle = function(checked) {
    _advancePaymentRequired = checked;
    const c = document.getElementById('main-content');
    if (c) renderCurrentState(c);
  };

  window.baSelectPaymentMethod = function(method) {
    _paymentMethod = method;
    const c = document.getElementById('main-content');
    if (c) renderCurrentState(c);
  };

  window.baCancelBooking = function() {
    resetBookingState();
    window.router.navigate('patients');
  };

  window.baBackToForm = function() {
    _isPaymentScreen = false;
    const c = document.getElementById('main-content');
    if (c) renderCurrentState(c);
  };

  // Form Validation
  function validateBookingForm() {
    if (!_selectedPatient) {
      window.prShowToast('⚠️ Please select a patient before booking.');
      return false;
    }

    const isIPDActive = window.isActiveIPD || ((id) => {
      const p = window.state && window.state.patients && window.state.patients.find(x => x.uhid === id);
      return p && p.type === 'IPD' && (p.status === 'Admitted' || p.status === 'Critical' || p.status === 'Under Observation');
    });

    if (isIPDActive(_selectedPatient.uhid)) {
      window.prShowToast('❌ Cannot book OPD appointment: This patient is currently admitted as an active IPD patient.');
      return false;
    }
    if (!_selectedDept) {
      window.prShowToast('⚠️ Please select a department.');
      return false;
    }
    if (!_selectedDoctor) {
      window.prShowToast('⚠️ Please select a consultant doctor.');
      return false;
    }
    if (!_selectedDate) {
      window.prShowToast('⚠️ Please select an appointment date.');
      return false;
    }
    if (!_selectedSlot) {
      window.prShowToast('⚠️ Please choose an available time slot.');
      return false;
    }
    
    // Prevent past dates check
    const today = window._HIS_TODAY || new Date().toISOString().slice(0, 10);
    if (_selectedDate < today) {
      window.prShowToast('⚠️ Appointment date cannot be in the past.');
      return false;
    }

    // Prevent double booking of the same slot for the doctor on the same date
    const activeDoc = (window.state.doctors || []).find(d => d.id === _selectedDoctor);
    const docName = activeDoc ? activeDoc.name : '';
    const doubleBooked = (window.state.appointments || []).some(a => 
      a.doctorName === docName && a.date === _selectedDate && a.time === _selectedSlot && a.status !== 'Cancelled'
    );
    if (doubleBooked) {
      window.prShowToast(`⚠️ The slot ${_selectedSlot} is already booked for ${docName} on ${_selectedDate}.`);
      return false;
    }

    return true;
  }

  // Submit Handler
  window.baSubmitForm = function() {
    if (!validateBookingForm()) return;

    // Disable button to prevent double submit
    const btn = document.getElementById('ba-submit-btn');
    if (btn) btn.disabled = true;

    if (_advancePaymentRequired) {
      _isPaymentScreen = true;
      const c = document.getElementById('main-content');
      if (c) renderCurrentState(c);
    } else {
      completeImmediateBooking();
    }
  };

  // Flow A: Complete Booking without advance payment
  function completeImmediateBooking() {
    const activeDoc = (window.state.doctors || []).find(d => d.id === _selectedDoctor);
    const docName = activeDoc ? activeDoc.name : '';
    
    window.state.appointments = window.state.appointments || [];
    const apptId = `APT${8000 + window.state.appointments.length}`;
    const tokenNum = `TKN-${200 + window.state.appointments.length}`;

    const newAppt = {
      id: apptId,
      appointmentId: apptId,
      uhid: _selectedPatient.uhid,
      patientName: _selectedPatient.name,
      doctorName: docName,
      deptName: _selectedDept,
      date: _selectedDate,
      time: _selectedSlot,
      status: 'Booked',
      type: _appointmentType === 'New' ? 'Consultation' : 'Follow-up Consultation',
      createdBy: 'Front Desk Exec',
      tokenNumber: tokenNum,
      mobile: _selectedPatient.mobile || '',
      referredBy: _referredBy || null,
      reason: _reason || null,
      notes: _notes || null
    };

    window.state.appointments.push(newAppt);
    localStorage.setItem('saronil_appointments', JSON.stringify(window.state.appointments));

    if (typeof window.logPatientTimeline === 'function') {
      window.logPatientTimeline(_selectedPatient.uhid, {
        type: 'general',
        icon: '📅',
        title: 'OPD Appointment Booked',
        desc: `Booked appointment for ${newAppt.date} at ${newAppt.time} with ${newAppt.doctorName} (${newAppt.deptName}).`
      });
    }

    // Audit logs
    window.state.auditLogs = window.state.auditLogs || [];
    window.state.auditLogs.push({
      timestamp: new Date().toISOString(),
      action: 'BOOK_APPOINTMENT_DIRECT',
      user: 'Front Desk Exec',
      details: `Booked appointment ${apptId} for ${_selectedPatient.name} with ${docName} on ${_selectedDate} at ${_selectedSlot}.`
    });

    _successDetails = {
      appointmentId: apptId,
      tokenNumber: tokenNum,
      patientName: _selectedPatient.name,
      uhid: _selectedPatient.uhid,
      doctorName: docName,
      deptName: _selectedDept,
      date: window.formatDateToDDMMYYYY(_selectedDate),
      time: _selectedSlot,
      receiptId: null
    };

    _showSuccessPopup = true;
    window.prShowToast('✓ Appointment booked successfully!');
    const c = document.getElementById('main-content');
    if (c) renderCurrentState(c);
  }

  // Flow B: Payment simulation
  window.baProcessPayment = function() {
    _paymentProcessing = true;
    const c = document.getElementById('main-content');
    if (c) renderCurrentState(c);

    // Simulate network delay
    setTimeout(() => {
      const activeDoc = (window.state.doctors || []).find(d => d.id === _selectedDoctor);
      const docName = activeDoc ? activeDoc.name : '';

      window.state.appointments = window.state.appointments || [];
      const apptId = `APT${8000 + window.state.appointments.length}`;
      const tokenNum = `TKN-${200 + window.state.appointments.length}`;

      // Create Receipt
      window.state.billing = window.state.billing || [];
      const receiptId = `REC${5000 + window.state.billing.length}`;
      const fee = 350;

      const newAppt = {
        id: apptId,
        appointmentId: apptId,
        uhid: _selectedPatient.uhid,
        patientName: _selectedPatient.name,
        doctorName: docName,
        deptName: _selectedDept,
        date: _selectedDate,
        time: _selectedSlot,
        status: 'Booked',
        type: _appointmentType === 'New' ? 'Consultation' : 'Follow-up Consultation',
        createdBy: 'Front Desk Exec',
        tokenNumber: tokenNum,
        mobile: _selectedPatient.mobile || '',
        referredBy: _referredBy || null,
        reason: _reason || null,
        notes: _notes || null
      };

      window.state.appointments.push(newAppt);
      localStorage.setItem('saronil_appointments', JSON.stringify(window.state.appointments));

      if (typeof window.logPatientTimeline === 'function') {
        window.logPatientTimeline(_selectedPatient.uhid, {
          type: 'general',
          icon: '📅',
          title: 'OPD Appointment Booked',
          desc: `Booked appointment for ${newAppt.date} at ${newAppt.time} with ${newAppt.doctorName} (${newAppt.deptName}).`
        });
      }

      // Append to billing
      window.state.billing.push({
        id: receiptId,
        uhid: _selectedPatient.uhid,
        patientName: _selectedPatient.name,
        amount: fee,
        paid: fee,
        status: 'Paid',
        date: _selectedDate,
        items: [
          { desc: `OPD Consultation Fee & cess (${docName})`, qty: 1, rate: fee, total: fee }
        ]
      });
      localStorage.setItem('saronil_billing', JSON.stringify(window.state.billing));

      // Audit logs
      window.state.auditLogs = window.state.auditLogs || [];
      window.state.auditLogs.push({
        timestamp: new Date().toISOString(),
        action: 'BOOK_APPOINTMENT_ADVANCE_PAID',
        user: 'Front Desk Exec',
        details: `Booked paid appointment ${apptId} (Receipt: ${receiptId}) for ${_selectedPatient.name} with ${docName} on ${_selectedDate}.`
      });

      _successDetails = {
        appointmentId: apptId,
        tokenNumber: tokenNum,
        patientName: _selectedPatient.name,
        uhid: _selectedPatient.uhid,
        doctorName: docName,
        deptName: _selectedDept,
        date: window.formatDateToDDMMYYYY(_selectedDate),
        time: _selectedSlot,
        receiptId: receiptId
      };

      _showSuccessPopup = true;
      window.prShowToast('✓ Payment completed and appointment created!');
      _paymentProcessing = false;
      if (c) renderCurrentState(c);
    }, 1200);
  };

  window.baMockAction = function(msg) {
    window.prShowToast(`✓ ${msg}`);
  };

  window.baCloseSuccessPopup = function() {
    _showSuccessPopup = false;
    _successDetails = null;
    resetBookingState();
    const c = document.getElementById('main-content');
    if (c) renderCurrentState(c);
  };

  // Internal routing render helper
  function renderCurrentState(container) {
    if (_isPaymentScreen) {
      renderPaymentScreen(container);
    } else {
      renderBookingForm(container);
    }

    if (_showSuccessPopup && _successDetails) {
      // Append the popup to the DOM
      let popupDiv = document.getElementById('ba-success-popup-container');
      if (!popupDiv) {
        popupDiv = document.createElement('div');
        popupDiv.id = 'ba-success-popup-container';
        container.appendChild(popupDiv);
      }
      popupDiv.innerHTML = getSuccessPopupHTML();
    } else {
      const popupDiv = document.getElementById('ba-success-popup-container');
      if (popupDiv) popupDiv.remove();
    }
  }

})();
