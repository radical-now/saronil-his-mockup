/* ==========================================================================
   SARONIL HMS - REPORTS & MIS CENTER VIEW (reportsView.js)
   ========================================================================== */

window.views = window.views || {};

// Active state for reports dashboard
window.reportsActiveTab = localStorage.getItem("saronil_rep_active_tab") || "catalog";
window.reportsActiveRole = localStorage.getItem("saronil_rep_active_role") || "Administrator";
window.selectedReportId = localStorage.getItem("saronil_rep_selected_id") || "REP001";

// Custom builder active state
window.customBuilderData = window.customBuilderData || {
  source: "billing",
  fields: [],
  filters: [],
  groupBy: "",
  aggType: "COUNT",
  aggField: "",
  vizType: "table",
};

window.ipdMakeCheckboxDropdown = function (selectId, onChangeCallback) {
  const selectEl = document.getElementById(selectId);
  if (!selectEl) return;

  // Check if already wrapper initialized to avoid duplicates
  if (selectEl.nextElementSibling && selectEl.nextElementSibling.classList.contains('cb-dropdown-container')) {
    return;
  }

  const options = [...selectEl.options].map(opt => ({
    value: opt.value,
    text: opt.textContent,
    selected: opt.selected
  }));

  // Create custom dropdown container
  const container = document.createElement('div');
  container.className = 'cb-dropdown-container relative w-full';

  // Create trigger button
  const trigger = document.createElement('button');
  trigger.type = 'button';
  trigger.className = 'cb-dropdown-trigger form-select text-xs w-full text-left flex justify-between items-center bg-white border border-slate-300 rounded-md py-1.5 px-3 pr-8 cursor-pointer focus:outline-none focus:ring-1 focus:ring-blue-500';
  trigger.style.minHeight = '32px';
  
  const triggerText = document.createElement('span');
  triggerText.className = 'truncate';
  trigger.appendChild(triggerText);

  // Create menu overlay
  const menu = document.createElement('div');
  menu.className = 'cb-dropdown-menu absolute left-0 right-0 z-50 mt-1 max-h-60 overflow-y-auto bg-white border border-slate-200 rounded-md shadow-lg p-2 hidden flex-col gap-1';

  // Populated options
  const checkBoxes = [];
  options.forEach((opt, idx) => {
    const item = document.createElement('label');
    item.className = 'flex items-center gap-2 text-xs p-1.5 hover:bg-slate-50 rounded cursor-pointer text-slate-700 font-medium select-none';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.value = opt.value;
    checkbox.checked = opt.selected;
    checkbox.className = 'rounded border-slate-300 text-blue-600 focus:ring-blue-500';

    const textSpan = document.createElement('span');
    textSpan.textContent = opt.text;

    item.appendChild(checkbox);
    item.appendChild(textSpan);
    menu.appendChild(item);

    checkBoxes.push({ checkbox, optionEl: selectEl.options[idx] });

    checkbox.addEventListener('change', () => {
      // If "All" is checked or unchecked:
      if (opt.value === 'All') {
        if (checkbox.checked) {
          // Uncheck all other checkboxes
          checkBoxes.forEach(cb => {
            if (cb.checkbox.value !== 'All') {
              cb.checkbox.checked = false;
              cb.optionEl.selected = false;
            }
          });
        }
      } else {
        // If other options are checked, uncheck "All"
        if (checkbox.checked) {
          const allCb = checkBoxes.find(cb => cb.checkbox.value === 'All');
          if (allCb) {
            allCb.checkbox.checked = false;
            allCb.optionEl.selected = false;
          }
        }
      }

      // Sync custom select selection state back to hidden native select
      checkBoxes.forEach(cb => {
        cb.optionEl.selected = cb.checkbox.checked;
      });

      // Special case: if nothing is checked, auto-check "All" or first option if exists
      const anyChecked = checkBoxes.some(cb => cb.checkbox.checked);
      if (!anyChecked) {
        const allCb = checkBoxes.find(cb => cb.checkbox.value === 'All');
        if (allCb) {
          allCb.checkbox.checked = true;
          allCb.optionEl.selected = true;
        } else if (checkBoxes[0]) {
          checkBoxes[0].checkbox.checked = true;
          checkBoxes[0].optionEl.selected = true;
        }
      }

      updateTriggerText();
      
      // Trigger native change event or callback
      if (onChangeCallback) {
        onChangeCallback(selectEl);
      } else {
        selectEl.dispatchEvent(new Event('change'));
      }
    });
  });

  function updateTriggerText() {
    const selectedTexts = checkBoxes
      .filter(cb => cb.checkbox.checked)
      .map(cb => cb.optionEl.textContent.trim());

    if (selectedTexts.length === 0) {
      triggerText.textContent = 'None Selected';
    } else if (selectedTexts.length === options.length) {
      triggerText.textContent = 'All Selected';
    } else {
      triggerText.textContent = selectedTexts.join(', ');
    }
  }

  updateTriggerText();

  // Toggle dropdown visibility
  trigger.addEventListener('click', (e) => {
    e.stopPropagation();
    // Close other open menus first
    document.querySelectorAll('.cb-dropdown-menu').forEach(m => {
      if (m !== menu) m.classList.add('hidden');
    });
    menu.classList.toggle('hidden');
  });

  // Prevent dropdown menu closing on inner clicks
  menu.addEventListener('click', (e) => {
    e.stopPropagation();
  });

  // Close dropdown on outside click
  document.addEventListener('click', () => {
    menu.classList.add('hidden');
  });

  // Insert container and hide native select
  selectEl.style.display = 'none';
  selectEl.parentNode.insertBefore(container, selectEl.nextSibling);
  container.appendChild(trigger);
  container.appendChild(menu);
};


// Friendly field labels mapping for non-technical users
const friendlyFieldLabels = {
  invoiceNo: "Invoice Number",
  uhid: "Unique Patient ID (UHID)",
  patientName: "Patient Name",
  totalAmount: "Total Bill Amount (₹)",
  gstPaid: "GST Tax Paid (₹)",
  discount: "Discount Allowed (₹)",
  name: "Patient Full Name",
  mobile: "Phone Number",
  allergies: "Known Drug Allergies",
  bloodGroup: "Blood Group",
  id: "Appointment Ticket ID",
  doctorName: "Treating Doctor",
  status: "Visit / Bill Status",
};

// Normalization function to support both raw index.html state & productionSeed invoices
function normalizeTransaction(t) {
  const invoiceNo = t.invoiceId || t.id || 'INV-0000';
  const amount = Number(t.amount || t.totalAmount || 0);
  const paid = Number(t.paidAmount !== undefined ? t.paidAmount : (t.paid || 0));
  const discount = Number(t.discount || 0);
  
  // Derive GST (assume 18% of taxable value if not provided)
  let gstPaid = Number(t.gstPaid || 0);
  if (!gstPaid && amount > 0) {
    gstPaid = Math.round(amount * 0.1525); // ~18% GST inclusive: Amount * (18 / 118)
  }

  // Derive status
  let status = t.status || 'Pending';
  if (status === 'Paid') status = 'Settled';
  if (status === 'Pending' && paid > 0) status = 'Partially Paid';
  if (status === 'Pending' && paid === 0) status = 'Outstanding';
  if (status === 'Partially Paid') status = 'Outstanding';

  // Normalize payer for dropdown filter matching
  let payer = t.payer || 'Self Pay';
  if (payer.includes('TPA') || payer.includes('Insurance') || payer.includes('Assurance') || payer.includes('CGHS') || payer.includes('Corporate')) {
    payer = 'Insurance';
  } else {
    payer = 'Self Pay';
  }

  return {
    invoiceNo,
    uhid: t.uhid || '—',
    patientName: t.patientName || t.name || '—',
    payer,
    gstPaid,
    discount,
    totalAmount: amount,
    outstanding: Math.max(0, amount - paid),
    status
  };
}

window.views.reports = function (container, subAnchor, params) {
  const state = window.state;
  if (!state) return;

  // Set page title breadcrumb
  const pageTitleEl = document.getElementById('active-page-title');
  if (pageTitleEl) pageTitleEl.textContent = "Analytics & Reports";

  // Re-seed if necessary
  if (!state.reportCatalog && typeof window.seedState === 'function') {
    window.seedState();
  }

  // Set active tab if passed from query parameters
  if (params && params.tab) {
    window.reportsActiveTab = params.tab;
    localStorage.setItem("saronil_rep_active_tab", params.tab);
  }

  // Filter categories based on role permissions
  const activeRoles = (window.reportsActiveRole || 'Administrator').split(',');
  let allowedCategories = [];
  activeRoles.forEach(r => {
    allowedCategories = allowedCategories.concat(window.ipdGetAllowedReportCategories(r));
  });
  allowedCategories = [...new Set(allowedCategories)];
  const catalog = (state.reportCatalog || []).filter(r => allowedCategories.includes(r.category));

  // If selected report is not allowed for active role, fall back to first allowed
  let currentReport = catalog.find(r => r.report_id === window.selectedReportId);
  if (!currentReport && catalog.length > 0) {
    currentReport = catalog[0];
    window.selectedReportId = currentReport.report_id;
  }

  // Categories list
  const categories = [...new Set(catalog.map(r => r.category))];

  window.ipdSwitchReportRole = function (selectEl) {
    const roles = [...selectEl.selectedOptions].map(o => o.value);
    window.reportsActiveRole = roles.join(',');
    localStorage.setItem('saronil_rep_active_role', window.reportsActiveRole);
    window.views.reports(container);
  };

  // Expose tab switch helper
  window.ipdSwitchReportTab = function (tab) {
    window.reportsActiveTab = tab;
    localStorage.setItem('saronil_rep_active_tab', tab);
    window.views.reports(container);
  };

  // Expose report selection helper
  window.ipdSelectReport = function (id) {
    window.selectedReportId = id;
    localStorage.setItem('saronil_rep_selected_id', id);
    window.views.reports(container);
  };

  container.innerHTML = `
    <style>
      select[multiple] {
        height: auto !important;
        padding: 6px !important;
        background-image: none !important;
        overflow-y: auto !important;
        border: 1px solid #cbd5e1 !important;
        border-radius: 6px !important;
      }
      select[multiple] option {
        padding: 4px 8px !important;
        border-radius: 4px !important;
        margin-bottom: 2px !important;
      }
      select[multiple] option:checked {
        background: #1b3a5c linear-gradient(0deg, #1b3a5c 0%, #1b3a5c 100%) !important;
        color: #fff !important;
      }
    </style>
    <div class="rep-center flex flex-col gap-6 w-full">
      <!-- HEADER CARD -->
      <div class="card mb-2">
        <div class="card-body flex justify-between items-center flex-wrap gap-4">
          <div>
            <div class="flex items-center gap-2">
              <span class="text-2xl">📈</span>
              <h1 class="text-xl font-bold">Analytics & Reports</h1>
            </div>
            <p class="text-sm text-slate-500 mt-1">
              View official hospital statistics, generate government statutory compliance sheets, or build custom data lists.
            </p>
          </div>
          <div class="flex items-center gap-4 flex-wrap">
            <!-- Active Role Switcher -->
            <div class="flex items-center gap-2">
              <label class="text-xs font-semibold text-slate-500 whitespace-nowrap">Access Level:</label>
              <select id="access-role-selector" class="form-select text-xs py-1 px-2 w-48" multiple style="height: 90px; min-width: 180px;" onchange="window.ipdSwitchReportRole(this)">
                <option value="Administrator" ${activeRoles.includes('Administrator') ? 'selected' : ''}>💼 Administrator / CEO</option>
                <option value="Department Head" ${activeRoles.includes('Department Head') ? 'selected' : ''}>👨‍⚕️ Dept Head</option>
                <option value="Finance" ${activeRoles.includes('Finance') ? 'selected' : ''}>💳 Finance / Accounts</option>
                <option value="Quality" ${activeRoles.includes('Quality') ? 'selected' : ''}>🛡️ Quality / NABH</option>
                <option value="Auditor" ${activeRoles.includes('Auditor') ? 'selected' : ''}>🔍 Auditor</option>
                <option value="Super Admin" ${activeRoles.includes('Super Admin') ? 'selected' : ''}>⚙️ Super Admin</option>
              </select>
            </div>
            <!-- NDPS Safety compliance indicators -->
            <div id="safety-threshold-alerts" class="badge badge-danger text-xs flex items-center gap-1">
              <span>🚨 NDPS Daily Drug Register: 2 hours left to file</span>
            </div>
          </div>
        </div>
      </div>

      <!-- TABS BAR -->
      <div class="flex border-b border-slate-200 gap-2 mb-2">
        <button class="px-4 py-2 text-sm font-medium border-b-2 transition-colors ${window.reportsActiveTab === 'catalog' ? 'border-blue-600 text-blue-600 font-bold' : 'border-transparent text-slate-500 hover:text-slate-700'}" onclick="window.ipdSwitchReportTab('catalog')">📚 Hospital Reports List</button>
        <button class="px-4 py-2 text-sm font-medium border-b-2 transition-colors ${window.reportsActiveTab === 'builder' ? 'border-blue-600 text-blue-600 font-bold' : 'border-transparent text-slate-500 hover:text-slate-700'}" onclick="window.ipdSwitchReportTab('builder')">🛠️ Create Custom Report</button>
        <button class="px-4 py-2 text-sm font-medium border-b-2 transition-colors ${window.reportsActiveTab === 'schedules' ? 'border-blue-600 text-blue-600 font-bold' : 'border-transparent text-slate-500 hover:text-slate-700'}" onclick="window.ipdSwitchReportTab('schedules')">📅 Scheduled & Past Reports</button>
        ${['Administrator', 'Super Admin'].includes(window.reportsActiveRole) ? `
        <button class="px-4 py-2 text-sm font-medium border-b-2 transition-colors ${window.reportsActiveTab === 'governance' ? 'border-blue-600 text-blue-600 font-bold' : 'border-transparent text-slate-500 hover:text-slate-700'}" onclick="window.ipdSwitchReportTab('governance')">🛡️ Data Privacy Settings</button>
        ` : ''}
      </div>

      <!-- VIEWPORT -->
      <div id="reports-viewport" class="w-full">
        <!-- Filled dynamically by active tab -->
      </div>
    </div>

    <!-- Drill-down Details Modal -->
    <div id="report-drilldown-modal" class="modal-backdrop">
      <div>
        <div class="modal-header">
          <h3 id="drilldown-title" class="text-base font-bold m-0 flex justify-between items-center w-full">
            Detailed Entries
            <button type="button" class="btn-close" onclick="window.ipdCloseDrilldownModal()">&times;</button>
          </h3>
        </div>
        <div id="drilldown-content" class="modal-body max-h-96 overflow-y-auto mt-4">
          <!-- Dynamically filled -->
        </div>
        <div class="modal-footer mt-4 pt-3 border-t flex justify-end">
          <button class="btn btn-secondary text-xs" onclick="window.ipdCloseDrilldownModal()">Close Details</button>
        </div>
      </div>
    </div>

    <!-- Schedule Report Modal -->
    <div id="report-schedule-modal" class="modal-backdrop">
      <div>
        <div class="modal-header">
          <h3 class="text-base font-bold m-0 flex justify-between items-center w-full">
            📅 Setup Auto-Email Distribution
            <button type="button" class="btn-close" onclick="window.ipdCloseScheduleModal()">&times;</button>
          </h3>
        </div>
        <form onsubmit="window.ipdSubmitReportSchedule(event)" class="mt-4 flex flex-col gap-4">
          <input type="hidden" id="sched-report-id">
          <div class="form-group mb-0">
            <label class="form-label text-xs">How often should this send?</label>
            <select id="sched-frequency" class="form-select text-xs" multiple required style="height: 65px;">
              <option value="Daily">Every Day (at closing)</option>
              <option value="Weekly">Every Week (Sunday night)</option>
              <option value="Monthly">Every Month (1st of month)</option>
            </select>
          </div>
          <div class="form-group mb-0">
            <label class="form-label text-xs">Recipients Email Addresses (separate with comma)</label>
            <input type="text" id="sched-recipients" class="form-control text-xs" placeholder="e.g. director@saronil.com, audit@saronil.com" required>
          </div>
          <div class="modal-footer flex justify-end gap-2 mt-4 pt-3 border-t">
            <button type="button" class="btn btn-secondary text-xs" onclick="window.ipdCloseScheduleModal()">Cancel</button>
            <button type="submit" class="btn btn-primary text-xs">Activate Auto-Send</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Floating AI Data Assistant Chat Widget -->
    <div id="data-ai-chat-widget" style="position: fixed; bottom: 24px; right: 24px; z-index: 9999; font-family: 'Inter', sans-serif;">
      <!-- Floating Bubble Button -->
      <button id="chat-toggle-bubble" class="btn btn-primary" onclick="window.reportsToggleChat()" style="width: 56px; height: 56px; border-radius: 50%; box-shadow: 0 4px 12px rgba(37,99,235,0.4); display: flex; align-items: center; justify-content: center; font-size: 1.5rem; border: none; background: #2563eb; color: #fff; cursor: pointer; transition: transform 0.2s;" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
        💬
      </button>

      <!-- Expandable Chat Panel (Initially Hidden) -->
      <div id="chat-panel-container" class="card shadow-2xl" style="display: none; position: absolute; bottom: 70px; right: 0; width: 360px; max-width: 90vw; height: 480px; border-radius: 16px; border: 1px solid #e2e8f0; background: #fff; flex-direction: column; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1);">
        <!-- Chat Header -->
        <div class="card-header bg-slate-900 text-white flex justify-between items-center" style="padding: 12px 16px; background: #0f172a; color: #fff; display: flex; justify-content: space-between; align-items: center;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="font-size: 1.2rem;">🤖</span>
            <div style="text-align: left;">
              <h4 style="margin: 0; font-size: 0.85rem; font-weight: 700; line-height: 1.2;">Saronil Data AI</h4>
              <p style="margin: 0; font-size: 0.65rem; color: #94a3b8; font-weight: 500;">Live Hospital Database Query</p>
            </div>
          </div>
          <button onclick="window.reportsToggleChat()" style="background: transparent; border: none; color: #94a3b8; cursor: pointer; font-size: 1rem;">✕</button>
        </div>

        <!-- Chat Body (Messages Area) -->
        <div id="chat-messages-area" style="flex: 1; padding: 16px; overflow-y: auto; display: flex; flex-direction: column; gap: 12px; background: #f8fafc; font-size: 0.75rem; height: 320px; text-align: left; box-sizing: border-box;">
          <!-- Welcome Message -->
          <div style="align-self: flex-start; background: #fff; border: 1px solid #e2e8f0; border-radius: 12px 12px 12px 0; padding: 10px 12px; max-width: 85%; color: #334155; line-height: 1.4; box-shadow: 0 1px 2px rgba(0,0,0,0.05);">
            🤖 <strong>Hello!</strong> I am your Saronil MIS data assistant. Ask me questions about hospital revenue, patient admissions, GST tax registers, pantry stocks, or staff rosters.
          </div>
          <!-- Quick Question Chips -->
          <div style="display: flex; flex-wrap: wrap; gap: 6px; margin-top: 4px; align-self: flex-start;" id="chat-suggestion-chips">
            <button onclick="window.submitSuggestionChip('What is the total revenue?')" style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 999px; padding: 4px 10px; font-size: 0.68rem; color: #1e40af; cursor: pointer; font-weight: 600; text-align: left;">📈 Total Revenue</button>
            <button onclick="window.submitSuggestionChip('How many patients are admitted?')" style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 999px; padding: 4px 10px; font-size: 0.68rem; color: #1e40af; cursor: pointer; font-weight: 600; text-align: left;">👤 Admitted Patients</button>
            <button onclick="window.submitSuggestionChip('Show GST tax collected')" style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 999px; padding: 4px 10px; font-size: 0.68rem; color: #1e40af; cursor: pointer; font-weight: 600; text-align: left;">🧾 GST Tax Log</button>
            <button onclick="window.submitSuggestionChip('What is the status of pantry inventory?')" style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 999px; padding: 4px 10px; font-size: 0.68rem; color: #1e40af; cursor: pointer; font-weight: 600; text-align: left;">🍳 Pantry Status</button>
          </div>
        </div>

        <!-- Typing Indicator (Initially Hidden) -->
        <div id="chat-typing-indicator" style="display: none; align-self: flex-start; margin-left: 16px; margin-bottom: 8px; font-size: 0.68rem; color: #64748b; font-style: italic; text-align: left;">
          AI is compiling metrics...
        </div>

        <!-- Chat Input Footer -->
        <form id="chat-input-form" onsubmit="window.submitChatForm(event)" style="border-top: 1px solid #e2e8f0; display: flex; padding: 8px 12px; background: #fff; gap: 8px; align-items: center; margin: 0; box-sizing: border-box;">
          <input type="text" id="chat-user-input" placeholder="Ask a question about database..." style="flex: 1; font-size: 0.75rem; padding: 6px 10px; border-radius: 8px; border: 1px solid #cbd5e1; outline: none; box-sizing: border-box;" required>
          <button type="submit" class="btn btn-primary btn-sm" style="padding: 6px 12px; border-radius: 8px; background: #2563eb; color: #fff; border: none; font-weight: 700; cursor: pointer; font-size: 0.72rem; flex-shrink: 0;">Send</button>
        </form>
      </div>
    </div>
  `;

  // Render active tab inside viewport
  const viewport = document.getElementById('reports-viewport');
  if (window.reportsActiveTab === 'catalog') {
    window.ipdRenderCatalogTab(viewport, catalog, categories, currentReport);
  } else if (window.reportsActiveTab === 'builder') {
    window.ipdRenderBuilderTab(viewport);
  } else if (window.reportsActiveTab === 'schedules') {
    window.ipdRenderSchedulesTab(viewport);
  } else if (window.reportsActiveTab === 'governance') {
    window.ipdRenderGovernanceTab(viewport);
  }

  // Transform always-present dropdowns
  window.ipdMakeCheckboxDropdown('access-role-selector');
  window.ipdMakeCheckboxDropdown('sched-frequency');

  // Define chat methods in active scope
  window.reportsToggleChat = function () {
    const chatPanel = document.getElementById('chat-panel-container');
    if (!chatPanel) return;
    if (chatPanel.style.display === 'none' || !chatPanel.style.display) {
      chatPanel.style.display = 'flex';
      const messagesArea = document.getElementById('chat-messages-area');
      if (messagesArea) messagesArea.scrollTop = messagesArea.scrollHeight;
    } else {
      chatPanel.style.display = 'none';
    }
  };

  window.submitSuggestionChip = function (question) {
    const input = document.getElementById('chat-user-input');
    if (input) {
      input.value = question;
      window.submitChatForm({ preventDefault: () => {} });
    }
  };

  window.submitChatForm = function (e) {
    if (e && e.preventDefault) e.preventDefault();
    const input = document.getElementById('chat-user-input');
    if (!input) return;
    const query = input.value.trim();
    if (!query) return;

    const messagesArea = document.getElementById('chat-messages-area');
    if (!messagesArea) return;

    // Append user message
    const userMsg = document.createElement('div');
    userMsg.style.alignSelf = 'flex-end';
    userMsg.style.background = '#2563eb';
    userMsg.style.color = '#fff';
    userMsg.style.borderRadius = '12px 12px 0 12px';
    userMsg.style.padding = '10px 12px';
    userMsg.style.maxWidth = '85%';
    userMsg.style.lineHeight = '1.4';
    userMsg.style.boxShadow = '0 1px 2px rgba(0,0,0,0.05)';
    userMsg.textContent = query;
    messagesArea.appendChild(userMsg);

    // Clear input
    input.value = '';

    // Scroll to bottom
    messagesArea.scrollTop = messagesArea.scrollHeight;

    // Show typing indicator
    const typingIndicator = document.getElementById('chat-typing-indicator');
    if (typingIndicator) typingIndicator.style.display = 'block';

    // Simulate AI response delay
    setTimeout(() => {
      if (typingIndicator) typingIndicator.style.display = 'none';

      // Evaluate response
      const answer = window.processDataChatQuery(query);

      // Append assistant message
      const assistantMsg = document.createElement('div');
      assistantMsg.style.alignSelf = 'flex-start';
      assistantMsg.style.background = '#fff';
      assistantMsg.style.border = '1px solid #e2e8f0';
      assistantMsg.style.borderRadius = '12px 12px 12px 0';
      assistantMsg.style.padding = '10px 12px';
      assistantMsg.style.maxWidth = '85%';
      assistantMsg.style.color = '#334155';
      assistantMsg.style.lineHeight = '1.4';
      assistantMsg.style.boxShadow = '0 1px 2px rgba(0,0,0,0.05)';
      
      // Convert markdown syntax to HTML elements (very simple parser)
      let formattedText = answer
        .replace(/\n/g, '<br/>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)(<br\/>|$)/g, '• $1$2');

      assistantMsg.innerHTML = formattedText;
      messagesArea.appendChild(assistantMsg);

      // Re-scroll suggestion chips to bottom if they exist
      const chips = document.getElementById('chat-suggestion-chips');
      if (chips) messagesArea.appendChild(chips);

      // Scroll to bottom
      messagesArea.scrollTop = messagesArea.scrollHeight;
    }, 450);
  };

  window.processDataChatQuery = function(query) {
    const q = query.toLowerCase().trim();
    const state = window.state || {};
    
    // Total Revenue Query
    if (q.includes('revenue') || q.includes('sales') || q.includes('total money') || q.includes('total bills')) {
      const transactions = state.billing || [];
      const totalRev = transactions.reduce((acc, t) => acc + (t.amount || 0), 0);
      const settled = transactions.filter(t => t.status === 'Settled').length;
      const outstanding = transactions.filter(t => t.status === 'Outstanding').length;
      return `📈 **Revenue Snapshot:**\n* **Total Billing:** ₹${totalRev.toLocaleString()}\n* **Settled Invoices:** ${settled}\n* **Outstanding Due:** ${outstanding} invoices.\n\n*Would you like to export the detailed Billing & Revenue Summary report?*`;
    }
    
    // Admitted Patients / Occupancy Query
    if (q.includes('admitted') || q.includes('occupancy') || q.includes('patient') || q.includes('inpatient') || q.includes('ipd')) {
      const patients = state.patients || [];
      const admitted = patients.filter(p => p.type === 'IPD' && p.status === 'Admitted').length;
      const discharged = patients.filter(p => p.type === 'IPD' && p.status === 'Discharged').length;
      const er = patients.filter(p => p.type === 'ER').length;
      return `👤 **Patient Census:**\n* **Currently Admitted (IPD):** ${admitted} patients\n* **Discharged today:** ${discharged} patients\n* **Emergency Desk (ER) queue:** ${er} active cases\n\n*You can view real-time bed layouts under the ATD and Bed Board tab.*`;
    }
    
    // GST Tax collected query
    if (q.includes('gst') || q.includes('tax') || q.includes('cgst') || q.includes('sgst')) {
      const transactions = state.billing || [];
      const totalGST = transactions.reduce((acc, t) => acc + (t.gstPaid || 0), 0);
      const cgst = Math.round(totalGST / 2);
      const sgst = cgst;
      return `🧾 **GST Tax Summary:**\n* **Total GST Collected:** ₹${totalGST.toLocaleString()}\n* **CGST (Central):** ₹${cgst.toLocaleString()}\n* **SGST (State):** ₹${sgst.toLocaleString()}\n\n*This data matches the statutory GST returns GSTR-1 configuration.*`;
    }

    // Dietary and Pantry Query
    if (q.includes('pantry') || q.includes('kitchen') || q.includes('diet') || q.includes('food') || q.includes('meal')) {
      const inventory = state.pantryInventory || [];
      const lowStock = inventory.filter(i => (i.stock || 0) <= (i.parLevel || 0));
      const locationCount = (state.pantryLocations || []).length;
      const floorStockCount = (state.kitchenFloorStock || []).length;
      
      let text = `🍳 **Dietary & Pantry Operations:**\n* **Total Locations Managed:** ${locationCount} storage areas\n* **Kitchen Floor active inventory:** ${floorStockCount} items\n`;
      if (lowStock.length > 0) {
        text += `* **🚨 Low Stock Alert:** ${lowStock.length} items are below par level (e.g. ${lowStock.slice(0, 2).map(i => i.name).join(', ')}).\n`;
      } else {
        text += `* Stock levels are currently above par limits.\n`;
      }
      return text;
    }

    // Staff and Doctors Query
    if (q.includes('doctor') || q.includes('staff') || q.includes('nurse') || q.includes('employee')) {
      const staff = state.staffList || [];
      const doctors = staff.filter(s => s.type === 'Doctor').length;
      const nurses = staff.filter(s => s.type === 'Nurse').length;
      const active = staff.filter(s => s.status === 'Active').length;
      return `🧑‍⚕️ **Staff Directory Statistics:**\n* **Active Staff on Shift:** ${active} members\n* **Registered Doctors/Physicians:** ${doctors} specialists\n* **Nursing Supervisor & Ward staff:** ${nurses} employees\n\n*Check the Credentials Tracker or Attendance views for detail logs.*`;
    }

    // Default Fallback Response
    return `🤖 **Saronil Data AI Assistant:**\nI can analyze live dashboard metrics, financial ledgers, census queues, and inventory logs.\n\n**Try asking:**\n* *"What is the total revenue?"*\n* *"How many patients are admitted?"*\n* *"Show GST tax details"* \n* *"What is the status of pantry inventory?"*`;
  };
};

/* ==========================================================================
   ALLOWED REPORT CATEGORIES PER ROLE
   ========================================================================== */
window.ipdGetAllowedReportCategories = function (role) {
  const mapping = {
    Administrator: [
      "Financial/Revenue Cycle",
      "Clinical Quality & Patient Safety",
      "Operational/Patient Flow",
      "Pharmacy & Inventory",
      "Diagnostics (LIS/RIS)",
      "OT & Anesthesia",
      "Blood Bank",
      "Nursing & Ward",
      "ICU/Critical Care",
      "Support Services",
      "HR & Staffing",
      "Regulatory & Statutory Compliance",
      "Insurance/TPA/Govt Scheme",
      "IT/Data Security",
      "Patient Experience",
      "Executive/Board-level",
      "Specialty-specific",
    ],
    "Super Admin": [
      "Financial/Revenue Cycle",
      "Clinical Quality & Patient Safety",
      "Operational/Patient Flow",
      "Pharmacy & Inventory",
      "Diagnostics (LIS/RIS)",
      "OT & Anesthesia",
      "Blood Bank",
      "Nursing & Ward",
      "ICU/Critical Care",
      "Support Services",
      "HR & Staffing",
      "Regulatory & Statutory Compliance",
      "Insurance/TPA/Govt Scheme",
      "IT/Data Security",
      "Patient Experience",
      "Executive/Board-level",
      "Specialty-specific",
    ],
    Finance: [
      "Financial/Revenue Cycle",
      "Regulatory & Statutory Compliance",
      "Insurance/TPA/Govt Scheme",
    ],
    Quality: [
      "Clinical Quality & Patient Safety",
      "Regulatory & Statutory Compliance",
      "Patient Experience",
    ],
    "Department Head": [
      "Clinical Quality & Patient Safety",
      "Operational/Patient Flow",
      "Nursing & Ward",
      "Specialty-specific",
    ],
    Auditor: [
      "Financial/Revenue Cycle",
      "Clinical Quality & Patient Safety",
      "Regulatory & Statutory Compliance",
    ],
  };
  return mapping[role] || ["Clinical Quality & Patient Safety"];
};

/* ==========================================================================
   TAB 1: PREDEFINED CATALOG RENDERER
   ========================================================================== */
window.ipdRenderCatalogTab = function (container, catalog, categories, currentReport) {
  if (!currentReport) {
    container.innerHTML = `<div class="card p-6 text-center text-slate-500 text-sm">No reports available for this access level.</div>`;
    return;
  }

  container.innerHTML = `
    <!-- Horizontal Filters (No box, horizontal flex layout) -->
    <div class="flex flex-wrap gap-4 mb-6 items-end w-full">
      <div class="flex-1 min-w-[200px]">
        <label class="form-label text-xs font-semibold text-slate-500 uppercase tracking-wider">Quick Search</label>
        <input type="text" id="catalog-search" class="form-control text-sm" placeholder="Search by name..." oninput="window.ipdFilterCatalogSidebar()">
      </div>
      <div class="flex-1 min-w-[200px]">
        <label class="form-label text-xs font-semibold text-slate-500 uppercase tracking-wider">Filter Frequency</label>
        <select id="catalog-frequency-filter" class="form-select text-xs" multiple style="height: 65px;" onchange="window.ipdFilterCatalogSidebar()">
          <option value="All" selected>All Frequencies</option>
          <option value="on-demand">On-Demand</option>
          <option value="scheduled">Scheduled</option>
        </select>
      </div>
      <div class="flex-1 min-w-[240px]">
        <label class="form-label text-xs font-semibold text-slate-500 uppercase tracking-wider">Filter Source Module</label>
        <select id="catalog-source-filter" class="form-select text-xs" multiple style="height: 90px;" onchange="window.ipdFilterCatalogSidebar()">
          <option value="All" selected>All Sources</option>
          <option value="billing">Invoices</option>
          <option value="patients">Clinical EMR</option>
          <option value="appointments">OPD Desk</option>
          <option value="Pharmacy">Pharmacy</option>
        </select>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-4 gap-6 w-full">
      <!-- Catalog Sidebar Reports List -->
      <div class="col-span-1 flex flex-col gap-4">
        <div id="sidebar-reports-list" class="flex flex-col gap-4 pr-1">
          ${categories.map(cat => `
            <div class="catalog-category-group" data-category="${cat}">
              <h5 class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 px-1">${cat}</h5>
              <div class="flex flex-col gap-1">
                ${catalog.filter(r => r.category === cat).map(r => `
                  <div class="report-item p-3 rounded-md cursor-pointer border transition-colors ${window.selectedReportId === r.report_id ? 'bg-blue-50 border-blue-200 text-blue-900' : 'bg-white border-slate-100 hover:bg-slate-50 text-slate-700'}" onclick="window.ipdSelectReport('${r.report_id}')" data-name="${r.name.toLowerCase()}" data-frequency="${r.frequency_type}" data-source="${r.source_module}" data-category="${r.category}">
                    <div class="flex justify-between items-start gap-1">
                      <strong class="text-xs font-semibold block leading-snug">${r.name}</strong>
                      ${r.is_statutory ? `<span class="badge b-re text-[0.6rem] py-0 px-1 whitespace-nowrap">Govt Standard</span>` : ''}
                    </div>
                    <span class="text-[0.65rem] text-slate-400 block mt-1">Source: ${r.source_module.toUpperCase()}</span>
                  </div>
                `).join("")}
              </div>
            </div>
          `).join("")}
        </div>
      </div>

      <!-- Catalog Main Details -->
      <div class="col-span-1 md:col-span-3 flex flex-col gap-6">
        <div class="card">
          <div class="card-header flex justify-between items-center">
            <div>
              <h3 class="card-title text-base font-bold">${currentReport.name}</h3>
              <p class="card-subtitle text-xs">Category: ${currentReport.category} · Database Module: ${currentReport.source_module.toUpperCase()}</p>
            </div>
            ${currentReport.is_statutory ? `<span class="badge b-re text-xs">Locked Govt Template</span>` : ''}
          </div>
          <div class="card-body">
            <!-- Filters Console -->
            <div class="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-4">
              <div>
                <label class="form-label text-xs">Start Date</label>
                <input type="date" id="cat-start-date" class="form-control text-xs" value="2026-06-01">
              </div>
              <div>
                <label class="form-label text-xs">End Date</label>
                <input type="date" id="cat-end-date" class="form-control text-xs" value="2026-07-31">
              </div>
              <div>
                <label class="form-label text-xs">Select Ward / Location</label>
                <select id="cat-ward" class="form-select text-xs" multiple style="height: 80px;">
                  <option value="All" selected>All Locations</option>
                  <option value="General Ward">General Ward</option>
                  <option value="Private Room">Private Room</option>
                  <option value="CCU">CCU</option>
                </select>
              </div>
              <div>
                <label class="form-label text-xs">Select Payer Type</label>
                <select id="cat-payer" class="form-select text-xs" multiple style="height: 65px;">
                  <option value="All" selected>All Payers</option>
                  <option value="Self Pay">Self Pay / Cash</option>
                  <option value="Insurance">Insurance Scheme</option>
                </select>
              </div>
            </div>
            <div class="flex justify-between items-center gap-2 flex-wrap pt-3 border-t">
              <button class="btn btn-outline btn-sm text-xs" onclick="window.ipdOpenScheduleModal('${currentReport.report_id}')" ${window.reportsActiveRole === 'Auditor' ? 'disabled' : ''}>
                ✉️ Setup Auto-Email
              </button>
              <div class="flex gap-2">
                <button class="btn btn-outline btn-sm text-xs" onclick="window.ipdExportReport('CSV')">📥 Download Excel (CSV)</button>
                <button class="btn btn-outline btn-sm text-xs" onclick="window.ipdExportReport('PDF')">🖨️ Export PDF / Print</button>
                <button class="btn btn-primary btn-sm text-xs" onclick="window.ipdGeneratePredefinedReport('${currentReport.report_id}')">🔍 Generate Report</button>
              </div>
            </div>
          </div>
        </div>

        <!-- Dynamic Output Display -->
        <div id="catalog-report-output" class="w-full">
          <!-- Filled dynamically when Run Query is clicked -->
        </div>
      </div>
    </div>
  `;

  // Filter Catalog lists on text search
  window.ipdFilterCatalogSidebar = function () {
    const text = document.getElementById('catalog-search').value.toLowerCase().trim();
    const freqEl = document.getElementById('catalog-frequency-filter');
    const srcEl = document.getElementById('catalog-source-filter');
    const freqOptions = freqEl ? [...freqEl.selectedOptions].map(o => o.value) : ['All'];
    const srcOptions = srcEl ? [...srcEl.selectedOptions].map(o => o.value) : ['All'];

    document.querySelectorAll('.report-item').forEach(item => {
      const name = item.dataset.name || '';
      const itemFreq = item.dataset.frequency || '';
      const itemSrc = item.dataset.source || '';

      const matchesText = !text || name.includes(text);
      const matchesFreq = freqOptions.includes('All') || freqOptions.includes(itemFreq);
      const matchesSrc = srcOptions.includes('All') || srcOptions.some(val => itemSrc.toLowerCase() === val.toLowerCase());

      if (matchesText && matchesFreq && matchesSrc) {
        item.style.display = 'block';
      } else {
        item.style.display = 'none';
      }
    });

    // Hide category headers if all children are hidden
    document.querySelectorAll('.catalog-category-group').forEach(group => {
      const visibleChildren = [...group.querySelectorAll('.report-item')].some(item => item.style.display !== 'none');
      group.style.display = visibleChildren ? 'block' : 'none';
    });
  };

  // Transform filters to checkbox dropdowns
  window.ipdMakeCheckboxDropdown('catalog-frequency-filter');
  window.ipdMakeCheckboxDropdown('catalog-source-filter');
  window.ipdMakeCheckboxDropdown('cat-ward');
  window.ipdMakeCheckboxDropdown('cat-payer');

  // Trigger running query automatically
  window.ipdGeneratePredefinedReport(currentReport.report_id);
};

/* ==========================================================================
   GENERATE PREDEFINED REPORT (QUERY RUNNER)
   ========================================================================== */
window.ipdGeneratePredefinedReport = function (reportId) {
  const container = document.getElementById("catalog-report-output");
  if (!container) return;
  const state = window.state;

  const start = document.getElementById("cat-start-date").value;
  const end = document.getElementById("cat-end-date").value;
  const catWardEl = document.getElementById("cat-ward");
  const catPayerEl = document.getElementById("cat-payer");
  const wardOptions = catWardEl ? [...catWardEl.selectedOptions].map(o => o.value) : ['All'];
  const payerOptions = catPayerEl ? [...catPayerEl.selectedOptions].map(o => o.value) : ['All'];

  // Render loading
  container.innerHTML = `
    <div class="card p-6 flex flex-col items-center justify-center gap-2 text-slate-500">
      <svg class="animate-spin h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
      </svg>
      <span>Compiling data entries...</span>
    </div>
  `;

  setTimeout(() => {
    let kpiHTML = '';
    let tableHTML = '';

    if (reportId === 'REP001') {
      // Billing & Revenue Summary
      let transactions = (state.billing || []).map(normalizeTransaction);
      if (!payerOptions.includes('All')) {
        transactions = transactions.filter(t => payerOptions.includes(t.payer));
      }

      // Calculate sums
      const totalRev = transactions.reduce((acc, t) => acc + t.totalAmount, 0);
      const totalGST = transactions.reduce((acc, t) => acc + t.gstPaid, 0);
      const totalDiscount = transactions.reduce((acc, t) => acc + t.discount, 0);
      const outstanding = transactions.reduce((acc, t) => acc + (t.status === 'Outstanding' ? t.outstanding : 0), 0);

      kpiHTML = `
        <div class="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
          <div class="card p-4 bg-slate-50 border-slate-200">
            <span class="text-[0.65rem] font-bold text-slate-400 uppercase tracking-wider block">TOTAL HOSPITAL REVENUE</span>
            <h4 class="text-xl font-bold mt-1 text-slate-800">₹${totalRev.toLocaleString()}</h4>
          </div>
          <div class="card p-4 bg-slate-50 border-slate-200">
            <span class="text-[0.65rem] font-bold text-slate-400 uppercase tracking-wider block">GST TAX COLLECTED</span>
            <h4 class="text-xl font-bold mt-1 text-slate-800">₹${totalGST.toLocaleString()}</h4>
          </div>
          <div class="card p-4 bg-slate-50 border-slate-200">
            <span class="text-[0.65rem] font-bold text-slate-400 uppercase tracking-wider block">TOTAL DISCOUNTS</span>
            <h4 class="text-xl font-bold mt-1 text-slate-800">₹${totalDiscount.toLocaleString()}</h4>
          </div>
          <div class="card p-4 bg-slate-50 border-slate-200">
            <span class="text-[0.65rem] font-bold text-slate-400 uppercase tracking-wider block">OUTSTANDING DUE</span>
            <h4 class="text-xl font-bold mt-1 text-slate-800">₹${outstanding.toLocaleString()}</h4>
          </div>
        </div>
      `;

      tableHTML = `
        <table class="custom-table">
          <thead>
            <tr>
              <th>Invoice No</th>
              <th>Patient ID (UHID)</th>
              <th>Patient Name</th>
              <th>Payer Type</th>
              <th>GST Tax</th>
              <th>Discount</th>
              <th>Net Bill Amount (₹)</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${transactions.map(t => `
              <tr class="cursor-pointer" onclick="window.ipdShowDrilldownRecord('billing', '${t.invoiceNo}')" title="Click to view full invoice items breakdown">
                <td class="mono font-semibold">${t.invoiceNo}</td>
                <td class="mono">${t.uhid}</td>
                <td><span>${t.patientName}</span></td>
                <td>${t.payer || 'Self Pay'}</td>
                <td>₹${t.gstPaid || 0}</td>
                <td>₹${t.discount || 0}</td>
                <td class="mono font-semibold">₹${t.totalAmount.toLocaleString()}</td>
                <td><span class="badge ${t.status === 'Settled' ? 'badge-success' : 'badge-warning'}">${t.status}</span></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;

    } else if (reportId === 'REP002') {
      // GST Returns GSTR-1 File (Statutory)
      let transactions = (state.billing || []).map(normalizeTransaction);
      const totalSales = transactions.reduce((acc, t) => acc + t.totalAmount, 0);
      const cgst = transactions.reduce((acc, t) => acc + Math.round(t.gstPaid / 2), 0);
      const sgst = cgst;

      kpiHTML = `
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div class="card p-4 bg-slate-50 border-slate-200">
            <span class="text-[0.65rem] font-bold text-slate-400 uppercase tracking-wider block">TAXABLE VALUE OUTWARD SUPPLY</span>
            <h4 class="text-xl font-bold mt-1 text-slate-800">₹${totalSales.toLocaleString()}</h4>
          </div>
          <div class="card p-4 bg-slate-50 border-slate-200">
            <span class="text-[0.65rem] font-bold text-slate-400 uppercase tracking-wider block">INTEGRATED/CGST (9%)</span>
            <h4 class="text-xl font-bold mt-1 text-slate-800">₹${cgst.toLocaleString()}</h4>
          </div>
          <div class="card p-4 bg-slate-50 border-slate-200">
            <span class="text-[0.65rem] font-bold text-slate-400 uppercase tracking-wider block">STATE/SGST (9%)</span>
            <h4 class="text-xl font-bold mt-1 text-slate-800">₹${sgst.toLocaleString()}</h4>
          </div>
        </div>
      `;

      tableHTML = `
        <table class="custom-table">
          <thead>
            <tr>
              <th>GSTIN Receiver</th>
              <th>Invoice Number</th>
              <th>Invoice Date</th>
              <th>Supply State</th>
              <th>Tax Rate (%)</th>
              <th>CGST Amount (₹)</th>
              <th>SGST Amount (₹)</th>
              <th>Total GST (₹)</th>
            </tr>
          </thead>
          <tbody>
            ${transactions.map(t => `
              <tr class="cursor-pointer" onclick="window.ipdShowDrilldownRecord('billing', '${t.invoiceNo}')">
                <td class="mono text-xs">27AAAAA1111A1Z1 (URD)</td>
                <td class="mono font-semibold">${t.invoiceNo}</td>
                <td>2026-07-09</td>
                <td>Maharashtra (MH)</td>
                <td>18%</td>
                <td>₹${Math.round(t.gstPaid / 2)}</td>
                <td>₹${Math.round(t.gstPaid / 2)}</td>
                <td class="mono font-semibold">₹${t.gstPaid || 0}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;

    } else if (reportId === 'REP009') {
      // IPD Ward Bed Occupancy
      const beds = state.bedsStatus || {};
      const totalBeds = Object.keys(beds).length;
      const occupiedBeds = Object.values(beds).filter(b => b.status === 'Occupied').length;
      const cleanPending = Object.values(beds).filter(b => b.status === 'Dirty' || b.status === 'Cleaning').length;
      const rate = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;

      kpiHTML = `
        <div class="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
          <div class="card p-4 bg-slate-50 border-slate-200">
            <span class="text-[0.65rem] font-bold text-slate-400 uppercase tracking-wider block">TOTAL BED CAPACITY</span>
            <h4 class="text-xl font-bold mt-1 text-slate-800">${totalBeds} Beds</h4>
          </div>
          <div class="card p-4 bg-slate-50 border-slate-200">
            <span class="text-[0.65rem] font-bold text-slate-400 uppercase tracking-wider block">OCCUPIED BEDS</span>
            <h4 class="text-xl font-bold mt-1 text-slate-800">${occupiedBeds} Beds</h4>
          </div>
          <div class="card p-4 bg-slate-50 border-slate-200">
            <span class="text-[0.65rem] font-bold text-slate-400 uppercase tracking-wider block">BED OCCUPANCY RATE</span>
            <h4 class="text-xl font-bold mt-1 text-slate-800">${rate}%</h4>
          </div>
          <div class="card p-4 bg-slate-50 border-slate-200">
            <span class="text-[0.65rem] font-bold text-slate-400 uppercase tracking-wider block">CLEANING SCHEDULE</span>
            <h4 class="text-xl font-bold mt-1 text-slate-800">${cleanPending} Beds</h4>
          </div>
        </div>
      `;

      // Ward wise group by
      const wardMap = {};
      Object.keys(state.wards).forEach(key => {
        wardMap[key] = { total: 0, occupied: 0 };
      });
      Object.entries(beds).forEach(([bedId, info]) => {
        if (wardMap[info.wardKey]) {
          wardMap[info.wardKey].total++;
          if (info.status === 'Occupied') wardMap[info.wardKey].occupied++;
        }
      });

      tableHTML = `
        <table class="custom-table">
          <thead>
            <tr>
              <th>Ward / Room Category</th>
              <th>Total Beds Available</th>
              <th>Beds Occupied</th>
              <th>Beds Free</th>
              <th>Occupancy (%)</th>
            </tr>
          </thead>
          <tbody>
            ${Object.entries(wardMap).filter(([wardKey, stats]) => {
              const friendlyName = state.wards[wardKey] ? state.wards[wardKey].name : wardKey;
              return wardOptions.includes('All') || wardOptions.some(w => friendlyName.toLowerCase().includes(w.toLowerCase()));
            }).map(([wardKey, stats]) => `
              <tr class="cursor-pointer" onclick="window.ipdShowDrilldownRecord('ward', '${wardKey}')" title="Click to view list of patients inside this category">
                <td><strong>${wardKey}</strong></td>
                <td>${stats.total}</td>
                <td>${stats.occupied}</td>
                <td>${stats.total - stats.occupied}</td>
                <td class="mono font-semibold">${stats.total > 0 ? Math.round((stats.occupied / stats.total) * 100) : 0}%</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;

    } else if (reportId === 'REP021') {
      // NDPS Narcotic Register (Statutory Compliance)
      kpiHTML = `
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div class="card p-4 bg-slate-50 border-slate-200">
            <span class="text-[0.65rem] font-bold text-slate-400 uppercase tracking-wider block">NARCOTIC STOCK BALANCE</span>
            <h4 class="text-xl font-bold mt-1 text-slate-800">420 Amps</h4>
          </div>
          <div class="card p-4 bg-slate-50 border-slate-200">
            <span class="text-[0.65rem] font-bold text-slate-400 uppercase tracking-wider block">TOTAL DISPENSED TODAY</span>
            <h4 class="text-xl font-bold mt-1 text-slate-800">8 Amps</h4>
          </div>
          <div class="card p-4 bg-slate-50 border-slate-200">
            <span class="text-[0.65rem] font-bold text-slate-400 uppercase tracking-wider block">DOUBLE-VERIFICATION RATE</span>
            <h4 class="text-xl font-bold mt-1 text-slate-800">100%</h4>
          </div>
        </div>
      `;

      tableHTML = `
        <table class="custom-table">
          <thead>
            <tr>
              <th>Date / Time</th>
              <th>Narcotic Name</th>
              <th>Patient Name (UHID)</th>
              <th>Prescribed By</th>
              <th>Double-Verified By Nurse</th>
              <th>Qty Dispensed</th>
              <th>Balance Stock</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td class="text-xs">2026-07-09 · 10:15 AM</td>
              <td>Fentanyl 50mcg/mL</td>
              <td>Rajesh Kumar (SH-2026-04821)</td>
              <td>Dr. Srinivasan</td>
              <td>Mary (Staff Nurse)</td>
              <td>2 Amps</td>
              <td class="mono font-semibold">420 Amps</td>
            </tr>
            <tr>
              <td class="text-xs">2026-07-09 · 08:30 AM</td>
              <td>Morphine Inj 10mg</td>
              <td>Mohammed Iqbal (SH-2026-04799)</td>
              <td>Dr. Devanti</td>
              <td>Rita (Staff Nurse)</td>
              <td>1 Amp</td>
              <td class="mono font-semibold">284 Amps</td>
            </tr>
          </tbody>
        </table>
      `;

    } else {
      // Fallback display
      kpiHTML = `
        <div class="card p-4 text-slate-600 text-sm">
          Query completed. Exposing 2,403 raw records for Date Range ${start} to ${end}.
        </div>
      `;
      tableHTML = `
        <div class="card p-4 text-center text-slate-400 text-xs">
          No additional record-level data matches this filter set. Export results to download spreadsheet.
        </div>
      `;
    }

    container.innerHTML = `
      <!-- KPIs -->
      ${kpiHTML}
      <!-- Records Table -->
      <div class="card">
        <div class="card-header">
          <h3 class="card-title text-sm font-bold">🔬 Underlying Data Rows</h3>
        </div>
        <div class="custom-table-container">
          ${tableHTML}
        </div>
      </div>
    `;
  }, 400);
};

/* ==========================================================================
   DRILL DOWN RECORD MODAL CONTROLLER
   ========================================================================== */
window.ipdShowDrilldownRecord = function (module, id) {
  const modal = document.getElementById("report-drilldown-modal");
  const title = document.getElementById("drilldown-title");
  const content = document.getElementById("drilldown-content");
  if (!modal || !content) return;

  title.innerHTML = `
    <span>Detailed Items Breakdown: #${id}</span>
    <button type="button" class="btn-close" onclick="window.ipdCloseDrilldownModal()">&times;</button>
  `;
  modal.style.display = "flex";

  if (module === "billing") {
    // Search both forms of invoices
    const rawItem = window.state.billing.find(b => (b.invoiceId === id || b.id === id));
    if (rawItem) {
      const item = normalizeTransaction(rawItem);
      content.innerHTML = `
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4 bg-slate-50 p-4 rounded-md text-xs text-slate-600">
          <div><strong>Invoice No:</strong> ${item.invoiceNo}</div>
          <div><strong>Patient Name:</strong> ${item.patientName} (${item.uhid})</div>
          <div><strong>Bill Total:</strong> ₹${item.totalAmount.toLocaleString()}</div>
          <div><strong>GST Tax Share:</strong> ₹${item.gstPaid.toLocaleString()}</div>
          <div><strong>Discount Allowed:</strong> ₹${item.discount.toLocaleString()}</div>
          <div><strong>Payer Category:</strong> ${item.payer}</div>
          <div><strong>Transaction Status:</strong> <span class="badge badge-primary">${item.status}</span></div>
          <div><strong>Authorized By:</strong> Sarah Jones</div>
        </div>
        <div>
          <h5 class="text-xs font-bold text-slate-700 mb-2">Itemized Details</h5>
          <table class="custom-table">
            <thead>
              <tr>
                <th>Service Name</th>
                <th>Category</th>
                <th>Rate (₹)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>IPD Consultation Charge</td>
                <td>Doctor Fees</td>
                <td>₹${Math.round(item.totalAmount * 0.7).toLocaleString()}</td>
              </tr>
              <tr>
                <td>Pharmacy Standard Dispense</td>
                <td>Medicines</td>
                <td>₹${Math.round(item.totalAmount * 0.2).toLocaleString()}</td>
              </tr>
              <tr>
                <td>Hospital Utility Service Tax</td>
                <td>GST Utilities</td>
                <td>₹${item.gstPaid.toLocaleString()}</td>
              </tr>
            </tbody>
          </table>
        </div>
      `;
    }
  } else if (module === "ward") {
    const patients = window.state.patients.filter(p => p.ward === id && p.type === "IPD");
    content.innerHTML = `
      <h5 class="text-xs font-bold text-slate-700 mb-2">Admitted Patients currently in ${id}</h5>
      <table class="custom-table">
        <thead>
          <tr>
            <th>Bed Room</th>
            <th>UHID</th>
            <th>Patient Name</th>
            <th>Age / Sex</th>
            <th>Primary Consultant</th>
            <th>Acuity Status</th>
          </tr>
        </thead>
        <tbody>
          ${patients.map(p => `
            <tr>
              <td class="mono font-semibold">${p.bed || '—'}</td>
              <td class="mono">${p.uhid}</td>
              <td><strong>${p.name}</strong></td>
              <td>${p.age} / ${p.gender}</td>
              <td>${p.primaryConsultant}</td>
              <td><span class="badge ${p.alerts && p.alerts.includes('Critical') ? 'b-re' : 'b-gr'}">${p.alerts && p.alerts.includes('Critical') ? 'Critical' : 'Stable'}</span></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  } else {
    content.innerHTML = `<p class="text-sm text-slate-500">Record details are available inside parent modules.</p>`;
  }
};

window.ipdCloseDrilldownModal = function () {
  const modal = document.getElementById("report-drilldown-modal");
  if (modal) modal.style.display = "none";
};

/* ==========================================================================
   REPORT EXPORTS AUDIT LOGGING
   ========================================================================== */
window.ipdExportReport = function (format) {
  const state = window.state;
  const current = state.reportCatalog.find(r => r.report_id === window.selectedReportId);
  if (!current) return;

  const newLog = {
    log_id: "LOG" + Math.floor(Math.random() * 9000 + 1000),
    generated_by: `Sarah Jones (${window.reportsActiveRole})`,
    generated_at: new Date().toISOString(),
    report_name: current.name,
    filters_applied: "Date Range: 2026-06-01 to 2026-07-31",
    output_format: format,
  };

  state.reportAuditLogs.unshift(newLog);
  localStorage.setItem("saronil_report_audit_logs", JSON.stringify(state.reportAuditLogs));
  showNotification(`Report downloaded successfully as ${format}. Audit log saved.`, "success");
};

/* ==========================================================================
   REPORT SCHEDULER MODAL CONTROLLERS
   ========================================================================== */
window.ipdOpenScheduleModal = function (reportId) {
  const modal = document.getElementById("report-schedule-modal");
  const inputId = document.getElementById("sched-report-id");
  if (modal && inputId) {
    inputId.value = reportId;
    modal.style.display = "flex";
  }
};

window.ipdCloseScheduleModal = function () {
  const modal = document.getElementById("report-schedule-modal");
  if (modal) modal.style.display = "none";
};

window.ipdSubmitReportSchedule = function (e) {
  e.preventDefault();
  const id = document.getElementById("sched-report-id").value;
  const freqEl = document.getElementById("sched-frequency");
  const freq = freqEl ? [...freqEl.selectedOptions].map(o => o.value).join(", ") : "Monthly";
  const rec = document.getElementById("sched-recipients").value;

  const newSched = {
    schedule_id: "SCH" + Math.floor(Math.random() * 9000 + 1000),
    report_id: id,
    frequency: freq,
    recipients: rec,
    last_run: "—",
    next_run: new Date(Date.now() + 86400000).toISOString().split("T")[0],
  };

  window.state.reportSchedules.unshift(newSched);
  localStorage.setItem("saronil_report_schedules", JSON.stringify(window.state.reportSchedules));
  showNotification("Automated report distribution schedule created.", "success");
  window.ipdCloseScheduleModal();

  if (window.reportsActiveTab === "schedules") {
    window.views.reports(document.getElementById("main-content"));
  }
};

/* ==========================================================================
   TAB 2: CUSTOM REPORT BUILDER (SIMPLIFIED FOR NON-TECH USERS)
   ========================================================================== */
window.ipdRenderBuilderTab = function (container) {
  const state = window.state;
  // Fields mapping based on DPDP exposures
  const availableFields = state.fieldExposures.filter(f => f.module_name === window.customBuilderData.source);

  container.innerHTML = `
    <div class="grid grid-cols-1 md:grid-cols-5 gap-6 w-full">
      <!-- Wizard Left Pane -->
      <div class="col-span-1 md:col-span-2 card p-5 flex flex-col gap-5">
        <div>
          <h4 class="text-sm font-bold text-slate-700 flex items-center gap-1">🛠️ Create a Custom List / Report</h4>
          <p class="text-xs text-slate-500 mt-1">Need a custom cut of data? Follow the 4 simple steps below to build it instantly.</p>
        </div>

        <!-- STEP 1 -->
        <div class="flex flex-col gap-2">
          <div class="flex items-center gap-2">
            <span class="w-5 h-5 flex items-center justify-center bg-blue-100 text-blue-700 text-xs font-bold rounded-full">1</span>
            <label class="form-label mb-0 text-xs font-semibold">Select Data Category</label>
          </div>
          <select id="builder-source" class="form-select text-xs w-full" multiple style="height: 65px;" onchange="window.ipdUpdateBuilderSource(this)">
            <option value="billing" ${window.customBuilderData.source === 'billing' ? 'selected' : ''}>💳 Invoices &amp; Hospital Revenue</option>
            <option value="patients" ${window.customBuilderData.source === 'patients' ? 'selected' : ''}>👤 Patient Medical Records (EMR)</option>
            <option value="appointments" ${window.customBuilderData.source === 'appointments' ? 'selected' : ''}>📅 OPD Doctor Consultations</option>
          </select>
        </div>

        <!-- STEP 2 -->
        <div class="flex flex-col gap-2">
          <div class="flex items-center gap-2">
            <span class="w-5 h-5 flex items-center justify-center bg-blue-100 text-blue-700 text-xs font-bold rounded-full">2</span>
            <label class="form-label mb-0 text-xs font-semibold">Select Columns to Display</label>
          </div>
          <div class="flex flex-col gap-2 max-h-48 overflow-y-auto border border-slate-100 rounded-md p-3 bg-slate-50">
            ${availableFields.map(f => {
              const checked = window.customBuilderData.fields.includes(f.field_name) ? 'checked' : '';
              const disabled = !f.exposed ? 'disabled' : '';
              const friendlyLabel = friendlyFieldLabels[f.field_name] || f.field_name;
              return `
              <label class="flex items-center gap-2 text-xs cursor-pointer ${f.exposed ? 'text-slate-800' : 'text-slate-400'}">
                <input type="checkbox" value="${f.field_name}" ${checked} ${disabled} class="rounded border-slate-300 text-blue-600 focus:ring-blue-500" onchange="window.ipdToggleBuilderField(this.value, this.checked)">
                <span class="font-medium">${friendlyLabel}</span>
                ${f.sensitivity_level === 'High' ? `<span class="badge b-re text-[0.6rem] py-0 px-1 font-bold ml-auto">Confidential</span>` : ''}
                ${!f.exposed ? `<span class="text-[0.65rem] italic text-slate-400 ml-auto">(Hidden due to Privacy)</span>` : ''}
              </label>
              `;
            }).join('')}
          </div>
        </div>

        <!-- STEP 3 -->
        <div class="flex flex-col gap-2">
          <div class="flex items-center gap-2">
            <span class="w-5 h-5 flex items-center justify-center bg-blue-100 text-blue-700 text-xs font-bold rounded-full">3</span>
            <label class="form-label mb-0 text-xs font-semibold">Calculate Summary Totals (Optional)</label>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <select id="builder-agg-type" class="form-select text-xs" multiple style="height: 65px;" onchange="window.ipdUpdateBuilderAggType(this)">
              <option value="COUNT" ${window.customBuilderData.aggType === 'COUNT' ? 'selected' : ''}>🔢 Count Entries</option>
              <option value="SUM" ${window.customBuilderData.aggType === 'SUM' ? 'selected' : ''}>➕ Add Up Totals</option>
              <option value="AVG" ${window.customBuilderData.aggType === 'AVG' ? 'selected' : ''}>📊 Calculate Average</option>
            </select>
            <select id="builder-agg-field" class="form-select text-xs" multiple style="height: 80px;" onchange="window.ipdUpdateBuilderAggField(this)">
              <option value="">Of which column?</option>
              ${availableFields.filter(f => f.sensitivity_level !== 'High').map(f => `
              <option value="${f.field_name}" ${window.customBuilderData.aggField === f.field_name ? 'selected' : ''}>${friendlyFieldLabels[f.field_name] || f.field_name}</option>
              `).join('')}
            </select>
            <select id="builder-group-by" class="form-select text-xs" multiple style="height: 80px;" onchange="window.ipdUpdateBuilderGroupBy(this)">
              <option value="">Group rows by...</option>
              ${availableFields.map(f => `
              <option value="${f.field_name}" ${window.customBuilderData.groupBy === f.field_name ? 'selected' : ''}>${friendlyFieldLabels[f.field_name] || f.field_name}</option>
              `).join('')}
            </select>
          </div>
        </div>

        <!-- STEP 4 -->
        <div class="flex flex-col gap-2">
          <div class="flex items-center gap-2">
            <span class="w-5 h-5 flex items-center justify-center bg-blue-100 text-blue-700 text-xs font-bold rounded-full">4</span>
            <label class="form-label mb-0 text-xs font-semibold">Choose Layout / Graph style</label>
          </div>
          <select id="builder-viz" class="form-select text-xs w-full" multiple style="height: 65px;" onchange="window.ipdUpdateBuilderViz(this)">
            <option value="table" ${window.customBuilderData.vizType === 'table' ? 'selected' : ''}>📋 Standard Grid Table</option>
            <option value="kpi" ${window.customBuilderData.vizType === 'kpi' ? 'selected' : ''}>💳 Big Bold Single Number (KPI)</option>
            <option value="chart" ${window.customBuilderData.vizType === 'chart' ? 'selected' : ''}>📊 Visual Bar Chart</option>
          </select>
        </div>

        <div class="flex gap-2 justify-end mt-2">
          <button class="btn btn-outline btn-sm text-xs" onclick="window.ipdDownloadCustomReportCSV()">📥 Export to Excel</button>
          <button class="btn btn-primary btn-sm text-xs" onclick="window.ipdOpenSaveTemplateModal()">💾 Save Report Template</button>
        </div>
      </div>

      <!-- Right Pane: Live preview -->
      <div class="col-span-1 md:col-span-3 card p-5 flex flex-col gap-4">
        <h4 class="text-sm font-bold text-slate-700">🔬 Instant Preview</h4>
        <div id="builder-preview-box" class="border border-slate-100 bg-slate-50 rounded-md p-4 flex-1 flex flex-col justify-center items-center overflow-auto">
          <!-- Filled dynamically by builder engine -->
        </div>
      </div>
    </div>

    <!-- Save Template Modal -->
    <div id="save-template-modal" class="modal-backdrop">
      <div>
        <div class="modal-header">
          <h3 class="text-base font-bold m-0 flex justify-between items-center w-full">
            💾 Save Custom Template
            <button type="button" class="btn-close" onclick="window.ipdCloseSaveTemplateModal()">&times;</button>
          </h3>
        </div>
        <form onsubmit="window.ipdSubmitSaveTemplate(event)" class="mt-4 flex flex-col gap-4">
          <div class="form-group mb-0">
            <label class="form-label text-xs">Give your report a name</label>
            <input type="text" id="tpl-name" class="form-control text-xs" placeholder="e.g. Weekly Ward Admissions Summary" required>
          </div>
          <div class="form-group mb-0">
            <label class="form-label text-xs">Choose Catalog Folder</label>
            <select id="tpl-category" class="form-select text-xs" multiple style="height: 80px;" required>
              <option value="Financial/Revenue Cycle" selected>Financial/Revenue Cycle</option>
              <option value="Clinical Quality & Patient Safety">Clinical Quality & Patient Safety</option>
              <option value="Operational/Patient Flow">Operational/Patient Flow</option>
              <option value="Specialty-specific">Specialty-specific</option>
            </select>
          </div>
          <div class="modal-footer flex justify-end gap-2 mt-4 pt-3 border-t">
            <button type="button" class="btn btn-secondary text-xs" onclick="window.ipdCloseSaveTemplateModal()">Cancel</button>
            <button type="submit" class="btn btn-primary text-xs">Save & Publish</button>
          </div>
        </form>
      </div>
    </div>
  `;

  // Init field selections if empty
  if (window.customBuilderData.fields.length === 0 && availableFields.length > 0) {
    window.customBuilderData.fields = [availableFields[0].field_name];
  }

  // Update builder handlers
  window.ipdUpdateBuilderSource = function (selectEl) {
    const vals = [...selectEl.selectedOptions].map(o => o.value);
    window.customBuilderData.source = vals[0] || 'billing';
    window.customBuilderData.sources = vals;
    window.customBuilderData.fields = [];
    window.customBuilderData.groupBy = '';
    window.customBuilderData.aggField = '';
    window.ipdRenderBuilderTab(container);
  };

  window.ipdToggleBuilderField = function (fld, checked) {
    if (checked) {
      if (!window.customBuilderData.fields.includes(fld)) window.customBuilderData.fields.push(fld);
    } else {
      window.customBuilderData.fields = window.customBuilderData.fields.filter(x => x !== fld);
    }
    window.ipdRunBuilderQuery();
  };

  window.ipdUpdateBuilderAggType = function (selectEl) {
    const vals = [...selectEl.selectedOptions].map(o => o.value);
    window.customBuilderData.aggType = vals[0] || 'COUNT';
    window.customBuilderData.aggTypes = vals;
    window.ipdRunBuilderQuery();
  };

  window.ipdUpdateBuilderAggField = function (selectEl) {
    const vals = [...selectEl.selectedOptions].map(o => o.value);
    window.customBuilderData.aggField = vals[0] || '';
    window.customBuilderData.aggFields = vals;
    window.ipdRunBuilderQuery();
  };

  window.ipdUpdateBuilderGroupBy = function (selectEl) {
    const vals = [...selectEl.selectedOptions].map(o => o.value);
    window.customBuilderData.groupBy = vals[0] || '';
    window.customBuilderData.groupBys = vals;
    window.ipdRunBuilderQuery();
  };

  window.ipdUpdateBuilderViz = function (selectEl) {
    const vals = [...selectEl.selectedOptions].map(o => o.value);
    window.customBuilderData.vizType = vals[0] || 'table';
    window.customBuilderData.vizTypes = vals;
    window.ipdRunBuilderQuery();
  };

  // Transform filters to checkbox dropdowns
  window.ipdMakeCheckboxDropdown('builder-source');
  window.ipdMakeCheckboxDropdown('builder-agg-type');
  window.ipdMakeCheckboxDropdown('builder-agg-field');
  window.ipdMakeCheckboxDropdown('builder-group-by');
  window.ipdMakeCheckboxDropdown('builder-viz');
  window.ipdMakeCheckboxDropdown('tpl-category');

  // Run build preview query
  window.ipdRunBuilderQuery();
};

/* ==========================================================================
   CUSTOM REPORT BUILDER QUERY ENGINE
   ========================================================================= */
window.ipdRunBuilderQuery = function () {
  const box = document.getElementById("builder-preview-box");
  if (!box) return;
  const data = window.customBuilderData;
  const records = window.state[data.source] || [];

  if (records.length === 0) {
    box.innerHTML = `<div class="text-xs text-slate-400">No entries found.</div>`;
    return;
  }

  // Check if fields selected
  if (data.fields.length === 0) {
    box.innerHTML = `<div class="text-xs text-slate-400">Choose at least one column above to start.</div>`;
    return;
  }

  // Render Table visualization
  if (data.vizType === 'table') {
    box.innerHTML = `
      <table class="custom-table w-full">
        <thead>
          <tr>
            ${data.fields.map(f => `<th>${friendlyFieldLabels[f] || f}</th>`).join('')}
          </tr>
        </thead>
        <tbody>
          ${records.slice(0, 5).map(r => `
            <tr>
              ${data.fields.map(f => `<td>${r[f] !== undefined ? r[f] : '—'}</td>`).join('')}
            </tr>
          `).join('')}
        </tbody>
      </table>
      <div class="text-[0.7rem] text-slate-400 mt-3 text-right w-full pr-2">Showing first 5 rows (Total entries: ${records.length})</div>
    `;
  } else if (data.vizType === 'kpi') {
    // KPI display
    let kpiVal = records.length;
    let desc = "Count of entries";

    if (data.aggType === 'SUM' && data.aggField) {
      kpiVal = records.reduce((acc, r) => acc + (Number(r[data.aggField]) || 0), 0);
      kpiVal = `₹${kpiVal.toLocaleString()}`;
      desc = `Total sum of ${friendlyFieldLabels[data.aggField] || data.aggField}`;
    } else if (data.aggType === 'AVG' && data.aggField) {
      const sum = records.reduce((acc, r) => acc + (Number(r[data.aggField]) || 0), 0);
      kpiVal = records.length > 0 ? Math.round(sum / records.length) : 0;
      kpiVal = `₹${kpiVal.toLocaleString()}`;
      desc = `Average of ${friendlyFieldLabels[data.aggField] || data.aggField}`;
    }

    box.innerHTML = `
      <div class="flex flex-col items-center justify-center gap-1 text-center py-6">
        <span class="text-xs font-bold text-slate-400 uppercase tracking-wider">${desc}</span>
        <h2 class="text-3xl font-extrabold text-slate-800 mt-2">${kpiVal}</h2>
        <span class="text-[0.65rem] text-slate-400 mt-2 block">Compiled from all ${records.length} records</span>
      </div>
    `;
  } else if (data.vizType === 'chart') {
    // Basic SVG Chart
    box.innerHTML = `
      <div class="text-xs font-semibold text-slate-500 mb-2 w-full text-left">Visual Distribution</div>
      <div class="flex flex-col gap-3 w-full max-w-md my-4">
        <div class="flex items-center gap-2">
          <div class="w-24 text-right text-xs truncate font-medium text-slate-600">High</div>
          <div class="flex-1 bg-red-100 rounded-full h-3">
            <div class="bg-red-500 rounded-full h-3 w-3/4"></div>
          </div>
          <span class="text-xs font-semibold w-10 text-slate-500">75%</span>
        </div>
        <div class="flex items-center gap-2">
          <div class="w-24 text-right text-xs truncate font-medium text-slate-600">Medium</div>
          <div class="flex-1 bg-amber-100 rounded-full h-3">
            <div class="bg-amber-500 rounded-full h-3 w-1/2"></div>
          </div>
          <span class="text-xs font-semibold w-10 text-slate-500">50%</span>
        </div>
        <div class="flex items-center gap-2">
          <div class="w-24 text-right text-xs truncate font-medium text-slate-600">Low</div>
          <div class="flex-1 bg-emerald-100 rounded-full h-3">
            <div class="bg-emerald-500 rounded-full h-3 w-1/4"></div>
          </div>
          <span class="text-xs font-semibold w-10 text-slate-500">25%</span>
        </div>
      </div>
    `;
  }
};

/* ==========================================================================
   SAVE TEMPLATE MODALS
   ========================================================================== */
window.ipdOpenSaveTemplateModal = function () {
  const modal = document.getElementById("save-template-modal");
  if (modal) modal.style.display = "flex";
};

window.ipdCloseSaveTemplateModal = function () {
  const modal = document.getElementById("save-template-modal");
  if (modal) modal.style.display = "none";
};

window.ipdSubmitSaveTemplate = function (e) {
  e.preventDefault();
  const name = document.getElementById("tpl-name").value;
  const catEl = document.getElementById("tpl-category");
  const cat = catEl ? [...catEl.selectedOptions].map(o => o.value)[0] || 'Financial/Revenue Cycle' : 'Financial/Revenue Cycle';

  const newTpl = {
    template_id: "TMP" + Math.floor(Math.random() * 9000 + 1000),
    name,
    created_by: `Sarah Jones (${window.reportsActiveRole})`,
    data_source: window.customBuilderData.source,
    selected_fields: window.customBuilderData.fields,
    filter_logic: "none",
    aggregation_type: window.customBuilderData.aggType,
    aggregation_field: window.customBuilderData.aggField,
    group_by_field: window.customBuilderData.groupBy,
    visualization_type: window.customBuilderData.vizType,
    saved_to_catalog: true,
    category: cat,
  };

  // Add back to templates list and to catalog
  window.state.customReportTemplates.unshift(newTpl);
  localStorage.setItem('saronil_custom_templates', JSON.stringify(window.state.customReportTemplates));

  // Promotes template directly back to custom reports catalog
  window.state.reportCatalog.push({
    report_id: newTpl.template_id,
    name: newTpl.name,
    category: newTpl.category,
    source_module: newTpl.data_source,
    default_filters: "date_range",
    output_formats: ["CSV"],
    frequency_type: "on-demand",
    is_statutory: false
  });
  localStorage.setItem('saronil_report_catalog', JSON.stringify(window.state.reportCatalog));

  showNotification("Custom report saved and promoted to predefined catalog list successfully.", "success");
  window.ipdCloseSaveTemplateModal();
  window.views.reports(document.getElementById('main-content'));
};

window.ipdDownloadCustomReportCSV = function () {
  showNotification("CSV Excel file download initiated.", "success");
};

/* ==========================================================================
   TAB 3: SCHEDULES & REPORT HISTORY
   ========================================================================== */
window.ipdRenderSchedulesTab = function (container) {
  const state = window.state;
  container.innerHTML = `
    <div class="flex flex-col gap-6 w-full">
      <!-- Active schedules -->
      <div class="card">
        <div class="card-header">
          <h3 class="card-title text-sm font-bold">📅 Active Auto-Email Distributions</h3>
        </div>
        <div class="card-body">
          <table class="custom-table">
            <thead>
              <tr>
                <th>Schedule ID</th>
                <th>Report Title</th>
                <th>Sending Schedule</th>
                <th>Email Recipients</th>
                <th>Last Sent</th>
                <th>Next Run</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              ${state.reportSchedules.map(s => {
                const rep = state.reportCatalog.find(r => r.report_id === s.report_id);
                return `
                  <tr>
                    <td class="mono font-semibold">${s.schedule_id}</td>
                    <td><strong>${rep ? rep.name : 'Unknown Report'}</strong></td>
                    <td><span class="badge b-bl">${s.frequency}</span></td>
                    <td><code>${s.recipients}</code></td>
                    <td class="mono">${s.last_run}</td>
                    <td class="mono">${s.next_run}</td>
                    <td>
                      <button class="btn btn-outline btn-sm text-xs" onclick="window.ipdTriggerScheduleRun('${s.schedule_id}')" ${window.reportsActiveRole === 'Auditor' ? 'disabled' : ''}>Run &amp; Send Now</button>
                    </td>
                  </tr>
                `;
              }).join("")}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Historical Archive -->
      <div class="card">
        <div class="card-header">
          <h3 class="card-title text-sm font-bold">🗂️ Pre-Compiled Past Report Archive</h3>
          <p class="card-subtitle text-xs">Historical logs of completed runs, saved as immutable file snapshots</p>
        </div>
        <div class="card-body">
          <table class="custom-table">
            <thead>
              <tr>
                <th>Archive ID</th>
                <th>Report Name</th>
                <th>Filters Applied</th>
                <th>Compiled By</th>
                <th>Compiled At</th>
                <th>Records Count</th>
                <th>File Format</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              ${state.reportArchive.map(a => `
                <tr>
                  <td class="mono font-semibold">${a.archive_id}</td>
                  <td><strong>${a.name}</strong></td>
                  <td><span class="text-xs text-slate-500">${a.filters_applied}</span></td>
                  <td>${a.generated_by}</td>
                  <td class="mono text-xs">${a.generated_at.split('T')[0]}</td>
                  <td>${a.record_count} entries</td>
                  <td><span class="badge b-gr">${a.output_format}</span></td>
                  <td>
                    <button class="btn btn-outline btn-sm text-xs" onclick="window.ipdDownloadArchiveFile('${a.archive_id}')">Download File</button>
                  </td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;

  window.ipdTriggerScheduleRun = function (schedId) {
    const sched = window.state.reportSchedules.find(s => s.schedule_id === schedId);
    if (sched) {
      sched.last_run = new Date().toISOString().split("T")[0];
      localStorage.setItem("saronil_report_schedules", JSON.stringify(window.state.reportSchedules));
      showNotification(`Schedule triggered. Emailed output to ${sched.recipients}.`, "success");
      window.ipdRenderSchedulesTab(container);
    }
  };

  window.ipdDownloadArchiveFile = function (archId) {
    showNotification(`Downloading archived snapshot file #${archId}.`, "success");
  };
};

/* ==========================================================================
   TAB 4: GOVERNANCE & DPDP SETTINGS
   ========================================================================== */
window.ipdRenderGovernanceTab = function (container) {
  const state = window.state;
  container.innerHTML = `
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
      <!-- DPDP Exposure Matrix Left -->
      <div class="card">
        <div class="card-header flex justify-between items-center">
          <div>
            <h3 class="card-title text-sm font-bold">🛡️ Patient Privacy Columns Exclusions</h3>
            <p class="card-subtitle text-xs">Manage which patient data columns are allowed in custom builder searches (DPDP Act Compliance)</p>
          </div>
          <button class="btn btn-primary btn-sm text-xs" onclick="window.ipdResetDPDPExposurePolicy()">Reset to Default</button>
        </div>
        <div class="card-body">
          <table class="custom-table">
            <thead>
              <tr>
                <th>Category / Module</th>
                <th>Column Name</th>
                <th>Sensitivity Level</th>
                <th>Exposed to Custom Queries</th>
              </tr>
            </thead>
            <tbody>
              ${state.fieldExposures.map((f, idx) => `
                <tr>
                  <td class="mono text-xs font-semibold">${f.module_name.toUpperCase()}</td>
                  <td class="mono text-xs">${friendlyFieldLabels[f.field_name] || f.field_name}</td>
                  <td>
                    <span class="badge ${f.sensitivity_level === 'High' ? 'b-re' : f.sensitivity_level === 'Medium' ? 'b-am' : 'b-sl'} text-[0.65rem]">
                      ${f.sensitivity_level}
                    </span>
                  </td>
                  <td>
                    <div class="form-check form-switch flex items-center">
                      <input class="form-check-input cursor-pointer" type="checkbox" ${f.exposed ? 'checked' : ''} onchange="window.ipdToggleDPDPExposure(${idx}, this.checked)">
                    </div>
                  </td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Reports Export Audit Logs Right -->
      <div class="card">
        <div class="card-header">
          <h3 class="card-title text-sm font-bold">⚖️ Query &amp; Export Audit Log History</h3>
          <p class="card-subtitle text-xs">Security audit trail tracking who compiled or exported records</p>
        </div>
        <div class="card-body">
          <table class="custom-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>User Access</th>
                <th>Report Run</th>
                <th>Format</th>
              </tr>
            </thead>
            <tbody>
              ${state.reportAuditLogs.map(l => `
                <tr>
                  <td class="mono text-xs">${l.generated_at.split('T')[0]}</td>
                  <td><strong>${l.generated_by}</strong></td>
                  <td>${l.report_name}</td>
                  <td><span class="badge b-bl text-[0.65rem]">${l.output_format}</span></td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;

  window.ipdToggleDPDPExposure = function (idx, checked) {
    window.state.fieldExposures[idx].exposed = checked;
    localStorage.setItem("saronil_field_exposures", JSON.stringify(window.state.fieldExposures));
    showNotification(`DPDP Field Exposure Policy updated for ${window.state.fieldExposures[idx].field_name}.`, "info");
  };

  window.ipdResetDPDPExposurePolicy = function () {
    localStorage.removeItem("saronil_field_exposures");
    window.state.fieldExposures = null;
    window.seedState();
    showNotification("DPDP exposure default configurations reset.", "info");
    window.views.reports(document.getElementById("main-content"));
  };
};
