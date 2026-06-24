/* ==========================================================================
   SARONIL HMS - EMERGENCY & TRIAGE (emergencyView.js)
   ========================================================================== */

window.views.emergency = function(container, subAnchor, params) {
  renderEmergencyView(container);
};

function renderEmergencyView(container) {
  // Compute emergency bed statuses
  const emgBeds = state.wards['EMERGENCY'].beds;
  
  let bedsHTML = '';
  emgBeds.forEach(bedId => {
    const statusObj = state.bedsStatus[bedId];
    let patientNameHTML = `<span style="color: var(--color-success); font-size: 0.8rem; font-weight: 600;">Vacant</span>`;
    if (statusObj.status === 'Occupied' && statusObj.patientUhid) {
      const patient = state.patients.find(p => p.uhid === statusObj.patientUhid);
      const name = patient ? patient.name : 'Trauma Patient';
      patientNameHTML = `<a href="#patients?uhid=${statusObj.patientUhid}" class="patient-link" style="font-size: 0.8rem; font-weight: 600; color: var(--color-danger);">${name}</a>`;
      triageClass = 'bg-danger';
    }

    bedsHTML += `
      <div style="background-color: var(--bg-surface); border: 1px solid var(--border-color); border-radius: 8px; padding: 0.75rem; text-align: center; box-shadow: var(--shadow-sm);">
        <strong style="color: var(--text-primary); font-size: 0.85rem;">${bedId}</strong>
        <div style="font-size: 1.5rem; margin: 0.25rem 0;">🚨</div>
        <div>${patientNameHTML}</div>
      </div>
    `;
  });

  // Get Medico-Legal Cases
  const mlcPatients = state.patients.filter(p => p.allergies && p.allergies.includes('MLC'));

  container.innerHTML = `
    <!-- Top Stats and Emergency Beds Grid -->
    <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 1.5rem; margin-bottom: 1.5rem;">
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">Emergency Bed Board</h3>
        </div>
        <div class="card-body">
          <div style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 1rem;">
            ${bedsHTML}
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <h3 class="card-title">Active Medico-Legal Cases (MLC)</h3>
        </div>
        <div class="card-body" style="padding: 0.75rem;">
          <div id="mlc-list" style="max-height: 120px; overflow-y: auto; font-size: 0.8rem;">
            ${state.patients.filter(p => p.history.familyHistory && p.history.familyHistory.includes('MLC')).map(p => `
              <div style="border-bottom: 1px solid var(--border-color); padding: 0.4rem 0; display: flex; justify-content: space-between;">
                <span><strong>${p.name}</strong> (${p.uhid})</span>
                <span class="badge" style="background-color: var(--color-danger-bg); color: var(--color-danger); border-radius: 4px; padding: 0.1rem 0.3rem;">MLC Tagged</span>
              </div>
            `).join('') || '<div style="color: var(--text-muted);">No active MLC cases registered today.</div>'}
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Forms and Trauma Registry -->
    <div style="display: grid; grid-template-columns: 1fr 1.5fr; gap: 1.5rem;">
      <!-- Column 1: Quick Trauma Registration -->
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">Triage Quick Registration</h3>
        </div>
        <div class="card-body">
          <form id="er-quick-reg-form" onsubmit="event.preventDefault(); submitERRegistration();">
            <div class="form-group" style="margin-bottom: 0.75rem;">
              <label>Patient Name / Name Descriptor</label>
              <input type="text" id="er-name" class="form-control" placeholder="e.g. Unknown Male / Amit Kumar" required>
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; margin-bottom: 0.75rem;">
              <div class="form-group">
                <label>Age (approx)</label>
                <input type="number" id="er-age" class="form-control" placeholder="e.g. 35" required>
              </div>
              <div class="form-group">
                <label>Gender</label>
                <select id="er-gender" class="form-select">
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; margin-bottom: 0.75rem;">
              <div class="form-group">
                <label>Triage Category</label>
                <select id="er-triage" class="form-select" style="font-weight: bold;">
                  <option value="Red" style="color: var(--color-danger);">RED (Resuscitation)</option>
                  <option value="Yellow" style="color: var(--color-warning);">YELLOW (Emergent)</option>
                  <option value="Green" style="color: var(--color-success);">GREEN (Non-Urgent)</option>
                </select>
              </div>
              <div class="form-group">
                <label>Allot ER Bed</label>
                <select id="er-bed-select" class="form-select">
                  <option value="">Awaiting Bed...</option>
                  ${emgBeds.filter(b => state.bedsStatus[b].status === 'Available').map(b => `<option value="${b}">${b}</option>`).join('')}
                </select>
              </div>
            </div>

            <div class="form-group" style="margin-bottom: 0.75rem;">
              <label>Chief Complaint / Injury Details</label>
              <textarea id="er-complaint" class="form-control" rows="2" placeholder="Describe trauma or clinical condition..." required></textarea>
            </div>

            <!-- MLC Fields -->
            <div style="background-color: var(--bg-surface-elevated); padding: 0.75rem; border-radius: 6px; margin-bottom: 1rem;">
              <label style="font-weight: 600; display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
                <input type="checkbox" id="er-mlc-chk" onchange="toggleMlcFields(this.checked)"> Medico-Legal Case (MLC)
              </label>
              <div id="er-mlc-fields" style="display: none; gap: 0.5rem; grid-template-columns: 1fr 1fr;">
                <input type="text" id="er-police-station" class="form-control" placeholder="Police Station" style="font-size: 0.75rem; padding: 0.25rem;">
                <input type="text" id="er-mlc-no" class="form-control" placeholder="MLC Diary No." style="font-size: 0.75rem; padding: 0.25rem;">
              </div>
            </div>

            <button type="submit" class="btn btn-primary" style="width: 100%;">Onboard Emergency Patient</button>
          </form>
        </div>
      </div>

      <!-- Column 2: Emergency Room Active Roster -->
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">Active Emergency Ward Roster</h3>
        </div>
        <div class="card-body">
          <table class="custom-table" style="font-size: 0.85rem;">
            <thead>
              <tr>
                <th>Bed</th>
                <th>Patient Details</th>
                <th>Triage/MLC</th>
                <th>Complaint</th>
                <th style="text-align: right;">Action</th>
              </tr>
            </thead>
            <tbody>
              ${state.admissions.filter(a => a.ward === 'EMERGENCY' && a.status === 'Active').map(adm => {
                const pat = state.patients.find(p => p.uhid === adm.uhid);
                const isMlc = pat && pat.history.familyHistory && pat.history.familyHistory.includes('MLC');
                return `
                  <tr>
                    <td><strong>${adm.bed}</strong></td>
                    <td>
                      <div style="font-weight:600;"><a href="#patients?uhid=${adm.uhid}" class="patient-link">${adm.patientName}</a></div>
                      <div style="font-size:0.75rem; color:var(--text-muted);">${adm.uhid}</div>
                    </td>
                    <td>
                      <span class="badge bg-danger" style="color: #fff; padding: 0.15rem 0.35rem; font-size: 0.7rem; border-radius: 4px; display: inline-block;">RED</span>
                      ${isMlc ? `<span class="badge bg-dark" style="color: #fff; padding: 0.15rem 0.35rem; font-size: 0.7rem; border-radius: 4px; display: inline-block;">MLC</span>` : ''}
                    </td>
                    <td><div style="max-width:180px; text-overflow:ellipsis; overflow:hidden; white-space:nowrap;">${adm.diagnosis}</div></td>
                    <td style="text-align: right; display:flex; gap:0.25rem; justify-content:flex-end;">
                      <button class="btn btn-secondary" style="padding: 0.2rem 0.5rem; font-size: 0.75rem;" onclick="router.navigate('emr?uhid=${adm.uhid}')">EMR</button>
                      <button class="btn btn-primary" style="padding: 0.2rem 0.5rem; font-size: 0.75rem;" onclick="router.navigate('ipdAdmission?uhid=${adm.uhid}&from_er=true')">Convert IPD</button>
                      <button class="btn btn-danger" style="padding: 0.2rem 0.5rem; font-size: 0.75rem;" onclick="releaseEmergencyBed('${adm.bed}')">Discharge</button>
                    </td>
                  </tr>
                `;
              }).join('') || '<tr><td colspan="5" style="text-align: center; color: var(--text-muted);">No active patients in Emergency Ward.</td></tr>'}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}

window.toggleMlcFields = function(checked) {
  const fields = document.getElementById('er-mlc-fields');
  fields.style.display = checked ? 'grid' : 'none';
};

window.submitERRegistration = function() {
  const name = document.getElementById('er-name').value;
  const age = parseInt(document.getElementById('er-age').value);
  const gender = document.getElementById('er-gender').value;
  const triage = document.getElementById('er-triage').value;
  const bedId = document.getElementById('er-bed-select').value;
  const complaint = document.getElementById('er-complaint').value;
  const isMlc = document.getElementById('er-mlc-chk').checked;

  const uhid = "UHID" + String(20000000 + state.patients.length + 1);
  const abha = "9100-" + String(1000 + state.patients.length).match(/.{1,4}/g).join('-');

  // Create Patient Record
  const newPatient = {
    uhid: uhid,
    abhaId: abha,
    name: name,
    age: age,
    gender: gender,
    mobile: "+91 99999 99999",
    address: "Brought Dead / Emergency Trauma, Bengaluru",
    bloodGroup: "O+",
    allergies: isMlc ? "MLC Registered" : "No Known Allergies",
    emergencyContact: { name: "Brought by Police/Bystanders", relation: "Unknown", phone: "" },
    payer: "Cash Tariff",
    payerType: "Direct",
    sponsor: "Self",
    primaryConsultant: "Dr. Anil Gargi",
    department: "Emergency Medicine",
    status: bedId ? "Admitted" : "Registered",
    vitals: { bp: "110/70", hr: 95, temp: 98.6, spo2: 95, weight: 65, bmi: 22 },
    clinicalData: {
      complaint: complaint,
      hpi: `Patient presented to Emergency Room with Chief Complaint of ${complaint}.`,
      examination: "Triage Evaluation: Critical. Heart Rate: 95, BP: 110/70.",
      diagnosis: `Emergency Trauma Case (${triage})`,
      treatmentPlan: "Stabilization, IV fluids, basic diagnostics, specialist review.",
      carePlan: "Bedrest, continuous cardiac monitoring."
    },
    prescriptions: [],
    history: {
      pastConditions: "Unknown",
      surgeries: "Unknown",
      familyHistory: isMlc ? `MLC Case - PS: ${document.getElementById('er-police-station').value}, Diary: ${document.getElementById('er-mlc-no').value}` : "None"
    }
  };

  state.patients.push(newPatient);

  // Allot Bed if selected
  if (bedId) {
    state.bedsStatus[bedId] = {
      wardKey: 'EMERGENCY',
      status: 'Occupied',
      patientUhid: uhid,
      notes: `Triage Level ${triage}: ${complaint}`
    };

    state.admissions.push({
      id: "ADM" + String(5000 + state.admissions.length + 1),
      uhid: uhid,
      patientName: name,
      date: "2026-06-17",
      ward: "EMERGENCY",
      bed: bedId,
      doctorName: "Dr. Anil Gargi",
      diagnosis: `Trauma (${triage}) - ${complaint}`,
      status: "Active"
    });
  }

  alert(`Emergency Patient onboarded successfully. UHID: ${uhid}`);
  renderEmergencyView(document.getElementById('main-content'));
};

window.releaseEmergencyBed = function(bedId) {
  const statusObj = state.bedsStatus[bedId];
  if (statusObj && confirm(`Discharge and release emergency bed ${bedId}?`)) {
    const patientUhid = statusObj.patientUhid;

    // Set active admission to discharged
    const admission = state.admissions.find(a => a.uhid === patientUhid && a.status === 'Active');
    if (admission) {
      admission.status = 'Discharged';
    }

    // Set patient status back to registered
    const patient = state.patients.find(p => p.uhid === patientUhid);
    if (patient) {
      patient.status = 'Registered';
    }

    // Empty bed
    const prevStatus = state.bedsStatus[bedId] ? state.bedsStatus[bedId].status : 'Occupied';
    state.bedsStatus[bedId] = {
      wardKey: 'EMERGENCY',
      status: 'Available',
      patientUhid: null,
      notes: ''
    };

    // Log bed movement
    state.logBedMovement({
      patientId: patientUhid,
      bedId: bedId,
      wardKey: 'EMERGENCY',
      prevStatus: prevStatus,
      newStatus: 'Available',
      action: 'Emergency Release',
      remarks: 'Discharged/Released from emergency care'
    });

    renderEmergencyView(document.getElementById('main-content'));
  }
};
