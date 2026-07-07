#!/usr/bin/env python3

path = "/Users/home/Desktop/Saronil IHS/Updated HIS /assets/js/views/patientsView.js"

with open(path, "r", encoding="utf-8") as f:
    src = f.read()

# 1. Initialize modal state variables & global arrays at renderPatient360Profile start
init_target = "  if (window.patient360CriticalAcked === undefined) {\n    window.patient360CriticalAcked = false;\n  }"
init_replacement = """  if (window.patient360CriticalAcked === undefined) {
    window.patient360CriticalAcked = false;
  }
  if (window.p360ActiveModal === undefined) {
    window.p360ActiveModal = null;
  }
  if (window.prescribeSearchQuery === undefined) {
    window.prescribeSearchQuery = "";
  }
  if (window.prescribeSelectedDrug === undefined) {
    window.prescribeSelectedDrug = null;
  }
  if (window.prescribeDose === undefined) {
    window.prescribeDose = "Once daily";
  }
  if (window.prescribeDuration === undefined) {
    window.prescribeDuration = "5 days";
  }
  if (window.prescribeInstructions === undefined) {
    window.prescribeInstructions = "";
  }
  
  if (window.patient360Vitals === undefined) {
    window.patient360Vitals = [
      { d: "24 Jun 2026", t: "09:30 AM", bp: "130/80", hr: 74, rr: 16, temp: "98.4°F", spo2: "99%", wt: "60 kg", by: "Staff Nurse Mary", news: 0 },
      { d: "24 Jun 2026", t: "06:00 AM", bp: "125/82", hr: 72, rr: 16, temp: "98.2°F", spo2: "98%", wt: "60 kg", by: "Staff Nurse Mary", news: 0 },
      { d: "23 Jun 2026", t: "10:00 PM", bp: "120/78", hr: 70, rr: 14, temp: "98.0°F", spo2: "99%", wt: "60 kg", by: "Nurse John", news: 0 },
      { d: "23 Jun 2026", t: "06:00 PM", bp: "132/84", hr: 78, rr: 18, temp: "98.6°F", spo2: "97%", wt: "60 kg", by: "Nurse John", news: 1 },
      { d: "23 Jun 2026", t: "02:00 PM", bp: "128/80", hr: 75, rr: 16, temp: "98.4°F", spo2: "99%", wt: "60 kg", by: "Staff Nurse Mary", news: 0 },
      { d: "23 Jun 2026", t: "10:00 AM", bp: "130/80", hr: 74, rr: 16, temp: "98.4°F", spo2: "99%", wt: "60 kg", by: "Staff Nurse Mary", news: 0 },
      { d: "23 Jun 2026", t: "06:00 AM", bp: "124/80", hr: 72, rr: 15, temp: "98.2°F", spo2: "98%", wt: "60 kg", by: "Nurse John", news: 0 }
    ];
  }
  
  if (window.patient360Meds === undefined) {
    window.patient360Meds = [
      { drug: "Tab Pantoprazole 40mg", route: "Oral", freq: "Once daily", dur: "5 days", status: "Active", author: "Dr. Priya Nair" },
      { drug: "Inj. Ondansetron 4mg", route: "IV", freq: "SOS", dur: "—", status: "PRN", author: "Dr. Priya Nair" },
      { drug: "Tab Ferrous Sulphate 200mg", route: "Oral", freq: "Twice daily", dur: "30 days", status: "Active", author: "Dr. Priya Nair" },
      { drug: "Tab Amlodipine 5mg", route: "Oral", freq: "Once daily", dur: "Ongoing", status: "Active", author: "Dr. Priya Nair" },
      { drug: "Tab Metformin 500mg", route: "Oral", freq: "Twice daily", dur: "Ongoing", status: "Active", author: "Dr. Priya Nair" }
    ];
  }"""

src = src.replace(init_target, init_replacement, 1)

# 2. Add Modal CSS styles to p360Styles stylesheet
old_styles_marker = "      /* Timeline styles */"
new_styles = """      /* Modal Styles */
      .p360-modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(15, 23, 42, 0.4);
        backdrop-filter: blur(4px);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 2000;
      }
      .p360-modal-content {
        background: #ffffff;
        border-radius: 12px;
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
        width: 520px;
        max-width: 95%;
        max-height: 85vh;
        display: flex;
        flex-direction: column;
        overflow: hidden;
        border: 1px solid var(--border-color, #e2e8f0);
        animation: modalFadeIn 0.15s ease-out;
      }
      @keyframes modalFadeIn {
        from { opacity: 0; transform: scale(0.96); }
        to { opacity: 1; transform: scale(1); }
      }
      .p360-modal-header {
        padding: 12px 16px;
        border-bottom: 1px solid var(--border-color, #e2e8f0);
        display: flex;
        justify-content: space-between;
        align-items: center;
        background: var(--bg-surface-elevated, #f1f5f9);
      }
      .p360-modal-header h3 {
        margin: 0;
        font-size: 13px;
        font-weight: 700;
        color: var(--text-primary, #0f172a);
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
      .p360-modal-close {
        font-size: 20px;
        font-weight: bold;
        color: var(--text-muted, #94a3b8);
        cursor: pointer;
        background: transparent;
        border: none;
        outline: none;
      }
      .p360-modal-close:hover {
        color: var(--text-primary, #0f172a);
      }
      .p360-modal-body {
        padding: 16px;
        overflow-y: auto;
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
      .p360-modal-footer {
        padding: 12px 16px;
        border-top: 1px solid var(--border-color, #e2e8f0);
        display: flex;
        justify-content: flex-end;
        gap: 8px;
        background: var(--bg-surface-elevated, #f1f5f9);
      }

      /* Timeline styles */"""

src = src.replace(old_styles_marker, new_styles, 1)

# 3. Replace local vitalsRows in draw360
vitals_old = """    } else if (tab === 'Vitals') {
      const vitalsRows = [
        { d: "24 Jun 2026", t: "09:30 AM", bp: "130/80", hr: 74, rr: 16, temp: "98.4°F", spo2: "99%", wt: "60 kg", by: "Staff Nurse Mary", news: 0 },
        { d: "24 Jun 2026", t: "06:00 AM", bp: "125/82", hr: 72, rr: 16, temp: "98.2°F", spo2: "98%", wt: "60 kg", by: "Staff Nurse Mary", news: 0 },
        { d: "23 Jun 2026", t: "10:00 PM", bp: "120/78", hr: 70, rr: 14, temp: "98.0°F", spo2: "99%", wt: "60 kg", by: "Nurse John", news: 0 },
        { d: "23 Jun 2026", t: "06:00 PM", bp: "132/84", hr: 78, rr: 18, temp: "98.6°F", spo2: "97%", wt: "60 kg", by: "Nurse John", news: 1 },
        { d: "23 Jun 2026", t: "02:00 PM", bp: "128/80", hr: 75, rr: 16, temp: "98.4°F", spo2: "99%", wt: "60 kg", by: "Staff Nurse Mary", news: 0 },
        { d: "23 Jun 2026", t: "10:00 AM", bp: "130/80", hr: 74, rr: 16, temp: "98.4°F", spo2: "99%", wt: "60 kg", by: "Staff Nurse Mary", news: 0 },
        { d: "23 Jun 2026", t: "06:00 AM", bp: "124/80", hr: 72, rr: 15, temp: "98.2°F", spo2: "98%", wt: "60 kg", by: "Nurse John", news: 0 }
      ];"""

vitals_new = """    } else if (tab === 'Vitals') {
      const vitalsRows = window.patient360Vitals;"""

src = src.replace(vitals_old, vitals_new, 1)

# 4. Replace local activeMeds in draw360
meds_old = """    } else if (tab === 'Medications') {
      const activeMeds = [
        { drug: "Tab Pantoprazole 40mg", route: "Oral", freq: "Once daily", dur: "5 days", status: "Active", author: "Dr. Priya Nair" },
        { drug: "Inj. Ondansetron 4mg", route: "IV", freq: "SOS", dur: "—", status: "PRN", author: "Dr. Priya Nair" },
        { drug: "Tab Ferrous Sulphate 200mg", route: "Oral", freq: "Twice daily", dur: "30 days", status: "Active", author: "Dr. Priya Nair" },
        { drug: "Tab Amlodipine 5mg", route: "Oral", freq: "Once daily", dur: "Ongoing", status: "Active", author: "Dr. Priya Nair" },
        { drug: "Tab Metformin 500mg", route: "Oral", freq: "Twice daily", dur: "Ongoing", status: "Active", author: "Dr. Priya Nair" }
      ];"""

meds_new = """    } else if (tab === 'Medications') {
      const activeMeds = window.patient360Meds;"""

src = src.replace(meds_old, meds_new, 1)

# 5. Overwrite window.prTriggerAction to set the active modal instead of switching tabs or alerts
old_trigger_action = """  window.prTriggerAction = function(actionLabel) {
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

new_trigger_action = """  window.prTriggerAction = function(actionLabel) {
    const labelClean = actionLabel.replace(/[^\\w\\s&]/g, '').trim();
    
    if (labelClean.includes("Write Note")) {
      window.p360ActiveModal = 'Write Note';
    } else if (labelClean.includes("Prescribe") || labelClean.includes("Prescriptions")) {
      window.p360ActiveModal = 'Prescribe';
      window.prescribeSearchQuery = "";
      window.prescribeSelectedDrug = null;
    } else if (labelClean.includes("Order Lab")) {
      window.p360ActiveModal = 'Order Lab';
    } else if (labelClean.includes("Radiology")) {
      window.p360ActiveModal = 'Radiology';
    } else if (labelClean.includes("Record Vitals")) {
      window.p360ActiveModal = 'Record Vitals';
    } else if (labelClean.includes("Nursing Note") || labelClean.includes("Nurse Note")) {
      window.p360ActiveModal = 'Nursing Note';
    } else if (labelClean.includes("Discharge")) {
      window.p360ActiveModal = 'Discharge';
    } else if (labelClean.includes("Transfer") || labelClean.includes("Change Bed")) {
      window.p360ActiveModal = 'Transfer';
    } else if (labelClean.includes("Pay") || labelClean.includes("Collect Payment")) {
      window.p360ActiveModal = 'Collect Payment';
    } else if (labelClean.includes("Receipt")) {
      window.p360ActiveModal = 'Receipt';
    } else if (labelClean.includes("Dispense") || labelClean.includes("Dispensed")) {
      window.p360ActiveModal = 'Dispense';
    } else if (labelClean.includes("SMS") || labelClean.includes("Send SMS")) {
      window.p360ActiveModal = 'Send SMS';
    } else if (labelClean.includes("Appointment")) {
      window.p360ActiveModal = 'Appointment';
    } else if (labelClean.includes("Print")) {
      window.print();
      return;
    } else {
      window.prShowToast(`${actionLabel} opened`);
      return;
    }
    
    draw360();
  };

  window.prCloseModal = function() {
    window.p360ActiveModal = null;
    draw360();
  };"""

src = src.replace(old_trigger_action, new_trigger_action, 1)

# 6. Define window.prSelectWorkspaceTab to dismiss the modal when switching tabs
old_select_tab = """  window.prSelectWorkspaceTab = function(tName) {
    window.patient360ActiveTab = tName;
    draw360();
  };"""

new_select_tab = """  window.prSelectWorkspaceTab = function(tName) {
    window.patient360ActiveTab = tName;
    window.p360ActiveModal = null;
    draw360();
  };"""

src = src.replace(old_select_tab, new_select_tab, 1)

# 7. Add helper script actions on window for modal actions (Prescribing, Vitals Logging, SOAP Submission, etc.)
modal_actions = """  // Modal Form Action Handlers
  window.prSearchPrescribeDrug = function(val) {
    window.prescribeSearchQuery = val;
    window.prescribeSelectedDrug = null;
    draw360();
  };

  window.prSelectPrescribeDrug = function(name, stock, altName) {
    if (!stock) {
      window.prShowToast(`Selected drug is OUT OF STOCK. Recommended alternative: ${altName}`);
      return;
    }
    window.prescribeSelectedDrug = name;
    window.prescribeSearchQuery = name;
    draw360();
  };

  window.prUseAlternativeDrug = function(altName) {
    window.prescribeSelectedDrug = altName;
    window.prescribeSearchQuery = altName;
    window.prShowToast(`Alternative drug selected: ${altName}`);
    draw360();
  };

  window.prSavePrescription = function() {
    const drug = window.prescribeSelectedDrug || window.prescribeSearchQuery;
    if (!drug || drug.trim() === "") {
      window.prShowToast("Please search and select a medicine.");
      return;
    }
    
    const dose = document.getElementById("m-dose").value;
    const dur = document.getElementById("m-dur").value;
    
    window.patient360Meds.unshift({
      drug: drug,
      route: "Oral",
      freq: dose,
      dur: dur,
      status: "Active",
      author: `Dr. ${window.patient360Role === 'Doctor' ? 'Priya Nair' : 'Ramesh Kumar'}`
    });
    
    window.prShowToast(`Prescribed: ${drug}`);
    window.prCloseModal();
  };

  window.prSaveModalVitals = function() {
    const sbp = document.getElementById("mv-sbp").value;
    const dbp = document.getElementById("mv-dbp").value;
    const hr = document.getElementById("mv-hr").value;
    const rr = document.getElementById("mv-rr").value;
    const temp = document.getElementById("mv-temp").value;
    const spo2 = document.getElementById("mv-spo2").value;
    
    if (!sbp || !dbp || !hr || !rr || !temp || !spo2) {
      window.prShowToast("Please enter all vital values.");
      return;
    }
    
    // Simple NEWS2 calculation logic
    let newsScore = 0;
    const rrVal = parseInt(rr);
    const hrVal = parseInt(hr);
    const spo2Val = parseInt(spo2);
    
    if (rrVal >= 25 || rrVal <= 8) newsScore += 3;
    else if (rrVal >= 21 || rrVal <= 11) newsScore += 2;
    
    if (hrVal >= 131 || hrVal <= 40) newsScore += 3;
    else if (hrVal >= 111 || hrVal <= 50) newsScore += 1;
    
    if (spo2Val <= 91) newsScore += 3;
    else if (spo2Val <= 93) newsScore += 2;
    else if (spo2Val <= 95) newsScore += 1;

    const now = new Date();
    const dateStr = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

    window.patient360Vitals.unshift({
      d: dateStr,
      t: timeStr,
      bp: `${sbp}/${dbp}`,
      hr: hrVal,
      rr: rrVal,
      temp: `${temp}°F`,
      spo2: `${spo2}%`,
      wt: "60 kg",
      by: "Nurse Mary",
      news: newsScore
    });

    window.prShowToast(`Vitals logged successfully. Computed NEWS2: ${newsScore}`);
    window.prCloseModal();
  };

  window.prSaveModalSOAP = function() {
    const s = document.getElementById("ms-s").value;
    const o = document.getElementById("ms-o").value;
    const a = document.getElementById("ms-a").value;
    
    if (!s || !a) {
      window.prShowToast("Subjective and Assessment fields are required.");
      return;
    }
    
    const now = new Date();
    const timeStr = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + " · " + now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    
    window.patient360Notes.unshift({
      type: "PROGRESS NOTE",
      author: "Dr. Priya Nair",
      dept: "Gynaecology",
      time: timeStr,
      s: s,
      o: o || "BP 130/80. Stable.",
      a: a
    });
    
    window.prShowToast("SOAP Progress Note saved.");
    window.prCloseModal();
  };"""

# Inject handlers at the end of window actions section
src = src.replace("  // Interactive controllers on window", modal_actions + "\n\n  // Interactive controllers on window", 1)

# 8. Inject the modal rendering call at the end of container.innerHTML template string
old_inner_html_end = """          <!-- Viewport scrollable content -->
          <div class="p360-viewport" style="flex:1; overflow-y:auto; background:var(--bg-surface, #ffffff); border:1px solid var(--border-color, #e2e8f0); border-radius:8px; padding:16px; height:100%;">
            ${tabContentHtml}
          </div>

        </div>

      </div>
    `;"""

# Let's write the renderModalHtml() function inside draw360() right before container.innerHTML = `...`
old_inner_html_start = "    container.innerHTML = `\n      ${p360Styles}"

render_modal_helper = """    function renderModalHtml() {
      const activeModal = window.p360ActiveModal;
      if (!activeModal) return "";
      
      let title = "";
      let bodyHtml = "";
      let footerHtml = "";
      
      if (activeModal === 'Prescribe') {
        title = "💊 Prescribe Medication";
        
        const drugCatalog = [
          { name: "Tab. Pantoprazole 40mg", stock: true },
          { name: "Tab. Paracetamol 650mg", stock: true },
          { name: "Tab. Amoxicillin 500mg", stock: false, alt: "Tab. Azithromycin 500mg" },
          { name: "Tab. Montelukast 10mg", stock: false, alt: "Tab. Levocetirizine 5mg" },
          { name: "Syp. Cremaffin 150ml", stock: true },
          { name: "Tab. Ferrous Sulphate 200mg", stock: true },
          { name: "Tab. Amlodipine 5mg", stock: true },
          { name: "Tab. Metformin 500mg", stock: true }
        ];
        
        let matchingCatalog = [];
        const q = window.prescribeSearchQuery.trim().toLowerCase();
        if (q.length > 0) {
          matchingCatalog = drugCatalog.filter(d => d.name.toLowerCase().includes(q));
        } else {
          matchingCatalog = drugCatalog.slice(0, 4); // Default suggestions
        }
        
        const isSelected = window.prescribeSelectedDrug !== null;
        let selectedDrugData = null;
        if (isSelected) {
          selectedDrugData = drugCatalog.find(d => d.name === window.prescribeSelectedDrug);
        }
        
        bodyHtml = `
          <div class="form-group">
            <label>Search Medicine *</label>
            <input type="text" class="form-control" placeholder="Type medicine name (e.g. Paracetamol, Montelukast)..." value="${window.prescribeSearchQuery}" oninput="window.prSearchPrescribeDrug(this.value)">
            
            <!-- Suggestions Dropdown list -->
            ${!isSelected ? `
              <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:6px; max-height:120px; overflow-y:auto; margin-top:4px;">
                ${matchingCatalog.map(d => `
                  <div style="padding:6px 12px; cursor:pointer; font-size:12px; border-bottom:1px solid #f1f5f9; display:flex; justify-content:space-between;" onclick="window.prSelectPrescribeDrug('${d.name}', ${d.stock}, '${d.alt || ''}')">
                    <span>${d.name}</span>
                    ${d.stock ? '<span style="color:#059669; font-size:10px;">In Stock</span>' : '<span style="color:#ef4444; font-size:10px;">Out of Stock</span>'}
                  </div>
                `).join('')}
              </div>
            ` : ''}
          </div>
          
          <!-- Out of stock alert and suggested alternatives -->
          ${isSelected && !selectedDrugData.stock ? `
            <div style="background:#fee2e2; border:1px solid #fecaca; color:#b91c1c; padding:8px 12px; border-radius:6px; font-size:11px; margin-top:2px;">
              <span style="font-weight:700;">⚠️ OUT OF STOCK at Bangalore Campus Pharmacy.</span>
              <div style="margin-top:6px; display:flex; align-items:center; gap:6px;">
                <span>Recommended Alternative:</span>
                <button class="btn-qa-primary" style="padding:2px 8px; font-size:10px; background:#ef4444;" onclick="window.prUseAlternativeDrug('${selectedDrugData.alt}')">${selectedDrugData.alt}</button>
              </div>
            </div>
          ` : ''}
          
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-top:8px;">
            <div class="form-group">
              <label>Dose Frequency</label>
              <select class="form-control" id="m-dose">
                <option>Once daily</option>
                <option>Twice daily</option>
                <option>Thrice daily</option>
                <option>PRN / SOS</option>
              </select>
            </div>
            <div class="form-group">
              <label>Duration</label>
              <select class="form-control" id="m-dur">
                <option>5 days</option>
                <option>10 days</option>
                <option>30 days</option>
                <option>Ongoing</option>
              </select>
            </div>
          </div>
          
          <div class="form-group" style="margin-top:4px;">
            <label>Special Instructions</label>
            <textarea class="form-control" id="m-instr" rows="2" placeholder="e.g. Take before food..."></textarea>
          </div>
        `;
        
        footerHtml = `
          <button class="btn-qa-secondary" style="height:32px; font-size:11px;" onclick="window.prCloseModal()">Cancel</button>
          <button class="btn-qa-primary" style="height:32px; font-size:11px; width:auto;" onclick="window.prSavePrescription()">Save Prescription</button>
        `;
      }
      else if (activeModal === 'Record Vitals') {
        title = "📊 Record Vitals Log";
        bodyHtml = `
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
            <div class="form-group">
              <label>Systolic BP (mmHg) *</label>
              <input type="number" class="form-control" id="mv-sbp" value="120">
            </div>
            <div class="form-group">
              <label>Diastolic BP (mmHg) *</label>
              <input type="number" class="form-control" id="mv-dbp" value="80">
            </div>
            <div class="form-group">
              <label>Heart Rate (bpm) *</label>
              <input type="number" class="form-control" id="mv-hr" value="72">
            </div>
            <div class="form-group">
              <label>Respiratory Rate (bpm) *</label>
              <input type="number" class="form-control" id="mv-rr" value="16">
            </div>
            <div class="form-group">
              <label>Temperature (°F) *</label>
              <input type="number" step="0.1" class="form-control" id="mv-temp" value="98.6">
            </div>
            <div class="form-group">
              <label>SpO₂ (%) *</label>
              <input type="number" class="form-control" id="mv-spo2" value="99">
            </div>
          </div>
        `;
        footerHtml = `
          <button class="btn-qa-secondary" style="height:32px; font-size:11px;" onclick="window.prCloseModal()">Cancel</button>
          <button class="btn-qa-primary" style="height:32px; font-size:11px; width:auto;" onclick="window.prSaveModalVitals()">Save Vitals</button>
        `;
      }
      else if (activeModal === 'Write Note') {
        title = "📝 Write SOAP Progress Note";
        bodyHtml = `
          <div class="form-group">
            <label>S — Subjective *</label>
            <textarea class="form-control" id="ms-s" rows="3" placeholder="Chief complaints and patient descriptions..."></textarea>
          </div>
          <div class="form-group">
            <label>O — Objective</label>
            <textarea class="form-control" id="ms-o" rows="2" placeholder="Clinical exam findings..."></textarea>
          </div>
          <div class="form-group">
            <label>A — Assessment & Clinical Diagnosis *</label>
            <textarea class="form-control" id="ms-a" rows="2" placeholder="Primary evaluation assessment..."></textarea>
          </div>
        `;
        footerHtml = `
          <button class="btn-qa-secondary" style="height:32px; font-size:11px;" onclick="window.prCloseModal()">Cancel</button>
          <button class="btn-qa-primary" style="height:32px; font-size:11px; width:auto;" onclick="window.prSaveModalSOAP()">Save Note</button>
        `;
      }
      else if (activeModal === 'Order Lab') {
        title = "🔬 Order Laboratory Panels";
        bodyHtml = `
          <span style="font-size:11px; color:var(--text-muted); font-weight:700; display:block; margin-bottom:4px;">SELECT PANELS</span>
          <div style="display:flex; flex-direction:column; gap:8px;">
            <label class="chk-item"><input type="checkbox" id="ol-cbc" checked> Complete Blood Count (CBC)</label>
            <label class="chk-item"><input type="checkbox" id="ol-elec" checked> Serum Electrolytes (Na⁺, K⁺, Cl⁻)</label>
            <label class="chk-item"><input type="checkbox" id="ol-rft"> Renal Function Test (RFT)</label>
            <label class="chk-item"><input type="checkbox" id="ol-lft"> Liver Function Test (LFT)</label>
            <label class="chk-item"><input type="checkbox" id="ol-tsh"> Thyroid Profile (TSH)</label>
          </div>
        `;
        footerHtml = `
          <button class="btn-qa-secondary" style="height:32px; font-size:11px;" onclick="window.prCloseModal()">Cancel</button>
          <button class="btn-qa-primary" style="height:32px; font-size:11px; width:auto;" onclick="window.prShowToast('Lab order sent successfully'); window.prCloseModal()">Send Order</button>
        `;
      }
      else if (activeModal === 'Radiology') {
        title = "🩻 Order Radiology Imaging";
        bodyHtml = `
          <div class="form-group">
            <label>Select Study *</label>
            <select class="form-control" id="or-study">
              <option>Chest X-Ray PA View</option>
              <option>CT Abdomen & Pelvis</option>
              <option>MRI Brain Contrast</option>
              <option>USG Whole Abdomen</option>
            </select>
          </div>
          <div class="form-group">
            <label>Reason / Indication</label>
            <textarea class="form-control" rows="2" placeholder="e.g. Mild shortness of breath..."></textarea>
          </div>
        `;
        footerHtml = `
          <button class="btn-qa-secondary" style="height:32px; font-size:11px;" onclick="window.prCloseModal()">Cancel</button>
          <button class="btn-qa-primary" style="height:32px; font-size:11px; width:auto;" onclick="window.prShowToast('Radiology order placed'); window.prCloseModal()">Place Order</button>
        `;
      }
      else if (activeModal === 'Nursing Note') {
        title = "📝 Nursing Observation Shift Log";
        bodyHtml = `
          <div class="form-group">
            <label>Shift Observations *</label>
            <textarea class="form-control" rows="3" placeholder="Log shift findings..."></textarea>
          </div>
          <div class="form-group">
            <label>Actions Performed</label>
            <textarea class="form-control" rows="2" placeholder="e.g. Dressings changed, IV flushed..."></textarea>
          </div>
        `;
        footerHtml = `
          <button class="btn-qa-secondary" style="height:32px; font-size:11px;" onclick="window.prCloseModal()">Cancel</button>
          <button class="btn-qa-primary" style="height:32px; font-size:11px; width:auto;" onclick="window.prShowToast('Nursing shift log submitted'); window.prCloseModal()">Submit Log</button>
        `;
      }
      else if (activeModal === 'Discharge') {
        title = "🚪 Initiate Patient Discharge";
        bodyHtml = `
          <span style="font-size:11px; color:var(--text-muted); font-weight:700; display:block; margin-bottom:4px;">VERIFY CHECKLIST</span>
          <div style="display:flex; flex-direction:column; gap:6px;">
            <label class="chk-item"><input type="checkbox" checked disabled> Doctor Clearance Order Signed</label>
            <label class="chk-item"><input type="checkbox" checked> Nursing Handover Review Complete</label>
            <label class="chk-item"><input type="checkbox" checked> Pharmacy Returns Handed Over</label>
            <label class="chk-item"><input type="checkbox" checked> Billing Interim Clearance Done</label>
          </div>
        `;
        footerHtml = `
          <button class="btn-qa-secondary" style="height:32px; font-size:11px;" onclick="window.prCloseModal()">Cancel</button>
          <button class="btn-qa-primary" style="height:32px; font-size:11px; width:auto; background:#10b981;" onclick="window.prShowToast('Discharge process initiated successfully'); window.prCloseModal()">Confirm Discharge</button>
        `;
      }
      else if (activeModal === 'Transfer') {
        title = "↔ Transfer Patient Bed / Ward";
        bodyHtml = `
          <div class="form-group">
            <label>Target Ward *</label>
            <select class="form-control">
              <option>General Female Ward</option>
              <option>ICU Bay 2</option>
              <option>Deluxe Suite</option>
              <option>Daycare Ward (Current)</option>
            </select>
          </div>
          <div class="form-group">
            <label>Target Bed Number</label>
            <input type="text" class="form-control" value="F-102">
          </div>
        `;
        footerHtml = `
          <button class="btn-qa-secondary" style="height:32px; font-size:11px;" onclick="window.prCloseModal()">Cancel</button>
          <button class="btn-qa-primary" style="height:32px; font-size:11px; width:auto;" onclick="window.prShowToast('Transfer request submitted'); window.prCloseModal()">Initiate Transfer</button>
        `;
      }
      else {
        // Fallback for simple actions
        title = `Action: ${activeModal}`;
        bodyHtml = `
          <div style="font-size:13px; color:var(--text-secondary);">
            Are you sure you want to perform the <b>${activeModal}</b> action for Lakshmi Devi?
          </div>
        `;
        footerHtml = `
          <button class="btn-qa-secondary" style="height:32px; font-size:11px;" onclick="window.prCloseModal()">Cancel</button>
          <button class="btn-qa-primary" style="height:32px; font-size:11px; width:auto;" onclick="window.prShowToast('${activeModal} confirmed'); window.prCloseModal()">Confirm</button>
        `;
      }
      
      return `
        <div class="p360-modal-overlay" onclick="if(event.target === this) window.prCloseModal()">
          <div class="p360-modal-content">
            <div class="p360-modal-header">
              <h3>${title}</h3>
              <button class="p360-modal-close" onclick="window.prCloseModal()">&times;</button>
            </div>
            <div class="p360-modal-body">
              ${bodyHtml}
            </div>
            <div class="p360-modal-footer">
              ${footerHtml}
            </div>
          </div>
        </div>
      `;
    }

    container.innerHTML = `
      ${p360Styles}"""

src = src.replace(old_inner_html_start, render_modal_helper + "\n\n" + old_inner_html_start, 1)

# Now, append ${renderModalHtml()} at the very end of container.innerHTML right before closing string backtick
old_closing = """          <!-- Viewport scrollable content -->
          <div class="p360-viewport" style="flex:1; overflow-y:auto; background:var(--bg-surface, #ffffff); border:1px solid var(--border-color, #e2e8f0); border-radius:8px; padding:16px; height:100%;">
            ${tabContentHtml}
          </div>

        </div>

      </div>
    `;"""

new_closing = """          <!-- Viewport scrollable content -->
          <div class="p360-viewport" style="flex:1; overflow-y:auto; background:var(--bg-surface, #ffffff); border:1px solid var(--border-color, #e2e8f0); border-radius:8px; padding:16px; height:100%;">
            ${tabContentHtml}
          </div>

        </div>

      </div>
      
      ${renderModalHtml()}
    `;"""

src = src.replace(old_closing, new_closing, 1)

with open(path, "w", encoding="utf-8") as f:
    f.write(src)

print("SUCCESS: Modals system and out-of-stock suggestions successfully integrated.")
