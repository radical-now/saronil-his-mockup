/* ==========================================================================
   SARONIL HMS - RADIOLOGY INFORMATION SYSTEM & PACS VIEWER (radView.js)
   ========================================================================== */

window.views.rad = function(container, subAnchor, params) {
  if (window.views && window.views.radDashboard) {
    window.views.radDashboard(container);
  } else {
    renderRadView(container);
  }
};

function renderRadView(container) {
  // Filter radiology orders
  const radOrders = state.orders.filter(o => o.type === 'Radiology');
  
  // Select active order
  let activeOrderId = radOrders.length > 0 ? radOrders[0].id : null;
  const activeOrder = state.orders.find(o => o.id === activeOrderId);

  container.innerHTML = `
    <div class="radiology-workspace">
      <!-- Left Column: PACS / DICOM Viewer & Reporting -->
      <div style="display: flex; flex-direction: column; gap: 1.5rem;">
        <!-- DICOM Viewer -->
        <div class="mock-dicom-viewer" id="dicom-viewer-box">
          <!-- Text overlays -->
          <div class="dicom-overlay-top-left" id="dicom-patient-overlay">
            PATIENT: ${activeOrder ? `<a href="#patients?uhid=${activeOrder.uhid}" class="patient-link" style="color: #60a5fa; text-decoration: underline;">${activeOrder.patientName}</a>` : 'No active study'}<br>
            UHID: ${activeOrder ? activeOrder.uhid : 'N/A'}<br>
            STUDY: ${activeOrder ? activeOrder.name : 'N/A'}
          </div>
          <div class="dicom-overlay-top-right">
            SARONIL SUPER SPECIALTY HOSPITAL<br>
            DEPT OF RADIODIAGNOSIS<br>
            DATE: 2026-06-17
          </div>
          
          <div class="dicom-overlay-bottom-left">
            KV: 120 | mA: 200<br>
            SLICE: 12 / 24<br>
            SERIES: 1
          </div>
          <div class="dicom-overlay-bottom-right" id="dicom-filter-overlay">
            ZOOM: 1.0x<br>
            CONTRAST: 1.2<br>
            BRIGHTNESS: 0.9
          </div>

          <!-- Stylized Chest X-Ray SVG -->
          <div id="dicom-scan-container" style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; transition: all 0.2s;">
            <svg class="dicom-image" id="dicom-svg-image" width="300" height="380" viewBox="0 0 300 380" style="filter: contrast(1.2) brightness(0.9);">
              <!-- Background -->
              <rect width="300" height="380" fill="#050508"/>
              
              <!-- Spine -->
              <rect x="146" y="20" width="8" height="340" fill="#475569" opacity="0.6"/>
              <path d="M 140,20 L 160,20 M 140,50 L 160,50 M 140,80 L 160,80 M 140,110 L 160,110 M 140,140 L 160,140 M 140,170 L 160,170 M 140,200 L 160,200 M 140,230 L 160,230 M 140,260 L 160,260 M 140,290 L 160,290 M 140,320 L 160,320 M 140,350 L 160,350" stroke="#64748b" stroke-width="3" opacity="0.5"/>
              
              <!-- Lungs -->
              <!-- Left Lung -->
              <path d="M 130,80 C 70,80 50,150 50,270 C 50,300 110,310 130,280 C 135,250 135,120 130,80 Z" fill="#0f172a" stroke="#475569" stroke-width="2" opacity="0.9"/>
              <!-- Right Lung -->
              <path d="M 170,80 C 230,80 250,150 250,270 C 250,300 190,310 170,280 C 165,250 165,120 170,80 Z" fill="#0f172a" stroke="#475569" stroke-width="2" opacity="0.9"/>

              <!-- Heart Shadow -->
              <path d="M 135,180 C 135,180 115,220 115,250 C 115,280 145,290 155,290 C 165,290 185,270 185,240 C 185,210 165,180 165,180 Z" fill="#334155" opacity="0.65" stroke="#475569" stroke-width="1.5"/>

              <!-- Clavicles -->
              <path d="M 146,55 Q 100,50 60,65" fill="none" stroke="#94a3b8" stroke-width="4" opacity="0.7"/>
              <path d="M 154,55 Q 200,50 240,65" fill="none" stroke="#94a3b8" stroke-width="4" opacity="0.7"/>

              <!-- Ribs (Left side) -->
              <path d="M 144,90 Q 95,95 65,115" fill="none" stroke="#64748b" stroke-width="3.5" opacity="0.5"/>
              <path d="M 144,120 Q 90,130 60,155" fill="none" stroke="#64748b" stroke-width="3.5" opacity="0.5"/>
              <path d="M 144,150 Q 85,165 58,195" fill="none" stroke="#64748b" stroke-width="3.5" opacity="0.5"/>
              <path d="M 144,180 Q 80,200 56,235" fill="none" stroke="#64748b" stroke-width="3.5" opacity="0.5"/>
              <path d="M 144,210 Q 80,235 56,270" fill="none" stroke="#64748b" stroke-width="3.5" opacity="0.5"/>
              
              <!-- Ribs (Right side) -->
              <path d="M 156,90 Q 205,95 235,115" fill="none" stroke="#64748b" stroke-width="3.5" opacity="0.5"/>
              <path d="M 156,120 Q 210,130 240,155" fill="none" stroke="#64748b" stroke-width="3.5" opacity="0.5"/>
              <path d="M 156,150 Q 215,165 242,195" fill="none" stroke="#64748b" stroke-width="3.5" opacity="0.5"/>
              <path d="M 156,180 Q 220,200 244,235" fill="none" stroke="#64748b" stroke-width="3.5" opacity="0.5"/>
              <path d="M 156,210 Q 220,235 244,270" fill="none" stroke="#64748b" stroke-width="3.5" opacity="0.5"/>
            </svg>
          </div>
        </div>

        <!-- PACS Manipulator toolbar -->
        <div style="display: flex; gap: 0.5rem; justify-content: center; background-color: #0f172a; padding: 0.5rem; border-radius: 8px; border: 1px solid #334155; margin-top: -1rem;">
          <button class="btn btn-secondary" onclick="adjustPACSFilter('brightness', 0.1)" style="font-size: 0.75rem; color: #fff; background: #334155; border: none;">☀️ Brighten</button>
          <button class="btn btn-secondary" onclick="adjustPACSFilter('brightness', -0.1)" style="font-size: 0.75rem; color: #fff; background: #334155; border: none;">🌙 Darken</button>
          <button class="btn btn-secondary" onclick="adjustPACSFilter('contrast', 0.1)" style="font-size: 0.75rem; color: #fff; background: #334155; border: none;">➕ Contrast</button>
          <button class="btn btn-secondary" onclick="adjustPACSFilter('contrast', -0.1)" style="font-size: 0.75rem; color: #fff; background: #334155; border: none;">➖ Contrast</button>
          <button class="btn btn-secondary" onclick="adjustPACSFilter('zoom', 0.1)" style="font-size: 0.75rem; color: #fff; background: #334155; border: none;">🔍 Zoom In</button>
          <button class="btn btn-secondary" onclick="adjustPACSFilter('invert', 1)" style="font-size: 0.75rem; color: #fff; background: #334155; border: none;">🔄 Invert</button>
          <button class="btn btn-danger" onclick="resetPACSFilters()" style="font-size: 0.75rem; border: none;">Reset</button>
        </div>

        <!-- Findings / Report Form -->
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">Radiology Diagnostics Reporting</h3>
          </div>
          <div class="card-body">
            <div class="form-group" style="margin-bottom: 1rem;">
              <label>Findings & Clinical Impression</label>
              <textarea id="rad-findings-input" class="form-control" rows="4" placeholder="Type diagnostic scan findings here...">${activeOrder && activeOrder.result ? activeOrder.result : 'LUNG FIELDS: Normal chest radiograph. Both lungs are clear and expanded. No focal consolodation, pleural effusion or pneumothorax is seen. HEART SHADOW: Heart size is within normal limits. BONY THORAX: Normal rib structures. IMPRESSION: Normal chest radiograph study.'}</textarea>
            </div>
            <button class="btn btn-primary" onclick="submitRadiologyReport('${activeOrder ? activeOrder.id : ''}')">Verify and Release Scan Report</button>
          </div>
        </div>
      </div>

      <!-- Right Column: RIS Order Queue -->
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">RIS Schedule & Scan Queue</h3>
        </div>
        <div class="card-body">
          <table class="custom-table" style="font-size: 0.85rem;">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Patient Name</th>
                <th>Scan Type</th>
                <th>Status</th>
                <th style="text-align: right;">Action</th>
              </tr>
            </thead>
            <tbody>
              ${radOrders.map(order => {
                let badgeColor = '';
                if (order.status === 'Approved') {
                  badgeColor = 'var(--color-success)';
                } else if (order.status === 'Result Entered') {
                  badgeColor = 'var(--color-purple)';
                } else {
                  badgeColor = 'var(--text-muted)';
                }

                return `
                  <tr style="cursor: pointer;" onclick="selectRadOrder('${order.id}')">
                    <td><strong>${order.id}</strong></td>
                      <td>
                        <div style="font-weight:600;"><a href="#patients?uhid=${order.uhid}" class="patient-link" onclick="event.stopPropagation();">${order.patientName}</a></div>
                      <div style="font-size:0.75rem; color:var(--text-muted);">${order.uhid}</div>
                    </td>
                    <td>${order.name}</td>
                    <td><strong style="color: ${badgeColor}; font-size: 0.7rem; text-transform: uppercase;">${order.status}</strong></td>
                    <td style="text-align: right;">
                      <button class="btn btn-secondary" style="padding: 0.2rem 0.5rem; font-size: 0.75rem;">Load Scan</button>
                    </td>
                  </tr>
                `;
              }).join('') || '<tr><td colspan="5" style="text-align: center; color: var(--text-muted);">No radiology orders scheduled.</td></tr>'}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}

// PACS parameters
let pacsFilters = {
  brightness: 0.9,
  contrast: 1.2,
  zoom: 1.0,
  invert: false
};

window.adjustPACSFilter = function(filter, delta) {
  const img = document.getElementById('dicom-svg-image');
  const container = document.getElementById('dicom-scan-container');
  const overlay = document.getElementById('dicom-filter-overlay');

  if (filter === 'brightness') {
    pacsFilters.brightness = Math.max(0.2, Math.min(2.0, pacsFilters.brightness + delta));
  } else if (filter === 'contrast') {
    pacsFilters.contrast = Math.max(0.2, Math.min(3.0, pacsFilters.contrast + delta));
  } else if (filter === 'zoom') {
    pacsFilters.zoom = Math.max(0.5, Math.min(3.0, pacsFilters.zoom + delta));
  } else if (filter === 'invert') {
    pacsFilters.invert = !pacsFilters.invert;
  }

  // Update styles
  img.style.filter = `contrast(${pacsFilters.contrast}) brightness(${pacsFilters.brightness}) ${pacsFilters.invert ? 'invert(1)' : ''}`;
  container.style.transform = `scale(${pacsFilters.zoom})`;

  // Update overlay text
  overlay.innerHTML = `
    ZOOM: ${pacsFilters.zoom.toFixed(1)}x<br>
    CONTRAST: ${pacsFilters.contrast.toFixed(1)}<br>
    BRIGHTNESS: ${pacsFilters.brightness.toFixed(1)}<br>
    INVERTED: ${pacsFilters.invert ? 'YES' : 'NO'}
  `;
};

window.resetPACSFilters = function() {
  pacsFilters = { brightness: 0.9, contrast: 1.2, zoom: 1.0, invert: false };
  adjustPACSFilter('', 0); // Trigger update
};

window.selectRadOrder = function(orderId) {
  const order = state.orders.find(o => o.id === orderId);
  if (!order) return;

  // Update overlays
  document.getElementById('dicom-patient-overlay').innerHTML = `
    PATIENT: <a href="#patients?uhid=${order.uhid}" class="patient-link" style="color: #60a5fa; text-decoration: underline;">${order.patientName}</a><br>
    UHID: ${order.uhid}<br>
    STUDY: ${order.name}
  `;

  // Update findings box
  const findingsInput = document.getElementById('rad-findings-input');
  findingsInput.value = order.result || `STUDY: ${order.name}\nLUNG FIELDS: Both lungs are clear and expanded. Normal hilar shadows.\nHEART SHADOW: Heart size is normal.\nIMPRESSION: Normal radiodiagnostic study findings.`;

  // Update the Verify button onclick action
  const verifyBtn = document.querySelector('button[onclick^="submitRadiologyReport"]');
  verifyBtn.setAttribute('onclick', `submitRadiologyReport('${orderId}')`);

  resetPACSFilters();
};

window.submitRadiologyReport = function(orderId) {
  if (!orderId) {
    alert('No active scan selected.');
    return;
  }
  
  const order = state.orders.find(o => o.id === orderId);
  const findings = document.getElementById('rad-findings-input').value;

  if (order) {
    order.status = 'Approved';
    order.result = findings;

    // Write to patient EMR
    const patient = state.patients.find(p => p.uhid === order.uhid);
    if (patient) {
      patient.clinicalData.examination += `\n[Radiology Scan: ${order.name} - ${findings}]`;
    }

    alert(`Radiology Diagnostic Scan report signed and released to UHID: ${order.uhid}.`);
    renderRadView(document.getElementById('main-content'));
  }
};
