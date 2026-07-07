// Mock browser APIs
const mockElement = {
  style: {},
  classList: {
    add: () => {},
    remove: () => {},
    contains: () => false
  },
  setAttribute: () => {},
  getAttribute: () => '',
  appendChild: () => {},
  addEventListener: () => {},
  removeEventListener: () => {},
  dispatchEvent: () => {},
  querySelector: () => mockElement,
  querySelectorAll: () => [mockElement],
  get innerHTML() { return ''; },
  set innerHTML(val) {},
  get value() { return ''; },
  set value(val) {},
  get textContent() { return ''; },
  set textContent(val) {},
  focus: () => {}
};

global.window = global;
global.views = {};
global.document = {
  createElement: () => mockElement,
  getElementById: () => mockElement,
  querySelector: () => mockElement,
  querySelectorAll: () => [mockElement],
  body: mockElement,
  addEventListener: () => {},
  removeEventListener: () => {}
};
global.localStorage = {
  getItem: () => null,
  setItem: () => null
};
global.navigator = {
  userAgent: ''
};
global.window.addEventListener = () => {};
global.window.removeEventListener = () => {};
global.window.router = {
  navigate: () => {}
};

try {
  console.log("Loading state.js...");
  require('../assets/js/state.js');
  
  console.log("Loading patientsView.js...");
  require('../assets/js/views/patientsView.js');

  console.log("Loading registrationView.js...");
  require('../assets/js/views/registrationView.js');

  console.log("Loading ipdAdmissionView.js...");
  require('../assets/js/views/ipdAdmissionView.js');

  console.log("Loading emergencyView.js...");
  require('../assets/js/views/emergencyView.js');

  console.log("Loading emrView.js...");
  require('../assets/js/views/emrView.js');

  console.log("Loading daybedView.js...");
  require('../assets/js/views/daybedView.js');

  console.log("Loading cssdView.js...");
  require('../assets/js/views/cssdView.js');

  console.log("Executing window.views.registration...");
  window.views.registration(mockElement, null, {});
  window.views.registration(mockElement, null, { action: 'new' });
  console.log("✓ registrationView executed successfully!");

  console.log("Executing window.views.ipdAdmission...");
  window.views.ipdAdmission(mockElement, null, {});
  window.views.ipdAdmission(mockElement, null, { uhid: 'SH-2026-04821', from_er: 'true' });
  console.log("✓ ipdAdmissionView executed successfully!");

  console.log("Executing window.views.emergency...");
  window.views.emergency(mockElement, null, {});
  console.log("✓ emergencyView executed successfully!");

  console.log("Executing window.views.emr...");
  // Pass a dummy active patient from global state to test detail rendering path
  const testPatient = window.state.patients[0];
  window.views.emr(mockElement, null, { uhid: testPatient.uhid });
  console.log("✓ emrView executed successfully!");

  console.log("Executing window.views.daybed...");
  window.views.daybed(mockElement, null, {});
  console.log("✓ daybedView executed successfully!");

  console.log("Executing window.views.cssd...");
  window.views.cssd(mockElement, null, {});
  window.views.cssd(mockElement, null, { tab: 'return' });
  window.views.cssd(mockElement, null, { tab: 'cleaning' });
  window.views.cssd(mockElement, null, { tab: 'inspect' });
  window.views.cssd(mockElement, null, { tab: 'sterilization' });
  window.views.cssd(mockElement, null, { tab: 'storage' });
  window.views.cssd(mockElement, null, { tab: 'loaner' });
  window.views.cssd(mockElement, null, { tab: 'recall' });
  window.views.cssd(mockElement, null, { tab: 'equipment' });
  window.views.cssd(mockElement, null, { tab: 'audit' });
  console.log("✓ cssdView executed successfully!");

  console.log("Loading inventoryView.js...");
  require('../assets/js/views/inventoryView.js');

  console.log("Executing window.views.inventory...");
  window.views.inventory(mockElement, null, {});
  console.log("✓ inventoryView executed successfully!");



  console.log("ALL TESTS COMPLETED SUCCESSFULLY!");
} catch (err) {
  console.error("❌ RUNTIME ERROR DETECTED:");
  console.error(err.stack);
  process.exit(1);
}
