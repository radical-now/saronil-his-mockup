#!/usr/bin/env python3
"""
Replace renderExecutiveDashboard in dashboardView.js with the fully-specified
Executive Dashboard per the detailed design spec.
"""

path = "/Users/home/Desktop/Saronil IHS/Updated HIS /assets/js/views/dashboardView.js"

NEW_FUNCTION = r'''// --------------------------------------------------------------------------
// EXECUTIVE MANAGEMENT DASHBOARD (EXECUTIVE ROLES) — v3.0
// Spec: Branch-aware, role-based, no header/footer, page content only
// --------------------------------------------------------------------------
function renderExecutiveDashboard(container, activeRole) {

  // ── Role visibility flags ─────────────────────────────────────────────────
  const financialRoles = ['Chairman','CEO','COO','CFO','General Manager'];
  const approvalFullRoles = ['Chairman','CEO','COO','CFO'];
  const hasFinance  = financialRoles.includes(activeRole);
  const hasFullApproval = approvalFullRoles.includes(activeRole);
  const isMS = activeRole === 'Medical Superintendent';

  // ── Branch data ───────────────────────────────────────────────────────────
  const branches = {
    all: { id:'all', label:'All Branches — Consolidated', short:'All', health:'red' },
    blr: { id:'blr', label:'Bengaluru Campus', short:'BLR', health:'red' },
    wf:  { id:'wf',  label:'Whitefield', short:'WF', health:'amber' },
    ec:  { id:'ec',  label:'Electronic City', short:'EC', health:'green' }
  };

  const branchKPI = {
    blr: { opd:220, emergency:8, admissions:10, discharges:14, pendingDischarge:5,
            bedTotal:160, bedOcc:134, bedPct:83.8, icuTotal:18, icuOcc:17, icuPct:94.4,
            revenue:310000, collections:285000 },
    wf:  { opd:80, emergency:6, admissions:10, discharges:7, pendingDischarge:2,
            bedTotal:55, bedOcc:42, bedPct:76.4, icuTotal:12, icuOcc:11, icuPct:91.7,
            revenue:105000, collections:90000 },
    ec:  { opd:42, emergency:4, admissions:8, discharges:3, pendingDischarge:1,
            bedTotal:35, bedOcc:24, bedPct:68.6, icuTotal:10, icuOcc:7, icuPct:72.0,
            revenue:75000, collections:62000 }
  };

  const consolidated = {
    opd: 342, emergency: 18, admissions: 28, discharges: 24, pendingDischarge: 8,
    bedTotal: 250, bedOcc: 201, bedPct: 80.4, icuTotal: 40, icuOcc: 36, icuPct: 90.0,
    revenue: 485200, collections: 420500,
    outstanding: 8420000, insurancePending: 85
  };

  const bedTable = [
    { cat:'General Wards',     total:116, occ:86, avail:15, blr:'84%', wf:'76%', ec:'71%', pct:74, status:'green' },
    { cat:'Private / Deluxe',  total: 78, occ:51, avail:19, blr:'78%', wf:'65%', ec:'60%', pct:65, status:'green' },
    { cat:'ICU / HDU',         total: 40, occ:36, avail: 3, blr:'96%', wf:'88%', ec:'72%', pct:90, status:'red' },
    { cat:'NICU / Isolation',  total: 16, occ:11, avail: 4, blr:'75%', wf:'60%', ec:'62%', pct:69, status:'green' },
  ];

  // ── Alert data ────────────────────────────────────────────────────────────
  const alerts = [
    { level:'red',   branch:'blr', text:'Sentinel event — General Medicine — RCA investigation pending', elapsed:'2h 14m', link:'hospMgmt', label:'Investigate →' },
    { level:'red',   branch:'blr', text:'Doctor credential expired — Dr. Sandeep Shah — Orthopedics Board Registration', elapsed:'6h 30m', link:'hospMgmt', label:'Renew →' },
    { level:'red',   branch:'blr', text:'Critical lab unacknowledged >30 min — Rajesh Kumar · 32 min', elapsed:'32m', link:'lab', label:'Act →' },
    { level:'amber', branch:'all', text:'Discharge pending >6h — 3 patients (Bengaluru: 2 · Whitefield: 1)', elapsed:'6h+', link:'atd', label:'Queue →' },
    { level:'amber', branch:'blr', text:'ICU Occupancy at critical threshold — 94.4% · 1 free bed remaining', elapsed:'1h 45m', link:'atd', label:'Bed Board →' },
    { level:'yellow',branch:'blr', text:'Daily census not certified — Bengaluru Campus (MS signature pending)', elapsed:'14h', link:'hospMgmt', label:'Sign →' },
  ];

  // ── Approval data ─────────────────────────────────────────────────────────
  const approvals = [
    { type:'HIGH DISCOUNT',   typeClass:'atype-red',    desc:'Rajesh Kumar — 15% discount on IPD bill', dept:'Billing',     branch:'BLR', amount:'₹12,500',  by:'Dr. Anita Rao',      since:'2h ago' },
    { type:'CAPEX PURCHASE',  typeClass:'atype-blue',   desc:'Philips CX50 cardiac probe replacement',  dept:'Cardiology',  branch:'BLR', amount:'₹1,50,000', by:'HOD Cardiology',     since:'4h ago' },
    { type:'TPA ESCALATION',  typeClass:'atype-orange', desc:'Cardiac stent implant reimbursement',      dept:'Insurance',   branch:'WF',  amount:'₹45,000',   by:'Insurance Desk',     since:'24h ago' },
    { type:'PHARMACY DRUG',   typeClass:'atype-purple', desc:'Inj. Remdesivir — non-formulary request',  dept:'Pharmacy',    branch:'EC',  amount:'₹8,500',    by:'Dr. Meera Pillai',   since:'7h ago' },
    { type:'LAMA OVERRIDE',   typeClass:'atype-amber',  desc:'High-risk cardiac patient — LAMA request', dept:'Admission',   branch:'BLR', amount:'—',          by:'Dr. Suresh Nambiar', since:'3h ago' },
  ];

  // ── Trend chart data ──────────────────────────────────────────────────────
  const trendDays7 = ['22-Jun','23-Jun','24-Jun','25-Jun','26-Jun','27-Jun','28-Jun'];
  const opdBlr7 = [198,210,224,208,215,218,220];
  const opdWf7  = [72,75,78,74,76,78,80];
  const opdEc7  = [38,40,41,39,40,41,42];
  const opdTgt7 = [200,200,210,210,220,220,230];
  const adm7    = [24,26,28,25,27,30,28];
  const dis7    = [22,25,26,24,26,27,24];
  const bedBlr7 = [82,83,84,83,84,84,84];
  const bedWf7  = [74,75,75,76,76,76,76];
  const bedEc7  = [66,67,68,68,68,69,69];

  // ── State ─────────────────────────────────────────────────────────────────
  let activeBranch = 'all';
  let trendPeriod  = '7d';

  // ── Helpers ───────────────────────────────────────────────────────────────
  const fmt   = n => n.toLocaleString('en-IN');
  const fmtRs = n => '₹' + (n >= 100000 ? (n/100000).toFixed(1) + 'L' : fmt(n));
  const statusDot = s => `<span class="ed-dot ed-dot-${s}"></span>`;
  const healthDot = h => ({ red:'🔴', amber:'🟡', green:'🟢' }[h] || '⚪');

  function pct(a, b) { return b > 0 ? ((a/b)*100).toFixed(1) : '0'; }
  function pctStatus(p) { return p >= 90 ? 'red' : p >= 75 ? 'amber' : 'green'; }

  // ── SVG chart helpers ─────────────────────────────────────────────────────
  function svgLine(data, W, H, color, yMin, yMax) {
    const n = data.length;
    const xs = i => (i / (n-1)) * W;
    const ys = v => H - ((v - yMin) / (yMax - yMin)) * H;
    const pts = data.map((v,i) => `${xs(i).toFixed(1)},${ys(v).toFixed(1)}`).join(' ');
    return `<polyline points="${pts}" fill="none" stroke="${color}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>`;
  }
  function svgBar(data, W, H, color, yMin, yMax) {
    const n = data.length; const bw = (W / n) * 0.6; const gap = W / n;
    return data.map((v,i) => {
      const h = Math.max(2, ((v - yMin) / (yMax - yMin)) * H);
      const x = i * gap + (gap - bw) / 2;
      return `<rect x="${x.toFixed(1)}" y="${(H-h).toFixed(1)}" width="${bw.toFixed(1)}" height="${h.toFixed(1)}" fill="${color}" rx="2"/>`;
    }).join('');
  }
  function svgDashedH(val, W, H, color, yMin, yMax) {
    const y = H - ((val - yMin) / (yMax - yMin)) * H;
    return `<line x1="0" y1="${y.toFixed(1)}" x2="${W}" y2="${y.toFixed(1)}" stroke="${color}" stroke-width="1.5" stroke-dasharray="4,3"/>`;
  }
  function svgXLabels(labels, W) {
    const n = labels.length; const gap = W / n;
    return labels.map((l,i) => {
      const x = i * gap + gap/2;
      return `<text x="${x.toFixed(1)}" y="0" fill="#94a3b8" font-size="9" text-anchor="middle">${l}</text>`;
    }).join('');
  }

  // ── Main render ───────────────────────────────────────────────────────────
  function render() {
    const branch = branches[activeBranch];
    const isSingle = activeBranch !== 'all';
    const kpi = isSingle ? branchKPI[activeBranch] : consolidated;
    const bLabel = isSingle ? branch.label : 'All Branches — Combined';

    // Filter alerts
    const visAlerts = isSingle
      ? alerts.filter(a => a.branch === activeBranch || a.branch === 'all')
      : alerts;

    // ── CSS ───────────────────────────────────────────────────────────────
    const css = `
      <style>
        .ed-wrap { font-family:'Inter',system-ui,sans-serif; color:#0f172a; min-width:1280px; display:flex; flex-direction:column; gap:16px; background:#f8fafc; padding-bottom:32px; }
        .ed-wrap *, .ed-wrap *::before, .ed-wrap *::after { box-sizing:border-box; }
        .ed-wrap .mono { font-family:'JetBrains Mono','Courier New',monospace; }

        /* Branch bar */
        .ed-branch-bar { position:sticky; top:0; z-index:50; background:#f8fafc; border-bottom:1px solid #e2e8f0; padding:10px 20px; display:flex; justify-content:space-between; align-items:center; }
        .ed-branch-pills { display:flex; align-items:center; gap:8px; flex-wrap:wrap; }
        .ed-branch-label { font-size:0.75rem; color:#94a3b8; font-weight:600; margin-right:4px; }
        .ed-pill { display:inline-flex; align-items:center; gap:5px; padding:4px 12px; border-radius:20px; font-size:0.76rem; font-weight:700; cursor:pointer; border:1.5px solid #cbd5e1; background:#fff; color:#475569; transition:all .15s; user-select:none; }
        .ed-pill:hover { border-color:#64748b; color:#0f172a; }
        .ed-pill.active { background:#0f172a; color:#fff; border-color:#0f172a; }
        .ed-branch-meta { font-size:0.74rem; color:#64748b; text-align:right; line-height:1.6; }
        .ed-branch-meta b { color:#0f172a; font-weight:700; }

        /* Dots */
        .ed-dot { display:inline-block; width:8px; height:8px; border-radius:50%; flex-shrink:0; }
        .ed-dot-red    { background:#ef4444; }
        .ed-dot-amber  { background:#f59e0b; }
        .ed-dot-green  { background:#10b981; }
        .ed-dot-pill { width:7px; height:7px; }

        /* Cards */
        .ed-card { background:#fff; border:1px solid #e2e8f0; border-radius:8px; padding:14px; }
        .ed-card-red    { border-left:3px solid #ef4444; }
        .ed-card-amber  { border-left:3px solid #f59e0b; }
        .ed-card-green  { border-left:3px solid #10b981; }
        .ed-section-title { font-size:0.72rem; font-weight:800; text-transform:uppercase; letter-spacing:.6px; color:#475569; margin-bottom:10px; display:flex; align-items:center; justify-content:space-between; }
        .ed-section-link  { font-size:0.72rem; font-weight:700; color:#2563eb; text-transform:none; letter-spacing:0; cursor:pointer; }
        .ed-section-link:hover { text-decoration:underline; }

        /* Alerts */
        .ed-alert-row { display:flex; justify-content:space-between; align-items:flex-start; padding:8px 10px; border-radius:6px; font-size:0.79rem; gap:12px; }
        .ed-alert-row+.ed-alert-row { border-top:1px solid #f1f5f9; }
        .ed-alert-red    { background:#fff5f5; }
        .ed-alert-amber  { background:#fffbeb; }
        .ed-alert-yellow { background:#fefce8; }
        .ed-alert-body { display:flex; align-items:flex-start; gap:8px; flex:1; min-width:0; }
        .ed-alert-text { flex:1; min-width:0; line-height:1.5; }
        .ed-elapsed { font-size:0.68rem; color:#94a3b8; font-family:'JetBrains Mono',monospace; white-space:nowrap; margin-top:2px; }
        .ed-act-btn { padding:3px 10px; border-radius:4px; font-size:0.72rem; font-weight:700; border:none; cursor:pointer; white-space:nowrap; flex-shrink:0; }
        .ed-act-red    { background:#fee2e2; color:#991b1b; }
        .ed-act-amber  { background:#fef3c7; color:#92400e; }
        .ed-act-yellow { background:#fef9c3; color:#713f12; }
        .ed-clear-bar  { background:#f0fdf4; border:1px solid #bbf7d0; border-radius:8px; padding:10px 16px; font-size:0.8rem; color:#166534; font-weight:600; }

        /* Two-col layout */
        .ed-two-col { display:grid; grid-template-columns:60% 40%; gap:16px; }

        /* KPI cards */
        .ed-kpi-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:10px; margin-bottom:10px; }
        .ed-kpi-fin  { display:grid; grid-template-columns:repeat(5,1fr); gap:10px; }
        .ed-kpi { background:#fff; border:1px solid #e2e8f0; border-radius:8px; padding:12px; cursor:pointer; transition:box-shadow .15s; position:relative; overflow:hidden; }
        .ed-kpi:hover { box-shadow:0 2px 8px rgba(0,0,0,.08); }
        .ed-kpi.border-red   { border-left:3px solid #ef4444; }
        .ed-kpi.border-amber { border-left:3px solid #f59e0b; }
        .ed-kpi.border-green { border-left:3px solid #10b981; }
        .ed-kpi-name { font-size:0.7rem; font-weight:700; color:#64748b; text-transform:uppercase; letter-spacing:.4px; }
        .ed-kpi-val  { font-size:1.55rem; font-weight:800; color:#0f172a; font-family:'JetBrains Mono',monospace; margin:4px 0 2px; line-height:1; }
        .ed-kpi-sub  { font-size:0.68rem; color:#64748b; line-height:1.4; }
        .ed-kpi-delta { font-size:0.68rem; font-weight:700; margin-top:3px; }
        .ed-kpi-status { position:absolute; top:10px; right:10px; }
        .ed-kpi-branch { font-size:0.63rem; color:#94a3b8; margin-top:3px; font-family:'JetBrains Mono',monospace; }

        /* Dept status */
        .ed-dept-list { display:flex; flex-direction:column; gap:0; }
        .ed-dept-row  { padding:10px 12px; border-bottom:1px solid #f1f5f9; display:flex; flex-direction:column; gap:2px; cursor:pointer; transition:background .1s; }
        .ed-dept-row:last-child { border-bottom:none; }
        .ed-dept-row:hover { background:#f8fafc; }
        .ed-dept-header { display:flex; justify-content:space-between; align-items:center; }
        .ed-dept-name { font-size:0.79rem; font-weight:700; color:#0f172a; display:flex; align-items:center; gap:6px; }
        .ed-dept-link { font-size:0.68rem; color:#2563eb; font-weight:700; }
        .ed-dept-meta { font-size:0.73rem; color:#475569; }
        .ed-dept-alert-line { font-size:0.7rem; color:#b45309; font-weight:600; }
        .ed-resource-strip { background:#f8fafc; border:1px solid #e2e8f0; border-radius:6px; padding:10px 12px; margin-top:10px; display:flex; flex-direction:column; gap:5px; font-size:0.74rem; color:#475569; }
        .ed-resource-line { display:flex; align-items:center; gap:6px; }

        /* Bed table */
        .ed-bed-table { width:100%; border-collapse:collapse; font-size:0.76rem; }
        .ed-bed-table th { background:#f8fafc; font-size:0.68rem; font-weight:700; text-transform:uppercase; letter-spacing:.4px; color:#64748b; padding:6px 10px; border-bottom:1px solid #e2e8f0; text-align:right; }
        .ed-bed-table th:first-child { text-align:left; }
        .ed-bed-table td { padding:7px 10px; border-bottom:1px solid #f1f5f9; text-align:right; font-family:'JetBrains Mono',monospace; font-size:0.75rem; color:#374151; }
        .ed-bed-table td:first-child { text-align:left; font-family:'Inter',sans-serif; font-weight:600; color:#0f172a; }
        .ed-bed-table tr:last-child td { border-bottom:none; background:#f8fafc; font-weight:700; }
        .ed-bed-table tr:hover td { background:#f8fafc; }
        .ed-bed-occ-red    { color:#dc2626; font-weight:800; }
        .ed-bed-occ-amber  { color:#d97706; font-weight:700; }
        .ed-bed-occ-green  { color:#059669; }

        /* Approvals */
        .ed-app-table { width:100%; border-collapse:collapse; font-size:0.76rem; }
        .ed-app-table th { background:#f8fafc; font-size:0.68rem; font-weight:700; text-transform:uppercase; letter-spacing:.4px; color:#64748b; padding:7px 10px; border-bottom:1px solid #e2e8f0; white-space:nowrap; }
        .ed-app-table td { padding:9px 10px; border-bottom:1px solid #f1f5f9; color:#374151; vertical-align:middle; }
        .ed-app-table tr:hover td { background:#f8fafc; }
        .atype-badge { display:inline-block; padding:2px 7px; border-radius:3px; font-size:0.64rem; font-weight:800; letter-spacing:.3px; white-space:nowrap; }
        .atype-red    { background:#fee2e2; color:#991b1b; }
        .atype-blue   { background:#dbeafe; color:#1e40af; }
        .atype-orange { background:#ffedd5; color:#c2410c; }
        .atype-purple { background:#ede9fe; color:#5b21b6; }
        .atype-amber  { background:#fef3c7; color:#92400e; }
        .ed-app-actions { display:flex; gap:5px; }
        .btn-act { padding:3px 9px; border-radius:4px; font-size:0.7rem; font-weight:700; border:1px solid; cursor:pointer; white-space:nowrap; }
        .btn-details  { border-color:#cbd5e1; background:#fff; color:#475569; }
        .btn-approve  { border-color:#10b981; background:#f0fdf4; color:#065f46; }
        .btn-reject   { border-color:#ef4444; background:#fff5f5; color:#991b1b; }
        .btn-delegate { border-color:#a78bfa; background:#f5f3ff; color:#5b21b6; }
        .btn-act:hover { opacity:.8; }
        .ed-app-amount { font-family:'JetBrains Mono',monospace; font-weight:700; }
        .ed-app-since  { font-family:'JetBrains Mono',monospace; font-size:0.7rem; color:#94a3b8; }
        .ed-no-approvals { padding:16px; text-align:center; color:#94a3b8; font-size:0.8rem; }

        /* Charts */
        .ed-charts-row { display:grid; grid-template-columns:repeat(3,1fr); gap:14px; }
        .ed-chart-card { background:#fff; border:1px solid #e2e8f0; border-radius:8px; padding:14px; }
        .ed-chart-title { font-size:0.72rem; font-weight:800; text-transform:uppercase; letter-spacing:.5px; color:#475569; margin-bottom:10px; }
        .ed-chart-svg-wrap { overflow:visible; }
        .ed-chart-legend { display:flex; gap:12px; margin-top:8px; flex-wrap:wrap; }
        .ed-legend-item { display:flex; align-items:center; gap:4px; font-size:0.68rem; color:#64748b; }
        .ed-legend-dot  { width:8px; height:8px; border-radius:2px; }
        .ed-period-toggle { display:flex; gap:6px; margin-bottom:14px; }
        .ed-toggle-btn { padding:4px 12px; border-radius:4px; font-size:0.72rem; font-weight:700; cursor:pointer; border:1px solid #cbd5e1; background:#fff; color:#64748b; }
        .ed-toggle-btn.active { background:#0f172a; color:#fff; border-color:#0f172a; }

        /* Confirm modal */
        .ed-modal-overlay { position:fixed; inset:0; background:rgba(15,23,42,.45); z-index:1000; display:flex; align-items:center; justify-content:center; }
        .ed-modal { background:#fff; border-radius:10px; padding:24px; width:380px; box-shadow:0 20px 60px rgba(0,0,0,.2); }
        .ed-modal h3 { margin:0 0 8px; font-size:1rem; color:#0f172a; }
        .ed-modal p  { margin:0 0 16px; font-size:0.82rem; color:#475569; line-height:1.5; }
        .ed-modal-actions { display:flex; gap:8px; justify-content:flex-end; }
        .btn-modal-cancel  { padding:6px 16px; border-radius:5px; border:1px solid #cbd5e1; background:#fff; font-weight:700; font-size:0.8rem; cursor:pointer; }
        .btn-modal-confirm { padding:6px 16px; border-radius:5px; border:none; font-weight:700; font-size:0.8rem; cursor:pointer; }
        .btn-modal-approve { background:#10b981; color:#fff; }
        .btn-modal-reject  { background:#ef4444; color:#fff; }
      </style>`;

    // ── Branch selector ────────────────────────────────────────────────────
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-IN', { hour:'2-digit', minute:'2-digit', hour12:true });
    const dateStr = now.toLocaleDateString('en-IN', { weekday:'long', day:'2-digit', month:'short', year:'numeric' }).replace(/\//g,'-');

    const pillHtml = Object.values(branches).map(b => {
      const dot = healthDot(b.health);
      return `<span class="ed-pill${activeBranch === b.id ? ' active' : ''}" data-branch="${b.id}">${dot} ${b.label}</span>`;
    }).join('');

    const branchBar = `
      <div class="ed-branch-bar" id="ed-branch-bar">
        <div class="ed-branch-pills">
          <span class="ed-branch-label">Viewing:</span>
          ${pillHtml}
        </div>
        <div class="ed-branch-meta">
          <div>🔄 <b>Updated 3 min ago</b></div>
          <div>${dateStr.split(',')[0]}, ${now.toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'})} | ${timeStr}</div>
        </div>
      </div>`;

    // ── Section 1: Alerts ─────────────────────────────────────────────────
    let alertsHtml;
    if (visAlerts.length === 0) {
      alertsHtml = `<div class="ed-clear-bar">✓ All clear — no items requiring attention${isSingle ? ' for ' + branch.label : ' across all branches'}</div>`;
    } else {
      const rows = visAlerts.slice(0,6).map(a => {
        const cls = a.level === 'red' ? 'red' : a.level === 'amber' ? 'amber' : 'yellow';
        const icon = a.level === 'red' ? '🔴' : a.level === 'amber' ? '🟠' : '🟡';
        const branchTag = (!isSingle && a.branch !== 'all')
          ? `<span style="font-size:0.66rem;background:#f1f5f9;padding:1px 5px;border-radius:3px;color:#64748b;font-weight:700;">${branches[a.branch]?.short || a.branch.toUpperCase()}</span> `
          : '';
        return `
          <div class="ed-alert-row ed-alert-${cls}">
            <div class="ed-alert-body">
              <span style="font-size:0.85rem;margin-top:1px;flex-shrink:0;">${icon}</span>
              <div class="ed-alert-text">
                ${branchTag}${a.text}
                <div class="ed-elapsed">⏱ ${a.elapsed} elapsed</div>
              </div>
            </div>
            <button class="ed-act-btn ed-act-${cls}" onclick="router.navigate('${a.link}')">${a.label}</button>
          </div>`;
      }).join('');

      const moreCount = visAlerts.length - 6;
      const moreLink = moreCount > 0 ? `<div style="text-align:right;padding-top:8px;"><span class="ed-section-link">+ ${moreCount} more →</span></div>` : '';

      alertsHtml = `
        <div class="ed-card ed-card-red" style="padding:0;overflow:hidden;">
          <div style="padding:10px 14px;border-bottom:1px solid #fee2e2;display:flex;justify-content:space-between;align-items:center;">
            <div style="font-weight:800;font-size:0.8rem;color:#991b1b;text-transform:uppercase;letter-spacing:.5px;">⚠ Requires Immediate Attention</div>
            <button class="btn-act btn-details" onclick="window.edResolveAll()" style="font-size:0.7rem;">Resolve All</button>
          </div>
          ${rows}
          ${moreLink}
        </div>`;
    }

    // ── KPI Row A — Patient Operations ────────────────────────────────────
    const opdPct = kpi.opd > 300 ? '+4%' : '+6%';
    const bedSt = pctStatus(parseFloat(kpi.bedPct));
    const icuSt = pctStatus(parseFloat(kpi.icuPct));
    const disSt = kpi.pendingDischarge > 5 ? 'amber' : 'green';

    const kpiCards = [
      {
        name:'OPD Today', val:fmt(kpi.opd), sub:`Appt: ${fmt(Math.round(kpi.opd*.64))} · Walk-in: ${fmt(Math.round(kpi.opd*.36))}`,
        delta:`<span style="color:#10b981;">↑ ${opdPct} vs yesterday</span>`,
        branchSub: !isSingle ? 'BLR: 220 · WF: 80 · EC: 42' : '',
        status:'green', link:'opd-dashboard'
      },
      {
        name:'Emergency Today', val:fmt(kpi.emergency), sub:`MLC: 2 · BD: 1`,
        subStyle:'color:#dc2626;font-weight:700;',
        status:'amber', link:'emergency'
      },
      {
        name:'Admissions Today', val:fmt(kpi.admissions), sub:`Elective: ${Math.round(kpi.admissions*.7)} · Emergency: ${Math.round(kpi.admissions*.3)}`,
        status:'green', link:'atd'
      },
      {
        name:'Discharges Today', val:fmt(kpi.discharges),
        sub:`Pending: ${kpi.pendingDischarge}${kpi.pendingDischarge > 5 ? ' 🟠' : ''} · Any >6h: ${kpi.pendingDischarge > 3 ? '3 🔴' : '0'}`,
        subStyle: kpi.pendingDischarge > 5 ? 'color:#d97706;font-weight:700;' : '',
        status: disSt, link:'atd'
      },
      {
        name:'Bed Occupancy', val:kpi.bedPct + '%', sub:`${kpi.bedOcc} / ${kpi.bedTotal} beds · ICU: ${kpi.icuPct}%`,
        branchSub: !isSingle ? 'BLR: 84% · WF: 76% · EC: 69%' : '',
        status: bedSt, link:'atd'
      },
      {
        name:'ICU Occupancy', val:kpi.icuPct + '%', sub:`${kpi.icuOcc}/${kpi.icuTotal} · Vent: 12 · Free: ${kpi.icuTotal - kpi.icuOcc}`,
        subStyle: kpi.icuPct >= 90 ? 'color:#dc2626;font-weight:700;' : '',
        branchSub: !isSingle ? 'BLR: 94% · WF: 88% · EC: 72%' : '',
        status: icuSt, link:'atd'
      }
    ];

    const kpiOpsHtml = kpiCards.map(k => `
      <div class="ed-kpi border-${k.status}" onclick="router.navigate('${k.link}')">
        <div class="ed-kpi-status">${statusDot(k.status)}</div>
        <div class="ed-kpi-name">${k.name}</div>
        <div class="ed-kpi-val mono">${k.val}</div>
        <div class="ed-kpi-sub"${k.subStyle ? ` style="${k.subStyle}"` : ''}>${k.sub}</div>
        ${k.delta ? `<div class="ed-kpi-delta">${k.delta}</div>` : ''}
        ${k.branchSub ? `<div class="ed-kpi-branch">${k.branchSub}</div>` : ''}
      </div>`).join('');

    // ── KPI Row B — Financial ─────────────────────────────────────────────
    let kpiFinHtml = '';
    if (hasFinance) {
      const finCards = [
        { name:'Revenue Today',  val:fmtRs(kpi.revenue || consolidated.revenue),
          sub:'OPD ₹1.2L · IPD ₹2.8L · Pharma ₹0.9L', delta:'<span style="color:#10b981;">↑ 8% vs yesterday</span>',
          branchSub: !isSingle ? 'BLR: ₹3.1L · WF: ₹1.0L · EC: ₹0.7L' : '', status:'green', link:'billing' },
        { name:'Collections Today', val:fmtRs(kpi.collections || consolidated.collections),
          sub:'Cash ₹95K · UPI ₹2.4L · Card ₹83K', status:'green', link:'billing' },
        { name:'Outstanding Receivables', val:'₹84.2L',
          sub:'TPA ₹42.5L · CGHS ₹28.7L · Corp ₹3L', status:'red', link:'billing' },
        { name:'Insurance Pending', val:'85 claims',
          sub:'Overdue: 5 🔴 · Queries: 6', status:'amber', link:'insurance' },
        { name:'Payer Mix', val:'',
          sub:'Self: 35% · TPA: 45%<br>CGHS: 12% · PMJAY: 8%', status:'green', link:'billing' },
      ];
      kpiFinHtml = `
        <div style="margin-top:6px;">
          <div class="ed-section-title" style="margin-bottom:6px;">💰 Financial Snapshot</div>
          <div class="ed-kpi-fin">
            ${finCards.map(k => `
              <div class="ed-kpi border-${k.status}" onclick="router.navigate('${k.link}')">
                <div class="ed-kpi-status">${statusDot(k.status)}</div>
                <div class="ed-kpi-name">${k.name}</div>
                ${k.val ? `<div class="ed-kpi-val mono" style="font-size:1.15rem;">${k.val}</div>` : ''}
                <div class="ed-kpi-sub">${k.sub}</div>
                ${k.delta ? `<div class="ed-kpi-delta">${k.delta}</div>` : ''}
                ${k.branchSub ? `<div class="ed-kpi-branch">${k.branchSub}</div>` : ''}
              </div>`).join('')}
          </div>
        </div>`;
    }

    // ── Right: Dept Status ────────────────────────────────────────────────
    const depts = [
      { status:'green', name:'OPD Services',
        meta:'Waiting: 18 · Avg wait: 22 min',
        alert: !isSingle ? 'All branches within SLA' : '', alertAmber:false, link:'opd-dashboard' },
      { status:'red', name:'Emergency / Casualty',
        meta:`Active: ${kpi.emergency} · Resus: 2/2${!isSingle ? ' (BLR full)' : ''}`,
        alert:'⚠ MLC case active · Resus bay full', alertAmber:true, link:'emergency' },
      { status:'amber', name:'IPD / ATD',
        meta:`Inpatients: ${kpi.bedOcc} · D/C pending: ${kpi.pendingDischarge}`,
        alert:`⚠ 3 pending >6h${!isSingle ? ' (BLR: 2 · WF: 1)' : ''}`, alertAmber:true, link:'atd' },
      { status:'amber', name:'Diagnostics (Lab + Radiology)',
        meta:'Lab: 45 pending · Critical: 2 🔴 · Radiology: 8 studies',
        alert:'⚠ 2 critical unacknowledged results', alertAmber:true, link:'lab' },
      { status:'amber', name:'Billing & Insurance',
        meta:'Recon: ✓ · Pre-auths pending: 12',
        alert:'⚠ TPA queries: 6 · LOA expired: 3', alertAmber:true, link:'billing' },
    ];

    const deptHtml = `
      <div class="ed-card" style="padding:0;overflow:hidden;">
        <div class="ed-section-title" style="padding:10px 14px;border-bottom:1px solid #f1f5f9;margin:0;">
          🏥 Live Department Status
          ${!isSingle ? '<span style="font-size:0.66rem;color:#94a3b8;font-weight:600;">Worst status across branches</span>' : ''}
        </div>
        <div class="ed-dept-list">
          ${depts.map(d => `
            <div class="ed-dept-row" onclick="router.navigate('${d.link}')">
              <div class="ed-dept-header">
                <div class="ed-dept-name">${statusDot(d.status)} ${d.name}</div>
                <span class="ed-dept-link">[→ ${d.name.split(' ')[0]}]</span>
              </div>
              <div class="ed-dept-meta">${d.meta}</div>
              ${d.alert ? `<div class="ed-dept-alert-line">${d.alert}</div>` : ''}
            </div>`).join('')}
        </div>
        <div class="ed-resource-strip">
          <div class="ed-resource-line"><span>🔪</span><span>OT: 83.3% utilisation (8/12) · Delayed: 1 🟠</span><span class="ed-section-link" onclick="router.navigate('ot')" style="margin-left:auto;">[→ OT]</span></div>
          <div class="ed-resource-line"><span>👥</span><span>Staff on duty: Doctors <b class="mono">48/50</b> · Nurses <b class="mono">110/115</b> · Absent unplanned: <b class="mono">2</b> 🟢</span></div>
          <div class="ed-resource-line"><span>🔧</span><span>Biomedical: 1 critical item down — MRI Console${!isSingle ? ' (BLR)' : ''} 🔴</span><span class="ed-section-link" onclick="router.navigate('hospMgmt')" style="margin-left:auto;">[→ Tickets]</span></div>
        </div>
      </div>`;

    // ── Bed Summary ───────────────────────────────────────────────────────
    const bedBranchCols = !isSingle ? `<th>BLR</th><th>WF</th><th>EC</th>` : '';
    const bedRows = bedTable.map(r => {
      const cls = r.status === 'red' ? 'ed-bed-occ-red' : r.status === 'amber' ? 'ed-bed-occ-amber' : 'ed-bed-occ-green';
      const dot = statusDot(r.status);
      return `<tr>
        <td>${r.cat}</td>
        <td>${r.total}</td><td>${r.occ}</td><td>${r.avail}</td>
        ${!isSingle ? `<td>${r.blr}</td><td>${r.wf}</td><td>${r.ec}</td>` : ''}
        <td class="${cls}">${r.pct}% ${dot}</td>
      </tr>`;
    }).join('');

    // Totals
    const totTotal = bedTable.reduce((s,r)=>s+r.total,0);
    const totOcc   = bedTable.reduce((s,r)=>s+r.occ,0);
    const totAvail = bedTable.reduce((s,r)=>s+r.avail,0);
    const totPct   = Math.round(totOcc/totTotal*100);
    const totSt    = pctStatus(totPct);
    const totCls   = totSt === 'red' ? 'ed-bed-occ-red' : totSt === 'amber' ? 'ed-bed-occ-amber' : 'ed-bed-occ-green';

    const bedSummary = `
      <div class="ed-card">
        <div class="ed-section-title">
          🛏 Bed Occupancy Summary
          <span class="ed-section-link" onclick="router.navigate('atd')">View Full Bed Board →</span>
        </div>
        <table class="ed-bed-table">
          <thead><tr>
            <th>Category</th><th>Total</th><th>Occ</th><th>Avail</th>
            ${bedBranchCols}
            <th>Occ%</th>
          </tr></thead>
          <tbody>
            ${bedRows}
            <tr>
              <td>TOTAL</td>
              <td>${totTotal}</td><td>${totOcc}</td><td>${totAvail}</td>
              ${!isSingle ? `<td>84%</td><td>76%</td><td>68%</td>` : ''}
              <td class="${totCls}">${totPct}% ${statusDot(totSt)}</td>
            </tr>
          </tbody>
        </table>
        <div style="font-size:0.68rem;color:#94a3b8;margin-top:8px;">Cleaning: 8 beds &nbsp;·&nbsp; Blocked: 3 beds (excluded from availability)</div>
      </div>`;

    // ── Section 4: Approvals ──────────────────────────────────────────────
    let appContent;
    if (approvals.length === 0) {
      appContent = `<div class="ed-no-approvals">No approvals pending</div>`;
    } else {
      const appRows = approvals.map((a,i) => {
        const actionBtns = hasFullApproval
          ? `<button class="btn-act btn-details"  onclick="window.edApprovalModal(${i},'details')">Details</button>
             <button class="btn-act btn-approve"  onclick="window.edApprovalModal(${i},'approve')">Approve</button>
             <button class="btn-act btn-reject"   onclick="window.edApprovalModal(${i},'reject')">Reject</button>
             <button class="btn-act btn-delegate" onclick="window.edApprovalModal(${i},'delegate')">Delegate</button>`
          : `<button class="btn-act btn-details"  onclick="window.edApprovalModal(${i},'details')">View Details</button>`;
        return `<tr>
          <td style="color:#94a3b8;font-family:'JetBrains Mono',monospace;font-size:0.7rem;">${i+1}</td>
          <td><span class="atype-badge ${a.typeClass}">${a.type}</span></td>
          <td style="max-width:220px;">${a.desc}</td>
          <td style="color:#64748b;">${a.dept}</td>
          ${!isSingle ? `<td style="color:#94a3b8;font-size:0.7rem;font-weight:700;">${a.branch}</td>` : ''}
          <td class="ed-app-amount">${a.amount}</td>
          <td style="color:#64748b;font-size:0.72rem;">${a.by}</td>
          <td class="ed-app-since">${a.since}</td>
          <td><div class="ed-app-actions">${actionBtns}</div></td>
        </tr>`;
      }).join('');

      appContent = `
        <div style="overflow-x:auto;">
          <table class="ed-app-table">
            <thead><tr>
              <th>#</th><th>Type</th><th>Description</th><th>Dept</th>
              ${!isSingle ? '<th>Branch</th>' : ''}
              <th>Amount</th><th>Requested By</th><th>Since</th><th>Actions</th>
            </tr></thead>
            <tbody>${appRows}</tbody>
          </table>
        </div>`;
    }

    const appSection = `
      <div class="ed-card">
        <div class="ed-section-title">📋 Pending Executive Approvals</div>
        ${appContent}
      </div>`;

    // ── Section 5: Trend Charts ───────────────────────────────────────────
    const W = 240, H = 90;
    const xLabels = trendDays7;

    // Chart 1: OPD Visits vs Target
    const opdMin = 30, opdMax = 250;
    const c1 = `
      <svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" class="ed-chart-svg-wrap">
        ${svgBar(opdBlr7, W, H, '#3b82f6', opdMin, opdMax)}
        ${svgBar(opdWf7.map((v,i)=>v+opdBlr7[i]), W, H, '#10b981', opdMin, opdMax)}
        ${svgBar(opdEc7.map((v,i)=>v+opdBlr7[i]+opdWf7[i]), W, H, '#06b6d4', opdMin, opdMax)}
        ${svgDashedH(230, W, H, '#ef4444', opdMin, opdMax)}
      </svg>`;

    // Chart 2: Admissions & Discharges
    const adMin = 15, adMax = 35;
    const c2 = `
      <svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" class="ed-chart-svg-wrap">
        ${svgBar(adm7, W, H, '#6366f1', adMin, adMax)}
        ${svgBar(dis7, W, H, '#10b981', adMin, adMax)}
      </svg>`;

    // Chart 3: Bed Occupancy %
    const boMin = 60, boMax = 100;
    const c3 = `
      <svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" class="ed-chart-svg-wrap">
        ${svgLine(bedBlr7, W, H, '#3b82f6', boMin, boMax)}
        ${svgLine(bedWf7,  W, H, '#10b981', boMin, boMax)}
        ${svgLine(bedEc7,  W, H, '#06b6d4', boMin, boMax)}
        ${svgDashedH(85, W, H, '#ef4444', boMin, boMax)}
      </svg>`;

    const xLabelSvg = `<svg width="${W}" height="14" viewBox="0 0 ${W} 14"><g>${svgXLabels(xLabels.map(d=>d.split('-')[0]), W)}</g></svg>`;

    const chartsSection = `
      <div class="ed-card">
        <div class="ed-section-title">
          📈 Operational Trends
          <div class="ed-period-toggle" style="margin:0;">
            <button class="ed-toggle-btn${trendPeriod==='7d'?' active':''}" onclick="window.edTogglePeriod('7d')">Last 7 Days</button>
            <button class="ed-toggle-btn${trendPeriod==='30d'?' active':''}" onclick="window.edTogglePeriod('30d')">Last 30 Days</button>
          </div>
        </div>
        <div class="ed-charts-row">
          <div class="ed-chart-card">
            <div class="ed-chart-title">OPD Visits vs Target</div>
            ${c1}${xLabelSvg}
            <div class="ed-chart-legend">
              <div class="ed-legend-item"><div class="ed-legend-dot" style="background:#3b82f6"></div>BLR</div>
              <div class="ed-legend-item"><div class="ed-legend-dot" style="background:#10b981"></div>WF</div>
              <div class="ed-legend-item"><div class="ed-legend-dot" style="background:#06b6d4"></div>EC</div>
              <div class="ed-legend-item"><div class="ed-legend-dot" style="background:#ef4444;height:3px;border-radius:0;"></div>Target</div>
            </div>
          </div>
          <div class="ed-chart-card">
            <div class="ed-chart-title">Admissions &amp; Discharges</div>
            ${c2}${xLabelSvg}
            <div class="ed-chart-legend">
              <div class="ed-legend-item"><div class="ed-legend-dot" style="background:#6366f1"></div>Admissions</div>
              <div class="ed-legend-item"><div class="ed-legend-dot" style="background:#10b981"></div>Discharges</div>
            </div>
          </div>
          <div class="ed-chart-card">
            <div class="ed-chart-title">Bed Occupancy %</div>
            ${c3}${xLabelSvg}
            <div class="ed-chart-legend">
              <div class="ed-legend-item"><div class="ed-legend-dot" style="background:#3b82f6"></div>BLR</div>
              <div class="ed-legend-item"><div class="ed-legend-dot" style="background:#10b981"></div>WF</div>
              <div class="ed-legend-item"><div class="ed-legend-dot" style="background:#06b6d4"></div>EC</div>
              <div class="ed-legend-item"><div class="ed-legend-dot" style="background:#ef4444;height:2px;border-radius:0;"></div>85% threshold</div>
            </div>
          </div>
        </div>
      </div>`;

    // ── Sign census button for MS ─────────────────────────────────────────
    const signBtn = isMS ? `
      <div style="margin-bottom:4px;">
        <button id="ed-sign-census" onclick="window.signDailyCensusExec()" style="background:#ffedd5;color:#c2410c;border:1px solid #fed7aa;border-radius:6px;padding:8px 16px;font-weight:700;font-size:0.8rem;cursor:pointer;display:flex;align-items:center;gap:6px;">
          ✍️ Sign Daily Census — Bengaluru Campus (pending)
        </button>
      </div>` : '';

    // ── Assemble ──────────────────────────────────────────────────────────
    container.innerHTML = `
      ${css}
      <div class="ed-wrap" id="ed-main-wrap">
        ${branchBar}
        <div style="padding:0 20px;display:flex;flex-direction:column;gap:14px;">
          ${signBtn}
          ${alertsHtml}
          <div class="ed-two-col">
            <div style="display:flex;flex-direction:column;gap:10px;">
              <div class="ed-card">
                <div class="ed-section-title">📊 Patient Operations — <span style="font-weight:600;text-transform:none;">${bLabel}</span></div>
                <div class="ed-kpi-grid">${kpiOpsHtml}</div>
              </div>
              ${hasFinance ? `<div class="ed-card">${kpiFinHtml}</div>` : ''}
            </div>
            ${deptHtml}
          </div>
          ${bedSummary}
          ${appSection}
          ${chartsSection}
        </div>
      </div>`;

    // ── Event: branch pills ───────────────────────────────────────────────
    document.querySelectorAll('.ed-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        activeBranch = pill.dataset.branch;
        render();
      });
    });

    // ── Event: resolve all alerts ─────────────────────────────────────────
    window.edResolveAll = function() {
      const section = document.querySelector('.ed-card.ed-card-red');
      if (section) {
        section.outerHTML = `<div class="ed-clear-bar">✓ All alerts acknowledged — monitoring continues</div>`;
      }
    };

    // ── Event: approval modal ─────────────────────────────────────────────
    window.edApprovalModal = function(idx, action) {
      const a = approvals[idx];
      if (!a) return;
      let title, body, confirmClass, confirmLabel;
      if (action === 'approve') {
        title = 'Confirm Approval'; body = `Approve <b>${a.type}</b> request for <b>${a.desc}</b>?${a.amount !== '—' ? ' Amount: <b>' + a.amount + '</b>.' : ''} This action cannot be undone.`;
        confirmClass = 'btn-modal-approve'; confirmLabel = 'Approve';
      } else if (action === 'reject') {
        title = 'Confirm Rejection'; body = `Reject <b>${a.type}</b> request: <b>${a.desc}</b>? Please note the reason will be recorded.`;
        confirmClass = 'btn-modal-reject'; confirmLabel = 'Reject';
      } else if (action === 'delegate') {
        title = 'Delegate Approval'; body = `Delegate <b>${a.type}</b> — <b>${a.desc}</b> to another executive for review.`;
        confirmClass = 'btn-modal-approve'; confirmLabel = 'Delegate';
      } else {
        title = 'Approval Details'; body = `<b>${a.type}</b><br>${a.desc}<br>Dept: ${a.dept} · Branch: ${a.branch} · Amount: ${a.amount}<br>Requested by: ${a.by} · ${a.since}`;
        confirmClass = 'btn-modal-approve'; confirmLabel = 'Close';
      }
      const overlay = document.createElement('div');
      overlay.className = 'ed-modal-overlay';
      overlay.innerHTML = `
        <div class="ed-modal">
          <h3>${title}</h3>
          <p>${body}</p>
          <div class="ed-modal-actions">
            <button class="btn-modal-cancel" onclick="this.closest('.ed-modal-overlay').remove()">Cancel</button>
            <button class="btn-modal-confirm ${confirmClass}" onclick="this.closest('.ed-modal-overlay').remove()">${confirmLabel}</button>
          </div>
        </div>`;
      document.body.appendChild(overlay);
    };

    // ── Event: trend period toggle ────────────────────────────────────────
    window.edTogglePeriod = function(period) {
      trendPeriod = period;
      render();
    };

    // ── Sign census ───────────────────────────────────────────────────────
    window.signDailyCensusExec = function() {
      const btn = document.getElementById('ed-sign-census');
      if (btn) { btn.style.background='#d1fae5'; btn.style.color='#065f46'; btn.style.borderColor='#6ee7b7'; btn.textContent='✓ Daily Census Signed — Bengaluru Campus'; btn.disabled=true; }
    };
  }

  render();
}
'''

with open(path, 'r', encoding='utf-8') as f:
    src = f.read()

# Find start and end of the old function
START_MARKER = '// --------------------------------------------------------------------------\n// EXECUTIVE MANAGEMENT DASHBOARD (EXECUTIVE ROLES)\n// --------------------------------------------------------------------------\nfunction renderExecutiveDashboard(container, activeRole) {'
END_MARKER = '\n}\n'  # closing brace of the function

start_idx = src.find(START_MARKER)
if start_idx == -1:
    # Try alternate marker
    start_idx = src.find('function renderExecutiveDashboard(container, activeRole) {')
    if start_idx == -1:
        print("ERROR: Could not find renderExecutiveDashboard function")
        exit(1)
    # Walk back to find comment block
    look_back = src.rfind('//', 0, start_idx)
    start_idx = look_back

# Find the closing brace — walk forward counting braces
brace_count = 0
i = src.find('{', start_idx)
end_idx = i
while i < len(src):
    if src[i] == '{': brace_count += 1
    elif src[i] == '}':
        brace_count -= 1
        if brace_count == 0:
            end_idx = i + 1
            break
    i += 1

old_func = src[start_idx:end_idx]
print(f"Found function at char {start_idx}–{end_idx} ({len(old_func):,} chars)")

new_src = src[:start_idx] + NEW_FUNCTION + src[end_idx:]

with open(path, 'w', encoding='utf-8') as f:
    f.write(new_src)

print(f"SUCCESS — wrote {len(new_src):,} chars to dashboardView.js")
print(f"Replaced {len(old_func):,} chars with {len(NEW_FUNCTION):,} chars")
