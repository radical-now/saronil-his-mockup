# Python script to fix the scoping issue of personaToRole and roleToPersona in dashboardView.js

dashboard_path = "/Users/home/Desktop/Saronil IHS/Updated HIS /assets/js/views/dashboardView.js"

with open(dashboard_path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Global declarations to be placed at the top of the file
global_declarations = """/* ==========================================================================
   SARONIL HMS - DYNAMIC ROLE-BASED DASHBOARDS (dashboardView.js)
   ========================================================================== */

const roleToPersona = {
  'Chairman': 'chairman',
  'CEO': 'ceo',
  'COO': 'coo',
  'Medical Director': 'medDir',
  'Medical Superintendent': 'medSuper',
  'CFO': 'cfo',
  'General Manager': 'gm',
  'Administrator': 'admin',
  'Doctor': 'doctor',
  'Nurse': 'nurse',
  'Billing': 'billing',
  'Front Desk': 'admission',
  'Lab': 'lab',
  'Pharmacist': 'pharmacy',
  'ATD Officer': 'atdOfficer',
  'OPD Officer': 'opdOfficer',
  'Information': 'information'
};

const personaToRole = {
  'chairman': 'Chairman',
  'ceo': 'CEO',
  'coo': 'COO',
  'medDir': 'Medical Director',
  'medSuper': 'Medical Superintendent',
  'cfo': 'CFO',
  'gm': 'General Manager',
  'admin': 'Administrator',
  'doctor': 'Doctor',
  'nurse': 'Nurse',
  'billing': 'Billing',
  'admission': 'Front Desk',
  'lab': 'Lab',
  'pharmacy': 'Pharmacist',
  'atdOfficer': 'ATD Officer',
  'opdOfficer': 'OPD Officer',
  'information': 'Information'
};
"""

# Replace the top comment block with the global declarations
content = content.replace("""/* ==========================================================================
   SARONIL HMS - DYNAMIC ROLE-BASED DASHBOARDS (dashboardView.js)
   ========================================================================== */""", global_declarations, 1)

# 2. In window.views.dashboard, remove the local definitions of roleToPersona and personaToRole
local_defs_in_views = """window.views.dashboard = function(container, subAnchor, params) {
  const roleToPersona = {
    'Chairman': 'chairman',
    'CEO': 'ceo',
    'COO': 'coo',
    'Medical Director': 'medDir',
    'Medical Superintendent': 'medSuper',
    'CFO': 'cfo',
    'General Manager': 'gm',
    'Administrator': 'admin',
    'Doctor': 'doctor',
    'Nurse': 'nurse',
    'Billing': 'billing',
    'Front Desk': 'admission',
    'Lab': 'lab',
    'Pharmacist': 'pharmacy',
    'ATD Officer': 'atdOfficer',
    'OPD Officer': 'opdOfficer',
    'Information': 'information'
  };

  const personaToRole = {
    'chairman': 'Chairman',
    'ceo': 'CEO',
    'coo': 'COO',
    'medDir': 'Medical Director',
    'medSuper': 'Medical Superintendent',
    'cfo': 'CFO',
    'gm': 'General Manager',
    'admin': 'Administrator',
    'doctor': 'Doctor',
    'nurse': 'Nurse',
    'billing': 'Billing',
    'admission': 'Front Desk',
    'lab': 'Lab',
    'pharmacy': 'Pharmacist',
    'atdOfficer': 'ATD Officer',
    'opdOfficer': 'OPD Officer',
    'information': 'Information'
  };"""

replacement_views = """window.views.dashboard = function(container, subAnchor, params) {"""

content = content.replace(local_defs_in_views, replacement_views, 1)

# 3. In window.switchDashboardPersona, remove local personaToRole definition
local_defs_in_switch = """window.switchDashboardPersona = function(persona) {
  const personaToRole = {
    'admin': 'Administrator',
    'doctor': 'Doctor',
    'nurse': 'Nurse',
    'billing': 'Billing',
    'admission': 'Front Desk',
    'lab': 'Lab',
    'pharmacy': 'Pharmacist',
    'atdOfficer': 'ATD Officer',
    'opdOfficer': 'OPD Officer',
    'information': 'Information'
  };"""

replacement_switch = """window.switchDashboardPersona = function(persona) {"""

content = content.replace(local_defs_in_switch, replacement_switch, 1)

with open(dashboard_path, "w", encoding="utf-8") as f:
    f.write(content)

print("SUCCESS: Scoping issues resolved in dashboardView.js!")
