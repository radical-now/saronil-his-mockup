/* ==========================================================================
   SARONIL HMS - CLINICAL EMR & CONSULTATION VIEW (emrView.js)
   ========================================================================== */

let emrContainer = null;
window.activeEmrTab = window.activeEmrTab || 'queue'; // 'queue', 'completed', 'cancelled'

window.setDistractionFreeMode = function(active) {
  const sidebar = document.querySelector('.app-sidebar');
  const mainHeader = document.querySelector('.main-header');
  const mainContent = document.getElementById('main-content');
  
  if (active) {
    if (sidebar) sidebar.style.setProperty('display', 'none', 'important');
    if (mainHeader) mainHeader.style.setProperty('display', 'none', 'important');
    if (mainContent) {
      mainContent.style.padding = '0';
      mainContent.style.margin = '0';
      mainContent.style.flex = '1';
      mainContent.style.minHeight = '0';
      mainContent.style.height = '100%';
      mainContent.style.width = '100%';
      mainContent.style.maxWidth = '100%';
      mainContent.style.overflow = 'hidden';
    }
  } else {
    if (sidebar) sidebar.style.display = '';
    if (mainHeader) mainHeader.style.display = '';
    if (mainContent) {
      mainContent.style.padding = '';
      mainContent.style.margin = '';
      mainContent.style.flex = '';
      mainContent.style.minHeight = '';
      mainContent.style.height = '';
      mainContent.style.width = '';
      mainContent.style.maxWidth = '';
      mainContent.style.overflow = '';
    }
  }
};

window.views.emr = function(container, subAnchor, params) {
  emrContainer = container;
  
  if (params && params.start) {
    window.activeConsultationStarted = true;
    delete params.start;
  }

  if (params && params.uhid) {
    if (!window.activeConsultationStarted) {
      window.router.navigate(`patients?uhid=${params.uhid}`);
      return;
    }
  }
  
  if (window.activeEmrTab === undefined) window.activeEmrTab = 'queue';
  
  // Resolve active doctor from sidebar selection
  const selectedDoc = (window.state && window.state.activeDoctor) ? window.state.activeDoctor : 'Dr. Amit Verma';
  
  if (window.emrSearchQuery === undefined) window.emrSearchQuery = '';
  
  window.setDistractionFreeMode(!!window.activeConsultationStarted);
  
  let activeUhid = params.uhid;
  
  // Calculate patient list counts and filter active list strictly for the selected doctor
  let queuePatients = state.patients.filter(p => p.type === 'OPD' && (p.status === 'Checked In' || p.status === 'Registered') && p.primaryConsultant === selectedDoc);
  let completedPatients = state.patients.filter(p => p.type === 'OPD' && p.status === 'Completed' && p.primaryConsultant === selectedDoc);
  let cancelledPatients = state.patients.filter(p => p.type === 'OPD' && (p.status === 'Cancelled' || p.status === 'No Show') && p.primaryConsultant === selectedDoc);

  let currentTabPatients = [];
  if (window.activeEmrTab === 'queue') {
    currentTabPatients = queuePatients;
  } else if (window.activeEmrTab === 'completed') {
    currentTabPatients = completedPatients;
  } else if (window.activeEmrTab === 'cancelled') {
    currentTabPatients = cancelledPatients;
  }

  if (window.emrSearchQuery) {
    const sq = window.emrSearchQuery.toLowerCase().trim();
    currentTabPatients = currentTabPatients.filter(p => 
      p.name.toLowerCase().includes(sq) ||
      p.uhid.toLowerCase().includes(sq) ||
      (p.mobile && p.mobile.includes(sq)) ||
      (p.primaryConsultant && p.primaryConsultant.toLowerCase().includes(sq))
    );
  }

  // Default to first patient in current active tab if none is selected
  if (!activeUhid && currentTabPatients.length > 0) {
    activeUhid = currentTabPatients[0].uhid;
  }
  
  const activePatient = state.patients.find(p => p.uhid === activeUhid) || currentTabPatients[0];
  
  renderEMR(container, activePatient, currentTabPatients, queuePatients.length, completedPatients.length, cancelledPatients.length);
};

// Sidebar Helper Handlers
window.sidebarSwitchDoctor = function(docName) {
  window.activeEmrDoctorFilter = docName;
  router.handleRouting();
};

window.sidebarSearch = function(query) {
  window.emrSearchQuery = query;
  window.isEmrSearchActive = true;
  router.handleRouting();
  window.isEmrSearchActive = false;
};

window.sidebarSwitchTab = function(tab) {
  window.activeEmrTab = tab;
  router.handleRouting();
};

window.sidebarSelectPatient = function(uhid) {
  window.activeConsultationStarted = false; // Reset view back to dashboard for new patient
  router.navigate(`emr?uhid=${uhid}`);
};

window.setEmrPatientStatus = function(uhid, status) {
  const patient = state.patients.find(p => p.uhid === uhid);
  if (patient) {
    patient.status = status;
    router.handleRouting();
  }
};

window.switchEmrQueueTab = window.sidebarSwitchTab;
window.switchEmrDoctorFilter = window.sidebarSwitchDoctor;

// Global ⌘ K / Ctrl K focus hotkey
if (!window.hasEmrKeyListeners) {
  window.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
      const s = document.getElementById('emr-sidebar-search');
      if (s) {
        e.preventDefault();
        s.focus();
        s.select();
      }
    }
  });
  window.hasEmrKeyListeners = true;
}

window.printCompletedPrescription = function(uhid) {
  const patient = state.patients.find(p => p.uhid === uhid);
  if (!patient) return;
  
  if (!patient.prescriptions || patient.prescriptions.length === 0) {
    alert("No prescriptions have been recorded for this patient yet.");
    return;
  }

  const printWindow = window.open('', '_blank', 'width=800,height=900');
  
  let rxRows = '';
  patient.prescriptions.forEach((rx, idx) => {
    rxRows += `<tr style="border-bottom: 1px solid #eee;">
      <td style="padding: 0.75rem 0.5rem; font-weight: bold;">${idx + 1}. ${rx.drug}</td>
      <td style="padding: 0.75rem 0.5rem;">${rx.dose}</td>
      <td style="padding: 0.75rem 0.5rem;">${rx.freq}</td>
      <td style="padding: 0.75rem 0.5rem;">${rx.duration}</td>
      <td style="padding: 0.75rem 0.5rem;">${rx.instruction || 'None'}</td>
    </tr>`;
  });

  const abha = patient.abhaId || 'N/A';
  const consultant = patient.primaryConsultant || (window.state && window.state.activeDoctor) || 'Dr. Reeta Verma';
  const dept = patient.department || 'Gynecology & Obs';

  printWindow.document.write(`
    <html>
    <head>
      <title>Prescription - ${patient.name}</title>
      <style>
        body { font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif; padding: 2rem; color: #333; line-height: 1.4; }
        .header { text-align: center; border-bottom: 2px solid #005f87; padding-bottom: 1rem; margin-bottom: 1.5rem; }
        .header h1 { margin: 0; color: #005f87; font-size: 24px; }
        .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 2rem; background: #f9f9f9; padding: 1rem; border-radius: 6px; }
        table { width: 100%; border-collapse: collapse; margin-top: 1.5rem; }
        th { border-bottom: 2px solid #ccc; padding: 0.5rem; text-align: left; font-size: 14px; color: #555; }
        td { padding: 0.75rem 0.5rem; border-bottom: 1px solid #eee; }
        .footer { margin-top: 4rem; text-align: right; border-top: 1px solid #eee; padding-top: 1rem; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>SARONIL HOSPITAL & RESEARCH CENTRE</h1>
        <p style="margin: 0.25rem 0; color: #666;">Clinical Department | OPD Prescriptions</p>
      </div>
      <div class="meta-grid">
        <div>
          <strong>Patient Name:</strong> ${patient.name}<br>
          <strong>UHID:</strong> ${patient.uhid} | <strong>ABHA ID:</strong> ${abha}<br>
          <strong>Age / Gender:</strong> ${patient.age} Yrs / ${patient.gender}
        </div>
        <div>
          <strong>Date:</strong> ${new Date().toLocaleDateString()}<br>
          <strong>Primary Consultant:</strong> ${consultant}<br>
          <strong>Department:</strong> ${dept}
        </div>
      </div>
      
      <h2>Rx (Medications)</h2>
      <table>
        <thead>
          <tr>
            <th>Medication Name</th>
            <th>Dosage</th>
            <th>Frequency</th>
            <th>Duration</th>
            <th>Instructions</th>
          </tr>
        </thead>
        <tbody>
          ${rxRows}
        </tbody>
      </table>
      
      <div class="footer">
        <br><br>
        <p>___________________________</p>
        <p><strong>Authorized Clinician Signature</strong></p>
      </div>
      <script>
        window.onload = function() {
          window.print();
        }
      </script>
    </body>
    </html>
  `);
  printWindow.document.close();
};

function renderEMR(container, patient, currentTabPatients = [], queueCount = 0, completedCount = 0, cancelledCount = 0) {
  const hasActiveSepsisAlert = patient ? state.alerts.some(a => a.uhid === patient.uhid && a.status === 'Active' && a.details.includes('Sepsis')) : false;

  // Define modules option list
  const symptomsList = ["Fever", "Cold", "Dry Cough", "Headache", "Shortness of breath", "Vometing", "Skin Rash", "Stomach Pain", "Runny Noes", "Body pain", "Red Eyes", "Loose Motion", "Ear Pain", "Knee Pain", "Neck Pain"];
  const findingsList = ["Pallor", "Icterus", "Cyanosis", "Clubbing", "Lymphadenopathy", "Edema", "Air entry bilaterally equal", "Vesicular breath sounds", "Crepitations", "Rhonchi", "S1 heard"];
  const diagnosticsList = ["Upper Respiratory Track Infection", "Vesicular breath sounds", "Crepitations", "Rhonchi", "S1 heard"];
  const medicineList = ["Paracetamol", "Cetirizine", "Vesicular breath sounds", "Crepitations", "Rhonchi", "S1 heard"];
  const instructionsList = [
    "Rest well — avoid overexertion for at least 2-3 days.",
    "Eat light food — soups, fruits, and easy-to-digest meals.",
    "Drink plenty of fluids — warm water, herbal tea, and clear soups.",
    "Steam inhalation — 2-3 times a day to ease congestion.",
    "Avoid cold drinks and ice cream."
  ];
  const investigationsList = ["CBC (Complete Blood Count)", "Covid Test", "HbA1c", "LFT", "KFT", "Vitamin B12"];
  const procedureList = ["Pelvic Examination", "Ultrasound (USG)", "Blood Pressure Monitoring", "MRI Scan", "IV Cannulation", "Suture Removal", "Transvaginal Ultrasound", "X-ray Leg AP/Lateral"];

  // Initialize activeConsultation state with specialty auto-detection
  if (patient) {
    let initialSpecialty = "Gynecology & Obs";
    if (patient.primaryConsultant) {
      const docObj = state.doctors.find(d => d.name === patient.primaryConsultant);
      if (docObj) {
        if (docObj.spec === "Gynecology & Obs" || docObj.spec === "Gyn and Obs") {
          initialSpecialty = "Gynecology & Obs";
        } else if (docObj.spec === "Pediatrics" || docObj.spec === "Paeds") {
          initialSpecialty = "Pediatrics";
        } else if (docObj.spec === "IVF & Fertility" || docObj.spec === "IVF") {
          initialSpecialty = "IVF & Fertility";
        } else if (docObj.spec === "Psychiatry") {
          initialSpecialty = "Psychiatry";
        }
      }
    }

    if (!window.activeConsultation || window.activeConsultation.uhid !== patient.uhid) {
      window.activeConsultation = {
        uhid: patient.uhid,
        specialty: initialSpecialty,
        symptoms: patient.clinicalData?.symptoms || [],
        findings: patient.clinicalData?.findings || [],
        diagnostics: patient.clinicalData?.diagnosis ? patient.clinicalData.diagnosis.split(', ').filter(Boolean) : [],
        medicines: patient.prescriptions ? patient.prescriptions.map(p => p.drug).filter(Boolean) : [],
        instructions: patient.clinicalData?.treatmentPlan ? patient.clinicalData.treatmentPlan.split('\n').filter(Boolean) : [],
        investigations: [],
        procedures: [],
        ancData: patient.ancData || {
          visitDate: new Date().toISOString().split('T')[0],
          gestationalAge: "",
          edd: patient.edd || "",
          feverSigns: "",
          weight: "",
          bp: "",
          pulseRate: "",
          temp: "",
          fundalHeight: "",
          fhr: patient.fhr || "",
          fetalMovement: "",
          presentation: "",
          hemoglobin: "",
          bloodSugar: "",
          urineProtein: "",
          usgFindings: "",
          doctorNotes: ""
        }
      };
    } else {
      // Ensure specialty is populated on resume
      window.activeConsultation.specialty = window.activeConsultation.specialty || initialSpecialty;
    }
  }

  // Helper function to generate pill chips
  function generatePillsHTML(list, selectedList, key) {
    return list.map(item => {
      const isSelected = selectedList.includes(item);
      const bg = isSelected ? '#4a1d1d' : '#fff';
      const color = isSelected ? '#fff' : '#374151';
      const border = isSelected ? '1px solid #4a1d1d' : '1px solid #d1d5db';
      const selectedClass = isSelected ? 'selected' : '';
      const displayContent = isSelected ? `${item} <span style="margin-left: 0.25rem; font-weight: bold; font-size: 0.85rem; line-height: 1;">&times;</span>` : item;

      return `
        <div class="consultation-pill ${selectedClass}" data-value="${item}" onclick="window.toggleConsultationPill(this, '${key}', '${item}')" style="background-color: ${bg}; color: ${color}; border: ${border}; padding: 0.35rem 0.75rem; border-radius: 20px; font-size: 0.8rem; display: flex; align-items: center; gap: 0.35rem; cursor: pointer; transition: all 0.2s;">
          ${displayContent}
        </div>
      `;
    }).join('');
  }

  // Helper function to generate advice checkboxes
  function generateCheckboxesHTML(list, selectedList) {
    return list.map(item => {
      const isChecked = selectedList.includes(item);
      return `
        <label class="instruction-item" data-value="${item}" style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.25rem; font-weight: normal; cursor: pointer;">
          <input type="checkbox" ${isChecked ? 'checked' : ''} onchange="window.toggleConsultationCheckbox(this, '${item}')" style="cursor: pointer; width: 16px; height: 16px;">
          <span style="font-size: 0.85rem; color: var(--text-primary);">${item}</span>
        </label>
      `;
    }).join('');
  }

  // Check search focus before re-rendering
  const wasSearchActive = document.activeElement && document.activeElement.id === 'emr-sidebar-search';

  // Render main layout structure
  container.innerHTML = `
    <style>
      .emr-sidebar-tab-btn {
        background: transparent;
        border: none;
        padding: 0.5rem 0.75rem;
        font-size: 0.8rem;
        font-weight: 500;
        cursor: pointer;
        color: var(--text-secondary);
        border-bottom: 2px solid transparent;
        transition: all 0.2s ease;
      }
      .emr-sidebar-tab-btn.active {
        color: #2563eb !important;
        border-bottom-color: #2563eb !important;
        font-weight: 600 !important;
      }
      .emr-patient-card-item {
        padding: 0.85rem 1rem;
        border-bottom: 1px solid var(--border-color);
        cursor: pointer;
        transition: background-color 0.2s;
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
      }
      .emr-patient-card-item:hover {
        background-color: var(--bg-surface-elevated);
      }
      .emr-patient-card-item.selected {
        background-color: #eff6ff !important;
        border-left: 4px solid #2563eb;
      }
      .emr-dashboard-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 1.25rem;
      }
      @media (max-width: 1200px) {
        .emr-dashboard-grid {
          grid-template-columns: 1fr;
        }
      }
      .emr-dash-card {
        background: var(--bg-surface);
        border: 1px solid var(--border-color);
        border-radius: 10px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.04);
        padding: 1.25rem;
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
      }
      .emr-dash-card h4 {
        margin: 0 0 0.25rem 0;
        font-size: 0.95rem;
        font-weight: 700;
        color: var(--text-primary);
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }
    </style>

    <div class="emr-workspace" style="display: flex; flex: 1; min-height: 0; height: 100%; margin: ${window.activeConsultationStarted ? '0' : '-1.5rem'}; overflow: hidden; background: var(--bg-body, #f3f4f6);">
      <!-- LEFT SIDEBAR PATIENT QUEUE -->
      <aside style="width: 300px; border-right: 1px solid var(--border-color); background: var(--bg-surface); display: ${window.activeConsultationStarted ? 'none' : 'flex'}; flex-direction: column; flex-shrink: 0; height: 100%;">
        
        <!-- Search -->
        <div style="padding: 0.5rem 1rem; position: relative;">
          <span style="position: absolute; left: 24px; top: 50%; transform: translateY(-50%); font-size: 0.85rem; color: var(--text-muted);">🔍</span>
          <input type="text" id="emr-sidebar-search" placeholder="Search (⌘K)" value="${window.emrSearchQuery || ''}" oninput="window.sidebarSearch(this.value)" style="width: 100%; padding: 0.4rem 2rem 0.4rem 2.2rem; font-size: 0.8rem; height: 34px; border-radius: 6px; border: 1px solid var(--border-color); background: var(--bg-surface-elevated); color: var(--text-primary);">
          <span style="position: absolute; right: 24px; top: 50%; transform: translateY(-50%); font-size: 0.7rem; font-weight: 600; color: var(--text-muted); background: var(--border-color); padding: 2px 4px; border-radius: 4px;">⌘K</span>
        </div>

        <!-- Tabs -->
        <div style="display: flex; gap: 0.25rem; padding: 0.25rem 0.75rem; border-bottom: 1px solid var(--border-color); overflow-x: auto;">
          <button class="emr-sidebar-tab-btn ${window.activeEmrTab === 'queue' ? 'active' : ''}" onclick="window.sidebarSwitchTab('queue')">
            Queue (${queueCount})
          </button>
          <button class="emr-sidebar-tab-btn ${window.activeEmrTab === 'completed' ? 'active' : ''}" onclick="window.sidebarSwitchTab('completed')">
            Done (${completedCount})
          </button>
          <button class="emr-sidebar-tab-btn ${window.activeEmrTab === 'cancelled' ? 'active' : ''}" onclick="window.sidebarSwitchTab('cancelled')">
            No Show (${cancelledCount})
          </button>
        </div>

        <!-- Patients list -->
        <div style="flex-grow: 1; overflow-y: auto; display: flex; flex-direction: column;">
          ${currentTabPatients.map(p => {
            const isSelected = patient && p.uhid === patient.uhid;
            return `
              <div class="emr-patient-card-item ${isSelected ? 'selected' : ''}" onclick="window.sidebarSelectPatient('${p.uhid}')">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <span style="font-weight: 700; font-size: 0.85rem; color: var(--text-primary);">${p.name}</span>
                  <span style="font-size: 0.7rem; color: var(--text-muted);">${p.lastActivity || '—'}</span>
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.75rem; color: var(--text-secondary);">
                  <span>${p.uhid} • ${p.age}Y/F</span>
                  <span style="background: ${p.status === 'Checked In' ? '#ecfdf5' : (p.status === 'Paused' ? '#fffbeb' : '#f3f4f6')}; color: ${p.status === 'Checked In' ? '#10b981' : (p.status === 'Paused' ? '#d97706' : '#4b5563')}; padding: 1px 6px; border-radius: 10px; font-weight: 600; font-size: 0.65rem;">
                    ${p.status}
                  </span>
                </div>
              </div>
            `;
          }).join('') || `<div style="padding: 2rem; text-align: center; color: var(--text-muted); font-size: 0.8rem;">No patients found.</div>`}
        </div>
      </aside>

      <!-- RIGHT MAIN CONTENT CONTAINER -->
      <main style="flex-grow: 1; min-height: 0; overflow-y: auto; padding: 1.5rem; display: flex; flex-direction: column;">
        ${!patient ? `
          <div style="flex-grow: 1; display: flex; align-items: center; justify-content: center; flex-direction: column; background: var(--bg-surface); border-radius: 12px; border: 1px solid var(--border-color); padding: 3rem;">
            <span style="font-size: 3rem; margin-bottom: 1rem;">🩺</span>
            <h3>No Patient Selected</h3>
            <p style="color: var(--text-secondary); text-align: center; max-width: 320px; font-size: 0.85rem; margin-top: 0.25rem;">
              Select a patient from the queue in the left sidebar to start or view consultation history.
            </p>
          </div>
        ` : `
          <!-- Header Banner -->
          <div class="emr-header-banner" style="margin-bottom: 1.25rem; display: flex; justify-content: space-between; align-items: center; background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%); padding: 1.25rem; border-radius: 10px; color: #fff; box-shadow: 0 4px 10px rgba(0,0,0,0.08);">
            <div class="patient-profile-block" style="display: flex; align-items: center; gap: 0.75rem;">
              <div class="profile-avatar-placeholder" style="width: 48px; height: 48px; border-radius: 50%; background: rgba(255, 255, 255, 0.2); display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 1.25rem;">
                ${patient.name.charAt(0)}
              </div>
              <div class="patient-profile-details">
                <h2 style="margin: 0; font-size: 1.2rem; font-weight: 700; color: #fff;">
                  ${patient.name} 
                  <span style="font-size: 0.85rem; font-weight: normal; color: #bfdbfe; margin-left: 0.5rem;">(${patient.gender}, ${patient.age} Yrs)</span>
                  ${hasActiveSepsisAlert ? `<span class="badge" style="background-color: var(--color-danger); color: #fff; font-size: 0.75rem; border-radius: 4px; padding: 0.15rem 0.4rem; margin-left: 0.5rem; vertical-align: middle;">🚨 CRITICAL SEPSIS RISK</span>` : ''}
                </h2>
                <div class="patient-meta-grid" style="display: flex; gap: 1rem; font-size: 0.8rem; color: #bfdbfe; margin-top: 0.25rem;">
                  <span><strong>UHID:</strong> ${patient.uhid}</span>
                  <span><strong>ABHA ID:</strong> ${patient.abhaId || '—'}</span>
                  <span><strong>Blood Group:</strong> ${patient.bloodGroup || '—'}</span>
                  <span><strong>Payer:</strong> ${patient.payer || 'Direct'}</span>
                </div>
              </div>
            </div>
            
            <div style="display: flex; gap: 0.5rem; align-items: center;">
              ${patient.type !== 'OPD' ? `
                <button class="btn btn-secondary" onclick="window.showStockRequestOverlay({dept: (patient.bed && patient.bed.includes('GW')) ? 'General Ward' : 'ICU'})" style="font-weight: 600; padding: 0.4rem 0.8rem; background: #1d4ed8; color: #fff; border: 1px solid rgba(255,255,255,0.25);">📦 Request Stock</button>
              ` : ''}
              ${window.activeConsultationStarted ? `
                <button class="btn btn-secondary" onclick="window.showConsultationExitModal('emr?uhid=${patient.uhid}')" style="font-weight: 600; padding: 0.4rem 0.8rem; background: rgba(255,255,255,0.15); color: #fff; border: 1px solid rgba(255,255,255,0.25);">← Back to Dashboard</button>
                <button class="btn btn-secondary" onclick="window.previewConsultation('${patient.uhid}')" style="font-weight: 600; padding: 0.4rem 0.8rem; background: rgba(255,255,255,0.15); color: #fff; border: 1px solid rgba(255,255,255,0.25);">👁️ Preview</button>
                <button class="btn btn-secondary" onclick="window.printConsultation('${patient.uhid}')" style="font-weight: 600; padding: 0.4rem 0.8rem; background: rgba(255,255,255,0.15); color: #fff; border: 1px solid rgba(255,255,255,0.25);">🖨️ Print</button>
                ${window.state?.activeUserRole === 'Doctor' ? `
                  <button class="btn btn-primary" onclick="window.saveConsultation('${patient.uhid}')" style="background-color: #10b981; border: none; font-weight: 700; padding: 0.4rem 0.8rem; color: #fff;">💾 Save Consultation</button>
                ` : ''}
              ` : `
                ${window.state?.activeUserRole === 'Doctor' ? `
                  <button class="btn btn-primary" onclick="window.router.navigate('emr?uhid=${patient.uhid}&start=true');" style="background-color: #10b981; border: none; font-weight: 700; padding: 0.4rem 0.8rem; color: #fff; cursor: pointer; border-radius: 4px;">
                    ${patient.status === 'Paused' ? '🩺 Resume Consultation' : '🩺 Start Consultation'}
                  </button>
                  <button class="btn btn-secondary" onclick="alert('Certificate created successfully.')" style="font-weight: 600; padding: 0.4rem 0.8rem; background: rgba(255,255,255,0.15); color: #fff; border: 1px solid rgba(255,255,255,0.25);">📜 Certificate</button>
                ` : ''}
                <button class="btn btn-secondary" onclick="alert('Follow up scheduled.')" style="font-weight: 600; padding: 0.4rem 0.8rem; background: rgba(255,255,255,0.15); color: #fff; border: 1px solid rgba(255,255,255,0.25);">📅 Follow up</button>
              `}
            </div>
          </div>

          <!-- Ward Sub-store strip (IPD/Daycare only) -->
          ${patient.type !== 'OPD' ? `
          <div style="background:var(--bg-surface); border:1px solid var(--border-color); border-radius:8px; padding:12px; margin-bottom:1rem; display:flex; flex-direction:column; gap:8px; text-align:left; color:var(--text-primary);">
            <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid var(--border-color); padding-bottom:6px;">
              <span style="font-weight:700; font-size:0.78rem; text-transform:uppercase; color:var(--text-secondary);">🏢 WARD SUB-STORE (${(patient.bed && patient.bed.includes('GW')) ? 'General Ward' : 'ICU'} par level)</span>
              <span style="font-size:0.7rem; color:var(--text-muted);">Top 8 Ward Items</span>
            </div>
            <div style="display:grid; grid-template-columns:repeat(4, 1fr); gap:12px;">
              <div style="font-size:0.75rem; border:1px solid var(--border-color); padding:6px; border-radius:4px; display:flex; justify-content:space-between; align-items:center;">
                <span>IV NS 500ml: <strong>12 bags</strong> <span class="badge badge-danger" style="font-size:8px;">LOW</span></span>
                <button class="btn btn-primary btn-xs" style="padding:1px 4px; font-size:8px;" onclick="window.showStockRequestOverlay({dept:(patient.bed && patient.bed.includes('GW')) ? 'General Ward' : 'ICU', urgency:'Urgent', prefillItem:{code:'ITM-CON-006', name:'IV NS 500ml', qty:50, unit:'bags'}})">Request →</button>
              </div>
              <div style="font-size:0.75rem; border:1px solid var(--border-color); padding:6px; border-radius:4px; display:flex; justify-content:space-between; align-items:center;">
                <span>Sterile Gloves: <strong>85 pcs</strong> <span class="badge badge-success" style="font-size:8px;">OK</span></span>
              </div>
              <div style="font-size:0.75rem; border:1px solid var(--border-color); padding:6px; border-radius:4px; display:flex; justify-content:space-between; align-items:center;">
                <span>Dressing Gauze: <strong>0 rolls</strong> <span class="badge badge-danger" style="font-size:8px;">OUT</span></span>
                <button class="btn btn-primary btn-xs" style="padding:1px 4px; font-size:8px;" onclick="window.showStockRequestOverlay({dept:(patient.bed && patient.bed.includes('GW')) ? 'General Ward' : 'ICU', urgency:'Urgent', prefillItem:{code:'ITM-CON-004', name:'Dressing Gauze', qty:20, unit:'rolls'}})">Request →</button>
              </div>
              <div style="font-size:0.75rem; border:1px solid var(--border-color); padding:6px; border-radius:4px; display:flex; justify-content:space-between; align-items:center;">
                <span>Sterile Drape Set: <strong>8 pcs</strong> <span class="badge badge-success" style="font-size:8px;">OK</span></span>
              </div>
            </div>
          </div>
          ` : ''}

          <!-- Main Workspace Body -->
          ${!window.activeConsultationStarted ? `
            <!-- CLINICAL DETAILS SUMMARY DASHBOARD -->
            <div class="emr-dashboard-grid">
              
              <!-- ANC Card (Only for Pregnant patients) -->
              ${patient.pregnancyStatus === 'Pregnant' ? `
                <div class="emr-dash-card" style="border-top: 4px solid #ec4899;">
                  <h4>🤰 Ante-Natal Care (ANC) Card</h4>
                  <div style="display: flex; flex-direction: column; gap: 0.5rem; font-size: 0.8rem;">
                    <div style="display: flex; justify-content: space-between;">
                      <span style="color: var(--text-secondary);">Expected Date of Delivery (EDD):</span>
                      <strong style="color: #ec4899;">${patient.edd || '—'}</strong>
                    </div>
                    <div style="display: flex; justify-content: space-between;">
                      <span style="color: var(--text-secondary);">Fetal Heart Rate (FHR):</span>
                      <strong>${patient.fhr || '—'}</strong>
                    </div>
                    <div style="display: flex; justify-content: space-between;">
                      <span style="color: var(--text-secondary);">Active BP & Weight:</span>
                      <strong>${patient.vitals?.bp || '—'} | ${patient.vitals?.weight || '—'} kg</strong>
                    </div>
                    <div style="background: var(--bg-surface-elevated); padding: 0.5rem; border-radius: 6px; margin-top: 0.25rem; font-size: 0.75rem;">
                      <strong>Gestational Notes:</strong> Routine growth scan due at 24 weeks. Keep track of fetal movements.
                    </div>
                  </div>
                </div>
              ` : ''}

              <!-- Menstrual History -->
              <div class="emr-dash-card" style="border-top: 4px solid #3b82f6;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                  <h4 style="margin: 0;">🩸 Menstrual History</h4>
                  ${(window.state?.activeUserRole === 'Doctor' || window.state?.activeUserRole === 'Nurse') ? `
                    <button class="btn btn-secondary btn-xs" style="padding: 0.15rem 0.4rem; font-size: 0.72rem; font-weight: 600;" onclick="window.openEmrAddDataModal('menstrual', '${patient.uhid}')">+ Add</button>
                  ` : ''}
                </div>
                <div style="display: flex; flex-direction: column; gap: 0.5rem; font-size: 0.8rem;">
                  <div style="display: flex; justify-content: space-between;">
                    <span style="color: var(--text-secondary);">Last Menstrual Period (LMP):</span>
                    <strong>${patient.menstrualHistory?.lmp || '—'}</strong>
                  </div>
                  <div style="display: flex; justify-content: space-between;">
                    <span style="color: var(--text-secondary);">Cycle Length & Regularity:</span>
                    <strong>${patient.menstrualHistory?.cycle || '—'} (${patient.menstrualHistory?.flow || 'Regular'} flow)</strong>
                  </div>
                  <div style="display: flex; justify-content: space-between;">
                    <span style="color: var(--text-secondary);">Dysmenorrhea:</span>
                    <strong>${patient.menstrualHistory?.dysmenorrhea || '—'}</strong>
                  </div>
                </div>
              </div>

              <!-- Obstetric History -->
              <div class="emr-dash-card" style="border-top: 4px solid #10b981;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                  <h4 style="margin: 0;">🗂️ Obstetric History</h4>
                  ${(window.state?.activeUserRole === 'Doctor' || window.state?.activeUserRole === 'Nurse') ? `
                    <button class="btn btn-secondary btn-xs" style="padding: 0.15rem 0.4rem; font-size: 0.72rem; font-weight: 600;" onclick="window.openEmrAddDataModal('obstetric', '${patient.uhid}')">+ Add</button>
                  ` : ''}
                </div>
                <div style="display: flex; flex-direction: column; gap: 0.4rem; max-height: 180px; overflow-y: auto;">
                  ${patient.obstetricHistory && patient.obstetricHistory.length > 0 ? patient.obstetricHistory.map(oh => `
                    <div style="border-bottom: 1px dotted var(--border-color); padding-bottom: 0.4rem; font-size: 0.8rem;">
                      <div style="font-weight: 700; color: var(--text-primary);">${oh.pregnancy}</div>
                      <div style="color: var(--text-secondary); font-size: 0.75rem; margin-top: 0.1rem;">${oh.details}</div>
                      ${oh.complications !== 'None' ? `<span style="color: #dc2626; font-size: 0.7rem; font-weight: 600;">⚠️ ${oh.complications}</span>` : ''}
                    </div>
                  `).join('') : '<div style="font-size: 0.8rem; color: var(--text-muted); padding: 1rem 0; text-align: center;">No previous obstetric records.</div>'}
                </div>
              </div>

              <!-- Prescription History -->
              <div class="emr-dash-card" style="border-top: 4px solid #f59e0b;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                  <h4 style="margin: 0;">💊 Prescription History</h4>
                  ${(window.state?.activeUserRole === 'Doctor' || window.state?.activeUserRole === 'Nurse') ? `
                    <button class="btn btn-secondary btn-xs" style="padding: 0.15rem 0.4rem; font-size: 0.72rem; font-weight: 600;" onclick="window.openEmrAddDataModal('prescription', '${patient.uhid}')">+ Add</button>
                  ` : ''}
                </div>
                <div style="display: flex; flex-direction: column; gap: 0.4rem; max-height: 180px; overflow-y: auto;">
                  ${patient.prescriptionHistory && patient.prescriptionHistory.length > 0 ? patient.prescriptionHistory.map(ph => `
                    <div style="border-bottom: 1px dotted var(--border-color); padding-bottom: 0.4rem; font-size: 0.8rem;">
                      <div style="display: flex; justify-content: space-between; font-weight: 700;">
                        <span>${ph.date}</span>
                        <span style="color: var(--text-muted); font-size: 0.75rem;">${ph.doctor}</span>
                      </div>
                      <ul style="margin: 0.25rem 0 0 0; padding-left: 1.2rem; color: var(--text-secondary); font-size: 0.75rem;">
                        ${ph.medicines.map(m => `<li>${m}</li>`).join('')}
                      </ul>
                    </div>
                  `).join('') : '<div style="font-size: 0.8rem; color: var(--text-muted); padding: 1rem 0; text-align: center;">No prescription history.</div>'}
                </div>
              </div>

              <!-- Files & Images -->
              <div class="emr-dash-card" style="border-top: 4px solid #8b5cf6;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                  <h4 style="margin: 0;">📁 Files & Images (Attachments)</h4>
                  ${(window.state?.activeUserRole === 'Doctor' || window.state?.activeUserRole === 'Nurse') ? `
                    <button class="btn btn-secondary btn-xs" style="padding: 0.15rem 0.4rem; font-size: 0.72rem; font-weight: 600;" onclick="window.openEmrAddDataModal('attachments', '${patient.uhid}')">+ Add</button>
                  ` : ''}
                </div>
                <div style="display: flex; flex-direction: column; gap: 0.4rem;">
                  ${patient.files && patient.files.length > 0 ? patient.files.map(f => `
                    <div style="display: flex; align-items: center; justify-content: space-between; padding: 0.35rem 0.5rem; background: var(--bg-surface-elevated); border-radius: 6px; font-size: 0.8rem; border: 1px solid var(--border-color);">
                      <div style="display: flex; align-items: center; gap: 0.4rem; overflow: hidden;">
                        <span style="font-size: 1.25rem;">📄</span>
                        <div style="overflow: hidden;">
                          <div style="font-weight: 600; text-overflow: ellipsis; white-space: nowrap; overflow: hidden; max-width: 160px;">${f.name}</div>
                          <span style="font-size: 0.7rem; color: var(--text-muted);">${f.size}</span>
                        </div>
                      </div>
                      <button class="btn btn-sm btn-secondary" style="padding: 0.15rem 0.4rem; font-size: 0.7rem;" onclick="alert('Opening report preview for: ${f.name}')">View</button>
                    </div>
                  `).join('') : '<div style="font-size: 0.8rem; color: var(--text-muted); padding: 1rem 0; text-align: center;">No file attachments.</div>'}
                </div>
              </div>

              <!-- Medical Reports -->
              <div class="emr-dash-card" style="border-top: 4px solid #ec4899;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                  <h4 style="margin: 0;">📊 Medical Reports</h4>
                  ${(window.state?.activeUserRole === 'Doctor' || window.state?.activeUserRole === 'Nurse') ? `
                    <button class="btn btn-secondary btn-xs" style="padding: 0.15rem 0.4rem; font-size: 0.72rem; font-weight: 600;" onclick="window.openEmrAddDataModal('reports', '${patient.uhid}')">+ Add</button>
                  ` : ''}
                </div>
                <div style="display: flex; flex-direction: column; gap: 0.4rem; max-height: 180px; overflow-y: auto;">
                  ${patient.medicalReports && patient.medicalReports.length > 0 ? patient.medicalReports.map(mr => `
                    <div style="border-bottom: 1px dotted var(--border-color); padding-bottom: 0.4rem; font-size: 0.8rem;">
                      <div style="display: flex; justify-content: space-between; font-weight: 700;">
                        <span>${mr.testName}</span>
                        <span style="font-size: 0.7rem; color: #10b981;">${mr.status}</span>
                      </div>
                      <div style="color: var(--text-secondary); font-size: 0.75rem; margin-top: 0.1rem;">Result: ${mr.result}</div>
                    </div>
                  `).join('') : '<div style="font-size: 0.8rem; color: var(--text-muted); padding: 1rem 0; text-align: center;">No diagnostic report logs.</div>'}
                </div>
              </div>

              <!-- Vitals History Table -->
              <div class="emr-dash-card" style="grid-column: span 2; border-top: 4px solid #06b6d4;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                  <h4 style="margin: 0;">📈 Vitals History Table</h4>
                  ${(window.state?.activeUserRole === 'Doctor' || window.state?.activeUserRole === 'Nurse') ? `
                    <button class="btn btn-secondary btn-xs" style="padding: 0.15rem 0.4rem; font-size: 0.72rem; font-weight: 600;" onclick="window.openEmrAddDataModal('vitals', '${patient.uhid}')">+ Add</button>
                  ` : ''}
                </div>
                <table style="width: 100%; border-collapse: collapse; font-size: 0.8rem;">
                  <thead>
                    <tr style="border-bottom: 1px solid var(--border-color); text-align: left; color: var(--text-secondary); font-weight: 600;">
                      <th style="padding: 0.4rem 0.5rem;">Date</th>
                      <th style="padding: 0.4rem 0.5rem;">BP (mmHg)</th>
                      <th style="padding: 0.4rem 0.5rem;">Weight (kg)</th>
                      <th style="padding: 0.4rem 0.5rem;">Heart Rate</th>
                      <th style="padding: 0.4rem 0.5rem;">Temperature</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${patient.vitalsHistory && patient.vitalsHistory.length > 0 ? patient.vitalsHistory.map(vh => `
                      <tr style="border-bottom: 1px solid var(--border-color);">
                        <td style="padding: 0.4rem 0.5rem;">${vh.date}</td>
                        <td style="padding: 0.4rem 0.5rem; font-weight: 600;">${vh.bp}</td>
                        <td style="padding: 0.4rem 0.5rem;">${vh.wt}</td>
                        <td style="padding: 0.4rem 0.5rem;">${vh.hr}</td>
                        <td style="padding: 0.4rem 0.5rem;">${vh.temp}</td>
                      </tr>
                    `).join('') : '<tr><td colspan="5" style="text-align: center; padding: 1rem; color: var(--text-muted);">No vitals log.</td></tr>'}
                  </tbody>
                </table>
              </div>

              <!-- Investigations History Table -->
              <div class="emr-dash-card" style="border-top: 4px solid #6366f1;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                  <h4 style="margin: 0;">🔬 Investigations History</h4>
                  ${(window.state?.activeUserRole === 'Doctor' || window.state?.activeUserRole === 'Nurse') ? `
                    <button class="btn btn-secondary btn-xs" style="padding: 0.15rem 0.4rem; font-size: 0.72rem; font-weight: 600;" onclick="window.openEmrAddDataModal('investigations', '${patient.uhid}')">+ Add</button>
                  ` : ''}
                </div>
                <div style="display: flex; flex-direction: column; gap: 0.4rem; max-height: 180px; overflow-y: auto;">
                  ${patient.investigationsHistory && patient.investigationsHistory.length > 0 ? patient.investigationsHistory.map(ih => `
                    <div style="border-bottom: 1px dotted var(--border-color); padding-bottom: 0.4rem; font-size: 0.8rem;">
                      <div style="display: flex; justify-content: space-between; font-weight: 700;">
                        <span>${ih.name}</span>
                        <span style="font-size: 0.72rem; color: #3b82f6;">${ih.status}</span>
                      </div>
                      <div style="color: var(--text-secondary); font-size: 0.75rem; margin-top: 0.1rem;">Result: ${ih.result} (${ih.date})</div>
                    </div>
                  `).join('') : '<div style="font-size: 0.8rem; color: var(--text-muted); padding: 1rem 0; text-align: center;">No investigation logs.</div>'}
                </div>
              </div>

              <!-- Medical History -->
              <div class="emr-dash-card" style="border-top: 4px solid #64748b;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                  <h4 style="margin: 0;">📜 Allergies & Medical History</h4>
                  ${(window.state?.activeUserRole === 'Doctor' || window.state?.activeUserRole === 'Nurse') ? `
                    <button class="btn btn-secondary btn-xs" style="padding: 0.15rem 0.4rem; font-size: 0.72rem; font-weight: 600;" onclick="window.openEmrAddDataModal('allergies', '${patient.uhid}')">+ Add</button>
                  ` : ''}
                </div>
                <div style="display: flex; flex-direction: column; gap: 0.5rem; font-size: 0.8rem;">
                  <div>
                    <strong>Allergies:</strong>
                    <span style="color: var(--color-danger); font-weight: 600; margin-left: 0.25rem;">${patient.allergies || 'No Known Allergies'}</span>
                  </div>
                  <div>
                    <strong>Chronic Conditions:</strong>
                    <span style="color: var(--text-secondary); margin-left: 0.25rem;">${patient.history?.pastConditions || 'None'}</span>
                  </div>
                  <div>
                    <strong>Past Surgeries:</strong>
                    <span style="color: var(--text-secondary); margin-left: 0.25rem;">${patient.history?.surgeries || 'None'}</span>
                  </div>
                  <div>
                    <strong>Family History:</strong>
                    <span style="color: var(--text-secondary); margin-left: 0.25rem;">${patient.history?.familyHistory || 'None'}</span>
                  </div>
                </div>
              </div>

            </div>
            <!-- My Recent Requests -->
            ${window.renderMyRecentRequestsHTML ? window.renderMyRecentRequestsHTML((patient.bed && patient.bed.includes('GW')) ? 'General Ward' : 'ICU') : ''}
          ` : `
            <!-- ACTIVE CONSULTATION SCREEN -->
            <div class="emr-layout" style="grid-template-columns: ${patient.pregnancyStatus === 'Pregnant' ? '450px 1fr 320px' : '1fr 320px'}; display: grid; gap: 1.25rem; align-items: start;">
              
              ${patient.pregnancyStatus === 'Pregnant' ? `
                <!-- Column 1: ANC Card (Left side) -->
                <div class="card" style="box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.02); border-radius: 8px; border: 1px solid var(--border-color); display: flex; flex-direction: column;">
                  <div class="card-header" style="display: flex; justify-content: space-between; align-items: center; padding: 0.75rem 1.25rem; border-bottom: 1px solid var(--border-color); background-color: var(--bg-surface);">
                    <h3 style="margin: 0; font-size: 1rem; font-weight: 600; color: var(--text-primary);">ANC Card</h3>
                    <button class="btn btn-secondary btn-sm" onclick="window.toggleConsultationCardBody(this)" style="padding: 0.25rem 0.5rem; height: 32px; display: flex; align-items: center; justify-content: center; cursor: pointer; border-radius: 4px; border: 1px solid var(--border-color); background: var(--bg-surface-elevated);">
                      <span style="font-size: 0.8rem; color: var(--text-muted);">▼</span>
                    </button>
                  </div>
                  <div class="card-body consultation-card-body" style="padding: 1.5rem; display: flex; flex-direction: column; gap: 1.5rem;">
                    <!-- Grid 1 -->
                    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.25rem;">
                      <div>
                        <label style="font-weight: 600; font-size: 0.8rem; color: var(--text-primary); margin-bottom: 0.35rem; display: block;">Visit Date</label>
                        <input type="date" value="${window.activeConsultation.ancData?.visitDate || ''}" onchange="window.updateAncField('visitDate', this.value)" style="width: 100%; border: 1px solid #cbd5e1; border-radius: 6px; padding: 0.5rem 0.75rem; font-size: 0.85rem; color: #334155; background: #fff; height: 38px;">
                      </div>
                      <div>
                        <label style="font-weight: 600; font-size: 0.8rem; color: var(--text-primary); margin-bottom: 0.35rem; display: block;">Gestational Age</label>
                        <select onchange="window.updateAncField('gestationalAge', this.value)" style="width: 100%; border: 1px solid #cbd5e1; border-radius: 6px; padding: 0.5rem 0.75rem; font-size: 0.85rem; color: #334155; background: #fff; height: 38px;">
                          <option value="">Select</option>
                          ${["6 Weeks", "8 Weeks", "12 Weeks", "16 Weeks", "20 Weeks", "24 Weeks", "28 Weeks", "32 Weeks", "36 Weeks", "38 Weeks", "40 Weeks"].map(opt => `<option value="${opt}" ${(window.activeConsultation.ancData?.gestationalAge || '') === opt ? 'selected' : ''}>${opt}</option>`).join('')}
                        </select>
                      </div>
                      <div>
                        <label style="font-weight: 600; font-size: 0.8rem; color: var(--text-primary); margin-bottom: 0.35rem; display: block;">EDD</label>
                        <input type="date" value="${window.activeConsultation.ancData?.edd || ''}" onchange="window.updateAncField('edd', this.value)" style="width: 100%; border: 1px solid #cbd5e1; border-radius: 6px; padding: 0.5rem 0.75rem; font-size: 0.85rem; color: #334155; background: #fff; height: 38px;">
                      </div>
                      <div>
                        <label style="font-weight: 600; font-size: 0.8rem; color: var(--text-primary); margin-bottom: 0.35rem; display: block;">Fever Signs</label>
                        <select onchange="window.updateAncField('feverSigns', this.value)" style="width: 100%; border: 1px solid #cbd5e1; border-radius: 6px; padding: 0.5rem 0.75rem; font-size: 0.85rem; color: #334155; background: #fff; height: 38px;">
                          <option value="">Select</option>
                          ${["No Fever", "Mild Fever", "High Fever"].map(opt => `<option value="${opt}" ${(window.activeConsultation.ancData?.feverSigns || '') === opt ? 'selected' : ''}>${opt}</option>`).join('')}
                        </select>
                      </div>
                    </div>

                    <!-- Mother's Vitals Title -->
                    <div>
                      <h4 style="font-size: 0.9rem; font-weight: 700; color: var(--text-primary); margin: 0 0 0.75rem 0;">Mother's Vitals</h4>
                      <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.25rem;">
                        <div>
                          <label style="font-weight: 600; font-size: 0.8rem; color: var(--text-primary); margin-bottom: 0.35rem; display: block;">Weight</label>
                          <input type="text" placeholder="e.g. 60 kg" value="${window.activeConsultation.ancData?.weight || ''}" onchange="window.updateAncField('weight', this.value)" style="width: 100%; border: 1px solid #cbd5e1; border-radius: 6px; padding: 0.5rem 0.75rem; font-size: 0.85rem; color: #334155; background: #fff; height: 38px;">
                        </div>
                        <div>
                          <label style="font-weight: 600; font-size: 0.8rem; color: var(--text-primary); margin-bottom: 0.35rem; display: block;">Blood Pressure</label>
                          <input type="text" placeholder="e.g. 120/80 mmHg" value="${window.activeConsultation.ancData?.bp || ''}" onchange="window.updateAncField('bp', this.value)" style="width: 100%; border: 1px solid #cbd5e1; border-radius: 6px; padding: 0.5rem 0.75rem; font-size: 0.85rem; color: #334155; background: #fff; height: 38px;">
                        </div>
                        <div>
                          <label style="font-weight: 600; font-size: 0.8rem; color: var(--text-primary); margin-bottom: 0.35rem; display: block;">Pulse Rate</label>
                          <input type="text" value="${window.activeConsultation.ancData?.pulseRate || ''}" onchange="window.updateAncField('pulseRate', this.value)" style="width: 100%; border: 1px solid #cbd5e1; border-radius: 6px; padding: 0.5rem 0.75rem; font-size: 0.85rem; color: #334155; background: #fff; height: 38px;">
                        </div>
                        <div>
                          <label style="font-weight: 600; font-size: 0.8rem; color: var(--text-primary); margin-bottom: 0.35rem; display: block;">Temperature</label>
                          <input type="text" placeholder="e.g. 98.6 °F" value="${window.activeConsultation.ancData?.temp || ''}" onchange="window.updateAncField('temp', this.value)" style="width: 100%; border: 1px solid #cbd5e1; border-radius: 6px; padding: 0.5rem 0.75rem; font-size: 0.85rem; color: #334155; background: #fff; height: 38px;">
                        </div>
                      </div>
                    </div>

                    <!-- Pregnancy Examinations Title -->
                    <div>
                      <h4 style="font-size: 0.9rem; font-weight: 700; color: var(--text-primary); margin: 0 0 0.75rem 0;">Pregnancy Examinations</h4>
                      <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.25rem;">
                        <div>
                          <label style="font-weight: 600; font-size: 0.8rem; color: var(--text-primary); margin-bottom: 0.35rem; display: block;">Fundal Height</label>
                          <input type="text" placeholder="e.g. 24 cm" value="${window.activeConsultation.ancData?.fundalHeight || ''}" onchange="window.updateAncField('fundalHeight', this.value)" style="width: 100%; border: 1px solid #cbd5e1; border-radius: 6px; padding: 0.5rem 0.75rem; font-size: 0.85rem; color: #334155; background: #fff; height: 38px;">
                        </div>
                        <div>
                          <label style="font-weight: 600; font-size: 0.8rem; color: var(--text-primary); margin-bottom: 0.35rem; display: block;">Fetal Heart Rate</label>
                          <input type="text" placeholder="e.g. 140 bpm" value="${window.activeConsultation.ancData?.fhr || ''}" onchange="window.updateAncField('fhr', this.value)" style="width: 100%; border: 1px solid #cbd5e1; border-radius: 6px; padding: 0.5rem 0.75rem; font-size: 0.85rem; color: #334155; background: #fff; height: 38px;">
                        </div>
                        <div>
                          <label style="font-weight: 600; font-size: 0.8rem; color: var(--text-primary); margin-bottom: 0.35rem; display: block;">Fetal Movement</label>
                          <select onchange="window.updateAncField('fetalMovement', this.value)" style="width: 100%; border: 1px solid #cbd5e1; border-radius: 6px; padding: 0.5rem 0.75rem; font-size: 0.85rem; color: #334155; background: #fff; height: 38px;">
                            <option value="">Select</option>
                            ${["Active / Normal", "Diminished", "Absent"].map(opt => `<option value="${opt}" ${(window.activeConsultation.ancData?.fetalMovement || '') === opt ? 'selected' : ''}>${opt}</option>`).join('')}
                          </select>
                        </div>
                        <div>
                          <label style="font-weight: 600; font-size: 0.8rem; color: var(--text-primary); margin-bottom: 0.35rem; display: block;">Presentation</label>
                          <select onchange="window.updateAncField('presentation', this.value)" style="width: 100%; border: 1px solid #cbd5e1; border-radius: 6px; padding: 0.5rem 0.75rem; font-size: 0.85rem; color: #334155; background: #fff; height: 38px;">
                            <option value="">Select</option>
                            ${["Cephalic (Head Down)", "Breech (Bottom First)", "Transverse (Lying Sideways)", "Oblique"].map(opt => `<option value="${opt}" ${(window.activeConsultation.ancData?.presentation || '') === opt ? 'selected' : ''}>${opt}</option>`).join('')}
                          </select>
                        </div>
                      </div>
                    </div>

                    <!-- Investigations Title -->
                    <div>
                      <h4 style="font-size: 0.9rem; font-weight: 700; color: var(--text-primary); margin: 0 0 0.75rem 0;">Investigations</h4>
                      <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.25rem;">
                        <div>
                          <label style="font-weight: 600; font-size: 0.8rem; color: var(--text-primary); margin-bottom: 0.35rem; display: block;">Hemoglobin</label>
                          <select onchange="window.updateAncField('hemoglobin', this.value)" style="width: 100%; border: 1px solid #cbd5e1; border-radius: 6px; padding: 0.5rem 0.75rem; font-size: 0.85rem; color: #334155; background: #fff; height: 38px;">
                            <option value="">Select</option>
                            ${["12.0 - 15.5 g/dL (Normal)", "11.0 - 11.9 g/dL (Mild Anemia)", "9.0 - 10.9 g/dL (Moderate Anemia)", "< 9.0 g/dL (Severe Anemia)"].map(opt => `<option value="${opt}" ${(window.activeConsultation.ancData?.hemoglobin || '') === opt ? 'selected' : ''}>${opt}</option>`).join('')}
                          </select>
                        </div>
                        <div>
                          <label style="font-weight: 600; font-size: 0.8rem; color: var(--text-primary); margin-bottom: 0.35rem; display: block;">Blood Sugar</label>
                          <select onchange="window.updateAncField('bloodSugar', this.value)" style="width: 100%; border: 1px solid #cbd5e1; border-radius: 6px; padding: 0.5rem 0.75rem; font-size: 0.85rem; color: #334155; background: #fff; height: 38px;">
                            <option value="">Select</option>
                            ${["Fasting < 95 mg/dL (Normal)", "Fasting 95-125 mg/dL (Borderline)", "Fasting > 125 mg/dL (High)", "Post-Prandial < 120 mg/dL (Normal)", "Post-Prandial > 120 mg/dL (High)"].map(opt => `<option value="${opt}" ${(window.activeConsultation.ancData?.bloodSugar || '') === opt ? 'selected' : ''}>${opt}</option>`).join('')}
                          </select>
                        </div>
                        <div>
                          <label style="font-weight: 600; font-size: 0.8rem; color: var(--text-primary); margin-bottom: 0.35rem; display: block;">Urine Protein</label>
                          <select onchange="window.updateAncField('urineProtein', this.value)" style="width: 100%; border: 1px solid #cbd5e1; border-radius: 6px; padding: 0.5rem 0.75rem; font-size: 0.85rem; color: #334155; background: #fff; height: 38px;">
                            <option value="">Select</option>
                            ${["Nil (Normal)", "Trace", "1+ (Mild)", "2+ (Moderate)", "3+ (Severe)"].map(opt => `<option value="${opt}" ${(window.activeConsultation.ancData?.urineProtein || '') === opt ? 'selected' : ''}>${opt}</option>`).join('')}
                          </select>
                        </div>
                        <div>
                          <label style="font-weight: 600; font-size: 0.8rem; color: var(--text-primary); margin-bottom: 0.35rem; display: block;">Ultrasound Findings</label>
                          <input type="text" placeholder="e.g. Single Live Fetus" value="${window.activeConsultation.ancData?.usgFindings || ''}" onchange="window.updateAncField('usgFindings', this.value)" style="width: 100%; border: 1px solid #cbd5e1; border-radius: 6px; padding: 0.5rem 0.75rem; font-size: 0.85rem; color: #334155; background: #fff; height: 38px;">
                        </div>
                      </div>
                    </div>

                    <!-- Doctor Notes -->
                    <div>
                      <label style="font-weight: 600; font-size: 0.8rem; color: var(--text-primary); margin-bottom: 0.35rem; display: block;">Doctor Notes</label>
                      <select onchange="window.updateAncField('doctorNotes', this.value)" style="width: 100%; border: 1px solid #cbd5e1; border-radius: 6px; padding: 0.5rem 0.75rem; font-size: 0.85rem; color: #334155; background: #fff; height: 38px;">
                        <option value="">Select</option>
                        ${["Routine antenatal checkup. FHR normal. EDD confirmed.", "Vitals normal. Recommended routine scan.", "High BP noted. Advised rest and monitoring.", "Gestational diabetes screening recommended.", "Advised iron and calcium supplements."].map(opt => `<option value="${opt}" ${(window.activeConsultation.ancData?.doctorNotes || '') === opt ? 'selected' : ''}>${opt}</option>`).join('')}
                      </select>
                    </div>
                  </div>
                </div>
              ` : ''}

              <!-- Column 2 (or Column 1 if not pregnant): Stacked Consultation Sections -->
              <div style="display: flex; flex-direction: column; gap: 1rem; width: 100%;">
                


                <!-- 1. Symptoms & Findings Tabbed Card -->
                <div id="consultation-sections-placeholder"></div>

              </div>


              <!-- Right Panel: Vitals, History -->
              <aside class="emr-right-panel">
                <!-- Vitals Card -->
                <div class="card">
                  <div class="card-header">
                    <h3 class="card-title">Vitals Dashboard</h3>
                  </div>
                  <div class="card-body">
                    <div class="vitals-grid" style="margin-bottom: 1rem; display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.4rem;">
                      <div class="vital-box" style="padding: 0.35rem 0.5rem;">
                        <span class="vital-icon">🌡️</span>
                        <div class="vital-details">
                          <span class="vital-title">Temp</span>
                          <span class="vital-value" id="vitals-temp-val">${patient.vitals?.temp || '--'} °F</span>
                        </div>
                      </div>
                      <div class="vital-box" style="padding: 0.35rem 0.5rem;">
                        <span class="vital-icon">❤️</span>
                        <div class="vital-details">
                          <span class="vital-title">Pulse</span>
                          <span class="vital-value" id="vitals-hr-val">${patient.vitals?.hr || '--'} bpm</span>
                        </div>
                      </div>
                      <div class="vital-box" style="padding: 0.35rem 0.5rem;">
                        <span class="vital-icon">🩺</span>
                        <div class="vital-details">
                          <span class="vital-title">BP</span>
                          <span class="vital-value" id="vitals-bp-val">${patient.vitals?.bp || '--'}</span>
                        </div>
                      </div>
                      <div class="vital-box" style="padding: 0.35rem 0.5rem;">
                        <span class="vital-icon">💨</span>
                        <div class="vital-details">
                          <span class="vital-title">Resp. Rate</span>
                          <span class="vital-value" id="vitals-rr-val">${patient.vitals?.rr || '--'} /min</span>
                        </div>
                      </div>
                      <div class="vital-box" style="padding: 0.35rem 0.5rem;">
                        <span class="vital-icon">🔵</span>
                        <div class="vital-details">
                          <span class="vital-title">SpO2</span>
                          <span class="vital-value" id="vitals-spo2-val">${patient.vitals?.spo2 || '--'}%</span>
                        </div>
                      </div>
                      <div class="vital-box" style="padding: 0.35rem 0.5rem;">
                        <span class="vital-icon">⚖️</span>
                        <div class="vital-details">
                          <span class="vital-title">Weight</span>
                          <span class="vital-value" id="vitals-weight-val">${patient.vitals?.weight || '--'} kg</span>
                        </div>
                      </div>
                      <div class="vital-box" style="padding: 0.35rem 0.5rem;">
                        <span class="vital-icon">⚡</span>
                        <div class="vital-details">
                          <span class="vital-title">Pain Score</span>
                          <span class="vital-value" id="vitals-pain-val">${patient.vitals?.pain !== undefined ? patient.vitals.pain : '--'}/10</span>
                        </div>
                      </div>
                      <div class="vital-box" style="padding: 0.35rem 0.5rem;">
                        <span class="vital-icon">🍭</span>
                        <div class="vital-details">
                          <span class="vital-title">Sugar</span>
                          <span class="vital-value" id="vitals-sugar-val">${patient.vitals?.sugar || '--'} mg/dL</span>
                        </div>
                      </div>
                      <div class="vital-box" style="padding: 0.35rem 0.5rem;">
                        <span class="vital-icon">💧</span>
                        <div class="vital-details">
                          <span class="vital-title">Urine</span>
                          <span class="vital-value" id="vitals-urine-val">${patient.vitals?.urine || '--'} mL</span>
                        </div>
                      </div>
                      <div class="vital-box" style="padding: 0.35rem 0.5rem;">
                        <span class="vital-icon">😷</span>
                        <div class="vital-details">
                          <span class="vital-title">O2 Support</span>
                          <span class="vital-value" id="vitals-oxygen-val">${patient.vitals?.oxygen || 'N/A'}</span>
                        </div>
                      </div>
                    </div>
                    <div id="vitals-notes-container" style="${patient.vitals?.notes ? '' : 'display:none;'} margin-top: 0.5rem; font-size: 0.75rem; color: var(--text-secondary); background-color: var(--bg-surface-elevated); padding: 0.35rem 0.5rem; border-radius: 4px; margin-bottom: 1rem;">
                      <strong>Notes:</strong> <span id="vitals-notes-val">${patient.vitals?.notes || ''}</span>
                    </div>

                    <!-- Record Vitals Inline form -->
                    <div style="background-color: var(--bg-surface-elevated); padding: 0.75rem; border-radius: 8px;">
                      <h5 style="margin-bottom: 0.5rem; font-size: 0.8rem;">Record Vitals</h5>
                      <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.4rem; margin-bottom: 0.5rem;">
                        <div class="form-group" style="margin-bottom:0;">
                          <label style="font-size: 0.65rem; color: var(--text-secondary); margin-bottom: 0.1rem; display: block;">Temp (°F)</label>
                          <input type="number" id="vit-temp" class="form-control" value="${patient.vitals?.temp || '98.6'}" step="0.1" style="font-size: 0.75rem; padding: 0.25rem;">
                        </div>
                        <div class="form-group" style="margin-bottom:0;">
                          <label style="font-size: 0.65rem; color: var(--text-secondary); margin-bottom: 0.1rem; display: block;">Pulse (bpm)</label>
                          <input type="number" id="vit-hr" class="form-control" value="${patient.vitals?.hr || '78'}" style="font-size: 0.75rem; padding: 0.25rem;">
                        </div>
                        <div class="form-group" style="margin-bottom:0;">
                          <label style="font-size: 0.65rem; color: var(--text-secondary); margin-bottom: 0.1rem; display: block;">BP (mmHg)</label>
                          <input type="text" id="vit-bp" class="form-control" value="${patient.vitals?.bp || '120/80'}" style="font-size: 0.75rem; padding: 0.25rem;">
                        </div>
                        <div class="form-group" style="margin-bottom:0;">
                          <label style="font-size: 0.65rem; color: var(--text-secondary); margin-bottom: 0.1rem; display: block;">Resp. Rate</label>
                          <input type="number" id="vit-rr" class="form-control" value="${patient.vitals?.rr || '18'}" style="font-size: 0.75rem; padding: 0.25rem;">
                        </div>
                        <div class="form-group" style="margin-bottom:0;">
                          <label style="font-size: 0.65rem; color: var(--text-secondary); margin-bottom: 0.1rem; display: block;">SpO2 (%)</label>
                          <input type="number" id="vit-spo2" class="form-control" value="${patient.vitals?.spo2 || '98'}" style="font-size: 0.75rem; padding: 0.25rem;">
                        </div>
                        <div class="form-group" style="margin-bottom:0;">
                          <label style="font-size: 0.65rem; color: var(--text-secondary); margin-bottom: 0.1rem; display: block;">Weight (kg)</label>
                          <input type="number" id="vit-weight" class="form-control" value="${patient.vitals?.weight || '70'}" style="font-size: 0.75rem; padding: 0.25rem;">
                        </div>
                        <div class="form-group" style="margin-bottom:0;">
                          <label style="font-size: 0.65rem; color: var(--text-secondary); margin-bottom: 0.1rem; display: block;">Pain Score</label>
                          <input type="number" id="vit-pain" class="form-control" value="${patient.vitals?.pain !== undefined ? patient.vitals.pain : '0'}" min="0" max="10" style="font-size: 0.75rem; padding: 0.25rem;">
                        </div>
                        <div class="form-group" style="margin-bottom:0;">
                          <label style="font-size: 0.65rem; color: var(--text-secondary); margin-bottom: 0.1rem; display: block;">Sugar</label>
                          <input type="number" id="vit-sugar" class="form-control" value="${patient.vitals?.sugar || '110'}" style="font-size: 0.75rem; padding: 0.25rem;">
                        </div>
                        <div class="form-group" style="margin-bottom:0;">
                          <label style="font-size: 0.65rem; color: var(--text-secondary); margin-bottom: 0.1rem; display: block;">Urine (mL)</label>
                          <input type="number" id="vit-urine" class="form-control" value="${patient.vitals?.urine || '500'}" style="font-size: 0.75rem; padding: 0.25rem;">
                        </div>
                        <div class="form-group" style="margin-bottom:0;">
                          <label style="font-size: 0.65rem; color: var(--text-secondary); margin-bottom: 0.1rem; display: block;">O2 Support</label>
                          <input type="text" id="vit-oxygen" class="form-control" value="${patient.vitals?.oxygen || 'N/A'}" style="font-size: 0.75rem; padding: 0.25rem;">
                        </div>
                        <div class="form-group" style="grid-column: span 2; margin-bottom:0;">
                          <label style="font-size: 0.65rem; color: var(--text-secondary); margin-bottom: 0.1rem; display: block;">Notes</label>
                          <textarea id="vit-notes" class="form-control" rows="1" placeholder="Vitals notes..." style="font-size: 0.75rem; padding: 0.25rem; resize: none;">${patient.vitals?.notes || ''}</textarea>
                        </div>
                      </div>
                      <button class="btn btn-secondary" style="width: 100%; font-size: 0.75rem; padding: 0.3rem;" onclick="logNewVitals('${patient.uhid}')">Save Vitals</button>
                    </div>
                  </div>
                </div>

                <!-- History Card -->
                <div class="card">
                  <div class="card-header">
                    <h3 class="card-title">Allergies & History</h3>
                  </div>
                  <div class="card-body" style="font-size: 0.8rem; display: flex; flex-direction: column; gap: 0.75rem;">
                    <div>
                      <strong style="color: var(--color-danger); display: block; margin-bottom: 0.25rem;">⚠️ Drug & Food Allergies:</strong>
                      <div style="background-color: var(--color-danger-bg); color: var(--color-danger); padding: 0.5rem; border-radius: 4px; font-weight: 500;">
                        ${patient.allergies || 'No Known Allergies'}
                      </div>
                    </div>
                    <div>
                      <strong>Past Medical History:</strong>
                      <p style="color: var(--text-secondary); margin-top: 0.25rem;">${patient.history?.pastConditions || 'None'}</p>
                    </div>
                    <div>
                      <strong>Family Medical History:</strong>
                      <p style="color: var(--text-secondary); margin-top: 0.25rem;">${patient.history?.familyHistory || 'None'}</p>
                    </div>
                    <div>
                      <strong>Past Surgeries:</strong>
                      <p style="color: var(--text-secondary); margin-top: 0.25rem;">${patient.history?.surgeries || 'None'}</p>
                    </div>
                  </div>
                </div>
              </aside>
            </div>
          `}
        `}
      </main>
    </div>

    <!-- Alternative Recommendation Drawer -->
    <div id="rx-drawer-backdrop" class="drawer-backdrop" onclick="window.closeRxDrawer()"></div>
    <div id="rx-recommendation-drawer" class="recommendation-drawer">
      <div class="drawer-header">
        <h4 class="drawer-title">🔁 Alternatives & CDSS Recommendation</h4>
        <span class="drawer-close" onclick="window.closeRxDrawer()">&times;</span>
      </div>
      <div class="drawer-body" id="rx-drawer-body">
        <!-- Drawer content is populated dynamically -->
      </div>
    </div>
  `;

  // Focus restore for live search
  if (wasSearchActive) {
    const s = document.getElementById('emr-sidebar-search');
    if (s) {
      s.focus();
      const val = s.value;
      s.value = '';
      s.value = val;
    }
  }

  // Initialize queries store if not exist
  window.consultationSectionQueries = window.consultationSectionQueries || {};

  // Bind specialty data switcher and stacked section helpers to window object
  window.changeConsultationSpecialty = function(spec) {
    window.activeConsultation.specialty = spec;
    window.activeConsultation.symptoms = [];
    window.activeConsultation.findings = [];
    window.activeConsultation.diagnostics = [];
    window.activeConsultation.medicines = [];
    window.activeConsultation.investigations = [];
    window.activeConsultation.procedures = [];
    window.consultationSectionQueries = {};
    
    // Refresh
    views.emr(emrContainer, null, { uhid: patient.uhid });
  };

  window.filterConsultationSection = function(sectionKey, query) {
    window.consultationSectionQueries = window.consultationSectionQueries || {};
    window.consultationSectionQueries[sectionKey] = query;
    
    const card = document.getElementById(`consultation-card-${sectionKey}`);
    if (card) {
      const container = card.querySelector('.pills-grid, .checkboxes-list');
      if (container) {
        container.innerHTML = window.getSectionItemsHTML(sectionKey);
      }
    }
  };

  window.openEmrAddDataModal = function(boxType, uhid) {
    let modal = document.getElementById('emr-add-data-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'emr-add-data-modal';
      modal.className = 'modal-overlay';
      document.body.appendChild(modal);
    }

    const patient = state.patients.find(p => p.uhid === uhid);
    if (!patient) return;

    let title = '';
    let formHTML = '';

    switch(boxType) {
      case 'menstrual':
        title = 'Update Menstrual History';
        formHTML = `
          <div class="form-group" style="margin-bottom: 1rem;">
            <label class="form-label" style="font-weight: 600;">Last Menstrual Period (LMP)</label>
            <input type="date" id="add-lmp" class="form-control" value="${patient.menstrualHistory?.lmp || ''}">
          </div>
          <div class="form-group" style="margin-bottom: 1rem;">
            <label class="form-label" style="font-weight: 600;">Cycle Length & Regularity</label>
            <input type="text" id="add-cycle" class="form-control" placeholder="e.g. 28 days, Regular" value="${patient.menstrualHistory?.cycle || ''}">
          </div>
          <div class="form-group" style="margin-bottom: 1rem;">
            <label class="form-label" style="font-weight: 600;">Flow Type</label>
            <select id="add-flow" class="form-select">
              <option value="Regular" ${patient.menstrualHistory?.flow === 'Regular' ? 'selected' : ''}>Regular</option>
              <option value="Heavy" ${patient.menstrualHistory?.flow === 'Heavy' ? 'selected' : ''}>Heavy</option>
              <option value="Light" ${patient.menstrualHistory?.flow === 'Light' ? 'selected' : ''}>Light</option>
            </select>
          </div>
          <div class="form-group" style="margin-bottom: 1rem;">
            <label class="form-label" style="font-weight: 600;">Dysmenorrhea</label>
            <select id="add-dysmenorrhea" class="form-select">
              <option value="None" ${patient.menstrualHistory?.dysmenorrhea === 'None' ? 'selected' : ''}>None</option>
              <option value="Mild" ${patient.menstrualHistory?.dysmenorrhea === 'Mild' ? 'selected' : ''}>Mild</option>
              <option value="Moderate" ${patient.menstrualHistory?.dysmenorrhea === 'Moderate' ? 'selected' : ''}>Moderate</option>
              <option value="Severe" ${patient.menstrualHistory?.dysmenorrhea === 'Severe' ? 'selected' : ''}>Severe</option>
            </select>
          </div>
        `;
        break;
      case 'obstetric':
        title = 'Add Obstetric History Record';
        formHTML = `
          <div class="form-group" style="margin-bottom: 1rem;">
            <label class="form-label" style="font-weight: 600;">Pregnancy Index/Term (e.g. G1 P0 A0)</label>
            <input type="text" id="add-pregnancy" class="form-control" placeholder="e.g. G1 P0 A0 or 1st Pregnancy" required>
          </div>
          <div class="form-group" style="margin-bottom: 1rem;">
            <label class="form-label" style="font-weight: 600;">Details / Outcome</label>
            <input type="text" id="add-details" class="form-control" placeholder="e.g. FTND, Male infant 3.2 kg, healthy" required>
          </div>
          <div class="form-group" style="margin-bottom: 1rem;">
            <label class="form-label" style="font-weight: 600;">Complications</label>
            <input type="text" id="add-complications" class="form-control" placeholder="e.g. Gestational Hypertension, or None" value="None">
          </div>
        `;
        break;
      case 'prescription':
        title = 'Add Prescription History Log';
        formHTML = `
          <div class="form-group" style="margin-bottom: 1rem;">
            <label class="form-label" style="font-weight: 600;">Date</label>
            <input type="date" id="add-rx-date" class="form-control" value="${new Date().toISOString().split('T')[0]}" required>
          </div>
          <div class="form-group" style="margin-bottom: 1rem;">
            <label class="form-label" style="font-weight: 600;">Prescribed By (Doctor)</label>
            <input type="text" id="add-rx-doctor" class="form-control" value="${patient.primaryConsultant || 'Dr. Amit Verma'}" required>
          </div>
          <div class="form-group" style="margin-bottom: 1rem;">
            <label class="form-label" style="font-weight: 600;">Medicines (Comma-separated)</label>
            <textarea id="add-rx-medicines" class="form-control" rows="3" placeholder="e.g. Tab. Dolo 650mg TDS, Cap. Pantocid 40mg OD" required></textarea>
          </div>
        `;
        break;
      case 'attachments':
        title = 'Attach File / Document';
        formHTML = `
          <div class="form-group" style="margin-bottom: 1rem;">
            <label class="form-label" style="font-weight: 600;">File Name</label>
            <input type="text" id="add-file-name" class="form-control" placeholder="e.g. Lab_Report_CBC.pdf" required>
          </div>
          <div class="form-group" style="margin-bottom: 1rem;">
            <label class="form-label" style="font-weight: 600;">File Size</label>
            <input type="text" id="add-file-size" class="form-control" placeholder="e.g. 1.8 MB" value="1.2 MB" required>
          </div>
        `;
        break;
      case 'reports':
        title = 'Log Diagnostic Medical Report';
        formHTML = `
          <div class="form-group" style="margin-bottom: 1rem;">
            <label class="form-label" style="font-weight: 600;">Test/Report Name</label>
            <input type="text" id="add-report-name" class="form-control" placeholder="e.g. Hemoglobin / CBC" required>
          </div>
          <div class="form-group" style="margin-bottom: 1rem;">
            <label class="form-label" style="font-weight: 600;">Result Summary</label>
            <input type="text" id="add-report-result" class="form-control" placeholder="e.g. Hb 12.8 g/dL (Normal)" required>
          </div>
          <div class="form-group" style="margin-bottom: 1rem;">
            <label class="form-label" style="font-weight: 600;">Status</label>
            <select id="add-report-status" class="form-select">
              <option value="Final">Final</option>
              <option value="Completed">Completed</option>
              <option value="Preliminary">Preliminary</option>
            </select>
          </div>
        `;
        break;
      case 'vitals':
        title = 'Add Vitals History Entry';
        formHTML = `
          <div class="form-group" style="margin-bottom: 1rem;">
            <label class="form-label" style="font-weight: 600;">Date</label>
            <input type="text" id="add-vital-date" class="form-control" value="${new Date().toLocaleString('en-US', { hour12: true, month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}" required>
          </div>
          <div class="form-group" style="margin-bottom: 1rem;">
            <label class="form-label" style="font-weight: 600;">Blood Pressure (mmHg)</label>
            <input type="text" id="add-vital-bp" class="form-control" placeholder="e.g. 120/80" value="${patient.vitals?.bp || '120/80'}" required>
          </div>
          <div class="form-group" style="margin-bottom: 1rem;">
            <label class="form-label" style="font-weight: 600;">Weight (kg)</label>
            <input type="text" id="add-vital-wt" class="form-control" placeholder="e.g. 68" value="${patient.vitals?.weight || '68'}" required>
          </div>
          <div class="form-group" style="margin-bottom: 1rem;">
            <label class="form-label" style="font-weight: 600;">Heart Rate (bpm)</label>
            <input type="text" id="add-vital-hr" class="form-control" placeholder="e.g. 72" value="${patient.vitals?.hr || '72'}" required>
          </div>
          <div class="form-group" style="margin-bottom: 1rem;">
            <label class="form-label" style="font-weight: 600;">Temperature (F)</label>
            <input type="text" id="add-vital-temp" class="form-control" placeholder="e.g. 98.6" value="${patient.vitals?.temp || '98.6'}" required>
          </div>
        `;
        break;
      case 'investigations':
        title = 'Add Investigation History Record';
        formHTML = `
          <div class="form-group" style="margin-bottom: 1rem;">
            <label class="form-label" style="font-weight: 600;">Investigation/Lab Test Name</label>
            <input type="text" id="add-inv-name" class="form-control" placeholder="e.g. Thyroid Stimulating Hormone" required>
          </div>
          <div class="form-group" style="margin-bottom: 1rem;">
            <label class="form-label" style="font-weight: 600;">Result/Finding</label>
            <input type="text" id="add-inv-result" class="form-control" placeholder="e.g. 2.45 mIU/L" required>
          </div>
          <div class="form-group" style="margin-bottom: 1rem;">
            <label class="form-label" style="font-weight: 600;">Status</label>
            <select id="add-inv-status" class="form-select">
              <option value="Final">Final</option>
              <option value="Preliminary">Preliminary</option>
              <option value="Ordered">Ordered</option>
            </select>
          </div>
          <div class="form-group" style="margin-bottom: 1rem;">
            <label class="form-label" style="font-weight: 600;">Date</label>
            <input type="date" id="add-inv-date" class="form-control" value="${new Date().toISOString().split('T')[0]}" required>
          </div>
        `;
        break;
      case 'allergies':
        title = 'Update Allergies & History';
        formHTML = `
          <div class="form-group" style="margin-bottom: 1rem;">
            <label class="form-label" style="font-weight: 600;">Known Allergies</label>
            <input type="text" id="add-allergies-list" class="form-control" placeholder="e.g. Penicillin, Peanuts" value="${patient.allergies || 'No Known Allergies'}">
          </div>
          <div class="form-group" style="margin-bottom: 1rem;">
            <label class="form-label" style="font-weight: 600;">Chronic Conditions</label>
            <input type="text" id="add-history-conditions" class="form-control" placeholder="e.g. Hypertension, Diabetes" value="${patient.history?.pastConditions || 'None'}">
          </div>
          <div class="form-group" style="margin-bottom: 1rem;">
            <label class="form-label" style="font-weight: 600;">Past Surgeries</label>
            <input type="text" id="add-history-surgeries" class="form-control" placeholder="e.g. Appendectomy, None" value="${patient.history?.surgeries || 'None'}">
          </div>
          <div class="form-group" style="margin-bottom: 1rem;">
            <label class="form-label" style="font-weight: 600;">Family History</label>
            <input type="text" id="add-history-family" class="form-control" placeholder="e.g. Heart disease, Diabetes, None" value="${patient.history?.familyHistory || 'None'}">
          </div>
        `;
        break;
    }

    modal.innerHTML = `
      <div class="modal-box" style="max-width: 480px; border-radius: 8px; box-shadow: var(--shadow-lg); border: 1px solid var(--border-color); background: var(--bg-surface); overflow: hidden; width: 90%;">
        <div class="modal-header" style="background-color: var(--bg-surface-elevated); border-bottom: 1px solid var(--border-color); padding: 1rem; display: flex; justify-content: space-between; align-items: center;">
          <h4 class="modal-title" style="margin: 0; font-weight: 700; color: var(--text-primary); font-size: 0.95rem;">${title}</h4>
          <span class="modal-close" style="cursor: pointer; font-size: 1.5rem; line-height: 1; color: var(--text-muted);" onclick="window.closeEmrAddDataModal()">&times;</span>
        </div>
        <div class="modal-body" style="padding: 1.5rem; font-size: 0.85rem; color: var(--text-primary);">
          <form id="emr-add-data-form" onsubmit="event.preventDefault(); window.saveEmrAddData('${boxType}', '${uhid}');">
            ${formHTML}
            <div style="display: flex; justify-content: flex-end; gap: 0.5rem; margin-top: 1.5rem;">
              <button type="button" class="btn btn-secondary" onclick="window.closeEmrAddDataModal()" style="height: 34px; font-size: 0.8rem; padding: 0 1rem; border-radius: 4px; border: 1px solid var(--border-color); background: var(--bg-surface-elevated); color: var(--text-primary); cursor: pointer; font-weight: 600;">Cancel</button>
              <button type="submit" class="btn btn-primary" style="height: 34px; font-size: 0.8rem; padding: 0 1rem; border-radius: 4px; background: #10b981; color: #fff; border: none; cursor: pointer; font-weight: 600;">Save Details</button>
            </div>
          </form>
        </div>
      </div>
    `;

    modal.classList.add('active');
    modal.style.display = 'flex';
  };

  window.closeEmrAddDataModal = function() {
    const modal = document.getElementById('emr-add-data-modal');
    if (modal) {
      modal.classList.remove('active');
      modal.style.display = 'none';
    }
  };

  window.saveEmrAddData = function(boxType, uhid) {
    const patient = state.patients.find(p => p.uhid === uhid);
    if (!patient) return;

    if (boxType === 'menstrual') {
      patient.menstrualHistory = {
        lmp: document.getElementById('add-lmp').value || '—',
        cycle: document.getElementById('add-cycle').value || '—',
        flow: document.getElementById('add-flow').value,
        dysmenorrhea: document.getElementById('add-dysmenorrhea').value
      };
    } else if (boxType === 'obstetric') {
      if (!patient.obstetricHistory) patient.obstetricHistory = [];
      patient.obstetricHistory.unshift({
        pregnancy: document.getElementById('add-pregnancy').value,
        details: document.getElementById('add-details').value,
        complications: document.getElementById('add-complications').value
      });
    } else if (boxType === 'prescription') {
      if (!patient.prescriptionHistory) patient.prescriptionHistory = [];
      const medsStr = document.getElementById('add-rx-medicines').value;
      const medicines = medsStr.split(',').map(m => m.trim()).filter(Boolean);
      patient.prescriptionHistory.unshift({
        date: document.getElementById('add-rx-date').value,
        doctor: document.getElementById('add-rx-doctor').value,
        medicines: medicines
      });
    } else if (boxType === 'attachments') {
      if (!patient.files) patient.files = [];
      patient.files.unshift({
        name: document.getElementById('add-file-name').value,
        size: document.getElementById('add-file-size').value
      });
    } else if (boxType === 'reports') {
      if (!patient.medicalReports) patient.medicalReports = [];
      patient.medicalReports.unshift({
        testName: document.getElementById('add-report-name').value,
        status: document.getElementById('add-report-status').value,
        result: document.getElementById('add-report-result').value
      });
    } else if (boxType === 'vitals') {
      if (!patient.vitalsHistory) patient.vitalsHistory = [];
      patient.vitalsHistory.unshift({
        date: document.getElementById('add-vital-date').value,
        bp: document.getElementById('add-vital-bp').value,
        wt: document.getElementById('add-vital-wt').value,
        hr: document.getElementById('add-vital-hr').value,
        temp: document.getElementById('add-vital-temp').value
      });
      // also update current active vitals in patient object to reflect
      if (!patient.vitals) patient.vitals = {};
      patient.vitals.bp = document.getElementById('add-vital-bp').value;
      patient.vitals.weight = parseFloat(document.getElementById('add-vital-wt').value) || patient.vitals.weight;
      patient.vitals.hr = parseInt(document.getElementById('add-vital-hr').value) || patient.vitals.hr;
      patient.vitals.temp = parseFloat(document.getElementById('add-vital-temp').value) || patient.vitals.temp;
    } else if (boxType === 'investigations') {
      if (!patient.investigationsHistory) patient.investigationsHistory = [];
      patient.investigationsHistory.unshift({
        name: document.getElementById('add-inv-name').value,
        result: document.getElementById('add-inv-result').value,
        status: document.getElementById('add-inv-status').value,
        date: document.getElementById('add-inv-date').value
      });
    } else if (boxType === 'allergies') {
      patient.allergies = document.getElementById('add-allergies-list').value;
      if (!patient.history) patient.history = {};
      patient.history.pastConditions = document.getElementById('add-history-conditions').value;
      patient.history.surgeries = document.getElementById('add-history-surgeries').value;
      patient.history.familyHistory = document.getElementById('add-history-family').value;
    }

    // Log key EMR actions to patient engagement timeline
    if (window.logPatientTimeline && patient.uhid) {
      if (boxType === 'vitals') {
        const bp = document.getElementById('add-vital-bp') ? document.getElementById('add-vital-bp').value : '';
        const hr = document.getElementById('add-vital-hr') ? document.getElementById('add-vital-hr').value : '';
        window.logPatientTimeline(patient.uhid, {
          type: 'clinical',
          icon: '🩺',
          title: 'Vitals Recorded',
          desc: `Vitals updated in EMR. BP: ${bp || 'N/A'}, HR: ${hr || 'N/A'} bpm.`
        });
      } else if (boxType === 'investigations') {
        const invName = document.getElementById('add-inv-name') ? document.getElementById('add-inv-name').value : 'Investigation';
        const invResult = document.getElementById('add-inv-result') ? document.getElementById('add-inv-result').value : '';
        window.logPatientTimeline(patient.uhid, {
          type: 'lab',
          icon: '🔬',
          title: 'Investigation Result Added',
          desc: `${invName} result recorded in EMR: ${invResult || 'Pending'}.`
        });
      } else if (boxType === 'reports') {
        const rptName = document.getElementById('add-report-name') ? document.getElementById('add-report-name').value : 'Report';
        window.logPatientTimeline(patient.uhid, {
          type: 'clinical',
          icon: '📄',
          title: 'Medical Report Updated',
          desc: `${rptName} report updated in EMR.`
        });
      }
    }

    // Save state back to localStorage
    if (window.saveStateToLocalStorage) {
      window.saveStateToLocalStorage();
    }

    window.closeEmrAddDataModal();

    
    // Rerender EMR view
    const emrContainer = document.getElementById('emrView');
    if (emrContainer && views.emr) {
      views.emr(emrContainer, null, { uhid: patient.uhid });
    } else {
      router.handleRouting();
    }
  };

  window.toggleConsultationStackedItem = function(term, activeKey) {
    const list = window.activeConsultation[activeKey];
    const idx = list.indexOf(term);
    if (idx > -1) {
      list.splice(idx, 1);
    } else {
      list.push(term);
    }
    // Refresh to update dependency filtering
    views.emr(emrContainer, null, { uhid: patient.uhid });
  };

  window.toggleConsultationCheckbox = function(element, value) {
    const selectedList = window.activeConsultation.instructions;
    const index = selectedList.indexOf(value);
    if (element.checked) {
      if (index === -1) selectedList.push(value);
    } else {
      if (index > -1) selectedList.splice(index, 1);
    }
    // Refresh
    views.emr(emrContainer, null, { uhid: patient.uhid });
  };

  window.toggleConsultationPill = function(element, activeKey, value) {
    const list = window.activeConsultation[activeKey];
    const idx = list.indexOf(value);
    if (idx > -1) {
      list.splice(idx, 1);
    } else {
      list.push(value);
    }
    // Refresh
    views.emr(emrContainer, null, { uhid: patient.uhid });
  };

  window.getAlternativeMedicines = function(medName) {
    if (!window.medicationCatalog) return [];
    const currentMed = window.medicationCatalog.find(m => m.brandName === medName);
    if (!currentMed) return [];
    
    // Find in-stock medicines with the same generic name
    const generic = currentMed.genericName;
    if (!generic) return [];
    
    return window.medicationCatalog
      .filter(m => m.brandName !== medName && m.genericName === generic && m.stock > 0)
      .map(m => m.brandName);
  };

  window.showSubstitutionModal = function(medName, altMedsStr, activeKey) {
    let modal = document.getElementById('medicine-substitution-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'medicine-substitution-modal';
      modal.className = 'modal-overlay';
      document.body.appendChild(modal);
    }
    
    const altMeds = altMedsStr ? altMedsStr.split('|').filter(Boolean) : [];
    const hasAlternatives = altMeds.length > 0;
    
    let alternativesHTML = '';
    if (hasAlternatives) {
      alternativesHTML = `
        <div style="background: #e6f4ea; color: #137333; padding: 0.75rem; border-radius: 6px; border: 1px solid #ceead6; line-height: 1.4; display: flex; flex-direction: column; gap: 0.5rem;">
          <strong>Suggested In-Stock Alternatives (Same Generic Formula):</strong>
          <div style="display: flex; flex-direction: column; gap: 0.4rem; margin-top: 0.25rem;">
            ${altMeds.map(alt => `
              <button class="btn" onclick="window.confirmSubstitution('${alt.replace(/'/g, "\\'")}', '${activeKey}')" style="text-align: left; width: 100%; padding: 0.5rem 0.75rem; border-radius: 4px; background: #059669; color: #fff; border: none; cursor: pointer; font-weight: 600; font-size: 0.8rem; display: flex; justify-content: space-between; align-items: center; transition: background 0.2s;">
                <span>Prescribe ${alt}</span>
                <span>➜</span>
              </button>
            `).join('')}
          </div>
        </div>
      `;
    } else {
      alternativesHTML = `
        <p style="margin: 0; background: #fce8e6; color: #c5221f; padding: 0.75rem; border-radius: 6px; border: 1px solid #fad2cf; line-height: 1.4;">
          No direct generic alternative is currently in stock. Please select another formulation.
        </p>
      `;
    }
    
    modal.innerHTML = `
      <div class="modal-box" style="max-width: 450px; border-radius: 8px; box-shadow: var(--shadow-lg); border: 1px solid var(--border-color); background: var(--bg-surface); overflow: hidden;">
        <div class="modal-header" style="background-color: var(--bg-surface-elevated); border-bottom: 1px solid var(--border-color); padding: 1rem; display: flex; justify-content: space-between; align-items: center;">
          <h4 class="modal-title" style="margin: 0; font-weight: 700; color: var(--text-primary); font-size: 0.95rem; display: flex; align-items: center; gap: 0.35rem;">⚠️ Medication Unavailable</h4>
          <span class="modal-close" style="cursor: pointer; font-size: 1.5rem; line-height: 1; color: var(--text-muted);" onclick="window.closeSubstitutionModal()">&times;</span>
        </div>
        <div class="modal-body" style="padding: 1.5rem; font-size: 0.85rem; color: var(--text-primary); display: flex; flex-direction: column; gap: 1rem;">
          <p style="margin: 0;"><strong>${medName}</strong> is currently <span style="color: #ef4444; font-weight: 700;">Out of Stock</span>.</p>
          <div style="background:#fef3c7; color:#d97706; padding:0.75rem; border-radius:6px; border:1px solid #fde68a; line-height:1.4; margin-bottom:0.5rem; font-size:0.75rem;">
            <strong>⚠ ${medName} not in ward sub-store.</strong><br>
            Available in pharmacy: Yes (12 vials) &middot; <a href="javascript:void(0)" onclick="window.closeSubstitutionModal(); window.showStockRequestOverlay({dept: (window.state.patients.find(p=>p.uhid==='${patient.uhid}')?.bed||'').includes('GW') ? 'General Ward' : 'ICU', urgency:'Urgent', prefillItem:{name:'${medName}', qty:12}, patientUhid:'${patient.uhid}'})" style="color:#2563eb; font-weight:700; text-decoration:underline;">[Request from Pharmacy]</a><br>
            Available in main store: Yes (48 vials) &middot; <a href="javascript:void(0)" onclick="window.closeSubstitutionModal(); window.showStockRequestOverlay({dept: (window.state.patients.find(p=>p.uhid==='${patient.uhid}')?.bed||'').includes('GW') ? 'General Ward' : 'ICU', urgency:'Urgent', prefillItem:{name:'${medName}', qty:48}, patientUhid:'${patient.uhid}'})" style="color:#2563eb; font-weight:700; text-decoration:underline;">[Request from Store]</a>
          </div>
          ${alternativesHTML}
          <div style="display: flex; justify-content: flex-end; margin-top: 0.5rem;">
            <button class="btn btn-secondary" onclick="window.closeSubstitutionModal()" style="height: 34px; font-size: 0.8rem; padding: 0 1rem; border-radius: 4px; border: 1px solid var(--border-color); background: var(--bg-surface-elevated); color: var(--text-primary); cursor: pointer; font-weight: 600;">Cancel</button>
          </div>
        </div>
      </div>
    `;
    
    modal.classList.add('active');
    modal.style.display = 'flex';
  };

  window.closeSubstitutionModal = function() {
    const modal = document.getElementById('medicine-substitution-modal');
    if (modal) {
      modal.classList.remove('active');
      modal.style.display = 'none';
    }
  };

  window.confirmSubstitution = function(altMed, activeKey) {
    window.closeSubstitutionModal();
    window.toggleConsultationStackedItem(altMed, activeKey);
  };

  window.getSectionItemsHTML = function(sectionKey) {
    const activeSpec = window.activeConsultation.specialty || "Gynecology & Obs";
    const specData = window.specialtyData[activeSpec] || window.specialtyData["Gynecology & Obs"];
    const queries = window.consultationSectionQueries || {};
    const query = (queries[sectionKey] || "").toLowerCase().trim();

    let items = [];
    let isCheckbox = false;

    if (sectionKey === 'symptoms') {
      items = specData.symptoms;
    } else if (sectionKey === 'findings') {
      items = specData.findings;
    } else if (sectionKey === 'diagnoses') {
      items = specData.diagnoses;
    } else if (sectionKey === 'medicines') {
      items = (window.medicationCatalog || []).map((med, index) => ({ rank: index + 1, term: med.brandName, outOfStock: med.stock === 0 }));
    } else if (sectionKey === 'investigations') {
      items = specData.investigations;
    } else if (sectionKey === 'procedures') {
      items = specData.procedures;
    } else if (sectionKey === 'instructions') {
      isCheckbox = true;
      items = [
        "Rest well — avoid overexertion for at least 2-3 days.",
        "Eat light food — soups, fruits, and easy-to-digest meals.",
        "Drink plenty of fluids — warm water, herbal tea, and clear soups.",
        "Steam inhalation — 2-3 times a day to ease congestion.",
        "Avoid cold drinks and ice cream."
      ].map((instr, idx) => ({ rank: idx + 1, term: instr }));
    }

    // Apply dependency filtration ONLY if there is NO active local search query
    if (sectionKey === 'diagnoses') {
      if (!query && window.activeConsultation.symptoms && window.activeConsultation.symptoms.length > 0) {
        const selectedRanks = specData.symptoms
          .filter(s => window.activeConsultation.symptoms.includes(s.term))
          .map(s => s.rank);
        items = items.filter(d => selectedRanks.includes(d.rank));
      }
    } else if (sectionKey === 'medicines' || sectionKey === 'investigations' || sectionKey === 'procedures') {
      if (!query && window.activeConsultation.diagnostics && window.activeConsultation.diagnostics.length > 0) {
        const selectedRanks = specData.diagnoses
          .filter(d => window.activeConsultation.diagnostics.includes(d.term))
          .map(d => d.rank);
        items = items.filter(item => selectedRanks.includes(item.rank));
      }
    }

    // Search query filtration
    if (query) {
      items = items.filter(item => item.term.toLowerCase().includes(query));
    }

    if (items.length === 0) {
      return `<div style="padding: 1rem; text-align: center; color: var(--text-muted); font-size: 0.85rem; width: 100%;">No items found.</div>`;
    }

    if (isCheckbox) {
      return items.map(item => {
        const isChecked = window.activeConsultation.instructions.includes(item.term);
        return `
          <label class="instruction-item" data-value="${item.term}" style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.25rem; font-weight: normal; cursor: pointer;">
            <input type="checkbox" ${isChecked ? 'checked' : ''} onchange="window.toggleConsultationCheckbox(this, '${item.term.replace(/'/g, "\\'")}')" style="cursor: pointer; width: 16px; height: 16px;">
            <span style="font-size: 0.85rem; color: var(--text-primary);">${item.term}</span>
          </label>
        `;
      }).join('');
    }

    const keyMap = {
      'symptoms': 'symptoms',
      'findings': 'findings',
      'diagnoses': 'diagnostics',
      'medicines': 'medicines',
      'investigations': 'investigations',
      'procedures': 'procedures'
    };
    const activeKey = keyMap[sectionKey];

    return items.map(item => {
      const isSelected = window.activeConsultation[activeKey].includes(item.term);
      const isOOS = sectionKey === 'medicines' && item.outOfStock;
      
      let bg = isSelected ? '#4a1d1d' : '#fff';
      let color = isSelected ? '#fff' : '#374151';
      let border = isSelected ? '1px solid #4a1d1d' : '1px solid #d1d5db';
      
      if (isOOS) {
        bg = '#f3f4f6';
        color = '#9ca3af';
        border = '1px dashed #d1d5db';
      }

      let displayContent = isSelected ? `${item.term} <span style="margin-left: 0.25rem; font-weight: bold; font-size: 0.85rem; line-height: 1;">&times;</span>` : item.term;
      let altMedsStr = '';
      if (isOOS) {
        const altMedsList = window.getAlternativeMedicines ? window.getAlternativeMedicines(item.term) : [];
        altMedsStr = altMedsList.join('|');
        displayContent = `${item.term} <span style="font-size: 0.65rem; color: #ef4444; background: #fee2e2; padding: 0.05rem 0.3rem; border-radius: 4px; font-weight: 700; margin-left: 0.25rem; border: 1px solid #fca5a5; display: inline-flex; align-items: center;">OOS</span>`;
      }

      return `
        <div class="consultation-pill ${isSelected ? 'selected' : ''} ${isOOS ? 'out-of-stock' : ''}" 
             ${isOOS ? `onclick="window.showSubstitutionModal('${item.term.replace(/'/g, "\\'")}', '${altMedsStr.replace(/'/g, "\\'")}', '${activeKey}')"` : `onclick="window.toggleConsultationStackedItem('${item.term.replace(/'/g, "\\'")}', '${activeKey}')"`}
             style="background-color: ${bg}; color: ${color}; border: ${border}; padding: 0.35rem 0.75rem; border-radius: 20px; font-size: 0.8rem; display: flex; align-items: center; gap: 0.35rem; cursor: pointer; transition: all 0.15s ease; user-select: none; opacity: ${isOOS ? '0.75' : '1'};"
             title="${isOOS ? 'Click to view alternate medication recommendations.' : ''}">
          ${displayContent}
        </div>
      `;
    }).join('');
  };

  window.renderConsultationSectionCard = function(title, sectionKey) {
    const queries = window.consultationSectionQueries || {};
    const query = queries[sectionKey] || "";
    const badgeKeyMap = {
      'symptoms': 'symptoms',
      'findings': 'findings',
      'diagnoses': 'diagnostics',
      'medicines': 'medicines',
      'investigations': 'investigations',
      'procedures': 'procedures',
      'instructions': 'instructions'
    };
    const count = window.activeConsultation[badgeKeyMap[sectionKey]]?.length || 0;
    const badge = count > 0 ? `<span style="background: #2563eb; color: #fff; border-radius: 50%; min-width: 18px; height: 18px; padding: 0 4px; display: inline-flex; align-items: center; justify-content: center; font-size: 0.65rem; font-weight: bold; margin-left: 0.5rem; line-height: 1;">${count}</span>` : '';

    return `
      <div class="card" id="consultation-card-${sectionKey}" style="box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.02); border-radius: 8px; border: 1px solid var(--border-color); background: var(--bg-surface);">
        <div class="card-header" style="display: flex; justify-content: space-between; align-items: center; padding: 0.75rem 1.25rem; border-bottom: 1px solid var(--border-color); background-color: var(--bg-surface);">
          <h3 style="margin: 0; font-size: 0.95rem; font-weight: 600; color: var(--text-primary); display: flex; align-items: center;">
            ${title} ${badge}
          </h3>
          <button class="btn btn-secondary btn-sm" onclick="window.toggleConsultationCardBody(this)" style="padding: 0.25rem 0.5rem; height: 28px; display: flex; align-items: center; justify-content: center; cursor: pointer; border-radius: 4px; border: 1px solid var(--border-color); background: var(--bg-surface-elevated);">
            <span style="font-size: 0.7rem; color: var(--text-muted);">▼</span>
          </button>
        </div>
        <div class="card-body consultation-card-body" style="padding: 1.25rem; display: flex; flex-direction: column; gap: 0.75rem;">
          <!-- Local search input -->
          <div style="position: relative;">
            <span style="position: absolute; left: 8px; top: 50%; transform: translateY(-50%); font-size: 0.75rem; color: var(--text-muted);">🔍</span>
            <input type="text" placeholder="Search ${title}..." value="${query}" oninput="window.filterConsultationSection('${sectionKey}', this.value)" style="padding-left: 1.8rem; font-size: 0.8rem; height: 32px; border-radius: 4px; border: 1px solid var(--border-color); width: 100%; background: var(--bg-surface-elevated); color: var(--text-primary);">
          </div>
          <!-- Selection list/grid -->
          <div class="${sectionKey === 'instructions' ? 'checkboxes-list' : 'pills-grid'}" style="display: flex; ${sectionKey === 'instructions' ? 'flex-direction: column; gap: 0.4rem;' : 'flex-wrap: wrap; gap: 0.5rem;'} max-height: 200px; overflow-y: auto; padding: 0.25rem 0;">
            ${window.getSectionItemsHTML ? window.getSectionItemsHTML(sectionKey) : ''}
          </div>
        </div>
      </div>
    `;
  };

  window.switchSymptomsFindingsTab = function(tabName) {
    window.activeSymptomsFindingsTab = tabName;
    views.emr(emrContainer, null, { uhid: patient.uhid });
  };

  window.renderSymptomsFindingsCard = function() {
    // Delegates to _buildHTML (defined below). Used by switchSymptomsFindingsTab re-renders.
    if (window.renderSymptomsFindingsCard._buildHTML) {
      return window.renderSymptomsFindingsCard._buildHTML();
    }
    return '';
  };

  window.renderSymptomsFindingsCard._buildHTML = function() {
    window.activeSymptomsFindingsTab = window.activeSymptomsFindingsTab || 'symptoms';
    const queries = window.consultationSectionQueries || {};
    const query = queries[window.activeSymptomsFindingsTab] || "";
    const symCount = window.activeConsultation.symptoms.length;
    const findCount = window.activeConsultation.findings.length;
    const symBadge = symCount > 0 ? `<span style="background: #2563eb; color: #fff; border-radius: 50%; width: 15px; height: 15px; display: inline-flex; align-items: center; justify-content: center; font-size: 0.6rem; font-weight: bold; margin-left: 0.25rem;">${symCount}</span>` : '';
    const findBadge = findCount > 0 ? `<span style="background: #059669; color: #fff; border-radius: 50%; width: 15px; height: 15px; display: inline-flex; align-items: center; justify-content: center; font-size: 0.6rem; font-weight: bold; margin-left: 0.25rem;">${findCount}</span>` : '';

    return `
      <div class="card" id="consultation-card-symptoms-findings" style="box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.02); border-radius: 8px; border: 1px solid var(--border-color); background: var(--bg-surface);">
        <div class="card-header" style="display: flex; justify-content: space-between; align-items: center; padding: 0.5rem 1.25rem; border-bottom: 1px solid var(--border-color); background-color: var(--bg-surface);">
          <div style="display: flex; gap: 0.5rem;">
            <button onclick="window.switchSymptomsFindingsTab('symptoms')" style="background: transparent; border: none; padding: 0.5rem 0.75rem; font-size: 0.9rem; font-weight: ${window.activeSymptomsFindingsTab === 'symptoms' ? '700' : '500'}; cursor: pointer; color: ${window.activeSymptomsFindingsTab === 'symptoms' ? '#2563eb' : 'var(--text-secondary)'}; border-bottom: 2px solid ${window.activeSymptomsFindingsTab === 'symptoms' ? '#2563eb' : 'transparent'}; transition: all 0.2s ease; outline: none; display: flex; align-items: center;">
              Symptoms ${symBadge}
            </button>
            <button onclick="window.switchSymptomsFindingsTab('findings')" style="background: transparent; border: none; padding: 0.5rem 0.75rem; font-size: 0.9rem; font-weight: ${window.activeSymptomsFindingsTab === 'findings' ? '700' : '500'}; cursor: pointer; color: ${window.activeSymptomsFindingsTab === 'findings' ? '#2563eb' : 'var(--text-secondary)'}; border-bottom: 2px solid ${window.activeSymptomsFindingsTab === 'findings' ? '#2563eb' : 'transparent'}; transition: all 0.2s ease; outline: none; display: flex; align-items: center;">
              Findings ${findBadge}
            </button>
          </div>
          <button class="btn btn-secondary btn-sm" onclick="window.toggleConsultationCardBody(this)" style="padding: 0.25rem 0.5rem; height: 28px; display: flex; align-items: center; justify-content: center; cursor: pointer; border-radius: 4px; border: 1px solid var(--border-color); background: var(--bg-surface-elevated);">
            <span style="font-size: 0.7rem; color: var(--text-muted);">▼</span>
          </button>
        </div>
        <div class="card-body consultation-card-body" style="padding: 1.25rem; display: flex; flex-direction: column; gap: 0.75rem;">
          <!-- Local search input -->
          <div style="position: relative;">
            <span style="position: absolute; left: 8px; top: 50%; transform: translateY(-50%); font-size: 0.75rem; color: var(--text-muted);">🔍</span>
            <input type="text" placeholder="Search ${window.activeSymptomsFindingsTab === 'symptoms' ? 'Symptoms' : 'Findings'}..." value="${query}" oninput="window.filterConsultationSection(window.activeSymptomsFindingsTab, this.value)" style="padding-left: 1.8rem; font-size: 0.8rem; height: 32px; border-radius: 4px; border: 1px solid var(--border-color); width: 100%; background: var(--bg-surface-elevated); color: var(--text-primary);">
          </div>
          <!-- Selection list/grid -->
          <div class="pills-grid" style="display: flex; flex-wrap: wrap; gap: 0.5rem; max-height: 200px; overflow-y: auto; padding: 0.25rem 0;">
            ${window.getSectionItemsHTML ? window.getSectionItemsHTML(window.activeSymptomsFindingsTab) : ''}
          </div>
        </div>
      </div>
    `;
  };

  // Post-render injection: fill placeholder with all consultation section cards
  // (must run after renderConsultationSectionCard and renderSymptomsFindingsCard are both defined)
  if (window.activeConsultationStarted) {
    const _ph = document.getElementById('consultation-sections-placeholder');
    if (_ph) {
      _ph.innerHTML = [
        window.renderSymptomsFindingsCard._buildHTML(),
        window.renderConsultationSectionCard('Diagnosis', 'diagnoses'),
        window.renderConsultationSectionCard('Medicines', 'medicines'),
        window.renderConsultationSectionCard('Investigations', 'investigations'),
        window.renderConsultationSectionCard('Procedures', 'procedures'),
        window.renderConsultationSectionCard('Instructions', 'instructions')
      ].join('');
    }
  }

  window.toggleConsultationCardBody = function(btn) {
    const card = btn.closest('.card');
    const body = card.querySelector('.consultation-card-body');
    const chevron = btn.querySelector('span');
    if (body.style.display === 'none') {
      body.style.display = 'block';
      chevron.innerText = '▼';
    } else {
      body.style.display = 'none';
      chevron.innerText = '▲';
    }
  };

  window.previewConsultation = function(uhid) {
    const patient = state.patients.find(p => p.uhid === uhid);
    if (!patient) return;
    
    let modal = document.getElementById('consultation-preview-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'consultation-preview-modal';
      modal.className = 'modal-overlay';
      document.body.appendChild(modal);
    }

    const symptomsStr = window.activeConsultation.symptoms.join(', ') || 'None';
    const findingsStr = window.activeConsultation.findings.join(', ') || 'None';
    const diagnosesStr = window.activeConsultation.diagnostics.join(', ') || 'None';
    const labsStr = window.activeConsultation.investigations.join(', ') || 'None';
    const proceduresStr = window.activeConsultation.procedures.join(', ') || 'None';

    const rxRows = window.activeConsultation.medicines.map((med, idx) => `
      <tr style="border-bottom: 1px solid var(--border-color);">
        <td style="padding: 0.5rem; font-weight: 600;">${idx + 1}. ${med}</td>
        <td style="padding: 0.5rem;">500 mg</td>
        <td style="padding: 0.5rem;">Oral</td>
        <td style="padding: 0.5rem;">TDS</td>
        <td style="padding: 0.5rem;">3 Days</td>
        <td style="padding: 0.5rem; color: var(--text-secondary);">Post Meal</td>
      </tr>
    `).join('') || '<tr><td colspan="6" style="padding: 1rem; text-align: center; color: var(--text-muted);">No medications prescribed.</td></tr>';

    const instructionsListHTML = window.activeConsultation.instructions.map(inst => `
      <li style="margin-bottom: 0.25rem;">${inst}</li>
    `).join('') || '<li style="color: var(--text-muted);">No specific instructions.</li>';

    modal.innerHTML = `
      <div class="modal-box" style="max-width: 800px; border-radius: 8px; box-shadow: var(--shadow-lg);">
        <div class="modal-header" style="background-color: var(--bg-surface-elevated); border-bottom: 1px solid var(--border-color); padding: 1rem; display: flex; justify-content: space-between; align-items: center;">
          <h4 style="margin: 0; font-weight: 700; color: var(--text-primary);">Clinical Summary Preview</h4>
          <span onclick="window.closeConsultationPreview()" style="cursor: pointer; font-size: 1.5rem; line-height: 1;">&times;</span>
        </div>
        <div class="modal-body" style="padding: 1.5rem; font-size: 0.85rem; max-height: 70vh; overflow-y: auto;">
          
          <div style="text-align: center; border-bottom: 2px solid var(--primary); padding-bottom: 0.75rem; margin-bottom: 1rem;">
            <h2 style="margin: 0; color: var(--primary); font-size: 1.4rem;">SARONIL HOSPITAL & RESEARCH CENTRE</h2>
            <p style="margin: 0.25rem 0; color: var(--text-secondary); font-size: 0.8rem;">OPD Consultation Summary</p>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; background-color: var(--bg-surface-elevated); padding: 0.75rem; border-radius: 6px; margin-bottom: 1.25rem; border: 1px solid var(--border-color);">
            <div>
              <strong>Patient Name:</strong> ${patient.name}<br>
              <strong>UHID:</strong> ${patient.uhid} | <strong>ABHA ID:</strong> ${patient.abhaId || 'N/A'}<br>
              <strong>Age / Gender:</strong> ${patient.age} Yrs / ${patient.gender}
            </div>
            <div>
              <strong>Date:</strong> ${new Date().toLocaleDateString()}<br>
              <strong>Consultant:</strong> ${patient.primaryConsultant || 'Dr. Abhishek Kumar'}<br>
              <strong>Department:</strong> ${patient.department || 'Cardiology'}
            </div>
          </div>

          <div style="display: flex; flex-direction: column; gap: 1rem;">
            <div>
              <strong style="color: var(--primary); display: block; border-bottom: 1px solid var(--border-color); padding-bottom: 0.25rem; margin-bottom: 0.35rem;">Chief Symptoms</strong>
              <p style="margin: 0; color: var(--text-primary);">${symptomsStr}</p>
            </div>
            
            <div>
              <strong style="color: var(--primary); display: block; border-bottom: 1px solid var(--border-color); padding-bottom: 0.25rem; margin-bottom: 0.35rem;">Clinical Findings</strong>
              <p style="margin: 0; color: var(--text-primary);">${findingsStr}</p>
            </div>

            <div>
              <strong style="color: var(--primary); display: block; border-bottom: 1px solid var(--border-color); padding-bottom: 0.25rem; margin-bottom: 0.35rem;">Diagnosis / Assessment</strong>
              <p style="margin: 0; color: var(--text-primary);">${diagnosesStr}</p>
            </div>

            <div>
              <strong style="color: var(--primary); display: block; border-bottom: 1px solid var(--border-color); padding-bottom: 0.25rem; margin-bottom: 0.35rem;">Prescribed Medications</strong>
              <table style="width: 100%; border-collapse: collapse; margin-top: 0.35rem;">
                <thead>
                  <tr style="background-color: var(--bg-surface-elevated); border-bottom: 1px solid var(--border-color); text-align: left; font-weight: 600;">
                    <th style="padding: 0.5rem;">Medication</th>
                    <th style="padding: 0.5rem;">Dose</th>
                    <th style="padding: 0.5rem;">Route</th>
                    <th style="padding: 0.5rem;">Freq</th>
                    <th style="padding: 0.5rem;">Duration</th>
                    <th style="padding: 0.5rem;">Instructions</th>
                  </tr>
                </thead>
                <tbody>
                  ${rxRows}
                </tbody>
              </table>
            </div>

            <div>
              <strong style="color: var(--primary); display: block; border-bottom: 1px solid var(--border-color); padding-bottom: 0.25rem; margin-bottom: 0.35rem;">Lab Investigations Ordered</strong>
              <p style="margin: 0; color: var(--text-primary);">${labsStr}</p>
            </div>

            <div>
              <strong style="color: var(--primary); display: block; border-bottom: 1px solid var(--border-color); padding-bottom: 0.25rem; margin-bottom: 0.35rem;">Procedures Ordered / Performed</strong>
              <p style="margin: 0; color: var(--text-primary);">${proceduresStr}</p>
            </div>

            <div>
              <strong style="color: var(--primary); display: block; border-bottom: 1px solid var(--border-color); padding-bottom: 0.25rem; margin-bottom: 0.35rem;">Advice / Instructions</strong>
              <ul style="margin: 0; padding-left: 1.25rem; color: var(--text-primary);">
                ${instructionsListHTML}
              </ul>
            </div>
          </div>

          <div style="display: flex; justify-content: flex-end; gap: 0.5rem; border-top: 1px solid var(--border-color); padding-top: 1rem; margin-top: 1.5rem;">
            <button class="btn btn-secondary" onclick="window.closeConsultationPreview()">Close</button>
            <button class="btn btn-primary" onclick="window.printConsultation('${patient.uhid}'); window.closeConsultationPreview();">Print Summary</button>
          </div>
        </div>
      </div>
    `;
    modal.classList.add('active');
    modal.style.display = 'flex';
  };

  window.closeConsultationPreview = function() {
    const modal = document.getElementById('consultation-preview-modal');
    if (modal) {
      modal.classList.remove('active');
      modal.style.display = 'none';
    }
  };

  window.printConsultation = function(uhid) {
    const patient = state.patients.find(p => p.uhid === uhid);
    if (!patient) return;

    const printWindow = window.open('', '_blank', 'width=800,height=900');

    const symptomsStr = window.activeConsultation.symptoms.join(', ') || 'None';
    const findingsStr = window.activeConsultation.findings.join(', ') || 'None';
    const diagnosesStr = window.activeConsultation.diagnostics.join(', ') || 'None';
    const labsStr = window.activeConsultation.investigations.join(', ') || 'None';
    const proceduresStr = window.activeConsultation.procedures.join(', ') || 'None';

    let rxRows = '';
    window.activeConsultation.medicines.forEach((med, idx) => {
      rxRows += '<tr style="border-bottom: 1px solid #eee;">' +
        '<td style="padding: 0.5rem; font-weight: bold;">' + (idx + 1) + '. ' + med + '</td>' +
        '<td style="padding: 0.5rem;">500 mg</td>' +
        '<td style="padding: 0.5rem;">Oral</td>' +
        '<td style="padding: 0.5rem;">TDS</td>' +
        '<td style="padding: 0.5rem;">3 Days</td>' +
        '<td style="padding: 0.5rem; color: #555;">Post Meal</td>' +
        '</tr>';
    });

    if (window.activeConsultation.medicines.length === 0) {
      rxRows = '<tr><td colspan="6" style="padding: 1rem; text-align: center; color: #777;">No medications prescribed.</td></tr>';
    }

    let instructionsHTML = '';
    window.activeConsultation.instructions.forEach(inst => {
      instructionsHTML += '<li style="margin-bottom: 0.25rem;">' + inst + '</li>';
    });
    if (window.activeConsultation.instructions.length === 0) {
      instructionsHTML = '<li style="color: #777;">No specific instructions.</li>';
    }

    const abha = patient.abhaId || 'N/A';
    const consultant = patient.primaryConsultant || (window.state && window.state.activeDoctor) || 'Dr. Abhishek Kumar';
    const dept = patient.department || 'Cardiology';

    printWindow.document.write(
      '<html>' +
      '<head>' +
      '  <title>Consultation Summary - ' + patient.name + '</title>' +
      '  <style>' +
      '    body { font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif; padding: 2rem; color: #333; line-height: 1.4; }' +
      '    .header { text-align: center; border-bottom: 2px solid #005f87; padding-bottom: 1rem; margin-bottom: 1.5rem; }' +
      '    .header h1 { margin: 0; color: #005f87; font-size: 24px; }' +
      '    .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 2rem; background: #f9f9f9; padding: 1rem; border-radius: 6px; }' +
      '    .section-title { color: #005f87; border-bottom: 1px solid #ccc; padding-bottom: 0.25rem; margin-top: 1.5rem; margin-bottom: 0.5rem; font-size: 16px; font-weight: bold; }' +
      '    table { width: 100%; border-collapse: collapse; margin-top: 0.5rem; }' +
      '    th { border-bottom: 2px solid #ccc; padding: 0.5rem; text-align: left; font-size: 12px; color: #555; }' +
      '    td { padding: 0.5rem; border-bottom: 1px solid #eee; font-size: 13px; }' +
      '    .footer { margin-top: 4rem; text-align: right; border-top: 1px solid #eee; padding-top: 1rem; }' +
      '  </style>' +
      '</head>' +
      '<body>' +
      '  <div class="header">' +
      '    <h1>SARONIL HOSPITAL & RESEARCH CENTRE</h1>' +
      '    <p style="margin: 0.25rem 0; color: #666;">OPD Consultation & Prescription Slip</p>' +
      '  </div>' +
      '  <div class="meta-grid">' +
      '    <div>' +
      '      <strong>Patient Name:</strong> ' + patient.name + '<br>' +
      '      <strong>UHID:</strong> ' + patient.uhid + ' | <strong>ABHA ID:</strong> ' + abha + '<br>' +
      '      <strong>Age / Gender:</strong> ' + patient.age + ' Yrs / ' + patient.gender + '' +
      '    </div>' +
      '    <div>' +
      '      <strong>Date:</strong> ' + new Date().toLocaleDateString() + '<br>' +
      '      <strong>Primary Consultant:</strong> ' + consultant + '<br>' +
      '      <strong>Department:</strong> ' + dept + '' +
      '    </div>' +
      '  </div>' +
      '  ' +
      '  <div class="section-title">Chief Symptoms</div>' +
      '  <p style="margin: 0; font-size: 13px;">' + symptomsStr + '</p>' +
      '  ' +
      '  <div class="section-title">Clinical Findings</div>' +
      '  <p style="margin: 0; font-size: 13px;">' + findingsStr + '</p>' +
      '  ' +
      '  <div class="section-title">Diagnosis</div>' +
      '  <p style="margin: 0; font-size: 13px;">' + diagnosesStr + '</p>' +
      '  ' +
      '  <div class="section-title">Rx (Medications)</div>' +
      '  <table>' +
      '    <thead>' +
      '      <tr>' +
      '        <th>Medication Name</th>' +
      '        <th>Dosage</th>' +
      '        <th>Route</th>' +
      '        <th>Frequency</th>' +
      '        <th>Duration</th>' +
      '        <th>Instructions</th>' +
      '      </tr>' +
      '    </thead>' +
      '    <tbody>' +
      '      ' + rxRows +
      '    </tbody>' +
      '  </table>' +
      '  ' +
      '  <div class="section-title">Lab Investigations Ordered</div>' +
      '  <p style="margin: 0; font-size: 13px;">' + labsStr + '</p>' +
      '  ' +
      '  <div class="section-title">Procedures Ordered / Performed</div>' +
      '  <p style="margin: 0; font-size: 13px;">' + proceduresStr + '</p>' +
      '  ' +
      '  <div class="section-title">Advice / Instructions</div>' +
      '  <ul style="margin: 0; padding-left: 1.25rem; font-size: 13px;">' +
      '    ' + instructionsHTML +
      '  </ul>' +
      '  ' +
      '  <div class="footer">' +
      '    <br><br>' +
      '    <p>___________________________</p>' +
      '    <p><strong>Authorized Clinician Signature</strong></p>' +
      '  </div>' +
      '  <script>' +
      '    window.onload = function() {' +
      '      window.print();' +
      '    }' +
      '  </script>' +
      '</body>' +
      '</html>'
    );
    printWindow.document.close();
  };

  window.saveConsultation = function(uhid) {
    const patient = state.patients.find(p => p.uhid === uhid);
    if (!patient) return;

    const ac = window.activeConsultation;
    const today = new Date();
    const dateStr = today.toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const rxId = 'RX-' + today.getFullYear() + today.getMonth() + today.getDate() + '-' + Math.floor(Math.random() * 9000 + 1000);
    const doctor = state.doctors ? state.doctors[0] : null;
    const doctorName = doctor ? `Dr. ${doctor.name}` : 'Dr. Attending Physician';
    const doctorDept = doctor ? (doctor.department || ac.specialty || 'General Medicine') : (ac.specialty || 'General Medicine');

    // Build medicines table rows
    const medsHTML = (ac.medicines && ac.medicines.length > 0)
      ? ac.medicines.map((med, i) => `
          <tr style="border-bottom: 1px solid #e5e7eb;">
            <td style="padding: 0.5rem 0.25rem; font-size: 0.82rem; color: #111827;">${i + 1}. ${med}</td>
            <td style="padding: 0.5rem 0.25rem; font-size: 0.82rem; color: #374151;">500 mg</td>
            <td style="padding: 0.5rem 0.25rem; font-size: 0.82rem; color: #374151;">Oral</td>
            <td style="padding: 0.5rem 0.25rem; font-size: 0.82rem; color: #374151;">TDS</td>
            <td style="padding: 0.5rem 0.25rem; font-size: 0.82rem; color: #374151;">5 Days</td>
            <td style="padding: 0.5rem 0.25rem; font-size: 0.82rem; color: #374151;">After meals</td>
          </tr>`)
        .join('')
      : `<tr><td colspan="6" style="padding: 0.75rem; font-size: 0.82rem; color: #9ca3af; text-align: center;">No medicines prescribed.</td></tr>`;

    const symptomsText = (ac.symptoms && ac.symptoms.length) ? ac.symptoms.join(', ') : '—';
    const findingsText = (ac.findings && ac.findings.length) ? ac.findings.join(', ') : '—';
    const diagnosisText = (ac.diagnostics && ac.diagnostics.length) ? ac.diagnostics.join(', ') : '—';
    const instructionsText = (ac.instructions && ac.instructions.length)
      ? ac.instructions.map((inst, i) => `<li style="margin-bottom:0.25rem;">${inst}</li>`).join('')
      : '<li style="color:#9ca3af;">No specific instructions.</li>';
    const investigationsText = (ac.investigations && ac.investigations.length) ? ac.investigations.join(', ') : '—';

    // Create or reuse modal
    let modal = document.getElementById('finish-consultation-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'finish-consultation-modal';
      modal.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;background:rgba(15,23,42,0.6);z-index:10000;display:flex;align-items:center;justify-content:center;padding:1rem;box-sizing:border-box;';
      document.body.appendChild(modal);
    }

    modal.innerHTML = `
      <div style="background:#fff;border-radius:14px;max-width:960px;width:100%;max-height:92vh;display:flex;flex-direction:column;box-shadow:0 25px 60px rgba(0,0,0,0.3);overflow:hidden;" onclick="event.stopPropagation()">
        <!-- Modal Header -->
        <div style="display:flex;justify-content:space-between;align-items:center;padding:1rem 1.5rem;border-bottom:1px solid #e5e7eb;background:#f9fafb;flex-shrink:0;">
          <h3 style="margin:0;font-size:1.05rem;font-weight:700;color:#111827;">🩺 Finish Consultation</h3>
          <button onclick="document.getElementById('finish-consultation-modal').style.display='none';" style="background:none;border:none;font-size:1.4rem;color:#6b7280;cursor:pointer;line-height:1;padding:0.25rem;">&times;</button>
        </div>

        <!-- Body: Left Actions + Right Prescription -->
        <div style="display:flex;flex:1;min-height:0;overflow:hidden;">

          <!-- Left: Actions Panel -->
          <div style="width:260px;flex-shrink:0;border-right:1px solid #e5e7eb;padding:1.5rem 1.25rem;display:flex;flex-direction:column;gap:1rem;background:#f9fafb;">
            <div>
              <p style="font-size:0.7rem;font-weight:700;color:#9ca3af;text-transform:uppercase;letter-spacing:0.06em;margin:0 0 0.75rem 0;">Actions</p>
              <div style="display:flex;flex-direction:column;gap:0.6rem;">
                <button onclick="window.sendPrescriptionToPatient('${uhid}','${rxId}')" style="padding:0.65rem 1rem;border-radius:8px;border:none;background:#4f46e5;color:#fff;font-weight:600;font-size:0.82rem;cursor:pointer;display:flex;align-items:center;gap:0.5rem;justify-content:center;">
                  🖨️ Send Prescription to Patient
                </button>
                <button onclick="window.printPrescription('${uhid}')" style="padding:0.65rem 1rem;border-radius:8px;border:1px solid #d1d5db;background:#fff;color:#374151;font-weight:600;font-size:0.82rem;cursor:pointer;display:flex;align-items:center;gap:0.5rem;justify-content:center;">
                  🖨️ Print Prescription
                </button>
              </div>
            </div>
            <div style="margin-top:auto;">
              <button id="confirm-finish-btn" onclick="window.confirmFinishConsultation('${uhid}','${rxId}')" style="width:100%;padding:0.75rem 1rem;border-radius:8px;border:none;background:#10b981;color:#fff;font-weight:700;font-size:0.9rem;cursor:pointer;display:flex;align-items:center;gap:0.5rem;justify-content:center;">
                ✅ Confirm Finish Consultation
              </button>
            </div>
          </div>

          <!-- Right: Prescription Preview -->
          <div style="flex:1;overflow-y:auto;padding:1.5rem;">
            <div style="border:1.5px solid #c7d2fe;border-radius:10px;padding:1.5rem;background:#fff;font-family:'Inter',sans-serif;">

              <!-- Hospital Header -->
              <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:1rem;">
                <div>
                  <div style="font-size:1.15rem;font-weight:800;color:#4f46e5;">Saronil Health Clinic</div>
                  <div style="font-size:0.82rem;font-weight:600;color:#374151;margin-top:0.1rem;">${doctorName}, MD ${doctorDept}</div>
                  <div style="font-size:0.75rem;color:#9ca3af;margin-top:0.1rem;">Reg No. MH-2019-4521 · Bengaluru</div>
                </div>
                <div style="text-align:right;">
                  <div style="font-size:0.72rem;color:#9ca3af;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;">Prescription Date</div>
                  <div style="font-size:0.9rem;font-weight:700;color:#111827;">${dateStr}</div>
                  <div style="font-size:0.72rem;color:#9ca3af;margin-top:0.15rem;">Rx ID: ${rxId}</div>
                </div>
              </div>
              <hr style="border:none;border-top:2px solid #4f46e5;margin-bottom:1rem;">

              <!-- Patient Details Row -->
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.5rem 1rem;margin-bottom:1.25rem;background:#f5f3ff;border-radius:6px;padding:0.85rem;">
                <div><span style="font-size:0.8rem;color:#6b7280;">Patient:</span> <strong style="font-size:0.85rem;color:#111827;">${patient.name}</strong></div>
                <div><span style="font-size:0.8rem;color:#6b7280;">Diagnosis:</span> <strong style="font-size:0.85rem;color:#111827;">${diagnosisText}</strong></div>
                <div><span style="font-size:0.8rem;color:#6b7280;">Age/Gender:</span> <span style="font-size:0.82rem;color:#374151;">${patient.age || '—'} yrs / ${patient.gender || '—'}</span></div>
                <div><span style="font-size:0.8rem;color:#6b7280;">UHID:</span> <span style="font-size:0.82rem;color:#374151;">${patient.uhid}</span></div>
              </div>

              <!-- Section 1: Clinical History -->
              <div style="margin-bottom:1.25rem;">
                <div style="font-size:0.78rem;font-weight:700;color:#4f46e5;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:0.6rem;border-bottom:1px solid #e0e7ff;padding-bottom:0.3rem;">1. Clinical History & Complaints</div>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.4rem 1.5rem;font-size:0.82rem;">
                  <div><strong>Chief Complaints:</strong> <span style="color:#374151;">${symptomsText}</span></div>
                  <div><strong>Examination Findings:</strong> <span style="color:#374151;">${findingsText}</span></div>
                </div>
              </div>

              <!-- Section 2: Investigations -->
              ${investigationsText !== '—' ? `
              <div style="margin-bottom:1.25rem;">
                <div style="font-size:0.78rem;font-weight:700;color:#4f46e5;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:0.6rem;border-bottom:1px solid #e0e7ff;padding-bottom:0.3rem;">2. Investigations Ordered</div>
                <p style="font-size:0.82rem;color:#374151;margin:0;">${investigationsText}</p>
              </div>` : ''}

              <!-- Section 3: Medicines -->
              <div style="margin-bottom:1.25rem;">
                <div style="font-size:0.78rem;font-weight:700;color:#4f46e5;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:0.6rem;border-bottom:1px solid #e0e7ff;padding-bottom:0.3rem;">3. Prescription (Rx)</div>
                <table style="width:100%;border-collapse:collapse;">
                  <thead>
                    <tr style="background:#ede9fe;">
                      <th style="padding:0.4rem 0.25rem;font-size:0.75rem;color:#5b21b6;text-align:left;font-weight:700;">Medicine</th>
                      <th style="padding:0.4rem 0.25rem;font-size:0.75rem;color:#5b21b6;text-align:left;font-weight:700;">Dose</th>
                      <th style="padding:0.4rem 0.25rem;font-size:0.75rem;color:#5b21b6;text-align:left;font-weight:700;">Route</th>
                      <th style="padding:0.4rem 0.25rem;font-size:0.75rem;color:#5b21b6;text-align:left;font-weight:700;">Frequency</th>
                      <th style="padding:0.4rem 0.25rem;font-size:0.75rem;color:#5b21b6;text-align:left;font-weight:700;">Duration</th>
                      <th style="padding:0.4rem 0.25rem;font-size:0.75rem;color:#5b21b6;text-align:left;font-weight:700;">Instruction</th>
                    </tr>
                  </thead>
                  <tbody>${medsHTML}</tbody>
                </table>
              </div>

              <!-- Section 4: Instructions -->
              <div style="margin-bottom:1rem;">
                <div style="font-size:0.78rem;font-weight:700;color:#4f46e5;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:0.6rem;border-bottom:1px solid #e0e7ff;padding-bottom:0.3rem;">4. Advice & Instructions</div>
                <ul style="margin:0;padding-left:1.25rem;font-size:0.82rem;color:#374151;line-height:1.7;">${instructionsText}</ul>
              </div>

              <!-- Signature -->
              <div style="margin-top:1.5rem;display:flex;justify-content:flex-end;">
                <div style="text-align:center;">
                  <div style="width:140px;border-top:1px solid #374151;padding-top:0.35rem;">
                    <div style="font-size:0.78rem;font-weight:700;color:#111827;">${doctorName}</div>
                    <div style="font-size:0.72rem;color:#9ca3af;">${doctorDept}</div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    `;

    modal.style.display = 'flex';
  };

  window.confirmFinishConsultation = function(uhid, rxId) {
    const patient = state.patients.find(p => p.uhid === uhid);
    if (!patient) return;

    const ac = window.activeConsultation;
    const today = new Date();
    const dateStr = today.toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const doctor = state.doctors ? state.doctors[0] : null;
    const doctorName = doctor ? `Dr. ${doctor.name}` : 'Dr. Attending Physician';

    // Save modular fields back to patient clinicalData
    patient.clinicalData = patient.clinicalData || {};
    patient.clinicalData.symptoms = ac.symptoms;
    patient.clinicalData.findings = ac.findings;
    patient.clinicalData.diagnosis = (ac.diagnostics && ac.diagnostics.join(', ')) || 'None';
    patient.clinicalData.treatmentPlan = (ac.instructions && ac.instructions.join('\n')) || '';
    patient.clinicalData.carePlan = patient.clinicalData.treatmentPlan;

    // Map selected medicines to patient.prescriptions
    patient.prescriptions = (ac.medicines || []).map(med => {
      const existing = (patient.prescriptions || []).find(p => (p.drug || p.name || '').toLowerCase() === med.toLowerCase());
      if (existing) return existing;
      return { drug: med, name: med, dose: '500 mg', route: 'Oral', freq: 'TDS', duration: '5 Days', instruction: 'After meals' };
    });

    // Attach prescription record to patient profile (prescriptionHistory)
    patient.prescriptionHistory = patient.prescriptionHistory || [];
    patient.prescriptionHistory.unshift({
      rxId: rxId,
      date: dateStr,
      doctor: doctorName,
      diagnosis: patient.clinicalData.diagnosis,
      medicines: [...(ac.medicines || [])],
      instructions: [...(ac.instructions || [])],
      investigations: [...(ac.investigations || [])],
      symptoms: [...(ac.symptoms || [])],
      findings: [...(ac.findings || [])],
    });

    // Add timeline event
    patient.timelineEvents = patient.timelineEvents || [];
    patient.timelineEvents.unshift({
      date: new Date().toISOString(),
      type: 'clinical',
      icon: '💊',
      title: 'Prescription Generated',
      desc: `Consultation finalized by ${doctorName}. Diagnosis: ${patient.clinicalData.diagnosis || 'General Checkup'}. Prescription #${rxId} generated with ${ac.medicines ? ac.medicines.length : 0} medications.`
    });

    // Push to pharmacy prescriptions queue
    window.state.prescriptionsQueue = window.state.prescriptionsQueue || [];
    window.state.prescriptionsQueue.unshift({
      rxId: rxId,
      patientName: patient.name,
      uhid: patient.uhid,
      ward: patient.currentWard || patient.ward || 'OPD',
      doctor: doctorName,
      date: dateStr,
      status: 'Pending',
      items: (ac.medicines || []).map(med => ({
        name: med, dose: '500 mg', route: 'Oral', freq: 'TDS', duration: '5 Days', qty: 15
      }))
    });

    patient.status = 'Completed';
    if (ac.ancData) patient.ancData = ac.ancData;

    // Close modal and reset consultation
    const modal = document.getElementById('finish-consultation-modal');
    if (modal) modal.style.display = 'none';

    window.activeConsultationStarted = false;
    if (typeof window.setDistractionFreeMode === 'function') window.setDistractionFreeMode(false);

    // Show brief success toast
    const toast = document.createElement('div');
    toast.style.cssText = 'position:fixed;bottom:2rem;right:2rem;background:#10b981;color:#fff;padding:0.85rem 1.5rem;border-radius:10px;font-weight:700;font-size:0.9rem;z-index:11000;box-shadow:0 8px 24px rgba(16,185,129,0.35);display:flex;align-items:center;gap:0.5rem;';
    toast.innerHTML = '✅ Consultation saved & prescription attached to patient profile!';
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3500);

    if (window.router) {
      window.router.navigate('emr');
    } else {
      window.history.back();
    }
  };

  window.sendPrescriptionToPatient = function(uhid, rxId) {
    const toast = document.createElement('div');
    toast.style.cssText = 'position:fixed;bottom:2rem;right:2rem;background:#4f46e5;color:#fff;padding:0.85rem 1.5rem;border-radius:10px;font-weight:700;font-size:0.9rem;z-index:11000;box-shadow:0 8px 24px rgba(79,70,229,0.35);display:flex;align-items:center;gap:0.5rem;';
    toast.innerHTML = '📨 Prescription sent to patient via SMS/Email!';
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  };

  window.printPrescription = function(uhid) {
    window.print();
  };


  // Initialize current prescribing mode if not set
  window.currentPrescribeMode = window.currentPrescribeMode || 'brand';

  // Render unified Advanced Prescription Workflow directly in the page
  const rxContainer = document.getElementById('emr-prescription-workflow-container');
  if (rxContainer) {
    setTimeout(() => {
      window.renderPrescriptionWorkflow(rxContainer, patient);
    }, 0);
  }
}


// Vitals logger
window.logNewVitals = function(uhid) {
  const patient = state.patients.find(p => p.uhid === uhid);
  if (patient) {
    const temp = document.getElementById('vit-temp').value;
    const hr = document.getElementById('vit-hr').value;
    const bp = document.getElementById('vit-bp').value.trim();
    const rr = document.getElementById('vit-rr').value;
    const spo2 = document.getElementById('vit-spo2').value;
    const weight = document.getElementById('vit-weight').value;
    const pain = document.getElementById('vit-pain').value;
    const sugar = document.getElementById('vit-sugar').value;
    const urine = document.getElementById('vit-urine').value;
    const oxygen = document.getElementById('vit-oxygen').value.trim();
    const notes = document.getElementById('vit-notes').value.trim();

    if (temp) patient.vitals.temp = parseFloat(temp);
    if (hr) patient.vitals.hr = parseInt(hr);
    if (bp) patient.vitals.bp = bp;
    if (rr) patient.vitals.rr = parseInt(rr);
    if (spo2) patient.vitals.spo2 = parseInt(spo2);
    if (weight) patient.vitals.weight = parseFloat(weight);
    if (pain) patient.vitals.pain = parseInt(pain);
    if (sugar) patient.vitals.sugar = parseInt(sugar);
    if (urine) patient.vitals.urine = parseInt(urine);
    if (oxygen) patient.vitals.oxygen = oxygen;
    patient.vitals.notes = notes;

    // Add to history
    if (!patient.vitalsHistory) patient.vitalsHistory = [];
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const nowTime = today.toTimeString().split(' ')[0].substring(0, 5);
    patient.vitalsHistory.unshift({
      date: `${todayStr} ${nowTime}`,
      ...patient.vitals
    });

    // Refresh display
    document.getElementById('vitals-temp-val').innerText = (patient.vitals.temp || '--') + ' °F';
    document.getElementById('vitals-hr-val').innerText = (patient.vitals.hr || '--') + ' bpm';
    document.getElementById('vitals-bp-val').innerText = patient.vitals.bp || '--';
    document.getElementById('vitals-rr-val').innerText = (patient.vitals.rr || '--') + ' /min';
    document.getElementById('vitals-spo2-val').innerText = (patient.vitals.spo2 || '--') + '%';
    document.getElementById('vitals-weight-val').innerText = (patient.vitals.weight || '--') + ' kg';
    document.getElementById('vitals-pain-val').innerText = (patient.vitals.pain !== undefined ? patient.vitals.pain : '--') + '/10';
    document.getElementById('vitals-sugar-val').innerText = (patient.vitals.sugar || '--') + ' mg/dL';
    document.getElementById('vitals-urine-val').innerText = (patient.vitals.urine || '--') + ' mL';
    document.getElementById('vitals-oxygen-val').innerText = patient.vitals.oxygen || 'N/A';
    
    const notesContainer = document.getElementById('vitals-notes-container');
    const notesVal = document.getElementById('vitals-notes-val');
    if (notesContainer && notesVal) {
      notesVal.innerText = patient.vitals.notes || '';
      notesContainer.style.display = patient.vitals.notes ? '' : 'none';
    }

    // Clear fields
    document.getElementById('vit-temp').value = '';
    document.getElementById('vit-hr').value = '';
    document.getElementById('vit-bp').value = '';
    document.getElementById('vit-rr').value = '';
    document.getElementById('vit-spo2').value = '';
    document.getElementById('vit-weight').value = '';
    document.getElementById('vit-pain').value = '0';
    document.getElementById('vit-sugar').value = '';
    document.getElementById('vit-urine').value = '';
    document.getElementById('vit-oxygen').value = 'N/A';
    document.getElementById('vit-notes').value = '';

    // NEWS2 Sepsis Warning Validation
    const vitalsCheck = state.validate('Vitals Entry', { patientUhid: uhid, vitals: { bp, hr, temp, spo2 } });
    if (vitalsCheck.status === 'WARNING') {
      showSepsisWarningModal(patient, vitalsCheck.score, vitalsCheck.reasons, vitalsCheck.message);
    } else {
      alert('Vitals updated successfully.');
      if (confirm("Last IV NS 500ml used. Request more?")) {
        window.showStockRequestOverlay({
          dept: patient.bed && patient.bed.includes('GW') ? 'General Ward' : 'ICU',
          urgency: 'Urgent',
          prefillItem: { code: 'ITM-CON-006', name: 'IV NS 500ml', qty: 50, unit: 'bags' }
        });
      }
    }
  }
};

// Prescription builders
window.addPrescription = function(uhid) {
  const patient = state.patients.find(p => p.uhid === uhid);
  if (patient) {
    const drugName = document.getElementById('rx-search-input').value.trim();
    const dose = document.getElementById('rx-dose').value.trim();
    const freq = document.getElementById('rx-freq').value.trim();
    const duration = document.getElementById('rx-duration').value.trim();
    const instruction = document.getElementById('rx-instructions').value.trim();

    if (!drugName) {
      alert('Please enter or search a medication name.');
      return;
    }
    if (!dose || !freq || !duration) {
      alert('Please fill out dosage, frequency, and duration.');
      return;
    }

    // Find the drug object in inventory
    const drugObj = state.inventory.pharmacy.find(item => item.brandName.toLowerCase() === drugName.toLowerCase() || item.name.toLowerCase() === drugName.toLowerCase());

    // 1. Stock check - if drug is out of stock, force the alternative drawer
    if (drugObj && drugObj.stock === 0) {
      alert(`The selected drug "${drugName}" is Out of Stock. Please select an alternative from the drawer.`);
      window.renderAlternativeDrawer(drugObj, null, patient);
      return;
    }

    // 2. CDSS safety validation
    const validationCheck = state.validate('Prescription', { patientUhid: uhid, drugName: drugName });
    if (validationCheck && validationCheck.status === 'WARNING') {
      showClinicalWarningModal(patient, drugName, validationCheck.severity, validationCheck.message, () => {
        executeAddPrescription(patient, drugName, dose, freq, duration, instruction);
      });
      return;
    }

    executeAddPrescription(patient, drugName, dose, freq, duration, instruction);
  }
};

function executeAddPrescription(patient, drug, dose, freq, duration, instruction) {
  patient.prescriptions.push({ drug, dose, freq, duration, instruction });
  
  // Refresh Prescriptions list
  const tbody = document.getElementById('emr-prescription-list');
  tbody.innerHTML = patient.prescriptions.map((p, idx) => `
    <tr>
      <td><strong>${p.drug}</strong></td>
      <td>${p.dose}</td>
      <td>${p.freq}</td>
      <td>${p.duration}</td>
      <td>${p.instruction || 'None'}</td>
      <td style="text-align: right;"><button class="btn btn-danger" style="padding: 0.2rem 0.5rem; font-size: 0.75rem;" onclick="removePrescription('${patient.uhid}', ${idx})">Remove</button></td>
    </tr>
  `).join('');

  // Clear input fields
  document.getElementById('rx-search-input').value = '';
  document.getElementById('rx-dose').value = '';
  document.getElementById('rx-freq').value = '';
  document.getElementById('rx-duration').value = '';
  document.getElementById('rx-instructions').value = '';
  window.selectedRxDrug = null;
}

window.removePrescription = function(uhid, idx) {
  const patient = state.patients.find(p => p.uhid === uhid);
  if (patient) {
    patient.prescriptions.splice(idx, 1);
    // Refresh list
    const tbody = document.getElementById('emr-prescription-list');
    tbody.innerHTML = patient.prescriptions.map((p, index) => `
      <tr>
        <td><strong>${p.drug}</strong></td>
        <td>${p.dose}</td>
        <td>${p.freq}</td>
        <td>${p.duration}</td>
        <td>${p.instruction || 'None'}</td>
        <td style="text-align: right;"><button class="btn btn-danger" style="padding: 0.2rem 0.5rem; font-size: 0.75rem;" onclick="removePrescription('${patient.uhid}', ${index})">Remove</button></td>
      </tr>
    `).join('');
  }
};

// Order submission
window.submitDiagnosticOrders = function(uhid) {
  const patient = state.patients.find(p => p.uhid === uhid);
  const doc = document.getElementById('diag-order-doctor').value;
  const prio = document.getElementById('diag-order-priority').value;

  const labCheckboxes = document.querySelectorAll('input[name="lab-order-item"]:checked');
  const radCheckboxes = document.querySelectorAll('input[name="rad-order-item"]:checked');

  if (labCheckboxes.length === 0 && radCheckboxes.length === 0) {
    alert('Please check at least one laboratory or radiology test to order.');
    return;
  }

  // Create Lab orders
  labCheckboxes.forEach(cb => {
    state.orders.push({
      id: "ORD" + String(6000 + state.orders.length + 1),
      uhid: patient.uhid,
      patientName: patient.name,
      doctorName: doc,
      type: "Laboratory",
      name: cb.value,
      date: "2026-06-17",
      priority: prio,
      status: "Sample Collected",
      result: ""
    });
    cb.checked = false; // Uncheck
  });

  // Create Radiology orders
  radCheckboxes.forEach(cb => {
    state.orders.push({
      id: "ORD" + String(6000 + state.orders.length + 1),
      uhid: patient.uhid,
      patientName: patient.name,
      doctorName: doc,
      type: "Radiology",
      name: cb.value,
      date: "2026-06-17",
      priority: prio,
      status: "Approved",
      result: ""
    });
    cb.checked = false; // Uncheck
  });

  alert('Diagnostics orders successfully placed. They are now sent to LIS/RIS worklists.');
};

function showClinicalWarningModal(patient, drug, severity, message, onOverride) {
  let modal = document.getElementById('clinical-warning-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'clinical-warning-modal';
    modal.className = 'modal-overlay';
    document.body.appendChild(modal);
  }

  window.tempClinicalOverride = function() {
    const reason = document.getElementById('clin-override-reason').value.trim();
    if (!reason) {
      alert('JCI/NABH regulation requires a clinical justification reason to override safety alerts.');
      return;
    }

    const timestamp = new Date().toISOString();
    state.auditLogs.push({
      timestamp: timestamp,
      user: "Dr. Clinician",
      uhid: patient.uhid,
      patientName: patient.name,
      action: "Clinical Safety Override",
      medicationRequested: drug,
      reason: reason,
      details: message
    });

    state.alerts.push({
      id: "ALT" + String(100 + state.alerts.length + 1),
      severity: severity,
      source: "Clinical EMR",
      patientName: patient.name,
      uhid: patient.uhid,
      details: `${message.split('\n')[0]} - Overridden by Clinician. Reason: "${reason}"`,
      clinician: patient.primaryConsultant,
      time: new Date().toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' }) + " " + new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      status: "Resolved",
      eStatus: "Resolved"
    });

    closeClinicalWarningModal();
    onOverride();
  };

  modal.innerHTML = `
    <div class="modal-box" style="max-width: 900px; border: 2px solid ${severity === 'Hard Stop' ? 'var(--color-danger)' : 'var(--color-warning)'}; border-radius: var(--radius-md); box-shadow: var(--shadow-lg);">
      <div class="modal-header" style="background-color: ${severity === 'Hard Stop' ? 'var(--color-danger-bg)' : 'var(--color-warning-bg)'}; color: ${severity === 'Hard Stop' ? 'var(--color-danger)' : '#b45309'}; border-bottom: 1px solid var(--border-color); padding: 1rem; display: flex; justify-content: space-between; align-items: center;">
        <h4 class="modal-title" style="margin: 0; display: flex; align-items: center; gap: 0.5rem; font-weight: 700;">⚠️ JCI Clinical Safety Warning</h4>
        <span class="modal-close" style="cursor: pointer; font-size: 1.5rem; line-height: 1;" onclick="closeClinicalWarningModal()">&times;</span>
      </div>
      <div class="modal-body" style="padding: 1.5rem; font-size: 0.85rem; display: flex; flex-direction: column; gap: 1.25rem;">
        <div style="background-color: var(--color-warning-bg); color: #b45309; padding: 0.75rem; border-radius: 6px; font-weight: bold; text-align: center; border: 1px solid rgba(245, 158, 11, 0.2);">
          ${severity.toUpperCase()} DETECTED
        </div>
        
        <p style="color: var(--text-primary); line-height: 1.5; font-size: 0.9rem; margin: 0; font-weight: 500;">
          ${message.replace('🚨 DRUG-ALLERGY CONFLICT:\n', '').replace('⚠️ THERAPEUTIC DUPLICATION ALERT:\n', '')}
        </p>

        <div class="form-group" style="margin-top: 0.5rem;">
          <label style="font-weight: 700; margin-bottom: 0.35rem; display: block; color: var(--text-primary);">Clinical Override Justification <span style="color:var(--color-danger);">*</span></label>
          <textarea id="clin-override-reason" class="form-control" rows="2" placeholder="e.g. Patient previously tolerated drug; benefits outweigh risks..." style="font-size:0.8rem;"></textarea>
        </div>

        <div style="background-color: var(--bg-surface-elevated); color: var(--text-secondary); padding: 0.75rem; border-radius: 6px; border: 1px solid var(--border-color); font-size: 0.75rem; line-height: 1.4;">
          <strong>NABH Standard AAC.2:</strong> High-risk and allergy drug administrations must be verified and medically justified in writing before clinical execution.
        </div>

        <div style="display: flex; justify-content: flex-end; gap: 0.5rem; border-top: 1px solid var(--border-color); padding-top: 1rem;">
          <button class="btn btn-secondary" onclick="closeClinicalWarningModal()">Cancel Prescription</button>
          <button class="btn btn-primary" onclick="window.tempClinicalOverride()">Acknowledge & Force Prescribe</button>
        </div>
      </div>
    </div>
  `;

  modal.classList.add('active');
  modal.style.display = 'flex';
}

window.closeClinicalWarningModal = function() {
  const modal = document.getElementById('clinical-warning-modal');
  if (modal) {
    modal.classList.remove('active');
    modal.style.display = 'none';
  }
};

function showSepsisWarningModal(patient, score, reasons, message) {
  let modal = document.getElementById('sepsis-warning-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'sepsis-warning-modal';
    modal.className = 'modal-overlay';
    document.body.appendChild(modal);
  }

  modal.innerHTML = `
    <div class="modal-box" style="max-width: 900px; border: 2px solid var(--color-danger); border-radius: var(--radius-md); box-shadow: var(--shadow-lg);">
      <div class="modal-header" style="background-color: var(--color-danger-bg); color: var(--color-danger); border-bottom: 1px solid var(--border-color); padding: 1rem; display: flex; justify-content: space-between; align-items: center;">
        <h4 class="modal-title" style="margin: 0; display: flex; align-items: center; gap: 0.5rem; font-weight: 700;">🚨 Sepsis Safety Alert (NEWS2 Score: ${score})</h4>
        <span class="modal-close" style="cursor: pointer; font-size: 1.5rem; line-height: 1;" onclick="closeSepsisWarningModal()">&times;</span>
      </div>
      <div class="modal-body" style="padding: 1.5rem; font-size: 0.85rem; display: flex; flex-direction: column; gap: 1.25rem;">
        <div style="background-color: var(--color-danger-bg); color: var(--color-danger); padding: 0.75rem; border-radius: 6px; font-weight: bold; text-align: center; border: 1px solid rgba(239, 68, 68, 0.2);">
          PHYSIOLOGICAL INSTABILITY DETECTED
        </div>
        
        <p style="color: var(--text-primary); line-height: 1.5; font-size: 0.9rem; margin: 0; font-weight: 500;">
          ${message.replace('🚨 CRITICAL SAFETY ALERT: SEPSIS RISK (NEWS2 Score: ' + score + ')\n', '')}
        </p>

        <div style="background-color: var(--bg-surface-elevated); padding: 0.75rem; border-radius: 6px; border: 1px solid var(--border-color); font-size: 0.8rem;">
          <strong>Contributing Physiological Parameters:</strong>
          <ul style="margin: 0.35rem 0 0 1.25rem; padding: 0; display: flex; flex-direction: column; gap: 0.25rem;">
            ${reasons.map(r => `<li>${r}</li>`).join('')}
          </ul>
        </div>

        <div style="background-color: var(--color-warning-bg); color: #b45309; padding: 0.75rem; border-radius: 6px; border: 1px solid rgba(245, 158, 11, 0.2); font-size: 0.75rem; line-height: 1.4;">
          <strong>NABH Quality Standard COP.6:</strong> Critical/high risk physiological alerts must trigger immediate medical escalation. Sepsis bundle compliance initiated.
        </div>

        <div style="display: flex; justify-content: flex-end; gap: 0.5rem; border-top: 1px solid var(--border-color); padding-top: 1rem;">
          <button class="btn btn-secondary" onclick="closeSepsisWarningModal(); router.navigate('emr?uhid=${patient.uhid}');">Acknowledge & Close</button>
        </div>
      </div>
    </div>
  `;

  state.alerts.push({
    id: "ALT" + String(100 + state.alerts.length + 1),
    severity: "Critical Safety Alert",
    source: "Clinical EMR",
    patientName: patient.name,
    uhid: patient.uhid,
    details: `Sepsis alert triggered (NEWS2: ${score}). Signs: ${reasons.join(', ')}.`,
    clinician: patient.primaryConsultant,
    time: "2026-06-17 03:12 PM",
    status: "Active",
    eStatus: "Open"
  });

  modal.classList.add('active');
  modal.style.display = 'flex';
}

window.closeSepsisWarningModal = function() {
  const modal = document.getElementById('sepsis-warning-modal');
  if (modal) {
    modal.classList.remove('active');
    modal.style.display = 'none';
  }
};

/* ==========================================================================
   INTELLIGENT MEDICATION SEARCH & ALTERNATIVE RECOMMENDATION ENGINE CODE
   ========================================================================== */

window.setPrescribeMode = function(mode) {
  window.currentPrescribeMode = mode;
  const btnBrand = document.getElementById('mode-brand');
  const btnGeneric = document.getElementById('mode-generic');
  if (btnBrand && btnGeneric) {
    if (mode === 'brand') {
      btnBrand.classList.add('active');
      btnGeneric.classList.remove('active');
      document.getElementById('rx-search-input').placeholder = "Search by Brand Name...";
    } else {
      btnBrand.classList.remove('active');
      btnGeneric.classList.add('active');
      document.getElementById('rx-search-input').placeholder = "Search by Generic/Salt Name...";
    }
  }
  const input = document.getElementById('rx-search-input');
  if (input) input.value = '';
  const list = document.getElementById('rx-autocomplete-list');
  if (list) list.style.display = 'none';
  window.selectedRxDrug = null;
};

window.selectDrugFromAutocomplete = function(drugCode, patientUhid) {
  const patient = state.patients.find(p => p.uhid === patientUhid);
  const drug = state.inventory.pharmacy.find(d => d.code === drugCode);
  if (!drug || !patient) return;

  window.selectedRxDrug = drug;
  
  const input = document.getElementById('rx-search-input');
  if (input) input.value = drug.brandName;
  
  const dropdown = document.getElementById('rx-autocomplete-list');
  if (dropdown) dropdown.style.display = 'none';

  if (drug.stock === 0 || drug.stock <= drug.minStock) {
    window.renderAlternativeDrawer(drug, null, patient);
  } else {
    const validationCheck = state.validate('Prescription', { patientUhid: patient.uhid, drugName: drug.brandName });
    if (validationCheck && validationCheck.status === 'WARNING') {
      showClinicalWarningModal(patient, drug.brandName, validationCheck.severity, validationCheck.message, () => {
        // acknowledged
      });
    }
  }
};

window.selectGenericFromAutocomplete = function(genericName, strength, route, dosageForm, patientUhid) {
  const patient = state.patients.find(p => p.uhid === patientUhid);
  if (!patient) return;

  const firstBrand = state.inventory.pharmacy.find(item => 
    item.genericName.toLowerCase() === genericName.toLowerCase() &&
    item.strength === strength &&
    item.route === route &&
    item.dosageForm === dosageForm
  );

  window.selectedRxDrug = firstBrand;

  const input = document.getElementById('rx-search-input');
  if (input) input.value = `${genericName} (${strength})`;

  const dropdown = document.getElementById('rx-autocomplete-list');
  if (dropdown) dropdown.style.display = 'none';

  window.renderAlternativeDrawer(firstBrand, genericName, patient);
};

window.openRxDrawer = function() {
  const drawer = document.getElementById('rx-recommendation-drawer');
  const backdrop = document.getElementById('rx-drawer-backdrop');
  if (drawer && backdrop) {
    backdrop.style.display = 'block';
    setTimeout(() => {
      backdrop.classList.add('active');
      drawer.classList.add('active');
    }, 10);
  }
};

window.closeRxDrawer = function() {
  const drawer = document.getElementById('rx-recommendation-drawer');
  const backdrop = document.getElementById('rx-drawer-backdrop');
  if (drawer && backdrop) {
    drawer.classList.remove('active');
    backdrop.classList.remove('active');
    setTimeout(() => {
      backdrop.style.display = 'none';
    }, 300);
  }
};

window.renderAlternativeDrawer = function(selectedDrug, selectedGeneric, patient) {
  const drawerBody = document.getElementById('rx-drawer-body');
  if (!drawerBody) return;

  let drugObj = selectedDrug;
  let genericName = selectedGeneric;
  let strength = '';
  let route = '';
  let dosageForm = '';

  if (drugObj) {
    genericName = drugObj.genericName;
    strength = drugObj.strength;
    route = drugObj.route;
    dosageForm = drugObj.dosageForm;
  }

  let alternatives = state.inventory.pharmacy.filter(item => {
    const matchesGeneric = item.genericName.toLowerCase() === genericName.toLowerCase();
    const matchesSpecs = (!strength || item.strength === strength) &&
                         (!route || item.route === route) &&
                         (!dosageForm || item.dosageForm === dosageForm);
    const isDifferent = !drugObj || item.code !== drugObj.code;
    return matchesGeneric && matchesSpecs && isDifferent;
  });

  alternatives.sort((a, b) => {
    if (a.stock !== b.stock) {
      return b.stock - a.stock;
    }
    return a.price - b.price;
  });

  let html = '';

  if (drugObj) {
    const stockClass = drugObj.stock === 0 ? 'outofstock' : (drugObj.stock <= drugObj.minStock ? 'lowstock' : 'instock');
    const stockText = drugObj.stock === 0 ? 'Out of Stock' : (drugObj.stock <= drugObj.minStock ? 'Low Stock' : 'In Stock');
    const stockDot = drugObj.stock === 0 ? '🔴' : (drugObj.stock <= drugObj.minStock ? '🟡' : '🟢');

    html += `
      <div style="background-color: var(--bg-surface-elevated); padding: 1rem; border-radius: var(--radius-sm); border: 1px solid var(--border-color); display: flex; flex-direction: column; gap: 0.5rem;">
        <div style="display: flex; justify-content: space-between; align-items: start;">
          <div>
            <h5 style="margin: 0; font-size: 0.95rem; font-weight: 700;">${drugObj.brandName}</h5>
            <span style="font-size: 0.75rem; color: var(--text-secondary); font-style: italic;">${drugObj.genericName} (${drugObj.strength})</span>
          </div>
          <span class="stock-badge-indicator ${stockClass}">${stockDot} ${stockText}</span>
        </div>
        
        <div style="font-size: 0.75rem; color: var(--text-secondary); display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; border-top: 1px solid var(--border-color); padding-top: 0.5rem; margin-top: 0.25rem;">
          <span><strong>Form:</strong> ${drugObj.dosageForm}</span>
          <span><strong>Route:</strong> ${drugObj.route}</span>
          <span><strong>Price:</strong> ₹${drugObj.price} / ${drugObj.packSize}</span>
          <span><strong>Total Stock:</strong> ${drugObj.stock} units</span>
        </div>

        <div style="margin-top: 0.5rem;">
          <strong style="font-size: 0.7rem; color: var(--text-muted); text-transform: uppercase; display: block; margin-bottom: 0.25rem;">Live Pharmacy Stock:</strong>
          <div class="live-inventory-grid">
            ${Object.entries(drugObj.locations).map(([loc, qty]) => `
              <div class="live-inventory-item">
                <span>${loc}</span>
                <span style="font-weight: 600; color: ${qty === 0 ? 'var(--color-danger)' : 'var(--text-primary)'}">${qty}</span>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  } else {
    html += `
      <div style="background-color: var(--bg-surface-elevated); padding: 1rem; border-radius: var(--radius-sm); border: 1px solid var(--border-color);">
        <h5 style="margin: 0; font-size: 0.95rem; font-weight: 700;">Generic: ${genericName}</h5>
        <p style="font-size: 0.75rem; color: var(--text-secondary); margin: 0.25rem 0 0 0;">Select a brand alternative matching this generic composition.</p>
      </div>
    `;
  }

  if (drugObj) {
    const selectedValidation = state.validate('Prescription', { patientUhid: patient.uhid, drugName: drugObj.brandName });
    if (selectedValidation && selectedValidation.status === 'WARNING') {
      html += `
        <div class="safety-check-alert-card critical" style="margin-top: 0.5rem;">
          <strong>⚠️ Clinical Safety Alert for ${drugObj.brandName}:</strong>
          <span style="font-size: 0.75rem;">${selectedValidation.message.replace(/\n/g, '<br>')}</span>
        </div>
      `;
    }
  }

  html += `
    <div style="margin-top: 1rem; margin-bottom: 0.5rem;">
      <h5 style="font-size: 0.85rem; font-weight: 700; color: var(--text-primary); margin: 0;">In-Stock Brand Alternatives (${alternatives.length})</h5>
    </div>
  `;

  if (alternatives.length === 0) {
    html += `
      <div style="padding: 1.5rem; text-align: center; border: 1px dashed var(--border-color); border-radius: var(--radius-sm); color: var(--text-muted); font-size: 0.8rem;">
        No in-stock brand alternatives found for this generic compound.
      </div>
    `;
  } else {
    alternatives.forEach((alt, idx) => {
      const rank = idx + 1;
      const priceDiff = drugObj ? alt.price - drugObj.price : 0;
      let priceText = '';
      if (priceDiff < 0) {
        priceText = `<span style="color: var(--color-success); font-weight: 600;">₹${alt.price} (Save ₹${Math.abs(priceDiff)})</span>`;
      } else if (priceDiff > 0) {
        priceText = `<span style="color: var(--color-danger); font-weight: 600;">₹${alt.price} (+₹${priceDiff})</span>`;
      } else {
        priceText = `<span>₹${alt.price}</span>`;
      }

      const altStockClass = alt.stock === 0 ? 'outofstock' : (alt.stock <= alt.minStock ? 'lowstock' : 'instock');
      const altStockText = alt.stock === 0 ? 'Out of Stock' : (alt.stock <= alt.minStock ? 'Low Stock' : 'In Stock');
      const altStockDot = alt.stock === 0 ? '🔴' : (alt.stock <= alt.minStock ? '🟡' : '🟢');

      const altValidation = state.validate('Prescription', { patientUhid: patient.uhid, drugName: alt.brandName });
      let altSafetyHTML = '';
      if (altValidation && altValidation.status === 'WARNING') {
        const isCritical = altValidation.severity === 'Critical Safety Alert' || altValidation.severity === 'Hard Stop';
        altSafetyHTML = `
          <div class="safety-check-alert-card ${isCritical ? 'critical' : ''}" style="margin-top: 0.5rem; font-size: 0.7rem; padding: 0.4rem 0.6rem; border-left-width: 3px;">
            <strong>⚠️ Clinical Alert:</strong> ${altValidation.message.split('\n')[0]}
          </div>
        `;
      }

      html += `
        <div class="alternative-card" style="margin-bottom: 0.75rem;">
          <div class="alt-rank-line">
            <span class="alt-rank-tag">#${rank} Alternative</span>
            <span class="stock-badge-indicator ${altStockClass}" style="font-size:0.6rem; padding: 0.1rem 0.3rem;">${altStockDot} ${altStockText}</span>
          </div>
          
          <div style="display: flex; justify-content: space-between; align-items: start; margin-top: 0.25rem;">
            <div>
              <div class="alt-card-title">${alt.brandName}</div>
              <div class="alt-card-generic">${alt.genericName} (${alt.strength})</div>
            </div>
            <div style="font-size: 0.8rem; text-align: right;">
              <div>${priceText}</div>
              <div style="font-size: 0.65rem; color: var(--text-muted);">${alt.packSize}</div>
            </div>
          </div>
          
          <div class="alt-card-stock-grid">
            ${Object.entries(alt.locations).slice(0, 5).map(([loc, qty]) => `
              <div class="live-inventory-item" style="border-bottom:none; padding:0;">
                <span>${loc.split(' ')[0]}:</span>
                <span style="font-weight:600; color:${qty === 0 ? 'var(--color-danger)' : 'var(--text-primary)'}">${qty}</span>
              </div>
            `).join('')}
          </div>

          ${altSafetyHTML}

          <div style="display: flex; justify-content: flex-end; margin-top: 0.5rem; border-top: 1px solid var(--border-color); padding-top: 0.5rem;">
            <button class="btn btn-primary btn-sm" style="font-size: 0.75rem; padding: 0.2rem 0.5rem;" onclick="window.acceptAlternativeSubstitution('${patient.uhid}', '${alt.code}')">Select & Substitute</button>
          </div>
        </div>
      `;
    });
  }

  if (drugObj && (drugObj.stock === 0 || drugObj.stock <= drugObj.minStock)) {
    html += `
      <div style="margin-top: 1.5rem; border-top: 1px solid var(--border-color); padding-top: 1rem; display: flex; flex-direction: column; gap: 0.5rem;">
        <div style="font-size: 0.75rem; color: var(--text-secondary); line-height: 1.4;">
          <strong>Clinical Override Required:</strong> Prescribing the original drug ${drugObj.brandName} (which is Out of Stock or Low Stock) bypasses inventory safety checks. JCI/NABH standards require mandatory clinician justification.
        </div>
        <button class="btn btn-secondary" style="width: 100%; font-size: 0.8rem; background-color: var(--color-warning-bg); color: #b45309; border: 1px solid rgba(245, 158, 11, 0.3);" onclick="window.overrideOriginalDrugSelection('${patient.uhid}', '${drugObj.code}')">Force Prescribe Original</button>
      </div>
    `;
  }

  drawerBody.innerHTML = html;
  window.openRxDrawer();
};

window.acceptAlternativeSubstitution = function(uhid, altCode) {
  const patient = state.patients.find(p => p.uhid === uhid);
  const altDrug = state.inventory.pharmacy.find(d => d.code === altCode);
  if (!patient || !altDrug) return;

  window.selectedRxDrug = altDrug;
  const input = document.getElementById('rx-search-input');
  if (input) input.value = altDrug.brandName;

  const validationCheck = state.validate('Prescription', { patientUhid: patient.uhid, drugName: altDrug.brandName });
  if (validationCheck && validationCheck.status === 'WARNING') {
    showClinicalWarningModal(patient, altDrug.brandName, validationCheck.severity, validationCheck.message, () => {
      // Done
    });
  }

  window.closeRxDrawer();
};

window.overrideOriginalDrugSelection = function(uhid, drugCode) {
  const patient = state.patients.find(p => p.uhid === uhid);
  const drug = state.inventory.pharmacy.find(d => d.code === drugCode);
  if (!patient || !drug) return;

  let modal = document.getElementById('inventory-override-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'inventory-override-modal';
    modal.className = 'modal-overlay';
    document.body.appendChild(modal);
  }

  window.submitInventoryOverride = function() {
    const reason = document.getElementById('inv-override-reason').value.trim();
    if (!reason) {
      alert('JCI regulation requires clinical justification to override inventory alerts.');
      return;
    }

    const timestamp = new Date().toISOString();
    state.auditLogs.push({
      timestamp: timestamp,
      user: "Dr. Clinician",
      uhid: patient.uhid,
      patientName: patient.name,
      action: "OOS Override Prescribe",
      medicationRequested: drug.brandName,
      reason: reason
    });

    state.alerts.push({
      id: "ALT" + String(100 + state.alerts.length + 1),
      severity: "Warning",
      source: "Inventory Bypass",
      patientName: patient.name,
      uhid: patient.uhid,
      details: `Stock override: Prescribed OOS ${drug.brandName}. Reason: "${reason}"`,
      clinician: patient.primaryConsultant,
      time: new Date().toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' }) + " " + new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      status: "Resolved",
      eStatus: "Resolved"
    });

    window.selectedRxDrug = drug;
    const input = document.getElementById('rx-search-input');
    if (input) input.value = drug.brandName;

    window.closeInventoryOverrideModal();
    window.closeRxDrawer();
  };

  modal.innerHTML = `
    <div class="modal-box" style="max-width: 900px; border: 2px solid var(--color-warning); border-radius: var(--radius-md); box-shadow: var(--shadow-lg);">
      <div class="modal-header" style="background-color: var(--color-warning-bg); color: #b45309; border-bottom: 1px solid var(--border-color); padding: 1rem; display: flex; justify-content: space-between; align-items: center;">
        <h4 class="modal-title" style="margin: 0; display: flex; align-items: center; gap: 0.5rem; font-weight: 700;">⚠️ JCI Inventory Stock Override</h4>
        <span class="modal-close" style="cursor: pointer; font-size: 1.5rem; line-height: 1;" onclick="window.closeInventoryOverrideModal()">&times;</span>
      </div>
      <div class="modal-body" style="padding: 1.5rem; font-size: 0.85rem; display: flex; flex-direction: column; gap: 1.25rem;">
        <p style="color: var(--text-primary); line-height: 1.5; font-size: 0.9rem; margin: 0; font-weight: 500;">
          You are prescribing <strong>${drug.brandName}</strong>, which is currently marked as <strong>Out of Stock</strong> (0 units) or <strong>Low Stock</strong>.
        </p>

        <div class="form-group">
          <label style="font-weight: 700; margin-bottom: 0.35rem; display: block; color: var(--text-primary);">Override Justification Reason <span style="color:var(--color-danger);">*</span></label>
          <textarea id="inv-override-reason" class="form-control" rows="2" placeholder="e.g. Patient requires this specific brand; relative will purchase from outside pharmacy..." style="font-size:0.8rem;"></textarea>
        </div>

        <div style="background-color: var(--bg-surface-elevated); color: var(--text-secondary); padding: 0.75rem; border-radius: 6px; border: 1px solid var(--border-color); font-size: 0.75rem; line-height: 1.4;">
          <strong>Regulation Notice:</strong> All medication bypasses are audited. The override reason is logged to state.auditLogs and reported to the Hospital Quality and Clinical Safety Committee.
        </div>

        <div style="display: flex; justify-content: flex-end; gap: 0.5rem; border-top: 1px solid var(--border-color); padding-top: 1rem;">
          <button class="btn btn-secondary" onclick="window.closeInventoryOverrideModal()">Cancel</button>
          <button class="btn btn-primary" onclick="window.submitInventoryOverride()">Confirm Override</button>
        </div>
      </div>
    </div>
  `;

  modal.classList.add('active');
  modal.style.display = 'flex';
};

window.closeInventoryOverrideModal = function() {
  const modal = document.getElementById('inventory-override-modal');
  if (modal) {
    modal.classList.remove('active');
    modal.style.display = 'none';
  }
};

function bindAutocompleteEvents(patient) {
  const input = document.getElementById('rx-search-input');
  const listContainer = document.getElementById('rx-autocomplete-list');
  if (!input || !listContainer) return;

  document.addEventListener('click', (e) => {
    if (!input.contains(e.target) && !listContainer.contains(e.target)) {
      listContainer.style.display = 'none';
    }
  });

  input.addEventListener('focus', () => {
    triggerSearch();
  });

  input.addEventListener('input', () => {
    triggerSearch();
  });

  function triggerSearch() {
    const query = input.value.toLowerCase().trim();
    if (!query) {
      listContainer.style.display = 'none';
      return;
    }

    const mode = window.currentPrescribeMode || 'brand';
    let html = '';

    if (mode === 'brand') {
      const matches = state.inventory.pharmacy.filter(item => {
        return item.brandName.toLowerCase().includes(query) ||
               item.genericName.toLowerCase().includes(query) ||
               item.saltComposition.toLowerCase().includes(query) ||
               item.category.toLowerCase().includes(query);
      });

      if (matches.length === 0) {
        listContainer.innerHTML = `<div style="padding: 0.5rem; text-align: center; color: var(--text-muted); font-size: 0.8rem;">No brands found matching "${query}"</div>`;
        listContainer.style.display = 'block';
        return;
      }

      matches.forEach(item => {
        const stockClass = item.stock === 0 ? 'outofstock' : (item.stock <= item.minStock ? 'lowstock' : 'instock');
        const stockText = item.stock === 0 ? 'Out of Stock' : (item.stock <= item.minStock ? 'Low Stock' : 'In Stock');
        const stockDot = item.stock === 0 ? '🔴' : (item.stock <= item.minStock ? '🟡' : '🟢');
        
        let expiryWarning = '';
        if (item.expiringSoon) {
          expiryWarning = `<span style="color: var(--color-danger); font-weight: 600; margin-left: 0.5rem;">⚠️ Near Expiry</span>`;
        }

        html += `
          <div class="autocomplete-item" onclick="window.selectDrugFromAutocomplete('${item.code}', '${patient.uhid}')">
            <div class="autocomplete-item-row">
              <span class="autocomplete-brand-name">${item.brandName} ${expiryWarning}</span>
              <span class="stock-badge-indicator ${stockClass}">${stockDot} ${stockText}</span>
            </div>
            <div class="autocomplete-meta-line" style="display: flex; justify-content: space-between;">
              <span>Gen: ${item.genericName} (${item.strength}) - ${item.dosageForm}</span>
              <span>₹${item.price} / ${item.packSize}</span>
            </div>
          </div>
        `;
      });

    } else {
      const genericGroups = {};
      state.inventory.pharmacy.forEach(item => {
        const matchesQuery = item.genericName.toLowerCase().includes(query) ||
                             item.saltComposition.toLowerCase().includes(query) ||
                             item.category.toLowerCase().includes(query);
        if (matchesQuery) {
          const key = `${item.genericName} (${item.strength}, ${item.dosageForm}, ${item.route})`;
          if (!genericGroups[key]) {
            genericGroups[key] = [];
          }
          genericGroups[key].push(item);
        }
      });

      const keys = Object.keys(genericGroups);
      if (keys.length === 0) {
        listContainer.innerHTML = `<div style="padding: 0.5rem; text-align: center; color: var(--text-muted); font-size: 0.8rem;">No generic compounds found matching "${query}"</div>`;
        listContainer.style.display = 'block';
        return;
      }

      keys.forEach(key => {
        const items = genericGroups[key];
        const totalStock = items.reduce((sum, item) => sum + item.stock, 0);
        const inStockCount = items.filter(item => item.stock > 0).length;
        const totalBrands = items.length;

        const stockClass = totalStock === 0 ? 'outofstock' : (totalStock < 200 ? 'lowstock' : 'instock');
        const stockText = totalStock === 0 ? 'Out of Stock' : `${inStockCount}/${totalBrands} Brands Avail`;
        const stockDot = totalStock === 0 ? '🔴' : '🟢';

        html += `
          <div class="autocomplete-item" onclick="window.selectGenericFromAutocomplete('${items[0].genericName}', '${items[0].strength}', '${items[0].route}', '${items[0].dosageForm}', '${patient.uhid}')">
            <div class="autocomplete-item-row">
              <span class="autocomplete-brand-name" style="color: var(--primary); font-weight: 700;">🧬 ${key}</span>
              <span class="stock-badge-indicator ${stockClass}">${stockDot} ${stockText}</span>
            </div>
            <div class="autocomplete-meta-line">
              Active Ingredients: ${items[0].saltComposition} • Click to compare ${totalBrands} brand alternatives
            </div>
          </div>
        `;
      });
    }

    listContainer.innerHTML = html;
    listContainer.style.display = 'block';
  }
}

// ----------------------------------------------------
// Distraction-Free Workspace Navigation Exit Dialog
// ----------------------------------------------------

window.checkUnsavedChanges = function(patient) {
  if (!patient || !window.activeConsultation) return false;
  
  const initialSymptoms = patient.clinicalData?.symptoms || ["Fever"];
  const currentSymptoms = window.activeConsultation.symptoms || [];
  if (JSON.stringify([...initialSymptoms].sort()) !== JSON.stringify([...currentSymptoms].sort())) return true;

  const initialFindings = patient.clinicalData?.findings || [];
  const currentFindings = window.activeConsultation.findings || [];
  if (JSON.stringify([...initialFindings].sort()) !== JSON.stringify([...currentFindings].sort())) return true;

  const initialDiag = patient.clinicalData?.diagnosis ? patient.clinicalData.diagnosis.split(', ') : [];
  const currentDiag = window.activeConsultation.diagnostics || [];
  if (JSON.stringify([...initialDiag].sort()) !== JSON.stringify([...currentDiag].sort())) return true;

  const initialMeds = patient.prescriptions ? patient.prescriptions.map(p => p.drug) : ["Paracetamol"];
  const currentMeds = window.activeConsultation.medicines || [];
  if (JSON.stringify([...initialMeds].sort()) !== JSON.stringify([...currentMeds].sort())) return true;

  const initialInst = patient.clinicalData?.treatmentPlan ? patient.clinicalData.treatmentPlan.split('\n') : ["Rest well — avoid overexertion for at least 2-3 days."];
  const currentInst = window.activeConsultation.instructions || [];
  if (JSON.stringify([...initialInst].sort()) !== JSON.stringify([...currentInst].sort())) return true;

  const currentInvest = window.activeConsultation.investigations || [];
  if (currentInvest.length > 0) return true;

  const currentProcedures = window.activeConsultation.procedures || [];
  if (currentProcedures.length > 0) return true;

  if (patient.pregnancyStatus === 'Pregnant' && window.activeConsultation.ancData) {
    const initialAnc = patient.ancData || {};
    const currentAnc = window.activeConsultation.ancData || {};
    for (const key of Object.keys(currentAnc)) {
      if ((initialAnc[key] || "") !== (currentAnc[key] || "")) return true;
    }
  }

  return false;
};

window.updateAncField = function(field, value) {
  if (window.activeConsultation && window.activeConsultation.ancData) {
    window.activeConsultation.ancData[field] = value;
  }
};

window.showConsultationExitModal = function(targetHash) {
  const patient = window.activeConsultation ? state.patients.find(p => p.uhid === window.activeConsultation.uhid) : null;
  const hasUnsavedChanges = window.checkUnsavedChanges(patient);

  let modal = document.getElementById('consultation-exit-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'consultation-exit-modal';
    modal.className = 'modal-overlay';
    document.body.appendChild(modal);
  }

  modal.innerHTML = `
    <div class="modal-box" style="max-width: 500px; border-radius: 8px; box-shadow: var(--shadow-lg); overflow: hidden;">
      <div class="modal-header" style="background-color: var(--color-warning-bg, #fffbeb); color: #b45309; border-bottom: 1px solid var(--border-color); padding: 1rem; display: flex; justify-content: space-between; align-items: center;">
        <h4 class="modal-title" style="margin: 0; display: flex; align-items: center; gap: 0.5rem; font-weight: 700;">⚠️ Leave Consultation?</h4>
        <span class="modal-close" style="cursor: pointer; font-size: 1.5rem; line-height: 1;" onclick="window.closeConsultationExitModal()">&times;</span>
      </div>
      <div class="modal-body" style="padding: 1.5rem; font-size: 0.9rem; display: flex; flex-direction: column; gap: 1rem;">
        <p style="color: var(--text-primary); margin: 0; line-height: 1.5;">
          You are currently in an active consultation session for <strong>${patient ? patient.name : 'the patient'}</strong>. Leaving will interrupt the distraction-free workspace.
        </p>
        
        ${hasUnsavedChanges ? `
          <div style="background-color: #fee2e2; color: #991b1b; padding: 0.75rem; border-radius: 6px; border: 1px solid #fca5a5; font-size: 0.8rem; line-height: 1.4;">
            <strong>Warning:</strong> You have unsaved clinical updates (e.g. symptoms, findings, prescriptions, or instructions). Exiting without saving will permanently discard these changes.
          </div>
        ` : `
          <div style="background-color: var(--bg-surface-elevated); color: var(--text-secondary); padding: 0.75rem; border-radius: 6px; border: 1px solid var(--border-color); font-size: 0.8rem; line-height: 1.4;">
            No unsaved changes detected.
          </div>
        `}

        <div style="display: flex; flex-direction: column; gap: 0.5rem; margin-top: 0.5rem;">
          <button class="btn btn-primary" onclick="window.confirmPauseConsultation('${patient ? patient.uhid : ''}')" style="background-color: #d97706; border: none; font-weight: 600; width: 100%; padding: 0.6rem; color: #fff;">
            ⏸️ Pause Consultation (Save Temp State)
          </button>
          <button class="btn btn-danger" onclick="window.confirmExitConsultation('${targetHash}', ${hasUnsavedChanges})" style="background-color: var(--color-danger); border: none; font-weight: 600; width: 100%; padding: 0.6rem; color: #fff;">
            🚪 Exit & Abandon Changes
          </button>
          <button class="btn btn-secondary" onclick="window.closeConsultationExitModal()" style="font-weight: 600; width: 100%; padding: 0.6rem;">
            Cancel (Keep Working)
          </button>
        </div>
      </div>
    </div>
  `;

  modal.classList.add('active');
  modal.style.display = 'flex';
};

window.confirmPauseConsultation = function(uhid) {
  const patient = state.patients.find(p => p.uhid === uhid);

  // Build and show custom confirmation popup
  let modal = document.getElementById('emr-action-confirm-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'emr-action-confirm-modal';
    modal.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;background:rgba(15,23,42,0.65);z-index:10000;display:flex;align-items:center;justify-content:center;';
    document.body.appendChild(modal);
  }

  modal.innerHTML = `
    <div style="background:#fff;border-radius:12px;padding:2rem;max-width:440px;width:90%;box-shadow:0 20px 60px rgba(0,0,0,0.25);text-align:center;" onclick="event.stopPropagation()">
      <div style="font-size:2.5rem;margin-bottom:1rem;">⏸️</div>
      <h3 style="margin:0 0 0.5rem 0;font-size:1.1rem;font-weight:700;color:#1e3a8a;">Pause Consultation?</h3>
      <p style="font-size:0.85rem;color:#64748b;line-height:1.6;margin:0 0 1.25rem 0;">
        The current session for <strong>${patient ? patient.name : 'this patient'}</strong> will be paused and all clinical data saved temporarily.<br>You can resume it anytime from the queue.
      </p>
      <div style="display:flex;gap:0.75rem;">
        <button onclick="document.getElementById('emr-action-confirm-modal').style.display='none';" style="flex:1;padding:0.65rem;border-radius:8px;border:1px solid #e2e8f0;background:#f8fafc;color:#475569;font-weight:600;font-size:0.85rem;cursor:pointer;">Cancel</button>
        <button id="pause-ok-btn" style="flex:1;padding:0.65rem;border-radius:8px;border:none;background:#d97706;color:#fff;font-weight:700;font-size:0.85rem;cursor:pointer;">✅ OK, Pause</button>
      </div>
    </div>
  `;
  modal.style.display = 'flex';

  document.getElementById('pause-ok-btn').onclick = function() {
    if (patient && window.activeConsultation) {
      patient.clinicalData = patient.clinicalData || {};
      patient.clinicalData.symptoms = window.activeConsultation.symptoms;
      patient.clinicalData.findings = window.activeConsultation.findings;
      patient.clinicalData.diagnosis = window.activeConsultation.diagnostics.join(', ');
      patient.clinicalData.treatmentPlan = window.activeConsultation.instructions.join('\n');
      patient.clinicalData.carePlan = window.activeConsultation.instructions.join('\n');
      if (window.activeConsultation.ancData) {
        patient.ancData = window.activeConsultation.ancData;
      }
      patient.status = 'Paused';
    }
    window.activeConsultationStarted = false;
    if (typeof window.setDistractionFreeMode === 'function') window.setDistractionFreeMode(false);
    window.closeConsultationExitModal();
    modal.style.display = 'none';
    window.activeEmrTab = 'queue';
    if (window.router) {
      window.router.navigate('emr');
    } else {
      window.location.hash = 'emr';
    }
  };
};

window.confirmExitConsultation = function(targetHash, hasUnsavedChanges) {
  const patient = window.activeConsultation ? state.patients.find(p => p.uhid === window.activeConsultation.uhid) : null;

  // Build and show custom confirmation popup
  let modal = document.getElementById('emr-action-confirm-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'emr-action-confirm-modal';
    modal.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;background:rgba(15,23,42,0.65);z-index:10000;display:flex;align-items:center;justify-content:center;';
    document.body.appendChild(modal);
  }

  modal.innerHTML = `
    <div style="background:#fff;border-radius:12px;padding:2rem;max-width:440px;width:90%;box-shadow:0 20px 60px rgba(0,0,0,0.25);text-align:center;" onclick="event.stopPropagation()">
      <div style="font-size:2.5rem;margin-bottom:1rem;">🚪</div>
      <h3 style="margin:0 0 0.5rem 0;font-size:1.1rem;font-weight:700;color:#991b1b;">Exit & Abandon Changes?</h3>
      <p style="font-size:0.85rem;color:#64748b;line-height:1.6;margin:0 0 0.75rem 0;">
        You are about to exit the consultation for <strong>${patient ? patient.name : 'this patient'}</strong>.
      </p>
      ${hasUnsavedChanges ? `
        <div style="background:#fee2e2;color:#991b1b;padding:0.75rem;border-radius:6px;font-size:0.8rem;margin-bottom:1rem;text-align:left;">
          ⚠️ <strong>Warning:</strong> You have unsaved clinical data. Exiting will permanently discard these changes.
        </div>
      ` : `
        <div style="background:#f0fdf4;color:#166534;padding:0.75rem;border-radius:6px;font-size:0.8rem;margin-bottom:1rem;">
          ✅ No unsaved changes detected.
        </div>
      `}
      <div style="display:flex;gap:0.75rem;">
        <button onclick="document.getElementById('emr-action-confirm-modal').style.display='none';" style="flex:1;padding:0.65rem;border-radius:8px;border:1px solid #e2e8f0;background:#f8fafc;color:#475569;font-weight:600;font-size:0.85rem;cursor:pointer;">Cancel</button>
        <button id="exit-ok-btn" style="flex:1;padding:0.65rem;border-radius:8px;border:none;background:#ef4444;color:#fff;font-weight:700;font-size:0.85rem;cursor:pointer;">🚪 OK, Exit</button>
      </div>
    </div>
  `;
  modal.style.display = 'flex';

  document.getElementById('exit-ok-btn').onclick = function() {
    if (patient && patient.status !== 'Completed' && patient.status !== 'Paused') {
      patient.status = 'Checked In';
    }
    window.activeConsultationStarted = false;
    if (typeof window.setDistractionFreeMode === 'function') window.setDistractionFreeMode(false);
    window.closeConsultationExitModal();
    modal.style.display = 'none';
    if (window.router) {
      window.router.navigate('emr');
    } else {
      window.ignoreNextHashChange = true;
      window.location.hash = 'emr';
    }
  };
};

window.closeConsultationExitModal = function() {
  const modal = document.getElementById('consultation-exit-modal');
  if (modal) {
    modal.classList.remove('active');
    modal.style.display = 'none';
  }
};

// Add tab close warning browser interceptor
window.addEventListener('beforeunload', (e) => {
  if (window.activeConsultationStarted && window.activeConsultation) {
    const patient = state.patients.find(p => p.uhid === window.activeConsultation.uhid);
    if (window.checkUnsavedChanges(patient)) {
      e.preventDefault();
      e.returnValue = 'You have unsaved changes in the active patient consultation. Are you sure you want to close this tab?';
      return e.returnValue;
    }
  }
});

