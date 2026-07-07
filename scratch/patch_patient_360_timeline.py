#!/usr/bin/env python3

path = "/Users/home/Desktop/Saronil IHS/Updated HIS /assets/js/views/patientsView.js"

with open(path, "r", encoding="utf-8") as f:
    src = f.read()

# 1. Update initial activeTab default mapping when role changes
old_role_tab_defaults = """  const mappedRole = getCurrentPatient360Role();
  if (window.patient360Role !== mappedRole) {
    window.patient360Role = mappedRole;
    if (mappedRole === 'Doctor') window.patient360ActiveTab = 'Clinical Notes';
    else if (mappedRole === 'Nurse') window.patient360ActiveTab = 'Nursing Notes';
    else if (mappedRole === 'Billing') window.patient360ActiveTab = 'Billing';
    else if (mappedRole === 'Pharmacy') window.patient360ActiveTab = 'Medications';
    else if (mappedRole === 'Front Desk') window.patient360ActiveTab = 'Documents';
    else if (mappedRole === 'Admission') window.patient360ActiveTab = 'ATD';
  }
  
  if (window.patient360ActiveTab === undefined) {
    window.patient360ActiveTab = 'Clinical Notes';
  }"""

new_role_tab_defaults = """  const mappedRole = getCurrentPatient360Role();
  if (window.patient360Role !== mappedRole) {
    window.patient360Role = mappedRole;
    window.patient360ActiveTab = 'Summary & Timeline';
  }
  
  if (window.patient360ActiveTab === undefined) {
    window.patient360ActiveTab = 'Summary & Timeline';
  }"""

src = src.replace(old_role_tab_defaults, new_role_tab_defaults, 1)

# 2. Add Timeline styles to CSS block
old_styles_marker = "      /* SOAP Composer layout */"
new_styles = """      /* Timeline styles */
      .timeline-container {
        display: flex;
        flex-direction: column;
        gap: 16px;
        position: relative;
        padding-left: 20px;
        margin-top: 10px;
      }
      .timeline-container::before {
        content: '';
        position: absolute;
        left: 6px;
        top: 4px;
        bottom: 4px;
        width: 2px;
        background: var(--border-color, #e2e8f0);
      }
      .timeline-item {
        position: relative;
        display: flex;
        flex-direction: column;
        gap: 2px;
      }
      .timeline-dot {
        position: absolute;
        left: -20px;
        top: 2px;
        width: 12px;
        height: 12px;
        border-radius: 50%;
        background: #ffffff;
        border: 2px solid var(--primary, #2563eb);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10;
      }
      .timeline-time {
        font-size: 10px;
        font-weight: 700;
        color: var(--text-muted, #94a3b8);
        font-family: 'JetBrains Mono', monospace;
      }
      .timeline-title {
        font-size: 12px;
        font-weight: 700;
        color: var(--text-primary, #0f172a);
      }
      .timeline-desc {
        font-size: 11px;
        color: var(--text-secondary, #475569);
        line-height: 1.4;
      }

      /* SOAP Composer layout */"""

src = src.replace(old_styles_marker, new_styles, 1)

# 3. Update visibleTabs to include 'Summary & Timeline' as the first page for all roles
old_visible_tabs = """    // Tab bar list based on active role
    let visibleTabs = [];
    if (role === 'Doctor') {
      visibleTabs = ['Clinical Notes', 'Vitals', 'Labs & Imaging', 'Medications', 'Documents', 'ATD'];
    } else if (role === 'Nurse') {
      visibleTabs = ['Clinical Notes', 'Vitals', 'Labs & Imaging', 'Medications', 'Nursing Notes', 'Documents', 'ATD'];
    } else if (role === 'Billing') {
      visibleTabs = ['Billing', 'Documents', 'ATD'];
    } else if (role === 'Pharmacy') {
      visibleTabs = ['Medications', 'Labs & Imaging'];
    } else if (role === 'Front Desk') {
      visibleTabs = ['Documents', 'ATD'];
    } else if (role === 'Admission') {
      visibleTabs = ['ATD'];
    }"""

new_visible_tabs = """    // Tab bar list based on active role
    let visibleTabs = [];
    if (role === 'Doctor') {
      visibleTabs = ['Summary & Timeline', 'Clinical Notes', 'Vitals', 'Labs & Imaging', 'Medications', 'Documents', 'ATD'];
    } else if (role === 'Nurse') {
      visibleTabs = ['Summary & Timeline', 'Clinical Notes', 'Vitals', 'Labs & Imaging', 'Medications', 'Nursing Notes', 'Documents', 'ATD'];
    } else if (role === 'Billing') {
      visibleTabs = ['Summary & Timeline', 'Billing', 'Documents', 'ATD'];
    } else if (role === 'Pharmacy') {
      visibleTabs = ['Summary & Timeline', 'Medications', 'Labs & Imaging'];
    } else if (role === 'Front Desk') {
      visibleTabs = ['Summary & Timeline', 'Documents', 'ATD'];
    } else if (role === 'Admission') {
      visibleTabs = ['Summary & Timeline', 'ATD'];
    }"""

src = src.replace(old_visible_tabs, new_visible_tabs, 1)

# 4. Remove QUICK ACTIONS title label from the card
old_quick_actions_wrapper = """        <!-- Quick Actions Row (Horizontal buttons row) -->
        <div class="p360-card" style="padding:10px 16px; display:flex; align-items:center; gap:12px; flex-wrap:wrap;">
          <span class="mono" style="font-size:9px; color:var(--text-muted); font-weight:700;">QUICK ACTIONS:</span>
          ${quickActionsHtml}
        </div>"""

new_quick_actions_wrapper = """        <!-- Quick Actions Row (Horizontal buttons row starting directly with first action) -->
        <div class="p360-card" style="padding:10px 16px; display:flex; align-items:center; gap:12px; flex-wrap:wrap;">
          ${quickActionsHtml}
        </div>"""

src = src.replace(old_quick_actions_wrapper, new_quick_actions_wrapper, 1)

# 5. Insert 'Summary & Timeline' renderer block before 'Clinical Notes'
old_notes_branch = "    if (tab === 'Clinical Notes') {"
new_notes_branch = """    if (tab === 'Summary & Timeline') {
      tabContentHtml = `
        <div style="display:flex; gap:20px; height:100%; overflow:hidden;">
          
          <!-- Left Column: Patient Summary -->
          <div style="width:55%; display:flex; flex-direction:column; gap:16px; overflow-y:auto; padding-right:10px;">
            
            <!-- Clinical Narrative Card -->
            <div class="p360-card" style="border-color:#dbeafe; background:#fcfdff; margin:0; padding:14px;">
              <h5 style="margin:0 0 8px 0; font-size:13px; font-weight:700; color:var(--primary, #2563eb); display:flex; align-items:center; gap:6px;">
                <span>📝</span> Visit Summary & Clinical Narrative
              </h5>
              <p style="margin:0; font-size:12px; line-height:1.5; color:var(--text-secondary);">
                Lakshmi Devi, a 60-year-old female, was admitted to the Daycare Bay (Bed D-09) on 24 Jun 2026 at 10:15 AM under Dr. Priya Nair (Gynaecology). She presented with worsening fatigue, mild dyspnea, and heavy menstrual bleeding. Initial investigations revealed severe microcytic anemia with Haemoglobin at <b>8.2 g/dL</b>. 
              </p>
              <p style="margin:6px 0 0 0; font-size:12px; line-height:1.5; color:var(--text-secondary);">
                A critical lab result for Serum Potassium (K⁺) returned at <b>6.8 mEq/L</b>, which has been flagged for immediate consultant review and correction. The patient is currently receiving daycare IV Iron Sucrose infusion therapy. Vitals remain hemodynamically stable.
              </p>
            </div>

            <!-- Active Conditions Card -->
            <div class="p360-card" style="margin:0; padding:14px;">
              <h5 style="margin:0 0 10px 0; font-size:12px; font-weight:700; color:var(--text-primary);">ACTIVE PROBLEMS & DIAGNOSES</h5>
              <div style="display:flex; flex-direction:column; gap:8px;">
                <div style="display:flex; justify-content:space-between; align-items:center; font-size:12px;">
                  <span><b>Iron Deficiency Anemia, Severe</b></span>
                  <span class="badge-type badge-ipd" style="background:#fee2e2; color:#ef4444; font-weight:700;">CRITICAL STATUS</span>
                </div>
                <div style="display:flex; justify-content:space-between; align-items:center; font-size:12px; border-top:1px solid var(--border-color, #e2e8f0); padding-top:6px;">
                  <span><b>Hyperkalaemia (Potassium: 6.8 mEq/L)</b></span>
                  <span class="badge-type badge-ipd" style="background:#fee2e2; color:#ef4444; font-weight:700;">CRITICAL STATUS</span>
                </div>
                <div style="display:flex; justify-content:space-between; align-items:center; font-size:12px; border-top:1px solid var(--border-color, #e2e8f0); padding-top:6px;">
                  <span>Type 2 Diabetes Mellitus</span>
                  <span class="badge-type badge-dc">ACTIVE CONTROL</span>
                </div>
                <div style="display:flex; justify-content:space-between; align-items:center; font-size:12px; border-top:1px solid var(--border-color, #e2e8f0); padding-top:6px;">
                  <span>Essential (Primary) Hypertension</span>
                  <span class="badge-type badge-status-active">STABLE</span>
                </div>
                <div style="display:flex; justify-content:space-between; align-items:center; font-size:12px; border-top:1px solid var(--border-color, #e2e8f0); padding-top:6px;">
                  <span>Chronic Ischemic Heart Disease</span>
                  <span class="badge-type badge-status-active">STABLE</span>
                </div>
              </div>
            </div>

            <!-- Care Plan Tasks Card -->
            <div class="p360-card" style="margin:0; padding:14px;">
              <h5 style="margin:0 0 10px 0; font-size:12px; font-weight:700; color:var(--text-primary);">DAYCARE CARE PLAN & TASKS</h5>
              <div style="display:flex; flex-direction:column; gap:8px;">
                <label class="chk-item" style="font-size:12px; display:flex; align-items:center; gap:8px;">
                  <input type="checkbox" checked disabled> <span>Secure IV Access & administer Pantoprazole 40mg (Completed)</span>
                </label>
                <label class="chk-item" style="font-size:12px; display:flex; align-items:center; gap:8px;">
                  <input type="checkbox" checked disabled> <span>Draw samples for CBC, Electrolytes, Renal profile (Completed)</span>
                </label>
                <label class="chk-item" style="font-size:12px; display:flex; align-items:center; gap:8px;">
                  <input type="checkbox" checked disabled> <span>Initiate IV Iron Sucrose (100mg in 100ml NS) infusion (Completed)</span>
                </label>
                <label class="chk-item" style="font-size:12px; color:#ef4444; font-weight:600; display:flex; align-items:center; gap:8px;">
                  <input type="checkbox" ${isAcked ? 'checked' : ''} disabled> <span>Acknowledge and treat Serum Potassium 6.8 mEq/L (Critical Alert)</span>
                </label>
                <label class="chk-item" style="font-size:12px; display:flex; align-items:center; gap:8px;">
                  <input type="checkbox" onchange="window.prShowToast('Vitals monitoring scheduled')"> <span>Monitor Vitals & SpO2 Q2H during infusion</span>
                </label>
                <label class="chk-item" style="font-size:12px; display:flex; align-items:center; gap:8px;">
                  <input type="checkbox" onchange="window.prShowToast('Discharge process initiated')"> <span>Evaluate post-infusion recovery for daycare discharge</span>
                </label>
              </div>
            </div>

          </div>

          <!-- Right Column: Timeline -->
          <div style="width:45%; display:flex; flex-direction:column; gap:12px; overflow-y:auto; border-left:1px solid var(--border-color, #e2e8f0); padding-left:16px;">
            <h5 style="margin:0; font-size:12px; font-weight:700; color:var(--text-primary); display:flex; justify-content:space-between; align-items:center;">
              <span>📅 PATIENT ENGAGEMENT TIMELINE</span>
              <span style="font-size:10px; font-weight:normal; color:var(--text-muted);">Last 12 Hours</span>
            </h5>
            
            <div class="timeline-container">
              
              <div class="timeline-item">
                <div class="timeline-dot" style="border-color:#10b981; background:#d1fae5;"></div>
                <div class="timeline-time">12:30 PM &bull; Today</div>
                <div class="timeline-title">Medication Administered</div>
                <div class="timeline-desc">Ondansetron 4mg IV administered by Nurse Mary for mild nausea control.</div>
              </div>

              <div class="timeline-item">
                <div class="timeline-dot" style="border-color:#ef4444; background:#fee2e2;"></div>
                <div class="timeline-time">11:30 AM &bull; Today</div>
                <div class="timeline-title">Critical Lab Result Alert</div>
                <div class="timeline-desc">Serum Potassium (K⁺) returned critical at <b>6.8 mEq/L</b>. Dr. Priya Nair notified.</div>
              </div>

              <div class="timeline-item">
                <div class="timeline-dot" style="border-color:#3b82f6; background:#dbeafe;"></div>
                <div class="timeline-time">11:15 AM &bull; Today</div>
                <div class="timeline-title">IV Infusion Started</div>
                <div class="timeline-desc">IV line secured. Daycare Iron Sucrose 100mg in 100ml Normal Saline infusion started.</div>
              </div>

              <div class="timeline-item">
                <div class="timeline-dot"></div>
                <div class="timeline-time">11:00 AM &bull; Today</div>
                <div class="timeline-title">Diagnostic Samples Drawn</div>
                <div class="timeline-desc">Blood samples collected for CBC, LFT, Renal Profile, Serum Electrolytes. Sent to Central Lab.</div>
              </div>

              <div class="timeline-item">
                <div class="timeline-dot"></div>
                <div class="timeline-time">10:30 AM &bull; Today</div>
                <div class="timeline-title">Initial Nursing Triage</div>
                <div class="timeline-desc">Nurse Mary recorded baseline vitals (BP 130/80, HR 74, SpO2 99%). Patient reported severe fatigue.</div>
              </div>

              <div class="timeline-item">
                <div class="timeline-dot" style="border-color:#10b981; background:#d1fae5;"></div>
                <div class="timeline-time">10:15 AM &bull; Today</div>
                <div class="timeline-title">Daycare Admission Registered</div>
                <div class="timeline-desc">Admitted to Bed D-09, Daycare Ward under Consultant Dr. Priya Nair (Gynaecology).</div>
              </div>

            </div>
          </div>
          
        </div>
      `;
    } else if (tab === 'Clinical Notes') {"""

src = src.replace(old_notes_branch, new_notes_branch, 1)

# 6. Update window.prTriggerAction click handler to map actions to corresponding tabs
old_trigger_action = """  window.prTriggerAction = function(actionLabel) {
    window.prShowToast(`${actionLabel} initiated for Lakshmi Devi`);
  };"""

new_trigger_action = """  window.prTriggerAction = function(actionLabel) {
    const labelClean = actionLabel.replace(/[^\\w\\s&]/g, '').trim(); // Remove emojis
    const role = window.patient360Role;
    
    if (labelClean.includes("Write Note")) {
      window.prSelectWorkspaceTab("Clinical Notes");
      window.prShowToast("Progress Note composer opened");
    } else if (labelClean.includes("Prescribe") || labelClean.includes("Prescriptions")) {
      window.prSelectWorkspaceTab("Medications");
      window.prShowToast("Active Prescriptions view opened");
    } else if (labelClean.includes("Order Lab") || labelClean.includes("Order Radiology") || labelClean.includes("Radiology")) {
      window.prSelectWorkspaceTab("Labs & Imaging");
      window.prShowToast("Labs & Imaging orders view opened");
    } else if (labelClean.includes("Record Vitals")) {
      window.prSelectWorkspaceTab("Vitals");
      window.prShowToast("Record Vitals form active");
    } else if (labelClean.includes("Nursing Note") || labelClean.includes("Nurse Note")) {
      window.prSelectWorkspaceTab("Nursing Notes");
      window.prShowToast("Nursing Notes history and composer active");
    } else if (labelClean.includes("View Bill") || labelClean.includes("Collect Payment") || labelClean.includes("Pay")) {
      window.prSelectWorkspaceTab("Billing");
      window.prShowToast("Patient Financials & Billing active");
    } else if (labelClean.includes("Change Bed") || labelClean.includes("Transfer") || labelClean.includes("Discharge")) {
      window.prSelectWorkspaceTab("ATD");
      window.prShowToast("ATD details and clearance checklist active");
    } else if (labelClean.includes("Print Summary") || labelClean.includes("Print")) {
      window.print();
    } else {
      window.prShowToast(`${actionLabel} initiated for Lakshmi Devi`);
    }
  };"""

src = src.replace(old_trigger_action, new_trigger_action, 1)

with open(path, "w", encoding="utf-8") as f:
    f.write(src)

print("SUCCESS: Summary & Timeline view and quick actions fully mapped.")
