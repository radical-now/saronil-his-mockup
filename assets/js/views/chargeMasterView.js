/* ==========================================================================
   SARONIL HMS - CENTRAL CHARGE MASTER MODULE (chargeMasterView.js)
   ========================================================================== */

window.state = window.state || {};
if (!window.state.chargeMaster || !window.state.chargeMaster.items || window.state.chargeMaster.items.length === 0) {
  window.state.chargeMaster = {
    items: [
      // 1. Room Rent & Bed Charges
      {
        code: "ROM001",
        name: "General Ward Male/Female Bed",
        alias: "General Ward Bed",
        category: "Room Rent",
        subCategory: "Ward Charges",
        departments: ["Nursing Ward"],
        description: "Standard general ward bed billing including basic care",
        status: "Active",
        approvalStatus: "Approved",
        sacCode: "999311",
        hsnCode: "",
        taxTreatment: "Exempt",
        gstRate: 0,
        uom: "Per Day",
        minQty: 1,
        defaultQty: 1,
        billingFrequency: "Recurring",
        insuranceBillable: true,
        packageEligible: true,
        discountAllowed: false,
        maxDiscount: 0,
        requireClinicalJustification: false,
        complianceFlag: "None",
        doctorPrices: {},
        payerRates: {
          Standard: { amount: 1500, effectiveFrom: "2025-01-01", effectiveTo: "", approvedBy: "Dr. Amit Verma" },
          CGHS: { amount: 1000, effectiveFrom: "2025-01-01", effectiveTo: "", approvedBy: "Dr. Amit Verma" },
          TPA: { amount: 1400, effectiveFrom: "2025-01-01", effectiveTo: "", approvedBy: "Dr. Amit Verma" }
        }
      },
      {
        code: "ROM002",
        name: "Semi-Private Room Bed (2-Sharing)",
        alias: "Semi-Private Room",
        category: "Room Rent",
        subCategory: "Ward Charges",
        departments: ["Nursing Ward"],
        description: "Twin-sharing air-conditioned room",
        status: "Active",
        approvalStatus: "Approved",
        sacCode: "999311",
        hsnCode: "",
        taxTreatment: "Exempt",
        gstRate: 0,
        uom: "Per Day",
        minQty: 1,
        defaultQty: 1,
        billingFrequency: "Recurring",
        insuranceBillable: true,
        packageEligible: true,
        discountAllowed: false,
        maxDiscount: 0,
        requireClinicalJustification: false,
        complianceFlag: "None",
        doctorPrices: {},
        payerRates: {
          Standard: { amount: 3000, effectiveFrom: "2025-01-01", effectiveTo: "", approvedBy: "Dr. Amit Verma" },
          CGHS: { amount: 2000, effectiveFrom: "2025-01-01", effectiveTo: "", approvedBy: "Dr. Amit Verma" },
          TPA: { amount: 2800, effectiveFrom: "2025-01-01", effectiveTo: "", approvedBy: "Dr. Amit Verma" }
        }
      },
      {
        code: "ROM003",
        name: "Private AC Room Bed",
        alias: "Private AC Room",
        category: "Room Rent",
        subCategory: "Ward Charges",
        departments: ["Nursing Ward"],
        description: "Single occupancy AC room with private bathroom",
        status: "Active",
        approvalStatus: "Approved",
        sacCode: "999311",
        hsnCode: "",
        taxTreatment: "Exempt",
        gstRate: 0,
        uom: "Per Day",
        minQty: 1,
        defaultQty: 1,
        billingFrequency: "Recurring",
        insuranceBillable: true,
        packageEligible: true,
        discountAllowed: false,
        maxDiscount: 0,
        requireClinicalJustification: false,
        complianceFlag: "None",
        doctorPrices: {},
        payerRates: {
          Standard: { amount: 5000, effectiveFrom: "2025-01-01", effectiveTo: "", approvedBy: "Dr. Amit Verma" },
          CGHS: { amount: 3500, effectiveFrom: "2025-01-01", effectiveTo: "", approvedBy: "Dr. Amit Verma" },
          TPA: { amount: 4700, effectiveFrom: "2025-01-01", effectiveTo: "", approvedBy: "Dr. Amit Verma" }
        }
      },
      {
        code: "ROM004",
        name: "Intensive Care Unit (ICU) Bed",
        alias: "ICU Bed Charges",
        category: "Room Rent",
        subCategory: "Critical Care",
        departments: ["Critical Care ICU"],
        description: "High dependency monitoring intensive care unit bed",
        status: "Active",
        approvalStatus: "Approved",
        sacCode: "999311",
        hsnCode: "",
        taxTreatment: "Exempt",
        gstRate: 0,
        uom: "Per Day",
        minQty: 1,
        defaultQty: 1,
        billingFrequency: "Recurring",
        insuranceBillable: true,
        packageEligible: true,
        discountAllowed: false,
        maxDiscount: 0,
        requireClinicalJustification: true,
        complianceFlag: "NABH-Audit",
        doctorPrices: {},
        payerRates: {
          Standard: { amount: 12000, effectiveFrom: "2025-01-01", effectiveTo: "", approvedBy: "Dr. Amit Verma" },
          CGHS: { amount: 7000, effectiveFrom: "2025-01-01", effectiveTo: "", approvedBy: "Dr. Amit Verma" },
          TPA: { amount: 11000, effectiveFrom: "2025-01-01", effectiveTo: "", approvedBy: "Dr. Amit Verma" }
        }
      },

      // 2. Consultation Fees
      {
        code: "CON001",
        name: "General Medicine Consultation Fee",
        alias: "OPD Consultation - Medicine",
        category: "Consultation",
        subCategory: "OPD Visits",
        departments: ["General Medicine"],
        description: "Outpatient clinical consultation with primary physician",
        status: "Active",
        approvalStatus: "Approved",
        sacCode: "999312",
        hsnCode: "",
        taxTreatment: "Exempt",
        gstRate: 0,
        uom: "Per Visit",
        minQty: 1,
        defaultQty: 1,
        billingFrequency: "One-time",
        insuranceBillable: true,
        packageEligible: true,
        discountAllowed: true,
        maxDiscount: 10,
        requireClinicalJustification: false,
        complianceFlag: "None",
        doctorPrices: {
          "Senior Consultant": 700,
          "Consultant": 500,
          "Visiting Consultant": 600
        },
        payerRates: {
          Standard: { amount: 500, effectiveFrom: "2025-01-01", effectiveTo: "", approvedBy: "Dr. Amit Verma" },
          CGHS: { amount: 350, effectiveFrom: "2025-01-01", effectiveTo: "", approvedBy: "Dr. Amit Verma" },
          TPA: { amount: 480, effectiveFrom: "2025-01-01", effectiveTo: "", approvedBy: "Dr. Amit Verma" }
        }
      },
      {
        code: "CON002",
        name: "Cardiology Specialist Consultation Fee",
        alias: "OPD Consultation - Cardiology",
        category: "Consultation",
        subCategory: "OPD Visits",
        departments: ["Cardiology"],
        description: "Super specialist cardiac consultation",
        status: "Active",
        approvalStatus: "Approved",
        sacCode: "999312",
        hsnCode: "",
        taxTreatment: "Exempt",
        gstRate: 0,
        uom: "Per Visit",
        minQty: 1,
        defaultQty: 1,
        billingFrequency: "One-time",
        insuranceBillable: true,
        packageEligible: true,
        discountAllowed: true,
        maxDiscount: 10,
        requireClinicalJustification: false,
        complianceFlag: "None",
        doctorPrices: {
          "Senior Consultant": 1200,
          "Consultant": 800,
          "Visiting Consultant": 1000
        },
        payerRates: {
          Standard: { amount: 800, effectiveFrom: "2025-01-01", effectiveTo: "", approvedBy: "Dr. Amit Verma" },
          CGHS: { amount: 600, effectiveFrom: "2025-01-01", effectiveTo: "", approvedBy: "Dr. Amit Verma" },
          TPA: { amount: 750, effectiveFrom: "2025-01-01", effectiveTo: "", approvedBy: "Dr. Amit Verma" }
        }
      },
      {
        code: "CON003",
        name: "Obstetrics & Gynecology Consultation Fee",
        alias: "OPD Consultation - OBG",
        category: "Consultation",
        subCategory: "OPD Visits",
        departments: ["Gynecology & Obs"],
        description: "OBG specialist consultation for maternity & gynaec needs",
        status: "Active",
        approvalStatus: "Approved",
        sacCode: "999312",
        hsnCode: "",
        taxTreatment: "Exempt",
        gstRate: 0,
        uom: "Per Visit",
        minQty: 1,
        defaultQty: 1,
        billingFrequency: "One-time",
        insuranceBillable: true,
        packageEligible: true,
        discountAllowed: true,
        maxDiscount: 10,
        requireClinicalJustification: false,
        complianceFlag: "None",
        doctorPrices: {
          "Senior Consultant": 1100,
          "Consultant": 800,
          "Visiting Consultant": 900
        },
        payerRates: {
          Standard: { amount: 800, effectiveFrom: "2025-01-01", effectiveTo: "", approvedBy: "Dr. Amit Verma" },
          CGHS: { amount: 600, effectiveFrom: "2025-01-01", effectiveTo: "", approvedBy: "Dr. Amit Verma" },
          TPA: { amount: 750, effectiveFrom: "2025-01-01", effectiveTo: "", approvedBy: "Dr. Amit Verma" }
        }
      },

      // 3. Laboratory Investigations
      {
        code: "LAB001",
        name: "Complete Blood Count (CBC)",
        alias: "CBC Blood Test",
        category: "Laboratory",
        subCategory: "Pathology",
        departments: ["Laboratory Pathology"],
        description: "Analyzes red blood cells, white blood cells, platelets",
        status: "Active",
        approvalStatus: "Approved",
        sacCode: "999316",
        hsnCode: "",
        taxTreatment: "Exempt",
        gstRate: 0,
        uom: "Per Test",
        minQty: 1,
        defaultQty: 1,
        billingFrequency: "One-time",
        insuranceBillable: true,
        packageEligible: true,
        discountAllowed: true,
        maxDiscount: 15,
        requireClinicalJustification: false,
        complianceFlag: "None",
        doctorPrices: {},
        payerRates: {
          Standard: { amount: 350, effectiveFrom: "2025-01-01", effectiveTo: "", approvedBy: "Dr. Amit Verma" },
          CGHS: { amount: 200, effectiveFrom: "2025-01-01", effectiveTo: "", approvedBy: "Dr. Amit Verma" },
          TPA: { amount: 320, effectiveFrom: "2025-01-01", effectiveTo: "", approvedBy: "Dr. Amit Verma" }
        }
      },
      {
        code: "LAB002",
        name: "Liver Function Test (LFT)",
        alias: "LFT Profile",
        category: "Laboratory",
        subCategory: "Biochemistry",
        departments: ["Laboratory Biochemistry"],
        description: "Evaluates liver health (bilirubin, SGOT, SGPT, alkaline phosphatase)",
        status: "Active",
        approvalStatus: "Approved",
        sacCode: "999316",
        hsnCode: "",
        taxTreatment: "Exempt",
        gstRate: 0,
        uom: "Per Test",
        minQty: 1,
        defaultQty: 1,
        billingFrequency: "One-time",
        insuranceBillable: true,
        packageEligible: true,
        discountAllowed: true,
        maxDiscount: 15,
        requireClinicalJustification: false,
        complianceFlag: "None",
        doctorPrices: {},
        payerRates: {
          Standard: { amount: 800, effectiveFrom: "2025-01-01", effectiveTo: "", approvedBy: "Dr. Amit Verma" },
          CGHS: { amount: 500, effectiveFrom: "2025-01-01", effectiveTo: "", approvedBy: "Dr. Amit Verma" },
          TPA: { amount: 750, effectiveFrom: "2025-01-01", effectiveTo: "", approvedBy: "Dr. Amit Verma" }
        }
      },
      {
        code: "LAB003",
        name: "Kidney Function Test (KFT)",
        alias: "KFT Profile",
        category: "Laboratory",
        subCategory: "Biochemistry",
        departments: ["Laboratory Biochemistry"],
        description: "Assesses renal urea, creatinine, uric acid, electrolytes",
        status: "Active",
        approvalStatus: "Approved",
        sacCode: "999316",
        hsnCode: "",
        taxTreatment: "Exempt",
        gstRate: 0,
        uom: "Per Test",
        minQty: 1,
        defaultQty: 1,
        billingFrequency: "One-time",
        insuranceBillable: true,
        packageEligible: true,
        discountAllowed: true,
        maxDiscount: 15,
        requireClinicalJustification: false,
        complianceFlag: "None",
        doctorPrices: {},
        payerRates: {
          Standard: { amount: 750, effectiveFrom: "2025-01-01", effectiveTo: "", approvedBy: "Dr. Amit Verma" },
          CGHS: { amount: 480, effectiveFrom: "2025-01-01", effectiveTo: "", approvedBy: "Dr. Amit Verma" },
          TPA: { amount: 700, effectiveFrom: "2025-01-01", effectiveTo: "", approvedBy: "Dr. Amit Verma" }
        }
      },

      // 4. Radiology Investigations
      {
        code: "RAD001",
        name: "Chest X-Ray PA View",
        alias: "Chest Xray PA",
        category: "Radiology",
        subCategory: "X-Ray",
        departments: ["Radiology Diagnostic"],
        description: "Digital radiographic chest projection",
        status: "Active",
        approvalStatus: "Approved",
        sacCode: "999315",
        hsnCode: "",
        taxTreatment: "Exempt",
        gstRate: 0,
        uom: "Per Exposure",
        minQty: 1,
        defaultQty: 1,
        billingFrequency: "One-time",
        insuranceBillable: true,
        packageEligible: true,
        discountAllowed: true,
        maxDiscount: 10,
        requireClinicalJustification: false,
        complianceFlag: "None",
        doctorPrices: {},
        payerRates: {
          Standard: { amount: 600, effectiveFrom: "2025-01-01", effectiveTo: "", approvedBy: "Dr. Amit Verma" },
          CGHS: { amount: 350, effectiveFrom: "2025-01-01", effectiveTo: "", approvedBy: "Dr. Amit Verma" },
          TPA: { amount: 550, effectiveFrom: "2025-01-01", effectiveTo: "", approvedBy: "Dr. Amit Verma" }
        }
      },
      {
        code: "RAD002",
        name: "CT Scan Brain (Contrast)",
        alias: "CT Brain Contrast",
        category: "Radiology",
        subCategory: "CT Scan",
        departments: ["Radiology CT"],
        description: "Computed tomography scan of brain using non-ionic contrast",
        status: "Active",
        approvalStatus: "Approved",
        sacCode: "999315",
        hsnCode: "",
        taxTreatment: "Exempt",
        gstRate: 0,
        uom: "Per Scan",
        minQty: 1,
        defaultQty: 1,
        billingFrequency: "One-time",
        insuranceBillable: true,
        packageEligible: true,
        discountAllowed: true,
        maxDiscount: 10,
        requireClinicalJustification: true,
        complianceFlag: "None",
        doctorPrices: {},
        payerRates: {
          Standard: { amount: 6500, effectiveFrom: "2025-01-01", effectiveTo: "", approvedBy: "Dr. Amit Verma" },
          CGHS: { amount: 4500, effectiveFrom: "2025-01-01", effectiveTo: "", approvedBy: "Dr. Amit Verma" },
          TPA: { amount: 6000, effectiveFrom: "2025-01-01", effectiveTo: "", approvedBy: "Dr. Amit Verma" }
        }
      },
      {
        code: "RAD003",
        name: "MRI Knee Joint (Right/Left)",
        alias: "MRI Knee",
        category: "Radiology",
        subCategory: "MRI",
        departments: ["Radiology MRI"],
        description: "Magnetic resonance imaging of knee ligament structure",
        status: "Active",
        approvalStatus: "Approved",
        sacCode: "999315",
        hsnCode: "",
        taxTreatment: "Exempt",
        gstRate: 0,
        uom: "Per Scan",
        minQty: 1,
        defaultQty: 1,
        billingFrequency: "One-time",
        insuranceBillable: true,
        packageEligible: true,
        discountAllowed: true,
        maxDiscount: 10,
        requireClinicalJustification: true,
        complianceFlag: "None",
        doctorPrices: {},
        payerRates: {
          Standard: { amount: 8000, effectiveFrom: "2025-01-01", effectiveTo: "", approvedBy: "Dr. Amit Verma" },
          CGHS: { amount: 5500, effectiveFrom: "2025-01-01", effectiveTo: "", approvedBy: "Dr. Amit Verma" },
          TPA: { amount: 7500, effectiveFrom: "2025-01-01", effectiveTo: "", approvedBy: "Dr. Amit Verma" }
        }
      },

      // 5. Operating Theatre & Procedures
      {
        code: "PRC001",
        name: "Operating Theatre Usage Fee (First Hour)",
        alias: "OT Charges - Hour 1",
        category: "Procedures",
        subCategory: "Surgical OT",
        departments: ["Operation Theatre"],
        description: "First hour theatre occupancy charge",
        status: "Active",
        approvalStatus: "Approved",
        sacCode: "999311",
        hsnCode: "",
        taxTreatment: "Exempt",
        gstRate: 0,
        uom: "Per Hour",
        minQty: 1,
        defaultQty: 1,
        billingFrequency: "One-time",
        insuranceBillable: true,
        packageEligible: true,
        discountAllowed: false,
        maxDiscount: 0,
        requireClinicalJustification: false,
        complianceFlag: "None",
        doctorPrices: {},
        payerRates: {
          Standard: { amount: 8000, effectiveFrom: "2025-01-01", effectiveTo: "", approvedBy: "Dr. Amit Verma" },
          CGHS: { amount: 5000, effectiveFrom: "2025-01-01", effectiveTo: "", approvedBy: "Dr. Amit Verma" },
          TPA: { amount: 7500, effectiveFrom: "2025-01-01", effectiveTo: "", approvedBy: "Dr. Amit Verma" }
        }
      },
      {
        code: "PRC002",
        name: "Laparoscopic Cholecystectomy (CPT 47562)",
        alias: "Lap Cholecystectomy Surgery",
        category: "Procedures",
        subCategory: "Surgical OT",
        departments: ["General Surgery"],
        description: "Vesicle removal procedure under general anesthesia",
        status: "Active",
        approvalStatus: "Approved",
        sacCode: "999311",
        hsnCode: "",
        taxTreatment: "Exempt",
        gstRate: 0,
        uom: "Per Procedure",
        minQty: 1,
        defaultQty: 1,
        billingFrequency: "One-time",
        insuranceBillable: true,
        packageEligible: true,
        discountAllowed: true,
        maxDiscount: 5,
        requireClinicalJustification: false,
        complianceFlag: "NABH-Audit",
        doctorPrices: {
          "Senior Consultant": 25000,
          "Consultant": 20000,
          "Visiting Consultant": 22000
        },
        payerRates: {
          Standard: { amount: 20000, effectiveFrom: "2025-01-01", effectiveTo: "", approvedBy: "Dr. Amit Verma" },
          CGHS: { amount: 15000, effectiveFrom: "2025-01-01", effectiveTo: "", approvedBy: "Dr. Amit Verma" },
          TPA: { amount: 19000, effectiveFrom: "2025-01-01", effectiveTo: "", approvedBy: "Dr. Amit Verma" }
        }
      },
      {
        code: "PRC003",
        name: "Emergency Lower Segment Caesarean Section (LSCS)",
        alias: "Emergency C-Section LSCS",
        category: "Procedures",
        subCategory: "Surgical OT",
        departments: ["Gynecology & Obs"],
        description: "Emergency abdominal delivery method",
        status: "Active",
        approvalStatus: "Approved",
        sacCode: "999311",
        hsnCode: "",
        taxTreatment: "Exempt",
        gstRate: 0,
        uom: "Per Procedure",
        minQty: 1,
        defaultQty: 1,
        billingFrequency: "One-time",
        insuranceBillable: true,
        packageEligible: true,
        discountAllowed: true,
        maxDiscount: 5,
        requireClinicalJustification: false,
        complianceFlag: "NABH-Audit",
        doctorPrices: {
          "Senior Consultant": 30000,
          "Consultant": 25000,
          "Visiting Consultant": 28000
        },
        payerRates: {
          Standard: { amount: 25000, effectiveFrom: "2025-01-01", effectiveTo: "", approvedBy: "Dr. Amit Verma" },
          CGHS: { amount: 18000, effectiveFrom: "2025-01-01", effectiveTo: "", approvedBy: "Dr. Amit Verma" },
          TPA: { amount: 23000, effectiveFrom: "2025-01-01", effectiveTo: "", approvedBy: "Dr. Amit Verma" }
        }
      },
      {
        code: "PRC004",
        name: "Total Knee Arthroplasty (CPT 27447)",
        alias: "Total Knee Replacement",
        category: "Procedures",
        subCategory: "Surgical OT",
        departments: ["Orthopedics"],
        description: "Reconstruction of diseased knee joint with prosthetic components",
        status: "Active",
        approvalStatus: "Approved",
        sacCode: "999311",
        hsnCode: "",
        taxTreatment: "Exempt",
        gstRate: 0,
        uom: "Per Procedure",
        minQty: 1,
        defaultQty: 1,
        billingFrequency: "One-time",
        insuranceBillable: true,
        packageEligible: true,
        discountAllowed: true,
        maxDiscount: 5,
        requireClinicalJustification: false,
        complianceFlag: "NABH-Audit",
        doctorPrices: {
          "Senior Consultant": 45000,
          "Consultant": 38000,
          "Visiting Consultant": 40000
        },
        payerRates: {
          Standard: { amount: 38000, effectiveFrom: "2025-01-01", effectiveTo: "", approvedBy: "Dr. Amit Verma" },
          CGHS: { amount: 28000, effectiveFrom: "2025-01-01", effectiveTo: "", approvedBy: "Dr. Amit Verma" },
          TPA: { amount: 35000, effectiveFrom: "2025-01-01", effectiveTo: "", approvedBy: "Dr. Amit Verma" }
        }
      },

      // 6. Consumables & Surgical Packs
      {
        code: "CSM001",
        name: "Standard OT Surgical Disposables Pack",
        alias: "Surgical Disposables Pack",
        category: "Consumables",
        subCategory: "Surgical Consumables",
        departments: ["Operation Theatre"],
        description: "Sterile surgical drapes, gown, cap, mask, gloves kit",
        status: "Active",
        approvalStatus: "Approved",
        sacCode: "",
        hsnCode: "300590",
        taxTreatment: "Exempt",
        gstRate: 0,
        uom: "Per Pack",
        minQty: 1,
        defaultQty: 1,
        billingFrequency: "One-time",
        insuranceBillable: true,
        packageEligible: true,
        discountAllowed: false,
        maxDiscount: 0,
        requireClinicalJustification: false,
        complianceFlag: "None",
        doctorPrices: {},
        payerRates: {
          Standard: { amount: 2500, effectiveFrom: "2025-01-01", effectiveTo: "", approvedBy: "Dr. Amit Verma" },
          CGHS: { amount: 1800, effectiveFrom: "2025-01-01", effectiveTo: "", approvedBy: "Dr. Amit Verma" },
          TPA: { amount: 2300, effectiveFrom: "2025-01-01", effectiveTo: "", approvedBy: "Dr. Amit Verma" }
        }
      },
      {
        code: "CSM002",
        name: "Laparoscopic Clip Cartridge (Titanium)",
        alias: "Lap Clips",
        category: "Consumables",
        subCategory: "Surgical Consumables",
        departments: ["Operation Theatre"],
        description: "Cartridge of medium-large mechanical ligation clips",
        status: "Active",
        approvalStatus: "Approved",
        sacCode: "",
        hsnCode: "901890",
        taxTreatment: "Taxable",
        gstRate: 12,
        uom: "Per Piece",
        minQty: 1,
        defaultQty: 1,
        billingFrequency: "One-time",
        insuranceBillable: true,
        packageEligible: true,
        discountAllowed: false,
        maxDiscount: 0,
        requireClinicalJustification: false,
        complianceFlag: "None",
        doctorPrices: {},
        payerRates: {
          Standard: { amount: 2200, effectiveFrom: "2025-01-01", effectiveTo: "", approvedBy: "Dr. Amit Verma" },
          CGHS: { amount: 1600, effectiveFrom: "2025-01-01", effectiveTo: "", approvedBy: "Dr. Amit Verma" },
          TPA: { amount: 2000, effectiveFrom: "2025-01-01", effectiveTo: "", approvedBy: "Dr. Amit Verma" }
        }
      },
      {
        code: "CSM003",
        name: "Vicryl 2-0 Absorbable Suture",
        alias: "Vicryl 2-0",
        category: "Consumables",
        subCategory: "Sutures",
        departments: ["Operation Theatre"],
        description: "Polyglactin 910 braided absorbable suture",
        status: "Active",
        approvalStatus: "Approved",
        sacCode: "",
        hsnCode: "300610",
        taxTreatment: "Taxable",
        gstRate: 12,
        uom: "Per Box/12",
        minQty: 1,
        defaultQty: 1,
        billingFrequency: "One-time",
        insuranceBillable: true,
        packageEligible: true,
        discountAllowed: false,
        maxDiscount: 0,
        requireClinicalJustification: false,
        complianceFlag: "None",
        doctorPrices: {},
        payerRates: {
          Standard: { amount: 850, effectiveFrom: "2025-01-01", effectiveTo: "", approvedBy: "Dr. Amit Verma" },
          CGHS: { amount: 650, effectiveFrom: "2025-01-01", effectiveTo: "", approvedBy: "Dr. Amit Verma" },
          TPA: { amount: 800, effectiveFrom: "2025-01-01", effectiveTo: "", approvedBy: "Dr. Amit Verma" }
        }
      },

      // 7. Premium Implants
      {
        code: "IMP001",
        name: "Titanium Co-Cr Knee Joint Prosthesis",
        alias: "Knee Replacement Implant",
        category: "Implants",
        subCategory: "Orthopaedic Implants",
        departments: ["Orthopedics"],
        description: "Bicondylar cobalt-chromium knee arthroplasty joint system",
        status: "Active",
        approvalStatus: "Approved",
        sacCode: "",
        hsnCode: "902131",
        taxTreatment: "Taxable",
        gstRate: 5,
        uom: "Per Implant Set",
        minQty: 1,
        defaultQty: 1,
        billingFrequency: "One-time",
        insuranceBillable: true,
        packageEligible: false,
        discountAllowed: false,
        maxDiscount: 0,
        requireClinicalJustification: true,
        complianceFlag: "None",
        doctorPrices: {},
        payerRates: {
          Standard: { amount: 65000, effectiveFrom: "2025-01-01", effectiveTo: "", approvedBy: "Dr. Amit Verma" },
          CGHS: { amount: 55000, effectiveFrom: "2025-01-01", effectiveTo: "", approvedBy: "Dr. Amit Verma" },
          TPA: { amount: 62000, effectiveFrom: "2025-01-01", effectiveTo: "", approvedBy: "Dr. Amit Verma" }
        }
      },
      {
        code: "IMP002",
        name: "Drug Eluting Coronary Stent (DES)",
        alias: "Coronary Stent DES",
        category: "Implants",
        subCategory: "Cardiac Stents",
        departments: ["Cardiology"],
        description: "Everolimus eluting cobalt chromium coronary scaffold stent",
        status: "Active",
        approvalStatus: "Approved",
        sacCode: "",
        hsnCode: "902190",
        taxTreatment: "Taxable",
        gstRate: 5,
        uom: "Per Piece",
        minQty: 1,
        defaultQty: 1,
        billingFrequency: "One-time",
        insuranceBillable: true,
        packageEligible: false,
        discountAllowed: false,
        maxDiscount: 0,
        requireClinicalJustification: true,
        complianceFlag: "None",
        doctorPrices: {},
        payerRates: {
          Standard: { amount: 45000, effectiveFrom: "2025-01-01", effectiveTo: "", approvedBy: "Dr. Amit Verma" },
          CGHS: { amount: 35000, effectiveFrom: "2025-01-01", effectiveTo: "", approvedBy: "Dr. Amit Verma" },
          TPA: { amount: 42000, effectiveFrom: "2025-01-01", effectiveTo: "", approvedBy: "Dr. Amit Verma" }
        }
      },

      // 8. Pharmacy Medications
      {
        code: "PHA001",
        name: "Inj. Fentanyl Citrate 100 mcg / 2ml Ampoule",
        alias: "Inj Fentanyl 100mcg",
        category: "Pharmacy",
        subCategory: "Narcotics",
        departments: ["Operation Theatre", "Pharmacy"],
        description: "Opioid analgesic prescription drug (Schedules H1/G)",
        status: "Active",
        approvalStatus: "Approved",
        sacCode: "",
        hsnCode: "300490",
        taxTreatment: "Taxable",
        gstRate: 12,
        uom: "Per Ampoule",
        minQty: 1,
        defaultQty: 1,
        billingFrequency: "One-time",
        insuranceBillable: true,
        packageEligible: true,
        discountAllowed: false,
        maxDiscount: 0,
        requireClinicalJustification: true,
        complianceFlag: "Narcotic-Sign",
        doctorPrices: {},
        payerRates: {
          Standard: { amount: 180, effectiveFrom: "2025-01-01", effectiveTo: "", approvedBy: "Dr. Amit Verma" },
          CGHS: { amount: 180, effectiveFrom: "2025-01-01", effectiveTo: "", approvedBy: "Dr. Amit Verma" },
          TPA: { amount: 180, effectiveFrom: "2025-01-01", effectiveTo: "", approvedBy: "Dr. Amit Verma" }
        }
      },
      {
        code: "PHA002",
        name: "Inj. Propofol 1% 20ml Vial",
        alias: "Inj Propofol 20ml",
        category: "Pharmacy",
        subCategory: "Anaesthesia Drugs",
        departments: ["Operation Theatre", "Pharmacy"],
        description: "Short-acting intravenous anaesthetic agent",
        status: "Active",
        approvalStatus: "Approved",
        sacCode: "",
        hsnCode: "300490",
        taxTreatment: "Taxable",
        gstRate: 12,
        uom: "Per Vial",
        minQty: 1,
        defaultQty: 1,
        billingFrequency: "One-time",
        insuranceBillable: true,
        packageEligible: true,
        discountAllowed: false,
        maxDiscount: 0,
        requireClinicalJustification: false,
        complianceFlag: "None",
        doctorPrices: {},
        payerRates: {
          Standard: { amount: 450, effectiveFrom: "2025-01-01", effectiveTo: "", approvedBy: "Dr. Amit Verma" },
          CGHS: { amount: 350, effectiveFrom: "2025-01-01", effectiveTo: "", approvedBy: "Dr. Amit Verma" },
          TPA: { amount: 420, effectiveFrom: "2025-01-01", effectiveTo: "", approvedBy: "Dr. Amit Verma" }
        }
      },

      // Additional Rooms (ROM005 - ROM006)
      {
        code: "ROM005",
        name: "Deluxe Private Suite Bed",
        alias: "Deluxe Suite",
        category: "Room Rent",
        subCategory: "Suite Charges",
        departments: ["Nursing Ward"],
        description: "Premium single occupancy suite with attached lounge and pantry",
        status: "Active",
        approvalStatus: "Approved",
        sacCode: "999311",
        hsnCode: "",
        taxTreatment: "Exempt",
        gstRate: 0,
        uom: "Per Day",
        minQty: 1,
        defaultQty: 1,
        billingFrequency: "Recurring",
        insuranceBillable: true,
        packageEligible: true,
        discountAllowed: false,
        maxDiscount: 0,
        requireClinicalJustification: false,
        complianceFlag: "None",
        doctorPrices: {},
        payerRates: {
          Standard: { amount: 9000, effectiveFrom: "2025-01-01", effectiveTo: "", approvedBy: "Dr. Amit Verma" },
          CGHS: { amount: 6000, effectiveFrom: "2025-01-01", effectiveTo: "", approvedBy: "Dr. Amit Verma" },
          TPA: { amount: 8500, effectiveFrom: "2025-01-01", effectiveTo: "", approvedBy: "Dr. Amit Verma" }
        }
      },
      {
        code: "ROM006",
        name: "Daycare Ward Bed",
        alias: "Daycare Bed",
        category: "Room Rent",
        subCategory: "Ward Charges",
        departments: ["Daycare Unit"],
        description: "Standard bed occupancy for short stay / minor procedures (< 8 hours)",
        status: "Active",
        approvalStatus: "Approved",
        sacCode: "999311",
        hsnCode: "",
        taxTreatment: "Exempt",
        gstRate: 0,
        uom: "Per Day",
        minQty: 1,
        defaultQty: 1,
        billingFrequency: "One-time",
        insuranceBillable: true,
        packageEligible: true,
        discountAllowed: false,
        maxDiscount: 0,
        requireClinicalJustification: false,
        complianceFlag: "None",
        doctorPrices: {},
        payerRates: {
          Standard: { amount: 1000, effectiveFrom: "2025-01-01", effectiveTo: "", approvedBy: "Dr. Amit Verma" },
          CGHS: { amount: 700, effectiveFrom: "2025-01-01", effectiveTo: "", approvedBy: "Dr. Amit Verma" },
          TPA: { amount: 900, effectiveFrom: "2025-01-01", effectiveTo: "", approvedBy: "Dr. Amit Verma" }
        }
      },

      // Additional Consultations (CON004 - CON007)
      {
        code: "CON004",
        name: "Pediatric Specialist Consultation Fee",
        alias: "OPD Consultation - Pediatrics",
        category: "Consultation",
        subCategory: "OPD Visits",
        departments: ["Pediatrics"],
        description: "Specialist consultation for pediatric care",
        status: "Active",
        approvalStatus: "Approved",
        sacCode: "999312",
        hsnCode: "",
        taxTreatment: "Exempt",
        gstRate: 0,
        uom: "Per Visit",
        minQty: 1,
        defaultQty: 1,
        billingFrequency: "One-time",
        insuranceBillable: true,
        packageEligible: true,
        discountAllowed: true,
        maxDiscount: 10,
        requireClinicalJustification: false,
        complianceFlag: "None",
        doctorPrices: {
          "Senior Consultant": 800,
          "Consultant": 500,
          "Visiting Consultant": 650
        },
        payerRates: {
          Standard: { amount: 500, effectiveFrom: "2025-01-01", effectiveTo: "", approvedBy: "Dr. Amit Verma" },
          CGHS: { amount: 350, effectiveFrom: "2025-01-01", effectiveTo: "", approvedBy: "Dr. Amit Verma" },
          TPA: { amount: 480, effectiveFrom: "2025-01-01", effectiveTo: "", approvedBy: "Dr. Amit Verma" }
        }
      },
      {
        code: "CON005",
        name: "Neurology Specialist Consultation Fee",
        alias: "OPD Consultation - Neurology",
        category: "Consultation",
        subCategory: "OPD Visits",
        departments: ["Neurology"],
        description: "OPD consultation for neurological disorders",
        status: "Active",
        approvalStatus: "Approved",
        sacCode: "999312",
        hsnCode: "",
        taxTreatment: "Exempt",
        gstRate: 0,
        uom: "Per Visit",
        minQty: 1,
        defaultQty: 1,
        billingFrequency: "One-time",
        insuranceBillable: true,
        packageEligible: true,
        discountAllowed: true,
        maxDiscount: 10,
        requireClinicalJustification: false,
        complianceFlag: "None",
        doctorPrices: {
          "Senior Consultant": 1500,
          "Consultant": 1000,
          "Visiting Consultant": 1200
        },
        payerRates: {
          Standard: { amount: 1000, effectiveFrom: "2025-01-01", effectiveTo: "", approvedBy: "Dr. Amit Verma" },
          CGHS: { amount: 750, effectiveFrom: "2025-01-01", effectiveTo: "", approvedBy: "Dr. Amit Verma" },
          TPA: { amount: 950, effectiveFrom: "2025-01-01", effectiveTo: "", approvedBy: "Dr. Amit Verma" }
        }
      },
      {
        code: "CON006",
        name: "Emergency Room (ER) Medical Officer Fee",
        alias: "ER Consultation",
        category: "Consultation",
        subCategory: "Emergency Visits",
        departments: ["Emergency Medicine"],
        description: "Initial evaluation fee by medical officer in emergency room",
        status: "Active",
        approvalStatus: "Approved",
        sacCode: "999312",
        hsnCode: "",
        taxTreatment: "Exempt",
        gstRate: 0,
        uom: "Per Visit",
        minQty: 1,
        defaultQty: 1,
        billingFrequency: "One-time",
        insuranceBillable: true,
        packageEligible: true,
        discountAllowed: false,
        maxDiscount: 0,
        requireClinicalJustification: false,
        complianceFlag: "None",
        doctorPrices: {},
        payerRates: {
          Standard: { amount: 600, effectiveFrom: "2025-01-01", effectiveTo: "", approvedBy: "Dr. Amit Verma" },
          CGHS: { amount: 450, effectiveFrom: "2025-01-01", effectiveTo: "", approvedBy: "Dr. Amit Verma" },
          TPA: { amount: 550, effectiveFrom: "2025-01-01", effectiveTo: "", approvedBy: "Dr. Amit Verma" }
        }
      },
      {
        code: "CON007",
        name: "OPD Consultation Follow-up Visit",
        alias: "OPD Follow-up",
        category: "Consultation",
        subCategory: "OPD Visits",
        departments: ["General Medicine"],
        description: "OPD follow-up visit (valid within 7 days of initial consultation)",
        status: "Active",
        approvalStatus: "Approved",
        sacCode: "999312",
        hsnCode: "",
        taxTreatment: "Exempt",
        gstRate: 0,
        uom: "Per Visit",
        minQty: 1,
        defaultQty: 1,
        billingFrequency: "One-time",
        insuranceBillable: true,
        packageEligible: true,
        discountAllowed: true,
        maxDiscount: 10,
        requireClinicalJustification: false,
        complianceFlag: "None",
        doctorPrices: {},
        payerRates: {
          Standard: { amount: 200, effectiveFrom: "2025-01-01", effectiveTo: "", approvedBy: "Dr. Amit Verma" },
          CGHS: { amount: 150, effectiveFrom: "2025-01-01", effectiveTo: "", approvedBy: "Dr. Amit Verma" },
          TPA: { amount: 180, effectiveFrom: "2025-01-01", effectiveTo: "", approvedBy: "Dr. Amit Verma" }
        }
      },

      // Additional Labs (LAB004 - LAB008)
      {
        code: "LAB004",
        name: "Lipid Profile (Cholesterol, HDL, LDL, Triglycerides)",
        alias: "Lipid Profile",
        category: "Laboratory",
        subCategory: "Biochemistry",
        departments: ["Laboratory Biochemistry"],
        description: "Evaluates standard serum lipids",
        status: "Active",
        approvalStatus: "Approved",
        sacCode: "999316",
        hsnCode: "",
        taxTreatment: "Exempt",
        gstRate: 0,
        uom: "Per Test",
        minQty: 1,
        defaultQty: 1,
        billingFrequency: "One-time",
        insuranceBillable: true,
        packageEligible: true,
        discountAllowed: true,
        maxDiscount: 15,
        requireClinicalJustification: false,
        complianceFlag: "None",
        doctorPrices: {},
        payerRates: {
          Standard: { amount: 600, effectiveFrom: "2025-01-01", effectiveTo: "", approvedBy: "Dr. Amit Verma" },
          CGHS: { amount: 400, effectiveFrom: "2025-01-01", effectiveTo: "", approvedBy: "Dr. Amit Verma" },
          TPA: { amount: 550, effectiveFrom: "2025-01-01", effectiveTo: "", approvedBy: "Dr. Amit Verma" }
        }
      },
      {
        code: "LAB005",
        name: "HbA1c (Glycated Haemoglobin)",
        alias: "HbA1c Blood Test",
        category: "Laboratory",
        subCategory: "Biochemistry",
        departments: ["Laboratory Biochemistry"],
        description: "Measures average blood sugar levels over the past 3 months",
        status: "Active",
        approvalStatus: "Approved",
        sacCode: "999316",
        hsnCode: "",
        taxTreatment: "Exempt",
        gstRate: 0,
        uom: "Per Test",
        minQty: 1,
        defaultQty: 1,
        billingFrequency: "One-time",
        insuranceBillable: true,
        packageEligible: true,
        discountAllowed: true,
        maxDiscount: 15,
        requireClinicalJustification: false,
        complianceFlag: "None",
        doctorPrices: {},
        payerRates: {
          Standard: { amount: 450, effectiveFrom: "2025-01-01", effectiveTo: "", approvedBy: "Dr. Amit Verma" },
          CGHS: { amount: 300, effectiveFrom: "2025-01-01", effectiveTo: "", approvedBy: "Dr. Amit Verma" },
          TPA: { amount: 400, effectiveFrom: "2025-01-01", effectiveTo: "", approvedBy: "Dr. Amit Verma" }
        }
      },
      {
        code: "LAB006",
        name: "Thyroid Profile (T3, T4, TSH)",
        alias: "Thyroid Panel",
        category: "Laboratory",
        subCategory: "Biochemistry",
        departments: ["Laboratory Biochemistry"],
        description: "Assesses thyroid gland function",
        status: "Active",
        approvalStatus: "Approved",
        sacCode: "999316",
        hsnCode: "",
        taxTreatment: "Exempt",
        gstRate: 0,
        uom: "Per Test",
        minQty: 1,
        defaultQty: 1,
        billingFrequency: "One-time",
        insuranceBillable: true,
        packageEligible: true,
        discountAllowed: true,
        maxDiscount: 15,
        requireClinicalJustification: false,
        complianceFlag: "None",
        doctorPrices: {},
        payerRates: {
          Standard: { amount: 800, effectiveFrom: "2025-01-01", effectiveTo: "", approvedBy: "Dr. Amit Verma" },
          CGHS: { amount: 500, effectiveFrom: "2025-01-01", effectiveTo: "", approvedBy: "Dr. Amit Verma" },
          TPA: { amount: 720, effectiveFrom: "2025-01-01", effectiveTo: "", approvedBy: "Dr. Amit Verma" }
        }
      },
      {
        code: "LAB007",
        name: "Blood Sugar Fasting / Post Prandial",
        alias: "Fasting PP Blood Sugar",
        category: "Laboratory",
        subCategory: "Biochemistry",
        departments: ["Laboratory Biochemistry"],
        description: "Standard plasma glucose screening test",
        status: "Active",
        approvalStatus: "Approved",
        sacCode: "999316",
        hsnCode: "",
        taxTreatment: "Exempt",
        gstRate: 0,
        uom: "Per Test",
        minQty: 1,
        defaultQty: 1,
        billingFrequency: "One-time",
        insuranceBillable: true,
        packageEligible: true,
        discountAllowed: true,
        maxDiscount: 15,
        requireClinicalJustification: false,
        complianceFlag: "None",
        doctorPrices: {},
        payerRates: {
          Standard: { amount: 100, effectiveFrom: "2025-01-01", effectiveTo: "", approvedBy: "Dr. Amit Verma" },
          CGHS: { amount: 60, effectiveFrom: "2025-01-01", effectiveTo: "", approvedBy: "Dr. Amit Verma" },
          TPA: { amount: 90, effectiveFrom: "2025-01-01", effectiveTo: "", approvedBy: "Dr. Amit Verma" }
        }
      },
      {
        code: "LAB008",
        name: "Urine Routine & Microscopy",
        alias: "Urine RE",
        category: "Laboratory",
        subCategory: "Clinical Pathology",
        departments: ["Laboratory Clinical Pathology"],
        description: "Physical, chemical, and microscopic examination of urine",
        status: "Active",
        approvalStatus: "Approved",
        sacCode: "999316",
        hsnCode: "",
        taxTreatment: "Exempt",
        gstRate: 0,
        uom: "Per Test",
        minQty: 1,
        defaultQty: 1,
        billingFrequency: "One-time",
        insuranceBillable: true,
        packageEligible: true,
        discountAllowed: true,
        maxDiscount: 15,
        requireClinicalJustification: false,
        complianceFlag: "None",
        doctorPrices: {},
        payerRates: {
          Standard: { amount: 200, effectiveFrom: "2025-01-01", effectiveTo: "", approvedBy: "Dr. Amit Verma" },
          CGHS: { amount: 120, effectiveFrom: "2025-01-01", effectiveTo: "", approvedBy: "Dr. Amit Verma" },
          TPA: { amount: 180, effectiveFrom: "2025-01-01", effectiveTo: "", approvedBy: "Dr. Amit Verma" }
        }
      },

      // Additional Radiology (RAD004 - RAD006)
      {
        code: "RAD004",
        name: "Ultrasonography (USG) Abdomen & Pelvis",
        alias: "USG Whole Abdomen",
        category: "Radiology",
        subCategory: "Ultrasound",
        departments: ["Radiology USG"],
        description: "Whole abdomen diagnostic ultrasound mapping",
        status: "Active",
        approvalStatus: "Approved",
        sacCode: "999315",
        hsnCode: "",
        taxTreatment: "Exempt",
        gstRate: 0,
        uom: "Per Scan",
        minQty: 1,
        defaultQty: 1,
        billingFrequency: "One-time",
        insuranceBillable: true,
        packageEligible: true,
        discountAllowed: true,
        maxDiscount: 10,
        requireClinicalJustification: false,
        complianceFlag: "None",
        doctorPrices: {},
        payerRates: {
          Standard: { amount: 1500, effectiveFrom: "2025-01-01", effectiveTo: "", approvedBy: "Dr. Amit Verma" },
          CGHS: { amount: 1000, effectiveFrom: "2025-01-01", effectiveTo: "", approvedBy: "Dr. Amit Verma" },
          TPA: { amount: 1400, effectiveFrom: "2025-01-01", effectiveTo: "", approvedBy: "Dr. Amit Verma" }
        }
      },
      {
        code: "RAD005",
        name: "HRCT Chest (High Resolution CT)",
        alias: "HRCT Chest Scan",
        category: "Radiology",
        subCategory: "CT Scan",
        departments: ["Radiology CT"],
        description: "High resolution computed tomography scan of the lungs",
        status: "Active",
        approvalStatus: "Approved",
        sacCode: "999315",
        hsnCode: "",
        taxTreatment: "Exempt",
        gstRate: 0,
        uom: "Per Scan",
        minQty: 1,
        defaultQty: 1,
        billingFrequency: "One-time",
        insuranceBillable: true,
        packageEligible: true,
        discountAllowed: true,
        maxDiscount: 10,
        requireClinicalJustification: true,
        complianceFlag: "None",
        doctorPrices: {},
        payerRates: {
          Standard: { amount: 5000, effectiveFrom: "2025-01-01", effectiveTo: "", approvedBy: "Dr. Amit Verma" },
          CGHS: { amount: 3500, effectiveFrom: "2025-01-01", effectiveTo: "", approvedBy: "Dr. Amit Verma" },
          TPA: { amount: 4700, effectiveFrom: "2025-01-01", effectiveTo: "", approvedBy: "Dr. Amit Verma" }
        }
      },
      {
        code: "RAD006",
        name: "MRI Brain / Head (Plain)",
        alias: "MRI Brain Plain",
        category: "Radiology",
        subCategory: "MRI",
        departments: ["Radiology MRI"],
        description: "Magnetic resonance imaging scan of the brain without contrast",
        status: "Active",
        approvalStatus: "Approved",
        sacCode: "999315",
        hsnCode: "",
        taxTreatment: "Exempt",
        gstRate: 0,
        uom: "Per Scan",
        minQty: 1,
        defaultQty: 1,
        billingFrequency: "One-time",
        insuranceBillable: true,
        packageEligible: true,
        discountAllowed: true,
        maxDiscount: 10,
        requireClinicalJustification: true,
        complianceFlag: "None",
        doctorPrices: {},
        payerRates: {
          Standard: { amount: 6000, effectiveFrom: "2025-01-01", effectiveTo: "", approvedBy: "Dr. Amit Verma" },
          CGHS: { amount: 4000, effectiveFrom: "2025-01-01", effectiveTo: "", approvedBy: "Dr. Amit Verma" },
          TPA: { amount: 5600, effectiveFrom: "2025-01-01", effectiveTo: "", approvedBy: "Dr. Amit Verma" }
        }
      },

      // Additional Procedures (PRC005 - PRC008)
      {
        code: "PRC005",
        name: "Standard Electrocardiogram (ECG) Recording",
        alias: "ECG Test",
        category: "Procedures",
        subCategory: "Non-Invasive Diagnostic",
        departments: ["Cardiology"],
        description: "12-lead standard electrocardiogram mapping",
        status: "Active",
        approvalStatus: "Approved",
        sacCode: "999312",
        hsnCode: "",
        taxTreatment: "Exempt",
        gstRate: 0,
        uom: "Per Procedure",
        minQty: 1,
        defaultQty: 1,
        billingFrequency: "One-time",
        insuranceBillable: true,
        packageEligible: true,
        discountAllowed: true,
        maxDiscount: 10,
        requireClinicalJustification: false,
        complianceFlag: "None",
        doctorPrices: {},
        payerRates: {
          Standard: { amount: 300, effectiveFrom: "2025-01-01", effectiveTo: "", approvedBy: "Dr. Amit Verma" },
          CGHS: { amount: 150, effectiveFrom: "2025-01-01", effectiveTo: "", approvedBy: "Dr. Amit Verma" },
          TPA: { amount: 280, effectiveFrom: "2025-01-01", effectiveTo: "", approvedBy: "Dr. Amit Verma" }
        }
      },
      {
        code: "PRC006",
        name: "2D Echocardiography (Color Doppler)",
        alias: "2D Echo Doppler",
        category: "Procedures",
        subCategory: "Non-Invasive Diagnostic",
        departments: ["Cardiology"],
        description: "Transthoracic echocardiogram mapping",
        status: "Active",
        approvalStatus: "Approved",
        sacCode: "999312",
        hsnCode: "",
        taxTreatment: "Exempt",
        gstRate: 0,
        uom: "Per Procedure",
        minQty: 1,
        defaultQty: 1,
        billingFrequency: "One-time",
        insuranceBillable: true,
        packageEligible: true,
        discountAllowed: true,
        maxDiscount: 10,
        requireClinicalJustification: false,
        complianceFlag: "None",
        doctorPrices: {},
        payerRates: {
          Standard: { amount: 2200, effectiveFrom: "2025-01-01", effectiveTo: "", approvedBy: "Dr. Amit Verma" },
          CGHS: { amount: 1500, effectiveFrom: "2025-01-01", effectiveTo: "", approvedBy: "Dr. Amit Verma" },
          TPA: { amount: 2000, effectiveFrom: "2025-01-01", effectiveTo: "", approvedBy: "Dr. Amit Verma" }
        }
      },
      {
        code: "PRC007",
        name: "Upper Gastrointestinal Endoscopy (UGI)",
        alias: "UGI Endoscopy",
        category: "Procedures",
        subCategory: "Diagnostic Endoscopy",
        departments: ["Gastroenterology"],
        description: "Diagnostic upper GI tract endoscopic examination",
        status: "Active",
        approvalStatus: "Approved",
        sacCode: "999311",
        hsnCode: "",
        taxTreatment: "Exempt",
        gstRate: 0,
        uom: "Per Procedure",
        minQty: 1,
        defaultQty: 1,
        billingFrequency: "One-time",
        insuranceBillable: true,
        packageEligible: true,
        discountAllowed: true,
        maxDiscount: 5,
        requireClinicalJustification: false,
        complianceFlag: "None",
        doctorPrices: {
          "Senior Consultant": 4000,
          "Consultant": 3000
        },
        payerRates: {
          Standard: { amount: 3500, effectiveFrom: "2025-01-01", effectiveTo: "", approvedBy: "Dr. Amit Verma" },
          CGHS: { amount: 2500, effectiveFrom: "2025-01-01", effectiveTo: "", approvedBy: "Dr. Amit Verma" },
          TPA: { amount: 3200, effectiveFrom: "2025-01-01", effectiveTo: "", approvedBy: "Dr. Amit Verma" }
        }
      },
      {
        code: "PRC008",
        name: "Minor Wound Dressing & Suturing Fee",
        alias: "Minor Surgical Dressing",
        category: "Procedures",
        subCategory: "Outpatient Procedures",
        departments: ["Emergency Medicine", "General Surgery"],
        description: "Cleansing, suturing, and aseptic dressing of minor lacerations",
        status: "Active",
        approvalStatus: "Approved",
        sacCode: "999312",
        hsnCode: "",
        taxTreatment: "Exempt",
        gstRate: 0,
        uom: "Per Procedure",
        minQty: 1,
        defaultQty: 1,
        billingFrequency: "One-time",
        insuranceBillable: true,
        packageEligible: true,
        discountAllowed: true,
        maxDiscount: 10,
        requireClinicalJustification: false,
        complianceFlag: "None",
        doctorPrices: {},
        payerRates: {
          Standard: { amount: 500, effectiveFrom: "2025-01-01", effectiveTo: "", approvedBy: "Dr. Amit Verma" },
          CGHS: { amount: 300, effectiveFrom: "2025-01-01", effectiveTo: "", approvedBy: "Dr. Amit Verma" },
          TPA: { amount: 450, effectiveFrom: "2025-01-01", effectiveTo: "", approvedBy: "Dr. Amit Verma" }
        }
      },

      // Additional Consumables (CSM004 - CSM006)
      {
        code: "CSM004",
        name: "IV Cannula 20G / 22G (Vasofix)",
        alias: "IV Cannula",
        category: "Consumables",
        subCategory: "IV Infusion Supplies",
        departments: ["Operation Theatre", "Nursing Ward"],
        description: "Intravenous peripheral catheter with injection port",
        status: "Active",
        approvalStatus: "Approved",
        sacCode: "",
        hsnCode: "901839",
        taxTreatment: "Taxable",
        gstRate: 12,
        uom: "Per Piece",
        minQty: 1,
        defaultQty: 1,
        billingFrequency: "One-time",
        insuranceBillable: true,
        packageEligible: true,
        discountAllowed: false,
        maxDiscount: 0,
        requireClinicalJustification: false,
        complianceFlag: "None",
        doctorPrices: {},
        payerRates: {
          Standard: { amount: 150, effectiveFrom: "2025-01-01", effectiveTo: "", approvedBy: "Dr. Amit Verma" },
          CGHS: { amount: 100, effectiveFrom: "2025-01-01", effectiveTo: "", approvedBy: "Dr. Amit Verma" },
          TPA: { amount: 135, effectiveFrom: "2025-01-01", effectiveTo: "", approvedBy: "Dr. Amit Verma" }
        }
      },
      {
        code: "CSM005",
        name: "Disposable Syringe with Needle (5ml / 10ml)",
        alias: "Disposable Syringe",
        category: "Consumables",
        subCategory: "IV Infusion Supplies",
        departments: ["Operation Theatre", "Nursing Ward"],
        description: "Single use sterile syringe with detachable needle",
        status: "Active",
        approvalStatus: "Approved",
        sacCode: "",
        hsnCode: "901831",
        taxTreatment: "Taxable",
        gstRate: 12,
        uom: "Per Piece",
        minQty: 1,
        defaultQty: 1,
        billingFrequency: "One-time",
        insuranceBillable: true,
        packageEligible: true,
        discountAllowed: false,
        maxDiscount: 0,
        requireClinicalJustification: false,
        complianceFlag: "None",
        doctorPrices: {},
        payerRates: {
          Standard: { amount: 15, effectiveFrom: "2025-01-01", effectiveTo: "", approvedBy: "Dr. Amit Verma" },
          CGHS: { amount: 15, effectiveFrom: "2025-01-01", effectiveTo: "", approvedBy: "Dr. Amit Verma" },
          TPA: { amount: 15, effectiveFrom: "2025-01-01", effectiveTo: "", approvedBy: "Dr. Amit Verma" }
        }
      },
      {
        code: "CSM006",
        name: "Infusion IV Administration Set",
        alias: "IV Infusion Set",
        category: "Consumables",
        subCategory: "IV Infusion Supplies",
        departments: ["Operation Theatre", "Nursing Ward"],
        description: "Standard sterile gravity intravenous fluid infusion administration set",
        status: "Active",
        approvalStatus: "Approved",
        sacCode: "",
        hsnCode: "901839",
        taxTreatment: "Taxable",
        gstRate: 12,
        uom: "Per Set",
        minQty: 1,
        defaultQty: 1,
        billingFrequency: "One-time",
        insuranceBillable: true,
        packageEligible: true,
        discountAllowed: false,
        maxDiscount: 0,
        requireClinicalJustification: false,
        complianceFlag: "None",
        doctorPrices: {},
        payerRates: {
          Standard: { amount: 80, effectiveFrom: "2025-01-01", effectiveTo: "", approvedBy: "Dr. Amit Verma" },
          CGHS: { amount: 60, effectiveFrom: "2025-01-01", effectiveTo: "", approvedBy: "Dr. Amit Verma" },
          TPA: { amount: 75, effectiveFrom: "2025-01-01", effectiveTo: "", approvedBy: "Dr. Amit Verma" }
        }
      },

      // Additional Implants (IMP003 - IMP004)
      {
        code: "IMP003",
        name: "Dual Chamber Permanent Pacemaker (Premium)",
        alias: "Dual Chamber Pacemaker",
        category: "Implants",
        subCategory: "Cardiac Implants",
        departments: ["Cardiology"],
        description: "MRI conditional dual chamber permanent pacemaker system",
        status: "Active",
        approvalStatus: "Approved",
        sacCode: "",
        hsnCode: "902150",
        taxTreatment: "Taxable",
        gstRate: 5,
        uom: "Per Implant Set",
        minQty: 1,
        defaultQty: 1,
        billingFrequency: "One-time",
        insuranceBillable: true,
        packageEligible: false,
        discountAllowed: false,
        maxDiscount: 0,
        requireClinicalJustification: true,
        complianceFlag: "None",
        doctorPrices: {},
        payerRates: {
          Standard: { amount: 155000, effectiveFrom: "2025-01-01", effectiveTo: "", approvedBy: "Dr. Amit Verma" },
          CGHS: { amount: 125000, effectiveFrom: "2025-01-01", effectiveTo: "", approvedBy: "Dr. Amit Verma" },
          TPA: { amount: 145000, effectiveFrom: "2025-01-01", effectiveTo: "", approvedBy: "Dr. Amit Verma" }
        }
      },
      {
        code: "IMP004",
        name: "Monofocal Foldable Intraocular Lens (IOL)",
        alias: "IOL Eye Implant",
        category: "Implants",
        subCategory: "Ophthalmic Implants",
        departments: ["Ophthalmology"],
        description: "Foldable hydrophobic acrylic intraocular lens",
        status: "Active",
        approvalStatus: "Approved",
        sacCode: "",
        hsnCode: "902139",
        taxTreatment: "Taxable",
        gstRate: 5,
        uom: "Per Piece",
        minQty: 1,
        defaultQty: 1,
        billingFrequency: "One-time",
        insuranceBillable: true,
        packageEligible: true,
        discountAllowed: false,
        maxDiscount: 0,
        requireClinicalJustification: true,
        complianceFlag: "None",
        doctorPrices: {},
        payerRates: {
          Standard: { amount: 12000, effectiveFrom: "2025-01-01", effectiveTo: "", approvedBy: "Dr. Amit Verma" },
          CGHS: { amount: 9500, effectiveFrom: "2025-01-01", effectiveTo: "", approvedBy: "Dr. Amit Verma" },
          TPA: { amount: 11000, effectiveFrom: "2025-01-01", effectiveTo: "", approvedBy: "Dr. Amit Verma" }
        }
      },

      // Additional Pharmacy (PHA003 - PHA007)
      {
        code: "PHA003",
        name: "Inj. Paracetamol 1gm / 100ml IV Infusion",
        alias: "Inj Paracetamol IV",
        category: "Pharmacy",
        subCategory: "Analgesics",
        departments: ["Operation Theatre", "Nursing Ward", "Pharmacy"],
        description: "Intravenous paracetamol infusion for rapid pain / fever control",
        status: "Active",
        approvalStatus: "Approved",
        sacCode: "",
        hsnCode: "300490",
        taxTreatment: "Taxable",
        gstRate: 12,
        uom: "Per Bottle",
        minQty: 1,
        defaultQty: 1,
        billingFrequency: "One-time",
        insuranceBillable: true,
        packageEligible: true,
        discountAllowed: false,
        maxDiscount: 0,
        requireClinicalJustification: false,
        complianceFlag: "None",
        doctorPrices: {},
        payerRates: {
          Standard: { amount: 120, effectiveFrom: "2025-01-01", effectiveTo: "", approvedBy: "Dr. Amit Verma" },
          CGHS: { amount: 90, effectiveFrom: "2025-01-01", effectiveTo: "", approvedBy: "Dr. Amit Verma" },
          TPA: { amount: 110, effectiveFrom: "2025-01-01", effectiveTo: "", approvedBy: "Dr. Amit Verma" }
        }
      },
      {
        code: "PHA004",
        name: "Inj. Ceftriaxone 1gm Vial",
        alias: "Inj Ceftriaxone 1g",
        category: "Pharmacy",
        subCategory: "Antibiotics",
        departments: ["Operation Theatre", "Nursing Ward", "Pharmacy"],
        description: "Broad spectrum cephalosporin antibiotic injection",
        status: "Active",
        approvalStatus: "Approved",
        sacCode: "",
        hsnCode: "300420",
        taxTreatment: "Taxable",
        gstRate: 12,
        uom: "Per Vial",
        minQty: 1,
        defaultQty: 1,
        billingFrequency: "One-time",
        insuranceBillable: true,
        packageEligible: true,
        discountAllowed: false,
        maxDiscount: 0,
        requireClinicalJustification: false,
        complianceFlag: "None",
        doctorPrices: {},
        payerRates: {
          Standard: { amount: 140, effectiveFrom: "2025-01-01", effectiveTo: "", approvedBy: "Dr. Amit Verma" },
          CGHS: { amount: 100, effectiveFrom: "2025-01-01", effectiveTo: "", approvedBy: "Dr. Amit Verma" },
          TPA: { amount: 130, effectiveFrom: "2025-01-01", effectiveTo: "", approvedBy: "Dr. Amit Verma" }
        }
      },
      {
        code: "PHA005",
        name: "Inj. Pantoprazole 40mg Vial",
        alias: "Inj Pantocid 40mg",
        category: "Pharmacy",
        subCategory: "Anti-ulcerants",
        departments: ["Operation Theatre", "Nursing Ward", "Pharmacy"],
        description: "Proton pump inhibitor injection for hyperacidity prophylaxis",
        status: "Active",
        approvalStatus: "Approved",
        sacCode: "",
        hsnCode: "300490",
        taxTreatment: "Taxable",
        gstRate: 12,
        uom: "Per Vial",
        minQty: 1,
        defaultQty: 1,
        billingFrequency: "One-time",
        insuranceBillable: true,
        packageEligible: true,
        discountAllowed: false,
        maxDiscount: 0,
        requireClinicalJustification: false,
        complianceFlag: "None",
        doctorPrices: {},
        payerRates: {
          Standard: { amount: 80, effectiveFrom: "2025-01-01", effectiveTo: "", approvedBy: "Dr. Amit Verma" },
          CGHS: { amount: 60, effectiveFrom: "2025-01-01", effectiveTo: "", approvedBy: "Dr. Amit Verma" },
          TPA: { amount: 75, effectiveFrom: "2025-01-01", effectiveTo: "", approvedBy: "Dr. Amit Verma" }
        }
      },
      {
        code: "PHA006",
        name: "Tab. Clopidogrel 75mg (Box of 10)",
        alias: "Tab Clopidogrel 75mg",
        category: "Pharmacy",
        subCategory: "Cardiac Drugs",
        departments: ["Pharmacy"],
        description: "Antiplatelet medication to prevent blood clots",
        status: "Active",
        approvalStatus: "Approved",
        sacCode: "",
        hsnCode: "300490",
        taxTreatment: "Taxable",
        gstRate: 12,
        uom: "Per Strip/10",
        minQty: 1,
        defaultQty: 1,
        billingFrequency: "One-time",
        insuranceBillable: true,
        packageEligible: true,
        discountAllowed: false,
        maxDiscount: 0,
        requireClinicalJustification: false,
        complianceFlag: "None",
        doctorPrices: {},
        payerRates: {
          Standard: { amount: 150, effectiveFrom: "2025-01-01", effectiveTo: "", approvedBy: "Dr. Amit Verma" },
          CGHS: { amount: 110, effectiveFrom: "2025-01-01", effectiveTo: "", approvedBy: "Dr. Amit Verma" },
          TPA: { amount: 140, effectiveFrom: "2025-01-01", effectiveTo: "", approvedBy: "Dr. Amit Verma" }
        }
      },
      {
        code: "PHA007",
        name: "Inj. Heparin Sodium 25000 IU / 5ml Vial",
        alias: "Inj Heparin 25k",
        category: "Pharmacy",
        subCategory: "Anticoagulants",
        departments: ["Operation Theatre", "Nursing Ward", "Pharmacy"],
        description: "Standard intravenous / subcutaneous anticoagulant agent",
        status: "Active",
        approvalStatus: "Approved",
        sacCode: "",
        hsnCode: "300490",
        taxTreatment: "Taxable",
        gstRate: 12,
        uom: "Per Vial",
        minQty: 1,
        defaultQty: 1,
        billingFrequency: "One-time",
        insuranceBillable: true,
        packageEligible: true,
        discountAllowed: false,
        maxDiscount: 0,
        requireClinicalJustification: true,
        complianceFlag: "None",
        doctorPrices: {},
        payerRates: {
          Standard: { amount: 650, effectiveFrom: "2025-01-01", effectiveTo: "", approvedBy: "Dr. Amit Verma" },
          CGHS: { amount: 500, effectiveFrom: "2025-01-01", effectiveTo: "", approvedBy: "Dr. Amit Verma" },
          TPA: { amount: 600, effectiveFrom: "2025-01-01", effectiveTo: "", approvedBy: "Dr. Amit Verma" }
        }
      }
    ],
    approvalQueue: [
      {
        id: "REQ-201",
        type: "Price Update",
        chargeCode: "CON001",
        chargeName: "General Medicine Consultation Fee",
        requestedBy: "Sanjay Kumar (Billing Executive)",
        requestedDate: "2026-06-25 11:30 IST",
        effectiveDate: "2026-07-01",
        proposedRate: 550,
        payer: "Standard",
        reason: "Revision inline with consultant grade increments."
      }
    ]
  };
}

let activeChargeTab = "list"; // default view opens on the list view
let selectedChargeCode = null;

function formatINR(val) {
  return "₹" + Number(val).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
let currentCMUserRole = "CHARGE_MASTER_ADMIN";
let cmSearchQuery = "";
let cmCategoryFilter = "";
let cmStatusFilter = "";

window.activeModuleTab = 'chargeMaster'; // 'chargeMaster', 'packages', 'queue'

window.views.chargeMaster = function(container, subAnchor, params) {
  window.activeModuleTab = 'chargeMaster';
  activeChargeTab = 'list';
  renderUnifiedModule(container);
};

window.switchModuleTab = function(tab) {
  window.activeModuleTab = tab;
  renderUnifiedModule(document.getElementById('main-content'));
};

window.switchCMTab = function(tab) {
  activeChargeTab = tab;
  selectedChargeCode = null;
  renderUnifiedModule(document.getElementById('main-content'));
};

window.openNewPackageForm = function() {
  selectedPkgCode = null;
  window.activeModuleTab = 'packages';
  activePkgTab = 'editor';
  renderUnifiedModule(document.getElementById('main-content'));
};

function renderUnifiedModule(container) {
  if (!container) return;
  const approvalCount = (state.chargeMaster?.approvalQueue?.length || 0);

  container.innerHTML = `
    <!-- Top Shell styled with modern Tailwind light theme -->
    <div class="space-y-6 font-sans antialiased text-slate-800 bg-[#F8FAFC] min-h-screen p-4">
      
      <!-- Persistent Premium Module Header Bar -->
      <div class="flex flex-col md:flex-row md:items-center md:justify-between pb-6 border-b border-slate-200">
        <div>
          <div class="flex items-center gap-2">
            <span class="text-2xl">💰</span>
            <h1 class="text-2xl font-bold tracking-tight text-slate-900" style="font-family: 'Outfit', sans-serif;">
              Charge Master & Package Builder
            </h1>
          </div>
          <p class="text-sm text-slate-500 mt-1">
            Configure individual billable services and build flat-rate procedure packages
          </p>
        </div>

        <div class="mt-4 md:mt-0 flex items-center gap-3">
          <button class="bg-[#1B3A5C] text-white hover:bg-slate-800 px-4 py-2 rounded-xl text-xs font-bold shadow-sm transition" onclick="window.openCMNewItemModal()">
            ➕ Add New Item
          </button>
          <button class="bg-[#F59E0B] text-white hover:bg-amber-600 px-4 py-2 rounded-xl text-xs font-bold shadow-sm transition" onclick="window.openNewPackageForm()">
            ➕ Create New Package
          </button>
        </div>
      </div>

      <!-- Navigation Tabs (Persistent Top Bar) -->
      <div class="flex flex-wrap border-b border-slate-200 bg-white rounded-xl shadow-sm p-1 gap-1">
        <button class="px-5 py-3 rounded-lg text-sm font-medium transition-all ${window.activeModuleTab === 'chargeMaster' ? 'bg-[#1B3A5C] text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'}" onclick="window.switchModuleTab('chargeMaster')">
          💊 Charge Master
        </button>
        <button class="px-5 py-3 rounded-lg text-sm font-medium transition-all ${window.activeModuleTab === 'packages' ? 'bg-[#1B3A5C] text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'}" onclick="window.switchModuleTab('packages')">
          📦 Packages
        </button>
        <button class="px-5 py-3 rounded-lg text-sm font-medium transition-all ${window.activeModuleTab === 'queue' ? 'bg-[#1B3A5C] text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'}" onclick="window.switchModuleTab('queue')">
          ⏳ Approval Queue <span id="cm-queue-badge" class="ml-1 bg-amber-100 text-amber-800 text-[11px] font-bold px-1.5 py-0.5 rounded-full">${approvalCount}</span>
        </button>
      </div>

      <!-- Active Workspace Content -->
      <div id="unified-workspace" class="space-y-6">
        <!-- Rendered dynamically -->
      </div>
    </div>
  `;

  renderUnifiedTabContent(container);
}

function renderUnifiedTabContent(container) {
  const parent = container || document;
  const space = parent.querySelector('#unified-workspace') || document.getElementById('unified-workspace');
  if (!space) return;

  if (window.activeModuleTab === 'chargeMaster') {
    space.innerHTML = `
      <!-- Charge Master Sub-navigation -->
      <div class="flex items-center gap-1 border-b border-slate-200 bg-white rounded-xl shadow-sm p-1">
        <button class="px-4 py-2 rounded-lg text-xs font-semibold ${activeChargeTab === 'dashboard' ? 'bg-[#1B3A5C] text-white font-bold' : 'text-slate-600 hover:bg-slate-50'}" onclick="window.switchCMTab('dashboard')">
          🏠 Overview
        </button>
        <button class="px-4 py-2 rounded-lg text-xs font-semibold ${activeChargeTab === 'list' ? 'bg-[#1B3A5C] text-white font-bold' : 'text-slate-600 hover:bg-slate-50'}" onclick="window.switchCMTab('list')">
          📋 Services Registry
        </button>
      </div>
      <div id="cm-sub-workspace" class="space-y-6 mt-4"></div>
    `;
    const subSpace = space.querySelector('#cm-sub-workspace') || document.getElementById('cm-sub-workspace');
    if (activeChargeTab === "dashboard") {
      renderCMOverview(subSpace);
    } else if (activeChargeTab === "list") {
      renderCMList(subSpace);
    } else if (activeChargeTab === "editor") {
      renderCMForm(subSpace);
    } else if (activeChargeTab === "queue") {
      renderCMApprovalQueue(subSpace);
    } else {
      renderCMList(subSpace);
    }
  } else if (window.activeModuleTab === 'packages') {
    space.innerHTML = `
      <!-- Package Builder Sub-navigation -->
      <div class="flex flex-wrap items-center gap-1 border-b border-slate-200 bg-white rounded-xl shadow-sm p-1">
        <button class="px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${activePkgTab === 'dashboard' ? 'bg-[#1B3A5C] text-white shadow-sm font-bold' : 'text-slate-600 hover:bg-slate-50'}" onclick="window.switchPkgTab('dashboard')">
          🏠 Overview
        </button>
        <button class="px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${activePkgTab === 'registry' ? 'bg-[#1B3A5C] text-white shadow-sm font-bold' : 'text-slate-600 hover:bg-slate-50'}" onclick="window.switchPkgTab('registry')">
          📋 Package Templates
        </button>
        <button class="px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${activePkgTab === 'editor' ? 'bg-[#1B3A5C] text-white shadow-sm font-bold' : 'text-slate-600 hover:bg-slate-50'}" onclick="window.switchPkgTab('editor')">
          🛠️ Template Creator
        </button>
      </div>
      <div id="pkg-sub-workspace" class="space-y-6 mt-4"></div>
    `;
    if (typeof renderPkgTabContent === 'function') {
      renderPkgTabContent();
    }
  } else if (window.activeModuleTab === 'queue') {
    renderCMApprovalQueue(space);
  }
}

window.switchCMRole = function(role) {
  currentCMUserRole = role;
  renderUnifiedTabContent();
};

function renderCMTabContent() {
  renderUnifiedTabContent();
}

// ----------------------------------------------------
// TAB 1: OVERVIEW DASHBOARD
// ----------------------------------------------------
function renderCMOverview(space) {
  const activeItems = state.chargeMaster.items.filter(i => i.status === "Active").length;
  const suspendedItems = state.chargeMaster.items.filter(i => i.status === "Suspended").length;
  const missingPayerRates = state.chargeMaster.items.filter(i => !i.payerRates || !i.payerRates.CGHS || !i.payerRates.TPA).length;

  space.innerHTML = `
    <!-- Top Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-5 mb-6 text-left">
      <div class="bg-white border border-slate-200 rounded-xl p-5 flex items-center gap-4 shadow-sm">
        <div class="w-12 h-12 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl text-center">✅</div>
        <div>
          <div class="text-2xl font-bold text-slate-900">${activeItems}</div>
          <span class="text-xs font-medium text-slate-500 uppercase tracking-wider">Active Charge Items</span>
        </div>
      </div>

      <div class="bg-white border border-slate-200 rounded-xl p-5 flex items-center gap-4 shadow-sm">
        <div class="w-12 h-12 rounded-lg bg-red-50 text-red-600 flex items-center justify-center text-xl text-center">🚨</div>
        <div>
          <div class="text-2xl font-bold text-slate-900">${suspendedItems}</div>
          <span class="text-xs font-medium text-slate-500 uppercase tracking-wider">Suspended Charges</span>
        </div>
      </div>

      <div class="bg-white border border-slate-200 rounded-xl p-5 flex items-center gap-4 shadow-sm">
        <div class="w-12 h-12 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center text-xl text-center">⏳</div>
        <div>
          <div class="text-2xl font-bold text-slate-900">${state.chargeMaster.approvalQueue.length}</div>
          <span class="text-xs font-medium text-slate-500 uppercase tracking-wider">Awaiting Approvals</span>
        </div>
      </div>

      <div class="bg-white border border-slate-200 rounded-xl p-5 flex items-center gap-4 shadow-sm">
        <div class="w-12 h-12 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center text-xl text-center">🛡️</div>
        <div>
          <div class="text-2xl font-bold text-slate-900">${missingPayerRates}</div>
          <span class="text-xs font-medium text-slate-500 uppercase tracking-wider">Missing Payer Tariffs</span>
        </div>
      </div>
    </div>
  `;
}

// ----------------------------------------------------
// TAB 2: SERVICE REGISTRY LIST
// ----------------------------------------------------
function renderCMList(space) {
  try {
    const query = cmSearchQuery ? cmSearchQuery.toLowerCase().trim() : "";
    let filtered = state.chargeMaster.items;

    if (query) {
      filtered = filtered.filter(i => 
        (i.name && i.name.toLowerCase().includes(query)) || 
        (i.code && i.code.toLowerCase().includes(query)) ||
        (i.sacCode && i.sacCode.toLowerCase().includes(query)) ||
        (i.hsnCode && i.hsnCode.toLowerCase().includes(query))
      );
    }
    if (cmCategoryFilter) {
      filtered = filtered.filter(i => i.category === cmCategoryFilter);
    }
    if (cmStatusFilter) {
      filtered = filtered.filter(i => i.status === cmStatusFilter);
    }

    const categories = [...new Set(state.chargeMaster.items.map(i => i.category))];

    const generateRows = (items) => {
      if (items.length === 0) {
        return `
          <tr>
            <td colspan="7" class="px-6 py-10 text-center text-slate-400 italic bg-white">
              No charge items found matching the selected filters.
            </td>
          </tr>
        `;
      }
      return items.map(item => `
        <tr class="hover:bg-slate-50 transition-colors">
          <td class="px-6 py-3.5">
            <div class="font-bold text-slate-900 font-mono">${item.code}</div>
            <span class="text-[9px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-semibold uppercase">${item.category}</span>
          </td>
          <td class="px-6 py-3.5">
            <div class="font-bold text-slate-800 text-sm">${item.name}</div>
            <div class="text-[10px] text-slate-400">UoM: ${item.uom}</div>
          </td>
          <td class="px-6 py-3.5 text-slate-500">${item.departments ? item.departments.join(', ') : 'N/A'}</td>
          <td class="px-6 py-3.5 font-mono text-slate-600">${item.sacCode || item.hsnCode || 'N/A'}</td>
          <td class="px-6 py-3.5 text-right font-bold font-monospace text-slate-900">${formatINR(item.payerRates.Standard?.amount || 0)}</td>
          <td class="px-6 py-3.5"><span class="${getCMStatusBadgeClass(item.status)}">${item.status}</span></td>
          <td class="px-6 py-3.5 text-center">
            <div class="inline-flex gap-2">
              <button class="bg-[#1B3A5C] text-white hover:bg-slate-800 px-2.5 py-1.5 rounded text-[10px] font-semibold transition" onclick="window.editCMItem('${item.code}')">Edit</button>
              <button class="border border-slate-200 hover:bg-slate-50 text-slate-700 px-2.5 py-1.5 rounded text-[10px] font-semibold transition" onclick="window.triggerSuspend('${item.code}')">Freeze</button>
            </div>
          </td>
        </tr>
      `).join('');
    };

    const tableBody = document.getElementById('cm-table-body');
    if (tableBody) {
      tableBody.innerHTML = generateRows(filtered);
      return;
    }

    space.innerHTML = `
      <div class="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden text-left">
        <!-- Search Filters -->
        <div class="bg-slate-50 border-b border-slate-200 p-4 flex flex-col md:flex-row gap-3">
          <div class="flex-1">
            <input type="text" id="cm-search-input" class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs outline-none focus:border-slate-400" placeholder="Search by Charge code, service title, HSN/SAC..." value="${cmSearchQuery}" oninput="window.updateCMSearch(this.value)">
          </div>
          <div class="w-full md:w-56">
            <select id="cm-category-select" class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs outline-none focus:border-slate-400" onchange="window.updateCMCategoryFilter(this.value)">
              <option value="">-- All Categories --</option>
              ${categories.map(c => '<option value="' + c + '" ' + (cmCategoryFilter === c ? 'selected' : '') + '>' + c + '</option>').join('')}
            </select>
          </div>
          <div class="w-full md:w-56">
            <select id="cm-status-select" class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs outline-none focus:border-slate-400" onchange="window.updateCMStatusFilter(this.value)">
              <option value="">-- All Statuses --</option>
              <option value="Active" ${cmStatusFilter === 'Active' ? 'selected' : ''}>Active</option>
              <option value="Inactive" ${cmStatusFilter === 'Inactive' ? 'selected' : ''}>Inactive</option>
              <option value="Suspended" ${cmStatusFilter === 'Suspended' ? 'selected' : ''}>Suspended</option>
            </select>
          </div>
        </div>

        <!-- Charge Master Table -->
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-slate-200 text-xs text-slate-700">
            <thead class="bg-slate-50 text-slate-500 uppercase text-left tracking-wider font-semibold">
              <tr>
                <th class="px-6 py-3">Code / Category</th>
                <th class="px-6 py-3">Charge Name</th>
                <th class="px-6 py-3">Department Mapping</th>
                <th class="px-6 py-3">SAC/HSN Code</th>
                <th class="px-6 py-3 text-right">Standard Rate (MRP)</th>
                <th class="px-6 py-3">Status</th>
                <th class="px-6 py-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody id="cm-table-body" class="divide-y divide-slate-200 bg-white text-slate-850">
              ${generateRows(filtered)}
            </tbody>
          </table>
        </div>
      </div>
    `;
  } catch (err) {
    console.error("Error rendering Charge Master Registry:", err);
    space.innerHTML = `
      <div class="p-5 border border-red-200 bg-red-50 text-red-800 rounded-xl space-y-3 text-left">
        <h4 class="font-bold text-sm">❌ Error Loading Services Registry</h4>
        <p class="text-xs">A runtime exception occurred while attempting to build the registry grid:</p>
        <pre class="bg-white border rounded p-3 text-[10px] font-mono overflow-x-auto">${err.stack}</pre>
      </div>
    `;
  }
}


function getCMStatusBadgeClass(status) {
  switch (status) {
    case "Active": return "bg-emerald-50 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border border-emerald-100";
    case "Suspended": return "bg-red-50 text-red-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border border-red-100";
    case "Inactive": return "bg-slate-100 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border border-slate-200";
    default: return "bg-slate-100 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase";
  }
}

window.updateCMSearch = function(val) {
  cmSearchQuery = val;
  renderCMTabContent();
};

window.updateCMCategoryFilter = function(val) {
  cmCategoryFilter = val;
  renderCMTabContent();
};

window.updateCMStatusFilter = function(val) {
  cmStatusFilter = val;
  renderCMTabContent();
};

window.editCMItem = function(code) {
  window.openCMNewItemModal(code);
};

window.triggerSuspend = function(code) {
  if (currentCMUserRole !== "CHARGE_MASTER_ADMIN") {
    alert("❌ Access Denied: Only a Charge Master Admin can suspend active items.");
    return;
  }
  const reason = prompt("Enter documented justification for immediate suspension freeze:");
  if (!reason) return;

  const item = state.chargeMaster.items.find(i => i.code === code);
  if (item) {
    item.status = "Suspended";
    alert(`Item ${code} suspended successfully.`);
    renderCMTabContent();
  }
};

// ----------------------------------------------------
// POPUP DIALOG: CREATE / EDIT CHARGE MASTER FORM
// ----------------------------------------------------
window.openCMNewItemModal = function(code = null) {
  selectedChargeCode = code;
  let modal = document.getElementById('cm-modal-overlay');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'cm-modal-overlay';
    modal.className = "fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900 bg-opacity-50 backdrop-blur-sm p-4";
    document.body.appendChild(modal);
  }

  const item = (code && state.chargeMaster.items.find(i => i.code === code)) || {
    code: "", name: "", alias: "", category: "Procedures", subCategory: "", departments: [], sacCode: "999311", hsnCode: "",
    taxTreatment: "Exempt", gstRate: 0, uom: "Per Procedure", minQty: 1, defaultQty: 1, billingFrequency: "One-time",
    insuranceBillable: true, packageEligible: true, discountAllowed: true, maxDiscount: 10, requireClinicalJustification: false,
    complianceFlag: "None", payerRates: { Standard: { amount: 0 }, CGHS: { amount: 0 }, TPA: { amount: 0 } }, doctorPrices: {}
  };

  modal.innerHTML = `
    <div class="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-4xl max-h-[90vh] overflow-y-auto flex flex-col font-sans antialiased text-slate-800 text-left">
      
      <!-- Modal Header -->
      <div class="flex items-center justify-between px-6 py-4 border-b border-slate-200">
        <h2 class="text-lg font-bold text-slate-900" style="font-family: 'Outfit', sans-serif;">
          ${code ? '✏️ Edit Charge Master Item' : '➕ Add New Charge Master Item'}
        </h2>
        <button class="text-slate-400 hover:text-slate-700 text-lg font-bold font-mono" onclick="window.closeCMNewItemModal()">✕</button>
      </div>

      <!-- Modal Body -->
      <div class="p-6">
        <form id="cm-item-form" class="space-y-6" onsubmit="event.preventDefault(); window.saveCMItem();">
          
          <!-- Section A: Identity -->
          <div>
            <h3 class="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2 uppercase tracking-wider mb-4">Identity Fields</h3>
            <div class="grid grid-cols-1 md:grid-cols-4 gap-5">
              <div>
                <label class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Charge Code</label>
                <input type="text" id="cm-form-code" class="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 outline-none focus:border-slate-400" value="${item.code || ''}" ${item.code ? 'readonly' : ''} placeholder="e.g. CHG-008" required>
              </div>
              <div class="md:col-span-2">
                <label class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Charge Name</label>
                <input type="text" id="cm-form-name" class="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 outline-none focus:border-slate-400" value="${item.name || ''}" placeholder="e.g. Standard OPD Consultation" required>
              </div>
              <div>
                <label class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Alias / Bill Print Title</label>
                <input type="text" id="cm-form-alias" class="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 outline-none focus:border-slate-400" value="${item.alias || ''}" placeholder="e.g. Consultation OPD">
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-5 mt-4">
              <div>
                <label class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Category</label>
                <select id="cm-form-category" class="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 outline-none focus:border-slate-400">
                  <option value="Room Rent" ${item.category === 'Room Rent' ? 'selected' : ''}>Room Rent</option>
                  <option value="Consultation" ${item.category === 'Consultation' ? 'selected' : ''}>Consultation</option>
                  <option value="Procedures" ${item.category === 'Procedures' ? 'selected' : ''}>Procedures</option>
                  <option value="Laboratory" ${item.category === 'Laboratory' ? 'selected' : ''}>Laboratory</option>
                  <option value="Radiology" ${item.category === 'Radiology' ? 'selected' : ''}>Radiology</option>
                  <option value="Consumables" ${item.category === 'Consumables' ? 'selected' : ''}>Consumables</option>
                  <option value="Implants" ${item.category === 'Implants' ? 'selected' : ''}>Implants</option>
                  <option value="Pharmacy" ${item.category === 'Pharmacy' ? 'selected' : ''}>Pharmacy</option>
                  <option value="Registration" ${item.category === 'Registration' ? 'selected' : ''}>Registration</option>
                </select>
              </div>
              <div>
                <label class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Sub-Category</label>
                <input type="text" id="cm-form-subcategory" class="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 outline-none focus:border-slate-400" value="${item.subCategory || ''}" placeholder="e.g. Cardiology OPD">
              </div>
              <div>
                <label class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Departments (Comma-separated)</label>
                <input type="text" id="cm-form-departments" class="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 outline-none focus:border-slate-400" value="${item.departments ? item.departments.join(', ') : ''}" placeholder="e.g. General Medicine, Cardiology" required>
              </div>
            </div>
          </div>

          <!-- Section B: Standard Mappings -->
          <div>
            <h3 class="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2 uppercase tracking-wider mb-4">Standard Code Mappings</h3>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div>
                <label class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">PMJAY Package Code</label>
                <input type="text" id="cm-form-pmjay" class="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 outline-none focus:border-slate-400" value="${item.pmjayCode || ''}" placeholder="e.g. HBP0001">
              </div>
              <div>
                <label class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">CGHS Package Code</label>
                <input type="text" id="cm-form-cghs" class="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 outline-none focus:border-slate-400" value="${item.cghsCode || ''}" placeholder="e.g. CGHS-CONS-001">
              </div>
              <div>
                <label class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">SAC / HSN Code</label>
                <input type="text" id="cm-form-sac" class="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 outline-none focus:border-slate-400" value="${item.sacCode || item.hsnCode || ''}" placeholder="e.g. 999311">
              </div>
            </div>
          </div>

          <!-- Section C: Matrix Pricing -->
          <div>
            <h3 class="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2 uppercase tracking-wider mb-4">Multi-Payer Rate Matrix</h3>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div>
                <label class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Standard (MRP) Rate (₹)</label>
                <input type="number" id="cm-form-rate-std" class="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 text-right outline-none focus:border-slate-400" value="${item.payerRates.Standard?.amount || 0}" required>
              </div>
              <div>
                <label class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">CGHS Government Rate (₹)</label>
                <input type="number" id="cm-form-rate-cghs" class="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 text-right outline-none focus:border-slate-400" value="${item.payerRates.CGHS?.amount || 0}">
              </div>
              <div>
                <label class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">TPA Negotiated Rate (₹)</label>
                <input type="number" id="cm-form-rate-tpa" class="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 text-right outline-none focus:border-slate-400" value="${item.payerRates.TPA?.amount || 0}">
              </div>
            </div>
          </div>

          <!-- Section D: Doctor-Grade Pricing overrides -->
          <div>
            <h3 class="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2 uppercase tracking-wider mb-4">Doctor-Grade Pricing overrides</h3>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div>
                <label class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Senior Consultant (₹)</label>
                <input type="number" id="cm-form-tier-sr" class="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 text-right outline-none focus:border-slate-400" value="${item.doctorPrices["Senior Consultant"] || 0}">
              </div>
              <div>
                <label class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Consultant (₹)</label>
                <input type="number" id="cm-form-tier-regular" class="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 text-right outline-none focus:border-slate-400" value="${item.doctorPrices["Consultant"] || 0}">
              </div>
              <div>
                <label class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Visiting Consultant (₹)</label>
                <input type="number" id="cm-form-tier-visit" class="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 text-right outline-none focus:border-slate-400" value="${item.doctorPrices["Visiting Consultant"] || 0}">
              </div>
            </div>
          </div>

          <div class="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button type="button" class="border border-slate-200 hover:bg-slate-50 text-slate-700 px-5 py-2 rounded-lg text-xs font-semibold transition" onclick="window.closeCMNewItemModal()">Cancel</button>
            <button type="submit" class="bg-[#1B3A5C] text-white px-6 py-2 rounded-lg text-xs font-semibold shadow-sm transition">Submit for Review Approval</button>
          </div>

        </form>
      </div>

    </div>
  `;
};

window.closeCMNewItemModal = function() {
  const modal = document.getElementById('cm-modal-overlay');
  if (modal) modal.remove();
  selectedChargeCode = null;
};

window.saveCMItem = function() {
  if (currentCMUserRole === "READ_ONLY") {
    alert("❌ Access Denied: Read-only accounts cannot submit charge revisions.");
    return;
  }

  const code = document.getElementById("cm-form-code").value;
  const name = document.getElementById("cm-form-name").value;
  const category = document.getElementById("cm-form-category").value;
  const stdRate = parseFloat(document.getElementById("cm-form-rate-std").value);

  // Check unique constraints
  const existing = state.chargeMaster.items.find(i => i.code === code);
  if (existing && !selectedChargeCode) {
    alert(`❌ Input Error: Charge code ${code} is already registered.`);
    return;
  }

  const payload = {
    code: code,
    name: name,
    alias: document.getElementById("cm-form-alias").value,
    category: category,
    subCategory: document.getElementById("cm-form-subcategory").value,
    departments: document.getElementById("cm-form-departments").value.split(',').map(s => s.trim()),
    status: "Active",
    approvalStatus: "Approved", // Auto-approved in sandbox
    sacCode: document.getElementById("cm-form-sac").value,
    hsnCode: "",
    taxTreatment: "Exempt",
    gstRate: 0,
    uom: "Per Procedure",
    minQty: 1,
    defaultQty: 1,
    billingFrequency: "One-time",
    insuranceBillable: true,
    packageEligible: true,
    discountAllowed: true,
    maxDiscount: 10,
    doctorPrices: {
      "Senior Consultant": parseFloat(document.getElementById("cm-form-tier-sr").value) || 0,
      "Consultant": parseFloat(document.getElementById("cm-form-tier-regular").value) || 0,
      "Visiting Consultant": parseFloat(document.getElementById("cm-form-tier-visit").value) || 0
    },
    payerRates: {
      "Standard": { amount: stdRate, effectiveFrom: "2025-01-01", effectiveTo: "", approvedBy: "Dr. Amit Verma" },
      "CGHS": { amount: parseFloat(document.getElementById("cm-form-rate-cghs").value) || 0, effectiveFrom: "2025-01-01", effectiveTo: "", approvedBy: "Dr. Amit Verma" },
      "TPA": { amount: parseFloat(document.getElementById("cm-form-rate-tpa").value) || 0, effectiveFrom: "2025-01-01", effectiveTo: "", approvedBy: "Dr. Amit Verma" }
    },
    rateHistory: [],
    auditHistory: []
  };

  if (selectedChargeCode) {
    const idx = state.chargeMaster.items.findIndex(i => i.code === selectedChargeCode);
    state.chargeMaster.items[idx] = payload;
    alert(`Charge Item ${code} updated successfully.`);
  } else {
    state.chargeMaster.items.push(payload);
    alert(`New Charge Item ${code} added successfully.`);
  }

  window.closeCMNewItemModal();
  renderCMTabContent();
};

// ----------------------------------------------------
// TAB 5: APPROVAL QUEUE
// ----------------------------------------------------
function renderCMApprovalQueue(space) {
  const queue = state.chargeMaster.approvalQueue;

  if (queue.length === 0) {
    space.innerHTML = `
      <div class="text-center py-10 space-y-4 text-left">
        <span class="text-4xl text-center block">✅</span>
        <h4 class="text-sm font-bold text-slate-900 text-center">Approval queue is clear</h4>
        <p class="text-xs text-slate-550 text-center">All price changes or new items have been audited and active.</p>
      </div>
    `;
    return;
  }

  space.innerHTML = `
    <div class="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden text-left">
      <div class="bg-slate-50 border-b border-slate-200 px-5 py-4">
        <h2 class="text-sm font-bold text-slate-800 uppercase tracking-wider">⏳ Pending Price Adjustments & Approvals</h2>
      </div>
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-slate-200 text-xs text-slate-700">
          <thead class="bg-slate-50 text-slate-400 uppercase tracking-wider text-left font-semibold">
            <tr>
              <th class="px-6 py-3">Request ID</th>
              <th class="px-6 py-3">Charge Code & Name</th>
              <th class="px-6 py-3">Proposed Rate</th>
              <th class="px-6 py-3">Requested By</th>
              <th class="px-6 py-3">Effective Date</th>
              <th class="px-6 py-3">Reason</th>
              <th class="px-6 py-3 text-center">Action</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200 bg-white">
            ${queue.map(req => `
              <tr>
                <td class="px-6 py-3.5 font-bold font-mono">${req.id}</td>
                <td class="px-6 py-3.5">
                  <div class="font-bold text-slate-800">${req.chargeName}</div>
                  <span class="font-mono text-slate-400">${req.chargeCode}</span>
                </td>
                <td class="px-6 py-3.5 font-bold font-monospace text-emerald-600">${formatINR(req.proposedRate)}</td>
                <td class="px-6 py-3.5">${req.requestedBy}</td>
                <td class="px-6 py-3.5 font-mono">${req.effectiveDate}</td>
                <td class="px-6 py-3.5 text-slate-550">${req.reason}</td>
                <td class="px-6 py-3.5 text-center">
                  <div class="inline-flex gap-2">
                    <button class="bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1.5 rounded text-[10px] font-semibold transition" onclick="window.approveCMRequest('${req.id}')">Approve</button>
                    <button class="border border-red-200 hover:bg-red-50 text-red-600 px-2.5 py-1.5 rounded text-[10px] font-semibold transition" onclick="window.rejectCMRequest('${req.id}')">Reject</button>
                  </div>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

window.approveCMRequest = function(requestId) {
  if (currentCMUserRole !== "CHARGE_MASTER_ADMIN") {
    alert("❌ Access Denied: Only a Charge Master Admin can approve price adjustments.");
    return;
  }

  const req = state.chargeMaster.approvalQueue.find(r => r.id === requestId);
  if (req) {
    const item = state.chargeMaster.items.find(i => i.code === req.chargeCode);
    if (item) {
      item.payerRates[req.payer] = {
        amount: req.proposedRate,
        effectiveFrom: req.effectiveDate,
        effectiveTo: "",
        approvedBy: "System Admin"
      };

      state.chargeMaster.approvalQueue = state.chargeMaster.approvalQueue.filter(r => r.id !== requestId);
      alert(`Approval verified. Price override for ${item.code} is now live.`);
      renderCMTabContent();
    }
  }
};

window.rejectCMRequest = function(requestId) {
  if (currentCMUserRole !== "CHARGE_MASTER_ADMIN") {
    alert("❌ Access Denied: Only a Charge Master Admin can reject price adjustments.");
    return;
  }

  const reason = prompt("Enter mandatory rejection reason details:");
  if (!reason) return;

  state.chargeMaster.approvalQueue = state.chargeMaster.approvalQueue.filter(r => r.id !== requestId);
  alert("Rejection logged. Action returned to requester as draft.");
  renderCMTabContent();
};
