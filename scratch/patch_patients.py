import re

filepath = "/Users/home/Desktop/Saronil IHS/Updated HIS /assets/js/views/patientsView.js"

with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

# 1. We replace ensure307PatientsExist, renderMasterPatientRegistry, renderListView, renderListRow, renderRowAlertBadges, etc.
# Let's locate the boundary
start_marker = "function ensure307PatientsExist() {"
end_marker = "// 2. CORE PATIENT DETAILS PAGE"

start_idx = content.find(start_marker)
end_idx = content.find(end_marker)

if start_idx == -1 or end_idx == -1:
    print("ERROR: Markers not found!")
    exit(1)

new_code = """function ensure307PatientsExist() {
  const state = window.state || {};
  if (state.patients && state.patients.length >= 300) {
    return;
  }

  // Prepopulate exactly the 6 required dummy patients
  const dummyPatients = [
    {
      uhid: "MRC-240001",
      name: "Rajesh Kumar",
      age: 45,
      gender: "Male",
      bloodGroup: "B+",
      mobile: "+91 98765 43210",
      type: "IPD",
      ward: "Ward A",
      bed: "A-204",
      los: 3,
      primaryConsultant: "Dr. Ramesh Kumar",
      department: "Cardiology",
      payer: "Star Health",
      payerType: "TPA",
      preAuthStatus: "LOA ✓",
      alerts: ["Critical", "Pending labs"],
      newsScore: 6,
      status: "Admitted",
      lastActivity: "Vitals · 10:15 AM",
      vitals: { bp: "120/80", hr: 72, temp: 98.4, spo2: 98, weight: 70, bmi: 22.8, pain: 0, rr: 16 },
      prescriptions: [
        { name: "Tab Pantocid 40mg", dose: "1 tab", freq: "Once daily (Before breakfast)", duration: "10 Days", generic: "Pantoprazole", route: "Oral", active: true, scheduler: "H" }
      ],
      clinicalData: { complaint: "General chest discomfort", hpi: "None", examination: "NAD", diagnosis: "Evaluation", treatmentPlan: "Monitoring", carePlan: "Routine check" },
      history: { pastConditions: "None", surgeries: "None", familyHistory: "None" },
      ipNumber: "IP-2026-004821",
      opNumber: "—", emNumber: "—", dcNumber: "—",
      dischargedToday: false, readmission: false,
      dischargeClearances: { clinical: false, billing: false, summaryReady: false }
    },
    {
      uhid: "MRC-240002",
      name: "Priya Sharma",
      age: 32,
      gender: "Female",
      bloodGroup: "O+",
      mobile: "+91 98765 43210",
      type: "OPD",
      ward: "—",
      bed: "—",
      los: null,
      primaryConsultant: "Dr. Ritu S.",
      department: "Psychiatry",
      payer: "United India",
      payerType: "TPA",
      preAuthStatus: "LOA ✓",
      alerts: ["Follow-up due"],
      newsScore: null,
      status: "Completed",
      lastActivity: "Progress note · 09:30 AM",
      vitals: { bp: "118/76", hr: 80, temp: 98.2, spo2: 99, weight: 58, bmi: 21.3, pain: 0, rr: 14 },
      prescriptions: [],
      clinicalData: { complaint: "Anxiety symptoms", hpi: "None", examination: "NAD", diagnosis: "Generalized anxiety", treatmentPlan: "Therapy", carePlan: "Regular follow-ups" },
      history: { pastConditions: "None", surgeries: "None", familyHistory: "None" },
      ipNumber: "—", opNumber: "OP-2026-001092", emNumber: "—", dcNumber: "—",
      dischargedToday: false, readmission: false,
      dischargeClearances: { clinical: false, billing: false, summaryReady: false }
    },
    {
      uhid: "MRC-240019",
      name: "Kavitha Nair",
      age: 44,
      gender: "Female",
      bloodGroup: "AB+",
      mobile: "+91 98765 43210",
      type: "Emergency",
      ward: "Emergency Bay",
      bed: "Resus-1",
      los: 1,
      primaryConsultant: "Dr. Vikram S.",
      department: "General Medicine",
      payer: "Self Pay",
      payerType: "Self Pay",
      preAuthStatus: null,
      alerts: ["MLC Case", "Pending labs"],
      newsScore: 4,
      status: "Under Treatment",
      lastActivity: "Lab order · 08:47 AM",
      vitals: { bp: "130/85", hr: 96, temp: 99.0, spo2: 97, weight: 64, bmi: 24.1, pain: 2, rr: 18 },
      prescriptions: [],
      clinicalData: { complaint: "RTA injury", hpi: "Involved in a two-wheeler accident", examination: "Laceration on right forearm", diagnosis: "RTA with minor trauma", treatmentPlan: "Wound care, MLC checklist", carePlan: "Under observation" },
      history: { pastConditions: "None", surgeries: "None", familyHistory: "None" },
      ipNumber: "—", opNumber: "—", emNumber: "EM-2026-000491", dcNumber: "—",
      dischargedToday: false, readmission: false,
      dischargeClearances: { clinical: false, billing: false, summaryReady: false }
    },
    {
      uhid: "MRC-240020",
      name: "Arjun Mehta",
      age: 58,
      gender: "Male",
      bloodGroup: "A+",
      mobile: "+91 98765 43210",
      type: "IPD",
      ward: "Ward B",
      bed: "B-108",
      los: 7,
      primaryConsultant: "Dr. Ramesh Kumar",
      department: "Cardiology",
      payer: "HDFC Ergo",
      payerType: "TPA",
      preAuthStatus: "Query raised",
      alerts: ["Discharge pending", "Bill hold"],
      newsScore: null,
      status: "Discharge Pending",
      lastActivity: "Note · Yesterday",
      vitals: null,
      prescriptions: [],
      clinicalData: { complaint: "Post-PTCA recovery", hpi: "None", examination: "Clinically stable", diagnosis: "CAD Post-PTCA", treatmentPlan: "Discharge instructions", carePlan: "Cardiac rehab" },
      history: { pastConditions: "CAD", surgeries: "PTCA (2026)", familyHistory: "Heart Disease" },
      ipNumber: "IP-2026-004829",
      opNumber: "—", emNumber: "—", dcNumber: "—",
      dischargedToday: false, readmission: false,
      dischargeClearances: { clinical: true, billing: false, summaryReady: true }
    },
    {
      uhid: "MRC-240017",
      name: "Meena Iyer",
      age: 29,
      gender: "Female",
      bloodGroup: "B-",
      mobile: "+91 98765 43210",
      type: "IPD",
      ward: "Ward A",
      bed: "A-201",
      los: 2,
      primaryConsultant: "Dr. Ananya R.",
      department: "Neurology",
      payer: "Self Pay",
      payerType: "Self Pay",
      preAuthStatus: null,
      alerts: [],
      newsScore: 2,
      status: "Admitted",
      lastActivity: "Vitals · 11:00 AM",
      vitals: { bp: "120/78", hr: 70, temp: 98.4, spo2: 99, weight: 54, bmi: 20.2, pain: 0, rr: 14 },
      prescriptions: [],
      clinicalData: { complaint: "Migraine headache", hpi: "Intense throbbing headache", examination: "Normal neuro exam", diagnosis: "Migraine status", treatmentPlan: "Analgesics and IV fluids", carePlan: "Avoid triggers" },
      history: { pastConditions: "Migraine", surgeries: "None", familyHistory: "None" },
      ipNumber: "IP-2026-004812",
      opNumber: "—", emNumber: "—", dcNumber: "—",
      dischargedToday: false, readmission: false,
      dischargeClearances: { clinical: false, billing: false, summaryReady: false }
    },
    {
      uhid: "MRC-240021",
      name: "Suresh Patel",
      age: 62,
      gender: "Male",
      bloodGroup: "A+",
      mobile: "+91 98765 43210",
      type: "IPD",
      ward: "Ward C",
      bed: "C-305",
      los: 1,
      primaryConsultant: "Dr. Mohan V.",
      department: "General Surgery",
      payer: "CGHS",
      payerType: "CGHS",
      preAuthStatus: "Pensioner",
      alerts: ["Pre-auth pending"],
      newsScore: 3,
      status: "Pre-op",
      lastActivity: "Admitted · 07:30 AM",
      vitals: { bp: "140/90", hr: 82, temp: 98.6, spo2: 96, weight: 76, bmi: 26.3, pain: 1, rr: 16 },
      prescriptions: [],
      clinicalData: { complaint: "Calculous cholecystitis", hpi: "Right upper quadrant pain", examination: "Murphy's sign positive", diagnosis: "Cholelithiasis", treatmentPlan: "Laparoscopic cholecystectomy", carePlan: "Pre-op checklist" },
      history: { pastConditions: "None", surgeries: "None", familyHistory: "None" },
      ipNumber: "IP-2026-004835",
      opNumber: "—", emNumber: "—", dcNumber: "—",
      dischargedToday: false, readmission: false,
      dischargeClearances: { clinical: false, billing: false, summaryReady: false }
    }
  ];

  const firstNames = ["Rajesh", "Priya", "Amit", "Kavitha", "Karan", "Sunita", "Vikram", "Sanjay", "Ananya", "Ritu", "Deepak", "Meena", "Suresh", "Arjun", "Neelam", "Vijay", "Jyoti", "Harish", "Aparna", "Rahul", "Pooja", "Rohan", "Shalini", "Aditya", "Divya", "Manish", "Komal", "Sandeep", "Swati", "Pranav", "Neha"];
  const lastNames = ["Kumar", "Sharma", "Singh", "Nair", "Patel", "Rao", "Joshi", "Gupta", "Verma", "Mehta", "Iyer", "Pillai", "Shah", "Das", "Reddy", "Choudhury", "Bose", "Mishra", "Pandey", "Chatterjee", "Kulkarni", "Deshmukh", "Menon", "Sen", "Bahl", "Malhotra", "Kapoor"];
  const bloodGroups = ["A+", "B+", "O+", "AB+", "A-", "B-", "O-", "AB-"];
  const depts = ["Cardiology", "General Medicine", "Pediatrics", "Psychiatry", "Neurology", "General Surgery", "Orthopedics", "Nephrology", "Gynecology"];
  
  const docNames = {
    "Cardiology": "Dr. Ramesh Kumar",
    "General Medicine": "Dr. Vikram S.",
    "Pediatrics": "Dr. Sunita Patil",
    "Psychiatry": "Dr. Ritu S.",
    "Neurology": "Dr. K. N. Iyer",
    "General Surgery": "Dr. Alok Sen",
    "Orthopedics": "Dr. Sandeep Shah",
    "Nephrology": "Dr. Amit Verma",
    "Gynecology": "Dr. Shalini Gupta"
  };

  const ipdWards = ["Ward A", "Ward B", "Ward C", "ICU"];
  const erBays = ["Emergency Bay · Resus-1", "Emergency Bay · Bed 2", "Emergency Bay · Bed 3"];
  const dcWards = ["Day Care Unit · Bed 1", "Day Care Unit · Bed 2"];
  
  const payers = [
    { type: "Self Pay", name: "Cash Tariff" },
    { type: "TPA", name: "Star Health" },
    { type: "TPA", name: "United India" },
    { type: "TPA", name: "HDFC Ergo" },
    { type: "PMJAY", name: "NHA Scheme" },
    { type: "CGHS", name: "Pensioner" },
    { type: "ECHS", name: "Veteran Welfare" },
    { type: "ESI", name: "Corp Scheme" },
    { type: "Company", name: "Tata Motors" },
    { type: "Charity", name: "Saronil Trust" }
  ];

  const patients = [...dummyPatients];
  let index = 1;
  const randomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];

  let generatedIpd = patients.filter(p => p.type === 'IPD' && p.status === 'Admitted').length;
  let generatedOpd = patients.filter(p => p.type === 'OPD' && p.status === 'Completed').length;
  let generatedEr = patients.filter(p => p.type === 'Emergency').length;
  let generatedDc = patients.filter(p => p.type === 'Daycare').length;
  let generatedUpcoming = 0;
  let generatedDischargedToday = 0;
  let generatedCritical = patients.filter(p => p.newsScore >= 5).length;
  let generatedMlc = patients.filter(p => p.alerts && p.alerts.includes('MLC Case')).length;
  let generatedDischargePending = patients.filter(p => p.status === 'Discharge Pending').length;

  while (patients.length < 307) {
    const fn = randomItem(firstNames);
    const ln = randomItem(lastNames);
    const name = `${fn} ${ln}`;
    if (dummyPatients.some(dp => dp.name === name)) continue;

    const age = randomRange(18, 85);
    const gender = randomItem(["Male", "Female"]);
    const bloodGroup = randomItem(bloodGroups);
    const mobile = `+91 ${randomRange(7000, 9999)}0 ${randomRange(10000, 99999)}`;
    const uhid = `MRC-24${String(100 + index).padStart(4, '0')}`;

    let type = "OPD";
    let status = "Completed";
    let dischargedToday = false;
    let isCritical = false;
    let newsScore = null;
    let alerts = [];
    let ward = "—";
    let bed = "—";
    let los = null;
    let lastActivity = "Vitals · 11:00 AM";

    if (generatedIpd < 24) {
      type = "IPD";
      status = "Admitted";
      generatedIpd++;
      ward = randomItem(ipdWards);
      bed = `${ward.split(' ').pop().substring(0, 1)}-${randomRange(100, 299)}`;
      los = randomRange(2, 16);

      if (generatedCritical < 2) {
        newsScore = randomRange(5, 7);
        isCritical = true;
        alerts.push("Critical");
        generatedCritical++;
      } else if (generatedMlc < 1) {
        alerts.push("MLC Case");
        generatedMlc++;
      } else if (generatedDischargePending < 3) {
        status = "Discharge Pending";
        alerts.push("Discharge pending");
        generatedDischargePending++;
      } else {
        newsScore = randomRange(0, 4);
      }
    } else if (generatedOpd < 85) {
      type = "OPD";
      status = "Completed";
      generatedOpd++;
    } else if (generatedEr < 2) {
      type = "Emergency";
      status = "Under Treatment";
      generatedEr++;
      ward = "Emergency Bay";
      bed = `Resus-${generatedEr}`;
      newsScore = randomRange(1, 4);
      los = 1;
    } else if (generatedDc < 4) {
      type = "Daycare";
      status = "In Procedure";
      generatedDc++;
      ward = "Day Care Unit";
      bed = `DC-${String(generatedDc).padStart(2, '0')}`;
    } else if (generatedUpcoming < 23) {
      type = "OPD";
      status = "In Queue";
      generatedUpcoming++;
    } else if (generatedDischargedToday < 4) {
      type = "IPD";
      status = "Discharged";
      dischargedToday = true;
      generatedDischargedToday++;
    } else {
      type = "OPD";
      status = "Completed";
    }

    const payerDetail = randomItem(payers);
    let payer = payerDetail.name;
    let payerType = payerDetail.type;
    let preAuthStatus = null;
    
    if (payerType === "TPA") {
      preAuthStatus = randomItem(["LOA ✓", "LOA pending", "Pre-auth expired", "Query raised"]);
    } else if (payerType !== "Self Pay") {
      preAuthStatus = "Not required";
    }

    const ipNumber = type === "IPD" ? `IP-2026-${String(100 + index).padStart(6, '0')}` : "—";
    const opNumber = type === "OPD" ? `OP-2026-${String(100 + index).padStart(6, '0')}` : "—";
    const emNumber = type === "Emergency" ? `EM-2026-${String(100 + index).padStart(6, '0')}` : "—";
    const dcNumber = type === "Daycare" ? `DC-2026-${String(100 + index).padStart(6, '0')}` : "—";

    const dept = randomItem(depts);
    const doc = docNames[dept];

    if (index % 11 === 0 && type === "IPD") {
      lastActivity = "Progress note · Yesterday";
    }

    patients.push({
      uhid,
      name,
      age,
      gender,
      type,
      mobile,
      bloodGroup,
      allergies: (index % 7 === 0) ? "Penicillin, Sulpha drugs" : "No Known Allergies",
      payer,
      payerType,
      preAuthStatus,
      primaryConsultant: doc,
      department: dept,
      status,
      vitals: { bp: "120/80", hr: 72, temp: 98.4, spo2: 98, weight: 70, bmi: 22.8, pain: 0, rr: 16 },
      clinicalData: { complaint: "General weakness and fatigue", hpi: "None", examination: "NAD", diagnosis: "Anemia under evaluation", treatmentPlan: "Routine investigations", carePlan: "Under monitoring" },
      prescriptions: [
        { name: "Tab Pantocid 40mg", dose: "1 tab", freq: "Once daily (Before breakfast)", duration: "10 Days", generic: "Pantoprazole", route: "Oral", active: true, scheduler: "H" }
      ],
      history: { pastConditions: "Hypertension (managed on medication)", surgeries: "Appendectomy (2020)", familyHistory: "Type 2 Diabetes Mellitus" },
      ward,
      bed,
      alerts,
      newsScore,
      isCritical,
      lastActivity,
      dischargedToday,
      dischargeClearances: { clinical: dischargedToday, billing: dischargedToday, summaryReady: dischargedToday },
      ipNumber,
      opNumber,
      emNumber,
      dcNumber,
      los
    });

    index++;
  }

  state.patients = patients;
  localStorage.setItem('saronil_patients', JSON.stringify(patients));
}

function randomRange(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function ensurePatientEMRInitialized(patient) {
  if (!patient) return;
  patient.timelineEvents = patient.timelineEvents || [];
  patient.prescriptions = patient.prescriptions || [];
  patient.dischargeClearances = patient.dischargeClearances || { clinical: false, billing: false, summaryReady: false };
  if (!patient.vitals) {
    patient.vitals = { bp: "120/80", hr: 72, temp: 98.4, spo2: 98, weight: 70, bmi: 22.8, pain: 0, rr: 16 };
  }
}

// --------------------------------------------------------------------------
// 1. MASTER PATIENT REGISTRY (PART A)
// --------------------------------------------------------------------------
function renderMasterPatientRegistry(container) {
  const state = window.state || {};
  ensure307PatientsExist();
  
  window.activeRegistryTab = window.activeRegistryTab || 'all';
  window.registryCurrentPage = window.registryCurrentPage || 1;
  window.activeAlertFilter = window.activeAlertFilter || '';

  const patientsList = state.patients || [];
  const doctorsList = state.doctors || [];

  const totalCount = patientsList.length;
  const ipdActiveCount = patientsList.filter(p => p.type === 'IPD' && p.status === 'Admitted').length;
  const opdTodayCount = patientsList.filter(p => p.type === 'OPD' && p.status === 'Completed').length;
  const emActiveCount = patientsList.filter(p => p.type === 'Emergency' && p.status === 'Under Treatment').length;
  const dcActiveCount = patientsList.filter(p => p.type === 'Daycare' && p.status !== 'Discharged').length;
  const dischargedTodayCount = patientsList.filter(p => p.dischargedToday === true).length;
  const criticalCount = patientsList.filter(p => p.newsScore >= 5).length;
  const mlcCount = patientsList.filter(p => p.alerts && p.alerts.some(a => a.toLowerCase().includes('mlc'))).length;
  const dischargePendingCount = patientsList.filter(p => p.status === 'Discharge Pending').length;

  container.innerHTML = `
    <style>
      .hdr-action-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1rem;
      }
      
      .filter-pill-container {
        display: flex;
        gap: 0.45rem;
        overflow-x: auto;
        padding-bottom: 0.5rem;
        margin-bottom: 1rem;
      }
      .filter-pill {
        background: #ffffff;
        border: 1px solid #cbd5e1;
        color: #475569;
        font-size: 0.76rem;
        font-weight: 500;
        padding: 6px 12px;
        border-radius: 20px;
        cursor: pointer;
      }
      .filter-pill.active {
        background: #0f172a;
        color: #ffffff;
        border-color: #0f172a;
      }
      
      .custom-table th {
        font-family: 'Inter', sans-serif;
        font-weight: 600;
        text-transform: uppercase;
        font-size: 0.65rem;
        letter-spacing: 0.05em;
        color: #475569;
        background: #f8fafc;
        border-bottom: 1px solid #cbd5e1;
        padding: 10px 8px;
        text-align: left;
        position: sticky;
        top: 0;
        z-index: 10;
      }
      .custom-table td {
        padding: 10px 8px;
        border-bottom: 1px solid #e2e8f0;
        vertical-align: middle;
      }
      
      .p-row-item {
        cursor: pointer;
        height: 72px;
      }
      .p-row-item:hover {
        background-color: #f8fafc;
      }
      .p-row-critical { border-left: 3px solid #ef4444 !important; }
      .p-row-mlc { border-left: 3px solid #a855f7 !important; }
      .p-row-discharge-pending { border-left: 3px solid #f59e0b !important; }

      .news-badge-circle {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 24px;
        height: 24px;
        border-radius: 50%;
        font-weight: 700;
        font-size: 0.75rem;
        color: #ffffff;
        cursor: pointer;
      }
      .bg-news-green { background: #10b981; }
      .bg-news-amber { background: #f59e0b; }
      .bg-news-red { background: #ef4444; }
      
      .kpi-grid {
        display: grid;
        grid-template-columns: repeat(6, 1fr);
        gap: 0.75rem;
        margin-bottom: 1.25rem;
      }
      .kpi-card {
        background: #ffffff;
        border: 1px solid #cbd5e1;
        border-radius: 8px;
        padding: 0.75rem 1rem;
        box-shadow: 0 1px 3px rgba(0,0,0,0.05);
        display: flex;
        flex-direction: column;
        gap: 2px;
      }
      .kpi-card.critical-card {
        border: 1px solid #fca5a5;
        background: #fef2f2;
      }
      .kpi-card.critical-card .kpi-val {
        color: #ef4444;
      }
      .kpi-val {
        font-family: 'JetBrains Mono', monospace;
        font-size: 1.6rem;
        font-weight: 800;
        color: #0f172a;
        line-height: 1.2;
      }
      .kpi-label {
        font-size: 0.75rem;
        font-weight: 700;
        color: #64748b;
        text-transform: uppercase;
        letter-spacing: 0.3px;
      }
      .kpi-sub {
        font-size: 0.68rem;
        color: #64748b;
      }
      .more-filters-box {
        display: none;
        grid-template-columns: repeat(4, 1fr);
        gap: 0.75rem;
        padding: 1rem;
        background: #f8fafc;
        border-top: 1px solid #cbd5e1;
        border-bottom-left-radius: 8px;
        border-bottom-right-radius: 8px;
      }
    </style>

    <div class="hdr-action-row">
      <h1 style="font-size: 20px; font-weight: 800; margin: 0; color: #0f172a;">Patients</h1>
      <button class="btn btn-primary" onclick="window.createNewPatient()" style="font-size: 0.8rem; height: 34px; border-radius: 6px; padding: 0 12px; cursor: pointer; background: #2563eb; color: #ffffff; font-weight: 600; border: none;">+ New Patient</button>
    </div>

    <!-- KPI Summary Grid (6 cards) -->
    <div class="kpi-grid">
      <div class="kpi-card">
        <span class="kpi-label">IPD Active</span>
        <span class="kpi-val">${ipdActiveCount}</span>
        <span class="kpi-sub">Admitted patients</span>
      </div>
      <div class="kpi-card">
        <span class="kpi-label">OPD Today</span>
        <span class="kpi-val">${opdTodayCount}</span>
        <span class="kpi-sub">Completed visits</span>
      </div>
      <div class="kpi-card">
        <span class="kpi-label">Emergency Active</span>
        <span class="kpi-val">${emActiveCount}</span>
        <span class="kpi-sub">Under observation/trauma</span>
      </div>
      <div class="kpi-card">
        <span class="kpi-label">Daycare Today</span>
        <span class="kpi-val">${dcActiveCount}</span>
        <span class="kpi-sub">Procedures active</span>
      </div>
      <div class="kpi-card">
        <span class="kpi-label">Discharged Today</span>
        <span class="kpi-val">${dischargedTodayCount}</span>
        <span class="kpi-sub">Final clearance signed</span>
      </div>
      <div class="kpi-card critical-card">
        <span class="kpi-label">🔴 Critical</span>
        <span class="kpi-val">${criticalCount}</span>
        <span class="kpi-sub">NEWS &ge; 5 risk status</span>
      </div>
    </div>

    <!-- Filter Pills Strip (with counts) -->
    <div class="filter-pill-container" id="filter-pills-bar">
      <button class="filter-pill active" data-filter="all" onclick="window.switchRegistryPill(this, 'all')">All</button>
      <button class="filter-pill" data-filter="IPD" onclick="window.switchRegistryPill(this, 'IPD')">IPD (${ipdActiveCount})</button>
      <button class="filter-pill" data-filter="OPD" onclick="window.switchRegistryPill(this, 'OPD')">OPD (${opdTodayCount})</button>
      <button class="filter-pill" data-filter="Emergency" onclick="window.switchRegistryPill(this, 'Emergency')">Emergency (${emActiveCount})</button>
      <button class="filter-pill" data-filter="Daycare" onclick="window.switchRegistryPill(this, 'Daycare')">Daycare (${dcActiveCount})</button>
      <button class="filter-pill" data-filter="Discharged" onclick="window.switchRegistryPill(this, 'Discharged')">Discharged Today (${dischargedTodayCount})</button>
      <button class="filter-pill" data-filter="Critical" onclick="window.switchRegistryPill(this, 'Critical')">🔴 Critical (${criticalCount})</button>
      <button class="filter-pill" data-filter="MLC" onclick="window.switchRegistryPill(this, 'MLC')">MLC (${mlcCount})</button>
      <button class="filter-pill" data-filter="DischargePending" onclick="window.switchRegistryPill(this, 'DischargePending')">Discharge Pending (${dischargePendingCount})</button>
    </div>

    <!-- Search Box and secondary filters row -->
    <div class="card" style="margin-bottom: 1rem; border: 1px solid #cbd5e1; box-shadow: 0 1px 3px rgba(0,0,0,0.05); border-radius: 8px;">
      <div style="padding: 0.75rem 1rem; display: flex; gap: 0.5rem; flex-wrap: wrap; width: 100%; align-items: center;">
        <div style="position: relative; flex-grow: 1; min-width: 250px;">
          <span style="position: absolute; left: 12px; top: 50%; transform: translateY(-50%); font-size: 0.85rem; color: #94a3b8;">🔍</span>
          <input type="text" id="m-search" class="form-control" placeholder="Search by name, UHID, mobile number..." style="padding-left: 2.2rem; font-size: 0.82rem; height: 36px; border-radius: 6px; border: 1px solid #cbd5e1; width: 100%;">
          
          <div id="m-search-suggest-box" style="display: none; position: absolute; top: 40px; left: 0; right: 0; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 6px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); z-index: 9999; max-height: 200px; overflow-y: auto;">
          </div>
        </div>

        <button class="btn btn-secondary" onclick="window.toggleMoreFiltersPanel()" style="height: 36px; font-size: 0.82rem; padding: 0 0.75rem; border-radius: 6px; cursor: pointer; display: flex; align-items: center; gap: 0.25rem; border: 1px solid #cbd5e1; color: #334155; background: #ffffff; font-weight: 500;">
          ⚙️ More Filters
        </button>

        <span style="font-size: 0.78rem; font-weight: 700; color: #475569; margin-left: 10px;" id="roster-results-count-el"></span>

        <button class="btn btn-secondary" onclick="window.exportRegistryRoster()" style="margin-left: auto; height: 36px; font-size: 0.8rem; border: 1px solid #cbd5e1; background: #ffffff; color: #334155; padding: 0 12px; border-radius: 6px; font-weight: 600;">Export</button>
        <button class="btn btn-secondary" onclick="window.printRegistryRoster()" style="height: 36px; font-size: 0.8rem; border: 1px solid #cbd5e1; background: #ffffff; color: #334155; padding: 0 12px; border-radius: 6px; font-weight: 600;">Print</button>
      </div>

      <div class="more-filters-box" id="more-filters-panel-el">
        <div>
          <label style="font-size: 0.7rem; font-weight: 600; color: #64748b; text-transform: uppercase;">Department</label>
          <select id="mf-dept" class="form-select" style="height: 32px; font-size: 0.8rem; margin-top: 4px; border-radius: 4px; width: 100%;">
            <option value="">All Departments</option>
            <option value="Cardiology">Cardiology</option>
            <option value="General Medicine">General Medicine</option>
            <option value="Pediatrics">Pediatrics</option>
            <option value="Psychiatry">Psychiatry</option>
            <option value="Neurology">Neurology</option>
            <option value="General Surgery">General Surgery</option>
            <option value="Orthopedics">Orthopedics</option>
            <option value="Nephrology">Nephrology</option>
            <option value="Gynecology">Gynecology</option>
          </select>
        </div>
        <div>
          <label style="font-size: 0.7rem; font-weight: 600; color: #64748b; text-transform: uppercase;">Doctor</label>
          <select id="mf-doctor" class="form-select" style="height: 32px; font-size: 0.8rem; margin-top: 4px; border-radius: 4px; width: 100%;">
            <option value="">All Doctors</option>
            ${doctorsList.map(d => `<option value="${d.name}">${d.name} (${d.spec})</option>`).join('')}
          </select>
        </div>
        <div>
          <label style="font-size: 0.7rem; font-weight: 600; color: #64748b; text-transform: uppercase;">Ward/Room</label>
          <select id="mf-ward" class="form-select" style="height: 32px; font-size: 0.8rem; margin-top: 4px; border-radius: 4px; width: 100%;">
            <option value="">All Wards</option>
            <option value="Ward A">Ward A</option>
            <option value="Ward B">Ward B</option>
            <option value="Ward C">Ward C</option>
            <option value="ICU">ICU</option>
          </select>
        </div>
        <div>
          <label style="font-size: 0.7rem; font-weight: 600; color: #64748b; text-transform: uppercase;">Payer Category</label>
          <select id="mf-payer-type" class="form-select" style="height: 32px; font-size: 0.8rem; margin-top: 4px; border-radius: 4px; width: 100%;">
            <option value="">All Payer Categories</option>
            <option value="Self Pay">Self Pay</option>
            <option value="TPA">TPA</option>
            <option value="CGHS">CGHS</option>
            <option value="ECHS">ECHS</option>
            <option value="PMJAY">PMJAY</option>
            <option value="ESI">ESI</option>
            <option value="Company">Company</option>
            <option value="Charity">Charity</option>
          </select>
        </div>
        <div style="grid-column: span 4; display: flex; align-items: center; padding-top: 0.25rem; border-top: 1px solid #cbd5e1; margin-top: 4px;">
          <button class="btn btn-secondary btn-sm" onclick="window.clearMoreFilters()" style="margin-left: auto; padding: 4px 12px; border-radius: 4px; font-size: 0.75rem; height: 28px; border: 1px solid #cbd5e1; background: #ffffff; color: #334155; cursor: pointer;">Clear Filters</button>
        </div>
      </div>
    </div>

    <!-- Active Roster Workspace -->
    <div id="roster-view-workspace-el" style="overflow-x: auto; width: 100%; border: 1px solid #cbd5e1; border-radius: 8px; background: #ffffff;">
    </div>

    <div id="m-pagination" style="display: flex; justify-content: space-between; align-items: center; margin-top: 1rem; padding: 0.5rem 1rem;">
    </div>
  `;

  const searchInput = document.getElementById('m-search');
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      window.registryCurrentPage = 1;
      handleSearchSuggestAndFilter();
    });
  }

  const mfDept = document.getElementById('mf-dept'); if (mfDept) mfDept.addEventListener('change', () => window.filterMasterRegistry(true));
  const mfDoctor = document.getElementById('mf-doctor'); if (mfDoctor) mfDoctor.addEventListener('change', () => window.filterMasterRegistry(true));
  const mfWard = document.getElementById('mf-ward'); if (mfWard) mfWard.addEventListener('change', () => window.filterMasterRegistry(true));
  const mfPayer = document.getElementById('mf-payer-type'); if (mfPayer) mfPayer.addEventListener('change', () => window.filterMasterRegistry(true));

  window.filterMasterRegistry();
}

window.filterMasterRegistry = function(resetPage = false) {
  const state = window.state || {};
  const patientsList = state.patients || [];
  
  if (resetPage) {
    window.registryCurrentPage = 1;
  }

  const query = document.getElementById('m-search')?.value.toLowerCase().trim() || '';
  const deptVal = document.getElementById('mf-dept')?.value || '';
  const docVal = document.getElementById('mf-doctor')?.value || '';
  const wardVal = document.getElementById('mf-ward')?.value || '';
  const payerTypeVal = document.getElementById('mf-payer-type')?.value || '';
  const alertTypeVal = window.activeAlertFilter;

  const activeTab = window.activeRegistryTab || 'all';

  const filtered = patientsList.filter(p => {
    const visitId = p.type === 'IPD' ? p.ipNumber : (p.type === 'OPD' ? p.opNumber : (p.type === 'Emergency' ? p.emNumber : p.dcNumber));
    
    let matchQuery = true;
    if (query.length >= 3) {
      matchQuery = p.name.toLowerCase().includes(query) ||
        p.uhid.toLowerCase().includes(query) ||
        (p.mobile && p.mobile.includes(query)) ||
        (visitId && visitId.toLowerCase().includes(query));
    }

    let matchTab = true;
    if (activeTab === 'IPD') matchTab = p.type === 'IPD' && p.status === 'Admitted';
    else if (activeTab === 'OPD') matchTab = p.type === 'OPD' && p.status !== 'Scheduled';
    else if (activeTab === 'Emergency') matchTab = p.type === 'Emergency' && p.status !== 'Discharged';
    else if (activeTab === 'Daycare') matchTab = p.type === 'Daycare' && p.status !== 'Discharged';
    else if (activeTab === 'Discharged') matchTab = p.dischargedToday === true;
    else if (activeTab === 'Critical') matchTab = p.newsScore >= 5;
    else if (activeTab === 'MLC') matchTab = p.alerts && p.alerts.some(a => a.toLowerCase().includes('mlc'));
    else if (activeTab === 'DischargePending') matchTab = p.status === 'Discharge Pending';

    const matchDept = !deptVal || p.department === deptVal;
    const matchDoc = !docVal || p.primaryConsultant === docVal;
    const matchWard = !wardVal || (p.ward && p.ward.toLowerCase().includes(wardVal.toLowerCase()));
    const matchPayerType = !payerTypeVal || p.payerType === payerTypeVal;
    
    let matchAlert = true;
    if (alertTypeVal) {
      if (alertTypeVal === 'Critical') matchAlert = p.newsScore >= 5;
      else if (alertTypeVal === 'Discharge pending') matchAlert = p.status === 'Discharge Pending';
      else matchAlert = p.alerts && p.alerts.includes(alertTypeVal);
    }

    return matchQuery && matchTab && matchDept && matchDoc && matchWard && matchPayerType && matchAlert;
  });

  const resultsCountEl = document.getElementById('roster-results-count-el');
  if (resultsCountEl) {
    resultsCountEl.textContent = `[${filtered.length} result${filtered.length !== 1 ? 's' : ''}]`;
  }

  const workspace = document.getElementById('roster-view-workspace-el');
  if (!workspace) return;

  const rowsPerPage = 25;
  const totalItems = filtered.length;
  const totalPages = Math.ceil(totalItems / rowsPerPage) || 1;

  if (window.registryCurrentPage > totalPages) window.registryCurrentPage = totalPages;
  if (window.registryCurrentPage < 1) window.registryCurrentPage = 1;

  const startIndex = (window.registryCurrentPage - 1) * rowsPerPage;
  const endIndex = Math.min(startIndex + rowsPerPage, totalItems);
  const pageData = filtered.slice(startIndex, endIndex);

  renderListView(workspace, pageData, query);
  renderPagination(totalItems, startIndex, endIndex, totalPages);
};

function handleSearchSuggestAndFilter() {
  const state = window.state || {};
  const patientsList = state.patients || [];
  const searchInput = document.getElementById('m-search');
  const query = searchInput.value.toLowerCase().trim();
  const suggestBox = document.getElementById('m-search-suggest-box');

  if (!query || query.length < 3) {
    suggestBox.style.display = 'none';
    window.filterMasterRegistry();
    return;
  }

  const suggestions = [];
  patientsList.forEach(p => {
    const visitId = p.type === 'IPD' ? p.ipNumber : (p.type === 'OPD' ? p.opNumber : (p.type === 'Emergency' ? p.emNumber : p.dcNumber));
    if (p.uhid.toLowerCase().includes(query)) {
      suggestions.push({ patient: p, type: 'UHID match', val: p.uhid });
    } else if (p.name.toLowerCase().includes(query)) {
      suggestions.push({ patient: p, type: 'Name match', val: p.name });
    } else if (visitId && visitId.toLowerCase().includes(query)) {
      suggestions.push({ patient: p, type: 'Visit match', val: visitId });
    } else if (p.mobile && p.mobile.includes(query)) {
      suggestions.push({ patient: p, type: 'Mobile match', val: p.mobile });
    }
  });

  const sliced = suggestions.slice(0, 5);
  if (sliced.length > 0) {
    suggestBox.innerHTML = sliced.map(s => `
      <div style="padding: 8px 12px; font-size: 0.8rem; cursor: pointer; border-bottom: 1px solid #f1f5f9;" onclick="window.selectSearchSuggestion('${s.patient.uhid}')">
        <span style="font-weight: 700; color: #0f172a;">${s.val}</span> — 
        <span style="color: #64748b; font-family: 'JetBrains Mono', monospace; font-size: 0.72rem;">${s.type} (${s.patient.name})</span>
      </div>
    `).join('');
    suggestBox.style.display = 'block';
  } else {
    suggestBox.style.display = 'none';
  }

  window.filterMasterRegistry();
}

window.selectSearchSuggestion = function(uhid) {
  const state = window.state || {};
  const patientsList = state.patients || [];
  const p = patientsList.find(pt => pt.uhid === uhid);
  if (p) {
    document.getElementById('m-search').value = p.uhid;
    document.getElementById('m-search-suggest-box').style.display = 'none';
    window.filterMasterRegistry(true);
  }
};

window.switchRegistryPill = function(btn, filterVal) {
  window.activeRegistryTab = filterVal;
  document.querySelectorAll('#filter-pills-bar button').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  if (!['Critical', 'MLC', 'DischargePending'].includes(filterVal)) {
    window.activeAlertFilter = '';
  }
  window.filterMasterRegistry(true);
};

window.filterByAlertSummary = function(alertType) {
  window.activeAlertFilter = alertType;
  let pillName = 'Critical';
  if (alertType.toLowerCase().includes('mlc')) pillName = 'MLC';
  else if (alertType.toLowerCase().includes('discharge pending')) pillName = 'DischargePending';
  
  const pillBtn = document.querySelector(`#filter-pills-bar button[data-filter="${pillName}"]`);
  if (pillBtn) {
    window.switchRegistryPill(pillBtn, pillName);
  } else {
    window.filterMasterRegistry(true);
  }
};

window.toggleMoreFiltersPanel = function() {
  const p = document.getElementById('more-filters-panel-el');
  if (p) {
    const isHidden = window.getComputedStyle(p).display === 'none';
    p.style.display = isHidden ? 'grid' : 'none';
  }
};

window.clearMoreFilters = function() {
  document.getElementById('mf-dept').value = '';
  document.getElementById('mf-doctor').value = '';
  document.getElementById('mf-ward').value = '';
  document.getElementById('mf-payer-type').value = '';
  window.activeAlertFilter = '';
  window.filterMasterRegistry(true);
};

function renderListView(container, patients, query) {
  container.innerHTML = `
    <table class="custom-table" style="font-size: 0.8rem; width: 100%; border-collapse: collapse; min-width: 1280px; table-layout: fixed;">
      <colgroup>
        <col style="width: 280px;">
        <col style="width: 160px;">
        <col style="width: 180px;">
        <col style="width: 180px;">
        <col style="width: 180px;">
        <col style="width: 70px;">
        <col style="width: 140px;">
        <col style="width: 150px;">
        <col style="width: 100px;">
      </colgroup>
      <thead>
        <tr>
          <th>Patient</th>
          <th>Ward / Bed</th>
          <th>Consultant / Dept</th>
          <th>Payer</th>
          <th>Alerts</th>
          <th>NEWS</th>
          <th>Status</th>
          <th>Last Activity</th>
          <th style="text-align: right; padding-right: 12px;">Action</th>
        </tr>
      </thead>
      <tbody>
        ${patients.map(p => renderListRow(p, query)).join('') || `<tr><td colspan="9" style="text-align: center; color: #64748b; padding: 3rem;">No patients matching filters.</td></tr>`}
      </tbody>
    </table>
  `;
}

function renderListRow(p, query) {
  const initials = p.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  const colors = ['#e11d48', '#7c3aed', '#2563eb', '#10b981', '#ea580c', '#0891b2', '#c026d3', '#475569'];
  let hash = 0;
  for (let i = 0; i < p.name.length; i++) hash = p.name.charCodeAt(i) + ((hash << 5) - hash);
  const avatarBg = colors[Math.abs(hash) % colors.length];

  const visitId = p.type === 'IPD' ? p.ipNumber : (p.type === 'OPD' ? p.opNumber : (p.type === 'Emergency' ? p.emNumber : p.dcNumber));
  
  // Highlight
  const dispName = highlightSearchTerm(p.name, query);
  const dispUhid = highlightSearchTerm(p.uhid, query);

  let rowBorderClass = '';
  if (p.newsScore >= 5) {
    rowBorderClass = 'p-row-critical';
  } else if (p.alerts && p.alerts.some(a => a.toLowerCase().includes('mlc'))) {
    rowBorderClass = 'p-row-mlc';
  } else if (p.status === 'Discharge Pending') {
    rowBorderClass = 'p-row-discharge-pending';
  }

  // Row background tint for last activity yesterday or earlier
  let rowBgStyle = '';
  if (p.lastActivity && p.lastActivity.toLowerCase().includes('yesterday')) {
    rowBgStyle = 'background-color: #fffbeb;';
  }

  // Payer Category styling
  const payerStyles = {
    "Self Pay": "background: #f1f5f9; color: #475569;",
    "TPA": "background: #dbeafe; color: #1e40af;",
    "CGHS": "background: #dcfce7; color: #15803d;",
    "ECHS": "background: #ccfbf1; color: #0f766e;",
    "PMJAY": "background: #f3e8ff; color: #6b21a8;",
    "ESI": "background: #ffedd5; color: #c2410c;",
    "Company": "background: #e2e8f0; color: #334155;",
    "Railway": "background: #fef3c7; color: #92400e;",
    "Charity": "background: #fce7f3; color: #9d174d;"
  };
  const payerBadgeStyle = payerStyles[p.payerType] || "background: #e2e8f0; color: #334155;";

  // Pre-auth / advance details
  let payerInfoHtml = '';
  if (p.payerType === 'Self Pay') {
    payerInfoHtml = `<div style="font-size: 11px; color: #64748b; font-family: 'JetBrains Mono', monospace; margin-top: 2px;">Cash Tariff</div>`;
  } else if (p.preAuthStatus) {
    let authColor = "#64748b;";
    if (p.preAuthStatus.includes('✓')) authColor = "#10b981;";
    else if (p.preAuthStatus.includes('pending')) authColor = "#f59e0b;";
    else if (p.preAuthStatus.includes('expired')) authColor = "#ef4444;";
    else if (p.preAuthStatus.includes('raised')) authColor = "#ea580c;";

    payerInfoHtml = `
      <div style="font-size: 11px; color: #64748b; font-family: 'JetBrains Mono', monospace; margin-top: 2px;">${p.payer}</div>
      <div style="font-size: 11px; font-weight: 700; color: ${authColor}">${p.preAuthStatus}</div>
    `;
  } else {
    payerInfoHtml = `<div style="font-size: 11px; color: #64748b; font-family: 'JetBrains Mono', monospace; margin-top: 2px;">${p.payer}</div>`;
  }

  // Visit Type and Blood Group Styles
  const typeColors = {
    "IPD": "background: #4f46e5; color: #ffffff;",
    "OPD": "background: #0ea5e9; color: #ffffff;",
    "Emergency": "background: #ef4444; color: #ffffff;",
    "Daycare": "background: #0d9488; color: #ffffff;"
  };
  let visitBadgeStyle = (typeColors[p.type] || "background: #64748b; color: #ffffff;") + " padding: 1px 6px; border-radius: 12px; font-size: 11px; font-weight: 600; display: inline-block; margin-left: 6px; text-transform: uppercase;";
  
  if (p.status === 'Scheduled' || p.status === 'In Queue') {
    visitBadgeStyle = "border: 1px solid #10b981; color: #10b981; background: transparent; padding: 0 5px; border-radius: 12px; font-size: 11px; font-weight: 600; display: inline-block; margin-left: 6px; text-transform: uppercase;";
  }

  const bloodBadgeStyle = "border: 1px solid #94a3b8; color: #64748b; background: transparent; padding: 0 5px; border-radius: 12px; font-size: 11px; font-weight: 600; display: inline-block; margin-left: 6px;";

  // Status Style Vocab
  const statusOutlineStyles = {
    "Admitted": "border: 1px solid #4f46e5; color: #4f46e5;",
    "Pre-op": "border: 1px solid #8b5cf6; color: #8b5cf6;",
    "Post-op": "border: 1px solid #3b82f6; color: #3b82f6;",
    "Discharge Pending": "background: #fff7ed; border: 1px solid #f97316; color: #ea580c; font-weight: 700;",
    "Transferred": "border: 1px solid #0d9488; color: #0d9488;",
    "Discharged": "border: 1px solid #10b981; color: #10b981;",
    "In Queue": "border: 1px solid #64748b; color: #64748b;",
    "In Consultation": "background: #3b82f6; color: #ffffff; border: 1px solid #3b82f6;",
    "Completed": "border: 1px solid #10b981; color: #10b981;",
    "No Show": "border: 1px solid #ef4444; color: #ef4444;",
    "Under Treatment": "background: #ef4444; color: #ffffff; border: 1px solid #ef4444; font-weight: 700;",
    "Observation": "border: 1px solid #f59e0b; color: #d97706;",
    "Discharged from ER": "border: 1px solid #10b981; color: #10b981;",
    "In Procedure": "background: #3b82f6; color: #ffffff; border: 1px solid #3b82f6;",
    "Recovery": "border: 1px solid #f59e0b; color: #d97706;"
  };
  const statusStyle = (statusOutlineStyles[p.status] || "border: 1px solid #94a3b8; color: #64748b;") + " font-size: 11px; padding: 2px 8px; border-radius: 4px; font-weight: 600; text-transform: capitalize; display: inline-block;";

  // NEWS Badge inline click function
  let newsBadgeHtml = '—';
  if ((p.type === 'IPD' || p.type === 'Emergency') && p.newsScore !== null) {
    const newsColorClass = p.newsScore >= 5 ? 'bg-news-red' : (p.newsScore >= 3 ? 'bg-news-amber' : 'bg-news-green');
    newsBadgeHtml = `
      <span class="news-badge-circle ${newsColorClass}" onclick="window.toggleVitalsInline(event, '${p.uhid}')">
        ${p.newsScore}
      </span>
    `;
  } else if ((p.type === 'IPD' || p.type === 'Emergency') && p.newsScore === null) {
    newsBadgeHtml = `<span style="color: #94a3b8; font-family: 'JetBrains Mono', monospace;">–</span>`;
  }

  // LOS indicator
  let losBadgeHtml = '';
  if (p.los !== null) {
    const losColor = p.los <= 6 ? 'background: #dcfce7; color: #166534;' : (p.los <= 14 ? 'background: #fef3c7; color: #92400e;' : 'background: #fee2e2; color: #991b1b;');
    losBadgeHtml = `<span class="badge" style="font-size: 10px; font-weight: 700; padding: 1px 4px; border-radius: 4px; ${losColor}">Day ${p.los}</span>`;
  }

  // Last Activity formatting (Activity type · Time)
  let lastActHtml = '';
  if (p.lastActivity) {
    lastActHtml = `<div style="font-size: 12px; color: #475569; font-weight: 500;">${p.lastActivity}</div>`;
  }

  // Action column options choice handler
  const actionButtonHtml = `
    <div style="display: flex; gap: 4px; justify-content: flex-end; align-items: center;">
      <button class="btn btn-primary btn-sm" style="padding: 2px 8px; font-size: 0.75rem; border-radius: 4px; cursor: pointer; background: #2563eb; color: #fff; font-weight: 600; border: none; height: 26px;" onclick="router.navigate('patients?uhid=${p.uhid}&visit=${visitId}')">Open</button>
      <button class="btn btn-secondary btn-sm" style="padding: 2px 6px; font-size: 0.75rem; border-radius: 4px; cursor: pointer; border: 1px solid #cbd5e1; background: #ffffff; color: #334155; height: 26px;" onclick="window.openRegistryQuickMenu(event, '${p.uhid}', '${visitId}')">•••</button>
    </div>
  `;

  // Inline vitals data
  const readings = [
    { time: "09:00 AM (Today)", bp: "95/60", hr: 110, temp: 98.6, spo2: 93, news: p.newsScore || 0, rr: 18 },
    { time: "05:00 AM (Today)", bp: "115/75", hr: 84, temp: 98.8, spo2: 96, news: 3, rr: 16 },
    { time: "09:00 PM (Yesterday)", bp: "120/80", hr: 72, temp: 98.4, spo2: 98, news: 0, rr: 14 }
  ];

  return `
    <tr class="p-row-item ${rowBorderClass}" style="${rowBgStyle}" onclick="window.navigateToPatientEMR(event, '${p.uhid}', '${visitId}')">
      <!-- Patient -->
      <td>
        <div style="display: flex; align-items: flex-start; gap: 10px;">
          <div style="width: 36px; height: 36px; border-radius: 50%; background-color: ${avatarBg}; color: white; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 14px; flex-shrink: 0;">
            ${initials}
          </div>
          <div style="display: flex; flex-direction: column; justify-content: center;">
            <div style="display: flex; align-items: center; flex-wrap: wrap;">
              <span style="font-weight: 700; color: #0f172a; font-size: 14px;">${dispName}</span>
              <span class="badge-visit" style="${visitBadgeStyle}">${p.type}</span>
              ${p.bloodGroup ? `<span class="badge-blood" style="${bloodBadgeStyle}">${p.bloodGroup}</span>` : ''}
            </div>
            <div style="font-size: 12px; color: #64748b; margin-top: 2px;">
              <a href="#patients?uhid=${p.uhid}&visit=${visitId}" style="color: #2563eb; text-decoration: none; font-family: 'JetBrains Mono', monospace; font-weight: 600;">${dispUhid}</a>
              <span style="color: #94a3b8;"> · </span>
              <span style="color: #64748b; font-family: 'JetBrains Mono', monospace;">${p.mobile}</span>
              <span style="color: #94a3b8;"> · </span>
              <span style="color: #64748b; font-family: 'JetBrains Mono', monospace;">${p.age}${p.gender[0]}</span>
            </div>
          </div>
        </div>
      </td>

      <!-- Ward / Bed -->
      <td>
        ${p.ward !== '—' ? `
          <div style="font-weight: 600; color: #334155; font-family:'JetBrains Mono',monospace;">${p.ward} · ${p.bed}</div>
          ${losBadgeHtml}
        ` : `<span style="color: #94a3b8;">—</span>`}
      </td>

      <!-- Consultant / Dept -->
      <td>
        <div style="font-weight: 700; color: #334155;">${p.primaryConsultant}</div>
        <div style="font-size: 11px; color: #64748b;">${p.department}</div>
      </td>

      <!-- Payer -->
      <td>
        <span class="badge" style="font-size: 11px; padding: 2px 6px; border-radius: 4px; font-weight: 600; ${payerBadgeStyle}">${p.payerType}</span>
        ${payerInfoHtml}
      </td>

      <!-- Alerts -->
      <td>
        <div style="display: flex; gap: 2px; flex-wrap: wrap;">
          ${renderRowAlertBadges(p)}
        </div>
      </td>

      <!-- NEWS -->
      <td>
        ${newsBadgeHtml}
      </td>

      <!-- Status -->
      <td>
        <span style="${statusStyle}">${p.status}</span>
      </td>

      <!-- Last Activity -->
      <td>
        ${lastActHtml}
      </td>

      <!-- Action -->
      <td onclick="event.stopPropagation();" style="text-align: right; padding-right: 12px;">
        ${actionButtonHtml}
      </td>
    </tr>

    <!-- Expanded Vitals Table (Row Expansion) -->
    <tr id="vitals-inline-${p.uhid}" style="display: none; background-color: #f8fafc; border-bottom: 1px solid #cbd5e1;">
      <td colspan="9" style="padding: 12px 16px;">
        <div style="display: flex; flex-direction: column; gap: 8px;">
          <div style="font-weight: 700; color: #475569; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px;">Last 3 Vitals Readings</div>
          <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 12px;">
            <thead>
              <tr style="border-bottom: 1px solid #cbd5e1; color: #64748b;">
                <th style="padding: 4px 0;">Reading Time</th>
                <th style="padding: 4px 0;">BP</th>
                <th style="padding: 4px 0;">Pulse</th>
                <th style="padding: 4px 0;">Temp</th>
                <th style="padding: 4px 0;">SPO2</th>
                <th style="padding: 4px 0;">Resp Rate</th>
                <th style="padding: 4px 0; text-align: center;">NEWS Score</th>
              </tr>
            </thead>
            <tbody>
              ${readings.map(r => `
                <tr style="border-bottom: 1px solid #e2e8f0;">
                  <td style="padding: 6px 0; font-family: 'JetBrains Mono', monospace;">${r.time}</td>
                  <td style="padding: 6px 0; font-family: 'JetBrains Mono', monospace; font-weight: 700;">${r.bp}</td>
                  <td style="padding: 6px 0; font-family: 'JetBrains Mono', monospace;">${r.hr} bpm</td>
                  <td style="padding: 6px 0; font-family: 'JetBrains Mono', monospace;">${r.temp}°F</td>
                  <td style="padding: 6px 0; font-family: 'JetBrains Mono', monospace; color: ${r.spo2 < 95 ? '#ef4444' : '#0f172a'};">${r.spo2}%</td>
                  <td style="padding: 6px 0; font-family: 'JetBrains Mono', monospace;">${r.rr} /min</td>
                  <td style="padding: 6px 0; text-align: center;">
                    <span class="news-badge-circle ${r.news >= 5 ? 'bg-news-red' : (r.news >= 3 ? 'bg-news-amber' : 'bg-news-green')}" style="width:20px; height:20px; font-size:0.7rem; pointer-events: none;">${r.news}</span>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div style="margin-top: 4px;">
            <a href="#patients?uhid=${p.uhid}&visit=${visitId}" style="color: #2563eb; font-weight: 700; text-decoration: none; font-size: 12px;">View Full Vitals &rarr;</a>
          </div>
        </div>
      </td>
    </tr>
  `;
}

window.toggleVitalsInline = function(event, uhid) {
  if (event) event.stopPropagation();
  const el = document.getElementById(`vitals-inline-${uhid}`);
  if (el) {
    const isHidden = el.style.display === 'none';
    el.style.display = isHidden ? 'table-row' : 'none';
  }
};

function renderRowAlertBadges(p) {
  const alerts = p.alerts || [];
  if (alerts.length === 0) {
    return ``; // Empty cell if no alerts
  }

  const priority = {
    'Critical': 1, 'MLC Case': 2, 'Discharge pending': 3, 'Bill hold': 4,
    'Pre-auth pending': 5, 'Pending labs': 6, 'Follow-up due': 7
  };
  const sorted = [...alerts].sort((a, b) => (priority[a] || 99) - (priority[b] || 99));
  const visible = sorted.slice(0, 2);
  const overflow = sorted.length - 2;

  let html = visible.map(a => {
    let style = "background: #eff6ff; color: #1e40af; border: 1px solid #bfdbfe;"; // Blue outline default
    if (a === 'Critical' || a === 'MLC Case') {
      style = "background: #fee2e2; color: #991b1b; border: 1px solid #fca5a5; font-weight: 700;"; // Red fill
    } else if (a === 'Discharge pending' || a === 'Bill hold') {
      style = "background: #ffedd5; color: #9a3412; border: 1px solid #fed7aa; font-weight: 700;"; // Orange fill
    }
    return `<span class="badge" style="font-size: 10px; padding: 2px 4px; border-radius: 4px; margin-right: 2px; cursor: pointer; ${style}" onclick="window.filterByAlertSummary('${a}')">${a}</span>`;
  }).join('');

  if (overflow > 0) {
    html += `<span style="font-size: 10px; color: #64748b; font-weight: 500;">+${overflow} more</span>`;
  }
  return html;
}

window.navigateToPatientEMR = function(event, uhid, visitId) {
  if (event.target.closest('button') || event.target.closest('a') || event.target.closest('input') || event.target.closest('.news-badge-circle')) {
    return;
  }
  router.navigate(`patients?uhid=${uhid}&visit=${visitId}`);
};

window.openRegistryQuickMenu = function(event, uhid, visitId) {
  event.stopPropagation();
  const state = window.state || {};
  const activeRole = state.activeUserRole || 'Doctor';
  
  let options = [];
  if (activeRole === 'Doctor') {
    options = ["Quick Note", "Prescribe", "Order Lab"];
  } else if (activeRole === 'Nurse') {
    options = ["Record Vitals", "MAR", "Execute Order"];
  } else if (activeRole === 'Billing') {
    options = ["Billing Workspace", "Collect Payment"];
  } else {
    options = ["Print Summary", "Send SMS"];
  }

  const choice = prompt(`Quick Actions Menu (${uhid}):\\n` + options.map((o, idx) => `${idx + 1}. ${o}`).join('\\n') + '\\nEnter choice number:');
  if (choice && parseInt(choice) >= 1 && parseInt(choice) <= options.length) {
    alert(`Executed action: ${options[parseInt(choice) - 1]}`);
  }
};

window.exportRegistryRoster = function() {
  alert("Roster exported.");
};

window.printRegistryRoster = function() {
  window.print();
};

function renderPagination(totalItems, startIndex, endIndex, totalPages) {
  const pag = document.getElementById('m-pagination');
  if (!pag) return;
  
  if (totalItems === 0) {
    pag.innerHTML = '';
    return;
  }
  
  const currentPage = window.registryCurrentPage || 1;
  let btnsHtml = '';

  const prevStyle = currentPage === 1 ? 'cursor: not-allowed; opacity: 0.5;' : 'cursor: pointer;';
  btnsHtml += `
    <button class="btn btn-secondary btn-sm" ${currentPage === 1 ? 'disabled' : ''} style="padding: 4px 10px; font-size:0.75rem; border: 1px solid #cbd5e1; background:#ffffff; ${prevStyle}" onclick="window.setRegistryPage(${currentPage - 1})">
      &larr; Prev
    </button>
  `;

  for (let p = 1; p <= totalPages; p++) {
    const isActive = p === currentPage;
    btnsHtml += `
      <button class="btn btn-secondary btn-sm" style="padding: 4px 10px; font-size:0.75rem; border: 1px solid ${isActive ? '#2563eb' : '#cbd5e1'}; background:${isActive ? '#2563eb' : '#ffffff'}; color:${isActive ? '#ffffff' : '#334155'}; font-weight:600; cursor:pointer;" onclick="window.setRegistryPage(${p})">
        ${p}
      </button>
    `;
  }

  const nextStyle = currentPage === totalPages ? 'cursor: not-allowed; opacity: 0.5;' : 'cursor: pointer;';
  btnsHtml += `
    <button class="btn btn-secondary btn-sm" ${currentPage === totalPages ? 'disabled' : ''} style="padding: 4px 10px; font-size:0.75rem; border: 1px solid #cbd5e1; background:#ffffff; ${nextStyle}" onclick="window.setRegistryPage(${currentPage + 1})">
      Next &rarr;
    </button>
  `;

  pag.innerHTML = `
    <div style="font-size:0.8rem; color:#64748b;">
      Showing <span style="font-weight:600; color:#0f172a;">${startIndex + 1}</span> to <span style="font-weight:600; color:#0f172a;">${endIndex}</span> of <span style="font-weight:600; color:#0f172a;">${totalItems}</span> entries
    </div>
    <div style="display:flex; gap:3px;">
      ${btnsHtml}
    </div>
  `;
}

window.setRegistryPage = function(p) {
  window.registryCurrentPage = p;
  window.filterMasterRegistry();
};

function highlightSearchTerm(text, query) {
  if (!query) return text;
  const regex = new RegExp(`(${query.replace(/[-\\/\\\\^$*+?.()|[\\]{}]/g, '\\\\$&')})`, 'gi');
  return text.toString().replace(regex, '<mark style="background: #fef08a; color: #0f172a; padding: 0 2px; border-radius: 2px;">$1</mark>');
}

// --------------------------------------------------------------------------"""

# Modify the file contents between the two markers
modified_content = content[:start_idx] + new_code + content[end_idx:]

with open(filepath, "w", encoding="utf-8") as f:
    f.write(modified_content)

print("SUCCESS: patientsView.js successfully patched!")
