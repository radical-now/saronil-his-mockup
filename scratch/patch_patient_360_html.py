#!/usr/bin/env python3

path = "/Users/home/Desktop/Saronil IHS/Updated HIS /assets/js/views/patientsView.js"

with open(path, "r", encoding="utf-8") as f:
    src = f.read()

# Define the start and end target boundaries for the container.innerHTML string
start_target = "    container.innerHTML = `\n      ${p360Styles}\n      <div class=\"p360-wrap\">"
end_target = "            <!-- Viewport scrollable content -->\n            <div class=\"p360-viewport\">\n              ${tabContentHtml}\n            </div>\n\n          </div>\n\n        </div>\n\n      </div>\n    `;"

start_idx = src.find(start_target)
end_idx = src.find(end_target)

if start_idx == -1 or end_idx == -1:
    # Let's try matching a simpler chunk if whitespace differs
    print("ERROR: Start or end indices for HTML template block not found!")
    print(f"start_idx: {start_idx}, end_idx: {end_idx}")
    exit(1)

# Include the length of end_target in end_idx so we replace the whole block
end_idx += len(end_target)

replacement_html = """    container.innerHTML = `
      ${p360Styles}
      <div class="p360-wrap">
        
        <!-- Patient Details Header (Horizontal Card) -->
        <div class="p360-card" style="display:flex; flex-direction:column; gap:10px;">
          <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:16px;">
            
            <!-- Left Info -->
            <div style="display:flex; align-items:center; gap:12px;">
              <div class="pr-avatar" style="width:40px; height:40px; font-size:14px; font-weight:700; background:var(--primary); color:#ffffff; display:flex; align-items:center; justify-content:center; border-radius:50%;">LD</div>
              <div>
                <div style="display:flex; align-items:center; gap:8px;">
                  <h4 style="margin:0; font-size:15px; font-weight:700; color:var(--text-primary);">${patient.name}</h4>
                  <span class="badge-type badge-dc">${patient.type.toUpperCase()}</span>
                  <span class="badge-type badge-status-active">Active</span>
                </div>
                <div style="font-size:11px; color:var(--text-secondary); margin-top:2px;">
                  Age/Sex: <b>60 &bull; F</b> &bull; Blood: <b>B+</b> &bull; Mobile: <span class="mono"><b>${patient.mobile}</b></span>
                </div>
              </div>
            </div>

            <!-- Identifiers -->
            <div style="font-size:11px; display:flex; gap:16px;">
              <div>
                <span class="p360-label">UHID:</span>
                <span class="p360-val mono">${patient.uhid}</span>
              </div>
              <div>
                <span class="p360-label">Record No:</span>
                <span class="p360-val mono">${patient.uhid.replace('SH-2026', 'DC-2026')}</span>
              </div>
            </div>

            <!-- Safety flags -->
            <div style="display:flex; align-items:center; gap:6px;">
              <span class="mono" style="font-size:9px; color:var(--text-muted); font-weight:700;">SAFETY FLAGS:</span>
              <span class="flag-chip" style="background:var(--bg-surface-elevated, #f1f5f9); color:var(--text-muted); font-size:10px; margin:0; padding:2px 8px; font-weight:700; border-radius:4px;">No Known Allergy</span>
            </div>
          </div>

          <div class="p360-divider" style="margin:0;"></div>

          <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:16px; font-size:11px;">
            <!-- Admission specifics -->
            <div style="display:flex; gap:20px; flex-wrap:wrap;">
              <div><span class="p360-label">Ward/Bed:</span> <span class="p360-val mono">${patient.ward} &bull; ${patient.bed}</span></div>
              <div><span class="p360-label">Consultant:</span> <span class="p360-val">${patient.primaryConsultant}</span></div>
              <div><span class="p360-label">Admitted:</span> <span class="p360-val mono">24 Jun 2026 &bull; 10:15 AM</span></div>
              <div><span class="p360-label">LOS:</span> <span class="p360-val">Day 1 of est. 5</span></div>
              <div><span class="p360-label">Payer:</span> <span class="p360-val">${patient.payer}</span></div>
              <div><span class="p360-label">LOA:</span> <span class="p360-val mono" style="color:#059669; font-weight:700;">₹80,000 Approved ✓</span></div>
            </div>

            <!-- Activity ticker (Very compact, inline) -->
            <div style="display:flex; align-items:center; gap:8px;">
              <span class="mono" style="font-size:9px; color:var(--text-muted); font-weight:700;">LAST 12H:</span>
              <div style="font-size:11px; display:flex; gap:12px; color:var(--text-secondary);">
                <span>📊 NEWS2: <b>0</b></span>
                <span>🔬 Labs: <b>3 (1 Critical)</b></span>
                <span>💊 Meds: <b>1 New</b></span>
              </div>
            </div>
          </div>
        </div>

        <!-- Quick Actions Row (Horizontal buttons row) -->
        <div class="p360-card" style="padding:10px 16px; display:flex; align-items:center; gap:12px; flex-wrap:wrap;">
          <span class="mono" style="font-size:9px; color:var(--text-muted); font-weight:700;">QUICK ACTIONS:</span>
          ${quickActionsHtml}
        </div>

        <!-- Tab Workspace -->
        <div class="p360-right-workspace">
          
          <!-- Sticky Tab Bar row -->
          <div class="p360-tabs-bar">
            <div class="p360-tabs-list">
              ${visibleTabs.map(tName => `
                <span class="p360-tab-item ${tab === tName ? 'active' : ''}" onclick="window.prSelectWorkspaceTab('${tName}')">${tName}</span>
              `).join('')}
            </div>
            <a href="#" class="mono" style="font-size:11px; color:var(--primary);" onclick="window.router.navigate('patients')">&larr; Back to Patients</a>
          </div>

          <!-- Viewport scrollable content -->
          <div class="p360-viewport">
            ${tabContentHtml}
          </div>

        </div>

      </div>
    `;"""

patched_src = src[:start_idx] + replacement_html + src[end_idx:]

# Also let's update draw360's role action layouts to not use flex-direction:column inside quickActionsHtml
# In active role branch inside draw360() we had templates like:
# quickActionsHtml = `\n        <div class="actions-container">...`
# Let's replace the grid actions-container templates with inline ones!
patched_src = patched_src.replace(
    """    let quickActionsHtml = '';
    if (role === 'Doctor') {
      quickActionsHtml = `
        <div class="actions-container">
          <button class="btn-qa-primary" onclick="window.prTriggerAction('✏ Write Note')">✏ Write Note</button>
          <div style="display:grid; grid-template-columns: 1fr 1fr; gap: 6px;">
            <button class="btn-qa-secondary" onclick="window.prTriggerAction('💊 Prescribe')">💊 Prescribe</button>
            <button class="btn-qa-secondary" onclick="window.prTriggerAction('🔬 Order Lab')">🔬 Order Lab</button>
          </div>
          <div style="display:grid; grid-template-columns: 1fr 1fr; gap: 6px;">
            <button class="btn-qa-secondary" onclick="window.prTriggerAction('🩻 Order Radiology')">🩻 Radiology</button>
            <button class="btn-qa-secondary" onclick="window.prTriggerAction('📋 Order Diet')">📋 Order Diet</button>
          </div>
          <div style="display:grid; grid-template-columns: 1fr 1fr; gap: 6px;">
            <button class="btn-qa-ghost" onclick="window.prTriggerAction('🚪 Initiate Discharge')">🚪 Discharge</button>
            <button class="btn-qa-ghost" onclick="window.prTriggerAction('↔ Transfer')">↔ Transfer</button>
          </div>
        </div>
      `;
    } else if (role === 'Nurse') {
      quickActionsHtml = `
        <div class="actions-container">
          <button class="btn-qa-primary" onclick="window.prTriggerAction('📊 Record Vitals')">📊 Record Vitals</button>
          <div style="display:grid; grid-template-columns: 1fr 1fr; gap: 6px;">
            <button class="btn-qa-secondary" onclick="window.prTriggerAction('✅ Acknowledge Order')">✅ Ack Order</button>
            <button class="btn-qa-secondary" onclick="window.prTriggerAction('📝 Nursing Note')">📝 Nurse Note</button>
          </div>
          <div style="display:grid; grid-template-columns: 1fr 1fr; gap: 6px;">
            <button class="btn-qa-ghost" onclick="window.prTriggerAction('🤝 Shift Handover')">🤝 Handover</button>
            <button class="btn-qa-ghost" onclick="window.prTriggerAction('⚠ Report Incident')">⚠ Incident</button>
          </div>
        </div>
      `;
    } else if (role === 'Billing') {
      quickActionsHtml = `
        <div class="actions-container">
          <button class="btn-qa-primary" onclick="window.prTriggerAction('💰 View Bill')">💰 View Bill</button>
          <div style="display:grid; grid-template-columns: 1fr 1fr; gap: 6px;">
            <button class="btn-qa-secondary" onclick="window.prTriggerAction('💳 Collect Payment')">💳 Pay</button>
            <button class="btn-qa-secondary" onclick="window.prTriggerAction('📄 Generate Receipt')">📄 Receipt</button>
          </div>
          <div style="display:grid; grid-template-columns: 1fr 1fr; gap: 6px;">
            <button class="btn-qa-ghost" onclick="window.prTriggerAction('↩ Process Refund')">↩ Refund</button>
            <button class="btn-qa-ghost" onclick="window.prTriggerAction('📤 Send Bill')">📤 Send Bill</button>
          </div>
        </div>
      `;
    } else if (role === 'Admission') {
      quickActionsHtml = `
        <div class="actions-container">
          <button class="btn-qa-primary" onclick="window.prTriggerAction('🛏 Change Bed')">🛏 Change Bed</button>
          <div style="display:grid; grid-template-columns: 1fr 1fr; gap: 6px;">
            <button class="btn-qa-secondary" onclick="window.prTriggerAction('📋 Edit Admission')">📋 Edit Admission</button>
            <button class="btn-qa-secondary" onclick="window.prTriggerAction('↔ Transfer Ward')">↔ Transfer</button>
          </div>
          <button class="btn-qa-ghost" onclick="window.prTriggerAction('🚪 Initiate Discharge')">🚪 Initiate Discharge</button>
        </div>
      `;
    } else if (role === 'Pharmacy') {
      quickActionsHtml = `
        <div class="actions-container">
          <button class="btn-qa-primary" onclick="window.prTriggerAction('💊 View Prescriptions')">💊 Prescriptions</button>
          <div style="display:grid; grid-template-columns: 1fr 1fr; gap: 6px;">
            <button class="btn-qa-secondary" onclick="window.prTriggerAction('✅ Mark Dispensed')">✅ Dispense</button>
            <button class="btn-qa-secondary" onclick="window.prTriggerAction('↩ Process Return')">↩ Return</button>
          </div>
        </div>
      `;
    } else if (role === 'Front Desk') {
      quickActionsHtml = `
        <div class="actions-container">
          <button class="btn-qa-primary" onclick="window.prTriggerAction('📱 Send SMS')">📱 Send SMS</button>
          <div style="display:grid; grid-template-columns: 1fr 1fr; gap: 6px;">
            <button class="btn-qa-secondary" onclick="window.prTriggerAction('🖨 Print Summary')">🖨 Print</button>
            <button class="btn-qa-secondary" onclick="window.prTriggerAction('📅 Book Appointment')">📅 Appointment</button>
          </div>
          <button class="btn-qa-ghost" onclick="window.prTriggerAction('✏ Edit Contact Info')">✏ Edit Contact Info</button>
        </div>
      `;
    }""",
    """    let quickActionsHtml = '';
    if (role === 'Doctor') {
      quickActionsHtml = `
        <div style="display:flex; gap:6px; flex-wrap:wrap; align-items:center;">
          <button class="btn-qa-primary" onclick="window.prTriggerAction('✏ Write Note')">✏ Write Note</button>
          <button class="btn-qa-secondary" onclick="window.prTriggerAction('💊 Prescribe')">💊 Prescribe</button>
          <button class="btn-qa-secondary" onclick="window.prTriggerAction('🔬 Order Lab')">🔬 Order Lab</button>
          <button class="btn-qa-secondary" onclick="window.prTriggerAction('🩻 Order Radiology')">🩻 Radiology</button>
          <button class="btn-qa-secondary" onclick="window.prTriggerAction('📋 Order Diet')">📋 Order Diet</button>
          <button class="btn-qa-ghost" onclick="window.prTriggerAction('🚪 Initiate Discharge')">🚪 Discharge</button>
          <button class="btn-qa-ghost" onclick="window.prTriggerAction('↔ Transfer')">↔ Transfer</button>
        </div>
      `;
    } else if (role === 'Nurse') {
      quickActionsHtml = `
        <div style="display:flex; gap:6px; flex-wrap:wrap; align-items:center;">
          <button class="btn-qa-primary" onclick="window.prTriggerAction('📊 Record Vitals')">📊 Record Vitals</button>
          <button class="btn-qa-secondary" onclick="window.prTriggerAction('✅ Acknowledge Order')">✅ Ack Order</button>
          <button class="btn-qa-secondary" onclick="window.prTriggerAction('📝 Nursing Note')">📝 Nurse Note</button>
          <button class="btn-qa-ghost" onclick="window.prTriggerAction('🤝 Shift Handover')">🤝 Handover</button>
          <button class="btn-qa-ghost" onclick="window.prTriggerAction('⚠ Report Incident')">⚠ Incident</button>
        </div>
      `;
    } else if (role === 'Billing') {
      quickActionsHtml = `
        <div style="display:flex; gap:6px; flex-wrap:wrap; align-items:center;">
          <button class="btn-qa-primary" onclick="window.prTriggerAction('💰 View Bill')">💰 View Bill</button>
          <button class="btn-qa-secondary" onclick="window.prTriggerAction('💳 Collect Payment')">💳 Pay</button>
          <button class="btn-qa-secondary" onclick="window.prTriggerAction('📄 Generate Receipt')">📄 Receipt</button>
          <button class="btn-qa-ghost" onclick="window.prTriggerAction('↩ Process Refund')">↩ Refund</button>
          <button class="btn-qa-ghost" onclick="window.prTriggerAction('📤 Send Bill')">📤 Send Bill</button>
        </div>
      `;
    } else if (role === 'Admission') {
      quickActionsHtml = `
        <div style="display:flex; gap:6px; flex-wrap:wrap; align-items:center;">
          <button class="btn-qa-primary" onclick="window.prTriggerAction('🛏 Change Bed')">🛏 Change Bed</button>
          <button class="btn-qa-secondary" onclick="window.prTriggerAction('📋 Edit Admission')">📋 Edit Admission</button>
          <button class="btn-qa-secondary" onclick="window.prTriggerAction('↔ Transfer Ward')">↔ Transfer</button>
          <button class="btn-qa-ghost" onclick="window.prTriggerAction('🚪 Initiate Discharge')">🚪 Discharge</button>
        </div>
      `;
    } else if (role === 'Pharmacy') {
      quickActionsHtml = `
        <div style="display:flex; gap:6px; flex-wrap:wrap; align-items:center;">
          <button class="btn-qa-primary" onclick="window.prTriggerAction('💊 View Prescriptions')">💊 Prescriptions</button>
          <button class="btn-qa-secondary" onclick="window.prTriggerAction('✅ Mark Dispensed')">✅ Dispense</button>
          <button class="btn-qa-secondary" onclick="window.prTriggerAction('↩ Process Return')">↩ Return</button>
        </div>
      `;
    } else if (role === 'Front Desk') {
      quickActionsHtml = `
        <div style="display:flex; gap:6px; flex-wrap:wrap; align-items:center;">
          <button class="btn-qa-primary" onclick="window.prTriggerAction('📱 Send SMS')">📱 Send SMS</button>
          <button class="btn-qa-secondary" onclick="window.prTriggerAction('🖨 Print Summary')">🖨 Print</button>
          <button class="btn-qa-secondary" onclick="window.prTriggerAction('📅 Book Appointment')">📅 Appointment</button>
          <button class="btn-qa-ghost" onclick="window.prTriggerAction('✏ Edit Contact Info')">✏ Edit Contact Info</button>
        </div>
      `;
    }"""
)

# Now, let's adjust styles for single column layout.
# Target:
#       .p360-grid {
#         display: flex;
#         flex: 1;
#         gap: 16px;
#         padding: 0 16px 16px;
#         overflow: hidden;
#       }
#       
#       /* Left Column */
#       .p360-left-panel {
#         width: 270px;
#         flex-shrink: 0;
#         display: flex;
#         flex-direction: column;
#         gap: 12px;
#         overflow-y: auto;
#         padding-right: 4px;
#       }
# Let's replace this styling chunk to make it cleaner.
patched_src = patched_src.replace(
    """      /* Main Content Grid */
      .p360-grid {
        display: flex;
        flex: 1;
        gap: 16px;
        padding: 0 16px 16px;
        overflow: hidden;
      }
      
      /* Left Column */
      .p360-left-panel {
        width: 270px;
        flex-shrink: 0;
        display: flex;
        flex-direction: column;
        gap: 12px;
        overflow-y: auto;
        padding-right: 4px;
      }""",
    """      /* Grid has been replaced with stacked full-width container flow */"""
)

# Update breadcrumb / back btn styles since they are no longer in topbar but tab bar
patched_src = patched_src.replace(
    """.p360-tabs-bar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 1px solid var(--border-color, #e2e8f0);
        background: var(--bg-surface, #ffffff);
        flex-shrink: 0;
      }""",
    """.p360-tabs-bar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 1px solid var(--border-color, #e2e8f0);
        background: var(--bg-surface, #ffffff);
        flex-shrink: 0;
        padding-top: 4px;
      }"""
)

with open(path, "w", encoding="utf-8") as f:
    f.write(patched_src)

print("SUCCESS: Patients 360 layout replace completed.")
