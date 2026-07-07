#!/usr/bin/env python3
import re

path = "/Users/home/Desktop/Saronil IHS/Updated HIS /assets/js/views/patientsView.js"

with open(path, "r", encoding="utf-8") as f:
    src = f.read()

# Find index of function renderPatient360Profile
start_marker = "function renderPatient360Profile(container, patient, activeTab, activeVisit) {"
start_idx = src.find(start_marker)

if start_idx == -1:
    print("ERROR: Could not find renderPatient360Profile in patientsView.js")
    exit(1)

# Overwrite everything from start_idx to the end of the file
new_src = src[:start_idx] + """function renderPatient360Profile(container, patient, activeTab, activeVisit) {
  if (!patient) {
    container.innerHTML = `<div class="card"><div class="card-body"><h4>Patient profile not found.</h4></div></div>`;
    return;
  }

  // Set up role and active tab states
  if (window.patient360Role === undefined) {
    window.patient360Role = 'Doctor';
  }
  if (window.patient360ActiveTab === undefined) {
    window.patient360ActiveTab = 'Clinical Notes';
  }
  if (window.patient360CriticalAcked === undefined) {
    window.patient360CriticalAcked = false;
  }
  if (window.patient360Notes === undefined) {
    window.patient360Notes = [
      {
        type: "PROGRESS NOTE",
        author: "Dr. Ramesh Kumar",
        dept: "Cardiology",
        time: "24 Jun 2026 · 10:15 AM",
        s: "Anemia symptoms worsening. Fatigue noted.",
        o: "BP 110/70. Conjunctival pallor.",
        a: "Iron deficiency anemia evaluation."
      },
      {
        type: "CONSULTANT RESPONSE",
        author: "Dr. Priya Nair",
        dept: "Gynaecology",
        time: "24 Jun 2026 · 09:30 AM",
        s: "Requested evaluation of heavy menstrual bleeding. Patient reports fatigue and weakness.",
        o: "Pallor present. Haemoglobin 8.2 g/dL.",
        a: "Anemia secondary to AUB. Advised iron infusion."
      }
    ];
  }
  if (window.patient360Diagnoses === undefined) {
    window.patient360Diagnoses = ["D64.9 Anaemia, unspecified"];
  }
  if (window.patient360SelectedDiagnosisTemp === undefined) {
    window.patient360SelectedDiagnosisTemp = "";
  }
  if (window.patient360DischargeClearances === undefined) {
    window.patient360DischargeClearances = {
      doctorOrder: true,
      nursingClearance: false,
      pharmacyClearance: false,
      billingClearance: true,
      finalBillGenerated: false
    };
  }

  // Predefined SOAP form inputs state
  if (window.soapSubjective === undefined) window.soapSubjective = "";
  if (window.soapObjectiveExam === undefined) window.soapObjectiveExam = "";
  if (window.soapAssessmentImpression === undefined) window.soapAssessmentImpression = "";
  if (window.soapPlanDetails === undefined) window.soapPlanDetails = "";
  if (window.soapPlanMedicationCheck === undefined) window.soapPlanMedicationCheck = true;

  // Nursing note inputs state
  if (window.nursingShift === undefined) window.nursingShift = "Morning";
  if (window.nursingObservations === undefined) window.nursingObservations = "";
  if (window.nursingActions === undefined) window.nursingActions = "";
  if (window.nursingInstructions === undefined) window.nursingInstructions = "";
  if (window.nursingNotesHistory === undefined) {
    window.nursingNotesHistory = [
      {
        type: "NURSING NOTE",
        author: "Staff Nurse Mary",
        desg: "Senior Ward Nurse",
        time: "24 Jun 2026 · 06:00 AM",
        shift: "Night",
        obs: "Patient slept well. No complaints of pain or discomfort.",
        actions: "Vitals recorded at 04:00 AM. IV line flushed.",
        instructions: "Monitor vitals Q4H. Dr. Priya Nair's rounds at 10:00 AM."
      }
    ];
  }

  // Styling block
  const p360Styles = `
    <style>
      .p360-wrap {
        font-family: var(--font-body, 'Inter', sans-serif);
        font-size: 13px;
        color: var(--text-secondary, #475569);
        background: var(--bg-base, #f8fafc);
        display: flex;
        flex-direction: column;
        gap: 12px;
        height: calc(100vh - 76px);
        overflow: hidden;
      }
      .p360-wrap .mono {
        font-family: 'JetBrains Mono', 'Courier New', monospace;
      }
      .p360-card {
        background: var(--bg-surface, #ffffff);
        border: 1px solid var(--border-color, #e2e8f0);
        border-radius: 8px;
        padding: 14px;
      }
      
      /* Top bar */
      .p360-topbar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        background: var(--bg-surface, #ffffff);
        border-bottom: 1px solid var(--border-color, #e2e8f0);
        padding: 8px 16px;
      }
      .p360-breadcrumb {
        font-size: 12px;
        color: var(--text-muted, #94a3b8);
        font-weight: 500;
      }
      .p360-breadcrumb b {
        color: var(--text-primary, #0f172a);
      }
      .p360-back-btn {
        background: transparent;
        border: 1px solid var(--border-color, #e2e8f0);
        color: var(--primary, #2563eb);
        font-weight: 600;
        padding: 4px 10px;
        border-radius: 4px;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        gap: 4px;
      }
      .p360-back-btn:hover {
        background: var(--primary-glow, #eff6ff);
      }
      
      /* Main Content Grid */
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
      }
      .p360-divider {
        height: 1px;
        background: var(--border-color, #e2e8f0);
        margin: 6px 0;
      }
      .p360-label-val {
        display: grid;
        grid-template-columns: 85px 1fr;
        gap: 4px;
        font-size: 11px;
        line-height: 1.4;
      }
      .p360-label {
        color: var(--text-muted, #94a3b8);
        font-weight: 500;
      }
      .p360-val {
        color: var(--text-primary, #0f172a);
        font-weight: 600;
      }
      
      /* Right Column */
      .p360-right-workspace {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 12px;
        overflow: hidden;
      }
      
      /* Tabs bar */
      .p360-tabs-bar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 1px solid var(--border-color, #e2e8f0);
        background: var(--bg-surface, #ffffff);
        padding: 0 16px;
        flex-shrink: 0;
      }
      .p360-tabs-list {
        display: flex;
        gap: 20px;
      }
      .p360-tab-item {
        padding: 10px 0;
        font-size: 13px;
        font-weight: 600;
        color: var(--text-secondary, #475569);
        cursor: pointer;
        border-bottom: 2px solid transparent;
        transition: all 0.15s;
        white-space: nowrap;
      }
      .p360-tab-item.active {
        color: var(--primary, #2563eb);
        border-bottom-color: var(--primary, #2563eb);
      }
      
      /* Right Workspace Content Viewport */
      .p360-viewport {
        flex: 1;
        overflow-y: auto;
        background: var(--bg-surface, #ffffff);
        border: 1px solid var(--border-color, #e2e8f0);
        border-radius: 8px;
        padding: 16px;
      }

      /* Badges */
      .badge-type {
        font-size: 9px;
        font-weight: 700;
        padding: 2px 6px;
        border-radius: 4px;
        display: inline-block;
        letter-spacing: 0.5px;
      }
      .badge-dc { background: #ecfeff; color: #0891b2; }
      .badge-ipd { background: #f5f3ff; color: #7c3aed; }
      .badge-status-active { background: #d1fae5; color: #059669; }
      .badge-status-discharged { background: #f1f5f9; color: #64748b; }
      
      /* Safety flag chips */
      .flag-chip {
        display: inline-flex;
        align-items: center;
        padding: 2px 8px;
        border-radius: 4px;
        font-size: 10px;
        font-weight: 700;
        text-transform: uppercase;
        margin-right: 4px;
        margin-bottom: 4px;
      }
      
      /* Quick actions list */
      .actions-container {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }
      .btn-qa-primary {
        background: var(--primary, #2563eb);
        color: #ffffff;
        border: none;
        border-radius: 6px;
        padding: 7px 12px;
        font-weight: 600;
        cursor: pointer;
        width: 100%;
        text-align: center;
      }
      .btn-qa-primary:hover {
        background: var(--primary-hover, #1d4ed8);
      }
      .btn-qa-secondary {
        background: var(--bg-surface-elevated, #f1f5f9);
        color: var(--text-primary, #0f172a);
        border: 1px solid var(--border-color, #e2e8f0);
        border-radius: 6px;
        padding: 6px 10px;
        font-weight: 600;
        cursor: pointer;
        font-size: 11px;
        text-align: center;
      }
      .btn-qa-secondary:hover {
        background: #e2e8f0;
      }
      .btn-qa-ghost {
        background: transparent;
        color: var(--primary, #2563eb);
        border: 1px solid var(--primary, #2563eb);
        border-radius: 6px;
        padding: 5px 10px;
        font-weight: 600;
        cursor: pointer;
        font-size: 11px;
        text-align: center;
      }
      .btn-qa-ghost:hover {
        background: var(--primary-glow, #eff6ff);
      }
      
      /* Activity Digest */
      .digest-list {
        list-style: none;
        padding: 0;
        margin: 0;
        display: flex;
        flex-direction: column;
        gap: 6px;
      }
      .digest-item {
        display: flex;
        gap: 6px;
        font-size: 11px;
        align-items: flex-start;
      }
      
      /* SOAP Composer layout */
      .clinical-notes-layout {
        display: flex;
        gap: 16px;
        height: 100%;
        overflow: hidden;
      }
      .note-composer-panel {
        width: 55%;
        display: flex;
        flex-direction: column;
        gap: 12px;
        overflow-y: auto;
        padding-right: 6px;
      }
      .note-history-panel {
        width: 45%;
        border-left: 1px solid var(--border-color, #e2e8f0);
        padding-left: 16px;
        display: flex;
        flex-direction: column;
        gap: 10px;
        overflow-y: auto;
      }
      
      /* Sub-tabs */
      .composer-subtabs {
        display: flex;
        gap: 8px;
        border-bottom: 1px solid var(--border-color, #e2e8f0);
        padding-bottom: 4px;
      }
      .subtab-item {
        padding: 4px 10px;
        font-size: 11px;
        font-weight: 600;
        cursor: pointer;
        border-radius: 4px;
        background: var(--bg-surface-elevated, #f1f5f9);
        color: var(--text-secondary, #475569);
      }
      .subtab-item.active {
        background: var(--primary, #2563eb);
        color: #ffffff;
      }
      
      /* Critical lab alert strip */
      .critical-alert-strip {
        background: #fee2e2;
        border: 1px solid #fecaca;
        color: #b91c1c;
        border-radius: 6px;
        padding: 8px 12px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 12px;
        font-weight: 600;
      }
      .btn-ack {
        background: #ef4444;
        color: #ffffff;
        border: none;
        border-radius: 4px;
        padding: 2px 8px;
        font-size: 10px;
        font-weight: 700;
        cursor: pointer;
      }
      .btn-ack:hover {
        background: #dc2626;
      }
      
      /* Forms */
      .form-group {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }
      .form-group label {
        font-size: 11px;
        font-weight: 700;
        color: var(--text-primary, #0f172a);
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
      .form-control {
        border: 1px solid var(--border-color, #e2e8f0);
        border-radius: 6px;
        padding: 6px 10px;
        font-size: 13px;
        outline: none;
      }
      .form-control:focus {
        border-color: var(--primary, #2563eb);
      }
      
      /* Vitals strip in SOAP */
      .vitals-data-strip {
        background: var(--bg-surface-elevated, #f1f5f9);
        border-radius: 6px;
        padding: 8px 12px;
        display: flex;
        justify-content: space-between;
        font-size: 11px;
        color: var(--text-secondary, #475569);
      }
      .vitals-data-strip b {
        color: var(--text-primary, #0f172a);
      }

      /* Note History Cards */
      .note-card {
        background: var(--bg-surface, #ffffff);
        border: 1px solid var(--border-color, #e2e8f0);
        border-radius: 6px;
        padding: 10px 12px;
        display: flex;
        flex-direction: column;
        gap: 4px;
      }
      .note-card-consultant {
        background: var(--primary-glow, #eff6ff);
        border-left: 3px solid var(--primary, #2563eb);
      }
      
      /* Tables */
      .p360-table {
        width: 100%;
        border-collapse: collapse;
        font-size: 12px;
        text-align: left;
      }
      .p360-table th {
        background: var(--bg-surface-elevated, #f1f5f9);
        color: var(--text-primary, #0f172a);
        font-weight: 600;
        padding: 8px;
        border-bottom: 1px solid var(--border-color, #e2e8f0);
      }
      .p360-table td {
        padding: 8px;
        border-bottom: 1px solid var(--border-color, #e2e8f0);
      }
      
      /* Diagnosis search wrapper */
      .diag-search-wrapper {
        position: relative;
        display: flex;
        flex-direction: column;
      }
      .diag-dropdown {
        position: absolute;
        top: 36px;
        left: 0;
        right: 0;
        background: var(--bg-surface, #ffffff);
        border: 1px solid var(--border-color, #e2e8f0);
        border-radius: 6px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        z-index: 200;
        max-height: 150px;
        overflow-y: auto;
      }
      .diag-option {
        padding: 6px 10px;
        cursor: pointer;
      }
      .diag-option:hover {
        background: var(--primary-glow, #eff6ff);
      }
      .diag-chip {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        background: var(--bg-surface-elevated, #f1f5f9);
        border: 1px solid var(--border-color, #e2e8f0);
        border-radius: 4px;
        padding: 2px 6px;
        font-size: 11px;
        font-weight: 600;
        margin-right: 4px;
        margin-top: 4px;
      }
      .diag-chip-remove {
        cursor: pointer;
        color: var(--color-danger, #ef4444);
        font-weight: bold;
      }
      
      /* Document card */
      .doc-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
        gap: 12px;
      }
      .doc-card {
        border: 1px solid var(--border-color, #e2e8f0);
        border-radius: 6px;
        padding: 10px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        text-align: center;
        gap: 6px;
        background: var(--bg-surface, #ffffff);
      }
      
      /* Discharge Checklist */
      .chk-item {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 13px;
        padding: 4px 0;
      }
    </style>
  `;

  // Draw Patient 360 Workspace
  function draw360() {
    const role = window.patient360Role;
    const tab = window.patient360ActiveTab;
    const isAcked = window.patient360CriticalAcked;

    // LEFT PANEL Quick Actions re-eval based on Role
    let quickActionsHtml = '';
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
    }

    // Tab bar list based on active role
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
    }

    // Render Tab Workspace content
    let tabContentHtml = '';

    if (tab === 'Clinical Notes') {
      // NOTE COMPOSER subtabs based on role
      let subTabsHtml = '';
      if (role === 'Doctor') {
        subTabsHtml = `
          <div class="composer-subtabs">
            <span class="subtab-item active">Progress Note</span>
            <span class="subtab-item" onclick="window.prShowToast('Review Note loaded')">Review Note</span>
            <span class="subtab-item" onclick="window.prShowToast('Pre-op Note loaded')">Pre-op Note</span>
            <span class="subtab-item" onclick="window.prShowToast('Post-op Note loaded')">Post-op Note</span>
            <span class="subtab-item" onclick="window.prShowToast('Referral Note loaded')">Referral Note</span>
            <span class="subtab-item" onclick="window.prShowToast('Discharge Note loaded')">Discharge Note</span>
          </div>
        `;
      } else {
        subTabsHtml = `
          <div class="composer-subtabs">
            <span class="subtab-item active">Progress Note</span>
          </div>
        `;
      }

      // Critical Alert strip
      const alertStripHtml = !isAcked ? `
        <div class="critical-alert-strip">
          <span>🔴 K⁺ 6.8 — Critical value. Acknowledge before saving note.</span>
          <button class="btn-ack" onclick="window.prAcknowledgeCritical()">Acknowledge</button>
        </div>
      ` : '';

      // Diagnoses chips list
      const diagChipsHtml = window.patient360Diagnoses.map((d, i) => `
        <span class="diag-chip">
          <span>${d}</span>
          <span class="diag-chip-remove" onclick="window.prRemoveDiagnosis(${i})">×</span>
        </span>
      `).join('');

      // ICD-10 Search options list if typing
      let searchOptionsHtml = '';
      if (window.patient360SelectedDiagnosisTemp.trim().length > 0) {
        const query = window.patient360SelectedDiagnosisTemp.toLowerCase();
        const icd10list = [
          "D64.9 Anaemia, unspecified",
          "E11.9 Type 2 diabetes mellitus without complications",
          "I10 Essential (primary) hypertension",
          "N92.0 Excessive and frequent menstruation (AUB)",
          "K21.9 Gastro-oesophageal reflux disease without esophagitis",
          "I25.1 Chronic ischemic heart disease"
        ];
        const matches = icd10list.filter(item => item.toLowerCase().includes(query));
        if (matches.length > 0) {
          searchOptionsHtml = `
            <div class="diag-dropdown">
              ${matches.map(m => `<div class="diag-option" onclick="window.prAddDiagnosis('${m}')">${m}</div>`).join('')}
            </div>
          `;
        }
      }

      // Notes History Cards
      const historyCardsHtml = window.patient360Notes.map((n, idx) => {
        const isConsultant = n.type === "CONSULTANT RESPONSE";
        return `
          <div class="note-card ${isConsultant ? 'note-card-consultant' : ''}">
            <div style="display:flex; justify-content:space-between; align-items:center; font-size:10px;">
              <span class="mono" style="color: ${isConsultant ? 'var(--primary)' : 'var(--text-muted)'}; font-weight:700;">${n.type}</span>
              <span class="mono" style="color:var(--text-muted);">${n.time}</span>
            </div>
            <strong style="font-size:12px; color:var(--text-primary);">${n.author} &bull; <span style="font-weight:500; color:var(--text-secondary);">${n.dept}</span></strong>
            <div style="font-size:12px; line-height:1.4; color:var(--text-secondary); margin-top:2px;">
              <div><b>S:</b> ${n.s}</div>
              <div><b>O:</b> ${n.o}</div>
              <div><b>A:</b> ${n.a}</div>
            </div>
            <div style="display:flex; gap:8px; justify-content:flex-end; font-size:11px; margin-top:4px;">
              <span style="color:var(--primary); cursor:pointer;" onclick="window.prShowToast('Editing note...')">Edit</span>
              <span style="color:var(--text-muted);">|</span>
              <span style="color:var(--primary); cursor:pointer;" onclick="window.prShowToast('Printing note...')">Print</span>
            </div>
          </div>
        `;
      }).join('');

      tabContentHtml = `
        <div class="clinical-notes-layout">
          <!-- Left SOAP Composer -->
          <div class="note-composer-panel">
            ${subTabsHtml}
            ${alertStripHtml}

            <div class="form-group" style="margin-top:4px;">
              <label>S — Subjective *</label>
              <textarea class="form-control" rows="4" placeholder="Chief complaint and patient's description..." id="soap-s" oninput="window.soapSubjective = this.value; window.prValidateSOAP()">${window.soapSubjective}</textarea>
            </div>

            <div class="form-group">
              <label>O — Objective</label>
              <span style="font-size:11px; color:var(--text-muted); margin-bottom:2px;">Latest vitals &bull; 24 Jun 2026 &bull; 09:30 AM</span>
              <div class="vitals-data-strip">
                <span>BP: <b>130/80</b></span>
                <span>HR: <b>74</b></span>
                <span>RR: <b>16</b></span>
                <span>Temp: <b>98.4°F</b></span>
                <span>SpO₂: <b>99%</b></span>
              </div>
              <textarea class="form-control" rows="2" style="margin-top:6px;" placeholder="Examination findings..." id="soap-o-exam" oninput="window.soapObjectiveExam = this.value">${window.soapObjectiveExam}</textarea>
              
              <!-- Lab findings -->
              <div style="margin-top:6px; display:flex; align-items:center; gap:6px;">
                <span style="font-size:11px; font-weight:700; color:var(--text-primary);">NEW LABS:</span>
                ${!isAcked ? `
                  <span class="flag-chip" style="background:#fee2e2; color:#b91c1c; font-size:10px; margin:0;" onclick="window.prAcknowledgeCritical()">K⁺ 6.8 🔴 CRITICAL</span>
                ` : `
                  <span class="flag-chip" style="background:#f1f5f9; color:#64748b; font-size:10px; margin:0; text-decoration:line-through;">K⁺ 6.8 Acknowledged</span>
                `}
              </div>
            </div>

            <div class="form-group">
              <label>A — Assessment & Diagnoses *</label>
              <div class="diag-search-wrapper">
                <input type="text" class="form-control" placeholder="Search ICD-10 codes..." id="soap-diag" value="${window.patient360SelectedDiagnosisTemp}" oninput="window.prSearchDiagnosis(this.value)">
                ${searchOptionsHtml}
              </div>
              <div style="margin-top:2px;">
                ${diagChipsHtml}
              </div>
              <textarea class="form-control" rows="2" style="margin-top:6px;" placeholder="Clinical impression..." id="soap-a-impression" oninput="window.soapAssessmentImpression = this.value; window.prValidateSOAP()">${window.soapAssessmentImpression}</textarea>
            </div>

            <div class="form-group">
              <label>P — Plan</label>
              <label class="chk-item" style="text-transform:none; font-weight:normal; letter-spacing:0; padding:0;">
                <input type="checkbox" id="soap-p-medcheck" ${window.soapPlanMedicationCheck ? 'checked' : ''} onchange="window.soapPlanMedicationCheck = this.checked"> Continue current medications
              </label>
              <textarea class="form-control" rows="2" placeholder="Plan details..." id="soap-p-details" oninput="window.soapPlanDetails = this.value">${window.soapPlanDetails}</textarea>
            </div>

            <div style="display:flex; justify-content:space-between; align-items:center; margin-top:8px;">
              <div style="display:flex; gap:8px;">
                <button class="btn-qa-primary" id="btn-sign-save" style="width:auto; height:34px; padding:0 16px;" onclick="window.prSignAndSave()" disabled>Sign & Save</button>
                <button class="btn-qa-secondary" style="height:34px;" onclick="window.prShowToast('Draft saved.')">Save Draft</button>
              </div>
              <a href="#" class="mono" style="color:var(--color-danger, #ef4444); font-size:12px;" onclick="window.prDiscardSOAP()">Discard</a>
            </div>
          </div>

          <!-- Right Note History -->
          <div class="note-history-panel">
            <span class="mono" style="font-size:9px; color:var(--text-muted); font-weight:700;">NOTE HISTORY</span>
            ${historyCardsHtml}
            <div style="text-align:center; margin-top:8px;">
              <a href="#" class="mono" style="font-size:11px; color:var(--primary);" onclick="window.prShowToast('No older notes available')">Load older notes</a>
            </div>
          </div>
        </div>
      `;
    } else if (tab === 'Vitals') {
      const vitalsRows = [
        { d: "24 Jun 2026", t: "09:30 AM", bp: "130/80", hr: 74, rr: 16, temp: "98.4°F", spo2: "99%", wt: "60 kg", by: "Staff Nurse Mary", news: 0 },
        { d: "24 Jun 2026", t: "06:00 AM", bp: "125/82", hr: 72, rr: 16, temp: "98.2°F", spo2: "98%", wt: "60 kg", by: "Staff Nurse Mary", news: 0 },
        { d: "23 Jun 2026", t: "10:00 PM", bp: "120/78", hr: 70, rr: 14, temp: "98.0°F", spo2: "99%", wt: "60 kg", by: "Nurse John", news: 0 },
        { d: "23 Jun 2026", t: "06:00 PM", bp: "132/84", hr: 78, rr: 18, temp: "98.6°F", spo2: "97%", wt: "60 kg", by: "Nurse John", news: 1 },
        { d: "23 Jun 2026", t: "02:00 PM", bp: "128/80", hr: 75, rr: 16, temp: "98.4°F", spo2: "99%", wt: "60 kg", by: "Staff Nurse Mary", news: 0 },
        { d: "23 Jun 2026", t: "10:00 AM", bp: "130/80", hr: 74, rr: 16, temp: "98.4°F", spo2: "99%", wt: "60 kg", by: "Staff Nurse Mary", news: 0 },
        { d: "23 Jun 2026", t: "06:00 AM", bp: "124/80", hr: 72, rr: 15, temp: "98.2°F", spo2: "98%", wt: "60 kg", by: "Nurse John", news: 0 }
      ];

      tabContentHtml = `
        <div>
          <span style="font-size:11px; color:var(--text-muted); font-weight:700; display:block; margin-bottom:4px;">LATEST VITALS</span>
          <div class="vitals-data-strip" style="margin-bottom:12px;">
            <span>BP: <b>130/80</b></span>
            <span>HR: <b>74</b></span>
            <span>RR: <b>16</b></span>
            <span>Temp: <b>98.4°F</b></span>
            <span>SpO₂: <b>99%</b></span>
            <span>Weight: <b>60 kg</b></span>
          </div>

          <table class="p360-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Time</th>
                <th>BP</th>
                <th>HR</th>
                <th>RR</th>
                <th>Temp</th>
                <th>SpO₂</th>
                <th>Weight</th>
                <th>NEWS2</th>
                <th>Recorded By</th>
              </tr>
            </thead>
            <tbody>
              ${vitalsRows.map(vr => {
                const color = vr.news >= 7 ? '#ef4444' : vr.news >= 4 ? '#f59e0b' : '#10b981';
                return `
                  <tr>
                    <td class="mono">${vr.d}</td>
                    <td class="mono">${vr.t}</td>
                    <td class="mono">${vr.bp}</td>
                    <td class="mono">${vr.hr}</td>
                    <td class="mono">${vr.rr}</td>
                    <td class="mono">${vr.temp}</td>
                    <td class="mono">${vr.spo2}</td>
                    <td class="mono">${vr.wt}</td>
                    <td>
                      <span class="mono" style="font-weight:700; color:${color};">${vr.news}</span>
                    </td>
                    <td>${vr.by}</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      `;
    } else if (tab === 'Labs & Imaging') {
      const labs = [
        { d: "24 Jun 2026", test: "K⁺ (Potassium)", val: "6.8", unit: "mEq/L", range: "3.5–5.0", status: "Critical", by: "Dr. Priya Nair" },
        { d: "24 Jun 2026", test: "Haemoglobin", val: "8.2", unit: "g/dL", range: "12–16", status: "Abnormal", by: "Dr. Priya Nair" },
        { d: "24 Jun 2026", test: "WBC", val: "7,400", unit: "/µL", range: "4,000–11,000", status: "Normal", by: "Dr. Priya Nair" },
        { d: "23 Jun 2026", test: "Creatinine", val: "1.1", unit: "mg/dL", range: "0.6–1.2", status: "Normal", by: "Dr. Priya Nair" },
        { d: "23 Jun 2026", test: "Sodium", val: "138", unit: "mEq/L", range: "135–145", status: "Normal", by: "Dr. Priya Nair" },
        { d: "23 Jun 2026", test: "Blood Glucose (F)", val: "94", unit: "mg/dL", range: "70–110", status: "Normal", by: "Dr. Priya Nair" },
        { d: "23 Jun 2026", test: "Urine R/E", val: "Protein +1", unit: "—", range: "Nil", status: "Abnormal", by: "Dr. Priya Nair" }
      ];

      const imaging = [
        { d: "24 Jun 2026", study: "Chest X-Ray PA View", modality: "X-Ray", status: "Released", by: "Dr. Priya Nair" }
      ];

      tabContentHtml = `
        <div style="display:flex; flex-direction:column; gap:16px;">
          <!-- Lab Results -->
          <div>
            <span style="font-size:11px; color:var(--text-muted); font-weight:700; display:block; margin-bottom:6px;">LAB RESULTS</span>
            <table class="p360-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Test</th>
                  <th>Result</th>
                  <th>Unit</th>
                  <th>Reference Range</th>
                  <th>Status</th>
                  <th>Ordered By</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                ${labs.map(l => {
                  const isCrit = l.status === 'Critical';
                  const rowStyle = isCrit ? 'style="border-left:3px solid #ef4444; background:#fff5f5;"' : '';
                  
                  let badge = '';
                  if (l.status === 'Critical') badge = '<span class="badge-type badge-ipd" style="background:#fee2e2; color:#ef4444;">CRITICAL</span>';
                  else if (l.status === 'Abnormal') badge = '<span class="badge-type" style="background:#fef3c7; color:#d97706;">ABNORMAL</span>';
                  else badge = '<span class="badge-type badge-status-active">NORMAL</span>';

                  let action = '—';
                  if (isCrit) {
                    action = !isAcked ? `
                      <button class="btn-ack" onclick="window.prAcknowledgeCritical()">Acknowledge</button>
                    ` : '<span style="color:var(--text-muted); font-size:11px;">Acknowledged</span>';
                  }

                  return `
                    <tr ${rowStyle}>
                      <td class="mono">${l.d}</td>
                      <td><b>${l.test}</b></td>
                      <td class="mono" style="font-weight:700;">${l.val}</td>
                      <td class="mono">${l.unit}</td>
                      <td class="mono">${l.range}</td>
                      <td>${badge}</td>
                      <td>${l.by}</td>
                      <td>${action}</td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>

          <!-- Imaging -->
          <div>
            <span style="font-size:11px; color:var(--text-muted); font-weight:700; display:block; margin-bottom:6px;">RADIOLOGY / IMAGING</span>
            <table class="p360-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Study</th>
                  <th>Modality</th>
                  <th>Status</th>
                  <th>Report</th>
                  <th>Ordered By</th>
                </tr>
              </thead>
              <tbody>
                ${imaging.map(img => `
                  <tr>
                    <td class="mono">${img.d}</td>
                    <td><b>${img.study}</b></td>
                    <td class="mono">${img.modality}</td>
                    <td><span class="badge-type badge-status-active">Released</span></td>
                    <td>
                      <button class="btn-qa-ghost" style="padding:2px 8px; font-size:10px;" onclick="window.prShowToast('Opening Chest X-Ray report PDF...')">View Report</button>
                    </td>
                    <td>${img.by}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `;
    } else if (tab === 'Medications') {
      const activeMeds = [
        { drug: "Tab Pantoprazole 40mg", route: "Oral", freq: "Once daily", dur: "5 days", status: "Active", author: "Dr. Priya Nair" },
        { drug: "Inj. Ondansetron 4mg", route: "IV", freq: "SOS", dur: "—", status: "PRN", author: "Dr. Priya Nair" },
        { drug: "Tab Ferrous Sulphate 200mg", route: "Oral", freq: "Twice daily", dur: "30 days", status: "Active", author: "Dr. Priya Nair" },
        { drug: "Tab Amlodipine 5mg", route: "Oral", freq: "Once daily", dur: "Ongoing", status: "Active", author: "Dr. Priya Nair" },
        { drug: "Tab Metformin 500mg", route: "Oral", freq: "Twice daily", dur: "Ongoing", status: "Active", author: "Dr. Priya Nair" }
      ];

      const dispenseLogs = [
        { d: "24 Jun 2026", drug: "Tab Ferrous Sulphate 200mg", qty: "30 Tabs", batch: "B-FS9921", by: "Ph. Satish Kumar" },
        { d: "24 Jun 2026", drug: "Tab Pantoprazole 40mg", qty: "5 Tabs", batch: "B-PT4412", by: "Ph. Satish Kumar" }
      ];

      tabContentHtml = `
        <div style="display:flex; flex-direction:column; gap:16px;">
          <!-- Active Medications -->
          <div>
            <span style="font-size:11px; color:var(--text-muted); font-weight:700; display:block; margin-bottom:6px;">ACTIVE PRESCRIPTIONS</span>
            <table class="p360-table">
              <thead>
                <tr>
                  <th>Drug</th>
                  <th>Route</th>
                  <th>Frequency</th>
                  <th>Duration</th>
                  <th>Status</th>
                  <th>Prescribed By</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                ${activeMeds.map(m => {
                  let badge = '';
                  if (m.status === 'Active') badge = '<span class="badge-type badge-status-active">Active</span>';
                  else if (m.status === 'PRN') badge = '<span class="badge-type" style="background:#eff6ff; color:#2563eb;">PRN</span>';
                  
                  return `
                    <tr>
                      <td><b>${m.drug}</b></td>
                      <td class="mono">${m.route}</td>
                      <td>${m.freq}</td>
                      <td class="mono">${m.dur}</td>
                      <td>${badge}</td>
                      <td>${m.author}</td>
                      <td>
                        ${role === 'Doctor' ? `
                          <button class="btn-qa-ghost" style="padding:2px 6px; font-size:10px; border-color:#ef4444; color:#ef4444;" onclick="window.prShowToast('Discontinued ${m.drug}')">Discontinue</button>
                        ` : '—'}
                      </td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>

          <!-- Dispensing Log (Only shows details) -->
          <div>
            <span style="font-size:11px; color:var(--text-muted); font-weight:700; display:block; margin-bottom:6px;">DISPENSING LOG</span>
            <table class="p360-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Drug</th>
                  <th>Qty Dispensed</th>
                  <th>Batch</th>
                  <th>Dispensed By</th>
                </tr>
              </thead>
              <tbody>
                ${dispenseLogs.map(l => `
                  <tr>
                    <td class="mono">${l.d}</td>
                    <td><b>${l.drug}</b></td>
                    <td class="mono">${l.qty}</td>
                    <td class="mono">${l.batch}</td>
                    <td>${l.by}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `;
    } else if (tab === 'Documents') {
      const docCategories = ["All", "Consent Forms", "Lab Reports", "Radiology Reports", "Insurance Docs", "Discharge Summary", "ID Proof"];
      const docs = [
        { name: "Consent Form", cat: "Consent Forms", type: "PDF", date: "24 Jun 2026", author: "Front Desk" },
        { name: "HDFC ERGO LOA Copy", cat: "Insurance Docs", type: "PDF", date: "24 Jun 2026", author: "Billing Desk" },
        { name: "Chest X-Ray Report", cat: "Radiology Reports", type: "PDF", date: "24 Jun 2026", author: "Dr. Priya Nair" },
        { name: "Aadhaar Card", cat: "ID Proof", type: "Image", date: "24 Jun 2026", author: "Front Desk" }
      ];

      tabContentHtml = `
        <div>
          <!-- Header and upload -->
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
            <div style="display:flex; gap:6px; flex-wrap:wrap;">
              ${docCategories.map(cat => `
                <span class="subtab-item ${cat === 'All' ? 'active' : ''}" onclick="window.prShowToast('${cat} docs filtered')">${cat}</span>
              `).join('')}
            </div>
            <button class="btn-qa-primary" style="width:auto; height:28px; padding:0 12px; font-size:11px;" onclick="window.prShowToast('Upload Document modal opened')">+ Upload Document</button>
          </div>

          <!-- Document Grid -->
          <div class="doc-grid">
            ${docs.map(d => `
              <div class="doc-card">
                <span style="font-size:24px;">${d.type === 'PDF' ? '📄' : '🖼️'}</span>
                <strong style="font-size:12px; display:block; color:var(--text-primary); max-width:140px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${d.name}</strong>
                <span style="font-size:10px; color:var(--text-muted); display:block;">${d.author} &bull; <span class="mono">${d.date}</span></span>
                <button class="btn-qa-ghost" style="padding:2px 8px; font-size:10px; margin-top:4px;" onclick="window.prShowToast('Viewing ${d.name}...')">View</button>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    } else if (tab === 'ATD') {
      const checklist = window.patient360DischargeClearances;
      const allChecklistCleared = checklist.doctorOrder && checklist.nursingClearance && checklist.pharmacyClearance && checklist.billingClearance && checklist.finalBillGenerated;

      tabContentHtml = `
        <div style="display:flex; flex-direction:column; gap:16px;">
          <!-- Admission Details -->
          <div>
            <span style="font-size:11px; color:var(--text-muted); font-weight:700; display:block; margin-bottom:6px;">ADMISSION DETAILS</span>
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px;" class="p360-card">
              <div class="p360-label-val"><span class="p360-label">Admission Type</span><span class="p360-val">Daycare</span></div>
              <div class="p360-label-val"><span class="p360-label">Admitted</span><span class="p360-val mono">24 Jun 2026 &bull; 10:15 AM</span></div>
              <div class="p360-label-val"><span class="p360-label">Admitting Doc</span><span class="p360-val">Dr. Priya Nair</span></div>
              <div class="p360-label-val"><span class="p360-label">Admitting Ward</span><span class="p360-val">Daycare Bay</span></div>
              <div class="p360-label-val"><span class="p360-label">Reason</span><span class="p360-val">Anaemia evaluation</span></div>
              <div class="p360-label-val"><span class="p360-label">MLC Case</span><span class="p360-val">No</span></div>
              <div class="p360-label-val"><span class="p360-label">Deposit Paid</span><span class="p360-val mono">₹10,000</span></div>
            </div>
          </div>

          <!-- Transfer History -->
          <div>
            <span style="font-size:11px; color:var(--text-muted); font-weight:700; display:block; margin-bottom:4px;">TRANSFER HISTORY</span>
            <div class="mono" style="color:var(--text-muted); font-size:11px;">No transfers recorded</div>
          </div>

          <!-- Discharge Section -->
          <div>
            <span style="font-size:11px; color:var(--text-muted); font-weight:700; display:block; margin-bottom:6px;">DISCHARGE CHECKLIST & CLEARANCES</span>
            <div class="p360-card" style="display:flex; flex-direction:column; gap:6px;">
              <label class="chk-item">
                <input type="checkbox" checked disabled> <b>Doctor discharge order</b> &bull; Signed by Dr. Priya Nair
              </label>
              <label class="chk-item">
                <input type="checkbox" ${checklist.nursingClearance ? 'checked' : ''} onchange="window.prSetClearance('nursingClearance', this.checked)"> <b>Nursing clearance</b> (vitals logged, discharge summary review)
              </label>
              <label class="chk-item">
                <input type="checkbox" ${checklist.pharmacyClearance ? 'checked' : ''} onchange="window.prSetClearance('pharmacyClearance', this.checked)"> <b>Pharmacy clearance</b> (returns processed, home meds issued)
              </label>
              <label class="chk-item">
                <input type="checkbox" checked disabled> <b>Billing clearance</b> &bull; HDFC ERGO LOA matches bill estimates
              </label>
              <label class="chk-item">
                <input type="checkbox" ${checklist.finalBillGenerated ? 'checked' : ''} onchange="window.prSetClearance('finalBillGenerated', this.checked)"> <b>Final bill generated</b> (interim billing audit complete)
              </label>
              
              <div style="margin-top:8px;" title="${!allChecklistCleared ? 'Complete all clearances to enable discharge.' : ''}">
                <button class="btn-qa-primary" style="width:auto; height:34px; padding:0 20px;" ${!allChecklistCleared ? 'disabled' : ''} onclick="window.prDischargePatient()">Initiate Discharge</button>
              </div>
            </div>
          </div>
        </div>
      `;
    } else if (tab === 'Nursing Notes') {
      const noteHistoryHtml = window.nursingNotesHistory.map(n => `
        <div class="note-card">
          <div style="display:flex; justify-content:space-between; align-items:center; font-size:10px;">
            <span class="mono" style="color:var(--text-muted); font-weight:700;">${n.type} (${n.shift} Shift)</span>
            <span class="mono" style="color:var(--text-muted);">${n.time}</span>
          </div>
          <strong style="font-size:12px; color:var(--text-primary);">${n.author} &bull; <span style="font-weight:500; color:var(--text-secondary);">${n.desg}</span></strong>
          <div style="font-size:12px; line-height:1.4; color:var(--text-secondary); margin-top:2px;">
            <div><b>Observations:</b> ${n.obs}</div>
            <div><b>Actions:</b> ${n.actions}</div>
            <div><b>Next Instructions:</b> ${n.instructions}</div>
          </div>
        </div>
      `).join('');

      tabContentHtml = `
        <div class="clinical-notes-layout">
          <!-- Composer -->
          <div class="note-composer-panel">
            <div class="composer-subtabs">
              <span class="subtab-item active">Nursing Note</span>
              <span class="subtab-item" onclick="window.prShowToast('Handover Note loaded')">Handover Note</span>
              <span class="subtab-item" onclick="window.prShowToast('Incident Report loaded')">Incident Report</span>
            </div>

            <div class="form-group" style="margin-top:6px;">
              <label>Shift *</label>
              <select class="form-control" style="height:32px; padding:0 8px;" id="nn-shift" onchange="window.nursingShift = this.value">
                <option value="Morning" ${window.nursingShift === 'Morning' ? 'selected' : ''}>Morning</option>
                <option value="Evening" ${window.nursingShift === 'Evening' ? 'selected' : ''}>Evening</option>
                <option value="Night" ${window.nursingShift === 'Night' ? 'selected' : ''}>Night</option>
              </select>
            </div>

            <div class="form-group">
              <label>Observations *</label>
              <textarea class="form-control" rows="3" placeholder="Describe patient status, complaints, and observations..." id="nn-obs" oninput="window.nursingObservations = this.value; window.prValidateNursingNote()">${window.nursingObservations}</textarea>
            </div>

            <div class="form-group">
              <label>Actions Taken</label>
              <textarea class="form-control" rows="2" placeholder="Medications administered, dressings changed, diagnostics sent..." id="nn-actions" oninput="window.nursingActions = this.value">${window.nursingActions}</textarea>
            </div>

            <div class="form-group">
              <label>Next Shift Instructions</label>
              <textarea class="form-control" rows="2" placeholder="Instructions for incoming shift nurse..." id="nn-instructions" oninput="window.nursingInstructions = this.value">${window.nursingInstructions}</textarea>
            </div>

            <div style="margin-top:8px; display:flex; gap:8px;">
              <button class="btn-qa-primary" id="btn-nn-save" style="width:auto; height:34px; padding:0 16px;" onclick="window.prSaveNursingNote()" disabled>Sign & Submit</button>
              <button class="btn-qa-secondary" style="height:34px;" onclick="window.prShowToast('Nursing note draft saved.')">Save Draft</button>
            </div>
          </div>

          <!-- History -->
          <div class="note-history-panel">
            <span class="mono" style="font-size:9px; color:var(--text-muted); font-weight:700;">NURSING NOTE HISTORY</span>
            ${noteHistoryHtml}
          </div>
        </div>
      `;
    } else if (tab === 'Billing') {
      const chargeDetails = [
        { cat: "Bed Charges", desc: "Daycare Bay &bull; 1 day", qty: "1", rate: "₹3,500", amt: "₹3,500" },
        { cat: "Consultant Fee", desc: "Dr. Priya Nair", qty: "1", rate: "₹2,000", amt: "₹2,000" },
        { cat: "Lab Charges", desc: "CBC, LFT, RFT, Electrolytes", qty: "1", rate: "₹4,200", amt: "₹4,200" },
        { cat: "Pharmacy", desc: "Various medications", qty: "—", rate: "—", amt: "₹1,800" },
        { cat: "Procedures", desc: "IV Infusion &bull; Normal Saline", qty: "2", rate: "₹500", amt: "₹1,000" }
      ];

      tabContentHtml = `
        <div style="display:flex; flex-direction:column; gap:16px;">
          <!-- Financial summary strip -->
          <div class="vitals-data-strip" style="background:#fffbeb; border:1px solid #fef3c7;">
            <span>Estimated Bill: <b class="mono">₹85,000</b></span>
            <span>LOA Approved: <b class="mono">₹80,000</b></span>
            <span>Deposit Paid: <b class="mono">₹10,000</b></span>
            <span>Outstanding Share: <b class="mono" style="color:#d97706;">₹5,000</b></span>
          </div>

          <!-- Charge details table -->
          <div>
            <span style="font-size:11px; color:var(--text-muted); font-weight:700; display:block; margin-bottom:6px;">CHARGE ITEMS</span>
            <table class="p360-table">
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Description</th>
                  <th>Qty</th>
                  <th>Rate</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                ${chargeDetails.map(c => `
                  <tr>
                    <td><b>${c.cat}</b></td>
                    <td>${c.desc}</td>
                    <td class="mono">${c.qty}</td>
                    <td class="mono">${c.rate}</td>
                    <td class="mono" style="font-weight:600;">${c.amt}</td>
                  </tr>
                `).join('')}
                <tr style="background:var(--bg-surface-elevated, #f1f5f9); font-weight:700;">
                  <td colspan="4" style="text-align:right;">Sub-total:</td>
                  <td class="mono">₹12,500</td>
                </tr>
                <tr style="background:#ecfdf5; font-weight:700; color:#059669;">
                  <td colspan="4" style="text-align:right;">TPA Approved Deduction:</td>
                  <td class="mono">-₹12,500</td>
                </tr>
                <tr style="background:var(--bg-surface-elevated, #f1f5f9); font-weight:700;">
                  <td colspan="4" style="text-align:right;">Patient Out-of-Pocket Share:</td>
                  <td class="mono">₹0</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Payment history -->
          <div>
            <span style="font-size:11px; color:var(--text-muted); font-weight:700; display:block; margin-bottom:6px;">PAYMENT RECEIPTS</span>
            <table class="p360-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Mode</th>
                  <th>Amount</th>
                  <th>Receipt No</th>
                  <th>Collected By</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td class="mono">24 Jun 2026</td>
                  <td>Cash</td>
                  <td class="mono" style="font-weight:600;">₹10,000</td>
                  <td class="mono">REC-2026-00441</td>
                  <td>Billing Clerk Anand</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Actions -->
          <div style="display:flex; gap:8px; margin-top:8px;">
            <button class="btn-qa-primary" style="width:auto; height:34px; padding:0 20px;" onclick="window.prTriggerAction('Collect Payment')">Collect Payment</button>
            <button class="btn-qa-secondary" style="height:34px;" onclick="window.prTriggerAction('Generate Final Bill')">Generate Final Bill</button>
          </div>
        </div>
      `;
    }

    container.innerHTML = `
      ${p360Styles}
      <div class="p360-wrap">
        
        <!-- Breadcrumb & Role Switcher Top Row -->
        <div class="p360-topbar">
          <div style="display:flex; align-items:center; gap:12px;">
            <button class="p360-back-btn" onclick="window.router.navigate('patients')">&larr; Back to Patients</button>
            <div class="p360-breadcrumb">
              Hospital Management &rsaquo; Patients &rsaquo; <b>Lakshmi Devi</b>
            </div>
          </div>
          
          <div style="display:flex; align-items:center; gap:6px;">
            <span style="font-size:11px; font-weight:600; color:var(--text-secondary);">Viewing as:</span>
            <select class="form-control" style="height:28px; font-size:12px; padding:0 20px 0 8px; width:110px; cursor:pointer;" onchange="window.prSwitchRole(this.value)">
              ${['Doctor', 'Nurse', 'Billing', 'Admission', 'Pharmacy', 'Front Desk'].map(r => `<option value="${r}" ${role === r ? 'selected' : ''}>${r}</option>`).join('')}
            </select>
          </div>
        </div>

        <!-- Main workspace grid -->
        <div class="p360-grid">
          
          <!-- Left Column (Patient Card, Quick Actions) -->
          <div class="p360-left-panel">
            
            <!-- Patient Profile ID Info -->
            <div class="p360-card" style="display:flex; flex-direction:column; gap:6px;">
              <div style="display:flex; align-items:center; gap:10px;">
                <div class="pr-avatar" style="width:48px; height:48px; font-size:16px; font-weight:700; background:var(--primary); color:#ffffff;">LD</div>
                <div>
                  <h4 style="margin:0; font-size:15px; font-weight:700; color:var(--text-primary);">${patient.name}</h4>
                  <div style="display:flex; gap:4px; margin-top:2px;">
                    <span class="badge-type badge-dc">${patient.type.toUpperCase()}</span>
                    <span class="badge-type badge-status-active">Active</span>
                  </div>
                </div>
              </div>
              
              <div class="p360-divider"></div>
              
              <div class="p360-label-val"><span class="p360-label">UHID</span><span class="p360-val mono">${patient.uhid}</span></div>
              <div class="p360-label-val"><span class="p360-label">Record No</span><span class="p360-val mono">${patient.uhid.replace('SH-2026', 'DC-2026')}</span></div>
              
              <div class="p360-divider"></div>
              
              <div class="p360-label-val"><span class="p360-label">Age / Sex</span><span class="p360-val">60 &bull; F</span></div>
              <div class="p360-label-val"><span class="p360-label">Blood Group</span><span class="p360-val">B+</span></div>
              <div class="p360-label-val"><span class="p360-label">Mobile</span><span class="p360-val mono">${patient.mobile}</span></div>
              
              <div class="p360-divider"></div>

              <div class="p360-label-val"><span class="p360-label">Ward & Bed</span><span class="p360-val mono">${patient.ward} &bull; ${patient.bed}</span></div>
              <div class="p360-label-val"><span class="p360-label">Consultant</span><span class="p360-val">${patient.primaryConsultant}</span></div>
              <div class="p360-label-val"><span class="p360-label">Admitted</span><span class="p360-val mono">24 Jun 2026 &bull; 10:15 AM</span></div>
              <div class="p360-label-val"><span class="p360-label">LOS</span><span class="p360-val">Day 1 of est. 5</span></div>
              <div class="p360-label-val"><span class="p360-label">Payer</span><span class="p360-val">${patient.payer}</span></div>
              <div class="p360-label-val"><span class="p360-label">LOA Status</span><span class="p360-val mono" style="color:#059669; font-weight:700;">₹80,000 Approved ✓</span></div>
            </div>

            <!-- Safety flags -->
            <div class="p360-card" style="padding:10px;">
              <span class="mono" style="font-size:9px; color:var(--text-muted); font-weight:700; display:block; margin-bottom:4px;">SAFETY FLAGS</span>
              <span style="font-size:11px; color:var(--text-muted);">No Known Allergy</span>
            </div>

            <!-- Last 12 hrs activity -->
            <div class="p360-card" style="padding:10px;">
              <span class="mono" style="font-size:9px; color:var(--text-muted); font-weight:700; display:block; margin-bottom:6px;">LAST 12 HRS</span>
              <ul class="digest-list">
                <li class="digest-item"><span>📊</span> <span>NEWS2 score stable at 0</span></li>
                <li class="digest-item"><span>🔬</span> <span>3 lab results — 1 critical (K⁺ 6.8)</span></li>
                <li class="digest-item"><span>💊</span> <span>1 new prescription added</span></li>
                <li class="digest-item"><span>📋</span> <span>2 orders pending nursing execution</span></li>
                <li class="digest-item"><span>📝</span> <span>1 nursing note from night shift</span></li>
              </ul>
            </div>

            <!-- Quick actions -->
            <div class="p360-card" style="padding:10px;">
              <span class="mono" style="font-size:9px; color:var(--text-muted); font-weight:700; display:block; margin-bottom:6px;">QUICK ACTIONS</span>
              ${quickActionsHtml}
            </div>

          </div>

          <!-- Right Column -->
          <div class="p360-right-workspace">
            
            <!-- Sticky Tab Bar row -->
            <div class="p360-tabs-bar">
              <div class="p360-tabs-list">
                ${visibleTabs.map(tName => `
                  <span class="p360-tab-item ${tab === tName ? 'active' : ''}" onclick="window.prSelectWorkspaceTab('${tName}')">${tName}</span>
                `).join('')}
              </div>
              <a href="#" class="mono" style="font-size:11px; color:var(--primary);" onclick="window.router.navigate('patients')">&larr; Back to Registry</a>
            </div>

            <!-- Viewport scrollable content -->
            <div class="p360-viewport">
              ${tabContentHtml}
            </div>

          </div>

        </div>

      </div>
    `;

    // Rebind typeahead listeners if composer is active
    if (tab === 'Clinical Notes') {
      window.prValidateSOAP();
    }
    if (tab === 'Nursing Notes') {
      window.prValidateNursingNote();
    }
  }

  // Interactive controllers on window
  window.prSwitchRole = function(newRole) {
    window.patient360Role = newRole;
    
    // Auto-update active tab per role requirement
    if (newRole === 'Doctor') window.patient360ActiveTab = 'Clinical Notes';
    else if (newRole === 'Nurse') window.patient360ActiveTab = 'Nursing Notes';
    else if (newRole === 'Billing') window.patient360ActiveTab = 'Billing';
    else if (newRole === 'Pharmacy') window.patient360ActiveTab = 'Medications';
    else if (newRole === 'Front Desk') window.patient360ActiveTab = 'Documents';
    else if (newRole === 'Admission') window.patient360ActiveTab = 'ATD';

    draw360();
  };

  window.prSelectWorkspaceTab = function(tName) {
    window.patient360ActiveTab = tName;
    draw360();
  };

  window.prTriggerAction = function(actionLabel) {
    window.prShowToast(`${actionLabel} initiated for Lakshmi Devi`);
  };

  window.prAcknowledgeCritical = function() {
    window.patient360CriticalAcked = true;
    window.prShowToast(`Critical value K⁺ 6.8 acknowledged by Dr. ${window.patient360Role === 'Doctor' ? 'Priya Nair' : 'Mary'}`);
    draw360();
  };

  window.prSearchDiagnosis = function(val) {
    window.patient360SelectedDiagnosisTemp = val;
    draw360();
  };

  window.prAddDiagnosis = function(code) {
    if (!window.patient360Diagnoses.includes(code)) {
      window.patient360Diagnoses.push(code);
    }
    window.patient360SelectedDiagnosisTemp = "";
    draw360();
  };

  window.prRemoveDiagnosis = function(idx) {
    window.patient360Diagnoses.splice(idx, 1);
    draw360();
  };

  window.prSetClearance = function(field, checked) {
    window.patient360DischargeClearances[field] = checked;
    draw360();
  };

  window.prDischargePatient = function() {
    window.prShowToast("Discharge process initiated successfully!");
  };

  window.prValidateSOAP = function() {
    const s = window.soapSubjective.trim();
    const btn = document.getElementById('btn-sign-save');
    if (!btn) return;
    
    // Sign & Save enabled if S is filled + critical acknowledged
    if (s.length > 0 && window.patient360CriticalAcked) {
      btn.disabled = false;
    } else {
      btn.disabled = true;
    }
  };

  window.prSignAndSave = function() {
    const s = window.soapSubjective.trim();
    const exam = window.soapObjectiveExam.trim();
    const impression = window.soapAssessmentImpression.trim();
    
    const formattedDiag = window.patient360Diagnoses.join(', ') || 'None';
    const impressionFinal = impression ? `${impression} (${formattedDiag})` : formattedDiag;

    window.patient360Notes.unshift({
      type: "PROGRESS NOTE",
      author: "Dr. Priya Nair",
      dept: "Gynaecology",
      time: "28 Jun 2026 · 11:30 AM",
      s: s,
      o: `BP: 130/80. ${exam}`,
      a: impressionFinal
    });

    // Clear form inputs
    window.soapSubjective = "";
    window.soapObjectiveExam = "";
    window.soapAssessmentImpression = "";
    window.soapPlanDetails = "";

    window.prShowToast("Progress Note signed & saved successfully!");
    draw360();
  };

  window.prDiscardSOAP = function() {
    window.soapSubjective = "";
    window.soapObjectiveExam = "";
    window.soapAssessmentImpression = "";
    window.soapPlanDetails = "";
    window.prShowToast("Progress Note changes discarded.");
    draw360();
  };

  window.prValidateNursingNote = function() {
    const obs = window.nursingObservations.trim();
    const btn = document.getElementById('btn-nn-save');
    if (!btn) return;
    
    if (obs.length > 0) {
      btn.disabled = false;
    } else {
      btn.disabled = true;
    }
  };

  window.prSaveNursingNote = function() {
    const shift = window.nursingShift;
    const obs = window.nursingObservations.trim();
    const acts = window.nursingActions.trim();
    const inst = window.nursingInstructions.trim();

    window.nursingNotesHistory.unshift({
      type: "NURSING NOTE",
      author: "Staff Nurse Mary",
      desg: "Senior Ward Nurse",
      time: "28 Jun 2026 · 11:30 AM",
      shift: shift,
      obs: obs,
      actions: acts || "None",
      instructions: inst || "None"
    });

    window.nursingObservations = "";
    window.nursingActions = "";
    window.nursingInstructions = "";

    window.prShowToast("Nursing note signed & saved successfully!");
    draw360();
  };

  draw360();
}
"""

with open(path, "w", encoding="utf-8") as f:
    f.write(new_src)

print("SUCCESS: renderPatient360Profile successfully updated.")
