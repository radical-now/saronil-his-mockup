/* ==========================================================================
   SARONIL HMS - HOSPITAL SUPPORT SERVICES VIEW (supportViews.js)
   ========================================================================== */

window.views.support = function(container, subAnchor, params) {
  renderSupportWorkspace(container, subAnchor || 'cssd');
};

function renderSupportWorkspace(container, activeTab) {
  container.innerHTML = `
    <!-- Tab Navigation Headers -->
    <div style="display: flex; gap: 0.5rem; background-color: var(--bg-surface); padding: 0.5rem; border-radius: 8px; border: 1px solid var(--border-color); margin-bottom: 1.5rem; flex-wrap: wrap;">
      <button class="btn ${activeTab === 'cssd' ? 'btn-primary' : 'btn-secondary'}" onclick="router.navigate('support-cssd')">🧼 CSSD Sterilization</button>
      <button class="btn ${activeTab === 'diet' ? 'btn-primary' : 'btn-secondary'}" onclick="router.navigate('support-diet')">🍏 Diet & Nutrition</button>
      <button class="btn ${activeTab === 'equipment' ? 'btn-primary' : 'btn-secondary'}" onclick="router.navigate('support-equipment')">🛠️ Equipment & PM</button>
      <button class="btn ${activeTab === 'laundry' ? 'btn-primary' : 'btn-secondary'}" onclick="router.navigate('support-laundry')">🧺 Laundry & Linen</button>
    </div>

    <!-- Active Support Module viewport -->
    <div id="support-sub-viewport">
      <!-- Renders dynamically based on tab -->
    </div>
  `;

  const subViewport = document.getElementById('support-sub-viewport');
  
  if (activeTab === 'cssd') {
    renderCSSDTab(subViewport);
  } else if (activeTab === 'diet') {
    renderDietTab(subViewport);
  } else if (activeTab === 'equipment') {
    renderEquipmentTab(subViewport);
  } else if (activeTab === 'laundry') {
    renderLaundryTab(subViewport);
  }
}

// --------------------------------------------------------------------------
// CSSD TAB
// --------------------------------------------------------------------------
function renderCSSDTab(container) {
  container.innerHTML = `
    <div style="display: grid; grid-template-columns: 1fr 2fr; gap: 1.5rem;">
      <div class="card">
        <div class="card-header"><h3 class="card-title">Log Autoclave Load</h3></div>
        <div class="card-body">
          <form onsubmit="event.preventDefault(); submitCSSDBatch();">
            <div class="form-group" style="margin-bottom: 0.75rem;">
              <label>Sterilization Machine</label>
              <select id="cssd-machine" class="form-select">
                <option value="Autoclave-01 (Pre-Vac)">Autoclave-01 (Pre-Vac)</option>
                <option value="Autoclave-02 (Gravity)">Autoclave-02 (Gravity)</option>
                <option value="Plasma Sterilizer ETO">Plasma Sterilizer ETO</option>
              </select>
            </div>
            <div class="form-group" style="margin-bottom: 0.75rem;">
              <label>Linen / Instrument Load Type</label>
              <input type="text" id="cssd-load" class="form-control" placeholder="e.g. Ortho Kit B / Surgical Gowns" required>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; margin-bottom: 1rem;">
              <div class="form-group">
                <label>Cycle Temp (°C)</label>
                <input type="number" id="cssd-temp" class="form-control" value="134" required>
              </div>
              <div class="form-group">
                <label>Cycle Time (min)</label>
                <input type="number" id="cssd-time" class="form-control" value="30" required>
              </div>
            </div>
            <button type="submit" class="btn btn-primary" style="width: 100%;">Initialize Sterilization</button>
          </form>
        </div>
      </div>

      <div class="card">
        <div class="card-header"><h3 class="card-title">CSSD Batch Worklist</h3></div>
        <div class="card-body">
          <table class="custom-table" style="font-size: 0.85rem;">
            <thead>
              <tr>
                <th>Cycle ID</th>
                <th>Machine</th>
                <th>Load Details</th>
                <th>Parameters</th>
                <th>Status</th>
                <th style="text-align: right;">Action</th>
              </tr>
            </thead>
            <tbody>
              ${state.cssdLogs.map(batch => `
                <tr>
                  <td><strong>${batch.id}</strong></td>
                  <td>${batch.machine}</td>
                  <td>${batch.loadType}</td>
                  <td>${batch.temp}°C / ${batch.time}m</td>
                  <td>
                    <strong style="color: ${batch.status === 'Sterile' ? 'var(--color-success)' : 'var(--color-warning)'};">
                      ${batch.status}
                    </strong>
                  </td>
                  <td style="text-align: right;">
                    ${batch.status === 'In Progress' ? `
                      <button class="btn btn-success" style="padding: 0.2rem 0.5rem; font-size: 0.75rem;" onclick="releaseCSSDBatch('${batch.id}')">Release Sterile</button>
                    ` : `
                      <span style="font-size: 0.8rem; color: var(--text-muted);">Released</span>
                    `}
                  </td>
                </tr>
              `).join('') || '<tr><td colspan="6" style="text-align: center; color: var(--text-muted);">No active sterilization loads logged.</td></tr>'}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}

window.submitCSSDBatch = function() {
  const machine = document.getElementById('cssd-machine').value;
  const loadType = document.getElementById('cssd-load').value;
  const temp = parseInt(document.getElementById('cssd-temp').value);
  const time = parseInt(document.getElementById('cssd-time').value);

  state.cssdLogs.push({
    id: "CSSD" + String(1000 + state.cssdLogs.length + 1),
    machine,
    loadType,
    temp,
    time,
    status: 'In Progress'
  });

  alert('Sterilization cycle initiated. Autoclave heating...');
  renderSupportWorkspace(document.getElementById('main-content'), 'cssd');
};

window.releaseCSSDBatch = function(batchId) {
  const batch = state.cssdLogs.find(b => b.id === batchId);
  if (batch) {
    batch.status = 'Sterile';
    alert(`Autoclave Cycle completed. Load verified sterile and released to OT/Wards.`);
    renderSupportWorkspace(document.getElementById('main-content'), 'cssd');
  }
};

// --------------------------------------------------------------------------
// DIET TAB
// --------------------------------------------------------------------------
function renderDietTab(container) {
  // Filter admitted patients
  const inpatients = state.patients.filter(p => p.status === 'Admitted');

  container.innerHTML = `
    <div class="card">
      <div class="card-header">
        <div>
          <h3 class="card-title">Inpatient Diet Chart Roster</h3>
          <p class="card-subtitle">Assign and modify meal plans based on diabetic, cardiac, or renal clinical requirements</p>
        </div>
      </div>
      <div class="card-body">
        <table class="custom-table" style="font-size: 0.85rem;">
          <thead>
            <tr>
              <th>Patient Details</th>
              <th>Ward / Bed</th>
              <th>Diagnosis</th>
              <th>Diet Plan</th>
              <th>Breakfast Schedule</th>
              <th>Lunch Schedule</th>
              <th style="text-align: right;">Modify Plan</th>
            </tr>
          </thead>
          <tbody>
            ${inpatients.map(pat => {
              const admission = state.admissions.find(a => a.uhid === pat.uhid && a.status === 'Active');
              const dietType = pat.clinicalData.carePlan.includes('Diet') 
                ? pat.clinicalData.carePlan.split('Diet')[0].replace('Follow ', '').trim() + ' Diet'
                : 'Regular Diet';

              return `
                <tr>
                  <td>
                    <div style="font-weight:600; color:var(--text-primary);">${pat.name}</div>
                    <div style="font-size:0.75rem; color:var(--text-muted);">${pat.uhid}</div>
                  </td>
                  <td>${admission ? `${admission.ward.replace('-WARD', '')} / ${admission.bed}` : 'IPD Pending'}</td>
                  <td>${pat.clinicalData.diagnosis}</td>
                  <td><strong style="color: var(--primary);">${dietType}</strong></td>
                  <td>Standard (Oatmeal, Milk)</td>
                  <td>Standard (Rice, Dal, Veg)</td>
                  <td style="text-align: right;">
                    <select class="form-select" style="font-size: 0.75rem; padding: 0.2rem; width: 140px; display: inline-block;" onchange="updatePatientDiet('${pat.uhid}', this.value)">
                      <option value="Regular Diet" ${dietType.includes('Regular') ? 'selected' : ''}>Regular Diet</option>
                      <option value="Low Sodium Diet" ${dietType.includes('Low Sodium') ? 'selected' : ''}>Low Sodium</option>
                      <option value="Diabetic Diet" ${dietType.includes('Diabetic') ? 'selected' : ''}>Diabetic Diet</option>
                      <option value="Renal Diet" ${dietType.includes('Renal') ? 'selected' : ''}>Renal Diet</option>
                      <option value="Liquid Diet" ${dietType.includes('Liquid') ? 'selected' : ''}>Clear Liquid</option>
                    </select>
                  </td>
                </tr>
              `;
            }).join('') || '<tr><td colspan="7" style="text-align: center; color: var(--text-muted);">No admitted inpatients found.</td></tr>'}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

window.updatePatientDiet = function(uhid, newDiet) {
  const patient = state.patients.find(p => p.uhid === uhid);
  if (patient) {
    patient.clinicalData.carePlan = `Follow ${newDiet}. Daily walking for 30 minutes. Monitor blood pressure charts.`;
    alert(`Diet plan for ${patient.name} updated to: ${newDiet}. Diet kitchen notified.`);
    renderSupportWorkspace(document.getElementById('main-content'), 'diet');
  }
};

// --------------------------------------------------------------------------
// EQUIPMENT TAB
// --------------------------------------------------------------------------
function renderEquipmentTab(container) {
  container.innerHTML = `
    <div style="display: grid; grid-template-columns: 1fr 2fr; gap: 1.5rem;">
      <!-- Maintenance Log Form -->
      <div class="card">
        <div class="card-header"><h3 class="card-title">Log Maintenance Ticket</h3></div>
        <div class="card-body">
          <form onsubmit="event.preventDefault(); submitMaintenanceTicket();">
            <div class="form-group" style="margin-bottom: 0.75rem;">
              <label>Select Bio-Medical Equipment</label>
              <select id="eq-code" class="form-select">
                ${state.equipment.map(eq => `<option value="${eq.code}">${eq.name} (${eq.code}) - ${eq.location}</option>`).join('')}
              </select>
            </div>
            <div class="form-group" style="margin-bottom: 0.75rem;">
              <label>Defect Description</label>
              <textarea id="eq-defect" class="form-control" rows="3" placeholder="Describe mechanical or software failure..." required></textarea>
            </div>
            <div class="form-group" style="margin-bottom: 1rem;">
              <label>Priority</label>
              <select id="eq-priority" class="form-select">
                <option value="Medium">Medium (Preventative)</option>
                <option value="High">High (Disrupted service)</option>
                <option value="Critical">Critical (OT / ICU block)</option>
              </select>
            </div>
            <button type="submit" class="btn btn-primary" style="width: 100%;">Log Service Ticket</button>
          </form>
        </div>
      </div>

      <!-- Equipment & Complaints list -->
      <div style="display: flex; flex-direction: column; gap: 1.5rem;">
        <div class="card">
          <div class="card-header"><h3 class="card-title">Bio-Medical Assets Inventory</h3></div>
          <div class="card-body" style="padding: 0.75rem;">
            <table class="custom-table" style="font-size: 0.8rem;">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Equipment Name</th>
                  <th>Location</th>
                  <th>Calibration Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                ${state.equipment.map(eq => `
                  <tr>
                    <td><code>${eq.code}</code></td>
                    <td><strong>${eq.name}</strong></td>
                    <td>${eq.location}</td>
                    <td>${eq.lastCalib}</td>
                    <td>
                      <strong style="color: ${eq.status === 'Active' ? 'var(--color-success)' : 'var(--color-danger)'};">
                        ${eq.status}
                      </strong>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>

        <div class="card">
          <div class="card-header"><h3 class="card-title">Active Repair Complaints</h3></div>
          <div class="card-body" style="padding: 0.75rem;">
            <table class="custom-table" style="font-size: 0.8rem;">
              <thead>
                <tr>
                  <th>Ticket ID</th>
                  <th>Equipment</th>
                  <th>Defect</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th style="text-align: right;">Action</th>
                </tr>
              </thead>
              <tbody>
                ${state.maintenanceComplaints.map(tkt => `
                  <tr>
                    <td><strong>${tkt.id}</strong></td>
                    <td>${tkt.eqCode}</td>
                    <td>${tkt.description}</td>
                    <td><strong style="color: ${tkt.priority === 'Critical' ? 'var(--color-danger)' : 'var(--text-secondary)'};">${tkt.priority}</strong></td>
                    <td><span style="color: var(--color-warning); font-weight:600;">${tkt.status}</span></td>
                    <td style="text-align: right;">
                      <button class="btn btn-success" style="padding: 0.2rem 0.4rem; font-size: 0.75rem;" onclick="closeRepairTicket('${tkt.id}')">Resolve & Calibrate</button>
                    </td>
                  </tr>
                `).join('') || '<tr><td colspan="6" style="text-align: center; color: var(--text-muted);">No active repair tickets.</td></tr>'}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  `;
}

window.submitMaintenanceTicket = function() {
  const eqCode = document.getElementById('eq-code').value;
  const description = document.getElementById('eq-defect').value;
  const priority = document.getElementById('eq-priority').value;

  // Set equipment status to Under Repair
  const eq = state.equipment.find(e => e.code === eqCode);
  if (eq) eq.status = 'Under Repair';

  state.maintenanceComplaints.push({
    id: "TKT" + String(3000 + state.maintenanceComplaints.length + 1),
    eqCode,
    description,
    priority,
    status: 'Scheduled'
  });

  alert('Complaint ticket logged. Assigned to Bio-Medical Engineer.');
  renderSupportWorkspace(document.getElementById('main-content'), 'equipment');
};

window.closeRepairTicket = function(ticketId) {
  const tkt = state.maintenanceComplaints.find(t => t.id === ticketId);
  if (tkt) {
    // Restore equipment status
    const eq = state.equipment.find(e => e.code === tkt.eqCode);
    if (eq) {
      eq.status = 'Active';
      eq.lastCalib = "2026-06-17"; // Set calib to today
    }

    // Remove complaint
    const idx = state.maintenanceComplaints.indexOf(tkt);
    state.maintenanceComplaints.splice(idx, 1);

    alert(`Ticket ${ticketId} resolved. Calibration tag updated to active.`);
    renderSupportWorkspace(document.getElementById('main-content'), 'equipment');
  }
};

// --------------------------------------------------------------------------
// LAUNDRY TAB
// --------------------------------------------------------------------------
function renderLaundryTab(container) {
  container.innerHTML = `
    <div style="display: grid; grid-template-columns: 1fr 2fr; gap: 1.5rem;">
      <div class="card">
        <div class="card-header"><h3 class="card-title">Send Linen to Laundry</h3></div>
        <div class="card-body">
          <form onsubmit="event.preventDefault(); submitLaundryBatch();">
            <div class="form-group" style="margin-bottom: 0.75rem;">
              <label>Sheets Quantity</label>
              <input type="number" id="la-sheets" class="form-control" value="50" min="1" required>
            </div>
            <div class="form-group" style="margin-bottom: 1rem;">
              <label>Gowns Quantity</label>
              <input type="number" id="la-gowns" class="form-control" value="20" min="1" required>
            </div>
            <button type="submit" class="btn btn-primary" style="width: 100%;">Dispatch Laundry Batch</button>
          </form>
        </div>
      </div>

      <div class="card">
        <div class="card-header"><h3 class="card-title">Linen Batch Washlogs</h3></div>
        <div class="card-body">
          <table class="custom-table" style="font-size: 0.85rem;">
            <thead>
              <tr>
                <th>Batch ID</th>
                <th>Bed Sheets</th>
                <th>Patient Gowns</th>
                <th>Dispatched Date</th>
                <th>Status</th>
                <th style="text-align: right;">Action</th>
              </tr>
            </thead>
            <tbody>
              ${state.laundryBatches.map(batch => `
                <tr>
                  <td><strong>${batch.id}</strong></td>
                  <td>${batch.sheets} units</td>
                  <td>${batch.gowns} units</td>
                  <td>${batch.sentDate}</td>
                  <td>
                    <strong style="color: ${batch.status === 'Cleaned' ? 'var(--color-success)' : 'var(--color-warning)'};">
                      ${batch.status}
                    </strong>
                  </td>
                  <td style="text-align: right;">
                    ${batch.status === 'Washing' ? `
                      <button class="btn btn-success" style="padding: 0.2rem 0.5rem; font-size: 0.75rem;" onclick="receiveLaundryBatch('${batch.id}')">Log Cleaned & Received</button>
                    ` : `
                      <span style="font-size: 0.8rem; color: var(--text-muted);">Stocked in Store</span>
                    `}
                  </td>
                </tr>
              `).join('') || '<tr><td colspan="6" style="text-align: center; color: var(--text-muted);">No laundry records found.</td></tr>'}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}

window.submitLaundryBatch = function() {
  const sheets = parseInt(document.getElementById('la-sheets').value);
  const gowns = parseInt(document.getElementById('la-gowns').value);

  // Deduct from clean stores
  const storeSheets = state.inventory.stores.find(i => i.code === 'ST-004');
  if (storeSheets) storeSheets.stock = Math.max(0, storeSheets.stock - sheets);

  state.laundryBatches.push({
    id: "LA" + String(5000 + state.laundryBatches.length + 1),
    sheets,
    gowns,
    sentDate: "2026-06-17",
    status: 'Washing'
  });

  alert('Laundry bundle dispatched to external wash vendors.');
  renderSupportWorkspace(document.getElementById('main-content'), 'laundry');
};

window.receiveLaundryBatch = function(batchId) {
  const batch = state.laundryBatches.find(b => b.id === batchId);
  if (batch) {
    batch.status = 'Cleaned';

    // Credit stores
    const storeSheets = state.inventory.stores.find(i => i.code === 'ST-004');
    if (storeSheets) storeSheets.stock += batch.sheets;

    alert(`Clean laundry bundle received. ${batch.sheets} sheets credited back to Stores inventory.`);
    renderSupportWorkspace(document.getElementById('main-content'), 'laundry');
  }
};
