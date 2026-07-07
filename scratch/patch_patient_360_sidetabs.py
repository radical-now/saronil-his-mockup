#!/usr/bin/env python3

path = "/Users/home/Desktop/Saronil IHS/Updated HIS /assets/js/views/patientsView.js"

with open(path, "r", encoding="utf-8") as f:
    src = f.read()

# 1. Update .p360-right-workspace styles and add .p360-side-tab styles in stylesheet
old_right_workspace_styles = """      /* Right Column */
      .p360-right-workspace {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 12px;
        overflow: hidden;
      }"""

new_right_workspace_styles = """      /* Right Column - Side Tabs Layout */
      .p360-right-workspace {
        flex: 1;
        display: flex;
        flex-direction: row;
        gap: 16px;
        overflow: hidden;
      }
      
      .p360-side-tab {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 12px;
        font-size: 12px;
        font-weight: 600;
        color: var(--text-secondary, #475569);
        cursor: pointer;
        border-radius: 6px;
        transition: all 0.15s;
      }
      .p360-side-tab:hover {
        background: var(--bg-surface-elevated, #f1f5f9);
        color: var(--text-primary, #0f172a);
      }
      .p360-side-tab.active {
        background: var(--primary-glow, #eff6ff);
        color: var(--primary, #2563eb);
      }"""

src = src.replace(old_right_workspace_styles, new_right_workspace_styles, 1)

# 2. Update the Tab Workspace HTML to vertical split structure
old_tab_workspace_html = """        <!-- Tab Workspace -->
        <div class="p360-right-workspace">
          
          <!-- Sticky Tab Bar row -->
          <div class="p360-tabs-bar">
            <div class="p360-tabs-list">
              ${visibleTabs.map(tName => `
                <span class="p360-tab-item ${tab === tName ? 'active' : ''}" onclick="window.prSelectWorkspaceTab('${tName}')">${tName}</span>
              `).join('')}
            </div>
          </div>

          <!-- Viewport scrollable content -->
          <div class="p360-viewport">
            ${tabContentHtml}
          </div>

        </div>"""

new_tab_workspace_html = """        <!-- Tab Workspace (Split: vertical navigation on the left, tab contents on the right) -->
        <div class="p360-right-workspace">
          
          <!-- Side vertical tabs panel -->
          <div class="p360-tabs-side" style="width:190px; flex-shrink:0; display:flex; flex-direction:column; gap:4px; border-right:1px solid var(--border-color, #e2e8f0); padding-right:12px;">
            ${visibleTabs.map(tName => {
              let icon = '📄';
              if (tName === 'Summary & Timeline') icon = '📋';
              else if (tName === 'Clinical Notes') icon = '✏️';
              else if (tName === 'Vitals') icon = '📊';
              else if (tName === 'Labs & Imaging') icon = '🔬';
              else if (tName === 'Medications') icon = '💊';
              else if (tName === 'Nursing Notes') icon = '📝';
              else if (tName === 'Documents') icon = '📁';
              else if (tName === 'ATD') icon = '🚪';
              else if (tName === 'Billing') icon = '💰';

              return `
                <div class="p360-side-tab ${tab === tName ? 'active' : ''}" onclick="window.prSelectWorkspaceTab('${tName}')">
                  <span>${icon}</span> <span>${tName}</span>
                </div>
              `;
            }).join('')}
          </div>

          <!-- Viewport scrollable content -->
          <div class="p360-viewport" style="flex:1; overflow-y:auto; background:var(--bg-surface, #ffffff); border:1px solid var(--border-color, #e2e8f0); border-radius:8px; padding:16px; height:100%;">
            ${tabContentHtml}
          </div>

        </div>"""

src = src.replace(old_tab_workspace_html, new_tab_workspace_html, 1)

with open(path, "w", encoding="utf-8") as f:
    f.write(src)

print("SUCCESS: Side vertical tab layout applied.")
