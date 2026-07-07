#!/usr/bin/env python3

path = "/Users/home/Desktop/Saronil IHS/Updated HIS /assets/js/views/patientsView.js"

with open(path, "r", encoding="utf-8") as f:
    src = f.read()

# 1. Initialize catalogs and selected list states
init_target = "  if (window.p360ActiveModal === undefined) {\n    window.p360ActiveModal = null;\n  }"
init_replacement = """  if (window.p360ActiveModal === undefined) {
    window.p360ActiveModal = null;
  }
  if (window.p360SelectedLabs === undefined) {
    window.p360SelectedLabs = [];
  }
  if (window.p360SelectedRadiology === undefined) {
    window.p360SelectedRadiology = [];
  }
  if (window.p360SelectedMeds === undefined) {
    window.p360SelectedMeds = [];
  }
  if (window.labSearchQuery === undefined) {
    window.labSearchQuery = "";
  }
  if (window.radSearchQuery === undefined) {
    window.radSearchQuery = "";
  }
  if (window.medSearchQuery === undefined) {
    window.medSearchQuery = "";
  }

  // Production-ready Laboratory test catalog (30 items)
  if (window.patient360LabCatalog === undefined) {
    window.patient360LabCatalog = [
      { name: "Complete Blood Count (CBC)", type: "Panel", sample: "Whole Blood EDTA", price: 450 },
      { name: "Liver Function Test (LFT)", type: "Panel", sample: "Serum", price: 950 },
      { name: "Renal Function Test (RFT)", type: "Panel", sample: "Serum", price: 850 },
      { name: "Thyroid Profile (T3, T4, TSH)", type: "Panel", sample: "Serum", price: 1200 },
      { name: "Lipid Profile", type: "Panel", sample: "Serum", price: 1000 },
      { name: "HbA1c", type: "Test", sample: "Whole Blood EDTA", price: 600 },
      { name: "Urine Routine & Microscopy", type: "Test", sample: "Urine Spot", price: 250 },
      { name: "Blood Culture & Sensitivity", type: "Test", sample: "Whole Blood Culture", price: 1500 },
      { name: "Dengue Serology (NS1, IgG, IgM)", type: "Panel", sample: "Serum", price: 1100 },
      { name: "Vitamin D (25-Hydroxy)", type: "Test", sample: "Serum", price: 1600 },
      { name: "Serum Electrolytes (Na, K, Cl)", type: "Panel", sample: "Serum", price: 650 },
      { name: "Serum Ferritin", type: "Test", sample: "Serum", price: 900 },
      { name: "Vitamin B12", type: "Test", sample: "Serum", price: 1200 },
      { name: "Fasting Blood Sugar (FBS)", type: "Test", sample: "Fluoride Blood", price: 150 },
      { name: "Post Prandial Blood Sugar (PPBS)", type: "Test", sample: "Fluoride Blood", price: 150 },
      { name: "Random Blood Sugar (RBS)", type: "Test", sample: "Fluoride Blood", price: 150 },
      { name: "Uric Acid", type: "Test", sample: "Serum", price: 300 },
      { name: "Serum Calcium", type: "Test", sample: "Serum", price: 350 },
      { name: "Cardiac Enzymes (Troponin T)", type: "Panel", sample: "Serum", price: 2000 },
      { name: "C-Reactive Protein (CRP)", type: "Test", sample: "Serum", price: 600 },
      { name: "Erythrocyte Sedimentation Rate (ESR)", type: "Test", sample: "Whole Blood EDTA", price: 200 },
      { name: "Coagulation Profile (PT/INR)", type: "Panel", sample: "Plasma Citrate", price: 800 },
      { name: "Amylase & Lipase", type: "Panel", sample: "Serum", price: 1200 },
      { name: "Rheumatoid Factor (RF)", type: "Test", sample: "Serum", price: 700 },
      { name: "Widal Test", type: "Test", sample: "Serum", price: 400 },
      { name: "Hepatitis B Surface Antigen (HBsAg)", type: "Test", sample: "Serum", price: 500 },
      { name: "HIV 1 & 2 Antibody", type: "Test", sample: "Serum", price: 600 },
      { name: "Urine Culture & Sensitivity", type: "Test", sample: "Urine Clean Catch", price: 950 },
      { name: "Stool Routine Examination", type: "Test", sample: "Stool Spot", price: 250 },
      { name: "Arterial Blood Gas (ABG)", type: "Panel", sample: "Heparinized Blood", price: 1200 }
    ];
  }

  // Production-ready Radiology test catalog (20 items)
  if (window.patient360RadiologyCatalog === undefined) {
    window.patient360RadiologyCatalog = [
      { name: "Chest X-Ray PA View", type: "X-Ray", modality: "CR", price: 400 },
      { name: "MRI Brain Contrast", type: "MRI", modality: "MR", price: 7500 },
      { name: "CT Abdomen & Pelvis", type: "CT", modality: "CT", price: 6500 },
      { name: "USG Whole Abdomen", type: "Ultrasound", modality: "US", price: 1500 },
      { name: "X-Ray Knee AP/LAT", type: "X-Ray", modality: "CR", price: 500 },
      { name: "MRI Lumbar Spine", type: "MRI", modality: "MR", price: 6000 },
      { name: "CT Chest HRCT", type: "CT", modality: "CT", price: 5500 },
      { name: "USG Pelvis (Gynec)", type: "Ultrasound", modality: "US", price: 1200 },
      { name: "USG Obstetric (Anomalies)", type: "Ultrasound", modality: "US", price: 2200 },
      { name: "X-Ray Spine AP/LAT", type: "X-Ray", modality: "CR", price: 600 },
      { name: "CT Brain Plain", type: "CT", modality: "CT", price: 2500 },
      { name: "Mammography Bilateral", type: "Mammography", modality: "MG", price: 2000 },
      { name: "HRCT Temporal Bone", type: "CT", modality: "CT", price: 4000 },
      { name: "MRI Cervical Spine", type: "MRI", modality: "MR", price: 6000 },
      { name: "MRI Shoulder Joint", type: "MRI", modality: "MR", price: 7000 },
      { name: "USG KUB (Kidney, Ureter, Bladder)", type: "Ultrasound", modality: "US", price: 1200 },
      { name: "USG Neck & Thyroid", type: "Ultrasound", modality: "US", price: 1500 },
      { name: "USG Breast Bilateral", type: "Ultrasound", modality: "US", price: 1800 },
      { name: "CT Paranasal Sinuses (PNS)", type: "CT", modality: "CT", price: 3000 },
      { name: "USG Color Doppler Arterial", type: "Doppler", modality: "US", price: 3500 }
    ];
  }

  // Production-ready Medication catalog (50 items)
  if (window.patient360MedicineCatalog === undefined) {
    window.patient360MedicineCatalog = [
      { name: "Tab. Pantoprazole 40mg", type: "Tablet", route: "Oral", stock: true },
      { name: "Tab. Paracetamol 650mg", type: "Tablet", route: "Oral", stock: true },
      { name: "Tab. Amoxicillin 500mg", type: "Tablet", route: "Oral", stock: false, alt: "Tab. Azithromycin 500mg" },
      { name: "Tab. Montelukast 10mg", type: "Tablet", route: "Oral", stock: false, alt: "Tab. Levocetirizine 5mg" },
      { name: "Syp. Cremaffin 150ml", type: "Syrup", route: "Oral", stock: true },
      { name: "Tab. Ferrous Sulphate 200mg", type: "Tablet", route: "Oral", stock: true },
      { name: "Tab. Amlodipine 5mg", type: "Tablet", route: "Oral", stock: true },
      { name: "Tab. Metformin 500mg", type: "Tablet", route: "Oral", stock: true },
      { name: "Tab. Atorvastatin 10mg", type: "Tablet", route: "Oral", stock: true },
      { name: "Tab. Clopidogrel 75mg", type: "Tablet", route: "Oral", stock: true },
      { name: "Tab. Azithromycin 500mg", type: "Tablet", route: "Oral", stock: true },
      { name: "Tab. Levocetirizine 5mg", type: "Tablet", route: "Oral", stock: true },
      { name: "Tab. Telmisartan 40mg", type: "Tablet", route: "Oral", stock: true },
      { name: "Tab. Losartan 50mg", type: "Tablet", route: "Oral", stock: true },
      { name: "Tab. Glimepiride 2mg", type: "Tablet", route: "Oral", stock: true },
      { name: "Tab. Sitagliptin 100mg", type: "Tablet", route: "Oral", stock: true },
      { name: "Tab. Empagliflozin 10mg", type: "Tablet", route: "Oral", stock: true },
      { name: "Tab. Ibuprofen 400mg", type: "Tablet", route: "Oral", stock: true },
      { name: "Tab. Diclofenac 50mg", type: "Tablet", route: "Oral", stock: true },
      { name: "Tab. Tramadol 50mg", type: "Tablet", route: "Oral", stock: true },
      { name: "Tab. Ciprofloxacin 500mg", type: "Tablet", route: "Oral", stock: false, alt: "Tab. Levofloxacin 500mg" },
      { name: "Tab. Levofloxacin 500mg", type: "Tablet", route: "Oral", stock: true },
      { name: "Tab. Cefuroxime 500mg", type: "Tablet", route: "Oral", stock: true },
      { name: "Tab. Amoxiclav 625mg", type: "Tablet", route: "Oral", stock: true },
      { name: "Tab. Doxycycline 100mg", type: "Tablet", route: "Oral", stock: true },
      { name: "Tab. Fluconazole 150mg", type: "Tablet", route: "Oral", stock: true },
      { name: "Tab. Prednisolone 10mg", type: "Tablet", route: "Oral", stock: true },
      { name: "Tab. Deflazacort 6mg", type: "Tablet", route: "Oral", stock: true },
      { name: "Tab. Methylprednisolone 8mg", type: "Tablet", route: "Oral", stock: true },
      { name: "Tab. Domperidone 10mg", type: "Tablet", route: "Oral", stock: true },
      { name: "Tab. Ondansetron 4mg", type: "Tablet", route: "Oral", stock: true },
      { name: "Tab. Metoclopramide 10mg", type: "Tablet", route: "Oral", stock: true },
      { name: "Tab. Gabapentin 300mg", type: "Tablet", route: "Oral", stock: true },
      { name: "Tab. Pregabalin 75mg", type: "Tablet", route: "Oral", stock: true },
      { name: "Tab. Amitriptyline 10mg", type: "Tablet", route: "Oral", stock: true },
      { name: "Tab. Clonazepam 0.5mg", type: "Tablet", route: "Oral", stock: true },
      { name: "Tab. Alprazolam 0.25mg", type: "Tablet", route: "Oral", stock: true },
      { name: "Tab. Escitalopram 10mg", type: "Tablet", route: "Oral", stock: true },
      { name: "Tab. Sertraline 50mg", type: "Tablet", route: "Oral", stock: true },
      { name: "Tab. Ranitidine 150mg", type: "Tablet", route: "Oral", stock: false, alt: "Tab. Famotidine 20mg" },
      { name: "Tab. Famotidine 20mg", type: "Tablet", route: "Oral", stock: true },
      { name: "Tab. Rabeprazole 20mg", type: "Tablet", route: "Oral", stock: true },
      { name: "Tab. Omeprazole 20mg", type: "Tablet", route: "Oral", stock: true },
      { name: "Tab. Spironolactone 25mg", type: "Tablet", route: "Oral", stock: true },
      { name: "Tab. Furosemide 40mg", type: "Tablet", route: "Oral", stock: true },
      { name: "Tab. Torsemide 10mg", type: "Tablet", route: "Oral", stock: true },
      { name: "Tab. Hydrochlorothiazide 12.5mg", type: "Tablet", route: "Oral", stock: true },
      { name: "Tab. Calcium Carbonate 500mg", type: "Tablet", route: "Oral", stock: true },
      { name: "Tab. Multivitamin", type: "Tablet", route: "Oral", stock: true },
      { name: "Tab. Folic Acid 5mg", type: "Tablet", route: "Oral", stock: true }
    ];
  }"""

src = src.replace(init_target, init_replacement, 1)

# 2. Add extra CSS class configurations to styles block
old_styles_marker = "      /* Modal Styles */"
new_styles = """      /* Wide modal overrides for 2-column forms */
      .p360-modal-content-wide {
        width: 960px !important;
        max-width: 95vw !important;
      }
      .modal-cols {
        display: flex;
        gap: 16px;
        flex: 1;
        overflow: hidden;
      }
      .modal-left-col {
        flex: 1.3;
        display: flex;
        flex-direction: column;
        gap: 12px;
        overflow-y: auto;
        padding-right: 4px;
      }
      .modal-right-col {
        width: 340px;
        flex-shrink: 0;
        display: flex;
        flex-direction: column;
        gap: 12px;
        border-left: 1px solid var(--border-color, #e2e8f0);
        padding-left: 16px;
        overflow-y: auto;
      }
      .chip-list {
        display: flex;
        gap: 6px;
        flex-wrap: wrap;
      }
      .quick-chip {
        background: var(--bg-surface-elevated, #f1f5f9);
        color: var(--text-secondary, #475569);
        padding: 4px 10px;
        font-size: 11px;
        font-weight: 600;
        border-radius: 20px;
        border: 1px solid var(--border-color, #e2e8f0);
        cursor: pointer;
        transition: all 0.1s;
      }
      .quick-chip:hover {
        background: var(--primary-glow, #eff6ff);
        color: var(--primary, #2563eb);
        border-color: var(--primary, #2563eb);
      }
      .selected-box {
        border: 1px solid var(--border-color, #e2e8f0);
        border-radius: 8px;
        background: #f8fafc;
        display: flex;
        flex-direction: column;
        overflow: hidden;
      }
      .selected-box-header {
        padding: 8px 12px;
        border-bottom: 1px solid var(--border-color, #e2e8f0);
        background: #f1f5f9;
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 11px;
        font-weight: 700;
        color: var(--text-primary, #0f172a);
      }
      .selected-box-body {
        padding: 0;
        max-height: 180px;
        overflow-y: auto;
      }
      .selected-box-footer {
        padding: 6px 12px;
        border-top: 1px solid var(--border-color, #e2e8f0);
        background: #f1f5f9;
        display: flex;
        justify-content: flex-start;
      }

      /* Modal Styles */"""

src = src.replace(old_styles_marker, new_styles, 1)

# 3. Inject new interactive collection handlers on window
old_modal_handlers_marker = "  // Modal Form Action Handlers"
new_modal_handlers = """  // Wide Modal Selection handlers
  window.prSearchLabQuery = function(val) {
    window.labSearchQuery = val;
    draw360();
  };

  window.prAddLabTest = function(name) {
    const test = window.patient360LabCatalog.find(t => t.name === name);
    if (test && !window.p360SelectedLabs.some(t => t.name === name)) {
      window.p360SelectedLabs.push({
        name: test.name,
        type: test.type,
        sample: test.sample,
        priority: "Routine",
        instructions: ""
      });
      window.labSearchQuery = "";
      draw360();
    }
  };

  window.prRemoveLabTest = function(idx) {
    window.p360SelectedLabs.splice(idx, 1);
    draw360();
  };

  window.prUpdateLabPriority = function(idx, val) {
    window.p360SelectedLabs[idx].priority = val;
  };

  window.prUpdateLabInstructions = function(idx, val) {
    window.p360SelectedLabs[idx].instructions = val;
  };

  window.prClearLabs = function() {
    window.p360SelectedLabs = [];
    draw360();
  };

  window.prPlaceLabOrder = function() {
    if (window.p360SelectedLabs.length === 0) {
      window.prShowToast("Please select at least one laboratory investigation.");
      return;
    }
    const names = window.p360SelectedLabs.map(t => t.name).join(", ");
    window.prShowToast(`Lab Order Placed Successfully: ${names}`);
    window.p360SelectedLabs = [];
    window.prCloseModal();
  };

  // Radiology Handlers
  window.prSearchRadQuery = function(val) {
    window.radSearchQuery = val;
    draw360();
  };

  window.prAddRadiologyTest = function(name) {
    const test = window.patient360RadiologyCatalog.find(t => t.name === name);
    if (test && !window.p360SelectedRadiology.some(t => t.name === name)) {
      window.p360SelectedRadiology.push({
        name: test.name,
        type: test.type,
        modality: test.modality,
        priority: "Routine",
        instructions: ""
      });
      window.radSearchQuery = "";
      draw360();
    }
  };

  window.prRemoveRadiologyTest = function(idx) {
    window.p360SelectedRadiology.splice(idx, 1);
    draw360();
  };

  window.prUpdateRadPriority = function(idx, val) {
    window.p360SelectedRadiology[idx].priority = val;
  };

  window.prUpdateRadInstructions = function(idx, val) {
    window.p360SelectedRadiology[idx].instructions = val;
  };

  window.prClearRadiology = function() {
    window.p360SelectedRadiology = [];
    draw360();
  };

  window.prPlaceRadiologyOrder = function() {
    if (window.p360SelectedRadiology.length === 0) {
      window.prShowToast("Please select at least one radiology procedure.");
      return;
    }
    const names = window.p360SelectedRadiology.map(t => t.name).join(", ");
    window.prShowToast(`Radiology Order Placed Successfully: ${names}`);
    window.p360SelectedRadiology = [];
    window.prCloseModal();
  };

  // Medication Handlers
  window.prSearchMedQuery = function(val) {
    window.medSearchQuery = val;
    draw360();
  };

  window.prAddMedPrescription = function(name) {
    const med = window.patient360MedicineCatalog.find(m => m.name === name);
    if (med && !window.p360SelectedMeds.some(m => m.name === name)) {
      window.p360SelectedMeds.push({
        name: med.name,
        type: med.type,
        route: med.route,
        stock: med.stock,
        alt: med.alt || "",
        freq: "Once daily",
        dur: "5 days",
        instructions: ""
      });
      window.medSearchQuery = "";
      draw360();
    }
  };

  window.prRemoveMedPrescription = function(idx) {
    window.p360SelectedMeds.splice(idx, 1);
    draw360();
  };

  window.prUpdateMedFreq = function(idx, val) {
    window.p360SelectedMeds[idx].freq = val;
  };

  window.prUpdateMedDur = function(idx, val) {
    window.p360SelectedMeds[idx].dur = val;
  };

  window.prUpdateMedInstructions = function(idx, val) {
    window.p360SelectedMeds[idx].instructions = val;
  };

  window.prUseAlternativeInSelected = function(idx, altName) {
    window.p360SelectedMeds[idx].name = altName;
    window.p360SelectedMeds[idx].stock = true;
    window.p360SelectedMeds[idx].alt = "";
    window.prShowToast(`Swapped out-of-stock drug with alternative: ${altName}`);
    draw360();
  };

  window.prClearMeds = function() {
    window.p360SelectedMeds = [];
    draw360();
  };

  window.prPlacePrescriptionOrder = function() {
    if (window.p360SelectedMeds.length === 0) {
      window.prShowToast("Please select at least one medication to prescribe.");
      return;
    }
    
    // Check if any selected item is out of stock
    const oos = window.p360SelectedMeds.find(m => !m.stock);
    if (oos) {
      window.prShowToast(`Cannot place order. ${oos.name} is OUT OF STOCK. Swap to alternative first.`);
      return;
    }

    // Insert into global patient360Meds list
    window.p360SelectedMeds.forEach(m => {
      window.patient360Meds.unshift({
        drug: m.name,
        route: m.route,
        freq: m.freq,
        dur: m.dur,
        status: "Active",
        author: `Dr. Priya Nair`
      });
    });

    window.prShowToast(`Prescriptions issued successfully.`);
    window.p360SelectedMeds = [];
    window.prCloseModal();
  };

  // Modal Form Action Handlers"""

src = src.replace(old_modal_handlers_marker, new_modal_handlers, 1)

# 4. Overwrite renderModalHtml overlay return string with the side-by-side wide layout template
old_modal_render_start = "    function renderModalHtml() {"
new_modal_render = """    function renderModalHtml() {
      const activeModal = window.p360ActiveModal;
      if (!activeModal) return "";
      
      let title = "";
      let isWide = false;
      let bodyHtml = "";
      let footerHtml = "";
      
      const todayStr = new Date().toLocaleDateString('en-GB') + ", " + new Date().toLocaleTimeString('en-US', {hour: '2-digit', minute:'2-digit'});

      if (activeModal === 'Order Lab') {
        title = "ORDER LAB - Patient: " + patient.name;
        isWide = true;
        
        // Match Search & Suggestions
        const labQuery = window.labSearchQuery.trim().toLowerCase();
        let labMatches = [];
        if (labQuery.length > 0) {
          labMatches = window.patient360LabCatalog.filter(t => t.name.toLowerCase().includes(labQuery));
        }

        const frequentlyOrderedLabs = ["Complete Blood Count (CBC)", "Liver Function Test (LFT)", "Renal Function Test (RFT)", "HbA1c", "Lipid Profile", "Thyroid Profile (T3, T4, TSH)", "Urine Routine & Microscopy", "Blood Culture & Sensitivity", "Dengue Serology (NS1, IgG, IgM)", "Vitamin D (25-Hydroxy)"];

        // CDSS Recommendations based on patient low Hb & high K+
        const selectedLabNames = window.p360SelectedLabs.map(t => t.name);
        let cdssLabAdvice = "Select tests to see recommendations.";
        if (selectedLabNames.includes("Complete Blood Count (CBC)")) {
          cdssLabAdvice = `
            <div style="background:#fef3c7; border:1px solid #fcd34d; border-radius:6px; padding:8px 12px; font-size:11px; color:#92400e;">
              💡 <b>Severe Anemia Alert (Hb: 8.2 g/dL)</b>: Ordering CBC confirmed. It is strongly recommended to check iron stores.
              <div style="margin-top:6px;"><button class="btn-qa-primary" style="font-size:10px; padding:2px 8px; background:#d97706;" onclick="window.prAddLabTest('Serum Ferritin')">+ Add Serum Ferritin</button></div>
            </div>
          `;
        }

        bodyHtml = `
          <div class="modal-cols">
            <!-- Left Column: Search & Add -->
            <div class="modal-left-col">
              <div class="form-group">
                <label>Search & Add Investigations</label>
                <input type="text" class="form-control" placeholder="Search lab tests, panels, profiles, or test codes..." value="${window.labSearchQuery}" oninput="window.prSearchLabQuery(this.value)">
                ${labMatches.length > 0 ? `
                  <div style="background:#ffffff; border:1px solid #e2e8f0; border-radius:6px; max-height:120px; overflow-y:auto; position:absolute; z-index:2100; width:520px; box-shadow:0 4px 6px rgba(0,0,0,0.05);">
                    ${labMatches.map(t => `<div style="padding:6px 12px; cursor:pointer; font-size:12px; border-bottom:1px solid #f1f5f9;" onclick="window.prAddLabTest('${t.name}')">${t.name}</div>`).join('')}
                  </div>
                ` : ''}
              </div>

              <div class="form-group">
                <label style="font-size:10px; color:var(--text-muted);">Frequently Ordered</label>
                <div class="chip-list">
                  ${frequentlyOrderedLabs.map(chip => `<span class="quick-chip" onclick="window.prAddLabTest('${chip}')">${chip.replace(' (CBC)','').replace(' (LFT)','').replace(' (RFT)','').replace(' (T3, T4, TSH)','').replace(' & Microscopy','').replace(' & Sensitivity','').replace(' (NS1, IgG, IgM)','').replace(' (25-Hydroxy)','')}</span>`).join('')}
                </div>
              </div>

              <!-- Selected Investigations Box -->
              <div class="selected-box">
                <div class="selected-box-header">
                  <span>Selected Investigations (${window.p360SelectedLabs.length})</span>
                  <button style="background:transparent; border:none; color:var(--primary); font-size:11px; cursor:pointer;" onclick="window.prClearLabs()">Clear Selection</button>
                </div>
                <div class="selected-box-body">
                  ${window.p360SelectedLabs.length === 0 ? `
                    <div style="padding:40px; text-align:center; color:var(--text-muted); font-size:12px;">
                      No investigations selected. Search or click quick access chips to add.
                    </div>
                  ` : `
                    <table class="p360-table" style="font-size:11px;">
                      <thead>
                        <tr>
                          <th>Test Name</th>
                          <th>Sample</th>
                          <th style="width:90px;">Priority</th>
                          <th>Instructions</th>
                          <th style="width:40px; text-align:center;">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        ${window.p360SelectedLabs.map((t, idx) => `
                          <tr>
                            <td><b>${t.name}</b></td>
                            <td class="mono">${t.sample}</td>
                            <td>
                              <select class="form-control" style="font-size:11px; padding:2px 4px; height:24px;" onchange="window.prUpdateLabPriority(${idx}, this.value)">
                                <option ${t.priority==='Routine'?'selected':''}>Routine</option>
                                <option ${t.priority==='Urgent'?'selected':''}>Urgent</option>
                                <option ${t.priority==='Stat'?'selected':''}>Stat</option>
                              </select>
                            </td>
                            <td>
                              <input type="text" class="form-control" style="font-size:11px; padding:2px 6px; height:24px;" placeholder="e.g. Fasting..." value="${t.instructions}" oninput="window.prUpdateLabInstructions(${idx}, this.value)">
                            </td>
                            <td style="text-align:center;">
                              <span style="color:#ef4444; font-weight:bold; cursor:pointer;" onclick="window.prRemoveLabTest(${idx})">&times;</span>
                            </td>
                          </tr>
                        `).join('')}
                      </tbody>
                    </table>
                  `}
                </div>
                <div class="selected-box-footer">
                  <button class="btn-qa-secondary" style="height:24px; font-size:10px; padding:2px 8px;" onclick="window.prClearLabs()">Bulk Remove</button>
                </div>
              </div>
            </div>

            <!-- Right Column: Specifications & CDSS -->
            <div class="modal-right-col">
              <span style="font-size:11px; color:var(--text-muted); font-weight:700; display:block;">Order Specifications</span>
              
              <div class="form-group">
                <label>Ordering Physician</label>
                <select class="form-control" style="height:30px; font-size:12px; padding:0 8px;">
                  <option>Dr. Priya Nair (Gynaecology)</option>
                  <option>Dr. Ramesh Kumar (Cardiology)</option>
                </select>
              </div>

              <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px;">
                <div class="form-group">
                  <label>Priority (Order-wide)</label>
                  <select class="form-control" style="height:30px; font-size:12px; padding:0 8px;">
                    <option>Routine</option>
                    <option>Urgent</option>
                    <option>Stat</option>
                  </select>
                </div>
                <div class="form-group">
                  <label>Collection Location</label>
                  <select class="form-control" style="height:30px; font-size:12px; padding:0 8px;">
                    <option>Daycare</option>
                    <option>IPD Ward</option>
                    <option>OPD Clinic</option>
                    <option>Emergency</option>
                  </select>
                </div>
              </div>

              <div class="form-group">
                <label>Collection Date & Time</label>
                <input type="text" class="form-control" style="height:30px; font-size:12px;" value="${todayStr}">
              </div>

              <div class="form-group">
                <label>Fasting Required?</label>
                <div style="display:flex; gap:12px; font-size:12px;">
                  <label><input type="radio" name="fasting" value="yes"> Yes</label>
                  <label><input type="radio" name="fasting" value="no" checked> No</label>
                </div>
              </div>

              <div class="form-group">
                <label>Clinical Notes / Diagnosis</label>
                <textarea class="form-control" rows="2" style="font-size:12px;" placeholder="Evaluation of anemia / AUB symptoms..."></textarea>
              </div>

              <!-- CDSS Advice box -->
              <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:10px;">
                <span style="font-size:10px; color:var(--text-muted); font-weight:700; display:block; margin-bottom:4px;">CLINICAL DECISION SUPPORT (CDSS)</span>
                ${cdssLabAdvice}
                <div style="font-size:10px; color:var(--text-secondary); margin-top:6px; border-top:1px solid #e2e8f0; padding-top:4px;">
                  <b>Latest values:</b> Hb 8.2 g/dL &bull; K⁺ 6.8 mEq/L (Critical)
                </div>
              </div>
            </div>
          </div>
        `;

        footerHtml = `
          <button class="btn-qa-secondary" style="height:34px;" onclick="window.prCloseModal()">Save Draft</button>
          <button class="btn-qa-secondary" style="height:34px;" onclick="window.prShowToast('Print order details requisition form...')">Print Req.</button>
          <button class="btn-qa-secondary" style="height:34px;" onclick="window.prShowToast('Lab order sent electronically...')">Send to Lab</button>
          <button class="btn-qa-primary" style="height:34px; width:auto; background:var(--primary);" onclick="window.prPlaceLabOrder()">Place Lab Order</button>
        `;
      }
      else if (activeModal === 'Radiology') {
        title = "🩻 RADIOLOGY ORDER - Patient: " + patient.name;
        isWide = true;

        const radQuery = window.radSearchQuery.trim().toLowerCase();
        let radMatches = [];
        if (radQuery.length > 0) {
          radMatches = window.patient360RadiologyCatalog.filter(t => t.name.toLowerCase().includes(radQuery));
        }

        const frequentlyOrderedRad = ["Chest X-Ray PA View", "MRI Brain Contrast", "CT Abdomen & Pelvis", "USG Whole Abdomen", "X-Ray Knee AP/LAT", "MRI Lumbar Spine", "CT Chest HRCT"];

        bodyHtml = `
          <div class="modal-cols">
            <div class="modal-left-col">
              <div class="form-group">
                <label>Search & Add Imaging Studies</label>
                <input type="text" class="form-control" placeholder="Search radiology tests, body sites, or codes..." value="${window.radSearchQuery}" oninput="window.prSearchRadQuery(this.value)">
                ${radMatches.length > 0 ? `
                  <div style="background:#ffffff; border:1px solid #e2e8f0; border-radius:6px; max-height:120px; overflow-y:auto; position:absolute; z-index:2100; width:520px; box-shadow:0 4px 6px rgba(0,0,0,0.05);">
                    ${radMatches.map(t => `<div style="padding:6px 12px; cursor:pointer; font-size:12px; border-bottom:1px solid #f1f5f9;" onclick="window.prAddRadiologyTest('${t.name}')">${t.name}</div>`).join('')}
                  </div>
                ` : ''}
              </div>

              <div class="form-group">
                <label style="font-size:10px; color:var(--text-muted);">Frequently Ordered</label>
                <div class="chip-list">
                  ${frequentlyOrderedRad.map(chip => `<span class="quick-chip" onclick="window.prAddRadiologyTest('${chip}')">${chip}</span>`).join('')}
                </div>
              </div>

              <div class="selected-box">
                <div class="selected-box-header">
                  <span>Selected Studies (${window.p360SelectedRadiology.length})</span>
                  <button style="background:transparent; border:none; color:var(--primary); font-size:11px; cursor:pointer;" onclick="window.prClearRadiology()">Clear Selection</button>
                </div>
                <div class="selected-box-body">
                  ${window.p360SelectedRadiology.length === 0 ? `
                    <div style="padding:40px; text-align:center; color:var(--text-muted); font-size:12px;">
                      No imaging procedures selected. Search or click quick access chips to add.
                    </div>
                  ` : `
                    <table class="p360-table" style="font-size:11px;">
                      <thead>
                        <tr>
                          <th>Study Name</th>
                          <th>Modality</th>
                          <th style="width:90px;">Priority</th>
                          <th>Instructions</th>
                          <th style="width:40px; text-align:center;">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        ${window.p360SelectedRadiology.map((t, idx) => `
                          <tr>
                            <td><b>${t.name}</b></td>
                            <td class="mono">${t.modality}</td>
                            <td>
                              <select class="form-control" style="font-size:11px; padding:2px 4px; height:24px;" onchange="window.prUpdateRadPriority(${idx}, this.value)">
                                <option ${t.priority==='Routine'?'selected':''}>Routine</option>
                                <option ${t.priority==='Urgent'?'selected':''}>Urgent</option>
                                <option ${t.priority==='Stat'?'selected':''}>Stat</option>
                              </select>
                            </td>
                            <td>
                              <input type="text" class="form-control" style="font-size:11px; padding:2px 6px; height:24px;" placeholder="e.g. Lead shield..." value="${t.instructions}" oninput="window.prUpdateRadInstructions(${idx}, this.value)">
                            </td>
                            <td style="text-align:center;">
                              <span style="color:#ef4444; font-weight:bold; cursor:pointer;" onclick="window.prRemoveRadiologyTest(${idx})">&times;</span>
                            </td>
                          </tr>
                        `).join('')}
                      </tbody>
                    </table>
                  `}
                </div>
                <div class="selected-box-footer">
                  <button class="btn-qa-secondary" style="height:24px; font-size:10px; padding:2px 8px;" onclick="window.prClearRadiology()">Bulk Remove</button>
                </div>
              </div>
            </div>

            <div class="modal-right-col">
              <span style="font-size:11px; color:var(--text-muted); font-weight:700; display:block;">Order Specifications</span>
              <div class="form-group">
                <label>Ordering Physician</label>
                <select class="form-control" style="height:30px; font-size:12px;">
                  <option>Dr. Priya Nair (Gynaecology)</option>
                  <option>Dr. Ramesh Kumar (Cardiology)</option>
                </select>
              </div>

              <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px;">
                <div class="form-group">
                  <label>Priority (Order-wide)</label>
                  <select class="form-control" style="height:30px; font-size:12px;">
                    <option>Routine</option>
                    <option>Urgent</option>
                    <option>Stat</option>
                  </select>
                </div>
                <div class="form-group">
                  <label>Collection Location</label>
                  <select class="form-control" style="height:30px; font-size:12px;">
                    <option>Daycare</option>
                    <option>IPD Ward</option>
                  </select>
                </div>
              </div>

              <div class="form-group">
                <label>Scheduled Date & Time</label>
                <input type="text" class="form-control" style="height:30px; font-size:12px;" value="${todayStr}">
              </div>

              <div class="form-group">
                <label>Clinical Notes / Indications</label>
                <textarea class="form-control" rows="3" style="font-size:12px;" placeholder="Evaluation of heavy bleeding / abdominal discomfort..."></textarea>
              </div>

              <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:10px;">
                <span style="font-size:10px; color:var(--text-muted); font-weight:700; display:block; margin-bottom:4px;">CLINICAL DECISION SUPPORT (CDSS)</span>
                <span style="font-size:11px; color:var(--text-secondary);">No active contraindications found (pregnancy status: negative).</span>
              </div>
            </div>
          </div>
        `;

        footerHtml = `
          <button class="btn-qa-secondary" style="height:34px;" onclick="window.prCloseModal()">Save Draft</button>
          <button class="btn-qa-secondary" style="height:34px;" onclick="window.prShowToast('Print radiology imaging order sheet...')">Print Req.</button>
          <button class="btn-qa-secondary" style="height:34px;" onclick="window.prShowToast('Radiology order sent to diagnostics center...')">Send to PACS</button>
          <button class="btn-qa-primary" style="height:34px; width:auto; background:var(--primary);" onclick="window.prPlaceRadiologyOrder()">Place Radiology Order</button>
        `;
      }
      else if (activeModal === 'Prescribe') {
        title = "💊 PRESCRIBE MEDICATION - Patient: " + patient.name;
        isWide = true;

        const medQuery = window.medSearchQuery.trim().toLowerCase();
        let medMatches = [];
        if (medQuery.length > 0) {
          medMatches = window.patient360MedicineCatalog.filter(t => t.name.toLowerCase().includes(medQuery));
        }

        const frequentlyOrderedMeds = ["Tab. Pantoprazole 40mg", "Tab. Paracetamol 650mg", "Tab. Amoxicillin 500mg", "Tab. Montelukast 10mg", "Syp. Cremaffin 150ml", "Tab. Ferrous Sulphate 200mg", "Tab. Amlodipine 5mg", "Tab. Metformin 500mg"];

        // CDSS Drug-Drug interaction check
        const selectedMedNames = window.p360SelectedMeds.map(m => m.name);
        let cdssMedAdvice = "Select medicines to see safety recommendations.";
        if (selectedMedNames.some(n => n.includes("Ferrous Sulphate"))) {
          cdssMedAdvice = `
            <div style="background:#eff6ff; border:1px solid #bfdbfe; border-radius:6px; padding:8px 12px; font-size:11px; color:#1e40af;">
              💡 <b>Absorption Alert</b>: Oral Iron absorption increases when taken with Vitamin C. Consider prescribing Vitamin C/Multivitamins.
            </div>
          `;
        }

        bodyHtml = `
          <div class="modal-cols">
            <div class="modal-left-col">
              <div class="form-group">
                <label>Search & Add Medicine</label>
                <input type="text" class="form-control" placeholder="Search pharmacy catalog, brands, generics, or codes..." value="${window.medSearchQuery}" oninput="window.prSearchMedQuery(this.value)">
                ${medMatches.length > 0 ? `
                  <div style="background:#ffffff; border:1px solid #e2e8f0; border-radius:6px; max-height:120px; overflow-y:auto; position:absolute; z-index:2100; width:520px; box-shadow:0 4px 6px rgba(0,0,0,0.05);">
                    ${medMatches.map(m => {
                      return `<div style="padding:6px 12px; cursor:pointer; font-size:12px; border-bottom:1px solid #f1f5f9; display:flex; justify-content:space-between;" onclick="window.prAddMedPrescription('${m.name}')">
                        <span>${m.name}</span>
                        ${m.stock ? '<span style="color:#059669; font-size:10px;">In Stock</span>' : '<span style="color:#ef4444; font-size:10px;">Out of Stock</span>'}
                      </div>`;
                    }).join('')}
                  </div>
                ` : ''}
              </div>

              <div class="form-group">
                <label style="font-size:10px; color:var(--text-muted);">Frequently Prescribed</label>
                <div class="chip-list">
                  ${frequentlyOrderedMeds.map(chip => `<span class="quick-chip" onclick="window.prAddMedPrescription('${chip}')">${chip.replace('Tab. ','').replace('Syp. ','')}</span>`).join('')}
                </div>
              </div>

              <div class="selected-box">
                <div class="selected-box-header">
                  <span>Selected Medications (${window.p360SelectedMeds.length})</span>
                  <button style="background:transparent; border:none; color:var(--primary); font-size:11px; cursor:pointer;" onclick="window.prClearMeds()">Clear Selection</button>
                </div>
                <div class="selected-box-body">
                  ${window.p360SelectedMeds.length === 0 ? `
                    <div style="padding:40px; text-align:center; color:var(--text-muted); font-size:12px;">
                      No medicines selected. Search or click quick access chips to add.
                    </div>
                  ` : `
                    <table class="p360-table" style="font-size:11px;">
                      <thead>
                        <tr>
                          <th>Drug Name</th>
                          <th style="width:100px;">Frequency</th>
                          <th style="width:80px;">Duration</th>
                          <th>Instructions</th>
                          <th style="width:40px; text-align:center;">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        ${window.p360SelectedMeds.map((m, idx) => {
                          const oosStyle = !m.stock ? 'style="background:#fff5f5; border-left:3px solid #ef4444;"' : '';
                          return `
                            <tr ${oosStyle}>
                              <td>
                                <b>${m.name}</b>
                                ${!m.stock ? `
                                  <div style="font-size:9px; color:#ef4444; font-weight:700; margin-top:2px;">
                                    ⚠️ OUT OF STOCK at Bangalore Campus Pharmacy.
                                    <span style="text-decoration:underline; cursor:pointer; color:var(--primary); margin-left:4px;" onclick="window.prUseAlternativeInSelected(${idx}, '${m.alt}')">Swap to Alternative (${m.alt})</span>
                                  </div>
                                ` : ''}
                              </td>
                              <td>
                                <select class="form-control" style="font-size:11px; padding:2px 4px; height:24px;" onchange="window.prUpdateMedFreq(${idx}, this.value)">
                                  <option ${m.freq==='Once daily'?'selected':''}>Once daily</option>
                                  <option ${m.freq==='Twice daily'?'selected':''}>Twice daily</option>
                                  <option ${m.freq==='Thrice daily'?'selected':''}>Thrice daily</option>
                                  <option ${m.freq==='PRN / SOS'?'selected':''}>PRN / SOS</option>
                                </select>
                              </td>
                              <td>
                                <select class="form-control" style="font-size:11px; padding:2px 4px; height:24px;" onchange="window.prUpdateMedDur(${idx}, this.value)">
                                  <option ${m.dur==='5 days'?'selected':''}>5 days</option>
                                  <option ${m.dur==='10 days'?'selected':''}>10 days</option>
                                  <option ${m.dur==='30 days'?'selected':''}>30 days</option>
                                  <option ${m.dur==='Ongoing'?'selected':''}>Ongoing</option>
                                </select>
                              </td>
                              <td>
                                <input type="text" class="form-control" style="font-size:11px; padding:2px 6px; height:24px;" placeholder="e.g. After food..." value="${m.instructions}" oninput="window.prUpdateMedInstructions(${idx}, this.value)">
                              </td>
                              <td style="text-align:center;">
                                <span style="color:#ef4444; font-weight:bold; cursor:pointer;" onclick="window.prRemoveMedPrescription(${idx})">&times;</span>
                              </td>
                            </tr>
                          `;
                        }).join('')}
                      </tbody>
                    </table>
                  `}
                </div>
                <div class="selected-box-footer">
                  <button class="btn-qa-secondary" style="height:24px; font-size:10px; padding:2px 8px;" onclick="window.prClearMeds()">Bulk Remove</button>
                </div>
              </div>
            </div>

            <div class="modal-right-col">
              <span style="font-size:11px; color:var(--text-muted); font-weight:700; display:block;">Order Specifications</span>
              <div class="form-group">
                <label>Ordering Physician</label>
                <select class="form-control" style="height:30px; font-size:12px;">
                  <option>Dr. Priya Nair (Gynaecology)</option>
                  <option>Dr. Ramesh Kumar (Cardiology)</option>
                </select>
              </div>

              <div class="form-group">
                <label>Start Date</label>
                <input type="text" class="form-control" style="height:30px; font-size:12px;" value="Immediate (Today)">
              </div>

              <div class="form-group">
                <label>Dispensing Pharmacy Location</label>
                <select class="form-control" style="height:30px; font-size:12px;">
                  <option>Bangalore Campus Pharmacy</option>
                  <option>Whitefield Pharmacy</option>
                </select>
              </div>

              <div class="form-group">
                <label>Clinical Notes / Indication</label>
                <textarea class="form-control" rows="3" style="font-size:12px;" placeholder="Iron deficiency anemia management..."></textarea>
              </div>

              <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:10px;">
                <span style="font-size:10px; color:var(--text-muted); font-weight:700; display:block; margin-bottom:4px;">CLINICAL DECISION SUPPORT (CDSS)</span>
                ${cdssMedAdvice}
                <div style="font-size:10px; color:var(--text-secondary); margin-top:6px; border-top:1px solid #e2e8f0; padding-top:4px;">
                  <b>Allergies:</b> None recorded.
                </div>
              </div>
            </div>
          </div>
        `;

        footerHtml = `
          <button class="btn-qa-secondary" style="height:34px;" onclick="window.prCloseModal()">Save Draft</button>
          <button class="btn-qa-secondary" style="height:34px;" onclick="window.prShowToast('Print prescription details req form...')">Print Req.</button>
          <button class="btn-qa-secondary" style="height:34px;" onclick="window.prShowToast('Prescription sent to local pharmacy...')">Send to Pharmacy</button>
          <button class="btn-qa-primary" style="height:34px; width:auto; background:var(--primary);" onclick="window.prPlacePrescriptionOrder()">Place Prescription Order</button>
        `;
      }
      else if (activeModal === 'Record Vitals') {
        title = "📊 Record Vitals Log";
        isWide = false;
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
        isWide = false;
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
      else if (activeModal === 'Nursing Note') {
        title = "📝 Nursing Observation Shift Log";
        isWide = false;
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
        isWide = false;
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
        isWide = false;
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
        isWide = false;
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
          <div class="p360-modal-content ${isWide ? 'p360-modal-content-wide' : ''}">
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

src = src.replace(old_modal_render_start, new_modal_render, 1)

# Now, write the file out
with open(path, "w", encoding="utf-8") as f:
    f.write(src)

print("SUCCESS: High fidelity two-column modal system applied successfully.")
