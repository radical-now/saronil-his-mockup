/* ==========================================================================
   SARONIL HMS - CENTRAL SHARED STATE ENGINE (state.js)
   ========================================================================== */

const DOCTORS_DATABASE = [
  { id: "DOC01", name: "Dr. Srinivasan", spec: "General Medicine", room: "101", phone: "+91 98450 11021", status: "Active", regNo: "KMC-48902" },
  { id: "DOC02", name: "Dr. Ramesh Iyer", spec: "Pediatrics", room: "102", phone: "+91 98450 11022", status: "Active", regNo: "KMC-55921" },
  { id: "DOC03", name: "Dr. Krishnamurthy", spec: "Psychiatry", room: "103", phone: "+91 98450 11023", status: "Active", regNo: "KMC-60211" },
  { id: "DOC04", name: "Dr. Mehta", spec: "General Surgery", room: "104", phone: "+91 98450 11024", status: "Active", regNo: "MCI-40912" },
  { id: "DOC05", name: "Dr. Priya Nair", spec: "Gynecology & Obs", room: "105", phone: "+91 98450 11025", status: "Active", regNo: "KMC-77291" },
  { id: "DOC06", name: "Dr. Fatima Sheikh", spec: "Emergency Medicine", room: "106", phone: "+91 98450 11026", status: "Active", regNo: "MCI-88902" },
  { id: "DOC07", name: "Dr. Anand", spec: "Cardiology", room: "107", phone: "+91 98450 11027", status: "Active", regNo: "MCI-30219" },
  { id: "DOC08", name: "Dr. Abhishek Kumar", spec: "Cardiology", room: "108", phone: "+91 98450 11028", status: "Active", regNo: "MCI-33452" },
  { id: "DOC09", name: "Dr. Sunita Sharma", spec: "Cardiology", room: "109", phone: "+91 98450 11029", status: "Active", regNo: "MCI-44581" },
  { id: "DOC10", name: "Dr. Amit Patel", spec: "Pediatrics", room: "110", phone: "+91 98450 11030", status: "Active", regNo: "KMC-88123" },
  { id: "DOC11", name: "Dr. Mamta Kumari", spec: "Pediatrics", room: "111", phone: "+91 98450 11031", status: "Active", regNo: "KMC-89332" },
  { id: "DOC12", name: "Dr. Rajesh Singh", spec: "General Medicine", room: "112", phone: "+91 98450 11032", status: "Active", regNo: "KMC-90312" },
  { id: "DOC13", name: "Dr. Devanti Devi", spec: "General Medicine", room: "113", phone: "+91 98450 11033", status: "Active", regNo: "KMC-91404" },
  { id: "DOC14", name: "Dr. Munna Kumar", spec: "Orthopedics", room: "114", phone: "+91 98450 11034", status: "Active", regNo: "MCI-55429" },
  { id: "DOC15", name: "Dr. Sarah Jenkins", spec: "Orthopedics", room: "115", phone: "+91 98450 11035", status: "Active", regNo: "MCI-66291" },
  { id: "DOC16", name: "Dr. Arvind Prasad", spec: "Gynecology & Obs", room: "116", phone: "+91 98450 11036", status: "Active", regNo: "KMC-99882" },
  { id: "DOC17", name: "Dr. Preeti Reddy", spec: "Gynecology & Obs", room: "117", phone: "+91 98450 11037", status: "Active", regNo: "KMC-99001" },
  { id: "DOC18", name: "Dr. Ajay Kumar", spec: "Neurology", room: "118", phone: "+91 98450 11038", status: "Active", regNo: "MCI-70334" },
  { id: "DOC19", name: "Dr. Shrawan Kumar", spec: "Oncology", room: "119", phone: "+91 98450 11039", status: "Active", regNo: "MCI-80299" },
  { id: "DOC20", name: "Dr. Vijay Pipil", spec: "Dermatology", room: "120", phone: "+91 98450 11040", status: "Active", regNo: "MCI-90452" }
];

const state = {
  alerts: [],
  // 1. Doctors Database (20+ Specialists)
  // Nurses and staff definitions
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
  ],  doctors: DOCTORS_DATABASE,

  // 2. Wards & Beds configuration
  wards: {
    "GENERAL-WARD-M": { name: "General Ward (Male)", beds: ["GW(M)-409", "GW(M)-410", "GW(M)-411", "GW(M)-412", "GW(M)-413"], price: 1500 },
    "GENERAL-WARD-F": { name: "General Ward (Female)", beds: ["GW(F)-414", "GW(F)-415", "GW(F)-416", "GW(F)-417", "GW(F)-418"], price: 1500 },
    "SEMI-PRIVATE": { name: "Semi-Private Ward", beds: ["SP-301", "SP-302", "SP-303", "SP-304", "SP-305"], price: 3000 },
    "PRIVATE": { name: "Private Room", beds: ["PVT-201", "PVT-202", "PVT-203", "PVT-204", "PVT-205"], price: 6000 },
    "DELUXE": { name: "Deluxe Suite", beds: ["DELUXE-401", "DELUXE-402", "DELUXE-403", "DELUXE-404"], price: 12000 },
    "CCU": { name: "Critical Care Unit", beds: ["CCU-BED-01", "CCU-BED-02", "CCU-BED-03", "CCU-BED-04", "CCU-BED-05"], price: 10000 },
    "ICCU": { name: "Intensive Cardiac Care Unit", beds: ["ICCU-BED-01", "ICCU-BED-02", "ICCU-BED-03", "ICCU-BED-04"], price: 12000 },
    "EMERGENCY": { name: "Emergency Ward", beds: ["EMG-01", "EMG-02", "EMG-03", "EMG-04", "EMG-05"], price: 2500 },
    "DAYCARE": { name: "Daycare Unit", beds: ["DC-B1", "DC-B2", "DC-B3", "DC-B4", "DC-B5", "DC-B6", "DC-B7", "DC-B8", "DC-B9", "DC-B10"], price: 1500 }
  },

  // Bed status allocations (populated on startup or dynamically modified)
  bedsStatus: {},
  hkSlaLimit: 15,
  housekeepingTasks: [],
  bedAuditLogs: [],

  // 3. Patients Registry (50+ Detailed Indian Patients)
  patients: [],

  // 4. Clinical Appointments
  appointments: [],

  // 5. Inpatient Admissions Registry
  admissions: [],
  ipdAdmissionRequests: [],

  // 6. Universal Clinical Orders
  orders: [],

  // 6b. Lab & Radiology Order Queues (cross-module sync)
  labOrders: [],
  radOrders: [],

  // 7. Insurance / TPA Claims Logs
  claims: [],

  // 8. Invoicing & Billing logs
  billing: [],

  // 9. Blood Bank Stock (rupees based, bag history)
  bloodStock: {
    "A+": { bags: 12, components: { rbc: 6, platelets: 4, ffp: 2 } },
    "A-": { bags: 4, components: { rbc: 2, platelets: 1, ffp: 1 } },
    "B+": { bags: 15, components: { rbc: 8, platelets: 5, ffp: 2 } },
    "B-": { bags: 3, components: { rbc: 1, platelets: 1, ffp: 1 } },
    "O+": { bags: 18, components: { rbc: 10, platelets: 6, ffp: 2 } },
    "O-": { bags: 6, components: { rbc: 3, platelets: 2, ffp: 1 } },
    "AB+": { bags: 8, components: { rbc: 4, platelets: 3, ffp: 1 } },
    "AB-": { bags: 2, components: { rbc: 1, platelets: 1, ffp: 0 } }
  },
  bloodDonors: [],

  // 10. Inventory Levels
  inventory: {
    pharmacy: [
      {
        code: "PH-001",
        name: "Dolo 650",
        brandName: "Dolo 650",
        genericName: "Paracetamol",
        saltComposition: "Paracetamol 650mg",
        strength: "650mg",
        dosageForm: "Tablet",
        route: "Oral",
        manufacturer: "Micro Labs Ltd",
        packSize: "Strip of 15",
        stock: 0,
        minStock: 500,
        price: 15,
        expiry: "2027-12-01",
        category: "Analgesics",
        locations: { "Main Pharmacy": 0, "Emergency Pharmacy": 0, "IPD Pharmacy": 0, "OT Pharmacy": 0, "Satellite Pharmacy": 0 },
        pregnancyCategory: "B",
        lactationSafety: "Safe",
        kidneySafety: "No dose adjustment required",
        liverSafety: "Use with caution. Do not exceed 2g daily in liver impairment.",
        expiringSoon: false,
        coPrescribed: ["PH-004"]
      },
      {
        code: "PH-001B",
        name: "Crocin Advance",
        brandName: "Crocin Advance",
        genericName: "Paracetamol",
        saltComposition: "Paracetamol 650mg",
        strength: "650mg",
        dosageForm: "Tablet",
        route: "Oral",
        manufacturer: "GlaxoSmithKline",
        packSize: "Strip of 15",
        stock: 2400,
        minStock: 500,
        price: 18,
        expiry: "2027-10-10",
        category: "Analgesics",
        locations: { "Main Pharmacy": 1500, "Emergency Pharmacy": 500, "IPD Pharmacy": 400, "OT Pharmacy": 0, "Satellite Pharmacy": 0 },
        pregnancyCategory: "B",
        lactationSafety: "Safe",
        kidneySafety: "No dose adjustment required",
        liverSafety: "Use with caution.",
        expiringSoon: false,
        coPrescribed: ["PH-004"]
      },
      {
        code: "PH-001C",
        name: "Calpol 650",
        brandName: "Calpol 650",
        genericName: "Paracetamol",
        saltComposition: "Paracetamol 650mg",
        strength: "650mg",
        dosageForm: "Tablet",
        route: "Oral",
        manufacturer: "GSK Pharmaceuticals",
        packSize: "Strip of 15",
        stock: 1800,
        minStock: 500,
        price: 14,
        expiry: "2027-09-20",
        category: "Analgesics",
        locations: { "Main Pharmacy": 1000, "Emergency Pharmacy": 400, "IPD Pharmacy": 400, "OT Pharmacy": 0, "Satellite Pharmacy": 0 },
        pregnancyCategory: "B",
        lactationSafety: "Safe",
        kidneySafety: "No dose adjustment required",
        liverSafety: "Use with caution.",
        expiringSoon: false,
        coPrescribed: ["PH-004"]
      },
      {
        code: "PH-001D",
        name: "Pacimol 650",
        brandName: "Pacimol 650",
        genericName: "Paracetamol",
        saltComposition: "Paracetamol 650mg",
        strength: "650mg",
        dosageForm: "Tablet",
        route: "Oral",
        manufacturer: "Ipca Laboratories",
        packSize: "Strip of 15",
        stock: 40,
        minStock: 500,
        price: 12,
        expiry: "2027-11-05",
        category: "Analgesics",
        locations: { "Main Pharmacy": 40, "Emergency Pharmacy": 0, "IPD Pharmacy": 0, "OT Pharmacy": 0, "Satellite Pharmacy": 0 },
        pregnancyCategory: "B",
        lactationSafety: "Safe",
        kidneySafety: "No dose adjustment required",
        liverSafety: "Use with caution.",
        expiringSoon: false,
        coPrescribed: ["PH-004"]
      },
      {
        code: "PH-001E",
        name: "Paracetamol 650mg Generic",
        brandName: "Paracetamol 650mg Generic",
        genericName: "Paracetamol",
        saltComposition: "Paracetamol 650mg",
        strength: "650mg",
        dosageForm: "Tablet",
        route: "Oral",
        manufacturer: "Jan Aushadhi",
        packSize: "Strip of 10",
        stock: 5000,
        minStock: 1000,
        price: 5,
        expiry: "2028-01-01",
        category: "Analgesics",
        locations: { "Main Pharmacy": 3500, "Emergency Pharmacy": 0, "IPD Pharmacy": 1500, "OT Pharmacy": 0, "Satellite Pharmacy": 0 },
        pregnancyCategory: "B",
        lactationSafety: "Safe",
        kidneySafety: "No dose adjustment required",
        liverSafety: "Use with caution.",
        expiringSoon: false,
        coPrescribed: []
      },
      {
        code: "PH-001F",
        name: "Calpol 500",
        brandName: "Calpol 500",
        genericName: "Paracetamol",
        saltComposition: "Paracetamol 500mg",
        strength: "500mg",
        dosageForm: "Tablet",
        route: "Oral",
        manufacturer: "GSK Pharmaceuticals",
        packSize: "Strip of 15",
        stock: 3000,
        minStock: 400,
        price: 10,
        expiry: "2027-08-01",
        category: "Analgesics",
        locations: { "Main Pharmacy": 2000, "Emergency Pharmacy": 500, "IPD Pharmacy": 500, "OT Pharmacy": 0, "Satellite Pharmacy": 0 },
        pregnancyCategory: "B",
        lactationSafety: "Safe",
        kidneySafety: "No dose adjustment required",
        liverSafety: "Use with caution.",
        expiringSoon: false,
        coPrescribed: []
      },
      {
        code: "PH-001G",
        name: "Crocin Pediatric Drops",
        brandName: "Crocin Pediatric Drops",
        genericName: "Paracetamol",
        saltComposition: "Paracetamol 100mg/ml",
        strength: "100mg/ml",
        dosageForm: "Drops",
        route: "Oral",
        manufacturer: "GlaxoSmithKline",
        packSize: "15ml Bottle",
        stock: 800,
        minStock: 100,
        price: 40,
        expiry: "2027-06-01",
        category: "Analgesics",
        locations: { "Main Pharmacy": 500, "Emergency Pharmacy": 200, "IPD Pharmacy": 100, "OT Pharmacy": 0, "Satellite Pharmacy": 0 },
        pregnancyCategory: "B",
        lactationSafety: "Safe",
        kidneySafety: "No dose adjustment required",
        liverSafety: "Use with caution.",
        expiringSoon: false,
        coPrescribed: []
      },
      {
        code: "PH-001H",
        name: "Paracetamol IV 1000mg Injection",
        brandName: "Paracetamol IV 1000mg Injection",
        genericName: "Paracetamol",
        saltComposition: "Paracetamol 1000mg",
        strength: "1000mg",
        dosageForm: "Injection",
        route: "Intravenous",
        manufacturer: "Cipla Ltd",
        packSize: "100ml Vial",
        stock: 150,
        minStock: 20,
        price: 180,
        expiry: "2027-05-15",
        category: "Analgesics",
        locations: { "Main Pharmacy": 50, "Emergency Pharmacy": 30, "IPD Pharmacy": 50, "OT Pharmacy": 20, "Satellite Pharmacy": 0 },
        pregnancyCategory: "B",
        lactationSafety: "Safe",
        kidneySafety: "No dose adjustment required",
        liverSafety: "Use with caution.",
        expiringSoon: false,
        coPrescribed: []
      },
      {
        code: "PH-002",
        name: "Clavam 625",
        brandName: "Clavam 625",
        genericName: "Amoxicillin",
        saltComposition: "Amoxicillin 500mg + Clavulanic Acid 125mg",
        strength: "625mg",
        dosageForm: "Tablet",
        route: "Oral",
        manufacturer: "Alkem Laboratories",
        packSize: "Strip of 10",
        stock: 1200,
        minStock: 200,
        price: 120,
        expiry: "2027-08-15",
        category: "Antibiotics",
        locations: { "Main Pharmacy": 800, "Emergency Pharmacy": 200, "IPD Pharmacy": 200, "OT Pharmacy": 0, "Satellite Pharmacy": 0 },
        pregnancyCategory: "B",
        lactationSafety: "Safe",
        kidneySafety: "Reduce dose in severe renal impairment (eGFR < 30). Limit to Clavam 375 or QD.",
        liverSafety: "Use with caution. Monitor LFTs in prolonged therapy.",
        expiringSoon: false,
        coPrescribed: ["PH-004"]
      },
      {
        code: "PH-002B",
        name: "Novamox 500",
        brandName: "Novamox 500",
        genericName: "Amoxicillin",
        saltComposition: "Amoxicillin 500mg",
        strength: "500mg",
        dosageForm: "Tablet",
        route: "Oral",
        manufacturer: "Cipla Ltd",
        packSize: "Strip of 15",
        stock: 0,
        minStock: 200,
        price: 75,
        expiry: "2027-09-01",
        category: "Antibiotics",
        locations: { "Main Pharmacy": 0, "Emergency Pharmacy": 0, "IPD Pharmacy": 0, "OT Pharmacy": 0, "Satellite Pharmacy": 0 },
        pregnancyCategory: "B",
        lactationSafety: "Safe",
        kidneySafety: "Dose adjustment required in severe renal impairment (eGFR < 30).",
        liverSafety: "Safe",
        expiringSoon: false,
        coPrescribed: ["PH-004"]
      },
      {
        code: "PH-002C",
        name: "Mox 500",
        brandName: "Mox 500",
        genericName: "Amoxicillin",
        saltComposition: "Amoxicillin 500mg",
        strength: "500mg",
        dosageForm: "Tablet",
        route: "Oral",
        manufacturer: "Sun Pharma",
        packSize: "Strip of 15",
        stock: 1500,
        minStock: 200,
        price: 80,
        expiry: "2027-11-15",
        category: "Antibiotics",
        locations: { "Main Pharmacy": 1000, "Emergency Pharmacy": 200, "IPD Pharmacy": 300, "OT Pharmacy": 0, "Satellite Pharmacy": 0 },
        pregnancyCategory: "B",
        lactationSafety: "Safe",
        kidneySafety: "Dose adjustment required in severe renal impairment (eGFR < 30).",
        liverSafety: "Safe",
        expiringSoon: false,
        coPrescribed: ["PH-004"]
      },
      {
        code: "PH-002D",
        name: "Amoxycillin 500mg Generic",
        brandName: "Amoxycillin 500mg Generic",
        genericName: "Amoxicillin",
        saltComposition: "Amoxicillin 500mg",
        strength: "500mg",
        dosageForm: "Tablet",
        route: "Oral",
        manufacturer: "Jan Aushadhi",
        packSize: "Strip of 10",
        stock: 2000,
        minStock: 300,
        price: 30,
        expiry: "2028-03-01",
        category: "Antibiotics",
        locations: { "Main Pharmacy": 1500, "Emergency Pharmacy": 0, "IPD Pharmacy": 500, "OT Pharmacy": 0, "Satellite Pharmacy": 0 },
        pregnancyCategory: "B",
        lactationSafety: "Safe",
        kidneySafety: "Dose adjustment required in severe renal impairment (eGFR < 30).",
        liverSafety: "Safe",
        expiringSoon: false,
        coPrescribed: []
      },
      {
        code: "PH-003",
        name: "Glycomet 500",
        brandName: "Glycomet 500",
        genericName: "Metformin",
        saltComposition: "Metformin 500mg",
        strength: "500mg",
        dosageForm: "Tablet",
        route: "Oral",
        manufacturer: "USV Private Ltd",
        packSize: "Strip of 20",
        stock: 3200,
        minStock: 400,
        price: 45,
        expiry: "2028-02-10",
        category: "Anti-Diabetics",
        locations: { "Main Pharmacy": 2000, "Emergency Pharmacy": 400, "IPD Pharmacy": 800, "OT Pharmacy": 0, "Satellite Pharmacy": 0 },
        pregnancyCategory: "B",
        lactationSafety: "Caution",
        kidneySafety: "Contraindicated if eGFR < 30. Reduce dose if eGFR 30-45.",
        liverSafety: "Avoid in hepatic impairment due to lactic acidosis risk.",
        expiringSoon: false,
        coPrescribed: []
      },
      {
        code: "PH-003B",
        name: "Gluformin 500",
        brandName: "Gluformin 500",
        genericName: "Metformin",
        saltComposition: "Metformin 500mg",
        strength: "500mg",
        dosageForm: "Tablet",
        route: "Oral",
        manufacturer: "Abbott India",
        packSize: "Strip of 15",
        stock: 1500,
        minStock: 300,
        price: 40,
        expiry: "2028-01-15",
        category: "Anti-Diabetics",
        locations: { "Main Pharmacy": 1000, "Emergency Pharmacy": 200, "IPD Pharmacy": 300, "OT Pharmacy": 0, "Satellite Pharmacy": 0 },
        pregnancyCategory: "B",
        lactationSafety: "Caution",
        kidneySafety: "Contraindicated if eGFR < 30. Reduce dose if eGFR 30-45.",
        liverSafety: "Avoid in hepatic impairment.",
        expiringSoon: false,
        coPrescribed: []
      },
      {
        code: "PH-004",
        name: "Pan-D",
        brandName: "Pan-D",
        genericName: "Pantoprazole",
        saltComposition: "Pantoprazole 40mg + Domperidone 30mg",
        strength: "40mg",
        dosageForm: "Capsule",
        route: "Oral",
        manufacturer: "Alkem Laboratories",
        packSize: "Strip of 15",
        stock: 2500,
        minStock: 300,
        price: 90,
        expiry: "2027-10-22",
        category: "Antacids",
        locations: { "Main Pharmacy": 1500, "Emergency Pharmacy": 500, "IPD Pharmacy": 500, "OT Pharmacy": 0, "Satellite Pharmacy": 0 },
        pregnancyCategory: "C",
        lactationSafety: "Caution",
        kidneySafety: "No dose adjustment required.",
        liverSafety: "Safe in short term. Monitor in severe impairment.",
        expiringSoon: false,
        coPrescribed: []
      },
      {
        code: "PH-004B",
        name: "Pantocid 40",
        brandName: "Pantocid 40",
        genericName: "Pantoprazole",
        saltComposition: "Pantoprazole 40mg",
        strength: "40mg",
        dosageForm: "Tablet",
        route: "Oral",
        manufacturer: "Sun Pharma",
        packSize: "Strip of 15",
        stock: 2000,
        minStock: 300,
        price: 80,
        expiry: "2027-09-15",
        category: "Antacids",
        locations: { "Main Pharmacy": 1200, "Emergency Pharmacy": 400, "IPD Pharmacy": 400, "OT Pharmacy": 0, "Satellite Pharmacy": 0 },
        pregnancyCategory: "B",
        lactationSafety: "Safe",
        kidneySafety: "No dose adjustment required.",
        liverSafety: "Safe",
        expiringSoon: false,
        coPrescribed: []
      },
      {
        code: "PH-004C",
        name: "Pantoprazole 40mg Generic",
        brandName: "Pantoprazole 40mg Generic",
        genericName: "Pantoprazole",
        saltComposition: "Pantoprazole 40mg",
        strength: "40mg",
        dosageForm: "Tablet",
        route: "Oral",
        manufacturer: "Jan Aushadhi",
        packSize: "Strip of 10",
        stock: 3500,
        minStock: 500,
        price: 25,
        expiry: "2026-07-15",
        category: "Antacids",
        locations: { "Main Pharmacy": 2500, "Emergency Pharmacy": 500, "IPD Pharmacy": 500, "OT Pharmacy": 0, "Satellite Pharmacy": 0 },
        pregnancyCategory: "B",
        lactationSafety: "Safe",
        kidneySafety: "No dose adjustment required.",
        liverSafety: "Safe",
        expiringSoon: true,
        coPrescribed: []
      },
      {
        code: "PH-005",
        name: "Lipvas 10",
        brandName: "Lipvas 10",
        genericName: "Atorvastatin",
        saltComposition: "Atorvastatin 10mg",
        strength: "10mg",
        dosageForm: "Tablet",
        route: "Oral",
        manufacturer: "Cipla Ltd",
        packSize: "Strip of 15",
        stock: 1800,
        minStock: 250,
        price: 110,
        expiry: "2027-11-30",
        category: "Cardiovascular",
        locations: { "Main Pharmacy": 1000, "Emergency Pharmacy": 300, "IPD Pharmacy": 500, "OT Pharmacy": 0, "Satellite Pharmacy": 0 },
        pregnancyCategory: "X",
        lactationSafety: "Contraindicated",
        kidneySafety: "No dose adjustment required.",
        liverSafety: "Contraindicated in active liver disease.",
        expiringSoon: false,
        coPrescribed: []
      },
      {
        code: "PH-005B",
        name: "Atorva 10",
        brandName: "Atorva 10",
        genericName: "Atorvastatin",
        saltComposition: "Atorvastatin 10mg",
        strength: "10mg",
        dosageForm: "Tablet",
        route: "Oral",
        manufacturer: "Zydus Cadila",
        packSize: "Strip of 15",
        stock: 1500,
        minStock: 250,
        price: 105,
        expiry: "2027-12-15",
        category: "Cardiovascular",
        locations: { "Main Pharmacy": 1000, "Emergency Pharmacy": 200, "IPD Pharmacy": 300, "OT Pharmacy": 0, "Satellite Pharmacy": 0 },
        pregnancyCategory: "X",
        lactationSafety: "Contraindicated",
        kidneySafety: "No dose adjustment required.",
        liverSafety: "Contraindicated in active liver disease.",
        expiringSoon: false,
        coPrescribed: []
      },
      {
        code: "PH-006",
        name: "Combiflam",
        brandName: "Combiflam",
        genericName: "Ibuprofen",
        saltComposition: "Ibuprofen 400mg + Paracetamol 325mg",
        strength: "400mg",
        dosageForm: "Tablet",
        route: "Oral",
        manufacturer: "Sanofi India",
        packSize: "Strip of 15",
        stock: 3800,
        minStock: 400,
        price: 20,
        expiry: "2028-01-20",
        category: "NSAID",
        locations: { "Main Pharmacy": 2500, "Emergency Pharmacy": 500, "IPD Pharmacy": 800, "OT Pharmacy": 0, "Satellite Pharmacy": 0 },
        pregnancyCategory: "D",
        lactationSafety: "Caution",
        kidneySafety: "Avoid in severe renal impairment (eGFR < 30) due to acute kidney injury risk.",
        liverSafety: "Use with caution.",
        expiringSoon: false,
        coPrescribed: ["PH-004"]
      },
      {
        code: "PH-006B",
        name: "Ibugesic 400",
        brandName: "Ibugesic 400",
        genericName: "Ibuprofen",
        saltComposition: "Ibuprofen 400mg",
        strength: "400mg",
        dosageForm: "Tablet",
        route: "Oral",
        manufacturer: "Cipla Ltd",
        packSize: "Strip of 15",
        stock: 1200,
        minStock: 200,
        price: 18,
        expiry: "2027-10-05",
        category: "NSAID",
        locations: { "Main Pharmacy": 800, "Emergency Pharmacy": 200, "IPD Pharmacy": 200, "OT Pharmacy": 0, "Satellite Pharmacy": 0 },
        pregnancyCategory: "D",
        lactationSafety: "Caution",
        kidneySafety: "Avoid in severe renal impairment.",
        liverSafety: "Use with caution.",
        expiringSoon: false,
        coPrescribed: ["PH-004"]
      },
      {
        code: "PH-007",
        name: "Febrex Plus",
        brandName: "Febrex Plus",
        genericName: "Chlorpheniramine Maleate + Paracetamol + Phenylephrine",
        saltComposition: "Chlorpheniramine Maleate 2mg + Paracetamol 500mg + Phenylephrine 5mg",
        strength: "507mg",
        dosageForm: "Tablet",
        route: "Oral",
        manufacturer: "Indoco Remedies Ltd",
        packSize: "Strip of 10",
        stock: 1500,
        minStock: 250,
        price: 35,
        expiry: "2027-12-01",
        category: "Cough & Cold",
        locations: { "Main Pharmacy": 1000, "Emergency Pharmacy": 200, "IPD Pharmacy": 300, "OT Pharmacy": 0, "Satellite Pharmacy": 0 },
        pregnancyCategory: "C",
        lactationSafety: "Caution",
        kidneySafety: "Use with caution in moderate to severe renal impairment.",
        liverSafety: "Use with caution. Avoid excessive dosage as it contains paracetamol.",
        expiringSoon: false,
        coPrescribed: ["PH-004"]
      }
    ],
    stores: [
      { code: "ST-001", name: "Syringes 5ml with Needle", stock: 8500, minStock: 1000, price: 5 },
      { code: "ST-002", name: "IV Infusion Sets", stock: 1500, minStock: 300, price: 45 },
      { code: "ST-003", name: "Sterile Surgical Gloves (Size 7)", stock: 2400, minStock: 500, price: 20 },
      { code: "ST-004", name: "Bedsheets (Cotton Blue)", stock: 380, minStock: 100, price: 250 },
      { code: "ST-005", name: "Patient Gowns", stock: 420, minStock: 80, price: 180 },
      { code: "ST-006", name: "Autoclave Sterilizer Indicator Tape", stock: 65, minStock: 15, price: 350 }
    ]
  },

  // 11. CSSD sterilization logs & full operational state
  cssdState: {
    instrumentSets: [
      { id: "SET-GEN-001", name: "Major Laparotomy Set", barcode: "300101", status: "Available", category: "General Surgery", itemsCount: 42, location: "Storage A-3", lastSterilization: "2026-07-01", isImplant: false },
      { id: "SET-GEN-002", name: "Major Laparotomy Set (B)", barcode: "300101B", status: "Cleaning", category: "General Surgery", itemsCount: 42, location: "Wash Area Queue", lastSterilization: "2026-06-30", isImplant: false },
      { id: "SET-ORTHO-002", name: "Large Fragment Locking Plate Set (with Implants)", barcode: "300102", status: "Issued", category: "Orthopedics", itemsCount: 65, location: "OT-02", lastSterilization: "2026-07-02", isImplant: true, implantDetails: { catalogItem: "LCP-4.5-Plate", lotNumber: "LOT-9921A", expiryDate: "2029-12-30" } },
      { id: "SET-NEURO-003", name: "Craniotomy Set", barcode: "300103", status: "Returned Dirty", category: "Neurosurgery", itemsCount: 54, location: "Dirty Receipt Queue", lastSterilization: "2026-06-28", isImplant: false },
      { id: "SET-GYNE-004", name: "Cesarean Section Set", barcode: "300104", status: "Awaiting Packing", category: "Gynecology & Obs", itemsCount: 38, location: "Packing Workstation", lastSterilization: "2026-07-02", isImplant: false },
      { id: "SET-CARD-005", name: "Open Heart Surgery Set", barcode: "300105", status: "Available", category: "Cardiology", itemsCount: 82, location: "Storage C-1", lastSterilization: "2026-07-02", isImplant: false },
      { id: "SET-OPHTH-005", name: "Micro-Surgical Set", barcode: "300106", status: "Awaiting Inspection", category: "Ophthalmology", itemsCount: 24, location: "Inspection Desk", lastSterilization: "2026-07-01", isImplant: false }
    ],
    implantCatalog: [
      { code: "IMP-SCREW-3.5", name: "Cortex Screw 3.5mm x 14mm", quantity: 150, lotNumber: "LOT-8832X", expiryDate: "2030-05-15", minStock: 20 },
      { code: "IMP-PLATE-LCP", name: "LCP Plate 4.5mm 8-Hole", quantity: 12, lotNumber: "LOT-9921A", expiryDate: "2029-12-30", minStock: 3 },
      { code: "IMP-MESH-HERNIA", name: "Proline Hernia Mesh 15x15cm", quantity: 25, lotNumber: "LOT-2231B", expiryDate: "2031-01-20", minStock: 5 },
      { code: "IMP-STENT-DES", name: "Drug Eluting Coronary Stent 3.0x18mm", quantity: 8, lotNumber: "LOT-7742C", expiryDate: "2028-09-15", minStock: 2 }
    ],
    loanerSets: [
      { id: "LNR-SPINE-001", name: "Vendor Spine Instrument Set (Medtronic)", vendor: "Medtronic India Pvt Ltd", arrivalDate: "2026-07-02", patientName: "Rajesh Kumar", caseDate: "2026-07-03", status: "Awaiting Cleaning", conditionOnReceipt: "Good", returnStatus: "Pending" },
      { id: "LNR-KNEE-002", name: "Vendor Knee Replacement Trial Set (Zimmer Biomet)", vendor: "Zimmer India", arrivalDate: "2026-07-01", patientName: "Mohammed Iqbal", caseDate: "2026-07-02", status: "Returned to Vendor", conditionOnReceipt: "Good", returnStatus: "Returned (Clean)", disputeRemarks: "" }
    ],
    queues: {
      dirtyReceipt: [
        { id: "RET-101", setName: "Craniotomy Set", setCode: "SET-NEURO-003", returnDept: "OT-03", returnedBy: "Nurse Mary", receivedBy: "Technician Ashok", returnTime: "2026-07-02 14:30", status: "Awaiting Cleaning", missingItems: [], damagedItems: [], contaminationLevel: "High" }
      ],
      cleaning: [
        { id: "CLN-101", setName: "Major Laparotomy Set (B)", setCode: "SET-GEN-002", method: "Ultrasonic Cleaning", status: "Cleaning", startTime: "2026-07-02 18:30", technician: "Technician Ashok" }
      ],
      inspection: [
        { id: "INSP-101", setName: "Micro-Surgical Set", setCode: "SET-OPHTH-005", status: "Awaiting Assembly", checklistStatus: "Checked", technician: "Technician Ashok", result: "Pass", condemnationRequired: false }
      ],
      packing: [
        { id: "PCK-101", setName: "Cesarean Section Set (B)", setCode: "SET-GYNE-004", status: "Ready for Packing", packagingMaterial: "Double Wrap Non-Woven SMS", packedBy: "Technician Ashok" }
      ],
      sterilization: [
        { id: "STER-101", sterilizer: "ST-STEAM-01", cycleNo: "CYC-9844", loadNo: "LOAD-4820", temperature: "134°C", pressure: "2.1 bar", exposureTime: "4 minutes", status: "Sterilization Completed", technician: "Technician Ashok", startTime: "2026-07-02 18:00", endTime: "2026-07-02 18:45", isImplant: true, biStartedAt: "2026-07-02 18:45", biStatus: "Pending", biResult: null, items: ["SET-ORTHO-002"], emergencyOverride: null }
      ]
    },
    sterilizers: [
      { code: "ST-STEAM-01", name: "Steam Autoclave 450L (Horizontal)", type: "Steam Autoclave", status: "Active", lastValidation: "2026-06-15", pmDueDate: "2026-09-15" },
      { code: "ST-ETO-01", name: "ETO Sterilizer 120L", type: "Ethylene Oxide (ETO)", status: "Active", lastValidation: "2026-05-10", pmDueDate: "2026-11-10" }
    ],
    waterQualityLogs: [
      { date: "2026-07-02", time: "08:00 AM", feedWaterTds: "45 ppm", roWaterTds: "3 ppm", ph: "6.8", hardness: "Nil", loggedBy: "Biomedical Engineer Vivek" }
    ],
    implantIssues: [
      { id: "ISS-IMP-01", patientUhid: "SH-2026-04821", patientName: "Rajesh Kumar", surgeon: "Dr. Srinivasan", procedure: "Spine Fixation L4-L5", implantCode: "IMP-PLATE-LCP", implantName: "LCP Plate 4.5mm 8-Hole", lotNumber: "LOT-9921A", expiryDate: "2029-12-30", issuedDate: "2026-07-02" }
    ],
    auditLogs: []
  },
  cssdLogs: [],

  // 12. Equipment List
  equipment: [
    { code: "EQ-101", name: "Syringe Pump Universal (B. Braun)", location: "ICCU", status: "Active", amcExpiry: "2027-03-15", lastCalib: "2026-05-10" },
    { code: "EQ-102", name: "Defibrillator Cardiopak", location: "Emergency", status: "Active", amcExpiry: "2026-11-20", lastCalib: "2026-04-12" },
    { code: "EQ-103", name: "Anesthesia Workstation (Dräger)", location: "OT-01", status: "Active", amcExpiry: "2027-01-18", lastCalib: "2026-05-02" },
    { code: "EQ-104", name: "Patient Monitor Goldway G30", location: "Ward 1", status: "Under Repair", amcExpiry: "2026-09-05", lastCalib: "2025-10-14" },
    { code: "EQ-105", name: "ECG Machine 12 Channel", location: "OPD", status: "Active", amcExpiry: "2027-04-20", lastCalib: "2026-03-28" }
  ],
  maintenanceComplaints: [],

  // 13. Laundry batches
  laundryBatches: [],

  // 14. Audit logs for clinical/medication override events
  auditLogs: []
};

// --------------------------------------------------------------------------
// GLOBAL DATE HELPERS — always relative to current real-world date
// --------------------------------------------------------------------------
window._HIS_TODAY = (function() {
  const d = new Date();
  return d.toISOString().slice(0, 10); // YYYY-MM-DD
})();

window._HIS_TODAY_PRETTY = (function() {
  const d = new Date();
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
})();

window._HIS_DATE = function(daysAgo) {
  const d = new Date();
  d.setDate(d.getDate() - (daysAgo || 0));
  return d.toISOString().slice(0, 10); // YYYY-MM-DD
};

window._HIS_PRETTY = function(daysAgo, timeStr) {
  const d = new Date();
  d.setDate(d.getDate() - (daysAgo || 0));
  const pretty = d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  return timeStr ? `${pretty} · ${timeStr}` : pretty;
};

// --------------------------------------------------------------------------
// STATE SEED ENGINE (Generates 50+ Patients & Logs)
// --------------------------------------------------------------------------
function seedState() {
  const storedPatients = localStorage.getItem('saronil_patients');
  const storedDoctors = localStorage.getItem('saronil_doctors');
  const storedNurses = localStorage.getItem('saronil_nurses');
  const storedStaff = localStorage.getItem('saronil_staff');
  
  if (storedPatients && storedDoctors && storedNurses && storedStaff) {
    state.patients = JSON.parse(storedPatients);
    state.doctors = JSON.parse(storedDoctors);
    state.nurses = JSON.parse(storedNurses);
    state.staff = JSON.parse(storedStaff);
    
    state.appointments = JSON.parse(localStorage.getItem('saronil_appointments')) || [];
    state.admissions = JSON.parse(localStorage.getItem('saronil_admissions')) || [];
    state.billing = JSON.parse(localStorage.getItem('saronil_billing')) || [];
    state.orders = JSON.parse(localStorage.getItem('saronil_orders')) || [];
    state.labOrders = JSON.parse(localStorage.getItem('saronil_labOrders')) || [];
    state.radOrders = JSON.parse(localStorage.getItem('saronil_radOrders')) || [];
    state.bedsStatus = JSON.parse(localStorage.getItem('saronil_bedsStatus')) || {};
    state.daycareAdmissions = JSON.parse(localStorage.getItem('saronil_daycare_admissions')) || [];
    
    console.log(`Synchronized database loaded from localStorage: ${state.patients.length} patients, ${state.doctors.length} doctors, ${state.nurses.length} nurses, ${state.staff.length} staff.`);
    return;
  }

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

  // Define exactly 25 static dummy patients with EMR keys
  const staticPatients = [
    // ────────────────────────────────────────────────────────────────────────
    // 10 IPD PATIENTS
    // ────────────────────────────────────────────────────────────────────────
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
      bloodGroup: "B+", allergies: "Penicillin", mobile: "9876543210", flags: [], admitted: window._HIS_PRETTY(3, '10:15'), ipNumber: "IP-240001", opNumber: "—", vitalsOverdue: false, labsUnreviewed: false,
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
      bloodGroup: "A+", allergies: "None", mobile: "9823456789", flags: [], admitted: window._HIS_PRETTY(4, '09:30'), ipNumber: "IP-240002", opNumber: "—", vitalsOverdue: false, labsUnreviewed: false,
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
      bloodGroup: "O+", allergies: "None", mobile: "9912345678", flags: ["Critical"], admitted: window._HIS_PRETTY(5, '08:45'), ipNumber: "IP-240003", opNumber: "—", vitalsOverdue: false, labsUnreviewed: false,
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
      bloodGroup: "A+", allergies: "None", mobile: "9845011006", flags: [], admitted: window._HIS_PRETTY(3, '08:15'), ipNumber: "IP-240005", opNumber: "—", vitalsOverdue: false, labsUnreviewed: false,
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
      bloodGroup: "AB+", allergies: "Sulfa drugs", mobile: "9845011009", flags: [], admitted: window._HIS_PRETTY(4, '09:15'), ipNumber: "IP-240008", opNumber: "—", vitalsOverdue: false, labsUnreviewed: false,
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
      bloodGroup: "O+", allergies: "None", mobile: "9845011010", flags: ["Critical"], admitted: window._HIS_PRETTY(5, '07:30'), ipNumber: "IP-240009", opNumber: "—", vitalsOverdue: false, labsUnreviewed: false,
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
      bloodGroup: "A+", allergies: "None", mobile: "9845011011", flags: [], admitted: window._HIS_PRETTY(2, '10:00'), ipNumber: "IP-240010", opNumber: "—", vitalsOverdue: false, labsUnreviewed: false,
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
      bloodGroup: "B+", allergies: "None", mobile: "9845011012", flags: [], admitted: window._HIS_PRETTY(3, '08:30'), ipNumber: "IP-240011", opNumber: "—", vitalsOverdue: false, labsUnreviewed: false,
      dischargeClearances: { clinical: false, billing: false, summaryReady: false }
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
      bloodGroup: "O+", allergies: "None", mobile: "9988771122", flags: [], admitted: window._HIS_PRETTY(5, '07:50'), ipNumber: "IP-240015", opNumber: "—", vitalsOverdue: false, labsUnreviewed: false,
      dischargeClearances: { clinical: false, billing: false, summaryReady: false }
    },
    {
      uhid: "SH-2026-04850", name: "Rajan Pillai", age: 50, gender: "Male",
      type: "IPD", ward: "General Ward", bed: "B-13", los: 2,
      primaryConsultant: "Dr. Srinivasan", department: "General Medicine",
      payer: "Self Pay", payerType: "Cash", preAuthStatus: "—",
      alerts: [], newsScore: 0, status: "Admitted", lastActivity: "Ward rounds · 11:00 AM",
      vitals: { bp: "122/82", hr: 75, temp: 98.5, spo2: 98, weight: 70, bmi: 22.8, pain: 0, rr: 16 },
      prescriptions: [],
      clinicalData: { complaint: "Fever and weakness", hpi: "None", examination: "NAD", diagnosis: "Evaluation", treatmentPlan: "IV fluids", carePlan: "Monitor temperature" },
      history: { pastConditions: "None", surgeries: "None", familyHistory: "None" },
      bloodGroup: "O+", allergies: "None", mobile: "9845011030", flags: [], admitted: window._HIS_PRETTY(2, '11:00'), ipNumber: "IP-240020", opNumber: "—", vitalsOverdue: false, labsUnreviewed: false,
      dischargeClearances: { clinical: false, billing: false, summaryReady: false }
    },

    // ────────────────────────────────────────────────────────────────────────
    // 10 OPD PATIENTS
    // ────────────────────────────────────────────────────────────────────────
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
      bloodGroup: "B+", allergies: "None", mobile: "9845011005", flags: [], admitted: window._HIS_PRETTY(0, '11:15'), ipNumber: "—", opNumber: "OP-240004", vitalsOverdue: false, labsUnreviewed: false,
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
      bloodGroup: "A+", allergies: "None", mobile: "9845011013", flags: [], admitted: window._HIS_PRETTY(0, '13:30'), ipNumber: "—", opNumber: "OP-240012", vitalsOverdue: false, labsUnreviewed: false,
      dischargeClearances: { clinical: false, billing: false, summaryReady: false }
    },
    {
      uhid: "SH-2026-04861", name: "Amit Sharma", age: 34, gender: "Male",
      type: "OPD", ward: "OPD Room 1", bed: "—", los: 1,
      primaryConsultant: "Dr. Srinivasan", department: "General Medicine",
      payer: "Cash Tariff", payerType: "Cash", preAuthStatus: "—",
      alerts: [], newsScore: 0, status: "Scheduled", lastActivity: "Registration · 09:00 AM",
      vitals: { bp: "120/80", hr: 72, temp: 98.4, spo2: 99, weight: 70, bmi: 22.8, pain: 0, rr: 16 },
      prescriptions: [],
      clinicalData: { complaint: "Routine health checkup", hpi: "None", examination: "NAD", diagnosis: "Routine Check", treatmentPlan: "None", carePlan: "Annual follow-up" },
      history: { pastConditions: "None", surgeries: "None", familyHistory: "None" },
      bloodGroup: "O+", allergies: "None", mobile: "9845011031", flags: [], admitted: window._HIS_PRETTY(0, '09:00'), ipNumber: "—", opNumber: "OP-240061", vitalsOverdue: false, labsUnreviewed: false,
      dischargeClearances: { clinical: false, billing: false, summaryReady: false }
    },
    {
      uhid: "SH-2026-04862", name: "Rohan Verma", age: 28, gender: "Male",
      type: "OPD", ward: "OPD Room 1", bed: "—", los: 1,
      primaryConsultant: "Dr. Srinivasan", department: "General Medicine",
      payer: "Cash Tariff", payerType: "Cash", preAuthStatus: "—",
      alerts: [], newsScore: 0, status: "Checked In", lastActivity: "Registered · 09:15 AM",
      vitals: { bp: "118/75", hr: 70, temp: 98.2, spo2: 99, weight: 68, bmi: 22.0, pain: 0, rr: 14 },
      prescriptions: [],
      clinicalData: { complaint: "Mild headache and body pain", hpi: "Headache since 1 day", examination: "NAD", diagnosis: "Tension Headache", treatmentPlan: "Analgesics", carePlan: "Follow up SOS" },
      history: { pastConditions: "None", surgeries: "None", familyHistory: "None" },
      bloodGroup: "B+", allergies: "None", mobile: "9845011032", flags: [], admitted: window._HIS_PRETTY(0, '09:15'), ipNumber: "—", opNumber: "OP-240062", vitalsOverdue: false, labsUnreviewed: false,
      dischargeClearances: { clinical: false, billing: false, summaryReady: false }
    },
    {
      uhid: "SH-2026-04863", name: "Sanjay Joshi", age: 42, gender: "Male",
      type: "OPD", ward: "OPD Room 3", bed: "—", los: 1,
      primaryConsultant: "Dr. Mehta", department: "General Surgery",
      payer: "Cash Tariff", payerType: "Cash", preAuthStatus: "—",
      alerts: [], newsScore: 0, status: "Scheduled", lastActivity: "Registration · 09:30 AM",
      vitals: { bp: "125/82", hr: 75, temp: 98.4, spo2: 98, weight: 75, bmi: 24.5, pain: 1, rr: 16 },
      prescriptions: [],
      clinicalData: { complaint: "Post-op follow-up check", hpi: "None", examination: "Surgical wound healing well", diagnosis: "Post-Op Stable", treatmentPlan: "Suture line cleaning", carePlan: "Normal activities" },
      history: { pastConditions: "Hernia", surgeries: "Hernioplasty", familyHistory: "None" },
      bloodGroup: "A-", allergies: "None", mobile: "9845011033", flags: [], admitted: window._HIS_PRETTY(0, '09:30'), ipNumber: "—", opNumber: "OP-240063", vitalsOverdue: false, labsUnreviewed: false,
      dischargeClearances: { clinical: false, billing: false, summaryReady: false }
    },
    {
      uhid: "SH-2026-04864", name: "Kiran Patel", age: 31, gender: "Female",
      type: "OPD", ward: "OPD Room 2", bed: "—", los: 1,
      primaryConsultant: "Dr. Priya Nair", department: "Gynecology & Obs",
      payer: "Cash Tariff", payerType: "Cash", preAuthStatus: "—",
      alerts: [], newsScore: 0, status: "Checked In", lastActivity: "Registered · 09:45 AM",
      vitals: { bp: "110/70", hr: 74, temp: 98.6, spo2: 99, weight: 55, bmi: 21.0, pain: 0, rr: 14 },
      prescriptions: [],
      clinicalData: { complaint: "Antenatal checkup", hpi: "First trimester", examination: "NAD", diagnosis: "Early Pregnancy", treatmentPlan: "Iron, Folic Acid supplements", carePlan: "Monthly checkup" },
      history: { pastConditions: "None", surgeries: "None", familyHistory: "None" },
      bloodGroup: "AB+", allergies: "None", mobile: "9845011034", flags: [], admitted: window._HIS_PRETTY(0, '09:45'), ipNumber: "—", opNumber: "OP-240064", vitalsOverdue: false, labsUnreviewed: false,
      dischargeClearances: { clinical: false, billing: false, summaryReady: false }
    },
    {
      uhid: "SH-2026-04865", name: "Divya Reddy", age: 36, gender: "Female",
      type: "OPD", ward: "OPD Room 2", bed: "—", los: 1,
      primaryConsultant: "Dr. Priya Nair", department: "Gynecology & Obs",
      payer: "Cash Tariff", payerType: "Cash", preAuthStatus: "—",
      alerts: [], newsScore: 0, status: "Scheduled", lastActivity: "Registration · 10:00 AM",
      vitals: { bp: "115/78", hr: 76, temp: 98.4, spo2: 99, weight: 60, bmi: 23.4, pain: 0, rr: 16 },
      prescriptions: [],
      clinicalData: { complaint: "Routine follow-up", hpi: "None", examination: "NAD", diagnosis: "Stable", treatmentPlan: "Continue meds", carePlan: "Follow up 3 months" },
      history: { pastConditions: "None", surgeries: "None", familyHistory: "None" },
      bloodGroup: "O-", allergies: "None", mobile: "9845011035", flags: [], admitted: window._HIS_PRETTY(0, '10:00'), ipNumber: "—", opNumber: "OP-240065", vitalsOverdue: false, labsUnreviewed: false,
      dischargeClearances: { clinical: false, billing: false, summaryReady: false }
    },
    {
      uhid: "SH-2026-04866", name: "Neha Sen", age: 25, gender: "Female",
      type: "OPD", ward: "OPD Room 4", bed: "—", los: 1,
      primaryConsultant: "Dr. Ramesh Iyer", department: "Pediatrics",
      payer: "Cash Tariff", payerType: "Cash", preAuthStatus: "—",
      alerts: [], newsScore: 0, status: "In Consultation", lastActivity: "Registered · 10:15 AM",
      vitals: { bp: "108/68", hr: 78, temp: 98.6, spo2: 99, weight: 50, bmi: 19.5, pain: 0, rr: 16 },
      prescriptions: [],
      clinicalData: { complaint: "Acne and skin evaluation", hpi: "Mild acne breakout", examination: "NAD", diagnosis: "Acne Vulgaris", treatmentPlan: "Topical gels, face wash", carePlan: "Avoid oily food" },
      history: { pastConditions: "None", surgeries: "None", familyHistory: "None" },
      bloodGroup: "A+", allergies: "None", mobile: "9845011036", flags: [], admitted: window._HIS_PRETTY(0, '10:15'), ipNumber: "—", opNumber: "OP-240066", vitalsOverdue: false, labsUnreviewed: false,
      dischargeClearances: { clinical: false, billing: false, summaryReady: false }
    },
    {
      uhid: "SH-2026-04867", name: "Vijay Das", age: 58, gender: "Male",
      type: "OPD", ward: "OPD Room 1", bed: "—", los: 1,
      primaryConsultant: "Dr. Srinivasan", department: "General Medicine",
      payer: "Cash Tariff", payerType: "Cash", preAuthStatus: "—",
      alerts: [], newsScore: 0, status: "Scheduled", lastActivity: "Registration · 10:30 AM",
      vitals: { bp: "140/90", hr: 80, temp: 98.4, spo2: 98, weight: 82, bmi: 26.1, pain: 0, rr: 18 },
      prescriptions: [],
      clinicalData: { complaint: "High BP checking", hpi: "None", examination: "NAD", diagnosis: "Hypertension Stage 1", treatmentPlan: "Amlodipine 5mg daily", carePlan: "Daily BP chart" },
      history: { pastConditions: "HTN", surgeries: "None", familyHistory: "Hypertension" },
      bloodGroup: "B-", allergies: "None", mobile: "9845011037", flags: [], admitted: window._HIS_PRETTY(0, '10:30'), ipNumber: "—", opNumber: "OP-240067", vitalsOverdue: false, labsUnreviewed: false,
      dischargeClearances: { clinical: false, billing: false, summaryReady: false }
    },
    {
      uhid: "SH-2026-04868", name: "Asha Rao", age: 50, gender: "Female",
      type: "OPD", ward: "OPD Room 1", bed: "—", los: 1,
      primaryConsultant: "Dr. Srinivasan", department: "General Medicine",
      payer: "Cash Tariff", payerType: "Cash", preAuthStatus: "—",
      alerts: [], newsScore: 0, status: "Checked In", lastActivity: "Registered · 10:45 AM",
      vitals: { bp: "130/85", hr: 75, temp: 98.4, spo2: 98, weight: 65, bmi: 24.3, pain: 0, rr: 16 },
      prescriptions: [],
      clinicalData: { complaint: "Joint pain check", hpi: "Knee pain since 1 month", examination: "NAD", diagnosis: "Mild Osteoarthritis", treatmentPlan: "Calcium, Vitamin D, Physio", carePlan: "Avoid climbing stairs" },
      history: { pastConditions: "None", surgeries: "None", familyHistory: "Osteoarthritis" },
      bloodGroup: "AB-", allergies: "None", mobile: "9845011038", flags: [], admitted: window._HIS_PRETTY(0, '10:45'), ipNumber: "—", opNumber: "OP-240068", vitalsOverdue: false, labsUnreviewed: false,
      dischargeClearances: { clinical: false, billing: false, summaryReady: false }
    },

    // ────────────────────────────────────────────────────────────────────────
    // 3 DAYCARE PATIENTS
    // ────────────────────────────────────────────────────────────────────────
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
      bloodGroup: "O+", allergies: "None", mobile: "9845011007", flags: [], admitted: window._HIS_PRETTY(0, '14:00'), ipNumber: "—", opNumber: "OP-240006", vitalsOverdue: false, labsUnreviewed: false,
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
      bloodGroup: "O+", allergies: "None", mobile: "9845011014", flags: [], admitted: window._HIS_PRETTY(0, '11:30'), ipNumber: "—", opNumber: "OP-240013", vitalsOverdue: false, labsUnreviewed: false,
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
      bloodGroup: "B+", allergies: "None", mobile: "9876512345", flags: [], admitted: window._HIS_PRETTY(0, '14:30'), ipNumber: "—", opNumber: "OP-240014", vitalsOverdue: false, labsUnreviewed: false,
      dischargeClearances: { clinical: true, billing: true, summaryReady: true }
    },

    // ────────────────────────────────────────────────────────────────────────
    // 2 EMERGENCY PATIENTS
    // ────────────────────────────────────────────────────────────────────────
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
      bloodGroup: "B-", allergies: "None", mobile: "9845011008", flags: ["Critical"], admitted: window._HIS_PRETTY(0, '10:45'), ipNumber: "—", opNumber: "OP-240007", vitalsOverdue: false, labsUnreviewed: false,
      dischargeClearances: { clinical: false, billing: false, summaryReady: false }
    },
    {
      uhid: "SH-2026-04870", name: "Pramod Rao", age: 45, gender: "Male",
      type: "Emergency", ward: "Emergency Bay", bed: "EMG-02", los: 1,
      primaryConsultant: "Dr. Fatima Sheikh", department: "Emergency Medicine",
      payer: "Self Pay", payerType: "Cash", preAuthStatus: "—",
      alerts: [], newsScore: 3, status: "In Triage", lastActivity: "Registration · 11:30 AM",
      vitals: { bp: "115/75", hr: 80, temp: 98.4, spo2: 98, weight: 70, bmi: 22.8, pain: 1, rr: 16 },
      prescriptions: [],
      clinicalData: { complaint: "Mild chest pain", hpi: "None", examination: "NAD", diagnosis: "Evaluation", treatmentPlan: "ECG, monitoring", carePlan: "Observation" },
      history: { pastConditions: "None", surgeries: "None", familyHistory: "None" },
      bloodGroup: "A+", allergies: "None", mobile: "9845011039", flags: [], admitted: window._HIS_PRETTY(0, '11:30'), ipNumber: "—", opNumber: "OP-240070", vitalsOverdue: false, labsUnreviewed: false,
      dischargeClearances: { clinical: false, billing: false, summaryReady: false }
    }
  ];

  // Store static rows
  state.patients = [...staticPatients];

  // Set up collections
  state.appointments = [];
  state.admissions = [];
  state.daycareAdmissions = [];
  state.billing = [];

  // Seed canonical bed mappings for all 25 patients
  var _staticBedMap = {
    'SH-2026-04821': { bed: 'GW(M)-409',   wardKey: 'GENERAL-WARD-M', wardName: 'General Ward (Male)' },
    'SH-2026-04803': { bed: 'PVT-201',     wardKey: 'PRIVATE',         wardName: 'Private Room' },
    'SH-2026-04799': { bed: 'CCU-BED-01',  wardKey: 'CCU',             wardName: 'Critical Care Unit' },
    'SH-2026-04788': { bed: 'CCU-BED-02',  wardKey: 'CCU',             wardName: 'Critical Care Unit' },
    'SH-2026-04810': { bed: 'GW(F)-414',   wardKey: 'GENERAL-WARD-F',  wardName: 'General Ward (Female)' },
    'SH-2026-04790': { bed: 'CCU-BED-03',  wardKey: 'CCU',             wardName: 'Critical Care Unit' },
    'SH-2026-04831': { bed: 'SP-301',      wardKey: 'SEMI-PRIVATE',    wardName: 'Semi-Private Ward' },
    'SH-2026-04768': { bed: 'SP-302',      wardKey: 'SEMI-PRIVATE',    wardName: 'Semi-Private Ward' },
    'SH-2026-04798': { bed: 'ICCU-BED-01', wardKey: 'ICCU',            wardName: 'Intensive Cardiac Care Unit' },
    'SH-2026-04850': { bed: 'GW(M)-410',   wardKey: 'GENERAL-WARD-M',  wardName: 'General Ward (Male)' },
    'SH-2026-04822': { bed: 'DC-B1',       wardKey: 'DAYCARE',         wardName: 'Daycare Unit' },
    'SH-2026-04812': { bed: 'DC-B2',       wardKey: 'DAYCARE',         wardName: 'Daycare Unit' },
    'SH-2026-04801': { bed: 'DC-B3',       wardKey: 'DAYCARE',         wardName: 'Daycare Unit' },
    'SH-2026-04755': { bed: 'EMG-01',      wardKey: 'EMERGENCY',       wardName: 'Emergency Ward' },
    'SH-2026-04870': { bed: 'EMG-02',      wardKey: 'EMERGENCY',       wardName: 'Emergency Ward' }
  };

  state.patients.forEach(function(p, idx) {
    var mapping = _staticBedMap[p.uhid];
    if (mapping) {
      p.bed = mapping.bed;
      if (p.type !== 'OPD') p.ward = mapping.wardName;
      state.bedsStatus[mapping.bed] = {
        wardKey:     mapping.wardKey,
        status:      (p.status === 'Discharged') ? 'Available' : 'Occupied',
        patientUhid: p.uhid,
        patientName: p.name,
        doctorName:  p.primaryConsultant || '',
        diagnosis:   (p.clinicalData && p.clinicalData.diagnosis) || '',
        notes:       'Admitted under ' + (p.primaryConsultant || '')
      };
      
      // Ensure a matching active admission record exists for IPD
      if (p.type === 'IPD' && p.status !== 'Discharged') {
        state.admissions.push({
          id: 'ADM-SEED-' + p.uhid,
          uhid: p.uhid,
          patientName: p.name,
          doctorName: p.primaryConsultant || '',
          ward: mapping.wardKey,
          bed: mapping.bed,
          date: window._HIS_DATE(p.los || 1),
          status: 'Active'
        });
      }

      // Add Daycare Admissions
      if (p.type === "Daycare") {
        state.daycareAdmissions.push({
          patient: p,
          bedId: mapping.bed,
          ward: 'Daycare Ward',
          bedNo: mapping.bed,
          consultantName: p.primaryConsultant,
          procedureName: 'Evaluation checkup',
          admissionType: 'Daycare',
          admissionTimestamp: new Date().toISOString(),
          status: p.status === 'Discharged' ? 'Cleared & Discharged' : 'Registered',
          dischargeClearances: { clinical: p.status === 'Discharged', billing: p.status === 'Discharged', summaryReady: p.status === 'Discharged' }
        });
      }
    }

    // Add OPD Appointments
    if (p.type === "OPD") {
      state.appointments.push({
        id: `APT${6000 + idx}`,
        uhid: p.uhid,
        patientName: p.name,
        doctorName: p.primaryConsultant,
        deptName: p.department,
        time: "10:30 AM",
        date: window._HIS_DATE(1),
        status: p.status === "Scheduled" ? "Scheduled" : (p.status === "Checked In" ? "Arrived" : "Completed"),
        mobile: p.mobile,
        gender: p.gender,
        age: p.age,
        visitType: "OPD Regular",
        checkedInTime: "09:45 AM"
      });
    }

    // Add Invoices
    state.billing.push({
      id: `INV${7000 + idx}`,
      uhid: p.uhid,
      patientName: p.name,
      amount: 1500 + (idx * 250) % 8000,
      paid: p.status === "Discharged" ? 1500 + (idx * 250) % 8000 : 0,
      status: p.status === "Discharged" ? "Paid" : "Pending",
      date: window._HIS_DATE(1),
      items: [
        { desc: "General Consultation Fee", qty: 1, rate: 800, total: 800 },
        { desc: "Facility Support Charges", qty: 1, rate: 700 + (idx * 250) % 7200, total: 700 + (idx * 250) % 7200 }
      ]
    });
  });

  // ── SEED LAB ORDERS (cross-module: EMR → Lab Dashboard) ─────────────────
  if (!state.labOrders || state.labOrders.length === 0) {
    state.labOrders = [
      { id: 'LO-001', uhid: 'SH-2026-04821', patientName: 'Rajesh Kumar',     ward: 'GW(M)-409',   test: 'Troponin I (hs)',         dept: 'Biochemistry',     tube: 'yellow',   priority: 'Urgent',  orderedBy: 'Dr. Srinivasan', orderedAt: window._HIS_DATE(0), status: 'Pending',  accNo: 'SPEC-TODAY-0101' },
      { id: 'LO-002', uhid: 'SH-2026-04821', patientName: 'Rajesh Kumar',     ward: 'GW(M)-409',   test: 'ECG (Report)',             dept: 'Cardiology',       tube: 'none',     priority: 'Routine', orderedBy: 'Dr. Srinivasan', orderedAt: window._HIS_DATE(0), status: 'Pending',  accNo: 'SPEC-TODAY-0102' },
      { id: 'LO-003', uhid: 'SH-2026-04799', patientName: 'Mohammed Iqbal',   ward: 'CCU-BED-01',  test: 'LFT + KFT',               dept: 'Biochemistry',     tube: 'yellow',   priority: 'Routine', orderedBy: 'Dr. Mehta',      orderedAt: window._HIS_DATE(0), status: 'Pending',  accNo: 'SPEC-TODAY-0103' },
      { id: 'LO-004', uhid: 'SH-2026-04810', patientName: 'Fatima Begum',     ward: 'GW(F)-414',   test: 'HbA1c + FBS',             dept: 'Biochemistry',     tube: 'lavender', priority: 'Urgent',  orderedBy: 'Dr. Ramesh Iyer', orderedAt: window._HIS_DATE(0), status: 'Pending',  accNo: 'SPEC-TODAY-0104' },
      { id: 'LO-005', uhid: 'SH-2026-04788', patientName: 'Arun Pillai',      ward: 'CCU-BED-02',  test: 'Serum Creatinine + eGFR', dept: 'Biochemistry',     tube: 'yellow',   priority: 'Routine', orderedBy: 'Dr. Srinivasan', orderedAt: window._HIS_DATE(0), status: 'Pending',  accNo: 'SPEC-TODAY-0105' },
      { id: 'LO-006', uhid: 'SH-2026-04755', patientName: 'Deepak Verma',     ward: 'EMG-01',      test: 'CBC + ABG',               dept: 'Haematology',      tube: 'lavender', priority: 'STAT',    orderedBy: 'Dr. Fatima Sheikh', orderedAt: window._HIS_DATE(0), status: 'Pending', accNo: 'SPEC-TODAY-0106' },
      { id: 'LO-007', uhid: 'SH-2026-04790', patientName: 'Vikram Singh',     ward: 'CCU-BED-03',  test: 'Lipid Profile',           dept: 'Biochemistry',     tube: 'yellow',   priority: 'Routine', orderedBy: 'Dr. Mehta',      orderedAt: window._HIS_DATE(0), status: 'Pending',  accNo: 'SPEC-TODAY-0107' },
      { id: 'LO-008', uhid: 'SH-2026-04831', patientName: 'Anitha Rao',       ward: 'SP-301',      test: 'Complete Blood Count',    dept: 'Haematology',      tube: 'lavender', priority: 'Routine', orderedBy: 'Dr. Priya Nair', orderedAt: window._HIS_DATE(0), status: 'Pending',  accNo: 'SPEC-TODAY-0108' },
      { id: 'LO-009', uhid: 'SH-2026-04798', patientName: 'Arjun Nair',       ward: 'ICCU-BED-01', test: 'Cardiac Enzymes Panel',   dept: 'Biochemistry',     tube: 'yellow',   priority: 'Urgent',  orderedBy: 'Dr. Anand',      orderedAt: window._HIS_DATE(0), status: 'In Progress', accNo: 'SPEC-TODAY-0109' },
      { id: 'LO-010', uhid: 'SH-2026-04817', patientName: 'Sunita Sharma',    ward: 'OPD',         test: 'Urine Routine + Microscopy', dept: 'Clinical Path', tube: 'yellow-cap', priority: 'Routine', orderedBy: 'Dr. Priya Nair', orderedAt: window._HIS_DATE(0), status: 'Pending', accNo: 'SPEC-TODAY-0110' }
    ];
  }

  // ── SEED RAD ORDERS (cross-module: EMR → Radiology Dashboard) ───────────
  if (!state.radOrders || state.radOrders.length === 0) {
    state.radOrders = [
      { id: 'RO-001', uhid: 'SH-2026-04821', patientName: 'Rajesh Kumar',   ward: 'GW(M)-409',   study: 'ECG Treadmill Stress Test',    modality: 'ECG',       priority: 'Routine', orderedBy: 'Dr. Srinivasan',   orderedAt: window._HIS_DATE(0), status: 'Scheduled', room: 'ROOM-X1', studyId: 'STUDY-SEED-001' },
      { id: 'RO-002', uhid: 'SH-2026-04799', patientName: 'Mohammed Iqbal', ward: 'CCU-BED-01',  study: 'X-Ray Chest PA View',          modality: 'X-Ray',     priority: 'Urgent',  orderedBy: 'Dr. Mehta',        orderedAt: window._HIS_DATE(0), status: 'Scheduled', room: 'ROOM-X1', studyId: 'STUDY-SEED-002' },
      { id: 'RO-003', uhid: 'SH-2026-04755', patientName: 'Deepak Verma',   ward: 'EMG-01',      study: 'CT Brain Non-Contrast',        modality: 'CT Scan',   priority: 'STAT',    orderedBy: 'Dr. Fatima Sheikh', orderedAt: window._HIS_DATE(0), status: 'Called',    room: 'ROOM-CT1', studyId: 'STUDY-SEED-003' },
      { id: 'RO-004', uhid: 'SH-2026-04788', patientName: 'Arun Pillai',    ward: 'CCU-BED-02',  study: 'USG Abdomen (kidneys)',        modality: 'Ultrasound',priority: 'Routine', orderedBy: 'Dr. Srinivasan',   orderedAt: window._HIS_DATE(0), status: 'Scheduled', room: 'ROOM-U1', studyId: 'STUDY-SEED-004' },
      { id: 'RO-005', uhid: 'SH-2026-04831', patientName: 'Anitha Rao',     ward: 'SP-301',      study: 'USG Pelvis (Follow-up)',       modality: 'Ultrasound',priority: 'Routine', orderedBy: 'Dr. Priya Nair',   orderedAt: window._HIS_DATE(0), status: 'Scheduled', room: 'ROOM-U2', studyId: 'STUDY-SEED-005' }
    ];
  }

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
seedState();

state.validate = function(action, data) {
  // Find rule configuration to make sure it's active
  const getRule = (id) => state.validationRules.find(r => r.id === id && r.status === 'Active');

  if (action === 'Demographic Entry') {
    // 1. Future DOB validation
    if (data.dob) {
      const birthDate = new Date(data.dob);
      if (birthDate > Date.now()) {
        return { status: 'BLOCK', message: '⚠️ DEMOGRAPHIC VALIDATION FAILURE:\nPatient Date of Birth cannot be in the future.' };
      }
      
      const ageDiff = Date.now() - birthDate.getTime();
      const ageDate = new Date(ageDiff);
      const age = Math.abs(ageDate.getUTCFullYear() - 1970);
      if (age < 0 || age > 120) {
        return { status: 'BLOCK', message: '⚠️ DEMOGRAPHIC VALIDATION FAILURE:\nCalculated age is invalid (must be between 0 and 120).' };
      }
    }

    // 2. Mobile validation
    if (data.mobile) {
      const mobileClean = data.mobile.replace(/[^0-9]/g, '');
      if (mobileClean.length < 10 || mobileClean.length > 12) {
        return { status: 'BLOCK', message: '⚠️ DEMOGRAPHIC VALIDATION FAILURE:\nInvalid mobile number. Mobile number must contain 10 to 12 digits.' };
      }
    }

    // 3. Email validation
    if (data.email && !data.email.includes('@')) {
      return { status: 'BLOCK', message: '⚠️ DEMOGRAPHIC VALIDATION FAILURE:\nInvalid email address format.' };
    }

    // 4. Duplicate ABHA validation
    if (data.abhaId && data.abhaId !== 'No ABHA Tagged' && data.abhaId !== '') {
      const dupAbha = state.patients.find(p => p.uhid !== data.excludeUhid && p.abhaId && p.abhaId.trim() === data.abhaId.trim());
      if (dupAbha) {
        return { status: 'BLOCK', message: `⚠️ DEMOGRAPHIC VALIDATION FAILURE:\nABHA ID ${data.abhaId} is already linked to patient ${dupAbha.name} (${dupAbha.uhid}).` };
      }
    }

    // 5. Duplicate Aadhaar validation
    if (data.aadhaar && data.aadhaar !== 'Not Provided' && data.aadhaar !== '') {
      const dupAadhaar = state.patients.find(p => p.uhid !== data.excludeUhid && p.aadhaar && p.aadhaar.trim() === data.aadhaar.trim());
      if (dupAadhaar) {
        return { status: 'BLOCK', message: `⚠️ DEMOGRAPHIC VALIDATION FAILURE:\nAadhaar Number ${data.aadhaar} is already linked to patient ${dupAadhaar.name} (${dupAadhaar.uhid}).` };
      }
    }
  }

  if (action === 'Duplicate Entry') {
    const rule = getRule('RULE03');
    if (!rule) return { status: 'PASS' };

    const newNameClean = data.name ? data.name.toLowerCase().trim() : '';
    const mobileClean = data.mobile ? data.mobile.replace(/[^0-9]/g, '') : '';
    const abha = data.abhaId ? data.abhaId.trim() : '';
    const aadhaar = data.aadhaar ? data.aadhaar.trim() : '';
    const passport = data.passport ? data.passport.trim() : '';
    const insuranceId = data.insuranceId ? data.insuranceId.trim() : '';
    const age = data.age;

    const duplicate = state.patients.find(p => {
      const matchMobile = mobileClean && p.mobile && p.mobile.replace(/[^0-9]/g, '').includes(mobileClean);
      const matchAbha = abha && p.abhaId && p.abhaId.replace(/-/g, '') === abha.replace(/-/g, '');
      const matchAadhaar = aadhaar && p.aadhaar && p.aadhaar === aadhaar && aadhaar !== 'Not Provided' && aadhaar !== '';
      const matchPassport = passport && p.passport && p.passport === passport && passport !== 'Not Provided' && passport !== '';
      const matchInsId = insuranceId && p.insuranceId && p.insuranceId === insuranceId && insuranceId !== 'Not Provided' && insuranceId !== '';
      const matchNameAge = newNameClean && p.name.toLowerCase().trim() === newNameClean && p.age === age;
      
      return matchMobile || matchAbha || matchAadhaar || matchPassport || matchInsId || matchNameAge;
    });

    if (duplicate) {
      let score = 30;
      let reasons = [];
      if (mobileClean && duplicate.mobile && duplicate.mobile.replace(/[^0-9]/g, '').includes(mobileClean)) { score += 30; reasons.push("Mobile number matches"); }
      if (abha && duplicate.abhaId && duplicate.abhaId.replace(/-/g, '') === abha.replace(/-/g, '')) { score += 30; reasons.push("ABHA ID matches"); }
      if (aadhaar && duplicate.aadhaar === aadhaar && aadhaar !== 'Not Provided' && aadhaar !== '') { score += 40; reasons.push("Aadhaar Number matches"); }
      if (passport && duplicate.passport === passport && passport !== 'Not Provided' && passport !== '') { score += 40; reasons.push("Passport Number matches"); }
      if (insuranceId && duplicate.insuranceId === insuranceId && insuranceId !== 'Not Provided' && insuranceId !== '') { score += 30; reasons.push("Insurance Policy ID matches"); }
      if (newNameClean && duplicate.name.toLowerCase().trim() === newNameClean && duplicate.age === age) { score += 30; reasons.push("Exact Name & Age match"); }
      score = Math.min(100, score);

      return {
        status: 'WARNING',
        severity: 'Warning',
        ruleId: 'RULE03',
        score: score,
        reasons: reasons,
        existingPatient: duplicate
      };
    }
  }

  if (action === 'Prescription') {
    const allergyRule = getRule('RULE01');
    const interactionRule = getRule('RULE05');
    const patient = state.patients.find(p => p.uhid === data.patientUhid);
    if (!patient) return { status: 'PASS' };

    const drugName = data.drugName;
    const drugClean = drugName.toLowerCase();
    
    // Find the drug object in inventory
    const drugObj = state.inventory.pharmacy.find(item => item.brandName.toLowerCase() === drugClean || item.name.toLowerCase() === drugClean || item.genericName.toLowerCase() === drugClean);

    let safetyAlerts = [];
    let severity = 'Warning'; // Default severity

    // 1. Drug Allergy Check (RULE01)
    if (allergyRule && patient.allergies && patient.allergies !== 'No Known Allergies') {
      const allergiesClean = patient.allergies.toLowerCase();
      
      const isPenicillinAllergic = allergiesClean.includes('penicillin');
      const isPenicillinDrug = drugClean.includes('penicillin') || drugClean.includes('amoxicillin') || drugClean.includes('clavam') || drugClean.includes('ampicillin') || drugClean.includes('piperacillin') || (drugObj && drugObj.genericName.toLowerCase().includes('amoxicillin'));
      
      const isSulfaAllergic = allergiesClean.includes('sulfa');
      const isSulfaDrug = drugClean.includes('sulfa') || drugClean.includes('bactrim') || drugClean.includes('co-trimoxazole');

      if ((isPenicillinAllergic && isPenicillinDrug) || (isSulfaAllergic && isSulfaDrug)) {
        const allergenGroup = isPenicillinAllergic && isPenicillinDrug ? 'Penicillin Group' : 'Sulfa Group';
        safetyAlerts.push({
          type: 'Allergy Alert',
          severity: 'Critical Safety Alert',
          message: `🚨 DRUG-ALLERGY CONFLICT: Patient has documented allergy to ${allergenGroup}. Prescribing ${drugName} is contraindicated.`
        });
        severity = 'Critical Safety Alert';
      }
    }

    // 2. Drug-Drug Interaction Check (RULE05)
    if (interactionRule && patient.prescriptions) {
      const activePrescriptions = patient.prescriptions.map(p => p.drug.toLowerCase());

      const isNewNsaid = drugClean.includes('paracetamol') || drugClean.includes('dolo') || drugClean.includes('crocin') || drugClean.includes('calpol') || drugClean.includes('pacimol') || drugClean.includes('ibuprofen') || drugClean.includes('combiflam') || (drugObj && (drugObj.genericName.toLowerCase().includes('paracetamol') || drugObj.genericName.toLowerCase().includes('ibuprofen')));
      const hasActiveNsaid = activePrescriptions.some(d => d.includes('paracetamol') || d.includes('dolo') || d.includes('crocin') || d.includes('calpol') || d.includes('pacimol') || d.includes('ibuprofen') || d.includes('combiflam'));

      if (isNewNsaid && hasActiveNsaid) {
        safetyAlerts.push({
          type: 'Drug Interaction',
          severity: 'Warning',
          message: `⚠️ THERAPEUTIC DUPLICATION ALERT: Patient is already prescribed an NSAID/Analgesic. Co-prescribing another NSAID increases risk of gastrointestinal issues.`
        });
      }
    }

    // 3. Pregnancy Safety Validation
    if (patient.pregnancyStatus === 'Pregnant' && drugObj) {
      if (drugObj.pregnancyCategory === 'X' || drugObj.pregnancyCategory === 'D') {
        safetyAlerts.push({
          type: 'Pregnancy Alert',
          severity: 'Critical Safety Alert',
          message: `🤰 PREGNANCY WARNING: Prescribing ${drugName} (Category ${drugObj.pregnancyCategory}) is contraindicated during pregnancy.`
        });
        severity = 'Critical Safety Alert';
      } else if (drugObj.pregnancyCategory === 'C') {
        safetyAlerts.push({
          type: 'Pregnancy Alert',
          severity: 'Warning',
          message: `🤰 PREGNANCY CAUTION: ${drugName} is Pregnancy Category C. Prescribe only if potential benefits outweigh clinical risks.`
        });
      }
    }

    // 4. Lactation Safety Validation
    if (patient.pregnancyStatus === 'Lactating' && drugObj) {
      if (drugObj.lactationSafety === 'Contraindicated') {
        safetyAlerts.push({
          type: 'Lactation Alert',
          severity: 'Critical Safety Alert',
          message: `🤱 LACTATION WARNING: ${drugName} is contraindicated during breastfeeding.`
        });
        severity = 'Critical Safety Alert';
      } else if (drugObj.lactationSafety === 'Caution') {
        safetyAlerts.push({
          type: 'Lactation Alert',
          severity: 'Warning',
          message: `🤱 LACTATION CAUTION: Excretion of ${drugName} in breastmilk is possible. Monitor infant for adverse effects.`
        });
      }
    }

    // 5. Renal Function Validation (CKD / eGFR)
    if (patient.egfr && drugObj) {
      if (patient.egfr < 30) {
        if (drugObj.genericName.toLowerCase().includes('metformin')) {
          safetyAlerts.push({
            type: 'Renal Alert',
            severity: 'Hard Stop',
            message: `🛑 RENAL CONTRAINDICATION: Metformin is contraindicated in patients with eGFR < 30 mL/min due to high risk of lactic acidosis.`
          });
          severity = 'Hard Stop';
        } else if (drugObj.genericName.toLowerCase().includes('amoxicillin') || drugObj.brandName.toLowerCase().includes('clavam')) {
          safetyAlerts.push({
            type: 'Renal Alert',
            severity: 'Warning',
            message: `⚠️ RENAL DOSAGE ADJUSTMENT: Patient eGFR is ${patient.egfr} mL/min (Severe Impairment). Reduce Amoxicillin dose to Clavam 375mg QD or Novamox 250mg BID.`
          });
        } else if (drugObj.genericName.toLowerCase().includes('ibuprofen') || drugObj.brandName.toLowerCase().includes('combiflam')) {
          safetyAlerts.push({
            type: 'Renal Alert',
            severity: 'Warning',
            message: `⚠️ RENAL WARNING: NSAID use in eGFR < 30 mL/min is contraindicated due to increased risk of acute kidney injury.`
          });
        }
      } else if (patient.egfr < 45) {
        if (drugObj.genericName.toLowerCase().includes('metformin')) {
          safetyAlerts.push({
            type: 'Renal Alert',
            severity: 'Warning',
            message: `⚠️ RENAL DOSAGE ADJUSTMENT: Patient eGFR is ${patient.egfr} mL/min (Moderate Impairment). Metformin maximum daily dose is 1000mg; monitor closely.`
          });
        }
      }
    }

    // 6. Liver Function Validation
    if (patient.liverFunction === 'Impaired' && drugObj) {
      if (drugObj.liverSafety === 'Contraindicated in liver disease' || drugObj.brandName.toLowerCase().includes('lipvas') || drugObj.brandName.toLowerCase().includes('atorva')) {
        safetyAlerts.push({
          type: 'Hepatic Alert',
          severity: 'Critical Safety Alert',
          message: `🧪 HEPATIC CONTRAINDICATION: Atorvastatin is contraindicated in patients with active liver disease.`
        });
        severity = 'Critical Safety Alert';
      } else if (drugObj.genericName.toLowerCase().includes('paracetamol')) {
        safetyAlerts.push({
          type: 'Hepatic Alert',
          severity: 'Warning',
          message: `⚠️ HEPATIC DOSAGE ADJUSTMENT: Patient has liver impairment. Limit total daily dose of Paracetamol to 2g (max 3 tablets of 650mg/day) to prevent hepatotoxicity.`
        });
      }
    }

    // 7. Age-Based Validation (Pediatric / Geriatric)
    if (patient.age && drugObj) {
      if (patient.age < 12 && drugObj.strength.includes('650mg') && drugObj.genericName.toLowerCase().includes('paracetamol')) {
        safetyAlerts.push({
          type: 'Age Alert',
          severity: 'Warning',
          message: `👶 PEDIATRIC WARNING: 650mg dosage form is not recommended for children under 12 years. Prescribe Crocin Pediatric Drops instead.`
        });
      } else if (patient.age >= 65 && (drugObj.genericName.toLowerCase().includes('ibuprofen') || drugObj.brandName.toLowerCase().includes('combiflam'))) {
        safetyAlerts.push({
          type: 'Age Alert',
          severity: 'Warning',
          message: `👴 GERIATRIC WARNING: NSAID use in patients over 65 increases risk of GI bleeding, cardiovascular events, and renal impairment.`
        });
      }
    }

    if (safetyAlerts.length > 0) {
      return {
        status: 'WARNING',
        severity: severity,
        ruleId: 'RULE01_05',
        alerts: safetyAlerts,
        message: safetyAlerts.map(a => a.message).join('\n')
      };
    }
  }

  if (action === 'Transfusion Issue') {
    const rule = getRule('RULE02');
    if (!rule) return { status: 'PASS' };

    const patient = state.patients.find(p => p.uhid === data.patientUhid);
    if (!patient) return { status: 'PASS' };

    const patientBlood = patient.bloodGroup.trim();
    const donorBlood = data.bloodGroupRequired.trim();

    let isCompatible = false;
    if (patientBlood === 'AB+') {
      isCompatible = true;
    } else if (patientBlood === 'AB-') {
      isCompatible = ['O-', 'A-', 'B-', 'AB-'].includes(donorBlood);
    } else if (patientBlood === 'A+') {
      isCompatible = ['O-', 'O+', 'A-', 'A+'].includes(donorBlood);
    } else if (patientBlood === 'A-') {
      isCompatible = ['O-', 'A-'].includes(donorBlood);
    } else if (patientBlood === 'B+') {
      isCompatible = ['O-', 'O+', 'B-', 'B+'].includes(donorBlood);
    } else if (patientBlood === 'B-') {
      isCompatible = ['O-', 'B-'].includes(donorBlood);
    } else if (patientBlood === 'O+') {
      isCompatible = ['O-', 'O+'].includes(donorBlood);
    } else if (patientBlood === 'O-') {
      isCompatible = donorBlood === 'O-';
    }

    if (!isCompatible) {
      return {
        status: 'BLOCK',
        severity: 'Hard Stop',
        ruleId: 'RULE02',
        message: `🛑 HARD STOP: ABO INCOMPATIBILITY DETECTED!\nPatient Blood Group is ${patientBlood}, but requested transfusion blood group is ${donorBlood}. Transfusion blocked immediately to prevent acute hemolytic reaction.`
      };
    }
  }

  if (action === 'Vitals Entry') {
    const rule = getRule('RULE04');
    if (!rule) return { status: 'PASS' };

    const bp = data.vitals.bp;
    const hr = parseInt(data.vitals.hr);
    const temp = parseFloat(data.vitals.temp);
    const spo2 = parseInt(data.vitals.spo2);

    let newsScore = 0;
    let reasons = [];

    // HR NEWS2 Score
    if (hr <= 40 || hr >= 131) {
      newsScore += 3;
      reasons.push(`Critical Heart Rate: ${hr} bpm`);
    } else if (hr >= 111 && hr <= 130) {
      newsScore += 2;
      reasons.push(`Elevated Heart Rate: ${hr} bpm`);
    } else if ((hr >= 41 && hr <= 50) || (hr >= 91 && hr <= 110)) {
      newsScore += 1;
      reasons.push(`Mild Heart Rate variation: ${hr} bpm`);
    }

    // SpO2 NEWS2 Score
    if (spo2 <= 91) {
      newsScore += 3;
      reasons.push(`Critical Oxygen Saturation: ${spo2}%`);
    } else if (spo2 >= 92 && spo2 <= 93) {
      newsScore += 2;
      reasons.push(`Low Oxygen Saturation: ${spo2}%`);
    } else if (spo2 >= 94 && spo2 <= 95) {
      newsScore += 1;
      reasons.push(`Mild Oxygen Saturation drop: ${spo2}%`);
    }

    // Temp NEWS2 Score
    if (temp <= 95.0 || temp >= 102.3) {
      newsScore += 3;
      reasons.push(`Critical Body Temperature: ${temp}°F`);
    } else if ((temp >= 95.1 && temp <= 96.8) || (temp >= 100.5 && temp <= 102.2)) {
      newsScore += 1;
      reasons.push(`Fever/Hypothermia: ${temp}°F`);
    }

    // Systolic BP NEWS2 Score
    const systolic = parseInt(bp.split('/')[0]);
    if (systolic) {
      if (systolic <= 90 || systolic >= 220) {
        newsScore += 3;
        reasons.push(`Critical Systolic Blood Pressure: ${systolic} mmHg`);
      } else if (systolic >= 91 && systolic <= 100) {
        newsScore += 2;
        reasons.push(`Low Systolic Blood Pressure: ${systolic} mmHg`);
      } else if (systolic >= 101 && systolic <= 110) {
        newsScore += 1;
        reasons.push(`Mild Systolic Blood Pressure drop: ${systolic} mmHg`);
      }
    }

    if (newsScore >= 5 || reasons.some(r => r.includes('Critical'))) {
      return {
        status: 'WARNING',
        severity: 'Critical Safety Alert',
        ruleId: 'RULE04',
        score: newsScore,
        reasons: reasons,
        message: `🚨 CRITICAL SAFETY ALERT: SEPSIS RISK (NEWS2 Score: ${newsScore})\nPatient exhibits physiological instability: ${reasons.join(', ')}. Immediately notify medical registrar.`
      };
    }
  }

  if (action === 'Dispensing') {
    const rule = getRule('RULE05');
    if (!rule) return { status: 'PASS' };

    const patient = state.patients.find(p => p.uhid === data.patientUhid);
    if (!patient || !patient.prescriptions) return { status: 'PASS' };

    const activeDrugs = patient.prescriptions.map(p => p.drug.toLowerCase());
    
    let nsaidCount = 0;
    activeDrugs.forEach(d => {
      if (d.includes('paracetamol') || d.includes('dolo') || d.includes('ibuprofen') || d.includes('combiflam')) {
        nsaidCount++;
      }
    });

    if (nsaidCount > 1) {
      return {
        status: 'WARNING',
        severity: 'Warning',
        ruleId: 'RULE05',
        message: `⚠️ JCI PHARMACY DISPENSING WARNING:\nTherapeutic Duplication detected. Prescription contains multiple NSAIDs/Analgesics which may cause adverse renal/GI issues.`
      };
    }
  }

  if (action === 'Bed Status Update') {
    const rule = getRule('RULE07');
    if (rule) {
      const bedId = data.bedId;
      const newStatus = data.newStatus;
      const currentBed = state.bedsStatus[bedId];

      if (currentBed) {
        // Invalid Action 1: Occupied -> Housekeeping
        if (currentBed.status === 'Occupied' && (newStatus === 'Vacated - Pending Housekeeping' || newStatus === 'Housekeeping In Progress' || newStatus === 'House Keeping')) {
          return {
            status: 'BLOCK',
            severity: 'Hard Stop',
            ruleId: 'RULE07',
            message: '⚠️ Bed is currently occupied by an active patient. Complete discharge or transfer before initiating housekeeping.'
          };
        }

        // Invalid Action 2: Occupied -> Available
        if (currentBed.status === 'Occupied' && (newStatus === 'Available' || newStatus === 'Vacant')) {
          return {
            status: 'BLOCK',
            severity: 'Hard Stop',
            ruleId: 'RULE07',
            message: '⚠️ An occupied bed cannot be marked available.'
          };
        }

        // Invalid Action 3: Vacated Pending Housekeeping -> Occupied
        if (currentBed.status === 'Vacated - Pending Housekeeping' && newStatus === 'Occupied') {
          return {
            status: 'BLOCK',
            severity: 'Hard Stop',
            ruleId: 'RULE07',
            message: '⚠️ Bed cleaning must be completed before reassignment.'
          };
        }

        // Invalid Action 4: Housekeeping In Progress -> Occupied
        if (currentBed.status === 'Housekeeping In Progress' && newStatus === 'Occupied') {
          return {
            status: 'BLOCK',
            severity: 'Hard Stop',
            ruleId: 'RULE07',
            message: '⚠️ Bed is currently under cleaning and cannot be assigned.'
          };
        }

        // Invalid Action 5: Maintenance Required -> Occupied
        if (currentBed.status === 'Maintenance Required' && newStatus === 'Occupied') {
          return {
            status: 'BLOCK',
            severity: 'Hard Stop',
            ruleId: 'RULE07',
            message: '⚠️ Bed is under maintenance and unavailable for patient assignment.'
          };
        }
      }
    }
  }

  return { status: 'PASS' };
};

window.setupPatientAutocomplete = function({
  searchInputId,
  hiddenInputId,
  autocompleteListId,
  filterFn,
  onSelect
}) {
  const searchInput = document.getElementById(searchInputId);
  const hiddenInput = document.getElementById(hiddenInputId);
  const autocompleteList = document.getElementById(autocompleteListId);

  if (!searchInput || !hiddenInput || !autocompleteList) return;

  const showDropdown = () => {
    const query = searchInput.value.toLowerCase().trim();
    let matched = state.patients;
    if (filterFn) {
      matched = matched.filter(filterFn);
    }

    if (query) {
      matched = matched.filter(p => 
        p.name.toLowerCase().includes(query) ||
        p.mobile.includes(query) ||
        p.uhid.toLowerCase().includes(query)
      );
    }

    if (matched.length === 0) {
      autocompleteList.innerHTML = `<div class="autocomplete-group-title">No matching patients found</div>`;
      autocompleteList.style.display = 'block';
      return;
    }

    autocompleteList.innerHTML = `
      <div class="autocomplete-group-title">Patients (${matched.length})</div>
      ${matched.map(p => `
        <div class="autocomplete-item" data-uhid="${p.uhid}" data-name="${p.name}">
          <div class="autocomplete-item-row">
            <span class="autocomplete-brand-name">${p.name}</span>
            <span class="badge" style="font-size: 0.75rem; background-color: var(--primary-glow); color: var(--primary); padding: 2px 6px; border-radius: 4px;">${p.uhid}</span>
          </div>
          <div class="autocomplete-meta-line" style="display: flex; justify-content: space-between; gap: 1rem; align-items: center; font-size: 0.75rem; color: var(--text-muted); margin-top: 0.25rem;">
            <span>📱 ${p.mobile} | Age: ${p.age} | ${p.gender}</span>
            <span style="font-weight: 600; color: ${p.status === 'Admitted' ? 'var(--color-success)' : 'var(--text-muted)'};">${p.status}</span>
          </div>
        </div>
      `).join('')}
    `;

    autocompleteList.style.display = 'block';

    const items = autocompleteList.querySelectorAll('.autocomplete-item');
    items.forEach(item => {
      item.addEventListener('mousedown', (e) => {
        e.preventDefault();
      });
      item.addEventListener('click', () => {
        const uhid = item.getAttribute('data-uhid');
        const name = item.getAttribute('data-name');
        
        searchInput.value = `${name} (${uhid})`;
        hiddenInput.value = uhid;
        autocompleteList.style.display = 'none';

        hiddenInput.dispatchEvent(new Event('change'));

        if (onSelect) {
          onSelect(uhid, name);
        }
      });
    });
  };

  searchInput.addEventListener('focus', () => {
    showDropdown();
  });

  searchInput.addEventListener('input', showDropdown);

  searchInput.addEventListener('blur', () => {
    setTimeout(() => {
      autocompleteList.style.display = 'none';
      
      const selectedUhid = hiddenInput.value;
      const patient = state.patients.find(p => p.uhid === selectedUhid);
      if (patient) {
        searchInput.value = `${patient.name} (${patient.uhid})`;
      } else {
        searchInput.value = '';
        hiddenInput.value = '';
        hiddenInput.dispatchEvent(new Event('change'));
      }
    }, 200);
  });
};

state.logBedMovement = function({
  patientId = null,
  encounterId = null,
  bedId,
  wardKey,
  prevStatus,
  newStatus,
  action,
  user = 'Dr. Amit Verma',
  role = 'System Admin',
  reason = '',
  remarks = ''
}) {
  state.bedAuditLogs = state.bedAuditLogs || [];
  state.bedAuditLogs.push({
    timestamp: new Date().toISOString(),
    patientId,
    encounterId,
    bedId,
    wardKey,
    prevStatus,
    newStatus,
    action,
    user,
    role,
    reason,
    remarks
  });
};

state.triggerHousekeepingRequest = function(bedId, wardKey, notes) {
  if (!bedId || !wardKey) return;
  state.housekeepingTasks = state.housekeepingTasks || [];
  
  // Check if there is an active (non-Completed, non-Verified) task for this bed
  const exists = state.housekeepingTasks.some(t => t.bedId === bedId && t.status !== 'Completed' && t.status !== 'Verified');
  if (exists) return;

  const taskId = 'HK-' + String(1000 + state.housekeepingTasks.length + 1);
  const newTask = {
    id: taskId,
    taskId: taskId,
    type: "Discharge Cleaning",
    source: "IPD",
    bedId: bedId,
    wardKey: wardKey,
    priority: (bedId.startsWith('EMG') || bedId.startsWith('CCU') || bedId.startsWith('ICCU')) ? 'High' : 'Normal',
    status: 'New',
    createdTime: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    assignee: null,
    assignedTime: null,
    completedTime: null,
    verifiedTime: null,
    icNurseSigned: false,
    icNurseName: null,
    checklist: {
      "Floor mopped with disinfectant": false,
      "Surfaces wiped": false,
      "Bin emptied and relined": false,
      "Linen changed": false,
      "Bathroom cleaned": false,
      "Equipment wiped": false
    },
    remarks: notes || 'Awaiting cleaning request',
    audit: [{ timestamp: new Date().toISOString(), user: 'ATD System', role: 'System', action: 'CREATE', remarks: notes || 'Awaiting clean request' }]
  };

  state.housekeepingTasks.push(newTask);
  localStorage.setItem('saronil_housekeeping_tasks', JSON.stringify(state.housekeepingTasks));

  // Sync state.hkAuditLogs
  state.hkAuditLogs = state.hkAuditLogs || [];
  state.hkAuditLogs.unshift({
    timestamp: new Date().toISOString(),
    user: 'ATD System',
    role: 'System',
    action: 'AUTO_CREATE',
    taskId: taskId,
    roomBed: bedId,
    remarks: notes || 'Cleaning request automatically assigned.'
  });
  localStorage.setItem('saronil_hk_audit_logs', JSON.stringify(state.hkAuditLogs));
};

state.completeHousekeepingTasks = function(bedId) {
  if (!bedId) return;
  state.housekeepingTasks = state.housekeepingTasks || [];
  let updated = false;
  state.housekeepingTasks.forEach(t => {
    if (t.bedId === bedId && t.status !== 'Completed' && t.status !== 'Verified') {
      t.status = 'Verified';
      t.completedTime = new Date().toISOString();
      t.verifiedTime = new Date().toISOString();
      t.audit.push({ timestamp: new Date().toISOString(), user: 'ATD System', role: 'System', action: 'VERIFY', remarks: 'Bed marked ready/available in Bed Board.' });
      
      state.hkAuditLogs = state.hkAuditLogs || [];
      state.hkAuditLogs.unshift({
        timestamp: new Date().toISOString(),
        user: 'ATD System',
        role: 'System',
        action: 'VERIFY',
        taskId: t.id,
        roomBed: bedId,
        remarks: 'Cleaning verified and bed marked available.'
      });
      updated = true;
    }
  });
  if (updated) {
    localStorage.setItem('saronil_housekeeping_tasks', JSON.stringify(state.housekeepingTasks));
    localStorage.setItem('saronil_hk_audit_logs', JSON.stringify(state.hkAuditLogs));
  }
};
  // Initialize Daycare collections
  state.daycareBookings = [];
  state.daycareAuditLogs = [];
  state.unplannedReturns = [];
  
  // Insurer Daycare cashless eligible procedure lists
  state.daycarePayerProcedureLists = {
    "Star Health": ["Cataract Surgery", "Chemotherapy Infusion", "Biopsy Sample Collection", "Dialysis Treatment"],
    "HDFC ERGO": ["Chemotherapy Infusion", "Endoscopy Scope Evaluation", "Laparoscopic Appendectomy", "Hernia Repair"],
    "ICICI Lombard": ["Cataract Surgery", "Minor Debridement & Dressing", "Biopsy Sample Collection", "Laparoscopic Cholecystectomy"]
  };

  // Seed the 3 custom daycare admissions with specific elapsed times
  state.daycareAdmissions = [];
  
  // Setup 3 patients for daycare
  const dcPatients = [
    state.patients.find(p => p.uhid === "SH-2026-04822") || state.patients[0],
    state.patients.find(p => p.uhid === "SH-2026-04812") || state.patients[1],
    state.patients.find(p => p.uhid === "SH-2026-04801") || state.patients[2]
  ];

  // Admission timestamps to get exact elapsed stay clocks
  const nowMs = Date.now();
  const timeA = new Date(nowMs - 2 * 60 * 60 * 1000).toISOString(); // 2 hours stay
  const timeB = new Date(nowMs - (10 * 60 + 15) * 60 * 1000).toISOString(); // 10h 15m stay
  const timeC = new Date(nowMs - (12 * 60 + 5) * 60 * 1000).toISOString(); // 12h 5m stay (breached)

  state.daycareAdmissions.push({
    patient: dcPatients[0],
    bedId: "DC-B1",
    ward: "Daycare Ward",
    bedNo: "DC-B1",
    consultantName: "Dr. Amit Verma",
    procedureName: "Chemotherapy Infusion",
    admissionType: "Daycare",
    admissionTimestamp: timeA,
    status: "Registered",
    historyLogs: [{ timestamp: timeA, action: "Daycare Bed Allocated & Registered" }],
    tasks: [
      { id: "vitals-1", name: "Take Pre-Op Vitals (BP, pulse, SpO2, Temp)", completed: true },
      { id: "meds-1", name: "Verify Medication Dose and Frequency", completed: false },
      { id: "postcheck-1", name: "Post-procedure Site Assessment", completed: false }
    ]
  });

  state.daycareAdmissions.push({
    patient: dcPatients[1],
    bedId: "DC-B2",
    ward: "Daycare Ward",
    bedNo: "DC-B2",
    consultantName: "Dr. Neha Sharma",
    procedureName: "Cataract Surgery",
    admissionType: "Daycare",
    admissionTimestamp: timeB,
    status: "Tasks Updated",
    historyLogs: [
      { timestamp: timeB, action: "Daycare Bed Allocated & Registered" },
      { timestamp: timeB, action: "Pre-Procedure Checklist Submitted & Locked" }
    ],
    tasks: [
      { id: "vitals-1", name: "Take Pre-Op Vitals (BP, pulse, SpO2, Temp)", completed: true },
      { id: "meds-1", name: "Verify Medication Dose and Frequency", completed: true },
      { id: "postcheck-1", name: "Post-procedure Site Assessment", completed: true }
    ],
    checklist: {
      bp: "130/80", pulse: 72, spo2: 98, temp: "98.6", weight: 60, fasting: "Yes", fastingHours: 8, consent: "Yes", allergyFlag: "No"
    }
  });

  state.daycareAdmissions.push({
    patient: dcPatients[2],
    bedId: "DC-B3",
    ward: "Daycare Ward",
    bedNo: "DC-B3",
    consultantName: "Dr. Rajesh Patel",
    procedureName: "Laparoscopic Hernia Repair",
    admissionType: "Daycare",
    admissionTimestamp: timeC,
    status: "Post-op Monitored",
    historyLogs: [
      { timestamp: timeC, action: "Daycare Bed Allocated & Registered" },
      { timestamp: timeC, action: "Pre-Procedure Checklist Submitted & Locked" },
      { timestamp: timeC, action: "Post-op Recovery Logs Submitted & Saved" }
    ],
    tasks: [
      { id: "vitals-1", name: "Take Pre-Op Vitals (BP, pulse, SpO2, Temp)", completed: true },
      { id: "meds-1", name: "Verify Medication Dose and Frequency", completed: true },
      { id: "postcheck-1", name: "Post-procedure Site Assessment", completed: true }
    ],
    checklist: {
      bp: "120/80", pulse: 68, spo2: 99, temp: "98.4", weight: 78, fasting: "Yes", fastingHours: 12, consent: "Yes", allergyFlag: "No"
    },
    postopCheck: {
      bp: "118/78", pulse: 70, spo2: 98, temp: "98.2", condition: "Stable", notes: "Post-op recovery uneventful. Complaining of mild surgical site pain."
    }
  });

  // Assign these beds as Occupied in state.bedsStatus
  state.bedsStatus["DC-B1"] = { wardKey: "DAYCARE", status: "Occupied", patientUhid: dcPatients[0].uhid, notes: "Chemotherapy Infusion" };
  state.bedsStatus["DC-B2"] = { wardKey: "DAYCARE", status: "Occupied", patientUhid: dcPatients[1].uhid, notes: "Cataract Surgery" };
  state.bedsStatus["DC-B3"] = { wardKey: "DAYCARE", status: "Occupied", patientUhid: dcPatients[2].uhid, notes: "Laparoscopic Hernia Repair" };

  // Set DC-B4 to DC-B10 as Available
  for (let i = 4; i <= 10; i++) {
    state.bedsStatus[`DC-B${i}`] = { wardKey: "DAYCARE", status: "Available", patientUhid: null, notes: "" };
  }

  // Pre-seed local storage so it loads properly immediately
  localStorage.setItem('saronil_daycare_admissions', JSON.stringify(state.daycareAdmissions));

  // Initialize Housekeeping structures
  state.hkSlaSettings = JSON.parse(localStorage.getItem('saronil_hk_sla_settings')) || {
    'Discharge Cleaning': 30,
    'Isolation Room Cleaning': 15,
    'OT Cleaning': 20,
    'Bed Cleaning': 45,
    'General Room Cleaning': 60,
    'Public Area Cleaning': 60,
    'Scheduled Cleaning': 60
  };

  state.hkStaffList = JSON.parse(localStorage.getItem('saronil_hk_staff')) || [
    { id: "HK-STF01", name: "Ramu K.", shift: "Morning", activeTasks: 1 },
    { id: "HK-STF02", name: "Somu L.", shift: "Morning", activeTasks: 1 },
    { id: "HK-STF03", name: "Ajay S.", shift: "Afternoon", activeTasks: 0 },
    { id: "HK-STF04", name: "Shalini V.", shift: "Afternoon", activeTasks: 0 },
    { id: "HK-STF05", name: "Vijay M.", shift: "Night", activeTasks: 0 },
    { id: "HK-STF06", name: "Priya S.", shift: "Night", activeTasks: 0 }
  ];

  state.hkAuditLogs = JSON.parse(localStorage.getItem('saronil_hk_audit_logs')) || [
    { timestamp: new Date(Date.now() - 3600000).toISOString(), user: "System", role: "System", action: "AUTO_CREATE", taskId: "HK-1001", roomBed: "GW(M)-409", remarks: "Discharge order confirmed for patient, task created." }
  ];

  state.housekeepingTasks = JSON.parse(localStorage.getItem('saronil_housekeeping_tasks')) || [
    {
      id: "HK-1001",
      type: "Discharge Cleaning",
      source: "IPD",
      bedId: "GW(M)-409",
      status: "New",
      createdTime: new Date(Date.now() - 720000).toISOString(), // 12 minutes ago -> triggers supervisor warning if unassigned > 10 min
      assignee: null,
      assignedTime: null,
      completedTime: null,
      verifiedTime: null,
      icNurseSigned: false,
      icNurseName: null,
      checklist: {
        "Floor mopped with disinfectant": false,
        "Surfaces wiped": false,
        "Bin emptied and relined": false,
        "Linen changed": false,
        "Bathroom cleaned": false,
        "Equipment wiped": false
      },
      audit: [
        { timestamp: new Date(Date.now() - 720000).toISOString(), user: "System", role: "System", action: "AUTO_CREATE", remarks: "System auto-created task on patient discharge order confirmation." }
      ]
    },
    {
      id: "HK-1002",
      type: "Bed Cleaning",
      source: "IPD",
      bedId: "SP-301",
      status: "Assigned",
      createdTime: new Date(Date.now() - 1200000).toISOString(),
      assignee: "Ramu K.",
      assignedTime: new Date(Date.now() - 1100000).toISOString(),
      completedTime: null,
      verifiedTime: null,
      icNurseSigned: false,
      icNurseName: null,
      checklist: {
        "Mattress wipe": false,
        "Surfaces wiped": false,
        "Bin emptied and relined": false
      },
      audit: [
        { timestamp: new Date(Date.now() - 1200000).toISOString(), user: "Nurse Anjali", role: "Ward Nurse", action: "CREATE", remarks: "Manual request raised by ward nursing desk." },
        { timestamp: new Date(Date.now() - 1100000).toISOString(), user: "Supervisor Satish", role: "HK Supervisor", action: "ASSIGN", remarks: "Assigned to Ramu K. for Morning shift." }
      ]
    },
    {
      id: "HK-1003",
      type: "Isolation Room Cleaning",
      source: "IPD",
      bedId: "PVT-201",
      status: "In Progress",
      createdTime: new Date(Date.now() - 600000).toISOString(),
      assignee: "Somu L.",
      assignedTime: new Date(Date.now() - 550000).toISOString(),
      completedTime: null,
      verifiedTime: null,
      icNurseSigned: false,
      icNurseName: null,
      checklist: {
        "PPE donned": true,
        "Enhanced disinfectant used": true,
        "Post-clean fumigation logged": false,
        "IC Nurse notified": false,
        "Floor mopped with disinfectant": false,
        "Surfaces wiped": false,
        "Bin emptied and relined": false
      },
      audit: [
        { timestamp: new Date(Date.now() - 600000).toISOString(), user: "Nurse Preeti", role: "IC Nurse", action: "CREATE", remarks: "Isolation room release terminal clean requested." },
        { timestamp: new Date(Date.now() - 550000).toISOString(), user: "Supervisor Satish", role: "HK Supervisor", action: "ASSIGN", remarks: "Assigned to Somu L. on priority." }
      ]
    },
    {
      id: "HK-1004",
      type: "General Room Cleaning",
      source: "ICU",
      bedId: "CCU-BED-02",
      status: "Completed",
      createdTime: new Date(Date.now() - 1800000).toISOString(),
      assignee: "Ramu K.",
      assignedTime: new Date(Date.now() - 1700000).toISOString(),
      completedTime: new Date(Date.now() - 100000).toISOString(),
      verifiedTime: null,
      icNurseSigned: false,
      icNurseName: null,
      checklist: {
        "Floor mopped with disinfectant": true,
        "Surfaces wiped": true,
        "Bin emptied and relined": true,
        "Equipment wiped": true
      },
      audit: [
        { timestamp: new Date(Date.now() - 1800000).toISOString(), user: "Nurse Deepa", role: "Ward Nurse", action: "CREATE", remarks: "Routine daily room sanitisation." },
        { timestamp: new Date(Date.now() - 1700000).toISOString(), user: "Supervisor Satish", role: "HK Supervisor", action: "ASSIGN", remarks: "Assigned to Ramu K." },
        { timestamp: new Date(Date.now() - 100000).toISOString(), user: "Ramu K.", role: "HK Staff", action: "COMPLETE", remarks: "Standard clean completed, checklist items validated." }
      ]
    },
    {
      id: "HK-1005",
      type: "Discharge Cleaning",
      source: "IPD",
      bedId: "GW(F)-414",
      status: "Verified",
      createdTime: new Date(Date.now() - 3600000).toISOString(),
      assignee: "Somu L.",
      assignedTime: new Date(Date.now() - 3500000).toISOString(),
      completedTime: new Date(Date.now() - 1500000).toISOString(),
      verifiedTime: new Date(Date.now() - 1000000).toISOString(),
      icNurseSigned: false,
      icNurseName: null,
      checklist: {
        "Floor mopped with disinfectant": true,
        "Surfaces wiped": true,
        "Bin emptied and relined": true,
        "Linen changed": true,
        "Bathroom cleaned": true,
        "Equipment wiped": true
      },
      audit: [
        { timestamp: new Date(Date.now() - 3600000).toISOString(), user: "System", role: "System", action: "AUTO_CREATE", remarks: "Auto-created on patient discharge order." },
        { timestamp: new Date(Date.now() - 3500000).toISOString(), user: "Supervisor Satish", role: "HK Supervisor", action: "ASSIGN", remarks: "Assigned to Somu L." },
        { timestamp: new Date(Date.now() - 1500000).toISOString(), user: "Somu L.", role: "HK Staff", action: "COMPLETE", remarks: "Clean complete." },
        { timestamp: new Date(Date.now() - 1000000).toISOString(), user: "Supervisor Satish", role: "HK Supervisor", action: "VERIFY", remarks: "Clean inspected and verified. Bed released to Ready." }
      ]
    }
  ];

  // Set some beds to Dirty or Blocked for demonstration
  state.bedsStatus["GW(M)-409"] = { wardKey: "GENERAL-WARD-M", status: "Dirty", patientUhid: null, notes: "Discharged patient" };
  state.bedsStatus["SP-301"] = { wardKey: "SEMI-PRIVATE", status: "Dirty", patientUhid: null, notes: "Awaiting clean" };
  state.bedsStatus["PVT-201"] = { wardKey: "PRIVATE", status: "Cleaning", patientUhid: null, notes: "Isolation clean in progress" };
  state.bedsStatus["CCU-BED-02"] = { wardKey: "CCU", status: "Cleaning", patientUhid: null, notes: "Daily routine clean in progress" };
  state.bedsStatus["DELUXE-401"] = { wardKey: "DELUXE", status: "Blocked", patientUhid: null, notes: "AC servicing in progress" };

  // Initialize Laundry stock & active batches
  state.laundryLinenStock = JSON.parse(localStorage.getItem('saronil_laundry_linen_stock')) || [
    { item: "Double Bed Sheets", available: 180, dirty: 45, minStock: 50 },
    { item: "Pillow Covers", available: 220, dirty: 60, minStock: 60 },
    { item: "OT Towels", available: 95, dirty: 15, minStock: 30 },
    { item: "Doctor Gowns", available: 54, dirty: 8, minStock: 20 }
  ];

  state.laundryBatches = JSON.parse(localStorage.getItem('saronil_laundry_batches')) || [
    { id: "LND-B001", dispatchTime: new Date(Date.now() - 7200000).toISOString(), items: "Double Bed Sheets x30", status: "Sent to Laundry", expectedReturn: new Date(Date.now() + 14400000).toISOString() },
    { id: "LND-B002", dispatchTime: new Date(Date.now() - 86400000).toISOString(), items: "OT Towels x15, Doctor Gowns x10", status: "Clean Received", expectedReturn: new Date(Date.now() - 7200000).toISOString() }
  ];

  // Initialize CSSD stock & loads
  state.cssdInventory = JSON.parse(localStorage.getItem('saronil_cssd_inventory')) || [
    { kitName: "Ortho Surgical Kit A", available: 6, dirty: 2, sterilizedAt: new Date(Date.now() - 18000000).toISOString() },
    { kitName: "General Surgery Pack", available: 12, dirty: 4, sterilizedAt: new Date(Date.now() - 7200000).toISOString() },
    { kitName: "Cardio Surgical Tray B", available: 3, dirty: 1, sterilizedAt: new Date(Date.now() - 86400000).toISOString() }
  ];

  state.cssdActiveLoads = JSON.parse(localStorage.getItem('saronil_cssd_active_loads')) || [
    { loadId: "LOAD-2041", machine: "Autoclave-01 (Pre-Vac)", loadType: "General Surgery Packs", temp: 134, time: 30, status: "Sterilization in Progress", startedAt: new Date(Date.now() - 900000).toISOString() }
  ];

  // Initialize Laundry Department Stock levels (Low / Critical alerts)
  state.laundryDeptStock = JSON.parse(localStorage.getItem('saronil_laundry_dept_stock')) || [
    { dept: "ICU Ward", available: 12, status: "Critical", minStock: 25 },
    { dept: "OT Complex", available: 8, status: "Critical", minStock: 20 },
    { dept: "IPD Wards", available: 95, status: "OK", minStock: 80 },
    { dept: "OPD Clinics", available: 14, status: "Low", minStock: 30 }
  ];
  state.laundryVendorOverdue = JSON.parse(localStorage.getItem('saronil_laundry_vendor_overdue')) || true;

  // Initialize CSSD active sterilizations
  state.cssdActiveSterilizations = JSON.parse(localStorage.getItem('saronil_cssd_active_sterilizations')) || [
    { id: "CSSD-T101", name: "Ortho Major Kit A", stage: "Sterilizing", requestedBy: "OT Room 2", startedAt: new Date(Date.now() - 3600000).toISOString(), eta: new Date(Date.now() + 1800000).toISOString(), status: "On Time", expired: false },
    { id: "CSSD-T102", name: "General Delivery Tray", stage: "Ready", requestedBy: "Maternity Ward", startedAt: new Date(Date.now() - 72000000).toISOString(), eta: new Date(Date.now() - 18000000).toISOString(), status: "On Time", expired: true, expiryDate: new Date(Date.now() - 86400000).toISOString() },
    { id: "CSSD-T103", name: "Cardio Surgery Pack B", stage: "Decontamination", requestedBy: "OT Room 1", startedAt: new Date(Date.now() - 1800000).toISOString(), eta: new Date(Date.now() + 7200000).toISOString(), status: "On Time", expired: false }
  ];
  state.cssdOverdueReturnsAlert = JSON.parse(localStorage.getItem('saronil_cssd_overdue_returns_alert')) || "Alert: 2 Ortho kits overdue for return from Ward-3 since yesterday.";

  // Initialize BMW bags including overdue bags (> 4 hours)
  state.bmwBags = JSON.parse(localStorage.getItem('saronil_bmw_bags')) || [
    { bagId: "BMW-B01", category: "Red Bag (Infected Plastics)", weight: 4.2, department: "IPD Ward", collectedAt: new Date(Date.now() - 1800000).toISOString() },
    { bagId: "BMW-B02", category: "Yellow Bag (Anatomical Waste)", weight: 2.8, department: "OT Complex", collectedAt: new Date(Date.now() - 18000000).toISOString() }, // 5 hours ago (overdue)
    { bagId: "BMW-B03", category: "Blue Glass (Ampoules/Vials)", weight: 1.5, department: "ICU Ward", collectedAt: new Date(Date.now() - 5400000).toISOString() }
  ];
  state.bmwVendorOverdue = JSON.parse(localStorage.getItem('saronil_bmw_vendor_overdue')) || true;
  state.bmwManifestSubmissions = JSON.parse(localStorage.getItem('saronil_bmw_manifest_submissions')) || {
    "IPD Ward": "Submitted",
    "OT Complex": "Submitted",
    "ICU Ward": "Submitted",
    "OPD Clinic": "Missing"
  };

  // Seed detailed HK Audit logs with sub-module markers
  state.hkAuditLogs = JSON.parse(localStorage.getItem('saronil_hk_audit_logs')) || [
    { timestamp: new Date(Date.now() - 1800000).toISOString(), user: "System", role: "System", action: "AUTO_CREATE", subModule: "HK Ops", locationItem: "Bed GW(M)-409", remarks: "Discharge order confirmed for patient, task created." },
    { timestamp: new Date(Date.now() - 3600000).toISOString(), user: "Supervisor Satish", role: "HK Supervisor", action: "ASSIGN", subModule: "HK Ops", locationItem: "Bed SP-301", remarks: "Assigned task to Ramu K." },
    { timestamp: new Date(Date.now() - 5400000).toISOString(), user: "Ramu K.", role: "HK Staff", action: "LAUNDRY_DISPATCH", subModule: "Laundry", locationItem: "Double Bed Sheets x30", remarks: "Sent dirty sheets to external vendor." },
    { timestamp: new Date(Date.now() - 7200000).toISOString(), user: "Sister Anitha", role: "Infection Control Nurse", action: "IC_SIGN_OFF", subModule: "HK Ops", locationItem: "Bed PVT-201", remarks: "Isolation clean signed off." },
    { timestamp: new Date(Date.now() - 9000000).toISOString(), user: "Technician Raj", role: "CSSD Staff", action: "CSSD_LOAD", subModule: "CSSD", locationItem: "General Surgery Pack", remarks: "Autoclave machine pre-vacuum load initiated." },
    { timestamp: new Date(Date.now() - 10800000).toISOString(), user: "Somu L.", role: "HK Staff", action: "BMW_COLLECT", subModule: "BMW", locationItem: "Yellow Bag", remarks: "Collected anatomical waste from OT." }
  ];

  // Seed Scheduled Cleaning configurations (Schedules list)
  state.hkSchedules = JSON.parse(localStorage.getItem('saronil_hk_schedules')) || [
    { areaName: "OPD Waiting Area", frequency: "Daily", times: "07:00, 13:00, 19:00", zone: "OPD Zone", staff: "Ramu K.", nextDue: new Date(Date.now() + 7200000).toISOString(), lastCompleted: new Date(Date.now() - 14400000).toISOString(), status: "Active" },
    { areaName: "Corridors", frequency: "Daily", times: "06:00, 18:00", zone: "General Zone", staff: "Somu L.", nextDue: new Date(Date.now() - 900000).toISOString(), lastCompleted: new Date(Date.now() - 36000000).toISOString(), status: "Missed" }, // 15 mins overdue
    { areaName: "ICU", frequency: "Daily", times: "06:00, 14:00", zone: "ICU Zone", staff: "Ajay S.", nextDue: new Date(Date.now() + 3600000).toISOString(), lastCompleted: new Date(Date.now() - 28800000).toISOString(), status: "Active" }
  ];

  // Seed Quality Inspections database
  state.hkInspections = JSON.parse(localStorage.getItem('saronil_hk_inspections')) || [
    { id: "INSP-501", area: "IPD Wards", date: new Date().toISOString().slice(0, 10), shift: "Morning", inspector: "Manager Satish", score: 4.8, threshold: 3.5, remarks: "Excellent cleanliness maintained." },
    { id: "INSP-502", area: "OPD Waiting Area", date: new Date().toISOString().slice(0, 10), shift: "Morning", inspector: "Manager Satish", score: 2.8, threshold: 3.5, remarks: "Dust on chairs. Cleanliness scores breached threshold.", rootCause: "Lack of cleaning consumables in OPD closet." }
  ];

  localStorage.setItem('saronil_hk_sla_settings', JSON.stringify(state.hkSlaSettings));
  localStorage.setItem('saronil_hk_staff', JSON.stringify(state.hkStaffList));
  localStorage.setItem('saronil_hk_audit_logs', JSON.stringify(state.hkAuditLogs));
  localStorage.setItem('saronil_housekeeping_tasks', JSON.stringify(state.housekeepingTasks));
  localStorage.setItem('saronil_bedsStatus', JSON.stringify(state.bedsStatus));
  localStorage.setItem('saronil_laundry_linen_stock', JSON.stringify(state.laundryLinenStock));
  localStorage.setItem('saronil_laundry_batches', JSON.stringify(state.laundryBatches));
  localStorage.setItem('saronil_cssd_inventory', JSON.stringify(state.cssdInventory));
  localStorage.setItem('saronil_cssd_active_loads', JSON.stringify(state.cssdActiveLoads));
  localStorage.setItem('saronil_bmw_manifests', JSON.stringify(state.bmwManifests));
  localStorage.setItem('saronil_bmw_bags', JSON.stringify(state.bmwBags));
  localStorage.setItem('saronil_laundry_dept_stock', JSON.stringify(state.laundryDeptStock));
  localStorage.setItem('saronil_laundry_vendor_overdue', JSON.stringify(state.laundryVendorOverdue));
  localStorage.setItem('saronil_cssd_active_sterilizations', JSON.stringify(state.cssdActiveSterilizations));
  localStorage.setItem('saronil_cssd_overdue_returns_alert', JSON.stringify(state.cssdOverdueReturnsAlert));
  localStorage.setItem('saronil_bmw_vendor_overdue', JSON.stringify(state.bmwVendorOverdue));
  localStorage.setItem('saronil_bmw_manifest_submissions', JSON.stringify(state.bmwManifestSubmissions));
  localStorage.setItem('saronil_hk_schedules', JSON.stringify(state.hkSchedules));
  localStorage.setItem('saronil_hk_inspections', JSON.stringify(state.hkInspections));

  window.state = state;

/* ==========================================================================
   CENTRALIZED PATIENT TIMELINE LOGGER
   Call from ANY module:
     window.logPatientTimeline(uhid, { icon, title, desc, type })
   ========================================================================== */
window.logPatientTimeline = function(uhid, event) {
  if (!uhid || !event) return;
  const st = window.state || state;
  if (!st || !st.patients) return;
  const pat = st.patients.find(p => p.uhid === uhid);
  if (!pat) return;
  pat.timelineEvents = pat.timelineEvents || [];
  pat.timelineEvents.unshift({
    date: new Date().toISOString(),
    type: event.type || 'general',
    icon: event.icon || '📌',
    title: event.title || 'Activity',
    desc: event.desc || ''
  });
  // Persist immediately so timeline survives page refresh
  try { localStorage.setItem('saronil_patients', JSON.stringify(st.patients)); } catch(e) {}
};

