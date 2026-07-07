#!/usr/bin/env python3
"""
Replace the patient list and registry generation in patientsView.js
with the new spec-compliant Patient Records list view (Outfit font, scrollable cards,
all active counts, filters, search, custom range datepicker, and actions).
"""

path = "/Users/home/Desktop/Saronil IHS/Updated HIS /assets/js/views/patientsView.js"

NEW_REGISTRY_CODE = r'''
// --------------------------------------------------------------------------
// MOCK PATIENT GENERATOR (101 Patients matching daily clinical targets)
// --------------------------------------------------------------------------
function ensure307PatientsExist() {
  const state = window.state || {};
  if (state.patients && state.patients.length === 101) {
    return;
  }

  // Prepopulate exactly the 15 required static dummy patients with EMR keys
  const staticRows = [
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
      primaryConsultant: "Dr. Mehta", department: "Surgery",
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
      type: "Daycare", ward: "Daycare Bay", bed: "D-06", los: 1,
      primaryConsultant: "Dr. Priya Nair", department: "Gynaecology",
      payer: "PMJAY", payerType: "Govt Scheme", preAuthStatus: "Approved",
      alerts: [], newsScore: 0, status: "In Consultation", lastActivity: "Consultation · 11:20 AM",
      vitals: { bp: "120/78", hr: 74, temp: 98.4, spo2: 99, weight: 62, bmi: 22.1, pain: 0, rr: 16 },
      prescriptions: [{ name: "Tab Folvite 5mg", dose: "1 tab", freq: "Once daily", duration: "90 Days", generic: "Folic Acid", route: "Oral", active: true }],
      clinicalData: { complaint: "Routine antenatal check", hpi: "None", examination: "NAD", diagnosis: "Pregnancy", treatmentPlan: "Vitamins", carePlan: "Routine check" },
      history: { pastConditions: "None", surgeries: "None", familyHistory: "None" },
      bloodGroup: "AB+", allergies: "None", mobile: "9123456789", flags: [], admitted: "28 Jun 2026 · 11:20", ipNumber: "—", opNumber: "OP-240004", vitalsOverdue: false, labsUnreviewed: false,
      dischargeClearances: { clinical: false, billing: false, summaryReady: false }
    },
    {
      uhid: "SH-2026-04788", name: "Arun Pillai", age: 55, gender: "Male",
      type: "IPD", ward: "ICU", bed: "ICU-03", los: 7,
      primaryConsultant: "Dr. Anand", department: "Cardiology",
      payer: "CGHS", payerType: "Govt Scheme", preAuthStatus: "Approved",
      alerts: [], newsScore: 3, status: "Admitted", lastActivity: "ECG done · 7:15 AM",
      vitals: { bp: "140/90", hr: 88, temp: 98.6, spo2: 95, weight: 80, bmi: 26.2, pain: 1, rr: 20 },
      prescriptions: [{ name: "Tab Ecosprin 150mg", dose: "1 tab", freq: "Once daily", duration: "Continuous", generic: "Aspirin", route: "Oral", active: true }],
      clinicalData: { complaint: "Myocardial Infarction", hpi: "None", examination: "NAD", diagnosis: "Post-MI", treatmentPlan: "Beta blockers", carePlan: "ICU monitoring" },
      history: { pastConditions: "Hypertension", surgeries: "None", familyHistory: "None" },
      bloodGroup: "B+", allergies: "None", mobile: "9765432109", flags: [], admitted: "28 Jun 2026 · 07:15", ipNumber: "IP-240005", opNumber: "—", vitalsOverdue: false, labsUnreviewed: false,
      dischargeClearances: { clinical: false, billing: false, summaryReady: false }
    },
    {
      uhid: "SH-2026-04822", name: "Kavitha Nair", age: 34, gender: "Female",
      type: "OPD", ward: "OPD Room 2", bed: "—", los: 1,
      primaryConsultant: "Dr. Fatima Sheikh", department: "Dermatology",
      payer: "Self Pay", payerType: "Cash", preAuthStatus: "—",
      alerts: [], newsScore: 0, status: "In Consultation", lastActivity: "Registry · 1:10 PM",
      vitals: { bp: "118/76", hr: 72, temp: 98.2, spo2: 99, weight: 55, bmi: 21.0, pain: 0, rr: 14 },
      prescriptions: [{ name: "Cream Betnovate-C", dose: "Apply", freq: "Twice daily", duration: "7 Days", generic: "Betamethasone", route: "Topical", active: true }],
      clinicalData: { complaint: "Skin rash", hpi: "None", examination: "Eczematous lesions", diagnosis: "Eczema", treatmentPlan: "Steroid cream", carePlan: "Review in 1 week" },
      history: { pastConditions: "None", surgeries: "None", familyHistory: "None" },
      bloodGroup: "O+", allergies: "None", mobile: "9845678901", flags: [], admitted: "28 Jun 2026 · 13:10", ipNumber: "—", opNumber: "OP-240006", vitalsOverdue: false, labsUnreviewed: false,
      dischargeClearances: { clinical: false, billing: false, summaryReady: false }
    },
    {
      uhid: "SH-2026-04755", name: "Deepak Verma", age: 41, gender: "Male",
      type: "IPD", ward: "Semi-Private", bed: "SP-08", los: 2,
      primaryConsultant: "Dr. Ramesh Iyer", department: "Orthopaedics",
      payer: "United India", payerType: "TPA/Insurance", preAuthStatus: "Approved",
      alerts: [], newsScore: 1, status: "Pre-Op", lastActivity: "X-Ray reviewed · 6:45 AM",
      vitals: { bp: "124/80", hr: 78, temp: 98.4, spo2: 98, weight: 70, bmi: 22.8, pain: 4, rr: 16 },
      prescriptions: [{ name: "Tab Ultracet", dose: "1 tab", freq: "Twice daily", duration: "5 Days", generic: "Tramadol + Paracetamol", route: "Oral", active: true }],
      clinicalData: { complaint: "Knee pain - ligament tear", hpi: "None", examination: "Swelling + tenderness", diagnosis: "ACL tear", treatmentPlan: "ACL Reconstruction", carePlan: "Pre-op checklist" },
      history: { pastConditions: "None", surgeries: "None", familyHistory: "None" },
      bloodGroup: "A-", allergies: "None", mobile: "9988776655", flags: [], admitted: "28 Jun 2026 · 06:45", ipNumber: "IP-240007", opNumber: "—", vitalsOverdue: false, labsUnreviewed: false,
      dischargeClearances: { clinical: false, billing: false, summaryReady: false }
    },
    {
      uhid: "SH-2026-04810", name: "Fatima Begum", age: 50, gender: "Female",
      type: "IPD", ward: "Emergency Bay", bed: "E-01", los: 1, // Boarded in ER as IPD to keep Emergency Active count = 0
      primaryConsultant: "Dr. Srinivasan", department: "General Medicine",
      payer: "New India", payerType: "TPA/Insurance", preAuthStatus: "LOA ✓",
      alerts: [], newsScore: 2, status: "Under Observation", lastActivity: "Admitted · 2:15 PM",
      vitals: { bp: "145/88", hr: 84, temp: 98.6, spo2: 97, weight: 65, bmi: 24.0, pain: 2, rr: 18 },
      prescriptions: [{ name: "Tab Amlopin 5mg", dose: "1 tab", freq: "Once daily", duration: "Continuous", generic: "Amlodipine", route: "Oral", active: true }],
      clinicalData: { complaint: "Hypertension crisis", hpi: "None", examination: "High BP on presentation", diagnosis: "Essential HTN", treatmentPlan: "BP titration", carePlan: "ER Boarding monitoring" },
      history: { pastConditions: "Hypertension", surgeries: "None", familyHistory: "None" },
      bloodGroup: "O-", allergies: "None", mobile: "9743210987", flags: ["MLC"], admitted: "28 Jun 2026 · 14:15", ipNumber: "IP-240008", opNumber: "—", vitalsOverdue: false, labsUnreviewed: false,
      dischargeClearances: { clinical: false, billing: false, summaryReady: false }
    },
    {
      uhid: "SH-2026-04790", name: "Vikram Singh", age: 68, gender: "Male",
      type: "IPD", ward: "Private", bed: "P-11", los: 6,
      primaryConsultant: "Dr. Anand", department: "Neurology",
      payer: "ECHS", payerType: "Govt Scheme", preAuthStatus: "Approved",
      alerts: [], newsScore: 0, status: "Admitted", lastActivity: "Physio review · 9:12 AM",
      vitals: { bp: "128/82", hr: 72, temp: 98.4, spo2: 97, weight: 68, bmi: 23.5, pain: 0, rr: 16 },
      prescriptions: [{ name: "Tab Storvas 20mg", dose: "1 tab", freq: "Night", duration: "Continuous", generic: "Atorvastatin", route: "Oral", active: true }],
      clinicalData: { complaint: "Ischemic Stroke recovery", hpi: "None", examination: "Left sided hemiparesis", diagnosis: "CVA Stroke", treatmentPlan: "Antiplatelets, Rehabilitation", carePlan: "Stroke protocol" },
      history: { pastConditions: "Diabetes", surgeries: "None", familyHistory: "Stroke" },
      bloodGroup: "A+", allergies: "None", mobile: "9567890123", flags: ["DNR"], admitted: "28 Jun 2026 · 09:12", ipNumber: "IP-240009", opNumber: "—", vitalsOverdue: false, labsUnreviewed: false,
      dischargeClearances: { clinical: false, billing: false, summaryReady: false }
    },
    {
      uhid: "SH-2026-04831", name: "Anitha Rao", age: 47, gender: "Female",
      type: "Daycare", ward: "Daycare Bay", bed: "D-02", los: 1,
      primaryConsultant: "Dr. Mehta", department: "Surgery",
      payer: "ESI", payerType: "Govt Scheme", preAuthStatus: "Approved",
      alerts: [], newsScore: 0, status: "Under Observation", lastActivity: "Dressing done · 12:05 PM", // Adjusted status to Under Observation to keep Discharge Pending count = 0
      vitals: { bp: "122/80", hr: 76, temp: 98.4, spo2: 99, weight: 60, bmi: 23.0, pain: 1, rr: 16 },
      prescriptions: [{ name: "Tab Pantocid 40mg", dose: "1 tab", freq: "Once daily", duration: "5 Days", generic: "Pantoprazole", route: "Oral", active: true }],
      clinicalData: { complaint: "Post cyst excision", hpi: "None", examination: "Sutures intact", diagnosis: "Post-op wound", treatmentPlan: "Daily dressing", carePlan: "Daycare discharge" },
      history: { pastConditions: "None", surgeries: "Cyst excision", familyHistory: "None" },
      bloodGroup: "B-", allergies: "Sulpha drugs", mobile: "9456789012", flags: [], admitted: "28 Jun 2026 · 12:05", ipNumber: "—", opNumber: "OP-240010", vitalsOverdue: false, labsUnreviewed: false,
      dischargeClearances: { clinical: false, billing: false, summaryReady: false }
    },
    {
      uhid: "SH-2026-04768", name: "Suresh Babu", age: 52, gender: "Male",
      type: "IPD", ward: "General Ward", bed: "B-07", los: 8,
      primaryConsultant: "Dr. Srinivasan", department: "General Medicine",
      payer: "Self Pay", payerType: "Cash", preAuthStatus: "—",
      alerts: [], newsScore: 1, status: "LAMA", lastActivity: "LAMA signed · 10:40 AM",
      vitals: { bp: "135/85", hr: 74, temp: 98.4, spo2: 97, weight: 70, bmi: 22.8, pain: 0, rr: 16 },
      prescriptions: [],
      clinicalData: { complaint: "Chronic Gastritis", hpi: "None", examination: "Tenderness", diagnosis: "GERD", treatmentPlan: "LAMA counselled", carePlan: "Discharge protocol" },
      history: { pastConditions: "None", surgeries: "None", familyHistory: "None" },
      bloodGroup: "O+", allergies: "None", mobile: "9345678901", flags: ["LAMA"], admitted: "28 Jun 2026 · 10:40", ipNumber: "IP-240011", opNumber: "—", vitalsOverdue: false, labsUnreviewed: false,
      dischargeClearances: { clinical: true, billing: true, summaryReady: true }
    },
    {
      uhid: "SH-2026-04826", name: "Meera Iyer", age: 8, gender: "Female",
      type: "OPD", ward: "OPD Room 4", bed: "—", los: 1,
      primaryConsultant: "Dr. Priya Nair", department: "Paediatrics",
      payer: "Star Health", payerType: "TPA/Insurance", preAuthStatus: "—",
      alerts: [], newsScore: 0, status: "In Consultation", lastActivity: "Doctor review · 11:55 AM",
      vitals: { bp: "100/60", hr: 90, temp: 99.2, spo2: 99, weight: 26, bmi: 15.8, pain: 0, rr: 20 },
      prescriptions: [{ name: "Syr Crocin 120mg", dose: "5 ml", freq: "TID", duration: "3 Days", generic: "Paracetamol", route: "Oral", active: true }],
      clinicalData: { complaint: "Mild fever", hpi: "None", examination: "Congested throat", diagnosis: "URI", treatmentPlan: "Antipyretics", carePlan: "Review if fever persists" },
      history: { pastConditions: "None", surgeries: "None", familyHistory: "None" },
      bloodGroup: "A+", allergies: "None", mobile: "9234567890", flags: [], admitted: "28 Jun 2026 · 11:55", ipNumber: "—", opNumber: "OP-240012", vitalsOverdue: false, labsUnreviewed: false,
      dischargeClearances: { clinical: false, billing: false, summaryReady: false }
    },
    {
      uhid: "SH-2026-04812", name: "Rahul Gupta", age: 26, gender: "Male",
      type: "IPD", ward: "General Ward", bed: "B-18", los: 3,
      primaryConsultant: "Dr. Krishnamurthy", department: "Psychiatry",
      payer: "Self Pay", payerType: "Cash", preAuthStatus: "—",
      alerts: [], newsScore: 0, status: "Admitted", lastActivity: "Nurse check · 8:10 AM",
      vitals: { bp: "120/80", hr: 72, temp: 98.4, spo2: 99, weight: 65, bmi: 22.5, pain: 0, rr: 16 },
      prescriptions: [{ name: "Tab Olimelt 5mg", dose: "1 tab", freq: "Bedtime", duration: "10 Days", generic: "Olanzapine", route: "Oral", active: true }],
      clinicalData: { complaint: "Anxiety", hpi: "None", examination: "NAD", diagnosis: "Evaluation", treatmentPlan: "Psychotherapy", carePlan: "Routine ward rounds" },
      history: { pastConditions: "None", surgeries: "None", familyHistory: "None" },
      bloodGroup: "O+", allergies: "None", mobile: "9123450987", flags: [], admitted: "28 Jun 2026 · 08:10", ipNumber: "IP-240013", opNumber: "—", vitalsOverdue: false, labsUnreviewed: false,
      dischargeClearances: { clinical: false, billing: false, summaryReady: false }
    },
    {
      uhid: "SH-2026-04801", name: "Lakshmi Devi", age: 60, gender: "Female",
      type: "Daycare", ward: "Daycare Bay", bed: "D-09", los: 1,
      primaryConsultant: "Dr. Priya Nair", department: "Gynaecology",
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

  const firstNames = ["Amit", "Rohan", "Sanjay", "Kiran", "Divya", "Neha", "Vijay", "Asha", "Sunil", "Rajesh", "Gita", "Harish", "Preeti", "Alok", "Madhav", "Jyoti"];
  const lastNames = ["Sharma", "Verma", "Joshi", "Iyer", "Patel", "Reddy", "Sen", "Das", "Rao", "Nair", "Mehta", "Chawla", "Bose", "Pillai", "Gupta", "Deshmukh"];
  const depts = ["General Medicine", "Orthopaedics", "Psychiatry", "Cardiology", "Neurology", "Paediatrics", "Gynaecology", "Surgery", "ENT", "Dermatology", "ICU"];
  const docs = ["Dr. Srinivasan", "Dr. Mehta", "Dr. Krishnamurthy", "Dr. Anand", "Dr. Fatima Sheikh", "Dr. Ramesh Iyer", "Dr. Priya Nair"];
  const payers = ["Self Pay", "Star Health", "HDFC ERGO", "New India Assurance", "United India", "ECHS", "CGHS", "PMJAY", "ESI", "Corporate"];
  const wards = ["General Ward", "Semi-Private", "Private", "ICU", "HDU", "Daycare Bay", "Emergency Bay"];

  const generated = [];

  // Generate 14 active IPD rows (statuses other than Discharged)
  for (let i = 0; i < 14; i++) {
    const fn = firstNames[Math.floor(Math.random() * firstNames.length)];
    const ln = lastNames[Math.floor(Math.random() * lastNames.length)];
    const uhidNum = 4800 + i + 100;
    const hour = String(6 + Math.floor(Math.random() * 8)).padStart(2, '0');
    const min = String(Math.floor(Math.random() * 60)).padStart(2, '0');
    generated.push({
      uhid: `SH-2026-0${uhidNum}`, name: `${fn} ${ln}`, age: Math.floor(Math.random() * 60) + 18, gender: Math.random() > 0.5 ? "Male" : "Female",
      type: "IPD", ward: "General Ward", bed: `B-${Math.floor(Math.random() * 30) + 1}`, los: 3,
      primaryConsultant: docs[Math.floor(Math.random() * docs.length)], department: depts[Math.floor(Math.random() * depts.length)],
      payer: payers[Math.floor(Math.random() * payers.length)], payerType: "TPA/Insurance", preAuthStatus: "LOA ✓",
      alerts: [], newsScore: 0, status: "Admitted", lastActivity: "Rounds",
      vitals: { bp: "120/80", hr: 72, temp: 98.4, spo2: 98, weight: 70, bmi: 22.8, pain: 0, rr: 16 },
      prescriptions: [],
      clinicalData: { complaint: "Evaluation", hpi: "None", examination: "NAD", diagnosis: "Evaluation", treatmentPlan: "Monitoring", carePlan: "Routine check" },
      history: { pastConditions: "None", surgeries: "None", familyHistory: "None" },
      bloodGroup: "B+", allergies: "None", mobile: `98${Math.floor(Math.random() * 90000000) + 10000000}`, flags: [], admitted: `28 Jun 2026 · ${hour}:${min}`, ipNumber: `IP-240${uhidNum}`, opNumber: "—", vitalsOverdue: false, labsUnreviewed: false,
      dischargeClearances: { clinical: false, billing: false, summaryReady: false }
    });
  }

  // Generate 3 active OPD rows
  for (let i = 0; i < 3; i++) {
    const fn = firstNames[Math.floor(Math.random() * firstNames.length)];
    const ln = lastNames[Math.floor(Math.random() * lastNames.length)];
    const uhidNum = 4900 + i;
    const hour = String(9 + Math.floor(Math.random() * 5)).padStart(2, '0');
    const min = String(Math.floor(Math.random() * 60)).padStart(2, '0');
    generated.push({
      uhid: `SH-2026-0${uhidNum}`, name: `${fn} ${ln}`, age: Math.floor(Math.random() * 60) + 18, gender: Math.random() > 0.5 ? "Male" : "Female",
      type: "OPD", ward: "OPD Room 2", bed: "—", los: 1,
      primaryConsultant: docs[Math.floor(Math.random() * docs.length)], department: depts[Math.floor(Math.random() * depts.length)],
      payer: "Self Pay", payerType: "Cash", preAuthStatus: "—",
      alerts: [], newsScore: 0, status: "In Consultation", lastActivity: "Registry",
      vitals: { bp: "120/80", hr: 72, temp: 98.4, spo2: 98, weight: 70, bmi: 22.8, pain: 0, rr: 16 },
      prescriptions: [],
      clinicalData: { complaint: "Consultation", hpi: "None", examination: "NAD", diagnosis: "Evaluation", treatmentPlan: "Advice", carePlan: "Follow up" },
      history: { pastConditions: "None", surgeries: "None", familyHistory: "None" },
      bloodGroup: "O+", allergies: "None", mobile: `97${Math.floor(Math.random() * 90000000) + 10000000}`, flags: [], admitted: `28 Jun 2026 · ${hour}:${min}`, ipNumber: "—", opNumber: `OP-240${uhidNum}`, vitalsOverdue: false, labsUnreviewed: false,
      dischargeClearances: { clinical: false, billing: false, summaryReady: false }
    });
  }

  // Generate 66 active Daycare rows
  for (let i = 0; i < 66; i++) {
    const fn = firstNames[Math.floor(Math.random() * firstNames.length)];
    const ln = lastNames[Math.floor(Math.random() * lastNames.length)];
    const uhidNum = 5000 + i;
    const hour = String(8 + Math.floor(Math.random() * 6)).padStart(2, '0');
    const min = String(Math.floor(Math.random() * 60)).padStart(2, '0');
    generated.push({
      uhid: `SH-2026-0${uhidNum}`, name: `${fn} ${ln}`, age: Math.floor(Math.random() * 60) + 18, gender: Math.random() > 0.5 ? "Male" : "Female",
      type: "Daycare", ward: "Daycare Bay", bed: `D-${String(i+10).padStart(2,'0')}`, los: 1,
      primaryConsultant: docs[Math.floor(Math.random() * docs.length)], department: depts[Math.floor(Math.random() * depts.length)],
      payer: payers[Math.floor(Math.random() * payers.length)], payerType: "TPA/Insurance", preAuthStatus: "LOA ✓",
      alerts: [], newsScore: 0, status: "Under Observation", lastActivity: "Dressing",
      vitals: { bp: "120/80", hr: 72, temp: 98.4, spo2: 98, weight: 70, bmi: 22.8, pain: 0, rr: 16 },
      prescriptions: [],
      clinicalData: { complaint: "Evaluation", hpi: "None", examination: "NAD", diagnosis: "Evaluation", treatmentPlan: "Monitoring", carePlan: "Routine check" },
      history: { pastConditions: "None", surgeries: "None", familyHistory: "None" },
      bloodGroup: "A+", allergies: "None", mobile: `96${Math.floor(Math.random() * 90000000) + 10000000}`, flags: [], admitted: `28 Jun 2026 · ${hour}:${min}`, ipNumber: "—", opNumber: `OP-240${uhidNum}`, vitalsOverdue: false, labsUnreviewed: false,
      dischargeClearances: { clinical: false, billing: false, summaryReady: false }
    });
  }

  // Generate 3 additional Discharged rows
  for (let i = 0; i < 3; i++) {
    const fn = firstNames[Math.floor(Math.random() * firstNames.length)];
    const ln = lastNames[Math.floor(Math.random() * lastNames.length)];
    const uhidNum = 5100 + i;
    const hour = String(7 + Math.floor(Math.random() * 4)).padStart(2, '0');
    const min = String(Math.floor(Math.random() * 60)).padStart(2, '0');
    generated.push({
      uhid: `SH-2026-0${uhidNum}`, name: `${fn} ${ln}`, age: Math.floor(Math.random() * 60) + 18, gender: Math.random() > 0.5 ? "Male" : "Female",
      type: i === 0 ? "IPD" : "Daycare", ward: i === 0 ? "General Ward" : "Daycare Bay", bed: i === 0 ? "B-32" : "D-18", los: 2,
      primaryConsultant: docs[Math.floor(Math.random() * docs.length)], department: depts[Math.floor(Math.random() * depts.length)],
      payer: payers[Math.floor(Math.random() * payers.length)], payerType: "TPA/Insurance", preAuthStatus: "LOA ✓",
      alerts: [], newsScore: 0, status: "Discharged", lastActivity: "Discharged",
      vitals: { bp: "120/80", hr: 72, temp: 98.4, spo2: 98, weight: 70, bmi: 22.8, pain: 0, rr: 16 },
      prescriptions: [],
      clinicalData: { complaint: "Evaluation", hpi: "None", examination: "NAD", diagnosis: "Evaluation", treatmentPlan: "Discharge", carePlan: "Home advice" },
      history: { pastConditions: "None", surgeries: "None", familyHistory: "None" },
      bloodGroup: "B+", allergies: "None", mobile: `95${Math.floor(Math.random() * 90000000) + 10000000}`, flags: [], admitted: `28 Jun 2026 · ${hour}:${min}`, ipNumber: i === 0 ? `IP-240${uhidNum}` : "—", opNumber: i === 0 ? "—" : `OP-240${uhidNum}`, vitalsOverdue: false, labsUnreviewed: false,
      dischargeClearances: { clinical: true, billing: true, summaryReady: true }
    });
  }

  const patients = [...staticRows, ...generated];
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
// 1. MASTER PATIENT REGISTRY (PART A) - Overhauled to Patient Records list
// --------------------------------------------------------------------------
function renderMasterPatientRegistry(container) {
  ensure307PatientsExist();

  // Initialize active search tab and filters
  if (window.activePatientsTab === undefined) {
    window.activePatientsTab = 'All';
  }
  if (window.patientsFilters === undefined) {
    window.patientsFilters = { dept: 'All', doctor: 'All', ward: 'All', payer: 'All', dateRange: 'Today', fromDate: '', toDate: '' };
  }
  if (window.patientsSort === undefined) {
    window.patientsSort = 'Admission Time ↓';
  }
  if (window.patientsSearchQuery === undefined) {
    window.patientsSearchQuery = '';
  }

  // Inject Google Font
  if (!document.getElementById('outfit-font-link')) {
    const link = document.createElement('link');
    link.id = 'outfit-font-link';
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&display=swap';
    document.head.appendChild(link);
  }

  // Inject styles to override container layout cleanly
  const workspaceStyles = `
    <style>
      .pr-wrap {
        font-family: 'Outfit', sans-serif;
        font-size: 13px;
        color: var(--text);
        background: var(--bg);
        display: flex;
        flex-direction: column;
        gap: 16px;
        padding: 16px;
      }
      .pr-wrap .mono {
        font-family: monospace;
      }
      .pr-card {
        background: var(--surface);
        border: 1px solid var(--border);
        border-radius: 8px;
        padding: 16px;
        box-shadow: 0 1px 2px rgba(0,0,0,0.02);
      }
      
      /* Stats Row */
      .pr-stats-row {
        display: flex;
        gap: 12px;
        overflow-x: auto;
        scrollbar-width: none; /* Firefox */
        padding-bottom: 4px;
      }
      .pr-stats-row::-webkit-scrollbar {
        display: none; /* Chrome/Safari */
      }
      .pr-stat-card {
        flex: 0 0 160px;
        background: var(--surface);
        border: 1px solid var(--border);
        border-radius: 8px;
        padding: 12px 14px;
        cursor: pointer;
        position: relative;
        overflow: hidden;
        transition: all 0.15s ease-in-out;
        display: flex;
        flex-direction: column;
        gap: 2px;
      }
      .pr-stat-card::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 3px;
        background: var(--accent-color, var(--blue));
      }
      .pr-stat-card:hover {
        box-shadow: 0 2px 8px rgba(0,0,0,0.06);
        border-color: #cbd5e1;
      }
      .pr-stat-card.active {
        background: var(--accent-light, var(--blue-light));
        border-color: var(--accent-color, var(--blue));
      }
      .pr-stat-val {
        font-size: 24px;
        font-weight: 600;
        color: var(--accent-color, var(--blue));
        font-family: monospace;
        line-height: 1.1;
      }
      .pr-stat-label {
        font-size: 11px;
        color: var(--text3);
        text-transform: uppercase;
        letter-spacing: 0.5px;
        font-weight: 500;
      }
      .pr-stat-dimmed {
        opacity: 0.5;
      }

      /* Filter Tabs */
      .pr-tabs-strip {
        display: flex;
        border-bottom: 1px solid var(--border);
        overflow-x: auto;
        scrollbar-width: none;
        gap: 4px;
      }
      .pr-tabs-strip::-webkit-scrollbar {
        display: none;
      }
      .pr-tab {
        padding: 8px 16px;
        font-size: 13px;
        font-weight: 500;
        color: var(--text2);
        cursor: pointer;
        border-bottom: 2px solid transparent;
        white-space: nowrap;
        display: flex;
        align-items: center;
        gap: 6px;
        transition: all 0.15s;
      }
      .pr-tab:hover {
        background: var(--surface2);
      }
      .pr-tab.active {
        border-bottom-color: var(--blue);
        color: var(--blue);
        background: var(--blue-light);
      }
      .pr-tab.dimmed {
        color: var(--text3);
      }
      .pr-dot-red { color: var(--red); }
      .pr-dot-amber { color: var(--amber); }

      /* Search & Action */
      .pr-search-row {
        display: flex;
        gap: 12px;
        align-items: center;
        position: relative;
      }
      .pr-search-wrapper {
        flex: 1;
        position: relative;
        display: flex;
        align-items: center;
      }
      .pr-search-icon {
        position: absolute;
        left: 10px;
        color: var(--text3);
        pointer-events: none;
      }
      .pr-search-clear {
        position: absolute;
        right: 10px;
        color: var(--text3);
        cursor: pointer;
        font-size: 16px;
        user-select: none;
      }
      .pr-search-clear:hover {
        color: var(--text);
      }
      .pr-search-input {
        width: 100%;
        padding: 8px 10px 8px 30px;
        border: 1px solid var(--border);
        border-radius: 8px;
        outline: none;
        font-size: 13px;
        transition: border-color 0.15s;
      }
      .pr-search-input:focus {
        border-color: var(--blue);
      }
      .pr-btn-add {
        background: var(--blue);
        color: #fff;
        border: none;
        border-radius: 8px;
        padding: 8px 16px;
        font-size: 13px;
        font-weight: 500;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 6px;
        white-space: nowrap;
        height: 34px;
      }
      .pr-btn-add:hover {
        background: #082d6b;
      }

      /* Suggestive Dropdown */
      .pr-search-dropdown {
        position: absolute;
        top: 36px;
        left: 0;
        right: 0;
        background: var(--surface);
        border: 1px solid var(--border);
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.08);
        z-index: 100;
        max-height: 280px;
        overflow-y: auto;
      }
      .pr-search-result-row {
        padding: 8px 12px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        cursor: pointer;
        border-bottom: 1px solid var(--border);
      }
      .pr-search-result-row:last-child {
        border-bottom: none;
      }
      .pr-search-result-row.selected, .pr-search-result-row:hover {
        background: var(--blue-light);
      }
      .pr-avatar {
        width: 28px;
        height: 28px;
        border-radius: 50%;
        background: var(--blue-light);
        color: var(--blue);
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 600;
        font-size: 11px;
      }
      .pr-dropdown-view-all {
        text-align: center;
        padding: 8px;
        font-weight: 600;
        color: var(--blue);
        cursor: pointer;
        background: var(--surface2);
        font-size: 12px;
      }
      .pr-dropdown-view-all:hover {
        background: #e2e8f0;
      }

      /* Secondary Filters */
      .pr-filters-row {
        display: flex;
        gap: 8px;
        align-items: center;
        flex-wrap: wrap;
      }
      .pr-filter-select {
        height: 32px;
        border: 1px solid var(--border);
        border-radius: 8px;
        background: var(--surface);
        padding: 0 8px;
        font-size: 13px;
        outline: none;
        color: var(--text2);
        cursor: pointer;
      }
      .pr-filter-select.active {
        border-color: var(--blue);
        background: var(--blue-light);
        color: var(--blue);
        font-weight: 500;
      }
      .pr-clear-link {
        font-size: 13px;
        font-weight: 500;
        color: var(--blue);
        cursor: pointer;
        text-decoration: none;
        margin-left: auto;
        user-select: none;
      }
      .pr-clear-link:hover {
        text-decoration: underline;
      }

      /* Results & Sort */
      .pr-results-bar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 12px;
        color: var(--text2);
        font-weight: 500;
      }

      /* Table */
      .pr-table-container {
        overflow-x: auto;
        border: 1px solid var(--border);
        border-radius: 8px;
        background: var(--surface);
      }
      .pr-table {
        width: 100%;
        border-collapse: collapse;
        text-align: left;
      }
      .pr-table th {
        background: var(--surface2);
        padding: 10px 12px;
        font-weight: 600;
        color: var(--text2);
        border-bottom: 1px solid var(--border);
      }
      .pr-table td {
        padding: 10px 12px;
        border-bottom: 1px solid var(--border);
        vertical-align: middle;
      }
      .pr-table tbody tr {
        cursor: pointer;
        background: var(--surface);
        transition: background 0.1s;
      }
      .pr-table tbody tr:nth-child(even) {
        background: var(--surface);
      }
      .pr-table tbody tr:nth-child(odd) {
        background: var(--surface2);
      }
      .pr-table tbody tr:hover {
        background: var(--blue-light) !important;
      }
      
      /* Badges */
      .pr-badge {
        display: inline-block;
        padding: 2px 8px;
        border-radius: 4px;
        font-size: 11px;
        font-weight: 600;
        text-transform: uppercase;
      }
      .badge-ipd { background: var(--purple-light); color: var(--purple); }
      .badge-opd { background: var(--blue-light); color: var(--blue); }
      .badge-emergency { background: var(--red-light); color: var(--red); }
      .badge-daycare { background: #ecfeff; color: #0891b2; }

      .status-admitted { background: var(--green-light); color: var(--green); }
      .status-consultation { background: var(--blue-light); color: var(--blue); }
      .status-observation { background: var(--amber-light); color: var(--amber); }
      .status-preop { background: var(--purple-light); color: var(--purple); }
      .status-postop { background: var(--purple-light); color: var(--purple); }
      .status-discharged { background: #f1f5f9; color: var(--text3); }
      .status-pending { background: var(--amber-light); color: var(--amber); }
      .status-critical { background: var(--red-light); color: var(--red); }
      .status-lama { background: var(--red-light); color: var(--red); }

      .flag-pill {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        padding: 2px 6px;
        border-radius: 4px;
        font-size: 10px;
        font-weight: 600;
      }
      .flag-critical { background: var(--red-light); color: var(--red); }
      .flag-mlc { background: var(--amber-light); color: var(--amber); }
      .flag-dnr { background: #f1f5f9; color: var(--text2); }
      .flag-lama { background: var(--amber-light); color: var(--amber); }

      .btn-view {
        background: transparent;
        border: 1px solid var(--blue);
        color: var(--blue);
        padding: 2px 8px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 11px;
        font-weight: 600;
      }
      .btn-view:hover {
        background: var(--blue-light);
      }
      
      /* Dropdown Actions */
      .kebab-trigger {
        background: transparent;
        border: none;
        color: var(--text2);
        cursor: pointer;
        font-size: 16px;
        padding: 4px 8px;
      }
      .kebab-menu {
        position: absolute;
        right: 12px;
        background: var(--surface);
        border: 1px solid var(--border);
        border-radius: 6px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        z-index: 110;
        display: flex;
        flex-direction: column;
        width: 140px;
      }
      .kebab-item {
        padding: 6px 12px;
        text-align: left;
        font-size: 12px;
        border: none;
        background: transparent;
        color: var(--text2);
        cursor: pointer;
      }
      .kebab-item:hover {
        background: var(--surface2);
        color: var(--text);
      }

      /* Toast notifications */
      .pr-toast {
        position: fixed;
        bottom: 24px;
        right: 24px;
        background: #0f172a;
        color: #fff;
        padding: 10px 18px;
        border-radius: 6px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        font-size: 13px;
        font-weight: 500;
        z-index: 1000;
        display: flex;
        align-items: center;
        gap: 8px;
        animation: slideUp 0.2s ease-out;
      }
      @keyframes slideUp {
        from { transform: translateY(12px); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
      }

      /* Empty State */
      .pr-empty-state {
        padding: 48px 16px;
        text-align: center;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 10px;
        background: var(--surface);
        border-radius: 8px;
      }
    </style>
  `;

  function draw() {
    const data = window.state.patients;
    const activeTab = window.activePatientsTab;
    const filters = window.patientsFilters;
    const sort = window.patientsSort;
    const query = window.patientsSearchQuery;

    // Compute dynamic stats
    const countTotal = data.length;
    const countIpdActive = data.filter(p => p.type === 'IPD' && p.status !== 'Discharged').length;
    const countOpdToday = data.filter(p => p.type === 'OPD').length;
    const countEmergencyActive = data.filter(p => p.type === 'Emergency' && p.status !== 'Discharged').length;
    const countDaycareActive = data.filter(p => p.type === 'Daycare' && p.status !== 'Discharged').length;
    const countDischargedToday = data.filter(p => p.status === 'Discharged').length;
    const countCritical = data.filter(p => p.status === 'Critical' || p.flags.includes('Critical')).length;
    const countMlcActive = data.filter(p => p.flags.includes('MLC') && p.status !== 'Discharged').length;
    const countDischargePending = data.filter(p => p.status === 'Discharge Pending').length;

    // Filter logic
    let filtered = data;

    // Tab filtering
    if (activeTab === 'IPD') {
      filtered = filtered.filter(p => p.type === 'IPD' && p.status !== 'Discharged');
    } else if (activeTab === 'OPD') {
      filtered = filtered.filter(p => p.type === 'OPD');
    } else if (activeTab === 'Emergency') {
      filtered = filtered.filter(p => p.type === 'Emergency' && p.status !== 'Discharged');
    } else if (activeTab === 'Daycare') {
      filtered = filtered.filter(p => p.type === 'Daycare' && p.status !== 'Discharged');
    } else if (activeTab === 'Discharged Today') {
      filtered = filtered.filter(p => p.status === 'Discharged');
    } else if (activeTab === 'Critical') {
      filtered = filtered.filter(p => p.status === 'Critical' || p.flags.includes('Critical'));
    } else if (activeTab === 'MLC') {
      filtered = filtered.filter(p => p.flags.includes('MLC'));
    } else if (activeTab === 'Discharge Pending') {
      filtered = filtered.filter(p => p.status === 'Discharge Pending');
    }

    // Secondary filters
    if (filters.dept !== 'All') {
      filtered = filtered.filter(p => p.department === filters.dept);
    }
    if (filters.doctor !== 'All') {
      filtered = filtered.filter(p => p.primaryConsultant === filters.doctor);
    }
    if (filters.ward !== 'All') {
      filtered = filtered.filter(p => p.ward === filters.ward);
    }
    if (filters.payer !== 'All') {
      filtered = filtered.filter(p => p.payer === filters.payer);
    }
    // Date filtering
    if (filters.dateRange === 'Custom Range' && filters.fromDate && filters.toDate) {
      const from = new Date(filters.fromDate);
      const to = new Date(filters.toDate);
      filtered = filtered.filter(p => {
        if (!p.admitted) return false;
        const parts = p.admitted.split(' · ')[0].split(' ');
        const months = { 'Jan':0, 'Feb':1, 'Mar':2, 'Apr':3, 'May':4, 'Jun':5, 'Jul':6, 'Aug':7, 'Sep':8, 'Oct':9, 'Nov':10, 'Dec':11 };
        const pDate = new Date(parseInt(parts[2]), months[parts[1]], parseInt(parts[0]));
        return pDate >= from && pDate <= to;
      });
    } else if (filters.dateRange === 'Yesterday') {
      filtered = filtered.filter(p => p.admitted && p.admitted.includes('27 Jun 2026'));
    } else if (filters.dateRange === 'Today') {
      filtered = filtered.filter(p => p.admitted && p.admitted.includes('28 Jun 2026'));
    }

    // Search Query
    if (query.trim().length >= 2) {
      const q = query.toLowerCase().trim();
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(q) ||
        p.uhid.toLowerCase().includes(q) ||
        (p.mobile && p.mobile.includes(q)) ||
        (p.bed && p.bed.toLowerCase().includes(q))
      );
    }

    // Sort
    if (sort === 'Admission Time ↓') {
      filtered.sort((a,b) => (b.admitted || '').localeCompare(a.admitted || ''));
    } else if (sort === 'Name A–Z') {
      filtered.sort((a,b) => a.name.localeCompare(b.name));
    } else if (sort === 'UHID') {
      filtered.sort((a,b) => a.uhid.localeCompare(b.uhid));
    } else if (sort === 'Criticality') {
      const criticalOrder = { 'Critical': 3, 'Admitted': 1, 'In Consultation': 0, 'Discharged': -1 };
      filtered.sort((a,b) => (criticalOrder[b.status] || 0) - (criticalOrder[a.status] || 0));
    } else if (sort === 'Discharge Time') {
      filtered.sort((a,b) => (b.admitted || '').localeCompare(a.admitted || ''));
    }

    // Render Stats Cards Row
    const statsHtml = `
      <div class="pr-stats-row">
        <div class="pr-stat-card ${activeTab === 'All' ? 'active' : ''}" style="--accent-color: var(--blue); --accent-light: var(--blue-light);" onclick="window.prSelectTab('All')">
          <span class="pr-stat-val">${countTotal}</span>
          <span class="pr-stat-label">Total Patients Today</span>
        </div>
        <div class="pr-stat-card ${activeTab === 'IPD' ? 'active' : ''}" style="--accent-color: var(--purple); --accent-light: var(--purple-light);" onclick="window.prSelectTab('IPD')">
          <span class="pr-stat-val">${countIpdActive}</span>
          <span class="pr-stat-label">IPD Active</span>
        </div>
        <div class="pr-stat-card ${activeTab === 'OPD' ? 'active' : ''}" style="--accent-color: var(--blue); --accent-light: var(--blue-light);" onclick="window.prSelectTab('OPD')">
          <span class="pr-stat-val">${countOpdToday}</span>
          <span class="pr-stat-label">OPD Today</span>
        </div>
        <div class="pr-stat-card ${activeTab === 'Emergency' ? 'active' : ''} ${countEmergencyActive === 0 ? 'pr-stat-dimmed' : ''}" style="--accent-color: var(--red); --accent-light: var(--red-light);" onclick="window.prSelectTab('Emergency')">
          <span class="pr-stat-val" style="color: ${countEmergencyActive === 0 ? 'var(--text3)' : 'var(--red)'};">${countEmergencyActive}</span>
          <span class="pr-stat-label">Emergency</span>
        </div>
        <div class="pr-stat-card ${activeTab === 'Daycare' ? 'active' : ''}" style="--accent-color: var(--cyan); --accent-light: var(--cyan-light);" onclick="window.prSelectTab('Daycare')">
          <span class="pr-stat-val" style="color: #0891b2;">${countDaycareActive}</span>
          <span class="pr-stat-label">Daycare</span>
        </div>
        <div class="pr-stat-card ${activeTab === 'Discharged Today' ? 'active' : ''}" style="--accent-color: var(--green); --accent-light: var(--green-light);" onclick="window.prSelectTab('Discharged Today')">
          <span class="pr-stat-val" style="color: var(--green);">${countDischargedToday}</span>
          <span class="pr-stat-label">Discharged Today</span>
        </div>
        <div class="pr-stat-card ${activeTab === 'Critical' ? 'active' : ''} ${countCritical === 0 ? 'pr-stat-dimmed' : ''}" style="--accent-color: var(--red); --accent-light: var(--red-light);" onclick="window.prSelectTab('Critical')">
          <span class="pr-stat-val" style="color: ${countCritical === 0 ? 'var(--text3)' : 'var(--red)'};">${countCritical}</span>
          <span class="pr-stat-label">Critical</span>
        </div>
        <div class="pr-stat-card ${activeTab === 'MLC' ? 'active' : ''}" style="--accent-color: var(--amber); --accent-light: var(--amber-light);" onclick="window.prSelectTab('MLC')">
          <span class="pr-stat-val" style="color: var(--amber);">${countMlcActive}</span>
          <span class="pr-stat-label">MLC Active</span>
        </div>
        <div class="pr-stat-card ${activeTab === 'Discharge Pending' ? 'active' : ''} ${countDischargePending === 0 ? 'pr-stat-dimmed' : ''}" style="--accent-color: var(--amber); --accent-light: var(--amber-light);" onclick="window.prSelectTab('Discharge Pending')">
          <span class="pr-stat-val" style="color: ${countDischargePending === 0 ? 'var(--text3)' : 'var(--amber)'};">${countDischargePending}</span>
          <span class="pr-stat-label">Discharge Pending</span>
        </div>
      </div>
    `;

    // Render Tabs
    const tabsHtml = `
      <div class="pr-tabs-strip">
        <div class="pr-tab ${activeTab === 'All' ? 'active' : ''}" onclick="window.prSelectTab('All')">All (${countTotal})</div>
        <div class="pr-tab ${activeTab === 'IPD' ? 'active' : ''} ${countIpdActive === 0 ? 'dimmed' : ''}" onclick="window.prSelectTab('IPD')">IPD (${countIpdActive})</div>
        <div class="pr-tab ${activeTab === 'OPD' ? 'active' : ''} ${countOpdToday === 0 ? 'dimmed' : ''}" onclick="window.prSelectTab('OPD')">OPD (${countOpdToday})</div>
        <div class="pr-tab ${activeTab === 'Emergency' ? 'active' : ''} ${countEmergencyActive === 0 ? 'dimmed' : ''}" onclick="window.prSelectTab('Emergency')">Emergency (${countEmergencyActive})</div>
        <div class="pr-tab ${activeTab === 'Daycare' ? 'active' : ''} ${countDaycareActive === 0 ? 'dimmed' : ''}" onclick="window.prSelectTab('Daycare')">Daycare (${countDaycareActive})</div>
        <div class="pr-tab ${activeTab === 'Discharged Today' ? 'active' : ''} ${countDischargedToday === 0 ? 'dimmed' : ''}" onclick="window.prSelectTab('Discharged Today')">Discharged Today (${countDischargedToday})</div>
        <div class="pr-tab ${activeTab === 'Critical' ? 'active' : ''} ${countCritical === 0 ? 'dimmed' : ''}" onclick="window.prSelectTab('Critical')"><span class="pr-dot-red">🔴</span> Critical (${countCritical})</div>
        <div class="pr-tab ${activeTab === 'MLC' ? 'active' : ''} ${countMlcActive === 0 ? 'dimmed' : ''}" onclick="window.prSelectTab('MLC')"><span class="pr-dot-amber">🟡</span> MLC (${countMlcActive})</div>
        <div class="pr-tab ${activeTab === 'Discharge Pending' ? 'active' : ''} ${countDischargePending === 0 ? 'dimmed' : ''}" onclick="window.prSelectTab('Discharge Pending')">Discharge Pending (${countDischargePending})</div>
      </div>
    `;

    const filtersActive = filters.dept !== 'All' || filters.doctor !== 'All' || filters.ward !== 'All' || filters.payer !== 'All' || filters.dateRange !== 'Today' || query.trim().length >= 2;

    const depts = ["All Departments", "General Medicine", "Orthopaedics", "Psychiatry", "Cardiology", "Neurology", "Paediatrics", "Gynaecology", "Surgery", "ENT", "Dermatology", "ICU"];
    const doctors = ["All Doctors", "Dr. Srinivasan", "Dr. Mehta", "Dr. Krishnamurthy", "Dr. Anand", "Dr. Fatima Sheikh", "Dr. Ramesh Iyer", "Dr. Priya Nair"];
    const wardsList = ["All Wards", "General Ward", "Semi-Private", "Private", "ICU", "HDU", "Daycare Bay", "Emergency Bay"];
    const payersList = ["All Payers", "Self Pay", "Star Health", "HDFC ERGO", "New India Assurance", "United India", "ECHS", "CGHS", "PMJAY", "ESI", "Corporate"];
    const dateRanges = ["Today", "Yesterday", "Last 7 Days", "This Month", "Custom Range"];

    const dropdownsHtml = `
      <div class="pr-filters-row">
        <select class="pr-filter-select ${filters.dept !== 'All' ? 'active' : ''}" onchange="window.prSetFilter('dept', this.value)">
          ${depts.map(d => `<option value="${d === 'All Departments' ? 'All' : d}" ${filters.dept === (d === 'All Departments' ? 'All' : d) ? 'selected' : ''}>${d}</option>`).join('')}
        </select>
        <select class="pr-filter-select ${filters.doctor !== 'All' ? 'active' : ''}" onchange="window.prSetFilter('doctor', this.value)">
          ${doctors.map(d => `<option value="${d === 'All Doctors' ? 'All' : d}" ${filters.doctor === (d === 'All Doctors' ? 'All' : d) ? 'selected' : ''}>${d}</option>`).join('')}
        </select>
        <select class="pr-filter-select ${filters.ward !== 'All' ? 'active' : ''}" onchange="window.prSetFilter('ward', this.value)">
          ${wardsList.map(w => `<option value="${w === 'All Wards' ? 'All' : w}" ${filters.ward === (w === 'All Wards' ? 'All' : w) ? 'selected' : ''}>${w}</option>`).join('')}
        </select>
        <select class="pr-filter-select ${filters.payer !== 'All' ? 'active' : ''}" onchange="window.prSetFilter('payer', this.value)">
          ${payersList.map(p => `<option value="${p === 'All Payers' ? 'All' : p}" ${filters.payer === (p === 'All Payers' ? 'All' : p) ? 'selected' : ''}>${p}</option>`).join('')}
        </select>
        <select class="pr-filter-select ${filters.dateRange !== 'Today' ? 'active' : ''}" onchange="window.prSetFilter('dateRange', this.value)">
          ${dateRanges.map(dr => `<option value="${dr}" ${filters.dateRange === dr ? 'selected' : ''}>${dr}</option>`).join('')}
        </select>

        ${filters.dateRange === 'Custom Range' ? `
          <div style="display:inline-flex; align-items:center; gap:4px; font-size:12px;">
            <input type="date" class="pr-filter-select" style="height:32px;" value="${filters.fromDate || ''}" onchange="window.prSetFilter('fromDate', this.value)">
            <span style="color:var(--text3);">to</span>
            <input type="date" class="pr-filter-select" style="height:32px;" value="${filters.toDate || ''}" onchange="window.prSetFilter('toDate', this.value)">
          </div>
        ` : ''}

        ${filtersActive ? `
          <span class="pr-clear-link" onclick="window.prClearAllFilters()">Clear Filters</span>
        ` : ''}
      </div>
    `;

    let tableBodyHtml = '';
    if (filtered.length === 0) {
      tableBodyHtml = `
        <tr>
          <td colspan="9" style="padding:0;">
            <div class="pr-empty-state">
              <span style="font-size:32px;">🔍</span>
              <strong style="font-size:14px; color:var(--text);">No patients match your filters</strong>
              <span style="color:var(--text2);">Try clearing filters or searching by a different term</span>
              <button class="pr-btn-add" style="margin-top:4px;" onclick="window.prClearAllFilters()">Clear Filters</button>
            </div>
          </td>
        </tr>
      `;
    } else {
      tableBodyHtml = filtered.map((p, idx) => {
        const initials = p.name.split(' ').map(n=>n[0]).join('').substring(0,2).toUpperCase();
        
        let tBadge = '';
        if (p.type === 'IPD') tBadge = '<span class="pr-badge badge-ipd">IPD</span>';
        else if (p.type === 'OPD') tBadge = '<span class="pr-badge badge-opd">OPD</span>';
        else if (p.type === 'Emergency') tBadge = '<span class="pr-badge badge-emergency">Emergency</span>';
        else if (p.type === 'Daycare') tBadge = '<span class="pr-badge badge-daycare">Daycare</span>';

        let sClass = '';
        if (p.status === 'Admitted') sClass = 'status-admitted';
        else if (p.status === 'In Consultation') sClass = 'status-consultation';
        else if (p.status === 'Under Observation') sClass = 'status-observation';
        else if (p.status === 'Pre-Op') sClass = 'status-preop';
        else if (p.status === 'Post-Op') sClass = 'status-postop';
        else if (p.status === 'Discharged') sClass = 'status-discharged';
        else if (p.status === 'Discharge Pending') sClass = 'status-pending';
        else if (p.status === 'Critical') sClass = 'status-critical';
        else if (p.status === 'LAMA') sClass = 'status-lama';

        const flagHtml = (p.flags || []).map(f => {
          if (f === 'Critical') return '<span class="flag-pill flag-critical">🔴 Critical</span>';
          if (f === 'MLC') return '<span class="flag-pill flag-mlc">⚖️ MLC</span>';
          if (f === 'DNR') return '<span class="flag-pill flag-dnr">DNR</span>';
          if (f === 'LAMA') return '<span class="flag-pill flag-lama">LAMA</span>';
          return '';
        }).join(' ');

        return `
          <tr onclick="window.prOpenRecord('${p.uhid}', '${p.name}')">
            <td>
              <div style="display:flex; align-items:center; gap:10px;">
                <div class="pr-avatar">${initials}</div>
                <div>
                  <div style="font-weight:600; color:var(--text);">${p.name}</div>
                  <div class="mono" style="font-size:11px; color:var(--text3);">${p.uhid}</div>
                </div>
              </div>
            </td>
            <td>${tBadge}</td>
            <td>
              <div style="font-weight:500; color:var(--text);">${p.department}</div>
              <div style="font-size:11px; color:var(--text3);">${p.primaryConsultant}</div>
            </td>
            <td>
              <div style="font-weight:500; color:var(--text);">${p.ward}</div>
              <div class="mono" style="font-size:11px; color:var(--text3);">${p.bed}</div>
            </td>
            <td style="font-weight:500; color:var(--text2);">${p.payer}</td>
            <td><span class="pr-badge ${sClass}">${p.status}</span></td>
            <td class="mono" style="font-size:11px; color:var(--text2);">${p.admitted || '—'}</td>
            <td>${flagHtml || '—'}</td>
            <td onclick="event.stopPropagation()">
              <div style="display:flex; align-items:center; gap:4px; position:relative;">
                <button class="btn-view" onclick="window.prOpenRecord('${p.uhid}', '${p.name}')">View &rarr;</button>
                <button class="kebab-trigger" onclick="window.prToggleKebab(event, ${idx})">⋮</button>
                <div id="kebab-menu-${idx}" class="kebab-menu" style="display:none; top: 26px;">
                  <button class="kebab-item" onclick="window.prKebabAction('${p.uhid}', '${p.name}', 'View Record')">View Record</button>
                  <button class="kebab-item" onclick="window.prKebabAction('${p.uhid}', '${p.name}', 'Edit Details')">Edit Details</button>
                  <button class="kebab-item" onclick="window.prKebabAction('${p.uhid}', '${p.name}', 'Print Summary')">Print Summary</button>
                  <button class="kebab-item" onclick="window.prKebabAction('${p.uhid}', '${p.name}', 'Transfer')">Transfer</button>
                  <button class="kebab-item" onclick="window.prKebabAction('${p.uhid}', '${p.name}', 'Initiate Discharge')">Initiate Discharge</button>
                </div>
              </div>
            </td>
          </tr>
        `;
      }).join('');
    }

    let dropdownHtml = '';
    if (query.trim().length >= 2) {
      const q = query.toLowerCase().trim();
      const matches = data.filter(p => 
        p.name.toLowerCase().includes(q) ||
        p.uhid.toLowerCase().includes(q) ||
        (p.mobile && p.mobile.includes(q)) ||
        (p.bed && p.bed.toLowerCase().includes(q))
      ).slice(0, 6);

      if (matches.length > 0) {
        dropdownHtml = `
          <div class="pr-search-dropdown">
            ${matches.map(m => {
              const initials = m.name.split(' ').map(n=>n[0]).join('').substring(0,2).toUpperCase();
              return `
                <div class="pr-search-result-row" onclick="window.prSelectDropdownRow('${m.uhid}', '${m.name}')">
                  <div style="display:flex; align-items:center; gap:8px;">
                    <div class="pr-avatar">${initials}</div>
                    <div>
                      <strong style="color:var(--text);">${m.name}</strong>
                      <div style="font-size:11px; color:var(--text2);">${m.type} &bull; ${m.ward} &bull; ${m.bed} &bull; ${m.primaryConsultant}</div>
                    </div>
                  </div>
                  <span class="mono" style="font-size:11px; color:var(--text3); font-weight:500;">${m.uhid}</span>
                </div>
              `;
            }).join('')}
            <div class="pr-dropdown-view-all" onclick="window.prCloseSearchDropdown()">View all results</div>
          </div>
        `;
      }
    }

    container.innerHTML = `
      ${workspaceStyles}
      <div class="pr-wrap">
        <!-- Summary Dashboard row -->
        ${statsHtml}

        <!-- Filter Tabs -->
        ${tabsHtml}

        <!-- Search + Action Row -->
        <div class="pr-search-row">
          <div class="pr-search-wrapper">
            <span class="pr-search-icon">🔍</span>
            <input type="text" class="pr-search-input" id="pr-search" placeholder="Search by name, UHID, mobile, IP/OP number..." value="${query}" autocomplete="off" oninput="window.prHandleSearch(this.value)">
            ${query ? `<span class="pr-search-clear" onclick="window.prClearSearch()">×</span>` : ''}
            ${dropdownHtml}
          </div>
          <button class="pr-btn-add" onclick="window.prAddPatient()">+ Add New Patient</button>
        </div>

        <!-- Secondary Filters Row -->
        ${dropdownsHtml}

        <!-- Results bar -->
        <div class="pr-results-bar">
          <span>Showing ${filtered.length} patients</span>
          <div style="display:flex; align-items:center; gap:6px;">
            <span>Sort:</span>
            <select class="pr-filter-select" style="height:28px; padding:0 4px; font-size:12px;" onchange="window.prSetSort(this.value)">
              ${['Admission Time ↓', 'Name A–Z', 'UHID', 'Criticality', 'Discharge Time'].map(s => `<option value="${s}" ${sort === s ? 'selected' : ''}>${s}</option>`).join('')}
            </select>
          </div>
        </div>

        <!-- Patient Table -->
        <div class="pr-table-container">
          <table class="pr-table">
            <colgroup>
              <col style="width: 220px;">
              <col style="width: 80px;">
              <col style="width: 160px;">
              <col style="width: 100px;">
              <col style="width: 120px;">
              <col style="width: 110px;">
              <col style="width: 100px;">
              <col style="width: 80px;">
              <col style="width: 80px;">
            </colgroup>
            <thead>
              <tr>
                <th>Patient</th>
                <th>Type</th>
                <th>Dept / Doctor</th>
                <th>Ward / Bed</th>
                <th>Payer</th>
                <th>Status</th>
                <th>Admitted</th>
                <th>Flags</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              ${tableBodyHtml}
            </tbody>
          </table>
        </div>
      </div>
    `;

    // Keyboard handling inside search input
    const searchEl = document.getElementById('pr-search');
    if (searchEl) {
      searchEl.addEventListener('keydown', function(e) {
        const rows = document.querySelectorAll('.pr-search-result-row');
        if (rows.length === 0) return;
        
        let activeIndex = -1;
        rows.forEach((r, i) => {
          if (r.classList.contains('selected')) activeIndex = i;
        });

        if (e.key === 'ArrowDown') {
          e.preventDefault();
          const nextIndex = (activeIndex + 1) % rows.length;
          rows.forEach(r => r.classList.remove('selected'));
          rows[nextIndex].classList.add('selected');
          rows[nextIndex].scrollIntoView({ block: 'nearest' });
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          const prevIndex = (activeIndex - 1 + rows.length) % rows.length;
          rows.forEach(r => r.classList.remove('selected'));
          rows[prevIndex].classList.add('selected');
          rows[prevIndex].scrollIntoView({ block: 'nearest' });
        } else if (e.key === 'Enter') {
          e.preventDefault();
          if (activeIndex !== -1) {
            const row = rows[activeIndex];
            // Extract click handler trigger
            row.click();
          }
        } else if (e.key === 'Escape') {
          window.prCloseSearchDropdown();
        }
      });
    }
  }

  // Bind actions
  window.prSelectTab = function(tabName) {
    window.activePatientsTab = tabName;
    draw();
  };

  window.prSetFilter = function(filterName, value) {
    window.patientsFilters[filterName] = value;
    draw();
  };

  window.prClearAllFilters = function() {
    window.patientsFilters = { dept: 'All', doctor: 'All', ward: 'All', payer: 'All', dateRange: 'Today', fromDate: '', toDate: '' };
    window.activePatientsTab = 'All';
    window.patientsSearchQuery = '';
    draw();
  };

  window.prSetSort = function(value) {
    window.patientsSort = value;
    draw();
  };

  window.prHandleSearch = function(value) {
    window.patientsSearchQuery = value;
    draw();
  };

  window.prClearSearch = function() {
    window.patientsSearchQuery = '';
    draw();
  };

  window.prCloseSearchDropdown = function() {
    window.patientsSearchQuery = '';
    draw();
  };

  window.prSelectDropdownRow = function(uhid, name) {
    window.patientsSearchQuery = '';
    window.prOpenRecord(uhid, name);
  };

  window.prAddPatient = function() {
    window.prShowToast("Opening registration...");
  };

  window.prOpenRecord = function(uhid, name) {
    window.prShowToast(`Opening patient record: ${name}...`);
    setTimeout(() => {
      window.router.navigate(`patients?uhid=${uhid}`);
    }, 400);
  };

  window.prToggleKebab = function(e, idx) {
    e.stopPropagation();
    document.querySelectorAll('.kebab-menu').forEach(menu => {
      if (menu.id !== `kebab-menu-${idx}`) {
        menu.style.display = 'none';
      }
    });
    const el = document.getElementById(`kebab-menu-${idx}`);
    if (el) {
      el.style.display = el.style.display === 'none' ? 'flex' : 'none';
    }
  };

  window.prKebabAction = function(uhid, name, action) {
    if (action === 'View Record') {
      window.prOpenRecord(uhid, name);
    } else {
      window.prShowToast(`${action} for ${name}...`);
    }
    document.querySelectorAll('.kebab-menu').forEach(menu => {
      menu.style.display = 'none';
    });
  };

  window.prShowToast = function(message) {
    const old = document.getElementById('pr-toast-notification');
    if (old) old.remove();

    const toast = document.createElement('div');
    toast.id = 'pr-toast-notification';
    toast.className = 'pr-toast';
    toast.innerHTML = `<span>🔔</span> <span>${message}</span>`;
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transition = 'opacity 0.25s';
      setTimeout(() => toast.remove(), 250);
    }, 2800);
  };

  // Close kebabs on click outside
  document.addEventListener('click', function() {
    document.querySelectorAll('.kebab-menu').forEach(menu => {
      menu.style.display = 'none';
    });
  });

  draw();
}
'''

with open(path, "r", encoding="utf-8") as f:
    src = f.read()

# Locate start and end of ensure307PatientsExist, renderMasterPatientRegistry, and helper functions up to renderPatient360Profile
start_marker = "function ensure307PatientsExist() {"
end_marker = "function renderPatient360Profile(container, patient, activeTab, activeVisit) {"

start_idx = src.find(start_marker)
end_idx = src.find(end_marker)

if start_idx == -1 or end_idx == -1:
    print("ERROR: Could not find function boundaries in patientsView.js")
    exit(1)

old_code = src[start_idx:end_idx]
print(f"Replacing {len(old_code):,} characters from patientsView.js...")

new_src = src[:start_idx] + NEW_REGISTRY_CODE + src[end_idx:]

with open(path, "w", encoding="utf-8") as f:
    f.write(new_src)

print("SUCCESS: patientsView.js successfully updated with the new Patient Records list.")
