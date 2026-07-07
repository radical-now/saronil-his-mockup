// Laboratory & LIS Command Center Dashboard
// Saronil Health HIS

(function() {
  // Initialize mock data in state if not present
  function initLabState() {
    if (!window.state) window.state = {};
    
    // Detailed list of laboratory test specifications with NABL reference ranges
    window.state.lisTestMaster = [
      { code: "CBC", name: "Complete Blood Count", dept: "Haematology", sampleType: "EDTA Whole Blood (Lavender)", tube: "lavender", price: 350, refRange: "Hb: 12-16 g/dL, WBC: 4000-11000/cumm, PLT: 1.5-4.5L/cumm" },
      { code: "LFT", name: "Liver Function Test", dept: "Biochemistry", sampleType: "Clot Activator Serum (Yellow)", tube: "yellow", price: 750, refRange: "SGOT: <40 U/L, SGPT: <40 U/L, Bilirubin: 0.2-1.2 mg/dL" },
      { code: "KFT", name: "Kidney Function Test", dept: "Biochemistry", sampleType: "Clot Activator Serum (Yellow)", tube: "yellow", price: 650, refRange: "Urea: 15-45 mg/dL, Creatinine: 0.6-1.2 mg/dL, Uric Acid: 3.5-7.2 mg/dL" },
      { code: "HBA1C", name: "HbA1c (Glycated Hb)", dept: "Biochemistry", sampleType: "EDTA Whole Blood (Lavender)", tube: "lavender", price: 450, refRange: "Normal: <5.7%, Prediabetic: 5.7-6.4%, Diabetic: >=6.5%" },
      { code: "LIPID", name: "Lipid Profile", dept: "Biochemistry", sampleType: "Clot Activator Serum (Yellow)", tube: "yellow", price: 800, refRange: "Cholesterol: <200 mg/dL, Triglycerides: <150 mg/dL, HDL: >40 mg/dL" },
      { code: "TSH", name: "Thyroid Stimulating Hormone", dept: "Serology", sampleType: "Clot Activator Serum (Yellow)", tube: "yellow", price: 300, refRange: "TSH: 0.45 - 4.5 uIU/mL" },
      { code: "DENGUE", name: "Dengue NS1 Antigen & IgG/IgM", dept: "Serology", sampleType: "Clot Activator Serum (Yellow)", tube: "yellow", price: 900, refRange: "Negative" },
      { code: "WIDAL", name: "Widal Slide Agglutination", dept: "Serology", sampleType: "Clot Activator Serum (Yellow)", tube: "yellow", price: 250, refRange: "Negative (Titer < 1:80)" },
      { code: "HIV", name: "HIV 1 & 2 Antibody (ELISA)", dept: "Serology", sampleType: "Clot Activator Serum (Yellow)", tube: "yellow", price: 500, refRange: "Non-Reactive" },
      { code: "URINE_RM", name: "Urine Routine & Microscopy", dept: "Clinical Pathology", sampleType: "Urine Cup (Yellow cap)", tube: "yellow-cap", price: 200, refRange: "Protein: Nil, Sugar: Nil, Pus Cells: 0-2/HPF" },
      { code: "BIOP_MED", name: "Biopsy Histopathology (Medium Specimen)", dept: "Histopathology", sampleType: "Formalin Container", tube: "formalin", price: 1800, refRange: "Requires clinical correlation" },
      { code: "FNAC", name: "FNAC Cytology Report", dept: "Cytology", sampleType: "Smear Slides", tube: "slides", price: 1000, refRange: "Requires clinical correlation" }
    ];

    // Ensure LIS state variables exist with comprehensive production records
    window.state.criticalValues = window.state.criticalValues || [
      { id: 1, patientName: "Ramesh Kumar", uhid: "MH-2026-4802", ipop: "IP-2026-4802", test: "Potassium (K+)", value: "6.8 mmol/L", unit: "mmol/L", refRange: "3.5 - 5.1 mmol/L", doctor: "Dr. Amit Sharma (MD, DM Cardiology - MCI Reg: 4801)", ward: "ICU-BED-02", elapsedMins: 32, status: "Pending" },
      { id: 2, patientName: "Priya Devi", uhid: "MH-2026-9081", ipop: "OPD-3021", test: "Hemoglobin (Hb)", value: "4.2 g/dL", unit: "g/dL", refRange: "12.0 - 15.0 g/dL", doctor: "Dr. Sunita Verma (MD, OBG - MCI Reg: 2901)", ward: "OPD Counter 1", elapsedMins: 18, status: "Pending" },
      { id: 3, patientName: "Vikram Malhotra", uhid: "MH-2026-7731", ipop: "IP-2026-7731", test: "Platelet Count", value: "18,000 /µL", unit: "/µL", refRange: "1.5L - 4.5L /µL", doctor: "Dr. Joy Sen (MD, Pulmonology - MCI Reg: 1209)", ward: "GENERAL-WARD-M GW-410", elapsedMins: 45, status: "Pending" },
      { id: 4, patientName: "Karan Johar", uhid: "MH-2026-2210", ipop: "EMER-102", test: "Cardiac Troponin-I", value: "4.5 ng/mL", unit: "ng/mL", refRange: "<0.01 ng/mL", doctor: "Dr. Amit Sharma", ward: "Emergency Bay 1", elapsedMins: 5, status: "Pending" }
    ];

    window.state.criticalAckRegister = window.state.criticalAckRegister || [
      { patientName: "Sonia Gandhi", uhid: "MH-2026-0812", test: "Serum Sodium (Na+)", value: "112 mmol/L", informedTo: "Dr. Verma", mode: "Intercom", time: "09:15 AM", staff: "Tech Amit", compliance: "Within 30m" },
      { patientName: "Rahul Dravid", uhid: "MH-2026-5561", test: "Calcium (ionized)", value: "1.92 mmol/L", informedTo: "Sister Elizabeth", mode: "Ward Intercom", time: "11:20 AM", staff: "Tech Seema", compliance: "Within 30m" }
    ];

    window.state.rejectionRegister = window.state.rejectionRegister || [
      { accNo: "SPEC-20260701-90", name: "Anil Kumble", uhid: "MH-2026-4402", test: "Lipid Profile", reason: "Hemolysed", comment: "Severe hemolysis, yellow tube rejected.", date: "01-Jul-2026", technician: "Tech Rohan" },
      { accNo: "SPEC-20260701-98", name: "Sachin Tendulkar", uhid: "MH-2026-1219", test: "PT/INR", reason: "Clotted Sample", comment: "Fibrin micro-clots detected in blue citrate tube.", date: "01-Jul-2026", technician: "Tech Amit" }
    ];

    window.state.notifiableDiseaseLog = window.state.notifiableDiseaseLog || [
      { uhid: "MH-2026-0912", name: "Rakesh Sharma", disease: "Tuberculosis (TB)", test: "GeneXpert MTB", result: "MTB Detected, Rif Resistance Not Detected", doctor: "Dr. Sen", status: "Notified (Nikshay ID: NK-99210)", date: "01-Jul-2026" },
      { uhid: "MH-2026-1120", name: "Sunita Devi", disease: "Malaria", test: "Peripheral Smear", result: "Plasmodium falciparum Ring stage seen", doctor: "Dr. Verma", status: "Notified IDSP", date: "02-Jul-2026" }
    ];

    // Comprehensive Phlebotomy Queue (OPD/IPD/Emergency Billing Gate Verified)
    if (!window.state.phlebotomyQueue) {
      window.state.phlebotomyQueue = [
        { accNo: "SPEC-20260702-0101", name: "Aarav Mehta", uhid: "MH-2026-9912", source: "OPD Counter 2", tests: "CBC, HbA1c", tubes: ["lavender"], priority: "STAT", doctor: "Dr. Sharma", time: "10m ago", status: "Pending", flags: [], payerType: "CGHS", schemeAuthStatus: "Pending" },
        { accNo: "SPEC-20260702-0102", name: "Sunita Devi", uhid: "MH-2026-1120", source: "PVT-204", tests: "LFT, KFT, Electrolytes", tubes: ["red", "yellow"], priority: "Urgent", doctor: "Dr. Sen", time: "15m ago", status: "Pending", flags: ["Malaria / Dengue"], payerType: "Star Health", schemeAuthStatus: "Approved" },
        { accNo: "SPEC-20260702-0103", name: "Gopal Banerjee", uhid: "MH-2026-3092", source: "SP-301", tests: "PT/INR, APTT", tubes: ["blue"], priority: "Routine", doctor: "Dr. Sen", time: "25m ago", status: "Assigned", flags: [], payerType: "Self Pay", schemeAuthStatus: "Approved" },
        { accNo: "SPEC-20260702-0104", name: "Harpreet Singh", uhid: "MH-2026-8812", source: "PVT-201", tests: "Blood Culture, Gram Stain", tubes: ["red", "lavender"], priority: "STAT", doctor: "Dr. Sharma", time: "30m ago", status: "Pending", flags: ["HIV/HBsAg/HCV"], payerType: "CGHS", schemeAuthStatus: "Pending" },
        { accNo: "SPEC-20260702-0105", name: "Elena Gilbert", uhid: "MH-2026-4402", source: "Home Collection", address: "A-12 Saket, Delhi", tests: "Thyroid Profile (T3/T4/TSH)", tubes: ["red"], priority: "Routine", doctor: "Dr. Mehta", time: "08:00 AM", status: "In Collection", flags: [], payerType: "Self Pay", schemeAuthStatus: "Approved" },
        { accNo: "SPEC-20260702-0106", name: "Karan Johar", uhid: "MH-2026-2210", source: "Emergency Bay 1", tests: "Troponin-I, CBC, Glucose", tubes: ["red", "lavender"], priority: "STAT", doctor: "Dr. Amit Sharma", time: "Just ordered", status: "Pending", flags: ["Emergency Override"], payerType: "Cashless TPA", schemeAuthStatus: "Approved-EmergencyOverride" },
        { accNo: "SPEC-20260702-0107", name: "Kavitha Nair", uhid: "MH-2026-8092", source: "GENERAL-WARD GW-302", tests: "Liver Function Test (LFT)", tubes: ["yellow"], priority: "Routine", doctor: "Dr. Priya Nair", time: "Ward request", status: "Pending", flags: [], orderedByRole: "nurse", doctorCountersignedAt: null, payerType: "PM-JAY", schemeAuthStatus: "Approved" }
      ];
    }

    // Detailed Processing Worklist representing Department Benches
    if (!window.state.processingWorklist) {
      window.state.processingWorklist = [
        { specId: "SPEC-20260702-0091", name: "Meena Iyer", uhid: "MH-2026-7261", test: "Widal Test, Dengue NS1", dept: "Serology", analyzer: "Maglumi 800", time: "45m ago", elapsedMins: 45, targetHrs: 3, status: "On Analyzer", flags: [], assignedTech: "Tech Seema" },
        { specId: "SPEC-20260702-0092", name: "Shyam Lal", uhid: "MH-2026-1930", test: "Urine Routine & Microscopy", dept: "Urine", analyzer: "Erba Urilyzer", time: "20m ago", elapsedMins: 20, targetHrs: 2, status: "Received in Lab", flags: [] },
        { specId: "SPEC-20260702-0093", name: "Ramesh Kumar", uhid: "MH-2026-4802", test: "Complete Blood Count (CBC)", dept: "Haematology", analyzer: "Mindray BC-5150", time: "1h ago", elapsedMins: 60, targetHrs: 1.5, status: "Result Entered", flags: ["Critical"], assignedTech: "Tech Amit" },
        { specId: "SPEC-20260702-0094", name: "Sunita Devi", uhid: "MH-2026-1120", test: "Sputum AFB Smear", dept: "Microbiology", analyzer: "Manual Staining", time: "3h ago", elapsedMins: 180, targetHrs: 2, status: "Manual Processing", flags: ["AFB positive"], assignedTech: "Tech Rohan" },
        { specId: "SPEC-20260702-0095", name: "Rajesh Koothrappali", uhid: "MH-2026-0091", test: "Pleural Fluid Cytology", dept: "Cytology", analyzer: "Centrifuge & Cytospin", time: "50m ago", elapsedMins: 50, targetHrs: 6, status: "Received in Lab", flags: [] },
        { specId: "SPEC-20260702-0096", name: "Sheldon Cooper", uhid: "MH-2026-1002", test: "Punch Skin Biopsy Histopath", dept: "Histopathology", analyzer: "Microtome Sectioning", time: "4h ago", elapsedMins: 240, targetHrs: 24, status: "Grossing Completed", flags: ["Malignancy Check"] }
      ];
    }

    // Pathologist Validation Queue with Clinical Validation Details
    if (!window.state.validationQueue) {
      window.state.validationQueue = [
        { reportNo: "REP-20260702-101", name: "Ramesh Kumar", uhid: "MH-2026-4802", test: "Hemoglobin", keyResults: "Hb: 4.2 g/dL (Critical Low)", refRange: "12.0 - 15.0 g/dL", flag: "CRITICAL", enteredBy: "Tech Amit (EMP-902)", time: "15m ago", elapsedMins: 15 },
        { reportNo: "REP-20260702-102", name: "Meena Iyer", uhid: "MH-2026-7261", test: "Thyroid Profile", keyResults: "TSH: 8.5 µIU/mL (High), T3: 1.2 ng/mL, T4: 7.8 µg/dL", refRange: "TSH: 0.4 - 4.5 µIU/mL", flag: "H", enteredBy: "Tech Seema (EMP-903)", time: "30m ago", elapsedMins: 30 },
        { reportNo: "REP-20260702-103", name: "Vikram Malhotra", uhid: "MH-2026-7731", test: "Serum Creatinine (Delta Alert)", keyResults: "Creatinine: 3.2 mg/dL (Prior: 1.1 mg/dL)", refRange: "0.6 - 1.2 mg/dL", flag: "DELTA CHECK", enteredBy: "Tech Amit (EMP-902)", time: "10m ago", elapsedMins: 10 },
        { reportNo: "REP-20260702-104", name: "Harpreet Singh", uhid: "MH-2026-8812", test: "HIV 1&2 Antibody (ELISA)", keyResults: "HIV 1&2 Ab: Reactive", refRange: "Non-Reactive", flag: "REACTIVE", enteredBy: "Tech Rohan (EMP-908)", time: "1h ago", elapsedMins: 60 }
      ];
    }

    // Levey-Jennings Quality Control Runs with Westgard Violations
    if (!window.state.qcLog) {
      window.state.qcLog = [
        { dept: "Haematology", control: "CBC Control L2", level: "L2 (Normal)", time: "06:15 AM", result: "Hb: 12.2 g/dL", target: "12.0 ± 0.3 g/dL", deviation: "+0.67 SD", status: "Pass" },
        { dept: "Biochemistry", control: "Assayed Chemistry L1", level: "L1 (Pathological)", time: "06:30 AM", result: "Glucose: 158 mg/dL", target: "100 ± 5 mg/dL", deviation: "+11.6 SD", status: "Fail", rule: "1-3s Rule Violated" },
        { dept: "Serology", control: "Dengue Positive Control", level: "L1", time: "07:00 AM", result: "Reactive", target: "Reactive", deviation: "0.0 SD", status: "Pass" },
        { dept: "Biochemistry", control: "Lipid Control L2", level: "L2 (Normal)", time: "07:15 AM", result: "Cholesterol: 188 mg/dL", target: "190 ± 8 mg/dL", deviation: "-0.25 SD", status: "Pass" }
      ];
    }

    // Outsource B2B Referral Tracker
    if (!window.state.outsourceRegister) {
      window.state.outsourceRegister = [
        { accNo: "SPEC-20260702-0051", name: "Anil Kapoor", test: "Vitamin D3 (25-Hydroxy)", lab: "Dr Lal PathLabs", dispatchTime: "08:15 AM", expectedDate: "01-Jul-2026", status: "Dispatched", result: "" },
        { accNo: "SPEC-20260702-0052", name: "Sushma Swaraj", test: "Karyotyping / Chromosomal", lab: "Metropolis Healthcare", dispatchTime: "08:30 AM", expectedDate: "05-Jul-2026", status: "Dispatched", result: "" }
      ];
    }

    // Reagents, controls and calibrators low stock Alerts
    if (!window.state.reagentAlerts) {
      window.state.reagentAlerts = [
        { reagent: "Mindray CBC Lyse (5L)", analyzer: "Mindray BC-5150", dept: "Haematology", stock: 1, reorder: 2, days: 3 },
        { reagent: "Erba Chem 7 Glucose Reagent", analyzer: "Erba Chem 7", dept: "Biochemistry", stock: 0, reorder: 5, days: 0 },
        { reagent: "Maglumi HBsAg Reagent Kit", analyzer: "Maglumi 800", dept: "Serology", stock: 2, reorder: 5, days: 6 }
      ];
    }

    // Report Dispatch log (Released audit logs)
    if (!window.state.reportDispatchLog) {
      window.state.reportDispatchLog = [
        { reportNo: "REP-20260702-080", name: "Ramesh Chandra", tests: "CBC", releasedAt: "12:15 PM", mode: "WhatsApp PDF", status: "Delivered", mobile: "9812930219", signOffMode: "In-Person console sign-off" },
        { reportNo: "REP-20260702-081", name: "Priya Devi", tests: "Lipid Profile", releasedAt: "01:30 PM", mode: "EMR Push", status: "Sent", mobile: "-", signOffMode: "In-Person console sign-off" },
        { reportNo: "REP-20260702-082", name: "Meena Iyer", tests: "Thyroid Profile", releasedAt: "02:15 PM", mode: "Print Collection", status: "Pending", mobile: "-", signOffMode: "Remote 2-Factor verified sign-off" }
      ];
    }

    // Recollection alerts list
    window.state.recollectionAlerts = window.state.recollectionAlerts || [
      { id: "REC-001", patientName: "Aarav Mehta", uhid: "MH-2026-9912", test: "CBC", reason: "Haemolysed Sample", status: "Pending Action", notifiedAt: "10m ago", source: "Ward 4A Nurse" }
    ];

    // Blood bank cross matches (Form 27C and NABL Annexure E Compliant)
    window.state.bloodBankCrossMatches = window.state.bloodBankCrossMatches || [
      { crossmatchId: "XM-701", patientName: "Ramesh Kumar", uhid: "MH-2026-4802", bloodGroup: "O+", component: "Packed Red Blood Cells", status: "Cross-Matched & Reserved", unitNo: "PRBC-992A" },
      { crossmatchId: "XM-702", patientName: "Priya Devi", uhid: "MH-2026-9081", bloodGroup: "A+", component: "Single Donor Platelets", status: "Pending Matching", unitNo: "Awaiting Donor" }
    ];

    // Blood component stock
    window.state.bloodStock = window.state.bloodStock || {
      'O+': { components: { rbc: 8, platelets: 12, ffp: 6 } },
      'A+': { components: { rbc: 4, platelets: 5, ffp: 8 } },
      'B+': { components: { rbc: 11, platelets: 9, ffp: 14 } },
      'O-': { components: { rbc: 2, platelets: 3, ffp: 2 } }
    };

    // Sample retain storage registry (Rack/Row location tracker)
    window.state.lisSampleStorage = window.state.lisSampleStorage || [
      { sampleId: "SPEC-20260702-0091", patientName: "Meena Iyer", rackNo: "RACK-A3", rowNo: "ROW-2", retainDate: "2026-07-02", disposalDate: "2026-07-09", status: "Retained" },
      { sampleId: "SPEC-20260702-0092", patientName: "Shyam Lal", rackNo: "RACK-B1", rowNo: "ROW-5", retainDate: "2026-07-01", disposalDate: "2026-07-08", status: "Retained" },
      { sampleId: "SPEC-20260702-0093", patientName: "Ramesh Kumar", rackNo: "RACK-H2", rowNo: "ROW-1", retainDate: "2026-07-02", disposalDate: "2026-07-09", status: "Retained" }
    ];

    // LIS Analyzer Equipment Master Tracker
    window.state.lisEquipments = window.state.lisEquipments || [
      { id: "EQ-1", name: "Mindray BC-5150", type: "Haematology 5-Part Cell Counter", status: "Calibrated", lastCalib: "01-Jul-2026", nextCalib: "15-Jul-2026", pmSchedule: "10-Jul-2026", breakdownLogs: [] },
      { id: "EQ-2", name: "Erba Chem 7", type: "Semi-Auto Biochemistry Analyzer", status: "Calibrated", lastCalib: "30-Jun-2026", nextCalib: "14-Jul-2026", pmSchedule: "08-Jul-2026", breakdownLogs: [] },
      { id: "EQ-3", name: "Transasia EM-200", type: "Fully Auto Biochemistry System", status: "Calibration Due", lastCalib: "15-Jun-2026", nextCalib: "29-Jun-2026", pmSchedule: "05-Jul-2026", breakdownLogs: [{ date: "28-Jun-2026", issue: "Probe clog resolved", cost: 1200 }] },
      { id: "EQ-4", name: "Maglumi 800", type: "Chemiluminescence CLIA Immunochemistry", status: "Calibrated", lastCalib: "01-Jul-2026", nextCalib: "01-Aug-2026", pmSchedule: "25-Jul-2026", breakdownLogs: [] }
    ];

    // Immutable LIS Audit Register Logs
    window.state.lisAuditLogs = window.state.lisAuditLogs || [
      { timestamp: "02-Jul-2026 09:30 AM", user: "Billing Sonia (EMP-1102)", action: "Lab Order Created & Billing Verified", details: "Aarav Mehta (MH-2026-9912) CBC, HbA1c ordered" },
      { timestamp: "02-Jul-2026 10:15 AM", user: "Phleb Ritu (EMP-1202)", action: "Sample Collected", details: "Lavender tube collected for Aarav Mehta" },
      { timestamp: "02-Jul-2026 11:05 AM", user: "Tech Amit (EMP-902)", action: "Sample Accessioned (Accepted)", details: "CBC tube accessioned under SPEC-20260702-0101" },
      { timestamp: "02-Jul-2026 11:45 AM", user: "Tech Amit (EMP-902)", action: "Result Entered", details: "CBC results populated via Mindray BC-5150 interface" },
      { timestamp: "02-Jul-2026 12:15 PM", user: "Pathologist Dr. Verma", action: "Report Released (In-Person digital sign)", details: "Ramesh Chandra REP-20260702-080 released to EMR" }
    ];

    // LIS & state.orders synchronization block
    if (window.state.orders) {
      window.state.orders.forEach(order => {
        if (order.type === 'Laboratory') {
          const accNo = `SPEC-ORD-${order.id}`;
          
          // Check if already in LIS flow
          const inPhleb = window.state.phlebotomyQueue.some(p => p.accNo === accNo);
          const inWork = window.state.processingWorklist.some(w => w.specId === accNo);
          const inValid = window.state.validationQueue.some(v => v.reportNo === `REP-${order.id}`);
          const isApproved = order.status === 'Approved';
          const isRejected = order.status === 'Rejected';
          
          if (!inPhleb && !inWork && !inValid && !isApproved && !isRejected) {
            // Retrieve patient to determine source, payer type, etc.
            const pat = window.state.patients.find(p => p.uhid === order.uhid);
            let source = "OPD Consultation";
            let payerType = "Self Pay";
            if (pat) {
              if (pat.type === 'IPD' && pat.ward) {
                source = `${pat.ward} ${pat.bed || ''}`.trim();
              } else if (pat.type === 'Emergency') {
                source = `Emergency ${pat.bed || ''}`.trim();
              }
              payerType = pat.payerType || "Self Pay";
            }
            
            // Map test to tube container color
            const testNameUpper = order.name.toUpperCase();
            let tubes = ["red"];
            if (testNameUpper.includes("CBC") || testNameUpper.includes("HAEMATOLOGY")) {
              tubes = ["lavender"];
            } else if (testNameUpper.includes("LFT") || testNameUpper.includes("KFT") || testNameUpper.includes("LIPID") || testNameUpper.includes("THYROID") || testNameUpper.includes("TSH") || testNameUpper.includes("BIOCHEMISTRY")) {
              tubes = ["yellow"];
            } else if (testNameUpper.includes("PT") || testNameUpper.includes("INR") || testNameUpper.includes("COAGULATION")) {
              tubes = ["blue"];
            } else if (testNameUpper.includes("URINE")) {
              tubes = ["yellow-cap"];
            }
            
            // Map order status to collection status
            let phlebStatus = "Pending";
            if (order.status === 'Sample Collected') {
              phlebStatus = "Collected";
            }
            
            window.state.phlebotomyQueue.push({
              accNo: accNo,
              name: order.patientName,
              uhid: order.uhid,
              source: source,
              tests: order.name,
              tubes: tubes,
              priority: order.priority || "Routine",
              doctor: order.doctorName,
              time: "Just ordered",
              status: phlebStatus,
              flags: [],
              payerType: payerType,
              schemeAuthStatus: (payerType === 'CGHS' || payerType === 'TPA/Insurance' || payerType === 'Govt Scheme' || payerType.includes('Health') || payerType.includes('JAY')) ? "Pending" : "Approved"
            });
          }
        }
      });
    }

    // Map initial LIS queues to real patients from HIS patient directory
    const realPats = window.state.patients || [];
    if (realPats.length >= 10) {
      if (window.state.phlebotomyQueue) {
        window.state.phlebotomyQueue.forEach((p, idx) => {
          const pat = realPats[idx % realPats.length];
          if (pat && !p.accNo.startsWith("SPEC-ORD-")) {
            p.name = pat.name;
            p.uhid = pat.uhid;
          }
        });
      }
      if (window.state.processingWorklist) {
        window.state.processingWorklist.forEach((w, idx) => {
          const pat = realPats[(idx + 3) % realPats.length];
          if (pat && !w.specId.startsWith("SPEC-ORD-")) {
            w.name = pat.name;
            w.uhid = pat.uhid;
          }
        });
      }
      if (window.state.validationQueue) {
        window.state.validationQueue.forEach((v, idx) => {
          const pat = realPats[(idx + 6) % realPats.length];
          if (pat && !v.reportNo.startsWith("REP-ORD")) {
            v.name = pat.name;
            v.uhid = pat.uhid;
          }
        });
      }
      if (window.state.criticalValues) {
        window.state.criticalValues.forEach((c, idx) => {
          const pat = realPats[(idx + 9) % realPats.length];
          if (pat) {
            c.patientName = pat.name;
            c.uhid = pat.uhid;
          }
        });
      }
      if (window.state.criticalAckRegister) {
        window.state.criticalAckRegister.forEach((c, idx) => {
          const pat = realPats[(idx + 12) % realPats.length];
          if (pat) {
            c.patientName = pat.name;
            c.uhid = pat.uhid;
          }
        });
      }
      if (window.state.rejectionRegister) {
        window.state.rejectionRegister.forEach((r, idx) => {
          const pat = realPats[(idx + 15) % realPats.length];
          if (pat && !r.accNo.startsWith("SPEC-ORD-")) {
            r.name = pat.name;
            r.uhid = pat.uhid;
          }
        });
      }
      if (window.state.recollectionAlerts) {
        window.state.recollectionAlerts.forEach((r, idx) => {
          const pat = realPats[(idx + 17) % realPats.length];
          if (pat) {
            r.patientName = pat.name;
            r.uhid = pat.uhid;
          }
        });
      }
      if (window.state.bloodBankCrossMatches) {
        window.state.bloodBankCrossMatches.forEach((b, idx) => {
          const pat = realPats[(idx + 19) % realPats.length];
          if (pat) {
            b.patientName = pat.name;
            b.uhid = pat.uhid;
          }
        });
      }
      if (window.state.lisSampleStorage) {
        window.state.lisSampleStorage.forEach((s, idx) => {
          const pat = realPats[(idx + 21) % realPats.length];
          if (pat && !s.sampleId.startsWith("SPEC-ORD-")) {
            s.patientName = pat.name;
          }
        });
      }
      if (window.state.reportDispatchLog) {
        window.state.reportDispatchLog.forEach((d, idx) => {
          const pat = realPats[(idx + 24) % realPats.length];
          if (pat && !d.reportNo.startsWith("REP-ORD")) {
            d.name = pat.name;
          }
        });
      }
    }

    // ── SYNC state.labOrders → phlebotomy queue ──────────────────────────────
    // Adds orders seeded by state.js (real patient UHIDs) to the phlebotomy queue
    const labOrders = window.state.labOrders || [];
    labOrders.forEach(function(lo) {
      const alreadyInQueue = (window.state.phlebotomyQueue || []).some(function(q) {
        return q.accNo === lo.accNo || (q.uhid === lo.uhid && q.tests === lo.test);
      });
      if (!alreadyInQueue && lo.status !== 'Reported' && lo.status !== 'Approved') {
        window.state.phlebotomyQueue = window.state.phlebotomyQueue || [];
        window.state.phlebotomyQueue.unshift({
          accNo: lo.accNo,
          name: lo.patientName,
          uhid: lo.uhid,
          source: lo.ward,
          tests: lo.test,
          tubes: lo.tube === 'lavender' ? ['lavender'] : lo.tube === 'yellow-cap' ? ['yellow-cap'] : lo.tube === 'none' ? [] : ['yellow'],
          priority: lo.priority,
          doctor: lo.orderedBy,
          time: 'Just ordered',
          status: lo.status === 'In Progress' ? 'Assigned' : 'Pending',
          flags: lo.priority === 'STAT' ? ['Emergency'] : [],
          payerType: 'TPA/Insurance',
          schemeAuthStatus: 'Approved'
        });
      }
    });
    // Also sync processing worklist entries from In Progress labOrders
    labOrders.filter(lo => lo.status === 'In Progress').forEach(function(lo) {
      const inWork = (window.state.processingWorklist || []).some(function(w) {
        return w.uhid === lo.uhid && w.test === lo.test;
      });
      if (!inWork) {
        window.state.processingWorklist = window.state.processingWorklist || [];
        window.state.processingWorklist.unshift({
          specId: lo.accNo,
          name: lo.patientName,
          uhid: lo.uhid,
          test: lo.test,
          dept: lo.dept,
          analyzer: 'Auto',
          time: 'Ordered today',
          elapsedMins: 15,
          targetHrs: 2,
          status: 'On Analyzer',
          flags: lo.priority === 'Urgent' ? ['Urgent'] : [],
          assignedTech: 'Tech Amit'
        });
      }
    });
  }


  // Define global view function
  window.views = window.views || {};
  window.views.labDashboard = function(container) {
    window.activeLisContainer = container;
    initLabState();
    
    // Get active role
    const activeRole = localStorage.getItem('saronil_active_lab_role') || 'Lab Technician';

    // Set base layout style
    const styles = `
      <style>
        .crit-banner {
          background-color: #FEF2F2;
          border-bottom: 2px solid #FCA5A5;
          width: 100%;
        }
        .crit-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 8px 16px;
          border-bottom: 1px solid #FEE2E2;
          font-size: 0.72rem;
          color: #991B1B;
        }
        .crit-row-overdue {
          background-color: #FEE2E2;
          animation: critical-pulse 2s infinite ease-in-out;
        }
        @keyframes critical-pulse {
          0% { background-color: #FEE2E2; }
          50% { background-color: #FCA5A5; }
          100% { background-color: #FEE2E2; }
        }
        .badge-priority-stat { background-color: #FEF2F2; color: #EF4444; border: 1px solid #FCA5A5; }
        .badge-priority-urgent { background-color: #FFFBEB; color: #F59E0B; border: 1px solid #FCD34D; }
        .badge-priority-routine { background-color: #F1F5F9; color: #475569; border: 1px solid #E2E8F0; }
        
        .tube-dot {
          display: inline-block;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          margin-right: 4px;
          border: 1px solid #CBD5E1;
        }
        
        .department-tab-btn {
          font-size: 0.75rem;
          padding: 6px 12px;
          border-bottom: 2px solid transparent;
          color: var(--text-muted);
          cursor: pointer;
        }
        .department-tab-btn.active {
          border-bottom-color: var(--primary);
          color: var(--primary);
          font-weight: 700;
        }
      </style>
    `;

    // Generate main page wrapper
    container.innerHTML = styles + `
      <div style="padding: 12px 0;">
        
        <!-- SECTION 1 — CRITICAL VALUES BANNER -->
        <div id="lis-critical-banner" class="crit-banner mb-4 rounded-lg overflow-hidden" style="display: none;">
          <div style="background-color: #EF4444; color: white; padding: 6px 16px; font-weight: bold; font-size: 0.78rem;">
            🚨 CRITICAL PANIC VALUES (NABL Enforced Action Required within 30 min)
          </div>
          <div id="critical-rows-container">
            <!-- Dynamic unacknowledged critical rows -->
          </div>
        </div>

        <!-- SECTION 2 — ROLE + SHIFT BAR -->
        <div style="margin-top: 4px; margin-bottom: 16px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
          <div>
            <h1 style="font-size: 1.35rem; font-weight: 700; color: var(--text-primary); margin: 0; font-family: var(--font-display);">Laboratory & LIS Command Center</h1>
            <div style="font-size: 0.78rem; color: var(--text-muted); margin-top: 2px;">Specimen Processing · Pathologist Validation · NABL Audited Panic Dispatches</div>
          </div>
          
          <div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap;">
            <div class="admin-mono" style="font-size: 0.72rem; background: #EFF6FF; border: 1px solid #BFDBFE; padding: 4px 10px; border-radius: 4px; font-weight: bold; color: #1E40AF;">
              Samples: <span id="shift-samples-count">148</span> | TAT: <span id="shift-tat-compliance" class="text-emerald-600">94.8%</span>
            </div>
            <div class="admin-mono" style="font-size: 0.72rem; background: #FFF; border: 1px solid var(--border-color); padding: 4px 10px; border-radius: 4px; font-weight: bold; color: var(--text-primary);">
              NABL Acc: MC-9021
            </div>
          </div>
        </div>

        <!-- SECTION 3 — KPI STAT CARDS -->
        <div class="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-8 gap-4 mb-6" id="lis-kpi-grid">
          <!-- Filtered dynamically by role -->
        </div>

        <!-- SECTION 4 — QUICK ACTION BAR -->
        <div style="background-color: var(--bg-surface); padding: 10px 16px; border: 1px solid var(--border-color); border-radius: 6px; display: flex; flex-direction: column; gap: 8px; margin-bottom: 16px;">
          <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
            <div style="display: flex; gap: 8px; flex-wrap: wrap;" id="lis-actions-container">
              <!-- Filtered dynamically by role -->
            </div>
            <div style="width: 280px; position: relative;">
              <input type="text" id="lis-global-search" placeholder="Accession No / Specimen ID / Name..." onkeyup="window.filterLisDashboard(this.value)" style="width: 100%; border: 1px solid var(--border-color); border-radius: 4px; padding: 6px 12px; font-size: 0.8rem; background-color: #F8FAFC;">
            </div>
          </div>
          
          <!-- LIS FILTERS MATRIX -->
          <div style="display: flex; flex-wrap: wrap; gap: 8px; border-top: 1px dashed var(--border-color); padding-top: 8px; align-items: center;">
            <span style="font-size: 0.7rem; font-weight: bold; color: var(--text-muted);">🎯 Filters:</span>
            <select id="lis-filter-date" onchange="window.applyDashboardFilters()" style="font-size: 0.68rem; padding: 4px 6px; border-radius: 4px; border: 1px solid var(--border-color); background: white;">
              <option value="">Date: All</option>
              <option value="today">Today</option>
              <option value="yesterday">Yesterday</option>
            </select>
            <select id="lis-filter-dept" onchange="window.applyDashboardFilters()" style="font-size: 0.68rem; padding: 4px 6px; border-radius: 4px; border: 1px solid var(--border-color); background: white;">
              <option value="">Department: All</option>
              <option value="Haematology">Haematology</option>
              <option value="Biochemistry">Biochemistry</option>
              <option value="Serology">Serology</option>
              <option value="Microbiology">Microbiology</option>
              <option value="Urine">Urine & Fluids</option>
              <option value="Histopathology">Histopathology</option>
              <option value="Cytology">Cytology</option>
            </select>
            <select id="lis-filter-doctor" onchange="window.applyDashboardFilters()" style="font-size: 0.68rem; padding: 4px 6px; border-radius: 4px; border: 1px solid var(--border-color); background: white;">
              <option value="">Doctor: All</option>
              <option value="Sharma">Dr. Sharma</option>
              <option value="Sen">Dr. Sen</option>
              <option value="Priya Nair">Dr. Priya Nair</option>
              <option value="Amit Sharma">Dr. Amit Sharma</option>
            </select>
            <select id="lis-filter-tech" onchange="window.applyDashboardFilters()" style="font-size: 0.68rem; padding: 4px 6px; border-radius: 4px; border: 1px solid var(--border-color); background: white;">
              <option value="">Technician: All</option>
              <option value="Amit">Tech Amit</option>
              <option value="Seema">Tech Seema</option>
              <option value="Rohan">Tech Rohan</option>
            </select>
            <select id="lis-filter-status" onchange="window.applyDashboardFilters()" style="font-size: 0.68rem; padding: 4px 6px; border-radius: 4px; border: 1px solid var(--border-color); background: white;">
              <option value="">Status: All</option>
              <option value="Pending">Pending Collection</option>
              <option value="In Collection">In Collection</option>
              <option value="Received in Lab">Received in Lab</option>
              <option value="Result Entered">Result Entered</option>
              <option value="On Analyzer">On Analyzer</option>
            </select>
            <select id="lis-filter-priority" onchange="window.applyDashboardFilters()" style="font-size: 0.68rem; padding: 4px 6px; border-radius: 4px; border: 1px solid var(--border-color); background: white;">
              <option value="">Priority: All</option>
              <option value="STAT">STAT</option>
              <option value="Urgent">Urgent</option>
              <option value="Routine">Routine</option>
            </select>
            <button class="btn btn-secondary text-[8px]" onclick="window.clearDashboardFilters()" style="padding: 3px 6px; font-size: 8px;">Clear Filters</button>
          </div>
        </div>

        <!-- SECTION 5 — INSTRUMENT STATUS BAR -->
        <div style="border: 1px solid var(--border-color); border-radius: 6px; padding: 10px; background-color: white; margin-bottom: 16px;">
          <div style="font-size: 0.75rem; font-weight: bold; color: var(--text-secondary); margin-bottom: 8px; border-bottom: 1px solid var(--border-color); padding-bottom: 4px; text-transform: uppercase;">
            🎛️ Analyzer Calibration & Status Board
          </div>
          <div style="display: flex; flex-wrap: wrap; gap: 8px;">
            <div onclick="window.showInstrumentDetail('Mindray BC-5150')" style="cursor:pointer; background: #ECFDF5; border: 1px solid #A7F3D0; color: #065F46; font-size: 0.68rem; padding: 4px 8px; border-radius: 4px; font-weight: 500;">
              Mindray BC-5150 · CBC · 🟢 Running · 14 spls
            </div>
            <div onclick="window.showInstrumentDetail('Sysmex XP-100')" style="cursor:pointer; background: #FFFBEB; border: 1px solid #FCD34D; color: #92400E; font-size: 0.68rem; padding: 4px 8px; border-radius: 4px; font-weight: 500;">
              Sysmex XP-100 · CBC-2 · 🟡 Idle · Last run 1h ago
            </div>
            <div onclick="window.showInstrumentDetail('Erba Chem 7')" style="cursor:pointer; background: #ECFDF5; border: 1px solid #A7F3D0; color: #065F46; font-size: 0.68rem; padding: 4px 8px; border-radius: 4px; font-weight: 500;">
              Erba Chem 7 · Biochem · 🟢 Running · 9 spls
            </div>
            <div onclick="window.showInstrumentDetail('Transasia EM-200')" style="cursor:pointer; background: #FEF2F2; border: 1px solid #FCA5A5; color: #991B1B; font-size: 0.68rem; padding: 4px 8px; border-radius: 4px; font-weight: bold;">
              Transasia EM-200 · Biochem-2 · 🔴 Reagent Error
            </div>
            <div onclick="window.showInstrumentDetail('Maglumi 800')" style="cursor:pointer; background: #ECFDF5; border: 1px solid #A7F3D0; color: #065F46; font-size: 0.68rem; padding: 4px 8px; border-radius: 4px; font-weight: 500;">
              Maglumi 800 · Serology · 🟢 Running · 5 spls
            </div>
            <div onclick="window.showInstrumentDetail('Agappe Mispa i2')" style="cursor:pointer; background: #FFFBEB; border: 1px solid #FCD34D; color: #92400E; font-size: 0.68rem; padding: 4px 8px; border-radius: 4px; font-weight: 500;">
              Agappe Mispa i2 · Immunoassay · 🟡 Idle
            </div>
            <div onclick="window.showInstrumentDetail('BacT/ALERT')" style="cursor:pointer; background: #EFF6FF; border: 1px solid #BFDBFE; color: #1E40AF; font-size: 0.68rem; padding: 4px 8px; border-radius: 4px; font-weight: 500;">
              BacT/ALERT · Cultures · 🔵 Incubating · 8 cultures
            </div>
            <div onclick="window.showInstrumentDetail('Erba Urilyzer')" style="cursor:pointer; background: #ECFDF5; border: 1px solid #A7F3D0; color: #065F46; font-size: 0.68rem; padding: 4px 8px; border-radius: 4px; font-weight: 500;">
              Erba Urilyzer · Urine · 🟢 Running · 6 spls
            </div>
          </div>
        </div>

        <!-- SECTION 6 — THREE-COLUMN MAIN AREA -->
        <div style="display: grid; grid-template-columns: 35% 35% 30%; gap: 12px; min-width: 1200px; align-items: start;">
          
          <!-- LEFT COLUMN (35%) -->
          <div style="display: flex; flex-direction: column; gap: 12px;">
            <!-- 1. Phlebotomy Collection -->
            <div class="card" id="lis-phleb-card" style="margin-bottom: 0;">
              <div class="card-header" style="border-bottom: 1px solid var(--border-color); padding: 10px 12px;">
                <h3 style="font-size: 0.85rem; font-weight: 700; color: var(--text-primary); margin:0;">1. Phlebotomy Collection</h3>
                <div style="display:flex; gap:3px; margin-top:6px;">
                  <button class="btn btn-xs btn-primary text-[9px]" id="phleb-filter-all" onclick="window.filterPhlebQueue('all')" style="padding:1px 3px;">All</button>
                  <button class="btn btn-xs btn-secondary text-[9px]" id="phleb-filter-stat" onclick="window.filterPhlebQueue('STAT')" style="padding:1px 3px;">STAT</button>
                  <button class="btn btn-xs btn-secondary text-[9px]" id="phleb-filter-ipd" onclick="window.filterPhlebQueue('IPD')" style="padding:1px 3px;">IPD</button>
                  <button class="btn btn-xs btn-secondary text-[9px]" id="phleb-filter-home" onclick="window.filterPhlebQueue('Home')" style="padding:1px 3px;">Home</button>
                </div>
              </div>
              <div class="card-body" style="padding: 10px; display: flex; flex-direction: column; gap: 8px;" id="phleb-queue-container">
                <!-- Dynamic items -->
              </div>
            </div>

            <!-- Recollection Alerts Log -->
            <div class="card" id="lis-recollect-card" style="margin-bottom: 0;">
              <div class="card-header" style="border-bottom: 1px solid var(--border-color); padding: 8px 10px;">
                <h4 style="font-size: 0.8rem; font-weight: 700; color: var(--text-primary); margin:0; display:flex; justify-content:space-between; align-items:center;">
                  <span>🔄 Recollection Alerts Log</span>
                  <span class="badge bg-amber-500 text-white text-[8px] px-1.5 py-0.5 rounded-full" id="recollect-alert-count">0 Active</span>
                </h4>
              </div>
              <div class="card-body" style="padding: 6px; display:flex; flex-direction:column; gap:6px;" id="recollection-alerts-body">
                <!-- Dynamic -->
              </div>
            </div>

            <!-- Outsource Referral Log Card -->
            <div class="card" id="lis-outsource-card" style="margin-bottom: 0;">
              <div class="card-header" style="border-bottom: 1px solid var(--border-color); padding: 8px 10px;">
                <h4 style="font-size: 0.8rem; font-weight: 700; color: var(--text-primary); margin:0;">Outsource Referral Log</h4>
              </div>
              <div class="card-body" style="padding: 6px; overflow-x: auto;">
                <table style="width: 100%; border-collapse: collapse; font-size: 0.65rem;">
                  <thead>
                    <tr style="border-bottom: 1px solid var(--border-color); background-color: #F8FAFC;">
                      <th style="padding:4px; text-align:left;">Patient / Lab</th>
                      <th style="padding:4px; text-align:left;">Test</th>
                      <th style="padding:4px; text-align:right;">Status</th>
                    </tr>
                  </thead>
                  <tbody id="outsource-register-body">
                    <!-- Dynamic -->
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <!-- CENTRE COLUMN (35%) -->
          <div style="display: flex; flex-direction: column; gap: 12px;">
            <!-- 2. Processing Worklist -->
            <div class="card" id="lis-process-card" style="margin-bottom: 0;">
              <div class="card-header" style="border-bottom: 1px solid var(--border-color); padding: 10px 12px;">
                <h3 style="font-size: 0.85rem; font-weight: 700; color: var(--text-primary); margin:0;">2. Processing Worklist</h3>
                <div style="display:flex; gap:3px; margin-top:6px;">
                  <button class="btn btn-xs btn-primary text-[9px]" id="worklist-filter-all" onclick="window.filterWorklist('all')" style="padding:1px 3px;">All</button>
                  <button class="btn btn-xs btn-secondary text-[9px]" id="worklist-filter-haem" onclick="window.filterWorklist('Haematology')" style="padding:1px 3px;">Haem</button>
                  <button class="btn btn-xs btn-secondary text-[9px]" id="worklist-filter-biochem" onclick="window.filterWorklist('Biochemistry')" style="padding:1px 3px;">Biochem</button>
                  <button class="btn btn-xs btn-secondary text-[9px]" id="worklist-filter-micro" onclick="window.filterWorklist('Microbiology')" style="padding:1px 3px;">Micro</button>
                </div>
              </div>
              <div class="card-body" style="padding: 10px; display: flex; flex-direction: column; gap: 8px;" id="processing-worklist-container">
                <!-- Dynamic items -->
              </div>
            </div>

            <!-- QC Status -->
            <div class="card" id="lis-qc-card" style="margin-bottom: 0;">
              <div class="card-header" style="border-bottom: 1px solid var(--border-color); padding: 8px 10px;">
                <h4 style="font-size: 0.8rem; font-weight: 700; color: var(--text-primary); margin:0;">QC Run Violations (Westgard)</h4>
              </div>
              <div class="card-body" style="padding: 8px; display:flex; flex-direction:column; gap:6px;" id="qc-violations-container">
                <!-- Dynamic items -->
              </div>
            </div>

            <!-- Reagent consumables alerts -->
            <div class="card" id="lis-reagents-card" style="margin-bottom: 0;">
              <div class="card-header" style="border-bottom: 1px solid var(--border-color); padding: 8px 10px;">
                <h4 style="font-size: 0.8rem; font-weight: 700; color: var(--text-primary); margin:0;">Inventory Reagent Alerts</h4>
              </div>
              <div class="card-body" style="padding: 8px; display:flex; flex-direction:column; gap:6px;" id="reagents-container">
                <!-- Dynamic items -->
              </div>
            </div>
          </div>

          <!-- RIGHT COLUMN (30%) -->
          <div style="display: flex; flex-direction: column; gap: 12px;">
            <!-- 3. Pathologist Validation -->
            <div class="card" id="lis-validation-card" style="margin-bottom: 0;">
              <div class="card-header" style="border-bottom: 1px solid var(--border-color); padding: 10px 12px;">
                <h3 style="font-size: 0.85rem; font-weight: 700; color: var(--text-primary); margin:0;">3. Pathologist Validation</h3>
                <div style="display:flex; gap:3px; margin-top:6px;">
                  <button class="btn btn-xs btn-primary text-[9px]" id="valid-filter-all" onclick="window.filterValidQueue('all')" style="padding:1px 3px;">All</button>
                  <button class="btn btn-xs btn-secondary text-[9px]" id="valid-filter-crit" onclick="window.filterValidQueue('CRITICAL')" style="padding:1px 3px;">Panic</button>
                  <button class="btn btn-xs btn-secondary text-[9px]" id="valid-filter-react" onclick="window.filterValidQueue('REACTIVE')" style="padding:1px 3px;">Reactive</button>
                </div>
              </div>
              <div class="card-body" style="padding: 10px; display: flex; flex-direction: column; gap: 8px;" id="validation-queue-container">
                <!-- Dynamic items -->
              </div>
            </div>
            <!-- My Recent Requests -->
            ${window.renderMyRecentRequestsHTML ? window.renderMyRecentRequestsHTML('Laboratory') : ''}
          </div>
        </div>

        <!-- SECTION 7 — DEPARTMENT TABS -->
        <div class="card" id="lis-dept-card" style="margin-top: 16px;">
          <div class="card-header" style="border-bottom: 1px solid var(--border-color); padding: 10px 16px; display:flex; justify-content:space-between; align-items:center;">
            <h3 style="font-size: 0.9rem; font-weight: 700; color: var(--text-primary); margin:0;">Department Analytics & Test Registry</h3>
            <div style="display:flex; gap:4px;" id="department-tabs-bar">
              <span class="department-tab-btn active" onclick="window.switchDeptTab('Haematology')">Haematology</span>
              <span class="department-tab-btn" onclick="window.switchDeptTab('Biochemistry')">Biochemistry</span>
              <span class="department-tab-btn" onclick="window.switchDeptTab('Serology')">Serology / Immuno</span>
              <span class="department-tab-btn" onclick="window.switchDeptTab('Microbiology')">Microbiology</span>
              <span class="department-tab-btn" onclick="window.switchDeptTab('Urine')">Urine & Fluids</span>
              <span class="department-tab-btn" onclick="window.switchDeptTab('Histopathology')">Histopathology</span>
              <span class="department-tab-btn" onclick="window.switchDeptTab('Cytology')">Cytology</span>
            </div>
          </div>
          <div class="card-body" style="padding: 16px; display:grid; grid-template-columns: 20% 80%; gap: 16px;">
            <div style="border-right: 1px solid var(--border-color); padding-right:12px; display:flex; flex-direction:column; gap:10px;" id="dept-stats-panel">
              <!-- Department KPIs -->
            </div>
            <div style="overflow-x: auto;">
              <table style="width: 100%; border-collapse: collapse; font-size: 0.72rem;">
                <thead>
                  <tr style="border-bottom: 1px solid var(--border-color); text-align: left; background-color: #F8FAFC;">
                    <th style="padding: 6px;">Test Name</th>
                    <th style="padding: 6px; text-align: center;">Ordered</th>
                    <th style="padding: 6px; text-align: center;">In Process</th>
                    <th style="padding: 6px; text-align: center;">Completed</th>
                    <th style="padding: 6px; text-align: center;">Avg TAT</th>
                    <th style="padding: 6px; text-align: center;">Target TAT</th>
                    <th style="padding: 6px; text-align: right;">Compliance %</th>
                  </tr>
                </thead>
                <tbody id="dept-tests-table-body">
                  <!-- Dynamic test list -->
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-top: 16px;">
          <!-- SECTION 8 — REPORT DISPATCH TRACKER -->
          <div class="card" id="lis-dispatch-card">
            <div class="card-header" style="border-bottom: 1px solid var(--border-color); padding: 10px 16px;">
              <h3 style="font-size: 0.85rem; font-weight: 700; color: var(--text-primary); margin:0;">4. Dispatch & Delivery Tracker</h3>
            </div>
            <div class="card-body" style="padding: 12px; overflow-x: auto;">
              <table style="width: 100%; border-collapse: collapse; font-size: 0.7rem;">
                <thead>
                  <tr style="border-bottom: 1px solid var(--border-color); background-color: #F8FAFC; text-align:left;">
                    <th style="padding:6px;">Report No</th>
                    <th style="padding:6px;">Patient</th>
                    <th style="padding:6px;">Tests</th>
                    <th style="padding:6px;">Released At</th>
                    <th style="padding:6px;">Mode</th>
                    <th style="padding:6px;">Status</th>
                    <th style="padding:6px; text-align:right;">Action</th>
                  </tr>
                </thead>
                <tbody id="dispatch-tracker-body">
                  <!-- Dynamic rows -->
                </tbody>
              </table>
            </div>
          </div>

          <!-- SECTION 9 — NOTIFIABLE DISEASE LOG -->
          <div class="card" id="lis-notifiable-card">
            <div class="card-header" style="border-bottom: 1px solid var(--border-color); padding: 10px 16px;">
              <h3 style="font-size: 0.85rem; font-weight: 700; color: var(--text-primary); margin:0;">5. Integrated Notifiable Disease Log</h3>
            </div>
            <div class="card-body" style="padding: 12px; overflow-x: auto;">
              <table style="width: 100%; border-collapse: collapse; font-size: 0.7rem;">
                <thead>
                  <tr style="border-bottom: 1px solid var(--border-color); background-color: #F8FAFC; text-align:left;">
                    <th style="padding:6px;">Patient / UHID</th>
                    <th style="padding:6px;">Disease</th>
                    <th style="padding:6px;">Test / Result</th>
                    <th style="padding:6px;">CMO notified</th>
                    <th style="padding:6px;">Status</th>
                    <th style="padding:6px; text-align:right;">Action</th>
                  </tr>
                </thead>
                <tbody id="notifiable-log-body">
                  <!-- Dynamic rows -->
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- SECTION 10 — SHIFT SUMMARY (Manager only) -->
        <div class="card" id="lis-manager-summary-card" style="margin-top: 16px; display: none;">
          <div class="card-header" style="border-bottom: 1px solid var(--border-color); padding: 10px 16px;">
            <h3 style="font-size: 0.9rem; font-weight: 700; color: var(--text-primary); margin:0;">Shift Close checklist & Summary (Lab Manager Only)</h3>
          </div>
          <div class="card-body" style="padding: 16px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px;">
            <div style="background-color: var(--bg-surface-elevated); padding: 12px; border-radius: 6px; border: 1px solid var(--border-color);">
              <h4 style="font-weight:bold; font-size:0.78rem; margin-bottom:8px; color:var(--primary);">Shift Performance Indicators</h4>
              <div style="font-size: 0.72rem; line-height: 1.5; color: var(--text-secondary);">
                • Tests Ordered/Collected: 148 / 142<br>
                • TAT compliance: STAT 92% | Routine 96%<br>
                • Rejection Rate: 0.7% (NABL target <2%)<br>
                • Critical Value Alert Compliance: 100% (within 30m)
              </div>
            </div>
            <div style="background-color: var(--bg-surface-elevated); padding: 12px; border-radius: 6px; border: 1px solid var(--border-color);">
              <h4 style="font-weight:bold; font-size:0.78rem; margin-bottom:8px; color:var(--primary);">Quality Control Runs</h4>
              <div style="font-size: 0.72rem; line-height: 1.5; color: var(--text-secondary);">
                • QC Runs performed: 18 | Passed: 17 | Failed: 1<br>
                • Corrective Action logs filled: Yes<br>
                • Withheld results released: Post-corrective action
              </div>
            </div>
            <div style="background-color: var(--bg-surface-elevated); padding: 12px; border-radius: 6px; border: 1px solid var(--border-color); display:flex; flex-direction:column; justify-content:space-between;">
              <div>
                <h4 style="font-weight:bold; font-size:0.78rem; margin-bottom:8px; color:var(--primary);">Shift Checklist</h4>
                <div style="font-size: 0.65rem; color: var(--text-secondary);">
                  <label style="display:flex; align-items:center; gap:4px;"><input type="checkbox" checked> STAT specimens reported</label>
                  <label style="display:flex; align-items:center; gap:4px;"><input type="checkbox" checked> Critical value logs signed</label>
                  <label style="display:flex; align-items:center; gap:4px;"><input type="checkbox" checked> Reagent indents generated</label>
                </div>
              </div>
              <button class="btn btn-primary btn-sm" onclick="window.signOffShiftSummary()" style="width:100%; padding:4px; font-size:0.7rem; margin-top:8px;">Sign-off & Lock Shift</button>
            </div>
          </div>
        </div>

        <!-- SECTION 11 — NABL COMPLIANCE & AUDITS CENTER (Director/Admin/Manager only) -->
        <div class="card" id="lis-compliance-center-card" style="margin-top: 16px; display: none;">
          <div class="card-header" style="border-bottom: 1px solid var(--border-color); padding: 10px 16px; display:flex; justify-content:space-between; align-items:center; background-color:#F8FAFC;">
            <h3 style="font-size: 0.9rem; font-weight: 700; color: var(--text-primary); margin:0;">📊 NABL QA, Audit & Equipment Compliance Console</h3>
            <div style="display:flex; gap:8px;">
              <button class="btn btn-secondary btn-sm" onclick="window.exportComplianceReport('PDF')" style="padding:2px 8px; font-size:0.7rem; background-color:#FFF; border-color:#CBD5E1; color:#334155;">Export Daily Volume (PDF)</button>
              <button class="btn btn-secondary btn-sm" onclick="window.exportComplianceReport('Excel')" style="padding:2px 8px; font-size:0.7rem; background-color:#FFF; border-color:#CBD5E1; color:#334155;">Export TAT & Rejections (Excel)</button>
            </div>
          </div>
          <div class="card-body" style="padding: 16px; display:grid; grid-template-columns: 20% 80%; gap: 16px;">
            <div style="border-right: 1px solid var(--border-color); padding-right:12px; display:flex; flex-direction:column; gap:6px;">
              <button class="btn text-left text-[11px] font-semibold" id="btn-comp-audit" onclick="window.switchComplianceTab('audit')" style="width:100%; padding:6px; background:#EFF6FF; color:#1E40AF; text-align:left;">📜 Immutable LIS Audit Logs</button>
              <button class="btn text-left text-[11px] font-semibold" id="btn-comp-equip" onclick="window.switchComplianceTab('equip')" style="width:100%; padding:6px; text-align:left;">🎛️ Equipment Master & PM</button>
              <button class="btn text-left text-[11px] font-semibold" id="btn-comp-retain" onclick="window.switchComplianceTab('retain')" style="width:100%; padding:6px; text-align:left;">🧊 Sample Storage Retain</button>
            </div>
            
            <div style="overflow-y:auto; max-height:280px;">
              <!-- Compliance Table Container -->
              <div id="compliance-tab-content" style="font-size: 0.7rem;">
                <!-- filled dynamically -->
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- CRITICAL VALUE ACKNOWLEDGEMENT DIALOG (Section 1) -->
      <div id="crit-ack-modal" style="display: none; position: fixed; inset: 0; background: rgba(15, 23, 42, 0.6); backdrop-filter: blur(4px); z-index: 9999; align-items: center; justify-content: center; padding: 20px;">
        <div style="background: white; border-radius: 8px; width: 100%; max-width: 450px; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1); display: flex; flex-direction: column;">
          <div style="border-bottom: 1px solid var(--border-color); padding: 12px 16px; background-color: #FEF2F2; color: #991B1B; display:flex; justify-content:space-between; align-items:center;">
            <h3 style="margin: 0; font-size: 0.95rem; font-weight: 700;">📞 NABL Critical Value Communication Register</h3>
            <button onclick="window.closeCritModal()" style="font-size: 1.2rem; font-weight: bold; background: transparent; border: none; cursor: pointer; color: #991B1B;">&times;</button>
          </div>
          <div style="padding: 16px; font-size: 0.72rem; display: flex; flex-direction: column; gap: 10px;">
            <div id="crit-modal-detail" style="background:#FFF5F5; padding:8px; border:1px solid #FECDD3; border-radius:4px; color:#991B1B;">
              <!-- filled dynamically -->
            </div>
            <div>
              <label style="display:block; font-weight: 500; margin-bottom: 2px;">Informed To (Doctor / Attending Nurse) *</label>
              <input type="text" id="crit-modal-recipient" placeholder="E.g., Dr. Amit Sharma" style="width:100%; padding:5px; border:1px solid var(--border-color); border-radius:4px;">
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
              <div>
                <label style="display:block; font-weight: 500; margin-bottom: 2px;">Mode of Communication *</label>
                <select id="crit-modal-mode" style="width:100%; padding:5px; border:1px solid var(--border-color); border-radius:4px;">
                  <option value="Intercom">Intercom</option>
                  <option value="Phone Call">Phone Call</option>
                  <option value="In-Person">In-Person Direct</option>
                </select>
              </div>
              <div>
                <label style="display:block; font-weight: 500; margin-bottom: 2px;">Lab Staff Communicated *</label>
                <input type="text" id="crit-modal-staff" value="Pathologist Dr. Joshi" style="width:100%; padding:5px; border:1px solid var(--border-color); border-radius:4px;">
              </div>
            </div>
            <div style="border-top:1px solid var(--border-color); padding-top:10px; display:flex; justify-content:flex-end; gap:8px;">
              <button class="btn btn-secondary btn-sm" onclick="window.closeCritModal()">Cancel</button>
              <button class="btn btn-primary btn-sm" onclick="window.saveCriticalAck()" style="background-color: #EF4444; border-color: #EF4444;">
                Save to Register & Close
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- SAMPLE REJECTION DIALOG (Section 6a) -->
      <div id="sample-rejection-modal" style="display: none; position: fixed; inset: 0; background: rgba(15, 23, 42, 0.6); backdrop-filter: blur(4px); z-index: 9999; align-items: center; justify-content: center; padding: 20px;">
        <div style="background: white; border-radius: 8px; width: 100%; max-width: 450px; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1); display: flex; flex-direction: column;">
          <div style="border-bottom: 1px solid var(--border-color); padding: 12px 16px; background-color: #FFFBEB; color: #92400E; display:flex; justify-content:space-between; align-items:center;">
            <h3 style="margin: 0; font-size: 0.95rem; font-weight: 700;">⚠️ NABL Sample Rejection log</h3>
            <button onclick="window.closeRejectionModal()" style="font-size: 1.2rem; font-weight: bold; background: transparent; border: none; cursor: pointer; color: #92400E;">&times;</button>
          </div>
          <div style="padding: 16px; font-size: 0.72rem; display: flex; flex-direction: column; gap: 10px;">
            <div id="rejection-modal-detail" style="background:#FFFBEB; padding:8px; border:1px solid #FDE68A; border-radius:4px; color:#92400E;">
              <!-- filled dynamically -->
            </div>
            <div>
              <label style="display:block; font-weight: 500; margin-bottom: 2px;">Rejection Reason (NABL Standard) *</label>
              <select id="rejection-modal-reason" style="width:100%; padding:5px; border:1px solid var(--border-color); border-radius:4px;">
                <option value="Haemolysed">Haemolysed Sample</option>
                <option value="Clotted">Clotted (EDTA / Blue tube)</option>
                <option value="Insufficient volume">Insufficient volume</option>
                <option value="Wrong tube">Wrong Tube type</option>
                <option value="Unlabelled">Unlabelled Specimen</option>
                <option value="Leaking container">Leaking Container</option>
                <option value="Delayed transport">Delayed transport (>2h room temp)</option>
                <option value="Sample not as per requirement">Sample not as per requirement</option>
              </select>
            </div>
            <div>
              <label style="display:block; font-weight: 500; margin-bottom: 2px;">Action Taken / Comments *</label>
              <input type="text" id="rejection-modal-comment" placeholder="E.g., Doctor informed. Recollection order dispatched." style="width:100%; padding:5px; border:1px solid var(--border-color); border-radius:4px;">
            </div>
            <div style="border-top:1px solid var(--border-color); padding-top:10px; display:flex; justify-content:flex-end; gap:8px;">
              <button class="btn btn-secondary btn-sm" onclick="window.closeRejectionModal()">Cancel</button>
              <button class="btn btn-primary btn-sm" onclick="window.saveSampleRejection()" style="background-color: #D97706; border-color: #D97706;">
                Log Rejection & Trigger Recollection
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- SAMPLE RECEIPT TRAIL MODAL (Section 11) -->
      <div id="sample-trail-modal" style="display: none; position: fixed; inset: 0; background: rgba(15, 23, 42, 0.6); backdrop-filter: blur(4px); z-index: 9999; align-items: center; justify-content: center; padding: 20px;">
        <div style="background: white; border-radius: 8px; width: 100%; max-width: 500px; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1); display: flex; flex-direction: column; max-height: 80vh;">
          <div style="border-bottom: 1px solid var(--border-color); padding: 12px 16px; background-color: #F8FAFC; display:flex; justify-content:space-between; align-items:center;">
            <h3 style="margin: 0; font-size: 0.95rem; font-weight: 700; color: var(--text-primary);">🔬 NABL Sample Audit Trail</h3>
            <button onclick="window.closeTrailModal()" style="font-size: 1.2rem; font-weight: bold; background: transparent; border: none; cursor: pointer;">&times;</button>
          </div>
          <div style="padding: 16px; font-size: 0.72rem; overflow-y: auto; flex:1;">
            <div id="trail-modal-patient" style="font-weight:bold; margin-bottom:12px; border-bottom:1px solid var(--border-color); padding-bottom:6px;">
              <!-- dynamic -->
            </div>
            <div style="display:flex; flex-direction:column; gap:12px; border-left:2px solid #E2E8F0; padding-left:16px; margin-left:8px;" id="trail-modal-timeline">
              <!-- dynamic timeline -->
            </div>
          </div>
          <div style="border-top: 1px solid var(--border-color); padding: 10px 16px; display:flex; justify-content:flex-end;">
            <button class="btn btn-secondary btn-sm" onclick="window.closeTrailModal()">Close Audit log</button>
          </div>
        </div>
      </div>
      <!-- NEW LAB ORDER PLACEMENT MODAL -->
      <div id="new-lab-order-modal" style="display: none; position: fixed; inset: 0; background: rgba(15, 23, 42, 0.6); backdrop-filter: blur(4px); z-index: 9999; align-items: center; justify-content: center; padding: 20px;">
        <div style="background: white; border-radius: 8px; width: 100%; max-width: 500px; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1); display: flex; flex-direction: column;">
          <div style="border-bottom: 1px solid var(--border-color); padding: 12px 16px; background-color: #EFF6FF; color: #1e3a8a; display:flex; justify-content:space-between; align-items:center;">
            <h3 style="margin: 0; font-size: 0.95rem; font-weight: 700;">🏥 Order Placement & Billing Gate</h3>
            <button onclick="window.closeNewOrderModal()" style="font-size: 1.2rem; font-weight: bold; background: transparent; border: none; cursor: pointer; color: #1e3a8a;">&times;</button>
          </div>
          <div style="padding: 16px; font-size: 0.72rem; display: flex; flex-direction: column; gap: 10px;">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
              <div>
                <label style="display:block; font-weight: 500; margin-bottom: 2px;">Patient Type *</label>
                <select id="ord-patient-type" onchange="window.onOrdTypeChange()" style="width:100%; padding:5px; border:1px solid var(--border-color); border-radius:4px;">
                  <option value="OPD">OPD / Walk-in</option>
                  <option value="IPD">IPD (Admitted Ward)</option>
                </select>
              </div>
              <div>
                <label style="display:block; font-weight: 500; margin-bottom: 2px;">Patient Name / UHID *</label>
                <select id="ord-patient-id" style="width:100%; padding:5px; border:1px solid var(--border-color); border-radius:4px;">
                  <option value="MH-2026-9912">Aarav Mehta (MH-2026-9912)</option>
                  <option value="MH-2026-4802">Ramesh Kumar (MH-2026-4802)</option>
                  <option value="MH-2026-9081">Priya Devi (MH-2026-9081)</option>
                </select>
              </div>
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
              <div>
                <label style="display:block; font-weight: 500; margin-bottom: 2px;">Ordered By (Role) *</label>
                <select id="ord-by-role" onchange="window.onOrdRoleChange()" style="width:100%; padding:5px; border:1px solid var(--border-color); border-radius:4px;">
                  <option value="Doctor">Doctor</option>
                  <option value="Nurse">Ward Nurse</option>
                </select>
              </div>
              <div id="ord-auth-doc-group" style="display:none;">
                <label style="display:block; font-weight: 500; margin-bottom: 2px;">Authorizing Doctor *</label>
                <select id="ord-auth-doctor" style="width:100%; padding:5px; border:1px solid var(--border-color); border-radius:4px;">
                  <option value="Dr. Priya Nair">Dr. Priya Nair</option>
                  <option value="Dr. Srinivasan">Dr. Srinivasan</option>
                </select>
              </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
              <div>
                <label style="display:block; font-weight: 500; margin-bottom: 2px;">Payer Category *</label>
                <select id="ord-payer" onchange="window.onOrdPayerChange()" style="width:100%; padding:5px; border:1px solid var(--border-color); border-radius:4px;">
                  <option value="Self Pay">Self Pay / Cash</option>
                  <option value="Star Health">Star Health TPA</option>
                  <option value="CGHS">CGHS Panel</option>
                  <option value="PM-JAY">Ayushman Bharat (PM-JAY)</option>
                </select>
              </div>
              <div id="ord-auth-status-group">
                <label style="display:block; font-weight: 500; margin-bottom: 2px;">Pre-Authorization Status *</label>
                <select id="ord-auth-status" onchange="window.onOrdPayerChange()" style="width:100%; padding:5px; border:1px solid var(--border-color); border-radius:4px;">
                  <option value="Approved">Approved / Resolved</option>
                  <option value="Pending">Pending Pre-Auth Gate</option>
                  <option value="Self-pay-fallback">Self-pay Fallback</option>
                </select>
              </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
              <div>
                <label style="display:block; font-weight: 500; margin-bottom: 2px;">Test Code *</label>
                <select id="ord-test" style="width:100%; padding:5px; border:1px solid var(--border-color); border-radius:4px;">
                  <option value="CBC">Complete Blood Count (CBC)</option>
                  <option value="LFT">Liver Function Test (LFT)</option>
                  <option value="Electrolytes">Serum Electrolytes</option>
                  <option value="PT/INR">PT/INR Coagulation</option>
                </select>
              </div>
              <div>
                <label style="display:block; font-weight: 500; margin-bottom: 2px;">Priority *</label>
                <select id="ord-priority" style="width:100%; padding:5px; border:1px solid var(--border-color); border-radius:4px;">
                  <option value="Routine">Routine</option>
                  <option value="Urgent">Urgent</option>
                  <option value="STAT">STAT (Fast-Lane)</option>
                </select>
              </div>
            </div>

            <div id="new-order-billing-notice" style="background:#FFF5F5; padding:8px; border:1px solid #FECDD3; border-radius:4px; color:#EF4444; display:none;">
              ⚠️ Collection Blocked: Pre-auth is required for walk-in scheme orders before sample collection.
            </div>

            <div style="border-top:1px solid var(--border-color); padding-top:10px; display:flex; justify-content:flex-end; gap:8px;">
              <button class="btn btn-secondary btn-sm" onclick="window.closeNewOrderModal()">Cancel</button>
              <button id="btn-submit-order" class="btn btn-primary btn-sm" onclick="window.submitLabOrder()" style="background-color: #2563EB; border-color: #2563EB;">
                Place Order & Release
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- ATTACH PDF MODAL (Send-out referral result upload) -->
      <div id="upload-referral-modal" style="display: none; position: fixed; inset: 0; background: rgba(15, 23, 42, 0.6); backdrop-filter: blur(4px); z-index: 9999; align-items: center; justify-content: center; padding: 20px;">
        <div style="background: white; border-radius: 8px; width: 100%; max-width: 400px; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);">
          <div style="border-bottom: 1px solid var(--border-color); padding: 12px 16px; background-color: #F8FAFC; display:flex; justify-content:space-between; align-items:center;">
            <h3 style="margin: 0; font-size: 0.95rem; font-weight: 700;">📤 Import External PDF Result</h3>
            <button onclick="window.closeUploadReferralModal()" style="font-size: 1.2rem; font-weight: bold; background: transparent; border: none; cursor: pointer;">&times;</button>
          </div>
          <div style="padding: 16px; font-size: 0.72rem; display:flex; flex-direction:column; gap:10px;">
            <div id="upload-modal-patient" style="font-weight:bold; color:var(--text-primary);">
              <!-- dynamic -->
            </div>
            <div>
              <label style="display:block; font-weight: 500; margin-bottom: 2px;">Attach PDF File *</label>
              <input type="file" id="referral-pdf-file" accept="application/pdf" style="width:100%; padding:4px;">
            </div>
            <div style="border-top: 1px solid var(--border-color); padding-top:10px; display:flex; justify-content:flex-end; gap:8px;">
              <button class="btn btn-secondary btn-sm" onclick="window.closeUploadReferralModal()">Cancel</button>
              <button class="btn btn-primary btn-sm" onclick="window.saveReferralResult()" style="background-color: #10B981; border-color: #10B981;">Upload & Attach</button>
            </div>
          </div>
        </div>
      </div>

      <!-- BLOOD BANK SERVICES MODAL -->
      <div id="blood-bank-modal" style="display: none; position: fixed; inset: 0; background: rgba(15, 23, 42, 0.6); backdrop-filter: blur(4px); z-index: 9999; align-items: center; justify-content: center; padding: 20px;">
        <div style="background: white; border-radius: 8px; width: 100%; max-width: 650px; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1); display: flex; flex-direction: column;">
          <div style="border-bottom: 1px solid var(--border-color); padding: 12px 16px; background-color: #FEF2F2; color: #b91c1c; display:flex; justify-content:space-between; align-items:center;">
            <h3 style="margin: 0; font-size: 0.95rem; font-weight: 700; display:flex; align-items:center; gap:6px;">
              <span>🩸</span> Blood Bank Registry (Demarcated Module - License SB-9901)
            </h3>
            <button onclick="window.closeBloodBankModal()" style="font-size: 1.2rem; font-weight: bold; background: transparent; border: none; cursor: pointer; color: #b91c1c;">&times;</button>
          </div>
          <div style="padding: 16px; font-size: 0.72rem; display: flex; flex-direction: column; gap: 12px;">
            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:16px;">
              <div>
                <h4 style="font-weight:bold; color:#b91c1c; border-bottom:1px solid #FCA5A5; padding-bottom:3px; margin-bottom:6px;">Active Component Stock</h4>
                <div id="blood-stock-summary">
                  <!-- dynamic stock -->
                </div>
              </div>
              
              <div>
                <h4 style="font-weight:bold; color:#b91c1c; border-bottom:1px solid #FCA5A5; padding-bottom:3px; margin-bottom:6px;">Cross-Match & Reservation Queue</h4>
                <div style="display:flex; flex-direction:column; gap:6px;" id="blood-bank-crossmatches">
                  <!-- dynamic cross-matches -->
                </div>
              </div>
            </div>
            
            <div style="border-top:1px solid var(--border-color); padding-top:10px; display:flex; justify-content:space-between; align-items:center;">
              <span style="font-size:7px; color:var(--text-muted);">Form 27C / NABL Annexure E statutory logs audited automatically</span>
              <button class="btn btn-secondary btn-sm" onclick="window.closeBloodBankModal()">Close Registry</button>
            </div>
          </div>
        </div>
      </div>

      <!-- REPORT RELEASE MODAL (Pathologist Sign-Off Mode Selector) -->
      <div id="pathologist-signoff-modal" style="display: none; position: fixed; inset: 0; background: rgba(15, 23, 42, 0.6); backdrop-filter: blur(4px); z-index: 9999; align-items: center; justify-content: center; padding: 20px;">
        <div style="background: white; border-radius: 8px; width: 100%; max-width: 450px; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1) ;">
          <div style="border-bottom: 1px solid var(--border-color); padding: 12px 16px; background-color: #ECFDF5; color: #065F46; display:flex; justify-content:space-between; align-items:center;">
            <h3 style="margin: 0; font-size: 0.95rem; font-weight: 700;">✍️ Digital Sign-off & Report Release Authorization</h3>
            <button onclick="window.closePathologistSignoffModal()" style="font-size: 1.2rem; font-weight: bold; background: transparent; border: none; cursor: pointer; color: #065F46;">&times;</button>
          </div>
          <div style="padding: 16px; font-size: 0.72rem; display:flex; flex-direction:column; gap:10px;">
            <div id="signoff-modal-report-details" style="font-weight:bold; color:var(--text-primary);">
              <!-- dynamic -->
            </div>
            <div>
              <label style="display:block; font-weight: 500; margin-bottom: 2px;">Sign-off Mode *</label>
              <select id="signoff-modal-mode" style="width:100%; padding:5px; border:1px solid var(--border-color); border-radius:4px;">
                <option value="In-Person console sign-off">In-Person (Secure local digital signature card)</option>
                <option value="Remote 2-Factor verified sign-off">Remote Verification (OTP authenticated remote authorization)</option>
              </select>
            </div>
            <div style="background:#F0FDF4; border:1px solid #BBF7D0; padding:8px; border-radius:4px; color:#15803D;">
              <strong>Audit Trail Capture:</strong> Release actions are cryptographically signed under pathology credentials.
            </div>
            <div style="border-top:1px solid var(--border-color); padding-top:10px; display:flex; justify-content:flex-end; gap:8px;">
              <button class="btn btn-secondary btn-sm" onclick="window.closePathologistSignoffModal()">Cancel</button>
              <button class="btn btn-primary btn-sm" onclick="window.confirmPathologistValidate()" style="background-color: #059669; border-color: #059669;">Digitally Sign & Release</button>
            </div>
          </div>
        </div>
      </div>

      <!-- VERIFY & RECEIVE SAMPLE MODAL (Accessioning receipt gate) -->
      <div id="verify-receive-modal" style="display: none; position: fixed; inset: 0; background: rgba(15, 23, 42, 0.6); backdrop-filter: blur(4px); z-index: 9999; align-items: center; justify-content: center; padding: 20px;">
        <div style="background: white; border-radius: 8px; width: 100%; max-width: 450px; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);">
          <div style="border-bottom: 1px solid var(--border-color); padding: 12px 16px; background-color: #EFF6FF; color: #1e3a8a; display:flex; justify-content:space-between; align-items:center;">
            <h3 style="margin: 0; font-size: 0.95rem; font-weight: 700;">🔬 NABL Accessioning: Sample Receiving Gate</h3>
            <button onclick="window.closeReceiveModal()" style="font-size: 1.2rem; font-weight: bold; background: transparent; border: none; cursor: pointer; color:#1e3a8a;">&times;</button>
          </div>
          <div style="padding: 16px; font-size: 0.72rem; display: flex; flex-direction: column; gap: 10px;">
            <div id="receive-modal-details" style="background:#F8FAFC; border:1px solid var(--border-color); padding:8px; border-radius:4px; line-height:1.5;">
              <!-- dynamic -->
            </div>
            
            <div style="font-weight:bold; color:var(--text-primary); margin-top:4px;">NABL Compliance Checklist:</div>
            <div style="display:flex; flex-direction:column; gap:6px;">
              <label style="display:flex; align-items:center; gap:6px;"><input type="checkbox" id="chk-rec-barcode" checked> Barcode Label scans and patient details match</label>
              <label style="display:flex; align-items:center; gap:6px;"><input type="checkbox" id="chk-rec-container" checked> Correct clinical container/tube used</label>
              <label style="display:flex; align-items:center; gap:6px;"><input type="checkbox" id="chk-rec-qty" checked> Specimen quantity is adequate for testing</label>
              <label style="display:flex; align-items:center; gap:6px;"><input type="checkbox" id="chk-rec-cond" checked> Specimen condition is normal (not hemolysed/clotted/leaking)</label>
            </div>

            <div style="margin-top:6px; display:none;" id="receive-rejection-area">
              <label style="display:block; font-weight: 500; margin-bottom: 2px; color:#DC2626;">Rejection Reason *</label>
              <select id="receive-rejection-reason" style="width:100%; padding:5px; border:1px solid var(--border-color); border-radius:4px; margin-bottom:4px;">
                <option value="Incorrect Sample">Incorrect Sample</option>
                <option value="Wrong Container">Wrong Container</option>
                <option value="Insufficient Quantity (QNS)">Insufficient Quantity (QNS)</option>
                <option value="Clotted Sample">Clotted Sample</option>
                <option value="Hemolysed Sample">Hemolysed Sample</option>
                <option value="Leaking Container">Leaking Container</option>
                <option value="Improper Label">Improper Label</option>
              </select>
              <input type="text" id="receive-rejection-comments" placeholder="Comments..." style="width:100%; padding:5px; border:1px solid var(--border-color); border-radius:4px;">
            </div>

            <div style="border-top:1px solid var(--border-color); padding-top:10px; display:flex; justify-content:space-between; gap:8px;">
              <button class="btn btn-secondary btn-sm" onclick="window.toggleReceiveRejection()" style="border-color:#EF4444; color:#EF4444;">Toggle Rejection Mode</button>
              <div style="display:flex; gap:4px;">
                <button class="btn btn-secondary btn-sm" onclick="window.closeReceiveModal()">Cancel</button>
                <button class="btn btn-primary btn-sm" onclick="window.confirmReceiveSample()" id="btn-receive-confirm" style="background-color: #2563EB; border-color: #2563EB;">Accept & Process</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- RESULT ENTRY & VERIFICATION MODAL -->
      <div id="enter-result-dialog-modal" style="display: none; position: fixed; inset: 0; background: rgba(15, 23, 42, 0.6); backdrop-filter: blur(4px); z-index: 9999; align-items: center; justify-content: center; padding: 20px;">
        <div style="background: white; border-radius: 8px; width: 100%; max-width: 500px; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);">
          <div style="border-bottom: 1px solid var(--border-color); padding: 12px 16px; background-color: #EFF6FF; color: #1e3a8a; display:flex; justify-content:space-between; align-items:center;">
            <h3 style="margin: 0; font-size: 0.95rem; font-weight: 700;">✍️ Diagnostic Result Entry & Microscopic Logs</h3>
            <button onclick="window.closeEnterResultDialogModal()" style="font-size: 1.2rem; font-weight: bold; background: transparent; border: none; cursor: pointer; color:#1e3a8a;">&times;</button>
          </div>
          <div style="padding: 16px; font-size: 0.72rem; display: flex; flex-direction: column; gap: 10px;">
            <div id="result-modal-details" style="background:#F8FAFC; border:1px solid var(--border-color); padding:8px; border-radius:4px; line-height:1.5;">
              <!-- dynamic -->
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
              <div>
                <label style="display:block; font-weight: 500; margin-bottom: 2px;">Parameter Reading *</label>
                <input type="text" id="result-modal-value" placeholder="E.g., 4.2 or Reactive" style="width:100%; padding:5px; border:1px solid var(--border-color); border-radius:4px;">
              </div>
              <div>
                <label style="display:block; font-weight: 500; margin-bottom: 2px;">Instrument / Bench *</label>
                <select id="result-modal-bench" style="width:100%; padding:5px; border:1px solid var(--border-color); border-radius:4px;">
                  <option value="Mindray BC-5150">Mindray BC-5150 Cell Counter</option>
                  <option value="Erba Chem 7">Erba Chem 7 Biochemistry</option>
                  <option value="Transasia EM-200">Transasia EM-200 Fully Auto</option>
                  <option value="Manual bench microscopy">Manual bench microscopy</option>
                </select>
              </div>
            </div>

            <div>
              <label style="display:block; font-weight: 500; margin-bottom: 2px;">Microscopic Observations / Comments</label>
              <textarea id="result-modal-comments" rows="2" placeholder="E.g. RBC normal morphology, push cells seen, etc." style="width:100%; padding:5px; border:1px solid var(--border-color); border-radius:4px; font-family:inherit;"></textarea>
            </div>

            <div style="background:#F1F5F9; border:1px solid #E2E8F0; padding:8px; border-radius:4px; color:#475569; display:flex; flex-direction:column; gap:2px;">
              <strong>Delta-Check (Historical comparison):</strong>
              <span id="result-modal-delta-check">Prior tests: None recorded.</span>
            </div>

            <div style="border-top: 1px solid var(--border-color); padding-top:10px; display:flex; justify-content:flex-end; gap:8px;">
              <button class="btn btn-secondary btn-sm" onclick="window.closeEnterResultDialogModal()">Cancel</button>
              <button class="btn btn-primary btn-sm" onclick="window.saveEnterResultDialog()" style="background-color: #2563EB; border-color: #2563EB;">Submit for Pathologist Validation</button>
            </div>
          </div>
        </div>
      </div>
    `;

    // Initialize all templates
    window.renderCriticalBanner();
    window.renderKpis();
    window.renderActions();
    window.renderPhlebotomyQueue();
    window.renderWorklist();
    window.renderValidationQueue();
    window.renderQcViolations();
    window.renderOutsourceRegister();
    window.renderReagents();
    window.switchDeptTab('Haematology');
    window.renderDispatchTracker();
    window.renderNotifiableLog();
    window.renderRecollectionAlerts();
    window.applyRoleVisibilityRules(activeRole);
  };

  // SWITCH LAB ROLE
  window.switchLabRole = function(role) {
    localStorage.setItem('saronil_active_lab_role', role);
    if (window.activeLisContainer) {
      window.views.labDashboard(window.activeLisContainer);
    }
  };

  // RENDER: CRITICAL PANIC VALUE BANNER
  window.renderCriticalBanner = function() {
    const banner = document.getElementById('lis-critical-banner');
    const container = document.getElementById('critical-rows-container');
    if (!banner || !container) return;

    const list = window.state.criticalValues.filter(c => c.status === 'Pending');
    if (list.length === 0) {
      banner.style.display = 'none';
      return;
    }

    banner.style.display = 'block';
    container.innerHTML = list.map(c => {
      let rowClass = "crit-row";
      if (c.elapsedMins > 30) {
        rowClass += " crit-row-overdue";
      }

      return `
        <div class="${rowClass}">
          <div style="display:flex; align-items:center; gap:8px;">
            <span style="font-weight:900; font-size:14px;">⚠️</span>
            <span>
              <strong style="color:var(--color-primary); text-decoration:underline; cursor:pointer;" onclick="router.navigate('patients?uhid=${c.uhid}')">${c.patientName} (${c.uhid})</strong> · IP/OP No: <span class="admin-mono font-semibold">${c.ipop}</span> · 
              Test: <span style="font-weight:bold;" class="admin-mono">${c.test}: ${c.value}</span> · 
              For ${c.doctor} · Ward: ${c.ward}
            </span>
          </div>
          <div style="display:flex; align-items:center; gap:8px;">
            <span class="admin-mono" style="font-weight:bold; color:${c.elapsedMins > 30 ? '#EF4444' : '#F59E0B'}">${c.elapsedMins} min elapsed</span>
            <button class="btn btn-sm btn-primary" onclick="window.openCritAckModal(${c.id})" style="padding:2px 6px; font-size:9px; background-color:#EF4444; border-color:#EF4444;">Call & Acknowledge</button>
            <button class="btn btn-sm btn-secondary" onclick="window.escalateToPathologist(${c.id})" style="padding:2px 6px; font-size:9px;">Escalate to Pathologist</button>
          </div>
        </div>
      `;
    }).join('');
  };

  // CRITICAL VALUE ACTIONS
  window.openCritAckModal = function(id) {
    const item = window.state.criticalValues.find(c => c.id === id);
    if (!item) return;

    window.activeCriticalId = id;
    
    const detail = document.getElementById('crit-modal-detail');
    detail.innerHTML = `
      <strong>Patient:</strong> ${item.patientName} (${item.uhid})<br>
      <strong>Test:</strong> ${item.test} : <span class="admin-mono font-bold">${item.value}</span><br>
      <strong>Sponsor/Doc:</strong> ${item.doctor}
    `;

    document.getElementById('crit-modal-recipient').value = item.doctor.split(' (')[0];
    document.getElementById('crit-ack-modal').style.display = 'flex';
  };

  window.closeCritModal = function() {
    document.getElementById('crit-ack-modal').style.display = 'none';
  };

  window.saveCriticalAck = function() {
    const id = window.activeCriticalId;
    const item = window.state.criticalValues.find(c => c.id === id);
    if (!item) return;

    const recipient = document.getElementById('crit-modal-recipient').value.trim();
    const mode = document.getElementById('crit-modal-mode').value;
    const staff = document.getElementById('crit-modal-staff').value.trim();

    if (!recipient || !staff) {
      alert("Please fill in the doctor/attendant recipient and communicating staff member.");
      return;
    }

    // Save to critical values registry log (NABL Compliance audit trial)
    const log = {
      patientName: item.patientName,
      uhid: item.uhid,
      test: item.test,
      value: item.value,
      informedTo: recipient,
      mode: mode,
      time: new Date().toLocaleTimeString('en-IN'),
      staff: staff,
      compliance: item.elapsedMins <= 30 ? "Within 30m" : "Breached (>30m)"
    };

    window.state.criticalAckRegister.unshift(log);
    item.status = "Acknowledged";

    window.renderCriticalBanner();
    window.closeCritModal();
    alert("Critical Value communication successfully saved to the NABL audited register.");
  };

  window.escalateToPathologist = function(id) {
    const item = window.state.criticalValues.find(c => c.id === id);
    if (item) {
      window.state.lisAuditLogs.unshift({
        timestamp: new Date().toLocaleTimeString('en-IN') + ' ' + new Date().toLocaleDateString('en-IN'),
        user: "LIS System",
        action: "Critical Value Escalated",
        details: `Critical value for ${item.patientName} (${item.test}: ${item.value}) escalated to duty Pathologist.`
      });
      if (window.renderLisAuditLogs) window.renderLisAuditLogs();
      alert(`Alert dispatched to duty Pathologist and Lab Manager console for ${item.patientName}.`);
    }
  };

  // RENDER: KPI GRID CARDS (Role filtered)
  window.renderKpis = function() {
    const grid = document.getElementById('lis-kpi-grid');
    if (!grid) return;

    const role = localStorage.getItem('saronil_active_lab_role') || 'Lab Technician';
    let html = '';
    let stats = [];

    // Group 1: Pathologists & Medical Consultants
    if (role === 'Pathologist' || role === 'Microbiologist' || role === 'Biochemist' || role === 'Histopathologist') {
      stats = [
        { label: "Pending Validation", val: `${window.state.validationQueue.length} Reports`, sub: "Awaiting final sign-off" },
        { label: "Critical Panic Unack", val: `${window.state.criticalValues.filter(c => c.status === 'Pending').length} Alerts`, sub: "Active timeout watch" },
        { label: "Abnormal High/Low", val: "22 Results", sub: "Awaiting pathologist check" },
        { label: "Delta Check Alerts", val: "3 Cases", sub: "Prior result differences" },
        { label: "QC Status Board", val: "NABL Pass", sub: "2 control cycles verified" },
        { label: "Culture sensitivity >72h", val: "1 Culture", sub: "Microbiology watch" },
        { label: "Amended Reports", val: "0 Today", sub: "NABL audited cases" },
        { label: "Notifiable Disease Logs", val: `${window.state.notifiableDiseaseLog.length} Registered`, sub: "Nikshay / IDSP logged" }
      ];
    }
    // Group 2: Directors, Administrators, Managers & Supervisors
    else if (role === 'Lab Director' || role === 'Lab Manager' || role === 'Hospital Administrator' || role === 'Lab Supervisor') {
      stats = [
        { label: "Total Tests Today", val: "380 Tests", sub: "OPD 240 | IPD 140" },
        { label: "TAT Compliance Rate", val: "94.8%", sub: "NABL benchmark >90%" },
        { label: "TAT Breaches", val: "1 Case", sub: "Escalated for review" },
        { label: "Sample Rejection Rate", val: "0.7%", sub: "NABL target <2%" },
        { label: "Critical Value Compliance", val: "100%", sub: "Communication within 30m" },
        { label: "Low Stock Reagents", val: `${window.state.reagentAlerts.length} Alerts`, sub: "Indent tickets spooled" },
        { label: "Calibrations Overdue", val: `${window.state.lisEquipments.filter(e => e.status === 'Calibration Due').length} Analyzer`, sub: "Action required on EM-200" },
        { label: "Active Blood Component Stock", val: "35 Bags", sub: "Packed RBC, Platelets, FFP" }
      ];
    }
    // Group 3: Phlebotomists, Ward Nurses, Front Office, Billing, Lab Reception
    else if (role === 'Phlebotomist' || role === 'Ward Nurse' || role === 'Billing Executive' || role === 'Front Office' || role === 'Lab Reception') {
      stats = [
        { label: "Samples Pending Collection", val: `${window.state.phlebotomyQueue.filter(p => p.status === 'Pending').length} Samples`, sub: "Phlebotomy queue" },
        { label: "STAT Lane", val: `${window.state.phlebotomyQueue.filter(p => p.priority === 'STAT').length} Urgent`, sub: "Top fast-track lanes" },
        { label: "In Collection", val: `${window.state.phlebotomyQueue.filter(p => p.status === 'In Collection').length} Samples`, sub: "Phlebotomist in transit" },
        { label: "Collection Started", val: `${window.state.phlebotomyQueue.filter(p => p.status === 'Collection Started').length} Samples`, sub: "Bedside status" },
        { label: "Pre-Auth Blocked", val: `${window.state.phlebotomyQueue.filter(p => p.schemeAuthStatus === 'Pending' && !p.source.includes('PVT')).length} Samples`, sub: "OPD scheme pre-auth gate" },
        { label: "Recollection Alerts", val: `${window.state.recollectionAlerts.filter(a => a.status === 'Pending Action').length} Active`, sub: "Closed-loop recollects" },
        { label: "Blood Components Cross-Matched", val: `${window.state.bloodBankCrossMatches.filter(m => m.status === 'Cross-Matched & Reserved').length} Reserved`, sub: "Crossmatched & reserved" },
        { label: "Released Today", val: "112 Reports", sub: "Delivered to portal/counter" }
      ];
    }
    // Default Group: Technicians, Executives, Referring Doctors
    else {
      stats = [
        { label: "Tests Ordered Today", val: "148 Tests", sub: "OPD 90 | IPD 58" },
        { label: "STAT / Urgent", val: `${window.state.phlebotomyQueue.filter(p => p.priority === 'STAT').length} specimens`, sub: "STAT lane priority" },
        { label: "Pending Collection", val: `${window.state.phlebotomyQueue.filter(p => p.status === 'Pending').length} Samples`, sub: "In collection queue" },
        { label: "Tests In Process", val: `${window.state.processingWorklist.length} Specimens`, sub: "On analyzer/Manual" },
        { label: "Results Entered", val: `${window.state.processingWorklist.filter(w => w.status === 'Result Entered').length} Samples`, sub: "Awaiting verification" },
        { label: "Sample Rejections", val: `${window.state.rejectionRegister.length} Cases`, sub: "NABL log registered" },
        { label: "Outsource Referral", val: `${window.state.outsourceRegister.length} Panels`, sub: "Dispatched to SRL/Lal" },
        { label: "Reagents Low Alerts", val: `${window.state.reagentAlerts.length} Items`, sub: "Inventory stock count" }
      ];
    }

    html = stats.map(s => {
      let valClass = "text-slate-900";
      if (s.label.includes('Critical') || s.label.includes('Breaches') || s.label.includes('Overdue')) {
        valClass = "text-red-600 font-extrabold";
      } else if (s.label.includes('Pending') || s.label.includes('Reagent')) {
        valClass = "text-amber-600 font-bold";
      } else if (s.label.includes('Compliance') || s.label.includes('Pass') || s.label.includes('Cross-Matched')) {
        valClass = "text-emerald-600 font-bold";
      }

      return `
        <div class="bg-white rounded-lg border border-slate-200 p-3 flex flex-col justify-between" style="min-height: 95px; box-shadow: 0 1px 2px rgba(0,0,0,0.05);">
          <div>
            <div class="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">${s.label}</div>
            <div class="text-base font-bold tracking-tight mt-1 ${valClass}">${s.val}</div>
          </div>
          <div class="text-[9px] text-slate-400 font-medium mt-1">${s.sub}</div>
        </div>
      `;
    }).join('');

    grid.innerHTML = html;
  };

  // RENDER: QUICK ACTION BAR
  window.renderActions = function() {
    const container = document.getElementById('lis-actions-container');
    if (!container) return;

    const role = localStorage.getItem('saronil_active_lab_role') || 'Lab Technician';
    let html = '';

    if (role === 'Lab Technician' || role === 'Lab Executive') {
      html = `
        <button class="btn btn-primary btn-sm" onclick="window.openNewOrderModal()">➕ Place Lab Order</button>
        <button class="btn btn-secondary btn-sm" onclick="window.mockCollectSample()">🧪 Collect Sample</button>
        <button class="btn btn-secondary btn-sm" onclick="window.mockPrintLabels()">🏷️ Print Labels</button>
        <button class="btn btn-secondary btn-sm" onclick="window.mockRejectSample()">❌ Reject Sample</button>
        <button class="btn btn-secondary btn-sm" onclick="window.openBloodBankModal()">🩸 Blood Bank Registry</button>
      `;
    } else if (role === 'Pathologist') {
      html = `
        <button class="btn btn-primary btn-sm" onclick="window.mockValidateReport()">✅ Validate Report</button>
        <button class="btn btn-secondary btn-sm" onclick="window.mockReleaseReport()">📄 Release Report</button>
        <button class="btn btn-secondary btn-sm" onclick="window.openBloodBankModal()">🩸 Blood Bank Registry</button>
        <button class="btn btn-secondary btn-sm" onclick="window.mockNotifyDisease()">🔔 Flag Notifiable Disease</button>
      `;
    } else if (role === 'Lab Manager') {
      html = `
        <button class="btn btn-primary btn-sm" onclick="window.mockTatReport()">📈 TAT Indicators</button>
        <button class="btn btn-secondary btn-sm" onclick="window.mockQcSummary()">📊 QC Summary</button>
        <button class="btn btn-secondary btn-sm" onclick="window.mockReagentIndent()">📦 Reagent Indent</button>
        <button class="btn btn-secondary btn-sm" onclick="window.mockOutsourceReg()">📑 Outsource Register</button>
        <button class="btn btn-secondary btn-sm" onclick="window.openBloodBankModal()">🩸 Blood Bank Registry</button>
      `;
    }
 
    html += `
      <button class="btn btn-secondary btn-sm" style="background:#1d4ed8; color:#fff;" onclick="window.showStockRequestOverlay({dept:'Laboratory', urgency:'Routine'})">📦 Request Stock</button>
    `;

    container.innerHTML = html;
  };

  // RENDER: Column 1 - Phlebotomy Collection Queue
  window.renderPhlebotomyQueue = function(filterVal = 'all') {
    const container = document.getElementById('phleb-queue-container');
    if (!container) return;

    let list = window.state.phlebotomyQueue;
    if (filterVal === 'STAT') {
      list = list.filter(p => p.priority === 'STAT');
    } else if (filterVal === 'IPD') {
      list = list.filter(p => p.source.includes('PVT') || p.source.includes('GW') || p.source.includes('SP') || p.source.includes('Ward'));
    } else if (filterVal === 'Home') {
      list = list.filter(p => p.source.includes('Home'));
    }

    const renderSpecimenRow = (p) => {
      const tubesHTML = (p.tubes || []).map(t => {
        let capColor = "#E2E8F0";
        if (t === 'lavender') capColor = "#C084FC";
        else if (t === 'red') capColor = "#F87171";
        else if (t === 'blue') capColor = "#60A5FA";
        else if (t === 'yellow') capColor = "#FBBF24";
        return `<span class="tube-dot" style="background-color:${capColor};" title="${t} tube"></span>`;
      }).join('');

      let priorityClass = "badge-priority-routine";
      if (p.priority === 'STAT') priorityClass = "badge-priority-stat";
      else if (p.priority === 'Urgent') priorityClass = "badge-priority-urgent";

      let signWarningHtml = '';
      if (p.orderedByRole === 'nurse' && !p.doctorCountersignedAt) {
        signWarningHtml = `
          <div style="display:flex; justify-content:space-between; align-items:center; background-color:#FEF3C7; padding:4px 8px; border-radius:4px; margin-top:4px; font-size:7px; color:#92400E; font-weight:bold; border: 1px solid #FCD34D;">
            <span>⚠️ Nurse Entered (Pending Dr. Countersign)</span>
            <button class="btn btn-secondary text-[8px]" onclick="window.doctorCountersign('${p.accNo}')" style="padding:1px 3px; font-size:7px; background-color:#FFF; border:1px solid #D97706; color:#D97706;">Countersign</button>
          </div>
        `;
      } else if (p.doctorCountersignedAt) {
        signWarningHtml = `
          <div style="background-color:#ECFDF5; padding:4px 8px; border-radius:4px; margin-top:4px; font-size:7px; color:#065F46; font-weight:bold; border: 1px solid #A7F3D0;">
            ✓ Doctor Countersigned (${p.doctorCountersignedAt})
          </div>
        `;
      }

      let isIPD = p.source.includes('PVT') || p.source.includes('GW') || p.source.includes('SP') || p.source.includes('Ward');
      let isBlocked = p.schemeAuthStatus === 'Pending' && !isIPD;
      
      let actionButtons = '';
      if (isBlocked) {
        actionButtons = `
          <div style="display:flex; flex-direction:column; align-items:flex-end; gap:2px;">
            <span style="color:#EF4444; font-weight:bold; font-size:8px; display:flex; align-items:center; gap:2px;">🔒 Blocked</span>
            <span style="font-size:7px; color:#EF4444; opacity:0.8; text-align:right; margin-bottom:2px;">Scheme Auth Pending</span>
            <button class="btn btn-secondary text-[8px]" onclick="window.triggerEmergencyOverride('${p.accNo}')" style="padding:1px 3px; font-size:7px; border-color:#EF4444; color:#EF4444; background:#FFF5F5;">Emergency Override</button>
          </div>
        `;
      } else if (p.status === 'Collected') {
        actionButtons = `
          <button class="btn text-[9px]" onclick="window.openReceiveModal('${p.accNo}')" style="padding:2px 4px; background-color:#10B981; color:white; border:none; font-weight:bold; border-radius:4px;">Verify & Accession</button>
        `;
      } else if (p.status === 'In Collection' || p.status === 'Collection Started') {
        actionButtons = `
          <button class="btn text-[9px]" onclick="window.markCollected('${p.accNo}')" style="padding:2px 4px; background-color:#F59E0B; color:white; border:none; border-radius:4px;">Mark Collected</button>
        `;
      } else {
        actionButtons = `
          <button class="btn btn-primary text-[9px]" onclick="window.markCollected('${p.accNo}')" style="padding:2px 4px; background-color:#2563EB;">Collect</button>
          <button class="btn btn-secondary text-[9px]" onclick="window.openRejectionModal('${p.accNo}')" style="padding:2px 4px; border-color:#EF4444; color:#EF4444;">Reject</button>
        `;
      }

      let payerLabel = p.payerType ? `<span style="background-color:#F1F5F9; color:#475569; font-size:8px; padding:1px 4px; border-radius:3px; border:1px solid #E2E8F0;">${p.payerType}</span>` : '';

      return `
        <div style="border: 1px solid var(--border-color); border-radius: 6px; padding: 10px; background-color: white; font-size: 0.72rem; display:flex; flex-direction:column; gap:4px;">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <div style="display:flex; align-items:center; gap:4px;">
              <span class="admin-mono font-bold" style="font-size:0.7rem; cursor:pointer;" onclick="window.reprintBarcodeLabel('${p.accNo}')" title="Click to reprint barcode label">🏷️ ${p.accNo}</span>
              ${payerLabel}
            </div>
            <span class="badge ${priorityClass}" style="font-size:8px; padding:1px 4px;">${p.priority}</span>
          </div>
          <div>
            <div style="font-weight:600; color:var(--text-primary);">${p.name} (${p.uhid})</div>
            <div style="color:var(--text-secondary); font-size:0.68rem;">Source: ${p.source} · Doctor: ${p.doctor}</div>
          </div>
          ${signWarningHtml}
          <div style="border-top:1px dashed var(--border-color); padding-top:4px; margin-top:2px; display:flex; justify-content:space-between; align-items:center;">
            <div>
              <div style="font-weight:500; font-size:0.65rem;">Tests: ${p.tests}</div>
              <div style="display:flex; align-items:center; margin-top:2px;">${tubesHTML}</div>
            </div>
            <div style="display:flex; gap:2px; align-items:center;">
              ${actionButtons}
            </div>
          </div>
        </div>
      `;
    };

    const statSpecimens = list.filter(p => p.priority === 'STAT');
    const routineSpecimens = list.filter(p => p.priority !== 'STAT');

    let statHtml = '';
    if (statSpecimens.length > 0 && filterVal !== 'STAT') {
      statHtml = `
        <div style="background-color: #FEF2F2; border: 1px solid #FCA5A5; border-radius: 6px; padding: 8px; margin-bottom: 10px;">
          <div style="font-weight: 900; color: #EF4444; font-size: 0.72rem; display: flex; align-items: center; gap: 4px; margin-bottom: 6px; animation: critical-pulse 2s infinite ease-in-out;">
            <span>⚡</span> STAT FAST-LANE (Bypasses Queue)
          </div>
          <div style="display:flex; flex-direction:column; gap:6px;">
            ${statSpecimens.map(p => renderSpecimenRow(p)).join('')}
          </div>
        </div>
      `;
    }

    container.innerHTML = statHtml + `
      <div style="display:flex; flex-direction:column; gap:6px;">
        ${(filterVal === 'STAT' ? statSpecimens : routineSpecimens).map(p => renderSpecimenRow(p)).join('') || `<div style="text-align:center; padding:10px; color:var(--text-muted);">No pending specimens.</div>`}
      </div>
    `;
  };

  window.filterPhlebQueue = function(type) {
    const buttons = ['all', 'stat', 'ipd', 'home'];
    buttons.forEach(b => {
      const el = document.getElementById('phleb-filter-' + b);
      if (el) {
        el.classList.remove('btn-primary');
        el.classList.add('btn-secondary');
      }
    });

    const activeEl = document.getElementById('phleb-filter-' + type.toLowerCase());
    if (activeEl) {
      activeEl.classList.remove('btn-secondary');
      activeEl.classList.add('btn-primary');
    }

    window.renderPhlebotomyQueue(type);
  };

  window.reprintBarcodeLabel = function(accNo) {
    window.state.lisAuditLogs.unshift({
      timestamp: new Date().toLocaleTimeString('en-IN') + ' ' + new Date().toLocaleDateString('en-IN'),
      user: localStorage.getItem('saronil_active_lab_role') || 'Lab Technician',
      action: "Barcode Reprinted",
      details: `Barcode reprint executed for specimen: ${accNo}. Reprint counter incremented.`
    });
    if (window.renderLisAuditLogs) window.renderLisAuditLogs();
    alert(`Audit Trail Logged:\nBarcode label printed successfully for specimen: ${accNo}`);
  };

  window.markCollected = function(accNo) {
    const sample = window.state.phlebotomyQueue.find(p => p.accNo === accNo);
    if (!sample) return;

    sample.status = "Collected";
    
    // Add audit log
    window.state.lisAuditLogs.unshift({
      timestamp: new Date().toLocaleTimeString('en-IN') + ' ' + new Date().toLocaleDateString('en-IN'),
      user: "Phlebotomist",
      action: "Sample Collected",
      details: `Sample collected at bedside/clinic for ${sample.name}. Barcode scan linked.`
    });

    window.renderPhlebotomyQueue();
    window.renderKpis();
    if (window.renderLisAuditLogs) window.renderLisAuditLogs();
    alert(`Specimen ${accNo} status set to Collected. Awaiting lab receiving verification.`);
  };

  window.openReceiveModal = function(accNo) {
    const item = window.state.phlebotomyQueue.find(p => p.accNo === accNo);
    if (!item) return;

    window.activeReceiveAccNo = accNo;

    const detailsDiv = document.getElementById('receive-modal-details');
    detailsDiv.innerHTML = `
      <strong>Patient Name:</strong> ${item.name} (${item.uhid})<br>
      <strong>Specimen Accession No:</strong> <span class="admin-mono font-bold">${item.accNo}</span><br>
      <strong>Test Requested:</strong> ${item.tests} [Container: ${item.tubes.join(', ')}]<br>
      <strong>Source / Clinic:</strong> ${item.source} (${item.payerType})
    `;

    document.getElementById('chk-rec-barcode').checked = true;
    document.getElementById('chk-rec-container').checked = true;
    document.getElementById('chk-rec-qty').checked = true;
    document.getElementById('chk-rec-cond').checked = true;

    document.getElementById('receive-rejection-area').style.display = 'none';
    document.getElementById('btn-receive-confirm').innerHTML = "Accept & Process";
    document.getElementById('btn-receive-confirm').style.backgroundColor = "#2563EB";
    document.getElementById('btn-receive-confirm').style.borderColor = "#2563EB";
    window.receiveRejectionMode = false;

    document.getElementById('verify-receive-modal').style.display = 'flex';
  };

  window.closeReceiveModal = function() {
    document.getElementById('verify-receive-modal').style.display = 'none';
  };

  window.toggleReceiveRejection = function() {
    const area = document.getElementById('receive-rejection-area');
    const btn = document.getElementById('btn-receive-confirm');
    window.receiveRejectionMode = !window.receiveRejectionMode;
    if (window.receiveRejectionMode) {
      area.style.display = 'block';
      btn.innerHTML = "Reject & Recollect";
      btn.style.backgroundColor = "#DC2626";
      btn.style.borderColor = "#DC2626";
    } else {
      area.style.display = 'none';
      btn.innerHTML = "Accept & Process";
      btn.style.backgroundColor = "#2563EB";
      btn.style.borderColor = "#2563EB";
    }
  };

  window.confirmReceiveSample = function() {
    const accNo = window.activeReceiveAccNo;
    const item = window.state.phlebotomyQueue.find(p => p.accNo === accNo);
    if (!item) return;

    if (window.receiveRejectionMode) {
      const reason = document.getElementById('receive-rejection-reason').value;
      const comments = document.getElementById('receive-rejection-comments').value.trim();

      window.state.phlebotomyQueue = window.state.phlebotomyQueue.filter(p => p.accNo !== accNo);

      window.state.rejectionRegister.unshift({
        accNo: accNo,
        name: item.name,
        uhid: item.uhid,
        test: item.tests,
        reason: reason,
        comment: comments || "Specimen failed accession criteria check.",
        date: new Date().toLocaleDateString('en-IN'),
        technician: "Tech Amit"
      });

      window.state.recollectionAlerts.unshift({
        id: "REC-" + Math.floor(100 + Math.random()*900),
        patientName: item.name,
        uhid: item.uhid,
        test: item.tests,
        reason: reason,
        status: "Pending Action",
        notifiedAt: "Just now",
        source: "Lab Accession Bench"
      });

      window.state.lisAuditLogs.unshift({
        timestamp: new Date().toLocaleTimeString('en-IN') + ' ' + new Date().toLocaleDateString('en-IN'),
        user: "Tech Amit (EMP-902)",
        action: "Sample Rejected",
        details: `Accession rejected for ${item.name} (${accNo}). Reason: ${reason}`
      });

      // Sync rejection back to EMR order
      if (accNo.startsWith("SPEC-ORD-")) {
        const orderId = accNo.replace("SPEC-ORD-", "");
        const order = window.state.orders.find(o => o.id === orderId);
        if (order) order.status = "Rejected";
      }

      alert(`Sample rejected. Recollection request generated.`);
    } else {
      window.state.phlebotomyQueue = window.state.phlebotomyQueue.filter(p => p.accNo !== accNo);

      window.state.processingWorklist.unshift({
        specId: accNo,
        name: item.name,
        uhid: item.uhid,
        test: item.tests,
        dept: item.tests.includes('CBC') ? "Haematology" : (item.tests.includes('LFT') || item.tests.includes('Potassium') ? "Biochemistry" : "Serology"),
        analyzer: item.tests.includes('CBC') ? "Mindray BC-5150" : "Erba Chem 7",
        time: "Just received",
        elapsedMins: 0,
        targetHrs: 2,
        status: "Received in Lab"
      });

      window.state.lisSampleStorage.unshift({
        sampleId: accNo,
        patientName: item.name,
        rackNo: "RACK-T" + Math.floor(1+Math.random()*9),
        rowNo: "ROW-" + Math.floor(1+Math.random()*5),
        retainDate: new Date().toISOString().split('T')[0],
        disposalDate: new Date(Date.now() + 7*24*60*60*1000).toISOString().split('T')[0],
        status: "Retained"
      });

      window.state.lisAuditLogs.unshift({
        timestamp: new Date().toLocaleTimeString('en-IN' ) + ' ' + new Date().toLocaleDateString('en-IN'),
        user: "Tech Amit (EMP-902)",
        action: "Sample Received",
        details: `Sample ${accNo} received and accessioned at Lab Prep Bench.`
      });

      // Sync acceptance back to EMR order (set as Sample Collected)
      if (accNo.startsWith("SPEC-ORD-")) {
        const orderId = accNo.replace("SPEC-ORD-", "");
        const order = window.state.orders.find(o => o.id === orderId);
        if (order) order.status = "Sample Collected";
      }

      alert(`Sample ${accNo} received and assigned to processing bench.`);
    }

    window.renderPhlebotomyQueue();
    window.renderWorklist();
    window.renderRecollectionAlerts();
    window.renderKpis();
    if (window.renderLisAuditLogs) window.renderLisAuditLogs();
    window.closeReceiveModal();
  };

  // REJECTION LOG DIALOG
  window.openRejectionModal = function(accNo) {
    const sample = window.state.phlebotomyQueue.find(p => p.accNo === accNo);
    if (!sample) return;

    window.activeRejectionAcc = accNo;

    const detail = document.getElementById('rejection-modal-detail');
    detail.innerHTML = `
      <strong>Specimen:</strong> ${accNo}<br>
      <strong>Patient:</strong> ${sample.name} (${sample.uhid})<br>
      <strong>Tests ordered:</strong> ${sample.tests}
    `;

    document.getElementById('sample-rejection-modal').style.display = 'flex';
  };

  window.closeRejectionModal = function() {
    document.getElementById('sample-rejection-modal').style.display = 'none';
  };

  window.saveSampleRejection = function() {
    const accNo = window.activeRejectionAcc;
    const sample = window.state.phlebotomyQueue.find(p => p.accNo === accNo);
    if (!sample) return;

    const reason = document.getElementById('rejection-modal-reason').value;
    const comment = document.getElementById('rejection-modal-comment').value.trim();

    if (!comment) {
      alert("Please log rejection comments and action details.");
      return;
    }

    // Save rejection record to NABL rejection register
    const log = {
      accNo: accNo,
      patientName: sample.name,
      uhid: sample.uhid,
      testName: sample.tests,
      reason: reason,
      comment: comment,
      time: new Date().toLocaleTimeString('en-IN'),
      techId: "Tech Amit (EMP-902)"
    };

    window.state.rejectionRegister.push(log);
    
    // Add recollect alert
    window.state.recollectionAlerts.unshift({
      id: "REC-" + Math.floor(100 + Math.random() * 900),
      patientName: sample.name,
      uhid: sample.uhid,
      test: sample.tests,
      reason: reason + " (" + comment + ")",
      status: "Pending Action",
      notifiedAt: "Just now",
      source: sample.source.includes('PVT') || sample.source.includes('GW') || sample.source.includes('SP') || sample.source.includes('Ward') ? "Ward Nurse Desk" : "Patient SMS Portal"
    });

    // remove sample
    window.state.phlebotomyQueue = window.state.phlebotomyQueue.filter(p => p.accNo !== accNo);
    
    window.renderPhlebotomyQueue();
    window.renderRecollectionAlerts();
    window.closeRejectionModal();
    alert(`Sample rejection logged in NABL audit register.\nRecollection dispatch notification sent to nursing station/phlebotomy coordinator.`);
  };

  // RENDER: Column 2 - Processing Worklist
  window.renderWorklist = function(filterVal = 'all') {
    const container = document.getElementById('processing-worklist-container');
    if (!container) return;

    let list = window.state.processingWorklist;
    if (filterVal !== 'all') {
      list = list.filter(w => w.dept === filterVal);
    }

    container.innerHTML = list.map(w => {
      // TAT Progress bar calculations
      const totalMinutes = w.targetHrs * 60;
      const rate = Math.min((w.elapsedMins / totalMinutes) * 100, 100);
      let barColor = "background-color: #10B981;"; // green
      if (rate >= 80) barColor = "background-color: #EF4444;"; // red
      else if (rate >= 50) barColor = "background-color: #F59E0B;"; // amber

      const activeRole = localStorage.getItem('saronil_active_lab_role') || 'Lab Technician';
      const isSupervisor = activeRole === 'Lab Supervisor' || activeRole === 'Lab Manager';
      let assignmentHtml = '';
      if (w.assignedTech) {
        assignmentHtml = `
          <div style="font-size:7px; color:#475569; margin-top:2px; font-weight:bold; background-color:#F1F5F9; padding:2px 4px; border-radius:3px;">
            📍 Assigned: ${w.assignedTech} | Analyzer: ${w.assignedInstrument || w.analyzer}
          </div>
        `;
      } else if (isSupervisor) {
        assignmentHtml = `
          <div style="display:flex; gap:2px; margin-top:4px; align-items:center;">
            <select id="assign-tech-${w.specId}" style="font-size:7px; padding:1px; border:1px solid var(--border-color); border-radius:3px; max-width:90px;">
              <option value="">-- Assign Tech --</option>
              <option value="Tech Amit">Tech Amit</option>
              <option value="Tech Seema">Tech Seema</option>
              <option value="Tech Rohan">Tech Rohan</option>
            </select>
            <button class="btn btn-primary text-[8px]" onclick="window.assignWork('${w.specId}')" style="padding:1px 3px; background-color:#1E3A8A; font-size:7px; line-height:1.2;">Assign</button>
          </div>
        `;
      }

      return `
        <div style="border: 1px solid var(--border-color); border-radius: 6px; padding: 10px; background-color: white; font-size: 0.72rem; display:flex; flex-direction:column; gap:4px;">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <span class="admin-mono font-bold" style="font-size:0.7rem;">${w.specId}</span>
            <span class="text-slate-500 font-semibold" style="font-size:8px;">${w.analyzer}</span>
          </div>
          <div>
            <div style="font-weight:600; color:var(--text-primary);">${w.name} (${w.uhid})</div>
            <div style="font-size:0.68rem; color:var(--text-secondary);">Test: <strong>${w.test}</strong></div>
            ${assignmentHtml}
          </div>
          <div style="margin-top:2px;">
            <div style="display:flex; justify-content:space-between; font-size:8px; color:var(--text-muted); margin-bottom:2px;">
              <span>TAT Target: ${w.targetHrs}h</span>
              <span class="admin-mono font-semibold">${w.elapsedMins}m elapsed</span>
            </div>
            <div style="width:100%; height:4px; background:#F1F5F9; border-radius:2px; overflow:hidden;">
              <div style="width:${rate}%; height:4px; ${barColor} border-radius:2px;"></div>
            </div>
          </div>
          <div style="border-top:1px dashed var(--border-color); padding-top:4px; margin-top:2px; display:flex; justify-content:space-between; align-items:center;">
            <span style="color:#0288D1; font-weight:600; font-size:8px;">${w.status}</span>
            <div style="display:flex; gap:2px;">
              <button class="btn btn-secondary text-[9px]" onclick="window.openEnterResultModal('${w.specId}')" style="padding:2px 4px;">Enter Result</button>
              <button class="btn btn-secondary text-[9px]" onclick="window.viewSampleTrail('${w.specId}')" style="padding:2px 4px; border:none; background:transparent;">👁️ Trail</button>
            </div>
          </div>
        </div>
      `;
    }).join('');
  };

  window.filterWorklist = function(type) {
    const buttons = ['all', 'haem', 'biochem', 'micro'];
    buttons.forEach(b => {
      const el = document.getElementById('worklist-filter-' + b);
      if (el) {
        el.classList.remove('btn-primary');
        el.classList.add('btn-secondary');
      }
    });

    let activeId = 'worklist-filter-all';
    if (type === 'Haematology') activeId = 'worklist-filter-haem';
    else if (type === 'Biochemistry') activeId = 'worklist-filter-biochem';
    else if (type === 'Microbiology') activeId = 'worklist-filter-micro';

    const activeEl = document.getElementById(activeId);
    if (activeEl) {
      activeEl.classList.remove('btn-secondary');
      activeEl.classList.add('btn-primary');
    }

    window.renderWorklist(type);
  };

  window.openEnterResultModal = function(specId) {
    const item = window.state.processingWorklist.find(w => w.specId === specId);
    if (!item) return;

    window.activeResultSpecId = specId;

    // Display Patient Info & test
    const detailsDiv = document.getElementById('result-modal-details');
    const master = (window.state.lisTestMaster || []).find(m => m.code === item.test || item.test.includes(m.name) || item.test.includes(m.code));
    const refStr = master ? master.refRange : "Check reference register";
    
    detailsDiv.innerHTML = `
      <strong>Patient:</strong> ${item.name} (${item.uhid})<br>
      <strong>Test Ordered:</strong> ${item.test} [Department: ${item.dept || 'General'}]<br>
      <strong>NABL Reference Range:</strong> <span class="text-blue-600 font-semibold">${refStr}</span>
    `;

    document.getElementById('result-modal-value').value = "";
    document.getElementById('result-modal-comments').value = "";
    document.getElementById('result-modal-bench').value = item.analyzer || "Mindray BC-5150";

    // Historical comparison (delta check)
    const priorText = document.getElementById('result-modal-delta-check');
    if (item.uhid === "MH-2026-4802") {
      priorText.innerHTML = "Prior CBC (30-Jun-2026): Hb: 8.5 g/dL, PLT: 1.8L /cumm. (Current delta check alert triggered if Hb < 6.0)";
    } else if (item.uhid === "MH-2026-7731") {
      priorText.innerHTML = "Prior Platelets (29-Jun-2026): 45,000 /µL. (High delta drop)";
    } else {
      priorText.innerHTML = "No prior patient results found in Saronil EMR database.";
    }

    document.getElementById('enter-result-dialog-modal').style.display = 'flex';
  };

  window.closeEnterResultDialogModal = function() {
    document.getElementById('enter-result-dialog-modal').style.display = 'none';
  };

  window.saveEnterResultDialog = function() {
    const specId = window.activeResultSpecId;
    const item = window.state.processingWorklist.find(w => w.specId === specId);
    if (!item) return;

    const value = document.getElementById('result-modal-value').value.trim();
    const instrument = document.getElementById('result-modal-bench').value;
    const comments = document.getElementById('result-modal-comments').value.trim();

    if (!value) {
      alert("Please enter diagnostic value result.");
      return;
    }

    // Check if value is critical
    let flag = "✓ Normal";
    const valFloat = parseFloat(value);
    
    // NABL critical limits
    if (value.toLowerCase().includes('critical') || value.toLowerCase().includes('reactive') || valFloat > 6.0 || valFloat < 5.0 || (item.test.toLowerCase().includes('potassium') && valFloat > 6.0) || (item.test.toLowerCase().includes('hemoglobin') && valFloat < 5.0)) {
      flag = "CRITICAL";
    } else if (valFloat > 140 || value.toLowerCase().includes('high') || value.toLowerCase().includes('+')) {
      flag = "H";
    }

    // If critical, trigger notification log
    if (flag === "CRITICAL") {
      window.state.lisAuditLogs.unshift({
        timestamp: new Date().toLocaleTimeString('en-IN') + ' ' + new Date().toLocaleDateString('en-IN'),
        user: "LIS System",
        action: "Critical Value Alarm",
        details: `Critical panic result detected on analyzer: ${item.test} (${value}). Escalation timer started.`
      });
      
      // Also add to criticalValues for active alarms
      window.state.criticalValues.unshift({
        id: Math.floor(1000 + Math.random()*9000),
        patientName: item.name,
        uhid: item.uhid,
        ipop: "IPD",
        test: item.test,
        value: value,
        unit: "g/dL",
        refRange: "NABL Critical Limits",
        doctor: "Dr. Priya Nair",
        ward: "Ward Bench",
        elapsedMins: 0,
        status: "Pending"
      });
      if (window.renderCriticalBanner) window.renderCriticalBanner();
    }

    // Remove from worklist
    window.state.processingWorklist = window.state.processingWorklist.filter(w => w.specId !== specId);

    // Sync status and map report ID to EMR order
    let reportNo = "REP-20260702-" + Math.floor(100 + Math.random() * 900);
    if (specId.startsWith("SPEC-ORD-")) {
      const orderId = specId.replace("SPEC-ORD-", "");
      reportNo = `REP-${orderId}`;
      const order = window.state.orders.find(o => o.id === orderId);
      if (order) {
        order.status = "Result Entered";
        order.result = `${item.test}: ${value}`;
      }
    }

    // Push to validation queue
    window.state.validationQueue.unshift({
      reportNo: reportNo,
      name: item.name,
      uhid: item.uhid,
      test: item.test,
      keyResults: `${item.test}: ${value}`,
      refRange: "NABL Ref Range",
      flag: flag,
      enteredBy: "Tech Amit (EMP-902)",
      time: "Just entered",
      elapsedMins: 0,
      comments: comments,
      instrument: instrument
    });

    window.renderWorklist();
    window.renderValidationQueue();
    window.renderKpis();
    if (window.renderLisAuditLogs) window.renderLisAuditLogs();
    
    window.closeEnterResultDialogModal();
    alert("Test result entered and submitted to duty Pathologist validation queue.");
  };

  // RENDER: Column 3 - Pathologist Validation Queue
  window.renderValidationQueue = function(filterVal = 'all') {
    const container = document.getElementById('validation-queue-container');
    if (!container) return;

    let list = window.state.validationQueue;
    if (filterVal === 'CRITICAL') {
      list = list.filter(v => v.flag === 'CRITICAL');
    } else if (filterVal === 'REACTIVE') {
      list = list.filter(v => v.flag === 'REACTIVE');
    }

    container.innerHTML = list.map(v => {
      let flagHTML = `<span style="background-color:#E8F5E9; color:#2E7D32; font-weight:bold; font-size:8px; padding:1px 4px; border-radius:3px;">${v.flag}</span>`;
      let styleColor = 'border-left: 4px solid #10B981;';
      
      if (v.flag === 'CRITICAL') {
        flagHTML = `<span style="background-color:#FFEBEE; color:#C62828; font-weight:bold; font-size:8px; padding:1px 4px; border-radius:3px;">PANIC RANGE</span>`;
        styleColor = 'border-left: 4px solid #EF4444; background-color: #FEF2F2;';
      } else if (v.flag === 'REACTIVE') {
        flagHTML = `<span style="background-color:#F3E5F5; color:#6A1B9A; font-weight:bold; font-size:8px; padding:1px 4px; border-radius:3px;">REACTIVE ⚠️</span>`;
        styleColor = 'border-left: 4px solid #8B5CF6;';
      } else if (v.flag === 'H') {
        flagHTML = `<span style="background-color:#FFF3E0; color:#EF6C00; font-weight:bold; font-size:8px; padding:1px 4px; border-radius:3px;">HIGH</span>`;
        styleColor = 'border-left: 4px solid #F59E0B;';
      }

      return `
        <div style="border: 1px solid var(--border-color); border-radius: 6px; padding: 10px; background-color: white; font-size: 0.72rem; display:flex; flex-direction:column; gap:4px; ${styleColor}">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <span class="admin-mono font-bold" style="font-size:0.7rem;">${v.reportNo}</span>
            ${flagHTML}
          </div>
          <div>
            <div style="font-weight:600; color:var(--text-primary);">${v.name} (${v.uhid})</div>
            <div style="font-size:0.68rem; color:#1E293B; margin-top:2px;">Test Panel: <strong>${v.test}</strong></div>
            <div style="background:#F8FAFC; padding:4px; border:1px solid var(--border-color); border-radius:4px; font-family:var(--font-mono); font-size:9px; margin-top:4px;">
              ${v.keyResults} <br>
              <span style="color:var(--text-muted); font-size:8px;">Ref: ${v.refRange}</span>
            </div>
          </div>
          <div style="border-top:1px dashed var(--border-color); padding-top:4px; margin-top:4px; display:flex; justify-content:space-between; align-items:center;">
            <span style="font-size:8px; color:var(--text-muted);">By: ${v.enteredBy}</span>
            <div style="display:flex; gap:2px;">
              <button class="btn btn-primary text-[9px]" onclick="window.pathologistValidate('${v.reportNo}')" style="padding:2px 4px; background-color:#065F46; border-color:#065F46;">Validate</button>
              <button class="btn btn-secondary text-[9px]" onclick="window.pathologistRepeat('${v.reportNo}')" style="padding:2px 4px;">Rerun</button>
            </div>
          </div>
        </div>
      `;
    }).join('');
  };

  window.filterValidQueue = function(type) {
    const buttons = ['all', 'crit', 'react'];
    buttons.forEach(b => {
      const el = document.getElementById('valid-filter-' + b);
      if (el) {
        el.classList.remove('btn-primary');
        el.classList.add('btn-secondary');
      }
    });

    const activeEl = document.getElementById('valid-filter-' + type.toLowerCase().slice(0, 4));
    if (activeEl) {
      activeEl.classList.remove('btn-secondary');
      activeEl.classList.add('btn-primary');
    }

    window.renderValidationQueue(type);
  };

  window.pathologistValidate = function(reportNo) {
    const item = window.state.validationQueue.find(v => v.reportNo === reportNo);
    if (!item) return;

    // Strict validation guidelines (ICTC Referral block for HIV Reactive)
    if (item.flag === 'REACTIVE' && item.test.toLowerCase().includes('hiv')) {
      alert("WARNING: HIV Reactive report validated. ICTC referral letter generated.\nReport NOT released directly to patient as per ICTC/NACO regulatory guidelines.");
      
      // save to notifiable diseases
      window.state.notifiableDiseaseLog.push({
        name: item.name,
        uhid: item.uhid,
        disease: "HIV ICTC Referral",
        test: item.test,
        result: "Reactive",
        doctor: "Dr. Sunita Verma",
        status: "Referral Printed",
        date: new Date().toLocaleDateString('en-IN')
      });
      window.renderNotifiableLog();
    }

    // Move to released tracker
    window.state.reportDispatchLog.unshift({
      reportNo: reportNo,
      name: item.name,
      tests: item.test,
      releasedAt: new Date().toLocaleTimeString('en-IN'),
      mode: "WhatsApp PDF",
      status: "Delivered",
      mobile: "9912098271"
    });

    // Remove from validation queue
    window.state.validationQueue = window.state.validationQueue.filter(v => v.reportNo !== reportNo);

    // If critical, trigger communication log modal first!
    if (item.flag === 'CRITICAL') {
      window.state.criticalValues.push({
        id: window.state.criticalValues.length + 101,
        patientName: item.name,
        uhid: item.uhid,
        ipop: "IPD Ward",
        test: item.test,
        value: item.keyResults.split(': ')[1],
        doctor: "Dr. Amit Sharma",
        ward: "GENERAL-WARD",
        elapsedMins: 0,
        status: "Pending"
      });
      window.renderCriticalBanner();
      alert("PANIC RESULT VALIDATED. Communicating with ward doctor immediately.");
    }

    window.renderValidationQueue();
    window.renderDispatchTracker();
    window.renderKpis();
    alert(`Report ${reportNo} digitally signed and released.`);
  };

  window.pathologistRepeat = function(reportNo) {
    alert(`Specimen associated with Report ${reportNo} sent for rerun calibration block on Erba Chem analyzer.`);
  };

  // RENDER: Column 4 - Alerts, QC & Outsource
  window.renderQcViolations = function() {
    const list = document.getElementById('qc-violations-container');
    if (!list) return;

    list.innerHTML = window.state.qcLog.map(q => {
      let statusColor = "background-color: #ECFDF5; color: #065F46; border: 1px solid #A7F3D0;";
      if (q.status === 'Fail') statusColor = "background-color: #FEF2F2; color: #991B1B; border: 1px solid #FCA5A5;";

      return `
        <div style="padding: 6px 10px; border-radius: 4px; font-size: 0.68rem; ${statusColor} display:flex; flex-direction:column; gap:2px;">
          <div style="display:flex; justify-content:space-between; align-items:center; font-weight:600;">
            <span>${q.dept} · ${q.control}</span>
            <span>${q.status}</span>
          </div>
          <div>Target: ${q.target} | Run: ${q.result} (${q.deviation})</div>
          ${q.status === 'Fail' ? `<div style="font-size:8px; font-weight:bold; margin-top:2px;">⚠️ QC failure: analyzer results put on hold. <button class="btn btn-secondary btn-xs" onclick="window.logQcCorrectiveAction()" style="font-size:7px; padding:0 3px;">Log Action</button></div>` : ''}
        </div>
      `;
    }).join('');
  };

  window.logQcCorrectiveAction = function() {
    const action = window.prompt("Enter corrective action taken (e.g., recalibrated system, changed reagent pack):");
    if (action) {
      alert("QC Corrective Action logged in quality register. Analyzer released from QC hold.");
      // change biochemistry qc status in log to Passed
      window.state.qcLog.forEach(q => {
        if (q.status === 'Fail') {
          q.status = 'Pass';
          q.deviation = '+0.8 SD';
        }
      });
      window.renderQcViolations();
    }
  };

  window.renderOutsourceRegister = function() {
    const tbody = document.getElementById('outsource-register-body');
    if (!tbody) return;

    // Use current prototype date: July 2nd 2026
    const today = new Date("2026-07-02");

    tbody.innerHTML = window.state.outsourceRegister.map(o => {
      const pat = (window.state.patients || []).find(p => p.name === o.name);
      const uhid = pat ? pat.uhid : '';
      
      let statusHtml = '';
      
      if (o.status === 'Dispatched') {
        const expDateObj = new Date(o.expectedDate);
        if (expDateObj < today) {
          statusHtml = `<span style="color:#EF4444; font-weight:bold;">🔴 Overdue</span><br><span style="font-size:7px; color:#EF4444;">Expected: ${o.expectedDate}</span>`;
        } else {
          statusHtml = `<span style="color:#0288D1; font-weight:bold;">Dispatched</span><br><span style="font-size:7px; color:#64748b;">Due: ${o.expectedDate}</span>`;
        }
      } else {
        statusHtml = `<span style="color:#10B981; font-weight:bold;">✓ Received</span><br><span style="font-size:7px; color:#10B981;">Attached</span>`;
      }

      return `
      <tr style="border-bottom:1px solid var(--border-color);">
        <td style="padding:4px;">
          <strong style="${uhid ? 'color:var(--color-primary); text-decoration:underline; cursor:pointer;' : ''}" ${uhid ? `onclick="router.navigate('patients?uhid=${uhid}')"` : ''}>${o.name}</strong><br>
          <span style="font-size:8px; color:var(--text-muted);">${o.lab}</span>
        </td>
        <td style="padding:4px;">${o.test}</td>
        <td style="padding:4px; text-align:right;">
          <div style="display:flex; flex-direction:column; align-items:flex-end; gap:2px;">
            ${statusHtml}
            ${o.status === 'Dispatched' ? `<button class="btn btn-secondary text-[8px]" onclick="window.openUploadReferralModal('${o.accNo}')" style="padding:1px 3px; font-size:7px; margin-top:2px;">Attach PDF</button>` : ''}
          </div>
        </td>
      </tr>
      `;
    }).join('');
  };

  window.renderReagents = function() {
    const container = document.getElementById('reagents-container');
    if (!container) return;

    container.innerHTML = window.state.reagentAlerts.map(r => {
      let isCritical = (r.stock === 0);
      let alertStyle = isCritical ? "background-color: #FEF2F2; color: #991B1B; border: 1px solid #FCA5A5;" : "background-color: #FFFBEB; color: #92400E; border: 1px solid #FCD34D;";

      return `
        <div style="padding: 6px 10px; border-radius: 4px; font-size: 0.68rem; ${alertStyle} display:flex; justify-content:space-between; align-items:center;">
          <div>
            <strong>${r.reagent}</strong><br>
            <span style="font-size:8px; opacity:0.8;">Analyzer: ${r.analyzer} · Stock: ${r.stock}</span>
          </div>
          <button class="btn btn-secondary btn-xs" onclick="window.reorderReagent('${r.reagent}')" style="font-size:8px; padding:2px 4px;">Indent</button>
        </div>
      `;
    }).join('');
  };

  window.reorderReagent = function(reagent) {
    window.showStockRequestOverlay({
      dept: 'Laboratory',
      urgency: 'Routine',
      prefillType: 'Consumable',
      prefillItem: {
        code: 'ITM-REAGENT-LAB',
        name: reagent,
        qty: 5,
        unit: 'kits',
        purpose: 'Lab Reagents/Consumables'
      }
    });
  };

  // RENDER: SECTION 7 — DEPARTMENT TABS & TEST LIST
  window.switchDeptTab = function(deptName) {
    const tabs = document.querySelectorAll('#department-tabs-bar span');
    tabs.forEach(t => {
      if (t.innerText.includes(deptName) || (deptName === 'Serology' && t.innerText.includes('Serology'))) {
        t.classList.add('active');
      } else {
        t.classList.remove('active');
      }
    });

    const statsPanel = document.getElementById('dept-stats-panel');
    const tableBody = document.getElementById('dept-tests-table-body');
    if (!statsPanel || !tableBody) return;

    // Set stats
    statsPanel.innerHTML = `
      <div style="font-size: 0.8rem; font-weight: bold; color: var(--text-primary);">${deptName} Metrics</div>
      <div style="background-color: var(--bg-surface); padding:8px; border-radius:4px; font-size:0.7rem; display:flex; flex-direction:column; gap:4px;">
        <div>Today's Load: <strong>48 runs</strong></div>
        <div>TAT Compliance: <strong style="color:#059669;">96%</strong></div>
        <div>Pending processing: <strong>3 samples</strong></div>
      </div>
    `;

    // Common Indian tests lists per department
    let testsList = [];
    if (deptName === 'Haematology') {
      testsList = [
        { name: "CBC with differential", ordered: 45, process: 2, done: 43, avgTat: "45m", target: "1.5h", compliance: 97 },
        { name: "ESR (Westergren method)", ordered: 15, process: 1, done: 14, avgTat: "65m", target: "2h", compliance: 93 },
        { name: "Peripheral Blood Smear", ordered: 8, process: 0, done: 8, avgTat: "90m", target: "3h", compliance: 100 },
        { name: "Malaria smear + RDT", ordered: 12, process: 1, done: 11, avgTat: "30m", target: "1h", compliance: 100 }
      ];
    } else if (deptName === 'Biochemistry') {
      testsList = [
        { name: "Blood Glucose (FBS/PP/Random)", ordered: 80, process: 4, done: 76, avgTat: "40m", target: "2h", compliance: 98 },
        { name: "HbA1c (Glycated Hb)", ordered: 32, process: 1, done: 31, avgTat: "85m", target: "3h", compliance: 96 },
        { name: "Liver Function Test (LFT)", ordered: 24, process: 2, done: 22, avgTat: "95m", target: "4h", compliance: 92 },
        { name: "Kidney Function Test (KFT)", ordered: 26, process: 1, done: 25, avgTat: "90m", target: "4h", compliance: 96 }
      ];
    } else if (deptName === 'Serology') {
      testsList = [
        { name: "HIV 1&2 (ICTC protocol)", ordered: 10, process: 0, done: 10, avgTat: "120m", target: "4h", compliance: 100 },
        { name: "Dengue NS1 Ag + IgM/IgG", ordered: 18, process: 2, done: 16, avgTat: "45m", target: "2h", compliance: 100 },
        { name: "Widal Slide Test (Typhoid)", ordered: 14, process: 1, done: 13, avgTat: "35m", target: "1.5h", compliance: 92 }
      ];
    } else if (deptName === 'Microbiology') {
      testsList = [
        { name: "Urine Culture & Sensitivity", ordered: 8, process: 8, done: 0, avgTat: "Pending", target: "72h", compliance: 100 },
        { name: "AFB Smear (ZN Stain)", ordered: 4, process: 1, done: 3, avgTat: "180m", target: "4h", compliance: 100 },
        { name: "Gene Xpert MTB/RIF", ordered: 2, process: 0, done: 2, avgTat: "240m", target: "6h", compliance: 100 }
      ];
    } else {
      testsList = [
        { name: `${deptName} Routine Analysis`, ordered: 15, process: 1, done: 14, avgTat: "50m", target: "2h", compliance: 95 }
      ];
    }

    tableBody.innerHTML = testsList.map(t => `
      <tr style="border-bottom: 1px solid var(--border-color);">
        <td style="padding: 6px; font-weight:600;">${t.name}</td>
        <td style="padding: 6px; text-align:center;" class="admin-mono">${t.ordered}</td>
        <td style="padding: 6px; text-align:center;" class="admin-mono">${t.process}</td>
        <td style="padding: 6px; text-align:center;" class="admin-mono">${t.done}</td>
        <td style="padding: 6px; text-align:center;" class="admin-mono">${t.avgTat}</td>
        <td style="padding: 6px; text-align:center;" class="admin-mono">${t.target}</td>
        <td style="padding: 6px; text-align:right;" class="admin-mono font-bold text-emerald-600">${t.compliance}%</td>
      </tr>
    `).join('');
  };

  // RENDER: SECTION 8 — DISPATCH TRACKER
  window.renderDispatchTracker = function() {
    const tbody = document.getElementById('dispatch-tracker-body');
    if (!tbody) return;

    tbody.innerHTML = window.state.reportDispatchLog.map(d => {
      const pat = (window.state.patients || []).find(p => p.name === d.name);
      const uhid = pat ? pat.uhid : '';
      return `
      <tr style="border-bottom:1px solid var(--border-color);">
        <td style="padding:6px;" class="admin-mono font-semibold">${d.reportNo}</td>
        <td style="padding:6px; font-weight:500;"><span style="${uhid ? 'color:var(--color-primary); text-decoration:underline; cursor:pointer;' : ''}" ${uhid ? `onclick="router.navigate('patients?uhid=${uhid}')"` : ''}>${d.name}</span></td>
        <td style="padding:6px;">${d.tests}</td>
        <td style="padding:6px;" class="admin-mono">${d.releasedAt}</td>
        <td style="padding:6px;">${d.mode}</td>
        <td style="padding:6px;"><span class="${d.status === 'Delivered' ? 'text-emerald-600 font-bold' : 'text-slate-500'}">${d.status}</span></td>
        <td style="padding:6px; text-align:right; display:flex; gap:2px; justify-content:flex-end;">
          <button class="btn btn-secondary text-[9px]" onclick="window.resendReport('${d.reportNo}')" style="padding:2px 4px;">Resend</button>
          <button class="btn btn-primary text-[9px]" onclick="window.printFinalReport('${d.reportNo}')" style="padding:2px 4px; background-color:#2563EB; border-color:#2563EB;">Print</button>
        </td>
      </tr>
      `;
    }).join('');
  };

  window.resendReport = function(reportNo) {
    alert(`Report ${reportNo} successfully spooled and sent via Saronil WhatsApp Business gateway.`);
  };

  window.printFinalReport = function(reportNo) {
    window.state.lisAuditLogs.unshift({
      timestamp: new Date().toLocaleTimeString('en-IN') + ' ' + new Date().toLocaleDateString('en-IN'),
      user: localStorage.getItem('saronil_active_lab_role') || 'Lab Technician',
      action: "Report Printed",
      details: `Report ${reportNo} print command executed. Secure digital pathology signature embedded.`
    });
    if (window.renderLisAuditLogs) window.renderLisAuditLogs();
    alert(`Print Command Sent:\nGenerating final NABL pathology report PDF for ${reportNo} with digital signature card verification.`);
  };

  // RENDER: SECTION 9 — NOTIFIABLE DISEASE LOG
  window.renderNotifiableLog = function() {
    const tbody = document.getElementById('notifiable-log-body');
    if (!tbody) return;

    tbody.innerHTML = window.state.notifiableDiseaseLog.map(n => `
      <tr style="border-bottom:1px solid var(--border-color);">
        <td style="padding:6px;">
          <strong style="color:var(--color-primary); text-decoration:underline; cursor:pointer;" onclick="router.navigate('patients?uhid=${n.uhid}')">${n.name}</strong><br>
          <span style="font-size:8px; color:var(--text-muted);">${n.uhid}</span>
        </td>
        <td style="padding:6px; font-weight:bold; color:#8B5CF6;">${n.disease}</td>
        <td style="padding:6px;">${n.test}: ${n.result}</td>
        <td style="padding:6px;">${n.doctor}</td>
        <td style="padding:6px;"><span class="text-emerald-600 font-semibold">${n.status}</span></td>
        <td style="padding:6px; text-align:right; display:flex; gap:2px; justify-content:flex-end;">
          <button class="btn btn-secondary text-[9px]" onclick="window.printNotifiableForm('${n.uhid}')" style="padding:2px 4px;">Print CMO Form</button>
          ${n.disease.includes('TB') ? `<button class="btn btn-primary text-[9px]" onclick="window.openNikshayPortal()" style="padding:2px 4px; background-color:#8B5CF6; border-color:#8B5CF6;">Nikshay TB Portal</button>` : ''}
        </td>
      </tr>
    `).join('');
  };

  window.printNotifiableForm = function(uhid) {
    alert("Printing standard District surveillance CMO notification form 5A...");
  };

  window.openNikshayPortal = function() {
    alert("Bypassing external link. Dispatching TB case details to Government Nikshay gateway API.");
  };

  // SAMPLE TIMELINE LOG TRAIL (Section 11)
  window.viewSampleTrail = function(specId) {
    const item = window.state.processingWorklist.find(w => w.specId === specId) || { name: "Ramesh Kumar", uhid: "MH-2026-4802", test: "Complete Blood Count" };
    
    document.getElementById('trail-modal-patient').innerHTML = `
      <strong>Specimen ID:</strong> ${specId}<br>
      <strong>Patient:</strong> ${item.name} (${item.uhid}) · <strong>Test:</strong> ${item.test}
    `;

    const timeline = [
      { time: "27-Jun-2026 09:30 AM", user: "Dr. Amit Sharma", event: "Laboratory order placed in EMR" },
      { time: "27-Jun-2026 09:45 AM", user: "Phleb Exec Ritu", event: "Accession SPEC ID barcode printed" },
      { time: "27-Jun-2026 10:00 AM", user: "Phleb Exec Ritu", event: "Sample collected in Lavender EDTA tube" },
      { time: "27-Jun-2026 10:15 AM", user: "Tech Amit", event: "Specimen received in central Haematology lab" },
      { time: "27-Jun-2026 10:20 AM", user: "Tech Amit", event: "Loaded onto Mindray BC-5150 analyzer" }
    ];

    document.getElementById('trail-modal-timeline').innerHTML = timeline.map(t => `
      <div>
        <div style="font-weight:bold; color:var(--text-primary);">${t.event}</div>
        <div style="font-size:8px; color:var(--text-muted);" class="admin-mono">${t.time} · User: ${t.user}</div>
      </div>
    `).join('');

    document.getElementById('sample-trail-modal').style.display = 'flex';
  };

  window.closeTrailModal = function() {
    document.getElementById('sample-trail-modal').style.display = 'none';
  };

  // QUICK ACTIONS TRIGGER MOCKS
  window.mockCollectSample = function() {
    const term = window.prompt("Enter Specimen barcode Accession number to receive / collect sample:", "SPEC-20260627-0101");
    if (term) {
      window.markCollected(term);
    }
  };

  window.mockPrintLabels = function() {
    alert("Barcode spooled. Sent printing instructions to Zebra Label printer.");
  };

  window.mockRejectSample = function() {
    const term = window.prompt("Enter Accession number of sample to REJECT:", "SPEC-20260627-0102");
    if (term) {
      window.openRejectionModal(term);
    }
  };

  window.mockSendReferral = function() {
    alert("Outsource register loaded. Generating batch dispatch list for Dr Lal PathLabs courier...");
  };

  window.mockHomeCollect = function() {
    alert("Launching Home Collection Scheduler. Assigning phlebotomist to Saket sector.");
  };

  window.mockValidateReport = function() {
    alert("Quick validation active. Review the validations list in Column 3.");
  };

  window.mockReleaseReport = function() {
    alert("Reports dispatch module loaded.");
  };

  window.mockAddAddendum = function() {
    alert("To add an addendum, select a released report from the dispatch register list.");
  };

  window.mockNotifyDisease = function() {
    alert("Select positive GeneXpert or Widal sample from processing list to register.");
  };

  window.mockTatReport = function() {
    alert("NABL Turnaround Time (TAT) analytics dashboard loaded.");
  };

  window.mockQcSummary = function() {
    alert("Levey-Jennings Quality Control chart summary loaded.");
  };

  window.mockReagentIndent = function() {
    alert("Indents list approved. Orders dispatched to Erba Transasia representative.");
  };

  window.mockOutsourceReg = function() {
    alert("Printing Government compliance Outsource register logs...");
  };

  window.mockShiftSummary = function() {
    alert("Generating shift performance indicators and QC validations list...");
  };

  window.signOffShiftSummary = function() {
    alert("Shift closed successfully. Shift log saved and locked in NABL audit vault.");
  };

  window.showInstrumentDetail = function(name) {
    alert(`Analyzer Diagnostics: ${name}\n` +
          `-------------------------------\n` +
          `• Temperature: 37.0°C (Normal)\n` +
          `• Calibration Status: Passed (Valid for next 18h)\n` +
          `• Reagent Levels: 85% remaining\n` +
          `• Connection: Online (Bidirectional LIS active)\n\n` +
          `Status is normal. No supervisor action required.`);
  };

  // GLOBAL SEARCH FILTER
  window.filterLisDashboard = function(val) {
    const query = val.toLowerCase().trim();
    // filter phlebotomy
    const phlebItems = document.querySelectorAll('#phleb-queue-container > div');
    phlebItems.forEach(item => {
      const text = item.innerText.toLowerCase();
      item.style.display = text.includes(query) ? '' : 'none';
    });

    // filter processing worklist
    const workItems = document.querySelectorAll('#processing-worklist-container > div');
    workItems.forEach(item => {
      const text = item.innerText.toLowerCase();
      item.style.display = text.includes(query) ? '' : 'none';
    });

    // filter validation queue
    const validItems = document.querySelectorAll('#validation-queue-container > div');
    validItems.forEach(item => {
      const text = item.innerText.toLowerCase();
      item.style.display = text.includes(query) ? '' : 'none';
    });
  };

  // NEW ORDER PLACEMENT AND BILLING GATE MODAL HANDLERS
  window.openNewOrderModal = function() {
    document.getElementById('new-lab-order-modal').style.display = 'flex';
    window.onOrdTypeChange();
  };

  window.closeNewOrderModal = function() {
    document.getElementById('new-lab-order-modal').style.display = 'none';
  };

  window.onOrdRoleChange = function() {
    const role = document.getElementById('ord-by-role').value;
    const authDocGroup = document.getElementById('ord-auth-doc-group');
    if (role === 'Nurse') {
      authDocGroup.style.display = 'block';
    } else {
      authDocGroup.style.display = 'none';
    }
  };

  window.onOrdPayerChange = function() {
    const payer = document.getElementById('ord-payer').value;
    const type = document.getElementById('ord-patient-type').value;
    const statusGroup = document.getElementById('ord-auth-status-group');
    const notice = document.getElementById('new-order-billing-notice');
    const submitBtn = document.getElementById('btn-submit-order');

    if (type === 'OPD' && payer !== 'Self Pay') {
      statusGroup.style.display = 'block';
      const authStatus = document.getElementById('ord-auth-status').value;
      if (authStatus === 'Pending') {
        notice.style.display = 'block';
        notice.innerText = `⚠️ Collection Blocked: TPA/Scheme pre-auth is pending for OPD sample.`;
        submitBtn.disabled = true;
        submitBtn.style.opacity = '0.5';
        submitBtn.style.cursor = 'not-allowed';
      } else {
        notice.style.display = 'none';
        submitBtn.disabled = false;
        submitBtn.style.opacity = '1';
        submitBtn.style.cursor = 'pointer';
      }
    } else {
      statusGroup.style.display = 'none';
      notice.style.display = 'none';
      submitBtn.disabled = false;
      submitBtn.style.opacity = '1';
      submitBtn.style.cursor = 'pointer';
    }
  };

  window.onOrdTypeChange = function() {
    const type = document.getElementById('ord-patient-type').value;
    const authGroup = document.getElementById('ord-auth-status-group');
    const notice = document.getElementById('new-order-billing-notice');
    const submitBtn = document.getElementById('btn-submit-order');

    if (type === 'IPD') {
      authGroup.style.display = 'none';
      notice.style.display = 'none';
      submitBtn.disabled = false;
      submitBtn.style.opacity = '1';
      submitBtn.style.cursor = 'pointer';
    } else {
      window.onOrdPayerChange();
    }
  };

  window.submitLabOrder = function() {
    const type = document.getElementById('ord-patient-type').value;
    const patientId = document.getElementById('ord-patient-id').value;
    const role = document.getElementById('ord-by-role').value;
    const doc = role === 'Nurse' ? document.getElementById('ord-auth-doctor').value : 'Dr. Priya Nair';
    const payer = document.getElementById('ord-payer').value;
    const test = document.getElementById('ord-test').value;
    const priority = document.getElementById('ord-priority').value;
    const authStatus = document.getElementById('ord-auth-status').value;

    const patientName = document.getElementById('ord-patient-id').options[document.getElementById('ord-patient-id').selectedIndex].text.split(' (')[0];

    const accNo = "SPEC-" + Math.floor(100000 + Math.random()*900000);
    const orderLog = {
      accNo: accNo,
      name: patientName,
      uhid: patientId,
      source: type === 'IPD' ? "PVT-BED-02" : "OPD Counter",
      tests: test,
      tubes: test === 'CBC' || test === 'PT/INR' ? ['lavender'] : ['red'],
      priority: priority,
      doctor: doc,
      time: "Just ordered",
      status: "Pending",
      orderedByRole: role.toLowerCase(),
      doctorCountersignedAt: role === 'Doctor' ? new Date().toLocaleTimeString('en-IN') : null,
      payerType: payer,
      schemeAuthStatus: type === 'IPD' ? 'Approved' : authStatus
    };

    window.state.phlebotomyQueue.unshift(orderLog);

    // Log to patient engagement timeline
    if (window.logPatientTimeline && patientId) {
      window.logPatientTimeline(patientId, {
        type: 'lab',
        icon: '🔬',
        title: 'Lab Test Ordered',
        desc: `${test} (${priority} priority) ordered by ${doc} for ${type} patient. Accession: ${accNo}. Sample collection pending.`
      });
    }

    window.renderPhlebotomyQueue();
    window.renderKpis();
    window.closeNewOrderModal();
    alert(`Laboratory Specimen Order ${accNo} successfully released to Collection Queue.`);

  };

  // DOCTOR COUNTERSIGN
  window.doctorCountersign = function(accNo) {
    const sample = window.state.phlebotomyQueue.find(p => p.accNo === accNo);
    if (sample) {
      sample.doctorCountersignedAt = new Date().toLocaleTimeString('en-IN');
      window.renderPhlebotomyQueue();
      alert(`Order ${accNo} successfully countersigned by ${sample.doctor}.`);
    }
  };

  // RECOLLECTION ALERTS LOG
  window.renderRecollectionAlerts = function() {
    const container = document.getElementById('recollection-alerts-body');
    const badge = document.getElementById('recollect-alert-count');
    if (!container) return;

    const activeCount = window.state.recollectionAlerts.filter(a => a.status === 'Pending Action').length;
    if (badge) badge.innerText = `${activeCount} Active`;

    container.innerHTML = window.state.recollectionAlerts.map(a => `
      <div style="padding:6px 10px; border-radius: 4px; font-size:0.68rem; background-color:#FEF3C7; border:1px solid #FCD34D; color:#92400E; display:flex; flex-direction:column; gap:2px;">
        <div style="display:flex; justify-content:space-between; font-weight:bold;">
          <span>🔄 Recollection: ${a.patientName} (${a.uhid})</span>
          <span>${a.status}</span>
        </div>
        <div>Test: <strong>${a.test}</strong> | Reason: <em>${a.reason}</em></div>
        <div style="font-size:7px; opacity:0.8; display:flex; justify-content:space-between; margin-top:2px; align-items:center;">
          <span>Routed to: ${a.source} (${a.notifiedAt})</span>
          ${a.status === 'Pending Action' ? `<button class="btn btn-primary text-[8px]" onclick="window.reCollectSample('${a.id}')" style="padding:1px 4px; background-color:#D97706; border-color:#D97706;">Dispatch Phleb</button>` : ''}
        </div>
      </div>
    `).join('') || `<div style="text-align:center; padding:10px; color:var(--text-muted); font-size:0.7rem;">No active recollection alerts.</div>`;
  };

  window.reCollectSample = function(id) {
    const alertItem = window.state.recollectionAlerts.find(a => a.id === id);
    if (!alertItem) return;

    alertItem.status = "Dispatched";
    
    // Put back in phlebotomy queue
    window.state.phlebotomyQueue.unshift({
      accNo: "SPEC-" + Math.floor(100000 + Math.random()*900000),
      name: alertItem.patientName,
      uhid: alertItem.uhid,
      source: alertItem.source,
      tests: alertItem.test,
      tubes: ["lavender"],
      priority: "Urgent",
      doctor: "Dr. Srinivasan",
      time: "Just now",
      status: "Pending",
      flags: ["Recollection alert"]
    });

    window.renderPhlebotomyQueue();
    window.renderRecollectionAlerts();
    alert(`Recollection sample requested. Sent to Phlebotomist queue.`);
  };

  // SEND-OUT REFERRAL MANUAL PDF ATTACH
  window.openUploadReferralModal = function(accNo) {
    const o = window.state.outsourceRegister.find(r => r.accNo === accNo);
    if (!o) return;
    window.activeReferralAccNo = accNo;
    document.getElementById('upload-modal-patient').innerHTML = `
      <strong>Patient:</strong> ${o.name}<br>
      <strong>Test Panel:</strong> ${o.test}<br>
      <strong>Reference Lab:</strong> ${o.lab}
    `;
    document.getElementById('upload-referral-modal').style.display = 'flex';
  };

  window.closeUploadReferralModal = function() {
    document.getElementById('upload-referral-modal').style.display = 'none';
  };

  window.saveReferralResult = function() {
    const accNo = window.activeReferralAccNo;
    const fileInput = document.getElementById('referral-pdf-file');
    if (!fileInput.files || fileInput.files.length === 0) {
      alert("Please select a diagnostic PDF report to attach.");
      return;
    }

    const o = window.state.outsourceRegister.find(r => r.accNo === accNo);
    if (o) {
      o.status = "Received";
      o.result = "Attached PDF Report: " + fileInput.files[0].name;
      o.resultReceivedAt = new Date().toLocaleTimeString('en-IN');
      window.renderOutsourceRegister();
      window.closeUploadReferralModal();
      alert(`Referral PDF result successfully attached for ${o.name}. Status updated to Received.`);
    }
  };

  // BLOOD BANK DIALOG
  window.openBloodBankModal = function() {
    document.getElementById('blood-bank-modal').style.display = 'flex';
    
    // Render stock
    const summary = document.getElementById('blood-stock-summary');
    if (summary && window.state.bloodStock) {
      summary.innerHTML = `
        <table style="width:100%; font-size:0.68rem; line-height:1.6;">
          <thead>
            <tr style="border-bottom:1px solid #cbd5e1; text-align:left;">
              <th>Group</th>
              <th>Packed RBC</th>
              <th>Platelets</th>
              <th>FFP</th>
            </tr>
          </thead>
          <tbody>
            ${Object.keys(window.state.bloodStock).map(g => `
              <tr style="border-bottom:1px dashed #e2e8f0;">
                <td><strong>${g}</strong></td>
                <td>${window.state.bloodStock[g].components.rbc} bags</td>
                <td>${window.state.bloodStock[g].components.platelets} bags</td>
                <td>${window.state.bloodStock[g].components.ffp} bags</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
    }
    window.renderBloodBankCrossMatches();
  };

  window.closeBloodBankModal = function() {
    document.getElementById('blood-bank-modal').style.display = 'none';
  };

  window.renderBloodBankCrossMatches = function() {
    const list = document.getElementById('blood-bank-crossmatches');
    if (!list) return;

    list.innerHTML = window.state.bloodBankCrossMatches.map(m => `
      <div style="padding:6px 10px; border-radius:4px; font-size:0.68rem; background-color:#FEF2F2; border:1px solid #FCA5A5; color:#991B1B; display:flex; flex-direction:column; gap:2px;">
        <div style="display:flex; justify-content:space-between; font-weight:bold;">
          <span>XM ID: ${m.crossmatchId} · ${m.patientName}</span>
          <span>${m.status}</span>
        </div>
        <div>Group: <strong>${m.bloodGroup}</strong> | Component: <strong>${m.component}</strong></div>
        <div style="font-size:7px; opacity:0.8; display:flex; justify-content:space-between; align-items:center;">
          <span>Bag Unit Ref: ${m.unitNo}</span>
          ${m.status === 'Pending Matching' ? `<button class="btn btn-primary text-[8px]" onclick="window.matchBloodBag('${m.crossmatchId}')" style="padding:1px 3px; background-color:#B91C1C; border-color:#B91C1C; font-size:7px;">Cross-Match</button>` : ''}
        </div>
      </div>
    `).join('');
  };

  window.matchBloodBag = function(id) {
    const m = window.state.bloodBankCrossMatches.find(x => x.crossmatchId === id);
    if (m) {
      m.status = "Cross-Matched & Reserved";
      m.unitNo = "PRBC-772C";
      window.renderBloodBankCrossMatches();
      alert(`Cross-matching successful for patient ${m.patientName}. Bag unit PRBC-772C reserved.`);
    }
  };

  // PATHOLOGIST SIGN-OFF OVERLAY DIALOGS
  window.pathologistValidate = function(reportNo) {
    const item = window.state.validationQueue.find(v => v.reportNo === reportNo);
    if (!item) return;

    window.activeValidationReportNo = reportNo;
    document.getElementById('signoff-modal-report-details').innerHTML = `
      <strong>Report No:</strong> ${item.reportNo}<br>
      <strong>Patient:</strong> ${item.name} (${item.uhid})<br>
      <strong>Test Panel:</strong> ${item.test}<br>
      <strong>Findings:</strong> ${item.keyResults}
    `;
    document.getElementById('pathologist-signoff-modal').style.display = 'flex';
  };

  window.closePathologistSignoffModal = function() {
    document.getElementById('pathologist-signoff-modal').style.display = 'none';
  };

  window.confirmPathologistValidate = function() {
    const reportNo = window.activeValidationReportNo;
    const item = window.state.validationQueue.find(v => v.reportNo === reportNo);
    if (!item) return;

    const mode = document.getElementById('signoff-modal-mode').value;

    // Strict validation guidelines (ICTC Referral block for HIV Reactive)
    if (item.flag === 'REACTIVE' && item.test.toLowerCase().includes('hiv')) {
      alert("WARNING: HIV Reactive report validated. ICTC referral letter generated.\nReport NOT released directly to patient as per ICTC/NACO regulatory guidelines.");
      
      window.state.notifiableDiseaseLog.push({
        uhid: item.uhid,
        name: item.name,
        disease: "HIV ICTC Referral",
        test: item.test,
        result: "Reactive",
        doctor: "Dr. Sunita Verma",
        status: "Referral Printed",
        date: new Date().toLocaleDateString('en-IN')
      });
      window.renderNotifiableLog();
    }

    // Move to released tracker (attributing mode of sign-off)
    window.state.reportDispatchLog.unshift({
      reportNo: reportNo,
      name: item.name,
      tests: item.test,
      releasedAt: new Date().toLocaleTimeString('en-IN'),
      mode: "WhatsApp PDF",
      status: "Delivered",
      mobile: "9912098271",
      signOffMode: mode
    });

    // Propagate clinical result back to Patient EMR (medicalReports)
    const patRecord = window.state.patients.find(p => p.uhid === item.uhid);
    if (patRecord) {
      if (!patRecord.medicalReports) patRecord.medicalReports = [];
      patRecord.medicalReports.unshift({
        testName: item.test,
        status: "Final",
        result: item.keyResults
      });
    }

    // Sync status and result back to state.orders
    let orderId = "";
    if (reportNo.startsWith("REP-ORD")) {
      orderId = reportNo.replace("REP-", "");
    }
    const matchingOrder = window.state.orders.find(o => 
      (orderId && o.id === orderId) || 
      (!orderId && o.uhid === item.uhid && o.name === item.test && o.status !== 'Approved')
    );
    if (matchingOrder) {
      matchingOrder.status = "Approved";
      matchingOrder.result = item.keyResults;
    }

    // Remove from validation queue
    window.state.validationQueue = window.state.validationQueue.filter(v => v.reportNo !== reportNo);

    // If critical, trigger communication log modal first!
    if (item.flag === 'CRITICAL') {
      window.state.criticalValues.push({
        id: window.state.criticalValues.length + 101,
        patientName: item.name,
        uhid: item.uhid,
        ipop: "IPD Ward",
        test: item.test,
        value: item.keyResults.split(': ')[1],
        doctor: "Dr. Amit Sharma",
        ward: "GENERAL-WARD",
        elapsedMins: 0,
        status: "Pending"
      });
      window.renderCriticalBanner();
      alert("PANIC RESULT VALIDATED. Communicating with ward doctor immediately.");
    }

    window.renderValidationQueue();
    window.renderDispatchTracker();
    window.renderKpis();
    window.closePathologistSignoffModal();
    alert(`Report ${reportNo} digitally signed via ${mode} and released successfully.`);
  };

  // EMERGENCY OVERRIDE
  window.triggerEmergencyOverride = function(accNo) {
    const sample = window.state.phlebotomyQueue.find(p => p.accNo === accNo);
    if (sample) {
      sample.schemeAuthStatus = 'Approved-EmergencyOverride';
      // log to audit trail
      window.state.lisAuditLogs.unshift({
        timestamp: new Date().toLocaleTimeString('en-IN') + ' ' + new Date().toLocaleDateString('en-IN'),
        user: "Doctor Override",
        action: "Billing Verified (Emergency Override)",
        details: `Emergency override triggered for sample ${accNo} (${sample.name})`
      });
      window.renderPhlebotomyQueue();
      if (window.renderLisAuditLogs) window.renderLisAuditLogs();
      alert(`Billing block bypassed using Emergency Override. Sample ${accNo} released for collection.`);
    }
  };

  // Escalation timer simulation
  if (!window.lisCritTimerInterval) {
    window.lisCritTimerInterval = setInterval(() => {
      if (window.state && window.state.criticalValues) {
        window.state.criticalValues.forEach(c => {
          if (c.status === 'Pending') {
            c.elapsedMins += 1;
          }
        });
        const banner = document.getElementById('lis-critical-banner');
        if (banner && banner.style.display !== 'none') {
          window.renderCriticalBanner();
        }
      }
    }, 60000); // update every minute
  }

  // APPLY ROLE VISIBILITY RULES (RBAC FOR 15 LIS PERSONAS)
  window.applyRoleVisibilityRules = function(role) {
    const toggle = (id, visible) => {
      const el = document.getElementById(id);
      if (el) el.style.display = visible ? '' : 'none';
    };

    // Role Matrix visibility:
    // Lab Technician / Microbiologist / Biochemist / Histopathologist / Lab Supervisor:
    if (role === 'Lab Technician' || role === 'Microbiologist' || role === 'Biochemist' || role === 'Histopathologist' || role === 'Lab Supervisor') {
      toggle('lis-phleb-card', false);
      toggle('lis-recollect-card', false);
      toggle('lis-outsource-card', true);
      toggle('lis-process-card', true);
      toggle('lis-qc-card', true);
      toggle('lis-reagents-card', true);
      toggle('lis-validation-card', false);
      toggle('lis-dept-card', true);
      toggle('lis-dispatch-card', false);
      toggle('lis-notifiable-card', false);
      toggle('lis-manager-summary-card', role === 'Lab Supervisor');
      toggle('lis-compliance-center-card', false);
    }
    // Pathologist:
    else if (role === 'Pathologist') {
      toggle('lis-phleb-card', false);
      toggle('lis-recollect-card', true);
      toggle('lis-outsource-card', true);
      toggle('lis-process-card', false);
      toggle('lis-qc-card', true);
      toggle('lis-reagents-card', false);
      toggle('lis-validation-card', true);
      toggle('lis-dept-card', true);
      toggle('lis-dispatch-card', true);
      toggle('lis-notifiable-card', true);
      toggle('lis-manager-summary-card', false);
      toggle('lis-compliance-center-card', false);
    }
    // Phlebotomist / Ward Nurse:
    else if (role === 'Phlebotomist' || role === 'Ward Nurse') {
      toggle('lis-phleb-card', true);
      toggle('lis-recollect-card', true);
      toggle('lis-outsource-card', false);
      toggle('lis-process-card', false);
      toggle('lis-qc-card', false);
      toggle('lis-reagents-card', false);
      toggle('lis-validation-card', false);
      toggle('lis-dept-card', false);
      toggle('lis-dispatch-card', false);
      toggle('lis-notifiable-card', false);
      toggle('lis-manager-summary-card', false);
      toggle('lis-compliance-center-card', false);
    }
    // Lab Manager / Lab Director / Hospital Administrator / Lab Executive:
    else if (role === 'Lab Manager' || role === 'Lab Director' || role === 'Hospital Administrator' || role === 'Lab Executive') {
      toggle('lis-phleb-card', true);
      toggle('lis-recollect-card', true);
      toggle('lis-outsource-card', true);
      toggle('lis-process-card', true);
      toggle('lis-qc-card', true);
      toggle('lis-reagents-card', true);
      toggle('lis-validation-card', true);
      toggle('lis-dept-card', true);
      toggle('lis-dispatch-card', true);
      toggle('lis-notifiable-card', true);
      toggle('lis-manager-summary-card', true);
      toggle('lis-compliance-center-card', true);
      window.switchComplianceTab('audit');
    }
    // Billing Executive / Front Office / Doctor / Lab Reception:
    else {
      toggle('lis-phleb-card', false);
      toggle('lis-recollect-card', false);
      toggle('lis-outsource-card', false);
      toggle('lis-process-card', false);
      toggle('lis-qc-card', false);
      toggle('lis-reagents-card', false);
      toggle('lis-validation-card', false);
      toggle('lis-dept-card', false);
      toggle('lis-dispatch-card', true);
      toggle('lis-notifiable-card', false);
      toggle('lis-manager-summary-card', false);
      toggle('lis-compliance-center-card', false);
    }
  };

  // ASSIGN WORK TO TECHNICIANS
  window.assignWork = function(specId) {
    const techSelect = document.getElementById(`assign-tech-${specId}`);
    if (!techSelect) return;
    const tech = techSelect.value;
    if (!tech) {
      alert("Please select a technician to allocate this work.");
      return;
    }
    const sample = window.state.processingWorklist.find(w => w.specId === specId);
    if (sample) {
      sample.assignedTech = tech;
      sample.assignedBench = "Bench 1";
      sample.assignedInstrument = sample.analyzer;
      // Add audit log
      window.state.lisAuditLogs.unshift({
        timestamp: new Date().toLocaleTimeString('en-IN') + ' ' + new Date().toLocaleDateString('en-IN'),
        user: "Lab Supervisor",
        action: "Work Allocated",
        details: `Sample ${specId} assigned to ${tech} on Bench 1`
      });
      window.renderWorklist();
      alert(`Sample ${specId} successfully assigned to ${tech}.`);
    }
  };

  // NABL COMPLIANCE TAB SWITCHER
  window.switchComplianceTab = function(tabName) {
    const tabs = ['audit', 'equip', 'retain'];
    tabs.forEach(t => {
      const btn = document.getElementById('btn-comp-' + t);
      if (btn) {
        if (t === tabName) {
          btn.style.background = '#EFF6FF';
          btn.style.color = '#1E40AF';
        } else {
          btn.style.background = 'transparent';
          btn.style.color = 'var(--text-primary)';
        }
      }
    });

    const content = document.getElementById('compliance-tab-content');
    if (!content) return;

    if (tabName === 'audit') {
      content.innerHTML = `
        <table style="width:100%; border-collapse:collapse; font-size:0.68rem; line-height:1.6;">
          <thead>
            <tr style="border-bottom:1px solid #cbd5e1; text-align:left; background:#f8fafc;">
              <th style="padding:4px;">Timestamp</th>
              <th style="padding:4px;">User</th>
              <th style="padding:4px;">Action</th>
              <th style="padding:4px;">Details</th>
            </tr>
          </thead>
          <tbody id="compliance-audit-tbody">
            ${window.state.lisAuditLogs.map(log => `
              <tr style="border-bottom:1px dashed #e2e8f0;">
                <td style="padding:4px;" class="admin-mono font-semibold">${log.timestamp}</td>
                <td style="padding:4px;"><strong>${log.user}</strong></td>
                <td style="padding:4px; color:#1E3A8A;">${log.action}</td>
                <td style="padding:4px; font-style:italic;">${log.details}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
    } else if (tabName === 'equip') {
      content.innerHTML = `
        <table style="width:100%; border-collapse:collapse; font-size:0.68rem; line-height:1.6;">
          <thead>
            <tr style="border-bottom:1px solid #cbd5e1; text-align:left; background:#f8fafc;">
              <th style="padding:4px;">Analyzer Name</th>
              <th style="padding:4px;">Type</th>
              <th style="padding:4px;">Calib Status</th>
              <th style="padding:4px;">Next Calibration Due</th>
              <th style="padding:4px;">Next Preventive Maintenance</th>
            </tr>
          </thead>
          <tbody>
            ${window.state.lisEquipments.map(eq => `
              <tr style="border-bottom:1px dashed #e2e8f0;">
                <td style="padding:4px;"><strong>${eq.name}</strong></td>
                <td style="padding:4px;">${eq.type}</td>
                <td style="padding:4px; color:${eq.status === 'Calibrated' ? '#059669' : '#D97706'}; font-weight:bold;">${eq.status}</td>
                <td style="padding:4px;">${eq.nextCalib}</td>
                <td style="padding:4px;">${eq.pmSchedule}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
    } else if (tabName === 'retain') {
      content.innerHTML = `
        <table style="width:100%; border-collapse:collapse; font-size:0.68rem; line-height:1.6;">
          <thead>
            <tr style="border-bottom:1px solid #cbd5e1; text-align:left; background:#f8fafc;">
              <th style="padding:4px;">Sample ID</th>
              <th style="padding:4px;">Patient Name</th>
              <th style="padding:4px;">Storage Location</th>
              <th style="padding:4px;">Storage Date</th>
              <th style="padding:4px;">Disposal Date</th>
              <th style="padding:4px;">Status</th>
            </tr>
          </thead>
          <tbody>
            ${window.state.lisSampleStorage.map(s => `
              <tr style="border-bottom:1px dashed #e2e8f0;">
                <td style="padding:4px;" class="admin-mono">${s.sampleId}</td>
                <td style="padding:4px;"><strong>${s.patientName || s.name}</strong></td>
                <td style="padding:4px; font-weight:semibold;">${s.rackNo} - ${s.rowNo}</td>
                <td style="padding:4px;">${s.retainDate}</td>
                <td style="padding:4px; color:#EF4444;">${s.disposalDate}</td>
                <td style="padding:4px; color:#059669; font-weight:bold;">${s.status}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
    }
  };

  window.renderLisAuditLogs = function() {
    window.switchComplianceTab('audit');
  };

  window.exportComplianceReport = function(type) {
    alert(`NABL QA Export Action:\nDownloading compliance report details in ${type} spreadsheet format...\nDaily Test Volume & TAT performance metrics compiled.`);
  };

  // DASHBOARD FILTERS LOGIC
  window.applyDashboardFilters = function() {
    const fDept = document.getElementById('lis-filter-dept').value;
    const fDoc = document.getElementById('lis-filter-doctor').value;
    const fTech = document.getElementById('lis-filter-tech').value;
    const fStatus = document.getElementById('lis-filter-status').value;
    const fPriority = document.getElementById('lis-filter-priority').value;

    // Filter Phlebotomy Queue Items visually
    const phlebItems = document.querySelectorAll('#phleb-queue-container > div');
    window.state.phlebotomyQueue.forEach((p, idx) => {
      const itemEl = phlebItems[idx];
      if (!itemEl) return;
      let show = true;
      if (fDoc && !p.doctor.includes(fDoc)) show = false;
      if (fStatus && p.status !== fStatus) show = false;
      if (fPriority && p.priority !== fPriority) show = false;
      itemEl.style.display = show ? '' : 'none';
    });

    // Filter Processing Worklist Items visually
    const workItems = document.querySelectorAll('#processing-worklist-container > div');
    window.state.processingWorklist.forEach((w, idx) => {
      const itemEl = workItems[idx];
      if (!itemEl) return;
      let show = true;
      if (fDept && w.dept !== fDept) show = false;
      if (fTech && w.assignedTech !== 'Tech ' + fTech) show = false;
      if (fStatus && w.status !== fStatus) show = false;
      itemEl.style.display = show ? '' : 'none';
    });
  };

  window.clearDashboardFilters = function() {
    document.getElementById('lis-filter-date').value = '';
    document.getElementById('lis-filter-dept').value = '';
    document.getElementById('lis-filter-doctor').value = '';
    document.getElementById('lis-filter-tech').value = '';
    document.getElementById('lis-filter-status').value = '';
    document.getElementById('lis-filter-priority').value = '';
    window.applyDashboardFilters();
  };

})();
