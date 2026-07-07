#!/usr/bin/env python3

path_patients = "/Users/home/Desktop/Saronil IHS/Updated HIS /assets/js/views/patientsView.js"
path_emr = "/Users/home/Desktop/Saronil IHS/Updated HIS /assets/js/views/emrView.js"

# 1. Patch patientsView.js
with open(path_patients, "r", encoding="utf-8") as f:
    src_patients = f.read()

old_entry = """window.views.patients = function(container, subAnchor, params) {
  const state = window.state || {};
  const activeUhid = params.uhid;
  const activeVisit = params.visit;"""

new_entry = """window.views.patients = function(container, subAnchor, params) {
  params = params || {};
  const state = window.state || {};
  const activeUhid = params.uhid;
  const activeVisit = params.visit;
  
  if (params.action) {
    const act = params.action.toLowerCase();
    if (act === 'prescribe') window.p360ActiveModal = 'Prescribe';
    else if (act === 'orderlab') window.p360ActiveModal = 'Order Lab';
    else if (act === 'radiology') window.p360ActiveModal = 'Radiology';
    else if (act === 'note') window.p360ActiveModal = 'Write Note';
    else if (act === 'vitals') window.p360ActiveModal = 'Record Vitals';
    else if (act === 'discharge') window.p360ActiveModal = 'Discharge';
    else if (act === 'transfer') window.p360ActiveModal = 'Transfer';
    delete params.action;
  }"""

src_patients = src_patients.replace(old_entry, new_entry, 1)

old_add_pt = """  window.prAddPatient = function() {
    window.prShowToast("Opening registration...");
    setTimeout(() => {
      window.router.navigate('registration');
    }, 400);
  };"""

new_add_pt = """  window.prAddPatient = function() {
    window.prShowToast("Opening registration form...");
    setTimeout(() => {
      window.router.navigate('registration?action=new');
    }, 400);
  };"""

src_patients = src_patients.replace(old_add_pt, new_add_pt, 1)

with open(path_patients, "w", encoding="utf-8") as f:
    f.write(src_patients)

# 2. Patch emrView.js
with open(path_emr, "r", encoding="utf-8") as f:
    src_emr = f.read()

old_emr_entry = """window.views.emr = function(container, subAnchor, params) {
  emrContainer = container;"""

new_emr_entry = """window.views.emr = function(container, subAnchor, params) {
  emrContainer = container;
  if (params && params.uhid) {
    window.router.navigate(`patients?uhid=${params.uhid}`);
    return;
  }"""

src_emr = src_emr.replace(old_emr_entry, new_emr_entry, 1)

with open(path_emr, "w", encoding="utf-8") as f:
    f.write(src_emr)

print("SUCCESS: EMR redirection and action parameters successfully patched.")
