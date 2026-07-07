#!/usr/bin/env python3

path_html = "/Users/home/Desktop/Saronil IHS/Updated HIS /index.html"

with open(path_html, "r", encoding="utf-8") as f:
    src = f.read()

# 1. Replace the temporary subtab patient links we added with the primary Workspaces category
old_added_items = """        <div class="menu-item" data-target="patients">
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

new_workspaces_items = """        <div class="menu-item" data-target="patients">
          <div class="menu-item-left">
            <span class="menu-icon">🗂️</span>
            <span>Patients (360°)</span>
          </div>
        </div>

        <div class="menu-category">Workspaces</div>
        <div class="menu-item" data-target="emr">
          <div class="menu-item-left">
            <span class="menu-icon">🩺</span>
            <span>OPD</span>
          </div>
        </div>
        <div class="menu-item" data-target="ipdAdmission">
          <div class="menu-item-left">
            <span class="menu-icon">🏥</span>
            <span>IPD</span>
          </div>
        </div>
        <div class="menu-item" data-target="daybed">
          <div class="menu-item-left">
            <span class="menu-icon">☀️</span>
            <span>Day Care</span>
          </div>
        </div>
        <div class="menu-item" data-target="emergency">
          <div class="menu-item-left">
            <span class="menu-icon">🚨</span>
            <span>Emergency</span>
          </div>
        </div>"""

src = src.replace(old_added_items, new_workspaces_items, 1)

# 2. Comment out the duplicate ipdAdmission link
old_ipd_admission = """        <div class="menu-item" data-target="ipdAdmission">
          <div class="menu-item-left">
            <span class="menu-icon">🏥</span>
            <span>IPD Admission</span>
          </div>
        </div>"""

new_ipd_admission = """        <!--
        <div class="menu-item" data-target="ipdAdmission">
          <div class="menu-item-left">
            <span class="menu-icon">🏥</span>
            <span>IPD Admission</span>
          </div>
        </div>
        -->"""

src = src.replace(old_ipd_admission, new_ipd_admission, 1)

# 3. Comment out duplicate EMR / OPD Consultation and Emergency links
old_clinical_section = """        <div class="menu-category">Clinical</div>
        <div class="menu-item" data-target="emr">
          <div class="menu-item-left">
            <span class="menu-icon">📋</span>
            <span>OPD Consultation</span>
          </div>
        </div>
        <div class="menu-item" data-target="emergency">
          <div class="menu-item-left">
            <span class="menu-icon">🚨</span>
            <span>Emergency / MLC</span>
          </div>
        </div>"""

new_clinical_section = """        <div class="menu-category">Clinical</div>
        <!--
        <div class="menu-item" data-target="emr">
          <div class="menu-item-left">
            <span class="menu-icon">📋</span>
            <span>OPD Consultation</span>
          </div>
        </div>
        <div class="menu-item" data-target="emergency">
          <div class="menu-item-left">
            <span class="menu-icon">🚨</span>
            <span>Emergency / MLC</span>
          </div>
        </div>
        -->"""

src = src.replace(old_clinical_section, new_clinical_section, 1)

with open(path_html, "w", encoding="utf-8") as f:
    f.write(src)

print("SUCCESS: index.html updated to place OPD, IPD, Day Care, and Emergency as standalone navigation workspaces.")
