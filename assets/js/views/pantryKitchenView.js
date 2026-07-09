/* ==========================================================================
   SARONIL HMS — PANTRY & KITCHEN MANAGEMENT (pantryKitchenView.js)
   Route: #pantryKitchen
   Integrates with Diet & Nutrition (state.dietData) — does not modify dietView.js
   ========================================================================== */

(function () {
  'use strict';

  const WARDS = ['GW(M)', 'GW(F)', 'ICU', 'Semi-Private', 'Private', 'HDU', 'Daycare'];
  const MEALS = ['Breakfast', 'Lunch', 'Dinner', 'Evening Snack'];
  const DIET_TYPES = ['Regular', 'Diabetic', 'Renal', 'Soft', 'High Protein', 'Liquid', 'Tube Feed Tray', 'NPO Hold'];

  function nowTime() {
    return new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false });
  }

  function todayPretty() {
    // Anchored to the demo window (see _HIS_ANCHOR) so the kitchen board's
    // operating date stays consistent with the rest of the prototype.
    const d = window._HIS_ANCHOR ? new Date(window._HIS_ANCHOR + 'T00:00:00') : new Date();
    return d.toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' });
  }

  function ensureDietBridge() {
    if (typeof initializeDietState === 'function') initializeDietState();
    if (!window.state.dietData) {
      window.state.dietData = { patients: [], kitchenDispatches: [], dietOrdersCount: 0 };
    }
    if (!window.state.dietData.kitchenDispatches) {
      window.state.dietData.kitchenDispatches = [];
    }
  }

  function initPantryState() {
    if (window.state.pantryKitchen) return;
    window.state.pantryKitchen = {
      currentMeal: detectCurrentMeal(),
      productionQueue: [
        { id: 'PQ-001', station: 'Hot Kitchen', item: 'Veg Thali × 48', diet: 'Regular', status: 'In Progress', chef: 'Chef Ravi', started: '06:40', eta: '07:30' },
        { id: 'PQ-002', station: 'Hot Kitchen', item: 'Diabetic Plate × 22', diet: 'Diabetic', status: 'Queued', chef: 'Chef Ravi', started: '—', eta: '07:35' },
        { id: 'PQ-003', station: 'Cold Prep', item: 'Fruit & Salad Bowls × 35', diet: 'Regular', status: 'Complete', chef: 'Sunita K.', started: '06:15', eta: '07:00' },
        { id: 'PQ-004', station: 'Bakery', item: 'Soft Diet Porridge × 14', diet: 'Soft', status: 'In Progress', chef: 'Bakery Unit', started: '06:50', eta: '07:40' },
        { id: 'PQ-005', station: 'Therapeutic', item: 'Renal Trays × 8', diet: 'Renal', status: 'Queued', chef: 'Ananya R.', started: '—', eta: '07:45' },
        { id: 'PQ-006', station: 'Tube Feed', item: 'Enteral prep kits × 6', diet: 'Tube Feed Tray', status: 'Complete', chef: 'Diet Tech', started: '06:00', eta: '06:45' }
      ],
      pantryStock: [
        { sku: 'PN-001', name: 'Basmati Rice', category: 'Staples', qty: 85, unit: 'kg', par: 60, expiry: '2026-11-20', location: 'Dry Store A', temp: 'Ambient' },
        { sku: 'PN-002', name: 'Toor Dal', category: 'Staples', qty: 42, unit: 'kg', par: 40, expiry: '2026-09-15', location: 'Dry Store A', temp: 'Ambient' },
        { sku: 'PN-003', name: 'Fresh Milk (toned)', category: 'Dairy', qty: 28, unit: 'L', par: 50, expiry: '2026-07-10', location: 'Cold Room 1', temp: '2–4°C' },
        { sku: 'PN-004', name: 'Chicken Breast', category: 'Protein', qty: 18, unit: 'kg', par: 25, expiry: '2026-07-09', location: 'Cold Room 2', temp: '0–4°C' },
        { sku: 'PN-005', name: 'Mixed Vegetables', category: 'Produce', qty: 35, unit: 'kg', par: 30, expiry: '2026-07-08', location: 'Cold Room 1', temp: '2–4°C' },
        { sku: 'PN-006', name: 'Olive Oil', category: 'Staples', qty: 12, unit: 'L', par: 15, expiry: '2027-01-10', location: 'Dry Store B', temp: 'Ambient' },
        { sku: 'PN-007', name: 'Sugar (diabetic substitute)', category: 'Therapeutic', qty: 8, unit: 'kg', par: 10, expiry: '2026-12-01', location: 'Therapeutic Rack', temp: 'Ambient' },
        { sku: 'PN-008', name: 'Eggs (farm fresh)', category: 'Protein', qty: 240, unit: 'pcs', par: 300, expiry: '2026-07-12', location: 'Cold Room 1', temp: '2–4°C' },
        { sku: 'PN-009', name: 'Atta / Whole Wheat Flour', category: 'Staples', qty: 55, unit: 'kg', par: 45, expiry: '2026-10-05', location: 'Dry Store A', temp: 'Ambient' },
        { sku: 'PN-010', name: 'Nutren 1.0 (enteral)', category: 'Therapeutic', qty: 24, unit: 'cartons', par: 20, expiry: '2026-08-30', location: 'Therapeutic Rack', temp: 'Ambient' }
      ],
      issueSlips: [
        { id: 'IS-2407-018', meal: 'Breakfast', items: 'Rice 12kg, Dal 4kg, Milk 15L', issuedTo: 'Hot Kitchen', by: 'Storekeeper Meena', time: '06:10', status: 'Closed' },
        { id: 'IS-2407-019', meal: 'Lunch', items: 'Chicken 8kg, Veg 15kg, Oil 2L', issuedTo: 'Hot Kitchen', by: 'Storekeeper Meena', time: '10:45', status: 'Open' }
      ],
      haccpLogs: [
        { zone: 'Cold Room 1', reading: '3.2°C', range: '2–4°C', time: '08:00', staff: 'Meena S.', status: 'OK' },
        { zone: 'Cold Room 2', reading: '2.8°C', range: '0–4°C', time: '08:00', staff: 'Meena S.', status: 'OK' },
        { zone: 'Hot Holding', reading: '68°C', range: '>63°C', time: '12:30', staff: 'Chef Ravi', status: 'OK' },
        { zone: 'Cold Room 1', reading: '6.1°C', range: '2–4°C', time: '14:00', staff: 'Meena S.', status: 'Breach' }
      ],
      procurementRequests: [
        { id: 'PR-044', item: 'Fresh Milk (toned)', qty: '100 L', reason: 'Below par + weekend cover', status: 'Pending Approval', raised: '08:15' },
        { id: 'PR-045', item: 'Chicken Breast', qty: '40 kg', reason: 'High protein diet surge', status: 'PO Raised', raised: '09:00' }
      ],
      pendingDispatches: [
        { ward: 'GW(M)', meal: 'Lunch', trays: 42, diets: 'Reg 28 · Diab 8 · Soft 6', status: 'Ready', readyAt: '12:48' },
        { ward: 'GW(F)', meal: 'Lunch', trays: 38, diets: 'Reg 30 · Renal 4 · Diab 4', status: 'Packing', readyAt: '—' },
        { ward: 'ICU', meal: 'Lunch', trays: 12, diets: 'Therapeutic 6 · Tube 4 · Liquid 2', status: 'In Production', readyAt: '—' },
        { ward: 'Semi-Private', meal: 'Lunch', trays: 18, diets: 'Reg 14 · Diab 4', status: 'Ready', readyAt: '12:50' }
      ]
    };
  }

  function detectCurrentMeal() {
    const h = new Date().getHours();
    if (h < 10) return 'Breakfast';
    if (h < 15) return 'Lunch';
    if (h < 20) return 'Dinner';
    return 'Evening Snack';
  }

  function getDietPatientSummary() {
    ensureDietBridge();
    const pts = window.state.dietData.patients || [];
    const npo = (window.state.dietData.activeNPOAlerts || []).length;
    const oral = pts.filter(function (p) { return p.route === 'Oral'; }).length;
    const tube = pts.filter(function (p) { return (p.route || '').includes('Tube'); }).length;
    const tpn = pts.filter(function (p) { return (p.route || '').includes('TPN') || (p.route || '').includes('Central'); }).length;
    return { total: pts.length, oral: oral, tube: tube, tpn: tpn, npo: npo, orders: window.state.dietData.dietOrdersCount || pts.length };
  }

  function getMealPlanRows() {
    ensureDietBridge();
    const pts = window.state.dietData.patients || [];
    const counts = {};
    DIET_TYPES.forEach(function (d) { counts[d] = 0; });
    pts.forEach(function (p) {
      const rx = (p.dietRx || '').toLowerCase();
      if (p.route && p.route.includes('NG')) counts['Tube Feed Tray']++;
      else if (rx.includes('renal')) counts['Renal']++;
      else if (rx.includes('diab') || rx.includes('dm')) counts['Diabetic']++;
      else if (rx.includes('soft') || rx.includes('low fat')) counts['Soft']++;
      else if (rx.includes('protein')) counts['High Protein']++;
      else if (rx.includes('liquid') || rx.includes('clear')) counts['Liquid']++;
      else if (rx.includes('npo') || p.status === 'NPO Lock') counts['NPO Hold']++;
      else counts['Regular']++;
    });
    return DIET_TYPES.map(function (d) {
      return { diet: d, count: counts[d], wards: WARDS.slice(0, 3).join(', ') + '…' };
    }).filter(function (r) { return r.count > 0 || r.diet === 'Regular' || r.diet === 'Diabetic'; });
  }

  function stockStatus(item) {
    if (item.qty <= item.par * 0.5) return { label: 'Critical', cls: 'pk-badge-red' };
    if (item.qty < item.par) return { label: 'Below Par', cls: 'pk-badge-amber' };
    return { label: 'OK', cls: 'pk-badge-green' };
  }

  function injectStyles() {
    if (document.getElementById('pk-styles')) return;
    const s = document.createElement('style');
    s.id = 'pk-styles';
    s.textContent = `
      .pk-wrap { display:flex; flex-direction:column; gap:1rem; text-align:left; }
      .pk-tab-bar { display:flex; gap:4px; background:var(--bg-base-elevated); padding:4px; border-radius:6px; border:1px solid var(--border-color); flex-wrap:wrap; }
      .pk-tab { background:transparent; border:none; padding:6px 12px; font-size:0.78rem; font-weight:700; color:var(--text-muted); cursor:pointer; border-radius:4px; }
      .pk-tab.active { background:var(--primary); color:#fff; }
      .pk-kpi-row { display:grid; grid-template-columns:repeat(5,1fr); gap:0.65rem; }
      @media(max-width:1000px){ .pk-kpi-row { grid-template-columns:1fr 1fr; } }
      .pk-kpi { background:var(--bg-surface); border:1px solid var(--border-color); border-radius:8px; padding:0.75rem; text-align:center; cursor:pointer; transition:box-shadow .15s; }
      .pk-kpi:hover { box-shadow:var(--shadow-sm); }
      .pk-kpi-val { font-size:1.3rem; font-weight:800; color:var(--primary); }
      .pk-kpi-lbl { font-size:0.65rem; font-weight:700; color:var(--text-muted); text-transform:uppercase; margin-top:2px; }
      .pk-journey { display:grid; grid-template-columns:repeat(5,1fr); gap:0.5rem; margin-bottom:0.5rem; }
      @media(max-width:900px){ .pk-journey { grid-template-columns:1fr; } }
      .pk-step { border:1px solid var(--border-color); border-radius:8px; padding:0.65rem; background:var(--bg-surface); position:relative; }
      .pk-step.done { border-color:#86efac; background:#f0fdf4; }
      .pk-step.active { border-color:#93c5fd; background:#eff6ff; box-shadow:0 0 0 2px #bfdbfe; }
      .pk-step-num { font-size:0.65rem; font-weight:800; color:var(--text-muted); }
      .pk-step-title { font-size:0.78rem; font-weight:800; margin-top:2px; }
      .pk-step-desc { font-size:0.68rem; color:var(--text-secondary); margin-top:2px; }
      .pk-badge-red { background:#fee2e2; color:#b91c1c; padding:2px 8px; border-radius:999px; font-size:0.65rem; font-weight:700; }
      .pk-badge-amber { background:#fef3c7; color:#b45309; padding:2px 8px; border-radius:999px; font-size:0.65rem; font-weight:700; }
      .pk-badge-green { background:#dcfce7; color:#166534; padding:2px 8px; border-radius:999px; font-size:0.65rem; font-weight:700; }
      .pk-badge-blue { background:#dbeafe; color:#1d4ed8; padding:2px 8px; border-radius:999px; font-size:0.65rem; font-weight:700; }
      .pk-timeline { border-left:3px solid var(--border-color); margin-left:8px; padding-left:14px; }
      .pk-tl-item { margin-bottom:10px; font-size:0.75rem; }
      .pk-link-diet { font-size:0.72rem; color:var(--primary); font-weight:700; cursor:pointer; text-decoration:underline; }
    `;
    document.head.appendChild(s);
  }

  function getActiveTab() {
    return localStorage.getItem('saronil_pk_tab') || 'dashboard';
  }

  function getActiveRole() {
    return localStorage.getItem('saronil_pk_role') || 'Kitchen Manager';
  }

  function renderLayout(container) {
    injectStyles();
    initPantryState();
    ensureDietBridge();

    const tab = getActiveTab();
    const role = getActiveRole();
    const pk = window.state.pantryKitchen;
    const summary = getDietPatientSummary();
    pk.currentMeal = detectCurrentMeal();

    container.innerHTML = `
      <div class="pk-wrap">
        <div style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:10px;">
          <div>
            <h2 style="margin:0; font-weight:800;">🍳 Pantry & Kitchen Management</h2>
            <p style="margin:4px 0 0; font-size:0.75rem; color:var(--text-muted);">
              End-to-end hospital food service — pantry inventory, production, HACCP compliance & ward dispatch
              <span class="pk-link-diet" onclick="window.router.navigate('diet')">↗ Open Diet & Nutrition</span>
            </p>
          </div>
          <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
            <span style="font-size:0.72rem; font-weight:700; color:var(--text-secondary);">${todayPretty()}</span>
            <span class="pk-badge-blue">Active Meal: ${pk.currentMeal}</span>
            <select id="pk-role" class="form-select" style="width:170px; font-size:0.72rem;" onchange="window.pkChangeRole(this.value)">
              ${['Kitchen Manager', 'Head Chef', 'Pantry Storekeeper', 'Diet Kitchen Coordinator', 'Ward Dispatcher', 'Administrator'].map(function (r) {
                return '<option value="' + r + '"' + (r === role ? ' selected' : '') + '>' + r + '</option>';
              }).join('')}
            </select>
          </div>
        </div>

        <div class="pk-kpi-row">
          <div class="pk-kpi" onclick="window.pkSwitchTab('production')">
            <div class="pk-kpi-val">${summary.orders}</div><div class="pk-kpi-lbl">Diet Orders (synced)</div>
          </div>
          <div class="pk-kpi" onclick="window.pkSwitchTab('production')">
            <div class="pk-kpi-val">${pk.productionQueue.filter(function (q) { return q.status !== 'Complete'; }).length}</div><div class="pk-kpi-lbl">Production Jobs Open</div>
          </div>
          <div class="pk-kpi" onclick="window.pkSwitchTab('pantry')">
            <div class="pk-kpi-val">${pk.pantryStock.filter(function (s) { return s.qty < s.par; }).length}</div><div class="pk-kpi-lbl">Below Par Items</div>
          </div>
          <div class="pk-kpi" onclick="window.pkSwitchTab('dispatch')">
            <div class="pk-kpi-val">${pk.pendingDispatches.filter(function (d) { return d.status === 'Ready'; }).length}</div><div class="pk-kpi-lbl">Ready to Dispatch</div>
          </div>
          <div class="pk-kpi" onclick="window.pkSwitchTab('haccp')">
            <div class="pk-kpi-val">${pk.haccpLogs.filter(function (l) { return l.status === 'Breach'; }).length}</div><div class="pk-kpi-lbl">HACCP Alerts</div>
          </div>
        </div>

        <div class="pk-tab-bar">
          ${[
            ['dashboard', '📊 Command Center'],
            ['production', '👨‍🍳 Production Plan'],
            ['pantry', '🏪 Pantry Store'],
            ['dispatch', '🚚 Ward Dispatch'],
            ['haccp', '🌡 HACCP & Safety'],
            ['procurement', '📦 Procurement'],
            ['reports', '📈 Reports']
          ].map(function (t) {
            return '<button class="pk-tab ' + (tab === t[0] ? 'active' : '') + '" onclick="window.pkSwitchTab(\'' + t[0] + '\')">' + t[1] + '</button>';
          }).join('')}
        </div>

        <div id="pk-tab-body"></div>
      </div>
    `;

    const body = document.getElementById('pk-tab-body');
    if (tab === 'dashboard') renderDashboard(body, role, pk, summary);
    else if (tab === 'production') renderProduction(body, role, pk, summary);
    else if (tab === 'pantry') renderPantry(body, role, pk);
    else if (tab === 'dispatch') renderDispatch(body, role, pk);
    else if (tab === 'haccp') renderHaccp(body, role, pk);
    else if (tab === 'procurement') renderProcurement(body, role, pk);
    else if (tab === 'reports') renderReports(body, pk, summary);
  }

  function renderJourney(activeStep) {
    const steps = [
      { n: 1, title: 'Plan', desc: 'Sync diet orders & meal counts', tab: 'production' },
      { n: 2, title: 'Issue', desc: 'Release ingredients from pantry', tab: 'pantry' },
      { n: 3, title: 'Cook', desc: 'Run production stations', tab: 'production' },
      { n: 4, title: 'Dispatch', desc: 'Send trays to wards', tab: 'dispatch' },
      { n: 5, title: 'Confirm', desc: 'Nurse receipt in Diet module', tab: 'dispatch' }
    ];
    return '<div class="pk-journey">' + steps.map(function (s) {
      const cls = s.n < activeStep ? 'done' : (s.n === activeStep ? 'active' : '');
      return '<div class="pk-step ' + cls + '" onclick="window.pkSwitchTab(\'' + s.tab + '\')"><div class="pk-step-num">STEP ' + s.n + '</div><div class="pk-step-title">' + s.title + '</div><div class="pk-step-desc">' + s.desc + '</div></div>';
    }).join('') + '</div>';
  }

  function renderDashboard(body, role, pk, summary) {
    const breaches = pk.haccpLogs.filter(function (l) { return l.status === 'Breach'; });
    body.innerHTML = `
      ${renderJourney(3)}
      <div style="display:grid; grid-template-columns:1.4fr 1fr; gap:1rem;">
        <div class="card" style="margin:0;">
          <div class="card-header"><h3 class="card-title" style="font-size:0.9rem;">Today's Meal Service Timeline — ${pk.currentMeal}</h3></div>
          <div class="card-body">
            <div class="pk-timeline">
              <div class="pk-tl-item"><strong>06:00</strong> — Pantry issue slip IS-2407-018 closed · Breakfast staples issued</div>
              <div class="pk-tl-item"><strong>07:55</strong> — Breakfast dispatched to GW(M), GW(F), ICU <span class="pk-badge-green">Complete</span></div>
              <div class="pk-tl-item"><strong>10:45</strong> — Lunch issue slip IS-2407-019 open · Awaiting chef sign-off</div>
              <div class="pk-tl-item"><strong>12:48</strong> — GW(M) lunch trays <span class="pk-badge-blue">Ready</span> · Semi-Private ready 12:50</div>
              <div class="pk-tl-item"><strong>Now</strong> — ${pk.pendingDispatches.filter(function (d) { return d.status !== 'Ready'; }).length} wards still in production/packing</div>
            </div>
            <div style="margin-top:0.75rem; display:flex; gap:0.5rem; flex-wrap:wrap;">
              <button class="btn btn-primary btn-sm" onclick="window.pkSwitchTab('production')">Start Production Review</button>
              <button class="btn btn-secondary btn-sm" onclick="window.pkSwitchTab('dispatch')">Open Dispatch Board</button>
            </div>
          </div>
        </div>
        <div style="display:flex; flex-direction:column; gap:0.75rem;">
          <div class="card" style="margin:0;">
            <div class="card-header"><h3 class="card-title" style="font-size:0.85rem;">Diet Module Sync</h3></div>
            <div class="card-body" style="font-size:0.75rem;">
              <p style="margin:0 0 6px;"><strong>${summary.total}</strong> patients on active diet charts</p>
              <p style="margin:0 0 6px;">Oral <strong>${summary.oral}</strong> · Tube <strong>${summary.tube}</strong> · TPN <strong>${summary.tpn}</strong></p>
              <p style="margin:0; color:#b45309;">NPO alerts: <strong>${summary.npo}</strong></p>
            </div>
          </div>
          ${breaches.length ? `
          <div class="card" style="margin:0; border-color:#fca5a5;">
            <div class="card-header" style="background:#fef2f2;"><h3 class="card-title" style="font-size:0.85rem; color:#b91c1c;">⚠ HACCP Breach</h3></div>
            <div class="card-body" style="font-size:0.72rem;">
              ${breaches.map(function (b) {
                return '<p style="margin:0 0 4px;"><strong>' + b.zone + '</strong> ' + b.reading + ' at ' + b.time + '</p>';
              }).join('')}
              <button class="btn btn-secondary btn-sm" style="margin-top:6px;" onclick="window.pkSwitchTab('haccp')">Log Corrective Action</button>
            </div>
          </div>` : ''}
        </div>
      </div>
    `;
  }

  function renderProduction(body, role, pk, summary) {
    const plan = getMealPlanRows();
    body.innerHTML = `
      ${renderJourney(1)}
      <div style="display:grid; grid-template-columns:1fr 1.6fr; gap:1rem;">
        <div class="card" style="margin:0;">
          <div class="card-header"><h3 class="card-title" style="font-size:0.85rem;">Meal Plan — ${pk.currentMeal} (from Diet Orders)</h3></div>
          <div class="card-body" style="padding:8px;">
            <table class="custom-table" style="font-size:0.72rem; width:100%;">
              <thead><tr><th>Diet Type</th><th>Trays</th></tr></thead>
              <tbody>
                ${plan.map(function (r) {
                  return '<tr><td>' + r.diet + '</td><td><strong>' + r.count + '</strong></td></tr>';
                }).join('')}
              </tbody>
            </table>
            <p style="font-size:0.68rem; color:var(--text-muted); margin:8px 0 0;">Counts derived from Diet & Nutrition patient charts. Update diets in <span class="pk-link-diet" onclick="window.router.navigate('diet')">Diet module</span>.</p>
          </div>
        </div>
        <div class="card" style="margin:0;">
          <div class="card-header" style="display:flex; justify-content:space-between; align-items:center;">
            <h3 class="card-title" style="font-size:0.85rem;">Kitchen Production Queue</h3>
            <button class="btn btn-primary btn-sm" onclick="window.pkAddProductionJob()">+ Add Job</button>
          </div>
          <div class="card-body" style="padding:8px;">
            <table class="custom-table" style="font-size:0.7rem; width:100%;">
              <thead><tr><th>Station</th><th>Item</th><th>Chef</th><th>Status</th><th>ETA</th><th></th></tr></thead>
              <tbody>
                ${pk.productionQueue.map(function (q) {
                  const st = q.status === 'Complete' ? 'pk-badge-green' : (q.status === 'In Progress' ? 'pk-badge-blue' : 'pk-badge-amber');
                  return '<tr><td>' + q.station + '</td><td>' + q.item + '</td><td>' + q.chef + '</td><td><span class="' + st + '">' + q.status + '</span></td><td>' + q.eta + '</td><td>' +
                    (q.status !== 'Complete' ? '<button class="btn btn-secondary btn-sm" style="padding:2px 6px;font-size:0.65rem;" onclick="window.pkAdvanceJob(\'' + q.id + '\')">Advance</button>' : '✓') +
                    '</td></tr>';
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  }

  function renderPantry(body, role, pk) {
    body.innerHTML = `
      ${renderJourney(2)}
      <div class="card" style="margin:0;">
        <div class="card-header" style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px;">
          <h3 class="card-title" style="font-size:0.85rem;">Pantry Inventory & Cold Chain</h3>
          <div style="display:flex; gap:6px;">
            <button class="btn btn-secondary btn-sm" onclick="window.pkIssueSlip()">📋 New Issue Slip</button>
            <button class="btn btn-primary btn-sm" onclick="window.pkRaiseProcurement()">+ Reorder Request</button>
          </div>
        </div>
        <div class="card-body" style="padding:8px;">
          <table class="custom-table" style="font-size:0.72rem; width:100%;">
            <thead><tr><th>SKU</th><th>Item</th><th>Category</th><th>Qty</th><th>Par</th><th>Expiry</th><th>Location</th><th>Status</th></tr></thead>
            <tbody>
              ${pk.pantryStock.map(function (s) {
                const st = stockStatus(s);
                return '<tr><td>' + s.sku + '</td><td><strong>' + s.name + '</strong></td><td>' + s.category + '</td><td>' + s.qty + ' ' + s.unit + '</td><td>' + s.par + '</td><td>' + s.expiry + '</td><td>' + s.location + '<br><span style="font-size:0.65rem;color:var(--text-muted);">' + s.temp + '</span></td><td><span class="' + st.cls + '">' + st.label + '</span></td></tr>';
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
      <div class="card" style="margin:0;">
        <div class="card-header"><h3 class="card-title" style="font-size:0.85rem;">Recent Issue Slips</h3></div>
        <div class="card-body" style="padding:8px;">
          <table class="custom-table" style="font-size:0.7rem; width:100%;">
            <thead><tr><th>Slip ID</th><th>Meal</th><th>Items</th><th>Issued To</th><th>By</th><th>Time</th><th>Status</th></tr></thead>
            <tbody>
              ${pk.issueSlips.map(function (sl) {
                return '<tr><td>' + sl.id + '</td><td>' + sl.meal + '</td><td>' + sl.items + '</td><td>' + sl.issuedTo + '</td><td>' + sl.by + '</td><td>' + sl.time + '</td><td>' + sl.status + '</td></tr>';
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  function renderDispatch(body, role, pk) {
    ensureDietBridge();
    const dispatches = window.state.dietData.kitchenDispatches || [];
    body.innerHTML = `
      ${renderJourney(4)}
      <div style="display:grid; grid-template-columns:1.2fr 1fr; gap:1rem;">
        <div class="card" style="margin:0;">
          <div class="card-header"><h3 class="card-title" style="font-size:0.85rem;">Ward Dispatch Board — ${pk.currentMeal}</h3></div>
          <div class="card-body" style="padding:8px;">
            <table class="custom-table" style="font-size:0.72rem; width:100%;">
              <thead><tr><th>Ward</th><th>Trays</th><th>Diet Mix</th><th>Status</th><th>Ready</th><th></th></tr></thead>
              <tbody>
                ${pk.pendingDispatches.map(function (d, idx) {
                  const st = d.status === 'Ready' ? 'pk-badge-green' : (d.status === 'Packing' ? 'pk-badge-blue' : 'pk-badge-amber');
                  return '<tr><td><strong>' + d.ward + '</strong></td><td>' + d.trays + '</td><td style="font-size:0.65rem;">' + d.diets + '</td><td><span class="' + st + '">' + d.status + '</span></td><td>' + d.readyAt + '</td><td>' +
                    (d.status === 'Ready' ? '<button class="btn btn-primary btn-sm" style="padding:2px 8px;font-size:0.65rem;" onclick="window.pkConfirmDispatch(' + idx + ')">Dispatch</button>' : '—') +
                    '</td></tr>';
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>
        <div class="card" style="margin:0;">
          <div class="card-header"><h3 class="card-title" style="font-size:0.85rem;">Dispatch Log (shared with Diet module)</h3></div>
          <div class="card-body" style="padding:8px; max-height:320px; overflow:auto;">
            <table class="custom-table" style="font-size:0.7rem; width:100%;">
              <thead><tr><th>Meal</th><th>Ward</th><th>Sent</th><th>Receiver</th><th>Delivered</th></tr></thead>
              <tbody>
                ${dispatches.length ? dispatches.map(function (k) {
                  return '<tr><td>' + k.meal + '</td><td>' + k.ward + '</td><td>' + k.dispatched + '</td><td>' + k.receiver + '</td><td>' + k.deliveryTime + '</td></tr>';
                }).join('') : '<tr><td colspan="5" style="text-align:center;color:var(--text-muted);">No dispatches yet today</td></tr>'}
              </tbody>
            </table>
            <p style="font-size:0.68rem; color:var(--text-muted); margin-top:8px;">Entries appear in Diet → Ward Diet Sheets → Kitchen Dispatch Log.</p>
          </div>
        </div>
      </div>
    `;
  }

  function renderHaccp(body, role, pk) {
    body.innerHTML = `
      <div class="card" style="margin:0;">
        <div class="card-header" style="display:flex; justify-content:space-between; align-items:center;">
          <h3 class="card-title" style="font-size:0.85rem;">HACCP Temperature & Hygiene Log</h3>
          <button class="btn btn-primary btn-sm" onclick="window.pkLogTemperature()">+ Log Reading</button>
        </div>
        <div class="card-body" style="padding:8px;">
          <table class="custom-table" style="font-size:0.72rem; width:100%;">
            <thead><tr><th>Zone</th><th>Reading</th><th>Acceptable Range</th><th>Time</th><th>Staff</th><th>Status</th><th></th></tr></thead>
            <tbody>
              ${pk.haccpLogs.map(function (l, i) {
                const st = l.status === 'OK' ? 'pk-badge-green' : 'pk-badge-red';
                return '<tr><td>' + l.zone + '</td><td><strong>' + l.reading + '</strong></td><td>' + l.range + '</td><td>' + l.time + '</td><td>' + l.staff + '</td><td><span class="' + st + '">' + l.status + '</span></td><td>' +
                  (l.status === 'Breach' ? '<button class="btn btn-secondary btn-sm" style="font-size:0.65rem;padding:2px 6px;" onclick="window.pkResolveBreach(' + i + ')">Corrective Action</button>' : '') +
                  '</td></tr>';
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  function renderProcurement(body, role, pk) {
    body.innerHTML = `
      <div class="card" style="margin:0;">
        <div class="card-header" style="display:flex; justify-content:space-between;">
          <h3 class="card-title" style="font-size:0.85rem;">Procurement & Reorder Requests</h3>
          <button class="btn btn-primary btn-sm" onclick="window.pkRaiseProcurement()">+ New Request</button>
        </div>
        <div class="card-body" style="padding:8px;">
          <table class="custom-table" style="font-size:0.72rem; width:100%;">
            <thead><tr><th>PR ID</th><th>Item</th><th>Qty</th><th>Reason</th><th>Raised</th><th>Status</th></tr></thead>
            <tbody>
              ${pk.procurementRequests.map(function (pr) {
                return '<tr><td>' + pr.id + '</td><td>' + pr.item + '</td><td>' + pr.qty + '</td><td>' + pr.reason + '</td><td>' + pr.raised + '</td><td>' + pr.status + '</td></tr>';
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  function renderReports(body, pk, summary) {
    const belowPar = pk.pantryStock.filter(function (s) { return s.qty < s.par; });
    body.innerHTML = `
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem;">
        <div class="card" style="margin:0;">
          <div class="card-header"><h3 class="card-title" style="font-size:0.85rem;">Daily Kitchen Summary</h3></div>
          <div class="card-body" style="font-size:0.78rem;">
            <p>Date: <strong>${todayPretty()}</strong></p>
            <p>Meal session: <strong>${pk.currentMeal}</strong></p>
            <p>Diet orders synced: <strong>${summary.orders}</strong></p>
            <p>Production jobs completed: <strong>${pk.productionQueue.filter(function (q) { return q.status === 'Complete'; }).length} / ${pk.productionQueue.length}</strong></p>
            <p>Dispatches today: <strong>${(window.state.dietData.kitchenDispatches || []).length}</strong></p>
            <button class="btn btn-secondary btn-sm" style="margin-top:8px;" onclick="window.pkPrintSummary()">🖨 Print Summary</button>
          </div>
        </div>
        <div class="card" style="margin:0;">
          <div class="card-header"><h3 class="card-title" style="font-size:0.85rem;">Stock Alerts</h3></div>
          <div class="card-body" style="font-size:0.75rem;">
            ${belowPar.length ? belowPar.map(function (s) {
              return '<p style="margin:0 0 6px;">⚠ <strong>' + s.name + '</strong> — ' + s.qty + ' ' + s.unit + ' (par ' + s.par + ')</p>';
            }).join('') : '<p style="color:var(--text-muted);">All items above par level.</p>'}
          </div>
        </div>
      </div>
    `;
  }

  window.views.pantryKitchen = function (container) {
    const pageTitleEl = document.getElementById('active-page-title');
    if (pageTitleEl) pageTitleEl.textContent = 'Pantry & Kitchen Management';
    renderLayout(container);
  };

  window.pkSwitchTab = function (tab) {
    localStorage.setItem('saronil_pk_tab', tab);
    window.views.pantryKitchen(document.getElementById('main-content'));
  };

  window.pkChangeRole = function (role) {
    localStorage.setItem('saronil_pk_role', role);
    const tabMap = {
      'Pantry Storekeeper': 'pantry',
      'Head Chef': 'production',
      'Ward Dispatcher': 'dispatch',
      'Diet Kitchen Coordinator': 'dashboard'
    };
    if (tabMap[role]) localStorage.setItem('saronil_pk_tab', tabMap[role]);
    window.views.pantryKitchen(document.getElementById('main-content'));
  };

  window.pkAdvanceJob = function (id) {
    initPantryState();
    const q = window.state.pantryKitchen.productionQueue.find(function (x) { return x.id === id; });
    if (!q) return;
    if (q.status === 'Queued') q.status = 'In Progress';
    else if (q.status === 'In Progress') q.status = 'Complete';
    window.pkSwitchTab('production');
  };

  window.pkAddProductionJob = function () {
    const item = prompt('Production item (e.g. Veg Thali × 20):');
    if (!item) return;
    initPantryState();
    window.state.pantryKitchen.productionQueue.push({
      id: 'PQ-' + String(Math.floor(Math.random() * 900) + 100),
      station: 'Hot Kitchen', item: item, diet: 'Regular', status: 'Queued',
      chef: 'Chef Ravi', started: '—', eta: nowTime()
    });
    window.pkSwitchTab('production');
  };

  window.pkIssueSlip = function () {
    initPantryState();
    const pk = window.state.pantryKitchen;
    const id = 'IS-2407-' + String(pk.issueSlips.length + 20).padStart(3, '0');
    pk.issueSlips.unshift({
      id: id, meal: pk.currentMeal, items: 'As per production plan', issuedTo: 'Hot Kitchen',
      by: 'Storekeeper Meena', time: nowTime(), status: 'Open'
    });
    alert('Issue slip ' + id + ' created for ' + pk.currentMeal + '.');
    window.pkSwitchTab('pantry');
  };

  window.pkRaiseProcurement = function () {
    const item = prompt('Item to reorder:');
    if (!item) return;
    const qty = prompt('Quantity needed:') || 'TBD';
    initPantryState();
    window.state.pantryKitchen.procurementRequests.unshift({
      id: 'PR-' + String(Math.floor(Math.random() * 900) + 50),
      item: item, qty: qty, reason: 'Manual reorder from pantry', status: 'Pending Approval', raised: nowTime()
    });
    window.pkSwitchTab('procurement');
  };

  window.pkConfirmDispatch = function (idx) {
    initPantryState();
    ensureDietBridge();
    const pk = window.state.pantryKitchen;
    const d = pk.pendingDispatches[idx];
    if (!d) return;
    const nurse = prompt('Ward nurse receiving trays:', 'Nurse Kavitha');
    if (!nurse) return;
    const t = nowTime();
    window.state.dietData.kitchenDispatches.push({
      meal: d.meal || pk.currentMeal,
      ward: d.ward,
      dispatched: t,
      receiver: nurse,
      deliveryTime: t
    });
    d.status = 'Dispatched';
    alert('✓ ' + d.ward + ' — ' + (d.meal || pk.currentMeal) + ' dispatched. Logged in Diet module.');
    window.pkSwitchTab('dispatch');
  };

  window.pkLogTemperature = function () {
    const zone = prompt('Zone (e.g. Cold Room 1):', 'Cold Room 1');
    if (!zone) return;
    const reading = prompt('Temperature reading:', '3.5°C');
    if (!reading) return;
    initPantryState();
    const num = parseFloat(reading);
    let status = 'OK';
    if (zone.toLowerCase().includes('cold') && num > 4) status = 'Breach';
    if (zone.toLowerCase().includes('hot') && num < 63) status = 'Breach';
    window.state.pantryKitchen.haccpLogs.unshift({
      zone: zone, reading: reading, range: zone.includes('Hot') ? '>63°C' : '2–4°C',
      time: nowTime(), staff: 'Logged by ' + getActiveRole(), status: status
    });
    window.pkSwitchTab('haccp');
  };

  window.pkResolveBreach = function (i) {
    const action = prompt('Corrective action taken:', 'Adjusted thermostat · rechecked in 30 min');
    if (!action) return;
    initPantryState();
    window.state.pantryKitchen.haccpLogs[i].status = 'Resolved';
    alert('Corrective action recorded: ' + action);
    window.pkSwitchTab('haccp');
  };

  window.pkPrintSummary = function () {
    const w = window.open('', '_blank');
    const pk = window.state.pantryKitchen;
    const summary = getDietPatientSummary();
    w.document.write('<html><head><title>Kitchen Daily Summary</title></head><body style="font-family:sans-serif;padding:24px"><h2>Pantry & Kitchen Daily Summary</h2><p>' + todayPretty() + '</p><ul><li>Meal: ' + pk.currentMeal + '</li><li>Diet orders: ' + summary.orders + '</li><li>Dispatches: ' + (window.state.dietData.kitchenDispatches || []).length + '</li></ul></body></html>');
    w.document.close();
    w.print();
  };

})();
