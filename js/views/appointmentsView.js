/* ==========================================================================
   SARONIL HMS - OPD APPOINTMENTS & SCHEDULING (appointmentsView.js)
   ========================================================================== */

window.views.appointments = function(container, subAnchor, params) {
  const selectedUhid = params.uhid || '';
  const initialPatient = selectedUhid ? state.patients.find(p => p.uhid === selectedUhid) : null;
  const initialPatientText = initialPatient ? `${initialPatient.name} (${initialPatient.uhid})` : '';

  // Get active doctor from filter or default to first doctor
  let activeDoctorId = params.docId || 'DOC01';
  let activeDoctor = state.doctors.find(d => d.id === activeDoctorId) || state.doctors[0];

  container.innerHTML = `
    <div class="dashboard-row" style="grid-template-columns: 300px 1fr;">
      <!-- Left Panel: Filters & Patient Selector -->
      <div style="display: flex; flex-direction: column; gap: 1.5rem;">
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">Schedule Filters</h3>
          </div>
          <div class="card-body">
            <div class="form-group">
              <label class="form-label" for="appt-dept-filter">Department</label>
              <select id="appt-dept-filter" class="form-select">
                <option value="">All Specialties</option>
                <option value="Cardiology">Cardiology</option>
                <option value="Pediatrics">Pediatrics</option>
                <option value="General Medicine">General Medicine</option>
                <option value="Orthopedics">Orthopedics</option>
                <option value="Gynecology & Obs">Gynecology & Obs</option>
                <option value="Neurology">Neurology</option>
                <option value="Oncology">Oncology</option>
              </select>
            </div>
            
            <div class="form-group">
              <label class="form-label" for="appt-doc-filter">Practitioner / Doctor</label>
              <select id="appt-doc-filter" class="form-select">
                <!-- Populated dynamically -->
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">Select Date</label>
              <input type="date" id="appt-date-picker" class="form-control" value="2026-06-17">
            </div>
          </div>
        </div>

        <div class="card">
          <div class="card-header">
            <h3 class="card-title">Quick OPD Booking</h3>
          </div>
          <div class="card-body">
            <form id="quick-booking-form" style="display: flex; flex-direction: column; gap: 1rem;">
              <div class="form-group" style="margin-bottom: 0;">
                <label class="form-label" for="booking-uhid-search">Patient (UHID / Name)</label>
                <div class="patient-search-wrapper" style="position: relative; width: 100%;">
                  <input type="text" id="booking-uhid-search" class="form-control" placeholder="Search patient by Name, Mobile, or UHID..." autocomplete="off" value="${initialPatientText}" required>
                  <input type="hidden" id="booking-uhid-select" value="${selectedUhid}" required>
                  <div id="booking-uhid-autocomplete" class="autocomplete-dropdown" style="display: none;"></div>
                </div>
              </div>

              <div class="form-group" style="margin-bottom: 0;">
                <label class="form-label" for="booking-type">Visit Type</label>
                <select id="booking-type" class="form-select" required>
                  <option value="Consultation">OPD Consultation</option>
                  <option value="Follow-up">Clinical Follow-up</option>
                  <option value="Procedure">Minor Procedure</option>
                </select>
              </div>

              <div class="form-group" style="margin-bottom: 0;">
                <label class="form-label" for="booking-time-slot">Time Slot</label>
                <select id="booking-time-slot" class="form-select" required>
                  <option value="09:00 AM">09:00 AM</option>
                  <option value="09:30 AM">09:30 AM</option>
                  <option value="10:00 AM">10:00 AM</option>
                  <option value="10:30 AM">10:30 AM</option>
                  <option value="11:00 AM">11:00 AM</option>
                  <option value="11:30 AM">11:30 AM</option>
                  <option value="12:00 PM">12:00 PM</option>
                  <option value="02:00 PM">02:00 PM</option>
                  <option value="02:30 PM">02:30 PM</option>
                  <option value="03:00 PM">03:00 PM</option>
                  <option value="03:30 PM">03:30 PM</option>
                  <option value="04:00 PM">04:00 PM</option>
                </select>
              </div>

              <button type="submit" class="btn btn-primary" style="margin-top: 0.5rem;">Confirm Appointment</button>
            </form>
          </div>
        </div>
      </div>

      <!-- Right Panel: Time Slot Calendar Grid -->
      <div class="card">
        <div class="card-header" style="background-color: var(--primary-glow);">
          <div>
            <h3 class="card-title" style="color: var(--primary);">${activeDoctor.name} &mdash; Duty Rota Grid</h3>
            <p class="card-subtitle" style="color: var(--text-secondary);">${activeDoctor.spec} | Room ${activeDoctor.room}</p>
          </div>
          <span class="badge badge-success">On Duty</span>
        </div>
        <div class="card-body">
          <div class="tab-container">
            <span class="tab-item active">Daily Roster</span>
            <span class="tab-item">Weekly Schedule</span>
            <span class="tab-item">Practitioner Rota Leaves</span>
          </div>

          <!-- Dynamic Slots Grid -->
          <div style="display: flex; flex-direction: column; gap: 0.75rem; max-height: 520px; overflow-y: auto; padding-right: 0.5rem;" id="slots-grid-container">
            <!-- Populated dynamically -->
          </div>
        </div>
      </div>
    </div>
  `;

  // Dynamic selector binding
  const deptSelect = document.getElementById('appt-dept-filter');
  const docSelect = document.getElementById('appt-doc-filter');
  const datePicker = document.getElementById('appt-date-picker');

  const populateDoctors = () => {
    const selectedDept = deptSelect.value;
    const filteredDocs = selectedDept 
      ? state.doctors.filter(d => d.spec === selectedDept)
      : state.doctors;

    docSelect.innerHTML = filteredDocs.map(d => `<option value="${d.id}" ${d.id === activeDoctorId ? 'selected' : ''}>${d.name} (${d.spec})</option>`).join('');
  };

  const renderSlots = () => {
    const docId = docSelect.value;
    const doctor = state.doctors.find(d => d.id === docId);
    if (!doctor) return;
    
    activeDoctor = doctor;
    activeDoctorId = docId;

    const slotTimes = ["09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM", "12:00 PM", "02:00 PM", "02:30 PM", "03:00 PM", "03:30 PM", "04:00 PM"];
    const container = document.getElementById('slots-grid-container');

    container.innerHTML = slotTimes.map(time => {
      // Check if slot has a booking
      const appt = state.appointments.find(a => a.doctorName === doctor.name && a.time === time && a.date === datePicker.value);
      
      if (appt) {
        let statusBadgeClass = 'badge-primary';
        if (appt.status === 'Checked In') statusBadgeClass = 'badge-success';
        if (appt.status === 'Cancelled') statusBadgeClass = 'badge-danger';
        
        return `
          <div style="border: 1px solid var(--border-color); border-left: 4px solid var(--primary); padding: 0.75rem 1rem; border-radius: var(--radius-sm); display: flex; align-items: center; justify-content: space-between; background-color: var(--bg-base);">
            <div style="display: flex; align-items: center; gap: 1.5rem;">
              <span style="font-weight: 700; width: 80px; color: var(--text-primary); font-family: monospace;">${time}</span>
              <div style="display: flex; flex-direction: column;">
                <span style="font-weight: 600;"><a href="#patients?uhid=${appt.uhid}" class="patient-link">${appt.patientName}</a> (${appt.uhid})</span>
                <span style="font-size: 0.75rem; color: var(--text-muted);">${appt.type}</span>
              </div>
            </div>
            <div style="display: flex; align-items: center; gap: 1rem;">
              <span class="badge ${statusBadgeClass}">${appt.status}</span>
              <div style="display: flex; gap: 0.35rem;">
                ${appt.status === 'Confirmed' ? `<button class="btn btn-secondary btn-sm" onclick="triggerCheckIn('${appt.id}')">Check In</button>` : ''}
                ${appt.status === 'Checked In' ? `<button class="btn btn-primary btn-sm" onclick="router.navigate('emr?uhid=${appt.uhid}')">Consult</button>` : ''}
                ${appt.status !== 'Cancelled' ? `<button class="btn btn-danger btn-sm" onclick="triggerCancelAppt('${appt.id}')">Cancel</button>` : ''}
              </div>
            </div>
          </div>
        `;
      } else {
        return `
          <div style="border: 1px dashed var(--border-color); padding: 0.75rem 1rem; border-radius: var(--radius-sm); display: flex; align-items: center; justify-content: space-between; opacity: 0.75;">
            <div style="display: flex; align-items: center; gap: 1.5rem;">
              <span style="font-weight: 700; width: 80px; color: var(--text-muted); font-family: monospace;">${time}</span>
              <span style="color: var(--text-muted); font-style: italic;">Available Time Slot</span>
            </div>
            <button class="btn btn-secondary btn-sm" onclick="prefillTimeSlot('${time}')">Book Slot</button>
          </div>
        `;
      }
    }).join('');
  };

  deptSelect.addEventListener('change', () => {
    populateDoctors();
    renderSlots();
  });
  docSelect.addEventListener('change', renderSlots);
  datePicker.addEventListener('change', renderSlots);

  // Initialize
  populateDoctors();
  renderSlots();

  // Booking Form Submission
  const bookingForm = document.getElementById('quick-booking-form');
  bookingForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const uhid = document.getElementById('booking-uhid-select').value;
    const visitType = document.getElementById('booking-type').value;
    const timeSlot = document.getElementById('booking-time-slot').value;
    const dateVal = datePicker.value;

    const patient = state.patients.find(p => p.uhid === uhid);
    if (!patient) return;

    // Check if doctor already has a booking at that time
    const exists = state.appointments.find(a => a.doctorName === activeDoctor.name && a.time === timeSlot && a.date === dateVal);
    if (exists) {
      alert(`Conflict: ${activeDoctor.name} already has an appointment at ${timeSlot}.`);
      return;
    }

    const newAppt = {
      id: "APT" + String(1000 + state.appointments.length + 1),
      uhid: patient.uhid,
      patientName: patient.name,
      doctorName: activeDoctor.name,
      spec: activeDoctor.spec,
      date: dateVal,
      time: timeSlot,
      status: "Confirmed",
      type: visitType
    };

    state.appointments.push(newAppt);
    
    // Auto-update patient status to Checked In if booked for today
    if (dateVal === "2026-06-17") {
      patient.status = "Checked In";
    }

    alert(`Appointment successfully created for ${patient.name} at ${timeSlot}.`);
    renderSlots();
    bookingForm.reset();
  });

  // Initialize Patient Autocomplete Search
  window.setupPatientAutocomplete({
    searchInputId: 'booking-uhid-search',
    hiddenInputId: 'booking-uhid-select',
    autocompleteListId: 'booking-uhid-autocomplete'
  });

  // Handle form reset to also clear search inputs
  bookingForm.addEventListener('reset', () => {
    setTimeout(() => {
      document.getElementById('booking-uhid-select').value = '';
      document.getElementById('booking-uhid-search').value = '';
    }, 0);
  });

  // Global helper functions bound to window for inline HTML triggers
  window.prefillTimeSlot = function(time) {
    document.getElementById('booking-time-slot').value = time;
  };

  window.triggerCheckIn = function(apptId) {
    const appt = state.appointments.find(a => a.id === apptId);
    if (appt) {
      appt.status = "Checked In";
      const patient = state.patients.find(p => p.uhid === appt.uhid);
      if (patient) patient.status = "Checked In";
      renderSlots();
    }
  };

  window.triggerCancelAppt = function(apptId) {
    const appt = state.appointments.find(a => a.id === apptId);
    if (appt) {
      appt.status = "Cancelled";
      const patient = state.patients.find(p => p.uhid === appt.uhid);
      if (patient) patient.status = "Registered";
      renderSlots();
    }
  };
};
