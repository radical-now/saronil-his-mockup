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
  appendChild: () => {},
  classList: {
    add: () => {},
    remove: () => {}
  },
  style: {},
  disabled: false,
  dispatchEvent: () => {},
  addEventListener: () => {}
};

let currentMockInputs = {};

global.document = {
  addEventListener: () => {},
  getElementById: (id) => {
    if (currentMockInputs[id]) {
      // Ensure mock input overrides also have event listeners
      return {
        ...defaultMockElement,
        ...currentMockInputs[id]
      };
    }
    return {
      ...defaultMockElement,
      value: '',
      innerHTML: '',
      style: {},
      disabled: false,
      dispatchEvent: () => {}
    };
  },
  querySelectorAll: (selector) => [],
  querySelector: (selector) => {
    return {
      ...defaultMockElement,
      value: '',
      innerHTML: ''
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

// Load patientTransferView.js
const transferViewContent = fs.readFileSync(path.join(__dirname, '../assets/js/views/patientTransferView.js'), 'utf8');
eval(transferViewContent);

const state = global.window.state;

console.log('--- Initializing HIS Compact Patient Transfer Workflow Tests ---');

// Find a patient who is admitted
const admittedAdmission = state.admissions.find(a => a.status === 'Active');
if (!admittedAdmission) {
  console.log('FAIL: No admitted patient with active admission found.');
  process.exit(1);
}

const patient = state.patients.find(p => p.uhid === admittedAdmission.uhid);
console.log(`Admitted Patient Selected: ${patient.name} (UHID: ${patient.uhid}) | Bed: ${admittedAdmission.bed}`);

// Initialize the compact transfer modal
window.openCompactTransferModal(patient.uhid);

// Test 1: Autocomplete / Selection Initialization
console.log('\n--- Test 1: Selection Initialization Check ---');
if (window.selectedTransferPatient && window.selectedTransferPatient.uhid === patient.uhid) {
  console.log('PASS: Patient successfully selected.');
} else {
  console.log('FAIL: Patient was not selected.');
}

// Test 2: Validation check - Same bed transfer
console.log('\n--- Test 2: Validation check - Same bed transfer ---');
alertMessage = '';
currentMockInputs = {
  'transfer-new-bed': { value: admittedAdmission.bed },
  'transfer-new-ward': { value: admittedAdmission.ward },
  'transfer-new-room': { value: 'Room 401' },
  'transfer-reason': { value: 'Clinical Requirement' },
  'transfer-datetime': { value: '2026-06-21T23:00' },
  'transfer-requested-by': { value: 'Dr. Amit Verma' }
};
window.proceedToTransferReview();

if (alertMessage.includes('cannot be the same')) {
  console.log('PASS: Successfully blocked transfer to the same bed.');
} else {
  console.log('FAIL: Failed to block same bed transfer.');
}

// Test 3: Validation check - Destination Bed Occupied
console.log('\n--- Test 3: Validation check - Destination Bed Occupied ---');
// Find an occupied bed that is not the current patient's bed
const occupiedBed = Object.keys(state.bedsStatus).find(bedId => 
  state.bedsStatus[bedId].status === 'Occupied' && bedId !== admittedAdmission.bed
);

if (occupiedBed) {
  console.log(`Found occupied bed for testing: ${occupiedBed}`);
  alertMessage = '';
  currentMockInputs = {
    'transfer-new-bed': { value: occupiedBed },
    'transfer-new-ward': { value: state.bedsStatus[occupiedBed].wardKey },
    'transfer-new-room': { value: 'Room A' },
    'transfer-reason': { value: 'Clinical Requirement' },
    'transfer-datetime': { value: '2026-06-21T23:00' },
    'transfer-requested-by': { value: 'Dr. Amit Verma' }
  };
  window.proceedToTransferReview();
  if (alertMessage.includes('no longer available')) {
    console.log('PASS: Successfully blocked transfer to occupied bed.');
  } else {
    console.log('FAIL: Failed to block occupied bed transfer.');
  }
} else {
  console.log('SKIP: No other occupied beds found to test.');
}

// Test 4: Successful Transfer execution
console.log('\n--- Test 4: Successful Transfer execution ---');
// Find an available bed
const availableBed = Object.keys(state.bedsStatus).find(bedId => 
  state.bedsStatus[bedId].status === 'Available' || state.bedsStatus[bedId].status === 'Vacant'
);

if (!availableBed) {
  console.log('FAIL: No available bed found for testing transfer.');
  process.exit(1);
}

const currentBedId = admittedAdmission.bed;
const currentWardKey = admittedAdmission.ward;
const destBedId = availableBed;
const destWardKey = state.bedsStatus[availableBed].wardKey;
const reason = 'Higher Level of Care';

console.log(`Transferring from Bed ${currentBedId} (${currentWardKey}) to Available Bed ${destBedId} (${destWardKey})`);

currentMockInputs = {
  'transfer-new-bed': { value: destBedId },
  'transfer-new-ward': { value: destWardKey },
  'transfer-new-room': { value: 'Room B' },
  'transfer-reason': { value: reason },
  'transfer-datetime': { value: '2026-06-21T23:00' },
  'transfer-requested-by': { value: 'Dr. Amit Verma' },
  'transfer-approved-by': { value: 'Supervisor Ritu' },
  'transfer-notes': { value: 'Patient transferred for cardiac monitoring.' }
};

const initialHkTaskCount = (state.housekeepingTasks || []).length;
const initialAuditCount = (state.auditLogs || []).length;
const initialAlertCount = (state.alerts || []).length;

// Proceed to review first, then execute
window.proceedToTransferReview();
window.executeCompactTransferWorkflow();

// Verify State Side-Effects
console.log('\n--- Verifying State Side-Effects ---');

// 1. Admission details updated
if (admittedAdmission.bed === destBedId && admittedAdmission.ward === destWardKey) {
  console.log('PASS: Admission record updated with new bed and ward.');
} else {
  console.log('FAIL: Admission bed/ward not updated.');
}

// 2. Old bed vacated and sent to housekeeping
const oldBedStatus = state.bedsStatus[currentBedId].status;
const isOldBedCCU = currentWardKey === 'CCU' || currentWardKey === 'ICCU';
const expectedOldBedStatus = isOldBedCCU ? 'Isolation Cleaning Required' : 'Vacated - Pending Housekeeping';

if (oldBedStatus === expectedOldBedStatus) {
  console.log(`PASS: Old bed vacated and marked as: ${oldBedStatus}`);
} else {
  console.log(`FAIL: Old bed status is ${oldBedStatus}, expected ${expectedOldBedStatus}`);
}

// 3. New bed occupied
const newBedDetail = state.bedsStatus[destBedId];
if (newBedDetail.status === 'Occupied' && newBedDetail.patientUhid === patient.uhid) {
  console.log('PASS: New bed marked as Occupied by correct patient.');
} else {
  console.log('FAIL: New bed status is not correctly set.');
}

// 4. Housekeeping task created
const newHkTasks = (state.housekeepingTasks || []).length;
if (newHkTasks === initialHkTaskCount + 1) {
  console.log('PASS: Housekeeping task successfully created for vacated bed.');
} else {
  console.log('FAIL: Housekeeping task count did not increase.');
}

// 5. Patient timeline updated
const latestEvent = patient.timelineEvents[0];
if (latestEvent && latestEvent.title === 'Patient Bed Transferred' && latestEvent.icon === '🔄') {
  console.log('PASS: Patient timeline logged transfer event.');
} else {
  console.log('FAIL: Timeline event not found or incorrect.');
}

// 6. Destination nursing station alert
const newAlertCount = (state.alerts || []).length;
if (newAlertCount === initialAlertCount + 1) {
  console.log('PASS: Notification alert posted to destination nursing station.');
} else {
  console.log('FAIL: Destination alert count did not increase.');
}

// 7. Immutable audit logs written
const newAuditCount = (state.auditLogs || []).length;
if (newAuditCount === initialAuditCount + 1) {
  console.log('PASS: Immutable transaction audit log written.');
} else {
  console.log('FAIL: General audit log count did not increase.');
}

// Test 5: Inner Modal Search Functionality
console.log('\n--- Test 5: Inner Modal Search Functionality ---');
window.openCompactTransferModal(''); // open empty modal
currentMockInputs = {
  'compact-search-input': { value: patient.name }
};
window.triggerCompactSearch();
window.selectCompactSearchPatient(patient.uhid);

if (window.selectedTransferPatient && window.selectedTransferPatient.uhid === patient.uhid) {
  console.log('PASS: Patient successfully searched and selected inside modal.');
} else {
  console.log('FAIL: Inner modal search failed.');
}

console.log('\n--- All Transfer Tests Completed ---');
