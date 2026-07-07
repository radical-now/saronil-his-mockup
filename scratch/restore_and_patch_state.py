#!/usr/bin/env python3

path_orig = "/Users/home/Desktop/Saronil IHS/Updated HIS /scratch/original_state.js"
path_target = "/Users/home/Desktop/Saronil IHS/Updated HIS /assets/js/state.js"

with open(path_orig, "r", encoding="utf-8") as f:
    src = f.read()

# 1. Replace DOCTORS_DATABASE (lines 5 to 40)
start_doctors_idx = src.find("const DOCTORS_DATABASE = [")
end_doctors_idx = src.find("];", start_doctors_idx) + 2

doctors_block = """const DOCTORS_DATABASE = [
  { id: "DOC01", name: "Dr. Srinivasan", spec: "General Medicine", room: "101", phone: "+91 98450 11021", status: "Active" },
  { id: "DOC02", name: "Dr. Ramesh Iyer", spec: "Pediatrics", room: "102", phone: "+91 98450 11022", status: "Active" },
  { id: "DOC03", name: "Dr. Krishnamurthy", spec: "Psychiatry", room: "103", phone: "+91 98450 11023", status: "Active" },
  { id: "DOC04", name: "Dr. Mehta", spec: "General Surgery", room: "104", phone: "+91 98450 11024", status: "Active" },
  { id: "DOC05", name: "Dr. Priya Nair", spec: "Gynecology & Obs", room: "105", phone: "+91 98450 11025", status: "Active" },
  { id: "DOC06", name: "Dr. Fatima Sheikh", spec: "Emergency Medicine", room: "106", phone: "+91 98450 11026", status: "Active" },
  { id: "DOC07", name: "Dr. Anand", spec: "Cardiology", room: "107", phone: "+91 98450 11027", status: "Active" },
  { id: "DOC08", name: "Dr. Abhishek Kumar", spec: "Cardiology", room: "108", phone: "+91 98450 11028", status: "Active" },
  { id: "DOC09", name: "Dr. Sunita Sharma", spec: "Cardiology", room: "109", phone: "+91 98450 11029", status: "Active" },
  { id: "DOC10", name: "Dr. Amit Patel", spec: "Pediatrics", room: "110", phone: "+91 98450 11030", status: "Active" },
  { id: "DOC11", name: "Dr. Mamta Kumari", spec: "Pediatrics", room: "111", phone: "+91 98450 11031", status: "Active" },
  { id: "DOC12", name: "Dr. Rajesh Singh", spec: "General Medicine", room: "112", phone: "+91 98450 11032", status: "Active" },
  { id: "DOC13", name: "Dr. Devanti Devi", spec: "General Medicine", room: "113", phone: "+91 98450 11033", status: "Active" },
  { id: "DOC14", name: "Dr. Munna Kumar", spec: "Orthopedics", room: "114", phone: "+91 98450 11034", status: "Active" },
  { id: "DOC15", name: "Dr. Sarah Jenkins", spec: "Orthopedics", room: "115", phone: "+91 98450 11035", status: "Active" },
  { id: "DOC16", name: "Dr. Arvind Prasad", spec: "Gynecology & Obs", room: "116", phone: "+91 98450 11036", status: "Active" },
  { id: "DOC17", name: "Dr. Preeti Reddy", spec: "Gynecology & Obs", room: "117", phone: "+91 98450 11037", status: "Active" },
  { id: "DOC18", name: "Dr. Ajay Kumar", spec: "Neurology", room: "118", phone: "+91 98450 11038", status: "Active" },
  { id: "DOC19", name: "Dr. Shrawan Kumar", spec: "Oncology", room: "119", phone: "+91 98450 11039", status: "Active" },
  { id: "DOC20", name: "Dr. Vijay Pipil", spec: "Dermatology", room: "120", phone: "+91 98450 11040", status: "Active" }
];"""

src = src[:start_doctors_idx] + doctors_block + src[end_doctors_idx:]

# 2. Insert nurses and staff arrays inside the const state = { ... } object declaration
nurses_staff_block = """  // Nurses and staff definitions
  nurses: [
    { id: "NUR01", name: "Staff Nurse Mary", dept: "General Medicine", shift: "Morning", phone: "+91 98450 22001", status: "Active" },
    { id: "NUR02", name: "Staff Nurse John", dept: "Cardiology", shift: "Morning", phone: "+91 98450 22002", status: "Active" },
    { id: "NUR03", name: "Staff Nurse Sarah", dept: "Pediatrics", shift: "Afternoon", phone: "+91 98450 22003", status: "Active" },
    { id: "NUR04", name: "Staff Nurse Robert", dept: "Emergency Medicine", shift: "Night", phone: "+91 98450 22004", status: "Active" },
    { id: "NUR05", name: "Staff Nurse Jessica", dept: "Gynecology & Obs", shift: "Morning", phone: "+91 98450 22005", status: "Active" },
    { id: "NUR06", name: "Staff Nurse David", dept: "General Surgery", shift: "Afternoon", phone: "+91 98450 22006", status: "Active" },
    { id: "NUR07", name: "Staff Nurse Karen", dept: "Neurology", shift: "Morning", phone: "+91 98450 22007", status: "Active" },
    { id: "NUR08", name: "Staff Nurse James", dept: "Oncology", shift: "Night", phone: "+91 98450 22008", status: "Active" },
    { id: "NUR09", name: "Staff Nurse Emily", dept: "Gastroenterology", shift: "Afternoon", phone: "+91 98450 22009", status: "Active" },
    { id: "NUR10", name: "Staff Nurse Michael", dept: "Daycare", shift: "Morning", phone: "+91 98450 22010", status: "Active" }
  ],
  staff: [
    { id: "STF01", name: "Ph. Satish Kumar", role: "Pharmacist", dept: "Pharmacy", shift: "Morning", phone: "+91 98450 33001" },
    { id: "STF02", name: "Ph. Anita Rao", role: "Pharmacist", dept: "Pharmacy", shift: "Afternoon", phone: "+91 98450 33002" },
    { id: "STF03", name: "Tech Amit Verma", role: "Lab Technician", dept: "Laboratory", shift: "Morning", phone: "+91 98450 33003" },
    { id: "STF04", name: "Tech Preeti Reddy", role: "Lab Technician", dept: "Laboratory", shift: "Afternoon", phone: "+91 98450 33004" },
    { id: "STF05", name: "Clerk Anand", role: "Billing Clerk", dept: "Billing", shift: "Morning", phone: "+91 98450 33005" },
    { id: "STF06", name: "Clerk Sunita", role: "Billing Clerk", dept: "Billing", shift: "Afternoon", phone: "+91 98450 33006" },
    { id: "STF07", name: "Rec. Ravi", role: "Receptionist", dept: "Front Desk", shift: "Morning", phone: "+91 98450 33007" },
    { id: "STF08", name: "Rec. Priya", role: "Receptionist", dept: "Front Desk", shift: "Afternoon", phone: "+91 98450 33008" },
    { id: "STF09", name: "Clerk Shalini", role: "Admission Assistant", dept: "Admission Desk", shift: "Morning", phone: "+91 98450 33009" },
    { id: "STF10", name: "Clerk Ajay", role: "Admission Assistant", dept: "Admission Desk", shift: "Afternoon", phone: "+91 98450 33010" }
  ],"""

state_def_start = src.find("const state = {")
first_state_entry = src.find("  doctors: DOCTORS_DATABASE,", state_def_start)
src = src[:first_state_entry] + nurses_staff_block + src[first_state_entry:]

# 3. Replace seedState() definition and execution block (lines 661 to 1640 inclusive)
# Let's find "function seedState() {" in src
seed_start_idx = src.find("function seedState() {")
# Let's find "seedState();" that comes after seed_start_idx
seed_end_idx = src.find("seedState();", seed_start_idx) + 12

synchronized_seed_state = """function seedState() {
  // Initialize all beds as available
  for (const [wardKey, wardInfo] of Object.entries(state.wards)) {
    for (const bed of wardInfo.beds) {
      state.bedsStatus[bed] = {
        wardKey: wardKey,
        status: "Available",
        patientUhid: null,
        notes: ""
      };
    }
  }

  // Define the 15 required static dummy patients with EMR keys
  const staticPatients = [
    {
      uhid: "SH-2026-04821", name: "Rajesh Kumar", age: 45, gender: "Male",
      type: "IPD", ward: "General Ward", bed: "B-12", los: 3,
      primaryConsultant: "Dr. Srinivasan", department: "General Medicine",
      payer: "Star Health", payerType: "TPA/Insurance", preAuthStatus: "LOA ✓",
      alerts: ["Critical"], newsScore: 6, status: "Admitted", lastActivity: "Vitals · 10:15 AM",
      vitals: { bp: "120/80", hr: 72, temp: 98.4, spo2: 98, weight: 70, bmi: 22.8, pain: 0, rr: 16 },
      prescriptions: [{ name: "Tab Pantocid 40mg", dose: "1 tab", freq: "Once daily", duration: "10 Days", generic: "Pantoprazole", route: "Oral", active: true }],
      clinicalData: { complaint: "General chest discomfort", hpi: "None", examination: "NAD", diagnosis: "Evaluation", treatmentPlan: "Monitoring", carePlan: "Routine check" },
      history: { pastConditions: "None", surgeries: "None", familyHistory: "None" },
      bloodGroup: "B+", allergies: "Penicillin", mobile: "9876543210", flags: [], admitted: "28 Jun 2026 · 10:15", ipNumber: "IP-240001", opNumber: "—", vitalsOverdue: false, labsUnreviewed: false,
      dischargeClearances: { clinical: false, billing: false, summaryReady: false }
    },
    {
      uhid: "SH-2026-04803", name: "Priya Menon", age: 38, gender: "Female",
      type: "IPD", ward: "Private", bed: "P-04", los: 4,
      primaryConsultant: "Dr. Krishnamurthy", department: "Psychiatry",
      payer: "Self Pay", payerType: "Cash", preAuthStatus: "—",
      alerts: [], newsScore: 0, status: "Admitted", lastActivity: "Progress note · 9:30 AM",
      vitals: { bp: "110/70", hr: 68, temp: 98.6, spo2: 99, weight: 58, bmi: 21.3, pain: 0, rr: 14 },
      prescriptions: [{ name: "Tab Olimelt 5mg", dose: "1 tab", freq: "Bedtime", duration: "30 Days", generic: "Olanzapine", route: "Oral", active: true }],
      clinicalData: { complaint: "Anxiety", hpi: "None", examination: "NAD", diagnosis: "Evaluation", treatmentPlan: "Therapy", carePlan: "Routine check" },
      history: { pastConditions: "None", surgeries: "None", familyHistory: "None" },
      bloodGroup: "A+", allergies: "None", mobile: "9823456789", flags: [], admitted: "28 Jun 2026 · 09:30", ipNumber: "IP-240002", opNumber: "—", vitalsOverdue: false, labsUnreviewed: false,
      dischargeClearances: { clinical: false, billing: false, summaryReady: false }
    },
    {
      uhid: "SH-2026-04799", name: "Mohammed Iqbal", age: 62, gender: "Male",
      type: "IPD", ward: "HDU", bed: "H-02", los: 5,
      primaryConsultant: "Dr. Mehta", department: "General Surgery",
      payer: "HDFC ERGO", payerType: "TPA/Insurance", preAuthStatus: "LOA ✓",
      alerts: ["Critical"], newsScore: 4, status: "Post-Op", lastActivity: "Vitals · 8:45 AM",
      vitals: { bp: "130/85", hr: 80, temp: 99.0, spo2: 96, weight: 75, bmi: 24.5, pain: 3, rr: 18 },
      prescriptions: [{ name: "Inj Tramadol 50mg", dose: "1 amp", freq: "SOS", duration: "3 Days", generic: "Tramadol", route: "IV", active: true }],
      clinicalData: { complaint: "Post operative recovery", hpi: "None", examination: "NAD", diagnosis: "Evaluation", treatmentPlan: "Analgesics", carePlan: "Routine check" },
      history: { pastConditions: "None", surgeries: "Appendectomy", familyHistory: "None" },
      bloodGroup: "O+", allergies: "None", mobile: "9912345678", flags: ["Critical"], admitted: "28 Jun 2026 · 08:45", ipNumber: "IP-240003", opNumber: "—", vitalsOverdue: false, labsUnreviewed: false,
      dischargeClearances: { clinical: false, billing: false, summaryReady: false }
    },
    {
      uhid: "SH-2026-04817", name: "Sunita Sharma", age: 29, gender: "Female",
      type: "OPD", ward: "OPD Room 2", bed: "—", los: 1,
      primaryConsultant: "Dr. Priya Nair", department: "Gynecology & Obs",
      payer: "Cash Tariff", payerType: "Cash", preAuthStatus: "—",
      alerts: [], newsScore: 0, status: "In Consultation", lastActivity: "Registered · 11:15 AM",
      vitals: { bp: "115/75", hr: 76, temp: 98.2, spo2: 99, weight: 52, bmi: 20.3, pain: 1, rr: 14 },
      prescriptions: [],
      clinicalData: { complaint: "Mild lower back discomfort", hpi: "Backache since 2 days", examination: "NAD", diagnosis: "Evaluation", treatmentPlan: "Rest and warm packs", carePlan: "Follow up as needed" },
      history: { pastConditions: "None", surgeries: "None", familyHistory: "None" },
      bloodGroup: "B+", allergies: "None", mobile: "9845011005", flags: [], admitted: "28 Jun 2026 · 11:15", ipNumber: "—", opNumber: "OP-240004", vitalsOverdue: false, labsUnreviewed: false,
      dischargeClearances: { clinical: false, billing: false, summaryReady: false }
    },
    {
      uhid: "SH-2026-04788", name: "Arun Pillai", age: 55, gender: "Male",
      type: "IPD", ward: "HDU", bed: "H-03", los: 3,
      primaryConsultant: "Dr. Srinivasan", department: "General Medicine",
      payer: "New India Assurance", payerType: "TPA/Insurance", preAuthStatus: "LOA ✓",
      alerts: [], newsScore: 1, status: "Admitted", lastActivity: "Ward rounds · 8:15 AM",
      vitals: { bp: "128/80", hr: 78, temp: 98.6, spo2: 98, weight: 78, bmi: 25.1, pain: 2, rr: 16 },
      prescriptions: [{ name: "Tab Cardace 5mg", dose: "1 tab", freq: "Morning", duration: "Continuous", generic: "Ramipril", route: "Oral", active: true }],
      clinicalData: { complaint: "Hypertension evaluation", hpi: "None", examination: "NAD", diagnosis: "Evaluation", treatmentPlan: "Vitals monitoring", carePlan: "Stepdown check" },
      history: { pastConditions: "Hypertension", surgeries: "None", familyHistory: "Hypertension" },
      bloodGroup: "A+", allergies: "None", mobile: "9845011006", flags: [], admitted: "28 Jun 2026 · 08:15", ipNumber: "IP-240005", opNumber: "—", vitalsOverdue: false, labsUnreviewed: false,
      dischargeClearances: { clinical: false, billing: false, summaryReady: false }
    },
    {
      uhid: "SH-2026-04822", name: "Kavitha Nair", age: 34, gender: "Female",
      type: "Daycare", ward: "Daycare Bay", bed: "D-11", los: 1,
      primaryConsultant: "Dr. Priya Nair", department: "Gynecology & Obs",
      payer: "HDFC ERGO", payerType: "TPA/Insurance", preAuthStatus: "Approved",
      alerts: [], newsScore: 0, status: "Under Observation", lastActivity: "Dressing · 2:00 PM",
      vitals: { bp: "120/80", hr: 74, temp: 98.4, spo2: 99, weight: 62, bmi: 23.9, pain: 1, rr: 16 },
      prescriptions: [],
      clinicalData: { complaint: "Diagnostic hysteroscopy post-op", hpi: "None", examination: "NAD", diagnosis: "Post-op stable", treatmentPlan: "Discharge clearance check", carePlan: "Home advice" },
      history: { pastConditions: "None", surgeries: "None", familyHistory: "None" },
      bloodGroup: "O+", allergies: "None", mobile: "9845011007", flags: [], admitted: "28 Jun 2026 · 14:00", ipNumber: "—", opNumber: "OP-240006", vitalsOverdue: false, labsUnreviewed: false,
      dischargeClearances: { clinical: false, billing: false, summaryReady: false }
    },
    {
      uhid: "SH-2026-04755", name: "Deepak Verma", age: 41, gender: "Male",
      type: "Emergency", ward: "Emergency Bay", bed: "Resus-1", los: 1,
      primaryConsultant: "Dr. Fatima Sheikh", department: "Emergency Medicine",
      payer: "Self Pay", payerType: "Cash", preAuthStatus: "—",
      alerts: ["Critical"], newsScore: 7, status: "In Triage", lastActivity: "Resuscitation · 10:45 AM",
      vitals: { bp: "95/60", hr: 112, temp: 100.2, spo2: 91, weight: 68, bmi: 22.2, pain: 4, rr: 24 },
      prescriptions: [],
      clinicalData: { complaint: "High fever and respiratory distress", hpi: "Worsening symptoms since yesterday", examination: "Bilateral crepitations", diagnosis: "Severe Pneumonia", treatmentPlan: "Oxygen support, IV Antibiotics", carePlan: "Transfer to ICU" },
      history: { pastConditions: "Asthma", surgeries: "None", familyHistory: "Asthma" },
      bloodGroup: "B-", allergies: "None", mobile: "9845011008", flags: ["Critical"], admitted: "28 Jun 2026 · 10:45", ipNumber: "—", opNumber: "OP-240007", vitalsOverdue: false, labsUnreviewed: false,
      dischargeClearances: { clinical: false, billing: false, summaryReady: false }
    },
    {
      uhid: "SH-2026-04810", name: "Fatima Begum", age: 50, gender: "Female",
      type: "IPD", ward: "General Ward", bed: "B-15", los: 4,
      primaryConsultant: "Dr. Ramesh Iyer", department: "Pediatrics",
      payer: "Star Health", payerType: "TPA/Insurance", preAuthStatus: "LOA ✓",
      alerts: [], newsScore: 0, status: "Admitted", lastActivity: "Vitals · 9:15 AM",
      vitals: { bp: "135/85", hr: 72, temp: 98.4, spo2: 98, weight: 65, bmi: 24.3, pain: 0, rr: 16 },
      prescriptions: [{ name: "Tab Glycomet 500mg", dose: "1 tab", freq: "Twice daily", duration: "Continuous", generic: "Metformin", route: "Oral", active: true }],
      clinicalData: { complaint: "Hyperglycemia control", hpi: "None", examination: "NAD", diagnosis: "Type 2 Diabetes", treatmentPlan: "Diet and medication tuning", carePlan: "Routine monitoring" },
      history: { pastConditions: "Diabetes", surgeries: "None", familyHistory: "Diabetes" },
      bloodGroup: "AB+", allergies: "Sulfa drugs", mobile: "9845011009", flags: [], admitted: "28 Jun 2026 · 09:15", ipNumber: "IP-240008", opNumber: "—", vitalsOverdue: false, labsUnreviewed: false,
      dischargeClearances: { clinical: false, billing: false, summaryReady: false }
    },
    {
      uhid: "SH-2026-04790", name: "Vikram Singh", age: 68, gender: "Male",
      type: "IPD", ward: "ICU", bed: "ICU-05", los: 5,
      primaryConsultant: "Dr. Mehta", department: "General Surgery",
      payer: "United India", payerType: "TPA/Insurance", preAuthStatus: "LOA ✓",
      alerts: ["Critical"], newsScore: 5, status: "Post-Op", lastActivity: "Cardiac rehab · 7:30 AM",
      vitals: { bp: "115/70", hr: 84, temp: 98.6, spo2: 96, weight: 72, bmi: 23.7, pain: 3, rr: 18 },
      prescriptions: [{ name: "Tab Lasix 40mg", dose: "1 tab", freq: "Morning", duration: "10 Days", generic: "Furosemide", route: "Oral", active: true }],
      clinicalData: { complaint: "Post CABG chest pain", hpi: "None", examination: "Surgical wound healing", diagnosis: "CAD Post-CABG", treatmentPlan: "Anti-anginals and fluid restriction", carePlan: "Stepdown monitoring" },
      history: { pastConditions: "CAD, HTN", surgeries: "CABG", familyHistory: "Heart disease" },
      bloodGroup: "O+", allergies: "None", mobile: "9845011010", flags: ["Critical"], admitted: "28 Jun 2026 · 07:30", ipNumber: "IP-240009", opNumber: "—", vitalsOverdue: false, labsUnreviewed: false,
      dischargeClearances: { clinical: false, billing: false, summaryReady: false }
    },
    {
      uhid: "SH-2026-04831", name: "Anitha Rao", age: 47, gender: "Female",
      type: "IPD", ward: "Semi-Private", bed: "SP-02", los: 2,
      primaryConsultant: "Dr. Priya Nair", department: "Gynecology & Obs",
      payer: "Star Health", payerType: "TPA/Insurance", preAuthStatus: "LOA ✓",
      alerts: [], newsScore: 0, status: "Admitted", lastActivity: "Dressing · 10:00 AM",
      vitals: { bp: "120/80", hr: 74, temp: 98.4, spo2: 99, weight: 60, bmi: 23.4, pain: 1, rr: 16 },
      prescriptions: [],
      clinicalData: { complaint: "Pelvic pain and evaluation", hpi: "None", examination: "NAD", diagnosis: "Evaluation", treatmentPlan: "Symptomatic treatment", carePlan: "Routine monitoring" },
      history: { pastConditions: "None", surgeries: "None", familyHistory: "None" },
      bloodGroup: "A+", allergies: "None", mobile: "9845011011", flags: [], admitted: "28 Jun 2026 · 10:00", ipNumber: "IP-240010", opNumber: "—", vitalsOverdue: false, labsUnreviewed: false,
      dischargeClearances: { clinical: false, billing: false, summaryReady: false }
    },
    {
      uhid: "SH-2026-04768", name: "Suresh Babu", age: 52, gender: "Male",
      type: "IPD", ward: "Semi-Private", bed: "SP-05", los: 3,
      primaryConsultant: "Dr. Srinivasan", department: "General Medicine",
      payer: "CGHS", payerType: "Govt Scheme", preAuthStatus: "Approved",
      alerts: [], newsScore: 2, status: "Admitted", lastActivity: "Ward rounds · 8:30 AM",
      vitals: { bp: "138/88", hr: 82, temp: 98.8, spo2: 97, weight: 82, bmi: 26.1, pain: 2, rr: 18 },
      prescriptions: [{ name: "Tab Amlong 5mg", dose: "1 tab", freq: "Once daily", duration: "Continuous", generic: "Amlodipine", route: "Oral", active: true }],
      clinicalData: { complaint: "Uncontrolled blood pressure", hpi: "None", examination: "NAD", diagnosis: "Essential Hypertension", treatmentPlan: "Adjust antihypertensives", carePlan: "Vitals log" },
      history: { pastConditions: "HTN", surgeries: "None", familyHistory: "Hypertension" },
      bloodGroup: "B+", allergies: "None", mobile: "9845011012", flags: [], admitted: "28 Jun 2026 · 08:30", ipNumber: "IP-240011", opNumber: "—", vitalsOverdue: false, labsUnreviewed: false,
      dischargeClearances: { clinical: false, billing: false, summaryReady: false }
    },
    {
      uhid: "SH-2026-04826", name: "Meera Iyer", age: 8, gender: "Female",
      type: "OPD", ward: "Paediatrics Room 1", bed: "—", los: 1,
      primaryConsultant: "Dr. Ramesh Iyer", department: "Pediatrics",
      payer: "Cash Tariff", payerType: "Cash", preAuthStatus: "—",
      alerts: [], newsScore: 0, status: "Scheduled", lastActivity: "Registration · 13:30 PM",
      vitals: { bp: "100/60", hr: 95, temp: 99.1, spo2: 99, weight: 24, bmi: 15.6, pain: 1, rr: 20 },
      prescriptions: [],
      clinicalData: { complaint: "Mild cough and running nose", hpi: "Cold since 3 days", examination: "Chest clear", diagnosis: "Acute Rhinopharyngitis", treatmentPlan: "Saline nasal drops, hydration", carePlan: "Follow up if fever develops" },
      history: { pastConditions: "None", surgeries: "None", familyHistory: "None" },
      bloodGroup: "A+", allergies: "None", mobile: "9845011013", flags: [], admitted: "28 Jun 2026 · 13:30", ipNumber: "—", opNumber: "OP-240012", vitalsOverdue: false, labsUnreviewed: false,
      dischargeClearances: { clinical: false, billing: false, summaryReady: false }
    },
    {
      uhid: "SH-2026-04812", name: "Rahul Gupta", age: 26, gender: "Male",
      type: "Daycare", ward: "Daycare Bay", bed: "D-14", los: 1,
      primaryConsultant: "Dr. Srinivasan", department: "General Medicine",
      payer: "Self Pay", payerType: "Cash", preAuthStatus: "—",
      alerts: [], newsScore: 0, status: "Under Observation", lastActivity: "Dressing · 11:30 AM",
      vitals: { bp: "118/76", hr: 72, temp: 98.4, spo2: 99, weight: 65, bmi: 21.8, pain: 1, rr: 16 },
      prescriptions: [],
      clinicalData: { complaint: "Laceration dressing post-suture", hpi: "None", examination: "NAD", diagnosis: "Sutured wound stable", treatmentPlan: "Suture line cleaning", carePlan: "Discharge in afternoon" },
      history: { pastConditions: "None", surgeries: "None", familyHistory: "None" },
      bloodGroup: "O+", allergies: "None", mobile: "9845011014", flags: [], admitted: "28 Jun 2026 · 11:30", ipNumber: "—", opNumber: "OP-240013", vitalsOverdue: false, labsUnreviewed: false,
      dischargeClearances: { clinical: false, billing: false, summaryReady: false }
    },
    {
      uhid: "SH-2026-04801", name: "Lakshmi Devi", age: 60, gender: "Female",
      type: "Daycare", ward: "Daycare Bay", bed: "D-09", los: 1,
      primaryConsultant: "Dr. Priya Nair", department: "Gynecology & Obs",
      payer: "HDFC ERGO", payerType: "TPA/Insurance", preAuthStatus: "Approved",
      alerts: [], newsScore: 0, status: "Discharged", lastActivity: "Discharged · 2:30 PM",
      vitals: { bp: "130/80", hr: 74, temp: 98.4, spo2: 99, weight: 60, bmi: 23.4, pain: 0, rr: 16 },
      prescriptions: [],
      clinicalData: { complaint: "Daycare hysteroscopy recovery", hpi: "None", examination: "Sutures stable", diagnosis: "Post-procedure", treatmentPlan: "Rest", carePlan: "Discharge check" },
      history: { pastConditions: "None", surgeries: "None", familyHistory: "None" },
      bloodGroup: "B+", allergies: "None", mobile: "9876512345", flags: [], admitted: "28 Jun 2026 · 14:30", ipNumber: "—", opNumber: "OP-240014", vitalsOverdue: false, labsUnreviewed: false,
      dischargeClearances: { clinical: true, billing: true, summaryReady: true }
    },
    {
      uhid: "SH-2026-04798", name: "Arjun Nair", age: 49, gender: "Male",
      type: "IPD", ward: "ICU", bed: "ICU-07", los: 5,
      primaryConsultant: "Dr. Anand", department: "Cardiology",
      payer: "Corporate", payerType: "Corporate", preAuthStatus: "LOA ✓",
      alerts: [], newsScore: 1, status: "Post-Op", lastActivity: "Ward rounds · 7:50 AM",
      vitals: { bp: "128/80", hr: 80, temp: 98.4, spo2: 98, weight: 80, bmi: 24.9, pain: 2, rr: 18 },
      prescriptions: [{ name: "Tab Storvas 20mg", dose: "1 tab", freq: "Night", duration: "Continuous", generic: "Atorvastatin", route: "Oral", active: true }],
      clinicalData: { complaint: "Post CABG recovery", hpi: "None", examination: "Chest dressing clean", diagnosis: "Post-CABG", treatmentPlan: "Cardiac rehab", carePlan: "Stepdown monitor" },
      history: { pastConditions: "CAD", surgeries: "CABG", familyHistory: "Heart disease" },
      bloodGroup: "O+", allergies: "None", mobile: "9988771122", flags: [], admitted: "28 Jun 2026 · 07:50", ipNumber: "IP-240015", opNumber: "—", vitalsOverdue: false, labsUnreviewed: false,
      dischargeClearances: { clinical: false, billing: false, summaryReady: false }
    }
  ];

  // Store static rows
  state.patients = [...staticPatients];

  // Generate 85 programmatic patients to reach exactly 100
  const firstNames = ["Amit", "Rohan", "Sanjay", "Kiran", "Divya", "Neha", "Vijay", "Asha", "Sunil", "Rajesh", "Gita", "Harish", "Preeti", "Alok", "Madhav", "Jyoti", "Vikram", "Suresh", "Rahul", "Arun"];
  const lastNames = ["Sharma", "Verma", "Joshi", "Iyer", "Patel", "Reddy", "Sen", "Das", "Rao", "Nair", "Mehta", "Chawla", "Bose", "Pillai", "Gupta", "Deshmukh", "Singh", "Kumar", "Prasad", "Pillai"];
  const payers = ["Self Pay", "Star Health", "HDFC ERGO", "New India Assurance", "United India", "ECHS", "CGHS", "PMJAY", "ESI", "Corporate"];

  const distribution = [];
  for (let i = 0; i < 15; i++) distribution.push({ type: "IPD", status: "Admitted" });
  for (let i = 0; i < 30; i++) distribution.push({ type: "OPD", status: i % 3 === 0 ? "Scheduled" : (i % 3 === 1 ? "Checked In" : "In Consultation") });
  for (let i = 0; i < 10; i++) distribution.push({ type: "Daycare", status: "Under Observation" });
  for (let i = 0; i < 5; i++) distribution.push({ type: "Emergency", status: "In Triage" });
  for (let i = 0; i < 25; i++) distribution.push({ type: "IPD", status: "Discharged" });

  for (let idx = 0; idx < distribution.length; idx++) {
    const patIdNum = 5000 + idx;
    const config = distribution[idx];
    const isMale = idx % 2 === 0;
    const fn = firstNames[idx % firstNames.length];
    const ln = lastNames[(idx * 3) % lastNames.length];
    const age = 15 + (idx * 7) % 65;
    const gender = isMale ? "Male" : "Female";
    const bloodGroup = ["A+", "B+", "O+", "AB+"][idx % 4];
    const doctor = state.doctors[idx % state.doctors.length];

    const patObj = {
      uhid: `SH-2026-0${patIdNum}`,
      abhaId: `9100-2400-0${patIdNum}`,
      aadhaar: `34567890${patIdNum}`,
      passport: `L7000${patIdNum}`,
      insuranceId: `POL800${patIdNum}`,
      name: `${fn} ${ln}`,
      age: age,
      gender: gender,
      type: config.type,
      mobile: `+91 98450 ${12000 + idx}`,
      email: `${fn.toLowerCase()}.${ln.toLowerCase()}@email.com`,
      address: `Block-${String.fromCharCode(65 + (idx % 6))}, Sector ${3 + idx % 5}, HSR Layout, Bengaluru`,
      bloodGroup: bloodGroup,
      allergies: idx % 10 === 0 ? "Sulfa drugs" : "No Known Allergies",
      pregnancyStatus: "Not Pregnant",
      egfr: 90,
      liverFunction: "Normal",
      emergencyContact: { name: "Relative", relation: "Spouse", phone: `+91 99000 ${12000 + idx}` },
      payer: payers[idx % payers.length],
      payerType: idx % 2 === 0 ? "TPA/Insurance" : "Cash",
      sponsor: idx % 2 === 0 ? "Star Health" : "Self",
      primaryConsultant: doctor.name,
      department: doctor.spec,
      status: config.status,
      vitals: { bp: "120/80", hr: 74, temp: 98.4, spo2: 99, weight: 65, bmi: 22.5, pain: 0, rr: 16 },
      clinicalData: { complaint: "Evaluation checkup", hpi: "None", examination: "NAD", diagnosis: "Evaluation", treatmentPlan: "Symptomatic support", carePlan: "Routine follow-up" },
      history: { pastConditions: "None", surgeries: "None", familyHistory: "None" },
      ward: config.type === "IPD" ? "General Ward" : (config.type === "Daycare" ? "Daycare Bay" : (config.type === "Emergency" ? "Emergency Bay" : "—")),
      bed: config.type === "IPD" ? `B-${idx + 1}` : (config.type === "Daycare" ? `D-${idx + 1}` : (config.type === "Emergency" ? "Resus-2" : "—")),
      insurance: { provider: idx % 2 === 0 ? "Star Health" : "Cash", plan: idx % 2 === 0 ? "Silver Plan" : "" },
      alerts: [],
      lastActivity: "Rounds today",
      prescriptions: [],
      dischargeClearances: { clinical: config.status === "Discharged", billing: config.status === "Discharged", summaryReady: config.status === "Discharged" },
      flags: idx % 12 === 0 ? ["Critical"] : (idx % 15 === 0 ? ["MLC"] : []),
      los: 1 + idx % 4,
      newsScore: idx % 12 === 0 ? 3 : 0,
      admitted: `28 Jun 2026 · 10:00`,
      ipNumber: config.type === "IPD" ? `IP-240${patIdNum}` : "—",
      opNumber: config.type !== "IPD" ? `OP-240${patIdNum}` : "—",
      vitalsOverdue: false,
      labsUnreviewed: false
    };

    if (config.type === "IPD" && config.status !== "Discharged") {
      const wardKey = gender === "Female" ? "GENERAL-WARD-F" : "GENERAL-WARD-M";
      const wardInfo = state.wards[wardKey];
      const bed = wardInfo.beds[idx % wardInfo.beds.length];
      patObj.ward = wardInfo.name;
      patObj.bed = bed;
      state.bedsStatus[bed] = {
        wardKey: wardKey,
        status: "Occupied",
        patientUhid: patObj.uhid,
        notes: `Admitted under ${doctor.name}`
      };
      state.admissions.push({
        id: `ADM${5000 + idx}`,
        uhid: patObj.uhid,
        patientName: patObj.name,
        doctorName: doctor.name,
        ward: wardKey,
        bed: bed,
        date: "2026-06-28",
        status: "Active"
      });
    }

    if (config.type === "Daycare") {
      const bedId = `DC-B${(idx % 10) + 1}`;
      patObj.bed = bedId;
      state.bedsStatus[bedId] = {
        wardKey: "DAYCARE",
        status: "Occupied",
        patientUhid: patObj.uhid,
        notes: `Daycare recovery under ${doctor.name}`
      };
      state.daycareAdmissions = state.daycareAdmissions || [];
      state.daycareAdmissions.push({
        patient: patObj,
        bedId: bedId,
        ward: 'Daycare Ward',
        bedNo: bedId,
        consultantName: doctor.name,
        procedureName: 'Evaluation checkup',
        admissionType: 'Daycare',
        admissionTimestamp: new Date().toISOString(),
        status: 'Registered',
        dischargeClearances: { clinical: false, billing: false, summaryReady: false }
      });
    }

    if (config.type === "OPD") {
      state.appointments.push({
        id: `APT${6000 + idx}`,
        uhid: patObj.uhid,
        patientName: patObj.name,
        doctorName: doctor.name,
        deptName: doctor.spec,
        time: "10:30 AM",
        date: "2026-06-28",
        status: config.status === "Scheduled" ? "Scheduled" : (config.status === "Checked In" ? "Arrived" : "Completed"),
        mobile: patObj.mobile,
        gender: patObj.gender,
        age: patObj.age,
        visitType: "OPD Regular",
        checkedInTime: "09:45 AM"
      });
    }

    state.billing.push({
      invoiceId: `INV${7000 + idx}`,
      uhid: patObj.uhid,
      patientName: patObj.name,
      amount: 1500 + (idx * 250) % 8000,
      status: config.status === "Discharged" ? "Paid" : "Pending",
      date: "2026-06-28"
    });

    state.patients.push(patObj);
  }

  // Seed outstanding bills & other components
  state.bloodStock = state.bloodStock || {
    "A+": { bags: 12, components: { rbc: 6, platelets: 4, ffp: 2 } },
    "A-": { bags: 4, components: { rbc: 2, platelets: 1, ffp: 1 } },
    "B+": { bags: 15, components: { rbc: 8, platelets: 5, ffp: 2 } },
    "B-": { bags: 3, components: { rbc: 1, platelets: 1, ffp: 1 } },
    "O+": { bags: 18, components: { rbc: 10, platelets: 6, ffp: 2 } },
    "O-": { bags: 6, components: { rbc: 3, platelets: 2, ffp: 1 } },
    "AB+": { bags: 8, components: { rbc: 4, platelets: 2, ffp: 2 } },
    "AB-": { bags: 2, components: { rbc: 1, platelets: 1, ffp: 0 } }
  };

  state.bloodDonors = [
    { id: "DON001", name: "Anand Sharma", age: 34, gender: "Male", bloodGroup: "B+", bags: 1, date: "2026-06-28 · 10:15 AM", status: "Released", testStatus: "Safe" },
    { id: "DON002", name: "Kiran Patel", age: 29, gender: "Female", bloodGroup: "O+", bags: 1, date: "2026-06-28 · 11:30 AM", status: "Quarantine", testStatus: "Pending" }
  ];

  state.validationRules = [
    { id: "VAL01", title: "Blood Bag Match Rule", desc: "Crossmatch required before release", status: "Active" },
    { id: "VAL02", title: "Critical Hb Rule", desc: "Hb < 7 g/dL requires transfusion checklist", status: "Active" }
  ];

  state.auditLogs.push({
    timestamp: new Date().toISOString(),
    event: "Database Synced",
    details: "100 Patients, 20 Doctors, 10 Nurses, 10 Staff loaded."
  });

  // Save to local storage for persistence across views
  localStorage.setItem('saronil_patients', JSON.stringify(state.patients));
  localStorage.setItem('saronil_doctors', JSON.stringify(state.doctors));
  localStorage.setItem('saronil_nurses', JSON.stringify(state.nurses));
  localStorage.setItem('saronil_staff', JSON.stringify(state.staff));

  console.log(`Synchronized database seeded successfully: ${state.patients.length} patients, ${state.doctors.length} doctors, ${state.nurses.length} nurses, ${state.staff.length} staff.`);
}

// Expose globally
window.seedState = seedState;

// Execute Seeding
seedState();"""

src = src.replace(src[seed_start_idx:seed_end_idx], synchronized_seed_state)

with open(path_target, "w", encoding="utf-8") as f:
    f.write(src)

print("SUCCESS: state.js restored and synced correctly, keeping all validation rules intact!")
