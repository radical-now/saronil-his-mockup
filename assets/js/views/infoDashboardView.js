// Information & Enquiry Dashboard
// Saronil Health HIS — Fully Interactive Information & Enquiry Desk Module
// Matches data-target="dashboard-information"

(function() {
  'use strict';

  // Local View States
  var searchQuery = '';
  var selectedSearchUhid = '';
  var isAmbulancePanelOpen = false;
  var isPassFormOpen = false;
  var isLogFormOpen = false;
  var isDirectoryExpanded = false;

  // Initialize and seed states
  function initInfoState() {
    if (!window.state) window.state = {};
    
    // Seed 4 sample patients for Col 1
    if (!window.state.infoPatients) {
      window.state.infoPatients = [
        { name: "Rajesh Kumar", uhid: "SH-2026-04821", ward: "General Ward (Male)", bed: "GW(M)-409", doctor: "Dr. Srinivasan", dept: "General Medicine", age: 45, gender: "Male", condition: "Stable", lastUpdated: "9m ago", phoneExt: "Ext: 4091" },
        { name: "Priya Menon", uhid: "SH-2026-04803", ward: "Private Room", bed: "PVT-201", doctor: "Dr. Krishnamurthy", dept: "Psychiatry", age: 24, gender: "Female", condition: "Stable", lastUpdated: "45m ago", phoneExt: "Ext: 2011" },
        { name: "Mohammed Iqbal", uhid: "SH-2026-04799", ward: "Critical Care Unit", bed: "CCU-BED-01", doctor: "Dr. Mehta", dept: "Surgery", age: 55, gender: "Male", condition: "Critical", lastUpdated: "4m ago", phoneExt: "Ext: 8011" },
        { name: "Sunita Sharma", uhid: "SH-2026-04817", ward: "ICU", bed: "ICU-BED-03", doctor: "Dr. Anand", dept: "Cardiology", age: 68, gender: "Female", condition: "Serious", lastUpdated: "12m ago", phoneExt: "Ext: 8031" }
      ];
    }

    // Seed Active Visitor Passes
    window.state.activeVisitorPasses = window.state.activeVisitorPasses || [
      { passNo: "VP-2901", patientName: "Ramesh Kumar", ward: "ICU", bed: "ICU-BED-02", attenderName: "Aalok Kumar", relationship: "Brother", expiry: "06:30 PM", issuedTime: "02:15 PM", issuedBy: "Ananya R." },
      { passNo: "VP-2902", patientName: "Sunita Devi", ward: "ICU", bed: "ICU-BED-05", attenderName: "Madan Devi", relationship: "Husband", expiry: "07:00 PM", issuedTime: "03:10 PM", issuedBy: "Ananya R." }
    ];

    // Seed Expired Visitor Passes
    window.state.expiredVisitorPasses = window.state.expiredVisitorPasses || [
      { passNo: "VP-2895", patientName: "Karan Malhotra", ward: "General Ward", bed: "GW-101", attenderName: "Rajesh Malhotra", relationship: "Father", expiry: "04:00 PM", issuedTime: "12:00 PM", issuedBy: "Ananya R.", status: "EXPIRED" }
    ];

    // Seed Enquiry Log
    window.state.infoQueriesLog = window.state.infoQueriesLog || [
      { time: "14:32", type: "Patient Location", details: "Family asking for Rajesh Kumar", ref: "SH-2026-04821", status: "✓" },
      { time: "14:18", type: "Visitor Pass", details: "VP-2901 issued for ICU-BED-02", ref: "SH-2026-04799", status: "✓" },
      { time: "14:05", type: "Billing Query", details: "Relative asking about final bill status", ref: "SH-2026-04817", status: "Referred to Billing" },
      { time: "13:52", type: "Doctor Availability", details: "Is Dr. Mehta available today?", ref: "—", status: "✓" },
      { time: "13:41", type: "Ambulance Request", details: "Relative needs ambulance for discharge", ref: "—", status: "Referred to Reception" },
      { time: "13:30", type: "Complaint", details: "Long wait at OPD, no token given", ref: "—", status: "Ticket raised" }
    ];
  }

  // Inject module specific style sheet
  function injectInfoStyles() {
    if (document.getElementById('info-styles-v4')) return;
    const style = document.createElement('style');
    style.id = 'info-styles-v4';
    style.textContent = `
      .info-wrap { display: flex; flex-direction: column; gap: 16px; font-family: 'Outfit', 'Inter', sans-serif; color: #1e293b; }
      .info-grid { display: grid; grid-template-columns: 38% 32% 30%; gap: 16px; align-items: start; }
      @media(max-width: 1024px) { .info-grid { grid-template-columns: 1fr; } }
      
      .info-card { background: #fff; border: 1.5px solid #e2e8f0; border-radius: 10px; padding: 14px; box-shadow: 0 1px 3px rgba(0,0,0,0.02); transition: all 0.2s; }
      .info-card:hover { border-color: #cbd5e1; }
      
      .info-badge { font-size: 0.65rem; font-weight: 700; text-transform: uppercase; padding: 2px 6px; border-radius: 4px; display: inline-block; }
      .info-badge.stable { background-color: #dcfce7; color: #15803d; border: 1px solid #bbf7d0; }
      .info-badge.critical { background-color: #fee2e2; color: #b91c1c; border: 1px solid #fca5a5; }
      .info-badge.serious { background-color: #fef3c7; color: #b45309; border: 1px solid #fde68a; }
      .info-badge.guarded { background-color: #fef3c7; color: #b45309; border: 1px solid #fde68a; }
      .info-badge.discharged { background-color: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; }
      
      .suggestive-dropdown { position: absolute; top: 100%; left: 0; right: 0; background: #fff; border: 1.5px solid #cbd5e1; border-radius: 6px; box-shadow: 0 8px 16px rgba(0,0,0,0.1); z-index: 100; max-height: 200px; overflow-y: auto; margin-top: 4px; }
      .suggestive-item { padding: 8px 12px; font-size: 0.75rem; cursor: pointer; border-bottom: 1px solid #f1f5f9; display: flex; justify-content: space-between; }
      .suggestive-item:hover { background: #f8fafc; }
      .suggestive-item strong { color: #1e3a8a; }

      .tbl-compact { width: 100%; border-collapse: collapse; font-size: 0.72rem; }
      .tbl-compact th { text-align: left; padding: 6px 8px; border-bottom: 1px solid #e2e8f0; color: #475569; font-weight: 700; }
      .tbl-compact td { padding: 8px; border-bottom: 1px solid #f1f5f9; vertical-align: middle; }

      .indicator-dot { height: 7px; width: 7px; border-radius: 50%; display: inline-block; margin-right: 6px; }
      .indicator-dot.green { background-color: #10b981; }
      .indicator-dot.orange { background-color: #f59e0b; }
      .indicator-dot.red { background-color: #ef4444; }
    `;
    document.head.appendChild(style);
  }

  // Active SPA View Mount
  window.views.informationDashboard = function(container) {
    initInfoState();
    injectInfoStyles();
    renderInfoDashboard(container);
  };

  function renderInfoDashboard(container) {
    container.innerHTML = `
      <div class="info-wrap">
        <!-- PAGE HEADER -->
        <div style="display:flex; justify-content:space-between; align-items:center; background:#fff; border:1px solid #cbd5e1; padding:12px 20px; border-radius:10px;">
          <div>
            <h1 style="font-size: 1.35rem; font-weight: 800; color: #1e3a8a; margin: 0;">Information &amp; Enquiry Desk</h1>
            <div style="font-size: 0.78rem; color: #64748b; margin-top: 2px; font-weight: 600;">Patient Location · Visitor Passes · OPD Schedule · Wayfinding</div>
          </div>
          
          <div style="display:flex; align-items:center; gap:16px;">
            <div style="display:flex; flex-direction:column; align-items:flex-end;">
              <span style="font-size: 0.72rem; background: #e2e8f0; padding: 3px 8px; border-radius: 4px; font-weight: 700; color: #334155;">
                Enquiry Executive ▾
              </span>
              <span style="font-size: 0.65rem; color: #64748b; font-weight: 700; margin-top: 2px;">Shift: Morning 08:00–16:00</span>
            </div>
          </div>
        </div>

        <!-- ZONE 1 — STAT STRIP -->
        <div class="admin-kpi-scroll-row">
          <!-- Card 1: Queries This Shift -->
          <div class="admin-kpi-card status-normal" style="cursor: default;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; width: 100%;">
              <span style="font-size: 0.72rem; font-weight: 700; text-transform: uppercase; color: var(--text-secondary);">Queries This Shift</span>
            </div>
            <div style="margin-top: 8px; margin-bottom: 8px;">
              <span class="admin-mono" style="font-size: 1.45rem; font-weight: 700; color: var(--text-primary); letter-spacing: -0.02em;">${124 + window.state.infoQueriesLog.length}</span>
              <div style="font-size: 0.72rem; color: var(--text-muted); margin-top: 2px;">Handled this shift</div>
            </div>
            <div style="display: flex; align-items: center; justify-content: space-between; margin-top: 4px; font-size: 0.72rem; border-top: 1px dashed var(--border-color); padding-top: 6px;">
              <span style="color: var(--color-success); font-weight: 600; display: flex; align-items: center; gap: 2px;">
                ▲ Active Response
              </span>
            </div>
          </div>

          <!-- Card 2: Visitor Passes Active -->
          <div class="admin-kpi-card status-normal" style="cursor: pointer; position: relative;" title="ICU: restricted to 1 visitor · General: open hours">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; width: 100%;">
              <span style="font-size: 0.72rem; font-weight: 700; text-transform: uppercase; color: var(--text-secondary);">Visitor Passes Active</span>
            </div>
            <div style="margin-top: 8px; margin-bottom: 8px;">
              <span class="admin-mono" style="font-size: 1.45rem; font-weight: 700; color: #16803d; letter-spacing: -0.02em;">${window.state.activeVisitorPasses.length} Active</span>
              <div style="font-size: 0.72rem; color: var(--text-muted); margin-top: 2px;">Hover to see ward breakdown</div>
            </div>
            <div style="display: flex; align-items: center; justify-content: space-between; margin-top: 4px; font-size: 0.72rem; border-top: 1px dashed var(--border-color); padding-top: 6px;">
              <span style="color: var(--color-success); font-weight: 600; display: flex; align-items: center; gap: 2px;">
                ▲ Compliance OK
              </span>
            </div>
          </div>

          <!-- Card 3: Vacant Beds -->
          <div class="admin-kpi-card status-normal" style="cursor: pointer;" onclick="window.scrollToBeds()">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; width: 100%;">
              <span style="font-size: 0.72rem; font-weight: 700; text-transform: uppercase; color: var(--text-secondary);">Vacant Beds</span>
            </div>
            <div style="margin-top: 8px; margin-bottom: 8px;">
              <span class="admin-mono" style="font-size: 1.45rem; font-weight: 700; color: #1d4ed8; letter-spacing: -0.02em;">18 Available</span>
              <div style="font-size: 0.72rem; color: var(--text-muted); margin-top: 2px;">Tap to see ward breakdown →</div>
            </div>
            <div style="display: flex; align-items: center; justify-content: space-between; margin-top: 4px; font-size: 0.72rem; border-top: 1px dashed var(--border-color); padding-top: 6px;">
              <span style="color: var(--color-success); font-weight: 600; display: flex; align-items: center; gap: 2px;">
                ▲ Capacity OK
              </span>
            </div>
          </div>
        </div>

        <!-- ZONE 2 — QUICK ACTIONS -->
        <div style="background:#fff; border:1px solid #cbd5e1; padding:12px; border-radius:8px; display:flex; flex-direction:column; gap:8px;">
          <div style="display:flex; gap:8px; flex-wrap:wrap;">
            <button class="btn btn-secondary btn-sm" style="font-weight:700; border-color:#cbd5e1;" onclick="window.expandVpForm()">🪪 Issue Visitor Pass</button>
            <button class="btn btn-secondary btn-sm" style="font-weight:700; border-color:#cbd5e1;" onclick="window.openDoctorLocator()">🗺 Doctor Locator</button>
            <button class="btn btn-secondary btn-sm" style="font-weight:700; border-color:#cbd5e1;" onclick="window.expandLogForm()">📋 Raise Enquiry Ticket</button>
            <button class="btn btn-secondary btn-sm" style="font-weight:700; border-color:#cbd5e1;" onclick="window.toggleAmbulancePanel()">🚑 Ambulance Status</button>
          </div>

          <!-- Ambulance Status Inline Panel -->
          ${isAmbulancePanelOpen ? `
            <div style="background:#f8fafc; border:1px solid #cbd5e1; border-radius:6px; padding:12px; display:flex; justify-content:space-between; align-items:center; margin-top:6px;">
              <div style="font-size:0.75rem; color:#334155; line-height:1.6;">
                🚙 <strong>Ambulance 1 (KA-01-AB-1234)</strong> — <span style="color:#059669; font-weight:700;">Available</span><br>
                🚙 <strong>Ambulance 2 (KA-01-AB-5678)</strong> — <span style="color:#d97706; font-weight:700;">On Call</span> · Est. return: 14:45 PM
              </div>
              <button class="btn btn-secondary btn-sm" style="padding:2px 8px; border-color:#cbd5e1; font-weight:700;" onclick="window.toggleAmbulancePanel()">Close</button>
            </div>
          ` : ''}
        </div>

        <!-- ZONE 3 — MAIN CONTENT (3-COLUMN GRID) -->
        <div class="info-grid">
          <!-- COLUMN 1: PATIENT DIRECTORY LOCATOR -->
          <div class="info-card" style="display:flex; flex-direction:column; gap:12px;">
            <div style="font-size:0.85rem; font-weight:800; color:#1e3a8a; border-bottom:1px solid #e2e8f0; padding-bottom:6px;">1. Patient Directory Locator</div>
            
            <!-- Search field with Clear button & suggest dropdown -->
            <div style="position:relative; display:flex; align-items:center;">
              <input type="text" id="info-patient-search" placeholder="Search by name, UHID, bed number, mobile..." value="${searchQuery}" onkeyup="window.searchInfoPatientSuggestive(this.value)" style="width:100%; border:1px solid #cbd5e1; border-radius:6px; padding:8px 12px; font-size:0.8rem; outline:none; background:#f8fafc;">
              ${searchQuery ? `<span style="position:absolute; right:10px; cursor:pointer; font-weight:bold; font-size:1rem; color:#94a3b8;" onclick="window.clearPatientSearch()">&times;</span>` : ''}
              
              <!-- Suggestive drop overlay -->
              <div class="suggestive-dropdown" id="suggestive-dropdown-list" style="display:none;"></div>
            </div>

            <!-- Patient details list cards -->
            <div style="display:flex; flex-direction:column; gap:10px;">
              ${renderCol1PatientCards()}
            </div>
          </div>

          <!-- COLUMN 2: VISITOR PASSES & VISITING HOURS -->
          <div class="info-card" style="display:flex; flex-direction:column; gap:14px;">
            <div style="font-size:0.85rem; font-weight:800; color:#1e3a8a; border-bottom:1px solid #e2e8f0; padding-bottom:6px;">2. Visitor Passes &amp; Visiting Hours</div>
            
            <!-- 2A: Visiting Hours Today (Always Visible) -->
            <div style="background:#f8fafc; border:1px solid #cbd5e1; border-radius:8px; padding:12px; position:relative;">
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                <span style="font-size:0.7rem; font-weight:800; color:#475569; text-transform:uppercase;">Visiting Hours — Today</span>
                <button class="btn btn-secondary btn-sm" style="padding:2px 6px; font-size:9px; border-color:#cbd5e1; font-weight:700;" onclick="window.infoToast('Printing Visiting Hours Brochure...')">🖨️ Print Hours</button>
              </div>
              <table class="tbl-compact">
                <thead>
                  <tr>
                    <th>Ward</th>
                    <th>Timings</th>
                    <th>Policy</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td>ICU / CCU</td><td>4:00–5:00 PM only</td><td>1 visitor. ID required.</td></tr>
                  <tr><td>HDU</td><td>11 AM–12 PM · 5–6 PM</td><td>1 visitor.</td></tr>
                  <tr><td>General Ward</td><td>10 AM–12 PM · 4–7 PM</td><td>2 visitors max.</td></tr>
                  <tr><td>Private Rooms</td><td>Open (6 AM–10 PM)</td><td>Family only.</td></tr>
                  <tr><td>Paediatric</td><td>10 AM–1 PM · 4–7 PM</td><td>Parents only.</td></tr>
                </tbody>
              </table>
            </div>

            <!-- 2B: Active Passes List -->
            <div>
              <div style="font-size:0.72rem; font-weight:800; color:#475569; text-transform:uppercase; margin-bottom:8px;">Active Visitor Passes (${window.state.activeVisitorPasses.length})</div>
              <div style="display:flex; flex-direction:column; gap:10px;">
                ${renderActivePassCards()}
              </div>
            </div>

            <!-- Expired Passes list below -->
            ${window.state.expiredVisitorPasses.length > 0 ? `
              <div>
                <div style="font-size:0.65rem; font-weight:700; color:#94a3b8; text-transform:uppercase; margin-bottom:6px;">Recently Expired passes</div>
                <div style="display:flex; flex-direction:column; gap:6px; opacity:0.6;">
                  ${window.state.expiredVisitorPasses.map(v => `
                    <div style="border:1px solid #cbd5e1; border-radius:6px; padding:8px 10px; background:#f8fafc; font-size:0.7rem; position:relative;">
                      <div style="display:flex; justify-content:space-between; font-weight:700;">
                        <span>${v.passNo}</span>
                        <span style="color:#ef4444; font-size:8px; border:1px solid #fca5a5; background:#fee2e2; border-radius:3px; padding:1px 4px;">EXPIRED</span>
                      </div>
                      <div style="margin-top:2px;">${v.attenderName} (${v.relationship}) - Visiting: ${v.patientName}</div>
                    </div>
                  `).join('')}
                </div>
              </div>
            ` : ''}

            <!-- 2C: Collapsible Pass Form -->
            ${isPassFormOpen ? `
              <div style="background:#f8fafc; border:1px solid #3b82f6; border-radius:8px; padding:14px; display:flex; flex-direction:column; gap:10px;">
                <div style="font-size:0.75rem; font-weight:800; color:#1d4ed8; text-transform:uppercase;">+ Issue New Pass</div>
                <div class="form-field" style="display:flex; flex-direction:column; gap:2px;">
                  <label style="font-size:0.65rem; font-weight:700; color:#64748b;">PATIENT SELECT</label>
                  <select id="pform-uhid" style="padding:6px; font-size:0.75rem; background:#fff; border:1px solid #cbd5e1; border-radius:4px;">
                    ${window.state.infoPatients.map(p => `<option value="${p.uhid}">${p.name} (${p.uhid})</option>`).join('')}
                  </select>
                </div>
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px;">
                  <div class="form-field" style="display:flex; flex-direction:column; gap:2px;">
                    <label style="font-size:0.65rem; font-weight:700; color:#64748b;">VISITOR NAME</label>
                    <input type="text" id="pform-name" placeholder="Name" value="Kunal Sen" style="padding:6px; font-size:0.75rem;">
                  </div>
                  <div class="form-field" style="display:flex; flex-direction:column; gap:2px;">
                    <label style="font-size:0.65rem; font-weight:700; color:#64748b;">RELATION</label>
                    <input type="text" id="pform-rel" placeholder="Relation" value="Friend" style="padding:6px; font-size:0.75rem;">
                  </div>
                </div>
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px;">
                  <div class="form-field" style="display:flex; flex-direction:column; gap:2px;">
                    <label style="font-size:0.65rem; font-weight:700; color:#64748b;">MOBILE</label>
                    <input type="tel" id="pform-mobile" placeholder="Mobile" value="9876541203" style="padding:6px; font-size:0.75rem;">
                  </div>
                  <div class="form-field" style="display:flex; flex-direction:column; gap:2px;">
                    <label style="font-size:0.65rem; font-weight:700; color:#64748b;">VALID UNTIL</label>
                    <input type="text" id="pform-expiry" value="08:00 PM" style="padding:6px; font-size:0.75rem;">
                  </div>
                </div>
                <div style="display:grid; grid-template-columns:1fr 1.2fr; gap:8px;">
                  <div class="form-field" style="display:flex; flex-direction:column; gap:2px;">
                    <label style="font-size:0.65rem; font-weight:700; color:#64748b;">ID TYPE</label>
                    <select id="pform-idtype" style="padding:6px; font-size:0.75rem; background:#fff; border:1px solid #cbd5e1; border-radius:4px;">
                      <option value="Aadhaar">Aadhaar Card</option>
                      <option value="Voter ID">Voter ID</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div class="form-field" style="display:flex; flex-direction:column; gap:2px;">
                    <label style="font-size:0.65rem; font-weight:700; color:#64748b;">ID NUMBER</label>
                    <input type="text" id="pform-idnum" placeholder="ID Number" value="2304 9081 1234" style="padding:6px; font-size:0.75rem;">
                  </div>
                </div>
                <div style="display:flex; justify-content:flex-end; gap:6px; margin-top:4px;">
                  <button class="btn btn-secondary btn-sm" onclick="window.cancelPassForm()">Cancel</button>
                  <button class="btn btn-primary btn-sm" style="background:#1d4ed8; border:none;" onclick="window.submitPassForm()">Issue Pass</button>
                </div>
              </div>
            ` : `<button class="btn btn-secondary btn-sm" style="font-weight:700; width:100%; border-color:#cbd5e1;" onclick="window.expandVpForm()">+ Issue New Pass</button>`}
          </div>

          <!-- COLUMN 3: LIVE INFO PANEL -->
          <div class="info-card" id="beds-section" style="display:flex; flex-direction:column; gap:16px;">
            <div style="font-size:0.85rem; font-weight:800; color:#1e3a8a; border-bottom:1px solid #e2e8f0; padding-bottom:6px;">3. Live Information</div>
            
            <!-- 3A: Bed Pool Vacancy -->
            <div>
              <div style="font-size:0.72rem; font-weight:800; color:#475569; text-transform:uppercase; margin-bottom:8px;">Bed Pool Vacancy</div>
              <table class="tbl-compact">
                <thead>
                  <tr>
                    <th>Ward Type</th>
                    <th>Available</th>
                    <th>Total</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td>ICU</td><td><strong>1</strong></td><td>10</td><td><span class="indicator-dot red"></span> <span style="font-weight:700; color:#b91c1c;">Critical</span></td></tr>
                  <tr><td>HDU</td><td><strong>2</strong></td><td>8</td><td><span class="indicator-dot orange"></span> <span style="font-weight:700; color:#ea580c;">Low</span></td></tr>
                  <tr><td>Single Private</td><td><strong>4</strong></td><td>15</td><td><span class="indicator-dot green"></span> <span style="font-weight:700; color:#16803d;">Available</span></td></tr>
                  <tr><td>Twin Deluxe</td><td><strong>3</strong></td><td>20</td><td><span class="indicator-dot green"></span> <span style="font-weight:700; color:#16803d;">Available</span></td></tr>
                  <tr><td>Gen Ward (Male)</td><td><strong>3</strong></td><td>30</td><td><span class="indicator-dot green"></span> <span style="font-weight:700; color:#16803d;">Available</span></td></tr>
                  <tr><td>Gen Ward (Female)</td><td><strong>9</strong></td><td>30</td><td><span class="indicator-dot green"></span> <span style="font-weight:700; color:#16803d;">Available</span></td></tr>
                </tbody>
              </table>
              <div style="font-size:0.65rem; color:#94a3b8; font-style:italic; margin-top:6px;">
                Bed info updated every 10 min. For admission, contact Admission Desk.
              </div>
            </div>

            <!-- 3B: OPD Doctor Schedule Today -->
            <div>
              <div style="font-size:0.72rem; font-weight:800; color:#475569; text-transform:uppercase; margin-bottom:8px; display:flex; justify-content:space-between; align-items:center;">
                <span>OPD Today</span>
                <span style="font-size:10px; color:#2563eb; cursor:pointer;" onclick="window.infoToast('Loading full OPD schedule roster...')">View full schedule →</span>
              </div>
              <div style="display:flex; flex-direction:column; gap:6px; font-size:0.72rem;">
                <div style="display:flex; justify-content:space-between; border-bottom:1px solid #f1f5f9; padding-bottom:4px;">
                  <div><strong>Dr. Srinivasan</strong><br><span style="color:#64748b;">Gen. Medicine · OPD-3</span></div>
                  <div>09:00 – 01:00 PM <span style="color:#059669; font-weight:bold; margin-left:4px;">🟢 Seeing</span></div>
                </div>
                <div style="display:flex; justify-content:space-between; border-bottom:1px solid #f1f5f9; padding-bottom:4px;">
                  <div><strong>Dr. Krishnamurthy</strong><br><span style="color:#64748b;">Psychiatry · OPD-7</span></div>
                  <div style="color:#64748b;">10:00 – 12:00 PM <span style="color:#475569; font-weight:bold; margin-left:4px;">🔴 Done</span></div>
                </div>
                <div style="display:flex; justify-content:space-between; border-bottom:1px solid #f1f5f9; padding-bottom:4px;">
                  <div><strong>Dr. Priya Nair</strong><br><span style="color:#64748b;">Gynaecology · OPD-5</span></div>
                  <div>02:00 – 05:00 PM <span style="color:#d97706; font-weight:bold; margin-left:4px;">🟡 2 PM</span></div>
                </div>
                <div style="display:flex; justify-content:space-between; border-bottom:1px solid #f1f5f9; padding-bottom:4px;">
                  <div><strong>Dr. Anand</strong><br><span style="color:#64748b;">Cardiology · OPD-2</span></div>
                  <div style="color:#64748b;">09:00 – 12:00 PM <span style="color:#475569; font-weight:bold; margin-left:4px;">🔴 Done</span></div>
                </div>
                <div style="display:flex; justify-content:space-between; padding-bottom:4px;">
                  <div><strong>Dr. Ramesh Iyer</strong><br><span style="color:#64748b;">Orthopaedics · OPD-4</span></div>
                  <div>03:00 – 06:00 PM <span style="color:#d97706; font-weight:bold; margin-left:4px;">🟡 3 PM</span></div>
                </div>
              </div>
            </div>

            <!-- 3C: Discharge Pending Today -->
            <div>
              <div style="font-size:0.72rem; font-weight:800; color:#475569; text-transform:uppercase; margin-bottom:8px; display:flex; justify-content:space-between; align-items:center;">
                <span>Expected Discharges Today</span>
                <span style="font-size:10px; color:#2563eb; cursor:pointer;" onclick="window.infoToast('Redirecting to IPD discharges timeline...')">View all discharges →</span>
              </div>
              <div style="display:flex; flex-direction:column; gap:6px; font-size:0.72rem;">
                <div style="border:1px solid #e2e8f0; border-radius:6px; padding:8px; background:#fff;">
                  <div style="display:flex; justify-content:space-between; font-weight:700;">
                    <span>Rajesh Kumar (GW(M)-409)</span>
                    <span style="color:#d97706; background:#fef3c7; border:1px solid #fde68a; border-radius:3px; padding:1px 3px; font-size:8px;">Billing Pending</span>
                  </div>
                  <div style="color:#64748b; font-size:0.65rem; margin-top:2px;">Doc: Dr. Srinivasan · Est: 03:00 PM</div>
                </div>
                <div style="border:1px solid #e2e8f0; border-radius:6px; padding:8px; background:#fff;">
                  <div style="display:flex; justify-content:space-between; font-weight:700;">
                    <span>Lakshmi Devi (PVT-201)</span>
                    <span style="color:#15803d; background:#dcfce7; border:1px solid #bbf7d0; border-radius:3px; padding:1px 3px; font-size:8px;">Ready</span>
                  </div>
                  <div style="color:#64748b; font-size:0.65rem; margin-top:2px;">Doc: Dr. Priya Nair · Est: 04:30 PM</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- ZONE 4 — ENQUIRY LOG -->
        <div class="info-card" style="display:flex; flex-direction:column; gap:12px;">
          <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #e2e8f0; padding-bottom:6px;">
            <strong style="font-size:0.85rem; color:#1e3a8a;">4. Enquiry Log — This Shift</strong>
            <button class="btn btn-secondary btn-sm" style="font-weight:700; border-color:#cbd5e1;" onclick="window.expandLogForm()">+ Log New Enquiry</button>
          </div>

          <!-- Collapsible New Enquiry Form -->
          ${isLogFormOpen ? `
            <div style="background:#f8fafc; border:1px solid #cbd5e1; border-radius:8px; padding:16px; margin-bottom:10px; display:flex; flex-direction:column; gap:12px;">
              <div style="font-size:0.75rem; font-weight:800; color:#334155; text-transform:uppercase;">Log New Enquiry Query</div>
              <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
                <div class="form-field" style="display:flex; flex-direction:column; gap:2px;">
                  <label style="font-size:0.65rem; font-weight:700; color:#64748b;">QUERY TYPE</label>
                  <select id="lform-type" style="padding:6px; font-size:0.75rem; background:#fff; border:1px solid #cbd5e1; border-radius:4px;">
                    <option value="Patient Location">Patient Location</option>
                    <option value="Visitor Pass">Visitor Pass</option>
                    <option value="Billing Query">Billing Query</option>
                    <option value="Doctor Availability">Doctor Availability</option>
                    <option value="Bed Enquiry">Bed Enquiry</option>
                    <option value="Ambulance">Ambulance</option>
                    <option value="Complaint">Complaint</option>
                    <option value="General">General</option>
                  </select>
                </div>
                <div class="form-field" style="display:flex; flex-direction:column; gap:2px;">
                  <label style="font-size:0.65rem; font-weight:700; color:#64748b;">PATIENT REF (UHID/Optional)</label>
                  <input type="text" id="lform-ref" placeholder="e.g. SH-2026-04821" value="SH-2026-04821" style="padding:6px; font-size:0.75rem;">
                </div>
              </div>
              <div class="form-field" style="display:flex; flex-direction:column; gap:2px;">
                <label style="font-size:0.65rem; font-weight:700; color:#64748b;">QUERY DETAILS</label>
                <input type="text" id="lform-details" placeholder="Visitor questions" value="Relative asking for ward timing schedule card" style="padding:6px; font-size:0.75rem;">
              </div>
              <div class="form-field" style="display:flex; flex-direction:column; gap:2px;">
                <label style="font-size:0.65rem; font-weight:700; color:#64748b;">RESOLUTION / ACTION</label>
                <input type="text" id="lform-res" placeholder="e.g. Shared brochure / Referred" value="Shared timings brochure" style="padding:6px; font-size:0.75rem;">
              </div>
              <div style="display:flex; justify-content:flex-end; gap:8px;">
                <button class="btn btn-secondary btn-sm" onclick="window.cancelLogForm()">Cancel</button>
                <button class="btn btn-primary btn-sm" style="background:#1e3a8a; border:none;" onclick="window.submitLogForm()">Save Log Entry</button>
              </div>
            </div>
          ` : ''}

          <table class="tbl-compact">
            <thead>
              <tr style="background:#f8fafc;">
                <th>Time</th>
                <th>Query Type</th>
                <th>Details</th>
                <th>Patient/Ref</th>
                <th>Resolved Status</th>
                <th style="text-align:right;">Action</th>
              </tr>
            </thead>
            <tbody>
              ${window.state.infoQueriesLog.map((log, idx) => `
                <tr>
                  <td class="mono">${log.time}</td>
                  <td><span class="info-badge standard" style="background:#f1f5f9; color:#475569; font-size:9px;">${log.type}</span></td>
                  <td>${log.details}</td>
                  <td class="mono">${log.ref}</td>
                  <td>
                    ${log.status === '✓' ? 
                      `<span style="color:#059669; font-weight:bold;">✓ Resolved</span>` : 
                      `<span style="color:#b45309; font-weight:bold;">${log.status}</span>`
                    }
                  </td>
                  <td style="text-align:right;">
                    <button class="btn btn-secondary btn-sm" style="padding:2px 6px; font-size:10px;" onclick="window.infoToast('Details: ${log.details}')">View</button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <!-- HOSPITAL DIRECTORY & WAYFINDING (COLLAPSIBLE bottom of page) -->
        <div class="info-card" style="display:flex; flex-direction:column; gap:10px;">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <button class="btn btn-secondary" style="font-weight:700; border-color:#cbd5e1; display:flex; align-items:center; gap:6px;" onclick="window.toggleDirectory()">
              🗺 Hospital Directory &amp; Wayfinding ${isDirectoryExpanded ? '▴' : '▾'}
            </button>
            ${isDirectoryExpanded ? `<button class="btn btn-secondary btn-sm" style="font-weight:700; border-color:#cbd5e1;" onclick="window.infoToast('Printing directory map...')">🖨️ Print Directory</button>` : ''}
          </div>

          ${isDirectoryExpanded ? `
            <div style="display:grid; grid-template-columns: repeat(3, 1fr); gap:16px; padding:12px; background:#f8fafc; border-radius:8px; border:1px solid #e2e8f0; font-size:0.75rem; line-height:1.6;">
              <div>
                <strong style="color:#1e3a8a; text-transform:uppercase; font-size:0.7rem;">Ground Floor</strong>
                <ul style="padding-left:14px; margin:4px 0 0 0; display:flex; flex-direction:column; gap:2px;">
                  <li>Emergency / Casualty  →  Left wing entrance</li>
                  <li>Reception / Admission  →  Straight ahead</li>
                  <li>OPD Block  →  Right wing rooms OPD-1 to OPD-10</li>
                  <li>Pharmacy (Retail)  →  OPD corridor</li>
                  <li>Laboratory  →  East wing</li>
                  <li>Radiology  →  East wing adjacent to Lab</li>
                  <li>Billing / Cashier  →  Main entrance</li>
                  <li>Canteen &amp; ATM  →  West wing lobby</li>
                </ul>
              </div>
              <div>
                <strong style="color:#1e3a8a; text-transform:uppercase; font-size:0.7rem;">First Floor</strong>
                <ul style="padding-left:14px; margin:4px 0 0 0; display:flex; flex-direction:column; gap:2px;">
                  <li>General Ward (Male)  →  North wing</li>
                  <li>General Ward (Female)  →  South wing</li>
                  <li>Paediatric Ward  →  East wing</li>
                </ul>
              </div>
              <div>
                <strong style="color:#1e3a8a; text-transform:uppercase; font-size:0.7rem;">Second &amp; Third Floors</strong>
                <ul style="padding-left:14px; margin:4px 0 0 0; display:flex; flex-direction:column; gap:2px;">
                  <li>Private Rooms  →  Second floor, all wings</li>
                  <li>Twin Deluxe Rooms  →  Second floor, north wing</li>
                  <li>ICU / CCU / HDU  →  Third floor, restricted access</li>
                  <li>Operation Theatres  →  Third floor, restricted access</li>
                </ul>
              </div>
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }

  // Suggestive search dropdown logic (>=2 chars)
  window.searchInfoPatientSuggestive = function(val) {
    searchQuery = val;
    const listDiv = document.getElementById('suggestive-dropdown-list');
    
    // Rerender search input with close cross indicator dynamically
    renderInfoDashboard(document.getElementById('main-content'));
    
    // Focus search box back
    const searchInput = document.getElementById('info-patient-search');
    if (searchInput) {
      searchInput.focus();
      searchInput.setSelectionRange(val.length, val.length);
    }

    const dropdown = document.getElementById('suggestive-dropdown-list');
    if (!dropdown) return;

    if (val.length < 2) {
      dropdown.style.display = 'none';
      return;
    }

    var matching = (window.state.infoPatients || []).filter(p => 
      p.name.toLowerCase().includes(val.toLowerCase()) || 
      p.uhid.toLowerCase().includes(val.toLowerCase()) || 
      p.ward.toLowerCase().includes(val.toLowerCase())
    );

    if (matching.length > 0) {
      dropdown.innerHTML = matching.map(p => `
        <div class="suggestive-item" onclick="window.selectSearchPatient('${p.uhid}')">
          <span><strong>${p.name}</strong> (${p.uhid})</span>
          <span style="color:#64748b; font-weight:600;">${p.ward}</span>
        </div>
      `).join('');
      dropdown.style.display = 'block';
    } else {
      dropdown.style.display = 'none';
    }
  };

  window.selectSearchPatient = function(uhid) {
    selectedSearchUhid = uhid;
    var p = window.state.infoPatients.find(pt => pt.uhid === uhid);
    if (p) {
      searchQuery = p.name;
    }
    renderInfoDashboard(document.getElementById('main-content'));
  };

  window.clearPatientSearch = function() {
    searchQuery = '';
    selectedSearchUhid = '';
    renderInfoDashboard(document.getElementById('main-content'));
  };

  function renderCol1PatientCards() {
    var pats = window.state.infoPatients || [];
    var renderList = pats;

    if (selectedSearchUhid) {
      renderList = pats.filter(p => p.uhid === selectedSearchUhid);
    } else if (searchQuery.trim().length >= 2) {
      renderList = pats.filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        p.uhid.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    var cardsHTML = renderList.map(p => {
      var badgeClass = p.condition.toLowerCase();
      
      // Checking extensions
      var ext = p.phoneExt || "Ext: 1000";

      return `
        <div style="border:1px solid #cbd5e1; border-radius:8px; padding:14px; background:#fff; display:flex; flex-direction:column; gap:8px; box-shadow:0 1px 3px rgba(0,0,0,0.02);">
          <div style="display:flex; justify-content:space-between; align-items:flex-start;">
            <a href="javascript:void(0)" onclick="window.selectSearchPatient('${p.uhid}')" style="font-weight:700; color:#2563eb; text-decoration:none; font-size:0.85rem;">${p.name}</a>
            <span class="mono" style="font-size:0.7rem; color:#64748b; font-weight:700;">${p.uhid}</span>
          </div>
          <div style="font-size:0.75rem; color:#1e293b;">
            📍 <strong>${p.ward} — ${p.bed}</strong>
          </div>
          <div style="font-size:0.7rem; color:#475569; display:flex; justify-content:space-between; align-items:center;">
            <span>👨‍⚕️ ${p.doctor} · ${p.dept}</span>
          </div>
          <div style="font-size:0.7rem; color:#64748b; display:flex; justify-content:space-between; align-items:center;">
            <span>Age/Sex: ${p.age} · ${p.gender.slice(0, 1)}</span>
            <span>Condition: <span class="info-badge ${badgeClass}">${p.condition}</span></span>
          </div>
          <div style="display:flex; justify-content:space-between; align-items:center; border-top:1px dashed #cbd5e1; padding-top:8px; margin-top:4px;">
            <div style="display:flex; gap:6px;">
              <button class="action-pill" style="font-size:0.65rem; padding:3px 6px;" onclick="window.openVisitorPassForPatient('${p.uhid}')">🪪 Issue Pass</button>
              <button class="btn btn-secondary btn-sm" style="font-size:0.65rem; padding:2px 6px; font-weight:700; border-color:#cbd5e1;" onclick="window.simulatePatientLocationRoute('${p.bed}')">🗺️ Route</button>
              <button class="btn btn-secondary btn-sm" style="font-size:0.65rem; padding:2px 6px; font-weight:700; border-color:#cbd5e1;" onclick="window.showWardPhone('${p.uhid}', '${ext}')">📞 Ward Phone</button>
            </div>
            <span class="mono" style="font-size:9px; color:#94a3b8;">Updated ${p.lastUpdated}</span>
          </div>
          <div id="ward-phone-container-${p.uhid}" style="display:none; font-size:11px; color:#1d4ed8; font-weight:700; background:#eff6ff; padding:4px 8px; border-radius:4px; border:1px solid #bfdbfe; text-align:center;"></div>
        </div>
      `;
    }).join('');

    // If search empty, offer the unidentified patient link
    var emptyPrompt = '';
    if (renderList.length === 0) {
      emptyPrompt = `
        <div style="border: 1.5px dashed #fca5a5; border-radius:8px; padding:12px; background:#fff5f5; font-size:0.75rem; text-align:center;">
          <div style="font-weight:700; color:#9b2c2c; margin-bottom:6px;">🔍 Can't find patient?</div>
          <div style="color:#7f1d1d; margin-bottom:8px; font-size:0.7rem;">An unidentified patient may be in Emergency.</div>
          <button class="btn btn-secondary btn-sm" style="border-color:#fca5a5; color:#9b2c2c; font-weight:700; width:100%;" onclick="window.checkUnidentifiedED()">Check Emergency Unidentified Patients →</button>
        </div>
      `;
    }

    return cardsHTML + emptyPrompt;
  }

  window.simulatePatientLocationRoute = function(bed) {
    alert(`📍 ROUTING PATH TO ${bed}:\n\nTake main corridor, turn right at pharmacy, take elevator to 2nd Floor Ward Wing.`);
  };

  window.showWardPhone = function(uhid, ext) {
    const el = document.getElementById(`ward-phone-container-${uhid}`);
    if (el) {
      el.textContent = `📞 Internal Dial Line: ${ext}`;
      el.style.display = el.style.display === 'none' ? 'block' : 'none';
    }
  };

  window.checkUnidentifiedED = async function() {
    await customAlert("Opening Emergency unidentified patient list.");
    // Simulate redirection hash route
    window.location.hash = 'emergency?uhid=SH-2026-04999';
  };

  // Rendering Visitor Passes
  function renderActivePassCards() {
    var passes = window.state.activeVisitorPasses || [];
    if (passes.length === 0) {
      return `<div style="text-align:center; padding:14px; color:#94a3b8; font-style:italic; font-size:0.75rem;">No active visitor passes.</div>`;
    }

    return passes.map(v => `
      <div style="border: 1px solid #cbd5e1; border-radius:8px; padding:12px; background:#fff; font-size:0.75rem; display:flex; flex-direction:column; gap:4px; box-shadow:0 1px 3px rgba(0,0,0,0.02);">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <strong class="mono" style="color:#059669; font-weight:700;">${v.passNo}</strong>
          <span class="mono" style="color:#475569; font-size:9px; font-weight:700;">Expiry: ${v.expiry}</span>
        </div>
        <div>
          <div style="font-weight:700; color:#1e293b; font-size:0.8rem;">${v.attenderName} (${v.relationship})</div>
          <div style="color:#475569; font-size:0.7rem; margin-top:2px;">Visiting: <strong>${v.patientName}</strong> · ${v.ward} — ${v.bed}</div>
          <div style="color:#94a3b8; font-size:0.65rem; margin-top:2px;">Issued: ${v.issuedTime} · By: ${v.issuedBy}</div>
        </div>
        <div style="border-top:1px dashed #e2e8f0; padding-top:6px; margin-top:6px; display:flex; justify-content:flex-end; gap:6px;">
          <button class="btn btn-secondary btn-sm" style="padding:2px 8px; font-size:9px; border-color:#ef4444; color:#ef4444; font-weight:700;" onclick="window.checkOutVisitorPass('${v.passNo}')">Check Out</button>
          <button class="btn btn-secondary btn-sm" style="padding:2px 8px; font-size:9px; border-color:#cbd5e1; font-weight:700;" onclick="window.extendVisitorPass('${v.passNo}')">Extend</button>
        </div>
      </div>
    `).join('');
  }

  window.checkOutVisitorPass = function(passNo) {
    var pass = window.state.activeVisitorPasses.find(p => p.passNo === passNo);
    if (pass) {
      window.state.activeVisitorPasses = window.state.activeVisitorPasses.filter(p => p.passNo !== passNo);
      pass.status = 'EXPIRED';
      pass.expiry = new Date().toLocaleTimeString('en-US', {hour:'2-digit', minute:'2-digit'});
      window.state.expiredVisitorPasses.unshift(pass);
      alert(`Visitor checked out. Pass ${passNo} has been deactivated.`);
      renderInfoDashboard(document.getElementById('main-content'));
    }
  };

  window.extendVisitorPass = function(passNo) {
    var pass = window.state.activeVisitorPasses.find(p => p.passNo === passNo);
    if (pass) {
      pass.expiry = "08:30 PM"; // Simulated extension
      alert(`Pass extended by 30 min.\nNew Expiry: ${pass.expiry}`);
      renderInfoDashboard(document.getElementById('main-content'));
    }
  };

  window.expandVpForm = function() {
    isPassFormOpen = !isPassFormOpen;
    renderInfoDashboard(document.getElementById('main-content'));
  };

  window.cancelPassForm = function() {
    isPassFormOpen = false;
    renderInfoDashboard(document.getElementById('main-content'));
  };

  window.submitPassForm = function() {
    const uhid = document.getElementById('pform-uhid').value;
    const name = document.getElementById('pform-name').value.trim();
    const rel = document.getElementById('pform-rel').value.trim();
    const mobile = document.getElementById('pform-mobile').value.trim();
    const expiry = document.getElementById('pform-expiry').value.trim();
    const idtype = document.getElementById('pform-idtype').value;
    const idnum = document.getElementById('pform-idnum').value.trim();

    if (!name || !rel || !mobile) {
      alert("Name, relation and mobile contact are required.");
      return;
    }

    var p = window.state.infoPatients.find(pt => pt.uhid === uhid);
    const passNo = "VP-" + Math.floor(2910 + Math.random() * 80);

    window.state.activeVisitorPasses.unshift({
      passNo: passNo,
      patientName: p ? p.name : 'Unknown Patient',
      ward: p ? p.ward : 'General Ward',
      bed: p ? p.bed : 'GW-101',
      attenderName: name,
      relationship: rel,
      expiry: expiry,
      issuedTime: new Date().toLocaleTimeString('en-US', {hour:'2-digit', minute:'2-digit'}),
      issuedBy: "Ananya R."
    });

    alert(`Pass ${passNo} successfully issued to ${name}!`);
    isPassFormOpen = false;
    renderInfoDashboard(document.getElementById('main-content'));
  };

  // Log Enquiry forms
  window.expandLogForm = function() {
    isLogFormOpen = !isLogFormOpen;
    renderInfoDashboard(document.getElementById('main-content'));
  };

  window.cancelLogForm = function() {
    isLogFormOpen = false;
    renderInfoDashboard(document.getElementById('main-content'));
  };

  window.submitLogForm = function() {
    const type = document.getElementById('lform-type').value;
    const ref = document.getElementById('lform-ref').value.trim();
    const details = document.getElementById('lform-details').value.trim();
    const res = document.getElementById('lform-res').value.trim();

    if (!details || !res) {
      alert("Query details and resolution text are required.");
      return;
    }

    window.state.infoQueriesLog.unshift({
      time: new Date().toLocaleTimeString('en-US', {hour:'2-digit', minute:'2-digit', hour12:false}),
      type: type,
      details: details,
      ref: ref || '—',
      status: '✓'
    });

    alert("Enquiry Log updated successfully!");
    isLogFormOpen = false;
    renderInfoDashboard(document.getElementById('main-content'));
  };

  // Toggle helpers
  window.toggleAmbulancePanel = function() {
    isAmbulancePanelOpen = !isAmbulancePanelOpen;
    if (isAmbulancePanelOpen) {
      alert("Ambulance status loaded.");
    }
    renderInfoDashboard(document.getElementById('main-content'));
  };

  window.toggleDirectory = function() {
    isDirectoryExpanded = !isDirectoryExpanded;
    renderInfoDashboard(document.getElementById('main-content'));
  };

  window.infoToast = function(msg) {
    alert(`[Enquiry Desk] Printing queue: ${msg}`);
  };

  window.scrollToBeds = function() {
    const el = document.getElementById('beds-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

})();
