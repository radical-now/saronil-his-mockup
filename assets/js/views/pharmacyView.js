/* ==========================================================================
   SARONIL HMS - PHARMACY DISPENSING & INVENTORY CONTROL (pharmacyView.js)
   ========================================================================== */

window.views.pharmacy = function(container, subAnchor, params) {
  renderPharmacyView(container);
};

function renderPharmacyView(container) {
  // Compute metrics
  const totalItems = state.inventory.pharmacy.length;
  const lowStockItems = state.inventory.pharmacy.filter(item => item.stock < item.minStock).length;
  const patientsWithRx = state.patients.filter(p => p.prescriptions && p.prescriptions.length > 0);

  container.innerHTML = `
    <!-- Top metrics -->
    <div class="stats-grid" style="margin-bottom: 1.5rem;">
      <div class="stat-card">
        <div class="stat-info">
          <span class="stat-label">Pharmacy Formulary</span>
          <span class="stat-value">${totalItems} Items</span>
          <span class="stat-sub">Active drug lines</span>
        </div>
        <div class="stat-icon-wrapper" style="background-color: var(--primary-glow); color: var(--primary);">💊</div>
      </div>
      
      <div class="stat-card">
        <div class="stat-info">
          <span class="stat-label">Low Stock Alerts</span>
          <span class="stat-value" style="color: var(--color-danger);">${lowStockItems}</span>
          <span class="stat-sub">Below min threshold</span>
        </div>
        <div class="stat-icon-wrapper" style="background-color: var(--color-danger-bg); color: var(--color-danger);">⚠️</div>
      </div>

      <div class="stat-card">
        <div class="stat-info">
          <span class="stat-label">Prescription Queues</span>
          <span class="stat-value">${patientsWithRx.length} Patients</span>
          <span class="stat-sub">OPD & IPD clinical orders</span>
        </div>
        <div class="stat-icon-wrapper" style="background-color: var(--color-purple-bg); color: var(--color-purple);">📋</div>
      </div>
    </div>

    <!-- Main Workspace Split -->
    <div style="display: grid; grid-template-columns: 1.2fr 1fr; gap: 1.5rem; margin-bottom: 1.5rem;">
      <!-- Dispense Queue -->
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">Medication Dispensing Queue</h3>
        </div>
        <div class="card-body">
          <table class="custom-table" style="font-size: 0.85rem;">
            <thead>
              <tr>
                <th>Patient Name</th>
                <th>UHID / Status</th>
                <th>Prescribed Items</th>
                <th style="text-align: right;">Action</th>
              </tr>
            </thead>
            <tbody>
              ${patientsWithRx.map(p => `
                <tr style="cursor: pointer;" onclick="openPharmacyDispenseWorkspace('${p.uhid}')">
                  <td><a href="#patients?uhid=${p.uhid}" class="patient-link" onclick="event.stopPropagation();">${p.name}</a></td>
                  <td>
                    <div style="font-weight: 500;">${p.uhid}</div>
                    <div style="font-size: 0.75rem; color: var(--text-muted);">${p.status}</div>
                  </td>
                  <td>
                    <div style="max-width: 250px; text-overflow: ellipsis; overflow: hidden; white-space: nowrap; font-size: 0.8rem;">
                      ${p.prescriptions.map(r => r.drug.split(' ')[0]).join(', ')}
                    </div>
                  </td>
                  <td style="text-align: right;">
                    <button class="btn btn-secondary" style="padding: 0.2rem 0.5rem; font-size: 0.75rem;">Load Rx</button>
                  </td>
                </tr>
              `).join('') || '<tr><td colspan="4" style="text-align: center; color: var(--text-muted);">No active prescriptions.</td></tr>'}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Workbench -->
      <div class="card" id="pharmacy-dispense-workbench">
        <div class="card-header">
          <h3 class="card-title">Dispense Workspace</h3>
        </div>
        <div class="card-body" style="text-align: center; color: var(--text-muted); padding: 4rem 1rem;">
          💊 Select a patient from the queue to process their active prescription, check stocks, and generate sales invoices.
        </div>
      </div>
    </div>

    <!-- Inventory Formulary Section -->
    <div class="card">
      <div class="card-header" style="display: flex; justify-content: space-between; align-items: center;">
        <h3 class="card-title">Pharmacy Formulary & Stock Levels</h3>
        <button class="btn btn-secondary" onclick="restockPharmacyInventory()">Trigger Automated Restock</button>
      </div>
      <div class="card-body">
        <div class="custom-table-container">
          <table class="custom-table" style="font-size: 0.85rem;">
            <thead>
              <tr>
                <th>Drug Code</th>
                <th>Medicine Name</th>
                <th>Category</th>
                <th>Current Stock</th>
                <th>Min Stock</th>
                <th>Unit Price (₹)</th>
                <th>Expiry Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${state.inventory.pharmacy.map(item => {
                const isLow = item.stock < item.minStock;
                return `
                  <tr style="background: ${isLow ? 'rgba(239, 68, 68, 0.01)' : 'transparent'};">
                    <td><code>${item.code}</code></td>
                    <td><strong>${item.name}</strong></td>
                    <td>${item.category}</td>
                    <td style="color: ${isLow ? 'var(--color-danger)' : 'var(--text-primary)'}; font-weight: bold;">
                      ${item.stock.toLocaleString()} Tabs
                    </td>
                    <td>${item.minStock}</td>
                    <td>₹${item.price}</td>
                    <td>${item.expiry}</td>
                    <td>
                      ${isLow 
                        ? '<span style="color: var(--color-danger); font-weight: 600;">⚠️ LOW STOCK</span>' 
                        : '<span style="color: var(--color-success); font-weight: 600;">✅ STABLE</span>'}
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}

window.openPharmacyDispenseWorkspace = function(uhid) {
  const patient = state.patients.find(p => p.uhid === uhid);
  const panel = document.getElementById('pharmacy-dispense-workbench');
  if (!patient) return;

  panel.innerHTML = `
    <div class="card-header" style="padding: 0.75rem 1rem; border-bottom: 1px solid var(--border-color);">
      <h4 style="font-size: 0.95rem;">Dispense: <a href="#patients?uhid=${patient.uhid}" class="patient-link">${patient.name}</a></h4>
      <p style="font-size: 0.75rem; color: var(--text-muted); margin: 0;">UHID: ${patient.uhid} | Sponsor: ${patient.sponsor}</p>
    </div>
    <div class="card-body" style="padding: 1rem; font-size: 0.85rem; display: flex; flex-direction: column; gap: 1rem;">
      <h5 style="margin-bottom: 0.5rem; border-bottom: 1px solid var(--border-color); padding-bottom: 0.25rem;">Prescribed Items</h5>
      <table style="width: 100%; border-collapse: collapse; font-size: 0.8rem; margin-bottom: 1rem;">
        <thead>
          <tr style="text-align: left; font-weight: bold; border-bottom: 1px solid var(--border-color);">
            <th style="padding: 0.3rem 0;">Drug</th>
            <th style="padding: 0.3rem 0; text-align: center;">Dosage / Freq</th>
            <th style="padding: 0.3rem 0; text-align: right;">Formulary Stock</th>
          </tr>
        </thead>
        <tbody>
          ${patient.prescriptions.map(p => {
            const formularyItem = state.inventory.pharmacy.find(item => p.drug.includes(item.name.split(' ')[0]));
            const stockLevel = formularyItem ? formularyItem.stock : 0;
            const stockColor = stockLevel < 100 ? 'var(--color-danger)' : 'var(--color-success)';
            return `
              <tr style="border-bottom: 1px dashed var(--border-color);">
                <td style="padding: 0.3rem 0;"><strong>${p.drug}</strong><br><small style="color:var(--text-muted);">${p.instruction || ''}</small></td>
                <td style="padding: 0.3rem 0; text-align: center;">${p.dose} (${p.freq})<br><small style="color:var(--text-muted);">${p.duration}</small></td>
                <td style="padding: 0.3rem 0; text-align: right; color: ${stockColor}; font-weight: bold;">
                  ${stockLevel.toLocaleString()} available
                </td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>

      <!-- Action -->
      <div style="background-color: var(--bg-surface-elevated); padding: 0.75rem; border-radius: 6px; font-size: 0.8rem;">
        <p style="margin-bottom: 0.5rem;"><strong>Bill To:</strong> ${patient.payer} (${patient.payerType})</p>
        <p style="margin-bottom: 0.5rem;">Dosing will deduct stock by 10 Tabs per item automatically.</p>
        <button class="btn btn-primary" style="width: 100%;" onclick="dispenseMedicationAndInvoice('${patient.uhid}')">Dispense & Post Bill Charges</button>
      </div>
    </div>
  `;
};

window.dispenseMedicationAndInvoice = function(uhid) {
  const patient = state.patients.find(p => p.uhid === uhid);
  if (!patient) return;

  // Pharmacy Dispensing drug interaction check
  const dispCheck = state.validate('Dispensing', { patientUhid: uhid });
  if (dispCheck.status === 'WARNING') {
    showPharmacyWarningModal(patient, dispCheck.message, () => {
      executeDispenseMedication(patient, uhid);
    });
    return;
  }

  executeDispenseMedication(patient, uhid);
};

function executeDispenseMedication(patient, uhid) {
  // 1. Deduct Stock Levels (10 Tabs per item)
  let totalCost = 0;
  const billItems = [];
  
  patient.prescriptions.forEach(p => {
    // Find item
    const formularyItem = state.inventory.pharmacy.find(item => p.drug.includes(item.name.split(' ')[0]));
    if (formularyItem) {
      const dispenseQty = 10;
      formularyItem.stock = Math.max(0, formularyItem.stock - dispenseQty);
      
      const itemCost = dispenseQty * formularyItem.price;
      totalCost += itemCost;
      
      billItems.push({
        desc: `Medication: ${formularyItem.name} x ${dispenseQty} units`,
        qty: 1,
        rate: itemCost,
        total: itemCost
      });
    }
  });

  // 2. Post Billing Charges
  if (totalCost > 0) {
    // Find patient's active billing or create one
    let activeBill = state.billing.find(b => b.uhid === uhid && b.status !== 'Settled');
    if (!activeBill) {
      activeBill = {
        id: "INV" + String(8000 + state.billing.length + 1),
        uhid: uhid,
        patientName: patient.name,
        date: "2026-06-17",
        amount: 0,
        paid: 0,
        status: "Outstanding",
        items: []
      };
      state.billing.push(activeBill);
    }
    
    // Add charges
    billItems.forEach(item => {
      activeBill.items.push(item);
      activeBill.amount += item.total;
    });
  }

  // 3. Set prescription status as complete
  patient.prescriptions = []; // Empty the active queue

  alert(`Dispensing complete! ₹${totalCost.toLocaleString('en-IN')} pharmacy charges posted to invoice ${uhid}.`);
  renderPharmacyView(document.getElementById('main-content'));
}

window.restockPharmacyInventory = function() {
  state.inventory.pharmacy.forEach(item => {
    if (item.stock < item.minStock) {
      item.stock += 3000; // Restock by 3000 tabs
    }
  });
  alert('Formulary restocked successfully. Low stock items updated.');
  renderPharmacyView(document.getElementById('main-content'));
};

function showPharmacyWarningModal(patient, message, onOverride) {
  let modal = document.getElementById('pharmacy-warning-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'pharmacy-warning-modal';
    modal.className = 'modal';
    document.body.appendChild(modal);
  }

  window.tempPharmacyOverride = function() {
    const reason = document.getElementById('pharm-override-reason').value.trim();
    if (!reason) {
      alert('JCI/NABH regulation requires a justification to override dispensing warnings.');
      return;
    }

    state.alerts.push({
      id: "ALT" + String(100 + state.alerts.length + 1),
      severity: "Warning",
      source: "Pharmacy",
      patientName: patient.name,
      uhid: patient.uhid,
      details: `Dispense warning overridden. Reason: "${reason}"`,
      clinician: "Pharmacist Admin",
      time: "2026-06-17 03:20 PM",
      status: "Resolved",
      eStatus: "Resolved"
    });

    closePharmacyWarningModal();
    onOverride();
  };

  modal.innerHTML = `
    <div class="modal-content" style="max-width: 550px; border: 2px solid var(--color-warning); border-radius: var(--radius-md); box-shadow: var(--shadow-lg);">
      <div class="modal-header" style="background-color: var(--color-warning-bg); color: #b45309; border-bottom: 1px solid var(--border-color); padding: 1rem; display: flex; justify-content: space-between; align-items: center;">
        <h4 style="margin: 0; display: flex; align-items: center; gap: 0.5rem; font-weight: 700;">⚠️ Pharmacy Dispensing Warning</h4>
        <span class="modal-close" style="cursor: pointer; font-size: 1.5rem; line-height: 1;" onclick="closePharmacyWarningModal()">&times;</span>
      </div>
      <div class="modal-body" style="padding: 1.5rem; font-size: 0.85rem; display: flex; flex-direction: column; gap: 1.25rem;">
        <div style="background-color: var(--color-warning-bg); color: #b45309; padding: 0.75rem; border-radius: 6px; font-weight: bold; text-align: center; border: 1px solid rgba(245, 158, 11, 0.2);">
          DRUG INTERACTION / THERAPEUTIC DUPLICATION DETECTED
        </div>
        
        <p style="color: var(--text-primary); line-height: 1.5; font-size: 0.9rem; margin: 0; font-weight: 500;">
          ${message.replace('⚠️ JCI PHARMACY DISPENSING WARNING:\n', '')}
        </p>

        <div class="form-group" style="margin-top: 0.5rem;">
          <label style="font-weight: 700; margin-bottom: 0.35rem; display: block; color: var(--text-primary);">Dispense Override Justification <span style="color:var(--color-danger);">*</span></label>
          <textarea id="pharm-override-reason" class="form-control" rows="2" placeholder="e.g. Cleared by prescribing doctor for short-term use..." style="font-size:0.8rem;"></textarea>
        </div>

        <div style="background-color: var(--bg-surface-elevated); color: var(--text-secondary); padding: 0.75rem; border-radius: 6px; border: 1px solid var(--border-color); font-size: 0.75rem; line-height: 1.4;">
          <strong>JCI Standard MMU.5:</strong> The hospital must ensure drug dispensing reviews check for therapeutic duplications, significant interactions, and dosage variations prior to dispatch.
        </div>

        <div style="display: flex; justify-content: flex-end; gap: 0.5rem; border-top: 1px solid var(--border-color); padding-top: 1rem;">
          <button class="btn btn-secondary" onclick="closePharmacyWarningModal()">Cancel Dispensing</button>
          <button class="btn btn-primary" onclick="window.tempPharmacyOverride()">Acknowledge & Dispense</button>
        </div>
      </div>
    </div>
  `;

  modal.classList.add('active');
  modal.style.display = 'flex';
}

window.closePharmacyWarningModal = function() {
  const modal = document.getElementById('pharmacy-warning-modal');
  if (modal) {
    modal.classList.remove('active');
    modal.style.display = 'none';
  }
};
