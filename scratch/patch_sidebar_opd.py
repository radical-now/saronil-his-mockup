#!/usr/bin/env python3

path = "/Users/home/Desktop/Saronil IHS/Updated HIS /index.html"

with open(path, "r", encoding="utf-8") as f:
    src = f.read()

# 1. Split OPD into OPD Queue and OPD Consultation
old_opd = """        <div class="menu-item" data-target="emr">
          <div class="menu-item-left">
            <span class="menu-icon">🩺</span>
            <span>OPD</span>
          </div>
        </div>"""

new_opd = """        <div class="menu-item" data-target="appointments">
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

src = src.replace(old_opd, new_opd, 1)

# 2. Comment out duplicate appointments link
old_appt = """        <div class="menu-item" data-target="appointments">
          <div class="menu-item-left">
            <span class="menu-icon">📅</span>
            <span>Appointments</span>
          </div>
        </div>"""

new_appt = """        <!--
        <div class="menu-item" data-target="appointments">
          <div class="menu-item-left">
            <span class="menu-icon">📅</span>
            <span>Appointments</span>
          </div>
        </div>
        -->"""

src = src.replace(old_appt, new_appt, 1)

with open(path, "w", encoding="utf-8") as f:
    f.write(src)

print("SUCCESS: OPD split into OPD Queue and OPD Consultation in left sidebar.")
