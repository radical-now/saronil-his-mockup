/* ==========================================================================
   SARONIL HMS - CENTRAL SHARED STATE ENGINE (state.js)
   ========================================================================== */

const DOCTORS_DATABASE = [
  { id: "DOC01", name: "Dr. Abhishek Kumar", spec: "Cardiology", room: "101", phone: "+91 98450 11022", status: "Active" },
  { id: "DOC02", name: "Dr. Sunita Sharma", spec: "Cardiology", room: "102", phone: "+91 98450 11023", status: "Active" },
  { id: "DOC03", name: "Dr. Amit Patel", spec: "Pediatrics", room: "103", phone: "+91 98450 11024", status: "Active" },
  { id: "DOC04", name: "Dr. Mamta Kumari", spec: "Pediatrics", room: "104", phone: "+91 98450 11025", status: "Active" },
  { id: "DOC05", name: "Dr. Rajesh Singh", spec: "General Medicine", room: "105", phone: "+91 98450 11026", status: "Active" },
  { id: "DOC06", name: "Dr. Devanti Devi", spec: "General Medicine", room: "106", phone: "+91 98450 11027", status: "Active" },
  { id: "DOC07", name: "Dr. Munna Kumar", spec: "Orthopedics", room: "107", phone: "+91 98450 11028", status: "Active" },
  { id: "DOC08", name: "Dr. Sarah Jenkins", spec: "Orthopedics", room: "108", phone: "+91 98450 11029", status: "Active" },
  { id: "DOC09", name: "Dr. Arvind Prasad", spec: "Gynecology & Obs", room: "109", phone: "+91 98450 11030", status: "Active" },
  { id: "DOC10", name: "Dr. Neha Gupta", spec: "Gynecology & Obs", room: "110", phone: "+91 98450 11031", status: "Active" },
  { id: "DOC11", name: "Dr. Ajay Kumar", spec: "Neurology", room: "201", phone: "+91 98450 11032", status: "Active" },
  { id: "DOC12", name: "Dr. Prabal Roy", spec: "Neurology", room: "202", phone: "+91 98450 11033", status: "Active" },
  { id: "DOC13", name: "Dr. Shrawan Kumar", spec: "Oncology", room: "203", phone: "+91 98450 11034", status: "Active" },
  { id: "DOC14", name: "Dr. Anamika Sen", spec: "Oncology", room: "204", phone: "+91 98450 11035", status: "Active" },
  { id: "DOC15", name: "Dr. Mukesh Kumar", spec: "Gastroenterology", room: "205", phone: "+91 98450 11036", status: "Active" },
  { id: "DOC16", name: "Dr. Amrita Rai", spec: "Gastroenterology", room: "206", phone: "+91 98450 11037", status: "Active" },
  { id: "DOC17", name: "Dr. Rakesh Singh", spec: "IVF & Fertility", room: "207", phone: "+91 98450 11038", status: "Active" },
  { id: "DOC18", name: "Dr. Vijay Pipil", spec: "Dermatology", room: "208", phone: "+91 98450 11039", status: "Active" },
  { id: "DOC19", name: "Dr. Anil Gargi", spec: "Emergency Medicine", room: "ER-01", phone: "+91 98450 11040", status: "Active" },
  { id: "DOC20", name: "Dr. Sanni Yadav", spec: "Emergency Medicine", room: "ER-02", phone: "+91 98450 11041", status: "Active" },
  { id: "DOC21", name: "Dr. Ramesh Kumar", spec: "General Medicine", room: "111", phone: "+91 98450 11042", status: "Active" },
  { id: "DOC22", name: "Dr. Sunita Pandey", spec: "Cardiology", room: "112", phone: "+91 98450 11043", status: "Active" },
  { id: "DOC23", name: "Dr. Vikram Seth", spec: "Emergency Medicine", room: "ER-03", phone: "+91 98450 11044", status: "Active" },
  { id: "DOC24", name: "Dr. Ananya Reddy", spec: "Pediatrics", room: "113", phone: "+91 98450 11045", status: "Active" },
  { id: "DOC25", name: "Dr. Ritu S.", spec: "Psychiatry", room: "114", phone: "+91 98450 11046", status: "Active" },
  { id: "DOC26", name: "Dr. Sunita P.", spec: "General Surgery", room: "115", phone: "+91 98450 11047", status: "Active" },
  { id: "DOC27", name: "Dr. Vikram S.", spec: "General Medicine", room: "116", phone: "+91 98450 11048", status: "Active" },
  { id: "DOC28", name: "Dr. Ananya R.", spec: "Neurology", room: "117", phone: "+91 98450 11049", status: "Active" },
  { id: "DOC29", name: "Dr. Priyanka Sen", spec: "Gynecology & Obs", room: "209", phone: "+91 98450 11050", status: "Active" },
  { id: "DOC30", name: "Dr. Shalini Mukhopadhyay", spec: "Gynecology & Obs", room: "210", phone: "+91 98450 11051", status: "Active" },
  { id: "DOC31", name: "Dr. Preeti Reddy", spec: "Gynecology & Obs", room: "211", phone: "+91 98450 11052", status: "Active" },
  { id: "DOC32", name: "Dr. Meenakshi Iyer", spec: "Gynecology & Obs", room: "212", phone: "+91 98450 11053", status: "Active" },
  { id: "DOC33", name: "Dr. Kavita Deshmukh", spec: "Gynecology & Obs", room: "213", phone: "+91 98450 11054", status: "Active" },
  { id: "DOC34", name: "Dr. Reeta Verma", spec: "Gynecology & Obs", room: "214", phone: "+91 98450 11055", status: "Active" }
];

const state = {
  // 1. Doctors Database (20+ Specialists)
  doctors: DOCTORS_DATABASE,

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

  // 6. Universal Clinical Orders
  orders: [],

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

  // 11. CSSD sterilization logs
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
// STATE SEED ENGINE (Generates 50+ Patients & Logs)
// --------------------------------------------------------------------------
function seedState() {
  // Initialize all beds as available
  for (const [wardKey, wardInfo] of Object.entries(state.wards)) {
    for (const bed of wardInfo.beds) {
      state.bedsStatus[bed] = {
        wardKey: wardKey,
        status: "Available", // Available, Reserved, Occupied, Vacated - Pending Housekeeping, Housekeeping In Progress, Maintenance Required, Out of Service / Blocked, Isolation Cleaning Required
        patientUhid: null,
        notes: ""
      };
    }
  }

  // 50+ Realistic Indian Names (categorized by gender for accurate demographics)
  const maleNames = [
    "Rajesh Chandra", "Amit Sharma", "Sanjay Verma", "Vijay Kumar", "Rohan Gupta",
    "Abhishek Singh", "Munna Yadav", "Sunil Malhotra", "Anil Saxena", "Ram Avatar",
    "Ganga Prasad", "Suresh Iyer", "Dilip Menon", "Vikram Rathore", "Karan Johar",
    "Ashok Singhal", "Surendra Pal", "Bheem Prasad", "Arvind Kejriwal", "Prabal Sen",
    "Ajay Jadeja", "Mukesh Ambani", "Ranjan Gogoi", "Shrawan Joshi", "Harish Salve",
    "Narendra Modi", "Rahul Gandhi", "Akhilesh Yadav", "Tejashwi Prasad", "Nitish Kumar",
    "Sushil Modi", "Manoj Tiwari", "Khesari Lal", "Pawan Singh", "Ravi Kishan"
  ];

  const femaleNames = [
    "Sunita Chandra", "Mamta Sharma", "Devanti Devi", "Anita Patel", "Pooja Hegde",
    "Kavita Krishnamurthy", "Rakhi Sawant", "Seema Singh", "Gelo Devi", "Satma Begum",
    "Sita Kumari", "Meera Bai", "Priya Ranjan", "Kiran Mazumdar", "Sudha Murthy",
    "Aishwarya Rai", "Priyanka Chopra", "Deepika Padukone", "Alia Bhatt", "Shraddha Kapoor",
    "Krina Kapoor", "Komal Pandey", "Sushmita Sen", "Lata Mangeshkar", "Asha Bhosle",
    "Shreya Ghoshal", "Neeti Mohan", "Kanika Kapoor", "Sunidhi Chauhan", "Neha Kakkar"
  ];

  const surNames = [
    "Sharma", "Kumar", "Singh", "Prasad", "Gupta", "Verma", "Yadav", "Patel",
    "Menon", "Iyer", "Sen", "Joshi", "Das", "Roy", "Banerjee", "Chatterjee",
    "Reddy", "Nair", "Tripathi", "Dubey", "Mishra", "Pandey", "Choudhary"
  ];

  const cities = ["Bengaluru", "Patna", "Delhi", "Mumbai", "Pune", "Hyderabad", "Kolkata", "Chennai", "Ahmedabad", "Lucknow"];
  const bloodGroups = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];
  const payers = [
    { type: "Direct", name: "Cash Tariff", sponsor: "Self" },
    { type: "Company", name: "STAR HEALTH AND ALLIED INSURANCE CO. LTD", sponsor: "STAR HEALTH" },
    { type: "Company", name: "NIVA BUPA HEALTH INSURANCE COMPANY LTD", sponsor: "NIVA BUPA" },
    { type: "Company", name: "ICICI LOMBARD GENERAL INSURANCE CO. LTD", sponsor: "ICICI LOMBARD" },
    { type: "Company", name: "CGHS PATNA (Govt)", sponsor: "CGHS" }
  ];

  const chiefComplaints = [
    { text: "Chest pain radiating to left arm with breathlessness", dept: "Cardiology", vitals: { bp: "150/95", hr: 98, temp: 98.4, spo2: 94 } },
    { text: "High grade fever with dry cough and fatigue since 4 days", dept: "General Medicine", vitals: { bp: "120/80", hr: 85, temp: 102.2, spo2: 97 } },
    { text: "Severe abdominal pain in right lower quadrant with nausea", dept: "Gastroenterology", vitals: { bp: "115/75", hr: 90, temp: 99.8, spo2: 99 } },
    { text: "Repeated vomiting and dehydration in child", dept: "Pediatrics", vitals: { bp: "90/60", hr: 110, temp: 101.1, spo2: 98 } },
    { text: "Trauma to right ankle with swelling and inability to bear weight", dept: "Orthopedics", vitals: { bp: "130/80", hr: 88, temp: 98.6, spo2: 99 } },
    { text: "Lower back pain radiating down to right leg (Sciatica)", dept: "Neurology", vitals: { bp: "120/78", hr: 74, temp: 98.2, spo2: 99 } }
  ];

  // Generate 0 Patients (disabled in favor of precise 300 patients generation)
  for (let i = 1; i <= 0; i++) {
    const isMale = Math.random() > 0.45;
    const name = isMale 
      ? maleNames[i % maleNames.length] + " " + surNames[(i * 3) % surNames.length]
      : femaleNames[i % femaleNames.length] + " " + surNames[(i * 7) % surNames.length];
    
    const age = 5 + (i * 13) % 80;
    const gender = isMale ? "Male" : "Female";
    const uhid = "UHID" + String(20000000 + i);
    const abha = String(910000000000 + i * 1478).match(/.{1,4}/g).join("-"); // 12-digit mock ABHA format
    const phone = "+91 9" + String(87442371 + i * 2947);
    const city = cities[i % cities.length];
    const address = `Block-${String.fromCharCode(65 + (i % 6))}, House No. ${10 + i}, HSR Layout, ${city}`;
    const bloodGroup = bloodGroups[i % bloodGroups.length];
    const payerObj = payers[i % payers.length];
    
    // Assign primary doctor based on specialization, route age < 12 to Pediatrics
    const complaint = chiefComplaints[i % chiefComplaints.length];
    let doctor;
    if (age < 12) {
      const pedsDocs = state.doctors.filter(d => d.spec === 'Pediatrics');
      doctor = pedsDocs.length > 0 ? pedsDocs[i % pedsDocs.length] : state.doctors.find(d => d.spec === 'Pediatrics') || state.doctors[0];
    } else {
      const matchingDocs = state.doctors.filter(d => d.spec === complaint.dept && d.spec !== 'Pediatrics');
      doctor = matchingDocs.length > 0 ? matchingDocs[i % matchingDocs.length] : state.doctors[0];
    }

    const patient = {
      uhid: uhid,
      abhaId: abha,
      aadhaar: "34567890" + String(1000 + i),
      passport: "L" + String(7000000 + i),
      insuranceId: "POL" + String(800000 + i),
      name: name,
      age: age,
      gender: gender,
      mobile: phone,
      address: address,
      bloodGroup: bloodGroup,
      allergies: i % 7 === 0 ? "Penicillin, Dust" : (i % 9 === 0 ? "Sulfa drugs, Peanuts" : "No Known Allergies"),
      pregnancyStatus: (gender === 'Female' && age >= 18 && age <= 40 && i % 3 === 0) ? 'Pregnant' : ((gender === 'Female' && age >= 18 && age <= 40 && i % 5 === 0) ? 'Lactating' : 'Not Pregnant'),
      egfr: 15 + (i * 17) % 95, // ranges from 15 to 110
      liverFunction: i % 11 === 0 ? "Impaired" : "Normal",
      emergencyContact: {
        name: isMale ? "Mrs. " + name.split(' ')[0] + " " + name.split(' ')[1] : "Mr. Kumar",
        relation: isMale ? "Spouse" : "Father",
        phone: "+91 9" + String(78564564 + i * 1928)
      },
      payer: payerObj.name,
      payerType: payerObj.type,
      sponsor: payerObj.sponsor,
      primaryConsultant: doctor.name,
      department: doctor.spec,
      status: i <= 15 ? "Admitted" : (i <= 25 ? "Checked In" : "Registered"),
      vitals: {
        bp: complaint.vitals.bp,
        hr: complaint.vitals.hr,
        temp: complaint.vitals.temp,
        spo2: complaint.vitals.spo2,
        weight: 12 + (i * 7) % 85,
        bmi: 18 + (i * 2) % 12
      },
      clinicalData: {
        complaint: complaint.text,
        hpi: `Patient presents with chief complaint of ${complaint.text.toLowerCase()}. Symptoms developed gradually over the last 3 days. No history of similar complaints. Appetite is normal. Sleep is disturbed due to discomfort.`,
        examination: "General physical condition is stable. Pulse is regular. No signs of pallor, icterus, or cyanosis. Chest is clear bilaterally. Abdomen is soft on palpation.",
        diagnosis: complaint.dept === "Cardiology" ? "Essential Hypertension (I10)" : "Acute Febrile Illness (A09.9)",
        treatmentPlan: "Rest, high fluid intake, and medication as prescribed. Re-evaluate after 48 hours. Monitor vitals twice daily.",
        carePlan: "Follow low sodium diet. Daily walking for 30 minutes. Monitor blood pressure charts."
      },
      prescriptions: [
        { drug: "Paracetamol 650mg (Dolo)", dose: "1 tab", freq: "Thrice daily (TID)", duration: "3 Days", instruction: "Post food when fever > 100 F" },
        { drug: "Pantoprazole 40mg (Pan-D)", dose: "1 cap", freq: "Once daily (OD)", duration: "5 Days", instruction: "Empty stomach in morning" }
      ],
      history: {
        pastConditions: i % 10 === 0 ? "Diabetes Mellitus Type-2" : (i % 12 === 0 ? "Hypothyroidism" : "None"),
        surgeries: i % 15 === 0 ? "Appendectomy (2021)" : "None",
        familyHistory: i % 8 === 0 ? "Father has Hypertension" : "No history of hereditary diseases"
      }
    };

    state.patients.push(patient);

    // If patient status is "Checked In", seed an OPD appointment
    if (patient.status === "Checked In") {
      state.appointments.push({
        id: "APT" + String(1000 + i),
        uhid: patient.uhid,
        patientName: patient.name,
        doctorName: doctor.name,
        spec: doctor.spec,
        date: "2026-06-17",
        time: `09:${String(10 + i * 3).padStart(2, '0')} AM`,
        status: i % 3 === 0 ? "Confirmed" : "Checked In",
        type: "Consultation"
      });
    }

    // If patient status is "Admitted", assign to a bed
    if (patient.status === "Admitted") {
      const wardKeys = Object.keys(state.wards).filter(k => k !== "EMERGENCY");
      const targetWardKey = wardKeys[i % wardKeys.length];
      const wardInfo = state.wards[targetWardKey];
      // Find an available bed in the ward
      let assignedBed = null;
      for (const bed of wardInfo.beds) {
        if (state.bedsStatus[bed].status === "Available") {
          assignedBed = bed;
          break;
        }
      }

      if (assignedBed) {
        state.bedsStatus[assignedBed] = {
          wardKey: targetWardKey,
          status: "Occupied",
          patientUhid: patient.uhid,
          notes: `Admitted under ${doctor.name} for ${patient.clinicalData.diagnosis}`
        };

        state.admissions.push({
          id: "ADM" + String(5000 + i),
          uhid: patient.uhid,
          patientName: patient.name,
          date: "2026-06-16",
          ward: targetWardKey,
          bed: assignedBed,
          doctorName: doctor.name,
          diagnosis: patient.clinicalData.diagnosis,
          status: "Active"
        });

        // Seed some billing records for admitted patients
        state.billing.push({
          id: "INV" + String(8000 + i),
          uhid: patient.uhid,
          patientName: patient.name,
          date: "2026-06-17",
          amount: 12500 + (i * 1500),
          paid: 5000,
          status: "Outstanding",
          items: [
            { desc: "Room Rent / Bed Charges (" + wardInfo.name + ")", qty: 1, rate: wardInfo.price, total: wardInfo.price },
            { desc: "Clinical Consultation Fee", qty: 2, rate: 800, total: 1600 },
            { desc: "Nursing Administration Charges", qty: 1, rate: 1500, total: 1500 }
          ]
        });

        // Seed some claims if insured
        if (patient.payerType === "Company") {
          state.claims.push({
            id: "CLM" + String(9000 + i),
            uhid: patient.uhid,
            patientName: patient.name,
            insurer: patient.payer,
            estimatedAmt: 15000 + (i * 2000),
            approvedAmt: i % 4 === 0 ? 0 : 12000 + (i * 1500),
            status: i % 4 === 0 ? "Pending" : "Approved",
            preAuthNo: i % 4 === 0 ? "" : "AUTH" + String(70000 + i)
          });
        }
      } else {
        // Fallback to OPD status if ward is full
        patient.status = "Checked In";
      }
    }
  }


  // Seed Blood Bank Donors
  const donorNames = ["Vinay Rawat", "Sandeep Mishra", "Gautam Gambhir", "Ishant Sharma", "Deepak Chahar"];
  for (let k = 0; k < donorNames.length; k++) {
    state.bloodDonors.push({
      id: "DNR" + String(4000 + k),
      name: donorNames[k],
      gender: "Male",
      age: 24 + k * 3,
      bloodGroup: bloodGroups[k % bloodGroups.length],
      donationDate: "2026-06-15",
      fitStatus: "Fit",
      screening: "Non-Reactive"
    });
  }

  // Seed validation rules library
  state.validationRules = [
    { id: "RULE01", name: "Drug-Allergy Conflict Check", category: "Clinical", severity: "Critical Safety Alert", trigger: "Prescription", dept: "Clinical EMR", status: "Active", version: "1.2.0" },
    { id: "RULE02", name: "ABO Blood Compatibility", category: "Blood Bank", severity: "Hard Stop", trigger: "Transfusion Issue", dept: "Blood Bank", status: "Active", version: "2.0.1" },
    { id: "RULE03", name: "Duplicate Patient Detection", category: "Registration", severity: "Warning", trigger: "Demographic Entry", dept: "Registration", status: "Active", version: "1.0.4" },
    { id: "RULE04", name: "NEWS2 Sepsis Warning", category: "Vitals", severity: "Critical Safety Alert", trigger: "Vitals Entry", dept: "Nursing", status: "Active", version: "1.1.2" },
    { id: "RULE05", name: "Drug-Drug Interaction Check", category: "Pharmacy", severity: "Hard Stop", trigger: "Dispensing", dept: "Pharmacy", status: "Active", version: "2.1.0" },
    { id: "RULE06", name: "Surgical Checklist Timeout Validation", category: "OT/Surgery", severity: "Hard Stop", trigger: "Incision Clear", dept: "Surgery", status: "Active", version: "1.0.0" },
    { id: "RULE07", name: "Bed Housekeeping Safety Constraint", category: "ATD", severity: "Hard Stop", trigger: "Bed Status Update", dept: "Admissions Desk", status: "Active", version: "1.0.0" }
  ];

  // Seed active alert center log
  state.alerts = [
    { id: "ALT101", severity: "Critical Safety Alert", source: "Clinical EMR", patientName: "Ramesh Chandra", uhid: "UHID20000001", details: "Penicillin allergy conflict detected during prescription.", clinician: "Dr. Abhishek Kumar", time: "2026-06-17 10:15 AM", status: "Active", eStatus: "Escalated" },
    { id: "ALT102", severity: "Warning", source: "Registration", patientName: "Amit Patel", uhid: "UHID20000004", details: "Duplicate registration warning: matches Aadhaar with existing record.", clinician: "Front Desk Staff", time: "2026-06-17 11:30 AM", status: "Active", eStatus: "Open" },
    { id: "ALT103", severity: "Information", source: "Diagnostics", patientName: "Sunita Chandra", uhid: "UHID20000002", details: "CBC Laboratory report validated and ready.", clinician: "Pathologist Admin", time: "2026-06-17 12:05 PM", status: "Resolved", eStatus: "Resolved" }
  ];

  state.tokens = [
    { tokenNo: "REG-001", uhid: "UHID20000001", patientName: "Ramesh Chandra", department: "Cardiology", doctor: "Dr. Amit Verma", time: "09:15 AM", status: "Completed", queuePos: "-" },
    { tokenNo: "REG-002", uhid: "UHID20000002", patientName: "Sunita Chandra", department: "Pediatrics", doctor: "Dr. Sunita", time: "09:30 AM", status: "Completed", queuePos: "-" },
    { tokenNo: "REG-003", uhid: "UHID20000003", patientName: "Priya Sharma", department: "General Medicine", doctor: "Dr. Rajesh", time: "10:00 AM", status: "Completed", queuePos: "-" },
    { tokenNo: "REG-004", uhid: "UHID20000004", patientName: "Amit Patel", department: "Orthopedics", doctor: "Dr. Vikram", time: "10:15 AM", status: "Waiting", queuePos: "1", estWait: "12 mins" },
    { tokenNo: "REG-005", uhid: "UHID20000005", patientName: "Sanjay Dutta", department: "General Medicine", doctor: "Dr. Rajesh", time: "10:30 AM", status: "Waiting", queuePos: "2", estWait: "25 mins" }
  ];

  state.printHistory = [
    { id: "PRN1001", patientName: "Ramesh Chandra", uhid: "UHID20000001", type: "Wristband", copies: 1, printer: "Thermal Printer A", time: "2026-06-17 09:10 AM" },
    { id: "PRN1002", patientName: "Ramesh Chandra", uhid: "UHID20000001", type: "Registration Sticker", copies: 2, printer: "Label Printer B", time: "2026-06-17 09:12 AM" },
    { id: "PRN1003", patientName: "Sunita Chandra", uhid: "UHID20000002", type: "Laboratory Sticker", copies: 3, printer: "Lab Printer C", time: "2026-06-17 09:35 AM" }
  ];

  state.auditLogs = state.auditLogs || [];
  
  // Seed custom patients for Recent Registrations
  // Seed custom patients for Recent Registrations matching dashboard mockup
  const customPatients = [
    {
      uhid: "MRC-240001",
      abhaId: "9100-2400-0001",
      aadhaar: "345678900001",
      passport: "L7000001",
      insuranceId: "POL800001",
      name: "Rajesh Kumar",
      age: 45,
      gender: "Male",
      type: "IPD",
      mobile: "+91 98765 43210",
      email: "rajesh@email.com",
      address: "HSR Layout, Bengaluru",
      bloodGroup: "B+",
      allergies: "No Known Allergies",
      pregnancyStatus: "Not Pregnant",
      egfr: 90,
      liverFunction: "Normal",
      emergencyContact: { name: "Relative", relation: "Sibling", phone: "+91 9999999900" },
      payer: "STAR HEALTH AND ALLIED INSURANCE CO. LTD",
      payerType: "Company",
      sponsor: "STAR HEALTH",
      primaryConsultant: "Dr. Ramesh Kumar",
      department: "Cardiology",
      status: "Admitted",
      vitals: { bp: "120/80", hr: 72, temp: 98.6, spo2: 98, weight: 60, bmi: 22 },
      clinicalData: { complaint: "General weakness", hpi: "Presents with mild fatigue.", examination: "NAD", diagnosis: "None", treatmentPlan: "NAD", carePlan: "NAD" },
      prescriptions: [],
      history: { pastConditions: "None", surgeries: "None", familyHistory: "None" },
      ward: "Ward A",
      bed: "Bed A-204",
      insurance: { provider: "Star Health", plan: "Pre-auth approved" },
      alerts: ["Critical", "Pending labs"],
      lastActivity: "10:15 AM"
    },
    {
      uhid: "MRC-240002",
      abhaId: "9100-2400-0002",
      aadhaar: "345678900002",
      passport: "L7000002",
      insuranceId: "POL800002",
      name: "Priya Sharma",
      age: 32,
      gender: "Female",
      type: "OPD",
      mobile: "+91 91234 56789",
      email: "priya@email.com",
      address: "Indiranagar, Bengaluru",
      bloodGroup: "O+",
      allergies: "No Known Allergies",
      pregnancyStatus: "Not Pregnant",
      egfr: 92,
      liverFunction: "Normal",
      emergencyContact: { name: "Relative", relation: "Sibling", phone: "+91 9999999900" },
      payer: "United India Insurance Co",
      payerType: "Company",
      sponsor: "United India",
      primaryConsultant: "Dr. Ritu S.",
      department: "Psychiatry",
      status: "Checked In",
      vitals: { bp: "118/78", hr: 70, temp: 98.4, spo2: 99, weight: 58, bmi: 21 },
      clinicalData: { complaint: "Anxiety", hpi: "Presents with mild anxiety symptoms.", examination: "NAD", diagnosis: "None", treatmentPlan: "NAD", carePlan: "NAD" },
      prescriptions: [],
      history: { pastConditions: "None", surgeries: "None", familyHistory: "None" },
      ward: "—",
      bed: "—",
      insurance: { provider: "United India", plan: "OPD plan" },
      alerts: ["Follow-up due"],
      lastActivity: "09:30 AM"
    },
    {
      uhid: "MRC-240019",
      abhaId: "9100-2400-0019",
      aadhaar: "345678900019",
      passport: "L7000019",
      insuranceId: "POL800019",
      name: "Kavitha Nair",
      age: 44,
      gender: "Female",
      type: "Emergency",
      mobile: "+91 87654 32109",
      email: "kavitha@email.com",
      address: "Koramangala, Bengaluru",
      bloodGroup: "AB+",
      allergies: "No Known Allergies",
      pregnancyStatus: "Not Pregnant",
      egfr: 95,
      liverFunction: "Normal",
      emergencyContact: { name: "Relative", relation: "Sibling", phone: "+91 9999999900" },
      payer: "Cash Tariff",
      payerType: "Direct",
      sponsor: "Self",
      primaryConsultant: "Dr. Vikram S.",
      department: "General Medicine",
      status: "Emergency",
      vitals: { bp: "110/70", hr: 85, temp: 101.2, spo2: 97, weight: 65, bmi: 23 },
      clinicalData: { complaint: "High grade fever", hpi: "Brought to ER with fever.", examination: "NAD", diagnosis: "Acute Febrile Illness", treatmentPlan: "IV fluids", carePlan: "Cold sponging" },
      prescriptions: [],
      history: { pastConditions: "None", surgeries: "None", familyHistory: "None" },
      ward: "Emergency Bay",
      bed: "Resus-1",
      insurance: { provider: "Cash", plan: "" },
      alerts: ["MLC Case", "Pending labs"],
      lastActivity: "08:47 AM"
    },
    {
      uhid: "MRC-240020",
      abhaId: "9100-2400-0020",
      aadhaar: "345678900020",
      passport: "L7000020",
      insuranceId: "POL800020",
      name: "Arjun Mehta",
      age: 58,
      gender: "Male",
      type: "IPD",
      mobile: "+91 70123 45678",
      email: "arjun@email.com",
      address: "Whitefield, Bengaluru",
      bloodGroup: "A+",
      allergies: "No Known Allergies",
      pregnancyStatus: "Not Pregnant",
      egfr: 85,
      liverFunction: "Normal",
      emergencyContact: { name: "Relative", relation: "Sibling", phone: "+91 9999999900" },
      payer: "HDFC ERGO GENERAL INSURANCE CO LTD",
      payerType: "Company",
      sponsor: "HDFC ERGO",
      primaryConsultant: "Dr. Ramesh Kumar",
      department: "Cardiology",
      status: "Discharge pending",
      vitals: { bp: "140/90", hr: 80, temp: 98.6, spo2: 96, weight: 75, bmi: 25 },
      clinicalData: { complaint: "Chest pain", hpi: "Admitted for cardiac observation.", examination: "NAD", diagnosis: "Query Angina", treatmentPlan: "ECG monitoring", carePlan: "Monitor ECG" },
      prescriptions: [],
      history: { pastConditions: "Hypertension", surgeries: "None", familyHistory: "None" },
      ward: "Ward B",
      bed: "Bed B-108",
      insurance: { provider: "HDFC Ergo", plan: "TPA query pending" },
      alerts: ["Discharge pending", "Bill hold"],
      lastActivity: "Yesterday"
    },
    {
      uhid: "MRC-240017",
      abhaId: "9100-2400-0017",
      aadhaar: "345678900017",
      passport: "L7000017",
      insuranceId: "POL800017",
      name: "Meena Iyer",
      age: 29,
      gender: "Female",
      type: "IPD",
      mobile: "+91 99887 76655",
      email: "meena@email.com",
      address: "Jayanagar, Bengaluru",
      bloodGroup: "O-",
      allergies: "No Known Allergies",
      pregnancyStatus: "Not Pregnant",
      egfr: 99,
      liverFunction: "Normal",
      emergencyContact: { name: "Relative", relation: "Sibling", phone: "+91 9999999900" },
      payer: "Cash Tariff",
      payerType: "Direct",
      sponsor: "Self",
      primaryConsultant: "Dr. Ananya R.",
      department: "Neurology",
      status: "Admitted",
      vitals: { bp: "115/75", hr: 70, temp: 98.6, spo2: 99, weight: 55, bmi: 21 },
      clinicalData: { complaint: "Headache", hpi: "Presents with severe migraine.", examination: "NAD", diagnosis: "Migraine", treatmentPlan: "Symptomatic treatment", carePlan: "Rest" },
      prescriptions: [],
      history: { pastConditions: "None", surgeries: "None", familyHistory: "None" },
      ward: "Ward A",
      bed: "Bed A-201",
      insurance: { provider: "Cash", plan: "" },
      alerts: ["No alerts"],
      lastActivity: "11:00 AM"
    },
    {
      uhid: "MRC-240018",
      abhaId: "9100-2400-0018",
      aadhaar: "345678900018",
      passport: "L7000018",
      insuranceId: "POL800018",
      name: "Suresh Patel",
      age: 67,
      gender: "Male",
      type: "Daycare",
      mobile: "+91 77665 54433",
      email: "suresh@email.com",
      address: "Malleshwaram, Bengaluru",
      bloodGroup: "O+",
      allergies: "No Known Allergies",
      pregnancyStatus: "Not Pregnant",
      egfr: 78,
      liverFunction: "Normal",
      emergencyContact: { name: "Relative", relation: "Sibling", phone: "+91 9999999900" },
      payer: "NEW INDIA ASSURANCE CO LTD",
      payerType: "Company",
      sponsor: "NEW INDIA",
      primaryConsultant: "Dr. Sunita P.",
      department: "General Surgery",
      status: "Day Care",
      vitals: { bp: "130/80", hr: 75, temp: 98.4, spo2: 98, weight: 70, bmi: 24 },
      clinicalData: { complaint: "Knee pain", hpi: "Advised daycare arthroscopy.", examination: "NAD", diagnosis: "Osteoarthritis", treatmentPlan: "Arthroscopy", carePlan: "Post-op care" },
      prescriptions: [],
      history: { pastConditions: "None", surgeries: "None", familyHistory: "None" },
      ward: "Day Care Unit",
      bed: "DC-03",
      insurance: { provider: "New India", plan: "Cashless active" },
      alerts: ["Pre-op done"],
      lastActivity: "07:30 AM"
    },
    {
      uhid: "MRC-239876",
      abhaId: "9100-2398-7600",
      aadhaar: "345678907600",
      passport: "L7007600",
      insuranceId: "POL8007600",
      name: "Meena Pillai",
      age: 54,
      gender: "Female",
      type: "OPD",
      mobile: "+91 80990 11223",
      email: "meenap@email.com",
      address: "Whitefield, Bengaluru",
      bloodGroup: "B-",
      allergies: "No Known Allergies",
      pregnancyStatus: "Not Pregnant",
      egfr: 88,
      liverFunction: "Normal",
      emergencyContact: { name: "Relative", relation: "Sibling", phone: "+91 9999999900" },
      payer: "Cash Tariff",
      payerType: "Direct",
      sponsor: "Self",
      primaryConsultant: "Dr. Ritu S.",
      department: "Psychiatry",
      status: "Scheduled",
      vitals: { bp: "122/82", hr: 74, temp: 98.6, spo2: 98, weight: 62, bmi: 22 },
      clinicalData: { complaint: "Insomnia", hpi: "Presents with chronic sleep issues.", examination: "NAD", diagnosis: "Insomnia", treatmentPlan: "Sleep hygiene counseling", carePlan: "Counseling" },
      prescriptions: [],
      history: { pastConditions: "None", surgeries: "None", familyHistory: "None" },
      ward: "—",
      bed: "—",
      insurance: { provider: "Cash", plan: "" },
      alerts: ["Appt: 2:00 PM"],
      lastActivity: "14:00 today"
    }
  ];

  // Programmatically generate 293 custom patients to make it exactly 300 total (MH-2026-4802 to MH-2026-5094)
  const surNamesGen = ["Sharma", "Patel", "Nair", "Mehta", "Iyer", "Patil", "Desai", "Joshi", "Kulkarni", "Rao", "Gupta", "Sen", "Bose", "Das", "Roy", "Singh", "Kumar", "Prasad"];
  const femaleNamesGen = ["Priya", "Sunita", "Anjali", "Pooja", "Deepika", "Komal", "Asha", "Sneha", "Geeta", "Neeti", "Mamta", "Lata", "Kiran", "Rekha", "Hema", "Jaya", "Sushma", "Vidya"];
  const maleNamesGen = ["Rajesh", "Vijay", "Rohan", "Sanjay", "Amit", "Bheem", "Harish", "Sachin", "Sourav", "Rahul", "VVS", "MS", "Virat", "Rohit", "Shikhar", "Hardik", "KL", "Rishabh", "Jasprit", "Ravindra"];
  const docsGen = [
    { name: "Dr. Amit Verma", dept: "Pediatrics" },
    ...DOCTORS_DATABASE.map(d => ({ name: d.name, dept: d.spec }))
  ];

  // We need to generate:
  // - 21 IPD patients (type: "IPD", status: "Admitted")
  // - 19 OPD Scheduled patients (type: "OPD", status: "Scheduled")
  // - 57 OPD Checked In patients (type: "OPD", status: "Checked In")
  // - 1 Emergency patient (type: "Emergency", status: "Emergency")
  // - 3 Day Care patients (type: "Daycare", status: "Day Care")
  // - 192 Discharged patients (status: "Registered", type: "IPD", "Daycare", or "Emergency")
  const targetGeneration = [];
  for (let i = 0; i < 21; i++) targetGeneration.push({ type: "IPD", status: "Admitted" });
  for (let i = 0; i < 19; i++) targetGeneration.push({ type: "OPD", status: "Scheduled" });
  for (let i = 0; i < 57; i++) targetGeneration.push({ type: "OPD", status: "Checked In" });
  for (let i = 0; i < 1; i++) targetGeneration.push({ type: "Emergency", status: "Emergency" });
  for (let i = 0; i < 3; i++) targetGeneration.push({ type: "Daycare", status: "Day Care" });
  for (let i = 0; i < 192; i++) targetGeneration.push({ type: i % 3 === 0 ? "IPD" : (i % 3 === 1 ? "Daycare" : "Emergency"), status: "Registered" });

  for (let idx = 0; idx < targetGeneration.length; idx++) {
    const patIdNum = 4802 + idx;
    const config = targetGeneration[idx];
    const isMale = idx % 2 === 0;
    const name = isMale
      ? maleNamesGen[idx % maleNamesGen.length] + " " + surNamesGen[(idx * 3) % surNamesGen.length]
      : femaleNamesGen[idx % femaleNamesGen.length] + " " + surNamesGen[(idx * 7) % surNamesGen.length];
    
    const age = idx % 8 === 0 ? (idx % 12) : 12 + (idx * 3) % 70;
    const pedsDocs = docsGen.filter(d => d.dept === 'Pediatrics');
    const nonPedsDocs = docsGen.filter(d => d.dept !== 'Pediatrics');
    const docObj = age < 12 
      ? (pedsDocs.length > 0 ? pedsDocs[idx % pedsDocs.length] : docsGen[idx % docsGen.length])
      : (nonPedsDocs.length > 0 ? nonPedsDocs[idx % nonPedsDocs.length] : docsGen[idx % docsGen.length]);
    
    let ward = "—";
    let bed = "—";
    if (config.status === "Admitted" && config.type === "IPD") {
      ward = idx % 2 === 0 ? "Ward A" : "Ward B";
      bed = idx % 2 === 0 ? `Bed A-${210 + idx}` : `Bed B-${110 + idx}`;
    } else if (config.status === "Emergency") {
      ward = "Emergency Bay";
      bed = `Resus-${2 + idx}`;
    } else if (config.status === "Day Care") {
      ward = "Day Care Unit";
      bed = `DC-${10 + idx}`;
    }

    customPatients.push({
      uhid: `MH-2026-${patIdNum}`,
      abhaId: `9100-2026-${patIdNum}`,
      aadhaar: `34567890${patIdNum}`,
      passport: `L700${patIdNum}`,
      insuranceId: `POL800${patIdNum}`,
      name: name,
      age: age,
      gender: isMale ? "Male" : "Female",
      type: config.type,
      mobile: `+91 99999 99${String(800 + idx).substring(0, 3)}`,
      email: `${name.toLowerCase().replace(/\s+/g, '')}@email.com`,
      address: `HSR Layout, Bengaluru`,
      bloodGroup: ["A+", "B+", "O+", "AB+"][idx % 4],
      allergies: "No Known Allergies",
      pregnancyStatus: "Not Pregnant",
      egfr: 90,
      liverFunction: "Normal",
      emergencyContact: { name: "Relative", relation: "Sibling", phone: "+91 9999999900" },
      payer: "Cash Tariff",
      payerType: "Direct",
      sponsor: "Self",
      primaryConsultant: docObj.name,
      department: docObj.dept,
      status: config.status,
      vitals: { bp: "120/80", hr: 75, temp: 98.6, spo2: 98, weight: 65, bmi: 22 },
      clinicalData: { complaint: "Routine Checkup", hpi: "Presents for general consultation.", examination: "NAD", diagnosis: "None", treatmentPlan: "NAD", carePlan: "NAD" },
      prescriptions: [],
      history: { pastConditions: "None", surgeries: "None", familyHistory: "None" },
      ward: ward,
      bed: bed,
      insurance: { provider: "Cash", plan: "" },
      alerts: config.status === "Scheduled" ? ["Appt: 10:00 AM"] : ["No alerts"],
      lastActivity: "09:00 AM",
      dischargedToday: (config.status === "Registered" && idx >= 101 && idx < 105)
    });
  }

  // Change some OPD patients' statuses for demonstration purposes (Completed, Cancelled, No Show)
  let opdCheckedInCount = 0;
  customPatients.forEach(p => {
    if (p.type === 'OPD' && p.status === 'Checked In') {
      opdCheckedInCount++;
      if (opdCheckedInCount <= 5) {
        p.status = 'Completed';
      } else if (opdCheckedInCount <= 8) {
        p.status = 'Cancelled';
      } else if (opdCheckedInCount <= 11) {
        p.status = 'No Show';
      }
    }
  });

  customPatients.forEach(p => {
    state.patients.push(p);

    const isIPDAdmitted = p.status === "Admitted" || p.status === "Discharge pending" || p.status === "Emergency" || p.status === "Day Care";
    if (isIPDAdmitted && p.ward && p.ward !== "—") {
      let wardKey = "GENERAL-WARD-M";
      if (p.ward === "Ward A") {
        wardKey = p.gender === "Female" ? "GENERAL-WARD-F" : "GENERAL-WARD-M";
      } else if (p.ward === "Ward B") {
        wardKey = "SEMI-PRIVATE";
      } else if (p.ward === "Emergency Bay") {
        wardKey = "EMERGENCY";
      } else if (p.ward === "Day Care Unit") {
        wardKey = "DAYCARE";
      }

      let bedId = p.bed === "Bed A-204" ? "GW(M)-412" : 
                  (p.bed === "Bed B-108" ? "SP-301" : 
                  (p.bed === "Bed A-201" ? "GW(F)-414" : 
                  (p.bed === "Resus-1" ? "EMG-01" : 
                  (p.bed === "DC-03" ? "DC-B3" : 
                  (p.bed && p.bed.startsWith("DC-") ? "DC-B" + ((parseInt(p.bed.replace("DC-", "")) - 1) % 10 + 1) : 
                  p.bed)))));

      p.admissionWardKey = wardKey;
      p.admissionBedId = bedId;

      state.admissions.push({
        id: "ADM" + String(5000 + state.admissions.length + 1),
        uhid: p.uhid,
        patientName: p.name,
        doctorName: p.primaryConsultant,
        ward: wardKey,
        bed: bedId,
        date: "2026-06-20",
        status: "Active"
      });
      state.bedsStatus[bedId] = {
        wardKey: wardKey,
        status: "Occupied",
        patientUhid: p.uhid,
        notes: `Admitted under ${p.primaryConsultant}`
      };

      if (wardKey === "DAYCARE") {
        state.daycareAdmissions = state.daycareAdmissions || [];
        // Check if patient is already in daycare admissions to avoid duplicates
        if (!state.daycareAdmissions.some(a => a.patient.uhid === p.uhid)) {
          state.daycareAdmissions.push({
            patient: p,
            bedId: bedId,
            ward: 'Daycare Ward',
            bedNo: bedId,
            consultantName: p.primaryConsultant,
            procedureName: p.clinicalData?.treatmentPlan || 'Minor Procedure',
            admissionType: 'Daycare',
            admissionTimestamp: new Date().toISOString(),
            status: 'Registered',
            historyLogs: [{ timestamp: new Date().toISOString(), action: 'Daycare Bed Allocated & Registered' }],
            tasks: [
              { id: 'vitals-1', name: 'Take Pre-Op Vitals (BP, pulse, SpO2, Temp)', completed: false },
              { id: 'meds-1', name: 'Verify Medication Dose and Frequency', completed: false },
              { id: 'postcheck-1', name: 'Post-procedure Site Assessment', completed: false }
            ]
          });
        }
      }

      // Seed outstanding bill for EMR tests compatibility
      state.billing.push({
        id: "INV" + String(8000 + state.billing.length + 1),
        uhid: p.uhid,
        patientName: p.name,
        date: "2026-06-21",
        amount: 15000,
        paid: 5000,
        status: "Outstanding",
        items: [
          { desc: "Room Rent / Bed Charges", qty: 1, rate: 10000, total: 10000 },
          { desc: "Clinical Fee", qty: 1, rate: 5000, total: 5000 }
        ]
      });
    }

    if (p.type === "OPD") {
      state.appointments.push({
        id: "APT" + String(1100 + state.appointments.length + 1),
        uhid: p.uhid,
        patientName: p.name,
        doctorName: p.primaryConsultant,
        spec: p.department,
        date: "2026-06-22",
        time: p.uhid === "MRC-240002" ? "09:30 AM" : "11:15 AM",
        status: "Scheduled"
      });
    }
  });

  // Seed Laboratory & Radiology orders
  for (let j = 1; j <= 10; j++) {
    const patient = state.patients[j * 3];
    const doctor = state.doctors[j % state.doctors.length];

    state.orders.push({
      id: "ORD" + String(6000 + j),
      uhid: patient.uhid,
      patientName: patient.name,
      doctorName: doctor.name,
      type: j % 2 === 0 ? "Laboratory" : "Radiology",
      name: j % 2 === 0 ? "Complete Blood Count (CBC)" : "Chest X-Ray PA View",
      date: "2026-06-17",
      priority: j % 3 === 0 ? "Urgent" : "Routine",
      status: j % 4 === 0 ? "Approved" : (j % 3 === 0 ? "Result Entered" : "Sample Collected"),
      result: j % 4 === 0 ? "Hemoglobin: 14.2 g/dL (Normal), WBC: 7,500 /uL (Normal)" : ""
    });
  }

  // Seed 7 Gynecology patients & appointments specifically for Dr. Reeta Verma
  const gynPatientsData = [
    {
      name: "Divya Verma",
      age: 26,
      pregnancyStatus: "Pregnant",
      edd: "2026-11-20",
      fhr: "144 bpm",
      menstrualHistory: { lmp: "2026-02-13", cycle: "28 Days", flow: "Regular", dysmenorrhea: "Mild" },
      obstetricHistory: [{ pregnancy: "G2 P1 L1 A0", details: "Prev LSCS (2024), Healthy Baby Boy, 3.1kg", complications: "None" }],
      prescriptions: [
        { drug: "Tab. Folic Acid 5mg", dose: "1 OD", freq: "Daily", duration: "30 Days", instruction: "After breakfast" },
        { drug: "Tab. Iron 100mg", dose: "1 OD", freq: "Daily", duration: "30 Days", instruction: "Before dinner" }
      ],
      prescriptionHistory: [
        { date: "22 May 2026", doctor: "Dr. Reeta Verma", medicines: ["Tab. Folic Acid 5mg OD x 30 days", "Tab. Iron 100mg OD x 30 days"] }
      ],
      files: [
        { name: "Anomaly Scan Report.pdf", size: "2.4 MB", type: "PDF" },
        { name: "First Trimester Scan.pdf", size: "1.8 MB", type: "PDF" }
      ],
      medicalReports: [
        { testName: "Complete Blood Count (CBC)", date: "10 Jun 2026", result: "Hb: 11.2 g/dL (Mildly Low), WBC: 7,200", status: "Completed" },
        { testName: "Urine Routine", date: "10 Jun 2026", result: "Pus cells: 1-2, Sugar: Nil, Albumin: Nil", status: "Completed" }
      ],
      vitalsHistory: [
        { date: "22 Jun 2026", bp: "120/80", wt: "62 kg", hr: "82 bpm", temp: "98.4 F" },
        { date: "15 May 2026", bp: "118/76", wt: "59 kg", hr: "80 bpm", temp: "98.6 F" }
      ],
      investigationsHistory: [
        { name: "Ultrasonography (USG) Obstetric", date: "15 May 2026", result: "Single live intrauterine gestation, 14 weeks. FHR 145 bpm.", status: "Normal" }
      ],
      history: { pastConditions: "Hypothyroidism (controlled)", surgeries: "None", familyHistory: "Mother - Diabetes" }
    },
    {
      name: "Sumitha Rani",
      age: 32,
      pregnancyStatus: "Pregnant",
      edd: "2026-09-10",
      fhr: "150 bpm",
      menstrualHistory: { lmp: "2025-12-04", cycle: "30 Days", flow: "Regular", dysmenorrhea: "None" },
      obstetricHistory: [
        { pregnancy: "G3 P1 L1 A1", details: "Prev Normal Delivery (2020), 2.9kg", complications: "Miscarriage at 8 weeks in 2022" }
      ],
      prescriptions: [
        { drug: "Tab. Iron 100mg", dose: "1 OD", freq: "Daily", duration: "30 Days", instruction: "Before dinner" },
        { drug: "Tab. Calcium 500mg", dose: "1 BD", freq: "Twice daily", duration: "30 Days", instruction: "After meals" }
      ],
      prescriptionHistory: [
        { date: "10 May 2026", doctor: "Dr. Reeta Verma", medicines: ["Tab. Iron 100mg OD", "Tab. Calcium 500mg BD"] }
      ],
      files: [
        { name: "Double Marker Test.pdf", size: "1.2 MB", type: "PDF" }
      ],
      medicalReports: [
        { testName: "TSH Level", date: "05 May 2026", result: "2.4 uIU/mL (Normal)", status: "Completed" }
      ],
      vitalsHistory: [
        { date: "22 Jun 2026", bp: "110/70", wt: "68 kg", hr: "76 bpm", temp: "98.2 F" }
      ],
      investigationsHistory: [
        { name: "Double Marker Test", date: "05 May 2026", result: "Low Risk", status: "Completed" }
      ],
      history: { pastConditions: "None", surgeries: "None", familyHistory: "Father - Hypertension" }
    },
    {
      name: "Rubina",
      age: 28,
      pregnancyStatus: "Pregnant",
      edd: "2027-01-05",
      fhr: "140 bpm",
      menstrualHistory: { lmp: "2026-03-30", cycle: "28 Days", flow: "Heavy", dysmenorrhea: "Severe" },
      obstetricHistory: [],
      prescriptions: [
        { drug: "Tab. Folic Acid 5mg", dose: "1 OD", freq: "Daily", duration: "30 Days", instruction: "After breakfast" }
      ],
      prescriptionHistory: [],
      files: [],
      medicalReports: [
        { testName: "Hemoglobin Estimation", date: "22 Jun 2026", result: "Hb: 10.5 g/dL", status: "Completed" }
      ],
      vitalsHistory: [
        { date: "22 Jun 2026", bp: "115/75", wt: "54 kg", hr: "84 bpm", temp: "98.5 F" }
      ],
      investigationsHistory: [],
      history: { pastConditions: "None", surgeries: "None", familyHistory: "None" }
    },
    {
      name: "Sunita Krishnan",
      age: 35,
      pregnancyStatus: "Not Pregnant",
      edd: null,
      fhr: null,
      menstrualHistory: { lmp: "2026-06-10", cycle: "28 Days", flow: "Regular", dysmenorrhea: "None" },
      obstetricHistory: [{ pregnancy: "G1 P1 L1 A0", details: "Prev normal delivery (2018)", complications: "None" }],
      prescriptions: [],
      prescriptionHistory: [],
      files: [],
      medicalReports: [],
      vitalsHistory: [
        { date: "22 Jun 2026", bp: "130/85", wt: "70 kg", hr: "80 bpm", temp: "98.6 F" }
      ],
      investigationsHistory: [],
      history: { pastConditions: "Mild PCOD", surgeries: "None", familyHistory: "Diabetes both parents" }
    },
    {
      name: "Anjali Deshmukh",
      age: 29,
      pregnancyStatus: "Not Pregnant",
      edd: null,
      fhr: null,
      menstrualHistory: { lmp: "2026-06-02", cycle: "32 Days", flow: "Irregular", dysmenorrhea: "Moderate" },
      obstetricHistory: [],
      prescriptions: [],
      prescriptionHistory: [],
      files: [],
      medicalReports: [],
      vitalsHistory: [
        { date: "22 Jun 2026", bp: "118/76", wt: "61 kg", hr: "72 bpm", temp: "98.4 F" }
      ],
      investigationsHistory: [],
      history: { pastConditions: "Irregular Cycles", surgeries: "None", familyHistory: "None" }
    },
    {
      name: "Pooja Banerjee",
      age: 24,
      pregnancyStatus: "Not Pregnant",
      edd: null,
      fhr: null,
      menstrualHistory: { lmp: "2026-06-14", cycle: "28 Days", flow: "Regular", dysmenorrhea: "None" },
      obstetricHistory: [],
      prescriptions: [],
      prescriptionHistory: [],
      files: [],
      medicalReports: [],
      vitalsHistory: [
        { date: "22 Jun 2026", bp: "112/70", wt: "50 kg", hr: "75 bpm", temp: "98.2 F" }
      ],
      investigationsHistory: [],
      history: { pastConditions: "None", surgeries: "None", familyHistory: "None" }
    },
    {
      name: "Kavita Rao",
      age: 40,
      pregnancyStatus: "Not Pregnant",
      edd: null,
      fhr: null,
      menstrualHistory: { lmp: "2026-05-28", cycle: "26 Days", flow: "Heavy", dysmenorrhea: "Severe" },
      obstetricHistory: [{ pregnancy: "G2 P2 L2 A0", details: "Prev normal delivery (2012, 2015)", complications: "None" }],
      prescriptions: [],
      prescriptionHistory: [],
      files: [],
      medicalReports: [],
      vitalsHistory: [
        { date: "22 Jun 2026", bp: "124/80", wt: "65 kg", hr: "78 bpm", temp: "98.6 F" }
      ],
      investigationsHistory: [],
      history: { pastConditions: "Endometriosis", surgeries: "Laparoscopic Cystectomy (2021)", familyHistory: "Mother - Breast Cancer" }
    }
  ];

  gynPatientsData.forEach((data, idx) => {
    const patIdNum = 6001 + idx;
    const isCheckedIn = idx < 4; // 4 Checked In, 3 Scheduled
    const status = isCheckedIn ? "Checked In" : "Scheduled";
    const patient = {
      uhid: `MH-2026-${patIdNum}`,
      abhaId: `9100-2026-${patIdNum}`,
      aadhaar: `34567890${patIdNum}`,
      passport: `L700${patIdNum}`,
      insuranceId: `POL800${patIdNum}`,
      name: data.name,
      age: data.age,
      gender: "Female",
      type: "OPD",
      mobile: `+91 98888 88${String(700 + idx).substring(0, 3)}`,
      email: `${data.name.toLowerCase().replace(/\s+/g, '')}@email.com`,
      address: `Indiranagar, Bengaluru`,
      bloodGroup: ["A+", "B+", "O+", "AB+"][idx % 4],
      allergies: data.history.pastConditions.includes("Hypothyroidism") ? "None" : "No Known Allergies",
      pregnancyStatus: data.pregnancyStatus,
      edd: data.edd,
      fhr: data.fhr,
      menstrualHistory: data.menstrualHistory,
      obstetricHistory: data.obstetricHistory,
      prescriptionHistory: data.prescriptionHistory,
      files: data.files,
      medicalReports: data.medicalReports,
      vitalsHistory: data.vitalsHistory,
      investigationsHistory: data.investigationsHistory,
      egfr: 95,
      liverFunction: "Normal",
      emergencyContact: { name: "Husband", relation: "Spouse", phone: "+91 9888888800" },
      payer: "Cash Tariff",
      payerType: "Direct",
      sponsor: "Self",
      primaryConsultant: "Dr. Reeta Verma",
      department: "Gynecology & Obs",
      status: status,
      vitals: { bp: data.vitalsHistory[0].bp, hr: parseInt(data.vitalsHistory[0].hr), temp: parseFloat(data.vitalsHistory[0].temp), spo2: 98, weight: parseInt(data.vitalsHistory[0].wt), bmi: 21 },
      clinicalData: { complaint: data.pregnancyStatus === "Pregnant" ? "Routine Ante-Natal Checkup" : "General Checkup", hpi: "Patient came for routine evaluation.", examination: "NAD", diagnosis: data.pregnancyStatus === "Pregnant" ? "Pregnancy Routine Checkup" : "General Wellness Evaluation", treatmentPlan: "Routine plan", carePlan: "Routine follow-up" },
      prescriptions: data.prescriptions,
      history: data.history,
      ward: "—",
      bed: "—",
      insurance: { provider: "Cash", plan: "" },
      alerts: isCheckedIn ? ["Arrived"] : [`Appt: 10:${String(15 * idx).padStart(2, '0')} AM`],
      lastActivity: "09:00 AM"
    };

    state.patients.push(patient);

    state.appointments.push({
      id: "APT" + String(2000 + idx),
      uhid: patient.uhid,
      patientName: patient.name,
      doctorName: "Dr. Reeta Verma",
      spec: "Gynecology & Obs",
      date: "2026-06-22",
      time: `10:${String(15 * idx).padStart(2, '0')} AM`,
      status: status
    });
  });

  console.log(`State Seeded: ${state.patients.length} patients, ${state.appointments.length} appointments, ${state.admissions.length} admissions loaded.`);

  console.log(`State Seeded: ${state.patients.length} patients, ${state.appointments.length} appointments, ${state.admissions.length} admissions loaded.`);
}

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

window.state = state;
