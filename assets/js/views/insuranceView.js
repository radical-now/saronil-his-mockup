/* ==========================================================================
   SARONIL HMS — INSURANCE, TPA & GOVERNMENT PAYER MODULE v3.0
   Complete Production Rebuild — Single-pass render, IIFE-scoped, no timing bugs
   ========================================================================== */

(function () {
  'use strict';

  /* =========================================================================
     CONSTANTS
  ========================================================================= */

  var PAYER_CATEGORIES = [
    'Insurance — Cashless', 'Insurance — TPA Cashless', 'Insurance — Reimbursement',
    'Corporate — Credit', 'Corporate — Reimbursement',
    'CGHS — Cashless', 'CGHS — Reimbursement', 'ECHS', 'DGEHS', 'ESI / ESIC',
    'PMJAY / Ayushman Bharat', 'State Government Scheme', 'Self Pay'
  ];

  var ROLES = {
    TPA_EXECUTIVE:     { name: 'TPA Executive',      desc: 'Front Desk & Claim Logging' },
    TPA_SUPERVISOR:    { name: 'TPA Supervisor',     desc: 'Approvals & Overrides' },
    BILLING_EXECUTIVE: { name: 'Billing Executive',  desc: 'View preauth & compile billing' },
    BILLING_SUPERVISOR:{ name: 'Billing Supervisor', desc: 'Approve settlement' },
    ACCOUNTS_MANAGER:  { name: 'Accounts Manager',  desc: 'Post credit settlements & reports' },
    CASHIER:           { name: 'Cashier',            desc: 'Collect co-pays & gatepass' },
    MEDICAL_RECORDS:   { name: 'MRD',               desc: 'Upload discharge summary' },
    DOCTOR:            { name: 'Treating Doctor',   desc: 'Clinical view only' }
  };

  /* =========================================================================
     MODULE STATE  (private, no global conflicts)
  ========================================================================= */

  var _tab   = 'dashboard';
  var _claim = null;        // selected claim id
  var _stage = 'declaration';
  var _role  = 'TPA_EXECUTIVE';
  try { _role = localStorage.getItem('ins_role') || 'TPA_EXECUTIVE'; } catch (e) {}

  /* =========================================================================
     SEED DATA
  ========================================================================= */

  function seed() {
    var s = window.state;
    if (!s) return;

    /* ---- Payer Master ---- */
    if (!s.insuranceMasters) {
      s.insuranceMasters = {
        payers: [
          { code:'PAY-001', name:'Star Health Insurance',      type:'Insurance — Cashless',        submission:'Portal', tatPre:4,  tatSet:30,  validity:'2028-12-31', status:'Empanelled', contact:'Rajesh Kumar',     phone:'+91 98765 43210', email:'cashless@starhealth.in' },
          { code:'PAY-002', name:'Niva Bupa Health',           type:'Insurance — Cashless',        submission:'API',    tatPre:2,  tatSet:15,  validity:'2027-06-30', status:'Empanelled', contact:'Anjali Sharma',    phone:'+91 98111 22233', email:'preauth@nivabupa.com' },
          { code:'PAY-003', name:'Medi Assist TPA',            type:'Insurance — TPA Cashless',    submission:'Portal', tatPre:3,  tatSet:20,  validity:'2029-01-15', status:'Empanelled', contact:'Sanjay Gupta',    phone:'+91 80 4012 3456',email:'info@mediassist.in' },
          { code:'PAY-004', name:'CGHS Delhi / NCR',           type:'CGHS — Cashless',             submission:'Portal', tatPre:24, tatSet:90,  validity:'2026-12-31', status:'Empanelled', contact:'Dr. R K Prasad',   phone:'+91 11 2306 1234', email:'cghs-delhi@gov.in' },
          { code:'PAY-005', name:'ECHS HQ',                   type:'ECHS',                        submission:'Portal', tatPre:24, tatSet:90,  validity:'2027-10-31', status:'Empanelled', contact:'Col V S Malik',    phone:'+91 11 2568 2345', email:'echs-hq@nic.in' },
          { code:'PAY-006', name:'Ayushman Bharat / PMJAY',   type:'PMJAY / Ayushman Bharat',     submission:'Portal', tatPre:12, tatSet:45,  validity:'2030-01-01', status:'Empanelled', contact:'SHA Nodal Officer', phone:'14555',            email:'pmjay@nha.gov.in' },
          { code:'CORP-001',name:'Infosys Limited (Corporate)',type:'Corporate — Credit',           submission:'Email',  tatPre:8,  tatSet:45,  validity:'2027-03-31', status:'Empanelled', contact:'HR Benefits Desk', phone:'+91 80 4116 4000', email:'corporate-claims@infosys.com' }
        ],
        rates: [
          { code:'SRV-001', name:'ICU Charges (per day)',                mrp:12000, 'PAY-001':10500,'PAY-002':10000,'PAY-003':9500,'PAY-004':6500,'PAY-005':6500,'PAY-006':4000 },
          { code:'SRV-002', name:'Private Room (per day)',               mrp:7500,  'PAY-001':6800,'PAY-002':6500,'PAY-003':6200,'PAY-004':4500,'PAY-005':4500,'PAY-006':2000 },
          { code:'SRV-003', name:'Semi-Private Room (per day)',          mrp:4500,  'PAY-001':4000,'PAY-002':3900,'PAY-003':3800,'PAY-004':3000,'PAY-005':3000,'PAY-006':1200 },
          { code:'SRV-004', name:'General Ward (per day)',               mrp:2500,  'PAY-001':2200,'PAY-002':2100,'PAY-003':2000,'PAY-004':1500,'PAY-005':1500,'PAY-006':600  },
          { code:'SRV-005', name:'Lap. Cholecystectomy Package',         mrp:85000, 'PAY-001':78000,'PAY-002':75000,'PAY-003':74000,'PAY-004':32500,'PAY-005':32500,'PAY-006':22000 },
          { code:'SRV-006', name:'Cardiac Angioplasty (Single Stent)',   mrp:160000,'PAY-001':145000,'PAY-002':140000,'PAY-003':138000,'PAY-004':82000,'PAY-005':82000,'PAY-006':65000 },
          { code:'SRV-007', name:'CT Brain with Contrast',               mrp:6500,  'PAY-001':5800,'PAY-002':5500,'PAY-003':5400,'PAY-004':3500,'PAY-005':3500,'PAY-006':2500 },
          { code:'SRV-008', name:'MRI Lumbar Spine',                     mrp:9500,  'PAY-001':8500,'PAY-002':8200,'PAY-003':8000,'PAY-004':5000,'PAY-005':5000,'PAY-006':3800 }
        ],
        nonPayables: [
          { code:'NP-001', name:'Attendant Bed / Charges',          reason:'Standard IRDA Non-Admissible',   autoFlag:true,  informAdmission:true  },
          { code:'NP-002', name:'Admission / Registration Fee',      reason:'IRDA Excluded Admin Cost',       autoFlag:true,  informAdmission:true  },
          { code:'NP-003', name:'Toiletries / Personal Care Kit',    reason:'Payer-specific Exclusion',       autoFlag:true,  informAdmission:true  },
          { code:'NP-004', name:'Patient Diet — Extra Food',         reason:'IRDA Excluded Expense',          autoFlag:true,  informAdmission:false },
          { code:'NP-005', name:'Telephone & TV Service Charges',    reason:'Patient Comfort Exclusion',      autoFlag:true,  informAdmission:true  },
          { code:'NP-006', name:'Cosmetics / Creams / Moisturisers', reason:'Medical Consumables Guidelines', autoFlag:true,  informAdmission:false },
          { code:'NP-007', name:'Diapers / Sanitary Items',          reason:'IRDA Non-Payable',               autoFlag:true,  informAdmission:false },
          { code:'NP-008', name:'Gloves (Examination)',              reason:'IRDA Non-Payable',               autoFlag:false, informAdmission:false }
        ],
        wardEntitlements: [
          { category:'CGHS — Level 1–5',             payLevel:'Pay Level 1 to 5',            entitlement:'General Ward'    },
          { category:'CGHS — Level 6–10',            payLevel:'Pay Level 6 to 10',           entitlement:'Semi-Private'    },
          { category:'CGHS — Level 11+',             payLevel:'Pay Level 11 & above',        entitlement:'Private Room'    },
          { category:'ECHS — OR 1–5',                payLevel:'Other Ranks 1–5',             entitlement:'General Ward'    },
          { category:'ECHS — OR 6–9 / Hav / Nb Sub', payLevel:'OR-6 to OR-9',               entitlement:'Semi-Private'    },
          { category:'ECHS — JCO / Officers',        payLevel:'JCO up to Colonel',           entitlement:'Private Room'    },
          { category:'Corporate Silver',             payLevel:'Grade M1–M3',                 entitlement:'Semi-Private'    },
          { category:'Corporate Gold / Platinum',    payLevel:'Grade M4 & above',            entitlement:'Private Room'    }
        ],
        docChecklist: {
          'Preauth': [
            { name:'Insurance / Govt Health Card',         mandatory:true,  format:'PDF / Original Scan' },
            { name:"Treating Doctor's Admission Advice",   mandatory:true,  format:'PDF' },
            { name:'Photo Identity Proof (Aadhaar)',       mandatory:true,  format:'PDF / Scan' },
            { name:'CGHS / ESI Referral Letter',           mandatory:false, format:'Attested Copy' },
            { name:'Investigation Reports (pre-admission)',mandatory:false, format:'PDF' }
          ],
          'Enhancement': [
            { name:'Interim Treatment Cost Summary',       mandatory:true,  format:'PDF' },
            { name:"Updated Doctor's Justification",       mandatory:true,  format:'Signed PDF' },
            { name:'Latest Lab & Investigation Reports',   mandatory:true,  format:'PDF' }
          ],
          'Final Claim': [
            { name:'Final Itemised Sticker Bill',          mandatory:true,  format:'Original Scan' },
            { name:'Signed Discharge Summary',             mandatory:true,  format:'Original PDF' },
            { name:'OT Notes / Anaesthesia Sheet',         mandatory:false, format:'Signed Scan' },
            { name:'Implant Invoice & Barcode Sticker',    mandatory:false, format:'Original' },
            { name:'All Lab & Radiology Reports',          mandatory:true,  format:'PDF' },
            { name:'Pre-Auth Approval Copy',               mandatory:true,  format:'PDF' },
            { name:'Patient ID Proof',                     mandatory:true,  format:'Scan' }
          ]
        }
      };
    }

    /* ---- Claims (mock, rich) ---- */
    if (!s.claims) s.claims = [];
    if (s.claims.some(function(c){ return c._ins3; })) return;

    var mock = [
      /* 1 — Star Health — Query Raised */
      {
        _ins3:true, id:'CLM-2026-001', uhid:'SRN-001', admissionNo:'ADM-2026-0847',
        patientName:'Rajesh Kumar Sharma', age:52, gender:'Male',
        ward:'Private Room', bed:'PR-201', doctor:'Dr. Abhishek Kumar', doctorSpec:'Cardiology',
        admissionDate:'2026-06-21', daysAdmitted:5,
        payerCategory:'Insurance — Cashless', payerCode:'PAY-001', payerName:'Star Health Insurance',
        tpaName:null, insurer:null,
        policyNo:'SH/P/211124/001234', memberId:'SH-MEM-985621',
        memberName:'Rajesh Kumar Sharma', relationship:'Self',
        policyType:'Individual', policyStart:'2025-01-01', policyExpiry:'2026-12-31',
        sumInsured:500000, balanceSI:485000, roomEntitlement:'Private', coPay:10,
        waitingPeriodActive:false, pexExclusionActive:false,
        stage:'Query Management', status:'Query Raised',
        totalBillAmt:92500, nonPayableAmt:3800, roomDiffAmt:0,
        approvedAmt:145000, coPayAmt:9250, advanceAmt:30000, estimatedAmt:160000,
        intimation:{ refNo:'INT-SH-20260621-4421', dateTime:'2026-06-21T10:45:00+05:30', sentBy:'Ramesh Sharma', mode:'Portal' },
        preauth:{
          refNo:'SH-PA-2026-4421', status:'Query Raised',
          diagnosis:'Acute ST-Elevation MI', icd10:'I21.0',
          procedure:'Coronary Angioplasty with Drug-Eluting Stent', procCode:'CATH-001',
          estimatedAmt:160000, approvedAmt:145000, plannedDate:'2026-06-22', estimatedLOS:7,
          submittedAt:'2026-06-21T12:00:00+05:30', submittedBy:'Ramesh Sharma',
          tatDeadline:'2026-06-22T12:00:00+05:30',
          acknowledgedAt:'2026-06-21T13:30:00+05:30', acknowledgedRef:'ACK-SH-8812',
          approvedAt:null, validFrom:'2026-06-22', validTo:'2026-07-22',
          conditions:'Procedure only; pharmacy as per rate list'
        },
        queries:[{
          id:'QRY-001', refNo:'SH-QRY-2026-882', stage:'Preauth', type:'Clinical',
          text:'Please provide last 3 years of treatment history for CAD and diabetes: HbA1c trend, Echo reports, lipid profile.',
          receivedDate:'2026-06-23T10:00:00+05:30', deadline:'2026-06-30T10:00:00+05:30',
          status:'Open', assignedTo:'Ramesh Sharma', responses:[]
        }],
        enhancements:[],
        eligibilityChecks:[
          { name:'Policy / Card valid and not expired', status:'Pass', notes:'Valid till 31 Dec 2026' },
          { name:'Patient is listed beneficiary on policy', status:'Pass', notes:'' },
          { name:'Hospital empanelment active', status:'Pass', notes:'Empanelled till 31 Dec 2028' },
          { name:'Waiting period not active', status:'Pass', notes:'' },
          { name:'Sum insured / balance available', status:'Pass', notes:'Balance SI ₹4,85,000' },
          { name:'Room entitlement verified', status:'Pass', notes:'Private Room — entitled' },
          { name:'Co-pay percentage confirmed', status:'Pass', notes:'10% co-pay applicable' }
        ],
        documents:[
          { name:'Insurance / Govt Health Card', status:'Verified', uploadedAt:'2026-06-21T10:30:00+05:30' },
          { name:"Treating Doctor's Admission Advice", status:'Verified', uploadedAt:'2026-06-21T10:35:00+05:30' },
          { name:'Photo Identity Proof (Aadhaar)', status:'Verified', uploadedAt:'2026-06-21T10:40:00+05:30' }
        ],
        charges:[
          { date:'2026-06-22', desc:'Coronary Angioplasty with DES', category:'OT / Procedure', amount:145000, payerAmt:130500, nonPayable:0, roomDiff:0 },
          { date:'2026-06-21', desc:'Private Room 5 days @ ₹6,800', category:'Room',            amount:34000,  payerAmt:34000,  nonPayable:0, roomDiff:0 },
          { date:'2026-06-21', desc:'ICU 2 days @ ₹10,500',          category:'ICU',            amount:21000,  payerAmt:21000,  nonPayable:0, roomDiff:0 },
          { date:'2026-06-22', desc:'Cardiology Consultation ×5',    category:'Consultation',   amount:6000,   payerAmt:6000,   nonPayable:0, roomDiff:0 },
          { date:'2026-06-22', desc:'Cardiac Medications',           category:'Pharmacy',       amount:12500,  payerAmt:11500,  nonPayable:0, roomDiff:0 },
          { date:'2026-06-22', desc:'ECG & Echo',                    category:'Diagnostics',    amount:4500,   payerAmt:4500,   nonPayable:0, roomDiff:0 },
          { date:'2026-06-21', desc:'Admission Kit / Toiletries',    category:'Non-Payable',    amount:2500,   payerAmt:0,      nonPayable:2500, roomDiff:0 },
          { date:'2026-06-23', desc:'Telephone & TV Charges',        category:'Non-Payable',    amount:1300,   payerAmt:0,      nonPayable:1300, roomDiff:0 }
        ],
        auditHistory:[
          { ts:'2026-06-21 10:30', user:'Priya Verma',   role:'TPA Executive', action:'Payer Declaration Created',    remarks:'Star Health cashless case opened' },
          { ts:'2026-06-21 10:45', user:'Priya Verma',   role:'TPA Executive', action:'Admission Intimation Sent',    remarks:'Portal — Ref: INT-SH-20260621-4421' },
          { ts:'2026-06-21 11:15', user:'Priya Verma',   role:'TPA Executive', action:'Eligibility Verification Done', remarks:'All 7 checks passed' },
          { ts:'2026-06-21 12:00', user:'Ramesh Sharma', role:'TPA Executive', action:'Preauth Submitted',             remarks:'Portal — Ref: SH-PA-2026-4421' },
          { ts:'2026-06-21 13:30', user:'SYSTEM',        role:'System',        action:'Preauth Acknowledged',         remarks:'Payer ACK: ACK-SH-8812' },
          { ts:'2026-06-23 10:00', user:'SYSTEM',        role:'System',        action:'Query Received from Payer',    remarks:'QRY-001: Clinical history request' }
        ]
      },

      /* 2 — CGHS — Preauth Approved */
      {
        _ins3:true, id:'CLM-2026-002', uhid:'SRN-004', admissionNo:'ADM-2026-0848',
        patientName:'Meena Devi Singh', age:45, gender:'Female',
        ward:'Semi-Private', bed:'SP-304', doctor:'Dr. Sunita Sharma', doctorSpec:'Gynecology',
        admissionDate:'2026-06-22', daysAdmitted:4,
        payerCategory:'CGHS — Cashless', payerCode:'PAY-004', payerName:'CGHS Delhi / NCR',
        tpaName:null, insurer:null,
        policyNo:'CGHS-DEL-14/123456-B', memberId:'CGHS-BID-98765432109876',
        memberName:'Meena Devi Singh', relationship:'Self',
        policyType:'CGHS Beneficiary', policyStart:'2025-04-01', policyExpiry:'2027-03-31',
        sumInsured:null, balanceSI:null, roomEntitlement:'Semi-Private', coPay:0,
        waitingPeriodActive:false, pexExclusionActive:false,
        cghs:{ payLevel:'Level 8', dispensary:'CGHS Dispensary — Lajpat Nagar', referralNo:'CGHS/DL/REF/2026/4521', referralDate:'2026-06-21', referringDoctor:'Dr. Mohan Kumar' },
        stage:'Pre-Authorisation', status:'Approved',
        totalBillAmt:38500, nonPayableAmt:2200, roomDiffAmt:0,
        approvedAmt:32500, coPayAmt:0, advanceAmt:5000, estimatedAmt:42000,
        intimation:{ refNo:'INT-CGHS-20260622-887', dateTime:'2026-06-22T09:30:00+05:30', sentBy:'Anita Rao', mode:'Portal' },
        preauth:{
          refNo:'CGHS-PA-2026-887', status:'Approved',
          diagnosis:'Uterine Fibroid — Symptomatic', icd10:'D25.9',
          procedure:'Total Abdominal Hysterectomy', procCode:'CGHS-GYN-012',
          estimatedAmt:42000, approvedAmt:32500, plannedDate:'2026-06-23', estimatedLOS:5,
          submittedAt:'2026-06-22T10:00:00+05:30', submittedBy:'Anita Rao',
          tatDeadline:'2026-06-23T10:00:00+05:30',
          acknowledgedAt:'2026-06-22T11:00:00+05:30', acknowledgedRef:'ACK-CGHS-1122',
          approvedAt:'2026-06-22T16:00:00+05:30', validFrom:'2026-06-22', validTo:'2026-07-07',
          conditions:'CGHS package rate applicable. Semi-private ward only.'
        },
        queries:[], enhancements:[],
        eligibilityChecks:[
          { name:'Policy / Card valid and not expired', status:'Pass', notes:'CGHS card valid till Mar 2027' },
          { name:'Beneficiary ID matches portal record', status:'Pass', notes:'Verified on CGHS portal' },
          { name:'Hospital empanelment active', status:'Pass', notes:'CGHS empanelled' },
          { name:'Referral requirement checked', status:'Pass', notes:'Referral: CGHS/DL/REF/2026/4521' },
          { name:'Room entitlement verified', status:'Pass', notes:'Level 8 → Semi-Private. Patient in Semi-Private ✓' },
          { name:'Co-pay confirmed', status:'Pass', notes:'0% co-pay for serving employee' }
        ],
        documents:[
          { name:'Insurance / Govt Health Card', status:'Verified', uploadedAt:'2026-06-22T09:15:00+05:30' },
          { name:"Treating Doctor's Admission Advice", status:'Verified', uploadedAt:'2026-06-22T09:20:00+05:30' },
          { name:'CGHS / ESI Referral Letter', status:'Verified', uploadedAt:'2026-06-22T09:25:00+05:30' }
        ],
        charges:[
          { date:'2026-06-23', desc:'TAH — CGHS Package',       category:'OT / Package',  amount:32500, payerAmt:32500, nonPayable:0, roomDiff:0 },
          { date:'2026-06-22', desc:'Semi-Private 4d @ ₹3,000', category:'Room',           amount:12000, payerAmt:12000, nonPayable:0, roomDiff:0 },
          { date:'2026-06-23', desc:'Gynecology Consult ×4',    category:'Consultation',  amount:4000,  payerAmt:4000,  nonPayable:0, roomDiff:0 },
          { date:'2026-06-23', desc:'Toiletries & Comfort Kit', category:'Non-Payable',   amount:1800,  payerAmt:0,     nonPayable:1800, roomDiff:0 },
          { date:'2026-06-24', desc:'Post-op Medications',      category:'Pharmacy',      amount:4200,  payerAmt:4200,  nonPayable:0, roomDiff:0 },
          { date:'2026-06-24', desc:'Attendant Charges 2d',     category:'Non-Payable',   amount:400,   payerAmt:0,     nonPayable:400, roomDiff:0 }
        ],
        auditHistory:[
          { ts:'2026-06-22 09:15', user:'Anita Rao', role:'TPA Executive', action:'Payer Declaration Created', remarks:'CGHS Level 8 beneficiary' },
          { ts:'2026-06-22 09:30', user:'Anita Rao', role:'TPA Executive', action:'Intimation Sent',           remarks:'CGHS portal — Ref: INT-CGHS-20260622-887' },
          { ts:'2026-06-22 10:00', user:'Anita Rao', role:'TPA Executive', action:'Preauth Submitted',         remarks:'CGHS portal — Ref: CGHS-PA-2026-887' },
          { ts:'2026-06-22 16:00', user:'SYSTEM',    role:'System',        action:'Preauth Approved by CGHS', remarks:'₹32,500 — CGHS package rate' }
        ]
      },

      /* 3 — Medi Assist TPA — Enhancement In Progress */
      {
        _ins3:true, id:'CLM-2026-003', uhid:'SRN-007', admissionNo:'ADM-2026-0852',
        patientName:'Amitabh Verma', age:67, gender:'Male',
        ward:'Private Room', bed:'PR-105', doctor:'Dr. Ajay Kumar', doctorSpec:'Neurology',
        admissionDate:'2026-06-20', daysAdmitted:6,
        payerCategory:'Insurance — TPA Cashless', payerCode:'PAY-003', payerName:'Medi Assist TPA',
        tpaName:'Medi Assist TPA', insurer:'Care Health Insurance',
        policyNo:'CH/G/FLT/2025/00456', memberId:'MA-MEM-44821',
        memberName:'Amitabh Verma', relationship:'Self',
        policyType:'Family Floater', policyStart:'2025-06-01', policyExpiry:'2026-05-31',
        sumInsured:1000000, balanceSI:950000, roomEntitlement:'Private', coPay:0,
        waitingPeriodActive:false, pexExclusionActive:false,
        stage:'Enhancement Request', status:'Submitted',
        totalBillAmt:138000, nonPayableAmt:4500, roomDiffAmt:0,
        approvedAmt:95000, coPayAmt:0, advanceAmt:40000, estimatedAmt:160000,
        intimation:{ refNo:'INT-MA-20260620-3301', dateTime:'2026-06-20T11:00:00+05:30', sentBy:'Ramesh Sharma', mode:'Portal' },
        preauth:{
          refNo:'MA-PA-2026-3301', status:'Approved',
          diagnosis:'Ischemic Stroke — Left MCA', icd10:'I63.3',
          procedure:'Mechanical Thrombectomy + ICU Management', procCode:'NEURO-STR-002',
          estimatedAmt:120000, approvedAmt:95000, plannedDate:'2026-06-20', estimatedLOS:10,
          submittedAt:'2026-06-20T11:30:00+05:30', submittedBy:'Ramesh Sharma',
          tatDeadline:'2026-06-20T14:30:00+05:30',
          acknowledgedAt:'2026-06-20T12:00:00+05:30', acknowledgedRef:'ACK-MA-7654',
          approvedAt:'2026-06-20T14:00:00+05:30', validFrom:'2026-06-20', validTo:'2026-07-05',
          conditions:'Emergency approval. ICU charges per rate list.'
        },
        queries:[],
        enhancements:[{
          id:'ENH-001', enhNo:1, origRef:'MA-PA-2026-3301',
          reason:'Aspiration pneumonia complication requiring extended ICU stay and IV antibiotics beyond original estimate.',
          addlDiagnosis:'Aspiration Pneumonia — J69.0',
          addlProcedure:'Extended ICU ventilator support + IV antibiotics',
          revisedEstimate:195000, originalApprovedAmt:95000, additionalAmt:65000, revisedLOS:14,
          status:'Submitted', submittedAt:'2026-06-24T10:00:00+05:30', submittedBy:'Ramesh Sharma',
          tatDeadline:'2026-06-27T10:00:00+05:30'
        }],
        eligibilityChecks:[
          { name:'Policy / Card valid and not expired', status:'Pass', notes:'Valid till 31 May 2026' },
          { name:'Patient is listed beneficiary on policy', status:'Pass', notes:'Primary member' },
          { name:'Hospital empanelment active', status:'Pass', notes:'Care Health / Medi Assist' },
          { name:'Waiting period not active', status:'Pass', notes:'Emergency stroke — no waiting' },
          { name:'Balance sum insured available', status:'Pass', notes:'Balance SI ₹9,50,000' },
          { name:'Room entitlement verified', status:'Pass', notes:'Private Room — entitled ✓' }
        ],
        documents:[
          { name:'Insurance / Govt Health Card', status:'Verified', uploadedAt:'2026-06-20T11:00:00+05:30' },
          { name:"Treating Doctor's Admission Advice", status:'Verified', uploadedAt:'2026-06-20T11:05:00+05:30' },
          { name:'Photo Identity Proof (Aadhaar)', status:'Verified', uploadedAt:'2026-06-20T11:10:00+05:30' }
        ],
        charges:[
          { date:'2026-06-20', desc:'Mechanical Thrombectomy',   category:'OT / Procedure', amount:85000, payerAmt:85000, nonPayable:0, roomDiff:0 },
          { date:'2026-06-20', desc:'ICU 6d @ ₹9,500',          category:'ICU',            amount:57000, payerAmt:57000, nonPayable:0, roomDiff:0 },
          { date:'2026-06-20', desc:'Private Room 2d @ ₹6,200', category:'Room',           amount:12400, payerAmt:12400, nonPayable:0, roomDiff:0 },
          { date:'2026-06-20', desc:'Thrombolytic + ICU Drugs', category:'Pharmacy',       amount:22000, payerAmt:18500, nonPayable:0, roomDiff:0 },
          { date:'2026-06-21', desc:'MRI Brain Perfusion + DWI',category:'Radiology',      amount:9500,  payerAmt:9500,  nonPayable:0, roomDiff:0 },
          { date:'2026-06-22', desc:'Neurology Consult ×6',     category:'Consultation',  amount:7200,  payerAmt:7200,  nonPayable:0, roomDiff:0 },
          { date:'2026-06-20', desc:'Admission Kit',            category:'Non-Payable',   amount:2500,  payerAmt:0,     nonPayable:2500, roomDiff:0 },
          { date:'2026-06-23', desc:'Telephone & TV',           category:'Non-Payable',   amount:2000,  payerAmt:0,     nonPayable:2000, roomDiff:0 }
        ],
        auditHistory:[
          { ts:'2026-06-20 11:00', user:'Ramesh Sharma', role:'TPA Executive', action:'Payer Declaration Created', remarks:'Care Health / Medi Assist TPA — Emergency case' },
          { ts:'2026-06-20 11:30', user:'Ramesh Sharma', role:'TPA Executive', action:'Preauth Submitted (Emergency)', remarks:'Portal — Ref: MA-PA-2026-3301' },
          { ts:'2026-06-20 14:00', user:'SYSTEM',        role:'System',        action:'Preauth Approved',          remarks:'Emergency approval ₹95,000' },
          { ts:'2026-06-24 10:00', user:'Ramesh Sharma', role:'TPA Executive', action:'Enhancement Submitted',     remarks:'Aspiration pneumonia — additional ₹65,000 requested' }
        ]
      },

      /* 4 — PMJAY — Preauth Approved */
      {
        _ins3:true, id:'CLM-2026-004', uhid:'SRN-012', admissionNo:'ADM-2026-0855',
        patientName:'Sunita Kumari Das', age:38, gender:'Female',
        ward:'General Ward (F)', bed:'GW-F-415', doctor:'Dr. Mukesh Kumar', doctorSpec:'Gastroenterology',
        admissionDate:'2026-06-24', daysAdmitted:2,
        payerCategory:'PMJAY / Ayushman Bharat', payerCode:'PAY-006', payerName:'Ayushman Bharat / PMJAY',
        tpaName:null, insurer:null,
        policyNo:null, memberId:'PMJAY-DEL-2345678901',
        memberName:'Sunita Kumari Das', relationship:'Self',
        policyType:'PMJAY Beneficiary', policyStart:null, policyExpiry:null,
        sumInsured:500000, balanceSI:null, roomEntitlement:'General Ward', coPay:0,
        waitingPeriodActive:false, pexExclusionActive:false,
        pmjay:{ beneficiaryId:'PMJAY-DEL-2345678901', packageCode:'HBP-0606', packageName:'Laparoscopic Cholecystectomy', nhaRef:'NHA-VRF-2026-88712' },
        stage:'Pre-Authorisation', status:'Approved',
        totalBillAmt:22000, nonPayableAmt:0, roomDiffAmt:0,
        approvedAmt:22000, coPayAmt:0, advanceAmt:0, estimatedAmt:22000,
        intimation:{ refNo:'INT-PMJAY-20260624-5512', dateTime:'2026-06-24T08:30:00+05:30', sentBy:'Anita Rao', mode:'Portal' },
        preauth:{
          refNo:'PMJAY-PA-2026-5512', status:'Approved',
          diagnosis:'Cholelithiasis with Chronic Cholecystitis', icd10:'K80.10',
          procedure:'Lap. Cholecystectomy — PMJAY HBP-0606', procCode:'HBP-0606',
          estimatedAmt:22000, approvedAmt:22000, plannedDate:'2026-06-25', estimatedLOS:3,
          submittedAt:'2026-06-24T09:00:00+05:30', submittedBy:'Anita Rao',
          tatDeadline:'2026-06-24T21:00:00+05:30',
          acknowledgedAt:'2026-06-24T09:30:00+05:30', acknowledgedRef:'ACK-PMJAY-2261',
          approvedAt:'2026-06-24T11:00:00+05:30', validFrom:'2026-06-24', validTo:'2026-07-08',
          conditions:'PMJAY package HBP-0606. All-inclusive. No additional charges to patient.'
        },
        queries:[], enhancements:[],
        eligibilityChecks:[
          { name:'Beneficiary ID matches NHA portal record', status:'Pass', notes:'PMJAY-DEL-2345678901 verified' },
          { name:'Hospital empanelment active', status:'Pass', notes:'PMJAY empanelled' },
          { name:'Package code available for diagnosis', status:'Pass', notes:'HBP-0606 — Lap Cholecystectomy' },
          { name:'NHA portal verification', status:'Pass', notes:'NHA-VRF-2026-88712' }
        ],
        documents:[
          { name:'Insurance / Govt Health Card', status:'Verified', uploadedAt:'2026-06-24T08:20:00+05:30' },
          { name:'Photo Identity Proof (Aadhaar)', status:'Verified', uploadedAt:'2026-06-24T08:25:00+05:30' }
        ],
        charges:[
          { date:'2026-06-25', desc:'Lap. Cholecystectomy — PMJAY HBP-0606', category:'OT / Package', amount:22000, payerAmt:22000, nonPayable:0, roomDiff:0 }
        ],
        auditHistory:[
          { ts:'2026-06-24 08:30', user:'Anita Rao', role:'TPA Executive', action:'Payer Declaration Created', remarks:'PMJAY — Package HBP-0606' },
          { ts:'2026-06-24 09:00', user:'Anita Rao', role:'TPA Executive', action:'Preauth Submitted (PMJAY Portal)', remarks:'Ref: PMJAY-PA-2026-5512' },
          { ts:'2026-06-24 11:00', user:'SYSTEM',    role:'System',        action:'Preauth Approved by NHA',      remarks:'HBP-0606 ₹22,000 — all inclusive' }
        ]
      },

      /* 5 — Corporate Credit — In Progress */
      {
        _ins3:true, id:'CLM-2026-005', uhid:'SRN-019', admissionNo:'ADM-2026-0860',
        patientName:'Vijay Prakash Gupta', age:44, gender:'Male',
        ward:'Semi-Private', bed:'SP-302', doctor:'Dr. Rakesh Singh', doctorSpec:'Orthopedics',
        admissionDate:'2026-06-23', daysAdmitted:3,
        payerCategory:'Corporate — Credit', payerCode:'CORP-001', payerName:'Infosys Limited (Corporate)',
        tpaName:null, insurer:null,
        policyNo:'CORP-INF-GRPMED-2025', memberId:'INF-EMP-334512',
        memberName:'Vijay Prakash Gupta', relationship:'Self',
        policyType:'Group Mediclaim (Corporate)', policyStart:'2025-04-01', policyExpiry:'2026-03-31',
        sumInsured:300000, balanceSI:295000, roomEntitlement:'Semi-Private', coPay:0,
        waitingPeriodActive:false, pexExclusionActive:false,
        stage:'Treatment & Charge Capture', status:'In Progress',
        totalBillAmt:68000, nonPayableAmt:2800, roomDiffAmt:0,
        approvedAmt:75000, coPayAmt:0, advanceAmt:10000, estimatedAmt:145000,
        intimation:{ refNo:'INT-CORP-20260623-7745', dateTime:'2026-06-23T09:00:00+05:30', sentBy:'Priya Verma', mode:'Email' },
        preauth:{
          refNo:'CORP-LOA-2026-7745', status:'Approved',
          diagnosis:'Right Knee Osteoarthritis — Grade III', icd10:'M17.11',
          procedure:'Right Total Knee Replacement (TKR)', procCode:'ORTHO-TKR-001',
          estimatedAmt:145000, approvedAmt:75000, plannedDate:'2026-06-24', estimatedLOS:5,
          submittedAt:'2026-06-23T09:30:00+05:30', submittedBy:'Priya Verma',
          tatDeadline:'2026-06-23T17:30:00+05:30',
          acknowledgedAt:'2026-06-23T10:30:00+05:30', acknowledgedRef:'ACK-CORP-4421',
          approvedAt:'2026-06-23T14:00:00+05:30', validFrom:'2026-06-23', validTo:'2026-07-08',
          conditions:'LOA for balance SI ₹75,000. Implant to be invoiced separately.'
        },
        queries:[], enhancements:[],
        eligibilityChecks:[
          { name:'Corporate empanelment active', status:'Pass', notes:'Infosys — LOA category' },
          { name:'Employee ID verified', status:'Pass', notes:'INF-EMP-334512 confirmed with HR' },
          { name:'Balance sum insured available', status:'Pass', notes:'Balance ₹2,95,000' },
          { name:'Room entitlement verified', status:'Pass', notes:'Semi-Private entitlement ✓' }
        ],
        documents:[
          { name:'Corporate ID / Employee Card', status:'Verified', uploadedAt:'2026-06-23T09:00:00+05:30' },
          { name:"Treating Doctor's Admission Advice", status:'Verified', uploadedAt:'2026-06-23T09:05:00+05:30' }
        ],
        charges:[
          { date:'2026-06-24', desc:'Total Knee Replacement — Procedure', category:'OT / Procedure', amount:45000, payerAmt:45000, nonPayable:0, roomDiff:0 },
          { date:'2026-06-24', desc:'TKR Implant — Zimmer Biomet',        category:'Implant',        amount:85000, payerAmt:85000, nonPayable:0, roomDiff:0 },
          { date:'2026-06-23', desc:'Semi-Private 3d @ ₹3,900',          category:'Room',           amount:11700, payerAmt:11700, nonPayable:0, roomDiff:0 },
          { date:'2026-06-23', desc:'Ortho Medications',                  category:'Pharmacy',       amount:6500,  payerAmt:6500,  nonPayable:0, roomDiff:0 },
          { date:'2026-06-23', desc:'Registration / Admission Fee',       category:'Non-Payable',   amount:1500,  payerAmt:0,     nonPayable:1500, roomDiff:0 },
          { date:'2026-06-24', desc:'Toiletries Kit',                     category:'Non-Payable',   amount:1300,  payerAmt:0,     nonPayable:1300, roomDiff:0 }
        ],
        auditHistory:[
          { ts:'2026-06-23 09:00', user:'Priya Verma', role:'TPA Executive', action:'Payer Declaration Created', remarks:'Corporate credit — Infosys LOA' },
          { ts:'2026-06-23 09:30', user:'Priya Verma', role:'TPA Executive', action:'LOA Submitted',             remarks:'Email to HR Benefits Desk' },
          { ts:'2026-06-23 14:00', user:'SYSTEM',      role:'System',        action:'LOA Approved',              remarks:'Corporate authorised ₹75,000' }
        ]
      },

      /* 6 — ECHS — Final Claim Submitted */
      {
        _ins3:true, id:'CLM-2026-006', uhid:'SRN-023', admissionNo:'ADM-2026-0863',
        patientName:'Subedar Major Ram Prasad Yadav', age:58, gender:'Male',
        ward:'Semi-Private', bed:'SP-205', doctor:'Dr. Ajay Kumar', doctorSpec:'Neurology',
        admissionDate:'2026-06-18', daysAdmitted:8,
        payerCategory:'ECHS', payerCode:'PAY-005', payerName:'ECHS HQ',
        tpaName:null, insurer:null,
        policyNo:'ECHS/2024/CARD/881234', memberId:'ECHS-CARD-881234',
        memberName:'Ram Prasad Yadav', relationship:'Self',
        policyType:'ECHS Beneficiary', policyStart:'2024-04-01', policyExpiry:'2027-03-31',
        sumInsured:null, balanceSI:null, roomEntitlement:'Semi-Private', coPay:0,
        waitingPeriodActive:false, pexExclusionActive:false,
        echs:{ rank:'Subedar Major', unit:'5 Bihar Regt', stationHQ:'Agra', referralHospital:'MH Agra', referralNo:'ECHS/REF/2026/AGR/4521', referralDate:'2026-06-17' },
        stage:'Final Claim Submission', status:'Submitted',
        totalBillAmt:72500, nonPayableAmt:3200, roomDiffAmt:0,
        approvedAmt:65000, coPayAmt:0, advanceAmt:8000, estimatedAmt:80000,
        intimation:{ refNo:'INT-ECHS-20260618-2210', dateTime:'2026-06-18T11:00:00+05:30', sentBy:'Anita Rao', mode:'Portal' },
        preauth:{
          refNo:'ECHS-PA-2026-2210', status:'Approved',
          diagnosis:'Parkinson\'s Disease with Motor Complication', icd10:'G20',
          procedure:'DBS Lead Implantation — Bilateral STN', procCode:'ECHS-NEURO-DBS-001',
          estimatedAmt:80000, approvedAmt:65000, plannedDate:'2026-06-19', estimatedLOS:7,
          submittedAt:'2026-06-18T11:30:00+05:30', submittedBy:'Anita Rao',
          tatDeadline:'2026-06-19T11:30:00+05:30',
          acknowledgedAt:'2026-06-18T13:00:00+05:30', acknowledgedRef:'ACK-ECHS-3312',
          approvedAt:'2026-06-18T18:00:00+05:30', validFrom:'2026-06-18', validTo:'2026-07-03',
          conditions:'ECHS rate list applicable. Implant invoice + sticker mandatory.'
        },
        queries:[], enhancements:[],
        eligibilityChecks:[
          { name:'ECHS card valid and not expired', status:'Pass', notes:'Valid till Mar 2027' },
          { name:'Beneficiary is primary card holder', status:'Pass', notes:'Serving/Retired — Subedar Major' },
          { name:'Station hospital referral verified', status:'Pass', notes:'MH Agra referral: ECHS/REF/2026/AGR/4521' },
          { name:'Hospital empanelment active', status:'Pass', notes:'ECHS HQ empanelled ✓' },
          { name:'Room entitlement verified', status:'Pass', notes:'OR-9+ rank → Semi-Private ✓' },
          { name:'Procedure covered under ECHS rate list', status:'Pass', notes:'DBS listed under ECHS neurosurgery' }
        ],
        documents:[
          { name:'ECHS Smart Card / Dependency Card', status:'Verified', uploadedAt:'2026-06-18T11:00:00+05:30' },
          { name:'Station Hospital Referral Letter', status:'Verified', uploadedAt:'2026-06-18T11:05:00+05:30' },
          { name:"Treating Doctor's Advice", status:'Verified', uploadedAt:'2026-06-18T11:10:00+05:30' },
          { name:'OT Notes & Anaesthesia Sheet', status:'Verified', uploadedAt:'2026-06-26T09:00:00+05:30' },
          { name:'Implant Invoice & Barcode Sticker', status:'Verified', uploadedAt:'2026-06-26T09:05:00+05:30' },
          { name:'Signed Discharge Summary', status:'Pending Upload', uploadedAt:'' },
          { name:'All Lab & Radiology Reports', status:'Pending Upload', uploadedAt:'' }
        ],
        charges:[
          { date:'2026-06-19', desc:'DBS Lead Implantation (Bilateral STN)', category:'OT / Procedure', amount:55000, payerAmt:55000, nonPayable:0, roomDiff:0 },
          { date:'2026-06-19', desc:'DBS Electrode Set (Medtronic)', category:'Implant', amount:0, payerAmt:0, nonPayable:0, roomDiff:0 },
          { date:'2026-06-18', desc:'Semi-Private 8d @ ₹3,000', category:'Room', amount:24000, payerAmt:24000, nonPayable:0, roomDiff:0 },
          { date:'2026-06-18', desc:'GA (3h) Anaesthesia', category:'Anaesthesia', amount:18000, payerAmt:18000, nonPayable:0, roomDiff:0 },
          { date:'2026-06-18', desc:'Neurology Consult ×8', category:'Consultation', amount:9600, payerAmt:9600, nonPayable:0, roomDiff:0 },
          { date:'2026-06-18', desc:'Admission Kit', category:'Non-Payable', amount:1800, payerAmt:0, nonPayable:1800, roomDiff:0 },
          { date:'2026-06-18', desc:'Telephone & TV', category:'Non-Payable', amount:1400, payerAmt:0, nonPayable:1400, roomDiff:0 }
        ],
        auditHistory:[
          { ts:'2026-06-18 11:00', user:'Anita Rao', role:'TPA Executive', action:'ECHS Case Opened', remarks:'Subedar Major — DBS surgery case' },
          { ts:'2026-06-18 11:30', user:'Anita Rao', role:'TPA Executive', action:'Preauth Submitted', remarks:'ECHS portal — Ref: ECHS-PA-2026-2210' },
          { ts:'2026-06-18 18:00', user:'SYSTEM', role:'System', action:'Preauth Approved', remarks:'ECHS approved ₹65,000 — rate list applicable' },
          { ts:'2026-06-26 09:00', user:'Ramesh Sharma', role:'TPA Executive', action:'Claim Docket Compiled', remarks:'OT notes + implant invoice uploaded' },
          { ts:'2026-06-26 10:00', user:'Ramesh Sharma', role:'TPA Executive', action:'Final Claim Submitted to ECHS', remarks:'Portal submission — 2 docs pending DS upload' }
        ]
      },

      /* 7 — ESI — Converted to Self Pay */
      {
        _ins3:true, id:'CLM-2026-007', uhid:'SRN-031', admissionNo:'ADM-2026-0871',
        patientName:'Radha Devi Kushwaha', age:35, gender:'Female',
        ward:'General Ward (F)', bed:'GW-F-417', doctor:'Dr. Sunita Sharma', doctorSpec:'Cardiology',
        admissionDate:'2026-06-25', daysAdmitted:1,
        payerCategory:'Self Pay', payerCode:null, payerName:'Self Pay (Converted from ESI)',
        tpaName:null, insurer:null,
        policyNo:'ESI-DEL-N-4521876', memberId:'ESI-4521876',
        memberName:'Radha Devi Kushwaha', relationship:'Self',
        policyType:'ESI / ESIC Insured Person', policyStart:'2026-01-01', policyExpiry:'2026-12-31',
        sumInsured:null, balanceSI:null, roomEntitlement:'General Ward', coPay:0,
        waitingPeriodActive:false, pexExclusionActive:true,
        esi:{ ipNumber:'2526-DEL-4521876', dispensaryCode:'ESI-DISP-DEL-0042', referralNo:'ESI/REF/DEL/2026/8821', referralDate:'2026-06-25' },
        stage:'Payer Declaration', status:'Converted to Self Pay',
        totalBillAmt:0, nonPayableAmt:0, roomDiffAmt:0,
        approvedAmt:0, coPayAmt:0, advanceAmt:5000, estimatedAmt:85000,
        conversionReason:'Planned cardiac procedure (elective angioplasty) not covered under ESI as hospital is not in ESI panel for cardiac tertiary care. Patient consented to self-pay after explanation.',
        conversionApprovedBy:'Meena Joshi (TPA Supervisor)', conversionTimestamp:'2026-06-25T14:30:00+05:30',
        intimation:null,
        preauth:null,
        queries:[], enhancements:[],
        eligibilityChecks:[
          { name:'ESI card valid', status:'Pass', notes:'Active insured person — IP No. 2526-DEL-4521876' },
          { name:'Hospital ESI empanelment for cardiac tertiary care', status:'Fail', notes:'Hospital not in ESI panel for cardiac cath lab — only ESIC empanelled hospitals qualify' },
          { name:'ESIC referral for non-ESI hospital verified', status:'Fail', notes:'No ESIC referral for non-panel hospital — patient walked in directly' },
          { name:'Patient informed of self-pay option', status:'Pass', notes:'Explained — patient consent obtained' }
        ],
        documents:[
          { name:'ESI Card / IP Passbook', status:'Verified', uploadedAt:'2026-06-25T12:00:00+05:30' },
          { name:'Patient Consent for Self Pay Conversion', status:'Verified', uploadedAt:'2026-06-25T14:30:00+05:30' }
        ],
        charges:[],
        auditHistory:[
          { ts:'2026-06-25 12:00', user:'Priya Verma', role:'TPA Executive', action:'ESI Case Opened', remarks:'Patient declared ESI — IP No. 2526-DEL-4521876' },
          { ts:'2026-06-25 12:30', user:'Priya Verma', role:'TPA Executive', action:'Eligibility Check — FAILED', remarks:'Hospital not ESI-empanelled for cardiac tertiary care' },
          { ts:'2026-06-25 14:00', user:'Priya Verma', role:'TPA Executive', action:'Escalated to TPA Supervisor', remarks:'Eligibility failure — supervisor override required' },
          { ts:'2026-06-25 14:30', user:'Meena Joshi', role:'TPA Supervisor', action:'Approved Conversion to Self Pay', remarks:'Patient counselled — consented — advance ₹5,000 collected' }
        ]
      }
    ];
    s.claims.push.apply(s.claims, mock);
  }

  /* =========================================================================
     UTILITIES
  ========================================================================= */

  function fmt(v) {
    return '₹' + Number(v || 0).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  }

  function fmtDate(iso) {
    if (!iso) return '—';
    try {
      var d = new Date(iso);
      if (isNaN(d)) return iso;
      return d.toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' });
    } catch(e) { return iso; }
  }

  function fmtDT(iso) {
    if (!iso) return '—';
    try {
      var d = new Date(iso);
      if (isNaN(d)) return iso;
      return d.toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' }) + ' ' +
             d.toLocaleTimeString('en-IN', { hour:'2-digit', minute:'2-digit', hour12:false });
    } catch(e) { return iso; }
  }

  function bdg(status) {
    var map = {
      'Pending':'bg-slate-100 text-slate-700','Draft':'bg-slate-100 text-slate-600',
      'In Progress':'bg-blue-100 text-blue-800','Submitted':'bg-indigo-100 text-indigo-800',
      'Acknowledged':'bg-sky-100 text-sky-800','Under Process':'bg-blue-100 text-blue-800',
      'Query Raised':'bg-amber-100 text-amber-800','Additional Docs Required':'bg-amber-100 text-amber-800',
      'Approved':'bg-emerald-100 text-emerald-800','Partially Approved':'bg-teal-100 text-teal-800',
      'Rejected':'bg-red-100 text-red-800','Lapsed':'bg-orange-100 text-orange-800',
      'Appealed':'bg-purple-100 text-purple-800','Settled':'bg-emerald-200 text-emerald-900',
      'Written Off':'bg-red-200 text-red-900','Converted to Self Pay':'bg-gray-200 text-gray-700',
      'Open':'bg-red-100 text-red-800','Responded':'bg-indigo-100 text-indigo-800',
      'Pass':'bg-emerald-100 text-emerald-700','Fail':'bg-red-100 text-red-700',
      'Verified':'bg-emerald-100 text-emerald-700','Pending Upload':'bg-amber-100 text-amber-700',
      'General Ward':'bg-slate-100 text-slate-700','Semi-Private':'bg-blue-100 text-blue-800',
      'Private Room':'bg-indigo-100 text-indigo-800','Empanelled':'bg-emerald-100 text-emerald-800'
    };
    var cls = map[status] || 'bg-slate-100 text-slate-600';
    return '<span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ' + cls + '">' + (status || '') + '</span>';
  }

  function pct(claim) {
    if (!claim || !claim.preauth || !claim.preauth.approvedAmt) return 0;
    var admissible = claim.totalBillAmt - claim.nonPayableAmt;
    return Math.min(100, Math.round((admissible / claim.preauth.approvedAmt) * 100));
  }

  function claims() { return (window.state && window.state.claims) ? window.state.claims : []; }
  function masters() { return (window.state && window.state.insuranceMasters) ? window.state.insuranceMasters : {}; }
  function fr(label, value) {
    return '<div class="flex flex-col gap-0.5"><span class="text-[10px] text-slate-400 uppercase font-bold tracking-wider">' + label + '</span><span class="text-sm text-slate-800 font-medium">' + (value || '—') + '</span></div>';
  }

  /* =========================================================================
     MAIN ENTRY POINT
  ========================================================================= */

  window.views.insurance = function (container) {
    seed();
    try {
      container.innerHTML = shellHTML(tabContent());
    } catch (err) {
      console.error('[insuranceView] Fatal render error:', err);
      container.innerHTML =
        '<div class="p-8">' +
        '<div class="bg-red-50 border border-red-300 rounded-xl p-6">' +
        '<h3 class="font-bold text-red-800 mb-2">⚠️ Insurance Module Error</h3>' +
        '<p class="text-red-700 text-sm mb-3">' + err.message + '</p>' +
        '<pre class="text-xs bg-red-100 p-3 rounded overflow-x-auto">' + (err.stack || '') + '</pre>' +
        '</div></div>';
    }
  };

  /* =========================================================================
     SHELL
  ========================================================================= */

  function shellHTML(content) {
    var allClaims = claims();
    var urgentQ = allClaims.filter(function(c){ return c.queries && c.queries.some(function(q){ return q.status === 'Open'; }); }).length;

    var tabs = [
      { id:'dashboard', icon:'🏠', label:'Dashboard' },
      { id:'queue',     icon:'📋', label:'Patient Queue', badge: urgentQ > 0 ? urgentQ : 0 },
      { id:'workflow',  icon:'🔄', label:'Workflow Engine' },
      { id:'masters',   icon:'⚙️', label:'Masters Config' },
      { id:'reports',   icon:'📈', label:'RCM Reports' }
    ];

    var tabNav = tabs.map(function(t) {
      var active = _tab === t.id;
      var badgeHTML = t.badge ? '<span class="bg-red-500 text-white text-[9px] font-bold px-1.5 rounded-full ml-1">' + t.badge + '</span>' : '';
      return '<button id="ins-tab-' + t.id + '" onclick="window._insTab(\'' + t.id + '\')" class="flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 whitespace-nowrap ' + (active ? 'bg-[#1B3A5C] text-white shadow' : 'text-slate-600 hover:bg-slate-100') + '">' + t.icon + ' ' + t.label + badgeHTML + '</button>';
    }).join('');

    var roleOpts = Object.keys(ROLES).map(function(k) {
      return '<option value="' + k + '"' + (_role === k ? ' selected' : '') + '>' + ROLES[k].name + '</option>';
    }).join('');

    return '<div class="font-sans antialiased bg-[#F8FAFC] min-h-screen">' +
      '<div class="bg-white border-b border-slate-200 px-6 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">' +
        '<div class="flex items-center gap-3">' +
          '<div class="w-10 h-10 rounded-xl bg-[#1B3A5C] flex items-center justify-center text-white text-lg flex-shrink-0">🛡️</div>' +
          '<div>' +
            '<h1 class="text-xl font-bold text-slate-900" style="font-family:\'Outfit\',sans-serif">Insurance, TPA &amp; Government Payer Hub</h1>' +
            '<p class="text-xs text-slate-500">RCM — eligibility · preauth · query desk · credit settlement</p>' +
          '</div>' +
        '</div>' +
        '<div class="flex items-center gap-2 flex-wrap">' +
          '<span class="text-xs text-slate-500 font-medium">Desk:</span>' +
          '<select class="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 text-xs font-medium text-slate-700 outline-none" onchange="window._insSetRole(this.value)">' + roleOpts + '</select>' +
          '<button class="bg-[#1B3A5C] text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-slate-800 transition" onclick="window._insTab(\'workflow\')">➕ New Case</button>' +
        '</div>' +
      '</div>' +
      '<div class="bg-white border-b border-slate-200 px-6">' +
        '<div class="flex gap-1 py-2 overflow-x-auto">' + tabNav + '</div>' +
      '</div>' +
      '<div class="p-5 md:p-6">' + content + '</div>' +
    '</div>';
  }

  function tabContent() {
    switch (_tab) {
      case 'dashboard': return tabDashboard();
      case 'queue':     return tabQueue();
      case 'workflow':  return tabWorkflow();
      case 'masters':   return tabMasters();
      case 'reports':   return tabReports();
      default:          return tabDashboard();
    }
  }

  /* =========================================================================
     TAB: DASHBOARD
  ========================================================================= */

  function tabDashboard() {
    var all = claims();
    var pendElig  = all.filter(function(c){ return !c.eligibilityChecks || !c.eligibilityChecks.every(function(x){ return x.status === 'Pass'; }); }).length;
    var openQ     = all.filter(function(c){ return c.queries && c.queries.some(function(q){ return q.status === 'Open'; }); }).length;
    var pendPA    = all.filter(function(c){ return c.preauth && c.preauth.status === 'Submitted'; }).length;
    var enhPend   = all.filter(function(c){ return c.enhancements && c.enhancements.some(function(e){ return e.status === 'Submitted'; }); }).length;
    var outstanding = all.reduce(function(a,c){ return a + (c.approvedAmt || 0); }, 0);

    var kpis = [
      { icon:'📋', label:'Pending Eligibility',     value:pendElig,         color:'indigo' },
      { icon:'⏳', label:'Preauth Awaiting Response',value:pendPA,           color:'amber' },
      { icon:'❓', label:'Open TPA Queries',         value:openQ,            color:'red', pulse: openQ > 0 },
      { icon:'📈', label:'Enhancement Requests',    value:enhPend,          color:'purple' },
      { icon:'💵', label:'Credit Pending (Approved)',value:fmt(outstanding), color:'emerald', wide:true }
    ];

    var kpiHTML = kpis.map(function(k) {
      return '<div class="bg-white border border-slate-200 rounded-xl p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">' +
        '<div class="w-12 h-12 rounded-xl bg-' + k.color + '-50 text-' + k.color + '-600 flex items-center justify-center text-xl flex-shrink-0' + (k.pulse ? ' animate-pulse' : '') + '">' + k.icon + '</div>' +
        '<div><div class="text-' + (k.wide ? 'xl' : '2xl') + ' font-bold text-slate-900">' + k.value + '</div>' +
        '<div class="text-xs font-medium text-slate-500 uppercase tracking-wide mt-0.5">' + k.label + '</div></div>' +
      '</div>';
    }).join('');

    // Alerts
    var alerts = [];
    all.forEach(function(c) {
      if (c.queries) c.queries.filter(function(q){ return q.status === 'Open'; }).forEach(function(q) {
        var deadline = new Date(q.deadline);
        var hrs = Math.round((deadline - Date.now()) / 3600000);
        alerts.push({ type:'danger', msg: 'Query response ' + (hrs <= 0 ? '<strong>OVERDUE</strong>' : 'due in ' + hrs + 'h') + ' for <strong>' + c.patientName + '</strong> (' + c.id + ')' });
      });
      if (c.enhancements) c.enhancements.filter(function(e){ return e.status === 'Submitted'; }).forEach(function() {
        alerts.push({ type:'warning', msg: 'Enhancement awaiting payer response — <strong>' + c.patientName + '</strong>' });
      });
      var p = pct(c);
      if (p >= 90) alerts.push({ type:'danger', msg: '<strong>' + c.patientName + '</strong> bill at ' + p + '% of preauth — file enhancement immediately' });
    });

    var alertHTML = alerts.length > 0 ?
      '<div class="bg-amber-50 border-l-4 border-amber-500 rounded-r-xl p-4 mb-5">' +
        '<div class="flex items-center gap-2 mb-2"><span>⚠️</span><h3 class="text-xs font-bold text-amber-800 uppercase tracking-wide">Urgent Alerts (' + alerts.length + ')</h3></div>' +
        '<ul class="space-y-1.5">' + alerts.map(function(a){ return '<li class="text-xs text-amber-900">' + a.msg + '</li>'; }).join('') + '</ul>' +
      '</div>' : '';

    var rows = all.slice(0, 6).map(function(c) {
      var p = pct(c);
      var hasAlert = c.queries && c.queries.some(function(q){ return q.status === 'Open'; });
      var barColor = p >= 90 ? 'red' : p >= 75 ? 'amber' : 'emerald';
      return '<tr class="hover:bg-slate-50 cursor-pointer" onclick="window._insOpenClaim(\'' + c.id + '\')">' +
        '<td class="px-4 py-3"><div class="font-bold text-[#1B3A5C] text-xs">' + c.id + '</div><div class="text-[10px] text-slate-400">' + c.admissionNo + '</div></td>' +
        '<td class="px-4 py-3"><div class="font-semibold text-slate-900 text-sm">' + c.patientName + '</div><div class="text-xs text-slate-400">' + c.uhid + ' · ' + c.daysAdmitted + 'd</div></td>' +
        '<td class="px-4 py-3"><div class="text-xs font-semibold text-slate-700">' + c.payerName + '</div><div class="text-[10px] text-slate-400">' + c.payerCategory + '</div></td>' +
        '<td class="px-4 py-3">' + bdg(c.status) + '</td>' +
        '<td class="px-4 py-3 text-right"><div class="text-sm font-bold text-slate-900">' + fmt(c.totalBillAmt) + '</div><div class="text-xs text-emerald-600">' + fmt(c.approvedAmt) + ' approved</div></td>' +
        '<td class="px-4 py-3"><div class="flex items-center gap-2"><div class="flex-1 bg-slate-200 rounded-full h-1.5"><div class="bg-' + barColor + '-500 h-1.5 rounded-full" style="width:' + p + '%"></div></div><span class="text-xs text-slate-500 w-8 text-right">' + p + '%</span></div></td>' +
        '<td class="px-4 py-3 text-center">' + (hasAlert ? '<span class="text-red-500 text-xs font-bold">⚠️</span>' : '<span class="text-slate-300 text-xs">—</span>') + '</td>' +
        '<td class="px-4 py-3 text-center"><button class="bg-[#1B3A5C] text-white text-xs px-3 py-1.5 rounded-lg font-bold hover:bg-slate-800 transition" onclick="event.stopPropagation();window._insOpenClaim(\'' + c.id + '\')">Open →</button></td>' +
      '</tr>';
    }).join('');

    return '<div class="space-y-5">' + alertHTML +
      '<div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">' + kpiHTML + '</div>' +
      '<div class="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">' +
        '<div class="px-5 py-4 border-b border-slate-100 flex items-center justify-between">' +
          '<h2 class="text-sm font-bold text-slate-900">🏥 Active Insurance / TPA Cases (' + all.length + ')</h2>' +
          '<button class="text-xs text-[#1B3A5C] font-semibold hover:underline" onclick="window._insTab(\'queue\')">View All →</button>' +
        '</div>' +
        '<div class="overflow-x-auto">' +
          '<table class="min-w-full text-xs text-slate-700">' +
            '<thead class="bg-slate-50 text-slate-500 uppercase tracking-wider text-left">' +
              '<tr><th class="px-4 py-3 font-semibold">Claim ID</th><th class="px-4 py-3 font-semibold">Patient</th><th class="px-4 py-3 font-semibold">Payer</th><th class="px-4 py-3 font-semibold">Status</th><th class="px-4 py-3 font-semibold text-right">Financials</th><th class="px-4 py-3 font-semibold">Preauth Used</th><th class="px-4 py-3 font-semibold text-center">Alert</th><th class="px-4 py-3 font-semibold text-center">Action</th></tr>' +
            '</thead>' +
            '<tbody class="divide-y divide-slate-100">' + (rows || '<tr><td colspan="8" class="px-4 py-8 text-center text-slate-400">No active insurance cases</td></tr>') + '</tbody>' +
          '</table>' +
        '</div>' +
      '</div></div>';
  }

  /* =========================================================================
     TAB: PATIENT QUEUE
  ========================================================================= */

  function tabQueue() {
    var all = claims();
    var rows = all.map(function(c) {
      var balance = Math.max(0, c.totalBillAmt - c.approvedAmt - c.advanceAmt + c.nonPayableAmt + c.coPayAmt);
      var hasAlert = c.queries && c.queries.some(function(q){ return q.status === 'Open'; });
      return '<tr class="hover:bg-slate-50 cursor-pointer" onclick="window._insOpenClaim(\'' + c.id + '\')">' +
        '<td class="px-4 py-3 font-mono text-xs text-[#1B3A5C] font-bold whitespace-nowrap">' + c.uhid + '</td>' +
        '<td class="px-4 py-3"><div class="font-semibold text-slate-900 text-sm whitespace-nowrap">' + c.patientName + '</div><div class="text-xs text-slate-400">' + c.admissionNo + '</div></td>' +
        '<td class="px-4 py-3 text-xs text-slate-600 whitespace-nowrap">' + fmtDate(c.admissionDate) + '</td>' +
        '<td class="px-4 py-3 text-xs whitespace-nowrap">' + c.ward + '</td>' +
        '<td class="px-4 py-3 text-xs whitespace-nowrap">' + c.doctor + '</td>' +
        '<td class="px-4 py-3"><div class="text-xs font-semibold text-slate-700 whitespace-nowrap">' + c.payerName + '</div><div class="text-[10px] text-slate-400">' + c.payerCategory + '</div></td>' +
        '<td class="px-4 py-3"><div class="flex flex-col gap-0.5">' + bdg(c.stage) + bdg(c.status) + '</div></td>' +
        '<td class="px-4 py-3 text-right font-bold font-mono whitespace-nowrap">' + fmt(c.totalBillAmt) + '</td>' +
        '<td class="px-4 py-3 text-right text-emerald-600 font-bold font-mono whitespace-nowrap">' + fmt(c.approvedAmt) + '</td>' +
        '<td class="px-4 py-3 text-right text-red-500 font-mono whitespace-nowrap">' + fmt(c.nonPayableAmt) + '</td>' +
        '<td class="px-4 py-3 text-right font-bold font-mono whitespace-nowrap">' + fmt(balance) + '</td>' +
        '<td class="px-4 py-3 text-center font-bold text-xs ' + (c.daysAdmitted > 7 ? 'text-red-500' : 'text-slate-700') + '">' + c.daysAdmitted + 'd</td>' +
        '<td class="px-4 py-3 text-center">' + (hasAlert ? '<span class="text-red-500 font-bold">⚠️</span>' : '<span class="text-slate-300">—</span>') + '</td>' +
        '<td class="px-4 py-3 text-center whitespace-nowrap"><button class="bg-[#1B3A5C] text-white text-[11px] px-3 py-1.5 rounded-lg font-bold hover:bg-slate-800 transition" onclick="event.stopPropagation();window._insOpenClaim(\'' + c.id + '\')">Open →</button></td>' +
      '</tr>';
    }).join('');

    var payerOpts = PAYER_CATEGORIES.map(function(p){ return '<option>' + p + '</option>'; }).join('');

    return '<div class="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">' +
      '<div class="bg-slate-50 border-b border-slate-200 px-5 py-4 flex flex-wrap gap-3 items-end">' +
        '<input type="text" placeholder="Search patient / UHID / claim..." class="flex-1 min-w-48 rounded-lg border border-slate-300 px-3 py-2 text-xs outline-none focus:border-[#1B3A5C] bg-white">' +
        '<select class="rounded-lg border border-slate-300 px-3 py-2 text-xs bg-white outline-none"><option value="">— All Payer Types —</option>' + payerOpts + '</select>' +
        '<button class="bg-[#1B3A5C] text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-slate-800 transition">🔍 Filter</button>' +
      '</div>' +
      '<div class="overflow-x-auto">' +
        '<table class="min-w-full text-xs text-slate-700">' +
          '<thead class="bg-slate-50 text-slate-500 uppercase tracking-wider text-left">' +
            '<tr><th class="px-4 py-3 font-semibold">UHID</th><th class="px-4 py-3 font-semibold">Patient</th><th class="px-4 py-3 font-semibold">Admission</th><th class="px-4 py-3 font-semibold">Ward</th><th class="px-4 py-3 font-semibold">Doctor</th><th class="px-4 py-3 font-semibold">Payer</th><th class="px-4 py-3 font-semibold">Stage / Status</th><th class="px-4 py-3 font-semibold text-right">Total Bill</th><th class="px-4 py-3 font-semibold text-right">Approved</th><th class="px-4 py-3 font-semibold text-right">Non-Payable</th><th class="px-4 py-3 font-semibold text-right">Pt. Balance</th><th class="px-4 py-3 font-semibold text-center">LOS</th><th class="px-4 py-3 font-semibold text-center">Alert</th><th class="px-4 py-3 font-semibold text-center">Action</th></tr>' +
          '</thead>' +
          '<tbody class="divide-y divide-slate-100 bg-white">' + (rows || '<tr><td colspan="14" class="px-4 py-10 text-center text-slate-400">No cases found</td></tr>') + '</tbody>' +
        '</table>' +
      '</div>' +
      '<div class="px-5 py-3 border-t border-slate-100 bg-slate-50 text-xs text-slate-500">Showing ' + all.length + ' cases &middot; Total bills: ' + fmt(all.reduce(function(a,c){ return a+c.totalBillAmt; },0)) + ' &middot; Total approved: ' + fmt(all.reduce(function(a,c){ return a+c.approvedAmt; },0)) + '</div>' +
    '</div>';
  }

  /* =========================================================================
     TAB: WORKFLOW ENGINE
  ========================================================================= */

  function tabWorkflow() {
    var claim = null;
    if (_claim) {
      var all = claims();
      for (var i = 0; i < all.length; i++) { if (all[i].id === _claim) { claim = all[i]; break; } }
    }

    if (!claim) {
      var all2 = claims();
      var caseList = all2.map(function(c) {
        return '<button class="w-full text-left p-4 rounded-xl border border-slate-200 hover:border-[#1B3A5C] hover:bg-slate-50 transition-all" onclick="window._insOpenClaim(\'' + c.id + '\')">' +
          '<div class="flex items-center justify-between">' +
            '<div><div class="font-bold text-slate-900 text-sm">' + c.patientName + '</div>' +
            '<div class="text-xs text-slate-400 mt-0.5">' + c.id + ' &middot; ' + c.payerName + ' &middot; ' + c.stage + '</div></div>' +
            '<div class="flex flex-col items-end gap-1">' + bdg(c.status) + '<span class="text-xs text-slate-500">' + fmt(c.totalBillAmt) + '</span></div>' +
          '</div>' +
        '</button>';
      }).join('');

      return '<div class="max-w-2xl mx-auto">' +
        '<div class="bg-white border border-slate-200 rounded-xl p-8 shadow-sm">' +
          '<div class="text-center mb-6"><div class="w-16 h-16 rounded-2xl bg-[#1B3A5C] text-white text-3xl flex items-center justify-center mx-auto mb-4">🛡️</div>' +
          '<h2 class="text-lg font-bold text-slate-900">Workflow Engine — Select Case</h2>' +
          '<p class="text-sm text-slate-500 mt-1">Select a claim to begin workflow processing</p></div>' +
          '<div class="space-y-3">' + caseList + '</div>' +
        '</div>' +
      '</div>';
    }

    return claimWorkflow(claim);
  }

  function claimWorkflow(c) {
    var stages = [
      { id:'declaration', icon:'📝', label:'Declaration' },
      { id:'eligibility', icon:'✅', label:'Eligibility' },
      { id:'preauth',     icon:'🔐', label:'Preauth' },
      { id:'queries',     icon:'❓', label:'Queries',     badge: c.queries ? c.queries.filter(function(q){ return q.status==='Open'; }).length : 0 },
      { id:'enhancement', icon:'📈', label:'Enhancement', badge: c.enhancements ? c.enhancements.length : 0 },
      { id:'charges',     icon:'💰', label:'Charges' },
      { id:'docket',      icon:'📁', label:'Claim Docket' },
      { id:'finalclaim',  icon:'📤', label:'Final Claim' },
      { id:'settlement',  icon:'🤝', label:'Settlement' },
      { id:'audit',       icon:'📋', label:'Audit Log' }
    ];

    var stageNav = stages.map(function(s) {
      var active = _stage === s.id;
      return '<button onclick="window._insStage(\'' + s.id + '\')" class="flex flex-col items-center gap-1 px-3 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap ' + (active ? 'bg-[#1B3A5C] text-white' : 'text-slate-600 hover:bg-slate-100') + '">' +
        s.icon + '<br>' + s.label +
        (s.badge > 0 ? '<span class="bg-red-500 text-white text-[9px] px-1.5 rounded-full">' + s.badge + '</span>' : '') +
      '</button>';
    }).join('');

    var p = pct(c);
    var barColor = p >= 90 ? 'red' : p >= 75 ? 'amber' : 'emerald';
    var preauthBar = c.preauth && c.preauth.approvedAmt ?
      '<div class="mt-3 pt-3 border-t border-slate-100 flex items-center gap-3">' +
        '<span class="text-xs text-slate-500 whitespace-nowrap">Preauth Used:</span>' +
        '<div class="flex-1 bg-slate-200 rounded-full h-2"><div class="h-2 rounded-full bg-' + barColor + '-500 transition-all" style="width:' + p + '%"></div></div>' +
        '<span class="text-xs font-bold text-' + barColor + '-600 whitespace-nowrap">' + p + '% of ' + fmt(c.preauth.approvedAmt) + '</span>' +
        (p >= 90 ? '<span class="text-red-500 text-xs font-bold animate-pulse">⚠️ File Enhancement NOW</span>' : p >= 75 ? '<span class="text-amber-500 text-xs font-bold">⚠️ Prepare Enhancement</span>' : '') +
      '</div>' : '';

    var balance = c.totalBillAmt - c.approvedAmt + c.nonPayableAmt + c.coPayAmt;

    var header = '<div class="bg-white border border-slate-200 rounded-xl shadow-sm p-4 mb-4">' +
      '<div class="flex flex-wrap gap-4 items-start justify-between">' +
        '<div class="flex items-center gap-3">' +
          '<div class="w-11 h-11 rounded-xl bg-[#1B3A5C] text-white flex items-center justify-center text-base font-bold flex-shrink-0">' + c.patientName.charAt(0) + '</div>' +
          '<div>' +
            '<div class="font-bold text-slate-900">' + c.patientName + '</div>' +
            '<div class="text-xs text-slate-500">' + c.uhid + ' · ' + c.admissionNo + ' · ' + c.ward + ' / ' + c.bed + '</div>' +
            '<div class="text-xs text-slate-400">' + c.doctor + ' (' + c.doctorSpec + ') · ' + c.daysAdmitted + ' days admitted</div>' +
          '</div>' +
        '</div>' +
        '<div class="flex flex-wrap gap-4">' +
          '<div class="text-right"><div class="text-[10px] text-slate-400 uppercase font-bold">Payer</div><div class="text-sm font-bold text-[#1B3A5C]">' + c.payerName + '</div><div class="text-[10px] text-slate-400">' + c.payerCategory + '</div></div>' +
          '<div class="text-right"><div class="text-[10px] text-slate-400 uppercase font-bold">Total Bill</div><div class="text-sm font-bold text-slate-900">' + fmt(c.totalBillAmt) + '</div></div>' +
          '<div class="text-right"><div class="text-[10px] text-slate-400 uppercase font-bold">Approved</div><div class="text-sm font-bold text-emerald-600">' + fmt(c.approvedAmt) + '</div></div>' +
          '<div class="text-right"><div class="text-[10px] text-slate-400 uppercase font-bold">Pt. Payable</div><div class="text-sm font-bold text-red-500">' + fmt(balance) + '</div></div>' +
          '<div class="flex flex-col gap-1">' + bdg(c.stage) + bdg(c.status) + '</div>' +
        '</div>' +
      '</div>' + preauthBar +
    '</div>';

    var stageContent = '';
    try {
      switch (_stage) {
        case 'declaration':  stageContent = stageDeclaration(c); break;
        case 'eligibility':  stageContent = stageEligibility(c); break;
        case 'preauth':      stageContent = stagePreauth(c); break;
        case 'queries':      stageContent = stageQueries(c); break;
        case 'enhancement':  stageContent = stageEnhancement(c); break;
        case 'charges':      stageContent = stageCharges(c); break;
        case 'docket':       stageContent = stageDocket(c); break;
        case 'finalclaim':   stageContent = stageFinalClaim(c); break;
        case 'settlement':   stageContent = stageSettlement(c); break;
        case 'audit':        stageContent = stageAudit(c); break;
        default:             stageContent = stageDeclaration(c);
      }
    } catch (err) {
      console.error('[insuranceView] Stage render error (' + _stage + '):', err);
      stageContent = '<div class="p-6"><div class="bg-red-50 border border-red-300 rounded-xl p-5">' +
        '<h3 class="font-bold text-red-800 mb-2">⚠️ Stage Render Error — ' + _stage + '</h3>' +
        '<p class="text-red-700 text-sm">' + err.message + '</p>' +
        '<pre class="text-xs bg-red-100 p-2 mt-2 rounded">' + (err.stack || '') + '</pre>' +
        '</div></div>';
    }

    return '<div class="space-y-4">' +
      '<div class="flex items-center gap-3"><button class="text-xs text-slate-500 hover:text-slate-800 font-medium transition" onclick="window._insBackToQueue()">← Back to Queue</button><span class="text-slate-300">|</span><span class="text-xs text-slate-500">Case: <strong class="text-slate-700">' + c.id + '</strong></span></div>' +
      header +
      '<div class="bg-white border border-slate-200 rounded-xl shadow-sm p-3"><div class="flex gap-1 overflow-x-auto">' + stageNav + '</div></div>' +
      '<div class="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">' + stageContent + '</div>' +
    '</div>';
  }

  /* ---- STAGE: Payer Declaration ---- */
  function stageDeclaration(c) {
    var docs = c.documents || [];
    return '<div class="p-6">' +
      '<div class="flex items-center justify-between mb-5"><h2 class="text-base font-bold text-slate-900">📝 Payer Declaration</h2>' +
      '<button class="bg-[#1B3A5C] text-white text-xs px-4 py-2 rounded-lg font-bold hover:bg-slate-800 transition">✏️ Edit</button></div>' +

      '<div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">' +
        '<div class="space-y-4"><h3 class="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-2">Payer Information</h3>' +
        fr('Payer Category', c.payerCategory) + fr('Payer Name', c.payerName) +
        (c.tpaName ? fr('TPA Name', c.tpaName) : '') + (c.insurer ? fr('Parent Insurer', c.insurer) : '') +
        fr('Policy / Beneficiary ID', c.policyNo || c.memberId) + fr('Member ID', c.memberId) +
        fr('Policy Holder', c.memberName) + fr('Relationship', c.relationship) + fr('Policy Type', c.policyType) + '</div>' +

        '<div class="space-y-4"><h3 class="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-2">Coverage & Financials</h3>' +
        fr('Policy Period', c.policyStart ? fmtDate(c.policyStart) + ' – ' + fmtDate(c.policyExpiry) : 'Govt Scheme — Continuous') +
        fr('Sum Insured', c.sumInsured ? fmt(c.sumInsured) : 'Scheme-based') +
        fr('Balance Sum Insured', c.balanceSI ? fmt(c.balanceSI) : 'N/A') +
        fr('Room Entitlement', c.roomEntitlement || '—') +
        fr('Co-pay %', (c.coPay || 0) + '%') +
        fr('Waiting Period Active', c.waitingPeriodActive ? '⚠️ Yes — flag for self pay' : '✅ No') +
        fr('PED Exclusion Active', c.pexExclusionActive ? '⚠️ Yes' : '✅ No') + '</div>' +

        (c.cghs ? '<div class="space-y-4 col-span-2 md:col-span-2"><h3 class="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-2">CGHS Details</h3>' +
          '<div class="grid grid-cols-2 md:grid-cols-3 gap-4">' +
          fr('Pay Level', c.cghs.payLevel) + fr('Dispensary', c.cghs.dispensary) +
          fr('Referral No', c.cghs.referralNo) + fr('Referral Date', fmtDate(c.cghs.referralDate)) +
          fr('Referring Doctor', c.cghs.referringDoctor) + '</div></div>' : '') +

        (c.pmjay ? '<div class="space-y-4 col-span-2 md:col-span-2"><h3 class="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-2">PMJAY Details</h3>' +
          '<div class="grid grid-cols-2 md:grid-cols-3 gap-4">' +
          fr('Beneficiary ID', c.pmjay.beneficiaryId) + fr('Package Code', c.pmjay.packageCode) +
          fr('Package Name', c.pmjay.packageName) + fr('NHA Verification Ref', c.pmjay.nhaRef) + '</div></div>' : '') +
      '</div>' +

      (c.intimation ? '<div class="bg-indigo-50 border border-indigo-200 rounded-xl p-4 mb-5">' +
        '<h3 class="text-xs font-bold text-indigo-800 uppercase tracking-wider mb-3">📡 Admission Intimation Record</h3>' +
        '<div class="grid grid-cols-2 md:grid-cols-4 gap-4">' +
        fr('Ref No', c.intimation.refNo) + fr('Date &amp; Time', fmtDT(c.intimation.dateTime)) +
        fr('Sent By', c.intimation.sentBy) + fr('Mode', c.intimation.mode) + '</div></div>' : '') +

      '<div><h3 class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">📎 Documents</h3>' +
      '<div class="space-y-2">' + docs.map(function(d) {
        return '<div class="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">' +
          '<div class="flex items-center gap-2"><span>📄</span><span class="text-sm text-slate-700 font-medium">' + d.name + '</span></div>' +
          '<div class="flex items-center gap-3"><span class="text-xs text-slate-400">' + fmtDT(d.uploadedAt) + '</span>' + bdg(d.status) + '</div>' +
        '</div>';
      }).join('') + '</div>' +
      '<button class="mt-3 text-xs text-[#1B3A5C] font-semibold hover:underline">+ Upload Additional Document</button></div>' +
    '</div>';
  }

  /* ---- STAGE: Eligibility ---- */
  function stageEligibility(c) {
    var checks = c.eligibilityChecks || [];
    var allPass = checks.length > 0 && checks.every(function(x){ return x.status === 'Pass'; });
    var anyFail = checks.some(function(x){ return x.status === 'Fail'; });

    var badge = allPass ? '<span class="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1.5 rounded-full">✅ Fully Verified</span>' :
                anyFail ? '<span class="bg-red-100 text-red-800 text-xs font-bold px-3 py-1.5 rounded-full">❌ Failed</span>' :
                          '<span class="bg-amber-100 text-amber-800 text-xs font-bold px-3 py-1.5 rounded-full">⏳ Pending</span>';

    var checkRows = checks.map(function(ch) {
      var bg = ch.status === 'Pass' ? 'bg-emerald-50 border-emerald-200' : ch.status === 'Fail' ? 'bg-red-50 border-red-200' : 'bg-amber-50 border-amber-200';
      var dot = ch.status === 'Pass' ? 'bg-emerald-500 text-white' : ch.status === 'Fail' ? 'bg-red-500 text-white' : 'bg-amber-400 text-white';
      var sym = ch.status === 'Pass' ? '✓' : ch.status === 'Fail' ? '✗' : '?';
      return '<div class="flex items-center gap-4 p-4 rounded-xl border ' + bg + '">' +
        '<div class="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ' + dot + '">' + sym + '</div>' +
        '<div class="flex-1"><div class="text-sm font-semibold text-slate-800">' + ch.name + '</div>' +
        (ch.notes ? '<div class="text-xs text-slate-500 mt-0.5">' + ch.notes + '</div>' : '') + '</div>' +
        '<div class="flex items-center gap-2">' + bdg(ch.status) +
        '<select class="rounded border border-slate-300 bg-white text-xs px-2 py-1 outline-none"><option' + (ch.status==='Pass'?' selected':'') + '>Pass</option><option' + (ch.status==='Fail'?' selected':'') + '>Fail</option><option' + (ch.status==='Unable to Verify'?' selected':'') + '>Unable to Verify</option></select>' +
        '</div></div>';
    }).join('');

    var failPanel = anyFail ?
      '<div class="mt-5 bg-red-50 border border-red-300 rounded-xl p-4">' +
        '<h3 class="text-sm font-bold text-red-800 mb-3">⚠️ Eligibility Failure — Action Required</h3>' +
        '<div class="space-y-2">' +
          '<button class="w-full text-left p-3 bg-white border border-red-200 rounded-lg text-xs font-semibold text-red-800 hover:bg-red-50 transition" onclick="alert(\'Conversion to Self Pay — requires TPA Supervisor approval and patient consent\')">🔄 Initiate Conversion to Self Pay</button>' +
          '<button class="w-full text-left p-3 bg-white border border-amber-200 rounded-lg text-xs font-semibold text-amber-800 hover:bg-amber-50 transition" onclick="alert(\'Convert to Reimbursement — hospital generates document package for patient\')">📄 Convert to Reimbursement</button>' +
        '</div>' +
      '</div>' : '';

    return '<div class="p-6">' +
      '<div class="flex items-center justify-between mb-5">' +
        '<div><h2 class="text-base font-bold text-slate-900">✅ Eligibility Verification</h2>' +
        '<p class="text-xs text-slate-500 mt-1">All checks must pass before preauth can be submitted</p></div>' +
        '<div class="flex items-center gap-2">' + badge + '<button class="bg-[#1B3A5C] text-white text-xs px-4 py-2 rounded-lg font-bold hover:bg-slate-800 transition">Update Checks</button></div>' +
      '</div>' +
      '<div class="space-y-2">' + (checkRows || '<div class="text-center py-8 text-slate-400 text-sm">No eligibility checks recorded</div>') + '</div>' + failPanel +
    '</div>';
  }

  /* ---- STAGE: Preauth ---- */
  function stagePreauth(c) {
    var pa = c.preauth;
    if (!pa) return '<div class="p-6 text-center text-slate-400 py-12"><div class="text-4xl mb-3">🔐</div><p class="font-semibold">No preauth request created yet</p><button class="mt-4 bg-[#1B3A5C] text-white text-xs px-6 py-2 rounded-lg font-bold">Create Preauth Request</button></div>';

    var p = pct(c);
    var barColor = p >= 90 ? 'red' : p >= 75 ? 'amber' : 'emerald';

    var steps = ['Draft','Submitted','Acknowledged','Approved'];
    var curIdx = { 'Draft':0,'Submitted':1,'Acknowledged':2,'Approved':3,'Partially Approved':3,'Query Raised':2,'Rejected':1,'Lapsed':1 }[pa.status] || 0;

    var timeline = steps.map(function(st, i) {
      var done = i <= curIdx;
      return '<div class="flex items-center flex-1 min-w-0">' +
        '<div class="flex flex-col items-center gap-1 flex-shrink-0">' +
          '<div class="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ' + (done ? 'bg-[#1B3A5C] text-white' : 'bg-slate-200 text-slate-500') + '">' + (i+1) + '</div>' +
          '<span class="text-[10px] text-slate-500 whitespace-nowrap">' + st + '</span>' +
        '</div>' + (i < steps.length-1 ? '<div class="flex-1 h-0.5 ' + (i < curIdx ? 'bg-[#1B3A5C]' : 'bg-slate-200') + ' mx-1 mb-4"></div>' : '') +
      '</div>';
    }).join('');

    return '<div class="p-6">' +
      '<div class="flex items-center justify-between mb-5"><h2 class="text-base font-bold text-slate-900">🔐 Pre-Authorisation</h2>' +
        '<div class="flex items-center gap-2">' + bdg(pa.status) +
        (pa.status === 'Draft' ? '<button class="bg-[#1B3A5C] text-white text-xs px-4 py-2 rounded-lg font-bold hover:bg-slate-800 transition">📤 Submit to Payer</button>' : '') +
      '</div></div>' +

      '<div class="flex items-center gap-2 mb-6 overflow-x-auto pb-2">' + timeline + '</div>' +

      '<div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">' +
        '<div class="space-y-4"><h3 class="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-2">Clinical</h3>' +
        fr('Preauth Ref No', pa.refNo || '—') + fr('Primary Diagnosis', pa.diagnosis + ' (' + pa.icd10 + ')') +
        fr('Procedure', pa.procedure) + fr('Procedure Code', pa.procCode || '—') +
        fr('Planned Date', fmtDate(pa.plannedDate)) + fr('Estimated LOS', (pa.estimatedLOS || '—') + ' days') + '</div>' +

        '<div class="space-y-4"><h3 class="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-2">Financials</h3>' +
        fr('Estimated Cost', fmt(pa.estimatedAmt)) +
        fr('Approved Amount', '<strong class="text-emerald-600">' + fmt(pa.approvedAmt) + '</strong>') +
        fr('Validity', pa.validFrom ? fmtDate(pa.validFrom) + ' – ' + fmtDate(pa.validTo) : '—') +
        (pa.conditions ? fr('Payer Conditions', pa.conditions) : '') + '</div>' +

        '<div class="space-y-4"><h3 class="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-2">Submission Tracking</h3>' +
        fr('Submitted By', pa.submittedBy || '—') + fr('Submitted At', fmtDT(pa.submittedAt)) +
        fr('TAT Deadline', fmtDT(pa.tatDeadline)) + fr('Acknowledged At', fmtDT(pa.acknowledgedAt)) +
        fr('Ack Ref', pa.acknowledgedRef || '—') + fr('Approved At', fmtDT(pa.approvedAt)) + '</div>' +

        '<div class="space-y-4"><h3 class="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-2">Preauth Utilisation</h3>' +
          '<div class="space-y-3">' +
          '<div class="flex justify-between text-sm"><span class="text-slate-500">Approved:</span><span class="font-bold">' + fmt(pa.approvedAmt) + '</span></div>' +
          '<div class="flex justify-between text-sm"><span class="text-slate-500">Admissible Bills:</span><span class="font-bold">' + fmt(c.totalBillAmt - c.nonPayableAmt) + '</span></div>' +
          '<div class="bg-slate-200 rounded-full h-3"><div class="h-3 rounded-full bg-' + barColor + '-500" style="width:' + p + '%"></div></div>' +
          '<div class="text-xs text-center font-bold text-' + barColor + '-600">' + p + '% utilised</div>' +
          (p >= 90 ? '<div class="bg-red-50 border border-red-300 rounded-lg p-3 text-xs text-red-800 font-semibold">⚠️ File Enhancement Request immediately</div>' : p >= 75 ? '<div class="bg-amber-50 border border-amber-300 rounded-lg p-3 text-xs text-amber-800 font-semibold">⚠️ Prepare Enhancement Request</div>' : '') +
          '</div>' +
        '</div>' +
      '</div>' +
    '</div>';
  }

  /* ---- STAGE: Queries ---- */
  function stageQueries(c) {
    var qs = c.queries || [];
    var now = Date.now();

    var qHTML = qs.length === 0 ?
      '<div class="text-center py-12 text-slate-400"><div class="text-4xl mb-3">✅</div><p class="font-semibold">No queries raised</p><p class="text-xs mt-1">Queries from the payer will appear here</p></div>' :
      qs.map(function(q) {
        var deadline = new Date(q.deadline);
        var hrs = Math.round((deadline - now) / 3600000);
        var urg = hrs <= 0 ? 'red' : hrs <= 24 ? 'amber' : 'slate';
        var urgText = hrs <= 0 ? '🔴 OVERDUE' : hrs <= 24 ? '⚠️ ' + hrs + 'h remaining' : '✅ ' + Math.floor(hrs/24) + 'd remaining';
        return '<div class="border border-' + urg + '-200 rounded-xl overflow-hidden mb-4">' +
          '<div class="bg-' + urg + '-50 px-5 py-3 flex items-center justify-between">' +
            '<div class="flex items-center gap-2">' +
              '<span class="font-bold text-slate-900 text-sm">' + q.refNo + '</span>' + bdg(q.status) +
              '<span class="bg-slate-100 text-slate-700 text-[10px] px-2 py-0.5 rounded-full font-semibold">' + q.type + '</span>' +
              '<span class="bg-indigo-100 text-indigo-700 text-[10px] px-2 py-0.5 rounded-full font-semibold">' + q.stage + '</span>' +
            '</div>' +
            '<span class="text-xs font-bold text-' + urg + '-600">' + urgText + '</span>' +
          '</div>' +
          '<div class="p-5 space-y-4">' +
            '<div><div class="text-xs text-slate-500 font-bold uppercase mb-1">Query Details</div>' +
            '<p class="text-sm text-slate-700 leading-relaxed">' + q.text + '</p></div>' +
            '<div class="grid grid-cols-3 gap-4 text-xs">' + fr('Received', fmtDT(q.receivedDate)) + fr('Deadline', fmtDT(q.deadline)) + fr('Assigned To', q.assignedTo) + '</div>' +
            (q.status === 'Open' || q.status === 'In Progress' ?
              '<div class="bg-slate-50 rounded-xl p-4 border border-slate-100">' +
                '<div class="text-xs font-bold text-slate-600 mb-2">Draft Response</div>' +
                '<textarea class="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs outline-none resize-none" rows="3" placeholder="Type your response..."></textarea>' +
                '<div class="flex gap-2 mt-2">' +
                  '<button class="bg-emerald-600 text-white text-xs px-3 py-1.5 rounded-lg font-semibold hover:bg-emerald-700 transition">📤 Submit Response</button>' +
                  '<button class="bg-slate-100 text-slate-700 text-xs px-3 py-1.5 rounded-lg font-semibold hover:bg-slate-200 transition">📎 Attach</button>' +
                '</div>' +
              '</div>' : '') +
          '</div>' +
        '</div>';
      }).join('');

    return '<div class="p-6">' +
      '<div class="flex items-center justify-between mb-5"><h2 class="text-base font-bold text-slate-900">❓ Query Management</h2>' +
      '<button class="bg-[#1B3A5C] text-white text-xs px-4 py-2 rounded-lg font-bold hover:bg-slate-800 transition">+ Log New Query</button></div>' + qHTML + '</div>';
  }

  /* ---- STAGE: Enhancement ---- */
  function stageEnhancement(c) {
    var enhs = c.enhancements || [];
    var p = pct(c);
    var alertBanner = p >= 75 ?
      '<div class="bg-amber-50 border border-amber-300 rounded-xl p-4 mb-5">' +
        '<p class="text-xs font-bold text-amber-800">⚠️ Preauth at ' + p + '% — enhancement required</p>' +
        '<p class="text-xs text-amber-700 mt-1">Original approved: ' + fmt(c.preauth && c.preauth.approvedAmt || 0) + ' · Current admissible bill: ' + fmt(c.totalBillAmt - c.nonPayableAmt) + '</p>' +
      '</div>' : '';

    var enhHTML = enhs.length === 0 ?
      '<div class="text-center py-12 text-slate-400"><div class="text-4xl mb-3">📈</div><p class="font-semibold">No enhancement requests raised</p></div>' :
      enhs.map(function(e) {
        return '<div class="border border-slate-200 rounded-xl overflow-hidden mb-4">' +
          '<div class="bg-indigo-50 border-b border-indigo-100 px-5 py-3 flex items-center justify-between">' +
            '<div class="flex items-center gap-3"><span class="font-bold text-slate-900">Enhancement #' + e.enhNo + '</span>' + bdg(e.status) + '</div>' +
            '<span class="text-xs text-slate-400">' + fmtDT(e.submittedAt) + '</span>' +
          '</div>' +
          '<div class="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">' +
            '<div>' + fr('Reason', e.reason) + fr('Additional Diagnosis', e.addlDiagnosis || '—') + fr('Additional Procedure', e.addlProcedure || '—') + '</div>' +
            '<div>' + fr('Original Approved', fmt(e.originalApprovedAmt)) +
              fr('Additional Requested', '<strong class="text-amber-600">' + fmt(e.additionalAmt) + '</strong>') +
              fr('Revised Estimate', fmt(e.revisedEstimate)) + fr('Revised LOS', e.revisedLOS + ' days') +
              fr('Submitted By', e.submittedBy) + fr('TAT Deadline', fmtDT(e.tatDeadline)) + '</div>' +
          '</div>' +
        '</div>';
      }).join('');

    return '<div class="p-6">' +
      '<div class="flex items-center justify-between mb-5"><h2 class="text-base font-bold text-slate-900">📈 Enhancement Requests</h2>' +
      '<button class="bg-[#F59E0B] text-white text-xs px-4 py-2 rounded-lg font-bold hover:bg-amber-600 transition">+ New Enhancement</button></div>' +
      alertBanner + enhHTML + '</div>';
  }

  /* ---- STAGE: Charges ---- */
  function stageCharges(c) {
    var chgs = c.charges || [];
    var totalAdmissible = chgs.reduce(function(a,ch){ return a + (ch.payerAmt || 0); }, 0);
    var totalNP         = chgs.reduce(function(a,ch){ return a + (ch.nonPayable || 0); }, 0);
    var totalRD         = chgs.reduce(function(a,ch){ return a + (ch.roomDiff || 0); }, 0);

    var rows = chgs.map(function(ch) {
      return '<tr class="' + (ch.nonPayable > 0 ? 'bg-red-50' : '') + '">' +
        '<td class="px-4 py-3 text-xs whitespace-nowrap">' + fmtDate(ch.date) + '</td>' +
        '<td class="px-4 py-3 text-sm font-medium text-slate-800">' + ch.desc + (ch.nonPayable > 0 ? ' <span class="ml-1 text-red-500 font-bold text-[10px]">NON-PAYABLE</span>' : '') + '</td>' +
        '<td class="px-4 py-3 text-xs">' + ch.category + '</td>' +
        '<td class="px-4 py-3 text-right font-mono font-bold text-slate-900">' + fmt(ch.amount) + '</td>' +
        '<td class="px-4 py-3 text-right font-mono text-emerald-600">' + (ch.payerAmt > 0 ? fmt(ch.payerAmt) : '—') + '</td>' +
        '<td class="px-4 py-3 text-right font-mono text-red-500">' + (ch.nonPayable > 0 ? fmt(ch.nonPayable) : '—') + '</td>' +
        '<td class="px-4 py-3 text-right font-mono text-amber-600">' + (ch.roomDiff > 0 ? fmt(ch.roomDiff) : '—') + '</td>' +
      '</tr>';
    }).join('');

    return '<div class="p-6">' +
      '<h2 class="text-base font-bold text-slate-900 mb-5">💰 Charge Tracking</h2>' +
      '<div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">' +
        '<div class="bg-slate-50 border border-slate-200 rounded-xl p-4 text-center"><div class="text-lg font-bold text-slate-900">' + fmt(c.totalBillAmt) + '</div><div class="text-xs text-slate-500 font-medium mt-1">Total Hospital Bill</div></div>' +
        '<div class="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center"><div class="text-lg font-bold text-emerald-700">' + fmt(totalAdmissible) + '</div><div class="text-xs text-emerald-600 font-medium mt-1">Payer Admissible</div></div>' +
        '<div class="bg-red-50 border border-red-200 rounded-xl p-4 text-center"><div class="text-lg font-bold text-red-600">' + fmt(totalNP) + '</div><div class="text-xs text-red-500 font-medium mt-1">Non-Payable (Patient)</div></div>' +
        '<div class="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center"><div class="text-lg font-bold text-amber-600">' + fmt(totalRD) + '</div><div class="text-xs text-amber-500 font-medium mt-1">Room Differential</div></div>' +
      '</div>' +
      '<div class="border border-slate-200 rounded-xl overflow-hidden">' +
        '<table class="min-w-full text-xs text-slate-700">' +
          '<thead class="bg-slate-50 text-slate-500 uppercase tracking-wider text-left">' +
            '<tr><th class="px-4 py-3 font-semibold">Date</th><th class="px-4 py-3 font-semibold">Description</th><th class="px-4 py-3 font-semibold">Category</th><th class="px-4 py-3 font-semibold text-right">Billed</th><th class="px-4 py-3 font-semibold text-right">Payer Admissible</th><th class="px-4 py-3 font-semibold text-right">Non-Payable</th><th class="px-4 py-3 font-semibold text-right">Room Diff</th></tr>' +
          '</thead>' +
          '<tbody class="divide-y divide-slate-100 bg-white">' + rows + '</tbody>' +
          '<tfoot class="bg-slate-100 font-bold text-xs">' +
            '<tr><td class="px-4 py-3" colspan="3">TOTAL</td>' +
            '<td class="px-4 py-3 text-right font-mono">' + fmt(c.totalBillAmt) + '</td>' +
            '<td class="px-4 py-3 text-right font-mono text-emerald-700">' + fmt(totalAdmissible) + '</td>' +
            '<td class="px-4 py-3 text-right font-mono text-red-600">' + fmt(totalNP) + '</td>' +
            '<td class="px-4 py-3 text-right font-mono text-amber-700">' + fmt(totalRD) + '</td></tr>' +
          '</tfoot>' +
        '</table>' +
      '</div></div>';
  }

  /* ---- STAGE: Claim Docket ---- */
  function stageDocket(c) {
    var m = masters();
    var checklist = (m.docChecklist && m.docChecklist['Final Claim']) || [];
    var docs = c.documents || [];

    var items = checklist.map(function(doc, i) {
      var uploaded = docs.some(function(d){ return d.name === doc.name && d.status === 'Verified'; });
      return '<div class="flex items-center gap-4 p-4 rounded-xl border ' + (uploaded ? 'bg-emerald-50 border-emerald-200' : doc.mandatory ? 'bg-amber-50 border-amber-100' : 'bg-slate-50 border-slate-200') + '">' +
        '<div class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ' + (uploaded ? 'bg-emerald-500 text-white' : 'bg-slate-300 text-white') + '">' + (uploaded ? '✓' : (i+1)) + '</div>' +
        '<div class="flex-1"><div class="text-sm font-semibold text-slate-800">' + doc.name + (doc.mandatory ? ' <span class="text-red-500 text-xs">*</span>' : '') + '</div><div class="text-xs text-slate-400">Format: ' + doc.format + '</div></div>' +
        '<div class="flex items-center gap-2">' + bdg(uploaded ? 'Verified' : doc.mandatory ? 'Pending Upload' : 'Draft') + '<button class="bg-white border border-slate-300 text-slate-600 text-xs px-3 py-1.5 rounded-lg hover:bg-slate-50 transition">' + (uploaded ? '🔄 Re-upload' : '📎 Upload') + '</button></div>' +
      '</div>';
    }).join('');

    return '<div class="p-6">' +
      '<div class="flex items-center justify-between mb-5"><h2 class="text-base font-bold text-slate-900">📁 Claim Docket</h2>' +
        '<div class="flex gap-2">' +
          '<button class="bg-slate-100 text-slate-700 text-xs px-4 py-2 rounded-lg font-bold hover:bg-slate-200 transition">👁️ Preview Sticker Bill</button>' +
          '<button class="bg-[#1B3A5C] text-white text-xs px-4 py-2 rounded-lg font-bold hover:bg-slate-800 transition">📤 Mark Docket Complete</button>' +
        '</div>' +
      '</div>' +
      '<div class="space-y-3 mb-5">' + (items || '<div class="text-slate-400 text-sm text-center py-6">No checklist configured</div>') + '</div>' +
      '<div class="bg-indigo-50 border border-indigo-200 rounded-xl p-4">' +
        '<h3 class="text-xs font-bold text-indigo-800 uppercase tracking-wider mb-2">📋 Docket Status</h3>' +
        '<div class="flex items-center gap-3">' + bdg('In Progress') + '<span class="text-xs text-indigo-700">' + docs.filter(function(d){ return d.status==='Verified'; }).length + ' of ' + checklist.length + ' documents uploaded · Complete all mandatory docs before submission</span></div>' +
      '</div></div>';
  }

  /* ---- STAGE: Final Claim ---- */
  function stageFinalClaim(c) {
    var coPayRow = c.coPayAmt > 0 ?
      '<tr class="bg-amber-50"><td class="px-5 py-3 text-amber-700">Co-pay (' + c.coPay + '%) — patient payable</td><td class="px-5 py-3 text-right">—</td><td class="px-5 py-3 text-right font-mono text-amber-600">− ' + fmt(c.coPayAmt) + '</td><td class="px-5 py-3 text-right font-mono font-bold text-amber-700">' + fmt(c.coPayAmt) + '</td></tr>' : '';

    return '<div class="p-6">' +
      '<div class="flex items-center justify-between mb-5"><h2 class="text-base font-bold text-slate-900">📤 Final Claim Submission</h2>' +
        '<button class="bg-[#1B3A5C] text-white text-xs px-4 py-2 rounded-lg font-bold hover:bg-slate-800 transition">📤 Submit Final Claim</button>' +
      '</div>' +
      '<div class="bg-slate-50 border border-slate-200 rounded-xl p-5 mb-5">' +
        '<h3 class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Claim Summary</h3>' +
        '<div class="grid grid-cols-2 md:grid-cols-4 gap-4">' + fr('Claim ID', c.id) + fr('Payer', c.payerName) + fr('Preauth Ref', (c.preauth && c.preauth.refNo) || '—') + fr('Admission Date', fmtDate(c.admissionDate)) + '</div>' +
      '</div>' +
      '<div class="border border-slate-200 rounded-xl overflow-hidden mb-5">' +
        '<div class="bg-slate-50 px-5 py-3 border-b border-slate-200"><h3 class="text-xs font-bold text-slate-700 uppercase tracking-wider">Final Claim Amounts</h3></div>' +
        '<table class="min-w-full text-xs text-slate-700">' +
          '<thead class="bg-slate-50 text-slate-500 uppercase text-left"><tr><th class="px-5 py-3 font-semibold">Line Item</th><th class="px-5 py-3 font-semibold text-right">Hospital Billed</th><th class="px-5 py-3 font-semibold text-right">Payer Admissible</th><th class="px-5 py-3 font-semibold text-right">Patient Payable</th></tr></thead>' +
          '<tbody class="divide-y divide-slate-100">' +
            '<tr><td class="px-5 py-3 font-semibold">Total Hospital Bill</td><td class="px-5 py-3 text-right font-bold font-mono">' + fmt(c.totalBillAmt) + '</td><td class="px-5 py-3 text-right">—</td><td class="px-5 py-3 text-right">—</td></tr>' +
            '<tr class="bg-red-50"><td class="px-5 py-3 text-red-700">Non-Payable Charges</td><td class="px-5 py-3 text-right font-mono text-red-600">− ' + fmt(c.nonPayableAmt) + '</td><td class="px-5 py-3 text-right">—</td><td class="px-5 py-3 text-right font-bold font-mono text-red-600">' + fmt(c.nonPayableAmt) + '</td></tr>' +
            '<tr><td class="px-5 py-3 text-slate-700">Payer Claim Amount (Admissible)</td><td class="px-5 py-3 text-right">—</td><td class="px-5 py-3 text-right font-bold font-mono text-emerald-600">' + fmt(c.totalBillAmt - c.nonPayableAmt) + '</td><td class="px-5 py-3 text-right">—</td></tr>' +
            coPayRow +
            '<tr class="bg-slate-100 font-bold"><td class="px-5 py-3">Total Claim to Payer</td><td class="px-5 py-3 text-right">—</td><td class="px-5 py-3 text-right font-mono text-emerald-700">' + fmt(c.totalBillAmt - c.nonPayableAmt - c.coPayAmt) + '</td><td class="px-5 py-3 text-right font-mono text-red-600">' + fmt(c.nonPayableAmt + c.coPayAmt) + '</td></tr>' +
          '</tbody>' +
        '</table>' +
      '</div>' +
      '<div class="bg-slate-50 border border-slate-200 rounded-xl p-6 text-center text-slate-400">' +
        '<p class="text-sm font-medium">No final claim submission on record</p>' +
        '<p class="text-xs mt-1">Complete the claim docket and click "Submit Final Claim" to proceed</p>' +
      '</div></div>';
  }

  /* ---- STAGE: Settlement ---- */
  function stageSettlement(c) {
    var balance = Math.max(0, c.nonPayableAmt + c.coPayAmt + c.roomDiffAmt - c.advanceAmt);

    return '<div class="p-6">' +
      '<div class="flex items-center justify-between mb-5"><h2 class="text-base font-bold text-slate-900">🤝 Settlement Summary</h2>' +
        '<button class="bg-emerald-600 text-white text-xs px-4 py-2 rounded-lg font-bold hover:bg-emerald-700 transition">✅ Issue Discharge Clearance</button>' +
      '</div>' +
      '<div class="border border-slate-200 rounded-xl overflow-hidden mb-5">' +
        '<div class="bg-[#1B3A5C] px-5 py-3"><h3 class="text-xs font-bold text-white uppercase tracking-wider">Full Settlement Reconciliation</h3></div>' +
        '<table class="min-w-full text-sm text-slate-700">' +
          '<tbody class="divide-y divide-slate-100">' +
            '<tr><td class="px-5 py-3 text-slate-600">Total Hospital Bill</td><td class="px-5 py-3 text-right font-bold font-mono">' + fmt(c.totalBillAmt) + '</td></tr>' +
            '<tr class="bg-red-50"><td class="px-5 py-3 text-red-700">Non-Payable Charges (patient payable)</td><td class="px-5 py-3 text-right font-bold font-mono text-red-600">' + fmt(c.nonPayableAmt) + '</td></tr>' +
            (c.roomDiffAmt > 0 ? '<tr class="bg-amber-50"><td class="px-5 py-3 text-amber-700">Room Differential (patient payable)</td><td class="px-5 py-3 text-right font-bold font-mono text-amber-600">' + fmt(c.roomDiffAmt) + '</td></tr>' : '') +
            '<tr class="bg-emerald-50"><td class="px-5 py-3 text-emerald-700">Payer Approved Amount</td><td class="px-5 py-3 text-right font-bold font-mono text-emerald-600">− ' + fmt(c.approvedAmt) + '</td></tr>' +
            (c.coPayAmt > 0 ? '<tr><td class="px-5 py-3 text-slate-600">Co-pay (' + c.coPay + '%)</td><td class="px-5 py-3 text-right font-bold font-mono">' + fmt(c.coPayAmt) + '</td></tr>' : '') +
            '<tr class="bg-sky-50"><td class="px-5 py-3 text-sky-700">Advance Collected</td><td class="px-5 py-3 text-right font-bold font-mono text-sky-600">− ' + fmt(c.advanceAmt) + '</td></tr>' +
            '<tr class="bg-slate-800 text-white"><td class="px-5 py-4 font-bold text-base">Balance to Collect Before Discharge</td><td class="px-5 py-4 text-right font-bold text-xl font-mono ' + (balance > 0 ? 'text-red-300' : 'text-emerald-300') + '">' + fmt(balance) + '</td></tr>' +
          '</tbody>' +
        '</table>' +
      '</div>' +
      '<div class="grid grid-cols-1 md:grid-cols-2 gap-4">' +
        '<div class="bg-emerald-50 border border-emerald-200 rounded-xl p-4"><h3 class="text-xs font-bold text-emerald-800 uppercase tracking-wider mb-2">Patient Collection</h3><p class="text-xs text-emerald-700 mb-3">Collect <strong>' + fmt(balance) + '</strong> before discharge clearance</p><button class="w-full bg-emerald-600 text-white text-xs py-2 rounded-lg font-bold hover:bg-emerald-700 transition">💳 Record Patient Payment</button></div>' +
        '<div class="bg-indigo-50 border border-indigo-200 rounded-xl p-4"><h3 class="text-xs font-bold text-indigo-800 uppercase tracking-wider mb-2">TPA Credit Settlement</h3><p class="text-xs text-indigo-700 mb-3">Post payer credit receivable <strong>' + fmt(c.approvedAmt) + '</strong> when payment received</p><button class="w-full bg-indigo-600 text-white text-xs py-2 rounded-lg font-bold hover:bg-indigo-700 transition">📥 Record TPA Payment</button></div>' +
      '</div></div>';
  }

  /* ---- STAGE: Audit Log ---- */
  function stageAudit(c) {
    var history = c.auditHistory || [];
    var rows = history.map(function(h) {
      return '<div class="flex gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">' +
        '<div class="flex-shrink-0 w-9 h-9 rounded-full bg-[#1B3A5C] text-white flex items-center justify-center text-xs font-bold">' + h.user.charAt(0) + '</div>' +
        '<div class="flex-1 min-w-0">' +
          '<div class="flex items-center justify-between gap-2">' +
            '<span class="font-bold text-slate-900 text-sm">' + h.action + '</span>' +
            '<span class="text-xs text-slate-400 whitespace-nowrap flex-shrink-0">' + h.ts + '</span>' +
          '</div>' +
          '<div class="text-xs text-slate-500 mt-0.5">' + h.user + ' · <span class="font-medium text-slate-600">' + h.role + '</span></div>' +
          (h.remarks ? '<div class="text-xs text-slate-600 mt-1 bg-white px-2 py-1 rounded border border-slate-200">' + h.remarks + '</div>' : '') +
        '</div>' +
      '</div>';
    }).join('');

    return '<div class="p-6">' +
      '<div class="flex items-center justify-between mb-5"><h2 class="text-base font-bold text-slate-900">📋 Audit Log</h2>' +
        '<button class="bg-slate-100 text-slate-700 text-xs px-3 py-1.5 rounded-lg font-semibold hover:bg-slate-200 transition">⬇️ Export</button>' +
      '</div>' +
      '<div class="space-y-2">' + (rows || '<div class="text-center py-8 text-slate-400">No audit entries</div>') + '</div>' +
    '</div>';
  }

  /* =========================================================================
     TAB: MASTERS CONFIG
  ========================================================================= */

  function tabMasters() {
    var m = masters();
    var payers = m.payers || [];
    var nps    = m.nonPayables || [];
    var wents  = m.wardEntitlements || [];
    var rates  = m.rates || [];

    var payerRows = payers.map(function(p) {
      return '<tr class="hover:bg-slate-50">' +
        '<td class="px-4 py-3 font-mono text-[#1B3A5C] font-bold text-xs">' + p.code + '</td>' +
        '<td class="px-4 py-3 font-semibold text-slate-900 text-sm">' + p.name + '</td>' +
        '<td class="px-4 py-3 text-xs">' + p.type + '</td>' +
        '<td class="px-4 py-3 text-xs">' + p.submission + '</td>' +
        '<td class="px-4 py-3 text-center font-bold text-xs">' + p.tatPre + 'h</td>' +
        '<td class="px-4 py-3 text-center font-bold text-xs">' + p.tatSet + 'd</td>' +
        '<td class="px-4 py-3">' + bdg(p.status) + '</td>' +
        '<td class="px-4 py-3 text-xs font-mono">' + fmtDate(p.validity) + '</td>' +
        '<td class="px-4 py-3 text-center"><button class="text-xs text-[#1B3A5C] font-semibold hover:underline">Edit</button></td>' +
      '</tr>';
    }).join('');

    var npRows = nps.map(function(n) {
      return '<tr class="hover:bg-slate-50">' +
        '<td class="px-4 py-3 font-mono text-red-600 font-bold text-xs">' + n.code + '</td>' +
        '<td class="px-4 py-3 font-semibold text-slate-800 text-sm">' + n.name + '</td>' +
        '<td class="px-4 py-3 text-xs text-slate-500">' + n.reason + '</td>' +
        '<td class="px-4 py-3 text-center text-sm">' + (n.autoFlag ? '✅' : '—') + '</td>' +
        '<td class="px-4 py-3 text-center text-sm">' + (n.informAdmission ? '✅' : '—') + '</td>' +
      '</tr>';
    }).join('');

    var weRows = wents.map(function(w) {
      return '<tr class="hover:bg-slate-50">' +
        '<td class="px-4 py-3 font-semibold text-slate-800 text-sm">' + w.category + '</td>' +
        '<td class="px-4 py-3 text-xs text-slate-600">' + w.payLevel + '</td>' +
        '<td class="px-4 py-3">' + bdg(w.entitlement) + '</td>' +
      '</tr>';
    }).join('');

    var rateRows = rates.map(function(r) {
      return '<tr class="hover:bg-slate-50">' +
        '<td class="px-3 py-2.5 font-mono text-xs font-bold text-slate-500">' + r.code + '</td>' +
        '<td class="px-3 py-2.5 text-xs font-semibold text-slate-800">' + r.name + '</td>' +
        '<td class="px-3 py-2.5 text-right text-xs font-mono font-bold">' + fmt(r.mrp) + '</td>' +
        '<td class="px-3 py-2.5 text-right text-xs font-mono text-indigo-600">' + fmt(r['PAY-001'] || 0) + '</td>' +
        '<td class="px-3 py-2.5 text-right text-xs font-mono text-blue-600">' + fmt(r['PAY-003'] || 0) + '</td>' +
        '<td class="px-3 py-2.5 text-right text-xs font-mono text-emerald-600">' + fmt(r['PAY-004'] || 0) + '</td>' +
        '<td class="px-3 py-2.5 text-right text-xs font-mono text-teal-600">' + fmt(r['PAY-006'] || 0) + '</td>' +
      '</tr>';
    }).join('');

    return '<div class="space-y-5">' +

      /* Payer Master */
      '<div class="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">' +
        '<div class="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">' +
          '<h2 class="text-sm font-bold text-slate-900">🏢 Payer Master (' + payers.length + ' empanelled)</h2>' +
          '<button class="bg-[#1B3A5C] text-white text-xs px-3 py-1.5 rounded-lg font-bold hover:bg-slate-800 transition">+ Add Payer</button>' +
        '</div>' +
        '<div class="overflow-x-auto">' +
          '<table class="min-w-full text-xs text-slate-700">' +
            '<thead class="bg-slate-50 text-slate-500 uppercase tracking-wider text-left"><tr><th class="px-4 py-3 font-semibold">Code</th><th class="px-4 py-3 font-semibold">Payer Name</th><th class="px-4 py-3 font-semibold">Type</th><th class="px-4 py-3 font-semibold">Submission</th><th class="px-4 py-3 font-semibold text-center">Preauth TAT</th><th class="px-4 py-3 font-semibold text-center">Settlement TAT</th><th class="px-4 py-3 font-semibold">Status</th><th class="px-4 py-3 font-semibold">Validity</th><th class="px-4 py-3 font-semibold text-center">Action</th></tr></thead>' +
            '<tbody class="divide-y divide-slate-100">' + payerRows + '</tbody>' +
          '</table>' +
        '</div>' +
      '</div>' +

      /* Rate Master */
      '<div class="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">' +
        '<div class="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">' +
          '<h2 class="text-sm font-bold text-slate-900">💰 Rate Master (Payer-specific Rates)</h2>' +
          '<button class="bg-[#1B3A5C] text-white text-xs px-3 py-1.5 rounded-lg font-bold">+ Add Rate</button>' +
        '</div>' +
        '<div class="overflow-x-auto">' +
          '<table class="min-w-full text-xs text-slate-700">' +
            '<thead class="bg-slate-50 text-slate-500 uppercase tracking-wider text-left"><tr><th class="px-3 py-3 font-semibold">Code</th><th class="px-3 py-3 font-semibold">Service Name</th><th class="px-3 py-3 font-semibold text-right">MRP</th><th class="px-3 py-3 font-semibold text-right text-indigo-600">Star Health</th><th class="px-3 py-3 font-semibold text-right text-blue-600">Medi Assist</th><th class="px-3 py-3 font-semibold text-right text-emerald-600">CGHS</th><th class="px-3 py-3 font-semibold text-right text-teal-600">PMJAY</th></tr></thead>' +
            '<tbody class="divide-y divide-slate-100">' + rateRows + '</tbody>' +
          '</table>' +
        '</div>' +
      '</div>' +

      /* Non-Payable Master */
      '<div class="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">' +
        '<div class="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">' +
          '<h2 class="text-sm font-bold text-slate-900">🚫 Non-Payable Master (IRDA Excluded Items)</h2>' +
          '<button class="bg-[#1B3A5C] text-white text-xs px-3 py-1.5 rounded-lg font-bold">+ Add Item</button>' +
        '</div>' +
        '<div class="overflow-x-auto">' +
          '<table class="min-w-full text-xs text-slate-700">' +
            '<thead class="bg-slate-50 text-slate-500 uppercase tracking-wider text-left"><tr><th class="px-4 py-3 font-semibold">Code</th><th class="px-4 py-3 font-semibold">Item Name</th><th class="px-4 py-3 font-semibold">Reason</th><th class="px-4 py-3 font-semibold text-center">Auto-Flag</th><th class="px-4 py-3 font-semibold text-center">Inform at Admission</th></tr></thead>' +
            '<tbody class="divide-y divide-slate-100">' + npRows + '</tbody>' +
          '</table>' +
        '</div>' +
      '</div>' +

      /* Ward Entitlement */
      '<div class="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">' +
        '<div class="px-5 py-4 border-b border-slate-100 bg-slate-50"><h2 class="text-sm font-bold text-slate-900">🛏️ Ward Entitlement Master (CGHS / ECHS / Corporate)</h2></div>' +
        '<div class="overflow-x-auto">' +
          '<table class="min-w-full text-xs text-slate-700">' +
            '<thead class="bg-slate-50 text-slate-500 uppercase tracking-wider text-left"><tr><th class="px-4 py-3 font-semibold">Category</th><th class="px-4 py-3 font-semibold">Pay Level / Grade</th><th class="px-4 py-3 font-semibold">Room Entitlement</th></tr></thead>' +
            '<tbody class="divide-y divide-slate-100">' + weRows + '</tbody>' +
          '</table>' +
        '</div>' +
      '</div>' +
    '</div>';
  }

  /* =========================================================================
     TAB: RCM REPORTS
  ========================================================================= */

  function tabReports() {
    var all = claims();
    var totalBilled   = all.reduce(function(a,c){ return a + c.totalBillAmt; }, 0);
    var totalApproved = all.reduce(function(a,c){ return a + c.approvedAmt;  }, 0);
    var totalNP       = all.reduce(function(a,c){ return a + c.nonPayableAmt; }, 0);
    var recRate       = totalBilled > 0 ? Math.round((totalApproved / totalBilled) * 100) : 0;

    var payerMap = {};
    all.forEach(function(c) {
      if (!payerMap[c.payerName]) payerMap[c.payerName] = { name:c.payerName, count:0, billed:0, approved:0, np:0 };
      payerMap[c.payerName].count++;
      payerMap[c.payerName].billed    += c.totalBillAmt;
      payerMap[c.payerName].approved  += c.approvedAmt;
      payerMap[c.payerName].np        += c.nonPayableAmt;
    });
    var prows = Object.values(payerMap).map(function(p) {
      var rec = p.billed > 0 ? Math.round((p.approved / p.billed) * 100) : 0;
      return '<tr class="hover:bg-slate-50">' +
        '<td class="px-5 py-3 font-semibold text-slate-900 text-sm">' + p.name + '</td>' +
        '<td class="px-5 py-3 text-center font-bold">' + p.count + '</td>' +
        '<td class="px-5 py-3 text-right font-mono font-bold">' + fmt(p.billed) + '</td>' +
        '<td class="px-5 py-3 text-right font-mono font-bold text-emerald-600">' + fmt(p.approved) + '</td>' +
        '<td class="px-5 py-3 text-right font-mono text-red-500">' + fmt(p.np) + '</td>' +
        '<td class="px-5 py-3 text-right font-bold ' + (rec >= 80 ? 'text-emerald-600' : rec >= 60 ? 'text-amber-600' : 'text-red-500') + '">' + rec + '%</td>' +
      '</tr>';
    }).join('');

    var reportLinks = [
      { icon:'⏱️', title:'TAT Report',                desc:'Preauth & claim response times by payer' },
      { icon:'❌', title:'Denial Analysis',            desc:'Rejection reasons and appeal outcomes' },
      { icon:'🔄', title:'Self Pay Conversions',      desc:'Cases converted with reasons & approvals' },
      { icon:'📅', title:'Outstanding Ageing',        desc:'TPA credit by bucket (30/60/90/90+ days)' },
      { icon:'📋', title:'Query Ageing',               desc:'Open queries by executive and age' },
      { icon:'🏥', title:'CGHS / PMJAY Report',       desc:'Govt scheme claim status & portal submissions' }
    ].map(function(r) {
      return '<button class="bg-white border border-slate-200 rounded-xl p-4 text-left hover:border-[#1B3A5C] hover:shadow-sm transition-all">' +
        '<div class="text-2xl mb-2">' + r.icon + '</div>' +
        '<div class="font-bold text-slate-900 text-sm">' + r.title + '</div>' +
        '<div class="text-xs text-slate-400 mt-1">' + r.desc + '</div>' +
      '</button>';
    }).join('');

    return '<div class="space-y-5">' +
      '<div class="grid grid-cols-2 md:grid-cols-4 gap-4">' +
        '<div class="bg-white border border-slate-200 rounded-xl p-5 shadow-sm"><div class="text-xs text-slate-500 uppercase font-semibold mb-2">Total Billed (Insurance)</div><div class="text-2xl font-bold text-slate-900">' + fmt(totalBilled) + '</div></div>' +
        '<div class="bg-emerald-50 border border-emerald-200 rounded-xl p-5 shadow-sm"><div class="text-xs text-emerald-600 uppercase font-semibold mb-2">Total Approved</div><div class="text-2xl font-bold text-emerald-700">' + fmt(totalApproved) + '</div></div>' +
        '<div class="bg-red-50 border border-red-200 rounded-xl p-5 shadow-sm"><div class="text-xs text-red-500 uppercase font-semibold mb-2">Non-Payable</div><div class="text-2xl font-bold text-red-600">' + fmt(totalNP) + '</div></div>' +
        '<div class="bg-indigo-50 border border-indigo-200 rounded-xl p-5 shadow-sm"><div class="text-xs text-indigo-600 uppercase font-semibold mb-2">Recovery Rate</div><div class="text-2xl font-bold text-indigo-700">' + recRate + '%</div></div>' +
      '</div>' +
      '<div class="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">' +
        '<div class="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">' +
          '<h2 class="text-sm font-bold text-slate-900">📊 Payer-wise Revenue</h2>' +
          '<button class="bg-slate-100 text-slate-700 text-xs px-3 py-1.5 rounded-lg font-bold hover:bg-slate-200">⬇️ Export CSV</button>' +
        '</div>' +
        '<div class="overflow-x-auto">' +
          '<table class="min-w-full text-xs text-slate-700">' +
            '<thead class="bg-slate-50 text-slate-500 uppercase tracking-wider text-left"><tr><th class="px-5 py-3 font-semibold">Payer</th><th class="px-5 py-3 font-semibold text-center">Cases</th><th class="px-5 py-3 font-semibold text-right">Total Billed</th><th class="px-5 py-3 font-semibold text-right">Approved</th><th class="px-5 py-3 font-semibold text-right">Non-Payable</th><th class="px-5 py-3 font-semibold text-right">Recovery %</th></tr></thead>' +
            '<tbody class="divide-y divide-slate-100">' + prows + '</tbody>' +
            '<tfoot class="bg-slate-100 font-bold text-xs"><tr><td class="px-5 py-3">TOTAL</td><td class="px-5 py-3 text-center">' + all.length + '</td><td class="px-5 py-3 text-right font-mono">' + fmt(totalBilled) + '</td><td class="px-5 py-3 text-right font-mono text-emerald-700">' + fmt(totalApproved) + '</td><td class="px-5 py-3 text-right font-mono text-red-600">' + fmt(totalNP) + '</td><td class="px-5 py-3 text-right ' + (recRate >= 80 ? 'text-emerald-700' : 'text-red-600') + '">' + recRate + '%</td></tr></tfoot>' +
          '</table>' +
        '</div>' +
      '</div>' +
      '<div class="grid grid-cols-2 md:grid-cols-3 gap-4">' + reportLinks + '</div>' +
    '</div>';
  }

  /* =========================================================================
     WINDOW ACTION HANDLERS  (accessible from onclick="")
  ========================================================================= */

  window._insTab = function (tab) {
    _tab = tab; _claim = null;
    var c = document.getElementById('main-content');
    if (c) window.views.insurance(c);
  };

  window._insSetRole = function (role) {
    _role = role;
    try { localStorage.setItem('ins_role', role); } catch (e) {}
  };

  window._insOpenClaim = function (id) {
    _claim = id; _tab = 'workflow'; _stage = 'declaration';
    var c = document.getElementById('main-content');
    if (c) window.views.insurance(c);
  };

  window._insStage = function (stage) {
    _stage = stage;
    var c = document.getElementById('main-content');
    if (c) window.views.insurance(c);
  };

  window._insBackToQueue = function () {
    _claim = null; _tab = 'queue';
    var c = document.getElementById('main-content');
    if (c) window.views.insurance(c);
  };

  /* Keep backward compatibility with any existing window.switchInsTab calls */
  window.switchInsTab = window._insTab;
  window.openWorkflowFor = window._insOpenClaim;

})(); /* End IIFE */
