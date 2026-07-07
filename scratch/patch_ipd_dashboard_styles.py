#!/usr/bin/env python3

path = "/Users/home/Desktop/Saronil IHS/Updated HIS /assets/js/views/ipdAdmissionView.js"

with open(path, "r", encoding="utf-8") as f:
    src = f.read()

# 1. Update injectIPDStyles CSS
old_kpi_styles = """      /* KPI Strip */
      .ipd-kpi-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 10px; margin-bottom: 20px; }
      .ipd-kpi-card { background: white; border: 1px solid var(--border-color); border-radius: 10px; padding: 12px; display: flex; flex-direction: column; justify-content: space-between; box-shadow: 0 2px 6px rgba(0,0,0,0.01); position: relative; overflow: hidden; }
      .ipd-kpi-label { font-size: 9px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; }
      .ipd-kpi-val { font-size: 20px; font-weight: 800; margin: 4px 0; color: #1e3a8a; }
      .ipd-kpi-sub { font-size: 10px; color: var(--text-secondary); }
      .ipd-status-dot { width: 8px; height: 8px; border-radius: 50%; display: inline-block; position: absolute; top: 12px; right: 12px; }
      .ipd-dot-green { background: #10b981; }
      .ipd-dot-amber { background: #f59e0b; }
      .ipd-dot-red { background: #ef4444; }"""

new_kpi_styles = """      /* KPI Strip (Matched to Main Dashboard) */
      .admin-mono {
        font-family: 'JetBrains Mono', 'Courier New', Courier, monospace !important;
      }
      .admin-card {
        background-color: #ffffff;
        border: 1px solid var(--border-color);
        border-radius: var(--radius-md);
        padding: 16px !important;
        box-shadow: var(--shadow-sm);
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
      .admin-kpi-scroll-row {
        display: flex;
        gap: 12px;
        overflow-x: auto;
        padding-bottom: 8px;
        margin-bottom: 16px;
        scrollbar-width: thin;
      }
      .admin-kpi-scroll-row::-webkit-scrollbar {
        height: 6px;
      }
      .admin-kpi-scroll-row::-webkit-scrollbar-thumb {
        background-color: var(--border-color);
        border-radius: 3px;
      }
      .admin-kpi-card {
        flex: 0 0 calc(12.5% - 11px);
        min-width: 170px;
        background-color: #ffffff;
        border: 1px solid var(--border-color);
        border-radius: var(--radius-md);
        padding: 16px;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        box-shadow: var(--shadow-sm);
        cursor: pointer;
        transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
        border-left: 4px solid var(--border-color);
      }
      .admin-kpi-card.status-normal {
        border-left-color: var(--color-success, #10b981);
      }
      .admin-kpi-card.status-warning {
        border-left-color: var(--color-warning, #f59e0b);
      }
      .admin-kpi-card.status-critical {
        border-left-color: var(--color-danger, #ef4444);
      }
      .admin-kpi-card:hover {
        transform: translateY(-2px);
        box-shadow: var(--shadow-md);
        border-color: var(--primary);
      }"""

src = src.replace(old_kpi_styles, new_kpi_styles, 1)

# 2. Update renderKPICards HTML
old_render_kpi = """    // Status classes based on rules
    var kpi1Class = capacityPct > 90 ? 'ipd-dot-red' : (capacityPct >= 80 ? 'ipd-dot-amber' : 'ipd-dot-green');
    var kpi2Class = (availableBeds / totalBeds) < 0.1 ? 'ipd-dot-red' : 'ipd-dot-green';
    var kpi3Class = pendingAdmissions.length > 0 ? 'ipd-dot-amber' : 'ipd-dot-green';
    var kpi4Class = pendingTransfers.length > 0 ? 'ipd-dot-red' : 'ipd-dot-green';
    var kpi5Class = pendingDischarges.length > 0 ? 'ipd-dot-amber' : 'ipd-dot-green';
    var kpi6Class = delayedCount > 0 ? 'ipd-dot-red' : 'ipd-dot-green';
    var kpi8Class = icuPct > 85 ? 'ipd-dot-red' : (icuPct > 70 ? 'ipd-dot-amber' : 'ipd-dot-green');

    return `
      <div class="ipd-kpi-grid">
        <div class="ipd-kpi-card">
          <div class="ipd-kpi-label">Active IPD Patients</div>
          <div class="ipd-kpi-val">${activeCount}</div>
          <div class="ipd-kpi-sub">${capacityPct}% Hospital Occupied</div>
          <div class="ipd-status-dot ${kpi1Class}"></div>
        </div>
        <div class="ipd-kpi-card">
          <div class="ipd-kpi-label">Available Beds</div>
          <div class="ipd-kpi-val">${availableBeds} / ${totalBeds}</div>
          <div class="ipd-kpi-sub">${Math.round((availableBeds/totalBeds)*100)}% Free Space</div>
          <div class="ipd-status-dot ${kpi2Class}"></div>
        </div>
        <div class="ipd-kpi-card">
          <div class="ipd-kpi-label">OPD Referrals Pending</div>
          <div class="ipd-kpi-val">${pendingAdmissions.filter(a => a.source === 'OPD referral').length}</div>
          <div class="ipd-kpi-sub">Awaiting Admission Desk</div>
          <div class="ipd-status-dot ${kpi3Class}"></div>
        </div>
        <div class="ipd-kpi-card">
          <div class="ipd-kpi-label">Emergency Transfers</div>
          <div class="ipd-kpi-val">${pendingAdmissions.filter(a => a.source === 'Emergency transfer').length}</div>
          <div class="ipd-kpi-sub">Critical Intake Alert</div>
          <div class="ipd-status-dot ${kpi4Class}"></div>
        </div>
        <div class="ipd-kpi-card">
          <div class="ipd-kpi-label">Discharges Pending</div>
          <div class="ipd-kpi-val">${pendingDischarges.length}</div>
          <div class="ipd-kpi-sub">Clearances Checklist In-progress</div>
          <div class="ipd-status-dot ${kpi5Class}"></div>
        </div>
        <div class="ipd-kpi-card">
          <div class="ipd-kpi-label">Delayed Discharges (>6h)</div>
          <div class="ipd-kpi-val">${pendingDischarges.filter(d => d.waitingHrs > 6).length}</div>
          <div class="ipd-kpi-sub">Escalations Pending</div>
          <div class="ipd-status-dot ${kpi6Class}"></div>
        </div>
        <div class="ipd-kpi-card">
          <div class="ipd-kpi-label">Expected Admits Today</div>
          <div class="ipd-kpi-val">${pendingAdmissions.length + 2}</div>
          <div class="ipd-kpi-sub">Projected ATD Flow</div>
          <div class="ipd-status-dot ipd-dot-green"></div>
        </div>
        <div class="ipd-kpi-card">
          <div class="ipd-kpi-label">ICU Occupancy</div>
          <div class="ipd-kpi-val">${icuPct}%</div>
          <div class="ipd-kpi-sub">${icuOccupied} / ${icuTotal} ICU Beds Filled</div>
          <div class="ipd-status-dot ${kpi8Class}"></div>
        </div>
      </div>
    `;"""

new_render_kpi = """    // Status classes based on rules
    var kpi1Class = capacityPct > 90 ? 'status-critical' : (capacityPct >= 80 ? 'status-warning' : 'status-normal');
    var kpi2Class = (availableBeds / totalBeds) < 0.1 ? 'status-critical' : 'status-normal';
    var kpi3Class = pendingAdmissions.length > 0 ? 'status-warning' : 'status-normal';
    var kpi4Class = pendingAdmissions.filter(a => a.source === 'Emergency transfer').length > 0 ? 'status-critical' : 'status-normal';
    var kpi5Class = pendingDischarges.length > 0 ? 'status-warning' : 'status-normal';
    var kpi6Class = delayedCount > 0 ? 'status-critical' : 'status-normal';
    var kpi8Class = icuPct > 85 ? 'status-critical' : (icuPct > 70 ? 'status-warning' : 'status-normal');

    return `
      <div class="admin-kpi-scroll-row">
        <div class="admin-kpi-card ${kpi1Class}">
          <div style="font-size: 0.72rem; color: var(--text-secondary); font-weight: 600; text-transform: uppercase;">Active IPD Patients</div>
          <span class="admin-mono" style="font-size: 1.45rem; font-weight: 700; color: var(--text-primary); letter-spacing: -0.02em;">${activeCount}</span>
          <div style="font-size: 0.68rem; color: var(--text-muted); margin-top: 4px;">${capacityPct}% Hospital Occupied</div>
        </div>
        <div class="admin-kpi-card ${kpi2Class}">
          <div style="font-size: 0.72rem; color: var(--text-secondary); font-weight: 600; text-transform: uppercase;">Available Beds</div>
          <span class="admin-mono" style="font-size: 1.45rem; font-weight: 700; color: var(--text-primary); letter-spacing: -0.02em;">${availableBeds} / ${totalBeds}</span>
          <div style="font-size: 0.68rem; color: var(--text-muted); margin-top: 4px;">${Math.round((availableBeds/totalBeds)*100)}% Free Space</div>
        </div>
        <div class="admin-kpi-card ${kpi3Class}">
          <div style="font-size: 0.72rem; color: var(--text-secondary); font-weight: 600; text-transform: uppercase;">OPD Referrals</div>
          <span class="admin-mono" style="font-size: 1.45rem; font-weight: 700; color: var(--text-primary); letter-spacing: -0.02em;">${pendingAdmissions.filter(a => a.source === 'OPD referral').length}</span>
          <div style="font-size: 0.68rem; color: var(--text-muted); margin-top: 4px;">Awaiting Admission</div>
        </div>
        <div class="admin-kpi-card ${kpi4Class}">
          <div style="font-size: 0.72rem; color: var(--text-secondary); font-weight: 600; text-transform: uppercase;">Emergency Transfers</div>
          <span class="admin-mono" style="font-size: 1.45rem; font-weight: 700; color: var(--text-primary); letter-spacing: -0.02em;">${pendingAdmissions.filter(a => a.source === 'Emergency transfer').length}</span>
          <div style="font-size: 0.68rem; color: var(--text-muted); margin-top: 4px;">Trauma Intake Alerts</div>
        </div>
        <div class="admin-kpi-card ${kpi5Class}">
          <div style="font-size: 0.72rem; color: var(--text-secondary); font-weight: 600; text-transform: uppercase;">Discharges Pending</div>
          <span class="admin-mono" style="font-size: 1.45rem; font-weight: 700; color: var(--text-primary); letter-spacing: -0.02em;">${pendingDischarges.length}</span>
          <div style="font-size: 0.68rem; color: var(--text-muted); margin-top: 4px;">In-progress Clearances</div>
        </div>
        <div class="admin-kpi-card ${kpi6Class}">
          <div style="font-size: 0.72rem; color: var(--text-secondary); font-weight: 600; text-transform: uppercase;">Delayed (>6h)</div>
          <span class="admin-mono" style="font-size: 1.45rem; font-weight: 700; color: var(--text-primary); letter-spacing: -0.02em;">${pendingDischarges.filter(d => d.waitingHrs > 6).length}</span>
          <div style="font-size: 0.68rem; color: var(--text-muted); margin-top: 4px;">Escalations Pending</div>
        </div>
        <div class="admin-kpi-card status-normal">
          <div style="font-size: 0.72rem; color: var(--text-secondary); font-weight: 600; text-transform: uppercase;">Expected Today</div>
          <span class="admin-mono" style="font-size: 1.45rem; font-weight: 700; color: var(--text-primary); letter-spacing: -0.02em;">${pendingAdmissions.length + 2}</span>
          <div style="font-size: 0.68rem; color: var(--text-muted); margin-top: 4px;">Projected ATD Flow</div>
        </div>
        <div class="admin-kpi-card ${kpi8Class}">
          <div style="font-size: 0.72rem; color: var(--text-secondary); font-weight: 600; text-transform: uppercase;">ICU Occupancy</div>
          <span class="admin-mono" style="font-size: 1.45rem; font-weight: 700; color: var(--text-primary); letter-spacing: -0.02em;">${icuPct}%</span>
          <div style="font-size: 0.68rem; color: var(--text-muted); margin-top: 4px;">${icuOccupied} / ${icuTotal} ICU Beds</div>
        </div>
      </div>
    `;"""

src = src.replace(old_render_kpi, new_render_kpi, 1)

# 3. Apply class replacements
src = src.replace('class="reg-table"', 'class="custom-table"')
src = src.replace('class="er-card"', 'class="admin-card"')
src = src.replace('class="btn-primary"', 'class="btn btn-primary"')
src = src.replace('class="btn-secondary"', 'class="btn btn-secondary"')

with open(path, "w", encoding="utf-8") as f:
    f.write(src)

print("SUCCESS: IPD visual design matched to Main Dashboards.")
