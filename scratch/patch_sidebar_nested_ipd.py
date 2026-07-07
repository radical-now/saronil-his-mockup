#!/usr/bin/env python3

path_html = "/Users/home/Desktop/Saronil IHS/Updated HIS /index.html"
path_router = "/Users/home/Desktop/Saronil IHS/Updated HIS /assets/js/router.js"

# 1. Update index.html
with open(path_html, "r", encoding="utf-8") as f:
    src_html = f.read()

old_ipd_item = """        <div class="menu-item" data-target="ipdAdmission">
          <div class="menu-item-left">
            <span class="menu-icon">🏥</span>
            <span>IPD</span>
          </div>
        </div>"""

new_ipd_item = """        <!-- Collapsible IPD Section -->
        <div class="menu-item-group" id="menu-group-ipd" style="margin-bottom: 0.15rem;">
          <div class="menu-item parent" onclick="window._sidebarToggle('ipd')" style="display: flex; align-items: center; justify-content: space-between; padding: 0.65rem 0.75rem; border-radius: var(--radius-sm); color: var(--text-secondary); font-weight: 500; cursor: pointer; transition: var(--transition-smooth);">
            <div class="menu-item-left" style="display: flex; align-items: center; gap: 0.75rem; font-size: 0.9rem;">
              <span class="menu-icon" style="font-size: 1.1rem; display: flex; align-items: center; justify-content: center; width: 20px;">🏥</span>
              <span>IPD</span>
            </div>
            <span class="menu-arrow" id="arrow-ipd" style="font-size: 0.7rem; transition: transform 0.2s; color: var(--text-muted);">▼</span>
          </div>
          <div class="submenu-items" id="submenu-ipd" style="display: none; flex-direction: column; gap: 0.15rem; margin-top: 0.15rem;">
            <div class="menu-item" data-target="ipdAdmission?tab=dashboard" style="padding-left: 28px;">
              <div class="menu-item-left">
                <span class="menu-icon">📊</span>
                <span>Dashboard</span>
              </div>
            </div>
            <div class="menu-item" data-target="ipdAdmission?tab=atd" style="padding-left: 28px;">
              <div class="menu-item-left">
                <span class="menu-icon">🛏️</span>
                <span>ATD</span>
              </div>
            </div>
          </div>
        </div>"""

src_html = src_html.replace(old_ipd_item, new_ipd_item, 1)

with open(path_html, "w", encoding="utf-8") as f:
    f.write(src_html)

# 2. Update router.js
with open(path_router, "r", encoding="utf-8") as f:
    src_router = f.read()

old_opd_expand = """    // Auto-expand/collapse OPD group based on target page
    var subOpd = document.getElementById('submenu-opd');
    var arrowOpd = document.getElementById('arrow-opd');
    if (subOpd && arrowOpd) {
      if (targetPage === 'appointments' || targetPage === 'emr') {
        subOpd.style.display = 'flex';
        arrowOpd.style.transform = 'rotate(180deg)';
      } else {
        subOpd.style.display = 'none';
        arrowOpd.style.transform = 'rotate(0deg)';
      }
    }"""

new_opd_expand = """    // Auto-expand/collapse OPD group based on target page
    var subOpd = document.getElementById('submenu-opd');
    var arrowOpd = document.getElementById('arrow-opd');
    if (subOpd && arrowOpd) {
      if (targetPage === 'appointments' || targetPage === 'emr') {
        subOpd.style.display = 'flex';
        arrowOpd.style.transform = 'rotate(180deg)';
      } else {
        subOpd.style.display = 'none';
        arrowOpd.style.transform = 'rotate(0deg)';
      }
    }

    // Auto-expand/collapse IPD group based on target page
    var subIpd = document.getElementById('submenu-ipd');
    var arrowIpd = document.getElementById('arrow-ipd');
    if (subIpd && arrowIpd) {
      if (targetPage === 'ipdAdmission') {
        subIpd.style.display = 'flex';
        arrowIpd.style.transform = 'rotate(180deg)';
      } else {
        subIpd.style.display = 'none';
        arrowIpd.style.transform = 'rotate(0deg)';
      }
    }"""

src_router = src_router.replace(old_opd_expand, new_opd_expand, 1)

with open(path_router, "w", encoding="utf-8") as f:
    f.write(src_router)

print("SUCCESS: IPD nested into Dashboard & ATD sub-links in sidebar.")
