#!/usr/bin/env python3

path = "/Users/home/Desktop/Saronil IHS/Updated HIS /assets/js/views/patientsView.js"

with open(path, "r", encoding="utf-8") as f:
    src = f.read()

# Replace duplicate backticks
src = src.replace("      `;\n      `;", "      `;", 1)

with open(path, "w", encoding="utf-8") as f:
    f.write(src)

print("SUCCESS: Duplicate backticks fixed.")
