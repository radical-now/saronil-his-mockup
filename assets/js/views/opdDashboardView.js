// OPD (Outpatient Department) Dashboard
// Saronil Health HIS — Dynamic version pulling from window.state

(function() {
  function initOpdState() {
    if (!window.state) window.state = {};

    // Prefer queue seeded by productionSeed so OPD Dashboard and EMR share the same data
    const savedOpdQueue = localStorage.getItem('saronil_opdQueue');
    if (savedOpdQueue) {
      try {
        window.state.opdQueue = JSON.parse(savedOpdQueue);
      } catch(e) {
        window.state.opdQueue = null;
      }
    }

    if (!window.state.opdQueue) {
      window.state.opdQueue = [];
    }

    if (!window.state.doctorDutyLogs || window.state.doctorDutyLogs.length === 0) {
      window.state.doctorDutyLogs = [
        { room: 'Room 101 — OPD', doctor: 'Dr. Srinivasan', speciality: 'General Medicine', status: 'Active', patientsWaiting: 4 },
        { room: 'Room 105 — OPD', doctor: 'Dr. Priya Nair', speciality: 'Gynecology & Obs', status: 'Active', patientsWaiting: 3 },
        { room: 'Room 107 — OPD', doctor: 'Dr. Anand', speciality: 'Cardiology', status: 'Active', patientsWaiting: 2 },
        { room: 'Room 102 — OPD', doctor: 'Dr. Ramesh Iyer', speciality: 'Pediatrics', status: 'Active', patientsWaiting: 2 },
        { room: 'Room 103 — OPD', doctor: 'Dr. Krishnamurthy', speciality: 'Psychiatry', status: 'Available', patientsWaiting: 0 },
        { room: 'Room 114 — OPD', doctor: 'Dr. Munna Kumar', speciality: 'Orthopedics', status: 'Active', patientsWaiting: 1 }
      ];
    }

    // Also rebuild doctorDutyLogs from opdQueue doctors if state has seeded queue
    if (window.state.opdQueue && window.state.opdQueue.length > 0 && (!window.state.doctorDutyLogs || window.state.doctorDutyLogs.length === 0)) {
      const seen = new Set();
      window.state.doctorDutyLogs = window.state.opdQueue
        .filter(q => { if (seen.has(q.doctor)) return false; seen.add(q.doctor); return true; })
        .map((q, i) => ({
          room: `Room ${101 + i} — OPD`,
          doctor: q.doctor,
          speciality: q.speciality,
          status: 'Active',
          patientsWaiting: window.state.opdQueue.filter(x => x.doctor === q.doctor && (x.status === 'Waiting' || x.status === 'In Consultation')).length
        }));
    }
  }

  window.views = window.views || {};
  window.views.opdDashboard = function(container) {
    initOpdState();
    if (typeof window.syncOpdQueueWithAppointments === 'function') {
      window.syncOpdQueueWithAppointments();
    }
    // Filter out any active IPD patients from the OPD queue — they cannot be in the OPD queue
    const isIPD = window.isActiveIPD || ((uhid) => {
      const p = window.state && window.state.patients && window.state.patients.find(x => x.uhid === uhid);
      return p && p.type === 'IPD' && (p.status === 'Admitted' || p.status === 'Critical' || p.status === 'Under Observation');
    });
    const queue = (window.state.opdQueue || []).filter(q => !isIPD(q.uhid));
    const waiting = queue.filter(q => q.status === 'Waiting' || q.status === 'In Consultation').length;
    const totalBooked = queue.length;

    container.innerHTML = `
      <div style="padding: 12px 0;">
        <!-- Page Header -->
        <div style="margin-top: 4px; margin-bottom: 16px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
          <div>
            <h1 style="font-size: 1.35rem; font-weight: 700; color: var(--text-primary); margin: 0; font-family: var(--font-display);">OPD Desk Board</h1>
            <div style="font-size: 0.78rem; color: var(--text-muted); margin-top: 2px;">Outpatient Registrations · Doctor Lobby Queue Control · Token Allocations</div>
          </div>
          <div class="admin-mono" style="font-size: 0.72rem; background: var(--bg-surface-elevated); padding: 4px 10px; border-radius: 4px; border: 1px solid var(--border-color); font-weight: 500;">
            🏢 Desk Role: OPD Officer
          </div>
        </div>

        <!-- KPI Stats Cards -->
        <div class="admin-kpi-scroll-row">
          <!-- Card 1: Appointments Booked -->
          <div class="admin-kpi-card status-normal" style="cursor: default;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; width: 100%;">
              <span style="font-size: 0.72rem; font-weight: 700; text-transform: uppercase; color: var(--text-secondary);">Appointments Booked</span>
            </div>
            <div style="margin-top: 8px; margin-bottom: 8px;">
              <span class="admin-mono" style="font-size: 1.45rem; font-weight: 700; color: var(--text-primary); letter-spacing: -0.02em;">${totalBooked + 141} Booked</span>
              <div style="font-size: 0.72rem; color: var(--text-muted); margin-top: 2px;">Today's session load</div>
            </div>
            <div style="display: flex; align-items: center; justify-content: space-between; margin-top: 4px; font-size: 0.72rem; border-top: 1px dashed var(--border-color); padding-top: 6px;">
              <span style="color: var(--color-success); font-weight: 600; display: flex; align-items: center; gap: 2px;">
                ▲ High Volume
              </span>
            </div>
          </div>

          <!-- Card 2: Lobby Waiting Queue -->
          <div class="admin-kpi-card ${waiting > 0 ? 'status-warning' : 'status-normal'}" style="cursor: default;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; width: 100%;">
              <span style="font-size: 0.72rem; font-weight: 700; text-transform: uppercase; color: var(--text-secondary);">Lobby Waiting Queue</span>
            </div>
            <div style="margin-top: 8px; margin-bottom: 8px;">
              <span class="admin-mono" style="font-size: 1.45rem; font-weight: 700; color: #D97706; letter-spacing: -0.02em;">${waiting} Patients</span>
              <div style="font-size: 0.72rem; color: var(--text-muted); margin-top: 2px;">Live lobby seating status</div>
            </div>
            <div style="display: flex; align-items: center; justify-content: space-between; margin-top: 4px; font-size: 0.72rem; border-top: 1px dashed var(--border-color); padding-top: 6px;">
              <span style="color: ${waiting > 0 ? 'var(--color-warning)' : 'var(--color-success)'}; font-weight: 600; display: flex; align-items: center; gap: 2px;">
                ${waiting > 0 ? '▼ Waiting' : '▲ Cleared'}
              </span>
            </div>
          </div>

          <!-- Card 3: Avg Waiting Time -->
          <div class="admin-kpi-card status-normal" style="cursor: default;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; width: 100%;">
              <span style="font-size: 0.72rem; font-weight: 700; text-transform: uppercase; color: var(--text-secondary);">Avg Waiting Time</span>
            </div>
            <div style="margin-top: 8px; margin-bottom: 8px;">
              <span class="admin-mono" style="font-size: 1.45rem; font-weight: 700; color: #2563EB; letter-spacing: -0.02em;">22 Minutes</span>
              <div style="font-size: 0.72rem; color: var(--text-muted); margin-top: 2px;">Within hospital SLA</div>
            </div>
            <div style="display: flex; align-items: center; justify-content: space-between; margin-top: 4px; font-size: 0.72rem; border-top: 1px dashed var(--border-color); padding-top: 6px;">
              <span style="color: var(--color-success); font-weight: 600; display: flex; align-items: center; gap: 2px;">
                ▲ Target Met
              </span>
            </div>
          </div>

          <!-- Card 4: Doctors on Duty -->
          <div class="admin-kpi-card status-normal" style="cursor: default;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; width: 100%;">
              <span style="font-size: 0.72rem; font-weight: 700; text-transform: uppercase; color: var(--text-secondary);">Doctors on Duty</span>
            </div>
            <div style="margin-top: 8px; margin-bottom: 8px;">
              <span class="admin-mono" style="font-size: 1.45rem; font-weight: 700; color: #059669; letter-spacing: -0.02em;">${(window.state.doctorDutyLogs || []).filter(d => d.status === 'Active').length} Active</span>
              <div style="font-size: 0.72rem; color: var(--text-muted); margin-top: 2px;">OPD consulting now</div>
            </div>
            <div style="display: flex; align-items: center; justify-content: space-between; margin-top: 4px; font-size: 0.72rem; border-top: 1px dashed var(--border-color); padding-top: 6px;">
              <span style="color: var(--color-success); font-weight: 600; display: flex; align-items: center; gap: 2px;">
                ▲ Roster Active
              </span>
            </div>
          </div>
        </div>

        <!-- Quick Action Bar -->
        <div style="background-color: var(--bg-surface); padding: 10px 16px; border: 1px solid var(--border-color); border-radius: 6px; display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 16px;">
          <button class="btn btn-primary btn-sm" onclick="window.mockOpdAction('Register')">🆕 OPD Register</button>
          <button class="btn btn-secondary btn-sm" onclick="window.mockOpdAction('Token')">🎫 Generate Token</button>
          <button class="btn btn-secondary btn-sm" onclick="window.mockOpdAction('Duty')">📅 Doctor Duty Roster</button>
          <button class="btn btn-secondary btn-sm" onclick="window.mockOpdAction('Clinic')">🏥 Clinic Schedule</button>
        </div>

        <!-- Main 3-Column Desk -->
        <div style="display: grid; grid-template-columns: 35% 35% 30%; gap: 12px; min-width: 1200px; align-items: start;">
          
          <!-- Column 1: Walk-in Queue -->
          <div class="card">
            <div class="card-header" style="border-bottom: 1px solid var(--border-color); padding: 10px 12px; display: flex; justify-content: space-between; align-items: center;">
              <h3 style="font-size: 0.85rem; font-weight: 700; color: var(--text-primary); margin:0;">1. OPD Patient Queue</h3>
              <span style="font-size: 0.7rem; color: var(--text-muted);">${queue.length} tokens today</span>
            </div>
            <div class="card-body" style="padding: 10px; display: flex; flex-direction: column; gap: 8px;">
              ${queue.length === 0 ? `<div style="padding: 20px; text-align: center; color: var(--text-muted); font-size: 0.8rem; font-style: italic;">No patients in queue today</div>` : 
                queue.map(q => `
                <div style="border: 1px solid var(--border-color); border-radius: 6px; padding: 10px; background-color: white; font-size: 0.72rem; display:flex; flex-direction:column; gap:4px; cursor:pointer;" onclick="router.navigate('patients?uhid=${q.uhid}&name=${encodeURIComponent(q.patient || q.name)}')">
                  <div style="display:flex; justify-content:space-between; align-items:center;">
                    <span class="admin-mono font-bold" style="font-size:0.7rem; color:#2563EB;">${q.token}</span>
                    <span class="badge ${q.status === 'In Consultation' ? 'badge-priority-urgent' : q.status === 'Waiting' ? 'badge-priority-moderate' : 'badge-priority-routine'}" style="font-size:8px; padding:1px 4px;">${q.status}</span>
                  </div>
                  <div>
                    <div style="font-weight:600; color:var(--primary); text-decoration:underline; cursor:pointer;" onclick="event.stopPropagation(); router.navigate('patients?uhid=${q.uhid}&name=${encodeURIComponent(q.patient || q.name)}')">${q.patient || q.name}</div>
                    <div style="color:var(--text-secondary); font-size:0.68rem;">Clinic: ${q.speciality} · Doctor: ${q.doctor}</div>
                    <div style="color:var(--text-muted); font-size:0.65rem; display:flex; justify-content:space-between;">
                      <span>⏱ Wait: <strong>${q.waitTime || '—'}m</strong></span>
                      <span>🕐 ${q.time || ''}</span>
                    </div>
                  </div>
                  <div style="border-top:1px dashed var(--border-color); padding-top:4px; margin-top:2px; display:flex; justify-content:flex-end; gap:4px;">
                    ${q.status === 'Waiting' ? `<button class="btn btn-primary" onclick="event.stopPropagation(); window.mockCallConsultation('${q.token}')" style="padding:1px 6px; font-size:9px; background-color:#2563EB;">Call Patient</button>` : ''}
                    <button class="btn btn-secondary" onclick="event.stopPropagation(); router.navigate('patients?uhid=${q.uhid}&name=${encodeURIComponent(q.patient || q.name)}')" style="padding:1px 6px; font-size:9px;">Open EMR</button>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- Column 2: Doctor Token Board -->
          <div class="card">
            <div class="card-header" style="border-bottom: 1px solid var(--border-color); padding: 10px 12px;">
              <h3 style="font-size: 0.85rem; font-weight: 700; color: var(--text-primary); margin:0;">2. Live Clinic Board</h3>
            </div>
            <div class="card-body" style="padding: 10px; display: flex; flex-direction: column; gap: 8px;">
              ${(window.state.doctorDutyLogs || []).map(l => `
                <div style="border: 1px solid var(--border-color); border-radius: 6px; padding: 10px; background-color: white; font-size: 0.72rem; display:flex; flex-direction:column; gap:4px;">
                  <div style="display:flex; justify-content:space-between; align-items:center;">
                    <span class="admin-mono font-bold" style="font-size:0.7rem;">${l.room}</span>
                    <span class="badge" style="font-size:8px; padding:1px 4px; background:${l.status === 'Active' ? '#E6FFFA' : '#FFF5F5'}; color:${l.status === 'Active' ? '#006B5F' : '#E53E3E'};">${l.status}</span>
                  </div>
                  <div>
                    <div style="font-weight:600; color:var(--text-primary);">${l.doctor}</div>
                    <div style="color:var(--text-secondary); font-size:0.68rem;">Spec: ${l.speciality}</div>
                    <div style="color:var(--text-muted); font-size:0.65rem;">Lobby Waiting: <strong style="color:#2563EB">${l.patientsWaiting}</strong></div>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- Column 3: Schedule Quick Stats -->
          <div class="card">
            <div class="card-header" style="border-bottom: 1px solid var(--border-color); padding: 10px 12px;">
              <h3 style="font-size: 0.85rem; font-weight: 700; color: var(--text-primary); margin:0;">3. Specialty Overview</h3>
            </div>
            <div class="card-body" style="padding: 12px; font-size: 0.7rem; color: var(--text-secondary); line-height: 1.9;">
              • General Medicine: <span class="font-bold" style="color:var(--text-primary);">42 bookings</span> (Wait: 18m)<br>
              • Gynecology & Obs: <span class="font-bold" style="color:var(--text-primary);">28 bookings</span> (Wait: 22m)<br>
              • Cardiology: <span class="font-bold" style="color:var(--text-primary);">12 bookings</span> (Wait: 12m)<br>
              • Pediatrics: <span class="font-bold" style="color:var(--text-primary);">20 bookings</span> (Wait: 15m)<br>
              • Orthopedics: <span class="font-bold" style="color:var(--text-primary);">18 bookings</span> (Wait: 10m)<br>
              • Psychiatry: <span class="font-bold" style="color:var(--text-primary);">10 bookings</span> (Wait: 8m)
            </div>
          </div>
        </div>
      </div>
    `;
  };

  window.mockOpdAction = function(action) {
    alert(`OPD ${action} Workspace drawer spooled. Initiating transaction...`);
  };

  window.mockCallConsultation = function(token) {
    const q = (window.state.opdQueue || []).find(x => x.token === token);
    if (q) q.status = 'In Consultation';
    const vp = document.getElementById('dashboard-persona-viewport') || document.getElementById('main-content');
    if (vp && window.views.opdDashboard) window.views.opdDashboard(vp);
    if (window.prShowToast) window.prShowToast(`Patient ${token} called to consultation room.`);
  };

})();
