/* ==========================================================================
   SARONIL HMS - BLOOD BANK REGISTRY & ISSUE MODULE (bloodbankView.js)
   ========================================================================== */

window.views.bloodbank = function(container, subAnchor, params) {
  renderBloodBankView(container);
};

function renderBloodBankView(container) {
  // Compute total bags
  let totalBags = 0;
  Object.values(state.bloodStock).forEach(g => totalBags += g.bags);

  // Group cards HTML
  let groupCardsHTML = '';
  for (const [group, info] of Object.entries(state.bloodStock)) {
    const isLow = info.bags < 5;
    groupCardsHTML += `
      <div style="background-color: var(--bg-surface); border: 1px solid var(--border-color); border-radius: 8px; padding: 0.75rem; text-align: center; border-left: 4px solid ${isLow ? 'var(--color-danger)' : 'var(--color-success)'};">
        <strong style="font-size: 1.25rem; color: var(--text-primary); display: block; margin-bottom: 0.25rem;">${group}</strong>
        <div style="font-size: 0.95rem; font-weight: bold; color: ${isLow ? 'var(--color-danger)' : 'var(--text-secondary)'};">
          ${info.bags} Bags
        </div>
        <div style="font-size: 0.7rem; color: var(--text-muted); margin-top: 0.25rem;">
          RBC: ${info.components.rbc} | PLT: ${info.components.platelets} | FFP: ${info.components.ffp}
        </div>
      </div>
    `;
  }

  container.innerHTML = `
    <!-- Blood Inventory Grid -->
    <div class="card" style="margin-bottom: 1.5rem;">
      <div class="card-header" style="display: flex; justify-content: space-between; align-items: center;">
        <div>
          <h3 class="card-title">Blood Group Stocks (Whole & Components)</h3>
          <p class="card-subtitle">Real-time inventory levels of blood bags and filtered components</p>
        </div>
        <strong style="color: var(--color-danger); font-size: 1.1rem;">🩸 Total Bags: ${totalBags}</strong>
      </div>
      <div class="card-body">
        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem;">
          ${groupCardsHTML}
        </div>
      </div>
    </div>

    <!-- Split Workspace -->
    <div style="display: grid; grid-template-columns: 1fr 1.5fr; gap: 1.5rem;">
      <!-- Column 1: Issue Blood Component -->
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">Issue Blood / Component</h3>
        </div>
        <div class="card-body">
          <form id="blood-issue-form" onsubmit="event.preventDefault(); issueBloodComponent();">
            <div class="form-group" style="margin-bottom: 0.75rem;">
              <label>Select Admitted Patient</label>
              <div class="patient-search-wrapper" style="position: relative; width: 100%;">
                <input type="text" id="bl-patient-search" class="form-control" placeholder="Search patient by Name, Mobile, or UHID..." autocomplete="off" required>
                <input type="hidden" id="bl-patient-select" required>
                <div id="bl-patient-autocomplete" class="autocomplete-dropdown" style="display: none;"></div>
              </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; margin-bottom: 0.75rem;">
              <div class="form-group">
                <label>Blood Group Required</label>
                <select id="bl-group-select" class="form-select">
                  ${Object.keys(state.bloodStock).map(g => `<option value="${g}">${g}</option>`).join('')}
                </select>
              </div>
              <div class="form-group">
                <label>Component Type</label>
                <select id="bl-comp-select" class="form-select">
                  <option value="rbc">RBC (Packed Red Cells)</option>
                  <option value="platelets">Platelets (RDP/SDP)</option>
                  <option value="ffp">FFP (Fresh Frozen Plasma)</option>
                  <option value="bags">Whole Blood Bag</option>
                </select>
              </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; margin-bottom: 1rem;">
              <div class="form-group">
                <label>Quantity (Bags)</label>
                <input type="number" id="bl-qty" class="form-control" value="1" min="1" required>
              </div>
              <div class="form-group">
                <label>Service Fee (₹)</label>
                <input type="number" id="bl-fee" class="form-control" value="2500" required>
              </div>
            </div>

            <button type="submit" class="btn btn-primary" style="width: 100%;">Post Blood Bank Issue</button>
          </form>
        </div>
      </div>

      <!-- Column 2: Donors Directory & Donation Logs -->
      <div class="card">
        <div class="card-header" style="display: flex; justify-content: space-between; align-items: center;">
          <h3 class="card-title">Voluntary Blood Donors Directory</h3>
          <button class="btn btn-secondary" onclick="registerNewDonor()">+ Add Donor</button>
        </div>
        <div class="card-body">
          <table class="custom-table" style="font-size: 0.85rem;">
            <thead>
              <tr>
                <th>Donor ID</th>
                <th>Name</th>
                <th>Age / Gender</th>
                <th>Group</th>
                <th>Donated On</th>
                <th>Triage Fit</th>
                <th>Screening Info</th>
              </tr>
            </thead>
            <tbody>
              ${state.bloodDonors.map(d => `
                <tr>
                  <td><strong>${d.id}</strong></td>
                  <td>${d.name}</td>
                  <td>${d.age} Y / ${d.gender.charAt(0)}</td>
                  <td><span class="badge" style="background-color: var(--color-danger-bg); color: var(--color-danger); font-weight:bold; border-radius:4px; padding:0.1rem 0.3rem;">${d.bloodGroup}</span></td>
                  <td>${d.donationDate}</td>
                  <td><span style="color: var(--color-success); font-weight:600;">${d.fitStatus}</span></td>
                  <td><code>${d.screening}</code></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;

  // Initialize Patient Autocomplete Search
  window.setupPatientAutocomplete({
    searchInputId: 'bl-patient-search',
    hiddenInputId: 'bl-patient-select',
    autocompleteListId: 'bl-patient-autocomplete',
    filterFn: p => p.status === 'Admitted'
  });
}

window.issueBloodComponent = function() {
  const uhid = document.getElementById('bl-patient-select').value;
  const group = document.getElementById('bl-group-select').value;
  const component = document.getElementById('bl-comp-select').value;
  const qty = parseInt(document.getElementById('bl-qty').value);
  const fee = parseFloat(document.getElementById('bl-fee').value);

  const patient = state.patients.find(p => p.uhid === uhid);
  if (!patient) return;

  // ABO Blood Compatibility validation check
  const compatCheck = state.validate('Transfusion Issue', { patientUhid: uhid, bloodGroupRequired: group });
  if (compatCheck.status === 'BLOCK') {
    showHardStopModal(patient, group, compatCheck.message);
    return;
  }

  // Check Inventory availability
  const stock = state.bloodStock[group];
  let isAvailable = false;
  
  if (component === 'bags') {
    if (stock.bags >= qty) {
      stock.bags -= qty;
      isAvailable = true;
    }
  } else {
    if (stock.components[component] >= qty) {
      stock.components[component] -= qty;
      // also reduce aggregate bags
      stock.bags = Math.max(0, stock.bags - qty);
      isAvailable = true;
    }
  }

  if (!isAvailable) {
    alert(`Insufficient stock of ${group} ${component.toUpperCase()} in the blood bank inventory.`);
    return;
  }

  // Add Billing entry to patient
  let bill = state.billing.find(b => b.uhid === uhid && b.status !== 'Settled');
  if (!bill) {
    bill = {
      id: "INV" + String(8000 + state.billing.length + 1),
      uhid: uhid,
      patientName: patient.name,
      date: "2026-06-17",
      amount: 0,
      paid: 0,
      status: "Outstanding",
      items: []
    };
    state.billing.push(bill);
  }

  const billTotal = qty * fee;
  bill.items.push({
    desc: `Blood Issue: ${group} (${component.toUpperCase()}) x ${qty} Bag(s)`,
    qty: qty,
    rate: fee,
    total: billTotal
  });
  bill.amount += billTotal;

  alert(`Blood Component issued to ${patient.name}. ₹${billTotal.toLocaleString('en-IN')} service fee added to billing record.`);
  renderBloodBankView(document.getElementById('main-content'));
};

window.registerNewDonor = function() {
  const name = prompt("Enter Donor's Full Name:");
  if (!name) return;
  const age = parseInt(prompt("Enter Donor's Age (years):")) || 25;
  const gender = prompt("Enter Donor's Gender (Male/Female):") || "Male";
  const group = prompt("Enter Blood Group (A+, A-, B+, B-, O+, O-, AB+, AB-):") || "B+";

  const newDonor = {
    id: "DNR" + String(4000 + state.bloodDonors.length + 1),
    name: name,
    gender: gender,
    age: age,
    bloodGroup: group,
    donationDate: "2026-06-17",
    fitStatus: "Fit",
    screening: "Non-Reactive"
  };

  state.bloodDonors.push(newDonor);
  
  // Credit blood stock
  if (state.bloodStock[group]) {
    state.bloodStock[group].bags += 1;
    state.bloodStock[group].components.rbc += 1; // default component credit
  }

  alert(`Donor ${name} registered successfully. 1 Bag of ${group} credited to Blood Bank inventory.`);
  renderBloodBankView(document.getElementById('main-content'));
};

function showHardStopModal(patient, group, message) {
  let modal = document.getElementById('hardstop-warning-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'hardstop-warning-modal';
    modal.className = 'modal';
    document.body.appendChild(modal);
  }

  modal.innerHTML = `
    <div class="modal-content" style="max-width: 550px; border: 2px solid var(--color-danger); border-radius: var(--radius-md); box-shadow: var(--shadow-lg);">
      <div class="modal-header" style="background-color: var(--color-danger-bg); color: var(--color-danger); border-bottom: 1px solid var(--border-color); padding: 1rem; display: flex; justify-content: space-between; align-items: center;">
        <h4 style="margin: 0; display: flex; align-items: center; gap: 0.5rem; font-weight: 700;">🛑 Transfusion Blocked (JCI Hard Stop)</h4>
        <span class="modal-close" style="cursor: pointer; font-size: 1.5rem; line-height: 1;" onclick="closeHardStopModal()">&times;</span>
      </div>
      <div class="modal-body" style="padding: 1.5rem; font-size: 0.85rem; display: flex; flex-direction: column; gap: 1.25rem;">
        <div style="background-color: var(--color-danger-bg); color: var(--color-danger); padding: 0.75rem; border-radius: 6px; font-weight: bold; text-align: center; border: 1px solid rgba(239, 68, 68, 0.2);">
          ABO INCOMPATIBILITY ENCOUNTERED
        </div>
        
        <div style="background-color: var(--bg-surface-elevated); padding: 1rem; border-radius: 8px; border: 1px solid var(--border-color); display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem;">
          <div><strong>Patient Name:</strong> <a href="#patients?uhid=${patient.uhid}" class="patient-link" onclick="closeHardStopModal();">${patient.name}</a></div>
          <div><strong>UHID:</strong> ${patient.uhid}</div>
          <div><strong>Patient Blood Group:</strong> <span class="badge" style="background-color: var(--color-danger-bg); color: var(--color-danger); font-weight: bold; padding: 0.15rem 0.4rem; border-radius: 4px;">${patient.bloodGroup}</span></div>
          <div><strong>Requested Blood:</strong> <span class="badge" style="background-color: var(--text-primary); color: var(--bg-surface); font-weight: bold; padding: 0.15rem 0.4rem; border-radius: 4px;">${group}</span></div>
        </div>

        <p style="color: var(--text-secondary); line-height: 1.5; font-size: 0.9rem; margin: 0;">${message.replace('🛑 HARD STOP: ABO INCOMPATIBILITY DETECTED!\n', '')}</p>

        <div style="background-color: var(--color-warning-bg); color: #b45309; padding: 0.75rem; border-radius: 6px; border: 1px solid rgba(245, 158, 11, 0.2); font-size: 0.75rem; line-height: 1.4;">
          <strong>JCI Standard COP.5.1 Compliance:</strong> The hospital must ensure exact ABO/Rh compatibility verification prior to blood component administration to eliminate sentinel event risks.
        </div>

        <div style="display: flex; justify-content: flex-end; gap: 0.5rem; border-top: 1px solid var(--border-color); padding-top: 1rem;">
          <button class="btn btn-secondary" onclick="closeHardStopModal()">Close & Cancel Transfusion</button>
        </div>
      </div>
    </div>
  `;

  // Log hard stop incident to Alert Center for quality audit
  state.alerts.push({
    id: "ALT" + String(100 + state.alerts.length + 1),
    severity: "Hard Stop",
    source: "Blood Bank",
    patientName: patient.name,
    uhid: patient.uhid,
    details: `Transfusion safety check blocked: Attempted to issue incompatible ${group} blood to Patient with ${patient.bloodGroup} blood group.`,
    clinician: "Pathology Transfusion Staff",
    time: "2026-06-17 02:40 PM",
    status: "Active",
    eStatus: "Escalated"
  });

  modal.classList.add('active');
  modal.style.display = 'flex';
}

window.closeHardStopModal = function() {
  const modal = document.getElementById('hardstop-warning-modal');
  if (modal) {
    modal.classList.remove('active');
    modal.style.display = 'none';
  }
};
