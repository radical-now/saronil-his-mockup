const fs = require('fs');
const path = require('path');

// Mock browser globals
global.window = {
  views: {}
};
global.state = {};
global.router = {
  navigate: (route) => {
    console.log(`MOCK ROUTER NAVIGATE TO: ${route}`);
  }
};

const defaultMockElement = {
  value: '',
  innerHTML: '',
  textContent: '',
  appendChild: () => {},
  classList: {
    add: () => {},
    remove: () => {}
  },
  style: {},
  disabled: false,
  dispatchEvent: () => {},
  addEventListener: () => {},
  querySelector: () => ({ textContent: '', style: {} }),
  querySelectorAll: () => [],
  options: [{ text: 'General Ward (Male) (₹1500/day)' }],
  selectedIndex: 0,
  reset: () => {}
};

let currentMockInputs = {};
const elementListeners = {};
const elementCache = {};

global.document = {
  addEventListener: () => {},
  getElementById: (id) => {
    if (!elementCache[id]) {
      elementCache[id] = {
        ...defaultMockElement,
        id: id,
        style: {}, // Fresh style object to avoid shared references
        addEventListener: (event, cb) => {
          const key = id + '_' + event;
          elementListeners[key] = elementListeners[key] || [];
          elementListeners[key].push(cb);
        },
        dispatchEvent: (eventObj) => {
          const key = id + '_' + eventObj.type;
          const cbs = elementListeners[key] || [];
          cbs.forEach(cb => cb(eventObj));
        }
      };
    }
    if (currentMockInputs[id]) {
      if (currentMockInputs[id].hasOwnProperty('value')) {
        elementCache[id].value = currentMockInputs[id].value;
      }
      if (currentMockInputs[id].hasOwnProperty('files')) {
        elementCache[id].files = currentMockInputs[id].files;
      }
    }
    return elementCache[id];
  },
  querySelectorAll: (selector) => [],
  querySelector: (selector) => {
    return {
      ...defaultMockElement,
      value: '',
      innerHTML: '',
      textContent: ''
    };
  },
  createElement: () => ({
    appendChild: () => {},
    classList: { add: () => {}, remove: () => {} },
    style: {},
    addEventListener: () => {}
  })
};

let alertMessage = '';
global.alert = (msg) => {
  console.log('MOCK ALERT:', msg);
  alertMessage = msg;
};

// Load state.js
const stateJsContent = fs.readFileSync(path.join(__dirname, '../assets/js/state.js'), 'utf8');
eval(stateJsContent);

// Load ipdAdmissionView.js
const ipdViewContent = fs.readFileSync(path.join(__dirname, '../assets/js/views/ipdAdmissionView.js'), 'utf8');
eval(ipdViewContent);

const state = global.window.state;

console.log('--- Initializing HIS Unified Single-Form IPD Onboarding Tests ---');

// Find a patient who is not currently admitted
const candidatePatient = state.patients.find(p => p.status === 'Registered');
if (!candidatePatient) {
  console.log('FAIL: No registered patient found.');
  process.exit(1);
}
console.log(`Patient Selected: ${candidatePatient.name} (UHID: ${candidatePatient.uhid}) | Initial Status: ${candidatePatient.status}`);

const container = {
  set innerHTML(val) {},
  get innerHTML() { return ''; },
  addEventListener: () => {},
  querySelector: () => ({ addEventListener: () => {}, style: {} }),
  querySelectorAll: () => []
};

// Initialize the IPD Inpatient Admission Advice View
global.window.views.ipdAdmission(container, null, { uhid: candidatePatient.uhid });

// Test 1: Patient Selection & Auto-Enable Validation Check
console.log('\n--- Test 1: Patient Selection & Auto-Enable Validation Check ---');

const targetBed = Object.keys(state.bedsStatus).find(b => state.bedsStatus[b].status === 'Available');
if (!targetBed) {
  console.log('FAIL: No vacant beds found for testing.');
  process.exit(1);
}
const targetWard = state.bedsStatus[targetBed].wardKey;

// Select patient and set mock values
currentMockInputs = {
  'adm-uhid': { value: candidatePatient.uhid },
  'adm-doctor': { value: 'Dr. Abhishek Kumar' },
  'adm-ward': { value: targetWard },
  'adm-bed': { value: targetBed },
  'adm-date': { value: '2026-06-21' },
  'adm-diagnosis': { value: 'Acute Cholecystitis' }
};
Object.keys(currentMockInputs).forEach(id => document.getElementById(id));

// Trigger change event to simulate selection
const patientSearchInput = document.getElementById('adm-uhid-search');
// The autocomplete calls trigger change, which is caught and calls onPatientSelected.
// We'll call document.getElementById('adm-uhid-search').dispatchEvent(new Event('change'))
// or directly mock the execution of patient change. Let's trigger the change event:
patientSearchInput.dispatchEvent(new Event('change'));

// Wait briefly for the setTimeout in the view selection listener
setTimeout(() => {
  const consentFileInput = document.getElementById('chk-consent-file');
  if (consentFileInput.disabled === false) {
    console.log('PASS: Checklist controls successfully enabled on patient selection.');
  } else {
    console.log('FAIL: Checklist controls remained disabled.');
  }

  // Test 2: Record Additional Advance Deposit Payment
  console.log('\n--- Test 2: Record Additional Advance Deposit ---');
  currentMockInputs['chk-new-advance-amount'] = { value: '7500' };
  document.getElementById('chk-new-advance-amount');
  window.addTempAdvanceDeposit();

  const expectedTotalPaid = window.initialTotalPaid + 7500;
  if (window.tempAdvancePaid === 7500) {
    console.log(`PASS: Advance deposit registered locally: ₹${window.tempAdvancePaid} (Total: ₹${expectedTotalPaid})`);
  } else {
    console.log(`FAIL: Advance deposit not registered. tempAdvancePaid=${window.tempAdvancePaid}`);
  }

  // Test 3: Form Submission & State Modifications
  console.log('\n--- Test 3: Unified Single-Form Onboarding Submit ---');

  const initialAdmissionsCount = state.admissions.length;
  const initialBillingCount = state.billing.length;

  // Setup checklist and attendant inputs
  currentMockInputs['chk-new-id-number'] = { value: '123456789012' }; // New Aadhar
  currentMockInputs['chk-consent-file'] = { files: [{ name: 'consent.pdf' }] };
  currentMockInputs['chk-emergency-name'] = { value: 'Vikram Sharma' };
  currentMockInputs['chk-emergency-relation'] = { value: 'Brother' };
  currentMockInputs['chk-emergency-phone'] = { value: '+91 99999 88888' };
  currentMockInputs['chk-attendant-name'] = { value: 'Ramesh Sharma' };
  currentMockInputs['chk-attendant-relation'] = { value: 'Father' };
  currentMockInputs['chk-attendant-phone'] = { value: '+91 99999 77777' };
  currentMockInputs['chk-attendant-id'] = { value: '888877776666' };
  Object.keys(currentMockInputs).forEach(id => document.getElementById(id));

  // Trigger form submit
  const singleForm = document.getElementById('ipd-admission-single-form');
  singleForm.dispatchEvent(new Event('submit'));

  // Verify State updates
  console.log('\n--- Verifying State & Database Modifications ---');

  // 1. Admission log created
  const newAdmissionsCount = state.admissions.length;
  const latestAdmission = state.admissions[state.admissions.length - 1];
  if (newAdmissionsCount === initialAdmissionsCount + 1 && latestAdmission.uhid === candidatePatient.uhid) {
    console.log(`PASS: Inpatient Admission record successfully created: ID ${latestAdmission.id}`);
  } else {
    console.log('FAIL: Admission record was not created.');
  }

  // 2. Bed status set to Occupied
  const bedDetail = state.bedsStatus[targetBed];
  if (bedDetail.status === 'Occupied' && bedDetail.patientUhid === candidatePatient.uhid) {
    console.log(`PASS: Bed ${targetBed} successfully occupied by ${candidatePatient.uhid}`);
  } else {
    console.log(`FAIL: Bed status is not occupied by patient. Status: ${bedDetail.status}`);
  }

  // 3. Patient Status updated to Admitted
  if (candidatePatient.status === 'Admitted') {
    console.log('PASS: Patient registry status updated to "Admitted".');
  } else {
    console.log(`FAIL: Patient status is ${candidatePatient.status}`);
  }

  // 4. Initial Billing invoice created with advance credit
  const latestInvoice = state.billing[state.billing.length - 1];
  if (state.billing.length === initialBillingCount + 1 && latestInvoice.uhid === candidatePatient.uhid) {
    console.log(`PASS: Billing invoice created (ID: ${latestInvoice.id}) with advance paid amount: ₹${latestInvoice.paid}`);
    if (latestInvoice.paid === expectedTotalPaid) {
      console.log('PASS: Invoice correctly credited the advance payment deposit.');
    } else {
      console.log(`FAIL: Invoice paid is ₹${latestInvoice.paid}, expected ₹${expectedTotalPaid}`);
    }
  } else {
    console.log('FAIL: Billing invoice was not created.');
  }

  // 5. Attendant Caregiver Pass details saved
  if (window.attendantDetails && window.attendantDetails.name === 'Ramesh Sharma' && window.attendantDetails.id === '888877776666') {
    console.log('PASS: Attendant Caregiver details successfully recorded.');
  } else {
    console.log('FAIL: Attendant details not recorded correctly.');
  }

  // 6. Step Transitions & Readouts triggered
  const step1 = document.getElementById('ipd-step-1');
  const step2 = document.getElementById('ipd-step-2');
  const readoutName = document.getElementById('success-pat-readout-name').textContent;
  const readoutUhid = document.getElementById('success-pat-readout-uhid').textContent;
  const readoutBed = document.getElementById('success-pat-readout-bed').textContent;
  const readoutDoc = document.getElementById('success-pat-readout-doc').textContent;

  if (step1.style.display === 'none' && step2.style.display === 'flex') {
    console.log('PASS: Step 1 successfully hidden and Step 2 successfully displayed.');
  } else {
    console.log(`FAIL: Step transitions incorrect. step1=${step1.style.display}, step2=${step2.style.display}`);
  }

  if (readoutName === candidatePatient.name && readoutUhid === candidatePatient.uhid && readoutDoc === 'Dr. Abhishek Kumar') {
    console.log(`PASS: Success banner readouts populated correctly: ${readoutName} (${readoutUhid}) assigned to ${readoutBed} under ${readoutDoc}`);
  } else {
    console.log(`FAIL: Readout details mismatch. name=${readoutName}, uhid=${readoutUhid}, doc=${readoutDoc}`);
  }

  // Test 4: Verify Attendant details not filled
  console.log('\n--- Test 4: Attendant Pass Generation with Empty Details ---');
  
  // Reset the flow
  window.resetIpdAdmissionFlow();
  
  // Restore bed availability for testing
  state.bedsStatus[targetBed] = { status: 'Available', wardKey: targetWard };
  
  // Choose another candidate patient
  const candidatePatient2 = state.patients.find(p => p.status === 'Registered' && p.uhid !== candidatePatient.uhid);
  if (!candidatePatient2) {
    console.log('FAIL: No second registered patient found for testing.');
    process.exit(1);
  }
  
  // Select patient and set mock values, leaving attendant fields blank
  currentMockInputs = {
    'adm-uhid': { value: candidatePatient2.uhid },
    'adm-doctor': { value: 'Dr. Ramesh Kumar' },
    'adm-ward': { value: targetWard },
    'adm-bed': { value: targetBed },
    'adm-date': { value: '2026-06-21' },
    'adm-diagnosis': { value: 'Acute Appendicitis' },
    'chk-attendant-name': { value: '' }, // EMPTY
    'chk-attendant-relation': { value: '' },
    'chk-attendant-phone': { value: '' },
    'chk-attendant-id': { value: '' }
  };
  Object.keys(currentMockInputs).forEach(id => document.getElementById(id));
  
  // Trigger search change to activate checklist
  document.getElementById('adm-uhid-search').dispatchEvent(new Event('change'));
  
  setTimeout(() => {
    // Check if preview card is hidden
    const attCard = document.getElementById('prev-attendant-card');
    if (attCard.style.display === 'none') {
      console.log('PASS: Attendant Pass preview card is successfully hidden when details are empty.');
    } else {
      console.log(`FAIL: Attendant Pass preview card display is ${attCard.style.display}, expected 'none'.`);
    }
    
    // Submit form
    const singleForm2 = document.getElementById('ipd-admission-single-form');
    singleForm2.dispatchEvent(new Event('submit'));
    
    if (window.attendantDetails === null) {
      console.log('PASS: window.attendantDetails is successfully stored as null.');
    } else {
      console.log('FAIL: window.attendantDetails is not null.');
    }
    
    // Attempt printing all
    window.printAllStickersAndPasses();
    
    // Verify only 3 audit logs added for print (excluding Attendant Pass)
    const logsForPatient = state.auditLogs.filter(l => l.action === 'Print Sticker' && l.details.includes(candidatePatient2.name));
    const hasAttendantPassLog = logsForPatient.some(l => l.details.includes('Caregiver Attendant Pass'));
    if (!hasAttendantPassLog) {
      console.log('PASS: Caregiver Attendant Pass was successfully skipped in printing.');
    } else {
      console.log('FAIL: Caregiver Attendant Pass was printed despite empty details.');
    }
    
    console.log('\n--- All Unified Onboarding Workflow Tests Completed ---');
  }, 200);
}, 200);

