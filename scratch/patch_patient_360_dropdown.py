#!/usr/bin/env python3
import re

path = "/Users/home/Desktop/Saronil IHS/Updated HIS /assets/js/views/patientsView.js"

with open(path, "r", encoding="utf-8") as f:
    src = f.read()

# Replace the role initialization at the start of renderPatient360Profile
role_init_old = """  // Set up role and active tab states
  if (window.patient360Role === undefined) {
    window.patient360Role = 'Doctor';
  }
  if (window.patient360ActiveTab === undefined) {
    window.patient360ActiveTab = 'Clinical Notes';
  }"""

role_init_new = """  // Determine role based on central header persona dropdown
  function getCurrentPatient360Role() {
    const globalRole = (window.state && window.state.activeUserRole) || 'Doctor';
    if (globalRole === 'Nurse') return 'Nurse';
    if (globalRole === 'Billing' || globalRole === 'CFO') return 'Billing';
    if (globalRole === 'Pharmacist') return 'Pharmacy';
    if (globalRole === 'Front Desk') return 'Front Desk';
    if (globalRole === 'ATD Officer') return 'Admission';
    return 'Doctor';
  }

  const mappedRole = getCurrentPatient360Role();
  if (window.patient360Role !== mappedRole) {
    window.patient360Role = mappedRole;
    if (mappedRole === 'Doctor') window.patient360ActiveTab = 'Clinical Notes';
    else if (mappedRole === 'Nurse') window.patient360ActiveTab = 'Nursing Notes';
    else if (mappedRole === 'Billing') window.patient360ActiveTab = 'Billing';
    else if (mappedRole === 'Pharmacy') window.patient360ActiveTab = 'Medications';
    else if (mappedRole === 'Front Desk') window.patient360ActiveTab = 'Documents';
    else if (mappedRole === 'Admission') window.patient360ActiveTab = 'ATD';
  }
  
  if (window.patient360ActiveTab === undefined) {
    window.patient360ActiveTab = 'Clinical Notes';
  }"""

src = src.replace(role_init_old, role_init_new, 1)

# Remove the Viewing as dropdown HTML from the topbar
dropdown_old = """          <div style="display:flex; align-items:center; gap:6px;">
            <span style="font-size:11px; font-weight:600; color:var(--text-secondary);">Viewing as:</span>
            <select class="form-control" style="height:28px; font-size:12px; padding:0 20px 0 8px; width:110px; cursor:pointer;" onchange="window.prSwitchRole(this.value)">
              ${['Doctor', 'Nurse', 'Billing', 'Admission', 'Pharmacy', 'Front Desk'].map(r => `<option value="${r}" ${role === r ? 'selected' : ''}>${r}</option>`).join('')}
            </select>
          </div>"""

dropdown_new = """          <!-- Role is controlled globally via global-persona-selector -->"""

src = src.replace(dropdown_old, dropdown_new, 1)

with open(path, "w", encoding="utf-8") as f:
    f.write(src)

print("SUCCESS: Patients 360 role synchronization complete and inner select hidden.")
