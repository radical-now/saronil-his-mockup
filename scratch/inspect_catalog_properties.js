const fs = require('fs');
const content = fs.readFileSync('/Users/home/.gemini/antigravity/scratch/saronil-hms/assets/js/views/prescriptionWorkflow.js', 'utf8');

// Match the medicationCatalog array using regex or index
const startMarker = 'window.medicationCatalog = ';
const idx = content.indexOf(startMarker);
if (idx !== -1) {
    const jsonStr = content.substring(idx + startMarker.length);
    // Find the end of array
    let braceCount = 0;
    let endIdx = -1;
    for (let i = 0; i < jsonStr.length; i++) {
        if (jsonStr[i] === '[') braceCount++;
        else if (jsonStr[i] === ']') {
            braceCount--;
            if (braceCount === 0) {
                endIdx = i;
                break;
            }
        }
    }
    if (endIdx !== -1) {
        const catalog = eval(jsonStr.substring(0, endIdx + 1));
        console.log("Length of catalog:", catalog.length);
        console.log("First item:", catalog[0]);
        console.log("Unique categories:", [...new Set(catalog.map(c => c.category))]);
        console.log("Unique departments:", [...new Set(catalog.map(c => c.dept || c.department))]);
    }
}
