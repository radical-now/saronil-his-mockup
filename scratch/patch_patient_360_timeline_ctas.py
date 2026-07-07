#!/usr/bin/env python3

path = "/Users/home/Desktop/Saronil IHS/Updated HIS /assets/js/views/patientsView.js"

with open(path, "r", encoding="utf-8") as f:
    src = f.read()

# Target timeline HTML block to replace
old_timeline_block = """            <div class="timeline-container">
              
              <div class="timeline-item">
                <div class="timeline-dot" style="border-color:#10b981; background:#d1fae5;"></div>
                <div class="timeline-time">12:30 PM &bull; Today</div>
                <div class="timeline-title">Medication Administered</div>
                <div class="timeline-desc">Ondansetron 4mg IV administered by Nurse Mary for mild nausea control.</div>
              </div>

              <div class="timeline-item">
                <div class="timeline-dot" style="border-color:#ef4444; background:#fee2e2;"></div>
                <div class="timeline-time">11:30 AM &bull; Today</div>
                <div class="timeline-title">Critical Lab Result Alert</div>
                <div class="timeline-desc">Serum Potassium (K⁺) returned critical at <b>6.8 mEq/L</b>. Dr. Priya Nair notified.</div>
              </div>

              <div class="timeline-item">
                <div class="timeline-dot" style="border-color:#3b82f6; background:#dbeafe;"></div>
                <div class="timeline-time">11:15 AM &bull; Today</div>
                <div class="timeline-title">IV Infusion Started</div>
                <div class="timeline-desc">IV line secured. Daycare Iron Sucrose 100mg in 100ml Normal Saline infusion started.</div>
              </div>

              <div class="timeline-item">
                <div class="timeline-dot"></div>
                <div class="timeline-time">11:00 AM &bull; Today</div>
                <div class="timeline-title">Diagnostic Samples Drawn</div>
                <div class="timeline-desc">Blood samples collected for CBC, LFT, Renal Profile, Serum Electrolytes. Sent to Central Lab.</div>
              </div>

              <div class="timeline-item">
                <div class="timeline-dot"></div>
                <div class="timeline-time">10:30 AM &bull; Today</div>
                <div class="timeline-title">Initial Nursing Triage</div>
                <div class="timeline-desc">Nurse Mary recorded baseline vitals (BP 130/80, HR 74, SpO2 99%). Patient reported severe fatigue.</div>
              </div>

              <div class="timeline-item">
                <div class="timeline-dot" style="border-color:#10b981; background:#d1fae5;"></div>
                <div class="timeline-time">10:15 AM &bull; Today</div>
                <div class="timeline-title">Daycare Admission Registered</div>
                <div class="timeline-desc">Admitted to Bed D-09, Daycare Ward under Consultant Dr. Priya Nair (Gynaecology).</div>
              </div>

            </div>"""

new_timeline_block = """            <div class="timeline-container">
              
              <div class="timeline-item">
                <div class="timeline-dot" style="border-color:#10b981; background:#d1fae5;"></div>
                <div class="timeline-time">12:30 PM &bull; Today</div>
                <div class="timeline-title">Medication Administered</div>
                <div class="timeline-desc">Ondansetron 4mg IV administered by Nurse Mary for mild nausea control.</div>
                <div style="margin-top:4px;"><button class="btn-qa-ghost" style="padding:2px 8px; font-size:10px; border-radius:4px; height:auto;" onclick="window.prSelectWorkspaceTab('Medications')">View Dispensing Log</button></div>
              </div>

              <div class="timeline-item">
                <div class="timeline-dot" style="border-color:#ef4444; background:#fee2e2;"></div>
                <div class="timeline-time">11:30 AM &bull; Today</div>
                <div class="timeline-title">Critical Lab Result Alert</div>
                <div class="timeline-desc">Serum Potassium (K⁺) returned critical at <b>6.8 mEq/L</b>. Dr. Priya Nair notified.</div>
                <div style="margin-top:4px;"><button class="btn-qa-ghost" style="padding:2px 8px; font-size:10px; border-radius:4px; height:auto; color:#ef4444; border-color:#ef4444; background:transparent;" onclick="window.prSelectWorkspaceTab('Labs')">View Lab Report</button></div>
              </div>

              <div class="timeline-item">
                <div class="timeline-dot" style="border-color:#3b82f6; background:#dbeafe;"></div>
                <div class="timeline-time">11:15 AM &bull; Today</div>
                <div class="timeline-title">IV Infusion Started</div>
                <div class="timeline-desc">IV line secured. Daycare Iron Sucrose 100mg in 100ml Normal Saline infusion started.</div>
                <div style="margin-top:4px;"><button class="btn-qa-ghost" style="padding:2px 8px; font-size:10px; border-radius:4px; height:auto;" onclick="window.prSelectWorkspaceTab('Medications')">View Prescriptions</button></div>
              </div>

              <div class="timeline-item">
                <div class="timeline-dot"></div>
                <div class="timeline-time">11:00 AM &bull; Today</div>
                <div class="timeline-title">Diagnostic Samples Drawn</div>
                <div class="timeline-desc">Blood samples collected for CBC, LFT, Renal Profile, Serum Electrolytes. Sent to Central Lab.</div>
                <div style="margin-top:4px;"><button class="btn-qa-ghost" style="padding:2px 8px; font-size:10px; border-radius:4px; height:auto;" onclick="window.prSelectWorkspaceTab('Labs')">View Diagnostic Orders</button></div>
              </div>

              <div class="timeline-item">
                <div class="timeline-dot"></div>
                <div class="timeline-time">10:30 AM &bull; Today</div>
                <div class="timeline-title">Initial Nursing Triage</div>
                <div class="timeline-desc">Nurse Mary recorded baseline vitals (BP 130/80, HR 74, SpO2 99%). Patient reported severe fatigue.</div>
                <div style="margin-top:4px;"><button class="btn-qa-ghost" style="padding:2px 8px; font-size:10px; border-radius:4px; height:auto;" onclick="window.prSelectWorkspaceTab('Vitals')">View Vitals History</button></div>
              </div>

              <div class="timeline-item">
                <div class="timeline-dot" style="border-color:#10b981; background:#d1fae5;"></div>
                <div class="timeline-time">10:15 AM &bull; Today</div>
                <div class="timeline-title">Daycare Admission Registered</div>
                <div class="timeline-desc">Admitted to Bed D-09, Daycare Ward under Consultant Dr. Priya Nair (Gynaecology).</div>
                <div style="margin-top:4px;"><button class="btn-qa-ghost" style="padding:2px 8px; font-size:10px; border-radius:4px; height:auto;" onclick="window.prSelectWorkspaceTab('ATD')">View Admission details</button></div>
              </div>

            </div>"""

src = src.replace(old_timeline_block, new_timeline_block, 1)

with open(path, "w", encoding="utf-8") as f:
    f.write(src)

print("SUCCESS: Timeline CTAs successfully updated.")
