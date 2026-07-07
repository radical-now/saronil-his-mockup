#!/usr/bin/env python3

path = "/Users/home/Desktop/Saronil IHS/Updated HIS /assets/js/views/ipdAdmissionView.js"

with open(path, "r", encoding="utf-8") as f:
    src = f.read()

# 1. Update css declaration in injectIPDStyles
old_css_grid = """.ipd-bed-grid-container { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 14px; margin-top: 10px; }"""
new_css_grid = """.ipd-bed-grid-container { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)) !important; gap: 14px; margin-top: 10px; }"""

src = src.replace(old_css_grid, new_css_grid, 1)

# 2. Update inline style in renderBedBoardScreen
old_inline_grid = """<div class="ipd-bed-grid-container" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(215px, 1fr)); gap: 14px; margin-top: 10px;">"""
new_inline_grid = """<div class="ipd-bed-grid-container" style="display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 14px; margin-top: 10px;">"""

src = src.replace(old_inline_grid, new_inline_grid, 1)

with open(path, "w", encoding="utf-8") as f:
    f.write(src)

print("SUCCESS: Bed Board grid updated to show exactly 5 cards per row.")
