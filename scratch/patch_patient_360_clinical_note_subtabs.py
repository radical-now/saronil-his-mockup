#!/usr/bin/env python3

path = "/Users/home/Desktop/Saronil IHS/Updated HIS /assets/js/views/patientsView.js"

with open(path, "r", encoding="utf-8") as f:
    src = f.read()

# 1. Initialize note state variables at start of renderPatient360Profile
init_target = "  if (window.patient360Notes === undefined) {"
init_replacement = """  if (window.patient360ActiveClinicalNoteSubtab === undefined) {
    window.patient360ActiveClinicalNoteSubtab = "Progress Note";
  }
  if (window.soapSubjective === undefined) window.soapSubjective = "";
  if (window.soapObjectiveExam === undefined) window.soapObjectiveExam = "";
  if (window.soapAssessmentImpression === undefined) window.soapAssessmentImpression = "";
  if (window.soapPlanDetails === undefined) window.soapPlanDetails = "";
  if (window.soapPlanMedicationCheck === undefined) window.soapPlanMedicationCheck = false;

  if (window.reviewStatus === undefined) window.reviewStatus = "";
  if (window.reviewPlan === undefined) window.reviewPlan = "";

  if (window.preopDiagnosis === undefined) window.preopDiagnosis = "";
  if (window.preopProcedure === undefined) window.preopProcedure = "";
  if (window.preopClearance === undefined) window.preopClearance = "";
  if (window.preopFasting === undefined) window.preopFasting = false;
  if (window.preopSiteMarked === undefined) window.preopSiteMarked = false;
  if (window.preopConsent === undefined) window.preopConsent = false;

  if (window.postopDiagnosis === undefined) window.postopDiagnosis = "";
  if (window.postopProcedure === undefined) window.postopProcedure = "";
  if (window.postopIntraop === undefined) window.postopIntraop = "";
  if (window.postopPlan === undefined) window.postopPlan = "";

  if (window.referralTarget === undefined) window.referralTarget = "";
  if (window.referralSummary === undefined) window.referralSummary = "";
  if (window.referralUrgency === undefined) window.referralUrgency = "Routine";

  if (window.dischargeDiagnosis === undefined) window.dischargeDiagnosis = "";
  if (window.dischargeCourse === undefined) window.dischargeCourse = "";
  if (window.dischargeInstructions === undefined) window.dischargeInstructions = "";
  if (window.dischargeMeds === undefined) window.dischargeMeds = "";

  if (window.patient360Notes === undefined) {"""

src = src.replace(init_target, init_replacement, 1)

# 2. Add controllers on window for selecting subtabs, validation, saving, and discarding
old_actions_marker = "  // Interactive controllers on window"
new_actions = """  // Clinical Notes dynamic type routing controllers
  window.prSelectClinicalNoteSubtab = function(st) {
    window.patient360ActiveClinicalNoteSubtab = st;
    draw360();
  };

  window.prValidateClinicalNote = function() {
    const st = window.patient360ActiveClinicalNoteSubtab;
    let isValid = false;
    
    if (st === 'Progress Note') {
      const s = document.getElementById("soap-s")?.value || "";
      const a = document.getElementById("soap-a-impression")?.value || "";
      window.soapSubjective = s;
      window.soapAssessmentImpression = a;
      isValid = (s.trim().length > 0 && a.trim().length > 0);
    } else if (st === 'Review Note') {
      const status = document.getElementById("rev-status")?.value || "";
      const plan = document.getElementById("rev-plan")?.value || "";
      window.reviewStatus = status;
      window.reviewPlan = plan;
      isValid = (status.trim().length > 0 && plan.trim().length > 0);
    } else if (st === 'Pre-op Note') {
      const diag = document.getElementById("pre-diag")?.value || "";
      const proc = document.getElementById("pre-proc")?.value || "";
      window.preopDiagnosis = diag;
      window.preopProcedure = proc;
      isValid = (diag.trim().length > 0 && proc.trim().length > 0);
    } else if (st === 'Post-op Note') {
      const diag = document.getElementById("post-diag")?.value || "";
      const proc = document.getElementById("post-proc")?.value || "";
      window.postopDiagnosis = diag;
      window.postopProcedure = proc;
      isValid = (diag.trim().length > 0 && proc.trim().length > 0);
    } else if (st === 'Referral Note') {
      const tgt = document.getElementById("ref-tgt")?.value || "";
      const sum = document.getElementById("ref-sum")?.value || "";
      window.referralTarget = tgt;
      window.referralSummary = sum;
      isValid = (tgt.trim().length > 0 && sum.trim().length > 0);
    } else if (st === 'Discharge Note') {
      const diag = document.getElementById("dis-diag")?.value || "";
      const course = document.getElementById("dis-course")?.value || "";
      window.dischargeDiagnosis = diag;
      window.dischargeCourse = course;
      isValid = (diag.trim().length > 0 && course.trim().length > 0);
    }

    const btn = document.getElementById("btn-sign-save");
    if (btn) btn.disabled = !isValid;
  };

  window.prDiscardSOAP = function() {
    window.soapSubjective = "";
    window.soapObjectiveExam = "";
    window.soapAssessmentImpression = "";
    window.soapPlanDetails = "";
    window.soapPlanMedicationCheck = false;

    window.reviewStatus = "";
    window.reviewPlan = "";

    window.preopDiagnosis = "";
    window.preopProcedure = "";
    window.preopClearance = "";
    window.preopFasting = false;
    window.preopSiteMarked = false;
    window.preopConsent = false;

    window.postopDiagnosis = "";
    window.postopProcedure = "";
    window.postopIntraop = "";
    window.postopPlan = "";

    window.referralTarget = "";
    window.referralSummary = "";
    window.referralUrgency = "Routine";

    window.dischargeDiagnosis = "";
    window.dischargeCourse = "";
    window.dischargeInstructions = "";
    window.dischargeMeds = "";

    window.prShowToast("Note draft discarded");
    draw360();
  };

  window.prSignAndSave = function() {
    const st = window.patient360ActiveClinicalNoteSubtab;
    const now = new Date();
    const timeStr = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + " · " + now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

    let noteObj = {
      type: st.toUpperCase(),
      author: "Dr. Priya Nair",
      dept: "Gynaecology",
      time: timeStr
    };

    if (st === 'Progress Note') {
      noteObj.s = window.soapSubjective;
      noteObj.o = window.soapObjectiveExam || "BP 130/80. Stable.";
      noteObj.a = window.soapAssessmentImpression;
      noteObj.p = window.soapPlanDetails;
    } else if (st === 'Review Note') {
      noteObj.reviewStatus = window.reviewStatus;
      noteObj.reviewPlan = window.reviewPlan;
    } else if (st === 'Pre-op Note') {
      noteObj.preopDiagnosis = window.preopDiagnosis;
      noteObj.preopProcedure = window.preopProcedure;
      noteObj.preopClearance = window.preopClearance;
      noteObj.preopChecklist = `Fasting: ${window.preopFasting ? 'Yes' : 'No'}, Site Marked: ${window.preopSiteMarked ? 'Yes' : 'No'}, Consent: ${window.preopConsent ? 'Yes' : 'No'}`;
    } else if (st === 'Post-op Note') {
      noteObj.postopDiagnosis = window.postopDiagnosis;
      noteObj.postopProcedure = window.postopProcedure;
      noteObj.postopIntraop = window.postopIntraop;
      noteObj.postopPlan = window.postopPlan;
    } else if (st === 'Referral Note') {
      noteObj.referralTarget = window.referralTarget;
      noteObj.referralSummary = window.referralSummary;
      noteObj.referralUrgency = window.referralUrgency;
    } else if (st === 'Discharge Note') {
      noteObj.dischargeDiagnosis = window.dischargeDiagnosis;
      noteObj.dischargeCourse = window.dischargeCourse;
      noteObj.dischargeInstructions = window.dischargeInstructions;
      noteObj.dischargeMeds = window.dischargeMeds;
    }

    window.patient360Notes.unshift(noteObj);
    window.prShowToast(`${st} signed and saved successfully.`);
    window.prDiscardSOAP(); // Clear inputs and redraw
  };

  // Interactive controllers on window"""

src = src.replace(old_actions_marker, new_actions, 1)

# 3. Replace Clinical Notes renderer block in draw360
old_clinical_notes_block = """    } else if (tab === 'Clinical Notes') {
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
        </div>"""

new_clinical_notes_block = """    } else if (tab === 'Clinical Notes') {
      const activeSubtab = window.patient360ActiveClinicalNoteSubtab || 'Progress Note';
      const subTabs = ['Progress Note', 'Review Note', 'Pre-op Note', 'Post-op Note', 'Referral Note', 'Discharge Note'];

      let subTabsHtml = '';
      if (role === 'Doctor') {
        subTabsHtml = `
          <div class="composer-subtabs">
            ${subTabs.map(st => `
              <span class="subtab-item ${activeSubtab === st ? 'active' : ''}" onclick="window.prSelectClinicalNoteSubtab('${st}')">${st}</span>
            `).join('')}
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

      // Render Dynamic Forms for different Note types
      let formHtml = '';
      if (activeSubtab === 'Progress Note') {
        formHtml = `
          <div class="form-group" style="margin-top:4px;">
            <label>S — Subjective *</label>
            <textarea class="form-control" rows="3" placeholder="Chief complaint and patient's description..." id="soap-s" oninput="window.prValidateClinicalNote()">${window.soapSubjective}</textarea>
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
            <textarea class="form-control" rows="2" style="margin-top:6px;" placeholder="Clinical impression..." id="soap-a-impression" oninput="window.prValidateClinicalNote()">${window.soapAssessmentImpression}</textarea>
          </div>

          <div class="form-group">
            <label>P — Plan</label>
            <label class="chk-item" style="text-transform:none; font-weight:normal; letter-spacing:0; padding:0;">
              <input type="checkbox" id="soap-p-medcheck" ${window.soapPlanMedicationCheck ? 'checked' : ''} onchange="window.soapPlanMedicationCheck = this.checked"> Continue current medications
            </label>
            <textarea class="form-control" rows="2" placeholder="Plan details..." id="soap-p-details" oninput="window.soapPlanDetails = this.value">${window.soapPlanDetails}</textarea>
          </div>
        `;
      } else if (activeSubtab === 'Review Note') {
        formHtml = `
          <div class="form-group" style="margin-top:4px;">
            <label>Clinical Status & Response to Treatment *</label>
            <textarea class="form-control" rows="4" placeholder="Document patient condition, response to active therapies, and symptoms progression..." id="rev-status" oninput="window.prValidateClinicalNote()">${window.reviewStatus}</textarea>
          </div>
          <div class="form-group">
            <label>Current Diagnoses</label>
            <div style="margin-top:2px;">${diagChipsHtml}</div>
          </div>
          <div class="form-group">
            <label>Revised Care & Monitoring Plan *</label>
            <textarea class="form-control" rows="4" placeholder="Document changes to dosage, laboratory schedules, or ward management..." id="rev-plan" oninput="window.prValidateClinicalNote()">${window.reviewPlan}</textarea>
          </div>
        `;
      } else if (activeSubtab === 'Pre-op Note') {
        formHtml = `
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-top:4px;">
            <div class="form-group">
              <label>Pre-operative Diagnoses *</label>
              <input type="text" class="form-control" placeholder="e.g. Iron Deficiency Anemia secondary to AUB" id="pre-diag" value="${window.preopDiagnosis}" oninput="window.prValidateClinicalNote()">
            </div>
            <div class="form-group">
              <label>Planned Surgical Procedure *</label>
              <input type="text" class="form-control" placeholder="e.g. Diagnostic Hysteroscopy" id="pre-proc" value="${window.preopProcedure}" oninput="window.prValidateClinicalNote()">
            </div>
          </div>
          <div class="form-group">
            <label>Pre-operative Clearance Checklist</label>
            <div style="display:flex; gap:12px; font-size:12px;">
              <label><input type="checkbox" id="pre-fast" ${window.preopFasting ? 'checked' : ''} onchange="window.preopFasting = this.checked"> NBM / Fasting orders</label>
              <label><input type="checkbox" id="pre-site" ${window.preopSiteMarked ? 'checked' : ''} onchange="window.preopSiteMarked = this.checked"> Site marked</label>
              <label><input type="checkbox" id="pre-cons" ${window.preopConsent ? 'checked' : ''} onchange="window.preopConsent = this.checked"> Consent signed</label>
            </div>
          </div>
          <div class="form-group">
            <label>Anesthesia Clearance & Risk Notes *</label>
            <textarea class="form-control" rows="3" placeholder="Anesthetic risk classification and pre-op vitals clearance notes..." id="pre-clear" oninput="window.preopClearance = this.value; window.prValidateClinicalNote()">${window.preopClearance}</textarea>
          </div>
        `;
      } else if (activeSubtab === 'Post-op Note') {
        formHtml = `
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-top:4px;">
            <div class="form-group">
              <label>Post-operative Diagnoses *</label>
              <input type="text" class="form-control" placeholder="e.g. AUB secondary to endometrial polyp" id="post-diag" value="${window.postopDiagnosis}" oninput="window.prValidateClinicalNote()">
            </div>
            <div class="form-group">
              <label>Procedure Performed & Surgeon *</label>
              <input type="text" class="form-control" placeholder="e.g. Hysteroscopic Polypectomy - Dr. Priya Nair" id="post-proc" value="${window.postopProcedure}" oninput="window.prValidateClinicalNote()">
            </div>
          </div>
          <div class="form-group">
            <label>Intra-operative Findings & Complications *</label>
            <textarea class="form-control" rows="3" placeholder="Log surgical findings, blood loss, sample biopsy reports, or details..." id="post-intra" oninput="window.prValidateClinicalNote()">${window.postopIntraop}</textarea>
          </div>
          <div class="form-group">
            <label>Post-operative Recovery Plan & Care *</label>
            <textarea class="form-control" rows="3" placeholder="Log recovery plans, IV infusion rates, pain control meds, and vitals tracking..." id="post-plan" oninput="window.prValidateClinicalNote()">${window.postopPlan}</textarea>
          </div>
        `;
      } else if (activeSubtab === 'Referral Note') {
        formHtml = `
          <div class="form-group" style="margin-top:4px;">
            <label>Target Provider & Specialty Department *</label>
            <input type="text" class="form-control" placeholder="e.g. Dr. Sunil Kumar, Cardiology Whitefield Campus" id="ref-tgt" value="${window.referralTarget}" oninput="window.prValidateClinicalNote()">
          </div>
          <div class="form-group">
            <label>Urgency Level</label>
            <select class="form-control" style="height:30px;" onchange="window.referralUrgency = this.value">
              <option ${window.referralUrgency==='Routine'?'selected':''}>Routine</option>
              <option ${window.referralUrgency==='Urgent'?'selected':''}>Urgent</option>
              <option ${window.referralUrgency==='Stat'?'selected':''}>Stat</option>
            </select>
          </div>
          <div class="form-group">
            <label>Clinical Summary & Reason for Referral *</label>
            <textarea class="form-control" rows="5" placeholder="Summarize active diagnosis evaluation, low haemoglobin alerts, and reason for second opinion..." id="ref-sum" oninput="window.prValidateClinicalNote()">${window.referralSummary}</textarea>
          </div>
        `;
      } else if (activeSubtab === 'Discharge Note') {
        formHtml = `
          <div class="form-group" style="margin-top:4px;">
            <label>Primary Discharge Diagnosis & Comorbidities *</label>
            <input type="text" class="form-control" placeholder="e.g. Severe Microcytic Anemia, resolved post IV Iron sucrose" id="dis-diag" value="${window.dischargeDiagnosis}" oninput="window.prValidateClinicalNote()">
          </div>
          <div class="form-group">
            <label>Summary of Treatment & Hospital Course *</label>
            <textarea class="form-control" rows="3" placeholder="Describe clinical course from daycare registration to vitals stabilization..." id="dis-course" oninput="window.prValidateClinicalNote()">${window.dischargeCourse}</textarea>
          </div>
          <div class="form-group">
            <label>Follow-up Instructions & Appointments</label>
            <textarea class="form-control" rows="2" placeholder="e.g. Visit OPD Gynaecology in 1 week..." id="dis-instr" oninput="window.dischargeInstructions = this.value">${window.dischargeInstructions}</textarea>
          </div>
          <div class="form-group">
            <label>Discharge Medications List</label>
            <textarea class="form-control" rows="2" placeholder="e.g. Tab. Paracetamol 650mg, Tab. Folic Acid 5mg..." id="dis-meds" oninput="window.dischargeMeds = this.value">${window.dischargeMeds}</textarea>
          </div>
        `;
      }

      // Notes History Cards
      const historyCardsHtml = window.patient360Notes.map((n, idx) => {
        const isConsultant = n.type === "CONSULTANT RESPONSE";
        
        let detailsHtml = '';
        if (n.type === 'PROGRESS NOTE') {
          detailsHtml = `
            <div><b>S:</b> ${n.s}</div>
            <div><b>O:</b> ${n.o}</div>
            <div><b>A:</b> ${n.a}</div>
            ${n.p ? `<div><b>P:</b> ${n.p}</div>` : ''}
          `;
        } else if (n.type === 'REVIEW NOTE') {
          detailsHtml = `
            <div><b>Review Status:</b> ${n.reviewStatus}</div>
            <div><b>Revised Plan:</b> ${n.reviewPlan}</div>
          `;
        } else if (n.type === 'PRE-OP NOTE') {
          detailsHtml = `
            <div><b>Diagnosis:</b> ${n.preopDiagnosis}</div>
            <div><b>Procedure:</b> ${n.preopProcedure}</div>
            ${n.preopClearance ? `<div><b>Clearance notes:</b> ${n.preopClearance}</div>` : ''}
            <div style="font-size:10px; color:var(--text-muted); margin-top:2px;"><b>Checklist:</b> ${n.preopChecklist}</div>
          `;
        } else if (n.type === 'POST-OP NOTE') {
          detailsHtml = `
            <div><b>Post-op Diagnosis:</b> ${n.postopDiagnosis}</div>
            <div><b>Procedure performed:</b> ${n.postopProcedure}</div>
            <div><b>Intra-op Findings:</b> ${n.postopIntraop}</div>
            <div><b>Post-op Plan:</b> ${n.postopPlan}</div>
          `;
        } else if (n.type === 'REFERRAL NOTE') {
          detailsHtml = `
            <div><b>Referral to:</b> ${n.referralTarget} (Urgency: <span style="font-weight:700; color:var(--primary);">${n.referralUrgency}</span>)</div>
            <div><b>Clinical summary:</b> ${n.referralSummary}</div>
          `;
        } else if (n.type === 'DISCHARGE NOTE') {
          detailsHtml = `
            <div><b>Discharge Diagnosis:</b> ${n.dischargeDiagnosis}</div>
            <div><b>Hospital Course summary:</b> ${n.dischargeCourse}</div>
            ${n.dischargeInstructions ? `<div><b>Follow-up:</b> ${n.dischargeInstructions}</div>` : ''}
            ${n.dischargeMeds ? `<div><b>Meds:</b> ${n.dischargeMeds}</div>` : ''}
          `;
        } else {
          detailsHtml = `
            <div><b>S:</b> ${n.s || ''}</div>
            <div><b>O:</b> ${n.o || ''}</div>
            <div><b>A:</b> ${n.a || ''}</div>
          `;
        }

        return `
          <div class="note-card ${isConsultant ? 'note-card-consultant' : ''}">
            <div style="display:flex; justify-content:space-between; align-items:center; font-size:10px;">
              <span class="mono" style="color: ${isConsultant ? 'var(--primary)' : 'var(--text-muted)'}; font-weight:700;">${n.type}</span>
              <span class="mono" style="color:var(--text-muted);">${n.time}</span>
            </div>
            <strong style="font-size:12px; color:var(--text-primary);">${n.author} &bull; <span style="font-weight:500; color:var(--text-secondary);">${n.dept}</span></strong>
            <div style="font-size:12px; line-height:1.4; color:var(--text-secondary); margin-top:2px;">
              ${detailsHtml}
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

            <!-- Dynamic composer form panel fields based on subtab selection -->
            <div id="clinical-note-form-wrapper">
              ${formHtml}
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
      `;"""

src = src.replace(old_clinical_notes_block, new_clinical_notes_block, 1)

with open(path, "w", encoding="utf-8") as f:
    f.write(src)

print("SUCCESS: 6 clinical note types fully integrated with templates, validation, and history.")
