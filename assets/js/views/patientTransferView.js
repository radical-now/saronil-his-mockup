/* ==========================================================================
   SARONIL HMS - COMPACT PATIENT TRANSFER POPUP (patientTransferView.js)
   ========================================================================== */

// Ward and room mapping for bed allocations
const roomMapping = {
  "GENERAL-WARD-M": {
    "Room 401 (Male)": ["GW(M)-409", "GW(M)-410"],
    "Room 402 (Male)": ["GW(M)-411", "GW(M)-412", "GW(M)-413"]
  },
  "GENERAL-WARD-F": {
    "Room 403 (Female)": ["GW(F)-414", "GW(F)-415"],
    "Room 404 (Female)": ["GW(F)-416", "GW(F)-417", "GW(F)-418"]
  },
  "SEMI-PRIVATE": {
    "Room 301": ["SP-301", "SP-302"],
    "Room 302": ["SP-303", "SP-304", "SP-305"]
  },
  "PRIVATE": {
    "Room 201": ["PVT-201"],
    "Room 202": ["PVT-202"],
    "Room 203": ["PVT-203"],
    "Room 204": ["PVT-204"],
    "Room 205": ["PVT-205"]
  },
  "DELUXE": {
    "Suite 401": ["DELUXE-401"],
    "Suite 402": ["DELUXE-402"],
    "Suite 403": ["DELUXE-403"],
    "Suite 404": ["DELUXE-404"]
  },
  "CCU": {
    "CCU Bay A": ["CCU-BED-01", "CCU-BED-02"],
    "CCU Bay B": ["CCU-BED-03", "CCU-BED-04", "CCU-BED-05"]
  },
  "ICCU": {
    "ICCU Bay A": ["ICCU-BED-01", "ICCU-BED-02"],
    "ICCU Bay B": ["ICCU-BED-03", "ICCU-BED-04"]
  },
  "EMERGENCY": {
    "ER Bay 1": ["EMG-01", "EMG-02", "EMG-03"],
    "ER Bay 2": ["EMG-04", "EMG-05"]
  }
};

// Helper function to resolve room name for a specific bed
function getRoomForBed(bedId) {
  for (const [wardKey, rooms] of Object.entries(roomMapping)) {
    for (const [roomName, beds] of Object.entries(rooms)) {
      if (beds.includes(bedId)) {
        return roomName;
      }
    }
  }
  return "Room " + (bedId.split('-')[1] || 'N/A');
}

// Global Modal Opener
window.openCompactTransferModal = function(patientUhid = '') {
  // Ensure modal container exists in DOM
  let modal = document.getElementById('compact-transfer-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'compact-transfer-modal';
    modal.className = 'modal';
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.width = '100%';
    modal.style.height = '100%';
    modal.style.backgroundColor = 'rgba(12, 10, 9, 0.6)';
    modal.style.backdropFilter = 'blur(4px)';
    modal.style.zIndex = '9999';
    modal.style.alignItems = 'center';
    modal.style.justifyContent = 'center';
    modal.style.display = 'none';

    modal.innerHTML = `
      
      <div class="compact-transfer-card" id="compact-transfer-card">
        <!-- Renders step screens -->
      </div>
    `;
    document.body.appendChild(modal);
  }

  modal.style.display = 'flex';

  // Initialize variables
  window.selectedTransferPatient = null;
  window.selectedTransferAdmission = null;
  window.compactTransferFormData = {};

  if (patientUhid) {
    const patient = state.patients.find(p => p.uhid === patientUhid);
    const admission = state.admissions.find(a => a.uhid === patientUhid && a.status === 'Active');
    if (patient && admission) {
      window.selectedTransferPatient = patient;
      window.selectedTransferAdmission = admission;
      window.renderCompactTransferForm();
    } else {
      alert("No active admission record found for this patient.");
      window.closeCompactTransferModal();
    }
  } else {
    // Render patient search screen inside modal if none provided
    window.renderCompactTransferSearch();
  }
};

window.closeCompactTransferModal = function() {
  const modal = document.getElementById('compact-transfer-modal');
  if (modal) {
    modal.style.display = 'none';
  }

  // Refresh parent view in real time
  if (window.router && window.router.currentPage === 'atd') {
    const container = document.getElementById('main-content');
    if (container && typeof renderBedBoard === 'function') {
      renderBedBoard(container);
    }
  } else if (window.router && window.router.currentPage === 'patients' && window.selectedTransferPatient) {
    const container = document.getElementById('main-content');
    if (container && typeof renderPatient360Profile === 'function') {
      renderPatient360Profile(container, window.selectedTransferPatient, 'admission');
    }
  }
};

// Wizard Screen: Patient Search (fallback if modal opened without patient)
window.renderCompactTransferSearch = function() {
  const card = document.getElementById('compact-transfer-card');
  if (!card) return;

  card.innerHTML = `
    <div class="modal-header" style="border-bottom: 1px solid var(--border-color); padding: 0.85rem 1.25rem; display: flex; justify-content: space-between; align-items: center; background-color: var(--primary-glow);">
      <h4 style="margin: 0; font-weight: 700; color: var(--primary); display: flex; align-items: center; gap: 0.5rem;">🔍 Select Patient to Transfer</h4>
      <span class="modal-close" style="cursor: pointer; font-size: 1.5rem;" onclick="window.closeCompactTransferModal()">&times;</span>
    </div>
    <div class="modal-body" style="padding: 1.5rem 1.25rem 3rem 1.25rem; min-height: 450px;">
      <div class="form-group" style="position: relative; margin-bottom: 0;">
        <label class="form-label" style="font-weight: 600; font-size: 0.85rem; margin-bottom: 0.5rem; display: block;">Search Patient (Name, UHID, or Mobile)</label>
        <div style="position: relative; display: flex; gap: 0.5rem; align-items: center; width: 100%;">
          <div style="position: relative; flex-grow: 1;">
            <span style="position: absolute; left: 10px; top: 50%; transform: translateY(-50%); font-size: 0.8rem; color: var(--text-muted);">🔎</span>
            <input type="text" id="compact-search-input" class="form-control" placeholder="Search patients globally..." style="padding-left: 2.2rem; height: 38px; font-size: 0.85rem; width: 100%; border-radius: var(--radius-sm);" autocomplete="off">
          </div>
          <button class="btn btn-primary" onclick="window.triggerCompactSearch()" style="height: 38px; padding: 0 1rem; font-size: 0.85rem; font-weight: 600; cursor: pointer;">Search</button>
          <div id="compact-search-autocomplete" style="display: none; position: absolute; top: 100%; left: 0; right: 0; z-index: 10000; background-color: var(--bg-surface); border: 1px solid var(--border-color); border-radius: var(--radius-sm); box-shadow: var(--shadow-lg); max-height: 250px; overflow-y: auto; margin-top: 4px;"></div>
        </div>
      </div>
    </div>
  `;

  // Bind the suggestive search event listeners
  initCompactTransferSearch();
};

function initCompactTransferSearch() {
  const searchInput = document.getElementById('compact-search-input');
  const resultsDiv = document.getElementById('compact-search-autocomplete');
  if (!searchInput || !resultsDiv) return;

  const performSearch = () => {
    const q = searchInput.value.toLowerCase().trim();
    if (!q) {
      resultsDiv.style.display = 'none';
      resultsDiv.innerHTML = '';
      return;
    }

    const matches = state.patients.filter(p => 
      p.name.toLowerCase().includes(q) ||
      p.uhid.toLowerCase().includes(q) ||
      p.mobile.includes(q) ||
      (p.abhaId && p.abhaId.toLowerCase().includes(q))
    ).slice(0, 10);

    if (matches.length === 0) {
      resultsDiv.innerHTML = `
        <div style="padding: 0.75rem 1rem; color: var(--text-muted); font-size: 0.85rem; font-style: italic;">
          No matching patients found.
        </div>
      `;
    } else {
      resultsDiv.innerHTML = matches.map(p => `
        <div class="dashboard-search-item" onclick="window.selectCompactSearchPatient('${p.uhid}')" style="padding: 0.75rem 1rem; border-bottom: 1px solid var(--border-color); cursor: pointer; display: flex; justify-content: space-between; align-items: center; transition: background-color 0.2s ease;">
          <div>
            <strong style="color: var(--text-primary); font-size: 0.88rem;">${p.name}</strong>
            <div style="font-size: 0.75rem; color: var(--text-secondary); margin-top: 0.15rem;">
              UHID: <span style="font-family: monospace;">${p.uhid}</span> | Mobile: ${p.mobile}
            </div>
          </div>
          <span class="badge ${p.status === 'Admitted' ? 'badge-success' : p.type === 'IPD' ? 'badge-purple' : p.type === 'Emergency' ? 'badge-danger' : 'badge-primary'}" style="font-size: 0.68rem; text-transform: uppercase;">
            ${p.status === 'Admitted' ? 'Admitted' : p.type}
          </span>
        </div>
      `).join('');
    }
    resultsDiv.style.display = 'block';
  };

  searchInput.addEventListener('input', performSearch);
  searchInput.addEventListener('focus', performSearch);
  
  // Listen for enter key
  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const q = searchInput.value.toLowerCase().trim();
      const firstMatch = state.patients.find(p => 
        p.name.toLowerCase().includes(q) ||
        p.uhid.toLowerCase().includes(q) ||
        p.mobile.includes(q) ||
        (p.abhaId && p.abhaId.toLowerCase().includes(q))
      );
      if (firstMatch) {
        window.selectCompactSearchPatient(firstMatch.uhid);
      }
    }
  });

  // Hide on click outside
  if (!window.compactSearchListenerBound) {
    document.addEventListener('click', (e) => {
      const input = document.getElementById('compact-search-input');
      const results = document.getElementById('compact-search-autocomplete');
      if (input && results && !e.target.closest('#compact-search-input') && !e.target.closest('#compact-search-autocomplete')) {
        results.style.display = 'none';
      }
    });
    window.compactSearchListenerBound = true;
  }
}

window.triggerCompactSearch = function() {
  const searchInput = document.getElementById('compact-search-input');
  if (searchInput) {
    const q = searchInput.value.toLowerCase().trim();
    const firstMatch = state.patients.find(p => 
      p.name.toLowerCase().includes(q) ||
      p.uhid.toLowerCase().includes(q) ||
      p.mobile.includes(q) ||
      (p.abhaId && p.abhaId.toLowerCase().includes(q))
    );
    if (firstMatch) {
      window.selectCompactSearchPatient(firstMatch.uhid);
    } else {
      alert("No matching patient found.");
    }
  }
};

window.selectCompactSearchPatient = function(uhid) {
  const patient = state.patients.find(p => p.uhid === uhid);
  if (!patient) return;
  
  const admission = state.admissions.find(a => a.uhid === uhid && a.status === 'Active');
  if (!admission) {
    alert(`Patient ${patient.name} (${patient.uhid}) is not currently admitted. Only admitted patients can be transferred.`);
    return;
  }

  window.selectedTransferPatient = patient;
  window.selectedTransferAdmission = admission;
  window.renderCompactTransferForm();
};

// Wizard Screen 1: Compact Details Form
window.renderCompactTransferForm = function() {
  const card = document.getElementById('compact-transfer-card');
  if (!card) return;

  const patient = window.selectedTransferPatient;
  const admission = window.selectedTransferAdmission;
  const wardDetails = state.wards[admission.ward] || { name: admission.ward, price: 0 };
  const roomName = getRoomForBed(admission.bed);

  // Restore form data if user went back from review
  const fd = window.compactTransferFormData || {};
  const reason = fd.reason || '';
  const requestedBy = fd.requestedBy || patient.primaryConsultant;
  const approvedBy = fd.approvedBy || '';
  const notes = fd.notes || '';
  
  // Format initial effective date/time
  let datetime = fd.datetime || '';
  if (!datetime) {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    datetime = `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  card.innerHTML = `
    <div class="modal-header" style="border-bottom: 1px solid var(--border-color); padding: 0.85rem 1.25rem; display: flex; justify-content: space-between; align-items: center; background-color: var(--primary-glow);">
      <h4 style="margin: 0; font-weight: 700; color: var(--primary); display: flex; align-items: center; gap: 0.5rem;">🔄 Transfer Patient: ${patient.name}</h4>
      <span class="modal-close" style="cursor: pointer; font-size: 1.5rem;" onclick="window.closeCompactTransferModal()">&times;</span>
    </div>
    <div class="modal-body" style="padding: 1.25rem;">
      
      <!-- Current Admission read-only details -->
      <div style="background-color: var(--bg-surface-elevated); padding: 0.65rem 0.85rem; border-radius: 6px; border: 1px solid var(--border-color); font-size: 0.78rem; margin-bottom: 1rem; display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.25rem 1rem;">
        <div>Patient: <strong style="color: var(--text-primary);">${patient.name}</strong> (${patient.age} / ${patient.gender})</div>
        <div>UHID / MRN: <strong>${patient.uhid}</strong></div>
        <div>Admission ID: <strong>${admission.id || 'N/A'}</strong></div>
        <div>Admitted Date: <strong>${admission.date} 10:00 AM</strong></div>
        <div>Current Location: <strong style="color: var(--color-purple);">${wardDetails.name} - Bed ${admission.bed}</strong></div>
        <div>Room & Category: <strong>${roomName} (${wardDetails.name})</strong></div>
        <div>Treating Doctor: <strong>${admission.doctorName}</strong></div>
        <div>Department: <strong>${patient.department || 'General Medicine'}</strong></div>
        <div style="grid-column: span 2;">Nursing Station: <strong>${wardDetails.name} Nursing Desk</strong></div>
      </div>

      <!-- Destination selection -->
      <div style="border: 1px solid var(--border-color); padding: 0.75rem; border-radius: 8px; background-color: var(--bg-base); margin-bottom: 1rem;">
        <div style="font-size: 0.82rem; font-weight: bold; margin-bottom: 0.5rem; color: var(--primary);">📍 Destination Location (Transfer To)</div>
        <div class="grid-3" style="gap: 0.5rem; margin-bottom: 0.5rem;">
          <div class="form-group" style="margin: 0;">
            <label class="form-label" style="font-size: 0.72rem; font-weight: bold; margin-bottom: 0.15rem;">New Ward *</label>
            <select id="transfer-new-ward" class="form-select" style="font-size: 0.78rem; padding: 3px 6px;" onchange="window.onCompactWardChange(this.value)">
              <option value="">-- Choose Ward --</option>
              ${Object.entries(state.wards).map(([key, info]) => {
                const isSelected = fd.wardKey === key ? 'selected' : '';
                return `<option value="${key}" ${isSelected}>${info.name}</option>`;
              }).join('')}
            </select>
          </div>
          
          <div class="form-group" style="margin: 0;">
            <label class="form-label" style="font-size: 0.72rem; font-weight: bold; margin-bottom: 0.15rem;">New Room *</label>
            <select id="transfer-new-room" class="form-select" style="font-size: 0.78rem; padding: 3px 6px;" disabled onchange="window.onCompactRoomChange(this.value)">
              <option value="">-- Ward First --</option>
            </select>
          </div>

          <div class="form-group" style="margin: 0;">
            <label class="form-label" style="font-size: 0.72rem; font-weight: bold; margin-bottom: 0.15rem;">New Bed *</label>
            <select id="transfer-new-bed" class="form-select" style="font-size: 0.78rem; padding: 3px 6px;" disabled onchange="window.onCompactBedChange(this.value)">
              <option value="">-- Room First --</option>
            </select>
          </div>
        </div>

        <!-- live Bed map -->
        <div id="transfer-bed-map-container" style="display: none; margin-top: 0.5rem;">
          <div style="display:flex; justify-content:space-between; align-items:center; font-size: 0.7rem; color: var(--text-muted); margin-bottom: 0.25rem;">
            <span>Real-time Bed Board: Click green bed to select.</span>
            <span id="transfer-dest-tariff-display" style="font-weight: bold; color: var(--color-success);"></span>
          </div>
          <div class="bed-grid-map" id="transfer-bed-grid-map"></div>
        </div>
      </div>

      <!-- Transfer metadata form -->
      <div class="grid-2" style="gap: 0.75rem; margin-bottom: 0.5rem;">
        <div class="form-group" style="margin: 0;">
          <label class="form-label" style="font-size: 0.72rem; font-weight: bold; margin-bottom: 0.15rem;">Reason for Transfer *</label>
          <select id="transfer-reason" class="form-select" style="font-size: 0.78rem; padding: 3px 6px;" onchange="window.validateCompactTransferForm()">
            <option value="">-- Choose Reason --</option>
            <option value="Clinical Requirement" ${reason === 'Clinical Requirement' ? 'selected' : ''}>Clinical Requirement</option>
            <option value="Higher Level of Care" ${reason === 'Higher Level of Care' ? 'selected' : ''}>Higher Level of Care</option>
            <option value="Isolation Requirement" ${reason === 'Isolation Requirement' ? 'selected' : ''}>Isolation Requirement</option>
            <option value="Bed Optimization" ${reason === 'Bed Optimization' ? 'selected' : ''}>Bed Optimization</option>
            <option value="Patient Request" ${reason === 'Patient Request' ? 'selected' : ''}>Patient Request</option>
            <option value="Doctor Request" ${reason === 'Doctor Request' ? 'selected' : ''}>Doctor Request</option>
            <option value="Department Transfer" ${reason === 'Department Transfer' ? 'selected' : ''}>Department Transfer</option>
          </select>
        </div>

        <div class="form-group" style="margin: 0;">
          <label class="form-label" style="font-size: 0.72rem; font-weight: bold; margin-bottom: 0.15rem;">Effective Date & Time *</label>
          <input type="datetime-local" id="transfer-datetime" class="form-control" style="font-size: 0.78rem; padding: 3px 6px;" value="${datetime}" onchange="window.validateCompactTransferForm()">
        </div>
      </div>

      <div class="grid-2" style="gap: 0.75rem; margin-bottom: 0.5rem;">
        <div class="form-group" style="margin: 0;">
          <label class="form-label" style="font-size: 0.72rem; font-weight: bold; margin-bottom: 0.15rem;">Requested By *</label>
          <select id="transfer-requested-by" class="form-select" style="font-size: 0.78rem; padding: 3px 6px;" onchange="window.validateCompactTransferForm()">
            ${state.doctors.map(d => `<option value="${d.name}" ${d.name === requestedBy ? 'selected' : ''}>${d.name} (${d.spec})</option>`).join('')}
          </select>
        </div>

        <div class="form-group" style="margin: 0;">
          <label class="form-label" style="font-size: 0.72rem; font-weight: bold; margin-bottom: 0.15rem;">Approved By (Optional)</label>
          <input type="text" id="transfer-approved-by" class="form-control" style="font-size: 0.78rem; padding: 3px 6px;" placeholder="Coordinator name" value="${approvedBy}">
        </div>
      </div>

      <div class="form-group" style="margin-bottom: 1rem;">
        <label class="form-label" style="font-size: 0.72rem; font-weight: bold; margin-bottom: 0.15rem;">Transfer / Handoff Notes</label>
        <textarea id="transfer-notes" class="form-control" rows="2" style="font-size: 0.78rem; padding: 3px 6px;" placeholder="Transport precautions, oxygen requirement, clinic status...">${notes}</textarea>
      </div>

      <!-- Actions -->
      <div style="display: flex; gap: 0.75rem; justify-content: flex-end; border-top: 1px solid var(--border-color); padding-top: 0.85rem;">
        <button class="btn btn-secondary" style="padding: 0.35rem 1.25rem; font-size: 0.82rem;" onclick="window.closeCompactTransferModal()">Cancel</button>
        <button id="transfer-proceed-btn" class="btn btn-primary" style="padding: 0.35rem 1.75rem; font-size: 0.82rem; font-weight: bold;" disabled onclick="window.proceedToTransferReview()">Review Transfer ➡️</button>
      </div>

    </div>
  `;

  // Cascade restore values if edit mode
  if (fd.wardKey) {
    window.onCompactWardChange(fd.wardKey);
    if (fd.roomName) {
      document.getElementById('transfer-new-room').value = fd.roomName;
      window.onCompactRoomChange(fd.roomName);
      if (fd.bedId) {
        document.getElementById('transfer-new-bed').value = fd.bedId;
        window.onCompactBedChange(fd.bedId);
      }
    }
  }
};

window.onCompactWardChange = function(wardKey) {
  const roomSelect = document.getElementById('transfer-new-room');
  const bedSelect = document.getElementById('transfer-new-bed');
  const mapContainer = document.getElementById('transfer-bed-map-container');

  if (!wardKey) {
    roomSelect.innerHTML = '<option value="">-- Ward First --</option>';
    roomSelect.disabled = true;
    bedSelect.innerHTML = '<option value="">-- Room First --</option>';
    bedSelect.disabled = true;
    mapContainer.style.display = 'none';
    window.validateCompactTransferForm();
    return;
  }

  const rooms = roomMapping[wardKey] || {};
  const roomNames = Object.keys(rooms);

  if (roomNames.length === 0) {
    roomSelect.innerHTML = '<option value="">No rooms configured</option>';
    roomSelect.disabled = true;
  } else {
    roomSelect.innerHTML = '<option value="">-- Choose Room --</option>' + 
      roomNames.map(r => `<option value="${r}">${r}</option>`).join('');
    roomSelect.disabled = false;
  }

  bedSelect.innerHTML = '<option value="">-- Room First --</option>';
  bedSelect.disabled = true;
  mapContainer.style.display = 'none';
  window.validateCompactTransferForm();
};

window.onCompactRoomChange = function(roomName) {
  const wardKey = document.getElementById('transfer-new-ward').value;
  const bedSelect = document.getElementById('transfer-new-bed');
  const mapContainer = document.getElementById('transfer-bed-map-container');
  
  if (!roomName) {
    bedSelect.innerHTML = '<option value="">-- Room First --</option>';
    bedSelect.disabled = true;
    mapContainer.style.display = 'none';
    window.validateCompactTransferForm();
    return;
  }

  const beds = roomMapping[wardKey]?.[roomName] || [];
  
  // Available beds filter
  const selectableBeds = beds.filter(bedId => {
    const detail = state.bedsStatus[bedId];
    return detail && (detail.status === 'Available' || detail.status === 'Vacant' || (detail.status === 'Reserved' && detail.patientUhid === window.selectedTransferPatient.uhid));
  });

  if (beds.length === 0) {
    bedSelect.innerHTML = '<option value="">No beds configured</option>';
    bedSelect.disabled = true;
  } else {
    bedSelect.innerHTML = '<option value="">-- Choose Bed --</option>' + 
      beds.map(b => {
        const detail = state.bedsStatus[b];
        const statusText = detail ? detail.status : 'Unknown';
        const isSelectable = selectableBeds.includes(b);
        const disabledAttr = isSelectable ? '' : 'disabled';
        const labelExtra = isSelectable ? '' : ` (${statusText})`;
        return `<option value="${b}" ${disabledAttr}>${b}${labelExtra}</option>`;
      }).join('');
    bedSelect.disabled = false;
  }

  renderCompactBedGridMap(roomName, beds);
  mapContainer.style.display = 'block';

  // Display room tariff
  const wardPrice = state.wards[wardKey]?.price || 0;
  document.getElementById('transfer-dest-tariff-display').innerText = `Rate: ₹${wardPrice.toLocaleString('en-IN')}/day`;
  window.validateCompactTransferForm();
};

function renderCompactBedGridMap(roomName, beds) {
  const mapDiv = document.getElementById('transfer-bed-grid-map');
  if (!mapDiv) return;

  if (beds.length === 0) {
    mapDiv.innerHTML = `<div style="text-align:center; font-size:0.75rem; color:var(--text-muted);">No beds.</div>`;
    return;
  }

  mapDiv.innerHTML = beds.map(bedId => {
    const detail = state.bedsStatus[bedId] || { status: 'Available' };
    let statusClass = 'available';
    let statusLabel = 'Available';

    if (detail.status === 'Occupied') {
      statusClass = 'occupied';
      statusLabel = 'Occupied';
    } else if (detail.status === 'Vacated - Pending Housekeeping' || detail.status === 'Housekeeping In Progress') {
      statusClass = 'housekeeping';
      statusLabel = 'Cleaning';
    } else if (detail.status === 'Out of Service / Blocked' || detail.status === 'Blocked' || detail.status === 'Maintenance Required') {
      statusClass = 'blocked';
      statusLabel = 'Blocked';
    } else if (detail.status === 'Reserved') {
      statusClass = 'reserved';
      statusLabel = 'Reserved';
    } else if (detail.status === 'Isolation Cleaning Required') {
      statusClass = 'blocked';
      statusLabel = 'Iso Cleaning';
    }

    const onclickText = (statusClass === 'available') 
      ? `onclick="window.selectBedFromCompactMap('${bedId}')"` 
      : `style="cursor: not-allowed;" title="Bed is ${detail.status} and cannot be assigned."`;

    return `
      <div id="bed-map-item-${bedId}" class="bed-map-item ${statusClass}" ${onclickText}>
        <div style="font-weight: 700;">${bedId}</div>
        <div style="font-size: 0.58rem; margin-top: 0.1rem; opacity: 0.9;">${statusLabel}</div>
      </div>
    `;
  }).join('');
}

window.selectBedFromCompactMap = function(bedId) {
  const bedSelect = document.getElementById('transfer-new-bed');
  if (!bedSelect) return;

  bedSelect.value = bedId;
  window.onCompactBedChange(bedId);
};

window.onCompactBedChange = function(bedId) {
  const items = document.querySelectorAll('.bed-map-item');
  items.forEach(item => item.classList.remove('selected'));
  
  const selectedItem = document.getElementById(`bed-map-item-${bedId}`);
  if (selectedItem) {
    selectedItem.classList.add('selected');
  }

  const bedSelect = document.getElementById('transfer-new-bed');
  if (bedSelect) {
    bedSelect.value = bedId;
  }

  window.validateCompactTransferForm();
};

window.validateCompactTransferForm = function() {
  const wardKey = document.getElementById('transfer-new-ward')?.value;
  const roomName = document.getElementById('transfer-new-room')?.value;
  const bedId = document.getElementById('transfer-new-bed')?.value;
  const reason = document.getElementById('transfer-reason')?.value;
  const datetime = document.getElementById('transfer-datetime')?.value;
  const requestedBy = document.getElementById('transfer-requested-by')?.value;

  const proceedBtn = document.getElementById('transfer-proceed-btn');
  if (!proceedBtn) return;

  if (wardKey && roomName && bedId && reason && datetime && requestedBy) {
    proceedBtn.disabled = false;
  } else {
    proceedBtn.disabled = true;
  }
};

// Wizard Screen 2: Handoff Review & Summary
window.proceedToTransferReview = function() {
  const wardKey = document.getElementById('transfer-new-ward').value;
  const roomName = document.getElementById('transfer-new-room').value;
  const bedId = document.getElementById('transfer-new-bed').value;
  const reason = document.getElementById('transfer-reason').value;
  const datetime = document.getElementById('transfer-datetime').value;
  const requestedBy = document.getElementById('transfer-requested-by').value;
  const approvedBy = document.getElementById('transfer-approved-by').value || '';
  const notes = document.getElementById('transfer-notes').value || '';

  // Save form state
  window.compactTransferFormData = {
    wardKey, roomName, bedId, reason, datetime, requestedBy, approvedBy, notes
  };

  const patient = window.selectedTransferPatient;
  const admission = window.selectedTransferAdmission;
  const currentBedId = admission.bed;
  const currentWardKey = admission.ward;

  // Real-time checks
  if (currentBedId === bedId) {
    alert("Transfer blocked: Current bed and destination bed cannot be the same.");
    return;
  }

  const currentStatus = state.bedsStatus[bedId]?.status;
  if (currentStatus !== 'Available' && currentStatus !== 'Vacant' && !(currentStatus === 'Reserved' && state.bedsStatus[bedId]?.patientUhid === patient.uhid)) {
    alert(`Transfer blocked: Destination bed ${bedId} is no longer available (current status is ${currentStatus}). Please select a different bed.`);
    window.onCompactRoomChange(roomName);
    return;
  }

  const card = document.getElementById('compact-transfer-card');
  if (!card) return;

  const destWard = state.wards[wardKey];
  const formattedDate = new Date(datetime).toLocaleString();

  card.innerHTML = `
    <div class="modal-header" style="border-bottom: 1px solid var(--border-color); padding: 0.85rem 1.25rem; display: flex; justify-content: space-between; align-items: center; background-color: var(--primary-glow);">
      <h4 style="margin: 0; font-weight: 700; color: var(--primary); display: flex; align-items: center; gap: 0.5rem;">📋 Review Patient Transfer Summary</h4>
      <span class="modal-close" style="cursor: pointer; font-size: 1.5rem;" onclick="window.closeCompactTransferModal()">&times;</span>
    </div>
    <div class="modal-body" style="padding: 1.25rem; display: flex; flex-direction: column; gap: 1rem;">
      
      <p style="margin: 0; font-size: 0.82rem; color: var(--text-secondary);">
        Please verify the following shift details before submitting the patient relocation order.
      </p>

      <div style="background-color: var(--bg-surface-elevated); padding: 0.75rem 1rem; border-radius: 8px; border: 1px solid var(--border-color); font-size: 0.8rem; display: grid; grid-template-columns: 1fr 1fr; gap: 0.4rem 1.5rem;">
        <p style="margin: 0; grid-column: span 2; border-bottom: 1px dashed var(--border-color); padding-bottom: 0.25rem; margin-bottom: 0.25rem; font-weight: bold; color: var(--primary);">Patient Information:</p>
        <p style="margin: 0;">Patient Name: <strong>${patient.name}</strong></p>
        <p style="margin: 0;">UHID / MRN: <strong>${patient.uhid}</strong></p>
        <p style="margin: 0;">Admission ID: <strong>${admission.id || 'N/A'}</strong></p>
        <p style="margin: 0;">Treating Doctor: <strong>${admission.doctorName}</strong></p>
        
        <p style="margin: 0; grid-column: span 2; border-bottom: 1px dashed var(--border-color); padding-bottom: 0.25rem; margin-top: 0.5rem; margin-bottom: 0.25rem; font-weight: bold; color: var(--primary);">Transfer Log Details:</p>
        <p style="margin: 0;">Transfer Reason: <span class="badge" style="background-color: var(--color-success-bg); color: var(--color-success); font-weight: bold; font-size: 0.72rem;">${reason}</span></p>
        <p style="margin: 0;">Effective Time: <strong>${formattedDate}</strong></p>
        <p style="margin: 0;">Requested By: <strong>${requestedBy}</strong></p>
        <p style="margin: 0;">Approved By: <strong>${approvedBy || 'N/A'}</strong></p>
      </div>

      <!-- Comparative location readout -->
      <div style="display: flex; align-items: center; justify-content: space-between; gap: 1rem; background-color: var(--bg-base); padding: 0.75rem; border-radius: 6px; border: 1px solid var(--border-color); text-align: center;">
        <div style="flex: 1;">
          <span style="font-size: 0.65rem; color: var(--text-secondary); display: block; font-weight: bold;">ORIGIN BED</span>
          <strong style="color: var(--color-purple); font-size: 0.95rem;">${currentBedId}</strong>
          <span style="font-size: 0.65rem; color: var(--text-muted); display: block;">${state.wards[currentWardKey]?.name}</span>
        </div>
        <div style="font-size: 1.25rem; color: var(--text-muted); font-weight: bold;">➡️</div>
        <div style="flex: 1;">
          <span style="font-size: 0.65rem; color: var(--text-secondary); display: block; font-weight: bold;">DESTINATION BED</span>
          <strong style="color: var(--color-success); font-size: 0.95rem;">${bedId}</strong>
          <span style="font-size: 0.65rem; color: var(--text-muted); display: block;">${destWard?.name}</span>
        </div>
      </div>

      <div style="font-size: 0.75rem; color: var(--text-secondary); background-color: var(--bg-surface-elevated); padding: 0.5rem 0.75rem; border-radius: 4px; border: 1px solid var(--border-color);">
        <strong>Transfer Notes / Special instructions:</strong> ${notes || 'No special handoff notes provided.'}
      </div>

      <!-- Action confirmation controls -->
      <div style="display: flex; gap: 1rem; justify-content: flex-end; border-top: 1px solid var(--border-color); padding-top: 0.85rem; margin-top: 0.5rem;">
        <button class="btn btn-secondary" style="padding: 0.35rem 1.25rem; font-size: 0.82rem;" onclick="window.backToCompactTransferEdit()">⬅️ Back to Edit</button>
        <button class="btn btn-primary" style="padding: 0.35rem 1.75rem; font-size: 0.82rem; font-weight: bold; background-color: var(--color-success); border-color: var(--color-success);" onclick="window.executeCompactTransferWorkflow()">Confirm Transfer Now 🔄</button>
      </div>

    </div>
  `;
};

window.backToCompactTransferEdit = function() {
  window.renderCompactTransferForm();
};

// Wizard Screen 3: Execution and Success Receipt
window.executeCompactTransferWorkflow = function() {
  const fd = window.compactTransferFormData;
  const patient = window.selectedTransferPatient;
  const admission = window.selectedTransferAdmission;
  const currentBedId = admission.bed;
  const currentWardKey = admission.ward;
  
  const destBedId = fd.bedId;
  const destWardKey = fd.wardKey;
  const reason = fd.reason;
  const datetime = fd.datetime;
  const requestedBy = fd.requestedBy;
  const approvedBy = fd.approvedBy || 'N/A';
  const notes = fd.notes;

  // Real-time block check
  const currentStatus = state.bedsStatus[destBedId]?.status;
  if (currentStatus !== 'Available' && currentStatus !== 'Vacant' && !(currentStatus === 'Reserved' && state.bedsStatus[destBedId]?.patientUhid === patient.uhid)) {
    alert(`Transfer failed: Destination bed ${destBedId} is no longer available (current status is ${currentStatus}).`);
    window.closeCompactTransferModal();
    return;
  }

  if (currentBedId === destBedId) {
    alert("Transfer blocked: Current bed and destination bed cannot be the same.");
    return;
  }

  const oldBedPrevStatus = state.bedsStatus[currentBedId] ? state.bedsStatus[currentBedId].status : 'Occupied';
  const newBedPrevStatus = state.bedsStatus[destBedId] ? state.bedsStatus[destBedId].status : 'Available';

  // 1. Vacate old bed (Infection control isolation check)
  const isIsolation = reason === 'Isolation Requirement' || 
                      currentWardKey === 'CCU' || 
                      currentWardKey === 'ICCU';
  const targetOldBedStatus = isIsolation ? 'Isolation Cleaning Required' : 'Vacated - Pending Housekeeping';

  state.bedsStatus[currentBedId] = {
    wardKey: currentWardKey,
    status: targetOldBedStatus,
    patientUhid: null,
    transitionTimestamp: new Date().toISOString(),
    notes: `Awaiting cleaning after transfer of ${patient.name} (${patient.uhid}) to ${destBedId}`
  };

  // 2. Occupy new bed
  state.bedsStatus[destBedId] = {
    wardKey: destWardKey,
    status: 'Occupied',
    patientUhid: patient.uhid,
    notes: `Patient transfer from Bed ${currentBedId} on ${datetime} due to ${reason}`
  };

  // 3. Create Housekeeping task
  const isHighPriority = currentBedId.startsWith('EMG') || currentBedId.startsWith('CCU') || currentBedId.startsWith('ICCU');
  state.housekeepingTasks = state.housekeepingTasks || [];
  state.housekeepingTasks.push({
    taskId: 'HK-' + String(1000 + state.housekeepingTasks.length + 1),
    bedId: currentBedId,
    wardKey: currentWardKey,
    priority: isHighPriority ? 'High' : 'Normal',
    status: 'Pending',
    assignedStaff: null,
    createdAt: new Date().toISOString(),
    notes: `Awaiting cleaning after transfer of ${patient.name} to Bed ${destBedId}.`
  });

  // 4. Update admission record
  admission.bed = destBedId;
  admission.ward = destWardKey;
  admission.transferLogs = admission.transferLogs || [];
  
  const todayStr = new Date().toLocaleDateString('en-CA');
  admission.transferLogs.push({
    date: todayStr,
    source: currentBedId,
    dest: destBedId,
    reason: reason
  });

  // 5. Patient timeline event
  patient.timelineEvents = patient.timelineEvents || [];
  const nowTime = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  patient.timelineEvents.unshift({
    date: `${todayStr} ${nowTime}`,
    type: 'clinical',
    icon: '🔄',
    title: 'Patient Bed Transferred',
    desc: `Transferred from Bed ${currentBedId} to Bed ${destBedId} (${state.wards[destWardKey]?.name}) due to: ${reason}`
  });

  // 6. Destination station notification
  state.alerts = state.alerts || [];
  state.alerts.push({
    id: "ALT" + String(100 + state.alerts.length + 1),
    severity: "Information",
    source: "Admissions Desk",
    patientName: patient.name,
    uhid: patient.uhid,
    details: `Patient transfer completed. Moved from ${currentBedId} to ${destBedId} (${state.wards[destWardKey]?.name}).`,
    clinician: patient.primaryConsultant,
    time: `${todayStr} ${nowTime}`,
    status: "Active",
    eStatus: "Open"
  });

  // 7. Log Bed Movements
  state.logBedMovement({
    patientId: patient.uhid,
    encounterId: admission.id,
    bedId: currentBedId,
    wardKey: currentWardKey,
    prevStatus: oldBedPrevStatus,
    newStatus: targetOldBedStatus,
    action: 'Patient Transfer (Vacate)',
    reason: reason,
    remarks: `Transferred to ${destBedId}. Approved by ${approvedBy}. Notes: ${notes}`
  });

  state.logBedMovement({
    patientId: patient.uhid,
    encounterId: admission.id,
    bedId: destBedId,
    wardKey: destWardKey,
    prevStatus: newBedPrevStatus,
    newStatus: 'Occupied',
    action: 'Patient Transfer (Occupy)',
    reason: reason,
    remarks: `Transferred from ${currentBedId}. Approved by ${approvedBy}. Notes: ${notes}`
  });

  // 8. General audit log entry
  state.auditLogs = state.auditLogs || [];
  state.auditLogs.unshift({
    timestamp: new Date().toISOString(),
    user: requestedBy,
    uhid: patient.uhid,
    patientName: patient.name,
    action: "ATD Bed Transfer",
    details: `Transferred from bed ${currentBedId} to bed ${destBedId}. Reason: "${reason}". Requested by ${requestedBy}. Approved by ${approvedBy}.`
  });

  // Render receipt screen
  const card = document.getElementById('compact-transfer-card');
  if (!card) return;

  const oldWard = state.wards[currentWardKey]?.name || currentWardKey;
  const newWard = state.wards[destWardKey]?.name || destWardKey;
  const formattedDate = new Date(datetime).toLocaleString();

  card.innerHTML = `
    <div class="modal-header" style="border-bottom: 1px solid var(--border-color); padding: 0.85rem 1.25rem; display: flex; justify-content: space-between; align-items: center; background-color: var(--color-success-bg);">
      <h4 style="margin: 0; font-weight: 700; color: var(--color-success); display: flex; align-items: center; gap: 0.5rem;">✓ Transfer Executed Successfully</h4>
      <span class="modal-close" style="cursor: pointer; font-size: 1.5rem;" onclick="window.closeCompactTransferModal()">&times;</span>
    </div>
    <div class="modal-body" style="padding: 1.25rem; text-align: center; display: flex; flex-direction: column; gap: 1rem;">
      
      <div style="width: 50px; height: 50px; background-color: var(--color-success-bg); color: var(--color-success); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.8rem; margin: 0 auto; box-shadow: 0 0 8px rgba(74, 222, 128, 0.3);">
        ✓
      </div>
      
      <p style="margin: 0; font-size: 0.82rem; color: var(--text-muted);">
        System state successfully updated. Immutable JCI/NABH audit logs written.
      </p>

      <div style="background-color: var(--bg-surface-elevated); border: 1px solid var(--border-color); border-radius: 8px; padding: 0.85rem; text-align: left; display: flex; flex-direction: column; gap: 0.4rem; font-size: 0.78rem;">
        <p style="margin: 0; display: flex; justify-content: space-between;"><span>Patient:</span> <strong>${patient.name} (${patient.uhid})</strong></p>
        <p style="margin: 0; display: flex; justify-content: space-between;"><span>Admission ID:</span> <strong>${admission.id || 'N/A'}</strong></p>
        <p style="margin: 0; display: flex; justify-content: space-between;"><span>Transfer Reason:</span> <strong>${reason}</strong></p>
        <p style="margin: 0; display: flex; justify-content: space-between;"><span>Effective Time:</span> <strong>${formattedDate}</strong></p>

        <div style="display: flex; align-items: center; justify-content: space-between; gap: 1rem; margin-top: 0.5rem; background-color: var(--bg-base); padding: 0.5rem; border-radius: 6px; border: 1px solid var(--border-color); text-align: center;">
          <div style="flex: 1;">
            <span style="font-size: 0.6rem; color: var(--text-secondary); display: block;">ORIGIN</span>
            <strong style="color: var(--color-purple); font-size: 0.85rem;">Bed ${currentBedId}</strong>
            <span style="font-size: 0.6rem; color: var(--text-muted); display: block;">${oldWard}</span>
          </div>
          <div style="font-size: 1rem; color: var(--text-muted);">➡️</div>
          <div style="flex: 1;">
            <span style="font-size: 0.6rem; color: var(--text-secondary); display: block;">DESTINATION</span>
            <strong style="color: var(--color-success); font-size: 0.85rem;">Bed ${destBedId}</strong>
            <span style="font-size: 0.6rem; color: var(--text-muted); display: block;">${newWard}</span>
          </div>
        </div>
      </div>

      <!-- Success actions -->
      <div style="display: flex; gap: 1rem; justify-content: center; border-top: 1px solid var(--border-color); padding-top: 0.85rem; margin-top: 0.5rem;">
        <button class="btn btn-secondary" onclick="window.printTransferHandoffReceipt()" style="font-size: 0.82rem; padding: 0.35rem 1.25rem;">🖨️ Print Slip</button>
        <button class="btn btn-primary" onclick="window.closeCompactTransferModal()" style="font-weight: bold; font-size: 0.82rem; padding: 0.35rem 1.75rem;">Close</button>
      </div>

    </div>
  `;
};

window.printTransferHandoffReceipt = function() {
  alert("Initiating receipt printing to Admissions Thermal Printer...\nPrinted successfully!");
};

// Fallback routed view in case of deep-linked hash navigation
window.views.patientTransfer = function(container) {
  container.innerHTML = `
    <div class="card" style="max-width: 600px; margin: 3rem auto; text-align: center; border: 1px solid var(--border-color); box-shadow: var(--shadow-md);">
      <div class="card-header" style="background-color: var(--primary-glow); border-bottom: 1px solid var(--border-color); padding: 1rem;">
        <h3 class="card-title" style="color: var(--primary); font-weight: 700; margin: 0;">Patient Transfer Workflow</h3>
      </div>
      <div class="card-body" style="padding: 2rem; display: flex; flex-direction: column; gap: 1.25rem; align-items: center;">
        <p style="color: var(--text-muted); font-size: 0.9rem; margin: 0;">
          The Patient Transfer Workflow is now streamlined as a compact popup. Please initiate transfers directly from:
        </p>
        <div style="display: flex; flex-direction: column; gap: 0.5rem; text-align: left; background: var(--bg-surface-elevated); padding: 1rem; border-radius: 8px; border: 1px solid var(--border-color); width: 100%; max-width: 400px;">
          <div>🏢 <strong>Bed Board & ATD</strong>: Click on any occupied bed and choose <strong>Transfer Bed</strong>.</div>
          <div>👤 <strong>Patient Profile</strong>: Click on <strong>Transfer Bed</strong> under Bed Details.</div>
        </div>
        <button class="btn btn-primary" onclick="router.navigate('atd')" style="padding: 0.5rem 2rem; font-weight: bold; margin-top: 0.5rem;">
          Go to Bed Board & ATD ➡️
        </button>
      </div>
    </div>
  `;
};
