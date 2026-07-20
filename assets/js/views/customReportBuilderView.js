/* ==========================================================================
   SARONIL HMS — MAKE YOUR OWN REPORT (customReportBuilderView.js)
   Admin custom report builder: pick fields, filter, combine & export.
   Route: #customReports
   ========================================================================== */

(function () {
  'use strict';

  const STORAGE_KEY = 'saronil_custom_report_templates';
  const LOCATIONS = ['Bengaluru Campus', 'Whitefield', 'Electronic City', 'Delhi', 'Patna'];
  const LEAD_SOURCES = [
    'Walk-in', 'Google Ads', 'Doctor Referral', 'Camp Outreach',
    'Insurance TPA', 'Website', 'WhatsApp', 'Corporate Tie-up', 'Returning Patient'
  ];

  const REPORT_FIELDS = {
    patientName:      { label: 'Patient Name',       group: 'Patient' },
    phone:            { label: 'Phone / Mobile',     group: 'Patient' },
    uhid:             { label: 'UHID',               group: 'Patient' },
    age:              { label: 'Age',                group: 'Patient' },
    gender:           { label: 'Gender',             group: 'Patient' },
    leadSource:       { label: 'Lead Source',        group: 'Marketing & CRM' },
    campaign:         { label: 'Campaign',           group: 'Marketing & CRM' },
    referralDoctor:   { label: 'Referral Doctor',    group: 'Marketing & CRM' },
    location:         { label: 'Location / Branch',  group: 'Location' },
    department:       { label: 'Department',         group: 'Location' },
    ward:             { label: 'Ward / Bed',         group: 'Location' },
    patientType:      { label: 'Patient Type',       group: 'Clinical' },
    visitType:        { label: 'Visit Type',         group: 'Clinical' },
    consultant:       { label: 'Consultant',       group: 'Clinical' },
    diagnosis:        { label: 'Diagnosis',          group: 'Clinical' },
    registrationDate: { label: 'Registration Date',  group: 'Administrative' },
    payer:            { label: 'Payer',              group: 'Financial' },
    payerType:        { label: 'Payer Type',         group: 'Financial' }
  };

  let selectedFields = ['patientName', 'phone', 'leadSource', 'location', 'department', 'visitType', 'consultant'];
  let lastRows = [];
  let lastFilters = {};

  function hashCode(str) {
    let h = 0;
    for (let i = 0; i < str.length; i++) h = ((h << 5) - h) + str.charCodeAt(i) | 0;
    return Math.abs(h);
  }

  function deriveLeadSource(p, appt) {
    if (p.leadSource) return p.leadSource;
    const vt = appt?.visitType || p.visitType || '';
    if (vt === 'Referral') return 'Doctor Referral';
    if (vt === 'Follow-up') return 'Returning Patient';
    const idx = hashCode(p.uhid || p.name) % LEAD_SOURCES.length;
    return LEAD_SOURCES[idx];
  }

  function deriveLocation(p) {
    if (p.location || p.branch) return p.location || p.branch;
    return LOCATIONS[hashCode(p.uhid || '') % LOCATIONS.length];
  }

  function deriveCampaign(leadSource) {
    const map = {
      'Google Ads': 'Monsoon Health Check 2026',
      'Camp Outreach': 'Rural Screening Drive',
      'Website': 'Organic / SEO',
      'WhatsApp': 'Patient Engagement Bot',
      'Corporate Tie-up': 'Tech Park Wellness',
      'Doctor Referral': 'Physician Network',
      'Insurance TPA': 'Payer Panel Intake',
      'Walk-in': 'Front Desk Walk-in',
      'Returning Patient': 'Loyalty / Follow-up'
    };
    return map[leadSource] || 'General Intake';
  }

  function buildReportRows() {
    const patients = (window.state && window.state.patients) || [];
    const appointments = (window.state && window.state.appointments) || [];

    return patients.map(function (p) {
      const appt = appointments.find(function (a) { return a.uhid === p.uhid; });
      const leadSource = deriveLeadSource(p, appt);
      const visitType = appt?.visitType || p.visitType || (p.type === 'IPD' ? 'Admission' : 'New');
      const consultant = p.primaryConsultant || appt?.doctorName || '—';
      const referralDoctor = visitType === 'Referral' ? consultant : (p.referralDoctor || '—');

      return {
        patientName: p.name || '—',
        phone: p.mobile || appt?.mobile || '—',
        uhid: p.uhid || '—',
        age: p.age != null ? String(p.age) : '—',
        gender: p.gender || '—',
        leadSource: leadSource,
        campaign: deriveCampaign(leadSource),
        referralDoctor: referralDoctor,
        location: deriveLocation(p),
        department: p.department || appt?.deptName || appt?.spec || '—',
        ward: p.type === 'IPD' || p.type === 'Emergency' ? ((p.ward || '—') + (p.bed && p.bed !== '—' ? ' · ' + p.bed : '')) : '—',
        patientType: p.type || 'OPD',
        visitType: visitType,
        consultant: consultant,
        diagnosis: (p.clinicalData && p.clinicalData.diagnosis) || '—',
        registrationDate: (typeof p.admitted === 'string' ? p.admitted.split('·')[0].trim() : '—'),
        payer: p.payer || '—',
        payerType: p.payerType || '—'
      };
    });
  }

  function getTemplates() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    } catch (e) {
      return [];
    }
  }

  function saveTemplate(name, fields) {
    const templates = getTemplates().filter(function (t) { return t.name !== name; });
    templates.unshift({ name: name, fields: fields.slice(), savedAt: new Date().toISOString() });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(templates.slice(0, 12)));
  }

  function applyFilters(rows) {
    const loc = document.getElementById('crb-filter-location')?.value || 'all';
    const lead = document.getElementById('crb-filter-lead')?.value || 'all';
    const dept = document.getElementById('crb-filter-dept')?.value || 'all';
    const type = document.getElementById('crb-filter-type')?.value || 'all';
    const q = (document.getElementById('crb-search')?.value || '').toLowerCase().trim();

    lastFilters = { loc: loc, lead: lead, dept: dept, type: type, q: q };

    return rows.filter(function (r) {
      if (loc !== 'all' && r.location !== loc) return false;
      if (lead !== 'all' && r.leadSource !== lead) return false;
      if (dept !== 'all' && r.department !== dept) return false;
      if (type !== 'all' && r.patientType !== type) return false;
      if (q && !(r.patientName.toLowerCase().includes(q) || r.phone.includes(q) || r.uhid.toLowerCase().includes(q))) return false;
      return true;
    });
  }

  function renderFieldPicker() {
    const el = document.getElementById('crb-field-picker');
    if (!el) return;

    const groups = {};
    Object.keys(REPORT_FIELDS).forEach(function (key) {
      const f = REPORT_FIELDS[key];
      if (!groups[f.group]) groups[f.group] = [];
      groups[f.group].push(key);
    });

    el.innerHTML = Object.keys(groups).map(function (group) {
      return `
        <div class="crb-field-group">
          <div class="crb-field-group-title">${group}</div>
          <div class="crb-field-chips">
            ${groups[group].map(function (key) {
              const checked = selectedFields.includes(key) ? 'checked' : '';
              return `
                <label class="crb-chip ${checked ? 'active' : ''}">
                  <input type="checkbox" value="${key}" ${checked} onchange="window.crbToggleField('${key}', this.checked)">
                  ${REPORT_FIELDS[key].label}
                </label>`;
            }).join('')}
          </div>
        </div>`;
    }).join('');
  }

  function renderSelectedPreview() {
    const el = document.getElementById('crb-selected-preview');
    if (!el) return;
    if (!selectedFields.length) {
      el.innerHTML = '<span style="color:var(--text-muted); font-size:0.8rem;">No fields selected — pick at least one column.</span>';
      return;
    }
    el.innerHTML = selectedFields.map(function (key) {
      return `<span class="crb-pill">${REPORT_FIELDS[key]?.label || key}</span>`;
    }).join('');
  }

  function renderReportTable(rows) {
    const container = document.getElementById('crb-report-output');
    const summary = document.getElementById('crb-report-summary');
    if (!container) return;

    if (!selectedFields.length) {
      container.innerHTML = '<div class="crb-empty">Select one or more fields, then click <strong>Generate Report</strong>.</div>';
      if (summary) summary.textContent = '';
      return;
    }

    if (!rows.length) {
      container.innerHTML = '<div class="crb-empty">No records match your filters. Try broadening location or lead source.</div>';
      if (summary) summary.textContent = '0 records';
      return;
    }

    const cols = selectedFields.filter(function (k) { return REPORT_FIELDS[k]; });
    if (summary) {
      summary.textContent = rows.length + ' record' + (rows.length === 1 ? '' : 's') + ' · ' + cols.length + ' column' + (cols.length === 1 ? '' : 's');
    }

    container.innerHTML = `
      <div class="crb-table-wrap">
        <table class="custom-table crb-table">
          <thead>
            <tr>${cols.map(function (k) { return '<th>' + REPORT_FIELDS[k].label + '</th>'; }).join('')}</tr>
          </thead>
          <tbody>
            ${rows.map(function (row) {
              return '<tr>' + cols.map(function (k) {
                const val = row[k] != null ? String(row[k]) : '—';
                const cell = k === 'patientName'
                  ? '<a href="#patients?uhid=' + encodeURIComponent(row.uhid) + '" class="crb-link">' + val + '</a>'
                  : val;
                return '<td>' + cell + '</td>';
              }).join('') + '</tr>';
            }).join('')}
          </tbody>
        </table>
      </div>`;
  }

  function renderTemplateSelect() {
    const sel = document.getElementById('crb-template-select');
    if (!sel) return;
    const templates = getTemplates();
    sel.innerHTML = '<option value="">— Load saved template —</option>' +
      templates.map(function (t) {
        return '<option value="' + t.name.replace(/"/g, '&quot;') + '">' + t.name + ' (' + t.fields.length + ' fields)</option>';
      }).join('');
  }

  function injectStyles() {
    if (document.getElementById('crb-styles')) return;
    const style = document.createElement('style');
    style.id = 'crb-styles';
    style.textContent = `
      .crb-layout { display:grid; grid-template-columns:320px 1fr; gap:1rem; align-items:start; text-align:left; }
      @media (max-width:1100px) { .crb-layout { grid-template-columns:1fr; } }
      .crb-field-group { margin-bottom:0.85rem; }
      .crb-field-group-title { font-size:0.7rem; font-weight:800; text-transform:uppercase; letter-spacing:0.04em; color:var(--text-muted); margin-bottom:0.4rem; }
      .crb-field-chips { display:flex; flex-wrap:wrap; gap:0.35rem; }
      .crb-chip { display:inline-flex; align-items:center; gap:0.35rem; padding:0.35rem 0.55rem; border-radius:999px; border:1px solid var(--border-color); font-size:0.72rem; cursor:pointer; background:var(--bg-base); user-select:none; }
      .crb-chip input { display:none; }
      .crb-chip.active { background:#eff6ff; border-color:#93c5fd; color:#1d4ed8; font-weight:600; }
      .crb-pill { display:inline-block; padding:0.2rem 0.5rem; margin:0.15rem; border-radius:6px; background:#f1f5f9; font-size:0.72rem; font-weight:600; color:#334155; }
      .crb-filters { display:grid; grid-template-columns:repeat(5,1fr); gap:0.65rem; }
      @media (max-width:900px) { .crb-filters { grid-template-columns:1fr 1fr; } }
      .crb-table-wrap { overflow:auto; max-height:520px; border:1px solid var(--border-color); border-radius:8px; }
      .crb-table { font-size:0.78rem; margin:0; }
      .crb-table th { position:sticky; top:0; background:#f8fafc; z-index:1; white-space:nowrap; }
      .crb-table td { white-space:nowrap; max-width:220px; overflow:hidden; text-overflow:ellipsis; }
      .crb-link { color:var(--primary); font-weight:700; text-decoration:none; }
      .crb-link:hover { text-decoration:underline; }
      .crb-empty { padding:2rem; text-align:center; color:var(--text-muted); font-size:0.85rem; }
      .crb-kpi-row { display:grid; grid-template-columns:repeat(4,1fr); gap:0.75rem; margin-bottom:1rem; }
      @media (max-width:900px) { .crb-kpi-row { grid-template-columns:1fr 1fr; } }
      .crb-kpi { background:var(--bg-surface); border:1px solid var(--border-color); border-radius:8px; padding:0.75rem 1rem; }
      .crb-kpi-val { font-size:1.35rem; font-weight:800; color:var(--primary); }
      .crb-kpi-lbl { font-size:0.7rem; color:var(--text-muted); text-transform:uppercase; font-weight:700; margin-top:0.15rem; }
    `;
    document.head.appendChild(style);
  }

  function renderKpis(rows) {
    const el = document.getElementById('crb-kpis');
    if (!el) return;
    const uniqueLeads = new Set(rows.map(function (r) { return r.leadSource; })).size;
    const uniqueLocs = new Set(rows.map(function (r) { return r.location; })).size;
    const referrals = rows.filter(function (r) { return r.leadSource === 'Doctor Referral'; }).length;
    el.innerHTML = `
      <div class="crb-kpi"><div class="crb-kpi-val">${rows.length}</div><div class="crb-kpi-lbl">Matching Records</div></div>
      <div class="crb-kpi"><div class="crb-kpi-val">${uniqueLocs}</div><div class="crb-kpi-lbl">Locations</div></div>
      <div class="crb-kpi"><div class="crb-kpi-val">${uniqueLeads}</div><div class="crb-kpi-lbl">Lead Sources</div></div>
      <div class="crb-kpi"><div class="crb-kpi-val">${referrals}</div><div class="crb-kpi-lbl">Doctor Referrals</div></div>`;
  }

  function getDepartments(rows) {
    const set = new Set();
    rows.forEach(function (r) { if (r.department && r.department !== '—') set.add(r.department); });
    return Array.from(set).sort();
  }

  function renderMain(container) {
    injectStyles();
    const allRows = buildReportRows();
    const departments = getDepartments(allRows);

    container.innerHTML = `
      <div style="margin-bottom:1rem;">
        <h2 style="margin:0 0 0.25rem; font-size:1.35rem; font-weight:800; color:var(--text-primary);">Make Your Own Report</h2>
        <p style="margin:0; font-size:0.85rem; color:var(--text-secondary);">Combine patient, lead source, location and clinical fields into administrator-defined reports for demos and operations review.</p>
      </div>

      <div id="crb-kpis" class="crb-kpi-row"></div>

      <div class="crb-layout">
        <div class="card" style="margin:0;">
          <div class="card-header">
            <h3 class="card-title" style="font-size:0.95rem;">① Pick Report Fields</h3>
            <p class="card-subtitle">Select columns to include in your custom report</p>
          </div>
          <div class="card-body" style="padding-top:0.5rem;">
            <div id="crb-field-picker"></div>
            <div style="margin-top:0.75rem; padding-top:0.75rem; border-top:1px solid var(--border-color);">
              <div style="font-size:0.7rem; font-weight:700; color:var(--text-muted); margin-bottom:0.35rem;">SELECTED COLUMNS</div>
              <div id="crb-selected-preview"></div>
            </div>
            <div style="display:flex; gap:0.4rem; margin-top:0.75rem; flex-wrap:wrap;">
              <button class="btn btn-secondary btn-sm" type="button" onclick="window.crbSelectPreset('crm')">CRM Preset</button>
              <button class="btn btn-secondary btn-sm" type="button" onclick="window.crbSelectPreset('clinical')">Clinical Preset</button>
              <button class="btn btn-secondary btn-sm" type="button" onclick="window.crbSelectPreset('financial')">Financial Preset</button>
            </div>
          </div>
        </div>

        <div style="display:flex; flex-direction:column; gap:1rem;">
          <div class="card" style="margin:0;">
            <div class="card-header" style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:0.5rem;">
              <div>
                <h3 class="card-title" style="font-size:0.95rem;">② Filter & Generate</h3>
                <p class="card-subtitle">Narrow by location, lead source, department or patient type</p>
              </div>
              <div style="display:flex; gap:0.4rem; align-items:center; flex-wrap:wrap;">
                <select id="crb-template-select" class="form-select" style="font-size:0.72rem; min-width:160px;" onchange="window.crbLoadTemplate(this.value)"></select>
                <button class="btn btn-secondary btn-sm" type="button" onclick="window.crbSaveTemplate()">💾 Save Template</button>
              </div>
            </div>
            <div class="card-body">
              <div class="crb-filters">
                <div class="form-group" style="margin:0;">
                  <label class="form-label" style="font-size:0.7rem;">Location</label>
                  <select id="crb-filter-location" class="form-select" style="font-size:0.75rem;">
                    <option value="all">All Locations</option>
                    ${LOCATIONS.map(function (l) { return '<option value="' + l + '">' + l + '</option>'; }).join('')}
                  </select>
                </div>
                <div class="form-group" style="margin:0;">
                  <label class="form-label" style="font-size:0.7rem;">Lead Source</label>
                  <select id="crb-filter-lead" class="form-select" style="font-size:0.75rem;">
                    <option value="all">All Lead Sources</option>
                    ${LEAD_SOURCES.map(function (l) { return '<option value="' + l + '">' + l + '</option>'; }).join('')}
                  </select>
                </div>
                <div class="form-group" style="margin:0;">
                  <label class="form-label" style="font-size:0.7rem;">Department</label>
                  <select id="crb-filter-dept" class="form-select" style="font-size:0.75rem;">
                    <option value="all">All Departments</option>
                    ${departments.map(function (d) { return '<option value="' + d + '">' + d + '</option>'; }).join('')}
                  </select>
                </div>
                <div class="form-group" style="margin:0;">
                  <label class="form-label" style="font-size:0.7rem;">Patient Type</label>
                  <select id="crb-filter-type" class="form-select" style="font-size:0.75rem;">
                    <option value="all">All Types</option>
                    <option value="OPD">OPD</option>
                    <option value="IPD">IPD</option>
                    <option value="Emergency">Emergency</option>
                    <option value="Daycare">Daycare</option>
                  </select>
                </div>
                <div class="form-group" style="margin:0;">
                  <label class="form-label" style="font-size:0.7rem;">Search</label>
                  <input type="text" id="crb-search" class="form-control" placeholder="Name, phone, UHID" style="font-size:0.75rem;">
                </div>
              </div>
              <div style="display:flex; justify-content:flex-end; gap:0.5rem; margin-top:0.85rem; flex-wrap:wrap;">
                <button class="btn btn-secondary btn-sm" type="button" onclick="window.crbExportCsv()">📥 Download CSV</button>
                <button class="btn btn-secondary btn-sm" type="button" onclick="window.crbPrintReport()">🖨 Print</button>
                <button class="btn btn-primary btn-sm" type="button" onclick="window.crbGenerateReport()">🔍 Generate Report</button>
              </div>
            </div>
          </div>

          <div class="card" style="margin:0;">
            <div class="card-header" style="display:flex; justify-content:space-between; align-items:center;">
              <h3 class="card-title" style="font-size:0.95rem;">③ Report Output</h3>
              <span id="crb-report-summary" style="font-size:0.75rem; color:var(--text-muted); font-weight:600;"></span>
            </div>
            <div class="card-body" style="padding-top:0;">
              <div id="crb-report-output"></div>
            </div>
          </div>
        </div>
      </div>
    `;

    renderFieldPicker();
    renderSelectedPreview();
    renderTemplateSelect();
    window.crbGenerateReport();
  }

  window.views.customReports = function (container) {
    const pageTitleEl = document.getElementById('active-page-title');
    if (pageTitleEl) pageTitleEl.textContent = 'Make Your Own Report';
    renderMain(container);
  };

  window.crbToggleField = function (key, on) {
    if (on && !selectedFields.includes(key)) selectedFields.push(key);
    if (!on) selectedFields = selectedFields.filter(function (k) { return k !== key; });
    renderFieldPicker();
    renderSelectedPreview();
  };

  window.crbSelectPreset = function (preset) {
    if (preset === 'crm') {
      selectedFields = ['patientName', 'phone', 'leadSource', 'campaign', 'location', 'registrationDate'];
    } else if (preset === 'clinical') {
      selectedFields = ['patientName', 'uhid', 'department', 'consultant', 'visitType', 'diagnosis', 'patientType'];
    } else if (preset === 'financial') {
      selectedFields = ['patientName', 'phone', 'payer', 'payerType', 'location', 'department'];
    }
    renderFieldPicker();
    renderSelectedPreview();
    window.crbGenerateReport();
  };

  window.crbGenerateReport = function () {
    const rows = applyFilters(buildReportRows());
    lastRows = rows;
    renderKpis(rows);
    renderReportTable(rows);
  };

  window.crbLoadTemplate = function (name) {
    if (!name) return;
    const t = getTemplates().find(function (x) { return x.name === name; });
    if (!t) return;
    selectedFields = t.fields.slice();
    renderFieldPicker();
    renderSelectedPreview();
    window.crbGenerateReport();
  };

  window.crbSaveTemplate = async function () {
    const name = await customPrompt('Template name (e.g. Monthly CRM by Location):');
    if (!name || !name.trim()) return;
    if (!selectedFields.length) { alert('Select at least one field before saving.'); return; }
    saveTemplate(name.trim(), selectedFields);
    renderTemplateSelect();
    alert('Template saved: ' + name.trim());
  };

  window.crbExportCsv = function () {
    if (!lastRows.length || !selectedFields.length) {
      alert('Generate a report first.');
      return;
    }
    const cols = selectedFields.filter(function (k) { return REPORT_FIELDS[k]; });
    const header = cols.map(function (k) { return REPORT_FIELDS[k].label; }).join(',');
    const body = lastRows.map(function (row) {
      return cols.map(function (k) {
        const v = String(row[k] != null ? row[k] : '').replace(/"/g, '""');
        return '"' + v + '"';
      }).join(',');
    }).join('\n');
    const blob = new Blob([header + '\n' + body], { type: 'text/csv;charset=utf-8;' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'saronil-custom-report-' + new Date().toISOString().slice(0, 10) + '.csv';
    a.click();
  };

  window.crbPrintReport = function () {
    const out = document.getElementById('crb-report-output');
    if (!out || !lastRows.length) { alert('Generate a report first.'); return; }
    const w = window.open('', '_blank');
    w.document.write('<html><head><title>Custom Report</title><style>body{font-family:sans-serif;padding:20px}table{border-collapse:collapse;width:100%;font-size:12px}th,td{border:1px solid #ccc;padding:6px 8px;text-align:left}th{background:#f1f5f9}</style></head><body><h2>Saronil HMS — Custom Report</h2>' + out.innerHTML + '</body></html>');
    w.document.close();
    w.print();
  };

})();
