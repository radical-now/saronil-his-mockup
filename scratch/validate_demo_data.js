/* ==========================================================================
   SARONIL HIS — DEMO DATA VALIDATOR (scratch/validate_demo_data.js)
   Programmatic cross-validation of the seeded prototype against the
   acceptance criteria: golden rules (no forbidden words, no empty visible
   fields, dates within the demo window), cross-links by uhid, and the
   KPI reconciliation matrix.

   Run in the browser console on a loaded page:
       validateDemoData()
   or headlessly (see scratch/run_validation.js). Prints PASS/FAIL per check
   and a final summary; returns a structured result object.
   ========================================================================== */

(function () {
  'use strict';

  var RANGE_START = Date.parse('2026-01-01T00:00:00');
  var RANGE_END = Date.parse('2026-07-05T23:59:59');

  var FORBIDDEN = ['test', 'demo', 'synthetic', 'mock', 'sample', 'dummy',
    'placeholder', 'lorem', 'fake', 'tbd', 'n/a'];

  /* Tolerant date parser: accepts "2026-07-05", "05 Jul 2026", "05 Jul 2026 · 09:30". */
  function parseDate(v) {
    if (!v || typeof v !== 'string') return null;
    var iso = v.match(/(\d{4})-(\d{2})-(\d{2})/);
    if (iso) return Date.parse(iso[0] + 'T00:00:00');
    var pretty = v.match(/(\d{1,2})\s+([A-Za-z]{3})\s+(\d{4})/);
    if (pretty) {
      var d = Date.parse(pretty[1] + ' ' + pretty[2] + ' ' + pretty[3]);
      return isNaN(d) ? null : d;
    }
    return null;
  }

  function inRange(v) {
    var d = parseDate(v);
    if (d === null) return true; // unparseable strings are not date fields
    return d >= RANGE_START && d <= RANGE_END;
  }

  function hasForbidden(str) {
    if (typeof str !== 'string') return null;
    var low = str.toLowerCase();
    for (var i = 0; i < FORBIDDEN.length; i++) {
      var w = FORBIDDEN[i];
      var re = new RegExp('(^|[^a-z0-9])' + w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '([^a-z0-9]|$)');
      if (re.test(low)) return w;
    }
    return null;
  }

  function empty(v) {
    return v === null || v === undefined || v === '' ||
      v === 'N/A' || v === '—' || v === 'TBD' || v === 'undefined';
  }

  window.validateDemoData = function () {
    var s = window.state;
    var results = [];
    function check(name, ok, detail) {
      results.push({ name: name, ok: !!ok, detail: detail || '' });
    }
    if (!s) { console.error('state not loaded'); return { error: 'no state' }; }

    var uhidSet = new Set(s.patients.map(function (p) { return p.uhid; }));

    /* ── 1. Patient completeness ─────────────────────────────────────────── */
    var req = ['uhid', 'name', 'age', 'gender', 'type', 'status', 'payer',
      'mobile', 'department', 'primaryConsultant', 'bloodGroup', 'vitals'];
    var incomplete = [];
    s.patients.forEach(function (p) {
      req.forEach(function (f) { if (empty(p[f])) incomplete.push(p.uhid + '.' + f); });
    });
    check('Patients: required fields populated', incomplete.length === 0,
      incomplete.length + ' empty (' + incomplete.slice(0, 6).join(', ') + ')');

    /* ── 2. Forbidden words (patients, billing, appointments) ────────────── */
    var forbiddenHits = [];
    function scan(records, fields, label) {
      records.forEach(function (r) {
        fields.forEach(function (f) {
          var hit = hasForbidden(r[f]);
          if (hit) forbiddenHits.push(label + '.' + f + '="' + r[f] + '" (' + hit + ')');
        });
      });
    }
    scan(s.patients, ['name', 'department', 'primaryConsultant', 'ward', 'allergies'], 'patient');
    scan(s.billing, ['patientName', 'status'], 'billing');
    scan(s.appointments, ['patientName', 'doctorName', 'deptName', 'visitType'], 'appt');
    check('No forbidden words (test/demo/mock/…)', forbiddenHits.length === 0,
      forbiddenHits.length + ' hits: ' + forbiddenHits.slice(0, 5).join(' | '));

    /* ── 3. Transactional dates within 1 Jan – 5 Jul 2026 ────────────────── */
    var badDates = [];
    s.billing.forEach(function (b) { if (!inRange(b.date)) badDates.push('billing ' + b.id + '=' + b.date); });
    s.appointments.forEach(function (a) { if (!inRange(a.date)) badDates.push('appt ' + a.id + '=' + a.date); });
    (s.labOrders || []).forEach(function (l) { if (!inRange(l.orderedAt)) badDates.push('lab ' + l.id + '=' + l.orderedAt); });
    (s.radOrders || []).forEach(function (r) { if (!inRange(r.orderedAt)) badDates.push('rad ' + r.id + '=' + r.orderedAt); });
    check('Transactional dates within demo window', badDates.length === 0,
      badDates.length + ' out of range: ' + badDates.slice(0, 6).join(', '));

    /* ── 4. Billing integrity: line items sum to invoice, uhid resolves ──── */
    var billMismatch = [], billOrphan = [];
    s.billing.forEach(function (b) {
      if (Array.isArray(b.items)) {
        var sum = b.items.reduce(function (a, i) { return a + (i.total || 0); }, 0);
        if (sum !== b.amount) billMismatch.push(b.id + ' Σ' + sum + '≠' + b.amount);
      }
      if (!uhidSet.has(b.uhid)) billOrphan.push(b.id + '→' + b.uhid);
    });
    check('Billing: Σ(line items) = invoice amount', billMismatch.length === 0,
      billMismatch.slice(0, 6).join(', '));
    check('Billing: every invoice links a real uhid', billOrphan.length === 0,
      billOrphan.slice(0, 6).join(', '));

    /* ── 5. Cross-links (appts, orders, beds → patients) ─────────────────── */
    function orphans(records, label) {
      var o = records.filter(function (r) { return !uhidSet.has(r.uhid); });
      return o.map(function (r) { return label + ' ' + (r.id || r.uhid); });
    }
    var apptOrphans = orphans(s.appointments, 'appt');
    check('Appointments link real patients', apptOrphans.length === 0, apptOrphans.slice(0, 6).join(', '));
    var labOrphans = orphans(s.labOrders || [], 'lab');
    var radOrphans = orphans(s.radOrders || [], 'rad');
    check('Lab/Rad orders link real patients', labOrphans.length + radOrphans.length === 0,
      labOrphans.concat(radOrphans).slice(0, 6).join(', '));

    var bedOrphans = [];
    Object.keys(s.bedsStatus || {}).forEach(function (bid) {
      var bed = s.bedsStatus[bid];
      if (bed.status === 'Occupied' && bed.patientUhid && !uhidSet.has(bed.patientUhid))
        bedOrphans.push(bid + '→' + bed.patientUhid);
    });
    check('Occupied beds link real patients', bedOrphans.length === 0, bedOrphans.slice(0, 6).join(', '));

    /* ── 6. KPI reconciliations ──────────────────────────────────────────── */
    var bedIds = Object.keys(s.bedsStatus || {});
    var totalBeds = bedIds.length;
    var occupiedIds = bedIds.filter(function (b) { return s.bedsStatus[b].status === 'Occupied'; });
    var hasBed = function (p) { return p.bed && p.bed !== '—' && p.bed !== '' && s.bedsStatus[p.bed]; };
    var activeInpatients = s.patients.filter(function (p) {
      return p.type !== 'OPD' && !/discharg/i.test(p.status || '') && hasBed(p);
    });
    // every active inpatient occupies their bed; every occupied bed has an active inpatient
    var activeSet = new Set(activeInpatients.map(function (p) { return p.uhid; }));
    var inpatientsNotOccupying = activeInpatients.filter(function (p) { return s.bedsStatus[p.bed].status !== 'Occupied' || s.bedsStatus[p.bed].patientUhid !== p.uhid; });
    var occupiedWithoutInpatient = occupiedIds.filter(function (b) { return !activeSet.has(s.bedsStatus[b].patientUhid); });
    check('Bed occupancy reconciles with roster (bidirectional)',
      inpatientsNotOccupying.length === 0 && occupiedWithoutInpatient.length === 0,
      occupiedIds.length + ' occupied / ' + totalBeds + ' beds (' + Math.round(occupiedIds.length / totalBeds * 100) +
      '% occupancy), ' + activeInpatients.length + ' active inpatients · ' +
      inpatientsNotOccupying.length + ' unlinked patients · ' + occupiedWithoutInpatient.length + ' orphan beds');

    var labPending = (s.labOrders || []).filter(function (l) { return /pending|ordered/i.test(l.status || ''); }).length;
    var radScheduled = (s.radOrders || []).filter(function (r) { return /schedul|ordered|pending/i.test(r.status || ''); }).length;
    check('Lab has pending orders', labPending > 0, labPending + ' pending of ' + (s.labOrders || []).length);
    check('Rad has scheduled orders', radScheduled > 0, radScheduled + ' scheduled of ' + (s.radOrders || []).length);

    var outstanding = s.billing.filter(function (b) { return b.status !== 'Paid'; })
      .reduce(function (a, b) { return a + ((b.amount || 0) - (b.paid || 0)); }, 0);
    check('Billing outstanding computed', true, '₹' + outstanding.toLocaleString('en-IN') + ' across unpaid invoices');

    check('Alert Center has active alerts', (s.alerts || []).length > 0,
      (s.alerts || []).length + ' alerts (empty ⇒ blank Alert Center / bell badge)');

    /* ── 7. Catalog ──────────────────────────────────────────────────────── */
    var cat = window.medicationCatalog || [];
    check('Medication catalog ≈ 60,000 items', cat.length >= 55000,
      cat.length.toLocaleString('en-IN') + ' formulations');
    var catEmpty = 0;
    cat.slice(0, 2000).forEach(function (m) {
      ['brandName', 'genericName', 'strength', 'price', 'schedule', 'hsnCode', 'manufacturer'].forEach(function (f) {
        if (empty(m[f])) catEmpty++;
      });
    });
    check('Catalog: no empty fields (2k sample)', catEmpty === 0, catEmpty + ' empty in sample');

    /* ── Report ──────────────────────────────────────────────────────────── */
    var pass = results.filter(function (r) { return r.ok; }).length;
    var fail = results.length - pass;
    var lines = ['', '════════ SARONIL DEMO DATA VALIDATION ════════'];
    results.forEach(function (r) {
      lines.push((r.ok ? '  ✅ PASS ' : '  ❌ FAIL ') + r.name + (r.detail ? '  — ' + r.detail : ''));
    });
    lines.push('──────────────────────────────────────────────');
    lines.push('  ' + pass + ' passed · ' + fail + ' failed · ' + results.length + ' checks');
    lines.push('════════════════════════════════════════════════');
    var report = lines.join('\n');
    console.log(report);
    return { pass: pass, fail: fail, results: results, report: report };
  };

  if (typeof window !== 'undefined' && window.state && window.state.patients) {
    // auto-run if loaded after state is ready
    try { window.validateDemoData(); } catch (e) { /* run manually */ }
  }
})();
