(function () {
  'use strict';

  function runSeeder() {
    if (!window.state || !window.state.wards) {
      setTimeout(runSeeder, 50);
      return;
    }

    if (localStorage.getItem('saronil_seeder_200_v8') === 'true' && window.state.patients && window.state.patients.length > 200) {
      console.log('[UnifiedSeeder] Database already has seeded patients, skipping re-seed.');
      return;
    }

    console.log('[UnifiedSeeder] Starting database reset and seeding 200 patients...');

    // Clear existing patient transactional data
    window.state.patients = [];
    window.state.appointments = [];
    window.state.admissions = [];
    window.state.daycareAdmissions = [];
    window.state.billing = [];
    window.state.orders = [];
    window.state.labOrders = [];
    window.state.radOrders = [];
    window.state.bedsStatus = {};
    window.state.dischargeOrders = [];
    window.state.atdClearanceLogs = [];
    window.state.transferRequests = [];
    window.state.admissionRequests = [];

    // Initialize all beds as Available
    for (const [wardKey, wardInfo] of Object.entries(window.state.wards)) {
      for (const bed of wardInfo.beds) {
        window.state.bedsStatus[bed] = {
          wardKey: wardKey,
          status: "Available",
          patientUhid: null,
          notes: ""
        };
      }
    }

    // Indian Name Pools
    const maleNames = ['Aarav', 'Vihaan', 'Aditya', 'Arjun', 'Sai', 'Krishna', 'Sunil', 'Rajesh', 'Suresh', 'Ramesh', 'Amit', 'Vikram', 'Sanjay', 'Deepak', 'Ganesh', 'Karthik', 'Naveen', 'Girish', 'Harish', 'Prasad', 'Manoj', 'Ravi', 'Kiran', 'Nagaraj', 'Balaji', 'Vijay', 'Abhishek', 'Rahul', 'Rohit', 'Sandeep', 'Anil', 'Alok', 'Vivek', 'Siddharth', 'Jatin', 'Kunal', 'Ishaan', 'Kabir', 'Rohan', 'Varun', 'Nitin', 'Tarun', 'Anuj', 'Harsh', 'Mayank', 'Piyush', 'Rishabh', 'Puneet', 'Gaurav', 'Manish'];
    const femaleNames = ['Priya', 'Lakshmi', 'Sunita', 'Geeta', 'Sushma', 'Radha', 'Kavya', 'Deepa', 'Anita', 'Meena', 'Rekha', 'Vani', 'Uma', 'Padma', 'Shobha', 'Roopa', 'Bhavya', 'Divya', 'Nandini', 'Sowmya', 'Aishwarya', 'Pooja', 'Sneha', 'Anjali', 'Shruti', 'Vidya', 'Swati', 'Chaitra', 'Fatima', 'Ayesha', 'Zainab', 'Nadia', 'Saira', 'Mary', 'Sarah', 'Grace', 'Rita', 'Simran', 'Gurleen', 'Harleen'];
    const lastNames = ['Kumar', 'Sharma', 'Verma', 'Gupta', 'Reddy', 'Nair', 'Iyer', 'Rao', 'Shetty', 'Gowda', 'Murthy', 'Prasad', 'Naidu', 'Menon', 'Pillai', 'Bhat', 'Desai', 'Patel', 'Yadav', 'Joshi', 'Nayak', 'Acharya', 'Pai', 'Kamath', 'Shenoy', 'Khan', 'Sheikh', 'Ahmed', 'Ansari', 'Syed', 'Singh', 'Kaur', 'Chawla', 'Kapoor', 'Mehta', 'Srinivasan', 'Jain', 'Bansal', 'Agarwal', 'Mishra', 'Pandey', 'Tripathi', 'Trivedi', 'Chatterjee', 'Mukherjee', 'Banerjee', 'Das', 'Sen', 'Roy', 'Choudhury', 'Dutta'];

    const doctors = [
      { name: 'Dr. Amit Verma', spec: 'Sr. Consultant', dept: 'General Medicine' },
      { name: 'Dr. Srinivasan', spec: 'General Medicine', dept: 'General Medicine' },
      { name: 'Dr. Ramesh Iyer', spec: 'Pediatrics', dept: 'Pediatrics' },
      { name: 'Dr. Krishnamurthy', spec: 'Psychiatry', dept: 'Psychiatry' },
      { name: 'Dr. Mehta', spec: 'General Surgery', dept: 'General Surgery' },
      { name: 'Dr. Priya Nair', spec: 'Gynecology & Obs', dept: 'Gynecology & Obs' },
      { name: 'Dr. Fatima Sheikh', spec: 'Emergency Medicine', dept: 'Emergency Medicine' },
      { name: 'Dr. Anand', spec: 'Cardiology', dept: 'Cardiology' }
    ];

    const ipdBeds = [
      { bed: 'GWM-101-B1', wardKey: 'GENERAL-WARD-M', wardName: 'General Ward (Male)' },
      { bed: 'GWM-101-B2', wardKey: 'GENERAL-WARD-M', wardName: 'General Ward (Male)' },
      { bed: 'GWM-101-B3', wardKey: 'GENERAL-WARD-M', wardName: 'General Ward (Male)' },
      { bed: 'GWM-101-B4', wardKey: 'GENERAL-WARD-M', wardName: 'General Ward (Male)' },
      { bed: 'GWF-103-B1', wardKey: 'GENERAL-WARD-F', wardName: 'General Ward (Female)' },
      { bed: 'GWF-103-B2', wardKey: 'GENERAL-WARD-F', wardName: 'General Ward (Female)' },
      { bed: 'GWF-103-B3', wardKey: 'GENERAL-WARD-F', wardName: 'General Ward (Female)' },
      { bed: 'GWF-103-B4', wardKey: 'GENERAL-WARD-F', wardName: 'General Ward (Female)' },
      { bed: 'SP-201-A', wardKey: 'SEMI-PRIVATE', wardName: 'Semi-Private Ward' },
      { bed: 'SP-201-B', wardKey: 'SEMI-PRIVATE', wardName: 'Semi-Private Ward' },
      { bed: 'SP-202-A', wardKey: 'SEMI-PRIVATE', wardName: 'Semi-Private Ward' },
      { bed: 'SP-202-B', wardKey: 'SEMI-PRIVATE', wardName: 'Semi-Private Ward' },
      { bed: 'PVT-301', wardKey: 'PRIVATE', wardName: 'Private Room' },
      { bed: 'PVT-302', wardKey: 'PRIVATE', wardName: 'Private Room' },
      { bed: 'PVT-303', wardKey: 'PRIVATE', wardName: 'Private Room' },
      { bed: 'PVT-304', wardKey: 'PRIVATE', wardName: 'Private Room' },
      { bed: 'DLX-401', wardKey: 'DELUXE', wardName: 'Deluxe Suite' },
      { bed: 'DLX-402', wardKey: 'DELUXE', wardName: 'Deluxe Suite' },
      { bed: 'CCU-B1', wardKey: 'CCU', wardName: 'Critical Care Unit' },
      { bed: 'CCU-B2', wardKey: 'CCU', wardName: 'Critical Care Unit' },
      { bed: 'ICCU-B1', wardKey: 'ICCU', wardName: 'Intensive Cardiac Care Unit' },
      { bed: 'ICCU-B2', wardKey: 'ICCU', wardName: 'Intensive Cardiac Care Unit' }
    ];

    const emgBeds = ['ER-1-B1', 'ER-1-B2'];
    const dcBeds = ['DC-BED-1', 'DC-BED-2', 'DC-BED-3'];

    // Collect Checked-In OPD patients to sync with opdQueue
    const checkedInOpdQueue = [];

    let seed = 12345;
    function random() {
      let x = Math.sin(seed++) * 10000;
      return x - Math.floor(x);
    }

    const todayStr = new Date().toISOString().slice(0, 10);

    for (let i = 0; i < 200; i++) {
      const gender = (random() < 0.5) ? 'Male' : 'Female';
      const first = (gender === 'Male') ? maleNames[Math.floor(random() * maleNames.length)] : femaleNames[Math.floor(random() * femaleNames.length)];
      const last = lastNames[Math.floor(random() * lastNames.length)];
      const name = first + ' ' + last;
      const uhid = `SH-2026-${String(10001 + i)}`;

      // Cover all age groups
      let age;
      if (i % 5 === 0) {
        age = Math.floor(random() * 3); // Infant (0 - 2)
      } else if (i % 5 === 1) {
        age = 3 + Math.floor(random() * 10); // Pediatric (3 - 12)
      } else if (i % 5 === 2) {
        age = 13 + Math.floor(random() * 5); // Adolescent (13 - 17)
      } else if (i % 5 === 3) {
        age = 18 + Math.floor(random() * 42); // Adult (18 - 59)
      } else {
        age = 60 + Math.floor(random() * 36); // Geriatric (60 - 95)
      }

      // Assign specialty and doctor based on age and indices
      let spec, docName, dept;
      if (age <= 12) {
        spec = 'Pediatrics';
        docName = 'Dr. Ramesh Iyer';
        dept = 'Pediatrics';
      } else {
        const dObj = doctors[Math.floor(random() * doctors.length)];
        spec = dObj.spec;
        docName = dObj.name;
        dept = dObj.dept;
      }

      let type, status, bed, ward, ipNumber = '—', opNumber = '—';
      let bedDetails = null;

      // 1. IPD (20 patients)
      if (i < 20) {
        type = 'IPD';
        status = 'Admitted';
        bedDetails = ipdBeds[i];
        bed = bedDetails.bed;
        ward = bedDetails.wardName;
        ipNumber = `IP-2026-${String(50001 + i)}`;
      }
      // 2. OPD Appointments (14 patients)
      else if (i >= 20 && i < 34) {
        type = 'OPD';
        status = (i % 3 === 0) ? 'Checked In' : ((i % 3 === 1) ? 'In Consultation' : 'Scheduled');
        bed = '—';
        ward = 'OPD';
        opNumber = `OP-2026-${String(60001 + i)}`;
        
        // Distribute doctors deterministically so each doctor gets Checked In patients
        const docIndex = (i - 20) % doctors.length;
        const dObj = doctors[docIndex];
        spec = dObj.spec;
        docName = dObj.name;
        dept = dObj.dept;
      }
      // 3. Emergency (2 patients)
      else if (i >= 34 && i < 36) {
        type = 'Emergency';
        status = 'Admitted';
        bed = emgBeds[i - 34];
        ward = 'EMERGENCY';
        ipNumber = `IP-EMG-${String(70001 + i)}`;
      }
      // 4. Daycare (3 patients)
      else if (i >= 36 && i < 39) {
        type = 'Daycare';
        status = 'Admitted';
        bed = dcBeds[i - 36];
        ward = 'DAYCARE';
        ipNumber = `IP-DC-${String(80001 + i)}`;
      }
      // 5. Old Patients (161 patients)
      else {
        type = (i % 2 === 0) ? 'OPD' : 'IPD';
        status = 'Discharged';
        bed = '—';
        ward = '—';
        if (type === 'IPD') ipNumber = `IP-HIST-${String(90001 + i)}`;
        else opNumber = `OP-HIST-${String(90001 + i)}`;
      }

      const p = {
        uhid: uhid,
        name: name,
        age: age,
        gender: gender,
        type: type,
        status: status,
        ward: ward,
        bed: bed,
        primaryConsultant: docName,
        department: dept,
        mobile: `98${String(10000000 + Math.floor(random() * 90000000)).slice(0, 8)}`,
        email: `${first.toLowerCase()}.${last.toLowerCase()}@example.com`,
        bloodGroup: ['O+', 'A+', 'B+', 'AB+', 'O-', 'A-', 'B-', 'AB-'][Math.floor(random() * 8)],
        allergies: (random() < 0.1) ? 'Penicillin' : 'None',
        ipNumber: ipNumber,
        opNumber: opNumber,
        admitted: (status === 'Checked In')
          ? (window._HIS_PRETTY ? window._HIS_PRETTY(0, '09:15') : new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }))
          : new Date(Date.now() - (i % 10) * 86400000).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
        payer: (random() < 0.4) ? 'Star Health' : ((random() < 0.7) ? 'HDFC ERGO' : 'Self Pay'),
        payerType: (random() < 0.7) ? 'TPA/Insurance' : 'Cash',
        alerts: [],
        flags: [],
        vitals: {
          bp: `${110 + Math.floor(random() * 20)}/${70 + Math.floor(random() * 15)}`,
          hr: 60 + Math.floor(random() * 30),
          temp: (98.0 + random() * 1.5).toFixed(1),
          spo2: 95 + Math.floor(random() * 5),
          weight: 10 + Math.floor(random() * 70),
          bmi: 20 + Math.floor(random() * 5),
          pain: Math.floor(random() * 3),
          rr: 14 + Math.floor(random() * 6)
        },
        clinicalData: {
          complaint: "Routine evaluation checkup",
          hpi: "Patient presents for regular diagnostic check.",
          examination: "Systemic parameters normal.",
          diagnosis: "Evaluation Checkup",
          treatmentPlan: "Observation",
          carePlan: "Follow up as advised."
        },
        history: { pastConditions: 'None', surgeries: 'None', familyHistory: 'None' },
        prescriptions: []
      };

      // Add active structures
      if (type === 'IPD' && status === 'Admitted') {
        window.state.bedsStatus[bed] = {
          wardKey: bedDetails.wardKey,
          status: 'Occupied',
          patientUhid: uhid,
          notes: 'Admitted'
        };
        window.state.admissions.push({
          id: 'ADM-' + uhid,
          uhid: uhid,
          patientName: name,
          doctorName: docName,
          ward: bedDetails.wardKey,
          bed: bed,
          date: todayStr,
          status: 'Active'
        });
      } else if (type === 'OPD') {
        const isDischarged = (status === 'Discharged');
        window.state.appointments.push({
          id: 'APT-' + uhid,
          uhid: uhid,
          patientName: name,
          doctorName: docName,
          deptName: dept,
          time: '10:30 AM',
          date: isDischarged ? new Date(Date.now() - (i % 10 || 1) * 86400000).toISOString().slice(0, 10) : todayStr,
          status: isDischarged ? 'Completed' : (status === 'Checked In' ? 'Arrived' : (status === 'In Consultation' ? 'In Consultation' : 'Scheduled')),
          mobile: p.mobile,
          gender: gender,
          age: age,
          visitType: 'OPD Regular'
        });
      } else if (type === 'Emergency' && status === 'Admitted') {
        window.state.bedsStatus[bed] = {
          wardKey: 'EMERGENCY',
          status: 'Occupied',
          patientUhid: uhid,
          notes: 'Emergency Admission'
        };
      } else if (type === 'Daycare' && status === 'Admitted') {
        window.state.bedsStatus[bed] = {
          wardKey: 'DAYCARE',
          status: 'Occupied',
          patientUhid: uhid,
          notes: 'Daycare Admission'
        };
        window.state.daycareAdmissions.push({
          patient: p,
          bedId: bed,
          ward: 'Daycare Ward',
          bedNo: bed,
          consultantName: docName,
          procedureName: 'Daycare Infusion / Therapy',
          admissionType: 'Daycare',
          admissionTimestamp: new Date().toISOString(),
          status: 'Registered',
          dischargeClearances: { clinical: false, billing: false, summaryReady: false }
        });
      }

      window.state.patients.push(p);

      // Collect Checked-In OPD patients for opdQueue sync
      if (type === 'OPD' && status === 'Checked In') {
        const tokenNum = 200 + (checkedInOpdQueue.length + 1);
        checkedInOpdQueue.push({
          token: `OPD-TK-${tokenNum}`,
          patient: name,
          uhid: uhid,
          doctor: docName,
          speciality: spec,
          status: 'Waiting',
          time: `${9 + checkedInOpdQueue.length}:${String(15 + (checkedInOpdQueue.length * 10) % 60).padStart(2, '0')} AM`,
          waitTime: 10 + (checkedInOpdQueue.length * 12)
        });
      }

      // Create Billing Invoices
      window.state.billing.push({
        id: 'INV-' + uhid,
        uhid: uhid,
        patientName: name,
        amount: 1500 + (i * 200) % 8000,
        paid: status === 'Discharged' ? 1500 + (i * 200) % 8000 : 0,
        status: status === 'Discharged' ? 'Paid' : 'Pending',
        date: todayStr,
        items: [
          { desc: 'Consultation Fee', qty: 1, rate: 800, total: 800 },
          { desc: 'Hospital Service Charges', qty: 1, rate: 700 + (i * 200) % 7200, total: 700 + (i * 200) % 7200 }
        ]
      });

      // Create Lab Orders (~40% of patients)
      if (random() < 0.4) {
        window.state.labOrders.push({
          id: 'LO-' + String(100 + i),
          uhid: uhid,
          patientName: name,
          ward: bed || 'OPD',
          test: 'Complete Blood Count (CBC)',
          dept: 'Haematology',
          tube: 'lavender',
          priority: 'Routine',
          orderedBy: docName,
          orderedAt: todayStr,
          status: status === 'Discharged' ? 'Completed' : 'Pending',
          accNo: 'ACC-' + String(50000 + i)
        });
      }
    }

    // Define the 10 original prototype OPD patients with their authentic clinical history & vitals
    const prototypeOpdPatients = [
      {
        uhid: "SH-2026-04817", name: "Sunita Sharma", age: 29, gender: "Female",
        type: "OPD", ward: "OPD Room 2", bed: "—", los: 1,
        primaryConsultant: "Dr. Priya Nair", department: "Gynecology & Obs",
        payer: "Cash Tariff", payerType: "Cash", preAuthStatus: "—",
        alerts: [], newsScore: 0, status: "In Consultation", lastActivity: "Registered · 11:15 AM",
        vitals: { bp: "115/75", hr: 76, temp: "98.2", spo2: 99, weight: 52, bmi: 20.3, pain: 1, rr: 14 },
        prescriptions: [],
        clinicalData: { complaint: "Mild lower back discomfort", hpi: "Backache since 2 days", examination: "NAD", diagnosis: "Evaluation", treatmentPlan: "Rest and warm packs", carePlan: "Follow up as needed" },
        history: { pastConditions: "None", surgeries: "None", familyHistory: "None" },
        bloodGroup: "B+", allergies: "None", mobile: "9845011005", flags: [], admitted: todayStr + ' · 11:15 AM', ipNumber: "—", opNumber: "OP-240004", vitalsOverdue: false, labsUnreviewed: false,
        dischargeClearances: { clinical: false, billing: false, summaryReady: false }
      },
      {
        uhid: "SH-2026-04826", name: "Meera Iyer", age: 8, gender: "Female",
        type: "OPD", ward: "Paediatrics Room 1", bed: "—", los: 1,
        primaryConsultant: "Dr. Ramesh Iyer", department: "Pediatrics",
        payer: "Cash Tariff", payerType: "Cash", preAuthStatus: "—",
        alerts: [], newsScore: 0, status: "Waiting", lastActivity: "Registration · 13:30 PM",
        vitals: { bp: "100/60", hr: 95, temp: "99.1", spo2: 99, weight: 24, bmi: 15.6, pain: 1, rr: 20 },
        prescriptions: [],
        clinicalData: { complaint: "Mild cough and running nose", hpi: "Cold since 3 days", examination: "Chest clear", diagnosis: "Acute Rhinopharyngitis", treatmentPlan: "Saline nasal drops, hydration", carePlan: "Follow up if fever develops" },
        history: { pastConditions: "None", surgeries: "None", familyHistory: "None" },
        bloodGroup: "A+", allergies: "None", mobile: "9845011013", flags: [], admitted: todayStr + ' · 01:30 PM', ipNumber: "—", opNumber: "OP-240012", vitalsOverdue: false, labsUnreviewed: false,
        dischargeClearances: { clinical: false, billing: false, summaryReady: false }
      },
      {
        uhid: "SH-2026-04861", name: "Amit Sharma", age: 34, gender: "Male",
        type: "OPD", ward: "OPD Room 1", bed: "—", los: 1,
        primaryConsultant: "Dr. Srinivasan", department: "General Medicine",
        payer: "Cash Tariff", payerType: "Cash", preAuthStatus: "—",
        alerts: [], newsScore: 0, status: "Waiting", lastActivity: "Registration · 09:00 AM",
        vitals: { bp: "120/80", hr: 72, temp: "98.4", spo2: 99, weight: 70, bmi: 22.8, pain: 0, rr: 16 },
        prescriptions: [],
        clinicalData: { complaint: "Routine health checkup", hpi: "None", examination: "NAD", diagnosis: "Routine Check", treatmentPlan: "None", carePlan: "Annual follow-up" },
        history: { pastConditions: "None", surgeries: "None", familyHistory: "None" },
        bloodGroup: "O+", allergies: "None", mobile: "9845011031", flags: [], admitted: todayStr + ' · 09:00 AM', ipNumber: "—", opNumber: "OP-240061", vitalsOverdue: false, labsUnreviewed: false,
        dischargeClearances: { clinical: false, billing: false, summaryReady: false }
      },
      {
        uhid: "SH-2026-04862", name: "Rohan Verma", age: 28, gender: "Male",
        type: "OPD", ward: "OPD Room 1", bed: "—", los: 1,
        primaryConsultant: "Dr. Amit Verma", department: "General Medicine",
        payer: "Cash Tariff", payerType: "Cash", preAuthStatus: "—",
        alerts: [], newsScore: 0, status: "Checked In", lastActivity: "Registered · 09:15 AM",
        vitals: { bp: "118/75", hr: 70, temp: "98.2", spo2: 99, weight: 68, bmi: 22.0, pain: 0, rr: 14 },
        prescriptions: [],
        clinicalData: { complaint: "Mild headache and body pain", hpi: "Headache since 1 day", examination: "NAD", diagnosis: "Tension Headache", treatmentPlan: "Analgesics", carePlan: "Follow up SOS" },
        history: { pastConditions: "None", surgeries: "None", familyHistory: "None" },
        bloodGroup: "B+", allergies: "None", mobile: "9845011032", flags: [], admitted: todayStr + ' · 09:15 AM', ipNumber: "—", opNumber: "OP-240062", vitalsOverdue: false, labsUnreviewed: false,
        dischargeClearances: { clinical: false, billing: false, summaryReady: false }
      },
      {
        uhid: "SH-2026-04863", name: "Sanjay Joshi", age: 42, gender: "Male",
        type: "OPD", ward: "OPD Room 3", bed: "—", los: 1,
        primaryConsultant: "Dr. Mehta", department: "General Surgery",
        payer: "Cash Tariff", payerType: "Cash", preAuthStatus: "—",
        alerts: [], newsScore: 0, status: "Waiting", lastActivity: "Registration · 09:30 AM",
        vitals: { bp: "125/82", hr: 75, temp: "98.4", spo2: 98, weight: 75, bmi: 24.5, pain: 1, rr: 16 },
        prescriptions: [],
        clinicalData: { complaint: "Post-op follow-up check", hpi: "None", examination: "Surgical wound healing well", diagnosis: "Post-Op Stable", treatmentPlan: "Suture line cleaning", carePlan: "Normal activities" },
        history: { pastConditions: "Hernia", surgeries: "Hernioplasty", familyHistory: "None" },
        bloodGroup: "A-", allergies: "None", mobile: "9845011033", flags: [], admitted: todayStr + ' · 09:30 AM', ipNumber: "—", opNumber: "OP-240063", vitalsOverdue: false, labsUnreviewed: false,
        dischargeClearances: { clinical: false, billing: false, summaryReady: false }
      },
      {
        uhid: "SH-2026-04864", name: "Kiran Patel", age: 31, gender: "Female",
        type: "OPD", ward: "OPD Room 2", bed: "—", los: 1,
        primaryConsultant: "Dr. Amit Verma", department: "Gynecology & Obs",
        payer: "Cash Tariff", payerType: "Cash", preAuthStatus: "—",
        alerts: [], newsScore: 0, status: "Checked In", lastActivity: "Registered · 09:45 AM",
        vitals: { bp: "110/70", hr: 74, temp: "98.6", spo2: 99, weight: 55, bmi: 21.0, pain: 0, rr: 14 },
        prescriptions: [],
        clinicalData: { complaint: "Antenatal checkup", hpi: "First trimester", examination: "NAD", diagnosis: "Early Pregnancy", treatmentPlan: "Iron, Folic Acid supplements", carePlan: "Monthly checkup" },
        history: { pastConditions: "None", surgeries: "None", familyHistory: "None" },
        bloodGroup: "AB+", allergies: "None", mobile: "9845011034", flags: [], admitted: todayStr + ' · 09:45 AM', ipNumber: "—", opNumber: "OP-240064", vitalsOverdue: false, labsUnreviewed: false,
        dischargeClearances: { clinical: false, billing: false, summaryReady: false }
      },
      {
        uhid: "SH-2026-04865", name: "Divya Reddy", age: 36, gender: "Female",
        type: "OPD", ward: "OPD Room 2", bed: "—", los: 1,
        primaryConsultant: "Dr. Priya Nair", department: "Gynecology & Obs",
        payer: "Cash Tariff", payerType: "Cash", preAuthStatus: "—",
        alerts: [], newsScore: 0, status: "Waiting", lastActivity: "Registration · 10:00 AM",
        vitals: { bp: "115/78", hr: 76, temp: "98.4", spo2: 99, weight: 60, bmi: 23.4, pain: 0, rr: 16 },
        prescriptions: [],
        clinicalData: { complaint: "Routine follow-up", hpi: "None", examination: "NAD", diagnosis: "Stable", treatmentPlan: "Continue meds", carePlan: "Follow up 3 months" },
        history: { pastConditions: "None", surgeries: "None", familyHistory: "None" },
        bloodGroup: "O-", allergies: "None", mobile: "9845011035", flags: [], admitted: todayStr + ' · 10:00 AM', ipNumber: "—", opNumber: "OP-240065", vitalsOverdue: false, labsUnreviewed: false,
        dischargeClearances: { clinical: false, billing: false, summaryReady: false }
      },
      {
        uhid: "SH-2026-04866", name: "Neha Sen", age: 25, gender: "Female",
        type: "OPD", ward: "OPD Room 4", bed: "—", los: 1,
        primaryConsultant: "Dr. Ramesh Iyer", department: "Pediatrics",
        payer: "Cash Tariff", payerType: "Cash", preAuthStatus: "—",
        alerts: [], newsScore: 0, status: "In Consultation", lastActivity: "Registered · 10:15 AM",
        vitals: { bp: "108/68", hr: 78, temp: "98.6", spo2: 99, weight: 50, bmi: 19.5, pain: 0, rr: 16 },
        prescriptions: [],
        clinicalData: { complaint: "Acne and skin evaluation", hpi: "Mild acne breakout", examination: "NAD", diagnosis: "Acne Vulgaris", treatmentPlan: "Topical gels, face wash", carePlan: "Avoid oily food" },
        history: { pastConditions: "None", surgeries: "None", familyHistory: "None" },
        bloodGroup: "A+", allergies: "None", mobile: "9845011036", flags: [], admitted: todayStr + ' · 10:15 AM', ipNumber: "—", opNumber: "OP-240066", vitalsOverdue: false, labsUnreviewed: false,
        dischargeClearances: { clinical: false, billing: false, summaryReady: false }
      },
      {
        uhid: "SH-2026-04867", name: "Vijay Das", age: 58, gender: "Male",
        type: "OPD", ward: "OPD Room 1", bed: "—", los: 1,
        primaryConsultant: "Dr. Srinivasan", department: "General Medicine",
        payer: "Cash Tariff", payerType: "Cash", preAuthStatus: "—",
        alerts: [], newsScore: 0, status: "Waiting", lastActivity: "Registration · 10:30 AM",
        vitals: { bp: "140/90", hr: 80, temp: "98.4", spo2: 98, weight: 82, bmi: 26.1, pain: 0, rr: 18 },
        prescriptions: [],
        clinicalData: { complaint: "High BP checking", hpi: "None", examination: "NAD", diagnosis: "Hypertension Stage 1", treatmentPlan: "Amlodipine 5mg daily", carePlan: "Daily BP chart" },
        history: { pastConditions: "HTN", surgeries: "None", familyHistory: "Hypertension" },
        bloodGroup: "B-", allergies: "None", mobile: "9845011037", flags: [], admitted: todayStr + ' · 10:30 AM', ipNumber: "—", opNumber: "OP-240067", vitalsOverdue: false, labsUnreviewed: false,
        dischargeClearances: { clinical: false, billing: false, summaryReady: false }
      },
      {
        uhid: "SH-2026-04868", name: "Asha Rao", age: 50, gender: "Female",
        type: "OPD", ward: "OPD Room 1", bed: "—", los: 1,
        primaryConsultant: "Dr. Amit Verma", department: "General Medicine",
        payer: "Cash Tariff", payerType: "Cash", preAuthStatus: "—",
        alerts: [], newsScore: 0, status: "Checked In", lastActivity: "Registered · 10:45 AM",
        vitals: { bp: "130/85", hr: 75, temp: "98.4", spo2: 98, weight: 65, bmi: 24.3, pain: 0, rr: 16 },
        prescriptions: [],
        clinicalData: { complaint: "Joint pain check", hpi: "Knee pain since 1 month", examination: "NAD", diagnosis: "Mild Osteoarthritis", treatmentPlan: "Calcium, Vitamin D, Physio", carePlan: "Avoid climbing stairs" },
        history: { pastConditions: "None", surgeries: "None", familyHistory: "Osteoarthritis" },
        bloodGroup: "AB-", allergies: "None", mobile: "9845011038", flags: [], admitted: todayStr + ' · 10:45 AM', ipNumber: "—", opNumber: "OP-240068", vitalsOverdue: false, labsUnreviewed: false,
        dischargeClearances: { clinical: false, billing: false, summaryReady: false }
      }
    ];

    // Programmatically set status of prototype patients to Scheduled so the initial queue starts clean
    prototypeOpdPatients.forEach(p => {
      p.status = 'Scheduled';
    });

    // Append prototype OPD patients to state.patients list so they are fully loaded
    window.state.patients.push(...prototypeOpdPatients);

    // Build the dynamic window.state.opdQueue as an empty array initially to start with an empty OPD queue
    window.state.opdQueue = [];

    localStorage.setItem('saronil_opdQueue', JSON.stringify(window.state.opdQueue));

    // Persist all data to localStorage
    localStorage.setItem('saronil_patients', JSON.stringify(window.state.patients));
    localStorage.setItem('saronil_appointments', JSON.stringify(window.state.appointments));
    localStorage.setItem('saronil_admissions', JSON.stringify(window.state.admissions));
    localStorage.setItem('saronil_daycare_admissions', JSON.stringify(window.state.daycareAdmissions));
    localStorage.setItem('saronil_bedsStatus', JSON.stringify(window.state.bedsStatus));
    localStorage.setItem('saronil_billing', JSON.stringify(window.state.billing));
    localStorage.setItem('saronil_labOrders', JSON.stringify(window.state.labOrders));
    localStorage.setItem('saronil_seeder_200_v8', 'true');

    console.log('[UnifiedSeeder] Database successfully reset and seeded with exactly 200 patients!');
  }

  // Hook into window load or execute immediately
  window.reseedDatabase = runSeeder;
  
  // Unconditionally run on script execution to ensure the exact state is achieved
  runSeeder();

  /**
   * Global helper: returns true if the patient with the given UHID is
   * currently an ACTIVE IPD patient (type=IPD, status=Admitted or similar).
   * Used by OPD Queue, Appointment booking, and patient flags across the system.
   */
  window.isActiveIPD = function(uhid) {
    if (!window.state || !window.state.patients) return false;
    const p = window.state.patients.find(pt => pt.uhid === uhid);
    if (!p) return false;
    return p.type === 'IPD' && (
      p.status === 'Admitted' ||
      p.status === 'Under Observation' ||
      p.status === 'Pre-Op' ||
      p.status === 'Post-Op' ||
      p.status === 'Critical'
    );
  };

  /**
   * Returns the active IPD patient object or null.
   */
  window.getActiveIPDPatient = function(uhid) {
    if (!window.state || !window.state.patients) return null;
    const p = window.state.patients.find(pt => pt.uhid === uhid);
    if (!p) return null;
    return window.isActiveIPD(uhid) ? p : null;
  };

  /**
   * Automatically synchronizes window.state.opdQueue with Checked-In/Arrived state.appointments for today
   */
  window.syncOpdQueueWithAppointments = function() {
    if (!window.state || !window.state.appointments) return;
    const systemToday = window._HIS_TODAY || new Date().toISOString().slice(0, 10);
    const activeAppts = window.state.appointments.filter(a => 
      a.date === systemToday && 
      (a.status === 'Arrived' || a.status === 'Waiting' || a.status === 'In Consultation' || a.status === 'Checked In')
    );
    
    window.state.opdQueue = activeAppts.map((a, idx) => {
      const fullPat = window.state.patients ? window.state.patients.find(p => p.uhid === a.uhid) : null;
      return {
        token: a.id || `OPD-TK-${101 + idx}`,
        patient: a.patientName || (fullPat ? fullPat.name : 'Unknown'),
        uhid: a.uhid,
        doctor: a.doctorName,
        speciality: a.spec || a.deptName || 'General Medicine',
        status: a.status === 'Arrived' ? 'Waiting' : (a.status === 'In Consultation' ? 'In Consultation' : a.status),
        time: a.time || '10:00 AM',
        waitTime: 0
      };
    });
    localStorage.setItem('saronil_opdQueue', JSON.stringify(window.state.opdQueue));
  };

})();
