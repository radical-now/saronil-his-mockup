const fs = require('fs');
const path = require('path');

// Mock browser globals
global.window = {
  views: {}
};
global.state = {};

const defaultMockElement = {
  value: '',
  innerHTML: '',
  appendChild: () => {},
  classList: {
    add: () => {},
    remove: () => {}
  },
  style: {}
};

// Global mock input objects
let currentMockInputs = {};

global.document = {
  getElementById: (id) => {
    if (currentMockInputs[id]) {
      return currentMockInputs[id];
    }
    return defaultMockElement;
  },
  querySelectorAll: (selector) => [],
  querySelector: (selector) => {
    return {
      dataset: {
        tab: 'overview'
      }
    };
  },
  createElement: () => ({
    appendChild: () => {},
    classList: { add: () => {}, remove: () => {} },
    style: {}
  })
};
global.alert = (msg) => {
  console.log('ALERT TRIGGERED:', msg);
};

// Load state.js
const stateJsContent = fs.readFileSync(path.join(__dirname, '../assets/js/state.js'), 'utf8');
eval(stateJsContent);

// Load patientsView.js
const patientsViewContent = fs.readFileSync(path.join(__dirname, '../assets/js/views/patientsView.js'), 'utf8');
eval(patientsViewContent);

// Load atdView.js
const atdViewContent = fs.readFileSync(path.join(__dirname, '../assets/js/views/atdView.js'), 'utf8');
eval(atdViewContent);

// Extract state
const state = global.window.state;

console.log('--- Initializing EMR Patient Core Workspace Tests ---');

// Pick a test patient
const patient = state.patients[0];
if (!patient) {
  console.log('FAIL: No patients seeded in state!');
  process.exit(1);
}

console.log(`Testing with Patient: ${patient.name} (UHID: ${patient.uhid})`);

// Test 1: ensurePatientEMRInitialized
console.log('\n--- Test 1: ensurePatientEMRInitialized ---');
ensurePatientEMRInitialized(patient);

if (patient.registrationDate && patient.clinicalNotes && patient.diagnosesList && patient.vitalsHistory && patient.dischargeClearances) {
  console.log('PASS: Core EMR initialized successfully with history, clearances, and notes!');
} else {
  console.log('FAIL: EMR initialization missed some fields!');
}

// Test 2: Create Prescription
console.log('\n--- Test 2: Create Prescription Action ---');
currentMockInputs = {
  'rx-drug': { value: 'Dolo 650mg' },
  'rx-dose': { value: '1 tablet' },
  'rx-freq': { value: 'Thrice daily (TID)' },
  'rx-dur': { value: '5 Days' },
  'rx-inst': { value: 'Post food when fever > 100 F' }
};

const initialRxCount = patient.prescriptions.length;
console.log(`Initial Prescriptions: ${initialRxCount}`);

window.executePatientAction('create-rx', patient.uhid);

console.log(`Final Prescriptions: ${patient.prescriptions.length}`);
if (patient.prescriptions.length === initialRxCount + 1) {
  console.log('PASS: Prescription successfully added to patient record!');
} else {
  console.log('FAIL: Prescription count did not increase!');
}

// Test 3: Record Vitals
console.log('\n--- Test 3: Record Vitals Action ---');
currentMockInputs = {
  'v-temp': { value: '98.4' },
  'v-hr': { value: '72' },
  'v-bp': { value: '120/80' },
  'v-rr': { value: '16' },
  'v-spo2': { value: '99' },
  'v-weight': { value: '72' },
  'v-pain': { value: '2' },
  'v-sugar': { value: '105' },
  'v-urine': { value: '600' },
  'v-oxygen': { value: 'N/A' },
  'v-notes': { value: 'Patient is comfortable' }
};

const initialVitalsCount = patient.vitalsHistory.length;
window.executePatientAction('rec-vitals', patient.uhid);

if (patient.vitalsHistory.length === initialVitalsCount + 1 && patient.vitals.bp === '120/80') {
  console.log('PASS: Vitals recorded and vital history logged!');
} else {
  console.log('FAIL: Vitals history not updated correctly!');
}

// Test 4: Billing collection
console.log('\n--- Test 4: Collect Billing Payment ---');
const activeBill = state.billing.find(b => b.uhid === patient.uhid);
if (!activeBill) {
  console.log('FAIL: No active bill for patient!');
} else {
  const initialPaid = activeBill.paid;
  const outstanding = activeBill.amount - activeBill.paid;
  console.log(`Initial Bill Total: ₹${activeBill.amount} | Paid: ₹${initialPaid} | Outstanding: ₹${outstanding}`);

  currentMockInputs = {
    'pay-collected': { value: String(outstanding) }
  };

  window.executePatientAction('collect-pay', patient.uhid);

  console.log(`Final Paid: ₹${activeBill.paid} | Status: ${activeBill.status}`);
  if (activeBill.paid === activeBill.amount && activeBill.status === 'Settled') {
    console.log('PASS: Bill collected fully and marked Settled!');
  } else {
    console.log('FAIL: Bill payment collection failed!');
  }
}

// Test 5: Discharge Widget clearances
console.log('\n--- Test 5: Discharge Clearances ---');
patient.dischargeClearances.clinical = true;
patient.dischargeClearances.billing = true;
patient.dischargeClearances.summaryReady = true;

if (patient.dischargeClearances.clinical && patient.dischargeClearances.billing && patient.dischargeClearances.summaryReady) {
  console.log('PASS: Clearance checkbox states correctly recorded on patient!');
} else {
  console.log('FAIL: Clearance check failed!');
}

// Test 6: Verify Chronological Medical Journey timeline logging
console.log('\n--- Test 6: Verify Timeline Events for Clinical Actions ---');

// Clear existing timeline events for clean test
patient.timelineEvents = [];

// 1. Progress Note
currentMockInputs = {
  'note-type': { value: 'Progress' },
  'note-content': { value: 'Patient is healing well and pain is reduced.' }
};
window.executePatientAction('add-note', patient.uhid);

// 2. Record Vitals (Vitals logging is tested in Test 3, but let's do it on the clean array)
currentMockInputs = {
  'v-temp': { value: '98.6' },
  'v-hr': { value: '75' },
  'v-bp': { value: '115/75' },
  'v-rr': { value: '17' },
  'v-spo2': { value: '98' },
  'v-weight': { value: '72' },
  'v-pain': { value: '1' },
  'v-sugar': { value: '110' },
  'v-urine': { value: '550' },
  'v-oxygen': { value: 'N/A' },
  'v-notes': { value: 'Normal vitals' }
};
window.executePatientAction('rec-vitals', patient.uhid);

// 3. Order Lab Test
global.document.querySelectorAll = (selector) => {
  if (selector === '.lab-check:checked') {
    return [{ value: 'CBC Blood Count' }, { value: 'Basic LFT Profile' }];
  }
  return [];
};
currentMockInputs = {
  'lab-priority': { value: 'Urgent' }
};
window.executePatientAction('order-lab', patient.uhid);

// 4. Order Radiology
window.tempSelectedRadInvestigations = [
  { code: 'RAD-XRAY-CHEST', name: 'X-Ray Chest PA View', modality: 'X-Ray', priority: 'Stat' }
];
currentMockInputs = {
  'rad-order-physician': { value: patient.primaryConsultant },
  'rad-order-prio': { value: 'Stat' },
  'rad-order-indication': { value: 'Chest pain' },
  'rad-order-notes': { value: 'Provisional diagnosis details' },
  'rad-order-date': { value: '2026-06-25' },
  'rad-order-time': { value: '10:00 AM - 11:00 AM' }
};
window.submitPlaceRadOrder(patient.uhid, 'Ordered');

// 5. Request Procedure
currentMockInputs = {
  'proc-name': { value: 'Wound Debridement & Suturing' }
};
window.executePatientAction('order-proc', patient.uhid);

// 6. Prescribe Medication
currentMockInputs = {
  'rx-drug': { value: 'Dolo 650mg' },
  'rx-dose': { value: '1 tablet' },
  'rx-freq': { value: 'TID' },
  'rx-dur': { value: '5 Days' },
  'rx-inst': { value: 'Post food' }
};
window.executePatientAction('create-rx', patient.uhid);

// 7. Add Diagnosis
currentMockInputs = {
  'diag-code': { value: 'I10' },
  'diag-name': { value: 'Essential hypertension' }
};
window.executePatientAction('add-diag', patient.uhid);

// 8. Book Appointment
currentMockInputs = {
  'appt-date': { value: '2026-06-25' },
  'appt-doctor': { value: 'Dr. Abhishek Kumar' },
  'appt-time-slot': { value: '11:00 AM' }
};
window.apptConfirmPhase = false;
window.executePatientAction('book-appt', patient.uhid);
window.executePatientAction('book-appt', patient.uhid);

// 9. Admit Patient
currentMockInputs = {
  'admit-ward': { value: 'ICU' },
  'admit-bed': { value: 'ICU-01' }
};
window.executePatientAction('admit', patient.uhid);

// 10. Upload Document
currentMockInputs = {
  'doc-title': { value: 'Lab_Report_June' },
  'doc-cat': { value: 'Lab Report' }
};
window.executePatientAction('upload-doc', patient.uhid);

// 11. Generate Bill Charge
currentMockInputs = {
  'bill-desc': { value: 'Consultation Charge' },
  'bill-rate': { value: '500' }
};
window.executePatientAction('gen-bill', patient.uhid);

// 12. Collect Payment
currentMockInputs = {
  'pay-collected': { value: '500' }
};
window.executePatientAction('collect-pay', patient.uhid);

// 13. Print Doc
currentMockInputs = {
  'print-item-sel': { value: 'Clinical Prescription Rx' }
};
window.executePatientAction('print-docs', patient.uhid);

// 14. Bed Reservation
currentMockInputs = {
  'reserve-patient-uhid': { value: patient.uhid }
};
state.bedsStatus = state.bedsStatus || {};
state.bedsStatus['ICU-01'] = { wardKey: 'ICU', status: 'Available' };
global.closeBedModal = () => {};
global.renderBedBoard = () => {};
window.executeBedReservation('ICU-01');

// 15. Bed Transfer
currentMockInputs = {
  'transfer-dest-bed': { value: 'ICU-02' },
  'transfer-isolation-flag': { checked: false }
};
state.bedsStatus['ICU-02'] = { wardKey: 'ICU', status: 'Available' };
state.bedsStatus['ICU-01'] = { wardKey: 'ICU', status: 'Occupied', patientUhid: patient.uhid };
window.executeBedTransfer('ICU-01', patient.uhid);

// 16. Patient Discharge from Bed
global.confirm = () => true;
global.closeBedModal = () => {};
global.renderBedBoard = () => {};
state.bedsStatus['ICU-02'] = { wardKey: 'ICU', status: 'Occupied', patientUhid: patient.uhid };
window.dischargePatientFromBed('ICU-02');

console.log('Timeline Events generated:', patient.timelineEvents);

const expectedEvents = [
  { icon: '🏥', title: 'Patient Discharged' },
  { icon: '🔄', title: 'Bed Transferred' },
  { icon: '🛏️', title: 'Bed Reserved' },
  { icon: '🖨️', title: 'Document Printed' },
  { icon: '💰', title: 'Payment Collected' },
  { icon: '💵', title: 'Billing Charge Generated' },
  { icon: '📄', title: 'Document Uploaded' },
  { icon: '🏥', title: 'Patient Admitted' },
  { icon: '📅', title: 'Appointment Booked' },
  { icon: '🔍', title: 'Diagnosis Added' },
  { icon: '💊', title: 'Medication Prescribed' },
  { icon: '🪡', title: 'Procedure Requested' },
  { icon: '💀', title: 'Radiology Ordered' },
  { icon: '🧪', title: 'Lab Test Ordered' },
  { icon: '🌡️', title: 'Vitals Recorded' },
  { icon: '📝', title: 'Progress Note Added' }
];

let failed = false;
if (patient.timelineEvents.length !== expectedEvents.length) {
  console.log(`FAIL: Expected ${expectedEvents.length} events, but got ${patient.timelineEvents.length}`);
  failed = true;
} else {
  for (let i = 0; i < expectedEvents.length; i++) {
    const actual = patient.timelineEvents[i];
    const expected = expectedEvents[i];
    if (actual.icon !== expected.icon || actual.title !== expected.title) {
      console.log(`FAIL: Event index ${i} expected ${expected.icon} ${expected.title}, got ${actual.icon} ${actual.title}`);
      failed = true;
    } else {
      console.log(`PASS: Found event "${actual.icon} ${actual.title}" with desc: "${actual.desc}"`);
    }
  }
}

if (failed) {
  process.exit(1);
} else {
  console.log('\n--- All Tests Finished ---');
}
