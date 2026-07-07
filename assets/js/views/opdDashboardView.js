// OPD (Outpatient Department) Dashboard
// Saronil Health HIS — Dynamic version pulling from window.state

(function() {
  function initOpdState() {
    if (!window.state) window.state = {};

    // Only seed defaults if productionSeed hasn't run yet
    if (!window.state.opdQueue || window.state.opdQueue.length === 0) {
      window.state.opdQueue = [
        { token: 'OPD-TK-101', patient: 'Sunita Sharma', uhid: 'SH-2026-04817', doctor: 'Dr. Priya Nair', speciality: 'Gynecology & Obs', status: 'Waiting', time: '10:15 AM', waitTime: 42 },
        { token: 'OPD-TK-102', patient: 'Meera Iyer', uhid: 'SH-2026-04826', doctor: 'Dr. Ramesh Iyer', speciality: 'Pediatrics', status: 'Waiting', time: '10:30 AM', waitTime: 18 },
        { token: 'OPD-TK-103', patient: 'Rajan Pillai', uhid: 'SH-2026-04840', doctor: 'Dr. Srinivasan', speciality: 'General Medicine', status: 'In Consultation', time: '09:45 AM', waitTime: 67 },
        { token: 'OPD-TK-104', patient: 'Anjali Bose', uhid: 'SH-2026-04845', doctor: 'Dr. Priya Nair', speciality: 'Gynecology & Obs', status: 'Waiting', time: '11:00 AM', waitTime: 28 },
        { token: 'OPD-TK-105', patient: 'Pramod Rao', uhid: 'SH-2026-04851', doctor: 'Dr. Anand', speciality: 'Cardiology', status: 'Registered', time: '09:00 AM', waitTime: 88 },
        { token: 'OPD-TK-106', patient: 'Nandita Kumari', uhid: 'SH-2026-04855', doctor: 'Dr. Krishnamurthy', speciality: 'Psychiatry', status: 'Registered', time: '11:30 AM', waitTime: 5 },
        { token: 'OPD-TK-107', patient: 'Vikrant Gupta', uhid: 'SH-2026-04862', doctor: 'Dr. Munna Kumar', speciality: 'Orthopedics', status: 'Waiting', time: '11:15 AM', waitTime: 13 }
      ];
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
  }

  window.views = window.views || {};
  window.views.opdDashboard = function(container) {
    initOpdState();
    const queue = window.state.opdQueue || [];
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
        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 16px;">
          <div class="card" style="padding: 12px; display:flex; flex-direction:column; justify-content:space-between; min-height:80px;">
            <div style="font-size:0.68rem; color:var(--text-secondary); font-weight:600;">Appointments Booked</div>
            <div style="font-size:1.3rem; font-weight:bold; color:var(--text-primary); margin-top:4px;">${totalBooked + 141} Booked</div>
            <div style="font-size:0.6rem; color:var(--text-muted);">Today's session load</div>
          </div>
          <div class="card" style="padding: 12px; display:flex; flex-direction:column; justify-content:space-between; min-height:80px;">
            <div style="font-size:0.68rem; color:var(--text-secondary); font-weight:600;">Lobby Waiting Queue</div>
            <div style="font-size:1.3rem; font-weight:bold; color:#D97706; margin-top:4px;">${waiting} Patients</div>
            <div style="font-size:0.6rem; color:var(--text-muted);">Live lobby seating status</div>
          </div>
          <div class="card" style="padding: 12px; display:flex; flex-direction:column; justify-content:space-between; min-height:80px;">
            <div style="font-size:0.68rem; color:var(--text-secondary); font-weight:600;">Avg Waiting Time</div>
            <div style="font-size:1.3rem; font-weight:bold; color:#2563EB; margin-top:4px;">22 Minutes</div>
            <div style="font-size:0.6rem; color:var(--text-muted);">Within hospital SLA</div>
          </div>
          <div class="card" style="padding: 12px; display:flex; flex-direction:column; justify-content:space-between; min-height:80px;">
            <div style="font-size:0.68rem; color:var(--text-secondary); font-weight:600;">Doctors on Duty</div>
            <div style="font-size:1.3rem; font-weight:bold; color:#059669; margin-top:4px;">${(window.state.doctorDutyLogs || []).filter(d => d.status === 'Active').length} Active</div>
            <div style="font-size:0.6rem; color:var(--text-muted);">OPD consulting now</div>
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
