const fs = require('fs');
const path = require('path');

const newCatalogContent = fs.readFileSync(path.join(__dirname, 'new_catalog.json'), 'utf8');
const arrayText = newCatalogContent.substring(newCatalogContent.indexOf('['), newCatalogContent.lastIndexOf(']') + 1);

const workflowPath = path.join(__dirname, '../assets/js/views/prescriptionWorkflow.js');
let workflowContent = fs.readFileSync(workflowPath, 'utf8');

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

const updatedContent = workflowContent.substring(0, startIndex + 'window.medicationCatalog = '.length) + arrayText + workflowContent.substring(endIndex + 1);
fs.writeFileSync(workflowPath, updatedContent, 'utf8');
console.log("Successfully injected new catalog into prescriptionWorkflow.js!");
