/* ==========================================================================
   SARONIL HMS - LABORATORY INFORMATION SYSTEM (labView.js)
   ========================================================================== */

window.views.lab = function(container, subAnchor, params) {
  if (window.views && window.views.labDashboard) {
    window.views.labDashboard(container);
  } else {
    renderLabView(container);
  }
};

function renderLabView(container) {
  // Filter lab orders
  const labOrders = state.orders.filter(o => o.type === 'Laboratory');
  
  // Compute counts
  const pendingCollection = labOrders.filter(o => o.status === 'Sample Collected' || o.status === 'Ordered').length; // Wait, state seeds "Sample Collected" or "Result Entered" or "Approved"
  const pendingResults = labOrders.filter(o => o.status === 'Sample Collected').length;
  const validatedToday = labOrders.filter(o => o.status === 'Approved' || o.status === 'Result Entered').length;

  container.innerHTML = `
    <!-- Lab metrics -->
    <div class="stats-grid" style="margin-bottom: 1.5rem;">
      <div class="stat-card">
        <div class="stat-info">
          <span class="stat-label">Pending Collection</span>
          <span class="stat-value">${pendingCollection}</span>
          <span class="stat-sub">Blood / Urine / Swab</span>
        </div>
        <div class="stat-icon-wrapper" style="background-color: var(--primary-glow); color: var(--primary);">🧪</div>
      </div>
      
      <div class="stat-card">
        <div class="stat-info">
          <span class="stat-label">Awaiting Result Log</span>
          <span class="stat-value">${pendingResults}</span>
          <span class="stat-sub">Samples in analyzer</span>
        </div>
        <div class="stat-icon-wrapper" style="background-color: var(--color-warning-bg); color: var(--color-warning);">🔬</div>
      </div>

      <div class="stat-card">
        <div class="stat-info">
          <span class="stat-label">Validated Reports</span>
          <span class="stat-value">${validatedToday}</span>
          <span class="stat-sub">Sent to patient EMR</span>
        </div>
        <div class="stat-icon-wrapper" style="background-color: var(--color-success-bg); color: var(--color-success);">✅</div>
      </div>
    </div>

    <!-- Lab split workspace -->
    <div style="display: grid; grid-template-columns: 1.5fr 1fr; gap: 1.5rem;">
      <!-- Column 1: Lab Orders List -->
      <div class="card">
        <div class="card-header" style="display:flex; justify-content:space-between; align-items:center;">
          <h3 class="card-title" style="margin:0;">LIS Order Worklist</h3>
          <button class="btn btn-secondary btn-sm" style="background:#1d4ed8; color:#fff;" onclick="window.showStockRequestOverlay({dept:'Laboratory', urgency:'Routine'})">📦 Request Stock</button>
        </div>
        <div class="card-body">
          <div class="custom-table-container">
            <table class="custom-table" style="font-size: 0.85rem;">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Patient Name (UHID)</th>
                  <th>Test Name</th>
                  <th>Doctor In-charge</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th style="text-align: right;">Action</th>
                </tr>
              </thead>
              <tbody id="lab-table-body">
                ${labOrders.map(order => {
                  let badgeColor = '';
                  if (order.status === 'Approved') {
                    badgeColor = 'var(--color-success)';
                  } else if (order.status === 'Result Entered') {
                    badgeColor = 'var(--color-purple)';
                  } else if (order.status === 'Sample Collected') {
                    badgeColor = 'var(--color-warning)';
                  } else {
                    badgeColor = 'var(--text-muted)';
                  }

                  return `
                    <tr style="cursor: pointer;" onclick="openLabWorkbench('${order.id}')">
                      <td><strong>${order.id}</strong></td>
                      <td>
                        <div style="font-weight:600;"><a href="#patients?uhid=${order.uhid}" class="patient-link" onclick="event.stopPropagation();">${order.patientName}</a></div>
                        <div style="font-size:0.75rem; color:var(--text-muted);">${order.uhid}</div>
                      </td>
                      <td>${order.name}</td>
                      <td>${order.doctorName}</td>
                      <td>
                        <span style="color: ${order.priority === 'Urgent' ? 'var(--color-danger)' : 'var(--text-secondary)'}; font-weight: 500;">
                          ${order.priority}
                        </span>
                      </td>
                      <td>
                        <strong style="color: ${badgeColor}; font-size: 0.75rem; text-transform: uppercase;">
                          ${order.status}
                        </strong>
                      </td>
                      <td style="text-align: right;">
                        <button class="btn btn-secondary" style="padding: 0.2rem 0.5rem; font-size: 0.75rem;">Process</button>
                      </td>
                    </tr>
                  `;
                }).join('') || '<tr><td colspan="7" style="text-align: center; color: var(--text-muted);">No lab orders found.</td></tr>'}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Column 2: Lab Workbench details -->
      <div class="card" id="lab-workbench-panel">
        <div class="card-header">
          <h3 class="card-title">LIS Laboratory Workbench</h3>
        </div>
        <div class="card-body" style="text-align: center; color: var(--text-muted); padding: 4rem 1rem;">
          🔬 Select a specimen order from the worklist to log sample collections, enter values, or validate reports.
        </div>
      </div>
    </div>
  `;
}

window.openLabWorkbench = function(orderId) {
  const order = state.orders.find(o => o.id === orderId);
  const panel = document.getElementById('lab-workbench-panel');
  if (!order) return;

  let workspaceHTML = '';

  if (order.status === 'Sample Collected') {
    // Show Result Entry Form
    workspaceHTML = `
      <div>
        <p style="margin-bottom: 0.5rem;"><strong>Tube / Specimen Category:</strong> 💜 Purple EDTA Tube</p>
        <p style="margin-bottom: 1rem; color: var(--color-warning);">⚠️ Specimen Collected. Ready for test analysis.</p>
        
        <h5 style="margin-bottom: 0.75rem; font-size: 0.85rem; border-bottom: 1px solid var(--border-color); padding-bottom: 0.25rem;">Enter Analyzed Findings</h5>
        
        ${order.name.includes('CBC') ? `
          <div style="display: flex; flex-direction: column; gap: 0.75rem;">
            <div style="display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 0.5rem; align-items: center;">
              <span>Hemoglobin (Hb)</span>
              <input type="text" id="finding-hb" class="form-control" value="13.8" style="font-size:0.8rem; padding: 0.25rem;">
              <span style="font-size:0.75rem; color: var(--text-muted);">13.0-17.0 g/dL</span>
            </div>
            <div style="display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 0.5rem; align-items: center;">
              <span>WBC Count (TLC)</span>
              <input type="text" id="finding-wbc" class="form-control" value="7200" style="font-size:0.8rem; padding: 0.25rem;">
              <span style="font-size:0.75rem; color: var(--text-muted);">4000-11000 /uL</span>
            </div>
            <div style="display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 0.5rem; align-items: center;">
              <span>Platelet Count</span>
              <input type="text" id="finding-plt" class="form-control" value="210000" style="font-size:0.8rem; padding: 0.25rem;">
              <span style="font-size:0.75rem; color: var(--text-muted);">1.5-4.5 Lakhs</span>
            </div>
          </div>
        ` : `
          <div class="form-group" style="margin-bottom: 1rem;">
            <label>Detailed Findings / Result Text</label>
            <textarea id="finding-general" class="form-control" rows="4" style="font-size: 0.8rem;">Serum Bilirubin: 0.8 mg/dL (Normal)\nSGOT/AST: 24 U/L (Normal)\nSGPT/ALT: 28 U/L (Normal)</textarea>
          </div>
        `}
        
        <button class="btn btn-primary" style="width: 100%; margin-top: 1.5rem;" onclick="saveLabFindings('${order.id}')">Submit Lab Findings</button>
      </div>
    `;
  } else if (order.status === 'Result Entered') {
    // Show validation panel
    workspaceHTML = `
      <div>
        <p style="color: var(--color-purple); font-weight: bold; margin-bottom: 1rem;">🔬 Results logged. Awaiting Pathologist validation.</p>
        <div style="background-color: var(--bg-surface-elevated); padding: 1rem; border-radius: 6px; font-size: 0.8rem; text-align: left; margin-bottom: 1.5rem;">
          <h5 style="margin-bottom: 0.5rem; color: var(--text-primary);">Findings Log:</h5>
          <pre style="white-space: pre-wrap; font-family: inherit;">${order.result}</pre>
        </div>
        <div style="display: flex; gap: 0.75rem;">
          <button class="btn btn-secondary" style="flex: 1;" onclick="editLabFindings('${order.id}')">Edit Findings</button>
          <button class="btn btn-success" style="flex: 1;" onclick="validateLabFindings('${order.id}')">Validate Report</button>
        </div>
      </div>
    `;
  } else if (order.status === 'Approved') {
    // Approved
    workspaceHTML = `
      <div style="text-align: center; padding: 2rem 0;">
        <span style="font-size: 2.5rem; color: var(--color-success);">✅</span>
        <h5 style="margin-top: 0.5rem; color: var(--color-success); font-weight: bold;">Report Validated & Released</h5>
        <p style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 1.5rem;">Sent directly to patient's active electronic health record.</p>
        <div style="background-color: var(--bg-surface-elevated); padding: 1rem; border-radius: 6px; font-size: 0.8rem; text-align: left;">
          <p><strong>Approved Result:</strong></p>
          <pre style="white-space: pre-wrap; font-family: inherit; margin-top: 0.25rem;">${order.result}</pre>
        </div>
      </div>
    `;
  } else {
    // Ordered (Pending Sample Collection)
    workspaceHTML = `
      <div>
        <p style="color: var(--text-muted); margin-bottom: 1.5rem;">Order placed by ${order.doctorName}. Sample collection is required.</p>
        <div style="display: flex; flex-direction: column; gap: 0.75rem;">
          <button class="btn btn-primary" onclick="collectLabSample('${order.id}')">Collect Sample (EDTA / Tube)</button>
        </div>
      </div>
    `;
  }

  panel.innerHTML = `
    <div class="card-header" style="padding: 0.75rem 1rem; border-bottom: 1px solid var(--border-color);">
      <h4 style="font-size: 0.95rem;">Specimen: ${order.id}</h4>
      <p style="font-size: 0.75rem; color: var(--text-muted); margin: 0;">Patient: <a href="#patients?uhid=${order.uhid}" class="patient-link">${order.patientName}</a> (${order.uhid})</p>
    </div>
    <div class="card-body" style="padding: 1rem; font-size: 0.85rem;">
      <p style="margin-bottom: 0.75rem;"><strong>Test:</strong> ${order.name}</p>
      ${workspaceHTML}
    </div>
  `;
};

window.collectLabSample = function(orderId) {
  const order = state.orders.find(o => o.id === orderId);
  if (order) {
    order.status = 'Sample Collected';
    alert(`Specimen sample collected and logged for ${order.patientName}.`);
    openLabWorkbench(orderId);
    renderLabView(document.getElementById('main-content'));
  }
};

window.saveLabFindings = function(orderId) {
  const order = state.orders.find(o => o.id === orderId);
  if (order) {
    let resultText = '';
    if (order.name.includes('CBC')) {
      const hb = document.getElementById('finding-hb').value;
      const wbc = document.getElementById('finding-wbc').value;
      const plt = document.getElementById('finding-plt').value;
      resultText = `Hemoglobin: ${hb} g/dL, WBC Count: ${wbc} /uL, Platelet Count: ${plt} /uL`;
    } else {
      resultText = document.getElementById('finding-general').value;
    }

    order.status = 'Result Entered';
    order.result = resultText;

    alert('Findings logged. Forwarded to Pathologist for validation review.');
    openLabWorkbench(orderId);
    renderLabView(document.getElementById('main-content'));
  }
};

window.editLabFindings = function(orderId) {
  const order = state.orders.find(o => o.id === orderId);
  if (order) {
    order.status = 'Sample Collected'; // Return back to entry screen
    openLabWorkbench(orderId);
    renderLabView(document.getElementById('main-content'));
  }
};

window.validateLabFindings = function(orderId) {
  const order = state.orders.find(o => o.id === orderId);
  if (order) {
    order.status = 'Approved';
    
    // Add result to patient's clinical diagnosis notes or EMR log
    const patient = state.patients.find(p => p.uhid === order.uhid);
    if (patient) {
      patient.clinicalData.examination += `\n[Lab Report: ${order.name} - ${order.result}]`;
    }

    alert('Laboratory Report approved and signed. Document released to Patient Registry.');
    openLabWorkbench(orderId);
    renderLabView(document.getElementById('main-content'));
  }
};
