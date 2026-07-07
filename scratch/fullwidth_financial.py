"""
Make the Executive Financial Summary full-width by breaking the 2-column
exec-grid-2 wrapper into two separate stacked full-width sections.
Financial Summary becomes its own full-width row; Bed Board stays full-width below it.
"""

path = "/Users/home/Desktop/Saronil IHS/Updated HIS /assets/js/views/dashboardView.js"

with open(path, "r", encoding="utf-8") as f:
    src = f.read()

# ── Target: the entire SECTION 4 & 5 two-column block ────────────────────────
old_block = """        <!-- SECTION 4 & 5 Split: Bed/Resource Status vs Financial Summary -->
        <div class="exec-grid-2">
          
          <!-- LEFT — BED BOARD SUMMARY & RESOURCE STATUS -->
          ${hasOps ? `"""

new_block = """        <!-- SECTION 4: Financial Summary (full-width) -->
        ${hasFinance ? `
          <div style="background:#ffffff; border:1px solid #cbd5e1; border-radius:8px; padding:16px; box-shadow:0 1px 3px rgba(0,0,0,0.05); display:flex; flex-direction:column; gap:16px;">
            <div class="exec-section-title" style="margin-bottom:8px; display:flex; justify-content:space-between; align-items:center;">
              <span>💰 Executive Financial Summary</span>
              <a href="#billing" style="font-size:0.72rem; color:#2563eb; text-transform:none; font-weight:700;">Open Billing &rarr;</a>
            </div>
            
            <div style="display:grid; grid-template-columns: repeat(3, 1fr); gap:16px; font-size:0.78rem;">
              
              <!-- Revenue & Collections -->
              <div style="display:flex; flex-direction:column; gap:6px; border-right:1px solid #cbd5e1; padding-right:12px;">
                <div style="font-weight:700; color:#475569; text-transform:uppercase; font-size:0.7rem; border-bottom:1px solid #cbd5e1; padding-bottom:2px;">Today's Revenue</div>
                <div style="display:flex; justify-content:space-between;"><span>Gross Rev:</span><b style="font-family:'JetBrains Mono',monospace;">₹4,85,200</b></div>
                <div style="display:flex; justify-content:space-between;"><span>Discounts:</span><span style="font-family:'JetBrains Mono',monospace; color:#dc2626;">-₹12,500</span></div>
                <div style="display:flex; justify-content:space-between;"><span>Refunds:</span><span style="font-family:'JetBrains Mono',monospace; color:#dc2626;">-₹5,000</span></div>
                <div style="display:flex; justify-content:space-between; font-weight:700; border-top:1px dashed #cbd5e1; padding-top:4px;"><span>Net Revenue:</span><b style="font-family:'JetBrains Mono',monospace;">₹4,67,700</b></div>
                <div style="display:flex; justify-content:space-between; margin-top:4px;"><span>Collections:</span><b style="font-family:'JetBrains Mono',monospace;">₹4,20,500</b></div>
                <div style="font-size:0.65rem; color:#64748b; margin-top:2px;">Cash: ₹95K · UPI: ₹2.45L · Card: ₹80K</div>
              </div>

              <!-- Receivables Aging -->
              <div style="display:flex; flex-direction:column; gap:6px; border-right:1px solid #cbd5e1; padding-right:12px;">
                <div style="font-weight:700; color:#475569; text-transform:uppercase; font-size:0.7rem; border-bottom:1px solid #cbd5e1; padding-bottom:2px;">Receivables Aging</div>
                <div style="display:flex; justify-content:space-between;"><span>TPA (85 claims):</span><b style="font-family:'JetBrains Mono',monospace;">₹42,50,000</b></div>
                <div style="display:flex; justify-content:space-between;"><span>CGHS / ECHS:</span><b style="font-family:'JetBrains Mono',monospace;">₹28,70,000</b></div>
                <div style="display:flex; justify-content:space-between;"><span>PMJAY:</span><b style="font-family:'JetBrains Mono',monospace;">₹8,00,000</b></div>
                <div style="display:flex; justify-content:space-between;"><span>Corporate:</span><b style="font-family:'JetBrains Mono',monospace;">₹5,00,000</b></div>
                <div style="display:flex; justify-content:space-between; font-weight:700; border-top:1px dashed #cbd5e1; padding-top:4px;"><span>Total:</span><b style="font-family:'JetBrains Mono',monospace; color:#dc2626;">₹84,20,000</b></div>
                <div style="font-size:0.68rem; color:#64748b; margin-top:2px; font-family:'JetBrains Mono',monospace;">
                  0-30d: ₹45L | 31-60d: ₹25L | &gt;90d: <span style="color:#dc2626; font-weight:700;">₹4.2L</span>
                </div>
              </div>

              <!-- Insurance Operations -->
              <div style="display:flex; flex-direction:column; gap:6px;">
                <div style="font-weight:700; color:#475569; text-transform:uppercase; font-size:0.7rem; border-bottom:1px solid #cbd5e1; padding-bottom:2px;">Insurance Operations</div>
                <div style="display:flex; justify-content:space-between;"><span>Pre-auth Pending:</span><b style="font-family:'JetBrains Mono',monospace;">12 cases</b></div>
                <div style="font-size:0.68rem; color:#64748b;">↳ &gt;24h: <span class="exec-badge-amber" style="font-size:10px; padding:0 3px;">7</span> | &gt;48h: <span class="exec-badge-red" style="font-size:10px; padding:0 3px;">5</span></div>
                <div style="display:flex; justify-content:space-between; margin-top:2px;"><span>TPA Queries open:</span><b style="font-family:'JetBrains Mono',monospace;">6 queries</b></div>
                <div style="display:flex; justify-content:space-between;"><span>LOA Expired:</span><b style="font-family:'JetBrains Mono',monospace; color:#dc2626;">3 cases</b></div>
                <div style="display:flex; justify-content:space-between; border-top:1px dashed #cbd5e1; padding-top:4px;"><span>Settled Month:</span><b style="font-family:'JetBrains Mono',monospace;">₹54,00,000</b></div>
              </div>

            </div>
            
            <!-- Top Revenue Departments — now spans full width -->
            <div style="border-top:1px solid #cbd5e1; padding-top:8px; font-size:0.76rem; display:flex; justify-content:space-between; align-items:center;">
              <div style="font-weight:700; color:#475569;">Top Revenue Wards/Dept:</div>
              <div style="display:flex; gap:12px; font-family:'JetBrains Mono',monospace; font-weight:700;">
                <span>Cardiology: ₹1.80L (37%)</span>
                <span>General Surgery: ₹1.15L (24%)</span>
                <span>Orthopedics: ₹79K (16%)</span>
              </div>
            </div>
          </div>
        ` : ''}

        <!-- SECTION 5: Bed Board & Resource Status (full-width) -->
        ${hasOps ? `"""

# Find and replace only the opening of the 2-col section
src = src.replace(old_block, new_block, 1)

# ── Now fix the closing of the old grid-2 wrapper ────────────────────────────
# After the BED BOARD block ends (` : ''}), there was the RIGHT Financial column
# then </div> closing exec-grid-2. We need to:
#   1. Remove the entire old RIGHT column (Financial Summary) since we moved it above
#   2. Remove the </div> that closed exec-grid-2

# The old RIGHT column starts with this comment and ends at ` : ''}  then </div>
old_right_col = """
          <!-- RIGHT — FINANCIAL SUMMARY (CFO / executives) -->
          ${hasFinance ? `
            <div style="background:#ffffff; border:1px solid #cbd5e1; border-radius:8px; padding:16px; box-shadow:0 1px 3px rgba(0,0,0,0.05); display:flex; flex-direction:column; gap:16px;">
              <div class="exec-section-title" style="margin-bottom:8px; display:flex; justify-content:space-between; align-items:center;">
                <span>💰 Executive Financial Summary</span>
                <a href="#billing" style="font-size:0.72rem; color:#2563eb; text-transform:none; font-weight:700;">Open Billing &rarr;</a>
              </div>
              
              <div style="display:grid; grid-template-columns: repeat(3, 1fr); gap:16px; font-size:0.78rem;">
                
                <!-- Revenue & Collections -->
                <div style="display:flex; flex-direction:column; gap:6px; border-right:1px solid #cbd5e1; padding-right:12px;">
                  <div style="font-weight:700; color:#475569; text-transform:uppercase; font-size:0.7rem; border-bottom:1px solid #cbd5e1; padding-bottom:2px;">Today's Revenue</div>
                  <div style="display:flex; justify-content:space-between;"><span>Gross Rev:</span><b style="font-family:'JetBrains Mono',monospace;">₹4,85,200</b></div>
                  <div style="display:flex; justify-content:space-between;"><span>Discounts:</span><span style="font-family:'JetBrains Mono',monospace; color:#dc2626;">-₹12,500</span></div>
                  <div style="display:flex; justify-content:space-between;"><span>Refunds:</span><span style="font-family:'JetBrains Mono',monospace; color:#dc2626;">-₹5,000</span></div>
                  <div style="display:flex; justify-content:space-between; font-weight:700; border-top:1px dashed #cbd5e1; padding-top:4px;"><span>Net Revenue:</span><b style="font-family:'JetBrains Mono',monospace;">₹4,67,700</b></div>
                  <div style="display:flex; justify-content:space-between; margin-top:4px;"><span>Collections:</span><b style="font-family:'JetBrains Mono',monospace;">₹4,20,500</b></div>
                  <div style="font-size:0.65rem; color:#64748b; margin-top:2px;">Cash: ₹95K · UPI: ₹2.45L · Card: ₹80K</div>
                </div>

                <!-- Receivables Aging -->
                <div style="display:flex; flex-direction:column; gap:6px; border-right:1px solid #cbd5e1; padding-right:12px;">
                  <div style="font-weight:700; color:#475569; text-transform:uppercase; font-size:0.7rem; border-bottom:1px solid #cbd5e1; padding-bottom:2px;">Receivables Aging</div>
                  <div style="display:flex; justify-content:space-between;"><span>TPA (85 claims):</span><b style="font-family:'JetBrains Mono',monospace;">₹42,50,000</b></div>
                  <div style="display:flex; justify-content:space-between;"><span>CGHS / ECHS:</span><b style="font-family:'JetBrains Mono',monospace;">₹28,70,000</b></div>
                  <div style="display:flex; justify-content:space-between;"><span>PMJAY:</span><b style="font-family:'JetBrains Mono',monospace;">₹8,00,000</b></div>
                  <div style="display:flex; justify-content:space-between;"><span>Corporate:</span><b style="font-family:'JetBrains Mono',monospace;">₹5,00,000</b></div>
                  <div style="display:flex; justify-content:space-between; font-weight:700; border-top:1px dashed #cbd5e1; padding-top:4px;"><span>Total:</span><b style="font-family:'JetBrains Mono',monospace; color:#dc2626;">₹84,20,000</b></div>
                  <div style="font-size:0.68rem; color:#64748b; margin-top:2px; font-family:'JetBrains Mono',monospace;">
                    0-30d: ₹45L | 31-60d: ₹25L | &gt;90d: <span style="color:#dc2626; font-weight:700;">₹4.2L</span>
                  </div>
                </div>

                <!-- Insurance Operations -->
                <div style="display:flex; flex-direction:column; gap:6px;">
                  <div style="font-weight:700; color:#475569; text-transform:uppercase; font-size:0.7rem; border-bottom:1px solid #cbd5e1; padding-bottom:2px;">Insurance Operations</div>
                  <div style="display:flex; justify-content:space-between;"><span>Pre-auth Pending:</span><b style="font-family:'JetBrains Mono',monospace;">12 cases</b></div>
                  <div style="font-size:0.68rem; color:#64748b;">↳ &gt;24h: <span class="exec-badge-amber" style="font-size:10px; padding:0 3px;">7</span> | &gt;48h: <span class="exec-badge-red" style="font-size:10px; padding:0 3px;">5</span></div>
                  <div style="display:flex; justify-content:space-between; margin-top:2px;"><span>TPA Queries open:</span><b style="font-family:'JetBrains Mono',monospace;">6 queries</b></div>
                  <div style="display:flex; justify-content:space-between;"><span>LOA Expired:</span><b style="font-family:'JetBrains Mono',monospace; color:#dc2626;">3 cases</b></div>
                  <div style="display:flex; justify-content:space-between; border-top:1px dashed #cbd5e1; padding-top:4px;"><span>Settled Month:</span><b style="font-family:'JetBrains Mono',monospace;">₹54,00,000</b></div>
                </div>

              </div>
              
              <!-- Top Revenue Departments -->
              <div style="border-top:1px solid #cbd5e1; padding-top:8px; font-size:0.76rem; display:flex; justify-content:space-between; align-items:center;">
                <div style="font-weight:700; color:#475569;">Top Revenue Wards/Dept:</div>
                <div style="display:flex; gap:12px; font-family:'JetBrains Mono',monospace; font-weight:700;">
                  <span>Cardiology: ₹1.80L (37%)</span>
                  <span>General Surgery: ₹1.15L (24%)</span>
                  <span>Orthopedics: ₹79K (16%)</span>
                </div>
              </div>
            </div>
          ` : ''}

        </div>"""

new_right_col = """\n        ` : ''}"""

if old_right_col in src:
    src = src.replace(old_right_col, new_right_col, 1)
    print("SUCCESS — Executive Financial Summary is now full-width.")
else:
    print("ERROR: Could not locate the old RIGHT column block. Check for whitespace differences.")

with open(path, "w", encoding="utf-8") as f:
    f.write(src)
