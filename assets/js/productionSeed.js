/* ==========================================================================
   SARONIL HIS — PRODUCTION DATA ENRICHMENT SEED (productionSeed.js)
   Runs AFTER state.js seedState() has executed.
   Provides realistic, workflow-connected test data for every module:
     - OPD Queue & Appointment Queue (Doctor Dashboard + OPD Desk)
     - IPD Bed Board with all wards occupied + pending list
     - Active Discharge Pipeline (2 patients at Clearances stage)
     - Transfer-ready patient (Doctor ordered, coordinator pending)
     - ATD clearance logs per department
     - Emergency triage patients
     - Daycare patients mid-procedure and post-procedure
     - Billing invoices at various pay statuses
   ========================================================================== */

(function() {
  'use strict';

  /* ─── DYNAMIC DATE HELPERS (always relative to today's real date) ─────────── */
  function TODAY()        { return window._HIS_TODAY  || new Date().toISOString().slice(0, 10); }
  function TODAY_PRETTY() { return window._HIS_TODAY_PRETTY || new Date().toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' }); }
  function DAGO(n, t)     { return window._HIS_PRETTY ? window._HIS_PRETTY(n, t) : new Date(Date.now() - n * 86400000).toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' }) + (t ? ' · ' + t : ''); }
  function DISO(n)        { return window._HIS_DATE   ? window._HIS_DATE(n) : new Date(Date.now() - n * 86400000).toISOString().slice(0, 10); }

  /* ─── WAIT UNTIL state IS READY ─────────────────────────────────────────── */
  function enrich() {
    if (!window.state || !window.state.patients || window.state.patients.length < 5) {
      setTimeout(enrich, 50);
      return;
    }
    run();
  }

  function run() {
    try {
      enrichOPDPatients();
      enrichIPDPatients();
      enrichDaycarePatients();
      enrichEmergencyPatients();
      enrichDischargePipeline();
      enrichTransferWorkflow();
      enrichATDClearances();
      enrichBillingInvoices();
      enrichOPDQueue();
      enrichAdmissionPendingList();
      enrichCSSD();
      enrichIPDAdmissionRequests();
      enrichLabRadQueues();
      console.log('[ProductionSeed] ✅ All workflow data enriched successfully.');
    } catch(e) {
      console.error('[ProductionSeed] ❌ Error during enrichment:', e);
    }
  }

  /* ══════════════════════════════════════════════════════════════════════════
     1. OPD PATIENTS — 8 rich outpatients with today's appointments
  ══════════════════════════════════════════════════════════════════════════ */
  function enrichOPDPatients() {
    const opdPatientsDefs = [
      {
        uhid: 'SH-2026-04817', name: 'Sunita Sharma', age: 29, gender: 'Female',
        token: 'OPD-TK-101', waitTime: 42, apptTime: '10:15 AM', apptStatus: 'Checked-in',
        visitType: 'Follow-up', consultant: 'Dr. Priya Nair', spec: 'Gynecology & Obs',
        complaint: 'Mild lower back discomfort', mobile: '9845011005',
        payer: 'Cash Tariff', payerType: 'Cash', opNumber: 'OP-240817',
        bloodGroup: 'B+', allergies: 'None',
        vitals: { bp: '115/75', hr: 76, temp: 98.2, spo2: 99, weight: 52, bmi: 20.3, pain: 1, rr: 14 }
      },
      {
        uhid: 'SH-2026-04826', name: 'Meera Iyer', age: 8, gender: 'Female',
        token: 'OPD-TK-102', waitTime: 18, apptTime: '10:30 AM', apptStatus: 'Checked-in',
        visitType: 'New', consultant: 'Dr. Ramesh Iyer', spec: 'Pediatrics',
        complaint: 'Mild cough and running nose', mobile: '9845011013',
        payer: 'Cash Tariff', payerType: 'Cash', opNumber: 'OP-240826',
        bloodGroup: 'A+', allergies: 'None',
        vitals: { bp: '100/60', hr: 95, temp: 99.1, spo2: 99, weight: 24, bmi: 15.6, pain: 1, rr: 20 }
      },
      {
        uhid: 'SH-2026-04840', name: 'Rajan Pillai', age: 55, gender: 'Male',
        token: 'OPD-TK-103', waitTime: 67, apptTime: '09:45 AM', apptStatus: 'In-Consultation',
        visitType: 'Follow-up', consultant: 'Dr. Srinivasan', spec: 'General Medicine',
        complaint: 'Diabetes follow-up, HbA1c review', mobile: '9812301201',
        payer: 'CGHS', payerType: 'Govt Scheme', opNumber: 'OP-240840',
        bloodGroup: 'O+', allergies: 'None',
        vitals: { bp: '134/86', hr: 80, temp: 98.6, spo2: 97, weight: 82, bmi: 26.1, pain: 0, rr: 16 }
      },
      {
        uhid: 'SH-2026-04845', name: 'Anjali Bose', age: 34, gender: 'Female',
        token: 'OPD-TK-104', waitTime: 28, apptTime: '11:00 AM', apptStatus: 'Checked-in',
        visitType: 'New', consultant: 'Dr. Priya Nair', spec: 'Gynecology & Obs',
        complaint: 'Irregular menstrual cycle', mobile: '9820012345',
        payer: 'Star Health', payerType: 'TPA/Insurance', opNumber: 'OP-240845',
        bloodGroup: 'A+', allergies: 'None',
        vitals: { bp: '112/72', hr: 74, temp: 98.4, spo2: 99, weight: 58, bmi: 22.8, pain: 2, rr: 14 }
      },
      {
        uhid: 'SH-2026-04851', name: 'Pramod Rao', age: 62, gender: 'Male',
        token: 'OPD-TK-105', waitTime: 88, apptTime: '09:00 AM', apptStatus: 'Completed',
        visitType: 'Referral', consultant: 'Dr. Anand', spec: 'Cardiology',
        complaint: 'Chest pain on exertion — referred by Dr. Mehta', mobile: '9988771123',
        payer: 'HDFC ERGO', payerType: 'TPA/Insurance', opNumber: 'OP-240851',
        bloodGroup: 'B+', allergies: 'None',
        vitals: { bp: '150/92', hr: 88, temp: 98.4, spo2: 96, weight: 78, bmi: 25.9, pain: 3, rr: 18 }
      },
      {
        uhid: 'SH-2026-04855', name: 'Nandita Kumari', age: 45, gender: 'Female',
        token: 'OPD-TK-106', waitTime: 5, apptTime: '11:30 AM', apptStatus: 'Scheduled',
        visitType: 'Follow-up', consultant: 'Dr. Krishnamurthy', spec: 'Psychiatry',
        complaint: 'Anxiety disorder management review', mobile: '9901122334',
        payer: 'Self Pay', payerType: 'Cash', opNumber: 'OP-240855',
        bloodGroup: 'O+', allergies: 'None',
        vitals: { bp: '118/78', hr: 72, temp: 98.6, spo2: 99, weight: 62, bmi: 23.9, pain: 1, rr: 14 }
      },
      {
        uhid: 'SH-2026-04862', name: 'Vikrant Gupta', age: 28, gender: 'Male',
        token: 'OPD-TK-107', waitTime: 13, apptTime: '11:15 AM', apptStatus: 'Checked-in',
        visitType: 'New', consultant: 'Dr. Munna Kumar', spec: 'Orthopedics',
        complaint: 'Right knee pain after sports injury', mobile: '9123456789',
        payer: 'ECHS', payerType: 'Govt Scheme', opNumber: 'OP-240862',
        bloodGroup: 'AB+', allergies: 'None',
        vitals: { bp: '120/80', hr: 78, temp: 98.2, spo2: 99, weight: 75, bmi: 23.1, pain: 4, rr: 16 }
      },
      {
        uhid: 'SH-2026-04869', name: 'Kamla Devi', age: 71, gender: 'Female',
        token: 'OPD-TK-108', waitTime: 110, apptTime: '08:45 AM', apptStatus: 'No-show',
        visitType: 'Follow-up', consultant: 'Dr. Srinivasan', spec: 'General Medicine',
        complaint: 'Chronic hypertension management', mobile: '9845001110',
        payer: 'PMJAY', payerType: 'Govt Scheme', opNumber: 'OP-240869',
        bloodGroup: 'B+', allergies: 'Sulfa drugs',
        vitals: { bp: '158/96', hr: 82, temp: 98.4, spo2: 97, weight: 60, bmi: 24.3, pain: 0, rr: 18 }
      }
    ];

    opdPatientsDefs.forEach(def => {
      // Upsert patient record
      let pat = window.state.patients.find(p => p.uhid === def.uhid);
      if (!pat) {
        pat = { uhid: def.uhid };
        window.state.patients.push(pat);
      }
      Object.assign(pat, {
        name: def.name, age: def.age, gender: def.gender,
        type: 'OPD', status: def.apptStatus === 'Completed' ? 'Completed' : 'In Consultation',
        ward: `OPD — ${def.spec}`, bed: '—',
        los: 0, admitted: `${TODAY_PRETTY()} · ${def.apptTime}`,
        primaryConsultant: def.consultant, department: def.spec,
        payer: def.payer, payerType: def.payerType, preAuthStatus: '—',
        mobile: def.mobile, bloodGroup: def.bloodGroup, allergies: def.allergies,
        ipNumber: '—', opNumber: def.opNumber,
        vitals: def.vitals,
        newsScore: 0, alerts: [],
        prescriptions: [],
        clinicalData: {
          complaint: def.complaint, hpi: 'Patient presented for scheduled consultation.',
          examination: 'NAD', diagnosis: 'Evaluation pending', treatmentPlan: 'Symptomatic treatment', carePlan: 'As per consultant advice'
        },
        history: { pastConditions: 'None', surgeries: 'None', familyHistory: 'None' },
        flags: [], vitalsOverdue: false, labsUnreviewed: false,
        dischargeClearances: { clinical: false, billing: false, summaryReady: false },
        timelineEvents: [
          {
            date: `${TODAY_PRETTY()} · ${def.apptTime}`,
            type: 'registration',
            icon: '📋',
            title: 'OPD Registration',
            desc: `Registered for ${def.visitType} consultation with ${def.consultant}. Token: ${def.token}.`
          }
        ]
      });

      // Upsert appointment record
      const existingAppt = window.state.appointments.find(a => a.uhid === def.uhid && a.date === TODAY());
      if (!existingAppt) {
        window.state.appointments.push({
          id: `APT-${def.uhid}-TODAY`,
          uhid: def.uhid,
          patientName: def.name,
          doctorName: def.consultant,
          spec: def.spec,
          deptName: def.spec,
          date: TODAY(),
          time: def.apptTime,
          status: def.apptStatus,
          type: 'OPD Regular',
          visitType: def.visitType,
          mobile: def.mobile,
          gender: def.gender,
          age: def.age,
          waitTime: def.waitTime,
          createdBy: 'Front Desk',
          checkedInTime: def.apptStatus === 'Checked-in' ? def.apptTime : null
        });
      }
    });

    // Rebuild OPD Queue in state for opdDashboard
    window.state.opdQueue = opdPatientsDefs
      .filter(d => ['Checked-in', 'In-Consultation', 'Scheduled'].includes(d.apptStatus))
      .map(d => ({
        token: d.token,
        patient: d.name,
        uhid: d.uhid,
        doctor: d.consultant,
        speciality: d.spec,
        status: d.apptStatus === 'Checked-in' ? 'Waiting' : d.apptStatus === 'Scheduled' ? 'Registered' : 'In Consultation',
        time: d.apptTime,
        waitTime: d.waitTime
      }));
  }

  /* ══════════════════════════════════════════════════════════════════════════
     2. IPD PATIENTS — enrich all IPD patients with deep timeline & vitals
  ══════════════════════════════════════════════════════════════════════════ */
  function enrichIPDPatients() {
    const ipdEnrichments = [
      {
        uhid: 'SH-2026-04821',
        timelineEvents: [
          { date: '26 Jun 2026 · 10:15', type: 'registration', icon: '📋', title: 'Admitted to General Ward', desc: 'Admitted under Dr. Srinivasan for chest discomfort evaluation. Bed B-12 allocated.' },
          { date: '27 Jun 2026 · 09:00', type: 'clinical', icon: '🩺', title: 'Morning Ward Rounds', desc: 'Vitals stable. BP 118/76 mmHg. Plan: Continue IV fluids, monitor cardiac enzymes.' },
          { date: '28 Jun 2026 · 10:15', type: 'lab', icon: '🧪', title: 'Lab Results Received', desc: 'Troponin I: 0.04 ng/mL (borderline). ECG: NSR. Suggest repeat after 6h.' },
          { date: '29 Jun 2026 · 08:30', type: 'clinical', icon: '📝', title: 'Progress Note', desc: 'Patient improved. No fresh complaints. Plan for discharge tomorrow pending TPA approval.' }
        ],
        labResults: [
          { test: 'Troponin I', value: '0.04 ng/mL', reference: '< 0.04', status: 'Borderline', date: '28 Jun 2026' },
          { test: 'CK-MB', value: '18 U/L', reference: '< 25', status: 'Normal', date: '28 Jun 2026' },
          { test: 'HbA1c', value: '5.8%', reference: '< 6.5', status: 'Normal', date: '28 Jun 2026' }
        ]
      },
      {
        uhid: 'SH-2026-04799',
        timelineEvents: [
          { date: '24 Jun 2026 · 08:00', type: 'registration', icon: '📋', title: 'Post-Op Transfer to HDU', desc: 'Mohammed Iqbal transferred to HDU post laparoscopic cholecystectomy under Dr. Mehta.' },
          { date: '25 Jun 2026 · 14:00', type: 'clinical', icon: '🩺', title: 'Surgical Ward Rounds', desc: 'Wound clean, no discharge. Pain score 3/10. Tramadol SOS ordered.' },
          { date: '27 Jun 2026 · 09:30', type: 'lab', icon: '🧪', title: 'Post-Op Labs', desc: 'WBC: 11.2 (mild leukocytosis expected post-op). LFT improving.' },
          { date: '29 Jun 2026 · 09:00', type: 'clinical', icon: '📝', title: 'Surgeon Review', desc: 'Wound healing well. IV antibiotics completed. Oral diet tolerated. Plan: Discharge in 24h.' }
        ],
        labResults: [
          { test: 'WBC', value: '11.2 × 10³/µL', reference: '4.5–11.0', status: 'Mildly Elevated', date: '27 Jun 2026' },
          { test: 'Bilirubin (Total)', value: '1.1 mg/dL', reference: '< 1.2', status: 'Normal', date: '27 Jun 2026' }
        ]
      },
      {
        uhid: 'SH-2026-04788',
        timelineEvents: [
          { date: '27 Jun 2026 · 08:15', type: 'registration', icon: '📋', title: 'Admitted for HTN Evaluation', desc: 'Arun Pillai admitted to HDU-H03 under Dr. Srinivasan. BP 178/110 on admission.' },
          { date: '28 Jun 2026 · 08:00', type: 'clinical', icon: '🩺', title: 'Morning Review', desc: 'BP trending down — 148/92 after adding Amlodipine. Plan: Continue and reassess.' },
          { date: '29 Jun 2026 · 07:45', type: 'clinical', icon: '📝', title: 'Discharge Planning', desc: 'BP 128/80. Stable. Discharge today post final BP check.' }
        ],
        labResults: [
          { test: 'Serum Creatinine', value: '1.1 mg/dL', reference: '0.7–1.3', status: 'Normal', date: '28 Jun 2026' },
          { test: 'Electrolytes (Na)', value: '138 mEq/L', reference: '136–145', status: 'Normal', date: '28 Jun 2026' }
        ]
      },
      {
        uhid: 'SH-2026-04810',
        timelineEvents: [
          { date: '25 Jun 2026 · 09:15', type: 'registration', icon: '📋', title: 'Admitted — Hyperglycaemia', desc: 'Fatima Begum admitted under Dr. Ramesh Iyer for uncontrolled T2DM. FBS 340 mg/dL.' },
          { date: '27 Jun 2026 · 08:30', type: 'lab', icon: '🧪', title: 'Glucometry Trending', desc: 'FBS now 160 mg/dL post IV insulin management. HbA1c: 9.4%.' },
          { date: '29 Jun 2026 · 08:00', type: 'clinical', icon: '📝', title: 'Review by Endocrinologist', desc: 'FBS 130 mg/dL. Start oral Metformin 500mg BD. Educate on SMBG. Discharge planned.' }
        ],
        labResults: [
          { test: 'FBS', value: '130 mg/dL', reference: '70–100', status: 'Elevated', date: '29 Jun 2026' },
          { test: 'HbA1c', value: '9.4%', reference: '< 7.0', status: 'Uncontrolled', date: '27 Jun 2026' }
        ]
      },
      {
        uhid: 'SH-2026-04831',
        timelineEvents: [
          { date: '27 Jun 2026 · 10:00', type: 'registration', icon: '📋', title: 'Admitted — Pelvic Pain', desc: 'Anitha Rao admitted to SP-02 under Dr. Priya Nair for pelvic evaluation.' },
          { date: '28 Jun 2026 · 12:00', type: 'clinical', icon: '🩺', title: 'USG Report', desc: 'USG pelvis: Fibroid uterus (2.1 × 1.8 cm intramural). No free fluid.' },
          { date: '29 Jun 2026 · 09:00', type: 'clinical', icon: '📝', title: 'Discharge Counselling', desc: 'Patient counselled. Discharge with Meftal-Spas, Folic acid. OPD follow-up in 2 weeks.' }
        ],
        labResults: [
          { test: 'Hb', value: '10.2 g/dL', reference: '11.5–15.5', status: 'Low', date: '28 Jun 2026' },
          { test: 'USG Pelvis', value: 'Fibroid uterus 2.1 cm', reference: 'Normal', status: 'Abnormal', date: '28 Jun 2026' }
        ]
      },
      {
        uhid: 'SH-2026-04768',
        timelineEvents: [
          { date: '26 Jun 2026 · 08:30', type: 'registration', icon: '📋', title: 'Admitted — Uncontrolled BP', desc: 'Suresh Babu admitted to SP-05. CGHS beneficiary. BP 170/102 on arrival.' },
          { date: '27 Jun 2026 · 09:00', type: 'clinical', icon: '🩺', title: 'Nephrology Consult', desc: 'eGFR 62 — Stage 2 CKD. Added Telma 40mg to regimen.' },
          { date: '29 Jun 2026 · 08:30', type: 'clinical', icon: '📝', title: 'Near-Discharge Review', desc: 'BP 138/88. Stepping down to semi-private. Discharge planned after CGHS approval.' }
        ],
        labResults: [
          { test: 'Serum Creatinine', value: '1.6 mg/dL', reference: '0.7–1.3', status: 'Elevated', date: '27 Jun 2026' },
          { test: 'eGFR', value: '62 mL/min', reference: '> 90', status: 'Stage 2 CKD', date: '27 Jun 2026' }
        ]
      }
    ];

    ipdEnrichments.forEach(enrichData => {
      const pat = window.state.patients.find(p => p.uhid === enrichData.uhid);
      if (pat) {
        pat.timelineEvents = enrichData.timelineEvents;
        pat.labResults = enrichData.labResults;
      }
    });
  }

  /* ══════════════════════════════════════════════════════════════════════════
     3. DAYCARE PATIENTS — mid-procedure + post-procedure
  ══════════════════════════════════════════════════════════════════════════ */
  function enrichDaycarePatients() {
    const daycareEnrichments = [
      {
        uhid: 'SH-2026-04822', name: 'Kavitha Nair', bed: 'DC-B1', ward: 'DAYCARE',
        procedure: 'Diagnostic Hysteroscopy', status: 'Under Observation',
        consultant: 'Dr. Priya Nair', admittedAt: '29 Jun 2026 · 07:30',
        payer: 'HDFC ERGO', payerType: 'TPA/Insurance',
        vitals: { bp: '120/80', hr: 74, temp: 98.4, spo2: 99, weight: 62, bmi: 23.9, pain: 1, rr: 16 }
      },
      {
        uhid: 'SH-2026-04812', name: 'Rahul Gupta', bed: 'DC-B2', ward: 'DAYCARE',
        procedure: 'IV Chemotherapy — Cycle 2', status: 'Under Observation',
        consultant: 'Dr. Shrawan Kumar', admittedAt: '29 Jun 2026 · 08:00',
        payer: 'Star Health', payerType: 'TPA/Insurance',
        vitals: { bp: '118/76', hr: 72, temp: 98.4, spo2: 99, weight: 65, bmi: 21.8, pain: 1, rr: 16 }
      },
      {
        uhid: 'SH-2026-04801', name: 'Lakshmi Devi', bed: 'DC-B3', ward: 'DAYCARE',
        procedure: 'Wound Dressing Post-Suture', status: 'Discharge Ready',
        consultant: 'Dr. Mehta', admittedAt: '29 Jun 2026 · 09:00',
        payer: 'Self Pay', payerType: 'Cash',
        vitals: { bp: '130/80', hr: 74, temp: 98.4, spo2: 99, weight: 60, bmi: 23.4, pain: 0, rr: 16 }
      }
    ];

    daycareEnrichments.forEach(def => {
      let pat = window.state.patients.find(p => p.uhid === def.uhid);
      if (pat) {
        pat.type = 'Daycare';
        pat.bed = def.bed;
        pat.ward = 'Daycare Bay';
        pat.status = def.status;
        pat.primaryConsultant = def.consultant;
        pat.admitted = def.admittedAt;
        pat.payer = def.payer;
        pat.payerType = def.payerType;
        pat.vitals = def.vitals;
        pat.timelineEvents = pat.timelineEvents || [];
        if (!pat.timelineEvents.some(e => e.title === 'Daycare Admission')) {
          pat.timelineEvents.unshift({
            date: def.admittedAt,
            type: 'registration',
            icon: '🏥',
            title: 'Daycare Admission',
            desc: `Admitted to ${def.bed} under ${def.consultant} for: ${def.procedure}.`
          });
        }
        // Occupy the bed
        window.state.bedsStatus[def.bed] = {
          wardKey: def.ward,
          status: 'Occupied',
          patientUhid: def.uhid,
          notes: `${def.procedure} — ${def.consultant}`
        };
      }
    });
  }

  /* ══════════════════════════════════════════════════════════════════════════
     4. EMERGENCY PATIENTS — active triage
  ══════════════════════════════════════════════════════════════════════════ */
  function enrichEmergencyPatients() {
    let deepak = window.state.patients.find(p => p.uhid === 'SH-2026-04755');
    if (deepak) {
      deepak.type = 'Emergency';
      deepak.bed = 'EMG-01';
      deepak.ward = 'Emergency Bay';
      deepak.status = 'In Triage';
      deepak.newsScore = 7;
      deepak.alerts = ['Critical', 'NEWS7'];
      deepak.flags = ['Critical', 'MLC'];
      deepak.mlcNumber = 'MLC-2026-089';
      deepak.mlcReason = 'RTA — brought by Police';
      deepak.timelineEvents = [
        { date: '29 Jun 2026 · 10:45', type: 'emergency', icon: '🚨', title: 'Emergency Triage', desc: 'Brought by police. RTA. GCS: 13/15. BP 95/60, HR 112, SpO2 91%. Immediate resuscitation started.' },
        { date: '29 Jun 2026 · 11:00', type: 'clinical', icon: '🩺', title: 'Resuscitation Underway', desc: 'IV line secured. NS bolus given. Oxygen @ 8L via mask. XR Chest + Pelvis ordered. MLC raised.' }
      ];
      window.state.bedsStatus['EMG-01'] = {
        wardKey: 'EMERGENCY', status: 'Occupied',
        patientUhid: 'SH-2026-04755',
        notes: 'RTA — Critical | MLC-2026-089'
      };
    }
  }

  /* ══════════════════════════════════════════════════════════════════════════
     5. DISCHARGE PIPELINE — 2 patients at various clearance stages
     Stage A: Clearances in progress (Rajesh Kumar — most clear, billing pending)
     Stage B: Doctor order just issued (Mohammed Iqbal — all pending)
  ══════════════════════════════════════════════════════════════════════════ */
  function enrichDischargePipeline() {
    // Patient A: Rajesh Kumar — Discharge order signed, billing pending
    const rajesh = window.state.patients.find(p => p.uhid === 'SH-2026-04821');
    if (rajesh) {
      rajesh.dischargeStatus = 'In Progress — Clearances Pending';
      rajesh.dischargeInitiatedAt = '2026-06-29T08:00:00Z';
      rajesh.dischargeOrder = {
        type: 'Regular',
        condition: 'Improved',
        finalDiagnosis: 'Non-cardiac Chest Pain (R07.9)',
        icdCodes: [{ code: 'R07.9', description: 'Chest pain, unspecified' }],
        summary: 'Patient Rajesh Kumar admitted for evaluation of chest discomfort. Cardiac enzymes negative ×2. ECG: NSR. Managed conservatively. Vitals stable at discharge.',
        followUpRequired: true,
        followUpDoctor: 'Dr. Srinivasan',
        followUpDate: '2026-07-14',
        followUpNotes: 'Stress test in OPD at 2 weeks.',
        diet: 'Low-fat, low-sodium diet.',
        activity: 'Light activity. Avoid heavy lifting.',
        timestamp: '2026-06-29T08:00:00Z',
        authorName: 'Dr. Srinivasan',
        authorDesignation: 'Consultant, General Medicine',
        pinVerified: true
      };
      rajesh.dischargeClearances = {
        nursing:   { cleared: true,  clearedBy: 'Staff Nurse Mary', clearedAt: '2026-06-29T08:30:00Z', notes: 'Patient counselled. IV line removed.' },
        pharmacy:  { cleared: true,  clearedBy: 'Ph. Satish Kumar', clearedAt: '2026-06-29T09:00:00Z', notes: 'All drugs returned. Take-home Rx dispensed.' },
        tpa:       { cleared: true,  clearedBy: 'TPA Desk', clearedAt: '2026-06-29T09:15:00Z', notes: 'LOA closed. Final claim submitted to Star Health.' },
        billing:   { cleared: false, clearedBy: null, clearedAt: null, notes: 'Final invoice being prepared. Room rent pending 1 day.' }
      };
      rajesh.timelineEvents = rajesh.timelineEvents || [];
      rajesh.timelineEvents.unshift({
        date: '29 Jun 2026 · 08:00',
        type: 'discharge',
        icon: '📤',
        title: 'Discharge Order Issued',
        desc: 'Discharge order signed by Dr. Srinivasan. Department clearances initiated. Nursing & Pharmacy cleared. Billing pending.'
      });
    }

    // Patient B: Mohammed Iqbal — Discharge order just placed, all pending
    const iqbal = window.state.patients.find(p => p.uhid === 'SH-2026-04799');
    if (iqbal) {
      iqbal.dischargeStatus = 'In Progress — Clearances Pending';
      iqbal.dischargeInitiatedAt = '2026-06-29T09:30:00Z';
      iqbal.dischargeOrder = {
        type: 'Regular',
        condition: 'Improved',
        finalDiagnosis: 'Acute Calculous Cholecystitis (K81.0) — Post-Op',
        icdCodes: [{ code: 'K81.0', description: 'Acute cholecystitis' }],
        summary: 'Mohammed Iqbal underwent laparoscopic cholecystectomy under GA. Post-operative recovery uneventful. Wound clean and dry. Oral feeds tolerated. Pain well-controlled.',
        followUpRequired: true,
        followUpDoctor: 'Dr. Mehta',
        followUpDate: '2026-07-08',
        followUpNotes: 'Wound inspection at 10 days.',
        diet: 'Low-fat oral diet. Increase gradually.',
        activity: 'No heavy lifting for 4 weeks.',
        timestamp: '2026-06-29T09:30:00Z',
        authorName: 'Dr. Mehta',
        authorDesignation: 'Consultant, General Surgery',
        pinVerified: true
      };
      iqbal.dischargeClearances = {
        nursing:  { cleared: false, clearedBy: null, clearedAt: null, notes: '' },
        pharmacy: { cleared: false, clearedBy: null, clearedAt: null, notes: '' },
        tpa:      { cleared: false, clearedBy: null, clearedAt: null, notes: '' },
        billing:  { cleared: false, clearedBy: null, clearedAt: null, notes: '' }
      };
      iqbal.timelineEvents = iqbal.timelineEvents || [];
      iqbal.timelineEvents.unshift({
        date: '29 Jun 2026 · 09:30',
        type: 'discharge',
        icon: '📤',
        title: 'Discharge Order Issued',
        desc: 'Discharge order signed by Dr. Mehta. All department clearances pending. Billing and TPA closure in progress.'
      });
    }
  }

  /* ══════════════════════════════════════════════════════════════════════════
     6. TRANSFER WORKFLOW — 1 patient with doctor-ordered inter-ward transfer
  ══════════════════════════════════════════════════════════════════════════ */
  function enrichTransferWorkflow() {
    const vikram = window.state.patients.find(p => p.uhid === 'SH-2026-04790');
    if (vikram) {
      vikram.transferStatus = 'Transfer Requested';
      vikram.transferRequest = {
        requestedBy: 'Dr. Mehta',
        requestedAt: '2026-06-29T10:00:00Z',
        fromWard: 'ICU',
        fromBed: 'ICU-05',
        toWard: 'Semi-Private Ward',
        toBed: 'SP-03',
        clinicalReason: 'Patient stable post-CABG. Transferred from ICU to semi-private for continued monitoring and rehabilitation.',
        priority: 'Routine',
        status: 'Pending Coordinator Approval'
      };
      vikram.timelineEvents = vikram.timelineEvents || [];
      vikram.timelineEvents.unshift({
        date: '29 Jun 2026 · 10:00',
        type: 'transfer',
        icon: '🔄',
        title: 'Bed Transfer Requested',
        desc: 'Dr. Mehta ordered ICU → SP-03 transfer (routine step-down). Awaiting ATD Coordinator approval.'
      });
    }
  }

  /* ══════════════════════════════════════════════════════════════════════════
     7. ATD CLEARANCE LOGS — seeded for both discharge pipeline patients
  ══════════════════════════════════════════════════════════════════════════ */
  function enrichATDClearances() {
    window.state.atdClearanceLogs = window.state.atdClearanceLogs || [];

    const existingLog = window.state.atdClearanceLogs.find(l => l.uhid === 'SH-2026-04821');
    if (!existingLog) {
      window.state.atdClearanceLogs.push(
        {
          uhid: 'SH-2026-04821',
          patientName: 'Rajesh Kumar',
          dischargeType: 'Regular',
          departments: [
            { name: 'Nursing', status: 'Cleared', clearedBy: 'Staff Nurse Mary', clearedAt: '29 Jun 2026 · 08:30' },
            { name: 'Pharmacy', status: 'Cleared', clearedBy: 'Ph. Satish Kumar', clearedAt: '29 Jun 2026 · 09:00' },
            { name: 'TPA/Insurance', status: 'Cleared', clearedBy: 'TPA Desk', clearedAt: '29 Jun 2026 · 09:15' },
            { name: 'Billing', status: 'Pending', clearedBy: null, clearedAt: null }
          ],
          initiatedAt: '29 Jun 2026 · 08:00',
          overallStatus: 'In Progress'
        },
        {
          uhid: 'SH-2026-04799',
          patientName: 'Mohammed Iqbal',
          dischargeType: 'Regular',
          departments: [
            { name: 'Nursing', status: 'Pending', clearedBy: null, clearedAt: null },
            { name: 'Pharmacy', status: 'Pending', clearedBy: null, clearedAt: null },
            { name: 'TPA/Insurance', status: 'Pending', clearedBy: null, clearedAt: null },
            { name: 'Billing', status: 'Pending', clearedBy: null, clearedAt: null }
          ],
          initiatedAt: '29 Jun 2026 · 09:30',
          overallStatus: 'In Progress'
        }
      );
    }
  }

  /* ══════════════════════════════════════════════════════════════════════════
     8. BILLING INVOICES — realistic invoice data covering all payer types
  ══════════════════════════════════════════════════════════════════════════ */
  function enrichBillingInvoices() {
    const invoices = [
      { id: 'INV-2026-9001', uhid: 'SH-2026-04821', name: 'Rajesh Kumar', amount: 42500, paid: 20000, balance: 22500, status: 'Partially Paid', payer: 'Star Health (TPA)', date: TODAY(), details: 'Room rent 3d + Investigations + Consultation' },
      { id: 'INV-2026-9002', uhid: 'SH-2026-04799', name: 'Mohammed Iqbal', amount: 78000, paid: 0, balance: 78000, status: 'Pending', payer: 'HDFC ERGO (TPA)', date: TODAY(), details: 'Surgery (Lap. Cholecystectomy) + OT + HDU 5d + Meds' },
      { id: 'INV-2026-9003', uhid: 'SH-2026-04803', name: 'Priya Menon', amount: 48000, paid: 48000, balance: 0, status: 'Paid', payer: 'Self Pay (Cash)', date: TODAY(), details: 'Private room 4d + Psychiatry consultation + Medications' },
      { id: 'INV-2026-9004', uhid: 'SH-2026-04788', name: 'Arun Pillai', amount: 32000, paid: 0, balance: 32000, status: 'Pending', payer: 'New India Assurance', date: TODAY(), details: 'HDU 3d + Antihypertensives + Daily labs + Consultation' },
      { id: 'INV-2026-9005', uhid: 'SH-2026-04810', name: 'Fatima Begum', amount: 28000, paid: 0, balance: 28000, status: 'Pending', payer: 'Star Health (TPA)', date: TODAY(), details: 'General ward 4d + Insulin + Endocrinology consult' },
      { id: 'INV-2026-9006', uhid: 'SH-2026-04790', name: 'Vikram Singh', amount: 1850000, paid: 1600000, balance: 250000, status: 'Partially Paid', payer: 'United India (TPA)', date: TODAY(), details: 'CABG + ICU 5d + Cardiac rehab + Critical drugs' },
      { id: 'INV-2026-9007', uhid: 'SH-2026-04768', name: 'Suresh Babu', amount: 18000, paid: 0, balance: 18000, status: 'Pending', payer: 'CGHS (Govt)', date: TODAY(), details: 'Semi-private 3d + Nephrology consult + Investigations' },
      { id: 'INV-2026-9008', uhid: 'SH-2026-04817', name: 'Sunita Sharma', amount: 600, paid: 600, balance: 0, status: 'Paid', payer: 'Cash', date: TODAY(), details: 'OPD Consultation Fee' },
      { id: 'INV-2026-9009', uhid: 'SH-2026-04822', name: 'Kavitha Nair', amount: 15000, paid: 0, balance: 15000, status: 'Pending', payer: 'HDFC ERGO (TPA)', date: TODAY(), details: 'Daycare hysteroscopy + OT + Anaesthesia + Pre-op labs' },
      { id: 'INV-2026-9010', uhid: 'SH-2026-04798', name: 'Arjun Nair', amount: 1650000, paid: 1650000, balance: 0, status: 'Paid', payer: 'Corporate (GMC)', date: TODAY(), details: 'CABG + ICU + Cardiac drugs + 5-day ICU' }
    ];

    invoices.forEach(inv => {
      const exists = window.state.billing.find(b => b.invoiceId === inv.id);
      if (!exists) {
        window.state.billing.push({
          invoiceId: inv.id,
          uhid: inv.uhid,
          patientName: inv.name,
          amount: inv.amount,
          paidAmount: inv.paid,
          balance: inv.balance,
          status: inv.status,
          payer: inv.payer,
          date: inv.date,
          details: inv.details
        });
      }
    });
  }

  /* ══════════════════════════════════════════════════════════════════════════
     9. OPD QUEUE — enrich opdDashboard panel with live state-driven queue
  ══════════════════════════════════════════════════════════════════════════ */
  function enrichOPDQueue() {
    // Doctor Duty board for OPD Dashboard
    window.state.doctorDutyLogs = [
      { room: 'Room 101 — OPD', doctor: 'Dr. Srinivasan', speciality: 'General Medicine', status: 'Active', patientsWaiting: 4 },
      { room: 'Room 105 — OPD', doctor: 'Dr. Priya Nair', speciality: 'Gynecology & Obs', status: 'Active', patientsWaiting: 3 },
      { room: 'Room 107 — OPD', doctor: 'Dr. Anand', speciality: 'Cardiology', status: 'Active', patientsWaiting: 2 },
      { room: 'Room 102 — OPD', doctor: 'Dr. Ramesh Iyer', speciality: 'Pediatrics', status: 'Active', patientsWaiting: 2 },
      { room: 'Room 103 — OPD', doctor: 'Dr. Krishnamurthy', speciality: 'Psychiatry', status: 'Available', patientsWaiting: 0 },
      { room: 'Room 114 — OPD', doctor: 'Dr. Munna Kumar', speciality: 'Orthopedics', status: 'Active', patientsWaiting: 1 }
    ];
  }

  /* ══════════════════════════════════════════════════════════════════════════
     10. ADMISSION PENDING LIST — patients awaiting bed allocation (for Bed Board)
  ══════════════════════════════════════════════════════════════════════════ */
  function enrichAdmissionPendingList() {
    window.state.admissionRequests = window.state.admissionRequests || [];

    const pendingDefs = [
      {
        uhid: 'SH-2026-04880', name: 'Girish Nair', age: 48, gender: 'Male',
        requestedBy: 'Dr. Srinivasan', department: 'Pulmonology', ward: 'General Ward (Male)', bedPreference: 'GENERAL-WARD-M',
        reason: 'Community-acquired pneumonia — IV Antibiotics required',
        payer: 'Star Health', requestedAt: '29 Jun 2026 · 10:30'
      },
      {
        uhid: 'SH-2026-04885', name: 'Poonam Singh', age: 31, gender: 'Female',
        requestedBy: 'Dr. Priya Nair', department: 'Gynecology & Obs', ward: 'Semi-Private Ward', bedPreference: 'SEMI-PRIVATE',
        reason: 'Ectopic pregnancy — urgent surgical management',
        payer: 'HDFC ERGO', requestedAt: '29 Jun 2026 · 11:00'
      },
      {
        uhid: 'SH-2026-04890', name: 'Ajit Kumar', age: 67, gender: 'Male',
        requestedBy: 'Dr. Anand', department: 'Cardiology', ward: 'ICU / CCU', bedPreference: 'CCU',
        reason: 'NSTEMI — urgent cardiac monitoring & intervention',
        payer: 'United India', requestedAt: '29 Jun 2026 · 11:30'
      }
    ];

    pendingDefs.forEach(def => {
      // Create minimal patient record if not exists
      let pat = window.state.patients.find(p => p.uhid === def.uhid);
      if (!pat) {
        pat = {
          uhid: def.uhid, name: def.name, age: def.age, gender: def.gender,
          type: 'IPD', status: 'Bed Pending',
          ward: '—', bed: '—', los: 0,
          primaryConsultant: def.requestedBy,
          department: def.department || 'General Medicine',
          payer: def.payer, payerType: 'TPA/Insurance',
          mobile: '9800000000',
          bloodGroup: 'O+', allergies: 'None',
          alerts: [], newsScore: 0, flags: [],
          vitals: { bp: '120/80', hr: 74, temp: 98.4, spo2: 99, weight: 70, bmi: 22, pain: 0, rr: 16 },
          prescriptions: [], clinicalData: { complaint: def.reason, hpi: 'Referred for admission.', examination: 'NAD', diagnosis: 'Under Evaluation', treatmentPlan: 'As per admission consultant', carePlan: 'Pending bed allocation' },
          history: { pastConditions: 'None', surgeries: 'None', familyHistory: 'None' },
          admitted: def.requestedAt,
          ipNumber: `IP-PEND-${def.uhid.split('-')[2]}`, opNumber: '—',
          dischargeClearances: { clinical: false, billing: false, summaryReady: false },
          timelineEvents: [{ date: def.requestedAt, type: 'registration', icon: '📋', title: 'Admission Request', desc: `Admission requested by ${def.requestedBy}. Reason: ${def.reason}. Awaiting bed allocation.` }]
        };
        window.state.patients.push(pat);
      }

      const exists = window.state.admissionRequests.find(r => r.uhid === def.uhid);
      if (!exists) {
        window.state.admissionRequests.push({
          uhid: def.uhid,
          name: def.name,
          age: def.age,
          gender: def.gender,
          requestedBy: def.requestedBy,
          wardPreference: def.ward,
          bedPrefKey: def.bedPreference,
          reason: def.reason,
          payer: def.payer,
          requestedAt: def.requestedAt,
          status: 'Pending'
        });
      }
    });

    // Save to localStorage
    localStorage.setItem('saronil_admissionRequests', JSON.stringify(window.state.admissionRequests));
  }

  /* ══════════════════════════════════════════════════════════════════════════
     11. CSSD SEED DATA — Instrument Sets, Implant Catalog, Queues, Equipment
  ══════════════════════════════════════════════════════════════════════════ */
  function enrichCSSD() {
    window.state.cssdState = window.state.cssdState || {};
    const cs = window.state.cssdState;

    cs.instrumentSets = [
      { id: "SET-GEN-001", name: "Major Laparotomy Set", barcode: "300101", status: "Available", category: "General Surgery", itemsCount: 42, location: "Storage A-3", lastSterilization: DISO(1), isImplant: false },
      { id: "SET-ORTHO-002", name: "Large Fragment Locking Plate Set (with Implants)", barcode: "300102", status: "Issued", category: "Orthopedics", itemsCount: 65, location: "OT-02", lastSterilization: TODAY(), isImplant: true, implantDetails: { catalogItem: "IMP-PLATE-LCP", lotNumber: "LOT-9921A", expiryDate: "2029-12-30" } },
      { id: "SET-NEURO-003", name: "Craniotomy Set", barcode: "300103", status: "Returned Dirty", category: "Neurosurgery", itemsCount: 54, location: "Dirty Receipt Queue", lastSterilization: DISO(4), isImplant: false },
      { id: "SET-GYNE-004", name: "Cesarean Section Set", barcode: "300104", status: "Available", category: "Gynecology & Obs", itemsCount: 38, location: "Storage B-1", lastSterilization: TODAY(), isImplant: false },
      { id: "SET-CARD-005", name: "Open Heart Surgery Set", barcode: "300105", status: "Available", category: "Cardiology", itemsCount: 82, location: "Storage C-1", lastSterilization: TODAY(), isImplant: false },
      { id: "SET-OPHTH-006", name: "Micro-Surgical Eye Set", barcode: "300106", status: "Available", category: "Ophthalmology", itemsCount: 24, location: "Storage A-1", lastSterilization: DISO(2), isImplant: false },
      { id: "SET-ENT-007", name: "Tonsillectomy Set", barcode: "300107", status: "Available", category: "ENT", itemsCount: 18, location: "Storage B-4", lastSterilization: DISO(3), isImplant: false },
      { id: "SET-DENT-008", name: "Dental Extraction Set", barcode: "300108", status: "Available", category: "Dentistry", itemsCount: 15, location: "Storage A-2", lastSterilization: DISO(5), isImplant: false }
    ];

    cs.implantCatalog = [
      { code: "IMP-SCREW-3.5", name: "Cortex Screw 3.5mm x 14mm", quantity: 150, lotNumber: "LOT-8832X", expiryDate: "2030-05-15", minStock: 20 },
      { code: "IMP-PLATE-LCP", name: "LCP Plate 4.5mm 8-Hole", quantity: 12, lotNumber: "LOT-9921A", expiryDate: "2029-12-30", minStock: 3 },
      { code: "IMP-MESH-HERNIA", name: "Proline Hernia Mesh 15x15cm", quantity: 25, lotNumber: "LOT-2231B", expiryDate: "2031-01-20", minStock: 5 },
      { code: "IMP-STENT-DES", name: "Drug Eluting Coronary Stent 3.0x18mm", quantity: 8, lotNumber: "LOT-7742C", expiryDate: "2028-09-15", minStock: 2 },
      { code: "IMP-PACEMAKER-DR", name: "Dual Chamber Pacemaker (St. Jude)", quantity: 4, lotNumber: "LOT-1102K", expiryDate: "2032-04-10", minStock: 1 }
    ];

    cs.loanerSets = [
      { id: "LNR-SPINE-001", name: "Vendor Spine Instrument Set (Medtronic)", vendor: "Medtronic India Pvt Ltd", arrivalDate: DISO(0) + " 09:30 AM", patientName: "Rajesh Kumar", caseDate: TODAY(), status: "Awaiting Cleaning", conditionOnReceipt: "Good", returnStatus: "Pending" },
      { id: "LNR-KNEE-002", name: "Vendor Knee Replacement Trial Set (Zimmer Biomet)", vendor: "Zimmer India", arrivalDate: DISO(1) + " 10:15 AM", patientName: "Mohammed Iqbal", caseDate: TODAY(), status: "Returned to Vendor", conditionOnReceipt: "Good", returnStatus: "Returned (Clean)", disputeRemarks: "" },
      { id: "LNR-HIP-003", name: "Vendor Hip Arthroplasty Revision Set (DePuy Synthes)", vendor: "Johnson & Johnson Surgical", arrivalDate: DISO(2) + " 02:00 PM", patientName: "Priya Menon", caseDate: DISO(1), status: "Returned to Vendor", conditionOnReceipt: "Damaged drill bit on return", returnStatus: "Returned with Dispute", disputeRemarks: "Drill guide sleeve shows deep scratches post-op." }
    ];

    cs.queues = {
      dirtyReceipt: [
        { id: "RET-101", setName: "Craniotomy Set", setCode: "SET-NEURO-003", returnDept: "OT-03", returnedBy: "Nurse Mary", receivedBy: "Technician Ashok", returnTime: TODAY() + " 14:30", status: "Awaiting Cleaning", missingItems: [], damagedItems: [], contaminationLevel: "High" },
        { id: "RET-102", setName: "Dental Extraction Set (B)", setCode: "SET-DENT-008", returnDept: "Dental OPD", returnedBy: "Dr. Vinay", receivedBy: "Technician Ashok", returnTime: TODAY() + " 15:45", status: "Awaiting Cleaning", missingItems: ["1 Dental Elevator"], damagedItems: [], contaminationLevel: "Medium" }
      ],
      cleaning: [
        { id: "CLN-101", setName: "Major Laparotomy Set (B)", setCode: "SET-GEN-001", method: "Ultrasonic Cleaning", status: "Cleaning", startTime: TODAY() + " 18:30", technician: "Technician Ashok" },
        { id: "CLN-102", setName: "Tonsillectomy Set", setCode: "SET-ENT-007", method: "Washer Disinfector", status: "Awaiting Cleaning", startTime: null, technician: null }
      ],
      inspection: [
        { id: "INSP-101", setName: "Micro-Surgical Eye Set", setCode: "SET-OPHTH-006", status: "Awaiting Assembly", checklistStatus: "Checked", technician: "Technician Ashok", result: "Pass", condemnationRequired: false },
        { id: "INSP-102", setName: "CABG Chest Retractor Set", setCode: "SET-CARD-007", status: "Pending Condemnation Sign-off", checklistStatus: "Corroded hinge joints found", technician: "Technician Ashok", result: null, condemnationRequired: true }
      ],
      packing: [
        { id: "PCK-101", setName: "Cesarean Section Set (B)", setCode: "SET-GYNE-004", status: "Ready for Packing", packagingMaterial: "Double Wrap Non-Woven SMS", packedBy: "Technician Ashok" }
      ],
      sterilization: [
        { id: "STER-101", sterilizer: "ST-STEAM-01", cycleNo: "CYC-9844", loadNo: "LOAD-4820", temperature: "134°C", pressure: "2.1 bar", exposureTime: "4 minutes", status: "Sterilization Completed", technician: "Technician Ashok", startTime: TODAY() + " 18:00", endTime: TODAY() + " 18:45", isImplant: true, biStartedAt: TODAY() + " 18:45", biStatus: "Pending", biResult: null, items: ["SET-ORTHO-002"], emergencyOverride: null }
      ]
    };

    cs.sterilizers = [
      { code: "ST-STEAM-01", name: "Steam Autoclave 450L (Horizontal)", type: "Steam Autoclave", status: "Active", lastValidation: DISO(20), pmDueDate: DISO(-70) },
      { code: "ST-ETO-01", name: "ETO Sterilizer 120L", type: "Ethylene Oxide (ETO)", status: "Active", lastValidation: DISO(45), pmDueDate: DISO(-45) }
    ];

    cs.waterQualityLogs = [
      { date: TODAY(), time: "08:00 AM", feedWaterTds: "145 ppm", roWaterTds: "3 ppm", ph: "6.8", hardness: "Nil", loggedBy: "Biomedical Engineer Vivek" },
      { date: DISO(1), time: "08:00 AM", feedWaterTds: "152 ppm", roWaterTds: "4 ppm", ph: "6.9", hardness: "Nil", loggedBy: "Biomedical Engineer Vivek" },
      { date: DISO(2), time: "08:00 AM", feedWaterTds: "140 ppm", roWaterTds: "3 ppm", ph: "6.8", hardness: "Nil", loggedBy: "Biomedical Engineer Vivek" }
    ];

    cs.implantIssues = [
      { id: "ISS-IMP-01", patientUhid: "SH-2026-04821", patientName: "Rajesh Kumar", surgeon: "Dr. Srinivasan", procedure: "Spine Fixation L4-L5", implantCode: "IMP-PLATE-LCP", implantName: "LCP Plate 4.5mm 8-Hole", lotNumber: "LOT-9921A", expiryDate: "2029-12-30", issuedDate: DISO(0) },
      { id: "ISS-IMP-02", patientUhid: "SH-2026-04799", patientName: "Mohammed Iqbal", surgeon: "Dr. Mehta", procedure: "Hernia Mesh Repair", implantCode: "IMP-MESH-HERNIA", implantName: "Proline Hernia Mesh 15x15cm", lotNumber: "LOT-2231B", expiryDate: "2031-01-20", issuedDate: DISO(1) }
    ];

    cs.auditLogs = [
      { timestamp: new Date().toISOString(), user: "CSSD Supervisor", action: "Load Completed", details: "Autoclave horizontal Steam-01 completed cycle LOAD-4820 with chemical indicators OK" },
      { timestamp: new Date(Date.now() - 3600000).toISOString(), user: "CSSD In-charge / Manager", action: "Quality Override Sign-off", details: "Approved override release for load LOAD-4820 (implant locked) due to acute surgical emergency" }
    ];

    localStorage.setItem('saronil_cssdState', JSON.stringify(cs));
  }

  /* ═══════════════════════════════════════════════════════════════════════════
     12. IPD ADMISSION REQUESTS — replace fake 003xx UHIDs with real OPD patients
         that are currently active in state.patients and referring for IPD
  ═══════════════════════════════════════════════════════════════════════════ */
  function enrichIPDAdmissionRequests() {
    // Only rewrite if still using the placeholder seed UHIDs
    var reqs = window.state.admissionRequests;
    if (!reqs || !reqs.length) return;
    var hasFakeUhids = reqs.some(function(r) { return r.uhid && r.uhid.startsWith('SH-2026-003'); });
    if (!hasFakeUhids) return; // already replaced (e.g. by user actions)

    // Pick real OPD patients from state as requesting IPD admission
    var opdPats = (window.state.patients || []).filter(function(p) {
      return (p.type === 'OPD' || p.type === 'Emergency') &&
             p.status !== 'Discharged' &&
             p.uhid;
    });

    var templates = [
      { source: 'OPD Referral',        refDoc: 'Dr. Srinivasan',  diagnosis: 'Acute Cholecystitis — Surgical Review',  ward: 'GENERAL-WARD-M', advancePaid: true,  waitingHrs: 2, branch: 'Bengaluru' },
      { source: 'Emergency Transfer',   refDoc: 'Dr. Fatima Sheikh', diagnosis: 'Polytrauma — stabilised in Emergency', ward: 'GENERAL-WARD-F', advancePaid: false, waitingHrs: 1, branch: 'Bengaluru' },
      { source: 'External Referral',    refDoc: 'Dr. K. Prasad',   diagnosis: 'Severe Community-Acquired Pneumonia',    ward: 'CCU',            advancePaid: true,  waitingHrs: 8, branch: 'Whitefield' },
      { source: 'OPD Referral',        refDoc: 'Dr. Priya Nair',  diagnosis: 'Pre-eclampsia — Obstetric Assessment',  ward: 'GENERAL-WARD-F', advancePaid: false, waitingHrs: 7, branch: 'Electronic City' }
    ];

    var newReqs = [];
    for (var i = 0; i < templates.length; i++) {
      var tpl = templates[i];
      var pat = opdPats[i % opdPats.length] || { uhid: 'SH-2026-04817', name: 'Sunita Sharma' };
      newReqs.push({
        id: 'REQ00' + (i + 1),
        name: pat.name,
        uhid: pat.uhid,
        source: tpl.source,
        refDoc: tpl.refDoc,
        diagnosis: tpl.diagnosis,
        ward: tpl.ward,
        advancePaid: tpl.advancePaid,
        waitingHrs: tpl.waitingHrs,
        branch: tpl.branch
      });
    }
    window.state.admissionRequests = newReqs;

    // Fix transfer request: use a real admitted IPD patient with correct ward key
    var admitted = (window.state.patients || []).filter(function(p) {
      return p.type === 'IPD' && p.status === 'Admitted' && p.bed;
    });
    if (admitted.length) {
      var trfPat = admitted[admitted.length - 1]; // pick last admitted
      var bedsEntry = window.state.bedsStatus[trfPat.bed] || {};
      window.state.transferRequests = [
        {
          id: 'TRF001',
          name: trfPat.name,
          uhid: trfPat.uhid,
          currentBed: trfPat.bed,
          currentWard: bedsEntry.wardKey || 'GENERAL-WARD-M',
          targetWard: 'CCU',
          requestedBy: trfPat.primaryConsultant || 'Dr. Srinivasan',
          reason: 'Clinical deterioration — CCU upgrade',
          requestedAt: new Date().toISOString(),
          status: 'Pending Nursing Supervisor Approval',
          branch: 'Bengaluru'
        }
      ];
    }
  }

  /* ═══════════════════════════════════════════════════════════════════════════
     13. LAB / RADIOLOGY QUEUE SYNC — enrich Lab phlebotomy queue and
         Radiology RIS queue with real patient UHIDs from state
  ═══════════════════════════════════════════════════════════════════════════ */
  function enrichLabRadQueues() {
    // Sync phlebotomy queue UHIDs to real patients
    var pats = window.state.patients || [];
    var ipdPats = pats.filter(function(p) { return p.type === 'IPD' && p.status !== 'Discharged'; });
    var labOrders = window.state.labOrders || [];

    // Rebuild phlebotomy queue from state.labOrders if it has real patients
    if (labOrders.length && window.state.phlebotomyQueue) {
      // Only update entries that still have MH- prefix (old dummy)
      window.state.phlebotomyQueue.forEach(function(q, idx) {
        if (q.uhid && q.uhid.startsWith('MH-')) {
          var order = labOrders[idx % labOrders.length];
          if (order) {
            q.name = order.patientName;
            q.uhid = order.uhid;
            q.source = order.ward;
            q.tests = order.test;
            q.doctor = order.orderedBy;
            q.priority = order.priority;
            // Tubes mapping
            q.tubes = order.tube === 'lavender' ? ['lavender'] : order.tube === 'yellow-cap' ? ['yellow-cap'] : ['yellow'];
          }
        }
      });
    }

    // Enrich phlebotomy critical values with real patients
    if (window.state.criticalValues) {
      window.state.criticalValues.forEach(function(cv) {
        if (cv.uhid && cv.uhid.startsWith('MH-')) {
          var realPat = ipdPats[0];
          if (realPat) {
            cv.patientName = realPat.name;
            cv.uhid = realPat.uhid;
          }
        }
      });
    }

    // Inject state.labOrders into phlebotomy queue as new STAT entries (not duplicating)
    labOrders.forEach(function(lo) {
      if (lo.priority === 'STAT' || lo.priority === 'Urgent') {
        var existing = (window.state.phlebotomyQueue || []).some(function(q) { return q.uhid === lo.uhid && q.tests === lo.test; });
        if (!existing) {
          window.state.phlebotomyQueue = window.state.phlebotomyQueue || [];
          window.state.phlebotomyQueue.unshift({
            accNo: lo.accNo,
            name: lo.patientName,
            uhid: lo.uhid,
            source: lo.ward,
            tests: lo.test,
            tubes: lo.tube === 'lavender' ? ['lavender'] : ['yellow'],
            priority: lo.priority,
            doctor: lo.orderedBy,
            time: 'Just ordered',
            status: 'Pending',
            flags: [],
            payerType: 'TPA/Insurance',
            schemeAuthStatus: 'Approved'
          });
        }
      }
    });

    // Sync RIS queue with state.radOrders
    var radOrders = window.state.radOrders || [];
    radOrders.forEach(function(ro) {
      var existing = (window.state.risQueue || []).some(function(q) { return q.studyId === ro.studyId; });
      if (!existing) {
        window.state.risQueue = window.state.risQueue || [];
        window.state.risQueue.push({
          studyId: ro.studyId,
          name: ro.patientName,
          uhid: ro.uhid,
          modality: ro.modality,
          studyName: ro.study,
          priority: ro.priority,
          status: ro.status,
          room: ro.room,
          time: 'Ordered today',
          safetyCheck: {
            fasting: ro.modality === 'CT Scan' ? 'Pending' : 'N/A',
            pregnancy: 'N/A',
            metalCleared: ro.modality === 'MRI' ? 'Pending' : 'N/A',
            consent: ro.modality === 'CT Scan' ? 'Pending' : 'N/A'
          },
          technician: 'Unassigned'
        });
      }
    });

    // Sync Pharmacy prescriptions queue with real patient UHIDs
    var rxQueue = window.state.prescriptionsQueue || [];
    rxQueue.forEach(function(rx) {
      if (rx.uhid && rx.uhid.startsWith('MH-')) {
        var realPat = ipdPats[rxQueue.indexOf(rx) % Math.max(ipdPats.length, 1)];
        if (realPat) {
          rx.name = realPat.name;
          rx.uhid = realPat.uhid;
          rx.source = realPat.bed || 'Ward';
        }
      }
    });
  }

  enrich();
})();
