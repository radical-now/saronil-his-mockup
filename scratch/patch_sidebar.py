#!/usr/bin/env python3

path_html = "/Users/home/Desktop/Saronil IHS/Updated HIS /index.html"
path_patients = "/Users/home/Desktop/Saronil IHS/Updated HIS /assets/js/views/patientsView.js"
path_router = "/Users/home/Desktop/Saronil IHS/Updated HIS /assets/js/router.js"

# 1. Update index.html to insert the 4 navigation sections with icons
with open(path_html, "r", encoding="utf-8") as f:
    src_html = f.read()

old_patients_item = """        <div class="menu-item" data-target="patients">
          <div class="menu-item-left">
            <span class="menu-icon">🗂️</span>
            <span>Patients (360°)</span>
          </div>
        </div>"""

new_patients_items = """        <div class="menu-item" data-target="patients">
          <div class="menu-item-left">
            <span class="menu-icon">🗂️</span>
            <span>Patients (360°)</span>
          </div>
        </div>
        <div class="menu-item" data-target="patients?tab=OPD">
          <div class="menu-item-left" style="padding-left: 20px;">
            <span class="menu-icon">🩺</span>
            <span>OPD</span>
          </div>
        </div>
        <div class="menu-item" data-target="patients?tab=IPD">
          <div class="menu-item-left" style="padding-left: 20px;">
            <span class="menu-icon">🏥</span>
            <span>IPD</span>
          </div>
        </div>
        <div class="menu-item" data-target="patients?tab=Daycare">
          <div class="menu-item-left" style="padding-left: 20px;">
            <span class="menu-icon">☀️</span>
            <span>Day Care</span>
          </div>
        </div>
        <div class="menu-item" data-target="patients?tab=Emergency">
          <div class="menu-item-left" style="padding-left: 20px;">
            <span class="menu-icon">🚨</span>
            <span>Emergency</span>
          </div>
        </div>"""

src_html = src_html.replace(old_patients_item, new_patients_items, 1)

with open(path_html, "w", encoding="utf-8") as f:
    f.write(src_html)

# 2. Update patientsView.js to parse the tab parameter
with open(path_patients, "r", encoding="utf-8") as f:
    src_patients = f.read()

old_patients_entry = """window.views.patients = function(container, subAnchor, params) {
  params = params || {};
  const state = window.state || {};
  const activeUhid = params.uhid;
  const activeVisit = params.visit;"""

new_patients_entry = """window.views.patients = function(container, subAnchor, params) {
  params = params || {};
  const state = window.state || {};
  const activeUhid = params.uhid;
  const activeVisit = params.visit;
  
  if (params.tab) {
    window.activePatientsTab = params.tab;
    delete params.tab;
  }"""

src_patients = src_patients.replace(old_patients_entry, new_patients_entry, 1)

with open(path_patients, "w", encoding="utf-8") as f:
    f.write(src_patients)

# 3. Update router.js to support sub-navigation highlight
with open(path_router, "r", encoding="utf-8") as f:
    src_router = f.read()

old_highlight = """    // Toggle active state in sidebar menu
    document.querySelectorAll('.menu-item').forEach(item => {
      if (item.dataset.target === targetPage) {
        item.classList.add('active');
        // Expand parent category if needed
      } else {
        item.classList.remove('active');
      }
    });"""

new_highlight = """    // Toggle active state in sidebar menu (with query parameter matching)
    document.querySelectorAll('.menu-item').forEach(item => {
      const fullHash = window.location.hash.substring(1) || 'dashboard';
      const baseTarget = item.dataset.target ? item.dataset.target.split('?')[0] : '';
      
      if (item.dataset.target === fullHash || (baseTarget === targetPage && !item.dataset.target.includes('?'))) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });"""

src_router = src_router.replace(old_highlight, new_highlight, 1)

with open(path_router, "w", encoding="utf-8") as f:
    f.write(src_router)

print("SUCCESS: Sidebar updated with OPD, IPD, Day Care, and Emergency links and icons.")
