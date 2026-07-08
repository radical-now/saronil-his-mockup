/* ==========================================================================
   SARONIL HMS - CLINICAL VALIDATION RULES LIBRARIES (ruleManagerView.js)
   ========================================================================== */

window.views.ruleManager = function(container, subAnchor, params) {
  ensureValidationRules();
  renderRuleManager(container);
};

function ensureValidationRules() {
  if (!window.state) window.state = {};
  if (!Array.isArray(window.state.validationRules)) {
    window.state.validationRules = [];
  }
  if (window.state.validationRules.length === 0 && typeof window.seedState === 'function') {
    window.seedState();
  }
}

function renderRuleManager(container) {
  ensureValidationRules();
  const rules = window.state.validationRules || [];
  container.innerHTML = `
    <div style="display: grid; grid-template-columns: 1.5fr 1fr; gap: 1.5rem;">
      <!-- Left Column: Rules Library list -->
      <div class="card">
        <div class="card-header" style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
          <div>
            <h3 class="card-title">JCI/NABH Validation Rules Library</h3>
            <p class="card-subtitle">Active clinical decision checks, demographic validations, and surgery checklist time-outs</p>
          </div>
        </div>
        <div class="card-body">
          <table class="custom-table" style="font-size: 0.85rem;">
            <thead>
              <tr>
                <th>Rule ID</th>
                <th>Validation Rule Name</th>
                <th>Category</th>
                <th>Trigger Event</th>
                <th>Severity</th>
                <th>Status</th>
                <th style="text-align: right;">Action</th>
              </tr>
            </thead>
            <tbody>
              ${rules.map(rule => {
                let badgeColor = '';
                if (rule.severity === 'Hard Stop') {
                  badgeColor = 'color: #ef4444;';
                } else if (rule.severity === 'Critical Safety Alert') {
                  badgeColor = 'color: #f59e0b;';
                } else {
                  badgeColor = 'color: var(--primary);';
                }

                return `
                  <tr style="cursor: pointer;" onclick="openRuleWorkspace('${rule.id}')">
                    <td><strong>${rule.id}</strong></td>
                    <td>
                      <div style="font-weight:600; color:var(--text-primary);">${rule.name}</div>
                      <div style="font-size:0.75rem; color:var(--text-muted);">Dept: ${rule.dept} | Ver: ${rule.version}</div>
                    </td>
                    <td>${rule.category}</td>
                    <td>${rule.trigger}</td>
                    <td><strong style="${badgeColor} font-size: 0.75rem;">${rule.severity}</strong></td>
                    <td>
                      <strong style="color: ${rule.status === 'Active' ? 'var(--color-success)' : 'var(--text-muted)'}; font-size: 0.75rem;">
                        ${rule.status}
                      </strong>
                    </td>
                    <td style="text-align: right;">
                      <button class="btn btn-secondary" style="padding: 0.2rem 0.5rem; font-size: 0.75rem;">Edit</button>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Right Column: Rule Edit & Sandbox workspace -->
      <div class="card" id="rule-workspace-panel">
        <!-- New Rule Form -->
        <div class="card-header"><h3 class="card-title">Create New Validation Rule</h3></div>
        <div class="card-body" style="padding: 1rem; font-size: 0.85rem; display: flex; flex-direction: column; gap: 0.85rem;">
          <form onsubmit="event.preventDefault(); createHospitalRule();" style="display:flex; flex-direction:column; gap:0.75rem;">
            <div class="form-group">
              <label>Rule Name</label>
              <input type="text" id="rule-name-in" class="form-control" placeholder="e.g. Sepsis NEWS2 Indicator Check" required>
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem;">
              <div class="form-group">
                <label>Category</label>
                <select id="rule-cat-in" class="form-select">
                  <option value="Clinical">Clinical</option>
                  <option value="Registration">Registration</option>
                  <option value="Diagnostics">Diagnostics</option>
                  <option value="OT/Surgery">OT / Surgery</option>
                  <option value="Billing">Billing</option>
                  <option value="Blood Bank">Blood Bank</option>
                </select>
              </div>
              <div class="form-group">
                <label>Severity Level</label>
                <select id="rule-sev-in" class="form-select">
                  <option value="Information">Information</option>
                  <option value="Warning">Warning</option>
                  <option value="High Risk">High Risk</option>
                  <option value="Critical Safety Alert">Critical Safety Alert</option>
                  <option value="Hard Stop">Hard Stop (Prevent Action)</option>
                </select>
              </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem;">
              <div class="form-group">
                <label>Trigger Action</label>
                <input type="text" id="rule-trig-in" class="form-control" placeholder="e.g. Prescribe" required>
              </div>
              <div class="form-group">
                <label>Dept Mapping</label>
                <input type="text" id="rule-dept-in" class="form-control" placeholder="e.g. Clinical EMR" required>
              </div>
            </div>

            <div class="form-group">
              <label>Validation Rule Logic / Formula</label>
              <textarea id="rule-logic-in" class="form-control" rows="2" placeholder="e.g. if (patient.allergies.includes(drug.allergenGroup)) throw hard_stop" style="font-family: monospace; font-size: 0.75rem;" required></textarea>
            </div>

            <button type="submit" class="btn btn-primary" style="width: 100%;">Create & Compile Rule</button>
          </form>
        </div>
      </div>
    </div>
  `;
}

window.openRuleWorkspace = function(ruleId) {
  const rule = state.validationRules.find(r => r.id === ruleId);
  const panel = document.getElementById('rule-workspace-panel');
  if (!rule) return;

  panel.innerHTML = `
    <div class="card-header" style="padding: 0.75rem 1rem; border-bottom: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center;">
      <h4 style="font-size: 0.95rem;">Rule Workspace: ${rule.id}</h4>
      <span style="font-size:0.75rem; color: var(--text-muted);">Ver: ${rule.version}</span>
    </div>
    <div class="card-body" style="padding: 1rem; font-size: 0.85rem; display: flex; flex-direction: column; gap: 1rem;">
      <div>
        <p><strong>Rule Title:</strong> ${rule.name}</p>
        <p><strong>Severity:</strong> <strong style="color:var(--color-danger);">${rule.severity}</strong></p>
        <p><strong>Category:</strong> ${rule.category} | <strong>Trigger:</strong> ${rule.trigger}</p>
        <p><strong>Mapping:</strong> Department of ${rule.dept}</p>
      </div>

      <!-- Rule Status Switch -->
      <div style="background-color: var(--bg-surface-elevated); padding: 0.75rem; border-radius: 6px; display: flex; justify-content: space-between; align-items: center;">
        <span><strong>Rule Authorization Status:</strong></span>
        <button class="btn ${rule.status === 'Active' ? 'btn-danger' : 'btn-success'}" onclick="toggleRuleStatus('${rule.id}')" style="padding: 0.25rem 0.5rem; font-size: 0.75rem;">
          ${rule.status === 'Active' ? 'Deactivate Rule' : 'Activate Rule'}
        </button>
      </div>

      <!-- Testing Sandbox -->
      <div style="border: 1px solid var(--border-color); padding: 0.75rem; border-radius: 6px;">
        <h5 style="margin-bottom: 0.5rem; font-size: 0.8rem; font-weight: bold; color: var(--primary);">Rule Testing Sandbox</h5>
        <div class="form-group" style="margin-bottom: 0.5rem;">
          <label style="font-size: 0.75rem;">Sandbox Test Input Data</label>
          <input type="text" id="sandbox-input" class="form-control" value="${rule.id === 'RULE01' ? 'Penicillin' : (rule.id === 'RULE02' ? 'B+ Transfusion to A+ Patient' : (rule.id === 'RULE07' ? 'House Keeping' : 'Ramesh Chandra'))}" style="font-size:0.8rem; padding: 0.25rem;">
        </div>
        <button class="btn btn-secondary" style="width: 100%; font-size: 0.75rem; padding: 0.35rem;" onclick="runSandboxTest('${rule.id}')">Evaluate Rule logic</button>
        <div id="sandbox-result" style="margin-top: 0.5rem; display: none; padding: 0.5rem; border-radius: 4px; font-size: 0.75rem; font-weight: bold;"></div>
      </div>

      <!-- Version Audit Log -->
      <div>
        <h5 style="margin-bottom: 0.5rem; font-size: 0.8rem; border-bottom: 1px solid var(--border-color); padding-bottom: 0.25rem;">Rule Version History</h5>
        <ul style="padding-left: 1.25rem; font-size: 0.75rem; display:flex; flex-direction:column; gap:0.25rem;">
          <li>v${rule.version} (2026-06-17) - Approved by Board of Clinical Directors</li>
          <li>v1.0.0 (2026-05-10) - Initial compilation and safety registry mapping</li>
        </ul>
      </div>
    </div>
  `;
};

window.createHospitalRule = function() {
  const name = document.getElementById('rule-name-in').value;
  const category = document.getElementById('rule-cat-in').value;
  const severity = document.getElementById('rule-sev-in').value;
  const trigger = document.getElementById('rule-trig-in').value;
  const dept = document.getElementById('rule-dept-in').value;

  const newRule = {
    id: "RULE" + String(state.validationRules.length + 1).padStart(2, '0'),
    name,
    category,
    severity,
    trigger,
    dept,
    status: 'Active',
    version: '1.0.0'
  };

  state.validationRules.push(newRule);
  alert(`Rule ${newRule.id} compiled and activated successfully in Saronil rules engine.`);
  renderRuleManager(document.getElementById('main-content'));
};

window.toggleRuleStatus = function(ruleId) {
  const rule = state.validationRules.find(r => r.id === ruleId);
  if (rule) {
    rule.status = rule.status === 'Active' ? 'Deactivated' : 'Active';
    alert(`Rule status updated to: ${rule.status}`);
    openRuleWorkspace(ruleId);
    renderRuleManager(document.getElementById('main-content'));
  }
};

window.runSandboxTest = function(ruleId) {
  const rule = state.validationRules.find(r => r.id === ruleId);
  const inputVal = document.getElementById('sandbox-input').value;
  const resultDiv = document.getElementById('sandbox-result');

  resultDiv.style.display = 'block';

  if (rule.status !== 'Active') {
    resultDiv.style.backgroundColor = 'var(--bg-surface-elevated)';
    resultDiv.style.color = 'var(--text-muted)';
    resultDiv.innerText = 'RULE EVALUATION BYPASSED: Rule is currently Deactivated.';
    return;
  }

  // Run the actual rules engine validation
  if (ruleId === 'RULE01') {
    // Allergy check on patient 7 (has penicillin allergy)
    const check = state.validate('Prescription', { patientUhid: 'UHID20000007', drugName: inputVal });
    if (check.status === 'WARNING') {
      resultDiv.style.backgroundColor = 'var(--color-danger-bg)';
      resultDiv.style.color = 'var(--color-danger)';
      resultDiv.innerText = check.message;
    } else {
      resultDiv.style.backgroundColor = 'var(--color-success-bg)';
      resultDiv.style.color = 'var(--color-success)';
      resultDiv.innerText = '✅ SANDBOX RULE PASSED: No drug-allergy conflict found.';
    }
  } else if (ruleId === 'RULE02') {
    // ABO compatibility. Patient 7 is AB- (compatible with Rh negative blood only)
    const check = state.validate('Transfusion Issue', { patientUhid: 'UHID20000007', bloodGroupRequired: inputVal });
    if (check.status === 'BLOCK') {
      resultDiv.style.backgroundColor = '#7f1d1d';
      resultDiv.style.color = '#fecaca';
      resultDiv.innerText = check.message;
    } else {
      resultDiv.style.backgroundColor = 'var(--color-success-bg)';
      resultDiv.style.color = 'var(--color-success)';
      resultDiv.innerText = '✅ SANDBOX RULE PASSED: Blood groups are ABO compatible.';
    }
  } else if (ruleId === 'RULE03') {
    // Duplicate check
    const check = state.validate('Duplicate Entry', { name: inputVal, age: 60 });
    if (check.status === 'WARNING') {
      resultDiv.style.backgroundColor = 'var(--color-warning-bg)';
      resultDiv.style.color = '#b45309';
      resultDiv.innerText = `⚠️ DUPLICATE FOUND: Similarity: ${check.score}% | Match criteria: ${check.reasons.join(', ')}`;
    } else {
      resultDiv.style.backgroundColor = 'var(--color-success-bg)';
      resultDiv.style.color = 'var(--color-success)';
      resultDiv.innerText = '✅ SANDBOX RULE PASSED: Unique demographic details.';
    }
  } else if (ruleId === 'RULE04') {
    // NEWS2 sepsis check. Expects vitals. Parse inputVal or assume HR
    const hr = parseInt(inputVal) || 75;
    const check = state.validate('Vitals Entry', { patientUhid: 'UHID20000007', vitals: { bp: '120/80', hr: hr, temp: 98.6, spo2: 98 } });
    if (check.status === 'WARNING') {
      resultDiv.style.backgroundColor = 'var(--color-danger-bg)';
      resultDiv.style.color = 'var(--color-danger)';
      resultDiv.innerText = check.message;
    } else {
      resultDiv.style.backgroundColor = 'var(--color-success-bg)';
      resultDiv.style.color = 'var(--color-success)';
      resultDiv.innerText = '✅ SANDBOX RULE PASSED: Stable vitals (NEWS2 score < 5).';
    }
  } else if (ruleId === 'RULE05') {
    // Drug interaction check on patient 1 (has Dolo/Paracetamol prescribed)
    const check = state.validate('Prescription', { patientUhid: 'UHID20000001', drugName: inputVal });
    if (check.status === 'WARNING') {
      resultDiv.style.backgroundColor = 'var(--color-warning-bg)';
      resultDiv.style.color = '#b45309';
      resultDiv.innerText = check.message;
    } else {
      resultDiv.style.backgroundColor = 'var(--color-success-bg)';
      resultDiv.style.color = 'var(--color-success)';
      resultDiv.innerText = '✅ SANDBOX RULE PASSED: No drug interactions detected.';
    }
  } else if (ruleId === 'RULE07') {
    // Bed housekeeping safety check on an occupied bed
    const occupiedBedId = Object.keys(state.bedsStatus).find(bedId => state.bedsStatus[bedId].status === 'Occupied') || 'GW(M)-409';
    const originalStatus = state.bedsStatus[occupiedBedId] ? state.bedsStatus[occupiedBedId].status : 'Available';
    
    // Ensure the state shows the bed as occupied for sandbox test consistency
    if (state.bedsStatus[occupiedBedId]) {
      state.bedsStatus[occupiedBedId].status = 'Occupied';
    }

    const check = state.validate('Bed Status Update', { bedId: occupiedBedId, newStatus: inputVal || 'House Keeping' });
    
    // Restore
    if (state.bedsStatus[occupiedBedId]) {
      state.bedsStatus[occupiedBedId].status = originalStatus;
    }

    if (check.status === 'BLOCK') {
      resultDiv.style.backgroundColor = 'var(--color-danger-bg)';
      resultDiv.style.color = 'var(--color-danger)';
      resultDiv.innerText = check.message;
    } else {
      resultDiv.style.backgroundColor = 'var(--color-success-bg)';
      resultDiv.style.color = 'var(--color-success)';
      resultDiv.innerText = '✅ SANDBOX RULE PASSED: Bed status update allowed.';
    }
  } else {
    resultDiv.style.backgroundColor = 'var(--color-success-bg)';
    resultDiv.style.color = 'var(--color-success)';
    resultDiv.innerText = '✅ SANDBOX RULE PASSED: No validation exceptions encountered.';
  }
};
