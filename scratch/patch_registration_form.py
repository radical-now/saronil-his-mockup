#!/usr/bin/env python3

path = "/Users/home/Desktop/Saronil IHS/Updated HIS /assets/js/views/registrationView.js"

with open(path, "r", encoding="utf-8") as f:
    src = f.read()

# Replace main render signature and handle params.action
old_render = """  /* ── MAIN RENDER ─────────────────────────────────────────────── */
  window.views.registration = function(container) {
    injectCSS();
    seedLog();

    var pageTitleEl = document.getElementById('active-page-title');
    if (pageTitleEl) pageTitleEl.textContent = 'Patient Registration';

    if (_view === 'success' && _lastReg) {
      renderSuccess(container);
    } else if (_view === 'new') {
      renderForm(container, null);
    } else {
      renderDashboard(container);
    }
  };"""

new_render = """  /* ── MAIN RENDER ─────────────────────────────────────────────── */
  window.views.registration = function(container, subAnchor, params) {
    injectCSS();
    seedLog();

    if (params && params.action === 'new') {
      _view = 'new';
      _editUhid = null;
    } else if (params && params.action === 'edit' && params.uhid) {
      _view = 'new';
      _editUhid = params.uhid;
    }

    var pageTitleEl = document.getElementById('active-page-title');
    if (pageTitleEl) pageTitleEl.textContent = 'Patient Registration';

    if (_view === 'success' && _lastReg) {
      renderSuccess(container);
    } else if (_view === 'new') {
      renderForm(container, _editUhid);
    } else {
      renderDashboard(container);
    }
  };"""

src = src.replace(old_render, new_render, 1)

with open(path, "w", encoding="utf-8") as f:
    f.write(src)

print("SUCCESS: Registration View updated to support action parameter routing.")
