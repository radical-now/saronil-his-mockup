#!/usr/bin/env python3

path_html = "/Users/home/Desktop/Saronil IHS/Updated HIS /index.html"
path_router = "/Users/home/Desktop/Saronil IHS/Updated HIS /assets/js/router.js"

# 1. Remove redundant flat ATD link from index.html sidebar
with open(path_html, "r", encoding="utf-8") as f:
    src_html = f.read()

old_flat_atd = """        <div class="menu-item" data-target="atd">
          <div class="menu-item-left">
            <span class="menu-icon">🛏️</span>
            <span>Bed Board & ATD</span>
          </div>
        </div>"""

src_html = src_html.replace(old_flat_atd, "", 1)

with open(path_html, "w", encoding="utf-8") as f:
    f.write(src_html)

# 2. Add redirect in router.js from "atd" pageId to "ipdAdmission?tab=atd"
with open(path_router, "r", encoding="utf-8") as f:
    src_router = f.read()

old_target_resolve = """    // Verify view function exists, default to dashboard
    let targetPage = pageId;
    if (!window.views[targetPage]) {"""

new_target_resolve = """    // Verify view function exists, default to dashboard
    let targetPage = pageId;
    if (targetPage === 'atd') {
      window.location.hash = 'ipdAdmission?tab=atd';
      return;
    }
    if (!window.views[targetPage]) {"""

src_router = src_router.replace(old_target_resolve, new_target_resolve, 1)

with open(path_router, "w", encoding="utf-8") as f:
    f.write(src_router)

print("SUCCESS: Redundant flat ATD link removed and router redirect configured.")
