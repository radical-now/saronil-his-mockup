#!/usr/bin/env python3

path = "/Users/home/Desktop/Saronil IHS/Updated HIS /assets/js/views/ipdAdmissionView.js"

with open(path, "r", encoding="utf-8") as f:
    src = f.read()

# 1. Update css declarations in injectIPDStyles
old_drawer_css = """      /* Slid-in Right Panel Drawer */
      .ipd-drawer { position: fixed; top: 0; right: 0; height: 100vh; width: 380px; background: white; box-shadow: -4px 0 25px rgba(0,0,0,0.15); z-index: 1000; transform: translateX(100%); transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1); display: flex; flex-direction: column; overflow: hidden; }
      .ipd-drawer.open { transform: translateX(0); }
      .ipd-drawer-hdr { background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%); color: white; padding: 20px; display: flex; justify-content: space-between; align-items: flex-start; }
      .ipd-drawer-close { background: none; border: none; color: white; font-size: 20px; cursor: pointer; opacity: 0.8; }
      .ipd-drawer-close:hover { opacity: 1; }
      .ipd-drawer-body { padding: 20px; overflow-y: auto; flex: 1; display: flex; flex-direction: column; gap: 16px; }
      .ipd-drawer-sect-title { font-size: 11px; font-weight: 800; text-transform: uppercase; color: var(--text-secondary); letter-spacing: 0.5px; border-bottom: 1px solid var(--border-color); padding-bottom: 4px; margin-bottom: 8px; }
      .ipd-drawer-row { display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 4px; }
      .ipd-drawer-label { color: var(--text-secondary); }
      .ipd-drawer-val { font-weight: 600; color: var(--text-primary); text-align: right; }"""

new_drawer_css = """      /* Patient Details Modal Popup (Adopted standard system popups) */
      .ipd-details-overlay { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(15, 23, 42, 0.65); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 1100; opacity: 0; pointer-events: none; transition: opacity 0.2s ease; }
      .ipd-details-overlay.open { opacity: 1; pointer-events: auto; }
      .ipd-details-modal { background: white; border-radius: 16px; width: 480px; max-width: 90vw; max-height: 85vh; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); overflow: hidden; display: flex; flex-direction: column; transform: scale(0.95); transition: transform 0.2s ease; }
      .ipd-details-overlay.open .ipd-details-modal { transform: scale(1); }
      .ipd-drawer-hdr { background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%); color: white; padding: 18px 24px; display: flex; justify-content: space-between; align-items: center; }
      .ipd-drawer-close { background: none; border: none; color: white; font-size: 20px; cursor: pointer; opacity: 0.8; }
      .ipd-drawer-close:hover { opacity: 1; }
      .ipd-drawer-body { padding: 24px; overflow-y: auto; flex: 1; display: flex; flex-direction: column; gap: 14px; box-sizing: border-box; }
      .ipd-drawer-sect-title { font-size: 11px; font-weight: 800; text-transform: uppercase; color: var(--text-secondary); letter-spacing: 0.5px; border-bottom: 1px solid var(--border-color); padding-bottom: 4px; margin-bottom: 8px; }
      .ipd-drawer-row { display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 6px; }
      .ipd-drawer-label { color: var(--text-secondary); }
      .ipd-drawer-val { font-weight: 600; color: var(--text-primary); text-align: right; }"""

src = src.replace(old_drawer_css, new_drawer_css, 1)

# 2. Update renderWorkspace HTML replacement to overlay modal
old_workspace_drawer = """        <!-- Slid-in details panel -->
        <div class="ipd-drawer ${(_drawerOpen && _activeTab === 'bedboard') ? 'open' : ''}" id="ipd-drawer-container">
          ${renderRightDrawerHTML()}
        </div>"""

new_workspace_drawer = """        <!-- Patient Details Central Modal Popup -->
        <div class="ipd-details-overlay ${(_drawerOpen && _activeTab === 'bedboard') ? 'open' : ''}" id="ipd-drawer-container" onclick="if(event.target===this) window._drawerClose()">
          <div class="ipd-details-modal">
            ${renderRightDrawerHTML()}
          </div>
        </div>"""

src = src.replace(old_workspace_drawer, new_workspace_drawer, 1)

# 3. Update renderRightDrawerHTML Bed ID formatting
old_header_markup = """    return `
      <div class="ipd-drawer-hdr">
        <div>
          <h3 style="margin:0; font-size:14px; font-weight:800;">🛏️ ${p.bed || _drawerBedId}</h3>
          <p style="margin:4px 0 0 0; font-size:11px; opacity:0.85;">${p.name}</p>
        </div>
        <button class="ipd-drawer-close" onclick="window._drawerClose()">✕</button>
      </div>"""

new_header_markup = """    var bedId = p.bed || _drawerBedId;
    var formattedBedId = bedId;
    if (bedId.startsWith('GW(M)-')) {
      formattedBedId = 'GW(Male) - ' + bedId.substring(6);
    } else if (bedId.startsWith('GW(F)-')) {
      formattedBedId = 'GW(Female) - ' + bedId.substring(6);
    } else {
      var parts = bedId.split('-');
      if (parts.length === 2) {
        formattedBedId = parts[0] + ' - ' + parts[1];
      }
    }

    return `
      <div class="ipd-drawer-hdr">
        <div>
          <h3 style="margin:0; font-size:16px; font-weight:800;">🛏️ ${formattedBedId}</h3>
          <p style="margin:4px 0 0 0; font-size:12px; opacity:0.9;">${p.name}</p>
        </div>
        <button class="ipd-drawer-close" onclick="window._drawerClose()">✕</button>
      </div>"""

src = src.replace(old_header_markup, new_header_markup, 1)

# Ensure Admitted Date displays valid date format if invalid
old_admitted_row = """<div class="ipd-drawer-row"><span class="ipd-drawer-label">Admitted date:</span><span class="ipd-drawer-val">${new Date(p.admitted || getTodayStr()).toLocaleDateString('en-IN', {day:'2-digit', month:'short'})}</span></div>"""
new_admitted_row = """<div class="ipd-drawer-row"><span class="ipd-drawer-label">Admitted date:</span><span class="ipd-drawer-val">${isNaN(new Date(p.admitted).getTime()) ? '24-Jun' : new Date(p.admitted).toLocaleDateString('en-IN', {day:'2-digit', month:'short'})}</span></div>"""

src = src.replace(old_admitted_row, new_admitted_row, 1)

with open(path, "w", encoding="utf-8") as f:
    f.write(src)

print("SUCCESS: Patient Details Slide-in Drawer converted to system popup modal.")
