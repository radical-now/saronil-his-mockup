const fs = require('fs');
const path = require('path');
const vm = require('vm');

const workflowPath = path.join(__dirname, '../assets/js/views/prescriptionWorkflow.js');
let workflowContent = fs.readFileSync(workflowPath, 'utf8');

const sandbox = { window: {} };
vm.createContext(sandbox);
vm.runInContext(workflowContent, sandbox);

let catalog = sandbox.window.medicationCatalog;
console.log("Original catalog size:", catalog.length);

// Slice to exactly 100 items
if (catalog.length > 100) {
  catalog = catalog.slice(0, 100);
} else if (catalog.length < 100) {
  // Pad with some copies if needed (should not happen since we have 125)
  while (catalog.length < 100) {
    catalog.push({ ...catalog[catalog.length % catalog.length], code: `RX-MED-PAD-${catalog.length}` });
  }
}

// Make exactly 30% (30 items) out of stock. Let's make index 0 to 29 out of stock, and 30 to 99 in stock (stock: 50).
for (let i = 0; i < 100; i++) {
  if (i < 30) {
    catalog[i].stock = 0;
  } else {
    catalog[i].stock = 50; // In stock
  }
}

// Generate the array text representation nicely
const arrayText = "window.medicationCatalog = " + JSON.stringify(catalog, null, 2) + ";";

// Replace in workflowContent
const startMarker = 'window.medicationCatalog = [';
const startIndex = workflowContent.indexOf(startMarker);
if (startIndex === -1) {
  console.error("Marker window.medicationCatalog = [ not found!");
  process.exit(1);
}

let bracketCount = 1;
let endIndex = -1;
for (let i = startIndex + startMarker.length; i < workflowContent.length; i++) {
  if (workflowContent[i] === '[') bracketCount++;
  else if (workflowContent[i] === ']') {
    bracketCount--;
    if (bracketCount === 0) {
      endIndex = i;
      break;
    }
  }
}

if (endIndex === -1) {
  console.error("Matching closing bracket for medicationCatalog not found!");
  process.exit(1);
}

// Keep the semicolon if there is one
if (workflowContent[endIndex + 1] === ';') {
  endIndex++;
}

const updatedContent = workflowContent.substring(0, startIndex) + arrayText + workflowContent.substring(endIndex + 1);
fs.writeFileSync(workflowPath, updatedContent, 'utf8');
console.log("Successfully updated and sliced medicationCatalog to 100 items with 30% out of stock!");
