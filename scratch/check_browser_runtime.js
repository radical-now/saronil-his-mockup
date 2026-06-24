global.window = global;
global.window.addEventListener = () => {};
global.document = {
  addEventListener: () => {},
  getElementById: () => ({ value: '', style: {}, innerHTML: '', addEventListener: () => {} }),
  querySelectorAll: () => [],
  querySelector: () => ({ addEventListener: () => {}, style: {}, classList: { add: () => {}, remove: () => {} } })
};
global.localStorage = {
  getItem: () => null,
  setItem: () => {}
};
global.location = {
  hash: ''
};

// Mock states that router or views might check
global.state = {};
global.views = {};

// Load the scripts relatively
require('../assets/js/state.js');
require('../assets/js/views/prescriptionWorkflow.js');
require('../assets/js/views/dashboardView.js');
require('../assets/js/views/patientsView.js');
require('../assets/js/views/emrView.js');
require('../assets/js/views/ipdAdmissionView.js');
require('../assets/js/views/daybedView.js');
require('../assets/js/router.js');

console.log("All scripts loaded successfully in mock browser environment!");

// Simulate rendering
const patient = global.state.patients[0];
const container = {
  set innerHTML(val) {},
  get innerHTML() { return ''; },
  addEventListener: () => {},
  querySelector: () => ({ addEventListener: () => {}, style: {} }),
  querySelectorAll: () => []
};

// Mock DOM elements that might be requested during render
const elementMock = {
  addEventListener: () => {},
  querySelectorAll: () => [],
  querySelector: () => ({ style: {} }),
  style: {}
};
global.document.getElementById = (id) => {
  return {
    value: '',
    style: {},
    innerHTML: '',
    addEventListener: () => {},
    querySelectorAll: () => []
  };
};

try {
  global.renderPrescriptionWorkflow(container, patient);
  console.log("SUCCESS: renderPrescriptionWorkflow executed without errors!");
} catch (err) {
  console.error("FAILED: renderPrescriptionWorkflow threw an error:", err);
  process.exit(1);
}

try {
  global.views.emr(container, null, { uhid: patient.uhid });
  console.log("SUCCESS: window.views.emr executed without errors!");
} catch (err) {
  console.error("FAILED: window.views.emr threw an error:", err);
  process.exit(1);
}

try {
  global.views.daybed(container, null, {});
  console.log("SUCCESS: window.views.daybed executed without errors!");
} catch (err) {
  console.error("FAILED: window.views.daybed threw an error:", err);
  process.exit(1);
}

