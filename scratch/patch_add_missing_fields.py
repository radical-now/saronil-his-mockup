#!/usr/bin/env python3

path = "/Users/home/Desktop/Saronil IHS/Updated HIS /assets/js/state.js"

with open(path, "r", encoding="utf-8") as f:
    src = f.read()

old_pat_obj = """    const patObj = {
      uhid: `SH-2026-0${patIdNum}`,
      abhaId: `9100-2400-0${patIdNum}`,
      aadhaar: `34567890${patIdNum}`,
      passport: `L7000${patIdNum}`,
      insuranceId: `POL800${patIdNum}`,
      name: `${fn} ${ln}`,
      age: age,
      gender: gender,
      type: config.type,
      mobile: `+91 98450 ${12000 + idx}`,
      email: `${fn.toLowerCase()}.${ln.toLowerCase()}@email.com`,
      address: `Block-${String.fromCharCode(65 + (idx % 6))}, Sector ${3 + idx % 5}, HSR Layout, Bengaluru`,
      bloodGroup: bloodGroup,
      allergies: idx % 10 === 0 ? "Sulfa drugs" : "No Known Allergies",
      pregnancyStatus: "Not Pregnant",
      egfr: 90,
      liverFunction: "Normal",
      emergencyContact: { name: "Relative", relation: "Spouse", phone: `+91 99000 ${12000 + idx}` },
      payer: payers[idx % payers.length],
      payerType: idx % 2 === 0 ? "TPA/Insurance" : "Cash",
      sponsor: idx % 2 === 0 ? "Star Health" : "Self",
      primaryConsultant: doctor.name,
      department: doctor.spec,
      status: config.status,
      vitals: { bp: "120/80", hr: 74, temp: 98.4, spo2: 99, weight: 65, bmi: 22.5, pain: 0, rr: 16 },
      clinicalData: { complaint: "Evaluation checkup", hpi: "None", examination: "NAD", diagnosis: "Evaluation", treatmentPlan: "Symptomatic support", carePlan: "Routine follow-up" },
      history: { pastConditions: "None", surgeries: "None", familyHistory: "None" },
      ward: config.type === "IPD" ? "General Ward" : (config.type === "Daycare" ? "Daycare Bay" : (config.type === "Emergency" ? "Emergency Bay" : "—")),
      bed: config.type === "IPD" ? `B-${idx + 1}` : (config.type === "Daycare" ? `D-${idx + 1}` : (config.type === "Emergency" ? "Resus-2" : "—")),
      insurance: { provider: idx % 2 === 0 ? "Star Health" : "Cash", plan: idx % 2 === 0 ? "Silver Plan" : "" },
      alerts: [],
      lastActivity: "Rounds today",
      prescriptions: [],
      dischargeClearances: { clinical: config.status === "Discharged", billing: config.status === "Discharged", summaryReady: config.status === "Discharged" }
    };"""

new_pat_obj = """    const patObj = {
      uhid: `SH-2026-0${patIdNum}`,
      abhaId: `9100-2400-0${patIdNum}`,
      aadhaar: `34567890${patIdNum}`,
      passport: `L7000${patIdNum}`,
      insuranceId: `POL800${patIdNum}`,
      name: `${fn} ${ln}`,
      age: age,
      gender: gender,
      type: config.type,
      mobile: `+91 98450 ${12000 + idx}`,
      email: `${fn.toLowerCase()}.${ln.toLowerCase()}@email.com`,
      address: `Block-${String.fromCharCode(65 + (idx % 6))}, Sector ${3 + idx % 5}, HSR Layout, Bengaluru`,
      bloodGroup: bloodGroup,
      allergies: idx % 10 === 0 ? "Sulfa drugs" : "No Known Allergies",
      pregnancyStatus: "Not Pregnant",
      egfr: 90,
      liverFunction: "Normal",
      emergencyContact: { name: "Relative", relation: "Spouse", phone: `+91 99000 ${12000 + idx}` },
      payer: payers[idx % payers.length],
      payerType: idx % 2 === 0 ? "TPA/Insurance" : "Cash",
      sponsor: idx % 2 === 0 ? "Star Health" : "Self",
      primaryConsultant: doctor.name,
      department: doctor.spec,
      status: config.status,
      vitals: { bp: "120/80", hr: 74, temp: 98.4, spo2: 99, weight: 65, bmi: 22.5, pain: 0, rr: 16 },
      clinicalData: { complaint: "Evaluation checkup", hpi: "None", examination: "NAD", diagnosis: "Evaluation", treatmentPlan: "Symptomatic support", carePlan: "Routine follow-up" },
      history: { pastConditions: "None", surgeries: "None", familyHistory: "None" },
      ward: config.type === "IPD" ? "General Ward" : (config.type === "Daycare" ? "Daycare Bay" : (config.type === "Emergency" ? "Emergency Bay" : "—")),
      bed: config.type === "IPD" ? `B-${idx + 1}` : (config.type === "Daycare" ? `D-${idx + 1}` : (config.type === "Emergency" ? "Resus-2" : "—")),
      insurance: { provider: idx % 2 === 0 ? "Star Health" : "Cash", plan: idx % 2 === 0 ? "Silver Plan" : "" },
      alerts: [],
      lastActivity: "Rounds today",
      prescriptions: [],
      dischargeClearances: { clinical: config.status === "Discharged", billing: config.status === "Discharged", summaryReady: config.status === "Discharged" },
      flags: idx % 12 === 0 ? ["Critical"] : (idx % 15 === 0 ? ["MLC"] : []),
      los: 1 + idx % 4,
      newsScore: idx % 12 === 0 ? 3 : 0,
      admitted: `28 Jun 2026 · 10:00`,
      ipNumber: config.type === "IPD" ? `IP-240${patIdNum}` : "—",
      opNumber: config.type !== "IPD" ? `OP-240${patIdNum}` : "—",
      vitalsOverdue: false,
      labsUnreviewed: false
    };"""

src = src.replace(old_pat_obj, new_pat_obj, 1)

with open(path, "w", encoding="utf-8") as f:
    f.write(src)

print("SUCCESS: Missing schema fields (flags, los, newsScore, etc.) added to generated patients.")
