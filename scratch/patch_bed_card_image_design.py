#!/usr/bin/env python3

path = "/Users/home/Desktop/Saronil IHS/Updated HIS /assets/js/views/ipdAdmissionView.js"

with open(path, "r", encoding="utf-8") as f:
    src = f.read()

# 1. Replace renderBedCardHTML
old_bed_card_fn = """  function renderBedCardHTML(bedId, wardKey) {
    var s = window.state.bedsStatus[bedId] || { status: 'Available' };
    var status = s.status;
    var role = window._ipdActiveRole;

    var borderStyle = '';
    var textClassColor = '';
    var statusText = '';
    var patientNameHTML = '';
    var onClickAction = '';

    if (status === 'Occupied') {
      var p = window.state.patients.find(pt => pt.uhid === s.patientUhid) || { name: 'Trauma Patient', uhid: s.patientUhid || 'SH-2026-00000', age: 35, gender: 'Male', primaryConsultant: 'Dr. Fatima Sheikh', admitted: getTodayStr(), clinicalData: { diagnosis: 'Clinical Observation' }, flags: [] };
      borderStyle = 'border: 2px solid #8b5cf6;';
      textClassColor = 'color: #8b5cf6;';
      statusText = 'OCCUPIED';
      patientNameHTML = `<div style="font-size: 13px; font-weight: 700; color: #000; margin-top: 8px; font-family: sans-serif;">${p.name}</div>`;
      onClickAction = `onclick="window._drawerOpenDetails('${p.uhid}', '${bedId}')"`;
    } else if (status === 'Available') {
      borderStyle = 'border: 2px solid #10b981;';
      textClassColor = 'color: #10b981;';
      statusText = 'AVAILABLE';
      onClickAction = `onclick="window._bedOpenQuickAssign('${bedId}')"`;
    } else if (status === 'Cleaning') {
      borderStyle = 'border: 2px solid #f59e0b;';
      textClassColor = 'color: #f59e0b;';
      statusText = 'HOUSEKEEPING';
      onClickAction = `onclick="window._bedMarkReady('${bedId}', '${wardKey}')"`;
    } else if (status === 'Reserved') {
      borderStyle = 'border: 2px solid #a855f7;';
      textClassColor = 'color: #a855f7;';
      statusText = 'RESERVED';
      patientNameHTML = `<div style="font-size: 12px; font-weight: 700; color: #555; margin-top: 8px;">${s.notes || 'Pending'}</div>`;
      onClickAction = `onclick="window._bedReleaseReservation('${bedId}', '${wardKey}')"`;
    }

    return `
      <div ${onClickAction} style="background: white; border-radius: 8px; padding: 14px; min-height: 105px; display: flex; flex-direction: column; justify-content: space-between; cursor: pointer; transition: all 0.2s; box-shadow: 0 2px 4px rgba(0,0,0,0.02); ${borderStyle}">
        <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
          <span style="font-size: 13px; font-weight: 700; ${textClassColor}">${bedId}</span>
          <span style="font-size: 15px; filter: grayscale(100%);">🛏️</span>
        </div>
        <div style="flex: 1; display: flex; flex-direction: column; justify-content: flex-end; margin-top: 10px; text-align: left;">
          <div style="font-size: 11px; font-weight: 800; text-transform: uppercase; ${textClassColor}">${statusText}</div>
          ${patientNameHTML}
        </div>
      </div>
    `;
  }"""

new_bed_card_fn = """  function renderBedCardHTML(bedId, wardKey) {
    var s = window.state.bedsStatus[bedId] || { status: 'Available' };
    var status = s.status;
    var role = window._ipdActiveRole;

    var formattedBedId = bedId;
    if (bedId.startsWith('GW(M)-')) {
      formattedBedId = 'GW(Male) - ' + bedId.substring(6);
    } else if (bedId.startsWith('GW(F)-')) {
      formattedBedId = 'GW(Female) - ' + bedId.substring(6);
    } else {
      var parts = bedId.split('-');
      if (parts.length === 2) {
        formattedBedId = parts[0] + ' - ' + parts[1];
      }
    }

    var borderStyle = '';
    var badgeBg = '';
    var statusText = '';
    var patientNameHTML = '';
    var onClickAction = '';

    if (status === 'Occupied') {
      var p = window.state.patients.find(pt => pt.uhid === s.patientUhid) || { name: 'Trauma Patient', uhid: s.patientUhid || 'SH-2026-00000' };
      borderStyle = 'border: 3px solid #334155;';
      badgeBg = '#334155';
      statusText = 'Occupied';
      patientNameHTML = `
        <div style="font-size: 16px; font-weight: 800; color: #000; margin-top: 10px; font-family: sans-serif;">${p.name}</div>
        <div style="font-size: 13px; color: #4b5563; margin-top: 2px; font-family: sans-serif;">${p.uhid}</div>
      `;
      onClickAction = `onclick="window._drawerOpenDetails('${p.uhid}', '${bedId}')"`;
    } else if (status === 'Available') {
      borderStyle = 'border: 3px solid #10b981;';
      badgeBg = '#10b981';
      statusText = 'Available';
      patientNameHTML = `
        <div style="font-size: 16px; font-weight: 800; color: #94a3b8; margin-top: 10px; font-family: sans-serif;">No Patient</div>
        <div style="font-size: 13px; color: #94a3b8; margin-top: 2px; font-family: sans-serif;">Awaiting Assignment</div>
      `;
      onClickAction = `onclick="window._bedOpenQuickAssign('${bedId}')"`;
    } else if (status === 'Cleaning') {
      borderStyle = 'border: 3px solid #f59e0b;';
      badgeBg = '#f59e0b';
      statusText = 'Cleaning';
      patientNameHTML = `
        <div style="font-size: 16px; font-weight: 800; color: #d97706; margin-top: 10px; font-family: sans-serif;">Sanitizing</div>
        <div style="font-size: 13px; color: #d97706; margin-top: 2px; font-family: sans-serif;">Housekeeping in progress</div>
      `;
      onClickAction = `onclick="window._bedMarkReady('${bedId}', '${wardKey}')"`;
    } else if (status === 'Reserved') {
      borderStyle = 'border: 3px solid #8b5cf6;';
      badgeBg = '#8b5cf6';
      statusText = 'Reserved';
      patientNameHTML = `
        <div style="font-size: 16px; font-weight: 800; color: #7c3aed; margin-top: 10px; font-family: sans-serif;">Reserved</div>
        <div style="font-size: 13px; color: #7c3aed; margin-top: 2px; font-family: sans-serif;">${s.notes || 'Pending Admit'}</div>
      `;
      onClickAction = `onclick="window._bedReleaseReservation('${bedId}', '${wardKey}')"`;
    }

    return `
      <div ${onClickAction} style="background: white; border-radius: 16px; padding: 18px; display: flex; flex-direction: column; cursor: pointer; transition: all 0.2s; box-shadow: none; box-sizing: border-box; ${borderStyle}">
        <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
          <span style="font-size: 16px; font-weight: 800; color: #000; font-family: sans-serif;">${formattedBedId}</span>
          <span style="font-size: 20px;">🛏️</span>
        </div>
        <div style="text-align: left; margin-top: 6px; margin-bottom: 2px;">
          <span style="background: ${badgeBg}; color: white; padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: 700; display: inline-block; font-family: sans-serif;">${statusText}</span>
        </div>
        <div style="text-align: left;">
          ${patientNameHTML}
        </div>
      </div>
    `;
  }"""

src = src.replace(old_bed_card_fn, new_bed_card_fn, 1)

# 2. Update column min-width inside renderBedBoardScreen
old_col_width = """<div class="ipd-bed-grid-container" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 14px; margin-top: 10px;">"""
new_col_width = """<div class="ipd-bed-grid-container" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(215px, 1fr)); gap: 14px; margin-top: 10px;">"""

src = src.replace(old_col_width, new_col_width, 1)

with open(path, "w", encoding="utf-8") as f:
    f.write(src)

print("SUCCESS: Bed Card design updated to match uploaded image format.")
