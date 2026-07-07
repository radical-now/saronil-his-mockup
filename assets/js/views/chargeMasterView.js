/* ==========================================================================
   SARONIL HEALTH HMS — CHARGE MASTER MODULE v2.0
   Single Source of Truth for all billable items, packages, and pricing
   ========================================================================== */

(function() {
  'use strict';

  const CATEGORIES = [
    'Registration','Consultation','Procedures','Surgery','OT Charges',
    'Anaesthesia','Room Charges','ICU / HDU Charges','Nursing Charges',
    'Day Care','Laboratory','Radiology','Pharmacy — Prescription',
    'Pharmacy — OTC','Consumables','Implants','Blood & Blood Products',
    'Oxygen','Medical Equipment (rental)','Ambulance','Physiotherapy',
    'Dietary','Medical Records / Certificates','Packages','Miscellaneous'
  ];

  const PAYERS = [
    { key:'Standard', label:'Standard (MRP)' },
    { key:'CGHS', label:'CGHS' },
    { key:'ECHS', label:'ECHS' },
    { key:'ESI', label:'ESI' },
    { key:'PMJAY', label:'PMJAY / Ayushman' },
    { key:'StateScheme', label:'State Scheme' },
    { key:'TPA', label:'TPA — Default' },
    { key:'Corporate', label:'Corporate — Default' }
  ];

  const DOCTOR_GRADES = [
    'Junior Resident','Senior Resident','Consultant',
    'Senior Consultant','HOD / Chief','Visiting Consultant'
  ];

  const UOM_OPTIONS = [
    'Per Visit','Per Day','Per Hour','Per Procedure','Per Test',
    'Per Item','Per Unit','Per Session','Per Trip','Per KM',
    'Per ML','Per MG','Per Strip','Per Cycle','Per Case',
    'Per Bottle','Per Vial','Per Piece','Per Shift'
  ];

  const DEPARTMENTS = [
    'Cardiology','Neurology','Orthopaedics','General Surgery',
    'Paediatrics','Obstetrics & Gynaecology','Emergency',
    'ICU / Critical Care','Operation Theatre','Anaesthesia',
    'Laboratory','Radiology','Pharmacy','Physiotherapy',
    'Dietary','Blood Bank','Nursing Ward','Day Care Unit',
    'Medical Records','Ophthalmology','ENT','Dermatology',
    'Psychiatry','Nephrology','Gastroenterology','Urology',
    'Oncology','Pulmonology','Endocrinology','Administration'
  ];

  const COMPLIANCE_FLAGS = [
    'None','Implant Sticker Required','Narcotic Prescription Required',
    'Blood Crossmatch Required','Doctor Sign Required'
  ];

  const AUTO_TRIGGER_EVENTS = [
    'Bed Allocated','Lab Test Resulted','OT Case Closed',
    'Dispense Confirmed','Radiology Reported','Consultation Completed',
    'Discharge Initiated','ICU Transfer','Day Care Admission'
  ];

  const STATUS_COLORS = {
    'Active':         { bg:'#D1FAE5', text:'#065F46', border:'#A7F3D0' },
    'Inactive':       { bg:'#F1F5F9', text:'#64748B', border:'#CBD5E1' },
    'Deactivated':    { bg:'#F1F5F9', text:'#64748B', border:'#CBD5E1' },
    'Suspended':      { bg:'#FEE2E2', text:'#991B1B', border:'#FECACA' },
    'Draft':          { bg:'#F8FAFC', text:'#94A3B8', border:'#E2E8F0' },
    'Pending Review': { bg:'#FEF3C7', text:'#92400E', border:'#FDE68A' },
    'Approved':       { bg:'#DBEAFE', text:'#1E40AF', border:'#BFDBFE' },
    'Rejected':       { bg:'#FFF1F2', text:'#BE123C', border:'#FECDD3' },
    'Scheduled':      { bg:'#EFF6FF', text:'#1D4ED8', border:'#BFDBFE' },
    'Superseded':     { bg:'#F1F5F9', text:'#94A3B8', border:'#CBD5E1' }
  };

  let cmState = {
    activeMainTab: 'dashboard',
    activeReportTab: 'operational',
    searchQuery: '',
    filters: { category:[], department:[], status:'', approvalStatus:'', visitType:'', insuranceBillable:'', packageEligible:'', gstApplicable:'', chargeTrigger:'' },
    selectedRows: new Set(),
    currentPage: 1,
    pageSize: 20,
    editingChargeCode: null,
    viewingChargeCode: null,
    currentUser: { id:'USR001', name:'Dr. Priya Nair', role:'CHARGE_MASTER_ADMIN', roleLabel:'Charge Master Admin' },
    filterSidebarOpen: true
  };

  function initData() {
    if (window.state.chargeMaster && window.state.chargeMaster._v2) return;
    window.state.chargeMaster = {
      _v2: true,
      items: buildMockCharges(),
      packages: buildMockPackages(),
      auditLog: buildMockAuditLog(),
      approvalQueue: buildMockApprovalQueue()
    };
  }

  function makeRate(std, cghs, tpa, pmjay, echs, esi) {
    return {
      Standard:    { amount: std,  effectiveFrom:'2025-01-01', effectiveTo:'', rateStatus:'Active', approvedBy:'Dr. Priya Nair', approvedOn:'2025-01-01' },
      CGHS:        { amount: cghs||0, effectiveFrom:'2025-01-01', effectiveTo:'', rateStatus:'Active', approvedBy:'Dr. Priya Nair', approvedOn:'2025-01-01' },
      ECHS:        { amount: echs||cghs||0, effectiveFrom:'2025-01-01', effectiveTo:'', rateStatus:'Active', approvedBy:'Dr. Priya Nair', approvedOn:'2025-01-01' },
      ESI:         { amount: esi||Math.round((cghs||0)*0.9), effectiveFrom:'2025-01-01', effectiveTo:'', rateStatus:'Active', approvedBy:'Dr. Priya Nair', approvedOn:'2025-01-01' },
      PMJAY:       { amount: pmjay||Math.round((cghs||0)*0.85), effectiveFrom:'2025-01-01', effectiveTo:'', rateStatus:'Active', approvedBy:'Dr. Priya Nair', approvedOn:'2025-01-01' },
      StateScheme: { amount: Math.round((cghs||0)*0.9), effectiveFrom:'2025-01-01', effectiveTo:'', rateStatus:'Active', approvedBy:'Dr. Priya Nair', approvedOn:'2025-01-01' },
      TPA:         { amount: tpa||0,  effectiveFrom:'2025-01-01', effectiveTo:'', rateStatus:'Active', approvedBy:'Dr. Priya Nair', approvedOn:'2025-01-01' },
      Corporate:   { amount: tpa?Math.round(tpa*0.95):0, effectiveFrom:'2025-01-01', effectiveTo:'', rateStatus:'Active', approvedBy:'Dr. Priya Nair', approvedOn:'2025-01-01' }
    };
  }

  function mkChg(code,name,alias,cat,sub,depts,desc,status,appStatus,sac,hsn,taxT,gstRate,uom,bilFreq,insB,pkgE,discA,maxDisc,clinJ,compF,visitT,trigger,autoEv,grades,rates) {
    return {
      code,name,alias,category:cat,subCategory:sub,
      departments:Array.isArray(depts)?depts:[depts],
      description:desc,status,approvalStatus:appStatus,
      sacCode:sac,hsnCode:hsn,taxTreatment:taxT,gstRate:gstRate||0,
      uom,minQty:1,defaultQty:1,billingFrequency:bilFreq||'One-time',
      dayCountRule:'Admission Day Only',proration:false,taxInclusive:false,
      gstExemptReason:taxT==='Exempt'?'Healthcare service':'',
      visitTypes:visitT||['OPD','IPD'],
      insuranceBillable:insB!==false,packageEligible:pkgE!==false,
      discountAllowed:discA||false,maxDiscount:maxDisc||0,
      requireClinicalJustification:clinJ||false,complianceFlag:compF||'None',
      nonPayablePayers:[],chargeTrigger:trigger||'Manual',autoTriggerEvent:autoEv||'',
      departmentPriceOverrides:{},icd10Code:'',procedureCode:'',loincCode:'',
      pmjayPackageCode:'',cghsPackageCode:'',
      doctorGradePrices:grades||{},payerRates:rates,payerRateHistory:{},
      createdBy:'Dr. Priya Nair',createdOn:'2025-01-01',
      lastModifiedBy:'Dr. Priya Nair',lastModifiedOn:'2025-06-01',
      billingUseCount:Math.floor(Math.random()*500),notes:''
    };
  }

  function buildMockCharges() {
    var c = mkChg;
    return [
      // REGISTRATION
      c('REG001','OPD Registration Fee','OPD Reg','Registration','New Patient',['Administration'],'OPD registration charge','Active','Approved','999312','','Exempt',0,'Per Visit','One-time',true,false,false,0,false,'None',['OPD','Emergency'],'Auto','Consultation Completed',{},makeRate(100,80,90,70,80,70)),
      c('REG002','IPD Admission Fee','IPD Admn','Registration','IPD Admission',['Nursing Ward'],'Inpatient admission fee','Active','Approved','999312','','Exempt',0,'Per Visit','One-time',true,false,false,0,false,'None',['IPD'],'Auto','Bed Allocated',{},makeRate(250,200,210,170,200,180)),
      c('REG003','Emergency Registration','ER Reg','Registration','Emergency',['Emergency'],'Emergency casualty registration','Active','Approved','999312','','Exempt',0,'Per Visit','One-time',true,false,false,0,false,'None',['Emergency'],'Auto','Consultation Completed',{},makeRate(150,120,130,100,120,100)),
      // CONSULTATION
      c('CON001','General OPD Consultation','Gen OPD','Consultation','OPD Visits',['Cardiology','General Surgery'],'General consultation','Active','Approved','999312','','Exempt',0,'Per Visit','One-time',true,true,true,15,false,'None',['OPD'],'Auto','Consultation Completed',{'Junior Resident':300,'Senior Resident':500,'Consultant':700,'Senior Consultant':1000,'HOD / Chief':1500,'Visiting Consultant':1200},makeRate(700,500,560,400,500,400)),
      c('CON002','Specialist Consultation — Cardiology','Cardio Consult','Consultation','Specialist OPD',['Cardiology'],'Cardiologist fee','Active','Approved','999312','','Exempt',0,'Per Visit','One-time',true,true,true,10,false,'None',['OPD','IPD'],'Manual','',{'Consultant':900,'Senior Consultant':1200,'HOD / Chief':1800},makeRate(1000,750,900,600,750,650)),
      c('CON003','Specialist Consultation — Neurology','Neuro Consult','Consultation','Specialist OPD',['Neurology'],'Neurology specialist','Active','Approved','999312','','Exempt',0,'Per Visit','One-time',true,true,true,10,false,'None',['OPD','IPD'],'Manual','',{'Consultant':1000,'Senior Consultant':1400,'HOD / Chief':2000},makeRate(1200,900,1000,720,900,800)),
      c('CON004','Specialist Consultation — Orthopaedics','Ortho Consult','Consultation','Specialist OPD',['Orthopaedics'],'Ortho specialist fee','Active','Approved','999312','','Exempt',0,'Per Visit','One-time',true,true,true,10,false,'None',['OPD','IPD'],'Manual','',{'Consultant':900,'Senior Consultant':1200},makeRate(1000,750,900,600,750,650)),
      c('CON005','Specialist Consultation — Paediatrics','Pedi Consult','Consultation','Specialist OPD',['Paediatrics'],'Paediatric fee','Active','Approved','999312','','Exempt',0,'Per Visit','One-time',true,true,true,10,false,'None',['OPD','IPD'],'Manual','',{'Consultant':700,'Senior Consultant':1000},makeRate(800,600,700,480,600,530)),
      c('CON006','Obs & Gynaecology Consultation','OG Consult','Consultation','Specialist OPD',['Obstetrics & Gynaecology'],'OBG specialist fee','Active','Approved','999312','','Exempt',0,'Per Visit','One-time',true,true,true,10,false,'None',['OPD','IPD'],'Manual','',{'Consultant':800,'Senior Consultant':1100},makeRate(900,650,750,520,650,580)),
      c('CON007','Tele-consultation (Video)','Tele-OPD','Consultation','Tele-Medicine',['Administration'],'Video consult fee','Active','Approved','999312','','Exempt',0,'Per Visit','One-time',true,false,true,20,false,'None',['OPD'],'Manual','',{'Consultant':500,'Senior Consultant':700},makeRate(600,450,550,360,450,400)),
      c('CON008','Follow-up Consultation','Follow-up','Consultation','OPD Visits',['Cardiology','Neurology'],'Follow-up within 7 days','Active','Approved','999312','','Exempt',0,'Per Visit','One-time',true,false,true,50,false,'None',['OPD'],'Manual','',{},makeRate(300,200,250,160,200,180)),
      c('CON009','Emergency Consultation','ER Consult','Consultation','Emergency',['Emergency'],'ER physician fee','Active','Approved','999312','','Exempt',0,'Per Visit','One-time',true,false,false,0,false,'None',['Emergency'],'Auto','Consultation Completed',{},makeRate(800,600,700,480,600,530)),
      // ROOM CHARGES
      c('ROM001','General Ward Bed','Gen Ward','Room Charges','Ward Charges',['Nursing Ward'],'Standard ward bed','Active','Approved','999311','','Exempt',0,'Per Day','Recurring',true,true,false,0,false,'None',['IPD'],'Auto','Bed Allocated',{},makeRate(1500,1000,1400,900,1050,870)),
      c('ROM002','Semi-Private Room (2-Sharing)','Semi-Private','Room Charges','Ward Charges',['Nursing Ward'],'Twin-sharing AC room','Active','Approved','999311','','Exempt',0,'Per Day','Recurring',true,true,false,0,false,'None',['IPD'],'Auto','Bed Allocated',{},makeRate(3000,2000,2800,1700,2100,1700)),
      c('ROM003','Private AC Room','Private Room','Room Charges','Ward Charges',['Nursing Ward'],'Single occupancy AC room','Active','Approved','999311','','Exempt',0,'Per Day','Recurring',true,true,false,0,false,'None',['IPD'],'Auto','Bed Allocated',{},makeRate(5000,3500,4500,2900,3675,2900)),
      c('ROM004','Deluxe Room','Deluxe Room','Room Charges','Ward Charges',['Nursing Ward'],'Deluxe single room with sofa','Active','Approved','999311','','Exempt',0,'Per Day','Recurring',true,false,false,0,false,'None',['IPD'],'Auto','Bed Allocated',{},makeRate(7000,5000,6500,4000,5250,4000)),
      c('ROM005','Suite Room','Suite','Room Charges','Ward Charges',['Nursing Ward'],'Premium suite with lounge','Active','Approved','999311','','Exempt',0,'Per Day','Recurring',true,false,false,0,false,'None',['IPD'],'Auto','Bed Allocated',{},makeRate(12000,0,0,0,0,0)),
      c('ROM006','Day Care Bed','Daycare Bed','Day Care','Day Care',['Day Care Unit'],'Same-day procedure bed','Active','Approved','999311','','Exempt',0,'Per Day','One-time',true,true,false,0,false,'None',['Day Care'],'Auto','Day Care Admission',{},makeRate(1000,700,900,580,735,580)),
      // ICU
      c('ICU001','Medical ICU Bed','MICU Bed','ICU / HDU Charges','ICU',['ICU / Critical Care'],'MICU bed per day','Active','Approved','999311','','Exempt',0,'Per Day','Recurring',true,true,false,0,false,'None',['IPD'],'Auto','Bed Allocated',{},makeRate(8000,5000,7000,4200,5250,4200)),
      c('ICU002','Surgical ICU Bed','SICU Bed','ICU / HDU Charges','ICU',['ICU / Critical Care'],'SICU bed per day','Active','Approved','999311','','Exempt',0,'Per Day','Recurring',true,true,false,0,false,'None',['IPD'],'Auto','Bed Allocated',{},makeRate(9000,5500,7800,4600,5775,4600)),
      c('ICU003','NICU Bed','NICU Bed','ICU / HDU Charges','NICU',['ICU / Critical Care'],'Neonatal ICU bed per day','Active','Approved','999311','','Exempt',0,'Per Day','Recurring',true,true,false,0,false,'None',['IPD'],'Auto','Bed Allocated',{},makeRate(7000,4500,6000,3800,4725,3800)),
      c('ICU004','HDU Bed','HDU Bed','ICU / HDU Charges','HDU',['ICU / Critical Care'],'High dependency unit bed','Active','Approved','999311','','Exempt',0,'Per Day','Recurring',true,true,false,0,false,'None',['IPD'],'Auto','Bed Allocated',{},makeRate(5000,3200,4500,2700,3360,2700)),
      // NURSING
      c('NUR001','Nursing — General Ward','Nursing Gen','Nursing Charges','Ward Nursing',['Nursing Ward'],'Daily nursing general ward','Active','Approved','999311','','Exempt',0,'Per Day','Recurring',true,true,false,0,false,'None',['IPD'],'Auto','Bed Allocated',{},makeRate(500,300,450,260,315,260)),
      c('NUR002','Nursing — ICU','Nursing ICU','Nursing Charges','ICU Nursing',['ICU / Critical Care'],'ICU intensive nursing','Active','Approved','999311','','Exempt',0,'Per Day','Recurring',true,true,false,0,false,'None',['IPD'],'Auto','Bed Allocated',{},makeRate(1500,900,1300,780,945,780)),
      c('NUR003','Special / Private Duty Nurse','Pvt Nurse','Nursing Charges','Special Nursing',['Nursing Ward'],'24hr private duty nurse per shift','Active','Approved','999311','','Exempt',0,'Per Shift','Recurring',true,false,false,0,false,'None',['IPD'],'Manual','',{},makeRate(1200,0,0,0,0,0)),
      // LAB
      c('LAB001','Complete Blood Count (CBC)','CBC','Laboratory','Haematology',['Laboratory'],'Full blood count','Active','Approved','999312','','GST Applicable',5,'Per Test','One-time',true,true,true,10,false,'None',['OPD','IPD','Emergency'],'Auto','Lab Test Resulted',{},makeRate(300,200,270,160,210,160)),
      c('LAB002','Blood Glucose — Fasting','FBS','Laboratory','Biochemistry',['Laboratory'],'Fasting blood glucose','Active','Approved','999312','','GST Applicable',5,'Per Test','One-time',true,true,true,10,false,'None',['OPD','IPD'],'Auto','Lab Test Resulted',{},makeRate(80,55,70,44,58,44)),
      c('LAB003','Lipid Profile','Lipid Profile','Laboratory','Biochemistry',['Laboratory'],'Cholesterol, TG, LDL, HDL panel','Active','Approved','999312','','GST Applicable',5,'Per Test','One-time',true,true,true,10,false,'None',['OPD','IPD'],'Auto','Lab Test Resulted',{},makeRate(500,350,450,280,368,280)),
      c('LAB004','Liver Function Test (LFT)','LFT','Laboratory','Biochemistry',['Laboratory'],'Complete liver function panel','Active','Approved','999312','','GST Applicable',5,'Per Test','One-time',true,true,true,10,false,'None',['OPD','IPD','Emergency'],'Auto','Lab Test Resulted',{},makeRate(600,420,540,340,441,340)),
      c('LAB005','Renal Function Test (RFT)','RFT','Laboratory','Biochemistry',['Laboratory'],'Urea, creatinine, electrolytes','Active','Approved','999312','','GST Applicable',5,'Per Test','One-time',true,true,true,10,false,'None',['OPD','IPD','Emergency'],'Auto','Lab Test Resulted',{},makeRate(500,350,450,280,368,280)),
      c('LAB006','Urine Routine & Microscopy','Urine R/M','Laboratory','Urine',['Laboratory'],'Routine urine examination','Active','Approved','999312','','GST Applicable',5,'Per Test','One-time',true,true,true,10,false,'None',['OPD','IPD'],'Auto','Lab Test Resulted',{},makeRate(120,80,108,64,84,64)),
      c('LAB007','Thyroid Function (TSH/T3/T4)','TFT','Laboratory','Endocrinology',['Laboratory'],'Thyroid panel','Active','Approved','999312','','GST Applicable',5,'Per Test','One-time',true,true,true,10,false,'None',['OPD','IPD'],'Auto','Lab Test Resulted',{},makeRate(700,490,630,392,515,392)),
      c('LAB008','Dengue NS1 Antigen','Dengue NS1','Laboratory','Serology',['Laboratory'],'Dengue NS1 rapid test','Active','Approved','999312','','GST Applicable',5,'Per Test','One-time',true,true,false,0,false,'None',['OPD','IPD','Emergency'],'Auto','Lab Test Resulted',{},makeRate(800,560,720,448,588,448)),
      c('LAB009','Blood Culture & Sensitivity','BC & S','Laboratory','Microbiology',['Laboratory'],'Blood culture with sensitivity','Active','Approved','999312','','GST Applicable',5,'Per Test','One-time',true,true,false,0,false,'None',['IPD','Emergency'],'Auto','Lab Test Resulted',{},makeRate(1200,840,1080,672,882,672)),
      c('LAB010','HbA1c','HbA1c','Laboratory','Biochemistry',['Laboratory'],'3-month average glucose','Active','Approved','999312','','GST Applicable',5,'Per Test','One-time',true,true,true,10,false,'None',['OPD','IPD'],'Auto','Lab Test Resulted',{},makeRate(500,350,450,280,368,280)),
      c('LAB011','Coagulation Profile (PT/INR)','Coag Profile','Laboratory','Haematology',['Laboratory'],'PT, APTT, INR panel','Active','Approved','999312','','GST Applicable',5,'Per Test','One-time',true,true,false,0,false,'None',['IPD','Emergency'],'Auto','Lab Test Resulted',{},makeRate(600,420,540,336,441,336)),
      c('LAB012','COVID-19 RT-PCR','COVID RT-PCR','Laboratory','Molecular',['Laboratory'],'COVID detection PCR','Active','Approved','999312','','GST Applicable',5,'Per Test','One-time',true,false,false,0,false,'None',['OPD','IPD','Emergency'],'Manual','',{},makeRate(500,0,0,0,0,0)),
      // RADIOLOGY
      c('RAD001','X-Ray Chest PA View','CXR PA','Radiology','Plain X-Ray',['Radiology'],'Chest PA radiograph','Active','Approved','999312','','Exempt',0,'Per Investigation','One-time',true,true,true,15,false,'None',['OPD','IPD','Emergency'],'Auto','Radiology Reported',{},makeRate(400,280,360,224,294,224)),
      c('RAD002','X-Ray Abdomen AP','X-Ray Abd','Radiology','Plain X-Ray',['Radiology'],'Abdominal X-ray','Active','Approved','999312','','Exempt',0,'Per Investigation','One-time',true,true,true,15,false,'None',['OPD','IPD','Emergency'],'Auto','Radiology Reported',{},makeRate(350,245,315,196,258,196)),
      c('RAD003','Ultrasound Whole Abdomen','USG Abdomen','Radiology','Ultrasound',['Radiology'],'Complete abdominal USG','Active','Approved','999312','','Exempt',0,'Per Investigation','One-time',true,true,true,10,false,'None',['OPD','IPD'],'Auto','Radiology Reported',{},makeRate(800,560,720,448,588,448)),
      c('RAD004','CT Scan Head Plain','CT Head','Radiology','CT Scan',['Radiology'],'Non-contrast CT brain','Active','Approved','999312','','Exempt',0,'Per Investigation','One-time',true,true,true,10,false,'None',['OPD','IPD','Emergency'],'Manual','',{},makeRate(3500,2450,3150,1960,2573,1960)),
      c('RAD005','CT Scan Head Contrast','CT Head+C','Radiology','CT Scan',['Radiology'],'Contrast CT brain','Active','Approved','999312','','Exempt',0,'Per Investigation','One-time',true,true,false,0,true,'Doctor Sign Required',['OPD','IPD','Emergency'],'Manual','',{},makeRate(5000,3500,4500,2800,3675,2800)),
      c('RAD006','MRI Brain Plain','MRI Brain','Radiology','MRI',['Radiology'],'Non-contrast MRI brain','Active','Approved','999312','','Exempt',0,'Per Investigation','One-time',true,true,false,0,false,'None',['OPD','IPD'],'Manual','',{},makeRate(7000,4900,6300,3920,5145,3920)),
      c('RAD007','MRI Lumbar Spine','MRI LS Spine','Radiology','MRI',['Radiology'],'Non-contrast MRI lumbar','Active','Approved','999312','','Exempt',0,'Per Investigation','One-time',true,true,false,0,false,'None',['OPD','IPD'],'Manual','',{},makeRate(7000,4900,6300,3920,5145,3920)),
      c('RAD008','2D Echocardiography','2D Echo','Radiology','Cardiac Imaging',['Cardiology','Radiology'],'Transthoracic echo with Doppler','Active','Approved','999312','','Exempt',0,'Per Investigation','One-time',true,true,true,10,false,'None',['OPD','IPD'],'Manual','',{},makeRate(2500,1750,2250,1400,1838,1400)),
      c('RAD009','Mammography Bilateral','Mammo','Radiology','Mammography',['Radiology'],'Bilateral digital mammography','Active','Approved','999312','','Exempt',0,'Per Investigation','One-time',true,true,true,10,false,'None',['OPD'],'Manual','',{},makeRate(2000,1400,1800,1120,1470,1120)),
      c('RAD010','OPG Dental X-Ray','OPG','Radiology','Dental Imaging',['Radiology'],'Orthopantomogram','Active','Approved','999312','','Exempt',0,'Per Investigation','One-time',true,true,true,10,false,'None',['OPD'],'Manual','',{},makeRate(600,420,540,336,441,336)),
      // SURGERY
      c('SUR001','Laparoscopic Cholecystectomy','Lap Chole','Surgery','Abdominal',['General Surgery','Operation Theatre'],'Lap Chole surgeon fee','Active','Approved','999312','','Exempt',0,'Per Procedure','One-time',true,true,false,0,true,'Doctor Sign Required',['IPD','Day Care'],'Auto','OT Case Closed',{'Consultant':25000,'Senior Consultant':35000,'HOD / Chief':45000},makeRate(35000,25000,31500,20000,26250,20000)),
      c('SUR002','Appendicectomy Open','Appendicectomy','Surgery','Abdominal',['General Surgery','Operation Theatre'],'Open appendicectomy fee','Active','Approved','999312','','Exempt',0,'Per Procedure','One-time',true,true,false,0,true,'Doctor Sign Required',['IPD'],'Auto','OT Case Closed',{'Consultant':20000,'Senior Consultant':28000},makeRate(28000,20000,25200,16000,21000,16000)),
      c('SUR003','Caesarean Section (LSCS)','LSCS','Surgery','Obstetric',['Obstetrics & Gynaecology','Operation Theatre'],'LSCS surgeon fee','Active','Approved','999312','','Exempt',0,'Per Procedure','One-time',true,true,false,0,true,'Doctor Sign Required',['IPD'],'Auto','OT Case Closed',{'Consultant':30000,'Senior Consultant':40000,'HOD / Chief':55000},makeRate(40000,28000,36000,22400,29400,22400)),
      c('SUR004','Total Knee Replacement (TKR)','TKR','Surgery','Orthopaedic',['Orthopaedics','Operation Theatre'],'TKR surgeon fee (implant separate)','Active','Approved','999312','','Exempt',0,'Per Procedure','One-time',true,true,false,0,true,'Implant Sticker Required',['IPD'],'Auto','OT Case Closed',{'Senior Consultant':65000,'HOD / Chief':85000},makeRate(80000,55000,72000,44000,57750,44000)),
      c('SUR005','Cataract (Phacoemulsification)','Phaco','Surgery','Ophthalmic',['Ophthalmology','Operation Theatre'],'Phaco surgeon fee (IOL separate)','Active','Approved','999312','','Exempt',0,'Per Procedure','One-time',true,true,false,0,true,'Implant Sticker Required',['IPD','Day Care'],'Auto','OT Case Closed',{'Consultant':15000,'Senior Consultant':22000,'HOD / Chief':30000},makeRate(22000,15400,19800,12320,16170,12320)),
      c('SUR006','Hernia Repair Inguinal Mesh','Hernia Repair','Surgery','Abdominal',['General Surgery','Operation Theatre'],'Inguinal hernia mesh repair','Active','Approved','999312','','Exempt',0,'Per Procedure','One-time',true,true,false,0,true,'Doctor Sign Required',['IPD','Day Care'],'Auto','OT Case Closed',{'Consultant':18000,'Senior Consultant':25000},makeRate(25000,17500,22500,14000,18375,14000)),
      c('SUR007','Hysterectomy Laparoscopic','Laparohyst','Surgery','Gynaecological',['Obstetrics & Gynaecology','Operation Theatre'],'Lap hysterectomy fee','Active','Approved','999312','','Exempt',0,'Per Procedure','One-time',true,true,false,0,true,'Doctor Sign Required',['IPD'],'Auto','OT Case Closed',{'Consultant':35000,'Senior Consultant':48000},makeRate(48000,33600,43200,26880,35280,26880)),
      c('SUR008','TURP','TURP','Surgery','Urological',['Urology','Operation Theatre'],'TURP procedure fee','Active','Approved','999312','','Exempt',0,'Per Procedure','One-time',true,true,false,0,true,'Doctor Sign Required',['IPD'],'Auto','OT Case Closed',{'Consultant':30000,'Senior Consultant':40000},makeRate(40000,28000,36000,22400,29400,22400)),
      // OT CHARGES
      c('OTC001','OT Charge — Minor','Minor OT','OT Charges','Minor Procedures',['Operation Theatre'],'Minor OT facility charge','Active','Approved','999312','','Exempt',0,'Per Case','One-time',true,true,false,0,false,'None',['IPD','Day Care'],'Auto','OT Case Closed',{},makeRate(5000,3500,4500,2800,3675,2800)),
      c('OTC002','OT Charge — Major','Major OT','OT Charges','Major Surgery',['Operation Theatre'],'Major OT facility charge','Active','Approved','999312','','Exempt',0,'Per Case','One-time',true,true,false,0,false,'None',['IPD'],'Auto','OT Case Closed',{},makeRate(12000,8400,10800,6720,8820,6720)),
      c('OTC003','OT Charge — Super Major','Super Major OT','OT Charges','Super Major',['Operation Theatre'],'Cardiothoracic/spine OT charge','Active','Approved','999312','','Exempt',0,'Per Case','One-time',true,true,false,0,false,'None',['IPD'],'Auto','OT Case Closed',{},makeRate(20000,14000,18000,11200,14700,11200)),
      c('OTC004','OT Nursing Services','OT Nursing','OT Charges','OT Support',['Operation Theatre'],'OT scrub/circulating nurse','Active','Approved','999312','','Exempt',0,'Per Case','One-time',true,true,false,0,false,'None',['IPD','Day Care'],'Auto','OT Case Closed',{},makeRate(2000,1400,1800,1120,1470,1120)),
      c('OTC005','OT Consumables Pack — Minor','OT Minor Pack','OT Charges','OT Consumables',['Operation Theatre'],'Drapes/sutures for minor','Active','Approved','999312','','Exempt',0,'Per Case','One-time',true,true,false,0,false,'None',['IPD','Day Care'],'Auto','OT Case Closed',{},makeRate(1500,1050,1350,840,1103,840)),
      c('OTC006','OT Consumables Pack — Major','OT Major Pack','OT Charges','OT Consumables',['Operation Theatre'],'Drapes/sutures for major','Active','Approved','999312','','Exempt',0,'Per Case','One-time',true,true,false,0,false,'None',['IPD'],'Auto','OT Case Closed',{},makeRate(4000,2800,3600,2240,2940,2240)),
      // ANAESTHESIA
      c('ANA001','Anaesthesia — General (<1hr)','GA Short','Anaesthesia','General Anaesthesia',['Anaesthesia'],'GA fee under 1 hour','Active','Approved','999312','','Exempt',0,'Per Case','One-time',true,true,false,0,false,'None',['IPD','Day Care'],'Auto','OT Case Closed',{'Consultant':8000,'Senior Consultant':12000},makeRate(12000,8400,10800,6720,8820,6720)),
      c('ANA002','Anaesthesia — General (1-3hrs)','GA Medium','Anaesthesia','General Anaesthesia',['Anaesthesia'],'GA fee 1-3 hours','Active','Approved','999312','','Exempt',0,'Per Case','One-time',true,true,false,0,false,'None',['IPD'],'Auto','OT Case Closed',{'Consultant':15000,'Senior Consultant':20000},makeRate(20000,14000,18000,11200,14700,11200)),
      c('ANA003','Anaesthesia — General (>3hrs)','GA Long','Anaesthesia','General Anaesthesia',['Anaesthesia'],'GA fee over 3 hours','Active','Approved','999312','','Exempt',0,'Per Case','One-time',true,true,false,0,false,'None',['IPD'],'Auto','OT Case Closed',{'Senior Consultant':25000,'HOD / Chief':35000},makeRate(30000,21000,27000,16800,22050,16800)),
      c('ANA004','Spinal / Epidural Anaesthesia','Spinal/Epi','Anaesthesia','Regional Anaesthesia',['Anaesthesia'],'Spinal or epidural fee','Active','Approved','999312','','Exempt',0,'Per Case','One-time',true,true,false,0,false,'None',['IPD','Day Care'],'Auto','OT Case Closed',{'Consultant':8000,'Senior Consultant':12000},makeRate(12000,8400,10800,6720,8820,6720)),
      c('ANA005','Local Anaesthesia — Minor','Local Anaes','Anaesthesia','Local Anaesthesia',['Anaesthesia','Emergency'],'Local anaesthesia fee','Active','Approved','999312','','Exempt',0,'Per Case','One-time',true,true,false,0,false,'None',['OPD','IPD','Emergency','Day Care'],'Manual','',{},makeRate(1000,700,900,560,735,560)),
      c('ANA006','Post-op Pain Management','Post-op Pain','Anaesthesia','Pain Management',['Anaesthesia','ICU / Critical Care'],'Post-op analgesia protocol per day','Active','Approved','999312','','Exempt',0,'Per Day','Recurring',true,true,false,0,false,'None',['IPD'],'Manual','',{},makeRate(3000,2100,2700,1680,2205,1680)),
      // PROCEDURES
      c('PRO001','Wound Suturing Minor','Minor Suture','Procedures','Emergency Procedures',['Emergency','General Surgery'],'Minor laceration suturing','Active','Approved','999312','','Exempt',0,'Per Procedure','One-time',true,true,true,10,false,'None',['OPD','IPD','Emergency'],'Manual','',{},makeRate(800,560,720,448,588,448)),
      c('PRO002','Complex Wound Dressing','Complex Dressing','Procedures','Wound Care',['Nursing Ward','Emergency'],'Complex wound dressing with debridement','Active','Approved','999312','','Exempt',0,'Per Procedure','One-time',true,true,true,10,false,'None',['OPD','IPD','Emergency'],'Manual','',{},makeRate(600,420,540,336,441,336)),
      c('PRO003','Intercostal Drainage Insertion','ICD Insertion','Procedures','Thoracic',['Emergency','General Surgery'],'ICD tube insertion bedside','Active','Approved','999312','','Exempt',0,'Per Procedure','One-time',true,true,false,0,true,'Doctor Sign Required',['IPD','Emergency'],'Manual','',{},makeRate(5000,3500,4500,2800,3675,2800)),
      c('PRO004','Bone Marrow Aspiration & Biopsy','BMAB','Procedures','Haematological',['Laboratory','Operation Theatre'],'Bone marrow aspiration and biopsy','Active','Approved','999312','','Exempt',0,'Per Procedure','One-time',true,true,false,0,true,'Doctor Sign Required',['IPD'],'Manual','',{},makeRate(8000,5600,7200,4480,5880,4480)),
      c('PRO005','Upper GI Endoscopy (OGD)','OGD Scope','Procedures','GI Endoscopy',['Gastroenterology'],'OGD scopy with biopsy if needed','Active','Approved','999312','','Exempt',0,'Per Procedure','One-time',true,true,true,10,false,'None',['OPD','IPD','Day Care'],'Manual','',{},makeRate(4500,3150,4050,2520,3308,2520)),
      c('PRO006','Colonoscopy Diagnostic','Colonoscopy','Procedures','GI Endoscopy',['Gastroenterology'],'Complete colonoscopy','Active','Approved','999312','','Exempt',0,'Per Procedure','One-time',true,true,true,10,false,'None',['OPD','IPD','Day Care'],'Manual','',{},makeRate(6000,4200,5400,3360,4410,3360)),
      c('PRO007','Haemodialysis Session','HD Session','Procedures','Nephrology',['Nephrology'],'Single 4-hour HD session','Active','Approved','999312','','Exempt',0,'Per Session','One-time',true,true,false,0,false,'None',['IPD','Day Care'],'Auto','Dispense Confirmed',{},makeRate(2500,1750,2250,1400,1838,1400)),
      c('PRO008','ECG 12 Lead','12-Lead ECG','Procedures','Cardiac',['Cardiology','Emergency'],'Standard 12-lead ECG','Active','Approved','999312','','Exempt',0,'Per Procedure','One-time',true,true,true,15,false,'None',['OPD','IPD','Emergency'],'Auto','Consultation Completed',{},makeRate(200,140,180,112,147,112)),
      c('PRO009','Spirometry','Spirometry','Procedures','Pulmonary',['Pulmonology'],'Spirometry with bronchodilator test','Active','Approved','999312','','Exempt',0,'Per Procedure','One-time',true,true,true,10,false,'None',['OPD'],'Manual','',{},makeRate(800,560,720,448,588,448)),
      c('PRO010','Holter Monitor 24hr','Holter','Procedures','Cardiac',['Cardiology'],'24-hour ambulatory ECG','Active','Approved','999312','','Exempt',0,'Per Procedure','One-time',true,true,false,0,false,'None',['OPD','IPD'],'Manual','',{},makeRate(2000,1400,1800,1120,1470,1120)),
      // PHARMACY
      c('PHA001','Tab Paracetamol 500mg Strip/10','Paracetamol 500','Pharmacy — Prescription','Analgesics',['Pharmacy'],'Paracetamol 500mg strip','Active','Approved','','30049099','GST Applicable',12,'Per Strip','One-time',true,true,false,0,false,'None',['OPD','IPD','Emergency','Day Care'],'Auto','Dispense Confirmed',{},makeRate(18,0,0,0,0,0)),
      c('PHA002','Tab Amoxicillin 500mg Strip/10','Amoxicillin','Pharmacy — Prescription','Antibiotics',['Pharmacy'],'Amoxicillin 500mg strip','Active','Approved','','30041019','GST Applicable',12,'Per Strip','One-time',true,true,false,0,false,'None',['OPD','IPD'],'Auto','Dispense Confirmed',{},makeRate(45,0,0,0,0,0)),
      c('PHA003','Inj Paracetamol 1g/100ml IV','Inj Paracetamol IV','Pharmacy — Prescription','Analgesics',['Pharmacy','Operation Theatre'],'IV paracetamol 1g infusion','Active','Approved','','30049099','GST Applicable',12,'Per Bottle','One-time',true,true,false,0,false,'None',['IPD','Emergency','Day Care'],'Auto','Dispense Confirmed',{},makeRate(120,0,0,0,0,0)),
      c('PHA004','Inj Ceftriaxone 1g Vial','Ceftriaxone 1g','Pharmacy — Prescription','Antibiotics',['Pharmacy','Nursing Ward'],'Ceftriaxone 1g injection vial','Active','Approved','','30041019','GST Applicable',12,'Per Vial','One-time',true,true,false,0,false,'None',['IPD','Emergency'],'Auto','Dispense Confirmed',{},makeRate(140,0,0,0,0,0)),
      c('PHA005','Inj Pantoprazole 40mg Vial','Inj Pantocid','Pharmacy — Prescription','Anti-Ulcerants',['Pharmacy','Nursing Ward'],'Pantoprazole 40mg IV vial','Active','Approved','','30045000','GST Applicable',12,'Per Vial','One-time',true,true,false,0,false,'None',['IPD','Emergency'],'Auto','Dispense Confirmed',{},makeRate(80,0,0,0,0,0)),
      c('PHA006','Inj Morphine 10mg/ml Ampoule','Inj Morphine','Pharmacy — Prescription','Opioids',['Pharmacy','ICU / Critical Care'],'Morphine controlled drug','Active','Approved','','30040000','GST Applicable',0,'Per Ampoule','One-time',true,false,false,0,true,'Narcotic Prescription Required',['IPD'],'Manual','',{},makeRate(60,0,0,0,0,0)),
      c('PHA007','IV Normal Saline 500ml','NS 500ml','Pharmacy — Prescription','IV Fluids',['Pharmacy','Nursing Ward','Emergency'],'0.9% NaCl infusion 500ml','Active','Approved','','30049099','GST Applicable',5,'Per Bottle','One-time',true,true,false,0,false,'None',['IPD','Emergency','Day Care'],'Auto','Dispense Confirmed',{},makeRate(35,0,0,0,0,0)),
      c('PHA008','IV Ringer Lactate 500ml','RL 500ml','Pharmacy — Prescription','IV Fluids',['Pharmacy','Nursing Ward','Emergency'],'Ringer lactate 500ml','Active','Approved','','30049099','GST Applicable',5,'Per Bottle','One-time',true,true,false,0,false,'None',['IPD','Emergency','Day Care'],'Auto','Dispense Confirmed',{},makeRate(35,0,0,0,0,0)),
      // CONSUMABLES
      c('CON001C','IV Cannula 18G','IV Cannula 18G','Consumables','Vascular Access',['Nursing Ward','Emergency'],'Peripheral IV cannula 18G','Active','Approved','','90183200','GST Applicable',12,'Per Piece','One-time',true,true,false,0,false,'None',['IPD','Emergency'],'Auto','Dispense Confirmed',{},makeRate(30,0,0,0,0,0)),
      c('CON002C','Foley Catheter 14Fr','Foley 14Fr','Consumables','Urinary',['Nursing Ward','Emergency'],'Silicon Foley catheter 14Fr','Active','Approved','','90192000','GST Applicable',12,'Per Piece','One-time',true,true,false,0,false,'None',['IPD','Emergency'],'Manual','',{},makeRate(80,0,0,0,0,0)),
      c('CON003C','Ryles / NG Tube 14Fr','NG Tube 14Fr','Consumables','Enteral Access',['Nursing Ward','ICU / Critical Care'],'Nasogastric tube 14Fr','Active','Approved','','90183900','GST Applicable',12,'Per Piece','One-time',true,true,false,0,false,'None',['IPD','Emergency'],'Manual','',{},makeRate(60,0,0,0,0,0)),
      c('CON004C','Sterile Surgical Gloves Size 7 Pair','Surgical Gloves 7','Consumables','Surgical',['Operation Theatre'],'Sterile latex surgical gloves','Active','Approved','','40151200','GST Applicable',18,'Per Pair','One-time',true,true,false,0,false,'None',['IPD'],'Auto','OT Case Closed',{},makeRate(45,0,0,0,0,0)),
      c('CON005C','Suture Vicryl 2-0','Vicryl 2-0','Consumables','Sutures',['Operation Theatre','Emergency'],'Polyglactin 910 suture 2-0','Active','Approved','','30059020','GST Applicable',12,'Per Unit','One-time',true,true,false,0,false,'None',['IPD','Emergency'],'Auto','OT Case Closed',{},makeRate(200,0,0,0,0,0)),
      c('CON006C','Oxygen Cylinder A-type','O2 Cylinder','Oxygen','Medical Oxygen',['Nursing Ward','ICU / Critical Care','Emergency'],'Medical oxygen cylinder refill','Active','Approved','','28045000','GST Applicable',5,'Per Cylinder','One-time',true,true,false,0,false,'None',['IPD','Emergency'],'Manual','',{},makeRate(250,0,0,0,0,0)),
      c('CON007C','Ventilator Mechanical Per Day','Ventilator/Day','Medical Equipment (rental)','Ventilators',['ICU / Critical Care'],'Mechanical ventilation per day','Active','Approved','999313','','GST Applicable',18,'Per Day','Recurring',true,true,false,0,false,'None',['IPD'],'Auto','Bed Allocated',{},makeRate(5000,3500,4500,2800,3675,2800)),
      // IMPLANTS
      c('IMP001','Total Knee Implant (Indian Make)','TK Implant','Implants','Orthopaedic',['Orthopaedics','Operation Theatre'],'Indian cemented TK prosthesis','Active','Approved','','902134','GST Applicable',5,'Per Unit','One-time',true,false,false,0,true,'Implant Sticker Required',['IPD'],'Manual','',{},makeRate(50000,40000,45000,32000,42000,32000)),
      c('IMP002','Total Hip Replacement (Ceramic)','THR Ceramic','Implants','Orthopaedic',['Orthopaedics','Operation Theatre'],'Ceramic-on-ceramic THR set','Active','Approved','','902134','GST Applicable',5,'Per Unit','One-time',true,false,false,0,true,'Implant Sticker Required',['IPD'],'Manual','',{},makeRate(120000,90000,108000,72000,94500,72000)),
      c('IMP003','Coronary Stent DES','DES Stent','Implants','Cardiac',['Cardiology','Operation Theatre'],'Drug-eluting coronary stent (NPPA)','Active','Approved','','902190','GST Applicable',5,'Per Unit','One-time',true,false,false,0,true,'Implant Sticker Required',['IPD'],'Manual','',{},makeRate(27890,27890,27890,27890,27890,27890)),
      c('IMP004','Intraocular Lens Monofocal Foldable','IOL Monofocal','Implants','Ophthalmic',['Ophthalmology','Operation Theatre'],'Hydrophobic acrylic IOL','Active','Approved','','902139','GST Applicable',5,'Per Piece','One-time',true,false,false,0,true,'Implant Sticker Required',['IPD','Day Care'],'Manual','',{},makeRate(12000,9500,10800,7600,9975,7600)),
      c('IMP005','Pacemaker Dual Chamber DDD','DDD Pacemaker','Implants','Cardiac',['Cardiology','Operation Theatre'],'DDD permanent pacemaker with leads','Active','Approved','','902140','GST Applicable',5,'Per Unit','One-time',true,false,false,0,true,'Implant Sticker Required',['IPD'],'Manual','',{},makeRate(280000,200000,252000,160000,210000,160000)),
      // BLOOD BANK
      c('BLD001','PRBC 1 Unit','PRBC','Blood & Blood Products','Red Cell',['Blood Bank'],'Packed red cells 1 unit','Active','Approved','999312','','Exempt',0,'Per Unit','One-time',true,true,false,0,true,'Blood Crossmatch Required',['IPD','Emergency'],'Manual','',{},makeRate(1200,850,1080,680,893,680)),
      c('BLD002','Fresh Frozen Plasma 1 Unit','FFP','Blood & Blood Products','Plasma',['Blood Bank'],'FFP 1 unit','Active','Approved','999312','','Exempt',0,'Per Unit','One-time',true,true,false,0,true,'Blood Crossmatch Required',['IPD','Emergency'],'Manual','',{},makeRate(800,550,720,440,578,440)),
      c('BLD003','Platelets Random Donor 1 Unit','RDP','Blood & Blood Products','Platelets',['Blood Bank'],'Random donor platelets 1 unit','Active','Approved','999312','','Exempt',0,'Per Unit','One-time',true,true,false,0,true,'Blood Crossmatch Required',['IPD','Emergency'],'Manual','',{},makeRate(600,400,540,320,420,320)),
      c('BLD004','Whole Blood 1 Unit','Whole Blood','Blood & Blood Products','Whole Blood',['Blood Bank'],'Whole blood 1 unit','Active','Approved','999312','','Exempt',0,'Per Unit','One-time',true,true,false,0,true,'Blood Crossmatch Required',['IPD','Emergency'],'Manual','',{},makeRate(1500,1000,1350,800,1050,800)),
      c('BLD005','Cross-match Type and Screen','Cross-match','Blood & Blood Products','Blood Services',['Blood Bank','Laboratory'],'Pre-transfusion cross-match','Active','Approved','999312','','Exempt',0,'Per Test','One-time',true,true,false,0,false,'None',['IPD','Emergency'],'Manual','',{},makeRate(300,200,270,160,210,160)),
      // AMBULANCE
      c('AMB001','Ambulance BLS Per Trip','BLS Ambulance','Ambulance','Emergency Transport',['Emergency'],'BLS ambulance within city','Active','Approved','','','Exempt',0,'Per Trip','One-time',true,false,false,0,false,'None',['Emergency'],'Manual','',{},makeRate(1500,1000,1350,800,1050,800)),
      c('AMB002','Ambulance ALS Per Trip','ALS Ambulance','Ambulance','Emergency Transport',['Emergency'],'ALS ambulance with paramedic','Active','Approved','','','Exempt',0,'Per Trip','One-time',true,false,false,0,false,'None',['Emergency'],'Manual','',{},makeRate(3000,2000,2700,1600,2100,1600)),
      c('AMB003','Ambulance Per KM Outstation','Ambulance/KM','Ambulance','Emergency Transport',['Emergency'],'Per-km outstation transfer','Active','Approved','','','Exempt',0,'Per KM','One-time',true,false,false,0,false,'None',['Emergency'],'Manual','',{},makeRate(25,20,23,16,21,16)),
      // PHYSIOTHERAPY
      c('PHY001','Physiotherapy Initial Assessment','PT Assessment','Physiotherapy','Assessment',['Physiotherapy'],'Initial PT evaluation','Active','Approved','999312','','Exempt',0,'Per Session','One-time',true,true,true,10,false,'None',['OPD','IPD'],'Manual','',{},makeRate(500,350,450,280,368,280)),
      c('PHY002','Physiotherapy Exercise Session','PT Exercise','Physiotherapy','Therapeutic Exercise',['Physiotherapy'],'30-minute exercise session','Active','Approved','999312','','Exempt',0,'Per Session','One-time',true,true,true,10,false,'None',['OPD','IPD'],'Manual','',{},makeRate(400,280,360,224,294,224)),
      c('PHY003','Physiotherapy IFT/TENS Session','PT IFT/TENS','Physiotherapy','Electrotherapy',['Physiotherapy'],'Interferential therapy session','Active','Approved','999312','','Exempt',0,'Per Session','One-time',true,true,true,10,false,'None',['OPD','IPD'],'Manual','',{},makeRate(300,210,270,168,221,168)),
      c('PHY004','Respiratory Physiotherapy','Respiratory PT','Physiotherapy','Respiratory',['Physiotherapy','ICU / Critical Care'],'Chest physiotherapy session','Active','Approved','999312','','Exempt',0,'Per Session','One-time',true,true,false,0,false,'None',['IPD'],'Manual','',{},makeRate(500,350,450,280,368,280)),
      // DIETARY
      c('DIT001','Patient Meal General Diet Per Day','General Diet','Dietary','Standard Meals',['Dietary'],'Three general diet meals per day','Active','Approved','','','GST Applicable',5,'Per Day','Recurring',true,true,false,0,false,'None',['IPD'],'Auto','Bed Allocated',{},makeRate(300,200,270,160,210,160)),
      c('DIT002','Patient Meal Diabetic Diet Per Day','Diabetic Diet','Dietary','Therapeutic Meals',['Dietary'],'Diabetic diet per day','Active','Approved','','','GST Applicable',5,'Per Day','Recurring',true,true,false,0,false,'None',['IPD'],'Manual','',{},makeRate(350,250,315,200,263,200)),
      c('DIT003','Patient Meal Liquid Diet Per Day','Liquid Diet','Dietary','Therapeutic Meals',['Dietary'],'Liquid diet per day','Active','Approved','','','GST Applicable',5,'Per Day','Recurring',true,true,false,0,false,'None',['IPD'],'Manual','',{},makeRate(250,180,225,144,189,144)),
      // MEDICAL RECORDS
      c('MRC001','Medical Records Discharge Summary Copy','DC Summary Copy','Medical Records / Certificates','Records',['Medical Records'],'Printed discharge summary','Active','Approved','999312','','Exempt',0,'Per Document','One-time',false,false,false,0,false,'None',['IPD'],'Manual','',{},makeRate(100,0,0,0,0,0)),
      c('MRC002','Medicolegal Certificate','ML Certificate','Medical Records / Certificates','Medico-legal',['Medical Records'],'Medico-legal certificate','Active','Approved','999312','','Exempt',0,'Per Document','One-time',false,false,false,0,false,'None',['OPD','IPD','Emergency'],'Manual','',{},makeRate(500,0,0,0,0,0)),
      c('MRC003','Fitness Certificate','Fitness Cert','Medical Records / Certificates','Certificates',['Medical Records'],'Fitness-to-work certificate','Active','Approved','999312','','Exempt',0,'Per Document','One-time',false,false,false,0,false,'None',['OPD'],'Manual','',{},makeRate(300,0,0,0,0,0)),
      // MISCELLANEOUS
      c('MISC001','Patient Attendant Pass Per Day','Attendant Pass','Miscellaneous','Admin',['Administration','Nursing Ward'],'Visitor entry pass per day','Active','Approved','999312','','Exempt',0,'Per Day','Recurring',false,false,false,0,false,'None',['IPD'],'Manual','',{},makeRate(50,0,0,0,0,0)),
      c('MISC002','Locker Charges Per Day','Locker','Miscellaneous','Admin',['Administration'],'Safe locker facility per day','Active','Approved','999312','','Exempt',0,'Per Day','Recurring',false,false,false,0,false,'None',['IPD'],'Manual','',{},makeRate(100,0,0,0,0,0)),
      // DRAFT / PENDING
      c('NEW001','PET-CT Scan Whole Body','PET-CT','Radiology','Nuclear Medicine',['Radiology'],'FDG PET-CT whole body','Draft','Pending Review','999312','','Exempt',0,'Per Investigation','One-time',true,false,false,0,true,'Doctor Sign Required',['OPD','IPD'],'Manual','',{},makeRate(22000,15400,19800,12320,16170,12320)),
      c('NEW002','Robot-Assisted Prostatectomy','RALP','Surgery','Urological',['Urology','Operation Theatre'],'RALP surgeon fee','Draft','Draft','999312','','Exempt',0,'Per Procedure','One-time',true,true,false,0,true,'Doctor Sign Required',['IPD'],'Auto','OT Case Closed',{'Senior Consultant':80000,'HOD / Chief':100000},makeRate(120000,0,0,0,0,0)),
      // SUSPENDED
      c('SUS001','MRI Full Body Screening','MRI Full Body','Radiology','MRI',['Radiology'],'Full-body MRI screening (pricing error)','Suspended','Approved','999312','','Exempt',0,'Per Investigation','One-time',false,false,false,0,false,'None',['OPD'],'Manual','',{},makeRate(15000,0,0,0,0,0))
    ];
  }

  function buildMockPackages() {
    return [
      { code:'PKG001', name:'Laparoscopic Cholecystectomy Package', alias:'Lap Chole Pkg', packageCategory:'Surgery', applicableDiagnosis:'K80.20', duration:3, status:'Active', approvalStatus:'Approved', description:'All-inclusive Lap Chole package — surgery, anaesthesia, OT, 3 nights, nursing', packagePrices:{Standard:75000,CGHS:52500,TPA:70000,PMJAY:47250,ECHS:55000,Corporate:68000}, inclusions:[{code:'SUR001',name:'Lap Chole Surgery',qty:1,rate:35000,billableToPayer:true},{code:'ANA002',name:'GA (1-3h)',qty:1,rate:20000,billableToPayer:true},{code:'OTC002',name:'Major OT Charge',qty:1,rate:12000,billableToPayer:true},{code:'ROM002',name:'Semi-Private Room',qty:3,rate:3000,billableToPayer:true},{code:'NUR001',name:'Nursing Charges',qty:3,rate:500,billableToPayer:true},{code:'OTC006',name:'OT Major Consumables',qty:1,rate:4000,billableToPayer:true}], exclusions:[{code:'IMP001',name:'Implants',reason:'Billed at actuals',billedTo:'Patient'},{code:'BLD001',name:'Blood Products',reason:'Blood products excluded',billedTo:'Payer'}], createdBy:'Dr. Priya Nair', createdOn:'2025-01-01', lastModifiedOn:'2025-06-01' },
      { code:'PKG002', name:'Normal Delivery Package', alias:'Normal Delivery', packageCategory:'Delivery', applicableDiagnosis:'O80', duration:2, status:'Active', approvalStatus:'Approved', description:'All-inclusive normal vaginal delivery — 2 nights stay', packagePrices:{Standard:25000,CGHS:17500,TPA:23000,PMJAY:14875,ECHS:18000,Corporate:22000}, inclusions:[{code:'CON006',name:'OBG Consultation',qty:2,rate:900,billableToPayer:true},{code:'ROM002',name:'Semi-Private Room',qty:2,rate:3000,billableToPayer:true},{code:'NUR001',name:'Nursing Charges',qty:2,rate:500,billableToPayer:true},{code:'LAB001',name:'CBC',qty:1,rate:300,billableToPayer:true},{code:'DIT001',name:'General Diet',qty:2,rate:300,billableToPayer:false}], exclusions:[{code:'ANA004',name:'Epidural Anaesthesia',reason:'Billed separately if requested',billedTo:'Patient'}], createdBy:'Dr. Priya Nair', createdOn:'2025-01-01', lastModifiedOn:'2025-06-01' },
      { code:'PKG003', name:'Cataract (Phaco + IOL) Package', alias:'Cataract Pkg', packageCategory:'Day Care', applicableDiagnosis:'H26.9', duration:1, status:'Active', approvalStatus:'Approved', description:'Day care cataract surgery — phaco + Indian monofocal IOL + OT', packagePrices:{Standard:35000,CGHS:24500,TPA:32000,PMJAY:20825,ECHS:26000,Corporate:31000}, inclusions:[{code:'SUR005',name:'Phaco Cataract Surgery',qty:1,rate:22000,billableToPayer:true},{code:'IMP004',name:'Monofocal IOL',qty:1,rate:12000,billableToPayer:true},{code:'OTC001',name:'Minor OT Charge',qty:1,rate:5000,billableToPayer:true}], exclusions:[], createdBy:'Dr. Priya Nair', createdOn:'2025-03-01', lastModifiedOn:'2025-05-15' },
      { code:'PKG004', name:'LSCS Package', alias:'LSCS Pkg', packageCategory:'Surgery', applicableDiagnosis:'O82', duration:4, status:'Active', approvalStatus:'Approved', description:'All-inclusive LSCS — 4 nights, surgery, anaesthesia', packagePrices:{Standard:80000,CGHS:56000,TPA:75000,PMJAY:47600,ECHS:59000,Corporate:73000}, inclusions:[{code:'SUR003',name:'LSCS Surgery',qty:1,rate:40000,billableToPayer:true},{code:'ANA002',name:'GA',qty:1,rate:20000,billableToPayer:true},{code:'OTC002',name:'Major OT',qty:1,rate:12000,billableToPayer:true},{code:'ROM002',name:'Room',qty:4,rate:3000,billableToPayer:true},{code:'NUR001',name:'Nursing',qty:4,rate:500,billableToPayer:true}], exclusions:[{code:'BLD001',name:'Blood Products',reason:'If needed',billedTo:'Payer'},{code:'IMP001',name:'Surgical mesh',reason:'Implants at actuals',billedTo:'Patient'}], createdBy:'Dr. Priya Nair', createdOn:'2025-02-01', lastModifiedOn:'2025-06-01' }
    ];
  }

  function buildMockAuditLog() {
    var now = Date.now();
    return [
      {id:'AUD0001',ts:now-300000,user:'Dr. Priya Nair',role:'Charge Master Admin',action:'Price Updated',chargeCode:'IMP003',chargeName:'Coronary Stent DES',field:'Standard Rate',prev:'28500',next:'27890',reason:'NPPA revised ceiling price',ip:'192.168.1.45'},
      {id:'AUD0002',ts:now-2700000,user:'Rahul Sharma',role:'Billing Supervisor',action:'New Charge Submitted',chargeCode:'NEW001',chargeName:'PET-CT Scan',field:'',prev:'',next:'',reason:'Nuclear medicine dept request',ip:'192.168.1.72'},
      {id:'AUD0003',ts:now-5400000,user:'Dr. Priya Nair',role:'Charge Master Admin',action:'Charge Suspended',chargeCode:'SUS001',chargeName:'MRI Full Body Screening',field:'Status',prev:'Active',next:'Suspended',reason:'Pricing discrepancy detected',ip:'192.168.1.45'},
      {id:'AUD0004',ts:now-7200000,user:'Dr. Priya Nair',role:'Charge Master Admin',action:'Charge Approved',chargeCode:'IMP005',chargeName:'Pacemaker DDD',field:'Approval Status',prev:'Pending Review',next:'Approved',reason:'Standard approval',ip:'192.168.1.45'},
      {id:'AUD0005',ts:now-18000000,user:'Dr. Anita Sharma',role:'Department Head',action:'Price Update Requested',chargeCode:'ROM003',chargeName:'Private AC Room',field:'Standard Rate',prev:'4500',next:'5000',reason:'Annual rate revision 2025-26',ip:'192.168.1.88'},
      {id:'AUD0006',ts:now-86400000,user:'Dr. Priya Nair',role:'Charge Master Admin',action:'Bulk Price Update Executed',chargeCode:'BULK',chargeName:'Laboratory Category (12 items)',field:'Standard Rate',prev:'Various',next:'+10%',reason:'Annual revision',ip:'192.168.1.45'},
      {id:'AUD0007',ts:now-172800000,user:'Meena Joshi',role:'Billing Executive',action:'Export Executed',chargeCode:'',chargeName:'',field:'',prev:'',next:'',reason:'72 rows exported, Active charges',ip:'192.168.1.103'},
      {id:'AUD0008',ts:now-259200000,user:'Dr. Priya Nair',role:'Charge Master Admin',action:'Import Executed',chargeCode:'IMPORT',chargeName:'',field:'',prev:'',next:'',reason:'charges_Q4_2025.xlsx — 45 imported, 3 rejected',ip:'192.168.1.45'},
      {id:'AUD0009',ts:now-345600000,user:'Dr. Priya Nair',role:'Charge Master Admin',action:'Charge Deactivated',chargeCode:'OLD001',chargeName:'Thallium Stress Test',field:'Status',prev:'Active',next:'Inactive',reason:'Equipment decommissioned',ip:'192.168.1.45'},
      {id:'AUD0010',ts:now-432000000,user:'Dr. Priya Nair',role:'Charge Master Admin',action:'Charge Created',chargeCode:'PHY004',chargeName:'Respiratory Physiotherapy',field:'Status',prev:'',next:'Draft',reason:'New PT service',ip:'192.168.1.45'}
    ];
  }

  function buildMockApprovalQueue() {
    return [
      {id:'APQ001',type:'New Charge',chargeCode:'NEW001',chargeName:'PET-CT Scan — Whole Body',requestedBy:'Rahul Sharma',requestedByRole:'Billing Supervisor',requestedOn:'25 Jun 2026',effectiveDate:'01 Jul 2026',department:'Radiology',reason:'New nuclear medicine service',status:'Pending Review',agingDays:1},
      {id:'APQ002',type:'Price Update',chargeCode:'ROM003',chargeName:'Private AC Room',requestedBy:'Dr. Anita Sharma',requestedByRole:'Department Head',requestedOn:'23 Jun 2026',effectiveDate:'01 Jul 2026',department:'Nursing Ward',reason:'Annual rate revision. Proposed: Rs.5,000 from Rs.4,500',status:'Pending Review',agingDays:3,proposedRate:5000,payer:'Standard'},
      {id:'APQ003',type:'Deactivation',chargeCode:'MISC002',chargeName:'Locker Charges',requestedBy:'Meena Joshi',requestedByRole:'Billing Supervisor',requestedOn:'22 Jun 2026',effectiveDate:'26 Jun 2026',department:'Administration',reason:'Service discontinued',status:'Pending Review',agingDays:4},
      {id:'APQ004',type:'New Charge',chargeCode:'NEW002',chargeName:'Robot-Assisted Prostatectomy',requestedBy:'Dr. Suresh Kumar',requestedByRole:'Department Head',requestedOn:'20 Jun 2026',effectiveDate:'15 Jul 2026',department:'Urology',reason:'RALP program launch',status:'Pending Review',agingDays:6}
    ];
  }

  function fmtINR(val) {
    if (val===undefined||val===null||val==='') return '—';
    var n = Number(val);
    if (isNaN(n)) return '—';
    return '\u20B9'+n.toLocaleString('en-IN',{minimumFractionDigits:2,maximumFractionDigits:2});
  }

  function badge(status) {
    var c = STATUS_COLORS[status]||STATUS_COLORS['Draft'];
    return '<span style="display:inline-flex;align-items:center;padding:2px 10px;border-radius:999px;font-size:11px;font-weight:600;background:'+c.bg+';color:'+c.text+';border:1px solid '+c.border+';white-space:nowrap;">'+status+'</span>';
  }

  function fmtDate(ts) {
    return new Date(ts).toLocaleString('en-IN',{day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit',hour12:false,timeZone:'Asia/Kolkata'})+' IST';
  }

  function getItems()    { return window.state.chargeMaster&&window.state.chargeMaster.items   ? window.state.chargeMaster.items    : []; }
  function getPackages() { return window.state.chargeMaster&&window.state.chargeMaster.packages? window.state.chargeMaster.packages : []; }
  function getAuditLog() { return window.state.chargeMaster&&window.state.chargeMaster.auditLog? window.state.chargeMaster.auditLog : []; }
  function getQueue()    { return window.state.chargeMaster&&window.state.chargeMaster.approvalQueue? window.state.chargeMaster.approvalQueue : []; }

  function logAudit(action,chargeCode,chargeName,field,prev,next,reason) {
    var log = window.state.chargeMaster.auditLog||[];
    log.unshift({id:'AUD'+String(log.length+1).padStart(4,'0'),ts:Date.now(),user:cmState.currentUser.name,role:cmState.currentUser.roleLabel,action:action,chargeCode:chargeCode,chargeName:chargeName,field:field||'',prev:prev||'',next:next||'',reason:reason||'',ip:'192.168.1.45'});
    window.state.chargeMaster.auditLog=log;
  }

  function filteredItems() {
    var items = getItems();
    var q = cmState.searchQuery.trim().toLowerCase();
    if (q) items=items.filter(function(i){return i.code.toLowerCase().includes(q)||i.name.toLowerCase().includes(q)||(i.alias||'').toLowerCase().includes(q)||(i.sacCode||'').toLowerCase().includes(q)||(i.hsnCode||'').toLowerCase().includes(q);});
    var f=cmState.filters;
    if (f.category&&f.category.length) items=items.filter(function(i){return f.category.includes(i.category);});
    if (f.status) items=items.filter(function(i){return i.status===f.status;});
    if (f.approvalStatus) items=items.filter(function(i){return i.approvalStatus===f.approvalStatus;});
    if (f.visitType) items=items.filter(function(i){return (i.visitTypes||[]).includes(f.visitType);});
    if (f.insuranceBillable!=='') items=items.filter(function(i){return i.insuranceBillable===(f.insuranceBillable==='yes');});
    if (f.packageEligible!=='') items=items.filter(function(i){return i.packageEligible===(f.packageEligible==='yes');});
    if (f.gstApplicable!=='') items=items.filter(function(i){return f.gstApplicable==='yes'?i.taxTreatment==='GST Applicable':i.taxTreatment!=='GST Applicable';});
    if (f.chargeTrigger) items=items.filter(function(i){return i.chargeTrigger===f.chargeTrigger;});
    return items;
  }

  function pagedItems() {
    var all=filteredItems();
    var start=(cmState.currentPage-1)*cmState.pageSize;
    return {items:all.slice(start,start+cmState.pageSize),total:all.length};
  }

  function kpis() {
    var items=getItems();
    return {
      active:items.filter(function(i){return i.status==='Active';}).length,
      inactive:items.filter(function(i){return i.status==='Inactive'||i.status==='Deactivated';}).length,
      suspended:items.filter(function(i){return i.status==='Suspended';}).length,
      pendingApproval:getQueue().length,
      missingPayer:items.filter(function(i){return i.status==='Active'&&!(i.payerRates&&i.payerRates.CGHS&&i.payerRates.CGHS.amount);}).length,
      missingHSN:items.filter(function(i){return i.taxTreatment==='GST Applicable'&&!i.hsnCode&&!i.sacCode;}).length,
      future7:0,
      priceUpdPending:getQueue().filter(function(q){return q.type==='Price Update';}).length
    };
  }

  window.views = window.views||{};
  window.views.chargeMaster = function(container) {
    if (!container) return;
    initData();
    cmState.activeMainTab='dashboard';
    renderShell(container);
  };

  var CSS = `<style>
    .cm-root{font-family:'Inter',sans-serif;background:#F8FAFC;min-height:100vh;color:#1E293B;}
    .cm-header{background:#1B3A5C;color:#fff;padding:20px 28px;display:flex;align-items:center;justify-content:space-between;gap:16px;flex-wrap:wrap;}
    .cm-header-title{font-family:'Outfit',sans-serif;font-size:22px;font-weight:700;letter-spacing:-.3px;}
    .cm-header-sub{font-size:12px;color:#93C5FD;margin-top:2px;}
    .cm-tabs{display:flex;background:#fff;border-bottom:2px solid #E2E8F0;padding:0 28px;overflow-x:auto;gap:2px;}
    .cm-tab{padding:14px 18px;font-size:13px;font-weight:500;color:#64748B;cursor:pointer;border:none;background:none;border-bottom:2px solid transparent;margin-bottom:-2px;white-space:nowrap;transition:all .15s;}
    .cm-tab:hover{color:#1B3A5C;background:#F8FAFC;}
    .cm-tab.active{color:#1B3A5C;font-weight:700;border-bottom-color:#1B3A5C;}
    .cm-body{padding:24px 28px;}
    .cm-kpi-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(170px,1fr));gap:14px;margin-bottom:20px;}
    .cm-kpi{background:#fff;border:1px solid #E2E8F0;border-radius:12px;padding:18px;cursor:pointer;transition:box-shadow .15s;}
    .cm-kpi:hover{box-shadow:0 4px 20px rgba(0,0,0,.07);}
    .cm-kpi-label{font-size:11px;color:#64748B;font-weight:600;text-transform:uppercase;letter-spacing:.5px;margin-bottom:6px;}
    .cm-kpi-value{font-size:28px;font-weight:800;font-family:'Outfit',sans-serif;}
    .cm-kpi-sub{font-size:11px;color:#94A3B8;margin-top:4px;}
    .cm-card{background:#fff;border:1px solid #E2E8F0;border-radius:12px;overflow:hidden;margin-bottom:20px;}
    .cm-card-header{padding:14px 20px;border-bottom:1px solid #E2E8F0;display:flex;align-items:center;justify-content:space-between;}
    .cm-card-title{font-size:14px;font-weight:700;color:#1B3A5C;}
    .cm-table{width:100%;border-collapse:collapse;}
    .cm-table th{background:#F8FAFC;padding:10px 14px;text-align:left;font-size:11px;color:#64748B;font-weight:600;text-transform:uppercase;letter-spacing:.5px;border-bottom:1px solid #E2E8F0;white-space:nowrap;position:sticky;top:0;z-index:1;}
    .cm-table td{padding:11px 14px;font-size:12px;color:#334155;border-bottom:1px solid #F1F5F9;vertical-align:middle;}
    .cm-table tr:hover td{background:#F8FAFC;}
    .cm-table tr:last-child td{border-bottom:none;}
    .mono{font-family:monospace;font-size:11px;}
    .amount{text-align:right;font-weight:600;color:#1B3A5C;}
    .btn{padding:8px 16px;border-radius:8px;font-size:12px;font-weight:600;cursor:pointer;border:none;transition:all .15s;display:inline-flex;align-items:center;gap:6px;}
    .btn-primary{background:#1B3A5C;color:#fff;}
    .btn-primary:hover{background:#243B55;box-shadow:0 2px 8px rgba(27,58,92,.3);}
    .btn-accent{background:#F59E0B;color:#fff;}
    .btn-accent:hover{background:#D97706;}
    .btn-success{background:#10B981;color:#fff;}
    .btn-success:hover{background:#059669;}
    .btn-danger{background:#EF4444;color:#fff;}
    .btn-danger:hover{background:#DC2626;}
    .btn-outline{background:#fff;color:#1B3A5C;border:1px solid #CBD5E1;}
    .btn-outline:hover{background:#F8FAFC;}
    .btn-sm{padding:5px 10px;font-size:11px;border-radius:6px;}
    .cm-search-bar{display:flex;gap:10px;align-items:center;margin-bottom:18px;flex-wrap:wrap;}
    .cm-search-input{flex:1;min-width:200px;padding:9px 14px;border:1px solid #E2E8F0;border-radius:8px;font-size:13px;background:#fff;outline:none;}
    .cm-search-input:focus{border-color:#1B3A5C;box-shadow:0 0 0 3px rgba(27,58,92,.08);}
    .cm-select{padding:8px 12px;border:1px solid #E2E8F0;border-radius:8px;font-size:12px;background:#fff;color:#334155;outline:none;cursor:pointer;}
    .cm-alert{border-radius:10px;padding:14px 18px;margin-bottom:16px;display:flex;align-items:flex-start;gap:12px;font-size:13px;}
    .cm-alert-red{background:#FFF1F2;border:1px solid #FECDD3;color:#9F1239;}
    .cm-alert-amber{background:#FFFBEB;border:1px solid #FDE68A;color:#92400E;}
    .cm-alert-blue{background:#EFF6FF;border:1px solid #BFDBFE;color:#1E40AF;}
    .cm-form-section{margin-bottom:24px;}
    .cm-form-section-title{font-size:13px;font-weight:700;color:#1B3A5C;padding-bottom:10px;border-bottom:1px solid #E2E8F0;margin-bottom:14px;}
    .cm-form-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:14px;}
    .cm-field{display:flex;flex-direction:column;gap:4px;}
    .cm-label{font-size:11px;font-weight:600;color:#64748B;text-transform:uppercase;letter-spacing:.4px;}
    .cm-input{padding:9px 12px;border:1px solid #E2E8F0;border-radius:8px;font-size:13px;background:#fff;color:#1E293B;outline:none;}
    .cm-input:focus{border-color:#1B3A5C;box-shadow:0 0 0 3px rgba(27,58,92,.08);}
    .cm-action-menu{position:relative;display:inline-block;}
    .cm-action-dropdown{position:absolute;right:0;top:100%;z-index:99;background:#fff;border:1px solid #E2E8F0;border-radius:10px;box-shadow:0 8px 30px rgba(0,0,0,.12);padding:6px;min-width:190px;display:none;}
    .cm-action-dropdown.open{display:block;}
    .cm-action-item{display:block;width:100%;text-align:left;padding:8px 12px;font-size:12px;color:#334155;background:none;border:none;border-radius:6px;cursor:pointer;}
    .cm-action-item:hover{background:#F8FAFC;color:#1B3A5C;}
    .cm-action-item.danger{color:#EF4444;}
    .cm-action-item.danger:hover{background:#FFF1F2;}
    .cm-pagination{display:flex;align-items:center;justify-content:space-between;padding:12px 16px;background:#F8FAFC;border-top:1px solid #E2E8F0;font-size:12px;color:#64748B;flex-wrap:wrap;gap:8px;}
    .cm-pg-btn{padding:5px 10px;border:1px solid #E2E8F0;background:#fff;border-radius:6px;cursor:pointer;font-size:12px;transition:all .15s;}
    .cm-pg-btn:hover{background:#1B3A5C;color:#fff;border-color:#1B3A5C;}
    .cm-pg-btn:disabled{opacity:.4;cursor:not-allowed;}
    .cm-payer-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:10px;}
    .cm-payer-card{background:#F8FAFC;border:1px solid #E2E8F0;border-radius:10px;padding:14px;}
    .cm-payer-card-label{font-size:11px;color:#64748B;font-weight:600;margin-bottom:4px;}
    .cm-payer-card-rate{font-size:20px;font-weight:800;color:#1B3A5C;font-family:'Outfit',sans-serif;}
    .cm-sidebar{width:210px;flex-shrink:0;}
    .cm-sidebar-inner{background:#fff;border:1px solid #E2E8F0;border-radius:12px;padding:16px;}
    .cm-sidebar-title{font-size:12px;font-weight:700;color:#1B3A5C;text-transform:uppercase;letter-spacing:.5px;margin-bottom:12px;}
    .cm-layout-with-sidebar{display:flex;gap:20px;align-items:flex-start;}
    .cm-main-content{flex:1;min-width:0;}
    .cm-filter-group{margin-bottom:14px;}
    .cm-filter-label{font-size:11px;font-weight:600;color:#64748B;margin-bottom:5px;display:block;}
    .cm-filter-select{width:100%;padding:7px 10px;border:1px solid #E2E8F0;border-radius:6px;font-size:12px;background:#fff;}
    .cm-report-tabs{display:flex;gap:4px;margin-bottom:20px;flex-wrap:wrap;}
    .cm-report-tab{padding:8px 14px;border-radius:8px;font-size:12px;font-weight:500;cursor:pointer;border:1px solid #E2E8F0;background:#fff;color:#64748B;transition:all .15s;}
    .cm-report-tab.active{background:#1B3A5C;color:#fff;border-color:#1B3A5C;}
    .suspended-pulse{animation:spulse 2s infinite;}
    @keyframes spulse{0%,100%{opacity:1;}50%{opacity:.5;}}
    .cm-checkbox{width:15px;height:15px;cursor:pointer;}
    @media(max-width:768px){.cm-kpi-grid{grid-template-columns:repeat(2,1fr);}.cm-sidebar{width:100%;}.cm-layout-with-sidebar{flex-direction:column;}}
  </style>`;

  function renderShell(container) {
    var q=getQueue().length;
    var sus=getItems().filter(function(i){return i.status==='Suspended';}).length;
    var tabs=[
      {id:'dashboard',label:'\uD83C\uDFE0 Dashboard'},
      {id:'list',label:'\uD83D\uDCCB Charge List'},
      {id:'packages',label:'\uD83D\uDCE6 Packages'},
      {id:'queue',label:'\u23F3 Approval Queue'+(q>0?' <span style="background:#FEF3C7;color:#92400E;padding:1px 7px;border-radius:999px;font-size:10px;font-weight:700;">'+q+'</span>':'')},
      {id:'import',label:'\uD83D\uDCE5 Import / Export'},
      {id:'audit',label:'\uD83D\uDCDC Audit Log'},
      {id:'reports',label:'\uD83D\uDCCA Reports'}
    ];

    container.innerHTML = CSS + `
      <div class="cm-root" id="cm-root">
        <div class="cm-header">
          <div>
            <div class="cm-header-title">&#x1F4B0; Charge Master</div>
            <div class="cm-header-sub">Saronil Health HMS &nbsp;&middot;&nbsp; Single source of truth for all billable services &nbsp;&middot;&nbsp; ${cmState.currentUser.name} (${cmState.currentUser.roleLabel})</div>
          </div>
          <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap;">
            ${sus>0?`<span class="suspended-pulse" style="background:#EF4444;color:#fff;padding:5px 12px;border-radius:999px;font-size:11px;font-weight:700;">&#x26A0; ${sus} Suspended</span>`:''}
            <button class="btn btn-outline" onclick="window.cmOpenImport()">&#x1F4E5; Import</button>
            <button class="btn btn-outline" onclick="window.cmRunExport()">&#x1F4E4; Export</button>
            <button class="btn btn-accent" onclick="window.cmNewCharge()">+ Add Charge</button>
          </div>
        </div>
        <div class="cm-tabs">
          ${tabs.map(function(t){return '<button class="cm-tab '+(cmState.activeMainTab===t.id?'active':'')+'" onclick="window.cmSwitchTab(\''+t.id+'\')">'+t.label+'</button>';}).join('')}
        </div>
        <div class="cm-body" id="cm-body">
          <div id="cm-content"></div>
        </div>
      </div>
    `;

    renderTab(document.getElementById('cm-content'));
    setupHandlers(container);
  }

  function setupHandlers(container) {
    window.cmSwitchTab = function(tab) { cmState.activeMainTab=tab; cmState.currentPage=1; renderShell(container); };
    window.cmNewCharge = function() { cmState.activeMainTab='form'; cmState.editingChargeCode=null; renderShell(container); };
    window.cmEditCharge = function(code) { cmState.activeMainTab='form'; cmState.editingChargeCode=code; renderShell(container); };
    window.cmViewCharge = function(code) { cmState.activeMainTab='price'; cmState.viewingChargeCode=code; renderShell(container); };
    window.cmOpenImport = function() { cmState.activeMainTab='import'; renderShell(container); };
    window.cmRunExport = function() { cmState.activeMainTab='import'; renderShell(container); };
    window.cmSearch = function(q) { cmState.searchQuery=q; cmState.currentPage=1; var el=document.getElementById('cm-content'); if(el) renderTab(el); };
    window.cmSetFilter = function(key,val) {
      if (key==='category') { if (!cmState.filters.category) cmState.filters.category=[]; var idx=cmState.filters.category.indexOf(val); if(idx===-1) cmState.filters.category.push(val); else cmState.filters.category.splice(idx,1); }
      else { cmState.filters[key]=val; }
      cmState.currentPage=1; var el=document.getElementById('cm-content'); if(el) renderTab(el);
    };
    window.cmClearFilters = function() { cmState.filters={category:[],department:[],status:'',approvalStatus:'',visitType:'',insuranceBillable:'',packageEligible:'',gstApplicable:'',chargeTrigger:''}; cmState.searchQuery=''; cmState.currentPage=1; var el=document.getElementById('cm-content'); if(el) renderTab(el); };
    window.cmPage = function(p) { cmState.currentPage=p; var el=document.getElementById('cm-content'); if(el) renderTab(el); };
    window.cmToggleRow = function(code) { if(cmState.selectedRows.has(code)) cmState.selectedRows.delete(code); else cmState.selectedRows.add(code); var el=document.getElementById('cm-content'); if(el) renderTab(el); };
    window.cmToggleAllRows = function(checked) { if(checked) pagedItems().items.forEach(function(i){cmState.selectedRows.add(i.code);}); else cmState.selectedRows.clear(); var el=document.getElementById('cm-content'); if(el) renderTab(el); };
    window.cmToggleAction = function(code) { document.querySelectorAll('.cm-action-dropdown').forEach(function(d){if(d.dataset.code!==code) d.classList.remove('open');}); var el=document.querySelector('.cm-action-dropdown[data-code="'+code+'"]'); if(el) el.classList.toggle('open'); };
    document.addEventListener('click',function(e){if(!e.target.closest('.cm-action-menu')) document.querySelectorAll('.cm-action-dropdown').forEach(function(d){d.classList.remove('open');});});
    window.cmActivate = function(code) { var i=getItems().find(function(x){return x.code===code;}); if(!i) return; var p=i.status; i.status='Active'; logAudit('Charge Activated',code,i.name,'Status',p,'Active','Manual activation'); alert('\u2705 '+i.name+' activated.'); renderShell(container); };
    window.cmDeactivate = function(code) { var i=getItems().find(function(x){return x.code===code;}); if(!i) return; var reason; if(i.billingUseCount>0){reason=prompt('Charge has been billed '+i.billingUseCount+' time(s). Enter deactivation reason:'); if(!reason) return; }else{if(!confirm('Charge never billed. Hard delete or deactivate?')) {reason=prompt('Enter deactivation reason:'); if(!reason) return;} else{window.state.chargeMaster.items=window.state.chargeMaster.items.filter(function(x){return x.code!==code;}); logAudit('Charge Deleted',code,i.name,'','','','Hard delete'); alert('\u2705 Deleted.'); renderShell(container); return;}} logAudit('Charge Deactivated',code,i.name,'Status',i.status,'Inactive',reason); i.status='Inactive'; alert('\u2705 Done.'); renderShell(container); };
    window.cmSuspend = function(code) { var i=getItems().find(function(x){return x.code===code;}); if(!i) return; var r=prompt('Enter suspension reason (required):'); if(!r) return; logAudit('Charge Suspended',code,i.name,'Status',i.status,'Suspended',r); i.status='Suspended'; alert('\u26A0\uFE0F '+i.name+' suspended. Resolve within 24 hours.'); renderShell(container); };
    window.cmLiftSuspension = function(code) { var i=getItems().find(function(x){return x.code===code;}); if(!i) return; logAudit('Suspension Lifted',code,i.name,'Status','Suspended','Active','Resolved'); i.status='Active'; alert('\u2705 Suspension lifted.'); renderShell(container); };
    window.cmClone = function(code) { var i=getItems().find(function(x){return x.code===code;}); if(!i) return; var nc='CLN'+Date.now().toString().slice(-5); var cl=JSON.parse(JSON.stringify(i)); cl.code=nc; cl.name='Copy of '+i.name; cl.status='Draft'; cl.approvalStatus='Draft'; cl.billingUseCount=0; window.state.chargeMaster.items.push(cl); logAudit('Charge Cloned',nc,cl.name,'','','','Cloned from '+code); alert('\u2705 Cloned as '+nc+'. Edit and submit for approval.'); renderShell(container); };
    window.cmApproveCharge = function(code) { var i=getItems().find(function(x){return x.code===code;}); if(!i) return; logAudit('Charge Approved',code,i.name,'Approval Status','Pending Review','Approved','Manual'); i.approvalStatus='Approved'; i.status='Active'; alert('\u2705 Approved and activated.'); renderShell(container); };
    window.cmApproveQueueItem = function(id) { var q=getQueue().find(function(x){return x.id===id;}); if(!q) return; if(q.requestedBy===cmState.currentUser.name){alert('\u274C Cannot approve own request.'); return;} if(q.type==='Price Update'){var it=getItems().find(function(x){return x.code===q.chargeCode;}); if(it&&q.proposedRate&&q.payer){var prev=it.payerRates[q.payer]?it.payerRates[q.payer].amount:0; it.payerRates[q.payer]={amount:q.proposedRate,effectiveFrom:new Date().toISOString().slice(0,10),effectiveTo:'',rateStatus:'Active',approvedBy:cmState.currentUser.name,approvedOn:new Date().toISOString().slice(0,10)}; logAudit('Price Updated',q.chargeCode,q.chargeName,q.payer+' Rate',String(prev),String(q.proposedRate),'Queue approval');}} else if(q.type==='Deactivation'){var it2=getItems().find(function(x){return x.code===q.chargeCode;}); if(it2){it2.status='Inactive'; logAudit('Charge Deactivated',q.chargeCode,q.chargeName,'Status','Active','Inactive',q.reason);}} else{var it3=getItems().find(function(x){return x.code===q.chargeCode;}); if(it3){it3.status='Active'; it3.approvalStatus='Approved'; logAudit('Charge Approved',q.chargeCode,q.chargeName,'Approval Status','Pending Review','Approved',q.reason);}} window.state.chargeMaster.approvalQueue=getQueue().filter(function(x){return x.id!==id;}); alert('\u2705 '+q.type+' approved.'); renderShell(container); };
    window.cmRejectQueueItem = function(id) { var reason=prompt('Enter rejection reason (mandatory):'); if(!reason) return; var q=getQueue().find(function(x){return x.id===id;}); if(q) logAudit('Request Rejected',q.chargeCode,q.chargeName,'Approval Status','Pending Review','Rejected',reason); window.state.chargeMaster.approvalQueue=getQueue().filter(function(x){return x.id!==id;}); alert('\u274C Rejected. Returned to requester.'); renderShell(container); };
    window.cmSaveCharge = function() {
      var code=(document.getElementById('cm-form-code')||{}).value||''; code=code.trim();
      var name=(document.getElementById('cm-form-name')||{}).value||''; name=name.trim();
      var cat=(document.getElementById('cm-form-category')||{}).value||'';
      var dept=(document.getElementById('cm-form-dept')||{}).value||'';
      var rateEl=document.getElementById('cm-form-rate');
      var rate=rateEl?parseFloat(rateEl.value):NaN;
      if(!code||!name||!cat||!dept||isNaN(rate)||rate<0){alert('Please fill all required fields correctly.'); return;}
      var existing=getItems().find(function(x){return x.code===code;});
      if(existing&&code!==cmState.editingChargeCode){alert('Charge code already exists.'); return;}
      var taxT=(document.getElementById('cm-form-tax')||{}).value||'Exempt';
      var gstRate=parseFloat((document.getElementById('cm-form-gstrate')||{}).value||0);
      var hsn=(document.getElementById('cm-form-hsn')||{}).value||'';
      var sac=(document.getElementById('cm-form-sac')||{}).value||'';
      var uom=(document.getElementById('cm-form-uom')||{}).value||'Per Visit';
      if(taxT==='GST Applicable'&&!hsn&&!sac){alert('HSN or SAC code mandatory for GST-applicable charges.'); return;}
      var pl={code:code,name:name,alias:(document.getElementById('cm-form-alias')||{}).value||name.slice(0,20),category:cat,subCategory:(document.getElementById('cm-form-subcat')||{}).value||'',departments:[dept],description:(document.getElementById('cm-form-desc')||{}).value||'',status:'Draft',approvalStatus:'Draft',sacCode:sac,hsnCode:hsn,taxTreatment:taxT,gstRate:gstRate,uom:uom,minQty:1,defaultQty:1,billingFrequency:'One-time',dayCountRule:'Admission Day Only',proration:false,taxInclusive:false,gstExemptReason:taxT==='Exempt'?'Healthcare service':'',visitTypes:['OPD','IPD'],insuranceBillable:true,packageEligible:true,discountAllowed:false,maxDiscount:0,requireClinicalJustification:false,complianceFlag:'None',nonPayablePayers:[],chargeTrigger:'Manual',autoTriggerEvent:'',departmentPriceOverrides:{},icd10Code:'',procedureCode:'',loincCode:'',pmjayPackageCode:'',cghsPackageCode:'',doctorGradePrices:{},payerRates:makeRate(rate,Math.round(rate*0.7),Math.round(rate*0.9),Math.round(rate*0.65),Math.round(rate*0.72),Math.round(rate*0.65)),payerRateHistory:{},createdBy:cmState.currentUser.name,createdOn:new Date().toISOString().slice(0,10),lastModifiedBy:cmState.currentUser.name,lastModifiedOn:new Date().toISOString().slice(0,10),billingUseCount:0,notes:''};
      if(cmState.editingChargeCode){var idx=window.state.chargeMaster.items.findIndex(function(x){return x.code===cmState.editingChargeCode;}); if(idx>-1){pl.billingUseCount=window.state.chargeMaster.items[idx].billingUseCount; window.state.chargeMaster.items[idx]=pl;} logAudit('Charge Updated',code,name,'Multiple Fields','','','Form edit'); alert('\u2705 Updated. Status: Draft.');}else{window.state.chargeMaster.items.push(pl); logAudit('Charge Created',code,name,'Status','','Draft','New charge'); alert('\u2705 Created as Draft.');}
      cmState.activeMainTab='list'; cmState.editingChargeCode=null; renderShell(container);
    };
    window.cmSubmitApproval = function(code) { var i=getItems().find(function(x){return x.code===code;}); if(!i) return; i.approvalStatus='Pending Review'; window.state.chargeMaster.approvalQueue.push({id:'APQ'+String(getQueue().length+1).padStart(3,'0'),type:'New Charge',chargeCode:code,chargeName:i.name,requestedBy:cmState.currentUser.name,requestedByRole:cmState.currentUser.roleLabel,requestedOn:new Date().toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'}),effectiveDate:'Immediate',department:(i.departments||[''])[0],reason:'New charge submission',status:'Pending Review',agingDays:0}); logAudit('Charge Submitted for Review',code,i.name,'Approval Status','Draft','Pending Review','Submitted'); alert('\uD83D\uDCE4 Submitted for review.'); renderShell(container); };
    window.cmSetReportTab = function(tab) { cmState.activeReportTab=tab; var el=document.getElementById('cm-content'); if(el) renderTab(el); };
    window.cmBulkAction = function(op) { var sel=Array.from(cmState.selectedRows); if(!sel.length){alert('Select at least one charge.'); return;} if(op==='activate'){sel.forEach(function(code){var i=getItems().find(function(x){return x.code===code;}); if(i&&i.approvalStatus==='Approved'){i.status='Active'; logAudit('Bulk Activated',code,i.name,'Status','','Activated','Bulk');}}); alert('\u2705 '+sel.length+' charges activated.'); cmState.selectedRows.clear(); renderShell(container);}else if(op==='deactivate'){var reason=prompt('Enter bulk deactivation reason:'); if(!reason) return; sel.forEach(function(code){var i=getItems().find(function(x){return x.code===code;}); if(i){i.status='Inactive'; logAudit('Bulk Deactivated',code,i.name,'Status','Active','Inactive',reason);}}); alert('\u2705 '+sel.length+' deactivated.'); cmState.selectedRows.clear(); renderShell(container);}else if(op==='price'){var mode=prompt('Price update mode:\n1=Flat increase (Rs amount)\n2=Percentage increase\n3=Replace\nEnter 1, 2, or 3:'); var amount=parseFloat(prompt('Enter value:')); if(!mode||isNaN(amount)) return; sel.forEach(function(code){var i=getItems().find(function(x){return x.code===code;}); if(!i) return; var prev=i.payerRates.Standard.amount; var next=prev; if(mode==='1') next=prev+amount; else if(mode==='2') next=Math.round(prev*(1+amount/100)); else if(mode==='3') next=amount; i.payerRates.Standard.amount=next; logAudit('Bulk Price Update',code,i.name,'Standard Rate',String(prev),String(next),'Bulk');}); alert('\u2705 '+sel.length+' prices updated.'); cmState.selectedRows.clear(); renderShell(container);}};
    window.cmSimulateImport = function() { alert('Import Validation Report\n\nFile: charges_import_sample.csv\nUploaded by: '+cmState.currentUser.name+'\n\nTotal rows: 50\nValid rows: 44\nInvalid rows: 6\n\nErrors:\nRow 3 - Missing Standard Rate\nRow 11 - Duplicate Code: LAB001\nRow 15 - Invalid Category: "Biochemistry"\nRow 22 - Missing HSN code for GST charge\nRow 31 - Duplicate Name+Category: "CBC" in Laboratory\nRow 45 - Negative rate: -200\n\n[Would import 44 valid rows in production]'); logAudit('Import Simulated','IMPORT','','','','','Demo import simulation'); };
    window.cmSimulateExport = function() { var count=filteredItems().length; logAudit('Export Executed','EXPORT','','','','',count+' rows exported'); alert('\u2705 Export successful!\n\nFile: charge_master_'+new Date().toISOString().slice(0,10)+'.xlsx\nRows: '+count+'\n\n(Would trigger file download in production)'); };
  }

  function renderTab(el) {
    if (!el) return;
    try {
      switch(cmState.activeMainTab) {
        case 'dashboard': renderDashboard(el); break;
        case 'list':      renderList(el); break;
        case 'form':      renderForm(el); break;
        case 'price':     renderPriceDetail(el); break;
        case 'packages':  renderPackages(el); break;
        case 'queue':     renderQueue(el); break;
        case 'import':    renderImportExport(el); break;
        case 'audit':     renderAudit(el); break;
        case 'reports':   renderReports(el); break;
        default:          renderDashboard(el);
      }
    } catch(err) {
      el.innerHTML = '<div style="padding:20px;background:#FFF1F2;border:1px solid #FECDD3;border-radius:10px;color:#9F1239;"><strong>Render Error:</strong> '+err.message+'<br><pre style="font-size:11px;margin-top:8px;">'+err.stack+'</pre></div>';
    }
  }

  function renderDashboard(el) {
    var k=kpis(); var log=getAuditLog().slice(0,8); var sus=getItems().filter(function(i){return i.status==='Suspended';});
    var cats=CATEGORIES.filter(function(cat){return cat!=='Packages';});
    el.innerHTML = `
      ${sus.length>0?`<div class="cm-alert cm-alert-red"><span style="font-size:20px;">&#x26A0;&#xFE0F;</span><div><strong>Suspended Charges — Urgent:</strong> ${sus.map(function(s){return '<span class="mono">'+s.code+'</span> '+s.name;}).join(' &nbsp;|&nbsp; ')}<br><small>Resolve within 24 hours: reactivate or deactivate.</small></div></div>`:''}
      ${k.missingHSN>0?`<div class="cm-alert cm-alert-amber"><span>&#x1F6A8;</span><div><strong>${k.missingHSN} GST-applicable charges missing HSN/SAC code</strong> — cannot be used for GST invoices.</div></div>`:''}
      ${k.missingPayer>0?`<div class="cm-alert cm-alert-blue"><span>&#x2139;&#xFE0F;</span><div><strong>${k.missingPayer} active charges missing CGHS rate</strong> — billing engine will default to Standard Rate.</div></div>`:''}
      <div class="cm-kpi-grid">
        <div class="cm-kpi" onclick="window.cmSwitchTab('list')"><div class="cm-kpi-label">Active Charges</div><div class="cm-kpi-value" style="color:#10B981">${k.active}</div><div class="cm-kpi-sub">Click to view all</div></div>
        <div class="cm-kpi"><div class="cm-kpi-label">Inactive / Deactivated</div><div class="cm-kpi-value" style="color:#64748B">${k.inactive}</div><div class="cm-kpi-sub">Historical records</div></div>
        <div class="cm-kpi" onclick="window.cmSwitchTab('queue')"><div class="cm-kpi-label">Pending Approval</div><div class="cm-kpi-value" style="color:#F59E0B">${k.pendingApproval}</div><div class="cm-kpi-sub">Click to open queue</div></div>
        <div class="cm-kpi" style="border-color:#FECACA;"><div class="cm-kpi-label">Suspended</div><div class="cm-kpi-value" style="color:#EF4444">${k.suspended}</div><div class="cm-kpi-sub">Urgent resolution needed</div></div>
        <div class="cm-kpi"><div class="cm-kpi-label">Price Updates Pending</div><div class="cm-kpi-value" style="color:#F59E0B">${k.priceUpdPending}</div><div class="cm-kpi-sub">Awaiting approval</div></div>
        <div class="cm-kpi"><div class="cm-kpi-label">Future Rate Changes</div><div class="cm-kpi-value" style="color:#3B82F6">${k.future7}</div><div class="cm-kpi-sub">Active in next 7 days</div></div>
        <div class="cm-kpi" style="border-color:#FECDD3;"><div class="cm-kpi-label">Missing CGHS Rate</div><div class="cm-kpi-value" style="color:#EF4444">${k.missingPayer}</div><div class="cm-kpi-sub">Will use Standard Rate</div></div>
        <div class="cm-kpi" style="border-color:#FDE68A;"><div class="cm-kpi-label">Missing HSN / SAC</div><div class="cm-kpi-value" style="color:#D97706">${k.missingHSN}</div><div class="cm-kpi-sub">GST compliance gap</div></div>
      </div>

      <div class="cm-card" style="margin-bottom:20px;">
        <div class="cm-card-header"><div class="cm-card-title">&#x26A1; Quick Actions</div></div>
        <div style="padding:16px;display:flex;flex-wrap:wrap;gap:10px;">
          <button class="btn btn-primary" onclick="window.cmNewCharge()">+ Add New Charge</button>
          <button class="btn btn-outline" onclick="window.cmSwitchTab('queue')">&#x23F3; Approval Queue</button>
          <button class="btn btn-outline" onclick="window.cmSwitchTab('import')">&#x1F4E5; Import Charges</button>
          <button class="btn btn-outline" onclick="window.cmRunExport()">&#x1F4E4; Export</button>
          <button class="btn btn-outline" onclick="window.cmSwitchTab('audit')">&#x1F4DC; Audit Log</button>
          <button class="btn btn-outline" onclick="window.cmSwitchTab('reports')">&#x1F4CA; Reports</button>
        </div>
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;">
        <div class="cm-card">
          <div class="cm-card-header"><div class="cm-card-title">&#x1F4C5; Recent Activity</div></div>
          <div style="overflow-x:auto;">
            <table class="cm-table">
              <thead><tr><th>Time</th><th>User</th><th>Action</th><th>Charge</th></tr></thead>
              <tbody>
                ${log.map(function(l){return '<tr><td class="mono" style="white-space:nowrap;font-size:10px;">'+fmtDate(l.ts)+'</td><td style="font-size:12px;">'+l.user+'<br><small style="color:#94A3B8">'+l.role+'</small></td><td style="font-size:11px;">'+badge(l.action.includes('Suspend')?'Suspended':l.action.includes('Approv')?'Approved':l.action.includes('Reject')?'Rejected':l.action.includes('Creat')?'Draft':l.action.includes('Activ')?'Active':'Pending Review')+' '+l.action+'</td><td class="mono" style="font-size:10px;">'+l.chargeCode+'<br><span style="color:#94A3B8">'+(l.chargeName||'').slice(0,20)+'</span></td></tr>';}).join('')}
              </tbody>
            </table>
          </div>
        </div>
        <div class="cm-card">
          <div class="cm-card-header"><div class="cm-card-title">&#x1F4C2; Charges by Category</div></div>
          <div style="overflow-x:auto;">
            <table class="cm-table">
              <thead><tr><th>Category</th><th style="text-align:right">Total</th><th style="text-align:right">Active</th></tr></thead>
              <tbody>
                ${cats.map(function(cat){var its=getItems().filter(function(i){return i.category===cat;}); if(!its.length) return ''; var act=its.filter(function(i){return i.status==='Active';}).length; return '<tr><td style="font-size:12px;">'+cat+'</td><td style="text-align:right;font-weight:600;">'+its.length+'</td><td style="text-align:right;color:#10B981;font-weight:700;">'+act+'</td></tr>';}).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  }

  function renderList(el) {
    var paged=pagedItems(); var items=paged.items; var total=paged.total;
    var totalPages=Math.ceil(total/cmState.pageSize); var sel=cmState.selectedRows; var f=cmState.filters;
    el.innerHTML = `
      <div class="cm-search-bar">
        <input class="cm-search-input" id="cm-search" placeholder="&#x1F50D; Search by code, name, alias, ICD-10, HSN/SAC..." value="${cmState.searchQuery}" oninput="window.cmSearch(this.value)">
        <select class="cm-select" onchange="window.cmSetFilter('status',this.value)">
          <option value="">All Statuses</option>
          <option value="Active" ${f.status==='Active'?'selected':''}>Active</option>
          <option value="Inactive" ${f.status==='Inactive'?'selected':''}>Inactive</option>
          <option value="Suspended" ${f.status==='Suspended'?'selected':''}>Suspended</option>
          <option value="Draft" ${f.status==='Draft'?'selected':''}>Draft</option>
        </select>
        <select class="cm-select" onchange="window.cmSetFilter('approvalStatus',this.value)">
          <option value="">All Approval States</option>
          <option value="Approved" ${f.approvalStatus==='Approved'?'selected':''}>Approved</option>
          <option value="Pending Review" ${f.approvalStatus==='Pending Review'?'selected':''}>Pending Review</option>
          <option value="Draft" ${f.approvalStatus==='Draft'?'selected':''}>Draft</option>
          <option value="Rejected" ${f.approvalStatus==='Rejected'?'selected':''}>Rejected</option>
        </select>
        <select class="cm-select" onchange="window.cmSetFilter('gstApplicable',this.value)">
          <option value="">GST: All</option>
          <option value="yes" ${f.gstApplicable==='yes'?'selected':''}>GST Applicable</option>
          <option value="no" ${f.gstApplicable==='no'?'selected':''}>Exempt</option>
        </select>
        ${sel.size>0?`<div style="display:flex;gap:6px;align-items:center;background:#EFF6FF;border:1px solid #BFDBFE;border-radius:8px;padding:6px 12px;font-size:12px;color:#1E40AF;"><strong>${sel.size} selected</strong><button class="btn btn-sm btn-success" onclick="window.cmBulkAction('activate')">Activate</button><button class="btn btn-sm btn-danger" onclick="window.cmBulkAction('deactivate')">Deactivate</button><button class="btn btn-sm btn-accent" onclick="window.cmBulkAction('price')">Price Update</button><button class="btn btn-sm btn-outline" onclick="window.cmToggleAllRows(false)">Clear</button></div>`:''}
        <button class="btn btn-outline btn-sm" onclick="window.cmClearFilters()">&#x2715; Clear Filters</button>
      </div>

      <div class="cm-layout-with-sidebar">
        <div class="cm-sidebar">
          <div class="cm-sidebar-inner">
            <div class="cm-sidebar-title">Filters</div>
            <div class="cm-filter-group">
              <label class="cm-filter-label">Category</label>
              <div style="max-height:200px;overflow-y:auto;display:flex;flex-direction:column;gap:3px;">
                ${CATEGORIES.slice(0,16).map(function(cat){return '<label style="display:flex;align-items:center;gap:6px;font-size:12px;cursor:pointer;padding:3px;"><input type="checkbox" '+(f.category.includes(cat)?'checked':'')+' onchange="window.cmSetFilter(\'category\',\''+cat+'\')"> '+cat+'</label>';}).join('')}
              </div>
            </div>
            <div class="cm-filter-group">
              <label class="cm-filter-label">Visit Type</label>
              <select class="cm-filter-select" onchange="window.cmSetFilter('visitType',this.value)">
                <option value="">All</option><option value="OPD">OPD</option><option value="IPD">IPD</option><option value="Emergency">Emergency</option><option value="Day Care">Day Care</option>
              </select>
            </div>
            <div class="cm-filter-group">
              <label class="cm-filter-label">Insurance Billable</label>
              <select class="cm-filter-select" onchange="window.cmSetFilter('insuranceBillable',this.value)">
                <option value="">All</option><option value="yes">Yes</option><option value="no">No</option>
              </select>
            </div>
            <div class="cm-filter-group">
              <label class="cm-filter-label">Package Eligible</label>
              <select class="cm-filter-select" onchange="window.cmSetFilter('packageEligible',this.value)">
                <option value="">All</option><option value="yes">Yes</option><option value="no">No</option>
              </select>
            </div>
            <div class="cm-filter-group">
              <label class="cm-filter-label">Charge Trigger</label>
              <select class="cm-filter-select" onchange="window.cmSetFilter('chargeTrigger',this.value)">
                <option value="">All</option><option value="Auto">Auto</option><option value="Manual">Manual</option>
              </select>
            </div>
            <div style="font-size:11px;color:#64748B;margin-top:12px;">Showing <strong>${total}</strong> of <strong>${getItems().length}</strong> charges</div>
          </div>
        </div>
        <div class="cm-main-content">
          <div class="cm-card">
            <div class="cm-card-header">
              <div class="cm-card-title">Charge Items</div>
              <button class="btn btn-primary btn-sm" onclick="window.cmNewCharge()">+ Add Charge</button>
            </div>
            <div style="overflow-x:auto;">
              <table class="cm-table">
                <thead><tr>
                  <th><input type="checkbox" class="cm-checkbox" onchange="window.cmToggleAllRows(this.checked)"></th>
                  <th>Code</th><th>Name</th><th>Category</th><th>Dept</th>
                  <th style="text-align:right">Standard Rate</th><th>UoM</th><th>GST</th>
                  <th>Status</th><th>Approval</th><th>Modified</th><th>Actions</th>
                </tr></thead>
                <tbody>
                  ${items.map(function(i){return '<tr>'+
                    '<td><input type="checkbox" class="cm-checkbox" '+(sel.has(i.code)?'checked':'')+' onchange="window.cmToggleRow(\''+i.code+'\')"></td>'+
                    '<td class="mono" style="color:#1B3A5C;font-weight:700;">'+i.code+'</td>'+
                    '<td><div style="font-weight:600;color:#1E293B;">'+i.name+'</div><div style="font-size:11px;color:#94A3B8;">'+(i.alias||'')+'</div></td>'+
                    '<td><span style="font-size:11px;background:#EFF6FF;color:#1E40AF;padding:2px 8px;border-radius:6px;">'+i.category+'</span></td>'+
                    '<td style="font-size:11px;color:#475569;">'+(i.departments||[]).slice(0,2).join(', ')+'</td>'+
                    '<td class="amount">'+fmtINR(i.payerRates&&i.payerRates.Standard?i.payerRates.Standard.amount:0)+'</td>'+
                    '<td style="font-size:11px;color:#64748B">'+i.uom+'</td>'+
                    '<td style="font-size:11px;">'+(i.gstRate>0?'<span style="color:#D97706;font-weight:700;">'+i.gstRate+'%</span>':'<span style="color:#94A3B8">Exempt</span>')+'</td>'+
                    '<td>'+badge(i.status)+'</td>'+
                    '<td>'+badge(i.approvalStatus||'Draft')+'</td>'+
                    '<td class="mono" style="font-size:10px;color:#94A3B8;">'+(i.lastModifiedOn||'—')+'</td>'+
                    '<td><div class="cm-action-menu"><button class="btn btn-outline btn-sm" onclick="window.cmToggleAction(\''+i.code+'\')">&#x22EF;</button>'+
                    '<div class="cm-action-dropdown" data-code="'+i.code+'">'+
                    '<button class="cm-action-item" onclick="window.cmViewCharge(\''+i.code+'\')">&#x1F4B0; View / Price</button>'+
                    '<button class="cm-action-item" onclick="window.cmEditCharge(\''+i.code+'\')">&#x270F;&#xFE0F; Edit</button>'+
                    '<button class="cm-action-item" onclick="window.cmClone(\''+i.code+'\')">&#x1F4CB; Clone</button>'+
                    (i.approvalStatus==='Draft'?'<button class="cm-action-item" onclick="window.cmSubmitApproval(\''+i.code+'\')">&#x1F4E4; Submit for Approval</button>':'')+
                    ((i.approvalStatus==='Pending Review'&&i.status!=='Active')?'<button class="cm-action-item" onclick="window.cmApproveCharge(\''+i.code+'\')">&#x2705; Approve</button>':'')+
                    (i.status==='Active'?'<button class="cm-action-item danger" onclick="window.cmSuspend(\''+i.code+'\')">&#x26A0;&#xFE0F; Suspend</button>':'')+
                    (i.status==='Suspended'?'<button class="cm-action-item" onclick="window.cmLiftSuspension(\''+i.code+'\')">&#x1F513; Lift Suspension</button>':'')+
                    (i.status!=='Inactive'?'<button class="cm-action-item danger" onclick="window.cmDeactivate(\''+i.code+'\')">&#x1F6AB; Deactivate</button>':'')+
                    (i.status==='Inactive'?'<button class="cm-action-item" onclick="window.cmActivate(\''+i.code+'\')">&#x2705; Reactivate</button>':'')+
                    '</div></div></td>'+
                    '</tr>';}).join('')}
                </tbody>
              </table>
            </div>
            <div class="cm-pagination">
              <span>Showing ${(cmState.currentPage-1)*cmState.pageSize+1}–${Math.min(cmState.currentPage*cmState.pageSize,total)} of ${total}</span>
              <div style="display:flex;gap:5px;align-items:center;">
                <button class="cm-pg-btn" onclick="window.cmPage(${cmState.currentPage-1})" ${cmState.currentPage<=1?'disabled':''}>← Prev</button>
                ${Array.from({length:Math.min(totalPages,5)},function(_,i){return i+1;}).map(function(p){return '<button class="cm-pg-btn" style="'+(cmState.currentPage===p?'background:#1B3A5C;color:#fff;border-color:#1B3A5C':'')+'" onclick="window.cmPage('+p+')">'+p+'</button>';}).join('')}
                ${totalPages>5?'<span style="font-size:12px;color:#94A3B8">... '+totalPages+'</span>':''}
                <button class="cm-pg-btn" onclick="window.cmPage(${cmState.currentPage+1})" ${cmState.currentPage>=totalPages?'disabled':''}>Next →</button>
              </div>
              <span style="font-size:11px;color:#94A3B8;">Page ${cmState.currentPage} of ${totalPages}</span>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function renderForm(el) {
    var item=cmState.editingChargeCode?getItems().find(function(i){return i.code===cmState.editingChargeCode;}):null;
    function v(field,def){return item?(item[field]!==undefined?item[field]:def):(def===undefined?'':def);}
    var rate=item&&item.payerRates&&item.payerRates.Standard?item.payerRates.Standard.amount:'';
    el.innerHTML = `
      <div class="cm-card">
        <div class="cm-card-header">
          <div class="cm-card-title">${item?'&#x270F;&#xFE0F; Edit Charge — '+item.code:'&#x2795; Create New Charge'}</div>
          <button class="btn btn-outline btn-sm" onclick="window.cmSwitchTab('list')">← Back to List</button>
        </div>
        <div style="padding:24px;">
          <div class="cm-form-section">
            <div class="cm-form-section-title">&#x1F516; Section A — Identity</div>
            <div class="cm-form-grid">
              <div class="cm-field"><label class="cm-label">Charge Code <span style="color:#EF4444">*</span></label><input class="cm-input" id="cm-form-code" value="${v('code')}" placeholder="e.g. LAB001" ${item&&item.billingUseCount>0?'readonly style="background:#F8FAFC;color:#94A3B8"':''}></div>
              <div class="cm-field"><label class="cm-label">Charge Name <span style="color:#EF4444">*</span></label><input class="cm-input" id="cm-form-name" value="${v('name')}" placeholder="Full charge name"></div>
              <div class="cm-field"><label class="cm-label">Short Name / Alias</label><input class="cm-input" id="cm-form-alias" value="${v('alias')}" placeholder="Printed on bills"></div>
              <div class="cm-field"><label class="cm-label">Category <span style="color:#EF4444">*</span></label><select class="cm-input" id="cm-form-category">${CATEGORIES.map(function(c){return '<option '+(v('category')===c?'selected':'')+'>'+c+'</option>';}).join('')}</select></div>
              <div class="cm-field"><label class="cm-label">Sub-Category</label><input class="cm-input" id="cm-form-subcat" value="${v('subCategory')}" placeholder="e.g. Cardiac Procedures"></div>
              <div class="cm-field"><label class="cm-label">Primary Department <span style="color:#EF4444">*</span></label><select class="cm-input" id="cm-form-dept">${DEPARTMENTS.map(function(d){return '<option>'+d+'</option>';}).join('')}</select></div>
            </div>
            <div class="cm-field" style="margin-top:14px;"><label class="cm-label">Description</label><textarea class="cm-input" rows="2" id="cm-form-desc" placeholder="Internal notes — not printed on bill">${v('description')}</textarea></div>
          </div>
          <div class="cm-form-section">
            <div class="cm-form-section-title">&#x1F5C2;&#xFE0F; Section B — Standard Code Mapping</div>
            <div class="cm-form-grid">
              <div class="cm-field"><label class="cm-label">ICD-10 Code</label><input class="cm-input" value="${v('icd10Code')}" placeholder="e.g. J18.9"></div>
              <div class="cm-field"><label class="cm-label">Procedure Code (CPT/ICD-PCS)</label><input class="cm-input" value="${v('procedureCode')}" placeholder="e.g. 0BH17EZ"></div>
              <div class="cm-field"><label class="cm-label">LOINC Code (Lab)</label><input class="cm-input" value="${v('loincCode')}" placeholder="e.g. 2345-7"></div>
              <div class="cm-field"><label class="cm-label">PMJAY Package Code</label><input class="cm-input" value="${v('pmjayPackageCode')}" placeholder="e.g. HBP0001"></div>
              <div class="cm-field"><label class="cm-label">CGHS Package Code</label><input class="cm-input" value="${v('cghsPackageCode')}" placeholder="e.g. CGHS-CARD-001"></div>
              <div class="cm-field"><label class="cm-label">HSN Code (Goods)</label><input class="cm-input" id="cm-form-hsn" value="${v('hsnCode')}" placeholder="e.g. 30049099"></div>
              <div class="cm-field"><label class="cm-label">SAC Code (Services)</label><input class="cm-input" id="cm-form-sac" value="${v('sacCode')}" placeholder="e.g. 999311"></div>
            </div>
          </div>
          <div class="cm-form-section">
            <div class="cm-form-section-title">&#x1F4B0; Section C — Standard Rate (MRP)</div>
            <div class="cm-form-grid">
              <div class="cm-field"><label class="cm-label">Standard Rate (&#x20B9;) <span style="color:#EF4444">*</span></label><input class="cm-input" id="cm-form-rate" type="number" min="0" step="0.01" value="${rate}" placeholder="0.00"></div>
              <div class="cm-field"><label class="cm-label">Effective From</label><input class="cm-input" type="date" value="${new Date().toISOString().slice(0,10)}"></div>
            </div>
            <div class="cm-alert cm-alert-blue" style="margin-top:12px;"><span>&#x2139;&#xFE0F;</span><span>Payer-specific rates (CGHS, TPA, PMJAY) are configured in the <strong>Price Management</strong> screen after saving.</span></div>
          </div>
          <div class="cm-form-section">
            <div class="cm-form-section-title">&#x1F468;&#x200D;&#x2695;&#xFE0F; Section D — Doctor-Grade Pricing</div>
            <table class="cm-table">
              <thead><tr><th>Grade</th><th style="text-align:right">Rate (&#x20B9;)</th><th>Notes</th></tr></thead>
              <tbody>${DOCTOR_GRADES.map(function(g){return '<tr><td>'+g+'</td><td><input class="cm-input" type="number" min="0" style="width:120px;text-align:right;" value="'+(v('doctorGradePrices',{})[g]||'')+'" placeholder="—"></td><td style="font-size:11px;color:#94A3B8;">Applied on top of payer rate</td></tr>';}).join('')}</tbody>
            </table>
          </div>
          <div class="cm-form-section">
            <div class="cm-form-section-title">&#x1F4CF; Section E — Unit of Measure &amp; Billing Frequency</div>
            <div class="cm-form-grid">
              <div class="cm-field"><label class="cm-label">Unit of Measure</label><select class="cm-input" id="cm-form-uom">${UOM_OPTIONS.map(function(u){return '<option '+(v('uom')===u?'selected':'')+'>'+u+'</option>';}).join('')}</select></div>
              <div class="cm-field"><label class="cm-label">Billing Frequency</label><select class="cm-input"><option ${v('billingFrequency')==='One-time'?'selected':''}>One-time</option><option ${v('billingFrequency')==='Recurring'?'selected':''}>Recurring</option></select></div>
              <div class="cm-field"><label class="cm-label">Day Count Rule</label><select class="cm-input"><option>Admission Day Only</option><option>Discharge Day Only</option><option>Both Days</option><option>Neither</option></select></div>
              <div class="cm-field"><label class="cm-label">Proration</label><select class="cm-input"><option value="no">No</option><option value="yes">Yes (hourly = daily ÷ 24)</option></select></div>
            </div>
          </div>
          <div class="cm-form-section">
            <div class="cm-form-section-title">&#x1F9FE; Section F — Tax Configuration</div>
            <div class="cm-form-grid">
              <div class="cm-field"><label class="cm-label">Tax Treatment</label><select class="cm-input" id="cm-form-tax"><option ${v('taxTreatment')==='Exempt'?'selected':''}>Exempt</option><option ${v('taxTreatment')==='GST Applicable'?'selected':''}>GST Applicable</option><option ${v('taxTreatment')==='Zero-Rated'?'selected':''}>Zero-Rated</option></select></div>
              <div class="cm-field"><label class="cm-label">GST Rate (%)</label><select class="cm-input" id="cm-form-gstrate"><option value="0" ${v('gstRate')===0?'selected':''}>0%</option><option value="5" ${v('gstRate')===5?'selected':''}>5%</option><option value="12" ${v('gstRate')===12?'selected':''}>12%</option><option value="18" ${v('gstRate')===18?'selected':''}>18%</option></select></div>
              <div class="cm-field"><label class="cm-label">Tax Inclusive in Rate</label><select class="cm-input"><option value="no">No (GST added on top)</option><option value="yes">Yes (rate is tax-inclusive)</option></select></div>
              <div class="cm-field"><label class="cm-label">GST Exempt Reason</label><select class="cm-input"><option>Healthcare service</option><option>Blood product</option><option>Ambulance</option><option>Other</option></select></div>
            </div>
          </div>
          <div class="cm-form-section">
            <div class="cm-form-section-title">&#x2699;&#xFE0F; Section G — Billing Rules</div>
            <div class="cm-form-grid">
              <div class="cm-field"><label class="cm-label">Visit Types</label><div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:4px;">${['OPD','IPD','Emergency','Day Care','Clinic'].map(function(t){return '<label style="display:flex;align-items:center;gap:4px;font-size:12px;"><input type="checkbox" '+((v('visitTypes',['OPD'])).includes(t)?'checked':'')+'>'+t+'</label>';}).join('')}</div></div>
              <div class="cm-field"><label class="cm-label">Insurance Billable</label><select class="cm-input"><option ${v('insuranceBillable')!==false?'selected':''} value="yes">Yes</option><option ${v('insuranceBillable')===false?'selected':''} value="no">No</option></select></div>
              <div class="cm-field"><label class="cm-label">Package Eligible</label><select class="cm-input"><option ${v('packageEligible')!==false?'selected':''} value="yes">Yes</option><option ${v('packageEligible')===false?'selected':''} value="no">No</option></select></div>
              <div class="cm-field"><label class="cm-label">Discount Allowed</label><select class="cm-input"><option value="no" ${!v('discountAllowed')?'selected':''}>No</option><option value="yes" ${v('discountAllowed')?'selected':''}>Yes</option></select></div>
              <div class="cm-field"><label class="cm-label">Max Discount %</label><input class="cm-input" type="number" min="0" max="100" value="${v('maxDiscount',0)}"></div>
              <div class="cm-field"><label class="cm-label">Compliance Flag</label><select class="cm-input">${COMPLIANCE_FLAGS.map(function(f2){return '<option '+(v('complianceFlag')===f2?'selected':'')+'>'+f2+'</option>';}).join('')}</select></div>
              <div class="cm-field"><label class="cm-label">Charge Trigger</label><select class="cm-input"><option ${v('chargeTrigger')==='Manual'?'selected':''}>Manual</option><option ${v('chargeTrigger')==='Auto'?'selected':''}>Auto</option></select></div>
              <div class="cm-field"><label class="cm-label">Auto-Trigger Event</label><select class="cm-input"><option value="">—</option>${AUTO_TRIGGER_EVENTS.map(function(e){return '<option '+(v('autoTriggerEvent')===e?'selected':'')+'>'+e+'</option>';}).join('')}</select></div>
              <div class="cm-field"><label class="cm-label">Require Clinical Justification</label><select class="cm-input"><option value="no" ${!v('requireClinicalJustification')?'selected':''}>No</option><option value="yes" ${v('requireClinicalJustification')?'selected':''}>Yes</option></select></div>
            </div>
          </div>
          <div style="display:flex;gap:12px;flex-wrap:wrap;padding-top:8px;border-top:1px solid #E2E8F0;">
            <button class="btn btn-primary" onclick="window.cmSaveCharge()">&#x1F4BE; Save as Draft</button>
            <button class="btn btn-accent" onclick="window.cmSaveCharge()">&#x1F4E4; Save &amp; Submit for Approval</button>
            <button class="btn btn-outline" onclick="window.cmSwitchTab('list')">Cancel</button>
            ${item?'<span style="font-size:11px;color:#94A3B8;align-self:center;">Billed '+item.billingUseCount+' times &nbsp;&middot;&nbsp; Created '+item.createdOn+'</span>':''}
          </div>
        </div>
      </div>
    `;
  }

  function renderPriceDetail(el) {
    var code=cmState.viewingChargeCode;
    var item=code?getItems().find(function(i){return i.code===code;}):null;
    if(!item){el.innerHTML='<div class="cm-alert cm-alert-amber">Select a charge from the list to view pricing.</div>'; return;}
    el.innerHTML = `
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:20px;">
        <button class="btn btn-outline btn-sm" onclick="window.cmSwitchTab('list')">← Back</button>
        <div>
          <h2 style="font-size:18px;font-weight:800;color:#1B3A5C;font-family:'Outfit',sans-serif;">${item.name}</h2>
          <div style="font-size:12px;color:#64748B;font-family:monospace;">${item.code} &nbsp;&middot;&nbsp; ${item.category} &nbsp;&middot;&nbsp; ${item.uom} &nbsp;&middot;&nbsp; ${badge(item.status)}</div>
        </div>
      </div>
      <div class="cm-card" style="margin-bottom:20px;">
        <div class="cm-card-header"><div class="cm-card-title">&#x1F4B0; Payer Rate Matrix</div><button class="btn btn-accent btn-sm" onclick="alert('Add/Update Rate modal: select payer, enter rate, set effective date, submit for approval.')">+ Add / Update Rate</button></div>
        <div style="padding:16px;">
          <div class="cm-payer-grid">
            ${PAYERS.map(function(p){var r=item.payerRates&&item.payerRates[p.key]; return '<div class="cm-payer-card"><div class="cm-payer-card-label">'+p.label+'</div><div class="cm-payer-card-rate">'+(r&&r.amount?fmtINR(r.amount):'<span style="font-size:14px;color:#CBD5E1">Not Set</span>')+'</div>'+(r&&r.amount?'<div style="font-size:10px;color:#94A3B8;margin-top:4px;">From '+r.effectiveFrom+' &nbsp;&middot;&nbsp; '+badge(r.rateStatus||'Active')+'</div>':'<div style="font-size:10px;color:#EF4444;margin-top:4px;">&#x26A0; Missing — defaults to Standard</div>')+'</div>';}).join('')}
          </div>
        </div>
      </div>
      ${Object.keys(item.doctorGradePrices||{}).length>0?`<div class="cm-card" style="margin-bottom:20px;"><div class="cm-card-header"><div class="cm-card-title">&#x1F468;&#x200D;&#x2695;&#xFE0F; Doctor-Grade Pricing</div></div><div style="overflow-x:auto;"><table class="cm-table"><thead><tr><th>Grade</th><th style="text-align:right">Rate</th><th>Notes</th></tr></thead><tbody>${Object.entries(item.doctorGradePrices).map(function(e){return '<tr><td>'+e[0]+'</td><td class="amount">'+fmtINR(e[1])+'</td><td style="font-size:11px;color:#94A3B8">Applied on top of payer rate</td></tr>';}).join('')}</tbody></table></div></div>`:''}
      <div class="cm-card" style="margin-bottom:20px;">
        <div class="cm-card-header"><div class="cm-card-title">&#x1F4CB; Full Charge Detail</div></div>
        <div style="padding:16px;display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:16px;">
          ${[['Alias',item.alias||'—'],['Sub-Category',item.subCategory||'—'],['Departments',(item.departments||[]).join(', ')],['UoM',item.uom],['Billing Frequency',item.billingFrequency],['Visit Types',(item.visitTypes||[]).join(', ')],['Tax Treatment',item.taxTreatment],['GST Rate',item.gstRate>0?item.gstRate+'%':'Exempt'],['HSN Code',item.hsnCode||'—'],['SAC Code',item.sacCode||'—'],['Insurance Billable',item.insuranceBillable?'Yes':'No'],['Package Eligible',item.packageEligible?'Yes':'No'],['Discount Allowed',item.discountAllowed?'Yes (max '+item.maxDiscount+'%)':'No'],['Compliance Flag',item.complianceFlag||'None'],['Charge Trigger',item.chargeTrigger+(item.autoTriggerEvent?' → '+item.autoTriggerEvent:'')],['Times Billed',item.billingUseCount],['Created By',item.createdBy+' on '+item.createdOn]].map(function(kv){return '<div><div style="font-size:11px;color:#64748B;font-weight:600;text-transform:uppercase;letter-spacing:.4px;margin-bottom:3px;">'+kv[0]+'</div><div style="font-size:13px;color:#1E293B;font-weight:500;">'+kv[1]+'</div></div>';}).join('')}
        </div>
      </div>
      <div class="cm-card">
        <div class="cm-card-header"><div class="cm-card-title">&#x1F4C8; Price History — Standard Rate</div></div>
        <div style="overflow-x:auto;"><table class="cm-table"><thead><tr><th>Version</th><th style="text-align:right">Amount</th><th>Effective From</th><th>Effective To</th><th>Approved By</th><th>Status</th></tr></thead><tbody>
          <tr><td class="mono">v1 (Current)</td><td class="amount">${fmtINR(item.payerRates&&item.payerRates.Standard?item.payerRates.Standard.amount:0)}</td><td>${item.payerRates&&item.payerRates.Standard?item.payerRates.Standard.effectiveFrom:'—'}</td><td>Open-ended</td><td>${item.payerRates&&item.payerRates.Standard?item.payerRates.Standard.approvedBy:'—'}</td><td>${badge('Active')}</td></tr>
          <tr style="opacity:.5;text-decoration:line-through;"><td class="mono">v0</td><td class="amount">${fmtINR(Math.round(((item.payerRates&&item.payerRates.Standard?item.payerRates.Standard.amount:0))*0.85))}</td><td>2024-04-01</td><td>2024-12-31</td><td>System</td><td>${badge('Superseded')}</td></tr>
        </tbody></table></div>
      </div>
    `;
  }

  function renderPackages(el) {
    var pkgs=getPackages();
    el.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;">
        <div><h2 style="font-size:18px;font-weight:700;color:#1B3A5C;font-family:'Outfit',sans-serif;">&#x1F4E6; Package Builder</h2><p style="font-size:12px;color:#64748B;">Define surgery, delivery, and procedure bundles at flat package rates</p></div>
        <button class="btn btn-accent" onclick="alert('Package Builder: header form → inclusions → exclusions → payer pricing')">+ Create Package</button>
      </div>
      ${pkgs.map(function(pkg){
        var inclCost=pkg.inclusions.reduce(function(s,i){return s+i.rate*i.qty;},0);
        var margin=pkg.packagePrices.Standard-inclCost;
        return '<div class="cm-card" style="margin-bottom:20px;">'+
          '<div class="cm-card-header"><div><div class="cm-card-title">'+pkg.name+' <span class="mono" style="font-size:11px;color:#94A3B8;">&middot; '+pkg.code+'</span></div><div style="font-size:11px;color:#64748B;margin-top:3px;">'+pkg.packageCategory+' &nbsp;&middot;&nbsp; '+pkg.duration+' days &nbsp;&middot;&nbsp; ICD: '+pkg.applicableDiagnosis+' &nbsp;&middot;&nbsp; '+badge(pkg.status)+'</div></div><div style="display:flex;gap:8px;"><button class="btn btn-outline btn-sm">&#x270F;&#xFE0F; Edit</button><button class="btn btn-outline btn-sm">&#x1F4CA; Actuals</button></div></div>'+
          '<div style="padding:16px;">'+
          '<div class="cm-payer-grid" style="margin-bottom:16px;">'+Object.entries(pkg.packagePrices).map(function(e){return '<div class="cm-payer-card"><div class="cm-payer-card-label">'+e[0]+'</div><div class="cm-payer-card-rate">'+fmtINR(e[1])+'</div></div>';}).join('')+'</div>'+
          '<div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;">'+
          '<div><div style="font-size:12px;font-weight:700;color:#10B981;margin-bottom:8px;">&#x2705; Inclusions ('+pkg.inclusions.length+')</div>'+
          '<table class="cm-table" style="font-size:11px;"><thead><tr><th>Code</th><th>Item</th><th>Qty</th><th style="text-align:right">Rate</th><th>Billable?</th></tr></thead><tbody>'+
          pkg.inclusions.map(function(inc){return '<tr><td class="mono">'+inc.code+'</td><td>'+inc.name+'</td><td style="text-align:center;">'+inc.qty+'</td><td class="amount">'+fmtINR(inc.rate)+'</td><td style="text-align:center;">'+(inc.billableToPayer?'<span style="color:#10B981;font-weight:700">Yes</span>':'<span style="color:#94A3B8">No</span>')+'</td></tr>';}).join('')+
          '</tbody></table><div style="text-align:right;font-size:12px;font-weight:700;color:#1B3A5C;margin-top:8px;">Cost Total: '+fmtINR(inclCost)+'</div></div>'+
          '<div><div style="font-size:12px;font-weight:700;color:#EF4444;margin-bottom:8px;">&#x274C; Exclusions ('+(pkg.exclusions.length||0)+')</div>'+
          (pkg.exclusions.length>0?'<table class="cm-table" style="font-size:11px;"><thead><tr><th>Code</th><th>Item</th><th>Reason</th><th>Billed To</th></tr></thead><tbody>'+pkg.exclusions.map(function(exc){return '<tr><td class="mono">'+exc.code+'</td><td>'+exc.name+'</td><td style="color:#94A3B8">'+exc.reason+'</td><td><span style="background:#FEF3C7;color:#92400E;padding:2px 6px;border-radius:4px;font-size:10px;">'+exc.billedTo+'</span></td></tr>';}).join('')+'</tbody></table>':'<div style="font-size:12px;color:#94A3B8;padding:12px;">No exclusions — all-inclusive</div>')+
          '<div style="background:#F8FAFC;border:1px solid #E2E8F0;border-radius:8px;padding:12px;margin-top:12px;"><div style="font-size:12px;font-weight:700;color:#1B3A5C;margin-bottom:6px;">&#x1F4CA; Package vs Cost</div>'+
          '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;text-align:center;">'+
          '<div><div style="font-size:11px;color:#64748B;">Package Price</div><div style="font-weight:700;color:#1B3A5C;">'+fmtINR(pkg.packagePrices.Standard)+'</div></div>'+
          '<div><div style="font-size:11px;color:#64748B;">Inclusion Cost</div><div style="font-weight:700;">'+fmtINR(inclCost)+'</div></div>'+
          '<div><div style="font-size:11px;color:#64748B;">Margin</div><div style="font-weight:700;color:'+(margin>=0?'#10B981':'#EF4444')+';">'+fmtINR(margin)+'</div></div>'+
          '</div></div></div></div></div></div>';
      }).join('')}
    `;
  }

  function renderQueue(el) {
    var queue=getQueue();
    el.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;">
        <div><h2 style="font-size:18px;font-weight:700;color:#1B3A5C;font-family:'Outfit',sans-serif;">&#x23F3; Approval Queue</h2><p style="font-size:12px;color:#64748B;">${queue.length} item(s) pending &nbsp;&middot;&nbsp; Only Charge Master Admin may approve &nbsp;&middot;&nbsp; Approver ≠ Requester</p></div>
      </div>
      ${queue.length===0?'<div style="text-align:center;padding:60px 20px;background:#fff;border-radius:12px;border:1px solid #E2E8F0;"><div style="font-size:48px;margin-bottom:12px;">&#x2705;</div><h3 style="font-size:16px;font-weight:700;color:#1B3A5C;">Queue Clear</h3><p style="color:#64748B;font-size:13px;">No charges or prices awaiting approval.</p></div>':''}
      ${queue.length>0?`<div class="cm-card"><div style="overflow-x:auto;"><table class="cm-table"><thead><tr><th>ID</th><th>Type</th><th>Charge</th><th>Dept</th><th>Requested By</th><th>Requested On</th><th>Effective</th><th>Ageing</th><th>Reason</th><th>Actions</th></tr></thead><tbody>${queue.map(function(q){return '<tr>'+
        '<td class="mono" style="color:#1B3A5C;font-weight:700;">'+q.id+'</td>'+
        '<td><span style="padding:3px 8px;border-radius:6px;font-size:11px;font-weight:600;background:'+(q.type==='New Charge'?'#DBEAFE':q.type==='Price Update'?'#FEF3C7':'#FEE2E2')+';color:'+(q.type==='New Charge'?'#1E40AF':q.type==='Price Update'?'#92400E':'#991B1B')+';">'+q.type+'</span></td>'+
        '<td><div style="font-weight:600;color:#1E293B;">'+q.chargeName+'</div><div class="mono" style="color:#94A3B8;font-size:11px;">'+q.chargeCode+'</div></td>'+
        '<td style="font-size:12px;">'+q.department+'</td>'+
        '<td><div style="font-size:12px;">'+q.requestedBy+'</div><div style="font-size:11px;color:#94A3B8;">'+q.requestedByRole+'</div></td>'+
        '<td class="mono" style="font-size:11px;">'+q.requestedOn+'</td>'+
        '<td class="mono" style="font-size:11px;color:#3B82F6;font-weight:600;">'+q.effectiveDate+'</td>'+
        '<td><span style="padding:3px 8px;border-radius:6px;font-size:11px;font-weight:700;background:'+(q.agingDays>5?'#FEE2E2':q.agingDays>2?'#FEF3C7':'#D1FAE5')+';color:'+(q.agingDays>5?'#991B1B':q.agingDays>2?'#92400E':'#065F46')+';">'+q.agingDays+'d</span></td>'+
        '<td style="font-size:11px;color:#64748B;max-width:160px;">'+q.reason+'</td>'+
        '<td><div style="display:flex;gap:6px;"><button class="btn btn-success btn-sm" onclick="window.cmApproveQueueItem(\''+q.id+'\')">&#x2705; Approve</button><button class="btn btn-outline btn-sm" style="color:#EF4444;border-color:#FECACA;" onclick="window.cmRejectQueueItem(\''+q.id+'\')">&#x274C; Reject</button></div></td>'+
        '</tr>';}).join('')}</tbody></table></div></div>`:''}
      <div class="cm-alert cm-alert-blue" style="margin-top:20px;"><span>&#x1F4CB;</span><div><strong>Rules:</strong> Only Charge Master Admin can approve &nbsp;&middot;&nbsp; Cannot approve own requests &nbsp;&middot;&nbsp; Approved on Effective Date (not approval date) &nbsp;&middot;&nbsp; Rejection requires reason</div></div>
    `;
  }

  function renderImportExport(el) {
    el.innerHTML = `
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;">
        <div class="cm-card">
          <div class="cm-card-header"><div class="cm-card-title">&#x1F4E5; Import Charges</div></div>
          <div style="padding:20px;">
            <div class="cm-alert cm-alert-blue" style="margin-bottom:14px;"><span>&#x2139;&#xFE0F;</span><div>Accepted formats: <strong>Excel (.xlsx)</strong> or <strong>CSV</strong><br>Mandatory: Charge Code, Name, Category, Department, Standard Rate, UoM, Active Status, Effective From<br>Optional: all other fields</div></div>
            <div style="border:2px dashed #CBD5E1;border-radius:12px;padding:40px;text-align:center;cursor:pointer;background:#F8FAFC;transition:all .15s;" onclick="window.cmSimulateImport()" onmouseover="this.style.borderColor='#1B3A5C'" onmouseout="this.style.borderColor='#CBD5E1'">
              <div style="font-size:40px;margin-bottom:10px;">&#x1F4C2;</div>
              <div style="font-weight:700;color:#1B3A5C;margin-bottom:4px;">Click to Upload File</div>
              <div style="font-size:12px;color:#94A3B8;">charges_import.xlsx or .csv</div>
            </div>
            <ol style="font-size:12px;color:#64748B;padding-left:16px;line-height:1.8;margin-top:16px;">
              <li>Validate all mandatory fields</li>
              <li>Check for duplicate charge codes</li>
              <li>Check for duplicate Name+Category combinations</li>
              <li>Check for invalid categories and departments</li>
              <li>Show validation report (errors by row number)</li>
              <li>User selects: import valid rows / fix / cancel</li>
              <li>Valid rows enter Draft state — require approval</li>
            </ol>
            <button class="btn btn-primary" style="margin-top:14px;width:100%;" onclick="window.cmSimulateImport()">&#x1F4E5; Simulate Import (Demo)</button>
          </div>
        </div>
        <div class="cm-card">
          <div class="cm-card-header"><div class="cm-card-title">&#x1F4E4; Export Charge Master</div></div>
          <div style="padding:20px;">
            <div class="cm-form-section">
              <div class="cm-form-section-title">Export Options</div>
              <div style="display:flex;flex-direction:column;gap:12px;">
                <div class="cm-field"><label class="cm-label">Data Scope</label><select class="cm-input"><option>Active Charges Only</option><option>All Charges (inc. Inactive)</option><option>Current Filtered View (${filteredItems().length} charges)</option><option>Pending Approval Queue</option></select></div>
                <div class="cm-field"><label class="cm-label">Category</label><select class="cm-input"><option>All Categories</option>${CATEGORIES.map(function(c){return '<option>'+c+'</option>';}).join('')}</select></div>
                <div class="cm-field"><label class="cm-label">Include Sheets</label><div style="display:flex;flex-direction:column;gap:6px;">${[['Charge Master (all fields)',true],['Payer Rate Matrix',true],['Price History',false],['Package Definitions',false],['Audit Log (last 90 days)',false]].map(function(s){return '<label style="display:flex;align-items:center;gap:8px;font-size:12px;"><input type="checkbox" '+(s[1]?'checked':'')+'>'+s[0]+'</label>';}).join('')}</div></div>
              </div>
            </div>
            <button class="btn btn-primary" style="margin-top:12px;width:100%;" onclick="window.cmSimulateExport()">&#x1F4E4; Export to Excel</button>
            <div style="font-size:11px;color:#94A3B8;margin-top:8px;text-align:center;">All exports logged in Audit Log</div>
          </div>
        </div>
      </div>
      <div class="cm-card" style="margin-top:20px;">
        <div class="cm-card-header"><div class="cm-card-title">&#x2699;&#xFE0F; Bulk Operations</div></div>
        <div style="padding:20px;">
          <div class="cm-alert cm-alert-amber" style="margin-bottom:16px;"><span>&#x26A0;&#xFE0F;</span><div>Select charges from the <strong>Charge List</strong> tab first. Currently <strong>${cmState.selectedRows.size} charges</strong> selected.</div></div>
          <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(190px,1fr));gap:12px;">
            ${[{op:'activate',label:'&#x2705; Bulk Activate',desc:'Activate all selected Approved charges',color:'btn-success'},{op:'deactivate',label:'&#x1F6AB; Bulk Deactivate',desc:'Deactivate with reason',color:'btn-danger'},{op:'price',label:'&#x1F4B0; Bulk Price Update',desc:'Flat / percentage / replace',color:'btn-accent'}].map(function(b){return '<div style="background:#F8FAFC;border:1px solid #E2E8F0;border-radius:10px;padding:16px;"><div style="font-weight:700;font-size:13px;margin-bottom:4px;">'+b.label+'</div><div style="font-size:11px;color:#64748B;margin-bottom:12px;">'+b.desc+'</div><button class="btn '+b.color+' btn-sm" onclick="window.cmBulkAction(\''+b.op+'\')">'+b.label+'</button></div>';}).join('')}
          </div>
        </div>
      </div>
    `;
  }

  function renderAudit(el) {
    var log=getAuditLog();
    el.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;flex-wrap:wrap;gap:10px;">
        <div><h2 style="font-size:18px;font-weight:700;color:#1B3A5C;font-family:'Outfit',sans-serif;">&#x1F4DC; Audit History</h2><p style="font-size:12px;color:#64748B;">Immutable, append-only log. No record may be deleted or modified by any role.</p></div>
        <div style="display:flex;gap:8px;flex-wrap:wrap;">
          <input class="cm-search-input" style="width:200px;" placeholder="Search...">
          <select class="cm-select"><option>All Actions</option><option>Price Updated</option><option>Charge Approved</option><option>Charge Created</option><option>Charge Suspended</option><option>Import Executed</option><option>Export Executed</option></select>
          <button class="btn btn-outline btn-sm" onclick="alert('Export audit log...')">&#x1F4E4; Export Log</button>
        </div>
      </div>
      <div class="cm-card">
        <div style="overflow-x:auto;">
          <table class="cm-table">
            <thead><tr><th>ID</th><th>Timestamp</th><th>User</th><th>Action</th><th>Charge</th><th>Field</th><th>Prev</th><th>New</th><th>Reason</th><th>IP</th></tr></thead>
            <tbody>
              ${log.map(function(l){return '<tr>'+
                '<td class="mono" style="color:#64748B;font-size:10px;">'+l.id+'</td>'+
                '<td class="mono" style="font-size:10px;white-space:nowrap;">'+fmtDate(l.ts)+'</td>'+
                '<td><div style="font-size:12px;font-weight:600;">'+l.user+'</div><div style="font-size:10px;color:#94A3B8;">'+l.role+'</div></td>'+
                '<td style="font-size:11px;">'+badge(l.action.includes('Suspend')?'Suspended':l.action.includes('Approv')?'Approved':l.action.includes('Reject')?'Rejected':l.action.includes('Creat')?'Draft':l.action.includes('Activ')?'Active':'Pending Review')+' <span style="color:#334155;">'+l.action+'</span></td>'+
                '<td class="mono" style="font-size:10px;">'+(l.chargeCode||'—')+'<br><span style="color:#94A3B8;font-size:10px;">'+(l.chargeName||'').slice(0,20)+'</span></td>'+
                '<td style="font-size:11px;color:#64748B;">'+(l.field||'—')+'</td>'+
                '<td style="font-size:11px;color:#EF4444;font-family:monospace;max-width:80px;overflow:hidden;text-overflow:ellipsis;">'+(l.prev||'—')+'</td>'+
                '<td style="font-size:11px;color:#10B981;font-family:monospace;max-width:80px;overflow:hidden;text-overflow:ellipsis;">'+(l.next||'—')+'</td>'+
                '<td style="font-size:11px;color:#64748B;max-width:140px;">'+(l.reason||'—')+'</td>'+
                '<td class="mono" style="font-size:10px;color:#94A3B8;">'+(l.ip||'—')+'</td>'+
                '</tr>';}).join('')}
            </tbody>
          </table>
        </div>
        <div class="cm-pagination"><span style="font-size:11px;color:#94A3B8;">&#x1F512; Audit log is immutable. Showing last ${log.length} entries.</span></div>
      </div>
    `;
  }

  function renderReports(el) {
    var items=getItems(); var activeItems=items.filter(function(i){return i.status==='Active';});
    var reportTabs=[{id:'operational',label:'&#x1F4CB; Operational'},{id:'pricing',label:'&#x1F4B0; Pricing'},{id:'packages',label:'&#x1F4E6; Packages'},{id:'financial',label:'&#x1F4B9; Financial'},{id:'audit_rpt',label:'&#x1F4DC; Audit Reports'}];
    var rt=cmState.activeReportTab; var content='';
    if (rt==='operational') {
      var missingHSN=items.filter(function(i){return i.taxTreatment==='GST Applicable'&&!i.hsnCode&&!i.sacCode;});
      var missingPayer=activeItems.filter(function(i){return !(i.payerRates&&i.payerRates.CGHS&&i.payerRates.CGHS.amount);});
      var pending=getQueue();
      content = '<div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;">'+
        '<div class="cm-card"><div class="cm-card-header"><div class="cm-card-title">&#x26A0;&#xFE0F; Missing HSN/SAC ('+missingHSN.length+')</div></div><div style="overflow-x:auto;"><table class="cm-table"><thead><tr><th>Code</th><th>Name</th><th>GST Rate</th></tr></thead><tbody>'+missingHSN.slice(0,10).map(function(i){return '<tr><td class="mono">'+i.code+'</td><td>'+i.name+'</td><td style="color:#D97706;font-weight:700;">'+i.gstRate+'%</td></tr>';}).join('')+(missingHSN.length===0?'<tr><td colspan="3" style="text-align:center;color:#10B981;padding:20px;">&#x2705; All GST charges have HSN/SAC</td></tr>':'')+'</tbody></table></div></div>'+
        '<div class="cm-card"><div class="cm-card-header"><div class="cm-card-title">&#x1F534; Missing CGHS Rate ('+missingPayer.length+')</div></div><div style="overflow-x:auto;"><table class="cm-table"><thead><tr><th>Code</th><th>Name</th><th>Standard Rate</th></tr></thead><tbody>'+missingPayer.slice(0,10).map(function(i){return '<tr><td class="mono">'+i.code+'</td><td>'+i.name+'</td><td class="amount">'+fmtINR(i.payerRates&&i.payerRates.Standard?i.payerRates.Standard.amount:0)+'</td></tr>';}).join('')+(missingPayer.length===0?'<tr><td colspan="3" style="text-align:center;color:#10B981;padding:20px;">&#x2705; All charges have CGHS rate</td></tr>':'')+'</tbody></table></div></div>'+
        '<div class="cm-card"><div class="cm-card-header"><div class="cm-card-title">&#x23F3; Approval Queue Ageing</div></div><div style="overflow-x:auto;"><table class="cm-table"><thead><tr><th>ID</th><th>Type</th><th>Item</th><th>Requested By</th><th>Ageing</th></tr></thead><tbody>'+pending.map(function(q){return '<tr><td class="mono">'+q.id+'</td><td style="font-size:11px;">'+q.type+'</td><td>'+q.chargeName+'</td><td>'+q.requestedBy+'</td><td><span style="font-weight:700;color:'+(q.agingDays>5?'#EF4444':q.agingDays>2?'#F59E0B':'#10B981')+';">'+q.agingDays+' days</span></td></tr>';}).join('')+(pending.length===0?'<tr><td colspan="5" style="text-align:center;color:#10B981;padding:20px;">&#x2705; Queue clear</td></tr>':'')+'</tbody></table></div></div>'+
        '<div class="cm-card"><div class="cm-card-header"><div class="cm-card-title">&#x1F4CA; Status Summary</div></div><div style="padding:16px;">'+[['Active',items.filter(function(i){return i.status==='Active';}).length,'#10B981'],['Inactive',items.filter(function(i){return i.status==='Inactive';}).length,'#64748B'],['Suspended',items.filter(function(i){return i.status==='Suspended';}).length,'#EF4444'],['Draft',items.filter(function(i){return i.status==='Draft';}).length,'#94A3B8']].map(function(a){return '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;"><span style="font-size:13px;">'+a[0]+'</span><div style="display:flex;align-items:center;gap:10px;"><div style="background:#F1F5F9;border-radius:4px;height:8px;width:100px;overflow:hidden;"><div style="background:'+a[2]+';width:'+Math.round(a[1]/items.length*100)+'%;height:100%;border-radius:4px;"></div></div><span style="font-weight:700;color:'+a[2]+';font-size:14px;min-width:30px;text-align:right;">'+a[1]+'</span></div></div>';}).join('')+'</div></div>'+
        '</div>';
    } else if (rt==='pricing') {
      var sample=activeItems.filter(function(i){return i.payerRates&&i.payerRates.Standard&&i.payerRates.Standard.amount>0;}).slice(0,15);
      content = '<div class="cm-card"><div class="cm-card-header"><div class="cm-card-title">&#x1F4B1; Payer Rate Comparison</div></div><div style="overflow-x:auto;"><table class="cm-table"><thead><tr><th>Code</th><th>Name</th><th>Category</th><th style="text-align:right">Standard</th><th style="text-align:right">CGHS</th><th style="text-align:right">TPA</th><th style="text-align:right">PMJAY</th><th style="text-align:right">CGHS Disc%</th></tr></thead><tbody>'+sample.map(function(i){var std=i.payerRates.Standard.amount; var cghs=i.payerRates.CGHS?i.payerRates.CGHS.amount:0; var tpa=i.payerRates.TPA?i.payerRates.TPA.amount:0; var pmjay=i.payerRates.PMJAY?i.payerRates.PMJAY.amount:0; var disc=std>0?Math.round((std-cghs)/std*100):0; return '<tr><td class="mono" style="color:#1B3A5C;">'+i.code+'</td><td style="font-size:12px;">'+i.name.slice(0,35)+'</td><td style="font-size:11px;">'+i.category+'</td><td class="amount">'+fmtINR(std)+'</td><td class="amount">'+(cghs?fmtINR(cghs):'<span style="color:#94A3B8">—</span>')+'</td><td class="amount">'+(tpa?fmtINR(tpa):'<span style="color:#94A3B8">—</span>')+'</td><td class="amount">'+(pmjay?fmtINR(pmjay):'<span style="color:#94A3B8">—</span>')+'</td><td style="text-align:right;color:#10B981;font-weight:700;">'+(cghs&&std?disc+'%':'—')+'</td></tr>';}).join('')+'</tbody></table></div></div>';
    } else if (rt==='packages') {
      var pkgs=getPackages();
      content = '<div class="cm-card"><div class="cm-card-header"><div class="cm-card-title">&#x1F4E6; Package Profitability</div></div><div style="overflow-x:auto;"><table class="cm-table"><thead><tr><th>Code</th><th>Name</th><th>Type</th><th style="text-align:right">Pkg Price</th><th style="text-align:right">Incl Cost</th><th style="text-align:right">Margin</th><th style="text-align:right">Margin%</th></tr></thead><tbody>'+pkgs.map(function(p){var price=p.packagePrices.Standard||0; var cost=p.inclusions.reduce(function(s,i){return s+i.rate*i.qty;},0); var m=price-cost; var mpct=price>0?Math.round(m/price*100):0; return '<tr><td class="mono">'+p.code+'</td><td style="font-weight:600;">'+p.name+'</td><td>'+p.packageCategory+'</td><td class="amount">'+fmtINR(price)+'</td><td class="amount">'+fmtINR(cost)+'</td><td class="amount" style="color:'+(m>=0?'#10B981':'#EF4444')+';font-weight:700;">'+fmtINR(m)+'</td><td style="text-align:right;font-weight:700;color:'+(mpct>=20?'#10B981':mpct>=10?'#F59E0B':'#EF4444')+';">'+mpct+'%</td></tr>';}).join('')+'</tbody></table></div></div>';
    } else if (rt==='financial') {
      var cats2=[...new Set(activeItems.map(function(i){return i.category;}))];
      content = '<div class="cm-card"><div class="cm-card-header"><div class="cm-card-title">&#x1F4B9; Revenue by Category (Simulated)</div></div><div style="overflow-x:auto;"><table class="cm-table"><thead><tr><th>Category</th><th>Active</th><th style="text-align:right">Avg Rate</th><th style="text-align:right">Simulated Revenue</th></tr></thead><tbody>'+cats2.map(function(cat){var its=activeItems.filter(function(i){return i.category===cat;}); var avg=its.reduce(function(s,i){return s+(i.payerRates&&i.payerRates.Standard?i.payerRates.Standard.amount:0);},0)/its.length; var rev=Math.round(avg*its.length*(Math.random()*200+50)); return '<tr><td>'+cat+'</td><td style="text-align:center;">'+its.length+'</td><td class="amount">'+fmtINR(avg)+'</td><td class="amount" style="font-weight:700;color:#1B3A5C;">'+fmtINR(rev)+'</td></tr>';}).join('')+'</tbody></table></div></div>';
    } else if (rt==='audit_rpt') {
      var log2=getAuditLog(); var byAction={}; log2.forEach(function(l){byAction[l.action]=(byAction[l.action]||0)+1;}); var byUser={}; log2.forEach(function(l){byUser[l.user]=(byUser[l.user]||0)+1;});
      content = '<div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;">'+
        '<div class="cm-card"><div class="cm-card-header"><div class="cm-card-title">&#x1F4C8; Actions by Type</div></div><div style="padding:16px;">'+Object.entries(byAction).map(function(e){return '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;"><span style="font-size:12px;">'+e[0]+'</span><span style="background:#DBEAFE;color:#1E40AF;padding:2px 10px;border-radius:999px;font-weight:700;font-size:12px;">'+e[1]+'</span></div>';}).join('')+'</div></div>'+
        '<div class="cm-card"><div class="cm-card-header"><div class="cm-card-title">&#x1F465; Activity by User</div></div><div style="padding:16px;">'+Object.entries(byUser).map(function(e){return '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;"><span style="font-size:12px;">'+e[0]+'</span><span style="background:#D1FAE5;color:#065F46;padding:2px 10px;border-radius:999px;font-weight:700;font-size:12px;">'+e[1]+'</span></div>';}).join('')+'</div></div>'+
        '</div>';
    }
    el.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;flex-wrap:wrap;gap:10px;">
        <div><h2 style="font-size:18px;font-weight:700;color:#1B3A5C;font-family:'Outfit',sans-serif;">&#x1F4CA; Charge Master Reports</h2></div>
        <button class="btn btn-outline btn-sm" onclick="window.cmSimulateExport()">&#x1F4E4; Export</button>
      </div>
      <div class="cm-report-tabs">${reportTabs.map(function(t){return '<button class="cm-report-tab '+(cmState.activeReportTab===t.id?'active':'')+'" onclick="window.cmSetReportTab(\''+t.id+'\')">'+t.label+'</button>';}).join('')}</div>
      ${content}
    `;
  }

})(); // END IIFE
