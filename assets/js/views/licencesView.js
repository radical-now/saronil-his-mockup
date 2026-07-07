/* ==========================================================================
   SARONIL HMS — LICENCE & REGULATORY COMPLIANCE REPOSITORY
   Route: #licences  |  RBAC: Administrator / CEO / General Manager
   ========================================================================== */
'use strict';
window.views = window.views || {};

(function () {

  /* ── STATE SEED ──────────────────────────────────────────────────────────── */
  function initLicenceState() {
    if (!window.state) window.state = {};
    if (window.state.licences) return;
    const today = new Date();
    function dfn(n) { const d = new Date(today); d.setDate(d.getDate() + n); return d.toISOString().slice(0,10); }
    window.state.licences = [
      { id:'LIC-001', name:'Clinical Establishment Act Registration', category:'Clinical Establishment Act Registration', branch:'Bengaluru Campus', licenceNumber:'CEA/KA/2021/04817', issuingAuthority:'Directorate of Health & Family Welfare Services, Karnataka', issueDate:'2021-04-01', expiryDate:dfn(210), renewalOwner:'Dr. Ramesh Iyer', reminderDays:[90,60,30,7], remarks:'Covers 120-bed inpatient facility. Bed-count cap applies.', documentName:'CEA_Registration_2021.pdf', manualStatus:null, renewalHistory:[{ oldLicenceNumber:'CEA/KA/2018/02100', oldExpiry:'2021-03-31', renewedOn:'2021-03-15', renewedBy:'Dr. Ramesh Iyer', docName:'CEA_Registration_2018.pdf' }] },
      { id:'LIC-002', name:'Fire NOC — Bengaluru Campus', category:'Fire NOC', branch:'Bengaluru Campus', licenceNumber:'KFSB/NOC/2022/BLR/7821', issuingAuthority:'Karnataka Fire & Emergency Services', issueDate:'2022-06-15', expiryDate:dfn(45), renewalOwner:'Suresh Prabhu (Facility Manager)', reminderDays:[90,60,30,7], remarks:'Covers Ground + 4 floors. Annual fire drill certificate required.', documentName:'FireNOC_2022.pdf', manualStatus:null, renewalHistory:[] },
      { id:'LIC-003', name:'Biomedical Waste Authorization', category:'Biomedical Waste Authorization (BMW Rules 2016)', branch:'All Branches', licenceNumber:'KSPCB/BMW/2023/0044', issuingAuthority:'Karnataka State Pollution Control Board', issueDate:'2023-01-10', expiryDate:dfn(280), renewalOwner:'Anita Varghese (Quality Officer)', reminderDays:[90,60,30,7], remarks:'Tied to authorised CBWTF contractor agreement.', documentName:'BMW_Authorization_2023.pdf', manualStatus:null, renewalHistory:[] },
      { id:'LIC-004', name:'Pollution Control Board Consent (CTO)', category:'Pollution Control Board Consent (CTE/CTO)', branch:'Bengaluru Campus', licenceNumber:'KSPCB/CTO/2022/HOS/1192', issuingAuthority:'Karnataka State Pollution Control Board', issueDate:'2022-04-01', expiryDate:dfn(-15), renewalOwner:'Anita Varghese (Quality Officer)', reminderDays:[90,60,30,7], remarks:'ETP operational compliance mandatory for renewal.', documentName:'PCB_CTO_2022.pdf', manualStatus:null, renewalHistory:[] },
      { id:'LIC-005', name:'Blood Bank Licence', category:'Blood Bank Licence (Drugs & Cosmetics Act Sch. F)', branch:'Bengaluru Campus', licenceNumber:'KA-BB/DC/2023/0089', issuingAuthority:'Drug Controller General of India / State Drug Authority', issueDate:'2023-07-01', expiryDate:dfn(355), renewalOwner:'Dr. Priya Nair', reminderDays:[90,60,30,7], remarks:'Scope: Whole Blood, RBCs, Platelets, FFP. Component separation included.', documentName:'BloodBank_Licence_2023.pdf', manualStatus:null, renewalHistory:[] },
      { id:'LIC-006', name:'Pharmacy Licence — Retail', category:'Pharmacy Licence - Retail', branch:'Bengaluru Campus', licenceNumber:'KA/DL/RET/2022/00341', issuingAuthority:'Karnataka State Pharmacy Council', issueDate:'2022-09-01', expiryDate:dfn(60), renewalOwner:'Ravi Shankar (Chief Pharmacist)', reminderDays:[90,60,30,7], remarks:'', documentName:'Pharmacy_Retail_2022.pdf', manualStatus:'Renewal in Progress', renewalHistory:[] },
      { id:'LIC-007', name:'AERB Licence — Radiation Sources', category:'AERB Licence', branch:'Bengaluru Campus', licenceNumber:'AERB/MED/KA/2021/00214', issuingAuthority:'Atomic Energy Regulatory Board, Mumbai', issueDate:'2021-10-01', expiryDate:dfn(480), renewalOwner:'Dr. Krishnamurthy (Radiologist)', reminderDays:[90,60,30,7], remarks:'Covers CT scanner, C-Arm, Digital X-Ray units.', documentName:'AERB_2021.pdf', manualStatus:null, renewalHistory:[] },
      { id:'LIC-008', name:'NABH Accreditation', category:'NABH Accreditation', branch:'All Branches', licenceNumber:'NABH/H/KA/2022/0771', issuingAuthority:'National Accreditation Board for Hospitals & Healthcare Providers', issueDate:'2022-03-20', expiryDate:dfn(620), renewalOwner:'Anita Varghese (Quality Officer)', reminderDays:[90,60,30,7], remarks:'3rd cycle accreditation. Surveillance audit due in month 18.', documentName:'NABH_Certificate_2022.pdf', manualStatus:null, renewalHistory:[] },
      { id:'LIC-009', name:'GST Registration', category:'GST Registration', branch:'All Branches', licenceNumber:'29AABCS1429B1ZV', issuingAuthority:'Goods and Services Tax Network (GSTN)', issueDate:'2017-07-01', expiryDate:dfn(3650), renewalOwner:'Pradeep Kamath (CFO)', reminderDays:[90,60,30,7], remarks:'Perpetual registration; renewal not required unless business change.', documentName:'GST_Certificate.pdf', manualStatus:null, renewalHistory:[] },
      { id:'LIC-010', name:'ABDM / Health Facility Registry', category:'ABDM/HFR Registration', branch:'All Branches', licenceNumber:'HFR/ABDM/KA/230771', issuingAuthority:'National Health Authority (NHA)', issueDate:'2023-04-01', expiryDate:dfn(550), renewalOwner:'IT Head - Saronil HIS', reminderDays:[90,60,30,7], remarks:'HFR & HPR linked. Linked to PMJAY empanelment.', documentName:'HFR_Certificate_2023.pdf', manualStatus:null, renewalHistory:[] }
    ];
    _seedLicenceAlerts();
  }

  /* ── STATUS LOGIC ────────────────────────────────────────────────────────── */
  function computeStatus(lic) {
    if (lic.manualStatus === 'Renewal in Progress') return 'Renewal in Progress';
    var today = new Date(); today.setHours(0,0,0,0);
    var exp = new Date(lic.expiryDate); exp.setHours(0,0,0,0);
    var diff = Math.round((exp - today) / 86400000);
    if (diff < 0) return 'Expired';
    if (diff <= 90) return 'Expiring Soon';
    return 'Active';
  }

  function dte(expiryDate) {
    var today = new Date(); today.setHours(0,0,0,0);
    var exp = new Date(expiryDate); exp.setHours(0,0,0,0);
    return Math.round((exp - today) / 86400000);
  }

  function statusBadge(status) {
    var map = { 'Active':'badge-success', 'Expiring Soon':'badge-warning', 'Expired':'badge-danger', 'Renewal in Progress':'badge-primary' };
    var icons = { 'Active':'&#10003; ', 'Expiring Soon':'&#9888; ', 'Expired':'&#128308; ', 'Renewal in Progress':'&#128260; ' };
    return '<span class="badge ' + (map[status]||'badge-info') + '">' + (icons[status]||'') + status + '</span>';
  }

  function fmtDate(d) {
    if (!d) return '-';
    return new Date(d).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' });
  }

  function esc(str) {
    if (!str) return '';
    return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  /* ── ALERT SEEDING ───────────────────────────────────────────────────────── */
  function _seedLicenceAlerts() {
    window.state.alerts = window.state.alerts || [];
    (window.state.licences || []).forEach(function(lic) {
      var status = computeStatus(lic);
      var days = dte(lic.expiryDate);
      var severity = null, details = '';
      if (status === 'Expired') {
        severity = 'High Risk';
        details = 'EXPIRED: Licence "' + lic.name + '" (' + lic.licenceNumber + ') expired ' + Math.abs(days) + ' day(s) ago. Renewal Owner: ' + lic.renewalOwner + '. Immediate action required.';
      } else if (status === 'Expiring Soon') {
        severity = days <= 30 ? 'Warning' : 'Information';
        details = 'Licence "' + lic.name + '" (' + lic.licenceNumber + ') expires in ' + days + ' day(s) on ' + fmtDate(lic.expiryDate) + '. Renewal Owner: ' + lic.renewalOwner + '.';
      }
      if (severity) {
        var exists = window.state.alerts.some(function(a) { return a.licenceId === lic.id; });
        if (!exists) {
          window.state.alerts.push({ id:'ALT-LIC-'+lic.id, licenceId:lic.id, severity:severity, source:'Licence & Compliance', patientName:'-', uhid:'-', details:details, clinician:lic.renewalOwner, time:new Date().toLocaleDateString('en-IN'), status:'Active', eStatus:'Open' });
        }
      }
    });
  }

  function _refreshAlert(licId) {
    window.state.alerts = (window.state.alerts || []).filter(function(a){ return a.licenceId !== licId; });
    var lic = (window.state.licences || []).find(function(l){ return l.id === licId; });
    if (!lic) return;
    var status = computeStatus(lic), days = dte(lic.expiryDate), severity = null, details = '';
    if (status === 'Expired') { severity = 'High Risk'; details = 'EXPIRED: "' + lic.name + '" (' + lic.licenceNumber + ') expired ' + Math.abs(days) + 'd ago. Owner: ' + lic.renewalOwner; }
    else if (status === 'Expiring Soon') { severity = days <= 30 ? 'Warning' : 'Information'; details = '"' + lic.name + '" expires in ' + days + 'd on ' + fmtDate(lic.expiryDate) + '. Owner: ' + lic.renewalOwner; }
    if (severity) window.state.alerts.push({ id:'ALT-LIC-'+licId, licenceId:licId, severity:severity, source:'Licence & Compliance', patientName:'-', uhid:'-', details:details, clinician:lic.renewalOwner, time:new Date().toLocaleDateString('en-IN'), status:'Active', eStatus:'Open' });
  }

  /* ── MODULE STATE ────────────────────────────────────────────────────────── */
  var _screen = 'list', _editId = null, _detailId = null, _isRenewal = false;
  var _fb = 'All', _fc = 'All', _fs = 'All', _fq = '';

  var CATS = ['Clinical Establishment Act Registration','Fire NOC','Biomedical Waste Authorization (BMW Rules 2016)','Pollution Control Board Consent (CTE/CTO)','Blood Bank Licence (Drugs & Cosmetics Act Sch. F)','Pharmacy Licence - Retail','Pharmacy Licence - Wholesale','Narcotic/Psychotropic Licence (NDPS)','PCPNDT Registration','AERB Licence','NABL Accreditation','NABH Accreditation','Lift Licence','Trade Licence','GST Registration','PF/ESI Registration','PMJAY Empanelment','CGHS Empanelment','ABDM/HFR Registration','Other'];
  var BRANCHES = ['Bengaluru Campus','Whitefield','Electronic City','All Branches'];

  /* ── ENTRY POINT ─────────────────────────────────────────────────────────── */
  window.views.licences = function(container) {
    initLicenceState();
    if (_screen === 'detail') { _renderDetail(container); return; }
    if (_screen === 'form')   { _renderForm(container);   return; }
    _renderList(container);
  };

  /* ── SCREEN 1: LIST ──────────────────────────────────────────────────────── */
  function _renderList(container) {
    var lics = window.state.licences || [];
    var total = lics.length;
    var exp30 = lics.filter(function(l){ var d=dte(l.expiryDate); return d>=0 && d<=30 && computeStatus(l)!=='Renewal in Progress'; }).length;
    var expired = lics.filter(function(l){ return computeStatus(l)==='Expired'; }).length;
    var inprog  = lics.filter(function(l){ return computeStatus(l)==='Renewal in Progress'; }).length;
    var filtered = lics.filter(function(l){
      var s = computeStatus(l), q = _fq.toLowerCase();
      return (_fb==='All'||l.branch===_fb) && (_fc==='All'||l.category===_fc) && (_fs==='All'||s===_fs) && (q===''||l.name.toLowerCase().includes(q)||l.licenceNumber.toLowerCase().includes(q));
    });

    var rows = filtered.length === 0
      ? '<tr><td colspan="10" style="text-align:center;padding:2.5rem;color:var(--text-muted);font-style:italic;">No licences match current filters.</td></tr>'
      : filtered.map(function(l) {
          var s = computeStatus(l), d = dte(l.expiryDate);
          var dc = d<0 ? 'color:var(--color-danger);font-weight:700;' : d<=30 ? 'color:var(--color-danger);font-weight:700;' : d<=90 ? 'color:var(--color-warning);font-weight:600;' : 'color:var(--color-success);';
          var dt = d<0 ? Math.abs(d)+'d ago' : 'in '+d+'d';
          var renewBtn = (s!=='Active'||d<=90) ? '<button class="btn btn-primary btn-sm" onclick="event.stopPropagation();window._licNav(\'form\',\''+l.id+'\',true)" style="margin-left:4px;">Renew</button>' : '';
          var docBtn = l.documentName ? '<button class="btn btn-secondary btn-sm" onclick="event.stopPropagation();window._licDownload(\''+l.id+'\')" style="margin-left:4px;">Doc</button>' : '';
          return '<tr style="cursor:pointer;" onclick="window._licNav(\'detail\',\''+l.id+'\',false)">'
            +'<td><div style="font-weight:600;color:var(--primary);">'+esc(l.name)+'</div>'+(l.documentName?'<div style="font-size:0.68rem;color:var(--text-muted);">&#128206; '+esc(l.documentName)+'</div>':'')+'</td>'
            +'<td style="font-size:0.73rem;color:var(--text-secondary);max-width:150px;white-space:normal;">'+esc(l.category)+'</td>'
            +'<td><span class="badge badge-info" style="font-size:0.68rem;">'+esc(l.branch)+'</span></td>'
            +'<td class="admin-mono" style="font-size:0.73rem;">'+esc(l.licenceNumber)+'</td>'
            +'<td style="font-size:0.73rem;color:var(--text-secondary);max-width:140px;white-space:normal;">'+esc(l.issuingAuthority)+'</td>'
            +'<td style="white-space:nowrap;">'+fmtDate(l.issueDate)+'</td>'
            +'<td style="white-space:nowrap;">'+fmtDate(l.expiryDate)+'<br><span style="'+dc+'font-size:0.7rem;">'+dt+'</span></td>'
            +'<td>'+statusBadge(s)+'</td>'
            +'<td style="font-size:0.73rem;">'+esc(l.renewalOwner)+'</td>'
            +'<td style="text-align:right;white-space:nowrap;" onclick="event.stopPropagation()">'
              +'<button class="btn btn-secondary btn-sm" onclick="window._licNav(\'detail\',\''+l.id+'\',false)">View</button>'
              +' <button class="btn btn-secondary btn-sm" onclick="window._licNav(\'form\',\''+l.id+'\',false)">Edit</button>'
              +renewBtn+docBtn
            +'</td>'
          +'</tr>';
        }).join('');

    container.innerHTML = ''
      +'<div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:12px;margin-bottom:20px;">'
        +'<div><h1 style="font-size:1.35rem;font-weight:700;color:var(--text-primary);margin:0;font-family:var(--font-display);">&#128220; Licence & Regulatory Compliance</h1>'
        +'<div style="font-size:0.78rem;color:var(--text-muted);margin-top:3px;">Repository of all institutional licences, statutory registrations and accreditations — auto-tracked with expiry alerts.</div></div>'
        +'<button class="btn btn-primary" onclick="window._licNav(\'form\',null,false)">+ Add Licence</button>'
      +'</div>'
      +'<div class="stats-grid" style="grid-template-columns:repeat(4,1fr);margin-bottom:20px;">'
        +'<div class="stat-card" style="border-left:4px solid var(--primary);"><div class="stat-info"><span class="stat-label">Total Licences</span><span class="stat-value">'+total+'</span><span class="stat-sub">Across all branches</span></div><div class="stat-icon-wrapper" style="background:var(--primary-glow);color:var(--primary);">&#128220;</div></div>'
        +'<div class="stat-card" style="border-left:4px solid var(--color-danger);"><div class="stat-info"><span class="stat-label">Expiring &le; 30 Days</span><span class="stat-value" style="color:var(--color-danger);">'+exp30+'</span><span class="stat-sub">Requires immediate action</span></div><div class="stat-icon-wrapper" style="background:var(--color-danger-bg);color:var(--color-danger);">&#9888;</div></div>'
        +'<div class="stat-card" style="border-left:4px solid #ef4444;"><div class="stat-info"><span class="stat-label">Expired</span><span class="stat-value" style="color:#ef4444;">'+expired+'</span><span class="stat-sub">Past expiry date</span></div><div class="stat-icon-wrapper" style="background:#fef2f2;color:#ef4444;">&#128308;</div></div>'
        +'<div class="stat-card" style="border-left:4px solid var(--color-info);"><div class="stat-info"><span class="stat-label">Renewal in Progress</span><span class="stat-value" style="color:var(--color-info);">'+inprog+'</span><span class="stat-sub">Application submitted</span></div><div class="stat-icon-wrapper" style="background:var(--color-info-bg);color:var(--color-info);">&#128260;</div></div>'
      +'</div>'
      +'<div class="card" style="padding:14px 16px;margin-bottom:16px;">'
        +'<div style="display:flex;flex-wrap:wrap;gap:10px;align-items:center;">'
          +'<input type="text" class="form-control" placeholder="Search by name or number..." value="'+esc(_fq)+'" oninput="window._licFilter(\'search\',this.value)" style="max-width:260px;font-size:0.82rem;padding:0.4rem 0.7rem;">'
          +'<select class="form-select" onchange="window._licFilter(\'branch\',this.value)" style="max-width:180px;font-size:0.82rem;padding:0.4rem 0.7rem;"><option value="All"'+(_fb==='All'?' selected':'')+'>All Branches</option>'+BRANCHES.map(function(b){return '<option value="'+b+'"'+(_fb===b?' selected':'')+'>'+b+'</option>';}).join('')+'</select>'
          +'<select class="form-select" onchange="window._licFilter(\'category\',this.value)" style="max-width:200px;font-size:0.82rem;padding:0.4rem 0.7rem;"><option value="All"'+(_fc==='All'?' selected':'')+'>All Categories</option>'+CATS.map(function(c){return '<option value="'+c+'"'+(_fc===c?' selected':'')+'>'+c+'</option>';}).join('')+'</select>'
          +'<select class="form-select" onchange="window._licFilter(\'status\',this.value)" style="max-width:180px;font-size:0.82rem;padding:0.4rem 0.7rem;"><option value="All"'+(_fs==='All'?' selected':'')+'>All Statuses</option><option value="Active"'+(_fs==='Active'?' selected':'')+'>Active</option><option value="Expiring Soon"'+(_fs==='Expiring Soon'?' selected':'')+'>Expiring Soon</option><option value="Expired"'+(_fs==='Expired'?' selected':'')+'>Expired</option><option value="Renewal in Progress"'+(_fs==='Renewal in Progress'?' selected':'')+'>Renewal in Progress</option></select>'
          +(_fb!=='All'||_fc!=='All'||_fs!=='All'||_fq!==''?'<button class="btn btn-secondary btn-sm" onclick="window._licClearFilters()">Clear</button>':'')
          +'<span style="margin-left:auto;font-size:0.75rem;color:var(--text-muted);">Showing '+filtered.length+' of '+total+'</span>'
        +'</div>'
      +'</div>'
      +'<div class="card"><div class="custom-table-container" style="overflow-x:auto;"><table class="custom-table" style="font-size:0.8rem;min-width:1000px;">'
        +'<thead><tr><th>Licence Name</th><th>Category</th><th>Branch</th><th>Licence Number</th><th>Issuing Authority</th><th>Issue Date</th><th>Expiry Date</th><th>Status</th><th>Renewal Owner</th><th style="text-align:right;">Actions</th></tr></thead>'
        +'<tbody>'+rows+'</tbody>'
      +'</table></div></div>';
  }

  /* ── SCREEN 2: FORM ──────────────────────────────────────────────────────── */
  function _renderForm(container) {
    var isEdit = !!_editId && !_isRenewal;
    var isRnw  = _isRenewal && !!_editId;
    var src = _editId ? (window.state.licences||[]).find(function(l){return l.id===_editId;}) : null;
    var title = isRnw ? 'Renew Licence' : (isEdit ? 'Edit Licence' : 'Add New Licence');
    var staff = (window.state.staff||[]).map(function(s){return s.name||s.fullName;}).filter(Boolean);
    if (!staff.length) staff = ['Dr. Ramesh Iyer','Dr. Priya Nair','Dr. Krishnamurthy','Dr. Anand','Anita Varghese (Quality Officer)','Suresh Prabhu (Facility Manager)','Ravi Shankar (Chief Pharmacist)','Pradeep Kamath (CFO)','IT Head - Saronil HIS','Medical Superintendent','Hospital Administrator'];
    var rem = src ? (src.reminderDays||[90,60,30,7]) : [90,60,30,7];

    container.innerHTML = ''
      +'<div style="display:flex;align-items:center;gap:10px;margin-bottom:18px;">'
        +'<button class="btn btn-secondary btn-sm" onclick="window._licNav(\'list\')">Back to Registry</button>'
        +'<span style="font-size:0.8rem;color:var(--text-muted);">Licences / '+title+'</span>'
      +'</div>'
      +'<div class="card" style="max-width:860px;">'
        +'<div class="card-header" style="border-bottom:1px solid var(--border-color);">'
          +'<h3 class="card-title">'+title+'</h3>'
          +'<p class="card-subtitle">'+(isRnw?'Creating renewal for: <strong>'+esc(src&&src.name||'')+'</strong>':(isEdit?'Editing: <strong>'+esc(src&&src.name||'')+'</strong>':'Register a new statutory, regulatory or accreditation licence.'))+'</p>'
        +'</div>'
        +'<div class="card-body" style="padding:1.5rem;">'
          +'<form id="lic-form" onsubmit="event.preventDefault();window._licSave();" novalidate>'
            +'<div style="display:grid;grid-template-columns:1fr 1fr;gap:1.25rem;">'
              +'<div class="form-group"><label class="form-label">Licence Name <span>*</span></label><input type="text" class="form-control" id="lf-name" value="'+esc(src&&src.name||'')+'" placeholder="e.g. Fire NOC — Whitefield" required></div>'
              +'<div class="form-group"><label class="form-label">Category <span>*</span></label><select class="form-select" id="lf-category"><option value="">— Select —</option>'+CATS.map(function(c){return '<option value="'+c+'"'+(src&&src.category===c?' selected':'')+'>'+c+'</option>';}).join('')+'</select></div>'
            +'</div>'
            +'<div style="display:grid;grid-template-columns:1fr 1fr;gap:1.25rem;">'
              +'<div class="form-group"><label class="form-label">Branch <span>*</span></label><select class="form-select" id="lf-branch"><option value="">— Select —</option>'+BRANCHES.map(function(b){return '<option value="'+b+'"'+(src&&src.branch===b?' selected':'')+'>'+b+'</option>';}).join('')+'</select></div>'
              +'<div class="form-group"><label class="form-label">Licence Number <span>*</span></label><input type="text" class="form-control" id="lf-licno" value="'+(isRnw?'':esc(src&&src.licenceNumber||''))+'" placeholder="e.g. KA/DL/RET/2024/00341" required></div>'
            +'</div>'
            +'<div class="form-group"><label class="form-label">Issuing Department / Authority <span>*</span></label><input type="text" class="form-control" id="lf-authority" value="'+esc(src&&src.issuingAuthority||'')+'" placeholder="e.g. Karnataka State Pollution Control Board" required></div>'
            +'<div style="display:grid;grid-template-columns:1fr 1fr;gap:1.25rem;">'
              +'<div class="form-group"><label class="form-label">Issue Date <span>*</span></label><input type="date" class="form-control" id="lf-issue" value="'+(isRnw?'':src&&src.issueDate||'')+'" required></div>'
              +'<div class="form-group"><label class="form-label">Expiry Date <span>*</span></label><input type="date" class="form-control" id="lf-expiry" value="'+(isRnw?'':src&&src.expiryDate||'')+'" required></div>'
            +'</div>'
            +'<div class="form-group"><label class="form-label">Renewal Owner</label><select class="form-select" id="lf-owner"><option value="">— Select Staff —</option>'+staff.map(function(s){return '<option value="'+esc(s)+'"'+(src&&src.renewalOwner===s?' selected':'')+'>'+esc(s)+'</option>';}).join('')+'</select></div>'
            +'<div class="form-group"><label class="form-label">Reminder Schedule (days before expiry)</label>'
              +'<div id="lf-rem-wrap" style="display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin-top:4px;">'
                +[90,60,30,7].map(function(d){return '<label style="display:inline-flex;align-items:center;gap:5px;background:var(--bg-surface-elevated);border:1px solid var(--border-color);border-radius:20px;padding:4px 12px;font-size:0.78rem;cursor:pointer;"><input type="checkbox" class="lic-rem-chk" value="'+d+'"'+(rem.indexOf(d)>=0?' checked':'')+'>'+d+'d before</label>';}).join('')
                +'<div style="display:flex;gap:6px;align-items:center;"><input type="number" id="lf-cday" class="form-control" placeholder="Custom" min="1" max="365" style="width:100px;font-size:0.8rem;padding:0.3rem 0.6rem;"><button type="button" class="btn btn-secondary btn-sm" onclick="window._licAddRem()">+ Add</button></div>'
              +'</div>'
            +'</div>'
            +'<div class="form-group"><label class="form-label">Remarks / Conditions</label><textarea class="form-textarea form-control" id="lf-remarks" rows="3" placeholder="e.g. Bed-count cap, scope restrictions...">'+esc(src&&src.remarks||'')+'</textarea></div>'
            +'<div class="form-group"><label class="form-label">Certificate / Document</label>'
              +'<div id="lic-dz" style="border:2px dashed #cbd5e1;border-radius:8px;padding:24px;text-align:center;background:var(--bg-surface-elevated);cursor:pointer;transition:border-color 0.2s;" ondragover="event.preventDefault();this.style.borderColor=\'#3b82f6\';" ondragleave="this.style.borderColor=\'#cbd5e1\';" ondrop="event.preventDefault();window._licDrop(event);" onclick="document.getElementById(\'lic-fi\').click()">'
                +'<div style="font-size:2rem;margin-bottom:6px;">&#128196;</div>'
                +'<div style="font-size:0.8rem;color:var(--text-secondary);">'+(src&&src.documentName&&!isRnw?'Current: <strong>'+esc(src.documentName)+'</strong><br><small>Drop/click to replace</small>':'Drag &amp; drop PDF/PNG/JPG or click to browse<br><small>Max 10 MB</small>')+'</div>'
                +'<input type="file" id="lic-fi" style="display:none;" accept=".pdf,.png,.jpg,.jpeg" onchange="window._licFile(this)">'
              +'</div>'
              +'<div id="lic-fp" style="margin-top:8px;"></div>'
            +'</div>'
            +'<div style="display:flex;justify-content:flex-end;gap:10px;padding-top:10px;border-top:1px solid var(--border-color);margin-top:8px;">'
              +'<button type="button" class="btn btn-secondary" onclick="window._licNav(\'list\')">Cancel</button>'
              +'<button type="submit" class="btn btn-primary">'+(isRnw?'Save Renewal':(isEdit?'Save Changes':'Register Licence'))+'</button>'
            +'</div>'
          +'</form>'
        +'</div>'
      +'</div>';
  }

  /* ── SCREEN 3: DETAIL ────────────────────────────────────────────────────── */
  function _renderDetail(container) {
    var lic = (window.state.licences||[]).find(function(l){return l.id===_detailId;});
    if (!lic) { _screen='list'; _renderList(container); return; }
    var s = computeStatus(lic), d = dte(lic.expiryDate);
    var cs = d<0?'color:var(--color-danger);font-weight:700;':d<=30?'color:var(--color-danger);font-weight:700;':d<=90?'color:var(--color-warning);font-weight:600;':'color:var(--color-success);';
    var cl = d<0?'Expired '+Math.abs(d)+'d ago':d<=30?d+'d remaining — URGENT':d+'d remaining';
    var hist = lic.renewalHistory || [];
    var histHtml = hist.length===0
      ? '<div style="padding:2rem;text-align:center;color:var(--text-muted);font-size:0.82rem;font-style:italic;">No renewal history. This is the original registration.</div>'
      : hist.map(function(h,i){
          return '<div style="display:flex;gap:12px;margin-bottom:'+(i<hist.length-1?'16':'0')+'px;">'
            +'<div style="display:flex;flex-direction:column;align-items:center;">'
              +'<div style="width:30px;height:30px;background:var(--primary-glow);color:var(--primary);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:0.8rem;font-weight:700;flex-shrink:0;">'+(i+1)+'</div>'
              +(i<hist.length-1?'<div style="width:2px;flex:1;background:var(--border-color);margin-top:4px;"></div>':'')
            +'</div>'
            +'<div style="flex:1;background:var(--bg-surface-elevated);border:1px solid var(--border-color);border-radius:8px;padding:12px 14px;font-size:0.78rem;">'
              +'<div style="display:flex;justify-content:space-between;margin-bottom:6px;"><span style="font-weight:700;">Renewal #'+(i+1)+'</span><span style="color:var(--text-muted);font-size:0.7rem;">Renewed on '+fmtDate(h.renewedOn)+'</span></div>'
              +'<div style="color:var(--text-secondary);line-height:1.7;">'
                +'<div>Old Licence No: <span class="admin-mono">'+esc(h.oldLicenceNumber)+'</span></div>'
                +'<div>Old Expiry: '+fmtDate(h.oldExpiry)+'</div>'
                +'<div>Renewed By: '+esc(h.renewedBy)+'</div>'
                +(h.docName?'<div>Document: &#128206; '+esc(h.docName)+'</div>':'')
              +'</div>'
            +'</div>'
          +'</div>';
        }).join('');

    function dr(label, value) {
      return '<div style="display:grid;grid-template-columns:130px 1fr;gap:8px;padding:7px 0;border-bottom:1px solid var(--border-color);">'
        +'<span style="font-size:0.72rem;font-weight:600;color:var(--text-muted);text-transform:uppercase;">'+label+'</span>'
        +'<span style="font-size:0.82rem;color:var(--text-primary);">'+value+'</span></div>';
    }

    container.innerHTML = ''
      +'<div style="display:flex;align-items:center;gap:10px;margin-bottom:16px;flex-wrap:wrap;">'
        +'<button class="btn btn-secondary btn-sm" onclick="window._licNav(\'list\')">Back to Registry</button>'
        +'<span style="font-size:0.8rem;color:var(--text-muted);">Licences / '+esc(lic.name)+'</span>'
        +'<div style="margin-left:auto;display:flex;gap:8px;">'
          +'<button class="btn btn-secondary" onclick="window._licNav(\'form\',\''+lic.id+'\',false)">Edit</button>'
          +(lic.documentName?'<button class="btn btn-secondary" onclick="window._licDownload(\''+lic.id+'\')">Download Certificate</button>':'')
          +'<button class="btn btn-primary" onclick="window._licNav(\'form\',\''+lic.id+'\',true)">Renew Licence</button>'
        +'</div>'
      +'</div>'
      +'<div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;align-items:start;">'
        +'<div class="card">'
          +'<div class="card-header" style="border-bottom:1px solid var(--border-color);">'
            +'<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;"><h3 class="card-title" style="margin:0;">'+esc(lic.name)+'</h3>'+statusBadge(s)+'</div>'
          +'</div>'
          +'<div class="card-body" style="padding:1.25rem;">'
            +'<div style="background:var(--bg-surface-elevated);border-radius:8px;padding:12px 16px;margin-bottom:16px;display:flex;align-items:center;gap:12px;">'
              +'<div style="font-size:2rem;">&#9201;</div>'
              +'<div><div style="font-size:0.7rem;text-transform:uppercase;color:var(--text-muted);font-weight:600;">Days to Expiry</div><div style="font-size:1.1rem;'+cs+'">'+cl+'</div><div style="font-size:0.72rem;color:var(--text-muted);">Expiry: '+fmtDate(lic.expiryDate)+'</div></div>'
            +'</div>'
            +dr('Licence ID', lic.id)
            +dr('Category', esc(lic.category))
            +dr('Branch', esc(lic.branch))
            +dr('Licence Number', '<span class="admin-mono">'+esc(lic.licenceNumber)+'</span>')
            +dr('Issuing Authority', esc(lic.issuingAuthority))
            +dr('Issue Date', fmtDate(lic.issueDate))
            +dr('Expiry Date', fmtDate(lic.expiryDate))
            +dr('Renewal Owner', esc(lic.renewalOwner)||'-')
            +dr('Reminders', (lic.reminderDays||[]).map(function(d){return d+'d';}).join(', ')||'-')
            +dr('Document', lic.documentName?'&#128206; <a href="#" onclick="event.preventDefault();window._licDownload(\''+lic.id+'\')" style="color:var(--primary);">'+esc(lic.documentName)+'</a>':'-')
            +(lic.remarks?dr('Remarks','<em>'+esc(lic.remarks)+'</em>'):'')
            +(s==='Renewal in Progress'?'<div style="margin-top:14px;padding:10px 14px;background:#eff6ff;border:1px solid #bfdbfe;border-radius:6px;font-size:0.78rem;color:#1e40af;"><strong>Renewal application is in progress.</strong> Status auto-updates once new Issue/Expiry dates are saved.</div>':'')
          +'</div>'
        +'</div>'
        +'<div class="card">'
          +'<div class="card-header" style="border-bottom:1px solid var(--border-color);"><h3 class="card-title">Renewal History</h3><p class="card-subtitle">Append-only audit trail of past renewals</p></div>'
          +'<div class="card-body" style="padding:1.25rem;">'+histHtml+'</div>'
        +'</div>'
      +'</div>';
  }

  /* ── NAVIGATION ──────────────────────────────────────────────────────────── */
  window._licNav = function(screen, id, isRenewal) {
    _screen = screen;
    _editId = id || null;
    if (screen === 'detail') _detailId = id;
    _isRenewal = !!isRenewal;
    var mc = document.getElementById('main-content');
    if (mc) window.views.licences(mc);
  };

  /* ── FILTERS ─────────────────────────────────────────────────────────────── */
  window._licFilter = function(type, val) {
    if (type==='branch') _fb=val; if (type==='category') _fc=val;
    if (type==='status') _fs=val; if (type==='search')   _fq=val;
    _screen='list';
    var mc = document.getElementById('main-content');
    if (mc) window.views.licences(mc);
  };
  window._licClearFilters = function() {
    _fb=_fc=_fs='All'; _fq='';
    var mc = document.getElementById('main-content');
    if (mc) window.views.licences(mc);
  };

  /* ── CUSTOM REMINDER ─────────────────────────────────────────────────────── */
  window._licAddRem = function() {
    var inp = document.getElementById('lf-cday');
    var v = parseInt(inp?inp.value:'');
    if (!v||v<1||v>365) { alert('Enter 1-365.'); return; }
    var wrap = document.getElementById('lf-rem-wrap');
    if (!wrap) return;
    var exist = Array.from(wrap.querySelectorAll('.lic-rem-chk')).map(function(c){return parseInt(c.value);});
    if (exist.indexOf(v)>=0) { if(inp)inp.value=''; return; }
    var lbl = document.createElement('label');
    lbl.style.cssText = 'display:inline-flex;align-items:center;gap:5px;background:var(--bg-surface-elevated);border:1px solid var(--border-color);border-radius:20px;padding:4px 12px;font-size:0.78rem;cursor:pointer;';
    lbl.innerHTML = '<input type="checkbox" class="lic-rem-chk" value="'+v+'" checked> '+v+'d before';
    var cdayParent = document.getElementById('lf-cday') && document.getElementById('lf-cday').parentElement;
    if (cdayParent) wrap.insertBefore(lbl, cdayParent);
    if (inp) inp.value='';
  };

  /* ── FILE UPLOAD ─────────────────────────────────────────────────────────── */
  window._selectedLicFile = null;
  window._licFile = function(input) { _setLicFile(input.files[0]); };
  window._licDrop = function(event) { _setLicFile(event.dataTransfer.files[0]); };
  function _setLicFile(file) {
    if (!file) return;
    if (file.size > 10*1024*1024) { alert('Max 10 MB.'); return; }
    if (!['application/pdf','image/png','image/jpeg'].includes(file.type)) { alert('PDF/PNG/JPG only.'); return; }
    window._selectedLicFile = file;
    var fp = document.getElementById('lic-fp');
    if (fp) fp.innerHTML = '<div style="display:inline-flex;align-items:center;gap:8px;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:6px;padding:8px 14px;font-size:0.8rem;"><span style="font-size:1.3rem;">&#128196;</span><div><div style="font-weight:600;color:#166534;">'+esc(file.name)+'</div><div style="color:#15803d;font-size:0.7rem;">'+(file.size/1024).toFixed(1)+' KB</div></div><button type="button" onclick="window._selectedLicFile=null;document.getElementById(\'lic-fp\').innerHTML=\'\';document.getElementById(\'lic-fi\').value=\'\';" style="margin-left:8px;background:none;border:none;cursor:pointer;color:#ef4444;" title="Remove">&#x2715;</button></div>';
    var dz = document.getElementById('lic-dz');
    if (dz) dz.style.borderColor='#22c55e';
  }

  /* ── SAVE ────────────────────────────────────────────────────────────────── */
  window._licSave = function() {
    var name     = (document.getElementById('lf-name')?.value||'').trim();
    var cat      = (document.getElementById('lf-category')?.value||'').trim();
    var branch   = (document.getElementById('lf-branch')?.value||'').trim();
    var licno    = (document.getElementById('lf-licno')?.value||'').trim();
    var auth     = (document.getElementById('lf-authority')?.value||'').trim();
    var iss      = (document.getElementById('lf-issue')?.value||'').trim();
    var exp      = (document.getElementById('lf-expiry')?.value||'').trim();
    var owner    = (document.getElementById('lf-owner')?.value||'').trim();
    var remarks  = (document.getElementById('lf-remarks')?.value||'').trim();
    if (!name)  { alert('Licence Name is required.'); return; }
    if (!cat)   { alert('Category is required.'); return; }
    if (!branch){ alert('Branch is required.'); return; }
    if (!licno) { alert('Licence Number is required.'); return; }
    if (!auth)  { alert('Issuing Authority is required.'); return; }
    if (!iss)   { alert('Issue Date is required.'); return; }
    if (!exp)   { alert('Expiry Date is required.'); return; }
    if (exp <= iss) { alert('Expiry Date must be after Issue Date.'); return; }
    var reminders = Array.from(document.querySelectorAll('.lic-rem-chk')).filter(function(c){return c.checked;}).map(function(c){return parseInt(c.value);}).sort(function(a,b){return b-a;});
    var docName = window._selectedLicFile ? window._selectedLicFile.name : (_editId ? (window.state.licences||[]).find(function(l){return l.id===_editId;})?.documentName||null : null);
    window.state.licences = window.state.licences || [];

    if (_isRenewal && _editId) {
      var old = window.state.licences.find(function(l){return l.id===_editId;});
      var histEntry = { oldLicenceNumber:old.licenceNumber, oldExpiry:old.expiryDate, renewedOn:new Date().toISOString().slice(0,10), renewedBy:owner||(window.state.activeUserRole||'Administrator'), docName:old.documentName||null };
      var newId = 'LIC-R-'+(Date.now()%100000);
      var newLic = { id:newId, name:name, category:cat, branch:branch, licenceNumber:licno, issuingAuthority:auth, issueDate:iss, expiryDate:exp, renewalOwner:owner, reminderDays:reminders, remarks:remarks, documentName:docName, manualStatus:null, renewalHistory:(old.renewalHistory||[]).concat([histEntry]) };
      window.state.licences = window.state.licences.filter(function(l){return l.id!==_editId;});
      window.state.licences.unshift(newLic);
      _refreshAlert(newId);
      if (window.prShowToast) window.prShowToast('Licence renewed. New record: '+newId);
      _screen='detail'; _detailId=newId; _editId=null; _isRenewal=false;
    } else if (_editId) {
      var idx = window.state.licences.findIndex(function(l){return l.id===_editId;});
      if (idx>=0) Object.assign(window.state.licences[idx],{name:name,category:cat,branch:branch,licenceNumber:licno,issuingAuthority:auth,issueDate:iss,expiryDate:exp,renewalOwner:owner,reminderDays:reminders,remarks:remarks,documentName:docName});
      _refreshAlert(_editId);
      if (window.prShowToast) window.prShowToast('Licence record updated.');
      _screen='detail'; _detailId=_editId; _editId=null;
    } else {
      var nid = 'LIC-'+(Date.now()%100000);
      window.state.licences.unshift({id:nid,name:name,category:cat,branch:branch,licenceNumber:licno,issuingAuthority:auth,issueDate:iss,expiryDate:exp,renewalOwner:owner,reminderDays:reminders,remarks:remarks,documentName:docName,manualStatus:null,renewalHistory:[]});
      _refreshAlert(nid);
      if (window.prShowToast) window.prShowToast('Licence "'+name+'" registered.');
      _screen='list'; _editId=null;
    }
    window._selectedLicFile = null;
    var mc = document.getElementById('main-content');
    if (mc) window.views.licences(mc);
  };

  /* ── DOWNLOAD STUB ───────────────────────────────────────────────────────── */
  window._licDownload = function(id) {
    var lic = (window.state.licences||[]).find(function(l){return l.id===id;});
    if (!lic||!lic.documentName) { alert('No document attached.'); return; }
    if (window.prShowToast) window.prShowToast('Downloading '+lic.documentName+'...');
    else alert('Downloading: '+lic.documentName+'\n(In production this triggers the document store download.)');
  };

})();
