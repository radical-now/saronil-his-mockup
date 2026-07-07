#!/usr/bin/env python3

path_html = "/Users/home/Desktop/Saronil IHS/Updated HIS /index.html"
path_router = "/Users/home/Desktop/Saronil IHS/Updated HIS /assets/js/router.js"

# 1. Update index.html to include nested OPD structure and CSS/JS toggle logic
with open(path_html, "r", encoding="utf-8") as f:
    src_html = f.read()

old_workspaces = """        <div class="menu-category">Workspaces</div>
        <div class="menu-item" data-target="appointments">
          <div class="menu-item-left">
            <span class="menu-icon">🩺</span>
            <span>OPD Queue</span>
          </div>
        </div>
        <div class="menu-item" data-target="emr">
          <div class="menu-item-left">
            <span class="menu-icon">📋</span>
            <span>OPD Consultation</span>
          </div>
        </div>"""

new_workspaces = """        <div class="menu-category">Workspaces</div>
        <!-- Collapsible OPD Section -->
        <div class="menu-item-group" id="menu-group-opd" style="margin-bottom: 0.15rem;">
          <div class="menu-item parent" onclick="window._sidebarToggle('opd')" style="display: flex; align-items: center; justify-content: space-between; padding: 0.65rem 0.75rem; border-radius: var(--radius-sm); color: var(--text-secondary); font-weight: 500; cursor: pointer; transition: var(--transition-smooth);">
            <div class="menu-item-left" style="display: flex; align-items: center; gap: 0.75rem; font-size: 0.9rem;">
              <span class="menu-icon" style="font-size: 1.1rem; display: flex; align-items: center; justify-content: center; width: 20px;">🩺</span>
              <span>OPD</span>
            </div>
            <span class="menu-arrow" id="arrow-opd" style="font-size: 0.7rem; transition: transform 0.2s; color: var(--text-muted);">▼</span>
          </div>
          <div class="submenu-items" id="submenu-opd" style="display: none; flex-direction: column; gap: 0.15rem; margin-top: 0.15rem;">
            <div class="menu-item" data-target="appointments" style="padding-left: 28px;">
              <div class="menu-item-left">
                <span class="menu-icon">📋</span>
                <span>OPD Queue</span>
              </div>
            </div>
            <div class="menu-item" data-target="emr" style="padding-left: 28px;">
              <div class="menu-item-left">
                <span class="menu-icon">🩺</span>
                <span>OPD Consultation</span>
              </div>
            </div>
          </div>
        </div>"""

src_html = src_html.replace(old_workspaces, new_workspaces, 1)

# Add window._sidebarToggle to index.html before </body>
script_toggle = """  <script>
    window._sidebarToggle = function(id) {
      var sub = document.getElementById('submenu-' + id);
      var arrow = document.getElementById('arrow-' + id);
      if (sub && arrow) {
        var isOpen = sub.style.display === 'flex';
        sub.style.display = isOpen ? 'none' : 'flex';
        arrow.style.transform = isOpen ? 'rotate(0deg)' : 'rotate(180deg)';
      }
    };
  </script>
</body>"""

src_html = src_html.replace("</body>", script_toggle, 1)

with open(path_html, "w", encoding="utf-8") as f:
    f.write(src_html)

# 2. Update router.js to auto-expand OPD submenu if the active page is appointments or emr
with open(path_router, "r", encoding="utf-8") as f:
    src_router = f.read()

old_active_highlight = """    // Toggle active state in sidebar menu (with query parameter matching)
    document.querySelectorAll('.menu-item').forEach(item => {
      const fullHash = window.location.hash.substring(1) || 'dashboard';
      const baseTarget = item.dataset.target ? item.dataset.target.split('?')[0] : '';
      
      if (item.dataset.target === fullHash || (baseTarget === targetPage && !item.dataset.target.includes('?'))) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });"""

new_active_highlight = """    // Toggle active state in sidebar menu (with query parameter matching)
    document.querySelectorAll('.menu-item').forEach(item => {
      const fullHash = window.location.hash.substring(1) || 'dashboard';
      const baseTarget = item.dataset.target ? item.dataset.target.split('?')[0] : '';
      
      if (item.dataset.target === fullHash || (baseTarget === targetPage && !item.dataset.target.includes('?'))) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });

    // Auto-expand/collapse OPD group based on target page
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

src_router = src_router.replace(old_active_highlight, new_active_highlight, 1)

with open(path_router, "w", encoding="utf-8") as f:
    f.write(src_router)

print("SUCCESS: OPD navigation nested into a collapsible sidebar accordion.")
