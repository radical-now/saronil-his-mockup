/* ==========================================================================
   SARONIL HMS - INSURANCE & TPA PRE-AUTHORIZATION (insuranceView.js)
   ========================================================================== */

window.views.insurance = function(container, subAnchor, params) {
  renderInsuranceView(container);
};

function renderInsuranceView(container) {
  // Compute claims counts
  const totalClaims = state.claims.length;
  const pendingClaims = state.claims.filter(c => c.status === 'Pending').length;
  const approvedClaims = state.claims.filter(c => c.status === 'Approved').length;
  
  let approvedAmtTotal = 0;
  state.claims.filter(c => c.status === 'Approved').forEach(c => approvedAmtTotal += c.approvedAmt);

  container.innerHTML = `
    <!-- Top Claims Metrics -->
    <div class="stats-grid" style="margin-bottom: 1.5rem;">
      <div class="stat-card">
        <div class="stat-info">
          <span class="stat-label">Total TPA Submissions</span>
          <span class="stat-value">${totalClaims}</span>
          <span class="stat-sub">Star, Niva Bupa, CGHS</span>
        </div>
        <div class="stat-icon-wrapper" style="background-color: var(--primary-glow); color: var(--primary);">🛡️</div>
      </div>
      
      <div class="stat-card">
        <div class="stat-info">
          <span class="stat-label">Pre-Auths Pending</span>
          <span class="stat-value">${pendingClaims}</span>
          <span class="stat-sub">Awaiting TPA review</span>
        </div>
        <div class="stat-icon-wrapper" style="background-color: var(--color-warning-bg); color: var(--color-warning);">⏳</div>
      </div>

      <div class="stat-card">
        <div class="stat-info">
          <span class="stat-label">Approved Sum</span>
          <span class="stat-value">₹${approvedAmtTotal.toLocaleString('en-IN')}</span>
          <span class="stat-sub">Sponsor settled</span>
        </div>
        <div class="stat-icon-wrapper" style="background-color: var(--color-success-bg); color: var(--color-success);">💵</div>
      </div>
    </div>

    <!-- Pre-Auth Workspace Split -->
    <div style="display: grid; grid-template-columns: 1fr 2fr; gap: 1.5rem;">
      <!-- Column 1: Log Pre-Auth Claim -->
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">New Pre-Auth Submission</h3>
        </div>
        <div class="card-body">
          <form id="pre-auth-form" onsubmit="event.preventDefault(); submitPreAuthRequest();">
            <div class="form-group" style="margin-bottom: 0.75rem;">
              <label>Select Admitted Patient</label>
              <div class="patient-search-wrapper" style="position: relative; width: 100%;">
                <input type="text" id="ins-patient-search" class="form-control" placeholder="Search patient by Name, Mobile, or UHID..." autocomplete="off" required>
                <input type="hidden" id="ins-patient-select" required>
                <div id="ins-patient-autocomplete" class="autocomplete-dropdown" style="display: none;"></div>
              </div>
            </div>

            <div class="form-group" style="margin-bottom: 0.75rem;">
              <label>Third Party Administrator (TPA)</label>
              <select id="ins-tpa-select" class="form-select">
                <option value="STAR HEALTH AND ALLIED INSURANCE CO. LTD">STAR HEALTH</option>
                <option value="NIVA BUPA HEALTH INSURANCE COMPANY LTD">NIVA BUPA</option>
                <option value="HDFC ERGO GENERAL INSURANCE CO. LTD">HDFC ERGO</option>
                <option value="ICICI LOMBARD GENERAL INSURANCE CO. LTD">ICICI LOMBARD</option>
                <option value="CGHS PATNA (Govt)">CGHS (Government)</option>
              </select>
            </div>

            <div class="form-group" style="margin-bottom: 0.75rem;">
              <label>Estimated Admission Bill (₹)</label>
              <input type="number" id="ins-estimate" class="form-control" placeholder="e.g. 50000" required>
            </div>

            <div class="form-group" style="margin-bottom: 1rem;">
              <label>Clinical Diagnosis Details</label>
              <textarea id="ins-diagnosis" class="form-control" rows="3" placeholder="Primary diagnosis & ICD codes..." readonly></textarea>
            </div>

            <button type="submit" class="btn btn-primary" style="width: 100%;">Submit Pre-Auth Claim</button>
          </form>
        </div>
      </div>

      <!-- Column 2: Claims Queue -->
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">TPA Claims Worklist</h3>
        </div>
        <div class="card-body">
          <table class="custom-table" style="font-size: 0.85rem;">
            <thead>
              <tr>
                <th>Claim ID</th>
                <th>Patient Details (UHID)</th>
                <th>TPA Sponsor</th>
                <th>Estimated (₹)</th>
                <th>Approved (₹)</th>
                <th>Pre-Auth Code</th>
                <th>Status</th>
                <th style="text-align: right;">Action</th>
              </tr>
            </thead>
            <tbody>
              ${state.claims.map(claim => {
                let statusBadge = '';
                if (claim.status === 'Approved') {
                  statusBadge = '<span class="badge bg-success" style="color:#fff; padding:0.15rem 0.35rem; font-size:0.75rem; border-radius:4px;">Approved</span>';
                } else if (claim.status === 'Query Raised') {
                  statusBadge = '<span class="badge bg-warning" style="color:#fff; padding:0.15rem 0.35rem; font-size:0.75rem; border-radius:4px;">Query Raised</span>';
                } else if (claim.status === 'Rejected') {
                  statusBadge = '<span class="badge bg-danger" style="color:#fff; padding:0.15rem 0.35rem; font-size:0.75rem; border-radius:4px;">Rejected</span>';
                } else {
                  statusBadge = '<span class="badge bg-secondary" style="color:#fff; padding:0.15rem 0.35rem; font-size:0.75rem; border-radius:4px;">Pending</span>';
                }

                return `
                  <tr>
                    <td><strong>${claim.id}</strong></td>
                    <td>
                      <div style="font-weight:600;"><a href="#patients?uhid=${claim.uhid}" class="patient-link">${claim.patientName}</a></div>
                      <div style="font-size:0.75rem; color:var(--text-muted);">${claim.uhid}</div>
                    </td>
                    <td>${claim.insurer.split(' ')[0]}</td>
                    <td>₹${claim.estimatedAmt.toLocaleString('en-IN')}</td>
                    <td><strong>₹${claim.approvedAmt.toLocaleString('en-IN')}</strong></td>
                    <td><code>${claim.preAuthNo || 'N/A'}</code></td>
                    <td>${statusBadge}</td>
                    <td style="text-align: right; display:flex; gap:0.25rem; justify-content:flex-end;">
                      ${claim.status === 'Pending' ? `
                        <button class="btn btn-success" style="padding: 0.2rem 0.5rem; font-size: 0.75rem;" onclick="approvePreAuth('${claim.id}', ${claim.estimatedAmt})">Approve</button>
                        <button class="btn btn-warning" style="padding: 0.2rem 0.5rem; font-size: 0.75rem;" onclick="raiseClaimQuery('${claim.id}')">Query</button>
                      ` : `
                        <button class="btn btn-secondary" style="padding: 0.2rem 0.5rem; font-size: 0.75rem;" disabled>Completed</button>
                      `}
                    </td>
                  </tr>
                `;
              }).join('') || '<tr><td colspan="8" style="text-align: center; color: var(--text-muted);">No active TPA claims.</td></tr>'}
            </tbody>
          </table>
        </div>
      </div>
  `;

  // Initialize Patient Autocomplete Search
  window.setupPatientAutocomplete({
    searchInputId: 'ins-patient-search',
    hiddenInputId: 'ins-patient-select',
    autocompleteListId: 'ins-patient-autocomplete',
    filterFn: p => p.status === 'Admitted',
    onSelect: (uhid) => {
      window.loadPatientDiagnosisForClaim(uhid);
    }
  });

  // Also hook change event on hidden input in case loadPatientDiagnosisForClaim needs it
  document.getElementById('ins-patient-select').addEventListener('change', (e) => {
    window.loadPatientDiagnosisForClaim(e.target.value);
  });
}

window.loadPatientDiagnosisForClaim = function(uhid) {
  const patient = state.patients.find(p => p.uhid === uhid);
  const diagField = document.getElementById('ins-diagnosis');
  const estimateField = document.getElementById('ins-estimate');

  if (patient) {
    diagField.value = patient.clinicalData.diagnosis || "No primary diagnosis recorded.";
    // Autofill estimate if billing exists
    const billing = state.billing.find(b => b.uhid === uhid && b.status === 'Outstanding');
    if (billing) {
      estimateField.value = billing.amount;
    } else {
      estimateField.value = 35000; // standard default
    }
  } else {
    diagField.value = '';
    estimateField.value = '';
  }
};

window.submitPreAuthRequest = function() {
  const uhid = document.getElementById('ins-patient-select').value;
  const tpa = document.getElementById('ins-tpa-select').value;
  const estimate = parseFloat(document.getElementById('ins-estimate').value);

  const patient = state.patients.find(p => p.uhid === uhid);
  if (!patient) return;

  const newClaim = {
    id: "CLM" + String(9000 + state.claims.length + 1),
    uhid: uhid,
    patientName: patient.name,
    insurer: tpa,
    estimatedAmt: estimate,
    approvedAmt: 0,
    status: "Pending",
    preAuthNo: ""
  };

  state.claims.push(newClaim);
  
  // Set patient's payer to this TPA
  patient.payer = tpa;
  patient.payerType = "Company";
  patient.sponsor = tpa.split(' ')[0];

  alert(`Pre-authorization claim submitted successfully for ${patient.name}.`);
  renderInsuranceView(document.getElementById('main-content'));
};

window.approvePreAuth = function(claimId, estAmt) {
  const claim = state.claims.find(c => c.id === claimId);
  if (claim) {
    const approvedAmt = Math.round(estAmt * (0.8 + Math.random() * 0.18)); // approved ~80-98%
    claim.status = 'Approved';
    claim.approvedAmt = approvedAmt;
    claim.preAuthNo = "AUTH" + String(70000 + state.claims.length + 1);

    // Apply corporate/TPA coverage to billing invoice if it exists
    const bill = state.billing.find(b => b.uhid === claim.uhid && b.status !== 'Settled');
    if (bill) {
      bill.paid += approvedAmt; // TPA coverage is processed as part-payment
      if (bill.paid >= bill.amount) {
        bill.status = 'Settled';
      }
    }

    alert(`Pre-authorization code: ${claim.preAuthNo} issued. Approved amount: ₹${approvedAmt.toLocaleString('en-IN')}`);
    renderInsuranceView(document.getElementById('main-content'));
  }
};

window.raiseClaimQuery = function(claimId) {
  const claim = state.claims.find(c => c.id === claimId);
  if (claim) {
    claim.status = 'Query Raised';
    alert(`TPA Query raised for claim ${claimId}. Required medical notes and reports re-upload.`);
    renderInsuranceView(document.getElementById('main-content'));
  }
};
