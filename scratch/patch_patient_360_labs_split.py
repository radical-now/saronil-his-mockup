#!/usr/bin/env python3

path = "/Users/home/Desktop/Saronil IHS/Updated HIS /assets/js/views/patientsView.js"

with open(path, "r", encoding="utf-8") as f:
    src = f.read()

# 1. Update visibleTabs definitions to split Labs and Imaging
old_visible_tabs = """    // Tab bar list based on active role
    let visibleTabs = [];
    if (role === 'Doctor') {
      visibleTabs = ['Summary & Timeline', 'Clinical Notes', 'Vitals', 'Labs & Imaging', 'Medications', 'Documents', 'ATD'];
    } else if (role === 'Nurse') {
      visibleTabs = ['Summary & Timeline', 'Clinical Notes', 'Vitals', 'Labs & Imaging', 'Medications', 'Nursing Notes', 'Documents', 'ATD'];
    } else if (role === 'Billing') {
      visibleTabs = ['Summary & Timeline', 'Billing', 'Documents', 'ATD'];
    } else if (role === 'Pharmacy') {
      visibleTabs = ['Summary & Timeline', 'Medications', 'Labs & Imaging'];
    } else if (role === 'Front Desk') {
      visibleTabs = ['Summary & Timeline', 'Documents', 'ATD'];
    } else if (role === 'Admission') {
      visibleTabs = ['Summary & Timeline', 'ATD'];
    }"""

new_visible_tabs = """    // Tab bar list based on active role
    let visibleTabs = [];
    if (role === 'Doctor') {
      visibleTabs = ['Summary & Timeline', 'Clinical Notes', 'Vitals', 'Labs', 'Imaging', 'Medications', 'Documents', 'ATD'];
    } else if (role === 'Nurse') {
      visibleTabs = ['Summary & Timeline', 'Clinical Notes', 'Vitals', 'Labs', 'Imaging', 'Medications', 'Nursing Notes', 'Documents', 'ATD'];
    } else if (role === 'Billing') {
      visibleTabs = ['Summary & Timeline', 'Billing', 'Documents', 'ATD'];
    } else if (role === 'Pharmacy') {
      visibleTabs = ['Summary & Timeline', 'Medications', 'Labs', 'Imaging'];
    } else if (role === 'Front Desk') {
      visibleTabs = ['Summary & Timeline', 'Documents', 'ATD'];
    } else if (role === 'Admission') {
      visibleTabs = ['Summary & Timeline', 'ATD'];
    }"""

src = src.replace(old_visible_tabs, new_visible_tabs, 1)

# 2. Split Labs & Imaging tab content branches
old_labs_imaging_branch = """    } else if (tab === 'Labs & Imaging') {
      const labs = [
        { d: "24 Jun 2026", test: "K⁺ (Potassium)", val: "6.8", unit: "mEq/L", range: "3.5–5.0", status: "Critical", by: "Dr. Priya Nair" },
        { d: "24 Jun 2026", test: "Haemoglobin", val: "8.2", unit: "g/dL", range: "12–16", status: "Abnormal", by: "Dr. Priya Nair" },
        { d: "24 Jun 2026", test: "WBC", val: "7,400", unit: "/µL", range: "4,000–11,000", status: "Normal", by: "Dr. Priya Nair" },
        { d: "23 Jun 2026", test: "Creatinine", val: "1.1", unit: "mg/dL", range: "0.6–1.2", status: "Normal", by: "Dr. Priya Nair" },
        { d: "23 Jun 2026", test: "Sodium", val: "138", unit: "mEq/L", range: "135–145", status: "Normal", by: "Dr. Priya Nair" },
        { d: "23 Jun 2026", test: "Blood Glucose (F)", val: "94", unit: "mg/dL", range: "70–110", status: "Normal", by: "Dr. Priya Nair" },
        { d: "23 Jun 2026", test: "Urine R/E", val: "Protein +1", unit: "—", range: "Nil", status: "Abnormal", by: "Dr. Priya Nair" }
      ];

      const imaging = [
        { d: "24 Jun 2026", study: "Chest X-Ray PA View", modality: "X-Ray", status: "Released", by: "Dr. Priya Nair" }
      ];

      tabContentHtml = `
        <div style="display:flex; flex-direction:column; gap:16px;">
          <!-- Lab Results -->
          <div>
            <span style="font-size:11px; color:var(--text-muted); font-weight:700; display:block; margin-bottom:6px;">LAB RESULTS</span>
            <table class="p360-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Test</th>
                  <th>Result</th>
                  <th>Unit</th>
                  <th>Reference Range</th>
                  <th>Status</th>
                  <th>Ordered By</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                ${labs.map(l => {
                  const isCrit = l.status === 'Critical';
                  const rowStyle = isCrit ? 'style="border-left:3px solid #ef4444; background:#fff5f5;"' : '';
                  
                  let badge = '';
                  if (l.status === 'Critical') badge = '<span class="badge-type badge-ipd" style="background:#fee2e2; color:#ef4444;">CRITICAL</span>';
                  else if (l.status === 'Abnormal') badge = '<span class="badge-type" style="background:#fef3c7; color:#d97706;">ABNORMAL</span>';
                  else badge = '<span class="badge-type badge-status-active">NORMAL</span>';

                  let action = '—';
                  if (isCrit) {
                    action = !isAcked ? `
                      <button class="btn-ack" onclick="window.prAcknowledgeCritical()">Acknowledge</button>
                    ` : '<span style="color:var(--text-muted); font-size:11px;">Acknowledged</span>';
                  }

                  return `
                    <tr ${rowStyle}>
                      <td class="mono">${l.d}</td>
                      <td><b>${l.test}</b></td>
                      <td class="mono" style="font-weight:700;">${l.val}</td>
                      <td class="mono">${l.unit}</td>
                      <td class="mono">${l.range}</td>
                      <td>${badge}</td>
                      <td>${l.by}</td>
                      <td>${action}</td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>

          <!-- Imaging -->
          <div>
            <span style="font-size:11px; color:var(--text-muted); font-weight:700; display:block; margin-bottom:6px;">RADIOLOGY / IMAGING</span>
            <table class="p360-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Study</th>
                  <th>Modality</th>
                  <th>Status</th>
                  <th>Report</th>
                  <th>Ordered By</th>
                </tr>
              </thead>
              <tbody>
                ${imaging.map(img => `
                  <tr>
                    <td class="mono">${img.d}</td>
                    <td><b>${img.study}</b></td>
                    <td class="mono">${img.modality}</td>
                    <td><span class="badge-type badge-status-active">Released</span></td>
                    <td>
                      <button class="btn-qa-ghost" style="padding:2px 8px; font-size:10px;" onclick="window.prShowToast('Opening Chest X-Ray report PDF...')">View Report</button>
                    </td>
                    <td>${img.by}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `;"""

new_labs_imaging_branch = """    } else if (tab === 'Labs') {
      const labs = [
        { d: "24 Jun 2026", test: "K⁺ (Potassium)", val: "6.8", unit: "mEq/L", range: "3.5–5.0", status: "Critical", by: "Dr. Priya Nair" },
        { d: "24 Jun 2026", test: "Haemoglobin", val: "8.2", unit: "g/dL", range: "12–16", status: "Abnormal", by: "Dr. Priya Nair" },
        { d: "24 Jun 2026", test: "WBC", val: "7,400", unit: "/µL", range: "4,000–11,000", status: "Normal", by: "Dr. Priya Nair" },
        { d: "23 Jun 2026", test: "Creatinine", val: "1.1", unit: "mg/dL", range: "0.6–1.2", status: "Normal", by: "Dr. Priya Nair" },
        { d: "23 Jun 2026", test: "Sodium", val: "138", unit: "mEq/L", range: "135–145", status: "Normal", by: "Dr. Priya Nair" },
        { d: "23 Jun 2026", test: "Blood Glucose (F)", val: "94", unit: "mg/dL", range: "70–110", status: "Normal", by: "Dr. Priya Nair" },
        { d: "23 Jun 2026", test: "Urine R/E", val: "Protein +1", unit: "—", range: "Nil", status: "Abnormal", by: "Dr. Priya Nair" }
      ];

      tabContentHtml = `
        <div>
          <span style="font-size:11px; color:var(--text-muted); font-weight:700; display:block; margin-bottom:6px;">LAB RESULTS</span>
          <table class="p360-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Test</th>
                <th>Result</th>
                <th>Unit</th>
                <th>Reference Range</th>
                <th>Status</th>
                <th>Ordered By</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              ${labs.map(l => {
                const isCrit = l.status === 'Critical';
                const rowStyle = isCrit ? 'style="border-left:3px solid #ef4444; background:#fff5f5;"' : '';
                
                let badge = '';
                if (l.status === 'Critical') badge = '<span class="badge-type badge-ipd" style="background:#fee2e2; color:#ef4444;">CRITICAL</span>';
                else if (l.status === 'Abnormal') badge = '<span class="badge-type" style="background:#fef3c7; color:#d97706;">ABNORMAL</span>';
                else badge = '<span class="badge-type badge-status-active">NORMAL</span>';

                let action = '—';
                if (isCrit) {
                  action = !isAcked ? `
                    <button class="btn-ack" onclick="window.prAcknowledgeCritical()">Acknowledge</button>
                  ` : '<span style="color:var(--text-muted); font-size:11px;">Acknowledged</span>';
                }

                return `
                  <tr ${rowStyle}>
                    <td class="mono">${l.d}</td>
                    <td><b>${l.test}</b></td>
                    <td class="mono" style="font-weight:700;">${l.val}</td>
                    <td class="mono">${l.unit}</td>
                    <td class="mono">${l.range}</td>
                    <td>${badge}</td>
                    <td>${l.by}</td>
                    <td>${action}</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      `;
    } else if (tab === 'Imaging') {
      const imaging = [
        { d: "24 Jun 2026", study: "Chest X-Ray PA View", modality: "X-Ray", status: "Released", by: "Dr. Priya Nair" }
      ];

      tabContentHtml = `
        <div>
          <span style="font-size:11px; color:var(--text-muted); font-weight:700; display:block; margin-bottom:6px;">RADIOLOGY / IMAGING</span>
          <table class="p360-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Study</th>
                <th>Modality</th>
                <th>Status</th>
                <th>Report</th>
                <th>Ordered By</th>
              </tr>
            </thead>
            <tbody>
              ${imaging.map(img => `
                <tr>
                  <td class="mono">${img.d}</td>
                  <td><b>${img.study}</b></td>
                  <td class="mono">${img.modality}</td>
                  <td><span class="badge-type badge-status-active">Released</span></td>
                  <td>
                    <button class="btn-qa-ghost" style="padding:2px 8px; font-size:10px;" onclick="window.prShowToast('Opening Chest X-Ray report PDF...')">View Report</button>
                  </td>
                  <td>${img.by}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;"""

src = src.replace(old_labs_imaging_branch, new_labs_imaging_branch, 1)

# 3. Add Imaging icon support to side tabs renderer
old_icon_lookup = """              let icon = '📄';
              if (tName === 'Summary & Timeline') icon = '📋';
              else if (tName === 'Clinical Notes') icon = '✏️';
              else if (tName === 'Vitals') icon = '📊';
              else if (tName === 'Labs & Imaging') icon = '🔬';
              else if (tName === 'Medications') icon = '💊';
              else if (tName === 'Nursing Notes') icon = '📝';
              else if (tName === 'Documents') icon = '📁';
              else if (tName === 'ATD') icon = '🚪';
              else if (tName === 'Billing') icon = '💰';"""

new_icon_lookup = """              let icon = '📄';
              if (tName === 'Summary & Timeline') icon = '📋';
              else if (tName === 'Clinical Notes') icon = '✏️';
              else if (tName === 'Vitals') icon = '📊';
              else if (tName === 'Labs') icon = '🔬';
              else if (tName === 'Imaging') icon = '🩻';
              else if (tName === 'Medications') icon = '💊';
              else if (tName === 'Nursing Notes') icon = '📝';
              else if (tName === 'Documents') icon = '📁';
              else if (tName === 'ATD') icon = '🚪';
              else if (tName === 'Billing') icon = '💰';"""

src = src.replace(old_icon_lookup, new_icon_lookup, 1)

# 4. Map click action redirect routing for Labs and Imaging
old_labs_imaging_trigger = """    } else if (labelClean.includes("Order Lab") || labelClean.includes("Order Radiology") || labelClean.includes("Radiology")) {
      window.prSelectWorkspaceTab("Labs & Imaging");
      window.prShowToast("Labs & Imaging orders view opened");"""

new_labs_imaging_trigger = """    } else if (labelClean.includes("Order Lab")) {
      window.prSelectWorkspaceTab("Labs");
      window.prShowToast("Labs orders view opened");
    } else if (labelClean.includes("Order Radiology") || labelClean.includes("Radiology")) {
      window.prSelectWorkspaceTab("Imaging");
      window.prShowToast("Radiology Imaging orders view opened");"""

src = src.replace(old_labs_imaging_trigger, new_labs_imaging_trigger, 1)

with open(path, "w", encoding="utf-8") as f:
    f.write(src)

print("SUCCESS: Labs and Imaging split complete.")
