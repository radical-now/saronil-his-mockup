/* ==========================================================================
   SARONIL HMS - BILLING, INVOICING & PAYMENT SETTLEMENT (billingView.js)
   ========================================================================== */

window.views.billing = function(container, subAnchor, params) {
  renderBillingView(container);
};

function renderBillingView(container) {
  container.innerHTML = `
    <div style="display: grid; grid-template-columns: 1.5fr 1fr; gap: 1.5rem;">
      <!-- Left: Invoices Roster -->
      <div class="card">
        <div class="card-header">
          <div>
            <h3 class="card-title">Invoicing & Billing Registry</h3>
            <p class="card-subtitle">Manage OPD consultations, ward charges, and package billing settlements</p>
          </div>
        </div>
        <div class="card-body">
          <div style="display: flex; gap: 0.75rem; margin-bottom: 1rem;">
            <input type="text" id="bill-search-input" class="form-control" placeholder="Search by Invoice ID, Name, or UHID..." style="flex: 1;">
            <select id="bill-status-filter" class="form-select" style="width: 150px;">
              <option value="">All Statuses</option>
              <option value="Outstanding">Outstanding</option>
              <option value="Ready for Settlement">Ready for Discharge</option>
              <option value="Settled">Settled</option>
            </select>
          </div>

          <div class="custom-table-container">
            <table class="custom-table">
              <thead>
                <tr>
                  <th>Invoice ID</th>
                  <th>Patient Name (UHID)</th>
                  <th>Amount (₹)</th>
                  <th>Paid (₹)</th>
                  <th>Balance (₹)</th>
                  <th>Status</th>
                  <th style="text-align: right;">Action</th>
                </tr>
              </thead>
              <tbody id="bill-table-body">
                <!-- Invoices rendered here -->
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Right: Bill Detail & Payments Panel -->
      <div class="card" id="billing-detail-panel">
        <div class="card-header">
          <h3 class="card-title">Invoice Workspace</h3>
        </div>
        <div class="card-body" style="text-align: center; color: var(--text-muted); padding: 3rem 1rem;">
          💳 Select an invoice from the registry to view details and settle payments.
        </div>
      </div>
    </div>
  `;

  // Bind roster filters
  const searchInput = document.getElementById('bill-search-input');
  const statusFilter = document.getElementById('bill-status-filter');
  
  const filterBills = () => {
    const query = searchInput.value.toLowerCase().trim();
    const statusVal = statusFilter.value;
    
    const filtered = state.billing.filter(b => {
      const matchesQuery = !query || 
        b.id.toLowerCase().includes(query) || 
        b.uhid.toLowerCase().includes(query) || 
        b.patientName.toLowerCase().includes(query);
      const matchesStatus = !statusVal || b.status === statusVal;
      return matchesQuery && matchesStatus;
    });

    renderBillRoster(filtered);
  };

  searchInput.addEventListener('input', filterBills);
  statusFilter.addEventListener('change', filterBills);

  // Initial render
  filterBills();
}

function renderBillRoster(bills) {
  const tbody = document.getElementById('bill-table-body');
  tbody.innerHTML = bills.map(b => {
    const balance = b.amount - b.paid;
    let statusBadge = '';
    
    if (b.status === 'Settled') {
      statusBadge = '<span class="badge" style="background-color: var(--color-success-bg); color: var(--color-success); border-radius: 4px; padding: 0.15rem 0.35rem; font-size: 0.75rem;">Settled</span>';
    } else if (b.status === 'Ready for Settlement') {
      statusBadge = '<span class="badge" style="background-color: var(--color-warning-bg); color: var(--color-warning); border-radius: 4px; padding: 0.15rem 0.35rem; font-size: 0.75rem;">Ready for Discharge</span>';
    } else {
      statusBadge = '<span class="badge" style="background-color: var(--color-danger-bg); color: var(--color-danger); border-radius: 4px; padding: 0.15rem 0.35rem; font-size: 0.75rem;">Outstanding</span>';
    }

    return `
      <tr style="cursor: pointer;" onclick="openInvoiceWorkspace('${b.id}')">
        <td><strong>${b.id}</strong></td>
        <td>
          <div style="font-weight:600;"><a href="#patients?uhid=${b.uhid}" class="patient-link" onclick="event.stopPropagation();">${b.patientName}</a></div>
          <div style="font-size:0.75rem; color:var(--text-muted);">${b.uhid}</div>
        </td>
        <td>₹${b.amount.toLocaleString('en-IN')}</td>
        <td>₹${b.paid.toLocaleString('en-IN')}</td>
        <td><strong>₹${balance.toLocaleString('en-IN')}</strong></td>
        <td>${statusBadge}</td>
        <td style="text-align: right;">
          <button class="btn btn-secondary" style="padding: 0.2rem 0.5rem; font-size: 0.75rem;">Workspace</button>
        </td>
      </tr>
    `;
  }).join('') || '<tr><td colspan="7" style="text-align: center; color: var(--text-muted);">No invoices found.</td></tr>';
}

window.openInvoiceWorkspace = function(invoiceId) {
  const bill = state.billing.find(b => b.id === invoiceId);
  const panel = document.getElementById('billing-detail-panel');
  if (!bill) return;

  const balance = bill.amount - bill.paid;
  
  // Render invoice workspace
  panel.innerHTML = `
    <div class="card-header" style="padding: 0.75rem 1rem; border-bottom: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center;">
      <h4 style="font-size: 0.95rem;">Details: ${bill.id}</h4>
      <button class="btn btn-secondary" style="padding: 0.2rem 0.5rem; font-size: 0.75rem;" onclick="mockPrintInvoice('${bill.id}')">Print Bill</button>
    </div>
    <div class="card-body" style="padding: 1rem; font-size: 0.85rem; display: flex; flex-direction: column; gap: 1rem;">
      <!-- Patient & Summary Details -->
      <div>
        <p><strong>Patient Name:</strong> <a href="#patients?uhid=${bill.uhid}" class="patient-link">${bill.patientName}</a></p>
        <p><strong>UHID:</strong> ${bill.uhid} | <strong>Date:</strong> ${bill.date}</p>
        <p><strong>Invoice Status:</strong> ${bill.status}</p>
      </div>

      <!-- Line Items List -->
      <div>
        <h5 style="margin-bottom: 0.5rem; border-bottom: 1px solid var(--border-color); padding-bottom: 0.25rem;">Bill Items</h5>
        <table style="width: 100%; font-size: 0.8rem; border-collapse: collapse; margin-bottom: 0.5rem;">
          <thead>
            <tr style="border-bottom: 1px solid var(--border-color); text-align: left; font-weight: bold; color: var(--text-primary);">
              <th style="padding: 0.3rem 0;">Description</th>
              <th style="padding: 0.3rem 0; text-align: center;">Qty</th>
              <th style="padding: 0.3rem 0; text-align: right;">Rate (₹)</th>
              <th style="padding: 0.3rem 0; text-align: right;">Total (₹)</th>
            </tr>
          </thead>
          <tbody>
            ${bill.items.map(item => `
              <tr style="border-bottom: 1px dashed var(--border-color);">
                <td style="padding: 0.3rem 0;">${item.desc}</td>
                <td style="padding: 0.3rem 0; text-align: center;">${item.qty}</td>
                <td style="padding: 0.3rem 0; text-align: right;">₹${item.rate.toLocaleString('en-IN')}</td>
                <td style="padding: 0.3rem 0; text-align: right;">₹${item.total.toLocaleString('en-IN')}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <div style="text-align: right; font-weight: bold; font-size: 0.9rem; color: var(--text-primary);">
          Total Invoice: ₹${bill.amount.toLocaleString('en-IN')}
        </div>
      </div>

      <!-- Add Custom Charge Form -->
      <div style="background-color: var(--bg-surface-elevated); padding: 0.75rem; border-radius: 6px; display: flex; flex-direction: column; gap: 0.5rem;">
        <h6 style="margin: 0; font-size: 0.8rem; font-weight: bold;">Add Service Charge</h6>
        <div style="display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 0.5rem;">
          <input type="text" id="charge-desc" class="form-control" placeholder="Item Name (e.g. Dressing)" style="font-size: 0.75rem; padding: 0.25rem;">
          <input type="number" id="charge-qty" class="form-control" value="1" style="font-size: 0.75rem; padding: 0.25rem;">
          <input type="number" id="charge-rate" class="form-control" placeholder="Price (₹)" style="font-size: 0.75rem; padding: 0.25rem;">
        </div>
        <button class="btn btn-secondary" style="font-size: 0.75rem; padding: 0.3rem;" onclick="addInvoiceCharge('${bill.id}')">Add Line Item</button>
      </div>

      <!-- Settle Payments Box -->
      ${bill.status !== 'Settled' ? `
        <div style="border: 1px solid var(--border-color); padding: 0.75rem; border-radius: 6px;">
          <h5 style="margin-bottom: 0.5rem; font-size: 0.85rem; font-weight: bold; color: var(--primary);">Collect Payment</h5>
          <p><strong>Outstanding Balance:</strong> ₹${balance.toLocaleString('en-IN')}</p>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; margin-top: 0.5rem; margin-bottom: 0.5rem;">
            <div class="form-group">
              <label style="font-size: 0.75rem;">Payment Mode</label>
              <select id="pay-mode" class="form-select" style="font-size: 0.75rem; padding: 0.25rem;">
                <option value="UPI">BHIM / UPI</option>
                <option value="Cash">Cash</option>
                <option value="Card">Debit / Credit Card</option>
                <option value="Sponsor">TPA Sponsor Claim</option>
              </select>
            </div>
            <div class="form-group">
              <label style="font-size: 0.75rem;">Amount to Pay (₹)</label>
              <input type="number" id="pay-amt" class="form-control" value="${balance}" style="font-size: 0.75rem; padding: 0.25rem;">
            </div>
          </div>
          <button class="btn btn-primary" style="width: 100%; font-size: 0.8rem; padding: 0.4rem;" onclick="executeBillPayment('${bill.id}')">Post Payment Settlement</button>
        </div>
      ` : `
        <div style="background-color: var(--color-success-bg); color: var(--color-success); border-radius: 6px; padding: 0.75rem; text-align: center; font-weight: bold;">
          ✅ Fully Settled (Receipt Printed)
        </div>
      `}
    </div>
  `;
};

window.addInvoiceCharge = function(invoiceId) {
  const bill = state.billing.find(b => b.id === invoiceId);
  const desc = document.getElementById('charge-desc').value;
  const qty = parseInt(document.getElementById('charge-qty').value) || 1;
  const rate = parseFloat(document.getElementById('charge-rate').value);

  if (!desc || !rate) {
    alert('Please enter description and rate.');
    return;
  }

  const total = qty * rate;
  bill.items.push({ desc, qty, rate, total });
  bill.amount += total;

  openInvoiceWorkspace(invoiceId);
  renderBillingView(document.getElementById('main-content')); // refresh grid too
};

window.executeBillPayment = function(invoiceId) {
  const bill = state.billing.find(b => b.id === invoiceId);
  const payAmt = parseFloat(document.getElementById('pay-amt').value);
  const payMode = document.getElementById('pay-mode').value;

  if (isNaN(payAmt) || payAmt <= 0) {
    alert('Please enter a valid payment amount.');
    return;
  }

  const balance = bill.amount - bill.paid;
  if (payAmt > balance) {
    alert('Payment amount cannot exceed outstanding balance.');
    return;
  }

  bill.paid += payAmt;
  if (bill.paid >= bill.amount) {
    bill.status = 'Settled';
  } else {
    bill.status = 'Outstanding';
  }

  alert(`Payment of ₹${payAmt.toLocaleString('en-IN')} via ${payMode} registered successfully.`);
  
  openInvoiceWorkspace(invoiceId);
  renderBillingView(document.getElementById('main-content'));
};

window.mockPrintInvoice = function(invoiceId) {
  const bill = state.billing.find(b => b.id === invoiceId);
  if (!bill) return;

  const w = window.open('', '_blank', 'width=600,height=600');
  
  let billItemsHTML = bill.items.map(item => `
    <tr style="border-bottom: 1px solid #ddd;">
      <td style="padding: 8px;">${item.desc}</td>
      <td style="padding: 8px; text-align: center;">${item.qty}</td>
      <td style="padding: 8px; text-align: right;">₹${item.rate.toLocaleString('en-IN')}</td>
      <td style="padding: 8px; text-align: right;">₹${item.total.toLocaleString('en-IN')}</td>
    </tr>
  `).join('');

  w.document.write(`
    <html>
      <head>
        <title>Saronil HMS Receipt - ${bill.id}</title>
        <style>
          body { font-family: sans-serif; padding: 20px; line-height: 1.5; color: #333; }
          .header { text-align: center; border-bottom: 2px solid #0052ff; padding-bottom: 10px; margin-bottom: 20px; }
          .footer { text-align: center; border-top: 1px solid #ddd; margin-top: 30px; padding-top: 10px; font-size: 0.8rem; color: #777; }
        </style>
      </head>
      <body>
        <div class="header">
          <h2>SARONIL SUPER SPECIALTY HOSPITAL</h2>
          <p>HSR Layout Sector-1, Bengaluru, Karnataka 560102</p>
          <h3>INVOICE / RECEIPT</h3>
        </div>
        <div>
          <p><strong>Invoice ID:</strong> ${bill.id} | <strong>Date:</strong> ${bill.date}</p>
          <p><strong>Patient Name:</strong> <a href="#patients?uhid=${bill.uhid}" class="patient-link">${bill.patientName}</a> | <strong>UHID:</strong> ${bill.uhid}</p>
          <p><strong>Status:</strong> ${bill.status}</p>
        </div>
        <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
          <thead>
            <tr style="background: #f1f5f9; border-bottom: 2px solid #ddd;">
              <th style="padding: 8px; text-align: left;">Description</th>
              <th style="padding: 8px; text-align: center;">Qty</th>
              <th style="padding: 8px; text-align: right;">Rate</th>
              <th style="padding: 8px; text-align: right;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${billItemsHTML}
          </tbody>
        </table>
        <div style="text-align: right; margin-top: 20px; font-size: 1.1rem;">
          <p><strong>Total Amount:</strong> ₹${bill.amount.toLocaleString('en-IN')}</p>
          <p><strong>Amount Paid:</strong> ₹${bill.paid.toLocaleString('en-IN')}</p>
          <p><strong>Outstanding Balance:</strong> ₹${(bill.amount - bill.paid).toLocaleString('en-IN')}</p>
        </div>
        <div class="footer">
          <p>Thank you for choosing Saronil Super Specialty Hospital. This is a computer-generated receipt.</p>
        </div>
      </body>
    </html>
  `);
  w.document.close();
  w.print();
};
