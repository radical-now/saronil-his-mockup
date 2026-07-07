#!/usr/bin/env python3
import re

path = "/Users/home/Desktop/Saronil IHS/Updated HIS /assets/js/views/hospMgmtView.js"

with open(path, "r", encoding="utf-8") as f:
    src = f.read()

# Verify where we insert the renderPatientRecordsTab function
target_end = """    alert(`Biomedical Waste daily entry logged successfully under CPCB mandate.`);
      window.renderHospMgmtSubTab('utilities');
    };
  }

})();"""

# We want to replace target_end with our implementation + target_end
PATIENT_RECORDS_IMPLEMENTATION = """    alert(`Biomedical Waste daily entry logged successfully under CPCB mandate.`);
      window.renderHospMgmtSubTab('utilities');
    };
  }

  // ========================================================================
  // PERSONA 6: PATIENT RECORDS WORKSPACE
  // ========================================================================
  function renderPatientRecordsTab(panel) {
    // Inject Google Font
    if (!document.getElementById('outfit-font-link')) {
      const link = document.createElement('link');
      link.id = 'outfit-font-link';
      link.rel = 'stylesheet';
      link.href = 'https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&display=swap';
      document.head.appendChild(link);
    }

    // Set page header title (inside topbar)
    const titleEl = document.getElementById('mgmt-active-tab-title-el');
    if (titleEl) {
      titleEl.innerHTML = 'Patient Records';
    }

    // State setup in window.state
    if (!window.state.mgmtPatients) {
      // 15 Static Rows
      const staticRows = [
        { name: "Rajesh Kumar", uhid: "SH-2026-04821", type: "IPD", dept: "General Medicine", doctor: "Dr. Srinivasan", ward: "General Ward", bed: "B-12", payer: "Star Health", status: "Admitted", flags: [], admitted: "28 Jun 2026 · 10:15", mobile: "9876543210", genderAge: "45M" },
        { name: "Priya Menon", uhid: "SH-2026-04803", type: "IPD", dept: "Psychiatry", doctor: "Dr. Krishnamurthy", ward: "Private", bed: "P-04", payer: "Self Pay", status: "Admitted", flags: [], admitted: "28 Jun 2026 · 09:30", mobile: "9823456789", genderAge: "38F" },
        { name: "Mohammed Iqbal", uhid: "SH-2026-04799", type: "IPD", dept: "Surgery", doctor: "Dr. Mehta", ward: "HDU", bed: "H-02", payer: "HDFC ERGO", status: "Post-Op", flags: ["Critical"], admitted: "28 Jun 2026 · 08:45", mobile: "9912345678", genderAge: "62M" },
        { name: "Sunita Sharma", uhid: "SH-2026-04817", type: "Daycare", dept: "Gynaecology", doctor: "Dr. Priya Nair", ward: "Daycare Bay", bed: "D-06", payer: "PMJAY", status: "In Consultation", flags: [], admitted: "28 Jun 2026 · 11:20", mobile: "9123456789", genderAge: "29F" },
        { name: "Arun Pillai", uhid: "SH-2026-04788", type: "IPD", dept: "Cardiology", doctor: "Dr. Anand", ward: "ICU", bed: "ICU-03", payer: "CGHS", status: "Critical", flags: ["Critical"], admitted: "28 Jun 2026 · 07:15", mobile: "9765432109", genderAge: "55M" },
        { name: "Kavitha Nair", uhid: "SH-2026-04822", type: "OPD", dept: "Dermatology", doctor: "Dr. Fatima Sheikh", ward: "OPD Room 2", bed: "—", payer: "Self Pay", status: "In Consultation", flags: [], admitted: "28 Jun 2026 · 13:10", mobile: "9845678901", genderAge: "34F" },
        { name: "Deepak Verma", uhid: "SH-2026-04755", type: "IPD", dept: "Orthopaedics", doctor: "Dr. Ramesh Iyer", ward: "Semi-Private", bed: "SP-08", payer: "United India", status: "Pre-Op", flags: [], admitted: "28 Jun 2026 · 06:45", mobile: "9988776655", genderAge: "41M" },
        { name: "Fatima Begum", uhid: "Emergency", dept: "General Medicine", doctor: "Dr. Srinivasan", ward: "Emergency Bay", bed: "E-01", payer: "New India", status: "Under Observation", flags: ["MLC"], admitted: "28 Jun 2026 · 14:15", mobile: "9743210987", genderAge: "50F" }, // type changed to Emergency to represent ER Active boarding, wait, we will dynamically handle Fatima Begum as Emergency to fit ER Active Boarding
        { name: "Vikram Singh", uhid: "SH-2026-04790", type: "IPD", dept: "Neurology", doctor: "Dr. Anand", ward: "Private", bed: "P-11", payer: "ECHS", status: "Admitted", flags: ["DNR"], admitted: "28 Jun 2026 · 09:12", mobile: "9567890123", genderAge: "68M" },
        { name: "Anitha Rao", uhid: "SH-2026-04831", type: "Daycare", dept: "Surgery", doctor: "Dr. Mehta", ward: "Daycare Bay", bed: "D-02", payer: "ESI", status: "Discharge Pending", flags: [], admitted: "28 Jun 2026 · 12:05", mobile: "9456789012", genderAge: "47F" },
        { name: "Suresh Babu", uhid: "SH-2026-04768", type: "IPD", dept: "General Medicine", doctor: "Dr. Srinivasan", ward: "General Ward", bed: "B-07", payer: "Self Pay", status: "LAMA", flags: ["LAMA"], admitted: "28 Jun 2026 · 10:40", mobile: "9345678901", genderAge: "52M" },
        { name: "Meera Iyer", uhid: "SH-2026-04826", type: "OPD", dept: "Paediatrics", doctor: "Dr. Priya Nair", ward: "OPD Room 4", bed: "—", payer: "Star Health", status: "In Consultation", flags: [], admitted: "28 Jun 2026 · 11:55", mobile: "9234567890", genderAge: "8F" },
        { name: "Rahul Gupta", uhid: "SH-2026-04812", type: "IPD", dept: "Psychiatry", doctor: "Dr. Krishnamurthy", ward: "General Ward", bed: "B-18", payer: "Self Pay", status: "Admitted", flags: [], admitted: "28 Jun 2026 · 08:10", mobile: "9123450987", genderAge: "26M" },
        { name: "Lakshmi Devi", uhid: "SH-2026-04801", type: "Daycare", dept: "Gynaecology", doctor: "Dr. Priya Nair", ward: "Daycare Bay", bed: "D-09", payer: "HDFC ERGO", status: "Discharged", flags: [], admitted: "28 Jun 2026 · 14:30", mobile: "9876512345", genderAge: "60F" },
        { name: "Arjun Nair", uhid: "SH-2026-04798", type: "IPD", dept: "Cardiology", doctor: "Dr. Anand", ward: "ICU", bed: "ICU-07", payer: "Corporate", status: "Post-Op", flags: [], admitted: "28 Jun 2026 · 07:50", mobile: "9988771122", genderAge: "49M" }
      ];

      // Fix Fatima Begum type to Emergency explicitly to match prompt's row 8
      staticRows[7].type = "Emergency";

      const firstNames = ["Amit", "Rohan", "Sanjay", "Kiran", "Divya", "Neha", "Vijay", "Asha", "Sunil", "Rajesh", "Gita", "Harish", "Preeti", "Alok", "Madhav", "Jyoti"];
      const lastNames = ["Sharma", "Verma", "Joshi", "Iyer", "Patel", "Reddy", "Sen", "Das", "Rao", "Nair", "Mehta", "Chawla", "Bose", "Pillai", "Gupta", "Deshmukh"];
      const depts = ["General Medicine", "Orthopaedics", "Psychiatry", "Cardiology", "Neurology", "Paediatrics", "Gynaecology", "Surgery", "ENT", "Dermatology", "ICU"];
      const docs = ["Dr. Srinivasan", "Dr. Mehta", "Dr. Krishnamurthy", "Dr. Anand", "Dr. Fatima Sheikh", "Dr. Ramesh Iyer", "Dr. Priya Nair"];
      const payers = ["Self Pay", "Star Health", "HDFC ERGO", "New India Assurance", "United India", "ECHS", "CGHS", "PMJAY", "ESI", "Corporate"];
      const wards = ["General Ward", "Semi-Private", "Private", "ICU", "HDU", "Daycare Bay", "Emergency Bay"];

      const generated = [];

      // We need exact active counts matching the prompt:
      // Active IPD: 23 (currently in static rows we have 9 active IPD). Let's generate 14 active IPD.
      // Active OPD: 5 (currently we have 2). Let's generate 3 active OPD.
      // Active Daycare: 68 (currently we have 2 active daycare). Let's generate 66 active Daycare.
      // Active Emergency: 0 (Wait! Fatima Begum is Emergency, but she has status Under Observation. Let's make her status Under Observation, and we can keep Emergency active count = 0 or 1. Let's generate 0 active Emergency so active Emergency = 1. Or if we want Emergency = 0, we can make Fatima Begum Discharged). Let's generate 0 additional Emergency.
      // Discharged Today: 4 (currently we have 1 discharged: Lakshmi Devi). Let's generate 3 additional discharged rows.

      // 1. Generate 14 active IPD rows
      for (let i = 0; i < 14; i++) {
        const fn = firstNames[Math.floor(Math.random() * firstNames.length)];
        const ln = lastNames[Math.floor(Math.random() * lastNames.length)];
        const uhidNum = 4800 + i + 100;
        const hour = String(6 + Math.floor(Math.random() * 8)).padStart(2, '0');
        const min = String(Math.floor(Math.random() * 60)).padStart(2, '0');
        generated.push({
          name: `${fn} ${ln}`,
          uhid: `SH-2026-0${uhidNum}`,
          type: "IPD",
          dept: depts[Math.floor(Math.random() * depts.length)],
          doctor: docs[Math.floor(Math.random() * docs.length)],
          ward: wards[Math.floor(Math.random() * 5)], // General, Semi, Private, ICU, HDU
          bed: `B-${Math.floor(Math.random() * 40) + 1}`,
          payer: payers[Math.floor(Math.random() * payers.length)],
          status: "Admitted",
          flags: [],
          admitted: `28 Jun 2026 · ${hour}:${min}`,
          mobile: `98${Math.floor(Math.random() * 90000000) + 10000000}`,
          genderAge: `${Math.floor(Math.random() * 60) + 18}${Math.random() > 0.5 ? 'M' : 'F'}`
        });
      }

      // 2. Generate 3 active OPD rows
      for (let i = 0; i < 3; i++) {
        const fn = firstNames[Math.floor(Math.random() * firstNames.length)];
        const ln = lastNames[Math.floor(Math.random() * lastNames.length)];
        const uhidNum = 4900 + i;
        const hour = String(9 + Math.floor(Math.random() * 5)).padStart(2, '0');
        const min = String(Math.floor(Math.random() * 60)).padStart(2, '0');
        generated.push({
          name: `${fn} ${ln}`,
          uhid: `SH-2026-0${uhidNum}`,
          type: "OPD",
          dept: depts[Math.floor(Math.random() * depts.length)],
          doctor: docs[Math.floor(Math.random() * docs.length)],
          ward: "OPD Room " + (Math.floor(Math.random() * 5) + 1),
          bed: "—",
          payer: "Self Pay",
          status: "In Consultation",
          flags: [],
          admitted: `28 Jun 2026 · ${hour}:${min}`,
          mobile: `97${Math.floor(Math.random() * 90000000) + 10000000}`,
          genderAge: `${Math.floor(Math.random() * 60) + 18}${Math.random() > 0.5 ? 'M' : 'F'}`
        });
      }

      // 3. Generate 66 active Daycare rows
      for (let i = 0; i < 66; i++) {
        const fn = firstNames[Math.floor(Math.random() * firstNames.length)];
        const ln = lastNames[Math.floor(Math.random() * lastNames.length)];
        const uhidNum = 5000 + i;
        const hour = String(8 + Math.floor(Math.random() * 6)).padStart(2, '0');
        const min = String(Math.floor(Math.random() * 60)).padStart(2, '0');
        generated.push({
          name: `${fn} ${ln}`,
          uhid: `SH-2026-0${uhidNum}`,
          type: "Daycare",
          dept: "Daycare Bay",
          doctor: docs[Math.floor(Math.random() * docs.length)],
          ward: "Daycare Bay",
          bed: `D-${String(i+10).padStart(2,'0')}`,
          payer: payers[Math.floor(Math.random() * payers.length)],
          status: "Under Observation",
          flags: [],
          admitted: `28 Jun 2026 · ${hour}:${min}`,
          mobile: `96${Math.floor(Math.random() * 90000000) + 10000000}`,
          genderAge: `${Math.floor(Math.random() * 60) + 18}${Math.random() > 0.5 ? 'M' : 'F'}`
        });
      }

      // 4. Generate 3 additional Discharged rows
      for (let i = 0; i < 3; i++) {
        const fn = firstNames[Math.floor(Math.random() * firstNames.length)];
        const ln = lastNames[Math.floor(Math.random() * lastNames.length)];
        const uhidNum = 5100 + i;
        const hour = String(7 + Math.floor(Math.random() * 4)).padStart(2, '0');
        const min = String(Math.floor(Math.random() * 60)).padStart(2, '0');
        generated.push({
          name: `${fn} ${ln}`,
          uhid: `SH-2026-0${uhidNum}`,
          type: i === 0 ? "IPD" : "Daycare",
          dept: depts[Math.floor(Math.random() * depts.length)],
          doctor: docs[Math.floor(Math.random() * docs.length)],
          ward: i === 0 ? "General Ward" : "Daycare Bay",
          bed: i === 0 ? "B-32" : "D-18",
          payer: payers[Math.floor(Math.random() * payers.length)],
          status: "Discharged",
          flags: [],
          admitted: `28 Jun 2026 · ${hour}:${min}`,
          mobile: `95${Math.floor(Math.random() * 90000000) + 10000000}`,
          genderAge: `${Math.floor(Math.random() * 60) + 18}${Math.random() > 0.5 ? 'M' : 'F'}`
        });
      }

      window.state.mgmtPatients = [...staticRows, ...generated];
    }

    // Initialize local search tab and filters
    if (window.activePatientsTab === undefined) {
      window.activePatientsTab = 'All';
    }
    if (window.patientsFilters === undefined) {
      window.patientsFilters = { dept: 'All', doctor: 'All', ward: 'All', payer: 'All', dateRange: 'Today', fromDate: '', toDate: '' };
    }
    if (window.patientsSort === undefined) {
      window.patientsSort = 'Admission Time ↓';
    }
    if (window.patientsSearchQuery === undefined) {
      window.patientsSearchQuery = '';
    }

    // Build subtab workspace HTML
    const workspaceStyles = `
      <style>
        .pr-wrap {
          font-family: 'Outfit', sans-serif;
          font-size: 13px;
          color: var(--text);
          background: var(--bg);
          display: flex;
          flex-direction: column;
          gap: 16px;
          padding: 16px;
        }
        .pr-wrap .mono {
          font-family: monospace;
        }
        .pr-card {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 8px;
          padding: 16px;
          box-shadow: 0 1px 2px rgba(0,0,0,0.02);
        }
        
        /* Stats Row */
        .pr-stats-row {
          display: flex;
          gap: 12px;
          overflow-x: auto;
          scrollbar-width: none; /* Firefox */
          padding-bottom: 4px;
        }
        .pr-stats-row::-webkit-scrollbar {
          display: none; /* Chrome/Safari */
        }
        .pr-stat-card {
          flex: 0 0 160px;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 8px;
          padding: 12px 14px;
          cursor: pointer;
          position: relative;
          overflow: hidden;
          transition: all 0.15s ease-in-out;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .pr-stat-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 3px;
          background: var(--accent-color, var(--blue));
        }
        .pr-stat-card:hover {
          box-shadow: 0 2px 8px rgba(0,0,0,0.06);
          border-color: #cbd5e1;
        }
        .pr-stat-card.active {
          background: var(--accent-light, var(--blue-light));
          border-color: var(--accent-color, var(--blue));
        }
        .pr-stat-val {
          font-size: 24px;
          font-weight: 600;
          color: var(--accent-color, var(--blue));
          font-family: monospace;
          line-height: 1.1;
        }
        .pr-stat-label {
          font-size: 11px;
          color: var(--text3);
          text-transform: uppercase;
          letter-spacing: 0.5px;
          font-weight: 500;
        }
        .pr-stat-dimmed {
          opacity: 0.5;
        }

        /* Filter Tabs */
        .pr-tabs-strip {
          display: flex;
          border-bottom: 1px solid var(--border);
          overflow-x: auto;
          scrollbar-width: none;
          gap: 4px;
        }
        .pr-tabs-strip::-webkit-scrollbar {
          display: none;
        }
        .pr-tab {
          padding: 8px 16px;
          font-size: 13px;
          font-weight: 500;
          color: var(--text2);
          cursor: pointer;
          border-bottom: 2px solid transparent;
          white-space: nowrap;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: all 0.15s;
        }
        .pr-tab:hover {
          background: var(--surface2);
        }
        .pr-tab.active {
          border-bottom-color: var(--blue);
          color: var(--blue);
          background: var(--blue-light);
        }
        .pr-tab.dimmed {
          color: var(--text3);
        }
        .pr-dot-red { color: var(--red); }
        .pr-dot-amber { color: var(--amber); }

        /* Search & Action */
        .pr-search-row {
          display: flex;
          gap: 12px;
          align-items: center;
          position: relative;
        }
        .pr-search-wrapper {
          flex: 1;
          position: relative;
          display: flex;
          align-items: center;
        }
        .pr-search-icon {
          position: absolute;
          left: 10px;
          color: var(--text3);
          pointer-events: none;
        }
        .pr-search-clear {
          position: absolute;
          right: 10px;
          color: var(--text3);
          cursor: pointer;
          font-size: 16px;
          user-select: none;
        }
        .pr-search-clear:hover {
          color: var(--text);
        }
        .pr-search-input {
          width: 100%;
          padding: 8px 10px 8px 30px;
          border: 1px solid var(--border);
          border-radius: 8px;
          outline: none;
          font-size: 13px;
          transition: border-color 0.15s;
        }
        .pr-search-input:focus {
          border-color: var(--blue);
        }
        .pr-btn-add {
          background: var(--blue);
          color: #fff;
          border: none;
          border-radius: 8px;
          padding: 8px 16px;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          white-space: nowrap;
          height: 34px;
        }
        .pr-btn-add:hover {
          background: #082d6b;
        }

        /* Suggestive Dropdown */
        .pr-search-dropdown {
          position: absolute;
          top: 36px;
          left: 0;
          right: 0;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.08);
          z-index: 100;
          max-height: 280px;
          overflow-y: auto;
        }
        .pr-search-result-row {
          padding: 8px 12px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          cursor: pointer;
          border-bottom: 1px solid var(--border);
        }
        .pr-search-result-row:last-child {
          border-bottom: none;
        }
        .pr-search-result-row.selected, .pr-search-result-row:hover {
          background: var(--blue-light);
        }
        .pr-avatar {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: var(--blue-light);
          color: var(--blue);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          font-size: 11px;
        }
        .pr-dropdown-view-all {
          text-align: center;
          padding: 8px;
          font-weight: 600;
          color: var(--blue);
          cursor: pointer;
          background: var(--surface2);
          font-size: 12px;
        }
        .pr-dropdown-view-all:hover {
          background: #e2e8f0;
        }

        /* Secondary Filters */
        .pr-filters-row {
          display: flex;
          gap: 8px;
          align-items: center;
          flex-wrap: wrap;
        }
        .pr-filter-select {
          height: 32px;
          border: 1px solid var(--border);
          border-radius: 8px;
          background: var(--surface);
          padding: 0 8px;
          font-size: 13px;
          outline: none;
          color: var(--text2);
          cursor: pointer;
        }
        .pr-filter-select.active {
          border-color: var(--blue);
          background: var(--blue-light);
          color: var(--blue);
          font-weight: 500;
        }
        .pr-clear-link {
          font-size: 13px;
          font-weight: 500;
          color: var(--blue);
          cursor: pointer;
          text-decoration: none;
          margin-left: auto;
          user-select: none;
        }
        .pr-clear-link:hover {
          text-decoration: underline;
        }

        /* Results & Sort */
        .pr-results-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 12px;
          color: var(--text2);
          font-weight: 500;
        }

        /* Table */
        .pr-table-container {
          overflow-x: auto;
          border: 1px solid var(--border);
          border-radius: 8px;
          background: var(--surface);
        }
        .pr-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
        }
        .pr-table th {
          background: var(--surface2);
          padding: 10px 12px;
          font-weight: 600;
          color: var(--text2);
          border-bottom: 1px solid var(--border);
        }
        .pr-table td {
          padding: 10px 12px;
          border-bottom: 1px solid var(--border);
          vertical-align: middle;
        }
        .pr-table tbody tr {
          cursor: pointer;
          background: var(--surface);
          transition: background 0.1s;
        }
        .pr-table tbody tr:nth-child(even) {
          background: var(--surface);
        }
        .pr-table tbody tr:nth-child(odd) {
          background: var(--surface2);
        }
        .pr-table tbody tr:hover {
          background: var(--blue-light) !important;
        }
        
        /* Badges */
        .pr-badge {
          display: inline-block;
          padding: 2px 8px;
          border-radius: 4px;
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
        }
        .badge-ipd { background: var(--purple-light); color: var(--purple); }
        .badge-opd { background: var(--blue-light); color: var(--blue); }
        .badge-emergency { background: var(--red-light); color: var(--red); }
        .badge-daycare { background: #ecfeff; color: #0891b2; }

        .status-admitted { background: var(--green-light); color: var(--green); }
        .status-consultation { background: var(--blue-light); color: var(--blue); }
        .status-observation { background: var(--amber-light); color: var(--amber); }
        .status-preop { background: var(--purple-light); color: var(--purple); }
        .status-postop { background: var(--purple-light); color: var(--purple); }
        .status-discharged { background: #f1f5f9; color: var(--text3); }
        .status-pending { background: var(--amber-light); color: var(--amber); }
        .status-critical { background: var(--red-light); color: var(--red); }
        .status-lama { background: var(--red-light); color: var(--red); }

        .flag-pill {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 10px;
          font-weight: 600;
        }
        .flag-critical { background: var(--red-light); color: var(--red); }
        .flag-mlc { background: var(--amber-light); color: var(--amber); }
        .flag-dnr { background: #f1f5f9; color: var(--text2); }
        .flag-lama { background: var(--amber-light); color: var(--amber); }

        .btn-view {
          background: transparent;
          border: 1px solid var(--blue);
          color: var(--blue);
          padding: 2px 8px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 11px;
          font-weight: 600;
        }
        .btn-view:hover {
          background: var(--blue-light);
        }
        
        /* Dropdown Actions */
        .kebab-trigger {
          background: transparent;
          border: none;
          color: var(--text2);
          cursor: pointer;
          font-size: 16px;
          padding: 4px 8px;
        }
        .kebab-menu {
          position: absolute;
          right: 12px;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 6px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          z-index: 110;
          display: flex;
          flex-direction: column;
          width: 140px;
        }
        .kebab-item {
          padding: 6px 12px;
          text-align: left;
          font-size: 12px;
          border: none;
          background: transparent;
          color: var(--text2);
          cursor: pointer;
        }
        .kebab-item:hover {
          background: var(--surface2);
          color: var(--text);
        }

        /* Toast notifications */
        .pr-toast {
          position: fixed;
          bottom: 24px;
          right: 24px;
          background: #0f172a;
          color: #fff;
          padding: 10px 18px;
          border-radius: 6px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          font-size: 13px;
          font-weight: 500;
          z-index: 1000;
          display: flex;
          align-items: center;
          gap: 8px;
          animation: slideUp 0.2s ease-out;
        }
        @keyframes slideUp {
          from { transform: translateY(12px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }

        /* Empty State */
        .pr-empty-state {
          padding: 48px 16px;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 10px;
          background: var(--surface);
          border-radius: 8px;
        }
      </style>
    `;

    // Internal render workspace
    function draw() {
      const data = window.state.mgmtPatients;
      const activeTab = window.activePatientsTab;
      const filters = window.patientsFilters;
      const sort = window.patientsSort;
      const query = window.patientsSearchQuery;

      // Compute dynamic stats from the entire database (101 patients)
      const countTotal = data.length;
      const countIpdActive = data.filter(p => p.type === 'IPD' && p.status !== 'Discharged').length;
      const countOpdToday = data.filter(p => p.type === 'OPD').length;
      const countEmergencyActive = data.filter(p => p.type === 'Emergency' && p.status !== 'Discharged').length;
      const countDaycareActive = data.filter(p => p.type === 'Daycare' && p.status !== 'Discharged').length;
      const countDischargedToday = data.filter(p => p.status === 'Discharged').length;
      const countCritical = data.filter(p => p.status === 'Critical' || p.flags.includes('Critical')).length;
      const countMlcActive = data.filter(p => p.flags.includes('MLC') && p.status !== 'Discharged').length;
      const countDischargePending = data.filter(p => p.status === 'Discharge Pending').length;

      // Filter logic
      let filtered = data;

      // Tab filtering
      if (activeTab === 'IPD') {
        filtered = filtered.filter(p => p.type === 'IPD' && p.status !== 'Discharged');
      } else if (activeTab === 'OPD') {
        filtered = filtered.filter(p => p.type === 'OPD');
      } else if (activeTab === 'Emergency') {
        filtered = filtered.filter(p => p.type === 'Emergency' && p.status !== 'Discharged');
      } else if (activeTab === 'Daycare') {
        filtered = filtered.filter(p => p.type === 'Daycare' && p.status !== 'Discharged');
      } else if (activeTab === 'Discharged Today') {
        filtered = filtered.filter(p => p.status === 'Discharged');
      } else if (activeTab === 'Critical') {
        filtered = filtered.filter(p => p.status === 'Critical' || p.flags.includes('Critical'));
      } else if (activeTab === 'MLC') {
        filtered = filtered.filter(p => p.flags.includes('MLC'));
      } else if (activeTab === 'Discharge Pending') {
        filtered = filtered.filter(p => p.status === 'Discharge Pending');
      }

      // Secondary filters
      if (filters.dept !== 'All') {
        filtered = filtered.filter(p => p.dept === filters.dept);
      }
      if (filters.doctor !== 'All') {
        filtered = filtered.filter(p => p.doctor === filters.doctor);
      }
      if (filters.ward !== 'All') {
        filtered = filtered.filter(p => p.ward === filters.ward);
      }
      if (filters.payer !== 'All') {
        filtered = filtered.filter(p => p.payer === filters.payer);
      }
      // Date filtering
      if (filters.dateRange === 'Custom Range' && filters.fromDate && filters.toDate) {
        const from = new Date(filters.fromDate);
        const to = new Date(filters.toDate);
        filtered = filtered.filter(p => {
          // Parse date like "28 Jun 2026"
          const parts = p.admitted.split(' · ')[0].split(' ');
          const months = { 'Jan':0, 'Feb':1, 'Mar':2, 'Apr':3, 'May':4, 'Jun':5, 'Jul':6, 'Aug':7, 'Sep':8, 'Oct':9, 'Nov':10, 'Dec':11 };
          const pDate = new Date(parseInt(parts[2]), months[parts[1]], parseInt(parts[0]));
          return pDate >= from && pDate <= to;
        });
      } else if (filters.dateRange === 'Yesterday') {
        filtered = filtered.filter(p => p.admitted.includes('27 Jun 2026'));
      } else if (filters.dateRange === 'Today') {
        filtered = filtered.filter(p => p.admitted.includes('28 Jun 2026'));
      }

      // Search Query
      if (query.trim().length >= 2) {
        const q = query.toLowerCase().trim();
        filtered = filtered.filter(p => 
          p.name.toLowerCase().includes(q) ||
          p.uhid.toLowerCase().includes(q) ||
          p.mobile.includes(q) ||
          (p.bed && p.bed.toLowerCase().includes(q))
        );
      }

      // Sort
      if (sort === 'Admission Time ↓') {
        filtered.sort((a,b) => b.admitted.localeCompare(a.admitted));
      } else if (sort === 'Name A–Z') {
        filtered.sort((a,b) => a.name.localeCompare(b.name));
      } else if (sort === 'UHID') {
        filtered.sort((a,b) => a.uhid.localeCompare(b.uhid));
      } else if (sort === 'Criticality') {
        const criticalOrder = { 'Critical': 3, 'Admitted': 1, 'In Consultation': 0, 'Discharged': -1 };
        filtered.sort((a,b) => (criticalOrder[b.status] || 0) - (criticalOrder[a.status] || 0));
      } else if (sort === 'Discharge Time') {
        filtered.sort((a,b) => b.admitted.localeCompare(a.admitted)); // Fallback
      }

      // Render Stats Cards Row
      const statsHtml = `
        <div class="pr-stats-row">
          <div class="pr-stat-card ${activeTab === 'All' ? 'active' : ''}" style="--accent-color: var(--blue); --accent-light: var(--blue-light);" onclick="window.prSelectTab('All')">
            <span class="pr-stat-val">${countTotal}</span>
            <span class="pr-stat-label">Total Patients Today</span>
          </div>
          <div class="pr-stat-card ${activeTab === 'IPD' ? 'active' : ''}" style="--accent-color: var(--purple); --accent-light: var(--purple-light);" onclick="window.prSelectTab('IPD')">
            <span class="pr-stat-val">${countIpdActive}</span>
            <span class="pr-stat-label">IPD Active</span>
          </div>
          <div class="pr-stat-card ${activeTab === 'OPD' ? 'active' : ''}" style="--accent-color: var(--blue); --accent-light: var(--blue-light);" onclick="window.prSelectTab('OPD')">
            <span class="pr-stat-val">${countOpdToday}</span>
            <span class="pr-stat-label">OPD Today</span>
          </div>
          <div class="pr-stat-card ${activeTab === 'Emergency' ? 'active' : ''} ${countEmergencyActive === 0 ? 'pr-stat-dimmed' : ''}" style="--accent-color: var(--red); --accent-light: var(--red-light);" onclick="window.prSelectTab('Emergency')">
            <span class="pr-stat-val" style="color: ${countEmergencyActive === 0 ? 'var(--text3)' : 'var(--red)'};">${countEmergencyActive}</span>
            <span class="pr-stat-label">Emergency</span>
          </div>
          <div class="pr-stat-card ${activeTab === 'Daycare' ? 'active' : ''}" style="--accent-color: var(--cyan); --accent-light: var(--cyan-light);" onclick="window.prSelectTab('Daycare')">
            <span class="pr-stat-val" style="color: #0891b2;">${countDaycareActive}</span>
            <span class="pr-stat-label">Daycare</span>
          </div>
          <div class="pr-stat-card ${activeTab === 'Discharged Today' ? 'active' : ''}" style="--accent-color: var(--green); --accent-light: var(--green-light);" onclick="window.prSelectTab('Discharged Today')">
            <span class="pr-stat-val" style="color: var(--green);">${countDischargedToday}</span>
            <span class="pr-stat-label">Discharged Today</span>
          </div>
          <div class="pr-stat-card ${activeTab === 'Critical' ? 'active' : ''} ${countCritical === 0 ? 'pr-stat-dimmed' : ''}" style="--accent-color: var(--red); --accent-light: var(--red-light);" onclick="window.prSelectTab('Critical')">
            <span class="pr-stat-val" style="color: ${countCritical === 0 ? 'var(--text3)' : 'var(--red)'};">${countCritical}</span>
            <span class="pr-stat-label">Critical</span>
          </div>
          <div class="pr-stat-card ${activeTab === 'MLC' ? 'active' : ''}" style="--accent-color: var(--amber); --accent-light: var(--amber-light);" onclick="window.prSelectTab('MLC')">
            <span class="pr-stat-val" style="color: var(--amber);">${countMlcActive}</span>
            <span class="pr-stat-label">MLC Active</span>
          </div>
          <div class="pr-stat-card ${activeTab === 'Discharge Pending' ? 'active' : ''} ${countDischargePending === 0 ? 'pr-stat-dimmed' : ''}" style="--accent-color: var(--amber); --accent-light: var(--amber-light);" onclick="window.prSelectTab('Discharge Pending')">
            <span class="pr-stat-val" style="color: ${countDischargePending === 0 ? 'var(--text3)' : 'var(--amber)'};">${countDischargePending}</span>
            <span class="pr-stat-label">Discharge Pending</span>
          </div>
        </div>
      `;

      // Render Tabs
      const tabsHtml = `
        <div class="pr-tabs-strip">
          <div class="pr-tab ${activeTab === 'All' ? 'active' : ''}" onclick="window.prSelectTab('All')">All (${countTotal})</div>
          <div class="pr-tab ${activeTab === 'IPD' ? 'active' : ''} ${countIpdActive === 0 ? 'dimmed' : ''}" onclick="window.prSelectTab('IPD')">IPD (${countIpdActive})</div>
          <div class="pr-tab ${activeTab === 'OPD' ? 'active' : ''} ${countOpdToday === 0 ? 'dimmed' : ''}" onclick="window.prSelectTab('OPD')">OPD (${countOpdToday})</div>
          <div class="pr-tab ${activeTab === 'Emergency' ? 'active' : ''} ${countEmergencyActive === 0 ? 'dimmed' : ''}" onclick="window.prSelectTab('Emergency')">Emergency (${countEmergencyActive})</div>
          <div class="pr-tab ${activeTab === 'Daycare' ? 'active' : ''} ${countDaycareActive === 0 ? 'dimmed' : ''}" onclick="window.prSelectTab('Daycare')">Daycare (${countDaycareActive})</div>
          <div class="pr-tab ${activeTab === 'Discharged Today' ? 'active' : ''} ${countDischargedToday === 0 ? 'dimmed' : ''}" onclick="window.prSelectTab('Discharged Today')">Discharged Today (${countDischargedToday})</div>
          <div class="pr-tab ${activeTab === 'Critical' ? 'active' : ''} ${countCritical === 0 ? 'dimmed' : ''}" onclick="window.prSelectTab('Critical')"><span class="pr-dot-red">🔴</span> Critical (${countCritical})</div>
          <div class="pr-tab ${activeTab === 'MLC' ? 'active' : ''} ${countMlcActive === 0 ? 'dimmed' : ''}" onclick="window.prSelectTab('MLC')"><span class="pr-dot-amber">🟡</span> MLC (${countMlcActive})</div>
          <div class="pr-tab ${activeTab === 'Discharge Pending' ? 'active' : ''} ${countDischargePending === 0 ? 'dimmed' : ''}" onclick="window.prSelectTab('Discharge Pending')">Discharge Pending (${countDischargePending})</div>
        </div>
      `;

      // Check if any filter is active
      const filtersActive = filters.dept !== 'All' || filters.doctor !== 'All' || filters.ward !== 'All' || filters.payer !== 'All' || filters.dateRange !== 'Today' || query.trim().length >= 2;

      // Dropdown filter elements
      const depts = ["All Departments", "General Medicine", "Orthopaedics", "Psychiatry", "Cardiology", "Neurology", "Paediatrics", "Gynaecology", "Surgery", "ENT", "Dermatology", "ICU"];
      const doctors = ["All Doctors", "Dr. Srinivasan", "Dr. Mehta", "Dr. Krishnamurthy", "Dr. Anand", "Dr. Fatima Sheikh", "Dr. Ramesh Iyer", "Dr. Priya Nair"];
      const wardsList = ["All Wards", "General Ward", "Semi-Private", "Private", "ICU", "HDU", "Daycare Bay", "Emergency Bay"];
      const payersList = ["All Payers", "Self Pay", "Star Health", "HDFC ERGO", "New India Assurance", "United India", "ECHS", "CGHS", "PMJAY", "ESI", "Corporate"];
      const dateRanges = ["Today", "Yesterday", "Last 7 Days", "This Month", "Custom Range"];

      // Render Dropdowns
      const dropdownsHtml = `
        <div class="pr-filters-row">
          <select class="pr-filter-select ${filters.dept !== 'All' ? 'active' : ''}" onchange="window.prSetFilter('dept', this.value)">
            ${depts.map(d => `<option value="${d === 'All Departments' ? 'All' : d}" ${filters.dept === (d === 'All Departments' ? 'All' : d) ? 'selected' : ''}>${d}</option>`).join('')}
          </select>
          <select class="pr-filter-select ${filters.doctor !== 'All' ? 'active' : ''}" onchange="window.prSetFilter('doctor', this.value)">
            ${doctors.map(d => `<option value="${d === 'All Doctors' ? 'All' : d}" ${filters.doctor === (d === 'All Doctors' ? 'All' : d) ? 'selected' : ''}>${d}</option>`).join('')}
          </select>
          <select class="pr-filter-select ${filters.ward !== 'All' ? 'active' : ''}" onchange="window.prSetFilter('ward', this.value)">
            ${wardsList.map(w => `<option value="${w === 'All Wards' ? 'All' : w}" ${filters.ward === (w === 'All Wards' ? 'All' : w) ? 'selected' : ''}>${w}</option>`).join('')}
          </select>
          <select class="pr-filter-select ${filters.payer !== 'All' ? 'active' : ''}" onchange="window.prSetFilter('payer', this.value)">
            ${payersList.map(p => `<option value="${p === 'All Payers' ? 'All' : p}" ${filters.payer === (p === 'All Payers' ? 'All' : p) ? 'selected' : ''}>${p}</option>`).join('')}
          </select>
          <select class="pr-filter-select ${filters.dateRange !== 'Today' ? 'active' : ''}" onchange="window.prSetFilter('dateRange', this.value)" id="pr-daterange-select">
            ${dateRanges.map(dr => `<option value="${dr}" ${filters.dateRange === dr ? 'selected' : ''}>${dr}</option>`).join('')}
          </select>

          ${filters.dateRange === 'Custom Range' ? `
            <div style="display:inline-flex; align-items:center; gap:4px; font-size:12px;" id="pr-custom-pickers">
              <input type="date" class="pr-filter-select" style="height:32px;" value="${filters.fromDate}" onchange="window.prSetFilter('fromDate', this.value)">
              <span style="color:var(--text3);">to</span>
              <input type="date" class="pr-filter-select" style="height:32px;" value="${filters.toDate}" onchange="window.prSetFilter('toDate', this.value)">
            </div>
          ` : ''}

          ${filtersActive ? `
            <span class="pr-clear-link" onclick="window.prClearAllFilters()">Clear Filters</span>
          ` : ''}
        </div>
      `;

      // Render Table Rows
      let tableBodyHtml = '';
      if (filtered.length === 0) {
        tableBodyHtml = `
          <tr>
            <td colspan="9" style="padding:0;">
              <div class="pr-empty-state">
                <span style="font-size:32px;">🔍</span>
                <strong style="font-size:14px; color:var(--text);">No patients match your filters</strong>
                <span style="color:var(--text2);">Try clearing filters or searching by a different term</span>
                <button class="pr-btn-add" style="margin-top:4px;" onclick="window.prClearAllFilters()">Clear Filters</button>
              </div>
            </td>
          </tr>
        `;
      } else {
        tableBodyHtml = filtered.map((p, idx) => {
          const initials = p.name.split(' ').map(n=>n[0]).join('').substring(0,2).toUpperCase();
          
          let tBadge = '';
          if (p.type === 'IPD') tBadge = '<span class="pr-badge badge-ipd">IPD</span>';
          else if (p.type === 'OPD') tBadge = '<span class="pr-badge badge-opd">OPD</span>';
          else if (p.type === 'Emergency') tBadge = '<span class="pr-badge badge-emergency">Emergency</span>';
          else if (p.type === 'Daycare') tBadge = '<span class="pr-badge badge-daycare">Daycare</span>';

          let sClass = '';
          if (p.status === 'Admitted') sClass = 'status-admitted';
          else if (p.status === 'In Consultation') sClass = 'status-consultation';
          else if (p.status === 'Under Observation') sClass = 'status-observation';
          else if (p.status === 'Pre-Op') sClass = 'status-preop';
          else if (p.status === 'Post-Op') sClass = 'status-postop';
          else if (p.status === 'Discharged') sClass = 'status-discharged';
          else if (p.status === 'Discharge Pending') sClass = 'status-pending';
          else if (p.status === 'Critical') sClass = 'status-critical';
          else if (p.status === 'LAMA') sClass = 'status-lama';

          // Flag pill rendering
          const flagHtml = p.flags.map(f => {
            if (f === 'Critical') return '<span class="flag-pill flag-critical">🔴 Critical</span>';
            if (f === 'MLC') return '<span class="flag-pill flag-mlc">⚖️ MLC</span>';
            if (f === 'DNR') return '<span class="flag-pill flag-dnr">DNR</span>';
            if (f === 'LAMA') return '<span class="flag-pill flag-lama">LAMA</span>';
            return '';
          }).join(' ');

          return `
            <tr onclick="window.prOpenRecord('${p.name}')">
              <td>
                <div style="display:flex; align-items:center; gap:10px;">
                  <div class="pr-avatar">${initials}</div>
                  <div>
                    <div style="font-weight:600; color:var(--text);">${p.name}</div>
                    <div class="mono" style="font-size:11px; color:var(--text3);">${p.uhid}</div>
                  </div>
                </div>
              </td>
              <td>${tBadge}</td>
              <td>
                <div style="font-weight:500; color:var(--text);">${p.dept}</div>
                <div style="font-size:11px; color:var(--text3);">${p.doctor}</div>
              </td>
              <td>
                <div style="font-weight:500; color:var(--text);">${p.ward}</div>
                <div class="mono" style="font-size:11px; color:var(--text3);">${p.bed}</div>
              </td>
              <td style="font-weight:500; color:var(--text2);">${p.payer}</td>
              <td><span class="pr-badge ${sClass}">${p.status}</span></td>
              <td class="mono" style="font-size:11px; color:var(--text2);">${p.admitted}</td>
              <td>${flagHtml || '—'}</td>
              <td onclick="event.stopPropagation()">
                <div style="display:flex; align-items:center; gap:4px; position:relative;">
                  <button class="btn-view" onclick="window.prOpenRecord('${p.name}')">View &rarr;</button>
                  <button class="kebab-trigger" onclick="window.prToggleKebab(event, ${idx})">⋮</button>
                  <div id="kebab-menu-${idx}" class="kebab-menu" style="display:none; top: 26px;">
                    <button class="kebab-item" onclick="window.prKebabAction('${p.name}', 'View Record')">View Record</button>
                    <button class="kebab-item" onclick="window.prKebabAction('${p.name}', 'Edit Details')">Edit Details</button>
                    <button class="kebab-item" onclick="window.prKebabAction('${p.name}', 'Print Summary')">Print Summary</button>
                    <button class="kebab-item" onclick="window.prKebabAction('${p.name}', 'Transfer')">Transfer</button>
                    <button class="kebab-item" onclick="window.prKebabAction('${p.name}', 'Initiate Discharge')">Initiate Discharge</button>
                  </div>
                </div>
              </td>
            </tr>
          `;
        }).join('');
      }

      // Check suggestive dropdown
      let dropdownHtml = '';
      if (query.trim().length >= 2) {
        const q = query.toLowerCase().trim();
        const matches = data.filter(p => 
          p.name.toLowerCase().includes(q) ||
          p.uhid.toLowerCase().includes(q) ||
          p.mobile.includes(q) ||
          (p.bed && p.bed.toLowerCase().includes(q))
        ).slice(0, 6);

        if (matches.length > 0) {
          dropdownHtml = `
            <div class="pr-search-dropdown">
              ${matches.map(m => {
                const initials = m.name.split(' ').map(n=>n[0]).join('').substring(0,2).toUpperCase();
                return `
                  <div class="pr-search-result-row" onclick="window.prSelectDropdownRow('${m.name}')">
                    <div style="display:flex; align-items:center; gap:8px;">
                      <div class="pr-avatar">${initials}</div>
                      <div>
                        <strong style="color:var(--text);">${m.name}</strong>
                        <div style="font-size:11px; color:var(--text2);">${m.type} &bull; ${m.ward} &bull; ${m.bed} &bull; ${m.doctor}</div>
                      </div>
                    </div>
                    <span class="mono" style="font-size:11px; color:var(--text3); font-weight:500;">${m.uhid}</span>
                  </div>
                `;
              }).join('')}
              <div class="pr-dropdown-view-all" onclick="window.prCloseSearchDropdown()">View all results</div>
            </div>
          `;
        }
      }

      panel.innerHTML = `
        ${workspaceStyles}
        <div class="pr-wrap">
          <!-- Summary Dashboard row -->
          ${statsHtml}

          <!-- Filter Tabs -->
          ${tabsHtml}

          <!-- Search + Action Row -->
          <div class="pr-search-row">
            <div class="pr-search-wrapper">
              <span class="pr-search-icon">🔍</span>
              <input type="text" class="pr-search-input" id="pr-search" placeholder="Search by name, UHID, mobile, IP/OP number..." value="${query}" autocomplete="off" oninput="window.prHandleSearch(this.value)">
              ${query ? `<span class="pr-search-clear" onclick="window.prClearSearch()">×</span>` : ''}
              ${dropdownHtml}
            </div>
            <button class="pr-btn-add" onclick="window.prAddPatient()">+ Add New Patient</button>
          </div>

          <!-- Secondary Filters Row -->
          ${dropdownsHtml}

          <!-- Results bar -->
          <div class="pr-results-bar">
            <span>Showing ${filtered.length} patients</span>
            <div style="display:flex; align-items:center; gap:6px;">
              <span>Sort:</span>
              <select class="pr-filter-select" style="height:28px; padding:0 4px; font-size:12px;" onchange="window.prSetSort(this.value)">
                ${['Admission Time ↓', 'Name A–Z', 'UHID', 'Criticality', 'Discharge Time'].map(s => `<option value="${s}" ${sort === s ? 'selected' : ''}>${s}</option>`).join('')}
              </select>
            </div>
          </div>

          <!-- Patient Table -->
          <div class="pr-table-container">
            <table class="pr-table">
              <colgroup>
                <col style="width: 220px;">
                <col style="width: 80px;">
                <col style="width: 160px;">
                <col style="width: 100px;">
                <col style="width: 120px;">
                <col style="width: 110px;">
                <col style="width: 100px;">
                <col style="width: 80px;">
                <col style="width: 80px;">
              </colgroup>
              <thead>
                <tr>
                  <th>Patient</th>
                  <th>Type</th>
                  <th>Dept / Doctor</th>
                  <th>Ward / Bed</th>
                  <th>Payer</th>
                  <th>Status</th>
                  <th>Admitted</th>
                  <th>Flags</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                ${tableBodyHtml}
              </tbody>
            </table>
          </div>
        </div>
      `;

      // Event bindings and keyboard hook for suggestive dropdown
      const searchEl = document.getElementById('pr-search');
      if (searchEl) {
        searchEl.addEventListener('keydown', function(e) {
          const rows = document.querySelectorAll('.pr-search-result-row');
          if (rows.length === 0) return;
          
          let activeIndex = -1;
          rows.forEach((r, i) => {
            if (r.classList.contains('selected')) activeIndex = i;
          });

          if (e.key === 'ArrowDown') {
            e.preventDefault();
            const nextIndex = (activeIndex + 1) % rows.length;
            rows.forEach(r => r.classList.remove('selected'));
            rows[nextIndex].classList.add('selected');
            rows[nextIndex].scrollIntoView({ block: 'nearest' });
          } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            const prevIndex = (activeIndex - 1 + rows.length) % rows.length;
            rows.forEach(r => r.classList.remove('selected'));
            rows[prevIndex].classList.add('selected');
            rows[prevIndex].scrollIntoView({ block: 'nearest' });
          } else if (e.key === 'Enter') {
            e.preventDefault();
            if (activeIndex !== -1) {
              const name = rows[activeIndex].querySelector('strong').textContent;
              window.prSelectDropdownRow(name);
            }
          } else if (e.key === 'Escape') {
            window.prCloseSearchDropdown();
          }
        });
      }
    }

    // Interactive functions mapped to window
    window.prSelectTab = function(tabName) {
      window.activePatientsTab = tabName;
      draw();
    };

    window.prSetFilter = function(filterName, value) {
      window.patientsFilters[filterName] = value;
      draw();
    };

    window.prClearAllFilters = function() {
      window.patientsFilters = { dept: 'All', doctor: 'All', ward: 'All', payer: 'All', dateRange: 'Today', fromDate: '', toDate: '' };
      window.activePatientsTab = 'All';
      window.patientsSearchQuery = '';
      draw();
    };

    window.prSetSort = function(value) {
      window.patientsSort = value;
      draw();
    };

    window.prHandleSearch = function(value) {
      window.patientsSearchQuery = value;
      draw();
    };

    window.prClearSearch = function() {
      window.patientsSearchQuery = '';
      draw();
    };

    window.prCloseSearchDropdown = function() {
      window.patientsSearchQuery = '';
      draw();
    };

    window.prSelectDropdownRow = function(name) {
      window.patientsSearchQuery = '';
      window.prShowToast(`Opening patient record: ${name}...`);
      draw();
    };

    window.prAddPatient = function() {
      window.prShowToast("Opening registration...");
    };

    window.prOpenRecord = function(name) {
      window.prShowToast(`Opening patient record: ${name}...`);
    };

    window.prToggleKebab = function(e, idx) {
      e.stopPropagation();
      // Close any other open kebab menu
      document.querySelectorAll('.kebab-menu').forEach(menu => {
        if (menu.id !== `kebab-menu-${idx}`) {
          menu.style.display = 'none';
        }
      });
      const el = document.getElementById(`kebab-menu-${idx}`);
      if (el) {
        el.style.display = el.style.display === 'none' ? 'flex' : 'none';
      }
    };

    window.prKebabAction = function(name, action) {
      window.prShowToast(`${action} for ${name}...`);
      // Close menu
      document.querySelectorAll('.kebab-menu').forEach(menu => {
        menu.style.display = 'none';
      });
    };

    window.prShowToast = function(message) {
      // Remove any existing toast
      const old = document.getElementById('pr-toast-notification');
      if (old) old.remove();

      const toast = document.createElement('div');
      toast.id = 'pr-toast-notification';
      toast.className = 'pr-toast';
      toast.innerHTML = `<span>🔔</span> <span>${message}</span>`;
      document.body.appendChild(toast);

      setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.25s';
        setTimeout(() => toast.remove(), 250);
      }, 3000);
    };

    // Close kebabs on click outside
    document.addEventListener('click', function() {
      document.querySelectorAll('.kebab-menu').forEach(menu => {
        menu.style.display = 'none';
      });
    });

    draw();
  }
"""

patched_src = src.replace(target_end, PATIENT_RECORDS_IMPLEMENTATION + "\n\n})();", 1)

with open(path, "w", encoding="utf-8") as f:
    f.write(patched_src)

print("SUCCESS: renderPatientRecordsTab inserted into hospMgmtView.js")
