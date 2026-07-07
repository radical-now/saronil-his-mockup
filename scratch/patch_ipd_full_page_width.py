#!/usr/bin/env python3

path = "/Users/home/Desktop/Saronil IHS/Updated HIS /assets/js/views/ipdAdmissionView.js"

with open(path, "r", encoding="utf-8") as f:
    src = f.read()

# Replace .ipd-wrapper definition inside injectIPDStyles
old_wrapper_css = """.ipd-wrapper { font-family: 'Inter', 'Outfit', sans-serif; color: var(--text-primary); max-width: 100%; margin: 0 auto; padding-bottom: 3rem; }"""

new_wrapper_css = """.ipd-wrapper {
        font-family: 'Inter', 'Outfit', sans-serif;
        color: var(--text-primary);
        margin: -1.5rem !important;
        padding: 1.5rem !important;
        padding-bottom: 3rem !important;
        max-width: none !important;
        width: auto !important;
        box-sizing: border-box;
      }"""

src = src.replace(old_wrapper_css, new_wrapper_css, 1)

with open(path, "w", encoding="utf-8") as f:
    f.write(src)

print("SUCCESS: ipd-wrapper counteracted parent padding to stretch full page width.")
