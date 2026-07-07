#!/usr/bin/env python3

path = "/Users/home/Desktop/Saronil IHS/Updated HIS /assets/js/views/ipdAdmissionView.js"

with open(path, "r", encoding="utf-8") as f:
    src = f.read()

# 1. Update renderWorkspace to remove the tab control bar HTML block
old_workspace_html = """    container.innerHTML = `
      <div class="ipd-wrapper">

        <!-- Navigation Tabs -->
        <div class="ipd-control-bar">
          <div style="display:flex; gap: 8px; flex-wrap:wrap;">
            <button class="ipd-tab-btn ${_activeTab === 'bedboard' ? 'active' : ''}" onclick="window._ipdSwitchTab('bedboard')">🛏️ Bed Board and ATD</button>
            ${(window._ipdActiveRole === 'ATD Coordinator' || window._ipdActiveRole === 'Admission Clerk') ? `
              <button class="ipd-tab-btn ${_activeTab === 'admission_wizard' ? 'active' : ''}" onclick="window._ipdSwitchTab('admission_wizard')">➕ Admit Patient (ATD)</button>
            ` : ''}
            ${(window._ipdActiveRole === 'Administrator / Medical Superintendent' || window._ipdActiveRole === 'Nursing Supervisor') ? `
              <button class="ipd-tab-btn ${_activeTab === 'bed_mgmt' ? 'active' : ''}" onclick="window._ipdSwitchTab('bed_mgmt')">⚙️ Bed Master Edit</button>
            ` : ''}
          </div>
          <div>
            <select class="gate-branch-select" style="margin:0; padding:6px 12px; font-size:12px;" onchange="window._ipdChangeBranchFilter(this.value)">
              <option value="All" ${_selectedBranch === 'All' ? 'selected' : ''}>All Branches</option>
              <option value="Bengaluru" ${_selectedBranch === 'Bengaluru' ? 'selected' : ''}>Bengaluru (Main)</option>
              <option value="Whitefield" ${_selectedBranch === 'Whitefield' ? 'selected' : ''}>Whitefield</option>
              <option value="Electronic City" ${_selectedBranch === 'Electronic City' ? 'selected' : ''}>Electronic City</option>
            </select>
          </div>
        </div>

        <!-- Tab Body Content -->
        <div class="ipd-body-content">
          ${contentHTML}
        </div>"""

new_workspace_html = """    container.innerHTML = `
      <div class="ipd-wrapper">

        <!-- Workspace Body Content -->
        <div class="ipd-body-content" style="margin-top: 10px;">
          ${contentHTML}
        </div>"""

# Try to find with or without dashboard tab inside renderWorkspace HTML (it might vary depending on previous matches)
# Let's search for what container.innerHTML looks like in renderWorkspace around line 364
import re
pattern = r"container\.innerHTML = `\s*<div class=\"ipd-wrapper\">.*?<!-- Tab Body Content -->\s*<div class=\"ipd-body-content\">.*?contentHTML.*?\s*</div>"
match = re.search(pattern, src, re.DOTALL)
if match:
    src = src.replace(match.group(0), """container.innerHTML = `
      <div class="ipd-wrapper">
        <!-- Workspace Body Content -->
        <div class="ipd-body-content" style="margin-top: 10px;">
          ${contentHTML}
        </div>""", 1)
else:
    print("WARNING: Regex match not found for container.innerHTML replacement.")

# 2. Prepend Branch Selector on Dashboard Screen
old_dash_screen = """  function renderDashboardScreen() {
    return `
      <!-- KPI Strip -->"""

new_dash_screen = """  function renderDashboardScreen() {
    return `
      <!-- Branch Filter Selector -->
      <div style="display: flex; justify-content: flex-end; margin-bottom: 12px; gap: 8px; align-items: center;">
        <span style="font-size: 11px; font-weight: 700; color: var(--text-secondary); text-transform: uppercase;">Select Branch:</span>
        <select class="er-select" style="padding: 6px 12px; font-size: 12px; max-width: 200px; border: 1.5px solid var(--border-color); border-radius: 6px; outline: none;" onchange="window._ipdChangeBranchFilter(this.value)">
          <option value="All" ${_selectedBranch === 'All' ? 'selected' : ''}>All Branches</option>
          <option value="Bengaluru" ${_selectedBranch === 'Bengaluru' ? 'selected' : ''}>Bengaluru (Main)</option>
          <option value="Whitefield" ${_selectedBranch === 'Whitefield' ? 'selected' : ''}>Whitefield</option>
          <option value="Electronic City" ${_selectedBranch === 'Electronic City' ? 'selected' : ''}>Electronic City</option>
        </select>
      </div>

      <!-- KPI Strip -->"""

src = src.replace(old_dash_screen, new_dash_screen, 1)

# 3. Prepend Branch Selector in Bed Board Screen Filter Bar
old_bedboard_filter = """      <!-- Filter Bar -->
      <div style="background:#f8fafc; border: 1px solid var(--border-color); padding: 12px 18px; border-radius: 8px; margin-bottom: 20px; display:flex; gap:12px; align-items:center; flex-wrap:wrap;">
        <div class="er-field" style="margin:0;">
          <select class="er-select" style="padding: 6px 12px; font-size:12px;" onchange="window._gridSetWard(this.value)">"""

new_bedboard_filter = """      <!-- Filter Bar -->
      <div style="background:#f8fafc; border: 1px solid var(--border-color); padding: 12px 18px; border-radius: 8px; margin-bottom: 20px; display:flex; gap:12px; align-items:center; flex-wrap:wrap;">
        <div class="er-field" style="margin:0;">
          <select class="er-select" style="padding: 6px 12px; font-size:12px;" onchange="window._ipdChangeBranchFilter(this.value)">
            <option value="All" ${_selectedBranch === 'All' ? 'selected' : ''}>All Branches</option>
            <option value="Bengaluru" ${_selectedBranch === 'Bengaluru' ? 'selected' : ''}>Bengaluru (Main)</option>
            <option value="Whitefield" ${_selectedBranch === 'Whitefield' ? 'selected' : ''}>Whitefield</option>
            <option value="Electronic City" ${_selectedBranch === 'Electronic City' ? 'selected' : ''}>Electronic City</option>
          </select>
        </div>
        <div class="er-field" style="margin:0;">
          <select class="er-select" style="padding: 6px 12px; font-size:12px;" onchange="window._gridSetWard(this.value)">"""

src = src.replace(old_bedboard_filter, new_bedboard_filter, 1)

with open(path, "w", encoding="utf-8") as f:
    f.write(src)

print("SUCCESS: Tab control bar removed and local branch filters added.")
